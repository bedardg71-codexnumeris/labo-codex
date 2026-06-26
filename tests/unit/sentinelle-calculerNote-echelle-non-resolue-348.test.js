import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #348-résiduel — À la consultation d'une éval d'un trimestre ARCHIVÉ (A25), l'échelle de
// performance ne se résout pas tant que le pilote A25 n'a pas posé a2025_echellesTemplates.
// calculerNote (evaluation-calcul.js) est rappelée en cascade au chargement (dispatchEvent
// sur les selects : changerEchelleEvaluation / niveauSelectionne / changerStatutIntegrite)
// et émettait à chaque fois `console.error('❌ Aucune échelle de performance sélectionnée')`
// → 4 erreurs rouges à chaque ouverture d'une éval A25.
//
// Le bloc dégrade DÉJÀ proprement (note « -- » + return) ; on retire seulement le cri, pour
// l'aligner sur le cas JUMEAU « grille manquante » (ligne 518, return silencieux). Le fond
// (échelle non namespacée) reste signalé UNE fois par l'avertissement « Grille introuvable »
// (evaluation.js:2038). Demande terrain Grégoire (25 juin) : « éviter les erreurs avant le pilote ».
//
// Break-test : remettre le console.error → la 1re assertion rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

describe('#348-résiduel · calculerNote — échelle non résolue, dégradation silencieuse', () => {
    const src = readFileSync(path.join(racine, 'js/evaluation-calcul.js'), 'utf8');

    it('ne crie plus console.error pour une échelle non résolue (fin du bruit en consultation A25)', () => {
        expect(src).not.toContain("console.error('❌ Aucune échelle de performance sélectionnée')");
    });

    it('conserve la dégradation visible (note + niveau « -- ») avec garde DOM', () => {
        expect(src).toContain("if (elNote) elNote.textContent = '--'");
        expect(src).toContain("if (elNiveau) elNiveau.textContent = '--'");
    });
});
