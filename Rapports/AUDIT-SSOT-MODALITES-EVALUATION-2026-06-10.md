# Audit SSOT — `modalitesEvaluation` (Tier 6.5)

> **Date** : 10 juin 2026 · **Référence** : `main` `f36b143f` (1.6.0, build 0609-2040)
> **Méthode** : grep exhaustif (`db.set`/`db.get` × `modalitesEvaluation`) + identification de la
> fonction porteuse de chaque écriture + lecture du contexte des écrivains suspects. **Lecture seule,
> aucune modification de code.**
> **Origine** : audit annuel 2026, violation SSOT n°1 CRITIQUE (`docs/DATA-OWNERSHIP.md` ligne 59,
> « Tier 6.5 reporté Sprint C été 2026 »).

---

## 1. Vue d'ensemble

`modalitesEvaluation` est la clé namespacée (`{trimestre}_modalitesEvaluation`) qui décrivait
historiquement « la pratique de notation active et sa configuration ». Elle est aujourd'hui :

- **écrite par 14 fichiers (44 sites)** — aucun propriétaire unique ;
- **lue par 39 fichiers (~125 sites)** — dont tout le chemin procédural du calcul de note
  (`indices.js`, `statistiques.js`, `portfolio.js`, `profil-etudiant-*`, `tableau-bord-apercu.js`) ;
- **devenue un fourre-tout** : en plus de la config de pratique, elle héberge une donnée d'horaire
  (`dureePeriodeMinutes`), les toggles du mode comparatif résiduel (`afficherSommatif`/`afficherAlternatif`)
  et des miroirs de config (`configPAN.jetons`).

**Tension architecturale centrale** : depuis #303 (Sessions A-B-C, closes le 5 juin) la configuration
canonique d'une pratique vit dans `pratiquesConfigurables` (bibliothèque namespacée) et le pointeur de
pratique active dans `groupesCours[id].pratiqueId` (SSOT actée). `modalitesEvaluation` n'est plus une
source : c'est un **miroir partiel non déclaré**, maintenu à la main par 14 écrivains, que le chemin
procédural continue de lire comme s'il était la vérité.

---

## 2. Cartographie des écrivains (44 sites, 14 fichiers)

### A. Domaine « config de pratique » — 36 sites, 7 fichiers

| Fichier | Sites | Fonctions | Rôle |
|---|---|---|---|
| `pratique-notation-v2.js` | 22 | `afficherConfigurationType` (×3), `chargerConfigParObjectifs`, `sauvegarderModeCalculObjectifs`, `ajouter/modifier/supprimerObjectif`, `sauvegarderParametresMode`, `regenererGrilleConversion` (×2), `modifierGrilleConversion`, `sauvegarderConfigSpecifications`, `importerProductionDepuisBibliothequeSpec`, `ajouter/modifier/supprimerTypeTravailSpec`, `ajouter/modifier/supprimerForfaitSpec`, `modifierTravailForfaitSpec`, `appliquerModeleSpecifications` | Éditeur de configuration : chaque micro-action fait son propre read-modify-write |
| `pratiques.js` | 8 | `migrerConfigurationPortfolio` (×2), `changerPratiqueNotation`, `afficherInfoPAN` ⚠️, `sauvegarderConfigurationPAN`, `sauvegarderPratiqueNotation`, `chargerModalites` ⚠️, `chargerConfigurationPratique` | Activation/sauvegarde de pratique. ⚠️ `afficherInfoPAN` et `chargerModalites` : des fonctions d'affichage/chargement qui ÉCRIVENT |
| `objectifs.js` | 2 | `activer/desactiverPratiqueMultiObjectifs` | Bascule multi-objectifs |
| `wizard-pratique-v2.js` | 1 | `sauvegarderPratique` | Sync du miroir si la pratique créée est active |
| `pratiques/pratique-manager.js` | 1 | `changerPratiqueActive` | Écrit `modalites.pratique = pratiqueId` (pointeur dupliqué de `groupesCours[].pratiqueId`) |
| `pratiques-bibliotheque.js` | 1 | `appliquerConfigurationPratique` | Application depuis la bibliothèque |
| `evaluation-chargement.js` | 1 | `_synchroniserJetonsPratique` | Copie la config jetons de la pratique vers `modalites.configPAN.jetons` (miroir de miroir) |

### B. Hors domaine — 2 sites, 2 fichiers (intrus à extraire)

| Fichier:ligne | Fonction | Constat |
|---|---|---|
| `horaire.js:298` | `definirDureePeriode` | Stocke `dureePeriodeMinutes` (donnée d'HORAIRE) dans la config d'évaluation |
| `preferences-v2.js:225` | `chargerPreferencesDepuisStorage` | Écrit `afficherSommatif`/`afficherAlternatif` — résidu du mode comparatif SOM/PAN dont le retrait est déjà acté (30 mai) ; un CHARGEUR de préférences qui écrit dans une autre clé |

### C. Migrations one-shot — 3 sites, 3 fichiers (à borner, pas à migrer)

| Fichier:ligne | Fonction | Constat |
|---|---|---|
| `main.js:287` | `recalculerIndicesSiDemande` (bloc migration `decouplerPR`) | Clé **non namespacée** — documenté comme volontaire (migration pré-24 mai) |
| `pratiques/migration-pratiques.js:74` | `migrerConfigurationPratiques` | Clé **non namespacée** — legacy assumé |
| `preferences.js:329` | `nettoyerLegacy` | Nettoyage one-shot |

### D. Import / démo — 3 sites, 2 fichiers

| Fichier | Fonctions | Rôle |
|---|---|---|
| `import-export.js:2210` | `executerImportConfigComplete` | Fusion à l'import (légitime, devra passer par l'API du futur propriétaire) |
| `demo-activation.js` (×2) | `fusionnerDemoVersGlobaux`, `desactiverModeDemo` | Bascule démo (cf. SKILL_integrite_globaux) |

---

## 3. Lecteurs (39 fichiers, ~125 sites) — vue par zone

| Zone | Fichiers principaux | Enjeu |
|---|---|---|
| Calcul procédural | `indices.js`, `statistiques.js`, `portfolio.js`, `evaluation*.js`, `profil-etudiant-calculs.js` | C'est ici que le miroir périmé produit de **faux résultats** (piège documenté 2 juin : `calculerPerformance` sur pratique non active lit cette clé globale) |
| Affichage | `profil-etudiant-sections-affichage.js` (6), `tableau-bord-apercu.js` (5), `graphiques-progression.js`, `liste-evaluations.js` | Dérivent libellés/sections du type de pratique |
| Pratiques | `pratique-notation-v2.js` (25), `pratiques.js` (19), `pratiques/*` | Read-modify-write internes |
| Périphérie | `horaire.js`, `saisie-presences.js`, `trimestres.js`, `rapport-bug.js`, `migrations.js`, `donnees-v2.js`, etc. | Lectures ponctuelles (durée de période, diagnostic, migration) |

---

## 4. Contenu réel de la clé (composite, agrégé par accrétion)

```
{
  pratique: 'sommative'|'pan'|...   // type — dupliqué de la pratique active
  pratiqueId: '...'                  // pointeur — dupliqué de groupesCours[].pratiqueId (SSOT actée)
  approcheEvaluation: ...            // copié de pratique.configuration
  dateConfiguration: ISO
  configPAN: { jetons: {...} }       // miroir de la config jetons de la pratique
  portfolio: {...}                   // config portfolio (decouplerPR...)
  objectifs / grille de conversion / specifications / forfaits   // sections éditeur v2
  dureePeriodeMinutes: 55            // INTRUS (horaire)
  afficherSommatif / afficherAlternatif   // INTRUS (mode comparatif à retirer)
}
```

---

## 5. Risques observés (faits, pas extrapolations)

1. **Read-modify-write concurrent sans propriétaire** : 44 écritures « lire l'objet entier, modifier
   un champ, réécrire l'objet entier ». Deux flux entrelacés s'écrasent silencieusement (même famille
   de risque que la race-condition auto-save documentée le 24 mai).
2. **Miroir non déclaré** : `pratiqueId`/`pratique`/`approcheEvaluation`/`configPAN.jetons` dupliquent
   des données dont la SSOT est ailleurs (`groupesCours`, `pratiquesConfigurables`). Toute
   désynchronisation fausse le calcul procédural (cas réel : diagnostic P à 0 %, 2 juin, #308).
3. **Clé non namespacée résiduelle** : 2 écritures + plusieurs lectures fallback sur
   `'modalitesEvaluation'` nu — bornées à des migrations, mais le fallback de lecture
   (`pratique-manager.js:76`, `wizard-pratique-v2.js:2867`, `preferences-v2.js:217`) maintient le
   doute sur quelle clé fait foi.
4. **Champs intrus** : la durée de période (horaire) et les toggles comparatifs n'ont rien à faire
   dans cette clé ; ils élargissent inutilement la surface d'écriture.

---

## 6. Découpage proposé (lots, du moins risqué au plus structurant)

> Propriétaire cible à confirmer : la cible historique du registre (`evaluation.js`) date d'avant le
> refactoring #303. La zone naturelle aujourd'hui est le domaine **pratiques** (`pratique-manager.js`
> ou un module dédié `js/pratiques/modalites-evaluation.js` sur le modèle de
> `denotation-jugements.js`). Décision de design à prendre avec Grégoire au cadrage du Lot 2.

| Lot | Contenu | Risque | Critère de fin |
|---|---|---|---|
| **Lot 0 — extraction des intrus** | `dureePeriodeMinutes` → clé propre au domaine horaire ; retrait des toggles `afficherSommatif`/`afficherAlternatif` (fusionner avec le chantier « retrait mode comparatif » déjà acté) | Faible | Plus aucune écriture hors domaine pratique ; sentinelle |
| **Lot 1 — API d'accès unique** | Module propriétaire avec `lire()` / `ecrire(section, valeur)` (écriture par section, pas par objet entier) ; sentinelle « aucun `db.set` direct hors propriétaire » (modèle : sentinelle notifications du 21 mai) | Moyen | 44 sites routés ; sentinelle verte |
| **Lot 2 — dégonfler le miroir** | Les champs dupliqués (`pratiqueId`, `pratique`, `approcheEvaluation`, `configPAN.jetons`) deviennent dérivés de la SSOT réelle (pratique active via `groupesCours[].pratiqueId` → config) au lieu d'être synchronisés à la main | Élevé (touche le calcul) | Golden master #303 vert ; plus aucune synchronisation manuelle |
| **Lot 3 — purge legacy** | Retrait des fallbacks non namespacés de lecture ; bornage explicite des 3 migrations one-shot | Faible | grep `'modalitesEvaluation'` nu = migrations uniquement |

**Garde-fous transversaux** : golden master du calcul (#303 Session C) avant/après chaque lot ;
préservation des données réelles de Grégoire (H2026, 2 groupes) ; aucune migration destructive
distribuée (bêta publique en cours depuis le 3 juin).

---

## 7. Sources et reproductibilité

- Relevés : `grep -rn "db\.set" js/ | grep modalitesEvaluation` (44 sites) ;
  `grep -rn "db\.get" js/ | grep modalitesEvaluation` (~125 sites) ; fonctions englobantes par awk.
- Registre : `docs/DATA-OWNERSHIP.md` lignes 59 et 175 (à mettre à jour : « 15 écrivains » → 14 au
  10 juin, et la cible `evaluation.js` est périmée — ce fichier n'écrit plus la clé).
- Contexte : `ETAT-PROJET.md` §5.3 ; mémoire projet `project-deux-systemes-calcul-pratiques`,
  `project-pratique-active-ssot`, `project-mode-comparatif-som-pan-a-retirer`.
