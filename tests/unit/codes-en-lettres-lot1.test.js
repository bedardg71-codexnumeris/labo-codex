/**
 * DES CODES D'ANNOTATION EN LETTRES, LISIBLES PARTOUT — lot 1 (24 nov. 2026) et sa suite de 17 h 55. Les fonctions pures.
 * Rapport : `plans de travail/RAPPORT-2026-11-24-codes-en-lettres-lot-1.md`. Le banc navigateur :
 * `tests/integration/codes-en-lettres-lisibles.spec.js`.
 *
 *   A  `geometriePastille` (annotation-formes.js) : la pastille d'un code de trois caractères et plus — le texte à la
 *      taille d'un chiffre, la largeur selon le texte, plafonnée à quatre caractères larges (au-delà, le texte rapetisse) ;
 *   B  `geometrieCode` et `dessinerCode` : un ou deux caractères, le cercle d'hier (la même suite de gestes sur le
 *      contexte, dans le même ordre) ; trois et plus, la pastille, centrée ;
 *   C  `raisonsSansCode` (codes-annotation.js) : la VRAIE raison de chaque sous-critère qui ne se pose pas ;
 *      la liste des codes reste celle d'hier (la casse ne fusionne rien dans une grille enregistrée) ;
 *   D  `refusCodeSaisi` : la saisie refuse un code illisible, un code de cinq caractères ou plus, et un code qui ne
 *      diffère d'un autre que par la casse ; un code ancien, laissé tel quel sur sa ligne, n'est pas refusé ;
 *   E  la liste collée (`codesCompris`) : quatre caractères au plus, la même borne que la saisie.
 *
 * ↻ RÉANCRÉ LE 24 NOV. À 18 H (décision de Grégoire, 17 h 45) : A et B jugeaient `tailleCodeDansCercle` et
 *   `ecrireCodeDansCercle`, la règle où le texte rapetissait dans un cercle fixe ; retirées, remplacées par la pastille.
 *
 * ⛔ Jeu de codes FICTIF (consignes du 24 nov.) : K-A, K-B, K-C, M-A, M-B, M-C, T-A, T-B, T-C, V-A, V-B, QRS,
 * W-A, W-B, K-AB, QRST, W-12 ; ABCDE pour le refus, ABCDEF pour le stock — et les variantes de casse ou d'accent
 * que l'essai exige.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
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

/* ============================================================ A — LA PASTILLE */
describe('A · geometriePastille', () => {
    // Un rayon de 25 ; à la taille d'un chiffre (30 px), une capitale grasse fait 11 px de demi-hauteur. « M » : 13 px
    // de demi-chasse, d'où un PLAFOND « MMMM » de 52 px de demi-encre.
    const R = 25, H = 11, PLAFOND = 52;
    const enBout = Math.sqrt((R * F.MARGE_CODE) ** 2 - H ** 2);

    it('le texte garde la taille d’un chiffre ; le coin de son encre tient dans le bout arrondi', () => {
        for (const demi of [27, 35, 44]) {   // trois et quatre caractères
            const g = F.geometriePastille(R, demi, H, PLAFOND);
            expect(g.echelle).toBe(1);
            expect(g.demiLargeur).toBeCloseTo(g.demiDroite + R, 9);
            // Le coin de l'encre est sur la marge du bout : ni dehors, ni flottant.
            expect(Math.hypot(demi - g.demiDroite, H)).toBeCloseTo(R * F.MARGE_CODE, 6);
        }
    });

    it('plus le texte est long, plus la pastille est large', () => {
        const larg = [27, 35, 44].map((d) => F.geometriePastille(R, d, H, PLAFOND).demiLargeur);
        expect(larg[0]).toBeLessThan(larg[1]);
        expect(larg[1]).toBeLessThan(larg[2]);
    });

    it('un texte court tient dans les bouts : pas de segment droit, la largeur du cercle', () => {
        const g = F.geometriePastille(R, 10, H, PLAFOND);
        expect(g.demiDroite).toBe(0);
        expect(g.demiLargeur).toBe(R);
    });

    it('au-delà du plafond (le stock) : la pastille s’arrête, le texte rapetisse pour tenir', () => {
        const auPlafond = F.geometriePastille(R, PLAFOND, H, PLAFOND);
        for (const demi of [60, 80, 120]) {
            const g = F.geometriePastille(R, demi, H, PLAFOND);
            expect(g.demiLargeur).toBeCloseTo(auPlafond.demiLargeur, 9);
            expect(g.echelle).toBeLessThan(1);
            // À la taille réduite, le coin de l'encre reste dans le bout.
            expect(Math.hypot(demi * g.echelle - g.demiDroite, H * g.echelle)).toBeLessThanOrEqual(R * F.MARGE_CODE + 1e-9);
        }
        expect(enBout).toBeGreaterThan(0);
    });
});

/* ============================================================ B — LE DESSIN */
/** Un faux contexte : la chasse d'un caractère vaut 0,6 × la taille ; l'encre, 0,36 × la taille de part et d'autre du milieu. */
function fauxContexte() {
    const journal = [];
    const ctx = {
        _font: '', textAlign: 'start', textBaseline: 'alphabetic', fillStyle: '#000000',
        set font(v) { this._font = v; journal.push(['font', v]); },
        get font() { return this._font; },
        save() { journal.push(['save']); }, restore() { journal.push(['restore']); },
        measureText(t) {
            const taille = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this._font)[1]);
            const demi = (String(t).length * 0.6 * taille) / 2;
            return { width: demi * 2, actualBoundingBoxLeft: demi, actualBoundingBoxRight: demi,
                actualBoundingBoxAscent: 0.36 * taille, actualBoundingBoxDescent: 0.36 * taille };
        },
        beginPath() { journal.push(['beginPath']); },
        arc(x, y, r, a, b) { journal.push(['arc', x, y, r, +a.toFixed(4), +b.toFixed(4)]); },
        moveTo(x, y) { journal.push(['moveTo', +x.toFixed(3), y]); },
        lineTo(x, y) { journal.push(['lineTo', +x.toFixed(3), y]); },
        closePath() { journal.push(['closePath']); },
        fill() { journal.push(['fill', this.fillStyle]); },
        fillText(t, x, y) { journal.push(['fillText', t, x, y, this._font, this.textAlign, this.textBaseline, this.fillStyle]); }
    };
    return { ctx, journal };
}

describe('B · geometrieCode et dessinerCode', () => {
    it('un ou deux caractères : la suite de gestes d’hier, à l’identique (le cercle, puis le texte à 1,2 × le rayon)', () => {
        for (const code of ['7', '10']) {
            const { ctx, journal } = fauxContexte();
            F.dessinerCode(ctx, code, 100, 50, 25, 30, '#c62828');
            expect(journal).toEqual([
                ['beginPath'], ['arc', 100, 50, 25, 0, +(Math.PI * 2).toFixed(4)], ['fill', '#c62828'],
                ['font', 'bold 30px sans-serif'],
                ['fillText', code, 100, 50, 'bold 30px sans-serif', 'center', 'middle', '#ffffff']
            ]);
        }
    });

    it('le curseur : le pixel de plus, hier, sur le texte seulement', () => {
        const { ctx, journal } = fauxContexte();
        F.dessinerCode(ctx, '7', 16, 16, 15, 18, '#c62828', 1);
        expect(journal.find((e) => e[0] === 'arc')).toEqual(['arc', 16, 16, 15, 0, +(Math.PI * 2).toFixed(4)]);
        expect(journal.find((e) => e[0] === 'fillText').slice(1, 4)).toEqual(['7', 16, 17]);
    });

    it('trois et quatre caractères : une pastille centrée, le texte à la taille d’un chiffre', () => {
        for (const code of ['K-A', 'QRST']) {
            const { ctx, journal } = fauxContexte();
            const g = F.dessinerCode(ctx, code, 100, 50, 25, 30, '#c62828');
            expect(g.forme).toBe('pastille');
            expect(g.taille).toBe(30);
            expect(g.demiLargeur).toBeGreaterThan(25);
            // Le contour : deux bouts de rayon 25, centrés à ± demiDroite du point.
            const arcs = journal.filter((e) => e[0] === 'arc');
            expect(arcs.map((a) => [a[1], a[2], a[3]])).toEqual([[+(100 + g.demiDroite).toFixed(9), 50, 25], [+(100 - g.demiDroite).toFixed(9), 50, 25]].map((a) => [expect.closeTo(a[0], 6), a[1], a[2]]));
            expect(journal.find((e) => e[0] === 'fillText').slice(1, 5)).toEqual([code, 100, 50, 'bold 30px sans-serif']);
        }
    });

    it('plus de quatre caractères (le stock) : la pastille de quatre caractères larges, le texte plus petit', () => {
        const { ctx } = fauxContexte();
        const plafond = F.geometrieCode(ctx, F.PLAFOND, 25, 30);
        const g = F.geometrieCode(ctx, 'ABCDEF', 25, 30);
        expect(g.demiLargeur).toBeCloseTo(plafond.demiLargeur, 9);
        expect(g.taille).toBeLessThan(30);
        expect(F.geometrieCode(ctx, 'QRST', 25, 30).demiLargeur).toBeLessThanOrEqual(plafond.demiLargeur);
    });

    it('sans mesure d’encre (moteur ancien) : la chasse et une hauteur de capitale suffisent', () => {
        const { ctx } = fauxContexte();
        const mesurer = ctx.measureText.bind(ctx);
        ctx.measureText = (t) => ({ width: mesurer(t).width });
        const g = F.geometrieCode(ctx, 'K-A', 25, 30);
        expect(g.forme).toBe('pastille');
        expect(g.taille).toBe(30);
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

    it('un code accentué, ou avec une espace : refusé', () => {
        expect(C.refusCodeSaisi(scs, 1, 'É-A')).toEqual({ raison: 'caracteres' });
        expect(C.refusCodeSaisi(scs, 1, 'K A')).toEqual({ raison: 'caracteres' });
    });

    it('quatre caractères au plus : « QRST » s’écrit, « ABCDE » est refusé (↻ 24 nov., 18 h : la borne était vingt)', () => {
        expect(C.MAX_SAISIE).toBe(4);
        expect(C.refusCodeSaisi(scs, 1, 'QRST')).toBeNull();
        expect(C.refusCodeSaisi(scs, 1, 'ABCDE')).toEqual({ raison: 'long' });
        expect(C.refusCodeSaisi(scs, 1, 'QRS'.repeat(7))).toEqual({ raison: 'long' });
    });

    it('un code ancien plus long, laissé tel quel sur sa ligne, n’est pas refusé ; il reste posable', () => {
        const avecStock = scs.concat([sc('ABCDEF')]);
        expect(C.refusCodeSaisi(avecStock, 13, 'ABCDEF')).toBeNull();
        expect(C.raisonsSansCode(critere(avecStock))[13]).toBeNull();
        expect(C.listeCodes({ criteres: [critere(avecStock)] }).map((x) => x.code)).toContain('ABCDEF');
    });
});

/* ============================================================ E — LA LISTE COLLÉE */
describe('E · la liste collée suit la même borne que la saisie', () => {
    let D;
    beforeAll(() => {
        const dom = new JSDOM('<!doctype html><html><body></body></html>').window;
        const w = chargerScript('js/materiel-lecture.js', { DOMParser: dom.DOMParser });
        chargerScript('js/materiel-assistant.js', {}, w);
        chargerScript('js/materiel-dissection-lecture.js', { DOMParser: dom.DOMParser }, w);
        D = w.materielDissectionLecture;
    });
    // Le chemin du banc de la liste collée (critere-algorithmique-coller-codes.test.js, `compriseTexte`) : un texte brut,
    // un morceau par ligne, chacun étiqueté.
    const coller = (lignes) => {
        const doc = D.docDepuisPressePapiers({ texte: lignes.map((x) => x[0]).join('\n') });
        const ordre = D.morceaux(doc).ordre;
        const liens = {};
        ordre.forEach((id, i) => { if (lignes[i]) liens[id] = lignes[i][1]; });
        return D.codesCompris(D.comprendre(doc, liens));
    };

    it('`MAX_CARACTERES_CODE` de la dissection vaut `MAX_SAISIE`', () => {
        expect(D.MAX_CARACTERES_CODE).toBe(C.MAX_SAISIE);
    });

    it('« QRST » passe ; « ABCDE » est refusé, et la raison le nomme', () => {
        const quatre = coller([['QRST', 'code'], ['Code fictif 16', 'nomcode']]);
        expect(quatre.raisons).toEqual([]);
        expect(quatre.codes.map((k) => k.code)).toEqual(['QRST']);
        const cinq = coller([['QRST', 'code'], ['Code fictif 16', 'nomcode'], ['ABCDE', 'code'], ['Code fictif refusé', 'nomcode']]);
        expect(cinq.raisons).toEqual(['des codes de 4 caractères au plus (« ABCDE »)']);
    });
});
