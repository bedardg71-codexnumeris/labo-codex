# SPÉCIFICATIONS : CANEVAS PAN-SPÉCIFICATIONS V2.0

**Date** : 9 décembre 2025
**Auteur** : Grégoire Bédard (Labo Codex)
**Basé sur** : Article de François Arseneault-Hubert (2025) et Nilson (2014)
**Statut** : Document de spécifications pour refonte complète

---

## 📚 PHILOSOPHIE FONDAMENTALE

### Principes de base (Nilson, 2014)

1. **Spécification** : Caractéristique observable d'un travail acceptable
2. **Jugement binaire** : Acceptable OU non-acceptable (pas de niveaux intermédiaires)
3. **Minimum suffisant** : Les spécifications définissent le seuil minimal acceptable
4. **Révisions encouragées** : Les spécifications servent de guide pour réviser
5. **Note = f(travaux)** : Correspondance entre ensembles de travaux acceptables et note finale

### Citations clés de l'article de François

> "Une spécification est une caractéristique observable d'un travail acceptable, rédigée de manière à pouvoir être comprise autant par la personne qui réalise le travail que par la personne qui l'évalue." (ligne 51)

> "Un travail est acceptable s'il respecte toutes les spécifications énoncées." (ligne 51-52)

> "Dans la notation par spécifications, le plus souvent, une correspondance est établie entre des ensembles de travaux acceptables et la note finale." (ligne 77-78)

> "Il ne s'agit pas d'une correspondance directe entre la note et les objectifs du cours." (ligne 78-79)

---

## 🎯 ARCHITECTURE DU CANEVAS

### 1. Structure de données

```javascript
class PratiquePanSpecifications {
    constructor(config) {
        this.config = {
            // ========== CONFIGURATION UTILISATEUR ==========

            // Types de travaux dans le cours
            typesTravauxTravaux: [
                {
                    id: 'prise-position',
                    nom: 'Prises de position',
                    description: 'Textes argumentés sur enjeux scientifiques',
                    nbTotal: 5,  // Nombre total demandé
                    revisable: true,  // Peut être révisé ?
                    nbRevisionsIncluses: 1  // Révisions gratuites incluses
                },
                {
                    id: 'test',
                    nom: 'Tests',
                    description: 'Évaluations écrites',
                    nbTotal: 2,
                    revisable: true,
                    nbRevisionsIncluses: 1  // 1 reprise gratuite
                },
                {
                    id: 'portfolio',
                    nom: 'Portfolio des apprentissages',
                    description: 'Collection d\'entrées tout au long de la session',
                    nbTotal: 1,
                    revisable: true,
                    nbRevisionsIncluses: 999,  // Révisions illimitées
                    evaluationHolistique: true  // Entrées les plus représentatives comptent
                }
            ],

            // Spécifications par type de travail
            specifications: {
                'prise-position': [
                    {
                        id: 'longueur',
                        description: '~750 mots (ou équivalent audio/vidéo)',
                        typeVerification: 'manuelle'  // ou 'automatique'
                    },
                    {
                        id: 'sources',
                        description: 'Au moins 2 sources fiables convenablement citées',
                        typeVerification: 'manuelle'
                    },
                    {
                        id: 'faits',
                        description: 'Des faits établis sont tirés des sources et servent à étayer les arguments',
                        typeVerification: 'manuelle'
                    }
                ],
                'test': [
                    {
                        id: 'reussite',
                        description: 'Score >= 60%',
                        typeVerification: 'automatique',
                        seuilNumerique: 60
                    }
                ],
                'portfolio': [
                    {
                        id: 'entrevue',
                        description: 'Participation à l\'entrevue finale',
                        typeVerification: 'manuelle'
                    },
                    {
                        id: 'exploration',
                        description: 'Au moins 5 entrées démontrant exploration',
                        typeVerification: 'manuelle'
                    }
                ]
            },

            // Table de correspondance : bundles de travaux → note
            tableBundles: [
                {
                    // Palier A : 80-100%
                    note: { min: 80, max: 100, lettre: 'A' },
                    requis: {
                        'prise-position': 5,  // Tous les travaux demandés
                        'test': 2,
                        'portfolio': 1
                    },
                    description: "Excellence - Exploration maximale",
                    noteFixe: 85  // Note attribuée si palier atteint
                },
                {
                    // Palier B : 70-79%
                    note: { min: 70, max: 79, lettre: 'B' },
                    requis: {
                        'prise-position': 3,  // Moins de travaux
                        'test': 2,
                        'portfolio': 1
                    },
                    description: "Bonne performance - Exploration solide",
                    noteFixe: 75
                },
                {
                    // Palier C : 60-69%
                    note: { min: 60, max: 69, lettre: 'C' },
                    requis: {
                        'prise-position': 1,  // Minimum pour réussir
                        'test': 2,
                        'portfolio': 1
                    },
                    description: "Réussite - Exploration minimale",
                    noteFixe: 65
                },
                {
                    // Échec : < 60%
                    note: { min: 0, max: 59, lettre: 'F' },
                    requis: null,  // En-dessous du seuil C
                    description: "Échec",
                    noteFixe: 50
                }
            ],

            // Configuration jetons (déjà existant dans le système)
            jetons: {
                actif: true,
                delai: {
                    nombre: 2,
                    dureeJours: 7,
                    echeanceMiSession: true  // 1 des 2 jetons expire à mi-session
                },
                reprise: {
                    nombre: 2,
                    maxParProduction: 1,
                    archiverOriginale: true
                }
            },

            // Seuils d'interprétation (pour dépistage)
            seuils: {
                vaBien: 80,      // 80%+
                difficulte: 60,  // 60-79%
                risque: 50       // < 60%
            }
        };
    }
}
```

---

## 🔧 MÉTHODES UNIVERSELLES (Codées en dur)

### 1. Évaluation binaire des travaux

```javascript
/**
 * UNIVERSEL : Vérifie si un travail est acceptable
 *
 * RÈGLE : Un travail est acceptable SI ET SEULEMENT SI
 * toutes les spécifications sont respectées
 *
 * @param {Object} evaluation - Évaluation à vérifier
 * @param {string} typeTravail - Type de travail (ex: 'prise-position')
 * @returns {boolean} true si acceptable, false sinon
 */
_estTravailAcceptable(evaluation, typeTravail) {
    const specs = this.config.specifications[typeTravail];

    if (!specs || specs.length === 0) {
        console.warn('[SPEC] Aucune spécification définie pour:', typeTravail);
        return false;
    }

    // Vérifier chaque spécification
    for (const spec of specs) {
        if (!this._verifierSpecification(evaluation, spec)) {
            console.log(`[SPEC] Spécification non respectée: ${spec.description}`);
            return false;  // UNE SEULE non respectée = travail non acceptable
        }
    }

    return true;  // TOUTES respectées = travail acceptable
}

/**
 * UNIVERSEL : Vérifie une spécification individuelle
 *
 * @param {Object} evaluation - Évaluation
 * @param {Object} spec - Spécification à vérifier
 * @returns {boolean} true si respectée, false sinon
 */
_verifierSpecification(evaluation, spec) {
    if (spec.typeVerification === 'automatique') {
        // Vérification automatique (ex: note >= seuil)
        return evaluation.noteFinale >= spec.seuilNumerique;
    } else {
        // Vérification manuelle : lire depuis evaluation.specifications
        // Structure : evaluation.specifications = { 'longueur': true, 'sources': true, ... }
        return evaluation.specifications?.[spec.id] === true;
    }
}
```

### 2. Calcul de la performance (note finale)

```javascript
/**
 * UNIVERSEL : Calcule la note finale selon bundles de travaux
 *
 * RÈGLE : Note = f(nombre de travaux acceptables), PAS f(objectifs)
 *
 * Processus :
 * 1. Compter travaux acceptables par type
 * 2. Consulter table de correspondance (bundles)
 * 3. Trouver le palier le plus élevé atteint
 * 4. Retourner note fixe de ce palier
 *
 * @param {string} da - Numéro de dossier d'admission
 * @returns {number} Indice P entre 0 et 1
 */
calculerPerformance(da) {
    if (!da || da.length !== 7) {
        console.warn('[SPEC] DA invalide:', da);
        return null;
    }

    // 1. Lire toutes les évaluations de l'étudiant
    const evaluations = this._lireEvaluations();
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        !e.remplaceeParId &&  // Exclure évaluations remplacées
        !e.archivee           // Exclure évaluations archivées
    );

    if (evaluationsEleve.length === 0) {
        console.log('[SPEC] Aucune évaluation pour DA', da);
        return null;
    }

    // 2. Compter travaux acceptables par type
    const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);

    console.log(`[SPEC] Travaux acceptables DA ${da}:`, comptesAcceptables);

    // 3. Déterminer le palier le plus élevé atteint
    const noteAtteinte = this._determinerPalierBundle(comptesAcceptables);

    console.log(`[SPEC] Performance DA ${da}: ${noteAtteinte}%`);

    return noteAtteinte / 100;
}

/**
 * UNIVERSEL : Compte les travaux acceptables par type
 *
 * @param {string} da - Numéro de dossier d'admission
 * @param {Array} evaluations - Évaluations de l'étudiant
 * @returns {Object} { 'prise-position': 3, 'test': 2, 'portfolio': 1 }
 */
_compterTravauxAcceptables(da, evaluations) {
    const comptes = {};

    // Initialiser les compteurs
    this.config.typesTravauxTravaux.forEach(type => {
        comptes[type.id] = 0;
    });

    // Lire les productions pour mapper évaluations → types de travaux
    const productions = this._lireProductions();

    // Parcourir les évaluations
    evaluations.forEach(evaluation => {
        const production = productions.find(p => p.id === evaluation.productionId);

        if (!production) {
            console.warn('[SPEC] Production introuvable pour évaluation:', evaluation.id);
            return;
        }

        // Déterminer le type de travail
        const typeTravail = this._determinerTypeTravail(production);

        if (!typeTravail) {
            console.warn('[SPEC] Type de travail non déterminable:', production);
            return;
        }

        // Vérifier si le travail est acceptable
        if (this._estTravailAcceptable(evaluation, typeTravail)) {
            comptes[typeTravail]++;
        }
    });

    return comptes;
}

/**
 * UNIVERSEL : Détermine le palier de note selon bundles
 *
 * @param {Object} comptesAcceptables - { 'prise-position': 3, 'test': 2, ... }
 * @returns {number} Note du palier atteint (50-100)
 */
_determinerPalierBundle(comptesAcceptables) {
    // Trier paliers par ordre décroissant (A, B, C, F)
    const paliers = [...this.config.tableBundles].sort((a, b) => b.noteFixe - a.noteFixe);

    // Trouver le palier le plus élevé dont TOUS les requis sont satisfaits
    for (const palier of paliers) {
        if (!palier.requis) {
            // Palier échec (pas de requis)
            continue;
        }

        // Vérifier si tous les types requis sont satisfaits
        const tousRequisSatisfaits = Object.entries(palier.requis).every(([type, nbRequis]) => {
            const nbAcceptables = comptesAcceptables[type] || 0;
            return nbAcceptables >= nbRequis;
        });

        if (tousRequisSatisfaits) {
            console.log(`[SPEC] Palier atteint: ${palier.note.lettre} (${palier.noteFixe}%)`);
            return palier.noteFixe;
        }
    }

    // Aucun palier atteint : échec
    const palierEchec = this.config.tableBundles.find(p => !p.requis);
    return palierEchec ? palierEchec.noteFixe : 50;
}
```

### 3. Calcul de la complétion

```javascript
/**
 * UNIVERSEL : Calcule l'indice C (Complétion)
 *
 * Formule : Nombre total de travaux acceptables / Nombre total de travaux demandés
 *
 * @param {string} da - Numéro de dossier d'admission
 * @returns {number} Indice C entre 0 et 1
 */
calculerCompletion(da) {
    if (!da || da.length !== 7) {
        console.warn('[SPEC] DA invalide:', da);
        return null;
    }

    const evaluations = this._lireEvaluations();
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        !e.remplaceeParId &&
        !e.archivee
    );

    if (evaluationsEleve.length === 0) {
        console.log('[SPEC] Aucune évaluation pour DA', da);
        return null;
    }

    // Compter travaux acceptables
    const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);

    // Compter total acceptables
    const totalAcceptables = Object.values(comptesAcceptables).reduce((sum, nb) => sum + nb, 0);

    // Compter total demandé
    const totalDemande = this.config.typesTravauxTravaux.reduce((sum, type) => sum + type.nbTotal, 0);

    if (totalDemande === 0) {
        console.warn('[SPEC] Aucun travail configuré');
        return null;
    }

    const indiceC = totalAcceptables / totalDemande;

    console.log(`[SPEC] Complétion DA ${da}: ${(indiceC * 100).toFixed(1)}% (${totalAcceptables}/${totalDemande} travaux)`);

    return indiceC;
}
```

### 4. Détection des défis

```javascript
/**
 * UNIVERSEL : Détecte les défis spécifiques
 *
 * Pour PAN-Spécifications :
 * - Travaux non acceptables (spécifications manquantes)
 * - Types de travaux non complétés (bloque palier supérieur)
 * - Jetons épuisés (pas de révision possible)
 *
 * @param {string} da - Numéro de dossier d'admission
 * @returns {Object} { type, defis, palierActuel, prochainPalier }
 */
detecterDefis(da) {
    if (!da || da.length !== 7) {
        console.warn('[SPEC] DA invalide:', da);
        return { type: 'specifications', defis: [] };
    }

    const evaluations = this._lireEvaluations();
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        !e.remplaceeParId &&
        !e.archivee
    );

    if (evaluationsEleve.length === 0) {
        return { type: 'specifications', defis: [] };
    }

    const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);
    const palierActuel = this._determinerPalierBundle(comptesAcceptables);

    const defis = [];

    // Trouver le prochain palier
    const paliers = [...this.config.tableBundles]
        .filter(p => p.requis)  // Exclure palier échec
        .sort((a, b) => b.noteFixe - a.noteFixe);

    const prochainPalier = paliers.find(p => p.noteFixe > palierActuel);

    if (prochainPalier) {
        // Identifier types de travaux manquants pour prochain palier
        Object.entries(prochainPalier.requis).forEach(([type, nbRequis]) => {
            const nbAcceptables = comptesAcceptables[type] || 0;
            const nbManquants = nbRequis - nbAcceptables;

            if (nbManquants > 0) {
                const typeTravail = this.config.typesTravauxTravaux.find(t => t.id === type);

                defis.push({
                    type: 'travaux-manquants',
                    typeTravail: type,
                    nomTravail: typeTravail?.nom || type,
                    nbManquants: nbManquants,
                    palierCible: prochainPalier.note.lettre,
                    priorite: palierActuel < 60 ? 'haute' : 'moyenne'
                });
            }
        });
    }

    // Identifier travaux non acceptables (spécifications manquantes)
    const productions = this._lireProductions();

    evaluationsEleve.forEach(evaluation => {
        const production = productions.find(p => p.id === evaluation.productionId);
        const typeTravail = this._determinerTypeTravail(production);

        if (typeTravail && !this._estTravailAcceptable(evaluation, typeTravail)) {
            // Identifier spécifications non respectées
            const specs = this.config.specifications[typeTravail];
            const specsManquantes = specs.filter(spec => !this._verifierSpecification(evaluation, spec));

            defis.push({
                type: 'specifications-manquantes',
                evaluationId: evaluation.id,
                productionNom: production?.titre || 'Sans titre',
                typeTravail: typeTravail,
                specsManquantes: specsManquantes.map(s => s.description),
                revisable: this._peutEtreRevise(da, evaluation, typeTravail)
            });
        }
    });

    return {
        type: 'specifications',
        defis: defis,
        palierActuel: this._obtenirDescriptionPalier(palierActuel),
        prochainPalier: prochainPalier ? this._obtenirDescriptionPalier(prochainPalier.noteFixe) : null
    };
}

/**
 * UNIVERSEL : Vérifie si un travail peut être révisé
 *
 * @param {string} da - DA de l'étudiant
 * @param {Object} evaluation - Évaluation
 * @param {string} typeTravail - Type de travail
 * @returns {boolean} true si révisable
 */
_peutEtreRevise(da, evaluation, typeTravail) {
    const typeTravailConfig = this.config.typesTravauxTravaux.find(t => t.id === typeTravail);

    if (!typeTravailConfig || !typeTravailConfig.revisable) {
        return false;  // Type non révisable
    }

    // Compter révisions déjà utilisées pour cette production
    const evaluations = this._lireEvaluations();
    const nbRevisions = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.productionId === evaluation.productionId &&
        e.repriseDeId === evaluation.id
    ).length;

    // Vérifier si dans limite des révisions incluses
    if (nbRevisions < typeTravailConfig.nbRevisionsIncluses) {
        return true;  // Révisions gratuites disponibles
    }

    // Vérifier jetons de reprise disponibles
    if (typeof window.verifierDisponibiliteJeton === 'function') {
        return window.verifierDisponibiliteJeton(da, 'reprise');
    }

    return false;
}
```

---

## 🔗 INTÉGRATION AVEC LE SYSTÈME DE JETONS

**Le système de jetons existant (`evaluation-jetons.js`) est PARFAIT pour PAN-Spécifications !**

### Jetons de délai

François mentionne (ligne 75) :
> "La notation par spécifications permet aussi l'utilisation de jetons, pour accorder des occasions supplémentaires. J'en ai accordé deux. Chacun permettait d'obtenir une reprise ou révision supplémentaire, ou une extension de date de remise pour un travail, sans aucune question de ma part."

**Implémentation** : ✅ Déjà codé dans `evaluation-jetons.js` (lignes 96-226)

```javascript
// Utilisation dans le canevas
_prolongerEcheance(evaluationId) {
    // Appel direct au système de jetons
    return window.appliquerJetonDelai(evaluationId);
}
```

### Jetons de reprise

François mentionne (ligne 69) :
> "Dans le cas des prises de position, une révision était permise et encouragée."

**Implémentation** : ✅ Déjà codé dans `evaluation-jetons.js` (lignes 228-450)

```javascript
// Utilisation dans le canevas
_creerRevision(evaluationOriginaleId) {
    // Appel direct au système de jetons
    // Option 1 : Révision gratuite (nbRevisionsIncluses pas épuisé)
    // Option 2 : Révision avec jeton (nécessite jeton disponible)
    return window.appliquerJetonReprise(evaluationOriginaleId);
}
```

### Jeton à échéance mi-session

François mentionne (ligne 75-76) :
> "Un des jetons arrivait à échéance à mi-session. J'évitais ainsi une potentielle surenchère de correction en fin de session."

**Implémentation** : À ajouter dans la config

```javascript
jetons: {
    delai: {
        nombre: 2,
        dureeJours: 7,
        echeanceMiSession: true  // Flag pour expiration automatique
    }
}
```

---

## 📋 HELPER : Déterminer le type de travail

```javascript
/**
 * HELPER : Détermine le type de travail depuis une production
 *
 * Stratégies de matching :
 * 1. Champ explicite production.typeTravailSpec
 * 2. Matching par type de production (production.type)
 * 3. Matching par identifiant (production.identifiant)
 * 4. Matching par titre (production.titre)
 *
 * @param {Object} production - Production
 * @returns {string|null} Type de travail (ex: 'prise-position') ou null
 */
_determinerTypeTravail(production) {
    if (!production) return null;

    // Stratégie 1 : Champ explicite
    if (production.typeTravailSpec) {
        return production.typeTravailSpec;
    }

    // Stratégie 2 : Mapping depuis config (à configurer dans wizard)
    // Exemple : { 'artefact-portfolio': 'prise-position', 'examen': 'test' }
    const mappingTypes = this.config.mappingTypesProductions || {};
    if (mappingTypes[production.type]) {
        return mappingTypes[production.type];
    }

    // Stratégie 3 : Matching par mots-clés dans identifiant
    for (const type of this.config.typesTravauxTravaux) {
        const motsCles = type.motsClesMatching || [type.id];

        if (motsCles.some(mot => production.identifiant?.toLowerCase().includes(mot.toLowerCase()))) {
            return type.id;
        }

        if (motsCles.some(mot => production.titre?.toLowerCase().includes(mot.toLowerCase()))) {
            return type.id;
        }
    }

    console.warn('[SPEC] Type de travail non déterminable pour production:', production);
    return null;
}
```

---

## 🎨 WIZARD : Questions à poser

### Étape 1 : Types de travaux

**Question** : "Quels types de travaux les étudiants doivent-ils remettre ?"

**Interface** : Liste dynamique avec bouton "+ Ajouter un type"

**Formulaire par type** :
- Nom (ex: "Prises de position")
- Description (ex: "Textes argumentés sur enjeux scientifiques")
- Nombre total demandé (ex: 5)
- Peut être révisé ? (oui/non)
- Si oui : Nombre de révisions incluses (ex: 1 = 1 révision gratuite)
- Évaluation holistique ? (oui/non) - pour portfolios

**Exemple rempli (François)** :
```
Type 1 : Prises de position
  - Description : Textes argumentés sur enjeux scientifiques
  - Nombre : 5
  - Révisable : Oui
  - Révisions incluses : 1

Type 2 : Tests
  - Description : Évaluations écrites
  - Nombre : 2
  - Révisable : Oui
  - Révisions incluses : 1

Type 3 : Portfolio
  - Description : Collection d'entrées
  - Nombre : 1
  - Révisable : Oui
  - Révisions incluses : Illimité (999)
  - Holistique : Oui
```

### Étape 2 : Spécifications par type

**Question** : "Quelles sont les spécifications pour qu'une [type de travail] soit acceptable ?"

**Interface** : Pour chaque type créé à l'étape 1, liste de spécifications

**Formulaire par spécification** :
- Description (ex: "Au moins 750 mots")
- Type de vérification :
  - ☐ Manuelle (enseignant coche si respectée)
  - ☐ Automatique (ex: note >= seuil)
- Si automatique : Seuil numérique (ex: 60)

**Exemple rempli (François - Prises de position)** :
```
Spécification 1 : Longueur
  - Description : Environ 750 mots (ou équivalent audio/vidéo)
  - Vérification : Manuelle

Spécification 2 : Sources
  - Description : Au moins 2 sources fiables convenablement citées
  - Vérification : Manuelle

Spécification 3 : Faits
  - Description : Des faits établis tirés des sources étayent les arguments
  - Vérification : Manuelle
```

### Étape 3 : Table de correspondance (Bundles)

**Question** : "Combien de travaux acceptables pour quelle note ?"

**Interface** : Tableau interactif avec 3-4 paliers

**Formulaire par palier** :
- Note de A à F (lettres prédéfinies)
- Plage de pourcentage (ex: 80-100%)
- Note fixe attribuée (ex: 85%)
- Pour chaque type de travail : nombre requis
- Description (ex: "Excellence - Exploration maximale")

**Exemple rempli (François)** :
```
Palier A (80-100%) → Note fixe : 85%
  - Prises de position : 5 (tous les travaux)
  - Tests : 2
  - Portfolio : 1
  - Description : Excellence - Exploration maximale

Palier B (70-79%) → Note fixe : 75%
  - Prises de position : 3
  - Tests : 2
  - Portfolio : 1
  - Description : Bonne performance

Palier C (60-69%) → Note fixe : 65%
  - Prises de position : 1
  - Tests : 2
  - Portfolio : 1
  - Description : Réussite - Seuil minimal

Palier F (0-59%) → Note fixe : 50%
  - Description : Échec
```

### Étape 4 : Configuration jetons

**Question** : "Combien de jetons accordez-vous aux étudiants ?"

**Formulaire** :
- Jetons de délai :
  - Nombre (ex: 2)
  - Durée en jours (ex: 7)
  - ☐ Un jeton expire à mi-session

- Jetons de reprise :
  - Nombre (ex: 2)
  - Maximum par production (ex: 1)
  - ☐ Archiver l'originale lors de reprise

**Exemple rempli (François)** :
```
Jetons de délai : 2
  - Durée : 7 jours
  - ✓ Un jeton expire à mi-session

Jetons de reprise : 2
  - Maximum par production : 1
  - ✓ Archiver l'originale
```

### Étape 5 : Mapping productions ↔ types de travaux

**Question** : "Comment identifier automatiquement le type de travail depuis vos productions ?"

**Interface** : Table de matching

**Options** :
1. Par type de production (ex: "artefact-portfolio" → "Prises de position")
2. Par mots-clés dans identifiant/titre (ex: contient "test" → "Tests")
3. Manuellement lors de création d'évaluation

**Exemple rempli** :
```
Type de production "artefact-portfolio" → Prises de position
Type de production "examen" → Tests
Type de production "projet" → Portfolio
```

---

## 🧪 CAS D'USAGE : Exemple de François

### Configuration complète

```javascript
{
    typesTravauxTravaux: [
        {
            id: 'prise-position',
            nom: 'Prises de position',
            description: 'Textes argumentés sur enjeux scientifiques',
            nbTotal: 5,
            revisable: true,
            nbRevisionsIncluses: 1
        },
        {
            id: 'test',
            nom: 'Tests',
            nbTotal: 2,
            revisable: true,
            nbRevisionsIncluses: 1
        },
        {
            id: 'portfolio',
            nom: 'Portfolio',
            description: 'Collection d\'entrées',
            nbTotal: 1,
            revisable: true,
            nbRevisionsIncluses: 999,
            evaluationHolistique: true
        }
    ],

    specifications: {
        'prise-position': [
            { id: 'longueur', description: '~750 mots', typeVerification: 'manuelle' },
            { id: 'sources', description: '2+ sources fiables citées', typeVerification: 'manuelle' },
            { id: 'faits', description: 'Faits étayent arguments', typeVerification: 'manuelle' }
        ],
        'test': [
            { id: 'reussite', description: 'Score >= 60%', typeVerification: 'automatique', seuilNumerique: 60 }
        ],
        'portfolio': [
            { id: 'entrevue', description: 'Participation entrevue', typeVerification: 'manuelle' },
            { id: 'exploration', description: '5+ entrées', typeVerification: 'manuelle' }
        ]
    },

    tableBundles: [
        {
            note: { min: 80, max: 100, lettre: 'A' },
            requis: { 'prise-position': 5, 'test': 2, 'portfolio': 1 },
            description: 'Excellence',
            noteFixe: 85
        },
        {
            note: { min: 70, max: 79, lettre: 'B' },
            requis: { 'prise-position': 3, 'test': 2, 'portfolio': 1 },
            description: 'Bonne performance',
            noteFixe: 75
        },
        {
            note: { min: 60, max: 69, lettre: 'C' },
            requis: { 'prise-position': 1, 'test': 2, 'portfolio': 1 },
            description: 'Réussite',
            noteFixe: 65
        },
        {
            note: { min: 0, max: 59, lettre: 'F' },
            requis: null,
            description: 'Échec',
            noteFixe: 50
        }
    ],

    jetons: {
        delai: { nombre: 2, dureeJours: 7, echeanceMiSession: true },
        reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true }
    }
}
```

### Scénario étudiant : Alice

**Productions remises** :
- Prise de position #1 : ✅ Acceptable (3/3 spécifications respectées)
- Prise de position #2 : ❌ Non acceptable (sources manquantes)
- Prise de position #3 : ✅ Acceptable
- Prise de position #4 : ✅ Acceptable
- Test #1 : ✅ Acceptable (75%)
- Test #2 : ✅ Acceptable (82%)
- Portfolio : ✅ Acceptable (entrevue + 6 entrées)

**Calcul** :
```
Compteur travaux acceptables :
- Prises de position : 3 acceptables
- Tests : 2 acceptables
- Portfolio : 1 acceptable

Vérification paliers (du plus élevé au plus bas) :
- Palier A (5, 2, 1) : ❌ Seulement 3 prises de position (besoin 5)
- Palier B (3, 2, 1) : ✅ Tous requis satisfaits !

Note finale : 75% (Palier B)
```

**Défis détectés** :
- Prise de position #2 : Non acceptable (spécification "sources" manquante)
  - Révision possible : Oui (1 révision gratuite disponible)
- Pour atteindre Palier A : Besoin de 2 prises de position supplémentaires acceptables

---

## 🚀 PROCHAINES ÉTAPES D'IMPLÉMENTATION

1. ✅ Créer ce document de spécifications
2. ⏳ Retravailler `pratique-pan-specifications.js` avec nouvelle logique
3. ⏳ Créer wizard dans `pratiques.js` pour configurer
4. ⏳ Tester avec configuration de François
5. ⏳ Adapter pour Xavier (variante avec niveaux 1-4)

---

## 📚 RÉFÉRENCES

- **Nilson, L. B. (2014)**. *Specifications Grading: Restoring Rigor, Motivating Students, and Saving Faculty Time*. Stylus Publishing.

- **Arseneault-Hubert, F. (2025)**. "Exploration au pays des spécifications : Un exemple de notation par spécifications dans un cours d'exploration et d'orientation". Pratiques alternatives de notation.

- **Linda B. Nilson - Criterion 1** : Relier explicitement notes aux objectifs plutôt qu'aux travaux (référencé ligne 113 de l'article).

---

**FIN DU DOCUMENT DE SPÉCIFICATIONS**
