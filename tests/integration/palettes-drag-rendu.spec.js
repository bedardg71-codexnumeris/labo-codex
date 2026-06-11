import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Bug #144 (11 juin 2026) — palettes d'annotation sur iPad et Mac.
// Exerce le chemin réel du mode normal (creerLayoutAnnotation) :
//   1. la palette Annotation est déplaçable (configurerDragPalette est
//      câblé sur ce chemin — il ne l'était pas avant le fix) ;
//   2. une position sauvegardée hors zone est ramenée dans le conteneur
//      (sinon la palette Codes « disparaît » au rechargement) ;
//   3. aucune erreur console.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

test('#144 · layout annotation : palette Annotation déplaçable, position hors zone bornée', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const etat = await page.evaluate(() => {
        // Position sauvegardée volontairement hors zone (autre layout/largeur)
        localStorage.setItem('travaux-palette-erreurs-fr-pos', JSON.stringify({ left: '5000px', top: '3000px' }));

        // Conteneur d'annotation minimal dans le viewport (le vrai layout
        // exige une production chargée)
        const cont = document.createElement('div');
        cont.id = 'travaux-conteneur-document';
        cont.style.cssText = 'position:fixed; top:0; left:0; width:900px; height:700px; z-index:9999;';
        document.body.appendChild(cont);

        window.travauxUI.creerLayoutAnnotation();

        const annot = document.getElementById('travaux-palette-flottante');
        const codes = document.getElementById('travaux-palette-erreurs-fr');
        const contRect = cont.getBoundingClientRect();
        const codesRect = codes ? codes.getBoundingClientRect() : null;
        return {
            annotPresente: !!annot,
            codesPresente: !!codes,
            codesDansZone: codesRect
                ? codesRect.left >= contRect.left && codesRect.left < contRect.right
                  && codesRect.top >= contRect.top && codesRect.top < contRect.bottom
                : false,
            codesLeft: codesRect ? codesRect.left : null,
            codesTop: codesRect ? codesRect.top : null
        };
    });

    expect(etat.annotPresente).toBe(true);
    expect(etat.codesPresente).toBe(true);
    expect(etat.codesDansZone).toBe(true);

    // Drag souris sur la barre de la palette Annotation (le même chemin
    // Pointer Events sert le doigt et l'Apple Pencil sur iPad)
    const barre = page.locator('#travaux-palette-flottante .palette-flottante-barre');
    const avant = await page.evaluate(() => document.getElementById('travaux-palette-flottante').getBoundingClientRect().left);
    const box = await barre.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 80, { steps: 8 });
    await page.mouse.up();
    const apres = await page.evaluate(() => document.getElementById('travaux-palette-flottante').getBoundingClientRect().left);

    expect(apres - avant).toBeGreaterThan(100);
    expect(erreurs).toEqual([]);
});
