import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #560 (29 août 2026) — AUCUNE ÉCRITURE DIRECTE DES ÉVALUATIONS DANS
// LA LISTE, ET LE SITE MORT EST PARTI.
//
// Constats B5/B8 : `supprimerFichierDefinitivement` et « Vider la corbeille »
// réécrivaient `evaluationsSauvegardees` par `db.setSync(cle(...))` direct,
// esquivant le blocage du mode anonymisation que `supprimerEvaluation` respecte ;
// `appliquerJetonPersonnalise` (evaluation.js) faisait de même — mais il était
// MORT (aucun appelant, aucun data-action, aucun conteneur), et c'est par retrait
// qu'on traite du code mort.
//
// Cliquets statiques (les deux chemins vivants sont des modales à confirmation
// asynchrone, hors de portée d'un sandbox Node sans DOM) :
//   A — plus aucun `db.setSync(cle('evaluationsSauvegardees')` dans liste-evaluations.js ;
//   B — chacun des deux chemins passe par `sauvegarderDonneesSelonMode` ET TESTE son
//       retour (un refus non testé serait le défaut sous une autre forme) ;
//   C — le site mort n'est plus ni défini ni exporté.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const liste = nettoyer(readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8'));
const evaluation = nettoyer(readFileSync(path.join(racineProjet, 'js', 'evaluation.js'), 'utf8'));

function corps(src, nom) {
    const i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    let j = i, prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

describe('#560 · A — aucune écriture directe des évaluations dans la Liste', () => {
    it("db.setSync(cle('evaluationsSauvegardees')) : zéro occurrence hors commentaires", () => {
        expect(liste).not.toContain("db.setSync(cle('evaluationsSauvegardees')");
        expect(liste).not.toContain("db.set(cle('evaluationsSauvegardees')");
    });
});

// Réancré le 26 sept. 2026 (lot A de l'enregistrement, D5 de Grégoire : « Je choisis A ») :
// le garde des modes n'a plus de refus à rendre — l'anonymisation écrit comme le mode normal,
// en retirant les valeurs de substitution (`modes.js`, banc `sentinelle-lot-a-anonymisation-*`).
// Ce qui reste vrai et reste verrouillé : les deux chemins écrivent PAR le garde, et le message
// « écriture refusée en mode anonymisation » ne peut plus s'afficher (il mentirait).
describe('#560 · B — les deux chemins passent par le garde des modes', () => {
    for (const nom of ['supprimerFichierDefinitivement', 'viderTouteCorbeille']) {
        it(nom, () => {
            const c = corps(liste, nom);
            expect(c).toContain("sauvegarderDonneesSelonMode('evaluationsSauvegardees'");
            expect(c).not.toMatch(/refusée en mode anonymisation/);
        });
    }
});

describe('#560 · C — le site mort du jeton personnalisé est parti', () => {
    it('ni défini ni exporté dans evaluation.js', () => {
        expect(evaluation).not.toContain('function appliquerJetonPersonnalise');
        expect(evaluation).not.toContain('window.appliquerJetonPersonnalise');
        expect(evaluation).not.toContain('function afficherJetonsPersonnalisesEvaluation');
        expect(evaluation).not.toContain("getElementById('jetonsPersonnalisesOptions')");
    });
});
