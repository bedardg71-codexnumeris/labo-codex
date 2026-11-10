import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — LES FLÈCHES DES PARCOURS (lot du 10 nov. 2026, plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md).
//
// Trois défenses, chacune avec son break-test (en pied de fichier) :
//   1. la géométrie de la flèche, en fonction pure : du bord de la bulle à la cible, la cible hors de l'écran, la cible
//      sous la bulle, la forme déterministe, les cibles groupées ;
//   2. le bornage d'une bulle déplacée : elle reste dans l'écran utile ;
//   3. les coordonnées : la couche des flèches est dimensionnée en px sur innerWidth × innerHeight, sans viewBox ni unité
//      de fenêtre. Le voile retiré était en 100vw × 100vh avec un viewBox en innerWidth × innerHeight : sous Safari iPad,
//      barre d'adresse visible, les deux diffèrent et le dessin glisse (inférence de Cowork, non mesurée sur l'appareil).
// Et le retrait lui-même : plus de voile ni dans le moteur, ni dans la feuille de style, ni dans les neuf définitions.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const moteur = lire('js/parcours-moteur.js');
const css = lire('css/parcours.css');

// Le moteur ne touche au DOM qu'à l'appel : chargé dans une fenêtre vide, il expose sa géométrie.
const fenetre = {};
new Function('window', 'document', moteur)(fenetre, {});
const { tracerFleche, grouperCibles, bornerDeplacement } = fenetre.ParcoursMoteur.geometrie;

const ECRAN = { largeur: 1180, hauteur: 820 };
const BULLE = { left: 400, top: 300, right: 780, bottom: 520 };
const rect = (left, top, right, bottom) => ({ left, top, right, bottom });
const dans = (p, r, marge = 0) => p.x >= r.left - marge && p.x <= r.right + marge && p.y >= r.top - marge && p.y <= r.bottom + marge;
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('La flèche : du bord de la bulle à la cible', () => {
    it('part du bord de la bulle et s’arrête à quelques px de la cible, sans la couvrir', () => {
        const cible = rect(900, 100, 1000, 160);
        const f = tracerFleche(BULLE, cible, ECRAN);
        expect(f).not.toBeNull();
        // Le départ est SUR le bord de la bulle (ici, son coin haut droit, le plus proche de la cible).
        expect(f.depart).toEqual({ x: 780, y: 300 });
        // La pointe est hors de la cible, à 6 px de son bord.
        expect(dans(f.pointe, cible)).toBe(false);
        expect(dans(f.pointe, cible, 6.5)).toBe(true);
        expect(f.horsEcran).toBe(false);
    });

    it('est une courbe bombée (un seul arc de Bézier) avec une pointe en deux traits ouverts, sans triangle fermé', () => {
        const f = tracerFleche(BULLE, rect(900, 100, 1000, 160), ECRAN);
        expect(f.d).toMatch(/^M[-\d.]+,[-\d.]+ Q[-\d.]+,[-\d.]+ [-\d.]+,[-\d.]+ M[-\d.]+,[-\d.]+ L[-\d.]+,[-\d.]+ L[-\d.]+,[-\d.]+$/);
        expect(f.d).not.toMatch(/z/i);
        // Bombée : le point de contrôle n'est pas sur la corde.
        const { depart: a, pointe: b, controle: k } = f;
        const ecart = Math.abs((b.x - a.x) * (a.y - k.y) - (a.x - k.x) * (b.y - a.y)) / Math.hypot(b.x - a.x, b.y - a.y);
        expect(ecart).toBeGreaterThan(4);
        expect(ecart).toBeLessThanOrEqual(28.1);
    });

    it('est déterministe : les mêmes rectangles rendent le même tracé, passage après passage', () => {
        const cible = rect(120.4, 600.2, 300.8, 700.6);
        const premier = tracerFleche(BULLE, cible, ECRAN).d;
        for (let k = 0; k < 20; k++) expect(tracerFleche(BULLE, cible, ECRAN).d).toBe(premier);
        expect(moteur).not.toMatch(/Math\.random/);
    });

    it('une cible sortie de l’écran : la flèche va au bord de l’écran, du côté de la cible', () => {
        const bas = tracerFleche(BULLE, rect(500, 1200, 700, 1300), ECRAN);
        expect(bas.horsEcran).toBe(true);
        expect(bas.pointe.y).toBe(810);
        expect(bas.pointe.x).toBe(600);
        const gauche = tracerFleche(BULLE, rect(-400, 350, -200, 450), ECRAN);
        expect(gauche.horsEcran).toBe(true);
        expect(gauche.pointe.x).toBe(10);
    });

    it('une cible à moitié sortie : la flèche vise ce qui reste visible', () => {
        const f = tracerFleche(BULLE, rect(1100, 100, 1400, 200), ECRAN);
        expect(f.horsEcran).toBe(false);
        expect(f.pointe.x).toBeLessThan(1100);
        expect(f.pointe.x).toBeGreaterThan(1090);
    });

    it('une cible cachée sous la bulle : pas de flèche', () => {
        expect(tracerFleche(BULLE, rect(500, 350, 600, 400), ECRAN)).toBeNull();
        // La bulle déplacée sur la cible, qui dépasse un peu : toujours rien.
        expect(tracerFleche(BULLE, rect(380, 380, 700, 460), ECRAN)).toBeNull();
    });

    it('une cible collée à la bulle : pas de flèche illisible (moins de 24 px)', () => {
        expect(tracerFleche(BULLE, rect(400, 532, 780, 600), ECRAN)).toBeNull();
        expect(tracerFleche(BULLE, rect(400, 560, 780, 600), ECRAN)).not.toBeNull();
    });

    it('une flèche qui passerait sur une autre cible arrive par un autre bord, sans rien croiser', () => {
        // La bulle à droite de deux cartes côte à côte : le plus court vers la carte de gauche traverse celle de droite.
        const bulle = rect(790, 226, 1170, 540);
        const gauche = rect(50, 228, 392, 800), droite = rect(414, 228, 756, 800);
        const directe = tracerFleche(bulle, gauche, ECRAN);
        expect(directe.pointe.y).toBeGreaterThan(300);          // elle traverse la carte de droite
        const detour = tracerFleche(bulle, gauche, ECRAN, [droite]);
        expect(detour).not.toBeNull();
        // Elle arrive par le haut de la carte de gauche, à 6 px au-dessus, et reste au-dessus de la carte de droite.
        expect(detour.pointe.y).toBeLessThan(228);
        expect(detour.pointe.y).toBeGreaterThan(218);
        expect(detour.controle.y).toBeLessThan(228);
        expect(detour.d).not.toBe(directe.d);
        // Sans obstacle sur son chemin, la flèche de la carte de droite reste la plus courte.
        expect(tracerFleche(bulle, droite, ECRAN, [gauche]).d).toBe(tracerFleche(bulle, droite, ECRAN).d);
    });

    it('le tracé reste dans l’écran, même quand le bombement en sortirait', () => {
        const f = tracerFleche(rect(8, 300, 388, 500), rect(8, 40, 60, 80), ECRAN);
        expect(f.controle.x).toBeGreaterThanOrEqual(4);
    });
});

describe('Les cibles des flèches', () => {
    it('des zones qui se touchent reçoivent une seule flèche', () => {
        const g = grouperCibles([rect(100, 100, 200, 150), rect(203, 100, 300, 150), rect(600, 400, 700, 450)], 3);
        expect(g).toHaveLength(2);
        expect(g[0]).toEqual(rect(100, 100, 300, 150));
    });

    it('au-delà de trois zones, une seule flèche vers leur union', () => {
        const quatre = [rect(0, 0, 10, 10), rect(100, 0, 110, 10), rect(200, 0, 210, 10), rect(300, 200, 310, 210)];
        expect(grouperCibles(quatre.slice(0, 3), 3)).toHaveLength(3);
        expect(grouperCibles(quatre, 3)).toEqual([rect(0, 0, 310, 210)]);
    });
});

describe('Le déplacement de la bulle', () => {
    const CADRE = { gauche: 8, haut: 72, droite: 1172, bas: 760 };

    it('une place dans l’écran utile est gardée telle quelle', () => {
        expect(bornerDeplacement(300, 200, 380, 220, CADRE)).toEqual({ x: 300, y: 200 });
    });

    it('la bulle ne sort ni par la gauche, ni sous l’en-tête, ni par la droite, ni sous le bandeau ou le clavier', () => {
        expect(bornerDeplacement(-500, -500, 380, 220, CADRE)).toEqual({ x: 8, y: 72 });
        expect(bornerDeplacement(5000, 5000, 380, 220, CADRE)).toEqual({ x: 1172 - 380, y: 760 - 220 });
    });

    it('une bulle plus haute que l’écran utile se cale en haut', () => {
        expect(bornerDeplacement(300, 400, 380, 900, CADRE)).toEqual({ x: 300, y: 72 });
    });
});

describe('Les coordonnées de la couche des flèches', () => {
    const code = sansCommentaires(moteur);
    const regles = sansCommentaires(css);
    const regle = (regles.match(/\.parcours-fleches\s*\{([^}]*)\}/) || [])[1] || '';

    it('la couche est dimensionnée en px sur innerWidth × innerHeight, à chaque passage de la sonde', () => {
        const sonde = tranche(code, 'function sonder() {', 'function placerSelonEtape', { longueurMin: 400 });
        expect(sonde).toMatch(/svg\.setAttribute\('width', String\(window\.innerWidth\)\)/);
        expect(sonde).toMatch(/svg\.setAttribute\('height', String\(window\.innerHeight\)\)/);
        expect(sonde).toMatch(/svg\.style\.width = window\.innerWidth \+ 'px'/);
        expect(sonde).toMatch(/svg\.style\.height = window\.innerHeight \+ 'px'/);
    });

    it('aucun viewBox ne met la couche à l’échelle', () => {
        expect(code).not.toMatch(/viewBox/i);
        expect(code).not.toMatch(/preserveAspectRatio/);
    });

    it('la feuille de style la fixe en (0, 0), sans largeur, hauteur ni unité de fenêtre', () => {
        expect(regle).toMatch(/position:\s*fixed/);
        expect(regle).toMatch(/left:\s*0\b/);
        expect(regle).toMatch(/top:\s*0\b/);
        expect(regle).not.toMatch(/\b(width|height|inset)\s*:/);
        expect(regle).not.toMatch(/\d(vw|vh|dvh|svh|lvh|%)/);
    });

    it('la couche est muette pour le lecteur d’écran et ne capte aucun toucher', () => {
        expect(code).toMatch(/svg\.setAttribute\('aria-hidden', 'true'\)/);
        expect(regle).toMatch(/pointer-events:\s*none/);
    });
});

describe('Le voile est retiré', () => {
    it('ni le moteur ni la feuille de style ne le posent', () => {
        expect(sansCommentaires(moteur)).not.toMatch(/voile|trouRect|fusionnerTrous/);
        expect(sansCommentaires(css)).not.toMatch(/parcours-voile/);
    });

    it('aucune des neuf définitions ne garde sa propriété `voile`, ni ne cherche le voile dans la page', () => {
        const definitions = readdirSync(path.join(RACINE, 'js')).filter((f) => /^parcours-.+\.js$/.test(f) && f !== 'parcours-moteur.js');
        expect(definitions).toHaveLength(9);
        for (const f of definitions) {
            const src = sansCommentaires(lire('js/' + f));
            expect(src, f).not.toMatch(/\bvoile\s*:/);
            expect(src, f).not.toMatch(/parcours-voile|parcours-masques|poserVoile/);
        }
    });

    it('la pulsation s’arrête sous prefers-reduced-motion : un contour pointillé fixe', () => {
        const reduit = tranche(css, '@media (prefers-reduced-motion: reduce)', 'Parcours 6 : la bulle au-dessus des fenêtres', { longueurMin: 150 });
        const contour = (reduit.match(/\.parcours-contour\s*\{([^}]*)\}/) || [])[1] || '';
        expect(contour).toMatch(/animation:\s*none/);
        expect(contour).toMatch(/border:\s*3px dashed/);
    });

    it('les flèches ont leur propre préfixe, pas celui des flèches didactiques', () => {
        expect(sansCommentaires(moteur)).not.toMatch(/fleche-didactique/);
        expect(sansCommentaires(css)).not.toMatch(/fleche-didactique/);
    });
});

// BREAK-TESTS (10 nov. 2026, chacun joué puis défait ; le compte des rouges est au rapport du lot) :
//   B1 tracerFleche : retirer le retrait (FLECHE_RETRAIT = 0) ................ « s'arrête à quelques px »
//   B2 courbe : retirer le renvoi null sous FLECHE_MIN ........................ « cachée sous la bulle », « collée à la bulle »
//   B3 tracerFleche : viser le centre de la cible hors écran sans le borner ... « sortie de l'écran »
//   B4 tracerFleche : bombement tiré de Math.random() ......................... « déterministe »
//   B5 grouperCibles : rendre la liste sans l'union au-delà du maximum ........ « au-delà de trois zones »
//   B6 bornerDeplacement : rendre { x, y } sans borner ........................ « ne sort ni par la gauche… »
//   B7 sonder : poser un viewBox sur la couche ................................ « aucun viewBox »
//   B9 tracerFleche : ignorer les obstacles .................................. « arrive par un autre bord »
//   B8 css : `.parcours-fleches { height: 100vh }` ............................ « sans largeur, hauteur ni unité »
//   B10 sonder : ne plus poser la hauteur en px ............................... « dimensionnée en px »
//   B11 une définition reprend `voile: 'dense'` ............................... « aucune des neuf définitions »
//   B12 css : la pulsation gardée sous prefers-reduced-motion ................. « un contour pointillé fixe »
