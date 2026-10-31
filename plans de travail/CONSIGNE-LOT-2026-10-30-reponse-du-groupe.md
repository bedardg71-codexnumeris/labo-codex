# Consigne – La réponse du groupe (activée par l'enseignant·e)

> Cowork, vendredi 30 octobre 2026, 21 h 50 (Toronto). Décisions de Grégoire du 30 oct. (`REFLEXION-2026-10-30-seuils-normatif-critere-ipsatif.md` : 15 h 23, 15 h 24, 21 h 49). Ébauche de référence : `plans de travail/EBAUCHE-2026-10-30-reponse-du-groupe.html` (copie versée au dépôt le 31 oct. de https://claude.ai/artifact/CHdoqZV7Biit5VUJwtdfWf, « Réglages et réponse du groupe » ; lis son script). ⚠ Elle est antérieure à trois décisions : sa section « À trancher » est périmée (tranché le 30 oct. : le signalement diagnostique fixe le niveau seulement jusqu'à la première note ; 70 % ; la note du repère validée) ; elle dit « note provisoire » là où les textes communs à toutes les pratiques disent « la note du cours à ce jour » ; elle titre « Niveau 2 · ciblé » là où l'application dit « Préventif ». Ce sont les mots de l'application et des décisions qui font foi, pas ceux de l'ébauche. À faire après le lot des barres de l'Aperçu.

## 0. Tranché par Grégoire le 31 oct. à 7 h 40 : la réponse du groupe REMPLACE la phrase de groupe

Question posée : la phrase de groupe actuelle (« La moyenne du groupe, pour la note du cours à ce jour (X %), est sous le seuil minimal de réussite (Y %) : c'est l'enseignement universel qu'il faut renforcer, pour tous. »), sous la barre RàI de l'Aperçu, s'affiche sans que l'enseignant·e l'ait demandé ; la réponse du groupe la remplace-t-elle ? **Réponse : « oui, on remplace ».** Tant que le réglage est éteint, aucune lecture du groupe ne s'affiche ; les comptes des niveaux 2 et 3 sous la barre restent (signaux individuels).

Conséquence pour le code (zéro dette) : retirer la boucle des signaux de groupe dans `genererInterpretationRai` (`js/tableau-bord-apercu.js`) ; si la carte ne la réutilise pas, retirer aussi `signauxDeGroupeDepistage` (`js/profil-etudiant-calculs.js`, seul consommateur mesuré le 31 oct. : cette phrase) et ses tests dans `sentinelle-niveau-au-critere-2026-10-30.test.js`, remplacés par une garde qui vérifie que, réglage éteint, l'Aperçu n'affiche aucune lecture du groupe.

## 1. Le réglage, dans Labo › Outils d'observation

Ordre décidé : (1) les seuils, (2) ce qu'ils donnent sur le groupe affiché, (3) le choix d'activer.
- **(2) Ce que tes seuils donnent** : le nombre et la part d'étudiant·es à chaque niveau, d'où viennent les niveaux 2 et 3 (note sous la ligne, persistante, fondation, diagnostic, non-participation), et la sensibilité de la ligne (combien de plus ou de moins aux niveaux 2-3 à 5 points au-dessus et au-dessous). Rien n'y propose un seuil tiré des résultats.
- **(3) Le réglage, éteint par défaut**, texte validé le 30 oct. à 15 h 24, mot pour mot :
  > **Afficher la réponse du groupe** — Tes seuils placent chaque étudiant·e à un niveau. Activé, ce réglage compare la répartition de ton groupe au repère de la RàI (environ 80 % au niveau 1). Un écart dit que le groupe demande un enseignement universel renforcé, quelle qu'en soit la cause.

## 2. La carte « La réponse du groupe » (Aperçu, seulement si le réglage est activé)

- Deux barres : la répartition du groupe aux niveaux 1-2-3, le repère 80-15-5.
- **Sous 70 % au niveau 1** (décidé à 21 h 49) : « {N} % de ton groupe est au niveau 1. Ce groupe demande un enseignement universel renforcé, quelle qu'en soit la cause : le parcours des étudiant·es, l'enseignement, ou les deux. » Sinon : « {N} % de ton groupe est au niveau 1. La répartition est proche du repère de la RàI. » (phrases de l'ébauche : à lister avec les mots, Grégoire a validé l'ébauche et son seuil).
- Note, validée à 21 h 49 : « Le repère 80-15-5 est une heuristique de la RàI, pas une proportion mesurée au collégial. Il situe le groupe, il ne juge ni les étudiant·es ni l'enseignant·e. »
- « En attente » : hors des pourcentages, compté à part (« N étudiant·es en attente de la note du cours »). Supposition technique de Cowork, nommée.
- Le 70 % est une constante unique, nommée, lue par la carte et par l'Aide.

## 3. L'Aide

La carte RàI de l'Aide dit ce que montre la réponse du groupe, qu'elle est facultative et éteinte au départ, et le seuil de 70 %. Phrases à proposer, à faire valider par Grégoire avant la release.

## 4. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de release. Relecture de Cowork.
