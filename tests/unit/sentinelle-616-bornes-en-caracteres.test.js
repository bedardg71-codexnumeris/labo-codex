import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// #616 — LES BANCS QUI BORNENT LA SOURCE « À N CARACTÈRES » (11 oct. 2026)
// =====================================================================
// Un `[\s\S]{0,400}` entre deux appels juge une DISTANCE, pas une SÉQUENCE : un commentaire
// ajouté le fait rougir sans que rien ne change, un retrait ailleurs le fait verdir sur un code
// cassé. La bonne forme : découper le corps (`tranche()`), retirer les commentaires, comparer des
// positions. CLIQUET : le compte du jour par fichier de banc qui lit la source (85 lignes dans
// 44 fichiers ; 31 fichiers le 30 août) ne peut que descendre, et aucun fichier neuf n'en porte.
// Les reborner un à un reste à faire (fiche #616).

const ici = path.dirname(fileURLToPath(import.meta.url));
const MOI = path.basename(fileURLToPath(import.meta.url));

const FIGE = JSON.parse(readFileSync(path.join(ici, '..', 'fixtures', 'cliquets', 'bornes-en-caracteres-616.json'), 'utf8'));

function mesurer() {
    const comptes = {};
    for (const f of readdirSync(ici).filter((x) => x.endsWith('.test.js') && x !== MOI)) {
        const s = readFileSync(path.join(ici, f), 'utf8');
        if (!s.includes('readFileSync')) continue;
        const n = s.split('\n').filter((l) => /\{0,\d+\}/.test(l)).length;
        if (n) comptes[f] = n;
    }
    return comptes;
}

describe('#616 · cliquet des bornes en caractères', () => {
    const mesure = mesurer();
    it('aucun banc n\'en gagne (découpe par tranche() et compare des positions)', () => {
        expect(Object.keys(mesure).filter((f) => mesure[f] > (FIGE[f] || 0)).map((f) => `${f} : ${FIGE[f] || 0} → ${mesure[f]}`)).toEqual([]);
    });
    it('un compte qui baisse est reporté dans la liste figée', () => {
        expect(Object.keys(FIGE).filter((f) => (mesure[f] || 0) < FIGE[f]).map((f) => `${f} : ${FIGE[f]} → ${mesure[f] || 0}`)).toEqual([]);
    });
});
