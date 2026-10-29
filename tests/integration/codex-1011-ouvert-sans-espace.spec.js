import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1011 (retour testeur de Grégoire, 1er oct. 2026, porte du lot I bis, rangée 2.4) — UN CODEX
// OUVERT SANS ASSEZ D'ESPACE FINISSAIT PAR UN BANDEAU « ERREUR ».
//
// Chrome en navigation privée, son vrai codex : les copies sont refusées faute d'espace
// (comptées, l'ouverture continue), puis la réécriture de la liste des copies — celle qui les
// marque « manquantes » — est refusée elle aussi. Cette écriture n'avait pas de garde : son
// échec sautait le snapshot de référence, l'état « codex actif », le bilan « Import
// incomplet… » et la proposition de recharger. L'écran disait « Erreur », les données étaient
// écrites.
//
// CE QUE CE BANC JUGE, par le vrai geste (la case de Réglages › Données, le menu Codex) :
//  (1) et (2) : copies refusées, puis liste des copies refusée → le bilan de l'ouverture
//      incomplète, la proposition de recharger, le codex actif ; aucun message d'erreur.
//      Depuis #1012, le bilan est porté par la fenêtre de rechargement (mots de Grégoire du
//      1er oct., 12 h 40), plus par un bandeau qui s'en va.
//      La liste garde ses statuts d'avant, en mémoire comme dans le stockage ;
//  (3) toute écriture refusée après les copies (l'espace est plein pour de bon) → même fin ; le
//      codex est encore actif après un rechargement (#1182 : le snapshot de référence, ancêtre
//      de l'ancienne fusion, est retiré du code, et ses témoins de ce banc avec lui) ;
//  (4) le cœur de #1012 (verdict de relecture de Cowork) : après une ouverture INCOMPLÈTE par
//      le menu, l'application oublie le fichier d'origine — « Mettre à jour le codex » ne peut
//      plus le réécrire en place sans les copies qui manquent ; après une ouverture COMPLÈTE,
//      elle le garde (témoin) ;
//  (5) les mots tranchés par Grégoire le 1er oct. : le refus du pré-vol ne nomme plus de
//      navigateur, et le bandeau d'échec s'intitule « Le codex n'a pas pu être ouvert ».
//
// CE QU'IL NE JUGE PAS : le refus d'espace est INJECTÉ (`db.storeBlob` et l'écriture
// IndexedDB des clés rendent une `QuotaExceededError`). Le vrai manque d'espace de Chrome en
// navigation privée, et ce que `navigator.storage.estimate()` y répond au pré-vol, ne se
// mesurent que chez Grégoire. En (4), WebKit n'a pas de `showOpenFilePicker` : le banc en
// pose un qui rend un faux fichier « tenu » (un objet avec `getFile`). Que Chrome rende une vraie
// poignée, et que « Mettre à jour le codex » demande alors où écrire, reste inféré. En (5), ce
// que le navigateur dit de l'espace (`navigator.storage.estimate`) est remplacé.
//
// Le codex du banc est fabriqué par le vrai `Codex.generer`, sur un jeu fictif, et ouvert dans
// un autre contexte de navigateur (stockage à part, vide).

const CLE_GROUPE = 'a2031_groupeEtudiants';
const CLE_COPIES = 'a2031_fichiersTravaux';
const NOM_CODEX = 'Codex du banc';
const GROUPE_FICTIF = [
    { da: '9000001', nom: 'Fictif', prenom: 'Alix', groupe: '00001' },
    { da: '9000002', nom: 'Inventée', prenom: 'Maude', groupe: '00001' }
];
// La liste dépasse le seuil au-delà duquel `db` la garde en mémoire plutôt qu'en localStorage
// (25 Ki caractères) : la mémoire tient alors le MÊME tableau que l'ouverture, et un statut
// marqué sans être écrit s'y verrait.
const COPIES_FICTIVES = [1, 2, 3].map((i) => ({
    id: 'FT_banc_' + i, nomFichier: 'copie-' + i + '.png', typeMIME: 'image/png',
    etudiantDA: '900000' + (i % 2 + 1), productionId: 'PROD_banc', blobStatut: 'stocke',
    remplissage: 'x'.repeat(12 * 1024)
}));
const STATUTS_D_AVANT = COPIES_FICTIVES.map((c) => c.id + ':stocke');
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const QUESTION = 'Recharger la page pour appliquer les données ?';
const TITRE_DU_BILAN = 'Codex ouvert, mais incomplet';
const BILAN = '3 copies sur 3 n\'ont pas pu revenir, faute d\'espace. Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.'
    + '\n\nPour retrouver ces copies : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
    + '\n\n' + QUESTION;

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/** Le codex du banc : le vrai `Codex.generer`, trois copies d'un pixel. */
async function fabriquerCodex(page, chemin) {
    await demarrer(page);
    const base64 = await page.evaluate(async ({ cleGroupe, groupe, cleCopies, copies, png, nom }) => {
        db.setSync(cleGroupe, groupe);
        db.setSync(cleCopies, copies);
        await db.flush();
        // Aucune copie ne se stocke dans le contexte éphémère de WebKit : la lecture est enveloppée.
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const ids = copies.map((c) => c.id);
        const origine = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async (id) => ids.includes(id) ? new Blob([octets], { type: 'image/png' }) : origine(id);
        // L'aperçu « voici ce qui part » attend un clic : accepté d'office, comme aux bancs voisins.
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom });
        const zip = await JSZip.loadAsync(await rendu.blob.arrayBuffer());
        const nbCopies = Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).length;
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return { b64: btoa(binaire), nbCopies };
    }, { cleGroupe: CLE_GROUPE, groupe: GROUPE_FICTIF, cleCopies: CLE_COPIES, copies: COPIES_FICTIVES, png: PNG_1PX, nom: NOM_CODEX });
    expect(base64.nbCopies, 'témoin : le codex du banc porte ses trois copies').toBe(3);
    fs.writeFileSync(chemin, Buffer.from(base64.b64, 'base64'));
}

/** Un espace neuf, dans un autre contexte ; ce que l'usager lirait est consigné. */
async function ouvrirEspaceNeuf(browser) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    const avertissements = [];
    page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') avertissements.push(m.text()); });
    await demarrer(page);
    await page.evaluate(() => {
        window.__messages = [];
        ['succes', 'erreur', 'warning', 'info'].forEach((sorte) => {
            const origine = window.notifications[sorte];
            window.notifications[sorte] = function (titre, detail) { window.__messages.push({ sorte, titre, detail }); return origine.apply(this, arguments); };
        });
    });
    const avant = await etatDeLEspace(page);
    expect(avant.groupe, 'témoin : l\'espace neuf n\'a pas le jeu fictif').toBeNull();
    expect(avant.codexActif, 'témoin : aucun codex actif').toBe(false);
    return { contexte, page, avertissements };
}

/**
 * Le manque d'espace, injecté : chaque copie est refusée, puis les écritures de clés le sont.
 * `toutRefuser: false` ne refuse que la liste des copies (le cas lu dans le rapport de Grégoire) ;
 * `true` refuse toute clé (l'espace est plein pour de bon). Le journal dit ce qui a été refusé.
 */
async function injecterLeManqueDEspace(page, { toutRefuser }) {
    await page.evaluate((toutRefuser) => {
        window.__journal = [];
        let espacePlein = false;
        db.storeBlob = async (fiche) => {
            espacePlein = true;
            window.__journal.push('copie refusée ' + fiche.id);
            throw new DOMException('Quota du banc', 'QuotaExceededError');
        };
        const ecrire = db._setIndexedDB.bind(db);
        db._setIndexedDB = function (cle, valeur) {
            if (espacePlein && (toutRefuser || cle.indexOf('fichiersTravaux') !== -1)) {
                window.__journal.push('clé refusée ' + cle);
                return Promise.reject(new DOMException('Quota du banc', 'QuotaExceededError'));
            }
            return ecrire(cle, valeur);
        };
    }, toutRefuser);
}

/** Le geste, par la case : Réglages › Données, le bouton « Ouvrir un Codex… », le fichier. */
async function ouvrirParLaCase(page, fichier) {
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    await page.locator('#reglages-donnees [data-action="ouvrirModalImport"]').click();
    await expect(page.locator('#modalImport')).toBeVisible();
    await page.setInputFiles('#fichierImport', fichier);
}

/** Le geste, par le menu Codex : le chemin de Chrome, dont le sélecteur rend le fichier. */
async function ouvrirParLeMenu(page, fichier) {
    const base64 = fs.readFileSync(fichier).toString('base64');
    await page.evaluate((b64) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const leFichier = new File([octets], 'codex-du-menu.zip', { type: 'application/zip' });
        window.showOpenFilePicker = async () => [{ name: 'codex-du-menu.zip', getFile: async () => leFichier }];
        window.__parLeMenu = Codex.actionOuvrir();
    }, base64);
}

const etatDeLEspace = (page) => page.evaluate(async ({ cleGroupe, cleCopies }) => {
    const statuts = (liste) => Array.isArray(liste) ? liste.map((c) => c.id + ':' + c.blobStatut) : liste;
    // Lu dans IndexedDB même, en lecture seule : `db.get` répondrait par la mémoire quand la clé y vit.
    const lireLeStockage = (cle) => new Promise((ok, ko) => {
        const requete = db.db.transaction(['keyvalue'], 'readonly').objectStore('keyvalue').get(cle);
        requete.onsuccess = () => ok(requete.result ? requete.result.value : null);
        requete.onerror = () => ko(requete.error);
    });
    return {
        groupe: await db.get(cleGroupe, null),
        codexActif: Codex.etat().actif === true,
        codexNom: Codex.etat().nom || null,
        fichierTenu: Codex.etat().handleFSAPI === true,
        copiesStockees: statuts(await lireLeStockage(cleCopies)),
        copiesEnMemoire: statuts(db.getSync(cleCopies, null)),
        messages: window.__messages || null,
        journal: window.__journal || null
    };
}, { cleGroupe: CLE_GROUPE, cleCopies: CLE_COPIES });

/** La fin attendue : le bilan, la question du rechargement, le codex actif, pas d'erreur. */
async function attendreLeBilan(page) {
    await expect(page.getByText(QUESTION), 'le rechargement est proposé').toBeVisible({ timeout: 30000 });
    // #1012 : le bilan est dans la fenêtre, qui reste tant qu'on n'a pas répondu.
    const fenetre = await page.evaluate(() => ({
        titre: document.getElementById('ui-dialogue-titre').textContent,
        message: document.querySelector('#overlay-ui-dialogue .modal-section p').textContent
    }));
    expect(fenetre, 'la fenêtre de rechargement porte le bilan').toEqual({ titre: TITRE_DU_BILAN, message: BILAN });
    const etat = await etatDeLEspace(page);
    expect(etat.journal.filter((l) => l.indexOf('copie refusée') === 0), 'témoin : les trois copies ont été refusées').toHaveLength(3);
    expect(etat.journal, 'témoin : la liste des copies a été refusée').toContain('clé refusée ' + CLE_COPIES);
    expect(etat.messages.filter((m) => m.sorte === 'erreur'), 'aucun bandeau d\'erreur').toEqual([]);
    expect(etat.messages.filter((m) => m.sorte === 'warning'), 'plus de bandeau pour le bilan').toEqual([]);
    expect(etat.groupe, 'les données du codex sont dans l\'espace').toEqual(GROUPE_FICTIF);
    expect({ actif: etat.codexActif, nom: etat.codexNom }).toEqual({ actif: true, nom: NOM_CODEX });
    return etat;
}

test.describe('#1011 — un codex ouvert sans assez d\'espace va jusqu\'à son bilan', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(1) par la case : copies refusées, liste des copies refusée → bilan et rechargement proposé', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);

        const neuf = await ouvrirEspaceNeuf(browser);
        await injecterLeManqueDEspace(neuf.page, { toutRefuser: false });
        await ouvrirParLaCase(neuf.page, fichier);
        const etat = await attendreLeBilan(neuf.page);

        // Le marquage n'a pas pu s'écrire : la liste dit partout ce qui est stocké.
        expect(etat.copiesStockees, 'le stockage garde les statuts d\'avant').toEqual(STATUTS_D_AVANT);
        expect(etat.copiesEnMemoire, 'la mémoire dit la même chose que le stockage').toEqual(etat.copiesStockees);
        // La trace que porterait un rapport de bug (« AVERTISSEMENTS DU CODEX »).
        expect(neuf.avertissements.some((l) => l.indexOf('[Codex] Marquage des copies manquantes non écrit pour ' + CLE_COPIES) === 0)).toBe(true);
        await neuf.contexte.close();
    });

    test('(2) par le menu Codex : même fin', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);

        const neuf = await ouvrirEspaceNeuf(browser);
        await injecterLeManqueDEspace(neuf.page, { toutRefuser: false });
        await ouvrirParLeMenu(neuf.page, fichier);
        const etat = await attendreLeBilan(neuf.page);
        expect(etat.copiesStockees).toEqual(STATUTS_D_AVANT);
        expect(etat.copiesEnMemoire).toEqual(etat.copiesStockees);
        // #1012 : le fichier d'origine n'est plus tenu, il ne sera pas réécrit en place.
        expect(etat.fichierTenu, 'après une ouverture incomplète, le fichier d\'origine est oublié').toBe(false);
        await neuf.page.getByRole('button', { name: 'Annuler', exact: true }).click();
        await neuf.page.evaluate(() => window.__parLeMenu);
        await neuf.contexte.close();
    });

    test('(3) l\'espace est plein pour de bon : toute écriture refusée, même fin, et le codex reste actif après un rechargement', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);

        const neuf = await ouvrirEspaceNeuf(browser);
        await injecterLeManqueDEspace(neuf.page, { toutRefuser: true });
        await ouvrirParLaCase(neuf.page, fichier);
        const etat = await attendreLeBilan(neuf.page);

        // Ce que vivrait quelqu'un qui recharge : ses données sont là, son codex est actif.
        await neuf.page.getByRole('button', { name: 'Annuler', exact: true }).click();
        await neuf.page.reload();
        await neuf.page.waitForLoadState('domcontentloaded');
        await neuf.page.waitForTimeout(3000);
        const apres = await etatDeLEspace(neuf.page);
        expect(apres.groupe).toEqual(GROUPE_FICTIF);
        expect({ actif: apres.codexActif, nom: apres.codexNom }).toEqual({ actif: true, nom: NOM_CODEX });
        await neuf.contexte.close();
    });

    test('(4) témoin de #1012 : après une ouverture complète par le menu, le fichier d\'origine reste tenu', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);

        const neuf = await ouvrirEspaceNeuf(browser);
        // Les copies sont acceptées (le contexte éphémère de WebKit ne les stockerait pas) :
        // l'ouverture est complète.
        await neuf.page.evaluate(() => { db.storeBlob = async () => {}; });
        await ouvrirParLeMenu(neuf.page, fichier);
        await expect(neuf.page.getByText('Codex chargé depuis « codex-du-menu.zip »')).toBeVisible({ timeout: 30000 });
        const etat = await etatDeLEspace(neuf.page);
        expect(etat.messages.filter((m) => m.sorte === 'succes').map((m) => m.titre)).toEqual(['Codex ouvert : ' + NOM_CODEX]);
        expect(etat.messages.filter((m) => m.sorte === 'warning' || m.sorte === 'erreur')).toEqual([]);
        expect(etat.fichierTenu, 'après une ouverture complète, le fichier d\'origine reste tenu').toBe(true);
        await neuf.page.getByRole('button', { name: 'Annuler', exact: true }).click();
        await neuf.page.evaluate(() => window.__parLeMenu);
        await neuf.contexte.close();
    });

    for (const cas of [
        { nom: 'peu d\'espace accordé (navigation privée probable)', quota: 50 * 1024 * 1024, usage: 0, phrasePrivee: true },
        { nom: 'espace accordé mais presque tout pris', quota: 600 * 1024 * 1024, usage: 590 * 1024 * 1024, phrasePrivee: false }
    ]) {
        test('(5) les mots du refus du pré-vol — ' + cas.nom, async ({ page, browser }) => {
            test.setTimeout(120000);
            const fichier = test.info().outputPath('codex-du-banc.zip');
            await fabriquerCodex(page, fichier);

            const neuf = await ouvrirEspaceNeuf(browser);
            await neuf.page.evaluate(({ quota, usage }) => {
                // Sur le prototype : sous WebKit, la même propriété posée sur `navigator.storage` n'est pas lue.
                StorageManager.prototype.estimate = async () => ({ quota, usage });
            }, cas);
            expect(await neuf.page.evaluate(() => navigator.storage.estimate()), 'témoin : le navigateur dit l\'espace du banc')
                .toEqual({ quota: cas.quota, usage: cas.usage });
            await ouvrirParLaCase(neuf.page, fichier);
            await expect.poll(async () => (await etatDeLEspace(neuf.page)).messages.length, { timeout: 30000 }).toBe(1);

            const etat = await etatDeLEspace(neuf.page);
            const [message] = etat.messages;
            expect({ sorte: message.sorte, titre: message.titre }).toEqual({ sorte: 'erreur', titre: 'Le codex n\'a pas pu être ouvert' });
            const texte = /^Espace insuffisant pour ouvrir ce codex\. Il a besoin d'environ .+?, mais le navigateur n'accorde que .+? à l'application\. Libère environ .+? sur l'appareil, puis réessaie\. Sur un iPad : Réglages → Général → Stockage iPad\.(.*)$/;
            expect(message.detail).toMatch(texte);
            const suite = message.detail.match(texte)[1];
            expect(suite, 'la phrase de la navigation privée, seulement quand peu d\'espace est accordé')
                .toBe(cas.phrasePrivee ? ' Si tu navigues en privé, rouvre l\'application dans une fenêtre normale.' : '');
            // Le refus vient AVANT toute écriture.
            expect(etat.groupe, 'rien du codex n\'est écrit').toBeNull();
            expect(etat.codexActif).toBe(false);
            await neuf.contexte.close();
        });
    }
});
