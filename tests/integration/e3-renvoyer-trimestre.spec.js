import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// E3 (#1024) — RENVOYER UN TRIMESTRE AUX ARCHIVES, LE GESTE DE L'ÉCRAN (5 oct. 2026)
// =======================================================================
//
// Le trajet de la consigne de Cowork (5 oct., 4 h 36, point 4), dans la vraie page, sous WebKit,
// à la largeur d'un iPad en portrait : un espace qui porte un trimestre en cours (a2032, avec un
// doubleur), des réglages, et un trimestre clos fictif h2032 (copies, vignettes, séances).
//
//   1. ARCHIVER h2032 (E1), le VÉRIFIER par le vrai bouton ;
//   2. « Renvoyer aux archives… » par le vrai menu ⋮, le vrai sélecteur, la vraie fenêtre ;
//   3. l'espace ÉVOLUE ; « Faire revenir » par le vrai bouton de la ligne de l'archive ;
//      → toutes ses clés et tous ses fichiers égaux à l'avant-renvoi, rien d'autre changé ;
//   4. le cas « consulté » : activer h2032, revenir à a2032, renvoyer → la fenêtre « a changé »,
//      rien retiré ; « Archiver de nouveau », vérifier, renvoyer → passe ; faire revenir → la
//      version consultée ;
//   5. (second test) un arrêt provoqué au milieu, « Terminer le renvoi » sur la ligne ; le refus
//      du trimestre actif (le menu ne l'offre pas, l'action le refuse).
//
// Le détail (ordre, refus, mutations) est jugé par Vitest (sentinelle-e3-renvoyer-trimestre).
// Noms fictifs.

const IPAD_PORTRAIT = { width: 820, height: 1180 };

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m)) || /\[Archives\] Renvoi interrompu/.test(m);
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
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
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' });
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }]);
        ecrire('h2032_groupeEtudiants', [
            { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
            { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
            { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
        ]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', note: 80 }]);
        ecrire('h2032_productions', [{ id: 'P1', titre: 'Production fictive', coursId: 'C1' }, { id: 'P2', titre: 'Autre production', coursId: 'C1' }]);
        ecrire('h2032_fichiersTravaux', [
            { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', groupeCoursId: 'GC_H1', tailleFichier: 120000, typeMIME: 'application/pdf' },
            { id: 'FT_h2', nomFichier: 'copie-deux.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H2', tailleFichier: 64000, typeMIME: 'application/pdf' }
        ]);
        ecrire('h2032_corbeilleFichiers', [
            { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000002', groupeCoursId: 'GC_H2', tailleFichier: 9000, dateSuppression: '2032-03-01T00:00:00.000Z' }
        ]);
        ecrire('seancesCompletes_gc_GC_H1', [{ id: 'S1' }]);
        ecrire('seancesCompletes_gc_GC_H2', [{ id: 'S2' }]);
        ecrire('thumbnail_FT_h1', 'data:image/png;base64,AAAA');
        ecrire('thumbnail_FT_a1', 'data:image/png;base64,CCCC');
        ecrire('a2032_groupesCours', [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('a2032_groupeEtudiants', [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }]);
        ecrire('a2032_productions', [{ id: 'PA', titre: 'Production d\'automne', coursId: 'C1' }]);
        ecrire('seancesCompletes_gc_GC_A1', [{ id: 'SA' }]);
        await db.flush();
    });
    await page.waitForTimeout(800);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    // Le magasin des copies : WebKit éphémère refuse un Blob dans IndexedDB ; le magasin de `db`
    // est tenu en mémoire, et la VRAIE pile travauxStockage → db.storeBlob/getBlob/deleteBlob s'en sert.
    await page.evaluate(async () => {
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
        await travauxStockage.stockerBlob('FT_h1', new Blob([octets(120000, 1)], { type: 'application/pdf' }), '0000001', '');
        await travauxStockage.stockerBlob('FT_h2', new Blob([octets(64000, 2)], { type: 'application/pdf' }), '0000009', '');
        await travauxStockage.stockerBlob('FT_hc', new Blob([octets(9000, 3)], { type: 'application/pdf' }), '0000002', '');
        await travauxStockage.stockerBlob('FT_a1', new Blob([octets(5000, 4)], { type: 'application/pdf' }), '0000009', '');
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
        window.FichierSortant.confirmerTelechargement = async () => true;
    });
}

/** Toutes les clés (valeur sérialisée) et tous les fichiers (taille et somme des octets). */
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

const DU_TRIMESTRE = (k) => k.startsWith('h2032_') || k.startsWith('seancesCompletes_gc_GC_H') || k === 'thumbnail_FT_h1';
function horsTrimestre(p) {
    const cles = {};
    for (const k of Object.keys(p.cles)) if (!DU_TRIMESTRE(k) && k !== 'trimestres') cles[k] = p.cles[k];
    const copies = {};
    for (const id of Object.keys(p.copies)) if (!['FT_h1', 'FT_h2', 'FT_hc'].includes(id)) copies[id] = p.copies[id];
    return { cles, copies };
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

/** Archive h2032 (E1) sans fenêtre, écrit le ZIP sur disque, le vérifie par le vrai bouton. */
async function archiverEtVerifier(page, dossierTmp, rang) {
    await page.evaluate(() => { window.__archive = null; });
    await page.evaluate(() => ReserveTrimestre.archiverTrimestre('h2032', { sansConfirmation: true }));
    return ecrireEtVerifier(page, dossierTmp, rang);
}

async function ecrireEtVerifier(page, dossierTmp, rang) {
    await page.waitForFunction(() => window.__archive && window.__archive.blob, null, { timeout: 30000 });
    const rendu = await page.evaluate(async () => {
        const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
        let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return { base64: btoa(s), nom: window.__archive.nom };
    });
    const fichier = path.join(dossierTmp, rang + '-' + rendu.nom);
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

/** Le menu ⋮ de la carte h2032 : « Renvoyer aux archives… », puis le fichier. */
async function renvoyerParLeMenu(page, fichier) {
    await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
    const modale = page.locator('#modalBibliothequeTrimestres');
    await expect(modale).toBeVisible();
    const geste = modale.locator('[data-action="ReserveRenvoyer.actionRenvoyer"]');
    await expect(geste).toHaveCount(1);
    await expect(geste).toHaveAttribute('data-param', 'h2032');
    await modale.locator('[data-param="biblio-menu-h2032"]').click();
    await expect(geste).toBeVisible();
    await expect(geste).toHaveText('Renvoyer aux archives…');
    const boite = await geste.boundingBox();
    expect(boite.x).toBeGreaterThanOrEqual(0);
    expect(boite.x + boite.width).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
    const attente = page.waitForEvent('filechooser');
    await geste.click();
    await (await attente).setFiles(fichier);
}

async function faireRevenir(page, fichier) {
    await page.evaluate(() => ReserveReglages.rafraichir());
    const bouton = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' }).locator('[data-action="ReserveEmprunter.actionEmprunter"]');
    const attente = page.waitForEvent('filechooser');
    await bouton.click();
    await (await attente).setFiles(fichier);
    const f = await attendreFenetre(page, 'Faire revenir Hiver 2032 ?');
    await f.fenetre.locator('.modal-actions button', { hasText: 'Faire revenir' }).click();
    const b = await attendreFenetre(page, 'Trimestre revenu');
    await fermerFenetre(page);
    return b;
}

test.describe('E3 — « Renvoyer aux archives » un trimestre clos (mode fichier, largeur iPad)', () => {
    test.setTimeout(300000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('l\'aller-retour : renvoyer, faire évoluer l\'espace, faire revenir, égal à l\'avant-renvoi ; puis le cas « consulté »', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const erreurs = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-e3');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            // 1. Archiver, vérifier.
            const fichier = await archiverEtVerifier(page, dossierTmp, 1);
            const avantRenvoi = await photo(page);
            expect(avantRenvoi.cles.thumbnail_FT_h1).toBeDefined();

            // 2. Renvoyer par le vrai menu ; la fenêtre ; le bilan.
            await renvoyerParLeMenu(page, fichier);
            let f = await attendreFenetre(page, 'Renvoyer Hiver 2032 aux archives ?');
            expect(f.message).toContain('Hiver 2032 quittera l\'application : 3 étudiant·es, 3 copies, environ 193,0 Ko.\n');   // 15 oct. 2026 : les tailles se disent comme sur l'appareil (#993) — base 1000 hors Windows (Mac et runner Linux).
            expect(f.message).toContain('le garde tel quel : « Faire revenir » le ramènera.\nGarde bien cette archive : c\'est elle qui le conserve.');
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            test.info().annotations.push({ type: 'fenêtre identique', description: f.message });
            await f.fenetre.locator('.modal-actions button', { hasText: 'Renvoyer aux archives' }).click();
            f = await attendreFenetre(page, 'Hiver 2032 est renvoyé aux archives');
            expect(f.message).toContain('3 copies retirées. Ton prochain codex sera plus léger d\'environ 193,0 Ko.');
            test.info().annotations.push({ type: 'bilan', description: f.message });
            await fermerFenetre(page);

            const apresRenvoi = await photo(page);
            expect(Object.keys(apresRenvoi.cles).filter(DU_TRIMESTRE)).toEqual([]);
            expect(Object.keys(apresRenvoi.copies).sort()).toEqual(['FT_a1']);
            expect(JSON.parse(apresRenvoi.cles.trimestres).map((t) => t.id)).toEqual(['a2032']);
            expect(horsTrimestre(apresRenvoi)).toEqual(horsTrimestre(avantRenvoi));
            // La bibliothèque ne montre plus la carte ; la page tient (aucune erreur à la fin).
            await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
            await expect(page.locator('#modalBibliothequeTrimestres [data-param="biblio-menu-h2032"]')).toHaveCount(0);
            await page.evaluate(() => fermerModalBibliothequeTrimestres());

            // 3. L'espace évolue ; faire revenir ; égal à l'avant-renvoi, rien d'autre changé.
            await page.evaluate(async () => {
                const liste = await db.get('a2032_groupeEtudiants');
                liste.push({ da: '0000077', nom: 'Élève fictive Nouvelle', groupe: '1' });
                await db.set('a2032_groupeEtudiants', liste);
                await db.set('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'apres@exemple.test' });
                await db.flush();
            });
            const avantRetour = await photo(page);
            await faireRevenir(page, fichier);
            const apresRetour = await photo(page);
            for (const k of Object.keys(avantRenvoi.cles).filter((x) => DU_TRIMESTRE(x) && x !== 'thumbnail_FT_h1')) {
                expect([k, apresRetour.cles[k]]).toEqual([k, avantRenvoi.cles[k]]);
            }
            for (const id of ['FT_h1', 'FT_h2', 'FT_hc']) expect([id, apresRetour.copies[id]]).toEqual([id, avantRenvoi.copies[id]]);
            expect(horsTrimestre(apresRetour)).toEqual(horsTrimestre(avantRetour));

            // 4. « Consulté » : activer h2032, revenir à a2032 (avec un démarrage entre les deux).
            await page.evaluate(() => changerTrimestreActifV2('h2032'));
            await page.waitForTimeout(1500);
            await page.evaluate(() => db.flush());
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(3000);
            await page.evaluate(() => changerTrimestreActifV2('a2032'));
            await page.waitForTimeout(1500);
            await page.evaluate(() => db.flush());
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(3000);
            // Le magasin en mémoire n'a pas survécu au rechargement : on le remonte, copies revenues.
            const copiesRevenues = apresRetour.copies;
            await page.evaluate(async () => {
                window.__copies = new Map();
                db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
                db.getBlob = async (id) => window.__copies.get(id) || null;
                db.deleteBlob = async (id) => { window.__copies.delete(id); };
                db.listBlobIds = async () => [...window.__copies.keys()];
                const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
                await travauxStockage.stockerBlob('FT_h1', new Blob([octets(120000, 1)], { type: 'application/pdf' }), '0000001', '');
                await travauxStockage.stockerBlob('FT_h2', new Blob([octets(64000, 2)], { type: 'application/pdf' }), '0000009', '');
                await travauxStockage.stockerBlob('FT_hc', new Blob([octets(9000, 3)], { type: 'application/pdf' }), '0000002', '');
                await travauxStockage.stockerBlob('FT_a1', new Blob([octets(5000, 4)], { type: 'application/pdf' }), '0000009', '');
                window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
                window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
                window.FichierSortant.confirmerTelechargement = async () => true;
            });
            expect((await photo(page)).copies).toEqual(copiesRevenues);
            const registre = await page.evaluate(() => db.getSync('trimestres'));
            test.info().annotations.push({ type: 'registre après consultation', description: JSON.stringify(registre) });
            await ouvrirArchives(page);
            const consulte = await photo(page);
            const changees = Object.keys(consulte.cles).filter((k) => DU_TRIMESTRE(k) && consulte.cles[k] !== apresRetour.cles[k]);
            test.info().annotations.push({ type: 'clés du trimestre changées par la consultation', description: changees.join(', ') });
            expect(changees.length).toBeGreaterThan(0);

            await renvoyerParLeMenu(page, fichier);
            f = await attendreFenetre(page, 'Hiver 2032 a changé depuis son archive');
            test.info().annotations.push({ type: 'fenêtre différent', description: f.message });
            expect(f.message).toContain('Rien n\'a été retiré.');
            expect(await photo(page)).toEqual(consulte);
            // « Archiver de nouveau » : la fenêtre d'E1, l'archive, puis vérifier.
            await page.evaluate(() => { window.__archive = null; });
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver de nouveau' }).click();
            f = await attendreFenetre(page, 'Archiver Hiver 2032 ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Archiver' }).click();
            const fichier2 = await ecrireEtVerifier(page, dossierTmp, 2);
            const avant2 = await photo(page);
            await renvoyerParLeMenu(page, fichier2);
            f = await attendreFenetre(page, 'Renvoyer Hiver 2032 aux archives ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Renvoyer aux archives' }).click();
            await attendreFenetre(page, 'Hiver 2032 est renvoyé aux archives');
            await fermerFenetre(page);
            await faireRevenir(page, fichier2);
            const ensuite = await photo(page);
            for (const k of Object.keys(avant2.cles).filter((x) => x.startsWith('h2032_') || x.startsWith('seancesCompletes_gc_GC_H'))) {
                expect([k, ensuite.cles[k]]).toEqual([k, avant2.cles[k]]);
            }
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });

    test('un arrêt au milieu, « Terminer le renvoi » sur la ligne de l\'archive ; le trimestre actif n\'est pas offert', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const erreurs = brancherEcouteurs(page);
        await poserEspace(page);
        await ouvrirArchives(page);
        const dossierTmp = path.join(__dirname, '.tmp-e3b');
        mkdirSync(dossierTmp, { recursive: true });
        try {
            // Le trimestre actif : pas de geste au menu, et l'action le refuse.
            await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
            await expect(page.locator('#modalBibliothequeTrimestres [data-action="ReserveRenvoyer.actionRenvoyer"][data-param="a2032"]')).toHaveCount(0);
            await page.evaluate(() => fermerModalBibliothequeTrimestres());
            await page.evaluate(() => ReserveRenvoyer.actionRenvoyer('a2032'));
            let f = await attendreFenetre(page, 'Trimestre non renvoyé');
            expect(f.message).toBe('Seul un trimestre clos peut être renvoyé aux archives. Clos-le, puis archive-le.');
            await fermerFenetre(page);

            const fichier = await archiverEtVerifier(page, dossierTmp, 1);
            const avantRenvoi = await photo(page);
            let n = 0;
            await page.evaluate(() => { let c = 0; window.__refuserRetrait = () => ++c === 2; });
            await renvoyerParLeMenu(page, fichier);
            f = await attendreFenetre(page, 'Renvoyer Hiver 2032 aux archives ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Renvoyer aux archives' }).click();
            f = await attendreFenetre(page, 'Renvoi inachevé');
            test.info().annotations.push({ type: 'bilan interrompu', description: f.message });
            expect(f.message).toContain('Rien n\'est perdu');
            await fermerFenetre(page);
            n = Object.keys((await photo(page)).cles).filter((k) => k.startsWith('h2032_')).length;
            expect(n).toBeGreaterThan(0);

            // La ligne de l'archive offre de finir.
            await page.evaluate(() => { window.__refuserRetrait = null; ReserveReglages.rafraichir(); });
            const finir = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' }).locator('[data-action="ReserveRenvoyer.actionReprendre"]');
            await expect(finir).toHaveText('Terminer le renvoi');
            await finir.scrollIntoViewIfNeeded();
            const boite = await finir.boundingBox();
            expect(boite.x + boite.width).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            const attente = page.waitForEvent('filechooser');
            await finir.click();
            await (await attente).setFiles(fichier);
            f = await attendreFenetre(page, 'Terminer le renvoi de Hiver 2032 ?');
            test.info().annotations.push({ type: 'fenêtre de reprise', description: f.message });
            await f.fenetre.locator('.modal-actions button', { hasText: 'Terminer le renvoi' }).click();
            await attendreFenetre(page, 'Hiver 2032 est renvoyé aux archives');
            await fermerFenetre(page);
            const fin = await photo(page);
            expect(Object.keys(fin.cles).filter(DU_TRIMESTRE)).toEqual([]);
            expect(Object.keys(fin.copies)).toEqual(['FT_a1']);
            expect(horsTrimestre(fin)).toEqual(horsTrimestre(avantRenvoi));
            await page.evaluate(() => ReserveReglages.rafraichir());
            await expect(finir).toHaveCount(0);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
