# Convention de versionnage — Labo Codex

> Référence établie le 31 mai 2026 (session Cowork). Remplace le schéma ad hoc
> « beta XX.X ». Compagnon du script `scripts/release.mjs` et du plan
> `plans de travail/PLAN-passage-1.0-AQPC.md`.

---

## Le problème résolu

En neuf mois, l'identité de version a empilé plusieurs systèmes : numéros, puis « beta XX.X »,
puis un numéro de build daté. Deux ennuis en découlaient : on filait vers « beta 100 » (qui se
lit comme « jamais livré » et bloque tout futur « 1.0 »), et le numéro vivait dans **quatre
endroits** recopiés à la main, source de désync (mécanisme « scripts périmés », #285).

## L'idée centrale : trois axes indépendants

Une seule étiquette portait trois choses distinctes. On les sépare :

1. **Le numéro de version** — dit l'*ampleur du changement*. Format SemVer `MAJEUR.MINEUR.CORRECTIF`.
2. **Le canal / la maturité** — *gère les attentes*. Aujourd'hui « bêta publique » ; deviendra « stable ».
3. **Le build** — *traçabilité et anti-cache*. Horodatage `MMJJ-HHMM` (mois-jour-heure-minute, Toronto).

## Le numéro : versionnage sémantique (SemVer)

`MAJEUR.MINEUR.CORRECTIF`, de droite à gauche :

- **CORRECTIF** : correction de bug, rien de neuf à l'usage. `1.0.0 → 1.0.1`.
- **MINEUR** : nouveauté qui ne casse rien d'existant. `1.0.1 → 1.1.0` (le correctif retombe à 0).
- **MAJEUR** : rupture — l'utilisateur doit s'adapter, ou le **format des données** change.
  `1.1.0 → 2.0.0` (les deux autres retombent à 0). C'est le signal « j'ai touché aux données ».

Règle : on augmente le chiffre le plus à gauche qui s'applique, on remet à zéro ceux à sa droite.

Compléments utiles : un suffixe de pré-version (`1.0.0-beta`) se classe *avant* la version finale ;
ce qui suit un `+` est du build, ignoré pour le classement (`1.1.0+0615-1430`). Un majeur `0`
(`0.x`) signifie officiellement « tout peut changer, rien n'est stable ».

## Décisions actées

- **Lancement AQPC (3 juin 2026) = passage à `1.0.0`.** `1.0` ne gèle rien : le développement
  continue en 1.1, 1.2, 2.0. La seule contrainte de rétro-compatibilité reste la **préservation
  des données des testeurs** (déjà dans `CLAUDE.md`).
- **Libellé d'affichage = « Bêta publique 1.0.0 ».** « Bêta publique » nomme le canal (ouvert au
  public, liberté de casser conservée) et lève l'ambiguïté « bêta » + « 1.0.0 ». Graphie « bêta »
  **accentuée**. Ce libellé est un *texte d'affichage*, distinct du numéro.
- **Le numéro vit dans `version.json`**, clé `beta` (conservée pour ne pas toucher au loader ;
  elle porte désormais une valeur SemVer). Le mot « bêta » n'est PAS dans le numéro, il est codé
  dans l'affichage (`init-inline.js`, `accueil.js`, `rapport-bug.js`).
- **Automatisation légère, pas de Conventional Commits.** Le *jugement* (quel chiffre) reste
  humain ; seule la mécanique est automatisée. Dériver le numéro des messages de commit a été
  jugé disproportionné pour un projet solo.

## Les 4 points de vérité (synchronisés par le script)

1. `version.json` — clés `beta` (numéro) et `build`. **Source unique.**
2. `js/init-inline.js` — fallback `VERSION_MAJEURE` (numéro).
3. `js/init-inline.js` — fallback `BUILD_ID` (build).
4. `js/main.js` — snapshot `window._SCRIPT_BUILD_main` (build, pour la détection « scripts périmés »).

Le loader de `init-inline.js` lit `version.json` au boot (`data.beta`, `data.build`) ; les
fallbacks ne servent que hors-ligne. Ils doivent rester identiques à `version.json`.

## Usage quotidien : `scripts/release.mjs`

Tu déclares l'intention, le script calcule le numéro, horodate le build et écrit les 4 points de
façon **atomique** (si un ancrage manque, il n'écrit rien) :

```
node scripts/release.mjs patch        # 1.0.0 → 1.0.1  (correction)
node scripts/release.mjs minor        # 1.0.1 → 1.1.0  (nouveauté)
node scripts/release.mjs major        # 1.1.0 → 2.0.0  (rupture / données)
node scripts/release.mjs --set 1.0.0  # fixe une version précise (ex. le lancement)
node scripts/release.mjs --build-only # rafraîchit juste le build (commit doc/UI)
node scripts/release.mjs <…> --dry-run
```

Puis : `git diff` (4 points cohérents) → `cd tests && npm test` → commit.

## Évolution future

- Quand la confiance sera là, **retirer « bêta »** des libellés d'affichage (petit chantier
  distinct : `init-inline.js`, `accueil.js`, `rapport-bug.js`) — sans rien changer au schéma.
- Continuer en 1.1, 1.2, 2.0 selon les règles ci-dessus.
- Si un jour le projet grossit et se met à plusieurs mains, envisager *Conventional Commits*
  pour dériver le numéro automatiquement des commits.

## Pour le lancement du 3 juin

Tout est détaillé, étape par étape, dans `plans de travail/PLAN-passage-1.0-AQPC.md`
(script `--set 1.0.0`, libellés, changelog, réécriture `CLAUDE.md`, tests, vérif terrain, commit).
