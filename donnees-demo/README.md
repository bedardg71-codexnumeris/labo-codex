# Données de démonstration

Ce répertoire contient des fichiers de démonstration pour tester l'application sans risquer vos données réelles.

## ⚠️ IMPORTANT

**Le groupe fictif utilise le numéro 9999** pour éviter toute confusion avec vos groupes réels (qui utilisent généralement 0001, 0002, etc.).

## Fichiers disponibles

### 1. `donnees-completes-demo.json`
**Données complètes de démonstration** avec :
- 10 étudiants fictifs (groupe 9999)
- Productions et évaluations exemples
- Grilles de critères SRPNF
- Échelle IDME
- Cartouches de rétroaction

**Utilisation** :
1. Allez dans **Réglages → Gestion des données**
2. Section "Importer les données complètes"
3. Sélectionnez `donnees-completes-demo.json`
4. ⚠️ Cochez "Écraser les données existantes" seulement si vous voulez remplacer vos données actuelles
5. Importez

### 2. `etudiants-groupe-9999.txt`
**Import rapide d'étudiants seulement** (sans évaluations ni matériel pédagogique).

**Utilisation** :
1. Allez dans **Réglages → Groupe**
2. Section "Importer depuis un fichier"
3. Sélectionnez `etudiants-groupe-9999.txt`
4. Importez

### 3. `materiel-pedagogique/`
Fichiers individuels pour importer du matériel pédagogique spécifique :
- `echelle-idme.json` - Échelle IDME (Incomplet, Développement, Maîtrisé, Étendu)
- `grille-srpnf.json` - Grille de critères SRPNF
- `cartouches-srpnf.json` - Commentaires prédéfinis par critère et niveau

**Utilisation** :
1. Allez dans **Réglages → Matériel pédagogique**
2. Section correspondante (Échelles / Grilles / Cartouches)
3. Cliquez sur le bouton 📥 Importer
4. Sélectionnez le fichier désiré

## 💡 Cas d'usage recommandés

### Pour les exercices Primo (mode Assisté)
1. **Avant** : Exportez vos données réelles (Réglages → Gestion des données → Exporter)
2. Importez `donnees-completes-demo.json`
3. Faites vos exercices/tests avec le groupe 9999
4. **Après** : Réimportez vos données réelles

### Pour tester sans risque
- Utilisez un **navigateur différent** (Safari pour vos vraies données, Chrome pour les tests)
- Ou utilisez le **mode navigation privée** (les données ne seront pas sauvegardées)

### Pour formation/démonstration
- Importez `donnees-completes-demo.json` sur une machine de test
- Présentez les fonctionnalités sans exposer de vraies données d'étudiants

## 🔒 Protection de vos données réelles

**Ces fichiers de démonstration ne contiennent AUCUNE donnée réelle.**

Pour éviter toute perte de données :
1. **Exportez régulièrement** vos données réelles (Réglages → Gestion des données)
2. **Vérifiez le numéro de groupe** avant d'importer (9999 = démo, autre = réel)
3. **Ne cochez "Écraser"** que si vous savez exactement ce que vous faites

## 📝 Contenu des données de démonstration

### Étudiants (10 fictifs)
- DA : 9999001 à 9999010
- Groupe : **9999**
- Noms : Noms québécois courants (Tremblay, Gagnon, Roy, etc.)
- Programmes : Variété de programmes collégiaux

### Matériel pédagogique
- Échelle IDME (4 niveaux : I, D, M, E)
- Grille SRPNF (5 critères : Structure, Rigueur, Plausibilité, Nuance, Français)
- Cartouches avec commentaires détaillés pour chaque niveau

---

**Dernière mise à jour** : 30 novembre 2025
**Version** : Beta 92
