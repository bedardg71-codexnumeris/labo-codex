import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #644 — UN BOUTON POSÉ DANS UNE BARRE DE PALETTE REÇOIT SON CLIC.
//
// LE DÉFAUT, tel que Grégoire l'a rencontré le 31 août 2026 : dans la page
// Évaluation, le cadenas de la palette PARAMÈTRES ne réagissait à rien — pas
// d'action, pas de message, pas d'erreur — et déverrouiller une évaluation était
// donc IMPOSSIBLE. Ses voisins ↔ ↕ − de la même barre fonctionnaient.
//
// LA CAUSE, MESURÉE ET NON DÉDUITE. `configurerDragPalette` installe le glisser sur
// la barre et en exemptait les boutons par leur CLASSE (`.palette-flottante-toggle`,
// `.travaux-palette-toggle`). Le cadenas (`travaux-ui.js`, `#btnVerrouPalette`) porte
// `btn btn-compact` : aucune exemption. Sur appui, la barre appelait
// `setPointerCapture()`, le `pointerup` partait vers la barre, les deux extrémités du
// clic n'atterrissaient plus sur la même cible, et aucun `click` ne se formait.
// ⚠ Ce n'est PAS `preventDefault()`, contrairement à ce qu'on lit dans la spec Pointer
// Events. Mesuré dans WebKit, gestes isolés : `preventDefault()` seul laisse passer le
// clic (1/1) ; `setPointerCapture()` seule le supprime (0/1) ; témoin sans geste 1/1.
//
// CE QUE CETTE SENTINELLE GARDE, et pourquoi elle est écrite ainsi :
//   · elle appelle la VRAIE `travauxOutils.configurerDragPalette`, pas une copie du
//     mécanisme — une réécriture du glisser doit la faire rougir ;
//   · elle mesure une PAIRE. Le bouton exempté d'origine sert de témoin : sans lui,
//     un zéro sur les deux ne distinguerait pas « le clic est avalé » de « mon banc
//     ne clique pas » ;
//   · elle porte son GARDE-FOU INVERSE. Élargir l'exemption jusqu'à exempter la barre
//     entière troquerait un bouton mort contre un glisser mort. Le second cas rougit
//     dans ce sens-là.
//
// Elle n'écoute pas la console : ce serait importer une liste de tolérance du
// chargement `file://` que je n'ai pas re-dérivée ici, et une tolérance non dérivée
// est une garde qui peut naître morte. Les assertions portent sur l'EFFET — un clic
// reçu, une palette déplacée.

// Réplique conforme d'une barre de palette : titre non cliquable, puis deux boutons
// dans le même groupe — l'un porteur de la classe historiquement exemptée, l'autre
// avec les classes du cadenas réel (`btn btn-compact`).
const MONTER = `() => {
    const conteneur = document.createElement('div');
    conteneur.id = 'banc644-conteneur';
    conteneur.style.cssText = 'position:fixed; inset:0; z-index:99990;';
    document.body.appendChild(conteneur);

    const palette = document.createElement('div');
    palette.id = 'banc644-palette';
    palette.className = 'palette-flottante travaux-palette-eval';
    palette.style.cssText = 'position:absolute; top:40px; left:40px; width:320px; background:#fff; z-index:99991;';

    const barre = document.createElement('div');
    barre.className = 'palette-flottante-barre';
    barre.style.cssText = 'display:flex; align-items:center; gap:8px; padding:8px;';

    const titre = document.createElement('span');
    titre.className = 'palette-flottante-titre';
    titre.textContent = 'Parametres';

    const groupe = document.createElement('div');
    groupe.style.cssText = 'display:flex; gap:8px;';

    // Le cadenas : MÊMES classes que #btnVerrouPalette (travaux-ui.js).
    const verrou = document.createElement('button');
    verrou.id = 'banc644-verrou';
    verrou.className = 'btn btn-compact';
    verrou.textContent = 'V';
    verrou.style.cssText = 'width:34px; height:28px;';

    // Le voisin, porteur de la classe historiquement exemptée : c'est le TÉMOIN.
    const toggle = document.createElement('button');
    toggle.id = 'banc644-toggle';
    toggle.className = 'palette-flottante-toggle';
    toggle.textContent = 'H';
    toggle.style.cssText = 'width:34px; height:28px;';

    groupe.appendChild(verrou);
    groupe.appendChild(toggle);
    barre.appendChild(titre);
    barre.appendChild(groupe);
    palette.appendChild(barre);

    const corps = document.createElement('div');
    corps.className = 'palette-flottante-contenu';
    corps.style.cssText = 'height:60px;';
    palette.appendChild(corps);
    conteneur.appendChild(palette);

    window.__banc644 = { verrou: 0, toggle: 0 };
    verrou.addEventListener('click', () => { window.__banc644.verrou++; });
    toggle.addEventListener('click', () => { window.__banc644.toggle++; });

    if (!window.travauxOutils || typeof window.travauxOutils.configurerDragPalette !== 'function') return false;
    window.travauxOutils.configurerDragPalette(palette, conteneur);
    return true;
}`;

async function ouvrir(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    const monte = await page.evaluate('(' + MONTER + ')()');
    expect(monte, 'travauxOutils.configurerDragPalette doit être disponible').toBe(true);
}

test('#644 · tout bouton d\'une barre de palette reçoit son clic, pas seulement les « toggle »', async ({ page }) => {
    await ouvrir(page);

    await page.click('#banc644-verrou');
    await page.click('#banc644-toggle');

    const r = await page.evaluate(() => window.__banc644);
    console.log('CLICS REÇUS →', JSON.stringify(r));

    // Le témoin d'abord : s'il tombe, ce n'est pas le code qui est en cause, c'est
    // le banc — et le zéro de l'autre ne voudrait plus rien dire.
    expect(r.toggle, 'TÉMOIN : le bouton porteur de la classe exemptée reçoit son clic').toBe(1);
    expect(r.verrou, 'et le bouton SANS cette classe le reçoit aussi — c\'était le défaut #644').toBe(1);
});

test('#644 · le glisser par le titre reste entier — l\'exemption ne mange pas la barre', async ({ page }) => {
    await ouvrir(page);

    const titre = await page.locator('#banc644-palette .palette-flottante-titre').boundingBox();
    await page.mouse.move(titre.x + 10, titre.y + titre.height / 2);
    await page.mouse.down();
    await page.mouse.move(titre.x + 130, titre.y + titre.height / 2 + 60, { steps: 10 });
    await page.mouse.up();

    const pos = await page.evaluate(() => {
        const p = document.getElementById('banc644-palette');
        return { left: parseFloat(p.style.left) || 0, top: parseFloat(p.style.top) || 0 };
    });
    console.log('POSITION APRÈS GLISSER →', JSON.stringify(pos));

    // Départ à left:40 / top:40, déplacement demandé de +120 / +60.
    expect(pos.left, 'la palette a suivi le pointeur horizontalement').toBeGreaterThan(100);
    expect(pos.top, 'et verticalement').toBeGreaterThan(80);
});
