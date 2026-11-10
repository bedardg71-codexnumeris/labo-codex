// =======================================================================
// LE PREMIER CODE D'UN CRITÈRE COMMENCE AU NUMÉRO 1 — 9 NOVEMBRE 2026 (corrections du huitième parcours)
// =======================================================================
// Décision de Cowork : un code ajouté à un critère algorithmique commence au numéro 1, comme la liste du français
// écrit (1 à 10). Avant, le premier portait 0, qu'aucune touche ne choisit (la touche 0 sert le code 10,
// js/codes-annotation.js, toucheDuCode) : la bulle 9 du parcours (« la touche de son numéro le choisit aussi »)
// était fausse pour lui. Les codes déjà créés ne sont PAS renumérotés : un critère qui porte un 0 le garde.
// Ce banc juge `codeSousCritereNeuf` (js/grilles.js) sur sa source réelle.
// Break-test (9 nov.) : la règle remise au rang depuis 0 (`: scs.length`) → ROUGE (« un critère sans code »,
// « des codes sans numéro ») ; rétablie → vert.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(racine, 'js/grilles.js'), 'utf8');
// eslint-disable-next-line no-new-func
const codeSousCritereNeuf = new Function(tranche(SOURCE, 'function codeSousCritereNeuf(', '\n}\n') + '\n}\nreturn codeSousCritereNeuf;')();
const sc = (code) => ({ id: 'SC_' + code, code, nom: '', ponderation: 1 });

describe('codeSousCritereNeuf : le premier code porte 1 ; le stock garde ses numéros', () => {
    it('un critère sans code : le premier code ajouté porte 1, puis 2', () => {
        expect(codeSousCritereNeuf([])).toBe('1');
        expect(codeSousCritereNeuf([sc('1')])).toBe('2');
    });

    it('des codes sans numéro (le rang compte depuis 1)', () => {
        expect(codeSousCritereNeuf([sc(''), sc('a')])).toBe('3');
    });

    it('le stock : un critère qui porte déjà 0 le garde, et le code suivant prend 1', () => {
        const stock = [sc('0')];
        expect(codeSousCritereNeuf(stock)).toBe('1');
        expect(stock[0].code).toBe('0');
        expect(codeSousCritereNeuf([sc('0'), sc('1')])).toBe('2');
    });

    it('la liste du français écrit (1 à 10) : le code suivant prend 11', () => {
        expect(codeSousCritereNeuf(Array.from({ length: 10 }, (_, k) => sc(String(k + 1))))).toBe('11');
    });

    it('après un retrait, jamais un numéro déjà porté (F1 du 20 oct.)', () => {
        expect(codeSousCritereNeuf([sc('2'), sc('3')])).toBe('4');
    });
});
