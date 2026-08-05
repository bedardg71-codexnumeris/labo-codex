import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLES — #383 + #384 + #385 (audit qualité 5 août 2026, rapports A2/A3/A4)
//
// #383 : cocher « Cartouches » dans l'import sélectif n'importait JAMAIS rien —
// la modale génère des ids AGRÉGÉS (`cartouches_0`…) que le filtre comparait
// aux ids INDIVIDUELS des cartouches. Verrou : la modale porte désormais
// data-item-id = clé réelle `cartouches_<grilleId>` et le filtre est PAR CLÉ.
//
// #384 : export ZIP et restauration ne traitaient qu'UNE clé fichiersTravaux
// (`find`) — backup multi-trimestre sans les blobs des autres trimestres,
// perte découverte à la restauration. Verrou : boucle sur TOUTES les clés.
//
// #385 : les blobs restaurés du ZIP entraient dans le store SANS
// validerMagicBytes, alors que le chemin codex (codex.js) a le garde.
// Règle CLAUDE.md : magic bytes sur TOUT blob importé.
//
// Sentinelles source-level (le couplage modale/FileReader/JSZip rend le
// fonctionnel disproportionné) — break-testées par réintroduction de chaque
// ancien motif.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

describe('#383 · import sélectif des cartouches par clé de grille', () => {
    it('la modale porte la clé réelle en data-item-id', () => {
        expect(source).toMatch(/id: 'cartouches_' \+ c\.grilleId/);
    });

    it('le filtre d\'import est PAR CLÉ (selectedIds contient des clés cartouches_<grilleId>)', () => {
        expect(source).toMatch(/cle\.startsWith\('cartouches_'\) && selectedIds\.includes\(cle\)/);
    });

    it('ne réintroduit pas le filtre par id individuel (jamais matché par les ids agrégés)', () => {
        expect(source).not.toMatch(/selectedIds\.includes\(c\.id\)/);
    });
});

describe('#384 · blobs travaux de TOUTES les clés fichiersTravaux', () => {
    it('l\'export ZIP boucle sur toutes les clés sélectionnées', () => {
        expect(source).toMatch(/clesSelectionnees\.filter\(c => c\.includes\('fichiersTravaux'\)\)/);
        expect(source).not.toMatch(/clesSelectionnees\.find\(c => c\.includes\('fichiersTravaux'\)\)/);
    });

    it('la restauration boucle sur toutes les clés du fichier', () => {
        expect(source).toMatch(/Object\.keys\(donnees\)\.filter\(c => c\.includes\('fichiersTravaux'\)\)/);
        expect(source).not.toMatch(/Object\.keys\(donnees\)\.find\(c => c\.includes\('fichiersTravaux'\)\)/);
    });
});

describe('#385 · magic bytes sur les blobs restaurés du ZIP', () => {
    it('_restaurerBlobsDepuisZip valide les magic bytes AVANT stockerBlob (patron codex)', () => {
        expect(source).toMatch(/validerMagicBytes\(blob\)[\s\S]{0,400}stockerBlob\(f\.id, blob/);
    });

    it('un blob refusé est sauté (continue), pas stocké', () => {
        expect(source).toMatch(/Blob refusé \(magic bytes invalides\)[\s\S]{0,120}continue;/);
    });
});
