# Système de monitorage pédagogique - Beta 92

**Version** : Beta 92 - Primo Assistant
**Date** : 27 novembre 2025
**Auteur** : Grégoire Bédard (avec Claude)
**Licence** : Creative Commons BY-NC-SA 4.0

---

## 🎉 **NOUVEAU : Primo, ton assistant de démarrage !**

**Beta 92 introduit Primo**, un assistant accueillant qui t'aide à démarrer avec l'application.

### 👋 Rencontre Primo

À ta première utilisation, Primo va :
- Te souhaiter la bienvenue avec un message chaleureux
- Détecter que tu n'as pas encore de données
- Te proposer **3 options simples** pour commencer :
  1. 🎓 **Charger des données de démonstration** (recommandé pour explorer)
  2. ✨ **Créer ta propre pratique d'évaluation** (guidé en 8 étapes)
  3. 🔍 **Explorer par toi-même** (pour les aventuriers !)

**Message de Primo** : "Allô, je suis Primo ! C'est Claude et Grégoire qui m'envoient ! 😊"

---

## 🚀 Démarrage rapide

### Première utilisation

1. **Ouvre l'application** : Double-clique sur `index 92.html`
2. **Rencontre Primo** : Il apparaît automatiquement après 1 seconde
3. **Choisis ton option** : Données démo, wizard ou exploration libre
4. **C'est parti !** Primo te guide vers la bonne section

### Utilisateurs existants

Si tu as déjà utilisé l'application (Beta 91.x) :
- Tes données sont **conservées** (IndexedDB)
- Primo ne s'affichera **pas** (il détecte que tu as déjà des données)
- Pour revoir Primo : Console JavaScript → `reafficherAccueilPrimo()`

---

## ✨ Nouvelles fonctionnalités Beta 92

### 1. Primo Assistant de démarrage
- ✅ Détection automatique première utilisation
- ✅ Modal d'accueil animé et accueillant
- ✅ 3 parcours de démarrage guidés
- ✅ Navigation intelligente vers les bonnes sections
- ✅ Messages d'encouragement personnalisés
- ✅ Tutoriel interactif 7 étapes après données démo

### 2. Améliorations interface
- ✅ Animations fluides pour le modal
- ✅ Boutons avec états hover/focus améliorés
- ✅ Design cohérent avec la palette de couleurs

### 3. Compatibilité navigateurs
- ✅ **Compatible tous navigateurs** : Safari, Chrome, Firefox, Edge
- ✅ CSS complet inclus dans le package
- ✅ Pas de dépendance externe manquante

---

## 🔧 Migration depuis Beta 91.x

### Si tu utilises Beta 91.5, 91.5b ou 91.5c

1. **Aucune action requise** - Ouvre simplement `index 92.html`
2. **Tes données restent** - Stockées dans IndexedDB
3. **Primo ne te dérangera pas** - Il détecte que tu as déjà des données
4. **Nouvelles fonctionnalités disponibles** immédiatement

### Bugs corrigés des versions précédentes

Tous les bugs de Beta 91.5 sont corrigés dans Beta 92 :
- ✅ `PratiqueConfigurable is not defined`
- ✅ Page blanche dans Microsoft Edge
- ✅ Logo immense (CSS manquant)
- ✅ Barres SRPNF "NaN%"
- ✅ Sélecteur de grille vide

---

## 📁 Structure du package

```
Beta_92_Primo/
├── index 92.html            # Point d'entrée Beta 92
├── styles.css               # Feuille de style complète (142 KB)
├── logo-codex-numeris.png   # Logo Codex Numeris
├── js/                      # Code JavaScript (43 modules)
│   ├── primo-accueil.js     # 🆕 Module Primo Assistant
│   ├── tutoriel-interactif.js  # 🆕 Tutoriel guidé 7 étapes
│   ├── pratiques/           # Système de pratiques configurables
│   │   ├── pratique-configurable.js
│   │   ├── pratique-registre.js
│   │   ├── pratique-manager.js
│   │   └── pratiques-predefines.js
│   └── ...
├── donnees-demo.json        # Données de démonstration (30 étudiants)
├── LICENSE.md               # Licence CC BY-NC-SA 4.0
└── README.md                # Ce fichier
```

---

## 🎓 Fonctionnalités principales (rappel)

### Système de monitorage A-C-P
- **Assiduité (A)** : Suivi des présences avec absences motivées
- **Complétion (C)** : Remise des travaux et artefacts
- **Performance (P)** : Qualité des productions selon échelle IDME

### Wizard Primo (création de pratiques)
- 8 étapes guidées pour créer ta pratique personnalisée
- 7 pratiques prédéfinies prêtes à l'emploi
- Support multi-objectifs d'apprentissage
- Système de jetons (délais, reprises, aide, bonus)

### Import/Export enrichi
- Métadonnées CC BY-NC-SA 4.0
- Export/import de pratiques configurables
- Partage entre collègues facilité
- Backup complet des données

### Tutoriel interactif (NOUVEAU Beta 92)
- Démarrage automatique après chargement données démo
- 7 étapes guidées : Tableau de bord → Étudiants → Profil → Évaluations → Pratiques
- Bulles positionnées dynamiquement avec surbrillance
- Navigation Précédent/Suivant/Terminer
- Barre de progression visuelle
- Ne s'affiche qu'une seule fois par utilisateur

---

## 🔍 Tests et validation

### Tests effectués
- ✅ Détection première utilisation (application vide)
- ✅ Modal Primo s'affiche après 1 seconde
- ✅ Les 3 options fonctionnent correctement
- ✅ Navigation vers Import/Export (données démo)
- ✅ Navigation vers Wizard Primo (création pratique)
- ✅ Fermeture modal et exploration libre
- ✅ Utilisateurs existants : Primo ne s'affiche pas
- ✅ Tutoriel interactif démarre après données démo
- ✅ 7 étapes s'affichent avec positionnement correct
- ✅ Compatible Safari, Chrome, Firefox, Edge

### Pour tester Primo manuellement

```javascript
// Console navigateur - Réafficher Primo
db.removeSync('primo_accueil_vu');
location.reload();

// Ou directement :
reafficherAccueilPrimo();

// Console navigateur - Relancer le tutoriel
db.removeSync('tutoriel_demo_vu');
demarrerTutoriel();
```

---

## 🆘 Problèmes connus

### Primo ne s'affiche pas
**Cause** : Tu as déjà des données (étudiants ou pratique configurée)
**Solution** : C'est normal ! Primo détecte les utilisateurs existants. Pour le revoir : `reafficherAccueilPrimo()` dans la console.

### Le modal reste bloqué
**Solution** : Appuie sur Échap ou recharge la page (Cmd+R / Ctrl+R)

### Les données de démo ne se chargent pas
**Solution** :
1. Va dans Réglages → Import/Export
2. Clique sur "Importer des données"
3. Sélectionne le fichier `donnees-demo.json`

---

## 📞 Support

**Email** : labo@codexnumeris.org
**Site** : https://codexnumeris.org
**Teams** : LABO CODEX DE L'AQPC-PAN

---

## 📄 Licence

Creative Commons BY-NC-SA 4.0 (Grégoire Bédard)

Vous êtes libre de :
- ✅ Partager : Copier et redistribuer le matériel
- ✅ Adapter : Remixer, transformer et créer à partir du matériel

Selon les conditions suivantes :
- 📝 Attribution : Vous devez créditer l'auteur original
- 🚫 Pas d'utilisation commerciale : Usage éducatif uniquement
- 🔄 Partage dans les mêmes conditions : Même licence pour vos adaptations

Voir **LICENSE.md** pour le texte complet.

---

## 🙏 Remerciements

- **Claude (Anthropic)** : Collaboration IA pour le développement de Primo
- **Bruno V.** (Cégep Laurendeau) : Tests et signalement de bugs
- **Testeurs Valleyfield** : Feedback utilisateur précieux
- **Communauté AQPC-PAN** : Soutien et partage de pratiques

---

**Bon monitorage pédagogique avec Primo ! 🎓👋**
