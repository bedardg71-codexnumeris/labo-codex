import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// GOLDEN MASTER — #319 Lot 1 (canonicalisation du vocabulaire interne du wizard).
//
// Contrat : à entrées égales, l'assistant produit le MÊME objet `pratique`
// sauvegardé avant et après la refonte. L'objet est déjà canonique à l'écriture
// (normaliserIdPratique au point de sauvegarde) — le Lot 1 retire la couche
// legacy INTERNE (deduireTypePratique renvoyait `pan-standards`, comparaisons,
// canonVersInterne), sans changer la sortie. Ce test fige cette sortie sur 4
// parcours (SOM, STD-objectifs, STD-artefacts, SPE) ; il doit rester vert
// pendant tout le Lot 1. Les golden ci-dessous ont été extraits du code
// pré-Lot-1 (objets déjà canoniques).
//
// Champ volatil `dateCreation` retiré avant comparaison ; `id` fixé via
// wizardState.pratiqueId pour neutraliser genererIdUnique.

let store = [];
const db = {
    getSync: (k, def) => {
        if (k === 'pratiquesConfigurables') return store;
        if (k === 'modalitesEvaluation') return {};
        return def !== undefined ? def : null;
    },
    setSync: (k, v) => { if (k === 'pratiquesConfigurables') store = v; }
};
// Réplique de la normalisation du registre (pratique-registre.js) : la couche
// défensive à l'écriture/lecture, CONSERVÉE par le plan.
const normMap = {
    'pan-standards': 'standards', 'pan-maitrise': 'standards',
    'pan-specifications': 'specifications', 'pan-denotation': 'denotation'
};
const globaux = {
    db, cle: (k) => k,
    notifications: { erreur: () => {}, succes: () => {} },
    normaliserIdPratique: (t) => normMap[t] || t,
    genererIdUnique: () => 'id-genere',
    // Rendu (a2) : wizardV2VoieRapide déclenche afficherEtapeWizardV2 → genererRadioCards.
    echapperHtml: (s) => String(s == null ? '' : s),
    // #898 (lot 34) : la branche d'adoption passe par la VRAIE question de pratiques-bibliotheque.js (chargé plus bas
    // dans le même sandbox). Renvoi par fermeture : un identifiant nu du wizard ne voit pas les exports d'un co-chargé.
    demanderEchelleAdoption: (...a) => win.demanderEchelleAdoption(...a),
    poserEchelleAdoption: (...a) => win.poserEchelleAdoption(...a),
    uiDialogues: { demanderChoix: async () => { throw new Error('aucune question attendue pour un modèle SPE'); } }
};
// SSOT #328 Lot 1 : le wizard écrit modalitesEvaluation via le module
// propriétaire — chargé d'abord dans le même sandbox (même db/cle mockés).
const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
chargerScript('js/wizard-pratique-v2.js', globaux, win);
chargerScript('js/pratiques-bibliotheque.js', globaux, win);

async function produire(pratiqueId, reponses) {
    store = [];
    win.wizardState.reponses = reponses;
    win.wizardState.pratiqueId = pratiqueId;
    win.wizardState.modeEdition = false;
    await win.creerPratiqueV2();
    const obj = store[0] ? { ...store[0] } : null;
    if (obj) delete obj.dateCreation;
    return obj;
}

const GOLDEN = {
    SOM: {
        id: 'fixe-SOM', nom: 'Golden SOM', auteur: '', etablissement: '', description: '', discipline: '',
        type: 'sommative', variante: 'classique', pratiques: ['SOM'], dansBibliotheque: true,
        configuration: { afficherRang: false, afficherMoyenneGroupe: true, reglesSommatives: [] },
        calcul_note: { methode: 'moyenne_ponderee' }, nbEvaluationsPrevues: 6
    },
    // #443 (10 août 2026) : le golden STD_obj est RETIRÉ AVEC la fonctionnalité.
    // Un golden décrit un parcours que l'application OFFRE ; le parcours « par
    // objectifs » n'existe plus (carte retirée du wizard, décision Grégoire).
    // ⚠ On ne l'a pas « mis à jour » sur ce que le code émet désormais : un
    // golden réaligné sur le code qu'il surveille ne surveille plus rien.
    STD_art: {
        id: 'fixe-STD_art', nom: 'Golden STD-art', auteur: '', etablissement: '', description: '', discipline: '',
        type: 'standards', variante: 'n-meilleurs', pratiques: ['STD'], dansBibliotheque: true,
        configuration: {
            approcheEvaluation: 'par-artefacts', echelleId: 'ech1', grilleId: 'gr1', varianteCalcul: 'n-meilleurs',
            portfolio: { utiliser: true, nombreTotal: 12, nombreARetenir: 7, methodeSelection: 'meilleurs',
                minimumCompletion: 3, hybride: false }
        },
        calcul_note: { methode: 'conversion_niveaux' }
    },
    SPE: {
        id: 'fixe-SPE', nom: 'Golden SPE', auteur: '', etablissement: '', description: '', discipline: '',
        type: 'specifications', variante: 'bundles', pratiques: ['SPE'], dansBibliotheque: true,
        configuration: {
            seuilAcceptabilite: 100,
            jetons: { activer: true, delai: { nombre: 3, dureeJours: 3 }, reprise: { nombre: 2 } },
            modeleBundle: 'standard'
        },
        calcul_note: { methode: 'specifications' }
    }
};

const REPONSES = {
    SOM: { calcNoteFinale: 'moyenne', reglesSommatives: [], nom: 'Golden SOM', nbEvaluationsPrevues: 6 },
    STD_art: { calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', modeSelectionPortfolio: 'n_meilleurs',
        nbArtefactsSoumis: 12, nbArtefactsRetenus: 7, minAvantCalculFormatif: 3, utiliserPortfolio: true,
        reprisesPermises: 'limite', echelleId: 'ech1', grilleId: 'gr1', nom: 'Golden STD-art' },
    SPE: { calcNoteFinale: 'acceptable', seuilAcceptabilite: 100, utiliserJetons: true,
        nbJetonsDelai: 3, dureeDelaiJours: 3, nbJetonsReprise: 2, modeleBundle: 'standard', nom: 'Golden SPE' }
};

describe('Golden master #319 — objet pratique produit (invariant Lot 1)', () => {
    for (const cas of ['SOM', 'STD_art', 'SPE']) {
        it(`parcours ${cas} — objet sauvegardé identique au golden`, async () => {
            const obj = await produire('fixe-' + cas, REPONSES[cas]);
            expect(obj).toEqual(GOLDEN[cas]);
        });
    }

    it('le type sauvegardé est canonique pour les 3 parcours (jamais pan-*)', async () => {
        for (const cas of ['SOM', 'STD_art', 'SPE']) {
            const obj = await produire('fixe-' + cas, REPONSES[cas]);
            expect(obj.type).not.toMatch(/^pan-/);
        }
    });
});

describe('#319 Lot 1 — canonicalisation du vocabulaire interne', () => {
    it('deduireTypePratique renvoie le code canonique (plus pan-*)', () => {
        expect(win.deduireTypePratique({ calcNoteFinale: 'moyenne' }).type).toBe('sommative');
        expect(win.deduireTypePratique({ calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts' }).type).toBe('standards');
        expect(win.deduireTypePratique({ calcNoteFinale: 'acceptable' }).type).toBe('specifications');
    });

    it('le source du wizard ne contient plus de chaînes legacy pan-standards / pan-specifications', () => {
        const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
        expect(src).not.toMatch(/'pan-standards'/);
        expect(src).not.toMatch(/'pan-specifications'/);
    });

    it('l\'étape morte mode-configuration est purgée (plus de champ modeConfig)', () => {
        const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
        expect(src).not.toMatch(/'mode-configuration'/);
        expect(src).not.toMatch(/modeConfig/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// #319 Lot 2 (a7) — Écran d'entrée à deux portes + adoption d'un modèle par CLONE.
// La reconstruction depuis les réponses PERDRAIT la config des gabarits (SPE :
// forfaits/typesTravaux). L'adoption clone donc le gabarit intégral.
// ─────────────────────────────────────────────────────────────────────────────

const GABARIT_SPE = {
    id: 'SPE-chimie-contrats', nom: 'Modèle Chimie', description: 'Notation par contrats',
    type: 'specifications', auteur: 'Gabarit Labo Codex', discipline: 'Chimie', estGabarit: true,
    pratiques: ['SPE'],
    configuration: {
        seuilAcceptable: 75,
        typesTravaux: [ { id: 1, nom: 'Prise de position' }, { id: 2, nom: 'Test' } ],
        forfaits: [ { id: 1, lettre: 'A', note: 90, travaux: { 1: 3, 2: 2 } } ]
    }
};

function adopter(pratiqueId, extra = {}) {
    return produire(pratiqueId, {
        _modeleAdopte: true,
        _gabaritSource: JSON.parse(JSON.stringify(GABARIT_SPE)),
        nom: 'Ma copie chimie', prenom: 'Greg', nomAuteur: 'L',
        ...extra
    });
}

describe('#319 Lot 2 (a7) — adoption d\'un modèle = clone fidèle', () => {
    it('préserve la configuration intégrale du gabarit (forfaits/typesTravaux)', async () => {
        const obj = await adopter('fixe-clone');
        expect(obj.configuration).toEqual(GABARIT_SPE.configuration);
        expect(obj.type).toBe('specifications');
        expect(obj.pratiques).toEqual(['SPE']);
    });

    it('attribue un nouvel id, le nom/auteur du récap, et entre en bibliothèque', async () => {
        const obj = await adopter('fixe-clone-2');
        expect(obj.id).toBe('fixe-clone-2'); // pratiqueId fixé par produire (sinon genererIdUnique)
        expect(obj.nom).toBe('Ma copie chimie');
        expect(obj.auteur).toBe('Greg L');
        expect(obj.dansBibliotheque).toBe(true);
    });

    it('le clone n\'est plus marqué comme gabarit/seed', async () => {
        const obj = await adopter('fixe-clone-3');
        expect(obj.estGabarit).toBeUndefined();
        expect(obj.dateAjoutBiblio).toBeUndefined();
    });

    it('conserve la discipline du gabarit si le récap ne la fournit pas', async () => {
        const obj = await adopter('fixe-clone-4');
        expect(obj.discipline).toBe('Chimie');
    });

    it('le clone n\'aliase pas le gabarit source (copie profonde)', async () => {
        const source = JSON.parse(JSON.stringify(GABARIT_SPE));
        const obj = await produire('fixe-clone-5', {
            _modeleAdopte: true, _gabaritSource: source, nom: 'X', prenom: 'A', nomAuteur: 'B'
        });
        obj.configuration.forfaits[0].note = 0; // mutation du clone
        expect(source.configuration.forfaits[0].note).toBe(90); // source intacte
    });
});

describe('#319 Lot 2 (a7) — navigation des deux portes', () => {
    it('porte « modèle » → choix-modele → récapitulatif', () => {
        expect(win.obtenirEtapeSuivante('entree-pratique', { porteEntree: 'modele' })).toBe('choix-modele');
        expect(win.obtenirEtapeSuivante('choix-modele', {})).toBe('recapitulatif');
    });

    it('porte « décrire » → calcul-note-finale', () => {
        expect(win.obtenirEtapeSuivante('entree-pratique', { porteEntree: 'decrire' })).toBe('calcul-note-finale');
    });

    it('compteur d\'étapes de la porte « modèle » = 3 (entrée → choix → récap)', () => {
        win.wizardState.reponses = { porteEntree: 'modele' };
        win.wizardState.etapeInitiale = 'entree-pratique';
        expect(win.calculerNbEtapes()).toBe(3);
    });
});

describe('#319 Lot 2 (a2) — voie rapide', () => {
    it('route directement vers la branche de configuration selon la famille', () => {
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'moyenne' })).toBe('regles-sommative');
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'niveaux' })).toBe('approche-evaluation');
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'acceptable' })).toBe('nb-evaluations');
    });

    it('DEN est un parcours créable depuis la voie rapide (#318, 1.21.0)', () => {
        // Mise à jour #343 : DEN est devenue une famille de 1er rang. La valeur du champ
        // est 'jugement' (pas 'denotation'), routée vers la configuration DEN.
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'jugement' })).toBe('config-denotation');
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'inconnu' })).toBeNull();
    });

    it('#343-T4b — compteur jamais « numéro > total » sur le chemin DEN (voie-rapide hors-graphe)', () => {
        // Repro de la divergence : on est sur config-denotation atteinte via voie-rapide
        // (historique = [entrée, voie-rapide] → numéro 3), mais la projection depuis
        // etapeInitiale re-marche la branche calcul-note-finale ; si elle s'arrête plus tôt,
        // l'ancien total tombait à 2 (« 3/2 »). Le total corrigé doit rester ≥ au numéro.
        win.wizardState.etapeInitiale = 'entree-pratique';
        win.wizardState.etapeActuelle = 'config-denotation';
        win.wizardState.historique = ['entree-pratique', 'voie-rapide'];
        win.wizardState.reponses = { porteEntree: 'decrire' }; // calcNoteFinale absent → projection courte
        // Ancien bug : calculerNbEtapes (projection depuis etapeInitiale) tombait à 2,
        // tandis que le numéro courant valait 3 → « 3 sur 2 ». calculerProgression borne
        // le total au numéro courant.
        expect(win.calculerNbEtapes()).toBeLessThan(3); // la projection seule diverge encore
        const { numActuel, numTotal } = win.calculerProgression();
        expect(numActuel).toBe(3);
        expect(numTotal).toBeGreaterThanOrEqual(numActuel); // invariant : jamais « 3/2 »
        // Nettoyage de l'état partagé pour ne pas contaminer les tests suivants.
        win.wizardState.etapeActuelle = undefined;
        win.wizardState.historique = [];
        win.wizardState.reponses = {};
    });

    it('wizardV2VoieRapide n\'empile pas Q1 — voie-rapide prend sa position (compteur cohérent)', () => {
        win.wizardState.historique = ['entree-pratique'];
        win.wizardState.etapeActuelle = 'calcul-note-finale';
        win.wizardV2VoieRapide();
        expect(win.wizardState.etapeActuelle).toBe('voie-rapide');
        expect(win.wizardState.historique).toEqual(['entree-pratique']);
    });

    it('le lien-action de voie rapide est câblé sous Q1 (CSP-safe, data-action)', () => {
        const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
        expect(src).toMatch(/data-action="\$\{champ\.action\}"/);
        expect(src).toMatch(/action: 'wizardV2VoieRapide'/);
    });
});

describe('#903 · cliquet d\'absence — le déclaratif des reprises a quitté l\'assistant', () => {
    // Remplace le bloc « #319 Lot 3 (a3) — reprises configurables ». Le champ était écrit
    // (configuration.reprises, portfolio.reprisesPermises) et lu par AUCUN calcul : tranché
    // par Grégoire le 17 sept. 2026, retiré le 21. Même endroit du fichier, invariant inverse.
    // La réponse `reprisesPermises` reste dans REPONSES.STD_art EXPRÈS : elle prouve qu'une
    // réponse résiduelle n'est plus écrite. Ce que garde une pratique DÉJÀ enregistrée est
    // jugé par `sentinelle-903-909-…`.
    it('le helper champsReprises n\'existe plus, et aucune étape n\'offre le champ', () => {
        expect(win.champsReprises).toBeUndefined();
        for (const etape of Object.values(win.ETAPES_WIZARD)) {
            expect((etape.champs || []).some(c => c.id === 'reprisesPermises' || c.id === 'infoReprisesPedago')).toBe(false);
        }
    });

    it('une Sommative neuve n\'écrit pas configuration.reprises, même si la réponse traîne', async () => {
        const obj = await produire('fixe-rep-som', { ...REPONSES.SOM, reprisesPermises: 'limite' });
        expect(obj.configuration.reprises).toBeUndefined();
    });

    it('un portfolio neuf n\'écrit pas reprisesPermises, même si la réponse traîne', async () => {
        const obj = await produire('fixe-rep-art', { ...REPONSES.STD_art, reprisesPermises: 'non' });
        expect(obj.configuration.reprises).toBeUndefined();
        expect('reprisesPermises' in obj.configuration.portfolio).toBe(false);
    });

    it('rouvrir une pratique ne relit plus les reprises dans les réponses', () => {
        store = [{ id: 'r1', nom: 'X', type: 'sommative', configuration: { reprises: { permises: true, mode: 'limite' } } }];
        win.wizardState.reponses = {};
        win.chargerPratiqueExistante('r1');
        expect(win.wizardState.reponses.reprisesPermises).toBeUndefined();
    });
});

describe('#443 · cliquet d\'absence — la branche « par objectifs » ne revient pas', () => {
    // Remplace le bloc « #319 Lot 3 (a4) — garde-fou nombre d'objectifs » : ce
    // garde-fou vivait dans `config-objectifs-definition`, étape retirée le
    // 10 août avec l'approche qu'elle configurait (décision Grégoire, #443).
    // Le cliquet prend sa place — même endroit du fichier, invariant inverse.
    for (const morte of ['config-objectifs-definition', 'mode-calcul-objectifs', 'config-mode-calcul']) {
        it(`l'étape ${morte} est purgée`, () => {
            expect(win.ETAPES_WIZARD[morte]).toBeUndefined();
        });
    }

    it('l\'étape « approche » n\'offre plus qu\'une carte, pré-cochée', () => {
        const champ = win.ETAPES_WIZARD['approche-evaluation'].champs.find(c => c.id === 'approcheEvaluation');
        expect(champ.options).toHaveLength(1);
        expect(champ.options[0].value).toBe('par-artefacts');
        // Pré-cochée : le collecteur lit `input:checked`, donc sans `default`
        // il faudrait cliquer une option sans alternative pour satisfaire `required`.
        expect(champ.default).toBe('par-artefacts');
    });

    it('le RENDU pré-coche vraiment la carte (pas seulement la définition)', () => {
        // Une définition qui porte `default` et un rendu qui l'ignore se
        // cassent séparément — et c'est le rendu que l'utilisateur voit.
        const champ = win.ETAPES_WIZARD['approche-evaluation'].champs.find(c => c.id === 'approcheEvaluation');
        const html = win.genererRadioCards(champ);
        expect(html).toMatch(/value="par-artefacts"[\s\S]{0,80}checked/);
    });

    it('l\'étape est CONSERVÉE, en écran d\'information (arbitrage Grégoire)', () => {
        // L'autre option était de sauter l'étape (11 → 10). Décision du 10 août :
        // la garder, pour qu'elle NOMME ce sur quoi PAN-Standards s'appuie au
        // lieu de le décider en coulisse.
        const etape = win.ETAPES_WIZARD['approche-evaluation'];
        expect(etape).toBeDefined();
        expect(etape.champs.some(c => c.type === 'info')).toBe(true);
    });

    it('le branchement Standards mène toujours au portfolio', () => {
        const apres = win.obtenirEtapeSuivante('seuils-personnels',
            { calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts' });
        expect(apres).toBe('config-portfolio');
    });
});

describe('#319 Lot 3 — a11 + purge config-reprises', () => {
    it('#903 : la carte Remplacement (a11) a quitté l\'assistant avec sa phrase', () => {
        const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
        expect(src.length).toBeGreaterThan(50000);
        expect(src).not.toMatch(/reprise sans pénalité/);
    });
    it('l\'étape morte config-reprises est purgée', () => {
        expect(win.ETAPES_WIZARD['config-reprises']).toBeUndefined();
    });
});
