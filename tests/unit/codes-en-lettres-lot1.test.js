/**
 * DES CODES D'ANNOTATION EN LETTRES, LISIBLES PARTOUT — lot 1 (24 nov. 2026). Les fonctions pures.
 * Rapport : `plans de travail/RAPPORT-2026-11-24-codes-en-lettres-lot-1.md`. Le banc navigateur :
 * `tests/integration/codes-en-lettres-lisibles.spec.js`.
 *
 *   A  `tailleCodeDansCercle` (annotation-formes.js) : la taille d'hier tant que le code tient, réduite en
 *      proportion sinon — quelle que soit sa longueur, sans plancher ;
 *   B  `ecrireCodeDansCercle` : écrit à la taille d'hier ce qui tenait (le même état de contexte qu'hier,
 *      dans le même ordre), et plus petit ce qui débordait ;
 *   C  `raisonsSansCode` (codes-annotation.js) : la VRAIE raison de chaque sous-critère qui ne se pose pas ;
 *      la liste des codes reste celle d'hier (la casse ne fusionne rien dans une grille enregistrée) ;
 *   D  `refusCodeSaisi` : la saisie refuse un code illisible, et un code qui ne diffère d'un autre que par la casse.
 *
 * ⛔ Jeu de codes FICTIF (consigne du 24 nov.) : K-A, K-B, K-C, M-A, M-B, M-C, T-A, T-B, T-C, V-A, V-B, QRS,
 * W-A, W-B — et leurs variantes de casse ou d'accent, que l'essai exige.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const { annotationFormes: F } = chargerScript('js/annotation-formes.js', {});

function chargerCodes() {
    const fenetre = {};
    chargerScript('js/evaluation-enonces.js', {}, fenetre);
    chargerScript('js/codes-annotation.js', { db: { getSync: (k, d) => d }, cle: (k) => 'a2026_' + k }, fenetre);
    return fenetre.codesAnnotation;
}
const C = chargerCodes();

const CODES = ['K-A', 'K-B', 'K-C', 'M-A', 'M-B', 'M-C', 'T-A', 'T-B', 'T-C', 'V-A', 'V-B', 'QRS', 'W-A', 'W-B'];
const sc = (code, ponderation = 1) => ({ code, nom: 'Code fictif', ponderation });
const critere = (scs) => ({ id: 'CR', type: 'algorithmique', codesSousCriteresSeulement: true, sousCriteres: scs });

/* ============================================================ A — LA TAILLE */
describe('A · tailleCodeDansCercle', () => {
    it('un code qui tient garde EXACTEMENT la taille d’hier', () => {
        // Un chiffre : une demi-boîte d'encre bien en deçà de 0,9 × le rayon.
        expect(F.tailleCodeDansCercle(25, 30, 8, 11)).toBe(30);
        // Juste à la marge : encore la taille d'hier.
        expect(F.tailleCodeDansCercle(25, 30, 0, 25 * F.MARGE_CODE)).toBe(30);
    });

    it('un code qui déborde est réduit jusqu’à ce que le coin de son encre tienne dans la marge', () => {
        const rayon = 25, base = 30, dl = 27, dh = 11;
        const t = F.tailleCodeDansCercle(rayon, base, dl, dh);
        expect(t).toBeLessThan(base);
        // L'encre croît en proportion de la taille : à la taille rendue, le coin est sur la marge.
        const k = t / base;
        expect(Math.hypot(dl * k, dh * k)).toBeCloseTo(rayon * F.MARGE_CODE, 6);
    });

    it('au-delà de trois caractères : plus petit encore, sans plancher — le code entier reste dans le disque', () => {
        // Une demi-largeur qui croît avec le nombre de caractères (la chasse d'une capitale grasse : 22 px à 30 px).
        const tailles = [3, 4, 6, 10, 20].map((n) => F.tailleCodeDansCercle(25, 30, 11 * n, 11));
        expect(tailles[0], 'trois caractères débordaient à la taille d’hier').toBeLessThan(30);
        for (let i = 1; i < tailles.length; i++) expect(tailles[i]).toBeLessThan(tailles[i - 1]);
        [3, 4, 6, 10, 20].forEach((n, i) => {
            const k = tailles[i] / 30;
            expect(Math.hypot(11 * n * k, 11 * k)).toBeLessThanOrEqual(25 * F.MARGE_CODE + 1e-9);
        });
    });
});

/* ============================================================ B — L'ÉCRITURE */
/** Un faux contexte : la chasse d'un caractère vaut 0,6 × la taille ; l'encre, 0,36 × la taille de part et d'autre du milieu. */
function fauxContexte() {
    const journal = [];
    const ctx = {
        _font: '', textAlign: 'start', textBaseline: 'alphabetic',
        set font(v) { this._font = v; journal.push(['font', v]); },
        get font() { return this._font; },
        measureText(t) {
            const taille = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this._font)[1]);
            const demi = (String(t).length * 0.6 * taille) / 2;
            return { width: demi * 2, actualBoundingBoxLeft: demi, actualBoundingBoxRight: demi,
                actualBoundingBoxAscent: 0.36 * taille, actualBoundingBoxDescent: 0.36 * taille };
        },
        fillText(t, x, y) { journal.push(['fillText', t, x, y, this._font, this.textAlign, this.textBaseline]); }
    };
    return { ctx, journal };
}

describe('B · ecrireCodeDansCercle', () => {
    it('un chiffre s’écrit comme hier : une seule police, la taille d’hier, centré au milieu', () => {
        const { ctx, journal } = fauxContexte();
        F.ecrireCodeDansCercle(ctx, '7', 100, 50, 25, 30);
        expect(journal).toEqual([
            ['font', 'bold 30px sans-serif'],
            ['fillText', '7', 100, 50, 'bold 30px sans-serif', 'center', 'middle']
        ]);
    });

    it('« QRS » débordait à la taille d’hier : il s’écrit plus petit, et son encre tient', () => {
        const { ctx, journal } = fauxContexte();
        const t = F.ecrireCodeDansCercle(ctx, 'QRS', 100, 50, 25, 30);
        expect(t).toBeLessThan(30);
        const ecrit = journal.find((e) => e[0] === 'fillText');
        expect(ecrit[4]).toBe('bold ' + t + 'px sans-serif');
        expect(Math.hypot(0.9 * t, 0.36 * t)).toBeLessThanOrEqual(25 * F.MARGE_CODE + 1e-9);
    });

    it('sans mesure d’encre (moteur ancien) : la chasse et une hauteur de capitale suffisent', () => {
        const { ctx } = fauxContexte();
        const mesurer = ctx.measureText.bind(ctx);
        ctx.measureText = (t) => ({ width: mesurer(t).width });
        expect(F.ecrireCodeDansCercle(ctx, 'K-A', 100, 50, 25, 30)).toBeLessThan(30);
        expect(F.ecrireCodeDansCercle(ctx, '7', 100, 50, 25, 30)).toBe(30);
    });
});

/* ============================================================ C — LES RAISONS */
describe('C · raisonsSansCode', () => {
    it('les quatorze codes fictifs se posent tous', () => {
        const cr = critere(CODES.map((c) => sc(c)));
        expect(C.raisonsSansCode(cr)).toEqual(CODES.map(() => null));
        expect(C.listeCodes({ criteres: [cr] }).map((x) => x.code)).toEqual(CODES);
    });

    it('chaque écart a SA raison — un code accentué n’est plus « pondération 0 »', () => {
        const cr = critere([sc('K-A'), sc('K-B', 0), sc(''), sc('É-B'), sc('K-A'), sc('QRS')]);
        expect(C.raisonsSansCode(cr)).toEqual([null, 'poids', 'vide', 'caracteres', 'double', null]);
    });

    it('la casse ne fusionne rien dans une grille enregistrée : « K-A » et « k-a » restent deux codes, comme hier', () => {
        const cr = critere([sc('K-A'), sc('k-a')]);
        expect(C.raisonsSansCode(cr)).toEqual([null, null]);
        expect(C.listeCodes({ criteres: [cr] }).map((x) => x.id)).toEqual(['errfr_K-A', 'errfr_k-a']);
    });

    it('un code qui porte le nom d’une propriété d’objet n’est pas un doublon', () => {
        expect(C.raisonsSansCode(critere([sc('constructor'), sc('toString')]))).toEqual([null, null]);
    });
});

/* ============================================================ D — LA SAISIE */
describe('D · refusCodeSaisi', () => {
    const scs = CODES.slice(0, 13).map((c) => sc(c));   // « W-B » reste libre

    it('un code neuf et distinct est accepté ; un code vide aussi, comme hier', () => {
        expect(C.refusCodeSaisi(scs, 2, 'W-B')).toBeNull();
        expect(C.refusCodeSaisi(scs, 2, '')).toBeNull();
        expect(C.refusCodeSaisi(scs, 2, '   ')).toBeNull();
    });

    it('« k-a » ne diffère de « K-A » que par la casse : refusé, en nommant l’autre', () => {
        expect(C.refusCodeSaisi(scs, 1, 'k-a')).toEqual({ raison: 'double', autre: 'K-A' });
        expect(C.refusCodeSaisi(scs, 1, ' K-A ')).toEqual({ raison: 'double', autre: 'K-A' });
    });

    it('le même rang qui ne change que de casse n’est pas un doublon', () => {
        expect(C.refusCodeSaisi(scs, 0, 'k-a')).toBeNull();
    });

    it('un code accentué, ou trop long, ne se poserait pas : refusé', () => {
        expect(C.refusCodeSaisi(scs, 1, 'É-A')).toEqual({ raison: 'caracteres' });
        expect(C.refusCodeSaisi(scs, 1, 'K A')).toEqual({ raison: 'caracteres' });
        expect(C.refusCodeSaisi(scs, 1, 'QRS'.repeat(7))).toEqual({ raison: 'caracteres' });
    });
});
