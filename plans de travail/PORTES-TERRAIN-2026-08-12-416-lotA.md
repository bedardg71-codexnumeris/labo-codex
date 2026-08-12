# PORTES TERRAIN — #416 lot A, le rang de séance (12 août 2026)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact interactif** : <https://claude.ai/code/artifact/1f982bec-ed4d-43a2-a1b6-8fa9c0ece48c>
(publié le 12 août 2026 ; éprouvé au navigateur WebKit avant publication —
compteurs, filtres, persistance, relevé exportable, zéro erreur console).
**Périmètre** : un seul lot. `metadata.rangSeance` sur les leçons, avec son
sélecteur dans l'en-tête du bloc, à droite de celui de la semaine.
**Branche** : `claude/export-gabarits-416`, deux commits (`4b493877` doc,
`bcb7b07c` code). **Rien n'est poussé, rien n'est fusionné.**
**Écrit par** : la session Claude Code du 12 août, reprenant le travail de la
session Cowork du même jour qui ne pouvait pas committer.

---

## §0 · AVANT DE COMMENCER

⚠⚠ **LE PIÈGE PROPRE À CETTE LISTE : le numéro de version ne bougera PAS.**
Aucune release n'a été faite — l'app affichera **1.75.0, build 0811-1319**,
exactement comme hier. Le repère habituel du §0 (« vérifier le numéro en bas de
page ») **ne sert à rien ici** et te ferait conclure à tort que ton build est en
retard. Le seul repère valable : **le sélecteur existe-t-il dans l'en-tête d'un
bloc Leçon ?** S'il n'y est pas, c'est la branche qui n'est pas la bonne.

- [ ] **SEULE commande de Terminal de toute la liste** (app Terminal, dans
      `Monitorage_v6`) :

      git checkout claude/export-gabarits-416

      ⚠ **Pas de `git pull`** : rien n'a été poussé sur GitHub. Le travail vit
      sur ta machine seulement. Si le Terminal répond `error: Your local
      changes…`, s'arrêter et me le dire — ça voudrait dire qu'autre chose a
      touché l'arbre.
- [ ] **Fermer complètement l'onglet de l'app, puis le rouvrir** (ne pas juste
      recharger). Les `?v=` sont passés à `20260812a` sur `planification-carte.js`
      et `styles.css`, mais Safari en `file://` garde parfois l'ancienne copie.
      *Règle du dépôt : suspecter le cache AVANT le code.*
- [ ] **Backup Codex** ⚠⚠ — le §1 écrit dans ta carte A26 réelle.
- [ ] Prévoir **les deux appareils** (Mac et iPad) et **les deux modes**
      (clair et sombre).
- [ ] Au retour : `git checkout main` pour revenir à ton état habituel.

---

## §1 · ⚠⚠ DONNÉES — ce qui écrit dans ta carte A26

### 1.1 · Poser un rang, et le retrouver au retour
`#416 lot A` · c'est le geste que tout le reste sert.

> **POURQUOI.** Jusqu'ici, « séance 2 » ne pouvait vivre que dans le *titre* de
> la leçon — écrit à la main, invisible pour l'export, et impossible à retirer
> sans perdre l'information. C'est ce qui bloquait la moitié du nettoyage des
> titres depuis le 7 août.

- [ ] Sur ta carte d'alignement A26, choisir **une** leçon et lui poser un rang
      (A, B, C ou D) avec le nouveau sélecteur.
      ⮕ **Attendu** : la lettre choisie s'affiche à la place du tiret `—`.
      `⚠⚠ Données`
- [ ] **Recharger la page**, revenir sur la carte, regarder la même leçon.
      ⮕ **Attendu** : la lettre est toujours là. `⚠⚠ Données`
- [ ] Remettre le sélecteur sur `—`, puis recharger.
      ⮕ **Attendu** : il reste sur `—`. Le rang se retire aussi bien qu'il se
      pose. `⚠⚠ Données`

---

## §2 · INTERFACE — ce qui se vérifie à l'écran

### 2.1 · Le sélecteur est COLLÉ à celui de la semaine
`#412` · le piège que ce lot devait éviter

> **POURQUOI.** Le 7 août, deux éléments du même en-tête se sont retrouvés
> chacun à un bout de la barre au lieu d'être côte à côte — l'en-tête avait
> l'air cassé alors que rien ne l'était.

- [ ] Ouvrir la carte, regarder l'en-tête d'un bloc **Leçon**.
      ⮕ **Attendu** : le nouveau sélecteur est **immédiatement à droite** de
      celui de la semaine, séparé de quelques pixels. Pas à l'autre extrémité,
      pas sur une deuxième ligne.
- [ ] Même regard sur un bloc **large** et sur un bloc **étroit**.
      ⮕ **Attendu** : ils restent collés dans les deux cas.
- [ ] Même regard en **mode sombre**.
      ⮕ **Attendu** : la bordure et la lettre restent lisibles ; le sélecteur
      ne devient pas un rectangle vide.

### 2.2 · Au doigt sur iPad, le bloc ne part pas en glissant
`iPad` · seule ta tablette peut trancher

> **POURQUOI.** Sur une tablette, appuyer et glisser sont le même début de
> geste. Si le sélecteur ne retient pas la pression, ouvrir la liste déplace le
> bloc — et le champ devient inutilisable au doigt.

- [ ] Sur iPad, appuyer sur le sélecteur de rang d'une leçon.
      ⮕ **Attendu** : la liste s'ouvre (`—`, A, B, C, D) et **le bloc n'a pas
      bougé d'un pixel**. `iPad`
- [ ] Choisir une lettre au doigt.
      ⮕ **Attendu** : elle s'inscrit, le bloc est toujours à sa place. `iPad`
- [ ] Refaire le même geste sur le sélecteur de **semaine**, juste à côté.
      ⮕ **Attendu** : même comportement. S'ils diffèrent, c'est le nouveau qui
      a tort. `iPad`

### 2.3 · Les séquences n'ont pas de rang — c'est voulu
`#416 lot A` · asymétrie délibérée

> **POURQUOI.** Une séquence s'étend sur plusieurs semaines : elle n'a pas de
> rang *dans* une semaine. Lui en donner un rouvrirait la contradiction
> séquence/leçons retirée le 6 août.

- [ ] Regarder l'en-tête d'un bloc **Séquence**.
      ⮕ **Attendu** : il porte son sélecteur de **semaine**, et **aucun**
      sélecteur de rang. Ce n'est pas un oubli.

### 2.4 · Annuler après avoir posé un rang
`#416 lot A`

- [ ] Poser un rang sur une leçon, puis **Cmd+Z**.
      ⮕ **Attendu** : le rang revient à son état précédent, comme pour n'importe
      quelle autre modification de la carte.

### 2.5 · La liste ne se dédouble pas
`#416 lot A` · rendu paresseux

> **POURQUOI.** La liste ne se construit qu'au premier contact, pour ne pas
> alourdir l'affichage de toute la carte. Un défaut classique de ce mécanisme
> est de repeupler à chaque ouverture — la liste s'allonge alors à l'infini.

- [ ] Ouvrir, fermer, rouvrir le même sélecteur **cinq fois de suite**.
      ⮕ **Attendu** : toujours exactement cinq entrées — `—`, A, B, C, D. Jamais
      dix, jamais quinze.

---

## §3 · DÉCISIONS — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des choix posés faute de pouvoir
> les trancher à ta place. Chacun attend une **réponse écrite**, pas une case
> cochée.

### 3.1 · La cible tactile est-elle assez grande sur iPad ?
Le sélecteur mesure **44 px de large, 28 px de haut** au doigt. La règle
d'Apple est 44 × 44. La hauteur a été gardée basse pour ne pas faire grossir
l'en-tête du bloc.

**Verdict attendu** (à écrire) : *facile à viser* · *jouable mais serré* ·
*trop petit, il faut monter à 44 de haut*.

### 3.2 · Quatre rangs suffisent-ils ?
Le sélecteur propose A, B, C, D — quatre rencontres par semaine au maximum.
C'est une capacité d'interface, pas une lecture de ton horaire : elle ne
dépend d'aucune donnée saisie.

**Verdict attendu** (à écrire) : *quatre suffisent* · *il en faut plus (combien ?)*.

### 3.3 · Le tiret `—` se lit-il comme « pas de rang » ?
C'est ce qu'affiche le sélecteur tant qu'aucun rang n'est posé.

**Verdict attendu** (à écrire) : *clair* · *ambigu, préférer* … (proposer le
libellé).

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

**Le tactile réel, et Safari en usage.** Les tests automatisés pilotent WebKit,
pas un doigt sur une vitre. Les portes 2.2 et 3.1 sont exactement ce qu'aucune
session ne peut porter.

**Cinq tests d'intégration sont ROUGES — et ce n'est pas le lot A.** Découverte
du jour, à consigner : ton Mac exécute WebKit, ce que les sessions en conteneur
ne pouvaient pas faire (le binaire y est absent). En le lançant pour la première
fois, cinq spécifications échouent : quatre dans `planif-toolbar.spec.js`, une
dans `planif-alignement.spec.js`.

⮕ **Mesuré, pas supposé** : les **cinq mêmes** échouent sur `main` **sans** le
lot A. Le lot est neutre. Au moins un cas est daté avec certitude — la
spécification attend le badge « En évolution » du module Alignement, **retiré le
9 août** sans que le test soit mis à jour (#366). Les quatre autres ne sont pas
diagnostiquées.

⚠ **La cause générale vaut plus que les cinq cas** : ces tests ne tournaient
nulle part. Le conteneur ne pouvait pas, et personne ne les lançait ici. Ils
ont donc dérivé en silence pendant que le harnais Vitest, lui, restait vert.
**C'est un chantier distinct, à ouvrir** — pas un correctif d'export.

**Deux écarts trouvés au rituel de début**, tous deux corrigés avant de
committer :

1. `RELAIS.md` annonçait « aucune dette de fusion, 0/0 ». C'était faux : un
   commit poussé le 11 août au soir (`256707a9`, #454 r2) manquait au dépôt
   local. Il a été intégré avant de créer la branche — sans conflit, il ne
   touche aucun fichier du lot A.
2. Un `.git/index.lock` orphelin de 0 octet, daté 10 h 04, **bloquait tout
   geste git**. Aucun processus git ne tournait ; il a été retiré. C'est le
   même verrou qui empêchait la session Cowork de committer.

**Une erreur de ma part, sans conséquence.** Pour dater les échecs WebKit, j'ai
tenté de mettre ton travail non commité de côté (`git stash`) alors qu'il
n'existait qu'en un seul exemplaire, dans ton répertoire de travail. Le verrou
l'a fait échouer, donc rien n'a bougé. La mesure a été refaite proprement
**après** les commits, en basculant sur `main` avec un arbre propre — ce qui
était la bonne façon depuis le début.

**Ce qui n'est pas dans ce lot** : les colonnes d'export elles-mêmes. Le rang
existe dans le modèle et se saisit à l'écran ; **aucun export ne le montre
encore**. C'est le lot C (la date) puis les lots G et I (le générateur et le
gabarit Calendrier).

---

## ÉTAT

**Relevé de Grégoire, 12 août — 9 passées, 0 échec, 3 dues.**

| Porte | État |
|---|---|
| 1.1 · poser, recharger, retirer | ✓ les trois |
| 2.1 · collé à la semaine (large, étroit, sombre) | ✓ les trois |
| 2.2 · au doigt sur iPad | ✓ les trois — après déploiement de 1.76.0 |
| 2.3 · pas de rang sur les séquences | ✓ |
| 2.4 · annuler | ✓ |
| 2.5 · la liste ne se dédouble pas | ✓ |

**Verdicts du §3** : 3.2 → **oui, quatre rangs suffisent** (décision close,
`RANG_SEANCE_MAX = 4` reste). 3.3 → **oui, le tiret se lit** (décision close).
3.1 → **close par l'usage** : « tout se passe bien sur iPad » (12 août, après
déploiement). La cible reste à 44 × 28 ; aucune gêne signalée en usage réel,
donc on ne monte pas à 44 × 44. Si une gêne apparaît plus tard, c'est un
ajustement de `min-height` dans `.planif-noeud-seance`, rien d'autre.

▣ **CE QUI A BLOQUÉ LES TROIS DERNIÈRES PORTES, et qui se reproduira.** « Je dois
pouvoir déployer le travail pour y avoir accès sur iPad ». C'est exact et ce
n'est pas contournable : sur Mac il ouvre l'app en `file://` depuis son clone,
mais son iPad n'accède qu'à `app.codexnumeris.org`, alimenté par Netlify **au
push sur `main`** (`DEPLOY.md` §2.1). Aucune préversion de branche n'est
documentée.

⮕ **Conséquence à assumer, pas à masquer** : pour tout ce qui se juge au doigt,
l'ordre habituel s'inverse — **on déploie pour pouvoir vérifier**. C'est ce qui
a motivé la release 1.76.0 avec trois portes encore ouvertes.

⚠ **Deux détails de la doc de déploiement, relevés au passage le 12 août** :
`DEPLOY.md` §1.2 donne `labocodex.netlify.app` comme origine Netlify — elle
répond **404** aujourd'hui, le nom du site a changé. Et `version.json` ouvert
directement dans la barre d'adresse renvoie une erreur (challenge Cloudflare +
en-tête `no-store`), alors que la même ressource répond 200 depuis l'app. La
vérification de version se fait par le bas de page, pas par l'URL du fichier.

| | |
|---|---|
| **Portes ouvertes au départ** | 12 vérifications + 4 préalables + 3 décisions |
| **Fermées** | **TOUTES** — 12 vérifications + 3 décisions, 12 août 2026 |
| **Échecs** | aucun |
| **Vitest** | 2246 / 2246 (249 fichiers), rejoué sur l'arbre commité |
| **Break-tests** | 13 / 13 ROUGE (`node scripts/break-test-416-rang-seance.mjs`) |
| **Playwright WebKit** | 87 verts, 5 rouges — **préexistants, mesurés sur `main`** |
