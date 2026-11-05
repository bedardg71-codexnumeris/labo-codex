import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #1231 — RÉUNIR PLUSIEURS FICHIERS EN UNE COPIE AVANT L'IMPORT (5 nov. 2026)
// =======================================================================
//
// Vécu par Grégoire (Mac, Chrome, 1.233.0) : trois photos d'une reprise, sans DA dans
// leur nom, l'élève et le « Jeton de reprise » choisis dans l'inspecteur. L'import a
// créé TROIS copies d'une page ; une seule a été rattachée à l'évaluation de reprise.
// Critère de Grégoire : après l'import, aucun passage par « Modifier ».
//
// Le banc fait le parcours par le geste, dans « Préparer et importer » : cocher les
// trois photos dans « Originaux », « Réunir en une copie », régler l'ordre aux flèches,
// poser l'élève et le jeton (ou une production habituelle) dans l'inspecteur, une
// pipette sur une page, confirmer, importer. Puis il relit LE STOCK : un seul fichier,
// rattaché, aucun orphelin, un PDF de trois pages dans l'ordre réglé, la pipette dedans.
//
// Ce qui n'est pas le vrai : le stockage des blobs est une mémoire du banc (WebKit refuse
// les blobs en IndexedDB sous file://, cf. #1230) ; le dépôt des photos passe par
// `ajouterFichiersEnAttente` (la porte du glisser-déposer) ; `skipBalance` est posé par
// le banc sur les deux pages teintées, pour que la balance AUTOMATIQUE de l'import ne
// fasse pas le travail de la pipette (sans quoi la preuve ne départagerait rien) ; la
// proposition de codex d'un jeton est acceptée d'office. Noms fictifs (règle 6) : les
// élèves sont ceux de la démonstration.
//
// Contre-épreuves (skill verification-adverse) : la page C, teintée comme la B mais sans
// pipette, reste teintée ; sans « Réunir », le même lot crée trois copies (le défaut).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancher(page) {
    const etat = { erreurs: [], dialogues: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('dialog', (d) => { etat.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    return etat;
}

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

/**
 * Choisit dans la démonstration : un élève du groupe actif dont une production a une
 * évaluation active et aucun jeton (la reprise), et une production sans copie ni
 * évaluation pour un autre élève (la copie habituelle). Branche le stockage mémoire.
 */
async function preparerLeTerrain(page) {
    return page.evaluate(async () => {
        window.__blobs = new Map();
        travauxStockage.stockerBlob = async (cleBlob, blob) => { window.__blobs.set(cleBlob, blob); };
        travauxStockage.recupererBlob = async (cleBlob) => window.__blobs.get(cleBlob) || null;
        if (typeof Codex !== 'undefined') Codex.proposerAvantSuppression = async () => true;

        const productions = obtenirDonneesSelonMode('productions') || [];
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const fichiers = travauxStockage.obtenirFichiersGroupeActif() || [];
        const reprise = evaluations.find((e) => e && e.etudiantDA && !e.remplaceeParId && !e.jetonRepriseApplique
            && travauxImport.trouverEtudiantParDA(e.etudiantDA)
            && productions.some((p) => p.id === e.productionId)
            && !evaluations.some((x) => x.etudiantDA === e.etudiantDA && x.productionId === e.productionId && x.jetonRepriseApplique));
        const etudiants = (obtenirDonneesSelonMode('groupeEtudiants') || []).filter((e) => travauxImport.trouverEtudiantParDA(e.da));
        let habituelle = null;
        for (const etu of etudiants) {
            if (reprise && etu.da === reprise.etudiantDA) continue;
            const p = productions.find((pr) => !evaluations.some((x) => x.etudiantDA === etu.da && x.productionId === pr.id)
                && !fichiers.some((f) => f.etudiantDA === etu.da && f.productionId === pr.id));
            if (p) { habituelle = { da: etu.da, productionId: p.id, titre: p.titre || p.nom || p.id }; break; }
        }
        const prodReprise = reprise ? productions.find((p) => p.id === reprise.productionId) : null;
        afficherSection('evaluations');
        afficherSousSection('evaluations-importer');
        return {
            reprise: reprise ? { da: reprise.etudiantDA, productionId: reprise.productionId, evalId: reprise.id, titre: prodReprise.titre || prodReprise.nom } : null,
            habituelle
        };
    });
}

/**
 * Dépose trois photos sans DA : A (blanche), B et C (papier teinté bleu). Un carré rouge
 * marque chaque page à un coin différent : A en haut à gauche, B en haut à droite,
 * C en bas à gauche. B et C ne passent pas par la balance automatique (voir l'en-tête).
 */
async function deposerTroisPhotos(page) {
    await page.waitForFunction(() => !!document.getElementById('evaluations-contenu-import'));
    await page.waitForTimeout(2000);
    await page.evaluate(async () => {
        const photo = async (fond, coin) => {
            const c = document.createElement('canvas');
            c.width = 600; c.height = 780;
            const ctx = c.getContext('2d');
            ctx.fillStyle = fond; ctx.fillRect(0, 0, 600, 780);
            ctx.fillStyle = '#e00000';
            const x = coin.includes('droite') ? 460 : 40;
            const y = coin.includes('bas') ? 640 : 40;
            ctx.fillRect(x, y, 100, 100);
            return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
        };
        const teinte = '#b4c3eb';
        const blobs = [await photo('#ffffff', 'haut gauche'), await photo(teinte, 'haut droite'), await photo(teinte, 'bas gauche')];
        travauxImport.viderFileDAttente();
        const t = Date.UTC(2026, 10, 5, 9, 0, 0);
        travauxImport.ajouterFichiersEnAttente(blobs.map((b, i) => new File([b], 'IMG_88' + (48 + i) + '.jpg', { type: 'image/jpeg', lastModified: t + i * 1000 })));
        const file = travauxImport.obtenirFileDAttente();
        file[1].skipBalance = true;
        file[2].skipBalance = true;
        travauxUI.afficherImport();
    });
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(3);
}

/** Les cases, « Réunir en une copie », puis C monte d'un cran : ordre A, C, B. */
async function reunirEtOrdonner(page) {
    const bouton = page.locator('.pipeline-btn-reunir');
    await expect(bouton).toBeDisabled();
    for (let i = 0; i < 3; i++) {
        await page.locator('.pipeline-case-reunir').nth(i).click();
        await page.waitForTimeout(250);
    }
    await expect(bouton).toBeEnabled();
    await bouton.click();
    await expect(page.locator('.pipeline-groupe-encadre')).toHaveCount(1);
    await expect(page.locator('.pipeline-groupe-encadre .pipeline-fichier-ligne')).toHaveCount(3);
    // La copie s'ouvre dans l'inspecteur, comme UNE copie.
    await expect(page.locator('.pipeline-centre-preview')).toContainText('Copie de 3 fichiers');
    // C (3e) monte : il reste dans la copie. Puis la flèche « Monter » de A (1re de sa copie) est fermée.
    await page.locator('[data-action="travauxUI.monterFichierPipeline"][data-param="2"]').click();
    await page.waitForTimeout(400);
    const noms = await page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => f.nomFichier));
    expect(noms).toEqual(['IMG_8848.jpg', 'IMG_8850.jpg', 'IMG_8849.jpg']);
    await expect(page.locator('[data-action="travauxUI.monterFichierPipeline"][data-param="0"]')).toBeDisabled();
}

/** La pipette sur la page B (3e de la file) : le bouton, la ligne, la cible, un toucher, confirmer. */
async function pipetteSurB(page) {
    await page.locator('.pipeline-fichier-ligne').nth(2).click();
    await page.waitForTimeout(500);
    await page.locator('[data-action="travauxUI.ouvrirPreparationFichier"]').click();
    await page.locator('#prep-btn-confirmer').waitFor({ state: 'visible' });
    await expect(page.locator('#prep-balance-consigne')).toBeHidden();
    await expect(page.locator('#prep-btn-balance img[src="icons/icon-pipette.svg"]')).toHaveCount(1);
    await page.locator('#prep-btn-balance').click();
    await expect(page.locator('#prep-balance-consigne')).toBeVisible();
    await expect(page.locator('#prep-balance-consigne')).toHaveText('Touche une zone blanche de la feuille.');
    const curseur = await page.locator('#prep-canvas-overlay').evaluate((el) => el.style.cursor);
    expect(curseur).toContain('curseur-cible.svg');
    // Au centre-bas de l'image, sur le papier (la palette flotte en haut à gauche).
    const boite = await page.locator('#prep-canvas-overlay').boundingBox();
    await page.locator('#prep-canvas-overlay').click({ position: { x: boite.width * 0.6, y: boite.height * 0.6 } });
    await expect(page.locator('#prep-balance-consigne')).toBeHidden();
    await page.locator('#prep-btn-confirmer').click();
    await page.waitForTimeout(800);
}

/** L'élève (par son DA) et la production — ou le jeton — sur la copie, dans l'inspecteur. */
async function poserEleveEtProduction(page, da, productionId, reprise) {
    await page.locator('.pipeline-fichier-ligne').nth(0).click();
    await page.waitForTimeout(500);
    const champ = page.locator('.pipeline-input-etudiant');
    await champ.click();
    await champ.fill(da);
    const item = page.locator(`.pipeline-autocomplete-item[data-param2="${da}"]`);
    await item.waitFor({ state: 'visible' });
    await item.dispatchEvent('mousedown');
    if (reprise) {
        await page.locator('select[data-on-change="travauxUI.changerProductionPipeline"]').selectOption('__jeton_reprise__');
        await page.waitForTimeout(400);
        await page.locator('select[data-on-change="travauxUI.changerJetonProductionPipeline"]').selectOption(productionId);
    } else {
        await page.locator('select[data-on-change="travauxUI.changerProductionPipeline"]').selectOption(productionId);
    }
    await page.waitForTimeout(400);
    const file = await page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => ({ da: f.etudiantDA, p: f.productionId, r: !!f.estReprise })));
    expect(file).toEqual([0, 1, 2].map(() => ({ da, p: productionId, r: !!reprise })));
}

/** « Importer », la confirmation lue, « Oui, importer », puis l'attente de la fin. */
async function confirmerEtImporter(page, titreProduction, reprise) {
    await page.locator('[data-action="travauxUI.appliquerEtImporter"]').click();
    const modale = page.locator('.modal-contenu').filter({ hasText: 'Confirmer' }).last();
    await modale.waitFor({ state: 'visible' });
    await expect(modale).toContainText('1 copie(s) seront créées');
    const lignes = modale.locator('.pipeline-confirmation-copies li');
    await expect(lignes).toHaveCount(1);
    await expect(lignes.first()).toContainText(titreProduction + (reprise ? ', reprise' : '') + ' – 3 pages');
    await expect(lignes.first()).not.toContainText('élève non choisi');
    await expect(modale.locator('.travaux-bandeau-doublon')).toHaveCount(0);
    await expect(modale.locator('.travaux-bandeau-sans-da')).toHaveCount(0);
    await modale.locator('button', { hasText: 'Oui, importer' }).click();
    await page.waitForFunction(() => travauxImport.obtenirFileDAttente().length === 0 && !travauxImport.importEnCours, null, { timeout: 60000 });
    await page.waitForTimeout(1500);
}

/** Les copies stockées de (élève, production), et le PDF de la plus récente, relu page par page. */
async function lireLeStock(page, da, productionId) {
    return page.evaluate(async ([da, productionId]) => {
        const copies = (travauxStockage.obtenirFichiersGroupeActif() || [])
            .filter((f) => f.etudiantDA === da && f.productionId === productionId);
        const neuve = copies.filter((f) => f.nomFichier && f.nomFichier.startsWith('IMG_88'));
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const repriseEval = evaluations.find((e) => e.etudiantDA === da && e.productionId === productionId && e.jetonRepriseApplique && !e.remplaceeParId);
        const lecture = { pages: 0, rendu: [] };
        if (neuve.length === 1) {
            const blob = await travauxStockage.recupererBlob(neuve[0].id);
            const pdf = await pdfjsLib.getDocument({ data: await blob.arrayBuffer() }).promise;
            lecture.pages = pdf.numPages;
            for (let n = 1; n <= pdf.numPages; n++) {
                const p = await pdf.getPage(n);
                const base = p.getViewport({ scale: 1 });
                const vp = p.getViewport({ scale: 300 / base.width });
                const c = document.createElement('canvas');
                c.width = Math.round(vp.width); c.height = Math.round(vp.height);
                await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
                const ctx = c.getContext('2d');
                const px = (fx, fy) => Array.from(ctx.getImageData(Math.round(fx * c.width), Math.round(fy * c.height), 1, 1).data.slice(0, 3));
                const rouge = (d) => d[0] > 150 && d[1] < 90 && d[2] < 90;
                const coin = rouge(px(0.15, 0.1)) ? 'haut gauche' : rouge(px(0.85, 0.1)) ? 'haut droite' : rouge(px(0.15, 0.9)) ? 'bas gauche' : '?';
                lecture.rendu.push({ coin, fond: px(0.5, 0.5) });
            }
        }
        return {
            nbCopies: copies.length,
            neuves: neuve.map((f) => ({ id: f.id, estReprise: !!f.estReprise, evaluationId: f.evaluationId || null })),
            repriseEvalId: repriseEval ? repriseEval.id : null,
            orphelines: copies.filter((f) => f.estReprise && !f.evaluationId).length,
            lecture
        };
    }, [da, productionId]);
}

/** Un fond « blanc » : clair et neutre. Teinté : le bleu domine nettement le rouge. */
const estBlanc = (rgb) => rgb.every((v) => v > 225) && Math.max(...rgb) - Math.min(...rgb) < 20;
const estTeinte = (rgb) => rgb[2] - rgb[0] > 30;

test.describe('#1231 — réunir les fichiers d\'une copie avant l\'import', () => {
    test.setTimeout(240000);

    test('une reprise en trois photos : une copie, rattachée au jeton, trois pages dans l\'ordre réglé, la pipette dedans', async ({ page }) => {
        const etat = brancher(page);
        await demarrer(page);
        const terrain = await preparerLeTerrain(page);
        expect(terrain.reprise, 'la démonstration offre une évaluation à reprendre').not.toBeNull();
        const { da, productionId, evalId, titre } = terrain.reprise;
        const avant = await lireLeStock(page, da, productionId);

        await deposerTroisPhotos(page);
        await reunirEtOrdonner(page);
        await pipetteSurB(page);
        await poserEleveEtProduction(page, da, productionId, true);
        await confirmerEtImporter(page, titre, true);

        const apres = await lireLeStock(page, da, productionId);
        expect(apres.nbCopies, 'UN fichier de plus pour cet élève et cette production').toBe(avant.nbCopies + 1);
        expect(apres.neuves).toHaveLength(1);
        expect(apres.neuves[0].estReprise).toBe(true);
        expect(apres.repriseEvalId, 'le jeton a créé l\'évaluation de reprise').not.toBeNull();
        expect(apres.repriseEvalId).not.toBe(evalId);
        expect(apres.neuves[0].evaluationId, 'la copie est rattachée à l\'évaluation de reprise').toBe(apres.repriseEvalId);
        expect(apres.orphelines, 'aucune copie de reprise orpheline').toBe(0);
        expect(apres.lecture.pages).toBe(3);
        expect(apres.lecture.rendu.map((r) => r.coin), 'l\'ordre réglé aux flèches : A, C, B').toEqual(['haut gauche', 'bas gauche', 'haut droite']);
        expect(estBlanc(apres.lecture.rendu[2].fond), `B, passée à la pipette, est blanche : ${apres.lecture.rendu[2].fond}`).toBe(true);
        expect(estTeinte(apres.lecture.rendu[1].fond), `contre-épreuve : C, sans pipette, reste teintée : ${apres.lecture.rendu[1].fond}`).toBe(true);
        expect(etat.erreurs, etat.erreurs.join(' | ')).toEqual([]);
    });

    test('une production habituelle en trois photos : une copie de trois pages, aucun doublon', async ({ page }) => {
        const etat = brancher(page);
        await demarrer(page);
        const terrain = await preparerLeTerrain(page);
        expect(terrain.habituelle, 'la démonstration offre une production sans copie').not.toBeNull();
        const { da, productionId, titre } = terrain.habituelle;

        await deposerTroisPhotos(page);
        await reunirEtOrdonner(page);
        await poserEleveEtProduction(page, da, productionId, false);
        await confirmerEtImporter(page, titre, false);

        const apres = await lireLeStock(page, da, productionId);
        expect(apres.nbCopies).toBe(1);
        expect(apres.neuves).toHaveLength(1);
        expect(apres.neuves[0].estReprise).toBe(false);
        expect(apres.lecture.pages).toBe(3);
        expect(apres.lecture.rendu.map((r) => r.coin)).toEqual(['haut gauche', 'bas gauche', 'haut droite']);
        expect(etat.erreurs, etat.erreurs.join(' | ')).toEqual([]);
    });

    test('une copie réunie survit au rechargement de la page, même avec un fichier au nom Léa', async ({ page }) => {
        const etat = brancher(page);
        await demarrer(page);
        const terrain = await preparerLeTerrain(page);
        const da = (terrain.reprise || terrain.habituelle).da;
        await page.waitForFunction(() => !!document.getElementById('evaluations-contenu-import'));
        const cles = await page.evaluate(async (da) => {
            const octets = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
            travauxImport.viderFileDAttente();
            travauxImport.ajouterFichiersEnAttente([
                new File([octets], 'IMG_8848.pdf', { type: 'application/pdf' }),
                new File([octets], 'Essai_' + da + '_Artefact-6_Remis_le_2026-11-05_09h00m00s.pdf', { type: 'application/pdf' }),
                new File([octets], 'IMG_8850.pdf', { type: 'application/pdf' })
            ]);
            travauxUI.afficherImport();
            return travauxImport.obtenirFileDAttente().map((f) => f.groupeDocumentId);
        }, da);
        expect(cles[1], 'le nom Léa a sa propre clé au dépôt').toBeTruthy();
        await page.waitForTimeout(500);
        for (let i = 0; i < 3; i++) {
            await page.locator('.pipeline-case-reunir').nth(i).click();
            await page.waitForTimeout(250);
        }
        await page.locator('.pipeline-btn-reunir').click();
        await expect(page.locator('.pipeline-groupe-encadre .pipeline-fichier-ligne')).toHaveCount(3);
        const avant = await page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => f.groupeDocumentId));

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForFunction(() => window.travauxImport && travauxImport.obtenirFileDAttente().length === 3, null, { timeout: 30000 });
        const apres = await page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => f.groupeDocumentId));
        expect(new Set(avant).size).toBe(1);
        expect(apres).toEqual(avant);
        await page.evaluate(() => { afficherSection('evaluations'); afficherSousSection('evaluations-importer'); });
        await expect(page.locator('.pipeline-groupe-encadre .pipeline-fichier-ligne')).toHaveCount(3, { timeout: 15000 });
        expect(etat.erreurs, etat.erreurs.join(' | ')).toEqual([]);
    });

    test('contre-épreuve : sans « Réunir », les mêmes trois photos font trois copies (le défaut vécu)', async ({ page }) => {
        brancher(page);
        await demarrer(page);
        const terrain = await preparerLeTerrain(page);
        const { da, productionId } = terrain.habituelle;
        await deposerTroisPhotos(page);
        await page.evaluate(([da, productionId]) => {
            travauxImport.obtenirFileDAttente().forEach((f) => Object.assign(f, { etudiantDA: da, etudiantAssocie: travauxImport.trouverEtudiantParDA(da), productionId, productionIdParFichier: true }));
        }, [da, productionId]);
        expect(await page.evaluate(() => travauxImport.regrouperParDocument().size)).toBe(3);
        expect(await page.evaluate(() => travauxImport.detecterDoublonsStockage().length)).toBe(2);
    });
});
