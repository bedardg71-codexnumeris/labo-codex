/**
 * #1197 (3 nov. 2026) — LA CARTE RàI DU PROFIL ÉCHAPPE LE DÉFI PRINCIPAL (règle de sécurité 1).
 * Le défi principal est le NOM D'UN CRITÈRE : il peut venir d'une grille importée ou partagée.
 * `genererSectionAccompagnement` l'interpolait nu dans `innerHTML`. Le banc est celui de #553
 * (modules réels), le troisième critère porte un nom piégé et reste à I sur les quatre copies.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, clone } from './_helpers/bac-suivi.js';

const PIEGE = '<img src=x onerror=alert(1)>';

const DA_ELEVE = '2000001';
const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0, couleur: '#999999' },
    { code: 'I', nom: 'Insuffisant', min: 1, max: 64, valeurCalcul: 40, couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };
const GRILLE = { id: 'G1', nom: 'Analyse littéraire (banc)', echelleId: 'E0', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 40, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Rigueur', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c3', nom: PIEGE, ponderation: 30, niveauSOLO: 'multistructurel' }
] };
const CRITERES = GRILLE.criteres.map(c => c.nom);
const PRODUCTIONS = [
    { id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20, dateEcheance: '2026-02-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 20, dateEcheance: '2026-03-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P3', titre: 'Dissertation', type: 'travail', ponderation: 30, dateEcheance: '2026-04-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' },
    { id: 'P4', titre: 'Examen', type: 'examen', ponderation: 30, dateEcheance: '2026-05-01', echelleId: 'E0', grilleId: 'G1', coursId: 'GC1' }
];
const DATE_EVAL = { P1: '2026-02-01T12:00:00.000Z', P2: '2026-03-01T12:00:00.000Z', P3: '2026-04-01T12:00:00.000Z', P4: '2026-05-01T12:00:00.000Z' };
const DATES = ['2026-01-12', '2026-01-19', '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16'];

function ev(id, prodId, note, niveau, codes) {
    return {
        id, etudiantDA: DA_ELEVE, productionId: prodId, noteFinale: note, niveauFinal: niveau,
        echelleId: 'E0', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true, coursId: 'GC1', groupe: '01',
        dateEvaluation: DATE_EVAL[prodId], retroactionFinale: 'Rétroaction de banc.', statutIntegrite: 'recevable', statutRemise: 'evalue',
        criteres: CRITERES.map((nom, i) => ({ critereId: 'c' + (i + 1), critereNom: nom, niveauSelectionne: codes[i], ponderation: GRILLE.criteres[i].ponderation }))
    };
}

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/denotation-jugements.js',
    'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] }, 'js/profil-etudiant-actions.js',
    'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-rapport.js',
    { chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionAccompagnement', 'calculerDirectionsCriteres'] }, 'js/snapshots.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

/** Quatre copies : Structure et Rigueur en plateau (M partout), « Français écrit » de I à E — en amélioration. */
function bancProfil() {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA_ELEVE);
    store.test_groupesCours[0].pratiqueId = 'som-banc';
    store.test_pratiquesConfigurables = [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: { approcheEvaluation: 'sommative' } }];
    store.test_productions = clone(PRODUCTIONS);
    store.test_evaluationsSauvegardees = [
        ev('E1', 'P1', 65, 'D', ['M', 'M', 'I']),
        ev('E2', 'P2', 65, 'D', ['M', 'M', 'I']),
        ev('E3', 'P3', 65, 'D', ['M', 'M', 'I']),
        ev('E4', 'P4', 65, 'D', ['M', 'M', 'I'])
    ];
    store.test_echellesTemplates = [clone(E0)];
    store.test_grillesTemplates = [clone(GRILLE)];
    store.test_presences = [];
    DATES.forEach(d => { store.test_presences.push({ da: DA_ELEVE, date: d, periodesPresentes: 2, notes: '', coursId: 'GC1' }); });
    const seances = {}; DATES.forEach((d, i) => { seances[d] = [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: i + 1, jour: 'Lundi' }]; });
    store.test_seancesCompletes = seances;
    const calendrier = {}; DATES.forEach((d, i) => { calendrier[d] = { statut: 'cours', numeroSemaine: i + 1, jourSemaine: 'Lundi' }; });
    store.test_calendrierComplet = calendrier;

    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-05-15', prefs: { grilleReferenceDepistage: 'G1' },
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false, obtenirTermeProduction: (c) => (c === 'pluriel' ? 'artefacts' : 'artefact'),
            accordTermeProduction: (m, n) => (m === 'evalue' ? (n > 1 ? 'évalués' : 'évalué') : m)
        }
    });
    win = b.win;
    win.calculerEtSauvegarderIndicesAssiduite();
    win.calculerEtStockerIndicesCP();
    return b;
}

describe('#1197 — le défi principal ressort en texte dans la carte RàI', () => {
    it('le nom piégé du critère en défi est échappé, et la ligne « Défi principal » est bien rendue', () => {
        const b = bancProfil();
        const html = b.interne['profil-etudiant-sections-affichage.js'].genererSectionAccompagnement(DA_ELEVE);
        b.restaurerHorloge();
        expect(html, 'la ligne doit être rendue : sinon le banc ne prouve rien').toContain('Défi principal :</strong> &lt;img');
        expect(html).not.toContain('<img src=x');
    });
});
