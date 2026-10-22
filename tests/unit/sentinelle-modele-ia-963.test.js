import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #963 — « JE FAIS RELIRE MA CARTE PAR UNE IA » (27 sept. 2026)
//
// Ce que cette sentinelle garde :
//   1. les consignes sont le texte VALIDÉ par Grégoire, octet pour octet — la
//      référence est la copie de la consigne du lot, ci-dessous ;
//   2. les données disent ce que la consigne du lot exige, y compris trois
//      données que l'export du plan tait (objectif servi d'une autre leçon,
//      échelle portée par la production, production hors du sélecteur) ;
//   3. générer le modèle n'écrit RIEN, ni dans la carte ni dans le magasin.
//
// Sentinelle COMPORTEMENTALE : elle monte les deux vraies sources (carte +
// export) sur une carte fictive et lit le fichier produit.

// LE TEXTE VALIDÉ PAR GRÉGOIRE, recopié le 27 sept. 2026 de la consigne du lot
// (`plans de travail/CARTE-ALIGNEMENT-2026-09-27-1-relire-ma-carte-par-une-IA.md`,
// section « CONSIGNES DU MODÈLE »), crochets compris.
// ⚠ Recopié et NON lu : `plans de travail/` est dans le `paths-ignore` de la CI
// (sentinelle-ci-paths-ignore). Un banc qui le lirait ne serait pas rejoué par
// le commit qui le casse. Si le texte validé change, les deux copies (ici et
// `CONSIGNES_MODELE`, planification-export.js) changent ensemble, sur décision.
const TEXTE_VALIDE = [
    "# Carte d'alignement : [nom de la carte]",
    "",
    "> CONSIGNES : à lire par l'assistant, puis à laisser telles quelles.",
    ">",
    "> Tu reçois ci-dessous la carte d'alignement d'un cours, telle que l'enseignant·e l'a construite dans Labo Codex. Tu en fais la lecture critique ; tu ne la réécris pas. L'enseignant·e décidera seul·e de ce qu'il faut modifier.",
    ">",
    "> LE PRINCIPE",
    "> Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence.",
    ">",
    "> OÙ EN EST L'ENSEIGNANT·E",
    "> Étape : [étape choisie]. Carte bâtie jusqu'à la semaine [N] sur [nombre de semaines du trimestre].",
    "> - Construire les séances : les objectifs et les liens ne sont pas encore posés. Ne signale ni leur absence ni ce qui suit la semaine [N] ; lis les séances déjà bâties par leurs titres et leur ordre.",
    "> - Relier : signale aussi les objectifs sans lien et les évaluations qui ne vérifient aucun objectif.",
    "> - Vérifier : lis la carte comme terminée.",
    ">",
    "> CE QUE TU VÉRIFIES",
    "> La carte calcule déjà les liens manquants. Ton rôle est ce qu'un calcul ne voit pas : le sens de ces liens.",
    "> - Ce qui est évalué a-t-il été enseigné ? Pour chaque évaluation, pars des objectifs qu'elle vérifie (à défaut, de son titre) et repère où la carte les enseigne et les fait pratiquer. Signale ce qu'elle exige sans que la carte montre où cela a été appris.",
    "> - Ce qui est enseigné est-il évalué ? Signale ce qui est enseigné sans être évalué nulle part, en admettant que ce puisse être voulu (un préalable, une mise en route).",
    "> - L'ordre : ce qui est évalué a-t-il été enseigné avant l'évaluation ?",
    "> - Le verbe : repère le verbe de chaque objectif (identifier, expliquer, concevoir…). Vérifie que les activités font exercer ce verbe et que l'évaluation exige ce même verbe, pas un verbe plus exigeant. Compare aussi ce verbe au niveau cognitif indiqué sur l'évaluation.",
    "> - Les liens eux-mêmes : un lien posé ne prouve pas l'alignement. Signale un objectif coché par une activité ou une évaluation qui, d'après son titre, ne le travaille pas.",
    "> - La démarche : si la carte montre une progression (des étapes, des types d'activités), vérifie qu'elle suit la sienne. Ne lui impose aucune démarche qu'elle ne montre pas.",
    ">",
    "> CE QUE TU RENDS",
    "> 1. Les trous : ce qui manque, en nommant les blocs concernés.",
    "> 2. Les incohérences : ce qui se contredit, en nommant les blocs et le lien en cause.",
    "> 3. Les questions : ce que la carte ne permet pas de trancher.",
    "> 4. Au plus trois suggestions, classées par importance.",
    ">",
    "> ANCRAGE",
    "> - Tu ne connais pas la discipline de ce cours et tu n'en juges pas le contenu. Emploie uniquement les termes de la carte ; suis-les d'un bloc à l'autre pour vérifier que ce qui est évalué a été enseigné, et que ce qui est enseigné est évalué. N'introduis aucun concept qui n'y figure pas.",
    "> - Appuie chaque remarque sur un bloc ou un lien présent dans la carte, cité par son nom et sa semaine.",
    "> - Distingue ce que la carte montre de ce que tu en infères.",
    "> - Aucune note, aucune félicitation.",
];

let win;
let api;
let exporteur;
let store;
let ecritures;

function fauxElement() {
    return {
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
}

function monter({ avecCadre = true, avecCours = true } = {}) {
    ecritures = [];
    store = {
        'a2026_productions': [
            // La grille ne porte PAS d'echelleId (l'éditeur n'en écrit jamais) :
            // l'échelle vient de la production.
            { id: 'prod-carnet', titre: 'Carnet d’observation n°1', type: 'artefact', ponderation: 20,
              grilleId: 'grille-ciel', echelleId: 'ech-quatre', dateEcheance: '2026-10-08',
              dansBibliotheque: false }
        ],
        'a2026_grillesTemplates': [{ id: 'grille-ciel', nom: 'Grille Ciel profond' }],
        'a2026_echellesTemplates': [{ id: 'ech-quatre', nom: 'Échelle à quatre paliers' }],
        'cours': [{
            id: 'cours-astro', codeCours: '999-ZZZ-XX', nomCours: 'Astronomie de terrain',
            numeroCompetence: '0ZZ9', competence: 'Observer le ciel nocturne',
            elementsCompetence: 'Repérer les constellations\nConsigner une observation'
        }]
    };
    if (avecCadre) {
        const cal = {};
        for (let s = 1; s <= 15; s++) {
            const jour = String(s).padStart(2, '0');
            cal[`2026-09-${jour}`] = { statut: 'cours', numeroSemaine: s };
        }
        // R1 (relecture de Cowork, 28 sept.) : un Cadre réel porte aussi une
        // semaine de planification et une semaine d'examens. Elles ne sont PAS
        // des semaines du trimestre au sens du modèle (15, pas 17).
        cal['2026-08-25'] = { statut: 'semaine-planification' };
        cal['2026-12-20'] = { statut: 'semaine-examens' };
        store['a2026_calendrierComplet'] = cal;
    }
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecritures.push(k); store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { ecritures.push(k); store[k] = v; }
    };
    const globaux = {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        },
        navigator: {},
        notifications: { succes() {}, erreur() {}, info() {} }
    };
    win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Astronomie A26 v2', coursId: 'cours-astro' }] }),
        resoudreCoursDeCarte: () => (avecCours ? store['cours'][0] : null),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    chargerScript('js/planification-export.js', globaux, win);
    api = win.planificationCarte;
    exporteur = win.planificationExport;
    poserCarte();
}

function noeud(id, type, titre, extras) {
    const n = Object.assign(
        { id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
        extras || {}
    );
    api.etat.noeuds.set(id, n);
    if (n.parent) api.etat.noeuds.get(n.parent).enfants.push(id);
    return n;
}

function lien(id, source, cible, type) {
    api.etat.liens.set(id, { id, source, cible, type });
}

/** Carte fictive : deux leçons planifiées, une sans semaine, un bloc libre. */
function poserCarte() {
    noeud('comp', 'competence', 'Observer le ciel', { metadata: { niveauCognitif: 'appliquer' } });
    noeud('im', 'idee-maitresse', 'Le ciel tourne', { metadata: { niveauCognitif: 'comprendre' }, y: 10 });
    lien('l1', 'comp', 'im', 'se_decline_en');

    noeud('seq', 'sequence', 'Premières nuits');
    noeud('lec1', 'lecon', 'Lire une carte du ciel', {
        parent: 'seq', x: 0,
        metadata: { semaine: 2, rangSeance: 1, objectifs: [{ id: 'obj-a', texte: 'Repérer l’étoile Polaire' }] }
    });
    noeud('lec2', 'lecon', 'Tenir un carnet', {
        parent: 'seq', x: 100,
        metadata: { semaine: 4, rangSeance: 2, objectifs: [{ id: 'obj-b', texte: 'Décrire une observation' }] }
    });
    noeud('lec3', 'lecon', 'Leçon en chantier', { metadata: {} });
    lien('l2', 'im', 'lec1', 'se_concretise_dans');

    noeud('conn', 'conceptuelle', 'Rotation apparente', { parent: 'lec1' });
    noeud('act1', 'activite', 'Repérage au planisphère', {
        parent: 'lec1', metadata: { duree: 30, niveauCognitif: 'appliquer', objectifsServis: ['obj-a'] }
    });
    lien('l3', 'conn', 'act1', 's_acquiert_par');

    // Dans la leçon 2 : une activité qui sert l'objectif de la LEÇON 1, et un
    // objectif retiré depuis (id mort) — l'un s'écrit, l'autre s'omet.
    noeud('act2', 'activite', 'Relecture du planisphère', {
        parent: 'lec2', metadata: { duree: 20, objectifsServis: ['obj-a', 'obj-mort', 'obj-b'] }
    });
    noeud('eval', 'evaluation', 'Carnet n°1', {
        parent: 'lec2',
        metadata: { duree: 50, niveauCognitif: 'analyser', visee: 'certificative',
                    objectifsServis: ['obj-b'], productionId: 'prod-carnet' }
    });
    noeud('eval2', 'evaluation', 'Quiz fantôme', {
        parent: 'lec2', metadata: { productionId: 'prod-disparue' }
    });
    lien('l4', 'act2', 'eval', 'se_verifie_par');

    noeud('libre', 'soutien', 'Atelier libre', { metadata: { duree: 15 } });
}

const lignesConsignesDuLot = () => TEXTE_VALIDE.slice();

beforeEach(() => monter());

describe('#963 — les consignes sont le texte validé, tel quel', () => {
    it('reproduit la consigne du lot à l\'octet près, crochets remplis', () => {
        const attendu = lignesConsignesDuLot().map((l) => l
            .split('[nom de la carte]').join('Astronomie A26 v2')
            .split('[étape choisie]').join('Relier')
            .split('[N]').join('4')
            .split('[nombre de semaines du trimestre]').join('15'));
        const doc = exporteur.genererModeleCarte({ etape: 'relier', semaine: 4, nbSemaines: 15 });
        expect(doc.split('\n').slice(0, attendu.length)).toEqual(attendu);
    });

    it('le texte gardé dans le code compte autant de lignes que la consigne', () => {
        expect(exporteur.CONSIGNES_MODELE.length).toBe(lignesConsignesDuLot().length);
    });

    it('sans Cadre du trimestre, la phrase s\'arrête à la semaine choisie : aucun total deviné', () => {
        monter({ avecCadre: false });
        expect(exporteur.nombreSemainesTrimestre()).toBeNull();
        const doc = exporteur.genererModeleCarte({ etape: 'construire', semaine: 4, nbSemaines: null });
        expect(doc).toContain('> Étape : Construire les séances. Carte bâtie jusqu\'à la semaine 4.\n');
    });

    it('lit le total du Cadre, et propose par défaut la dernière semaine qui contient une leçon', () => {
        expect(exporteur.nombreSemainesTrimestre()).toBe(15);
        expect(exporteur.semaineParDefautModele()).toBe(4);
    });
});

describe('#963 — les données après les consignes', () => {
    let doc;
    beforeEach(() => { doc = exporteur.genererModeleCarte({ etape: 'verifier', semaine: 4, nbSemaines: 15 }); });

    it('dit le cours, la compétence et ses éléments', () => {
        expect(doc).toContain('Cours : 999-ZZZ-XX, Astronomie de terrain');
        expect(doc).toContain('Compétence 0ZZ9 : Observer le ciel nocturne');
        expect(doc).toContain('- Repérer les constellations\n- Consigner une observation');
    });

    it('sans cours rattaché, le dit', () => {
        monter({ avecCours: false });
        doc = exporteur.genererModeleCarte({ etape: 'verifier', semaine: 4, nbSemaines: 15 });
        expect(doc).toContain('Aucun cours n\'est rattaché à cette carte.');
    });

    it('écrit les idées maîtresses avec leur niveau cognitif et leurs liens en phrases', () => {
        expect(doc).toContain('- Idée maîtresse « Le ciel tourne » (niveau cognitif : Comprendre)');
        expect(doc).toContain('« Observer le ciel » (Compétence) se décline en « Le ciel tourne » (Idée maîtresse).');
        expect(doc).toContain('« Le ciel tourne » (Idée maîtresse) se concrétise dans « Lire une carte du ciel » (Leçon, semaine 2).');
    });

    it('range les leçons par semaine, avec la séance, les objectifs et les idées maîtresses', () => {
        const i2 = doc.indexOf('### Semaine 2');
        const i4 = doc.indexOf('### Semaine 4');
        expect(i2).toBeGreaterThan(-1);
        expect(i4).toBeGreaterThan(i2);
        expect(doc).toContain('#### Leçon « Lire une carte du ciel », séance A');
        expect(doc).toContain('#### Leçon « Tenir un carnet », séance B');
        expect(doc).toContain('Séquence : « Premières nuits »');
        expect(doc).toContain('Objectifs de la leçon :\n- Repérer l’étoile Polaire');
        expect(doc).toContain('Idées maîtresses : « Le ciel tourne »');
        expect(doc).toContain('- Activité « Repérage au planisphère » (30 min ; niveau cognitif : Appliquer)');
        expect(doc).toContain('« Rotation apparente » (Conceptuelle, semaine 2) s\'acquiert par « Repérage au planisphère » (Activité, semaine 2).');
    });

    it('écrit l\'objectif servi d\'une AUTRE leçon, et omet celui qui n\'existe plus', () => {
        expect(doc).toContain('  - Objectifs servis : « Repérer l’étoile Polaire » (objectif de la leçon « Lire une carte du ciel », semaine 2) ; « Décrire une observation »');
        expect(doc).not.toMatch(/obj-mort/);
    });

    it('dit de chaque évaluation ce qu\'elle vérifie, sa visée, sa production, sa grille, son échelle et son échéance', () => {
        expect(doc).toContain('- Évaluation certificative « Carnet n°1 » (50 min ; niveau cognitif : Analyser)');
        expect(doc).toContain('  - Objectifs vérifiés : « Décrire une observation »');
        expect(doc).toContain('  - Visée : certificative');
        expect(doc).toContain('  - Production : « Carnet d’observation n°1 » (20\u00A0%)');
        expect(doc).toContain('  - Grille : « Grille Ciel profond »');
        expect(doc).toContain('  - Échelle : « Échelle à quatre paliers »');
        expect(doc).toContain('  - Échéance : 2026-10-08');
        expect(doc).toContain('« Relecture du planisphère » (Activité, semaine 4) se vérifie par « Carnet n°1 » (Évaluation certificative, semaine 4).');
    });

    it('une production désignée mais absente du trimestre est dite introuvable, pas tue', () => {
        expect(doc).toContain('- Évaluation « Quiz fantôme »\n  - Objectifs vérifiés : aucun\n  - Visée : non précisée\n  - Production : introuvable dans ce trimestre');
    });

    it('range à part les leçons sans semaine et les blocs rattachés à aucune leçon', () => {
        expect(doc).toContain('### Leçons sans semaine\n\n#### Leçon « Leçon en chantier »');
        const iHors = doc.indexOf('## Blocs rattachés à aucune leçon');
        expect(iHors).toBeGreaterThan(doc.indexOf('### Leçons sans semaine'));
        expect(doc.slice(iHors)).toContain('- Soutien « Atelier libre » (15 min)');
    });

    it('ne laisse passer aucun identifiant technique', () => {
        expect(doc).not.toMatch(/planif-noeud|prod-|grille-ciel|ech-quatre|obj-[ab]\b|cours-astro|carte_1|\blec[123]\b|\bact[12]\b/);
    });
});

// R1 (relecture de Cowork, 28 sept.) — les liens d'un bloc CLONÉ.
// Un clone est le même bloc : ses liens sont agrégés sur toutes ses instances,
// mais chaque phrase désigne l'instance qui PORTE le lien, avec sa semaine.
function ajouterClones() {
    noeud('lec6', 'lecon', 'Reprendre le carnet', { x: 200, metadata: { semaine: 6, rangSeance: 1 } });
    // Clone en semaine 6, sans lien propre : il hérite du lien de l'original (semaine 4).
    noeud('act2-c6', 'activite', 'Relecture du planisphère', { parent: 'lec6', cloneSourceId: 'act2', metadata: { duree: 20 } });
    // Clone en semaine 4, relié lui aussi à la même évaluation : même phrase que l'original.
    noeud('lec2b', 'lecon', 'Tenir un carnet, suite', { x: 150, metadata: { semaine: 4, rangSeance: 3 } });
    noeud('act2-c4', 'activite', 'Relecture du planisphère', { parent: 'lec2b', cloneSourceId: 'act2', metadata: { duree: 20 } });
    lien('l5', 'act2-c4', 'eval', 'se_verifie_par');
    api.reconstruireIndexClones();
}

describe('#963 R1 — les liens d\'un bloc cloné', () => {
    const PHRASE = '« Relecture du planisphère » (Activité, semaine 4) se vérifie par « Carnet n°1 » (Évaluation certificative, semaine 4).';
    const blocDe = (donnees, titreLecon) => donnees.lecons.find((l) => l.titre === titreLecon)
        .blocs.find((b) => b.designation === '« Relecture du planisphère »');

    beforeEach(() => ajouterClones());

    it('le clone de semaine 6 écrit le lien de l\'original avec la semaine de l\'original, pas la sienne', () => {
        const d = exporteur.construireDonneesModele();
        expect(blocDe(d, 'Reprendre le carnet').liens).toEqual([PHRASE]);
        expect(JSON.stringify(d)).not.toContain('(Activité, semaine 6) se vérifie par');
    });

    it('un original et son clone reliés à la même évaluation, même semaine : la phrase n\'est écrite qu\'une fois', () => {
        const d = exporteur.construireDonneesModele();
        expect(blocDe(d, 'Tenir un carnet').liens.filter((p) => p === PHRASE)).toHaveLength(1);
    });

    it('le Cadre compte ses semaines de cours, pas la planification ni les examens', () => {
        expect(exporteur.nombreSemainesTrimestre()).toBe(15);
    });
});

describe('#963 — aller simple : générer le modèle n\'écrit rien', () => {
    // ⚠ Le COMPTE des écritures, pas seulement le contenu : réécrire une clé
    // à l'identique laisserait le contenu égal (mutation M5 du lot, survivante
    // tant que ce banc ne comparait que les contenus).
    it('laisse le magasin et la carte identiques, sans une seule écriture', () => {
        const avantStore = JSON.stringify(store);
        const avantNoeuds = JSON.stringify([...api.etat.noeuds.entries()]);
        const avantLiens = JSON.stringify([...api.etat.liens.entries()]);
        ecritures = [];
        exporteur.genererModeleCarte({ etape: 'relier', semaine: 4, nbSemaines: 15 });
        expect(ecritures).toEqual([]);
        expect(JSON.stringify(store)).toBe(avantStore);
        expect(JSON.stringify([...api.etat.noeuds.entries()])).toBe(avantNoeuds);
        expect(JSON.stringify([...api.etat.liens.entries()])).toBe(avantLiens);
    });
});

describe('#963 — le nom du fichier', () => {
    it('dérive du nom de la carte, en caractères sûrs', () => {
        expect(exporteur.nomFichierModele()).toBe('modele-ia-Astronomie-A26-v2.md');
    });
});
