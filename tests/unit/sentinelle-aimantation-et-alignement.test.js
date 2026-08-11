import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// AIMANTATION + ALIGNEMENT (11 août 2026, demande de Grégoire en préparant
// son 601-101) : « j'aurais besoin que les blocs puissent s'aligner les uns
// par rapport aux autres, comme c'est le cas dans Keynote » et « je voudrais
// pouvoir aligner les objets à gauche, au centre, à droite, en haut, au
// milieu, en bas ».
//
// ⚠ CE QUI EST VERROUILLÉ ICI : la géométrie (fonctions pures) et les
// invariants de source. Le geste réel — glisser et sentir le bloc coller, le
// guide qui apparaît puis s'efface, la barre qui se place — a été éprouvé
// dans Chromium le 11 août et vit dans integration/planif-alignement.spec.js
// (WebKit, hors conteneur).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// Sans canevas monté, chaque bloc mesure 140 × 50 (repli documenté).
const L = 140;
const H = 50;

function monterModule() {
    const store = {};
    const win = chargerScript('js/planification-carte.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'T' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    return win.planificationCarte;
}

function poser(api, id, x, y, type = 'lecon', extra = {}) {
    api.etat.noeuds.set(id, {
        id, type, titre: id, x, y, parent: null, enfants: [],
        metadata: {}, cloneSourceId: null, ...extra
    });
}

function selectionner(api, ...ids) {
    api.etat.multiSelection.clear();
    ids.forEach((i) => api.etat.multiSelection.add(i));
}

describe('Aimantation · le seuil, et ce qu’il attrape', () => {
    let api;
    beforeEach(() => {
        api = monterModule();
        api.etat.zoom = 1;
    });

    it('hors du seuil : aucun décalage, aucun guide', () => {
        poser(api, 'planif-ref', 400, 300);
        api.preparerAimantation(new Set(['planif-mob']));
        const r = api.appliquerAimantation({ gauche: 440, droite: 440 + L, haut: 600, bas: 600 + H });
        expect(r.dx).toBe(0);
        expect(r.dy).toBe(0);
        expect(r.guides).toEqual([]);
    });

    it('sous le seuil : le bloc est ramené sur le repère, et UN guide le dit', () => {
        poser(api, 'planif-ref', 400, 300);
        api.preparerAimantation(new Set(['planif-mob']));
        const r = api.appliquerAimantation({ gauche: 404, droite: 404 + L, haut: 600, bas: 600 + H });
        expect(r.dx).toBe(-4);            // ramené sur 400
        expect(r.guides).toHaveLength(1);
        expect(r.guides[0]).toMatchObject({ axe: 'x', v: 400 });
    });

    it('le guide ENJAMBE les deux blocs — sinon il ne montre pas le rapport', () => {
        poser(api, 'planif-ref', 400, 300);
        api.preparerAimantation(new Set(['planif-mob']));
        const r = api.appliquerAimantation({ gauche: 402, droite: 402 + L, haut: 900, bas: 900 + H });
        const g = r.guides[0];
        expect(g.min).toBeLessThanOrEqual(300);          // atteint le bloc de référence
        expect(g.max).toBeGreaterThanOrEqual(900 + H);   // et le bloc déplacé
    });

    it('⚠ le seuil est en pixels d’ÉCRAN : dézoomé, il ne happe pas la carte entière', () => {
        poser(api, 'planif-ref', 400, 300);
        api.preparerAimantation(new Set(['planif-mob']));

        // À 100 %, 4 px de carte sont sous le seuil.
        api.etat.zoom = 1;
        expect(api.appliquerAimantation({ gauche: 404, droite: 404 + L, haut: 0, bas: H }).dx).toBe(-4);

        // ⚠ LA VALEUR QUI DISCRIMINE. Mon premier jet comparait 4 px et 40 px :
        // les deux répondent PAREIL avec ou sans division par le zoom (4 < 6
        // et 40 > 6 dans les deux cas), donc le break-test restait vert. Il
        // faut une distance qui tombe ENTRE les deux seuils : à 25 %, 12 px de
        // carte valent 3 px d'écran — sous le seuil de 6 px écran (donc happé),
        // mais AU-DESSUS d'un seuil de 6 appliqué en unités de carte.
        api.etat.zoom = 0.25;
        expect(api.appliquerAimantation({ gauche: 412, droite: 412 + L, haut: 0, bas: H }).dx).toBe(-12);
        // Et au-delà, l'aimant lâche : un dézoom ne doit pas le transformer
        // en filet à tout attraper.
        expect(api.appliquerAimantation({ gauche: 440, droite: 440 + L, haut: 0, bas: H }).dx).toBe(0);
    });

    it('le repère le plus PROCHE gagne quand plusieurs sont dans le seuil', () => {
        poser(api, 'planif-a', 400, 0);
        poser(api, 'planif-b', 405, 0);
        api.preparerAimantation(new Set(['planif-mob']));
        const r = api.appliquerAimantation({ gauche: 404, droite: 404 + L, haut: 500, bas: 500 + H });
        expect(r.guides[0].v).toBe(405);
        expect(r.dx).toBe(1);
    });

    it('un bloc exclu n’est jamais sa propre cible', () => {
        poser(api, 'planif-mob', 400, 300);
        api.preparerAimantation(new Set(['planif-mob']));
        // ⚠ LA BOÎTE EST DÉCALÉE EXPRÈS. Mon premier jet la posait pile sur le
        // bloc exclu : l'écart valait 0 avec OU sans l'exclusion, et le
        // break-test restait vert. Ici, un bloc non exclu s'aimanterait sur sa
        // propre position d'avant le glissement — et se figerait sur place.
        const r = api.appliquerAimantation({ gauche: 404, droite: 404 + L, haut: 304, bas: 304 + H });
        expect(r.dx).toBe(0);
        expect(r.dy).toBe(0);
        expect(r.guides).toEqual([]);
    });

    it('les trois repères de chaque axe comptent — pas seulement le bord', () => {
        poser(api, 'planif-ref', 400, 300);       // gauche 400 · centre 470 · droite 540
        api.preparerAimantation(new Set(['planif-mob']));
        // Le bloc déplacé cherche à aligner SON bord gauche sur le CENTRE.
        const r = api.appliquerAimantation({ gauche: 468, droite: 468 + L, haut: 900, bas: 900 + H });
        expect(r.guides[0].v).toBe(400 + L / 2);
        expect(r.dx).toBe(2);
    });
});

describe('Aligner les objets · les six commandes', () => {
    let api;
    beforeEach(() => {
        api = monterModule();
        poser(api, 'planif-a', 100, 100);
        poser(api, 'planif-b', 143, 320);
        poser(api, 'planif-c', 187, 540);
    });

    it('à gauche : tout le monde rejoint le bloc le plus à GAUCHE', () => {
        selectionner(api, 'planif-a', 'planif-b', 'planif-c');
        expect(api.alignerSelection('gauche')).toBe(2);
        const xs = ['planif-a', 'planif-b', 'planif-c'].map((i) => api.etat.noeuds.get(i).x);
        expect(xs).toEqual([100, 100, 100]);
    });

    it('à droite : sur le bord droit du plus à droite, largeur comprise', () => {
        selectionner(api, 'planif-a', 'planif-b', 'planif-c');
        api.alignerSelection('droite');
        const droites = ['planif-a', 'planif-b', 'planif-c']
            .map((i) => api.etat.noeuds.get(i).x + L);
        expect(new Set(droites).size).toBe(1);
        expect(droites[0]).toBe(187 + L);
    });

    it('au centre : sur le milieu de l’ENCADREMENT, pas sur un bloc', () => {
        selectionner(api, 'planif-a', 'planif-b', 'planif-c');
        api.alignerSelection('centre');
        const centres = ['planif-a', 'planif-b', 'planif-c']
            .map((i) => api.etat.noeuds.get(i).x + L / 2);
        expect(new Set(centres).size).toBe(1);
        expect(centres[0]).toBe((100 + (187 + L)) / 2);
    });

    it('en haut, au milieu, en bas agissent sur l’axe VERTICAL et lui seul', () => {
        for (const [mode, lecture] of [['haut', (n) => n.y],
                                       ['milieu', (n) => n.y + H / 2],
                                       ['bas', (n) => n.y + H]]) {
            const a = monterModule();
            poser(a, 'planif-a', 100, 100);
            poser(a, 'planif-b', 143, 320);
            selectionner(a, 'planif-a', 'planif-b');
            const xsAvant = ['planif-a', 'planif-b'].map((i) => a.etat.noeuds.get(i).x);
            a.alignerSelection(mode);
            const valeurs = ['planif-a', 'planif-b'].map((i) => lecture(a.etat.noeuds.get(i)));
            expect(new Set(valeurs).size).toBe(1);
            // L'axe horizontal n'a pas bougé.
            expect(['planif-a', 'planif-b'].map((i) => a.etat.noeuds.get(i).x)).toEqual(xsAvant);
        }
    });

    it('⚠ un conteneur emporte ses descendants — sinon la leçon quitte ses activités', () => {
        const a = monterModule();
        poser(a, 'planif-act', 300, 340, 'activite', { parent: 'planif-lec' });
        poser(a, 'planif-lec', 300, 300, 'lecon', { enfants: ['planif-act'] });
        poser(a, 'planif-seul', 100, 800);
        selectionner(a, 'planif-lec', 'planif-seul');

        const ecartAvant = a.etat.noeuds.get('planif-act').x - a.etat.noeuds.get('planif-lec').x;
        a.alignerSelection('gauche');
        const ecartApres = a.etat.noeuds.get('planif-act').x - a.etat.noeuds.get('planif-lec').x;

        expect(a.etat.noeuds.get('planif-lec').x).toBe(100);
        expect(ecartApres).toBe(ecartAvant);   // l'activité a suivi
    });

    it('⚠ conteneur ET son enfant sélectionnés : l’enfant n’est pas aligné DEUX fois', () => {
        const a = monterModule();
        poser(a, 'planif-act', 300, 340, 'activite', { parent: 'planif-lec' });
        poser(a, 'planif-lec', 300, 300, 'lecon', { enfants: ['planif-act'] });
        poser(a, 'planif-seul', 100, 800);
        selectionner(a, 'planif-lec', 'planif-act', 'planif-seul');

        const ecartAvant = a.etat.noeuds.get('planif-act').x - a.etat.noeuds.get('planif-lec').x;
        a.alignerSelection('gauche');
        expect(a.etat.noeuds.get('planif-act').x - a.etat.noeuds.get('planif-lec').x).toBe(ecartAvant);
    });

    it('moins de deux blocs : rien ne bouge', () => {
        selectionner(api, 'planif-a');
        expect(api.alignerSelection('gauche')).toBe(0);
        api.etat.multiSelection.clear();
        expect(api.alignerSelection('gauche')).toBe(0);
        expect(api.etat.noeuds.get('planif-a').x).toBe(100);
    });

    it('un mode inconnu ne fait rien plutôt que n’importe quoi', () => {
        selectionner(api, 'planif-a', 'planif-b');
        expect(api.alignerSelection('diagonale')).toBe(0);
        expect(api.etat.noeuds.get('planif-b').x).toBe(143);
    });

    it('⌘Z défait l’alignement ENTIER, pas bloc par bloc (un seul instantané)', () => {
        selectionner(api, 'planif-a', 'planif-b', 'planif-c');
        api.alignerSelection('gauche');
        expect(api.etat.noeuds.get('planif-c').x).toBe(100);
        api.annuler();
        expect(api.etat.noeuds.get('planif-b').x).toBe(143);
        expect(api.etat.noeuds.get('planif-c').x).toBe(187);
    });
});

describe('Les invariants de source', () => {
    it('⚠ l’aimant est branché dans les QUATRE glissements, pas un de moins', () => {
        // Groupe · feuille dans un conteneur · conteneur · feuille libre.
        // Un chemin oublié donnerait « ça marche sauf sur… », le pire à
        // rapporter comme à diagnostiquer.
        // ⚠ Ancré sur les APPELS en début d'instruction, pas sur le nom.
        // Le premier jet comptait toutes les occurrences du mot et attrapait
        // la prose du commentaire d'en-tête : une ancre qui compte des mots
        // au lieu d'appels aurait pu rester verte sur un chemin débranché.
        const appels = sourceCarte.match(/^[ \t]+preparerAimantation\(/gm) || [];
        expect(appels).toHaveLength(4);
        expect((sourceCarte.match(/^[ \t]+effacerGuides\(\);/gm) || [])).toHaveLength(4);
    });

    it('⚠ la barre est placée AVEC l’offset du canevas', () => {
        // Sans OFFSET_X / OFFSET_Y la barre part à des milliers de pixels hors
        // écran : elle existe, elle est « visible », et elle est injoignable.
        // Trouvé au navigateur, deux heures après le même oubli sur la loupe.
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function majBarreAlignement'),
            sourceCarte.indexOf('/** Déplace un nœud ET sa descendance')
        );
        expect(bloc).toMatch(/\(mx \+ OFFSET_X\) \* etat\.zoom/);
        expect(bloc).toMatch(/\(my \+ OFFSET_Y\) \* etat\.zoom/);
    });

    it('⚠ le bornage à l’écran vient APRÈS le repli sous la sélection', () => {
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function majBarreAlignement'),
            sourceCarte.indexOf('/** Déplace un nœud ET sa descendance')
        );
        expect(bloc.indexOf('if (y < r.top + 8)')).toBeLessThan(
            bloc.indexOf('y = Math.min(Math.max(8, y)')
        );
    });

    it('le guide ne capte aucun geste et garde son épaisseur à tout zoom', () => {
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const bloc = css.slice(css.indexOf('.planif-guide-alignement {'),
                               css.indexOf('.planif-guide-alignement {') + 700);
        expect(bloc).toMatch(/pointer-events:\s*none/);
        expect(bloc).toMatch(/vector-effect:\s*non-scaling-stroke/);
    });

    it('iPad : les six boutons ont une cible de 44 px', () => {
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const bloc = css.slice(css.indexOf('.planif-btn-aligner {'),
                               css.indexOf('.planif-btn-aligner:hover'));
        expect(bloc).toMatch(/min-width:\s*44px/);
        expect(bloc).toMatch(/min-height:\s*44px/);
    });
});
