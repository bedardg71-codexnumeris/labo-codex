# Audit #296 — items seed `auteur: 'Labo Codex'`

**Date** : 19 juin 2026 (Claude Code, cloud). Audit **lecture seule** — aucun code modifié.
**But** : préparer la migration `'Labo Codex'` → `'Demo Labo Codex'` (#296) en
**catégorisant** d'abord chaque item (vraie démo / canevas générique / résidu),
car le filtre `estItemDemo` masque en mode normal **tout** item ainsi tagué.

---

## 1. Le filtre (état actuel)

`js/bibliotheque-ui.js:38` :

```javascript
BibliothequeUI.estItemDemo = function (item) {
    if (!item) return false;
    if (item.isDemo === true) return true;
    return item.auteur === 'Labo Codex' || item.auteur === 'Demo Labo Codex';
};
```

→ Aujourd'hui, **les 37 items** tagués `'Labo Codex'` sont traités comme « démo »
et **masqués en mode normal**.

## 2. Correction de la prémisse du backlog

Le backlog #296 supposait (hypothèse Grégoire) que « beaucoup de ce matériel est en
réalité des **résidus de tests** ». **L'audit infirme largement cette hypothèse** :
sur 37 items, **1 seul** est un candidat « résidu » ; les 33 autres (hors infra démo)
sont du **contenu de bibliothèque fonctionnel** (défauts, gabarits, exemples par
discipline, modes d'évaluation). Migrer en bloc vers `'Demo Labo Codex'` puis
finaliser le filtre **masquerait à tort ce contenu**.

## 3. Inventaire catégorisé

`estItemDemo` (bibliotheque-ui.js:38) : `isDemo===true` **OU** `auteur ∈ {'Labo Codex','Demo Labo Codex'}`.

| file:line | id / nom | type | référencé par la démo ? | catégorie | note |
|---|---|---|:--:|:--:|---|
| demo-namespace.js:185 | `demo` | trimestre | OUI (seed démo) | **A** | déjà `isDemo:true` |
| demo-namespace.js:195 | `ENS_DEMO` | enseignant | OUI | **A** | déjà `isDemo:true` |
| demo-namespace.js:209 | `HOR_DEMO` | horaire | OUI | **A** | déjà `isDemo:true` |
| demo-namespace.js:227 | `GC_DEMO` | groupe-cours | OUI | **A** | déjà `isDemo:true` |
| echelles.js:504 | `ECHELLE_BRUNO_CHIMIE` | échelle | NON | **B-ex** | échelle d'exemple (prof fictif), liée à une pratique prédéfinie |
| echelles.js:528 | `ECHELLE_XAVIER_INFO` | échelle | NON | **B-ex** | idem |
| echelles.js:552 | `ECHELLE_ISABELLE_BIO` | échelle | NON | **B-ex** | idem |
| echelles.js:577 | `ECHELLE_HELENE_PHILO` | échelle | NON | **B-ex** | idem |
| echelles.js:601 | `ECHELLE_MARIEHELENE_LITT` | échelle | NON | **B-ex** | idem |
| echelles.js:625 | `ECHELLE_ETIENNE_ADMIN` | échelle | NON | **B-ex** | idem |
| echelles.js:649 | `ECHELLE_OLIVIER_GEO` | échelle | NON | **B-ex** | idem |
| echelles.js:673 | `ECHELLE_JORDAN_PHILO` | échelle | NON | **B-ex** | idem |
| gabarits-utils.js:289 | `GABARIT_ECHELLE_IDME` | gabarit échelle | NON | **B-def** | défaut générique de bibliothèque |
| gabarits-utils.js:306 | `GABARIT_ECHELLE_STD_MASTERY` | gabarit échelle | NON | **B-def** | défaut générique |
| gabarits-utils.js:328 | `GABARIT_GRILLE_ANALYTIQUE` | gabarit grille | NON | **B-def** | défaut générique |
| gabarits-utils.js:345 | `GABARIT_GRILLE_CHECKLIST_SPE` | gabarit grille | NON | **B-def** | défaut SPE |
| gabarits-utils.js:362 | `GABARIT_GRILLE_STD_OBJECTIFS` | gabarit grille | NON | **B-def** | défaut générique |
| gabarits-utils.js:396 | `GABARIT_CART_ANALYTIQUE` | gabarit cartouche | NON | **B-def** | défaut générique |
| gabarits-utils.js:412 | `GABARIT_CART_SPE_REVISION` | gabarit cartouche | NON | **B-def** | défaut SPE |
| spe-specifications.js:91 | `GRILLE_SPE_GABARIT_PRISE_POSITION` | grille SPE | NON | **B-def** | gabarit cadre SPE |
| spe-specifications.js:115 | `PROD_SPE_GABARIT_PRISE_POSITION` | production SPE | NON | **B-def** | gabarit cadre SPE |
| spe-specifications.js:135 | `GRILLE_SPE_GABARIT_PORTFOLIO` | grille SPE | NON | **B-def** | gabarit cadre SPE |
| spe-specifications.js:155 | `GRILLE_SPE_GABARIT_ORAL` | grille SPE | NON | **B-def** | gabarit cadre SPE |
| objectifs.js:877 | `objectifs-michel-calcul-diff` | objectif | NON | **C** | référencé seulement en commentaire (portfolio.js) → candidat résidu |
| pratiques-gestion.js:2343 | `comptage` | mode d'évaluation | NON | **B-sys** | mode système fondamental |
| pratiques-gestion.js:2348 | `moyenne-ponderee` | mode d'évaluation | NON | **B-sys** | mode système fondamental |
| pratiques-gestion.js:2353 | `seuils-critiques` | mode d'évaluation | NON | **B-sys** | mode système fondamental |
| pratiques-gestion.js:2358 | `holistique` | mode d'évaluation | NON | **B-sys** | mode système fondamental |
| pratiques-predefines.js:23 | `pan-standards-bruno` | pratique prédéfinie | NON | **B-ex** | exemple nommé, offert en bibliothèque |
| pratiques-predefines.js:158 | `sommative-traditionnelle-mhl` | pratique prédéfinie | NON | **B-ex** | exemple nommé |
| pratiques-predefines.js:264 | `pan-specifications-fah` | pratique prédéfinie | NON | **B-ex** | exemple nommé |
| pratiques-predefines.js:360 | `pan-maitrise-json` | pratique prédéfinie | NON | **B-ex** | exemple nommé (réf. pratique-registre.js) |
| pratiques-predefines.js:475 | `pan-objectifs-ponderes-michel` | pratique prédéfinie | NON | **B-ex** | exemple nommé |
| pratiques-predefines.js:594 | `sommative-remplacement-jordan` | pratique prédéfinie | NON | **B-ex** | exemple nommé |
| pratiques-predefines.js:702 | `pan-jugement-global-isabelle` | pratique prédéfinie | NON | **B-ex** | exemple nommé |

## 4. Sous-catégories proposées (à trancher par Grégoire)

- **A — infra démo (4)** : déjà `isDemo:true`. Re-taguer en `'Demo Labo Codex'` =
  cosmétique (le filtre les attrape déjà par `isDemo`). **Sûr.**
- **B-ex — exemples par discipline (15)** : 8 échelles + 7 pratiques prédéfinies
  (profs fictifs). Vitrine pédagogique. **Démo-seulement** (→ `'Demo Labo Codex'`)
  ou **visibles pour tous** (→ auteur neutre) ou **supprimer** ?
- **B-def — gabarits/défauts génériques (11)** : 7 gabarits + 4 specs SPE. Ce sont
  les **modèles de départ** réels. Probablement **visibles pour tous** (auteur neutre)
  — à confirmer.
- **B-sys — modes d'évaluation (4)** : `comptage`, `moyenne-ponderee`,
  `seuils-critiques`, `holistique`. **VÉRIFIÉ** : ce sont des **descripteurs**
  (`MODES_PAR_OBJECTIFS`, nom/auteur/description) affichés dans le wizard, **PAS des
  items de bibliothèque** filtrés par `estItemDemo` → leur tag `'Labo Codex'` est
  **inoffensif** (ne masque rien). Nettoyage cosmétique possible (retirer le champ
  `auteur`, dénué de sens sur un descripteur de mode), sans urgence.
- **C — résidu (1)** : `objectifs-michel-calcul-diff`. Candidat **suppression**.

## 5. Décision requise (avant tout code)

Pour chaque sous-catégorie : **visible pour tous (auteur neutre)** / **démo-seulement
(`'Demo Labo Codex'`)** / **supprimer**. Ensuite seulement : finaliser `estItemDemo`
pour ne plus matcher `'Labo Codex'` (sinon régression : du contenu fonctionnel
disparaît du mode normal).

**Tant que la décision n'est pas prise, aucune migration n'est sûre.** Le seul geste
zéro-risque est de re-taguer les 4 items A (cosmétique).
