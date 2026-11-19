import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');

// LOT `autoevaluation-consignes` (19 nov. 2026, fiche #1287) — LA GRILLE D'AUTOÉVALUATION DANS LE PDF DES CONSIGNES,
// au navigateur, sur l'iPad en long (1 180 × 820) et en haut (820 × 1 180), au doigt, séparément :
//   · l'échelle de départ (IDME), semée par l'application, reçoit ses deux repères (D, M) par le geste de l'éditeur
//     d'échelles (`ecrireRepereEchelle`) : elle ne les a pas d'origine ;
//   · « + Nouvelle grille », deux critères composés à la main, D et M décrits sur chacun, une question « Pour
//     vérifier » sur le premier ; « Créer la grille » ; la page RECHARGÉE retrouve textes et question à leur place ;
//   · une production fictive liée à cette grille et à cette échelle ; sa fiche, « Préparer le PDF » : l'aperçu montre
//     trois feuilles, la deuxième est la grille d'autoévaluation, et sa case est cochée ;
//   · « Exporter en PDF » : le fichier (relu par PDF.js) porte la même page, au même rang ;
//   · la case décochée retire la feuille de l'aperçu ET la page du fichier ; aucune erreur de page.
// Grilles, production et textes FICTIFS (textes inventés sur les stratégies de lecture). Captures, clair et
// sombre : CAPTURES_AUTOEVAL=<dossier> pour les écrire.
// ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice, pas un verdict iPad.

const CAPTURES = process.env.CAPTURES_AUTOEVAL;
const NBSP = ' ';
const NOM_GRILLE = 'Grille fictive des stratégies de lecture';
const ID_DEPART = 'ECHELLE_IDME_DEPART';
const ACTIVITE = 'Appliquer des stratégies de lecture variées';
const TITRE_PAGE = `${ACTIVITE}${NBSP}: grille d'autoévaluation`;
const CRITERES = [
    { nom: 'Repérage des stratégies', ponderation: '60',
        D: 'Tu nommes au moins trois stratégies de lecture et tu en laisses une trace sur le texte.',
        M: 'Chaque stratégie nommée laisse une trace précise, et ton système de couleurs reste le même d’une page à l’autre.',
        question: 'Est-ce qu’un lecteur qui ne te connaît pas retrouverait chaque stratégie sur la page ?' },
    { nom: 'Hypothèse de lecture', ponderation: '40',
        D: 'Tu formules une hypothèse sur l’objectif de communication du texte.',
        M: 'Ton hypothèse s’appuie sur au moins deux traces de ta lecture.' }
];

async function attendreApp(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => !!db.getSync('migration_pratiqueId_to_configurable_id_done', false), null, { timeout: 20000 });
}

async function ouvrirApp(page) {
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
    // L'échelle de départ, puis ses deux repères par le geste de l'éditeur d'échelles.
    const refus = await page.evaluate(async (id) => {
        await assurerEchelleIdmeDeDepart();
        const r1 = await ecrireRepereEchelle(id, 'seuilSuffisance', 'D');
        const r2 = await ecrireRepereEchelle(id, 'seuilMaitrise', 'M');
        await db.flush();
        return [r1 && r1.refuse, r2 && r2.refuse].filter(Boolean);
    }, ID_DEPART);
    expect(refus).toEqual([]);
}

const lesGrilles = (page) => page.evaluate(() => db.getSync(cle('grillesTemplates'), []));
const carte = (page, i) => page.locator('#listeCriteres .item-liste').nth(i);
const caseDe = (page, i, code) => carte(page, i).locator(`.grille-attendu-niveaux textarea[data-niveau="${code}"]`);
const question = (page, i) => carte(page, i).locator('textarea[data-on-change="modifierQuestionVerificationHandler"]');

async function saisir(locator, texte) {
    await locator.fill(texte);
    await locator.press('Tab');
}

async function capturerEditeur(page, nom) {
    if (!CAPTURES) return;
    const v = page.viewportSize();
    for (const mode of ['sombre', 'clair']) {
        await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
        await carte(page, 0).locator('.grille-attendu').scrollIntoViewIfNeeded();
        await carte(page, 0).locator('.grille-attendu').screenshot({ path: path.join(CAPTURES, `${nom}-${v.width}x${v.height}-${mode}.png`) });
    }
    await page.evaluate(() => document.body.classList.remove('mode-clair'));
}

/** Compose la grille à la main, en création ; rend son id. */
async function composerGrille(page) {
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await expect(page.locator('[data-action="creerNouvelleGrille"]')).toBeVisible();
    await page.locator('[data-action="creerNouvelleGrille"]').tap();
    await page.locator('#nomGrilleTemplate').fill(NOM_GRILLE);
    for (let i = 0; i < CRITERES.length; i++) {
        if (i > 0) await page.locator('#listeCriteres [data-action="ajouterCritereTemp"]').tap();
        const c = CRITERES[i];
        await expect(carte(page, i).locator('select[data-on-change="modifierTypeCritereTempHandler"]')).toHaveValue('holistique');
        await saisir(carte(page, i).locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]'), c.nom);
        await saisir(carte(page, i).locator('input[data-on-change="modifierPonderationCritereTempHandler"]'), c.ponderation);
        await saisir(caseDe(page, i, 'D'), c.D);
        await saisir(caseDe(page, i, 'M'), c.M);
        // La case « Pour vérifier » suit les niveaux, vide et facultative.
        await expect(carte(page, i).locator('.grille-attendu-niveau', { has: page.locator('textarea[data-on-change="modifierQuestionVerificationHandler"]') })
            .locator('strong')).toHaveText('Pour vérifier');
        await expect(question(page, i)).toHaveValue('');
        if (c.question) await saisir(question(page, i), c.question);
    }
    await capturerEditeur(page, 'editeur-creation');
    await page.locator('#btnCreerGrille').tap();
    await expect.poll(async () => (await lesGrilles(page)).filter((g) => g.nom === NOM_GRILLE).length).toBe(1);
    const g = (await lesGrilles(page)).find((x) => x.nom === NOM_GRILLE);
    expect(g.criteres.map((c) => c.descripteurs)).toEqual([
        { echelleId: ID_DEPART, parNiveau: { D: CRITERES[0].D, M: CRITERES[0].M }, pourVerifier: CRITERES[0].question },
        { echelleId: ID_DEPART, parNiveau: { D: CRITERES[1].D, M: CRITERES[1].M } }
    ]);
    return g.id;
}

/** Une production fictive liée à la grille et à l'échelle ; sa fiche ouverte. */
async function lierProduction(page, grilleId) {
    const id = await page.evaluate(async ({ grilleId, echelleId, activite }) => {
        const p = { id: 'PROD_BANC_AUTOEVAL', titre: 'Artefact fictif', activiteApprentissage: activite, type: 'travail', ponderation: 10,
            objectif: 'Développer ta capacité à choisir les stratégies de lecture qu’appelle un texte fictif.',
            tache: 'Annoter un extrait fictif en y appliquant au moins trois stratégies de lecture.',
            detailTache: '', champsPersonnalises: [], grilleId, echelleId, cartoucheId: '', dansBibliotheque: true };
        await db.modifier(cle('productions'), (lues) => (lues || []).filter((x) => x.id !== p.id).concat([p]), []);   // security-ok: banc, production fictive dans un contexte neuf
        await db.flush();
        naviguerVers('conception', 'productions');
        await chargerProductionPourModif(p.id);
        return p.id;
    }, { grilleId, echelleId: ID_DEPART, activite: ACTIVITE });
    await page.waitForFunction(() => {
        const f = document.getElementById('formulaireProduction');
        return f && !f.classList.contains('u-hide');
    });
    return id;
}

async function preparerLePDF(page) {
    const n = await page.evaluate(() => {
        const b = document.querySelector('[data-action="afficherFormulairePDFDepuisProduction"]');
        if (!b) return 0; b.click(); return 1;
    });
    expect(n, 'le bouton « Préparer le PDF » de la fiche').toBe(1);
    await expect.poll(() => page.evaluate(() => document.getElementById('modalApercuPDF').classList.contains('actif'))).toBe(true);
}

const feuilles = (page) => page.locator('#apercuPDF-zone .apercu-pdf-page');

/** Exporte le PDF par le bouton de l'aperçu ; rend le texte de chaque page, relu par PDF.js. */
async function exporterEtLire(page) {
    await page.evaluate(() => { window.__pdfBanc = null; window.jspdf.jsPDF.API.save = function () { window.__pdfBanc = this.output('arraybuffer'); }; });
    await page.locator('#modalApercuPDF [data-action="exporterPDFDepuisApercu"]').tap();
    await page.waitForFunction(() => !!window.__pdfBanc);
    return page.evaluate(async () => {
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(window.__pdfBanc.slice(0)), isEvalSupported: false }).promise;
        const pages = [];
        for (let i = 1; i <= doc.numPages; i++) {
            const contenu = await (await doc.getPage(i)).getTextContent();
            pages.push(contenu.items.map((t) => t.str).join(' ').replace(/\s+/g, ' '));
        }
        return pages;
    });
}

/** La page d'autoévaluation du PDF, rendue en image (ce que contient le fichier). */
async function capturerPagePDF(page, rang, nom) {
    if (!CAPTURES) return;
    const v = page.viewportSize();
    await page.evaluate(async (rang) => {
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(window.__pdfBanc.slice(0)), isEvalSupported: false }).promise;
        const pg = await doc.getPage(rang);
        const vp = pg.getViewport({ scale: 1.5 });
        const c = document.createElement('canvas');
        c.id = 'canevas-banc-pdf'; c.width = vp.width; c.height = vp.height;
        c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;background:#fff;width:' + (vp.width / 2) + 'px';
        document.body.appendChild(c);
        await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    }, rang);
    await page.locator('#canevas-banc-pdf').screenshot({ path: path.join(CAPTURES, `${nom}-${v.width}x${v.height}.png`) });
    await page.evaluate(() => document.getElementById('canevas-banc-pdf').remove());
}

async function scenario(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirApp(page);

    // L'ÉDITEUR : deux critères composés à la main, D et M décrits, une question.
    const grilleId = await composerGrille(page);

    // RECHARGÉE : textes et question à leur place.
    await page.reload();
    await attendreApp(page);
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, grilleId);
    for (let i = 0; i < CRITERES.length; i++) {
        await expect(caseDe(page, i, 'D')).toHaveValue(CRITERES[i].D);
        await expect(caseDe(page, i, 'M')).toHaveValue(CRITERES[i].M);
        await expect(question(page, i)).toHaveValue(CRITERES[i].question || '');
    }
    await capturerEditeur(page, 'editeur-rechargee');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    // « PRÉPARER LE PDF » depuis la fiche de la production : trois feuilles, la deuxième est la grille d'autoévaluation.
    await lierProduction(page, grilleId);
    // PDF.js sans worker séparé (Chromium refuse un worker en file://) : le script du worker, par son URL (CSP 'self').
    await page.addScriptTag({ url: 'libs/pdf.worker.min.js?v=3.11.174' });
    await preparerLePDF(page);
    const caseAutoeval = page.locator('#apercuPDF-autoevaluation');
    await expect(page.locator('#apercuPDF-case-autoevaluation')).toBeVisible();
    await expect(caseAutoeval).toBeChecked();
    await expect(feuilles(page)).toHaveCount(3);
    const feuille = feuilles(page).nth(1);
    await expect(feuille.locator('[data-autoevaluation]')).toHaveCount(1);
    await expect(feuille.locator('h3')).toHaveText(TITRE_PAGE);
    await expect(feuille.locator('[data-introduction-autoeval]')).toHaveText('Avant de remettre ton travail, coche ce que tu trouves dans ta copie. '
        + `Le seuil de réussite correspond au niveau D de l'échelle${NBSP}; le seuil de maîtrise, au niveau M.`);
    const criteres = feuille.locator('[data-critere-autoeval]');
    await expect(criteres).toHaveCount(2);
    for (let i = 0; i < CRITERES.length; i++) {
        const c = CRITERES[i];
        await expect(criteres.nth(i).locator('[data-ligne-autoeval]')).toHaveText([`Réussite${NBSP}: ${c.D}`, `Maîtrise${NBSP}: ${c.M}`]);
        await expect(criteres.nth(i).locator('[data-case-a-cocher]')).toHaveCount(2);
        await expect(criteres.nth(i).locator('[data-question-autoeval]')).toHaveCount(c.question ? 1 : 0);
    }
    await expect(criteres.nth(0).locator('[data-question-autoeval]')).toHaveText(`Pour vérifier${NBSP}: ${CRITERES[0].question}`);
    await expect(criteres.nth(0).locator('[data-question-autoeval]')).toHaveCSS('font-style', 'italic');
    await expect(feuilles(page).nth(0).locator('[data-autoevaluation]')).toHaveCount(0);
    await expect(feuilles(page).nth(2).locator('table')).toHaveCount(1);
    if (CAPTURES) {
        const v = page.viewportSize();
        await feuille.screenshot({ path: path.join(CAPTURES, `apercu-feuille-${v.width}x${v.height}.png`) });
    }

    // LE FICHIER porte la même page, au même rang.
    const pages = await exporterEtLire(page);
    expect(pages).toHaveLength(3);
    const p2 = pages[1];
    expect(p2).toContain('grille d\'autoévaluation');
    expect(p2).toContain('Avant de remettre ton travail, coche ce que tu trouves dans ta copie.');
    for (const c of CRITERES) {
        expect(p2).toContain(c.nom);
        expect(p2).toContain(`${c.D.slice(0, 40)}`);
        expect(p2).toContain(`${c.M.slice(0, 40)}`);
    }
    expect(p2).toContain(`Pour vérifier`);
    expect(p2).toContain(CRITERES[0].question.slice(0, 40));
    expect(pages[0]).not.toContain('autoévaluation');
    expect(pages[2]).not.toContain('autoévaluation');
    await capturerPagePDF(page, 2, 'pdf-page-autoevaluation');

    // L'export ferme l'aperçu (comportement d'avant le lot) : « Préparer le PDF » de nouveau, la case revient cochée.
    await expect.poll(() => page.evaluate(() => document.getElementById('modalApercuPDF').classList.contains('actif'))).toBe(false);
    await preparerLePDF(page);
    await expect(caseAutoeval).toBeChecked();
    await expect(feuilles(page)).toHaveCount(3);

    // LA CASE DÉCOCHÉE retire la feuille de l'aperçu, et la page du fichier.
    await caseAutoeval.tap();
    await expect(caseAutoeval).not.toBeChecked();
    await expect(feuilles(page)).toHaveCount(2);
    await expect(page.locator('#apercuPDF-zone [data-autoevaluation]')).toHaveCount(0);
    await expect(page.locator('#apercuPDF-case-autoevaluation'), 'la case reste là pour la remettre').toBeVisible();
    const sans = await exporterEtLire(page);
    expect(sans).toHaveLength(2);
    expect(sans.join(' ')).not.toContain('autoévaluation');

    // Rouvert : cochée par défaut, la page revient.
    await preparerLePDF(page);
    await expect(caseAutoeval).toBeChecked();
    await expect(feuilles(page)).toHaveCount(3);

    expect(erreurs).toEqual([]);
}

test.describe('iPad en long', () => {
    test.use({ hasTouch: true, viewport: { width: 1180, height: 820 } });
    test('autoévaluation · une grille composée à la main, rechargée ; « Préparer le PDF » : la page dans l’aperçu et dans le fichier ; la case la retire', async ({ page }) => {
        test.setTimeout(120000);
        await scenario(page);
    });
});

test.describe('iPad en haut', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });
    test('autoévaluation · une grille composée à la main, rechargée ; « Préparer le PDF » : la page dans l’aperçu et dans le fichier ; la case la retire', async ({ page }) => {
        test.setTimeout(120000);
        await scenario(page);
    });
});
