import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #302 — guides « som » (gateway sommatif, 3 pages) et « pan » (Modalités
// d'évaluation, 5 pages) dans GUIDES_PEDAGOGIQUES. Contenu validé Grégoire
// (6 juin 2026), citations CSÉ 2018 / Girouard-Gagné 2024 vérifiées.
//
// 21 nov. 2026 (décision de Grégoire, 21 h 25) : les deux boutons d'accès de
// Conception › Pratiques sont RETIRÉS le temps qu'il révise ces guides, jugés
// trop prescriptifs. Le texte, lui, RESTE dans js/guides-pedagogiques.js : il
// reviendra. La sentinelle garde les deux moitiés : aucune porte vers som/pan
// dans index.html, et les deux entrées toujours présentes dans le module.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const moduleGuides = readFileSync(path.join(racineProjet, 'js', 'guides-pedagogiques.js'), 'utf8');
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

describe('#302 · guides som/pan : texte gardé, portes retirées (21 nov. 2026)', () => {
    it('le guide « som » reste défini avec son préfixe CSS partagé', () => {
        expect(moduleGuides).toContain('som: {');
        expect(moduleGuides).toContain("cssPrefix: 'guide-som'");
        expect(moduleGuides).toContain('Comprendre sa pratique sommative');
    });

    it('le guide « pan » reste défini avec son préfixe CSS partagé', () => {
        expect(moduleGuides).toContain('pan: {');
        expect(moduleGuides).toContain("cssPrefix: 'guide-pan'");
    });

    it('citations vérifiées présentes mot pour mot (garde anti-reformulation)', () => {
        expect(moduleGuides).toContain('particulièrement pénalisés par le cumul de points');
        expect(moduleGuides).toContain("l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères");
    });

    it('aucun bouton d’index.html n’ouvre plus « som » ni « pan »', () => {
        // Matché sur l'attribut seul, quel que soit l'ordre ou l'espacement
        // des autres attributs du bouton.
        const portes = indexHtml.match(/data-param\s*=\s*["'](som|pan)["']/g) || [];
        expect(portes).toEqual([]);
        expect(indexHtml).not.toContain('Comprendre sa sommative');
    });
});

// ── Journal ─────────────────────────────────────────────────────────────
// 2026-06-06 : création (#302) — présence des deux guides et de leurs deux
//   boutons d'accès dans Pratiques de notation.
// 2026-11-21 : réécriture (lot/retirer-guides-pratiques). Les boutons sont
//   retirés d'index.html ; la sentinelle exige leur ABSENCE et le maintien du
//   texte des deux guides dans le module. Break-test : (1) bouton « som »
//   remis dans index.html → le dernier essai rougit ; (2) entrée `som: {`
//   renommée dans js/guides-pedagogiques.js → le premier essai rougit.
