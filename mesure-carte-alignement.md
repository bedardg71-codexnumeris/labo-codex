# Mesure — carte d'alignement (badges, pastilles, liens, niveau cognitif)

> Lecture seule, 2026-09-27, `main` à `0de97f41`. Toutes les références sont dans
> `js/planification-carte.js` sauf mention contraire (numéros de ligne approximatifs).
> Méthode : lecture du code seulement ; aucun banc lancé, aucune carte réelle ouverte.
> Ce que dit ce fichier est donc ce que le code **prescrit**, pas ce qui a été observé à l'écran.

## Vue d'ensemble

| Question | Réponse courte |
|---|---|
| 1. Badges | Calculés par `evaluerBadge()` à partir des **liens tracés**, **quel que soit leur verbe**. Les « objectifs servis » cochés n'entrent **pas** dans les badges. |
| 2. Pastilles | `evaluerObjectif()` : ✓ exige au moins un bloc non-évaluation qui coche l'objectif **et** une évaluation (cochée ou reliée). La semaine n'est pas lue. |
| 3. « se vérifie par » | Proposé automatiquement entre une évaluation et une idée maîtresse, une connaissance ou une activité (toute la famille). Tout lien existant peut aussi recevoir ce verbe par le menu. |
| 4. « se concrétise dans » | Tracé port à port entre leçon (ou séquence) et idée maîtresse, sans menu. Il compte pour les badges de la leçon et de l'idée maîtresse. |
| 5. Niveau cognitif | Mémoriser, Comprendre, Appliquer, Analyser, Évaluer, Créer, sur 7 types. |
| 6. Lien UNESCO | Non vérifié : le site refuse l'accès automatisé. |

---

## 1. Badges amont / aval (✓, !, ⚠)

**Où.** `evaluerBadge(noeud)` (l. ~2291) calcule, pour chaque bloc, un résultat `entree` (badge de gauche, amont), un résultat `sortie` (badge de droite, aval) et un éventuel `avertissement`. `appliquerBadge()` (l. ~2436) affiche ✓ quand `valide` vaut vrai, sinon « ! » sur fond gris. `mettreAJourBadge()` (l. ~2450) pose le triangle ⚠ **seulement** si `avertissement` est présent. Le ⚠ n'est donc pas un troisième état d'un badge : c'est un troisième signe, indépendant des deux badges.

**Ce qui entre dans le calcul.** Les liens sont lus par `getLiensDeNoeud()` (l. ~7690). Cette fonction retourne tout lien dont le nœud est source **ou** cible. Elle **ne filtre pas sur le verbe** : elle exige seulement que le verbe soit connu (`trouverConfigLien` non nul, y compris les anciens verbes de `VERBES_COMPAT`). Elle n'expose pas non plus le verbe à `evaluerBadge`, qui ne regarde que le **type du bloc d'en face**. Les liens sont agrégés sur tous les clones d'un bloc (`trouverClones`). Le fait d'être *contenu* (parent / enfants) est lu sur le bloc lui-même, pas sur ses clones.

### Règles par type

| Type | Badge amont (gauche) | Badge aval (droite) | ⚠ |
|---|---|---|---|
| Compétence | toujours ✓ | ✓ si reliée à au moins une idée maîtresse | si reliée à une IM, mais qu'aucune de ses IM n'atteint une évaluation (`ideeMaitresseAtteinEvaluation`) |
| Idée maîtresse | ✓ si elle atteint une compétence, directement ou par une chaîne d'IM (`ideeMaitresseAtteinCompetence`) | ✓ si elle est reliée **directement** à une leçon ou à une séquence (`ideeMaitresseAtteinLecon`) | si amont ✓ et aval ✓, mais qu'elle n'atteint aucune évaluation |
| Séquence | toujours ✓ | ✓ si elle contient au moins une leçon | jamais |
| Leçon | ✓ si reliée à au moins une idée maîtresse (tout verbe) | ✓ si elle **contient** au moins une connaissance **et** au moins une activité (famille entière) | jamais |
| Connaissance (4 types) | ✓ si son parent **direct** est une leçon | ✓ si reliée à une activité, directement ou via une chaîne connaissance → connaissance (`connaissanceAtteinActivite`) | jamais |
| Activité, Soutien, Révision, Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture | ✓ si reliée à au moins une connaissance | même règle que l'amont : les deux badges sont identiques | jamais |
| **Exposé** | toujours ✓ | toujours ✓ | jamais |
| Évaluation | ✓ si reliée à une IM, une connaissance ou une activité (famille entière) | toujours ✓ (le message dit la visée) | jamais |

**À signaler sur l'Exposé.** `expose` fait partie de `TYPES_ACTIVITE`, mais il est absent du `switch` d'`evaluerBadge`. Il tombe dans le cas `default`, qui rend ✓ / ✓ sans condition. C'est un fait du code. Je ne peux pas dire à la seule lecture si c'est voulu (inférence : probablement un oubli lors de l'ajout du type le 7-8 août, comme l'illustre le repli sur la famille documenté dans `resoudreVerbe`).

### Comment une IM « atteint une évaluation » (`ideeMaitresseAtteinEvaluation`, l. ~2135)

Elle est vraie dans l'un de ces cas :

1. l'IM (ou un de ses clones) est reliée **directement** à une évaluation ;
2. une IM reliée à celle-ci (chaîne d'IM, récursive) l'atteint ;
3. l'IM est reliée à une leçon ou à une séquence dont **un enfant** est relié à une évaluation ;
4. dans cette leçon, une **connaissance** enfant est reliée à une activité, elle-même reliée à une évaluation.

Deux conséquences découlent directement du code :

- **Une évaluation posée dans la leçon mais reliée à rien ne compte pas.** La descente examine les liens des enfants ; elle ne teste jamais si l'enfant *est* une évaluation.
- Pour une IM reliée à une **séquence**, les enfants examinés sont les leçons de la séquence. Une leçon n'a normalement pas de lien direct vers une évaluation (paire absente des verbes automatiques). **Incertain** : je n'ai pas vérifié s'il existe un chemin réel par lequel une IM reliée à une seule séquence peut obtenir son ✓ d'évaluation, autrement que par un lien direct IM → évaluation.

### Les « objectifs servis » comptent-ils pour les badges ?

**Non.** `metadata.objectifsServis` n'est lu par aucune des fonctions ci-dessus. Il n'intervient que dans `evaluerObjectif` (les pastilles, question 2) et dans l'export (`js/planification-export.js`, rubrique « Liens et objectifs servis »).

### Seuls les liens « se vérifie par » comptent-ils ?

**Non plus.** Compte tout lien entre les bons types de blocs, quel que soit son verbe. Un lien activité → évaluation dont le verbe a été changé en « complète » par le menu (voir question 3) compte encore.

---

## 2. Pastilles des objectifs de leçon (!, ⚠, ✓)

**Où.** `evaluerObjectif(lecon, objectifId)` (l. ~2197). Symboles dans `SYMBOLES_PASTILLE_OBJECTIF` (l. ~1607). Rendu par `pastilleObjectifHTML` et `rafraichirPastillesObjectifs`.

**Règles exactes.**

1. **Servants** : les enfants **directs** de la leçon dont le type est dans `TYPES_SERVANTS_OBJECTIF`, **sauf l'évaluation**, et dont `objectifsServisPar()` contient l'objectif. `objectifsServisPar` ne garde que les ids d'objectifs de la leçon parente.
2. Aucun servant → **« ! » (invitation)**, même si une évaluation coche l'objectif.
3. Au moins un servant, puis l'objectif est **vérifié** si :
   - *direct* : une évaluation **enfant de la même leçon** coche cet objectif ;
   - *ou transitif* : un des servants (ou un de ses clones) est relié à une évaluation **n'importe où** sur la carte, par **n'importe quel verbe**.
4. Vérifié → **✓** ; sinon → **⚠**.

**Une évaluation qui coche l'objectif suffit-elle pour ✓ ?** Seulement si au moins un bloc non-évaluation de la leçon coche aussi cet objectif. Seule, elle laisse la pastille à « ! ».

**La semaine est-elle prise en compte ?** Non. `evaluerObjectif` ne lit ni `metadata.semaine`, ni `rangSeance`, ni l'ordre des blocs dans la leçon. Une évaluation placée avant le bloc qui sert l'objectif donne le même ✓. Dans le cas transitif, l'évaluation peut même se trouver dans une autre leçon, à une autre semaine.

---

## 3. Le lien « se vérifie par »

### Entre quels blocs il se trace

**Automatiquement, sans menu** (`resoudreVerbe`, l. ~1870, table `VERBES_AUTO`, l. ~1212) : le verbe est posé dès qu'on relâche le tracé entre une évaluation et :

- une **idée maîtresse** ;
- une **connaissance** (factuelle, conceptuelle, procédurale, métacognitive) ;
- une **Activité**, un **Soutien** ou une **Révision** (paires écrites) ;
- un **Exposé**, une **Ouverture**, une **Modélisation**, une **Pratique guidée / autonome** ou une **Clôture**, par le repli sur la famille (`normaliserType` → `activite`, étape « 1 bis »).

Le sens est normalisé : la flèche va toujours de l'élément vers l'évaluation, dans quelque sens qu'on trace.

**Pas de verbe automatique** vers une évaluation depuis une compétence, une leçon ou une séquence. Le tracé y est refusé par le message « Ce lien n'est pas possible entre … et … » (`afficherMenuLien`).

**Par le menu d'un lien existant** (`afficherMenuLienExistant`, l. ~4801) : depuis le 15 août, la rubrique « Autres verbes » propose **tous** les verbes de `TYPES_LIENS`. N'importe quel lien déjà tracé, entre n'importe quels deux blocs, peut donc recevoir « se vérifie par ».

**Données héritées** : les anciens verbes `evalue`, `verifie` et `evalue_par` sont lus comme « se vérifie par » (`VERBES_COMPAT`, `MIGRATION_VERBES`). Le pack démo en contient (`js/demo-namespace.js`, l. 86 et 90).

### Si l'on retirait ce geste de l'interface (description, rien n'est retiré)

Un lien est stocké comme `{ id, source, cible, type: 'se_verifie_par' }` dans `etat.liens`, puis sérialisé tel quel (`liens: Array.from(etat.liens.values())`, l. ~5452, ~5982, ~8169, ~8255). Rien, au chargement, ne supprime un lien dont le verbe n'est plus proposé. Les effets dépendent de **ce qu'on retire** :

| Ce qu'on retire | Liens déjà stockés | Affichage | Calculs |
|---|---|---|---|
| Seulement les paires `…>evaluation` de `VERBES_AUTO` (plus de verbe automatique) | restent | restent, avec étiquette (`trouverConfigLien` trouve encore le verbe) | badges et pastilles inchangés (ils ignorent le verbe). **Mais** tout nouveau tracé vers une évaluation serait refusé (« Ce lien n'est pas possible »), puisque `VERBES_HORIZONTAUX` n'a aucune paire avec l'évaluation. Plus aucun moyen de relier une évaluation ; ses badges et les ⚠ des compétences / IM ne pourraient plus être levés sur une carte neuve. `signalerVerbesDevenusInexacts` pourrait aussi signaler ces liens lors d'un changement de type d'un bloc. |
| Aussi l'entrée `se_verifie_par` de `TYPES_LIENS` (et ses correspondances dans `VERBES_COMPAT`) | restent dans les données | tracés sans étiquette (`dessinerLien` ne pose le libellé que si la configuration existe ; lecture rapide, non éprouvée) | `getLiensDeNoeud` **les ignore** (configuration nulle) : les évaluations passent à « ! », les ⚠ reviennent sur les compétences et les IM, les pastilles perdent leur vérification transitive, et l'export (`liensDe`, `planification-export.js` l. 97) les omet. |
| Seulement l'entrée du menu « Autres verbes » | aucun effet sur l'existant | — | — |

Inférence, à confirmer par un banc si la décision se prend : le retrait « propre » à données constantes est la première ligne. La deuxième casse un calcul en silence, sur le stock déjà écrit chez les utilisateurs (« tarir n'est pas réparer »).

---

## 4. Le lien « se concrétise dans » (leçon ↔ idée maîtresse)

**Comment il se trace.** On tire depuis un port d'un bloc (`demarrerLien`, l. ~3988) et on relâche sur l'autre bloc. `resoudreVerbe` trouve `lecon>idee-maitresse` (ou l'inverse) dans `VERBES_AUTO` : le verbe est posé directement, **sans menu**, et le sens est normalisé idée maîtresse → leçon. La même paire existe pour la séquence.

**Calcul de badge.** Oui, des deux côtés, mais sans lecture du verbe :

- badge **amont de la leçon** : ✓ si la leçon a un lien, quel qu'il soit, vers une IM ;
- badge **aval de l'IM** : ✓ si l'IM a un lien direct vers une leçon ou une séquence (`ideeMaitresseAtteinLecon`). Malgré son commentaire (« traverse la chaîne IM→IM »), cette fonction **ne parcourt pas** la chaîne : elle ne regarde que les liens directs ;
- le ⚠ de l'IM et de la compétence **descend par** ce lien, vers les enfants de la leçon (question 1).

---

## 5. Sélecteur de niveau cognitif

**Libellés, dans l'ordre** (`NIVEAUX_COGNITIFS`, l. ~1571, rendus dans l'Inspecteur, l. ~3035) :

1. `— Non défini —` (option vide)
2. `1. Mémoriser`
3. `2. Comprendre`
4. `3. Appliquer`
5. `4. Analyser`
6. `5. Évaluer`
7. `6. Créer`

À l'écran, chaque option porte son numéro d'ordre : `nc.ordre + '. ' + nc.label`. Sur le bloc, le petit badge montre le libellé seul (`mettreAJourApparenceNoeud`).

**Types de blocs** (`TYPES_AVEC_NIVEAU_COGNITIF`, l. ~1597) : Compétence, Idée maîtresse, Exposé, Activité, Soutien, Révision, Évaluation. Les connaissances, la séquence, la leçon et les cinq étapes d'enseignement explicite ne l'ont pas. Pour ces dernières, c'est un choix documenté dans le commentaire du 7 août.

---

## 6. Le lien UNESCO du guide

**Non vérifié.** `https://unesdoc.unesco.org/ark:/48223/pf0000397143` renvoie HTTP 403 à l'outil de lecture web, et une page de défi anti-robot (« Just a moment... ») à `curl`. Je n'ai donc ni titre ni année mesurés.

Ce que le guide **affirme**, sans que je puisse le confirmer : Anderson, L. W. (2026), *Curricular alignment: A re-examination*, Educational Practices Series n° 37, UNESCO-BIE (page 1 de `GUIDE_PAGES`, l. ~1652). Une vérification à la main dans un navigateur réglerait la question en une minute.
