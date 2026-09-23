/**
 * SENTINELLE #716 (lot N2, 22 sept. 2026) — LE P HISTORIQUE D'UN SNAPSHOT EST LA NOTE DU COURS À SA DATE.
 *
 * Avant ce lot, le P des snapshots (trajectoires, courbes du Suivi, corrélations, impact des jetons) avait sa
 * propre définition : une copie de la sélection en Standards, une méthode sommative qui lisait `e.da` / `e.note`
 * (jamais remplis : elle rendait toujours null), puis un repli qui convertissait les niveaux par une table
 * I 40 / D 65 / M 75 / E 100 codée en dur — ce que recevaient la sommative, les spécifications et la dénotation.
 *
 * Maintenant : `calculerNoteDuCours` (portfolio.js), LA fonction qui écrit l'indice P, appliquée aux seules
 * évaluations de l'élève échues à la date (échéance effective du groupe-cours). Décisions de Grégoire (22 sept.) :
 *   1A · à une date passée, la note est PROVISOIRE : « notes finales » (obligatoires non remises = 0) ne s'applique pas ;
 *   2A · la DÉNOTATION n'a pas de P historique : sa note est un jugement saisi, pas un calcul sur des évaluations.
 *
 * Le banc monte les modules RÉELS (bac du Suivi, modes.js réel : c'est son contexte de simulation qui porte les
 * évaluations échues). La preuve centrale est l'IDENTITÉ : à une date postérieure à toutes les échéances, le P du
 * snapshot égale l'indice P que `calculerEtStockerIndicesCP` vient d'écrire — pour chaque famille.
 * Les dates intermédiaires sont jugées contre un SECOND banc qui ne contient que les évaluations échues.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, RACINE } from './_helpers/bac-suivi.js';

const DA = { ALICE: '2000001', BRUNO: '2000002' };
const FIN = '2026-06-30';       // après toutes les échéances
const MI = '2026-03-10';        // A1, A2, A3 dus ; A4 (15 mars) ne l'est pas

const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40, couleur: '#aa0000' }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };
const niveau = (n) => (n >= 85 ? 'E' : n >= 75 ? 'M' : n >= 65 ? 'D' : 'I');
const ev = (da, prodId, note, extra) => Object.assign({
    id: 'EV-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: niveau(note), echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-05-20T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
}, extra || {});

/* ------------------------------------------------------------------ Standards : six artefacts, une terminale */
const ECHEANCES = { A1: '2026-02-01', A2: '2026-02-15', A3: '2026-03-01', A4: '2026-03-15', A5: '2026-04-01', A6: '2026-04-15', T1: '2026-05-01' };
function productionsSTD(categories = null) {
    const l = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60, coursId: 'GC1' }];
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id, i) => l.push(Object.assign({ id, titre: 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1,
        ponderation: 0, dateEcheance: ECHEANCES[id], coursId: 'GC1' }, categories ? { categorie: categories[id] } : {})));
    l.push({ id: 'T1', titre: 'Analyse finale', type: 'terminale', numero: 7, ponderation: 40, dateEcheance: ECHEANCES.T1, coursId: 'GC1' });
    return l;
}
const NOTES_STD = { [DA.ALICE]: { A1: 60, A2: 70, A3: 88, A4: 92, A5: 75, A6: 80, T1: 82 }, [DA.BRUNO]: { A1: 90, A2: 55, A3: 72, A4: 66, A5: 95, A6: 70, T1: 68 } };
function copiesSTD(sauf = []) {
    const l = [];
    for (const da of [DA.ALICE, DA.BRUNO]) for (const [p, n] of Object.entries(NOTES_STD[da])) if (!sauf.includes(da + ':' + p)) l.push(ev(da, p, n));
    return l;
}
function pratiqueSTD({ methodeSelection = 'meilleurs', hybride = false, notesFinales = false } = {}) {
    return { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: Object.assign({ type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { utiliser: true, nombreARetenir: 3, minimumCompletion: 1, methodeSelection, reglesConformite: { actif: false } }, notesFinales },
        hybride ? { categories: { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } } } : {}) };
}
const CATEGORIES = { A1: 'selection', A2: 'selection', A3: 'selection', A4: 'selection', A5: 'obligatoire', A6: 'obligatoire' };

/* ------------------------------------------------------------------ Sommative, spécifications, dénotation */
const PRODUCTIONS_SOM = [
    { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01', coursId: 'GC1' },
    { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-15', coursId: 'GC1' }
];
const COPIES_SOM = [ev(DA.ALICE, 'P1', 84), ev(DA.ALICE, 'P2', 90), ev(DA.BRUNO, 'P1', 62), ev(DA.BRUNO, 'P2', 71)];
const PRATIQUE_SOM = { id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: { approcheEvaluation: 'sommative' } };

const PRODUCTIONS_SPE = [
    { id: 'D1', titre: 'Dissertation 1', type: 'dissertation', dateEcheance: '2026-02-01', coursId: 'GC1' },
    { id: 'X1', titre: 'Examen 1', type: 'examen', dateEcheance: '2026-02-15', coursId: 'GC1' },
    { id: 'D2', titre: 'Dissertation 2', type: 'dissertation', dateEcheance: '2026-03-15', coursId: 'GC1' },
    { id: 'F1', titre: 'Dossier', type: 'dossier', dateEcheance: '2026-04-01', coursId: 'GC1' }
];
const COPIES_SPE = [ev(DA.ALICE, 'D1', 80), ev(DA.ALICE, 'X1', 90), ev(DA.ALICE, 'D2', 75), ev(DA.ALICE, 'F1', 72),
    ev(DA.BRUNO, 'D1', 71), ev(DA.BRUNO, 'X1', 50), ev(DA.BRUNO, 'D2', 88), ev(DA.BRUNO, 'F1', 90)];
const PRATIQUE_SPE = { id: 'spe-banc', nom: 'SPE banc', type: 'specifications', calcul_note: { methode: 'specifications' }, dansBibliotheque: true,
    configuration: { type: 'specifications',
        typesTravaux: [{ id: 'dissertation', nom: 'Dissertation', seuilAcceptable: 70 }, { id: 'examen', nom: 'Examen', seuilAcceptable: 70 }, { id: 'dossier', nom: 'Dossier', seuilAcceptable: 70 }],
        tableBundles: [
            { noteFixe: 100, label: 'A', requis: { dissertation: 2, examen: 1, dossier: 1 } },
            { noteFixe: 80, label: 'B', requis: { dissertation: 2, examen: 1 } },
            { noteFixe: 60, label: 'C', requis: { dissertation: 1, examen: 1 } },
            { noteFixe: 50, label: 'F', requis: null }
        ] } };

const PRATIQUE_DEN = { id: 'den-banc', nom: 'DEN banc', type: 'denotation', calcul_note: { methode: 'jugement_global' }, dansBibliotheque: true,
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible-1', nom: 'Lire' }], suggestion: { methode: 'mode' }, echelleId: null, grilleId: null } };
const JUGEMENTS_DEN = { 'den-banc': { [DA.ALICE]: { ciblesAtteintes: { 'cible-1': true }, noteFinale: 78, justification: 'Jugement de banc', date: '2026-05-01' } } };

/* ------------------------------------------------------------------ Le bac */
const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/snapshots.js'];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

function banc({ pratique, productions, evaluations, jugements = {} }) {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ALICE || e.da === DA.BRUNO);
    store.test_groupesCours[0].pratiqueId = pratique ? pratique.id : null;
    store.test_pratiquesConfigurables = pratique ? [clone(pratique)] : [];
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    store.test_jugementsDenotation = clone(jugements);
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-09-22',
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            // Copie de productions.js:152 (pure), comme aux bancs du lot A et de #871.
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false
        }
    });
    win = b.win;
    win.calculerEtStockerIndicesCP();
    return b;
}
const stocke = (b, da) => b.store.test_indicesCP[da].actuel;
const historique = (b, da, date) => b.win.calculerIndicesHistoriques(da, date).P;
/**
 * Le P que la note du cours donne quand SEULES les évaluations échues à `date` existent (second banc, sans contexte),
 * EN PROVISOIRE (décision 1A) : sans cela, la pratique hybride « notes finales » y compterait 0 pour les obligatoires
 * A5 et A6, pas encore dues le 10 mars — mesuré : 51 / 53, contre 79 / 81 en provisoire.
 */
function noteSurLesEchues(jeu, date, echeances) {
    const pratique = jeu.pratique ? clone(jeu.pratique) : null;
    if (pratique && pratique.configuration) pratique.configuration.notesFinales = false;
    const b = banc(Object.assign({}, jeu, { pratique, evaluations: jeu.evaluations.filter(e => echeances[e.productionId] <= date) }));
    return [DA.ALICE, DA.BRUNO].map(da => (stocke(b, da).noteConstructible ? stocke(b, da).P : null));
}
const echeancesDe = (productions) => Object.fromEntries(productions.filter(p => p.dateEcheance).map(p => [p.id, p.dateEcheance]));

const JEUX_STD = {
    'Standards « meilleurs »': { pratique: pratiqueSTD(), productions: productionsSTD(), evaluations: copiesSTD() },
    'Standards « récents »': { pratique: pratiqueSTD({ methodeSelection: 'recents' }), productions: productionsSTD(), evaluations: copiesSTD() },
    'Standards hybride, notes finales': { pratique: pratiqueSTD({ hybride: true, notesFinales: true }), productions: productionsSTD(CATEGORIES), evaluations: copiesSTD() }
};
const JEUX = Object.assign({}, JEUX_STD, {
    'sommative': { pratique: PRATIQUE_SOM, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM },
    'spécifications': { pratique: PRATIQUE_SPE, productions: PRODUCTIONS_SPE, evaluations: COPIES_SPE }
});

describe('#716 · l\'identité : à une date postérieure à toutes les échéances, le P du snapshot EST l\'indice P stocké', () => {
    for (const [nom, jeu] of Object.entries(JEUX)) {
        it(nom, () => {
            const b = banc(jeu);
            const attendus = [DA.ALICE, DA.BRUNO].map(da => stocke(b, da));
            // Garde de non-vide : deux notes réelles, et différentes (sinon l'identité ne départagerait rien).
            expect(attendus.every(s => s.noteConstructible && s.P > 0), nom).toBe(true);
            expect(attendus[0].P).not.toBe(attendus[1].P);
            expect([historique(b, DA.ALICE, FIN), historique(b, DA.BRUNO, FIN)], nom).toEqual(attendus.map(s => s.P));
        });
    }
    it('valeurs à la main (sommative) : Alice (84 × 40 + 90 × 60) / 100 = 87,6 → 88 ; Bruno (62 × 40 + 71 × 60) / 100 = 67,4 → 67', () => {
        const b = banc(JEUX.sommative);
        expect([historique(b, DA.ALICE, FIN), historique(b, DA.BRUNO, FIN)]).toEqual([88, 67]);
    });
});

describe('#716 · une date intermédiaire : la note du cours recalculée sur les seules évaluations échues', () => {
    for (const [nom, jeu] of Object.entries(JEUX)) {
        it(nom, () => {
            const date = nom === 'sommative' ? '2026-02-20' : MI;
            const attendu = noteSurLesEchues(jeu, date, echeancesDe(jeu.productions));
            const b = banc(jeu);
            const obtenu = [historique(b, DA.ALICE, date), historique(b, DA.BRUNO, date)];
            expect(attendu.every(p => typeof p === 'number'), nom).toBe(true);   // non-vide
            expect(obtenu, nom).toEqual(attendu);
            // …et ce n'est PAS la note de fin de trimestre : la date filtre réellement.
            expect(obtenu, nom).not.toEqual([stocke(b, DA.ALICE).P, stocke(b, DA.BRUNO).P]);
        });
    }
    it('une évaluation échue APRÈS la date ne change pas son P (A4, due le 15 mars, passe de 92 à 20)', () => {
        const avant = historique(banc(JEUX['Standards « meilleurs »']), DA.ALICE, MI);
        const jeu = Object.assign({}, JEUX['Standards « meilleurs »'], { evaluations: copiesSTD().map(e => (e.productionId === 'A4' && e.etudiantDA === DA.ALICE ? Object.assign(e, { noteFinale: 20, niveauFinal: 'I' }) : e)) });
        const b = banc(jeu);
        expect(historique(b, DA.ALICE, MI)).toBe(avant);
        expect(stocke(b, DA.ALICE).P).not.toBe(stocke(banc(JEUX['Standards « meilleurs »']), DA.ALICE).P);   // témoin : la copie compte bien à la fin
    });
    // Complément de relecture (Cowork, 23 sept. 2026) : « <= » remplacé par « < » survivait.
    it('la borne : une évaluation dont l\'échéance EST la date du snapshot y entre ; la veille, elle n\'y est pas (A4, due le 15 mars)', () => {
        const b = banc(JEUX['Standards « meilleurs »']);
        // Le 14 : A1-A3 = 60, 70, 88 → 72,67 → 73. Le 15 : les trois meilleures de 60, 70, 88, 92 → (88 + 92 + 70) / 3 = 83,33 → 83.
        expect([historique(b, DA.ALICE, '2026-03-14'), historique(b, DA.ALICE, '2026-03-15')]).toEqual([73, 83]);
        expect(historique(b, DA.ALICE, '2026-03-15')).toBe(noteSurLesEchues(JEUX['Standards « meilleurs »'], '2026-03-15', ECHEANCES)[0]);
    });
    it('valeurs à la main (Standards « meilleurs », 10 mars) : Alice A1-A3 = 60, 70, 88 → 72,67 → 73 ; la terminale n\'est pas due', () => {
        expect(historique(banc(JEUX['Standards « meilleurs »']), DA.ALICE, MI)).toBe(73);
    });
});

describe('#716 · décision 1A : à une date passée, la note est provisoire (« notes finales » ne s\'applique pas)', () => {
    it('Bruno n\'a pas remis l\'obligatoire A6 : l\'indice stocké (notes finales) la compte 0, le P historique l\'ignore — comme la même pratique en provisoire', () => {
        const sauf = [DA.BRUNO + ':A6'];
        const finale = banc({ pratique: pratiqueSTD({ hybride: true, notesFinales: true }), productions: productionsSTD(CATEGORIES), evaluations: copiesSTD(sauf) });
        const provisoire = banc({ pratique: pratiqueSTD({ hybride: true, notesFinales: false }), productions: productionsSTD(CATEGORIES), evaluations: copiesSTD(sauf) });
        const pStocke = stocke(finale, DA.BRUNO).P, pProvisoire = stocke(provisoire, DA.BRUNO).P;
        expect(pStocke).toBeLessThan(pProvisoire);                        // le réglage mord bien sur l'indice d'aujourd'hui
        expect(historique(finale, DA.BRUNO, FIN)).toBe(pProvisoire);      // …pas sur le P historique
        expect(historique(finale, DA.BRUNO, MI)).toBe(historique(provisoire, DA.BRUNO, MI));
        // Et le réglage lui-même n'est pas touché : après le calcul historique, l'indice se recalcule toujours en finale.
        finale.win.calculerEtStockerIndicesCP();
        expect(stocke(finale, DA.BRUNO).P).toBe(pStocke);
    });
});

describe('#716 · ce qui rend null — jamais une valeur fabriquée', () => {
    it('sommative : le P historique n\'est plus null quand l\'élève a des évaluations (le défaut `e.da` / `e.note`)', () => {
        const b = banc(JEUX.sommative);
        expect(historique(b, DA.ALICE, '2026-02-20')).toBe(84);   // seule P1 est due : 84
    });
    it('décision 2A : la dénotation n\'a pas de P historique, même jugée (l\'indice P d\'aujourd\'hui, lui, vaut 78)', () => {
        const b = banc({ pratique: PRATIQUE_DEN, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM, jugements: JUGEMENTS_DEN });
        expect(stocke(b, DA.ALICE).P).toBe(78);
        expect([historique(b, DA.ALICE, FIN), historique(b, DA.ALICE, MI)]).toEqual([null, null]);
    });
    it('sans pratique assignée : null (comme depuis N1a), même avec des évaluations', () => {
        const b = banc({ pratique: null, productions: PRODUCTIONS_SOM, evaluations: COPIES_SOM });
        expect(historique(b, DA.ALICE, FIN)).toBeNull();
        expect(b.win.calculerIndicesHistoriques(DA.ALICE, FIN).C).toBe(100);   // témoin : le snapshot se calcule
    });
    it('sans note calculable à la date : null — avant la première échéance, ou des copies en brouillon seulement (avant : la table I/D/M/E)', () => {
        const b = banc(JEUX['Standards « meilleurs »']);
        expect(historique(b, DA.ALICE, '2026-01-15')).toBeNull();
        const b2 = banc(Object.assign({}, JEUX.sommative, { evaluations: COPIES_SOM.map(e => Object.assign(clone(e), { verrouillee: false, ponderationCouverte: 50 })) }));
        expect(historique(b2, DA.ALICE, FIN)).toBeNull();
    });
    it('le contexte est rendu : après un P historique, le moteur relit TOUTES les évaluations', () => {
        const b = banc(JEUX['Standards « meilleurs »']);
        historique(b, DA.ALICE, MI);
        expect(b.winModes.obtenirDonneesSelonMode('evaluationsSauvegardees').length).toBe(copiesSTD().length);
        expect(b.winModes.contexteImposeNoteProvisoire()).toBe(false);
    });
});

describe('#716 · règle #394 déplacée dans calculerNoteDuCours : une Standards qui ne bâtit pas sa note est NON CONSTRUCTIBLE', () => {
    // Complément de relecture (Cowork, 23 sept. 2026) : retirer « && !cheminRicheStdAEchoue » survivait à toute la suite.
    // Le repli d'une Standards configurable (`conversion_niveaux`) relit l'indice STOCKÉ : tant qu'il est déjà « non
    // constructible », il rend null et la garde ne se voit pas. Le trajet qui la départage est celui d'un stock encore
    // CONSTRUCTIBLE : la note a été calculée, puis la pondération de la terminale a disparu. Sans la garde, l'ancienne
    // note revient — au snapshot (capturé avant le recalcul des indices) comme à l'indice recalculé.
    it('pondération de la terminale retirée après un calcul : point du snapshot null ET indice P non constructible — jamais l\'ancienne note', () => {
        const b = banc(JEUX['Standards « meilleurs »']);
        const avant = stocke(b, DA.ALICE);
        expect(avant).toMatchObject({ noteConstructible: true, pratique: 'std-banc' });   // le stock est constructible
        expect(avant.P).toBeGreaterThan(0);
        b.store.test_productions = b.store.test_productions.map(p => (p.id === 'T1' ? Object.assign(p, { ponderation: undefined }) : p));
        // Le chemin riche a bien tourné et échoue (ce n'est pas « aucune pratique ») :
        expect(b.win.calculerDetailsNoteFinale(DA.ALICE)).toMatchObject({ noteFinale: null });
        expect([historique(b, DA.ALICE, FIN), historique(b, DA.ALICE, MI)]).toEqual([null, null]);
        b.win.calculerEtStockerIndicesCP();
        expect(stocke(b, DA.ALICE)).toMatchObject({ noteConstructible: false, P: 0 });
    });
});

describe('#716 · sentinelle statique : l\'ancienne définition ne subsiste pas dans js/', () => {
    it('ni méthode historique par famille, ni table I 40, ni conversion « / 4 × 100 »', () => {
        const fautifs = [];
        const parcourir = (dossier) => {
            for (const n of readdirSync(dossier, { withFileTypes: true })) {
                const chemin = path.join(dossier, n.name);
                if (n.isDirectory()) { if (n.name !== '_archives') parcourir(chemin); continue; }
                if (!n.name.endsWith('.js')) continue;
                const src = readFileSync(chemin, 'utf8');
                if (/calculerPerformanceHistorique/.test(src)) fautifs.push(n.name + ' : calculerPerformanceHistorique');
                if (/===\s*'I'\)\s*return\s*40/.test(src)) fautifs.push(n.name + ' : table I → 40');
                if (/\/\s*4\)\s*\*\s*100/.test(src)) fautifs.push(n.name + ' : / 4) * 100');
            }
        };
        parcourir(path.join(RACINE, 'js'));
        expect(fautifs).toEqual([]);
        // Garde de non-vide : le parcours a bien lu le fichier qui portait le repli.
        expect(readFileSync(path.join(RACINE, 'js/snapshots.js'), 'utf8')).toMatch(/calculerNoteDuCours\(da, pratiqueP\)/);
    });
});
