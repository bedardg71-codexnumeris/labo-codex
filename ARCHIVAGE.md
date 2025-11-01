# 📦 Archivage automatique des versions

## Pourquoi archiver ?

Quand vous créez une nouvelle version de `index.html` (par exemple `index 86 (nouvelle-feature).html`), les anciennes versions restent dans le dossier principal et peuvent causer de la confusion. Ce script déplace automatiquement toutes les anciennes versions dans le dossier `Archives/`.

## Utilisation

### Méthode 1 : Double-clic (macOS)

1. Ouvrez **Finder**
2. Naviguez vers le dossier du projet
3. **Double-cliquez** sur `archiver-anciennes-versions.sh`
4. Autorisez l'exécution si demandé

### Méthode 2 : Terminal

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
./archiver-anciennes-versions.sh
```

## Fonctionnement

Le script :
1. ✅ Trouve tous les fichiers `index*.html`
2. ✅ Identifie la version la plus récente (numéro le plus élevé)
3. ✅ Déplace toutes les anciennes versions dans `Archives/`
4. ✅ Garde uniquement la version actuelle dans le dossier principal
5. ✅ Crée le dossier `Archives/` s'il n'existe pas

## Exemple

**Avant :**
```
Monitorage_v6/
├── index 81 (profil étudiant).html
├── index 82 (profil étudiant).html
├── index 83 (seuils configurables).html
├── index 84 (tableau ameliore).html
├── index 85 (interventions).html  ← VERSION ACTUELLE
```

**Après exécution du script :**
```
Monitorage_v6/
├── index 85 (interventions).html  ← GARDÉ (version la plus récente)
├── Archives/
│   ├── index 81 (profil étudiant).html
│   ├── index 82 (profil étudiant).html
│   ├── index 83 (seuils configurables).html
│   └── index 84 (tableau ameliore).html
```

## Workflow recommandé

**À chaque nouvelle version :**

1. Créez votre nouveau fichier `index 86 (nom-feature).html`
2. Testez que tout fonctionne
3. **Exécutez le script d'archivage** : `./archiver-anciennes-versions.sh`
4. Vérifiez que seul `index 86` reste dans le dossier principal

## Sécurité

- ✅ Le script ne supprime aucun fichier (déplacement uniquement)
- ✅ Si un fichier existe déjà dans Archives/, il ne sera pas écrasé
- ✅ Vous pouvez toujours récupérer les anciennes versions dans `Archives/`

## Automatisation (optionnel)

Pour archiver automatiquement à chaque commit Git :

```bash
# Créer un hook pre-commit
echo './archiver-anciennes-versions.sh' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Récupération d'une ancienne version

Si vous avez besoin de revenir à une ancienne version :

```bash
# Exemple : récupérer la version 83
cp Archives/index\ 83\ \(seuils\ configurables\).html .
```
