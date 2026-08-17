---
name: release-et-changelog
description: >
  Procédure de release de Labo Codex et règles de rédaction du changelog
  utilisateur. Charger avant tout bump de version, toute écriture dans
  `js/changelog-data.js`, ou toute question sur le numéro de version affiché.
  Déclencher dès que Grégoire dit « on livre », « bump », « nouvelle version »,
  « release », « changelog », « nouvelles », « qu'est-ce qu'on annonce »,
  « c'est quelle version », ou demande de préparer une livraison publique.
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
synchronise `version.json`, les deux fallbacks de `js/init-inline.js` et le
snapshot de `js/main.js`. **Plus de recopie manuelle, plus de désync « scripts
périmés ».**

---

## 4. Vérifier

1. `git diff` — les quatre points sont cohérents
2. `cd tests && npm test`

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

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-08-17 | Création. Extrait de `CLAUDE.md` (sections « Avant chaque commit » et « Changelog »), désormais réduites à un pointeur. |
