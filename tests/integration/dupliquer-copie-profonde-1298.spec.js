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
// Mesuré au lot, sur le code d'avant : huit gestes portaient le lien — « Dupliquer » de l'éditeur et de la
// bibliothèque, pour les grilles (`criteres`), les échelles (`niveaux`, `config`), les cartouches (`criteres`,
// `niveaux` ; et `commentaires` par la bibliothèque) et les productions (`echeancesParGroupe`, `titresBlocs`,
// `champsPersonnalises`). Un essai par geste ci-dessous, en paysage et en portrait.
//
// ▣ CE QUE CHAQUE ESSAI JUGE, PAR LE GESTE RÉEL, DANS L'ORDRE D'UN UTILISATEUR :
//   1. dupliquer ; 2. relire la collection par `db.get` (IndexedDB, là où le lien vivait) : aucun objet de la copie
//      n'est un objet de la source (le LIEN) ; 3. changer un texte imbriqué DANS LA COPIE, par sa case dans
//      l'éditeur ; 4. la source n'a pas bougé (l'EFFET) ; 5. recharger la page, relire : toujours pas, et la copie
//      garde son texte. Le `localStorage` (JSON) ne montre jamais le lien : il est lu aussi.
//   ⚠ LES PRODUCTIONS N'ONT PAS D'ÉTAPE 3-4 : leur formulaire remplace chaque champ en entier à l'enregistrement,
//   aucun geste n'écrit DANS un sous-objet partagé (lu au code, `js/productions.js`). Le lien y était latent ; leur
//   essai juge le lien seul (étape 2), avant et après rechargement — c'est lui qui rougit au break-test.
//   De même pour la cartouche dupliquée depuis l'éditeur : ses `commentaires` étaient déjà recopiés (à un niveau),
//   seuls `criteres` et `niveaux` étaient partagés, et rien ne les écrit en place. L'essai change quand même un
//   commentaire de la copie (l'effet, vert avant comme après) ; c'est le lien (étape 2) qui discrimine.
//
// ▣ BREAK-TEST (fait au lot, voir le rapport) : remettre l'étalement dans le geste rend l'essai rouge à l'étape 2
//   (et 4 là où un geste écrit en place) — les essais des grilles ont été écrits et vus rouges AVANT la correction.
//
// Données FICTIVES. ⚠ Chromium (`playwright.chromium.config.js`) n'est pas Safari : un vert ici est un indice.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');

const ID_DEPART = 'ECHELLE_IDME_DEPART';
const TEXTE_COPIE = 'Texte réécrit dans la copie seulement.';

const GRILLE = {
    id: 'GRILLE_SRC_1298',
    nom: 'Grille fictive à dupliquer',
    type: 'holistique',
    criteres: [
        {
            id: 'CR_A_1298', nom: 'Pertinence fictive', type: 'holistique', ponderation: 50,
            descripteurs: { echelleId: ID_DEPART, parNiveau: { D: 'Situe l’œuvre fictive dans son contexte, sans encore la nuancer.' } },
            sousCriteres: [{ code: '1', nom: 'Sous-critère fictif' }]
        },
        { id: 'CR_B_1298', nom: 'Cohérence fictive', type: 'holistique', ponderation: 50 }
    ],
    isDemo: false
};
const ECHELLE = {
    id: 'ECH_SRC_1298', nom: 'Échelle fictive à dupliquer', isDemo: false, config: { type: 'IDME' },
    niveaux: [
        { code: 'I', nom: 'Insuffisant fictif', min: 0, max: 59 }, { code: 'D', nom: 'Développement fictif', min: 60, max: 74 },
        { code: 'M', nom: 'Maîtrisé fictif', min: 75, max: 84 }, { code: 'E', nom: 'Étendu fictif', min: 85, max: 100 }
    ]
};
const CARTOUCHE = {
    id: 'CART_SRC_1298', nom: 'Cartouche fictive à dupliquer', grilleId: GRILLE.id, isDemo: false,
    criteres: [{ id: 'CR_A_1298', nom: 'Pertinence fictive' }, { id: 'CR_B_1298', nom: 'Cohérence fictive' }],
    niveaux: [{ code: 'D', nom: 'Développement' }, { code: 'M', nom: 'Maîtrisé' }],
    commentaires: { CR_A_1298_D: 'Commentaire fictif de la source.' }
};
const PRODUCTION = {
    id: 'PROD_SRC_1298', titre: 'Production fictive à dupliquer', type: 'examen', grilleId: GRILLE.id, ponderation: 20, isDemo: false,
    echeancesParGroupe: { '00001': { date: '2032-10-01' } }, titresBlocs: { tache: 'Bloc fictif' },
    champsPersonnalises: [{ id: 'CHAMP_1298', titre: 'Champ fictif', texte: 'Texte fictif' }]
};

/**
 * Chaque famille : sa collection, sa source, le nom de sa copie, le chemin du texte que l'essai réécrit dans la
 * copie (et la case de l'éditeur qui l'écrit), l'éditeur qui l'ouvre. `texte: null` : pas de case qui écrive DANS un
 * sous-objet (voir l'en-tête).
 */
const FAMILLES = {
    grille: {
        cle: 'grillesTemplates', source: GRILLE, nomCopie: GRILLE.nom + ' (copie)', section: 'grille-criteres',
        ouvrir: 'chargerGrillePourModif', bouton: '#btnDupliquerGrille', bibliotheque: 'dupliquerGrilleBibliotheque',
        texte: ['criteres', 0, 'descripteurs', 'parNiveau', 'D'],
        caseTexte: (id) => `#listeCriteres textarea[data-on-change="modifierDescripteurNiveauHandler"][data-grille-id="${id}"][data-critere-index="0"][data-niveau="D"]`
    },
    echelle: {
        cle: 'echellesTemplates', source: ECHELLE, nomCopie: ECHELLE.nom + ' (copie)', section: 'echelle-performance',
        ouvrir: 'chargerEchellePourModif', bouton: '#btnDupliquerEchelle', bibliotheque: 'dupliquerEchelleBibliotheque',
        texte: ['niveaux', 1, 'nom'],
        caseTexte: (id) => `[data-on-change="modifierNiveauEchelleHandler"][data-echelle-id="${id}"][data-niveau-index="1"][data-champ="nom"]`
    },
    cartouche: {
        cle: `cartouches_${GRILLE.id}`, source: CARTOUCHE, nomCopie: CARTOUCHE.nom + ' (copie)', section: 'retroactions',
        ouvrir: 'chargerCartouchePourModif', bouton: '#btnDupliquerCartouche', bibliotheque: 'dupliquerCartoucheBibliotheque',
        texte: ['commentaires', 'CR_A_1298_D'],
        caseTexte: () => '#comm_CR_A_1298_D'
    },
    production: {
        cle: 'productions', source: PRODUCTION, nomCopie: PRODUCTION.titre + ' (copie)', section: 'productions',
        ouvrir: 'chargerProductionPourModif', bouton: '#btnDupliquerProduction', bibliotheque: 'dupliquerProductionBibliotheque',
        texte: null, caseTexte: null
    }
};

async function ouvrirLaFamille(page, f) {
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
    await page.evaluate(async ({ grille, cleFamille, source, section }) => {
        await assurerEchelleIdmeDeDepart();
        // security-ok: banc, des données fictives dans un contexte neuf
        await db.set(cle('grillesTemplates'), [grille]);
        if (cleFamille !== 'grillesTemplates') await db.set(cle(cleFamille), [source]);   // security-ok: idem
        await db.flush();
        naviguerVers('conception', section);
    }, { grille: GRILLE, cleFamille: f.cle, source: f.source, section: f.section });
}

/** Source et copie relues par `db.get` (IndexedDB) et par `db.getSync` (le JSON du localStorage), avec leurs objets communs. */
const lire = (page, f) => page.evaluate(async ({ cleFamille, idSource, nomCopie, chemin }) => {
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
        (function chercher(v, ch, dejaVus) {
            if (!v || typeof v !== 'object' || dejaVus.has(v)) return;
            dejaVus.add(v);
            if (vus.has(v)) { chemins.push(ch || '(racine)'); return; }
            for (const k of Object.keys(v)) chercher(v[k], ch ? ch + '.' + k : k, dejaVus);
        })(b, '', new Set());
        return chemins;
    };
    const nomDe = (x) => x && (x.nom !== undefined ? x.nom : x.titre);
    const texte = (x) => (chemin && x) ? chemin.reduce((v, k) => (v == null ? v : v[k]), x) : undefined;
    const enBase = (await db.get(cle(cleFamille))) || [];
    const source = enBase.find((x) => x.id === idSource);
    // La copie, par son nom : l'application sème aussi des modèles de départ en route, à un moment qui n'est pas le geste.
    const copies = enBase.filter((x) => nomDe(x) === nomCopie);
    const copie = copies[0] || null;
    const json = db.getSync(cle(cleFamille), []) || [];
    return {
        copies: copies.length,
        idCopie: copie && copie.id,
        idsCriteresCopie: copie && Array.isArray(copie.criteres) ? copie.criteres.map((c) => c.id) : null,
        partages: copie ? objetsPartages(source, copie) : null,
        texteSource: texte(source),
        texteCopie: texte(copie),
        texteSourceJson: texte(json.find((x) => x.id === idSource)),
        texteCopieJson: texte(copie && json.find((x) => x.id === copie.id))
    };
}, { cleFamille: f.cle, idSource: f.source.id, nomCopie: f.nomCopie, chemin: f.texte });

const ouvrir = (page, f, id) => page.evaluate(async ({ fn, id, section, grilleId }) => {
    naviguerVers('conception', section);
    await window[fn](id, grilleId);
}, { fn: f.ouvrir, id, section: f.section, grilleId: GRILLE.id });

/** Le scénario commun : `dupliquer` fait le geste. */
async function scenario(page, f, dupliquer) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirLaFamille(page, f);
    const texteSource = f.texte ? f.texte.reduce((v, k) => v[k], f.source) : undefined;

    await dupliquer(page);
    await expect.poll(async () => (await lire(page, f)).copies).toBe(1);
    const apresDuplication = await lire(page, f);
    const idCopie = apresDuplication.idCopie;

    // Supposé par Cowork et gardé : la copie d'une grille ou d'une cartouche garde les identifiants de critères.
    if (f.source.criteres) expect(apresDuplication.idsCriteresCopie).toEqual(f.source.criteres.map((c) => c.id));
    // LE LIEN : aucun objet en commun, relu dans IndexedDB.
    expect(apresDuplication.partages).toEqual([]);
    expect(apresDuplication.texteCopie).toBe(texteSource);

    if (f.texte) {
        // L'EFFET : le texte réécrit dans la copie, par sa case, dans l'éditeur.
        await ouvrir(page, f, idCopie);
        const caseTexte = page.locator(f.caseTexte(idCopie));
        await expect(caseTexte).toHaveValue(texteSource);
        await caseTexte.fill(TEXTE_COPIE);
        await caseTexte.press('Tab');
        await expect.poll(async () => (await lire(page, f)).texteCopie).toBe(TEXTE_COPIE);
        const avantRechargement = await lire(page, f);
        expect(avantRechargement.texteSource).toBe(texteSource);
        expect(avantRechargement.texteSourceJson).toBe(texteSource);
        expect(avantRechargement.texteCopieJson).toBe(TEXTE_COPIE);
        expect(avantRechargement.partages).toEqual([]);
    }

    // RECHARGÉE : la source garde son texte, la copie le sien, et rien n'est partagé.
    await page.evaluate(() => db.flush());
    await page.reload();
    await attendreApplication(page);
    const apresRechargement = await lire(page, f);
    expect(apresRechargement.partages).toEqual([]);
    if (f.texte) {
        expect(apresRechargement.texteSource).toBe(texteSource);
        expect(apresRechargement.texteCopie).toBe(TEXTE_COPIE);
        expect(apresRechargement.texteSourceJson).toBe(texteSource);
        // La source, rouverte dans l'éditeur, montre son propre texte.
        await ouvrir(page, f, f.source.id);
        await expect(page.locator(f.caseTexte(f.source.id))).toHaveValue(texteSource);
    }
    expect(erreurs).toEqual([]);
}

for (const vue of [{ nom: 'paysage', width: 1180, height: 820 }, { nom: 'portrait', width: 820, height: 1180 }]) {
    for (const [nomFamille, f] of Object.entries(FAMILLES)) {
        test.describe(`#1298 · Dupliquer — la copie est à elle : ${nomFamille} (${vue.nom}, ${vue.width} × ${vue.height})`, () => {
            test.use({ viewport: { width: vue.width, height: vue.height }, hasTouch: true });

            test(`« Dupliquer » de l’éditeur (${nomFamille}) : changer la copie ne change pas la source, avant et après rechargement`, async ({ page }) => {
                await scenario(page, f, async (p) => {
                    await ouvrir(p, f, f.source.id);
                    await p.locator(f.bouton).tap();
                });
            });

            test(`« Dupliquer » de la bibliothèque (${nomFamille}) : changer la copie ne change pas la source, avant et après rechargement`, async ({ page }) => {
                await scenario(page, f, async (p) => {
                    await p.evaluate(async ({ fn, id, grilleId }) => { await window[fn](id, grilleId); }, { fn: f.bibliotheque, id: f.source.id, grilleId: GRILLE.id });
                });
            });
        });
    }
}
