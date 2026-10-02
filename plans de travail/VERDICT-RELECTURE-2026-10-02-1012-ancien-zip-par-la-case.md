# Verdict de relecture – #1012, suite : l'ancien `.zip` ouvert par la case ne fait plus perdre de copies

> Rendu le 2 octobre 2026 à 7 h 48 (Toronto, mesuré par `date`) par Cowork, sur le commit `d49e7100` (branche locale `fix-1012-ancien-zip-par-la-case`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-ancien-zip-par-la-case.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Lu** (`git diff b5d3770b d49e7100`) :
- `fusionnerCopiesImportees` : la liste de l'espace sort intacte et dans son ordre ; `dejaLa` rend l'entrée DE L'ESPACE (pas celle du fichier) ; un doublon du fichier n'entre qu'une fois.
- `_ajouterCopiesImportees` : n'écrit la liste que si une copie neuve entre ; ne dépose un fichier pour une copie déjà là que si le `.zip` le porte, que la copie n'est pas « exporte » et que `recupererBlob` ne rend rien ; dans le doute (exception), rien n'est déposé.
- `_restaurerBlobsDepuisZip`, inchangée : elle relit la liste STOCKÉE avant de marquer « manquant » ; elle ne réécrit donc pas la liste fusionnée avec la seule part qu'on lui passe. C'était le risque que je cherchais : il n'existe pas.
- Le fichier revenu est rangé sous `etudiantDA` et `productionId` de l'entrée de l'espace, puisque c'est elle qu'on passe.
- `recupererBlob` est bien la lecture qui couvre les deux magasins (IndexedDB et dossier sur disque) ; `db.listBlobIds`, plus léger, n'aurait vu que le premier.

**Exécuté** (extraction de `d49e7100` par `git archive`, `npm ci` sous Linux) : Vitest complet, **7 894 verts sur 7 901** ; les 7 rouges sont les sentinelles qui interrogent git, mon extraction n'en a pas. Même artefact qu'aux deux verdicts du 1er octobre.

**Trois mutations de mon cru**, restaurées (empreinte identique, `c99fffee44d9d09a`, celle de ta demande), toutes rouges sur `unit/import-1012-copies-ajoutees.test.js` :
- les copies du fichier placées AVANT celles de l'espace : 3 rouges ;
- une copie sans identifiant écartée au lieu d'entrer : 1 rouge ;
- `_ajouterCopiesImportees` qui réécrit la liste du fichier : 1 rouge (ton verrou de structure).

⚠ Mes mutations portent sur la fonction pure et le verrou ; le comportement au magasin n'est tenu que par ton banc Playwright, que je n'ai pas rejoué.

## Ton exception du § 3 : retenue

Un fichier absent du magasin revient du `.zip`, sauf pour une copie « exporte ». Elle ne détruit rien, et elle garde un geste qui marchait. La règle stricte n'apporterait que vingt lignes de moins.

## Tes suppositions

Toutes deux justes : Grégoire a dit « oui » à 6 h 54, et la règle « s'ajoutent, sans rien effacer » est sa limite du 20 septembre appliquée par Cowork.

## Ce que je relève, sans bloquer. À inscrire sous #1012, issue 2.

1. **Copies et notes de deux sources (lu, non exécuté).** Une copie porte l'identifiant de son évaluation (`evaluationId`, lu par `travaux-resolution.js` pour retrouver la copie d'une évaluation). Avec « Notes » cochée, les évaluations viennent désormais du fichier, mais une copie déjà là garde l'entrée de l'espace : si les deux côtés n'ont pas la même évaluation pour cette copie, son lien pointe sur une évaluation remplacée. Avant ce lot, tout venait du fichier et restait cohérent ; mais les copies de l'espace perdaient leur entrée, ce qui est pire. **Ce n'est pas une régression à corriger ici : c'est une raison de plus pour que la case « Notes » cesse de remplacer**, dans le lot des quatre cases (§ 5 de ta demande). Le geste par défaut aggrave le cas : cocher « C'est ma propre sauvegarde » coche toutes les cases de données personnelles (`toggleDonneesPersoImport`).
2. **Le coût de la vérification au magasin (inféré, non mesuré).** Pour chaque copie déjà là que le `.zip` porte, `recupererBlob` est appelé une fois. Sur un ancien `.zip` volumineux, c'est autant de lectures. Ce chemin ne voit que les anciens fichiers (un codex passe par l'ouverture), sans doute plus petits ; à mesurer seulement si un ancien gros `.zip` ralentit.

## La suite

La release, quand Grégoire aura accepté la ligne des Nouvelles. Puis la porte, et le lot de la sélection (`CONSIGNE-SUIVANTE-2026-10-02-1012-selection.md`). Le lot des quatre cases (« Annotations », « Notes », « Étudiants », « Présences ») vient après : sans lui, le chantier du codex n'est pas « clos ».
