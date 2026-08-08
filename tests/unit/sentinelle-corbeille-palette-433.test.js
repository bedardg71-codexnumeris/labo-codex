import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — la corbeille de la palette (#433, 8 août 2026)
// =======================================================================
//
// Constat terrain de Grégoire : « pas possible de supprimer des éléments
// sur iPad ». Vérification au code : la suppression EST atteignable, mais
// en TROIS gestes (sélectionner → bouton 🕵️ Inspecteur → Supprimer), les
// deux chemins directs supposant un clavier (touche Suppr) ou un
// double-clic (ouverture de l'Inspecteur au canevas). La corbeille ramène
// le geste à UN, sur le seul mécanisme prouvé fiable au doigt (#148).
//
// Ce qui est verrouillé ici :
//   A. le dépôt est résolu par GÉOMÉTRIE, jamais par la cible de
//      l'événement — pendant un drag, l'élément sous le doigt est le nœud
//      qu'on déplace, pas ce qu'il survole ;
//   B. déposer supprime réellement le nœud ;
//   C. les trois `onUp` du drag sortent ANTICIPÉ après un dépôt — sans
//      quoi le rattachement s'exécuterait sur un nœud disparu ;
//   D. la corbeille est une cible tactile (44 px) et vit dans la palette.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

let api;
let corbeille;
let toasts;

/** Le rectangle que le faux DOM sert pour la corbeille. */
const RECT_CORBEILLE = { left: 10, right: 110, top: 500, bottom: 560 };

function monterModule() {
    toasts = [];
    corbeille = {
        id: 'planif-corbeille',
        offsetParent: {},              // visible (null = palette masquée)
        classes: new Set(),
        classList: {
            add(c) { corbeille.classes.add(c); },
            remove(c) { corbeille.classes.delete(c); },
            contains: (c) => corbeille.classes.has(c),
            toggle(c, on) { on ? corbeille.classes.add(c) : corbeille.classes.delete(c); }
        },
        getBoundingClientRect: () => RECT_CORBEILLE
    };
    const elements = { 'planif-corbeille': corbeille };

    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const db = {
        getSync: (k, d) => (d !== undefined ? d : null),
        setSync: () => {}, get: async (k, d) => d, set: async () => {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: (id) => elements[id] || null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    return api;
}

function poserNoeud(id, type, titre) {
    api.etat.noeuds.set(id, {
        id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null
    });
}

beforeEach(() => {
    monterModule();
    poserNoeud('n-1', 'activite', 'Atelier d’analyse');
});

describe('#433 · A — le dépôt se résout par géométrie', () => {
    it('un point DANS le rectangle de la corbeille est reconnu', () => {
        expect(api.pointSurCorbeille(60, 530)).toBe(true);
    });

    it('un point à côté ne l’est pas', () => {
        expect(api.pointSurCorbeille(60, 400), 'au-dessus').toBe(false);
        expect(api.pointSurCorbeille(300, 530), 'à droite').toBe(false);
    });

    it('palette masquée (offsetParent null) → aucun dépôt possible', () => {
        // Sans ce garde, un dépôt « fantôme » serait possible sur une
        // corbeille invisible, à des coordonnées héritées.
        corbeille.offsetParent = null;
        expect(api.pointSurCorbeille(60, 530)).toBe(false);
    });
});

describe('#433 · B — déposer supprime vraiment', () => {
    it('relâché SUR la corbeille : le nœud disparaît, la fonction le dit', () => {
        const supprime = api.deposerDansCorbeille({ clientX: 60, clientY: 530 }, 'n-1');
        expect(supprime).toBe(true);
        expect(api.etat.noeuds.has('n-1')).toBe(false);
    });

    it('relâché AILLEURS : rien n’est supprimé, la fonction le dit', () => {
        const supprime = api.deposerDansCorbeille({ clientX: 600, clientY: 200 }, 'n-1');
        expect(supprime).toBe(false);
        expect(api.etat.noeuds.has('n-1')).toBe(true);
    });

    it('un nœud déjà disparu ne déclenche pas de suppression fantôme', () => {
        expect(api.deposerDansCorbeille({ clientX: 60, clientY: 530 }, 'inconnu')).toBe(false);
    });

    it('sans événement (drag annulé), rien ne se passe', () => {
        expect(api.deposerDansCorbeille(null, 'n-1')).toBe(false);
        expect(api.etat.noeuds.has('n-1')).toBe(true);
    });
});

describe('#433 · C — les trois onUp sortent ANTICIPÉ après un dépôt', () => {
    // Sans le retour anticipé, `rattacherAuConteneur` / `detacherDuConteneur`
    // s'exécuteraient sur un nœud qui n'existe plus.
    it('chaque onUp teste la corbeille et retourne', () => {
        const appels = sourceCarte.match(/if \(deposerDansCorbeille\(e2, id\)\) return;/g) || [];
        expect(appels.length, 'un par cas de drag (B, C, D)').toBe(3);
    });

    it('le test précède le rattachement dans chaque onUp', () => {
        for (const nom of ['onUpB', 'onUpC', 'onUpD']) {
            const debut = sourceCarte.indexOf('function ' + nom + '(');
            expect(debut, nom).toBeGreaterThan(-1);
            const fin = sourceCarte.indexOf('\n        }', debut + 10);
            const corps = sourceCarte.slice(debut, fin > debut ? fin : debut + 2000);
            const iCorbeille = corps.indexOf('deposerDansCorbeille');
            const iRattache = corps.search(/rattacherAuConteneur|detacherDuConteneur/);
            expect(iCorbeille, nom + ' teste la corbeille').toBeGreaterThan(-1);
            if (iRattache > -1) {
                expect(iCorbeille, nom + ' teste AVANT de rattacher').toBeLessThan(iRattache);
            }
        }
    });
});

describe('#433 · D — la corbeille est une vraie cible tactile', () => {
    it('elle vit dans la palette des nœuds, avec un libellé', () => {
        expect(sourceIndex).toContain('id="planif-corbeille"');
        expect(sourceIndex).toContain('planif-corbeille-libelle');
        // Un titre ET un aria-label : au doigt, le survol n'existe pas.
        expect(sourceIndex).toMatch(/id="planif-corbeille"[^>]*aria-label="/);
    });

    it('elle mesure au moins 44 px de haut (cible tactile iPad)', () => {
        const regle = css.match(/\.planif-corbeille \{[^}]*\}/);
        expect(regle).not.toBeNull();
        expect(regle[0]).toMatch(/min-height:\s*44px/);
    });

    it('elle porte touch-action:none — le geste appartient au drag (#148)', () => {
        const regle = css.match(/\.planif-corbeille \{[^}]*\}/);
        expect(regle[0]).toMatch(/touch-action:\s*none/);
    });

    it('les deux modes sont couverts et les couleurs viennent de la palette', () => {
        expect(css).toContain('.mode-clair .planif-corbeille-survol');
        // Anti-pattern du projet : aucune couleur inventée hors variables.
        const bloc = css.slice(css.indexOf('.planif-corbeille {'), css.indexOf('.planif-palette-bas-btns {'));
        expect(bloc).not.toMatch(/var\(--danger[,)]/); // token inexistant dans la palette
        expect(bloc).toContain('var(--rouge-erreur');
    });
});
