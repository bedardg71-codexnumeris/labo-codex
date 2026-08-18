# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ⏳ NON TRAITÉE — créée le 18 août 2026.
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## Le contexte en trois phrases

Cinq des six specs Playwright rouges de #456 sont **réparées** — c'étaient des
dérives de test (badge retiré #366, API renommée, fixture d'avant #367, prise
de drag sur le menu de type 1.86, sémantique ⌥ = copie 1.87), pas des bugs
d'app. Elles sont éprouvées en **Chromium** dans le conteneur ; **seule une
passe WebKit sur le Mac est un verdict Safari**, et seule elle autorise à
rétrécir la baseline. La sixième (`planif-alignement` › « un bloc glissé près
d'un autre COLLE ») **passe en Chromium ici** : son rouge est propre à
WebKit/Mac, et il manque son message d'erreur exact pour la diagnostiquer.

---

## §0 · Préalable

- [ ] **0.1a** `Terminal` — dans le dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`
  ⮕ Attendu : liste des fichiers reçus puis `Fast-forward`. Si
  `error: Your local changes would be overwritten` → **s'arrêter et le dire**.
- [ ] **0.1b** Recharger l'app, lire le numéro **en bas de page**.
  ⮕ Attendu : **1.87.5**, build `0818-1113`. Sinon, rien de ce qui suit ne
  teste la bonne version.

## §2 · La passe WebKit — tout se joue dans le Terminal

⚠ **Toute cette liste est du Terminal** (exception au modèle, assumée : c'est
une passe de suite de tests). Aucune commande ne va dans la console du
navigateur.

- [ ] **2.1** `Terminal` — depuis `Monitorage_v6/tests` :
  `npm run test:int`
  ⮕ Attendu : la suite tourne (~4 min, 93 tests) et se termine par une ligne
  de bilan `N passed` / `M failed`.
- [ ] **2.1m** — MESURE : recopier la **ligne de bilan exacte** et la liste
  des `failed` s'il y en a. Aucun chiffre n'est un échec ici : c'est la
  mesure qui commande tout le reste.
- [ ] **2.2** Les **cinq specs réparées** n'apparaissent plus parmi les
  échecs (⚠ prédiction, pas certitude : éprouvées en Chromium seulement) :
  - [ ] `planif-toolbar` › plein écran carte mentale
  - [ ] `planif-toolbar` › Alt/⌥+glisser un bloc
  - [ ] `planif-toolbar` › comptabilité du temps (rollup)
  - [ ] `planif-toolbar` › import inter-trimestre
  - [ ] `planif-drag-pointer-148` › CAS D — un drag souris déplace un nœud libre
- [ ] **2.3m** — MESURE : si `planif-alignement` › « un bloc glissé près d'un
  autre COLLE » est encore rouge, **recopier son message d'erreur en entier**
  (les lignes `Error:` + `Expected/Received`). C'est la donnée qui manque :
  cette spec passe en Chromium, son rouge est propre à WebKit.
- [ ] **2.4** `Terminal` — **SEULEMENT si les cinq specs de 2.2 sont vertes** :
  `node scripts/verifier-playwright.mjs --ecrire`
  ⮕ Attendu : la baseline `scripts/playwright-baseline.json` est réécrite et
  ne contient plus que les échecs encore réels (normalement 1 : l'aimantation).
- [ ] **2.4m** — MESURE : recopier le `totalEchecsConnus` et la liste
  `echecsConnus` du fichier réécrit (ou la sortie du script).
- [ ] **2.5** `Terminal` — committer et pousser la baseline réécrite (ou le
  demander à la session Claude du Mac) : c'est elle qui fait foi pour le hook
  de push.

## §3 · Décisions — ce qui attend un verdict

⚠ **Ce ne sont pas des vérifications.** Verdict écrit, pas une coche.

- **3.1** — La spec d'aimantation restante : une fois son message d'erreur
  WebKit recopié (2.3m), veux-tu qu'une prochaine session la **répare sur
  mesure** (c'est la voie normale), ou qu'elle soit **réécrite/retirée** si
  l'assertion s'avère intestable en WebKit headless ? *(verdict : ______)*

## §4 · Ce que je n'ai pas pu vérifier

- **Tout est éprouvé en Chromium, rien en WebKit.** Le conteneur n'a pas
  WebKit ; les cinq réparations sont des verts Chromium. La passe 2.1 est le
  seul juge — c'est exactement pour ça que cette porte existe.
- **La 6ᵉ spec n'a pas été touchée.** Elle passe en Chromium ici ; je n'ai
  aucun message d'erreur WebKit à diagnostiquer. Rien n'a été « réparé au
  jugé ».
- **#418 (db-ready sans IndexedDB)** est éprouvé au banc (boot réel de db.js
  sans indexedDB, 4 essais break-testés) — **pas sur un vrai Safari en
  navigation privée**. Pas de porte dédiée : le mode ne se déclenche pas à la
  demande dans Safari moderne ; si un testeur signale un écran qui ne charge
  pas en navigation privée, c'est le premier suspect à écarter.
- **Mes erreurs de session, y compris rattrapées** :
  1. Ma première réparation d'⌥+glisser mesurait la position **après** le
     relâchement — le dépôt sur un conteneur de la carte démo re-layoutait la
     copie et le test restait rouge pour une mauvaise raison. Corrigé en
     mesurant **pendant** le drag, comme le test voisin le documentait déjà.
  2. Le premier découpage de la sentinelle #418 cherchait la borne
     `beforeunload` depuis le début du fichier — elle existe aussi dans le
     commentaire d'en-tête de `db.js`, le bloc découpé était **vide** et
     l'assertion ne testait rien. Corrigé avec des bornes gardées
     (`indexOf(..., debut)` + assertions de présence).

---

## Au retour du terrain

1. Trier les échecs : défaut réel ou build en retard (0.1b) ?
2. Chaque échec réel → BACKLOG avec son numéro de porte.
3. Mettre à jour CE fichier : état, date, ce qui reste.
4. La baseline ne se réécrit **que** si 2.2 est verte — jamais pour « faire
   propre ».
