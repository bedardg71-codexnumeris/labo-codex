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
function afficherSousNavigation(nomOnglet) {
    const conteneurSousNav = document.getElementById('sous-navigation');
    const configuration = configurationsOnglets[nomOnglet];

    if (!configuration || configuration.length === 0) {
        // Pas de sous-navigation pour cette section
        conteneurSousNav.innerHTML = '<div class="vide">Pas de sous-sections pour cette page</div>';
        conteneurSousNav.className = 'sous-navigation vide';
        sousSectionActive = null;
    } else {
        // Créer les boutons de sous-navigation
        const boutonsHtml = configuration.map((item, index) => {
            const classeActive = index === 0 ? ' class="actif"' : '';
            return `<button data-sous-onglet="${nomOnglet}-${item.id}"${classeActive}>${item.label}</button>`;
        }).join('');

        conteneurSousNav.innerHTML = boutonsHtml;
        conteneurSousNav.className = 'sous-navigation';

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
    console.log('🔵 afficherSousSection appelée avec:', idSousSection);

    // Extraire la section parente
    const parties = idSousSection.split('-');
    let section;
    if (parties.length > 2 && parties[0] === 'tableau') {
        section = parties[0] + '-' + parties[1];
    } else {
        section = parties[0];
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

        case 'presences-calendrier':
            console.log('🔄 Rafraîchissement de la vue calendaire...');
            if (typeof afficherCalendrierScolaire === 'function') {
                afficherCalendrierScolaire();
            }
            break;

        case 'reglages-productions':
            console.log('🔄 Rafraîchissement du module Productions...');
            if (typeof initialiserModuleProductions === 'function') {
                initialiserModuleProductions();
            }
            break;

        case 'reglages-trimestre':
            console.log('🔄 Rafraîchissement du module Trimestre...');
            if (typeof initialiserModuleTrimestre === 'function') {
                initialiserModuleTrimestre();
            }
            break;

        case 'evaluations-liste':
            console.log('🔄 Rafraîchissement de la liste des évaluations...');
            if (typeof chargerListeEvaluationsRefonte === 'function') {
                setTimeout(() => chargerListeEvaluationsRefonte(), 100);
            }
            break;

        case 'reglages-apercu':
            if (typeof chargerStatistiquesApercu === 'function') {
                chargerStatistiquesApercu();
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
        // Le profil se charge quand on clique sur un étudiant
        // Pas besoin de recharger automatiquement
    }

        // Recharger le tableau de bord selon la sous-section
    if (idSousSection === 'tableau-bord-apercu') {
        console.log('🔄 Rechargement automatique de l\'aperçu...');
        if (typeof chargerTableauBordApercu === 'function') {
            setTimeout(() => chargerTableauBordApercu(), 150);
        }
    }
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