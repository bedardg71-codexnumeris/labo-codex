# Notes de version - Beta 91.2

**Date de publication** : 26 novembre 2025
**Version** : Beta 91.2 (Système d'import/export pédagogique)
**Auteur** : Grégoire Bédard
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🎉 Nouveauté principale : Partage de pratiques pédagogiques

La Beta 91.2 introduit un **système complet d'import/export** qui facilite le partage de vos ressources pédagogiques avec vos collègues, tout en respectant les principes du libre partage éducatif (licence Creative Commons).

---

## ✨ Qu'est-ce qui change pour vous?

### 📤 Exporter votre travail pédagogique

Vous pouvez maintenant **partager facilement** vos grilles, échelles, productions et cartouches de rétroaction avec d'autres enseignants.

**Où?** Réglages → Gestion des données

**Nouveautés** :
1. **Export de configuration complète**
   - Un seul bouton exporte TOUT votre matériel pédagogique
   - Génère automatiquement 2 fichiers :
     - Un fichier JSON (données)
     - Un fichier LISEZMOI.txt (instructions)

2. **Métadonnées enrichies**
   - Lors de l'export, vous renseignez :
     - Nom de votre pratique
     - Disciplines (ex: Français, Littérature)
     - Niveau (Collégial, Universitaire, etc.)
     - Description de votre approche
     - Vos coordonnées (optionnel : email, site web)
   - Licence Creative Commons BY-NC-SA 4.0 automatique

### 📥 Importer du matériel partagé

Vous pouvez maintenant **importer des pratiques** créées par des collègues.

**Où?** Réglages → Gestion des données → Importer une configuration

**Nouveautés** :
1. **Aperçu avant import**
   - Voyez le contenu du fichier avant d'importer
   - Informations sur l'auteur, la discipline, le contenu

2. **Importation intelligente**
   - Détecte automatiquement les conflits (si vous avez déjà des ressources identiques)
   - Résout les conflits sans perte de données
   - Avertit si des dépendances manquent

---

## 💡 Cas d'usage concrets

### 1. Harmonisation départementale
Votre département veut utiliser les mêmes grilles de critères?
→ Un·e collègue exporte sa grille, les autres l'importent.

### 2. Mentorat
Vous accueillez un·e nouvel·le enseignant·e?
→ Exportez votre configuration complète et transmettez-lui.

### 3. Réutilisation entre sessions
Vous voulez conserver votre configuration d'une session à l'autre?
→ Exportez à la fin d'une session, importez au début de la suivante.

### 4. Communautés de pratique
Vous participez à une communauté qui mutualise des ressources?
→ Chacun·e exporte ses meilleures pratiques et les partage.

---

## 🎯 Comment ça marche?

### Exporter une configuration complète

1. **Ouvrir** : Réglages → Gestion des données
2. **Cliquer** : "Exporter ma configuration complète"
3. **Remplir** le formulaire de métadonnées :
   - Nom de votre pratique
   - Votre nom
   - Disciplines
   - Niveau
   - Description (500 caractères max)
   - Cocher "J'accepte la licence CC BY-NC-SA 4.0"
4. **Télécharger** : 2 fichiers se téléchargent automatiquement
   - `PRATIQUE-COMPLETE-[nom]-[date].json`
   - `LISEZMOI-[nom]-[date].txt`

### Importer une configuration

1. **Ouvrir** : Réglages → Gestion des données
2. **Cliquer** : "Importer une configuration"
3. **Sélectionner** le fichier JSON reçu
4. **Vérifier** l'aperçu qui s'affiche :
   - Métadonnées (auteur, disciplines, etc.)
   - Contenu (nombre de grilles, échelles, etc.)
5. **Confirmer** l'import
6. **Recharger** la page pour voir vos nouvelles ressources

---

## ⚠️ Points importants à savoir

### Protection de la vie privée
- **Aucune donnée étudiante n'est exportée**
- Seul le matériel pédagogique réutilisable est exporté
- Noms, numéros DA, notes, présences ne sont JAMAIS inclus

### Conflits d'identifiants
- Si vous importez des ressources déjà présentes, le système :
  - Détecte le conflit
  - Crée de nouveaux identifiants
  - Met à jour toutes les références automatiquement
  - **Aucune perte de données**

### Dépendances manquantes
- Si vous importez une production qui référence une grille manquante :
  - Le système vous avertit
  - Vous pouvez annuler OU continuer quand même
  - La production s'importe mais ne fonctionnera qu'après import de la grille

---

## 📚 Différence entre les types d'export

**1. Backup complet** (boutons "Exporter les données")
- **Contenu** : TOUTES vos données (cours, étudiants, notes, présences, etc.)
- **Usage** : Sauvegarde personnelle, changement d'ordinateur
- **Partage** : ❌ NON (données confidentielles incluses)

**2. Configuration pédagogique complète** (NOUVEAU - Beta 91.2)
- **Contenu** : Matériel pédagogique uniquement (grilles, échelles, productions, cartouches)
- **Usage** : Partage avec collègues, réutilisation entre sessions
- **Partage** : ✅ OUI (aucune donnée étudiante)

**3. Export partiel** (boutons dans chaque section)
- **Contenu** : Une ressource spécifique (1 grille, 1 échelle, etc.)
- **Usage** : Partage ciblé d'une ressource précise
- **Partage** : ✅ OUI (aucune donnée étudiante)

---

## 🔧 Améliorations techniques (pour les curieux)

### Architecture
- Détection automatique des conflits d'IDs
- Remapping intelligent avec préservation des références
- Validation de structure JSON
- Gestion des dépendances entre ressources

### Métadonnées Creative Commons
- Format standardisé CC BY-NC-SA 4.0
- Attribution automatique de l'auteur original
- Historique des contributeurs
- URL de la licence

### Compatibilité
- Fonctionne avec IndexedDB (Beta 91.1)
- Aucune dépendance externe
- 100% hors ligne

---

## 📖 Documentation complémentaire

### Pour les utilisateurs
- Ce fichier : Notes de version
- Dans l'application : Aide → Utilisation → Collaboration entre collègues

### Pour les testeurs
- `PHASE_5_GUIDE_EXECUTION.md` : Guide de test rapide
- `PHASE_5_PLAN_TESTS.md` : Plan de test détaillé

### Pour les développeurs
- `BETA_91_CHANGELOG.md` : Changelog technique
- `CLAUDE.md` : Documentation architecture
- Fichiers de test JSON fournis

---

## 🐛 Problèmes connus

**Aucun bug critique identifié.**

Si vous rencontrez un problème :
1. Vérifiez la console navigateur (erreurs JavaScript?)
2. Essayez dans un autre navigateur (Safari, Chrome)
3. Consultez la section Aide de l'application
4. Contactez : labo@codexnumeris.org

---

## 🙏 Remerciements

Cette fonctionnalité a été développée suite aux retours de la communauté AQPC (novembre 2025). Merci pour vos suggestions et votre engagement pour le partage de pratiques pédagogiques!

---

## 📅 Prochaines étapes

La Beta 91.3 pourrait inclure :
- Interface "Bibliothèque" pour gérer les configurations importées
- Recherche et filtrage des ressources partagées
- Export/import de ressources individuelles enrichi
- Suggestions basées sur vos besoins

---

## 💬 Feedback

Vos commentaires sont précieux! Partagez vos suggestions :
- Email : labo@codexnumeris.org
- Site : https://codexnumeris.org

---

**Bon partage pédagogique!** 🎓✨
