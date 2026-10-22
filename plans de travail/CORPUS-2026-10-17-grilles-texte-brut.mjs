/* Corpus INVENTÉS de grilles en texte brut (Cowork, 17 oct. 2026) — aucune grille réelle, aucun nom.
 * A : écrit par Cowork avec les règles (complaisant). B et C : écrits à l'aveugle par deux autres agents,
 * sans connaître les règles ; B a servi à corriger le prototype, C est la mesure (5/14 grilles, 43/95 critères).
 * Pour les bancs du lot « texte brut ». Voir PROPOSITION-2026-10-17-lecture-texte-brut.md. */
export const CORPUS_A = {
  'T1 barre en fin de ligne + description': {
    texte: 'Exposé oral – grille d’évaluation\nContenu / 40\nLes idées sont justes et appuyées par des exemples.\nOrganisation / 30\nLe plan est clair ; les transitions guident l’auditoire.\nCommunication / 30\nLe débit et le regard soutiennent le propos.\nTotal : / 100',
    attendu: { nom: 'Exposé oral – grille d’évaluation', criteres: [['Contenu', 40], ['Organisation', 30], ['Communication', 30]], desc: 3, classer: ['total'] }
  },
  'T2 puces Word et points entre parenthèses': {
    texte: 'Rapport de laboratoire\n•\tHypothèse claire et vérifiable (10 pts)\n•\tProtocole détaillé (20 pts)\no\tmatériel énuméré\no\tétapes numérotées\n•\tAnalyse des résultats (40 pts)\n•\tConclusion (20 pts)\n•\tPrésentation et langue (10 pts)\nTotal : 100 points',
    attendu: { nom: 'Rapport de laboratoire', criteres: [['Hypothèse claire et vérifiable', 10], ['Protocole détaillé', 20], ['Analyse des résultats', 40], ['Conclusion', 20], ['Présentation et langue', 10]], sous: 2, classer: ['total'] }
  },
  'T3 points de conduite tapés': {
    texte: 'Critères d’évaluation de l’affiche\nPertinence du sujet ........................ 15\nQualité de la recherche ................... 25\nStructure ................................... 20\nLangue ....................................... 20\nRespect des consignes ..................... 10\nSources ..................................... 10\nTOTAL ...................................... 100',
    attendu: { nom: 'Critères d’évaluation de l’affiche', criteres: [['Pertinence du sujet', 15], ['Qualité de la recherche', 25], ['Structure', 20], ['Langue', 20], ['Respect des consignes', 10], ['Sources', 10]], classer: ['total'] }
  },
  'T4 tabulation de Word (points de conduite de tabulation)': {
    texte: 'Critères d’évaluation de l’affiche\nPertinence du sujet\t15\nQualité de la recherche\t25\nStructure\t20\nLangue\t20\nRespect des consignes\t10\nSources\t10\nTOTAL\t100',
    attendu: { nom: 'Critères d’évaluation de l’affiche', criteres: [['Pertinence du sujet', 15], ['Qualité de la recherche', 25], ['Structure', 20], ['Langue', 20], ['Respect des consignes', 10], ['Sources', 10]], classer: ['total'] }
  },
  'T5 numérotation, parties qui totalisent leurs critères': {
    texte: 'Projet de recherche\n1. Planification (15 points)\na) Question de recherche (5)\nb) Hypothèse (5)\nc) Matériel (5)\n2. Réalisation (60 points)\na) Collecte des données (20)\nb) Traitement (25)\nc) Tableaux et figures (15)\n3. Communication (25 points)\nTotal : 100',
    attendu: { nom: 'Projet de recherche', criteres: [['Question de recherche', 5, 'Planification'], ['Hypothèse', 5, 'Planification'], ['Matériel', 5, 'Planification'], ['Collecte des données', 20, 'Réalisation'], ['Traitement', 25, 'Réalisation'], ['Tableaux et figures', 15, 'Réalisation'], ['Communication', 25]], classer: ['total'] }
  },
  'T6 pourcentages après un tiret': {
    texte: 'Portfolio – critères\nSélection des pièces – 30 %\nRéflexion sur la démarche – 40 %\nPrésentation – 30 %',
    attendu: { nom: 'Portfolio – critères', criteres: [['Sélection des pièces', 30], ['Réflexion sur la démarche', 40], ['Présentation', 30]] }
  },
  'T7 points en tête de ligne': {
    texte: 'Laboratoire 3\n10 pts – Schéma du montage\n20 pts – Mesures et incertitudes\n20 pts – Discussion\nTotal : 50 pts',
    attendu: { nom: 'Laboratoire 3', criteres: [['Schéma du montage', 10], ['Mesures et incertitudes', 20], ['Discussion', 20]], classer: ['total'] }
  },
  'T8 niveaux décrits sous chaque critère, avec points': {
    texte: 'Texte argumentatif\nArgumentation (20 points)\nExcellent (18-20) : la thèse est claire et chaque argument est appuyé.\nBien (14-17) : la thèse est claire ; quelques arguments sont peu appuyés.\nPassable (12-13) : la thèse est floue.\nInsuffisant (0-11) : aucune thèse ne se dégage.\nOrganisation (10 points)\nExcellent (9-10) : le plan est limpide.\nBien (7-8) : le plan est clair.\nPassable (6) : le plan se devine.\nInsuffisant (0-5) : aucun plan.',
    attendu: { nom: 'Texte argumentatif', criteres: [['Argumentation', 20], ['Organisation', 10]], niveaux: ['Excellent', 'Bien', 'Passable', 'Insuffisant'] }
  },
  'T9 copié d’un PDF : nom coupé, points sur la ligne suivante': {
    texte: 'Grille de l’essai\nPertinence des idées : les idées répondent à la question\net sont développées / 20\nClarté de l’expression : les phrases sont complètes et\nprécises / 15\nSources : au moins trois sources citées / 5',
    attendu: { nom: 'Grille de l’essai', criteres: [['Pertinence des idées', 20], ['Clarté de l’expression', 15], ['Sources', 5]], desc: 3 }
  },
  'T10 liste de vérification sans points': {
    texte: 'Avant de remettre\n☐ Mon introduction annonce le plan\n☐ Chaque paragraphe a une idée principale\n☐ J’ai relu ma conclusion',
    attendu: { nom: 'Avant de remettre', criteres: [['Mon introduction annonce le plan', null], ['Chaque paragraphe a une idée principale', null], ['J’ai relu ma conclusion', null]] }
  },
  'T11 déductions et pénalités': {
    texte: 'Compte rendu de lecture\nCompréhension de l’œuvre / 50\nAnalyse / 40\nPrésentation / 10\nLangue : -0,5 par faute (max. -10)\nRetard : -10 % par jour',
    attendu: { nom: 'Compte rendu de lecture', criteres: [['Compréhension de l’œuvre', 50], ['Analyse', 40], ['Présentation', 10]], classer: ['deduction', 'deduction'] }
  },
  'T12 parties sans points, critères à points, commentaires': {
    texte: 'Exercice de plan\nIntroduction\t/ 5\n• élément a : précision fictive\n• élément b : précision fictive\nDéveloppement\n• partie un (précision)\t/ 30\n- sous-élément a\n- sous-élément b\n• partie deux (précision)\t/ 60\n- sous-élément a\nConclusion\t/ 5\n• élément c : précision fictive\nCommentaires :\n______________________\n______________________\nTOTAL\t/ 100',
    attendu: { nom: 'Exercice de plan', criteres: [['Introduction', 5], ['partie un (précision)', 30, 'Développement'], ['partie deux (précision)', 60, 'Développement'], ['Conclusion', 5]], sous: 6, classer: ['commentaires', 'total'] }
  },
  'T12b la même, alignée par des espaces': {
    texte: 'Exercice de plan\nIntroduction                         / 5\n• élément a : précision fictive\n• élément b : précision fictive\nDéveloppement\n• partie un (précision)              / 30\n- sous-élément a\n- sous-élément b\n• partie deux (précision)            / 60\n- sous-élément a\nConclusion                           / 5\n• élément c : précision fictive\nCommentaires :\n______________________\nTOTAL                                / 100',
    attendu: { nom: 'Exercice de plan', criteres: [['Introduction', 5], ['partie un (précision)', 30, 'Développement'], ['partie deux (précision)', 60, 'Développement'], ['Conclusion', 5]], sous: 6, classer: ['commentaires', 'total'] }
  },
  'T13 « sur N » et « : N points »': {
    texte: 'Présentation orale\nMaîtrise du contenu : 8 points\nClarté sur 6\nInteraction avec la classe : 6 pts\n\nNote : ____ / 20',
    attendu: { nom: 'Présentation orale', criteres: [['Maîtrise du contenu', 8], ['Clarté', 6], ['Interaction avec la classe', 6]], classer: ['total'] }
  },
  'T14 consigne avant la grille, puis critères à blancs': {
    texte: 'Travail 2 – Analyse de données\nRemettre le fichier et le rapport avant le 30 novembre.\nLe rapport compte pour 20 % de la session.\nQualité du jeu de données ____ / 15\nChoix des tests statistiques ____ / 25\nInterprétation ____ / 40\nPrésentation ____ / 20',
    attendu: { nom: 'Travail 2 – Analyse de données', criteres: [['Qualité du jeu de données', 15], ['Choix des tests statistiques', 25], ['Interprétation', 40], ['Présentation', 20]], classer: ['avant', 'avant'] }
  }
};
export const CORPUS_B = {
  'U1 philosophie : parties « (15 points) », sous-critères à puces notés après tabulation, 2e niveau « o » non noté, date de remise': {
    texte: 'Grille de correction – Dissertation philosophique\nRemise : vendredi 13 novembre, avant 23 h 59\n\nIntroduction (15 points)\n•\tSujet amené\t3\n•\tSujet posé (problématique)\t7\n•\tSujet divisé\t5\nDéveloppement (60 points)\n•\tThèse clairement formulée\t15\n•\tArguments et justification\t25\no\tchaque argument s’appuie sur un passage du texte\no\tles liens logiques sont explicites\n•\tObjection et réfutation\t20\nConclusion (10 points)\n•\tSynthèse du raisonnement\t5\n•\tOuverture\t5\nQualité de la langue (15 points)\n\nTotal : /100\nCommentaires :',
    attendu: { nom: 'Grille de correction – Dissertation philosophique', criteres: [
      ['Sujet amené', 3, 'Introduction'],
      ['Sujet posé (problématique)', 7, 'Introduction'],
      ['Sujet divisé', 5, 'Introduction'],
      ['Thèse clairement formulée', 15, 'Développement'],
      ['Arguments et justification', 25, 'Développement'],
      ['Objection et réfutation', 20, 'Développement'],
      ['Synthèse du raisonnement', 5, 'Conclusion'],
      ['Ouverture', 5, 'Conclusion'],
      ['Qualité de la langue', 15, null]
    ] }
  },
  'U2 chimie copiée d’un PDF : critères numérotés « 1. », description coupée en fin de ligne, « /10 » en fin de paragraphe, pénalité et pied de page': {
    texte: 'RAPPORT DE LABORATOIRE No 3 – GRILLE D’ÉVALUATION\nChimie des solutions – Cinétique d’une réaction\nLe rapport est remis une semaine après la séance de laboratoire. Tout \nretard entraîne une pénalité de 10 % par jour ouvrable.\n1. Page titre et présentation : respect des normes de \nprésentation du département. /5\n2. But et hypothèse : le but est formulé clairement et \nl’hypothèse est vérifiable. /10\n3. Matériel et méthode : liste complète du matériel, \nprotocole résumé et modifications apportées. /10\n4. Résultats : tableaux et graphiques titrés, unités et \nincertitudes indiquées. /25\n5. Analyse et discussion : interprétation des résultats, \nsources d’erreur et pistes d’amélioration. /35\n6. Conclusion /10\n7. Références (format APA) /5\nTotal /100\nPage 1 de 1',
    attendu: { nom: 'RAPPORT DE LABORATOIRE No 3 – GRILLE D’ÉVALUATION', criteres: [
      ['Page titre et présentation', 5, null],
      ['But et hypothèse', 10, null],
      ['Matériel et méthode', 10, null],
      ['Résultats', 25, null],
      ['Analyse et discussion', 35, null],
      ['Conclusion', 10, null],
      ['Références (format APA)', 5, null]
    ] }
  },
  'U3 éducation physique : points « (10) » en début de ligne, éléments décrits sous un critère, parenthèse non notée, ligne de nom et signature': {
    texte: 'Éducation physique – Évaluation de l’enchaînement au sol\nNom de l’élève : ____________________   Groupe : ____\n(10)  Échauffement autonome et pertinent\n(30)  Exécution technique des éléments imposés\n         roulade avant, roulade arrière, appui tendu renversé, roue latérale\n(20)  Fluidité et liaisons entre les éléments\n(15)  Amplitude et tenue du corps\n(15)  Originalité de la composition\n(10)  Respect du temps (60 à 90 secondes)\nNote : _____ / 100\nSignature de l’enseignante : ____________________',
    attendu: { nom: 'Éducation physique – Évaluation de l’enchaînement au sol', criteres: [
      ['Échauffement autonome et pertinent', 10, null],
      ['Exécution technique des éléments imposés', 30, null],
      ['Fluidité et liaisons entre les éléments', 20, null],
      ['Amplitude et tenue du corps', 15, null],
      ['Originalité de la composition', 15, null],
      ['Respect du temps (60 à 90 secondes)', 10, null]
    ] }
  },
  'U4 arts visuels : « Critère n – » puis « /10 » après tabulation, niveaux décrits « Excellent (9-10) : … » sous chaque critère': {
    texte: 'Projet 2 – Autoportrait en techniques mixtes\nArts visuels, groupe 01\nCritère 1 – Maîtrise des techniques\t/10\nExcellent (9-10) : les techniques sont combinées avec aisance et intention.\nTrès bien (7-8) : les techniques sont maîtrisées malgré quelques maladresses.\nPassable (5-6) : la maîtrise est inégale d’une zone à l’autre de l’œuvre.\nInsuffisant (0-4) : les techniques sont peu ou mal exploitées.\nCritère 2 – Composition et organisation de l’espace\t/10\nExcellent (9-10) : la composition guide le regard et sert le propos.\nTrès bien (7-8) : la composition est équilibrée.\nPassable (5-6) : certaines zones sont vides ou surchargées.\nInsuffisant (0-4) : aucune organisation perceptible.\nCritère 3 – Intention artistique et démarche\t/10\nExcellent (9-10) : l’intention est claire et la démarche, documentée dans le carnet.\nTrès bien (7-8) : l’intention est perceptible.\nPassable (5-6) : l’intention reste vague.\nInsuffisant (0-4) : aucune intention n’est exprimée.\nCritère 4 – Respect des consignes et du format\t/5\nTotal\t/35',
    attendu: { nom: 'Projet 2 – Autoportrait en techniques mixtes', criteres: [
      ['Maîtrise des techniques', 10, null],
      ['Composition et organisation de l’espace', 10, null],
      ['Intention artistique et démarche', 10, null],
      ['Respect des consignes et du format', 5, null]
    ] }
  },
  'U5 soins infirmiers : liste de vérification à cases « ☐ », aucun point, chiffres dans les étapes, observations et date': {
    texte: 'Liste de vérification – Injection sous-cutanée\nCochez chaque étape observée pendant la simulation.\n☐ Vérifie l’ordonnance et applique les 7 bons\n☐ Procède à l’hygiène des mains\n☐ Identifie la personne à l’aide de deux identificateurs\n☐ Prépare le médicament de façon aseptique\n☐ Choisit et désinfecte le site d’injection\n☐ Injecte à un angle de 45 ou de 90 degrés selon le pli cutané\n☐ Jette l’aiguille dans le contenant pour objets piquants\n☐ Consigne le soin au dossier\n\nObservations : ______________________________\nÉvaluatrice : ____________________   Date : ____________',
    attendu: { nom: 'Liste de vérification – Injection sous-cutanée', criteres: [
      ['Vérifie l’ordonnance et applique les 7 bons', null, null],
      ['Procède à l’hygiène des mains', null, null],
      ['Identifie la personne à l’aide de deux identificateurs', null, null],
      ['Prépare le médicament de façon aseptique', null, null],
      ['Choisit et désinfecte le site d’injection', null, null],
      ['Injecte à un angle de 45 ou de 90 degrés selon le pli cutané', null, null],
      ['Jette l’aiguille dans le contenant pour objets piquants', null, null],
      ['Consigne le soin au dossier', null, null]
    ] }
  },
  'U6 littérature : « 25 points » en fin de ligne sans séparateur, tiret dans le nom, consignes intercalées entre les critères (dont une qui finit par un chiffre)': {
    texte: 'Analyse littéraire – Le récit fantastique\nRédigez une analyse de 700 à 900 mots. Le dictionnaire et la grammaire sont permis.\nIntroduction 10 points\nRappel : l’introduction comprend le sujet amené, le sujet posé et le sujet divisé.\nDéveloppement – premier paragraphe 25 points\nDéveloppement – deuxième paragraphe 25 points\nIntégrez au moins deux citations par paragraphe, avec la page entre parenthèses.\nConclusion 10 points\nMaîtrise de la langue 30 points\nAttention : à partir de 30 fautes, la note de langue est de 0.\nTotal : 100 points',
    attendu: { nom: 'Analyse littéraire – Le récit fantastique', criteres: [
      ['Introduction', 10, null],
      ['Développement – premier paragraphe', 25, null],
      ['Développement – deuxième paragraphe', 25, null],
      ['Conclusion', 10, null],
      ['Maîtrise de la langue', 30, null]
    ] }
  },
  'U7 histoire copiée d’un PDF : noms de critères coupés sur deux ou trois lignes, « (15 pts) » en fin, sous-titre de cours non noté': {
    texte: 'Travail de recherche en histoire – Critères d’évaluation\nHistoire de la civilisation occidentale\nProblématique et question de recherche \nformulées avec précision (15 pts)\nUtilisation de sources primaires et \nsecondaires pertinentes et variées (20 pts)\nMise en contexte historique des événements \nétudiés (15 pts)\nAnalyse critique des sources : l’élève \ndistingue les faits, les interprétations et \nles partis pris des auteurs (30 pts)\nRespect du protocole de présentation et \nde la médiagraphie (10 pts)\nQualité du français (10 pts)\nNote finale : /100\nDépartement d’histoire et de géographie',
    attendu: { nom: 'Travail de recherche en histoire – Critères d’évaluation', criteres: [
      ['Problématique et question de recherche formulées avec précision', 15, null],
      ['Utilisation de sources primaires et secondaires pertinentes et variées', 20, null],
      ['Mise en contexte historique des événements étudiés', 15, null],
      ['Analyse critique des sources', 30, null],
      ['Respect du protocole de présentation et de la médiagraphie', 10, null],
      ['Qualité du français', 10, null]
    ] }
  },
  'U8 physique : « : sur 20 » en fin de ligne, somme des critères (95) différente du total annoncé (100)': {
    texte: 'Physique mécanique – Examen 2 : résolution de problèmes\nDémarche et schéma du système : sur 20\nChoix des principes et des équations : sur 25\nDéveloppement algébrique : sur 20\nRéponse finale avec unités et chiffres significatifs : sur 15\nVraisemblance et vérification du résultat : sur 15\nNote de l’examen : ______ sur 100',
    attendu: { nom: 'Physique mécanique – Examen 2 : résolution de problèmes', criteres: [
      ['Démarche et schéma du système', 20, null],
      ['Choix des principes et des équations', 25, null],
      ['Développement algébrique', 20, null],
      ['Réponse finale avec unités et chiffres significatifs', 15, null],
      ['Vraisemblance et vérification du résultat', 15, null]
    ] }
  },
  'U9 musique : liste numérotée « 1.\\t » et « a)\\t » sans retrait, nombre seul après tabulation (points de conduite), sous-critères notés': {
    texte: 'Évaluation instrumentale de fin de session\n1.\tPièce imposée\t40\na)\tJustesse et précision rythmique\t15\nb)\tSonorité\t10\nc)\tRespect des nuances et du phrasé\t15\n2.\tPièce au choix\t40\na)\tDifficulté et pertinence du choix\t10\nb)\tInterprétation et expressivité\t20\nc)\tPrésence sur scène\t10\n3.\tGammes et arpèges\t20\nTotal\t100',
    attendu: { nom: 'Évaluation instrumentale de fin de session', criteres: [
      ['Justesse et précision rythmique', 15, 'Pièce imposée'],
      ['Sonorité', 10, 'Pièce imposée'],
      ['Respect des nuances et du phrasé', 15, 'Pièce imposée'],
      ['Difficulté et pertinence du choix', 10, 'Pièce au choix'],
      ['Interprétation et expressivité', 20, 'Pièce au choix'],
      ['Présence sur scène', 10, 'Pièce au choix'],
      ['Gammes et arpèges', 20, null]
    ] }
  },
  'U10 informatique : parties sans points, puces « - » et « * » mélangées, « 2,5 pts » décimal après deux espaces, pénalité en % et total': {
    texte: 'TP3 – Application web de gestion d’inventaire\nFonctionnalités\n- Ajout et modification d’un article  5 pts\n- Recherche et filtres  5 pts\n- Validation des formulaires  2,5 pts\n- Gestion des erreurs côté serveur  2,5 pts\nQualité du code\n* Respect des conventions de nommage  3 pts\n* Code commenté et lisible  3 pts\n* Absence de duplication  4 pts\nRemise\n- Dépôt Git avec un historique de commits significatifs  3 pts\n- Fichier LISEZMOI complet  2 pts\n\nPénalité : -10 % par jour de retard\nTotal : 30 pts',
    attendu: { nom: 'TP3 – Application web de gestion d’inventaire', criteres: [
      ['Ajout et modification d’un article', 5, 'Fonctionnalités'],
      ['Recherche et filtres', 5, 'Fonctionnalités'],
      ['Validation des formulaires', 2.5, 'Fonctionnalités'],
      ['Gestion des erreurs côté serveur', 2.5, 'Fonctionnalités'],
      ['Respect des conventions de nommage', 3, 'Qualité du code'],
      ['Code commenté et lisible', 3, 'Qualité du code'],
      ['Absence de duplication', 4, 'Qualité du code'],
      ['Dépôt Git avec un historique de commits significatifs', 3, 'Remise'],
      ['Fichier LISEZMOI complet', 2, 'Remise']
    ] }
  },
  'U11 espagnol : pondérations « – 20 % » avec espaces insécables (Word), ligne de durée chiffrée, total en %': {
    texte: 'Espagnol 2 – Grille de l’entrevue orale\nDurée : 8 à 10 minutes, en équipe de deux\nPrononciation et intonation – 20 %\nRichesse du vocabulaire – 20 %\nExactitude grammaticale – 25 %\nFluidité et aisance – 20 %\nInteraction avec l’interlocuteur – 15 %\nTotal – 100 %',
    attendu: { nom: 'Espagnol 2 – Grille de l’entrevue orale', criteres: [
      ['Prononciation et intonation', 20, null],
      ['Richesse du vocabulaire', 20, null],
      ['Exactitude grammaticale', 25, null],
      ['Fluidité et aisance', 20, null],
      ['Interaction avec l’interlocuteur', 15, null]
    ] }
  },
  'U12 géographie : sans titre, « (25 points) » en fin, descriptions sur plusieurs lignes sous le critère, lignes vides entre critères': {
    texte: 'Carte thématique (25 points)\nLa carte comporte un titre, une légende, une échelle, une orientation et la source des données.\nLes couleurs choisies facilitent la lecture.\n\nAnalyse des données démographiques (35 points)\nL’élève compare au moins trois régions administratives.\nLes tendances sont appuyées par les recensements de 2016 et de 2021.\n\nRecommandations d’aménagement (30 points)\nLes recommandations découlent de l’analyse\net tiennent compte des contraintes environnementales.\n\nPrésentation et qualité de la langue (10 points)',
    attendu: { nom: '', criteres: [
      ['Carte thématique', 25, null],
      ['Analyse des données démographiques', 35, null],
      ['Recommandations d’aménagement', 30, null],
      ['Présentation et qualité de la langue', 10, null]
    ] }
  },
  'U13 psychologie : coquilles (majuscules, espaces doubles, « /20 » collé, parenthèse mal espacée), puces « • » et « - » mélangées, ligne vide, note finale et commentaires': {
    texte: 'PSYCHOLOGIE – AFFICHE SCIENTIFIQUE\n•\tChoix et pertinence de l’étude présentée   / 10\n•\tRésumé de la méthode (participants, procédure, mesures) /15\n-\tRÉSULTATS PRINCIPAUX  /15\n•\tlien avec les concepts vus en classe/20\n\n•\tQualité visuelle de l’affiche  : lisibilité , hiérarchie de l’information /10\n•\tPrésentation orale devant l’affiche( 5 minutes max)  /20\n•\tRéponses aux questions  /10\nNote finale :       /100\nCommentaires :',
    attendu: { nom: 'PSYCHOLOGIE – AFFICHE SCIENTIFIQUE', criteres: [
      ['Choix et pertinence de l’étude présentée', 10, null],
      ['Résumé de la méthode (participants, procédure, mesures)', 15, null],
      ['RÉSULTATS PRINCIPAUX', 15, null],
      ['lien avec les concepts vus en classe', 20, null],
      ['Qualité visuelle de l’affiche', 10, null],
      ['Présentation orale devant l’affiche( 5 minutes max)', 20, null],
      ['Réponses aux questions', 10, null]
    ] }
  },
  'U14 science et technologie (secondaire) : « Critère n : » avec deux-points insécable, « (20 points) », sous-éléments « 1.1 » non notés, signature du parent': {
    texte: 'Projet technologique – Le bras hydraulique (2e secondaire)\nCritère 1 : Analyse du besoin et cahier des charges (20 points)\n1.1 Les contraintes sont identifiées\n1.2 Les matériaux disponibles sont énumérés\nCritère 2 : Schémas de principe et de construction (30 points)\n2.1 Les forces et les mouvements sont représentés\n2.2 Les cotes et l’échelle sont indiquées\nCritère 3 : Fabrication du prototype (30 points)\nCritère 4 : Essais et améliorations (20 points)\n4.1 Au moins deux essais sont consignés dans le cahier\nTotal : ______ / 100\nSignature du parent : ____________________',
    attendu: { nom: 'Projet technologique – Le bras hydraulique (2e secondaire)', criteres: [
      ['Analyse du besoin et cahier des charges', 20, null],
      ['Schémas de principe et de construction', 30, null],
      ['Fabrication du prototype', 30, null],
      ['Essais et améliorations', 20, null]
    ] }
  }
};
export const CORPUS_C = {
  'V1 Word puces • et o, parties /n dont les sous-critères notés font le total, sous-éléments non notés': {
    texte: 'Grille d’évaluation – Démarche de soins (stage en médecine)\nSoins infirmiers – Stage 3 – Automne 2026\n\n•\tCollecte des données\t/ 20\no\tHistoire de santé complète et pertinente\t/8\no\tExamen physique ciblé\t/ 7\no\tConsultation du dossier et de l’équipe interdisciplinaire\t/ 5\n•\tAnalyse et interprétation\t/ 25\no\tConstat de l’évaluation et problèmes prioritaires\t/ 10\no\tLiens avec la physiopathologie et la pharmacologie\t/ 15\n•\tPlanification et interventions\t/ 35\no\tObjectifs de soins mesurables\t/ 10\no\tInterventions infirmières justifiées\t/ 15\no\tPlan thérapeutique infirmier à jour\t/ 10\n•\tÉvaluation des résultats obtenus\t/ 10\n•\tRédaction des notes d’évolution\t/ 10\no\tTerminologie et abréviations reconnues\no\tDate, heure et signature à chaque note\n\nTotal\t/ 100',
    attendu: { nom: 'Grille d’évaluation – Démarche de soins (stage en médecine)', criteres: [
      ['Histoire de santé complète et pertinente', 8, 'Collecte des données'],
      ['Examen physique ciblé', 7, 'Collecte des données'],
      ['Consultation du dossier et de l’équipe interdisciplinaire', 5, 'Collecte des données'],
      ['Constat de l’évaluation et problèmes prioritaires', 10, 'Analyse et interprétation'],
      ['Liens avec la physiopathologie et la pharmacologie', 15, 'Analyse et interprétation'],
      ['Objectifs de soins mesurables', 10, 'Planification et interventions'],
      ['Interventions infirmières justifiées', 15, 'Planification et interventions'],
      ['Plan thérapeutique infirmier à jour', 10, 'Planification et interventions'],
      ['Évaluation des résultats obtenus', 10, null],
      ['Rédaction des notes d’évolution', 10, null]
    ] }
  },
  'V2 PDF numéroté 1., description après deux-points coupée sur deux lignes, (n points), pénalité': {
    texte: 'ÉVALUATION SOMMATIVE 2 – ÉTATS FINANCIERS \nComptabilité financière II – Groupe 01 \nPondération : 30 % de la note finale \nCritères d’évaluation \n1. Écritures de régularisation : exactitude des montants, choix des \ncomptes et respect de la date de clôture (25 points) \n2. Chiffrier et balance de vérification régularisée : report exact \ndes soldes et équilibre des colonnes (15 points) \n3. État des résultats : présentation conforme, classement des \ncharges par fonction (20 points) \n4. État de la situation \nfinancière : distinction entre l’actif courant et l’actif non courant, \ncalcul du fonds de roulement (25 points) \n5. Présentation professionnelle : propreté, titres, symboles \nmonétaires et notes aux états financiers (15 points) \nTotal : 100 points \nUne pénalité de 10 % par jour de retard sera appliquée. ',
    attendu: { nom: 'ÉVALUATION SOMMATIVE 2 – ÉTATS FINANCIERS', criteres: [
      ['Écritures de régularisation', 25, null],
      ['Chiffrier et balance de vérification régularisée', 15, null],
      ['État des résultats', 20, null],
      ['État de la situation financière', 25, null],
      ['Présentation professionnelle', 15, null]
    ] }
  },
  'V3 PDF lettres A. B., noms coupés sur deux lignes, points de conduite en points, /n, consigne et seuil': {
    texte: 'Fiche d’évaluation pratique \nDEP Électricité – Module 14 : Installation résidentielle \nÉpreuve : raccordement d’un panneau de distribution de 100 A et de trois \ncircuits de dérivation. Durée : 3 h. \nA. Planification du travail et choix du matériel .................. /10 \nB. Respect des règles de santé et de sécurité \n(cadenassage, port des ÉPI) ........................................ /20 \nC. Conformité au Code de construction du Québec, \nchapitre V, Électricité ............................................ /25\nD. Qualité des raccordements et du \ncâblage ............................................................ /25 \nE. Vérifications et essais (continuité, polarité, \nisolement) .......................................................... /15\nF. Propreté et rangement du poste ................................. /5 \nRésultat : ______ /100 \nSeuil de réussite : 80 % et la totalité des points au critère B. ',
    attendu: { nom: 'Fiche d’évaluation pratique', criteres: [
      ['Planification du travail et choix du matériel', 10, null],
      ['Respect des règles de santé et de sécurité (cadenassage, port des ÉPI)', 20, null],
      ['Conformité au Code de construction du Québec, chapitre V, Électricité', 25, null],
      ['Qualité des raccordements et du câblage', 25, null],
      ['Vérifications et essais (continuité, polarité, isolement)', 15, null],
      ['Propreté et rangement du poste', 5, null]
    ] }
  },
  'V4 PDF sans puces, n pts en fin de ligne coupée, en-tête de page répété et numéros de page au milieu': {
    texte: 'Grille de correction – Rapport de laboratoire 3 \nBiologie cellulaire · Activité enzymatique de la catalase \nIntroduction : contexte théorique, objectif et hypothèse \nvérifiable 10 pts \nProtocole : références au protocole fourni et modifications \napportées 5 pts \nRésultats : tableaux numérotés et titrés, unités et \nincertitudes 20 pts \nGraphique de la vitesse de réaction en fonction de la \ntempérature 15 pts \nPage 1 sur 2 \nGrille de correction – Rapport de laboratoire 3 \nDiscussion : interprétation des résultats, comparaison avec la \nlittérature scientifique, sources d’erreur 30 pts \nConclusion 10 pts \nMédiagraphie selon les normes APA 10 pts \nTotal 100 pts \nPage 2 sur 2',
    attendu: { nom: 'Grille de correction – Rapport de laboratoire 3', criteres: [
      ['Introduction', 10, null],
      ['Protocole', 5, null],
      ['Résultats', 20, null],
      ['Graphique de la vitesse de réaction en fonction de la température', 15, null],
      ['Discussion', 30, null],
      ['Conclusion', 10, null],
      ['Médiagraphie selon les normes APA', 10, null]
    ] }
  },
  'V5 Word numérotation 1. a) i., sous-critères (n pts) qui font le total de la partie, sous-éléments i. non notés': {
    texte: 'Projet intégrateur – Plan d’affaires d’une PME\nTechniques de l’administration – Gestion de commerces\n\n1.\tAnalyse du marché (30 pts)\na)\tPortrait du secteur et de la concurrence (10 pts)\nb)\tClientèle cible et segmentation (10pts)\nc)\tAnalyse FFPM du projet (10 pts)\n2.\tPlan marketing (25 pts)\na)\tStratégie de produit et de prix (15 pts)\ni.\tPositionnement par rapport aux concurrents\nii.\tPolitique de prix justifiée\nb)\tStratégie de communication (10 pts)\n3.\tPlan financier (35 pts)\na)\tBudget de démarrage (10 pts)\nb)\tÉtats financiers prévisionnels sur trois ans (15 pts)\nc)\tSeuil de rentabilité (10 pts)\n4.\tQualité de la langue et présentation du document (10 pts)\n\nNote finale\u00a0: ______ / 100\nCommentaires\u00a0:',
    attendu: { nom: 'Projet intégrateur – Plan d’affaires d’une PME', criteres: [
      ['Portrait du secteur et de la concurrence', 10, 'Analyse du marché'],
      ['Clientèle cible et segmentation', 10, 'Analyse du marché'],
      ['Analyse FFPM du projet', 10, 'Analyse du marché'],
      ['Stratégie de produit et de prix', 15, 'Plan marketing'],
      ['Stratégie de communication', 10, 'Plan marketing'],
      ['Budget de démarrage', 10, 'Plan financier'],
      ['États financiers prévisionnels sur trois ans', 15, 'Plan financier'],
      ['Seuil de rentabilité', 10, 'Plan financier'],
      ['Qualité de la langue et présentation du document', 10, null]
    ] }
  },
  'V6 Word numéroté 1. et a., pondérations en pourcentage avec espace insécable, sous-éléments non notés': {
    texte: 'Anglais langue seconde – Présentation orale\nOral Presentation – Grille d’évaluation\nPondération\u00a0: 20\u00a0% de la note finale\n\n1.\tContenu et organisation des idées – 30\u00a0%\na.\tIntroduction qui annonce le sujet\nb.\tTransitions entre les parties\nc.\tConclusion qui ouvre sur une question\n2.\tAisance et débit (fluency) – 20\u00a0%\n3.\tPrononciation et intonation – 15\u00a0%\n4.\tVocabulaire et structures grammaticales – 25\u00a0%\n5.\tContact visuel et utilisation des notes – 10\u00a0%\n\nTotal\u00a0: 100\u00a0%',
    attendu: { nom: 'Anglais langue seconde – Présentation orale', criteres: [
      ['Contenu et organisation des idées', 30, null],
      ['Aisance et débit (fluency)', 20, null],
      ['Prononciation et intonation', 15, null],
      ['Vocabulaire et structures grammaticales', 25, null],
      ['Contact visuel et utilisation des notes', 10, null]
    ] }
  },
  'V7 Critère n : avec (/ n), niveaux décrits en texte et leurs points sous chaque critère': {
    texte: 'Grille d’appréciation – Solo chorégraphique\nDanse contemporaine III – Production de fin de session\n\nCritère 1\u00a0: Maîtrise technique (/ 30)\nTrès bien (30)\u00a0: alignement, équilibres et transferts de poids maîtrisés du début à la fin.\nBien (24)\u00a0: quelques pertes d’équilibre, sans incidence sur la continuité du solo.\nPassable (18)\u00a0: la technique nuit par moments à la lisibilité du mouvement.\nInsuffisant (9)\u00a0: les bases techniques ne sont pas maîtrisées.\n\nCritère 2\u00a0: Interprétation et présence scénique (/ 30)\nTrès bien (30)\u00a0: engagement constant, intention et regard clairs.\nBien (24)\u00a0: présence soutenue, mais inégale selon les sections.\nPassable (18)\u00a0: interprétation peu investie, regard souvent au sol.\nInsuffisant (9)\u00a0: aucune intention perceptible.\n\nCritère 3\u00a0: Composition et utilisation de l’espace (/ 25)\nTrès bien (25)\u00a0: structure claire, variations de niveaux, de directions et de dynamiques.\nBien (20)\u00a0: structure lisible, quelques répétitions non intentionnelles.\nPassable (15)\u00a0: enchaînements juxtaposés, espace peu exploité.\nInsuffisant (8)\u00a0: absence de structure.\n\nCritère 4\u00a0: Musicalité (/ 15)\nTrès bien (15)\u00a0: phrasé en dialogue avec la trame sonore, silences assumés.\nBien (12)\u00a0: bon rapport au tempo, nuances à développer.\nPassable (9)\u00a0: décalages fréquents avec la musique.\nInsuffisant (5)\u00a0: aucun rapport perceptible à la musique.\n\nTotal\u00a0: / 100',
    attendu: { nom: 'Grille d’appréciation – Solo chorégraphique', criteres: [
      ['Maîtrise technique', 30, null],
      ['Interprétation et présence scénique', 30, null],
      ['Composition et utilisation de l’espace', 25, null],
      ['Musicalité', 15, null]
    ] }
  },
  'V8 liste de vérification ☐ sans points, intertitres de sections, consigne et signature': {
    texte: 'Liste de vérification – Mise en place et hygiène\nDEP Cuisine – Compétence 6\u00a0: Appliquer les règles d’hygiène et de salubrité\nÀ cocher par l’enseignant pendant l’épreuve pratique.\n\nHygiène et salubrité\n☐\tTenue complète et propre (veste, tablier, toque, chaussures de sécurité)\n☐\tLavage des mains au début et entre chaque tâche\n☐\tCheveux attachés, aucun bijou\nPoste de travail\n☐\tPlanches de couleur selon le type d’aliment\n☐\tLinges propres et solution désinfectante au poste\n☐\tTempératures des réfrigérateurs notées dans le registre\nMise en place\n☐\tLégumes taillés selon les coupes demandées (brunoise, julienne)\n☐\tFond brun en cuisson à l’heure prévue\n☐\tPoste nettoyé et rangé à la fin de l’épreuve\n\nL’élève doit satisfaire à tous les éléments pour réussir l’épreuve.\nSignature de l’enseignant\u00a0: ____________________',
    attendu: { nom: 'Liste de vérification – Mise en place et hygiène', criteres: [
      ['Tenue complète et propre (veste, tablier, toque, chaussures de sécurité)', null, 'Hygiène et salubrité'],
      ['Lavage des mains au début et entre chaque tâche', null, 'Hygiène et salubrité'],
      ['Cheveux attachés, aucun bijou', null, 'Hygiène et salubrité'],
      ['Planches de couleur selon le type d’aliment', null, 'Poste de travail'],
      ['Linges propres et solution désinfectante au poste', null, 'Poste de travail'],
      ['Températures des réfrigérateurs notées dans le registre', null, 'Poste de travail'],
      ['Légumes taillés selon les coupes demandées (brunoise, julienne)', null, 'Mise en place'],
      ['Fond brun en cuisson à l’heure prévue', null, 'Mise en place'],
      ['Poste nettoyé et rangé à la fin de l’épreuve', null, 'Mise en place']
    ] }
  },
  'V9 consigne de plusieurs lignes avec nombres avant les critères, tirets Word –, nom : n points': {
    texte: 'Travail de session – Enquête par entretiens\nSociologie de la famille\n\nConsigne\nVous réaliserez deux entretiens semi-dirigés d’environ 30 minutes auprès de personnes de générations différentes au sujet du partage des tâches domestiques.\nÀ partir de vos verbatims, rédigez un texte de 1500 à 1800 mots qui compare les deux témoignages à la lumière d’au moins deux concepts vus en classe\u00a0: socialisation, rôles de genre, charge mentale, etc.\nJoignez en annexe votre grille d’entretien et les formulaires de consentement signés.\nLe travail compte pour 30\u00a0% de la note finale et doit être déposé sur Moodle au plus tard le 4 décembre, à 23 h 59.\n\nCritères d’évaluation\n–\tGrille d’entretien et respect de l’éthique\u00a0: 10 points\n–\tPrésentation des deux témoignages\u00a0: 15 points\n–\tUtilisation juste des concepts sociologiques\u00a0: 30 points\n–\tAnalyse comparative – 30 points\n–\tStructure du texte et qualité de la langue\u00a0: 15 points',
    attendu: { nom: 'Travail de session – Enquête par entretiens', criteres: [
      ['Grille d’entretien et respect de l’éthique', 10, null],
      ['Présentation des deux témoignages', 15, null],
      ['Utilisation juste des concepts sociologiques', 30, null],
      ['Analyse comparative', 30, null],
      ['Structure du texte et qualité de la langue', 15, null]
    ] }
  },
  'V10 Word numéroté 1) avec tabulation de conduite, points décimaux à virgule (2,5 pts, 1 pt)': {
    texte: 'Calcul différentiel – Devoir 2\nGrille de correction\u00a0: problème d’optimisation (la boîte sans couvercle)\n\n1)\tModélisation\u00a0: variables définies, fonction à optimiser et contrainte\t2,5 pts\n2)\tDomaine de la fonction\t1 pt\n3)\tCalcul de la dérivée\t2 pts\n4)\tRecherche des nombres critiques\t1,5 pt\n5)\tJustification du maximum\u00a0: test de la dérivée première ou seconde\t1,5 pt\n6)\tRéponse complète, avec les unités\t1 pt\n7)\tRigueur de la notation mathématique\t0,5 pt\n\tTotal\t10 pts',
    attendu: { nom: 'Calcul différentiel – Devoir 2', criteres: [
      ['Modélisation', 2.5, null],
      ['Domaine de la fonction', 1, null],
      ['Calcul de la dérivée', 2, null],
      ['Recherche des nombres critiques', 1.5, null],
      ['Justification du maximum', 1.5, null],
      ['Réponse complète, avec les unités', 1, null],
      ['Rigueur de la notation mathématique', 0.5, null]
    ] }
  },
  'V11 sans titre, Word trois niveaux • o ▪, ____ / n, sous-critères notés et sous-éléments ▪ non notés': {
    texte: '•\tInspection et diagnostic\t____ / 30\no\tDiagnostic du système de freinage\t____ / 15\n▪\tLecture des codes de l’ABS\n▪\tInspection visuelle des conduites et des flexibles\no\tMesure des disques et des tambours\t____ / 15\n•\tRéparation\t____ / 50\no\tDémontage des composantes\t____ / 10\no\tRemplacement des plaquettes et usinage des disques\t____ / 20\no\tRemontage et couples de serrage selon le manuel du fabricant\t____ / 10\no\tPurge du système hydraulique\t____ / 10\n•\tEssai routier et vérification finale\t____ / 10\n•\tPropreté du véhicule et du poste\t____ / 10\nNote\u00a0: ______ / 100',
    attendu: { nom: '', criteres: [
      ['Diagnostic du système de freinage', 15, 'Inspection et diagnostic'],
      ['Mesure des disques et des tambours', 15, 'Inspection et diagnostic'],
      ['Démontage des composantes', 10, 'Réparation'],
      ['Remplacement des plaquettes et usinage des disques', 20, 'Réparation'],
      ['Remontage et couples de serrage selon le manuel du fabricant', 10, 'Réparation'],
      ['Purge du système hydraulique', 10, 'Réparation'],
      ['Essai routier et vérification finale', 10, null],
      ['Propreté du véhicule et du poste', 10, null]
    ] }
  },
  'V12 chaque critère suivi d’une ligne de description (italique dans le document), (sur n)': {
    texte: 'Projet 2 – Identité visuelle d’un organisme communautaire\nDesign graphique – Atelier de typographie et de mise en page\n\nRecherche et esquisses (sur 15)\nAu moins 20 esquisses à la main, pistes variées et annotées.\nConcept et pertinence du logo (sur 25)\nLe logo traduit la mission de l’organisme et reste lisible en une seule couleur.\nChoix typographiques (sur 20)\nHiérarchie claire, deux familles au maximum, lisibilité aux petites tailles.\nPalette de couleurs (sur 15)\nDe 4 à 6 couleurs justifiées, avec leurs codes CMJN, RVB et hexadécimaux.\nDéclinaisons sur trois supports ( sur 15 )\nCarte professionnelle, en-tête de lettre et gabarit pour les réseaux sociaux.\nPrésentation du cahier de normes (sur 10)\nDocument soigné, sans fautes, remis à la date prévue.\n\nTotal\u00a0: /100',
    attendu: { nom: 'Projet 2 – Identité visuelle d’un organisme communautaire', criteres: [
      ['Recherche et esquisses', 15, null],
      ['Concept et pertinence du logo', 25, null],
      ['Choix typographiques', 20, null],
      ['Palette de couleurs', 15, null],
      ['Déclinaisons sur trois supports', 15, null],
      ['Présentation du cahier de normes', 10, null]
    ] }
  },
  'V13 points en tête de ligne (____ /n puis tabulation), total écrit nulle part, commentaires': {
    texte: 'Évaluation – Scène dialoguée\nAtelier de jeu I – Interprétation réaliste\n\n____ /10\tMémorisation du texte\n____ /20\tÉcoute et réaction au partenaire\n____ /15\tProjection et diction\n____ /15\tOccupation de l’espace et déplacements\n____ /25\tConstruction du personnage : intention, objectifs, obstacles\n____ /15\tRespect des consignes de répétition\n\nCommentaires de l’enseignant·e :',
    attendu: { nom: 'Évaluation – Scène dialoguée', criteres: [
      ['Mémorisation du texte', 10, null],
      ['Écoute et réaction au partenaire', 20, null],
      ['Projection et diction', 15, null],
      ['Occupation de l’espace et déplacements', 15, null],
      ['Construction du personnage', 25, null],
      ['Respect des consignes de répétition', 15, null]
    ] }
  },
  'V14 Google Docs ● sans tabulation, intertitres Volet A – non notés, nom : n pts, résultat et signature': {
    texte: 'TRAVAIL SOCIAL – STAGE I\nÉvaluation de mi-stage par la superviseure ou le superviseur\n\nVolet A – Savoir-être professionnel\n● Respect de la confidentialité et du code de déontologie : 10 pts\n● Ouverture, empathie et non-jugement : 10 pts\n● Ponctualité et assiduité : 5 pts\nVolet B – Intervention\n● Accueil et évaluation de la situation de la personne : 15 pts\n● Élaboration d’un plan d’intervention avec la personne : 20 pts\n● Références vers les ressources du milieu : 10 pts\nVolet C – Travail en équipe et rédaction\n● Participation aux rencontres d’équipe : 10 pts\n● Tenue de dossier et notes évolutives : 20 pts.\n\nRésultat : ___ / 100\nSignature de la personne stagiaire :',
    attendu: { nom: 'TRAVAIL SOCIAL – STAGE I', criteres: [
      ['Respect de la confidentialité et du code de déontologie', 10, 'Savoir-être professionnel'],
      ['Ouverture, empathie et non-jugement', 10, 'Savoir-être professionnel'],
      ['Ponctualité et assiduité', 5, 'Savoir-être professionnel'],
      ['Accueil et évaluation de la situation de la personne', 15, 'Intervention'],
      ['Élaboration d’un plan d’intervention avec la personne', 20, 'Intervention'],
      ['Références vers les ressources du milieu', 10, 'Intervention'],
      ['Participation aux rencontres d’équipe', 10, 'Travail en équipe et rédaction'],
      ['Tenue de dossier et notes évolutives', 20, 'Travail en équipe et rédaction']
    ] }
  },
};
