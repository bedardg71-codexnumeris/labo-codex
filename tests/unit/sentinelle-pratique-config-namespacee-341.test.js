import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Bug terrain #341 (Grégoire, 12 juin 2026) — « Appliquer une pratique » ne
// retrouvait AUCUNE configuration : obtenirConfigurationPratiqueParId lisait la
// clé GLOBALE 'pratiquesConfigurables' (vestige du fix Beta 95.2), alors que les
// configs vivent dans la clé namespacée par trimestre (h2026_pratiquesConfigurables)
// depuis 99.64. Symptôme : « Configuration introuvable » pour une pratique dont
// la configuration existait, mais sous la clé namespacée du trimestre.
// ET pour une copie fraîchement dupliquée, blocage probable de la reconstitution A25.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async () => {},
        setSync: () => {},
        // #599 : ce banc a un `set` MUET — il mesure les CLÉS lues, pas les
        // écritures. Le stub `modifier` l'est donc aussi : il exécute le
        // mutateur (pour que le code aille au bout) et n'écrit rien, exactement
        // comme `set` ici. Un stub qui écrirait rendrait ce banc plus permissif
        // que ce qu'il veut mesurer.
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            return await mutateur(lue);
        }
    };
}

const cleH2026 = (nom) => `h2026_${nom}`;

describe('#341 · obtenirConfigurationPratiqueParId résout la clé namespacée', () => {
    it('retrouve une config qui ne vit que dans h2026_pratiquesConfigurables', async () => {
        const store = {
            // La config réelle de Grégoire (PAN-Littérature A25), namespacée H26.
            h2026_pratiquesConfigurables: [{ id: 'pan-standards-cinq-niveaux', nom: 'PAN-Littérature A25' }],
            // Clé nue legacy volontairement vide — reproduit l'état du terrain.
            pratiquesConfigurables: []
        };
        const win = chargerScript('js/pratiques-bibliotheque.js', { db: dbDepuisStore(store), cle: cleH2026 });
        const config = await win.obtenirConfigurationPratiqueParId('pan-standards-cinq-niveaux');
        expect(config).toBeTruthy();
        expect(config.id).toBe('pan-standards-cinq-niveaux');
    });

    it('repli legacy : retrouve encore une config rangée sous la clé nue', async () => {
        const store = { pratiquesConfigurables: [{ id: 'legacy-1', nom: 'Vieille config' }] };
        const win = chargerScript('js/pratiques-bibliotheque.js', { db: dbDepuisStore(store), cle: cleH2026 });
        const config = await win.obtenirConfigurationPratiqueParId('legacy-1');
        expect(config?.id).toBe('legacy-1');
    });

    it('id inconnu → null (garde-fou aval intact)', async () => {
        const store = { h2026_pratiquesConfigurables: [{ id: 'autre' }], pratiquesConfigurables: [] };
        const win = chargerScript('js/pratiques-bibliotheque.js', { db: dbDepuisStore(store), cle: cleH2026 });
        const config = await win.obtenirConfigurationPratiqueParId('inexistant');
        expect(config).toBeNull();
    });

    it('ratchet statique : la source passe par cle() et ne relit pas la clé nue seule', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'pratiques-bibliotheque.js'), 'utf8');
        expect(source).toContain("db.get(cle('pratiquesConfigurables'))");
        // Le bug exact ne doit pas revenir : lecture directe de la clé nue sans cle().
        expect(source).not.toContain("const configurables = await db.get('pratiquesConfigurables')");
    });
});
