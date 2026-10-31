/**
 * ecart-daltonisme.js — l'écart entre deux couleurs, en vision typique et en simulation rouge-vert.
 *
 * CIEDE2000 (Sharma, Wu, Dalal, 2005) sur D65 ; simulation Machado, Oliveira, Fernandes (2009),
 * sévérité 1,0, appliquée en sRGB linéaire. Une simulation : aucune personne daltonienne n'a regardé.
 */
const MATRICES = {
    protanopie: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopie: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]]
};

const versLineaire = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const borne = (v) => Math.min(1, Math.max(0, v));

/** `#rrggbb`, ou `rgba(…)` posé sur `dessous` : les canaux 0-255 tels qu'ils paraissent. */
export function canauxAffiches(couleur, dessous = [255, 255, 255]) {
    if (Array.isArray(couleur)) return couleur;
    if (couleur.startsWith('#')) return [1, 3, 5].map((d) => parseInt(couleur.slice(d, d + 2), 16));
    const [r, g, b, a = 1] = couleur.match(/[\d.]+/g).map(Number);
    return [r, g, b].map((c, k) => c * a + dessous[k] * (1 - a));
}

function labDeLineaire([r, g, b]) {
    const xyz = [
        (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047,
        0.2126729 * r + 0.7151522 * g + 0.072175 * b,
        (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
    ];
    const [x, y, z] = xyz.map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116));
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

export function ciede2000([L1, a1, b1], [L2, a2, b2]) {
    const rad = Math.PI / 180;
    const C = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
    const G = 0.5 * (1 - Math.sqrt(C ** 7 / (C ** 7 + 25 ** 7)));
    const [ap1, ap2] = [a1 * (1 + G), a2 * (1 + G)];
    const [Cp1, Cp2] = [Math.hypot(ap1, b1), Math.hypot(ap2, b2)];
    const angle = (b, a) => (b === 0 && a === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360);
    const [hp1, hp2] = [angle(b1, ap1), angle(b2, ap2)];
    let dh = 0;
    if (Cp1 * Cp2 !== 0) {
        dh = hp2 - hp1;
        if (dh > 180) dh -= 360;
        else if (dh < -180) dh += 360;
    }
    const dL = L2 - L1;
    const dC = Cp2 - Cp1;
    const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh / 2) * rad);
    const Lm = (L1 + L2) / 2;
    const Cm = (Cp1 + Cp2) / 2;
    let hm = hp1 + hp2;
    if (Cp1 * Cp2 !== 0) {
        if (Math.abs(hp1 - hp2) <= 180) hm = (hp1 + hp2) / 2;
        else hm = hp1 + hp2 < 360 ? (hp1 + hp2 + 360) / 2 : (hp1 + hp2 - 360) / 2;
    }
    const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad)
        + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
    const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
    const Sc = 1 + 0.045 * Cm;
    const Sh = 1 + 0.015 * Cm * T;
    const Rt = -2 * Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
    return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
}

function labVu(canaux, matrice) {
    const lineaire = canaux.map(versLineaire);
    const vu = matrice ? matrice.map((ligne) => borne(ligne.reduce((s, m, k) => s + m * lineaire[k], 0))) : lineaire;
    return labDeLineaire(vu);
}

/** L'écart entre deux couleurs affichées : { typique, protanopie, deuteranopie }. */
export function ecarts(a, b, dessous) {
    const [ca, cb] = [canauxAffiches(a, dessous), canauxAffiches(b, dessous)];
    return {
        typique: ciede2000(labVu(ca), labVu(cb)),
        protanopie: ciede2000(labVu(ca, MATRICES.protanopie), labVu(cb, MATRICES.protanopie)),
        deuteranopie: ciede2000(labVu(ca, MATRICES.deuteranopie), labVu(cb, MATRICES.deuteranopie))
    };
}
