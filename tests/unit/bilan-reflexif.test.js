import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Tests de régression pour le refactoring de bilan-reflexif.js (PLAN-MOYEN-TERME
// §4.1, MODULES-MAP §2.5). Sept tests couvrant les 7 sous-modules cibles :
//   1. Création de questionnaire (core + données)
//   2. Import texte (parser)
//   3. Export texte (formateur) + roundtrip
//   4. Parcours (création d'un parcours vide)
//   5. Réflexion (création d'une auto-réflexion liée au questionnaire)
//   6. Import CSV (detecteur séparateur + parser CSV + similitude + Likert)
//   7. Rapport (agrégation Likert + cohérence résultats démo)
//
// Ces tests doivent rester verts pendant les 7 extractions. Quand un
// sous-module sera extrait, le pure correspondant pourra exposer ses
// internes directement (via son IIFE) — `__bilanReflexifInternals` sera
// alors retiré du résidu et les imports ici pointeront vers les nouveaux
// exports namespace.

let bilanData;
let internals;

beforeAll(() => {
    // Charger les données — expose `window.BILAN_REFLEXIF_DATA`.
    const winData = chargerScript('js/bilan-reflexif-data.js');
    bilanData = winData.BILAN_REFLEXIF_DATA;
    expect(bilanData).toBeDefined();

    // Charger le core — expose `window.BilanReflexifCore` (état, persistance, finders).
    const winCore = chargerScript('js/bilan-reflexif-core.js');
    const BilanReflexifCore = winCore.BilanReflexifCore;
    expect(BilanReflexifCore).toBeDefined();

    // Charger l'éditeur — expose `window.BilanReflexifEditeur`.
    const winEditeur = chargerScript('js/bilan-reflexif-editeur.js', {
        BILAN_REFLEXIF_DATA: bilanData,
        BilanReflexifCore: BilanReflexifCore
    });
    const BilanReflexifEditeur = winEditeur.BilanReflexifEditeur;
    expect(BilanReflexifEditeur).toBeDefined();

    // Charger le parcours — expose `window.BilanReflexifParcours`.
    const winParcours = chargerScript('js/bilan-reflexif-parcours.js', {
        BILAN_REFLEXIF_DATA: bilanData,
        BilanReflexifCore: BilanReflexifCore
    });
    const BilanReflexifParcours = winParcours.BilanReflexifParcours;
    expect(BilanReflexifParcours).toBeDefined();

    // Charger la réflexion — expose `window.BilanReflexifReflexion`.
    const winReflexion = chargerScript('js/bilan-reflexif-reflexion.js', {
        BILAN_REFLEXIF_DATA: bilanData,
        BilanReflexifCore: BilanReflexifCore
    });
    const BilanReflexifReflexion = winReflexion.BilanReflexifReflexion;
    expect(BilanReflexifReflexion).toBeDefined();

    // Charger le résidu avec toutes les dépendances injectées.
    // `db`, `window.cle`, etc. ne sont pas appelés pendant les tests de pures.
    const winBilan = chargerScript('js/bilan-reflexif.js', {
        BILAN_REFLEXIF_DATA: bilanData,
        BilanReflexifCore: BilanReflexifCore,
        BilanReflexifEditeur: BilanReflexifEditeur,
        BilanReflexifParcours: BilanReflexifParcours,
        BilanReflexifReflexion: BilanReflexifReflexion
    });
    internals = winBilan.__bilanReflexifInternals;
    expect(internals).toBeDefined();
});

describe('bilan-reflexif — régression refactoring 2026-mai', () => {

    // -----------------------------------------------------------------------
    // Test 1 : Création de questionnaire (bilan-reflexif-core + données)
    // -----------------------------------------------------------------------
    it('1. Création — creerQuestionnaireDemoComplet retourne la structure attendue', () => {
        const q = bilanData.creerQuestionnaireDemoComplet();

        expect(q.titre).toBe('Bilan de fin de trimestre (modèle)');
        expect(typeof q.dateCreation).toBe('string');
        expect(typeof q.dateModification).toBe('string');
        expect(Array.isArray(q.blocs)).toBe(true);
        expect(Array.isArray(q.questionsPersonnalisees)).toBe(true);
        expect(q.questionsPersonnalisees.length).toBe(0);

        // 8 blocs thématiques démo
        expect(q.blocs.length).toBe(8);

        // Bloc évaluation : 5 questions (4 Likert4 + 1 ouverte)
        const blocEval = q.blocs.find(b => b.id === 'bloc_evaluation');
        expect(blocEval).toBeDefined();
        expect(blocEval.actif).toBe(true);
        expect(blocEval.questions.length).toBe(5);
        expect(blocEval.questions[0].type).toBe('likert4');
        expect(blocEval.questions[4].type).toBe('ouvert');

        // Bloc métacognition : signal volontairement faible dans les démos
        const blocMeta = q.blocs.find(b => b.id === 'bloc_metacognition');
        expect(blocMeta).toBeDefined();
        expect(blocMeta.questions.length).toBe(3);
    });

    // -----------------------------------------------------------------------
    // Test 2 : Import texte (bilan-reflexif-import-export-texte)
    // -----------------------------------------------------------------------
    it('2. Import texte — parserQuestionnaireTexte parse le modèle généré', () => {
        const modele = internals.genererModeleTexte();
        const res = internals.parserQuestionnaireTexte(modele);

        expect(res.ok).toBe(true);
        expect(res.questionnaire).toBeDefined();
        expect(res.questionnaire.titre).toBe('Modèle');

        // Le modèle a un préambule
        expect(res.questionnaire.preambule).toContain('anonyme');

        // Le modèle a 3 sections principales : Profil, Évaluation
        // (la 3e section "Questions supplémentaires" n'existe pas dans le modèle)
        expect(res.questionnaire.blocs.length).toBeGreaterThanOrEqual(2);
        const titresSections = res.questionnaire.blocs.map(b => b.titre);
        expect(titresSections).toContain('Profil');
        expect(titresSections).toContain('Évaluation');

        // Question 1 : RADIO 3 options
        const blocProfil = res.questionnaire.blocs.find(b => b.titre === 'Profil');
        expect(blocProfil.questions[0].type).toBe('choix_unique');
        expect(blocProfil.questions[0].options.length).toBe(3);

        // Question matrix dans Évaluation avec 3 énoncés
        const blocEval = res.questionnaire.blocs.find(b => b.titre === 'Évaluation');
        const qMatrix = blocEval.questions.find(q => q.type === 'matrix');
        expect(qMatrix).toBeDefined();
        expect(qMatrix.enonces.length).toBe(3);
    });

    it('2.b Import texte vide → erreur explicite', () => {
        const res = internals.parserQuestionnaireTexte('');
        expect(res.ok).toBe(false);
        expect(Array.isArray(res.erreurs)).toBe(true);
        expect(res.erreurs[0].message).toMatch(/vide/i);
    });

    // -----------------------------------------------------------------------
    // Test 3 : Export texte (bilan-reflexif-import-export-texte)
    // -----------------------------------------------------------------------
    it('3. Export texte — formaterQuestionnaireEnTexte produit le format attendu', () => {
        const q = bilanData.creerQuestionnaireDemoComplet();
        const texte = internals.formaterQuestionnaireEnTexte(q);

        // En-tête
        expect(texte).toContain('=== BILAN RÉFLEXIF — Bilan de fin de trimestre (modèle) ===');

        // Sections
        expect(texte).toContain('SECTION : Système d’évaluation');
        expect(texte).toContain('SECTION : Approche pédagogique');

        // Les questions Likert4 produisent les 4 options a-d
        expect(texte).toContain('a. Tout à fait d’accord');
        expect(texte).toContain('b. Plutôt d’accord');
        expect(texte).toContain('c. Plutôt en désaccord');
        expect(texte).toContain('d. Pas du tout d’accord');

        // Question ouverte → balise [OUVERT]
        expect(texte).toContain('[OUVERT]');
    });

    it('3.b Roundtrip — parser ∘ formater préserve la structure du questionnaire démo', () => {
        const original = bilanData.creerQuestionnaireDemoComplet();
        const texte = internals.formaterQuestionnaireEnTexte(original);
        const res = internals.parserQuestionnaireTexte(texte);

        expect(res.ok).toBe(true);

        // Nombre de blocs actifs preservé
        const blocsActifs = original.blocs.filter(b => b.actif);
        expect(res.questionnaire.blocs.length).toBe(blocsActifs.length);

        // Premier bloc : titre + nb questions identiques
        expect(res.questionnaire.blocs[0].titre).toBe(blocsActifs[0].titre);
        expect(res.questionnaire.blocs[0].questions.length).toBe(blocsActifs[0].questions.length);

        // Types des questions du premier bloc préservés
        const typesOriginal = blocsActifs[0].questions.map(q => q.type);
        const typesParse = res.questionnaire.blocs[0].questions.map(q => q.type);
        expect(typesParse).toEqual(typesOriginal);
    });

    // -----------------------------------------------------------------------
    // Test 4 : Parcours (bilan-reflexif-parcours)
    // -----------------------------------------------------------------------
    it('4. Parcours — creerParcoursVide retourne la structure attendue', () => {
        const p = bilanData.creerParcoursVide();

        expect(typeof p.id).toBe('string');
        expect(p.id.startsWith('parcours_')).toBe(true);

        expect(Array.isArray(p.activites)).toBe(true);
        expect(p.activites.length).toBe(0);

        expect(Array.isArray(p.emotionsDisponibles)).toBe(true);
        expect(p.emotionsDisponibles.length).toBe(bilanData.EMOTIONS_PAR_DEFAUT.length);
        expect(p.emotionsDisponibles).toContain('Fierté');

        expect(Array.isArray(p.questionsParActivite)).toBe(true);
        expect(p.questionsParActivite.length).toBe(bilanData.QUESTIONS_PAR_ACTIVITE_DEFAUT.length);

        // questionsTransversales : 4 toggles à true
        expect(p.questionsTransversales).toEqual({
            momentPivot: true,
            changementVision: true,
            coursManques: true,
            conseilFuturs: true
        });

        // Deep-clone : modifier p ne doit pas affecter une seconde création
        p.activites.push({ id: 'act1' });
        const p2 = bilanData.creerParcoursVide();
        expect(p2.activites.length).toBe(0);
    });

    // -----------------------------------------------------------------------
    // Test 5 : Réflexion (bilan-reflexif-reflexion)
    // -----------------------------------------------------------------------
    it('5. Réflexion — creerAutoReflexionVide bâtit blocA/B/C cohérents avec le questionnaire', () => {
        const q = bilanData.creerQuestionnaireDemoComplet();
        const p = bilanData.creerParcoursVide();
        const r = bilanData.creerAutoReflexionVide(q, p);

        expect(r.etat).toBe('avant_resultats');
        expect(typeof r.dateCreation).toBe('string');

        // Bloc A : une question miroir par bloc Likert actif (8)
        expect(r.blocA.actif).toBe(true);
        const blocsActifs = q.blocs.filter(b => b.actif);
        expect(r.blocA.questions.length).toBe(blocsActifs.length);

        // Chaque question miroir a un avant/après initialisé à null
        for (const qmiroir of r.blocA.questions) {
            expect(qmiroir.reponses).toEqual({ avant: null, apres: null });
            expect(qmiroir.type).toBe('likert4');
        }

        // Premier miroir : référence vers le premier bloc Likert
        expect(r.blocA.questions[0].blocLikertSource).toBe(blocsActifs[0].id);

        // Bloc B : questions par défaut sur le parcours
        expect(r.blocB.actif).toBe(true);
        expect(Array.isArray(r.blocB.questionsParDefaut)).toBe(true);
        expect(r.blocB.questionsParDefaut.length).toBeGreaterThan(0);
        expect(r.blocB.reponses).toEqual({});

        // Bloc C : synthèses avec avant/après initialisés à ''
        expect(r.blocC.actif).toBe(true);
        expect(r.blocC.questions.length).toBeGreaterThan(0);
        for (const qsyn of r.blocC.questions) {
            expect(qsyn.reponses).toEqual({ avant: '', apres: '' });
        }
    });

    // -----------------------------------------------------------------------
    // Test 6 : Import CSV — helpers purs (bilan-reflexif-csv)
    // -----------------------------------------------------------------------
    it('6. CSV — détection séparateur, parsing, similitude, conversion Likert', () => {
        // (a) Détecteur de séparateur
        expect(internals.detecterSeparateur('a,b,c\n1,2,3')).toBe(',');
        expect(internals.detecterSeparateur('a;b;c\n1;2;3')).toBe(';');
        expect(internals.detecterSeparateur('a\tb\tc\n1\t2\t3')).toBe('\t');

        // (b) Parser CSV avec virgule imbriquée entre guillemets
        const lignes = internals.parserCSV('a,b,c\n"hello, world",x,3\n', ',');
        expect(lignes).toEqual([
            ['a', 'b', 'c'],
            ['hello, world', 'x', '3']
        ]);

        // (c) Guillemets échappés ("" → ")
        const escaped = internals.parserCSV('"a""b",c\n', ',');
        expect(escaped).toEqual([['a"b', 'c']]);

        // (d) Similitude texte — Jaccard sur mots normalisés
        const score = internals.similitudeTexte(
            'Le système d’évaluation me permet de me situer dans mon apprentissage.',
            'Le système d\'évaluation permet aux étudiants de se situer dans leur apprentissage.'
        );
        expect(score).toBeGreaterThan(0.3);

        const scoreZero = internals.similitudeTexte('Aucun rapport.', 'Texte sans aucune correspondance.');
        expect(scoreZero).toBeLessThan(0.3);

        // (e) Conversion Likert : FR, EN, numérique, fallback
        expect(internals.convertirLikert('Tout à fait d’accord')).toBe(4);
        expect(internals.convertirLikert('Plutôt d’accord')).toBe(3);
        expect(internals.convertirLikert('Plutôt en désaccord')).toBe(2);
        expect(internals.convertirLikert('Pas du tout d’accord')).toBe(1);
        expect(internals.convertirLikert('strongly agree')).toBe(4);
        expect(internals.convertirLikert('agree')).toBe(3);
        expect(internals.convertirLikert('disagree')).toBe(2);
        expect(internals.convertirLikert('strongly disagree')).toBe(1);
        expect(internals.convertirLikert('4')).toBe(4);
        expect(internals.convertirLikert('  PLUTÔT D’ACCORD  ')).toBe(3); // trim + lowercase
        expect(internals.convertirLikert('texte non reconnu')).toBe(0);
        expect(internals.convertirLikert('')).toBe(0);
    });

    // -----------------------------------------------------------------------
    // Test 7 : Rapport — agrégation Likert + cohérence résultats démo
    // -----------------------------------------------------------------------
    it('7. Rapport — _agregerQuestion produit la distribution Likert attendue', () => {
        const question = {
            id: 'q_test',
            type: 'likert4',
            texte: 'Question test'
        };
        const cols = [{ indexColonne: 0, role: 'principal' }];
        const donnees = [
            ['Tout à fait d’accord'],
            ['Tout à fait d’accord'],
            ['Plutôt d’accord'],
            ['Plutôt en désaccord'],
            ['Pas du tout d’accord']
        ];

        const r = internals._agregerQuestion(question, cols, donnees);

        expect(r.type).toBe('likert4');
        expect(r.nbReponses).toBe(5);
        expect(r.distribution['Tout à fait d’accord']).toBe(2);
        expect(r.distribution['Plutôt d’accord']).toBe(1);
        expect(r.distribution['Plutôt en désaccord']).toBe(1);
        expect(r.distribution['Pas du tout d’accord']).toBe(1);

        // scoreMoyen = (4*2 + 3*1 + 2*1 + 1*1) / 5 = 14/5 = 2.8
        expect(r.scoreMoyen).toBe(2.8);
    });

    it('7.b Résultats démo — 30 répondants, scoreMoyen Likert calculé', () => {
        const resultats = bilanData.genererResultatsDemo();

        expect(resultats.nbRepondants).toBe(30);
        expect(resultats.questionnaireId).toBe('questionnaire_demo');

        // q_eval_01 : distribution [10, 15, 4, 1] sur 30
        const evalQ1 = resultats.reponses['q_eval_01'];
        expect(evalQ1).toBeDefined();
        expect(evalQ1.type).toBe('likert4');
        expect(evalQ1.nbReponses).toBe(30);
        // somme = 10*4 + 15*3 + 4*2 + 1*1 = 40 + 45 + 8 + 1 = 94 ; 94/30 ≈ 3.13
        expect(evalQ1.scoreMoyen).toBeCloseTo(3.13, 2);

        // Vérifier que la distribution colle aux clés label
        expect(evalQ1.distribution['Tout à fait d’accord']).toBe(10);
        expect(evalQ1.distribution['Plutôt d’accord']).toBe(15);
        expect(evalQ1.distribution['Plutôt en désaccord']).toBe(4);
        expect(evalQ1.distribution['Pas du tout d’accord']).toBe(1);

        // Question ouverte : tableau de réponses textuelles
        const evalOuvert = resultats.reponses['q_eval_ouvert'];
        expect(evalOuvert.type).toBe('ouvert');
        expect(Array.isArray(evalOuvert.reponses)).toBe(true);
        expect(evalOuvert.reponses.length).toBe(5);
    });
});
