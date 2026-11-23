import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LA BANDE LIBRE DE LA BULLE (23 nov. 2026 ; plans de travail/RAPPORT-2026-11-23-bulle-et-bandeau.md).
//
// Verdict WebKit de la 1.258.0, famille B : la bulle couvrait les champs qu'elle demande de remplir (« Ton trimestre »)
// et « Importer » qu'elle demande de toucher (« Vérifie avant d'importer »). Avant de couvrir quoi que ce soit, elle se
// limite maintenant à la plus haute bande où elle ne couvre rien (`hauteurLibre`), et son texte y défile.
// Cette sentinelle tient la fonction pure ; le geste entier est tenu par tests/integration/bulle-et-bandeau-2026-11-23.
// Break-tests (constatés le 23 nov. 2026) :
//   B1 `hauteurLibre` rend toujours la hauteur du cadre ..................... « au-dessus et au-dessous » ROUGE
//   B2 les places collées aux rectangles retirées (les deux bords du cadre seuls) .. « entre deux colonnes » ROUGE
//   B3 les arrondis du côté libre retirés (`Math.floor`, `Math.ceil`) ...... « au demi-pixel » ROUGE

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fenetre = {};
new Function('window', 'document', readFileSync(path.join(RACINE, 'js/parcours-moteur.js'), 'utf8'))(fenetre, {});
const { hauteurLibre, placerLoin } = fenetre.ParcoursMoteur.geometrie;

const CADRE = { gauche: 8, haut: 8, droite: 1172, bas: 812 };
const rect = (left, top, right, bottom, poids) => ({ left, top, right, bottom, poids });

describe('La plus haute bande où la bulle ne couvre rien', () => {
    it('sans rien à éviter : la hauteur de l’écran utile', () => {
        expect(hauteurLibre([], 380, CADRE)).toBe(804);
    });

    it('au-dessus et au-dessous d’une rangée qui barre l’écran : la plus haute des deux bandes', () => {
        const rangee = rect(8, 300, 1172, 340);
        expect(hauteurLibre([rangee], 380, CADRE)).toBe(472);                    // dessous : 812 − 340
        expect(hauteurLibre([rect(8, 600, 1172, 640)], 380, CADRE)).toBe(592);   // dessus : 600 − 8
    });

    it('à côté d’une colonne : la pleine hauteur, si la bulle tient à sa droite ; sinon la bande sous elle', () => {
        const colonne = rect(8, 100, 700, 700);
        expect(hauteurLibre([colonne], 380, CADRE)).toBe(804);    // 1172 − 700 = 472 ≥ 380
        expect(hauteurLibre([colonne], 520, CADRE)).toBe(112);    // 472 < 520 : sous la colonne, 812 − 700
    });

    it('entre deux colonnes : la pleine hauteur, à une place qui n’est ni le bord gauche ni le bord droit de l’écran', () => {
        const gauche = rect(8, 100, 300, 700), droite = rect(880, 100, 1172, 700);
        expect(hauteurLibre([gauche, droite], 380, CADRE)).toBe(804);   // de 300 à 880 : 580 px pour 380
        expect(hauteurLibre([gauche, droite], 600, CADRE)).toBe(112);   // 580 < 600 : sous les colonnes
    });

    it('le cas mesuré, « Ton trimestre » à 1180 × 820 : une bande de 401 px, où une place ne couvre rien', () => {
        // Les rectangles du 23 nov. 2026 (WebKit), grandis de 12 px (ECART) ; le bouton porte son halo de 5 px.
        const g = (l, t, r, b, p) => rect(l - 12, t - 12, r + 12, b + 12, p);
        const evites = [g(71, 229, 323, 250), g(338, 221, 590, 251), g(71, 372, 324, 406), g(332, 372, 585, 406), g(71, 446, 324, 480),
            g(605, 221, 1110, 251, 10000), g(980, 676, 1115, 711, 10000)];
        const h = hauteurLibre(evites, 520, CADRE);
        expect(h).toBe(401);
        // À cette hauteur, la place trouvée ne couvre rien.
        expect(placerLoin(evites, 520, h, CADRE).aire).toBe(0);
        // Un pixel de plus, et plus aucune place n'est libre.
        expect(placerLoin(evites, 520, h + 1, CADRE).aire).toBeGreaterThan(0);
    });

    it('au demi-pixel : la bande rendue tient en pixels entiers entre deux bords fractionnaires', () => {
        const haut = rect(8, 8, 1172, 263.4, 10000), bas = rect(8, 664.2, 1172, 812, 10000);
        const h = hauteurLibre([haut, bas], 380, CADRE);
        expect(h).toBe(400);   // de 264 à 664, pas 400,8 arrondi à 401
        expect(placerLoin([haut, bas], 380, h, CADRE).aire).toBe(0);
    });

    it('rien de libre : 0', () => {
        expect(hauteurLibre([rect(0, 0, 1180, 820)], 380, CADRE)).toBe(0);
    });
});
