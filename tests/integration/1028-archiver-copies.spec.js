import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #1028 — ARCHIVER LES COPIES D'UN TRIMESTRE CLOS, LE GESTE DE L'ÉCRAN (5 oct. 2026)
// =======================================================================
//
// Le trajet de la consigne de Cowork (5 oct., 9 h 02, point 4), dans la vraie page, sous WebKit,
// à la largeur d'un iPad en portrait. L'espace d'E3 : un trimestre en cours (a2032) et un
// trimestre clos fictif h2032 (copies dont une à la corbeille, une vignette, une annotation).
//
//   1. ARCHIVER h2032 (E1), le VÉRIFIER par le vrai bouton ;
//   2. « Archiver les copies… » par le vrai menu ⋮, le vrai sélecteur, la vraie fenêtre, le bilan ;
//      → les fichiers et la vignette partent, rien d'autre ;
//   3. « Archiver le trimestre… » refuse (point 4 b) ;
//   4. h2032 activé : chaque lecteur du fichier d'une copie, sans plantage (visionneuse, badge,
//      export PDF, aperçu, « Dossier PDF », éditeur de pages, export des travaux, codex) ;
//   5. a2032 de nouveau actif ; « Faire revenir » par le vrai bouton de la ligne de l'archive
//      → chaque fichier égal à l'avant, la marque levée ;
//   6. (second test) un arrêt provoqué au milieu, puis la reprise depuis le même menu.
//
// Le détail (ordre, refus, mutations, E3 après le geste) est jugé par Vitest
// (sentinelle-1028-archiver-copies). Noms fictifs.

const IPAD_PORTRAIT = { width: 820, height: 1180 };
const COPIES_H = ['FT_h1', 'FT_h2', 'FT_hc'];

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const alertes = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m)) || /\[Archives\] Archivage des copies interrompu/.test(m);
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => { alertes.push(d.message()); d.accept().catch(() => {}); });
    return { erreurs, alertes };
}

/** Le magasin des copies en mémoire (WebKit éphémère refuse un Blob dans IndexedDB). */
async function monterMagasin(page, ids) {
    await page.evaluate(async (ids) => {
        window.__copies = new Map();
        window.__refuserRetrait = null;
        db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
        db.getBlob = async (id) => window.__copies.get(id) || null;
        db.deleteBlob = async (id) => {
            if (window.__refuserRetrait && window.__refuserRetrait(id)) throw new Error('retrait refusé (banc)');
            window.__copies.delete(id);
        };
        db.listBlobIds = async () => [...window.__copies.keys()];
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        const toutes = { FT_h1: [120000, 1, '0000001'], FT_h2: [64000, 2, '0000009'], FT_hc: [9000, 3, '0000002'], FT_a1: [5000, 4, '0000009'] };
        for (const id of ids) await travauxStockage.stockerBlob(id, new Blob([octets(toutes[id][0], toutes[id][1])], { type: 'application/pdf' }), toutes[id][2], '');
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
        window.FichierSortant.confirmerTelechargement = async () => true;
        window.__notifications = [];
        const info = notifications.info;
        notifications.info = (t, d) => { window.__notifications.push([t, d]); return info(t, d); };
    }, ids);
}

async function poserEspace(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
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
    await page.evaluate(async () => {
        const ecrire = (k, v) => db.setSync(k, v);
        ecrire('trimestres', [
            { id: 'a2032', nom: 'Automne 2032', actif: true },
            { id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }
        ]);
        ecrire('trimestreActif', 'a2032');
        ecrire('backupNePlusRappeler', 'true'); // le rappel de sauvegarde masquerait l'écran (a2032 a une copie)
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' });
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }]);
        ecrire('h2032_groupeEtudiants', [
            { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
            { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
            { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
        ]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', productionId: 'P1', note: 80 }]);
        ecrire('h2032_productions', [{ id: 'P1', titre: 'Production fictive', coursId: 'C1' }]);
        ecrire('h2032_annotationsTravaux', [{ id: 'AN1', fichierId: 'FT_h1', pages: { 1: [] } }]);
        ecrire('h2032_fichiersTravaux', [
            { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: 'GC_H1', tailleFichier: 120000, typeMIME: 'application/pdf' },
            { id: 'FT_h2', nomFichier: 'copie-deux.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H2', tailleFichier: 64000, typeMIME: 'application/pdf' }
        ]);
        ecrire('h2032_corbeilleFichiers', [
            { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000002', groupeCoursId: 'GC_H2', tailleFichier: 9000, dateSuppression: '2032-03-01T00:00:00.000Z' }
        ]);
        ecrire('seancesCompletes_gc_GC_H1', [{ id: 'S1' }]);
        ecrire('thumbnail_FT_h1', 'data:image/png;base64,AAAA');
        ecrire('thumbnail_FT_a1', 'data:image/png;base64,CCCC');
        ecrire('a2032_groupesCours', [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('a2032_groupeEtudiants', [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }]);
        ecrire('a2032_fichiersTravaux', [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1', typeMIME: 'application/pdf' }]);
        await db.flush();
    });
    await page.waitForTimeout(800);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    await monterMagasin(page, ['FT_h1', 'FT_h2', 'FT_hc', 'FT_a1']);
}

async function photo(page) {
    return page.evaluate(async () => {
        const cles = {};
        for (const k of await db.keys()) cles[k] = JSON.stringify(await db.get(k));
        const copies = {};
        for (const id of await db.listBlobIds()) {
            const b = await travauxStockage.recupererBlob(id);
            const u8 = new Uint8Array(await b.arrayBuffer());
            let h = 0; for (let i = 0; i < u8.length; i++) h = (h * 31 + u8[i]) >>> 0;
            copies[id] = b.size + ':' + h;
        }
        return { cles, copies };
    });
}

function sauf(cles, exclues) {
    const r = {};
    for (const k of Object.keys(cles)) if (!exclues.includes(k)) r[k] = cles[k];
    return r;
}

async function lireFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 30000 });
    const titre = await fenetre.locator('#ui-dialogue-titre').innerText();
    const message = await fenetre.locator('.modal-section').innerText();
    return { fenetre, titre, message };
}

async function attendreFenetre(page, titre) {
    await expect(page.locator('#ui-dialogue-titre')).toHaveText(titre, { timeout: 30000 });
    return lireFenetre(page);
}

async function fermerFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await fenetre.locator('.modal-actions button').first().click();
    await expect(fenetre).toHaveCount(0);
}

async function archiverEtVerifier(page, dossierTmp) {
    await page.evaluate(() => { window.__archive = null; });
    await page.evaluate(() => ReserveTrimestre.archiverTrimestre('h2032', { sansConfirmation: true }));
    await page.waitForFunction(() => window.__archive && window.__archive.blob, null, { timeout: 30000 });
    const rendu = await page.evaluate(async () => {
        const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
        let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return { base64: btoa(s), nom: window.__archive.nom };
    });
    const fichier = path.join(dossierTmp, rendu.nom);
    writeFileSync(fichier, Buffer.from(rendu.base64, 'base64'));
    await page.evaluate(() => ReserveReglages.rafraichir());
    const attente = page.waitForEvent('filechooser');
    await page.evaluate(() => document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="h2032-trimestre"]').click());
    await (await attente).setFiles(fichier);
    expect((await lireFenetre(page)).titre).toBe('Archive vérifiée');
    await fermerFenetre(page);
    return fichier;
}

async function ouvrirArchives(page) {
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    const accordeon = page.locator('#accordeon-reserve');
    if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').click();
    await page.waitForTimeout(300);
}

/** Le menu ⋮ de la carte h2032 : « Archiver les copies… », puis le fichier. */
async function archiverCopiesParLeMenu(page, fichier) {
    await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
    const modale = page.locator('#modalBibliothequeTrimestres');
    await expect(modale).toBeVisible();
    const geste = modale.locator('[data-action="ReserveCopies.actionArchiverCopies"]');
    await expect(geste).toHaveCount(1);
    await expect(geste).toHaveAttribute('data-param', 'h2032');
    await modale.locator('[data-param="biblio-menu-h2032"]').click();
    await expect(geste).toBeVisible();
    await expect(geste).toHaveText('Archiver les copies…');
    const boite = await geste.boundingBox();
    expect(boite.x).toBeGreaterThanOrEqual(0);
    expect(boite.x + boite.width).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
    const attente = page.waitForEvent('filechooser');
    await geste.click();
    await (await attente).setFiles(fichier);
}

async function activer(page, trimestre, copiesPresentes) {
    await page.evaluate((t) => changerTrimestreActifV2(t), trimestre);
    await page.waitForTimeout(1500);
    await page.evaluate(() => db.flush());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await monterMagasin(page, copiesPresentes);
}

test.describe('#1028 — « Archiver les copies » d\'un trimestre clos (mode fichier, largeur iPad)', () => {
    test.setTimeout(300000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('l\'aller-retour, le refus d\'E1, chaque lecteur sans plantage, puis « Faire revenir »', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs, alertes } = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-1028');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            // 1. Archiver, vérifier.
            const fichier = await archiverEtVerifier(page, dossierTmp);
            const avant = await photo(page);

            // 2. Archiver les copies par le vrai menu ; la fenêtre ; le bilan.
            await archiverCopiesParLeMenu(page, fichier);
            let f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            expect(f.message).toContain('3 copies quitteront l\'application, environ 188,5 Ko.\n');
            expect(f.message).toContain('Toutes les données de Hiver 2032 restent dans l\'application : résultats des étudiant·es et du groupe, grilles, rétroactions. Les annotations restent aussi, mais ne se voient qu\'avec leur copie.');
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            test.info().annotations.push({ type: 'fenêtre', description: f.message });
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver les copies' }).click();
            f = await attendreFenetre(page, 'Les copies de Hiver 2032 sont aux archives');
            expect(f.message).toContain('3 copies retirées. Ton prochain codex sera plus léger d\'environ 188,5 Ko.\n');
            test.info().annotations.push({ type: 'bilan', description: f.message });
            await fermerFenetre(page);

            const apres = await photo(page);
            expect(Object.keys(apres.copies)).toEqual(['FT_a1']);
            expect(apres.cles.thumbnail_FT_h1).toBeUndefined();
            expect(sauf(apres.cles, ['_copiesAuxArchives'])).toEqual(sauf(avant.cles, ['thumbnail_FT_h1']));
            expect(Object.keys(JSON.parse(apres.cles._copiesAuxArchives).h2032.ids).sort()).toEqual(COPIES_H);

            // 3. « Archiver le trimestre… » refuse, et le dit.
            await page.evaluate(() => { window.__archive = null; ReserveTrimestre.actionArchiver('h2032'); });
            f = await attendreFenetre(page, 'Trimestre non archivé');
            expect(f.message).toContain('Les copies de Hiver 2032 sont aux archives : une nouvelle archive ne les contiendrait pas, et elle remplacerait celle qui les garde.');
            await fermerFenetre(page);
            expect(await page.evaluate(() => window.__archive)).toBeNull();

            // 4. h2032 activé : les lecteurs.
            await activer(page, 'h2032', ['FT_a1']);
            const lecteurs = await page.evaluate(async () => {
                const r = {};
                r.ouverte = await travauxVisionneuse.ouvrirFichier('FT_h1');
                r.fichierActuel = travauxVisionneuse.getFichierActuel() && travauxVisionneuse.getFichierActuel().id;
                r.auxArchives = travauxVisionneuse.estOuvertAuxArchives();
                return r;
            });
            expect(lecteurs).toEqual({ ouverte: true, fichierActuel: 'FT_h1', auxArchives: true });
            // Export du PDF annoté : la fenêtre dit « aux archives ».
            await page.evaluate(() => travauxExportPDF.exporterPDF('FT_h1'));
            await expect.poll(() => alertes.length).toBeGreaterThan(0);
            expect(alertes.at(-1)).toContain('Cette copie est aux archives.');
            // L'aperçu du PDF.
            await page.evaluate(() => travauxExportPDF.previsualiserPDF('FT_h1'));
            await expect(page.locator('.preview-pdf-chargement')).toHaveText('Cette copie est aux archives.');
            // « Dossier PDF » : la synthèse seule, et il le dit.
            await page.evaluate(() => travauxExportPDF.exporterDossierComplet('0000001', 'P1').catch((e) => { window.__dossierErreur = String(e); }));
            await expect.poll(() => page.evaluate(() => window.__notifications.map((n) => n[1]).join('|'))).toContain('le dossier ne contient que la synthèse');
            // L'éditeur de pages : refusé (la fusion effaçait une copie sans fichier).
            const nAlertes = alertes.length;
            await page.evaluate(() => travauxUI.ouvrirEditeurPages && travauxUI.ouvrirEditeurPages('FT_h1'));
            if (await page.evaluate(() => typeof travauxUI.ouvrirEditeurPages === 'function')) {
                await expect.poll(() => alertes.length).toBeGreaterThan(nAlertes);
                expect(alertes.at(-1)).toBe('Cette copie est aux archives : fais-la revenir avant de modifier ses pages.');
            }
            // Le codex : les copies aux archives ne sont pas « manquantes ».
            const codex = await page.evaluate(async () => {
                let averti = null;
                const r = await Codex.generer({ confirmerCopiesManquantes: async (m, a) => { averti = [m, a]; return true; } });
                return { averti, copies: r && r.manifeste && r.manifeste.contenu.nombreFichiersTravaux };
            });
            expect(codex).toEqual({ averti: null, copies: 1 });
            test.info().annotations.push({ type: 'alertes vues', description: alertes.join(' ⏐ ') });

            // 5. a2032 de nouveau actif ; « Faire revenir » par la ligne de l'archive.
            await activer(page, 'a2032', ['FT_a1']);
            await ouvrirArchives(page);
            await page.evaluate(() => ReserveReglages.rafraichir());
            const ligne = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' });
            await expect(ligne.locator('[data-action="ReserveEmprunter.actionEmprunter"]')).toHaveCount(0);
            const bouton = ligne.locator('[data-action="ReserveRevenir.actionFaireRevenir"]');
            await expect(bouton).toHaveText('Faire revenir');
            const attente = page.waitForEvent('filechooser');
            await bouton.click();
            await (await attente).setFiles(fichier);
            f = await attendreFenetre(page, 'Faire revenir les copies');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Faire revenir' }).click();
            f = await attendreFenetre(page, 'Copies revenues');
            test.info().annotations.push({ type: 'retour', description: f.message });
            expect(f.message).toContain('3 copies revenues');
            await fermerFenetre(page);
            const retour = await photo(page);
            for (const id of COPIES_H) expect([id, retour.copies[id]]).toEqual([id, avant.copies[id]]);
            expect(retour.cles._copiesAuxArchives).toBeUndefined();
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });

    test('un arrêt au milieu, puis la reprise depuis le même menu', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs } = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-1028b');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            const fichier = await archiverEtVerifier(page, dossierTmp);
            await page.evaluate(() => { let n = 0; window.__refuserRetrait = () => ++n === 2; });
            await archiverCopiesParLeMenu(page, fichier);
            let f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver les copies' }).click();
            f = await attendreFenetre(page, 'Archivage des copies inachevé');
            test.info().annotations.push({ type: 'interrompu', description: f.message });
            expect(f.message).toContain('Pour finir : relance « Archiver les copies… » depuis le menu ⋮ de Hiver 2032.');
            await fermerFenetre(page);
            expect(Object.keys((await photo(page)).copies).sort()).toEqual(['FT_a1', 'FT_h2', 'FT_hc']);
            await page.evaluate(() => { window.__refuserRetrait = null; });
            await archiverCopiesParLeMenu(page, fichier);
            f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            expect(f.message).toContain('2 copies quitteront');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver les copies' }).click();
            await attendreFenetre(page, 'Les copies de Hiver 2032 sont aux archives');
            await fermerFenetre(page);
            expect(Object.keys((await photo(page)).copies)).toEqual(['FT_a1']);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
    // Consigne de livraison (Cowork, 5 oct., 10 h 10, point 3) : « Rouvrir » un trimestre dont les
    // copies sont aux archives. Mesuré : il est rouvert ; la marque n'y est pas touchée.
    // Exigé : rien n'est perdu, les copies restent « aux archives » (jamais « manquantes »), et
    // « Archiver le trimestre… » refuse tant qu'elles ne sont pas revenues.
    test('« Rouvrir » un trimestre dont les copies sont aux archives : rien de perdu, toujours « aux archives », E1 refuse, « Faire revenir » les ramène', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs } = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-1028r');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            const fichier = await archiverEtVerifier(page, dossierTmp);
            const avant = await photo(page);
            await archiverCopiesParLeMenu(page, fichier);
            let f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver les copies' }).click();
            await attendreFenetre(page, 'Les copies de Hiver 2032 sont aux archives');
            await fermerFenetre(page);
            const parties = await photo(page);

            // « Rouvrir », le vrai bouton de la carte close.
            await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
            const modale = page.locator('#modalBibliothequeTrimestres');
            await expect(modale).toBeVisible();
            // 14 oct. 2026 : « Rouvrir » passe par sa confirmation, dans la fenêtre de l'application.
            const rouvrir = modale.locator('[data-action="confirmerDesarchivage"][data-param="h2032"]');
            await expect(rouvrir).toHaveText('Rouvrir');
            await rouvrir.click();
            f = await attendreFenetre(page, 'Rouvrir le trimestre "Hiver 2032" ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Rouvrir' }).click();
            await expect.poll(() => page.evaluate(() => obtenirTrimestres().find((t) => t.id === 'h2032').archive)).toBe(false);
            await page.evaluate(() => db.flush());
            const rouvert = await photo(page);
            // Ce que « Rouvrir » change : le registre (et les copies de modèles de la clôture, #359).
            const changees = Object.keys({ ...parties.cles, ...rouvert.cles }).filter((k) => parties.cles[k] !== rouvert.cles[k]).sort();
            test.info().annotations.push({ type: 'clés changées par « Rouvrir »', description: changees.join(', ') });
            expect(changees).toContain('trimestres');
            expect(changees.filter((k) => k !== 'trimestres' && !/^h2032_/.test(k))).toEqual([]);
            expect(rouvert.cles._copiesAuxArchives).toBe(parties.cles._copiesAuxArchives);
            expect(rouvert.cles.h2032_fichiersTravaux).toBe(parties.cles.h2032_fichiersTravaux);
            expect(rouvert.cles.h2032_corbeilleFichiers).toBe(parties.cles.h2032_corbeilleFichiers);
            expect(rouvert.copies).toEqual(parties.copies);
            expect(await page.evaluate((ids) => ids.map((id) => ReserveCopies.estAuxArchives(id)), COPIES_H)).toEqual([true, true, true]);

            // Rouvert, « Archiver le trimestre… » n'est plus offert (carte close seulement) et E1
            // refuse un trimestre qui n'est pas clos : rien n'est téléchargé.
            const e1 = await page.evaluate(async () => {
                window.__archive = null;
                const r = await ReserveTrimestre.archiverTrimestre('h2032', { sansConfirmation: true });
                return { r, pasClos: ReserveTrimestre.MOTS.refus.pasClos, archive: window.__archive };
            });
            expect(e1.r).toEqual({ succes: false, refus: e1.pasClos });
            expect(e1.archive).toBeNull();
            await page.evaluate(() => { const m = document.getElementById('modalBibliothequeTrimestres'); if (m) m.remove(); });

            // Rouvert ET actif : toujours « aux archives », jamais « manquantes ».
            await activer(page, 'h2032', ['FT_a1']);
            const actif = await page.evaluate(async (ids) => {
                const fiches = [...(await db.get('h2032_fichiersTravaux', [])), ...(await db.get('h2032_corbeilleFichiers', []))];
                let averti = null;
                await Codex.generer({ confirmerCopiesManquantes: async (m, a) => { averti = [m, a]; return true; } });
                return {
                    aux: ids.map((id) => ReserveCopies.estAuxArchives(id)),
                    manquantes: fiches.filter((x) => x && x.blobStatut === 'manquant').map((x) => x.id),
                    averti
                };
            }, COPIES_H);
            expect(actif).toEqual({ aux: [true, true, true], manquantes: [], averti: null });

            // Clos de nouveau : « Archiver le trimestre… » refuse tant que les copies ne sont pas revenues.
            await activer(page, 'a2032', ['FT_a1']);
            const clore = await page.evaluate(() => archiverTrimestre('h2032'));
            expect(clore.success).toBe(true);
            await page.evaluate(() => { window.__archive = null; ReserveTrimestre.actionArchiver('h2032'); });
            f = await attendreFenetre(page, 'Trimestre non archivé');
            expect(f.message).toContain('Les copies de Hiver 2032 sont aux archives : une nouvelle archive ne les contiendrait pas, et elle remplacerait celle qui les garde.');
            await fermerFenetre(page);
            expect(await page.evaluate(() => window.__archive)).toBeNull();
            expect(await page.evaluate((ids) => ids.map((id) => ReserveCopies.estAuxArchives(id)), COPIES_H)).toEqual([true, true, true]);

            // « Faire revenir » par la ligne de l'archive : chaque fichier égal à l'avant, la marque levée.
            await ouvrirArchives(page);
            await page.evaluate(() => ReserveReglages.rafraichir());
            const ligne = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' });
            const bouton = ligne.locator('[data-action="ReserveRevenir.actionFaireRevenir"]');
            await expect(bouton).toHaveText('Faire revenir');
            const attente = page.waitForEvent('filechooser');
            await bouton.click();
            await (await attente).setFiles(fichier);
            f = await attendreFenetre(page, 'Faire revenir les copies');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Faire revenir' }).click();
            f = await attendreFenetre(page, 'Copies revenues');
            expect(f.message).toContain('3 copies revenues');
            await fermerFenetre(page);
            const retour = await photo(page);
            for (const id of COPIES_H) expect([id, retour.copies[id]]).toEqual([id, avant.copies[id]]);
            expect(retour.cles._copiesAuxArchives).toBeUndefined();
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });

    test('verdict de Cowork : une copie sans fichier (manquante, introuvable) s\'ouvre à sa place ; « Fusionner » la refuse et n\'efface rien', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs, alertes } = brancherEcouteurs(page);
        await poserEspace(page);
        // a2032 (actif) : une copie image présente, une « manquante » déclarée, une introuvable.
        await page.evaluate(async () => {
            const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
            await travauxStockage.stockerBlob('FT_ap', new Blob([png], { type: 'image/png' }), '0000009', '');
            const liste = await db.get('a2032_fichiersTravaux');
            liste.push(
                { id: 'FT_ap', nomFichier: 'presente.png', etudiantDA: '0000009', groupeCoursId: 'GC_A1', typeMIME: 'image/png' },
                { id: 'FT_am', nomFichier: 'manquante.png', etudiantDA: '0000009', groupeCoursId: 'GC_A1', typeMIME: 'image/png', blobStatut: 'manquant' },
                { id: 'FT_ai', nomFichier: 'introuvable.png', etudiantDA: '0000009', groupeCoursId: 'GC_A1', typeMIME: 'image/png' }
            );
            await db.set('a2032_fichiersTravaux', liste);
        });
        const ouvrir = (id) => page.evaluate(async (id) => {
            const ok = await travauxVisionneuse.ouvrirFichier(id);
            return { ok, actuel: travauxVisionneuse.getFichierActuel() && travauxVisionneuse.getFichierActuel().id, raison: travauxVisionneuse.raisonSansFichier() };
        }, id);
        // La copie précédente ne reste jamais à l'écran (avant : `false`, l'écran gardait l'autre).
        // Une copie présente n'est pas ouverte ici : son image ne se charge pas hors d'Annoter.
        expect(await ouvrir('FT_am')).toEqual({ ok: true, actuel: 'FT_am', raison: 'manquant' });
        expect(await ouvrir('FT_ai')).toEqual({ ok: true, actuel: 'FT_ai', raison: 'introuvable' });

        // « Fusionner » une copie présente et une introuvable : refusé, rien effacé.
        await page.evaluate(() => { try { travauxUI.toggleSelectionFusion('FT_ap'); } catch (e) {} try { travauxUI.toggleSelectionFusion('FT_ai'); } catch (e) {} });
        const n = alertes.length;
        await page.evaluate(() => travauxUI.fusionnerFichiers());
        await expect.poll(() => alertes.length).toBeGreaterThan(n);
        expect(alertes.at(-1)).toBe('Le fichier de cette copie est introuvable : elle ne peut pas être fusionnée.');
        const ids = await page.evaluate(async () => (await db.get('a2032_fichiersTravaux')).map((f) => f.id));
        expect(ids).toEqual(['FT_a1', 'FT_ap', 'FT_am', 'FT_ai']);
        expect(await page.evaluate(() => (document.getElementById('evaluations-contenu-import') || { textContent: '' }).textContent.includes('Fusion :'))).toBe(false);
        expect(erreurs).toEqual([]);
    });
    test('verdict de Cowork : la marque voyage dans le codex et dans l\'import d\'un ZIP ; les copies y sont « aux archives », jamais « manquantes » ; « Faire revenir » les ramène', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs, alertes } = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-1028c');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            const fichier = await archiverEtVerifier(page, dossierTmp);
            const avant = await photo(page);
            await archiverCopiesParLeMenu(page, fichier);
            let f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver les copies' }).click();
            await attendreFenetre(page, 'Les copies de Hiver 2032 sont aux archives');
            await fermerFenetre(page);

            // 1. Le codex, écrit maintenant : aucune copie aux archives dite manquante.
            const codex = await page.evaluate(async () => {
                let averti = null;
                const r = await Codex.generer({ confirmerCopiesManquantes: async (m, a) => { averti = [m, a]; return true; } });
                const u8 = new Uint8Array(await r.blob.arrayBuffer());
                let b = ''; for (let i = 0; i < u8.length; i += 0x8000) b += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
                return { averti, base64: btoa(b), marque: !!r.donnees._copiesAuxArchives };
            });
            expect(codex.averti).toBeNull();
            expect(codex.marque).toBe(true);

            // 2. Un espace neuf ; le codex y est ouvert.
            await page.evaluate(async () => {
                localStorage.clear();
                if (window.db && db.memoryCache) db.memoryCache.clear();
                await new Promise((res) => { const req = indexedDB.deleteDatabase('LaboCodexDB'); req.onsuccess = req.onerror = req.onblocked = () => res(); setTimeout(res, 1500); });
            });
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2500);
            await monterMagasin(page, []);
            const ouvert = await page.evaluate(async (b64) => {
                const u8 = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
                const r = await Codex.charger(new File([u8], 'codex-1028.zip', { type: 'application/zip' }));
                const ft = await db.get('h2032_fichiersTravaux');
                const corb = await db.get('h2032_corbeilleFichiers');
                return {
                    statuts: ft.concat(corb).map((x) => x.id + ':' + (x.blobStatut || '')),
                    marque: Object.keys(((await db.get('_copiesAuxArchives')) || {}).h2032 ? (await db.get('_copiesAuxArchives')).h2032.ids : {}).sort(),
                    auxArchives: ['FT_h1', 'FT_h2', 'FT_hc'].map((id) => ReserveCopies.estAuxArchives(id)),
                    bilan: { attendus: r.stats.nbBlobsAttendus, absents: r.stats.blobsAbsentsDuZip }
                };
            }, codex.base64);
            test.info().annotations.push({ type: 'ouverture du codex', description: JSON.stringify(ouvert) });
            expect(ouvert.statuts).toEqual(['FT_h1:', 'FT_h2:', 'FT_hc:']);
            expect(ouvert.marque).toEqual(['FT_h1', 'FT_h2', 'FT_hc']);
            expect(ouvert.auxArchives).toEqual([true, true, true]);
            // Seule FT_a1 (l'autre trimestre) est attendue ; aucune copie aux archives n'est « absente du ZIP ».
            expect(ouvert.bilan).toEqual({ attendus: 1, absents: [] });

            // 3. L'import d'un ZIP de travaux dont les DONNÉES portent la marque (l'espace ne l'a
            //    pas) et qui n'a pas ces copies : rien de « manquant ».
            const imp = await page.evaluate(async () => {
                const marque = await db.get('_copiesAuxArchives');
                await db.remove('_copiesAuxArchives'); db.removeSync('_copiesAuxArchives');
                const donnees = { h2032_fichiersTravaux: await db.get('h2032_fichiersTravaux'), _copiesAuxArchives: marque, _zipTravaux: new JSZip() };
                const bilan = await window._restaurerBlobsDepuisZip(donnees);
                const statuts = (await db.get('h2032_fichiersTravaux')).map((x) => x.id + ':' + (x.blobStatut || ''));
                await db.set('_copiesAuxArchives', marque);
                return { bilan, statuts };
            });
            expect(imp).toEqual({ bilan: { restaures: 0, manquants: 0 }, statuts: ['FT_h1:', 'FT_h2:'] });

            // 4. L'archive est listée (le manifeste a voyagé) : « Faire revenir » les ramène.
            await ouvrirArchives(page);
            await page.evaluate(() => ReserveReglages.rafraichir());
            const bouton = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' }).locator('[data-action="ReserveRevenir.actionFaireRevenir"]');
            const attente = page.waitForEvent('filechooser');
            await bouton.click();
            await (await attente).setFiles(fichier);
            f = await attendreFenetre(page, 'Faire revenir les copies');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Faire revenir' }).click();
            f = await attendreFenetre(page, 'Copies revenues');
            expect(f.message).toContain('3 copies revenues');
            await fermerFenetre(page);
            const retour = await photo(page);
            for (const id of ['FT_h1', 'FT_h2', 'FT_hc']) expect([id, retour.copies[id]]).toEqual([id, avant.copies[id]]);
            expect(retour.cles._copiesAuxArchives).toBeUndefined();
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
