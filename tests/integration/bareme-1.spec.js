import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRILLE_B, enHtml } from '../unit/_helpers/grilles-fictives-dissection.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// LE BARÈME, LOT 1 (#1120, geste 1 ; consigne du 20 oct. 2026), dans un vrai WebKit. Remplace la spec du lot 13
// de la dissection (l'éditeur des réponses, retiré avec elles).
//
//   · l'exemple de « Apporter mon matériel » (le Journal de lecture, fictif), créé par la dissection, remis au banc
//     dans la forme d'avant #1125 (des réponses sous le nom du niveau : le stock d'aujourd'hui), puis un
//     critère holistique ajouté au banc dans la même grille : le critère analytique montre son BARÈME (les
//     noms de niveau devenus des tranches « à compléter », leurs textes) ; donner des points à une tranche →
//     `bareme` écrit, `parNiveau` retiré de CE critère seulement ; recharger → le barème est là ; les autres
//     critères analytiques gardent leurs réponses ; l'holistique, inchangé à l'octet près ;
//   · la grille (b) en points : un refus (chevauchement) n'écrit rien ; « + Ajouter une tranche » écrit
//     aussitôt une tranche « à compléter » (C1 du verdict du 20 oct.) : son texte tapé, la page RECHARGÉE,
//     elle est là avec lui ; des points qui chevauchent sont refusés, le texte reste ; la corbeille confirme ;
//     à 820 px (iPad, au doigt), des cibles de 44 px, nom et points côte à côte, le texte dessous, aucun débord ;
//     à 1440 px (Mac), nom, points et texte sur UNE ligne (↻ 20 oct., Grégoire, 13 h 56).
//   Break-tests (faits le 20 oct.) : `ecrireSurCritere` qui oublie de retirer `parNiveau` → le premier essai
//   rougit ; une tranche neuve gardée en mémoire seulement (rendue sans être écrite) → le deuxième rougit.

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

const CRITERES = ['L’étudiant·e résume l’œuvre avec justesse', 'L’étudiant·e relève des procédés d’écriture',
    'L’étudiant·e relie l’œuvre aux notions du cours', 'L’étudiant·e exprime une appréciation argumentée'];
const DESCRIPTEURS = ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
    'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
    'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
    'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'];

/** L'exemple fictif, étiqueté en points, créé (spec 2a) ; rend l'identifiant de la grille. */
async function creerExemple(page) {
    await page.locator('[data-action="materiel.essayerExemple"]').click();
    await etiqueter(page, 'section', ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION']);
    await etiqueter(page, 'niveau', ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
    await etiqueter(page, 'critere', CRITERES);
    await etiqueter(page, 'descripteur', DESCRIPTEURS);
    await etiqueter(page, 'points', ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10']);
    await etiqueter(page, 'total', ['TOTAL : / 30']);
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await page.locator('#dissection-creer [data-action="materielDissection.creer"]').click();
    await expect(page.locator('#materiel-titre-cree')).toHaveText('Ta grille « Journal de lecture » est créée');
    return page.evaluate(() => { const g = db.getSync(cle('grillesTemplates'), []); return g[g.length - 1].id; });
}

/** La grille (b), fictive, créée en points (spec du lot 13). */
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

/** Grilles de critères, la grille ouverte (le chemin de la spec du lot 13). */
async function ouvrirGrille(page, id) {
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, id);
    await expect(page.locator('#listeCriteres .item-liste').first()).toBeVisible();
}

const criteres = (page, id) => page.evaluate((id) => db.getSync(cle('grillesTemplates'), []).find((g) => g.id === id).criteres, id);
const tranche = (page, i, j) => page.locator('#listeCriteres .item-liste').nth(i).locator('.grille-bareme-tranche').nth(j);
const valeurs = (page, i, champ) => page.locator('#listeCriteres .item-liste').nth(i).locator(`.grille-bareme-tranche [data-champ="${champ}"]`)
    .evaluateAll((xs) => xs.map((x) => x.value));

test.describe('iPad', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

    test('barème 1 · une grille de la dissection : son barème lu, une tranche modifiée → `bareme` écrit pour ce critère seulement, gardé au rechargement', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirConception(page);
        const id = await creerExemple(page);
        // Un critère holistique dans la même grille, lié à une échelle du trimestre (banc).
        await page.evaluate((id) => {
            const echelles = db.getSync(cle('echellesTemplates'), []);
            echelles.push({ id: 'ECH_BANC_1120', nom: 'Échelle fictive', niveaux: [{ code: 'I', nom: 'Insuffisant', min: 0, max: 59 }, { code: 'M', nom: 'Maîtrisé', min: 60, max: 100 }] });
            db.setSync(cle('echellesTemplates'), echelles);   // security-ok: banc, une échelle fictive dans un contexte neuf
            const grilles = db.getSync(cle('grillesTemplates'), []);
            // #1125 (22 oct.) : la dissection écrit maintenant un barème. Le STOCK d'avant (des réponses rangées sous le
            // nom du niveau, les points au bout du texte, comme la grille de Grégoire du 20 oct.) se fabrique au banc.
            grilles.find((g) => g.id === id).criteres.forEach((c) => {
                const ecrit = (t) => (t.pointsMin === null ? '' : '\n' + (t.pointsMin === t.pointsMax ? t.pointsMin : t.pointsMin + '-' + t.pointsMax));
                c.descripteurs = { parNiveau: Object.fromEntries(c.bareme.map((t) => [t.nom, t.texte + ecrit(t)])) };
                delete c.bareme;
            });
            grilles.find((g) => g.id === id).criteres.push({ id: 'CR_BANC_HOLI', nom: 'Critère holistique fictif', type: 'holistique', ponderation: 0,
                description: '', formule: '', niveauSOLO: 'aucun', verrouille: false,
                descripteurs: { echelleId: 'ECH_BANC_1120', parNiveau: { I: 'Un texte fictif insuffisant.', M: 'Un texte fictif maîtrisé.' } } });
            db.setSync(cle('grillesTemplates'), grilles);   // security-ok: banc, un critère holistique fictif dans un contexte neuf
            return db.flush();
        }, id);
        await ouvrirGrille(page, id);
        const avant = await criteres(page, id);
        expect(avant[0].descripteurs.parNiveau).toBeDefined();
        expect(avant[0]).not.toHaveProperty('bareme');

        // Le critère analytique montre son barème : les noms de niveau, sans points (« à compléter »), leurs textes.
        await expect(valeurs(page, 0, 'nom')).resolves.toEqual(['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
        await expect(valeurs(page, 0, 'points')).resolves.toEqual(['', '', '', '']);
        await expect(valeurs(page, 0, 'texte')).resolves.toEqual(Object.values(avant[0].descripteurs.parNiveau));
        await expect(tranche(page, 0, 2).locator('.grille-bareme-marque')).toHaveText('à compléter');
        // L'holistique : ses textes par niveau, nommés par l'échelle ; aucun barème.
        const holi = page.locator('#listeCriteres .item-liste').nth(4);
        await expect(holi.locator('.grille-bareme')).toHaveCount(0);
        await expect(holi.locator('.grille-attendu-niveau strong')).toHaveText(['Insuffisant', 'Maîtrisé']);

        // Donner ses points à « Satisfaisant » : la conversion de CE critère.
        const pts = tranche(page, 0, 2).locator('[data-champ="points"]');
        await pts.fill('3-4');
        await pts.press('Tab');
        await expect.poll(async () => (await criteres(page, id))[0].bareme?.length).toBe(4);
        await expect(pts).toHaveValue('3 à 4');
        await expect(tranche(page, 0, 2).locator('.grille-bareme-marque')).toHaveCount(0);
        await expect(page.locator('#temoin-enregistrement')).toContainText('Enregistré');
        const apres = await criteres(page, id);
        expect(apres[0]).not.toHaveProperty('descripteurs');
        expect(apres[0].bareme.map((t) => [t.id, t.nom, t.pointsMin, t.pointsMax, t.texte])).toEqual(
            Object.entries(avant[0].descripteurs.parNiveau).map(([k, v], j) => ['TR_lu_' + (j + 1), k, j === 2 ? 3 : null, j === 2 ? 4 : null, v]));
        // Les autres critères analytiques gardent leurs réponses ; l'holistique, à l'octet près.
        for (const j of [1, 2, 3]) expect(JSON.stringify(apres[j])).toBe(JSON.stringify(avant[j]));
        expect(JSON.stringify(apres[4])).toBe(JSON.stringify(avant[4]));

        // Recharger : le barème est là, lu de `bareme`.
        await page.evaluate(() => db.flush());
        await page.reload();
        await attendreApp(page);
        await ouvrirGrille(page, id);
        await expect(valeurs(page, 0, 'points')).resolves.toEqual(['', '', '3 à 4', '']);
        await expect(valeurs(page, 0, 'nom')).resolves.toEqual(['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable']);
        expect(JSON.stringify(await criteres(page, id))).toBe(JSON.stringify(apres));
        expect(erreurs).toEqual([]);
    });

    test('barème 1 · un refus n’écrit rien ; une tranche neuve écrite aussitôt survit au rechargement ; retirer confirme ; 44 px, texte sous nom et points', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        const questions = [];
        page.on('dialog', (d) => { questions.push(d.message()); d.accept(); });
        await ouvrirConception(page);
        const id = await creerQuestionnaire(page);
        await ouvrirGrille(page, id);
        await expect(valeurs(page, 0, 'points')).resolves.toEqual(['4', '2', '0']);

        // Un chevauchement : refusé, rien n'est écrit, le témoin dit pourquoi.
        const avant = await criteres(page, id);
        const p1 = tranche(page, 0, 1).locator('[data-champ="points"]');
        await p1.fill('4');
        await p1.press('Tab');
        await expect(page.locator('#temoin-enregistrement')).toContainText('Non enregistré : ces points chevauchent ceux de la tranche 4');
        await expect(p1).toHaveClass(/champ-refuse/);
        expect(await criteres(page, id)).toEqual(avant);

        // « + Ajouter une tranche » (C1) : écrite aussitôt, « à compléter », le focus sur son nom ; son texte s'écrit à la sortie du champ.
        const bloc = page.locator('#listeCriteres .item-liste').first();
        await bloc.locator('[data-action="ajouterTrancheBareme"]').click();
        const neuve = tranche(page, 0, 3);
        await expect(neuve.locator('.grille-bareme-marque')).toHaveText('à compléter');
        await expect(neuve.locator('[data-champ="nom"]')).toBeFocused();
        await expect.poll(async () => (await criteres(page, id))[0].bareme?.length).toBe(4);
        await neuve.locator('textarea').fill('Une réponse fictive, presque juste.');
        await neuve.locator('textarea').press('Tab');
        await expect.poll(async () => (await criteres(page, id))[0].bareme[3].texte).toBe('Une réponse fictive, presque juste.');

        // Recharger (l'iPad recharge une page mise en arrière-plan, #1031) : la tranche et son texte sont là, « à compléter ».
        await page.evaluate(() => db.flush());
        await page.reload();
        await attendreApp(page);
        await ouvrirGrille(page, id);
        await expect(valeurs(page, 0, 'texte')).resolves.toEqual([...Object.values(avant[0].descripteurs.parNiveau), 'Une réponse fictive, presque juste.']);
        await expect(neuve.locator('.grille-bareme-marque')).toHaveText('à compléter');
        await expect(neuve.locator('[data-champ="points"]')).toHaveValue('');

        // Des points qui chevauchent : refusés, les points seuls ; le texte reste écrit.
        await neuve.locator('[data-champ="points"]').fill('2');
        await neuve.locator('[data-champ="points"]').press('Tab');
        await expect(page.locator('#temoin-enregistrement')).toContainText('Non enregistré : ces points chevauchent ceux de la tranche 2');
        expect((await criteres(page, id))[0].bareme[3]).toMatchObject({ pointsMin: null, pointsMax: null, texte: 'Une réponse fictive, presque juste.' });
        await neuve.locator('[data-champ="points"]').fill('1');
        await neuve.locator('[data-champ="points"]').press('Tab');
        await expect.poll(async () => (await criteres(page, id))[0].bareme.slice(-1).map((t) => [t.pointsMin, t.texte]))
            .toEqual([[1, 'Une réponse fictive, presque juste.']]);
        await expect(neuve.locator('.grille-bareme-marque')).toHaveCount(0);

        // Retirer : la corbeille, la confirmation.
        await tranche(page, 0, 2).locator('[data-action="retirerTrancheBareme"]').click();
        await expect.poll(async () => (await criteres(page, id))[0].bareme.map((t) => t.pointsMin)).toEqual([4, 2, 1]);
        expect(questions).toEqual(['Es-tu sûr de vouloir retirer cette tranche ?']);

        // Sur l'iPad : 44 px au moins (champs, corbeille, ajout) ; nom, points et corbeille sur une ligne, le texte
        // dessous, de toute la largeur (↻ 20 oct.) ; aucun débord.
        const mesure = await bloc.evaluate((b) => {
            const t = b.querySelector('.grille-bareme-tranche');
            const nom = t.querySelector('[data-champ="nom"]').getBoundingClientRect(), pts = t.querySelector('[data-champ="points"]').getBoundingClientRect();
            const texte = t.querySelector('[data-champ="texte"]').getBoundingClientRect();
            const corbeille = t.querySelector('[data-action="retirerTrancheBareme"]').getBoundingClientRect();
            return {
                hauteurs: [...b.querySelectorAll('.grille-bareme .controle-form, [data-action="ajouterTrancheBareme"]')].map((x) => Math.round(x.getBoundingClientRect().height)),
                corbeille: [Math.round(corbeille.width), Math.round(corbeille.height)],
                empilee: Math.abs(pts.top - nom.top) < 2 && pts.left > nom.right && corbeille.left >= pts.right - 1
                    && texte.top >= nom.bottom - 1 && Math.abs(texte.left - nom.left) < 2 && texte.right >= corbeille.right - 1,
                police: parseFloat(getComputedStyle(t.querySelector('[data-champ="points"]')).fontSize),
                debord: document.documentElement.scrollWidth - document.documentElement.clientWidth
            };
        });
        expect(mesure.hauteurs.every((h) => h >= 44), 'hauteurs : ' + mesure.hauteurs.join(', ')).toBe(true);
        expect(mesure.corbeille.every((x) => x >= 44)).toBe(true);
        expect(mesure.empilee).toBe(true);
        expect(mesure.police).toBeGreaterThanOrEqual(16);
        expect(mesure.debord).toBeLessThanOrEqual(0);
        await page.screenshot({ path: test.info().outputPath('bareme-820.png'), fullPage: false });
        expect(erreurs).toEqual([]);
    });
});

test.describe('Mac', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('barème 1 · à 1440 px, nom, points et texte sur une ligne, la corbeille au bout ; aucun débord', async ({ page }) => {
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await ouvrirConception(page);
        const id = await creerQuestionnaire(page);
        await ouvrirGrille(page, id);
        const t = tranche(page, 0, 0);
        await expect(t).toBeVisible();
        const m = await t.evaluate((x) => {
            const r = (s) => x.querySelector(s).getBoundingClientRect();
            const nom = r('[data-champ="nom"]'), pts = r('[data-champ="points"]'), texte = r('[data-champ="texte"]'), corbeille = r('[data-action="retirerTrancheBareme"]');
            return { rang: Math.abs(nom.top - pts.top) < 2 && pts.left > nom.right && Math.abs(texte.top - nom.top) < 2
                    && texte.left > pts.right && corbeille.left >= texte.right - 1,
                corbeille: Math.round(corbeille.height), debord: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        expect(m.rang).toBe(true);
        expect(m.corbeille).toBeGreaterThanOrEqual(44);
        expect(m.debord).toBeLessThanOrEqual(0);
        await page.screenshot({ path: test.info().outputPath('bareme-1440.png'), fullPage: false });
        expect(erreurs).toEqual([]);
    });
});
