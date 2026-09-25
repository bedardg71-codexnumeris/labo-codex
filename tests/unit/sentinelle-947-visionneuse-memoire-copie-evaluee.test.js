import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #947 (25 septembre 2026) — LA MÉMOIRE DES DERNIERS CHOIX NE TOUCHE PLUS UNE COPIE DÉJÀ ÉVALUÉE.
//
// Mesuré en WebKit sur `55d8a522` : dans la visionneuse, une copie évaluée sans cartouche ni échelle
// recevait celles de la mémoire (`dernieresSelectionsEvaluation`, écrite en évaluant une AUTRE copie),
// et « Enregistrer » les écrivait dans l'évaluation. Le comportement est tenu par
// `tests/integration/visionneuse-memoire-copie-evaluee-947.spec.js` ; ce banc tient la structure :
//   · la restauration de la visionneuse demande au lecteur #939/#946 si la copie est évaluée,
//     et ne restaure rien si elle l'est ;
//   · ce lecteur est exposé sur `window` (sans lui, la garde se tait et le défaut revient) ;
//   · `restaurerSelectionsEvaluation` (evaluation.js), sans appelant et sans garde, est retirée :
//     elle ne revient pas.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

describe('#947 · la restauration de la visionneuse épargne une copie évaluée', () => {
    it('la garde lit le lecteur #939/#946 et sort avant toute pose', () => {
        const ui = lire('js/travaux-ui.js');
        const bloc = tranche(ui, '// #947 — la mémoire des derniers choix', 'Restaurer la grille si vide');
        expect(bloc).toContain('window._evaluationEnregistreeDeLaCopie({ etudiantDA: fichier.etudiantDA, productionId: productionIdEffective })');
        expect(bloc).toMatch(/if \(!selectionsCache \|\| copieEvaluee\) \{[\s\S]*?window\._bloquerMemorisation = false;\s*return;/);
    });

    it('le lecteur est exposé sur window', () => {
        expect(lire('js/evaluation-chargement.js'))
            .toContain('window._evaluationEnregistreeDeLaCopie = _evaluationEnregistreeDeLaCopie;');
    });
});

describe('#947 · restaurerSelectionsEvaluation ne revient pas', () => {
    it('aucun fichier de js/ ni index.html ne la définit ni ne l\'appelle', () => {
        const fichiers = readdirSync(path.join(racine, 'js'), { recursive: true })
            .filter(f => String(f).endsWith('.js')).map(f => path.join('js', String(f)));
        const porteurs = [...fichiers, 'index.html'].filter(f => lire(f).includes('restaurerSelectionsEvaluation'));
        expect(porteurs).toEqual([]);
        expect(fichiers.length).toBeGreaterThan(50);   // témoin : la mesure a bien balayé js/
    });
});
