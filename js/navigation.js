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
 *                             Valeurs: 'tableau-bord' | 'etudiants' | 'presences' | 
 *                                     'evaluations' | 'reglages'
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
    // 🆕 BETA 92: Terminer le tutoriel si actif (évite que le bouton Suivant reste affiché)
    if (typeof terminerTutoriel === 'function') {
        terminerTutoriel();
    }

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
 *                            Valeurs: 'tableau-bord' | 'etudiants' | 'presences' | 
 *                                    'evaluations' | 'reglages'
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
const TOOLTIPS_SOUS_NAV = {
    'tableau-bord-apercu': 'nav-tdb-apercu',
    'tableau-bord-liste': 'nav-tdb-liste',
    'tableau-bord-profil': 'nav-tdb-profil',
    'tableau-bord-interventions': 'nav-tdb-interventions',
    'presences-apercu': 'nav-pres-apercu',
    'presences-calendrier': 'nav-pres-calendrier',
    'presences-saisie': 'nav-pres-saisie',
    'evaluations-apercu': 'nav-eval-apercu',
    'evaluations-liste': 'nav-eval-liste',
    'evaluations-importer': 'nav-eval-importer',
    'evaluations-annoter': 'nav-eval-annoter',
    'evaluations-exporter': 'nav-eval-exporter',
    'construction-apercu': 'nav-cn-apercu',
    'construction-productions': 'nav-cn-productions',
    'construction-grille-criteres': 'nav-cn-grilles',
    'construction-echelle-performance': 'nav-cn-echelles',
    'construction-retroactions': 'nav-cn-cartouches',
    'construction-pratiques-notation': 'nav-cn-pratiques',
    'boite-outils-tirage': 'nav-bao-tirage',
    'boite-outils-modelisation': 'nav-bao-modelisation',
    'planification-carte': 'nav-planif-alignement',
    'planification-organisateur': 'nav-planif-organisateur',
    'reglages-trimestre': 'nav-reg-trimestre',
    'reglages-preferences': 'nav-reg-preferences',
    'reglages-depistage': 'nav-reg-depistage',
    'reglages-donnees': 'nav-reg-donnees',
    'reglages-a-propos': 'nav-reg-apropos'
};

function afficherSousNavigation(nomOnglet) {
    const conteneurSousNav = document.getElementById('sous-navigation');
    const configuration = configurationsOnglets[nomOnglet];

    if (!configuration || configuration.length === 0) {
        // Pas de sous-navigation pour cette section — masquer le conteneur
        conteneurSousNav.innerHTML = '';
        conteneurSousNav.className = 'sous-navigation vide';
        conteneurSousNav.style.display = 'none';
        sousSectionActive = null;
    } else {
        // Créer les boutons de sous-navigation
        const boutonsHtml = configuration.map((item, index) => {
            const classeActive = index === 0 ? ' class="actif"' : '';
            const sousOngletId = `${nomOnglet}-${item.id}`;
            const tooltipAttr = TOOLTIPS_SOUS_NAV[sousOngletId] ? ` data-tooltip="${TOOLTIPS_SOUS_NAV[sousOngletId]}"` : '';
            return `<button data-sous-onglet="${sousOngletId}"${classeActive}${tooltipAttr}>${item.label}</button>`;
        }).join('');

        conteneurSousNav.innerHTML = boutonsHtml;
        conteneurSousNav.className = 'sous-navigation';
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

        // Afficher la première sous-section par défaut
        if (configuration.length > 0) {
            const premiereSousSection = `${nomOnglet}-${configuration[0].id}`;
            afficherSousSection(premiereSousSection);
        }
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
 *                                Exemples: 'etudiants-liste', 'presences-saisie',
 *                                         'reglages-productions'
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
 * afficherSousSection('presences-saisie');
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

    // Détection d'appels à arguments multiples (ex: 'tableau-bord', 'profil')
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
            '\n   Attendu: string (ex: "tableau-bord-profil")',
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

    console.log('🔵 afficherSousSection:', idSousSection);

    // ============================================
    // NETTOYAGE DES MODULES EN QUITTANT
    // ============================================

    // Nettoyer la Modelisation quand on la quitte
    if (sousSectionActive === 'boite-outils-modelisation' && idSousSection !== 'boite-outils-modelisation') {
        if (typeof window.modelisation !== 'undefined') {
            window.modelisation.nettoyer();
        }
    }

    // Extraire la section parente depuis configurationsOnglets
    // (évite le parsing fragile par split qui ne gère pas les sections composées)
    let section = null;
    for (const sectionId of Object.keys(configurationsOnglets)) {
        if (idSousSection.startsWith(sectionId + '-')) {
            // Prendre le match le plus long (ex: 'boite-outils' > 'boite')
            if (!section || sectionId.length > section.length) {
                section = sectionId;
            }
        }
    }

    console.log('   Section:', section);

    // CORRECTION : Masquer TOUTES les sous-sections de TOUTES les sections
    document.querySelectorAll('.sous-section').forEach(ss => {
        ss.classList.remove('active');
    });

    // Afficher uniquement la sous-section demandée
    const sousSection = document.getElementById(idSousSection);
    if (sousSection) {
        sousSection.classList.add('active');
        sousSectionActive = idSousSection;
        console.log('   ✅ Sous-section affichée');
    } else {
        console.error('   ❌ Sous-section introuvable:', idSousSection);
    }

    // Mettre à jour les boutons de sous-navigation
    const boutons = document.querySelectorAll('.sous-navigation button');
    console.log('   Nombre de boutons trouvés:', boutons.length);

    let boutonTrouve = false;
    boutons.forEach(btn => {
        const dataSousOnglet = btn.getAttribute('data-sous-onglet');
        console.log('   Bouton data-sous-onglet:', dataSousOnglet);

        if (dataSousOnglet === idSousSection) {
            btn.classList.add('actif');
            boutonTrouve = true;
            console.log('   ✅ Bouton activé');
        } else {
            btn.classList.remove('actif');
        }
    });

    if (!boutonTrouve) {
        console.warn('   ⚠️ Aucun bouton correspondant trouvé pour:', idSousSection);
    }

    // ============================================
    // RAFRAÎCHISSEMENT DES MODULES PAR SOUS-SECTION
    // ============================================

    switch (idSousSection) {
        case 'tableau-bord-liste':
            if (typeof rechargerListeEtudiants === 'function') {
                setTimeout(rechargerListeEtudiants, 100);
            }
            break;

        case 'presences-apercu':
            console.log('🔄 Rafraîchissement de l\'aperçu des présences...');
            if (typeof chargerApercuPresences === 'function') {
                chargerApercuPresences();
            }
            break;

        case 'presences-calendrier':
            console.log('🔄 Rafraîchissement de la vue calendaire...');
            if (typeof afficherCalendrierScolaire === 'function') {
                afficherCalendrierScolaire();
            }
            break;

        // ✨ REFONTE (2 jan 2026) : "materiel" → "construction"
        case 'construction-productions':
            console.log('🔄 Rafraîchissement du module Productions...');
            if (typeof initialiserModuleProductions === 'function') {
                initialiserModuleProductions();
            }
            break;

        case 'construction-grille-criteres':
            console.log('🔄 Rafraîchissement du module Grilles...');
            if (typeof initialiserModuleGrilles === 'function') {
                setTimeout(async () => {
                    await initialiserModuleGrilles();
                    console.log('   ✅ Module Grilles initialisé');
                }, 100);
            }
            break;

        case 'construction-echelle-performance':
            console.log('🔄 Rafraîchissement du module Échelles...');
            if (typeof initialiserModuleEchelles === 'function') {
                setTimeout(async () => {
                    await initialiserModuleEchelles();
                    console.log('   ✅ Module Échelles initialisé');
                }, 100);
            }
            break;

        case 'construction-pratiques-notation':
            console.log('🔄 Rafraîchissement du module Pratiques (Construction)...');
            if (typeof initialiserModulePratiquesMateriel === 'function') {
                setTimeout(async () => {
                    await initialiserModulePratiquesMateriel();
                    console.log('   ✅ Module Pratiques (Construction) initialisé');
                }, 100);
            }
            break;

        case 'construction-retroactions':
            console.log('🔄 Rafraîchissement du module Cartouches...');
            if (typeof initialiserModuleCartouches === 'function') {
                setTimeout(async () => {
                    await initialiserModuleCartouches();
                    console.log('   ✅ Module Cartouches initialisé');
                }, 100);
            }
            break;

        case 'reglages-trimestre':
            console.log('🔄 Rafraîchissement du module Trimestre...');
            if (typeof initialiserModuleTrimestre === 'function') {
                initialiserModuleTrimestre();
            }
            break;

        // ✨ NOUVEAUX ONGLETS RÉGLAGES (Beta 95)
        case 'reglages-trimestres':
            console.log('🔄 Chargement de Mes trimestres...');
            if (typeof chargerVueTrimestres === 'function') {
                setTimeout(chargerVueTrimestres, 100);
            }
            break;

        // NOTE: reglages-cours-actif supprimé (Beta 95), consolidé dans reglages-trimestre

        case 'reglages-preferences':
            console.log('🔄 Chargement des Préférences...');
            if (typeof initialiserPreferencesV2 === 'function') {
                setTimeout(initialiserPreferencesV2, 100);
            }
            if (window.parcours && window.parcours.initialiserPreferencesParcours) {
                setTimeout(window.parcours.initialiserPreferencesParcours, 150);
            }
            break;

        case 'reglages-depistage':
            console.log('🔄 Chargement du Dépistage...');
            if (typeof initialiserPreferencesV2 === 'function') {
                setTimeout(initialiserPreferencesV2, 100);
            }
            break;

        case 'reglages-donnees':
            console.log('🔄 Chargement de Données...');
            if (typeof chargerVueDonnees === 'function') {
                setTimeout(chargerVueDonnees, 100);
            }
            break;

        // NOTE: reglages-groupe supprimé (Beta 95), consolidé dans reglages-trimestre

        // NOTE: reglages-pratique-notation supprimé (2 jan 2026)
        // Fonctionnalité migrée vers Construction > Pratiques de notation

        case 'evaluations-apercu':
            console.log('🔄 Rafraîchissement de l\'aperçu des évaluations...');
            if (typeof chargerApercuEvaluations === 'function') {
                chargerApercuEvaluations();
            }
            break;

        case 'evaluations-liste':
            console.log('🔄 Rafraîchissement de la liste des évaluations...');
            console.log('   Type de initialiserListeEvaluations:', typeof initialiserListeEvaluations);
            if (typeof initialiserListeEvaluations === 'function') {
                console.log('   ✅ Fonction trouvée, appel dans 100ms...');
                setTimeout(() => {
                    console.log('   🎯 Appel de initialiserListeEvaluations()');
                    initialiserListeEvaluations();
                }, 100);
            } else {
                console.error('   ❌ initialiserListeEvaluations n\'est pas une fonction!');
            }
            break;

        case 'reglages-apercu':
            if (typeof chargerStatistiquesApercu === 'function') {
                chargerStatistiquesApercu();
            }
            break;

        case 'construction-apercu':
            console.log('🔄 Rafraîchissement de l\'aperçu Construction de la note...');
            if (typeof chargerMaterielConfigure === 'function') {
                chargerMaterielConfigure();
            }
            break;

        case 'reglages-snapshots':
            console.log('🔄 Affichage du statut des snapshots...');
            if (typeof afficherStatutSnapshots === 'function') {
                setTimeout(afficherStatutSnapshots, 100);
            }
            break;

        // Module Planification (Carte mentale)
        case 'planification-carte':
            console.log('🔄 Initialisation du module Planification...');
            if (typeof initialiserModulePlanification === 'function') {
                setTimeout(initialiserModulePlanification, 100);
            }
            break;

        // Module Organisateur (sous-onglet Planification)
        case 'planification-organisateur':
            console.log('🔄 Initialisation du module Organisateur...');
            if (typeof initialiserModuleOrganisateur === 'function') {
                setTimeout(initialiserModuleOrganisateur, 100);
            }
            break;

        // 🆕 BETA 96.1 : Boîte à outils
        case 'boite-outils-tirage':
            console.log('🔄 Initialisation de la boîte à outils...');
            if (typeof initialiserTirage === 'function') {
                setTimeout(initialiserTirage, 100);
            }
            if (typeof initialiserQuestions === 'function') {
                setTimeout(initialiserQuestions, 100);
            }
            break;

        case 'boite-outils-modelisation':
            console.log('🔄 Initialisation de la Modelisation...');
            if (typeof initialiserModelisation === 'function') {
                setTimeout(initialiserModelisation, 100);
            }
            break;

        // Onglet Importer et préparer
        case 'evaluations-importer':
            console.log('🔄 Initialisation du module Travaux (Import)...');
            if (typeof initialiserModuleTravaux === 'function') {
                setTimeout(() => {
                    initialiserModuleTravaux();
                    if (typeof travauxUI !== 'undefined') {
                        travauxUI.afficherImport();
                    }
                }, 100);
            }
            break;

        // Onglet Annoter et évaluer
        case 'evaluations-annoter':
            console.log('🔄 Initialisation du module Travaux (Annoter)...');
            if (typeof initialiserModuleTravaux === 'function') {
                setTimeout(() => {
                    initialiserModuleTravaux();
                }, 100);
            }
            break;

        // Onglet Exporter et archiver
        case 'evaluations-exporter':
            console.log('🔄 Initialisation du module Travaux (Exporter)...');
            if (typeof initialiserModuleTravaux === 'function') {
                setTimeout(() => {
                    initialiserModuleTravaux();
                    if (typeof travauxUI !== 'undefined') {
                        travauxUI.afficherArchivage();
                    }
                }, 100);
            }
            break;
    }

        // Recharger le tableau de bord selon la sous-section
    if (idSousSection === 'tableau-bord-apercu') {
        console.log('🔄 Rechargement automatique de l\'aperçu...');
        if (typeof chargerTableauBordApercu === 'function') {
            setTimeout(() => chargerTableauBordApercu(), 150);
        }
    } else if (idSousSection === 'tableau-bord-liste') {
        // Recharger la liste des étudiants
        if (typeof chargerListeEtudiants === 'function') {
            setTimeout(() => chargerListeEtudiants(), 100);
        }
    } else if (idSousSection === 'tableau-bord-profil') {
        // Charger le dernier profil consulté, ou le premier étudiant
        // Garde anti-réentrance : afficherProfilComplet() appelle afficherSousSection()
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
                        const actifs = etudiants.filter(e => e.statut !== 'décrochage' && e.statut !== 'abandon');
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

    // Parcours d'apprentissage : vérifier les jalons
    if (window.parcours && typeof window.parcours.onNavigationChange === 'function') {
        window.parcours.onNavigationChange(idSousSection);
    }
}

/* ===============================
   🔄 FONCTION: NAVIGUER VERS UNE SOUS-SECTION
   Point d'entrée unique pour la navigation programmatique
   Remplace le pattern afficherSection() + setTimeout + afficherSousSection()
   =============================== */

/**
 * Navigue vers une sous-section en gérant section + sous-section en une seule opération.
 *
 * @param {string} section - Identifiant de la section (ex: 'tableau-bord', 'evaluations')
 * @param {string} sousSection - Identifiant court de la sous-section (ex: 'profil', 'liste')
 * @returns {boolean} true si la navigation a réussi, false sinon
 *
 * EXEMPLE:
 * naviguerVers('tableau-bord', 'profil');
 * // → afficherSection('tableau-bord') + afficherSousSection('tableau-bord-profil')
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
 * afficherSection('tableau-bord');
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */