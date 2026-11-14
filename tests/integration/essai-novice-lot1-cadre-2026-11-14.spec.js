import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ESSAI NOVICE DU 14 NOV. 2026, LOT 1 — TROIS FORMULAIRES DU CADRE, AU NAVIGATEUR
//
// Ce que Grégoire a vécu en fenêtre privée, et ce qui est décidé :
//   (a) le nom du trimestre se crée seul de la session et de l'année (« Hiver 2031 »), il ne se
//       saisit pas ; un trimestre déjà enregistré garde le nom qu'il porte (stock intact) ;
//   (b) les heures d'un cours : (théorie + labo) × 15, même dans un trimestre de sept semaines ;
//   (c) le champ « pér. » d'une séance se propose d'après le début et la fin, suit les heures tant
//       qu'on n'y a pas tapé, et le résumé suit.
// Les gestes passent par de VRAIS événements (`input`, `change`) : c'est le dispatcher de main.js
// qu'on éprouve, pas seulement les fonctions (Vitest les couvre). Noms fictifs.
// ═══════════════════════════════════════════════════════════════════════════════════════════

async function ouvrirCadre(page) {
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await attendreRepos(page);
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await attendreRepos(page);
}

/** Pose une valeur et émet les événements qu'un vrai geste émet. */
async function geste(page, selecteur, valeur, evenements = ['input', 'change']) {
    const n = await page.evaluate(({ selecteur, valeur, evenements }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        el.value = valeur;
        for (const e of evenements) el.dispatchEvent(new Event(e, { bubbles: true }));
        return 1;
    }, { selecteur, valeur, evenements });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
    await attendreRepos(page);
}

test('(a) le nom du trimestre se crée seul, ne se saisit pas, et le stock garde le sien', async ({ page }) => {
    test.setTimeout(120000);
    const avertissements = [];
    page.on('console', (m) => { if (m.type() === 'warning' && /data-on-/.test(m.text())) avertissements.push(m.text()); });
    await ouvrirCadre(page);
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await attendreRepos(page);

    // L'ordre à l'écran : Session, Année, puis le nom à droite ; le nom se lit seulement, sans astérisque.
    const boites = await page.evaluate(() => ['v2-sessionTrimestre', 'v2-anneeTrimestre', 'v2-nomTrimestre'].map((id) => {
        const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left, y: r.top };
    }));
    expect(boites[0].x).toBeLessThan(boites[1].x);
    expect(boites[1].x).toBeLessThan(boites[2].x);
    await expect(page.locator('#v2-nomTrimestre')).not.toBeEditable();
    expect(await page.evaluate(() => document.querySelector('label[for="v2-nomTrimestre"]').textContent.trim())).toBe('Nom du trimestre');

    // STOCK : le trimestre de la démonstration montre le nom qu'il porte, et rien n'a été écrit.
    const actif = await page.evaluate(() => (db.getSync('trimestres', []) || []).find((t) => t.actif));
    expect(await page.inputValue('#v2-nomTrimestre')).toBe(actif.nom);

    // Création : la session, puis l'année à la frappe ; le nom suit, sans rien écrire.
    const registreAvant = await page.evaluate(() => JSON.stringify(db.getSync('trimestres', [])));
    await page.evaluate(() => document.querySelector('[data-action="ouvrirCreationTrimestreV2"]').click());
    await attendreRepos(page);
    expect(await page.inputValue('#v2-nomTrimestre')).toBe('');
    await geste(page, '#v2-sessionTrimestre', 'hiver', ['change']);
    await geste(page, '#v2-anneeTrimestre', '203', ['input']);
    expect(await page.inputValue('#v2-nomTrimestre'), 'année incomplète : pas de nom').toBe('');
    await geste(page, '#v2-anneeTrimestre', '2031', ['input']);
    expect(await page.inputValue('#v2-nomTrimestre'), 'le nom paraît à la frappe de l\'année').toBe('Hiver 2031');
    await geste(page, '#v2-sessionTrimestre', 'ete', ['change']);
    expect(await page.inputValue('#v2-nomTrimestre')).toBe('Été 2031');
    expect(await page.evaluate(() => JSON.stringify(db.getSync('trimestres', []))), 'rien d\'écrit avant « Créer le trimestre »').toBe(registreAvant);

    await geste(page, '#v2-debutTrimestre', '2031-05-26', ['change']);
    await geste(page, '#v2-finCours', '2031-07-11', ['change']);
    await geste(page, '#v2-finTrimestre', '2031-07-18', ['change']);
    await page.evaluate(() => document.getElementById('v2-btnCreerTrimestre').click());
    await attendreRepos(page);
    const registre = await page.evaluate(() => db.getSync('trimestres', []));
    expect(registre.find((t) => t.actif)).toMatchObject({ id: 'e2031', nom: 'Été 2031', session: 'E', annee: 2031 });
    // STOCK : le trimestre qui existait n'a pas été renommé.
    expect(registre.find((t) => t.id === actif.id).nom).toBe(actif.nom);
    expect(avertissements, 'handler introuvable : ' + avertissements.join(' | ')).toEqual([]);
});

test('(c) un nouvel horaire : les périodes se proposent, suivent les heures, et cèdent à un chiffre tapé', async ({ page }) => {
    test.setTimeout(120000);
    const avertissements = [];
    page.on('console', (m) => { if (m.type() === 'warning' && /data-on-/.test(m.text())) avertissements.push(m.text()); });
    await ouvrirCadre(page);
    await page.evaluate(async () => {
        await window.nouveauHoraireV2();
        const nb = document.getElementById('v2-hor-nbSeances');
        nb.value = '2';
        nb.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await attendreRepos(page);
    const resume = () => page.evaluate(() => document.getElementById('v2-hor-formatResume').textContent);
    const avant = await page.evaluate(() => JSON.stringify(db.getSync(cle('horaires'), [])));

    expect(await page.inputValue('#v2-hor-seance-0-periodes'), '8 h à 10 h : 2 proposées').toBe('2');
    expect(await resume()).toBe('2 séances · 4 périodes/semaine');

    await geste(page, '#v2-hor-seance-0-fin', '09:50', ['change']);
    expect(await page.inputValue('#v2-hor-seance-0-periodes'), '8 h à 9 h 50 : 2').toBe('2');
    await geste(page, '#v2-hor-seance-0-fin', '12:00', ['change']);
    expect(await page.inputValue('#v2-hor-seance-0-periodes'), '8 h à 12 h : 4').toBe('4');
    expect(await resume(), 'le résumé suit').toBe('2 séances · 6 périodes/semaine');
    await geste(page, '#v2-hor-seance-0-debut', '09:00', ['change']);
    expect(await page.inputValue('#v2-hor-seance-0-periodes'), '9 h à 12 h : 3').toBe('3');

    // Un chiffre tapé fait foi : les heures ne l'écrasent plus.
    await geste(page, '#v2-hor-seance-1-periodes', '3', ['input']);
    await geste(page, '#v2-hor-seance-1-fin', '12:00', ['change']);
    expect(await page.inputValue('#v2-hor-seance-1-periodes')).toBe('3');
    expect(await resume()).toBe('2 séances · 6 périodes/semaine');

    expect(await page.evaluate(() => JSON.stringify(db.getSync(cle('horaires'), []))), 'création : rien d\'écrit avant « Créer l\'horaire »').toBe(avant);
    expect(avertissements, 'handler introuvable : ' + avertissements.join(' | ')).toEqual([]);
});

test('(c) STOCK : un horaire enregistré garde son nombre de périodes quand on change ses heures', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    const h = await page.evaluate(() => {
        const horaire = (db.getSync(cle('horaires'), []) || [])[0];
        window.changerHoraireSelectionneV2(horaire.id);
        return { id: horaire.id, periodes: document.getElementById('v2-hor-seance-0-periodes').value, fin: document.getElementById('v2-hor-seance-0-fin').value };
    });
    expect(Number(h.periodes), 'la démonstration a un horaire avec ses périodes').toBeGreaterThan(0);
    const [hh, mm] = h.fin.split(':').map(Number);
    const finPlusTard = String(hh + 2).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    await geste(page, '#v2-hor-seance-0-fin', finPlusTard, ['change']);
    expect(await page.inputValue('#v2-hor-seance-0-periodes'), 'les périodes du stock ne se recalculent pas').toBe(h.periodes);
    const enBase = await page.evaluate((id) => (db.getSync(cle('horaires'), []) || []).find((x) => x.id === id).seances[0], h.id);
    expect(enBase.heureFin).toBe(finPlusTard);
    expect(String(enBase.nombrePeriodes)).toBe(h.periodes);
});
