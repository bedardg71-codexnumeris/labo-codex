// Banc du récapitulatif de l'assistant de pratique, une famille à la fois (lot/comparateur-synthese, 21 nov. 2026).
// Sert la sentinelle sentinelle-comparateur-synthese-recap.test.js : le récapitulatif rendu pour chaque cas est
// comparé, octet pour octet, à celui qu'a rendu le code d'avant l'extraction (recap-familles-avant.json).
// Noms manifestement fictifs ; des chevrons et une esperluette dans les textes de l'enseignant·e éprouvent l'échappement.

import { chargerScript } from './charger-script.js';

const E0 = { id: 'E0', nom: 'IDME <banc> & co', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', valeurCalcul: 40 }, { code: 'D', nom: 'En développement', valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', valeurCalcul: 100 }
] };
const E_SANS_SEUILS = { id: 'E1', nom: 'Échelle sans seuils', niveaux: [{ code: 'A', nom: 'A', valeurCalcul: 100 }] };
const E_DEPART = { id: 'ECH_DEPART', nom: 'Échelle de départ – Par standards', niveaux: [
    { code: '0', nom: 'Données insuffisantes', valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', valeurCalcul: 50 }, { code: '3', nom: 'Acquis', valeurCalcul: 75 },
    { code: '4', nom: 'Avancé', valeurCalcul: 100 }
] };
const G1 = { id: 'G1', nom: 'Grille <fictive> & banc' };
const COURS = [{ id: 'C-FICT', codeCours: '999-FIC-XX', nomCours: 'Cours <fictif>' }];

const CIBLES = [
    { id: 'c1', etiquette: 'Lire un récit <inventé>', poids: 2, criteres: [
        { id: 'k1', texte: 'Repère le narrateur', essentiel: true }, { id: 'k2', texte: 'Cite le texte' }] },
    { id: 'c2', etiquette: 'Rédiger & réviser', poids: 1, terminale: true, criteres: [
        { id: 'k3', texte: 'Plan clair', essentiel: true }, { id: 'k4', texte: 'Langue soignée', essentiel: true }] },
    { id: 'c3', etiquette: 'Discuter', poids: 1, criteres: [] }
];

/** Le stockage du banc : clés nues (`cle` est l'identité). */
export function magasinBanc() {
    return {
        echellesTemplates: [E0, E_SANS_SEUILS, E_DEPART],
        grillesTemplates: [G1],
        cours: COURS,
        ensemblesCibles: [{ id: 'ENSC_FICT', coursId: 'C-FICT', cibles: CIBLES }],
        pratiquesConfigurables: []
    };
}

const BASE = { nom: 'Pratique <banc> & co', auteur: 'Auteur Fictif', etablissement: 'Cégep Imaginaire', discipline: 'Lettres' };

/** Les cas : des réponses de l'assistant, et son mode (création ou modification). */
export const CAS_RECAP = {
    'som-classique': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'sommative', calcNoteFinale: 'moyenne', reglesSommatives: [] }) },
    'som-verrou': { modeEdition: true, reponses: Object.assign({}, BASE, { typePratique: 'sommative', calcNoteFinale: 'moyenne', reglesSommatives: ['double_verrou'] }) },
    'sel-meilleurs': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'standards', calcNoteFinale: 'niveaux',
        approcheEvaluation: 'par-artefacts', nbArtefactsRetenus: 5, modeSelectionPortfolio: 'n_meilleurs', echelleId: 'E0', grilleId: 'G1' }) },
    'sel-hybride-sans-grille': { modeEdition: true, reponses: Object.assign({}, BASE, { typePratique: 'standards', calcNoteFinale: 'niveaux',
        approcheEvaluation: 'par-artefacts', modeSelectionPortfolio: 'hybride', echelleId: 'E1' }) },
    'sel-approche-absente': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'standards', calcNoteFinale: 'niveaux', echelleId: 'E0' }) },
    'spe-jetons': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'specifications', calcNoteFinale: 'acceptable',
        seuilAcceptabilite: 70, utiliserJetons: true, nbJetonsDelai: 3, dureeDelaiJours: 2, nbJetonsReprise: 1, echelleId: 'E0' }) },
    'spe-sans-jetons': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'specifications', calcNoteFinale: 'acceptable',
        seuilAcceptabilite: 0, utiliserJetons: false }) },
    'den-complete': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'denotation', calcNoteFinale: 'jugement',
        ciblesDenotation: [{ id: 'd1', nom: 'Lire' }, { id: 'd2', nom: 'Écrire' }], methodeSuggestionDen: 'mediane', echelleId: 'E0', grilleId: 'G1' }) },
    'den-nue': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'denotation', calcNoteFinale: 'jugement' }) },
    'cib-complete': { modeEdition: false, reponses: Object.assign({}, BASE, { typePratique: 'cibles', calcNoteFinale: 'cibles',
        ciblesStandards: CIBLES, coursCibles: 'C-FICT', echelleId: 'ECH_DEPART', niveauSansDonnee: '0' }) },
    'cib-vide': { modeEdition: true, reponses: Object.assign({}, BASE, { typePratique: 'cibles', calcNoteFinale: 'cibles',
        ciblesStandards: [], coursCibles: '', echelleId: 'ECH_ABSENTE', niveauSansDonnee: '9' }) },
    'sans-auteur': { modeEdition: false, reponses: { typePratique: 'sommative', calcNoteFinale: 'moyenne' } }
};

/**
 * Charge l'assistant (et les vrais EnsemblesCibles) dans un bac, sur le magasin donné. Hors démo : la section
 * « Ce que ça donnerait » prend son repli, sans simulation.
 */
export function monterAssistant(magasin) {
    const db = {
        getSync: (k, def) => (Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : (def !== undefined ? def : null)),
        setSync: () => { throw new Error('le récapitulatif n\'écrit rien'); }
    };
    const globaux = {
        db,
        cle: (k) => k,
        notifications: { erreur: () => {}, succes: () => {} },
        echapperHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;'),
        formaterPourcentage: (n) => n + ' %',
        estEnModeDemo: () => false,
        normaliserIdPratique: (t) => t
        // `motsPoolStd` : le harnais (charger-script.js) pose les vrais mots du registre, variante « artefacts ».
    };
    const win = chargerScript('js/pratiques/ensembles-cibles.js', globaux);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return win;
}

/** Le récapitulatif d'un cas, rendu par l'assistant chargé. */
export function recapDuCas(win, cas) {
    win.wizardState.reponses = JSON.parse(JSON.stringify(cas.reponses));
    win.wizardState.modeEdition = cas.modeEdition;
    win.wizardState.pratiqueId = cas.modeEdition ? 'pratique_banc' : null;
    return win.genererRecapitulatif();
}
