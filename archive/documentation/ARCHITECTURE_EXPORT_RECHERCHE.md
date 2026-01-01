# Architecture d'Export pour la Recherche

> **Version** : 1.0 (Beta 95)
> **Date** : 2025-12-21
> **Statut** : Spécification - Non implémenté

## Objectif

Définir un format d'export des données de Monitorage permettant :
1. L'analyse longitudinale des parcours étudiants
2. La recherche pédagogique sur les pratiques d'évaluation
3. L'archivage à long terme compatible avec l'évolution de l'application
4. L'anonymisation réversible contrôlée par l'enseignant

---

## Principes Directeurs

### 1. Séparation Observations / Calculs

Les données brutes (observations) sont strictement séparées des indices calculés :

| Type | Description | Exemples |
|------|-------------|----------|
| **Observations** | Données factuelles saisies | Présences, évaluations, productions remises |
| **Calculs** | Dérivées des observations | Indices A/C/P, moyennes, taux d'assiduité |

**Raison** : Permettre de recalculer les indices avec de nouvelles formules, ou d'analyser les données brutes indépendamment des algorithmes de Monitorage.

### 2. Anonymisation Réversible

L'anonymisation utilise une **clé secrète** détenue uniquement par l'enseignant :

```
DA réel : 1234567
Clé secrète : "MonSecret2025"
ID anonyme : hash(DA + clé) → "a7f3b2c1"
```

**Caractéristiques** :
- **Stable** : Le même DA produit toujours le même ID anonyme (avec la même clé)
- **Réversible** : L'enseignant peut retrouver l'étudiant via sa table de correspondance
- **Sécurisé** : Sans la clé, impossible de remonter au DA réel
- **Portable** : Les IDs anonymes restent cohérents entre exports

### 3. Auto-description du Format

Chaque export contient sa propre documentation :
- Schéma JSON des structures de données
- Version de Monitorage ayant produit l'export
- Dictionnaire des codes et énumérations
- Métadonnées du contexte pédagogique

---

## Structure de l'Export

```json
{
  "meta": {
    "version_monitorage": "6.0.0-beta95",
    "version_format": "1.0",
    "date_export": "2025-12-21T14:30:00Z",
    "cle_anonymisation_hash": "sha256_des_4_premiers_caractères",
    "trimestre": {
      "id": "a2025",
      "nom": "Automne 2025",
      "session": "A",
      "annee": "2025"
    }
  },

  "schema": {
    "etudiant": {
      "id_anonyme": "string - Identifiant stable anonymisé",
      "statut": "enum: actif|decrochage|abandon",
      "date_inscription": "date ISO"
    },
    "presence": {
      "id_etudiant": "ref → etudiant.id_anonyme",
      "date": "date ISO",
      "statut": "enum: present|absent|retard",
      "heures_manquees": "number",
      "justifie": "boolean",
      "facultatif": "boolean - Rattrapage individuel (RàI)"
    },
    "evaluation": {
      "id_etudiant": "ref → etudiant.id_anonyme",
      "id_production": "string",
      "valeur": "string - Code d'évaluation",
      "date_evaluation": "date ISO",
      "historique": "array - Modifications successives"
    },
    "production": {
      "id": "string",
      "titre": "string",
      "type": "enum: travail|examen|portfolio|artefact",
      "date_echeance": "date ISO ou null",
      "competences": "array - IDs des compétences visées"
    }
  },

  "contexte": {
    "programme": {
      "code": "420.B0",
      "nom": "Techniques de l'informatique"
    },
    "cours": {
      "id": "420-1T6-MT",
      "titre": "Introduction à la programmation",
      "competences": [
        {
          "id": "00Q1",
          "titre": "Analyser les besoins d'information",
          "ponderation": 0.25
        }
      ]
    },
    "grille_evaluation": {
      "echelle": ["A", "B", "C", "D", "E"],
      "seuil_reussite": "C",
      "descriptions": {
        "A": "Maîtrise exceptionnelle",
        "B": "Maîtrise assurée",
        "C": "Maîtrise acceptable",
        "D": "Maîtrise partielle",
        "E": "Maîtrise insuffisante"
      }
    },
    "calendrier": {
      "date_debut": "2025-08-25",
      "date_fin": "2025-12-20",
      "nb_seances_prevues": 30,
      "nb_seances_donnees": 28
    }
  },

  "observations": {
    "etudiants": [
      {
        "id_anonyme": "a7f3b2c1",
        "statut": "actif",
        "date_inscription": "2025-08-25"
      }
    ],

    "presences": [
      {
        "id_etudiant": "a7f3b2c1",
        "date": "2025-09-02",
        "statut": "present",
        "heures_manquees": 0,
        "justifie": null,
        "facultatif": false
      },
      {
        "id_etudiant": "a7f3b2c1",
        "date": "2025-09-04",
        "statut": "absent",
        "heures_manquees": 3,
        "justifie": true,
        "facultatif": false
      }
    ],

    "evaluations": [
      {
        "id_etudiant": "a7f3b2c1",
        "id_production": "prod_001",
        "valeur": "B",
        "date_evaluation": "2025-09-15",
        "historique": [
          {
            "valeur": "C",
            "date": "2025-09-14",
            "motif": "Première évaluation"
          },
          {
            "valeur": "B",
            "date": "2025-09-15",
            "motif": "Réévaluation après amélioration"
          }
        ]
      }
    ],

    "productions": [
      {
        "id": "prod_001",
        "titre": "TP1 - Variables et types",
        "type": "travail",
        "date_echeance": "2025-09-10",
        "competences": ["00Q1"],
        "semaine": 3
      }
    ],

    "snapshots": [
      {
        "semaine": 3,
        "date": "2025-09-15",
        "indices_par_etudiant": [
          {
            "id_etudiant": "a7f3b2c1",
            "A": 95,
            "C": 100,
            "P": 85
          }
        ]
      }
    ]
  },

  "calculs": {
    "description": "Ces valeurs sont dérivées des observations ci-dessus. Elles peuvent être recalculées.",
    "formules": {
      "indice_A": "Moyenne pondérée des heures présentes / heures offertes par séance",
      "indice_C": "Pourcentage de productions avec évaluation ≥ seuil_reussite",
      "indice_P": "Score composite engagement (assiduité + remises + progression)"
    },
    "indices_finaux": [
      {
        "id_etudiant": "a7f3b2c1",
        "A_final": 92,
        "C_final": 100,
        "P_final": 88,
        "mention": "Réussite"
      }
    ],
    "statistiques_groupe": {
      "nb_etudiants_actifs": 28,
      "nb_abandons": 2,
      "moyenne_A": 85,
      "moyenne_C": 78,
      "moyenne_P": 82,
      "taux_reussite": 0.89
    }
  }
}
```

---

## Anonymisation : Détails Techniques

### Génération de la Clé

```javascript
function genererCleAnonymisation() {
    // Clé aléatoire de 32 caractères
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let cle = '';
    for (let i = 0; i < 32; i++) {
        cle += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return cle;
}
```

### Anonymisation d'un DA

```javascript
async function anonymiserDA(da, cleSecrete) {
    const donnee = da + ':' + cleSecrete;
    const encoder = new TextEncoder();
    const data = encoder.encode(donnee);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Prendre les 8 premiers caractères du hash en hexadécimal
    return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Table de Correspondance (Non Exportée)

L'enseignant conserve localement une table de correspondance :

```json
{
  "cle_secrete": "MonSecret2025xyz...",
  "correspondances": {
    "a7f3b2c1": "1234567",
    "b8g4c3d2": "2345678"
  }
}
```

Cette table n'est **jamais** incluse dans l'export de recherche.

---

## Workflow d'Export

### 1. Export pour Archivage Personnel

```
[Archiver Trimestre]
    → Génération automatique
    → Données complètes (avec DA réels)
    → Fichier : trimestre-a2025-archive-2025-12-21.json
```

### 2. Export pour Recherche (Anonymisé)

```
[Exporter pour Recherche]
    → Demande ou génération de clé secrète
    → Anonymisation des DA
    → Séparation observations/calculs
    → Ajout schéma et métadonnées
    → Fichier : monitorage-recherche-a2025-2025-12-21.json
    → Table de correspondance sauvegardée localement
```

---

## Compatibilité et Évolution

### Versioning du Format

Le champ `meta.version_format` suit le versioning sémantique :
- **Majeur** (1.x → 2.x) : Changements incompatibles
- **Mineur** (1.0 → 1.1) : Ajouts rétrocompatibles
- **Patch** (1.0.0 → 1.0.1) : Corrections

### Garanties de Compatibilité

1. Les champs existants ne sont **jamais supprimés** dans une version mineure
2. Les nouveaux champs sont **toujours optionnels**
3. Le schéma intégré documente la structure exacte de chaque export

### Migration Entre Versions

```javascript
function migrerExport(exportAncien, versionCible) {
    // Appliquer les transformations version par version
    // 1.0 → 1.1 : Ajouter champ X avec valeur par défaut
    // 1.1 → 1.2 : Renommer champ Y en Z
}
```

---

## Implémentation Prévue

### Nouvelles Fonctions (js/trimestres.js)

```javascript
/**
 * Génère ou récupère la clé d'anonymisation de l'enseignant
 */
function obtenirCleAnonymisation(forcer = false) { ... }

/**
 * Exporte les données au format recherche
 * @param {string} trimestreId - ID du trimestre à exporter
 * @param {Object} options - {anonymiser: true, inclureCalculs: true}
 */
function exporterFormatRecherche(trimestreId, options = {}) { ... }

/**
 * Sauvegarde la table de correspondance localement
 */
function sauvegarderTableCorrespondance(table) { ... }
```

### Interface Utilisateur

Bouton dans la section "Gestion des trimestres" :

```
[Exporter] → Menu déroulant :
  ├─ Export complet (archivage)
  └─ Export recherche (anonymisé)
```

Modal pour export recherche :
- Affichage/génération de la clé secrète
- Aperçu du nombre d'étudiants/observations
- Bouton "Exporter"
- Rappel : "Conservez votre clé secrète pour pouvoir désanonymiser"

---

## Cas d'Usage

### Analyse Longitudinale

Avec plusieurs exports de trimestres successifs, un chercheur peut :
- Suivre l'évolution des indices A/C/P d'une cohorte
- Comparer les patterns de présence entre sessions
- Identifier les facteurs prédictifs de décrochage

### Comparaison Inter-Groupes

En anonymisant avec la même clé, l'enseignant peut :
- Comparer les résultats entre ses différents groupes
- Analyser l'impact de changements pédagogiques
- Tout en permettant la désanonymisation si nécessaire

### Recherche Institutionnelle

Les données anonymisées peuvent être partagées :
- Sans risque de ré-identification (sans la clé)
- Avec contexte pédagogique complet (programme, compétences)
- Avec données brutes permettant des analyses indépendantes

---

## Sécurité et Confidentialité

### Données Jamais Exportées

- Noms des étudiants
- DA réels (sauf export archivage personnel)
- Clé secrète d'anonymisation
- Table de correspondance

### Bonnes Pratiques

1. **Ne jamais partager** la clé secrète
2. **Sauvegarder** la table de correspondance de façon sécurisée
3. **Utiliser des clés différentes** pour des projets de recherche différents
4. **Vérifier** que l'export anonymisé ne contient pas de données nominatives

---

## Statut d'Implémentation

| Composant | Statut |
|-----------|--------|
| Structure JSON spécifiée | Fait |
| Séparation observations/calculs | Spécifié |
| Anonymisation réversible | Spécifié |
| Schéma auto-descriptif | Spécifié |
| Fonction `genererCleAnonymisation()` | À faire |
| Fonction `exporterFormatRecherche()` | À faire |
| Interface utilisateur | À faire |
| Tests de compatibilité | À faire |

---

## Références

- [CLAUDE.md](./CLAUDE.md) - Documentation technique de Monitorage
- [js/trimestres.js](./js/trimestres.js) - Module de gestion des trimestres
- Discussion Beta 95 (2025-12-21) - Spécification de l'architecture
