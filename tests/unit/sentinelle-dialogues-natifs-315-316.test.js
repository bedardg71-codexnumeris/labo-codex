import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle #315 / #316 — anti-régression : les 4 fichiers migrés ne doivent plus
// contenir d'appel natif alert()/confirm()/prompt() (remplacés par window.notifications
// et window.uiDialogues). Si un commit en réintroduit un, ce test échoue.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

const FICHIERS_MIGRES = [
    'pratiques-bibliotheque.js',
    'planification-bibliotheque.js',
    'productions-bibliotheque-ui.js',
    'codex.js'
];

// Retire commentaires de bloc et de ligne pour ne tester que le code réel.
function retirerCommentaires(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, '')   // /* ... */
        .replace(/^\s*\/\/[^\n]*$/gm, '');   // lignes // ...
}

// Appel natif = identifiant NON précédé d'un point/mot (exclut foo.alert, uiAlert…).
const RE_NATIF = /(?<![.\w])(alert|confirm|prompt)\s*\(/;

describe('#315/#316 · aucun dialogue natif dans les fichiers migrés', () => {
    FICHIERS_MIGRES.forEach(nom => {
        it(`${nom} : zéro alert()/confirm()/prompt() natif`, () => {
            const code = retirerCommentaires(readFileSync(path.join(racineJs, nom), 'utf8'));
            const lignes = code.split('\n');
            const violations = [];
            lignes.forEach((ligne, i) => {
                if (RE_NATIF.test(ligne)) violations.push(`${nom}:${i + 1} — ${ligne.trim()}`);
            });
            expect(
                violations,
                `Dialogue natif réintroduit :\n${violations.join('\n')}\n` +
                `Utiliser window.notifications.{succes,erreur,info,warning} ou ` +
                `window.uiDialogues.{confirmerAction,demanderSaisie,informer}.`
            ).toEqual([]);
        });
    });

    it('les fichiers migrés consomment bien le nouvel outillage', () => {
        // Garde positive : chaque fichier référence au moins notifications ou uiDialogues
        // (sinon la migration aurait pu « réussir » en retirant le code utile).
        FICHIERS_MIGRES.forEach(nom => {
            const code = readFileSync(path.join(racineJs, nom), 'utf8');
            expect(/notifications\.|uiDialogues\./.test(code), `${nom} n'utilise ni notifications ni uiDialogues`).toBe(true);
        });
    });
});
