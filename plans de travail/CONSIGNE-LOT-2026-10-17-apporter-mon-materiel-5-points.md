# Consigne – « Apporter mon matériel », étape 5 du plan : les grilles en points, acceptées telles quelles

> Écrite par Cowork le samedi 17 octobre 2026 à 9 h 48 (Toronto, mesuré par `date`). Étape 5 de `PLAN-2026-10-17-pret-pour-lundi.md`, **après** l'étape 3 (première version en ligne). S'appuie sur `MESURE-2026-10-17-grilles-en-points.md`.
> ⛔ Aucun nom d'élève ni de collègue, aucun texte d'une grille réelle de Grégoire dans le dépôt (il est public).
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `verification-adverse`.

## Pourquoi

Grégoire a essayé une de ses grilles de l'hiver 1995 : des points par critère (« /4 », « /18 », « /25 »), une colonne « Commentaires » vide, des critères regroupés par partie (« Introduction », « Développement », « Conclusion », en case fusionnée verticale), chaque case de critère portant un nom puis une ligne d'explication. Aucun niveau. C'est, dit-il, une grille analytique appliquée sans le savoir, et le type le plus employé dans le réseau aujourd'hui. **Posture du 17 oct. (cadrage) : l'accepter telle quelle, sans rien inventer.** Aujourd'hui, l'assistant exige au moins une colonne de niveau.

## L'assise : ce que l'application sait déjà faire (ne rien réinventer)

- Le **critère analytique** (3-4 sept. 2026) : points saisis sur le maximum du critère, et **le maximum est la pondération** (`evaluation-calcul.js` ~1313-1336).
- **La note se fait par les points seuls**, normalisée par le total des pondérations (`calculerNote` ~1540-1557) : une grille sur 20 ou sur 50 rend un pourcentage juste.
- **#941 (24 sept. 2026)** : une grille **entièrement en points** (badge « ANALY », `grilleEntierementEnPoints`, `gabarits-utils.js` ~100) **se note sans échelle**, aucune échelle n'est glissée d'office, aucun nom de niveau ne s'affiche (décision A de Grégoire).
- Le partage fait voyager `type` de la grille et du critère, et borne la pondération à 0-100 (`partage-schemas.js` ~216-223).

## Ce que Grégoire verra à la fin de l'étape

Il colle une grille en points. L'assistant ne la refuse pas. « Ce que contient ton tableau » propose : la colonne des parties en « Partie », celle des critères en « Noms des critères », la colonne « Note » en « Points », la colonne « Commentaires » vide en « À ignorer ». Pas d'étape de niveaux ni de plages. La Vérification montre chaque critère avec ses points et le total (« sur 64 », par exemple), sans « Ramener à 100 % ». « Ce qui sera créé » : une grille en points. « Créer ma grille » crée **la grille seule**, sans échelle ni cartouche ; dans Grilles de critères, elle porte le badge « ANALY ».

## Le mandat

### 1. La lecture et les rôles

- **Une case de critère sur plusieurs lignes** (dans la colonne « Noms des critères ») : la **première ligne est le nom**, les suivantes vont à la **description**. Vaut pour toutes les grilles ; une case d'une seule ligne ne change pas.
- **Rôle de colonne neuf « Partie »** : une colonne de regroupement (souvent une case fusionnée verticale). Le nom de la partie précède celui du critère : « Introduction – Style ». Proposé quand la première colonne porte des cases fusionnées verticalement et qu'une autre colonne peut porter les noms. Libellé et forme du nom provisoires (étape 7).
- **Le rôle « Pondération » devient « Points ou pondération »** : avec des colonnes de niveau, c'est la pondération (comme aujourd'hui) ; **sans colonne de niveau, ce sont les points** (le maximum de chaque critère). Proposé aussi pour un en-tête « Note », « Notes », « Points », « Pts », « /N », « Sur N », ou une colonne dont les cases sont surtout « /4 », « 4 pts », « sur 18 ».
- Une colonne d'en-tête « Commentaires » (ou « Remarques ») **vide** : « À ignorer » proposé.
- **Sans colonne de niveau, la grille est « en points »** : ce n'est plus un manque. Il manque seulement quelque chose s'il n'y a ni niveau ni points (« il manque les points de chaque critère, ou des colonnes de niveaux »).

### 2. L'assistant, pour une grille en points

- Étapes : Sens du tableau, Ce que contient ton tableau, Points (seulement si des points manquent), À classer (s'il y a des passages), Vérification. Ni Nature des cases, ni Plages de notes.
- Points : un entier de 1 à 100 par critère (borne du partage ; non entier bloquant, comme au lot 2), libellé « sur ». Total affiché « sur N ». **Pas de « Ramener à 100 % »** ni d'avertissement « ne totalise pas 100 » : le total des maximums est libre.
- Vérification : nom de la grille, tableau Critère | Description | Points, « Ajouter un critère », total, « Ce qui sera créé : une grille en points (N critères) ».

### 3. La création

- La grille : `type: 'analytique'` sur la grille, et sur chaque critère `type: 'analytique'`, `ponderation` = ses points ; le reste de la forme comme au lot 3a (forme de l'éditeur). **Aucune échelle, aucune cartouche.** Mêmes refus et même retour en arrière qu'au lot 2.
- Essai obligatoire : la grille créée vérifie `grilleEntierementEnPoints(grille) === true` (le prédicat de l'application, pas une copie).
- Confirmation : la carte « Grille » seule ; le texte « Pour t'en servir… » inchangé.

### 4. Non-régression

Les grilles à niveaux (l'exemple, les grilles du lot 1, la grille fictive à bandes du lot 3a) se lisent et se créent exactement comme avant.

## Les bancs

- **Deux grilles fictives de la forme de 1995** (textes inventés) : avec une colonne « Partie » en cases fusionnées verticales ; sans elle. En-tête « CRITÈRES | NOTE | COMMENTAIRES » ; cases de critère « Nom » + une ou deux lignes d'explication ; « /4 », « /3 », « /18 »… ; commentaires vides. Attendu sans rien toucher : autant de critères que de rangées, noms préfixés de la partie, descriptions, points repris, total juste, grille créée analytique, `grilleEntierementEnPoints` vrai, aucune échelle ni cartouche écrite.
- Vitest : chaque règle ci-dessus, avec sa mutation ; non-régression sur les grilles à niveaux.
- Playwright, lancée seule dans WebKit : la grille fictive collée → Vérification « sur N » → « Créer ma grille » → badge « ANALY » dans Grilles de critères.
- Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-5-points.md`, avec la liste des textes provisoires neufs. Bump du bloc de jetons. Aucun push, aucune release, aucun verdict complet (étape 8). Rapport court à Grégoire, en gestes d'utilisateur.
