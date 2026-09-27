import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// LE GRAPHE ACCUEILLE L'ENSEIGNEMENT — 8 août 2026 (lot A)
// =======================================================================
//
// DEUX choses ici, et elles tiennent ensemble.
//
// 1. ⚠ CORRECTIF #415. Les cinq nœuds d'enseignement explicite livrés le
//    7 août sont entrés dans TYPES, TYPES_ACTIVITE, TYPES_SERVANTS_OBJECTIF et
//    la palette — mais JAMAIS dans `VERBES_AUTO`. Ils y avaient zéro paire, et
//    `VERBES_HORIZONTAUX` n'a pas de `connaissance>activite` : relier une
//    connaissance à une Modélisation rendait `null`, c'est-à-dire le toast
//    « Ce lien n'est pas possible ». Ils avaient une couleur, une durée, une
//    place dans la leçon — et aucune relation. Décoratifs au sens strict.
//
// 2. Le nœud « Exposé » (décision Grégoire). Il manquait un nœud pour dire
//    « j'enseigne » : la famille était tournée vers l'ÉLÈVE qui agit, et
//    l'enseignant n'apparaissait qu'à l'intérieur d'UNE méthode. Complément
//    des cinq nœuds d'EE, pas leur substitut.
//
// ▣ CE QUI EST GARDÉ EN MÉMOIRE ICI : ajouter un type à une palette ne
// l'ajoute pas au MODÈLE. Un nœud qui ne se relie à rien est un dessin. Le
// correctif ne consiste pas à écrire les ~50 paires manquantes — ce serait
// l'empilement que le projet refuse, et il faudrait recommencer au type
// suivant — mais à rabattre sur la FAMILLE, comme #415 avait rabattu les six
// triplets en dur sur TYPES_ACTIVITE.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racine, 'styles.css'), 'utf8');

// --- Sandbox ------------------------------------------------------------
// ⚠ Les invariants de LIEN sont vérifiés en COMPORTEMENT, jamais en lecture de
// source : le 8 août, deux assertions qui cherchaient un appel dans le texte
// sont restées vertes alors que l'appel était mis en commentaire. On monte donc
// le module et on regarde le lien qui se crée réellement.
let elements;

function monterModule() {
    const store = {};
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }
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
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: (id) => elements[id] || null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type) {
    api.etat.noeuds.set(id, { id, type, titre: type, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null });
}

/**
 * Pose deux nœuds réels, demande au module ce qu'il ferait de ce lien, et
 * nettoie derrière. On EXERCE `resoudreVerbe` — c'est la fonction que le geste
 * de l'utilisateur appelle, et celle qui décide entre « lien créé avec tel
 * verbe », « popup de choix » et « Ce lien n'est pas possible ».
 */
function verbeEntre(api, typeSource, typeCible) {
    poser(api, 'n-src', typeSource);
    poser(api, 'n-cbl', typeCible);
    const res = api.resoudreVerbe('n-src', 'n-cbl');
    api.etat.noeuds.delete('n-src');
    api.etat.noeuds.delete('n-cbl');
    return res;
}

describe('correctif #415 · les nœuds d’enseignement explicite se relient enfin', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une connaissance procédurale s’acquiert par une MODÉLISATION', () => {
        const r = verbeEntre(api, 'procedurale', 'modelisation');
        expect(r).not.toBeNull();
        expect(r.verbe).toBe('s_acquiert_par');
        expect(r.type).toBe('vertical'); // verbe automatique, pas un popup de choix
    });

    it('les cinq étapes de la méthode sont couvertes, pas seulement la modélisation', () => {
        // ⚠ L'INVARIANT DE #415 EST « ELLES SE RELIENT », PAS « ELLES PORTENT
        // CE VERBE-LÀ ». Le verbe unique était la CONSÉQUENCE du repli sur la
        // famille, pas le propos du correctif : le défaut d'origine était un
        // `null`, c'est-à-dire « ce lien n'est pas possible ».
        // Aucune des cinq ne doit donc rendre null — c'est ce qui est verrouillé.
        for (const etape of ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']) {
            const r = verbeEntre(api, 'conceptuelle', etape);
            expect(r, `conceptuelle → ${etape}`).not.toBeNull();
            expect(r.type, `conceptuelle → ${etape}`).toBe('vertical');
        }
    });

    it('⚠ l’OUVERTURE fait exception : on y RÉACTIVE, on n’y acquiert pas', () => {
        // Retour terrain de Grégoire, 15 août 2026 : « comme j'ai en Ouverture
        // une révision de concepts de la leçon précédente, il faudrait revoir
        // le verbe ». Une connaissance reliée à une Ouverture recevait
        // « s'acquiert par » — le verbe de l'acquisition INITIALE — alors
        // qu'elle est déjà acquise et qu'on la remet en service.
        expect(verbeEntre(api, 'conceptuelle', 'ouverture').verbe).toBe('se_reactive_dans');

        // « Révision et réutilisation » a la MÊME nature, et l'a rejointe le
        // 15 août sur décision de Grégoire : de la pratique répartie sur un
        // acquis, pas une première rencontre. Les huit paires explicites qui
        // disaient l'inverse ont été retirées de `VERBES_AUTO`.
        expect(verbeEntre(api, 'conceptuelle', 'revision').verbe).toBe('se_reactive_dans');
    });

    it('les QUATRE autres étapes gardent « s’acquiert par »', () => {
        // La contrepartie du cas précédent : l'exception doit rester une
        // exception. Une Modélisation ou une Pratique guidée fait bien
        // ACQUÉRIR — c'est là que la connaissance se construit.
        for (const etape of ['modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']) {
            expect(verbeEntre(api, 'conceptuelle', etape).verbe, `conceptuelle → ${etape}`)
                .toBe('s_acquiert_par');
        }
    });

    it('la réactivation INVERSE aussi la direction du lien', () => {
        // Quel que soit le sens du geste, le lien se pose de la connaissance
        // vers l'étape — même règle que pour « s'acquiert par ».
        const r = verbeEntre(api, 'ouverture', 'metacognitive');
        expect(r.verbe).toBe('se_reactive_dans');
        expect(r.source).toBe('n-cbl');   // la connaissance devient la source
        expect(r.cible).toBe('n-src');
    });

    it('le sens inverse marche aussi, et il INVERSE la direction du lien', () => {
        // `activite>factuelle` porte `inverser: true` : le lien se pose de la
        // connaissance vers l'activité, quel que soit le sens du geste.
        const r = verbeEntre(api, 'modelisation', 'factuelle');
        expect(r).not.toBeNull();
        expect(r.verbe).toBe('s_acquiert_par');
        expect(r.source).toBe('n-cbl'); // la connaissance devient la source
        expect(r.cible).toBe('n-src');
    });

    it('une étape de méthode ne se relie PAS à une évaluation (#964)', () => {
        // ↻ RÉANCRÉ LE 27 SEPT. 2026 (#964), délibérément : décision didactique de
        // Grégoire, une évaluation se relie UNIQUEMENT à des objectifs, cochés
        // dans son Inspecteur. Les seize paires « …>evaluation » sont retirées de
        // VERBES_AUTO ; tracer vers une évaluation est refusé. Les liens déjà
        // tracés restent lus (sentinelle-badges-objectifs-964).
        expect(verbeEntre(api, 'pratique-autonome', 'evaluation')).toBeNull();
    });
});

describe('le repli est un SECOURS, jamais un remplacement', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('le BRUT gagne toujours sur la famille — même verbe différent', () => {
        // ⚠ CE TEST EXISTE PARCE QUE LE BREAK-TEST L'A EXIGÉ. La version
        // précédente listait des paires existantes et vérifiait leur verbe :
        // elle est restée VERTE quand on a fait passer le repli DEVANT la
        // correspondance brute. Motif : dans la table actuelle, chaque paire
        // brute porte le MÊME verbe que son équivalent de famille
        // (`soutien>evaluation` et `activite>evaluation` disent tous deux
        // « se vérifie par »), donc inverser l'ordre ne change rien
        // d'observable. L'invariant était vrai, l'assertion aveugle.
        //
        // On rend l'ordre observable : on donne temporairement à une paire
        // brute un verbe distinctif, et on vérifie que c'est LUI qui sort.
        // Le jour où un type de la famille méritera un verbe à lui, cette
        // sentinelle sera la seule à protéger sa priorité.
        // ⚠ SECONDE LEÇON DU MÊME BREAK-TEST : le premier cas discriminant
        // choisi (`soutien>evaluation`) était du MAUVAIS CÔTÉ.
        // `normaliserType('evaluation')` rend `'evaluation'` — la clé « de
        // famille » était donc IDENTIQUE à la clé brute, et la mutation restait
        // invisible. Il faut que la CIBLE appartienne à la famille d'activité
        // pour que les deux clés diffèrent : `factuelle>soutien` (brut) contre
        // `factuelle>activite` (famille).
        const table = api.VERBES_AUTO;
        const memoire = table['factuelle>soutien'];
        try {
            table['factuelle>soutien'] = { verbe: 'conduit_a' };
            const r = verbeEntre(api, 'factuelle', 'soutien');
            expect(r).not.toBeNull();
            // Si le repli passait devant, on lirait `s_acquiert_par`, hérité de
            // `factuelle>activite` via normaliserType('soutien') === 'activite'.
            expect(r.verbe).toBe('conduit_a');
        } finally {
            table['factuelle>soutien'] = memoire;
        }
        // Et la table est bien rendue intacte.
        expect(verbeEntre(api, 'factuelle', 'soutien').verbe).toBe('s_acquiert_par');
    });

    it('les paires brutes existantes gardent EXACTEMENT leur verbe', () => {
        // Non-régression : si le repli passait devant, ces verbes changeraient.
        const attendus = [
            ['factuelle', 'activite', 's_acquiert_par'],
            ['conceptuelle', 'soutien', 's_acquiert_par'],
            // (#964 : les paires « …>evaluation » ne sont plus des paires brutes.)
            ['competence', 'idee-maitresse', 'se_decline_en'],
            ['idee-maitresse', 'lecon', 'se_concretise_dans']
        ];
        for (const [src, cbl, verbe] of attendus) {
            const r = verbeEntre(api, src, cbl);
            expect(r, `${src} → ${cbl}`).not.toBeNull();
            expect(r.verbe, `${src} → ${cbl}`).toBe(verbe);
        }
    });

    it('le repli n’ouvre PAS tout — un lien absurde reste refusé', () => {
        // Une leçon ne « s'acquiert » pas par une compétence : aucune paire, ni
        // brute ni de famille. Si le repli rendait un verbe ici, il serait trop
        // large et la carte accepterait n'importe quelle relation.
        expect(verbeEntre(api, 'lecon', 'competence')).toBeNull();
        expect(verbeEntre(api, 'sequence', 'factuelle')).toBeNull();
    });

    it('les verbes horizontaux restent un CHOIX, pas un automatisme', () => {
        // Deux connaissances entre elles : plusieurs relations possibles, donc
        // un popup. Le repli ne doit pas transformer ce choix en verbe imposé.
        const r = verbeEntre(api, 'factuelle', 'conceptuelle');
        expect(r).not.toBeNull();
        expect(r.type).toBe('horizontal');
        expect(Array.isArray(r.verbes)).toBe(true);
    });
});

describe('nœud « Exposé » · le temps de parole du prof entre dans la carte', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('il hérite des verbes par la famille, sans une seule paire écrite', () => {
        const r = verbeEntre(api, 'conceptuelle', 'expose');
        expect(r).not.toBeNull();
        expect(r.verbe).toBe('s_acquiert_par');
        // La preuve que c'est bien le repli qui opère : aucune paire `expose`
        // n'existe dans la table.
        expect(sourceCarte).not.toMatch(/'[a-z-]+>expose'\s*:/);
        expect(sourceCarte).not.toMatch(/'expose>[a-z-]+'\s*:/);
    });

    it('il ne se relie PAS à une évaluation (#964)', () => {
        // ↻ RÉANCRÉ LE 27 SEPT. 2026 (#964), délibérément : décision didactique de
        // Grégoire, une évaluation se relie UNIQUEMENT à des objectifs, cochés
        // dans son Inspecteur. Les seize paires « …>evaluation » sont retirées de
        // VERBES_AUTO ; tracer vers une évaluation est refusé. Les liens déjà
        // tracés restent lus (sentinelle-badges-objectifs-964).
        expect(verbeEntre(api, 'expose', 'evaluation')).toBeNull();
    });

    it('c’est un frère d’Activité : durée, rollup, objectifs servis, leçon', () => {
        expect(api.TYPES_ACTIVITE).toContain('expose');
        expect(api.TYPES_SERVANTS_OBJECTIF).toContain('expose');
        // `peutContenir` s'appuie sur TYPES_ACTIVITE : une leçon l'accepte.
        expect(api.peutContenir('lecon', 'expose')).toBe(true);
    });

    it('il porte un niveau cognitif — contrairement aux étapes de méthode', () => {
        // On n'expose pas pour mémoriser comme on expose pour analyser. Les
        // cinq étapes d'EE, elles, restent délibérément exclues (7 août).
        expect(sourceCarte).toMatch(/TYPES_AVEC_NIVEAU_COGNITIF = \[[^\]]*'expose'/);
        expect(sourceCarte).not.toMatch(/TYPES_AVEC_NIVEAU_COGNITIF = \[[^\]]*'modelisation'/);
    });

    it('sa durée entre dans le rollup de la leçon', () => {
        poser(api, 'lec', 'lecon');
        poser(api, 'exp', 'expose');
        api.etat.noeuds.get('exp').metadata.duree = 25;
        api.etat.noeuds.get('exp').parent = 'lec';
        api.etat.noeuds.get('lec').enfants = ['exp'];
        // C'est tout l'objet du nœud : que le temps de parole du prof COMPTE.
        expect(api.dureeRollupNoeud(api.etat.noeuds.get('lec'))).toBe(25);
    });
});

describe('palette · le nœud existe pour l’enseignant, et la famille ne ment plus', () => {
    it('le bouton est là, EN TÊTE de sa famille', () => {
        const iExpose = sourceIndex.indexOf('data-type="expose"');
        const iActivite = sourceIndex.indexOf('data-type="activite"');
        expect(iExpose).toBeGreaterThan(-1);
        expect(iActivite).toBeGreaterThan(-1);
        expect(iExpose).toBeLessThan(iActivite); // c'est souvent ce qui ouvre
    });

    it('la famille s’appelle « Déroulement » — plus « Mise en action »', () => {
        // Un nom tourné vers l'élève qui agit mentait sur un membre qui est le
        // temps de parole du prof.
        // #444 : l'étiquette est un <button> portant un chevron avant le texte.
        expect(sourceIndex).toMatch(/planif-comment-enseigner"[^>]*>[\s\S]{0,80}?Déroulement/);
        expect(sourceIndex).not.toContain('>Mise en action<');
    });

    it('il a sa couleur, déclarée en variable et non en dur', () => {
        expect(sourceCss).toContain('--planif-couleur-expose:');
        expect(sourceIndex).toContain('var(--planif-couleur-expose)');
    });
});
