import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1117 (19 oct. 2026) — SOLO SUIT LE RÉGLAGE.
//
// Case « Activer l'observation de la structure des résultats d'apprentissage » décochée
// (Réglages › Préférences, `#v2-pref-solo`) : aucun critère ne montre plus « Complexité SOLO
// du critère », aucun niveau ne montre plus « Palier SOLO du niveau ». Le critère ajouté à la
// main reçoit « aucun ». Et MASQUER N'ÉCRIT RIEN : un critère « relationnel », sa grille
// enregistrée pendant que le champ est masqué, la page rechargée, la case recochée — il est
// toujours « relationnel ».
//
// Ce banc joue la VRAIE case (son `change` part vers `sauvegarderPreferencesV2`), les vrais
// éditeurs, et lit la BASE (`cle('grillesTemplates')`). Les règles pures sont dans
// `tests/unit/sentinelle-1117-solo-suit-le-reglage.test.js`.
//
// ⚠ Stockage propre à chaque essai : un contexte Playwright neuf par test.

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

/** Le geste de Grégoire : cocher ou décocher la case dans Réglages › Préférences. */
async function regler(page, actif) {
    await page.evaluate(() => naviguerVers('reglages', 'preferences'));
    await pause(page, 600);
    await page.evaluate((actif) => {
        const c = document.getElementById('v2-pref-solo');
        c.checked = actif;
        c.dispatchEvent(new Event('change', { bubbles: true }));
    }, actif);
    await pause(page, 600);
    expect(await page.evaluate(() => obtenirPreference('afficherDescriptionsSOLO'))).toBe(actif);
}

const lireGrille = (page, id) => page.evaluate((id) =>
    JSON.parse(JSON.stringify((db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id === id) || null)), id);

async function ouvrirGrille(page, id) {
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 800);
    await page.evaluate((id) => chargerGrillePourModif(id), id);
    await pause(page, 900);
}

const premiereGrille = (page) => page.evaluate(() =>
    (db.getSync(cle('grillesTemplates'), []) || []).find(g => (g.criteres || []).length >= 2)?.id);

const compter = (page, selecteur) => page.evaluate((s) => document.querySelectorAll(s).length, selecteur);

test('#1117 — case décochée : ni « Complexité SOLO du critère » ni « Palier SOLO du niveau » ; un critère ajouté reçoit « aucun »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    const id = await premiereGrille(page);
    expect(id, 'la démonstration doit porter une grille d\'au moins deux critères').toBeTruthy();

    // Témoin : case cochée, les menus sont là.
    await ouvrirGrille(page, id);
    const n = (await lireGrille(page, id)).criteres.length;
    expect(await compter(page, '#listeCriteres [data-champ="niveauSOLO"]'), 'témoin : un menu par critère').toBe(n);

    await regler(page, false);
    await ouvrirGrille(page, id);
    expect(await compter(page, '#listeCriteres [data-champ="description"]'), 'l\'éditeur est bien rendu').toBe(n);
    expect(await compter(page, '#listeCriteres [data-champ="niveauSOLO"]')).toBe(0);
    expect(await page.evaluate(() => document.getElementById('listeCriteres').textContent)).not.toContain('Complexité SOLO du critère');

    // « + Ajouter un critère » : le critère neuf reçoit « aucun » (Grégoire, 22 h 05).
    await page.evaluate((id) => document.querySelector(`[data-action="ajouterCritereGrille"][data-param="${id}"]`).click(), id);
    await pause(page, 900);
    const apres = await lireGrille(page, id);
    expect(apres.criteres.length).toBe(n + 1);
    expect(apres.criteres.at(-1).niveauSOLO).toBe('aucun');

    // Échelles : une échelle de la démonstration, ses niveaux rendus, sans palier SOLO.
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 800);
    const idEchelle = await page.evaluate(() => (db.getSync(cle('echellesTemplates'), []) || []).find(e => (e.niveaux || []).length >= 2)?.id);
    expect(idEchelle, 'la démonstration doit porter une échelle').toBeTruthy();
    await page.evaluate((id) => chargerEchellePourModif(id), idEchelle);
    await pause(page, 900);
    expect(await compter(page, '[data-champ="code"]'), 'les niveaux sont bien rendus').toBeGreaterThan(1);
    expect(await compter(page, '[data-champ="niveauSOLO"]')).toBe(0);
    expect(await page.evaluate(() => document.body.innerText)).not.toContain('Palier SOLO du niveau');

    // Témoin : la case recochée, le palier revient.
    await regler(page, true);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 600);
    await page.evaluate((id) => chargerEchellePourModif(id), idEchelle);
    await pause(page, 900);
    expect(await compter(page, '[data-champ="niveauSOLO"]')).toBeGreaterThan(1);
});

test('#1117 — un critère « relationnel », enregistré champ masqué, la page rechargée, la case recochée : toujours « relationnel »', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const id = await premiereGrille(page);
    expect(id).toBeTruthy();

    // Case cochée : on choisit « relationnel » au vrai menu du premier critère.
    await ouvrirGrille(page, id);
    await page.evaluate(() => {
        const s = document.querySelector('#listeCriteres select[data-champ="niveauSOLO"][data-critere-index="0"]');
        s.value = 'relationnel';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await pause(page, 900);
    expect((await lireGrille(page, id)).criteres[0].niveauSOLO).toBe('relationnel');

    // Case décochée : on modifie le critère (sa description) et on enregistre la grille (le
    // `change` du nom, le geste qui a remplacé « Enregistrer »), champ SOLO masqué.
    await regler(page, false);
    await ouvrirGrille(page, id);
    expect(await compter(page, '#listeCriteres [data-champ="niveauSOLO"]')).toBe(0);
    await page.evaluate(() => {
        const d = document.querySelector('#listeCriteres input[data-champ="description"][data-critere-index="0"]');
        d.value = 'Décrite pendant que SOLO est masqué';
        d.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('nomGrilleTemplate').dispatchEvent(new Event('change', { bubbles: true }));
    });
    await pause(page, 1200);
    const masquee = await lireGrille(page, id);
    expect(masquee.criteres[0].description, 'l\'enregistrement a bien eu lieu').toBe('Décrite pendant que SOLO est masqué');
    expect(masquee.criteres[0].niveauSOLO, 'masquer n\'écrit rien').toBe('relationnel');

    // La page rechargée : la valeur est en base, pas seulement en mémoire.
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 2500);
    expect(await page.evaluate(() => obtenirPreference('afficherDescriptionsSOLO'))).toBe(false);
    expect((await lireGrille(page, id)).criteres[0].niveauSOLO).toBe('relationnel');

    // La case recochée : le menu revient, avec « relationnel ».
    await regler(page, true);
    await ouvrirGrille(page, id);
    expect(await page.evaluate(() =>
        document.querySelector('#listeCriteres select[data-champ="niveauSOLO"][data-critere-index="0"]')?.value)).toBe('relationnel');
});
