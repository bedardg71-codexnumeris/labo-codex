import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// E2 (#1023) — EMPRUNTER UN TRIMESTRE, LE GESTE DE L'ÉCRAN (4 oct. 2026)
// =======================================================================
//
// Le trajet de la consigne de Cowork (19 h 06, point 4), dans la vraie page, sous WebKit, à la
// largeur d'un iPad en portrait : un espace qui porte un trimestre en cours (a2032, avec un
// doubleur) et des réglages ; on ARCHIVE le trimestre clos h2032 (E1), on le VÉRIFIE par le vrai
// bouton, on le SUPPRIME par la vraie `supprimerTrimestre` (deux fichiers de copies retirés à la
// main, un laissé là : E0), l'espace ÉVOLUE (une élève ajoutée ailleurs, le profil changé), puis
// « Emprunter » par le vrai bouton, la vraie fenêtre et le vrai sélecteur de fichier.
//
// Témoins : le trimestre revient entier et clos (clés égales à celles d'avant la suppression,
// copies revenues octet pour octet, carte close dans la bibliothèque) ; RIEN d'autre n'a changé
// (toutes les clés hors du trimestre, comparées avant et après) ; un second emprunt est refusé
// « déjà là » sans ouvrir de sélecteur ni rien écrire. La vraie `db` porte la garde #340 des
// productions : le banc dit si elle laisse passer les productions du trimestre emprunté.
// Le détail (refus, échecs, mutations) est jugé par Vitest (sentinelle-e2-emprunter-trimestre).
//
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
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
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
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'avant@exemple.test' });
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }, { id: 'GC_H2', coursId: 'C1', groupeNum: '2' }]);
        ecrire('h2032_groupeEtudiants', [
            { da: '0000001', nom: 'Élève fictive Une', groupe: '1' },
            { da: '0000002', nom: 'Élève fictif Deux', groupe: '2' },
            { da: '0000009', nom: 'Élève fictif Doubleur', groupe: '2' }
        ]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', note: 80 }]);
        // Deux productions du cours C1, que a2032 suit aussi : le cas de la garde #340.
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
        db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
        db.getBlob = async (id) => window.__copies.get(id) || null;
        db.deleteBlob = async (id) => { window.__copies.delete(id); };
        db.listBlobIds = async () => [...window.__copies.keys()];
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        await travauxStockage.stockerBlob('FT_h1', new Blob([octets(120000, 1)], { type: 'application/pdf' }), '0000001', '');
        await travauxStockage.stockerBlob('FT_h2', new Blob([octets(64000, 2)], { type: 'application/pdf' }), '0000009', '');
        await travauxStockage.stockerBlob('FT_hc', new Blob([octets(9000, 3)], { type: 'application/pdf' }), '0000002', '');
        await travauxStockage.stockerBlob('FT_a1', new Blob([octets(5000, 4)], { type: 'application/pdf' }), '0000009', '');
    });
}

/** Toutes les clés (valeur sérialisée) et tous les fichiers (taille et premiers octets). */
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

async function rafraichirTableau(page) {
    await page.evaluate(() => ReserveReglages.rafraichir());
    await page.waitForTimeout(300);
}

async function lireFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 30000 });
    const titre = await fenetre.locator('#ui-dialogue-titre').innerText();
    const message = await fenetre.locator('.modal-section').innerText();
    return { fenetre, titre, message };
}

async function fermerFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await fenetre.locator('.modal-actions button').first().click();
    await expect(fenetre).toHaveCount(0);
}

test.describe('E2 — « Emprunter » l\'archive vérifiée d\'un trimestre (mode fichier, largeur iPad)', () => {
    test.setTimeout(180000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('archiver, vérifier, supprimer, faire évoluer l\'espace, emprunter : le trimestre revient entier et clos, rien d\'autre ne change ; un second emprunt est refusé « déjà là »', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const erreurs = brancherEcouteurs(page);
        await poserEspace(page);
        await page.evaluate(() => {
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
            window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
            window.FichierSortant.confirmerTelechargement = async () => true;
        });

        // 1. Archiver (E1), puis lire le fichier.
        const origine = await photo(page);
        await page.evaluate(() => ReserveTrimestre.archiverTrimestre('h2032', { sansConfirmation: true }));
        await page.waitForFunction(() => window.__archive && window.__archive.blob, null, { timeout: 30000 });
        const rendu = await page.evaluate(async () => {
            const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
            let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
            return { base64: btoa(s), nom: window.__archive.nom };
        });
        const dossierTmp = path.join(__dirname, '.tmp-e2');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, rendu.nom);
        try {
            writeFileSync(fichier, Buffer.from(rendu.base64, 'base64'));

            // 2. Vérifier par le vrai bouton.
            await rafraichirTableau(page);
            const ligne = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' });
            await expect(ligne.locator('[data-action="ReserveEmprunter.actionEmprunter"]')).toHaveCount(0); // non vérifiée : pas d'offre
            let attente = page.waitForEvent('filechooser');
            await page.evaluate(() => document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="h2032-trimestre"]').click());
            await (await attente).setFiles(fichier);
            expect((await lireFenetre(page)).titre).toBe('Archive vérifiée');
            await fermerFenetre(page);

            // 3. Supprimer par la vraie fonction ; deux fichiers retirés à la main, un laissé (E0).
            const sup = await page.evaluate(async () => {
                const r = await supprimerTrimestre('h2032');
                await travauxStockage.supprimerBlob('FT_h1');
                await travauxStockage.supprimerBlob('FT_hc');
                return r;
            });
            expect(sup.success).toBe(true);

            // 4. L'espace évolue.
            await page.evaluate(async () => {
                const liste = await db.get('a2032_groupeEtudiants');
                liste.push({ da: '0000077', nom: 'Élève fictive Nouvelle', groupe: '1' });
                await db.set('a2032_groupeEtudiants', liste);
                await db.set('profilEnseignant', { nom: 'Enseignant fictif', courriel: 'apres@exemple.test' });
                await db.flush();
            });
            // Réglages › Données › Archives (l'accordéon retient son état : la photo vient après).
            await page.evaluate(() => { afficherSection('reglages'); });
            await page.waitForTimeout(300);
            await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
            await page.waitForTimeout(500);
            const accordeon = page.locator('#accordeon-reserve');
            if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').click();
            await page.waitForTimeout(300);
            const avant = await photo(page);
            expect(Object.keys(avant.cles).filter((k) => k.startsWith('h2032_'))).toEqual([]);
            expect(Object.keys(avant.copies).sort()).toEqual(['FT_a1', 'FT_h2']);

            // 5. « Emprunter » : le vrai bouton, à la largeur d'un iPad.
            await rafraichirTableau(page);
            const bouton = ligne.locator('[data-action="ReserveEmprunter.actionEmprunter"]');
            await expect(bouton).toHaveCount(1);
            await expect(bouton).toBeVisible();
            await expect(bouton).toHaveText('Emprunter');
            await bouton.scrollIntoViewIfNeeded();
            const boite = await bouton.boundingBox();
            expect(boite.x).toBeGreaterThanOrEqual(0);
            expect(boite.x + boite.width).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            test.info().annotations.push({ type: 'hauteur du bouton', description: String(Math.round(boite.height)) + ' px' });
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            // Le fichier d'abord (geste actif, #995), puis la fenêtre : l'ordre de « Faire revenir ».
            attente = page.waitForEvent('filechooser');
            await bouton.click();
            await (await attente).setFiles(fichier);
            let f = await lireFenetre(page);
            expect(f.titre).toBe('Emprunter Hiver 2032 ?');
            expect(f.message).toBe('Hiver 2032 revient dans l\'application tel qu\'il a été archivé, clos : 3 étudiant·es, 3 copies.\n\n' +
                'Rien d\'autre n\'est touché : les autres trimestres, les cours et les réglages restent tels quels.');
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(IPAD_PORTRAIT.width);
            await f.fenetre.locator('.modal-actions button', { hasText: 'Emprunter' }).click();
            await expect(page.locator('#ui-dialogue-titre')).not.toHaveText('Emprunter Hiver 2032 ?', { timeout: 30000 });
            f = await lireFenetre(page);
            expect({ titre: f.titre, message: f.message }).toEqual({
                titre: 'Trimestre emprunté',
                message: 'Hiver 2032 est revenu, clos. Tu le trouves dans la bibliothèque des trimestres.\n\n2 copies revenues\n1 copie déjà là'
            });
            await fermerFenetre(page);

            // 6. Le trimestre est revenu entier, clos ; rien d'autre n'a changé.
            const apres = await photo(page);
            for (const k of Object.keys(origine.cles).filter((x) => x.startsWith('h2032_'))) {
                expect([k, apres.cles[k]]).toEqual([k, origine.cles[k]]);
            }
            const changees = Object.keys(apres.cles).filter((k) => apres.cles[k] !== avant.cles[k]);
            const nonTrimestre = changees.filter((k) => !k.startsWith('h2032_'));
            expect(nonTrimestre).toEqual(['trimestres']);
            const registre = JSON.parse(apres.cles.trimestres);
            expect(registre.slice(0, -1)).toEqual(JSON.parse(avant.cles.trimestres));
            expect(registre.at(-1)).toEqual({ id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' });
            expect(apres.copies).toEqual(origine.copies);

            // 7. La bibliothèque : la carte h2032, close.
            await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
            const modale = page.locator('#modalBibliothequeTrimestres');
            await expect(modale.locator('[data-action="ReserveTrimestre.actionArchiver"][data-param="h2032"]')).toHaveCount(1);
            await page.evaluate(() => fermerModalBibliothequeTrimestres());

            // 8. Un second emprunt : « déjà là », sans sélecteur, rien écrit.
            let selecteurOuvert = false;
            page.once('filechooser', () => { selecteurOuvert = true; });
            await bouton.click();
            f = await lireFenetre(page);
            expect({ titre: f.titre, message: f.message }).toEqual({
                titre: 'Trimestre non emprunté',
                message: 'Hiver 2032 est déjà dans l\'application. Rien n\'a été écrit.'
            });
            await fermerFenetre(page);
            expect(selecteurOuvert).toBe(false);
            expect(await photo(page)).toEqual(apres);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
