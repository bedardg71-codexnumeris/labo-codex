# Rapport `/ultrareview` — Lot 4a (Évaluation cœur)

**PR auditée** : [#6](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/6) — branche `review/lot-4a-evaluation`
**Date** : 1er mai 2026
**Lignes auditées** : ~11 060 sur 3 modules (`evaluation.js`, `liste-evaluations.js`, `evaluation-jetons.js`)
**Statut du run** : ⚠️ Phase **Déduplication crashée** (à 19:39:35). Les 11 findings vérifiés ci-dessous sont valides — récupérés depuis la web UI avant que la session soit archivée.

**Pipeline observé** :
- ✅ Configuration
- ✅ Rechercher — 37 candidats
- ✅ Vérifier — **11 confirmés · 26 réfutés** (taux de réfutation 70 %, signe d'audit rigoureux)
- ❌ Déduplication — 11 problèmes (crash)

**Observation clé** : tous les findings concernent **`js/evaluation-jetons.js`** (832 lignes). Aucun finding sur `evaluation.js` ni `liste-evaluations.js` — soit ces modules sont propres, soit la phase Rechercher s'est concentrée sur le système de jetons.

---

## 11 findings confirmés

### 🔴 Normal — bugs avec impact data (8)

| # | Fichier:ligne | Description |
|---|---|---|
| N1 | `js/evaluation-jetons.js:678` | `appliquerJetonRepriseCiblee` n'enforce pas le quota de jetons |
| N2 | `js/evaluation-jetons.js:317` | Reprise hérite des flags `jetonDelaiApplique` de l'originale → double-comptage |
| N3 | `js/evaluation-jetons.js:419` | `retirerJetonReprise` : branche « garder reprise » laisse `remplaceeParId` orphelin sur l'originale |
| N4 | `js/evaluation-jetons.js:692` | `appliquerJetonRepriseCiblee` bypasse `obtenirConfigJetons` et casse le format v2 |
| N5 | `js/evaluation-jetons.js:324` | `appliquerJetonReprise` ne nettoie pas `remplaceeParId` / `archivee` / `dateArchivage` de l'originale |
| N6 | `js/evaluation-jetons.js:549` | `obtenirStatutJetonsEtudiant` performs side-effect write on read |
| N7 | `js/evaluation-jetons.js:616` | Opérations jetons custom utilisent `db.setSync` directement, bypassant `sauvegarderDonneesSelonMode` (SSOT) |
| N8 | `js/evaluation-jetons.js:330` | `appliquerJetonReprise` : si `archiverOriginale=false`, `repriseDeId` pointe vers ID supprimé |

### 🟠 Élevé — défense en profondeur / cohérence (3)

| # | Fichier:ligne | Description |
|---|---|---|
| H1 | `js/evaluation-jetons.js:530` | `obtenirTousTypesJetons` lit une clé inexistante `config.nombreParEleve` |
| H2 | `js/evaluation-jetons.js:430` | Notification de succès affichée **avant** save dans `retirerJetonReprise` (l'utilisateur croit avoir sauvé même si l'écriture échoue) |
| H3 | `js/evaluation-jetons.js:602` | `attribuerJetonPersonnalise` écrit dans le mauvais store pour les jetons prédéfinis |

---

## Patterns récurrents identifiés

L'audit révèle 4 axes de fragilité dans `evaluation-jetons.js` :

1. **Symétrie cassée originale ↔ reprise** (N3, N5, N8) — cleanup incomplet ou inversé. Quand on archive/garde/retire, certains champs (`remplaceeParId`, `archivee`, `dateArchivage`, `repriseDeId`) ne sont pas mis à jour de façon symétrique sur les deux entités.

2. **Bypass de la config canonique** (N4, H1) — la logique ne consulte pas `obtenirConfigJetons` ou lit des clés inexistantes. Suggère que le module a évolué sans mettre à jour ses lecteurs.

3. **Validation manquante** (N1, H2) — quota non enforcé sur reprise ciblée, notification de succès avant confirmation d'écriture.

4. **Violation SSOT** (N6, N7, H3) — écritures dans le mauvais store, side effects dans des fonctions `obtenir*`, bypass de la couche `sauvegarderDonneesSelonMode`.

---

## Plan de remédiation suggéré

| Phase | Findings | Effort estimé | Stratégie |
|---|---|---|---|
| 1 — Symétrie | N3, N5, N8 | 1h30 | Centraliser un helper `transitionEvaluation(originale, reprise, mode)` qui gère les 3 modes (archiver / garder / retirer) avec setters atomiques |
| 2 — Validation | N1, H2 | 45min | `appliquerJetonRepriseCiblee` : ajouter le check du quota comme dans `appliquerJetonReprise`. `retirerJetonReprise` : await save avant notification |
| 3 — Config canonique | N4, H1 | 30min | Faire passer `appliquerJetonRepriseCiblee` par `obtenirConfigJetons`. Corriger le nom de clé dans `obtenirTousTypesJetons` |
| 4 — SSOT | N6, N7, H3 | 1h30 | Remplacer `db.setSync` par `sauvegarderDonneesSelonMode`. Supprimer le side effect dans `obtenirStatutJetonsEtudiant` (le calculer à la lecture, sauvegarder dans un autre flux) |

**Effort total** : ~4 heures pour Lot 4a.

---

## Notes méthodologiques

- **Pipeline crashé à `Déduplication`** : les 11 findings sont vérifiés (les 26 réfutés ont déjà été écartés). Pas de tri manuel à faire ici, contrairement au Lot 3.
- **Distribution sur un seul fichier** (`evaluation-jetons.js`) : suggère que ce module a une dette technique concentrée — typiquement un module qui a évolué par accumulation sans refactoring.
- **Les 26 réfutés** sont parfois des doublons des 11 confirmés (mêmes lignes, descriptions différentes) — la dédup aurait probablement fusionné certains. Acceptable en l'état.

---

## Dispositions — remesurées le 5 septembre 2026 (audit de la pratique de notation, flux G)

> Écrites par Claude Code sur mandat du second audit cadré
> (`Rapports/prompts-audit/PROMPT-AUDIT-pratique-de-notation-2026-09-05.md`), sur `93b744b4`
> (1.121.0). Depuis le 1er mai, `evaluation-jetons.js` a reçu #141 (10 juin), #328 L2-c (27 juin),
> #563 (29 août), #607 (30 août) et #612 (30 août) — `git log --since=2026-05-01 -- js/evaluation-jetons.js`.
> Dispositions : *périmé* (preuve), *refusé* (motif), *tenu → à inscrire* (**numéro à attribuer par
> Grégoire à l'arbitrage** ; `BACKLOG.md` non touché). ↻ **Numéros attribués le 5 septembre 2026 en soirée** (fiches au `BACKLOG.md`). `[exécuté]` = mesure du banc
> `tests/unit/audit-pratique-de-notation-2026-09-05.test.js` (série G).

| # | Constat du 1er mai | Disposition | Preuve, 5 septembre 2026 |
|---|---|---|---|
| N1 | `appliquerJetonRepriseCiblee` n'enforce pas le quota | **périmé** | la fonction est RETIRÉE (#563, 29 août 2026 — `evaluation-jetons.js:901-911`, décision de Grégoire « retirons la case ») ; aucun chemin n'applique plus ce jeton. |
| N2 | la reprise hérite de `jetonDelaiApplique` → double comptage | **tenu → inscrit #720** | `[exécuté]` G2 : originale avec un jeton de délai → `appliquerJetonReprise` (`...copieOriginale`, `:504-520`, ne remet pas le champ) → `compterJetonsUtilises(da, 'delai')` passe de **1 à 2** pour un seul délai accordé ; la reprise naît aussi avec la note et le niveau de l'originale, non verrouillée. |
| N3 | « garder la reprise » laisse `remplaceeParId` orphelin | **périmé — corrigé par #141** | `:642-648` : la branche « OK = entériner la reprise » est retirée ; `[exécuté]` G1 : retirer le jeton restaure l'originale (plus de `remplaceeParId`, plus d'`archivee`) et la note SOM repasse de 86,57 à 63,04 (l'originale à 50 compte de nouveau). |
| N4 | `appliquerJetonRepriseCiblee` bypasse `obtenirConfigJetons` | **périmé** | fonction retirée (#563). |
| N5 | `appliquerJetonReprise` ne nettoie pas `remplaceeParId` / `archivee` de l'originale copiée | **tenu, cas étroit → inscrit #724 (mineur)** | `[exécuté]` G3 : le cas général est bloqué par `maxParProduction` (`:482-494`) ; il reste l'originale « remplacée » SANS jeton — un doublon réconcilié par #360 (`reconcilieParDoublon`) : la reprise naît avec `remplaceeParId` hérité et n'entre dans aucun calcul. |
| N6 | `obtenirStatutJetonsEtudiant` écrit à la lecture | **tenu → inscrit #721** | `[exécuté]` G7 : un appel de lecture écrit la clé `jetonsEtudiants` (`initialiserJetonsEtudiant`, `:784-791`). |
| N7 | jetons personnalisés en `db.setSync` direct, hors SSOT | **tenu → inscrit #721, avec N6 et H3** | `[exécuté]` G7 : `db.setSync('jetonsEtudiants', …)` (`:789`, `:865`, `:895`) — et la clé est **NUE** : `[grep]` `grep -n jetonsEtudiants js/trimestres.js js/reserve.js js/db.js` → **0** (absente de `CLES_NAMESPACEES` et de `CLES_GLOBALES`) — partagée entre trimestres, invisible aux archives. |
| N8 | `archiverOriginale = false` → `repriseDeId` vers un id supprimé | **tenu → commenter et oublier** | `[exécuté]` G4 : l'originale est bien supprimée et `repriseDeId` la désigne encore ; mais l'aval est cohérent — `retirerJetonReprise` ne trouve pas d'originale et nettoie les marques (`:692-699`), la note reste celle de la reprise ; `impact-jetons.js:119` rend `noteOriginale: null`. Aucun effet sur la note du cours. |
| H1 | `obtenirTousTypesJetons` lit `config.nombreParEleve` inexistant | **périmé — corrigé par #328 L2-c, et boucle morte** | `:77` : la forme imbriquée porte désormais `nombreParEleve` ; mais `config.typesPersonnalises` n'est produit par AUCUN écrivain (`_normaliserConfigJetons`, `:33-83`) — `[exécuté]` G7 : trois types, jamais un personnalisé. |
| H2 | succès notifié AVANT l'écriture dans `retirerJetonReprise` | **tenu → inscrit #725 (mineur)** | `[exécuté]` G5 : écriture refusée → notifications **`succes` puis `erreur`** (`:624` / `:681` avant `:703`) ; #563 a ajouté l'erreur, pas déplacé le succès. |
| H3 | `attribuerJetonPersonnalise` écrit dans le mauvais magasin pour un jeton prédéfini | **tenu → inscrit #721, avec N6 et N7** | `[exécuté]` G7 : `attribuerJetonPersonnalise(da, 'delai')` écrit `jetonsEtudiants[da].delai = 1` pendant que le statut affiché (`compterJetonsUtilises`, lu des évaluations) reste à **0** — l'écriture est orpheline. |
| — | (#617, trouvé le 30 août) fichiers détachés AVANT la persistance | **tenu — déjà inscrit #617** | `[exécuté]` G6 : écriture refusée → le fichier de la reprise est à la corbeille, la reprise subsiste. |

**Bilan** : 4 périmés (N1, N3, N4, H1), 1 à commenter (N8), 6 tenus (N2, N5, N6, N7, H2, H3) — dont trois d'une même famille (N6, N7, H3 : la clé nue `jetonsEtudiants`). Le plan de remédiation du 1er mai est caduc dans sa phase 1 (symétrie : #141 l'a fermée) et sa phase 3 (config : #563 et #328 L2-c) ; restent sa phase 2 (H2 → #725) et sa phase 4 (SSOT → #721), inscrites. **Fermé le 5 septembre 2026.**
