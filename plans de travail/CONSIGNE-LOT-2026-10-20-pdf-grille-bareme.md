# Consigne – Le PDF de la grille lit le barème (retour de testeur, #1120, une part du geste 4)

> Écrite par Cowork le mardi 20 octobre 2026 à 16 h 59 (Toronto, mesuré par `date`), sur `main` à `c8b2af98`. **À exécuter APRÈS** `CONSIGNE-LOT-2026-10-20-fiche-production-apres-pdf.md` et sa relecture : les deux touchent `js/export-pdf.js`, une seule session écrit à la fois. Plan : `PLAN-2026-10-19-bareme.md`, §4 « Ce que l'élève lit », complété ce jour. Retour de testeur : `BUG_"grégoire"_2026-10-20_16-54-01.txt`.

## Avant de commencer

Lis `VERDICT-RELECTURE-2026-10-20-fiche-production-apres-pdf.md` (accepté) et fais ses deux inscriptions dans ce commit : le code mort `afficherFormulairePDFDepuisEchelle` / `afficherFormulairePDFDepuisCartouche` (une fiche neuve, son numéro reporté dans le verdict) ; la CI rouge sur `c8b2af98`, rattachée à #1114.

## Le symptôme, dans ses mots

« Quand je veux voir l'aperçu, c'est encore l'échelle de performance qui est affichée. La visualisation du PDF ne ressemble pas du tout à ma grille. » Sa grille : « Journal de lecture A26 », quatre critères analytiques à barème (quatre tranches chacun), aucune échelle.

## La cause, mesurée au code par Cowork (à remesurer)

- `js/export-pdf.js` ne lit pas `bareme` (zéro occurrence).
- Le tableau des critères (`genererApercuCombine`, vers la l. 2364, et son jumeau jsPDF `genererPDFCombine`) a pour colonnes les niveaux de l'échelle, et pour cases les commentaires de la cartouche : un critère à barème n'y montre que des « — ».
- `ouvrirApercuPDFPour` (l. 3602) : `peutEvaluer = !!(grille && echelle)`. Le formulaire de préparation désactive « Voir l'aperçu » sans échelle (`mettreAJourOptionsInlinePDF`).

## La décision de Grégoire (20 oct., 16 h 58) — mots que ses élèves lisent

Sur la grille du PDF, un critère à barème montre **chacune de ses tranches : ses points, puis son texte, sans son nom**. Forme : « 3-4 points : Résume l'essentiel ». Unité au singulier sous 2 (« 1 point », « 1-2 points »), comme la règle C1 de la dissection. Les tranches dans l'ordre où l'enseignant les a écrites.

## Ce qu'il faut

1. **Lire par la fonction partagée** (`js/bareme.js`, `Bareme.tranchesDuCritere`) : le PDF reçoit les tranches, il ne les relit pas lui-même (plan, invariant 2). Un critère de l'ancien format (`parNiveau` sans `echelleId`) se lit par la même fonction.
2. **L'aperçu HTML et le PDF jsPDF disent la même chose** du même critère : un banc les compare.
3. **L'échelle n'est exigée que si un critère en lit une.** Une grille dont tous les critères ont un barème s'ouvre sans échelle, depuis la fiche comme depuis le formulaire ; une grille mixte garde l'échelle pour ses autres critères. Le libellé « Échelle de performance * » suit (l'astérisque disparaît quand elle n'est pas exigée).
4. **La disposition** : à toi de la trancher (skill `design-interface`), lisible imprimée en noir et blanc, sans couleur par tranche. Contrainte : une grille mixte garde ses colonnes de niveaux pour ses critères à échelle. Dépose des captures de l'aperçu et du PDF (sa grille « Journal de lecture A26 » recréée en banc, et une grille mixte) dans `plans de travail/captures-2026-10-20-pdf-grille-bareme/`, et nomme-les dans la demande : Cowork les regarde à la relecture, avant tout push.
5. **Supposition de Cowork, réversible** : une tranche « à compléter » (sans points) montre son texte seul, sans chiffre inventé. À lister dans la demande de relecture.
6. **Sécurité** : `escapeHtml`/`echapperHtml` sur le texte d'une tranche ; un banc pose un `<img onerror>` dans un texte de tranche et vérifie qu'il sort en texte.

## Ce qui ne fait PAS partie de ce lot

- La copie corrigée (le chiffre, et dessous le texte de la tranche atteinte) : reste au geste 4, après le geste 3.
- Les critères algorithmiques ; la note ; P ; le Comparateur (invariant 1 : aucun calcul ne lit le barème).
- Le nom des tranches, nulle part dans le PDF.

## Les bancs

- **Vitest** : la ligne d'une tranche (un point, deux bornes, l'unité au singulier, une tranche à compléter) ; l'échelle exigée ou non selon la grille ; le `<img onerror>`.
- **WebKit** : une production liée à une grille toute à barème, sans échelle → « Préparer le PDF » ouvre l'aperçu, chaque critère montre ses quatre lignes, aucun « — », aucun nom de tranche ; une grille mixte garde ses colonnes de niveaux.
- **Break-test** : faire réapparaître le nom de la tranche, puis exiger de nouveau l'échelle → rouge chaque fois. Code restauré.
- Vitest complet vert ; les specs du PDF touchées vertes en WebKit. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Réécrire une grille ou une production existante.
- Toucher la copie corrigée, l'évaluation, le calcul.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne ; le verdict de la fiche de production et ses deux inscriptions ; le plan complété (§4) ; le correctif ; les bancs ; le BACKLOG (#1120 : « grille vierge du PDF livrée », et sa phrase « vérifié comment ») ; la ligne de `SUIVI-BUGS.md` ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-pdf-grille-bareme.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
