import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #627 (12 oct. 2026) — UNE SEULE RÈGLE DE REBRANCHEMENT POUR LES QUATRE IMPORTS.
//
// Remesuré avant le lot : quatre chemins, quatre listes de champs, chacune trouée ailleurs.
//   réouverture d'archive « en double » (reserve-ouvrir.js) : pas `cartouche.echelleId` ;
//   import complet (executerImportConfigComplete) : la CLÉ des cartouches suivait, pas leurs
//     champs `grilleId` ni `echelleId` ;
//   import sélectif (executerImportSelectif) : complet, à sa manière (`rebrancher` champ par champ) ;
//   partage (partage-import.js) : `grilleId` seulement.
// Après : `rebrancherReferences` (import-export.js) porte la liste, les quatre l'appellent.
// Source seulement : les références déjà écrites chez l'utilisateur ne sont pas réécrites.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

function corps(src, debut, fin) {
    const i = src.indexOf(debut);
    if (i < 0) throw new Error('introuvable : ' + debut);
    const j = fin ? src.indexOf(fin, i + debut.length) : src.length;
    if (j < 0) throw new Error('fin introuvable : ' + fin);
    return src.slice(i, j);
}

/* ------------------------------------------------------------ A — la règle */

describe('#627 · A — rebrancherReferences', () => {
    const w = chargerScript('js/import-export.js', {});
    const TABLES = {
        grilles: { G_VIEUX: 'G_NEUF' },
        echelles: { E_VIEUX: 'E_NEUF' },
        cartouches: { C_VIEUX: 'C_NEUF' }
    };

    it('A.a une production suit sa grille, son échelle et sa cartouche', () => {
        const p = { id: 'P', grilleId: 'G_VIEUX', echelleId: 'E_VIEUX', cartoucheId: 'C_VIEUX', titre: 'Dissertation' };
        expect(w.rebrancherReferences(p, 'production', TABLES)).toBe(3);
        expect(p).toEqual({ id: 'P', grilleId: 'G_NEUF', echelleId: 'E_NEUF', cartoucheId: 'C_NEUF', titre: 'Dissertation' });
    });

    it('A.b une cartouche suit sa grille ET son échelle (le trou de la réouverture et de l\'import complet)', () => {
        const c = { id: 'C', grilleId: 'G_VIEUX', echelleId: 'E_VIEUX' };
        expect(w.rebrancherReferences(c, 'cartouche', TABLES)).toBe(2);
        expect(c.grilleId).toBe('G_NEUF');
        expect(c.echelleId).toBe('E_NEUF');
    });

    it('A.c une cartouche ne suit pas une table de cartouches (son propre id n\'est pas une référence)', () => {
        const c = { id: 'C_VIEUX', grilleId: 'G_AUTRE' };
        expect(w.rebrancherReferences(c, 'cartouche', TABLES)).toBe(0);
        expect(c.id).toBe('C_VIEUX');
    });

    it('A.d une pratique suit son échelle sous ses trois formes (#663)', () => {
        const p = { echelleId: 'E_VIEUX', configuration: { echelleId: 'E_VIEUX' } };
        expect(w.rebrancherReferences(p, 'pratique', TABLES)).toBe(2);
        expect(p.configuration.echelleId).toBe('E_NEUF');
    });

    it('A.e un id absent de sa table, vide, ou hérité ne bouge pas ; une table manquante non plus', () => {
        const p = { grilleId: 'G_AUTRE', echelleId: '', cartoucheId: 'toString' };
        expect(w.rebrancherReferences(p, 'production', TABLES)).toBe(0);
        expect(p).toEqual({ grilleId: 'G_AUTRE', echelleId: '', cartoucheId: 'toString' });
        const q = { grilleId: 'G_VIEUX', cartoucheId: 'C_VIEUX' };
        expect(w.rebrancherReferences(q, 'production', { grilles: TABLES.grilles })).toBe(1);
        expect(q.cartoucheId).toBe('C_VIEUX');
    });
});

/* ------------------------------------------------ B — le partage, de bout en bout */

describe('#627 · B — le partage passe par la règle', () => {
    it('B.a une production du paquet suit la grille ET la cartouche du paquet', () => {
        const db = { getSync: () => null, get: async () => null, set: async () => {}, setSync() {} };
        const w = chargerScript('js/partage-schemas.js', { db });
        chargerScript('js/trust-tofu.js', { db }, w);
        chargerScript('js/partage-import.js', { db }, w);
        chargerScript('js/import-export.js', { db }, w);
        const pkg = {
            manifest: { auteur: { nom: 'Auteur fictif' }, dateExport: '2026-10-01', item_principal: { type: 'production', id: 'P1' } },
            entites: {
                grilles: [{ id: 'G1', nom: 'Grille' }], echelles: [], pratiques: [],
                cartouches: [{ id: 'C1', grilleId: 'G1', nom: 'Cartouche' }],
                productions: [{ id: 'P1', grilleId: 'G1', cartoucheId: 'C1', titre: 'Essai' }]
            }
        };
        const r = w.partageImport.prefixerEntites(pkg, 'IMP_ab12cd34');
        const prod = r.parType.production[0];
        expect(prod.grilleId).toBe(r.parType.grille[0].id);
        expect(prod.cartoucheId, 'la cartouche du paquet est suivie (avant : la grille seule)').toBe(r.parType.cartouche[0].id);
        expect(r.parType.cartouche[0].grilleId).toBe(r.parType.grille[0].id);
    });
});

/* ---------------------------------- C — le cliquet : les quatre chemins, une règle */

describe('#627 · C — aucun chemin ne porte plus sa propre liste de champs', () => {
    const ie = lire('js/import-export.js');
    const CHEMINS = [
        ['import complet', corps(ie, 'async function executerImportConfigComplete', 'async function executerImportSelectif'),
            ["rebrancherReferences(assainie, 'cartouche', tables)", "rebrancherReferences(prod, 'production',"]],
        ['import sélectif', corps(ie, 'async function executerImportSelectif', 'async function exporterConfigurationComplete'),
            ["rebrancherReferences(assainie, 'cartouche', tables)", "rebrancherReferences(assainie, 'pratique', tables)",
             "rebrancherReferences(assainie, 'production', tables)"]],
        ['réouverture d\'archive', corps(lire('js/reserve-ouvrir.js'), 'function _patcherReferences', 'function _preparerEtPatcher'),
            ['_rebrancherReferences(item, type, tables)']],
        ['partage', corps(lire('js/partage-import.js'), 'partageImport.prefixerEntites = function', '// Trace de provenance'),
            ['window.rebrancherReferences(item, type, {']]
    ];
    const AFFECTATION_DE_REFERENCE = /\.(?:grilleId|echelleId|cartoucheId)\s*=\s*(?:remap|correspondance|rebrancher\()/;

    for (const [nom, src, appels] of CHEMINS) {
        it(`${nom} : appelle la règle commune`, () => {
            for (const appel of appels) expect(src, appel).toContain(appel);
        });
        it(`${nom} : aucune affectation de référence à la main`, () => {
            expect(src).not.toMatch(AFFECTATION_DE_REFERENCE);
        });
    }
});
