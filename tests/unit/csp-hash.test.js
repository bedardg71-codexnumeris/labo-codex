import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Test A.3 du plan Défense I (PLAN §2 catégorie A).
// Si MESSENGER_SCRIPT change dans js/securite-apercu-sandbox.js sans que
// le hash de la CSP de index.html soit recalculé, le messenger est
// silencieusement bloqué et l'iframe d'aperçu reste à hauteurMin → la
// sandbox fonctionne toujours mais l'UX se dégrade sans erreur visible
// côté code. Ce test prévient activement la régression.
describe('Défense A · A.3 · hash CSP synchronisé avec MESSENGER_SCRIPT', () => {
    // Calcul du hash de référence — partagé entre les deux assertions.
    function calculerHashAttendu() {
        const composantSrc = readFileSync(
            path.join(racineProjet, 'js/securite-apercu-sandbox.js'),
            'utf8'
        );
        const m = composantSrc.match(/var MESSENGER_SCRIPT = '([^']+)';/);
        if (!m) throw new Error('MESSENGER_SCRIPT introuvable dans securite-apercu-sandbox.js');
        const hashCalcule = createHash('sha256').update(m[1]).digest('base64');
        return `'sha256-${hashCalcule}'`;
    }

    it('le hash sha256 du messenger match la directive script-src de index.html', () => {
        const directiveAttendue = calculerHashAttendu();
        const indexSrc = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        const cspMatch = indexSrc.match(/Content-Security-Policy"\s+content="([^"]+)"/);
        expect(cspMatch, 'Meta CSP introuvable dans index.html').not.toBeNull();

        expect(
            cspMatch[1],
            `Hash CSP désynchronisé dans index.html. Attendu : ${directiveAttendue}. Procédure : recalculer le hash et mettre à jour script-src dans index.html ligne 10.`
        ).toContain(directiveAttendue);
    });

    it('le hash sha256 du messenger match aussi le harness CSP des tests', () => {
        // Le harness duplique la CSP de prod ; sans cette assertion, une
        // évolution de MESSENGER_SCRIPT ferait passer A.3 (côté index.html
        // bumpé) tout en laissant le harness pointer vers un hash périmé,
        // et le test A.2 (CSP rejette scripts inline) deviendrait silen-
        // cieusement non représentatif.
        const directiveAttendue = calculerHashAttendu();
        const harnessSrc = readFileSync(
            path.join(racineProjet, 'tests/integration/harness/sandbox-harness-csp.html'),
            'utf8'
        );
        const cspMatch = harnessSrc.match(/Content-Security-Policy"\s+content="([^"]+)"/);
        expect(cspMatch, 'Meta CSP introuvable dans sandbox-harness-csp.html').not.toBeNull();

        expect(
            cspMatch[1],
            `Hash CSP désynchronisé dans le harness. Attendu : ${directiveAttendue}. Procédure : mettre à jour script-src dans tests/integration/harness/sandbox-harness-csp.html ligne 13.`
        ).toContain(directiveAttendue);
    });
});
