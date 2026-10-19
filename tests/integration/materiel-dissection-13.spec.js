import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_B, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LA DISSECTION, LOT 13 (consigne du 19 oct. 2026), dans un vrai WebKit.
//
//   · une grille fictive en réponses et points, créée par la dissection, ouverte dans Grilles de critères ;
//   · corriger le texte d'une réponse, changer ses points, en ajouter une, en retirer une : chaque geste
//     s'enregistre seul, et le témoin le dit ;
//   · recharger la page : tout est là ;
//   · sur l'iPad (toucher), les cibles font au moins 44 px.
// Le détail (refus, échelle, échappement) : tests/unit/materiel-dissection-13-modifier-les-reponses.test.js.

test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

async function attendreApp(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false)
        && document.getElementById('materiel-zone-collage')?.dataset.materielBranche === '1', null, { timeout: 20000 });
}

async function ouvrirConception(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApp(page);
    await page.evaluate(() => window.afficherSection('conception'));
    await expect(page.locator('#conception-materiel')).toBeVisible();
}

/** Une étiquette en main, puis un geste de pointeur sur les morceaux de la liste (le même que la spec 2a). */
async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, b) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true }, centre(b)));
        blocs[0].dispatchEvent(ev('pointerdown', blocs[0]));
        blocs.slice(1).forEach((b) => b.dispatchEvent(ev('pointermove', b)));
        const der = blocs[blocs.length - 1];
        der.dispatchEvent(ev('pointerup', der));
    }, textes);
    await page.keyboard.press('Escape');
}

async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
}

/** La grille (b), fictive, créée en points (comme C1 de la spec 2a). */
async function creerQuestionnaire(page) {
    await coller(page, enHtml(GRILLE_B));
    await etiqueter(page, 'critere', ['Question 1 : le sens du passage fictif']);
    await etiqueter(page, 'section', ['Partie B : le vocabulaire fictif']);
    await etiqueter(page, 'descripteur', ['Réponse juste et complète', 'Réponse juste, mais incomplète', 'Réponse absente ou fausse',
        'Définit les trois termes', 'Définit deux termes', 'Définit un seul terme, ou en donne', 'Aucun terme défini',
        'Donne un exemple juste', 'Donne un exemple approximatif', 'Ne donne aucun exemple']);
    await etiqueter(page, 'suite', ['un exemple sans le définir']);
    await etiqueter(page, 'points', ['4 points', '2 points', '0 point', '3', '2', '1', '0', '0,5']);
    await etiqueter(page, 'ponderation', ['/2']);
    await page.locator('#dissection-nom-grille').fill('Questionnaire fictif');
    await page.locator('#dissection-creer [data-action="materielDissection.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Questionnaire fictif » est créée');
    return page.evaluate(() => { const g = db.getSync(cle('grillesTemplates'), []); return g[g.length - 1].id; });
}

const reponses = (page, id) => page.evaluate((id) =>
    Object.entries((db.getSync(cle('grillesTemplates'), []).find((g) => g.id === id).criteres[0].descripteurs || {}).parNiveau || {}), id);

test('dissection 13 · corriger, changer les points, ajouter, retirer une réponse ; recharger : tout est là', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const questions = [];
    page.on('dialog', (d) => { questions.push(d.message()); d.accept().catch(() => {}); });
    await ouvrirConception(page);
    const id = await creerQuestionnaire(page);
    await page.locator('[data-action="materiel.voir"][data-param="grille-criteres"]').click();
    const bloc = page.locator('#listeCriteres .grille-attendu').first();
    await expect(bloc.locator('.grille-attendu-points input')).toHaveCount(3);
    const avant = await reponses(page, id);
    expect(avant.map(([k]) => k)).toEqual(['4 points', '2 points', '0 point']);

    // Le texte : à sa place, enregistré à la sortie du champ ; le témoin le dit.
    await bloc.locator('textarea').nth(1).fill('Réponse juste, mais sans exemple.');
    await bloc.locator('textarea').nth(1).press('Tab');
    await expect.poll(() => reponses(page, id)).toEqual([['4 points', avant[0][1]], ['2 points', 'Réponse juste, mais sans exemple.'], ['0 point', avant[2][1]]]);
    await expect(page.locator('#temoin-enregistrement')).toContainText('Enregistré');

    // Les points : un nombre seul prend son unité, la réponse garde sa place et son texte.
    await bloc.locator('.grille-attendu-points input').nth(1).fill('3');
    await bloc.locator('.grille-attendu-points input').nth(1).press('Tab');
    await expect.poll(async () => (await reponses(page, id)).map(([k]) => k)).toEqual(['4 points', '3 points', '0 point']);
    await expect(bloc.locator('.grille-attendu-points input').nth(1)).toHaveValue('3 points');
    // Le texte suit sa clé neuve : une correction après le changement de points tombe sur la bonne réponse.
    await bloc.locator('textarea').nth(1).fill('Réponse juste, sans exemple.');
    await bloc.locator('textarea').nth(1).press('Tab');
    await expect.poll(async () => (await reponses(page, id))[1]).toEqual(['3 points', 'Réponse juste, sans exemple.']);

    // Ajouter : en dernier, ses points prêts à saisir.
    await bloc.locator('[data-action="ajouterReponseGrille"]').click();
    await expect(bloc.locator('.grille-attendu-points input')).toHaveCount(4);
    await expect(bloc.locator('.grille-attendu-points input').nth(3)).toBeFocused();
    await page.keyboard.type('1');
    await page.keyboard.press('Tab');
    await bloc.locator('textarea').nth(3).fill('Une réponse ajoutée, fictive.');
    await bloc.locator('textarea').nth(3).press('Tab');
    await expect.poll(async () => (await reponses(page, id)).slice(3)).toEqual([['1 point', 'Une réponse ajoutée, fictive.']]);

    // Retirer : la corbeille, la confirmation du retrait d'un critère.
    await bloc.locator('[data-action="supprimerReponseGrille"]').nth(2).click();
    await expect.poll(async () => (await reponses(page, id)).map(([k]) => k)).toEqual(['4 points', '3 points', '1 point']);
    expect(questions).toEqual(['Es-tu sûr de vouloir supprimer cette réponse ?']);

    // Sur l'iPad : 44 px au moins, la corbeille, l'ajout, les champs.
    const tailles = await bloc.evaluate((b) => [...b.querySelectorAll('[data-action="supprimerReponseGrille"], [data-action="ajouterReponseGrille"], .controle-form')]
        .map((x) => Math.round(x.getBoundingClientRect().height)));
    expect(tailles.every((h) => h >= 44), 'tailles : ' + tailles.join(', ')).toBe(true);

    // Recharger : tout est là.
    const apres = await reponses(page, id);
    await page.reload();
    await attendreApp(page);
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, id);
    const blocRelu = page.locator('#listeCriteres .grille-attendu').first();
    await expect(blocRelu.locator('.grille-attendu-points input')).toHaveCount(3);
    expect(await blocRelu.locator('.grille-attendu-points input').evaluateAll((xs) => xs.map((x) => x.value))).toEqual(apres.map(([k]) => k));
    expect(await blocRelu.locator('textarea').evaluateAll((xs) => xs.map((x) => x.value))).toEqual(apres.map(([, t]) => t));
    expect(apres).toEqual([['4 points', avant[0][1]], ['3 points', 'Réponse juste, sans exemple.'], ['1 point', 'Une réponse ajoutée, fictive.']]);
    expect(erreurs).toEqual([]);
});
