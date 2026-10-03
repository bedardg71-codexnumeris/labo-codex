# Consigne du jour – #1007, lot 2a-2 : le codex proposé sur les gestes qui restent

> Écrite par Cowork le 3 octobre 2026 à 10 h 36 (Toronto, mesurée par `date`). Remplace la consigne de 7 h 56, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-1007-2a-1-release-1.176.0.md`.
> Référence : ta demande `DEMANDE-RELECTURE-2026-10-03-1007-propose-codex.md` (§ 1 et 2), le verdict `VERDICT-RELECTURE-2026-10-03-1007-propose-codex.md`, les décisions `DECISIONS-2026-10-02-1007-suppressions.md` (§ 8).

**Où on en est.** 1.176.0 est en ligne ; la porte de Grégoire est passée à 10 h 35, dix-neuf rangées sur dix-neuf. Ce lot branche ce qui reste du côté « propose », sur la **même fonction** `Codex.proposerAvantSuppression` et les **mêmes mots** de fenêtre ; seules les premières phrases neuves sont à Grégoire.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à retirer le worktree `1007-propose-codex` (branche fusionnée, après vérification qu'il n'a rien de non commité). **Ni push du code ni release** : relecture croisée d'abord (règle 2).

## 1 · Le périmètre, et ce que Cowork a tranché pour chaque geste

Par ordre de risque pour les données (si tu dois couper, coupe par le bas et dis-le) :

1. **La fusion de copies (P11)** : les copies absorbées sont effacées sans passer par la corbeille. La fenêtre paraît à « Enregistrer », **seulement si** l'enregistrement absorbe au moins une copie, et seulement si le codex n'est pas à jour.
2. **`supprimerFichierImporte`** (`js/travaux-ui.js`, la copie **et** son évaluation, sans corbeille ; porte vivante trouvée par ta remesure) : branchée comme les autres, avant sa question si elle en a une, au geste sinon.
3. **Les jetons de reprise (P12, P13)** : P12 n'appelle la fenêtre que pour la pratique « supprimer l'originale » (sinon rien n'est effacé), aux quatre portes ; P13 avant ses deux `confirm`. Les chaînes synchrones deviennent `async`, et **chaque appelant qui lit le booléen** est mis à jour (grep, tableau dans la demande).
4. **L'éditeur de pages (P10)** : à « Enregistrer », seulement si une page a été retirée.
5. **« Remplacer l'existante » (P21)** : la fenêtre paraît **après** le choix « Remplacer l'existante » dans la modale de doublon, avant le remplacement ; pas sur les autres choix. Les cinq familles appelantes.
6. **La séance de présences (P5)** : seulement quand la séance est en base (sinon rien n'est effacé, rien à proposer).
7. **« Effacer tout » (P14)** : seulement si la page porte au moins une annotation.
8. **Le registre longitudinal (P6) et le bilan réflexif (P16)** : la question vit dans le dispatcher (`data-confirm`, synchrone). **Tranché** : on ne touche pas au dispatcher central ; la question passe **dans la fonction**, mots inchangés, `data-confirm` retiré de ces deux boutons seulement. La fenêtre vient avant elle.

**Hors périmètre** : `retirerResultatLongitudinal` (une ligne d'éditeur, côté « rien », décision § 3) ; la suppression d'un dossier (un classement, côté « rien ») ; le lot 2b (les lignes d'éditeur qui portent des notes) ; tout mot des questions existantes, même faux (C8).

## 2 · La leçon du verdict, dès le départ

Pour chaque porte : ce qui est écrit après l'attente vient-il d'une lecture faite avant ? Là où oui, relire après l'attente. Le tableau des portes de ce lot dans ta demande, une ligne chacune (« relit », « relu après l'attente », « liste capturée exprès »). Les écritures différées (P5, P14, la fusion) sont les plus exposées : dis comment l'attente s'insère sans qu'une sauvegarde différée parte pendant qu'elle dure.

## 3 · Les mots

Une première phrase par geste neuf dans le registre `PROPOSITIONS_AVANT_SUPPRESSION`, sur le modèle accepté (« Supprimer cette … l'efface pour de bon. » + le pronom), **sans autre mot neuf**. Propose-les en tableau dans ta demande : elles sont à Grégoire.

## 4 · La preuve

- La sentinelle de 2a-1 s'étend aux portes neuves (registre, compte, forme de la ligne) ; pour les portes conditionnelles (fusion, pages, jeton, séance, « Effacer tout »), un essai qui démontre que la fenêtre ne paraît **pas** quand rien n'est effacé.
- Le banc WebKit : au moins la fusion, un jeton de reprise, et P6 (la question déplacée dans la fonction : mêmes mots qu'avant, « Annuler » n'efface rien).
- Mutations démontrées rouges, comme au lot précédent. Vitest complet. Les bancs voisins qui passent par ces portes, lancés (doublure « codex à jour » si le banc juge autre chose). Pas de verdict Playwright complet : il viendra avec la release.

## 5 · Ce que tu rends

1. Commit sur une branche locale `claude/1007-propose-codex-2`, non poussée ; l'arbre principal laissé sur `main`.
2. `plans de travail/DEMANDE-RELECTURE-2026-10-03-1007-propose-codex-2.md` : en tête, pour Grégoire, trois lignes en gestes d'utilisateur ; puis la remesure, le tableau des lectures, les variantes de mots, la ligne des Nouvelles proposée, ce que tu as supposé.
3. `RELAIS.md` à jour.

À Grégoire, trois lignes : ce que le lot fera à l'écran ; ce qui l'attend ; ce que tu as supposé.
