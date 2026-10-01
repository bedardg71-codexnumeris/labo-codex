import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1012, suite (consigne de Cowork du 1er oct. 2026, 17 h 52 et 17 h 55) — L'AVERTISSEMENT
// À LA MISE À JOUR D'UN CODEX AUQUEL DES COPIES MANQUENT.
//
// Mesuré avant le lot : depuis un espace où des copies manquent, « Mettre à jour le codex »
// écrivait un fichier sans elles et l'écran disait « Codex mis à jour », rien de plus.
//
// LES RÈGLES JUGÉES ICI, par le geste (les boutons du menu Codex) :
//   1. Quand le codex entier va être écrit et que des copies ATTENDUES n'ont pas de fichier dans
//      l'application, une fenêtre le dit AVANT toute écriture hors de l'application (avant même
//      l'aperçu). « Attendue » : une entrée de la liste des copies dont le statut déclaré n'est
//      pas « exporte ». Le signal est compté à la génération, pas lu dans les statuts : un
//      « manquant » qui a son fichier ne compte pas ; un « present » sans fichier compte.
//   2. Tant que des copies manquent, l'application demande toujours où écrire : jamais dans le
//      fichier tenu, et la destination choisie n'est pas adoptée.
//   3. « Annuler » : rien n'est écrit, rien n'est demandé, rien ne dit « Codex mis à jour ».
//   4. « Exporter une sélection » n'écrit jamais dans le fichier tenu, demande toujours où
//      écrire, et sa destination n'est jamais adoptée.
//   5. Le bilan d'une ouverture incomplète porte les mots de chaque cause, sous le même titre.
//
// CE QUE CE BANC NE JUGE PAS : WebKit n'a ni `showOpenFilePicker` ni `showSaveFilePicker` ; le
// banc pose les deux (une fausse poignée qui consigne ce qu'on lui écrit, une fausse fenêtre de
// destination). Le partage de l'iPad est un faux `navigator.share` ; le téléchargement, un lien
// dont le clic est consigné. Les copies vivent dans un magasin en mémoire : le contexte éphémère
// de WebKit ne stocke pas de Blob dans IndexedDB. Chrome et l'iPad eux-mêmes restent inférés.

const CLE_GROUPE = 'a2031_groupeEtudiants';
const CLE_COPIES = 'a2031_fichiersTravaux';
const CLE_PRODUCTIONS = 'a2031_productions';
const CLE_GROUPE_HIVER = 'h2032_groupeEtudiants';
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const COPIES = ['FT_banc_A_1', 'FT_banc_A_2', 'FT_banc_A_3'];

// Un codex fictif de deux trimestres (l'export de sélection en exige deux), trois copies.
const A = {
    nom: 'Codex A du banc',
    fichier: 'codex-A.zip',
    donnees: {
        [CLE_GROUPE]: [{ da: '9000001', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }],
        [CLE_GROUPE_HIVER]: [{ da: '9000003', nom: 'Fictif', prenom: 'Camille', groupe: '00002' }],
        [CLE_PRODUCTIONS]: [{ id: 'PROD_banc_A', titre: 'Production fictive A', coursId: 'COURS_BANC_A', remplissage: 'x'.repeat(30 * 1024) }],
        [CLE_COPIES]: COPIES.map((id, i) => ({
            id, nomFichier: 'copie-' + (i + 1) + '.png', typeMIME: 'image/png',
            etudiantDA: '9000001', productionId: 'PROD_banc_A', blobStatut: 'present',
            remplissage: 'x'.repeat(12 * 1024)
        }))
    }
};

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/**
 * Le codex du banc, par le vrai `Codex.generer`. `absentes` : des copies que le fichier ne porte
 * pas (leur entrée reste dans la liste) ; `illisibles` : des copies dont le contenu n'est ni une
 * image ni un PDF.
 */
async function fabriquerCodex(page, chemin, { absentes = [], illisibles = [] } = {}) {
    const rendu = await page.evaluate(async ({ donnees, cleCopies, png, nom, absentes, illisibles }) => {
        Object.keys(donnees).forEach((cle) => db.setSync(cle, donnees[cle]));
        await db.flush();
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const ids = donnees[cleCopies].map((c) => c.id);
        window.__origineRecuperer = window.__origineRecuperer || window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async (id) => {
            if (absentes.includes(id)) return null;
            if (illisibles.includes(id)) return new Blob(['ceci n\'est ni une image ni un PDF'], { type: 'image/png' });
            return ids.includes(id) ? new Blob([octets], { type: 'image/png' }) : window.__origineRecuperer(id);
        };
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const codex = await Codex.generer({ nom });
        const zip = await JSZip.loadAsync(await codex.blob.arrayBuffer());
        const nbCopies = Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).length;
        const o = new Uint8Array(await codex.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return { b64: btoa(binaire), nbCopies };
    }, { donnees: A.donnees, cleCopies: CLE_COPIES, png: PNG_1PX, nom: A.nom, absentes, illisibles });
    expect(rendu.nbCopies, 'témoin : le codex fabriqué porte les copies prévues').toBe(3 - absentes.length);
    fs.writeFileSync(chemin, Buffer.from(rendu.b64, 'base64'));
    return chemin;
}

/**
 * Un espace neuf, dans un autre contexte, équipé comme Chrome. Tout ce qui sort de l'application
 * est consigné dans `__journal`, dans l'ordre : l'aperçu, la demande de destination, l'écriture.
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
        window.__journal = [];
        window.__ecritures = [];
        window.__destinationsDemandees = 0;
        window.__reponsesDestination = [];   // des noms de fichier ; vide : la fenêtre est refermée ; '!panne' : elle échoue
        window.__decrire = async (blob, fichier) => {
            const zip = await JSZip.loadAsync(await blob.arrayBuffer());
            const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
            const manifeste = JSON.parse(await zip.file('codex-manifeste.json').async('string'));
            return {
                fichier,
                donneesDe: donnees[cleGroupe] ? donnees[cleGroupe][0].prenom : null,
                copies: Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && !n.endsWith('/')).length,
                selection: manifeste.exportSelectif === true
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
            const nom = window.__reponsesDestination.shift();
            if (!nom) throw new DOMException('Fenêtre de destination refermée par le banc', 'AbortError');
            if (nom === '!panne') throw new Error('panne de la fenêtre de destination, posée par le banc');
            return window.__poignee(nom, null);
        };
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => { window.__journal.push('aperçu'); return true; };

        // Le magasin des copies, en mémoire. `__refus` : id → 'quota' | 'erreur'.
        window.__copies = new Map();
        window.__refus = {};
        db.storeBlob = async (enr) => {
            const refus = window.__refus[enr.id];
            if (refus === 'quota') throw new DOMException('Quota du banc', 'QuotaExceededError');
            if (refus === 'erreur') throw new Error('panne du banc à l\'écriture de la copie');
            window.__copies.set(enr.id, enr);
        };
        db.getBlob = async (id) => window.__copies.get(id) || null;
    }, CLE_GROUPE);
    expect(await page.evaluate((cle) => db.get(cle, null), CLE_GROUPE), 'témoin : l\'espace neuf est vide').toBeNull();
    return { contexte, page };
}

const versFichier = (chemin) => fs.readFileSync(chemin).toString('base64');

/** Le geste du menu dans Chrome : le sélecteur rend la poignée du fichier choisi. */
async function choisirParLeMenu(page, chemin) {
    await page.evaluate(({ b64, nom }) => {
        const octets = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const leFichier = new File([octets], nom, { type: 'application/zip' });
        window.showOpenFilePicker = async () => [window.__poignee(nom, leFichier)];
        window.__ouverture = Codex.actionOuvrir();
    }, { b64: versFichier(chemin), nom: A.fichier });
}

const messages = (page, sorte) => page.evaluate((s) => window.__messages.filter((m) => m.sorte === s), sorte);
const titresDesSucces = async (page) => (await messages(page, 'succes')).map((m) => m.titre);
const viderLeJournal = (page) => page.evaluate(() => { window.__journal.length = 0; window.__ecritures.length = 0; window.__messages.length = 0; window.__destinationsDemandees = 0; });

/** La fenêtre de dialogue ouverte : titre, message (avec ses sauts de ligne), boutons. */
async function lireFenetre(page) {
    return page.evaluate(() => {
        const o = document.getElementById('overlay-ui-dialogue');
        if (!o) return null;
        return {
            titre: o.querySelector('.modal-titre').textContent,
            message: o.querySelector('.modal-section').textContent,
            boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent)
        };
    });
}
async function attendreFenetre(page, titre) {
    await expect(page.locator('#overlay-ui-dialogue .modal-titre')).toHaveText(titre, { timeout: 30000 });
    return lireFenetre(page);
}
const bouton = (page, texte) => page.locator('#overlay-ui-dialogue').getByRole('button', { name: texte, exact: true });

/** Une ouverture complète par le menu, sans recharger : la page reste la même. */
async function ouvrirEnEntier(page, chemin) {
    await choisirParLeMenu(page, chemin);
    await expect(page.getByText('Codex chargé depuis « ' + A.fichier + ' »')).toBeVisible({ timeout: 30000 });
    await bouton(page, 'Annuler').click();
    await page.evaluate(() => window.__ouverture);
    expect(await titresDesSucces(page), 'témoin : l\'ouverture est complète').toContain('Codex ouvert : ' + A.nom);
    expect(await page.evaluate(() => window.__copies.size), 'témoin : les trois copies sont dans l\'application').toBe(3);
    await viderLeJournal(page);
}

/** Une ouverture où des copies sont refusées : elle va à son bout, incomplète. */
async function ouvrirSansCertainesCopies(page, chemin, refus) {
    await page.evaluate((r) => { window.__refus = r; }, refus);
    await choisirParLeMenu(page, chemin);
    const fenetre = await attendreFenetre(page, 'Codex ouvert, mais incomplet');
    await bouton(page, 'Annuler').click();
    await page.evaluate(() => window.__ouverture);
    await page.evaluate(() => { window.__refus = {}; });
    await viderLeJournal(page);
    return fenetre;
}

/** Le vrai geste : le menu Codex, puis la ligne visée. */
async function gesteDuMenu(page, action) {
    await page.locator('#btn-codex').click();
    await page.locator('#codex-menu [data-action="' + action + '"]').click();
}
const METTRE_A_JOUR = 'Codex.actionEnregistrer';
const ENREGISTRER_SOUS = 'Codex.actionEnregistrerSous';
const EXPORTER_SELECTION = 'Codex.actionExporterSelection';

/** La mise à jour est finie (écrite, refusée ou abandonnée) : la tentative n'est plus « en cours ». */
async function attendreLaFin(page) {
    await expect.poll(() => page.evaluate(() => (Codex.derniereTentative() || {}).issue), { timeout: 30000 }).not.toBe('en cours');
    return page.evaluate(() => Codex.derniereTentative().issue);
}

/** Ce qui est sorti de l'application depuis le dernier vidage du journal. */
const sorties = (page) => page.evaluate(() => ({
    journal: window.__journal.slice(),
    ecritures: window.__ecritures.slice(),
    destinationsDemandees: window.__destinationsDemandees
}));
const RIEN_N_EST_SORTI = { journal: [], ecritures: [], destinationsDemandees: 0 };

const AVERTISSEMENT = 'Ce codex n\'aura pas toutes tes copies';
const mots = (n, m) => n === 1
    ? {
        titre: AVERTISSEMENT,
        message: '1 copie sur ' + m + ' n\'est pas dans l\'application. Le codex que tu vas écrire ne la contiendra pas.'
            + '\n\nSi un autre fichier de codex la contient encore, ne le remplace pas : donne un autre nom à celui-ci.',
        boutons: ['Annuler', 'Écrire sans cette copie']
    }
    : {
        titre: AVERTISSEMENT,
        message: n + ' copies sur ' + m + ' ne sont pas dans l\'application. Le codex que tu vas écrire ne les contiendra pas.'
            + '\n\nSi un autre fichier de codex les contient encore, ne le remplace pas : donne un autre nom à celui-ci.',
        boutons: ['Annuler', 'Écrire sans ces copies']
    };

test.describe('#1012 — l\'avertissement à la mise à jour d\'un codex auquel des copies manquent', () => {
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('(1) après une ouverture incomplète : la fenêtre avant tout, « Annuler » n\'écrit rien, et la destination n\'est jamais adoptée', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichier = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirSansCertainesCopies(neuf.page, fichier, { [COPIES[1]]: 'quota', [COPIES[2]]: 'quota' });
        expect(await neuf.page.evaluate(() => window.__copies.size), 'témoin : une seule copie est dans l\'application').toBe(1);
        const etatAvant = await neuf.page.evaluate(() => Codex.etat());

        await test.step('« Mettre à jour le codex » : la fenêtre, avant l\'aperçu et avant toute sortie', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(2, 3));
            expect(await sorties(neuf.page), 'rien n\'est sorti de l\'application, pas même l\'aperçu').toEqual(RIEN_N_EST_SORTI);
            // « Annuler » a le focus : une touche Entrée donnée par réflexe n'écrit rien.
            expect(await neuf.page.evaluate(() => document.activeElement && document.activeElement.textContent)).toBe('Annuler');
            await neuf.page.screenshot({ path: test.info().outputPath('avertissement.png') });
        });

        await test.step('« Annuler » : rien n\'est écrit, rien ne dit « Codex mis à jour »', async () => {
            await bouton(neuf.page, 'Annuler').click();
            expect(await attendreLaFin(neuf.page)).toBe('avertissement des copies manquantes refusé par l\'usager');
            expect(await sorties(neuf.page)).toEqual(RIEN_N_EST_SORTI);
            expect(await titresDesSucces(neuf.page)).toEqual([]);
            expect(await neuf.page.evaluate(() => Codex.etat()), 'l\'état du codex n\'a pas bougé').toEqual(etatAvant);
            // Le témoin commun ne dit rien non plus : ni « Codex mis à jour », ni un échec.
            expect(await neuf.page.evaluate(() => {
                const echec = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
                return !!(echec && echec.classList.contains('visible'));
            }), 'aucun échec au témoin : un refus de l\'usager sort sans message').toBe(false);
        });

        await test.step('« Écrire sans ces copies » : l\'aperçu, puis la destination demandée, puis le fichier choisi', async () => {
            await neuf.page.evaluate(() => { window.__reponsesDestination = ['autre-nom.zip']; });
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            await attendreFenetre(neuf.page, AVERTISSEMENT);
            await bouton(neuf.page, 'Écrire sans ces copies').click();
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await sorties(neuf.page)).toEqual({
                journal: ['aperçu', 'destination demandée', 'écriture dans autre-nom.zip'],
                ecritures: [{ fichier: 'autre-nom.zip', donneesDe: 'Alix', copies: 1, selection: false }],
                destinationsDemandees: 1
            });
            expect(await titresDesSucces(neuf.page)).toEqual(['Codex mis à jour']);
        });

        await test.step('la destination choisie n\'est pas adoptée : la mise à jour suivante redemande où écrire', async () => {
            expect(await neuf.page.evaluate(() => Codex.etat().handleFSAPI), 'aucun fichier tenu').toBe(false);
            await viderLeJournal(neuf.page);
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(2, 3));
            await bouton(neuf.page, 'Écrire sans ces copies').click();
            expect(await attendreLaFin(neuf.page)).toBe('fenêtre de choix refusée par l\'usager');
            expect(await sorties(neuf.page), 'rien n\'est écrit dans autre-nom.zip sans le demander')
                .toEqual({ journal: ['aperçu', 'destination demandée'], ecritures: [], destinationsDemandees: 1 });
        });
        await neuf.contexte.close();
    });

    test('(2) un fichier tenu, puis une copie qui n\'est plus là : jamais de réécriture en place ; les copies revenues, le fichier tenu sert de nouveau', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichier = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichier);

        await test.step('témoin : aucune copie ne manque, aucune fenêtre, le codex est écrit dans le fichier tenu', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await lireFenetre(neuf.page), 'aucune fenêtre').toBeNull();
            expect(await sorties(neuf.page)).toEqual({
                journal: ['aperçu', 'écriture dans ' + A.fichier],
                ecritures: [{ fichier: A.fichier, donneesDe: 'Alix', copies: 3, selection: false }],
                destinationsDemandees: 0
            });
            await viderLeJournal(neuf.page);
        });

        const perdue = await neuf.page.evaluate((id) => { const c = window.__copies.get(id); window.__copies.delete(id); window.__perdue = c; return !!c; }, COPIES[1]);
        expect(perdue, 'témoin : la copie était bien là').toBe(true);

        await test.step('une copie manque : la fenêtre au singulier, puis la destination demandée, jamais le fichier tenu', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(1, 3));
            await bouton(neuf.page, 'Écrire sans cette copie').click();
            expect(await attendreLaFin(neuf.page)).toBe('fenêtre de choix refusée par l\'usager');
            expect(await sorties(neuf.page), 'le fichier tenu n\'est pas réécrit')
                .toEqual({ journal: ['aperçu', 'destination demandée'], ecritures: [], destinationsDemandees: 1 });
            expect(await titresDesSucces(neuf.page)).toEqual([]);
            await viderLeJournal(neuf.page);
        });

        await test.step('l\'écriture échoue, puis « Réessayer » : la destination est redemandée, le fichier tenu n\'est toujours pas réécrit', async () => {
            await neuf.page.evaluate(() => { window.__reponsesDestination = ['!panne', 'ailleurs.zip']; });
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            await attendreFenetre(neuf.page, AVERTISSEMENT);
            await bouton(neuf.page, 'Écrire sans cette copie').click();
            await attendreFenetre(neuf.page, 'Codex non mis à jour');
            await bouton(neuf.page, 'Réessayer').click();
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await sorties(neuf.page)).toEqual({
                journal: ['aperçu', 'destination demandée', 'destination demandée', 'écriture dans ailleurs.zip'],
                ecritures: [{ fichier: 'ailleurs.zip', donneesDe: 'Alix', copies: 2, selection: false }],
                destinationsDemandees: 2
            });
            // Le message de réussite ne dit pas « même fichier » : ce n'est pas le fichier tenu.
            const [reussite] = await messages(neuf.page, 'succes');
            expect(reussite.titre).toBe('Codex mis à jour');
            expect(reussite.detail).toMatch(/ – fichier choisi$/);
            await viderLeJournal(neuf.page);
        });

        await test.step('« Enregistrer sous… » : la même fenêtre ; « Annuler » n\'écrit rien', async () => {
            await gesteDuMenu(neuf.page, ENREGISTRER_SOUS);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(1, 3));
            await bouton(neuf.page, 'Annuler').click();
            expect(await attendreLaFin(neuf.page)).toBe('avertissement des copies manquantes refusé par l\'usager');
            expect(await sorties(neuf.page)).toEqual(RIEN_N_EST_SORTI);
        });

        await test.step('la copie est revenue : aucune fenêtre, et le fichier tenu l\'est toujours', async () => {
            await neuf.page.evaluate((id) => { window.__copies.set(id, window.__perdue); }, COPIES[1]);
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await sorties(neuf.page)).toEqual({
                journal: ['aperçu', 'écriture dans ' + A.fichier],
                ecritures: [{ fichier: A.fichier, donneesDe: 'Alix', copies: 3, selection: false }],
                destinationsDemandees: 0
            });
        });
        await neuf.contexte.close();
    });

    test('(3) le signal est compté, pas lu dans les statuts : « exporte » sans fichier et « manquant » avec fichier ne comptent pas', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichier = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichier);
        const poserLesStatuts = (statuts) => neuf.page.evaluate(async ({ cle, statuts }) => {
            const liste = await db.get(cle, []);
            liste.forEach((c, i) => { c.blobStatut = statuts[i]; });
            db.setSync(cle, liste);
            await db.flush();
        }, { cle: CLE_COPIES, statuts });

        await test.step('copie 1 « exporte » avec son fichier, copie 2 « manquant » avec son fichier, copie 3 « exporte » sans fichier : aucune fenêtre', async () => {
            await poserLesStatuts(['exporte', 'manquant', 'exporte']);
            await neuf.page.evaluate((id) => { window.__perdue = window.__copies.get(id); window.__copies.delete(id); }, COPIES[2]);
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await lireFenetre(neuf.page), 'aucune fenêtre').toBeNull();
            // Les deux fichiers présents partent dans le codex, quel que soit leur statut.
            expect(await sorties(neuf.page)).toEqual({
                journal: ['aperçu', 'écriture dans ' + A.fichier],
                ecritures: [{ fichier: A.fichier, donneesDe: 'Alix', copies: 2, selection: false }],
                destinationsDemandees: 0
            });
            await viderLeJournal(neuf.page);
        });

        await test.step('la copie 3 redevient « present », toujours sans fichier : elle compte, sur les deux copies attendues', async () => {
            await poserLesStatuts(['exporte', 'manquant', 'present']);
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(1, 2));
            await bouton(neuf.page, 'Annuler').click();
            await attendreLaFin(neuf.page);
            expect(await sorties(neuf.page)).toEqual(RIEN_N_EST_SORTI);
        });
        await neuf.contexte.close();
    });

    test('(4) sans fenêtre de destination (l\'iPad, Safari) : la fenêtre passe avant le partage et avant le téléchargement', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichier = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirSansCertainesCopies(neuf.page, fichier, { [COPIES[0]]: 'quota' });
        await neuf.page.evaluate(() => {
            delete window.showSaveFilePicker;
            window.__partageOffert = true;
            window.__partages = [];
            Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => window.__partageOffert });
            Object.defineProperty(navigator, 'share', {
                configurable: true,
                value: async (ce) => { window.__journal.push('partage'); window.__partages.push(await window.__decrire(ce.files[0], 'partagé')); }
            });
            window.__telechargements = 0;
            const clicOrigine = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () {
                if (this.download) { window.__journal.push('téléchargement'); window.__telechargements++; return; }
                return clicOrigine.call(this);
            };
        });
        const sortiesIPad = () => neuf.page.evaluate(() => ({ journal: window.__journal.slice(), partages: window.__partages.slice(), telechargements: window.__telechargements }));

        await test.step('le partage : « Annuler » ne partage rien', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(1, 3));
            expect(await sortiesIPad()).toEqual({ journal: [], partages: [], telechargements: 0 });
            await bouton(neuf.page, 'Annuler').click();
            await attendreLaFin(neuf.page);
            expect(await sortiesIPad()).toEqual({ journal: [], partages: [], telechargements: 0 });
            expect(await titresDesSucces(neuf.page)).toEqual([]);
        });

        await test.step('le partage : « Écrire sans cette copie » partage le fichier, sans la copie', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            await attendreFenetre(neuf.page, AVERTISSEMENT);
            await bouton(neuf.page, 'Écrire sans cette copie').click();
            // Si le toucher a expiré pendant la préparation, la fenêtre « Ton codex est prêt » en demande un frais.
            await expect.poll(async () => {
                if ((await lireFenetre(neuf.page))?.titre === 'Ton codex est prêt') await bouton(neuf.page, 'Enregistrer').click();
                return neuf.page.evaluate(() => Codex.derniereTentative().issue);
            }, { timeout: 30000 }).toBe('réussie');
            expect(await sortiesIPad()).toEqual({
                journal: ['aperçu', 'partage'],
                partages: [{ fichier: 'partagé', donneesDe: 'Alix', copies: 2, selection: false }],
                telechargements: 0
            });
            await viderLeJournal(neuf.page);
            await neuf.page.evaluate(() => { window.__partages.length = 0; });
        });

        await test.step('le téléchargement : la fenêtre d\'abord, puis le lien', async () => {
            await neuf.page.evaluate(() => { window.__partageOffert = false; });
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreFenetre(neuf.page, AVERTISSEMENT)).toEqual(mots(1, 3));
            expect(await sortiesIPad()).toEqual({ journal: [], partages: [], telechargements: 0 });
            await bouton(neuf.page, 'Écrire sans cette copie').click();
            await attendreFenetre(neuf.page, 'Téléchargement lancé');
            expect(await sortiesIPad()).toEqual({ journal: ['aperçu', 'téléchargement'], partages: [], telechargements: 1 });
            await bouton(neuf.page, 'Il y est').click();
            expect(await attendreLaFin(neuf.page)).toBe('téléchargement confirmé par l\'usager');
        });
        await neuf.contexte.close();
    });

    test('(5) « Exporter une sélection » : jamais dans le fichier tenu, toujours où écrire, destination jamais adoptée', async ({ page, browser }) => {
        test.setTimeout(240000);
        await demarrer(page);
        const fichier = await fabriquerCodex(page, test.info().outputPath(A.fichier));
        const neuf = await ouvrirEspaceNeuf(browser);
        await ouvrirEnEntier(neuf.page, fichier);

        const exporterLaSelection = async () => {
            await gesteDuMenu(neuf.page, EXPORTER_SELECTION);
            await attendreFenetre(neuf.page, 'Export sélectif');
            await neuf.page.locator('#ui-dialogue-saisie').fill('tous');
            await bouton(neuf.page, 'OK').click();
            await expect(neuf.page.locator('#overlay-ui-dialogue .modal-section')).toContainText('Continuer ?', { timeout: 30000 });
            await bouton(neuf.page, 'Continuer').click();
            await expect.poll(() => neuf.page.evaluate(() => window.__ecritures.length + window.__destinationsDemandees), { timeout: 30000 }).toBeGreaterThan(0);
            await expect(neuf.page.locator('#progression-overlay')).toBeHidden({ timeout: 30000 });
        };
        const ECRIT_DANS_A = {
            journal: ['aperçu', 'écriture dans ' + A.fichier],
            ecritures: [{ fichier: A.fichier, donneesDe: 'Alix', copies: 3, selection: false }],
            destinationsDemandees: 0
        };

        await test.step('un fichier de codex est tenu : la sélection demande où écrire, et n\'écrit pas dans ce fichier', async () => {
            await neuf.page.evaluate(() => { window.__reponsesDestination = ['selection.zip']; });
            await exporterLaSelection();
            expect(await sorties(neuf.page)).toEqual({
                journal: ['destination demandée', 'écriture dans selection.zip'],
                ecritures: [{ fichier: 'selection.zip', donneesDe: 'Alix', copies: 3, selection: true }],
                destinationsDemandees: 1
            });
            await viderLeJournal(neuf.page);
        });

        await test.step('la destination de la sélection n\'est pas adoptée : le codex s\'écrit encore dans son fichier', async () => {
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreLaFin(neuf.page)).toBe('réussie');
            expect(await sorties(neuf.page)).toEqual(ECRIT_DANS_A);
            await viderLeJournal(neuf.page);
        });

        await test.step('aucun fichier tenu : la destination de la sélection n\'est pas adoptée non plus', async () => {
            await neuf.page.evaluate(() => { Codex.fermer(); });
            await neuf.page.evaluate(() => { window.__reponsesDestination = ['selection-2.zip']; });
            await exporterLaSelection();
            expect((await sorties(neuf.page)).ecritures).toEqual([{ fichier: 'selection-2.zip', donneesDe: 'Alix', copies: 3, selection: true }]);
            expect(await neuf.page.evaluate(() => Codex.etat().handleFSAPI), 'aucun fichier tenu après l\'export').toBe(false);
            await viderLeJournal(neuf.page);
            await gesteDuMenu(neuf.page, METTRE_A_JOUR);
            expect(await attendreLaFin(neuf.page)).toBe('fenêtre de choix refusée par l\'usager');
            expect(await sorties(neuf.page), 'la mise à jour demande où écrire, sans toucher au fichier de sélection')
                .toEqual({ journal: ['aperçu', 'destination demandée'], ecritures: [], destinationsDemandees: 1 });
        });
        await neuf.contexte.close();
    });

    test('(6) le bilan d\'une ouverture incomplète : les mots de chaque cause, dans la fenêtre qui reste', async ({ page, browser }) => {
        test.setTimeout(300000);
        await demarrer(page);
        const SUITE = ' Tes données, elles, sont complètes, et ton fichier de codex n\'a pas changé.';
        const QUESTION = '\n\nRecharger la page pour appliquer les données ?';
        const BOUTONS = ['Annuler', 'Recharger'];

        await test.step('une copie absente du fichier', async () => {
            const fichier = await fabriquerCodex(page, test.info().outputPath('absente.zip'), { absentes: [COPIES[0]] });
            const neuf = await ouvrirEspaceNeuf(browser);
            expect(await ouvrirSansCertainesCopies(neuf.page, fichier, {})).toEqual({
                titre: 'Codex ouvert, mais incomplet',
                message: '1 copie sur 3 n\'est pas dans ce fichier de codex.' + SUITE
                    + '\n\nElle manquait déjà quand ce codex a été écrit : le rouvrir ne la ramènera pas. Cherche-la dans un codex plus ancien ou dans une archive.'
                    + QUESTION,
                boutons: BOUTONS
            });
            await neuf.contexte.close();
        });

        await test.step('deux copies dont le contenu n\'est ni une image ni un PDF', async () => {
            const fichier = await fabriquerCodex(page, test.info().outputPath('illisibles.zip'), { illisibles: [COPIES[0], COPIES[2]] });
            const neuf = await ouvrirEspaceNeuf(browser);
            expect(await ouvrirSansCertainesCopies(neuf.page, fichier, {})).toEqual({
                titre: 'Codex ouvert, mais incomplet',
                message: '2 copies sur 3 n\'ont pas été reprises : leur contenu n\'est ni une image ni un PDF.' + SUITE
                    + '\n\nRouvrir le même codex ne les ramènera pas.'
                    + QUESTION,
                boutons: BOUTONS
            });
            await neuf.contexte.close();
        });

        await test.step('une copie que l\'application n\'a pas pu écrire, à cause d\'une erreur', async () => {
            const fichier = await fabriquerCodex(page, test.info().outputPath('erreur.zip'));
            const neuf = await ouvrirEspaceNeuf(browser);
            expect(await ouvrirSansCertainesCopies(neuf.page, fichier, { [COPIES[1]]: 'erreur' })).toEqual({
                titre: 'Codex ouvert, mais incomplet',
                message: '1 copie sur 3 n\'a pas pu revenir, à cause d\'une erreur.' + SUITE
                    + '\n\nPour retrouver cette copie : rouvre le même codex. Si l\'erreur revient, utilise « Signaler un bug ou donner ton avis ».'
                    + QUESTION,
                boutons: BOUTONS
            });
            await neuf.contexte.close();
        });

        await test.step('un mélange : trois copies, trois causes ; chaque conseil porte le nom de sa cause, celui de l\'espace en premier', async () => {
            const fichier = await fabriquerCodex(page, test.info().outputPath('melange.zip'), { absentes: [COPIES[0]], illisibles: [COPIES[1]] });
            const neuf = await ouvrirEspaceNeuf(browser);
            expect(await ouvrirSansCertainesCopies(neuf.page, fichier, { [COPIES[2]]: 'quota' })).toEqual({
                titre: 'Codex ouvert, mais incomplet',
                message: '3 copies sur 3 n\'ont pas pu revenir : 1 faute d\'espace, 1 absente du fichier, 1 dans un format non reconnu.' + SUITE
                    + '\n\nFaute d\'espace. Pour retrouver cette copie : si tu es en navigation privée, rouvre l\'application dans une fenêtre normale. Sinon, libère de l\'espace sur le disque de l\'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.'
                    + '\n\nAbsente du fichier. Elle manquait déjà quand ce codex a été écrit : le rouvrir ne la ramènera pas. Cherche-la dans un codex plus ancien ou dans une archive.'
                    + '\n\nDans un format non reconnu. Rouvrir le même codex ne la ramènera pas.'
                    + QUESTION,
                boutons: BOUTONS
            });
            // La fenêtre du mélange tient à l'écran : ses deux boutons se voient sans défilement.
            for (const taille of [{ width: 1280, height: 800 }, { width: 820, height: 1180 }]) {
                await neuf.page.setViewportSize(taille);
                await neuf.page.evaluate((id) => { window.__refus = { [id]: 'quota' }; }, COPIES[2]);
                await choisirParLeMenu(neuf.page, fichier);
                await attendreFenetre(neuf.page, 'Codex ouvert, mais incomplet');
                const cadre = await neuf.page.evaluate(() => {
                    const r = (el) => { const b = el.getBoundingClientRect(); return { haut: Math.round(b.top), bas: Math.round(b.bottom) }; };
                    return {
                        fenetre: r(document.querySelector('#overlay-ui-dialogue .modal-contenu')),
                        boutons: Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).map(r),
                        hauteurEcran: window.innerHeight
                    };
                });
                expect(cadre.fenetre.haut, 'le haut de la fenêtre est à l\'écran (' + taille.width + ' × ' + taille.height + ')').toBeGreaterThanOrEqual(0);
                cadre.boutons.forEach((b) => expect(b.bas, 'les boutons sont à l\'écran').toBeLessThanOrEqual(cadre.hauteurEcran));
                await neuf.page.screenshot({ path: test.info().outputPath('melange-' + taille.width + 'x' + taille.height + '.png') });
                await bouton(neuf.page, 'Annuler').click();
                await neuf.page.evaluate(() => window.__ouverture);
            }
            await neuf.contexte.close();
        });
    });
});
