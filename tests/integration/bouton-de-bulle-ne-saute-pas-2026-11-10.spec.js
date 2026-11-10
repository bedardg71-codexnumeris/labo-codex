import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// UN BOUTON QUI PARAÎT DANS LA BULLE N'Y SAUTE PAS (10 nov. 2026, décision de Cowork et de Grégoire, 10 h 25).
//
// Mesuré au verdict du groupe 3 (parcours 8, « Continuer ») : la sonde du moteur place la bulle, PUIS vérifie
// l'étape (`atteint`). Une étape qui fait paraître un bouton à la vérification fait grandir la bulle, qui n'était
// replacée qu'au passage suivant (jusqu'à 120 ms) : le bouton paraissait, puis sautait. Trace : le toucher tombait
// sur « Continuer », le relâcher, 8 ms plus tard, sur la bulle, et le geste se perdait.
// La règle : quand la hauteur de la bulle change pendant la vérification, elle est replacée dans le même passage
// (comme sa largeur, depuis les bulles en pages). Le bouton est peint une fois, à sa place.
//
// Banc : une étape fictive dont la cible est au bas de l'écran (la bulle se pose au-dessus) et dont « Continuer »
// ne paraît qu'à un signal. Du premier rendu où il est visible, sa place est relevée à chaque image pendant 600 ms.
// Break-test : la replace de `suivreAtteint` retirée → ROUGE (le bouton monte d'environ sa hauteur).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

test('le bouton qui paraît à la vérification est peint une fois, à sa place : il ne saute pas', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await attendreApplication(page);

    await page.evaluate(() => {
        const cible = document.createElement('div');
        cible.id = 'cible-du-banc';
        cible.style.cssText = 'position:fixed;left:120px;top:730px;width:90px;height:40px;';
        document.body.appendChild(cible);
        window.__montrer = false;
        const montrer = (oui) => {
            const b = [...document.querySelectorAll('#parcours-bulle .parcours-bulle-boutons button')].find((x) => x.textContent === 'Continuer');
            if (!b) return;
            b.hidden = !oui;
            b.parentElement.hidden = !oui;
        };
        ParcoursMoteur.lancer({
            id: 'banc-bouton-qui-parait',
            lienSortie: 'Plus tard',
            etapes: [
                {
                    titre: 'Une étape fictive', texte: 'Le bouton paraît quand le signal est donné.',
                    contour: () => cible, zones: () => [cible],
                    boutons: [{ libelle: 'Continuer', primaire: true, action: (m) => m.allerA(1) }],
                    atteint: () => { montrer(window.__montrer); return false; }
                },
                { titre: 'Fin', texte: 'La fin du banc.', centre: true, sansSortie: true, boutons: [{ libelle: 'Terminer', primaire: true, action: (m) => m.fermer() }] }
            ]
        }, {});
    });

    const continuer = page.locator('#parcours-bulle .parcours-bulle-boutons button', { hasText: 'Continuer' });
    await expect(page.locator('#parcours-bulle .parcours-bulle-titre')).toHaveText('Une étape fictive');
    await expect(continuer).toBeHidden();

    const places = await page.evaluate(() => new Promise((fin) => {
        const releves = [];
        let debut = null;
        const lire = () => {
            const b = [...document.querySelectorAll('#parcours-bulle .parcours-bulle-boutons button')].find((x) => x.textContent === 'Continuer');
            if (b && !b.hidden && b.offsetParent !== null) {
                if (debut === null) debut = performance.now();
                const r = b.getBoundingClientRect();
                releves.push(Math.round(r.left) + ',' + Math.round(r.top));
            }
            if (debut !== null && performance.now() - debut > 600) { fin(releves); return; }
            requestAnimationFrame(lire);
        };
        requestAnimationFrame(lire);
        window.__montrer = true;
    }));

    expect(places.length, 'le bouton a paru et a été relevé').toBeGreaterThan(5);
    expect([...new Set(places)], 'la place du bouton, de son apparition à 600 ms').toEqual([places[0]]);
    // Et la bulle tient dans l'écran.
    const bas = await page.evaluate(() => document.getElementById('parcours-bulle').getBoundingClientRect().bottom);
    expect(bas).toBeLessThanOrEqual(820);
});
