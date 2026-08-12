import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LE RANG DE SÉANCE (#416 lot A) — la séance entre dans le modèle.
//
// Ce que ce lot lève : depuis le 7 août, `analyserRepereTitre` détecte
// « séance 2 » dans un titre mais REFUSE de le retirer, faute d'endroit où
// poser l'information (« la séance n'a pas de logement dans le modèle »).
// Elle en a un désormais.
//
// ⚠ Cette sentinelle est COMPORTEMENTALE : elle instancie la vraie source et
// l'exerce. Trois « vert et inerte » en deux jours au début d'août venaient de
// tests qui cherchaient une chaîne dans le fichier — un `if (false)` devant
// l'appel, un libellé déplacé, et le test restait vert. Deux cas seulement
// sont statiques ici, et ils le disent.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCSS = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

let store;

function monterModule() {
    store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => {
        const el = {
            style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
            enfantsDOM: [],
            classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
            setAttribute() {}, getAttribute: () => null,
            appendChild(c) { el.enfantsDOM.push(c); }, remove() {},
            addEventListener() {}, removeEventListener() {},
            querySelector: () => null, querySelectorAll: () => [],
            closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
        };
        return el;
    };
    const fauxDocument = {
        getElementById: () => null,
        querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, metadata = {}) {
    api.etat.noeuds.set(id, {
        id, type, titre: type, x: 0, y: 0,
        parent: null, enfants: [], metadata, cloneSourceId: null
    });
    return api.etat.noeuds.get(id);
}

// =======================================================================
// 1. LE STOCKAGE EST UN ENTIER, PAS UNE LETTRE
// =======================================================================
describe('Rang de séance · un entier en mémoire, une lettre à l’écran', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('écrit un ENTIER dans metadata.rangSeance', () => {
        poser(api, 'planif-l1', 'lecon');
        expect(api.definirRangSeance('planif-l1', 2)).toBe(true);
        expect(api.etat.noeuds.get('planif-l1').metadata.rangSeance).toBe(2);
        // Le piège que ce cas ferme : stocker 'B' obligerait à retraduire à
        // chaque lecture de l'horaire, qui raisonne en rang.
        expect(api.etat.noeuds.get('planif-l1').metadata.rangSeance).not.toBe('B');
    });

    it('traduit le rang en lettre pour l’affichage seulement', () => {
        expect(api.lettreRangSeance(1)).toBe('A');
        expect(api.lettreRangSeance(2)).toBe('B');
        expect(api.lettreRangSeance(api.RANG_SEANCE_MAX)).toBe('D');
    });

    it('ne traduit RIEN hors des bornes — pas de lettre inventée', () => {
        expect(api.lettreRangSeance(0)).toBe('');
        expect(api.lettreRangSeance(api.RANG_SEANCE_MAX + 1)).toBe('');
        expect(api.lettreRangSeance('B')).toBe('');
        expect(api.lettreRangSeance(null)).toBe('');
    });
});

// =======================================================================
// 2. REMETTRE À VIDE RETIRE LE CHAMP — il ne le met pas à null
// =======================================================================
describe('Rang de séance · « non posé » veut dire absent', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('retire la clé plutôt que d’y poser null', () => {
        const n = poser(api, 'planif-l1', 'lecon');
        api.definirRangSeance('planif-l1', 3);
        expect('rangSeance' in n.metadata).toBe(true);

        api.definirRangSeance('planif-l1', null);
        // Un défaut n'est pas une donnée : même règle que metadata.retroaction
        // (#424 lot E) et que metadata.semaine.
        expect('rangSeance' in n.metadata).toBe(false);
    });

    it('traite la chaîne vide, 0 et NaN comme « non posé »', () => {
        const n = poser(api, 'planif-l1', 'lecon');
        for (const vide of ['', 0, NaN, undefined, 'B']) {
            n.metadata.rangSeance = 2;
            api.definirRangSeance('planif-l1', vide);
            expect('rangSeance' in n.metadata).toBe(false);
        }
    });

    it('refuse un rang hors bornes plutôt que de le tronquer', () => {
        const n = poser(api, 'planif-l1', 'lecon');
        api.definirRangSeance('planif-l1', api.RANG_SEANCE_MAX + 1);
        expect('rangSeance' in n.metadata).toBe(false);
    });
});

// =======================================================================
// 3. LES LEÇONS SEULEMENT — l'asymétrie est délibérée
// =======================================================================
describe('Rang de séance · une séquence n’en a pas', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('refuse d’écrire un rang sur une séquence', () => {
        const s = poser(api, 'planif-s1', 'sequence');
        expect(api.definirRangSeance('planif-s1', 1)).toBe(false);
        expect(s.metadata.rangSeance).toBeUndefined();
    });

    it('ne rend aucun sélecteur pour une séquence ni pour une activité', () => {
        // Une séquence s'étend sur des SEMAINES ; elle n'a pas de rang DANS
        // une semaine. Lui en donner un rouvrirait la contradiction
        // séquence/leçons retirée le 6 août.
        expect(api.selecteurRangSeanceHTML({ type: 'sequence', id: 'planif-s1', metadata: {} })).toBe('');
        expect(api.selecteurRangSeanceHTML({ type: 'activite', id: 'planif-a1', metadata: {} })).toBe('');
        expect(api.selecteurRangSeanceHTML(null)).toBe('');
    });

    it('rend bien un sélecteur pour une leçon', () => {
        const html = api.selecteurRangSeanceHTML({ type: 'lecon', id: 'planif-l1', metadata: { rangSeance: 2 } });
        expect(html).toContain('planif-noeud-seance');
        expect(html).toContain('value="2"');
        expect(html).toContain('>B<');
    });
});

// =======================================================================
// 4. LE RANG ET LA SEMAINE SONT INDÉPENDANTS
// =======================================================================
describe('Rang de séance · il ne passe pas par la grille', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('changer le rang ne touche pas la semaine, et réciproquement', () => {
        const n = poser(api, 'planif-l1', 'lecon');
        api.definirSemaineLecon('planif-l1', 7);
        api.definirRangSeance('planif-l1', 2);
        expect(n.metadata.semaine).toBe(7);
        expect(n.metadata.rangSeance).toBe(2);

        api.definirRangSeance('planif-l1', null);
        expect(n.metadata.semaine).toBe(7); // la semaine survit

        api.definirRangSeance('planif-l1', 1);
        api.definirSemaineLecon('planif-l1', null);
        expect(n.metadata.rangSeance).toBe(1); // le rang survit
    });

    it('rend false quand rien ne change — pas de sauvegarde inutile', () => {
        poser(api, 'planif-l1', 'lecon');
        expect(api.definirRangSeance('planif-l1', 2)).toBe(true);
        expect(api.definirRangSeance('planif-l1', 2)).toBe(false);
    });
});

// =======================================================================
// 5. COERCITION D'UNE VALEUR IMPORTÉE — le rang est une donnée PERSISTÉE
// =======================================================================
describe('Rang de séance · une valeur importée ne traverse pas telle quelle', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('ignore une valeur non numérique venue du stockage', () => {
        // Chemin réel : bibliothèque d'alignements, import inter-trimestre,
        // fichier JSON. Personne ne garantit le type.
        const n = poser(api, 'planif-l1', 'lecon', { rangSeance: 'B' });
        expect(api.rangSeanceDeLecon(n)).toBeNull();
    });

    it('ne laisse pas une valeur hostile sortir dans l’attribut value=', () => {
        // La CSP ne protège pas l'injection d'attributs — même invariant que
        // metadata.duree, cf. sentinelle-inspecteur-duree-coercition.
        const html = api.selecteurRangSeanceHTML({
            type: 'lecon', id: 'planif-l1',
            metadata: { rangSeance: '"><img src=x onerror=alert(1)>' }
        });
        expect(html).not.toContain('<img');
        expect(html).toContain('value=""');
    });

    it('ignore un rang hors bornes déjà persisté', () => {
        expect(api.rangSeanceDeLecon(poser(api, 'planif-l2', 'lecon', { rangSeance: 0 }))).toBeNull();
        expect(api.rangSeanceDeLecon(poser(api, 'planif-l3', 'lecon', { rangSeance: 99 }))).toBeNull();
    });
});

// =======================================================================
// 6. LE SÉLECTEUR ARRIVE DANS L'EN-TÊTE PAR LE RENDU UNIQUE
// =======================================================================
describe('Rang de séance · il est dans l’en-tête, par construction', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('l’en-tête d’une leçon le porte', () => {
        // `contenuNoeudHTML` est le rendu UNIQUE de l'en-tête depuis #437 :
        // passer par lui, et non par le fragment, vérifie que le contrôle est
        // visible quel que soit le chemin qui a créé le nœud.
        const html = api.contenuNoeudHTML({
            id: 'planif-l1', type: 'lecon', titre: 'Introduction',
            metadata: { semaine: 2, rangSeance: 1 }, enfants: []
        });
        expect(html).toContain('planif-noeud-seance');
        expect(html).toContain('planif-noeud-semaine');
    });

    it('l’en-tête d’une activité ne le porte pas', () => {
        const html = api.contenuNoeudHTML({
            id: 'planif-a1', type: 'activite', titre: 'Annoter', metadata: {}, enfants: []
        });
        expect(html).not.toContain('planif-noeud-seance');
    });
});

// =======================================================================
// 7. PEUPLEMENT PARESSEUX ET IDEMPOTENT
// =======================================================================
describe('Rang de séance · la liste se peuple une fois', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    /**
     * ⚠ Ce faux `<select>` MODÉLISE deux comportements du vrai, et il le doit :
     * au premier jet il était un simple objet, et la cassure « on retire
     * `select.value = courant` » restait VERTE — parce qu'un objet nu ne perd
     * pas sa valeur quand on vide ses options. Un stub plus propre que le vrai
     * DOM rend le test complaisant (même leçon que le break-test de #407
     * lot 2, où un faux `db` qui sérialisait rendait la cassure indétectable).
     *
     * Les deux comportements reproduits :
     *   1. vider le contenu efface les options ET remet la valeur à '' ;
     *   2. affecter une valeur qui ne correspond à AUCUNE option la ramène à ''.
     */
    const fauxSelect = () => {
        const el = { dataset: {}, options: [] };
        let valeur = '';
        Object.defineProperty(el, 'value', {
            get: () => valeur,
            set: (v) => {
                valeur = el.options.some((o) => o.value === String(v)) ? String(v) : '';
            }
        });
        Object.defineProperty(el, 'textContent', {
            get: () => '',
            set: () => { el.options = []; valeur = ''; }
        });
        // Compté, et pas seulement stocké : la garde d'idempotence ne se
        // constate PAS sur le nombre final d'options — repeupler produit la
        // même liste. Ce qu'elle promet, c'est de ne pas REFAIRE le travail.
        el.nbAppends = 0;
        el.appendChild = (o) => { el.nbAppends++; el.options.push(o); };
        return el;
    };

    it('pose « — » puis les rangs, et ne refait pas le travail au 2e contact', () => {
        const sel = fauxSelect();
        api.peuplerSelecteurRangSeance(sel);
        expect(sel.options.length).toBe(api.RANG_SEANCE_MAX + 1); // le vide + les rangs
        expect(sel.dataset.peuple).toBe('1');
        const travailFait = sel.nbAppends;

        api.peuplerSelecteurRangSeance(sel);

        // ⚠ Le nombre FINAL d'options ne prouve rien : repeupler produit la
        // même liste. Ce que le rendu paresseux promet, c'est de ne pas
        // refaire le travail — `reconstruireDOM` passe souvent et une carte
        // porte des dizaines de blocs.
        expect(sel.nbAppends).toBe(travailFait);
    });

    it('n’écrase pas la valeur courante en peuplant', () => {
        const sel = fauxSelect();
        // Comme au rendu paresseux : le <select> arrive avec UNE option, celle
        // qui porte la valeur courante. C'est ce que produit
        // `selecteurRangSeanceHTML` — partir d'un select vide ne modéliserait
        // aucun état réel.
        sel.appendChild({ value: '2' });
        sel.value = '2';

        api.peuplerSelecteurRangSeance(sel);

        expect(sel.value).toBe('2');
        expect(sel.options.length).toBe(api.RANG_SEANCE_MAX + 1);
    });
});

// =======================================================================
// 8. CE QUE LE COMPORTEMENT NE PEUT PAS DIRE — deux cas statiques, assumés
// =======================================================================
describe('Rang de séance · le piège de mise en page du 7 août', () => {
    /**
     * Le bloc de règles d'un sélecteur CSS de premier niveau.
     * ⚠ L'ancre exige un DÉBUT DE LIGNE : sans ça, `.planif-noeud-semaine`
     * attrapait `.planif-noeud-rollup + .planif-noeud-semaine`, qui est une
     * règle voisine au contenu opposé. C'est la troisième fois dans ce dépôt
     * qu'une ancre ambiguë fait mentir un test (leçon de #412, 7 août).
     */
    function bloc(selecteur) {
        const i = sourceCSS.indexOf('\n' + selecteur + ' {');
        expect(i, `règle ${selecteur} absente de styles.css`).toBeGreaterThan(-1);
        return sourceCSS.slice(i, sourceCSS.indexOf('}', i));
    }

    it('le rang ne réclame PAS margin-left: auto', () => {
        // #412, 7 août : « Deux éléments réclament margin-left: auto dans le
        // même en-tête : seul le PREMIER doit pousser, sinon ils
        // s'éparpillent. » La semaine pousse ; la séance se colle contre elle.
        expect(bloc('.planif-noeud-seance')).not.toContain('margin-left: auto');
        expect(bloc('.planif-noeud-semaine')).toContain('margin-left: auto');
    });

    it('la cible reste atteignable au doigt sur iPad', () => {
        // 44 px est la règle du projet, et l'opacité doit être levée : sans
        // survol, un contrôle à 0.65 d'opacité est invisible sur iPad.
        const i = sourceCSS.indexOf('.planif-noeud-seance {');
        const tactile = sourceCSS.slice(i).match(/@media \(hover: none\) \{\s*\.planif-noeud-seance \{[^}]*\}/);
        expect(tactile, 'aucun bloc tactile pour .planif-noeud-seance').not.toBeNull();
        expect(tactile[0]).toContain('min-width: 44px');
        expect(tactile[0]).toContain('opacity: 1');
    });
});
