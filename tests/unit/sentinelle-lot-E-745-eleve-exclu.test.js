/**
 * SENTINELLE DU LOT E DU CADRAGE DU DÉPISTAGE — #745, L'ÉLÈVE EXCLU (lot 32, 17 sept. 2026).
 *
 * Règle tranchée par Grégoire le 16 sept. : le profil d'un élève exclu par statut (inactif, décrochage, abandon) se
 * calcule avec la règle de SA pratique, affiche son statut, et reste hors des moyennes du groupe ; un élève qui n'est
 * plus dans le groupe n'est pas calculé. Mots choisis le 17 : « <libellé du statut> · hors des moyennes du groupe ».
 *
 * MESURÉ AVANT DE CODER (la mesure corrige la consigne) :
 *   - les deux producteurs écartaient l'exclu → A = 0 malgré ses présences, et P par un repli « les 3 meilleures notes »
 *     (`calculerPerformancePAN`) s'il n'avait jamais été calculé ;
 *   - s'il l'avait déjà été, son entrée `indicesCP` SURVIVAIT, figée à la valeur du jour de son exclusion ;
 *   - son profil NE S'OUVRAIT PAS : `_resoudreEtudiantProfil` le cherchait parmi les actifs → « Étudiant·e introuvable ».
 *
 * CHOIX : les producteurs calculent tout le groupe ; « hors des moyennes » se tient à la lecture. Cette sentinelle tient
 * les deux bouts : (1) l'exclu lit les nombres de sa pratique — les mêmes que s'il était actif ; (2) le groupe rend les
 * mêmes nombres que si l'exclu n'existait pas, et aucun fichier ne parcourt les deux magasins par leurs clés.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, elementDom, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const DA = { ASSIDU: '2000001', EXCLU: '2000002', TEMOIN: '2000003', PARTI: '2000009' };

// Dix lundis de deux périodes.
const DATES = ['2026-01-12', '2026-01-19', '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16'];
const seances = () => Object.fromEntries(DATES.map((d, i) => [d, [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: i + 1, jour: 'Lundi' }]]));
const pres = (da, date, periodes) => ({ da, date, periodesPresentes: periodes, notes: '', coursId: 'GC1' });

const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40, couleur: '#aa0000' }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };

// Quatre travaux pondérés (sommative) ; les mêmes servent d'artefacts au portfolio (standards).
const PROD_SOM = [
    { id: 'P1', titre: 'Analyse 1', type: 'travail', ponderation: 20, dateEcheance: '2026-02-01', echelleId: 'E0', coursId: 'GC1' },
    { id: 'P2', titre: 'Analyse 2', type: 'travail', ponderation: 20, dateEcheance: '2026-03-01', echelleId: 'E0', coursId: 'GC1' },
    { id: 'P3', titre: 'Dissertation', type: 'travail', ponderation: 30, dateEcheance: '2026-04-01', echelleId: 'E0', coursId: 'GC1' },
    { id: 'P4', titre: 'Examen', type: 'examen', ponderation: 30, dateEcheance: '2026-05-01', echelleId: 'E0', coursId: 'GC1' }
];
const PROD_STD = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 100, coursId: 'GC1' }]
    .concat(['A1', 'A2', 'A3', 'A4'].map((id, i) => ({ id, titre: 'Artefact ' + (i + 1), description: 'Artefact ' + (i + 1), type: 'artefact-portfolio', ponderation: 0, dateEcheance: '2026-02-0' + (i + 1), echelleId: 'E0', coursId: 'GC1' })));

const NIVEAU = (n) => (n >= 85 ? 'E' : n >= 75 ? 'M' : n >= 65 ? 'D' : 'I');
const ev = (da, prodId, note, extra) => Object.assign({
    id: 'E-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: note, niveauFinal: NIVEAU(note), echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-03-01T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
}, extra || {});

const PRATIQUES = [
    { id: 'som-banc', nom: 'SOM banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true, configuration: { approcheEvaluation: 'sommative' } },
    { id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: { type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { utiliser: true, nombreARetenir: 2, minimumCompletion: 1, methodeSelection: 'meilleurs', reglesConformite: { actif: false } }, notesFinales: false } }
];

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-rapport.js',
    { chemin: 'js/profil-etudiant-sections-affichage.js', internes: [] },
    { chemin: 'js/tableau-bord-apercu.js', internes: ['_tousEtudiantsEnrichis'] }];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

// Les DEUX fonctions de main.js, les vraies : la règle d'exclusion et le mot du statut (#749 lot 2).
function fonctionsDeMain() {
    const src = source('js/main.js');
    const w = {};
    new Function('window', tranche(src, 'window.estEtudiantExclu = function', 'window.estRessourceSupprimee', { longueurMin: 400 }))(w);
    return w;
}

/**
 * @param {'som-banc'|'std-banc'} pratiqueId
 * @param {object} o  statut : le statut posé sur l'élève EXCLU ('actif' = le même élève, non exclu) ;
 *                    sansLui : l'élève est RETIRÉ du groupe (ses copies et ses présences restent en base)
 */
function banc(pratiqueId, o = {}) {
    const statut = o.statut === undefined ? 'décrochage' : o.statut;
    const store = storeBase();
    store.test_groupesCours[0].pratiqueId = pratiqueId;
    store.test_pratiquesConfigurables = clone(PRATIQUES);
    store.test_echellesTemplates = [clone(E0)];
    store.test_seancesCompletes = seances();
    store.test_groupeEtudiants = [
        { da: DA.ASSIDU, nom: 'Assidu', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
        { da: DA.EXCLU, nom: 'Exclu', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut },
        { da: DA.TEMOIN, nom: 'Témoin', prenom: 'Chloé', groupe: '01', coursId: 'GC1', statut: 'actif' }
    ].filter(e => !(o.sansLui && e.da === DA.EXCLU));
    const ids = pratiqueId === 'som-banc' ? ['P1', 'P2', 'P3', 'P4'] : ['A1', 'A2', 'A3', 'A4'];
    store.test_productions = clone(pratiqueId === 'som-banc' ? PROD_SOM : PROD_STD);
    // L'exclu : 85, 70, 55, 50 — assez dispersé pour que « les 3 meilleures » (70) diffère de toute règle de pratique.
    store.test_evaluationsSauvegardees = [].concat(
        [60, 70, 80, 90].map((n, i) => ev(DA.ASSIDU, ids[i], n)),
        [85, 70, 55, 50].map((n, i) => ev(DA.EXCLU, ids[i], n)),
        [75, 75, 80].map((n, i) => ev(DA.TEMOIN, ids[i], n)),
        [95, 90].map((n, i) => ev(DA.PARTI, ids[i], n))                       // un DA qui n'est plus dans le groupe
    );
    store.test_presences = [].concat(
        DATES.map(d => pres(DA.ASSIDU, d, 2)),
        DATES.slice(0, 4).map(d => pres(DA.EXCLU, d, 2)),                      // présent aux 4 premières séances : A = 40
        DATES.slice(0, 8).map(d => pres(DA.TEMOIN, d, 2)),
        DATES.slice(0, 5).map(d => pres(DA.PARTI, d, 2))
    );
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const main = o.main || fonctionsDeMain();
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-05-15',
        elements: Object.assign({ contenuProfilEtudiant: elementDom({ id: 'contenuProfilEtudiant' }) }, o.elements || {}),
        prefs: { activerRai: false, depistageAcp: false, afficherGraphiques: false, afficherDeveloppementHabiletes: false },
        globaux: Object.assign({
            estEtudiantExclu: main.estEtudiantExclu, libelleStatutEtudiant: main.libelleStatutEtudiant,
            // 21 oct. 2026 : la vraie fonction d'affichage de la note (js/note-pourcentage.js).
            formaterNotePourcentage: chargerScript('js/note-pourcentage.js').formaterNotePourcentage,
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false,
            obtenirTermeProduction: (c, maj) => { const t = c === 'pluriel' ? 'artefacts' : 'artefact'; return maj ? t[0].toUpperCase() + t.slice(1) : t; }, accordTermeProduction: (m) => m,
            genererSectionProductions: () => '<p>productions</p>', obtenirNomProgramme: (p) => p
        }, o.globaux || {})
    });
    win = b.win;
    b.calculerTout = () => { win.calculerEtSauvegarderIndicesAssiduite(); win.calculerEtStockerIndicesCP(); };
    if (!o.sansCalcul) b.calculerTout();
    return b;
}

const acp = (i) => ({ A: i.A, C: i.C, P: i.P, noteConstructible: i.noteConstructible });
const texte = (html) => String(html).replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('lot E · #745 — l\'exclu se calcule par SA pratique', () => {
    it('(a) sommative : A 40, C 100, P 63 — la moyenne pondérée, pas « les 3 meilleures » (70), pas A = 0', () => {
        // À LA MAIN : A = 4 séances sur 10 = 40. C = 4 remises sur 4 = 100. P = (85×20 + 70×20 + 55×30 + 50×30) / 100 = 62,5 → 63.
        // Le repli retiré rendait A 0 et P (85 + 70 + 55) / 3 = 70.
        const b = banc('som-banc');
        expect(acp(b.win.calculerTousLesIndices(DA.EXCLU))).toEqual({ A: 40, C: 100, P: 63, noteConstructible: true });
    });

    it('(b) standards : P suit le portfolio de la pratique (les 2 meilleures copies : (85 + 70) / 2 = 78), pas « les 3 meilleures notes » (70)', () => {
        // À LA MAIN : le portfolio de `std-banc` retient 2 copies, les meilleures : 85 et 70 → 77,5 → 78.
        // Le repli retiré aurait rendu (85 + 70 + 55) / 3 = 70, quel que soit le nombre à retenir.
        const b = banc('std-banc');
        const i = b.win.calculerTousLesIndices(DA.EXCLU);
        expect(acp(i)).toEqual({ A: 40, C: 100, P: 78, noteConstructible: true });
    });

    ['som-banc', 'std-banc'].forEach((pratiqueId) => {
        it('(c) ' + pratiqueId + ' : les TROIS statuts exclus lisent exactement les nombres du même élève ACTIF, et ses entrées sont écrites par les deux producteurs', () => {
            const actif = banc(pratiqueId, { statut: 'actif' });
            const reference = actif.win.calculerTousLesIndices(DA.EXCLU);
            ['décrochage', 'inactif', 'abandon'].forEach((statut) => {
                const b = banc(pratiqueId, { statut });
                expect([statut, b.win.calculerTousLesIndices(DA.EXCLU)]).toEqual([statut, reference]);
                expect(b.store.test_indicesCP[DA.EXCLU].actuel).toMatchObject({ pratique: pratiqueId, C: reference.C, P: reference.P });
                expect(b.store.test_indicesAssiduite.sommatif[DA.EXCLU]).toMatchObject({ indice: 0.4, nombreSeances: 10 });
            });
        });
    });

    it('(d) son entrée n\'est plus FIGÉE au jour de l\'exclusion : une copie corrigée après coup déplace son P au recalcul suivant', () => {
        // Mesuré avant le lot sur le pack démo : l'entrée indicesCP d'un élève passé en décrochage survivait telle quelle, pour toujours.
        const b = banc('som-banc', { statut: 'actif' });
        expect(b.win.calculerTousLesIndices(DA.EXCLU).P).toBe(63);
        const etu = b.store.test_groupeEtudiants; etu.find(e => e.da === DA.EXCLU).statut = 'décrochage';
        const copies = b.store.test_evaluationsSauvegardees; copies.find(e => e.id === 'E-' + DA.EXCLU + '-P4').noteFinale = 100;
        b.calculerTout();
        // À LA MAIN : (85×20 + 70×20 + 55×30 + 100×30) / 100 = 77,5 → 78.
        expect(b.win.calculerTousLesIndices(DA.EXCLU).P).toBe(78);
    });

    it('(e) lu AVANT le premier recalcul (aucune entrée encore) : les mêmes nombres, calculés par les fonctions des producteurs — et RIEN n\'est écrit', () => {
        const b = banc('som-banc', { sansCalcul: true });
        expect(b.store.test_indicesCP).toBeUndefined();
        const n = b.journal.length;
        expect(acp(b.win.calculerTousLesIndices(DA.EXCLU))).toEqual({ A: 40, C: 100, P: 63, noteConstructible: true });
        expect(acp(b.win.calculerTousLesIndices(DA.ASSIDU))).toEqual({ A: 100, C: 100, P: 77, noteConstructible: true });
        expect(b.journal.length).toBe(n);
    });

    it('(f) un DA qui n\'est plus dans le groupe n\'est PAS calculé : A, C, P, M null et `horsGroupe` — malgré ses cinq présences et ses deux copies', () => {
        const b = banc('som-banc');
        expect(b.win.calculerTousLesIndices(DA.PARTI)).toEqual({ A: null, C: null, P: null, pratique: 'SOM', noteConstructible: false, horsGroupe: true });
        expect(b.store.test_indicesCP[DA.PARTI]).toBeUndefined();
        expect(b.store.test_indicesAssiduite.sommatif[DA.PARTI]).toBeUndefined();
        // Un élève du groupe ne porte jamais le drapeau.
        expect('horsGroupe' in b.win.calculerTousLesIndices(DA.EXCLU)).toBe(false);
    });

    it('(g) CAS NOMMÉ PAR LA CONSIGNE — un exclu sans aucune présence ni copie se lit comme un actif dans le même cas : A 0 (dix séances saisies, aucune présence), C 0, P non constructible ou 0 selon la pratique', () => {
        // Ce cas est RAPPORTÉ à Grégoire dans le relais du lot ; l'essai fige seulement l'égalité exclu = actif, il ne tranche rien.
        ['som-banc', 'std-banc'].forEach((pratiqueId) => {
            const vide = (statut) => {
                const b = banc(pratiqueId, { statut, sansCalcul: true });
                b.store.test_evaluationsSauvegardees = b.store.test_evaluationsSauvegardees.filter(e => e.etudiantDA !== DA.EXCLU);
                b.store.test_presences = b.store.test_presences.filter(p => p.da !== DA.EXCLU);
                b.calculerTout();
                return b.win.calculerTousLesIndices(DA.EXCLU);
            };
            const exclu = vide('décrochage');
            expect([pratiqueId, exclu]).toEqual([pratiqueId, vide('actif')]);
            expect([pratiqueId, exclu.A, exclu.C]).toEqual([pratiqueId, 0, 0]);
        });
    });
});

describe('lot E · #745 — hors des moyennes du groupe', () => {
    it('(h) le Suivi du groupe rend les mêmes élèves et les mêmes nombres AVEC l\'exclu calculé que SANS lui dans le groupe', () => {
        const lire = (b) => {
            b.win.calculerEtudiantsPrioritaires();
            return b.interne['tableau-bord-apercu.js']._tousEtudiantsEnrichis.map(e => [e.da, e.A, e.C, e.P]);
        };
        ['som-banc', 'std-banc'].forEach((pratiqueId) => {
            const avec = lire(banc(pratiqueId));
            expect(avec.map(l => l[0]).sort()).toEqual([DA.ASSIDU, DA.TEMOIN]);           // À LA MAIN : deux actifs, l'exclu n'y est pas
            // À LA MAIN, pour que l'égalité ne compare pas deux listes vides de sens : Assidu est présent partout et a tout remis.
            expect(avec.find(l => l[0] === DA.ASSIDU).slice(1, 3)).toEqual([100, 100]);
            expect(avec.find(l => l[0] === DA.TEMOIN).slice(1, 3)).toEqual([80, 75]);  // 8 séances sur 10 ; 3 remises sur 4
            expect([pratiqueId, avec]).toEqual([pratiqueId, lire(banc(pratiqueId, { sansLui: true }))]);
        });
    });

    it('(i) VERROU STRUCTUREL — aucun fichier de js/ ne parcourt `indicesCP` ni `indicesAssiduite` par leurs clés : « hors des moyennes » tient parce que chaque lecteur part d\'une liste d\'élèves filtrée', () => {
        const fautifs = [];
        const motif = /(?:Object\.(?:keys|values|entries)\(\s*|\bin\s+)(\w*[iI]ndices(?:CP|Assiduite|A)\w*)(?:\.sommatif)?\s*\)/g;
        for (const f of readdirSync(path.join(RACINE, 'js'), { recursive: true }).filter(n => String(n).endsWith('.js'))) {
            const src = source(path.join('js', String(f)));
            for (const m of src.matchAll(motif)) {
                const ligne = src.slice(0, m.index).split('\n').length;
                fautifs.push(f + ':' + ligne + ' ' + m[1]);
            }
        }
        expect(fautifs).toEqual([]);
        // Le motif VOIT la forme qu'il interdit (un verrou qui ne peut pas rougir ne verrouille rien).
        expect('Object.values(indicesCP)'.match(motif)).not.toBeNull();
        expect('for (const da in indicesAssiduite.sommatif)'.match(motif)).not.toBeNull();
    });

    it('(j) CLIQUET — les lecteurs de moyennes, de statistiques et de courbes du groupe filtrent toujours par `estEtudiantExclu` : le compte par fichier ne descend pas', () => {
        // Occurrences de `estEtudiantExclu` par fichier, mesurées le 17 sept. 2026 sur f99f5325. Ce sont les lecteurs qui PARTENT
        // d'une liste d'élèves et lisent les magasins DA par DA ; un filtre retiré fait descendre le compte de son fichier.
        // (portfolio.js et indices.js n'y sont plus : ce sont les producteurs, et ils calculent tout le groupe.)
        // (evaluation.js n'y est plus depuis #920, 18 sept. 2026 : son seul lecteur, `mettreAJourIndicateurProgression`, écrivait dans un
        // élément que rien n'insérait — aucun appelant vivant ; il est parti avec l'insertion dormante. Un lecteur retiré, pas un filtre.)
        // (trimestres.js passe de 3 à 2 le 4 oct. 2026, #1006 : `afficherTrimestreCibleExport` écrivait dans `#export-trimestre-info`,
        // absent de la page, et n'avait pour appelant que la liste sans conteneur. Un lecteur retiré, pas un filtre.)
        const PLANCHER = { 'js/tableau-bord-apercu.js': 5, 'js/graphiques-progression.js': 13, 'js/etudiants.js': 5, 'js/presences-apercu.js': 1,
            'js/presences-rapport.js': 2, 'js/snapshots.js': 1, 'js/trimestres.js': 2, 'js/liste-evaluations.js': 1,
            'js/boite-outils.js': 1, 'js/navigation.js': 1, 'js/saisie-presences.js': 2 };
        const mesure = Object.fromEntries(Object.keys(PLANCHER).map(f => [f, (source(f).match(/estEtudiantExclu/g) || []).length]));
        for (const f of Object.keys(PLANCHER)) expect([f, mesure[f] >= PLANCHER[f], mesure[f]]).toEqual([f, true, mesure[f]]);
        expect((source('js/portfolio.js').match(/estEtudiantExclu\(/g) || []).length).toBe(0);
    });
});

describe('lot E · #745 — le profil de l\'exclu s\'ouvre et dit son statut', () => {
    const ouvrir = (statut, o = {}) => {
        const b = banc('som-banc', Object.assign({ statut }, o));
        b.win.afficherProfilComplet(DA.EXCLU);
        return { b, html: b.elements.contenuProfilEtudiant.innerHTML };
    };

    it('(k) décrochage : le profil s\'ouvre (avant : « Étudiant·e introuvable »), et la ligne sous le nom dit « Décrochage · hors des moyennes du groupe »', () => {
        const { b, html } = ouvrir('décrochage');
        expect(b.avertissements).toEqual([]);
        expect(b.win.profilActuelDA).toBe(DA.EXCLU);
        const carte = tranche(html, 'sidebar-info-card-nom', 'sidebar-liste', { longueurMin: 80 });
        expect(texte('<' + carte)).toMatch(/Bruno Exclu\s+Décrochage · hors des moyennes du groupe\s+DA:/);
    });

    it('(l) le mot vient de `libelleStatutEtudiant`, pas d\'une chaîne en dur : « Inactivité », « Abandon » — et un mot changé dans main.js change l\'en-tête', () => {
        expect(texte(ouvrir('inactif').html)).toContain('Inactivité · hors des moyennes du groupe');
        expect(texte(ouvrir('abandon').html)).toContain('Abandon · hors des moyennes du groupe');
        const main = fonctionsDeMain();
        const faux = { estEtudiantExclu: main.estEtudiantExclu, libelleStatutEtudiant: () => 'Mot du banc' };
        expect(texte(ouvrir('décrochage', { main: faux }).html)).toContain('Mot du banc · hors des moyennes du groupe');
    });

    it('(m) un élève ACTIF ne porte aucune ligne de statut', () => {
        const b = banc('som-banc');
        b.win.afficherProfilComplet(DA.ASSIDU);
        const html = b.elements.contenuProfilEtudiant.innerHTML;
        expect(html).not.toContain('hors des moyennes du groupe');
        expect(html).not.toContain('data-statut-exclu');
    });

    it('(n) le sélecteur : les actifs, plus l\'exclu AFFICHÉ (sélectionné, à sa place alphabétique) ; depuis un actif, l\'exclu n\'y est pas et Préc. / Suiv. le sautent', () => {
        const options = (html) => [...html.matchAll(/<option value="(\d+)"\s*(selected)?/g)].map(m => m[1] + (m[2] ? '*' : ''));
        const nav = (html) => [...html.matchAll(/data-action="afficherProfilComplet" data-param="([^"]*)"/g)].map(m => m[1]);
        const { html } = ouvrir('décrochage');
        expect(options(html)).toEqual([DA.ASSIDU, DA.EXCLU + '*', DA.TEMOIN]);      // Assidu, Exclu, Témoin
        expect(nav(html)).toEqual([DA.ASSIDU, DA.TEMOIN]);
        const b = banc('som-banc');
        b.win.afficherProfilComplet(DA.ASSIDU);
        const h2 = b.elements.contenuProfilEtudiant.innerHTML;
        expect(options(h2)).toEqual([DA.ASSIDU + '*', DA.TEMOIN]);
        expect(nav(h2)).toEqual(['undefined', DA.TEMOIN]);
    });

    it('(o) un DA qui n\'est plus dans le groupe : aucun profil ne s\'ouvre (aucun écran ne le calcule), et le profil affiché avant reste le profil courant (#867)', () => {
        const b = banc('som-banc');
        b.win.afficherProfilComplet(DA.ASSIDU);
        const avant = b.elements.contenuProfilEtudiant.innerHTML;
        b.win.afficherProfilComplet(DA.PARTI);
        expect(b.avertissements).toEqual(['Étudiant·e introuvable']);
        expect(b.elements.contenuProfilEtudiant.innerHTML).toBe(avant);
        expect(b.win.profilActuelDA).toBe(DA.ASSIDU);
    });
});
