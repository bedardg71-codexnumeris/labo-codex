import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// #783 — L'EN-TÊTE « PRÉSENCE » N'A PLUS QU'UN GABARIT (11 oct. 2026)
// =====================================================================
// `saisie-presences.js` réécrivait l'en-tête entier (`colonneHeuresTitre.innerHTML`) avec ses
// deux boutons, en double du gabarit d'index.html — et perdait au passage l'infobulle
// `data-tooltip="presences-presence-col"`. Le gabarit vit maintenant dans index.html seul ; le
// JS ne pose que le nombre de périodes du premier bouton et l'état verrouillé.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#783 · un seul gabarit pour l\'en-tête de la colonne Présence', () => {
    const js = lire('js/saisie-presences.js');
    const bloc = tranche(js, "const colonnePresenceTitre = document.getElementById('colonneHeuresTitre');", "// Gérer l'état des boutons principaux");

    it('A · le JS ne réécrit plus l\'en-tête et ne fabrique aucun de ses boutons', () => {
        expect(bloc).not.toMatch(/colonnePresenceTitre\.innerHTML\s*=/);
        expect(bloc).not.toContain('<button');
    });

    it('B · il pose le libellé et l\'état sur les boutons du gabarit', () => {
        expect(bloc).toContain('colonnePresenceTitre.querySelector(\'[data-action="tousPresents"]\')');
        expect(bloc).toContain('colonnePresenceTitre.querySelector(\'[data-action="reinitialiserSaisie"]\')');
        expect(bloc).toContain('btnTous.disabled = !!estVerrouille;');
        expect(bloc).toContain('btnReinitCol.disabled = !!estVerrouille;');
    });

    it('C · le gabarit d\'index.html porte l\'infobulle et les deux boutons', () => {
        const th = tranche(lire('index.html'), '<th id="colonneHeuresTitre"', '</th>');
        expect(th).toContain('data-tooltip="presences-presence-col"');
        expect(th).toContain('data-action="tousPresents"');
        expect(th).toContain('data-action="reinitialiserSaisie"');
        expect(th).toContain('<span aria-hidden="true">');
    });
});
