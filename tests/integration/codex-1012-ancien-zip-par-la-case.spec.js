import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1012, suite (consigne de Cowork du 2 oct. 2026, 6 h 54) — L'ANCIEN FICHIER `.zip` OUVERT PAR
// LA CASE NE FAIT PLUS PERDRE DE COPIES.
//
// Mesuré avant le lot (1er oct., puis rejoué ici avant de corriger) : un codex A tenu, trois
// copies ; un ancien `.zip` avec une copie ouvert par « Ouvrir un Codex… » de Réglages › Données,
// tout coché. La liste des copies de l'espace était REMPLACÉE par celle du fichier : les trois
// copies de A n'avaient plus d'entrée, et « Mettre à jour le codex » écrivait dans A un codex
// d'une copie, sans fenêtre.
//
// LA RÈGLE JUGÉE ICI, par le geste (la case, la fenêtre aux cases à cocher, le menu Codex) :
//   1. Les copies du fichier S'AJOUTENT à celles de l'espace. Aucune copie déjà là ne perd son
//      entrée ; la mise à jour du codex les écrit toutes.
//   2. Une copie dont l'identifiant existe déjà : l'espace l'emporte. Son entrée n'est pas
//      réécrite, son fichier au magasin n'est pas remplacé.
//   3. Seule exception, et elle ne détruit rien : le magasin n'a PAS de fichier pour cette copie,
//      son entrée n'est pas « exporte », et le `.zip` en porte un. Le fichier entre, et un statut
//      « manquant » redevient « present » (comme le geste « Re-déposer »).
//   4. Un fichier sans copies, ou la case des copies décochée : la liste n'est pas touchée.
//
// CE QUE CE BANC NE JUGE PAS : Chrome lui-même (WebKit n'a pas `showOpenFilePicker` : le banc pose
// une fausse poignée qui consigne ce qu'on lui écrit). Les copies vivent dans un magasin en
// mémoire : le contexte éphémère de WebKit ne stocke pas de Blob dans IndexedDB.

const FIXTURES = path.join(racineProjet, 'tests', 'fixtures', 'copies-de-secours-1.172.0');
const ANCIEN_ZIP = path.join(FIXTURES, 'copie-de-secours-avec-travaux.zip');
const ANCIEN_JSON = path.join(FIXTURES, 'copie-de-secours.json');

const CLE_GROUPE = 'a2031_groupeEtudiants';
const CLE_COPIES = 'a2031_fichiersTravaux';
const CLE_PRODUCTIONS = 'a2031_productions';
// Deux PNG d'un pixel, d'octets différents : celui des copies de A, celui de l'ancien fichier.
const PNG_DE_A = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const PNG_DU_FICHIER = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const COPIES = ['FT_banc_A_1', 'FT_banc_A_2', 'FT_banc_A_3'];
const COPIE_DU_FICHIER = 'FT_BANC_1';

const A = {
    nom: 'Codex A du banc',
    fichier: 'codex-A.zip',
    donnees: {
        [CLE_GROUPE]: [{ da: '9000001', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }],
        [CLE_PRODUCTIONS]: [{ id: 'PROD_banc_A', titre: 'Production fictive A', coursId: 'COURS_BANC_A', remplissage: 'x'.repeat(30 * 1024) }],
        [CLE_COPIES]: COPIES.map((id, i) => ({
            id, nomFichier: 'copie-' + (i + 1) + '.png', typeMIME: 'image/png',
            etudiantDA: '9000001', productionId: 'PROD_banc_A', blobStatut: 'present',
            remplissage: 'x'.repeat(12 * 1024)
        }))
    }
};

async function demarrer(page) {
    // Budget propre au chargement : sous charge, le délai court des gestes (15 s) n'y suffit pas
    // (vu le 2 oct. pendant les mutations : `page.goto` expiré, un rouge qui ne jugeait rien).
    await page.goto(indexHtml, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/** Le codex du banc, par le vrai `Codex.generer`, écrit sur le disque du banc. */
async function fabriquerCodex(page, chemin, donneesDuCodex = A.donnees) {
    const rendu = await page.evaluate(async ({ donnees, cleCopies, png, nom }) => {
        Object.keys(donnees).forEach((cle) => db.setSync(cle, donnees[cle]));
        await db.flush();
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const ids = donnees[cleCopies].map((c) => c.id);
        const origine = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async (id) => (ids.includes(id) ? new Blob([octets], { type: 'image/png' }) : origine(id));
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const codex = await Codex.generer({ nom });
        const zip = await JSZip.loadAsync(await codex.blob.arrayBuffer());
        const nbCopies = Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).length;
        const o = new Uint8Array(await codex.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return { b64: btoa(binaire), nbCopies };
    }, { donnees: donneesDuCodex, cleCopies: CLE_COPIES, png: PNG_DE_A, nom: A.nom });
    expect(rendu.nbCopies, 'témoin : le codex fabriqué porte ses trois copies').toBe(3);
    fs.writeFileSync(chemin, Buffer.from(rendu.b64, 'base64'));
    return chemin;
}

/**
 * Un espace neuf, dans un autre contexte, équipé comme Chrome. Ce qui sort de l'application est
 * consigné dans `__journal` ; chaque dépôt au magasin des copies, dans `__depots`.
 */
async function ouvrirEspaceNeuf(browser) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    page.setDefaultTimeout(15000);
    await demarrer(page);
    await page.evaluate((cleCopies) => {
        window.__messages = [];
        ['succes', 'erreur', 'warning', 'info'].forEach((sorte) => {
            const origine = window.notifications[sorte];
            window.notifications[sorte] = function (titre, detail) { window.__messages.push({ sorte, titre, detail }); return origine.apply(this, arguments); };
        });
        window.__journal = [];
        window.__ecritures = [];
        window.__destinationsDemandees = 0;
        // Ce que le fichier écrit porte : les copies (les fichiers du dossier travaux/) et la liste.
        window.__decrire = async (blob, fichier) => {
            const zip = await JSZip.loadAsync(await blob.arrayBuffer());
            const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
            return {
                fichier,
                copies: Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).map((n) => n.slice('travaux/'.length).replace(/\.[^.]+$/, '')).sort(),
                liste: (donnees[cleCopies] || []).map((c) => c.id).sort(),
                // Les familles suivies par un essai (les quatre cases) : ce que le fichier écrit en porte.
                ...(window.__clesSuivies ? { familles: Object.fromEntries(window.__clesSuivies.map((c) => [c, donnees[c] === undefined ? null : donnees[c]])) } : {})
            };
        };
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
                        window.__journal.push('écriture dans ' + nom);
                        window.__ecritures.push(await window.__decrire(recu, nom));
                    }
                };
            }
        });
        window.showSaveFilePicker = async () => {
            window.__destinationsDemandees++;
            window.__journal.push('destination demandée');
            throw new DOMException('Fenêtre de destination refermée par le banc', 'AbortError');
        };
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => { window.__journal.push('aperçu'); return true; };

        // Le magasin des copies, en mémoire. `__refus` : id → 'quota'.
        window.__copies = new Map();
        window.__depots = [];
        window.__refus = {};
        db.storeBlob = async (enr) => {
            if (window.__refus[enr.id] === 'quota') throw new DOMException('Quota du banc', 'QuotaExceededError');
            window.__depots.push(enr.id);
            window.__copies.set(enr.id, enr);
        };
        db.getBlob = async (id) => window.__copies.get(id) || null;
    }, CLE_COPIES);
    expect(await page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : l\'espace neuf est vide').toBeNull();
    return { contexte, page };
}

/** Une ouverture complète de A par le menu, dans Chrome : A est tenu, la page reste la même. */
async function ouvrirAEnEntier(page, chemin) {
    await page.evaluate(({ b64, nom }) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const leFichier = new File([octets], nom, { type: 'application/zip' });
        window.showOpenFilePicker = async () => [window.__poignee(nom, leFichier)];
        window.__ouverture = Codex.actionOuvrir();
    }, { b64: fs.readFileSync(chemin).toString('base64'), nom: A.fichier });
    await expect(page.getByText('Codex chargé depuis « ' + A.fichier + ' »')).toBeVisible({ timeout: 30000 });
    await page.locator('#overlay-ui-dialogue').getByRole('button', { name: 'Annuler', exact: true }).click();
    await page.evaluate(() => window.__ouverture);
    expect(await page.evaluate(() => window.__copies.size), 'témoin : les trois copies de A sont dans l\'application').toBe(3);
    expect(await page.evaluate(() => Codex.etat().handleFSAPI), 'témoin : A est tenu').toBe(true);
    await page.evaluate(() => { window.__journal.length = 0; window.__ecritures.length = 0; window.__messages.length = 0; window.__depots.length = 0; });
}

/** L'état des copies dans l'espace : la liste telle quelle, et les octets de chaque fichier au magasin. */
const lireCopies = (page) => page.evaluate(async (cle) => {
    const magasin = {};
    for (const [id, enr] of window.__copies) {
        const o = new Uint8Array(await enr.blob.arrayBuffer());
        magasin[id] = btoa(String.fromCharCode.apply(null, o));
    }
    return { liste: await db.get(cle, null), magasin, depots: window.__depots.slice() };
}, CLE_COPIES);

/**
 * Le geste entier de la case : Réglages › Données, « Ouvrir un Codex… », le fichier, la fenêtre aux
 * cases à cocher (tout coché, sauf `sauf` ; ou `seulement` ces cases-là), « Importer ». On ne
 * recharge pas : l'état se lit tel que l'import vient de l'écrire. Rend le bilan dit à l'écran.
 */
async function ouvrirParLaCase(page, fichier, { sauf = [], seulement = null } = {}) {
    const dialogues = [];
    const ecouteur = (d) => {
        dialogues.push({ type: d.type(), message: d.message() });
        if (d.type() === 'confirm' && /^Recharger la page/.test(d.message())) d.dismiss().catch(() => {});
        else d.accept().catch(() => {});
    };
    page.on('dialog', ecouteur);
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    const boutonOuvrir = page.locator('#reglages-donnees [data-action="ouvrirModalImport"]');
    await expect(boutonOuvrir).toHaveText(/Ouvrir un Codex…/);
    await boutonOuvrir.click();
    await page.setInputFiles('#fichierImport', fichier);
    await page.waitForSelector('#modalPreviewConfigComplete');
    const cases = await page.evaluate(({ sauf, seulement }) => {
        const m = document.getElementById('modalPreviewConfigComplete');
        const confirmer = m.querySelector('#confirmMaSauvegarde');
        if (confirmer && !confirmer.checked) confirmer.click();
        if (seulement) {
            // Les cases de catégorie d'abord (elles entraînent leurs éléments), puis chaque case.
            m.querySelectorAll('.import-category-toggle').forEach((cb) => { if (cb.checked) cb.click(); });
            m.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
                if (cb === confirmer) return;
                if (cb.checked !== seulement.includes(cb.id)) cb.click();
            });
            return Array.from(m.querySelectorAll('input[type="checkbox"]:checked')).filter((cb) => cb !== confirmer).map((cb) => cb.id || cb.className).sort();
        }
        m.querySelectorAll('.import-category-toggle').forEach((cb) => { if (!cb.checked) cb.click(); });
        m.querySelectorAll('input[type="checkbox"][id^="import-"]').forEach((cb) => {
            const voulue = !sauf.includes(cb.id);
            if (cb.checked !== voulue) cb.click();
        });
        return Array.from(m.querySelectorAll('input[type="checkbox"][id^="import-"]')).filter((cb) => cb.checked).map((cb) => cb.id).sort();
    }, { sauf, seulement });
    await page.click('#modalPreviewConfigComplete [data-action="executerImportSelectif"]');
    await expect.poll(() => dialogues.some((d) => d.type === 'alert'), { timeout: 20000 }).toBe(true);
    const bilan = dialogues.find((d) => d.type === 'alert').message;
    // Un import qui a écrit propose de recharger : on attend la question, pour y répondre non.
    if (/^Import réussi/.test(bilan)) await expect.poll(() => dialogues.some((d) => /^Recharger la page/.test(d.message)), { timeout: 20000 }).toBe(true);
    await page.waitForTimeout(500);
    page.off('dialog', ecouteur);
    return { cases, bilan };
}

/** Le vrai geste : le menu Codex, « Mettre à jour le codex », jusqu'à la fin de la tentative. */
async function mettreAJourLeCodex(page) {
    await page.locator('#btn-codex').click();
    await page.locator('#codex-menu [data-action="Codex.actionEnregistrer"]').click();
    await expect.poll(() => page.evaluate(() => (Codex.derniereTentative() || {}).issue), { timeout: 30000 }).not.toBe('en cours');
    return page.evaluate(() => ({
        issue: Codex.derniereTentative().issue,
        fenetre: (document.querySelector('#overlay-ui-dialogue .modal-titre') || {}).textContent || null,
        journal: window.__journal.slice(),
        ecritures: window.__ecritures.slice(),
        destinationsDemandees: window.__destinationsDemandees
    }));
}

/**
 * Un ancien `.zip` dérivé de la fixture, à l'exécution : sa liste des copies et son dossier
 * travaux/ sont ceux qu'on lui donne. `copies` : [{ entree, png }] ; `png` absent : la copie est
 * dans la liste, pas dans le dossier.
 */
async function deriverAncienZip(page, chemin, copies) {
    const b64 = await page.evaluate(async ({ source, cle, copies }) => {
        const zip = await JSZip.loadAsync(Uint8Array.from(atob(source), (c) => c.charCodeAt(0)));
        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
        donnees[cle] = copies.map((c) => c.entree);
        zip.file('donnees.json', JSON.stringify(donnees));
        Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).forEach((n) => zip.remove(n));
        copies.forEach((c) => { if (c.png) zip.file('travaux/' + c.entree.id + '.png', Uint8Array.from(atob(c.png), (x) => x.charCodeAt(0))); });
        return zip.generateAsync({ type: 'base64' });
    }, { source: fs.readFileSync(ANCIEN_ZIP).toString('base64'), cle: CLE_COPIES, copies });
    fs.writeFileSync(chemin, Buffer.from(b64, 'base64'));
    return chemin;
}

const entreeDuFichier = (id, plus = {}) => ({ id, nomFichier: 'nom-venu-du-fichier.png', typeMIME: 'image/png', etudiantDA: '9000002', productionId: 'PROD_BANC_1', ...plus });

test.describe('#1012 — l\'ancien fichier .zip ouvert par la case ne fait plus perdre de copies', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(1) les copies du fichier s\'ajoutent à celles de l\'espace, et la mise à jour du codex les écrit toutes', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);
        const avant = await lireCopies(neuf.page);
        expect(avant.liste.map((c) => c.id), 'témoin : la liste de l\'espace est celle de A').toEqual(COPIES);

        const r = await ouvrirParLaCase(neuf.page, ANCIEN_ZIP);
        expect(r.cases, 'témoin : la case des copies est cochée').toContain('import-fichiersTravaux');
        const apres = await lireCopies(neuf.page);

        // Les trois pas d'état sont en `expect.soft` : le geste qui suit (la mise à jour du codex) se
        // joue toujours, et son résultat se lit même quand l'état est déjà faux.
        await test.step('après l\'import : les trois copies de A ont toujours leur entrée, telle quelle, et celle du fichier est entrée', async () => {
            expect.soft(apres.liste.map((c) => c.id)).toEqual([...COPIES, COPIE_DU_FICHIER]);
            expect.soft(apres.liste.slice(0, 3), 'les entrées de l\'espace ne sont pas réécrites').toEqual(avant.liste);
            expect.soft(apres.liste[3]).toMatchObject({ id: COPIE_DU_FICHIER, etudiantDA: '9000001', productionId: 'PROD_BANC_1' });
        });

        await test.step('au magasin : les fichiers de A ne sont pas touchés, celui du fichier est déposé', async () => {
            expect.soft(apres.depots, 'un seul dépôt : la copie du fichier').toEqual([COPIE_DU_FICHIER]);
            expect.soft(apres.magasin).toEqual({ [COPIES[0]]: PNG_DE_A, [COPIES[1]]: PNG_DE_A, [COPIES[2]]: PNG_DE_A, [COPIE_DU_FICHIER]: PNG_DU_FICHIER });
        });

        await test.step('le bilan compte ce qui est entré : une copie, un fichier', async () => {
            expect.soft(r.bilan).toContain('1 fichier(s) travaux + 1 PDF restauré(s)');
            expect.soft(r.bilan).not.toContain('non restauré');
        });

        await test.step('le même fichier rouvert une seconde fois ne double rien, et le bilan ne compte plus de copie', async () => {
            const r2 = await ouvrirParLaCase(neuf.page, ANCIEN_ZIP);
            expect.soft(await lireCopies(neuf.page), 'ni la liste, ni le magasin, ni les dépôts ne bougent').toEqual(apres);
            expect.soft(r2.bilan).toMatch(/^Import réussi/);
            expect.soft(r2.bilan).not.toContain('fichier(s) travaux');
        });

        await test.step('« Mettre à jour le codex » : dans A, sans fenêtre, les quatre copies', async () => {
            const sortie = await mettreAJourLeCodex(neuf.page);
            const toutes = [...COPIES, COPIE_DU_FICHIER].sort();
            expect(sortie).toEqual({
                issue: 'réussie',
                fenetre: null,
                journal: ['aperçu', 'écriture dans ' + A.fichier],
                ecritures: [{ fichier: A.fichier, copies: toutes, liste: toutes }],
                destinationsDemandees: 0
            });
        });
        await neuf.contexte.close();
    });

    test('(2) témoins : un fichier sans copies, ou la case des copies décochée, ne touchent ni la liste ni le magasin', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);
        const avant = await lireCopies(neuf.page);

        await test.step('l\'ancien `.json`, sans copies, tout coché', async () => {
            const r = await ouvrirParLaCase(neuf.page, ANCIEN_JSON);
            expect(r.cases.length, 'témoin : des cases sont cochées, l\'import a bien eu lieu').toBeGreaterThan(3);
            expect(r.cases, 'témoin : ce fichier n\'offre pas la case des copies').not.toContain('import-fichiersTravaux');
            expect(r.bilan).toMatch(/^Import réussi/);
            expect(await lireCopies(neuf.page)).toEqual(avant);
        });

        await test.step('l\'ancien `.zip`, la case des copies décochée', async () => {
            const r = await ouvrirParLaCase(neuf.page, ANCIEN_ZIP, { sauf: ['import-fichiersTravaux'] });
            expect(r.cases.length, 'témoin : les autres cases sont cochées').toBeGreaterThan(3);
            expect(r.cases).not.toContain('import-fichiersTravaux');
            expect(r.bilan).toMatch(/^Import réussi/);
            expect(r.bilan).not.toContain('fichier(s) travaux');
            expect(await lireCopies(neuf.page)).toEqual(avant);
        });

        await test.step('« Mettre à jour le codex » : dans A, les trois copies', async () => {
            const sortie = await mettreAJourLeCodex(neuf.page);
            expect(sortie.ecritures).toEqual([{ fichier: A.fichier, copies: COPIES, liste: COPIES }]);
            expect(sortie.fenetre).toBeNull();
        });
        await neuf.contexte.close();
    });

    test('(3) un identifiant déjà là : l\'espace l\'emporte ; seul un fichier absent du magasin revient, et jamais pour une copie « exporte »', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);

        // L'espace : la copie 1 a son fichier ; la copie 2 est « manquant », sans fichier ; la
        // copie 3 est « exporte », sans fichier (elle a quitté l'application, c'est voulu).
        await neuf.page.evaluate(async ({ cle, ids }) => {
            const liste = await db.get(cle, []);
            liste[1].blobStatut = 'manquant';
            liste[2].blobStatut = 'exporte';
            db.setSync(cle, liste);
            await db.flush();
            window.__copies.delete(ids[1]);
            window.__copies.delete(ids[2]);
        }, { cle: CLE_COPIES, ids: COPIES });
        const avant = await lireCopies(neuf.page);
        expect(Object.keys(avant.magasin), 'témoin : une seule copie a son fichier').toEqual([COPIES[0]]);

        // L'ancien fichier porte les trois mêmes identifiants, d'autres métadonnées, d'autres octets.
        const memesIds = await deriverAncienZip(neuf.page, test.info().outputPath('ancien-memes-identifiants.zip'),
            COPIES.map((id) => ({ entree: entreeDuFichier(id), png: PNG_DU_FICHIER })));
        const r = await ouvrirParLaCase(neuf.page, memesIds);
        expect(r.cases, 'témoin : la case des copies est cochée').toContain('import-fichiersTravaux');
        const apres = await lireCopies(neuf.page);

        // Pas d'état en `expect.soft` : chaque copie dit son rouge, sans masquer les suivantes.
        await test.step('la copie 1 (entrée et fichier dans l\'espace) : rien ne bouge', async () => {
            expect.soft(apres.liste[0]).toEqual(avant.liste[0]);
            expect.soft(apres.magasin[COPIES[0]], 'le fichier de l\'espace n\'est pas remplacé par celui du .zip').toBe(PNG_DE_A);
        });
        await test.step('la copie 2 (« manquant », sans fichier) : son fichier revient du .zip, son statut redevient « present », le reste de l\'entrée ne bouge pas', async () => {
            expect.soft(apres.magasin[COPIES[1]]).toBe(PNG_DU_FICHIER);
            expect.soft(apres.liste[1]).toEqual({ ...avant.liste[1], blobStatut: 'present' });
            // Le fichier revenu est rangé sous l'association de l'ESPACE, pas sous celle du fichier.
            expect.soft(await neuf.page.evaluate((id) => { const e = window.__copies.get(id); return { da: e.etudiantDA, productionId: e.productionId }; }, COPIES[1]))
                .toEqual({ da: '9000001', productionId: 'PROD_banc_A' });
        });
        await test.step('la copie 3 (« exporte ») : ni l\'entrée ni le magasin ne bougent', async () => {
            expect.soft(apres.liste[2]).toEqual(avant.liste[2]);
            expect.soft(apres.magasin[COPIES[2]]).toBeUndefined();
        });
        await test.step('la liste garde trois entrées, un seul dépôt au magasin, et le bilan dit ce qui est entré', async () => {
            expect.soft(apres.liste.map((c) => c.id)).toEqual(COPIES);
            expect.soft(apres.depots).toEqual([COPIES[1]]);
            expect.soft(r.bilan).toContain('0 fichier(s) travaux + 1 PDF restauré(s)');
            expect.soft(r.bilan).not.toContain('non restauré');
        });

        await test.step('un fichier qui ne revient pas ne change rien : absent du .zip, ou refusé faute d\'espace', async () => {
            // La copie 1 perd son fichier (statut « present », qui ment) : le .zip ne le porte pas.
            // La copie 2 reperd le sien et redevient « manquant » : le .zip le porte, le magasin le refuse.
            await neuf.page.evaluate(async ({ cle, ids }) => {
                const liste = await db.get(cle, []);
                liste[1].blobStatut = 'manquant';
                db.setSync(cle, liste);
                await db.flush();
                window.__copies.delete(ids[0]);
                window.__copies.delete(ids[1]);
                window.__depots.length = 0;
                window.__refus = { [ids[1]]: 'quota' };
            }, { cle: CLE_COPIES, ids: COPIES });
            const avant2 = await lireCopies(neuf.page);
            expect(Object.keys(avant2.magasin), 'témoin : plus aucun fichier au magasin').toEqual([]);
            const sansLeFichier = await deriverAncienZip(neuf.page, test.info().outputPath('ancien-sans-le-fichier.zip'), [
                { entree: entreeDuFichier(COPIES[0]) },
                { entree: entreeDuFichier(COPIES[1]), png: PNG_DU_FICHIER }
            ]);
            const r2 = await ouvrirParLaCase(neuf.page, sansLeFichier);
            const apres2 = await lireCopies(neuf.page);
            expect(apres2.liste[0], 'la copie 1 n\'est pas marquée par un fichier qui ne la porte pas').toEqual(avant2.liste[0]);
            expect(apres2.liste[1].blobStatut, 'la copie 2 reste « manquant » : son fichier n\'est pas entré').toBe('manquant');
            expect(apres2.liste).toEqual(avant2.liste);
            expect(apres2.magasin).toEqual({});
            expect(r2.bilan).toContain('1 non restauré(s), marqué(s) « manquant »');
        });

        await test.step('seule la case des copies est cochée, et un fichier revient : c\'est un import réussi, compté', async () => {
            await neuf.page.evaluate(() => { window.__refus = {}; window.__depots.length = 0; });
            const r3 = await ouvrirParLaCase(neuf.page, memesIds, { seulement: ['import-fichiersTravaux'] });
            expect(r3.cases, 'témoin : aucune autre case n\'est cochée').toEqual(['import-fichiersTravaux']);
            const apres3 = await lireCopies(neuf.page);
            // Les copies 1 et 2 n'avaient plus de fichier : ils reviennent. La copie 3 est « exporte ».
            expect(apres3.depots).toEqual([COPIES[0], COPIES[1]]);
            expect(apres3.liste.map((c) => c.blobStatut)).toEqual(['present', 'present', 'exporte']);
            expect(r3.bilan).toBe('Import réussi !\n\n0 fichier(s) travaux + 2 PDF restauré(s)\n\nTotal : 1 élément(s) importé(s).');
        });

        await test.step('dans le doute (le magasin ne répond pas pour une copie), rien n\'est remplacé ; et un import qui n\'apporte rien le dit', async () => {
            await neuf.page.evaluate((id) => {
                window.__depots.length = 0;
                const lire = db.getBlob;
                db.getBlob = async (i) => { if (i === id) throw new Error('panne du magasin, posée par le banc'); return lire(i); };
            }, COPIES[0]);
            const avant4 = await lireCopies(neuf.page);
            const r4 = await ouvrirParLaCase(neuf.page, memesIds, { seulement: ['import-fichiersTravaux'] });
            const apres4 = await lireCopies(neuf.page);
            expect(apres4.depots, 'aucun dépôt : ni la copie dont le magasin ne répond pas, ni les deux autres').toEqual([]);
            expect(apres4).toEqual(avant4);
            expect(r4.bilan).toBe('Aucune nouvelle donnée à importer.\n\nLes éléments sélectionnés existent déjà (même nom).');
        });
        await neuf.contexte.close();
    });
});

// #1012, les quatre cases (consigne de Cowork du 2 oct. 2026, 10 h 33) — « ÉTUDIANTS », « PRÉSENCES »,
// « NOTES » ET « ANNOTATIONS » NE REMPLACENT PLUS CE QUE L'ESPACE A.
//
// Mesuré avant le lot, par ce banc : avec « C'est ma propre sauvegarde » (qui coche toutes les
// données personnelles), chacune des quatre cases remplaçait la valeur de l'espace par celle du
// fichier (`db.set`).
//
// LA RÈGLE JUGÉE ICI : ce que le fichier apporte s'ajoute ; rien de ce que l'espace a ne perd son
// entrée ni n'est réécrit ; une même chose des deux côtés, l'espace l'emporte. « La même chose » :
//   · un élève : son DA ;
//   · une fiche de présence : la date, le DA et le cours (`coursId` absent d'un côté = même cours) ;
//   · une évaluation : son `id`, et le couple élève × production (une évaluation du fichier n'entre
//     que si l'espace n'a AUCUNE évaluation de ce couple : ni l'originale, ni une reprise) ;
//   · une annotation : son `id`, et la copie qu'elle annote (`fichierId`).
const CLE_PRESENCES = 'a2031_presences';
const CLE_EVALS = 'a2031_evaluationsSauvegardees';
const CLE_ANNOTATIONS = 'a2031_annotationsTravaux';
const QUATRE = [CLE_GROUPE, CLE_PRESENCES, CLE_EVALS, CLE_ANNOTATIONS];

const ESPACE = {
    [CLE_GROUPE]: [
        { da: '9000001', nom: 'Fictif', prenom: 'Alix', groupe: '00001' },
        { da: '9000003', nom: 'Fictif', prenom: 'Camille', groupe: '00001' }
    ],
    [CLE_PRESENCES]: [
        { date: '2031-09-02', da: '9000001', periodesPresentes: 3, notes: 'de l\'espace', coursId: 'cours-banc' },
        { date: '2031-09-16', da: '9000003', periodesPresentes: 2, notes: '', coursId: 'cours-banc' }
    ],
    [CLE_EVALS]: [
        { id: 'EVAL_ESP_1', etudiantDA: '9000001', productionId: 'PROD_BANC_1', noteFinale: 85, statutRemise: 'evalue', criteres: [] },
        { id: 'EVAL_ESP_2', etudiantDA: '9000003', productionId: 'PROD_BANC_1', noteFinale: 60, statutRemise: 'evalue', criteres: [] }
    ],
    [CLE_ANNOTATIONS]: [
        { id: 'ANN_ESP_1', fichierId: COPIES[0], page: 1, type: 'texte', texte: 'annotation de l\'espace', x: 1, y: 2 }
    ]
};

const DU_FICHIER = {
    [CLE_GROUPE]: [
        { id: 1, da: '9000001', nom: 'Fictif', prenom: 'Alix (version du fichier)', groupe: '01' },
        { id: 2, da: '9000002', nom: 'Fictif', prenom: 'Bao', groupe: '01' }
    ],
    [CLE_PRESENCES]: [
        // Même date, même DA, cours absent : la même fiche que celle de l'espace.
        { date: '2031-09-02', da: '9000001', periodesPresentes: 0, notes: 'du fichier' },
        { date: '2031-09-09', da: '9000001', periodesPresentes: 2, notes: '', coursId: 'cours-banc' }
    ],
    [CLE_EVALS]: [
        // Même id que l'espace, contenu autre.
        { id: 'EVAL_ESP_1', etudiantDA: '9000001', productionId: 'PROD_BANC_1', noteFinale: 10, statutRemise: 'evalue', criteres: [] },
        // Id autre, même couple : l'espace a déjà une évaluation d'Alix pour cette production.
        { id: 'EVAL_9000001_BANC_1', etudiantDA: '9000001', productionId: 'PROD_BANC_1', noteFinale: 72, statutRemise: 'evalue', criteres: [] },
        // Une reprise du fichier, sur l'évaluation de l'espace : le couple est déjà là.
        { id: 'EVAL_REPRISE_F', etudiantDA: '9000001', productionId: 'PROD_BANC_1', noteFinale: 90, repriseDeId: 'EVAL_ESP_1', jetonRepriseApplique: true, statutRemise: 'evalue', criteres: [] },
        // Un couple absent de l'espace : elle entre.
        { id: 'EVAL_F_3', etudiantDA: '9000002', productionId: 'PROD_BANC_1', noteFinale: 66, statutRemise: 'evalue', criteres: [] }
    ],
    [CLE_ANNOTATIONS]: [
        { id: 'ANN_F_1', fichierId: COPIES[0], page: 1, type: 'texte', texte: 'du fichier, même copie', x: 5, y: 5 },
        { id: 'ANN_ESP_1', fichierId: 'FT_AUTRE', page: 1, type: 'texte', texte: 'même id, autre copie', x: 5, y: 5 },
        { id: 'ANN_F_2', fichierId: COPIE_DU_FICHIER, page: 1, type: 'texte', texte: 'Bonne idée directrice', x: 10, y: 20 }
    ]
};

const ATTENDU = {
    [CLE_GROUPE]: [...ESPACE[CLE_GROUPE], DU_FICHIER[CLE_GROUPE][1]],
    [CLE_PRESENCES]: [...ESPACE[CLE_PRESENCES], DU_FICHIER[CLE_PRESENCES][1]],
    [CLE_EVALS]: [...ESPACE[CLE_EVALS], DU_FICHIER[CLE_EVALS][3]],
    [CLE_ANNOTATIONS]: [...ESPACE[CLE_ANNOTATIONS], DU_FICHIER[CLE_ANNOTATIONS][2]]
};

/** Un ancien `.zip` dérivé de la fixture : les quatre familles sont celles qu'on lui donne. */
async function deriverZipDesQuatre(page, chemin, familles) {
    const b64 = await page.evaluate(async ({ source, familles }) => {
        const zip = await JSZip.loadAsync(Uint8Array.from(atob(source), (c) => c.charCodeAt(0)));
        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
        Object.keys(familles).forEach((cle) => { donnees[cle] = familles[cle]; });
        zip.file('donnees.json', JSON.stringify(donnees));
        return zip.generateAsync({ type: 'base64' });
    }, { source: fs.readFileSync(ANCIEN_ZIP).toString('base64'), familles });
    fs.writeFileSync(chemin, Buffer.from(b64, 'base64'));
    return chemin;
}

const lireQuatre = (page) => page.evaluate(async (cles) => {
    const r = {};
    for (const c of cles) r[c] = await db.get(c, null);
    return r;
}, QUATRE);

test.describe('#1012 — les quatre cases de l\'import ne remplacent plus ce que l\'espace a', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(3) tout coché par « C\'est ma propre sauvegarde » : rien de l\'espace ne bouge, le neuf entre, la mise à jour du codex écrit le tout', async ({ page, browser }) => {
        test.setTimeout(300000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier), { ...A.donnees, ...ESPACE });
        const ancien = await deriverZipDesQuatre(page, test.info().outputPath('ancien-quatre.zip'), DU_FICHIER);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);
        expect(await lireQuatre(neuf.page), 'témoin : l\'espace porte ses quatre familles').toEqual(ESPACE);

        const r = await ouvrirParLaCase(neuf.page, ancien);
        expect(r.cases, 'témoin : les quatre cases sont cochées').toEqual(expect.arrayContaining(['import-etudiants', 'import-presences', 'import-evaluations', 'import-annotationsTravaux']));
        const apres = await lireQuatre(neuf.page);

        await test.step('après l\'import : chaque entrée de l\'espace est là, telle quelle, et le neuf du fichier est entré à la suite', async () => {
            for (const c of QUATRE) expect.soft(apres[c], c).toEqual(ATTENDU[c]);
        });

        await test.step('aucune note de l\'espace ne change', async () => {
            const notes = (liste) => (liste || []).filter((e) => e.id.startsWith('EVAL_ESP_')).map((e) => [e.id, e.noteFinale, e.remplaceeParId || null]);
            expect.soft(notes(apres[CLE_EVALS])).toEqual([['EVAL_ESP_1', 85, null], ['EVAL_ESP_2', 60, null]]);
        });

        await test.step('le bilan compte ce qui est entré', async () => {
            expect.soft(r.bilan).toContain('1 étudiant(s)');
            expect.soft(r.bilan).toContain('1 date(s) de présences');
            expect.soft(r.bilan).toContain('1 annotation(s) sur les travaux');
        });

        await test.step('le même fichier rouvert ne double rien', async () => {
            await ouvrirParLaCase(neuf.page, ancien);
            expect.soft(await lireQuatre(neuf.page)).toEqual(apres);
        });

        await test.step('« Mettre à jour le codex » : dans A, sans fenêtre, le tout', async () => {
            await neuf.page.evaluate((cles) => { window.__clesSuivies = cles; }, QUATRE);
            const sortie = await mettreAJourLeCodex(neuf.page);
            expect(sortie.issue).toBe('réussie');
            expect(sortie.fenetre).toBeNull();
            expect(sortie.ecritures.length).toBe(1);
            expect(sortie.ecritures[0].fichier).toBe(A.fichier);
            expect(sortie.ecritures[0].familles).toEqual(ATTENDU);
        });
        await neuf.contexte.close();
    });

    test('(4) témoin : les quatre cases décochées ne touchent rien', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier), { ...A.donnees, ...ESPACE });
        const ancien = await deriverZipDesQuatre(page, test.info().outputPath('ancien-quatre.zip'), DU_FICHIER);
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);
        const r = await ouvrirParLaCase(neuf.page, ancien, { sauf: ['import-etudiants', 'import-presences', 'import-evaluations', 'import-annotationsTravaux'] });
        expect(r.cases).not.toContain('import-etudiants');
        expect(await lireQuatre(neuf.page)).toEqual(ESPACE);
        await neuf.contexte.close();
    });
});

// #1012, l'élève désinscrit (décision de Grégoire, 2 oct. 2026, vers 11 h 26 et 11 h 31 ; consigne
// de Cowork de 11 h 28) — UN ÉLÈVE SUPPRIMÉ NE REVIENT PLUS PAR UN ANCIEN FICHIER.
//
// Supprimer, c'est désinscrire : retirer le nom de l'élève dans le Cadre. Le geste garde une trace de
// son DA (`<trim>_elevesDesinscrits`) ; l'import par cases ne laisse plus rien entrer de lui : ni sa
// fiche, ni ses copies (ni leur fichier au magasin), ni ses évaluations, ni ses présences, ni ses
// annotations (par son DA, ou par la copie annotée). Ce qui reste de lui dans l'espace n'est pas effacé.
// Seul « Supprimer » écrit la trace : le décrochage est un statut, l'élève reste dans la liste.
const CLE_TRACE = 'a2031_elevesDesinscrits';
const CINQ = [CLE_GROUPE, CLE_PRESENCES, CLE_EVALS, CLE_ANNOTATIONS, CLE_COPIES];
const CAMILLE = '9000003';
const COPIE_DE_CAMILLE = 'FT_BANC_CAMILLE';
const COPIE_DE_BAO = 'FT_BANC_BAO';

// L'ancien fichier : Camille (supprimée dans l'espace) et Bao (absent de l'espace), chacun avec
// une copie (et son fichier), une évaluation, une présence et une annotation. Une annotation de
// Camille ne porte pas de DA : elle s'écarte par la copie qu'elle annote.
const ANCIEN_DESINSCRIT = {
    [CLE_GROUPE]: [
        { da: CAMILLE, nom: 'Fictif', prenom: 'Camille', groupe: '00001' },
        { da: '9000002', nom: 'Fictif', prenom: 'Bao', groupe: '00001' }
    ],
    [CLE_PRESENCES]: [
        { date: '2031-09-23', da: CAMILLE, periodesPresentes: 1, notes: '', coursId: 'cours-banc' },
        { date: '2031-09-23', da: '9000002', periodesPresentes: 2, notes: '', coursId: 'cours-banc' }
    ],
    [CLE_EVALS]: [
        { id: 'EVAL_F_CAMILLE', etudiantDA: CAMILLE, productionId: 'PROD_BANC_2', noteFinale: 70, statutRemise: 'evalue', criteres: [] },
        { id: 'EVAL_F_BAO', etudiantDA: '9000002', productionId: 'PROD_BANC_2', noteFinale: 75, statutRemise: 'evalue', criteres: [] }
    ],
    [CLE_ANNOTATIONS]: [
        { id: 'ANN_F_CAMILLE_SANS_DA', fichierId: COPIE_DE_CAMILLE, page: 1, type: 'texte', texte: 'sans DA', x: 1, y: 1 },
        { id: 'ANN_F_CAMILLE', fichierId: 'FT_ABSENTE', etudiantDA: CAMILLE, page: 1, type: 'texte', texte: 'avec DA', x: 1, y: 1 },
        { id: 'ANN_F_BAO', fichierId: COPIE_DE_BAO, etudiantDA: '9000002', page: 1, type: 'texte', texte: 'de Bao', x: 1, y: 1 }
    ]
};
const COPIES_DE_L_ANCIEN = [
    { entree: entreeDuFichier(COPIE_DE_CAMILLE, { etudiantDA: CAMILLE }), png: PNG_DU_FICHIER },
    { entree: entreeDuFichier(COPIE_DE_BAO), png: PNG_DU_FICHIER }
];

async function deriverAncienDesinscrit(page, chemin) {
    const b64 = await page.evaluate(async ({ source, familles, cleCopies, copies }) => {
        const zip = await JSZip.loadAsync(Uint8Array.from(atob(source), (c) => c.charCodeAt(0)));
        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
        Object.keys(familles).forEach((cle) => { donnees[cle] = familles[cle]; });
        donnees[cleCopies] = copies.map((c) => c.entree);
        zip.file('donnees.json', JSON.stringify(donnees));
        Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).forEach((n) => zip.remove(n));
        copies.forEach((c) => zip.file('travaux/' + c.entree.id + '.png', Uint8Array.from(atob(c.png), (x) => x.charCodeAt(0))));
        return zip.generateAsync({ type: 'base64' });
    }, { source: fs.readFileSync(ANCIEN_ZIP).toString('base64'), familles: ANCIEN_DESINSCRIT, cleCopies: CLE_COPIES, copies: COPIES_DE_L_ANCIEN });
    fs.writeFileSync(chemin, Buffer.from(b64, 'base64'));
    return chemin;
}

const lireCinq = (page) => page.evaluate(async (cles) => {
    const r = {};
    for (const c of cles) r[c] = await db.get(c, null);
    return r;
}, [...CINQ, CLE_TRACE]);

/** Le vrai geste du Cadre : le menu d'actions de la ligne de l'élève, « Supprimer », la question acceptée. */
async function supprimerParLeCadre(page, da) {
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    const menu = page.locator('#v2-listeEtudiants select[data-on-change="actionEtudiantV2Handler"][data-da="' + da + '"]');
    await expect(menu).toBeVisible();
    const questions = [];
    const ecouteur = (d) => { questions.push(d.message()); d.accept().catch(() => {}); };
    page.on('dialog', ecouteur);
    await menu.selectOption('supprimer');
    await expect.poll(() => page.evaluate((d) => (db.getSync('a2031_groupeEtudiants', []) || []).some((e) => e.da === d), da)).toBe(false);
    await page.waitForTimeout(500);
    page.off('dialog', ecouteur);
    expect(questions, 'témoin : la question de suppression a été posée et acceptée').toEqual([expect.stringMatching(/^Supprimer /)]);
}

/** L'espace de A et des quatre cases, le trimestre du banc actif : le Cadre montre sa liste. */
const ESPACE_DESINSCRIT = { ...A.donnees, ...ESPACE, trimestres: [{ id: 'a2031', nom: 'Automne 2031', actif: true }], trimestreActif: 'a2031' };

test.describe('#1012 — un élève supprimé ne revient plus par un ancien fichier', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(5) supprimée dans le Cadre, Camille ne revient pas : rien d\'elle n\'entre, Bao entre ; la trace survit au codex mis à jour', async ({ page, browser }) => {
        test.setTimeout(300000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier), ESPACE_DESINSCRIT);
        const ancien = await deriverAncienDesinscrit(page, test.info().outputPath('ancien-desinscrit.zip'));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);
        expect(await neuf.page.evaluate(() => cle('groupeEtudiants')), 'témoin : le trimestre actif est celui du banc').toBe(CLE_GROUPE);

        await supprimerParLeCadre(neuf.page, CAMILLE);
        const avant = await lireCinq(neuf.page);
        expect(avant[CLE_TRACE], 'la trace porte le DA de Camille').toEqual([{ da: CAMILLE, date: expect.any(String) }]);
        expect(avant[CLE_GROUPE].map((e) => e.da), 'témoin : Camille n\'est plus dans la liste').toEqual(['9000001']);
        expect(avant[CLE_EVALS].map((e) => e.id), 'ce qui reste d\'elle dans l\'espace n\'est pas effacé').toContain('EVAL_ESP_2');

        const r = await ouvrirParLaCase(neuf.page, ancien);
        expect(r.cases, 'témoin : les cinq cases sont cochées').toEqual(expect.arrayContaining(['import-etudiants', 'import-presences', 'import-evaluations', 'import-annotationsTravaux', 'import-fichiersTravaux']));
        const apres = await lireCinq(neuf.page);

        await test.step('rien de Camille n\'entre : fiche, présence, évaluation, annotations, copie', async () => {
            expect.soft(apres[CLE_GROUPE].map((e) => e.da)).toEqual(['9000001', '9000002']);
            expect.soft(apres[CLE_PRESENCES]).toEqual([...avant[CLE_PRESENCES], ANCIEN_DESINSCRIT[CLE_PRESENCES][1]]);
            expect.soft(apres[CLE_EVALS]).toEqual([...avant[CLE_EVALS], ANCIEN_DESINSCRIT[CLE_EVALS][1]]);
            expect.soft(apres[CLE_ANNOTATIONS]).toEqual([...avant[CLE_ANNOTATIONS], ANCIEN_DESINSCRIT[CLE_ANNOTATIONS][2]]);
            expect.soft(apres[CLE_COPIES].map((c) => c.id)).toEqual([...COPIES, COPIE_DE_BAO]);
        });
        await test.step('la copie de Camille ne dépose pas son fichier au magasin ; celle de Bao, oui', async () => {
            expect.soft((await lireCopies(neuf.page)).depots).toEqual([COPIE_DE_BAO]);
        });
        await test.step('la trace ne bouge pas, et ce qui restait de Camille dans l\'espace non plus', async () => {
            expect.soft(apres[CLE_TRACE]).toEqual(avant[CLE_TRACE]);
        });

        await test.step('« Mettre à jour le codex » : la trace est écrite dans A', async () => {
            await neuf.page.evaluate((cles) => { window.__clesSuivies = cles; }, [CLE_TRACE, CLE_GROUPE]);
            const sortie = await mettreAJourLeCodex(neuf.page);
            expect(sortie.issue).toBe('réussie');
            expect(sortie.ecritures.map((e) => e.familles)).toEqual([{ [CLE_TRACE]: avant[CLE_TRACE], [CLE_GROUPE]: apres[CLE_GROUPE] }]);
        });

        await test.step('la trace survit à un rechargement', async () => {
            await neuf.page.reload();
            await neuf.page.waitForLoadState('domcontentloaded');
            await expect.poll(() => neuf.page.evaluate((c) => (window.db ? db.get(c, null) : null), CLE_TRACE), { timeout: 20000 }).toEqual(avant[CLE_TRACE]);
        });
        await neuf.contexte.close();
    });

    test('(6) témoins : sans suppression, et en décrochage, Camille entre comme avant et aucune trace n\'est écrite', async ({ page, browser }) => {
        test.setTimeout(300000);
        await demarrer(page);
        const fichierA = await fabriquerCodex(page, test.info().outputPath(A.fichier), ESPACE_DESINSCRIT);
        const ancien = await deriverAncienDesinscrit(page, test.info().outputPath('ancien-desinscrit.zip'));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirAEnEntier(neuf.page, fichierA);

        // Le décrochage par le vrai menu « Remarque » de la ligne de Camille, la question acceptée.
        await neuf.page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
        const accepter = (d) => d.accept().catch(() => {});
        neuf.page.on('dialog', accepter);
        const remarque = async (valeur) => {
            await neuf.page.locator('#v2-listeEtudiants select[data-on-change="remarqueEtudiantV2Handler"][data-da="' + CAMILLE + '"]').selectOption(valeur);
            await expect.poll(() => neuf.page.evaluate((d) => ((db.getSync('a2031_groupeEtudiants', []) || []).find((e) => e.da === d) || {}).statut || '', CAMILLE)).toBe(valeur);
        };
        await remarque('décrochage');
        neuf.page.off('dialog', accepter);
        const avant = await lireCinq(neuf.page);
        expect(avant[CLE_TRACE], 'le décrochage n\'écrit pas la trace').toBeNull();

        await ouvrirParLaCase(neuf.page, ancien);
        const apres = await lireCinq(neuf.page);
        await test.step('sa fiche de l\'espace reste telle quelle (l\'espace l\'emporte), et ce que le fichier apporte d\'elle entre', async () => {
            expect.soft(apres[CLE_GROUPE].find((e) => e.da === CAMILLE)).toEqual(avant[CLE_GROUPE].find((e) => e.da === CAMILLE));
            expect.soft(apres[CLE_GROUPE].map((e) => e.da)).toEqual(['9000001', CAMILLE, '9000002']);
            expect.soft(apres[CLE_PRESENCES]).toEqual([...avant[CLE_PRESENCES], ...ANCIEN_DESINSCRIT[CLE_PRESENCES]]);
            expect.soft(apres[CLE_EVALS]).toEqual([...avant[CLE_EVALS], ...ANCIEN_DESINSCRIT[CLE_EVALS]]);
            expect.soft(apres[CLE_ANNOTATIONS]).toEqual([...avant[CLE_ANNOTATIONS], ...ANCIEN_DESINSCRIT[CLE_ANNOTATIONS]]);
            expect.soft(apres[CLE_COPIES].map((c) => c.id)).toEqual([...COPIES, COPIE_DE_CAMILLE, COPIE_DE_BAO]);
            expect.soft((await lireCopies(neuf.page)).depots).toEqual([COPIE_DE_CAMILLE, COPIE_DE_BAO]);
            expect.soft(apres[CLE_TRACE]).toBeNull();
        });
        await test.step('l\'inactivité et la réactivation n\'écrivent pas la trace non plus', async () => {
            neuf.page.on('dialog', accepter);
            await neuf.page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
            await remarque('inactif');
            await remarque('');
            neuf.page.off('dialog', accepter);
            expect.soft(await neuf.page.evaluate((c) => db.get(c, null), CLE_TRACE)).toBeNull();
        });
        await neuf.contexte.close();
    });
});
