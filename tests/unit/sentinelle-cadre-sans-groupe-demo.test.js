import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LE CADRE NE MONTRE PLUS LE GROUPE « DÉMO » HORS DE LA DÉMO
// (lot « Les deux parcours », partie 2, 9 nov. 2026 ; option a, décidée par Grégoire).
//
// Avant : huit menus de Cadre › Trimestre (cours, horaire, enseignant·e, pratique,
// groupe-cours) ajoutaient, hors de la démo, un groupe grisé « Démo (par Labo Codex –
// à dupliquer pour utiliser) ». La Conception, elle, cache le matériel de la démo
// (`filtrerParModeDemo`). Le Cadre fait maintenant comme elle.
//
//   A — aucun fichier de js/ n'appelle ni ne définit plus `ajouterOptgroupDemo` ;
//   B — le libellé du groupe n'est plus nulle part dans js/, l'Aide comprise ;
//   C — la garde `verifierReferencesPasDemo` reste (elle ne dépend pas du menu).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const fichiersJs = readdirSync(path.join(racine, 'js'), { recursive: true })
    .filter((f) => String(f).endsWith('.js'))
    .map((f) => [String(f), readFileSync(path.join(racine, 'js', String(f)), 'utf8')]);

describe('Le Cadre sans groupe « Démo » hors de la démo', () => {
    it('A — plus aucun appel ni définition de ajouterOptgroupDemo dans js/', () => {
        const fautifs = fichiersJs.filter(([, src]) => nettoyer(src).includes('ajouterOptgroupDemo')).map(([f]) => f);
        expect(fautifs).toEqual([]);
    });

    it('B — le libellé « à dupliquer pour utiliser » a disparu de js/, Aide comprise', () => {
        const fautifs = fichiersJs.filter(([, src]) => nettoyer(src).includes('à dupliquer pour utiliser')).map(([f]) => f);
        expect(fautifs).toEqual([]);
    });

    it('C — la garde verifierReferencesPasDemo est toujours définie', () => {
        const biblio = nettoyer(readFileSync(path.join(racine, 'js', 'bibliotheque-ui.js'), 'utf8'));
        expect(biblio).toContain('BibliothequeUI.verifierReferencesPasDemo = function');
    });
});
