import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #937 — LE CHRONOMÈTRE REVIENT DANS LA BARRE DU HAUT D'ANNOTER.
//
// Retour testeur de Grégoire, 23 sept. 2026 (1.155.4) : « Je voudrais qu'on
// déplace le chronomètre dans la toolbar, en haut, à droite du canevas. […] il
// occupe ainsi de l'espace dans le canevas et ce n'est pas nécessaire. » Pour
// faire la place, trois groupes redondants quittent la barre : les chevrons
// d'un élève à l'autre (le carrousel le fait), « pleine largeur » / « pleine
// hauteur », et la palette du fond, qui passe dans le menu Actions.
//
// Chemin réel : la vraie afficherVisionneuse() pose la barre ; la vraie
// préférence chronoEvaluation décide si le chrono s'y montre.

async function ouvrirVisionneuse(page, chronoActif) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);
    return page.evaluate((actif) => {
        window.definirPreference('chronoEvaluation', actif);
        const hote = document.getElementById('evaluations-contenu-fichiers');
        // L'hôte vit dans une sous-section masquée : on le sort dans la page pour mesurer le rendu.
        document.body.appendChild(hote);
        hote.style.cssText = 'position:fixed; top:0; left:0; width:1100px; height:700px; z-index:9999; display:block;';
        window.travauxUI.afficherVisionneuse();
        return !!document.getElementById('travaux-conteneur-document');
    }, chronoActif);
}

test('#937 · la barre porte le chrono, sans chevrons d\'élève, sans ajustements, sans fond', async ({ page }) => {
    expect(await ouvrirVisionneuse(page, true), 'la visionneuse est posée').toBe(true);
    const etat = await page.evaluate(() => {
        const barre = document.querySelector('.annot-toolbar-outils');
        const chrono = document.getElementById('travaux-chrono-toolbar');
        const plein = document.getElementById('travaux-btn-plein-ecran');
        return {
            chronoDansBarre: !!(chrono && barre.contains(chrono)),
            chronoVisible: !!chrono && getComputedStyle(chrono).display !== 'none' && chrono.getBoundingClientRect().width > 0,
            chronoApresPleinEcran: !!(chrono && plein && (plein.compareDocumentPosition(chrono) & Node.DOCUMENT_POSITION_FOLLOWING)),
            badge: (document.getElementById('chrono-badge') || {}).textContent,
            chevronsEleve: !!document.getElementById('travaux-btn-badge-prec') || !!document.getElementById('travaux-btn-badge-suiv'),
            ajustements: !!barre.querySelector('[data-action="travauxVisionneuse.zoomPleineLargeur"], [data-action="travauxVisionneuse.zoomPleineHauteur"]'),
            fondDansBarre: !!barre.querySelector('.travaux-fond-swatch, #travaux-btn-fond'),
            paletteChrono: !!document.getElementById('travaux-palette-chrono'),
            pagesGardees: !!document.getElementById('travaux-btn-page-prec') && !!document.getElementById('travaux-btn-page-suiv')
        };
    });
    expect(etat.chronoDansBarre, 'le chrono est dans la barre du haut').toBe(true);
    expect(etat.chronoVisible, 'préférence cochée : le chrono se voit').toBe(true);
    expect(etat.chronoApresPleinEcran, 'le chrono est au bout droit de la barre').toBe(true);
    expect(etat.badge).toBe('--:--');
    expect(etat.chevronsEleve, 'les chevrons d\'un élève à l\'autre sont retirés').toBe(false);
    expect(etat.ajustements, 'pleine largeur / pleine hauteur sont retirés').toBe(false);
    expect(etat.fondDansBarre, 'le fond n\'est plus dans la barre').toBe(false);
    expect(etat.paletteChrono, 'plus aucune palette flottante du chrono').toBe(false);
    expect(etat.pagesGardees, 'la navigation entre les pages d\'une copie reste').toBe(true);

    // Le chrono démarre et s'affiche dans la barre, avec son bouton pause.
    const enMarche = await page.evaluate(() => {
        window.travauxUI.demarrerChrono();
        const btn = document.getElementById('chrono-btn-pause');
        const r = { badge: document.getElementById('chrono-badge').textContent, pause: btn.style.display !== 'none' };
        window.travauxUI.pauserChrono();
        return r;
    });
    expect(enMarche.badge).not.toBe('--:--');
    expect(enMarche.pause, 'en marche, le bouton pause apparaît').toBe(true);
});

test('#937 · préférence décochée : le chrono ne prend pas de place dans la barre', async ({ page }) => {
    expect(await ouvrirVisionneuse(page, false)).toBe(true);
    const cache = await page.evaluate(() => {
        const chrono = document.getElementById('travaux-chrono-toolbar');
        return getComputedStyle(chrono).display === 'none';
    });
    expect(cache).toBe(true);
});

test('#937 · le fond du canevas se choisit dans le menu Actions, et le menu reste ouvert', async ({ page }) => {
    expect(await ouvrirVisionneuse(page, false)).toBe(true);
    await page.locator('#travaux-btn-actions').click();
    const pastilles = page.locator('#travaux-actions-dropdown .travaux-fond-swatch');
    await expect(pastilles).toHaveCount(12);
    await pastilles.nth(1).click();
    const r = await page.evaluate(() => ({
        fond: document.getElementById('travaux-canvas-container').style.background,
        sauve: window.db.getSync('travaux-fond-canvas', null),
        ouvert: document.getElementById('travaux-actions-dropdown').classList.contains('ouvert')
    }));
    expect(r.fond).not.toBe('');
    expect(r.sauve).toBe('#142428');
    expect(r.ouvert, 'le menu reste ouvert pour comparer les fonds').toBe(true);
});
