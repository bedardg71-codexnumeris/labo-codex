/**
 * SENTINELLE #714 (lot N3, 22 septembre 2026) — le panneau « Développement des habiletés » du profil
 * LIT la note, et n'écrit rien.
 *
 * Avant ce lot, `genererSectionPerformance` (profil-etudiant-sections-affichage.js) :
 *   - prenait le nombre à retenir dans les `regles` de la PRODUCTION Portfolio (« 3 ») et non dans la
 *     pratique (« 4 meilleurs ») ;
 *   - lisait la liste des retenues dans `indicesCP.details`, que plus rien n'écrit : « Calcul impossible :
 *     aucune évaluation disponible » sous un P juste (mesure B3b de l'audit du 5 sept.) ;
 *   - ÉCRIVAIT, à chaque affichage d'un élève sans sélection, une sélection « meilleurs » coupée à 3 dans
 *     `portfoliosEleves`, puis relançait `calculerEtStockerIndicesCP()`.
 * Il lit maintenant `calculerDetailsNoteFinale(da)` seul, et ne dit AUCUNE phrase de retenue hors Standards.
 *
 * Banc : les modules RÉELS de js/ dans le bac à sable (patron du banc de l'audit du 5 sept.,
 * `audit-pratique-de-notation-2026-09-05.test.js`, dont ce harnais est une copie réduite).
 * Les valeurs attendues sont calculées à la main dans le commentaire de chaque essai. Le terme de production
 * est celui par défaut du banc, « artefact » (`obtenirTermeProduction`) : « 4 meilleurs artefacts sur 5 évalués ».
 *
 *   cd tests && npx vitest run unit/sentinelle-714-panneau-habiletes-lit-la-note.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerNoteParDefaut } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_PANNEAU = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8');

/** Comme chargerScript, mais expose des fonctions INTERNES de l'IIFE sous `window.__banc`. */
function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = readFileSync(path.join(RACINE, chemin), 'utf8');
    const fin = code.lastIndexOf('})();');
    code = code.slice(0, fin) + '\n;window.__banc = {' + noms.map(n => n + ': ' + n).join(', ') + '};\n' + code.slice(fin);
    const { document: doc, ...autres } = completerNoteParDefaut(globaux);   // 21 oct. 2026 (voir charger-script.js)
    const storage = () => ({ _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d = {}; } });
    const nomsG = ['window', 'document', 'console', 'localStorage', 'sessionStorage', ...Object.keys(autres)];
    new Function(...nomsG, '"use strict";\n' + code)(win, doc, console, storage(), storage(), ...Object.values(autres));
    return win;
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const DA = { STD: '1000002', SOM: '1000001', VIDE: '1000009' };
const ETUDIANTS = [
    { da: DA.SOM, nom: 'Sommative', prenom: 'Alice', groupe: '01', coursId: 'GC1' },
    { da: DA.STD, nom: 'Standards', prenom: 'Bruno', groupe: '01', coursId: 'GC1' },
    { da: DA.VIDE, nom: 'Sansnote', prenom: 'Élie', groupe: '01', coursId: 'GC1' }
];
const E1 = { id: 'E1', nom: 'IDME banc', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#a00' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#a80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#00a' }
] };
const GRILLE = { id: 'G1', nom: 'Grille banc', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 100 }] };

function ev(id, da, productionId, noteFinale, niveauFinal) {
    return { id, etudiantDA: da, productionId, noteFinale, niveauFinal, echelleId: 'E1', grilleId: 'G1',
        ponderationCouverte: 100, verrouillee: true, dateEvaluation: '2026-02-01T12:00:00.000Z',
        statutIntegrite: 'recevable', statutRemise: 'remis',
        criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: niveauFinal, ponderation: 100 }] };
}

/**
 * Standards : cinq artefacts évalués (A1 85 · A2 60 · A3 78 · A4 70 · A5 90), numérotés 1 à 5 dans l'ordre.
 * Le conteneur Portfolio porte `regles.nombreARetenir: 3` — volontairement DIFFÉRENT de la pratique (4) :
 * c'est le « 3 » que le panneau lisait. Pas de terminale : P = moyenne des retenues.
 */
function jeuSTD({ methodeSelection = 'meilleurs', hybride = false, terminale = false, ponderationTerminale = 40, titreA5 = 'Artefact 5' } = {}) {
    const productions = [
        { id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 60, regles: { nombreARetenir: 3, minimumCompletion: 1, nombreTotal: 6 } }
    ];
    if (terminale) productions.push({ id: 'TERM', titre: 'Analyse finale', type: 'terminale', ponderation: ponderationTerminale, numero: 9, dateEcheance: '2026-05-01' });
    const notes = [85, 60, 78, 70, 90];
    notes.forEach((_, i) => productions.push({ id: 'A' + (i + 1), titre: i === 4 ? titreA5 : 'Artefact ' + (i + 1), type: 'artefact-portfolio', numero: i + 1,
        ponderation: 0, dateEcheance: '2026-0' + (i + 1) + '-10', categorie: hybride ? (i === 1 ? 'obligatoire' : 'selection') : undefined }));
    const niveaux = { 85: 'M', 60: 'D', 78: 'M', 70: 'D', 90: 'E' };
    const evaluations = notes.map((n, i) => ev('EV_A' + (i + 1), DA.STD, 'A' + (i + 1), n, niveaux[n]));
    if (terminale) evaluations.push(ev('EV_TERM', DA.STD, 'TERM', 82, 'M'));
    const configuration = { type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E1', grilleId: 'G1',
        portfolio: { utiliser: true, nombreARetenir: 4, minimumCompletion: 1, methodeSelection, reglesConformite: { actif: false } },
        notesFinales: false };
    if (hybride) configuration.categories = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } };
    return {
        pratiqueId: 'std-banc',
        pratiques: [{ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true, configuration }],
        productions, evaluations
    };
}
/** Sommative, AVEC un conteneur Portfolio et des artefacts : le panneau passe ses retours hâtifs. */
function jeuSOM() {
    return {
        pratiqueId: 'som-banc',
        pratiques: [{ id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true,
            configuration: { approcheEvaluation: 'sommative' } }],
        productions: [
            { id: 'PORT', titre: 'Portfolio', type: 'portfolio', ponderation: 0, regles: { nombreARetenir: 3 } },
            { id: 'A1', titre: 'Artefact 1', type: 'artefact-portfolio', ponderation: 40, dateEcheance: '2026-02-01' },
            { id: 'A2', titre: 'Artefact 2', type: 'artefact-portfolio', ponderation: 60, dateEcheance: '2026-03-01' }
        ],
        evaluations: [ev('EV_S1', DA.SOM, 'A1', 84, 'M'), ev('EV_S2', DA.SOM, 'A2', 70, 'D')]
    };
}

const MODULES = ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js',
    'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', 'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-helpers.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-diagnostics.js',
    'js/profil-etudiant-confidentiel.js', 'js/profil-etudiant-sections-affichage.js'];
const EXPORTS_WINDOW = (() => {
    const noms = new Set();
    for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) noms.add(m[1]);
    return [...noms];
})();
function elementDom() {
    const s = new Set();
    return { innerHTML: '', textContent: '', value: '', style: {}, classList: { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle() { return false; } },
        setAttribute() {}, getAttribute() { return null; }, appendChild() {}, addEventListener() {}, removeEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } };
}

function monter(jeu, opts = {}) {
    const store = {
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', nom: 'Groupe 1' },
        test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: jeu.pratiqueId }],
        test_pratiquesConfigurables: clone(jeu.pratiques),
        test_productions: clone(jeu.productions),
        test_evaluationsSauvegardees: clone(jeu.evaluations),
        test_echellesTemplates: [clone(E1)],
        test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: clone(ETUDIANTS),
        test_jugementsDenotation: {},
        test_modalitesEvaluation: {},
        test_portfoliosEleves: {},
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01' }
    };
    const ecritures = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); ecritures.push(k); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); ecritures.push(k); },
        modifier: async () => {}
    };
    const cle = (k) => 'test_' + k;
    const OBJETS = ['indicesCP', 'indicesAssiduite', 'indicesAssiduiteDetailles', 'jugementsDenotation', 'portfoliosEleves', 'modalitesEvaluation'];
    const obtenirDonneesSelonMode = (k) => {
        const kb = k.startsWith('test_') ? k.slice(5) : k;
        if (('test_' + kb) in store) return clone(store['test_' + kb]);
        return OBJETS.includes(kb) ? {} : [];
    };
    const sauvegarderDonneesSelonMode = (k, v) => { store['test_' + k] = clone(v); ecritures.push('test_' + k); return true; };
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom(), readyState: 'complete'
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-09-22' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = {
        document, db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode,
        // L'échappement RÉEL (forme de config.js) : un titre porteur de HTML doit sortir inerte (relecture Cowork, (2)).
        echapperHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'),
        // La note différée (#321), seulement quand l'essai la demande.
        noteDiffereeActive: () => !!opts.differee,
        badgeNoteDifferee: () => '<span class="badge-note-differee">Note différée</span>',
        estEtudiantExclu: (e) => !!(e && e.exclu),
        obtenirPreference: () => null, obtenirSeuil: (n) => ({ 'defiSpecifique': 0.70, 'idme.insuffisant': 0.64, 'idme.developpement': 0.75 })[n],
        chargerSeuilsInterpretation: () => ({}), filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants), genererSeancesCompletes() {},
        afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {}, calculerEtSauvegarderIndicesAssiduite() {},
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
        obtenirPratiqueActiveGroupeCours: fwd('obtenirPratiqueActiveGroupeCours'), lirePointeurPratiqueGroupeCours: fwd('lirePointeurPratiqueGroupeCours'),
        _genererBarresSRPNF: fwd('_genererBarresSRPNF')
    };
    const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', '_exportResultats', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT'];
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
    chargerScript('js/profil-etudiant-rapport.js', globaux, win);
    chargerScript('js/profil-etudiant-diagnostics.js', globaux, win);
    chargerScript('js/profil-etudiant-confidentiel.js', globaux, win);
    chargerAvecInterne('js/profil-etudiant-sections-affichage.js', globaux, win, ['genererSectionPerformance']);

    // La résolution de la pratique active : le code réel de modes.js, dans un bac à part (son init touche le DOM).
    const winModes = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test' };
    chargerScript('js/modes.js', Object.assign({}, globaux, { document }), winModes);
    win.obtenirPratiqueActiveGroupeCours = winModes.obtenirPratiqueActiveGroupeCours;
    win.lirePointeurPratiqueGroupeCours = winModes.lirePointeurPratiqueGroupeCours;

    return { win, store, ecritures };
}

/** Rend le panneau ; lit dans le HTML les lignes de la « Méthodologie de calcul » et l'en-tête. */
function rendre(b, da) {
    const html = b.win.__banc.genererSectionPerformance(da);
    const texte = (re) => { const m = html.match(re); return m ? m[1].replace(/\s+/g, ' ').trim() : null; };
    return {
        html,
        regle: texte(/Règle de sélection :<\/strong>\s*([\s\S]*?)<br>/),
        retenues: texte(/retenu[^<(]*(\([^)]*\)) :<\/strong>/),
        liste: texte(/retenu[^<]*:<\/strong>\s*([^\n<]*)/),
        // `texte` ramène tout blanc à une espace : l'insécable de « 80,8 % » (21 oct. 2026) s'y lit comme une espace.
        calculP: texte(/Calcul de l'indice P :<\/strong>\s*([\s\S]*?)<br>/),
        bloc: texte(/profil-liste-simple[\s\S]*?<strong>• ([^<]*)</)
    };
}

describe('#714 — le panneau « Développement des habiletés » lit la note de la pratique', () => {
    it('Standards « 4 meilleurs » : le panneau dit 4 (la pratique), pas 3 (les regles du conteneur), et nomme les 4 retenues de la note', () => {
        // À la main : meilleures parmi 85, 60, 78, 70, 90 → 90, 85, 78, 70 ; moyenne (90 + 85 + 78 + 70) / 4 = 80,75.
        const b = monter(jeuSTD());
        const r = rendre(b, DA.STD);
        expect(r.regle).toContain('<strong>4 meilleures productions</strong>');   // texte de règle existant, terme fixe
        expect(r.bloc).toContain('(4 meilleurs,');
        expect(r.retenues).toBe('(4 meilleurs artefacts sur 5 évalués)');   // les mots de la carte de la note
        expect(r.liste).toBe('1. Artefact 5 → 90.0/100 • 2. Artefact 1 → 85.0/100 • 3. Artefact 3 → 78.0/100 • 4. Artefact 4 → 70.0/100');
        expect(r.calculP).toBe('Moyenne des 4 artefacts retenus — P = (90 + 85 + 78 + 70) / 4 = <strong>80,8 %</strong>');
        expect(r.html).not.toContain('Calcul impossible');
        // Les retenues du panneau sont celles de la note, par identité.
        const ids = b.win.calculerDetailsNoteFinale(DA.STD).portfolio.artefactsRetenus.map(a => a.productionId).sort();
        expect(ids).toEqual(['A1', 'A3', 'A4', 'A5']);
    });

    it('Standards « récents » : les 4 plus récentes (numéros 2 à 5), pas les meilleures', () => {
        // À la main : récence par numéro → A5, A4, A3, A2 ; moyenne (90 + 70 + 78 + 60) / 4 = 74,5.
        const b = monter(jeuSTD({ methodeSelection: 'recents' }));
        const r = rendre(b, DA.STD);
        expect(r.regle).toContain('<strong>4 plus récentes productions</strong>');
        expect(r.retenues).toBe('(4 plus récents artefacts sur 5 évalués)');
        expect(r.liste).toBe('1. Artefact 5 → 90.0/100 • 2. Artefact 3 → 78.0/100 • 3. Artefact 4 → 70.0/100 • 4. Artefact 2 → 60.0/100');
        expect(r.calculP).toBe('Moyenne des 4 artefacts retenus — P = (90 + 78 + 70 + 60) / 4 = <strong>74,5 %</strong>');
    });

    it('Standards avec terminale : la moyenne des retenues n\'est pas P — la ligne le dit par la formule de la carte', () => {
        const b = monter(jeuSTD({ terminale: true }));
        const r = rendre(b, DA.STD);
        expect(r.calculP).toBe('Moyenne des 4 artefacts retenus = (90 + 85 + 78 + 70) / 4 = <strong>80,8 %</strong> ; P = portfolio × 60 % + terminale × 40 %');
    });

    it('Standards hybride par catégories : 2 meilleures de la Sélection et l\'obligatoire ; aucune addition qui ne redonnerait pas la moyenne pondérée', () => {
        // À la main : Sélection = A1 85, A3 78, A4 70, A5 90 → 2 meilleures : 90, 85. Obligatoire : A2 60.
        const b = monter(jeuSTD({ hybride: true }));
        const r = rendre(b, DA.STD);
        expect(r.regle).toContain('les <strong>2 meilleures</strong> du pool Sélection (65%)');
        expect(r.retenues).toBe('(les 2 meilleures sur 4 évaluées, et 1 obligatoire)');
        expect(r.liste).toBe('1. Artefact 5 → 90.0/100 • 2. Artefact 1 → 85.0/100 • 3. Artefact 2 → 60.0/100');
        expect(r.calculP).toBeNull();
        expect(r.html).not.toContain('Calcul impossible');
    });

    it('Sommative (conteneur Portfolio présent) : aucune phrase de retenue, pas de « Calcul impossible », l\'en-tête P reste', () => {
        const b = monter(jeuSOM());
        expect(b.win.calculerDetailsNoteFinale(DA.SOM)).toBeNull();
        const r = rendre(b, DA.SOM);
        expect(r.html.length).toBeGreaterThan(200);                   // garde de non-vide (règle 10)
        expect(r.html).toContain('Méthodologie de calcul');
        expect(r.html).toContain('profil-valeur-grande-bleu');
        expect(r.html).not.toMatch(/Règle de sélection|retenu|Calcul impossible|Calcul de l'indice P|Performance du portfolio/);
    });

    it('Standards, élève sans évaluation : aucune retenue dite, pas de compte « (0 … sur 0) », et pas de « Calcul impossible »', () => {
        // Relecture Cowork (4) : sans évaluation, la parenthèse du compte n'est pas écrite — la liste dit déjà « Aucun … évalué ».
        const b = monter(jeuSTD());
        const r = rendre(b, DA.VIDE);
        expect(r.html).toContain('Méthodologie de calcul');
        expect(r.retenues).toBeNull();
        expect(r.html).toContain('Artefacts retenus :</strong>');
        expect(r.html).not.toMatch(/\(0 [^)]*sur 0/);
        expect(r.liste).toMatch(/^Aucun artefact évalué/);
        expect(r.calculP).toBeNull();
        expect(r.html).not.toContain('Calcul impossible');
    });

    it('note différée (#321) : aucune note chiffrée, ni dans la liste des retenues ni dans une ligne « Calcul de l\'indice P » — le badge seulement', () => {
        const b = monter(jeuSTD(), { differee: true });
        const r = rendre(b, DA.STD);
        expect(r.retenues).toBe('(4 meilleurs artefacts sur 5 évalués)');   // garde de non-vide : le panneau Standards est bien rendu
        expect(r.calculP).toBeNull();
        const methodo = tranche(r.html, 'Méthodologie de calcul', '</div>');
        expect(methodo).toContain('1. Artefact 5 → <span class="badge-note-differee">Note différée</span>');
        expect(methodo).not.toMatch(/\d+\.\d\/100|\d+\.\d%/);
    });

    it('un titre de production porteur de HTML sort échappé dans la liste des retenues', () => {
        const b = monter(jeuSTD({ titreA5: '<img src=x onerror=alert(1)>' }));
        const r = rendre(b, DA.STD);
        expect(r.html).toContain('1. &lt;img src=x onerror=alert(1)&gt; → 90.0/100');
        expect(r.html).not.toContain('<img src=x');
    });

    it('pondération manquante (erreur ET portfolio rendus) : aucune phrase de retenue, aucune ligne P, pas de « Calcul impossible »', () => {
        const b = monter(jeuSTD({ terminale: true, ponderationTerminale: null }));
        const details = b.win.calculerDetailsNoteFinale(DA.STD);
        expect(details.erreur).toMatch(/Pondération manquante/);          // le cas visé : erreur…
        expect(details.portfolio && details.portfolio.nombreRetenus).toBe(4);   // …ET un portfolio rempli
        const r = rendre(b, DA.STD);
        expect(r.html).toContain('Méthodologie de calcul');                  // garde de non-vide
        expect(r.html).not.toMatch(/Règle de sélection|retenu|Calcul impossible|Calcul de l'indice P|Performance du portfolio/);
    });
});

describe('#714 — rendre le panneau n\'écrit rien', () => {
    it('le stockage est identique avant et après le rendu, pour chaque élève de chaque jeu', () => {
        const cas = [[jeuSTD(), DA.STD], [jeuSTD(), DA.VIDE], [jeuSTD({ hybride: true }), DA.STD], [jeuSOM(), DA.SOM]];
        for (const [jeu, da] of cas) {
            const b = monter(jeu);
            b.win.calculerEtStockerIndicesCP();                          // un indicesCP présent, comme dans l'app
            const avant = JSON.stringify(b.store);
            expect(avant).toContain('test_indicesCP');                   // garde de non-vide : on compare un vrai état
            b.ecritures.length = 0;
            const html = b.win.__banc.genererSectionPerformance(da);
            expect(html).toContain('Méthodologie de calcul');
            expect(b.ecritures).toEqual([]);
            expect(JSON.stringify(b.store)).toBe(avant);
            expect(b.store.test_portfoliosEleves).toEqual({});
        }
    });

    it('sentinelle : ni db.setSync ni calculerEtStockerIndicesCP( dans genererSectionPerformance et ses lecteurs de la note', () => {
        const morceaux = [
            tranche(SOURCE_PANNEAU, 'function _lireNotePourPanneauHabiletes(', '\n}\n'),
            tranche(SOURCE_PANNEAU, 'function _ligneCalculIndicePPanneau(', '\n}\n'),
            tranche(SOURCE_PANNEAU, 'function genererSectionPerformance(', '\n}\n')
        ];
        for (const m of morceaux) {
            expect(m.length).toBeGreaterThan(300);
            expect(m).not.toMatch(/\.setSync\s*\(|\.set\s*\(|calculerEtStockerIndicesCP\s*\(|sauvegarderDonneesSelonMode\s*\(/);
            expect(m).not.toContain('portfoliosEleves');
            expect(m).not.toMatch(/regles\.nombreARetenir|indicesCP\.details/);
        }
        // L'écrivain au rendu est retiré, pas laissé de côté.
        expect(SOURCE_PANNEAU).not.toContain('_appliquerSelectionAutoArtefacts');
        expect(SOURCE_PANNEAU).not.toContain('_lireDetailsRapportPerformance');
    });
});
