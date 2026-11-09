// =======================================================================
// UNE ASSIDUITÉ DE 0 % EST UNE DONNÉE — 9 NOVEMBRE 2026 (corrections du septième parcours, point 7)
// =======================================================================
// Décision de Cowork, dans la ligne de #743 (« l'absent total, 0 %, CONNU ») : `aucuneDonneeDeSuivi`
// (js/profil-etudiant-calculs.js) ne compte plus une assiduité de 0 % comme « aucune donnée ». Seule
// l'assiduité INCONNUE (`null`) en est une. Avant, l'élève absent·e à toutes les séances, sans production,
// tombait « En attente de données » : son Accompagnement n'avait ni ses cartes ni « + Nouvelle intervention »,
// alors que le Suivi le signalait (A sous le seuil).
// Ses deux lecteurs (la section Accompagnement du profil, la colonne RàI de la liste) et le septième parcours
// lisent cette seule règle (#1205) : ce banc la juge sur sa source réelle, ses dépendances remplacées.
// Break-test (9 nov.) : la règle remise à `(indices.A === null || indices.A === 0)` → l'essai « 0 % » ROUGE ;
// rétablie → vert.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(racine, 'js/profil-etudiant-calculs.js'), 'utf8');
const FONCTION = tranche(SOURCE, 'function aucuneDonneeDeSuivi(', '\nfunction determinerNiveauRaiPedagogique');

/** La vraie fonction, son seul appel extérieur (le compte des copies, quand C est inconnue) remplacé. */
function regle(nbCopies = 0) {
    // eslint-disable-next-line no-new-func
    return new Function('calculerIndicesNDerniersArtefacts', FONCTION + '\nreturn aucuneDonneeDeSuivi;')(
        () => ({ nbArtefacts: nbCopies })
    );
}

describe('aucuneDonneeDeSuivi : l’assiduité inconnue seule est une absence de donnée', () => {
    it('0 % d’assiduité (absent·e à toutes les séances), sans production, P à 0 : des données (avant : « En attente »)', () => {
        expect(regle()('2109001', { A: 0, C: 0, P: 0 })).toBe(false);
        expect(regle(0)('2109001', { A: 0, C: null, P: 0 })).toBe(false);
    });

    it('assiduité inconnue (`null`), sans production, P à 0 : aucune donnée', () => {
        expect(regle()('2109001', { A: null, C: 0, P: 0 })).toBe(true);
        expect(regle(0)('2109001', { A: null, C: null, P: 0 })).toBe(true);
    });

    it('assiduité inconnue, mais une copie, une complétion ou une performance : des données', () => {
        expect(regle(1)('2109001', { A: null, C: null, P: 0 })).toBe(false);
        expect(regle()('2109001', { A: null, C: 50, P: 0 })).toBe(false);
        expect(regle()('2109001', { A: null, C: 0, P: 62 })).toBe(false);
    });

    it('une assiduité connue, quelle qu’elle soit : des données', () => {
        for (const A of [0, 0.5, 50, 100]) expect(regle()('2109001', { A, C: 0, P: 0 })).toBe(false);
    });
});
