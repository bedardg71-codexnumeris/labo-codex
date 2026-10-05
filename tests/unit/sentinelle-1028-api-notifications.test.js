import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// SENTINELLE #1028 (verdict de Cowork, 5 oct. 2026, correction 3) — l'API des notifications
// =====================================================================
//
// `notifications.avertissement(…)` était appelé deux fois (travaux-ui.js, « Re-déposer ») alors
// que l'API n'expose que `succes`, `erreur`, `warning`, `info` : l'appel levait une TypeError,
// l'avertissement ne s'affichait jamais et la suite du geste ne s'exécutait pas.
// Ce banc lit l'API réellement exposée par js/utils-notifications.js, puis chaque appel
// `notifications.<nom>(` du dossier js/ (hors js/_archives/), et exige que le nom existe.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function fichiersJs(dossier) {
    const r = [];
    for (const n of readdirSync(dossier)) {
        const p = path.join(dossier, n);
        if (statSync(p).isDirectory()) { if (n !== '_archives') r.push(...fichiersJs(p)); }
        else if (n.endsWith('.js')) r.push(p);
    }
    return r;
}

function apiExposee() {
    const src = readFileSync(path.join(racine, 'js/utils-notifications.js'), 'utf8');
    const m = src.match(/window\.notifications\s*=\s*\{([^}]*)\}/);
    if (!m) throw new Error('window.notifications introuvable');
    return m[1].split(',').map((x) => x.trim().split(':')[0].trim()).filter(Boolean);
}

function appelsInconnus(remplacer) {
    const api = new Set(apiExposee());
    const fautifs = [];
    for (const f of fichiersJs(path.join(racine, 'js'))) {
        let src = readFileSync(f, 'utf8');
        if (remplacer && f.endsWith(remplacer.fichier)) src = remplacer.muter(src);
        for (const m of src.matchAll(/(?:^|[^\w$.-]|window\.)notifications\.([A-Za-z_$][\w$]*)\s*\(/gm)) {
            if (!api.has(m[1])) fautifs.push(path.relative(racine, f) + ' : notifications.' + m[1]);
        }
    }
    return fautifs;
}

describe('#1028 · chaque appel à notifications.* existe dans l\'API', () => {
    it('l\'API lue est celle attendue', () => {
        expect(apiExposee().sort()).toEqual(['erreur', 'info', 'succes', 'warning']);
    });

    it('aucun appel à une fonction absente', () => {
        expect(appelsInconnus()).toEqual([]);
    });

    it('TÉMOIN — l\'appel d\'avant (avertissement) est vu', () => {
        const fautifs = appelsInconnus({ fichier: 'js/travaux-ui.js', muter: (s) => s.replace('notifications.warning(', 'notifications.avertissement(') });
        expect(fautifs).toEqual(['js/travaux-ui.js : notifications.avertissement']);
    });
});
