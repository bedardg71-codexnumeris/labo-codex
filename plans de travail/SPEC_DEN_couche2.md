# SPEC — Dénotation (DEN), couche 2 « DEN-proper » (#318)

**Date** : 8 juin 2026
**Auteur** : Claude (Cowork) en réflexion avec Grégoire
**Destinataire** : Claude Code
**Statut** : ✅ cadrage close (mode + garde tranchés 8 juin). **AUCUN code avant validation du découpage par Grégoire.**
**Fondé sur** : `NOTE-COWORK-modele-DEN.md` (modèle à deux couches, acté 6 juin — Girouard-Gagné et al. 2024, CoP, Blum, Dyer, Talbert). Cette spec implémente **la couche 2** (badge/famille DEN). La couche 1 (« note différée ») est distincte → **#321**.
**Versionnage** : `minor` à la livraison (famille créable nouvelle).
**Précaution** : `fichier:ligne` datés du 8 juin 2026 — **revérifier au moment de coder**.

> **Place dans le séquençage** : DEN couche 2 est un **préalable au code de l'axe D** (`SPEC_D_exploration_pratiques.md`) — le diff/mapping de D doit décrire les réglages DEN. Indépendant de #320 (ordre mutuel libre).

---

## 1. Vision

Rendre la **Dénotation créable et certificative** : une pratique où la note finale n'est **pas calculée depuis des artefacts** mais **saisie par l'enseignant** (jugement), **gardée** par la confirmation que les **cibles d'apprentissage** sont atteintes, et **ancrée** par une suggestion statistique optionnelle.

**Non négociable (corpus, note DEN §1/§6)** :
- **Jamais « pas de chiffre »** : une note certificative est **toujours** produite (RREC : 60+ réussite / 59− échec). DEN abandonne la **fonction de tri**, garde la **certification**.
- **Garde-fou équité (Dyer)** : la note holistique est la plus exposée aux biais → **traces + critères explicites obligatoires** (cibles nommées, atteinte consignée). Pas de « note nue ».
- **L'algorithme propose, le jugement tranche** (Voisard) : la suggestion statistique **ancre**, elle ne décide pas.
- **Pluralisme** : DEN n'est ni promue ni reléguée ; **ne pas la vendre comme un bien universel** (certains étudiants déstabilisés par l'absence de repères — Girouard-Gagné).

---

## 2. Décisions actées (8 juin 2026)

| # | Décision | Source |
|---|---|---|
| DEN-A | **Mode « éliminée » d'abord** : jugement narratif → note certificative. Le mode « réduite » (réussi/échoué + différenciation) est **reporté** à un lot ultérieur (hors premier jet). | Grégoire 8 juin |
| DEN-B | **Garde « cibles atteintes » par cible** : l'enseignant confirme chaque cible/objectif comme atteinte. Trace fine = garde-fou Dyer natif. | Grégoire 8 juin |
| DEN-C | **Note finale saisie**, ancrée sur la **suggestion holistique** (mode/médiane/moyenne) déjà codée. | Note DEN Q2/Q3 |
| DEN-D | **Réutilisation, pas duplication** : suggestion holistique (`_calculerModeHolistique`) et cibles (`_calculerNiveauxParObjectif`) existantes ; le neuf = **chemin de note saisie + garde cibles**. | Note DEN §4, zéro-dette |
| DEN-E | **DEN non simulable** (jugement saisi) → pas de colonne note dans l'Exploration des pratiques (diagnostic) ; **diffable** (axe D). | Note DEN §4/Q5 |
| DEN-F | **Taxonomie** : badge UI « PAN » conservé, mais DEN = **PRÉN** académiquement — documenté (registre, skill §2 bis, guide PAN). | Note DEN Q1 bis |

---

## 3. Constat technique (vérifié 8 juin 2026)

| Élément | État | Conséquence |
|---|---|---|
| **Registre** | `denotation { code 'DEN', couleurVar '--den-violet', famille 'PAN' }` (`pratique-registre.js:73`) ; normalisation `pan-denotation → denotation` (`:42`). | Identité DEN **acquise** (couche 1). |
| **Reconnaissance assistant** | `deduireTypePratique` rend `{type:'denotation', variante:null, …}` **à l'édition** (`wizard-pratique-v2.js:2313`) ; carte de création **désactivée** (`disabled:true`, `:163`). | Brique neuve : **activer le parcours de création** (DEN-3). |
| **Suggestion holistique** | `_calculerModeHolistique(da, objectifs, configHolistique)` (`pratique-pan-standards.js:1509`) → mode/médiane/moyenne des notes par objectif ; s'appuie sur `_calculerNiveauxParObjectif` (`:1547`). | **Réutilisable** comme ancrage (DEN-1). Extraire en helper partagé (zéro-dette). |
| **Point d'insertion moteur** | `case 'jugement_global'` (`pratique-configurable.js:238`) = repli PAN `donneesEtudiant.actuel.PAN?.P || 0`. | **À remplacer** par le vrai calcul DEN. Patron : délégation SPE juste au-dessus (`_calculerPerformanceSpecifications`, `:235`). |
| **Objectifs/cibles** | Vivent dans `configuration.objectifs` (`construireConfigComplete`, `pratique-configurable.js:295`). | Réutilisés comme **cibles** de la garde DEN. |
| **Chemin de note saisie** | **Inexistant.** | Brique neuve centrale (stockage + lecture). |

---

## 4. Modèle de données

### 4.1 Config d'une pratique DEN (éliminée)

```js
{
  id, nom,
  configuration: {
    type: 'denotation',
    objectifs: [ { id, nom }, … ],          // les CIBLES (réutilise l'existant)
    modeDEN: 'eliminee',                      // premier lot ; 'reduite' plus tard
    suggestion: { methode: 'mode'|'mediane'|'moyenne' }  // ancrage statistique (optionnel)
  },
  calcul_note: { methode: 'jugement_global' } // marqueur DEN (existant, :238)
}
```

### 4.2 Stockage de la saisie (brique neuve)

Une **note finale saisie + confirmations de cibles**, par étudiant × pratique, **namespacée par trimestre** (`window.cle(...)`). Clé proposée : `jugementsDenotation`. Schéma :

```js
cle('jugementsDenotation') = {
  [pratiqueId]: {
    [da]: {
      ciblesAtteintes: { [objectifId]: true|false },  // garde PAR CIBLE (DEN-B)
      noteFinale: number,        // 0-100, saisie par l'enseignant (jugement)
      justification: string,     // narratif (mode éliminée) — encouragé, traçabilité Dyer
      date: 'YYYY-MM-DD'
    }
  }
}
```

> **À inscrire dans `docs/DATA-OWNERSHIP.md`** (Single Source of Truth) : propriétaire = module DEN ; écrite par l'UI de saisie (profil étudiant) ; lue par le moteur DEN (lecture seule côté calcul). Namespacée par trimestre. **Migration : aucune** (collection neuve, pas de donnée existante).

---

## 5. Moteur — le calcul DEN

### 5.1 Remplacement du repli (`pratique-configurable.js:238`)

```
case 'jugement_global':   // DEN couche 2
   P_pct = this._calculerPerformanceDenotation(da, donneesEtudiant);
   break;
```

`_calculerPerformanceDenotation(da)` (nouvelle méthode, **lecture seule**, patron `_calculerPerformanceSpecifications`) :

1. Lire la saisie `jugementsDenotation[pratiqueId][da]`.
2. **Pas de saisie** → `null` → **non calculable** : diagnostic par cellule (#128, étendre `_diagnostiquerNoteNonCalculable` avec un cas DEN « jugement non encore saisi »).
3. **Garde cibles (DEN-B)** : si **une** cible requise n'est pas confirmée atteinte → **non certifié** : note plafonnée à **59** (RREC échec), jamais ≥ 60. *(La garde ne fabrique pas la note ; elle conditionne la certification.)*
4. **Toutes cibles confirmées** → `P_pct = noteFinale` (la note saisie, ≥ 60 attendue).

> **RREC** : le calcul produit **toujours un chiffre** (59 ou la note saisie). Jamais d'absence de note.

### 5.2 Suggestion holistique — helper partagé (DEN-D)

Extraire la logique mode/médiane/moyenne de `_calculerModeHolistique` (`pratique-pan-standards.js:1509`) en **helper pur partagé** `suggererNoteHolistique(niveauxParObjectif, methode)`, appelé **et** par STD (inchangé fonctionnellement) **et** par l'UI de saisie DEN. Évite que DEN instancie un `PratiquePanStandards` entier juste pour une suggestion. La suggestion est **affichée à la saisie** (ancrage), **jamais** la valeur finale du calcul (§5.1 retourne la note saisie, pas la suggestion).

> Sentinelle de parité : la suggestion STD avant/après extraction est **strictement identique** (golden master).

---

## 6. UI de saisie (profil étudiant)

Quand la pratique active du groupe-cours est DEN, le profil étudiant offre un **panneau de jugement** :

- **Liste des cibles** (objectifs de la config) avec une case « atteinte » **par cible** (DEN-B). Trace explicite.
- **Suggestion holistique** affichée comme ancrage (« d'après les niveaux par cible : X »), avec la méthode configurée — **modifiable**, non imposée.
- **Champ note finale** (saisie) + **justification narrative** (mode éliminée — encouragée, traçabilité Dyer).
- **Garde visible** : tant qu'une cible n'est pas confirmée, l'interface signale que la note ne peut pas certifier (≥ 60) — sans empêcher la saisie d'un 59.
- `echapperHtml()` sur tout texte saisi ; `data-action` (zéro handler inline) ; écriture namespacée (§4.2).

---

## 7. Parcours de création (assistant)

- **Activer la carte DEN** (retirer `disabled:true`, `wizard-pratique-v2.js:163`) ; produire une classification `denotation` **avec variante** (plus `variante:null`).
- Questions de configuration DEN : (a) les **cibles** (objectifs — réutilise le sous-parcours objectifs existant) ; (b) la **méthode de suggestion** (mode/médiane/moyenne) ; (c) mode `eliminee` (le seul offert au premier lot).
- Garde-fou de framing (Dyer/Girouard-Gagné) : à la création, **ne pas présenter DEN comme un idéal** — une ligne sobre « famille exigeante, à accompagner pédagogiquement » (renvoi guide PAN).

---

## 8. Intégration et garde-fous transverses

- **Non simulable (DEN-E)** : dans l'Exploration des pratiques (axe D) et la simulation, DEN affiche le diagnostic « cette note est un jugement, pas un calcul » (pas de colonne note). Le **diff de config** DEN reste possible (axe D). Pas de note DEN dans le pack démo.
- **Taxonomie (DEN-F)** : badge « PAN » conservé ; documenter PRÉN ≠ PAN dans le registre (commentaire), skill §2 bis (✅ fait) et guide PAN (à venir).
- **Périmètre app vs pédagogie** : l'app modélise la composition de la note ; le virage de rétroaction relève du guide PAN, pas du code.
- **Champ jeune** : modèle **configurable et révisable**, pas figé.

---

## 9. Invariants et sécurité

1. **Calcul DEN lecture seule** : `_calculerPerformanceDenotation` **lit** `jugementsDenotation`, ne l'écrit jamais (l'écriture est le geste de saisie du profil, §6).
2. **RREC** : toujours un chiffre (59 ou note saisie) ; jamais « pas de note ».
3. **SSOT / namespacing** : `jugementsDenotation` namespacée (`window.cle`), propriétaire unique documenté (`DATA-OWNERSHIP.md`) ; aucune autre source de la note DEN.
4. **Parité STD** : extraction du helper de suggestion sans changer la note STD (golden master).
5. **Sécurité** : `echapperHtml()` sur justification/cibles ; `data-action` ; **≥ 1 test par lot** (Défense I).

---

## 10. Hors périmètre (premier jet)

- **Mode « réduite »** (réussi/échoué sur épreuves + différenciation) — lot ultérieur (DEN-A).
- **Couche 1 « note différée »** — chantier distinct **#321**.
- **Garde cibles globale** — non retenue (DEN-B = par cible).
- **Simulation DEN** sur données démo (jugement saisi → jamais simulé).

---

## 11. Lots proposés (à valider avant exécution)

| Lot | Contenu | Nature | Test ajouté |
|---|---|---|---|
| **DEN-0** | Modèle : config `type:'denotation'`/`modeDEN:'eliminee'` ; collection `jugementsDenotation` namespacée ; entrée `DATA-OWNERSHIP.md`. | données | Vitest : schéma config valide ; clé namespacée |
| **DEN-1** | Moteur : helper partagé `suggererNoteHolistique` (extraction, parité STD) + `_calculerPerformanceDenotation` (garde cibles par cible + note saisie) branché sur `case 'jugement_global'`. | moteur | Vitest : golden master STD ; garde (cible manquante→59, toutes→note) ; pas de saisie→null |
| **DEN-2** | UI de saisie (profil étudiant) : cibles à cocher + suggestion ancrage + note + justification ; garde visible ; écriture namespacée. | UI | Playwright : saisie persistée, garde affichée, non-destructif ailleurs |
| **DEN-3** | Parcours de création (assistant) : carte DEN activée, classification avec variante, config cibles + méthode suggestion. | UI | rendu DOM ; pratique DEN créée calculable |
| **DEN-4** | Diagnostic non-simulable (#128) côté Exploration/simulation ; framing Dyer ; doc registre/skill §8 (DEN implémenté). | intégration + doc | Vitest : diagnostic DEN ; MàJ skill |
| **DEN-5** | Validation terrain (Mac + iPad, sombre + clair) + release `minor` + changelog (1 entrée). | livraison | suite complète verte |

**Séquencement** : DEN-0 → DEN-1 → DEN-2 → DEN-3 → DEN-4 → DEN-5.

---

## 12. Tests (continuité Défense I)

1. **Garde cibles** (Vitest) : toutes cibles confirmées → note saisie ≥ 60 retournée ; une manquante → plafonné 59 ; jamais d'absence de note (RREC).
2. **Note saisie** : lue correctement ; pas de saisie → `null` → diagnostic DEN précis (#128).
3. **Suggestion** : helper partagé, golden master STD inchangé.
4. **Non-destructif / namespacing** : écriture de saisie namespacée par trimestre ; aucune autre clé touchée.
5. **Non simulable** : pas de colonne note DEN dans l'Exploration ; diagnostic.
6. `cd tests && npm test` + ≥ 1 test/lot ; Mac + iPad, sombre + clair ; validation terrain Grégoire avant push.

---

## 13. Précautions d'exécution

Rituel de début de session ; charger `SKILL_pratiques_notation.md` (moteur, familles, §2 bis sur DEN) et `SKILL_Securite_donnees.md` (écriture de données utilisateur, namespacing) ; `SKILL_integrite_globaux.md` si écriture dans des collections partagées ; design system (2 modes) ; `echapperHtml()` + `data-action`. **Mettre à jour `SKILL_pratiques_notation.md` §8 (DEN implémenté) et son HISTORIQUE au lot DEN-4**, avec le code. Lire `NOTE-COWORK-modele-DEN.md` pour les garde-fous pédagogiques (RREC, Dyer, pluralisme, framing). Revérifier les `fichier:ligne` (datés du 8 juin 2026).
