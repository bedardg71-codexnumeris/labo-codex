import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// CT-29 (audit Cadre du trimestre, 20 août 2026) — `echapperHtml` (config.js,
// zone protégée) échappe par textContent → innerHTML. Cette voie n'encode PAS
// les guillemets : correcte en contexte de TEXTE, insuffisante en contexte
// d'ATTRIBUT, où un `"` permet de sortir de l'attribut et d'en ouvrir un autre.
//
// `echapperAttribut` (js/securite-echappement.js) est la variante à utiliser
// quand la valeur atterrit entre guillemets. Ces cas gardent la différence :
// si quelqu'un réécrit echapperAttribut par-dessus echapperHtml, le premier
// bloc rougit.

const win = chargerScript('js/securite-echappement.js');
const { echapperAttribut } = win;

describe('CT-29 · echapperAttribut · sortie d\'attribut impossible', () => {
    it('LE CAS DE L\'AUDIT : un guillemet ne peut plus fermer l\'attribut', () => {
        const charge = '" onerror="alert(1)';
        const sortie = echapperAttribut(charge);

        expect(sortie).not.toContain('"');
        expect(sortie).toBe('&quot; onerror=&quot;alert(1)');
    });

    it('l\'apostrophe est encodée aussi (attributs en guillemets simples)', () => {
        expect(echapperAttribut("' onload='x")).toBe('&#39; onload=&#39;x');
    });

    it('les chevrons et l\'esperluette restent couverts', () => {
        expect(echapperAttribut('<script>')).toBe('&lt;script&gt;');
        expect(echapperAttribut('a & b')).toBe('a &amp; b');
    });

    it('l\'esperluette est traitée EN PREMIER (pas de double encodage)', () => {
        // Si `&` passait après `<`, on obtiendrait `&amp;lt;`.
        expect(echapperAttribut('<')).toBe('&lt;');
        expect(echapperAttribut('&quot;')).toBe('&amp;quot;');
    });
});

describe('CT-29 · echapperAttribut · contrat d\'appel', () => {
    it('null et undefined rendent la chaîne vide, comme echapperHtml', () => {
        expect(echapperAttribut(null)).toBe('');
        expect(echapperAttribut(undefined)).toBe('');
    });

    it('les valeurs non-chaînes sont converties, jamais rejetées', () => {
        expect(echapperAttribut(0)).toBe('0');
        expect(echapperAttribut(42)).toBe('42');
        expect(echapperAttribut(false)).toBe('false');
    });

    it('une valeur sans caractère spécial traverse inchangée', () => {
        expect(echapperAttribut('HOR_12ab')).toBe('HOR_12ab');
        expect(echapperAttribut('00001')).toBe('00001');
    });

    it('toutes les occurrences sont remplacées, pas seulement la première', () => {
        expect(echapperAttribut('""')).toBe('&quot;&quot;');
    });
});
