import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT I BIS, CORRECTION 1 (relecture de Cowork, 1er oct. 2026) — LA CASE « OUVRIR UN CODEX »
// OUVRE UN CODEX.
//
// Réglages › Données, la case « Ouvrir un Codex » : ses mots, validés par Grégoire, disent
// « Ouvre un codex ou une configuration partagée ». Un fichier de codex choisi là recevait
// pourtant une alerte qui renvoyait au menu Codex. Avec « un seul terme », la case ne peut pas
// refuser la seule chose qu'elle nomme.
//
// CE QUE CE BANC JUGE, par le vrai geste (le vrai bouton, le vrai champ de fichier) :
//  (1) un codex choisi dans la case s'ouvre par le chemin du menu : ses données arrivent, le
//      codex devient actif, la confirmation « Recharger la page » est celle du menu ; aucune
//      alerte, et la fenêtre d'import se ferme ;
//  (2) un codex plus lourd que la limite de la case (1 Go) part au codex quand même, et la
//      case ne lit pour le reconnaître que la fin du fichier : le menu n'a pas cette limite,
//      et un codex d'environ 1 Go ne doit pas passer deux fois par la mémoire ;
//  (3) le filet : un codex que la lecture du répertoire ne reconnaît pas (octets ajoutés
//      devant le ZIP) s'ouvre lui aussi, au lieu d'être pris pour un ancien fichier ;
//  (4) un codex ouvert par la case ne garde pas le fichier d'un codex ouvert AVANT par le menu
//      (Chrome) : sinon « Mettre à jour le codex » réécrirait l'ancien fichier.
//
// CE QU'IL NE JUGE PAS : le vrai sélecteur de Chrome ni celui de Safari, ni la mémoire réelle
// d'un iPad devant un codex d'environ 1 Go (porte terrain). En (2), l'ouverture elle-même est
// remplacée par un témoin : le fichier est un ZIP creux de 1,1 Go, que rien ne doit lire.
//
// Le codex du banc est fabriqué par le vrai `Codex.generer`, sur un jeu fictif.

const MARQUEUR = 'a2031_groupeEtudiants';
const GROUPE_FICTIF = [
    { da: '9000001', nom: 'Fictif', prenom: 'Alix', groupe: '00001' },
    { da: '9000002', nom: 'Inventée', prenom: 'Maude', groupe: '00001' }
];
const NOM_CODEX = 'Codex du banc';

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/**
 * Un espace NEUF, dans un autre contexte de navigateur que celui qui a fabriqué le codex : son
 * stockage est à part. (Vider le stockage de la page de fabrication ne suffisait pas : le jeu
 * fictif y restait, et l'arrivée des données n'aurait rien prouvé.) Le témoin le dit : rien de
 * ce que le codex apporte, aucun codex actif.
 */
async function ouvrirEspaceNeuf(browser) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    await demarrer(page);
    const dialogues = await ecouter(page);
    const avant = await etatDeLEspace(page);
    expect(avant.groupe, 'témoin : l\'espace neuf n\'a pas le jeu fictif').toBeNull();
    expect(avant.codex.actif, 'témoin : aucun codex actif').toBe(false);
    return { contexte, page, dialogues };
}

/** Le codex du banc : le vrai `Codex.generer`, sur un espace qui porte le jeu fictif. */
async function fabriquerCodex(page, chemin) {
    await demarrer(page);
    const base64 = await page.evaluate(async ({ cle, groupe, nom }) => {
        db.setSync(cle, groupe);
        await db.flush();
        // L'aperçu « voici ce qui part » attend un clic : accepté d'office, comme aux bancs voisins.
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom });
        const octets = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, { cle: MARQUEUR, groupe: GROUPE_FICTIF, nom: NOM_CODEX });
    fs.writeFileSync(chemin, Buffer.from(base64, 'base64'));
    expect(fs.statSync(chemin).size, 'le codex du banc n\'est pas vide').toBeGreaterThan(500);
}

/** Ce que l'usager verrait : les dialogues natifs (côté banc) et les messages (côté page). */
async function ecouter(page) {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push({ type: d.type(), message: d.message() }); d.accept().catch(() => {}); });
    await page.evaluate(() => {
        window.__messages = [];
        ['succes', 'erreur', 'warning', 'info'].forEach((sorte) => {
            const origine = window.notifications[sorte];
            window.notifications[sorte] = function (titre, detail) { window.__messages.push({ sorte, titre, detail }); return origine.apply(this, arguments); };
        });
    });
    return dialogues;
}

/** Le geste : Réglages › Données, le bouton « Ouvrir un Codex… », le fichier. */
async function choisirDansLaCase(page, fichier) {
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    const bouton = page.locator('#reglages-donnees [data-action="ouvrirModalImport"]');
    await expect(bouton).toHaveText(/Ouvrir un Codex…/);
    await bouton.click();
    await expect(page.locator('#modalImport')).toBeVisible();
    await page.setInputFiles('#fichierImport', fichier);
}

const boutonRecharger = (page) => page.getByRole('button', { name: 'Recharger', exact: true });
const etatDeLEspace = (page) => page.evaluate(async (cle) => ({
    groupe: await db.get(cle, null),
    codex: { actif: Codex.etat().actif === true, nom: Codex.etat().nom || null },
    fenetreImportFermee: document.getElementById('modalImport').classList.contains('u-hide'),
    messages: window.__messages
}), MARQUEUR);

/** Ce que l'ouverture d'un codex par la case doit laisser : ses données, le codex actif, la confirmation du menu. */
async function attendreLeCodexOuvert(page, dialogues, nomFichier) {
    await expect(boutonRecharger(page)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Codex chargé depuis « ' + nomFichier + ' »')).toBeVisible();
    // #1012, les mots (2 oct. 2026) : le fichier de codex est la seule copie hors de
    // l'application — la fenêtre dit de le garder, et plus de le supprimer.
    const fenetre = page.locator('#overlay-ui-dialogue [role="dialog"]');
    const texte = await fenetre.innerText();
    expect(texte).toContain('Ton fichier de codex n\'a pas changé : garde-le, c\'est ta copie hors de l\'application.');
    expect(texte).toContain('Recharger la page pour appliquer les données ?');
    expect(texte).not.toContain('supprimer');
    const etat = await etatDeLEspace(page);
    expect(etat.groupe, 'les données du codex sont dans l\'espace').toEqual(GROUPE_FICTIF);
    expect(etat.codex).toEqual({ actif: true, nom: NOM_CODEX });
    expect(etat.fenetreImportFermee, 'la fenêtre d\'import s\'est fermée').toBe(true);
    expect(etat.messages.filter((m) => m.sorte === 'succes').map((m) => m.titre)).toEqual(['Codex ouvert : ' + NOM_CODEX]);
    expect(etat.messages.filter((m) => m.sorte === 'erreur')).toEqual([]);
    expect(dialogues, 'aucune alerte : la case ne renvoie plus au menu').toEqual([]);
}

/** Un ZIP creux : une entrée « rangée » (non compressée) de `poids` octets nuls, puis le manifeste d'un codex et des données. */
function ecrireCodexCreux(chemin, poids) {
    const entrees = [
        { nom: 'travaux/remplissage.bin', taille: poids, contenu: null },
        { nom: 'codex-manifeste.json', contenu: Buffer.from(JSON.stringify({ formatVersion: 1, nom: 'Codex creux du banc' })) },
        { nom: 'donnees.json', contenu: Buffer.from('{}') }
    ];
    // L'empreinte de l'entrée creuse, calculée par tranches (rien de ce banc ne la relit).
    let crcCreux = 0;
    const tranche = Buffer.alloc(16 * 1024 * 1024);
    for (let reste = poids; reste > 0; reste -= tranche.length) crcCreux = zlib.crc32(reste >= tranche.length ? tranche : tranche.subarray(0, reste), crcCreux);
    const fd = fs.openSync(chemin, 'w');
    let position = 0;
    const repertoire = [];
    for (const e of entrees) {
        const nom = Buffer.from(e.nom);
        const taille = e.contenu ? e.contenu.length : e.taille;
        const crc = e.contenu ? zlib.crc32(e.contenu) : crcCreux;
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(taille, 18); local.writeUInt32LE(taille, 22); local.writeUInt16LE(nom.length, 26);
        fs.writeSync(fd, Buffer.concat([local, nom]), 0, 30 + nom.length, position);
        if (e.contenu) fs.writeSync(fd, e.contenu, 0, e.contenu.length, position + 30 + nom.length);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt32LE(crc, 16);
        central.writeUInt32LE(taille, 20); central.writeUInt32LE(taille, 24); central.writeUInt16LE(nom.length, 28); central.writeUInt32LE(position, 42);
        repertoire.push(Buffer.concat([central, nom]));
        position += 30 + nom.length + taille; // l'entrée creuse : un trou, jamais écrit
    }
    const rep = Buffer.concat(repertoire);
    const cloture = Buffer.alloc(22);
    cloture.writeUInt32LE(0x06054b50, 0); cloture.writeUInt16LE(entrees.length, 8); cloture.writeUInt16LE(entrees.length, 10);
    cloture.writeUInt32LE(rep.length, 12); cloture.writeUInt32LE(position, 16);
    fs.writeSync(fd, Buffer.concat([rep, cloture]), 0, rep.length + 22, position);
    fs.closeSync(fd);
    return { taille: position + rep.length + 22, repertoire: rep.length };
}

test.describe('Lot I bis — la case « Ouvrir un Codex » ouvre un codex', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(1) un codex choisi dans la case s\'ouvre par le chemin du menu Codex, sans alerte', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);

        const neuf = await ouvrirEspaceNeuf(browser);
        await choisirDansLaCase(neuf.page, fichier);
        await attendreLeCodexOuvert(neuf.page, neuf.dialogues, 'codex-du-banc.zip');
        await neuf.contexte.close();
    });

    test('(2) un codex de plus de 1 Go part au codex, et la case n\'en lit que la fin', async ({ page }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-creux.zip');
        const POIDS = 1100 * 1024 * 1024;
        const creux = ecrireCodexCreux(fichier, POIDS);
        try {
            expect(fs.statSync(fichier).size).toBe(creux.taille);
            expect(creux.taille, 'plus lourd que la limite de la case').toBeGreaterThan(1024 * 1024 * 1024);

            await demarrer(page);
            const dialogues = await ecouter(page);
            await page.evaluate(() => {
                // Le témoin remplace l'ouverture : rien ne doit lire 1,1 Go dans ce banc.
                window.__confies = [];
                window.Codex.ouvrirFichier = async (f) => { window.__confies.push({ nom: f.name, taille: f.size }); };
                // Toute lecture d'octets, par les deux portes qu'emploie l'application.
                window.__lectures = [];
                const lire = Blob.prototype.arrayBuffer;
                Blob.prototype.arrayBuffer = function () { window.__lectures.push(this.size); return lire.apply(this, arguments); };
                const lireFR = FileReader.prototype.readAsArrayBuffer;
                FileReader.prototype.readAsArrayBuffer = function (b) { window.__lectures.push(b.size); return lireFR.apply(this, arguments); };
            });

            await choisirDansLaCase(page, fichier);
            await expect.poll(() => page.evaluate(() => window.__confies.length)).toBe(1);
            const r = await page.evaluate(() => ({
                confies: window.__confies, lectures: window.__lectures,
                fenetreImportFermee: document.getElementById('modalImport').classList.contains('u-hide')
            }));
            expect(r.confies).toEqual([{ nom: 'codex-creux.zip', taille: creux.taille }]);
            expect(r.fenetreImportFermee).toBe(true);
            expect(dialogues, 'ni « Fichier trop volumineux », ni renvoi au menu').toEqual([]);
            // Deux lectures : la fin du fichier (la clôture et le commentaire possible), puis le répertoire.
            expect(r.lectures).toEqual([22 + 65535, creux.repertoire]);
        } finally {
            fs.rmSync(fichier, { force: true });
        }
    });

    test('(3) le filet : un codex précédé d\'octets étrangers s\'ouvre lui aussi', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(page, fichier);
        const decale = test.info().outputPath('codex-decale.zip');
        fs.writeFileSync(decale, Buffer.concat([Buffer.from('octets ajoutés devant le ZIP'), fs.readFileSync(fichier)]));

        const neuf = await ouvrirEspaceNeuf(browser);
        await choisirDansLaCase(neuf.page, decale);
        await attendreLeCodexOuvert(neuf.page, neuf.dialogues, 'codex-decale.zip');
        // Témoin : c'est bien le filet qui a joué. La lecture du répertoire ne reconnaît pas ce
        // fichier (null) ; le codex d'origine, lui, est reconnu (true).
        const reconnu = await neuf.page.evaluate(() => Codex.estUnFichierDeCodex(document.getElementById('fichierImport').files[0]));
        expect(reconnu).toBeNull();
        const origine = await neuf.page.evaluate(async (b64) => Codex.estUnFichierDeCodex(new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))])), fs.readFileSync(fichier).toString('base64'));
        expect(origine).toBe(true);
        await neuf.contexte.close();
    });

    test('(4) ouvert par la case, le codex ne garde pas le fichier d\'un codex ouvert avant par le menu', async ({ page: pageDeFabrication, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-du-banc.zip');
        await fabriquerCodex(pageDeFabrication, fichier);
        const base64 = fs.readFileSync(fichier).toString('base64');

        const { contexte, page, dialogues } = await ouvrirEspaceNeuf(browser);
        const sousTexte = async () => {
            await page.evaluate(() => Codex.toggleMenu());
            const lu = await page.evaluate(() => {
                const el = document.getElementById('codex-menu-enreg-info');
                return el.classList.contains('u-hide') ? null : el.textContent;
            });
            await page.evaluate(() => Codex.toggleMenu());
            return lu;
        };

        // Le chemin de Chrome : le menu ouvre par un sélecteur qui rend un fichier RÉÉCRIVABLE.
        await page.evaluate((b64) => {
            const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            const leFichier = new File([octets], 'codex-du-menu.zip', { type: 'application/zip' });
            window.showSaveFilePicker = async () => { throw new Error('non employé par ce banc'); };
            window.showOpenFilePicker = async () => [{ name: 'codex-du-menu.zip', getFile: async () => leFichier }];
        }, base64);
        const parLeMenu = page.evaluate(() => Codex.actionOuvrir());
        await expect(boutonRecharger(page)).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: 'Annuler', exact: true }).click();
        await parLeMenu;
        // Témoin : après le menu, « Mettre à jour le codex » écrirait dans le même fichier.
        expect(await sousTexte()).toBe('Dans le même fichier');

        // Puis un autre fichier, par la case : ce fichier-là ne se réécrit pas en place.
        await choisirDansLaCase(page, fichier);
        await expect(boutonRecharger(page)).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: 'Annuler', exact: true }).click();
        expect(await sousTexte()).toBeNull();
        expect(dialogues).toEqual([]);
        await contexte.close();
    });

    test('(5) un fichier qui n\'est pas un codex reste à la case, même quand son répertoire ne se lit pas', async ({ page }) => {
        test.setTimeout(90000);
        // L'ancien fichier de données du lot (jeu fictif), précédé d'octets étrangers : la lecture
        // du répertoire ne sait pas le lire (null), ce qui ne fait pas de lui un codex.
        const origine = path.join(racineProjet, 'tests', 'fixtures', 'copies-de-secours-1.172.0', 'copie-de-secours-avec-travaux.zip');
        const decale = test.info().outputPath('ancien-fichier-decale.zip');
        fs.writeFileSync(decale, Buffer.concat([Buffer.from('octets ajoutés devant le ZIP'), fs.readFileSync(origine)]));

        await demarrer(page);
        const dialogues = await ecouter(page);
        await page.evaluate(() => {
            window.__confies = [];
            window.Codex.ouvrirFichier = async (f) => { window.__confies.push(f.name); };
        });
        await choisirDansLaCase(page, decale);
        await page.waitForSelector('#modalPreviewConfigComplete');
        expect(await page.evaluate(() => window.__confies), 'rien n\'est parti au codex').toEqual([]);
        expect(await page.evaluate(() => Codex.estUnFichierDeCodex(document.getElementById('fichierImport').files[0]))).toBeNull();
        expect(dialogues).toEqual([]);
    });
});
