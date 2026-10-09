import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// TOUT VOIR + LOUPE (11 août 2026) — demande de Grégoire en préparant A26 :
// « la vue complète de la carte de mon cours est à 25 %, c'est évidemment
// illisible à ce zoom ». Prendre du recul et lire sont contradictoires ; la
// loupe les réconcilie, et « Tout voir » lui donne son point de départ.
//
// ⚠ CE QUE CETTE SENTINELLE COUVRE, ET CE QU'ELLE NE COUVRE PAS.
// Elle verrouille l'ENCADREMENT (fonction pure, testable ici) et trois
// invariants de source. Le comportement au navigateur — la loupe qui suit le
// pointeur, le centrage, l'atterrissage, le doigt qui ne traîne aucun bloc —
// a été éprouvé dans Chromium le 11 août, mais N'EST PAS verrouillé ici :
// ces chemins ont besoin d'un vrai canevas mis en page. Voir
// integration/planif-tout-voir-loupe.spec.js (WebKit, hors conteneur).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

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
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    return win.planificationCarte;
}

function poser(api, id, x, y) {
    api.etat.noeuds.set(id, {
        id, type: 'lecon', titre: id, x, y,
        parent: null, enfants: [], metadata: {}, cloneSourceId: null
    });
}

describe('Tout voir · l’encadrement est un ENCADREMENT, pas une moyenne', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('carte vide : aucun encadrement (et donc rien à ajuster)', () => {
        expect(api.encadrementContenu()).toBeNull();
    });

    it('⚠ une masse dense + un isolé : le centre est GÉOMÉTRIQUE, pas tiré par la masse', () => {
        // La forme réelle de la carte 601-101 : une bande de leçons groupées,
        // et une séquence seule très loin. C'est le cas qui démasque la
        // moyenne — l'ancien centrage (somme des x / nombre) était attiré par
        // le paquet et laissait l'isolé hors champ.
        for (let i = 0; i < 20; i++) poser(api, 'planif-m' + i, 100 + i * 10, 2000);
        poser(api, 'planif-isole', 3400, 200);

        const b = api.encadrementContenu();
        expect(b.minX).toBe(100);
        expect(b.minY).toBe(200);

        const centreX = (b.minX + b.maxX) / 2;
        const moyenneX = (Array.from(api.etat.noeuds.values())
            .reduce((s, n) => s + n.x, 0)) / api.etat.noeuds.size;
        // Le centre de l'encadrement est très à droite de la moyenne : c'est
        // exactement l'écart que l'ancien centrage introduisait.
        expect(centreX).toBeGreaterThan(moyenneX + 800);
    });

    it('la LARGEUR et la HAUTEUR des blocs comptent — sinon le bord droit tombe court', () => {
        poser(api, 'planif-a', 0, 0);
        const b = api.encadrementContenu();
        // Sans canevas monté, le repli documenté est 140 × 50.
        expect(b.maxX).toBe(140);
        expect(b.maxY).toBe(50);
        expect(b.maxX).toBeGreaterThan(b.minX);
    });
});

describe('Tout voir · les invariants de source', () => {
    it('⚠ refuse d’agir quand la zone n’a aucune taille', () => {
        // Défaut trouvé AU NAVIGATEUR le 11 août : avec clientWidth = 0
        // (section masquée, appel avant mise en page), le calcul donnait 0,
        // donc le PLANCHER de zoom — la carte partait à 10 % en silence.
        expect(sourceCarte).toMatch(
            /if \(zoneTravail\.clientWidth === 0 \|\| zoneTravail\.clientHeight === 0\) return;/
        );
    });

    it('ne grossit jamais au-delà de 100 %', () => {
        expect(sourceCarte).toMatch(/Math\.max\(ZOOM_MIN, Math\.min\(1,/);
    });

    it('toutes les bornes de zoom passent par les MÊMES constantes', () => {
        // Le plancher a dû baisser pour que « Tout voir » puisse tenir sa
        // promesse : s'il repasse en dur quelque part, les sites divergent à
        // nouveau. C'est ça que cette sentinelle tient — aucune borne écrite
        // en chiffres, où que ce soit.
        expect(sourceCarte).not.toMatch(/Math\.max\(\s*[\d.]+\s*, Math\.min\(\s*[\d.]+\s*,/);

        // Le compte est passé de TROIS à DEUX le 7 septembre 2026, et c'est un
        // site en moins, pas une borne en moins : le geste Safari et le
        // pincement tactile bornaient chacun de leur côté, ils bornent
        // désormais au même endroit — la boucle d'aperçu commune, qu'ils
        // alimentent tous les deux (sentinelle du pincement, S2). Restent
        // `zoomer()` (molette et raccourcis clavier) et `majApercuZoom()`.
        // Si un troisième reparaît, c'est qu'un chemin de zoom s'est remis à
        // vivre à part : c'est exactement ce qu'on veut voir rougir.
        const bornes = sourceCarte.match(/Math\.max\(ZOOM_MIN, Math\.min\(ZOOM_MAX,/g) || [];
        expect(bornes).toHaveLength(2);
    });
});

describe('Loupe · les invariants qui la rendent utilisable sur iPad', () => {
    it('la copie fige la position de la couche AVANT de retirer les id', () => {
        // La couche des blocs est placée par une règle CSS keyée sur l'ID.
        // Retirer l'id sans figer la position décale la loupe de tout
        // l'offset — mesuré à 4999 px / 2996 px hors cible au navigateur.
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function _construireCopieLoupe'),
            sourceCarte.indexOf('function _espaceDepuisEcran')
        );
        // La PRÉSENCE d'abord (sans elle, `indexOf` rend -1 et l'assertion
        // d'ordre ci-dessous passerait alors que le code a disparu).
        expect(bloc).toMatch(/couche\.style\.transform =/);
        expect(bloc).toMatch(/couche\.removeAttribute\('id'\)/);
        expect(bloc.indexOf('couche.style.transform')).toBeLessThan(
            bloc.indexOf("couche.removeAttribute('id')")
        );
    });

    it('⚠ les id des blocs copiés sont retirés — sinon getElementById répond faux', () => {
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function _construireCopieLoupe'),
            sourceCarte.indexOf('function _espaceDepuisEcran')
        );
        // ⚠ ANCRÉ SUR LA BOUCLE, PAS SUR LE MOTIF. Premier jet :
        // `toMatch(/removeAttribute\('id'\)/)` — or le bloc en contient TROIS
        // (l'espace, la boucle, la couche). Retirer la boucle — la seule qui
        // protège `getElementById` — laissait donc le test VERT. Démasqué au
        // break-test du rituel de fin de session du 11 août.
        expect(bloc).toMatch(/var avecId = couche\.querySelectorAll\('\[id\]'\);/);
        expect(bloc).toMatch(
            /for \(var i = 0; i < avecId\.length; i\+\+\) avecId\[i\]\.removeAttribute\('id'\);/
        );
    });

    it('⚠ le pointeur est écouté sur DOCUMENT en capture, pas sur la zone', () => {
        // La grille du Planificateur et les palettes RECOUVRENT le canevas :
        // un écouteur posé sur #planif-zone-travail ne voyait pas le pointeur
        // sous ces zones, et la loupe restait vide là où la carte est la plus
        // dense. Symptôme « ça marche parfois » — le pire à diagnostiquer.
        expect(sourceCarte).toMatch(
            /document\.addEventListener\('pointermove', _surPointeurLoupe, true\)/
        );
        expect(sourceCarte).toMatch(
            /document\.addEventListener\('pointerdown', _surPointeurLoupe, true\)/
        );
    });

    it('la copie se périme dès que la carte change', () => {
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function reconstruireDOM'),
            sourceCarte.indexOf('function reconstruireDOM') + 600
        );
        expect(bloc).toMatch(/_loupeCopieValide = false;/);
    });

    it('iPad : les deux commandes existent en BOUTON, pas seulement au clavier', () => {
        // Sur iPad il n'y a pas de clavier : la touche L n'est qu'un raccourci,
        // le bouton est le chemin. Et l'état se lit sur aria-pressed.
        // « Tout voir » est une commande du menu « Vue » depuis le 8 oct. 2026.
        expect(sourceIndex).toMatch(/id="planif-vue-tout-voir"[^>]*data-action="planificationCarte\.ajusterVueSurTout"/);
        // La loupe est devenue la « longue-vue », une commande du même menu (lot 3, 9 oct. 2026).
        expect(sourceIndex).toMatch(/id="planif-vue-longue-vue"[^>]*aria-pressed="false"[^>]*data-action="planificationCarte\.basculerLoupe">Longue-vue<kbd class="planif-vue-touche">L<\/kbd>/);
        expect(sourceIndex).not.toContain('planif-btn-loupe');
    });

    it('⚠ le clic ATTERRIT depuis la carte, pas seulement depuis le cadre', () => {
        // Défaut rapporté par Grégoire, capture à l'appui : « quand je clique,
        // il ne se passe rien ». Le cadre se place AU-DESSUS du pointeur ; le
        // geste naturel est de cliquer le bloc qu'on vise, DANS la carte. Le
        // premier jet n'écoutait que le cadre.
        expect(sourceCarte).toMatch(/document\.addEventListener\('click', _surClicLoupe, true\)/);
        expect(sourceCarte).toMatch(/document\.removeEventListener\('click', _surClicLoupe, true\)/);
        const bloc = sourceCarte.slice(
            sourceCarte.indexOf('function _surClicLoupe'),
            sourceCarte.indexOf('function _surClicLoupe') + 900
        );
        // Il atterrit depuis les DEUX surfaces…
        expect(bloc).toMatch(/dansCadre/);
        expect(bloc).toMatch(/dansCarte/);
        // …et il laisse passer le reste, sinon le bouton qui ÉTEINT la loupe
        // deviendrait lui-même inatteignable.
        expect(bloc).toMatch(/if \(!dansCadre && !dansCarte\) return;/);
    });

    it('le pointeur montre la ZONE examinée, de la forme du cadre', () => {
        // Demande de Grégoire : « un petit rectangle dans les mêmes
        // proportions que la loupe ». Une flèche désigne un point ; ici on
        // choisit un cadrage. Lot 3 (9 oct. 2026) : la longue-vue est ronde,
        // le pointeur aussi — un cercle, point d'accroche au CENTRE.
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const i = css.indexOf('#planif-zone-travail.planif-loupe-mode,');
        const bloc = css.slice(i, i + 1400);
        const m = bloc.match(/width='(\d+)' height='(\d+)'/);
        expect(m).not.toBeNull();
        expect(Number(m[1])).toBe(Number(m[2]));
        expect(bloc).toMatch(/%3Ccircle cx='15' cy='15' r='13'/);
        expect(bloc).not.toMatch(/%3Crect/);
        expect(bloc).toMatch(/\) 15 15, crosshair/);
        // Les deux surfaces montrent la même zone : même curseur sur les deux.
        expect(bloc).toMatch(/#planif-loupe \{/);
    });

    it('la longue-vue est un cercle, au diamètre où un titre de bloc tient entier', () => {
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const bloc = tranche(css, '#planif-loupe {', '#planif-loupe.planif-loupe-visible');
        expect(bloc).toMatch(/border-radius:\s*50%/);
        expect(bloc).toMatch(/width:\s*300px/);
        expect(bloc).toMatch(/height:\s*300px/);
        // Le JS place et décale la copie avec le même diamètre que la CSS.
        expect(sourceCarte).toMatch(/const LOUPE_L = 300;/);
        expect(sourceCarte).toMatch(/const LOUPE_H = 300;/);
        // Un bloc fait au plus 240 px : le diamètre doit le dépasser.
        const noeud = tranche(css, '\n.planif-noeud {', '\n}');
        const max = Number((noeud.match(/max-width:\s*(\d+)px/) || [])[1]);
        expect(max).toBeGreaterThan(0);
        expect(300).toBeGreaterThan(max);
    });

    it('« Aller ici » respecte la cible tactile de 44 px', () => {
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const bloc = css.slice(css.indexOf('.planif-loupe-aller {'), css.indexOf('.planif-loupe-aller:hover'));
        expect(bloc).toMatch(/min-height:\s*44px/);
        expect(bloc).toMatch(/min-width:\s*44px/);
    });
});
