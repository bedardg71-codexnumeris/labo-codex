# Consigne – « Apporter mon matériel », lot 3a : dire à l'application ce qu'est chaque partie du tableau

> Écrite par Cowork le samedi 17 octobre 2026 à 8 h 36 (Toronto, mesuré par `date`), après la relecture du lot 2 (`0adf66be`). Le lot 3 du cadrage est coupé en deux : **3a** (ce lot, la robustesse du collage, que le cadrage fait passer avant le reste) puis **3b** (descripteurs visibles dans Grilles de critères, sélection de l'objet créé, page de textes à relire, Nouvelles, release), dont Cowork écrit la consigne après la relecture de 3a. Les deux se font aujourd'hui ; **une seule vérification complète, ce soir, après 3b**.
> ⛔ Aucun nom d'élève ni de collègue, et **aucun texte de la grille réelle de Grégoire** dans le dépôt (il est public) : le banc emploie une grille fictive de même forme.
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `verification-adverse`.

## Pourquoi ce lot

Grégoire a collé sa vraie grille (Pages) le 17 au matin. Les descripteurs sont bien lus, mais :

1. **Chaque critère est coupé en deux.** Sa grille met le nom du critère sur une bande (« NOM DU CRITÈRE | I | D | M | E ») et son contenu sur la rangée suivante (à gauche, une liste de micro-tâches ; à droite, les descripteurs). La lecture en fait deux critères : l'un dont les cases valent « I », « D », « M », « E », l'autre nommé par toute la liste des micro-tâches. Pondérations en parts égales fausses par conséquent.
2. **Deux rangées d'en-tête** (SOLO : « Unistructurel… » ; puis ses niveaux : « INCOMPLET, EN DÉVELOPPEMENT, MAITRISÉ, ÉTENDU »), la première case fusionnée sur les deux. `interpreter` ne lit que `r[0]` ; la seconde, plus courte d'une case, part à « À classer ». Codes inventés U, M, R, A, alors que ses codes I, D, M, E sont écrits dans chaque bande.
3. **Les retours à la ligne d'une case sont perdus** (`BLOCS` séparés par une espace, voulu au lot 1) : sept micro-tâches collées en un bloc.
4. Relevé à la relecture du lot 2 : **les codes de niveau se déduisent des titres et ne se corrigent pas** (`coder` : « Incomplet, En développement, Maîtrisé, Étendu » → I, E, M, ET).

**Principe posé par Grégoire (17 oct., 8 h 23)** : « ce qui est important, c'est surtout que l'utilisateur puisse corriger l'interprétation de l'application. Qu'il puisse dire "voici les critères, les sous-critères, les descripteurs, l'échelle, les points, etc." […] On doit donc rendre très souple le réordonnancement des informations avant son intégration. » Forme acceptée (8 h 25) : **un menu de rôle sur chaque rangée et sur chaque colonne de l'aperçu.** La lecture automatique n'est qu'une proposition.

## Ce que Grégoire verra à la fin du lot

Il colle sa grille : après « Sens du tableau », une étape « Ce que contient ton tableau » montre son tableau tel que l'application l'a lu, avec un menu au début de chaque rangée et en tête de chaque colonne, réglés d'avance (« Proposé par l'application : à vérifier »). Pour sa grille, la proposition est déjà juste : quatre critères nommés par les bandes, les niveaux « INCOMPLET… ÉTENDU » codés I, D, M, E, les micro-tâches en sous-critères, une par ligne. S'il change un menu, la grille se relit aussitôt, et la suite de l'assistant suit.

## Le mandat

### 1. Lire le tableau en grille régulière (`materiel-lecture.js`)

- Les cases fusionnées sont **dépliées** avant toute interprétation : une case sur N colonnes garde son texte dans la première et laisse les suivantes vides ; une case sur N rangées garde son texte dans la première rangée et laisse les suivantes vides. Chaque rangée a alors le même nombre de cases ; la raison « Ligne d'une autre forme que le tableau » ne sert plus que si le dépliage échoue. Les cases dépliées gardent une marque (fusionnée) pour l'affichage.
- **Les retours à la ligne survivent** : dans une case, un bloc (`p`, `li`, `div`…) ou un `<br>` donne un `\n`, les lignes vides se resserrent. Les textareas les montrent ; les noms de critère et de niveau restent sur une ligne (retours remplacés par une espace).

### 2. Les rôles, et le modèle qui en découle

Le modèle se construit à partir de deux listes, `rolesRangees` et `rolesColonnes`, appliquées au tableau **dans le sens choisi** à l'étape « Sens du tableau » (une inversion remet les rôles à la proposition de l'application). Une fonction pure `proposerRoles(lu)` les remplit ; une fonction pure `modeleDepuisRoles(lu, roles)` construit le modèle. **Changer un rôle relit tout depuis le document** (même règle qu'une inversion : nom et nature choisie gardés, le reste relu ; liste des étapes recalculée, étape courante gardée).

Rôles d'une rangée (libellés provisoires, relus en 3b) :

| Rôle | Effet |
|---|---|
| Noms des niveaux | Ses cases, dans les colonnes « Un niveau », nomment les niveaux. **Une seule** : en choisir une autre fait passer la précédente à « À ignorer ». |
| Codes des niveaux | Ses cases donnent les codes (repris). Facultative, une seule. |
| Plages de notes | Ses cases donnent « De … à … % » (« 65-74 », « 65 à 74 % »). Facultative, une seule. |
| Un critère | Première colonne « Noms des critères » = nom ; cases des niveaux = descripteurs ou rétroactions ; pondération si une colonne la porte. |
| Nom d'un critère | Le nom vient de cette rangée ; son contenu, des rangées « Suite du critère » qui la suivent. Ses cases de niveau, si elles sont courtes (≤ 4 caractères, sans espace) et **identiques d'une bande à l'autre**, sont proposées comme codes (repris) ; sinon elles ne vont nulle part (elles restent visibles à cette étape). |
| Suite du critère | S'ajoute au critère au-dessus : ses cases de niveau s'ajoutent aux descripteurs (retour à la ligne entre deux suites) ; sa case de la colonne « Noms des critères » suit le choix ci-dessous. Une suite sans critère au-dessus est signalée dans « Avant de créer, il reste ». |
| À ignorer | Rien n'en est retenu. |

Rôles d'une colonne : « Noms des critères », « Pondération », « Un niveau », « Sous-critères », « Description du critère », « À ignorer ». Il faut au moins une colonne « Un niveau » et une « Noms des critères » ; sinon, manque nommé.

**Dans une « Suite du critère », la case de la colonne « Noms des critères » devient :** « des sous-critères, un par ligne » (proposé), « la description du critère » ou « rien à garder ». Un seul choix pour tout le tableau, affiché seulement s'il y a une suite. Puces et cases à cocher en tête de ligne (☐ ☑ □ ■ • - *) retirées des sous-critères. *Supposition de Cowork : « sous-critères » proposé par défaut, parce que Grégoire a nommé les sous-critères parmi ce que l'utilisateur doit pouvoir désigner ; mesuré : sur un critère holistique, les sous-critères ne changent pas la note (`evaluation-calcul.js` ~1685 ne les lit que pour un critère algorithmique) et deviennent des codes d'annotation seulement si l'utilisateur coche la case du critère.*

**Ce que propose l'application** (`proposerRoles`), au minimum :
- en tête, les rangées dont les cases de niveau sont courtes et ne sont pas des codes : la **dernière** est « Noms des niveaux », les précédentes « À ignorer » ;
- une rangée dont les cases de niveau sont des codes courts, suivie d'une rangée de textes longs : « Nom d'un critère » puis « Suite du critère » ;
- sinon « Un critère » ; une colonne d'en-tête pondération (`estEntetePonderation`) : « Pondération ».
- **Non-régression** : l'exemple de l'application et les grilles simples du lot 1 se lisent exactement comme avant (mêmes bancs verts).

### 3. Les codes de niveau se corrigent

Un champ « Code » par niveau, à l'étape Plages de notes et à la Vérification. Repris s'ils viennent du document, complétés sinon (`coder`, en repli seulement). Requis, uniques (sans tenir compte de la casse), 1 à 4 caractères, sans souligné : sinon manque nommé (« deux niveaux ont le même code : … »). Modifier un titre ne recalcule plus un code saisi ou repris.

### 4. L'étape « Ce que contient ton tableau »

- Après « Sens du tableau », pour un collage ou l'exemple (pas « à la main ») ; toujours présente (c'est le lieu de la correction).
- Le tableau lu, cases fusionnées marquées ; un `<select>` natif avec son `<label>` (« Rôle de la rangée 3 », masqué à l'œil) au début de chaque rangée et en tête de chaque colonne ; cibles de 44 px ; le tableau défile dans son cadre sur l'iPad.
- Mention « Proposé par l'application : à vérifier » tant que l'utilisateur n'a rien changé.
- Le bandeau du lot 1 sur les cases fusionnées renvoie à cette étape (texte provisoire).
- L'encadré « Dans l'application » de l'étape : texte provisoire, relu en 3b.

### 5. La création, ajustée

- `sousCriteres` sur le critère : **la forme de l'éditeur** (`grilles.js` ~5027 : `{ id: genererIdUnique('SC_'), code, nom, ponderation, retroaction }`, mêmes valeurs par défaut), dans l'ordre des lignes.
- `description` : la description choisie, sinon `''`.
- Mesuré à la relecture : un critère créé à la main porte aussi `description`, `formule`, `niveauSOLO` et `verrouille` (`grilles.js` ~309) ; ceux du lot 2 ne les portent pas. Aligne la forme sur l'éditeur, avec ses défauts. Rien d'autre ne change à la création.

## Les bancs

- **Grille fictive de même forme** (textes inventés, aucun mot de la grille de Grégoire) : deux rangées d'en-tête dont la première case fusionnée sur deux rangées ; trois ou quatre critères en bande « NOM | I | D | M | E » suivis d'une rangée « liste de 3 à 7 tâches en lignes ☐ | quatre descripteurs ». Attendu sans rien toucher : autant de critères que de bandes, niveaux de la seconde rangée, codes I, D, M, E repris, sous-critères une par ligne sans les ☐, descripteurs intacts, retours à la ligne gardés, rien dans « À classer ».
- Vitest : dépliage (colspan, rowspan, les deux) ; retours à la ligne ; `proposerRoles` sur la grille fictive, l'exemple et les grilles du lot 1 ; `modeleDepuisRoles` pour chaque rôle ; une seule « Noms des niveaux » ; suite orpheline signalée ; codes uniques, requis, ≤ 4 caractères, sans souligné ; titre modifié sans toucher le code ; forme du critère et des sous-critères égale à celle de l'éditeur. Mutation par essai, comme au lot 2.
- Playwright, lancée seule dans WebKit (pas le verdict) : la grille fictive collée mène à quatre critères codés I, D, M, E ; changer une rangée « Suite du critère » en « À ignorer » retire ses sous-critères et ses descripteurs ; « Créer ma grille » écrit des sous-critères visibles dans Grilles de critères.
- Break-test pour chaque essai neuf.

## La méthode

Commit, Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-3a.md`. Bump du bloc de jetons. **Aucun push, aucune release, aucun verdict Playwright complet** : ce soir, après 3b. Rapport court à Grégoire, en gestes d'utilisateur, avec la liste des textes provisoires neufs (ils iront dans la page de textes de 3b).
