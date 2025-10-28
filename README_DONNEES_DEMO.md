# Données de démonstration - Guide complet

**Objectif :** Fournir des données réalistes que les testeurs pourront importer pour découvrir immédiatement l'application.

---

## 🎁 Fichiers prêts à l'emploi (Beta 0.77)

**Nouveauté :** Des fichiers de démonstration sont maintenant inclus dans le projet !

### Fichiers disponibles

1. **`donnees-demo.json`** - Package complet
   - 30 étudiants avec diversité culturelle (groupe 9999)
   - 9 productions configurées (5 sommatives + 4 artefacts)
   - Grille SRPNF complète
   - Échelle IDME (Insuffisant, Développement, Maîtrisé, Étendu)
   - **NOUVEAU** : Cartouche de rétroaction complète "A2 Description d'un personnage"
     * 16 commentaires prédéfinis (4 critères × 4 niveaux IDME)
     * Tutoiement et approche constructive avec suggestions concrètes
     * Critères : Structure, Rigueur, Plausibilité, Nuance
   - Calendrier trimestre (Hiver 2025)
   - Horaire configuré (2 séances/semaine)

2. **`etudiants-demo.txt`** - Liste d'étudiants (groupe TEST)
   - 30 étudiants avec noms québécois (80%) et multiculturels (20%)
   - 10 programmes différents
   - 13% avec Services Adaptés
   - Format : DA → Groupe → Nom → Prénom → Programme → Nom programme → SA
   - Prêt pour import direct dans Réglages → Groupe

3. **`etudiants-demo-groupe9999.txt`** - Liste alternative (groupe 9999)
   - Mêmes 30 étudiants avec identifiants 9999xxx
   - Pour remplacer le groupe simulé par défaut

### Import rapide (2 minutes)

**Option A : Tout-en-un (recommandé)**
1. Ouvrir `index 75 (import-export matériel pédagogique).html`
2. Réglages → Import/Export
3. Importer `donnees-demo.json`
4. ✅ Application prête à tester !

**Option B : Import manuel des étudiants**
1. Réglages → Groupe → Import/Export
2. Choisir `etudiants-demo.txt` ou `etudiants-demo-groupe9999.txt`
3. Les étudiants sont importés automatiquement

### ✨ Nouveauté Beta 0.77 : Correctifs critiques

**IMPORTANT :** Cette version corrige deux bugs critiques de Beta 0.75 qui empêchaient l'import de données. Si vous aviez essayé d'importer `donnees-demo.json` avec Beta 0.75 ou 0.76, veuillez effacer votre localStorage et réessayer avec Beta 0.77.

### Import/Export matériel pédagogique

Vous pouvez importer/exporter séparément :
- **Productions** (Matériel → Productions)
- **Grilles de critères** (Matériel → Critères d'évaluation)
- **Échelles de performance** (Matériel → Niveaux de performance)
- **Cartouches de rétroaction** (Matériel → Rétroactions)
  - Format JSON pour partage entre collègues
  - Format .txt Markdown pour rédaction externe

**Utilité :** Partage de matériel pédagogique entre enseignant·es sans partager les données étudiants.

---

## 📖 Créer vos propres données (méthode détaillée)

**Si vous préférez créer des données personnalisées, suivez ce guide :**

**Durée :** 10-15 minutes

---

## 📋 Pourquoi créer les données depuis l'application ?

✅ **Garantit la cohérence** avec la structure de données réelle
✅ **Évite les erreurs** de format JSON
✅ **Données réalistes** générées par l'application elle-même
✅ **Rapide** : 10 minutes vs plusieurs heures manuellement

---

## 🎯 Données à créer pour une démonstration complète

**Profils d'étudiants variés :**
- ✅ Étudiants performants (A=95%, C=100%, P=85%)
- ✅ Étudiants moyens (A=80%, C=75%, P=70%)
- ✅ Étudiants à risque (A=60%, C=50%, P=55%)
- ✅ Étudiants en difficulté sévère (A=40%, C=30%, P=45%)

**Types d'évaluations :**
- ✅ 3-5 évaluations sommatives (examens, travaux)
- ✅ 3-4 artefacts portfolio
- ✅ Notes variées (de 45% à 95%)

**Présences :**
- ✅ 6-8 semaines de présences
- ✅ Patterns réalistes (étudiants assidus vs absentéistes)

---

## 📝 Guide étape par étape

### ÉTAPE 1 : Ouvrir l'application en mode vierge

1. Ouvrir `index 75 (import-export matériel pédagogique).html`
2. Vérifier que vous êtes en mode **Normal**
3. Si des données existent déjà :
   - Réglages → Import/Export
   - "Effacer toutes les données"
   - Confirmer

---

### ÉTAPE 2 : Configuration initiale (2 minutes)

**A) Configurer le cours**
- Réglages → Cours
- Code : `601-101-MQ`
- Titre : `Écriture et littérature`
- Session : `Hiver 2025`
- Pondération : `2-2-3`

**B) Définir le trimestre**
- Réglages → Trimestre
- Date début : `2025-01-20`
- Date fin : `2025-05-23`
- Congés prévus : Semaine de lecture `2025-03-03` à `2025-03-07`
- Cliquer sur "Générer le calendrier"

**C) Configurer l'horaire**
- Réglages → Horaire
- Séance 1 : Lundi, 8h00-11h00
- Séance 2 : Mercredi, 13h00-16h00
- Enregistrer

**D) Paramétrer les pratiques**
- Réglages → Pratiques
- Pratique principale : Sommative
- ☑ Activer le mode comparatif (pour montrer SOM + PAN)
- Nombre d'artefacts : 4

---

### ÉTAPE 3 : Créer le groupe TEST (3 minutes)

**Option A : Groupe réduit (10 étudiants) - RECOMMANDÉ**

Réglages → Groupe → Coller ce texte :

```
2024001	TEST	Tremblay	Émilie	300.M0	Sciences humaines	Non
2024002	TEST	Gagnon	Thomas	200.B0	Sciences de la nature	Non
2024003	TEST	Roy	Camille	420.B0	Techniques de l'informatique	Non
2024004	TEST	Côté	Alexandre	410.B0	Techniques de comptabilité et de gestion	Oui
2024005	TEST	Bouchard	Sarah	180.A0	Soins Infirmiers	Non
2024006	TEST	Nguyen	Minh	300.M0	Sciences humaines	Non
2024007	TEST	Morin	Léa	500.AL	Arts, lettres et communication – Langues	Non
2024008	TEST	Lavoie	Maxime	200.B0	Sciences de la nature	Non
2024009	TEST	Fortin	Jade	351.A1	Techniques d'éducation spécialisée	Oui
2024010	TEST	Gagné	William	300.M1	Sciences humaines avec mathématiques	Non
```

**Option B : Groupe complet (30 étudiants)**

Ajouter aussi :
```
2024011	TEST	Ouellet	Florence	322.A1	Techniques d'éducation à l'enfance	Non
2024012	TEST	Pelletier	Nathan	200.B0	Sciences de la nature	Non
2024013	TEST	Bélanger	Chloé	300.M0	Sciences humaines	Non
2024014	TEST	Lévesque	Olivier	420.B0	Techniques de l'informatique	Non
2024015	TEST	El Khoury	Nour	410.D0	Gestion de commerces	Non
2024016	TEST	Leblanc	Samuel	180.A0	Soins Infirmiers	Non
2024017	TEST	Paquette	Alice	500.AL	Arts, lettres et communication – Langues	Oui
2024018	TEST	Girard	Félix	200.B0	Sciences de la nature	Non
2024019	TEST	Simard	Juliette	300.M0	Sciences humaines	Non
2024020	TEST	Boucher	Antoine	410.B0	Techniques de comptabilité et de gestion	Non
2024021	TEST	Caron	Maude	351.A1	Techniques d'éducation spécialisée	Non
2024022	TEST	Beaulieu	Lucas	420.B0	Techniques de l'informatique	Non
2024023	TEST	Rodriguez	Sofia	300.M1	Sciences humaines avec mathématiques	Non
2024024	TEST	Poirier	Raphaël	200.B0	Sciences de la nature	Non
2024025	TEST	Fournier	Amélie	180.A0	Soins Infirmiers	Oui
2024026	TEST	Leclerc	Louis	410.D0	Gestion de commerces	Non
2024027	TEST	Dupont	Charlotte	300.M0	Sciences humaines	Non
2024028	TEST	Diallo	Amadou	322.A1	Techniques d'éducation à l'enfance	Non
2024029	TEST	Dubois	Élizabeth	500.AL	Arts, lettres et communication – Langues	Non
2024030	TEST	Martinez	Diego	420.B0	Techniques de l'informatique	Non
```

---

### ÉTAPE 4 : Créer les évaluations (3 minutes)

**A) Évaluations sommatives**

Évaluations → Productions → Ajouter :

1. **Examen formatif 1**
   - Type : Examen formatif
   - Date remise : 2025-02-05
   - Pondération : 0%

2. **Travail 1 : Analyse littéraire**
   - Type : Travail
   - Date remise : 2025-02-12
   - Pondération : 20%

3. **Examen intra**
   - Type : Examen
   - Date remise : 2025-02-26
   - Pondération : 25%

4. **Travail 2 : Dissertation**
   - Type : Travail
   - Date remise : 2025-03-19
   - Pondération : 25%

5. **Examen final**
   - Type : Examen
   - Date remise : 2025-05-14
   - Pondération : 30%

**B) Artefacts portfolio**

6. **Artefact 1 : Fiche de lecture**
   - Type : Artefact portfolio
   - Date remise : 2025-02-07

7. **Artefact 2 : Analyse comparative**
   - Type : Artefact portfolio
   - Date remise : 2025-02-21

8. **Artefact 3 : Essai critique**
   - Type : Artefact portfolio
   - Date remise : 2025-03-14

9. **Artefact 4 : Production finale**
   - Type : Artefact portfolio
   - Date remise : 2025-04-11

---

### ÉTAPE 5 : Saisir des notes réalistes (5 minutes)

**Stratégie pour créer des profils variés :**

**Groupe A - Performants (étudiants 1-3) :**
- Travail 1 : S=85%, R=90%, P=85%, N=85%, F=90% (moyenne ~87%)
- Examen intra : 85%
- Artefacts : 85%, 85%, 90%, 90%

**Groupe B - Moyens (étudiants 4-6) :**
- Travail 1 : S=70%, R=75%, P=70%, N=70%, F=75% (moyenne ~72%)
- Examen intra : 70%
- Artefacts : 70%, 75%, 70%, 75%

**Groupe C - Fragiles (étudiants 7-8) :**
- Travail 1 : S=60%, R=62%, P=58%, N=60%, F=65% (moyenne ~61%)
- Examen intra : 58%
- Artefacts : 60%, 62%, 58%, 60%

**Groupe D - À risque (étudiants 9-10) :**
- Travail 1 : S=45%, R=50%, P=45%, N=48%, F=52% (moyenne ~48%)
- Examen intra : 45%
- Artefacts : 48%, 50%, 45%, 48%

**Pour aller plus vite :**
- Notez seulement les 10 premiers étudiants en détail
- Laissez les autres vides ou copiez les patterns

---

### ÉTAPE 6 : Saisir les présences (3 minutes)

Présences → Saisie

**Saisissez 6-8 semaines de présences** :

**Étudiants performants (1-3) :**
- Présent à 95% des cours (1-2 absences sur 8 semaines)

**Étudiants moyens (4-6) :**
- Présent à 80% des cours (3-4 absences)

**Étudiants fragiles (7-8) :**
- Présent à 65% des cours (5-6 absences)

**Étudiants à risque (9-10) :**
- Présent à 50% des cours (8+ absences)

**Astuce rapide :**
1. Pour une séance, cocher tous les étudiants présents
2. Décocher seulement les absents
3. Enregistrer
4. Répéter pour 12-16 séances (6-8 semaines × 2 cours/semaine)

---

### ÉTAPE 7 : Vérifier les données

**A) Tableau de bord**
- Vérifier que les indices A-C-P s'affichent
- Observer les différences SOM (orange) vs PAN (bleu)
- Identifier les étudiants à risque (échelle de risque)

**B) Profils étudiants**
- Ouvrir 2-3 profils
- Vérifier que les 3 sections s'affichent correctement
- Tester la navigation Précédent/Suivant

**C) Modes**
- Tester Mode Anonymisé (noms changent)
- Tester Mode Simulé (devrait être vide si vous n'avez pas créé de Groupe 9999)

---

### ÉTAPE 8 : Exporter les données (1 minute)

**C'EST L'ÉTAPE FINALE !**

1. Réglages → Import/Export
2. Cliquer sur "Exporter les données"
3. **Sélectionner TOUTES les clés** (cocher "Toutes les clés")
4. Cliquer sur "Exporter"
5. Un fichier JSON sera téléchargé

**Renommer le fichier :**
- De : `export-monitorage-2025-10-27.json`
- À : `donnees-demo.json`

**Placer le fichier dans le dossier du projet**

---

## ✅ Vérification finale

Le fichier `donnees-demo.json` doit contenir ces clés :

```json
{
  "infoCours": {...},
  "infoTrimestre": {...},
  "calendrierComplet": {...},
  "groupeEtudiants": [...],
  "seancesCompletes": {...},
  "modalitesEvaluation": {...},
  "productions": [...],
  "evaluations": {...},
  "indicesAssiduiteDetailles": {...},
  "indicesCP": {...},
  "grillesTemplates": [...],
  "cartouches_grille-srpnf": [...]
}
```

**Taille approximative :** 50-200 Ko selon le nombre d'étudiants et de données

**Note Beta 0.77 :** La clé `cartouches_grille-srpnf` contient les cartouches de rétroaction liées à la grille SRPNF. Les correctifs import/export garantissent que ces données sont correctement sauvegardées dans localStorage.

---

## 🎯 Test du fichier de démo

**Pour tester que tout fonctionne :**

1. Effacer toutes les données de l'application
2. Importer le fichier `donnees-demo.json`
3. Vérifier :
   - ✅ Tableau de bord affiche les étudiants avec indices
   - ✅ Profils étudiants s'ouvrent correctement
   - ✅ Évaluations → Liste affiche les productions
   - ✅ Présences → Saisie affiche les séances
   - ✅ Calendrier affiche le trimestre

**Si tout fonctionne → Le fichier est prêt pour distribution !**

---

## 💡 Conseils pour des données de démo réalistes

**Variété des profils :**
- 30% d'étudiants performants (A+C+P > 80%)
- 40% d'étudiants moyens (A+C+P = 65-80%)
- 20% d'étudiants fragiles (A+C+P = 55-65%)
- 10% d'étudiants à risque élevé (A+C+P < 55%)

**Patterns réalistes :**
- Certains étudiants performants à l'écrit mais moins assidus
- Certains étudiants assidus mais en difficulté (besoin d'aide)
- Corrélation entre assiduité et performance (mais pas parfaite)

**Données incomplètes volontaires :**
- Laisser 2-3 étudiants sans notes (nouveaux arrivés)
- Laisser quelques évaluations futures vides
- Montre comment l'app gère les données incomplètes

---

## 🐛 Problèmes courants

**❌ "L'export ne contient pas toutes les données"**
✅ Vérifiez que "Toutes les clés" est coché
✅ Attendez que toutes les sections soient chargées avant d'exporter

**❌ "L'import échoue avec erreur JSON"**
✅ Ouvrez le fichier dans un éditeur de texte
✅ Vérifiez qu'il commence par `{` et finit par `}`
✅ Utilisez un validateur JSON en ligne (jsonlint.com)

**❌ "Les indices A-C-P ne s'affichent pas après import"**
✅ Les indices se calculent automatiquement au chargement
✅ Rafraîchissez la page (F5)
✅ Vérifiez la console du navigateur (F12) pour erreurs

---

## 📧 Questions ou problèmes ?

Contact : labo@codexnumeris.org

**Fichier mis à jour le :** 28 octobre 2025 (Beta 0.77 - correctifs critiques)
