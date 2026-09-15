import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #868 (15 septembre 2026) — « ÉVALUER » N'A QU'UNE DÉFINITION.
//
// Il en existait trois : profil-etudiant-actions.js (deux identifiants inexistants,
// `select-eleve-evaluation` / `select-production-evaluation`), evaluation.js (qui l'écrasait
// au chargement et remplissait des listes cachées encore vides) et une copie locale à
// l'IIFE de liste-evaluations.js. Aucune ne présélectionnait l'élève ni la production, et
// rien ne le disait. Le cliquet de la sentinelle 557 ne voit que les noms posés sur
// `window` par DEUX modules : une copie locale lui échappe. Celle-ci compte les définitions.
//
// Le comportement (copie ouverte en mode Évaluer, formulaire sans copie équipé) est jugé
// au navigateur : tests/integration/evaluer-868-avec-ou-sans-copie.spec.js.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function sansCommentaires(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

function fichiersJs() {
    const sortie = [];
    (function marcher(rel) {
        for (const e of fs.readdirSync(path.join(racine, rel), { withFileTypes: true })) {
            if (e.name === '_archives') continue;
            const suivant = rel + '/' + e.name;
            if (e.isDirectory()) marcher(suivant);
            else if (e.name.endsWith('.js')) sortie.push(suivant);
        }
    })('js');
    return sortie.sort();
}

describe('#868 · « Évaluer » n\'a qu\'une définition', () => {
    it('une seule `function evaluerProduction`, dans js/evaluation.js', () => {
        const definitions = [];
        for (const f of fichiersJs()) {
            const code = sansCommentaires(fs.readFileSync(path.join(racine, f), 'utf8'));
            const n = (code.match(/(?:^|\n)\s*(?:async\s+)?function\s+evaluerProduction\s*\(/g) || []).length;
            for (let i = 0; i < n; i++) definitions.push(f);
        }
        expect(definitions).toEqual(['js/evaluation.js']);
    });

    it('les deux identifiants qui n\'ont jamais existé ne sont plus visés', () => {
        const fautifs = fichiersJs().filter((f) => {
            const code = sansCommentaires(fs.readFileSync(path.join(racine, f), 'utf8'));
            return /select-eleve-evaluation|select-production-evaluation/.test(code);
        });
        expect(fautifs).toEqual([]);
    });

    it('le menu de la liste passe par la définition unique', () => {
        const code = sansCommentaires(fs.readFileSync(path.join(racine, 'js/liste-evaluations.js'), 'utf8'));
        expect(code).toMatch(/case 'evaluer':\s*\n\s*window\.evaluerProduction\(parts\[1\], parts\[2\]\);/);
    });
});
