# Spécifications pour l'export JSON A2025
**Destination** : Claude Code (anonymisation)  
**Date** : 22 décembre 2024  
**Contexte** : Préparation des données A2025 pour analyse pédagogique

---

## 1. CONTEXTE

Grégoire a développé un système de monitorage pédagogique basé sur :
- **5 critères SRPNF** (Structure, Rigueur, Plausibilité, Nuance, Français)
- **Échelle IDME** (Insuffisant, Développement, Maîtrisé, Étendu)
- **Taxonomie SOLO** (niveaux cognitifs des critères)
- **Indices A-C-P** (Assiduité, Complétion, Performance)

Ses analyses antérieures (H2024) ont révélé des **patterns d'apprentissage** et **blocages cognitifs** en analysant les données brutes. L'objectif est de reproduire ce type d'analyse pour A2025.

---

## 2. QUESTIONS DE VALIDATION

Avant l'anonymisation, vérifie que le JSON contient ces éléments :

### 2.1 Granularité des évaluations
**Question** : Les évaluations sont-elles stockées **critère par critère** ou seulement comme note globale ?

**Attendu** :
```json
"evaluations": [{
  "id_etudiant": "...",
  "id_artefact": "artefact_01",
  "date_evaluation": "2025-09-15",
  "criteres": {
    "structure": "M",
    "rigueur": "M",
    "plausibilite": "D",
    "nuance": "D",
    "francais": "M"
  }
}]
```

**Non souhaitable** :
```json
"evaluations": [{
  "id_artefact": "artefact_01",
  "note_globale": "D"
}]
```

### 2.2 Historique des reprises
**Question** : Si un élève reprend un artefact, conserve-t-on toutes les versions ou seulement la finale ?

**Attendu** : Toutes les versions avec dates
```json
"evaluations": [
  {
    "id_artefact": "artefact_01",
    "version": 1,
    "date_evaluation": "2025-09-14",
    "criteres": {...}
  },
  {
    "id_artefact": "artefact_01", 
    "version": 2,
    "date_evaluation": "2025-09-20",
    "criteres": {...}
  }
]
```

### 2.3 Données de présence
**Question** : Les présences sont-elles enregistrées **cours par cours** avec dates exactes, ou agrégées ?

**Attendu** :
```json
"presences": [
  {
    "id_etudiant": "...",
    "date": "2025-08-26",
    "statut": "present",
    "duree_cours": 3
  },
  {
    "id_etudiant": "...",
    "date": "2025-08-28",
    "statut": "absent",
    "duree_cours": 3,
    "justifie": false
  }
]
```

### 2.4 Dates de remise effectives
**Question** : Pour chaque artefact remis, connaît-on la **date effective de remise** (vs échéance) ?

**Attendu** :
```json
"remises": [
  {
    "id_artefact": "artefact_01",
    "date_echeance": "2025-09-10",
    "date_remise_effective": "2025-09-12",
    "jeton_utilise": "delai"
  }
]
```

---

## 3. STRUCTURE JSON RECOMMANDÉE

### 3.1 Section META (à conserver tel quel)
```json
{
  "meta": {
    "version_monitorage": "6.0.0-beta95",
    "version_format": "1.0",
    "date_export": "2024-12-22T...",
    "trimestre": {
      "id": "a2025",
      "nom": "Automne 2025",
      "session": "A",
      "annee": "2025"
    },
    "anonymisation": {
      "cle_hash": "sha256_des_4_premiers_caracteres",
      "methode": "Claude Code"
    }
  }
}
```

### 3.2 Section CONTEXTE PÉDAGOGIQUE (essentiel pour analyses)
```json
{
  "contexte": {
    "cours": {
      "code": "601-101-MQ",
      "titre": "Écriture et littérature",
      "approche": "ELLAC + PAN + SOLO"
    },
    "grille_evaluation": {
      "echelle": ["I", "D", "M", "E"],
      "seuil_reussite": "M",
      "criteres": [
        {
          "code": "structure",
          "nom": "Structure",
          "niveau_solo": "multistructural",
          "type": "fondamental",
          "description": "Organisation logique du texte"
        },
        {
          "code": "rigueur",
          "nom": "Rigueur",
          "niveau_solo": "multistructural",
          "type": "fondamental",
          "description": "Précision des citations et références"
        },
        {
          "code": "plausibilite",
          "nom": "Plausibilité",
          "niveau_solo": "relational",
          "type": "transitionnel",
          "description": "Cohérence de l'argumentation"
        },
        {
          "code": "nuance",
          "nom": "Nuance",
          "niveau_solo": "extended_abstract",
          "type": "complexe",
          "description": "Pensée critique et perspective"
        },
        {
          "code": "francais",
          "nom": "Français",
          "niveau_solo": "multistructural",
          "type": "fondamental",
          "description": "Qualité de la langue"
        }
      ]
    },
    "calendrier": {
      "date_debut": "2025-08-25",
      "date_fin": "2025-12-20",
      "nb_seances_prevues": 30
    },
    "artefacts": [
      {
        "id": "artefact_01",
        "titre": "Portrait de lecteur",
        "type": "portfolio",
        "date_echeance": "2025-09-10",
        "semaine": 3,
        "reprise_permise": true
      }
      // ... autres artefacts
    ]
  }
}
```

### 3.3 Section OBSERVATIONS (données brutes)
```json
{
  "observations": {
    "etudiants": [
      {
        "id_anonyme": "e001",
        "statut": "actif",
        "date_inscription": "2025-08-25",
        "profil": {
          "provenance": "secondaire_qc",
          "niveau_initial": "regulier",
          "services_adaptes": false
        }
      }
    ],
    
    "presences": [
      {
        "id_etudiant": "e001",
        "date": "2025-08-26",
        "statut": "present",
        "duree_cours": 3.0,
        "semaine": 1
      }
    ],
    
    "remises": [
      {
        "id_etudiant": "e001",
        "id_artefact": "artefact_01",
        "date_remise": "2025-09-12",
        "statut": "remis",
        "jeton_utilise": null
      }
    ],
    
    "evaluations": [
      {
        "id_etudiant": "e001",
        "id_artefact": "artefact_01",
        "version": 1,
        "date_evaluation": "2025-09-15",
        "criteres": {
          "structure": "M",
          "rigueur": "M",
          "plausibilite": "D",
          "nuance": "D",
          "francais": "M"
        },
        "commentaires": {
          "structure": "Bonne organisation générale...",
          "rigueur": "Citations bien intégrées...",
          "plausibilite": "Argumentation à développer...",
          "nuance": "Manque de profondeur critique...",
          "francais": "Syntaxe généralement correcte..."
        }
      }
    ],
    
    "jetons": [
      {
        "id_etudiant": "e001",
        "type": "delai",
        "date_attribution": "2025-09-11",
        "utilise_pour": "artefact_01",
        "motif": "Rendez-vous médical"
      }
    ]
  }
}
```

### 3.4 Section CALCULS (indices dérivés)
```json
{
  "calculs": {
    "description": "Indices calculés selon formules Monitorage",
    "formules": {
      "indice_A": "Moyenne pondérée heures présentes / heures offertes",
      "indice_C": "% artefacts remis avec évaluation >= M",
      "indice_P": "Composite : A + remises + progression",
      "indice_blocage": "0.35*Structure + 0.35*Français + 0.30*Rigueur"
    },
    
    "snapshots_hebdomadaires": [
      {
        "semaine": 3,
        "date": "2025-09-15",
        "indices_par_etudiant": [
          {
            "id_etudiant": "e001",
            "A": 95.0,
            "C": 100.0,
            "P": 88.0,
            "blocage": 72.0,
            "pattern": "progression_normale"
          }
        ]
      }
    ],
    
    "indices_finaux": [
      {
        "id_etudiant": "e001",
        "A_final": 92.0,
        "C_final": 100.0,
        "P_final": 88.0,
        "blocage_final": 75.0,
        "mention": "reussite",
        "recommandation_rti": "universel"
      }
    ],
    
    "performance_par_critere": [
      {
        "id_etudiant": "e001",
        "structure": {
          "nb_evaluations": 9,
          "nb_I": 0,
          "nb_D": 2,
          "nb_M": 6,
          "nb_E": 1,
          "taux_maitrise": 0.78,
          "progression": "stable"
        },
        "rigueur": { /* ... */ },
        "plausibilite": { /* ... */ },
        "nuance": { /* ... */ },
        "francais": { /* ... */ }
      }
    ]
  }
}
```

---

## 4. ÉLÉMENTS CRITIQUES POUR LES ANALYSES

### 4.1 Pour détecter les blocages cognitifs
**Nécessaire** :
- Évaluations **critère par critère** pour chaque artefact
- Classification SOLO de chaque critère (fondamental vs relational vs complexe)
- Historique temporel complet (pour voir l'évolution)

### 4.2 Pour identifier les patterns d'apprentissage
**Nécessaire** :
- Présences cours par cours (calcul de l'indice A)
- Remises avec dates effectives (détection des retards récurrents)
- Versions successives des artefacts (analyse de l'utilisation de la rétroaction)

### 4.3 Pour valider les formules de seuils
**Nécessaire** :
- Indices A-C-P calculés hebdomadairement (snapshots)
- Résultat final de chaque élève (réussite/échec)
- Permettra de valider si les seuils actuels sont prédictifs

---

## 5. CHECKLIST AVANT ANONYMISATION

- [ ] Chaque évaluation contient les 5 critères SRPNF individuellement
- [ ] Les reprises d'artefacts sont versionnées et datées
- [ ] Les présences incluent dates exactes de chaque cours
- [ ] Les remises ont la date effective (pas juste 0/1)
- [ ] Les jetons utilisés sont documentés
- [ ] Le contexte pédagogique inclut la classification SOLO des critères
- [ ] Les snapshots hebdomadaires A-C-P sont présents
- [ ] Les calculs de performance par critère sont inclus

---

## 6. INSTRUCTIONS POUR CLAUDE CODE

1. **Valider** que le JSON source contient tous les éléments listés ci-dessus
2. **Signaler** les éléments manquants avant l'anonymisation
3. **Anonymiser** selon la méthode spécifiée dans ARCHITECTURE_EXPORT_RECHERCHE.md
4. **Conserver** intégralement :
   - Section `meta`
   - Section `contexte` (classification SOLO, grille, calendrier)
   - Section `observations` (données brutes anonymisées)
   - Section `calculs` (indices dérivés)
5. **Produire** deux fichiers :
   - `monitorage_a2025_anonyme.json` (données anonymisées)
   - `table_correspondance_PRIVE.json` (clé + correspondances, NE PAS PARTAGER)

---

## 7. QUESTIONS À POSER À GRÉGOIRE

Si des éléments manquent dans le JSON actuel :

1. Les évaluations sont-elles stockées par critère individuel ou note globale ?
2. Les reprises d'artefacts conservent-elles toutes les versions ou juste la finale ?
3. Les dates de présence sont-elles enregistrées cours par cours ?
4. Les dates de remise effectives sont-elles conservées ?
5. La classification SOLO des critères est-elle explicite dans les données ?

---

## 8. FORMAT DE SORTIE ATTENDU

Une fois anonymisé, le fichier JSON devrait pouvoir être :
- Importé dans Numbers/Excel pour analyses descriptives
- Traité en Python pour calculs complexes
- Archivé pour analyses longitudinales futures
- Partagé (anonyme) pour publications/blog

**Taille estimée** : ~500 Ko à 2 Mo (30 élèves × 9 artefacts × 5 critères + snapshots)
