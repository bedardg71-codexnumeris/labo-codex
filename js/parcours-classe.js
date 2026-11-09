/* =================================================================
   LE PARCOURS « METTRE TA CLASSE EN PLACE » (lot « Les deux parcours », 8 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 2 ; esquisses 71 et 72.

   ⏳ PARTIE 1 SEULEMENT : le parcours s'inscrit au panneau (son titre, sa ligne, ses huit
   étapes) pour que Grégoire juge le panneau tel qu'il sera. Ses étapes viennent avec la
   partie 2, après son jugement des captures ; d'ici là, « Commencer » ouvre Cadre › Trimestre
   comme la carte enseignant de l'accueil (commencerParLeTrimestre). Ce lancement provisoire
   part avec la partie 2, dans ce même lot.
   ================================================================= */
(function () {
    'use strict';

    window.Assistance.enregistrer({
        id: 'classe',
        titre: 'Mettre ta classe en place',
        ligne: "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil.",
        total: 8,
        lancer: function () {
            if (typeof window.commencerParLeTrimestre === 'function') window.commencerParLeTrimestre();
        }
    });
})();
