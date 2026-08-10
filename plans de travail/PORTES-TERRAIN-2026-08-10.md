# PORTES TERRAIN — cycle du 10 août 2026 (1.67.1 → 1.71.1)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact** : publié le 10 août 2026 (lien dans la conversation du cycle).
**Périmètre** : six versions livrées en une soirée — 1.67.2 (#442), 1.68.0
(#445), 1.69.0 (#443), 1.70.0 + 1.71.0 (#353), 1.71.1 (bouton Supprimer).
**Non éprouvé en session** : WebKit n'existe pas dans le conteneur.

---

## §0 · AVANT DE COMMENCER

⚠ **Le build de Grégoire n'est pas `main`.** Il lance l'app en `file://` depuis
son clone : elle est à la version de son dernier `git pull`. Deux des quatre
échecs des 81 portes étaient des faux rouges venus de là.

- [ ] `git checkout main && git pull` — puis vérifier **1.71.1 ou plus récent**
      en bas de page. Un numéro antérieur invalide tout le reste.
- [ ] Faire un **backup Codex** ⚠⚠ — plusieurs portes suppriment des données.
- [ ] Console Chrome : taper `allow pasting`, Entrée. Une fois par session.
      *(C'est probablement ce qui bloquait ses premiers essais du 10 août.)*
- [ ] Retenir : **un script se colle EN ENTIER, une commande s'appelle APRÈS.**
      `cat scripts/<fichier>.js | pbcopy` → Cmd+V. Quand la console dit
      `is not defined`, c'est que le fichier n'est pas passé.
- [ ] Prévoir **les deux appareils** (Chrome ET Safari sur Mac, iPad) et
      **les deux modes**.

---

## §1 · ⚠⚠ DONNÉES — ce qu'il exécute sur son corpus

> En tête parce que son localStorage était **plein à 100 %** : 2 559 caractères
> de marge, l'équivalent d'une ligne de texte.

⚠⚠ **LE DÉTECTEUR D'ORPHELINES A ÉTÉ CORRIGÉ APRÈS SA PREMIÈRE PASSE.** Il
classait des snapshots **vivants** comme morts : ils sont nommés d'après le
**groupe-cours**, pas le cours. Ses quatre grosses clés `GC_*` (356 K car. de
trajectoires a2025/h2026) étaient dans la liste à supprimer. **Le rapport du
10 août ne vaut plus — relancer le dry-run avec le script à jour.**

### 1.1 · Le seuil a-t-il mordu ? (#353)
Le seuil IDB-first valait **200 Ki** — au-dessus de sa plus grosse clé
(184 K car.). Il n'avait donc jamais pu se déclencher depuis mars. Il est à
**25 Ki**, et se réapplique seul au démarrage.

- [ ] Après `git pull` + rechargement, relever l'occupation
      → **attendu ~44 %** (était 100 % Chrome / 88,3 % Safari)
- [ ] Refaire le relevé **dans Safari**

### 1.2 · Purger le trimestre a2024 — 448 K car., Chrome seulement
23 clés d'un trimestre absent du registre `trimestres`. Confirmé fictif par
Grégoire. Le script **exige qu'il soit nommé**.

- [ ] `await reparer353({ executer: true, familles: ['trimestres'], trimestres: ['a2024'] })`

### 1.3 · Purger `simulation_indicesCP` — 72 K car.
Aucun producteur dans tout `js/`, vérifié au grep. Chrome seulement.

- [ ] `await reparer353({ executer: true, familles: ['sansProducteur'] })`

### 1.4 · Purger les snapshots réellement orphelins
⚠ **Lire la NOUVELLE liste d'abord.** Après correction, restent
`h2026_snapshots_COURS1766455789356` (l'id d'avant la migration #154) et quatre
clés à 0 K car. `demo_snapshots_demo-cours` est légitime.

- [ ] Vérifier qu'aucune clé `GC_*` vivante ne figure dans la liste
- [ ] `await reparer353({ executer: true, familles: ['snapshots'] })`

### 1.5 · Tout refaire dans Safari
Les deux navigateurs ne portent pas les mêmes données : **596 K car. d'écart**,
et les `a2024_*` n'existent que dans Chrome.

- [ ] Rejouer 1.2 → 1.4 dans Safari, en relisant chaque dry-run

---

## §2 · INTERFACE — ce qu'il vérifie à l'écran

### 2.1 · Le bouton Supprimer d'un groupe-cours, à l'arrivée (1.71.1)
Le bouton n'apparaissait **qu'après avoir rouvert le menu déroulant**. La
restauration automatique du groupe actif ne le révélait pas.

- [ ] Aller sur **Trimestre → Groupe-cours** et **ne toucher à rien**
- [ ] Le bouton Supprimer est-il visible ?

### 2.2 · Déposer un lien sur une ligne d'objectif (#445, 1.68.0)
Grégoire avait tenté de relier une activité à un objectif **en traçant un
lien** — un canal qui n'existait pas, donc un silence.

- [ ] Tracer un lien depuis une activité, le déposer sur la ligne d'un objectif
      **de sa leçon** → message de confirmation, pastille qui change, case
      cochée dans l'Inspecteur `iPad`
- [ ] Recommencer depuis un bloc d'une **autre leçon** → **refus expliqué**,
      pas un silence

### 2.3 · La légende des pastilles `!` `⚠` `✓` (#445, 1.68.0)
Leur sens ne vivait que dans une infobulle **au survol** — inexistante au doigt.

- [ ] Inspecteur d'une leçon **qui porte des objectifs** : la légende y est-elle ? `iPad`
- [ ] Guide de la carte, **page 5 « Ce que la leçon vise »** : légende + geste de dépôt

### 2.4 · Le wizard ne propose plus « Par objectifs » (#443, 1.69.0)
L'assistant offrait encore un paradigme retiré en 1.63, moteur compris.

- [ ] Étape « Approche d'évaluation » → plus de carte « Par objectifs »
- [ ] Ouvrir **en édition** une pratique enregistrée ainsi → s'ouvre sur sa
      structure réelle, **ne perd rien** tant qu'on ne sauvegarde pas ⚠⚠

### 2.5 · La bibliothèque de cours, sans sosies (#442, 1.67.2)
Trois fiches au même id, **deux marquées « Actif »** — visible sur sa capture.

- [ ] Bibliothèque de cours → une seule fiche 601-101-MQ, aucune en double
- [ ] ⚠ **Refaire un import de codex**, puis rouvrir → toujours une seule ⚠⚠
      *(C'est cette rangée qui prouve que le VECTEUR est bouché ; la première
      ne prouve que le nettoyage.)*

### 2.6 · Son Safari ne connaît pas `a2026`
Chrome déclare a2025, h2026, **a2026**. Safari ne déclare qu'a2025 et h2026 —
il prépare la rentrée d'un seul côté. Et Safari porte un
`demo_snapshots_<GC réel de h2026>` : croisement de contexte, famille #446.

- [ ] Décider où a2026 se prépare, et si l'autre navigateur doit le recevoir

---

## §3 · DÉCISIONS — ce qui attend son verdict

> Ce ne sont pas des vérifications : ce sont des choix posés **faute de pouvoir
> les trancher à sa place**. Aucun ne se code sans lui.

### 3.1 · Les quatre valeurs gelées (#437, #436) — depuis le 9 août
⚠ Elles viennent de **deux chantiers différents**, et la confusion a déjà eu
lieu une fois. **Les deux premières se voient ; les deux dernières se pensent.**

- [ ] **Carte** : cible tactile de la ligne d'objectif à **28 px**, sarcelle
      `#0891b2` des cinq étapes `iPad`
- [ ] **Pratiques** : dénominateur de l'indice C à **3**, quota affiché des
      jetons à **2** ⚠⚠ *(ce sont des chiffres affichés)*

### 3.2 · La forme de la suppression dans la bibliothèque (#449)
`cours` est la **seule bibliothèque sans suppression par fiche**. Deux
conditions avant de déplacer : distinguer « Retirer de ma sélection »
(réversible) de « Supprimer la fiche » (définitif, tous trimestres — le magasin
est global) ; et faire arriver **en même temps** le garde qui refuse quand des
données pendent au cours.

- [ ] Trancher la forme : deux boutons ? un menu ⋮ ? un avertissement qui liste ?

### 3.3 · Les deux « IDME et niv 0 » d'a2025 (#442)
Ids différents, **toutes deux référencées** (6 et 4 citations). Ce ne sont pas
des doublons mais deux échelles réellement utilisées. *Un script ne tranche
jamais ça.*

- [ ] Fusion, renommage, ou statu quo ⚠⚠

### 3.4 · Le chantier 3 de la taxonomie SOLO a-t-il encore un objet ? (#441)
Jamais amorcé, et **le manque est invisible** : la révision du 4 juin a réécrit
le guide pour décrire l'app telle qu'elle est.

- [ ] Si non : archiver le chantier 3. Si oui : rouvrir la page 5 du guide.

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

**WebKit n'existe pas dans le conteneur.** Toutes les portes marquées `iPad`
sont structurellement invérifiables en session. Chromium a servi à reproduire
plutôt qu'à supposer, mais il ne remplace pas son matériel.

**#448 n'est pas reproduit.** Les cartouches se dupliquent à l'import : deux
lots datés (24 mars, 27 juin), copies citées zéro fois. Mécanisme **lu au code**
(`ajouterCartouchesABibliotheque` fait un `push` nu avec un id neuf) et
corroboré par les horodatages — **pas rejoué**.

**Le geste « ouvrir la Liste puis l'aperçu » est CADUC.** L'aperçu recalcule à
chaque rendu, prouvé en faussant le stockage. Le contournement donné le 10 août
ne servait à rien.

### ⚠ La leçon du cycle

**Trois diagnostics posés par lecture de code se sont révélés faux, et c'est la
mesure qui les a corrigés** : l'aperçu qui « lisait le stocké » recalculait ;
l'alerte qui criait 200 % d'un quota indépassable comptait dans la mauvaise
unité ; le détecteur d'orphelines allait faire supprimer des snapshots vivants.

Chaque fois le raisonnement se tenait — sur une question trop étroite.
⮕ **Sur les données, un diagnostic lu au code est une hypothèse.** Le conteneur
a Chromium ; reproduire coûte trois minutes.

Et son corollaire, trouvé sur pièces : **« ne rien casser » n'est pas « ne rien
perdre »**. La 3e copie du cours portait deux champs invisibles qu'un retrait
« sans effet » aurait effacés.
