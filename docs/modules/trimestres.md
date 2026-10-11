# Module Trimestres

**Fichier principal** : `js/trimestres.js`
**Version** : Beta 95
**Derniere mise a jour** : 1er janvier 2026

> ⚠ **DOCUMENT PÉRIMÉ** (bandeau du 11 oct. 2026, #471 ; écarts mesurés par l'audit du 20 août, constat CT-25).
> Faux au moins sur : `evenementsPrevus` / `evenementsImprevus`, fusionnées en `journeesSansCours` (#374) ;
> `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`, `modalitesEvaluation` dites globales
> (namespacées, #358 et #328) ; le mode démo « groupe 9999 » (aujourd'hui le trimestre `demo` et `cleDemo()`) ;
> la session « H ou A » (l'été existe) ; le module, éclaté en plus de huit fichiers `trimestre*`.
> **Fait foi** : le code, `docs/architecture/ECOSYSTEME-DONNEES.md` et `docs/DATA-OWNERSHIP.md`.

---

## Objectif

Gerer plusieurs trimestres distincts avec donnees isolees (A2025, H2026, etc.).

---

## Architecture Multi-Trimestres

### Hierarchie pedagogique

```
TRIMESTRE (periode temporelle unique : H2026, A2025, etc.)
    |
COURS (un ou plusieurs : 601-101, 601-102, 601-103)
    |
GROUPE (un ou plusieurs par cours : 01, 02, 03, 9999)
    |
ETUDIANTS + DONNEES (evaluations, presences)
```

### Namespacing par trimestreId

**Principe** : Prefixer les cles localStorage/IndexedDB avec l'identifiant du trimestre.

```
AVANT (donnees partagees)          APRES (donnees isolees)
calendrierComplet                  h2026_calendrierComplet
cadreCalendrier                    h2026_cadreCalendrier
evenementsPrevus                   h2026_evenementsPrevus
```

---

## Structure du registre des trimestres

**Cle** : `trimestres` (globale, non namespacee)

```javascript
[
  {
    id: "h2026",              // Identifiant unique (session + annee en minuscules)
    nom: "Hiver 2026",        // Nom affiche
    session: "H",             // H (Hiver) ou A (Automne)
    annee: "2026",
    dateCreation: "2025-12-19",
    actif: true               // Un seul trimestre actif a la fois
  }
]
```

---

## Cles namespacees vs globales

### Cles NAMESPACEES par trimestre (prefixe `{trimestreId}_`)

| Cle originale | Exemple namespace | Module source |
|---------------|-------------------|---------------|
| `calendrierComplet` | `h2026_calendrierComplet` | trimestre.js |
| `cadreCalendrier` | `h2026_cadreCalendrier` | trimestre.js |
| `evenementsPrevus` | `h2026_evenementsPrevus` | trimestre.js |
| `evenementsImprevus` | `h2026_evenementsImprevus` | trimestre.js |
| `seancesCompletes` | `h2026_seancesCompletes` | horaire.js |
| `horaireHebdo` | `h2026_horaireHebdo` | horaire.js |

### Cles GLOBALES (partagees entre trimestres)

| Cle | Raison |
|-----|--------|
| `trimestres` | Registre des trimestres |
| `grillesTemplates` | Materiel pedagogique reutilisable |
| `echellesTemplates` | Materiel pedagogique reutilisable |
| `cartouches_*` | Materiel pedagogique reutilisable |
| `pratiquesConfigurables` | Configuration globale |
| `modalitesEvaluation` | Configuration globale |
| `modeApplication` | Etat application |

---

## Fonctions principales

```javascript
// Lecture du trimestre actif
obtenirTrimestreActif()     // Retourne l'objet trimestre actif
obtenirTrimestreId()        // Retourne l'ID (ex: "h2026")

// Namespacing des cles
cle(nomCle)                 // Helper : cle('calendrierComplet') -> 'h2026_calendrierComplet'

// Gestion des trimestres
creerTrimestre(session, annee)     // Cree un nouveau trimestre
changerTrimestreActif(id)          // Change le trimestre et recharge les donnees
supprimerTrimestre(id)             // Supprime un trimestre et ses donnees namespacees
```

---

## Utilisation du helper cle()

**TOUJOURS utiliser le helper pour les cles namespacees** :

```javascript
// BON
const calendrier = db.getSync(cle('calendrierComplet'), {});

// MAUVAIS
const calendrier = db.getSync('calendrierComplet', {});
```

---

## Mode Demo

Le groupe 9999 est reserve pour les donnees de demonstration :
- Trimestre fictif avec cours 601-101
- 10 etudiants fictifs
- Donnees isolees du mode normal
- Suppression propre via checkbox

---

## Precautions

- **Backup obligatoire** avant toute migration
- **Ordre critique** : Migrer donnees existantes AVANT creer nouveau trimestre
- **Retrocompatibilite** : Code doit fonctionner sans migration (fallback sur cles sans prefixe)
