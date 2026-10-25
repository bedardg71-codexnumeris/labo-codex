import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

// Retour terrain du 22 août 2026 — « ajouter à ma sélection » paraissait sans
// effet. La section « disponibles » des productions excluait par `id` NU, alors
// que l'ajout crée une COPIE avec un id neuf (`idOriginal` garde l'ancien).
//
// grilles.js, echelles.js et cartouches.js testaient déjà l'identité : cette
// sentinelle verrouille l'alignement des quatre bibliothèques, pour que
// productions ne redevienne pas l'exception.

describe('bibliothèques · l\'appartenance se teste sur l\'IDENTITÉ, pas sur l\'id nu', () => {
    it('productions : la sélection est indexée par id ET par idOriginal', () => {
        const js = lire('js/productions-bibliotheque-ui.js');

        expect(js, 'l\'index d\'identités a disparu').toContain('identitesEnSelection');
        expect(js).toMatch(/identitesEnSelection\.add\(p\.id\)/);
        expect(js).toMatch(/identitesEnSelection\.add\(p\.idOriginal\)/);
        expect(js, 'l\'item de bibliothèque doit être écarté par son idOriginal aussi')
            .toMatch(/prod\.idOriginal && identitesEnSelection\.has\(prod\.idOriginal\)/);
    });

    it('productions : l\'exclusion par id NU ne revient pas', () => {
        const js = lire('js/productions-bibliotheque-ui.js');
        expect(
            js,
            'Retour de l\'exclusion par id nu : la copie ayant un id neuf, l\'original resterait listé.'
        ).not.toMatch(/productionsDansSelection\.find\(p => p\.id === prod\.id\)/);
    });

    it('les trois autres bibliothèques gardent leur test d\'identité', () => {
        // #1154 (verdict du 25 oct., § 5.2) : grilles.js porte la relation dans `grilleLieeAExemplaire`,
        // lue par les deux colonnes ; la rangée de la bibliothèque doit encore passer par elle.
        const grilles = lire('js/grilles.js');
        expect(grilles).toMatch(/grille\.id === exemplaire\.id \|\| grille\.idOriginal === exemplaire\.id/);
        expect(grilles).toMatch(/grilles\.some\(g => grilleLieeAExemplaire\(g, grille\)/);
        expect(lire('js/echelles.js')).toMatch(/e\.id === echelle\.id \|\| e\.idOriginal === echelle\.id/);
        expect(lire('js/cartouches.js')).toMatch(/c\.id === cartouche\.id \|\| c\.idOriginal === cartouche\.id/);
    });
});
