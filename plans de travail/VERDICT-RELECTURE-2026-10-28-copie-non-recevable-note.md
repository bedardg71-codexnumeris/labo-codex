# Verdict de relecture – Une copie non recevable vaut ce que la règle dit, dans le calcul (#1175)

> Cowork, mercredi 28 octobre 2026, 6 h 44 (Toronto, mesuré par `date`), sur `main` = `c7c4a58e`. Lu : la demande de relecture, le diff de `c177cc36` (registre, sommative, configurable, spécifications, standards, profil, Comparateur, `evaluation-sauvegarde.js`). Rejoué sur une copie du dépôt (Linux) : la sentinelle du lot (32 sur 32), celles du 15 oct. et du lot 2c de l'Aide (80 sur 80 en tout) ; deux mutations de Cowork (la note par défaut à 50 ; la sommative remise sur `noteFinale`) rougissent la sentinelle (6 et 4 échecs), fichiers restaurés à l'identique. Playwright non rejoué.

## Verdict

**Le code est accepté sans retouche.** La règle vit à un seul endroit (`VALEUR_COPIE_NON_RECEVABLE_PAR_DEFAUT`, `js/pratiques/pratique-registre.js`), lue par `valeurCopieNonRecevable` et `noteRetenueParLeCalcul` ; plus aucune famille ne relit `statutIntegrite`. Elle se lit au calcul : les copies déjà verrouillées suivent sans écriture (essai du stock). Le retrait du bloc des menus est juste : il ne trouvait aucun menu, et l'Échelle de départ n'a pas de « 0 ». Le `const noteRetenue` de `profil-etudiant-actions.js:220` est dans l'IIFE du module (l. 26-772) : pas de collision globale. Les jetons `?v=` des huit fichiers changent tous.

## Les décisions de Grégoire, et la retouche qu'elles demandent

1. **Décidé par Grégoire le 28 oct. 2026 à 6 h 46** (« oui », sur la recommandation de Cowork de 6 h 45) : sur le PDF de l'étudiant·e et sur le formulaire, **la note et les niveaux d'une copie non recevable cèdent leur place à « Non recevable (plagiat) » ou « Non recevable (IA non autorisée) »**, comme la Liste des évaluations le fait déjà. La rétroaction écrite reste. L'évaluation de l'enseignant·e est conservée dans les données, sans être affichée : retirer le statut fait tout revenir (aucune écriture, rien de perdu). Les libellés : ceux du menu « Intégrité académique » (`index.html:8485-8490`), à la casse de l'écran. Ce point devient une retouche de Claude Code (essai : le PDF d'une copie non recevable ne contient ni sa note ni ses niveaux ; retirer le statut les rend).
2. **Le message de l'écran** (`js/evaluation-sauvegarde.js:620` et suivantes) : **validé par Grégoire le 28 oct. 2026 à 6 h 49** (« je garde »), mot pour mot. Titre en gras, puis le paragraphe, puis la phrase du jeton pour le plagiat seulement, comme le bloc actuel :
   > **Travail non recevable**
   > Ton évaluation est gardée, mais la copie montre « Non recevable » au lieu de sa note et de ses niveaux, jusque sur le PDF de l'étudiant·e. Dans la note du cours, elle vaut ce que dit ta pratique : 0 en sommative, un travail non satisfaisant en spécifications, hors du portfolio en standards. Dans la complétion, elle compte comme non remise. Retirer le statut fait tout revenir.
   > (plagiat seulement) Un jeton de reprise peut être appliqué pour permettre une nouvelle remise.
3. **La ligne de la procédure de l'Aide** (`accordeon-aide-irrecevables`) : **validée par Grégoire le 28 oct. 2026 à 6 h 49**, mot pour mot :
   > Non recevable, ton évaluation est gardée, mais la copie montre « Non recevable » au lieu de sa note et de ses niveaux, jusque sur le PDF ; dans la note, elle vaut ce que dit la règle ci-dessus. Verrouille ensuite.

Le point 4 de la demande (les copies déjà marquées suivent la règle) n'est pas une question : c'est la règle de Grégoire, appliquée. Pour sa propre pratique (standards), sa note finale écartait déjà la copie.

## Trouvailles (disposition de Cowork)

- **Le dépistage lit encore la note calculée** d'une copie non recevable (`pratique-pan-standards.js:281, 905`, `pratique-sommative.js:379`, `pratique-pan-specifications.js:472, 563, 689`) : ce qu'une copie non recevable dit du besoin d'un·e étudiant·e est une question de didactique ; **versé à #1176** (le réglage de la pratique), à trancher avec lui. Ajoute ces six sites à sa fiche.
- Les trois sites d'affichage qui relisent le statut (moyenne de la Liste, profil, réconciliation) : issue 3, sans conséquence observable.

## La retouche (Claude Code)

1. **L'affichage** (décision 1) : formulaire et PDF ; libellés de l'écran ; l'évaluation reste en base, intacte. Essais : le PDF d'une copie non recevable ne contient ni sa note ni ses niveaux ; il garde la rétroaction écrite ; retirer le statut rend note et niveaux ; aucune écriture dans `evaluationsSauvegardees` au rendu. Les insécables comme les textes voisins.
2. **Le message** (décision 2), mot pour mot, avec un essai qui le lit dans le module.
3. **La ligne de l'Aide** (décision 3), mot pour mot ; les quatre lignes par famille et le « 7/9 » ne bougent pas.
4. **#1176** : ajoute à sa fiche les six sites du dépistage (§ Trouvailles).
5. Un commit pour le code, un pour les docs ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-copie-non-recevable-note-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.
