import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #810 — « Niveau SOLO » désignait DEUX objets sous le même mot : la complexité
// qu'un critère EXIGE (grille) et le palier qu'un élève ATTEINT (échelle).
// Grégoire s'est trompé sur son propre critère Structure, la fiche d'aide
// ouverte à trois centimètres : ce n'était pas un manque d'explication, c'était
// une erreur de nom. Correctif arrêté le 9 sept. 2026 : RENOMMER, PAS EXPLIQUER.
//
// ⚠ CE QUI EST GARDÉ ICI EST L'INVARIANT, PAS LE NOMBRE DE SITES : aucune
// étiquette de champ, dans l'un ou l'autre éditeur, ne doit dire « Niveau SOLO »
// nu. Un troisième éditeur qui naîtrait avec l'ancien libellé ferait rougir ce
// cas, ce qu'une simple égalité « deux fois ici, deux fois là » ne ferait pas.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

const grillesJs = lire('js/grilles.js');
const echellesJs = lire('js/echelles.js');

// Le texte d'une étiquette de champ, c'est-à-dire ce qui suit l'ouverture d'un
// <label …> jusqu'au premier < : « <label style="…">Niveau SOLO\n <span… ».
const etiquettes = (source) =>
    [...source.matchAll(/<label\b[^>]*>([^<]+)/g)].map((m) => m[1].trim());

describe('#810 · deux noms distincts pour deux objets distincts', () => {
    it('l\'éditeur de grilles nomme la COMPLEXITÉ EXIGÉE, à ses deux sites', () => {
        const posees = grillesJs.split('Complexité SOLO du critère').length - 1;
        expect(posees).toBe(2); // création ET édition — n'en corriger qu'un laisserait la moitié de la confusion
    });

    it('l\'éditeur d\'échelles nomme le PALIER ATTEINT, à ses deux sites', () => {
        const posees = echellesJs.split('Palier SOLO du niveau').length - 1;
        expect(posees).toBe(2); // échelle en cours de création ET échelle enregistrée
    });

    it('aucune étiquette de champ des deux éditeurs ne dit plus « Niveau SOLO » nu', () => {
        const fautives = [...etiquettes(grillesJs), ...etiquettes(echellesJs)]
            .filter((t) => /^Niveau\s+SOLO\b/.test(t));
        expect(fautives).toEqual([]);
    });

    it('LE CHAMP DE DONNÉE NE CHANGE PAS DE NOM — c\'est l\'affichage qu\'on corrige', () => {
        // Renommer `niveauSOLO` casserait les grilles et les échelles déjà
        // enregistrées chez les utilisateurs. Les deux éditeurs continuent
        // d'écrire dans le même champ.
        expect(grillesJs).toContain('data-champ="niveauSOLO"');
        expect(echellesJs).toContain('data-champ="niveauSOLO"');
    });

    it('la fiche d\'aide du champ de grille reste branchée (on n\'a rien expliqué de plus)', () => {
        // ⛔ Décision : ne PAS ajouter de texte d'explication. La fiche existante
        // disait déjà la bonne chose ; c'est le nom qui manquait.
        const branchees = grillesJs.split('data-target="grille-niveau-solo"').length - 1;
        expect(branchees).toBe(2);
    });
});
