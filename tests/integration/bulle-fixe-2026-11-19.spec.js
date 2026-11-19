// =======================================================================
// LA BULLE NE BOUGE PAS PENDANT QUE LES POINTS OSCILLENT — 19 NOVEMBRE 2026
// =======================================================================
// Vu par Grégoire le 17 nov. (iPad couché, Safari, 1.249.0) : à la bulle 1 de « Découvrir », la bulle glisse d'environ
// 200 points sans qu'on la touche, au gré de l'oscillation des points de la bande (`float-vertical`).
// LA CAUSE, MESURÉE (js/parcours-moteur.js) : la sonde replace la bulle toutes les 120 ms d'après le rectangle DU
// MOMENT de chaque point (`aussiEviter: bandeEtSesPoints`). À 1180 × 656, deux places ne couvrent rien ; elles se
// départagent par la distance à ce que la bulle évite (`vautMieux`), et cette distance oscille avec les points :
// x = 217, puis 322, toutes les trois secondes environ, le point désigné inchangé. Balayage de 48 écrans couchés
// (1133 à 1366 de large, 620 à 1016 de haut) : le saut ne se voit que sous 660 px de haut, la hauteur que Safari
// laisse à la page sous ses barres ; rejoué avec la correction, aucun écran ne bouge.
// LA CORRECTION : pour la place de la bulle, une cible animée vaut tout son trajet (`trajetDe`) ; les flèches, elles,
// suivent la cible où elle est.
// Ce banc relève, à chaque image pendant 8,5 s (plus qu'un cycle des points, 4 à 8 s), la place de la bulle, la
// hauteur des points et la cible des flèches. Il juge : les points bougent (sinon il ne mesure rien), la bulle a UNE
// place, aucun point n'est sous elle, et la flèche suit son point.
// Break-test (19 nov. 2026) : `rectsDePlace` rendu égal à `rectsDe` (js/parcours-moteur.js) → ROUGE ; rétabli → vert.

import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, ouvrirPanneau, carte, attendreEtape } from './harness/deux-temps-de-banc.js';

test.setTimeout(120000);

// L'iPad couché sous les barres de Safari, avec et sans la barre des onglets : les hauteurs où la bulle sautait.
const ECRANS = [[1180, 656], [1180, 620]];

for (const [l, h] of ECRANS) {
    test(`bulle 1 de « Découvrir », ${l} × ${h} : une seule place pendant que les points oscillent, la flèche les suit`, async ({ page }) => {
        await ouvrirEspaceVide(page, l, h);
        await ouvrirPanneau(page);
        await carte(page, 'decouvrir').locator('.assistance-parcours-bouton').click();
        await attendreEtape(page, 1, 8, "Ta classe d'un coup d'œil");
        // Deux passages de la sonde : la bulle a choisi sa place.
        const depart = await page.evaluate(() => ParcoursMoteur.placement().passages);
        await page.waitForFunction((d) => ParcoursMoteur.placement().passages >= d + 2, depart);

        const r = await page.evaluate(() => new Promise((fin) => {
            const b = document.getElementById('parcours-bulle');
            const t0 = performance.now();
            const places = new Set(), hauteurs = new Set(), fleches = new Set();
            let couverts = 0;
            const tour = () => {
                const rb = b.getBoundingClientRect();
                places.add([rb.left, rb.top, rb.width, rb.height].map(Math.round).join(','));
                const pts = [...document.querySelectorAll('#section-suivi .barre-indicateur .barre-etudiant[data-da]')].map((e) => e.getBoundingClientRect());
                hauteurs.add(pts.map((p) => Math.round(p.top)).join(','));
                couverts = Math.max(couverts, pts.filter((p) => !(p.right <= rb.left || rb.right <= p.left || p.bottom <= rb.top || rb.bottom <= p.top)).length);
                document.querySelectorAll('.parcours-fleche').forEach((g) => fleches.add(g.getAttribute('data-cible')));
                if (performance.now() - t0 < 8500) requestAnimationFrame(tour);
                else fin({ places: [...places], hauteurs: hauteurs.size, fleches: fleches.size, couverts });
            };
            requestAnimationFrame(tour);
        }));

        expect(r.hauteurs, 'les points oscillent pendant le relevé').toBeGreaterThan(10);
        expect(r.places, 'la bulle garde une seule place').toHaveLength(1);
        expect(r.couverts, 'aucun point sous la bulle').toBe(0);
        expect(r.fleches, 'la flèche suit son point').toBeGreaterThan(1);
    });
}
