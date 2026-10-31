import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle statique — #1124 (20 octobre 2026), la gomme est retirée.
// Grégoire, sur l'iPad : « la gomme n'efface pas les traits non plus ». Elle n'effaçait que le
// surligneur depuis le 21 février ; l'outil Sélection puis la corbeille effacent tout. Décision :
// retirer la gomme, garder la corbeille où elle est (en haut de la palette Annotation).
// Verrouille le retrait (zéro-dette : ni outil, ni raccourci, ni branche, ni icône, ni aide).
// Stock assumé : un raccourci « gomme » déjà enregistré chez quelqu'un ne mène plus à rien
// (activerItemParId rend false) ; il n'est pas réécrit.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#1124 · la gomme est retirée', () => {
    it('aucun module d\'annotation ne la nomme', () => {
        for (const f of ['js/travaux-outils.js', 'js/travaux-annotation.js']) {
            expect(lire(f), f).not.toMatch(/gomme|effacerTraitAuContact|icon-eraser/i);
        }
    });
    it('son icône et sa ligne d\'aide sont parties', () => {
        expect(existsSync(path.join(racine, 'icons', 'icon-eraser.svg'))).toBe(false);
        expect(lire('index.html')).not.toContain('<strong>Gomme</strong>');
    });
    // Réancré le 31 oct. 2026 (consigne des palettes, partie C) : la corbeille est dans la bande Annuler | Supprimer | Rétablir, au milieu.
    it('la corbeille reste en haut de la palette Annotation, entre Annuler et Rétablir', () => {
        const source = lire('js/travaux-outils.js');
        const annuler = source.indexOf('id="travaux-btn-undo"');
        const corbeille = source.indexOf('id="travaux-btn-supprimer" class="btn btn-secondaire btn-tres-compact btn-icon-compact" data-action="travauxAnnotation.supprimerSelection"');
        const retablir = source.indexOf('id="travaux-btn-redo"');
        expect(annuler).toBeGreaterThan(-1);
        expect(corbeille).toBeGreaterThan(annuler);
        expect(retablir).toBeGreaterThan(corbeille);
    });
});
