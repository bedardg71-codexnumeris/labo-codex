---
name: portes-terrain
description: >
  Modèle OBLIGATOIRE pour toute liste de vérifications destinée à Grégoire —
  ce qu'on appelle « les portes terrain ». Déclencher dès qu'un cycle de
  travail produit des changements que la session ne peut pas éprouver
  elle-même : tout ce qui touche Safari, l'iPad, ou le corpus réel. Produit
  DEUX livrables jumeaux : un artefact interactif (cases à cocher, compteur,
  filtres) pour l'opération, et un markdown versionné dans
  `plans de travail/` pour la trace. Acté le 10 août 2026 à la demande de
  Grégoire : « je veux qu'on utilise dorénavant ce modèle […] ça réduit
  beaucoup les risques d'erreurs ».
---

# SKILL : Portes terrain — le modèle de vérification

> ⚠ **LA CONTRAINTE QUI COMMANDE TOUT LE RESTE : Grégoire n'est pas
> développeur.** Il l'a rappelé explicitement le 10 août 2026, en adoptant ce
> modèle. Une porte qui exige de comprendre le code pour être exécutée est une
> porte ratée, même si elle est juste.

---

## 0. QUAND DÉCLENCHER

Dès qu'un cycle livre du changement que la session **ne peut pas éprouver
elle-même**. Concrètement, presque toujours :

- WebKit n'existe pas dans les conteneurs — **tout ce qui touche Safari et
  l'iPad est structurellement invérifiable en session** ;
- le corpus réel de Grégoire n'est pas là — tout ce qui touche ses données
  l'est aussi ;
- une décision de valeur (une taille, une couleur, un dénominateur) ne se
  tranche pas depuis un test.

**Ne PAS déclencher** pour un correctif interne sans surface visible : une
liste qui contient des portes sans objet se fait ignorer en entier.

---

## 1. LES DEUX LIVRABLES SONT JUMEAUX

| | Rôle | Où |
|---|---|---|
| **Artefact interactif** | l'OPÉRATION — cocher, filtrer, suivre l'avancement | publié, lien donné dans la réponse |
| **Markdown** | la TRACE — versionnée, lisible par la prochaine session | `plans de travail/PORTES-TERRAIN-<date>.md` |

⮕ **Les deux, toujours.** L'artefact seul disparaît du dépôt ; le markdown seul
ne se coche pas. Et une prochaine session qui fait le rituel de début doit
pouvoir retrouver ce qui reste dû **sans avoir accès à la conversation**.

---

## 2. LA STRUCTURE — quatre temps, dans cet ordre

L'ordre n'est pas décoratif : il va **du plus risqué au plus réfléchi**.

### §0 · Préalable
Ce qui invalide tout le reste s'il est sauté. Toujours :
- `git pull` + **vérifier le numéro de version en bas de page** ;
- backup Codex si une porte touche les données ;
- `allow pasting` si une porte demande la console ;
- les deux appareils, les deux modes.

⚠ **Rappeler que son build n'est pas `main`.** Il lance l'app en `file://`
depuis son clone : elle est à la version de son dernier `git pull`. Deux des
quatre échecs des 81 portes étaient des faux rouges venus de là — et **ce type
de faux rouge est indétectable au récit**, parce qu'il décrit exactement l'état
d'avant le correctif, qui est précisément ce que la porte teste.

### §1 · ⚠⚠ Données — ce qu'il exécute sur son corpus
En tête dès qu'il y en a. Ce sont les gestes **irréversibles**.

### §2 · Interface — ce qu'il vérifie à l'écran
Le gros du volume. Une carte par changement livré.

### §3 · Décisions — ce qui attend son verdict
**Ce ne sont pas des vérifications.** Le dire en toutes lettres en tête de
section : ce sont des choix posés faute de pouvoir les trancher à sa place.

### §4 · Ce que je n'ai pas pu vérifier
**Non négociable.** Une checklist qui ne déclare pas ses angles morts se fait
croire complète. Y mettre : ce qui est invérifiable en conteneur, ce qui est
diagnostiqué sans être reproduit, et **les erreurs de la session** — y compris
celles rattrapées de justesse.

---

## 3. L'ANATOMIE D'UNE PORTE

```
  2.1   Titre en langage d'usage                        [valeur ou version]
        #item · d'où ça vient

        ┌ POURQUOI ────────────────────────────────────────────────┐
        │ Ce qu'il a vécu, ou ce qu'il aurait vécu sans le          │
        │ correctif. JAMAIS le mécanisme.                           │
        └───────────────────────────────────────────────────────────┘

        [✓][✗]  Le geste, à l'impératif
                ⮕ Attendu : ce qui doit se produire
                [tags]
```

### Les quatre règles d'écriture

**1. Le « pourquoi » raconte l'expérience, pas le code.**
Ce que Grégoire a vu, ou ce qu'il aurait vu sans le correctif. Il peut
reconnaître un symptôme ; il n'a pas à décoder un mécanisme.

> ❌ « `.u-hide` vaut `display: none !important`, qu'un style en ligne ne peut
> pas contrer. »
> ✅ « Le bouton Supprimer n'apparaissait qu'après avoir rouvert le menu
> déroulant. »
>
> *(Erreur réelle, commise dans l'artefact du 10 août — et signalée par
> Grégoire dans la même réponse où il adoptait le modèle.)*

**2. Chaque geste dit son attendu.**
Sans « attendu », l'utilisateur ne sait pas s'il vient de réussir. Et quand
c'est utile, dire **ce que ça faisait AVANT** : c'est ce qui rend un succès
reconnaissable.

**3. Un geste par rangée, à l'impératif.**
« Aller sur X et ne toucher à rien », puis, rangée suivante, « le bouton
est-il visible ? ». Deux rangées, pas une phrase à deux questions — sinon on
ne sait pas ce qui a échoué.

**4. Tout script de console dit les trois choses.**
Quoi copier, où le coller, **et ce qui doit s'afficher si c'est chargé**.
Toujours donner la commande qui met le fichier dans le presse-papier :

```bash
cat scripts/<fichier>.js | pbcopy   # → Cmd+V dans la console
```

⚠ **Et rappeler la règle qui a coûté trois allers-retours le 10 août** : un
script se colle EN ENTIER, une commande s'appelle APRÈS. Quand la console dit
`is not defined`, c'est toujours que le fichier n'est pas passé.

### Les tags marquent la NATURE du geste, pas le module

| Tag | Sens |
|---|---|
| `⚠⚠ Données` | touche le corpus réel — backup avant |
| `iPad` | seul son matériel peut trancher |
| `Console` | il faut coller un script |

⮕ Ce qui lui permet de filtrer sur **« ce que je peux faire là où je suis »** :
dans le train avec l'iPad, ou devant le Mac avec la console ouverte.

---

## 4. CE QUI FAIT UNE PORTE JUSTE

**Elle teste le VECTEUR, pas seulement l'état.** Vérifier qu'il n'y a plus de
doublon aujourd'hui ne prouve que le nettoyage. C'est **refaire l'import** qui
prouve que le défaut ne reviendra pas. Quand un correctif ferme une porte
d'entrée, la porte terrain doit rejouer l'entrée.

**Elle est exécutable sans la conversation.** Si comprendre la porte exige
d'avoir lu l'échange, elle ne survivra pas à la nuit.

**Son échec a une suite écrite.** « Ce qui échoue devient un item de backlog,
pas une note mentale » — le dire dans l'en-tête, et le tenir au retour.

---

## 5. AU RETOUR DU TERRAIN

1. **Trier les échecs** : défaut réel, ou build en retard ? *(Sur les quatre
   échecs des 81 portes, deux étaient des faux rouges.)*
2. **Verser chaque échec réel** au BACKLOG avec son numéro de porte.
3. **Mettre à jour le markdown** — état, date, ce qui reste.
4. **Ne jamais laisser une porte « probablement passée »** : soit elle est
   cochée, soit elle est due.

---

## 6. ANTI-PATTERNS

- ❌ Expliquer le mécanisme au lieu du symptôme *(règle 1)*
- ❌ Une porte sans attendu — l'utilisateur ne sait pas s'il a réussi
- ❌ Deux questions dans une rangée — on ne sait plus ce qui a échoué
- ❌ Omettre le §4 : une liste sans angles morts déclarés paraît complète
- ❌ Lister des portes invérifiables depuis la branche ouverte *(le document
  entier se fait ignorer — constaté le 9 août)*
- ❌ Publier l'artefact sans le markdown jumeau
- ❌ Écrire « vérifier que ça marche » : dire QUOI regarder, et où

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-08-10 | Création, à la demande de Grégoire (« je veux qu'on utilise dorénavant ce modèle »). Codifie l'artefact du cycle 1.67.1 → 1.71.1, lui-même repris du modèle de captures qu'il avait versé au dépôt le 9 août. La règle 1 (symptôme, pas mécanisme) vient de son rappel « je ne suis pas développeur », dans la même réponse. |
