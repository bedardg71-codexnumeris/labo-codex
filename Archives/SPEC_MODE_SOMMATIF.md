# SPÉCIFICATION TECHNIQUE : Mode Sommatif Traditionnel

**Version** : 1.0
**Date** : 26 octobre 2025
**Auteur** : Claude Code + Grégoire Bédard
**Objectif** : Permettre l'utilisation de l'application avec une pratique sommative traditionnelle (non-PAN)

---

## 📋 TABLE DES MATIÈRES

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Architecture de détection du mode](#2-architecture-de-détection-du-mode)
3. [Modifications du modèle de données](#3-modifications-du-modèle-de-données)
4. [Calcul des indices A-C-P en mode SOM](#4-calcul-des-indices-a-c-p-en-mode-som)
5. [Modifications de l'interface utilisateur](#5-modifications-de-linterface-utilisateur)
6. [Plan d'implémentation](#6-plan-dimplémentation)
7. [Tests de validation](#7-tests-de-validation)

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Problème actuel

L'application a été conçue pour une **Pratique Alternative de Notation (PAN)** avec système de portfolio. Les calculs des indices C (Complétion) et P (Performance) sont **exclusivement basés sur les artefacts-portfolio**, rendant l'application **inutilisable** pour les enseignants avec une pratique sommative traditionnelle.

**Symptômes** :
- Indice C = toujours 0% si aucun artefact-portfolio
- Indice P = toujours 0% si aucun artefact-portfolio
- Indice R faussé : R = (2×A + 0 + 0) / 4
- Messages confus dans le profil étudiant

### 1.2 Objectif

Permettre aux enseignants de choisir **explicitement** leur pratique :
- **PAN** (alternative) : Logique actuelle avec portfolios
- **SOM** (sommative) : Nouvelle logique avec évaluations traditionnelles

### 1.3 Principes de conception

1. ✅ **Choix explicite** : L'enseignant déclare sa pratique dans Réglages → Pratique de notation
2. ✅ **Logique bifurquée** : Calculs adaptés selon le mode choisi
3. ✅ **Rétrocompatibilité** : Les cours PAN existants continuent de fonctionner
4. ✅ **Flexibilité** : Permettre une grande marge de manœuvre dans chaque pratique

---

## 2. ARCHITECTURE DE DÉTECTION DU MODE

### 2.1 Source de vérité : localStorage.modalitesEvaluation

**Structure existante** (module pratiques.js) :

```javascript
{
  pratique: "sommative" | "alternative",  // ← Choix de l'enseignant
  typePAN: "maitrise" | "specifications" | "denotation" | null,
  affichageTableauBord: {
    afficherSommatif: boolean,
    afficherAlternatif: boolean
  },
  dateConfiguration: "2025-10-20T..."
}
```

### 2.2 Fonction utilitaire à créer

**Fichier** : `js/portfolio.js` (ou nouveau fichier `js/utils.js`)

```javascript
/**
 * Détermine si le mode actuel est SOM (sommatif) ou PAN (alternatif)
 *
 * @returns {string} - 'SOM' | 'PAN'
 */
function obtenirModePratique() {
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');

    if (modalites.pratique === 'sommative') {
        return 'SOM';
    } else if (modalites.pratique === 'alternative') {
        return 'PAN';
    } else {
        // Par défaut : SOM pour rétrocompatibilité
        console.warn('Pratique non définie, mode SOM par défaut');
        return 'SOM';
    }
}
```

---

## 3. MODIFICATIONS DU MODÈLE DE DONNÉES

### 3.1 Productions (localStorage.listeGrilles)

**Structure actuelle** :
```javascript
{
  id: "PROD1729...",
  titre: "Examen mi-session",
  description: "...",
  type: "examen",  // ← Types existants : examen, travail, quiz, presentation, portfolio, artefact-portfolio, autre
  ponderation: 30,
  grilleId: "GRILLE123...",
  objectif: "...",
  tache: "...",
  verrouille: false
}
```

**Modification proposée : Option B (types composés)**

**NOUVEAUX types à ajouter** :

```javascript
// Types SOMMATIFS (comptent dans la note finale)
"examen-sommatif"
"travail-sommatif"
"quiz-sommatif"
"presentation-sommatif"
"autre-sommatif"

// Types FORMATIFS (ne comptent PAS dans la note finale)
"examen-formatif"
"travail-formatif"
"quiz-formatif"
"presentation-formatif"
"autre-formatif"

// Types PAN (inchangés)
"portfolio"
"artefact-portfolio"
```

**Fonction helper à créer** :

```javascript
/**
 * Détermine si une production est sommative (compte dans la note)
 *
 * @param {Object} production - Objet production
 * @returns {boolean}
 */
function estProductionSommative(production) {
    const typesSommatifs = [
        'examen-sommatif',
        'travail-sommatif',
        'quiz-sommatif',
        'presentation-sommatif',
        'autre-sommatif',
        'portfolio'  // Le portfolio est sommatif en mode PAN
    ];

    return typesSommatifs.includes(production.type);
}

/**
 * Détermine si une production est formative (ne compte PAS)
 *
 * @param {Object} production - Objet production
 * @returns {boolean}
 */
function estProductionFormative(production) {
    const typesFormatifs = [
        'examen-formatif',
        'travail-formatif',
        'quiz-formatif',
        'presentation-formatif',
        'autre-formatif'
    ];

    return typesFormatifs.includes(production.type);
}
```

### 3.2 Pas de modification des échelles

Les échelles de performance (localStorage.echellesTemplates) **restent inchangées**.

**Raison** : Les deux modes utilisent le même système d'échelles avec :
- `code` : I, D, M, E (ou personnalisé)
- `valeurCalcul` : Valeur numérique pour calculs (ex: D = 69.5%)

---

## 4. CALCUL DES INDICES A-C-P EN MODE SOM

### 4.1 Indice A (Assiduité) - IDENTIQUE

**Aucun changement nécessaire**.

**Formule universelle** :
```
A = (présences) / (séances données) × 100
```

**Source** : `js/saisie-presences.js` → `localStorage.indicesAssiduiteDetailles`

---

### 4.2 Indice C (Complétion) - DIFFÉRENT selon le mode

#### **MODE PAN (actuel - inchangé)** :

```javascript
// Calcul basé sur les artefacts-portfolio
const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));

// Identifier les artefacts réellement donnés (avec au moins une évaluation)
const artefactsDonnes = new Set();
evaluations.forEach(evaluation => {
    if (artefactsPortfolioIds.has(evaluation.productionId)) {
        artefactsDonnes.add(evaluation.productionId);
    }
});

const nombreArtefactsDonnes = artefactsDonnes.size;

// Pour chaque étudiant
const evaluationsEleve = evaluations.filter(e =>
    e.etudiantDA === da &&
    artefactsDonnes.has(e.productionId)
);
const nbArtefactsRemis = evaluationsEleve.length;
const C = nombreArtefactsDonnes === 0 ? 0 :
    Math.round((nbArtefactsRemis / nombreArtefactsDonnes) * 100);
```

#### **MODE SOM (nouveau - à implémenter)** :

```javascript
// Calcul basé sur TOUTES les productions sommatives
const productionsSommatives = productions.filter(p =>
    estProductionSommative(p)
);

// Identifier les productions déjà données (date de remise passée)
const aujourd'hui = new Date();
const productionsDonnees = productionsSommatives.filter(p => {
    if (!p.dateRemise) return true; // Si pas de date → considérée comme donnée
    return new Date(p.dateRemise) <= aujourd'hui;
});

const nombreProductionsDonnees = productionsDonnees.length;

// Pour chaque étudiant
const productionsDonneesIds = new Set(productionsDonnees.map(p => p.id));
const evaluationsEleve = evaluations.filter(e =>
    e.etudiantDA === da &&
    productionsDonneesIds.has(e.productionId)
);
const nbProductionsRemises = evaluationsEleve.length;

const C = nombreProductionsDonnees === 0 ? 0 :
    Math.round((nbProductionsRemises / nombreProductionsDonnees) * 100);
```

**Exemple SOM** :
- Productions sommatives : Exam1, Travail1, Travail2, Exam2, Présentation
- Productions déjà données (date passée) : Exam1, Travail1, Travail2 (3)
- Étudiant a remis : Exam1 ✓, Travail1 ✓, Travail2 ✗ (2)
- **C = 2/3 × 100 = 67%**

---

### 4.3 Indice P (Performance) - DIFFÉRENT selon le mode

#### **MODE PAN (actuel - inchangé)** :

```javascript
// Moyenne des N meilleurs artefacts sélectionnés (PAN)
const portfolio = productions.find(p => p.type === 'portfolio');
let P = 0;

if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
    // Utiliser les artefacts sélectionnés manuellement
    artefactsRetenus = selectionsPortfolios[da][portfolio.id].artefactsRetenus || [];
    const evaluationsRetenues = evaluationsEleve.filter(e =>
        artefactsRetenus.includes(e.productionId) && e.noteFinale !== null
    );

    if (evaluationsRetenues.length > 0) {
        const notes = evaluationsRetenues.map(e =>
            convertirNiveauEnPourcentage(e.noteFinale, e.echelleId)
        );
        const somme = notes.reduce((sum, note) => sum + note, 0);
        P = Math.round(somme / notes.length);
    }
} else {
    // Sélection automatique des N meilleurs
    const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;
    const evaluationsAvecNote = evaluationsEleve
        .filter(e => e.noteFinale !== null)
        .sort((a, b) => {
            const noteA = convertirNiveauEnPourcentage(b.noteFinale, b.echelleId);
            const noteB = convertirNiveauEnPourcentage(a.noteFinale, a.echelleId);
            return noteB - noteA;
        })
        .slice(0, nombreARetenir);

    if (evaluationsAvecNote.length > 0) {
        const notes = evaluationsAvecNote.map(e =>
            convertirNiveauEnPourcentage(e.noteFinale, e.echelleId)
        );
        const somme = notes.reduce((sum, note) => sum + note, 0);
        P = Math.round(somme / notes.length);
    }
}
```

#### **MODE SOM (nouveau - à implémenter)** :

```javascript
// Moyenne pondérée provisoire des évaluations faites
const productionsSommatives = productions.filter(p => estProductionSommative(p));
const aujourd'hui = new Date();
const productionsFaites = productionsSommatives.filter(p => {
    if (!p.dateRemise) return true;
    return new Date(p.dateRemise) <= aujourd'hui;
});

// Calculer le total des pondérations des productions faites
const totalPondFaites = productionsFaites.reduce((sum, p) => sum + (p.ponderation || 0), 0);

if (totalPondFaites === 0) {
    P = 0; // Aucune production pondérée faite
} else {
    let sommeNotesPonderees = 0;

    productionsFaites.forEach(prod => {
        // Chercher l'évaluation de l'étudiant pour cette production
        const evaluation = evaluations.find(e =>
            e.etudiantDA === da && e.productionId === prod.id
        );

        // Si non remise → note = 0 (comportement par défaut)
        let notePourcent = 0;
        if (evaluation && evaluation.noteFinale !== null) {
            notePourcent = convertirNiveauEnPourcentage(evaluation.noteFinale, evaluation.echelleId);
        }

        // Calculer le poids proportionnel de cette production
        const poidsProp = prod.ponderation / totalPondFaites;

        // Ajouter à la somme pondérée
        sommeNotesPonderees += (notePourcent * poidsProp);
    });

    P = Math.round(sommeNotesPonderees);
}
```

**Exemple SOM** :
- Productions faites : Exam1 (30%), Travail1 (20%), Travail2 (20%)
- Total pondérations faites : 70%
- Exam1 : 72% → poids 30/70 = 42.86%
- Travail1 : 85% → poids 20/70 = 28.57%
- Travail2 : NON REMIS → 0% → poids 20/70 = 28.57%
- **P = (72 × 0.4286) + (85 × 0.2857) + (0 × 0.2857) = 30.86 + 24.28 + 0 = 55.14% ≈ 55%**

---

### 4.4 Fonction de conversion niveau → pourcentage

**Fichier** : `js/portfolio.js` (ou `js/utils.js`)

```javascript
/**
 * Convertit un niveau de performance en pourcentage selon l'échelle utilisée
 *
 * @param {string|number} niveau - Le niveau (ex: 'D', 3.2)
 * @param {string} echelleId - ID de l'échelle (optionnel, utilise l'échelle par défaut si absent)
 * @returns {number} - Pourcentage (0-100)
 */
function convertirNiveauEnPourcentage(niveau, echelleId) {
    // Charger l'échelle depuis localStorage
    const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    const niveauxConfig = JSON.parse(localStorage.getItem('niveauxEchelle') || '[]');

    // Si echelleId fourni, utiliser cette échelle
    let niveauxUtilises = niveauxConfig;
    if (echelleId) {
        const echelle = echelles.find(e => e.id === echelleId);
        if (echelle && echelle.niveaux) {
            niveauxUtilises = echelle.niveaux;
        }
    }

    // Si pas de niveaux configurés, utiliser les niveaux par défaut IDME
    if (!niveauxUtilises || niveauxUtilises.length === 0) {
        niveauxUtilises = [
            { code: 'I', valeurCalcul: 32 },
            { code: 'D', valeurCalcul: 69.5 },
            { code: 'M', valeurCalcul: 79.5 },
            { code: 'E', valeurCalcul: 92.5 }
        ];
    }

    // Trouver le niveau correspondant
    const niveauTrouve = niveauxUtilises.find(n => n.code === niveau);

    if (niveauTrouve && niveauTrouve.valeurCalcul !== undefined) {
        return niveauTrouve.valeurCalcul;
    }

    // Fallback : si c'est un nombre, on suppose que c'est déjà un pourcentage
    if (typeof niveau === 'number') {
        return niveau;
    }

    // Fallback : retourner 0
    console.warn(`Impossible de convertir le niveau "${niveau}" en pourcentage`);
    return 0;
}
```

---

### 4.5 Indice R (Risque) - IDENTIQUE

**Aucun changement nécessaire**.

**Formule universelle** :
```
R = (2×A + C + P) / 4
```

Peu importe comment C et P sont calculés, la formule R reste la même.

---

## 5. MODIFICATIONS DE L'INTERFACE UTILISATEUR

### 5.1 Module Productions (Matériel → Productions)

**Fichier HTML** : `index 71 (refonte des modules).html`
**Section** : `#materiel-productions`

#### Modification du select "Type de production"

**AVANT** :
```html
<select id="productionType" class="controle-form" onchange="gererChangementTypeProduction()">
    <option value="">-- Choisir un type --</option>
    <option value="examen">Examen</option>
    <option value="travail">Travail écrit</option>
    <option value="quiz">Quiz/Test</option>
    <option value="presentation">Présentation</option>
    <option value="portfolio">📁 Portfolio (conteneur)</option>
    <option value="artefact-portfolio">Artefact d'un portfolio</option>
    <option value="autre">Autre</option>
</select>
```

**APRÈS** :
```html
<select id="productionType" class="controle-form" onchange="gererChangementTypeProduction()">
    <option value="">-- Choisir un type --</option>
    <optgroup label="Évaluations sommatives (comptent dans la note)">
        <option value="examen-sommatif">Examen (sommatif)</option>
        <option value="travail-sommatif">Travail écrit (sommatif)</option>
        <option value="quiz-sommatif">Quiz/Test (sommatif)</option>
        <option value="presentation-sommatif">Présentation (sommative)</option>
        <option value="autre-sommatif">Autre (sommatif)</option>
    </optgroup>
    <optgroup label="Évaluations formatives (ne comptent PAS dans la note)">
        <option value="examen-formatif">Examen (formatif)</option>
        <option value="travail-formatif">Travail écrit (formatif)</option>
        <option value="quiz-formatif">Quiz/Test (formatif)</option>
        <option value="presentation-formatif">Présentation (formative)</option>
        <option value="autre-formatif">Autre (formatif)</option>
    </optgroup>
    <optgroup label="Pratique Alternative de Notation (PAN)">
        <option value="portfolio">📁 Portfolio (conteneur)</option>
        <option value="artefact-portfolio">Artefact d'un portfolio</option>
    </optgroup>
</select>
```

#### Affichage conditionnel du champ pondération

**Logique** :
- Si type = formatif → Masquer pondération (elle ne compte pas)
- Si type = sommatif → Afficher pondération (obligatoire)
- Si type = portfolio → Afficher pondération (compte dans note finale)
- Si type = artefact-portfolio → Masquer pondération (gérée par le portfolio parent)

**Modification dans `gererChangementTypeProduction()`** :

```javascript
function gererChangementTypeProduction() {
    const type = document.getElementById('productionType').value;
    const champsPortfolio = document.getElementById('champsPortfolio');
    const divPonderation = document.getElementById('productionPonderation').parentElement;
    const divGrille = document.getElementById('productionGrille') ?
        document.getElementById('productionGrille').parentElement : null;
    const msgPonderation = document.getElementById('msgPonderationArtefact');

    // Réinitialiser tout d'abord
    if (champsPortfolio) champsPortfolio.style.display = 'none';
    if (divPonderation) divPonderation.style.display = 'block';
    if (divGrille) divGrille.style.display = 'block';
    if (msgPonderation) msgPonderation.style.display = 'none';

    // Appliquer selon le type
    if (type === 'portfolio') {
        // Portfolio conteneur : afficher config, masquer grille
        if (champsPortfolio) champsPortfolio.style.display = 'block';
        if (divGrille) divGrille.style.display = 'none';
    } else if (type === 'artefact-portfolio') {
        // Artefact individuel : masquer pondération, afficher message
        if (divPonderation) divPonderation.style.display = 'none';
        if (msgPonderation) msgPonderation.style.display = 'block';
    } else if (estProductionFormative({type: type})) {
        // NOUVEAU : Production formative → masquer pondération
        if (divPonderation) divPonderation.style.display = 'none';
        if (msgPonderation) {
            msgPonderation.textContent = 'ℹ️ Les évaluations formatives ne comptent pas dans la note finale.';
            msgPonderation.style.display = 'block';
        }
    }
}
```

### 5.2 Validation de la pondération totale

**Modification dans `mettreAJourPonderationTotale()`** :

```javascript
function mettreAJourPonderationTotale() {
    const productions = JSON.parse(localStorage.getItem('listeGrilles') || '[]');

    // Filtrer uniquement les productions SOMMATIVES (qui comptent)
    const productionsSommatives = productions.filter(p => estProductionSommative(p));

    const total = productionsSommatives.reduce((sum, prod) => sum + (prod.ponderation || 0), 0);

    document.getElementById('ponderationTotale').textContent = total + '%';

    const statut = document.getElementById('statutPonderation');
    if (total === 100) {
        statut.textContent = '✓ Pondération correcte';
        statut.style.color = 'green';
    } else if (total > 100) {
        statut.textContent = `${total - 100}% en trop`;
        statut.style.color = 'red';
    } else {
        statut.textContent = `${100 - total}% manquant`;
        statut.style.color = 'orange';
    }
}
```

### 5.3 Profil étudiant - Adaptation de l'affichage

**Fichier** : `js/profil-etudiant.js`

**Logique** :
- En mode PAN : Afficher section Portfolio avec N meilleurs artefacts
- En mode SOM : Afficher tableau complet des évaluations sommatives avec moyenne pondérée provisoire

**Section à adapter** : "Section 3 : Mobilisation (A-C-P)"

```javascript
// Dans la fonction afficherProfilComplet()

const mode = obtenirModePratique();

if (mode === 'PAN') {
    // Affichage actuel (inchangé)
    // ...section portfolio avec artefacts sélectionnés
} else if (mode === 'SOM') {
    // NOUVEAU : Affichage mode sommatif
    const productionsSommatives = productions.filter(p => estProductionSommative(p));

    html += `
        <h4>Évaluations sommatives</h4>
        <table class="tableau">
            <thead>
                <tr>
                    <th>Production</th>
                    <th>Pondération</th>
                    <th>Statut</th>
                    <th>Note</th>
                    <th>Niveau</th>
                </tr>
            </thead>
            <tbody>
    `;

    productionsSommatives.forEach(prod => {
        const evaluation = evaluations.find(e =>
            e.etudiantDA === da && e.productionId === prod.id
        );

        const statut = evaluation ? '✓ Remis' : '✗ Non remis';
        const statutCouleur = evaluation ? 'green' : 'red';
        const note = evaluation ? convertirNiveauEnPourcentage(evaluation.noteFinale, evaluation.echelleId) : 0;
        const niveau = evaluation ? evaluation.noteFinale : '—';

        html += `
            <tr>
                <td>${prod.titre}</td>
                <td style="text-align: center;">${prod.ponderation}%</td>
                <td style="color: ${statutCouleur}; font-weight: bold;">${statut}</td>
                <td style="text-align: center;">${note}%</td>
                <td style="text-align: center;">${niveau}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <div style="margin-top: 15px; padding: 10px; background: var(--bleu-tres-pale); border-radius: 4px;">
            <strong>Note finale provisoire :</strong> ${P}%
            <p style="font-size: 0.85em; margin: 5px 0 0 0; color: #666;">
                Moyenne pondérée des évaluations remises. Les non-remises comptent pour 0%.
            </p>
        </div>
    `;
}
```

---

## 6. PLAN D'IMPLÉMENTATION

### Phase 1 : Préparation (30 min)

1. ✅ Créer ce document de spécification
2. ⬜ Valider la spécification avec l'utilisateur
3. ⬜ Créer une branche Git de sauvegarde

### Phase 2 : Modifications du modèle (1h)

1. ⬜ Ajouter les nouveaux types de productions dans le HTML (select)
2. ⬜ Créer les fonctions helpers :
   - `obtenirModePratique()`
   - `estProductionSommative(production)`
   - `estProductionFormative(production)`
   - `convertirNiveauEnPourcentage(niveau, echelleId)`
3. ⬜ Tester les fonctions helpers avec console.log

### Phase 3 : Calcul des indices C et P en mode SOM (2h)

1. ⬜ Modifier `calculerEtStockerIndicesCP()` dans `portfolio.js`
   - Ajouter détection du mode au début
   - Implémenter logique SOM pour indice C
   - Implémenter logique SOM pour indice P
   - Conserver logique PAN existante
2. ⬜ Tester avec données fictives (créer un cours SOM de test)

### Phase 4 : Modifications de l'UI (1h30)

1. ⬜ Modifier `gererChangementTypeProduction()` pour gérer les types formatifs
2. ⬜ Modifier `mettreAJourPonderationTotale()` pour filtrer uniquement les sommatifs
3. ⬜ Adapter `afficherProfilComplet()` pour le mode SOM
4. ⬜ Tester l'interface complète

### Phase 5 : Documentation et tests (1h)

1. ⬜ Mettre à jour CLAUDE.md avec les changements
2. ⬜ Mettre à jour la section AIDE avec explication des deux modes
3. ⬜ Créer des cas de test (voir section 7)
4. ⬜ Valider avec l'utilisateur

**DURÉE TOTALE ESTIMÉE : 6 heures**

---

## 7. TESTS DE VALIDATION

### Test 1 : Cours PAN existant (rétrocompatibilité)

**Prérequis** :
- Un cours avec pratique = 'alternative'
- Portfolio défini avec 9 artefacts
- Règle PAN : retenir 3 meilleurs
- Étudiants avec évaluations

**Vérifications** :
- ✅ Indices C et P calculés correctement (logique PAN)
- ✅ Profil étudiant affiche section Portfolio
- ✅ Pondération totale = pondération du portfolio uniquement

### Test 2 : Nouveau cours SOM

**Configuration** :
- Créer un nouveau cours
- Réglages → Pratique de notation → Sommative
- Créer 4 productions :
  - Examen mi-session (sommatif, 30%)
  - Travail 1 (sommatif, 20%)
  - Quiz révision (formatif, 0%)
  - Travail 2 (sommatif, 20%)
  - Examen final (sommatif, 30%)

**Vérifications** :
- ✅ Pondération totale = 100% (quiz formatif ignoré)
- ✅ Statut = "✓ Pondération correcte"

**Données étudiant** :
- DA : 1234567
- Assiduité : 18/20 séances = 90%
- Évaluations :
  - Examen mi-session : Remis → Note D (69.5%)
  - Travail 1 : Remis → Note M (79.5%)
  - Quiz révision : Remis → Note E (92.5%) [ne compte pas]
  - Travail 2 : NON REMIS → 0%
  - Examen final : Pas encore donné

**Calculs attendus** :

**Indice C** :
- Productions sommatives données : Exam1, Travail1, Travail2 = 3
- Productions sommatives remises : 2
- C = 2/3 × 100 = **67%**

**Indice P** :
- Exam1 (30%) : 69.5% → poids 30/70 = 42.86%
- Travail1 (20%) : 79.5% → poids 20/70 = 28.57%
- Travail2 (20%) : 0% → poids 20/70 = 28.57%
- P = (69.5 × 0.4286) + (79.5 × 0.2857) + (0 × 0.2857)
- P = 29.79 + 22.71 + 0 = **52.5% ≈ 53%**

**Indice R** :
- R = (2×90 + 67 + 53) / 4
- R = (180 + 67 + 53) / 4
- R = 300 / 4 = **75%**
- Niveau : Bon (70-84%)

**Vérifications** :
- ✅ A = 90%
- ✅ C = 67%
- ✅ P = 53%
- ✅ R = 75%
- ✅ Profil affiche tableau des évaluations sommatives (pas de section portfolio)
- ✅ Quiz formatif n'apparaît PAS dans le calcul

### Test 3 : Migration PAN → SOM

**Scénario** :
- Cours existant en mode PAN
- Enseignant change pour mode SOM dans Réglages
- Supprimer le portfolio
- Créer des évaluations traditionnelles

**Vérifications** :
- ✅ Les indices sont recalculés selon la nouvelle logique
- ✅ Pas de messages d'erreur
- ✅ Profil étudiant s'adapte automatiquement

---

## 8. POINTS D'ATTENTION

### 8.1 Rétrocompatibilité

**Risque** : Les cours PAN existants utilisent les anciens types (`examen`, `travail`, etc.) au lieu des nouveaux (`examen-sommatif`, `travail-sommatif`).

**Solution** :
- Les anciens types sont **implicitement sommatifs** pour rétrocompatibilité
- Modifier `estProductionSommative()` :

```javascript
function estProductionSommative(production) {
    const typesSommatifs = [
        'examen-sommatif',
        'travail-sommatif',
        'quiz-sommatif',
        'presentation-sommatif',
        'autre-sommatif',
        'portfolio',
        // RÉTROCOMPATIBILITÉ : Anciens types considérés sommatifs
        'examen',
        'travail',
        'quiz',
        'presentation',
        'autre'
    ];

    return typesSommatifs.includes(production.type);
}
```

### 8.2 Gestion des dates de remise

**Problème** : Actuellement, le champ `dateRemise` n'existe pas dans le modèle de données.

**Options** :

**Option A** : Ajouter le champ `dateRemise` (recommandé)
```javascript
{
  id: "PROD123...",
  titre: "Examen mi-session",
  type: "examen-sommatif",
  ponderation: 30,
  dateRemise: "2025-03-15"  // ← NOUVEAU
}
```

**Option B** : Considérer toutes les productions comme "déjà données"
- Plus simple à implémenter
- Moins précis pour le calcul de C et P en cours de session

**Recommandation** : Implémenter Option B d'abord (simple), puis ajouter Option A dans une version ultérieure.

### 8.3 Productions formatives dans les statistiques

**Question** : Faut-il afficher les évaluations formatives dans le profil étudiant ?

**Réponse** :
- Les afficher dans une section séparée "Évaluations formatives (ne comptent pas)"
- Permettre un toggle "Afficher/Masquer les évaluations formatives"
- Utile pour voir la progression de l'étudiant même si elles ne comptent pas

---

## 9. CONCLUSION

Cette spécification définit **précisément** :
1. ✅ Comment détecter le mode (PAN vs SOM)
2. ✅ Comment modifier le modèle de données (nouveaux types)
3. ✅ Comment calculer C et P en mode SOM
4. ✅ Comment adapter l'interface utilisateur
5. ✅ Comment tester et valider

**Prochaine étape** : Valider ce document avec l'utilisateur, puis passer à l'**Option A** (implémentation).

**Durée estimée** : 6 heures de travail

**Complexité** : Moyenne (logique bifurquée mais bien définie)

**Risque** : Faible (rétrocompatibilité assurée, tests définis)

---

**FIN DU DOCUMENT DE SPÉCIFICATION**
