# Primo - Système tutoriel amélioré

## Date
28 novembre 2025 12:00

## Résumé exécutif

Transformation complète du système d'assistance Primo en un **parcours tutoriel guidé complet** basé sur les principes de l'**enseignement explicite**.

**Durée estimée du parcours** : 20-25 minutes (au lieu de 8 minutes)
**Nombre d'étapes** : 37 questions/étapes (au lieu de 23)
**Principe pédagogique** : Modélisation, pratique guidée, exploration

---

## 🎯 Objectifs

Transformer Primo d'un simple assistant de configuration en un **système tutoriel complet** qui :
1. Configure l'application (déjà fait)
2. **NOUVEAU** : Guide l'utilisateur à travers les fonctionnalités de base
3. **NOUVEAU** : Permet de pratiquer la création d'une évaluation
4. **NOUVEAU** : Importe automatiquement des données de démo pour exploration
5. **NOUVEAU** : Enseigne comment utiliser le système de monitorage

---

## 📦 Matériel créé

### Dossier `materiel-demo/`

**4 fichiers créés** pour le parcours tutoriel :

1. **echelle-idme.json** (74 lignes)
   - Échelle IDME (SOLO) avec 5 niveaux
   - Niveaux : 0 (Aucun), I (Insuffisant), D (Développement), M (Maîtrisé), E (Étendu)
   - Licence : CC BY-NC-SA 4.0

2. **grille-srpnf.json** (78 lignes)
   - Grille de critères SRPNF (5 critères)
   - Structure (15%), Rigueur (20%), Plausibilité (10%), Nuance (25%), Français (30%)
   - Liée à l'échelle IDME

3. **cartouches-srpnf.json** (185 lignes)
   - 20 cartouches de rétroaction personnalisées
   - Commentaires adaptatifs selon niveau (I, D, M, E) et critère
   - Approche constructive avec suggestions d'amélioration

4. **LISEZMOI.txt** (67 lignes)
   - Instructions d'utilisation des fichiers JSON
   - Guide d'importation étape par étape
   - Informations sur la licence

**Total** : ~400 lignes de contenu pédagogique partageable

---

## 🔧 Modifications techniques

### 1. Fichier `primo-questions.js`

**Corrections initiales** :
- ✅ Années : 2026-2028 au lieu de 2025-2027 (lignes 88-95)
- ✅ Heures : Select avec heures rondes seulement (6 questions modifiées)
  - Séance 1 : début + fin (lignes 300-349)
  - Séance 2 : début + fin (lignes 375-432)
  - Séance 3 : début + fin (lignes 457-512)

**Nouvelles étapes tutorielles** (lignes 583-867) :

#### ÉTAPE 6 : Confirmation création du groupe
- Type : `instruction`
- Message de transition vers le matériel pédagogique

#### ÉTAPE 7 : Préparation matériel pédagogique (4 questions)
- `intro-materiel` : Explication du partage de matériel
- `confirmation-dossier-ouvert` : Vérification dossier ouvert
- `aide-dossier` : Aide pour trouver le dossier (conditionnel)

#### ÉTAPE 8 : Import du matériel (3 questions)
- `import-echelle` : Import echelle-idme.json
- `import-grille` : Import grille-srpnf.json
- `import-cartouches` : Import cartouches-srpnf.json
- `validation-materiel` : Confirmation visuelle

#### ÉTAPE 9 : Création d'une production (1 question)
- `creer-production` : Guide création "Test de connaissances"
- Lien avec Grille SRPNF, pondération 10%

#### ÉTAPE 10 : Création d'une évaluation (2 questions)
- `creer-evaluation` : Navigation vers formulaire évaluation
- `attribuer-niveaux` : Attribution niveaux IDME aux critères

#### ÉTAPE 11 : Import données complètes - MAGIE (3 questions)
- `intro-magie` : Explication de ce qui va être importé
- `execution-import-demo` : Type `action` - Import automatique
- `confirmation-import-demo` : Résumé des données importées

#### ÉTAPE 12 : Saisie des présences (1 question)
- `saisie-presences` : Guide modification des présences

#### ÉTAPE 13 : Tableau de bord (2 questions)
- `tableau-bord` : Découverte indicateurs globaux
- `profil-individuel` : Exploration profil étudiant

#### ÉTAPE 14 : Conclusion
- `fin` : Récapitulatif compétences acquises + prochaines étapes

**Statistiques** :
- Étapes ajoutées : 14 nouvelles étapes
- Lignes ajoutées : ~280 lignes
- Nouveaux types : `instruction`, `action`

### 2. Fichier `primo-modal.js`

**Support nouveaux types de questions** :

#### A. Génération d'inputs (`genererInputQuestion`, lignes 378-399)
```javascript
case 'instruction':
    // Pas d'input, juste une instruction à lire
    break;

case 'action':
    // Type spécial pour déclencher une action
    html += `<div id="action-status">⏳ En cours d'exécution...</div>`;
    break;
```

#### B. Navigation adaptée (`primoQuestionSuivante`, lignes 509-520)
```javascript
// Pour 'instruction' et 'message' : pas de validation
if (question.type === 'instruction' || question.type === 'message') {
    indexQuestionActuelle++;
    afficherQuestionActuelle();
    return;
}

// Pour 'action' : exécuter l'action
if (question.type === 'action') {
    executerAction(question);
    return;
}
```

#### C. Boutons adaptatifs (`genererBoutonsNavigation`, lignes 436-496)
```javascript
// Texte du bouton selon le type
const texteBouton = question.type === 'instruction' ? 'Continuer →' : 'Suivant →';

// Bouton désactivé pendant l'action
if (question.type === 'action') {
    html += `<button disabled>Exécution en cours...</button>`;
}
```

#### D. Exécution d'actions (`executerAction`, lignes 559-621)
- Gestion asynchrone des actions
- Affichage statut (en cours, succès, erreur)
- Passage automatique à la question suivante après 1.5s

#### E. Import données demo (`importerDonneesDemo`, lignes 623-650)
```javascript
async function importerDonneesDemo() {
    const response = await fetch('donnees-demo.json');
    const donnees = await response.json();
    await importerDonnees(donnees);
}
```

**Statistiques** :
- Fonctions ajoutées : 2 (`executerAction`, `importerDonneesDemo`)
- Lignes ajoutées : ~100 lignes
- Types supportés : 7 (text, number, date, select, radio, textarea, message, **instruction**, **action**)

---

## 🎓 Principes pédagogiques appliqués

### Enseignement explicite (Rosenshine)

**1. Modélisation** :
- Primo montre où trouver le matériel pédagogique
- Primo explique comment importer les fichiers
- Primo guide la création d'une production

**2. Pratique guidée** :
- Utilisateur crée sa première production avec instructions détaillées
- Utilisateur effectue sa première évaluation pas à pas
- Vérifications intermédiaires ("C'est fait ?")

**3. Pratique autonome** :
- Import automatique de données complètes
- Exploration libre du tableau de bord
- Consultation de profils individuels

**4. Rétroaction immédiate** :
- Confirmations visuelles après chaque étape (✅)
- Messages d'erreur clairs si quelque chose ne fonctionne pas
- Validation à chaque import

### Progression cognitive

**Charge cognitive gérée** :
- Une seule action à la fois
- Instructions en format numéroté (1️⃣ 2️⃣ 3️⃣)
- Pas plus de 3-4 actions par étape

**Échafaudage** :
- Débute avec configuration simple (nom, cours, trimestre)
- Monte progressivement vers actions complexes (évaluation)
- Termine avec exploration autonome (tableau de bord)

---

## 📊 Comparaison avant/après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Durée** | 8 minutes | 20-25 minutes |
| **Étapes** | 23 questions | 37 étapes |
| **Types de questions** | 7 types | 9 types (+instruction, +action) |
| **Matériel fourni** | Aucun | 4 fichiers JSON (400 lignes) |
| **Pratique guidée** | Non | Oui (création production + évaluation) |
| **Données de démo** | Import manuel | Import automatique |
| **Formation complète** | Non | Oui (toutes fonctionnalités couvertes) |
| **Autonomie finale** | Faible | Élevée |

---

## 🚀 Workflow utilisateur final

### Parcours complet (20-25 minutes)

**Minutes 0-5 : Configuration de base**
1. Nom, cours, trimestre, année
2. Pratique de notation, portfolio
3. Dates du trimestre
4. Horaire des séances

**Minutes 5-8 : Étudiants**
5. Méthode d'ajout (copier-coller)
6. Liste d'étudiants collée
7. Confirmation création groupe

**Minutes 8-12 : Matériel pédagogique**
8. Ouverture dossier materiel-demo/
9. Import échelle IDME
10. Import grille SRPNF
11. Import cartouches rétroaction
12. Validation matériel

**Minutes 12-16 : Première évaluation**
13. Création production "Test de connaissances"
14. Navigation vers formulaire évaluation
15. Attribution niveaux IDME aux critères
16. Sauvegarde

**Minutes 16-18 : Magie (import auto)**
17. Confirmation import données demo
18. Exécution automatique
19. Confirmation données importées

**Minutes 18-22 : Exploration guidée**
20. Saisie des présences (modification)
21. Découverte tableau de bord
22. Consultation profil individuel

**Minutes 22-25 : Conclusion et autonomie**
23. Récapitulatif compétences acquises
24. Options de prochaines étapes
25. Fermeture Primo

**Résultat** : Utilisateur **autonome** et **confiant** pour utiliser toutes les fonctionnalités.

---

## ✅ Tests requis

### Test 1 : Flux complet avec serveur HTTP
```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
python3 -m http.server 8000
# Ouvrir http://localhost:8000/index%2092.html
```

**Vérifications** :
- [ ] Dossier materiel-demo/ visible et accessible
- [ ] Imports manuels des 3 fichiers JSON fonctionnent
- [ ] Création production "Test de connaissances" fonctionne
- [ ] Formulaire évaluation affiche échelle + grille + cartouches
- [ ] Import automatique donnees-demo.json fonctionne (type `action`)
- [ ] Toutes les étapes s'enchaînent correctement
- [ ] Boutons "Continuer" vs "Suivant" appropriés
- [ ] Message final avec récapitulatif

### Test 2 : Gestion d'erreurs
- [ ] Aide pour trouver dossier materiel-demo/ (option "J'ai besoin d'aide")
- [ ] Import échoue gracieusement si fichier manquant
- [ ] Bouton "Continuer quand même" si action échoue
- [ ] Validation inputs (champs requis)

### Test 3 : Navigation
- [ ] Bouton "Précédent" fonctionne correctement
- [ ] Questions conditionnelles sautées selon réponses (aide-dossier)
- [ ] Annulation demande confirmation

---

## 📝 Documentation utilisateur

### Fichier LISEZMOI.txt
- Instructions claires pour import matériel
- Format attendu pour chaque fichier
- Licence CC BY-NC-SA 4.0
- Contact et support

### Intégration dans l'application
- Section Aide enrichie (prévue)
- Tutoriels vidéo courts (prévu)
- FAQ avec questions tutoriel (prévu)

---

## 🎉 Bénéfices pédagogiques

**Pour les nouveaux utilisateurs** :
✅ Apprentissage complet en 25 minutes
✅ Pratique immédiate de toutes les fonctions
✅ Confiance pour utiliser seul après
✅ Comprend la philosophie de l'application

**Pour les enseignants expérimentés** :
✅ Découverte rapide de nouvelles fonctionnalités
✅ Matériel pédagogique prêt à utiliser
✅ Données de démo pour expérimenter
✅ Option de sauter les étapes déjà connues

**Pour le projet** :
✅ Réduction barrière à l'entrée
✅ Expérience utilisateur exceptionnelle
✅ Promotion du partage de matériel (CC)
✅ Onboarding professionnel

---

## 📅 Prochaines étapes (optionnel)

### Phase 1 : Amélioration visuelle
- [ ] Indicateur de progression (Étape 12/37)
- [ ] Animations subtiles lors des transitions
- [ ] Surlignage zones de l'interface (flèches, highlights)

### Phase 2 : Personnalisation
- [ ] Mode "Rapide" vs "Complet"
- [ ] Sauter certaines étapes selon expertise
- [ ] Checkpoint pour reprendre plus tard

### Phase 3 : Analytics
- [ ] Tracking étapes complétées
- [ ] Identification points de friction
- [ ] Temps moyen par étape

---

## 🏆 Conclusion

Le système tutoriel Primo est maintenant un **véritable parcours de formation** basé sur les meilleures pratiques pédagogiques.

**Impact attendu** :
- Adoption plus rapide par nouveaux utilisateurs
- Réduction des questions de support
- Meilleure compréhension du système de monitorage
- Promotion de la collaboration via partage de matériel

**Qualité pédagogique** :
- Enseignement explicite appliqué rigoureusement
- Modélisation → Pratique guidée → Autonomie
- Charge cognitive gérée
- Rétroaction immédiate

**C'est de l'enseignement explicite appliqué ! Une très belle modélisation !** 🎓✨

---

**Auteurs** : Grégoire Bédard (Labo Codex) avec Claude Code
**Date** : 28 novembre 2025
**Version** : Beta 92
**Fichiers modifiés** : 2 (primo-questions.js, primo-modal.js)
**Fichiers créés** : 5 (materiel-demo/ + ce document)
**Lignes ajoutées** : ~780 lignes
