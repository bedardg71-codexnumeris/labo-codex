import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// #663, #627 — L'ÉCHELLE D'UNE PRATIQUE SUIT L'ÉCHELLE RENOMMÉE (11 oct. 2026)
// =====================================================================
//
// Une pratique désigne son échelle sous `configuration.echelleId` (ce qu'écrivent l'assistant
// et la gestion), sous `config.echelleId` (pratiques anciennes, import #712) ou à la racine
// (schéma d'import). Rouvrir une archive en « copie en double » ne rebranchait que `config` ;
// l'import sélectif, que la racine. La pratique gardait l'ancien id.
//
// CE QUE CE BANC JUGE :
//   A — `rebrancherEchellePratique` (import-export.js) : les trois formes, sans toucher l'objet lu ;
//   B — la réouverture d'archive (reserve-ouvrir.js) passe par elle, et sa détection
//       « échelle manquante » lit `configuration` ;
// L'essai de bout en bout de l'import sélectif vit dans import-selectif-lot3-rattache-juste (A.c).
// Source seulement : les pratiques déjà écrites chez l'utilisateur ne sont pas réécrites.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lireSource = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#663 · A — rebrancherEchellePratique', () => {
    const w = chargerScript('js/import-export.js', {});
    const T = { ECH_VIEUX: 'ECH_NEUF' };
    // #627 (12 oct. 2026) : atteinte par la règle commune `rebrancherReferences`, seule exportée.
    const reb = (p, table) => w.rebrancherReferences(p, 'pratique', { echelles: table });

    it('A.a `configuration.echelleId` suit, le reste de la configuration est gardé', () => {
        const p = { id: 'P', configuration: { echelleId: 'ECH_VIEUX', seuil: 60 } };
        expect(reb(p, T)).toBe(1);
        expect(p.configuration).toEqual({ echelleId: 'ECH_NEUF', seuil: 60 });
    });

    it('A.b `config.echelleId` (forme ancienne) suit aussi', () => {
        const p = { id: 'P', config: { echelleId: 'ECH_VIEUX' } };
        expect(reb(p, T)).toBe(1);
        expect(p.config.echelleId).toBe('ECH_NEUF');
    });

    it('A.c la racine `echelleId` (schéma d\'import) suit', () => {
        const p = { id: 'P', echelleId: 'ECH_VIEUX' };
        expect(reb(p, T)).toBe(1);
        expect(p.echelleId).toBe('ECH_NEUF');
    });

    it('A.d les trois à la fois : trois rebranchements', () => {
        const p = { echelleId: 'ECH_VIEUX', config: { echelleId: 'ECH_VIEUX' }, configuration: { echelleId: 'ECH_VIEUX' } };
        expect(reb(p, T)).toBe(3);
    });

    it('A.e le sous-objet lu (celui de l\'archive) n\'est pas modifié', () => {
        const lu = { echelleId: 'ECH_VIEUX' };
        const p = { configuration: lu };
        reb(p, T);
        expect(lu.echelleId).toBe('ECH_VIEUX');
    });

    it('A.f une échelle absente de la table, ou une clé héritée, ne bouge pas', () => {
        const p = { configuration: { echelleId: 'ECH_AUTRE' }, echelleId: 'toString' };
        expect(reb(p, T)).toBe(0);
        expect(p).toEqual({ configuration: { echelleId: 'ECH_AUTRE' }, echelleId: 'toString' });
    });
});

describe('#663 · B — la réouverture d\'archive', () => {
    const src = lireSource('js/reserve-ouvrir.js');

    it('B.a _patcherReferences passe par le rebranchement commun (#627 : pour tous les types)', () => {
        const bloc = tranche(src, 'function _patcherReferences', 'function _preparerEtPatcher');
        expect(bloc).toContain('_rebrancherReferences(item, type, tables)');
        expect(bloc).not.toMatch(/item\.config\.echelleId\s*=/);
    });

    it('B.b « échelle manquante » se lit sous `configuration` d\'abord', () => {
        const w = chargerScript('js/reserve-ouvrir.js', {});
        expect(typeof w.ReserveOuvrir).toBe('object');
        expect(src).toMatch(/\(p\.configuration && p\.configuration\.echelleId\)\s*\n\s*\|\| \(p\.config && p\.config\.echelleId\) \|\| p\.echelleId/);
    });
});

// (#663 · C, le partage, est retiré à la relecture de Cowork du 11 oct. : un paquet de pratique
// ne porte jamais son échelle — `rassemblerDependances`, partage-format.js — la branche ne pouvait
// pas se déclencher.)
