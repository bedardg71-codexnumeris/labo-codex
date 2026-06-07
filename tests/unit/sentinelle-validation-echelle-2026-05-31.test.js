import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Bug terrain 31 mai 2026 (#126, Grégoire) — volet « échelle » :
// Les pratiques créées au wizard échouaient à l'instanciation avec « Champ
// obligatoire manquant : echelle » car valider() exigeait une échelle pour TOUTES
// les familles. Or le Sommatif (moyenne pondérée) et les Spécifications (seuils) ne
// consomment pas d'échelle IDME. Décision Grégoire : forcer le choix d'échelle au
// wizard pour PAN-Standards, assouplir la validation pour SOM/SPE.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const win = chargerScript('js/pratiques/pratique-configurable.js', {
    db: { getSync: (c, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} },
    cle: (k) => k
});
const PratiqueConfigurable = win.PratiqueConfigurable;

const ECHELLE_IDME = {
    type: 'niveaux',
    niveaux: [{ code: 'M', valeur_pourcentage: 80, ordre: 1 }]
};

describe('Bug #126 · valider() rend l\'échelle conditionnelle à la méthode de calcul', () => {
    it('accepte une pratique SOMMATIVE (moyenne_ponderee) SANS échelle', () => {
        expect(() => new PratiqueConfigurable({
            id: 'p1', nom: 'Test SOM', calcul_note: { methode: 'moyenne_ponderee' }
        })).not.toThrow();
    });

    it('accepte une pratique SPÉCIFICATIONS (specifications) SANS échelle', () => {
        expect(() => new PratiqueConfigurable({
            id: 'p2', nom: 'Test SPE', calcul_note: { methode: 'specifications' }
        })).not.toThrow();
    });

    it('REJETTE une pratique PAN-Standards (conversion_niveaux) SANS échelle', () => {
        expect(() => new PratiqueConfigurable({
            id: 'p3', nom: 'Test STD', calcul_note: { methode: 'conversion_niveaux' }
        })).toThrow(/echelle/);
    });

    it('accepte une PAN-Standards AVEC échelle', () => {
        expect(() => new PratiqueConfigurable({
            id: 'p4', nom: 'Test STD', calcul_note: { methode: 'conversion_niveaux' }, echelle: ECHELLE_IDME
        })).not.toThrow();
    });

    it('exige toujours id, nom et calcul_note', () => {
        expect(() => new PratiqueConfigurable({ nom: 'x', calcul_note: { methode: 'moyenne_ponderee' } })).toThrow(/id/);
        expect(() => new PratiqueConfigurable({ id: 'x', calcul_note: { methode: 'moyenne_ponderee' } })).toThrow(/nom/);
        expect(() => new PratiqueConfigurable({ id: 'x', nom: 'y' })).toThrow(/calcul_note/);
    });

    it('vérifie encore la cohérence d\'une échelle « niveaux » présente sans niveaux', () => {
        expect(() => new PratiqueConfigurable({
            id: 'p5', nom: 'z', calcul_note: { methode: 'conversion_niveaux' }, echelle: { type: 'niveaux' }
        })).toThrow(/niveaux/);
    });
});

describe('Bug #126 · le wizard pose une méthode de calcul par famille + bloque STD sans échelle', () => {
    const wizard = readFileSync(path.join(racineProjet, 'js', 'wizard-pratique-v2.js'), 'utf8');

    it('pose moyenne_ponderee / specifications / conversion_niveaux selon la famille', () => {
        expect(wizard).toMatch(/methode:\s*'moyenne_ponderee'/);
        expect(wizard).toMatch(/methode:\s*'specifications'/);
        expect(wizard).toMatch(/'pan_par_objectif'\s*:\s*'conversion_niveaux'/);
    });

    it('bloque la création d\'une PAN-Standards sans echelleId', () => {
        // #319 Lot 1 : vocabulaire interne canonique ('standards', plus 'pan-standards').
        expect(wizard).toMatch(/typeFinal === 'standards' && !r\.echelleId/);
    });

    it('rafraîchit le select d\'assemblage après création (régression select)', () => {
        expect(wizard).toMatch(/populerDropdownsAssemblageV2\(\)/);
    });
});
