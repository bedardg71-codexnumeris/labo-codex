import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { conteneursRegeneres } from './_helpers/conteneurs-regeneres.js';

// =====================================================================
// #784 — UN ÉLÉMENT STATIQUE DANS UN CONTENEUR QUE LE JS RÉÉCRIT (11 oct. 2026)
// =====================================================================
// Le bouton « Reporter dans Léa » (1.124.0) vivait dans le HTML statique d'un conteneur que
// `chargerTableauPresences` réécrivait : il disparaissait au premier rendu, et la mesure au
// navigateur, qui n'ouvrait pas l'écran par son vrai chemin, ne l'a pas vu. Ce CLIQUET fige les
// conteneurs du jour (9) ; un conteneur neuf, réécrit par innerHTML ET porteur d'éléments à id ou
// à data-action dans index.html, rougit. Un conteneur réglé sort de la liste.
// Mettre à jour : tests/fixtures/cliquets/conteneurs-regeneres-784.json.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fige = JSON.parse(readFileSync(path.join(racine, 'tests', 'fixtures', 'cliquets', 'conteneurs-regeneres-784.json'), 'utf8'));

describe('#784 · cliquet des conteneurs régénérés qui logent du statique', () => {
    const mesure = conteneursRegeneres(racine);
    it('aucun conteneur neuf (mets le gabarit dans le JS, ou ne réécris que ce qui change)', () => {
        expect(mesure.filter((c) => !fige.includes(c))).toEqual([]);
    });
    it('la liste figée descend avec les corrections', () => {
        expect(fige.filter((c) => !mesure.includes(c))).toEqual([]);
    });
    it('TÉMOIN · l\'en-tête « Présence », réglé par #783, n\'y est plus', () => {
        expect(mesure).not.toContain('colonneHeuresTitre');
    });
});
