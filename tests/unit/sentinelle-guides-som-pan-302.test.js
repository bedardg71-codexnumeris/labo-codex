import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #302 — intégration des guides « som » (gateway sommatif, 3 pages) et « pan »
// (Modalités d'évaluation, 5 pages) dans GUIDES_PEDAGOGIQUES + deux boutons
// d'accès dans Conception → Pratiques de notation. Contenu validé Grégoire
// (6 juin 2026), citations CSÉ 2018 / Girouard-Gagné 2024 vérifiées.
// La sentinelle garde la présence des deux guides et de leurs points d'accès.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const moduleGuides = readFileSync(path.join(racineProjet, 'js', 'guides-pedagogiques.js'), 'utf8');
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

describe('#302 · guides som/pan enregistrés', () => {
    it('le guide « som » est défini avec son préfixe CSS partagé', () => {
        expect(moduleGuides).toContain('som: {');
        expect(moduleGuides).toContain("cssPrefix: 'guide-som'");
        expect(moduleGuides).toContain('Comprendre sa pratique sommative');
    });

    it('le guide « pan » est défini avec son préfixe CSS partagé', () => {
        expect(moduleGuides).toContain('pan: {');
        expect(moduleGuides).toContain("cssPrefix: 'guide-pan'");
    });

    it('les deux boutons d’accès existent dans Pratiques de notation', () => {
        expect(indexHtml).toContain('data-action="ouvrirGuidePedagogique" data-param="som"');
        expect(indexHtml).toContain('data-action="ouvrirGuidePedagogique" data-param="pan"');
    });

    it('citations vérifiées présentes mot pour mot (garde anti-reformulation)', () => {
        expect(moduleGuides).toContain('particulièrement pénalisés par le cumul de points');
        expect(moduleGuides).toContain("l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères");
    });
});
