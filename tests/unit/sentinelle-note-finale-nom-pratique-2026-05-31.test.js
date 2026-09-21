import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// #127 (31 mai 2026, Grégoire) — demande d'affichage : montrer QUELLE pratique de
// notation produit la note finale de l'élève, près du bouton « Réglages de la
// pratique » (deux pratiques différentes donnent deux notes différentes, sans
// indication de laquelle est appliquée).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

describe('#127 · nom de la pratique active dans le panneau de note finale', () => {
    const actions = lire('js/profil-etudiant-actions.js');
    const affichage = lire('js/profil-etudiant-sections-affichage.js');
    const css = lire('styles.css');

    it('la couche données expose pratiqueNom dans detailsNoteFinale', () => {
        const occ = actions.match(/pratiqueNom:\s*pratiqueNom/g) || [];
        // exposé dans le retour succès ET dans le retour « non calculable »,
        // + dans le récit de calcul C2-a (traçabilité de la fiche du comparateur).
        expect(occ.length).toBe(3);
        // résolu depuis la bibliothèque par id
        // ↻ Lot N1a (21 sept. 2026) : le nom se lit par la désignation du registre (id brut, puis normalisé),
        // la même que celle du calcul — plus par une recherche locale sur l'id brut.
        expect(actions).toMatch(/trouverPratiqueEnBibliotheque\(pratiqueId\)\?\.nom/);
    });

    it('le rendu affiche le nom dans les QUATRE en-têtes (erreur + hybride + classique + sommative, #921)', () => {
        const occurrences = affichage.match(/note-finale-pratique-nom/g) || [];
        expect(occurrences.length).toBe(4);
        // #921 (18 sept. 2026) — la carte d'une sommative lit le nom dans le récit du calcul, échappé lui aussi.
        expect(affichage).toMatch(/echapperHtml\(recit\.pratiqueNom\)/);
        expect(affichage).toMatch(/detailsNoteFinale\.pratiqueNom \|\| detailsNoteFinale\.pratique/);
        // échappé (donnée libre saisie par l'utilisateur)
        expect(affichage).toMatch(/echapperHtml\(detailsNoteFinale\.pratiqueNom \|\| detailsNoteFinale\.pratique\)/);
    });

    it('la classe CSS existe et n\'introduit pas de couleur en dur (variables only)', () => {
        expect(css).toMatch(/\.note-finale-pratique-nom\s*\{/);
        const bloc = tranche(css, '.note-finale-pratique-nom', 300);
        // pas de hex codé en dur dans le bloc (mode sombre/clair via variables)
        expect(bloc).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    });
});
