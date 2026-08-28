import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #559 (28 août 2026) — la case cochée marquait un fichier ÉTRANGER.
//
// Le poste de préparation sert deux modes, et un seul a une file d'import.
// `queueOffset === -1` signale le mode ad hoc (« Ajouter des pages ») : le
// document travaillé ne vient pas de la file. Or `indexActuel + queueOffset`
// reste un index PARFAITEMENT VALIDE dans cette file dès que `indexActuel >= 1` :
// `changerOptBalance` / `changerOptResolution` écrivaient donc leurs drapeaux sur
// un autre fichier de la file, et `syncOptImport` cochait les cases d'après lui.
// Silencieux de bout en bout — aucune erreur, aucun signe à l'écran.
//
// Le reste du module tenait déjà la distinction (`modeAdHoc` l. 150 et 194,
// garde `!modeAdHoc` l. 213) ; ces trois fonctions l'avaient perdue.
//
// Portée de cette sentinelle : elle est STATIQUE. Le déclenchement réel demande
// d'ouvrir le poste en mode ad hoc et d'avancer d'au moins un fichier, ce qui
// passe par du rendu canvas hors de portée d'un test unitaire. Ce qu'elle
// verrouille, c'est l'invariant qui rend le bug impossible : plus aucune des
// trois fonctions n'indexe la file elle-même, et le point de résolution unique
// porte la garde du mode ad hoc.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. rendre à une des trois fonctions son `queue[indexActuel + queueOffset]`
//      → « aucune des trois fonctions n'indexe la file » rougit.
//   2. retirer `if (queueOffset === -1) return null;` du helper
//      → « le point de résolution unique garde le mode ad hoc » rougit.
//   3. retirer le `classList.toggle('u-hide', …)` de syncOptImport
//      → « la section est masquée faute de fichier de file » rougit.

function corpsDe(nomFonction, source) {
    const debut = source.indexOf('function ' + nomFonction + '(');
    if (debut === -1) return null;
    const fin = source.indexOf('\n    }', debut);
    // Commentaires retirés AVANT toute assertion : une sentinelle qui lit la
    // source ne doit être ni satisfaite ni mise en défaut par la documentation
    // — le bloc au-dessus du helper CITE le motif fautif pour l'expliquer.
    return source.slice(debut, fin)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
}

const source = readFileSync(path.join(racineProjet, 'js', 'travaux-preparation.js'), 'utf8');
const TROIS = ['syncOptImport', 'changerOptBalance', 'changerOptResolution'];

describe('#559 · les options d’import ne peuvent plus viser un fichier étranger', () => {
    it('aucune des trois fonctions n’indexe la file elle-même', () => {
        for (const nom of TROIS) {
            const corps = corpsDe(nom, source);
            expect(corps, `${nom} doit exister`).not.toBe(null);
            expect(corps, `${nom} indexe encore la file directement`)
                .not.toMatch(/queue\s*\[\s*indexActuel\s*\+\s*queueOffset\s*\]/);
        }
    });

    it('les trois passent par le point de résolution unique', () => {
        for (const nom of TROIS) {
            expect(corpsDe(nom, source), `${nom} doit appeler _fichierDeFileCourant`)
                .toContain('_fichierDeFileCourant()');
        }
    });

    it('le point de résolution unique garde le mode ad hoc', () => {
        const corps = corpsDe('_fichierDeFileCourant', source);
        expect(corps, '_fichierDeFileCourant doit exister').not.toBe(null);
        // La garde doit sortir AVANT toute lecture de la file.
        expect(corps).toMatch(/queueOffset\s*===\s*-1/);
        const posGarde = corps.indexOf('queueOffset === -1');
        const posLecture = corps.indexOf('obtenirFileDAttente');
        expect(posLecture, 'la file doit être lue APRÈS la garde').toBeGreaterThan(posGarde);
    });

    it('la section est masquée faute de fichier de file (pas de cases inertes)', () => {
        const corps = corpsDe('syncOptImport', source);
        expect(corps).toContain('prep-section-import');
        expect(corps).toMatch(/classList\.toggle\(\s*'u-hide'/);
    });

    it('contrôle : le module garde ses autres gardes de mode ad hoc', () => {
        // Non-régression sur la distinction que le reste du module tenait déjà.
        expect(source).toContain('const modeAdHoc = (queueOffset === -1)');
        expect(source).toMatch(/!modeAdHoc\s*&&\s*queue/);
    });
});
