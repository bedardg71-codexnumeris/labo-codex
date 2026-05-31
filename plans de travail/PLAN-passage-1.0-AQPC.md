# PLAN — Passage à « Bêta publique 1.0.0 » pour le lancement AQPC (3 juin 2026)

> **Pour Claude Code.** Plan ordonné, exécutable d'un bloc le 3 juin.
> Lecture seule jusqu'à l'étape 1. Respecter la procédure de `CLAUDE.md`
> (un fichier à la fois, valider après chaque, commit seulement après
> validation terrain).

---

## 0. Contexte & décisions actées

Grégoire abandonne le schéma « beta XX.X » (arrivé à 99.86) pour le **versionnage
sémantique** (SemVer `MAJEUR.MINEUR.CORRECTIF`). Le lancement public à l'AQPC est le
point de bascule : la version passe à **`1.0.0`**.

Décisions prises (ne pas re-débattre, exécuter) :

- **Libellé d'en-tête = « Bêta publique 1.0.0 ».** Le qualificatif « publique » nomme le canal
  (bêta ouverte au public, liberté de casser conservée) et lève l'ambiguïté du couple « bêta »
  + « 1.0.0 ». On retire aussi le suffixe « - Consolidation » (thème de Beta 99, caduc). Graphie
  **« bêta » avec accent** (français correct, décision 31 mai) ; l'app, encore en « Beta 99.x »,
  passe à « bêta » au lancement du 3 juin. Le numéro vient du script.
- **`1.0` ne gèle rien.** Le développement continue en 1.1, 1.2, 2.0. La seule contrainte
  reste la préservation des données des testeurs (déjà dans `CLAUDE.md`).
- **Le numéro s'automatise via `scripts/release.mjs`** (déjà écrit et testé). La clé `beta`
  de `version.json` porte désormais le numéro SemVer ; le loader n'est pas touché.

⚠️ **Geste délibéré de lancement.** Ne PAS exécuter ce plan avant le 3 juin. C'est l'acte
de lancement, pas un commit de routine.

---

## 1. Pré-requis (avant de toucher au code)

1. Exécuter le rituel `Skills pour Claude Code/SKILL_Debut_de_session.md` (audit git +
   tests + version, comparaison prémisse↔réel). Lecture seule.
2. Être sur `main`, working tree propre (`git status`).
3. Backup Codex frais confirmé par Grégoire (filet de sécurité).
4. Baseline verte : `cd tests && npm test` AVANT toute modification. Noter le compte (≈149 :
   125 Vitest + 24 Playwright au 31 mai).
5. Confirmer auprès de Grégoire que c'est bien le moment du lancement.

---

## 2. Étapes (ordre impératif, valider après chacune)

### Étape 1 — Numéro de version via le script

```
node scripts/release.mjs --set 1.0.0
```

Vérifier ensuite `git diff` : exactement 4 points modifiés, cohérents.

- `version.json` → `{"build":"MMJJ-HHMM","beta":"1.0.0"}` (build = heure de Toronto au moment du run).
- `js/init-inline.js` ligne ~103 → `let VERSION_MAJEURE = '1.0.0';`
- `js/init-inline.js` ligne ~104 → `let BUILD_ID = 'MMJJ-HHMM';`
- `js/main.js` ligne ~23 → `window._SCRIPT_BUILD_main = 'MMJJ-HHMM';`

Le script écrit de façon **atomique** (si un ancrage manque, il abandonne sans rien écrire).
Si erreur d'ancrage : ne pas patcher à la main, comprendre pourquoi le fichier a bougé.

### Étape 2 — Libellé « Bêta publique » (10 sites, 3 fichiers)

Adopter le libellé **« Bêta publique »** partout (décision 31 mai) : il nomme le canal et lève
l'ambiguïté « bêta » + « 1.0.0 ». Graphie « bêta » accentuée (« Bêta » en tête de libellé,
« BÊTA » en capitales). Le numéro courant s'affiche sur **6 surfaces** : en-tête,
Réglages→À propos, bulle d'aide À propos, panneau de notification orange, carte « Nouveautés »
de l'accueil, rapport de bug. Substitution sur les **10 sites vérifiés le 31 mai**, un fichier à
la fois, en validant après chacun.

`js/init-inline.js` (8 sites) :

```js
// l.201 (afficherBuildNumero, en-tête) — retire aussi « - Consolidation »
spanVersion.textContent = `Bêta publique ${VERSION_MAJEURE}`;

// l.287, 291, 308, 312, 318, 322 (Réglages→À propos + bulle d'aide)
spanX.textContent = 'Bêta publique ' + VERSION_MAJEURE;

// l.374 (panneau de notification orange — « BETA » est en MAJUSCULES littérales)
elBuild.textContent = `BÊTA PUBLIQUE ${beta} (BUILD ${build})`;
```

`js/accueil.js` (1 site) :

```js
// l.217 (carte « Nouveautés »)
... Bêta publique ${window.VERSION_MAJEURE || ''} (Build ${window.BUILD_ID || ''}) ...
```

`js/rapport-bug.js` (1 site) :

```js
// l.31
return 'Bêta publique ' + (window.VERSION_MAJEURE || '??');
```

Contrôle final : `grep -rniE "b[eê]ta " js/init-inline.js js/accueil.js js/rapport-bug.js` ne doit
montrer que des « Bêta publique »/« BÊTA PUBLIQUE » (aucun « Beta »/« bêta » **nu**, aucun reste
sans accent), et plus aucune « Consolidation ».

### Étape 3 — Entrée de changelog 1.0

Fichier `js/changelog-data.js`. Ajouter l'entrée **en tête** du tableau (voir **Annexe A**) et
mettre à jour le commentaire de convention (ligne ~4) pour mentionner le passage à SemVer.

⚠️ **Optique 99 → 1.0.** Dans la liste, « 1.0 » s'affichera au-dessus de « Beta 99 » et peut se
lire comme une régression. La parade : titrer l'entrée **« Lancement public »** pour signaler un
nouveau chapitre. Le **contenu des items est à valider/ajuster par Grégoire** avant le commit
(l'Annexe A est un brouillon).

### Étape 4 — Mise à jour documentaire (zéro-dette)

Réécrire la section **« Avant chaque commit »** de `CLAUDE.md` pour refléter SemVer + le script
(voir **Annexe B**). Retirer l'ancienne règle « demander le numéro de beta / ne jamais
renuméroter / éditer les 4 points à la main » : elle est remplacée, pas empilée.

Mettre aussi à jour la ligne **« État actuel »** de `CLAUDE.md` (`Version : Beta 99.64…` →
`Bêta publique 1.0.0`) et `SESSION.md` au prochain relais.

### Étape 5 — Tests

```
cd tests && npm test
```

Attendu : suite verte, même compte qu'à la baseline. Aucun test n'assume le format à deux
chiffres (vérifié le 31 mai — pas d'assertion sur `version.json`/`beta`).

**Obligatoire** (verrouille le nouveau schéma, conforme à la culture sentinelle du projet) :
ajouter `tests/unit/version-format.test.js` qui vérifie que `version.json.beta` matche
`^\d+\.\d+\.\d+$` et `build` matche `^\d{4}-\d{4}$`. Empêche un retour accidentel au format à
deux chiffres. Coût ~5 min.

### Étape 6 — Vérification terrain (avant tout commit)

En **navigation privée** (évite le cache), sur **Mac (Safari)** ET **iPad**, en modes **sombre
et clair**, contrôler que **toutes les surfaces** montrent « Bêta publique 1.0.0 » (avec
« (Build MMJJ-HHMM) » là où le build s'affiche) :

1. En-tête de l'app (`#version-entete` + `#build-numero`).
2. Réglages → À propos (`#apropos-version-beta` / `#apropos-version-build`).
3. Bulle d'aide À propos (`#aide-apropos-version-beta` / `#aide-apropos-version-build`).
4. Panneau de notification orange (`#bandeau-mise-a-jour-build`) — en MAJUSCULES : « BÊTA PUBLIQUE 1.0.0 (BUILD …) ».
5. Carte « Nouveautés » de l'accueil (`.accueil-utilitaire-desc`).
6. Rapport généré par le bouton « Signaler un bug ».

Vérifier aussi que « Bêta publique 1.0.0 » ne **déborde pas** l'en-tête ni la carte « Nouveautés »
sur iPad/iPhone (libellé plus long qu'avant). Risque faible, mais à cocher.

Si une surface montre l'ancien numéro : cache Safari → `Cmd+Option+R`. Si le bandeau « scripts
périmés » apparaît, c'est le mécanisme #285 — il se résout au reload (le snapshot a été
synchronisé par le script à l'étape 1).

### Étape 7 — Commit

Le numéro est **déjà** à 1.0.0 (le script l'a posé) — **NE PAS re-bumper**. Committer tel quel.

Message suggéré :

```
release: lancement public 1.0.0 (bêta publique) — AQPC

- Passage du schéma « beta 99.x » au versionnage sémantique (SemVer).
- Libellé « Bêta publique » (10 sites, 3 fichiers), retrait du suffixe « Consolidation ».
- Changelog : entrée de première version publique.
- CLAUDE.md : procédure de version réécrite autour de scripts/release.mjs.
```

Pousser **seulement** après validation terrain par Grégoire.

---

## 3. Points de vigilance

- **Zones protégées** non touchées : `js/config.js`, `js/navigation.js`, `noms_stables.json`.
- **Mécanisme « scripts périmés »** : géré par le script (snapshot `main.js` synchronisé). Ne
  pas désynchroniser à la main.
- **« Bêta publique » est un libellé d'affichage**, pas le numéro. Le numéro vit dans
  `version.json` (clé `beta`) + les fallbacks. Le jour où Grégoire voudra retirer le mot
  « Beta », c'est un chantier distinct portant sur **10 sites dans 3 fichiers** (vérifiés le
  31 mai) : `init-inline.js` 201/287/291/308/312/318/322/**374** + `accueil.js` **217** +
  `rapport-bug.js` 31. Le site 374 (panneau de notification) est en MAJUSCULES. Hors de ce plan.

---

## Annexe A — Entrée de changelog (BROUILLON à valider)

Approche retenue par Grégoire : **orientation fonctionnalités** (capacités d'ensemble pour un
public neuf), dans le registre télégraphique du changelog (cf. Beta 95-97), PAS la prose du
blogue. À insérer en tête du tableau de `js/changelog-data.js` :

```js
{
    version: '1.0',
    couleur: 'vert',
    titre: 'Première version publique',
    items: [
        'Planification : carte mentale d’objectifs, alignement pédagogique et organisateur de leçon.',
        'Évaluation : grilles de critères, échelles de performance et grilles descriptives, calcul automatique.',
        'Annotation des copies au stylet, avec rétroactions visuelles et cartouches de commentaires.',
        'Suivi du groupe : présences et remises semaine après semaine, signaux précoces avant la note.',
        'Développement des habiletés : trajectoires A‑C‑P, dépistage SOLO et interventions RàI.',
        'Pratique de notation à ta main : sommative, par standards ou par spécifications, configurée pas à pas par un assistant.',
        'Partage entre collègues sous licence Creative Commons — 100 % hors ligne, données locales, sans compte.',
        'Version bêta publique, en évolution : un pli ? Le bouton « Signaler un bug » va droit au développeur.'
    ]
}
```

> **Typographie (Claude Code).** Respecter la convention du fichier : espace **insécable** avant
> les deux-points et le point-virgule, guillemets « », et les échappements `\uXXXX` si le fichier
> encode déjà ainsi (les chaînes ci-dessus sont en clair pour la lecture).
>
> **Contenu (à valider par Grégoire avant commit).** 8 items couvrant la *largeur* de l'app, un
> par domaine. Le dernier pose l'attente « bêta publique » + la boucle de feedback. Domaines non
> retenus faute de place : module Travaux, Rythme de travail, anonymisation recherche — à
> permuter si Grégoire le souhaite. Champ `version` : `'1.0'` (signale le nouveau chapitre) ou
> `'Bêta publique 1.0'` (cohérent avec l'en-tête, mais accentue l'optique 99→1.0 dans la liste).

---

## Annexe B — Réécriture de la section « Avant chaque commit » de CLAUDE.md

Remplacer la section actuelle par :

```markdown
## Avant chaque commit

1. **Décider l'intention de version** (ton jugement) : correction de bug → `patch`,
   nouveauté sans rupture → `minor`, rupture ou changement de format de données → `major`.
   **Confirmer avec Grégoire avant un `major`** (acte visible publiquement) ; `patch`/`minor`
   relèvent du jugement courant.
2. **Lancer le script de release** (source unique, écriture atomique des 4 points de vérité) :
   ```
   node scripts/release.mjs patch|minor|major
   # ou : node scripts/release.mjs --set X.Y.Z      (fixer une version précise)
   # ou : node scripts/release.mjs --build-only      (commit doc/UI sans changer le numéro)
   # ajouter --dry-run pour prévisualiser sans écrire
   ```
   Le script calcule le numéro SemVer, horodate le build (Toronto, `MMJJ-HHMM`) et synchronise
   `version.json`, les deux fallbacks de `js/init-inline.js` et le snapshot de `js/main.js`.
   Plus de recopie manuelle, plus de désync « scripts périmés ».
3. **Vérifier** `git diff` (les 4 points cohérents), puis `cd tests && npm test`.

> `version.json` reste la **source unique de vérité**. « Bêta publique » est un libellé
> d'affichage (`init-inline.js`, `rapport-bug.js`), pas le numéro.
```

---

## Annexe C — Rollback

Si un problème apparaît avant le push :

```
git restore version.json js/init-inline.js js/main.js js/accueil.js js/rapport-bug.js js/changelog-data.js CLAUDE.md
```

(ou `git checkout -- .` si rien d'autre n'est en cours). Aucune donnée utilisateur n'est touchée
par ce chantier — il ne porte que sur l'identité de version et la documentation.
