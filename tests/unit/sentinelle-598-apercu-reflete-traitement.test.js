import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #598 volet A (30 août 2026) — l'aperçu du pipeline ne montrait pas le
// traitement réellement appliqué.
//
// Symptôme vécu par Grégoire pendant un import de 49 fichiers : aucune
// confirmation ni réglage visible pour les traitements appliqués aux copies.
//
// Cause, motif « clé lue, jamais écrite » : trois sites décidaient chacun de
// leur côté. L'import lisait `optBalance = true` en dur ; les deux aperçus
// lisaient `pipeline-opt-balance`, une case retirée de l'UI en Beta 99.30
// (1er mai 2026) et recréée nulle part. `?.checked` rendait `undefined`, donc
// les aperçus n'appliquaient JAMAIS la balance des blancs alors que l'import
// l'appliquait TOUJOURS. Aucun réglage n'aurait corrigé ça : la condition
// était constante.
//
// Mesuré au navigateur sur une copie réelle (4284x5712), avant/après :
//   · écart moyen aperçu vs fichier importé AVANT : 43,68 par canal sur 255
//   · après                                       :  0,95 par canal sur 255
//   · facteurs RVB des deux chemins concordants à 0,006 près
//
// Portée : sentinelle STATIQUE. La comparaison pixel exige un canvas, que Node
// n'a pas. Ce qu'elle verrouille, c'est le SSOT de la décision — sans lui, les
// trois sites peuvent redivergier en silence, et c'est précisément ce qui
// s'est produit.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. remettre un `getElementById('pipeline-opt-balance')` → cas 1.
//   2. rendre un aperçu indépendant du SSOT → cas 2.
//   3. retirer la prise en compte de `skipBalance` → cas 3.
//   4. redupliquer le calcul dans un aperçu → cas 5.

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('#598 volet A — l\'aperçu reflète le traitement réel', () => {

    const uiJs = sansCommentaires(
        readFileSync(path.join(racineProjet, 'js', 'travaux-ui.js'), 'utf-8')
    );

    it('cas 1 — plus aucune lecture de la case retirée', () => {
        // La case `pipeline-opt-balance` n'existe plus dans l'UI depuis le
        // 1er mai 2026. Toute lecture qui reviendrait serait constante.
        expect(uiJs).not.toContain("getElementById('pipeline-opt-balance')");
        expect(uiJs).not.toContain('getElementById("pipeline-opt-balance")');
    });

    it('cas 2 — les trois sites consomment le MÊME SSOT', () => {
        expect(uiJs).toMatch(/function balanceActiveePour\(f\)/);

        // Un appel dans chaque aperçu, un dans l'import : trois consommateurs
        // plus la définition. Moins de trois appels = un site a redivergé.
        const appels = (uiJs.match(/balanceActiveePour\(/g) || []).length;
        expect(appels).toBeGreaterThanOrEqual(4);

        // L'aperçu vignette et l'aperçu central, nommément.
        const vignette = uiJs.slice(
            uiJs.indexOf('async function genererPreviewThumbnail'),
            uiJs.indexOf('async function genererPreviewThumbnail') + 1200
        );
        expect(vignette).toContain('balanceActiveePour(f)');

        const centre = uiJs.slice(
            uiJs.indexOf('async function genererPreviewCentre'),
            uiJs.indexOf('async function genererPreviewCentre') + 3000
        );
        expect(centre).toContain('balanceActiveePour(f)');
    });

    it('cas 3 — le SSOT respecte l\'exception par fichier', () => {
        const corps = uiJs.slice(
            uiJs.indexOf('function balanceActiveePour(f)'),
            uiJs.indexOf('function appliquerBalanceBlancsCanvas')
        );
        // `skipBalance` (case de « Modifier ») ne peut qu'ENLEVER le traitement.
        expect(corps).toContain('skipBalance');
        expect(corps).toContain('BALANCE_GLOBALE_ACTIVE');
    });

    it('cas 4 — l\'import passe par le SSOT, pas par une constante locale', () => {
        const corps = uiJs.slice(uiJs.indexOf('async function executerImportPipeline'));
        // Le `const optBalance = true;` local est exactement ce qui permettait à
        // l'import et à l'aperçu de diverger.
        expect(corps).not.toMatch(/const optBalance\s*=\s*true/);
        expect(corps).toContain('balanceActiveePour(f)');
    });

    it('cas 5 — le calcul n\'est plus dupliqué dans travaux-ui.js', () => {
        // Le bloc était copié à l'identique dans les deux aperçus. Deux copies
        // divergent tôt ou tard ; c'est le seuil du 95e centile qui donne le
        // repère mesurable.
        const occurrences = (uiJs.match(/totalPixels \* 0\.95/g) || []).length;
        expect(occurrences).toBe(1);

        const definitions = (uiJs.match(/function appliquerBalanceBlancsCanvas/g) || []).length;
        expect(definitions).toBe(1);
    });

    it('cas 6 — l\'aperçu applique le même algorithme que l\'import', () => {
        const apercu = uiJs.slice(
            uiJs.indexOf('function appliquerBalanceBlancsCanvas'),
            uiJs.indexOf('async function genererPreviewThumbnail')
        );
        const preparation = sansCommentaires(
            readFileSync(path.join(racineProjet, 'js', 'travaux-preparation.js'), 'utf-8')
        );
        const importAuto = preparation.slice(
            preparation.indexOf('function autoBalanceBlancs(blob)'),
            preparation.indexOf('function autoBalanceBlancs(blob)') + 4000
        );

        // Les trois constantes qui définissent la correction. Si l'une bouge
        // d'un côté seulement, l'aperçu recommence à mentir — plus subtilement
        // qu'avant, donc plus difficile à voir.
        for (const constante of ['0.299', '0.587', '0.114']) {
            expect(apercu).toContain(constante);
            expect(importAuto).toContain(constante);
        }
        expect(apercu).toContain('totalPixels * 0.95');
        expect(importAuto).toContain('totalPixels * 0.95');
        expect(apercu).toContain('Math.max(0.5, Math.min(2.0');
        expect(importAuto).toContain('Math.max(0.5, Math.min(2.0');
    });
});
