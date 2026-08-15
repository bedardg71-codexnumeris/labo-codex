import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// CHANGER DE PHASE SANS RECRÉER LE BLOC (retour Grégoire, 15 août 2026)
//
// « Quand je monte un alignement, il serait pratique de pouvoir changer de
// phase d'enseignement sans nécessairement créer un nouveau bloc et y coller
// le contenu. » Suivi de la bonne question : « est-ce que ça aurait un effet
// sur la prise qu'on peut avoir sur un bloc dans son en-tête ? »
//
// Oui. Et c'est l'objet de la moitié de ce fichier.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');

let store;
let win;
function monter() {
    store = {};
    win = chargerScript('js/planification-carte.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (f) => { f(); return 0; }
    });
    win.cle = (k) => k;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'c1' }), sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    return win.planificationCarte;
}

function poser(api, id, type, extra) {
    api.etat.noeuds.set(id, Object.assign({
        id, type, titre: 'Bloc', x: 0, y: 0, parent: null, enfants: [],
        metadata: {}, cloneSourceId: null
    }, extra || {}));
    return api.etat.noeuds.get(id);
}

describe('A · la bascule de phase, et sa BORNE', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('bascule d’une phase vers une autre', () => {
        poser(api, 'n1', 'pratique-guidee');
        expect(api.definirPhaseEE('n1', 'pratique-autonome')).toBe(true);
        expect(api.etat.noeuds.get('n1').type).toBe('pratique-autonome');
    });

    it('les cinq phases sont EXACTEMENT celles de la méthode', () => {
        expect(api.PHASES_EE).toEqual(
            ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']);
    });

    it('⚠ REFUSE de sortir de la famille — la borne est dans la PORTE', () => {
        // Décision de Grégoire : la bascule s'arrête aux cinq phases. Exposé,
        // Activité, Soutien et Révision sont techniquement interchangeables
        // (même `TYPES_ACTIVITE`, même durée, mêmes objectifs servis), mais
        // passer de « pratique autonome » à « exposé » n'est plus un changement
        // de PHASE, c'est un changement de NATURE.
        //
        // ⚠ La borne est vérifiée DANS la porte, pas seulement dans le <select>
        // qui l'appelle : un menu, un raccourci ou un import qui l'appellerait
        // demain hériterait sinon d'une liberté que personne n'a décidée.
        poser(api, 'n1', 'pratique-guidee');
        expect(api.definirPhaseEE('n1', 'activite')).toBe(false);
        expect(api.definirPhaseEE('n1', 'evaluation')).toBe(false);
        expect(api.etat.noeuds.get('n1').type).toBe('pratique-guidee');

        // Et dans l'autre sens : un bloc qui n'est pas une phase ne le devient pas.
        poser(api, 'n2', 'activite');
        expect(api.definirPhaseEE('n2', 'pratique-guidee')).toBe(false);
        expect(api.etat.noeuds.get('n2').type).toBe('activite');
    });

    it('la durée et les objectifs servis SURVIVENT à la bascule', () => {
        // C'est ce qui rend la bascule sûre : les cinq phases sont dans les
        // mêmes tables (`TYPES_AVEC_DUREE`, `TYPES_SERVANTS_OBJECTIF`). Si l'une
        // en sortait, une bascule perdrait une durée en silence.
        poser(api, 'n1', 'ouverture', { metadata: { duree: 25, objectifsServis: ['obj-1'] } });
        api.definirPhaseEE('n1', 'cloture');
        const m = api.etat.noeuds.get('n1').metadata;
        expect(m.duree).toBe(25);
        expect(m.objectifsServis).toEqual(['obj-1']);
        api.PHASES_EE.forEach((t) => {
            expect(api.TYPES_AVEC_DUREE, t).toContain(t);
            expect(api.TYPES_SERVANTS_OBJECTIF, t).toContain(t);
        });
    });

    it('un clone suit la phase de sa source', () => {
        // ⚠ LE CLONE EST FABRIQUÉ PAR LE MODULE, pas posé à la main. Première
        // version : un nœud avec `cloneSourceId` écrit directement dans la
        // Map. Le test échouait — et il avait RAISON de le faire : les clones
        // se résolvent par `_cloneIndex`, un index privé alimenté à la
        // création. Un clone fabriqué à la main n'y est pas, donc le cas ne
        // testait pas la propagation, il testait mon montage.
        // ⮕ `clonerNoeud` a été essayé et écarté : il touche le DOM, absent du
        // bac à sable. On passe donc par `chargerCarte`, le chemin que suit un
        // import réel — et qui reconstruit l'index.
        win.planificationDonnees.chargerCarte = () => ({
            compteur: 2, compteurLiens: 0, liens: [],
            noeuds: [
                { id: 'src', type: 'modelisation', titre: 'Bloc', x: 0, y: 0,
                  parent: null, enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'copie', type: 'modelisation', titre: 'Bloc', x: 60, y: 60,
                  parent: null, enfants: [], metadata: {}, cloneSourceId: 'src' }
            ]
        });
        api.chargerCarte('c1');
        // ⚠ Le chargeur PRÉFIXE les ids (`src` → `planif-src`) et réécrit les
        // `cloneSourceId` en conséquence. Viser les ids bruts faisait échouer
        // le cas pour une raison qui n'était pas celle qu'il teste.
        const src = 'planif-src', copie = 'planif-copie';
        expect(api.etat.noeuds.get(copie), 'la carte d’essai ne s’est pas chargée').toBeTruthy();
        expect(api.etat.noeuds.get(copie).cloneSourceId,
            'le lien de clonage n’a pas survécu au chargement').toBe(src);

        api.definirPhaseEE(src, 'cloture');
        expect(api.etat.noeuds.get(copie).type).toBe('cloture');
    });
});

describe('B · LA PRISE — ce que le sélecteur retire, la poignée le rend', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('un bloc de phase reçoit poignée + sélecteur ; les autres gardent leur libellé', () => {
        poser(api, 'n1', 'pratique-autonome');
        const html = api.contenuNoeudHTML(api.etat.noeuds.get('n1'));
        expect(html).toContain('planif-noeud-prise');
        expect(html).toContain('planif-noeud-phase');
        // Les cinq phases sont offertes, et seulement elles.
        api.PHASES_EE.forEach((t) => expect(html).toContain('value="' + t + '"'));
        expect(html).not.toContain('value="activite"');

        poser(api, 'n2', 'activite');
        const autre = api.contenuNoeudHTML(api.etat.noeuds.get('n2'));
        expect(autre).toContain('planif-noeud-type');
        expect(autre).not.toContain('planif-noeud-prise');
        expect(autre).not.toContain('planif-noeud-phase');
    });

    it('⚠ le SÉLECTEUR coupe le geste, la POIGNÉE le laisse passer', () => {
        // Le glisser part d'un `pointerdown` sur le bloc entier. Un <select> doit
        // donc couper la propagation, sinon il est inutilisable au doigt — mais
        // c'est exactement ce qui lui retire son rôle de PRISE. La poignée ne
        // porte AUCUN écouteur : c'est ce qui la rend saisissable.
        // ⮕ L'asymétrie EST le correctif. « Harmoniser » les deux le défait.
        expect(source).toMatch(
            /selPhase\.addEventListener\(evt, function\(e\) \{ e\.stopPropagation\(\); \}\)/);
        // ⚠ ORACLE REFAIT. Le premier cherchait « pas d'addEventListener dans
        // les 400 caractères suivant `planif-noeud-prise` » — il rougissait sur
        // un COMMENTAIRE qui nomme la poignée près d'un écouteur voisin. Il
        // mesurait la prose, pas le code. Celui-ci dit la vraie condition :
        // AUCUN code ne va chercher la poignée, donc personne ne peut lui
        // poser d'écouteur.
        expect(source).not.toMatch(/querySelector\w*\(['"][^'"]*planif-noeud-prise/);
        expect(source).not.toMatch(/getElementsByClassName\(['"]planif-noeud-prise/);
    });

    it('la poignée offre une vraie cible tactile, sans peser sur l’en-tête', () => {
        // Elle ne fait que 10 px dessinés. Rendre la prise sans la rendre
        // SAISISSABLE n'aurait rien réglé : on retirait 115 px pour en rendre 10.
        const base = css.match(/\.planif-noeud-prise\s*\{[^}]*\}/);
        const apres = css.match(/\.planif-noeud-prise::after\s*\{[^}]*\}/);
        expect(base, 'règle de la poignée introuvable').toBeTruthy();
        expect(apres, 'la cible tactile de la poignée a disparu').toBeTruthy();
        expect(apres[0]).toMatch(/position:\s*absolute/);
        // Sans `position: relative` sur la poignée, les décalages se résolvent
        // contre un ancêtre lointain et la zone atterrit ailleurs, en silence.
        expect(base[0]).toMatch(/position:\s*relative/);

        const px = (bloc, prop) => {
            const m = bloc.match(new RegExp(prop + ':\\s*(-?[\\d.]+)px'));
            return m ? parseFloat(m[1]) : null;
        };
        // ⚠ Le débord DROIT ne dépasse pas le `gap` de l'en-tête : au-delà, la
        // zone recouvrirait le <select>, qui coupe la propagation — la poignée
        // lui volerait ses clics.
        const gap = px(css.match(/\.planif-noeud-entete\s*\{[^}]*\}/)[0], 'gap');
        expect(-px(apres[0], 'right')).toBeLessThanOrEqual(gap);
    });

    it('⚠ le libellé de phase ne se TRONQUE jamais — les 5 partagent une couleur', () => {
        // LE fait qui commande cette règle : `--planif-couleur-ouverture` et ses
        // quatre sœurs valent toutes `--planif-couleur-enseignement-explicite`.
        // La couleur ne distingue donc RIEN entre les phases : le texte est leur
        // unique discriminant. Un premier essai laissait le sélecteur rétrécir —
        // mesuré à 99 px, il affichait « PRATIQUE … » pour guidée COMME pour
        // autonome, c'est-à-dire les deux phases que la bascule sert à permuter.
        const memeCouleur = ['ouverture', 'modelisation', 'pratique-guidee',
            'pratique-autonome', 'cloture'].every((t) =>
            new RegExp('--planif-couleur-' + t + ':\\s*var\\(--planif-couleur-enseignement-explicite\\)')
                .test(css));
        expect(memeCouleur, 'les phases ont cessé de partager une couleur — cette règle est à revoir')
            .toBe(true);

        const bloc = css.match(/\.planif-noeud-phase\s*\{[^}]*\}/);
        expect(bloc, 'règle du sélecteur introuvable').toBeTruthy();
        const min = bloc[0].match(/min-width:\s*(\d+)px/);
        expect(min, 'le plancher de largeur du sélecteur a disparu').toBeTruthy();
        expect(parseInt(min[1], 10)).toBeGreaterThanOrEqual(120);
        // Il ne doit pas s'ÉTIRER non plus : sinon il pousse la durée à la ligne
        // même sur un bloc assez large pour les deux (mesuré : en-tête à 57 px
        // sur un bloc de 280 px, où tout tenait).
        expect(bloc[0]).toMatch(/flex:\s*0\s+1\s+auto/);
        // Et l'en-tête doit pouvoir passer à la ligne, sinon le plancher
        // ci-dessus fait déborder la durée hors du bloc au lieu de la descendre.
        expect(css.match(/\.planif-noeud-entete\s*\{[^}]*\}/)[0]).toMatch(/flex-wrap:\s*wrap/);
    });
});
