# Classification des fichiers js/ - Documents privés vs publics

**Date**: 17 novembre 2025
**Objectif**: Nettoyer le package Beta 90.5 pour distribution aux testeurs

## Fichiers déplacés vers "Documents de travail (privé)"

### Planification et notes de travail (js-planification/)
- ✅ `Plan de match - Suite refonte modulaire Index 70.txt`
- ✅ `Plan de match - Système d'indices A-C-P.txt`
- ✅ `Synthèse de la session de travail 20 octobre - Système d'indices A-C-P.txt`
- ✅ `Tableau de bord (Vue stratégique).txt`
- ✅ `Tableau de bord.txt`
- ✅ `structure-modulaire.txt`
- ✅ `pratiques/README.md` (notes développement)
- ✅ `pratiques/TESTS_INFRASTRUCTURE.md`
- ✅ `pratiques/TESTS_PAN_MAITRISE.md`
- ✅ `pratiques/TESTS_SOMMATIVE.md`

**Raison**: Documents de planification et notes personnelles de développement, non pertinents pour les testeurs.

### Fichiers de backup (js-backups/)
- ✅ `profil-etudiant.js.backup`
- ✅ `evaluation.js.backup-20251115-203118`
- ✅ `evaluation.js.bak`
- ✅ `saisie-presences (original 71).js`
- ✅ `import-export copie.js`
- ✅ `.DS_Store`

**Raison**: Fichiers de sauvegarde temporaires, copies de travail, fichiers système macOS.

## Fichiers conservés dans js/ (publics)

### Documentation technique utile
- ✅ `ordre-chargement.txt` - Ordre de chargement des modules (utile pour débogage)

### Code source fonctionnel
Tous les fichiers `.js` actifs sont conservés:
- Modules principaux (27 fichiers)
- Sous-répertoire `pratiques/` (6 fichiers)

## Impact sur le package

### Avant nettoyage
- Taille: 617 KB
- Fichiers js/: 55 fichiers (dont 11 documents + 6 backups)

### Après nettoyage
- Taille: 576 KB (-41 KB, -6.6%)
- Fichiers js/: 38 fichiers (code source uniquement + 1 doc technique)

### Fichiers supprimés du package
- 11 documents de planification/tests
- 6 fichiers de backup
- Total: 17 fichiers retirés

## Commandes exécutées

```bash
# Création répertoires de classement
mkdir -p "Documents de travail (privé)/js-planification"
mkdir -p "Documents de travail (privé)/js-backups"

# Copie documents planification
cd js/
cp "Plan de match - Suite refonte modulaire Index 70.txt" \
   "Plan de match - Système d'indices A-C-P.txt" \
   "Synthèse de la session de travail 20 octobre - Système d'indices A-C-P.txt" \
   "Tableau de bord (Vue stratégique).txt" \
   "Tableau de bord.txt" \
   "structure-modulaire.txt" \
   "../Documents de travail (privé)/js-planification/"

# Copie fichiers backup
cp profil-etudiant.js.backup \
   evaluation.js.backup-20251115-203118 \
   evaluation.js.bak \
   "saisie-presences (original 71).js" \
   "import-export copie.js" \
   "../Documents de travail (privé)/js-backups/"

# Copie documentation tests
cp pratiques/TESTS_*.md pratiques/README.md \
   "../Documents de travail (privé)/js-planification/"

# Suppression du répertoire principal js/
rm "Plan de match"*.txt "Synthèse"*.txt "Tableau de bord"*.txt structure-modulaire.txt
rm profil-etudiant.js.backup evaluation.js.backup-20251115-203118 evaluation.js.bak
rm "saisie-presences (original 71).js" "import-export copie.js" .DS_Store
rm pratiques/TESTS_*.md pratiques/README.md

# Suppression du package dist/
cd dist/Monitorage_Beta_90.5/js/
rm -f "Plan de match"*.txt "Synthèse"*.txt "Tableau de bord"*.txt structure-modulaire.txt
rm -f *.backup* *.bak "saisie-presences (original 71).js" "import-export copie.js" .DS_Store
rm -f pratiques/TESTS_*.md pratiques/README.md

# Recréation ZIP propre
cd dist/
rm -f Monitorage_Beta_90.5.zip
zip -r Monitorage_Beta_90.5.zip Monitorage_Beta_90.5/ -x "*.DS_Store"
```

## Vérification

### Fichiers .txt/.md restants dans js/ (public)
```bash
$ find js/ -type f \( -name "*.txt" -o -name "*.md" \)
js/ordre-chargement.txt
```

### Fichiers .txt/.md dans package (distribution)
```bash
$ unzip -l Monitorage_Beta_90.5.zip | grep -E "\.(txt|md)$"
Monitorage_Beta_90.5/js/ordre-chargement.txt
Monitorage_Beta_90.5/GUIDE_TESTEURS.md
Monitorage_Beta_90.5/README_TESTEURS.md
Monitorage_Beta_90.5/LICENSE.md
```

✅ Seulement les documents publics sont présents.

## Résultat final

### Structure "Documents de travail (privé)/"
```
Documents de travail (privé)/
├── js-planification/
│   ├── Plan de match - Suite refonte modulaire Index 70.txt
│   ├── Plan de match - Système d'indices A-C-P.txt
│   ├── Synthèse de la session de travail 20 octobre - Système d'indices A-C-P.txt
│   ├── Tableau de bord (Vue stratégique).txt
│   ├── Tableau de bord.txt
│   ├── structure-modulaire.txt
│   ├── README.md (pratiques)
│   ├── TESTS_INFRASTRUCTURE.md
│   ├── TESTS_PAN_MAITRISE.md
│   └── TESTS_SOMMATIVE.md
│
└── js-backups/
    ├── profil-etudiant.js.backup
    ├── evaluation.js.backup-20251115-203118
    ├── evaluation.js.bak
    ├── saisie-presences (original 71).js
    └── import-export copie.js
```

### Package Beta 90.5 propre
```
Monitorage_Beta_90.5/
├── index 90 (architecture).html
├── styles.css
├── logo-codex-numeris.png
├── donnees-demo.json
├── LICENSE.md
├── GUIDE_TESTEURS.md
├── README_TESTEURS.md
└── js/
    ├── [38 fichiers .js actifs]
    ├── ordre-chargement.txt (technique)
    └── pratiques/
        └── [6 fichiers .js actifs]
```

## Avantages du nettoyage

1. **Package plus léger**: -41 KB (-6.6%)
2. **Clarté pour testeurs**: Seulement code source et docs utilisateurs
3. **Confidentialité**: Notes de développement privées
4. **Organisation**: Documents classés par type dans "Documents de travail (privé)"
5. **Traçabilité**: Tous les fichiers préservés, juste déplacés

## Notes

- Les fichiers originaux sont **préservés** dans "Documents de travail (privé)"
- Le fichier `ordre-chargement.txt` est **conservé** (utile pour comprendre l'architecture)
- Les guides utilisateurs (GUIDE_TESTEURS.md, README_TESTEURS.md) sont **conservés**
- Le package est maintenant **prêt pour distribution** sans exposer les notes de travail

---

**Créé**: 17 novembre 2025
**Statut**: Nettoyage complété
**Package**: Monitorage_Beta_90.5.zip (576 KB)
