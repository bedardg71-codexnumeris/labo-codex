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
//   3. les coordonnées : la couche des flèches est dimensionnée en px sur la largeur de la mise en page × innerHeight
//      (innerWidth × innerHeight jusqu'au 12 nov. 2026), sans viewBox ni unité
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
const { tracerFleche, grouperCibles, bornerDeplacement, placerLoin } = fenetre.ParcoursMoteur.geometrie;

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

    it('la bulle posée sur une grande cible (captures 28 et 29, 11 nov. 2026) : la flèche entre dans la partie qu’elle laisse voir', () => {
        // Les bandes de « Ta classe d'un coup d'œil » sous la bulle : la plus grande bande libre est au-dessus d'elle.
        const cible = rect(50, 100, 1000, 400);
        const f = tracerFleche(BULLE, cible, ECRAN);
        expect(f).not.toBeNull();
        expect(dans(f.pointe, cible)).toBe(true);
        expect(dans(f.pointe, BULLE)).toBe(false);
        expect(f.pointe).toEqual({ x: 525, y: 200 });   // le milieu de la bande libre, au-dessus de la bulle
        expect(f.depart).toEqual({ x: 525, y: 300 });   // le bord de la bulle le plus proche
    });

    it('une cible collée à la bulle : jamais de flèche illisible (moins de 24 px) ; un autre bord si la place y est', () => {
        const longueur = (f) => Math.hypot(f.pointe.x - f.depart.x, f.pointe.y - f.depart.y);
        // Plus large que la bulle, 12 px dessous : aucun bord assez loin sans traverser la cible, pas de flèche.
        expect(tracerFleche(BULLE, rect(300, 532, 900, 600), ECRAN)).toBeNull();
        // De la largeur de la bulle, 12 px dessous : le plus court (6 px) ne se lit pas, la flèche passe par le côté.
        const cote = tracerFleche(BULLE, rect(400, 532, 780, 600), ECRAN);
        expect(cote).not.toBeNull();
        expect(longueur(cote)).toBeGreaterThanOrEqual(24);
        expect(cote.pointe.x).toBeLessThan(400);                   // à gauche de la cible, pas sur elle
        // Le cas de l'iPad à 1180 px (étape 3 de « Découvrir », 11 nov.) : la bulle à 12 px de la carte de droite,
        // faute de place à 32 px. Les deux cartes reçoivent leur flèche.
        const bulle = rect(776, 252, 1156, 544);
        const gauche = rect(50, 252, 397, 820), droite = rect(417, 252, 764, 820);
        const versDroite = tracerFleche(bulle, droite, ECRAN, [gauche]);
        expect(versDroite).not.toBeNull();
        expect(longueur(versDroite)).toBeGreaterThanOrEqual(24);
        expect(tracerFleche(bulle, gauche, ECRAN, [droite])).not.toBeNull();
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
        // La bulle et la cible collées au haut de l'écran : le bombement (20 px vers le haut) sortirait par le haut.
        const f = tracerFleche(rect(400, 0, 780, 200), rect(900, 0, 1000, 20), ECRAN);
        expect(f.depart.y).toBe(10);
        expect(f.controle.y).toBe(4);
        // Une cible de 10 px, atteinte par un autre bord : la pointe reste à son bord, pas à côté.
        // (La bulle au-dessus, un obstacle étroit entre les deux : le plus court le traverse.)
        const petite = rect(300, 500, 310, 510);
        const p = tracerFleche(rect(200, 100, 580, 300), petite, ECRAN, [rect(240, 320, 320, 380)]);
        expect(p.d).not.toBe(tracerFleche(rect(200, 100, 580, 300), petite, ECRAN).d);
        const ecart = Math.hypot(Math.max(petite.left - p.pointe.x, 0, p.pointe.x - petite.right), Math.max(petite.top - p.pointe.y, 0, p.pointe.y - petite.bottom));
        expect(ecart).toBeLessThanOrEqual(6.5);
    });
});

describe('Les cibles des flèches', () => {
    it('des zones qui se touchent reçoivent une seule flèche', () => {
        const g = grouperCibles([rect(100, 100, 200, 150), rect(203, 100, 300, 150), rect(600, 400, 700, 450)], 3);
        expect(g).toHaveLength(2);
        expect(g[0]).toEqual(rect(100, 100, 300, 150));
    });

    it('à 20 px tout juste, deux cibles gardent chacune sa flèche ; à 19 px, elles se fondent (11 nov. 2026, « Ta classe », 4)', () => {
        expect(grouperCibles([rect(56, 787, 400, 849), rect(420, 787, 764, 822)], 3)).toHaveLength(2);
        expect(grouperCibles([rect(56, 787, 400, 849), rect(419, 787, 764, 822)], 3)).toHaveLength(1);
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

describe('La place de la bulle : loin de ce dont elle parle, sans le couvrir (Grégoire, 11 nov. 2026)', () => {
    // L'ORACLE, indépendant du moteur : toutes les places de l'écran utile, au pas de 4 px, et le plus petit
    // recouvrement qu'on peut y atteindre. Le moteur doit faire au moins aussi bien : aucun recouvrement quand une place
    // libre existe ; sinon, pas plus que le plus petit (à la tolérance du pas près, qui ne joue qu'en faveur de l'oracle).
    const aire = (p, rs) => rs.reduce((t, r) => {
        const l = Math.min(p.right, r.right) - Math.max(p.left, r.left), h = Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top);
        return t + (l > 0 && h > 0 ? l * h : 0);
    }, 0);
    const oracle = (rs, bw, bh, c) => {
        let min = Infinity;
        for (let x = c.gauche; x <= c.droite - bw; x += 4) {
            for (let y = c.haut; y <= Math.max(c.haut, c.bas - bh); y += 4) {
                min = Math.min(min, aire({ left: x, top: y, right: x + bw, bottom: y + bh }, rs));
            }
        }
        return min;
    };
    // Un générateur déterministe (les mêmes cas à chaque course).
    const hasard = (graine) => () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    const ECRANS = {
        'l’iPad en paysage, 1180 × 820': { gauche: 8, haut: 72, droite: 1172, bas: 812 },
        'l’iPad en portrait, 820 × 1180': { gauche: 8, haut: 72, droite: 812, bas: 1172 }
    };

    for (const [nom, cadre] of Object.entries(ECRANS)) {
        it(`${nom} : 300 dispositions au hasard, jamais plus couverte que le moindre recouvrement possible`, () => {
            const h = hasard(nom.length * 7919);
            let libres = 0, contraintes = 0;
            for (let k = 0; k < 300; k++) {
                const W = cadre.droite - cadre.gauche, H = cadre.bas - cadre.haut;
                const n = 1 + Math.floor(h() * 4);
                const zones = Array.from({ length: n }, () => {
                    const w = 40 + h() * W * 0.5, hh = 24 + h() * H * 0.35;
                    const x = cadre.gauche + h() * (W - w), y = cadre.haut + h() * (H - hh);
                    return rect(Math.round(x), Math.round(y), Math.round(x + w), Math.round(y + hh));
                });
                const bw = 380, bh = 160 + Math.round(h() * 340);
                const p = placerLoin(zones, bw, bh, cadre);
                const place = { left: p.x, top: p.y, right: p.x + bw, bottom: p.y + bh };
                // Dans l'écran utile.
                expect(place.left).toBeGreaterThanOrEqual(cadre.gauche);
                expect(place.right).toBeLessThanOrEqual(cadre.droite);
                expect(place.top).toBeGreaterThanOrEqual(cadre.haut);
                const min = oracle(zones, bw, bh, cadre);
                const couvert = aire(place, zones);
                if (min === 0) { libres++; expect(couvert, `cas ${k} : une place libre existe`).toBe(0); }
                else { contraintes++; expect(couvert, `cas ${k} : le moindre recouvrement`).toBeLessThanOrEqual(min + 1); }
            }
            // Le banc a bien vu les deux familles de cas.
            expect(libres).toBeGreaterThan(50);
            expect(contraintes).toBeGreaterThan(5);
        });
    }

    it('au bord le plus éloigné : la zone à gauche, la bulle va à droite ; la zone en haut à droite, la bulle en bas à gauche', () => {
        const c = ECRANS['l’iPad en paysage, 1180 × 820'];
        const p1 = placerLoin([rect(70, 300, 470, 420)], 380, 300, c);
        expect(p1.x).toBe(c.droite - 380);
        const p2 = placerLoin([rect(800, 80, 1150, 200)], 380, 300, c);
        expect(p2).toMatchObject({ x: c.gauche, y: c.bas - 300 });
    });

    it('les cas de l’iPad du 11 nov. : une carte au milieu de l’écran n’est jamais sous la bulle', () => {
        // « Découvrir » 7 (les onglets de Conception et la carte 2) ; 8 (la barre d'étapes du cadre) ; « Mettre ta classe
        // en place » 1 (les champs de dates).
        const c = ECRANS['l’iPad en paysage, 1180 × 820'];
        for (const zones of [[rect(380, 90, 900, 130), rect(110, 380, 384, 405)], [rect(125, 295, 1053, 325)], [rect(70, 294, 584, 426)]]) {
            const p = placerLoin(zones, 380, 360, c);
            expect(aire({ left: p.x, top: p.y, right: p.x + 380, bottom: p.y + 360 }, zones)).toBe(0);
        }
    });

    it('est déterministe : les mêmes rectangles rendent la même place', () => {
        const c = ECRANS['l’iPad en portrait, 820 × 1180'];
        const z = [rect(100, 200, 700, 600), rect(50, 700, 760, 1100)];
        expect(placerLoin(z, 380, 400, c)).toEqual(placerLoin(z, 380, 400, c));
    });
});

describe('Les coordonnées de la couche des flèches', () => {
    const code = sansCommentaires(moteur);
    const regles = sansCommentaires(css);
    const regle = (regles.match(/\.parcours-fleches\s*\{([^}]*)\}/) || [])[1] || '';

    // 12 nov. 2026 : la largeur se lit sur la mise en page (`largeurPage`), pas sur innerWidth, qui suit la partie
    // visible sous Safari iPad (la bulle restait dans les deux tiers gauches de l'écran en paysage).
    it('la couche est dimensionnée en px sur la largeur de la mise en page × innerHeight, à chaque passage de la sonde', () => {
        const sonde = tranche(code, 'function sonder() {', 'function placerSelonEtape', { longueurMin: 400 });
        expect(sonde).toMatch(/svg\.setAttribute\('width', String\(largeurPage\(\)\)\)/);
        expect(sonde).toMatch(/svg\.setAttribute\('height', String\(window\.innerHeight\)\)/);
        expect(sonde).toMatch(/svg\.style\.width = largeurPage\(\) \+ 'px'/);
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
//   B13 courbe : ne plus borner le point de contrôle à l'écran ................ « le tracé reste dans l'écran »
//   B14 tracerFleche : 16 px des coins même sur une cible de 10 px ............. « le tracé reste dans l'écran » (la petite cible)
//   B8 css : `.parcours-fleches { height: 100vh }` ............................ « sans largeur, hauteur ni unité »
//   B10 sonder : ne plus poser la hauteur en px ............................... « dimensionnée en px »
//   B11 une définition reprend `voile: 'dense'` ............................... « aucune des neuf définitions »
//   B12 css : la pulsation gardée sous prefers-reduced-motion ................. « un contour pointillé fixe »
