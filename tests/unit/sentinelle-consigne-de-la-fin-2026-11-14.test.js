import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 14 nov. 2026 (essai novice, retouche demandée par Cowork) : la dernière bulle d'un parcours qui offre « Parcours
// suivant » et « Terminer » dit « Touche « Parcours suivant », ou « Terminer ». ». Cette phrase a UNE source, le
// moteur, qui la pose quand il ajoute le second bouton ; un parcours écrit seulement « Touche « Terminer » ».
// Le rendu se juge au navigateur : tests/integration/essai-novice-lot2-moteur-2026-11-14.spec.js, (e).
const js = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'js');
const PHRASE = 'Touche « Parcours suivant », ou « Terminer »';
// Hors commentaires : une chaîne du code, entre guillemets simples ou doubles.
const ecritures = (source) => (source.match(/["']Touche « Parcours suivant », ou « Terminer »\.?["']/g) || []).length;

describe('la consigne des deux suites : une seule source', () => {
    const fichiers = readdirSync(js).filter((f) => f.endsWith('.js'));

    it('le moteur l\'écrit une fois', () => {
        const moteur = readFileSync(path.join(js, 'parcours-moteur.js'), 'utf8');
        expect(moteur).toContain("var CONSIGNE_DEUX_SUITES = '" + PHRASE + "';");
        expect(ecritures(moteur)).toBe(1);
    });

    it.each(fichiers.filter((f) => f !== 'parcours-moteur.js').map((f) => [f]))('%s ne la recopie pas', (f) => {
        expect(ecritures(readFileSync(path.join(js, f), 'utf8'))).toBe(0);
    });
});
