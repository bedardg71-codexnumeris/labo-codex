# Verdict de relecture – #1012, les quatre cases de l'import ne remplacent plus les données de l'usager

> Rendu le 2 octobre 2026 à 11 h 22 (Toronto, mesuré par `date`) par Cowork, sur le commit `d0927efb` (branche locale `fix-1012-quatre-cases`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-quatre-cases.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Lu** (`git diff 5e8a46f8 d0927efb`) :
- `MARQUES_DONNEES_PERSO` : pour les présences, l'espace publie la marque exacte et la marque « tout cours » ; une fiche du fichier sans cours cherche « tout cours », une fiche avec cours cherche son cours et « sans cours ». C'est bien « cours absent d'un côté = même cours ». Pour les notes, les champs `etudiantDA` et `productionId` sont ceux qu'écrit `evaluation-sauvegarde.js` (l. 145-146, 256-261).
- `fusionnerDonneesPersoImportees` : la liste de l'espace sort intacte et en tête ; les entrées du fichier ne se comparent qu'à l'espace ; une ancienne valeur qui n'est pas une liste n'est écrite que si l'espace n'a rien.
- Les quatre appels n'écrivent que si quelque chose entre, et comptent ce qui est entré.

**Exécuté** (extraction de `d0927efb` par `git archive`, dépendances Linux) : Vitest complet, **7 912 verts sur 7 919** ; les 7 rouges sont les sentinelles qui interrogent git, mon extraction n'en a pas. Même artefact qu'aux verdicts précédents.

**Quatre mutations de mon cru**, restaurées (empreinte identique, `26f5573324c54d07`), toutes rouges sur `unit/import-1012-quatre-cases.test.js` :
- une fiche de présence sans cours ne reconnaît plus une fiche de l'espace qui en a un : 1 rouge ;
- les notes perdent la marque élève × production : 2 rouges ;
- les annotations perdent la marque de la copie annotée : 1 rouge ;
- les entrées du fichier passent devant celles de l'espace : 3 rouges.

## Tes trois points

1. **La règle des notes, plus stricte que la consigne : retenue.** « Aucune évaluation de l'espace pour cet élève et cette production » est la seule qui garantit qu'aucune note ne change : une reprise du fichier sur une originale de l'espace non archivée aurait laissé deux évaluations actives (`evaluation-jetons.js`, l. 600 : c'est la reprise qui archive l'originale). Le prix : une reprise faite ailleurs n'entre pas. Il ne détruit rien.
2. **Le banc des anciens fichiers : retenu tel que tu l'as fait.** La référence de 1.172.0 n'est pas réécrite ; une seule clé sort de la comparaison, et une assertion neuve dit pourquoi (le groupe démo n'est plus vidé). Le bilan comparé au caractère près, sauf le compte des présences, explicitement transformé.
3. **Les deux sentinelles réancrées : retenues.** (g) interdit toujours la liste blanche de champs, et lit l'appel de la fusion ; ton essai passe par `tranche()`.

## Ta correction à la consigne

Juste : « C'est ma propre sauvegarde » coche trois cases, pas « Annotations ». Mon erreur de lecture.

## Ce que je relève, sans bloquer. À inscrire sous #1012, issue 2.

1. **Une copie neuve dont l'évaluation n'entre pas (lu, non exécuté).** Une copie du fichier absente de l'espace entre ; si l'espace a déjà une évaluation pour le même élève et la même production, l'évaluation du fichier n'entre pas, et le `evaluationId` de la copie neuve pointe sur rien. Rare (il faut deux copies différentes du même travail) ; rien ne se perd de l'espace.
2. **L'élève supprimé qui revient** : tu l'as mesuré par lecture (`supprimerEtudiant`, un `filter`). Ce n'est pas une régression (avant ce lot, le groupe du fichier remplaçait celui de l'espace, élève supprimé compris). Mais ce qu'une suppression doit emporter est une **décision de Grégoire** (CLAUDE.md, « ce qui remonte ») : inscris-la comme telle, sans lot.

## La suite

La release, quand Grégoire aura accepté la ligne des Nouvelles. Puis, sans porte (il n'a pas d'ancien `.zip` avec copies, et le banc juge par le geste), le chantier du codex n'a plus de lot de code : il lui reste des affaires de mots et une décision, toutes à Grégoire.
