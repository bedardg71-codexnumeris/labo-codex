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
    genererIdUnique: () => 'id-genere'
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
