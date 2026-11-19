import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// #1298 (19 nov. 2026, lot `lot/dupliquer-copie-profonde`) — « DUPLIQUER » NE LIE PLUS LA COPIE À SA SOURCE.
//
// LE DÉFAUT, mesuré par `lot/autoevaluation-consignes` (`RAPPORT-2026-11-19-noms-des-seuils.md`, complément de
// 17 h 40) : les gestes copiaient l'objet par étalement (`{ ...source }`, `Object.assign`). La copie ne recevait pas
// SES sous-objets, elle recevait LES MÊMES. IndexedDB, qui enregistre par clonage structuré, garde ce partage dans
// la valeur écrite : relus par `db.get`, source et copie pointent vers les mêmes objets. Changer un texte dans la
// copie le changeait dans la source, et encore après rechargement.
//
// ▣ CE QUE CHAQUE ESSAI JUGE, PAR LE GESTE RÉEL, DANS L'ORDRE D'UN UTILISATEUR :
//   1. dupliquer ; 2. relire la collection par `db.get` (IndexedDB, là où le lien vivait) : aucun objet de la copie
//      n'est un objet de la source (le LIEN) ; 3. changer un texte imbriqué DANS LA COPIE, par le geste de l'éditeur ;
//   4. la source n'a pas bougé (l'EFFET) ; 5. recharger la page, relire : toujours pas, et la copie garde son texte.
//   Le `localStorage` (JSON) ne montre jamais le lien : il est lu aussi, pour que l'écran et la base disent pareil.
//
// ▣ BREAK-TEST (fait au lot, voir le rapport) : remettre l'étalement dans le geste rend l'essai rouge aux étapes 2
//   et 4 — l'essai a été écrit et vu rouge AVANT la correction.
//
// Données FICTIVES. ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

const ID_DEPART = 'ECHELLE_IDME_DEPART';
const TEXTE_D = 'Situe l’œuvre fictive dans son contexte, sans encore la nuancer.';
const TEXTE_COPIE = 'Texte réécrit dans la copie seulement.';

const GRILLE_SOURCE = {
    id: 'GRILLE_SRC_1298',
    nom: 'Grille fictive à dupliquer',
    type: 'holistique',
    criteres: [
        {
            id: 'CR_A_1298', nom: 'Pertinence fictive', type: 'holistique', ponderation: 50,
            descripteurs: { echelleId: ID_DEPART, parNiveau: { D: TEXTE_D } },
            sousCriteres: [{ code: '1', nom: 'Sous-critère fictif' }]
        },
        { id: 'CR_B_1298', nom: 'Cohérence fictive', type: 'holistique', ponderation: 50 }
    ],
    isDemo: false
};

async function ouvrirLesGrilles(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate(async (source) => {
        await assurerEchelleIdmeDeDepart();
        await db.set(cle('grillesTemplates'), [source]);   // security-ok: banc, une grille fictive dans un contexte neuf
        await db.flush();
        naviguerVers('conception', 'grille-criteres');
    }, GRILLE_SOURCE);
}

/** Source et copie relues par `db.get` (IndexedDB) et par `db.getSync` (le JSON du localStorage), avec leurs objets communs. */
const lire = (page) => page.evaluate(async ({ idSource, nomCopie }) => {
    // Les chemins des objets que source et copie ont EN COMMUN (même référence), vus depuis la copie. Un objet
    // partagé ne se voit que par identité : deux objets égaux en contenu ne sont pas un lien. Écrit ici, dans le
    // banc, pour ne pas juger le geste avec le code qu'il juge (la CSP refuse un script injecté : tout tient ici).
    const objetsPartages = (a, b) => {
        const vus = new Set();
        (function noter(v) {
            if (!v || typeof v !== 'object' || vus.has(v)) return;
            vus.add(v);
            for (const k of Object.keys(v)) noter(v[k]);
        })(a);
        const chemins = [];
        (function chercher(v, chemin, dejaVus) {
            if (!v || typeof v !== 'object' || dejaVus.has(v)) return;
            dejaVus.add(v);
            if (vus.has(v)) { chemins.push(chemin || '(racine)'); return; }
            for (const k of Object.keys(v)) chercher(v[k], chemin ? chemin + '.' + k : k, dejaVus);
        })(b, '', new Set());
        return chemins;
    };
    const enBase = (await db.get(cle('grillesTemplates'))) || [];
    const source = enBase.find((g) => g.id === idSource);
    // La copie, par son nom : l'application sème aussi « Grille de départ » en route, à un moment qui n'est pas le geste.
    const copies = enBase.filter((g) => g.nom === nomCopie);
    const copie = copies[0] || null;
    const json = db.getSync(cle('grillesTemplates'), []) || [];
    const texteD = (g) => g && g.criteres && g.criteres[0] && g.criteres[0].descripteurs
        && g.criteres[0].descripteurs.parNiveau && g.criteres[0].descripteurs.parNiveau.D;
    return {
        copies: copies.length,
        idCopie: copie && copie.id,
        idsCriteresCopie: copie ? copie.criteres.map((c) => c.id) : null,
        partages: copie ? objetsPartages(source, copie) : null,
        texteSource: texteD(source),
        texteCopie: texteD(copie),
        texteSourceJson: texteD(json.find((g) => g.id === idSource)),
        texteCopieJson: texteD(copie && json.find((g) => g.id === copie.id))
    };
}, { idSource: GRILLE_SOURCE.id, nomCopie: GRILLE_SOURCE.nom + ' (copie)' });

const caseD = (page, idGrille) => page.locator(
    `#listeCriteres textarea[data-on-change="modifierDescripteurNiveauHandler"][data-grille-id="${idGrille}"][data-critere-index="0"][data-niveau="D"]`);

/** Le scénario commun : `dupliquer` fait le geste et laisse la copie ouverte dans l'éditeur. */
async function scenario(page, dupliquer) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirLesGrilles(page);

    await dupliquer(page);
    await expect.poll(async () => (await lire(page)).copies).toBe(1);
    const apresDuplication = await lire(page);
    const idCopie = apresDuplication.idCopie;

    // Supposé par Cowork et gardé : la copie garde les identifiants de critères de sa source.
    expect(apresDuplication.idsCriteresCopie).toEqual(['CR_A_1298', 'CR_B_1298']);
    // LE LIEN : aucun objet en commun, relu dans IndexedDB.
    expect(apresDuplication.partages).toEqual([]);
    expect(apresDuplication.texteCopie).toBe(TEXTE_D);

    // L'EFFET : le texte du niveau D réécrit dans la copie, par sa case, dans l'éditeur.
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, idCopie);
    await expect(caseD(page, idCopie)).toHaveValue(TEXTE_D);
    await caseD(page, idCopie).fill(TEXTE_COPIE);
    await caseD(page, idCopie).press('Tab');
    await expect.poll(async () => (await lire(page)).texteCopie).toBe(TEXTE_COPIE);
    const avantRechargement = await lire(page);
    expect(avantRechargement.texteSource).toBe(TEXTE_D);
    expect(avantRechargement.texteSourceJson).toBe(TEXTE_D);
    expect(avantRechargement.texteCopieJson).toBe(TEXTE_COPIE);
    expect(avantRechargement.partages).toEqual([]);

    // RECHARGÉE : la source garde son texte, la copie le sien.
    await page.evaluate(() => db.flush());
    await page.reload();
    await attendreApplication(page);
    const apresRechargement = await lire(page);
    expect(apresRechargement.texteSource).toBe(TEXTE_D);
    expect(apresRechargement.texteCopie).toBe(TEXTE_COPIE);
    expect(apresRechargement.texteSourceJson).toBe(TEXTE_D);
    expect(apresRechargement.partages).toEqual([]);

    // La source, rouverte dans l'éditeur, montre son propre texte.
    await page.evaluate(async (id) => { naviguerVers('conception', 'grille-criteres'); await chargerGrillePourModif(id); }, GRILLE_SOURCE.id);
    await expect(caseD(page, GRILLE_SOURCE.id)).toHaveValue(TEXTE_D);
    expect(erreurs).toEqual([]);
}

for (const vue of [{ nom: 'paysage', width: 1180, height: 820 }, { nom: 'portrait', width: 820, height: 1180 }]) {
    test.describe(`#1298 · Dupliquer une grille — la copie est à elle (${vue.nom}, ${vue.width} × ${vue.height})`, () => {
        test.use({ viewport: { width: vue.width, height: vue.height }, hasTouch: true });

        test('« Dupliquer » de l’éditeur : changer la copie ne change pas la source, avant et après rechargement', async ({ page }) => {
            await scenario(page, async (p) => {
                await p.evaluate(async (id) => { await chargerGrillePourModif(id); }, GRILLE_SOURCE.id);
                await p.locator('#btnDupliquerGrille').tap();
            });
        });

        test('« Dupliquer » de la bibliothèque : changer la copie ne change pas la source, avant et après rechargement', async ({ page }) => {
            await scenario(page, async (p) => {
                await p.evaluate(async (id) => { await dupliquerGrilleBibliotheque(id); }, GRILLE_SOURCE.id);
            });
        });
    });
}
