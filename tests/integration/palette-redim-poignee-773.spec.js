import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #773 — LA PALETTE DES CODES SE REDIMENSIONNE PAR SON COIN, AU DOIGT.
//
// LE DÉFAUT, tel que Grégoire l'a rencontré le 6 septembre 2026 sur son iPad
// (Safari 26.6, 1.123.7) : « je ne suis pas capable de saisir le coin inférieur
// droit de la palette des codes afin de redimensionner la palette ». Les quatre
// palettes flottantes (Annotation, Codes, Tampons, Évaluer) comptaient sur le
// `resize: both` du CSS — une poignée que WebKit iPadOS ne rend pas au toucher.
// La limite était nommée depuis le #144 (11 juin) : le glisser avait été porté
// en Pointer Events, pas le redimensionnement.
//
// CE QUE CETTE SENTINELLE MESURE, sur le CHEMIN RÉEL (creerLayoutAnnotation
// pose la vraie palette Codes et appelle la vraie configurerDragPalette) :
//   · une poignée existe dans le coin de la palette, assez grande pour un doigt
//     (44 px, la norme iPad du skill design-interface), et elle garde le geste
//     (touch-action: none — sinon Safari le cède au défilement natif) ;
//   · la tirer redimensionne la palette et la taille est PERSISTÉE — ce que le
//     `resize` natif ne faisait jamais ;
//   · la poignée reste au coin VISIBLE quand la palette défile (la palette est
//     son propre conteneur de défilement, et l'ancien indicateur ::after partait
//     avec le contenu) ET quand la palette est plus haute que son contenu (une
//     poignée `sticky`, essayée d'abord, restait au bout du contenu) ;
//   · repliée, la palette n'a plus de poignée.
//
// Playwright n'a pas de doigt : le geste est joué à la souris, sur les MÊMES
// écouteurs Pointer Events que ceux que l'iPad déclenche. Ce que le banc ne
// peut pas juger — la poignée native absente, le doigt réel — est la porte
// terrain de Grégoire.

async function ouvrirCodes(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    const ok = await page.evaluate(() => {
        localStorage.removeItem('travaux-palette-erreurs-fr-pos');
        const cont = document.createElement('div');
        cont.id = 'travaux-conteneur-document';
        cont.style.cssText = 'position:fixed; top:0; left:0; width:900px; height:700px; z-index:9999; background:#fff;';
        document.body.appendChild(cont);
        if (!window.travauxUI || typeof window.travauxUI.creerLayoutAnnotation !== 'function') return false;
        window.travauxUI.creerLayoutAnnotation();
        return !!document.getElementById('travaux-palette-erreurs-fr');
    });
    expect(ok, 'la palette Codes doit être posée par creerLayoutAnnotation').toBe(true);
}

const geometrie = () => {
    const p = document.getElementById('travaux-palette-erreurs-fr');
    const g = p.querySelector(':scope > .palette-poignee-redim');
    if (!g) return { poignee: false };
    const pr = p.getBoundingClientRect();
    const gr = g.getBoundingClientRect();
    const cs = getComputedStyle(g);
    return {
        poignee: true,
        largeurPalette: pr.width, hauteurPalette: pr.height,
        largeurPoignee: gr.width, hauteurPoignee: gr.height,
        ecartDroit: pr.right - gr.right, ecartBas: pr.bottom - gr.bottom,
        touchAction: cs.touchAction, affichee: cs.display !== 'none',
        scrollTop: p.scrollTop, scrollMax: p.scrollHeight - p.clientHeight
    };
};

test('#773 · la palette Codes porte une poignée de 44 px dans son coin, qui garde le geste', async ({ page }) => {
    await ouvrirCodes(page);
    const g = await page.evaluate(geometrie);
    console.log('GÉOMÉTRIE →', JSON.stringify(g));

    expect(g.poignee, 'une poignée .palette-poignee-redim est posée sur la palette').toBe(true);
    expect(g.largeurPoignee, 'cible tactile : largeur ≥ 44 px').toBeGreaterThanOrEqual(44);
    expect(g.hauteurPoignee, 'cible tactile : hauteur ≥ 44 px').toBeGreaterThanOrEqual(44);
    expect(g.touchAction, 'touch-action:none — Safari ne doit pas céder le geste au défilement').toBe('none');
    expect(Math.abs(g.ecartDroit), 'collée au bord droit').toBeLessThanOrEqual(2);
    expect(Math.abs(g.ecartBas), 'collée au bord bas').toBeLessThanOrEqual(2);
});

test('#773 · tirer la poignée redimensionne la palette, et la taille survit (persistée)', async ({ page }) => {
    await ouvrirCodes(page);
    const avant = await page.evaluate(geometrie);
    const box = await page.locator('#travaux-palette-erreurs-fr > .palette-poignee-redim').boundingBox();

    // Le coin même : la zone sensible est un triangle (clip-path) pointé sur le coin.
    const x0 = box.x + box.width - 6, y0 = box.y + box.height - 6;
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    await page.mouse.move(x0 + 90, y0 + 70, { steps: 12 });
    await page.mouse.up();

    const apres = await page.evaluate(geometrie);
    const sauve = await page.evaluate(() => JSON.parse(localStorage.getItem('travaux-palette-erreurs-fr-pos') || 'null'));
    console.log('AVANT →', JSON.stringify(avant), 'APRÈS →', JSON.stringify(apres), 'SAUVÉ →', JSON.stringify(sauve));

    expect(apres.largeurPalette - avant.largeurPalette, 'la largeur a suivi le pointeur (+90)').toBeGreaterThan(70);
    expect(apres.hauteurPalette - avant.hauteurPalette, 'la hauteur a suivi le pointeur (+70)').toBeGreaterThan(50);
    expect(sauve && sauve.width, 'la largeur est persistée avec la position').toMatch(/px$/);
    expect(sauve && sauve.height, 'la hauteur est persistée avec la position').toMatch(/px$/);
    // La palette est maintenant plus haute que son contenu (scrollMax 0) : la
    // poignée doit être au coin de la PALETTE, pas au bout du contenu.
    expect(apres.scrollMax, 'le banc a bien une palette plus haute que son contenu').toBe(0);
    expect(Math.abs(apres.ecartBas), 'la poignée est restée au bord bas de la palette').toBeLessThanOrEqual(2);
});

test('#773 · la poignée reste au coin visible quand la palette défile, et disparaît repliée', async ({ page }) => {
    await ouvrirCodes(page);
    const defilee = await page.evaluate(() => {
        const p = document.getElementById('travaux-palette-erreurs-fr');
        // Forcer un débordement : une palette basse, un contenu long.
        p.style.height = '160px';
        p.scrollTop = 100000;
        return null;
    });
    void defilee;
    const g = await page.evaluate(geometrie);
    console.log('DÉFILÉE →', JSON.stringify(g));
    expect(g.scrollMax, 'le banc a bien produit un débordement (sinon il ne mesure rien)').toBeGreaterThan(20);
    expect(g.scrollTop, 'et la palette est défilée jusqu\'en bas').toBeGreaterThan(20);
    expect(Math.abs(g.ecartBas), 'la poignée est toujours au bord bas VISIBLE').toBeLessThanOrEqual(2);
    expect(Math.abs(g.ecartDroit), 'et au bord droit').toBeLessThanOrEqual(2);

    await page.evaluate(() => window.travauxOutils.togglePaletteErrFrReplie());
    const repliee = await page.evaluate(geometrie);
    expect(repliee.affichee, 'repliée : plus de poignée').toBe(false);
});
