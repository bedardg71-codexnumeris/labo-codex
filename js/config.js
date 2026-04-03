/* ===============================
   MODULE 01: CONFIGURATION ET VARIABLES GLOBALES
   Index: 50 10-10-2025a
   
   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   INTERDICTION ABSOLUE de modifier le code de ce module.
   Seuls les commentaires peuvent être modifiés/ajoutés.
   
   Contenu de ce module:
   - Configuration de la navigation (sections/sous-sections)
   - Variables globales d'état
   - Données de démonstration
   - Fonction de sécurité XSS
   =============================== */

/* ===============================
   📋 CONFIGURATION DE LA NAVIGATION
   Définit toutes les sections et sous-sections de l'application
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * Configuration complète des onglets et sous-sections
 * Structure: { 'section-id': [{ id: 'sous-section-id', label: 'Libellé' }, ...] }
 * 
 * UTILISÉ PAR:
 * - afficherSousNavigation() pour générer les boutons
 * - afficherSousSection() pour l'affichage conditionnel
 * 
 * ⚠️ NE PAS MODIFIER - Référencé dans noms_stables.json
 */
const configurationsOnglets = {
    // ✨ RÉORGANISATION NAVIGATION (3 avril 2026, Tier 5.7)
    // Ancien: 9 sections / 34 sous-sections (dont 4 Aperçus)
    // Nouveau: 9 sections / 30 sous-sections
    // Sections supprimées: tableau-bord, presences, construction, planification
    // Sections créées: apercu (plate), structure, contexte, suivi
    'accueil': [],
    'apercu': [],
    'structure': [
        { id: 'carte', label: 'Alignement pédagogique' },
        { id: 'organisateur', label: 'Plan de la leçon' },
        { id: 'productions', label: 'Productions étudiantes' },
        { id: 'grille-criteres', label: 'Grilles de critères' },
        { id: 'echelle-performance', label: 'Échelles de performance' },
        { id: 'retroactions', label: 'Cartouches de rétroaction' }
    ],
    'contexte': [
        { id: 'trimestre', label: 'Trimestre' },
        { id: 'calendrier', label: 'Vue calendaire' },
        { id: 'pratiques-notation', label: 'Pratiques de notation' },
        { id: 'bilan', label: 'Bilan réflexif' }
    ],
    'suivi': [
        { id: 'liste', label: 'Liste des élèves' },
        { id: 'saisie', label: 'Saisie des présences' },
        { id: 'profil', label: 'Profils individuels' },
        { id: 'interventions', label: 'Interventions' },
        { id: 'labo', label: 'Labo' }
    ],
    'evaluations': [
        { id: 'importer', label: 'Préparer et importer' },
        { id: 'liste', label: 'Liste des évaluations' },
        { id: 'annoter', label: 'Annoter et évaluer' },
        { id: 'exporter', label: 'Exporter et archiver' }
    ],
    'boite-outils': [
        { id: 'tirage', label: 'Tirage au sort' },
        { id: 'modelisation', label: 'Modélisation' }
    ],
    'aide': [
        { id: 'introduction', label: 'Introduction' },
        { id: 'configuration', label: 'Configuration' },
        { id: 'formation', label: 'Formation et démonstration' },
        { id: 'utilisation', label: 'Utilisation hebdomadaire' },
        { id: 'consultation', label: 'Consultation' },
        { id: 'reference', label: 'Référence rapide' }
    ],
    'reglages': [
        { id: 'preferences', label: 'Préférences' },
        { id: 'depistage', label: 'Dépistage' },
        { id: 'donnees', label: 'Données' },
        { id: 'a-propos', label: 'À propos' }
    ]
};

/* ===============================
   🔄 VARIABLES GLOBALES D'ÉTAT
   Suivent l'état actuel de la navigation et de l'interface
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * Section actuellement affichée
 * Valeurs possibles: 'accueil' | 'apercu' | 'structure' | 'contexte' | 'suivi' | 'evaluations' | 'boite-outils' | 'aide' | 'reglages'
 *
 * UTILISÉ PAR:
 * - afficherSection() pour mettre à jour l'état
 * - Diverses fonctions pour déterminer le contexte actuel
 *
 * ⚠️ NE PAS MODIFIER - Référencé dans noms_stables.json
 */
let sectionActive = 'apercu';

/**
 * Sous-section actuellement affichée
 * Format: 'section-sous-section' (ex: 'etudiants-liste', 'reglages-productions')
 * Valeur: null si aucune sous-section n'est active
 * 
 * UTILISÉ PAR:
 * - afficherSousSection() pour mettre à jour l'état
 * - Logique conditionnelle d'affichage
 * 
 * ⚠️ NE PAS MODIFIER - Référencé dans noms_stables.json
 */
let sousSectionActive = null;

/* ===============================
   📝 VARIABLES POUR GESTION DES PRODUCTIONS ET ÉVALUATIONS
   Suivent l'état des formulaires et des données en cours d'édition
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * ID de la production actuellement en cours d'édition
 * Valeur: string (ID de la production) | null si création d'une nouvelle production
 * 
 * UTILISÉ PAR:
 * - afficherFormProduction() pour charger les données
 * - sauvegarderProductionProduction() pour savoir si c'est une création ou modification
 */
let productionEnEdition = null;

/**
 * Objet contenant l'évaluation en cours
 * Structure: { etudiantId, productionId, grilleId, echelleId, cartoucheId, criteres: {} }
 * Valeur: null si aucune évaluation en cours
 * 
 * UTILISÉ PAR:
 * - chargerProduction() pour initialiser
 * - Fonctions d'évaluation pour stocker temporairement les données
 * - sauvegarderEvaluation() pour persister dans localStorage
 */
let evaluationEnCours = null;

/**
 * Objet contenant la grille de critères actuellement en cours de création/modification
 * Structure: { id, nom, criteres: [...], dateCreation, baseSur }
 * Valeur: null si aucune grille en cours
 * 
 * UTILISÉ PAR:
 * - Fonctions de gestion des grilles de critères
 */
let grilleActuelle = null;

/**
 * Objet contenant le template de grille actuellement chargé
 * Permet de dupliquer/modifier une grille existante
 * Valeur: null si aucun template chargé
 * 
 * UTILISÉ PAR:
 * - dupliquerGrille() pour créer une copie
 * - chargerGrilleTemplate() pour modification
 */
let grilleTemplateActuelle = null;

/**
 * Objet contenant la cartouche de rétroaction actuellement en cours d'édition
 * Structure: { id, nom, evalId, commentaires: {}, verrouille }
 * Valeur: null si aucune cartouche en cours
 * 
 * UTILISÉ PAR:
 * - Fonctions de gestion des cartouches de rétroaction
 * - chargerMatriceRetroaction() pour afficher
 * - sauvegarderCartouche() pour persister
 */
let cartoucheActuel = null;

/**
 * Variables globales pour les filtres d'évaluations
 * Conservent l'état des filtres entre les appels
 * 
 * UTILISÉ PAR:
 * - appliquerFiltresEvaluations() pour filtrer la liste
 */
let filtreGroupeMemoire = '';
let filtreTypeProductionMemoire = '';

/**
 * Variable globale pour édition de cours
 * ID du cours actuellement en cours d'édition
 * Valeur: null si création d'un nouveau cours
 * 
 * UTILISÉ PAR:
 * - afficherFormCours() pour charger les données
 * - sauvegarderCours() pour savoir si c'est une création ou modification
 */
let coursEnEdition = null;

/* ===============================
   👥 DONNÉES DE DÉMONSTRATION
   Liste d'étudiants fictifs pour le développement et les tests
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * Liste des étudiants de démonstration
 * Structure: [{ id, da, nom, prenom, statut }, ...]
 * 
 * UTILISÉ PAR:
 * - initialiserDonneesDemonstration() pour peupler les tableaux
 * - chargerDetailEtudiant() pour afficher les détails
 * 
 * ⚠️ NE PAS MODIFIER - Référencé dans noms_stables.json
 * Note: En production, ces données seront remplacées par les vraies données du localStorage
 */
const listeEtudiants = [
    { id: 1, da: '1234567', nom: 'Beaulieu', prenom: 'Emma', statut: 'actif' },
    { id: 2, da: '1234568', nom: 'Bélanger', prenom: 'Jacob', statut: 'actif' },
    { id: 3, da: '1234569', nom: 'Bergeron', prenom: 'Rosalie', statut: 'actif' },
    { id: 4, da: '1234570', nom: 'Bouchard', prenom: 'Thomas', statut: 'actif' },
    { id: 5, da: '1234571', nom: 'Boucher', prenom: 'Charles', statut: 'actif' },
    { id: 6, da: '1234572', nom: 'Côté', prenom: 'Florence', statut: 'actif' },
    { id: 7, da: '1234573', nom: 'Dubois', prenom: 'Olivier', statut: 'actif' }
];

/* ===============================
   🛡️ FONCTION DE SÉCURITÉ
   Protection contre les injections XSS
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * Échappe les caractères HTML pour prévenir les injections XSS
 * Convertit les caractères spéciaux en entités HTML
 * 
 * @param {string} texte - Texte à échapper
 * @returns {string} - Texte échappé et sécurisé
 * 
 * UTILISÉ PAR:
 * - Toutes les fonctions qui affichent du contenu utilisateur
 * - Formulaires et zones de texte
 * 
 * FONCTIONNEMENT:
 * - Crée un élément div temporaire
 * - Utilise textContent pour échapper automatiquement
 * - Retourne le innerHTML sécurisé
 * 
 * EXEMPLE:
 * echapperHtml('<script>alert("XSS")</script>')
 * // Retourne: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 * 
 * ⚠️ NE PAS MODIFIER - Fonction de sécurité critique
 */
function echapperHtml(texte) {
    if (!texte) return '';
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - Aucune (module autonome)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - 02-navigation.js (utilise configurationsOnglets, sectionActive, sousSectionActive)
 * - 03-etudiants.js (utilise listeEtudiants)
 * - 04-productions.js (utilise productionEnEdition, evaluationEnCours)
 * - 05-grilles.js (utilise grilleActuelle, grilleTemplateActuelle)
 * - 07-cartouches.js (utilise cartoucheActuel)
 * - 08-cours.js (utilise coursEnEdition)
 * - 14-utilitaires.js (utilise echapperHtml)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé EN PREMIER car il définit les variables globales
 * utilisées par tous les autres modules.
 * 
 * LOCALSTORAGE UTILISÉ:
 * Aucun dans ce module (les données sont en mémoire uniquement)
 */