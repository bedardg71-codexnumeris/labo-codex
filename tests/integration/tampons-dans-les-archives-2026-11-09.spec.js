import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LES TAMPONS DANS LES ARCHIVES — lot « Production plutôt que copie » (ajout du 9 nov. 2026)
// =======================================================================
//
// Décision de Grégoire (9 nov. 2026, 13 h 33, en Cowork) : chaque archive emporte une PHOTO des
// tampons tels qu'ils sont au moment d'archiver ; une production annotée rouverte depuis l'archive
// affiche ses tampons par cette photo quand l'espace courant ne les a pas ; rouvrir une archive
// n'écrase JAMAIS les tampons de l'espace courant (ce sont des clés globales).
//
// Le trajet, dans la vraie page : un tampon PERSONNALISÉ (son image, sa phrase) est posé sur une
// production de h2032 ; on archive le trimestre (E1), on le vérifie, on le retire ; l'espace perd
// ce tampon et en a un autre à lui ; puis « Faire revenir » (E2). Témoins :
//   (1) l'espace courant est intact : ses tampons, leurs images, leurs textes, sa bibliothèque ;
//   (2) le tampon de l'archive s'affiche (son image se charge) ;
//   (3) sa phrase est dans la rétroaction de l'étudiant·e (le PDF de synthèse) ;
//   (4) « Ouvrir une archive » le montre ; l'ouvrir n'écrit rien ; seule la réimportation cochée
//       l'ajoute (avec son image et sa phrase), sans remplacer un tampon, une image ou une phrase de l'espace.
//
// AVANT LE CORRECTIF (9 nov. 2026, sous Chromium) : (1) vert, (2) et (3) ROUGES — l'archive
// n'emportait aucun tampon, et le trimestre revenu n'avait plus rien pour dessiner le sien ni pour
// en dire la phrase. C'était « inféré » dans le rapport du matin ; c'est éprouvé ici.
//
// Noms fictifs.

const IPAD_PORTRAIT = { width: 820, height: 1180 };
const CLES_TAMPONS = ['tamponsPersonnalises', 'bibliothequeTampons', 'personnalisationObservations', 'retroactionsObservations',
    'nomsCategoriesTampons', 'categoriesPerso', 'ordreCategories', 'couleursCategories'];
const PHRASE = 'Phrase fictive du tampon de l\'archive.';

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
    await attendreApplication(page);
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
    await attendreApplication(page);
    await page.evaluate(async (PHRASE) => {
        const ecrire = (k, v) => db.setSync(k, v);
        // L'image du tampon : un carré rouge, comme une image importée pour un tampon personnel.
        const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
        const cx = cv.getContext('2d'); cx.fillStyle = '#c0392b'; cx.fillRect(0, 0, 32, 32);
        ecrire('trimestres', [
            { id: 'a2032', nom: 'Automne 2032', actif: true },
            { id: 'h2032', nom: 'Hiver 2032', archive: true, dateFin: '2032-05-20' }
        ]);
        ecrire('cours', [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }]);
        ecrire('tamponsPersonnalises', [{ id: 'TP_archive', nom: 'Tampon fictif de l\'archive', categorie: 'observations' }]);
        ecrire('personnalisationObservations', { TP_archive: { imageBase64: cv.toDataURL('image/png') } });
        ecrire('retroactionsObservations', { TP_archive: PHRASE });
        ecrire('bibliothequeTampons', [{ id: 'TP_archive', nom: 'Tampon fictif de l\'archive', categorie: 'observations', dansBibliotheque: true }]);
        ecrire('h2032_groupesCours', [{ id: 'GC_H1', coursId: 'C1', groupeNum: '1' }]);
        ecrire('h2032_groupeEtudiants', [{ da: '0000001', nom: 'Élève fictive Une', groupe: '1' }]);
        ecrire('h2032_productions', [{ id: 'P1', titre: 'Production fictive', type: 'travail', coursId: 'C1', ponderation: 100 }]);
        ecrire('h2032_fichiersTravaux', [
            { id: 'FT_h1', nomFichier: 'production-une.pdf', etudiantDA: '0000001', productionId: 'P1', groupeCoursId: 'GC_H1', tailleFichier: 4000, typeMIME: 'application/pdf' }
        ]);
        ecrire('h2032_evaluationsSauvegardees', [{ id: 'EV1', etudiantDA: '0000001', productionId: 'P1', fichierId: 'FT_h1', criteres: [], noteFinale: 80 }]);
        ecrire('h2032_annotationsTravaux', [{
            id: 'ANN1', fichierId: 'FT_h1',
            pages: { 0: { strokes: [], shapes: [], textAnnotations: [],
                stickers: [{ id: 'STK1', autocollantId: 'TP_archive', x: 0.1, y: 0.1, width: 0.1, height: 0.1 }] } }
        }]);
        ecrire('seancesCompletes_gc_GC_H1', [{ id: 'S1' }]);
        ecrire('a2032_groupesCours', [{ id: 'GC_A1', coursId: 'C1', groupeNum: '1' }]);
        await db.flush();
    }, PHRASE);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => {
        window.__copies = new Map();
        db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
        db.getBlob = async (id) => window.__copies.get(id) || null;
        db.deleteBlob = async (id) => { window.__copies.delete(id); };
        db.listBlobIds = async () => [...window.__copies.keys()];
        await travauxStockage.stockerBlob('FT_h1', new Blob([new Uint8Array(4000).fill(7)], { type: 'application/pdf' }), '0000001', '');
    });
}

const tamponsDeLEspace = (page) => page.evaluate((cles) => {
    const r = {};
    cles.forEach((k) => { r[k] = JSON.stringify(db.getSync(k, null)); });
    return r;
}, CLES_TAMPONS);

async function lireFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 30000 });
    return { fenetre, titre: await fenetre.locator('#ui-dialogue-titre').innerText() };
}

async function fermerFenetre(page) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await fenetre.locator('.modal-actions button').first().click();
    await expect(fenetre).toHaveCount(0);
}

test.describe('Les tampons dans l\'archive d\'un trimestre (mode fichier, largeur iPad)', () => {
    test.setTimeout(180000);
    test.use({ viewport: IPAD_PORTRAIT });

    test('archivé avec un tampon personnel, rapporté dans un espace qui ne l\'a pas : le tampon s\'affiche, sa phrase est dans la rétroaction, l\'espace garde les siens', async ({ page }) => {
        page.setDefaultTimeout(15000);
        const erreurs = brancherEcouteurs(page);
        await poserEspace(page);
        await page.evaluate(() => {
            window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
            window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
            window.FichierSortant.confirmerTelechargement = async () => true;
        });

        // 1. Archiver (E1), lire le fichier, le vérifier par le vrai bouton.
        await page.evaluate(() => ReserveTrimestre.archiverTrimestre('h2032', { sansConfirmation: true }));
        await page.waitForFunction(() => window.__archive && window.__archive.blob, null, { timeout: 30000 });
        const rendu = await page.evaluate(async () => {
            const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
            let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
            return { base64: btoa(s), nom: window.__archive.nom };
        });
        const dossierTmp = path.join(__dirname, '.tmp-tampons-archives');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, rendu.nom);
        try {
            writeFileSync(fichier, Buffer.from(rendu.base64, 'base64'));
            await page.evaluate(() => ReserveReglages.rafraichir());
            await expect(page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' })).toHaveCount(1);
            let attente = page.waitForEvent('filechooser');
            await page.evaluate(() => document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="h2032-trimestre"]').click());
            await (await attente).setFiles(fichier);
            expect((await lireFenetre(page)).titre).toBe('Archive vérifiée');
            await fermerFenetre(page);

            // 2. Le trimestre quitte l'application ; l'espace perd le tampon de l'archive et a les siens.
            expect((await page.evaluate(() => supprimerTrimestre('h2032'))).success).toBe(true);
            await page.evaluate(async () => {
                await db.set('tamponsPersonnalises', [{ id: 'TP_espace', nom: 'Tampon fictif de l\'espace', categorie: 'observations' }]);
                await db.set('retroactionsObservations', { TP_espace: 'Phrase fictive de l\'espace.' });
                await db.set('personnalisationObservations', {});
                await db.set('bibliothequeTampons', []);
                await db.flush();
            });
            // Un espace qui n'a pas ce tampon, c'est une page qui ne l'a jamais chargé : on recharge
            // (sans quoi le cache des images de la page le garderait, et le banc ne prouverait rien).
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            await attendreApplication(page);
            await page.evaluate(() => {
                window.__copies = new Map();
                db.storeBlob = async (enr) => { window.__copies.set(enr.id, enr); };
                db.getBlob = async (id) => window.__copies.get(id) || null;
                db.deleteBlob = async (id) => { window.__copies.delete(id); };
                db.listBlobIds = async () => [...window.__copies.keys()];
            });
            expect(await page.evaluate(() => travauxOutils.getImageAutocollant('TP_archive')), 'témoin : la page n\'a pas le tampon').toBeNull();
            const avant = await tamponsDeLEspace(page);

            // 3. « Faire revenir » (E2), par le vrai bouton et la vraie fenêtre.
            await page.evaluate(() => { afficherSection('reglages'); });
            await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
            const accordeon = page.locator('#accordeon-reserve');
            if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').click();
            await page.evaluate(() => ReserveReglages.rafraichir());
            const bouton = page.locator('#reserve-reglages-table-conteneur tr', { hasText: 'Trimestre entier' })
                .locator('[data-action="ReserveEmprunter.actionEmprunter"]');
            await expect(bouton).toHaveCount(1);
            attente = page.waitForEvent('filechooser');
            await bouton.click();
            await (await attente).setFiles(fichier);
            const f = await lireFenetre(page);
            expect(f.titre).toBe('Faire revenir Hiver 2032 ?');
            await f.fenetre.locator('.modal-actions button', { hasText: 'Faire revenir' }).click();
            await expect(page.locator('#ui-dialogue-titre')).toHaveText('Trimestre revenu', { timeout: 30000 });
            await fermerFenetre(page);

            // (1) L'espace courant est intact : aucune clé de tampons n'a bougé.
            expect(await tamponsDeLEspace(page)).toEqual(avant);

            // On ouvre Hiver 2032, revenu clos.
            await page.evaluate(async () => {
                const reg = (db.getSync('trimestres', []) || []).map((t) => Object.assign({}, t, { actif: t.id === 'h2032' }));
                await db.set('trimestres', reg);
            });

            // (2) Le tampon de l'archive s'affiche : son image se charge.
            const image = await page.evaluate(async () => {
                await travauxOutils.attendreChargementAutocollants({ stickers: [{ autocollantId: 'TP_archive' }] });
                const img = travauxOutils.getImageAutocollant('TP_archive');
                return img ? { complet: img.complete, largeur: img.naturalWidth } : null;
            });
            expect.soft(image, 'le tampon de l\'archive a une image').toEqual({ complet: true, largeur: 32 });

            // (3) Sa phrase est dans la rétroaction de l'étudiant·e, avec son nom et son icône.
            const synthese = await page.evaluate(() => {
                const ev = (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.id === 'EV1');
                const fichier = (db.getSync(cle('fichiersTravaux'), []) || []).find((x) => x.id === 'FT_h1');
                const ann = (db.getSync(cle('annotationsTravaux'), []) || []).find((a) => a.fichierId === 'FT_h1');
                const fb = syntheseRetroactionData.construireFeedback(ev, fichier, ann);
                const tampon = (fb.stamps || []).flatMap((c) => c.items).find((t) => t.id === 'TP_archive') || null;
                return { tampon: tampon && { nom: tampon.nom, phrase: tampon.comment, icone: !!tampon.icone },
                    html: syntheseRetroactionRendu.rendreSyntheseHTML(fb) };
            });
            expect(synthese.tampon).toEqual({ nom: 'Tampon fictif de l\'archive', phrase: PHRASE, icone: true });
            expect(synthese.html).toContain('Phrase fictive du tampon de l&#39;archive.');
            expect(synthese.html).not.toContain('Phrase fictive de l&#39;espace.');

            // Et l'espace courant, encore : rien n'a été écrit dans ses tampons en les lisant.
            expect(await tamponsDeLEspace(page)).toEqual(avant);

            // (4) « Ouvrir une archive » : la section « Tampons personnalisés » montre le tampon de la
            // photo ; OUVRIR n'écrit rien ; la réimportation COCHÉE l'ajoute avec son image et sa phrase,
            // sans toucher ceux de l'espace ; une seconde réimportation ne remplace rien.
            const ouvrir = (base64, reimporter) => page.evaluate(async ({ base64, reimporter }) => {
                const bin = atob(base64); const u8 = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
                document.getElementById('modalOuvrirVersement').classList.add('actif');
                await window.ReserveOuvrir.onFichierChoisi({ files: [new File([u8], 'archive-tampons.zip')] });
                const labels = [...document.querySelectorAll('#modalOuvrirVersement label.reserve-ouvrir-item[data-type="tampons"]')];
                const lignes = labels.map((l) => ({ texte: l.textContent.replace(/\s+/g, ' ').trim(), doublon: l.dataset.doublon === '1' }));
                if (reimporter) {
                    labels.forEach((l) => { l.querySelector('input').checked = true; });
                    await window.ReserveOuvrir.appliquerReimport();
                    await db.flush();
                }
                window.ReserveOuvrir.fermerDialogue();
                return lignes;
            }, { base64, reimporter });
            const lignes = await ouvrir(rendu.base64, false);
            expect(lignes).toEqual([{ texte: 'Tampon fictif de l\'archive', doublon: false }]);
            expect(await tamponsDeLEspace(page), 'ouvrir une archive n\'écrit rien dans les tampons').toEqual(avant);
            await ouvrir(rendu.base64, true);
            const reimporte = await page.evaluate(() => ({
                ids: (db.getSync('tamponsPersonnalises', []) || []).map((t) => t.id),
                image: !!((db.getSync('personnalisationObservations', {}) || {}).TP_archive || {}).imageBase64,
                phrases: db.getSync('retroactionsObservations', null)
            }));
            expect(reimporte).toEqual({
                ids: ['TP_espace', 'TP_archive'],
                image: true,
                phrases: { TP_espace: 'Phrase fictive de l\'espace.', TP_archive: PHRASE }
            });
            const apresReimport = await tamponsDeLEspace(page);
            await ouvrir(rendu.base64, true);   // de nouveau : le tampon est là, rien n'est remplacé
            expect(await tamponsDeLEspace(page)).toEqual(apresReimport);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
