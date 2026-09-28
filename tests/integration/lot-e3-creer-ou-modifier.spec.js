import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LOT E3 DE L'ENREGISTREMENT — CRÉER OU MODIFIER : PRODUCTIONS, INTERVENTIONS, VOLET
// CONFIDENTIEL, RÉGLAGES (D3, D0 ; 28 sept. 2026)
//
// Décision de Grégoire (D3) : « Créer quelque chose de neuf : un bouton qui nomme le geste. Tant
// qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit. Modifier ce qui existe : tout
// s'enregistre tout seul, champ par champ. « Annuler » devient « Fermer ». »
//
// Ce banc joue le vrai index.html depuis la démonstration et lit la BASE, pas l'écran.
// Productions :
//   (P-a) une production évaluée : un champ s'écrit sans bouton, le témoin le dit ; changer sa
//         grille n'écrit aucune évaluation (empreinte), et la cartouche de l'ancienne grille part ;
//   (P-b) une nouvelle production n'existe pas avant « Créer la production » ; « Fermer » pose la
//         question ; « Rester » ne perd rien ;
//   (P-c) un échec d'écriture : « Non enregistré – Modifier la production : … », sans succès ;
//   (P-d) un nom vidé : « Non enregistré – Modifier la production : le nom … », rien d'écrit.
//
// ⚠ Les productions de la démonstration sont en lecture seule (matériel Labo Codex) : le banc
// retire cette marque sur UNE production évaluée, dans le stockage propre à l'essai.
// Noms fictifs seulement. Stockage propre à chaque essai (contexte Playwright neuf).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => { window.__toasts = [];
        new MutationObserver((ms) => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.innerText.replace(/\s+/g, ' ').trim());
        }))).observe(document.body, { childList: true });
    });
}

async function changer(page, selecteur, valeur) {
    const n = await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = valeur; else el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true })); return 1;
    }, { selecteur, valeur });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'élément introuvable : ' + selecteur).toBe(1);
    await pause(page, 700);
}

const temoinSucces = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
    return !!el && el.classList.contains('visible');
});
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});
const visible = (page, s) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.classList.contains('u-hide'); }, s);
const questionOuverte = (page) => page.evaluate(() => document.getElementById('ui-dialogue-titre')?.textContent || '');
async function repondre(page, texte) {
    const n = await page.evaluate((texte) => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => x.textContent.trim() === texte);
        if (!b) return 0; b.click(); return 1;
    }, texte);
    expect(n, 'bouton de la question introuvable : ' + texte).toBe(1);
    await pause(page, 600);
}

/* ─────────────────────────────────────────────────────────────── productions */

const productions = (page) => page.evaluate(() => JSON.parse(JSON.stringify(db.getSync(cle('productions'), []) || [])));
const empreinteEvaluations = (page) => page.evaluate(() => JSON.stringify(db.getSync(cle('evaluationsSauvegardees'), []) || []));

/** Une production évaluée, rendue modifiable (marque « démo » retirée dans l'essai), ouverte. */
async function ouvrirProductionEvaluee(page) {
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const id = await page.evaluate(async () => {
        const evals = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const liste = db.getSync(cle('productions'), []) || [];
        const p = liste.find(x => x.grilleId && x.cartoucheId && evals.some(e => e.productionId === x.id))
            || liste.find(x => x.grilleId && evals.some(e => e.productionId === x.id));
        p.isDemo = false; p.auteur = 'Banc E3'; p.auteurOriginal = 'Banc E3'; delete p.metadata_cc;
        await db.set(cle('productions'), liste);
        return p.id;
    });
    await page.evaluate((id) => chargerProductionPourModif(id), id);
    await pause(page, 900);
    return id;
}

test('(P-a) production évaluée : un champ s\'écrit sans bouton ; changer la grille n\'écrit aucune évaluation', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const id = await ouvrirProductionEvaluee(page);
    expect(await page.evaluate(() => document.getElementById('productionActivite').disabled), 'fiche modifiable').toBe(false);
    expect(await visible(page, '#btnCreerProduction'), 'une fiche existante n\'a que « Fermer »').toBe(false);
    const avant = await empreinteEvaluations(page);
    await page.evaluate(() => { window.__toasts = []; });

    await changer(page, '#productionActivite', 'Activité fictive banc E3');
    expect((await productions(page)).find(p => p.id === id).activiteApprentissage).toBe('Activité fictive banc E3');
    expect(await temoinSucces(page), 'le témoin dit « Enregistré »').toBe(true);

    const autre = await page.evaluate((id) => {
        const p = (db.getSync(cle('productions'), []) || []).find(x => x.id === id);
        return (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id !== p.grilleId).id;
    }, id);
    await changer(page, '#productionGrille', autre);
    await pause(page, 400);
    const p = (await productions(page)).find(x => x.id === id);
    expect(p.grilleId).toBe(autre);
    expect(p.cartoucheId, 'la cartouche de l\'ancienne grille ne suit pas la nouvelle').toBe('');
    expect(await empreinteEvaluations(page), 'aucune évaluation réécrite').toBe(avant);
    expect(await page.evaluate(() => window.__toasts), 'aucun message de modification').toEqual([]);

    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page), 'une fiche existante se ferme sans question').toBe('');
    expect(await visible(page, '#formulaireProduction')).toBe(false);
});

test('(P-b) nouvelle production : rien avant « Créer la production » ; « Fermer » pose la question', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const nb = (await productions(page)).length;
    await cliquer(page, '[data-action="creerNouvelleProduction"]');
    expect(await visible(page, '#btnCreerProduction')).toBe(true);
    await changer(page, '#productionTitre', 'Journal fictif banc E3');
    await changer(page, '#productionType', 'travail');
    await changer(page, '#productionPonderation', '10');
    expect((await productions(page)).length, 'rien avant le bouton').toBe(nb);

    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page)).toBe('Cette production n\'est pas encore créée.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('productionTitre').value)).toBe('Journal fictif banc E3');
    expect((await productions(page)).length).toBe(nb);

    await page.evaluate(() => { window.__toasts = []; });
    await cliquer(page, '#btnCreerProduction');
    await pause(page, 600);
    const creee = (await productions(page)).find(p => p.titre === 'Journal fictif banc E3');
    expect(creee, 'créée au clic').toBeTruthy();
    expect(creee).toMatchObject({ type: 'travail', ponderation: 10, verrouille: false });
    expect(await page.evaluate(() => window.__toasts.some(t => t.includes('Production « Journal fictif banc E3 » créée.')))).toBe(true);
    expect(await visible(page, '#btnCreerProduction'), 'elle existe : « Fermer » seul').toBe(false);
    expect(await visible(page, '#btnDupliquerProduction')).toBe(true);

    // Elle existe : fermer ne pose plus de question.
    await cliquer(page, '[data-action="fermerFicheProduction"]');
    expect(await questionOuverte(page)).toBe('');
});

test('(P-b bis) « Quitter sans créer » n\'écrit rien ; ouvrir une autre production pose la question', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 800);
    const nb = (await productions(page)).length;
    await cliquer(page, '[data-action="creerNouvelleProduction"]');
    await changer(page, '#productionTitre', 'Brouillon fictif banc E3');
    await cliquer(page, '.sidebar-item[data-action="chargerProductionPourModif"]');
    expect(await questionOuverte(page)).toBe('Cette production n\'est pas encore créée.');
    await repondre(page, 'Quitter sans créer');
    expect((await productions(page)).length).toBe(nb);
    expect(await visible(page, '#btnCreerProduction'), 'l\'autre production s\'est ouverte').toBe(false);
});

test('(P-c) un échec d\'écriture : « Non enregistré – Modifier la production : … », aucun succès', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await ouvrirProductionEvaluee(page);
    await page.evaluate(() => {
        window.__toasts = [];
        document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes')?.classList.remove('visible');
        db._setIndexedDB = () => Promise.reject(new Error('panne simulée par le banc E3'));
        db._setLocalStorage = () => { throw new Error('panne simulée par le banc E3'); };
    });
    await changer(page, '#productionActivite', 'Ne doit pas s\'écrire');
    expect(await temoinEchec(page)).toMatch(/^Non enregistré – Modifier la production : /);
    expect(await temoinSucces(page), 'aucun « Enregistré »').toBe(false);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
});

test('(P-d) un nom vidé : « Non enregistré – Modifier la production : le nom de la production est requis. »', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const id = await ouvrirProductionEvaluee(page);
    const titre = (await productions(page)).find(p => p.id === id).titre;
    await changer(page, '#productionTitre', '');
    expect(await temoinEchec(page)).toBe('Non enregistré – Modifier la production : le nom de la production est requis.');
    expect((await productions(page)).find(p => p.id === id).titre).toBe(titre);
});
