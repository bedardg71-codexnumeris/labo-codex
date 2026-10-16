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
    'conception': [
        // « Apporter mon matériel » (16 oct. 2026, lot 1) EN TÊTE : la navigation affiche la
        // première sous-section à l'ouverture d'un onglet (navigation.js, afficherSousNavigation),
        // c'est donc elle qui accueille qui ouvre Conception. Autorisation de toucher cette zone
        // protégée : décision de Grégoire du 15 oct. 2026, 16 h 15-16 h 17, consignée au cadrage
        // (plans de travail/CADRAGE-2026-10-15-apporter-mon-materiel.md, décision 1).
        { id: 'materiel', label: 'Apporter mon matériel' },
        // Renommé le 9 août 2026 (#426) : les six onglets voisins de Conception
        // nomment un OBJET de travail ; seul celui-ci nommait une théorie. Et
        // « carte d'alignement » est déjà le mot de l'app (le guide intégré
        // s'intitule « Construis ta carte d'alignement »). Autorisation de
        // toucher cette zone protégée : décision de Grégoire du 8 août 2026,
        // consignée à l'audit. `noms_stables.json` protège le NOM de la
        // constante `configurationsOnglets`, pas la valeur des libellés.
        { id: 'carte', label: "Carte d'alignement" },
        // « Plan de la leçon » RETIRÉ le 8 août 2026 (#424 Lot G) : ses exports
        // et sa rétroaction formative vivent dans la Carte (menu Actions +
        // Inspecteur). Autorisation de toucher cette zone protégée : plan de
        // chantier acté par Grégoire (PLAN-portage-exports-carte-2026-08-08.md).
        { id: 'productions', label: 'Productions étudiantes' },
        { id: 'grille-criteres', label: 'Grilles de critères' },
        { id: 'echelle-performance', label: 'Échelles de performance' },
        { id: 'retroactions', label: 'Cartouches de rétroaction' },
        { id: 'pratiques-notation', label: 'Pratiques de notation' }
    ],
    'calendrier': [
        { id: 'trimestre', label: 'Trimestre' },
        { id: 'vue', label: 'Calendrier scolaire' }
    ],
    'suivi': [
        { id: 'groupe', label: 'Suivi du groupe' },
        { id: 'liste', label: 'Liste des étudiant·es' },
        { id: 'saisie', label: 'Saisie des présences' },
        { id: 'profil', label: 'Profils individuels' },
        { id: 'interventions', label: 'Interventions' },
        // Cadrage « Rencontres » (12 sept. 2026, autorisation de Grégoire pour cette zone protégée) :
        // les rencontres d'un service — ou d'un groupe-cours — tenues dans l'app, vocabulaire « rencontre ».
        { id: 'rencontres', label: 'Rencontres' },
        { id: 'animation', label: 'Animation' }
    ],
    'evaluations': [
        { id: 'importer', label: 'Préparer et importer' },
        { id: 'liste', label: 'Liste des évaluations' },
        { id: 'annoter', label: 'Annoter et évaluer' },
        { id: 'exporter', label: 'Exporter les travaux' }
    ],
    'labo': [
        { id: 'accompagnement', label: "Outils d'observation" },
        { id: 'modelisation', label: 'Modélisation' },
        { id: 'comparateur', label: 'Exploration des pratiques' },
        { id: 'rythme', label: 'Rythme de travail' },
        { id: 'etudes', label: 'Études' },
        { id: 'bilan', label: 'Bilan réflexif' },
        { id: 'longitudinal', label: 'Suivi longitudinal' } // #915 — nom tranché par Grégoire le 17 sept. 2026 ; entrée autorisée par lui le même soir
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
        { id: 'donnees', label: 'Données' },
        { id: 'a-propos', label: 'À propos' }
    ]
};

/* ===============================
   🚧 FLAG D'AFFICHAGE — COMPARATEUR DE PRATIQUES (#345 / #326)
   Masqué le 21 juin 2026 (#345) le temps que les écarts terrain #326-T1 à T5
   (Retours des testeurs/SUIVI-BUGS.md) soient traités.
   RÉACTIVÉ le 28 juin 2026 : T1-T5 livrés et validés sur Mac + iPad (2 modes).
   Le flag reste en place — repasser à `false` re-masque les entrées visibles
   (le code et la page restent toujours présents, masquage réversible).

   Entrées gérées par le flag (masquées quand false) :
   - entrée nav « Labo › Exploration des pratiques » (navigation.js,
     afficherSousNavigation) ;
   - lien « Ouvrir le comparateur du Labo » au récap du wizard
     (wizard-pratique-v2.js) ;
   - bannière « Gérer mes maquettes » (pratiques-gestion.js).
   =============================== */
const COMPARATEUR_VISIBLE = true;

/* ===============================
   🔄 VARIABLES GLOBALES D'ÉTAT
   Suivent l'état actuel de la navigation et de l'interface
   PROTÉGÉ - Ne pas modifier
   =============================== */

/**
 * Section actuellement affichée
 * Valeurs possibles: 'accueil' | 'conception' | 'calendrier' | 'suivi' | 'evaluations' | 'labo' | 'aide' | 'reglages'
 *
 * UTILISÉ PAR:
 * - afficherSection() pour mettre à jour l'état
 * - Diverses fonctions pour déterminer le contexte actuel
 *
 * ⚠️ NE PAS MODIFIER - Référencé dans noms_stables.json
 */
let sectionActive = 'accueil';

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
 * Variable globale pour édition de cours (résidu legacy Beta 95).
 * Plus aucun caller actif depuis le chantier Phase 2 cascade legacy 95
 * (22 mai 2026). Conservée ici (Zone protégée CLAUDE.md) en attendant
 * un retrait autorisé dans un chantier futur dédié à config.js.
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
 * - Utilise textContent pour échapper &, < et >
 * - Échappe ENSUITE les guillemets, que le navigateur ne touche pas
 *
 * EXEMPLE:
 * echapperHtml('<script>alert("XSS")</script>')
 * // Retourne: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 *
 * ⚠️ SÛRE EN CONTEXTE D'ATTRIBUT depuis le 28 août 2026 (#572). Avant cette
 * date, `textContent → innerHTML` laissait passer `"` et `'` : une valeur
 * interpolée dans un `data-*`, un `title` ou un `style` pouvait refermer
 * l'attribut et en injecter d'autres. La règle 1 du projet applique cette
 * fonction aux deux contextes — texte ET attribut — donc elle tient le plus
 * strict des deux.
 * ⮕ Ce n'est PAS une licence pour interpoler du contenu utilisateur dans un
 * attribut sans guillemets : `<div data-x=${valeur}>` reste cassable par une
 * simple espace. Les attributs se citent, toujours.
 *
 * ⚠️ NE PAS MODIFIER - Fonction de sécurité critique
 * (modification du 28 août 2026 faite sur autorisation explicite de Grégoire,
 * zone protégée `js/config.js`)
 */
function echapperHtml(texte) {
    if (texte == null) return '';
    const div = document.createElement('div');
    div.textContent = String(texte);
    // #572 — `textContent → innerHTML` échappe `&`, `<` et `>`, mais PAS les
    // guillemets : le navigateur n'a pas besoin de les échapper dans du texte.
    // Or la règle 1 du projet applique cette fonction aussi à des valeurs
    // interpolées DANS DES ATTRIBUTS (`data-*`, `title`, `style`), où un `"`
    // referme l'attribut et laisse injecter les suivants. Une seule fonction
    // sert les deux usages : elle doit tenir le plus strict des deux.
    // Autorisation explicite de Grégoire (28 août 2026) pour cette zone protégée.
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
 * - 14-utilitaires.js (utilise echapperHtml)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé EN PREMIER car il définit les variables globales
 * utilisées par tous les autres modules.
 * 
 * LOCALSTORAGE UTILISÉ:
 * Aucun dans ce module (les données sont en mémoire uniquement)
 */