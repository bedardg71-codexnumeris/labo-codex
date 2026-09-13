/**
 * SENTINELLE #520 — `index.html` NE PORTE AUCUN IDENTIFIANT DUPLIQUÉ.
 *
 * Jusqu'au 13 sept. 2026, un bloc `u-hide` « ANCIEN SYSTÈME (Caché par défaut,
 * gardé pour compatibilité) » doublait huit identifiants de l'éditeur
 * d'échelles : apercuEchelle, champAutreEchelle, nomEchelleContainer,
 * nomEchelleTemplate, selectEchelleTemplate, seuilReussite, tableauNiveaux,
 * typeEchelle. `getElementById` rend la PREMIÈRE occurrence : c'était l'éditeur
 * vivant, mais seulement par l'ordre du fichier — une mine au premier
 * réordonnancement. Le bloc est retiré : 8 identifiants dupliqués → 0.
 *
 * ⮕ Le cliquet est à zéro : un identifiant dupliqué, où qu'il soit dans le
 *   fichier, rougit en se nommant.
 *
 * BREAK-TEST attendu : réintroduire un second `id="nomEchelleTemplate"` n'importe
 * où → A rougit en le nommant ; B aussi (compte 2 au lieu de 1).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const HTML = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

/** Compte des attributs `id` des balises ouvrantes (pas `data-id`, pas `aria-*`). */
function compterIds() {
    const compte = new Map();
    for (const m of HTML.matchAll(/<[a-zA-Z][^<>]*>/g)) {
        for (const a of m[0].matchAll(/(?:^|\s)id\s*=\s*"([^"]*)"/g)) {
            compte.set(a[1], (compte.get(a[1]) || 0) + 1);
        }
    }
    return compte;
}

const HUIT = ['apercuEchelle', 'champAutreEchelle', 'nomEchelleContainer', 'nomEchelleTemplate',
              'selectEchelleTemplate', 'seuilReussite', 'tableauNiveaux', 'typeEchelle'];

describe('#520 · A — aucun identifiant dupliqué dans index.html', () => {
    it('chaque `id` n\'apparaît qu\'une fois', () => {
        const doublons = [...compterIds()].filter(([, n]) => n > 1).map(([id, n]) => `${id} ×${n}`);
        expect(doublons, 'getElementById ne rend que la PREMIÈRE occurrence : les suivantes sont mortes').toEqual([]);
    });
});

describe('#520 · B — les huit ex-doublons survivent, une fois chacun', () => {
    it('l\'éditeur vivant (et ses conteneurs de compatibilité) garde ses huit ids', () => {
        const compte = compterIds();
        for (const id of HUIT) expect(compte.get(id) || 0, id).toBe(1);
    });

    it('le bloc « ANCIEN SYSTÈME » des échelles est parti', () => {
        expect(HTML).not.toContain('ANCIEN SYSTÈME (Caché par défaut, gardé pour compatibilité)');
    });
});
