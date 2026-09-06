import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #774 — LE BANDEAU (↔) PREND LA HAUTEUR DE SON CONTENU, PAS 60 %
// DE L'ÉCRAN.
//
// CE QUE GRÉGOIRE A MONTRÉ, capture d'iPad du 6 septembre 2026 (1.123.7) : la
// palette Codes en disposition ↔, ses dix codes tenant en deux lignes, et les
// quatre cinquièmes du bandeau — vides — couvrant la copie de l'élève. C'est ce
// vide qui l'a poussé à vouloir redimensionner, et donc à découvrir #773 (le
// coin qui ne se saisissait pas au doigt).
//
// LA CAUSE : `layoutPaletteH` (travaux-outils.js) posait
// `min(zone - 24, zone × 0.6)` — la même bande pour dix codes que pour cent.
//
// CE QUE CETTE SENTINELLE MESURE, sur le chemin réel (creerLayoutAnnotation pose
// la vraie palette Codes, le vrai bouton ↔ appelle le vrai layoutPaletteH) :
//   · le bandeau contient tout son contenu SANS défilement — c'est le seul
//     attendu qui dit « la hauteur est suffisante » ;
//   · et il est franchement plus court que l'ancienne formule — c'est celui qui
//     dit « elle n'est plus arbitraire ». Les deux ensemble : ni trop, ni trop peu.
//   · la zone reste un plafond dur : dans un conteneur trop bas pour le contenu,
//     la palette ne déborde pas de la zone (elle y redevient défilante).
//
// Les seuils sont des RAPPORTS, pas des pixels : une différence de police entre
// WebKit macOS et WebKit Linux ne doit pas faire rougir un essai qui mesure une
// règle de mise en page.

async function ouvrirCodes(page, largeur, hauteur) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    const ok = await page.evaluate(([w, h]) => {
        localStorage.removeItem('travaux-palette-erreurs-fr-pos');
        const cont = document.createElement('div');
        cont.id = 'travaux-conteneur-document';
        cont.style.cssText = `position:fixed; top:0; left:0; width:${w}px; height:${h}px; z-index:9999; background:#fff;`;
        document.body.appendChild(cont);
        if (!window.travauxUI || typeof window.travauxUI.creerLayoutAnnotation !== 'function') return false;
        window.travauxUI.creerLayoutAnnotation();
        return !!document.getElementById('travaux-palette-erreurs-fr');
    }, [largeur, hauteur]);
    expect(ok, 'la palette Codes doit être posée par creerLayoutAnnotation').toBe(true);
}

const mesurer = () => {
    const p = document.getElementById('travaux-palette-erreurs-fr');
    const cont = document.getElementById('travaux-conteneur-document');
    return {
        hauteur: p.getBoundingClientRect().height,
        largeur: p.getBoundingClientRect().width,
        contenuTotal: p.scrollHeight,
        visible: p.clientHeight,
        hauteurZone: cont.getBoundingClientRect().height,
        bas: p.getBoundingClientRect().bottom - cont.getBoundingClientRect().top
    };
};

test('#774 · en bandeau (↔), la palette Codes tient son contenu sans le noyer dans du vide', async ({ page }) => {
    await ouvrirCodes(page, 900, 700);

    // Le VRAI bouton ↔ de la barre, pas un appel direct : si le câblage du bouton
    // se perd, cet essai doit le voir.
    await page.click('#travaux-palette-erreurs-fr .palette-flottante-toggle[data-action="travauxOutils.layoutPaletteH"]');
    const m = await page.evaluate(mesurer);
    console.log('BANDEAU →', JSON.stringify(m));

    // 1. La hauteur SUFFIT : tout le contenu est là, rien n'est renvoyé au défilement.
    expect(m.contenuTotal - m.visible, 'le bandeau contient tout son contenu, sans défilement').toBeLessThanOrEqual(2);

    // 2. Et elle ne DÉPASSE pas : l'ancienne formule donnait 0.6 × 700 = 420 px pour
    //    ce même contenu. On exige nettement moins, sans fixer un pixel.
    expect(m.hauteur, 'et elle est franchement plus courte que les 60 % d\'avant').toBeLessThan(m.hauteurZone * 0.45);

    // 3. Le bandeau reste un bandeau : toute la largeur de la zone.
    expect(m.largeur, 'la largeur, elle, reste maximale — c\'est la disposition ↔').toBeGreaterThan(800);
});

test('#774 · la zone reste le plafond : dans un conteneur trop bas, la palette n\'en sort pas', async ({ page }) => {
    // 150 px de haut, marges comprises : moins que le contenu de la palette. Le
    // contenu ne peut pas gagner, et c'est voulu — une palette plus haute que la
    // zone serait insaisissable.
    await ouvrirCodes(page, 900, 150);
    await page.click('#travaux-palette-erreurs-fr .palette-flottante-toggle[data-action="travauxOutils.layoutPaletteH"]');
    const m = await page.evaluate(mesurer);
    console.log('ZONE BASSE →', JSON.stringify(m));

    expect(m.contenuTotal, 'le banc a bien un contenu plus haut que ce que la zone permet (sinon il ne mesure rien)').toBeGreaterThan(m.hauteurZone - 24);
    expect(m.hauteur, 'la palette ne dépasse pas la zone moins ses marges').toBeLessThanOrEqual(m.hauteurZone - 24 + 1);
    expect(m.bas, 'et son bas reste dans la zone').toBeLessThanOrEqual(m.hauteurZone);
});
