# Consigne – le statut « Incomplet ; travail en cours » (dimanche 25 octobre 2026)

> Écrite par Cowork le dimanche 25 octobre 2026 à 9 h 03 (Toronto), en lecture seule, pendant qu'une autre session travaille sur le code.
> **Ordre (décision de Cowork)** : APRÈS le lot en cours (`CONSIGNE-LOT-2026-10-25-rouge-github-1217.md`), AVANT le lot 2 des bibliothèques. Motif : Grégoire évalue ses copies en ce moment et en a besoin maintenant. Sur `main`. Si la relecture est faite à temps, il peut entrer dans la version du soir ; sinon, la suivante.
>
> Demande de Grégoire (25 oct., 8 h 58) : « j'aurais besoin que l'on crée un nouveau statut : «Incomplet ; travail en cours». Je voudrais mettre ce statut, sans note, quand un élève n'a pas eu le temps de terminer son travail et que je lui donne un délai sans utilisation de jeton. »

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5) ; pas de suite Playwright complète (règle 7).
- Commit de docs seul, fichier nommé : cette consigne.

## 1. Les décisions de Grégoire (didactique ; ne pas les rediscuter)

1. **Le libellé, mot pour mot** : « Incomplet ; travail en cours ».
2. **Sans note.** Tant que le statut est posé, la production **ne compte pas dans la note** de l'élève : elle est mise de côté, elle ne vaut pas zéro (hypothèse de Cowork à 8 h 59, non corrigée par Grégoire).
3. **Aucun jeton** n'est consommé.
4. **Le travail terminé arrive dans un nouveau fichier qui remplace la première copie** (9 h) : c'est le geste qui existe déjà, « Remplacer l'existant » à l'import (`travaux-ui.js`, l. ~4330-4366).
5. **Pendant le délai, la production compte comme remise pour l'indice C** (9 h 02, sur recommandation de Cowork : l'élève a remis quelque chose à temps, le délai vient de l'enseignant).

## 2. Mesuré dans le code (Cowork, 25 oct., lecture seule)

- Le statut de remise existe, **caché** : `#remiseProduction1` (`index.html`, l. ~8460, `groupe-form u-hide`), valeurs `non-recu`, `recu`, `importe`, `annote`, `evalue`, tenu par l'application ; `changerStatutRemise` (`evaluation-sauvegarde.js`, l. ~548) masque les critères pour `non-recu`.
- Le statut d'intégrité, visible : « Recevable », « Soupçon à vérifier », « Non recevable (Plagiat) », « Non recevable (IA non autorisée) » ; « Soupçon » a son badge dans la Liste des évaluations (`liste-evaluations.js`, l. ~947-964). Modèle utile pour un statut qui garde l'évaluation sans la juger.
- **Une évaluation n'entre dans la note que verrouillée** (`evaluationEntreDansLaNote`, `pratique-registre.js`).
- **La complétion se calcule à trois endroits qui ne disent pas la même chose** :
  - `calculerCompletionSommative` (`liste-evaluations.js`, l. ~227) : toute évaluation non remplacée compte comme remise ;
  - `calculerCompletionAlternative` (l. ~265) : seules les évaluations **avec une note** comptent, une copie « Incomplet » n'y compterait donc pas ;
  - `snapshots.js` (l. ~202-271) : un troisième calcul de l'indice C.
- L'auto-save ne crée une évaluation que s'il y a des niveaux ou une intégrité signalée (`evaluation-chargement.js`, l. ~2152-2160) : un statut posé sans niveau doit pouvoir s'enregistrer.

## 3. Ce qui doit tenir

1. **Où Grégoire le pose (décision de Cowork)** : en mode Évaluer, dans la palette « Paramètres », une case « Incomplet ; travail en cours », visible pour toute copie. Forme exacte selon le skill `design-interface` (cible tactile iPad).
2. **Posé** : les critères et la note disparaissent du formulaire (comme pour `non-recu`) ; l'évaluation s'enregistre avec ce statut, **sans note**. Le champ de données est ton choix (une valeur de `statutRemise` ou un champ à part) : justifie-le dans la demande de relecture.
3. **Jamais dans la note** : une évaluation qui porte ce statut n'entre pas dans le calcul de la note, **verrouillée ou non**. La garde vit là où se décide l'entrée dans la note, pas dans l'affichage.
4. **Toujours remise pour C**, dans les trois calculs du § 2. Si aligner `calculerCompletionAlternative` ou `snapshots.js` change un chiffre affiché dans un autre cas que celui-ci, **arrête-toi et écris-le** : Cowork le soumettra à Grégoire.
5. **Visible** partout où le statut d'une copie s'affiche : la pastille de la copie (barre latérale, barre d'outils), la Liste des évaluations (un badge, sur le modèle de « Soupçon à vérifier »), le profil de l'élève. Le libellé complet partout où il tient ; « Incomplet » seul dans une pastille trop étroite (décision de Cowork).
6. **Retiré** quand Grégoire décoche la case : l'évaluation redevient ordinaire et il évalue la nouvelle copie comme d'habitude. Rien ne se retire tout seul ; aucune trace n'est gardée après le retrait (décision de Cowork, à revoir s'il la demande).
7. **Le remplacement de la copie** (« Remplacer l'existant ») garde le statut sur l'évaluation de cet élève pour cette production : mesure-le, ne le suppose pas.
8. **Le PDF de l'élève** : mesure ce qu'il produit pour une évaluation qui porte ce statut. Il ne montre aucune note. S'il montre le statut, c'est avec le libellé du § 1. Écris ce que tu as vu.
9. **Ce qui voyage** (codex, exports, imports, partage) : la nouvelle valeur passe les validations d'import ; un ancien fichier sans elle s'ouvre comme avant. Les données déjà écrites ne changent pas (source seulement, pas de stock).
10. Règles de sécurité de `CLAUDE.md` ; aucun nom d'élève réel dans les tests.

## 4. Aide

Une phrase dans l'aide de l'évaluation, là où sont décrits les statuts : ce que fait « Incomplet ; travail en cours » (pas de note, pas de jeton, compte comme remis). Mets la phrase exacte dans la demande de relecture.

## 5. Tests

Spec Playwright, vrais clics, break-test démontré :
- cocher la case : critères et note masqués ; l'évaluation est enregistrée avec le statut, sans note ; la note de l'élève est la même qu'avant que la copie existe (production exclue) ; C la compte comme remise ;
- verrouiller (si le geste reste possible) ne la fait pas entrer dans la note ;
- remplacer la copie par un nouveau fichier : le statut reste ;
- décocher : l'évaluation redevient ordinaire et entre dans la note une fois évaluée et verrouillée.
Vitest pour la garde de la note et pour les trois calculs de C.

## 6. Clôture

- **Pas de release, ni verdict, ni push** : le lot rejoint ceux du jour.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-25-statut-incomplet.md`.
- Trouvailles en chemin : les trois issues de `CLAUDE.md`, nommées.
- Termine par le geste à vérifier à l'écran après la mise en ligne : sur une copie inachevée, en mode Évaluer, cocher « Incomplet ; travail en cours » ; la note disparaît, la copie porte « Incomplet » dans la barre latérale et dans la Liste des évaluations, et la note de l'élève ne bouge pas.
