/**
 * #1055 (15 oct. 2026) — LA PRODUCTION DIAGNOSTIQUE : LA CASE NE SE REPORTE PLUS, ET UN DIAGNOSTIC
 * NE SE LIT JAMAIS COMME UNE PRODUCTION ORDINAIRE.
 *
 * Grégoire, 15 oct., 14 h 00 : « Si l'enseignant décide qu'une production est un diagnostic, il ne
 * faudrait pas que les résultats de ce diagnostic apparaissent dans la compilation des notes de
 * l'élève, ou dans les graphiques de complétion, ou dans l'évolution de la progression étudiante
 * dans le profil. Il faut vraiment, si c'est un diagnostic, qu'elle soit vue et lue autrement
 * qu'une production ordinaire. »
 *
 * Ce banc élargit `sentinelle-790-production-diagnostique-quatre-portes` (les quatre portes du
 * 7 sept.) aux sites qui compilent, comptent ou tracent, et à la marque.
 *   A — l'entité porte la marque, avec le mot de la case ;
 *   B — partie 1 : une fiche neuve ne reprend jamais la case de la précédente, par chaque chemin ;
 *   C — les captures : le C historique et le C du groupe ne lisent pas le diagnostic ;
 *   D — chaque site corrigé passe par l'entité (verrou structurel, fonction par fonction) ;
 *   E — la marque s'affiche là où la production paraît parmi les autres.
 * Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

function entite() {
    const w = {};
    new Function('window', source('js/entites/production-diagnostique.js'))(w);
    return w.ProductionDiagnostique;
}

/** Le corps d'une fonction, de sa déclaration à la déclaration suivante du même fichier. */
function corps(rel, nom) {
    const src = source(rel);
    const depuis = tranche(src, `function ${nom}(`, undefined, { longueurMin: 40 });
    const suivante = depuis.slice(10).search(/\n\s*(?:async )?function /);
    return suivante === -1 ? depuis : depuis.slice(0, 10 + suivante);
}

/* ------------------------------------------------------------------ A — la marque */

describe('#1055 · A — l\'entité porte la marque, avec le mot de la case', () => {
    const dsp = entite();

    it('une production diagnostique porte la marque ; une ordinaire, rien', () => {
        expect(dsp.marqueHTML({ id: 'P1', diagnostique: true })).toContain('class="marque-diagnostique"');
        expect(dsp.marqueHTML({ id: 'P1', diagnostique: true })).toContain('>' + dsp.MOT + '<');
        expect(dsp.marqueHTML({ id: 'P2' })).toBe('');
        expect(dsp.marqueHTML(null)).toBe('');
        expect(dsp.marqueHTML({ id: 'P3', diagnostique: 'true' }), 'seul le booléen compte, comme estDiagnostique').toBe('');
    });

    it('le mot est celui de la case de la fiche, sans mot neuf', () => {
        expect(dsp.MOT).toBe('Diagnostique');
        const caseFiche = tranche(source('index.html'), '<label class="prod-marqueur-diagnostique" for="productionDiagnostique">', '</label>');
        expect(caseFiche).toContain('Travail diagnostique — ne compte dans aucun calcul');
        expect(dsp.marqueHTML({ diagnostique: true })).toContain('title="Travail diagnostique — ne compte dans aucun calcul"');
    });

    it('la marque a son style, et il ne lit que des variables qui existent', () => {
        const css = source('styles.css');
        const regle = tranche(css, '.marque-diagnostique {', '}');
        for (const v of regle.match(/var\(--[\w-]+\)/g)) {
            const nom = v.slice(4, -1);
            expect(css, `${nom} n'est défini nulle part`).toContain(nom + ':');
        }
    });
});

/* ------------------------------------------------------------------ B — partie 1 */

function champ(extra = {}) {
    return Object.assign({
        value: '', textContent: '', innerHTML: '', checked: false,
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        setAttribute() {}, getAttribute: () => null, addEventListener() {},
        querySelectorAll: () => [], querySelector: () => null, style: {}, closest: () => null
    }, extra);
}

function chargerFormulaire() {
    const els = {};
    ['productionActivite', 'productionTitre', 'productionType', 'productionPonderation', 'productionGrille',
     'productionEchelle', 'productionCartouche', 'titreFormEvaluation', 'accueilProductions', 'formulaireProduction',
     'btnDupliquerProduction', 'btnSupprimerProduction', 'panneauMetadonneesProduction', 'champsPortfolio',
     'productionDateEcheance', 'productionContexte', 'champsPersonnalisesListe', 'checkboxesPratiquesProduction',
     'portfolioNombreRetenir', 'portfolioMinimumCompleter'].forEach((id) => { els[id] = champ(); });
    // La fiche précédente était une production diagnostique : la case est restée cochée à l'écran.
    els.productionDiagnostique = champ({ checked: true });
    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [], genererCheckboxesPratiques: () => '' },
        alert: () => {}, genererIdUnique: (p) => p + '1',
        document: { getElementById: (id) => els[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => champ(), addEventListener() {} }
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/productions.js', { ...globaux, productionEnEdition: null }, win);
    chargerScript('js/productions-liste.js', {
        ...globaux, productionEnEdition: null,
        gererChangementTypeProduction: () => {}, chargerGrillesDisponiblesPourProduction: async () => {}, setTimeout: () => 0
    }, win);
    return { win, els };
}

describe('#1055 · B — une fiche neuve ne reprend jamais la case de la précédente', () => {
    it('« + Nouvelle production » (productions-liste.js) : la case revient décochée', async () => {
        const { win, els } = chargerFormulaire();
        expect(els.productionDiagnostique.checked, 'témoin : la case de la fiche précédente est cochée').toBe(true);
        await win.creerNouvelleProduction();
        expect(els.productionDiagnostique.checked).toBe(false);
    });

    it('la remise à neuf commune (fiche d\'ajout, ajout par type) : la case revient décochée', () => {
        const { win, els } = chargerFormulaire();
        win.reinitialiserFormulaireProduction();
        expect(els.productionDiagnostique.checked).toBe(false);
    });

    it('les deux chemins d\'ajout passent par la même remise à neuf, et elle seule porte la liste des champs', () => {
        const nouvelle = corps('js/productions-liste.js', 'creerNouvelleProduction');
        expect(nouvelle).toContain('window.reinitialiserFormulaireProduction()');
        expect(nouvelle, 'une liste de champs propre à ce chemin est revenue').not.toMatch(/getElementById\('production\w+'\)\.value = ''/);
        expect(corps('js/productions.js', 'afficherFormProduction')).toContain('reinitialiserFormulaireProduction();');
        expect(corps('js/productions.js', 'ajouterProductionAuType')).toContain('await afficherFormProduction(null);');
        expect(corps('js/productions.js', 'reinitialiserFormulaireProduction')).toMatch(/getElementById\('productionDiagnostique'\)[\s\S]*\.checked = false/);
    });
});

/* ------------------------------------------------------------------ C — les captures */

const REMET = '2000001', NE_REMET_PAS = '2000002';
const ELEVES = [{ da: REMET, nom: 'Fictif', prenom: 'Ana', groupe: '01' }, { da: NE_REMET_PAS, nom: 'Fictif', prenom: 'Bea', groupe: '01' }];
const ev = (id, da, prod) => ({ id, etudiantDA: da, productionId: prod, niveauFinal: 'D', noteFinale: 70, verrouillee: true, ponderationCouverte: 100, dateEvaluation: '2026-03-10' });

async function capturer(productions, evaluations) {
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: productions, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? clone(store[k]) : null),
        set: async (k, v) => { store[k] = clone(v); }, useIndexedDB: false, memoryCache: new Map(),
        modifier: async (k, mutateur, d = null) => { const r = await mutateur(k in store ? clone(store[k]) : d); if (r !== undefined) store[k] = clone(r); return r; } };
    const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
    chargerPredicatsCopie(win);
    chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
        obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
        calculerAssiduite: () => ({ indice: 1, periodesPresentes: 20, periodesOffertes: 20, nombreSeances: 10 }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}),
        obtenirEtudiantsCoursActif: () => clone(ELEVES), estEtudiantExclu: () => false,
        notifications: { succes() {}, erreur() {}, info() {} } }, win);
    return win.capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 });
}

describe('#1055 · C — les captures ne lisent pas le travail diagnostique', () => {
    // Le diagnostic est le DERNIER travail dû (semaine 1 chez Grégoire) et seule Ana l'a remis ;
    // l'ordinaire, dû avant, a été remis par les deux.
    const ORDINAIRE = { id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-02-01' };
    const DIAG = { id: 'PD', titre: 'Portrait de lecteur', type: 'travail', dateEcheance: '2026-03-01', diagnostique: true };
    const copies = [ev('E1', REMET, 'P1'), ev('E2', NE_REMET_PAS, 'P1'), ev('E3', REMET, 'PD')];

    it('le C historique de l\'élève ne compte pas le diagnostic dû (avant : Bea à 50 %)', async () => {
        const s = await capturer([ORDINAIRE, DIAG], copies);
        const bea = s.etudiants.find((e) => e.da === NE_REMET_PAS);
        expect(bea.C).toBe(100);
    });

    it('le C du groupe se lit sur le dernier travail ORDINAIRE dû (avant : 50 %, le taux du diagnostic)', async () => {
        const s = await capturer([ORDINAIRE, DIAG], copies);
        expect(s.groupe.moyenneC).toBe(100);
    });

    it('TÉMOIN : décochée, la même production redevient due et dernière', async () => {
        const s = await capturer([ORDINAIRE, Object.assign({}, DIAG, { diagnostique: false })], copies);
        expect(s.etudiants.find((e) => e.da === NE_REMET_PAS).C).toBe(50);
        expect(s.groupe.moyenneC).toBe(50);
    });
});

/* ------------------------------------------------------------------ D — chaque site, par l'entité */

describe('#1055 · D — chaque site qui compile, compte ou trace passe par l\'entité', () => {
    // [fichier, fonction, ce qu'elle doit appeler] — un site qui retire l'appel rougit ici.
    const SITES = [
        ['js/snapshots.js', 'calculerIndicesHistoriques', 'ProductionDiagnostique.filtrerProductions(productions)'],
        ['js/snapshots.js', 'capturerSnapshotSeance', 'ProductionDiagnostique.filtrerProductions(productions)'],
        ['js/profil-etudiant-sections-affichage.js', 'genererSectionMobilisationEngagement', 'ProductionDiagnostique.filtrerProductions('],
        ['js/profil-etudiant-sections-affichage.js', 'genererSectionAccompagnement', 'ProductionDiagnostique.filtrerEvaluations('],
        ['js/profil-etudiant-sections-affichage.js', 'calculerDirectionsCriteres', 'ProductionDiagnostique.filtrerEvaluations(evaluations'],
        ['js/profil-etudiant-sections-affichage.js', '_genererGraphiqueCriteresHTML', 'ProductionDiagnostique.filtrerEvaluations('],
        ['js/graphiques-progression.js', 'obtenirDonneesCriteres', 'ProductionDiagnostique.filtrerEvaluations('],
        ['js/graphiques-progression.js', 'chargerProductionsTrajectoires', 'ProductionDiagnostique.filtrerProductions(productions)'],
        ['js/tableau-bord-apercu.js', 'afficherMetriquesGlobales', 'ProductionDiagnostique.filtrerEvaluations(evaluations'],
        ['js/etudiants.js', 'compterEvaluationsPourMinimum', 'ProductionDiagnostique.filtrerProductions('],   // lot 2 std sans portfolio (29 oct.) : le compte « ≥ Min. » sorti de la liste
        ['js/comparateur-pratiques.js', '_donnees', 'ProductionDiagnostique.filtrerEvaluations('],
    ];
    for (const [rel, nom, appel] of SITES) {
        it(`${rel} › ${nom}`, () => {
            expect(corps(rel, nom)).toContain(appel);
        });
    }

    it('le « sur N » de l\'Accompagnement compte les copies sans le diagnostic (entrée 6.65 de #1083)', () => {
        const c = corps('js/profil-etudiant-sections-affichage.js', 'genererSectionAccompagnement');
        expect(c).toMatch(/const copiesSansDiagnostique = window\.ProductionDiagnostique\.filtrerEvaluations\(/);
        expect(c).toMatch(/const evaluationsDA = copiesSansDiagnostique\.filter\(/);
    });

    it('l\'export de recherche : la distribution par critère ne compte pas le diagnostic', () => {
        expect(source('js/trimestres.js')).toMatch(/performance_par_critere: calculerPerformanceParCritere\(etudiantsActifs,\s*window\.ProductionDiagnostique\.filtrerEvaluations\(evaluations, productions\)/);
    });

    it('la moyenne de la Liste des évaluations écarte la ligne diagnostique, qui reste affichée', () => {
        const filtres = corps('js/liste-evaluations.js', 'afficherTableauEvaluations');
        expect(filtres).toMatch(/const evaluationsRecevables = lignesFiltrees\.filter\(ligne =>[\s\S]*?&& !ligne\.diagnostique\s*\)/);
        const charge = corps('js/liste-evaluations.js', 'construireLignesEvaluations');
        expect((charge.match(/diagnostique: window\.ProductionDiagnostique\.estDiagnostique\(production\)/g) || []).length).toBe(2);
    });
});

/* ------------------------------------------------------------------ E — vue autrement */

describe('#1055 · E — la marque s\'affiche là où la production paraît parmi les autres', () => {
    it('Liste des évaluations : la ligne d\'une copie diagnostique porte la marque, une ordinaire non', () => {
        const dsp = entite();
        const win = chargerScript('js/liste-evaluations.js', {
            db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t),
            obtenirLibelleStatut: (s) => 'Statut ' + s, obtenirDonneesSelonMode: () => [],
            notifications: { succes() {}, erreur() {}, info() {}, warning() {} }
        });
        const ligne = (marque) => win._genererLigneHTML({ da: REMET, nom: 'Fictif', prenom: 'Ana', productionNom: 'Portrait', productionId: 'PD',
            evaluationId: 'E1', statut: 'evalue', statutRemise: 'remis', statutWorkflow: 'evalue', niveauFinal: 'D', noteChiffree: 70, marque });
        expect(ligne(dsp.marqueHTML({ diagnostique: true }))).toContain('marque-diagnostique');
        expect(ligne(dsp.marqueHTML({}))).not.toContain('marque-diagnostique');
    });

    // #1147 (24 oct. 2026) : Conception › Productions montre sa sélection dans un menu déroulant, le titre seul
    // (décision du 24 oct. : aucun badge) — la marque n'y est plus ; la fiche ouverte porte la case.
    it('profil (liste des productions, travaux soumis) : la marque est posée par l\'entité ; plus dans le menu de la Conception', () => {
        expect(source('js/productions-liste.js')).not.toContain('ProductionDiagnostique.marqueHTML');
        const profil = source('js/profil-etudiant-sections-affichage.js');
        expect((profil.match(/marque: window\.ProductionDiagnostique\.marqueHTML\(production\)/g) || []).length).toBe(2);
        expect(profil).toContain('${echapperHtml(ligne.production)}${ligne.marque}');
        expect(profil).toMatch(/const nomProd = production \? echapperHtml\([^\n]*\+ window\.ProductionDiagnostique\.marqueHTML\(production\)/);
    });
});

/* ------------------------------------------------------------------ F — les moyennes par critère en sommative */

// Verdict de Cowork (15 oct., 15 h 07) : `calculerMoyennesCriteres` passe par l'entité, comme
// `calculerMoyennesCriteresRecents` en standards. Elles donnent la « Progression par critère » du
// profil et le défi qui mène au pattern et au palier RàI. Même montage que `sentinelle-730`.
const DA_F = '2000005';
const ECHELLE_F = { id: 'E0', nom: 'IDME0', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] };
const GRILLE_F = { id: 'G1', nom: 'Dépistage', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 100, niveauSOLO: 'multistructurel' }] };
const copieF = (id, prod, code) => ({ id, etudiantDA: DA_F, productionId: prod, noteFinale: 70, niveauFinal: code, echelleId: 'E0', grilleId: 'G1',
    ponderationCouverte: 100, verrouillee: true, dateEvaluation: '2026-03-01T12:00:00.000Z',
    criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: code, ponderation: 100 }] });
const MODULES_F = ['js/interpretation-config.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js'];
const EXPORTS_F = (() => { const n = new Set(); for (const f of MODULES_F) for (const m of source(f).matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) n.add(m[1]); return [...n]; })();

function monterF(productions, evaluations) {
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: productions, test_echellesTemplates: [ECHELLE_F], test_grillesTemplates: [GRILLE_F] };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-05-15' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle: (k) => (String(k).startsWith('test_') ? k : 'test_' + k),
        obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
        obtenirPreference: (n) => (n === 'grilleReferenceDepistage' ? 'G1' : null), definirPreference() {}, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirTypePratiqueActive: () => 'sommative', estEtudiantExclu: () => false,
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m.id === id) || null) };
    for (const nom of EXPORTS_F) if (!(nom in globaux) && !/^[A-Z]/.test(nom)) globaux[nom] = fwd(nom);
    chargerPredicatsCopie(win);
    for (const f of MODULES_F) chargerScript(f, globaux, win);
    return win;
}

describe('#1055 · F — en sommative, les moyennes par critère ne lisent pas le diagnostic', () => {
    const ORD = { id: 'P1', titre: 'Analyse', type: 'travail' };
    const DIAG = { id: 'PD', titre: 'Portrait de lecteur', type: 'travail', diagnostique: true };
    const r3 = (x) => Math.round(x * 1000) / 1000;

    it('une copie ordinaire (M) et une diagnostique (I) : la moyenne est celle de l\'ordinaire (avant : 0,575)', () => {
        const w = monterF([ORD, DIAG], [copieF('E1', 'P1', 'M'), copieF('E2', 'PD', 'I')]);
        expect(r3(w.calculerMoyennesCriteres(DA_F).structure)).toBe(0.75);
    });

    it('TÉMOIN : décochée, la même copie revient dans la moyenne', () => {
        const w = monterF([ORD, Object.assign({}, DIAG, { diagnostique: false })], [copieF('E1', 'P1', 'M'), copieF('E2', 'PD', 'I')]);
        expect(r3(w.calculerMoyennesCriteres(DA_F).structure)).toBe(0.575);
    });

    it('seule une copie diagnostique : aucune moyenne (null), pas la sienne', () => {
        const w = monterF([ORD, DIAG], [copieF('E2', 'PD', 'I')]);
        expect(w.calculerMoyennesCriteres(DA_F)).toBeNull();
    });

    it('le site passe par l\'entité', () => {
        expect(corps('js/profil-etudiant-calculs.js', 'calculerMoyennesCriteres')).toContain('window.ProductionDiagnostique.filtrerEvaluations(');
    });
});
