# Beta 95 - Changelog complet

**Version** : Beta 95.2
**Periode de developpement** : 24 decembre 2025 - 8 janvier 2026
**Auteur** : Gregoire Bedard (Labo Codex) avec Claude Code
**Statut** : En cours (stable pour usage quotidien)

---

## Vue d'ensemble

Beta 95 introduit l'**architecture multi-trimestres avec namespacing** et la **section Trimestre modulaire**. Cette version permet de gerer plusieurs trimestres simultanement avec des donnees completement isolees, et propose une nouvelle interface pour assembler des groupe-cours a partir d'entites independantes.

### Jalons principaux

| Date | Version | Theme principal | Statut |
|------|---------|-----------------|--------|
| **24-27 dec** | Beta 95.0 | Multi-trimestres + namespacing | Complet |
| **1-5 jan** | Beta 95.1 | Corrections testeurs (Olivier, Bruno) | Complet |
| **6-8 jan** | Beta 95.2 | Architecture modulaire Trimestre | Complet |

---

## Beta 95.0 : Multi-trimestres et namespacing (24-27 decembre 2025)

### Fonctionnalites principales

**1. Gestion multi-trimestres**
- Creation et archivage de trimestres (Automne, Hiver, Ete)
- Un seul trimestre actif a la fois
- Archivage automatique des trimestres termines (protection des donnees)

**2. Systeme de namespacing**
- Prefixage des cles de donnees par trimestre : `h2026_presences`, `a2025_evaluations`
- Fonction `cle('nomCle')` pour obtenir la cle namespacee
- Isolation complete des donnees entre trimestres

**3. Interface Trimestre**
- Nouvel onglet dans Reglages
- Formulaire de creation/modification de trimestre
- Bornes calendaires (debut, fin cours, fin trimestre, remise notes)
- Semaines speciales (planification, examens)
- Conges prevus et imprevus avec reprises

### Fichiers crees/modifies

| Fichier | Action | Description |
|---------|--------|-------------|
| `js/trimestres.js` | NOUVEAU | Gestion trimestres + namespacing |
| `js/trimestre-v2.js` | NOUVEAU | Interface section Trimestre |
| `index.html` | MODIFIE | Nouveaux accordeons Trimestre |

---

## Beta 95.1 : Corrections testeurs (1-5 janvier 2026)

### Corrections apportees

**Retours Olivier :**
- Periodes au lieu d'heures : Format horaire dynamique selon le nombre de periodes
- Finalisation Primo : L'interface se met a jour apres la configuration

**Retours Bruno :**
- Sauvegarde des grilles : Les nouvelles grilles s'ajoutent correctement a la bibliotheque
- Heures non piles : Entree d'heures comme 8h55 dans Primo
- Import/Export ameliore : Import selectif, protection des donnees

### Principe ajoute

> **Priorite absolue : Retours testeurs**
> Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.
> Les retours utilisateurs passent AVANT le backlog prevu.

---

## Beta 95.2 : Architecture modulaire Trimestre (6-8 janvier 2026)

### Vision architecturale

**Avant (monolithique) :**
```
Toggle "Cours" (tout-en-un)
├── Informations generales
├── Enseignant·e
├── Horaire
└── Pratique de notation
```

**Apres (modulaire) :**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Cours     │  │ Enseignant  │  │   Horaire   │  │  Pratique   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┴────────────────┴────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    GROUPE-COURS     │
                    │    (assemblage)     │
                    └─────────────────────┘
```

### Corrections 8 janvier

**1. Consolidation des modules**
- Fusion de `entites-ui.js` dans `trimestre-v2.js`
- Elimination des conflits de fonctions dupliquees
- Un seul module = stabilite accrue

**2. Correction du dropdown groupe-cours**
- Probleme : Le dropdown dans l'en-tete restait vide malgre un groupe-cours cree
- Cause : Incoherence de namespacing (`groupesCours` vs `h2026_groupesCours`)
- Solution : Utilisation coherente de `cle('groupesCours')` partout

**3. Harmonisation du design**
- Nouvelles classes CSS pour la section Trimestre
- `.bloc-section`, `.bloc-section--bleu`, `.bloc-section--vert`
- `.btn-reset-bloc`, `.formulaire-interne`
- Border-radius harmonise : 12px (conteneurs), 6px (petits elements)

**4. Mise a jour Design System**
- `DESIGN_SYSTEM.html` mis a jour vers v7
- Variables CSS de reference ajoutees
- Date et version actualisees

### Fichiers modifies

| Fichier | Modifications |
|---------|--------------|
| `js/trimestre-v2.js` | +400 lignes (fonctions consolidees) |
| `js/entites-ui.js` | Retire de index.html (obsolete) |
| `index.html` | Classes CSS harmonisees, message bienvenue |
| `styles.css` | +160 lignes (nouvelles classes) |
| `DESIGN_SYSTEM.html` | Mise a jour v7 |

---

## Structure des donnees

### Groupe-cours (assemblage)

```javascript
{
    id: "GC_" + timestamp,
    trimestreId: "h2026",
    coursId: "COURS_123456",       // Reference → Cours
    enseignantId: "ENS_789012",    // Reference → Enseignant
    horaireId: "HOR_345678",       // Reference → Horaire
    pratiqueId: "pratique_somm",   // Reference → Pratique
    groupe: "00001",               // Numero de groupe
    actif: true,
    dateCreation: "2026-01-06"
}
```

**Cle stockage** : `groupesCours` (non namespace - global)

### Enseignant (Profil Auteur)

```javascript
{
    id: "ENS_" + timestamp,
    prenom: "Marie",
    nom: "Tremblay",
    courriel: "marie.tremblay@cegep.qc.ca",
    institution: "Cegep de Drummondville",
    departement: "Lettres",
    discipline: "Francais"
}
```

**Cle stockage** : `enseignants` (global)
**Role** : Source unique pour metadonnees CC

---

## Decisions prises

1. **Modularisation du code reportee** : Les fichiers `js/entites/*.js` seront crees en Beta 96. La priorite est la stabilite pour H2026.

2. **Pratique de notation** : Reste dans "Construction de la note" - le dropdown dans Groupe-cours reference les pratiques existantes.

3. **Un seul enseignant par groupe-cours** : Cas standard, pas de multi-enseignants.

4. **Horaire fixe** : Une fois le groupe-cours cree, l'horaire ne change pas.

---

## Tests de validation

### Section Trimestre : Operationnelle

- [x] Creation de trimestre
- [x] Selection du trimestre actif
- [x] Accordeon Gestion des trimestres
- [x] Accordeon Cours
- [x] Accordeon Enseignant·e
- [x] Accordeon Groupe d'etudiants
- [x] Accordeon Horaire
- [x] Accordeon Groupe-cours
- [x] Dropdown groupe-cours dans l'en-tete

### Design System v7 : Harmonise

- [x] Border-radius 12px pour conteneurs
- [x] Border-radius 6px pour petits elements
- [x] Variables CSS de reference
- [x] Classes `.bloc-section` fonctionnelles

---

## Prochaines etapes

### Beta 95.x (janvier)

- [ ] Valider import/export Productions
- [ ] Valider import/export Grilles
- [ ] Valider import/export Echelles
- [ ] Valider import/export Cartouches
- [ ] Valider import/export Pratiques
- [ ] Connexion calendrier avec groupe-cours
- [ ] Saisie des presences avec groupe-cours actif

### Beta 96 (fevrier)

- [ ] Architecture modulaire styles.css
- [ ] Modularisation du code (`js/entites/*.js`)
- [ ] Corrections basees sur usage reel janvier

---

## Statistiques

| Metrique | Valeur |
|----------|--------|
| **Periode** | 24 dec 2025 - 8 jan 2026 |
| **Versions** | 95.0, 95.1, 95.2 |
| **Fichiers crees** | 2 (trimestres.js, trimestre-v2.js) |
| **Fichiers modifies** | 8+ |
| **Lignes ajoutees** | ~5,000 lignes |

---

## Fonctionnalites operationnelles (cumul)

- [x] Architecture hybride IndexedDB/localStorage
- [x] Systeme de pratiques modulaire (IPratique)
- [x] 3 pratiques : PAN-Maitrise, Sommative, PAN-Standards
- [x] Indices A-C-P avec historique
- [x] Snapshots longitudinaux
- [x] **Multi-trimestres avec namespacing** (Beta 95)
- [x] **Architecture modulaire Trimestre** (Beta 95.2)
- [x] Import/export avec Creative Commons
- [x] Primo Assistant (onboarding)
- [x] Groupe demo 9999

---

**Derniere mise a jour** : 8 janvier 2026
**Auteur** : Gregoire Bedard avec Claude Code
**Statut** : Stable pour usage quotidien
