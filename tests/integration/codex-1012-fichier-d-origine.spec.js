import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1012, première pièce (second verdict de relecture de Cowork sur #1011, 1er oct. 2026) — LE
// FICHIER D'ORIGINE N'EST TENU QU'À BON DROIT.
//
// Dans Chrome, « Ouvrir un codex… » du menu rend une poignée sur le fichier choisi ; tant que
// l'application la tient, « Mettre à jour le codex » réécrit CE fichier sans rien demander.
// `actionOuvrir` la rangeait AVANT l'ouverture, et rien ne la défaisait quand l'ouverture
// n'aboutissait pas : l'application tenait le fichier B qu'on venait de choisir, avec les
// données A d'avant, et la mise à jour écrivait A dans B.
//
// LA RÈGLE (Cowork, consigne du 1er oct., 12 h 41) :
//   – après une ouverture complète, l'application adopte le fichier choisi ;
//   – après une annulation ou un refus d'avant toute écriture, elle garde celui d'avant ;
//   – après toute autre fin, elle n'en tient aucun.
//
// CE QUE CE BANC JUGE, par le vrai geste d'écriture (le bouton « Mettre à jour le codex » du
// menu) : DANS QUEL FICHIER le codex est écrit, et avec quelles données ; ou bien que
// l'application demande où écrire, sans toucher à aucun fichier.
//
// CE QU'IL NE JUGE PAS : WebKit n'a ni `showOpenFilePicker` ni `showSaveFilePicker`. Le banc
// pose les deux. Le premier rend une fausse poignée (un objet avec `name`, `getFile` et
// `createWritable`) qui consigne ce qu'on lui écrit ; le second consigne qu'une destination a
// été demandée, puis répond comme un « Annuler ». Que Chrome rende une vraie poignée, qu'il
// demande la permission d'écrire à la première réécriture, et que sa fenêtre de destination
// s'ouvre bien, reste inféré. Le refus du pré-vol vient d'un `navigator.storage.estimate`
// remplacé ; l'écriture refusée en cours d'ouverture est injectée.

const CLE_GROUPE = 'a2031_groupeEtudiants';
const CLE_COPIES = 'a2031_fichiersTravaux';
const CLE_PRODUCTIONS = 'a2031_productions';
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Deux codex fictifs. Leurs productions ne citent aucun cours commun : ouvrir l'un dans
// l'espace de l'autre déclenche la garde de modèle antérieur (#335), avant toute écriture.
const jeu = (lettre, prenom) => ({
    nom: 'Codex ' + lettre + ' du banc',
    fichier: 'codex-' + lettre + '.zip',
    donnees: {
        [CLE_GROUPE]: [{ da: '900000' + (lettre === 'A' ? 1 : 2), nom: 'Fictif', prenom, groupe: '00001' }],
        // Au-delà du seuil où `db` écrit la clé dans IndexedDB : c'est là que le banc (2) injecte un
        // refus. Cette clé s'écrit après le groupe et les copies.
        [CLE_PRODUCTIONS]: [{ id: 'PROD_banc_' + lettre, titre: 'Production fictive ' + lettre, coursId: 'COURS_BANC_' + lettre, remplissage: 'x'.repeat(30 * 1024) }],
        [CLE_COPIES]: [1, 2, 3].map((i) => ({
            id: 'FT_banc_' + lettre + '_' + i, nomFichier: 'copie-' + i + '.png', typeMIME: 'image/png',
            etudiantDA: '900000' + (lettre === 'A' ? 1 : 2), productionId: 'PROD_banc_' + lettre, blobStatut: 'present',
            remplissage: 'x'.repeat(12 * 1024)
        }))
    }
});
const A = jeu('A', 'Alix');
const B = jeu('B', 'Maude');

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/** Un codex du banc : le vrai `Codex.generer`, trois copies d'un pixel. */
async function fabriquerCodex(page, leJeu, chemin) {
    const rendu = await page.evaluate(async ({ donnees, cleCopies, png, nom }) => {
        Object.keys(donnees).forEach((cle) => db.setSync(cle, donnees[cle]));
        await db.flush();
        // Aucune copie ne se stocke dans le contexte éphémère de WebKit : la lecture est enveloppée.
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const ids = donnees[cleCopies].map((c) => c.id);
        const origine = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async (id) => ids.includes(id) ? new Blob([octets], { type: 'image/png' }) : origine(id);
        // L'aperçu « voici ce qui part » attend un clic : accepté d'office, comme aux bancs voisins.
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const codex = await Codex.generer({ nom });
        const zip = await JSZip.loadAsync(await codex.blob.arrayBuffer());
        const nbCopies = Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).length;
        const o = new Uint8Array(await codex.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return { b64: btoa(binaire), nbCopies };
    }, { donnees: leJeu.donnees, cleCopies: CLE_COPIES, png: PNG_1PX, nom: leJeu.nom });
    expect(rendu.nbCopies, 'témoin : le codex ' + leJeu.nom + ' porte ses trois copies').toBe(3);
    fs.writeFileSync(chemin, Buffer.from(rendu.b64, 'base64'));
}

/** Les deux codex, fabriqués dans la page du banc ; ils s'ouvrent ailleurs. */
async function fabriquerLesDeux(page) {
    await demarrer(page);
    const fichiers = { A: test.info().outputPath(A.fichier), B: test.info().outputPath(B.fichier) };
    await fabriquerCodex(page, A, fichiers.A);
    await fabriquerCodex(page, B, fichiers.B);
    return fichiers;
}

/**
 * Un espace neuf, dans un autre contexte, équipé comme Chrome : des poignées qui consignent ce
 * qu'on leur écrit, une fenêtre de destination qui consigne qu'on l'a demandée.
 */
async function ouvrirEspaceNeuf(browser) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    await demarrer(page);
    await page.evaluate((cleGroupe) => {
        window.__messages = [];
        ['succes', 'erreur', 'warning', 'info'].forEach((sorte) => {
            const origine = window.notifications[sorte];
            window.notifications[sorte] = function (titre, detail) { window.__messages.push({ sorte, titre, detail }); return origine.apply(this, arguments); };
        });
        window.__ecritures = [];
        window.__destinationsDemandees = 0;
        window.__poignee = (nom, fichier) => ({
            kind: 'file',
            name: nom,
            getFile: async () => fichier,
            createWritable: async () => {
                let recu = null;
                return {
                    write: async (blob) => { recu = blob; },
                    abort: async () => {},
                    close: async () => {
                        const zip = await JSZip.loadAsync(await recu.arrayBuffer());
                        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
                        window.__ecritures.push({ fichier: nom, donneesDe: donnees[cleGroupe][0].prenom });
                    }
                };
            }
        });
        window.showSaveFilePicker = async () => {
            window.__destinationsDemandees++;
            throw new DOMException('Fenêtre de destination refermée par le banc', 'AbortError');
        };
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        // Les copies sont acceptées (le contexte éphémère de WebKit ne les stockerait pas).
        db.storeBlob = async () => {};
    }, CLE_GROUPE);
    expect(await page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : l\'espace neuf est vide').toBeNull();
    return { contexte, page };
}

const versFichier = (chemin) => fs.readFileSync(chemin).toString('base64');

/** Le geste du menu dans Chrome : le sélecteur rend la poignée du fichier choisi. */
async function choisirParLeMenu(page, base64, nom) {
    await page.evaluate(({ b64, nom }) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const leFichier = new File([octets], nom, { type: 'application/zip' });
        window.showOpenFilePicker = async () => [window.__poignee(nom, leFichier)];
        window.__ouverture = Codex.actionOuvrir();
    }, { b64: base64, nom });
}

/** Le geste de la case : Réglages › Données, « Ouvrir un Codex… », le fichier. */
async function choisirParLaCase(page, chemin) {
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    await page.locator('#reglages-donnees [data-action="ouvrirModalImport"]').click();
    await expect(page.locator('#modalImport')).toBeVisible();
    await page.setInputFiles('#fichierImport', chemin);
}

const boutonAnnuler = (page) => page.getByRole('button', { name: 'Annuler', exact: true });
const messages = (page, sorte) => page.evaluate((s) => window.__messages.filter((m) => m.sorte === s), sorte);
const viderLesMessages = (page) => page.evaluate(() => { window.__messages.length = 0; });

/** Une ouverture complète par le menu, sans recharger : l'application reste dans la même page. */
async function ouvrirEnEntier(page, chemin, leJeu) {
    await choisirParLeMenu(page, versFichier(chemin), leJeu.fichier);
    await expect(page.getByText('Codex chargé depuis « ' + leJeu.fichier + ' »')).toBeVisible({ timeout: 30000 });
    await boutonAnnuler(page).click();
    await page.evaluate(() => window.__ouverture);
    expect((await messages(page, 'succes')).map((m) => m.titre), 'témoin : l\'ouverture de ' + leJeu.nom + ' est complète').toContain('Codex ouvert : ' + leJeu.nom);
    expect(await messages(page, 'warning')).toEqual([]);
    await viderLesMessages(page);
}

/** La garde de modèle antérieur, refusée : un refus d'avant toute écriture. */
async function annulerALaGarde(page) {
    await expect(page.getByText('Modèle antérieur détecté')).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: 'Annuler', exact: true }).click();
    await expect.poll(async () => (await messages(page, 'info')).map((m) => m.titre), { timeout: 15000 })
        .toEqual(['Import annulé : ton espace de travail n\'a pas été modifié.']);
    await viderLesMessages(page);
}

/**
 * Le vrai geste : le menu Codex, « Mettre à jour le codex ». Rend ce qui s'est passé : les
 * écritures reçues par les poignées, et le nombre de fois où une destination a été demandée.
 */
async function mettreAJourLeCodex(page) {
    const avant = await page.evaluate(() => ({ ecritures: window.__ecritures.length, destinations: window.__destinationsDemandees }));
    await page.locator('#btn-codex').click();
    const sousTexte = await page.evaluate(() => {
        const el = document.getElementById('codex-menu-enreg-info');
        return el.classList.contains('u-hide') ? null : el.textContent;
    });
    await page.locator('#codex-menu [data-action="Codex.actionEnregistrer"]').click();
    await expect.poll(() => page.evaluate(() => window.__ecritures.length + window.__destinationsDemandees), { timeout: 30000 })
        .toBe(avant.ecritures + avant.destinations + 1);
    return page.evaluate(({ avant, sousTexte }) => ({
        sousTexte,
        ecritures: window.__ecritures.slice(avant.ecritures),
        destinationsDemandees: window.__destinationsDemandees - avant.destinations
    }), { avant, sousTexte });
}

const ECRIT_DANS_A = { sousTexte: 'Dans le même fichier', ecritures: [{ fichier: A.fichier, donneesDe: 'Alix' }], destinationsDemandees: 0 };
const DEMANDE_OU_ECRIRE = { sousTexte: null, ecritures: [], destinationsDemandees: 1 };

test.describe('#1012 — le fichier d\'origine n\'est tenu qu\'après une ouverture complète', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(1) annulation ou refus d\'avant toute écriture : l\'application garde le fichier d\'avant', async ({ page, browser }) => {
        test.setTimeout(240000);
        const fichiers = await fabriquerLesDeux(page);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichiers.A, A);
        expect(await mettreAJourLeCodex(neuf.page), 'témoin : après l\'ouverture complète de A, la mise à jour écrit dans A').toEqual(ECRIT_DANS_A);

        await test.step('B choisi par le menu, refusé à la garde de modèle antérieur', async () => {
            await choisirParLeMenu(neuf.page, versFichier(fichiers.B), B.fichier);
            await annulerALaGarde(neuf.page);
            await neuf.page.evaluate(() => window.__ouverture);
            expect.soft(await mettreAJourLeCodex(neuf.page), 'la mise à jour écrit encore dans A, pas dans B').toEqual(ECRIT_DANS_A);
        });

        await test.step('un fichier qui n\'est pas un codex, choisi par le menu', async () => {
            await choisirParLeMenu(neuf.page, Buffer.from('ceci n\'est pas un codex').toString('base64'), 'photos-de-vacances.zip');
            await neuf.page.evaluate(() => window.__ouverture);
            const [erreur] = await messages(neuf.page, 'erreur');
            expect(erreur.titre, 'témoin : l\'ouverture est refusée').toBe('Le codex n\'a pas pu être ouvert');
            await viderLesMessages(neuf.page);
            expect.soft(await mettreAJourLeCodex(neuf.page), 'la mise à jour écrit encore dans A, pas dans le fichier choisi par erreur').toEqual(ECRIT_DANS_A);
        });

        await test.step('B choisi par la case, refusé à la garde de modèle antérieur', async () => {
            await choisirParLaCase(neuf.page, fichiers.B);
            await annulerALaGarde(neuf.page);
            expect.soft(await mettreAJourLeCodex(neuf.page), 'la case non plus ne fait pas oublier A').toEqual(ECRIT_DANS_A);
        });

        await test.step('B choisi par le menu, refusé au pré-vol (trop peu d\'espace accordé)', async () => {
            await neuf.page.evaluate(() => {
                // Sur le prototype : sous WebKit, la même propriété posée sur `navigator.storage` n'est pas lue.
                StorageManager.prototype.estimate = async () => ({ quota: 50 * 1024 * 1024, usage: 0 });
            });
            await choisirParLeMenu(neuf.page, versFichier(fichiers.B), B.fichier);
            await neuf.page.evaluate(() => window.__ouverture);
            const [erreur] = await messages(neuf.page, 'erreur');
            expect(erreur.detail, 'témoin : c\'est le refus du pré-vol').toMatch(/^Espace insuffisant pour ouvrir ce codex\./);
            await viderLesMessages(neuf.page);
            expect.soft(await mettreAJourLeCodex(neuf.page), 'la mise à jour écrit encore dans A, pas dans B').toEqual(ECRIT_DANS_A);
        });

        expect(await neuf.page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : l\'espace porte toujours les données de A').toEqual(A.donnees[CLE_GROUPE]);
        await neuf.contexte.close();
    });

    test('(2) une ouverture qui échoue après ses premières écritures : aucun fichier tenu', async ({ page, browser }) => {
        test.setTimeout(180000);
        const fichiers = await fabriquerLesDeux(page);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichiers.A, A);
        expect(await mettreAJourLeCodex(neuf.page), 'témoin : A est tenu').toEqual(ECRIT_DANS_A);

        // L'espace se remplit pendant l'ouverture de B : la clé des productions est refusée, après
        // d'autres clés déjà écrites. La garde de modèle antérieur est acceptée (« Remplacer »).
        await neuf.page.evaluate((cleRefusee) => {
            window.__journal = [];
            const ecrire = db._setIndexedDB.bind(db);
            db._setIndexedDB = function (cle, valeur) {
                if (cle === cleRefusee) {
                    window.__journal.push('clé refusée ' + cle);
                    return Promise.reject(new DOMException('Quota du banc', 'QuotaExceededError'));
                }
                return ecrire(cle, valeur);
            };
        }, CLE_PRODUCTIONS);
        await choisirParLeMenu(neuf.page, versFichier(fichiers.B), B.fichier);
        await expect(neuf.page.getByText('Modèle antérieur détecté')).toBeVisible({ timeout: 30000 });
        await neuf.page.getByRole('button', { name: 'Remplacer', exact: true }).click();
        await neuf.page.evaluate(() => window.__ouverture);

        const [erreur] = await messages(neuf.page, 'erreur');
        expect(erreur.titre).toBe('Le codex n\'a pas pu être ouvert');
        const compte = erreur.detail.match(/^L'espace s'est rempli pendant l'import \((\d+)\/\d+ clés écrites\)/);
        expect(compte, 'témoin : l\'échec est celui d\'une écriture refusée en cours d\'ouverture').not.toBeNull();
        expect(Number(compte[1]), 'témoin : des clés étaient déjà écrites').toBeGreaterThan(0);
        expect(await neuf.page.evaluate(() => window.__journal), 'témoin : le refus est celui du banc').toEqual(['clé refusée ' + CLE_PRODUCTIONS]);
        expect(await neuf.page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : des données de B sont déjà dans l\'espace').toEqual(B.donnees[CLE_GROUPE]);

        // Ni A (dont les données ne sont plus celles de l'espace), ni B (ouvert à moitié).
        expect(await mettreAJourLeCodex(neuf.page), 'la mise à jour demande où écrire').toEqual(DEMANDE_OU_ECRIRE);
        await neuf.contexte.close();
    });

    test('(3) une ouverture incomplète alors qu\'un autre fichier était tenu : aucun fichier tenu', async ({ page, browser }) => {
        test.setTimeout(180000);
        const fichiers = await fabriquerLesDeux(page);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichiers.A, A);
        expect(await mettreAJourLeCodex(neuf.page), 'témoin : A est tenu').toEqual(ECRIT_DANS_A);

        // Les copies de B sont refusées faute d'espace : l'ouverture va à son bout, incomplète.
        await neuf.page.evaluate(() => {
            db.storeBlob = async () => { throw new DOMException('Quota du banc', 'QuotaExceededError'); };
        });
        await choisirParLeMenu(neuf.page, versFichier(fichiers.B), B.fichier);
        await expect(neuf.page.getByText('Modèle antérieur détecté')).toBeVisible({ timeout: 30000 });
        await neuf.page.getByRole('button', { name: 'Remplacer', exact: true }).click();
        await expect(neuf.page.getByText('Recharger la page pour appliquer les données ?')).toBeVisible({ timeout: 30000 });
        await boutonAnnuler(neuf.page).click();
        await neuf.page.evaluate(() => window.__ouverture);
        expect(await messages(neuf.page, 'erreur'), 'témoin : pas d\'échec, une ouverture incomplète').toEqual([]);
        expect(await neuf.page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : les données de B sont dans l\'espace').toEqual(B.donnees[CLE_GROUPE]);

        // Ni B (le seul fichier qui porte toutes ses copies), ni A (un autre codex).
        expect(await mettreAJourLeCodex(neuf.page), 'la mise à jour demande où écrire').toEqual(DEMANDE_OU_ECRIRE);
        await neuf.contexte.close();
    });

    test('(4) témoin : après une ouverture complète de B, l\'application adopte B', async ({ page, browser }) => {
        test.setTimeout(180000);
        const fichiers = await fabriquerLesDeux(page);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichiers.A, A);
        expect(await mettreAJourLeCodex(neuf.page), 'témoin : A est tenu').toEqual(ECRIT_DANS_A);

        await choisirParLeMenu(neuf.page, versFichier(fichiers.B), B.fichier);
        await expect(neuf.page.getByText('Modèle antérieur détecté')).toBeVisible({ timeout: 30000 });
        await neuf.page.getByRole('button', { name: 'Remplacer', exact: true }).click();
        await expect(neuf.page.getByText('Codex chargé depuis « ' + B.fichier + ' »')).toBeVisible({ timeout: 30000 });
        await boutonAnnuler(neuf.page).click();
        await neuf.page.evaluate(() => window.__ouverture);

        expect(await mettreAJourLeCodex(neuf.page), 'la mise à jour écrit B dans B')
            .toEqual({ sousTexte: 'Dans le même fichier', ecritures: [{ fichier: B.fichier, donneesDe: 'Maude' }], destinationsDemandees: 0 });
        await neuf.contexte.close();
    });

    test('(5) témoin : après une ouverture complète par la case, aucun fichier tenu (un champ de fichier ne rend pas de poignée)', async ({ page, browser }) => {
        test.setTimeout(180000);
        const fichiers = await fabriquerLesDeux(page);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichiers.A, A);
        expect(await mettreAJourLeCodex(neuf.page), 'témoin : A est tenu').toEqual(ECRIT_DANS_A);

        await choisirParLaCase(neuf.page, fichiers.B);
        await expect(neuf.page.getByText('Modèle antérieur détecté')).toBeVisible({ timeout: 30000 });
        await neuf.page.getByRole('button', { name: 'Remplacer', exact: true }).click();
        await expect(neuf.page.getByText('Codex chargé depuis « ' + B.fichier + ' »')).toBeVisible({ timeout: 30000 });
        await boutonAnnuler(neuf.page).click();

        // Les données sont celles de B : les écrire dans A, « même fichier », serait le défaut.
        expect(await mettreAJourLeCodex(neuf.page), 'la mise à jour demande où écrire').toEqual(DEMANDE_OU_ECRIRE);
        await neuf.contexte.close();
    });
});
