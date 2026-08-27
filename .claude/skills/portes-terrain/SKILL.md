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

### ⚠⚠ LES DEUX RÈGLES QUI PASSENT AVANT TOUT LE RESTE (24 août 2026)

**Elles viennent de Grégoire, ce jour-là : « Je suis complètement découragé par
les portes terrain nombreuses. […] Ma préparation de cours n'avance pas pendant
ce temps. »** Il avait 24 portes d'une session et 35 d'une autre. Une liste que
personne ne peut faire ne protège rien.

**RÈGLE 1 — Une porte n'existe que si AUCUNE MACHINE ne peut répondre.**
Le défaut par défaut est d'écrire un test, même si ça coûte plus de travail à la
session. Une vérification automatisable coûte une heure UNE FOIS ; la même
vérification en porte coûte dix minutes à Grégoire À CHAQUE CYCLE.
Avant d'écrire une rangée, se demander : *un test pourrait-il répondre à ça ?*
Si oui, l'écrire, et ne pas mettre la rangée.

> **L'incident qui fonde la règle.** La porte terrain du 24 août (#476 volet 2)
> comptait 24 rangées. Le banc de caractérisation en mesurait déjà **19**, dans
> un vrai navigateur contre le vrai `index.html`. Une 20ᵉ — « la copie s'ouvre-t-elle
> vraiment MODIFIABLE à l'écran ? » — était un vrai trou, et elle a été
> automatisée en une heure. Les 3 portes iPad avaient été posées **par réflexe de
> gabarit** : ce chantier n'avait touché aucun CSS ni aucune mise en page.
> Restaient **3 portes réelles**. Le modèle disait pourtant déjà de ne pas lister
> de portes sans objet — il a été appliqué mécaniquement.

**RÈGLE 2 — La vérification PRÉALABLE n'est due que si un raté est IRRÉVERSIBLE.**
Grégoire est le seul utilisateur de Labo Codex. Une porte existe pour attraper un
défaut *avant* qu'il le rencontre — mais il est la seule personne qui le
rencontrerait, et le coût d'un raté est « il le dit, on corrige ». Le coût de la
porte, lui, est prélevé sur sa préparation de cours.

- **Porte terrain due** : perte de données, corruption, écriture irréversible sur
  un trimestre réel, migration de masse.
- **Pas de porte** : apparence, confort, comportement, renommage, refactor. On
  livre, et il signale ce qui cloche en usage normal.

⮕ Ces deux règles ne dispensent PAS du §4 (« ce que je n'ai pas pu vérifier ») :
ce qui n'est pas vérifié doit être DIT, qu'on en fasse une porte ou non.

### Le cas général

Dès qu'un cycle livre du changement que la session **ne peut pas éprouver
elle-même** — ET que la règle 1 ne permet pas de l'automatiser, ET que la
règle 2 en fait un enjeu de données. Concrètement :

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

### ⚠ L'artefact DOIT savoir rendre son relevé — bouton « Copier mes résultats »

**Non négociable depuis le 11 août 2026.** L'avancement vit dans le
`localStorage` du navigateur de Grégoire : **la session ne peut pas le lire.**
Sans bouton d'export, « les tests sont complétés » est une phrase sans données,
et la seule issue est de lui faire retaper les rangées — ce qu'aucun humain ne
fait en entier. **On ne récupère alors que les échecs, donc on perd les ✓ (quelles
portes sont réellement closes) et surtout les MESURES.**

Le bouton construit un texte à partir du DOM et de l'état coché : compte
`passées / échec / non traitées`, puis les rangées groupées par section et par
porte, préfixées `[v]` `[X]` `[ ]`.

### ⚠⚠ UNE CASE À COCHER NE PEUT PORTER NI UN NOMBRE, NI UN VERDICT

**Constaté sur pièces le 11 août, au premier usage du bouton.** Le relevé est
revenu **28 passées, 0 échec** — excellent — et pourtant **il ne contenait
aucune des informations dont le chantier suivant avait besoin** :

- les **trois lignes de mesure** sont revenues **vides** (occupation Safari,
  cartouches avant/après import). Une case cochée dit *« fait »*, jamais
  *« combien »* ;
- les **cinq rangées du §3** sont revenues **cochées ✓**. Or ce sont des
  DÉCISIONS : ✓ signifie « j'ai tranché », et **le verdict n'est nulle part**.
  Cocher « Trancher la forme : deux boutons ? un menu ⋮ ? » ne dit pas laquelle.

⮕ **La cause est de conception, pas d'usage** : le §3 est déclaré « ce ne sont
pas des vérifications » dès la structure (§2 de ce skill), mais l'artefact leur
donnait quand même des bascules ✓/✗. *La forme contredisait le texte, et c'est
la forme qui gagne.*

⮕ **Deux corollaires, à appliquer dès la conception de l'artefact** :
1. **Toute rangée du §3 porte un champ de saisie**, pas une bascule — et
   l'export reprend ce qui y est écrit. Une décision sans verdict écrit n'est
   pas une décision prise, c'est une décision perdue.
2. **Toute rangée qui produit un chiffre porte un champ de saisie à côté de la
   bascule.** Sinon le nombre reste dans la console, la console se ferme, et il
   faut refaire le geste. À défaut, l'export pré-remplit les lignes vides — un
   pis-aller, et il a échoué du premier coup.

⚠ **Le presse-papiers peut être refusé dans un cadre** : toujours doubler d'un
`<textarea>` visible et présélectionné. Le bouton ne doit jamais échouer en
silence — c'est le défaut qu'il est censé corriger.

⮕ **Et l'éprouver au navigateur avant de publier.** Le conteneur a Chromium
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` en `executablePath` —
Playwright cherche par défaut une version qu'il n'a pas). Cocher quelques
rangées, cliquer, relire le texte produit, vérifier zéro erreur de page. *Un
bouton d'export non éprouvé est exactement le genre d'affichage muet que ce
projet a trouvé trois fois en un cycle.*

---

## 2. LA STRUCTURE — quatre temps, dans cet ordre

L'ordre n'est pas décoratif : il va **du plus risqué au plus réfléchi**.

### §0 · Préalable
Ce qui invalide tout le reste s'il est sauté. Toujours :

⚠⚠ **AVANT TOUTE SUITE PLAYWRIGHT : GitHub Desktop DOIT être fermé.** (26 août 2026.) Les specs
ouvrent le vrai `index.html` en `file://` et lisent l'arbre de travail EN DIRECT : une commande git
lancée depuis l'application pendant la suite change les fichiers sous les pieds des tests, et fait
rougir des specs quelconques, sans rapport avec le code. Deux specs ont ainsi été prises pour une
régression du chantier, puis pour une instabilité, avant que Grégoire ne signale que
l'application tournait. Rejouées fenêtre fermée : vertes. C'est le pendant, côté tests, du piège
déjà connu de GitHub Desktop qui stashe le travail non commité au changement de branche.

⮕ Et la leçon de méthode qui va avec : quand une mesure ne s'explique pas, **demander ce qui
tournait à côté avant de mesurer davantage**. Les deux hypothèses formulées ce jour-là étaient
plausibles et fausses ; aucune exécution supplémentaire ne les aurait départagées, parce qu'aucune
ne portait sur la vraie variable.

- **vérifier le numéro de version en bas de page** — c'est le geste qui vaut dans
  TOUS les cas, et le seul qui prouve quelque chose ;

  ⚠⚠ **NE PAS ÉCRIRE « fais un `git pull` » SANS AVOIR VÉRIFIÉ D'OÙ TU AS TRAVAILLÉ.**
  (27 août 2026.) Le dépôt de Grégoire, `~/Documents/GitHub/Monitorage_v6`, sert
  À LA FOIS d'arbre de travail aux sessions et de source `file://` à son
  application. **Quand la session commite là — le cas courant — ses commits sont
  DÉJÀ chez lui : il n'y a rien à tirer.** GitHub Desktop affiche alors « No local
  changes » et un bouton « Fetch origin » qui ne propose aucun pull, et la porte
  se bloque sur sa toute première rangée.

  ⮕ **C'est arrivé ce jour-là**, et le `RELAIS.md` l'annonçait pourtant noir sur
  blanc (« le `git pull` des portes terrain lui est inutile »). La consigne a été
  recopiée du gabarit sans être confrontée à la situation — exactement le défaut
  que les deux règles de tête de ce skill visent, appliqué au §0.

  ⮕ **La rangée juste** : « recharge l'application, et lis le numéro en bas de
  page ». Le `git pull` ne s'ajoute que si la session a travaillé AILLEURS que
  dans son clone (worktree, autre machine, branche non fusionnée) — et il faut
  alors le dire, avec la raison.
- backup Codex si une porte touche les données ;
- `allow pasting` si une porte demande la console ;
- les deux appareils, les deux modes.

⚠ **Rappeler que son build n'est pas forcément celui de `main`.** Il lance l'app
en `file://` depuis son clone : elle est à la version des fichiers SUR SON DISQUE.
Quand la session a commité dans ce même clone, ils sont à jour dès le commit ;
quand elle a travaillé ailleurs, ils sont à la version de son dernier `git pull`.
Deux des quatre échecs des 81 portes étaient des faux rouges venus de là — et **ce
type de faux rouge est indétectable au récit**, parce qu'il décrit exactement
l'état d'avant le correctif, qui est précisément ce que la porte teste.
⮕ D'où le geste qui tranche dans les deux cas : **lire le numéro en bas de page**.

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

### Les cinq règles d'écriture

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
Quoi copier, où le coller, **et ce qui doit s'afficher si c'est chargé**. Ce
troisième point n'est pas décoratif : c'est le seul moyen pour lui de
distinguer « le script a tourné » de « une vieille copie a tourné ». Donner un
repère textuel exact, pas une paraphrase :

> ✅ « Le rapport doit commencer par `==== #353 · clés orphelines · DRY-RUN`.
> S'il dit `DIAG #353 … (LECTURE SEULE)`, c'est une **ancienne copie** —
> refaire `git pull`. »

⚠ **Et rappeler la règle qui a coûté trois allers-retours le 10 août** : un
script se colle EN ENTIER, une commande s'appelle APRÈS. Quand la console dit
`is not defined`, c'est toujours que le fichier n'est pas passé.

**5. Toute commande dit SUR QUELLE SURFACE elle se tape. Non négociable.**
Il y a deux fenêtres, elles ne se ressemblent pas assez : le **Terminal** de
macOS et la **console du navigateur**. Rien dans un bloc de code ne dit
laquelle. Un bloc mal orienté ne produit pas un résultat faux — il produit un
message d'erreur incompréhensible, et l'utilisateur conclut que le correctif
est cassé.

> ❌ Donner `cat scripts/<fichier>.js | pbcopy` dans une liste dont tous les
> autres blocs sont du JavaScript de console.
> ✅ Étiqueter : « **SEULE commande de Terminal de toute la liste** », tag
> `Terminal` sur la rangée.
>
> *(Erreur réelle, 10 août 2026 au soir : le `cat` collé dans la console de
> Chrome a donné `SyntaxError: Unexpected identifier 'scripts'`. La règle 4
> était écrite ; elle n'avait pas été appliquée.)*

**Mieux encore : supprimer la surface en trop.** Charger un script ne demande
pas de Terminal — il existe une méthode à une seule fenêtre, à préférer par
défaut :

> Finder → dossier `scripts` → **glisser le `.js` dans un nouvel onglet du
> navigateur** (il s'affiche en texte) → Cmd+A, Cmd+C → revenir sur l'onglet
> de l'app → Cmd+V dans la console, Entrée.

⮕ Règle générale : **une porte terrain qui mélange deux surfaces sans le dire
est un piège, pas une consigne.** Si une seule ligne de la liste sort de la
console du navigateur, elle doit se signaler elle-même.

### Les tags marquent la NATURE du geste, pas le module

| Tag | Sens |
|---|---|
| `⚠⚠ Données` | touche le corpus réel — backup avant |
| `iPad` | seul son matériel peut trancher |
| `Console` | se tape dans la console du **navigateur** |
| `Terminal` | se tape dans l'app **Terminal** — à éviter, et à signaler quand c'est inévitable |

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
- ❌ **Publier un artefact sans bouton « Copier mes résultats »** — l'avancement
  vit dans SON navigateur ; sans export, « les tests sont complétés » arrive
  sans aucune donnée *(11 août)*
- ❌ **Donner une bascule ✓/✗ à une rangée du §3 ou à une rangée qui produit un
  chiffre.** Une case cochée ne porte ni verdict ni nombre : le relevé du
  11 août est revenu 28/28 avec les cinq décisions « prises » et introuvables
- ❌ Écrire « vérifier que ça marche » : dire QUOI regarder, et où
- ❌ **Mélanger Terminal et console du navigateur sans le dire** *(règle 5 —
  a produit `SyntaxError: Unexpected identifier 'scripts'` le 10 août au soir)*
- ❌ **Annoncer un attendu chiffré issu d'une projection non mesurée.** Un
  attendu faux est pire que pas d'attendu : l'utilisateur coche ✗ et conclut
  que le correctif a échoué alors qu'il a marché. Si le chiffre est une
  prédiction, l'écrire comme telle — ou n'en donner aucun et dire « mesure
  d'entrée, aucun chiffre n'est un échec ici ». *(10 août : projection à
  ~44 %, mesure à 100 % — le seuil avait pourtant mordu.)*

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-08-24 | **Les deux règles de tête** (§0) : une porte n'existe que si aucune machine ne peut répondre ; la vérification préalable n'est due que si un raté est irréversible. Adoptées après que Grégoire eut dit son découragement devant 24 portes d'une session et 35 d'une autre — dont 19 étaient déjà mesurées par les tests. Le gabarit avait été appliqué mécaniquement, y compris 3 portes iPad sur un chantier sans une ligne de CSS. |
| 2026-08-11 | Bouton « Copier mes résultats » rendu obligatoire, éprouvé au navigateur avant publication. Et la leçon de son premier usage : une case à cocher ne porte ni un nombre ni un verdict — les rangées du §3 et les rangées de mesure prennent un champ de saisie, pas une bascule. |
| 2026-08-10 | Création, à la demande de Grégoire (« je veux qu'on utilise dorénavant ce modèle »). Codifie l'artefact du cycle 1.67.1 → 1.71.1, lui-même repris du modèle de captures qu'il avait versé au dépôt le 9 août. La règle 1 (symptôme, pas mécanisme) vient de son rappel « je ne suis pas développeur », dans la même réponse. |
