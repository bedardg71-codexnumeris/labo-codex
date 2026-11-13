// =======================================================================
// LES LIGNES DU GESTE PROPOSÉES LE 11 NOVEMBRE 2026 (complément de 12 h 05, cinquième aperçu)
// =======================================================================
// Grégoire, 11 h 59 : « Il faut nommer, pointer, passer par les étapes une après l'autre pour bien l'accompagner. »
// Chaque étape NOMME son geste : celles qui n'avaient pas de ligne du geste en reçoivent une. Ces lignes sont lues par
// l'enseignant·e : PROPOSÉES, à valider par Grégoire ; elles partent telles quelles. Le texte des bulles ne change pas.
// Les sentinelles « mot pour mot » des parcours acceptent une ligne du geste qui est dans la consigne OU dans cette liste ;
// sentinelle-gestes-proposes-2026-11-11.test.js vérifie que chacune est posée, telle quelle, dans son parcours.

export const GESTES_PROPOSES = {
    'js/parcours-classe.js': [
        "Remplis les champs obligatoires, puis touche « Créer le trimestre ».",
        "Remplis les champs obligatoires, puis touche « Créer le cours ».",
        "Remplis les champs obligatoires, puis touche « Créer le profil ».",
        "Colle ta liste ou choisis ton fichier, touche « Prévisualiser », puis « Confirmer ».",
        "Remplis les champs obligatoires, puis touche « Créer l'horaire ».",
        "Remplis les champs obligatoires, puis touche « Créer le groupe-cours ».",
        "Touche « D'accord ».",
        "Choisis ton cours, note les absences et les retards, puis touche « Verrouiller la saisie ».",
        "Touche « Terminer ».",
    ],
    'js/parcours-commentaires.js': [
        "Touche « Terminer ».",
    ],
    'js/parcours-cours.js': [
        "Touche « Compétence » dans la palette, puis écris son énoncé.",
        "Touche « Idée maîtresse », écris-la, puis tire un trait de ta compétence jusqu'à elle.",
        "Touche « Leçon », donne-lui un titre, choisis sa semaine et sa séance, puis tire un trait de ton idée maîtresse jusqu'à elle.",
        "Touche le badge 🎯 de ta leçon, puis écris ton objectif.",
        "Touche « Activité », donne-lui un titre, glisse-la dans ta leçon, touche deux fois sa poignée, puis coche son objectif.",
        "Glisse ton évaluation sous ton activité, par sa poignée ⠿.",
        "Touche « Évaluation », donne-lui un titre, glisse-la dans ta leçon sous ton activité, touche deux fois sa poignée, coche son objectif, puis choisis ta production.",
        "Touche « Terminer ».",
    ],
    'js/parcours-decouvrir.js': [
        "Touche « Continuer ».",
        "Touche « Commencer avec ma classe », ou « Continuer d'explorer la démo ».",
    ],
    'js/parcours-donnees.js': [
        "Touche « Codex », en haut de l'écran.",
        "Touche « Mettre à jour le codex ».",
        "Touche « Mettre à jour », puis range ton fichier dans un lieu protégé.",
        "Touche « Terminer ».",
    ],
    // Lot « La carte d'aide dans Apporter mon matériel » (13 nov. 2026) : les lignes de l'accueil et de l'exemple ouvert
    // vivent dans le module que « Ta grille » et la carte de la page appellent toutes deux ; les deux dernières, la sortie
    // de l'exemple dans la page, sont PROPOSÉES ce jour-là.
    'js/materiel-aide.js': [
        "Colle ta grille, montre ce qu'est chaque morceau, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».",
        "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Faire l'exercice soi-même » ou « Passer à ma grille ».",
        "L'exemple est étiqueté : touche « Passer à ma grille ».",
        "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Quitter l'exemple ».",
        "L'exemple est étiqueté : touche « Quitter l'exemple ».",
    ],
    'js/parcours-evaluer.js': [
        "Choisis les points ou les niveaux.",
        // Lot de la dissection sur l'iPad (12 nov. 2026, point 7) : les boutons nommés tels qu'ils sont écrits ; l'exemple,
        // une grille déjà là, Conception › Grilles. PROPOSÉES.
        "Touche « + Nouvelle grille », compose-la, puis touche « Créer la grille » ; ou ouvre une de tes grilles.",
        "Touche « Prendre cette grille » pour évaluer avec la grille ouverte ; ou ouvre-en une autre.",
        "Touche « Voir le travail complet » ou « Faire l'exercice soi-même » ; ou « Passer à ma grille ».",
        "Touche « + Nouvelle production », remplis les champs obligatoires, choisis ta grille, puis touche « Créer la production ».",
        "Écris la date de remise, puis coche « Consignes transmises ».",
        "Touche « Actions › Évaluer » sur sa ligne, choisis un niveau par critère, puis touche « Verrouiller ».",
        "Touche « + Nouvelle pratique », choisis « Partir d'un modèle », puis suis l'assistant jusqu'à « Créer la pratique ».",
        "Choisis ta pratique dans le menu en haut de la page, puis touche « Appliquer au cours actif ».",
        "Touche « Continuer ».",
        "Touche « + Nouvelle cartouche », remplis-la, enregistre-la, puis choisis-la dans la fiche de ta production.",
        "Touche « Actions › Consulter », puis « Déverrouiller » ; écris ton mot, verrouille, puis touche « Terminer ».",
    ],
    'js/parcours-lire-ta-classe.js': [
        "Touche « Continuer ».",
        "Touche « Régler les outils d'observation », puis choisis ta grille dans « Grille de critères pour le dépistage ».",
        "Touche « Terminer ».",
    ],
    'js/parcours-notation-alternative.js': [
        "Touche « Actions › Dossier PDF » sur la ligne de ta production, puis « Continuer ».",
        "Touche « Terminer ».",
    ],
    'js/parcours-recevoir.js': [
        "Dépose leurs fichiers dans la zone, ou touche « Rien à importer ».",
        "Choisis ta production, vérifie chaque fichier, puis touche « Importer » et confirme.",
        "Touche « Actions › Annoter » sur la ligne d'un·e étudiant·e.",
        "Touche l'engrenage de la palette, règle tes tampons, puis touche « Enregistrer ».",
        "Pose tes tampons, puis touche « Annoter ▾ » et choisis « Évaluer ».",
        "Choisis le niveau ou les points de chaque critère.",
        "Touche « Actions › Évaluer » sur sa ligne, puis choisis le niveau ou les points de chaque critère.",
        "Relis sa rétroaction, puis touche le cadenas « Verrouiller ».",
        "Choisis ta production, puis touche « Exporter pour Léa ».",
        "Touche « Terminer ».",
    ],
};

/** Toutes les lignes proposées, sans doublon. */
export const TOUS = [...new Set(Object.values(GESTES_PROPOSES).flat())];
