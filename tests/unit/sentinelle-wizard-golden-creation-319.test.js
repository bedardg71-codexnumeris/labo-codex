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
    echapperHtml: (s) => String(s == null ? '' : s)
};
const win = chargerScript('js/wizard-pratique-v2.js', globaux);

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
    STD_obj: {
        id: 'fixe-STD_obj', nom: 'Golden STD-obj', auteur: '', etablissement: '', description: '', discipline: '',
        type: 'standards', variante: 'seuils-critiques', pratiques: ['STD'], dansBibliotheque: true,
        configuration: {
            approcheEvaluation: 'par-objectifs', echelleId: 'ech1', grilleId: 'gr1', varianteCalcul: 'n-meilleurs',
            objectifs: { modeCalcul: 'seuils-critiques', nbObjectifs: 5,
                seuilsCritiques: { seuilReussite: 'M', noteBaseReussite: 80, bonusParNiveau: 3.33 } }
        },
        calcul_note: { methode: 'pan_par_objectif' }
    },
    STD_art: {
        id: 'fixe-STD_art', nom: 'Golden STD-art', auteur: '', etablissement: '', description: '', discipline: '',
        type: 'standards', variante: 'n-meilleurs', pratiques: ['STD'], dansBibliotheque: true,
        configuration: {
            approcheEvaluation: 'par-artefacts', echelleId: 'ech1', grilleId: 'gr1', varianteCalcul: 'n-meilleurs',
            portfolio: { utiliser: true, nombreTotal: 12, nombreARetenir: 7, methodeSelection: 'meilleurs',
                minimumCompletion: 3, reprisesPermises: 'limite', hybride: false }
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
    STD_obj: { calcNoteFinale: 'niveaux', approcheEvaluation: 'par-objectifs', modeCalcul: 'seuils-critiques',
        nbObjectifs: 5, seuilReussite: 'M', noteBaseReussite: 80, bonusParNiveau: 3.33,
        echelleId: 'ech1', grilleId: 'gr1', nom: 'Golden STD-obj' },
    STD_art: { calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', modeSelectionPortfolio: 'n_meilleurs',
        nbArtefactsSoumis: 12, nbArtefactsRetenus: 7, minAvantCalculFormatif: 3, utiliserPortfolio: true,
        reprisesPermises: 'limite', echelleId: 'ech1', grilleId: 'gr1', nom: 'Golden STD-art' },
    SPE: { calcNoteFinale: 'acceptable', seuilAcceptabilite: 100, utiliserJetons: true,
        nbJetonsDelai: 3, dureeDelaiJours: 3, nbJetonsReprise: 2, modeleBundle: 'standard', nom: 'Golden SPE' }
};

describe('Golden master #319 — objet pratique produit (invariant Lot 1)', () => {
    for (const cas of ['SOM', 'STD_obj', 'STD_art', 'SPE']) {
        it(`parcours ${cas} — objet sauvegardé identique au golden`, async () => {
            const obj = await produire('fixe-' + cas, REPONSES[cas]);
            expect(obj).toEqual(GOLDEN[cas]);
        });
    }

    it('le type sauvegardé est canonique pour les 4 parcours (jamais pan-*)', async () => {
        for (const cas of ['SOM', 'STD_obj', 'STD_art', 'SPE']) {
            const obj = await produire('fixe-' + cas, REPONSES[cas]);
            expect(obj.type).not.toMatch(/^pan-/);
        }
    });
});

describe('#319 Lot 1 — canonicalisation du vocabulaire interne', () => {
    it('deduireTypePratique renvoie le code canonique (plus pan-*)', () => {
        expect(win.deduireTypePratique({ calcNoteFinale: 'moyenne' }).type).toBe('sommative');
        expect(win.deduireTypePratique({ calcNoteFinale: 'niveaux', approcheEvaluation: 'par-objectifs', modeCalcul: 'comptage' }).type).toBe('standards');
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

    it('DEN n\'est pas un parcours créable (pas de route)', () => {
        expect(win.obtenirEtapeSuivante('voie-rapide', { calcNoteFinale: 'denotation' })).toBeNull();
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
