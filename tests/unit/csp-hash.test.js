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
    it('le hash sha256 du messenger match la directive script-src de index.html', () => {
        const composantSrc = readFileSync(
            path.join(racineProjet, 'js/securite-apercu-sandbox.js'),
            'utf8'
        );
        const m = composantSrc.match(/var MESSENGER_SCRIPT = '([^']+)';/);
        expect(m, 'MESSENGER_SCRIPT introuvable dans securite-apercu-sandbox.js').not.toBeNull();
        const messenger = m[1];

        const hashCalcule = createHash('sha256').update(messenger).digest('base64');
        const directiveAttendue = `'sha256-${hashCalcule}'`;

        const indexSrc = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        const cspMatch = indexSrc.match(/Content-Security-Policy"\s+content="([^"]+)"/);
        expect(cspMatch, 'Meta CSP introuvable dans index.html').not.toBeNull();
        const csp = cspMatch[1];

        expect(
            csp,
            `Hash CSP désynchronisé. Attendu : ${directiveAttendue}. Procédure : recalculer le hash et mettre à jour script-src dans index.html ligne 10.`
        ).toContain(directiveAttendue);
    });
});
