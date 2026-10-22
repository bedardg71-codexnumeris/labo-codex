/**
 * SENTINELLE #553 (complément du 21 sept. 2026) — DEUX PREUVES DE COMPORTEMENT, LÀ OÙ SEUL UN VERROU SUR LE TEXTE TENAIT.
 *
 * La relecture croisée de Cowork (11 h 43) a confirmé les deux trous signalés au relais du lot : remettre le rabotage
 * `francais` (a) à la flèche de direction du profil, (b) au compte des défis du formulaire d'intervention, ne rougissait
 * que par `sentinelle-553-cle-de-critere-nom-entier` › « verrou structurel » — un motif cherché dans le texte. Une
 * mutation qui GARDE le texte permis et change le comportement (`indexOf('francais') === 0` au lieu de `startsWith`)
 * passait donc verte. Ces deux essais jouent le vrai code et lisent ce qu'il REND.
 *
 *   (a) Profil › section Accompagnement : un critère « Français écrit » en amélioration porte « → » sur SA ligne.
 *       `calculerDirectionsCriteres` indexe par le nom normalisé entier ; la ligne doit chercher la même clé.
 *   (b) Formulaire d'intervention › critères ciblés : deux critères « Français… » ont chacun LEUR compte d'élèves en défi.
 *
 * Break-tests attendus : à la flèche, `directionsCriteres[c.cleNormalisee.indexOf('francais') === 0 ? 'francais' : c.cleNormalisee]`
 * → (a) rouge, verrou vert ; au compte, `if (cleNorm.indexOf('francais') === 0) cleNorm = 'francais';` → (b) rouge, verrou vert.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, clone, elementDom } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

/* =============================================================================================
   (a) LA FLÈCHE DE DIRECTION — montage du banc du lot A (16 sept.), modules RÉELS
   ============================================================================================= */
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
    { id: 'c3', nom: 'Français écrit', ponderation: 30, niveauSOLO: 'multistructurel' }
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
        ev('E3', 'P3', 82, 'M', ['M', 'M', 'E']),
        ev('E4', 'P4', 82, 'M', ['M', 'M', 'E'])
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

/** La ligne `<li>` d'un critère dans la liste de la section rendue, sans balises. */
function ligneCritere(html, nom) {
    return tranche(html, '<li>' + nom + ' :', '</li>').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

describe('#553 · comportement (a) — la flèche de direction d\'un critère « Français… » au profil', () => {

    it('GARDE ANTI-SILENCE · le calcul des directions rend bien « → » pour « Français écrit », sous sa clé entière, et un plateau pour les autres', () => {
        const b = bancProfil();
        const directions = b.interne['profil-etudiant-sections-affichage.js'].calculerDirectionsCriteres(DA_ELEVE);
        b.restaurerHorloge();
        expect(directions.francaisecrit && directions.francaisecrit.symbole).toBe('→');
        expect(directions.structure && directions.structure.symbole).toBe('—');
        expect(directions, 'aucune clé rabotée du côté du calcul').not.toHaveProperty('francais');
    });

    it('la ligne « Français écrit » de la section rendue PORTE la flèche « → » ; « Structure », en plateau, ne la porte pas', () => {
        const b = bancProfil();
        const html = b.interne['profil-etudiant-sections-affichage.js'].genererSectionAccompagnement(DA_ELEVE);
        b.restaurerHorloge();
        const francais = ligneCritere(html, 'Français écrit');
        const structure = ligneCritere(html, 'Structure');
        expect(francais, 'la ligne doit porter un pourcentage : sinon le montage ne rend pas la liste').toMatch(/\d+\s%/);
        expect(francais.endsWith('→'), 'ligne rendue : « ' + francais + ' »').toBe(true);
        expect(structure).not.toContain('→');
        expect(structure.endsWith('—'), 'ligne rendue : « ' + structure + ' »').toBe(true);
    });
});

/* =============================================================================================
   (b) LE COMPTE DES DÉFIS DU FORMULAIRE D'INTERVENTION — js/interventions.js réel
   ============================================================================================= */
describe('#553 · comportement (b) — deux critères « Français… » ont chacun leur compte d\'élèves en défi', () => {

    // Ce que rend maintenant le producteur (prouvé dans l'autre sentinelle #553) : une clé par critère, entière.
    const MOYENNES = {
        2000001: { francaisoral: 0.10, francaisecrit: 0.20, comprehension: 0.90 },   // Alice : les deux en défi
        2000002: { francaisoral: 0.30, francaisecrit: 0.90, comprehension: 0.90 }    // Bruno : l'oral seulement
    };
    const GLOBAUX = {
        determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
        calculerMoyennesCriteres: (da) => MOYENNES[da] || null, obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '',
        obtenirSeuil: (n) => ({ defiSpecifique: 0.70 }[n] || 0.7), calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
    };

    function caseCritere(nom) {
        const compte = elementDom();
        const cb = elementDom({ value: nom });
        cb.parentElement = { querySelector: (s) => (s === '.critere-defi-count' ? compte : null) };
        return { cb, compte };
    }

    it('oral : 2/2 en défi ; écrit : 1/2 ; compréhension : aucun — trois comptes distincts, aucun partagé', () => {
        const oral = caseCritere('Français oral'), ecrit = caseCritere('Français écrit'), comp = caseCritere('Compréhension');
        const conteneur = elementDom();
        conteneur.querySelectorAll = (s) => (s === '.critere-cible-cb' ? [oral.cb, ecrit.cb, comp.cb] : []);
        const coches = ['2000001', '2000002'].map(da => elementDom({ value: da, checked: true }));
        const store = storeBase(); store.test_interventions = [];
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX,
            elements: { criteresCiblesContainer: conteneur },
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]:checked': coches } });
        b.win.mettreAJourCriteresCibles('INEXISTANTE');
        b.restaurerHorloge();

        expect(oral.compte.textContent).toBe('— 2/2 en défi');
        expect(ecrit.compte.textContent).toBe('— 1/2 en défi');
        expect(comp.compte.textContent).toBe('');
    });
});
