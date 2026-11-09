# Consigne : lot « L'utilisateur choisit le sort d'une copie non recevable » (8 nov. 2026)

**Écrite par Cowork le 8 nov. 2026 vers 15 h 45 (heure de Montréal).** En ligne : 1.237.0. Sur le Mac : 1.237.1 commitée (`47e2e8681`), pas encore poussée. Fiche : #1176, corrigée en `27f619dc1`. Décisions de Grégoire prises en séance Cowork le 8 nov., de 15 h 28 à 15 h 40.

**À commencer APRÈS le verdict et le push de la 1.237.1.** Ce fichier se commite AVEC le lot (PROTOCOLE.md). Si tu le lis plus de quelques heures après son écriture, vérifie d'abord que l'état du dépôt n'a pas bougé.

## Le principe (ses mots)

Une copie plagiée est écartée parce qu'elle n'est pas valide, pas authentique : il ne peut pas évaluer un travail que l'élève n'a pas fait. Des collègues mettent 0, lui non. **Ne jamais généraliser sa pratique de classe.** « L'idéal, c'est toujours de laisser le choix à l'utilisateur. C'est lui qui sait comment il gère dans sa classe. » L'utilisateur choisit explicitement d'écarter la copie, de lui mettre 0, d'accepter ou de refuser un jeton. Il connaît ses règles, il peut les ajuster ou les contourner. Rien ne se fait à son insu.

## Les cinq décisions

1. **Où vit le choix : dans la pratique ET sur la copie.** La règle se pose dans la pratique de notation. Quand l'utilisateur marque une copie « Non recevable (Plagiat) » ou « Non recevable (IA non autorisée) », sa règle apparaît déjà cochée sur la copie, avec ce qu'elle fera à la note, et il peut la changer pour cette copie-là.
2. **Deux choix : « l'écarter » ou « lui mettre 0 ».**
   - **Écarter = traitée EXACTEMENT comme une copie non remise**, dans toutes les familles. Sommative : elle n'entre pas dans la note. Spécifications : ce que la pratique fait d'une non remise. Standards : elle manque au portfolio, avec ce que la pratique fait déjà d'une copie manquante sous le nombre minimal (son exemple : 4 requises, 3 faites, la 4e, plagiée, vaut 0).
   - **Lui mettre 0** : 0 en sommative, « non satisfaisant » en spécifications, 0 en standards.
   - Dénotation : sans objet, la note est un jugement saisi.
3. **Complétion (C) : non remise dans les deux cas.** Motif : C dit au dépistage si l'élève fournit son propre travail ; le 0 sanctionne la note, il ne dit pas que l'élève a travaillé.
4. **Terminale des standards : une fois les notes finales cochées, une terminale manquante vaut 0, qu'elle soit non remise OU écartée.** Pendant le trimestre, la note reste provisoire, comme aujourd'hui. ⚠ **Ça change aussi le sort d'une terminale NON REMISE** : accord explicite de Grégoire, 15 h 38.
5. **Pratiques existantes : leur règle est leur comportement actuel.** Sommative : 0. Spécifications : non satisfaisant. Standards : écartée (obligatoire hybride et terminale : 0 une fois les notes finales cochées). Aucune note ne bouge sans un geste de l'utilisateur. Une NOUVELLE pratique demande le choix à sa création, **sans réponse cochée d'avance**. Ne pas compter sur les Nouvelles pour l'annoncer (« les utilisateurs ne lisent pas les nouvelles ») : c'est la copie, au moment où il la marque, qui le lui apprend.

## Ce que Cowork a lu au code (à reprendre avant de coder)

Commande de départ : `git grep -n 'noteRetenueParLeCalcul\|valeurCopieNonRecevable\|evaluationNonRecevable' -- 'js/*.js' 'js/**/*.js'`

- **Le point unique** : `VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT`, `valeurCopieNonRecevable`, `noteRetenueParLeCalcul` (`js/pratiques/pratique-registre.js`, vers 1115-1138). Son commentaire dit que les familles ne lisent que ces deux fonctions : à vérifier, et à corriger (il attribue encore la règle à Grégoire).
- **La terminale manquante** : `js/pratiques/pratique-pan-standards.js` vers 240-242 (« note provisoire = pool seul ») ; `_calculerNoteFinaleAggregee` (`js/profil-etudiant-actions.js`, vers 371-375) ne lit pas `estFinale`. Lu au code, pas vu à l'écran.
- **Le dépistage** : `calculerIndicesNDerniersArtefacts` (`js/profil-etudiant-calculs.js`, vers 1425) moyenne `e.noteFinale` brut. Il doit suivre la règle (écartée : sort comme une non remise ; 0 : 0), comme `_lireLesCopiesDuDepistage` (vers 1849).
- **Les trajectoires** (#1226) : `js/graphiques-progression.js` vers 3930, via `noteRetenueParLeCalcul`. Elles suivent la règle.
- **L'écran** : le menu `#statutIntegrite` (`index.html`, vers 8299) ; l'Aide `accordeon-aide-irrecevables`, qui dit aujourd'hui « en sommative, elle vaut 0, sauf si une reprise la remplace ».

## Choix techniques posés par Cowork (à contester si la mesure dit mieux)

- **Lecture au calcul, sans migration.** Une pratique sans règle écrite se LIT comme son comportement actuel ; rien n'est écrit dans `pratiquesConfigurables` tant que l'utilisateur ne choisit pas. Motif : pas d'écriture de masse dans les données des gens (hygiène des données partagées).
- **Le choix de la copie est un champ de l'évaluation**, lu au calcul ; absent, c'est la règle de la pratique. Il voyage (codex, export, import) : une copie ancienne sans le champ se lit comme aujourd'hui.
- **Les niveaux d'une copie non recevable restent hors des lectures dans les deux cas** (#1228 ; décision du 28 oct., « ses niveaux ne se lisent nulle part »).
- Format qui voyage : **relecture croisée de Cowork due** (règle 2) avant le verdict.

## Les mots, à faire valider par Grégoire AVANT l'écran

Proposer un texte à corriger, jamais lui demander de le composer.

- la ligne qui apparaît sur la copie (le choix, et ce qu'il fera à la note) ;
- la question posée à la création d'une pratique ;
- le paragraphe « Travail NON RECEVABLE » de l'Aide.

## Pièges connus

- **Le minimum des standards.** Mesurer ce que fait aujourd'hui une copie manquante sous le nombre minimal (plafonnement de conformité, `_appliquerPlafonnementConformite`) et le confronter à son exemple (4 requises, 3 faites, la 4e vaut 0). S'ils diffèrent, **remonter sans trancher** : c'est de la didactique.
- **Terminale non recevable en standards, pendant le trimestre** : aujourd'hui elle vaut 0 tout de suite ; « écartée », elle laisse la note provisoire. C'est la seule note qui pourrait bouger sans geste dans une pratique existante. Mesurer au pack démo et le dire.
- Tarir, pas réparer : aucune copie déjà marquée n'est réécrite. Les captures déjà prises gardent leur valeur.

## Ce qui n'entre PAS

L'export recherche (question en attente auprès de Grégoire). Les comptes d'erreurs du signalement au dépistage. Les jetons et les reprises (inchangés). A2025 et H2026.

## Preuve exigée

- Pour chaque famille × chaque choix (écarter, 0) × chaque place (portfolio, obligatoire hybride, terminale), la note calculée ; un break-test par branche.
- Pack démo : la liste des élèves dont la note ou le niveau RàI change sans geste de l'utilisateur. Attendu : aucun, sauf les deux cas des pièges, à rapporter tels quels.
- Specs WebKit de la copie : le choix apparaît au marquage, coché selon la règle de la pratique, et se change pour cette copie.

## Écritures de backlog

#1176 devient ce lot ; #1226 y est lié. La terminale non remise à 0 une fois les notes finales cochées s'inscrit dans #1176 ou dans une fiche à part (à toi de choisir).
