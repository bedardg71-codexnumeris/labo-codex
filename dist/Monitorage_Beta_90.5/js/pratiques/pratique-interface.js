/**
 * INTERFACE IPratique - Contrat pour toutes les pratiques de notation
 *
 * Ce fichier documente l'interface que TOUTES les pratiques doivent implémenter.
 * Il ne contient pas de code exécutable, seulement de la documentation.
 *
 * PRINCIPES :
 * - Universel : A-C-P-R, niveaux de risque, niveaux RàI → identiques pour toutes
 * - Spécifique : Calcul de P, détection défis, cibles RàI → propre à chaque pratique
 *
 * VERSION : 1.0
 * DATE : 11 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

// ============================================================================
// MÉTHODES D'IDENTITÉ
// ============================================================================

/**
 * obtenirNom() - Retourne le nom complet de la pratique
 *
 * @returns {string} Nom complet lisible par l'utilisateur
 *
 * @example
 * // PAN-Maîtrise
 * obtenirNom() => "PAN-Maîtrise"
 *
 * // Sommative
 * obtenirNom() => "Sommative traditionnelle"
 */

/**
 * obtenirId() - Retourne l'identifiant unique de la pratique
 *
 * @returns {string} Identifiant unique (kebab-case)
 *
 * @example
 * // PAN-Maîtrise
 * obtenirId() => "pan-maitrise"
 *
 * // Sommative
 * obtenirId() => "sommative"
 *
 * NOTE : Cet ID doit correspondre à la valeur dans localStorage.modalitesEvaluation.pratique
 */

/**
 * obtenirDescription() - Retourne une description complète de la pratique
 *
 * @returns {string} Description détaillée (1-3 phrases)
 *
 * @example
 * // PAN-Maîtrise
 * obtenirDescription() => "Pratique PAN-Maîtrise basée sur les N meilleurs artefacts..."
 *
 * // Sommative
 * obtenirDescription() => "Pratique sommative traditionnelle avec moyenne pondérée..."
 */

// ============================================================================
// MÉTHODES DE CALCUL
// ============================================================================

/**
 * calculerPerformance(da) - Calcule l'indice P (Performance)
 *
 * Cette méthode est SPÉCIFIQUE à chaque pratique :
 * - PAN-Maîtrise : Moyenne des N meilleurs artefacts
 * - Sommative : Moyenne pondérée de TOUTES les évaluations
 *
 * @param {string} da - Numéro de dossier d'admission (7 chiffres)
 * @returns {number} Indice P entre 0 et 1 (ex: 0.78 pour 78%)
 *
 * @example
 * // PAN-Maîtrise (3 meilleurs artefacts: 85%, 80%, 75%)
 * calculerPerformance("1234567") => 0.80
 *
 * // Sommative (toutes évaluations pondérées)
 * calculerPerformance("1234567") => 0.72
 *
 * IMPORTANT :
 * - Exclure les évaluations remplacées (remplaceeParId !== null)
 * - Inclure les jetons de reprise (repriseDeId !== null)
 * - Respecter les pondérations des productions
 * - Retourner null si aucune évaluation disponible
 */

/**
 * calculerCompletion(da) - Calcule l'indice C (Complétion)
 *
 * Cette méthode peut être UNIVERSELLE ou SPÉCIFIQUE :
 * - Par défaut : Nombre remis / Total attendu (toutes productions)
 * - PAN-Maîtrise : Peut se limiter aux artefacts portfolio
 * - Sommative : Inclut toutes les productions
 *
 * @param {string} da - Numéro de dossier d'admission (7 chiffres)
 * @returns {number} Indice C entre 0 et 1 (ex: 0.85 pour 85%)
 *
 * @example
 * // 8 productions remises sur 10 attendues
 * calculerCompletion("1234567") => 0.80
 *
 * // Toutes productions remises
 * calculerCompletion("1234567") => 1.00
 *
 * IMPORTANT :
 * - Ne compter que les productions avec statut "evalue" ou "en-cours"
 * - Ne pas compter les productions "non-remis"
 * - Respecter les productions facultatives si applicable
 */

// ============================================================================
// MÉTHODES D'ANALYSE
// ============================================================================

/**
 * detecterDefis(da) - Détecte les défis spécifiques de l'étudiant
 *
 * Cette méthode est SPÉCIFIQUE à chaque pratique :
 * - PAN-Maîtrise : Défis SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
 * - Sommative : Défis génériques (notes faibles, tendance baisse, irrégularité)
 *
 * @param {string} da - Numéro de dossier d'admission (7 chiffres)
 * @returns {Object} Défis identifiés
 *
 * @example
 * // PAN-Maîtrise (défis SRPNF)
 * detecterDefis("1234567") => {
 *   type: 'srpnf',
 *   defis: [
 *     { critere: 'Nuance', moyenne: 0.68, seuil: 0.75, priorite: 'haute' },
 *     { critere: 'Rigueur', moyenne: 0.72, seuil: 0.75, priorite: 'moyenne' }
 *   ],
 *   forces: [
 *     { critere: 'Structure', moyenne: 0.82 },
 *     { critere: 'Français', moyenne: 0.85 }
 *   ]
 * }
 *
 * // Sommative (défis génériques)
 * detecterDefis("1234567") => {
 *   type: 'generique',
 *   defis: [
 *     { production: 'Examen 2', note: 0.58, seuil: 0.60, priorite: 'haute' },
 *     { tendance: 'baisse', variation: -0.15, priorite: 'moyenne' }
 *   ]
 * }
 *
 * IMPORTANT :
 * - Retourner un objet vide {} si aucun défi détecté
 * - Inclure le 'type' pour permettre l'affichage adapté
 * - Trier les défis par priorité (haute → basse)
 */

/**
 * identifierPattern(da) - Identifie le pattern d'apprentissage de l'étudiant
 *
 * Cette méthode peut être UNIVERSELLE ou SPÉCIFIQUE :
 * - Pattern basé sur les indices A, C, P
 * - Peut être adapté selon les seuils de chaque pratique
 *
 * @param {string} da - Numéro de dossier d'admission (7 chiffres)
 * @returns {Object} Pattern identifié
 *
 * @example
 * // Pattern universel
 * identifierPattern("1234567") => {
 *   type: 'blocage-critique',
 *   description: 'Blocage critique - Risque d\'échec élevé',
 *   indices: { A: 0.55, C: 0.60, P: 0.58 },
 *   couleur: '#d32f2f',
 *   recommandation: 'Intervention intensive immédiate (Niveau 3)'
 * }
 *
 * identifierPattern("7654321") => {
 *   type: 'progression',
 *   description: 'Progression solide - Maîtrise en développement',
 *   indices: { A: 0.92, C: 0.88, P: 0.85 },
 *   couleur: '#388e3c',
 *   recommandation: 'Maintenir l\'engagement et encourager'
 * }
 *
 * PATTERNS STANDARDS :
 * - blocage-critique : P < 60% OU Risque > 70%
 * - blocage-emergent : A ≥ 75% mais C ou P < 65%
 * - defi-specifique : P entre 70-80% avec défis identifiés
 * - stable : P entre 80-85% sans défis majeurs
 * - progression : P > 85% avec engagement soutenu
 */

/**
 * genererCibleIntervention(da) - Génère une cible d'intervention RàI personnalisée
 *
 * Cette méthode est SPÉCIFIQUE à chaque pratique :
 * - PAN-Maîtrise : Cible un critère SRPNF faible
 * - Sommative : Cible une production faible à refaire
 *
 * @param {string} da - Numéro de dossier d'admission (7 chiffres)
 * @returns {Object} Cible d'intervention
 *
 * @example
 * // PAN-Maîtrise (cible SRPNF)
 * genererCibleIntervention("1234567") => {
 *   type: 'critere-srpnf',
 *   critere: 'Nuance',
 *   niveau_actuel: 0.68,
 *   niveau_cible: 0.75,
 *   strategies: [
 *     'Identifier les nuances dans les exemples fournis',
 *     'Pratiquer l\'analyse comparative (forces ET limites)',
 *     'Utiliser des marqueurs de nuance (toutefois, néanmoins, etc.)'
 *   ],
 *   ressources: [
 *     'Capsule vidéo : Analyser avec nuance',
 *     'Grille d\'auto-évaluation : Critère Nuance'
 *   ]
 * }
 *
 * // Sommative (cible production)
 * genererCibleIntervention("1234567") => {
 *   type: 'production-faible',
 *   production: 'Examen 2',
 *   note_actuelle: 0.58,
 *   note_cible: 0.70,
 *   strategies: [
 *     'Réviser les concepts de la section 3',
 *     'Refaire les exercices du chapitre 5',
 *     'Participer aux séances de révision'
 *   ],
 *   echeance: 'Jeton de reprise disponible jusqu\'au 2025-11-25'
 * }
 *
 * IMPORTANT :
 * - Retourner null si aucune intervention nécessaire
 * - Adapter les stratégies selon le niveau de risque
 * - Inclure des ressources concrètes et actionnables
 * - Respecter le niveau RàI (1-Universel, 2-Préventif, 3-Intensif)
 */

// ============================================================================
// STRUCTURES DE DONNÉES
// ============================================================================

/**
 * STRUCTURE : Modalités d'évaluation (localStorage.modalitesEvaluation)
 *
 * {
 *   pratique: "pan-maitrise" | "sommative" | "pan-specifications" | "denotation",
 *   afficherSommatif: boolean,    // Afficher calculs sommatifs
 *   afficherAlternatif: boolean,  // Afficher calculs alternatifs
 *
 *   // Configuration PAN-Maîtrise
 *   configPAN: {
 *     nombreCours: 3 | 7 | 12,      // Nombre de cours dans le programme
 *     nombreARetenir: number         // N meilleurs artefacts (ex: 3)
 *   },
 *
 *   // Seuils d'interprétation (universel)
 *   seuils: {
 *     fragile: 0.70,   // 70%
 *     acceptable: 0.80, // 80%
 *     bon: 0.85        // 85%
 *   }
 * }
 */

/**
 * STRUCTURE : Indices CP (localStorage.indicesCP)
 *
 * {
 *   "1234567": {  // DA de l'étudiant
 *     actuel: {
 *       SOM: {  // Sommative
 *         C: 0.80,  // Complétion
 *         P: 0.72,  // Performance
 *         details: {
 *           nbRemis: 8,
 *           nbTotal: 10,
 *           moyennePonderee: 0.72,
 *           evaluations: [...]
 *         }
 *       },
 *       PAN: {  // PAN-Maîtrise
 *         C: 0.75,
 *         P: 0.80,
 *         details: {
 *           nbArtefactsRetenus: 3,
 *           nbArtefactsDisponibles: 5,
 *           moyenneArtefacts: 0.80,
 *           artefacts: [...]
 *         }
 *       }
 *     },
 *     historique: [...]  // Snapshots hebdomadaires
 *   }
 * }
 */

/**
 * STRUCTURE : Évaluation
 *
 * {
 *   id: string,             // ID unique
 *   da: string,             // Numéro DA (7 chiffres)
 *   productionId: string,   // ID de la production
 *   date: string,           // Date d'évaluation (YYYY-MM-DD)
 *
 *   // Notes
 *   noteTotale: number,     // Note finale (0-1)
 *   niveauFinal: string,    // Niveau IDME ('I', 'D', 'M', 'E', '0')
 *
 *   // Critères (si grille SRPNF)
 *   criteres: {
 *     structure: number,    // 0-1
 *     rigueur: number,      // 0-1
 *     plausibilite: number, // 0-1
 *     nuance: number,       // 0-1
 *     francais: number      // 0-1
 *   },
 *
 *   // Jetons
 *   repriseDeId: string | null,    // ID évaluation remplacée
 *   remplaceeParId: string | null, // ID évaluation remplaçante
 *
 *   // Rétroaction
 *   commentaire: string,
 *   cartouches: [...]
 * }
 */

// ============================================================================
// NOTES D'IMPLÉMENTATION
// ============================================================================

/**
 * RÈGLES IMPORTANTES :
 *
 * 1. LECTURE DES DONNÉES
 *    - Lire depuis localStorage uniquement
 *    - Ne jamais modifier les données dans les méthodes de calcul
 *    - Retourner null si données manquantes
 *
 * 2. GESTION DES ERREURS
 *    - Valider le DA (7 chiffres, existant)
 *    - Gérer les cas où aucune évaluation disponible
 *    - Retourner des valeurs par défaut sécuritaires
 *
 * 3. PERFORMANCE
 *    - Minimiser les lectures localStorage (cache si possible)
 *    - Éviter les boucles imbriquées inutiles
 *    - Retourner rapidement si conditions non remplies
 *
 * 4. COMPATIBILITÉ
 *    - Ne pas dépendre d'autres pratiques
 *    - Utiliser uniquement les données universelles (étudiants, évaluations, productions)
 *    - Respecter le contrat d'interface strictement
 *
 * 5. EXTENSIBILITÉ
 *    - Documenter les calculs et formules utilisés
 *    - Permettre la configuration via modalitesEvaluation
 *    - Faciliter l'ajout de nouvelles pratiques similaires
 */

// ============================================================================
// EXEMPLE D'IMPLÉMENTATION MINIMALE
// ============================================================================

/**
 * class PratiqueExemple {
 *
 *   // Identité
 *   obtenirNom() { return "Exemple"; }
 *   obtenirId() { return "exemple"; }
 *   obtenirDescription() { return "Pratique d'exemple pour tests"; }
 *
 *   // Calculs
 *   calculerPerformance(da) {
 *     // Valider DA
 *     if (!da || da.length !== 7) return null;
 *
 *     // Lire évaluations
 *     const evaluations = this._lireEvaluations(da);
 *     if (evaluations.length === 0) return null;
 *
 *     // Calculer moyenne simple
 *     const total = evaluations.reduce((sum, e) => sum + e.noteTotale, 0);
 *     return total / evaluations.length;
 *   }
 *
 *   calculerCompletion(da) {
 *     // Logique similaire...
 *   }
 *
 *   // Analyse
 *   detecterDefis(da) {
 *     // Retourner structure défis
 *     return { type: 'generique', defis: [], forces: [] };
 *   }
 *
 *   identifierPattern(da) {
 *     // Retourner pattern basé sur A-C-P
 *     return { type: 'stable', description: '...', couleur: '#...' };
 *   }
 *
 *   genererCibleIntervention(da) {
 *     // Retourner cible RàI
 *     return { type: 'production-faible', strategies: [...] };
 *   }
 *
 *   // Helpers privés
 *   _lireEvaluations(da) {
 *     // Implémentation...
 *   }
 * }
 */

// ============================================================================
// FIN DE L'INTERFACE
// ============================================================================

export {}; // Marquer comme module ES6
