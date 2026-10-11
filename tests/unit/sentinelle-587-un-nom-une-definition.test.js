import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #587 (11 oct. 2026, en partie) — un nom, une définition (option A de Grégoire, 28 août).
// Deux paires réglées : `fermerModalBibliothequePratiques` (deux corps identiques, celui de
// pratiques.js gagnait) et la double pose de `ouvrirModalExportPDF` / `fermerModalExportPDF`
// dans export-pdf.js. Les autres paires restent à mesurer une à une (demande du lot 18).
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fichiers = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js'));
const lire = (f) => readFileSync(path.join(racine, 'js', f), 'utf8');

describe('#587 · les deux paires réglées ne reviennent pas', () => {
    it('fermerModalBibliothequePratiques : une seule définition, une seule pose', () => {
        const defs = fichiers.filter((f) => /function fermerModalBibliothequePratiques\s*\(/.test(lire(f)));
        const poses = fichiers.flatMap((f) => lire(f).match(/window\.fermerModalBibliothequePratiques\s*=/g) || []);
        expect(defs).toEqual(['pratiques-gestion.js']);
        expect(poses).toHaveLength(1);
    });
    it('export-pdf.js pose chacun de ses deux noms une seule fois', () => {
        const src = lire('export-pdf.js');
        expect(src.match(/window\.ouvrirModalExportPDF\s*=/g)).toHaveLength(1);
        expect(src.match(/window\.fermerModalExportPDF\s*=/g)).toHaveLength(1);
    });
});
