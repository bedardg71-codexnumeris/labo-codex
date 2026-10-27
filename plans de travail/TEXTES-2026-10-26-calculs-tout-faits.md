# Textes – Ce que veulent dire les calculs tout faits (étape 4 du critère algorithmique)

> ✅ **VALIDÉS PAR GRÉGOIRE le 26 oct. 2026 à 20 h 53** (« ça convient »), sur la proposition de Cowork de 20 h 50. Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 4 (« Revient à Grégoire : ce que veulent dire les calculs tout faits »). Mesuré dans `js/evaluation-formules.js` (les trois modèles). Rien n'est codé.
> Les noms et les aides d'aujourd'hui parlent d'« erreurs », de « mots » et de « texte » ; ces textes n'emploient que les deux noms de l'enseignant·e. Les identifiants enregistrés (`penalite_normalisee`, `ratio_cible`, `penalite_par_erreur`) ne changent pas.

## 1. Pénalité proportionnelle à la longueur (aujourd'hui « Pénalité normalisée », `penalite_normalisee`)

> Chaque occurrence retire des points en proportion de la longueur de la copie : le même nombre d'occurrences coûte moins sur une copie plus longue. Tu fixes la longueur sur laquelle une occurrence coûte un point.

Exemples (pondération 20) : longueur fixée à 500 mots, 12 erreurs sur 600 mots → 10 / 20 ; longueur fixée à 12 calculs, 3 unités manquantes sur 12 calculs → 17 / 20.

## 2. Rapport visé (aujourd'hui « Ratio mots par erreur », `ratio_cible`)

> Tu fixes le rapport qui donne la note entière, par exemple une occurrence à chaque 60 mots. Une copie qui l'atteint a la note entière ; en deçà, la note baisse en proportion. Une copie sans occurrence a la note entière.

Exemples : rapport visé d'une erreur à chaque 60 mots, 12 erreurs sur 600 mots → 16,67 / 20 ; une unité manquante à chaque 6 calculs, 3 unités manquantes sur 12 calculs → 13,33 / 20.

## 3. Pénalité fixe (aujourd'hui « Pénalité fixe par erreur », `penalite_par_erreur`)

> Chaque occurrence retire le même nombre de points, quelle que soit la longueur de la copie. La longueur reste comptée pour les phrases de l'étudiant·e, mais n'entre pas dans la note.

Exemples : 1 point par erreur, 12 erreurs → 8 / 20 ; 2 points par unité manquante, 3 unités manquantes → 14 / 20.

## Communs aux trois

- La note ne descend jamais sous 0 (`pctBorne`).
- **Ce que le calcul compte** (mesuré, `evaluation-calcul.js` l. ~645-661 ; question de Grégoire, 20 h 53) : chaque code posé compte pour la pondération de son sous-critère ; la somme (le compte pondéré) entre dans la formule ; la formule donne directement la note du critère sur sa pondération. Le pourcentage du critère entre ensuite dans la note de la production comme celui de tout critère, selon la pratique de notation. Les exemples ci-dessus supposent des codes de pondération 1.
- Les calculs de la limite (la part de la limite, la moyenne, le compte projeté) gardent le sens qu'ils ont dans l'atelier depuis le lot 3a : rien à trancher.
