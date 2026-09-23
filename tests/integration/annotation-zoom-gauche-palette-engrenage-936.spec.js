import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// PORTE #936 — ZOOMÉ, ON ATTEINT LE BORD GAUCHE DU TRAVAIL ; LA ROUE DE LA PALETTE RESTE UNE ROUE.
//
// Rapport de bug de Grégoire, 23 septembre 2026, 9 h 31 (1.155.3, Chrome, Mac), Évaluation › Annoter :
// « À cause du zoom, je suis limité dans mes déplacements dans le canevas […] il me manque la partie de
// gauche et je ne peux pas scroller vers la gauche. De plus, sur la palette d'annotation, il y a deux
// symboles − alors que l'un des deux devrait être une roue d'engrenage. »
//
// CAUSE 1 — LE CENTRAGE. `.travaux-canvas-container` défile (`overflow: auto`) ET centre son contenu
// (`justify-content: center`). Le wrapper porte `margin: 100vh 100vw` : le contenu déborde TOUJOURS, et
// le centrage le fait déborder à parts égales des deux côtés. Un débordement à gauche n'est jamais
// défilable. Tant que le document tient dans la largeur, seule la marge est perdue ; dès qu'il la
// dépasse (zoom), la moitié de l'excédent du DOCUMENT est coupée à gauche. L'axe vertical, en
// `align-items: flex-start`, n'a jamais eu le défaut — d'où « je ne peux pas scroller vers la gauche ».
//
// CAUSE 2 — LE PREMIER BOUTON. La barre de la palette Annotation porte deux `.palette-flottante-toggle` :
// la roue (Personnaliser) PUIS le « − ». `togglePaletteReplie` prenait `querySelector(...)`, soit le
// PREMIER : la roue perdait son icône au profit de « − » / « + ». Même défaut dans les palettes
// d'Évaluation (le « ↔ » devenait « − »). Le banc ouvre l'application (modules réels) et fait le geste.

const CSS = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const UI = readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf8');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

async function ouvrirApp(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.travauxOutils === 'object' && typeof window.travauxUI === 'object');
}

test('#936 — zoomé plus large que l’écran, défiler à fond à gauche montre le bord gauche du document', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.setContent('<div style="display:flex;width:900px;height:600px">'
        + '<div class="travaux-canvas-container" id="c"><div class="travaux-canvas-wrapper" id="w">'
        + '<canvas id="d" width="1600" height="1200" style="display:block"></canvas></div></div></div>');
    await page.addStyleTag({ content: CSS });

    const mesure = await page.evaluate(() => {
        const c = document.getElementById('c');
        const d = document.getElementById('d');
        c.scrollLeft = 0;
        c.scrollTop = 0;
        const rc = c.getBoundingClientRect();
        const rd = d.getBoundingClientRect();
        // Témoin : le document dépasse bien la largeur visible (sinon le banc ne mesure rien).
        return { depasse: rd.width > c.clientWidth, bordGaucheDansLaVue: rd.left - rc.left };
    });
    expect(mesure.depasse).toBe(true);
    // Défilé à fond à gauche, le bord gauche du document doit être à droite du bord du conteneur.
    expect(mesure.bordGaucheDansLaVue).toBeGreaterThanOrEqual(0);
});

test('#936 — replier puis déplier la palette Annotation laisse la roue intacte et bascule le « − »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirApp(page);
    const etat = await page.evaluate(() => {
        document.getElementById('travaux-palette-flottante')?.remove();
        const zone = document.createElement('div');
        document.body.appendChild(zone);
        zone.innerHTML = window.travauxOutils.genererHTMLPalette();
        const roue = document.getElementById('travaux-btn-reglages-annotation');
        const bascule = document.getElementById('travaux-palette-toggle');
        const lire = () => ({ roueImg: !!roue.querySelector('img'), roueTexte: roue.textContent, bascule: bascule.textContent });
        window.travauxOutils.togglePaletteReplie();
        const replie = lire();
        window.travauxOutils.togglePaletteReplie();
        return { replie, deplie: lire() };
    });
    expect(erreurs).toEqual([]);
    expect(etat.replie).toEqual({ roueImg: true, roueTexte: '', bascule: '+' });
    expect(etat.deplie).toEqual({ roueImg: true, roueTexte: '', bascule: '−' });
});

test('#936 — replier une palette d’Évaluation ne remplace pas son « ↔ »', async ({ page }) => {
    await ouvrirApp(page);
    // La palette d'Évaluation vient d'un gabarit de travaux-ui.js ; on en rejoue la barre telle quelle.
    const debut = UI.indexOf('barre.innerHTML = `', UI.indexOf('function creerPaletteEval(')) + 'barre.innerHTML = `'.length; // security-ok: lecture du gabarit source, pas une écriture DOM
    const barre = UI.slice(debut, UI.indexOf('`', debut))
        .replace(/\$\{id\}/g, 'P').replace(/\$\{[^}]*\}/g, '')
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    const etat = await page.evaluate((barre) => {
        const zone = document.createElement('div');
        document.body.appendChild(zone);
        zone.innerHTML = '<div id="P" class="palette-flottante">' + barre + '</div>'; // security-ok: gabarit constant de travaux-ui.js, aucune donnée utilisateur
        const boutons = () => Array.from(document.querySelectorAll('#P .palette-flottante-toggle')).map((b) => b.textContent.trim());
        const avant = boutons();
        window.travauxUI.togglePaletteEvalReplie('P');
        return { avant, apres: boutons() };
    }, barre);
    // Témoin : le gabarit rejoué porte bien ↔, ↕ puis −.
    expect(etat.avant).toEqual(['↔', '↕', '−']);
    expect(etat.apres).toEqual(['↔', '↕', '+']);
});
