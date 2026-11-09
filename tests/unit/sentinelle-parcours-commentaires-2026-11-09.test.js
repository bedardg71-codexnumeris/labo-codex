// =======================================================================
// LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » — 9 NOVEMBRE 2026 : LES MOTS
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md.
//   1. Les onze bulles (et la variante sans fichier de l'étape 10) sont celles que Grégoire a
//      validées une à une le 8 nov. (17 h 13 à 17 h 38) : chaque titre, texte et geste se trouve
//      TEL QUEL dans la consigne. Un mot changé dans le code, et ce banc rougit.
//   2. Le panneau : le titre, la ligne et le refus sans production avec sa grille, mot pour mot.
//   3. Les boutons des bulles : « Continuer », « Rien à importer », « Terminer » ; « Plus tard »
//      comme lien de sortie, comme les autres parcours chez soi.
// La lecture de la consigne passe par les marqueurs « Étape n, « titre » », « Texte : « … » » et
// « Geste : « … » » : un texte du code qui n'y est pas tel quel n'a pas été validé.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md');
const PARCOURS = lire('js/parcours-commentaires.js');

/** Les chaînes d'un champ dans un bloc (TEXTES pour les bulles, ETAPES pour les boutons), guillemets simples ou doubles. */
function chaines(source, champ, debut = 'var TEXTES = {', fin = 'var ETAPES = {') {
    const bloc = tranche(source, debut, fin);
    const re = new RegExp(champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    return [...bloc.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"'));
}

describe('« Automatiser tes commentaires » : les bulles, mot pour mot', () => {
    const titres = chaines(PARCOURS, 'titre');
    const textes = chaines(PARCOURS, 'texte');
    const gestes = chaines(PARCOURS, 'geste');

    it('douze bulles (les onze étapes et la variante sans fichier de l’étape 10), douze textes ; onze gestes (l’étape 11 n’en a pas)', () => {
        expect(titres).toHaveLength(12);
        expect(textes).toHaveLength(12);
        expect(gestes).toHaveLength(11);
    });

    it('les titres sont ceux de la consigne, dans l’ordre des onze étapes (la variante reprend celui de l’étape 10)', () => {
        const attendus = titres.map((t) => t);
        const ordre = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11];
        ordre.forEach((n, i) => {
            expect(CONSIGNE, 'étape ' + n).toContain(`Étape ${n}, « ${attendus[i]} »`);
        });
    });

    it.each(textes.map((t, i) => [i + 1, t]))('bulle %i : le texte est celui de la consigne', (n, texte) => {
        expect(CONSIGNE).toContain(`Texte : « ${texte} »`);
    });

    it.each(gestes.map((g) => [g]))('le geste « %s » est celui de la consigne', (geste) => {
        expect(CONSIGNE).toContain(`Geste : « ${geste} »`);
    });

    it('chaque texte et chaque geste de la consigne est posé : rien n’est oublié', () => {
        const textesConsigne = [...CONSIGNE.matchAll(/Texte : « (.*?) » Geste :|Texte : « (.*?) » Bouton/g)].map((m) => m[1] ?? m[2]);
        expect(textesConsigne).toHaveLength(12);
        expect([...textes].sort()).toEqual([...textesConsigne].sort());
    });

    it('les boutons des bulles : « Continuer » (étapes 3 à 6), « Rien à importer » (étape 8), « Terminer » (étape 11)', () => {
        expect(chaines(PARCOURS, 'libelle', 'var ETAPES = {', 'var DEF = ').sort()).toEqual(['Continuer', 'Continuer', 'Continuer', 'Continuer', 'Rien à importer', 'Terminer'].sort());
        expect(CONSIGNE).toContain('« Rien à importer » est un bouton de la bulle');
        expect(CONSIGNE).toContain('Bouton « Terminer »');
    });

    it('le lien de sortie : « Plus tard », comme les autres parcours chez soi', () => {
        expect(PARCOURS).toContain("lienSortie: 'Plus tard'");
    });
});

describe('le panneau : titre, ligne et refus, mot pour mot', () => {
    it('le titre et la ligne', () => {
        expect(PARCOURS).toContain("titre: 'Automatiser tes commentaires'");
        const ligne = "De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.";
        expect(PARCOURS).toContain(ligne);
        expect(CONSIGNE).toContain(`Ligne : « ${ligne} »`);
    });

    it('le refus sans production avec sa grille', () => {
        const refus = 'Commence par « Évaluer une première production » : il te faut une production et sa grille pour automatiser tes commentaires.';
        expect(PARCOURS).toContain(refus);
        expect(CONSIGNE).toContain(`le panneau dit : « ${refus} »`);
    });

    it('le parcours s’inscrit après « Mettre ta classe en place » dans index.html (le huitième, quand les autres viendront)', () => {
        const index = lire('index.html');
        const classe = index.indexOf('js/parcours-classe.js');
        const huitieme = index.indexOf('js/parcours-commentaires.js');
        expect(classe).toBeGreaterThan(-1);
        expect(huitieme).toBeGreaterThan(classe);
    });
});
