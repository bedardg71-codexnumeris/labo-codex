/**
 * SENTINELLE — LE NIVEAU RàI AU CRITÈRE (décisions de Grégoire du 30 oct. 2026, lot 3 des seuils).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-30-niveau-rai-critere.md, § 1, § 2, § 3 bis.
 *
 * Le modèle a été mesuré avant d'être codé (scripts/mesures-depistage/niveau-rai-critere.mjs) : rejouer ce script sur le
 * code doit rendre, à toutes les dates, la colonne « en place » égale à la colonne « décidé, note au minimum, persistante
 * avant la note ». C'est le témoin sur le corpus. Ici, le banc verrouille chaque règle et ses bords.
 *
 *   cd tests && npx vitest run unit/sentinelle-niveau-au-critere-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { tranche } from './_helpers/tranche.js';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const DA_DU_RANG = (i) => '30000' + String(i).padStart(2, '0');

// La ligne : D, 65. `sansSuffisance` : l'échelle ne pose que la maîtrise. `sansRepere` : aucun repère.
const echelle = ({ sansSuffisance = false, sansRepere = false } = {}) => ({
    id: 'E_N', nom: 'Échelle du banc',
    ...(sansSuffisance || sansRepere ? {} : { seuilSuffisance: 'D' }), ...(sansRepere ? {} : { seuilMaitrise: 'M' }),
    niveaux: [{ code: 'I', nom: 'I', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'D', min: 65, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'M', min: 75, max: 84, valeurCalcul: 80 }, { code: 'E', nom: 'E', min: 85, max: 100, valeurCalcul: 100 }]
});
// Structure est une fondation ; Nuance, non.
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 50, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Nuance', ponderation: 50, niveauSOLO: 'relationnel' }
] };

/**
 * Un groupe : chaque élève porte `P` (la note de la pratique, 0-100), `copies` (les notes de ses copies), `structure` et
 * `nuance` (le niveau de ses critères), et au besoin `A`, `constructible`, `statut`, `caf`, `groupe`.
 * `minimum` : la pratique porte ce minimum (0 ou absent : pas de portfolio).
 */
function classe(eleves, { minimum = 0, ech = echelle(), famille = 'standards', type = 'standards', paliers = null, enPlus = [], vue = null } = {}) {
    const store = storeBase();
    if (vue === 'tous') store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: null, _groupeCoursId: 'GC1', _modeCours: true };
    store.test_echellesTemplates = [ech];
    store.test_grillesTemplates = [paliers ? { ...GRILLE, criteres: GRILLE.criteres.concat({ id: 'alg', nom: 'Français écrit', ponderation: 0, niveauSOLO: 'aucun', paliersProjection: paliers, paramsProjection: { libelleSignalement: 'À référer' } }) } : GRILLE];
    const nbCopies = Math.max(1, ...eleves.map((e) => (e.copies || []).length));
    store.test_productions = Array.from({ length: nbCopies }, (_, i) => ({ id: 'P' + i, titre: 'P' + i, type: 'artefact-portfolio', dateEcheance: '2026-08-30' }))
        .concat({ id: 'PD', titre: 'Diagnostique', type: 'artefact-portfolio', dateEcheance: '2026-08-30', diagnostique: true });
    store.test_groupeEtudiants = eleves.map((e, i) => ({ da: DA_DU_RANG(i), nom: 'Nom' + i, prenom: 'P', groupe: e.groupe || '01', coursId: 'GC1', statut: e.statut || 'actif', ...(e.caf ? { caf: e.caf } : {}) }));
    store.test_evaluationsSauvegardees = eleves.flatMap((e, i) => (e.copies || []).map((note, c) => ({
        id: `C${i}-${c}`, etudiantDA: DA_DU_RANG(i), productionId: 'P' + c, noteFinale: note, verrouillee: true, coursId: 'GC1', echelleId: ech.id, grilleId: 'G1',
        dateEvaluation: `2026-09-${String(c + 1).padStart(2, '0')}T12:00:00.000Z`, ponderationCouverte: 100,
        criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: e.structure || 'M' }, { critereId: 'c2', critereNom: 'Nuance', niveauSelectionne: e.nuance || 'M' }]
    }))).concat(enPlus);
    const indices = (da) => { const e = eleves[store.test_groupeEtudiants.findIndex((f) => f.da === da)] || {}; return { A: e.A === undefined ? 100 : e.A, C: 100, P: e.P === undefined ? 0 : e.P, noteConstructible: e.constructible !== false }; };
    const b = monter(store, {
        prefs: { grilleReferenceDepistage: 'G1' },
        modules: ['js/entites/production-diagnostique.js', 'js/entites/signalement-depistage.js', 'js/evaluation-projection.js', 'js/contexte-qualification.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js',
            { chemin: 'js/etudiants.js', internes: ['compterEvaluationsPourMinimum'] },
            { chemin: 'js/tableau-bord-apercu.js', internes: ['genererInterpretationRai', 'phraseSansRepartition', 'genererInterpretationPerformance', 'genererBarreRaI'] }],
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille }), obtenirTypePratiqueActive: () => type, calculerTousLesIndices: indices,
            obtenirConfigPratiqueActive: () => (minimum ? { portfolio: { minimumCompletion: minimum } } : {}),
            obtenirEchelleResolue: (id) => (id === ech.id ? JSON.parse(JSON.stringify(ech)) : null),
            resoudreModeleParId: (t, id) => { const l = t === 'echelle' ? [ech] : store.test_grillesTemplates; return JSON.parse(JSON.stringify(l.find((m) => m.id === id) || null)); },
            obtenirTermeProduction: () => 'artefacts', accordTermeProduction: () => 'évalués', chargerSeuilsInterpretation: () => ({}), obtenirSeuil: () => 0.7, obtenirNombreProductionsPourPatterns: () => 3 }
    });
    b.win.pluriel = (n, un, plusieurs) => (n > 1 ? plusieurs : un);
    b.win.obtenirIdsPoolStdDuCorpus = (prods) => prods.map((p) => p.id);
    const r = (i = 0) => b.win.determinerNiveauRaiPedagogique(DA_DU_RANG(i));
    return { win: b.win, store, r, n: (i = 0) => r(i).niveau, interne: b.interne['tableau-bord-apercu.js'] };
}
const seul = (eleve, opts) => classe([eleve], opts);

describe('§ 1 — la règle nue', () => {
    const { win } = seul({ P: 80, copies: [80] });
    const c = (o) => win.classerNiveauAuCritere({ note: 80, ligne: 65, persistante: false, fondationEnDifficulte: false, niveauDiagnostic: null, ...o });

    it('la ligne est stricte : à la ligne, niveau 1 ; juste sous elle, niveau 2', () => {
        expect(c({ note: 65 })).toEqual({ niveau: 1, motif: 'au-dessus-de-la-ligne' });
        expect(c({ note: 64.9 })).toEqual({ niveau: 2, motif: 'sous-la-ligne' });
    });

    it('niveau 3 : sous la ligne ET fondation. La fondation seule, au-dessus, ne fixe rien', () => {
        expect(c({ note: 64, fondationEnDifficulte: true })).toEqual({ niveau: 3, motif: 'sous-la-ligne-fondation' });
        expect(c({ note: 65, fondationEnDifficulte: true }).niveau).toBe(1);
    });

    it('« Difficulté persistante » donne le niveau 2, même au-dessus de la ligne', () => {
        expect(c({ note: 90, persistante: true })).toEqual({ niveau: 2, motif: 'persistante' });
    });

    it('§ 3 bis, 1 C : avant la note, au plus le niveau 2 par la persistante ; aucune note, aucun niveau 3 par la note', () => {
        expect(c({ note: null, persistante: true, fondationEnDifficulte: true })).toEqual({ niveau: 2, motif: 'persistante-avant-la-note' });
        expect(c({ note: null })).toEqual({ niveau: 0, motif: 'en-attente' });
    });

    it('§ 2 : le diagnostic fixe le niveau avant la note ; 3 l\'emporte sur la persistante, qui l\'emporte sur 2', () => {
        expect(c({ note: null, niveauDiagnostic: 3, persistante: true })).toEqual({ niveau: 3, motif: 'diagnostic' });
        expect(c({ note: null, niveauDiagnostic: 2 })).toEqual({ niveau: 2, motif: 'diagnostic' });
        expect(c({ note: null, niveauDiagnostic: 2, persistante: true }).motif).toBe('persistante-avant-la-note');
    });

    it('§ 2 : une note affichée, le diagnostic ne fixe plus rien', () => {
        expect(c({ note: 90, niveauDiagnostic: 3 }).niveau).toBe(1);
        expect(c({ note: 50, niveauDiagnostic: 3 }).niveau).toBe(2);
    });
});

describe('§ 1 — la ligne : le seuil que l\'enseignant·e a posé', () => {
    it('le repère de suffisance de l\'échelle : à 64, sous la ligne ; à 65, au-dessus', () => {
        expect(seul({ P: 64, copies: [70] }).n()).toBe(2);
        expect(seul({ P: 65, copies: [70] }).n()).toBe(1);
    });

    it('sans repère, 60 (RREC) ; une échelle qui ne porte que la maîtrise, 60 aussi', () => {
        for (const ech of [echelle({ sansRepere: true }), echelle({ sansSuffisance: true })]) {
            expect(seul({ P: 59, copies: [70] }, { ech }).n()).toBe(2);
            expect(seul({ P: 60, copies: [70] }, { ech }).n()).toBe(1);
            expect(seul({ P: 64, copies: [70] }, { ech }).n()).toBe(1);
        }
    });

    it('le résultat comparé est P, pas la moyenne des copies : mêmes copies, deux P, deux niveaux', () => {
        expect(seul({ P: 90, copies: [70, 70] }).n()).toBe(1);
        expect(seul({ P: 50, copies: [70, 70] }).n()).toBe(2);
    });

    it('la fondation lit la même ligne : Structure à D (65) n\'est pas en difficulté, à I (40) elle l\'est', () => {
        expect(seul({ P: 50, copies: [70], structure: 'D' }).n()).toBe(2);
        expect(seul({ P: 50, copies: [70], structure: 'I' }).n()).toBe(3);
    });

    it('seule une fondation compte : Nuance (relationnel) sous la ligne ne donne pas le niveau 3', () => {
        expect(seul({ P: 50, copies: [70], nuance: 'I' }).n()).toBe(2);
    });

    it('« Difficulté persistante » au-dessus de la ligne, par les copies : le niveau 2', () => {
        const r = seul({ P: 80, copies: [50, 50, 50] }).r();
        expect(r.pattern).toBe('Difficulté persistante');
        expect(r.niveau).toBe(2);
        expect(r.description).toContain('ses derniers résultats');
    });
});

describe('§ 3 bis — avant le minimum de la pratique', () => {
    const SOUS = { P: 40, copies: [40, 40], structure: 'I' };

    it('sous le minimum, une note sous la ligne donne au plus le niveau 2, par la persistante', () => {
        const r = seul(SOUS, { minimum: 4 }).r();
        expect(r.niveau).toBe(2);
        expect(r.pattern).toBe('Difficulté persistante');
    });

    it('au minimum exactement, le niveau 3 arrive', () => {
        expect(seul({ ...SOUS, copies: [40, 40, 40] }, { minimum: 4 }).n()).toBe(2);
        expect(seul({ ...SOUS, copies: [40, 40, 40, 40] }, { minimum: 4 }).n()).toBe(3);
    });

    it('sous le minimum, sans persistante : « En attente », pas le niveau 1', () => {
        const r = seul({ P: 80, copies: [80] }, { minimum: 4 }).r();
        expect(r.niveau).toBe(0);
        expect(r.label).toBe('En attente');
        expect(r.description).toContain('ne s\'affiche pas encore');
    });

    it('une pratique sans minimum (sommative) : la note se montre dès la première copie, même avec un portfolio résiduel', () => {
        expect(seul(SOUS, { type: 'sommative', famille: 'sommative' }).n()).toBe(3);
        expect(seul(SOUS, { type: 'sommative', famille: 'sommative', minimum: 4 }).n()).toBe(3);
    });

    it('des copies remises sans note chiffrée ne disent aucune difficulté', () => {
        expect(seul({ P: 0, copies: ['40'], constructible: false, structure: 'I', nuance: 'I' }).r()).toMatchObject({ niveau: 0, description: 'Aucune note à comparer pour l\'instant.' });
    });

    it('note non constructible : le niveau ne se fixe pas par la note, le 0 du stockage n\'est pas une note', () => {
        expect(seul({ P: 0, copies: [80], constructible: false }).r().niveau).toBe(0);
        expect(seul({ P: 0, copies: [50, 50], constructible: false, structure: 'I' }).n()).toBe(2);
    });
});

describe('§ 1 — ce qui reste, ce qui ne compte jamais', () => {
    it('« Non-participation » reste au niveau 3, même sous le minimum', () => {
        const c = classe([{ P: 80, copies: [80] }, { A: 90, copies: [] }], { minimum: 4 });
        expect(c.r(1)).toMatchObject({ niveau: 3, pattern: 'Non-participation' });
    });

    it('un élève jamais présent, sans copie, reste « En attente »', () => {
        const c = classe([{ P: 80, copies: [80] }, { A: 0, copies: [] }]);
        expect(c.r(1)).toMatchObject({ niveau: 0, pattern: 'Données insuffisantes' });
    });

    it('la « Mesure d\'aide » de la fiche ne fixe ni n\'influence aucun niveau', () => {
        for (const e of [{ P: 90, copies: [90] }, { P: 50, copies: [70] }, { P: 50, copies: [70], structure: 'I' }, { P: 80, copies: [50, 50] }]) {
            expect(seul({ ...e, caf: 'oui' }).n()).toBe(seul(e).n());
        }
        const calcul = sansCommentaires(lire('js/profil-etudiant-calculs.js'));
        expect(calcul).not.toMatch(/\.caf\b|mesureAide|Mesure d'aide/);
        expect(sansCommentaires(lire('js/entites/signalement-depistage.js'))).not.toMatch(/\.caf\b|mesureAide/);
    });

    it('le groupe ne change aucun niveau : le même élève, dans un groupe fort ou faible', () => {
        const fort = [{ P: 95, copies: [95] }, { P: 95, copies: [95] }, { P: 95, copies: [95] }, { P: 95, copies: [95] }, { P: 95, copies: [95] }];
        const faible = fort.map(() => ({ P: 40, copies: [40] }));
        expect(classe([{ P: 70, copies: [70] }, ...fort]).n()).toBe(1);
        expect(classe([{ P: 70, copies: [70] }, ...faible]).n()).toBe(1);
        expect(classe([{ P: 50, copies: [70] }, ...fort]).n()).toBe(2);
        expect(classe([{ P: 50, copies: [70] }, ...faible]).n()).toBe(2);
    });

    it('le retiré est retiré : aucune comparaison au groupe dans le code', () => {
        const calcul = sansCommentaires(lire('js/profil-etudiant-calculs.js'));
        expect(calcul).not.toMatch(/classerNiveauDansLeGroupe|ecartType|COPIES_MINIMUM_COMPARAISON|EFFECTIF_MINIMUM_GROUPE|_rangSousLeGroupe/);
    });
});

describe('§ 1 — la phrase du groupe', () => {
    const FAIBLE = [{ P: 40, copies: [40] }, { P: 50, copies: [50] }, { P: 55, copies: [55] }];

    it('moyenne des notes affichées sous la ligne : un signal, et les niveaux individuels restent', () => {
        const c = classe(FAIBLE);
        const signaux = c.win.signauxDeGroupeDepistage();
        expect(signaux).toHaveLength(1);
        expect(signaux[0].moyenne).toBeCloseTo(48.33, 1);
        expect(signaux[0].ligne).toBe(65);
        expect([c.n(0), c.n(1), c.n(2)]).toEqual([2, 2, 2]);
    });

    it('à la ligne, pas de signal ; sans aucun minimum de 5 élèves ; un seul élève suffit', () => {
        expect(classe([{ P: 65, copies: [65] }]).win.signauxDeGroupeDepistage()).toEqual([]);
        expect(classe([{ P: 64, copies: [64] }]).win.signauxDeGroupeDepistage()).toHaveLength(1);
    });

    it('seules les notes affichées y entrent : sous le minimum, pas de signal', () => {
        expect(classe(FAIBLE, { minimum: 4 }).win.signauxDeGroupeDepistage()).toEqual([]);
    });

    it('un élève exclu par statut n\'y entre pas (#745)', () => {
        const c = classe([{ P: 90, copies: [90] }, { P: 10, copies: [10], statut: 'inactif' }]);
        expect(c.win.signauxDeGroupeDepistage()).toEqual([]);
    });

    it('en mode « tous les groupes », le signal nomme le groupe en cause', () => {
        const c = classe([{ P: 90, copies: [90], groupe: '01' }, { P: 40, copies: [40], groupe: '02' }], { vue: 'tous' });
        expect(c.win.signauxDeGroupeDepistage().map((s) => s.groupe)).toEqual(['00002']);
    });

    it('la phrase dit la ligne, et les élèves en attente', () => {
        const c = classe(FAIBLE);
        const rai = [{ niveau: 1, count: 0 }, { niveau: 2, count: 3 }, { niveau: 3, count: 0 }];
        const phrase = c.interne.genererInterpretationRai(rai, 3);
        expect(phrase).toContain('sous le seuil minimal de réussite');
        expect(phrase).toContain('renforcer, pour tous');
        expect(phrase).not.toContain('en attente');
        const attente = classe([{ P: 90, copies: [90] }]).interne.genererInterpretationRai([{ niveau: 1, count: 0 }, { niveau: 2, count: 4 }, { niveau: 3, count: 0 }], 25);
        expect(attente.replace(/\s/g, ' ')).toContain('4 étudiants (16 %)');
        expect(attente).toContain('21 étudiant·es en attente de leur note provisoire');
    });
});

describe('§ 2 — le signalement diagnostique', () => {
    const PALIERS = (niveauSignalement, leveSignalement = true) => [
        { cle: 'bas', libelle: 'Bas', sansErreur: false, ratioMax: 0.5, leveSignalement, ...(niveauSignalement ? { niveauSignalement } : {}) },
        { cle: 'haut', libelle: 'Haut', sansErreur: false, ratioMax: null }
    ];
    // Une copie de la production diagnostique, sur le palier qui lève le signalement.
    const COPIE_DIAG = (da = DA_DU_RANG(0)) => ({ id: 'CD', etudiantDA: da, productionId: 'PD', noteFinale: 40, verrouillee: true, coursId: 'GC1', grilleId: 'G1', donneesAlgorithmiques: { alg: { totalErreurs: 1, mots: 10 } } });
    const diag = (eleve, niveau, opts = {}) => {
        const c = classe([eleve], { paliers: PALIERS(niveau, opts.coche !== false), enPlus: [COPIE_DIAG()], minimum: opts.minimum });
        c.win.projectionAlgo = { calculer: (critere) => ({ applicable: true, ratio: 0.1, palier: critere.paliersProjection[0], params: opts.sansPhrase ? {} : critere.paramsProjection }) };
        return c;
    };

    it('avant toute autre copie, le palier réglé fixe son niveau, 3 ou 2, et la cible suit', () => {
        for (const n of [3, 2]) {
            const c = diag({ copies: [] }, n);
            expect(c.r()).toMatchObject({ niveau: n, pattern: 'Données insuffisantes' });
            expect(c.r().description).toContain('production diagnostique');
            expect(c.win.determinerCibleIntervention(DA_DU_RANG(0))).toMatchObject({ niveau: n, cible: 'Signalement diagnostique' });
        }
    });

    it('sous le minimum, il fixe encore le niveau', () => {
        expect(diag({ P: 90, copies: [90] }, 3, { minimum: 4 }).n()).toBe(3);
    });

    it('la première note affichée prend le relais : la note décide, le signalement reste affiché', () => {
        const c = diag({ P: 90, copies: [90] }, 3);
        expect(c.n()).toBe(1);
        expect(c.win.SignalementDepistage.pourEleve(DA_DU_RANG(0), { evaluations: c.store.test_evaluationsSauvegardees, grilles: c.store.test_grillesTemplates })).toHaveLength(1);
    });

    it('aucun défaut silencieux : un palier coché sans niveau ne fixe rien', () => {
        expect(diag({ copies: [] }, null).r()).toMatchObject({ niveau: 0, label: 'En attente' });
    });

    it('un palier décoché, ou sans phrase, ne fixe rien', () => {
        expect(diag({ copies: [] }, 3, { coche: false }).n()).toBe(0);
        expect(diag({ copies: [] }, 3, { sansPhrase: true }).n()).toBe(0);
    });

    it('le format voyage : le registre garde le niveau, l\'ancien gabarit reste sans niveau, une valeur illisible ne devient rien', () => {
        const { win } = seul({ P: 90, copies: [90] });
        const niveauDe = (p) => {
            const critere = {};
            win.projectionAlgo.appliquerAuCritere(critere, win.projectionAlgo.listerModeles()[0].id, {}, [{ cle: 'a', libelle: 'A', ratioMax: 0.5, leveSignalement: true, ...p }, { cle: 'b', libelle: 'B', ratioMax: null }]);
            return critere.paliersProjection[0].niveauSignalement;
        };
        expect(niveauDe({ niveauSignalement: 3 })).toBe(3);
        expect(niveauDe({ niveauSignalement: 2 })).toBe(2);
        expect(niveauDe({})).toBe(null);
        expect(niveauDe({ niveauSignalement: 1 })).toBe(null);
        expect(niveauDe({ niveauSignalement: '3' })).toBe(null);
        expect(lire('js/import-export.js')).toMatch(/niveauSignalement: \{ type: 'numberOrNull' \}/);
        expect(lire('js/partage-schemas.js')).toMatch(/leveSignalement: \{ type: 'booleen' \},\s*niveauSignalement: \{ type: 'nombre', nullable: true, minValeur: 2, maxValeur: 3 \}/);
    });

    it('l\'éditeur : le choix n\'existe que sur un palier coché, et décocher le reprend', () => {
        const grilles = lire('js/grilles.js');
        expect(tranche(grilles, 'function _muterPalier(', '\nfunction ')).toContain('if (!paliers[index].leveSignalement) delete paliers[index].niveauSignalement;');
        expect(grilles).toMatch(/\$\{pal\.leveSignalement \? `\s*<div class="groupe-form palier-niveau-signalement">/);
        expect(grilles).toContain('data-champ="niveauSignalement"');
    });
});

describe('§ 4 — les lecteurs suivent', () => {
    it('la cible rend le palier de la carte', () => {
        for (const e of [{ P: 90, copies: [90] }, { P: 50, copies: [70] }, { P: 50, copies: [70], structure: 'I' }, { P: 80, copies: [50, 50] }]) {
            const c = seul(e);
            expect(c.win.determinerCibleIntervention(DA_DU_RANG(0)).niveau).toBe(c.n());
        }
    });

    it('la barre RàI compte tout le groupe, « En attente » compris : 4 sur 25, pas 100 %', () => {
        const c = seul({ P: 90, copies: [90] });
        const quatre = Array.from({ length: 4 }, (_, i) => ({ da: 'D' + i, nom: 'N', prenom: 'P', niveau: 2 }));
        const html = c.interne.genererBarreRaI(quatre, quatre, false, true, 0, 25, null);
        expect(html.replace(/\s/g, ' ')).toContain('4 (16');
        expect(html).not.toContain('(100');
        expect(html).toContain('21 étudiant·es en attente');
    });

    it('la barre des patterns garde son dénominateur', () => {
        expect(tranche(lire('js/tableau-bord-apercu.js'), 'function genererBarrePatterns(', '\nfunction ')).toContain('const totalSOM = etudiantsSOM.length || 1;');
    });

    it('tous les lecteurs passent par la même fonction, y compris le cache dérivé', () => {
        expect(tranche(lire('js/profil-etudiant-actions.js'), 'function calculerEtStockerPatternsGroupe(', '\nfunction ')).toContain('determinerNiveauRaiPedagogique(da)');
        expect(lire('js/etudiants.js').match(/determinerNiveauRaiPedagogique\(e\.da\)/g).length).toBeGreaterThanOrEqual(3);
        expect(lire('js/interventions.js').match(/determinerNiveauRaiPedagogique\(/g).length).toBeGreaterThanOrEqual(3);
    });

    it('une intervention enregistrée garde son niveau d\'alors : rien ne le recalcule à la relecture', () => {
        const interventions = sansCommentaires(lire('js/interventions.js'));
        expect(interventions).not.toMatch(/\.niveauRai\s*=\s*determinerNiveauRaiPedagogique/);
        expect(interventions).toContain('niveauRai: data.niveauRai || 2');
    });
});

// Textes de Cowork validés par Grégoire le 30 oct. (TEXTES-2026-10-30-aide-rai-niveau-critere.md), avec sa décision sur le niveau 1 :
// l'Aide part avec le code, et chaque phrase de règle est gardée ici, à côté du banc qui la prouve.
describe('§ 4 — l\'Aide dit le modèle tel que codé', () => {
    const html = lire('index.html');
    const net = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').replace(/ ([,.)])/g, '$1').trim();
    const carteRai = net(tranche(html, 'id="accordeon-aide-rai"', '<!-- Carte: Les patterns'));
    const cartePatterns = net(tranche(html, 'id="accordeon-aide-patterns"', '<!-- Carte: Planifier les interventions'));
    const carteSuivi = net(tranche(html, 'id="accordeon-aide-suivi-apprentissage"', '<!-- Carte: Captures de progression'));

    it('les trois niveaux, tels que le banc les rend', () => {
        expect(carteRai).toContain('Niveau 3 (Intensif) : la note du cours à ce jour (en pratique alternative de notation, la note provisoire) est sous ton seuil, et au moins un critère des fondations l\'est aussi');
        expect(carteRai).toContain('ou un signalement diagnostique que tu as réglé au niveau 3 ; ou « Non-participation ».');
        expect(carteRai).toContain('Niveau 2 (Préventif) : la note du cours à ce jour est sous ton seuil ; ou « Difficulté persistante », même si la note tient au-dessus ; ou un signalement diagnostique que tu as réglé au niveau 2.');
        expect(carteRai).toContain('Niveau 1 (Universel) : tous les autres, une fois la note du cours affichée. Avant, sans ces signaux, le niveau reste « En attente ».');
    });

    it('la ligne : le repère de suffisance, sinon la note de passage, lue à la source', () => {
        const passage = Number(lire('js/interpretation-config.js').match(/const NOTE_DE_PASSAGE = ([\d.]+);/)[1]) * 100;
        expect(carteRai).toContain(`Ce seuil est le repère « Suffisant à partir de » de l'échelle de tes copies ; si ton échelle n'en a pas, c'est la note de passage, ${passage} %.`);
    });

    it('avant le minimum, le signalement, ce qui ne fixe jamais, la phrase du groupe', () => {
        expect(carteRai).toContain('la note ne mène pas au niveau 3 : un début sous ton seuil donne au plus le niveau 2.');
        expect(carteRai).toContain('Un signalement diagnostique fixe son niveau jusqu\'à ce que la note du cours s\'affiche ; ensuite, il reste affiché à côté du niveau.');
        expect(carteRai).toContain('Ne fixent jamais le niveau : la place de l\'étudiant·e dans son groupe, l\'inscription aux services adaptés, l\'assiduité et la complétion');
        expect(carteRai).toContain('une phrase sous la barre RàI le dit pour tout le groupe. Elle n\'enlève aucun signal individuel.');
    });

    it('les deux patterns qui fixent un niveau', () => {
        expect(cartePatterns).toContain('sur les derniers artefacts ; en début de trimestre, une seule copie peut l\'allumer ;');
        expect(cartePatterns).toContain('Deux patterns fixent un niveau : « Difficulté persistante » donne au moins le niveau 2, « Non-participation » le niveau 3.');
    });

    it('l\'ancien modèle a quitté les trois cartes', () => {
        for (const carte of [carteRai, cartePatterns, carteSuivi]) {
            expect(carte).not.toMatch(/groupe-cours|écart-type|moyenne des copies/);
        }
        expect(carteSuivi).toContain('il ne fixe pas le niveau RàI (voir « La Réponse à l\'Intervention (RàI) »). Quand les deux vues divergent, c\'est un signal pour ton jugement.');
    });
});

describe('ce qui entoure le niveau (retouches du lot 2)', () => {
    it('la phrase de progression favorable ne compte que le pattern Stable', () => {
        const ech = { id: 'I', niveaux: [{ code: 'D', min: 50, max: 74 }, { code: 'M', min: 75, max: 100 }], seuilMaitrise: 'M' };
        const { interne, store } = classe([{ P: 70, copies: [70] }]);
        store.test_indicesPatternsRaI = { a: { pattern: 'Défi spécifique', niveauRai: 1 } };
        const phrase = interne.genererInterpretationPerformance([{ da: 'a', valeur: 0.6 }], ech);
        expect(phrase).not.toContain('progression favorable');
        store.test_indicesPatternsRaI = { a: { pattern: 'Stable', niveauRai: 2 } };
        expect(interne.genererInterpretationPerformance([{ da: 'a', valeur: 0.6 }], ech)).toContain('progression favorable');
    });

    it('les passages hors lot de la liste et des patterns sont encadrés', () => {
        const liste = sansCommentaires(lire('js/etudiants.js'));
        expect(liste.match(/dansUnLotDeCalculs\(\(\) =>/g)).toHaveLength(4);
        expect(tranche(lire('js/profil-etudiant-actions.js'), 'function calculerEtStockerPatternsGroupe(', '\nfunction ')).toContain('demarrerCacheLecture');
        expect(tranche(lire('js/tableau-bord-apercu.js'), 'function afficherNiveauxRaI(', '\nfunction ')).toContain('demarrerCacheLecture');
    });
});

describe('la barre P sans répartition (retouche du lot 1, constat 1)', () => {
    it('deux cas, deux phrases : personne n\'a de note, ou pas d\'échelle unique', () => {
        const { interne } = classe([{ P: 70, copies: [70] }]);
        expect(interne.phraseSansRepartition(4, 4)).toContain('ne se construit pas encore');
        const divergentes = interne.phraseSansRepartition(0, 4, 'echelles-divergentes');
        expect(divergentes).toContain('pas d\'échelle unique');
        expect(divergentes).not.toContain('ne se construit pas encore');
        // Retouche 2 (constat 5) : une copie en points n'est pas une divergence à réparer.
        const enPoints = interne.phraseSansRepartition(0, 4, 'aucune-copie');
        expect(enPoints).toContain('notées sans échelle');
        expect(enPoints).not.toContain('pas d\'échelle unique');
        expect(interne.phraseSansRepartition(1, 4, 'aucune-copie')).toContain('1 étudiant·e sans note constructible');
    });

    it('le chemin les appelle dès qu\'il y a des élèves, y compris tous avec une note', () => {
        expect(lire('js/tableau-bord-apercu.js')).toMatch(/else if \(etudiants\.length > 0\) \{\s*interpretationHTML = phraseSansRepartition\(nbSansNote, etudiants\.length, window\.reperesPerformance\(\)\.raison\);/);
    });
});

describe('le panneau des seuils (retouche du lot 1, constat 2)', () => {
    const html = lire('index.html');
    it('le bouton lit les défauts à la source : aucune valeur écrite, les trois cases à remplir', () => {
        expect(html).not.toContain('70 · 80 · 85');
        const bouton = html.match(/data-action="restaurerSeuilsInterpretationDefautV2"[\s\S]*?<\/button>/)[0];
        for (const chemin of ['excellent', 'bon', 'acceptable']) expect(bouton).toContain(`data-seuil-depart="${chemin}"`);
        expect(bouton.replace(/data-action="[^"]*"/, '')).not.toMatch(/\d/);
    });

    it('P ne suit plus ces seuils : ni l\'étiquette, ni le paragraphe, ni la bulle ne le disent', () => {
        expect(html).not.toContain('couleur des colonnes A, C, P, M');
        expect(html).not.toContain('Assiduité, Complétion, Performance et Mobilisation');
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('Fragile (rouge), Acceptable (jaune), Bon (vert)');
    });

    it('le pack de démo a monté : les repères et les totems arrivent chez qui l\'a déjà ouverte', () => {
        expect(lire('js/pack-demo-10.js')).not.toContain('"version": "21.2"');
    });

    it('le dégradé mort de la barre est parti', () => {
        const regle = lire('styles.css').match(/\.barre-indicateur \{[^}]*\}/)[0];
        expect(regle).not.toContain('linear-gradient');
    });
});

/* Break-tests du 30 oct. 2026 : chaque mutation, puis ce fichier, puis le code restauré (git diff identique avant et après).
 *   ligne : la note de passage seule : 3 rouges ; la maîtrise à défaut de suffisance : 1
 *   borne de la ligne non stricte : 4
 *   fondation ignorée au niveau 3 : 4 ; la fondation seule donne le niveau 3 : 1
 *   fondation sur tous les critères : 1 ; lue au seuil du défi : 1
 *   persistante au-dessus retirée : 2 ; avant la note retirée : 5 ; copies sans note qui l'allument : 1
 *   niveau 3 par la note avant le minimum : 3
 *   diagnostic qui fixe encore après la note : 2 ; persistante passée avant le diagnostic 3 : 1
 *   « En attente » devenu niveau 1 : 6
 *   minimum ignoré : 5 ; strict : 14 ; appliqué à la sommative : 1
 *   note non constructible lue : 1 ; moyenne des copies au lieu de P : 7
 *   non-participation retirée : 1 ; mesure d'aide au niveau 3 : 1
 *   le signal de groupe enlève le signal individuel : 7 ; à la ligne : 1 ; les exclus y entrent : 1 ; P sous le minimum y entre : 1 ; minimum de 5 élèves : 4
 *   cible figée : 1 ; cible qui oublie le signalement : 1
 *   palier coché sans niveau, défaut silencieux : 1 ; valeur illisible gardée : 1 ; registre qui perd le niveau : 1 ; décocher qui garde le niveau : 1
 *   barre sur les seuls élèves à niveau : 1 ; phrase sans les élèves en attente : 2
 *   Aide (index.html) : niveau 1 sans « En attente » : 1 ; fondation retirée du niveau 3 : 1 ; 60 % devenu 65 % : 1 ; au plus le niveau 3 avant le minimum : 1 ;
 *   signalement sans sa durée : 1 ; persistante au niveau 3 : 1 ; le groupe-cours revenu dans le suivi : 1
 * Mutant équivalent, nommé : lire le diagnostic aussi après la note (0 rouge) : `classerNiveauAuCritere` l'ignore déjà ; le `note === null` évite seulement une lecture.
 */
