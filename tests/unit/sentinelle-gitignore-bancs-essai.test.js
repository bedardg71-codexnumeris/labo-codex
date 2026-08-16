import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle — les bancs d'essai jetables des sessions Claude Code ne doivent
// plus pouvoir entrer dans un commit (15-16 août 2026).
//
// HISTORIQUE. `repro.html` et `undefined/phase2.png` ont été commités par
// accident : les scripts de mesure écrivent à la RACINE du dépôt et `git add -A`
// les ramasse. La règle corrective a d'abord été posée dans `tests/.gitignore`
// — donc nulle part, puisqu'un .gitignore ne couvre que son propre sous-arbre.
// Le message de commit affirmait la porte fermée ; elle ne l'était pas.
//
// ⮕ POURQUOI ON INTERROGE `git check-ignore` ET NON LE TEXTE DU FICHIER.
// Chercher la chaîne « repro.html » dans un .gitignore serait passé au VERT sur
// le dépôt bogué : la ligne existait bel et bien, au mauvais endroit. Seule la
// résolution de git dit si un chemin est réellement ignoré — c'est l'invariant
// qui compte, et c'est le seul que ce test observe.

/** Rend vrai si git ignore réellement ce chemin, depuis la racine du dépôt. */
function estIgnore(cheminRelatif) {
    try {
        execFileSync('git', ['check-ignore', '-q', '--', cheminRelatif], {
            cwd: racineProjet,
            stdio: 'ignore'
        });
        return true; // sortie 0 = ignoré
    } catch {
        return false; // sortie 1 = non ignoré
    }
}

describe('Sentinelle · bancs d\'essai jetables ignorés depuis la racine', () => {
    // Le cas historique exact : les deux chemins réellement commités.
    it.each([
        'repro.html',
        'undefined/phase2.png'
    ])('« %s » à la racine est ignoré', (chemin) => {
        expect(estIgnore(chemin)).toBe(true);
    });

    // La règle doit couvrir aussi un script lancé depuis `tests/`, sans quoi
    // déplacer le problème d'un dossier suffirait à le rouvrir.
    it.each([
        'tests/repro.html',
        'tests/undefined/phase2.png'
    ])('« %s » est ignoré lui aussi', (chemin) => {
        expect(estIgnore(chemin)).toBe(true);
    });

    // Contre-épreuve : la sentinelle doit pouvoir DISTINGUER. Sans elle, un
    // `.gitignore` contenant « * » la ferait passer au vert en ignorant tout.
    //
    // ⚠ LE CHEMIN DOIT ÊTRE NON SUIVI. `git check-ignore` consulte l'index par
    // défaut et répond « non ignoré » pour tout fichier suivi, quels que soient
    // les motifs. Un premier jet interrogeait `js/main.js` — suivi, donc une
    // assertion qui ne pouvait JAMAIS rougir : mesuré en ajoutant « * » au
    // .gitignore, elle restait verte. Un chemin non suivi, lui, dépend
    // réellement des motifs.
    it('un chemin de code ordinaire n\'est PAS ignoré', () => {
        expect(estIgnore('js/module-hypothetique-non-suivi.js')).toBe(false);
    });
});
