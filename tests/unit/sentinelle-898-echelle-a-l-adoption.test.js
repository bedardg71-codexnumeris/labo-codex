/**
 * SENTINELLE #898 (lot 34, 17 sept. 2026) — adopter un modèle Standards sans échelle DEMANDE l'échelle.
 *
 * Tranché par Grégoire le 17 sept. vers 9 h 15. Texte, tel quel : « Ce modèle a besoin d'une échelle de
 * performance pour calculer la note. Choisis-la : », la liste des échelles du trimestre, le bouton « Adopter ».
 *
 * CE QUE LA MESURE A MONTRÉ AVANT DE CODER : deux gestes vivants mènent un gabarit Standards sans échelle
 * dans la sélection — « ✓ Créer la pratique » de l'assistant après « Partir d'un modèle » (celui de l'audit
 * du 16 sept., constat B-1) et « Ajouter » de la bibliothèque des pratiques. `appliquerModeleSelectionne`
 * n'a aucun appelant : ce n'est pas le geste. Les deux gestes passent par la même question.
 *
 * LA PROMESSE PROUVÉE ICI n'est pas l'affichage d'une modale : c'est que, l'échelle choisie, l'instance se
 * construit, `simulerIndices` rend un nombre là où il rendait `null`, et que le profil (chemin riche),
 * l'export et le lecteur du Comparateur (`simulerIndices`) disent LA MÊME note pour le même élève.
 *
 * Modules RÉELS : l'assistant, la bibliothèque, la gestion des pratiques, le moteur, l'export, ui-dialogues.
 *
 *   cd tests && npx vitest run unit/sentinelle-898-echelle-a-l-adoption.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const r2 = (x) => (typeof x === 'number' ? Math.round(x * 100) / 100 : x);

const QUESTION = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note. Choisis-la :';
// #909 — la phrase de Grégoire (17 sept. 2026), nom d'écran de la navigation.
const PHRASE_AUCUNE_ECHELLE = 'Ce modèle a besoin d\'une échelle de performance pour calculer la note, et ce trimestre n\'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle.';
const DA = '1000002';
const ETUDIANTS = [{ da: DA, nom: 'Standards', prenom: 'Bruno', groupe: '01', coursId: 'GC1' }];

/* Deux échelles, comme le pack (« IDME et niv 0 », « IDME 4 niv ») : « plusieurs » est le cas normal.
   Leurs valeurs de calcul DIFFÈRENT exprès : le choix de l'échelle doit se voir dans la note. */
const E1 = { id: 'E1', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#a00' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#00a' }
] };
const E2 = { id: 'E2', nom: 'IDME banc, autres valeurs', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 30, couleur: '#a00' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 60, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 100, couleur: '#00a' }
] };
const E_RETIREE = { id: 'E3', nom: 'Retirée de la barre latérale', dansBibliotheque: false, niveaux: clone(E1.niveaux) };
const GRILLE = { id: 'G1', nom: 'Grille banc', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 100 }] };

function ev(id, productionId, noteFinale, niveauFinal, extra) {
    return Object.assign({
        id, etudiantDA: DA, productionId, noteFinale, niveauFinal,
        echelleId: 'E1', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true,
        dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'Rétroaction de banc.',
        statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: niveauFinal, ponderation: 100 }]
    }, extra || {});
}
/* Le jeu Standards de l'audit du 16 sept. (mêmes nombres) : six artefacts valides et une terminale. */
function jeuSTD() {
    const productions = [
        { id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 3, minimumCompletion: 1, nombreTotal: 6 } },
        { id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: 40, numero: 7, dateEcheance: '2026-05-01' }
    ];
    for (let i = 1; i <= 6; i++) productions.push({ id: 'A' + i, titre: 'Artefact ' + i, type: 'artefact-portfolio', numero: i, ponderation: 0, dateEcheance: '2026-0' + (1 + Math.floor(i / 3)) + '-1' + i });
    const d = (j) => ({ dateEvaluation: '2026-0' + (1 + Math.floor(j / 3)) + '-1' + j + 'T12:00:00.000Z' });
    const evaluations = [
        ev('EV_A1', 'A1', 85, 'M', d(1)), ev('EV_A2', 'A2', 60, 'D', d(2)), ev('EV_A3', 'A3', 78, 'M', d(3)),
        ev('EV_A4', 'A4', 70, 'D', d(4)), ev('EV_A5', 'A5', 78, 'M', d(5)), ev('EV_A6', 'A6', 95, 'E', d(6)),
        ev('EV_TERM', 'TERM', 82, 'M')
    ];
    return { productions, evaluations };
}
function jeuSOM() {
    return {
        productions: [
            { id: 'P1', titre: 'Dissertation', type: 'travail', ponderation: 40, dateEcheance: '2026-02-01' },
            { id: 'P2', titre: 'Examen', type: 'examen', ponderation: 60, dateEcheance: '2026-03-01' }
        ],
        evaluations: [ev('EV_S1', 'P1', 84, 'M'), ev('EV_S2', 'P2', 90, 'E')]
    };
}

const MODULES = ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js',
    'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-helpers.js', 'js/export-resultats-finaux.js', 'js/pratiques-bibliotheque.js', 'js/wizard-pratique-v2.js',
    'js/pratiques/construction-attributs.js', 'js/pratiques-gestion.js'];
const EXPORTS_WINDOW = (() => {
    const noms = new Set();
    for (const f of MODULES) for (const m of lire(f).matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) noms.add(m[1]);
    return [...noms];
})();
function elementDom() {
    const s = new Set();
    return { innerHTML: '', textContent: '', value: '', style: {}, classList: { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains: (c) => s.has(c), toggle: () => false },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [] };
}

/**
 * Monte le banc. `reponse` pilote le FAUX `uiDialogues.demanderChoix` : une fonction (options) → valeur
 * rendue. Chaque question posée est consignée dans `questions` (titre, message, choix, bouton).
 */
function monter(jeu, opts = {}) {
    const store = Object.assign({
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', nom: 'Groupe 1' },
        test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: null }],
        test_pratiquesConfigurables: clone(opts.pratiques || []),
        test_productions: clone(jeu.productions),
        test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_echellesTemplates: clone(opts.echelles || [E1, E2, E_RETIREE]),
        test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: clone(ETUDIANTS),
        test_jugementsDenotation: {}, test_modalitesEvaluation: {}, test_portfoliosEleves: {},
        bibliothequePratiques: clone(opts.bibliotheque || []),
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01' }
    }, opts.store || {});
    const notifs = [], questions = [], informations = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        // Même contrat que db.modifier : le mutateur reçoit la valeur lue ; `undefined` = ne rien écrire.
        modifier: async (k, mutateur, defaut) => {
            const rendu = mutateur(k in store ? clone(store[k]) : clone(defaut));
            if (rendu !== undefined) store[k] = clone(rendu);
        }
    };
    const cle = (k) => 'test_' + k;
    const OBJETS = ['indicesCP', 'indicesAssiduite', 'indicesAssiduiteDetailles', 'jugementsDenotation', 'portfoliosEleves', 'modalitesEvaluation'];
    const obtenirDonneesSelonMode = (k) => {
        const kb = k.startsWith('test_') ? k.slice(5) : k;
        if (('test_' + kb) in store) return clone(store['test_' + kb]);
        return OBJETS.includes(kb) ? {} : [];
    };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom(), readyState: 'complete' };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-17' };
    const fwd = (nom) => (...a) => win[nom](...a);
    let compteurId = 0;
    const globaux = {
        document, db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = clone(v); return true; },
        echapperHtml: (s) => String(s == null ? '' : s),
        estEtudiantExclu: (e) => !!(e && e.exclu),
        obtenirPreference: () => null, obtenirSeuil: (n) => ({ 'defiSpecifique': 0.70, 'idme.insuffisant': 0.64, 'idme.developpement': 0.75 })[n],
        chargerSeuilsInterpretation: () => ({}), filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants), genererSeancesCompletes() {},
        afficherSection() {}, afficherSousSection() {}, calculerEtSauvegarderIndicesAssiduite() {},
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info(t, m) { notifs.push({ type: 'info', t, m }); }, warning() {} },
        uiDialogues: { demanderChoix: async (options) => { questions.push(clone(options)); return opts.reponse ? opts.reponse(options) : null; },
            informer: async (options) => { informations.push(clone(options)); } },
        BibliothequeUI: { fermerModal() {}, filtrerParMaquette: (a) => a, filtrerParModeDemo: (a) => a, obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, repertoires: { rendre() {} } },
        ajouterAvecGardeIdentite: (liste, item) => ({ ajoute: true, liste: liste.concat([item]) }),
        confirm: () => true, alert() {}, genererIdUnique: (p) => p + 'NEUF' + (++compteurId),
        toggleDisplay() {}, setValeurChamp() {}, getValeurChamp: () => '', getCheckbox: () => false, setCheckbox() {},
        resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
        obtenirPratiqueActiveGroupeCours: () => (store.test_groupesCours[0].pratiqueId || null)
    };
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', '_exportResultats', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT',
        'wizardState', 'ETAPES_WIZARD', 'TYPE_BADGES', 'MODELES_PRATIQUES_PREDEFINIS', 'ConstructionAttributs'];
    for (const nom of EXPORTS_WINDOW) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && !OBJETS_EXPORTES.includes(nom)) globaux[nom] = fwd(nom);

    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-manager.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-sommative.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-standards.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-specifications.js', globaux, win);
    chargerScript('js/pratiques/denotation-jugements.js', globaux, win);
    chargerScript('js/portfolio.js', globaux, win);
    chargerScript('js/indices.js', globaux, win);
    chargerScript('js/profil-etudiant-actions.js', globaux, win);
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', Object.assign({ PratiquePANStandards: win.PratiquePANStandards, PratiqueSommative: win.PratiqueSommative }, globaux), win);
    chargerScript('js/export-resultats-finaux.js', globaux, win);
    chargerScript('js/pratiques-bibliotheque.js', globaux, win);
    chargerScript('js/pratiques/construction-attributs.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    chargerScript('js/pratiques-gestion.js', globaux, win);
    // Garde de validité du banc : sans ces fonctions, tout ce qui suit ne prouve rien.
    for (const f of ['creerPratiqueV2', 'ajouterPratiqueALaSelection', 'demanderEchelleAdoption', 'simulerIndices', 'calculerDetailsNoteFinale'])
        if (typeof win[f] !== 'function') throw new Error('banc incomplet : ' + f);
    return { win, store, notifs, questions, informations };
}

const pratiques = (b) => b.store.test_pratiquesConfigurables;
function gabarit(b, id) { return clone(b.win.obtenirToutesLesPratiquesBibliothequeSync(true).find(m => m.id === id)); }

/** GESTE 1 — l'assistant : « Partir d'un modèle », le modèle choisi, « ✓ Créer la pratique ». */
async function adopterParAssistant(b, modeleId) {
    const m = gabarit(b, modeleId);
    b.win.wizardState.reponses = { nom: 'Adoptée ' + modeleId, modeleChoisi: modeleId };
    b.win.wizardState.pratiqueId = null;
    b.win.wizardState.modeEdition = false;
    // Le vrai préparateur de l'étape « Choisis un modèle » : pose _modeleAdopte et _gabaritSource.
    b.win.preparerAdoptionModele ? b.win.preparerAdoptionModele(b.win.wizardState.reponses)
        : Object.assign(b.win.wizardState.reponses, { _modeleAdopte: true, _gabaritSource: m });
    const avant = pratiques(b).length;
    await b.win.creerPratiqueV2();
    return pratiques(b).length > avant ? clone(pratiques(b)[pratiques(b).length - 1]) : null;
}
/** GESTE 2 — la bibliothèque des pratiques : le bouton « Ajouter » de la carte du modèle. */
async function adopterParBibliotheque(b, modeleId) {
    const avant = pratiques(b).filter(p => p.dansBibliotheque !== false).length;
    await b.win.ajouterPratiqueALaSelection(modeleId);
    const selection = pratiques(b).filter(p => p.dansBibliotheque !== false);
    return selection.length > avant ? clone(selection.find(p => p.id === modeleId)) : null;
}
const GESTES = [['assistant', adopterParAssistant], ['bibliothèque', adopterParBibliotheque]];

/** Les TROIS écrans, pour le même élève : profil (chemin riche), export, lecteur du Comparateur. */
function troisEcrans(b, id) {
    b.store.test_groupesCours[0].pratiqueId = id;
    const details = b.win.calculerDetailsNoteFinale(DA);
    const sim = b.win.simulerIndices(DA, id);
    const ligne = b.win._exportResultats.construireLignesSynthese([ETUDIANTS[0]], { pratiqueId: id }, b.win.simulerIndices)[0];
    return {
        instance: !!b.win.obtenirPratiqueParId(id),
        profil: details ? (details.erreur ? { erreur: details.erreur } : r2(details.noteFinale)) : null,
        exportNote: ligne[8], exportStatut: ligne[9],
        comparateur: sim ? r2(sim.noteFinale) : null
    };
}

/* ============================================================================================= */
describe('#898 · 0 — le symptôme d\'avant : un modèle Standards sans échelle, écrit tel quel', () => {
    it('0.a  pas d\'instance, simulerIndices rend null, l\'export dit « non constructible » — et le profil calcule', () => {
        const b = monter(jeuSTD());
        const p = Object.assign(gabarit(b, 'STD-n-recents'), { id: 'TEL_QUEL', dansBibliotheque: true });
        delete p.estGabarit;
        b.store.test_pratiquesConfigurables = [p];
        const e = troisEcrans(b, 'TEL_QUEL');
        expect(e.instance).toBe(false);
        expect(e.comparateur).toBeNull();
        expect(String(e.exportStatut)).toMatch(/non constructible/i);
        expect(typeof e.profil).toBe('number');           // les deux écrans se contredisent : c'est B-1
    });
});

describe('#898 · A — la question est posée, et rien n\'est adopté tant qu\'on ne choisit pas', () => {
    for (const [nom, geste] of GESTES) {
        for (const modeleId of ['STD-n-meilleurs', 'STD-n-recents']) {
            it(`A.1 [${nom}] ${modeleId} : les mots de Grégoire, les échelles du trimestre, le bouton « Adopter »`, async () => {
                const b = monter(jeuSTD());
                await geste(b, modeleId);
                expect(b.questions).toHaveLength(1);
                const q = b.questions[0];
                expect(q.message).toBe(QUESTION);
                expect(q.texteConfirmer).toBe('Adopter');
                expect(q.titre).toBe(gabarit(b, modeleId).nom);
                // Les échelles du trimestre, comme les dropdowns de l'éditeur : la retirée n'est pas offerte.
                expect(q.choix).toEqual([{ valeur: 'E1', libelle: E1.nom }, { valeur: 'E2', libelle: E2.nom }]);
            });
            it(`A.2 [${nom}] ${modeleId} : question fermée sans choix → RIEN n'est écrit`, async () => {
                const b = monter(jeuSTD(), { reponse: () => null });
                const adoptee = await geste(b, modeleId);
                expect(b.questions).toHaveLength(1);
                expect(adoptee).toBeNull();
                expect(pratiques(b)).toEqual([]);
                expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
            });
        }
        it(`A.3 [${nom}] UNE SEULE échelle dans le trimestre : la question est posée quand même, on ne devine pas`, async () => {
            const b = monter(jeuSTD(), { echelles: [E1], reponse: () => null });
            const adoptee = await geste(b, 'STD-n-recents');
            expect(b.questions).toHaveLength(1);
            expect(b.questions[0].choix).toEqual([{ valeur: 'E1', libelle: E1.nom }]);
            expect(adoptee).toBeNull();
            expect(pratiques(b)).toEqual([]);
        });
        it(`A.4 [${nom}] une valeur qui n'est PAS une échelle offerte n'adopte rien`, async () => {
            const b = monter(jeuSTD(), { reponse: () => 'E3' });     // E3 existe, mais retirée de la barre latérale
            const adoptee = await geste(b, 'STD-n-recents');
            expect(adoptee).toBeNull();
            expect(pratiques(b)).toEqual([]);
        });
    }
});

describe('#898 · B — après le choix : l\'échelle est posée, l\'instance se construit, les trois écrans disent la même note', () => {
    for (const [nom, geste] of GESTES) {
        it(`B.1 [${nom}] « N plus récentes » + E1 : echelleId posé, instance, profil = export = Comparateur`, async () => {
            // À LA MAIN : 5 plus récents = A2..A6 → (60+78+70+78+95)/5 = 76,2 ; 0,6 × 76,2 + 0,4 × 82 = 78,52.
            // Le profil et le Comparateur le disent au centième ; l'export écrit la note entière (79, « final »).
            const b = monter(jeuSTD(), { reponse: () => 'E1' });
            const adoptee = await geste(b, 'STD-n-recents');
            expect(adoptee, 'le modèle doit être adopté').not.toBeNull();
            expect(adoptee.configuration.echelleId).toBe('E1');
            expect(adoptee.configuration.portfolio.methodeSelection).toBe('recents');   // le reste du modèle est intact
            const e = troisEcrans(b, adoptee.id);
            expect(e.instance).toBe(true);
            expect(typeof e.comparateur, 'simulerIndices rend un nombre là où il rendait null').toBe('number');
            expect(e.comparateur).toBe(78.52);
            expect(e.profil).toBe(e.comparateur);
            expect(e.exportStatut).toBe('final');
            expect(e.exportNote).toBe(Math.round(e.comparateur));
        });
        it(`B.2 [${nom}] « N meilleures » + E1 : même parité`, async () => {
            const b = monter(jeuSTD(), { reponse: () => 'E1' });
            const adoptee = await geste(b, 'STD-n-meilleurs');
            expect(adoptee.configuration.echelleId).toBe('E1');
            const e = troisEcrans(b, adoptee.id);
            expect(e.instance).toBe(true);
            // À LA MAIN : 7 à retenir, 6 valides → les six : (85+60+78+70+78+95)/6 = 77,67 ; 0,6 × 77,67 + 0,4 × 82 = 79,4.
            expect(e.comparateur).toBe(79.4);
            expect(e.profil).toBe(e.comparateur);
            expect(e.exportStatut).toBe('final');
            expect(e.exportNote).toBe(Math.round(e.comparateur));
        });
        it(`B.3 [${nom}] c'est l'échelle CHOISIE qui est posée, pas la première de la liste`, async () => {
            const b = monter(jeuSTD(), { reponse: () => 'E2' });
            const adoptee = await geste(b, 'STD-n-recents');
            expect(adoptee.configuration.echelleId).toBe('E2');
            expect(b.win.obtenirPratiqueParId(adoptee.id)).toBeTruthy();
        });
    }
    it('B.4 le gabarit de l\'application n\'est jamais muté par une adoption', async () => {
        const b = monter(jeuSTD(), { reponse: () => 'E1' });
        await adopterParBibliotheque(b, 'STD-n-recents');
        await adopterParAssistant(b, 'STD-n-meilleurs');
        expect(b.win.MODELES_PRATIQUES_PREDEFINIS['STD-n-recents'].configuration.echelleId).toBeUndefined();
        expect(b.win.MODELES_PRATIQUES_PREDEFINIS['STD-n-meilleurs'].configuration.echelleId).toBeUndefined();
    });
});

describe('#898 · C — ce qui ne change pas', () => {
    for (const [nom, geste] of GESTES) {
        for (const modeleId of ['SOM-litterature', 'SPE-simple', 'DEN-base']) {
            it(`C.1 [${nom}] ${modeleId} s'adopte sans question`, async () => {
                const b = monter(jeuSOM(), { reponse: () => { throw new Error('aucune question attendue'); } });
                const adoptee = await geste(b, modeleId);
                expect(b.questions).toEqual([]);
                expect(adoptee).not.toBeNull();
                expect(adoptee.configuration.echelleId == null).toBe(true);
            });
        }
        it(`C.2 [${nom}] un modèle Standards qui PORTE une échelle s'adopte sans question, avec la sienne`, async () => {
            const porteuse = { id: 'STD-porteuse', nom: 'Standards avec échelle', type: 'standards', pratiques: ['STD'],
                configuration: { echelleId: 'E2', varianteCalcul: 'n-recents', portfolio: { methodeSelection: 'recents', nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10, decouplerPN: false } } };
            const b = monter(jeuSTD(), { bibliotheque: [porteuse], reponse: () => { throw new Error('aucune question attendue'); } });
            const adoptee = await geste(b, 'STD-porteuse');
            expect(b.questions).toEqual([]);
            expect(adoptee.configuration.echelleId).toBe('E2');
        });
    }
    it('C.3 une pratique Standards déjà dans la sélection : « Ajouter » ne pose pas de question et n\'écrit rien', async () => {
        const dejaLa = Object.assign(clone({ id: 'STD-n-recents', nom: 'N plus récentes', type: 'standards', configuration: { portfolio: {} } }), { dansBibliotheque: true });
        const b = monter(jeuSTD(), { pratiques: [dejaLa], reponse: () => 'E1' });
        await b.win.ajouterPratiqueALaSelection('STD-n-recents');
        expect(b.questions).toEqual([]);
        expect(pratiques(b)).toEqual([dejaLa]);
    });
    it('C.4 une pratique Standards sans échelle RETIRÉE de la sélection : la remettre demande l\'échelle', async () => {
        const retiree = { id: 'STD-n-recents', nom: 'N plus récentes', type: 'standards', dansBibliotheque: false,
            configuration: { portfolio: { methodeSelection: 'recents', nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10 } } };
        const b = monter(jeuSTD(), { pratiques: [retiree], reponse: () => 'E1' });
        await b.win.ajouterPratiqueALaSelection('STD-n-recents');
        expect(b.questions).toHaveLength(1);
        expect(pratiques(b)[0].dansBibliotheque).toBe(true);
        expect(pratiques(b)[0].configuration.echelleId).toBe('E1');
    });
    // C.5 figeait le geste d'avant (#909 : « pas de question, le modèle s'adopte sans échelle »).
    // Tranché par Grégoire le 17 sept. : la fenêtre s'ouvre quand même, dit pourquoi, nomme où
    // aller, et l'adoption n'a PAS lieu. Les DEUX gestes disent la même chose.
    for (const [nom, geste] of GESTES) {
        for (const [cas, echelles] of [['aucune échelle', []], ['seulement une échelle retirée de la barre latérale', [E_RETIREE]]]) {
            it(`C.5 [${nom}] #909 ${cas} : la phrase de Grégoire s'affiche, aucune question, RIEN n'est écrit`, async () => {
                const b = monter(jeuSTD(), { echelles, reponse: () => { throw new Error('aucune question attendue'); } });
                const avant = JSON.stringify(b.store);
                const adoptee = await geste(b, 'STD-n-recents');
                expect(b.questions).toEqual([]);
                expect(b.informations).toEqual([{ titre: gabarit(b, 'STD-n-recents').nom, message: PHRASE_AUCUNE_ECHELLE }]);
                expect(adoptee).toBeNull();
                // Octet pour octet : ni pratiquesConfigurables, ni le groupe-cours, ni rien d'autre.
                expect(JSON.stringify(b.store)).toBe(avant);
                expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
            });
        }
        it(`C.6 [${nom}] #909 la phrase ne sort PAS quand une échelle est offerte, ni pour une autre famille`, async () => {
            const b = monter(jeuSTD(), { reponse: () => 'E1' });
            await geste(b, 'STD-n-recents');
            expect(b.informations).toEqual([]);
            const sansEchelle = monter(jeuSOM(), { echelles: [] });
            const adoptee = await geste(sansEchelle, 'SOM-litterature');
            expect(sansEchelle.informations).toEqual([]);
            expect(adoptee).not.toBeNull();
        });
    }
});

describe('#898 · D — le prédicat lit ce que lit l\'instance', () => {
    it('D.1 modeleDemandeEchelle : famille Standards ET aucune échelle (embarquée ou par id)', () => {
        const { win } = monter(jeuSTD());
        const f = win.modeleDemandeEchelle;
        expect(f({ type: 'standards', configuration: {} })).toBe(true);
        expect(f({ type: 'pan-standards', configuration: {} })).toBe(win.normaliserIdPratique('pan-standards') === 'standards');
        expect(f({ type: 'standards', configuration: { echelleId: 'E1' } })).toBe(false);
        expect(f({ type: 'standards', echelle: { niveaux: [] } })).toBe(false);           // la forme du pack
        expect(f({ type: 'standards', config: { echelle: { niveaux: [] } } })).toBe(false);
        expect(f({ type: 'standards', config: { echelleId: 'E1' } })).toBe(false);
        expect(f({ type: 'sommative', configuration: {} })).toBe(false);
        expect(f({ type: 'specifications', configuration: {} })).toBe(false);
        expect(f({ type: 'denotation', configuration: { echelleId: null } })).toBe(false);
        expect(f(null)).toBe(false);
    });
    it('D.2 la pratique Standards du pack porte son échelle : elle ne demanderait rien', () => {
        const { win } = monter(jeuSTD());
        const w = {}; new Function('window', lire('js/pack-demo-10.js'))(w);
        const std = w.PACK_DEMARRAGE.pratiquesConfigurables.find(p => p.id === 'demo-std-litt');
        expect(std, 'le pack doit porter demo-std-litt').toBeTruthy();
        expect(win.modeleDemandeEchelle(Object.assign({ type: 'standards' }, std))).toBe(false);
        expect(w.PACK_DEMARRAGE.echellesTemplates.filter(e => e.dansBibliotheque !== false)).toHaveLength(2);
    });
});

describe('#898 · E — verrou structurel : qui adopte passe par la question', () => {
    const tranche = (src, debut, fin) => {
        const i = src.indexOf(debut);
        if (i < 0) throw new Error('repère absent : ' + debut);
        const j = src.indexOf(fin, i + debut.length);
        if (j < 0) throw new Error('repère absent : ' + fin);
        const t = src.slice(i, j);
        if (t.length < 50) throw new Error('tranche vide : ' + debut);
        return t;
    };
    it('E.1 l\'assistant : la branche d\'adoption de creerPratiqueV2 demande avant de finaliser', () => {
        const t = tranche(lire('js/wizard-pratique-v2.js'), 'if (r._modeleAdopte && r._gabaritSource) {', 'await finaliserCreationPratique(clone);');
        expect(t).toMatch(/await demanderEchelleAdoption\(src\)/);
        expect(t).toMatch(/if \(!reponseEchelle\.adopter\) return;/);
    });
    it('E.2 la bibliothèque : ajouterPratiqueALaSelection demande avant db.modifier', () => {
        const t = tranche(lire('js/pratiques-gestion.js'), 'async function ajouterPratiqueALaSelection(', 'await db.modifier(');
        expect(t).toMatch(/await demanderEchelleAdoption\(/);
        expect(t).toMatch(/if \(!reponseEchelle\.adopter\) return;/);
    });
    it('E.3 les mots de Grégoire ne vivent qu\'à un endroit du dossier js/', () => {
        const hits = ['js/pratiques-bibliotheque.js', 'js/pratiques-gestion.js', 'js/wizard-pratique-v2.js', 'js/ui-dialogues.js']
            .filter(f => lire(f).includes('Ce modèle a besoin d\\\'une échelle de performance'));
        expect(hits).toEqual(['js/pratiques-bibliotheque.js']);
    });
    it('E.4 #909 la phrase du trimestre sans échelle : posée UNE fois, mot pour mot', () => {
        const src = lire('js/pratiques-bibliotheque.js');
        expect(src.split('ce trimestre n\\\'en a aucune').length - 1).toBe(1);
        expect(src).toContain(PHRASE_AUCUNE_ECHELLE.replace(/'/g, '\\\''));
    });
});

/* ============================================================================================= */
/* F — le VRAI uiDialogues.demanderChoix, sur un DOM minimal : rien de présélectionné, et le bouton
       d'action ne répond pas tant qu'aucune option n'est cochée.                                  */
describe('#898 · F — uiDialogues.demanderChoix', () => {
    function domMinimal() {
        const ecouteursDoc = {};
        const faire = (tag) => {
            const el = { tag, children: [], attrs: {}, ecouteurs: {}, className: '', id: '', textContent: '', value: '', checked: false, disabled: false, style: {},
                setAttribute(k, v) { this.attrs[k] = v; }, appendChild(c) { this.children.push(c); c.parent = this; },
                addEventListener(t, f) { (this.ecouteurs[t] = this.ecouteurs[t] || []).push(f); },
                remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); },
                focus() {}, emettre(t, e) { (this.ecouteurs[t] || []).forEach(f => f(Object.assign({ target: this, preventDefault() {} }, e || {}))); } };
            return el;
        };
        const body = faire('body');
        const document = { createElement: faire, body, activeElement: null,
            addEventListener(t, f) { (ecouteursDoc[t] = ecouteursDoc[t] || []).push(f); },
            removeEventListener(t, f) { ecouteursDoc[t] = (ecouteursDoc[t] || []).filter(g => g !== f); },
            touche(key) { (ecouteursDoc.keydown || []).slice().forEach(f => f({ key, preventDefault() {} })); } };
        const tous = (el, acc = []) => { acc.push(el); el.children.forEach(c => tous(c, acc)); return acc; };
        return { document, body, tous: () => tous(body) };
    }
    function ouvrir() {
        const dom = domMinimal();
        const win = chargerScript('js/ui-dialogues.js', { document: dom.document });
        let rendu = 'EN ATTENTE';
        win.uiDialogues.demanderChoix({ titre: 'N plus récentes', message: QUESTION, texteConfirmer: 'Adopter',
            choix: [{ valeur: 'E1', libelle: 'IDME et niv 0' }, { valeur: 'E2', libelle: 'IDME 4 niv' }] }).then(v => { rendu = v; });
        const els = dom.tous();
        return { dom, els, radios: els.filter(e => e.tag === 'input'), boutons: els.filter(e => e.tag === 'button'), lire: async () => { await Promise.resolve(); await Promise.resolve(); return rendu; } };
    }
    it('F.1 la question, les deux options, « Adopter » inerte et rien de coché', async () => {
        const m = ouvrir();
        expect(m.els.some(e => e.textContent === QUESTION)).toBe(true);
        expect(m.els.filter(e => e.tag === 'span').map(e => e.textContent)).toEqual(['IDME et niv 0', 'IDME 4 niv']);
        expect(m.radios.map(r => r.checked)).toEqual([false, false]);
        const adopter = m.boutons.find(b => b.textContent === 'Adopter');
        expect(adopter.disabled).toBe(true);
        adopter.emettre('click');
        m.dom.document.touche('Enter');
        expect(await m.lire()).toBe('EN ATTENTE');                  // sans choix, rien ne répond
        expect(m.dom.body.children).toHaveLength(1);               // la modale est toujours là
    });
    it('F.2 cocher la SECONDE option puis « Adopter » rend la seconde valeur', async () => {
        const m = ouvrir();
        m.radios[1].checked = true; m.radios[1].emettre('change');
        const adopter = m.boutons.find(b => b.textContent === 'Adopter');
        expect(adopter.disabled).toBe(false);
        adopter.emettre('click');
        expect(await m.lire()).toBe('E2');
        expect(m.dom.body.children).toHaveLength(0);
    });
    it('F.3 « Annuler » et Échap rendent null, même après un choix', async () => {
        const m1 = ouvrir();
        m1.radios[0].checked = true; m1.radios[0].emettre('change');
        m1.boutons.find(b => b.textContent === 'Annuler').emettre('click');
        expect(await m1.lire()).toBeNull();
        const m2 = ouvrir();
        m2.dom.document.touche('Escape');
        expect(await m2.lire()).toBeNull();
    });
});
