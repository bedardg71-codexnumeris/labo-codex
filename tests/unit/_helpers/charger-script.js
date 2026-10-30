import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..', '..');

/**
 * Charge un script .js du projet (qui est une IIFE écrivant sur `window`)
 * dans un sandbox Node minimal et retourne le faux `window` peuplé.
 *
 * Pré-requis : le script ne doit pas avoir d'effet de bord top-level qui
 * réfère à un global non stubbé (db, JSZip, fetch). Les fonctions retournées
 * peuvent en référer dans leur corps : ce sera évalué à l'appel, pas au
 * chargement. Pour les tests qui appellent ces fonctions, il faut soit :
 * - rester sur des fonctions pures (cas Défense I tests B + C),
 * - soit injecter les dépendances via le paramètre `globaux`.
 *
 * @param {string} cheminRelatifProjet - ex. 'js/import-export.js'
 * @param {object} globaux - globaux additionnels (ex. { JSZip })
 * @param {object|null} fauxWindowExistant - sandbox `window` réutilisé pour
 *   enchaîner plusieurs sous-modules (refactor étape 3 productions.js, 16 mai 2026).
 *   Si fourni, les nouveaux exports y sont ajoutés au lieu de créer un sandbox vide.
 * @returns {object} un objet window-like contenant les exports
 */
/**
 * Lot E1 de l'enregistrement (27 sept. 2026) — les éditeurs de la Conception écrivent par
 * `modifierEtAnnoncer` (modes.js, enveloppe de `db.modifier` qui fait parler le témoin), et
 * l'assistant de pratique par `sauvegarderDonneesSelonMode`. Même règle que
 * `obtenirIdContexteActif` ci-dessous : un défaut fourni seulement quand le harnais n'en donne
 * pas. Il est PARESSEUX : si le vrai modes.js a été chargé dans le même window, c'est lui qui
 * répond ; sinon, délégation au `db` du harnais (même retour, même rejet). Le témoin lui-même
 * est éprouvé par sentinelle-lot-e1-modifier-et-annoncer.test.js, sur le vrai modes.js.
 */
/**
 * #1040 (11 oct. 2026) — `db.setSyncSiChange` (db.js) posé sur un faux `db` de banc qui ne l'a
 * pas, avec la même règle (JSON comparé, champs `ignorer` exclus à toute profondeur), sur SON
 * getSync/setSync. Le vrai est éprouvé par sentinelle-1040-reecritures-a-l-identique.
 * Rend le `db` reçu.
 */
export function poserSetSyncSiChange(dbHarnais) {
    if (dbHarnais && typeof dbHarnais === 'object' && typeof dbHarnais.setSyncSiChange !== 'function'
        && typeof dbHarnais.getSync === 'function' && typeof dbHarnais.setSync === 'function') {
        dbHarnais.setSyncSiChange = function (key, value, ignorer) {
            const r = (ignorer && ignorer.length) ? (k, v) => (ignorer.indexOf(k) !== -1 ? undefined : v) : undefined;
            const ABSENTE = {};
            const actuel = dbHarnais.getSync(key, ABSENTE);
            if (actuel !== ABSENTE && actuel !== value && JSON.stringify(actuel, r) === JSON.stringify(value, r)) return 'inchange';   // même référence : on écrit (db.js)
            return dbHarnais.setSync(key, value);
        };
    }
    return dbHarnais;
}

export function completerEcrivainsParDefaut(globaux, fauxWindow) {
    const dbHarnais = globaux.db;
    poserSetSyncSiChange(dbHarnais);   // #1040
    const ajouts = {};
    if (typeof globaux.modifierEtAnnoncer !== 'function') {
        ajouts.modifierEtAnnoncer = function (cle, mutateur, defaut, options) {
            if (fauxWindow && typeof fauxWindow.modifierEtAnnoncer === 'function') {
                return fauxWindow.modifierEtAnnoncer(cle, mutateur, defaut, options);
            }
            return dbHarnais.modifier(cle, mutateur, defaut === undefined ? null : defaut);
        };
    }
    // Lot E2 (28 sept. 2026) : `ecrireEtAnnoncer` (modes.js) — l'entité écrit, le témoin parle.
    if (typeof globaux.ecrireEtAnnoncer !== 'function') {
        ajouts.ecrireEtAnnoncer = function (cle, ecrire, options) {
            if (fauxWindow && typeof fauxWindow.ecrireEtAnnoncer === 'function') {
                return fauxWindow.ecrireEtAnnoncer(cle, ecrire, options);
            }
            return Promise.resolve().then(ecrire);
        };
    }
    if (typeof globaux.sauvegarderDonneesSelonMode !== 'function') {
        const cleHarnais = globaux.cle;
        ajouts.sauvegarderDonneesSelonMode = function (cleBase, donnees, options) {
            if (fauxWindow && typeof fauxWindow.sauvegarderDonneesSelonMode === 'function') {
                return fauxWindow.sauvegarderDonneesSelonMode(cleBase, donnees, options);
            }
            const cleEffective = typeof cleHarnais === 'function' ? cleHarnais(cleBase) : cleBase;
            return dbHarnais.setSync(cleEffective, donnees) !== false;
        };
    }
    return Object.keys(ajouts).length ? Object.assign({}, globaux, ajouts) : globaux;
}

/**
 * 21 oct. 2026 — `formaterNotePourcentage` / `formaterNoteNombre` (js/note-pourcentage.js) : LA façon d'afficher
 * une note (norme française, « 89,2 % »). index.html charge ce module avant tous ses lecteurs (profil, Liste, PDF
 * de l'élève, calcul, jetons…). Comme `motsNature` : fourni au harnais quand il ne le donne pas, et c'est le VRAI
 * module qui est chargé (aucune copie de la règle ici). Rend les globaux complétés.
 */
export function completerNoteParDefaut(globaux) {
    // ↻ 22 oct. 2026 (#1137) : le module affiche tout nombre ; chaque nom manquant est complété, un à un
    // (un banc qui fournit sa propre `formaterNotePourcentage` reçoit quand même `formaterNombre`).
    const winNote = {};
    new Function('window', readFileSync(path.join(racineProjet, 'js/note-pourcentage.js'), 'utf8'))(winNote);
    const ajouts = {};
    for (const nom of NOMS_NOTE_POURCENTAGE) if (typeof globaux[nom] === 'undefined') ajouts[nom] = winNote[nom];
    return Object.keys(ajouts).length ? Object.assign({}, globaux, ajouts) : globaux;
}

/**
 * #1147 (24 oct. 2026) — `MenuSelection` (js/menu-selection.js), le menu de la sélection des cinq
 * bibliothèques de la Conception, appelé par grilles, échelles, cartouches, pratiques et productions.
 * Comme `ProductionDiagnostique` : le VRAI module, fourni quand le harnais ne le donne pas, chargé une
 * fois par fenêtre, sur le `document` du harnais. Son `echapperHtml` : celui du harnais, sinon la même
 * règle que config.js (& < > " '). Rend les globaux complétés.
 */
export function completerMenuSelectionParDefaut(globaux, fauxWindow, document) {
    if (typeof globaux.MenuSelection !== 'undefined') return globaux;
    if (!fauxWindow.MenuSelection) {
        const echapper = typeof globaux.echapperHtml === 'function' ? globaux.echapperHtml
            : (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
        new Function('window', 'document', 'echapperHtml', '"use strict";\n' +
            readFileSync(path.join(racineProjet, 'js/menu-selection.js'), 'utf8'))(fauxWindow, document, echapper);
    }
    return Object.assign({}, globaux, { MenuSelection: fauxWindow.MenuSelection });
}

const NOMS_NOTE_POURCENTAGE = ['formaterNombre', 'formaterPourcentage', 'formaterNotePourcentage',
    'formaterNoteNombre', 'formaterPoints', 'ESPACE_INSECABLE'];

let poolStdDuRegistre = null;   // lot 2 des standards sans portfolio : voir chargerScript
let motsDuRegistre = null;      // lot 5 des standards sans portfolio : voir chargerScript

/**
 * Jetons par défaut (29 oct. 2026) — `configJetonsResolueDeLaPratique` et `poserJetonsRefusesSiAucunReglage`
 * (js/evaluation-jetons.js) sont lus par window.… dans le formulaire de la pratique et dans l'assistant. Comme le pool :
 * le VRAI moteur, chargé une fois dans un bac jetable, fourni quand le harnais ne le donne pas.
 */
let jetonsResolusDuMoteur = null;   // la fenêtre du moteur des jetons, chargée une fois
// Un module chargé dans un bac jetable pour un complément par défaut ne reçoit pas lui-même ces compléments (sans quoi le
// registre et le moteur des jetons se chargeraient l'un l'autre sans fin).
let chargementAuxiliaire = false;
function chargerAuxiliaire(chemin) {
    chargementAuxiliaire = true;
    try { return chargerScript(chemin, {}, {}); } finally { chargementAuxiliaire = false; }
}
export function completerJetonsResolusParDefaut(fauxWindow, cheminRelatifProjet) {
    if (chargementAuxiliaire || fauxWindow.configJetonsResolueDeLaPratique || cheminRelatifProjet.endsWith('evaluation-jetons.js')) return;
    jetonsResolusDuMoteur = jetonsResolusDuMoteur || chargerAuxiliaire('js/evaluation-jetons.js');
    // Le formulaire lit la résolution ; l'assistant pose le refus d'une pratique neuve.
    fauxWindow.configJetonsResolueDeLaPratique = jetonsResolusDuMoteur.configJetonsResolueDeLaPratique;
    fauxWindow.poserJetonsRefusesSiAucunReglage = jetonsResolusDuMoteur.poserJetonsRefusesSiAucunReglage;
}

export function chargerScript(cheminRelatifProjet, globaux = {}, fauxWindowExistant = null) {
    const chemin = path.join(racineProjet, cheminRelatifProjet);
    const code = readFileSync(chemin, 'utf8');

    const fauxWindow = fauxWindowExistant || {};

    // #414 (8 août 2026) — le portillon d'attente de la DB.
    // `db.js` est le PREMIER script chargé par index.html : quand n'importe
    // quel autre script s'exécute, `window.auDbPret` existe forcément. Sans ce
    // stub, un script qui attend la DB planterait ici pour une raison qui
    // n'existe pas dans l'application — un faux rouge.
    // Sémantique reproduite fidèlement : on enregistre le rappel, et on ne
    // l'exécute tout de suite que si le test a posé `dbReady` (rattrapage).
    // Un test qui veut déclencher la suite pose `dbReady` AVANT de charger,
    // ou fournit son propre `auDbPret` via `fauxWindowExistant`.
    if (typeof fauxWindow.auDbPret !== 'function') {
        fauxWindow.auDbPret = function (rappel) {
            if (typeof rappel !== 'function') return;
            if (typeof fauxWindow.addEventListener === 'function') {
                fauxWindow.addEventListener('db-ready', rappel);
            }
            if (fauxWindow.dbReady) {
                rappel({ detail: { rattrapage: true } });
            }
        };
    }

    // #1137 (22 oct. 2026) — `js/note-pourcentage.js`, la seule façon d'afficher un nombre, est chargé
    // par index.html avant taille-fichier.js et bareme.js, qui le lisent par `window` : le VRAI, une
    // fois par sandbox, avant eux.
    if (typeof fauxWindow.formaterNombre !== 'function') {
        new Function('window', '"use strict";\n' +
            readFileSync(path.join(racineProjet, 'js/note-pourcentage.js'), 'utf8'))(fauxWindow);
    }

    // #993 (15 oct. 2026) — `js/taille-fichier.js` est chargé par index.html avant tout module
    // qui dit une taille de fichier : le VRAI est posé ici, une fois par sandbox, quand le
    // harnais n'en fournit pas. Son `navigator` est celui de Node (base 1000), sauf si le banc
    // pose `fauxWindow.navigator`.
    if (!fauxWindow.TailleFichier) {
        new Function('window', '"use strict";\n' +
            readFileSync(path.join(racineProjet, 'js/taille-fichier.js'), 'utf8'))(fauxWindow);
    }

    // #1120 (20 oct. 2026) — même règle pour `js/bareme.js`, la lecture unique d'un barème, chargée
    // par index.html avant `export-pdf.js` qui la lit. Module pur : il ne pose que `window.bareme`.
    if (!fauxWindow.bareme) {
        new Function('window', '"use strict";\n' +
            readFileSync(path.join(racineProjet, 'js/bareme.js'), 'utf8'))(fauxWindow);
    }

    const fauxDocument = {
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        createElement: () => ({
            setAttribute: () => {},
            appendChild: () => {},
            addEventListener: () => {},
            style: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false }
        }),
        body: {
            addEventListener: () => {}, appendChild: () => {},
            // modes.js pose un attribut data-mode sur <body> au chargement
            setAttribute: () => {}, getAttribute: () => null,
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => false },
            style: {}
        },
        documentElement: { addEventListener: () => {} }
    };

    // Stubs de stockage pour les scripts qui restaurent une file d'attente
    // au top-level (ex. travaux-import.js sessionStorage). Implémentation
    // « map en mémoire » suffisante pour que les opérations passent sans
    // erreur — les tests qui veulent réellement tester du stockage doivent
    // injecter une implémentation via `globaux`.
    const fauxStorage = () => ({
        _data: {},
        getItem(k) { return this._data[k] != null ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    });

    // `Function` n'a accès qu'à ses paramètres + globaux Node : pas de leak
    // depuis le scope du test. Les `var window`/`let window` à l'intérieur
    // du script projet (s'il y en avait) écraseraient le paramètre — il
    // n'y en a pas dans nos cibles, c'est sûr.
    // Un `document` fourni dans `globaux` REMPLACE le stub par défaut
    // (sentinelle #344 : capturer le innerHTML injecté par le rendu).
    // Idem pour `localStorage` (sentinelle #374 : la migration de fusion
    // énumère les clés via key(i)/length, absents du stub par défaut).
    // #834 lot E (cadrage « Rencontres », 12 sept. 2026) — `obtenirIdContexteActif` (modes.js) a
    // remplacé l'expression `infoCours._groupeCoursId || infoCours.id || null` recopiée dans
    // dix-neuf sites (échéances, captures, exports, production diagnostique, pratiques…). Les
    // harnais qui montent ces modules SANS modes.js recevaient un ReferenceError là où, avant,
    // l'expression vivait dans le module. Même règle que `auDbPret` ci-dessus : un défaut
    // fidèle à l'application, fourni seulement quand le harnais n'en donne pas un. Il lit
    // `infoCours` par le `db` du harnais, comme la vraie fonction.
    if (typeof globaux.obtenirIdContexteActif !== 'function') {
        const dbHarnais = globaux.db;
        globaux = Object.assign({}, globaux, {
            obtenirIdContexteActif: function (infoCours) {
                const info = (infoCours === undefined)
                    ? (dbHarnais && typeof dbHarnais.getSync === 'function' ? dbHarnais.getSync('infoCours', null) : null)
                    : infoCours;
                if (!info) return null;
                return info._groupeCoursId || info.id || null;
            }
        });
    }

    // Lot E1 de l'enregistrement (27 sept. 2026) : voir `completerEcrivainsParDefaut`.
    globaux = completerEcrivainsParDefaut(globaux, fauxWindow);
    globaux = completerNoteParDefaut(globaux);   // 21 oct. 2026

    // Consigne du 12 sept. 2026 (les étiquettes) — `motsNature` / `motNature` (js/mots-nature.js) est
    // LE point unique du mot de chaque nature de cours ; le formulaire du Cadre, les cartes de
    // groupe-cours, l'orchestre, Rencontres et les infobulles l'appellent. Comme pour
    // `obtenirIdContexteActif` : fourni au harnais quand il ne le donne pas — et c'est le VRAI
    // module qui est chargé (aucune copie des mots ici), fidèle à l'ordre de chargement de
    // index.html (mots-nature.js vient juste après db.js).
    if (typeof globaux.motsNature !== 'function') {
        const winMots = {};
        // `motsNatureContexteActif` lit `contexteActifEstService` : celui du harnais quand il le donne (vivant, pas figé).
        new Function('window', 'contexteActifEstService', readFileSync(path.join(racineProjet, 'js/mots-nature.js'), 'utf8'))(winMots, globaux.contexteActifEstService);
        globaux = Object.assign({}, globaux, { motsNature: winMots.motsNature, motNature: winMots.motNature, MOTS_NATURE: winMots.MOTS_NATURE,
            // #841 / #842 (12 sept.) : les mots du contexte actif — sans `contexteActifEstService` dans le harnais, ceux d'un cours.
            motsNatureContexteActif: winMots.motsNatureContexteActif });
    }

    // #1055 (15 oct. 2026) — `ProductionDiagnostique` (js/entites/production-diagnostique.js) est lu
    // par tout site qui compile, compte ou trace des productions : un diagnostic ne s'y lit jamais
    // comme une production ordinaire. Comme `motsNature` : fourni quand le harnais ne le donne pas,
    // et c'est le VRAI module (pur, sans stockage), chargé dans la fenêtre du harnais — index.html
    // le charge avant que ces sites ne soient appelés.
    if (!fauxWindow.ProductionDiagnostique) {
        new Function('window', readFileSync(path.join(racineProjet, 'js/entites/production-diagnostique.js'), 'utf8'))(fauxWindow);
    }

    globaux = completerMenuSelectionParDefaut(globaux, fauxWindow, globaux.document || fauxDocument);   // #1147

    // Lot 2 des standards sans portfolio (29 oct. 2026) — `obtenirIdsPoolStdDuCorpus` (pratique-registre.js), le pool de la
    // note, est lu par window.… dans le dépistage, le panneau « Engagement », « ≥ Min. », l'export recherche et le PDF.
    // Comme `ProductionDiagnostique` : le VRAI registre (chargé dans un bac jetable, une fois par fichier), fourni quand le
    // harnais ne le donne pas ; un banc qui charge le registre lui-même le réécrit à l'identique.
    if (!chargementAuxiliaire && !fauxWindow.obtenirIdsPoolStdDuCorpus && !cheminRelatifProjet.endsWith('pratique-registre.js')) {
        poolStdDuRegistre = poolStdDuRegistre || chargerAuxiliaire('js/pratiques/pratique-registre.js').obtenirIdsPoolStdDuCorpus;
        fauxWindow.obtenirIdsPoolStdDuCorpus = poolStdDuRegistre;
    }
    // Lot 5 des standards sans portfolio (29 oct. 2026) — les mots de la variante (registre), lus par window.… dans l'assistant,
    // la fiche de la pratique et `obtenirTermeProduction`. Un harnais sans registre n'a pas de cours actif : la variante
    // « artefacts », les mots du VRAI registre. Un banc qui charge le registre lui-même les réécrit.
    if (!chargementAuxiliaire && !fauxWindow.motsPoolStd && !cheminRelatifProjet.endsWith('pratique-registre.js')) {
        motsDuRegistre = motsDuRegistre || chargerAuxiliaire('js/pratiques/pratique-registre.js').motsPoolStd(true);
        fauxWindow.motsPoolStd = () => motsDuRegistre;
        fauxWindow.coursActifFaitDArtefacts = () => true;
    }
    completerJetonsResolusParDefaut(fauxWindow, cheminRelatifProjet);   // jetons par défaut (29 oct. 2026)

    // #876 (15 sept. 2026) — `sessionStorage` aussi : une file d'import persistée
    // se restaure au CHARGEMENT de travaux-import.js, donc elle doit être là avant.
    const { document: documentOverride, localStorage: localStorageOverride, sessionStorage: sessionStorageOverride, ...autresGlobaux } = globaux;
    const noms = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autresGlobaux)];
    const valeurs = [fauxWindow, documentOverride || fauxDocument, console, localStorageOverride || fauxStorage(), sessionStorageOverride || fauxStorage(), ...Object.values(autresGlobaux)];

    const fn = new Function(...noms, '"use strict";\n' + code);
    fn(...valeurs);

    return fauxWindow;
}
