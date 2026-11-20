import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionDeLaConsigne, suiteEcrite } from './_helpers/fin-des-parcours-2026-11-20.js';

// 14 nov. 2026 (essai novice, retouche demandée par Cowork) : la dernière bulle d'un parcours qui offre une suite et
// « Terminer » le dit dans sa consigne. Cette phrase a UNE source, le moteur, qui la pose quand il ajoute le second
// bouton ; un parcours écrit seulement « Touche « Terminer » ».
// 20 nov. 2026 (essai de Grégoire sur l'iPad ; plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3) : le bouton
// « Parcours suivant » ne lance plus rien d'office. Il s'appelle « Voir le parcours N » (le libellé vient du panneau),
// et la consigne suit ses boutons : « Touche « Voir le parcours N », ou « Terminer » ». L'ancienne phrase est partie.
// Le rendu se juge au navigateur : tests/integration/fin-des-parcours-2026-11-20.spec.js.
const js = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'js');
// Hors commentaires : une chaîne du code, entre guillemets simples ou doubles.
const ancienne = (source) => (source.match(/["']Touche « Parcours suivant », ou « Terminer »\.?["']/g) || []).length;
const nouvelle = (source) => (source.match(/'Touche « ' \+ suite\.libelle \+ ' », ou « Terminer »'/g) || []).length;
const libelles = (source) => (source.match(/["'](?:Parcours suivant|Voir le parcours suivant)["']/g) || []).length;

describe('la consigne des deux suites : une seule source', () => {
    const fichiers = readdirSync(js).filter((f) => f.endsWith('.js'));

    it('le moteur l\'écrit une fois, d\'après le libellé que lui donne le panneau', () => {
        const moteur = readFileSync(path.join(js, 'parcours-moteur.js'), 'utf8');
        expect(nouvelle(moteur)).toBe(1);
        expect(suiteEcrite(4, 'Recevoir les productions, rendre tes rétroactions').consigne).toBe('Touche « Voir le parcours 4 », ou « Terminer »');
    });

    it('la consigne du 20 nov. (A3) : le bouton ne lance rien, la bulle nomme la suite, la consigne suit ses boutons', () => {
        const a3 = sectionDeLaConsigne('A3.');
        expect(a3).toContain('ne lance plus rien d\'office');
        expect(a3).toContain('« Suite suggérée : le parcours N, « Nom ». »');
        expect(a3).toContain('un bouton « Voir le parcours N », qui ferme la bulle et ouvre le panneau « Assistance » sur ce parcours');
        expect(a3).toContain('La consigne de fin du moteur suit ses boutons.');
        expect(a3).toContain('Dernier parcours : ni ligne ni bouton de suite.');
        // Ce que le moteur fait du bouton : il termine le parcours, puis ouvre le panneau ; il ne lance rien.
        const moteur = readFileSync(path.join(js, 'parcours-moteur.js'), 'utf8');
        expect(moteur).toContain('terminer.action(m);\n                    suivant.voir();');
        expect(moteur).not.toMatch(/lancerParcours\(/);
        const assistance = readFileSync(path.join(js, 'assistance.js'), 'utf8');
        expect(assistance).toContain("voir: function () { ouvrirPanneau({ sur: s.id }); }");
    });

    it.each(fichiers.map((f) => [f]))('%s ne porte plus l\'ancienne consigne ni les anciens libellés', (f) => {
        const source = readFileSync(path.join(js, f), 'utf8');
        expect(ancienne(source)).toBe(0);
        expect(libelles(source)).toBe(0);
        if (f !== 'parcours-moteur.js') expect(nouvelle(source)).toBe(0);
    });
});
