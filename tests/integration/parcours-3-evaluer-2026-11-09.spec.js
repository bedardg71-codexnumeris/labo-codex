import { test } from '@playwright/test';
import { leParcoursEntier } from './harness/parcours-3-de-banc.js';

// =======================================================================
// LE TROISIÈME PARCOURS, « ÉVALUER UNE PREMIÈRE PRODUCTION » (9 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md. Ce banc juge, en faisant les gestes
// eux-mêmes, depuis un espace où le deuxième parcours est fait (harness/classe-de-banc.js ; les gestes du
// troisième, étape par étape, sont dans harness/parcours-3-de-banc.js, que le banc du quatrième rejoue) :
//   · le panneau dans ses états : sans classe (le bouton ne lance rien, la phrase validée le dit), à faire,
//     en cours (« Étape 3 sur 9 », « Reprendre »), fait (« Refaire ») ; le compte du menu passe à trois ;
//   · les neuf étapes, une fois avec une grille à niveaux, une fois avec une grille en points (la bulle du
//     choix comprise), la production évaluée sur papier (« Actions › Évaluer », sans fichier) ;
//   · « Plus tard » puis « Reprendre » à l'étape 3, après un rechargement ;
//   · chaque étape n'avance que sur la donnée enregistrée ;
//   · LE DÉFAUT DE LA CONSIGNE : sur une grille en points, la cartouche choisie ajoute le commentaire de son
//     palier (avant le correctif, la rétroaction ne portait que « Critère 1 (…) — 4 / 5 »).
//     Break-test (9 nov.) : l'appel à `_adopterEchelleDeLaCartouche` retiré de js/evaluation-chargement.js →
//     ROUGE ici (le commentaire de la cartouche absent de la rétroaction, essai « en points »).
//   · L'ÉCHELLE (Grégoire, 9 nov., 13 h 37) : à l'étape 2, la production reçoit l'échelle de sa grille à niveaux (le
//     contour passe par le menu « Échelle ») ; la bulle ne couvre jamais les menus « Grille » ni « Échelle » de la
//     fiche ; à l'étape 4, l'écran ne la redemande plus. Laissée vide quand même (troisième essai), le contour se pose
//     sur le menu de l'échelle de l'évaluation, sans mot de plus.
//   · UN SECOND DÉFAUT, SUR CE CHEMIN-LÀ (mesuré ici le 9 nov.) : une grille à niveaux, une production qui ne nomme
//     pas d'échelle, deux échelles au trimestre → « Choisis maintenant une échelle de performance » ; choisie, elle ne
//     faisait pas paraître les critères. Break-test (9 nov.) : le correctif de `changerEchelleEvaluation`
//     (js/evaluation.js) neutralisé → ROUGE ici (aucun critère, essai « échelle laissée vide »).
//   · L'ESSAI EN POINTS SE JOUE D'UNE TRAITE (relecture neuve du 9 nov.) : sans rechargement, l'échelle de départ doit
//     exister à l'étape 8. Break-test (9 nov.) : le semis du premier trimestre (js/trimestre-v2-init.js) neutralisé →
//     ROUGE ici (étape 8, aucune échelle pour la cartouche).
// Les captures pour Grégoire : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-3-evaluer
// ⚠ Cloud du 9 nov. : ce banc a tourné sous Chromium (playwright.chromium.config.js) ; le verdict WebKit se
// prend sur le Mac.

test('« Évaluer une première production », grille à niveaux : le panneau, les neuf étapes, « Plus tard » et « Reprendre » à l’étape 3 (1180 px)', async ({ page }) => {
    await leParcoursEntier(page, { niveaux: true, cap: '1180-sombre-niveaux' });
});

test('« Évaluer une première production », grille à niveaux, l’échelle laissée vide sur la fiche : l’étape 4 la demande, le contour s’y pose (1180 px)', async ({ page }) => {
    await leParcoursEntier(page, { niveaux: true, echelleVide: true, cap: '1180-sombre-echelle-vide' });
});

test('« Évaluer une première production », étape 8 à 820 px (l’iPad en portrait) : le menu « Cartouche de rétroaction » amené dans la vue, la bulle à côté', async ({ page }) => {
    await leParcoursEntier(page, { niveaux: true, cap: '820-sombre-niveaux', fenetreEtape8: { width: 820, height: 1180 } });
});

test('« Évaluer une première production », grille en points : la bulle du choix, et la cartouche ajoute le commentaire de son palier (1180 px)', async ({ page }) => {
    await leParcoursEntier(page, { niveaux: false, cap: '1180-sombre-points' });
});
