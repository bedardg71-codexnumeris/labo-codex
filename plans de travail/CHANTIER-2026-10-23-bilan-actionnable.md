# Chantier – Un bilan qui dit à l'élève quoi faire ensuite

> Cowork, vendredi 23 octobre 2026, 7 h 07 (Toronto, mesuré par `date`). **Point de départ d'une session dédiée**, décidée par Grégoire à 7 h 06 : ce chantier ne s'ouvre pas dans la session de la 1.215.0. Rien n'est planifié ni codé ; ce fichier garde ses mots, ce qu'il a montré, et ce qui existe déjà. Aucun nom d'élève.

## 1. Ce que Grégoire a dit (23 oct. 2026, de 6 h 56 à 7 h 06)

- 6 h 56 : « il faudrait ouvrir un petit chantier sur la lecture de la rétroaction par l'élève, car il y a beaucoup d'informations qui est livrée et je voudrais que l'on développe une section bilan où l'élève pourra trouver les priorités opérationnalisables sur lesquelles il devra travailler dans les prochains travaux. »
- 7 h 01, en montrant les trois sections d'une même copie de l'Artefact 4 : « Le document de synthèse de la rétroaction est vraiment très long. […] Ce que je voudrais que l'on fasse, c'est qu'on soit un peu plus directif dans la section bilan afin d'indiquer de façon très explicite les priorités. Car nous avons un rapport détaillé, mais il faut rendre actionnable ce rapport. »
- 7 h 06 : le chantier se fait dans une session dédiée ; ce document en est le point de départ.
- 7 h 08, ajouté au chantier : « lorsqu'un étudiant a moins de 4 artefacts de produits, la note provisoire ne peut pas être affichée parce que le nombre de 4 est un minimum. Si un élève, par exemple, a 3 artefacts de fait, prenons pour exemple celui dont le travail est irrecevable, je voudrais qu'il n'ait par défaut qu'une note en lettres. »
  - **Lecture de Cowork, à valider** : le minimum est le nombre d'artefacts que la pratique retient (« Sélection (4 retenues sur 4 possibles) » dans sa pratique), lu dans la configuration, pas un 4 écrit en dur. Sous ce minimum, le bloc « Note provisoire » ne montre pas de chiffre : le niveau seulement, par défaut. Un travail non recevable ne compte pas parmi les artefacts produits.
  - À mesurer au départ : ce que le bloc affiche aujourd'hui sous le minimum, et ce que « par défaut » laisse à l'enseignant (le choix « Note chiffrée » d'une copie l'emporte-t-il ?).

**Ce qu'on en retient, à valider avec lui avant tout plan** : le rapport détaillé reste tel quel ; le bilan devient l'endroit, court et directif, où l'élève lit ses priorités sous forme de gestes à faire dans ses prochains travaux.

## 2. La copie qu'il a montrée (trois captures, dans la conversation du 23 oct.)

Pratique « PAN-SDT-Litt A26 » (standards, portfolio hybride), Artefact 4, grille de 5 critères ; la copie : Structure D, Rigueur D, Plausibilité M, Nuance D, Français écrit I (26 erreurs sur 800 mots).

1. **Rétroaction par critère** : pour chaque critère, le constat suivi d'une piste (« Pour atteindre la maîtrise, vérifie chaque embranchement : … », « Pour aller plus loin, cherche… ») ; pour Français écrit, la ligne du calcul, la phrase du décompte, la projection EUF et une recommandation (Passerelle +).
2. **Commentaires ciblés (tampons)** et **Français écrit, les 2 catégories les plus fréquentes**, chacune avec son conseil (« Relis ton texte et vérifie systématiquement dans le dictionnaire… », « Identifie dans l'interligne le genre et le nombre du nom… »).
3. **Bilan** : l'intro (« Mes standards sont très élevés… » ; « Selon toi, quel aspect… ») ; « Présentement, il faut se concentrer sur » ; « Points récurrents » ; « Jetons utilisés » ; « Note provisoire ».

**Constat de Cowork, à vérifier avec lui** : « Présentement, il faut se concentrer sur » nomme quatre critères (Français écrit, puis trois « à consolider ») et recopie leur **définition**, c'est-à-dire ce qu'est le critère, pas ce qu'il faut faire. Les gestes existent ailleurs dans le même PDF, dispersés : la fin des commentaires de cartouche, les conseils des catégories, les tampons (« Approfondir » ×3).

## 3. Ce qui existe déjà (à remesurer au départ)

- Le code du bilan : `js/synthese-retroaction-data.js`, `construireBilan` (l. ~813) : `BILAN_INTRO`, `construireConcentration` (« Présentement »), `construireRecurrents`, `construireJetons`, `construireNoteProvisoire` / `construireNoteSommative` ; le rendu dans `js/synthese-retroaction-rendu.js` (`renderRangeeBilan`, l. ~681).
- ⚠ **La forme actuelle de « Présentement » est une décision de Grégoire** (24 sept. 2026, chantier « synthèse des rétroactions », #940) : « la définition de chaque critère à travailler ». La rendre plus directive, c'est revenir sur sa décision : à lui de trancher. Lire d'abord `_ancienne-CONSIGNE-DU-JOUR-2026-09-24-lot-940-bilan.md` (§ 0, ses décisions, mot pour mot), puis `_ancienne-CONSIGNE-DU-JOUR-2026-09-21-f4-1-bilan-mots-eleve.md` (les mots de l'élève).
- Les pistes d'action sont déjà écrites par lui, dans ses cartouches, **mêlées au constat** dans un même texte.

## 4. La question posée à 6 h 59, sans réponse encore

« Ces priorités, tu veux les écrire toi-même (par exemple, la partie « prochaine étape » de chaque cartouche, rassemblée dans le bilan), ou tu veux que l'application les déduise des résultats (les critères les plus faibles, les tampons qui reviennent) ? »

## 5. Ce qui encadre le chantier

- **Ce que l'élève lit revient à Grégoire**, mot pour mot ; Cowork propose un texte à corriger.
- Aucune IA dans l'application : l'enseignant « programme » ses textes, son jugement reste souverain (principe du 21 oct.).
- Rien en dur pour une discipline (principe du 21 oct.) : le bilan doit tenir en chimie comme en littérature.
- « Tarir n'est pas réparer » : les PDF déjà remis ne changent pas ; un bilan neuf vaut pour les PDF à venir.

## 6. Liés, mais traités dans la session de la 1.215.0

La phrase de Français écrit qui garde un ancien compte, et ce que lit l'élève d'un travail non recevable : `RETOURS-2026-10-23-matin.md`, §§ 1 et 2.
