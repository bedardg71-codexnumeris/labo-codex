/* ===============================
   MODULE 12: PRATIQUES DE NOTATION
   Index: 50 10-10-2025a → Modularisation
   Étendu le 20 octobre 2025 pour supporter les options d'affichage

   ÉCRITURES pratiquesConfigurables : migration (jetons, établissements),
   modification (config, wizard, bibliothèque), suppression, partage CC

   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la configuration du système de notation
   du cours (traditionnelle ou alternative) ET les options
   d'affichage des indices au tableau de bord.
   
   Contenu de ce module:
   - Configuration pratique de notation (sommative/alternative)
   - Gestion des types de PAN (maîtrise/spécifications/dénotation)
   - Options d'affichage des indices (sommatif/alternatif/les deux)
   - Affichage des informations contextuelles
   - Sauvegarde et chargement des modalités
   - Mise à jour du statut de configuration
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Éléments HTML requis:
   - #pratiqueNotation : Select pour choisir la pratique
   - #colonnePAN : Conteneur pour le type de PAN
   - #typePAN : Select pour choisir le type de PAN
   - #infoPAN : Zone d'information sur le PAN choisi
   - #optionsAffichageIndices : Conteneur des options d'affichage
   - #statutModalites : Zone d'affichage du statut
   - #btnSauvegarderPratiqueNotation : Bouton de sauvegarde
   
   LocalStorage utilisé:
   - 'modalitesEvaluation' (clé namespacée, via le module propriétaire
     js/pratiques/modalites-evaluation.js) : configuration complète
   =============================== */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * A-2 4d : normalisation à la lecture d'un identifiant de pratique.
 * Les comparaisons d'ids doivent rester correctes que la donnée soit legacy
 * ('pan-standards', 'alternative'…) OU déjà canonisée ('standards'…).
 * Guard `typeof` car pratique-registre.js peut être chargé après ce fichier ;
 * au runtime (handlers) il est présent.
 * NB #328 L2-b2 : le miroir modalites.pratique n'existe plus — la pratique
 * active se dérive de la SSOT via obtenirIdPratiqueActive (id) et
 * obtenirTypePratiqueActive (type canonique).
 * @param {string} p - identifiant éventuellement legacy
 * @returns {string} forme canonique (ou l'entrée telle quelle)
 */
function _normPratique(p) {
    return (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(p) : p);
}

/**
 * Migre les pratiques existantes pour ajouter les configurations spécifiques
 * ✅ NOUVEAU (9 décembre 2025)
 *
 * Ajoute les champs affichage, portfolio et jetons à toutes les pratiques
 * qui n'en ont pas encore, avec des valeurs par défaut.
 */
function migrerConfigurationsSpecifiques() {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const migrationEffectuee = db.getSync('migrationConfigsSpecifiques', false);

    if (migrationEffectuee) {
        return;
    }

    let nbMigrees = 0;

    pratiques.forEach(p => {
        if (!p.config) {
            p.config = {};
        }

        // Ajouter portfolio si manquant
        if (!p.config.portfolio) {
            p.config.portfolio = {
                actif: true,
                nombreARetenir: 5,
                minimumCompletion: 7,
                methodeSelection: 'meilleurs'
            };
        }

        // Ajouter jetons si manquant
        if (!p.config.jetons) {
            p.config.jetons = {
                actif: true,
                delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
                reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
                nombreParEleve: 2,  // 🆕 Beta 95.7 : défaut 2 jetons
                typesPersonnalises: []
            };
        }
    });

    if (nbMigrees > 0) {
        db.setSync(cle('pratiquesConfigurables'), pratiques);
        db.setSync('migrationConfigsSpecifiques', true);
    } else {
        db.setSync('migrationConfigsSpecifiques', true);
    }
}

/**
 * Initialise le module des pratiques de notation
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Attache les événements aux éléments
 * 3. Charge les modalités sauvegardées
 * 4. Met à jour le statut d'affichage
 *
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModulePratiques() {

    // Vérifier que nous sommes dans la bonne section
    // ✅ MODIFIÉ (9 décembre 2025) : Vérifier listePratiquesSidebar au lieu de listePratiques
    const listePratiquesSidebar = document.getElementById('listePratiquesSidebar');
    if (!listePratiquesSidebar) {
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
    if (PratiqueManager && PratiqueManager.migrerVersBibliotheque) {
        PratiqueManager.migrerVersBibliotheque();
    }

    // ✅ NOUVEAU (9 décembre 2025) : Migration configs spécifiques par pratique
    migrerConfigurationsSpecifiques();

    // ✅ AJOUT (8 décembre 2025) : Afficher la sidebar avec les pratiques de la bibliothèque
    afficherListePratiquesSidebar();

    // BETA 92: Afficher la liste des pratiques configurables
    afficherListePratiques();

    // Initialiser les règles de conformité (événements checkbox)
    initialiserReglesConformite();


    // (#436 G2-b : `migrerConfigurationPortfolio()` retirée — elle alimentait le
    //  miroir `configPAN.portfolio`, que plus personne ne lit. La SSOT est
    //  `pratiquesConfigurables[id].configuration.portfolio`.)

    // 🎨 Mettre à jour l'interface de la pratique par défaut
    mettreAJourUIPratiqueDefaut();

    // ⛔ #806 (9 sept. 2026) — PORTILLON `db-ready` RETIRÉ : IL NE GARDAIT RIEN.
    //
    // Il rechargeait `#grilleReferenceDepistage` et `#activerCategorisationErreurs`
    // au `db-ready`. Ces deux identifiants N'EXISTENT NULLE PART dans le HTML :
    // le sélecteur de grille de dépistage s'appelle `#v2-pref-grille-reference`
    // depuis sa migration vers « Labo → Outils d'observation », et il est servi
    // par `preferences-v2.js`, qui a son propre portillon.
    //
    // ⮕ CE N'EST PAS UN NETTOYAGE COSMÉTIQUE. Ce bloc portait le correctif #414
    // — la course d'hydratation d'IndexedDB — et le portait sur une cible morte.
    // Il donnait donc à lire que la course était fermée pour ce réglage, alors
    // qu'elle ne l'était pour personne. Un garde-fou branché sur rien est pire
    // qu'un garde-fou absent : on cesse de chercher.
}

/* ===============================
   📚 API : RÉCUPÉRER LA PRATIQUE D'UN COURS
   =============================== */

/**
 * Obtient la pratique associée à un cours spécifique
 *
 * CONTEXTE:
 * Chaque cours peut avoir sa propre pratique d'évaluation.
 * Cette fonction permet de récupérer la pratique correcte
 * pour un cours donné, au lieu d'utiliser une pratique globale.
 *
 * FONCTIONNEMENT:
 * 1. Récupère le cours depuis listeCours
 * 2. Lit le champ pratiqueId du cours
 * 3. Si pas de pratique définie, utilise la pratique par défaut (pan-standards)
 * 4. Retourne l'ID de la pratique
 *
 * @param {string} coursId - ID du cours (ex: "COURS1234567890")
 * @returns {string} - ID de la pratique ('pan-standards' ou 'sommative')
 *
 * EXEMPLE:
 * const pratiqueId = getPratiqueCours('COURS1234567890');
 * // Retourne: 'pan-standards' ou 'sommative'
 */
function getPratiqueCours(coursId) {
    // Récupérer tous les cours
    const cours = db.getSync('cours', []);

    // Trouver le cours spécifique
    const coursActuel = cours.find(c => c.id === coursId);

    if (!coursActuel) {
        console.warn(`[getPratiqueCours] Cours introuvable: ${coursId}, utilisation pratique par défaut`);
        return 'sommative'; // Pratique par défaut
    }

    // Si le cours a une pratique définie, la retourner
    if (coursActuel.pratiqueId) {
        return coursActuel.pratiqueId;
    }

    // Sinon, utiliser la pratique par défaut
    return 'sommative'; // Pratique par défaut
}

/**
 * Obtient l'ID du cours actuellement actif
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Trouve le cours marqué comme actif (actif: true)
 * 3. Retourne son ID
 *
 * @returns {string|null} - ID du cours actif ou null si aucun
 */
function getCoursActifId() {
    const cours = db.getSync('cours', []);
    const coursActif = cours.find(c => c.actif === true);

    if (!coursActif) {
        console.warn('[getCoursActifId] Aucun cours actif trouvé');
        return null;
    }

    return coursActif.id;
}

/**
 * Liste les cours utilisant une pratique donnée
 *
 * ✅ MODIFICATION (8 décembre 2025) : Single Source of Truth
 * Puisque la pratique est définie globalement dans modalitesEvaluation,
 * tous les cours utilisent la même pratique.
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les cours
 * 2. Récupère la pratique active depuis modalitesEvaluation
 * 3. Si pratiqueId correspond à la pratique active, retourne tous les cours
 * 4. Sinon, retourne les cours ayant explicitement ce pratiqueId (compatibilité)
 *
 * @param {string} pratiqueId - ID de la pratique ('pan-standards' ou 'sommative')
 * @returns {Array} - Tableau des cours utilisant cette pratique
 */
function getCoursUtilisantPratique(pratiqueId) {
    const cours = db.getSync('cours', []);
    // Lot N1b (21 sept. 2026) : l'id que rend LA désignation (`designerPratiqueActive`), sans repli.
    // Avant, un pointeur vide valait « sommative » : une pratique nommée « sommative » passait
    // pour utilisée par tous les cours d'un groupe-cours qui n'en avait assigné aucune.
    const pratiqueActive = (typeof obtenirIdPratiqueActive === 'function')
        ? obtenirIdPratiqueActive()
        : null;

    // Si cette pratique est la pratique active, tous les cours l'utilisent
    // (comparaison normalisée : tolère legacy ↔ canonique des deux côtés).
    if (pratiqueActive && _normPratique(pratiqueId) === _normPratique(pratiqueActive)) {
        return cours;
    }

    // Sinon, chercher les cours qui auraient explicitement ce pratiqueId
    // (pour compatibilité avec anciennes données)
    return cours.filter(c => _normPratique(c.pratiqueId) === _normPratique(pratiqueId));
}

/**
 * Obtient la pratique par défaut
 *
 * FONCTIONNEMENT:
 * 1. Lit depuis localStorage 'pratiqueParDefaut'
 * 2. Si non définie, retourne 'sommative' (pratique par défaut)
 *
 * @returns {string} - ID de la pratique par défaut
 */
function getPratiqueParDefaut() {
    const pratiqueParDefaut = db.getSync('pratiqueParDefaut', 'sommative');
    return pratiqueParDefaut;
}

/**
 * Met à jour l'interface pour refléter la pratique par défaut actuelle
 * - Met en surbrillance le bouton de la pratique sélectionnée (classe btn-principal)
 * - Affiche le nom de la pratique actuelle
 */
function mettreAJourUIPratiqueDefaut() {
    const pratiqueDefaut = getPratiqueParDefaut();

    // Mettre à jour les boutons avec classes CSS standards
    const btnPanMaitrise = document.getElementById('btnDefautPanMaitrise');
    const btnSommative = document.getElementById('btnDefautSommative');

    if (btnPanMaitrise && btnSommative) {
        if (_normPratique(pratiqueDefaut) === 'standards') {
            // PAN-Standards est sélectionnée - classe btn-principal
            btnPanMaitrise.className = 'btn btn-principal';
            btnSommative.className = 'btn';
        } else {
            // Sommative est sélectionnée - classe btn-principal
            btnSommative.className = 'btn btn-principal';
            btnPanMaitrise.className = 'btn';
        }
    }

    // Mettre à jour le texte de l'indicateur
    const nomPratiqueSpan = document.getElementById('nomPratiqueDefaut');
    if (nomPratiqueSpan) {
        const nomPratique = pratiqueDefaut === 'sommative' ? 'Sommative traditionnelle' : 'PAN-Standards';
        nomPratiqueSpan.textContent = nomPratique;
    }
}

/* ===============================
   🔄 MIGRATION CONFIGURATION (Phase 3)
   =============================== */

// #436 G2-b (9 août 2026) — `migrerConfigurationPortfolio()` est RETIRÉE.
// Elle écrivait le miroir de configuration depuis `productions[].regles`
// (structure V1), derrière un drapeau de migration.
// Ce miroir n'a plus AUCUN lecteur : le calcul de la note en a été coupé par
// G2-a (24 mai), les neuf dernières lectures d'affichage par G2-b. Le garder,
// c'était entretenir une copie qui dérivait dès qu'une pratique était éditée.


/* ===============================
   UTILITAIRES PUBLICS
   =============================== */

/**
 * Récupère la configuration de notation complète
 * Fonction utilitaire pour les autres modules
 * 
 * @returns {Object} Configuration complète de notation
 * 
 * UTILISÉ PAR:
 * - Module tableau-bord pour savoir quels indices afficher
 * - Module évaluations pour adapter le comportement
 * - Module statistiques pour les calculs
 */
function obtenirConfigurationNotation() {
    return window.modalitesEvaluation.lire();
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * STRUCTURE LOCALSTORAGE:
 * {
 *   pratique: "sommative" | "alternative",
 *   typePAN: "maitrise" | "specifications" | "denotation" | null,
 *   dateConfiguration: "2025-10-20T..."
 * }
 * 
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 12-pratiques.js
 * 3. Appeler initialiserModulePratiques() depuis 99-main.js
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */

/* ===============================
   GRILLE DE RÉFÉRENCE POUR DÉPISTAGE
   =============================== */

// ⛔ #806 — `chargerGrillesDisponibles()` RETIRÉE. Elle peuplait
// `#grilleReferenceDepistage`, identifiant absent du HTML depuis que le réglage
// a migré vers « Labo → Outils d'observation ». Son unique appelant était le
// portillon `db-ready` retiré plus haut, et son `if (!select) return;` la rendait
// inoffensive — donc invisible. Le sélecteur vivant est peuplé par
// `chargerDropdownGrillesPreferencesV2()` dans `preferences-v2.js`.

// ============================================================================
// GESTION DES PRATIQUES CONFIGURABLES (Beta 92)
// ============================================================================

/**
 * Migration: Ajoute les établissements manquants aux pratiques existantes
 */
function migrerEtablissementsPratiques() {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    let modifie = false;

    // Mapping des auteurs vers établissements
    const etablissements = {
        'Grégoire Bédard': 'Cégep Drummond'
    };

    pratiques.forEach(p => {
        if (p.auteur && !p.etablissement && etablissements[p.auteur]) {
            p.etablissement = etablissements[p.auteur];
            modifie = true;
        }
    });

    if (modifie) {
        db.setSync(cle('pratiquesConfigurables'), pratiques);
        return true;
    }

    return false;
}

/**
 * Affiche la liste de toutes les pratiques (codées + configurables)
 * Génère des cartes avec les actions disponibles
 */
async function afficherListePratiques() {
    // Exécuter la migration si nécessaire
    migrerEtablissementsPratiques();
    const container = document.getElementById('listePratiques');
    if (!container) return;

    try {
        // Cette section n'affiche plus rien - tout est dans le modal "Bibliothèque de pratiques"
        container.innerHTML = '';
    } catch (error) {
        console.error('Erreur lors de l\'affichage des pratiques:', error);
        container.innerHTML = `
            <div class="info-box info-box--attention">
                <strong>Erreur</strong> : Impossible de charger les pratiques
            </div>
        `;
    }
}

/**
 * Charge la configuration spécifique d'une pratique et l'applique à l'interface
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {string} id - ID de la pratique dont on veut charger la config
 */
function chargerConfigurationPratique(id) {

    // Charger la pratique depuis pratiquesConfigurables
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const pratique = pratiques.find(p => p.id === id);

    if (!pratique || !pratique.config) {
        console.warn('[chargerConfigurationPratique] Pratique ou config introuvable:', id);
        return;
    }

    const config = pratique.config;

    // ✅ NOUVEAU (9 décembre 2025) : Stocker l'ID de la pratique sélectionnée pour l'affichage sidebar
    sessionStorage.setItem('pratiqueSelectionnee', id);

    // ✅ NOUVEAU : Afficher la zone de configuration et masquer l'accueil
    const zoneAccueil = document.getElementById('accueilPratiques');
    const zoneConfiguration = document.getElementById('zoneConfigurationPratique');

    toggleDisplay(zoneAccueil, false);
    toggleDisplay(zoneConfiguration, true);

    // ✅ NOUVEAU : Remplir l'en-tête avec les infos de la pratique
    const nomPratique = document.getElementById('nomPratiqueSelectionnee');
    const descriptionPratique = document.getElementById('descriptionPratiqueSelectionnee');

    if (nomPratique) {
        nomPratique.textContent = pratique.nom || 'Sans nom';
        nomPratique.dataset.pratiqueId = id; // Stocker l'ID pour le bouton "Activer"
    }
    if (descriptionPratique) {
        descriptionPratique.textContent = pratique.description || 'Aucune description';
    }

    // ✅ NOUVEAU (9 décembre 2025) : Rafraîchir la sidebar pour mettre à jour le style de sélection
    afficherListePratiquesSidebar();

    // (#436 G2-b : le miroitage de `config.portfolio` vers
    //  `modalites.configPAN.portfolio` est retiré. La configuration vit dans
    //  `pratiquesConfigurables` ; les lecteurs y vont directement.)

    // #328 L2-c : la config des jetons n'est plus MIROIRÉE dans modalitesEvaluation —
    // obtenirConfigJetons() la dérive de la pratique active (configuration/config/jetons).

    // #626 (31 août 2026) — l'aller-retour `lire()` → `remplacer()` est retiré.
    // Les deux miroirs qui mutaient l'objet ENTRE les deux appels sont partis
    // avec #436 G2-b et #328 L2-c : il ne restait qu'une réécriture à l'identique.
    // Elle n'était pas seulement inutile — sur un trimestre dépourvu de la clé,
    // `lire()` rend `{}` et `remplacer({})` CRÉAIT une entrée vide.

    // ✅ 4. Masquer/afficher les sections selon la configuration
    afficherSectionsSelonConfig(config);

}

/**
 * Affiche ou masque les sections selon la configuration de la pratique
 * ✅ NOUVEAU (9 décembre 2025)
 * @param {object} config - Configuration de la pratique
 */
function afficherSectionsSelonConfig(config) {
    // Section Options d'affichage : toujours visible
    const carteOptionsAffichage = document.getElementById('carteOptionsAffichage');
    if (carteOptionsAffichage) {
        carteOptionsAffichage.classList.remove('u-hide');
        // Fermer l'accordéon par défaut
        const accordeonOptions = document.getElementById('accordeonOptionsAffichage');
        const iconeOptions = carteOptionsAffichage.querySelector('.accordeon-icone');
        if (accordeonOptions) {
            accordeonOptions.classList.remove('ouvert');
            if (iconeOptions) iconeOptions.classList.remove('ouvert');
        }
    }

    // Section Évaluation du français : toujours visible
    const carteEvaluationFrancais = document.getElementById('carteEvaluationFrancais');
    if (carteEvaluationFrancais) {
        carteEvaluationFrancais.classList.remove('u-hide');
        // Fermer l'accordéon par défaut
        const accordeonFrancais = document.getElementById('accordeonEvaluationFrancais');
        const iconeFrancais = carteEvaluationFrancais.querySelector('.accordeon-icone');
        if (accordeonFrancais) {
            accordeonFrancais.classList.remove('ouvert');
            if (iconeFrancais) iconeFrancais.classList.remove('ouvert');
        }
    }

    // Section Portfolio : afficher seulement si actif
    const cartePortfolio = document.getElementById('cartePortfolio');
    if (cartePortfolio) {
        const portfolioActif = config.portfolio && config.portfolio.actif !== false;
        toggleDisplay(cartePortfolio, portfolioActif);

        if (portfolioActif) {
            // Fermer l'accordéon par défaut
            const accordeonPortfolio = document.getElementById('accordeonPortfolio');
            const iconePortfolio = cartePortfolio.querySelector('.accordeon-icone');
            if (accordeonPortfolio) {
                accordeonPortfolio.classList.remove('ouvert');
                if (iconePortfolio) iconePortfolio.classList.remove('ouvert');
            }
        }
    }

    // Section Jetons : afficher seulement si actif
    const carteJetons = document.getElementById('carteJetons');
    if (carteJetons) {
        const jetonsActif = config.jetons && config.jetons.actif !== false;
        toggleDisplay(carteJetons, jetonsActif);

        if (jetonsActif) {
            // Fermer l'accordéon par défaut
            const accordeonJetons = document.getElementById('accordeonJetons');
            const iconeJetons = carteJetons.querySelector('.accordeon-icone');
            if (accordeonJetons) {
                accordeonJetons.classList.remove('ouvert');
                if (iconeJetons) iconeJetons.classList.remove('ouvert');
            }
        }
    }

}

/**
 * Éditer une pratique — délègue au wizard V2 qui gère l'édition nativement
 * (chargement des données existantes via chargerPratiqueExistante).
 * @param {string} id - ID de la pratique à éditer
 */
async function editerPratique(id) {
    try {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const pratique = pratiques.find(p => p.id === id);
        if (!pratique) {
            throw new Error('Pratique introuvable');
        }

        if (typeof ouvrirWizardV2 !== 'function') {
            console.error('[editerPratique] ouvrirWizardV2 indisponible');
            alert('❌ Erreur : L\'assistant d\'édition n\'est pas chargé.');
            return;
        }
        ouvrirWizardV2(true, id);
    } catch (error) {
        console.error('Erreur lors de l\'édition:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Dupliquer une pratique
 * @param {string} id - ID de la pratique à dupliquer
 */
async function dupliquerPratique(id, options = {}) {
    // ✅ D8 (arbitrage du 24 août) — L'INVITE PROPOSE LE NOM DE LA SOURCE.
    // Avant, elle proposait la constante « Copie de pratique », qui ne dit pas de
    // quoi c'est la copie : seule des voies de duplication à ne pas consulter
    // `nommerCopie`. La collection est lue AVANT l'invite — c'est la leçon du
    // Lot 5 : sans elle, `nommerCopie` ne connaît pas les noms déjà pris et ne
    // peut pas sauter au premier rang libre.
    // Si la source est introuvable, on garde l'ancien libellé générique : l'échec
    // est annoncé plus bas, par le `throw` du bloc `try`, comme avant.
    const pratiquesExistantes = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const souche = pratiquesExistantes.find(p => p.id === id);
    const nomPropose = options.nom
        || (souche ? nommerCopie(souche.nom, pratiquesExistantes) : 'Copie de pratique');
    const nouveauNom = options.nom || prompt('Nom de la copie:', nomPropose);
    if (!nouveauNom) return;

    try {
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const original = pratiques.find(p => p.id === id);

        if (!original) {
            throw new Error('Pratique introuvable');
        }

        // Créer une copie avec un nouvel ID. La copie devient un nouvel original
        // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY, incl.
        // `sourceId` pour l'arbre de filiation, axe D / #326). Si la source était
        // une démo, la copie perd le flag isDemo.
        //
        // FIX #326 (terrain 16 juin) : la config exécutable est RÉSOLUE par la SSOT
        // (construireConfigComplete) — les pratiques du wizard la rangent sous
        // `.configuration` (+ racine), PAS `.config`. Lire `original.config` à
        // l'aveugle valait `undefined` → `JSON.parse(undefined)` LEVAIT, ce qui
        // rendait « Dupliquer » et « Dériver une variante » silencieusement sans
        // effet. Le résolveur gère les deux formes (legacy `.config` ET wizard).
        const configResolue = (typeof construireConfigComplete === 'function')
            ? construireConfigComplete(original)
            : (original.config || original.configuration || {});
        const clone = (v) => JSON.parse(JSON.stringify(v));
        // FIX #326 T3 (terrain 21 juin) : la copie naît en forme CANONIQUE — les mêmes
        // champs TOP-LEVEL qu'une pratique du wizard (type / configuration / calcul_note /
        // seuils / nbEvaluationsPrevues / variante / reglesSpeciales). Avant, la copie ne
        // portait que `.config` (config résolue) → `chargerPratiqueExistante` lit ces
        // champs au top-level et ne les trouvait pas → l'assistant rouvrait une maquette
        // ou une copie avec les champs obligatoires VIDES (« Nombre d'évaluations
        // prévues »…). Source unique = `configResolue` (construireConfigComplete, qui
        // normalise les deux formes d'origine). `.config` est conservé : c'est la config
        // EXÉCUTABLE consommée par la validation de sauvegarde et par le comparateur/moteur.
        const copie = {
            id: genererIdUnique('pratique_'),
            nom: nouveauNom,
            auteur: BibliothequeUI.obtenirAuteurActif(),
            etablissement: original.etablissement || configResolue.etablissement || '',
            description: original.description,
            discipline: original.discipline || configResolue.discipline || '',
            isDemo: false,
            // #468/CO-12 (21 août 2026) : la copie naît DANS la bibliothèque.
            // Sans ce champ, PratiqueManager.sauvegarderPratique le rabattait sur
            // `false` (règle des pratiques prédéfinies) et la copie n'apparaissait
            // ni dans la sidebar ni en Section 1 — malgré le « ajoutée à tes
            // pratiques » de l'alerte. Une maquette dérivée reste masquée par son
            // propre flag `estMaquette` (filtrerParMaquette), pas par un rangement
            // hors bibliothèque : c'est ce qui lui permet de PARAÎTRE une fois adoptée.
            dansBibliotheque: true,
            inspireDe: BibliothequeUI.forgerInspireDe(original),
            type: configResolue.type,
            variante: configResolue.variante || null,
            calcul_note: configResolue.calcul_note,
            configuration: clone(configResolue.configuration || {}),
            config: clone(configResolue) // Deep copy de la config résolue (exécutable)
        };
        if (configResolue.seuils) copie.seuils = clone(configResolue.seuils);
        if (configResolue.nbEvaluationsPrevues) copie.nbEvaluationsPrevues = configResolue.nbEvaluationsPrevues;
        if (configResolue.reglesSpeciales) copie.reglesSpeciales = clone(configResolue.reglesSpeciales);

        // `estMaquette` (axe D / #326, SPEC §3.2 ; R1 : « essai » → « maquette ») :
        // maquette vivant dans l'Exploration des pratiques, masquée de la
        // sidebar/bibliothèque propre (filtre posé en D-2). OPT-IN : la duplication
        // ordinaire (bouton « Dupliquer ») produit une pratique ABOUTIE (flag omis)
        // — pas de régression latente ; seule la dérivation (deriverMaquette, D-3)
        // passera { estMaquette: true }.
        if (options.estMaquette === true) copie.estMaquette = true;

        // Mettre à jour l'ID et le nom dans la config
        copie.config.id = copie.id;
        copie.config.nom = nouveauNom;

        // Sauvegarder
        await PratiqueManager.sauvegarderPratique(copie);


        // Recharger
        await afficherListePratiques();

        // `silencieux` (#326 D-3, T4) : la dérivation affiche sa propre notification
        // « Maquette créée » et l'appelant rafraîchit l'arbre → pas d'alerte ici.
        if (!options.silencieux) {
            notifications.succes(`Pratique "${nouveauNom}" dupliquée !`, 'Elle a été ajoutée à tes pratiques.');
        }
        return copie.id;
    } catch (error) {
        console.error('Erreur lors de la duplication:', error);
        if (!options.silencieux) alert(`❌ Erreur : ${error.message}`);
        return null;
    }
}

/**
 * Dérive une MAQUETTE depuis une pratique source (#326 axe D, D-3 ; R1).
 * Geste raccourci : nom auto « <souche> · maquette N », duplication AVEC
 * `estMaquette:true` (dupliquerPratique pose déjà `auteur` + `inspireDe.sourceId`
 * via forgerInspireDe). #326 T4 : on N'OUVRE PLUS le wizard — on crée et on ATTERRIT
 * sur l'arbre d'exploration (l'appelant rafraîchit l'arbre). L'édition fine est à la
 * demande depuis l'arbre. La maquette vit dans le Labo › Exploration (filtrée de la
 * sidebar/bibliothèque, D-2).
 *
 * GARDE-FOU « max 1 dérivé » (R1, décision Grégoire 16 juin) : on ne dérive JAMAIS
 * une maquette (profondeur d'arbre = 1). Une maquette se dérive d'un original abouti,
 * pas d'une autre maquette — sinon « doublons de doublons » (#326 §1.2).
 *
 * @param {string} sourceId - id de la pratique souche (aboutie)
 * @returns {Promise<string|null>} id de la maquette créée, ou null.
 */
async function deriverMaquette(sourceId) {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const source = pratiques.find(p => p.id === sourceId);
    if (!source) {
        if (typeof notifications !== 'undefined' && notifications.erreur) notifications.erreur('Pratique source introuvable.');
        return null;
    }
    // Garde-fou « max 1 dérivé » : refuser de dériver une maquette.
    if (source.estMaquette === true) {
        if (typeof notifications !== 'undefined' && notifications.info) {
            notifications.info('Dérivation impossible', 'Une maquette se dérive d\'une pratique aboutie, pas d\'une autre maquette.');
        }
        return null;
    }
    // N = nombre de maquettes déjà dérivées de cette souche + 1.
    const nMaquettes = pratiques.filter(p => p.estMaquette === true && p.inspireDe && p.inspireDe.sourceId === sourceId).length;
    const nom = (source.nom || 'Pratique') + ' · maquette ' + (nMaquettes + 1);

    const nouvelId = await dupliquerPratique(sourceId, { estMaquette: true, nom: nom, silencieux: true });
    if (!nouvelId) {
        // Défense (terrain 16 juin) : ne JAMAIS échouer en silence — `silencieux`
        // supprime l'alerte de dupliquerPratique, donc on rend l'échec visible ici.
        if (typeof notifications !== 'undefined' && notifications.erreur) {
            notifications.erreur('La dérivation a échoué', 'La maquette n\'a pas pu être créée.');
        }
        return null;
    }
    // #326 T4 (terrain 21 juin) : la dérivation NE déroule PLUS le wizard complet.
    // On CRÉE la maquette puis on ATTERRIT sur l'arbre d'exploration (l'appelant —
    // dispatcher du comparateur — enchaîne `_rafraichirArbre`, qui affiche le nouveau
    // nœud). L'édition fine reste accessible À LA DEMANDE depuis l'arbre (bouton
    // « Éditer » → editerPratique → wizard, désormais prérempli grâce à T3). Bénéfice :
    // plus de « maquette fantôme » créée quand l'utilisateur Annulait le wizard parasite
    // — il n'y a plus de wizard à annuler.
    if (typeof notifications !== 'undefined' && notifications.succes) {
        notifications.succes('Maquette créée', '« ' + nom + ' » est dans l\'arbre. Tu peux l\'éditer ou la comparer.');
    }
    return nouvelId;
}

/**
 * Supprimer une pratique
 * @param {string} id - ID de la pratique à supprimer
 */
async function supprimerPratique(id) {
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const pratique = pratiques.find(p => p.id === id);

    // Vérifier que la pratique n'est pas active (#328 L2-b2 : SSOT, plus le miroir)
    const pratiqueActiveId = (typeof obtenirIdPratiqueActive === 'function')
        ? obtenirIdPratiqueActive()
        : null;
    if (pratiqueActiveId === id) {
        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement active.\n\nVous devez d'abord activer une autre pratique.`);
        return;
    }

    // NOUVEAU Beta 91 : Vérifier que la pratique n'est pas utilisée par des cours
    const coursUtilisant = getCoursUtilisantPratique(id);
    if (coursUtilisant.length > 0) {
        const listeCours = coursUtilisant.map(c => c.sigle).join(', ');
        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement utilisée par ${coursUtilisant.length} cours :\n${listeCours}\n\nVous devez d'abord modifier ces cours pour utiliser une autre pratique.`);
        return;
    }

    if (!confirm(`Supprimer définitivement cette pratique ?\n\n"${pratique?.nom}"\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        await PratiqueManager.supprimerPratique(id);

        // Recharger
        await afficherListePratiques();

        notifications.succes('Pratique supprimée');
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
}

/**
 * Adoption d'une maquette (#326 axe D, SPEC §3.3 ; R1 : « promouvoir » → « adopter »,
 * « essai » → « maquette ») : la maquette devient une pratique ABOUTIE et rejoint la
 * bibliothèque propre + la sidebar (le filtre `estMaquette !== true` la laisse alors
 * passer). SEUL le flag `estMaquette` bascule à false ; `inspireDe`/`sourceId` restent
 * INTACTS — couper l'attribution d'un dérivé violerait CC BY (invariant CC, SPEC
 * §3.1/§5). Bascule en place + persiste le store SSOT `pratiquesConfigurables` (pas
 * de chemin de persistance parallèle).
 *
 * @param {string} id
 * @returns {Promise<boolean>} true si adoptée ; false si introuvable ou déjà aboutie.
 */
async function adopterMaquette(id) {
    // #522 (30 août 2026) — une seule écriture, dans la file par clé. Le code
    // écrivait DEUX fois la collection (`setSync` puis `set`) sur le même
    // instantané lu hors file : deux occasions de perdre une modification
    // voisine, pour une seule bascule de drapeau.
    let nomAdoptee = null;
    const ecritLotF = await db.modifier(cle('pratiquesConfigurables'), (lues) => {
        const pratiques = lues || [];
        const pratique = pratiques.find(p => p.id === id);
        if (!pratique || pratique.estMaquette !== true) return undefined;

        // estMaquette bascule ; tout le reste (inspireDe/sourceId inclus) est préservé.
        pratique.estMaquette = false;
        // #468/CO-12 (21 août 2026) : l'adoption remet aussi la pratique DANS la
        // bibliothèque. Les maquettes créées avant le correctif de dupliquerPratique
        // portent `dansBibliotheque:false` : sans cette ligne, « Maquette adoptée »
        // s'affichait sur une pratique qui restait introuvable dans la sidebar.
        pratique.dansBibliotheque = true;
        nomAdoptee = pratique.nom || 'Sans titre';
        return pratiques;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('pratiquesConfigurables'));   // lot F : geste hors témoin (adopterMaquette)

    if (nomAdoptee === null) return false;   // introuvable, ou déjà adoptée

    if (typeof afficherListePratiques === 'function') await afficherListePratiques();
    if (typeof notifications !== 'undefined' && notifications.succes) {
        notifications.succes('Maquette adoptée', `« ${nomAdoptee} » rejoint tes pratiques.`);
    }
    return true;
}

// ============================================================================
// WIZARD DE CRÉATION DE PRATIQUE — délègue au wizard V2 (wizard-pratique-v2.js)
// ============================================================================

/**
 * Ouvre le wizard V2 de création de pratique.
 */
function creerNouvellePratique() {
    if (typeof ouvrirWizardV2 !== 'function') {
        console.error('[creerNouvellePratique] ouvrirWizardV2 indisponible');
        alert('❌ Erreur : L\'assistant de création n\'est pas chargé.');
        return;
    }
    ouvrirWizardV2(false, null);
}


/**
 * Traiter le fichier JSON importé
 * @param {Event} event - Événement change de l'input file
 */
async function traiterImportPratique(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const pratiqueJSON = JSON.parse(text);

        // Valider la structure minimale
        if (!pratiqueJSON.id || !pratiqueJSON.config) {
            throw new Error('Structure JSON invalide (id et config requis)');
        }

        // Importer via PratiqueManager
        await PratiqueManager.importerPratique(pratiqueJSON);


        // Recharger
        await afficherListePratiques();

        notifications.succes(`Pratique "${pratiqueJSON.nom}" importée !`, 'Elle a été ajoutée à tes pratiques.');
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert(`❌ Erreur d'import : ${error.message}`);
    }

    // Réinitialiser l'input
    event.target.value = '';
}


// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

window.initialiserModulePratiques = initialiserModulePratiques;
window.obtenirConfigurationNotation = obtenirConfigurationNotation;

// NOUVEAU Beta 91 : Association pratique ↔ cours
window.getPratiqueCours = getPratiqueCours;
window.getCoursActifId = getCoursActifId;
window.getCoursUtilisantPratique = getCoursUtilisantPratique;
window.getPratiqueParDefaut = getPratiqueParDefaut;
window.mettreAJourUIPratiqueDefaut = mettreAJourUIPratiqueDefaut;

// Phase 5 : exports manquants pour délégation data-action
window.chargerConfigurationPratique = chargerConfigurationPratique;

// NOUVEAU Beta 92 : Gestion pratiques configurables
window.afficherListePratiques = afficherListePratiques;
window.editerPratique = editerPratique;
window.dupliquerPratique = dupliquerPratique;
window.supprimerPratique = supprimerPratique;
window.adopterMaquette = adopterMaquette;
window.deriverMaquette = deriverMaquette;
window.creerNouvellePratique = creerNouvellePratique;
window.traiterImportPratique = traiterImportPratique;
// window.afficherPratiquesPredefines = afficherPratiquesPredefines; // Fonction supprimée

// Wizard de création de pratique
/* ===============================
   📚 SIDEBAR : AFFICHAGE LISTE PRATIQUES
   ✅ AJOUT (8 décembre 2025) - Pattern bibliothèque
   =============================== */

/**
 * Affiche la liste des pratiques dans la sidebar
 * Filtre uniquement les pratiques avec dansBibliotheque !== false
 */
async function afficherListePratiquesSidebar() {
    const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];

    // IDs des 3 CANEVAS DE BASE (pratiques codées) qui ne doivent PAS apparaître dans la sidebar
    // (ils sont dans le modal "Bibliothèque de pratiques" > section "Canevas de base")
    // Les autres pratiques sont des configurations dérivées qui peuvent apparaître dans la sidebar
    // Canevas de base sous forme canonique (miroir de l'ancien ensemble
    // pan-standards/pan-maitrise/pan-specifications/specifications/sommative).
    // On normalise p.id à la comparaison → tolère legacy ET migré (A-2 4d).
    const idsCanevasCanon = ['standards', 'specifications', 'sommative'];

    // Filtrer les pratiques : dans bibliothèque ET pas un canevas de base ET pas
    // une maquette (#326 axe D : les maquettes vivent dans le Labo › Exploration,
    // jamais dans la sélection de la pratique active tant qu'elles ne sont pas adoptées).
    const pratiquesDansBibliotheque = pratiquesConfigurables.filter(p =>
        p.dansBibliotheque !== false && !idsCanevasCanon.includes(_normPratique(p.id))
        && p.estMaquette !== true
    );


    const container = document.getElementById('listePratiquesSidebar');

    if (!container) return;

    // #328 L2-b2 : id dérivé de la SSOT groupesCours[].pratiqueId.
    const pratiqueActiveId = (typeof obtenirIdPratiqueActive === 'function')
        ? obtenirIdPratiqueActive()
        : null;

    // ✅ NOUVEAU (9 décembre 2025) : Récupérer la pratique sélectionnée pour l'affichage
    const pratiqueSelectionneeId = sessionStorage.getItem('pratiqueSelectionnee');

    if (pratiquesDansBibliotheque.length === 0) {
        container.innerHTML = '<p class="text-muted text-italic">Crée une nouvelle pratique ou puisez dans la bibliothèque</p>';
        return;
    }

    let html = '';
    pratiquesDansBibliotheque.forEach(p => {
        const estActiveSysteme = p.id === pratiqueActiveId;
        const estSelectionnee = p.id === pratiqueSelectionneeId;
        const activeClass = estSelectionnee ? ' active' : '';
        const nomAffiche = p.nom || p.id;
        const auteur = p.auteur ? `par ${p.auteur}` : '';

        html += `
            <div class="sidebar-item${activeClass}" data-action="chargerConfigurationPratique" data-param="${p.id}">
                <div class="sidebar-item-titre">${echapperHtml(nomAffiche)}</div>
                ${auteur ? `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 3px;">${echapperHtml(auteur)}</div>` : ''}
                ${estActiveSysteme ? '<div style="margin-top: 5px;"><span class="sidebar-item-badge">Active</span></div>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

// #587 (11 oct. 2026) — `fermerModalBibliothequePratiques` vit dans pratiques-gestion.js.
// #469 (12 oct. 2026) — l'îlot de ce fichier est retiré : l'ancienne bibliothèque, son sélecteur
// de pratique par défaut, l'ancien éditeur des spécifications (graphe d'appels interne).

/* ===============================
   EXPORTS WINDOW
   =============================== */

window.afficherListePratiquesSidebar = afficherListePratiquesSidebar;

// Exports pour wizard de spécifications

// ============================================
// UTILITAIRES DE GESTION DES PRATIQUES
// ============================================

/* ===============================
   🎨 ACCORDÉONS POUR SECTIONS CONFIGURABLES
   =============================== */

/**
 * ✅ BETA 95 : Toggle accordéon v2 (structure avec header cliquable)
 * Sauvegarde l'état dans localStorage pour persistance
 * @param {HTMLElement} headerElement - L'élément .accordeon-header cliqué
 */
function toggleAccordeonV2(headerElement) {
    const carte = headerElement.closest('.carte.accordeon');
    if (!carte) {
        console.error('[toggleAccordeonV2] Carte accordéon introuvable');
        return;
    }

    const contenu = carte.querySelector('.accordeon-contenu');
    const chevron = carte.querySelector('.accordeon-chevron');

    if (!contenu) return;

    // Toggle la classe "ferme" - le CSS gère max-height et opacity via :not(.ferme)
    const estFerme = carte.classList.contains('ferme');

    if (estFerme) {
        // Ouvrir - retirer la classe, le CSS fait le reste
        carte.classList.remove('ferme');
        // Nettoyer les styles inline qui pourraient interférer
        contenu.style.display = '';
        contenu.style.maxHeight = '';
        contenu.style.opacity = '';
    } else {
        // Fermer
        carte.classList.add('ferme');
    }

    // Toggle le chevron
    if (chevron) {
        chevron.textContent = estFerme ? '▼' : '▶';
    }

    // Sauvegarder l'état si l'accordéon a un ID
    if (carte.id) {
        sauvegarderEtatAccordeons();
    }
}

/**
 * Sauvegarde l'état de tous les accordéons dans localStorage
 */
function sauvegarderEtatAccordeons() {
    const accordeons = document.querySelectorAll('.carte.accordeon[id]');
    const etats = {};

    accordeons.forEach(accordeon => {
        if (accordeon.id) {
            // Détecter l'état basé sur la classe .ferme (pas display)
            etats[accordeon.id] = !accordeon.classList.contains('ferme');
        }
    });

    db.setSync('etatsAccordeonsV2', etats);
}

/**
 * Restaure l'état des accordéons depuis localStorage
 */
function restaurerEtatAccordeons() {
    let etats = {};
    try {
        etats = db.getSync('etatsAccordeonsV2', {});
    } catch (e) {
        etats = {};
    }

    const accordeons = document.querySelectorAll('.carte.accordeon[id]');

    accordeons.forEach(accordeon => {
        const contenu = accordeon.querySelector('.accordeon-contenu');
        const chevron = accordeon.querySelector('.accordeon-chevron');

        if (!contenu) return;

        // Si on a un état sauvegardé, l'utiliser, sinon garder l'état HTML initial
        const estOuvert = etats[accordeon.id] === true;

        // Utiliser la classe .ferme au lieu de display (cohérent avec toggleAccordeonV2)
        if (estOuvert) {
            accordeon.classList.remove('ferme');
            contenu.style.maxHeight = '';
            contenu.style.opacity = '';
            contenu.style.display = ''; // Nettoyer les anciens styles inline
        } else {
            accordeon.classList.add('ferme');
            contenu.style.display = ''; // Nettoyer les anciens styles inline
        }

        if (chevron) {
            chevron.textContent = estOuvert ? '▼' : '▶';
        }
    });
}

window.toggleAccordeonV2 = toggleAccordeonV2;
window.restaurerEtatAccordeons = restaurerEtatAccordeons;

/* ===============================
   RÈGLES DE CONFORMITÉ
   =============================== */

/**
 * Initialise les règles de conformité
 * - Peuple les sélecteurs avec les niveaux de l'échelle
 * - Gère la checkbox pour afficher/masquer les détails
 * ✅ NOUVEAU (15 décembre 2025)
 */
function initialiserReglesConformite() {

    const checkbox = document.getElementById('activerReglesConformite');
    const details = document.getElementById('detailsReglesConformite');

    if (!checkbox || !details) {
        return;
    }

    // Gérer la checkbox
    checkbox.addEventListener('change', function() {
        toggleDisplay(details, this.checked);
        // Peupler les sélecteurs quand on affiche les détails
        if (this.checked) {
            populerSelecteursNiveaux();
        }
    });

    // Peupler les sélecteurs avec les niveaux de l'échelle (si déjà configurée)
    populerSelecteursNiveaux();
}

/**
 * Peuple les sélecteurs de plafond avec les niveaux de l'échelle configurée
 */
function populerSelecteursNiveaux() {

    const selectEchelle = document.getElementById('echelleConformite');
    if (!selectEchelle) {
        return;
    }

    // Charger les échelles disponibles (clé: echellesTemplates)
    const echelles = db.getSync(cle('echellesTemplates'), []);

    // Vider et repeupler le sélecteur d'échelles
    selectEchelle.innerHTML = '<option value="">-- Choisir une échelle --</option>';

    if (!echelles || echelles.length === 0) {
        selectEchelle.innerHTML = '<option value="" disabled selected>Crée d\'abord une échelle</option>';
        return;
    }

    // Ajouter chaque échelle comme option
    echelles.forEach(echelle => {
        const option = document.createElement('option');
        option.value = echelle.id;
        option.textContent = `${echelle.nom} (${echelle.niveaux?.length || 0} niveaux)`;
        selectEchelle.appendChild(option);
    });

}

// Exporter les fonctions
window.initialiserReglesConformite = initialiserReglesConformite;
window.populerSelecteursNiveaux = populerSelecteursNiveaux;

/**
 * Importe une liste de pratiques de notation externes (réserve, voûte, etc.).
 * Pattern symétrique à importerGrillesExternes / importerEchellesExternes.
 *
 * @param {Array} nouvellesPratiques - Pratiques à importer
 * @param {Object} [options]
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre de pratiques ajoutées/mises à jour
 */
window.importerPratiquesExternes = function(nouvellesPratiques, options) {
    if (!nouvellesPratiques || nouvellesPratiques.length === 0) return 0;
    options = options || {};

    var pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [] || [];
    if (!Array.isArray(pratiques)) pratiques = [];
    var compteur = 0;

    for (var i = 0; i < nouvellesPratiques.length; i++) {
        var p = nouvellesPratiques[i];
        if (!p || !p.id) continue;
        var index = pratiques.findIndex(function(x) { return x.id === p.id; });

        if (index >= 0) {
            if (options.remplacer) {
                pratiques[index] = p;
                compteur++;
            }
        } else {
            pratiques.push(p);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync(cle('pratiquesConfigurables'), pratiques);

        if (!options.silencieux) {
            if (typeof afficherListePratiques === 'function') afficherListePratiques();
        }
    }

    return compteur;
};

})();
