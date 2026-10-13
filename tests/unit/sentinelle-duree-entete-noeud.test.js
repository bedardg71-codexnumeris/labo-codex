import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche, suitDansLaFonction } from './_helpers/tranche.js';

// =======================================================================
// LA DURÉE DESCEND DANS L'EN-TÊTE DU NŒUD — 8 août 2026 (lot B)
// =======================================================================
//
// Le champ « Durée estimée » vivait dans l'Inspecteur, derrière un bouton « + »
// qui le révélait, et le total d'une leçon y était affiché en LECTURE SEULE.
// Deux défauts, un par critère de Grégoire :
//   • on ouvrait un panneau pour lire une information qu'on consulte en
//     survolant sa carte ;
//   • le total était une répétition passive — « l'Inspecteur doit permettre
//     d'ajouter des informations, non pas répéter des informations en lecture
//     seule ».
//
// ▣ CE QUI EST GARDÉ EN MÉMOIRE ICI : `TYPES_AVEC_DUREE` est une liste
// SÉPARÉE de `TYPES_ACTIVITE`, et ce n'est pas un détail. `TYPES_ACTIVITE`
// alimente `normaliserType()`, donc la résolution des verbes de liens : y
// glisser `evaluation` pour lui donner une durée aurait changé EN SILENCE les
// verbes disponibles entre nœuds. Un prédicat par question — « est-ce une tâche
// d'apprentissage ? » et « est-ce que ça consomme du temps de classe ? » ne
// sont pas la même question.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const sourceCss = readFileSync(path.join(racine, 'styles.css'), 'utf8');

// Registre d'éléments DOM OBSERVABLES : `rafraichirRollupsAncetres` écrit dans
// le compteur de chaque ancêtre via `getElementById(...).querySelector(...)`.
// Sans stub enregistrable, la remontée n'a rien où écrire et son effet est
// invisible — c'est exactement ce que le break-test a montré.
let compteursDOM;

function monterModule() {
    const store = {};
    compteursDOM = {};
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
            getElementById: (id) => (id in compteursDOM
                ? { querySelector: (sel) => (sel === '[data-rollup-noeud]' ? compteursDOM[id] : null) }
                : null),
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

function poser(api, id, type, { parent = null, enfants = [], duree = null } = {}) {
    const metadata = {};
    if (duree !== null) metadata.duree = duree;
    api.etat.noeuds.set(id, { id, type, titre: type, x: 0, y: 0, parent, enfants, metadata, cloneSourceId: null });
    return api.etat.noeuds.get(id);
}

/** Déclare un compteur observable pour ce conteneur, et rend le stub. */
function compteurObservable(id) {
    compteursDOM[id] = {
        // On observe `textContent` : le rafraîchissement a cessé d'utiliser
        // `innerHTML` — un point d'injection supprimé vaut mieux qu'un point
        // d'injection annoté « sûr ».
        textContent: '(jamais touché)',
        innerHTML: '(interdit)',
        classList: { toggle(nom, actif) { this[nom] = actif; }, add() {}, remove() {}, contains: () => false }
    };
    return compteursDOM[id];
}

describe('qui porte une durée · le contrat, et ce qu’il EXCLUT', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('les 9 nœuds de déroulement et l’évaluation en portent une', () => {
        for (const type of ['expose', 'activite', 'soutien', 'revision',
                            'ouverture', 'modelisation', 'pratique-guidee',
                            'pratique-autonome', 'cloture', 'evaluation']) {
            const html = api.dureeControleHTML({ id: 'n', type, metadata: { duree: 30 } });
            expect(html, type).toContain('value="30"');
        }
    });

    it('⚠ AUCUN type de connaissance n’en porte — décision de Grégoire', () => {
        // Motif : `dureeRollupNoeud` additionne TOUS les descendants d'une
        // leçon. Une connaissance porteuse de durée serait comptée EN PLUS de
        // l'activité qui l'enseigne — total faux, sans rien pour le signaler.
        for (const type of ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive']) {
            expect(api.dureeControleHTML({ id: 'n', type, metadata: { duree: 30 } }), type).toBe('');
        }
    });

    it('les conteneurs n’ont pas de champ SAISISSABLE — leur durée se déduit', () => {
        for (const type of ['lecon', 'sequence']) {
            expect(api.dureeControleHTML({ id: 'n', type, metadata: { duree: 30 } }), type).toBe('');
        }
    });

    it('⚠ `evaluation` n’a PAS été glissé dans TYPES_ACTIVITE', () => {
        // C'est la garde contre le raccourci tentant. `TYPES_ACTIVITE` pilote
        // `normaliserType`, donc les verbes de liens : y mettre `evaluation`
        // ferait offrir « complète / conduit à » entre deux évaluations, ce qui
        // ne donne rien aujourd'hui.
        expect(api.TYPES_ACTIVITE).not.toContain('evaluation');
        expect(api.normaliserType('evaluation')).toBe('evaluation');
        // Et pourtant elle porte bien une durée : les deux listes divergent.
        expect(api.dureeControleHTML({ id: 'n', type: 'evaluation', metadata: { duree: 5 } })).toContain('value="5"');
    });
});

describe('le compteur de rollup · affichage pur, jamais une saisie', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une leçon somme ses enfants', () => {
        poser(api, 'lec', 'lecon', { enfants: ['a1', 'a2'] });
        poser(api, 'a1', 'expose', { parent: 'lec', duree: 20 });
        poser(api, 'a2', 'activite', { parent: 'lec', duree: 30 });
        expect(api.compteurDureeHTML(api.etat.noeuds.get('lec'))).toContain('50');
    });

    it('une séquence somme ses leçons, en profondeur', () => {
        poser(api, 'seq', 'sequence', { enfants: ['lec'] });
        poser(api, 'lec', 'lecon', { parent: 'seq', enfants: ['a1'] });
        poser(api, 'a1', 'modelisation', { parent: 'lec', duree: 45 });
        expect(api.compteurDureeHTML(api.etat.noeuds.get('seq'))).toContain('45');
    });

    it('vide, il le DIT au lieu de disparaître', () => {
        // Un compteur absent se confond avec « pas encore chargé ». Un « Σ — »
        // dit qu'il n'y a rien à compter, ce qui est une information.
        poser(api, 'lec', 'lecon', { enfants: [] });
        const html = api.compteurDureeHTML(api.etat.noeuds.get('lec'));
        expect(html).toContain('planif-noeud-rollup--vide');
        expect(html).toContain('Σ');
    });

    it('il n’existe pas sur une feuille — elle a son champ, pas un total', () => {
        expect(api.compteurDureeHTML({ id: 'n', type: 'activite', metadata: {} })).toBe('');
        expect(api.compteurDureeHTML({ id: 'n', type: 'factuelle', metadata: {} })).toBe('');
    });

    it('ce n’est jamais un input — on ne peut pas contredire le calcul', () => {
        poser(api, 'lec', 'lecon', { enfants: ['a1'] });
        poser(api, 'a1', 'activite', { parent: 'lec', duree: 10 });
        const html = api.compteurDureeHTML(api.etat.noeuds.get('lec'));
        expect(html).not.toContain('<input');
        expect(html).not.toContain('contenteditable');
    });
});

describe('la remontée du total · la seule logique neuve du lot', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('le total d’une leçon suit la durée de ses enfants', () => {
        poser(api, 'lec', 'lecon', { enfants: ['a1'] });
        const act = poser(api, 'a1', 'activite', { parent: 'lec', duree: 10 });
        expect(api.dureeRollupNoeud(api.etat.noeuds.get('lec'))).toBe(10);
        act.metadata.duree = 75;
        expect(api.dureeRollupNoeud(api.etat.noeuds.get('lec'))).toBe(75);
    });

    it('⚠ la remontée touche TOUS les ancêtres, pas seulement le parent', () => {
        // ⚠ CE TEST EXISTE PARCE QUE LE BREAK-TEST L'A EXIGÉ. La version
        // précédente vérifiait `dureeRollupNoeud(seq)` — or ce calcul RÉCURSE
        // de lui-même et existait avant ce lot : il restait juste quand on
        // arrêtait la remontée DOM au parent direct. On testait le calcul en
        // croyant tester le rafraîchissement. Ici on observe les compteurs
        // réellement réécrits.
        poser(api, 'seq', 'sequence', { enfants: ['lec'] });
        poser(api, 'lec', 'lecon', { parent: 'seq', enfants: ['a1'] });
        poser(api, 'a1', 'activite', { parent: 'lec', duree: 60 });
        const cLec = compteurObservable('lec');
        const cSeq = compteurObservable('seq');

        api.rafraichirRollupsAncetres('a1');

        expect(cLec.textContent, 'la leçon (parent direct)').toContain('60');
        expect(cSeq.textContent, 'la séquence (grand-parent)').toContain('60');
        // Et surtout : la remontée n'écrit JAMAIS par innerHTML.
        expect(cLec.innerHTML).toBe('(interdit)');
        expect(cSeq.innerHTML).toBe('(interdit)');
    });

    it('un total retombé à zéro repasse en état « vide »', () => {
        poser(api, 'lec', 'lecon', { enfants: ['a1'] });
        poser(api, 'a1', 'activite', { parent: 'lec', duree: 0 });
        const cLec = compteurObservable('lec');
        api.rafraichirRollupsAncetres('a1');
        expect(cLec.textContent).toContain('Σ');
        expect(cLec.classList['planif-noeud-rollup--vide']).toBe(true);
    });

    it('une chaîne de parents cyclique ne fait pas boucler la remontée', () => {
        // Garde-fou : `rafraichirRollupsAncetres` remonte par `parent`. Une
        // donnée corrompue (import, migration ratée) ne doit pas figer l'app.
        poser(api, 'x', 'lecon', { parent: 'y' });
        poser(api, 'y', 'lecon', { parent: 'x' });
        expect(() => api.rafraichirRollupsAncetres('x')).not.toThrow();
    });

    it('la remontée ne reconstruit PAS le DOM — sinon le focus serait perdu', () => {
        // Taper dans le champ de durée re-rendrait le nœud qu'on est en train
        // de remplir : le curseur sauterait à chaque caractère.
        const corps = tranche(sourceCarte, 'function rafraichirRollupsAncetres', 'function selecteurSemaineHTML');
        expect(corps).not.toContain('reconstruireDOM');
    });
});

describe('l’Inspecteur ne répète plus la durée', () => {
    it('les deux blocs sont partis, avec leur CSS', () => {
        expect(sourceCarte).not.toContain('planif-duree-section');
        expect(sourceCarte).not.toContain('planif-duree-min');
        expect(sourceCarte).not.toContain('planif-duree-ajouter');
        expect(sourceCarte).not.toContain('function recalcDuree');
        expect(sourceCss).not.toContain('.planif-duree-calc');
        expect(sourceCss).not.toContain('.planif-duree-ajouter');
        expect(sourceCss).not.toContain('.planif-duree-rollup');
    });

    it('l’étendue dérivée de la séquence, elle, RESTE — ce n’est pas une durée', () => {
        // Elle décrit QUAND, pas COMBIEN DE TEMPS : rien dans l'en-tête ne la
        // redouble. Une ablation trop large l'aurait emportée au passage.
        expect(sourceCarte).toContain('planif-panneau-derive');
        expect(sourceCss).toContain('.planif-panneau-derive');
    });
});

describe('le champ dans l’en-tête · un contrôle vivant sur un bloc qui se glisse', () => {
    it('la pression est arrêtée, sinon le nœud partirait en déplacement', () => {
        // Même précaution que le sélecteur de semaine : au doigt, la pression
        // et le glisser sont le début du même geste.
        const corps = sourceCarte.slice(
            sourceCarte.indexOf("var champDuree = el.querySelector('.planif-noeud-duree')"),
            sourceCarte.indexOf('=== POIGNÉE DE REDIMENSIONNEMENT')
        );
        expect(suitDansLaFonction(corps, /\['pointerdown', 'mousedown', 'click', 'dblclick'\]/, /stopPropagation/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('la saisie est annulable, et se propage aux instances clonées', () => {
        const corps = sourceCarte.slice(
            sourceCarte.indexOf("var champDuree = el.querySelector('.planif-noeud-duree')"),
            sourceCarte.indexOf('=== POIGNÉE DE REDIMENSIONNEMENT')
        );
        expect(corps).toContain('enregistrerPourUndo');
        // ⚠ La propagation VOYAGE avec le champ : un nœud cloné est une
        // instance liée, sa durée est la même partout.
        expect(corps).toContain("propagerModification(id, 'metadata'");
        expect(corps).toContain('rafraichirRollupsAncetres(id)');
        expect(corps).toContain('sauvegarder()');
    });

    it('l’input est TOUJOURS visible — pas de révélation au clic', () => {
        // Décision de Grégoire, cohérente avec la friction F1 : rendre la
        // fonction visible plutôt que devinable. Un placeholder tient lieu de
        // vide, aucun `display:none` conditionnel.
        const corps = tranche(sourceCarte, 'function dureeControleHTML', 'function compteurDureeHTML');
        expect(corps).toContain('placeholder="—"');
        expect(corps).not.toContain('display:none');
    });

    it('la cible tactile est prévue pour l’iPad', () => {
        // ⚠ La première version cherchait `@media (hover: none)` suivi de
        // `.planif-noeud-duree` à moins de 200 caractères. Le break-test l'a
        // trouvée VERTE après suppression de la règle : le fichier contient
        // PLUSIEURS blocs `@media (hover: none)`, et la regex se satisfaisait
        // d'un autre. Même faux-vert que le 7 août — une assertion contentée
        // par un fragment voisin. On ancre donc sur le bloc précis.
        const bloc = sourceCss.slice(
            sourceCss.indexOf('/* iPad : la cible doit rester atteignable au doigt'),
            sourceCss.indexOf('.mode-clair .planif-noeud-duree')
        );
        expect(bloc).toContain('@media (hover: none)');
        expect(bloc).toMatch(/\.planif-noeud-duree \{[^}]*min-height/);
    });
});
