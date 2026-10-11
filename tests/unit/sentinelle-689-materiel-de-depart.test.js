import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #689 (11 oct. 2026) — les deux fonctions qui sèment le matériel « de départ » (la grille et la
// cartouche que l'écran appelle « de départ ») ne s'appellent plus « Générique ». Les
// IDENTIFIANTS des données semées (`GRILLE_GENERIQUE`, `CART_GENERIQUE`) ne changent pas : ils
// sont dans les données des gens.
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tous = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(path.join(racine, 'js', f), 'utf8')).join('\n');

describe('#689 · le nom suit le matériel « de départ »', () => {
    it('les anciens noms ont disparu de js/', () => {
        expect(tous).not.toMatch(/assurer(Grille|Cartouche)Generique/);
    });
    it('les nouveaux sont définis, et les identifiants de données restent', () => {
        expect(tous).toMatch(/async function assurerGrilleDeDepart\(\)/);
        expect(tous).toMatch(/async function assurerCartoucheDeDepart\(\)/);
        expect(tous).toContain("'GRILLE_GENERIQUE'");
        expect(tous).toContain("'CART_GENERIQUE'");
    });
});
