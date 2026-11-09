// =======================================================================
// LE SEPTIÈME PARCOURS, « LIRE TA CLASSE ET INTERVENIR » — 9 NOVEMBRE 2026 : LES MOTS
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md.
//   1. Les neuf bulles sont celles que Grégoire a validées une à une le 8 nov. (15 h 51 à 16 h 27) :
//      chaque titre, texte et geste se trouve TEL QUEL dans la consigne. Un mot changé, et ce banc rougit.
//   2. Le titre et la ligne du panneau, et les deux refus validés, sont ceux de la consigne.
//   3. Les refus démo, service, RàI, ACP, anonymisation, et la phrase de l'étape 2 sur une personne sans
//      donnée : proposés dans la nuit, VALIDÉS par Grégoire le 9 nov. (9 h 37 à 9 h 39). Ils ne sont pas dans
//      la consigne : ce banc les porte tels qu'il les a validés, et les exige mot pour mot dans le code.
//   4. Le lien de sortie est « Plus tard », celui des parcours chez soi (consigne « Les deux parcours »).
// Break-test (9 nov.) : « avant chaque cours » changé en « avant chaque séance » dans le texte de
// l'étape 1 de js/parcours-lire-ta-classe.js → ROUGE (bloc 1), rétabli → vert.
// Break-test (9 nov., corrections) : « reviens au mode normal » changé en « reviens en mode normal » dans
// le refus de l'anonymisation → ROUGE (bloc 3), rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md');
const CONSIGNE_PARCOURS_1_ET_2 = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md');
const SOURCE = lire('js/parcours-lire-ta-classe.js');

/** Les chaînes d'un champ (titre, texte, geste, libelle) dans un bloc, guillemets simples ou doubles. */
function chaines(bloc, champ) {
    const re = new RegExp(champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    return [...bloc.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'"));
}

const ETAPES = tranche(SOURCE, 'var ETAPES = [', 'var DEF = ');
const REFUS = tranche(SOURCE, 'var REFUS = {', '};');
const REFUS_9_NOV = tranche(SOURCE, 'var REFUS_9_NOV = {', '};');

describe('les neuf bulles, mot pour mot', () => {
    const titres = chaines(ETAPES, 'titre');
    const textes = chaines(ETAPES, 'texte');
    const gestes = chaines(ETAPES, 'geste');

    it('neuf étapes, neuf titres, neuf textes, cinq gestes (les étapes 4, 5, 8 et 9 n’en ont pas)', () => {
        expect(titres).toHaveLength(9);
        expect(textes).toHaveLength(9);
        expect(gestes).toHaveLength(5);
    });

    it.each(titres.map((t, i) => [i + 1, t]))('étape %i : le titre « %s » est celui de la consigne', (n, titre) => {
        expect(CONSIGNE).toContain(`Étape ${n}, « ${titre} »`);
    });

    it.each(textes.map((t, i) => [i + 1, t]))('étape %i : le texte est celui de la consigne', (n, texte) => {
        expect(CONSIGNE).toContain(`Texte : « ${texte} »`);
    });

    it.each(gestes.map((g) => [g]))('le geste « %s » est celui de la consigne', (geste) => {
        expect(CONSIGNE).toContain(`Geste : « ${geste} »`);
    });

    it('les boutons : « Continuer » (étapes 4 et 8), « Terminer » (étape 9) ; aucun pour sauter l’intervention', () => {
        expect(chaines(ETAPES, 'libelle')).toEqual(['Continuer', 'Continuer', 'Terminer']);
        expect(CONSIGNE).toContain('Bouton « Continuer »');
        expect(CONSIGNE).toContain('Bouton « Terminer »');
        expect(CONSIGNE).toContain('Pas de bouton pour sauter l\'intervention');
    });

    it('le lien de sortie est « Plus tard », celui des parcours chez soi', () => {
        expect(SOURCE).toContain("lienSortie: 'Plus tard'");
        expect(CONSIGNE_PARCOURS_1_ET_2).toContain('Un lien discret « Plus tard » sur chaque bulle sauf la dernière');
        expect(CONSIGNE).toContain('Le lien de sortie de chaque bulle, comme dans les autres parcours chez soi.');
    });
});

describe('le panneau : titre, ligne, refus', () => {
    it('le titre et la ligne du septième parcours', () => {
        const titre = 'Lire ta classe et intervenir';
        const ligne = "Avant chaque cours, voir qui a besoin de toi et de quoi ; puis, si tu le décides, noter une intervention.";
        expect(SOURCE).toContain(`titre: '${titre}'`);
        expect(SOURCE).toContain(ligne);
        expect(CONSIGNE).toContain(`Titre : « ${titre} »`);
        expect(CONSIGNE).toContain(`Ligne : « ${ligne} »`);
    });

    it('les deux refus validés sont ceux de la consigne', () => {
        const refus = chaines(REFUS, '(?:sansPresences|personneSignalee)');
        expect(refus).toHaveLength(2);
        for (const r of refus) expect(CONSIGNE).toContain(`« ${r} »`);
    });

    // Validés par Grégoire le 9 nov. 2026, 9 h 37 à 9 h 39 (relais de Cowork), mot pour mot.
    const VALIDES_9_NOV = {
        anonymisation: 'En mode anonymisation, une intervention ne garde ni son titre ni tes observations : reviens au mode normal pour faire ce parcours.',
        rai: "Ce parcours passe par l'onglet « Accompagnement » du profil : coche « Appliquer une adaptation du modèle de la Réponse à l'intervention » dans Labo › Observation pour le commencer.",
        acp: "Ce parcours passe par l'onglet « Engagement ACP » du profil : coche « Activer la collecte des données sur le contexte d'apprentissage et la performance » dans Labo › Observation pour le commencer.",
        demo: 'Ce parcours se joue sur ta propre classe : quitte la démonstration pour le commencer.',
        service: "Ce parcours se joue sur un groupe-cours : choisis-en un dans l'en-tête pour le commencer.",
        sansDonnee: "Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne."
    };

    it.each(Object.entries(VALIDES_9_NOV))('« %s » : la phrase validée le 9 nov., mot pour mot, dans le bloc REFUS_9_NOV', (cle, phrase) => {
        const posees = chaines(REFUS_9_NOV, cle);
        expect(posees).toEqual([phrase]);
    });

    it('le bloc REFUS_9_NOV porte ces six phrases et rien d’autre ; plus aucune marque « proposé »', () => {
        expect(chaines(REFUS_9_NOV, '\\w+').sort()).toEqual(Object.values(VALIDES_9_NOV).sort());
        expect(SOURCE).not.toMatch(/PROPOS[ÉE]S/);
        expect(SOURCE).not.toMatch(/PAS VALIDÉS/);
    });
});
