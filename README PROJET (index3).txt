# README_PROJET.md

## Objectif du projet

Application web autonome en HTML/CSS/JavaScript pour [DÉCRIRE TON USAGE SPÉCIFIQUE].
L'application fonctionne entièrement hors-ligne, stocke les données localement dans le navigateur et permet l'export/import des données via fichiers JSON.

**Contrainte principale** : Aucune dépendance externe, aucune connexion serveur requise.

## Fonctionnalités réalisées

- [ ] Structure HTML de base avec navigation
- [ ] Système de stockage local (localStorage)
- [ ] Interface d'accueil
- [ ] [AJOUTER TES FONCTIONNALITÉS SPÉCIFIQUES]
- [ ] Export des données en JSON
- [ ] Import des données depuis JSON
- [ ] Service Worker pour fonctionnement hors-ligne
- [ ] Manifest pour installation comme PWA

## Prochaines étapes par priorité

1. [DÉFINIR TA PREMIÈRE TÂCHE]
2. [DÉFINIR TA DEUXIÈME TÂCHE] 
3. [DÉFINIR TA TROISIÈME TÂCHE]
4. Optimisation de l'interface utilisateur
5. Tests sur différents navigateurs

## Contraintes techniques

- **Autonomie totale** : Aucune connexion internet requise après installation
- **Stockage local uniquement** : Pas de transmission de données vers l'extérieur
- **Simplicité d'usage** : Interface accessible sans formation technique
- **Compatibilité** : Fonctionne sur navigateurs modernes (Chrome, Firefox, Safari, Edge)
- **Portabilité** : Le dossier peut être copié et fonctionne immédiatement

## Architecture des fichiers

```
projet/
├── index.html              # Page principale et point d'entrée
├── styles.css              # Feuille de style complète
├── script.js               # Logique applicative principale
├── storage.js              # Gestion du stockage local
├── sw.js                   # Service Worker (mode hors-ligne)
├── manifest.webmanifest    # Métadonnées PWA
├── README_PROJET.md        # Ce fichier
├── COLLAB_RULES.txt        # Règles de collaboration avec LLM
└── noms_stables.json       # Registre des identifiants protégés
```

## Règles de collaboration avec LLM

**Référence obligatoire** : Voir `COLLAB_RULES.txt` et `noms_stables.json` avant toute demande.

**Format de demande standardisé** :
```
CONTEXTE : [Résumé projet en 1 phrase]
OBJECTIF : [Une seule tâche précise]
ZONES AUTORISÉES : [Balises LLM:OK_TO_EDIT concernées]  
NOMS STABLES : [Référence au fichier JSON]
EXTRAIT : [40-100 lignes de code pertinentes]
ATTENDU : [Résultat visible souhaité]
FORMAT : [Patch minimal uniquement]
```

## Historique des contributions LLM

### [DATE] - [FONCTIONNALITÉ]
**Objectif** : [Description courte]
**Fichiers modifiés** : [Liste des fichiers]
**Résultat** : [Fonctionne/À corriger/Abandonné]
**Notes** : [Observations utiles pour la suite]

---

### [DATE] - [AUTRE FONCTIONNALITÉ] 
**Objectif** : [Description courte]
**Fichiers modifiés** : [Liste des fichiers]
**Résultat** : [Fonctionne/À corriger/Abandonné]
**Notes** : [Observations utiles pour la suite]

## État actuel et prochaine session

**Dernière modification** : [DATE]
**État du projet** : [Stable/En cours/Cassé]
**Prochaine tâche prioritaire** : [Décrire la tâche]
**Fichiers concernés** : [Lister les fichiers à modifier]

## Procédure de sauvegarde

**Avant chaque session LLM** :
1. Commit Git si utilisé OU copie manuelle du dossier
2. Nom de sauvegarde : `projet_backup_AAAAMMJJ`
3. Test de l'état actuel (ouvrir index.html)

**Après chaque modification** :
1. Application du patch proposé
2. Test immédiat dans le navigateur  
3. Si succès → commit/sauvegarde
4. Si échec → restauration backup

## Notes importantes

**Ce que le LLM ne doit jamais voir** : L'intégralité du projet d'un coup.
**Ce que le LLM doit toujours recevoir** : Le contexte minimal nécessaire à la tâche.
**Responsabilité humaine** : Maintien de la cohérence d'ensemble et validation des modifications.

## Informations de débogage

**Navigateur de test principal** : Safari
**Système d'exploitation** : macOS
**Problèmes connus** : 
**Limitations identifiées** : [Lister les contraintes rencontrées]