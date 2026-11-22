// =======================================================================
// LES LIGNES DU GESTE PROPOSÉES LE 11 NOVEMBRE 2026 (complément de 12 h 05, cinquième aperçu)
// =======================================================================
// Grégoire, 11 h 59 : « Il faut nommer, pointer, passer par les étapes une après l'autre pour bien l'accompagner. »
// Chaque étape NOMME son geste : celles qui n'avaient pas de ligne du geste en reçoivent une. Ces lignes sont lues par
// l'enseignant·e : PROPOSÉES, à valider par Grégoire ; elles partent telles quelles. Le texte des bulles ne change pas.
// Les sentinelles « mot pour mot » des parcours acceptent une ligne du geste qui est dans la consigne OU dans cette liste ;
// sentinelle-gestes-proposes-2026-11-11.test.js vérifie que chacune est posée, telle quelle, dans son parcours.

export const GESTES_PROPOSES = {
    // « Mettre ta classe en place » n'a plus de ligne du geste à part (14 nov. 2026, essai novice) : chaque bulle est
    // une liste de lignes, la consigne en dernier, et toutes viennent de plans de travail/CONSIGNE-2026-11-14-essai-novice.md
    // (sentinelle-parcours-classe-2026-11-09.test.js, qui nomme aussi ce que la session a écrit).
    'js/parcours-commentaires.js': [
        "Touche « Terminer ».",
    ],
    // js/parcours-cours.js n'a plus de geste proposé : ses sept bulles sont celles du 19 nov. 2026, réécrites avec
    // Grégoire (« Nous faisons », sentinelle-parcours-cours-2026-11-09.test.js).
    // js/parcours-decouvrir.js n'a plus de geste proposé : ses huit bulles sont celles du 16 nov. 2026, réécrites
    // avec Grégoire (sentinelle-parcours-je-regarde-2026-11-16.test.js).
    // js/parcours-donnees.js n'a plus de geste proposé : ses bulles sont celles du 19 nov. 2026, réécrites avec Grégoire
    // (« Nous faisons », sentinelle-parcours-donnees-2026-11-09.test.js, confrontée à CONSIGNE-2026-11-19-nous-faisons-donnees.md).
    // Lot « La carte d'aide dans Apporter mon matériel » (13 nov. 2026) : les lignes de l'accueil et de l'exemple ouvert
    // vivent dans le module que « Ta grille » et la carte de la page appellent toutes deux ; les deux dernières, la sortie
    // de l'exemple dans la page, sont PROPOSÉES ce jour-là.
    'js/materiel-aide.js': [
        "Colle ta grille, montre ce qu'est chaque partie, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».",
        // 14 nov. 2026 (essai novice, lot 4c) : la carte du parcours n'offre plus l'exemple ; les deux lignes qui nommaient
        // sa sortie dans la carte (« Passer à ma grille ») sont parties avec elle.
        "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Quitter l'exemple ».",
        "L'exemple est étiqueté : touche « Quitter l'exemple ».",
    ],
    // js/parcours-evaluer.js n'a plus de geste proposé : son « Nous faisons » est celui du 20 nov. 2026, réécrit avec
    // Grégoire (dix bulles en lignes, sentinelle-parcours-evaluer-2026-11-09.test.js, confrontée à
    // CONSIGNE-2026-11-20-essai-parcours.md) ; les onze lignes proposées les 11 et 12 nov. sont parties avec l'ancienne
    // Pratique guidée.
    // js/parcours-lire-ta-classe.js n'a plus de geste proposé : ses deux temps sont ceux du 22 nov. 2026, écrits avec
    // Grégoire (sentinelle-parcours-lire-ta-classe-2026-11-22.test.js, confrontée à
    // CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 3).
    'js/parcours-notation-alternative.js': [
        "Touche « Actions › Dossier PDF » sur la ligne de ta production, puis « Continuer ».",
        "Touche « Terminer ».",
    ],
    // js/parcours-recevoir.js n'a plus de geste proposé : ses bulles sont celles du 19 nov. 2026, réécrites avec Grégoire
    // (« Nous faisons », sentinelle-parcours-recevoir-2026-11-09.test.js, confrontée à CONSIGNE-2026-11-19-nous-faisons-recevoir.md).
};

/** Toutes les lignes proposées, sans doublon. */
export const TOUS = [...new Set(Object.values(GESTES_PROPOSES).flat())];
