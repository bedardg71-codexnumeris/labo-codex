# Portes terrain — #291 / #476 · gestion des doublons

> **Date** : 23 août 2026 · **Version livrée** : voir `version.json` après le bump
> **Branche** : `claude/gestion-des-doublons-ytpvkt`
> **Plan appliqué** : `plans de travail/PLAN-291-476-gestion-des-doublons.md` (Lots 0 à 5)
> **Artefact jumeau** : https://claude.ai/code/artifact/cc472a60-c838-4f3b-a2d5-433eaedea013
>
> **Ce qui échoue ici devient un item de backlog, pas une note mentale.**
> Au retour : trier chaque ✗ (défaut réel, ou build en retard ?), verser les
> défauts réels au `BACKLOG.md` avec leur numéro de porte, puis mettre à jour
> l'état en tête de ce fichier.

---

## §0 · Préalable — à faire AVANT tout le reste

Sauter un seul de ces points invalide toutes les portes qui suivent.

| | Geste | Attendu |
|---|---|---|
| 0.1 | `git pull` sur ta copie, puis recharger l'app **à fond** (Cmd+Maj+R) | — |
| 0.2 | Regarder le **numéro de version en bas de page** | Il doit correspondre à la version livrée par cette session. **S'il est plus bas, arrête ici** : tout ce qui suit décrirait l'état d'AVANT. |
| 0.3 | Faire une **sauvegarde Codex** | Le §1 touche tes vraies données. |
| 0.4 | Dans la console du navigateur, taper `allow pasting` puis Entrée | Nécessaire une seule fois par session pour coller un script. |
| 0.5 | Prévoir les **deux appareils** (Mac et iPad) et les **deux modes** (sombre et clair) | Plusieurs portes ne se tranchent que là. |

> ⚠ **Ton app tourne depuis ton clone, en `file://`.** Elle est à la version de
> ton dernier `git pull`, pas à celle de `main`. C'est la cause la plus fréquente
> de faux rouge : la porte décrit alors exactement l'état d'avant le correctif,
> qui est précisément ce qu'elle teste.

---

## §1 · ⚠⚠ Données — ce que tu exécutes sur ton corpus

**Backup fait (0.3) ?** Sinon, remonte.

### 1.1 — Le relevé de tes doublons réels `Console` `⚠⚠ Données`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Tu as écrit : « J'ai une information m'indiquant que j'ai des doublons,   │
│ mais ils ne sont pas identifiés explicitement […] LESQUELS SONT           │
│ LESQUELS ? ». Ce script répond à la question sur TES données, exemplaire  │
│ par exemplaire. Il ne modifie rien.                                       │
└───────────────────────────────────────────────────────────────────────────┘

**Comment charger le script — une seule fenêtre, pas de Terminal :**
Finder → dossier `scripts` du projet → glisser `diagnostic-doublons-bibliotheques.js`
dans un **nouvel onglet du navigateur** (il s'affiche en texte) → Cmd+A, Cmd+C →
revenir sur l'onglet de l'app → Cmd+V dans la console, Entrée.

> Un script se colle **EN ENTIER**, la commande s'appelle **APRÈS**.
> Si la console dit `is not defined`, c'est que le fichier n'est pas passé.

| | Geste | Attendu |
|---|---|---|
| 1.1a | Coller le script, Entrée | La console affiche `Script chargé. Tape maintenant : await diagDoublons()` |
| 1.1b | Taper `await diagDoublons()` puis Entrée | Le rapport commence par `==== BIBLIOTHÈQUES · doublons · LECTURE SEULE ====` |
| 1.1c | Lire la **2e ligne** du rapport | Elle doit dire `✓ Build À JOUR`. Si elle dit `⚠ CE BUILD EST ANTÉRIEUR au correctif #291`, refais 0.1 — sinon tu lis un rapport juste sur une app périmée. |

**Mesures à recopier** (une case cochée ne dit jamais *combien*) :

| Mesure | Valeur relevée |
|---|---|
| 🔴 collisions d'identifiant | |
| 🟠 copies | |
| 🔵 homonymes | |
| Groupes de même nom, total | |

> Pour me renvoyer le détail d'un bloc : `copy(JSON.stringify(window.__diagDoublons))`
> puis colle-le dans ta réponse.

### 1.2 — Le cas-témoin de tes deux « IDME et niv 0 » `⚠⚠ Données`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Tu possèdes en a2025 deux échelles « IDME et niv 0 », toutes deux         │
│ réellement utilisées (#450). Tout ce chantier repose sur une décision :   │
│ on ne bloque JAMAIS sur le nom, seulement sur l'identité. Si ces deux     │
│ échelles étaient classées « copies », la décision serait fausse et tes    │
│ données seraient en danger.                                               │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.2 | Dans le rapport du 1.1, chercher le bloc « IDME et niv 0 » | Il est marqué **🔵 HOMONYMES — entités distinctes, CE N'EST PAS UN DÉFAUT**. **Pas** 🟠 copies. C'est la porte la plus importante de la liste. |

---

## §2 · Interface — ce que tu vérifies à l'écran

### 2.1 — Les cartes affichent enfin leur identifiant `iPad`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ « ils ne sont pas affichés ! » — le bandeau citait des identifiants       │
│ (#b209ef, #6fdd43…) que rien dans la liste en dessous ne portait. Il      │
│ décrivait des objets qu'aucun geste ne permettait de retrouver.           │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.1a | Ouvrir la bibliothèque de **grilles** | Chaque carte porte une petite puce grise du type `#b209ef`, sur la ligne des métadonnées. |
| 2.1b | Survoler la puce (Mac) | L'identifiant **complet** apparaît en infobulle. |
| 2.1c | Refaire 2.1a sur **iPad** | La puce est lisible sans zoomer. `iPad` |
| 2.1d | Refaire 2.1a en **mode clair** | La puce reste lisible (contraste suffisant). |
| 2.1e | Ouvrir les bibliothèques d'**échelles**, **cartouches**, **productions**, **pratiques** | Même puce partout. |
| 2.1f | Ouvrir un écran **hors bibliothèque** (Cours, Trimestre, Planification) | **Rien n'a changé** : aucune puce d'identifiant n'y apparaît. |

### 2.2 — Le bandeau dit ce que sont tes doublons `iPad`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ L'ancien bandeau disait : « IDs identiques = vraies copies, IDs           │
│ différents = homonymes légitimes ». Les deux moitiés étaient fausses.     │
│ L'application affirmait donc que ses propres copies étaient des           │
│ homonymes légitimes — l'inverse de ce qu'il fallait savoir.               │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.2a | Ouvrir une bibliothèque où le 1.1 a signalé des doublons | Un bandeau apparaît en haut, avec **un bloc par groupe**. |
| 2.2b | Lire les titres des blocs | Chacun porte une catégorie : **🔴 Collision d'identifiant**, **🟠 Copies** ou **🔵 Homonymes**. |
| 2.2c | Chercher la phrase « IDs identiques = vraies copies » | **Elle n'existe plus.** Elle n'a pas été reformulée, elle a été supprimée. |
| 2.2d | Lire une ligne d'exemplaire | Elle porte : le nom, l'identifiant court, la date de modification, et « Dans ta barre latérale » ou « Bibliothèque partagée ». |
| 2.2e | Vérifier sur **iPad** que le bandeau ne déborde pas | Les lignes passent à la ligne, rien ne sort de l'écran. `iPad` |
| 2.2f | Vérifier en **mode clair** | Les trois couleurs de catégorie restent distinguables. |

### 2.3 — « Voir » t'amène à la carte `iPad`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ « les rechercher manuellement par leur ID est laborieux ». Ce n'est plus  │
│ à toi de faire la correspondance entre le bandeau et la liste.            │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.3a | Dans le bandeau, cliquer **« Voir »** sur une ligne | La page défile jusqu'à la carte correspondante. |
| 2.3b | Regarder la carte atteinte | Elle est entourée d'un **cadre orange** pendant environ 2 secondes. |
| 2.3c | Vérifier que c'est la **bonne** carte | Son identifiant court est celui de la ligne cliquée. |
| 2.3d | Refaire 2.3a sur une liste **longue**, après avoir fait défiler ailleurs | Le défilement arrive bien à destination. |
| 2.3e | Taper quelque chose dans le champ de **recherche/filtre**, puis cliquer « Voir » sur une carte masquée | Un message dit que la carte n'est pas affichée en ce moment. Il ne se passe **jamais rien en silence**. |
| 2.3f | Refaire 2.3a au **doigt** sur iPad | Le bouton se touche du premier coup. `iPad` |

### 2.4 — Résoudre sans quitter le bandeau

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ « Un utilisateur ne peut pas savoir quoi faire pour résoudre les          │
│ conflits. » Il fallait aller chercher un menu ⋮ sur la bonne carte.       │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.4a | Sur une ligne marquée « Dans ta barre latérale », repérer les boutons | **Retirer** et **Supprimer** sont là, à côté de « Voir ». |
| 2.4b | Sur une ligne marquée « Bibliothèque partagée » | Un seul bouton **Supprimer** — celui de la bibliothèque partagée. |
| 2.4c | Cliquer **Retirer** sur une copie dont tu ne veux plus | Elle quitte la barre latérale. **Les données sont conservées** : tu la retrouves dans « disponibles à ajouter ». |
| 2.4d | Cliquer **Supprimer** | Une **confirmation** est demandée avant toute suppression. |
| 2.4e | Refuser la confirmation | Rien n'est supprimé. |
| 2.4f | Sur une **cartouche**, cliquer Retirer depuis le bandeau | Elle est bien retirée. *(Les cartouches sont rangées par grille — c'est le cas où un mauvais câblage n'aurait rien retiré, en silence.)* |

### 2.5 — Les boutons se touchent au doigt `iPad`

| | Geste | Mesure relevée |
|---|---|---|
| 2.5 | Sur iPad, toucher chaque bouton du bandeau (Voir, Retirer, Supprimer) sans viser | Combien de tentatives ratées, sur 10 touchers ? → |

> Mesuré en session à **44 × 44 px minimum**, dans Chromium. L'iPad reste le
> seul juge du confort réel.

### 2.6 — Un deuxième « Ajouter à ma sélection » refuse et le dit

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Le 22 août, cliquer deux fois empilait un exemplaire de plus, en silence. │
│ Depuis, l'ajout se bloque quand l'élément est déjà là — mais seulement    │
│ sur l'IDENTITÉ, jamais sur le nom.                                        │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.6a | Ajouter une grille de la bibliothèque à ta sélection | Message de succès, la grille apparaît dans la barre latérale. |
| 2.6b | Essayer de l'ajouter **une seconde fois** | Un message **nomme l'exemplaire déjà présent** : « « X » est déjà dans ta sélection. » Et il propose « Dupliquer » si tu en veux vraiment un second. |
| 2.6c | Vérifier la barre latérale | **Un seul** exemplaire, pas deux. |
| 2.6d | Refaire 2.6a-c pour **échelles**, **cartouches**, **productions**, **pratiques** | Même comportement partout. |
| 2.6e | Cliquer sur **« Dupliquer »** (le bouton explicite) | **Ça marche.** Dupliquer n'est jamais bloqué : c'est une action que tu as voulue. |

### 2.7 — Les noms de copie n'empilent plus

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Dupliquer une copie donnait « X (copie) (copie) (copie) » — illisible au  │
│ bout de trois gestes.                                                     │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 2.7a | Dupliquer une grille nommée `Grille FR` | La copie s'appelle `Grille FR (copie)`. |
| 2.7b | Dupliquer **la copie** | `Grille FR (copie 2)` — **pas** `Grille FR (copie) (copie)`. |
| 2.7c | Dupliquer encore | `Grille FR (copie 3)`. |
| 2.7d | Vérifier la même chaîne pour **échelles** et **cartouches** | Même résultat. |
| 2.7e | Si tu as un élément dont le nom contient déjà une parenthèse (ex. `Recette (version 2024)`), le dupliquer | La parenthèse d'origine est **conservée** : `Recette (version 2024) (copie)`. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des choix posés faute de pouvoir
> les trancher à ta place. Chaque ligne attend une **phrase écrite**, pas une case.

| | Question | Ton verdict |
|---|---|---|
| 3.1 | **Les trois catégories** sont nommées « Collision d'identifiant », « Copies », « Homonymes ». Ces mots te parlent-ils, ou en préfères-tu d'autres ? | |
| 3.2 | Un groupe **mixte** (des copies ET un homonyme sous le même nom) est classé « Copies », et chaque ligne porte un numéro de **lignée**. Est-ce lisible, ou faut-il deux blocs séparés ? | |
| 3.3 | Le bandeau montre **tous** les groupes, dépliés. Sur une bibliothèque très fournie, faut-il replier au-delà d'un certain nombre ? Si oui, à partir de combien ? | |
| 3.4 | « Retirer » et « Supprimer » sont dans le bandeau **en plus** du menu ⋮ des cartes. Garde-t-on les deux chemins, ou est-ce redondant ? | |
| 3.5 | Un refus d'ajout affiche `alert()` pour grilles/échelles/cartouches, et une notification discrète pour productions/pratiques. Faut-il uniformiser ? Vers laquelle ? | |
| 3.6 | La **comparaison côte-à-côte** décrite dans #291 (nom, date, contenu, nombre de critères) et le « Tout fusionner » n'ont **pas** été faits — le plan les met hors périmètre. Reste-t-on là-dessus, ou est-ce le prochain chantier ? | |

---

## §4 · Ce que je n'ai pas pu vérifier

**Une liste qui ne déclare pas ses angles morts se fait croire complète.**

### 4.1 — Safari et l'iPad : rien n'a été éprouvé

Les tests d'intégration du projet ciblent **WebKit uniquement** — le bon choix,
puisque c'est ton navigateur. Mais WebKit **n'est pas installé** dans le
conteneur de cette session. Les deux specs neufs ont donc été exécutés sur
**Chromium**, via une configuration temporaire non versionnée.

Conséquence : la logique est prouvée, **le rendu ne l'est pas**. Tout ce qui
porte le tag `iPad`, et tout le §2 en général, est réellement dû.

### 4.2 — Aucune donnée réelle n'a été touchée

Le corpus de la session est fabriqué. Les portes du §1 sont les seules qui
disent quelque chose de **tes** données — et la porte 1.2 (tes deux « IDME et
niv 0 ») est le cas-témoin qui prouve que la règle « on ne bloque pas sur le
nom » tient sur ton matériel.

### 4.3 — Deux erreurs de session, rattrapées

À déclarer, parce qu'elles disent où regarder si quelque chose cloche :

1. **Une expression régulière trop gourmande** a d'abord supprimé cinq
   fonctions voisines dans `js/productions.js` et un gros bloc dans
   `js/echelles.js` — dont la constante `niveauxDefaut`, marquée « NE PAS
   MODIFIER ». Détecté par la suite de tests, fichiers restaurés depuis git, et
   le retrait refait ligne à ligne avec des garde-fous. Le diff final ne retire
   que 28 à 29 lignes par fichier. **Si un niveau de performance ou une couleur
   d'échelle te paraît anormal, c'est le premier endroit à regarder.**

2. **Une suite de tests lancée en arrière-plan pendant les break-tests** a
   produit des résultats faux (les sources étaient volontairement cassées à ce
   moment-là). Résultats jetés, suite relancée sur l'arbre propre.

### 4.4 — Un défaut connu, laissé hors périmètre

Le **titre** d'une carte de bibliothèque (`opts.nom`) n'est pas échappé. Ce
n'est pas un oubli : `js/echelles.js` y injecte délibérément un badge HTML, et
corriger cela proprement demande de démêler sept appelants dont plusieurs
**hors** des bibliothèques. Le plan interdit explicitement d'élargir là. Les
deux défauts que le plan nommait (le bandeau) sont corrigés ; celui-ci est
versé au backlog sous #476.

### 4.5 — Ce qui n'a pas été fait, volontairement

- **Lot 6** (groupes-cours, courriels d'enseignant, `creerCours`) : le plan le
  déclare optionnel, à ne faire qu'après validation des Lots 0-5.
- **La fusion des 24 fonctions `dupliquer*`** : refactor à grande surface, que
  le plan renvoie explicitement à un lot suivant — plus sûr maintenant que les
  sentinelles existent pour l'encadrer.
- **La modale de comparaison côte-à-côte** de #291 : hors périmètre par le plan,
  #291 reste ouvert avec ce reliquat. Voir la décision 3.6.

---

## Récapitulatif

| Section | Rangées | Nature |
|---|---|---|
| §0 Préalable | 5 | à faire avant tout |
| §1 Données | 2 (+ 4 mesures) | ⚠⚠ corpus réel |
| §2 Interface | 30 | dont 5 `iPad` |
| §3 Décisions | 6 | verdicts écrits, pas de case |
| §4 Angles morts | — | déclaration |
