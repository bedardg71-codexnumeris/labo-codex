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

- [ ] `git checkout main && git pull` — **SEULE commande de Terminal de toute
      la liste** (app Terminal, dans `Monitorage_v6`). Puis vérifier **1.71.1 ou
      plus récent** en bas de page. Un numéro antérieur invalide tout le reste.
- [ ] Faire un **backup Codex** ⚠⚠ — plusieurs portes suppriment des données.
- [ ] Console Chrome : taper `allow pasting`, Entrée. Une fois par session.
      *(C'est probablement ce qui bloquait ses premiers essais du 10 août.)*
- [ ] Charger un script **sans Terminal** — corrigé le 10 août au soir. La
      version précédente donnait `cat … | pbcopy`, une commande de *Terminal*,
      au milieu de commandes de *console navigateur*, sans le dire : deux
      erreurs produites. Méthode à une seule fenêtre :
      Finder → `Monitorage_v6/scripts` → **glisser le `.js` dans un nouvel
      onglet Chrome** → Cmd+A, Cmd+C → revenir sur l'app → Cmd+V dans la
      console, Entrée.
      Repère : le rapport doit commencer par `==== #353 · clés orphelines ·
      DRY-RUN`. S'il dit `DIAG #353 … (LECTURE SEULE)`, c'est une **ancienne
      copie** — refaire `git pull`.
- [ ] Retenir : **un script se colle EN ENTIER, une commande s'appelle APRÈS.**
      Quand la console dit `is not defined`, c'est que le fichier n'est pas passé.
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

### 1.1 · Le seuil a mordu — mais pas comme annoncé (#353)
⚠ **Cette porte annonçait « attendu ~44 % ». C'était faux, et l'erreur est de
mon côté.** Le relevé du 10 août au soir sur 1.71.1 dit **100 %, 586 clés**.

**Le seuil fonctionne pourtant**, et la preuve est dans son propre rapport
d'orphelines : `a2024_presences` (184 K car.), `a2024_evaluationsSauvegardees`
(179 K) et `simulation_indicesCP` (72 K) **ont disparu de la liste**. Elles
n'ont pas été supprimées : elles ont *quitté* localStorage pour IndexedDB.

**Ce que ma projection ignorait** : au démarrage, `syncToLocalStorageCache()`
**réécrit** dans localStorage tout ce qui passe sous le seuil. Les grosses clés
sont sorties, des clés qui vivaient en mémoire seule sont entrées à leur place
— d'où 111 clés de plus pour le même total. J'ai modélisé l'éviction, pas le
remplissage. **`db.statsStockage().projectionSeuils` a le même angle mort : ses
chiffres sont un plancher, pas une prévision.**

⮕ Pas dangereux (IndexedDB reste la source de vérité), mais l'objectif de #353
n'est pas atteint. **Chantier, pas porte à cocher.**

- [ ] Refaire le relevé **dans Safari** (était 88,3 %) — mesure d'entrée du
      chantier, **aucun chiffre n'est un échec ici**

### 1.2 · Purger le trimestre a2024 — 85 K car. + 2 grosses clés ailleurs
Trimestre absent du registre `trimestres`. Confirmé fictif par Grégoire. Le
script **exige qu'il soit nommé**.

⚠ **Chiffre corrigé : 448 K car. → 85 K car.** Rien n'a été supprimé. Les deux
plus grosses clés du lot — `a2024_presences` (184 K) et
`a2024_evaluationsSauvegardees` (179 K) — ont quitté localStorage pour IDB au
passage en 1.71.1. **Le script n'énumère que localStorage** (`localStorage.key(i)`,
`diagnostic-353-cles-orphelines.js:102`) : il proposera 21 clés au lieu de 23 et
ne verra jamais les deux grosses. **Deux gestes, pas un.**

- [ ] Geste 1 — `await reparer353({ executer: true, familles: ['trimestres'], trimestres: ['a2024'] })`
      → attendu ~21 clés, ~85 K car.
- [ ] Geste 2 — **regarder d'abord** : `console.log((await db.keys()).filter(k => k.indexOf('a2024_') === 0))`
      → si un nom ne commence pas par `a2024_`, **s'arrêter** et me l'envoyer.
- [ ] Geste 3 — `for (const k of (await db.keys()).filter(k => k.indexOf('a2024_') === 0)) { await db.remove(k); console.log('supprimé : ' + k); }`
      ⚠ **pas de `annuler353()` ici** — le filet, c'est le backup Codex.

### 1.3 · Purger `simulation_indicesCP` — 72 K car., déplacée
Aucun producteur dans tout `js/`, vérifié au grep. Chrome seulement.

⚠ **Le rapport du 10 août au soir affiche « SANS PRODUCTEUR : 0 ». Ce n'est
pas une panne et ce n'est pas un échec.** La clé a elle aussi quitté
localStorage pour IDB : la famille `sansProducteur` restera à zéro. Il faut la
retirer par son nom.

- [ ] `console.log('existe :', (await db.keys()).includes('simulation_indicesCP'));`
      puis `await db.remove('simulation_indicesCP');`
      → si la première ligne dit `false`, elle est déjà partie : **✓ et passer**.

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
- [ ] **Ajoutée le 11 août — compter les cartouches AVANT et APRÈS ce même
      import** (#448, reproduit le matin du 11). Les cours sont réparés, le
      reste ne l'est pas. Aucun geste supplémentaire : c'est l'import de la
      rangée précédente qui sert de vecteur.
      ```js
      (async () => { let n = 0, d = 0;
        for (const k of (await db.keys()).filter(k => k.indexOf('cartouches_') === 0)) {
          const a = (await db.get(k)) || [], noms = a.map(c => c.nom);
          n += a.length; d += noms.length - new Set(noms).size; }
        console.log('cartouches : ' + n + ' au total, dont ' + d + ' portant un nom déjà présent'); })()
      ```
      ⮕ Si le second nombre grimpe entre les deux relevés, #448 est confirmé
      sur les données réelles. **Aucun chiffre n'est un échec** — mesure pure,
      rien n'est supprimé.

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

**~~#448 n'est pas reproduit.~~ REPRODUIT le 11 août au matin — et le mécanisme
accusé était le mauvais.** Ce n'est pas `ajouterCartouchesABibliotheque` : c'est
`verifierUniciteIds` (`import-export.js:69`), qui **renomme** un id en collision
au lieu de reconnaître le même élément, et **garde les deux**. Réimporter un
codex déjà importé duplique donc **cartouches, grilles, échelles, productions et
pratiques** — 10 sites d'appel, croissance linéaire à chaque import (mesuré
2 → 4 → 6). Les copies ne portent **aucun `idOriginal`** : plus rien ne peut les
reconnaître après coup, ce qui explique les copies « citées 0 fois » du relevé.
⮕ Reproduit sur la ligne de fusion RÉELLE avec la vraie fabrique d'ids, en bac à
sable Node — **le parcours d'import complet au navigateur n'a pas été rejoué**.
D'où la 3e rangée de la porte 2.5, qui le mesure sur le corpus réel.

**Ma projection du seuil était fausse, et Grégoire l'a mesurée avant moi.**
J'avais annoncé ~44 % ; il a lu **100 %**. Le seuil fonctionne — les grosses
clés sont bien parties — mais `syncToLocalStorageCache()` *rappelle* au
démarrage tout ce qui passe sous le seuil, et je n'avais modélisé que la
sortie. **`db.statsStockage().projectionSeuils` porte le même angle mort** :
ses chiffres sont un plancher, pas une prévision. Premier point du chantier
#353 de la prochaine session.

**Le geste « ouvrir la Liste puis l'aperçu » est CADUC.** L'aperçu recalcule à
chaque rendu, prouvé en faussant le stockage. Le contournement donné le 10 août
ne servait à rien.

### ⚠ La leçon du cycle

**Quatre diagnostics posés par lecture de code se sont révélés faux, et c'est la
mesure qui les a corrigés** : l'aperçu qui « lisait le stocké » recalculait ;
l'alerte qui criait 200 % d'un quota indépassable comptait dans la mauvaise
unité ; le détecteur d'orphelines allait faire supprimer des snapshots vivants ; la
projection du seuil oubliait le remplissage au boot.

Chaque fois le raisonnement se tenait — sur une question trop étroite.
⮕ **Sur les données, un diagnostic lu au code est une hypothèse.** Le conteneur
a Chromium ; reproduire coûte trois minutes.

Et son corollaire, trouvé sur pièces : **« ne rien casser » n'est pas « ne rien
perdre »**. La 3e copie du cours portait deux champs invisibles qu'un retrait
« sans effet » aurait effacés.
