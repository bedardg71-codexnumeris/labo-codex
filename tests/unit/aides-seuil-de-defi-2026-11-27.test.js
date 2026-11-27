/**
 * Fiche 7 du lot « Suivi » (textes de Grégoire, 27 nov. 2026, 15 h 07) — CINQ AIDES QUI DISAIENT ENCORE « 70 % PAR DÉFAUT ».
 * Depuis la fiche 2, le seuil de défi part du seuil de maîtrise de l'échelle. Les quatre parenthèses d'index.html disent
 * « (au départ, le seuil de maîtrise de ton échelle) », leur suite gardée après une virgule ; l'aide « i » des paramètres
 * d'analyse dit « Défi : sous le seuil de défi, qui part du seuil de maîtrise de ton échelle. »
 *
 *   cd tests && npx vitest run unit/aides-seuil-de-defi-2026-11-27.test.js
 *
 * Break-test (27 nov. 2026) : sur le texte d'avant, les deux essais sont rouges.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RACINE } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8').replace(/&nbsp;/g, '\u00a0');
const DEPART = '« Seuil de défi spécifique » (au départ, le seuil de maîtrise de ton échelle';

describe('fiche 7 · les aides du seuil de défi', () => {
    it('index.html : les quatre parenthèses, mot pour mot, leur suite gardée', () => {
        const nb = (s) => html.replace(/\u00a0/g, ' ').split(s).length - 1;
        expect(nb(DEPART + ')')).toBe(2);   // l'IPB, la RàI
        expect(nb(DEPART + ', réglable dans Labo → Observation)')).toBe(1);   // le profil
        expect(nb(DEPART + ', de 1 à 100 %, dans « Paramètres d\'analyse »)')).toBe(1);   // la grille de dépistage
        expect(html.replace(/\u00a0/g, ' ')).not.toMatch(/Seuil de défi spécifique » \(70 % par défaut/);
    });

    it('l\'aide « i » des paramètres d\'analyse', () => {
        let recues = null;
        chargerScript('js/accompagnement-contenu-popup.js', {}, { accompagnement: { ajouterEntrees: (o) => { recues = o; } } });
        const entree = recues['depistage-interpretation'];
        const aide = entree && (entree.popup || entree);
        const texte = aide.sections.filter((s) => s.titre === 'Valeurs par défaut').map((s) => s.contenu).join(' ');
        expect(texte).toContain('Défi\u00a0: sous le seuil de défi, qui part du seuil de maîtrise de ton échelle.');
        expect(texte).not.toMatch(/Défi\s*:\s*≤/);
    });
});
