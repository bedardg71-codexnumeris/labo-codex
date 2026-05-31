import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Bug terrain 31 mai 2026 (Grégoire, beta 99.84) — deux causes indépendantes
// remontées par le même rapport :
//   (b) « Pratique "pan-standards" non disponible dans le registre » (×6) →
//       obtenirPratiqueParId résolvait la valeur LEGACY brute du SSOT, qui ne
//       résout plus depuis A-1 (instances enregistrées sous l'id canonique).
//       Conséquence : indices C/P non calculés au changement de trimestre.
//   (a) Modale « Erreur lors de l'application de la configuration » → les wrappers
//       main.js lisaient window.pratiqueEnEditionMateriel, un SNAPSHOT figé à null.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const dbStub = {
    get: async () => null,
    getSync: (c, d) => (d !== undefined ? d : null),
    set: async () => {},
    setSync: () => {}
};

function instancePratiqueStub(id) {
    const noop = () => ({});
    return {
        obtenirNom: () => id,
        obtenirId: () => id,
        obtenirDescription: () => '',
        calculerPerformance: noop,
        calculerCompletion: noop,
        detecterDefis: () => [],
        identifierPattern: noop,
        genererCibleIntervention: noop
    };
}

describe('Bug 31 mai (b) · obtenirPratiqueParId normalise au point de résolution', () => {
    let win;
    let instanceStandards;

    beforeEach(() => {
        win = chargerScript('js/pratiques/pratique-registre.js', { db: dbStub, cle: (k) => k });
        instanceStandards = instancePratiqueStub('standards');
        win.enregistrerPratique('standards', instanceStandards);
    });

    it('résout une valeur LEGACY (pan-standards) vers l\'instance canonique', () => {
        // C'est exactement le cas terrain : SSOT non migré = pan-standards.
        expect(win.obtenirPratiqueParId('pan-standards')).toBe(instanceStandards);
    });

    it('résout l\'id canonique direct (standards)', () => {
        expect(win.obtenirPratiqueParId('standards')).toBe(instanceStandards);
    });

    it('ne route PAS une pratique configurable absente (pan-standards-bedard) vers le registre', () => {
        // Absente de la table de normalisation ET des configurables → null,
        // sans capturer l'instance Standards codée en dur.
        expect(win.obtenirPratiqueParId('pan-standards-bedard')).toBeNull();
    });
});

describe('Bug 31 mai (a) · accesseur vivant de la pratique en édition (anti-snapshot)', () => {
    const gestion = readFileSync(path.join(racineProjet, 'js', 'pratiques-gestion.js'), 'utf8');
    const main = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');

    it('pratiques-gestion expose un getter de closure, pas une valeur figée', () => {
        expect(gestion).toMatch(/window\.obtenirPratiqueEnEditionMateriel\s*=\s*function/);
    });

    it('le snapshot figé window.pratiqueEnEditionMateriel = … ne réapparaît pas (régression)', () => {
        expect(gestion).not.toMatch(/window\.pratiqueEnEditionMateriel\s*=/);
    });

    it('les wrappers main.js lisent l\'id via le getter vivant', () => {
        expect(main).toMatch(/obtenirPratiqueEnEditionMateriel\(\)/);
        // L'ancien pattern cassé (lecture directe de l'identifiant nu) est parti.
        expect(main).not.toMatch(/typeof pratiqueEnEditionMateriel !== 'undefined'/);
    });
});
