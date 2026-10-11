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
// l'import sélectif, que la racine ; le partage, rien. La pratique gardait l'ancien id.
//
// CE QUE CE BANC JUGE :
//   A — `rebrancherEchellePratique` (import-export.js) : les trois formes, sans toucher l'objet lu ;
//   B — la réouverture d'archive (reserve-ouvrir.js) passe par elle, et sa détection
//       « échelle manquante » lit `configuration` ;
//   C — le partage (partage-import.js) rebranche `configuration.echelleId` vers l'échelle
//       préfixée du même package, et seulement elle.
// L'essai de bout en bout de l'import sélectif vit dans import-selectif-lot3-rattache-juste (A.c).
// Source seulement : les pratiques déjà écrites chez l'utilisateur ne sont pas réécrites.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lireSource = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#663 · A — rebrancherEchellePratique', () => {
    const w = chargerScript('js/import-export.js', {});
    const T = { ECH_VIEUX: 'ECH_NEUF' };

    it('A.a `configuration.echelleId` suit, le reste de la configuration est gardé', () => {
        const p = { id: 'P', configuration: { echelleId: 'ECH_VIEUX', seuil: 60 } };
        expect(w.rebrancherEchellePratique(p, T)).toBe(1);
        expect(p.configuration).toEqual({ echelleId: 'ECH_NEUF', seuil: 60 });
    });

    it('A.b `config.echelleId` (forme ancienne) suit aussi', () => {
        const p = { id: 'P', config: { echelleId: 'ECH_VIEUX' } };
        expect(w.rebrancherEchellePratique(p, T)).toBe(1);
        expect(p.config.echelleId).toBe('ECH_NEUF');
    });

    it('A.c la racine `echelleId` (schéma d\'import) suit', () => {
        const p = { id: 'P', echelleId: 'ECH_VIEUX' };
        expect(w.rebrancherEchellePratique(p, T)).toBe(1);
        expect(p.echelleId).toBe('ECH_NEUF');
    });

    it('A.d les trois à la fois : trois rebranchements', () => {
        const p = { echelleId: 'ECH_VIEUX', config: { echelleId: 'ECH_VIEUX' }, configuration: { echelleId: 'ECH_VIEUX' } };
        expect(w.rebrancherEchellePratique(p, T)).toBe(3);
    });

    it('A.e le sous-objet lu (celui de l\'archive) n\'est pas modifié', () => {
        const lu = { echelleId: 'ECH_VIEUX' };
        const p = { configuration: lu };
        w.rebrancherEchellePratique(p, T);
        expect(lu.echelleId).toBe('ECH_VIEUX');
    });

    it('A.f une échelle absente de la table, ou une clé héritée, ne bouge pas', () => {
        const p = { configuration: { echelleId: 'ECH_AUTRE' }, echelleId: 'toString' };
        expect(w.rebrancherEchellePratique(p, T)).toBe(0);
        expect(p).toEqual({ configuration: { echelleId: 'ECH_AUTRE' }, echelleId: 'toString' });
    });
});

describe('#663 · B — la réouverture d\'archive', () => {
    const src = lireSource('js/reserve-ouvrir.js');

    it('B.a la branche « pratique » de _patcherReferences passe par le rebranchement commun', () => {
        const bloc = tranche(src, 'function _patcherReferences', 'function _preparerEtPatcher');
        const branche = tranche(bloc, "type === 'pratique'");
        expect(branche).toContain('_rebrancherEchellePratique(item, remapEchelles)');
        expect(branche).not.toMatch(/item\.config\.echelleId\s*=/);
    });

    it('B.b « échelle manquante » se lit sous `configuration` d\'abord', () => {
        const w = chargerScript('js/reserve-ouvrir.js', {});
        expect(typeof w.ReserveOuvrir).toBe('object');
        expect(src).toMatch(/\(p\.configuration && p\.configuration\.echelleId\)\s*\n\s*\|\| \(p\.config && p\.config\.echelleId\) \|\| p\.echelleId/);
    });
});

describe('#663 · C — le partage', () => {
    function charger() {
        const db = { getSync: (k, d) => d, setSync() {} };
        const w = chargerScript('js/partage-schemas.js', { db });
        chargerScript('js/trust-tofu.js', { db }, w);
        chargerScript('js/partage-import.js', { db }, w);
        return w;
    }
    const pkg = (echelleIdPratique) => ({
        manifest: { dateExport: '2031-01-01', auteur: { nom: 'Auteur fictif' }, item_principal: { type: 'pratique', id: 'PR_1' } },
        entites: {
            grilles: [], cartouches: [], productions: [],
            echelles: [{ id: 'ECH_1', nom: 'Échelle fictive', niveaux: [] }],
            pratiques: [{ id: 'PR_1', nom: 'Pratique fictive', configuration: { echelleId: echelleIdPratique, seuil: 60 } }]
        }
    });

    it('C.a l\'échelle du package est préfixée : la pratique la désigne sous son nouvel id', () => {
        const w = charger();
        const paquet = pkg('ECH_1');
        const r = w.partageImport.prefixerEntites(paquet, 'IMP_abc');
        const ech = r.parType.echelle[0];
        expect(ech.id).toBe('PARTAGE_abc_ECH_1');
        expect(r.parType.pratique[0].configuration).toEqual({ echelleId: ech.id, seuil: 60 });
        expect(paquet.entites.pratiques[0].configuration.echelleId).toBe('ECH_1');
    });

    it('C.b une échelle hors du package : la référence reste telle quelle', () => {
        const w = charger();
        const r = w.partageImport.prefixerEntites(pkg('ECH_AILLEURS'), 'IMP_abc');
        expect(r.parType.pratique[0].configuration.echelleId).toBe('ECH_AILLEURS');
    });
});
