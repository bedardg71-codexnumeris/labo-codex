/**
 * Sentinelle — #1117 : SOLO SUIT LE RÉGLAGE (consigne du 19 oct. 2026).
 *
 * Demande de Grégoire : simplifier l'interface de qui n'utilise pas SOLO comme outil de
 * dépistage ; « ça ne donne rien d'avoir un menu avec l'option « aucun » dedans si la taxonomie
 * solo n'est même pas utilisée ». Case « Activer l'observation de la structure des résultats
 * d'apprentissage » (`afficherDescriptionsSOLO`) décochée :
 *
 *   A — le défaut d'un critère neuf : « aucun » réglage désactivé, « multistructurel » activé
 *       (Grégoire, 22 h 05) ; « Apporter mon matériel » écrit « aucun » dans tous les cas (22 h 02) ;
 *   B — « Complexité SOLO du critère » n'est rendu dans aucun des deux éditeurs de grilles, et
 *       MASQUER N'ÉCRIT RIEN : la valeur enregistrée reste, et revient avec la case ;
 *   C — « Palier SOLO du niveau », même règle dans les deux éditeurs d'échelles ;
 *   D — les autres affichages de la complexité d'un critère (cible du profil, badge de
 *       l'intervention) suivent ;
 *   E — #1117, suite (consigne du 20 oct. 2026, verdict C1-C3) : réglage désactivé, le
 *       dépistage examine TOUS les critères (Grégoire, 19 oct., 22 h 21) ; le suivi des
 *       fondations aussi, et la barre le dit (20 oct., 6 h 48, option A) ; les survols du
 *       profil portent le nom du niveau, sans palier SOLO. Réglage activé : rien ne change.
 *       ↻ Le cas D.c d'hier (« `calculerIPB` ne lit pas le réglage ») est RENVERSÉ par la
 *       décision de 6 h 48 : il lit désormais la règle commune `criteresSuiviFondations`.
 *
 * Le parcours réel (enregistrer champ masqué, recharger, recocher) : `tests/integration/
 * solo-suit-le-reglage-1117.spec.js`.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { fige } from './_helpers/modeles-assistant-figes.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { chargerAvecInterne, fauxDocument as fauxDocumentSuivi } from './_helpers/bac-suivi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ------------------------------------------------------------------ harnais */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}
function fauxDocument() {
    const elements = {};
    return {
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} }, createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}
const dbVide = { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync() {},
                 modifier: async () => undefined };

/** Le réglage, modifiable entre deux rendus — comme la case de Réglages. */
function reglage(actif) {
    const etat = { actif };
    const obtenirPreference = (cle) => (cle === 'afficherDescriptionsSOLO' ? etat.actif : null);
    return { etat, obtenirPreference };
}

function monterGrilles(r) {
    const document = fauxDocument();
    const win = chargerScript('js/grilles.js', {
        db: dbVide, document, cle: (k) => 'a2026_' + k, obtenirPreference: r.obtenirPreference,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + 'x', alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    });
    win.estRessourceSupprimee = () => false; win.IDS_GABARITS_HARDCODES = [];
    win.boutonRetirerBloc = () => ''; win.boutonsReordonnerBloc = () => '';
    return { win, liste: () => document.getElementById('listeCriteres').innerHTML };
}

function monterEchelles(r) {
    const conteneurs = {};
    const win = chargerScript('js/echelles.js', {
        db: dbVide, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [], obtenirPreference: r.obtenirPreference,
        afficherNotification: () => {}, afficherSection: () => {}, genererIdUnique: (p) => (p || '') + 'X',
        travauxOutils: { renderPickerCouleur: () => '<input>' },
        document: {
            addEventListener: () => {}, removeEventListener: () => {},
            querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => (conteneurs[id] || (conteneurs[id] = { innerHTML: '', value: '', style: {}, classList: { add() {}, remove() {} } })),
            createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
            body: { appendChild: () => {} }
        },
        boutonsReordonnerBloc: () => '', marquerChampRefuseEchelle: () => {},
        obtenirPlaceholderNiveau: () => ({ code: '', nom: '' })
    });
    win.boutonsReordonnerBloc = () => ''; win.boutonRetirerBloc = () => '';
    win.marquerChampRefuseEchelle = () => {};
    win.travauxOutils = { renderPickerCouleur: () => '<input>' };
    return { win, conteneurs };
}

const MENU_CRITERE = 'data-champ="niveauSOLO"';

/* ------------------------------------------------- A — le défaut d'un critère neuf */

describe('#1117 · A — le défaut d\'un critère neuf suit le réglage', () => {
    it('A.a la règle, fonction pure : activé → multistructurel, désactivé → aucun', () => {
        const { win } = monterGrilles(reglage(true));
        expect(win.niveauSOLOCritereNeuf(true)).toBe('multistructurel');
        expect(win.niveauSOLOCritereNeuf(false)).toBe('aucun');
    });

    it('A.b « + Ajouter un critère » (grille en création) écrit la valeur du réglage du moment', () => {
        const r = reglage(false);
        const { win } = monterGrilles(r);
        win.tempTypeGrille = '';
        win.tempCriteres = [];
        win.ajouterCritereTemp();
        expect(win.tempCriteres[0].niveauSOLO).toBe('aucun');
        r.etat.actif = true;
        win.ajouterCritereTemp();
        expect(win.tempCriteres[1].niveauSOLO).toBe('multistructurel');
    });

    it('A.c les TROIS chemins de création à la main passent par la règle — aucun n\'écrit sa valeur en dur', () => {
        const code = sansCommentaires(source('js/grilles.js'));
        expect(code.split('niveauSOLO: niveauSOLOCritereNeuf(observationSOLOActive())').length - 1).toBe(3);
        expect(code).not.toMatch(/niveauSOLO:\s*'(aucun|multistructurel)'/);
    });

    it('A.d « Apporter mon matériel » écrit « aucun » à chaque critère, réglage activé compris', () => {
        const fenetre = new JSDOM('<!doctype html><html><body></body></html>').window;
        const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetre.DOMParser, obtenirPreference: () => true });
        chargerScript('js/materiel-assistant.js', {}, w);
        w.cle = (k) => 'a2032_' + k;
        let n = 0;
        for (const modele of [fige('lot 3a · l’exemple'), fige('étape 5 · simple')]) {
            const criteres = w.materielAssistant.construire(modele, { id: (p) => p + (++n), maintenant: 'x' }).grille.criteres;
            expect(criteres.length).toBeGreaterThan(0);
            expect(criteres.every((c) => c.niveauSOLO === 'aucun')).toBe(true);
        }
    });
});

/* -------------------------------------------- B — les deux éditeurs de grilles */

describe('#1117 · B — « Complexité SOLO du critère » suit le réglage, et masquer n\'écrit rien', () => {
    const grille = () => ({ id: 'G1', criteres: [
        { id: 'C1', nom: 'Thèse', type: 'holistique', ponderation: 50, niveauSOLO: 'relationnel' },
        { id: 'C2', nom: 'Langue', type: 'holistique', ponderation: 50 }
    ] });

    it('B.a grille existante : désactivé, ni menu, ni étiquette, ni aide ; activé, les deux menus avec leurs valeurs', () => {
        const r = reglage(false);
        const { win, liste } = monterGrilles(r);
        const g = grille();
        win.afficherCriteresGrille(g);
        expect(liste()).toContain('Thèse');                     // l'éditeur est bien rendu
        expect(liste()).not.toContain(MENU_CRITERE);
        expect(liste()).not.toContain('Complexité SOLO du critère');
        expect(liste()).not.toContain('grille-niveau-solo');
        // ⛔ Masquer n'écrit rien : ni « aucun » par-dessus « relationnel », ni une valeur sur le critère sans étiquette.
        expect(g.criteres[0].niveauSOLO).toBe('relationnel');
        expect('niveauSOLO' in g.criteres[1]).toBe(false);

        r.etat.actif = true;
        win.afficherCriteresGrille(g);
        const menus = liste().split(MENU_CRITERE);
        expect(menus.length).toBe(3);
        expect(menus[1]).toContain('<option value="relationnel" selected>');
        expect(menus[2]).toContain('<option value="multistructurel" selected>');
    });

    it('B.b grille en création : même règle', () => {
        const r = reglage(false);
        const { win, liste } = monterGrilles(r);
        win.tempTypeGrille = '';
        win.tempCriteres = grille().criteres;
        win.afficherCriteresTemp();
        expect(liste()).toContain('Thèse');
        expect(liste()).not.toContain(MENU_CRITERE);
        expect(win.tempCriteres[0].niveauSOLO).toBe('relationnel');
        r.etat.actif = true;
        win.afficherCriteresTemp();
        expect(liste().split(MENU_CRITERE).length).toBe(3);
        expect(liste()).toContain('<option value="relationnel" selected>');
    });
});

/* ------------------------------------------- C — les deux éditeurs d'échelles */

describe('#1117 · C — « Palier SOLO du niveau » suit le réglage', () => {
    const niveaux = () => [
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 79.5, niveauSOLO: 'relationnel' },
        { code: 'D', nom: 'Développement', min: 65, max: 74, valeurCalcul: 69.5 }
    ];

    it('C.a échelle en création : désactivé, pas de champ, valeurs intactes ; activé, le champ revient avec la sienne', () => {
        const r = reglage(false);
        const { win, conteneurs } = monterEchelles(r);
        win._niveauxNouvelleEchelle = niveaux();
        win.afficherNiveauxNouvelleEchelle();
        const html = conteneurs.tableauNiveauxEchelle.innerHTML;
        expect(html).toContain('Maîtrisé');
        expect(html).not.toContain('data-champ="niveauSOLO"');
        expect(html).not.toContain('Palier SOLO du niveau');
        expect(win._niveauxNouvelleEchelle[0].niveauSOLO).toBe('relationnel');
        expect('niveauSOLO' in win._niveauxNouvelleEchelle[1]).toBe(false);

        r.etat.actif = true;
        win.afficherNiveauxNouvelleEchelle();
        const reactive = conteneurs.tableauNiveauxEchelle.innerHTML;
        expect(reactive.split('data-champ="niveauSOLO"').length - 1).toBe(2);
        expect(reactive).toContain('<option value="relationnel" selected>');
    });

    it('C.b échelle enregistrée (`ligneNiveauEchelleHtml`) : même règle', () => {
        const r = reglage(false);
        const { win } = monterEchelles(r);
        const n = niveaux()[0];
        const attrs = 'data-on-change="modifierNiveauEchelleHandler" data-niveau-index="0"';
        const masque = win.ligneNiveauEchelleHtml(n, attrs, {}, '');
        expect(masque).toContain('data-champ="code"');
        expect(masque).not.toContain('data-champ="niveauSOLO"');
        expect(n.niveauSOLO).toBe('relationnel');
        r.etat.actif = true;
        expect(win.ligneNiveauEchelleHtml(n, attrs, {}, '')).toContain('<option value="relationnel" selected>');
    });

    it('C.c le modèle d\'échelle par défaut garde ses paliers SOLO — seul l\'affichage change', () => {
        const code = sansCommentaires(source('js/echelles.js'));
        for (const v of ['unistructurel', 'multistructurel', 'relationnel', 'abstrait_etendu']) {
            expect(code).toContain("niveauSOLO: '" + v + "',");
        }
    });
});

/* ------------------------------- D — les autres affichages ; le calcul ne bouge pas */

describe('#1117 · D — les autres affichages de la complexité suivent ; le dépistage lit ce qui est enregistré', () => {
    function monterProfil(r) {
        const stubs = {
            db: dbVide, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
            obtenirDonneesSelonMode: () => [], obtenirPreference: r.obtenirPreference, obtenirEtudiantsCoursActif: () => [],
            obtenirGrilleReferenceDepistage: () => null
        };
        const win = chargerScript('js/profil-etudiant-helpers.js', stubs);
        stubs.estCritereSurveilleParDepistage = win.estCritereSurveilleParDepistage;
        stubs.criteresSurveillesParDepistage = win.criteresSurveillesParDepistage;
        chargerScript('js/profil-etudiant-calculs.js', stubs, win);
        return win;
    }

    it('D.a la cible du profil nomme le défi sans son étiquette quand le réglage est désactivé', () => {
        const r = reglage(false);
        const win = monterProfil(r);
        expect(win.nommerDefiAvecSOLO({ nom: 'Thèse', niveauSOLO: 'relationnel' })).toBe('Thèse');
        expect(win.nommerDefiAvecSOLO({ nom: 'Thèse' })).toBe('Thèse');
        r.etat.actif = true;
        expect(win.nommerDefiAvecSOLO({ nom: 'Thèse', niveauSOLO: 'relationnel' })).toBe('Thèse (relationnel)');
        // `libelleNiveauSOLO` reste une table : elle ne lit pas le réglage.
        r.etat.actif = false;
        expect(win.libelleNiveauSOLO('relationnel')).toBe('relationnel');
    });

    it('D.b le badge du formulaire d\'intervention lit le réglage', () => {
        const code = sansCommentaires(source('js/interventions.js'));
        expect(code).toContain("var soloActive = typeof obtenirPreference !== 'function' || obtenirPreference('afficherDescriptionsSOLO') !== false;");
        expect(code).toMatch(/var badgeSolo = niveauLabel && soloActive\s*\?/);
    });

    it('D.c ↻ (20 oct.) `calculerIPB` lit la règle commune du suivi des fondations, sans garde locale', () => {
        const code = sansCommentaires(source('js/profil-etudiant-calculs.js'));
        const debut = code.indexOf('function calculerIPB(');
        expect(debut).toBeGreaterThan(0);
        const corps = code.slice(debut, code.indexOf('\nfunction ', debut + 10));
        expect(corps).toContain('var criteresMulti = criteresSuiviFondations(grille);');
        expect(corps).not.toContain('afficherDescriptionsSOLO');
        expect(corps).not.toContain("'multistructurel'");
    });
});

/* ------------------------- E — #1117, suite : le dépistage, le suivi des fondations, les survols */

const DA = '2000001';
const SEUILS = { defiSpecifique: 0.70, progressionArtefacts: 0.10, directionRisque: 0.05,
    'idme.insuffisant': 0.64, 'idme.developpement': 0.75, 'idme.maitrise': 0.85 };
const ECHELLE = { id: 'EG', nom: 'IDME', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64.99, valeurCalcul: '40' },
    { code: 'D', nom: 'En développement', min: 65, max: 74.99, valeurCalcul: '65' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, valeurCalcul: '75' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: '100' }
] };
// Structure et Rigueur multistructurelles, Nuance relationnelle, Méthode « Aucun ».
const GRILLE = { id: 'G1', nom: 'Grille banc #1117', echelleId: 'EG', criteres: [
    { id: 'c1', nom: 'Structure', type: 'holistique', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Rigueur', type: 'holistique', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c3', nom: 'Nuance', type: 'holistique', ponderation: 20, niveauSOLO: 'relationnel' },
    { id: 'c4', nom: 'Méthode', type: 'holistique', ponderation: 20, niveauSOLO: 'aucun' }
] };
// La grille d'« Apporter mon matériel » : tous ses critères à « Aucun ».
const TOUT_AUCUN = { id: 'G0', nom: 'Grille apportée', echelleId: 'EG',
    criteres: GRILLE.criteres.map(c => Object.assign({}, c, { niveauSOLO: 'aucun' })) };
const PRODUCTIONS = [{ id: 'P1', titre: 'Un' }, { id: 'P2', titre: 'Deux' }, { id: 'P3', titre: 'Trois' }];
function copie(id, pid, date, grilleId) {
    return { id, etudiantDA: DA, productionId: pid, echelleId: 'EG', grilleId, dateEvaluation: date, noteFinale: 68,
        retroactionFinale: 'Rétroaction de banc.',
        criteres: [
            { critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 30 },
            { critereId: 'c2', critereNom: 'Rigueur', niveauSelectionne: 'M', ponderation: 30 },
            { critereId: 'c3', critereNom: 'Nuance', niveauSelectionne: 'D', ponderation: 20 },
            { critereId: 'c4', critereNom: 'Méthode', niveauSelectionne: 'I', ponderation: 20 }
        ] };
}

/** helpers + calculs dans un même window, réglage SOLO modifiable entre deux appels. */
function monterDepistage(r, grille) {
    let win = null;
    const evaluations = ['P1', 'P2', 'P3'].map((p, i) => copie('E' + i, p, '2026-0' + (i + 2) + '-01', grille.id));
    const stubs = {
        calculerMoyennesCriteres: (da) => win.calculerMoyennesCriteres(da),
        db: { get: async () => null, getSync: (k, d) => (k === 'test_echellesTemplates' ? [ECHELLE] : k === 'test_grillesTemplates' ? [grille] : (d !== undefined ? d : null)),
            set: async () => {}, setSync() {}, modifier: async () => undefined },
        cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? evaluations : quoi === 'productions' ? PRODUCTIONS : []),
        obtenirPreference: (k) => (k === 'afficherDescriptionsSOLO' ? r.etat.actif : k === 'grilleReferenceDepistage' ? grille.id : null),
        obtenirEtudiantsCoursActif: () => [], afficherNotificationCopiee() {}, afficherSection() {}, afficherSousSection() {},
        calculerTousLesIndices: () => ({ A: 1, C: 1, P: 0.70, M: 0, E: 0 }),
        obtenirSeuil: (n) => SEUILS[n], chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (arr) => arr, estModeeLectureSeule: () => false,
        genererSeancesCompletes() {}, calculerEtSauvegarderIndicesAssiduite() {}, calculerEtStockerIndicesCP() {},
        obtenirGrilleReferenceDepistage: () => grille,
        obtenirNombreProductionsPourPatterns: () => 3, obtenirIdsProductionsEvaluables: () => PRODUCTIONS.map(p => p.id)
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    stubs.estCritereSurveilleParDepistage = win.estCritereSurveilleParDepistage;
    stubs.criteresSurveillesParDepistage = win.criteresSurveillesParDepistage;
    stubs.criteresSuiviFondations = win.criteresSuiviFondations;
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
    chargerPredicatsCopie(win);
    return win;
}

/** Le tableau de bord, sur les VRAIES règles de helpers. */
function monterTableauBord(h) {
    const win = { pluriel: (n, s, p) => (n > 1 ? p : s) };
    chargerAvecInterne('js/tableau-bord-apercu.js', {
        db: dbVide, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s).replace(/</g, '&lt;'),
        document: fauxDocumentSuivi({}, {}),
        criteresSuiviFondations: h.criteresSuiviFondations, etiquettesSOLOLuesParDepistage: h.etiquettesSOLOLuesParDepistage
    }, win, ['_tousEtudiantsEnrichis', 'genererInterpretationSuiviFondamentaux']);
    return { f: win.libelleCriteresMultiSurveilles, i: win.__audit['tableau-bord-apercu.js'] };
}

describe('#1117 · E — réglage désactivé : le dépistage et le suivi des fondations lisent tous les critères', () => {
    it('E.a la règle des défis : « Aucun » n\'exclut que si l\'observation SOLO est activée', () => {
        const r = reglage(true);
        const win = monterDepistage(r, GRILLE);
        expect(win.estCritereSurveilleParDepistage({ nom: 'X', niveauSOLO: 'aucun' })).toBe(false);
        expect(win.criteresSurveillesParDepistage(GRILLE).map(c => c.nom)).toEqual(['Structure', 'Rigueur', 'Nuance']);
        expect(win.trouverCritereDepistage('Méthode', GRILLE)).toBeNull();
        r.etat.actif = false;
        expect(win.estCritereSurveilleParDepistage({ nom: 'X', niveauSOLO: 'aucun' })).toBe(true);
        expect(win.estCritereSurveilleParDepistage(null)).toBe(false);
        expect(win.criteresSurveillesParDepistage(GRILLE).map(c => c.nom)).toEqual(['Structure', 'Rigueur', 'Nuance', 'Méthode']);
        expect(win.trouverCritereDepistage('Méthode', GRILLE).id).toBe('c4');
    });

    it('E.b `calculerIPB` : activé, Structure et Rigueur, comme avant ; désactivé, les quatre critères', () => {
        const r = reglage(true);
        const win = monterDepistage(r, GRILLE);
        const avant = win.calculerIPB(DA);
        expect(avant.criteresMulti).toEqual(['structure', 'rigueur']);
        expect(avant.scoreActuel).toBeCloseTo(0.75, 10);   // (0,75 × 30 + 0,75 × 30) / 60
        expect(avant.ipb).toBe(0);
        expect(avant.criteresEnDefi).toEqual([]);
        r.etat.actif = false;
        const tous = win.calculerIPB(DA);
        expect(tous.criteresMulti).toEqual(['structure', 'rigueur', 'nuance', 'methode']);
        expect(tous.scoreActuel).toBeCloseTo((0.75 * 30 + 0.75 * 30 + 0.65 * 20 + 0.40 * 20) / 100, 10);   // 0,66 < 0,70
        expect(tous.ipb).toBe(3);
        expect(tous.criteresEnDefi).toEqual(['nuance', 'methode']);
        // Recochée : la lecture d'avant revient, à la lettre.
        r.etat.actif = true;
        expect(win.calculerIPB(DA)).toEqual(avant);
    });

    it('E.c une grille toute « Aucun » choisie pour le dépistage : désactivé, des défis et un IPB ; activé, rien, comme avant', () => {
        const r = reglage(false);
        const win = monterDepistage(r, TOUT_AUCUN);
        const d = win.diagnostiquerForcesChallenges(win.calculerMoyennesCriteres(DA));
        expect(d.defis.map(c => c.nom)).toEqual(['Méthode', 'Nuance']);
        expect(win.identifierDefiSpecifique(DA).defi).toBe('Méthode');
        expect(win.calculerIPB(DA).criteresMulti).toEqual(['structure', 'rigueur', 'nuance', 'methode']);
        r.etat.actif = true;
        expect(win.calculerMoyennesCriteres(DA)).toBeNull();
        expect(win.identifierDefiSpecifique(DA)).toEqual({ defi: 'Aucun', score: null });
        expect(win.calculerIPB(DA)).toBeNull();
    });

    it('E.d le sous-titre de la barre lit la même règle que l\'IPB, et le dit réglage désactivé', () => {
        const r = reglage(true);
        const h = monterDepistage(r, GRILLE);
        const { f } = monterTableauBord(h);
        expect(f(GRILLE)).toBe('Critères multistructurels surveillés : Structure, Rigueur');
        expect(f(TOUT_AUCUN)).toBe('Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien.');
        r.etat.actif = false;
        expect(f(GRILLE)).toBe('Observation SOLO désactivée : tous les critères sont surveillés (Structure, Rigueur, Nuance, Méthode).');
        expect(f(TOUT_AUCUN)).toBe('Observation SOLO désactivée : tous les critères sont surveillés (Structure, Rigueur, Nuance, Méthode).');
        expect(f({ criteres: [{ nom: '<b>' }] })).toBe('Observation SOLO désactivée : tous les critères sont surveillés (&lt;b>).');
        expect(f(null)).toBe('');
        expect(f({ criteres: [] })).toBe('');
        // Ce que la barre annonce est ce que le calcul lit.
        expect(h.calculerIPB(DA).criteresMulti.length).toBe(4);
        expect(sansCommentaires(source('js/tableau-bord-apercu.js'))).toContain('var noms = criteresSuiviFondations(grille).map(');
    });

    it('E.e la phrase du bilan : « les fondamentaux multistructurels » activé, « les fondamentaux » désactivé', () => {
        const r = reglage(true);
        const { i } = monterTableauBord(monterDepistage(r, GRILLE));
        i._tousEtudiantsEnrichis = [{ suivi: { diagnostic: 'Maîtrise acquise' } }];
        expect(i.genererInterpretationSuiviFondamentaux()).toContain('1 étudiant·e (100%) maîtrise les fondamentaux multistructurels');
        r.etat.actif = false;
        const bilan = i.genererInterpretationSuiviFondamentaux();
        expect(bilan).toContain('1 étudiant·e (100%) maîtrise les fondamentaux');
        expect(bilan).not.toMatch(/multistructurel/i);
    });
});

describe('#1117 · E — les survols du profil : réglage désactivé, le nom du niveau, sans palier SOLO', () => {
    const NIVEAU_ETIQUETE = { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, niveauSOLO: 'relationnel' };
    const NIVEAU_NU = { code: 'D', nom: 'En développement', min: 65, max: 74.99 };

    it('E.f `survolNiveauAtteint` : activé, le palier ou l\'invitation, comme avant ; désactivé, le nom seul', () => {
        const r = reglage(true);
        const win = monterDepistage(r, GRILLE);
        win.NIVEAUX_SOLO_ECHELLE = [{ valeur: 'relationnel', libelle: 'Relationnel', description: 'Relie les éléments.' }];
        const lecture = win.interpreterNiveauAtteint(NIVEAU_ETIQUETE);
        const etiquete = win.survolNiveauAtteint(NIVEAU_ETIQUETE);
        expect(lecture.interpretee).toBe(true);
        expect(etiquete).toBe('Relationnel — Relie les éléments.');
        expect(win.survolNiveauAtteint(NIVEAU_NU)).toContain('associe une étiquette SOLO');
        r.etat.actif = false;
        expect(win.survolNiveauAtteint(NIVEAU_ETIQUETE)).toBe('Maîtrisé');
        expect(win.survolNiveauAtteint(NIVEAU_NU)).toBe('En développement');
        expect(win.survolNiveauAtteint({ code: 'X' })).toBe('X');
        expect(win.survolNiveauAtteint(null)).toBe('');
    });

    it('E.g les deux survols du profil passent par lui : la note globale et la lecture par critère', () => {
        const helpers = sansCommentaires(source('js/profil-etudiant-helpers.js'));
        const debut = helpers.indexOf('function lireNiveauNoteGlobale(');
        const corps = helpers.slice(debut, helpers.indexOf('\nfunction ', debut + 10));
        expect(corps).toContain('survol: survolNiveauAtteint(niveau)');
        expect(corps).not.toContain('interpreterNiveauAtteint(');
        const affichage = sansCommentaires(source('js/profil-etudiant-sections-affichage.js'));
        expect(affichage).toContain('? survolNiveauAtteint(niveauCritere)');
        expect(affichage).not.toContain('lectureSOLOCritere');
    });
});
