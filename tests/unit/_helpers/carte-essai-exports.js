// LA CARTE D'ESSAI DES EXPORTS — montage partagé (#416 lot G).
//
// Elle contient un exemplaire de tout ce que le générateur sait émettre :
// séquence + sous-séquence, leçons avec semaine ET rang de séance, objectifs
// pluriels, objectif dérivé d'une idée maîtresse, activités avec durées,
// évaluation avec production/grille/échelle, rétroactions sur les DEUX
// porteurs, liens verbalisés, connaissance, leçon orpheline.
//
// ⚠ POURQUOI CE FICHIER EXISTE. Le golden master du lot G doit monter
// EXACTEMENT la même carte que ce qu'il fige, et un script hors Vitest doit
// pouvoir la monter aussi pour régénérer les références. Dupliquer le montage
// dans les deux endroits ferait dériver la référence de son test sans que rien
// ne le dise — la classe de défaut que ce projet a déjà rencontrée trois fois.
//
// ⚠ `harnais-parite-exports-424.test.js` garde sa propre copie du montage,
// délibérément : c'est le filet du portage, il ne doit dépendre de rien qui
// puisse bouger sous lui.

import { chargerScript } from './charger-script.js';

/**
 * L'horloge du sandbox d'export — figée au 12 août 2026.
 *
 * ⚠ SANS ARGUMENT, elle rend TOUJOURS la même date ; avec arguments, elle se
 * comporte comme `Date`. C'est ce que le code attend : `new Date()` pour
 * horodater un export, `new Date(chaîne)` pour lire une date de séance. Figer
 * les deux casserait la résolution des dates ; n'en figer aucune rendait le
 * golden master périssable.
 */
export const DATE_ESSAI = '2026-08-12T09:00:00';

class DateFigee extends Date {
    constructor(...args) {
        if (args.length === 0) super(DATE_ESSAI);
        else super(...args);
    }
    static now() { return new Date(DATE_ESSAI).getTime(); }
}

export function monterExportSandbox() {
    const store = {
        // ⚠ `titre`, PAS `nom` (25 août 2026, #492). Le modèle de production
        // porte `titre` ; `nom` n'a jamais existé dessus. Cette fixture disait
        // `nom` — et `chargerProductions` le relisait, ce qui rendait les deux
        // d'accord ENTRE EUX et faux tous les deux : la colonne « Production »
        // du plan de cours sortait « undefined » avec de vraies données, pendant
        // que le golden master restait vert. Les fixtures parlent le dialecte du
        // MODÈLE, jamais celui du bug qu'on veut voir passer.
        'a2026_productions': [
            { id: 'prod-dissert', titre: 'Dissertation critique', type: 'travail', ponderation: 25, grilleId: 'grille-1', echelleId: 'ech-1', dateEcheance: '2026-10-15' },
            { id: 'prod-quiz', titre: 'Quiz de lecture', type: 'quiz', ponderation: 10, grilleId: null, dateEcheance: null }
        ],
        'a2026_grillesTemplates': [{ id: 'grille-1', nom: 'Grille SRPNF' }], // #969 : l'échelle vit sur la production
        'a2026_echellesTemplates': [{ id: 'ech-1', nom: 'Échelle IDME' }],
        'a2026_planification_seances': {
            'carte_1::lecon-1': {
                note: 'Prévoir la plénière',
                activites: { 'act-1': { retroaction: 'orale', productionId: null } }
            },
            'carte_1::lecon-2': {
                activites: { 'act-2': { retroaction: 'orale', productionId: 'prod-quiz' } }
            }
        },
        // Deux groupes du même cours, deux horaires — le cas qui justifie D9.
        'a2026_groupesCours': [
            { id: 'GC_MATIN', nom: 'A26-601-101-01', coursId: 'COURS_A' },
            { id: 'GC_SOIR', nom: 'A26-601-101-02', coursId: 'COURS_A' }
        ],
        'seancesCompletes_gc_GC_MATIN': {
            '2026-09-08': [seanceEssai('2026-09-08', 3)],
            '2026-09-11': [seanceEssai('2026-09-11', 3)],
            '2026-09-15': [seanceEssai('2026-09-15', 4)],
            '2026-09-22': [seanceEssai('2026-09-22', 5)]
        },
        'seancesCompletes_gc_GC_SOIR': {
            '2026-09-09': [seanceEssai('2026-09-09', 3)],
            '2026-09-16': [seanceEssai('2026-09-16', 4)]
        }
    };

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });

    const globaux = {
        db,
        // ⚠ L'HORLOGE EST FIGÉE, ET C'EST INDISPENSABLE AU GOLDEN MASTER.
        // Les rendeurs Texte et Markdown écrivent « Exporté le <date du jour> ».
        // Sans ce gel, les références figées un jour rougissaient le lendemain
        // — ce qui est arrivé le 13 août au matin, sur six sorties, avec un
        // arbre pourtant identique à la veille. Un filet qui crie au loup
        // chaque jour finit par être contourné, et c'est alors qu'il manque.
        //
        // Le sandbox passe ses globaux en PARAMÈTRES de fonction (voir
        // `charger-script.js`) : ce `Date` masque donc celui de Node dans tout
        // le code chargé, sans toucher au reste des tests.
        Date: DateFigee,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelectorAll: () => [],
            querySelector: () => null,
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    };

    const win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.db = db;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Alignement A26', coursId: 'COURS_A' }] }),
        obtenirCoursDeCarte: () => 'COURS_A',
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    chargerScript('js/horaire.js', globaux, win);
    chargerScript('js/planification-export.js', globaux, win);

    poserFixture(win.planificationCarte);

    return { win, carte: win.planificationCarte, exporteur: win.planificationExport, store, db };
}

function seanceEssai(date, numeroSemaine) {
    return {
        id: `SEANCE-${date}`, date, jour: 'mardi',
        debut: '08:30', fin: '10:20', duree: 110, numeroSemaine
    };
}

function poserFixture(api) {
    const noeud = (id, type, titre, extras) => {
        const n = Object.assign(
            { id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
            extras || {}
        );
        api.etat.noeuds.set(id, n);
        return n;
    };
    const lien = (id, source, cible, type) => api.etat.liens.set(id, { id, source, cible, type });

    api.etat.noeuds.clear();
    api.etat.liens.clear();

    const seq1 = noeud('seq-1', 'sequence', 'Le récit réaliste');
    const l1 = noeud('lecon-1', 'lecon', 'L’incipit', {
        parent: 'seq-1',
        metadata: {
            semaine: 3,
            rangSeance: 1,
            duree: 60,
            objectifs: [
                { id: 'obj-1', texte: 'Analyser un incipit réaliste' },
                { id: 'obj-2', texte: 'Rédiger un plan de dissertation' }
            ]
        }
    });
    noeud('exp-1', 'expose', 'Exposé magistral sur le réalisme', {
        parent: 'lecon-1', metadata: { duree: 50 }
    });
    noeud('act-1', 'activite', 'Atelier d’analyse en équipe', {
        parent: 'lecon-1', metadata: { duree: 45, objectifsServis: ['obj-1'] }
    });
    noeud('conn-1', 'conceptuelle', 'Le narrateur omniscient', { parent: 'lecon-1' });
    noeud('eval-1', 'evaluation', 'Évaluation de l’incipit', {
        parent: 'lecon-1',
        metadata: { duree: 30, productionId: 'prod-dissert', retroaction: 'ecrite' }
    });
    l1.enfants = ['exp-1', 'act-1', 'conn-1', 'eval-1'];

    // Rang 2 : la deuxième rencontre de la semaine 3 — deux leçons la même
    // semaine, ce qui est le cas d'usage même du lot A.
    const l2 = noeud('lecon-2', 'lecon', 'La description', {
        parent: 'seq-1', metadata: { semaine: 3, rangSeance: 2 }
    });
    noeud('act-2', 'activite', 'Pastiche descriptif', {
        parent: 'lecon-2', metadata: { duree: 30, retroaction: 'ecrite' }
    });
    l2.enfants = ['act-2'];

    // Un élément posé DIRECTEMENT sous une séquence, sans passer par une
    // leçon. Il a sa ligne en granularité nœuds ; il ne doit PAS en avoir une
    // dans un calendrier, où une ligne est une rencontre. Sans lui, ce chemin
    // ne sortait dans aucune référence — le banc de cassure l'a montré.
    noeud('act-hors-lecon', 'activite', 'Lecture obligatoire du recueil', {
        parent: 'seq-1', metadata: { duree: 20 }
    });

    const sseq = noeud('seq-2', 'sequence', 'Sous-parcours poésie', { parent: 'seq-1' });
    // Semaine posée, rang ABSENT : l'état dégradé « pas de rang » doit se voir
    // dans le golden, sinon rien ne le fige.
    noeud('lecon-3', 'lecon', 'Leçon nichée', {
        parent: 'seq-2', metadata: { semaine: 5 }
    });
    sseq.enfants = ['lecon-3'];
    seq1.enfants = ['lecon-1', 'lecon-2', 'act-hors-lecon', 'seq-2'];

    // Une séquence qui n'organise que des SOUS-SÉQUENCES : elle n'a ni leçon
    // ni élément propre, et sort donc en ligne « sans contenu » — le seul
    // chemin où la colonne Semaine rend une ÉTENDUE (« 6–8 ») au lieu d'un
    // numéro (#152). L'étendue est DÉRIVÉE de ses descendants, jamais stockée :
    // une séquence réellement vide n'en aurait aucune, et ne prouverait rien.
    // Sans ce cas, le chemin ne sortait dans aucune référence — le banc de
    // cassure l'a montré en restant vert.
    const seqChapeau = noeud('seq-chapeau', 'sequence', 'Parcours d’intégration');
    const sousA = noeud('seq-integ-a', 'sequence', 'Atelier long', { parent: 'seq-chapeau' });
    const lA = noeud('lecon-integ-a', 'lecon', 'Mise en chantier', {
        parent: 'seq-integ-a', metadata: { semaine: 6 }
    });
    const sousB = noeud('seq-integ-b', 'sequence', 'Présentations', { parent: 'seq-chapeau' });
    const lB = noeud('lecon-integ-b', 'lecon', 'Soutenance', {
        parent: 'seq-integ-b', metadata: { semaine: 8, rangSeance: 1 }
    });
    sousA.enfants = ['lecon-integ-a'];
    sousB.enfants = ['lecon-integ-b'];
    seqChapeau.enfants = ['seq-integ-a', 'seq-integ-b'];
    void lA; void lB;

    noeud('im-1', 'idee-maitresse', 'maîtriser la description réaliste');
    // Ni semaine ni rang : l'autre état dégradé.
    noeud('lecon-orph', 'lecon', 'Récupération libre');

    lien('lien-1', 'im-1', 'lecon-2', 'se_concretise_dans');
    lien('lien-2', 'conn-1', 'act-1', 's_acquiert_par');
    lien('lien-3', 'conn-1', 'eval-1', 'se_verifie_par');
}

/**
 * Les sorties génériques, dans un ordre stable.
 *
 * ⚠ « personnalise » A DISPARU au lot H, et ce n'est pas une perte de
 * couverture : le niveau n'existe plus, son réglage unique a migré en gabarit
 * nommé. Ses trois références ont été retirées le 12 août, délibérément.
 * « calendrier » prend sa place avec ses DEUX formats — il refuse le Texte.
 */
export const SORTIES_GENERIQUES = (() => {
    const paires = [];
    ['sommaire', 'deroulement', 'alignement'].forEach((n) => {
        ['texte', 'tsv', 'markdown'].forEach((f) => paires.push({ niveau: n, format: f }));
    });
    ['tsv', 'markdown'].forEach((f) => paires.push({ niveau: 'calendrier', format: f }));
    return paires;
})();
