> **Partis en ligne le 22 nov. 2026 sans relecture ; à corriger après l'essai de Grégoire.** (Release 1.254.0, assemblage de cinq lots.)

# Textes — comparateur, colonne « Par standards » (21 nov. 2026)

Mots PROPOSÉS, non arrêtés. Grégoire les relit sur l'aperçu (Labo → Exploration, une colonne sur une pratique « Par standards »). Source unique dans le code : `js/pratiques/construction-attributs.js`.

## Lignes nouvelles (libellé de gauche et valeur)

| N° | Paramètre | Libellé de la ligne | Valeurs possibles |
|---|---|---|---|
| C1 | Objet | Cibles comptées | « 3 cibles, dont 1 terminale » · « 3 cibles, aucune terminale » · « 1 cible, dont 1 terminale » · « Aucune cible » · « Cibles introuvables dans ce trimestre » |
| C2 | Granularité | Niveau « sans donnée » | le nom du niveau désigné (ex. « Données insuffisantes ») · « Aucun niveau désigné » · « Le niveau désigné n'est plus dans l'échelle » · « Échelle introuvable dans ce trimestre » |
| C3 | Détermination | Calcul de la note | « Moyenne pondérée des valeurs des niveaux retenus » |
| C4 | Détermination | Double seuil | « Éteint » · « Note plafonnée à 55 % si la moyenne des cibles terminales est sous 60 % » (les deux nombres sont ceux de la pratique) · « Allumé, sans effet : aucune cible terminale » · « Allumé » (repli, sans chiffres lisibles) |
| C5 | Détermination | Notes finalisées | « Oui : une cible sans donnée compte pour 0 % » · « Non : pas de note tant qu'une cible est sans donnée » |

« Notes finalisées » et « sans donnée » sont les mots de la fiche de la pratique ; « Double seuil » est celui du réglage.

## Lignes existantes, valeur nouvelle pour « Par standards »

| N° | Libellé (inchangé) | Valeur proposée | Ce qu'elle remplace |
|---|---|---|---|
| C6 | Alignement sur des cibles d'apprentissage | « Couvert (la note se rapporte aux cibles) » | « Non couvert (la note se rapporte à des instruments) ». C'est la phrase déjà affichée pour la dénotation |
| C7 | Reprises | « Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser » | « La reprise prend la place de la copie d'origine dans la note » |
| C8 | Ce à quoi la note se rapporte | « Cibles d'apprentissage » | « — ». Même mot que la dénotation |
| C9 | Pondération | « Égale entre les cibles » · « Inégale entre les cibles (poids de 1 à 2) » · « Au moins une cible n'a pas de poids plus grand que zéro » · « Aucune cible » · « Cibles introuvables dans ce trimestre » | « Égale », écrit sans lire les poids |
| C10 | Échelle de performance ; Niveaux de performance (évaluations) | le nom et le nombre de niveaux, comme avant ; si l'échelle manque : « Échelle introuvable dans ce trimestre » | « — » quand l'échelle manquait |

## La garde (une famille que le comparateur ne connaît pas)

| N° | Où | Texte proposé |
|---|---|---|
| C11 | Cinq lignes (Productions comptées, Alignement, Reprises, Ce à quoi la note se rapporte, Pondération), et l'échelle si elle manque | « Non décrit par le comparateur pour cette pratique » |

Aucune pratique livrée ne l'affiche aujourd'hui : c'est ce qu'une famille future lirait à la place des valeurs d'une voisine.

## Mots repris sans changement

« s.o. » (une ligne que la pratique ne porte pas : « Productions comptées » pour « Par standards »), « Non couvert par l'application », « Réglage global (note différée), dans Réglages → Préférences », « 5 niveaux ».

## Ce qui n'est pas décrit

Les coches « essentiel » des critères : aucun calcul ne les lit (choix du 21 nov.), la colonne n'en dit rien.
