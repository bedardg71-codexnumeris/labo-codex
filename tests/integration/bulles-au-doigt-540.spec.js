import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #540 (7 septembre 2026) — SAISIR UNE BULLE D'ÉLÈVE AU DOIGT.
//
// Retour de Grégoire depuis l'iPad : « j'ai du mal à saisir les bulles blanches
// dans les barres de dégradés ». Une bulle fait 10 px et oscille sans arrêt ;
// son journal montre cinq touchers de suite sur le fond de la barre.
//
// La sentinelle Vitest tient l'arithmétique de l'arbitrage. Celle-ci tient le
// CHEMIN RÉEL : le vrai gestionnaire délégué, la vraie requête média, la vraie
// mesure de position — avec un doigt, pas une souris.
//
// ⚠ Le contexte est tactile (`hasTouch` + `isMobile`), sans quoi
// `(pointer: coarse)` est faux et la tolérance se retire d'elle-même : la
// version « souris » de ce même essai passerait pour de mauvaises raisons.
// C'est pourquoi le dernier essai vérifie l'envers — sans doigt, pas de
// tolérance.

test.use({ hasTouch: true, isMobile: true });

/**
 * Pose une barre de distribution avec des bulles aux abscisses demandées, dans
 * une page déjà chargée. On construit la barre plutôt que de fabriquer un
 * trimestre entier : ce qu'on éprouve ici est le geste, pas le calcul des
 * indices.
 */
async function poserBarre(page, bulles) {
    return await page.evaluate((bulles) => {
        document.querySelectorAll('.barre-indicateur-essai').forEach((n) => n.remove());
        const barre = document.createElement('div');
        barre.className = 'barre-indicateur barre-indicateur-essai';
        // Position fixe : des coordonnées d'écran connues, sans dépendre de la
        // mise en page de la section autour.
        barre.style.cssText = 'position: fixed; left: 100px; top: 300px; width: 600px; height: 55px; z-index: 9999;';
        for (const b of bulles) {
            const point = document.createElement('div');
            point.className = 'barre-etudiant barre-etudiant-som';
            point.style.left = b.left + 'px';
            // L'animation est coupée pour CET essai : elle déplace la bulle
            // pendant que le doigt descend, et on mesure ici l'arbitrage, pas
            // la capacité à viser une cible mobile.
            point.style.animation = 'none';
            point.dataset.nom = b.nom;
            point.dataset.da = b.nom;
            barre.appendChild(point);
        }
        document.body.appendChild(barre);
        // Le centre réel de chaque bulle, tel que le navigateur le pose.
        return Array.from(barre.children).map((el) => {
            const r = el.getBoundingClientRect();
            return { nom: el.dataset.nom, x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
    }, bulles);
}

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
}

const selectionnee = (page) => page.evaluate(() => {
    const el = document.querySelector('.barre-etudiant.selected');
    return el ? el.dataset.nom : null;
});

/**
 * UN TOUCHER COMPLET — le tap, PUIS le clic que le tap engendre.
 *
 * ⚠ MESURÉ LE 9 SEPTEMBRE 2026, ET C'EST LA RAISON D'ÊTRE DE CE HELPER.
 * `page.touchscreen.tap()` sous WebKit headless émet `pointerdown`,
 * `touchstart` et `touchend` — et RIEN D'AUTRE. Aucun `click`. Or le
 * gestionnaire de l'application est un `click` délégué au document
 * (`tableau-bord-apercu.js`, « Gestionnaire de clic sur les points »). Sur un
 * vrai iPad, Safari émet ce `click` derrière le tap ; le harnais, non.
 *
 * Conséquence de l'oubli, mesurée avant correction : les trois cas « le doigt
 * saisit quand même » échouaient — le code n'y était pour rien, la sélection
 * n'était jamais demandée — et, PIRE, les deux cas « le doigt ne saisit
 * personne » passaient QUOI QU'IL ARRIVE. Break-testés : la tolérance tactile
 * entièrement retirée de `pointLePlusProcheDuToucher`, ils restaient VERTS.
 * Ils n'attestaient rien. Ce sont eux qui tenaient la CI rouge depuis le
 * 8 septembre.
 *
 * On pose le clic sur l'élément réellement sous le doigt — `elementFromPoint`,
 * ce que le navigateur désigne comme cible — et jamais sur la bulle qu'on
 * espère voir gagner : autrement l'essai s'écrirait sa propre réponse.
 */
async function toucher(page, x, y) {
    await page.touchscreen.tap(x, y);
    await page.evaluate(({ x, y }) => {
        const cible = document.elementFromPoint(x, y) || document.body;
        cible.dispatchEvent(new MouseEvent('click', {
            bubbles: true, cancelable: true, clientX: x, clientY: y
        }));
    }, { x, y });
    await page.waitForTimeout(120);
}

test('un doigt posé À CÔTÉ d\'une bulle la saisit quand même', async ({ page }) => {
    await ouvrir(page);
    const centres = await poserBarre(page, [{ nom: 'Tremblay', left: 200 }]);
    const c = centres[0];

    // 12 px au-dessus et à droite du centre : le doigt manque la bulle de 10 px,
    // c'est très exactement le geste qui ne saisissait rien.
    await toucher(page, c.x + 12, c.y - 4);
    expect(await selectionnee(page)).toBe('Tremblay');
});

test('LE POINT DÉCISIF — c\'est la bulle la PLUS PROCHE qui est saisie, pas celle du dessus', async ({ page }) => {
    await ouvrir(page);
    // 30 px d'écart : deux zones sensibles de 44 px se recouvriraient, et le
    // toucher irait à la dernière posée. Ici il va à la plus proche du doigt.
    const centres = await poserBarre(page, [
        { nom: 'Tremblay', left: 200 },
        { nom: 'Dupont', left: 230 }
    ]);
    const t = centres.find((c) => c.nom === 'Tremblay');
    const d = centres.find((c) => c.nom === 'Dupont');

    await toucher(page, t.x + 8, t.y);       // 8 px de Tremblay, 22 de Dupont
    expect(await selectionnee(page)).toBe('Tremblay');

    await toucher(page, d.x - 8, d.y);       // le miroir : 8 px de Dupont
    expect(await selectionnee(page)).toBe('Dupont');
});

test('le toucher pose l\'infobulle du bon élève, dès le PREMIER contact', async ({ page }) => {
    await ouvrir(page);
    // Le premier toucher servait de survol simulé sur iPad : la bulle grossissait
    // et le clic n'arrivait qu'au toucher suivant. Un seul tap doit suffire.
    const centres = await poserBarre(page, [{ nom: 'Bouchard', left: 300 }]);
    await toucher(page, centres[0].x + 10, centres[0].y);

    const info = page.locator('.barre-etudiant-info');
    await expect(info).toHaveCount(1);
    await expect(info).toContainText('Bouchard');
});

test('trop loin de toute bulle, le toucher ne saisit personne', async ({ page }) => {
    await ouvrir(page);
    const centres = await poserBarre(page, [{ nom: 'Tremblay', left: 200 }]);
    // 40 px : au-delà du rayon de tolérance de 22 px.
    await toucher(page, centres[0].x + 40, centres[0].y);
    expect(await selectionnee(page)).toBe(null);
});

test('une barre voisine ne vole pas le toucher', async ({ page }) => {
    await ouvrir(page);
    await poserBarre(page, [{ nom: 'Tremblay', left: 200 }]);

    // ⚠ CE TEST A MENTI AU PREMIER JET, et le break-test l'a pris : la barre
    // voisine était 80 px plus bas, donc sa bulle restait hors du rayon de
    // tolérance de toute façon. En étendant la recherche à tout le document, le
    // test restait VERT — il ne mesurait rien. Il faut que la bulle voisine soit
    // assez proche du doigt pour être saisie SI la recherche débordait : elle est
    // donc posée au bord HAUT de sa barre, collée sous la première.
    const voisine = await page.evaluate(() => {
        const barre = document.createElement('div');
        barre.className = 'barre-indicateur barre-indicateur-essai-voisine';
        // Collée juste sous la première (qui occupe 300 → 355).
        barre.style.cssText = 'position: fixed; left: 100px; top: 356px; width: 600px; height: 55px; z-index: 9999;';
        const point = document.createElement('div');
        point.className = 'barre-etudiant';
        point.style.left = '400px';
        point.style.top = '0';        // au bord haut : son centre tombe à y = 356
        point.style.animation = 'none';
        point.dataset.nom = 'Voisine';
        barre.appendChild(point);
        document.body.appendChild(barre);
        const r = point.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    // Un doigt posé dans la PREMIÈRE barre, à 6 px seulement de la bulle voisine
    // — largement dans le rayon de 22 px. La seule chose qui l'empêche d'être
    // saisie est que la recherche est bornée à la barre touchée.
    const yDoigt = 350;
    expect(Math.abs(voisine.y - yDoigt), 'la bulle voisine doit être DANS le rayon, sinon le test ne mesure rien')
        .toBeLessThan(22);

    await toucher(page, voisine.x, yDoigt);
    expect(await selectionnee(page)).toBe(null);
});

test.describe('sans doigt, rien ne change pour la souris', () => {
    test.use({ hasTouch: false, isMobile: false });

    test('un clic À CÔTÉ d\'une bulle ne la saisit pas', async ({ page }) => {
        // L'envers de la garde : sous pointeur fin, viser 10 px est un geste
        // ordinaire et un clic à côté doit continuer de désélectionner. Sans cet
        // essai, une tolérance appliquée partout passerait tous les autres.
        await ouvrir(page);
        const centres = await poserBarre(page, [{ nom: 'Tremblay', left: 200 }]);
        await page.mouse.click(centres[0].x + 12, centres[0].y - 4);
        expect(await selectionnee(page)).toBe(null);

        // Et le clic PLEIN sur la bulle, lui, saisit toujours.
        await page.mouse.click(centres[0].x, centres[0].y);
        expect(await selectionnee(page)).toBe('Tremblay');
    });
});
