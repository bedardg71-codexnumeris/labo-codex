/* ===============================
   MODULE 02: GESTION DE LA NAVIGATION
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   INTERDICTION ABSOLUE de modifier les noms de fonctions.
   Les identifiants CSS et attributs data-* sont protégés.
   Seuls les commentaires peuvent être modifiés/ajoutés.
   
   Contenu de ce module:
   - Affichage des sections principales
   - Génération de la sous-navigation
   - Affichage des sous-sections
   =============================== */

/* ===============================
   📋 DÉPENDANCES DE CE MODULE
   
   Variables du module 01-config.js:
   - configurationsOnglets : Configuration des sections/sous-sections
   - sectionActive : Section actuellement affichée
   - sousSectionActive : Sous-section actuellement affichée
   
   Éléments HTML requis:
   - .navigation-principale button[data-onglet] : Boutons de navigation principale
   - #sous-navigation : Conteneur de la sous-navigation
   - .section#section-{nomSection} : Conteneurs de sections
   - .sous-section#{idSousSection} : Conteneurs de sous-sections
   
   Classes CSS requises:
   - .active : Classe pour les éléments visibles
   - .actif : Classe pour les boutons actifs
   - .sous-navigation.vide : État vide de la sous-navigation
   =============================== */

/* ===============================
   🔄 FONCTION: AFFICHER UNE SECTION PRINCIPALE
   Change la section active et affiche sa sous-navigation
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche une section principale et met à jour la navigation
 * 
 * @param {string} nomSection - Identifiant de la section à afficher
 *                             Valeurs: 'accueil' | 'apercu' | 'conception' | 'calendrier' |
 *                                     'suivi' | 'evaluations' | 'labo' | 'aide' | 'reglages'
 * 
 * UTILISÉ PAR:
 * - Événements click sur les boutons de navigation principale
 * - Fonctions de navigation programmatique (ex: allerVersListeEtudiants)
 * 
 * FONCTIONNEMENT:
 * 1. Masque toutes les sections existantes
 * 2. Désactive tous les boutons de navigation principale
 * 3. Affiche la section demandée et active son bouton
 * 4. Met à jour la variable globale sectionActive
 * 5. Déclenche l'affichage de la sous-navigation appropriée
 * 
 * EFFETS DE BORD:
 * - Modifie sectionActive (variable globale)
 * - Appelle afficherSousNavigation(nomSection)
 * 
 * EXEMPLE:
 * afficherSection('etudiants');
 * // → Affiche la section étudiants et sa sous-navigation
 */
function afficherSection(nomSection) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Désactiver tous les boutons de navigation
    document.querySelectorAll('.navigation-principale button').forEach(bouton => {
        bouton.classList.remove('actif');
    });

    // Afficher la section demandée
    const sectionCible = document.getElementById(`section-${nomSection}`);
    if (sectionCible) {
        sectionCible.classList.add('active');
        sectionActive = nomSection;
    }

    // Activer le bouton correspondant
    const boutonActif = document.querySelector(`button[data-onglet="${nomSection}"]`);
    if (boutonActif) {
        boutonActif.classList.add('actif');
    }

    // Lot J : gérer la classe .actif sur les boutons header (aide + réglages)
    // pour qu'ils reçoivent le fond teinté jaune quand leur section est ouverte
    document.querySelectorAll('.btn-action-header[data-param="aide"], .btn-action-header[data-param="reglages"]').forEach(b => b.classList.remove('actif'));
    const boutonHeaderActif = document.querySelector(`.btn-action-header[data-param="${nomSection}"]`);
    if (boutonHeaderActif) boutonHeaderActif.classList.add('actif');

    // Afficher la sous-navigation appropriée
    afficherSousNavigation(nomSection);

    // Chantier 3 : Rafraîchir la page d'accueil quand on y navigue
    if (nomSection === 'accueil' && typeof afficherAccueil === 'function') {
        afficherAccueil();
    }

}

/* ===============================
   🔄 FONCTION: AFFICHER LA SOUS-NAVIGATION
   Génère et affiche les boutons de sous-navigation pour une section
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche la sous-navigation pour une section donnée
 * 
 * @param {string} nomOnglet - Identifiant de la section parent
 *                            Valeurs: 'accueil' | 'apercu' | 'conception' | 'calendrier' |
 *                                    'suivi' | 'evaluations' | 'labo' | 'aide' | 'reglages'
 * 
 * UTILISÉ PAR:
 * - afficherSection() après un changement de section
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la configuration depuis configurationsOnglets
 * 2. Si aucune sous-section : affiche un message "vide"
 * 3. Si des sous-sections existent :
 *    - Génère les boutons HTML
 *    - Ajoute les événements click
 *    - Active le premier bouton par défaut
 *    - Affiche la première sous-section
 * 
 * EFFETS DE BORD:
 * - Modifie le contenu de #sous-navigation
 * - Modifie sousSectionActive (via afficherSousSection)
 * - Appelle afficherSousSection() pour la première sous-section
 * 
 * STRUCTURE HTML GÉNÉRÉE:
 * <button data-sous-onglet="{nomOnglet}-{item.id}" class="actif">
 *   {item.label}
 * </button>
 * 
 * EXEMPLE:
 * afficherSousNavigation('etudiants');
 * // → Génère 3 boutons: Aperçu, Liste des individus, Profil
 */
// Mapping sous-onglet → clé tooltip (généré depuis Tooltips_Navigation.md)
// ✨ RÉORGANISATION NAVIGATION (3 avril 2026, Tier 5.7)
const TOOLTIPS_SOUS_NAV = {
    // Accueil : section plate (toggles gérés par accueil.js)
    // Aperçu : section plate, pas de sous-nav
    // Structure
    // « Apporter mon matériel » (16 oct. 2026, lot 1) : autorisation de Grégoire pour cette zone
    // protégée, donnée le 16 oct. 2026 (réponse A à la question de l'info-bulle).
    'conception-materiel': 'nav-conception-materiel',
    'conception-carte': 'nav-conception-alignement',
    // 'conception-organisateur' RETIRÉ le 8 août 2026 (#424 Lot G, autorisation
    // = plan de chantier acté) : la page « Plan de la leçon » n'existe plus.
    'conception-productions': 'nav-conception-productions',
    'conception-grille-criteres': 'nav-conception-grilles',
    'conception-echelle-performance': 'nav-conception-echelles',
    'conception-pratiques-notation': 'nav-conception-pratiques',
    'conception-retroactions': 'nav-conception-cartouches',
    // Contexte
    'calendrier-trimestre': 'nav-calendrier-trimestre',
    'calendrier-vue': 'nav-calendrier-vue',
    // Suivi
    'suivi-groupe': 'nav-suivi-groupe',
    'suivi-liste': 'nav-suivi-liste',
    'suivi-saisie': 'nav-suivi-saisie',
    'suivi-profil': 'nav-suivi-profil',
    'suivi-interventions': 'nav-suivi-interventions',
    'suivi-rencontres': 'nav-suivi-rencontres',   // cadrage « Rencontres », 12 sept. 2026 (autorisation de Grégoire)
    'suivi-animation': 'nav-suivi-animation',
    // Évaluations
    'evaluations-importer': 'nav-eval-importer',
    'evaluations-liste': 'nav-eval-liste',
    'evaluations-annoter': 'nav-eval-annoter',
    'evaluations-exporter': 'nav-eval-exporter',
    // Boîte à outils
    'labo-accompagnement': 'nav-labo-accompagnement',
    'labo-modelisation': 'nav-labo-modelisation',
    'labo-rythme': 'nav-labo-rythme',
    'labo-etudes': 'nav-labo-etudes',
    'labo-bilan': 'nav-labo-bilan',
    // Aide (tooltips gérés séparément si existants)
    // Réglages
    'reglages-preferences': 'nav-reg-preferences',
    'reglages-donnees': 'nav-reg-donnees',
    'reglages-a-propos': 'nav-reg-apropos'
};

/* ===============================
   📋 INITIALISATEURS DE SOUS-SECTIONS (dispatcher table-driven)

   Chaque entrée mappe l'ID complet d'une sous-section (`section-id`) à une
   fonction d'initialisation appelée par afficherSousSection() au moment de
   l'affichage. L'ordre suit configurationsOnglets pour la lisibilité.

   Les fonctions sont résolues au runtime (typeof === 'function') car
   certains initialisateurs sont définis dans des modules chargés après
   navigation.js. Une sous-section sans entrée ici (ex: suivi-saisie,
   labo-rythme, accueil-*, apercu-*, aide-*, reglages-a-propos)
   n'a pas de hook d'initialisation à l'affichage.

   Pour ajouter/déplacer/renommer une sous-section :
   1. Mettre à jour configurationsOnglets dans config.js
   2. Mettre à jour cette table avec la nouvelle clé
   =============================== */
const INITIALISATEURS_SOUS_SECTION = {
    // === STRUCTURE ===
    'conception-carte': function () {
        if (typeof initialiserModulePlanification === 'function') {
            setTimeout(initialiserModulePlanification, 100);
        }
    },
    'conception-productions': function () {
        if (typeof initialiserModuleProductions === 'function') {
            initialiserModuleProductions();
        }
    },
    'conception-grille-criteres': function () {
        if (typeof initialiserModuleGrilles === 'function') {
            setTimeout(async () => {
                await initialiserModuleGrilles();
            }, 100);
        }
    },
    'conception-echelle-performance': function () {
        if (typeof initialiserModuleEchelles === 'function') {
            setTimeout(async () => {
                await initialiserModuleEchelles();
            }, 100);
        }
    },
    'conception-pratiques-notation': function () {
        if (typeof initialiserModulePratiquesMateriel === 'function') {
            setTimeout(async () => {
                await initialiserModulePratiquesMateriel();
            }, 100);
        }
    },
    'conception-retroactions': function () {
        if (typeof initialiserModuleCartouches === 'function') {
            setTimeout(async () => {
                await initialiserModuleCartouches();
            }, 100);
        }
    },

    // === CONTEXTE ===
    'calendrier-trimestre': function () {
        if (typeof initialiserModuleTrimestre === 'function') {
            initialiserModuleTrimestre();
        }
    },
    'calendrier-vue': function () {
        if (typeof afficherCalendrierScolaire === 'function') {
            afficherCalendrierScolaire();
        }
    },

    // === SUIVI ===
    'suivi-groupe': function () {
        if (typeof chargerTableauBordApercu === 'function') {
            setTimeout(chargerTableauBordApercu, 150);
        }
    },
    'suivi-liste': function () {
        if (typeof rechargerListeEtudiants === 'function') {
            setTimeout(rechargerListeEtudiants, 100);
        }
    },
    // suivi-saisie : pas d'initialisation spécifique requise
    // Cadrage « Rencontres » (12 sept. 2026, autorisation de Grégoire pour cette zone protégée) :
    // rencontres.js décide entre les trois questions et la liste des rencontres du contexte.
    'suivi-rencontres': function () {
        if (typeof afficherRencontres === 'function') {
            afficherRencontres();
        }
    },
    'suivi-animation': function () {
        if (typeof initialiserTirage === 'function') {
            setTimeout(initialiserTirage, 100);
        }
        if (typeof initialiserQuestions === 'function') {
            setTimeout(initialiserQuestions, 100);
        }
    },

    // === ÉVALUATIONS ===
    'evaluations-importer': function () {
        if (typeof initialiserModuleTravaux === 'function') {
            setTimeout(() => {
                initialiserModuleTravaux();
                if (typeof travauxUI !== 'undefined') {
                    travauxUI.afficherImport();
                }
            }, 100);
        }
    },
    'evaluations-liste': function () {
        if (typeof initialiserListeEvaluations === 'function') {
            setTimeout(() => {
                initialiserListeEvaluations();
            }, 100);
        } else {
            console.error('   ❌ initialiserListeEvaluations n\'est pas une fonction!');
        }
    },
    'evaluations-annoter': function () {
        if (typeof initialiserModuleTravaux === 'function') {
            setTimeout(() => {
                initialiserModuleTravaux();
            }, 100);
        }
    },
    'evaluations-exporter': function () {
        if (typeof initialiserModuleTravaux === 'function') {
            setTimeout(() => {
                initialiserModuleTravaux();
                if (typeof travauxUI !== 'undefined') {
                    travauxUI.afficherArchivage();
                }
            }, 100);
        }
    },

    // === BOÎTE À OUTILS ===
    'labo-accompagnement': function () {
        if (typeof initialiserPreferencesV2 === 'function') {
            setTimeout(initialiserPreferencesV2, 100);
        }
    },
    'labo-modelisation': function () {
        if (typeof initialiserModelisation === 'function') {
            setTimeout(initialiserModelisation, 100);
        }
    },
    'labo-comparateur': function () {
        if (typeof initialiserComparateurPratiques === 'function') {
            setTimeout(initialiserComparateurPratiques, 100);
        }
    },
    'labo-etudes': function () {
        // Graphiques déplacés depuis l'Aperçu (ancien suivi-labo)
        if (typeof creerGraphiqueCorrelationsLongitudinales === 'function') {
            setTimeout(() => creerGraphiqueCorrelationsLongitudinales('graphique-correlations-longitudinales'), 100);
        }
        if (typeof creerGraphiqueImpactJetons === 'function') {
            setTimeout(() => creerGraphiqueImpactJetons('graphique-impact-jetons'), 100);
        }
    },
    'labo-bilan': function () {
        if (typeof initialiserBilanReflexif === 'function') {
            setTimeout(initialiserBilanReflexif, 100);
        }
    },
    // #915 (17 sept. 2026) : septième sous-onglet du Labo, entrée autorisée par Grégoire
    // le même soir (cadrage v2 § 5.1). Le rendu lit le registre, il n'écrit rien.
    'labo-longitudinal': function () {
        if (typeof initialiserRegistreLongitudinal === 'function') {
            initialiserRegistreLongitudinal();
        }
    },

    // === RÉGLAGES ===
    'reglages-preferences': function () {
        if (typeof initialiserPreferencesV2 === 'function') {
            setTimeout(initialiserPreferencesV2, 100);
        }
    },
    'reglages-donnees': function () {
        if (typeof chargerVueDonnees === 'function') {
            setTimeout(chargerVueDonnees, 100);
        }
    }
};

/**
 * La configuration AFFICHÉE d'une section : une COPIE filtrée. `configurationsOnglets` (config.js, protégé)
 * n'est jamais muté, et le registre des identifiants valides (afficherSousSection) continue de le lire en entier.
 * - #345 : masquage réversible du comparateur (flag COMPARATEUR_VISIBLE, config.js).
 * - Lot E (consigne du 12 sept. 2026, 11 h ; autorisation de Grégoire pour cette zone protégée) : sur un service,
 *   Suivi n'affiche pas « Interventions » — c'est la même liste que « Rencontres », sous un second nom et avec
 *   les mots de l'enseignement. Rien n'est fusionné (jugé après le mois d'usage).
 */
function _configurationVisible(nomOnglet) {
    let configuration = configurationsOnglets[nomOnglet];
    if (configuration && nomOnglet === 'labo'
        && typeof COMPARATEUR_VISIBLE !== 'undefined' && !COMPARATEUR_VISIBLE) {
        configuration = configuration.filter(item => item.id !== 'comparateur');
    }
    if (configuration && nomOnglet === 'suivi' && _interventionsMasqueesSurService()) {
        configuration = configuration.filter(item => item.id !== 'interventions');
    }
    return configuration;
}

/** Lot E : vrai quand le contexte actif est un service — « Interventions » n'y a pas d'onglet. */
function _interventionsMasqueesSurService() {
    return typeof contexteActifEstService === 'function' && contexteActifEstService();
}

/** Pose les boutons de la barre ; celui dont l'id complet vaut `idActif` reçoit la classe « actif ». */
function _poserBoutonsSousNav(conteneurSousNav, nomOnglet, configuration, idActif) {
    const boutonsHtml = configuration.map((item) => {
        const sousOngletId = `${nomOnglet}-${item.id}`;
        const classeActive = sousOngletId === idActif ? ' class="actif"' : '';
        const tooltipAttr = TOOLTIPS_SOUS_NAV[sousOngletId] ? ` data-tooltip="${TOOLTIPS_SOUS_NAV[sousOngletId]}"` : '';
        return `<button data-sous-onglet="${sousOngletId}"${classeActive}${tooltipAttr}>${item.label}</button>`;
    }).join('');

    conteneurSousNav.innerHTML = boutonsHtml;
    conteneurSousNav.className = `sous-navigation section-${nomOnglet}`;
    conteneurSousNav.style.display = '';

    // Ajouter les événements aux sous-boutons
    conteneurSousNav.querySelectorAll('button').forEach(bouton => {
        bouton.addEventListener('click', function () {
            const idSousOnglet = this.getAttribute('data-sous-onglet');
            afficherSousSection(idSousOnglet);

            // Mettre à jour l'état actif
            conteneurSousNav.querySelectorAll('button').forEach(b => {
                b.classList.remove('actif');
            });
            this.classList.add('actif');
        });
    });
}

function afficherSousNavigation(nomOnglet) {
    const conteneurSousNav = document.getElementById('sous-navigation');
    const configuration = _configurationVisible(nomOnglet);

    if (!configuration || configuration.length === 0) {
        // Pas de sous-navigation pour cette section — masquer le conteneur
        conteneurSousNav.innerHTML = '';
        conteneurSousNav.className = 'sous-navigation vide';
        conteneurSousNav.style.display = 'none';
        sousSectionActive = null;
    } else {
        // Créer les boutons de sous-navigation, le premier actif, puis afficher la première sous-section
        const premiereSousSection = `${nomOnglet}-${configuration[0].id}`;
        _poserBoutonsSousNav(conteneurSousNav, nomOnglet, configuration, premiereSousSection);
        afficherSousSection(premiereSousSection);
    }
}

/**
 * Lot E (consigne du 12 sept. 2026) — la barre de Suivi suit le contexte actif. Appelé par mettreAJourContexteEntete
 * (contexte.js), à chaque activation : mesuré, une bascule de contexte ne repasse PAS par afficherSection
 * (changerGroupeCoursActifV2 et changerCoursDepuisEntete ne rechargent ni ne reconstruisent la barre).
 * Ne déplace personne : l'onglet actif reste actif. Seul celui qui vient de disparaître (« Interventions », en
 * passant sur un service) cède la place à « Rencontres » — la même liste, dans les mots de l'orthopédagogie.
 */
function rafraichirSousNavigationSelonContexte() {
    if (sectionActive !== 'suivi') return;
    const conteneurSousNav = document.getElementById('sous-navigation');
    const configuration = _configurationVisible('suivi');
    if (!conteneurSousNav || !configuration || configuration.length === 0) return;
    const encoreVisible = configuration.some(item => 'suivi-' + item.id === sousSectionActive);
    _poserBoutonsSousNav(conteneurSousNav, 'suivi', configuration, encoreVisible ? sousSectionActive : null);
    if (!encoreVisible) {
        afficherSousSection(sousSectionActive === 'suivi-interventions' ? 'suivi-rencontres' : 'suivi-' + configuration[0].id);
    }
}

/* ===============================
   🔄 FONCTION: AFFICHER UNE SOUS-SECTION
   Affiche une sous-section spécifique et met à jour les boutons
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche une sous-section spécifique
 * 
 * @param {string} idSousSection - Identifiant complet de la sous-section
 *                                Format: '{section}-{sous-section}'
 *                                Exemples: 'suivi-liste', 'suivi-profil',
 *                                         'conception-productions'
 * 
 * UTILISÉ PAR:
 * - afficherSousNavigation() pour la sous-section par défaut
 * - Événements click sur les boutons de sous-navigation
 * - Fonctions de navigation programmatique
 * 
 * FONCTIONNEMENT:
 * 1. Extrait la section parente depuis l'ID (avant le premier tiret)
 * 2. Masque toutes les sous-sections de cette section
 * 3. Affiche la sous-section demandée
 * 4. Met à jour la variable globale sousSectionActive
 * 5. Met à jour l'état actif des boutons de sous-navigation
 * 
 * EFFETS DE BORD:
 * - Modifie sousSectionActive (variable globale)
 * - Change les classes CSS des sous-sections et boutons
 * 
 * MODE DEBUG:
 * La fonction inclut des console.log pour faciliter le débogage.
 * Ces logs peuvent être retirés en production si nécessaire.
 * 
 * EXEMPLE:
 * afficherSousSection('suivi-saisie');
 * // → Affiche la sous-section de saisie des présences
 */


function afficherSousSection(idSousSection) {

    // ============================================
    // VALIDATION DES PARAMÈTRES
    // ============================================

    // Construire le registre des IDs valides à partir de configurationsOnglets
    const _idsValides = new Set();
    for (const [section, items] of Object.entries(configurationsOnglets)) {
        for (const item of items) {
            _idsValides.add(section + '-' + item.id);
        }
    }

    // Détection d'appels à arguments multiples (ex: 'suivi', 'profil')
    if (arguments.length > 1) {
        const idCorrige = Array.from(arguments).join('-');
        console.warn(
            '⚠️ afficherSousSection() appelée avec ' + arguments.length + ' arguments: ' +
            JSON.stringify(Array.from(arguments)) +
            ' → fusion automatique en "' + idCorrige + '"' +
            '\n   Corrigez l\'appel pour passer un seul argument.',
            '\n   Appelant:', new Error().stack.split('\n')[2]
        );
        idSousSection = idCorrige;
    }

    // Validation de type
    if (typeof idSousSection !== 'string' || !idSousSection) {
        console.error(
            '❌ afficherSousSection() : paramètre invalide:', idSousSection,
            '\n   Attendu: string (ex: "suivi-profil")',
            '\n   Appelant:', new Error().stack.split('\n')[2]
        );
        return;
    }

    // Validation contre le registre des IDs valides
    if (!_idsValides.has(idSousSection)) {
        // Chercher l'ID le plus proche (suggestion)
        let suggestion = '';
        const idLower = idSousSection.toLowerCase();
        for (const idValide of _idsValides) {
            if (idValide.includes(idLower) || idLower.includes(idValide)) {
                suggestion = idValide;
                break;
            }
        }
        // Recherche par suffixe si pas de match par inclusion
        if (!suggestion) {
            const suffixe = idSousSection.split('-').pop();
            for (const idValide of _idsValides) {
                if (idValide.endsWith('-' + suffixe)) {
                    suggestion = idValide;
                    break;
                }
            }
        }
        console.error(
            '❌ afficherSousSection() : ID inconnu "' + idSousSection + '"' +
            (suggestion ? '\n   → Vouliez-vous dire "' + suggestion + '" ?' : '') +
            '\n   IDs valides pour référence: ' + Array.from(_idsValides).join(', ') +
            '\n   Appelant:', new Error().stack.split('\n')[2]
        );
    }


    // ============================================
    // NETTOYAGE DES MODULES EN QUITTANT
    // ============================================

    // Nettoyer la Modelisation quand on la quitte
    if (sousSectionActive === 'labo-modelisation' && idSousSection !== 'labo-modelisation') {
        if (typeof window.modelisation !== 'undefined') {
            window.modelisation.nettoyer();
        }
    }

    // Extraire la section parente depuis configurationsOnglets
    // (évite le parsing fragile par split qui ne gère pas les sections composées)
    let section = null;
    for (const sectionId of Object.keys(configurationsOnglets)) {
        if (idSousSection.startsWith(sectionId + '-')) {
            // Prendre le match le plus long (ex: 'reglages' > 'reg')
            if (!section || sectionId.length > section.length) {
                section = sectionId;
            }
        }
    }


    // CORRECTION : Masquer TOUTES les sous-sections de TOUTES les sections
    document.querySelectorAll('.sous-section').forEach(ss => {
        ss.classList.remove('active');
    });

    // Afficher uniquement la sous-section demandée
    const sousSection = document.getElementById(idSousSection);
    if (sousSection) {
        sousSection.classList.add('active');
        sousSectionActive = idSousSection;
    } else {
        console.error('   ❌ Sous-section introuvable:', idSousSection);
    }

    // Mettre à jour les boutons de sous-navigation
    const boutons = document.querySelectorAll('.sous-navigation button');

    let boutonTrouve = false;
    boutons.forEach(btn => {
        const dataSousOnglet = btn.getAttribute('data-sous-onglet');

        if (dataSousOnglet === idSousSection) {
            btn.classList.add('actif');
            boutonTrouve = true;
        } else {
            btn.classList.remove('actif');
        }
    });

    if (!boutonTrouve) {
        console.warn('   ⚠️ Aucun bouton correspondant trouvé pour:', idSousSection);
    }

    // ============================================
    // RAFRAÎCHISSEMENT DES MODULES PAR SOUS-SECTION
    // (dispatcher table-driven : voir INITIALISATEURS_SOUS_SECTION en tête de module)
    // ============================================

    const initialiserSousSection = INITIALISATEURS_SOUS_SECTION[idSousSection];
    if (typeof initialiserSousSection === 'function') {
        initialiserSousSection();
    }

    // Charger le profil étudiant (suivi-profil, anciennement tableau-bord-profil)
    // Garde anti-réentrance : afficherProfilComplet() appelle afficherSousSection()
    if (idSousSection === 'suivi-profil') {
        if (!window._profilAutoChargement) {
            window._profilAutoChargement = true;
            setTimeout(() => {
                try {
                    if (window.profilActuelDA) {
                        if (typeof afficherProfilComplet === 'function') afficherProfilComplet(window.profilActuelDA);
                    } else {
                        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
                            ? obtenirEtudiantsCoursActif()
                            : (typeof obtenirDonneesSelonMode === 'function'
                                ? obtenirDonneesSelonMode('groupeEtudiants') : []);
                        const actifs = etudiants.filter(e => !estEtudiantExclu(e));
                        actifs.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'));
                        if (actifs.length > 0 && typeof afficherProfilComplet === 'function') {
                            afficherProfilComplet(actifs[0].da);
                        }
                    }
                } finally {
                    window._profilAutoChargement = false;
                }
            }, 100);
        }
    }

    // Chantier 4 : Guidage contextuel en mode démo
    if (typeof afficherGuidageDemo === 'function') {
        afficherGuidageDemo(idSousSection);
    }

    // Événement public : permet aux modules externes (ex: flèches didactiques)
    // de réagir à un changement de sous-section sans coupler navigation.js.
    window.dispatchEvent(new CustomEvent('sectionAffichee', {
        detail: { idSousSection: idSousSection }
    }));
}

/* ===============================
   🔄 FONCTION: NAVIGUER VERS UNE SOUS-SECTION
   Point d'entrée unique pour la navigation programmatique
   Remplace le pattern afficherSection() + setTimeout + afficherSousSection()
   =============================== */

/**
 * Navigue vers une sous-section en gérant section + sous-section en une seule opération.
 *
 * @param {string} section - Identifiant de la section (ex: 'suivi', 'evaluations')
 * @param {string} sousSection - Identifiant court de la sous-section (ex: 'profil', 'liste')
 * @returns {boolean} true si la navigation a réussi, false sinon
 *
 * EXEMPLE:
 * naviguerVers('suivi', 'profil');
 * // → afficherSection('suivi') + afficherSousSection('suivi-profil')
 */
function naviguerVers(section, sousSection) {
    // Valider que la section existe
    const config = configurationsOnglets[section];
    if (!config) {
        console.error(
            '❌ naviguerVers() : section inconnue "' + section + '"' +
            '\n   Sections valides: ' + Object.keys(configurationsOnglets).join(', ') +
            '\n   Appelant:', new Error().stack.split('\n')[2]
        );
        return false;
    }

    // Valider que la sous-section existe dans cette section
    const sousSecExiste = config.some(function(item) { return item.id === sousSection; });
    if (!sousSecExiste) {
        const idsDispo = config.map(function(item) { return item.id; });
        console.error(
            '❌ naviguerVers() : sous-section "' + sousSection + '" inconnue dans "' + section + '"' +
            '\n   Sous-sections valides: ' + idsDispo.join(', ') +
            '\n   Appelant:', new Error().stack.split('\n')[2]
        );
        return false;
    }

    // Construire l'ID complet
    const idComplet = section + '-' + sousSection;

    // Naviguer : afficherSection gère la sous-nav de manière synchrone
    if (sectionActive !== section) {
        afficherSection(section);
    }
    afficherSousSection(idComplet);

    return true;
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - 01-config.js (configurationsOnglets, sectionActive, sousSectionActive)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - 03-etudiants.js (utilise afficherSection, afficherSousSection)
 * - 04-productions.js (utilise afficherSection, afficherSousSection)
 * - Autres modules fonctionnels utilisant la navigation
 * - 99-main.js (initialise les événements de navigation)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé APRÈS 01-config.js
 * Il DOIT être chargé AVANT tous les modules qui utilisent la navigation
 * 
 * INITIALISATION REQUISE (dans 99-main.js):
 * Les événements click sur les boutons de navigation principale doivent être
 * attachés au chargement de la page pour appeler afficherSection()
 * 
 * EXEMPLE D'INITIALISATION:
 * document.querySelectorAll('.navigation-principale button').forEach(bouton => {
 *     bouton.addEventListener('click', function() {
 *         const section = this.getAttribute('data-onglet');
 *         afficherSection(section);
 *     });
 * });
 * 
 * // Afficher la section par défaut
 * afficherSection('accueil');
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */