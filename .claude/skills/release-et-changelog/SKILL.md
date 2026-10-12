---
name: release-et-changelog
description: >
  Procédure de release de Labo Codex et règles de rédaction du changelog
  utilisateur. Charger avant tout bump de version, toute écriture dans
  `js/changelog-data.js`, ou toute question sur le numéro de version affiché.
  Déclencher dès que Grégoire dit « on livre », « bump », « nouvelle version »,
  « release », « changelog », « nouvelles », « qu'est-ce qu'on annonce »,
  « c'est quelle version », ou demande de préparer une livraison publique.
  Déclencher AUSSI quand la livraison est décrite sans le vocabulaire de release :
  « je veux publier ce qu'on a fait », « envoyer ça aux testeurs », « mettre ça en
  ligne », « rendre ça disponible », « faire sortir ça », « qu'est-ce que les
  testeurs vont voir », « prépare la sortie », « on met ça dans les mains des
  profs ». Toute intention de rendre le travail visible aux utilisateurs relève
  de ce skill, même si ni « version » ni « release » n'est prononcé.
  Couvre : l'intention SemVer (patch/minor/major), le script `scripts/release.mjs`
  comme écriture atomique des quatre points de vérité, et les règles éditoriales
  du changelog affiché aux utilisateurs dans la section « Nouvelles ».
---

# SKILL : Release et changelog — Labo Codex

---

## 1. Avant toute release : le rituel de fin de session

**Lancer `/fin-de-session`** (§1 à §6 du skill `fin-de-session-labo-codex`), dont
le **§4 break-test** : faire ROUGIR chaque sentinelle de correctif
données / sécurité / SSOT avant de lui faire confiance.

Le filet **mécanique** (contrôle `innerHTML` au commit, Vitest au push) s'active
seul via le hook SessionStart (`.claude/hooks/session-start.sh` →
`scripts/install-hooks.sh`). Le **§4 adverse** relève du jugement et reste à la
charge de la session : c'est l'étape que le biais d'auteur saute, donc la non
négociable.

---

## 2. Décider l'intention de version

C'est un jugement, pas un calcul :

| Intention | Quand |
|---|---|
| `patch` | correction de bug |
| `minor` | nouveauté sans rupture |
| `major` | rupture, ou changement de format de données |

⚠ **Confirmer avec Grégoire avant un `major`** : c'est un acte visible
publiquement. `patch` et `minor` relèvent du jugement courant.

---

## 3. Lancer le script de release

Source unique, écriture atomique des **quatre points de vérité** :

```bash
node scripts/release.mjs patch|minor|major

# variantes
node scripts/release.mjs --set X.Y.Z      # fixer une version précise
node scripts/release.mjs --build-only     # commit doc/UI sans changer le numéro
node scripts/release.mjs patch --dry-run  # prévisualiser sans écrire
```

Le script calcule le numéro SemVer, horodate le build (Toronto, `MMJJ-HHMM`) et
écrit les **quatre points de vérité**, de façon atomique. **Plus de recopie
manuelle, plus de désync « scripts périmés ».**

### ⚠⚠ LES QUATRE POINTS SONT BIEN QUATRE, ET `version.js` EN FAIT PARTIE

*Corrigé le 2 septembre 2026 (promotion depuis la consigne de démarrage, règle 3
de `PROTOCOLE.md`). Ce skill énumérait « version.json, les deux fallbacks de
`js/init-inline.js` et le snapshot de `js/main.js` » : quatre éléments, mais pas
les bons. `version.js` n'y était pas nommé une seule fois.*

| Point | Rôle |
|---|---|
| `version.json` (racine) | **Source unique de vérité.** |
| `version.js` (racine) | **Le seul que l'application lise en `file://`.** |
| `js/init-inline.js` | Deux fallbacks (`VERSION_MAJEURE`, `BUILD_ID`). |
| `js/main.js` | Snapshot (`_SCRIPT_BUILD_main`). |

**Pourquoi `version.js` existe** : en `file://`, WebKit refuse `fetch` et XHR
(#495). `version.json` y est donc illisible, et un jumeau en JavaScript le
remplace. `js/init-inline.js:235-237` lui donne la **PRIORITÉ** :

```js
if (window.__VERSION__.build) BUILD_ID = window.__VERSION__.build;
```

⮡ **Les trois autres points sont un REPLI. `version.js` décide de ce que Grégoire
voit à l'écran.**

✅ **Le script fait le travail** : il génère `version.js` (`scripts/release.mjs`,
l. 357-362) et pose son anti-cache dans `index.html` (l. 364-374). Mesuré le
2 septembre 2026. Il n'y a donc **rien à faire de plus quand on passe par lui**.

⛔ **LE DANGER EST LE BUMP MANUEL, ET LUI SEUL.** C'est le seul chemin qui puisse
désynchroniser les quatre. Le 1er septembre, un bump `1.106.13 → 1.106.14` fait à
la main sur trois points a laissé `version.js` en arrière : **l'application a
continué d'afficher `1.106.13`**, et quatre cas de `bandeau-maj-chargement.spec.js`
ont rougi. Vérifier « les trois habituels » ne suffit pas quand on ignore qu'il y
en a quatre.

⮕ **RÈGLE : après tout bump manuel, `grep` l'ANCIEN build dans tout le dépôt et
exiger ZÉRO** (avec son témoin : le même motif rendant non-zéro ailleurs).

⚠ **Le jeton anti-cache de `version.js` suit un AUTRE format** : `MMJJHHMM`, le
build sans tiret, et non le `AAAAMMJJ`+lettre des autres. Mesuré :
`index.html:14410` porte `version.js?v=09012050` pour le build `0901-2050`.

⚠ Le hook pre-commit **refuse** un bump qui n'a pas bumpé les jetons de
`js/init-inline.js` et `js/main.js`, les deux fichiers que le bump lui-même
modifie.

---

## 4. Vérifier

1. `git diff` — les quatre points sont cohérents (`version.json`, `version.js`,
   `js/init-inline.js`, `js/main.js`)
2. `cd tests && npm run test:unit`

⛔ **PAS `npm test`.** Il enchaîne Vitest ET Playwright : **plus de dix minutes**
sur cette machine, et six minutes de silence ferment la connexion au serveur
(#533). Corrigé ici le 2 septembre 2026 ; ce skill disait encore `npm test`.

⚠ **« Push réussi » ne signifie pas « suite complète verte ».** Le hook pre-push
ne lance que Vitest ; pour Playwright, il constate qu'aucun verdict local n'existe
et **laisse passer**. L'ordre qui fait qu'un push est réellement jugé est dans le
skill `fin-de-session-labo-codex` : **committer d'abord**, puis
`cd tests && node ../scripts/verifier-playwright.mjs`, puis pousser.

> `version.json` reste la **source unique de vérité**. « Bêta publique » est un
> libellé d'affichage (`init-inline.js`, `rapport-bug.js`), pas le numéro.
> Versionnage sémantique depuis le lancement public du 3 juin 2026.

---

## 5. Changelog utilisateur (`js/changelog-data.js`)

Le changelog est affiché aux utilisateurs dans la section « Nouvelles » de
l'accueil. Il s'adresse à un enseignant, pas à un développeur.

**Règles** :

- **1 entrée par version mineure** (`1.24`, `1.25`, `1.26`…). Consolider les patches.
- **Pas de dates.** Seulement le numéro SemVer (`1.25`, pas « 1.25 (20 février) »).
- **Max 6 à 8 items par entrée**, orientés fonctionnalité utilisateur.
- **Retirer** : corrections CSS, refactos internes, détails d'implémentation.
- **Garder** : fonctionnalités nouvelles, corrections de bugs visibles par
  l'utilisateur.
- **Fonction de rendu** : `genererChangelogHTML()` dans le même fichier.
  Ne pas afficher les dates.

**Structure d'une entrée** :

```javascript
{ version: '1.26', couleur: 'vert', titre: 'Titre court', items: ['...'] }
```

Couleurs : `vert` (fonctionnalités), `bleu` (améliorations), `orange` (corrections).

---

## 6. Règle de relais (8 août 2026)

On **FUSIONNE vers `main` à la fin de CHAQUE session**. Si un merge doit vraiment
attendre, remplir `RELAIS.md` à la racine et le pousser sur `main` SEUL.

Motif : le 8 août, deux sessions sont parties du même commit sans se voir. Chacune
a livré une « 1.55.0 » différente et pris les mêmes identifiants de backlog. La
seconde avait fait le rituel et vérifié la prémisse : elle a trouvé zéro écart,
parce que la prémisse qu'elle lisait sur `main` avait été périmée par une branche
qu'elle ne pouvait pas voir.

⮕ La consigne de relais est un fichier **versionné**. Si le travail vit sur une
branche non mergée, la consigne qui le dit y vit aussi.

⮕ **Ligne « complexité » dans le relais de chaque release** (12 oct. 2026, décision de Grégoire, lot 24) : lancer `node tests/unit/_helpers/complexite.js` et écrire, par rapport à la release précédente, Δ lignes des fichiers de plus de 1 000 lignes, Δ fonctions au-dessus de 15, Δ au-dessus de 30, Δ de la somme des complexités au-dessus de 15.

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-08-17 | Création. Extrait de `CLAUDE.md` (sections « Avant chaque commit » et « Changelog »), désormais réduites à un pointeur. |
| 2026-10-12 | §6 : ligne « complexité » dans le relais de chaque release (chantier « contenir », lot 24). |
