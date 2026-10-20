import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// GRILLES DE CRITÈRES, 20 oct. 2026 (Grégoire, 13 h 56, sur sa grille « Journal de lecture ») — dans un vrai WebKit :
//   · les sous-critères d'un critère non algorithmique se modifient : la section se montre vide, « + Ajouter un
//     sous-critère » écrit aussitôt et met le focus sur le nom ; le nom s'écrit à la sortie du champ et survit au
//     rechargement ; les chevrons réordonnent ; la corbeille confirme ; aucun code d'annotation n'en naît ;
//   · l'espace vertical : l'en-tête de la grille (nom, type, description) sur une ligne au Mac, passé à la ligne
//     proprement sur l'iPad en long ; le texte d'une tranche, un champ d'une ligne qui s'agrandit avec son contenu
//     sans rien cacher ; l'indentation grille → critère → barème et sous-critères.
//   Grille fictive, posée au banc.

const GRILLE = {
    id: 'GR_BANC_SC', nom: 'Journal fictif', type: 'analytique', description: 'Une grille fictive du banc',
    criteres: [
        { id: 'CR_SC_A', nom: 'Compréhension fictive', type: 'analytique', ponderation: 10, description: '', formule: '', niveauSOLO: 'aucun', verrouille: false,
            bareme: [{ id: 'TR_1', nom: 'Insuffisant', pointsMin: null, pointsMax: null, texte: 'Un texte court.' },
                { id: 'TR_2', nom: 'Réussi', pointsMin: 3, pointsMax: 4, texte: 'Un texte fictif assez long pour passer sur plusieurs lignes : il décrit ce que l’élève fait quand il résume l’œuvre avec justesse, relève des procédés d’écriture, relie l’œuvre aux notions du cours et exprime une appréciation argumentée, nuancée, appuyée sur des passages précis.' }] },
        { id: 'CR_SC_H', nom: 'Appréciation fictive', type: 'holistique', ponderation: 10, description: '', formule: '', niveauSOLO: 'aucun', verrouille: false }
    ]
};

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate((g) => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
        db.setSync('a2032_grillesTemplates', [g]);   // security-ok: banc, une grille fictive dans un contexte neuf
        return db.flush();
    }, GRILLE);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true && !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
    await page.evaluate(async () => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif('GR_BANC_SC'); });
    await expect(page.locator('#listeCriteres .item-liste').first()).toBeVisible();
}

const criteres = (page) => page.evaluate(() => db.getSync(cle('grillesTemplates'), []).find((g) => g.id === 'GR_BANC_SC').criteres);
const carte = (page, i) => page.locator('#listeCriteres .item-liste').nth(i);
const noms = (page, i) => carte(page, i).locator('.grille-sous-critere input[data-champ="nom"]').evaluateAll((xs) => xs.map((x) => x.value));
const debord = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('iPad', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

    test('sous-critères · créer le premier, nommer, recharger, réordonner, retirer ; aucun code d’annotation', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        const questions = [];
        page.on('dialog', (d) => { questions.push(d.message()); d.accept(); });
        await ouvrir(page);

        // Le critère holistique, sans sous-critère : la section se montre, vide, avec son bouton.
        const holi = carte(page, 1);
        await expect(holi.locator('.grille-attendu-titre')).toHaveText(['Sous-critères']);
        await expect(holi.locator('.grille-sous-critere')).toHaveCount(0);
        await holi.locator('[data-action="ajouterSousCritere"]').tap();
        const premier = holi.locator('.grille-sous-critere input').first();
        await expect(premier).toBeFocused();
        await expect.poll(async () => (await criteres(page))[1].sousCriteres?.length).toBe(1);
        await premier.fill('Situer l’œuvre fictive');
        await premier.press('Tab');
        await expect.poll(async () => (await criteres(page))[1].sousCriteres[0].nom).toBe('Situer l’œuvre fictive');
        await holi.locator('[data-action="ajouterSousCritere"]').tap();
        const second = holi.locator('.grille-sous-critere input').nth(1);
        await expect(second).toBeFocused();
        await second.fill('Justifier son appréciation');
        await second.press('Tab');
        await expect.poll(async () => (await criteres(page))[1].sousCriteres.map((s) => s.nom)).toEqual(['Situer l’œuvre fictive', 'Justifier son appréciation']);
        expect((await criteres(page))[1].sousCriteres[0]).toMatchObject({ code: '0', ponderation: 1, retroaction: '' });

        // Recharger : ils sont là.
        await page.reload();
        await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
        await page.evaluate(async () => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif('GR_BANC_SC'); });
        await expect(noms(page, 1)).resolves.toEqual(['Situer l’œuvre fictive', 'Justifier son appréciation']);

        // Réordonner, puis retirer (la confirmation du gabarit algorithmique).
        await carte(page, 1).locator('.grille-sous-critere').nth(1).locator('[data-action="deplacerSousCritereHaut"]').tap();
        await expect(noms(page, 1)).resolves.toEqual(['Justifier son appréciation', 'Situer l’œuvre fictive']);
        await carte(page, 1).locator('.grille-sous-critere').nth(0).locator('[data-action="supprimerSousCritere"]').tap();
        await expect.poll(async () => (await criteres(page))[1].sousCriteres.map((s) => s.nom)).toEqual(['Situer l’œuvre fictive']);
        expect(questions).toEqual(['Supprimer ce sous-critère ?']);

        // Aucun code d'annotation n'en naît : la grille n'a pas de critère algorithmique.
        expect(await page.evaluate(() => window.codesAnnotation.estActive(db.getSync(cle('grillesTemplates'), [])[0]))).toBe(false);

        // Au doigt : 44 px pour le champ, les chevrons, la corbeille, l'ajout ; aucun débord.
        const hauteurs = await holi.locator('.grille-sous-critere input, .grille-sous-critere button, [data-action="ajouterSousCritere"]')
            .evaluateAll((xs) => xs.map((x) => Math.round(x.getBoundingClientRect().height)));
        expect(hauteurs.every((h) => h >= 44), 'hauteurs : ' + hauteurs.join(', ')).toBe(true);
        expect(await debord(page)).toBeLessThanOrEqual(0);
        expect(erreurs).toEqual([]);
    });

    test('condensé · l’en-tête passe à la ligne proprement ; le texte d’une tranche montre tout ; l’indentation se voit', async ({ page }) => {
        await ouvrir(page);
        const m = await page.evaluate(() => {
            const r = (s) => document.querySelector(s).getBoundingClientRect();
            const nom = r('#nomGrilleTemplate'), type = r('#typeGrille'), desc = r('#descriptionGrille');
            const textes = [...document.querySelectorAll('#listeCriteres .grille-bareme textarea')];
            return {
                largeurs: [nom.width, type.width, desc.width].map(Math.round),
                dansLePanneau: [nom, type, desc].every((x) => x.right <= document.documentElement.clientWidth),
                cache: textes.map((t) => t.scrollHeight - t.clientHeight),
                long: textes[1].getBoundingClientRect().height > textes[0].getBoundingClientRect().height,
                retraits: [r('#nomGrilleTemplate').left, r('#listeCriteres .item-liste').left, r('#listeCriteres .grille-attendu').left].map(Math.round)
            };
        });
        expect(m.largeurs.every((x) => x >= 200), 'largeurs : ' + m.largeurs.join(', ')).toBe(true);
        expect(m.dansLePanneau).toBe(true);
        expect(m.cache.every((x) => x <= 1), 'texte caché : ' + m.cache.join(', ')).toBe(true);
        expect(m.long).toBe(true);
        expect(m.retraits[1]).toBeGreaterThan(m.retraits[0]);
        expect(m.retraits[2]).toBeGreaterThan(m.retraits[1]);
        expect(await debord(page)).toBeLessThanOrEqual(0);
        await page.screenshot({ path: test.info().outputPath('grille-820.png'), fullPage: true });
    });
});

test.describe('Mac', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('condensé · nom, type et description de la grille sur une ligne ; le texte d’une tranche grandit en tapant ; un nom trop long est borné', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrir(page);
        const ligne = await page.evaluate(() => ['#nomGrilleTemplate', '#typeGrille', '#descriptionGrille']
            .map((s) => Math.round(document.querySelector(s).getBoundingClientRect().top)));
        expect(Math.max(...ligne) - Math.min(...ligne)).toBeLessThanOrEqual(2);
        await expect(page.locator('#precisionTypeGrille')).toBeAttached();

        // Le texte de la première tranche : une ligne, puis il grandit avec ce qu'on tape, sans rien cacher.
        const t = carte(page, 0).locator('.grille-bareme-tranche').first().locator('textarea');
        const avant = await t.evaluate((x) => x.getBoundingClientRect().height);
        await t.click();
        await t.press('End');
        await page.keyboard.type(' Une suite fictive qui allonge le texte. '.repeat(6));
        const apres = await t.evaluate((x) => ({ h: x.getBoundingClientRect().height, cache: x.scrollHeight - x.clientHeight }));
        expect(apres.h).toBeGreaterThan(avant);
        expect(apres.cache).toBeLessThanOrEqual(1);

        // La borne de l'assistant : le champ d'un nom de sous-critère s'arrête à 200 caractères.
        await carte(page, 0).locator('[data-action="ajouterSousCritere"]').click();
        const nom = carte(page, 0).locator('.grille-sous-critere input').first();
        await expect(nom).toBeFocused();
        await nom.fill('x'.repeat(250));
        await expect(nom).toHaveValue('x'.repeat(200));
        expect(await debord(page)).toBeLessThanOrEqual(0);
        await page.screenshot({ path: test.info().outputPath('grille-1440.png'), fullPage: true });
        expect(erreurs).toEqual([]);
    });
});
