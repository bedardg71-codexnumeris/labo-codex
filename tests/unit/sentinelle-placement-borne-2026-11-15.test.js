import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LE PLACEMENT DE LA BULLE EST BORNÉ (15 nov. 2026 ; plans de travail/RAPPORT-2026-11-15-gel-refaire.md).
//
// Vécu par Grégoire sur l'iPad : à l'étape 7 de « Mettre ta classe en place », la page gelait. L'étape déclare une
// zone par cellule de la saisie des présences ; la recherche d'une place essayait (6 Z + 3)² places contre Z
// rectangles. Mesuré sous WebKit, avant : 1,1 s par placement à 12 personnes, 4,9 s à 24, une trentaine à 36.
//
// LE PLAFOND : un placement sous PLAFOND_MS, à 36 rangées comme devant quatre cents zones éparses.
// Deux défenses, chacune suffisante devant la saisie (ses cellules sont alignées) : c'est pourquoi chacune a son essai.
// Break-tests (constatés le 15 nov. 2026) :
//   B1 `evites = reduireEvites(evites)` retiré de `placerLoin` ............ « quatre cents zones éparses » ROUGE
//   B2 la fonte de proche en proche retirée de `reduireEvites` ............ « cent zones » et « quatre cents » ROUGES
//   B3 `memeBloc` sans la comparaison des poids ........................... « le contour garde son poids » ROUGE
//   B4 le dédoublonnage des abscisses et des ordonnées retiré ............. « aucune place essayée deux fois » ROUGE
//   (Les deux retirées ensemble : l'état du 15 nov. au matin, « 36 rangées » ROUGE, une vingtaine de secondes.)

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fenetre = {};
new Function('window', 'document', readFileSync(path.join(RACINE, 'js/parcours-moteur.js'), 'utf8'))(fenetre, {});
const { placerLoin, reduireEvites, placesEssayees } = fenetre.ParcoursMoteur.geometrie;

const PLAFOND_MS = 100;
const IPAD = { gauche: 8, haut: 72, droite: 1172, bas: 812 };
const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
const chrono = (f) => { const t = performance.now(); const v = f(); return [performance.now() - t, v]; };
const contient = (grand, petit) => grand.left <= petit.left + 2 && grand.right >= petit.right - 2 && grand.top <= petit.top + 2 && grand.bottom >= petit.bottom - 2;

/** La saisie des présences à `n` rangées, telle que l'étape 7 la déclare : les trois premières cellules de chaque
 *  rangée, la colonne Présence (son en-tête et ses cases), le choix de la séance ; les cibles des flèches en double. */
function saisie(n) {
    const HAUT = 260, RANGEE = 41;
    const choix = rect(40, 180, 420, 216);
    const tete = rect(600, HAUT - RANGEE, 720, HAUT);
    const cases = [], noms = [];
    for (let k = 0; k < n; k++) {
        const y = HAUT + k * RANGEE;
        cases.push(rect(600, y, 720, y + RANGEE));
        noms.push(rect(40, y, 140, y + RANGEE), rect(140, y, 300, y + RANGEE), rect(300, y, 460, y + RANGEE));
    }
    const fleches = [choix, tete].concat(cases);
    return { zones: [choix, tete].concat(cases, noms, fleches), blocs: [choix, rect(600, HAUT - RANGEE, 720, HAUT + n * RANGEE), rect(40, HAUT, 460, HAUT + n * RANGEE)] };
}

describe('Ce que la bulle évite est réduit avant de chercher sa place', () => {
    it('36 rangées : les cellules d’une colonne ne font qu’un bloc, et rien de plus n’est couvert', () => {
        const { zones, blocs } = saisie(36);
        expect(zones.length).toBeGreaterThan(180);
        const reduits = reduireEvites(zones);
        expect(reduits.map(({ left, top, right, bottom }) => ({ left, top, right, bottom }))).toEqual(blocs);
    });

    it('36 rangées : un placement sous ' + PLAFOND_MS + ' ms, à la même place que devant les trois blocs', () => {
        const { zones, blocs } = saisie(36);
        const [ms, place] = chrono(() => placerLoin(zones, 380, 300, IPAD));
        expect(ms).toBeLessThan(PLAFOND_MS);
        expect(place).toEqual(placerLoin(blocs, 380, 300, IPAD));
    });

    it('cent zones éparses : fondues de proche en proche sous vingt-quatre, toutes encore évitées, un placement sous ' + PLAFOND_MS + ' ms', () => {
        const eparses = [];
        for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) eparses.push(rect(60 + i * 100, 100 + j * 60, 130 + i * 100, 140 + j * 60));
        const reduits = reduireEvites(eparses);
        expect(reduits.length).toBeLessThanOrEqual(24);
        for (const z of eparses) expect(reduits.some((r) => contient(r, z))).toBe(true);
        const [ms] = chrono(() => placerLoin(eparses, 380, 300, IPAD));
        expect(ms).toBeLessThan(PLAFOND_MS);
    });

    it('quatre cents zones éparses, sans un bord commun : un placement sous ' + PLAFOND_MS + ' ms', () => {
        // Des rectangles tirés d'une suite déterministe : rien à dédoublonner, seule la réduction borne le coût.
        let graine = 20261115;
        const tirer = (max) => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine % max; };
        const eparses = Array.from({ length: 400 }, () => { const x = 20 + tirer(1100), y = 80 + tirer(680); return rect(x, y, x + 12 + tirer(30), y + 8 + tirer(20)); });
        const [ms, place] = chrono(() => placerLoin(eparses, 380, 300, IPAD));
        expect(ms).toBeLessThan(PLAFOND_MS);
        expect(place.x).toBeGreaterThanOrEqual(IPAD.gauche);
        expect(place.y).toBeGreaterThanOrEqual(IPAD.haut);
    });

    it('aucune place essayée deux fois : les abscisses et les ordonnées sont dédoublonnées', () => {
        const places = placesEssayees(saisie(36).zones, 380, 300, IPAD);
        const cles = places.map((p) => p.x + ',' + p.y);
        expect(new Set(cles).size).toBe(cles.length);
        // 184 rectangles : 1 107 abscisses × 1 107 ordonnées avant, plus d'un million de places.
        expect(places.length).toBeLessThan(5000);
    });

    it('le contour garde son poids : il n’est fondu ni dans la zone qui le contient, ni dans sa voisine', () => {
        const zone = rect(52, 252, 468, 1016), voisine = rect(52, 100, 468, 252);
        const contour = { ...rect(69, 734, 451, 985), poids: 10000 };
        const reduits = reduireEvites([zone, contour, voisine, { ...contour }]);
        expect(reduits).toEqual([{ ...rect(52, 100, 468, 1016), poids: 1 }, contour]);
    });

    it('des champs séparés (un formulaire) restent tels quels', () => {
        const champs = [rect(70, 300, 470, 340), rect(70, 360, 470, 400), rect(500, 300, 900, 340)];
        expect(reduireEvites(champs).map(({ left, top, right, bottom }) => rect(left, top, right, bottom))).toEqual(champs);
    });
});
