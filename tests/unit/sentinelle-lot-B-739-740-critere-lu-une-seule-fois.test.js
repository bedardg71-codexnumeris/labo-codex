/**
 * SENTINELLE — LOT B DU CADRAGE « LES RÈGLES DU DÉPISTAGE » (16 septembre 2026) :
 * UN CRITÈRE LU UNE SEULE FOIS. Tranché par Grégoire le 16 sept., 17 h 18-17 h 21.
 *
 *   #739 — un critère saisi en POINTS est lu à sa note (22/30 → 0,73), plus au niveau
 *          déduit (« D » → 0,65) : moyennes par critère (barres), IPB, défi spécifique,
 *          directions. UNE source : `scoreCritereEvaluation`, celle des courbes (#752).
 *          Cas-témoin de la fiche : 22/30 (73 %) n'est plus un défi sous le seuil de 70.
 *   #740 — un critère réglé « Aucun » au menu SOLO sort de TOUT le dépistage : moyennes,
 *          barres, IPB, défi principal de la carte RàI, défi spécifique, cibles proposées
 *          par une intervention. Il compte dans la note (la note ne lit pas ce filtre).
 *          UN filtre : `estCritereSurveilleParDepistage` (helpers), par la liste
 *          `criteresSurveillesParDepistage` ou l'appariement `trouverCritereDepistage`.
 *
 * Banc : un élève, trois copies ; grille Structure (points, multistructurel), Rigueur
 * (multistructurel), Nuance (relationnel), Méthode (« Aucun ») ; échelle 0/40/65/75/100.
 *   Structure 22/30 « D » → 0,733 · Rigueur « M » → 0,75 · Nuance « D » → 0,65 (le seul
 *   défi attendu) · Méthode « I » → 0,40 (serait le pire défi si le filtre manquait).
 *
 * BREAK-TESTS (16 sept. 2026, journal dans le rapport de session) :
 *   M1 `scoreCritereEvaluation` → toujours le niveau : A1, A2, B1, B2, E1 rougissent ;
 *   M2 `estCritereSurveilleParDepistage` → `return true` : C1-C3, D1, F1, G1 rougissent ;
 *   M3 site par site — moyennes sur `grille.criteres` ; forces sur `grille.criteres` ;
 *      IPB sur `grille.criteres` ; défi spécifique sans la garde ; barres sur `grille.criteres`.
 *
 *   cd tests && npx vitest run unit/sentinelle-lot-B-739-740-critere-lu-une-seule-fois.test.js
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const DA = '2000001';
const SEUILS = { defiSpecifique: 0.70, progressionArtefacts: 0.10, directionRisque: 0.05,
    'idme.insuffisant': 0.64, 'idme.developpement': 0.75, 'idme.maitrise': 0.85 };
const ECHELLE = { id: 'EG', nom: 'IDME et niv 0', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0 },
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64.99, valeurCalcul: '40' },
    { code: 'D', nom: 'En développement', min: 65, max: 74.99, valeurCalcul: '65' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, valeurCalcul: '75' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: '100' }
] };
const GRILLE = { id: 'G1', nom: 'Grille banc lot B', echelleId: 'EG', criteres: [
    { id: 'c1', nom: 'Structure', type: 'analytique', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Rigueur', type: 'holistique', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c3', nom: 'Nuance', type: 'holistique', ponderation: 20, niveauSOLO: 'relationnel' },
    { id: 'c4', nom: 'Méthode', type: 'holistique', ponderation: 20, niveauSOLO: 'aucun' }
] };
const PRODUCTIONS = [{ id: 'P1', titre: 'Un' }, { id: 'P2', titre: 'Deux' }, { id: 'P3', titre: 'Trois' }];
function evaluation(id, pid, date) {
    return { id, etudiantDA: DA, productionId: pid, echelleId: 'EG', grilleId: 'G1', dateEvaluation: date, noteFinale: 72,
        retroactionFinale: 'Rétroaction de banc.', pointsAnalytiques: { c1: 22 },
        criteres: [
            { critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'D', points: 22, ponderation: 30 },
            { critereId: 'c2', critereNom: 'Rigueur', niveauSelectionne: 'M', ponderation: 30 },
            { critereId: 'c3', critereNom: 'Nuance', niveauSelectionne: 'D', ponderation: 20 },
            { critereId: 'c4', critereNom: 'Méthode', niveauSelectionne: 'I', ponderation: 20 }
        ] };
}
const EVALUATIONS = () => [evaluation('E1', 'P1', '2026-02-01'), evaluation('E2', 'P2', '2026-03-01'), evaluation('E3', 'P3', '2026-04-01')];

/** helpers + calculs dans un même window, sur les stubs du patron `monterProfil` (lot 4-B). */
function monterProfil(grille = GRILLE, evaluations = EVALUATIONS()) {
    let win = null;
    const stubs = {
        // helpers (barres) appelle `calculerMoyennesCriteres`, qui vit dans calculs : renvoi vers la VRAIE, une fois chargée.
        calculerMoyennesCriteres: (da) => win.calculerMoyennesCriteres(da),
        // helpers résout la grille par SA propre `obtenirGrilleReferenceDepistage` (préférence + grilles en base) ;
        // calculs, chargé après, lit le stub ci-dessous. Les deux mènent à la même grille.
        db: { get: async () => null, getSync: (k, d) => (k === 'test_echellesTemplates' ? [ECHELLE] : k === 'test_grillesTemplates' ? (grille ? [grille] : []) : (d !== undefined ? d : null)),
            set: async () => {}, setSync() {}, modifier: async () => undefined },
        cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? evaluations : quoi === 'productions' ? PRODUCTIONS : []),
        obtenirPreference: (k) => (k === 'grilleReferenceDepistage' && grille ? grille.id : null), obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {},
        calculerTousLesIndices: () => ({ A: 1, C: 1, P: 0.72, M: 0, E: 0 }),
        obtenirSeuil: (n) => SEUILS[n], chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (arr) => arr, estModeeLectureSeule: () => false,
        genererSeancesCompletes() {}, calculerEtSauvegarderIndicesAssiduite() {}, calculerEtStockerIndicesCP() {},
        obtenirGrilleReferenceDepistage: () => grille,
        obtenirNombreProductionsPourPatterns: () => 3, obtenirIdsProductionsEvaluables: () => PRODUCTIONS.map(p => p.id)
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    stubs.estCritereSurveilleParDepistage = win.estCritereSurveilleParDepistage;
    stubs.criteresSurveillesParDepistage = win.criteresSurveillesParDepistage;
    stubs.criteresSuiviFondations = win.criteresSuiviFondations;   // ↻ #1117, suite : la règle de l'IPB vit aussi dans helpers
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
    chargerPredicatsCopie(win);
    return win;
}

let win;
beforeAll(() => { win = monterProfil(); });

/* ------------------------------------------------------------ A · #739 — les moyennes lisent les points */
describe('A · #739 — un critère en points est lu à sa note, dans les moyennes par critère', () => {
    it('A1 · toutes les copies : Structure 22/30 vaut 0,733 — pas 0,65, la valeur de son niveau « D »', () => {
        const moy = win.calculerMoyennesCriteres(DA);
        expect(moy.structure).toBeCloseTo(22 / 30, 10);
        expect(moy.rigueur).toBeCloseTo(0.75, 10);
        expect(moy.nuance).toBeCloseTo(0.65, 10);
    });
    it('A2 · les N dernières copies : même lecture', () => {
        const moy = win.calculerMoyennesCriteresRecents(DA);
        expect(moy.structure).toBeCloseTo(22 / 30, 10);
    });
    it('A3 · un critère SANS points garde la lecture par niveau (Rigueur « M » → 0,75), et 0 point vaut 0, pas « absent »', () => {
        const evals = EVALUATIONS();
        evals.forEach(e => { e.criteres[0].points = 0; });
        const moy = monterProfil(GRILLE, evals).calculerMoyennesCriteres(DA);
        expect(moy.structure).toBe(0);
        expect(moy.rigueur).toBeCloseTo(0.75, 10);
    });
});

/* ------------------------------------------------------ B · #739 — 22/30 n'est plus un défi ; l'IPB aussi */
describe('B · #739 — le cas-témoin de la fiche : 22/30 (73 %) n\'est plus un défi sous le seuil de 70', () => {
    it('B1 · forces et défis : Nuance (0,65) est le seul défi ; Structure (0,73) est une force', () => {
        const d = win.diagnostiquerForcesChallenges(win.calculerMoyennesCriteres(DA));
        expect(d.defis.map(c => c.nom)).toEqual(['Nuance']);
        expect(d.forces.map(c => c.nom)).toEqual(['Rigueur', 'Structure']);
        expect(d.principalDefi.nom).toBe('Nuance');
    });
    it('B2 · le défi spécifique des N dernières copies est Nuance, à 0,65', () => {
        expect(win.identifierDefiSpecifique(DA)).toEqual({ defi: 'Nuance', score: expect.closeTo(0.65, 10) });
    });
    it('E1 · l\'IPB lit les points : score des fondations (0,733 × 30 + 0,75 × 30) / 60 = 0,742 — pas 0,70 —, IPB 0, aucun critère en défi', () => {
        const ipb = win.calculerIPB(DA);
        expect(ipb.scoreActuel).toBeCloseTo((22 / 30 * 30 + 0.75 * 30) / 60, 10);
        expect(ipb.ipb).toBe(0);
        expect(ipb.criteresEnDefi).toEqual([]);
    });
});

/* -------------------------------------------------- C · #740 — « Aucun » sort des moyennes et de l'IPB */
describe('C · #740 — un critère « Aucun » sort des moyennes, des barres et de l\'IPB', () => {
    it('C1 · les moyennes n\'ont pas de clé pour Méthode — ni valeur, ni null', () => {
        expect(Object.keys(win.calculerMoyennesCriteres(DA))).toEqual(['structure', 'rigueur', 'nuance']);
        expect(Object.keys(win.calculerMoyennesCriteresRecents(DA))).toEqual(['structure', 'rigueur', 'nuance']);
    });
    it('C2 · les barres du profil : trois critères, Méthode absente — et jamais une barre à 0 %', () => {
        expect(win.criteresDeLaGrillePourAffichage().map(c => c.nom)).toEqual(['Structure', 'Rigueur', 'Nuance']);
        const valeurs = win.obtenirCriteresAvecValeurs(DA);
        expect(valeurs.map(c => c.nom)).toEqual(['Structure', 'Rigueur', 'Nuance']);
        expect(valeurs[0].valeur).toBeCloseTo(22 / 30, 10);
    });
    it('C3 · l\'IPB surveille Structure et Rigueur — Méthode n\'entre nulle part, même si elle était multistructurelle par défaut', () => {
        expect(win.calculerIPB(DA).criteresMulti).toEqual(['structure', 'rigueur']);
        const grilleSansEtiquette = JSON.parse(JSON.stringify(GRILLE));
        delete grilleSansEtiquette.criteres[3].niveauSOLO;   // sans étiquette = multistructurel (#542) : surveillé
        expect(monterProfil(grilleSansEtiquette).calculerIPB(DA).criteresMulti).toEqual(['structure', 'rigueur', 'methode']);
    });
    it('C4 · le filtre est UN : la liste partagée, le prédicat, et l\'appariement d\'un critère d\'évaluation', () => {
        expect(win.criteresSurveillesParDepistage(GRILLE).map(c => c.nom)).toEqual(['Structure', 'Rigueur', 'Nuance']);
        expect(win.criteresSurveillesParDepistage(null)).toEqual([]);
        expect(win.estCritereSurveilleParDepistage({ nom: 'X' })).toBe(true);
        expect(win.estCritereSurveilleParDepistage({ nom: 'X', niveauSOLO: 'aucun' })).toBe(false);
        expect(win.trouverCritereDepistage('Méthode', GRILLE)).toBeNull();
        expect(win.trouverCritereDepistage('Structure', GRILLE).id).toBe('c1');
        expect(win.trouverCritereDepistage('Inconnu', GRILLE)).toBeNull();
    });
});

/* ---------------------------------------- D · #740 — défi principal, défi spécifique, carte RàI */
describe('D · #740 — Méthode notée I n\'est ni le défi principal, ni le défi spécifique', () => {
    it('D1 · forces et défis : même si un appelant fournit une moyenne pour Méthode, elle n\'est pas un défi', () => {
        const d = win.diagnostiquerForcesChallenges({ structure: 22 / 30, rigueur: 0.75, nuance: 0.65, methode: 0.40 });
        expect(d.defis.map(c => c.nom)).toEqual(['Nuance']);
        expect(d.principalDefi.nom).toBe('Nuance');
    });
    it('D2 · le défi spécifique : Nuance (0,65), pas Méthode (0,40) qui serait le plus faible', () => {
        expect(win.identifierDefiSpecifique(DA).defi).toBe('Nuance');
    });
    it('D3 · sans grille de référence, le défi spécifique ne peut rien exclure : tout est lu, comme avant (Méthode)', () => {
        expect(monterProfil(null).identifierDefiSpecifique(DA).defi).toBe('Méthode');
    });
    it('D4 · une grille toute « Aucun » : aucune moyenne, aucun défi, pas d\'IPB', () => {
        const toutAucun = { id: 'G0', criteres: GRILLE.criteres.map(c => Object.assign({}, c, { niveauSOLO: 'aucun' })) };
        const w = monterProfil(toutAucun);
        expect(w.calculerMoyennesCriteres(DA)).toBeNull();
        expect(w.identifierDefiSpecifique(DA)).toEqual({ defi: 'Aucun', score: null });
        expect(w.calculerIPB(DA)).toBeNull();
    });
});

/* ------------------------------------------- F · #740 — les cibles proposées par une intervention */
describe('F · #740 — le formulaire d\'intervention ne propose pas Méthode comme cible', () => {
    it('F1 · sur un brouillon, Nuance est comptée « 1/1 en défi » et pré-cochée ; Méthode et Structure ne le sont pas', () => {
        const cases = {}; const compteurs = {};
        const checkbox = (nom) => {
            compteurs[nom] = elementDom({ textContent: '' });
            const parent = elementDom(); parent.querySelector = (s) => (s === '.critere-defi-count' ? compteurs[nom] : null);
            cases[nom] = elementDom({ value: nom, checked: false, parentElement: parent });
            return cases[nom];
        };
        const container = elementDom();
        container.querySelectorAll = (s) => (s === '.critere-cible-cb' ? GRILLE.criteres.map(c => checkbox(c.nom)) : []);
        const store = storeBase(); store.test_interventions = [];
        const b = monter(store, {
            modules: [{ chemin: 'js/interventions.js', internes: ['_brouillon'] }],
            globaux: { calculerMoyennesCriteres: win.calculerMoyennesCriteres, obtenirSeuil: (n) => SEUILS[n],
                obtenirGrilleReferenceDepistage: () => GRILLE, libelleNiveauSOLO: () => '', determinerNiveauRaiPedagogique: () => ({ niveau: 1 }),
                calculerTousLesIndices: () => ({ A: 1, C: 1, P: 0.72 }), calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t },
            elements: { criteresCiblesContainer: container },
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]:checked': [elementDom({ value: DA, checked: true })] }
        });
        b.win.__audit['interventions.js']._brouillon = { id: 'BR' };
        b.win.mettreAJourCriteresCibles('BR');
        expect(Object.keys(cases).sort()).toEqual(['Méthode', 'Nuance', 'Rigueur', 'Structure']);
        expect(cases['Nuance'].checked).toBe(true);
        expect(compteurs['Nuance'].textContent).toBe('— 1/1 en défi');
        expect(cases['Méthode'].checked).toBe(false);
        expect(compteurs['Méthode'].textContent).toBe('');
        expect(cases['Structure'].checked).toBe(false);   // 22/30 = 0,73 : pas un défi (#739)
        expect(compteurs['Structure'].textContent).toBe('');
    });
    it('F2 · Méthode reste ciblable à la main : la case existe (lot 4-B), elle n\'est simplement jamais proposée', () => {
        const code = sansCommentaires(source('js/interventions.js'));
        expect(code).toContain("'<input type=\"checkbox\" class=\"critere-cible-cb\" value=\"' + echapperHtml(c.nom)");
        expect(code).not.toMatch(/niveauSOLO\s*[!=]==?\s*'aucun'/);   // aucune garde locale : le filtre vit dans helpers
    });
});

/* ------------------------------------------------------- G · la note, l'Aide, et la source unique */
describe('G · Méthode compte dans la note ; l\'Aide dit vrai ; une seule source pour chaque chiffre', () => {
    it('G1 · aucun calcul de note ne connaît le filtre du dépistage (evaluation-calcul.js, js/pratiques/)', () => {
        const fichiers = ['js/evaluation-calcul.js', ...readdirSync(path.join(RACINE, 'js/pratiques')).filter(f => f.endsWith('.js')).map(f => 'js/pratiques/' + f)];
        for (const f of fichiers) {
            const code = sansCommentaires(source(f));
            expect(code, f).not.toContain('criteresSurveillesParDepistage');
            expect(code, f).not.toContain('estCritereSurveilleParDepistage');
            expect(code, f).not.toContain('trouverCritereDepistage');
            expect(code, f).not.toMatch(/niveauSOLO\s*[!=]==?\s*'aucun'/);
        }
        // Et la note enregistrée sur la copie ne bouge pas quand le dépistage la lit.
        const evals = EVALUATIONS();
        monterProfil(GRILLE, evals).calculerMoyennesCriteres(DA);
        expect(evals.map(e => e.noteFinale)).toEqual([72, 72, 72]);
        expect(evals[0].criteres[3]).toEqual({ critereId: 'c4', critereNom: 'Méthode', niveauSelectionne: 'I', ponderation: 20 });
    });
    it('G2 · la phrase de l\'Aide sous le menu SOLO est inchangée — et maintenant vraie', () => {
        expect(source('js/accompagnement-contenu-popup.js')).toContain('le dépistage des fondations ne le surveille pas');
    });
    it('G3 · #739 — plus aucun lecteur du profil ne convertit le NIVEAU d\'un critère : tous passent par scoreCritereEvaluation', () => {
        const lecteurs = ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-sections-affichage.js', 'js/profil-etudiant-diagnostics.js',
            'js/profil-etudiant-helpers.js', 'js/graphiques-progression.js', 'js/interventions.js'];
        const surUnCritere = /convertirNiveauEnScore\([^)]*niveauSelectionne[^)]*\)/g;
        for (const f of lecteurs.slice(1)) {
            expect(sansCommentaires(source(f)), f).not.toMatch(surUnCritere);
        }
        const calculs = sansCommentaires(source('js/profil-etudiant-calculs.js'));
        // Dans calculs, UNE occurrence : le corps de `scoreCritereEvaluation` — la source.
        expect(calculs.match(surUnCritere)).toEqual(['convertirNiveauEnScore(critere.niveauSelectionne, tableConversion)']);
        expect((calculs.match(/scoreCritereEvaluation\(/g) || []).length, 'définition + moyennes + IPB + défi').toBeGreaterThanOrEqual(4);
        expect(sansCommentaires(source('js/profil-etudiant-sections-affichage.js'))).toContain('const score = scoreCritereEvaluation(c, table);');
    });
    it('G4 · #740 — le mot « aucun » comme filtre n\'est écrit qu\'une fois, dans helpers', () => {
        const filtre = /niveauSOLO\s*!==?\s*'aucun'/g;
        expect((sansCommentaires(source('js/profil-etudiant-helpers.js')).match(filtre) || []).length).toBe(1);
        for (const f of ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-sections-affichage.js', 'js/profil-etudiant-diagnostics.js', 'js/interventions.js']) {
            expect(sansCommentaires(source(f)), f).not.toMatch(filtre);
        }
    });
});
