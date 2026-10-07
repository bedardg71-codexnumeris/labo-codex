import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT A3 DU CHANTIER DES ARCHIVES — « FAIRE REVENIR » DES COPIES (#1000, 4 oct. 2026)
// =======================================================================
//
// Réglages › Données › Archives : la ligne d'une archive VÉRIFIÉE porte « Faire revenir ». Le clic
// ouvre le sélecteur (mode fichier, Safari), puis une fenêtre qui dit ce qui va se passer, puis le
// bilan en nombres. Sur le pack démo, huit copies fictives, une par cas de la consigne (point 2) :
// deux revenues (dont une fiche « manquant »), deux déjà là (dont une fiche « manquant » au fichier
// présent, #997), une changée, une d'un élève supprimé, une sans fiche, une abîmée dans l'archive.
//
// Ce que ce banc juge : le VRAI bouton, le VRAI sélecteur (intercepté), les vraies fenêtres, le vrai
// magasin des copies (travauxStockage → db.storeBlob), sous WebKit ; les octets revenus sont ceux de
// l'archive ; rien d'autre n'a bougé dans l'espace ; le codex compte ensuite les seules copies qui
// manquent vraiment (#1012) ; un essai à la largeur de l'iPad (768 px) par de vrais clics.
// Le détail des cas et les mutations : Vitest (sentinelle-lot-A3-faire-revenir.test.js).
//
// WebKit éphémère ne garde pas un Blob dans IndexedDB : le magasin de la page est en mémoire
// (db.storeBlob / getBlob / deleteBlob), le chemin travauxStockage reste le vrai. Noms fictifs.

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

async function demarrerDemo(page) {
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
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    // G1 (1.186.6) : le codex n'emporte plus la démo. Le banc vit dans la démo ; le temps de la
    // génération, ses clés sont présentées au codex sous un trimestre réel fictif (a2031_),
    // sans rien écrire en base. Les copies, elles, se lisent par leur id, inchangé.
    await page.evaluate(() => {
        window.__codexDuBanc = async (options) => {
            const { keys, get } = db;
            db.keys = async () => (await keys.call(db)).map((k) => k.replace(/^demo_/, 'a2031_'));
            db.get = (k, d) => get.call(db, k.replace(/^a2031_/, 'demo_'), d);
            try {
                return await Codex.generer(options);
            } finally {
                db.keys = keys;
                db.get = get;
            }
        };
    });
}

const IDS = ['FT_r1', 'FT_r2', 'FT_r3', 'FT_c4', 'FT_d5', 'FT_s6', 'FT_a7', 'FT_ok8'];

/** Le magasin en mémoire, huit copies fictives sous le premier groupe de la démo, posées par le vrai stockerBlob. */
async function poserCopies(page) {
    return page.evaluate(async (ids) => {
        window.__magasin = new Map();
        window.__ecritures = [];
        db.storeBlob = async (enr) => { window.__ecritures.push(enr.id); window.__magasin.set(enr.id, enr); };
        db.getBlob = async (id) => window.__magasin.get(id) || null;
        db.deleteBlob = async (id) => { window.__magasin.delete(id); };
        const gc = Reserve.listerGroupesVersables()[0];
        const eleves = (db.getSync(cle('groupeEtudiants'), []) || []).filter((e) => e && e.da).slice(0, ids.length);
        const octets = (n, g) => { const u = new Uint8Array(n); let x = g; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; } return u; };
        const fiches = [];
        window.__originaux = {};
        for (let i = 0; i < ids.length; i++) {
            const u = octets(40000 + i * 7001, i + 1);
            window.__originaux[ids[i]] = u;
            fiches.push({ id: ids[i], nomFichier: 'copie-fictive-' + (i + 1) + '.pdf', typeMIME: 'application/pdf', etudiantDA: eleves[i].da, productionId: 'P1', groupeCoursId: gc.id, tailleFichier: u.length, blobStatut: 'present' });
            await travauxStockage.stockerBlob(ids[i], new Blob([u], { type: 'application/pdf' }), eleves[i].da, 'P1');
        }
        db.setSync(cle('fichiersTravaux'), fiches);
        return { gc, trimestre: obtenirTrimestreId(), das: eleves.map((e) => e.da) };
    }, IDS);
}

async function archiverVersDisque(page, gc, trimestre, chemin) {
    const rendu = await page.evaluate(async ({ id, trimestre }) => {
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.FichierSortant.telecharger = (blob, nom) => { window.__archive = { blob, nom }; return { methode: 'banc' }; };
        window.FichierSortant.confirmerTelechargement = async () => true;
        const r = await Reserve.verserGroupeCours(trimestre, id);
        const u8 = new Uint8Array(await window.__archive.blob.arrayBuffer());
        let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return { succes: r && r.succes, dossier: r && r.dossier, uuid: r && r.uuid, base64: btoa(s) };
    }, { id: gc.id, trimestre });
    expect(rendu.succes).toBe(true);
    writeFileSync(chemin, Buffer.from(rendu.base64, 'base64'));
    return rendu;
}

const tableau = (page) => page.locator('#reserve-reglages-table-conteneur');

async function rafraichirTableau(page) {
    await page.evaluate(() => ReserveReglages.rafraichir());
    await page.waitForTimeout(300);
}

/** La fenêtre ouverte : son titre, son texte ; puis le bouton nommé (ou le premier). */
async function lireEtFermer(page, libelle) {
    const fenetre = page.locator('#overlay-ui-dialogue');
    await expect(fenetre).toBeVisible({ timeout: 15000 });
    const titre = await fenetre.locator('#ui-dialogue-titre').innerText();
    const message = await fenetre.locator('.modal-section').innerText();
    const boutons = fenetre.locator('.modal-actions button');
    const boutonsTextes = await boutons.allInnerTexts();
    const largeur = (await fenetre.locator('.modal-contenu').boundingBox()).width;
    // La fenêtre suivante reprend le même id : on attend que CELLE-CI soit retirée.
    const celleCi = await fenetre.elementHandle();
    await (libelle ? boutons.filter({ hasText: libelle }) : boutons.first()).click();
    await celleCi.waitForElementState('hidden', { timeout: 60000 });
    return { titre, message, boutonsTextes, largeur };
}

async function verifierParLeBouton(page, dossier, fichier) {
    const attente = page.waitForEvent('filechooser', { timeout: 15000 });
    await page.evaluate((d) => {
        document.querySelector('[data-action="ReserveVerifier.actionVerifier"][data-param="' + d + '"]').click();
    }, dossier);
    await (await attente).setFiles(fichier);
    const r = await lireEtFermer(page);
    await rafraichirTableau(page);
    return r;
}

/** Les cas de la consigne, au banc seulement ; l'archive est abîmée sur le disque pour FT_a7. */
async function preparerLesCas(page, das, fichier) {
    await page.evaluate(async (das) => {
        const ts = travauxStockage;
        await ts.supprimerBlob('FT_r1');
        await ts.supprimerBlob('FT_r2');
        const u = new Uint8Array(window.__originaux.FT_c4); u[10] ^= 0xFF;
        window.__c4change = u;
        await ts.stockerBlob('FT_c4', new Blob([u]), das[3], 'P1');
        await ts.supprimerBlob('FT_d5');
        await ts.supprimerBlob('FT_s6');
        await ts.supprimerBlob('FT_a7');
        const fiches = db.getSync(cle('fichiersTravaux')).map((f) => Object.assign({}, f));
        fiches.find((f) => f.id === 'FT_r2').blobStatut = 'manquant';
        fiches.find((f) => f.id === 'FT_r3').blobStatut = 'manquant';
        db.setSync(cle('fichiersTravaux'), fiches.filter((f) => f.id !== 'FT_s6'));
        db.setSync(cle('groupeEtudiants'), db.getSync(cle('groupeEtudiants')).filter((e) => e.da !== das[4]));
        db.setSync(cle('elevesDesinscrits'), [{ da: das[4], date: '2026-10-02' }]);
        window.__ecritures = [];
    }, das);
    const u8 = readFileSync(fichier);
    const position = u8.indexOf(Buffer.from('travaux/FT_a7.pdf')) + 'travaux/FT_a7.pdf'.length + 700;
    u8[position] ^= 0x01;
    writeFileSync(fichier, u8);
}

/** Tout l'espace (clés de db), sauf la liste des copies, en texte. */
const instantane = (page) => page.evaluate(async () => {
    const cles = (await db.keys()).filter((k) => k !== cle('fichiersTravaux')).sort();
    const paires = [];
    for (const k of cles) paires.push([k, JSON.stringify(await db.get(k))]);
    return JSON.stringify(paires);
});

/** Le compte du codex (#1012) : combien de copies attendues, combien manquent. La génération s'arrête là. */
const compteDuCodex = (page) => page.evaluate(async () => {
    let compte = null;
    const r = await window.__codexDuBanc({ confirmerCopiesManquantes: async (m, a) => { compte = { manquantes: m, attendues: a }; return false; } });
    // Rien ne manque : la fenêtre n'est pas appelée, le compte est dans le codex généré.
    return compte || (r && r.copies) || null;
});

test.describe('Lot A3 — « Faire revenir » les copies d\'une archive vérifiée (mode fichier)', () => {
    test.setTimeout(180000);

    test('chaque cas donne ce qu\'il doit ; octets identiques à l\'archive ; rien d\'autre ne bouge ; le codex ne compte que les vraies absences', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const { gc, trimestre, das } = await poserCopies(page);
        const dossierTmp = path.join(__dirname, '.tmp-lot-a3');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, 'archive-banc.zip');
        try {
            const archive = await archiverVersDisque(page, gc, trimestre, fichier);
            await rafraichirTableau(page);
            // Avant la vérification : pas de « Faire revenir ».
            await expect(tableau(page).locator('[data-action="ReserveRevenir.actionFaireRevenir"]')).toHaveCount(0);
            expect((await verifierParLeBouton(page, archive.dossier, fichier)).titre).toBe('Archive vérifiée');
            await expect(tableau(page).locator('[data-action="ReserveRevenir.actionFaireRevenir"]')).toHaveText('Faire revenir');

            await preparerLesCas(page, das, fichier);
            expect(await compteDuCodex(page)).toEqual({ manquantes: 4, attendues: 7 });
            const avant = await instantane(page);
            const listeAvant = await page.evaluate(() => db.getSync(cle('fichiersTravaux')));

            // Le geste : le bouton, le sélecteur, la fenêtre, le bilan.
            const attente = page.waitForEvent('filechooser', { timeout: 15000 });
            await page.evaluate((d) => {
                document.querySelector('[data-action="ReserveRevenir.actionFaireRevenir"][data-param="' + d + '"]').click();
            }, archive.dossier);
            await (await attente).setFiles(fichier);
            const fenetre = await lireEtFermer(page, 'Faire revenir');
            expect(fenetre.titre).toBe('Faire revenir les copies');
            expect(fenetre.boutonsTextes).toEqual(['Annuler', 'Faire revenir']);
            const bilan = await lireEtFermer(page);
            expect(bilan.titre).toBe('Copies revenues, archive abîmée');
            expect(bilan.message.split('\n').filter(Boolean)).toEqual([
                '1 copie de l\'archive est abîmée : elle n\'est pas revenue. Vérifie de nouveau cette archive.',
                '2 copies revenues',
                '2 copies déjà là',
                '1 copie changée depuis l\'archive, laissée telle quelle',
                '1 copie sans fiche dans l\'application',
                '1 copie d\'un·e étudiant·e supprimé·e'
            ]);

            // Le magasin : seules r1 et r2 ont été écrites, octet pour octet ; c4 n'a pas bougé.
            const magasin = await page.evaluate(async () => {
                const hex = async (b) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await b.arrayBuffer()))).map((x) => x.toString(16).padStart(2, '0')).join('');
                const r = { ecritures: window.__ecritures.slice().sort(), presents: [...window.__magasin.keys()].sort() };
                for (const id of ['FT_r1', 'FT_r2']) r[id] = (await hex(window.__magasin.get(id).blob)) === (await hex(new Blob([window.__originaux[id]])));
                r.c4 = (await hex(window.__magasin.get('FT_c4').blob)) === (await hex(new Blob([window.__c4change])));
                return r;
            });
            expect(magasin).toEqual({
                ecritures: ['FT_r1', 'FT_r2'],
                presents: ['FT_c4', 'FT_ok8', 'FT_r1', 'FT_r2', 'FT_r3'],
                FT_r1: true, FT_r2: true, c4: true
            });

            // L'espace : rien n'a bougé, sauf r2 et r3 qui redeviennent « present ».
            expect(await instantane(page)).toBe(avant);
            const listeApres = await page.evaluate(() => db.getSync(cle('fichiersTravaux')));
            expect(listeApres).toEqual(listeAvant.map((f) => (['FT_r2', 'FT_r3'].includes(f.id) ? Object.assign({}, f, { blobStatut: 'present' }) : f)));

            // Le codex (#1012) : n'attend plus que d5 (élève supprimé) et a7 (abîmée).
            expect(await compteDuCodex(page)).toEqual({ manquantes: 2, attendues: 7 });
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });

    test('verdict de relecture : une fiche « exporte » sans fichier revient, garde « exporte », et le codex l\'écrit sans ouvrir la fenêtre de #1012', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const { gc, trimestre } = await poserCopies(page);
        const dossierTmp = path.join(__dirname, '.tmp-lot-a3-exporte');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, 'archive-banc.zip');
        try {
            const archive = await archiverVersDisque(page, gc, trimestre, fichier);
            await rafraichirTableau(page);
            expect((await verifierParLeBouton(page, archive.dossier, fichier)).titre).toBe('Archive vérifiée');
            // La copie libérée après l'export ZIP de Travaux : « exporte », sans fichier.
            await page.evaluate(async () => {
                await travauxStockage.supprimerBlob('FT_r1');
                const fiches = db.getSync(cle('fichiersTravaux')).map((f) => Object.assign({}, f));
                Object.assign(fiches.find((f) => f.id === 'FT_r1'), { blobStatut: 'exporte', dateExport: '2026-10-01T12:00:00.000Z' });
                db.setSync(cle('fichiersTravaux'), fiches);
            });
            const attente = page.waitForEvent('filechooser', { timeout: 15000 });
            await page.evaluate((d) => {
                document.querySelector('[data-action="ReserveRevenir.actionFaireRevenir"][data-param="' + d + '"]').click();
            }, archive.dossier);
            await (await attente).setFiles(fichier);
            await lireEtFermer(page, 'Faire revenir');
            expect((await lireEtFermer(page)).message.split('\n')).toEqual(['1 copie revenue', '7 copies déjà là']);
            expect(await page.evaluate(() => db.getSync(cle('fichiersTravaux')).find((f) => f.id === 'FT_r1').blobStatut)).toBe('exporte');

            // Le codex : la fenêtre n'est pas appelée, et la copie revenue est dans le fichier.
            const codex = await page.evaluate(async () => {
                let fenetre = false;
                const r = await window.__codexDuBanc({ confirmerCopiesManquantes: async () => { fenetre = true; return false; } });
                const noms = r ? (await ReserveVerifier.lireRepertoireZip(r.blob)).map((e) => e.nom) : [];
                return { fenetre, copies: r && r.copies, r1: noms.filter((n) => /\/FT_r1\.pdf$/.test(n)).length };
            });
            expect(codex).toEqual({ fenetre: false, copies: { attendues: 7, manquantes: 0 }, r1: 1 });
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });

    test('à la largeur de l\'iPad (768 px), par de vrais clics : une copie revient, le codex ne l\'attend plus', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        const { gc, trimestre } = await poserCopies(page);
        const dossierTmp = path.join(__dirname, '.tmp-lot-a3-ipad');
        mkdirSync(dossierTmp, { recursive: true });
        const fichier = path.join(dossierTmp, 'archive-banc.zip');
        try {
            const archive = await archiverVersDisque(page, gc, trimestre, fichier);
            await rafraichirTableau(page);
            expect((await verifierParLeBouton(page, archive.dossier, fichier)).titre).toBe('Archive vérifiée');
            await page.evaluate(async () => { await travauxStockage.supprimerBlob('FT_r1'); window.__ecritures = []; });
            expect(await compteDuCodex(page)).toEqual({ manquantes: 1, attendues: 8 });

            await page.evaluate(() => { afficherSection('reglages'); });
            await page.waitForTimeout(300);
            await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
            await page.waitForTimeout(500);
            const accordeon = page.locator('#accordeon-reserve');
            if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').click();
            const bouton = tableau(page).locator('[data-action="ReserveRevenir.actionFaireRevenir"]');
            await expect(bouton).toBeVisible({ timeout: 15000 });
            const attente = page.waitForEvent('filechooser', { timeout: 15000 });
            await bouton.click();
            await (await attente).setFiles(fichier);
            const fenetre = await lireEtFermer(page, 'Faire revenir');
            expect(fenetre.largeur).toBeLessThanOrEqual(768);
            const bilan = await lireEtFermer(page);
            expect(bilan.titre).toBe('Copies revenues');
            expect(bilan.message.split('\n')).toEqual(['1 copie revenue', '7 copies déjà là']);
            expect(bilan.largeur).toBeLessThanOrEqual(768);
            expect(await page.evaluate(() => window.__ecritures)).toEqual(['FT_r1']);
            expect(await compteDuCodex(page)).toEqual({ manquantes: 0, attendues: 8 });
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
        } finally {
            rmSync(dossierTmp, { recursive: true, force: true });
        }
        expect(erreurs).toEqual([]);
    });
});
