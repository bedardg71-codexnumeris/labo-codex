import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — fix terrain iPad 10 juin 2026.
// Symptôme : « Codex chargé » → recharger → « Aucun codex actif ». Cause :
// reload immédiat sans attendre les écritures IndexedDB pendantes ; avec un
// localStorage saturé, les clés passées par setSync (dont le marqueur de
// codex actif) ne vivent qu'en memoryCache + écriture IDB asynchrone, que
// le reload coupe. Fix : `await db.flush()` AVANT chaque dialogue
// confirm(...) suivi d'un location.reload() dans les flux d'import.
// Cette sentinelle verrouille le patron (cf. feedback-fix-perdu-refactoring-
// extraction : tout fix défensif critique doit être verrouillé, sinon il
// disparaît silencieusement au prochain refactoring).
// Les reload de réinitialisation (alert après db.clear()) sont hors patron :
// db.clear() est awaité et désormais durable (résout sur le commit de transaction,
// #353 Option C : _clearIndexedDB + clearBlobs sur oncomplete) → les stores sont
// vidés avant le reload, rien à flusher en plus.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const FICHIERS = ['js/codex.js', 'js/import-export.js'];
const FENETRE_FLUSH = 10; // lignes inspectées avant le confirm

function sitesConfirmReloadSansFlush(chemin) {
    const lignes = readFileSync(path.join(racine, chemin), 'utf8').split('\n');
    const fautifs = [];
    for (let i = 0; i < lignes.length; i++) {
        if (!/if\s*\(\s*confirm\(/.test(lignes[i])) continue;
        const corps = lignes.slice(i, i + 3).join('\n');
        if (!/location\.reload\(\)/.test(corps)) continue;
        const avant = lignes.slice(Math.max(0, i - FENETRE_FLUSH), i).join('\n');
        if (!/await\s+db\.flush\(\)/.test(avant)) {
            fautifs.push(`${chemin}:${i + 1}`);
        }
    }
    return fautifs;
}

describe('sentinelle · flush des écritures IDB avant tout confirm + reload', () => {
    it('chaque confirm(...) suivi de location.reload() est précédé de await db.flush()', () => {
        const fautifs = FICHIERS.flatMap(sitesConfirmReloadSansFlush);
        expect(fautifs, 'sites confirm+reload sans flush préalable').toEqual([]);
    });

    // #1047 (lot 12, 11 oct. 2026) : 6 → 5, un site vivait dans `executerImportLocalStorageBrut`, code mort retiré.
    it('le patron protège bien les 5 sites connus (1 codex.js + 4 import-export.js)', () => {
        const total = FICHIERS
            .map(f => readFileSync(path.join(racine, f), 'utf8'))
            .map(src => (src.match(/await db\.flush\(\)/g) || []).length)
            .reduce((a, b) => a + b, 0);
        expect(total).toBeGreaterThanOrEqual(5);
    });
});
