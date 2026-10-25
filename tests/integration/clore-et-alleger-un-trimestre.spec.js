import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// CLORE ET ALLÉGER UN TRIMESTRE — le chemin complet, dans l'ordre que l'écran impose
// (consigne de Cowork du 14 oct. 2026 : Grégoire clôt l'hiver 2026 pour en archiver les copies ;
// levée du moratoire #622 pour ce trimestre seulement). Sous WebKit, à la largeur d'un iPad.
//
// L'espace : un trimestre en cours (a2032, actif) et un trimestre TERMINÉ MAIS PAS CLOS (h2032),
// avec deux copies, une à la corbeille, une vignette, une grille et ses cartouches. Noms fictifs.
//
//   0. codex de départ : il emporte les quatre copies ;
//   1. « Clore » par le vrai menu ⋮ et la vraie fenêtre : ce qui s'écrit ;
//   2. « Archiver le trimestre » (E1) puis « Vérifier » par le vrai bouton ;
//   3. « Archiver les copies… » par le vrai menu : la fenêtre, le bilan ;
//   4. codex mis à jour : plus léger, sans avertissement de copies manquantes ;
//   5. « Rouvrir » par le vrai bouton et sa fenêtre, puis « Clore » de nouveau : la clôture se reprend ;
//   (second test) le refus « cartouches non migrées » : dit, et rien n'est écrit.
//
// Le magasin des copies est en mémoire (WebKit éphémère refuse un Blob dans IndexedDB) : même
// montage que 1028-archiver-copies.spec.js.
// =======================================================================

const IPAD_PORTRAIT = { width: 820, height: 1180 };
const TAILLES = { FT_h1: 120000, FT_h2: 64000, FT_hc: 9000, FT_a1: 5000 };

function brancherEcouteurs(page, attendues = []) {
    const erreurs = [];
    const natifs = [];
    const estAttendue = (m) => [/version\.json.*access control/i, /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.(svg|png)/i, /Failed to load resource/i, ...attendues].some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    // « Clore » et « Rouvrir » ne parlent plus par confirm/alert (14 oct. 2026) : tout dialogue natif est noté.
    page.on('dialog', (d) => { natifs.push(d.message()); d.dismiss().catch(() => {}); });
    return { erreurs, natifs };
}

async function monterMagasin(page, ids) {
    await page.evaluate(async ({ ids, tailles }) => {
        window.__copies = new Map();
        db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
        db.getBlob = async (id) => window.__copies.get(id) || null;
        db.deleteBlob = async (id) => { window.__copies.delete(id); };
        db.listBlobIds = async () => [...window.__copies.keys()];
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        const da = { FT_h1: '0000001', FT_h2: '0000009', FT_hc: '0000002', FT_a1: '0000009' };
        let g = 1;
        for (const id of ids) await travauxStockage.stockerBlob(id, new Blob([octets(tailles[id], g++)], { type: 'application/pdf' }), da[id], '');
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
        window.FichierSortant.confirmerTelechargement = async () => true;
        window.__notes = [];
        for (const genre of ['succes', 'erreur', 'warning', 'info']) {
            const avant = notifications[genre];
            notifications[genre] = (t, d) => { window.__notes.push([genre, t]); return avant.call(notifications, t, d); };
        }
    }, { ids, tailles: TAILLES });
}

async function poserEspace(page, { cartouchesSousCleNue = false } = {}) {
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
    await page.evaluate(async (cartouchesSousCleNue) => {
        const ecrire = (k, v) => db.setSync(k, v);
        ecrire('trimestres', [
            { id: 'a2032', nom: 'Automne 2032', actif: true },
            { id: 'h2032', nom: 'Hiver 2032' }
        ]);
        ecrire('trimestreActif', 'a2032');
        ecrire('backupNePlusRappeler', 'true');
        ecrire('migration_cartouches_namespacees_done', true);
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' });
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('h2032_groupeEtudiants', [
            { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
            { da: '0000002', nom: 'Élève fictif Deux', groupe: '1' },
            { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }
        ]);
        ecrire('h2032_grillesTemplates', [{ id: 'G_FICTIVE', nom: 'Grille fictive', criteres: [] }]);
        ecrire('h2032_productions', [{ id: 'P1', titre: 'Production fictive', coursId: 'C1', grilleId: 'G_FICTIVE' }]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', productionId: 'P1', grilleId: 'G_FICTIVE', note: 80 }]);
        const cartouches = [{ id: 'CT1', nom: 'Cartouche fictive', grilleId: 'G_FICTIVE' }];
        if (cartouchesSousCleNue) ecrire('cartouches_G_FICTIVE', cartouches);
        else ecrire('h2032_cartouches_G_FICTIVE', cartouches);
        ecrire('h2032_fichiersTravaux', [
            { id: 'FT_h1', nomFichier: 'copie-une.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: 'GC_H1', tailleFichier: 120000, typeMIME: 'application/pdf' },
            { id: 'FT_h2', nomFichier: 'copie-deux.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_H1', tailleFichier: 64000, typeMIME: 'application/pdf' }
        ]);
        ecrire('h2032_corbeilleFichiers', [
            { id: 'FT_hc', nomFichier: 'jetee.pdf', etudiantDA: '0000002', groupeCoursId: 'GC_H1', tailleFichier: 9000, dateSuppression: '2032-03-01T00:00:00.000Z' }
        ]);
        ecrire('thumbnail_FT_h1', 'data:image/png;base64,AAAA');
        ecrire('a2032_groupesCours', [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('a2032_groupeEtudiants', [{ da: '0000009', nom: 'Élève fictif Doubleur', groupe: '1' }]);
        ecrire('a2032_fichiersTravaux', [{ id: 'FT_a1', nomFichier: 'a.pdf', etudiantDA: '0000009', groupeCoursId: 'GC_A1', typeMIME: 'application/pdf' }]);
        await db.flush();
    }, cartouchesSousCleNue);
    await page.waitForTimeout(800);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    await monterMagasin(page, ['FT_h1', 'FT_h2', 'FT_hc', 'FT_a1']);
}

async function cles(page) {
    return page.evaluate(async () => {
        await db.flush();
        const r = {};
        for (const k of await db.keys()) r[k] = JSON.stringify(await db.get(k));
        return r;
    });
}
const changees = (avant, apres) => Object.keys({ ...avant, ...apres }).filter((k) => avant[k] !== apres[k]).sort();

async function lireFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 30000 });
    return { fenetre, titre: await fenetre.locator('#ui-dialogue-titre').innerText(), message: await fenetre.locator('.modal-section').innerText() };
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
const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();


// #1159 (lot 6, 25 oct. 2026) — RÉANCRÉ : les trimestres clos sont rangés en bas de la bibliothèque, sous
// « Clos (n) », replié ; le banc l'ouvre comme l'utilisateur, par son intitulé (s'il ne l'est pas déjà).
const ouvrirClos = async (modale) => {
    const intitule = modale.locator('details.biblio2-repli:not([open]) > summary');
    if (await intitule.count()) await intitule.click();
};

async function bibliotheque(page) {
    await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
    const modale = page.locator('#modalBibliothequeTrimestres');
    await expect(modale).toBeVisible();
    return modale;
}

/** « Clore » par le menu ⋮ de la carte h2032, puis la fenêtre. */
async function clore(page) {
    const modale = await bibliotheque(page);
    await modale.locator('[data-param="biblio-menu-h2032"]').click();
    const geste = modale.locator('[data-action="confirmerArchivage"][data-param="h2032"]');
    await expect(geste).toBeVisible();
    await expect(geste).toHaveText('Clore');
    await geste.click();
    const f = await attendreFenetre(page, 'Clore le trimestre "Hiver 2032" ?');
    expect(f.message).toBe('Un trimestre clos passe en lecture seule et ne peut plus être modifié.\nCette action est réversible par le bouton « Rouvrir ».');
    await cliquerDansFenetre(page, 'Clore');
    await expect(page.locator('#overlay-ui-dialogue')).toHaveCount(0);
}

async function codex(page) {
    return page.evaluate(async () => {
        let averti = null;
        const r = await Codex.generer({ confirmerCopiesManquantes: async (m, a) => { averti = [m, a]; return true; } });
        return { averti, copies: r.manifeste.contenu.nombreFichiersTravaux, octets: r.blob.size };
    });
}

const notes = (page) => page.evaluate(() => window.__notes.splice(0));
const registre = (page) => page.evaluate(() => obtenirTrimestres().find((t) => t.id === 'h2032'));
const aujourdhui = () => page => page.evaluate(() => new Date().toISOString().split('T')[0]);

test.describe('Clore et alléger un trimestre — le chemin complet (14 oct. 2026, largeur iPad)', () => {
    test.setTimeout(300000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('codex → Clore → Archiver le trimestre → Vérifier → Archiver les copies → codex plus léger → Rouvrir → Clore', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs, natifs } = brancherEcouteurs(page);
        await poserEspace(page);
        const dossierTmp = path.join(__dirname, '.tmp-clore-alleger');
        mkdirSync(dossierTmp, { recursive: true });
        const journal = (type, description) => test.info().annotations.push({ type, description });
        try {
            // 0. Le codex de départ emporte les quatre copies (deux de h2032, la corbeille, une d'a2032).
            const codexAvant = await codex(page);
            expect(codexAvant.averti).toBeNull();
            expect(codexAvant.copies).toBe(4);

            // « Archiver les copies » n'est pas offert sur un trimestre qui n'est pas clos.
            let modale = await bibliotheque(page);
            await expect(modale.locator('[data-action="ReserveCopies.actionArchiverCopies"]')).toHaveCount(0);
            await page.evaluate(() => fermerModalBibliothequeTrimestres());

            // 1. Clore.
            const avantClore = await cles(page);
            await notes(page);
            await clore(page);
            const h = await registre(page);
            expect(h.archive).toBe(true);
            expect(h.dateFin).toBe(await aujourdhui()(page));
            expect(h.statistiquesFinales).toBeTruthy();
            expect(typeof h.snapshotRessources).toBe('string');
            expect(await notes(page)).toContainEqual(['succes', 'Trimestre "Hiver 2032" clos.']);
            const apresClore = await cles(page);
            const ecritesParClore = changees(avantClore, apresClore);
            journal('clés écrites par « Clore »', ecritesParClore.join(', '));
            expect(ecritesParClore).toContain('trimestres');
            expect(ecritesParClore.filter((k) => k !== 'trimestres' && !k.startsWith('snapshot_h2032_') && !k.startsWith('h2032_'))).toEqual([]);
            // La bibliothèque s'est redessinée : h2032 est rangé parmi les clos, avec « Rouvrir ».
            modale = page.locator('#modalBibliothequeTrimestres');
            await expect(modale.locator('[data-action="confirmerDesarchivage"][data-param="h2032"]')).toHaveText('Rouvrir');
            await page.evaluate(() => fermerModalBibliothequeTrimestres());

            // 2. Archiver le trimestre (E1), puis Vérifier par le bouton de la ligne de l'archive.
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
            journal('« Archiver le trimestre » dit', JSON.stringify(await notes(page)));
            await page.evaluate(() => { afficherSection('reglages'); });
            await page.waitForTimeout(300);
            await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
            await page.waitForTimeout(500);
            const accordeon = page.locator('#accordeon-reserve');
            if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').click();
            await page.evaluate(() => ReserveReglages.rafraichir());
            const attente = page.waitForEvent('filechooser');
            await page.evaluate(() => document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="h2032-trimestre"]').click());
            await (await attente).setFiles(fichier);
            let f = await lireFenetre(page);
            expect(f.titre).toBe('Archive vérifiée');
            journal('« Vérifier » dit', f.message);
            await fermerFenetre(page);

            // 3. Archiver les copies, par le menu ⋮ de la carte close.
            modale = await bibliotheque(page);
            await ouvrirClos(modale);
            await modale.locator('[data-param="biblio-menu-h2032"]').click();
            const archiverCopies = modale.locator('[data-action="ReserveCopies.actionArchiverCopies"][data-param="h2032"]');
            await expect(archiverCopies).toHaveText('Archiver les copies…');
            const choix = page.waitForEvent('filechooser');
            await archiverCopies.click();
            await (await choix).setFiles(fichier);
            f = await attendreFenetre(page, 'Archiver les copies de Hiver 2032 ?');
            journal('fenêtre « Archiver les copies »', f.message);
            await cliquerDansFenetre(page, 'Archiver les copies');
            f = await attendreFenetre(page, 'Les copies de Hiver 2032 sont aux archives');
            journal('bilan', f.message);
            expect(f.message).toContain('3 copies retirées.');
            await fermerFenetre(page);

            // 4. Le codex mis à jour : sans les trois copies, sans avertissement.
            const codexApres = await codex(page);
            expect(codexApres.averti, 'les copies aux archives ne sont pas « manquantes »').toBeNull();
            expect(codexApres.copies).toBe(1);
            const gain = codexAvant.octets - codexApres.octets;
            journal('codex', `${codexAvant.octets} → ${codexApres.octets} octets (−${gain})`);
            expect(gain).toBeGreaterThan((TAILLES.FT_h1 + TAILLES.FT_h2 + TAILLES.FT_hc) * 0.9);

            // 5. Rouvrir, par le bouton de la carte close et sa fenêtre.
            await page.evaluate(() => fermerModalBibliothequeTrimestres());
            modale = await bibliotheque(page);
            // D'abord « Annuler » : rien ne bouge.
            await ouvrirClos(modale);
            await modale.locator('[data-action="confirmerDesarchivage"][data-param="h2032"]').click();
            await attendreFenetre(page, 'Rouvrir le trimestre "Hiver 2032" ?');
            await cliquerDansFenetre(page, 'Annuler');
            await expect(page.locator('#overlay-ui-dialogue')).toHaveCount(0);
            await page.waitForTimeout(300);
            expect((await registre(page)).archive, 'annulé : toujours clos').toBe(true);
            await ouvrirClos(modale);
            await modale.locator('[data-action="confirmerDesarchivage"][data-param="h2032"]').click();
            f = await attendreFenetre(page, 'Rouvrir le trimestre "Hiver 2032" ?');
            expect(f.message).toBe('Cela permettra de modifier à nouveau les données de ce trimestre.');
            await cliquerDansFenetre(page, 'Rouvrir');
            await expect.poll(async () => (await registre(page)).archive).toBe(false);
            expect((await registre(page)).dateFin).toBeUndefined();
            expect(await notes(page)).toContainEqual(['succes', 'Trimestre "Hiver 2032" rouvert.']);
            // Les copies restent aux archives : la marque est là, les fichiers absents.
            expect(await page.evaluate(async () => Object.keys((await db.get('_copiesAuxArchives')) || {}))).toEqual(['h2032']);
            expect(await page.evaluate(() => [...window.__copies.keys()])).toEqual(['FT_a1']);
            // La bibliothèque redessinée offre « Clore » de nouveau.
            await page.evaluate(() => fermerModalBibliothequeTrimestres());

            // … puis Clore de nouveau : la clôture se reprend.
            await clore(page);
            expect((await registre(page)).archive).toBe(true);
            expect(await notes(page)).toContainEqual(['succes', 'Trimestre "Hiver 2032" clos.']);
            const codexFin = await codex(page);
            expect(codexFin).toMatchObject({ averti: null, copies: 1 });

            expect(natifs, 'aucun dialogue natif').toEqual([]);
            expect(erreurs).toEqual([]);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
    });

    test('cartouches restées sous la clé nue : « Clore » refuse, le dit, et n\'écrit rien', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const { erreurs, natifs } = brancherEcouteurs(page, [/ARCHIVAGE REFUSÉ pour h2032/]);
        await poserEspace(page, { cartouchesSousCleNue: true });
        const avant = await cles(page);
        await notes(page);
        await clore(page);
        const dites = await notes(page);
        const motif = 'Clôture refusée : les cartouches de 1 grille(s) (G_FICTIVE) n\'ont pas encore été migrées. Recharge l\'application, puis réessaie.';
        expect(dites).toContainEqual(['erreur', motif]);
        expect(dites).toContainEqual(['erreur', 'Erreur: ' + motif]);
        test.info().annotations.push({ type: 'notifications du refus', description: JSON.stringify(dites) });
        expect(changees(avant, await cles(page))).toEqual([]);
        expect((await registre(page)).archive).toBeFalsy();
        expect(natifs).toEqual([]);
        expect(erreurs).toEqual([]);
    });
});
