# Demande de relecture – lot 24 : contenir la complexité

> Claude Code, 12 octobre 2026, 8 h 30 (mesuré par `date`). Consigne : ajout de Cowork de 7 h 59 à `CONSIGNE-DU-JOUR.md` ; plan `plans de travail/PLAN-contenir-la-complexite.md` (maintenant sur `main` par la fusion `41632ab1`).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (750 fichiers, 8 752 essais).

## 1 · Ce qui change pour l'usager

Rien. Aucun fichier de `js/`, ni `index.html`, `styles.css`, `docs/`, `ETAT-PROJET.md`. Ce qui change, c'est la façon de travailler : une fonction qui franchit 30, ou une fonction déjà au-dessus de 30 qui monte, fait rougir Vitest, donc le hook pré-push.

## 2 · Le relevé, sur `main` à la fin du lot 23

| Indicateur | Valeur |
|---|--:|
| Fichiers analysés (`js/`, hors `js/_archives/`) | 204 |
| Fonctions | 12 962 |
| Au-dessus de 15 | **455** |
| Somme des complexités au-dessus de 15 | 11 482 |
| Au-dessus de 30 | **89** (dans 43 fichiers ; 6 anonymes) |
| Maximum | 130 (`executerImportSelectif`, `import-export.js`) |
| Lignes de code | 148 078 |
| Fichiers au-dessus de 1 000 lignes de code | 35 (dont 2 de données : `pack-demo-10.js` 10 011, `changelog-data.js` 2 131) ; le plus gros fichier de code : `planification-carte.js`, 8 267 |
| Non analysable, nommé | `js/pratiques/pratique-interface.js` |

**Fidélité.** Rejouée sur 1.198.0 (`304c3b58`, extrait par `git archive`), la mesure rend 13 187 fonctions, 463 / 91 / 130. L'écart avec le plan (13 240, 465) est **exactement** `js/_archives/entites-ui.js` : 53 fonctions, 2 au-dessus de 15. La maquette du plan et la mesure de mai le comptaient ; l'application ne le charge pas : le banc l'exclut. Avec lui, la mesure retrouve 13 240 / 465 / 91 / 130.

**Ce que les lots 20 à 23 ont fait aux chiffres** (1.198.0 → `main`) : au-dessus de 15, 463 → 455 ; au-dessus de 30, 91 → 89 ; somme au-dessus de 15, 11 687 → 11 482 (le compte et la somme baissent ensemble : rien n'a été déplacé).

## 3 · Ce qui est livré

| Pièce | Commit | Détail |
|---|---|---|
| `acorn` 8.18.0 | `f27b90ab` | `devDependency` exacte de `tests/`, verrouillée dans `package-lock.json`. **8.18.0 et non 8.19.0** (celle du plan) : 8.19.0 est sortie le 5 oct., il y a une semaine ; je prends la dernière qui a plus de deux semaines. Aucune dépendance propre |
| `tests/unit/_helpers/complexite.js` | `f27b90ab` | la mesure (définition ESLint 8.57 ; nommage par déclaration, variable, propriété, méthode, affectation) ; lancé à la main, imprime le tableau du § 2 (≈ 0,5 s) ; `--figer` imprime la liste au-dessus de 30 |
| `sentinelle-contenir-complexite` | `f27b90ab` | règle 1 (neuves, hausses, baisses à reporter), règle 2 (455, égalité : la liste suit le code), garde-fous (plus de 200 fichiers, plus de 10 000 fonctions, liste exacte des non analysables), témoins de la définition (un source fabriqué qui touche chaque point de décision : 18 ; chaînage optionnel et paramètre par défaut non comptés ; fonction imbriquée à part) ; `HAUSSES_ASSUMEES` pour écrire une hausse et sa raison |
| Règle 3 | — | **non bloquante**, comme le veut la relecture : la taille des fichiers et la somme sont imprimées par le module, pas assertées |
| Ligne « complexité » du relais | `f27b90ab` | skill `release-et-changelog`, § 6, une ligne, et l'historique du skill |
| Fiche au BACKLOG | (ce lot) | **#1051** |

Break-tests (sur le vrai dépôt, empreintes restaurées) : une fonction neuve à 31 dans `js/` (fichier jetable) → rouge « fonction neuve » et rouge « au-dessus de 15 » ; la liste abaissée à 129 pour `executerImportSelectif` (130) → rouge « hausse non écrite » ; la liste relevée à 131 → rouge « la liste suit le code ». Trois sur trois.

**Coût sur Vitest** : le banc prend 0,69 s seul (dont 0,52 s de mesure, faite une fois) ; la suite complète a pris 44,7 s (le plan annonçait ≈ 2 s sur ≈ 136 s ; la machine est plus rapide que celle de la maquette).

## 4 · Ce que j'ai supposé – une ligne chacune

- Une fonction anonyme, ou un nom porté deux fois dans un même fichier, est figée comme une liste de valeurs triées sous son nom (« (anonyme) ») ; c'est la règle du plan pour les 7 rappels, appliquée aussi aux homonymes.
- La règle 2 est une égalité (455), pas un plafond : la liste suit le code, comme pour la règle 1 ; une baisse demande de baisser la constante.
- `js/_archives/` est hors mesure : non chargé par l'application.
- Le module vit dans `tests/unit/_helpers/` (là où `acorn` se trouve), comme le plan le prévoit.

## 5 · Ce qui revient à Grégoire

Rien de neuf : le lancement, l'option du relais et l'exécutant ont été tranchés le 12 oct. à 7 h 58. À savoir pour la suite : **environ une fois par journée de lots** (estimation du plan), une hausse sur une fonction figée deviendra une décision écrite dans `HAUSSES_ASSUMEES`, que Cowork lira à la relecture.

## 6 · Documents à mettre à jour (pour la session de la relève, et pour Cowork)

- **Ce que la relève doit savoir de ce banc** : la complexité de `js/` est mesurée par `tests/unit/_helpers/complexite.js` (lancer `node tests/unit/_helpers/complexite.js` pour le tableau) ; le banc `sentinelle-contenir-complexite` refuse toute fonction neuve au-dessus de 30 et toute hausse non écrite d'une fonction figée ; la liste `tests/fixtures/cliquets/complexite-fonctions-30.json` suit le code (on l'abaisse quand une fonction descend : `--figer` imprime la nouvelle) ; une hausse assumée se relève dans la liste ET s'écrit dans `HAUSSES_ASSUMEES`, avec sa raison.
- `ETAT-PROJET.md` §00 : le relevé du § 2 (sur `main`, après les lots 20 à 23) peut remplacer celui du 11 au soir ; la différence de 53 fonctions vient de `js/_archives/`, à dire dans le tableau.

## 7 · Item de Nouvelles proposé

Aucun : rien ne change à l'écran.
