# Consigne suivante – le filet GitHub redevient un filet (verdict rouge sur main depuis 9abf8602)

> Écrite le 20 septembre 2026, 9 h 04 (Toronto), par Cowork. **Aucune décision de Grégoire n'est due** : c'est un lot technique, tranché par Cowork selon la règle du 1er septembre. Rien ne change à l'écran, sauf si la mesure trouve un vrai défaut.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte `efa185c1` (1.151.1) ou plus récent. Aucune autre session n'écrit dans `js/` ni ne lance une suite.
> **Archive** : l'ancienne consigne (1.150.0) est déjà rangée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-ce-que-l-eleve-lit.md`. Chemins à commiter avec le lot : les deux fichiers.
> ⚠ **Arbre partagé** : les fichiers non commités d'un autre travail (`.claude/skills/ecosysteme-classe/SKILL.md`, `DEPLOY.md`, `js/interpretation-config.js` au jeton `20260910c`, `Rapports/suivi-cloudflare/`, deux fichiers de `plans de travail/`) restent hors de l'index.

---

## 1 · Pourquoi ce lot passe devant

Ton relais du 20 au matin le dit : le verdict GitHub est ROUGE sur `9abf8602` (run 35469302437) alors que le jeton local était vert sur le même SHA, et **les quatre derniers runs jugés sur `main` sont en échec**. Tant que GitHub est rouge pour une raison connue de personne, un rouge nouveau passe inaperçu : le filet ne retient plus rien. Aucun des lots suivants ne vaut plus que celui-là.

## 2 · Mesuré par Cowork (lecture seule) – à remesurer

- Le job `playwright` de `.github/workflows/tests.yml` tourne sur `ubuntu-latest`, en WebKit ; ton verdict local tourne en WebKit sur macOS. `tests/playwright.config.js` porte déjà `EXCLUS_WEBKIT_LINUX` (divergences Linux connues), `retries: 1`.
- Specs rouges nommées par ton relais : `audit-pratiques-notation-parcours-2026-09-16.spec.js:68` (Flux E · SPE, `noteConstructible`), `ce-que-l-eleve-lit-703-705.spec.js:40` (neuve en 1.150.0), `evaluation-882-choix-niveau-ecrit-en-base.spec.js:40` ; instable : `cours-actif-hors-bibliotheque-916.spec.js:19`.
- **Hypothèse de Cowork, NON mesurée** : le runner est en UTC, ton Mac en heure de Toronto. Deux des trois specs touchent des dates (la 703-705 compare la naissance d'un critère à `dateEvaluation`). Un écart de fuseau autour de minuit, ou une date locale lue comme UTC, suffirait. À réfuter ou confirmer par la sonde du §3.2, pas à croire.

## 3 · Ce qui est attendu

1. **Lister** les runs de `main` depuis `9abf8602` (`gh run list --branch main`), leur verdict, et pour chaque spec rouge l'erreur exacte (`gh run view <id> --log-failed`, traces de l'artefact `playwright-traces`). Dis si les trois mêmes specs rougissent sur chaque run, ou si l'ensemble change.
2. **Sonde de fuseau, sur ton Mac** : relance chaque spec rouge seule sous `TZ=UTC` (puis sous `TZ=Pacific/Kiritimati`, UTC+14, pour un écart de date franc). Si elle rougit ainsi et verdit sous Toronto, la cause est trouvée et reproductible sans Linux.
3. **Classer chaque rouge dans UNE des trois issues, dans cet ordre de préférence** :
   - (a) **défaut réel de l'application** que macOS masquait (ex. : une date écrite en UTC et relue en local) → corriger le code ; c'est le cas le plus précieux, dis-le en premier dans le rapport ;
   - (b) **spec dépendante du fuseau ou de l'horloge** sans défaut de l'app → rendre la spec indépendante (date fixe, fuseau posé explicitement), sans toucher au code de l'app ;
   - (c) **divergence WebKit Linux prouvée** → entrée dans `EXCLUS_WEBKIT_LINUX` avec, en commentaire, la cause MESURÉE et l'erreur citée. ⛔ Aucune exclusion sur une hypothèse.
4. **L'instable 916** : nomme sa cause si la mesure la donne en passant ; sinon, laisse-la visible. Ne l'exclus pas et ne monte pas son plafond.

## 4 · Arrêts

- Si une cause (a) touche une note, un niveau ou une date **déjà enregistrés cet automne** chez un·e utilisateur·rice : arrête-toi avant de coder, dis combien de données du pack démo portent le cas, et ce qu'une sonde chez Grégoire devrait lire.
- Si la cause ne se reproduit ni sous `TZ` ni par la lecture des traces : ne devine pas. Rends le diagnostic partiel, les erreurs citées, et arrête-toi. Cowork tranchera la suite.
- ⛔ Interdits pour « acheter du vert » : monter `retries`, relever un `timeout` sans cause mesurée, exclure une spec sans preuve, `--no-verify`.

## 5 · Preuve

- Pour chaque correctif (a) ou (b) : la spec **rouge avant** sous la condition qui la reproduit, **verte après**, dans les deux fuseaux ; une mutation qui rétablit l'ancien comportement rougit.
- Le run GitHub du commit poussé est **vert** (seule tolérance : l'instable 916, nommée). Le lot n'est clos qu'une fois ce run LU, pas lancé ; la règle 7 (on ne retient pas un push pour un run) tient, le rapport dit l'heure où le run a été lu.
- **Version** : si seuls des tests changent, aucune release (comme `9abf8602`). Si `js/` change, patch par `scripts/release.mjs`, et une phrase de « Nouvelles » **proposée**, pas posée, si l'utilisateur·rice voit une différence.
- Relais : un bloc daté en tête de `RELAIS.md`, SHA poussé, runs lus, issue retenue pour chaque spec.
