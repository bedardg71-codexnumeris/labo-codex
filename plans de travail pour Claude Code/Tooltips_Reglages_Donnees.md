# Implémentation des tooltips — Réglages > Données

**Scope** : Sous-onglet Données de l'onglet Réglages (3 sections, 15 clés)
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**Note** : Ce sous-onglet contient des actions sensibles (suppression de captures, réinitialisation complète). Les tooltips doivent informer clairement sur l'irréversibilité sans bloquer l'interaction avec les boutons.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // RÉGLAGES — Données
    // =================================================================

    'donnees-sous-nav':
        'Sauvegarde, restauration, captures de progression et maintenance de l\'application.',

    // --- Sauvegarde et restauration ---

    'donnees-sauvegarde':
        'Exporter tes données (sauvegarde complète ou configuration pédagogique seule) ou importer un fichier existant.',

    'donnees-export-complet':
        'Toutes les données : cours, étudiants, présences, évaluations. Pour restaurer sur cet appareil ou un autre.',

    'donnees-export-config':
        'Uniquement les outils (grilles, échelles, productions, cartouches). Pour partager avec des collègues (CC BY-NC-SA).',

    'donnees-import':
        'Charger une sauvegarde personnelle ou la configuration d\'un collègue. Le type sera détecté automatiquement.',

    // --- Captures et recherche ---

    'donnees-captures':
        'Snapshots de suivi longitudinal et export anonymisé pour la recherche en éducation.',

    'donnees-snapshots':
        'Enregistre l\'état des indices A-C-P-E à des moments clés pour le suivi longitudinal.',

    'donnees-capturer':
        'Capture manuelle immédiate de l\'état actuel des indices.',

    'donnees-reconstruire':
        'Recalcule l\'historique des captures depuis le début. Utile après un changement de paramètres.',

    'donnees-supprimer-captures':
        'Efface toutes les captures enregistrées. Action irréversible.',

    'donnees-export-recherche':
        'Export anonymisé des indices A-C-P-E et statistiques agrégées pour la recherche. Aucune donnée nominative incluse.',

    // --- Maintenance ---

    'donnees-maintenance':
        'Outils techniques : réinitialisation, informations de stockage et gestion avancée des ressources.',

    'donnees-reinitialiser':
        'Efface toutes les données et revient à l\'état initial. Triple confirmation + mot de passe requis. Irréversible.',

    'donnees-info-techniques':
        'Stockage local (IndexedDB + localStorage), JSON lisible, aucune donnée envoyée sur internet.',

    'donnees-gestion-ressources':
        'Auditer et nettoyer les ressources pédagogiques accumulées. Sélectionner un type pour afficher la liste.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Zone « Sauvegarde et restauration »

| Clé | Élément cible |
|-----|---------------|
| `donnees-sauvegarde` | Titre du panneau « Sauvegarde et restauration » |
| `donnees-export-complet` | Titre de la carte « Sauvegarde complète » |
| `donnees-export-config` | Titre de la carte « Configuration pédagogique » |
| `donnees-import` | Titre de la carte « Importer un fichier » |

### Zone « Captures et recherche »

| Clé | Élément cible |
|-----|---------------|
| `donnees-captures` | Titre du panneau « Captures et recherche » |
| `donnees-snapshots` | Titre « Captures de progression (Snapshots) » |
| `donnees-capturer` | Bouton « Capturer maintenant » |
| `donnees-reconstruire` | Bouton « Reconstruire l'historique » |
| `donnees-supprimer-captures` | Bouton « Supprimer les captures » |
| `donnees-export-recherche` | Titre « Export anonymisé pour la recherche » |

### Zone « Maintenance »

| Clé | Élément cible |
|-----|---------------|
| `donnees-maintenance` | Titre du panneau « Maintenance » |
| `donnees-reinitialiser` | Titre « Réinitialisation complète » (pas le bouton rouge) |
| `donnees-info-techniques` | Titre « Informations techniques » |
| `donnees-gestion-ressources` | Titre « Gestion avancée des ressources » |

### Sous-navigation

| Clé | Élément cible |
|-----|---------------|
| `donnees-sous-nav` | Onglet « Données » dans la sous-navigation des Réglages |

---

## Règles de placement

- Pour les **cartes** (Sauvegarde complète / Configuration pédagogique / Importer) : placer `data-tooltip` sur le **titre** de la carte, pas sur le bouton d'action en dessous. Les boutons « Exporter mes données », « Exporter ma config » et « Choisir un fichier... » doivent rester cliquables sans interférence.
- Pour les **boutons d'action** de la section Captures (Capturer maintenant, Reconstruire, Supprimer) : placer `data-tooltip` **directement sur le bouton**. Le tooltip apparaît au survol et disparaît au clic — pas de conflit avec l'interaction.
- Pour **Réinitialisation complète** : placer `data-tooltip` sur le **titre** de la sous-section, pas sur le bouton rouge « Réinitialiser toutes les données ». Ce bouton déclenche un processus de triple confirmation qui ne doit pas être perturbé.
- Pour **Informations techniques** : le panneau est purement informatif. Placer `data-tooltip` sur le titre pour fournir un résumé rapide au survol.
- Pour **Gestion avancée des ressources** : placer `data-tooltip` sur le titre. Le sélecteur de type de ressource doit rester pleinement manipulable.

---

## Vérification

- [ ] 15 tooltips apparaissent au survol
- [ ] Les boutons « Exporter mes données » et « Exporter ma config » restent cliquables
- [ ] Le bouton « Choisir un fichier... » ouvre bien le sélecteur de fichier
- [ ] Les boutons Capturer / Reconstruire / Supprimer restent fonctionnels
- [ ] Le bouton « Réinitialiser toutes les données » n'est pas perturbé par un tooltip
- [ ] Le sélecteur de type de ressource reste utilisable
- [ ] Le bouton « Générer l'export anonymisé » reste cliquable
