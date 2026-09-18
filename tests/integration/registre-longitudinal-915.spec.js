import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #915, LOT 2 (18 septembre 2026) — INSCRIRE UN·E ÉLÈVE AU REGISTRE LONGITUDINAL, SUR LE VRAI ÉCRAN.
//
// Labo › Suivi longitudinal, 768 px, trimestre ACTIF archivé (le pire cas : la garde CSS du mode archive ferme les
// champs et les boutons d'écriture ; le registre n'est pas une donnée du trimestre, la capture doit rester possible).
// Ce banc juge : la recherche par le vrai dispatcher (data-on-input), le choix et l'inscription par el.click()
// (aucun page.click, budget du runner), le stock des DEUX trimestres identique octet pour octet après la capture,
// un DA dans deux trimestres = un élève, deux dossiers ; cibles ≥ 44 px ; « Refaire la copie » au second passage (#917).

const TA = 't915a'; // archivé, ACTIF
const TB = 't915b'; // non archivé
const DA1 = '9150001';
const DA2 = '9150002';

async function monter(page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function');
    await page.evaluate(({ TA, TB, DA1, DA2 }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-915';
        window.db.setSync('trimestres', [
            { id: TA, nom: 'Automne 2024', annee: 2024, session: 'A', actif: true, archive: true },
            { id: TB, nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false, archive: false }
        ]);
        window.db.setSync('cours', [{ id: coursId, codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }]);
        window.db.setSync(TA + '_groupesCours', [{ id: 'GC915A', trimestreId: TA, coursId, groupeNum: '00001', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(TA + '_groupeEtudiants', [
            { da: DA1, nom: 'Gagnon', prenom: 'Léa', groupe: '00001', coursId, groupeCoursId: 'GC915A', statut: 'actif' },
            { da: DA2, nom: 'Roy', prenom: 'Max', groupe: '00001', coursId, groupeCoursId: 'GC915A' }
        ]);
        window.db.setSync(TA + '_evaluationsSauvegardees', [
            { id: 'EV1', etudiantDA: DA1, coursId, productionId: 'P1', grilleId: 'G1', criteres: [{ id: 'CR1', niveau: 'M' }], dateEvaluation: '2024-10-01T12:00:00.000Z' },
            { id: 'EV2', etudiantDA: DA2, coursId, productionId: 'P1', grilleId: 'G1', criteres: [] }
        ]);
        window.db.setSync(TA + '_grillesTemplates', [{ id: 'G1', nom: 'SRPNF × IDME', criteres: [{ id: 'CR1', nom: 'Structure' }] }]);
        window.db.setSync(TA + '_presences', [{ date: '2024-08-26', da: DA1, coursId, statut: 'present', heures: 2 }, { date: '2024-08-26', da: DA2, coursId, statut: 'absent', heures: 0 }]);
        window.db.setSync(TA + '_indicesCP', { [DA1]: { actuel: { C: 1, P: 0.8, details: { noteConstructible: true } }, historique: [] } });
        window.db.setSync(TB + '_groupesCours', [{ id: 'GC915B', trimestreId: TB, coursId, groupeNum: '00002', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(TB + '_groupeEtudiants', [{ da: DA1, nom: 'Gagnon', prenom: 'Léa', groupe: '00002', coursId, groupeCoursId: 'GC915B' }]);
        window.db.setSync(TB + '_evaluationsSauvegardees', []);
        window.db.setSync('trimestreActif', TA);
        window.db.setSync('infoCours', { id: coursId, codeCours: '601-101-MQ', groupe: '00001', _groupeCoursId: 'GC915A' });
        window.db.setSync('groupeCoursActif', { id: 'GC915A', trimestreId: TA });
    }, { TA, TB, DA1, DA2 });
    // Le mode archive se pose au démarrage : on recharge sur le stock semé (une seule fois, sans `clear`).
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function'
        && typeof window.initialiserRegistreLongitudinal === 'function');
    // Seule attente fixe du banc, justifiée : le démarrage réécrit les indices du trimestre actif de façon asynchrone
    // (mesuré : P semé 0,8, relu 0), sans aucun signal DOM à attendre ; l'empreinte « avant » se prend après ce délai.
    await page.waitForTimeout(500);
    return erreurs;
}

const stockDesTrimestres = (page) => page.evaluate(({ TA, TB }) => {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(TA + '_') || k.startsWith(TB + '_')) o[k] = localStorage.getItem(k); }
    return o;
}, { TA, TB });

async function ouvrirLeSousOnglet(page) {
    await page.evaluate(() => { window.afficherSection('labo'); window.afficherSousSection('labo-longitudinal'); });
    await page.waitForFunction(() => { const c = document.getElementById('rl-recherche'); return !!c && c.offsetParent !== null; }, null, { timeout: 10000 });
}

/** Tape dans le champ par le VRAI dispatcher (data-on-input, délégué sur document dans main.js). */
async function chercher(page, texte) {
    await page.evaluate((texte) => {
        const champ = document.getElementById('rl-recherche');
        champ.value = texte;
        champ.dispatchEvent(new Event('input', { bubbles: true }));
    }, texte);
}

const cliquer = (page, selecteur) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('absent : ' + s); el.click(); }, selecteur);

test.describe('#915 lot 2 — Suivi longitudinal, 768 px, trimestre actif archivé', () => {
    test('R1 · chercher, choisir, inscrire : deux dossiers pour un DA dans deux trimestres, et le stock des trimestres identique octet pour octet', async ({ page }) => {
        const erreurs = await monter(page);
        expect(await page.evaluate(() => document.body.classList.contains('mode-archive'))).toBe(true);
        await ouvrirLeSousOnglet(page);
        const avant = await stockDesTrimestres(page);
        expect(Object.keys(avant).length).toBeGreaterThan(5);

        // Le champ reste OUVERT sous la garde CSS du mode archive (type=search).
        const champ = await page.evaluate(() => { const c = document.getElementById('rl-recherche'); const cs = getComputedStyle(c); return { type: c.type, pointer: cs.pointerEvents, disabled: c.disabled, opacite: cs.opacity, hauteur: c.getBoundingClientRect().height }; });
        expect(champ.type).toBe('search');
        expect(champ.pointer).not.toBe('none');
        expect(champ.disabled).toBe(false);
        expect(Math.round(champ.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)

        await chercher(page, 'gag');
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-resultat').length === 1);
        const resultat = await page.evaluate(() => { const b = document.querySelector('#rl-resultats .rl-resultat-bouton'); return { texte: b.textContent, hauteur: b.getBoundingClientRect().height, da: b.dataset.da }; });
        expect(resultat.da).toBe(DA1);
        expect(resultat.texte).toContain('Gagnon, Léa');
        expect(resultat.texte).toContain('Automne 2024');
        expect(resultat.texte).toContain('Hiver 2026');
        expect(Math.round(resultat.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)

        await cliquer(page, '#rl-resultats .rl-resultat-bouton');
        await page.waitForFunction(() => !!document.getElementById('rl-inscrire'));
        const bouton = await page.evaluate(() => { const b = document.getElementById('rl-inscrire'); const cs = getComputedStyle(b); return { texte: b.textContent, hauteur: b.getBoundingClientRect().height, pointer: cs.pointerEvents, disabled: b.disabled, confirm: b.getAttribute('data-confirm') }; });
        expect(bouton.texte).toBe('Inscrire au registre');
        expect(Math.round(bouton.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)
        expect(bouton.pointer).not.toBe('none');
        expect(bouton.disabled).toBe(false);
        expect(bouton.confirm).toBeNull();

        // Ce que le stock porte JUSTE AVANT la capture (le démarrage de l'app recalcule les indices du trimestre actif,
        // même archivé — mesuré ici : P semé 0.8, relu 0 ; code étranger, hors lot) : la capture doit le copier tel quel.
        const cpAuStock = await page.evaluate(({ TA, DA1 }) => window.db.getSync(TA + '_indicesCP', {})[DA1] || null, { TA, DA1 });
        await cliquer(page, '#rl-inscrire');
        await page.waitForFunction(() => document.querySelectorAll('#rl-zone-inscrits .rl-eleve').length === 1, null, { timeout: 10000 });
        const registre = await page.evaluate(() => window.db.getSync('registreLongitudinal', null));
        expect(registre.format).toBe('registre-longitudinal');
        expect(Object.keys(registre.eleves)).toEqual([DA1]);
        const dossiers = registre.eleves[DA1].dossiers;
        expect(dossiers.map((d) => d.trimestre).sort()).toEqual([TA, TB].sort());
        const dA = dossiers.find((d) => d.trimestre === TA);
        expect(dA.evaluations.map((e) => e.id)).toEqual(['EV1']);
        expect(dA.presences).toHaveLength(1);
        expect(dA.indices.cp).toEqual(cpAuStock);
        expect(dA.grillesIds).toEqual(['G1']);
        expect(registre.modeles.grilles[TA + ':G1'].criteres).toHaveLength(1);
        expect(JSON.stringify(dossiers)).not.toContain(DA2);

        expect(await stockDesTrimestres(page)).toEqual(avant);

        const ligne = await page.evaluate(() => document.querySelector('#rl-zone-inscrits .rl-eleve').textContent);
        expect(ligne).toContain('Gagnon, Léa');
        expect(ligne).toContain('Automne 2024');
        expect(ligne).toContain('Hiver 2026');
        expect(ligne).toMatch(/Copie du \d{4}-\d{2}-\d{2}/);
        const resume = await page.evaluate(() => document.querySelector('#rl-choix .rl-resume').textContent);
        expect(resume).toMatch(/^1 évaluation·s · 1 séance·s · 1 grille·s : SRPNF × IDME · 2 dossier·s, \d+ Ko — Copie du/);

        // Second passage (#917, retour de Grégoire du 18 sept.) : le bouton dit le geste, quitte le style principal,
        // garde sa cible de 44 px, et le dialogue nomme l'élève et ce qui ne bouge pas.
        const bouton2 = await page.evaluate(() => { const b = document.getElementById('rl-inscrire'); return { texte: b.textContent, confirm: b.getAttribute('data-confirm'), secondaire: b.classList.contains('btn-secondaire'), principal: b.classList.contains('btn-principal'), hauteur: b.getBoundingClientRect().height }; });
        expect(bouton2.texte).toBe('Refaire la copie');
        expect(bouton2.secondaire).toBe(true);
        expect(bouton2.principal).toBe(false);
        expect(Math.round(bouton2.hauteur)).toBeGreaterThanOrEqual(44); // arrondi : WebKit rend 43,99997 px pour min-height: 44px (instabilité du verdict du 18 sept.)
        expect(bouton2.confirm).toContain('Gagnon, Léa');
        expect(bouton2.confirm).toContain('remplacée');
        expect(bouton2.confirm).toContain('Tes trimestres ne sont pas modifiés');

        expect(erreurs).toEqual([]);
    });

    test('R2 · un nom qui n\'existe pas : la liste le dit ; rien n\'est écrit', async ({ page }) => {
        const erreurs = await monter(page);
        await ouvrirLeSousOnglet(page);
        await chercher(page, 'zzz');
        await page.waitForFunction(() => document.querySelectorAll('#rl-resultats .rl-vide').length === 1);
        expect(await page.evaluate(() => document.querySelector('#rl-resultats .rl-vide').textContent)).toBe('Aucun·e élève ne porte ce nom.');
        expect(await page.evaluate(() => window.db.getSync('registreLongitudinal', null))).toBeNull();
        expect(erreurs).toEqual([]);
    });
});
