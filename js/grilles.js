/* ===============================
   MODULE 05: GESTION DES GRILLES DE CRITÈRES
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT CRITIQUE ⚠️
   INTERDICTION ABSOLUE de modifier les noms de fonctions.
   Les identifiants HTML et les clés localStorage sont protégés.
   Seuls les commentaires peuvent être modifiés/ajoutés.
   
   Contenu de ce module:
   - Gestion des grilles de critères d'évaluation
   - Ajout, modification, suppression de critères
   - Duplication et sauvegarde de grilles
   - Calcul des pondérations
   - Verrouillage des critères
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Variables du module 01-config.js:
   - grilleTemplateActuelle : Grille actuellement en édition
   - critereEnEdition : ID du critère en cours d'édition (variable globale locale)
   - echapperHtml() : Fonction de sécurité XSS (si utilisée)
   
   Variables globales locales:
   - window.tempCriteres : Array temporaire pour nouvelle grille
   
   Fonctions du module 14-utilitaires.js (si disponibles):
   - notifications.succes(message, details)
   - notifications.erreur(message, details)
   
   Éléments HTML requis:
   - #selectGrilleTemplate : Select des grilles
   - #nomGrilleContainer : Conteneur du nom de grille
   - #nomGrilleTemplate : Input du nom
   - #criteresContainer : Conteneur des critères
   - #listeCriteres : Liste des critères
   - #formAjoutCritere : Formulaire de critère
   - #totalPonderationCriteres : Total pondération
   - #statutPonderationCriteres : Statut pondération
   - #modalGrilles : Modal des grilles existantes
   - Tous les champs du formulaire (critereNom, critereDescription, etc.)
   
   LocalStorage utilisé:
   - 'grillesTemplates' : Array des grilles de critères
   =============================== */

/* ===============================
   🔄 VARIABLE GLOBALE MODULE
   Critère en cours d'édition
   =============================== */

/**
 * ID du critère actuellement en cours d'édition
 * null si création d'un nouveau critère
 * 
 * Note: Déclarée ici car spécifique à ce module
 */
let critereEnEdition = null;

/* ===============================
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les grilles avec des noms similaires
   =============================== */

/**
 * Générer un badge de source pour une grille
 * @param {Object} grille - La grille
 * @param {Array} grillesLocales - Grilles locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourceGrille(grille, grillesLocales) {
    return BibliothequeUI.genererBadgeSource(grille, grillesLocales);
}

function genererIdCourtGrille(id) {
    return BibliothequeUI.genererIdCourt(id);
}

/* ===============================
   FONCTION: CHARGER LISTE GRILLES
   Charge les grilles dans le select
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Charge la liste des grilles dans le sélecteur
 * 
 * UTILISÉ PAR:
 * - initialiserModuleGrilles() au chargement
 * - sauvegarderGrilleTemplate() après sauvegarde
 * - dupliquerGrille() après duplication
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les grilles depuis localStorage
 * 2. Génère les options du select
 * 3. Ajoute les options spéciales (nouvelle grille, créer)
 */
async function chargerListeGrillesTemplates() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const select = document.getElementById('selectGrilleTemplate');

    if (!select) return;

    select.innerHTML = '<option value="">-- Nouvelle grille --</option>' +
        '<option value="new">➕ Créer une nouvelle grille</option>' +
        grilles.map(grille => `<option value="${echapperHtml(grille.id)}">${echapperHtml(grille.nom)}</option>`).join('');
}

/* ===============================
   FONCTION: CHARGER GRILLE TEMPLATE
   Charge une grille pour édition
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Charge une grille de critères pour édition ou crée une nouvelle
 *
 * UTILISÉ PAR:
 * - Select "Créer ou modifier une grille" (événement onchange)
 * - chargerGrilleEnEdition() depuis le modal
 *
 * FONCTIONNEMENT:
 * 1. Récupère l'ID sélectionné
 * 2. Si vide ou "new" : mode création
 *    - Affiche champ nom
 *    - Cache bouton dupliquer
 *    - Initialise tempCriteres
 * 3. Si ID existant : mode édition
 *    - Charge la grille
 *    - Affiche ses critères
 *    - Affiche bouton dupliquer
 */
async function chargerGrilleTemplate(grilleId) {
    // Afficher le conteneur d'édition et cacher la vue hiérarchique
    const conteneurEdition = document.getElementById('conteneurEditionGrille');
    const vueHierarchique = document.getElementById('vueGrillesCriteres');
    if (conteneurEdition) conteneurEdition.classList.remove('u-hide');
    if (vueHierarchique) vueHierarchique.classList.add('u-hide');

    // Si aucun ID fourni en paramètre, lire depuis le select
    const select = document.getElementById('selectGrilleTemplate');
    const selectValue = grilleId || (select ? select.value : '');
    const nomContainer = document.getElementById('nomGrilleContainer');
    const nomInput = document.getElementById('nomGrilleTemplate');
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const criteresContainer = document.getElementById('criteresContainer');
    const aucuneEvalDiv = document.getElementById('aucuneEvalSelectionnee');

    if (!selectValue || selectValue === 'new') {
        // Mode création nouvelle grille
        if (nomContainer) nomContainer.classList.remove('u-hide');
        if (nomInput) nomInput.value = '';
        if (criteresContainer) criteresContainer.classList.remove('u-hide');
        if (aucuneEvalDiv) aucuneEvalDiv.classList.add('u-hide');
        if (btnDupliquer) btnDupliquer.classList.add('u-hide');

        // Initialiser avec un tableau vide
        grilleTemplateActuelle = null;
        window.tempCriteres = window.tempCriteres || [];
        afficherListeCriteres(window.tempCriteres, null);
    } else {
        // Charger la grille existante
        const grilles = await db.get(cle('grillesTemplates')) || [];
        const grille = grilles.find(g => g.id === selectValue);

        if (grille) {
            // Mettre à jour le select si un ID a été passé en paramètre
            if (grilleId && select) {
                select.value = grilleId;
            }

            grilleTemplateActuelle = grille;
            if (nomContainer) nomContainer.classList.remove('u-hide');
            if (nomInput) nomInput.value = grille.nom;
            if (criteresContainer) criteresContainer.classList.remove('u-hide');
            if (aucuneEvalDiv) aucuneEvalDiv.classList.add('u-hide');
            if (btnDupliquer) btnDupliquer.classList.remove('u-hide');

            afficherListeCriteres(grille.criteres || [], grille.id);

            // Scroll vers le conteneur d'édition
            if (conteneurEdition) {
                conteneurEdition.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Afficher l'apercu PDF (Beta 95.7 - #30)
            if (typeof window.afficherApercuGrilleSelectionnee === 'function') {
                window.afficherApercuGrilleSelectionnee();
            }
        }
    }
}

/* ===============================
   FONCTION: AFFICHER FORMULAIRE CRITÈRE
   Affiche le formulaire d'ajout/modification
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche et configure le formulaire de critère
 * 
 * @param {string} id - ID du critère à modifier (null pour création)
 * 
 * UTILISÉ PAR:
 * - Bouton "+ Ajouter un critère"
 * - modifierCritere(id) pour édition
 * 
 * FONCTIONNEMENT:
 * 1. Affiche le formulaire
 * 2. Cache le bouton d'ajout
 * 3. Si id fourni : mode modification
 *    - Charge les données du critère
 *    - Remplit les champs
 * 4. Sinon : mode création
 *    - Vide les champs
 */
function afficherFormCritere(id = null) {
    const form = document.getElementById('formAjoutCritere');
    const btnAjouter = document.getElementById('btnAjouterCritere');
    const btnTexte = document.getElementById('btnTexteCritere');

    if (!form || !btnAjouter) return;

    form.classList.remove('u-hide');
    btnAjouter.classList.add('u-hide');

    if (id) {
        // Mode édition
        let critere = null;
        if (grilleTemplateActuelle) {
            critere = grilleTemplateActuelle.criteres.find(c => c.id === id);
        } else if (window.tempCriteres) {
            critere = window.tempCriteres.find(c => c.id === id);
        }

        if (critere) {
            critereEnEdition = id;
            if (btnTexte) btnTexte.textContent = 'Sauvegarder';
            document.getElementById('critereNom').value = critere.nom;
            document.getElementById('criterePonderation').value = critere.ponderation || '';
            document.getElementById('critereDescription').value = critere.description || '';
            document.getElementById('critereType').value = critere.type;
            document.getElementById('critereFormule').value = critere.formule || '';
            afficherChampFormule();
        }
    } else {
        // Mode ajout
        critereEnEdition = null;
        if (btnTexte) btnTexte.textContent = 'Ajouter et continuer';
        document.getElementById('critereNom').value = '';
        document.getElementById('criterePonderation').value = '';
        document.getElementById('critereDescription').value = '';
        document.getElementById('critereType').value = 'holistique';
        document.getElementById('critereFormule').value = '';
        afficherChampFormule();
    }
}

/* ===============================
   FONCTION: SAUVEGARDER CRITÈRE
   Enregistre un critère
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde un critère dans la grille
 * 
 * UTILISÉ PAR:
 * - Bouton "Ajouter et continuer" du formulaire
 * - sauvegarderEtFermer() pour sauvegarder puis fermer
 * 
 * FONCTIONNEMENT:
 * 1. Valide les champs obligatoires
 * 2. Crée l'objet critère
 * 3. Si grilleTemplateActuelle existe :
 *    - Ajoute ou modifie dans criteres[]
 *    - Sauvegarde auto de la grille
 * 4. Sinon : ajoute à tempCriteres
 * 5. Rafraîchit l'affichage
 * 6. Réinitialise le formulaire
 */
async function sauvegarderCritere() {
    const nom = document.getElementById('critereNom')?.value?.trim();
    if (!nom) {
        alert('Le nom du critère est obligatoire');
        return;
    }

    // Vérifier qu'on a un nom de grille
    const nomGrille = document.getElementById('nomGrilleTemplate')?.value?.trim();
    if (!nomGrille) {
        alert('Veuillez d\'abord donner un nom à la grille');
        const nomInput = document.getElementById('nomGrilleTemplate');
        if (nomInput) nomInput.focus();
        return;
    }

    // Créer l'objet critère
    const critere = {
        nom: nom,
        description: document.getElementById('critereDescription')?.value?.trim() || '',
        ponderation: parseInt(document.getElementById('criterePonderation')?.value) || 0,
        type: document.getElementById('critereType')?.value || 'holistique',
        formule: document.getElementById('critereFormule')?.value?.trim() || '',
        niveauSOLO: 'multistructurel',
        verrouille: false
    };

    // Si on est en édition de grille existante
    if (grilleTemplateActuelle) {
        if (!grilleTemplateActuelle.criteres) {
            grilleTemplateActuelle.criteres = [];
        }

        if (critereEnEdition) {
            // Modifier le critère existant
            const index = grilleTemplateActuelle.criteres.findIndex(c => c.id === critereEnEdition);
            if (index !== -1) {
                grilleTemplateActuelle.criteres[index] = { 
                    ...grilleTemplateActuelle.criteres[index], 
                    ...critere 
                };
            }
        } else {
            // Ajouter nouveau critère
            critere.id = genererIdUnique('CR_');
            grilleTemplateActuelle.criteres.push(critere);
        }

        // Sauvegarder automatiquement la grille
        await sauvegarderGrilleTemplate(true);  // true = sauvegarde silencieuse
        afficherListeCriteres(grilleTemplateActuelle.criteres, grilleTemplateActuelle.id);

    } else {
        // Mode création nouvelle grille - utiliser tempCriteres
        if (!window.tempCriteres) {
            window.tempCriteres = [];
        }

        if (critereEnEdition) {
            const index = window.tempCriteres.findIndex(c => c.id === critereEnEdition);
            if (index !== -1) {
                window.tempCriteres[index] = { ...window.tempCriteres[index], ...critere };
            }
        } else {
            critere.id = genererIdUnique('CR_');
            window.tempCriteres.push(critere);
        }

        afficherListeCriteres(window.tempCriteres, null);
    }

    // Réinitialiser le formulaire
    document.getElementById('critereNom').value = '';
    document.getElementById('critereDescription').value = '';
    document.getElementById('criterePonderation').value = '';
    document.getElementById('critereType').value = 'holistique';
    document.getElementById('critereFormule').value = '';
    afficherChampFormule();

    critereEnEdition = null;

    // Notification
    notifications.succes(`Critère "${nom}" ajouté et grille "${nomGrille}" sauvegardée !`);
}

/* ===============================
   FONCTION: SAUVEGARDER ET FERMER
   Sauvegarde puis ferme le formulaire
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde un critère et ferme le formulaire
 * 
 * UTILISÉ PAR:
 * - Bouton "Ajouter et fermer" du formulaire
 * 
 * FONCTIONNEMENT:
 * Appelle sauvegarderCritere() puis annulerAjoutCritere()
 */
async function sauvegarderEtFermer() {
    await sauvegarderCritere();
    setTimeout(() => {
        annulerAjoutCritere();
    }, 500);
}

/* ===============================
   ❌ FONCTION: ANNULER AJOUT CRITÈRE
   Ferme le formulaire de critère
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Annule l'ajout ou la modification d'un critère
 * 
 * UTILISÉ PAR:
 * - Bouton "Fermer" du formulaire
 * - sauvegarderEtFermer() après sauvegarde
 * 
 * FONCTIONNEMENT:
 * 1. Cache le formulaire
 * 2. Réaffiche le bouton d'ajout
 * 3. Réinitialise critereEnEdition
 */
function annulerAjoutCritere() {
    const form = document.getElementById('formAjoutCritere');
    const btnAjouter = document.getElementById('btnAjouterCritere');

    if (form) form.classList.add('u-hide');
    if (btnAjouter) btnAjouter.classList.remove('u-hide');
    critereEnEdition = null;
}

/* ===============================
   FONCTION: MODIFIER CRITÈRE
   Lance la modification d'un critère
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Lance la modification d'un critère existant
 * 
 * @param {string} id - ID du critère à modifier
 * 
 * UTILISÉ PAR:
 * - Bouton "Modifier" dans la liste des critères
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie qu'une grille est active
 * 2. Trouve le critère
 * 3. Vérifie qu'il n'est pas verrouillé
 * 4. Appelle afficherFormCritere(id)
 */
function modifierCritere(id) {
    if (!grilleTemplateActuelle && (!window.tempCriteres || window.tempCriteres.length === 0)) {
        alert('Aucune grille en cours de modification');
        return;
    }

    afficherFormCritere(id);
}

/* ===============================
   FONCTION: SUPPRIMER CRITÈRE
   Supprime un critère après confirmation
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Supprime un critère de la grille
 * 
 * @param {string} id - ID du critère à supprimer
 * 
 * UTILISÉ PAR:
 * - Bouton "Supprimer" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie qu'une grille est active
 * 2. Trouve le critère
 * 3. Vérifie qu'il n'est pas verrouillé
 * 4. Demande confirmation
 * 5. Filtre le critère de la liste
 * 6. Sauvegarde et rafraîchit
 */
async function supprimerCritere(id) {
    if (!grilleTemplateActuelle && (!window.tempCriteres || window.tempCriteres.length === 0)) {
        alert('Aucune grille en cours de modification');
        return;
    }

    if (confirm('Es-tu sûr de vouloir supprimer ce critère ?')) {
        if (grilleTemplateActuelle) {
            grilleTemplateActuelle.criteres = grilleTemplateActuelle.criteres.filter(c => c.id !== id);
            await sauvegarderGrilleTemplate();
            afficherListeCriteres(grilleTemplateActuelle.criteres, grilleTemplateActuelle.id);
        } else {
            window.tempCriteres = window.tempCriteres.filter(c => c.id !== id);
            afficherListeCriteres(window.tempCriteres, null);
        }
    }
}

/* ===============================
   FONCTION: AFFICHER LISTE CRITÈRES
   Affiche tous les critères d'une grille
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche la liste complète des critères
 * 
 * @param {Array} criteres - Liste des critères
 * @param {string} grilleId - ID de la grille (ou null)
 * 
 * UTILISÉ PAR:
 * - chargerGrilleTemplate() après chargement
 * - sauvegarderCritere() après ajout/modification
 * - supprimerCritere() après suppression
 * 
 * FONCTIONNEMENT:
 * 1. Si liste vide : affiche message
 * 2. Sinon : génère le HTML pour chaque critère
 * 3. Calcule le total des pondérations
 */
function afficherListeCriteres(criteres, grilleId) {
    const container = document.getElementById('listeCriteres');

    if (!container) return;

    if (!criteres || criteres.length === 0) {
        container.innerHTML = '<p class="text-muted grille-italic">Aucun critère défini pour cette grille.</p>';
        const totalSpan = document.getElementById('totalPonderationCriteres');
        const statutSpan = document.getElementById('statutPonderationCriteres');
        if (totalSpan) totalSpan.textContent = '0%';
        if (statutSpan) statutSpan.textContent = '';
        return;
    }

    container.innerHTML = criteres.map(critere => `
        <div class="item-liste" style="margin-bottom: 8px; padding: 12px 15px;
             border-left: 4px solid var(--accent-primaire);
             display: flex; justify-content: space-between; align-items: center;">
            <div class="grille-flex-1">
                <div style="font-weight: 600; color: var(--accent-primaire); margin-bottom: 2px;">
                    ${echapperHtml(critere.nom)} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
                </div>
                ${critere.description ? `
                    <details class="grille-mt-4">
                        <summary style="cursor: pointer; color: var(--texte-secondaire); font-size: 0.85rem; padding: 4px 0;">
                            Voir la description
                        </summary>
                        <div style="margin-top: 8px; padding: 8px; background: var(--bleu-tres-pale);
                             border-radius: 4px; font-size: 0.85rem; color: var(--gris-moyen);">
                            ${echapperHtml(critere.description)}
                        </div>
                    </details>
                ` : ''}
            </div>
            <div style="white-space: nowrap; margin-left: 15px;">
                <button class="btn btn-modifier" data-action="modifierCritere" data-param="${critere.id}"
                        style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">
                    Modifier
                </button>
                <button class="btn btn-supprimer" data-action="supprimerCritere" data-param="${critere.id}"
                        style="padding: 4px 10px; font-size: 0.8rem;">
                    Supprimer
                </button>
            </div>
        </div>
    `).join('');

    calculerTotalPonderationCriteres(criteres);
}

/* ===============================
   🎯 FONCTION: AFFICHER CHAMP FORMULE
   Gère l'affichage conditionnel du champ formule
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche ou masque le champ formule selon le type
 * 
 * UTILISÉ PAR:
 * - Select "Type de critère" (événement onchange)
 * - afficherFormCritere() lors du chargement
 * 
 * FONCTIONNEMENT:
 * Si type = "algorithmique" : affiche le champ formule
 * Sinon : masque le champ
 */
function afficherChampFormule() {
    const type = document.getElementById('critereType')?.value;
    const champFormule = document.getElementById('champFormule');

    if (!champFormule) return;

    toggleDisplay(champFormule, type === 'algorithmique');
}

/* ===============================
   FONCTION: SAUVEGARDER GRILLE TEMPLATE
   Enregistre la grille complète
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde la grille de critères dans localStorage
 * 
 * @param {boolean} silencieux - Si true, pas de notification
 * 
 * UTILISÉ PAR:
 * - sauvegarderCritere() après chaque critère
 * - sauvegarderNomGrille() après changement de nom
 * - Bouton "Sauvegarder la grille" (enregistrerCommeGrille)
 * 
 * FONCTIONNEMENT:
 * 1. Valide le nom de la grille
 * 2. Si grilleTemplateActuelle existe : modification
 * 3. Sinon : création avec tempCriteres
 * 4. Sauvegarde dans localStorage
 * 5. Recharge le select
 * 6. Affiche notification si pas silencieux
 */
async function sauvegarderGrilleTemplate(silencieux = false) {
    let nomGrille = document.getElementById('nomGrilleTemplate')?.value?.trim();

    if (!nomGrille) {
        if (!silencieux) {
            alert('Le nom de la grille est obligatoire');
        }
        return;
    }

    let grilles = await db.get(cle('grillesTemplates')) || [];

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    const idActuel = grilleTemplateActuelle?.id || null;
    const isCreation = !grilleTemplateActuelle;
    const isNameChange = grilleTemplateActuelle && grilleTemplateActuelle.nom !== nomGrille;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        const resultat = await verifierEtGererDoublon('grille', nomGrille, grilles, idActuel);

        if (resultat === null) {
            // Utilisateur a annulé
            return;
        }

        if (resultat && resultat.action === 'renommer') {
            nomGrille = resultat.nouveauNom;
            document.getElementById('nomGrilleTemplate').value = nomGrille;
        }

        if (resultat && resultat.action === 'ecraser') {
            // Supprimer la grille existante avec le même nom
            grilles = grilles.filter(g => g.nom !== nomGrille);
        }
    }

    // Lire les pratiques compatibles sélectionnées
    const pratiquesCompatibles = typeof GabaritsUtils !== 'undefined'
        ? GabaritsUtils.lirePratiquesSelectionnees('grille')
        : [];

    if (grilleTemplateActuelle) {
        // Mode édition
        grilleTemplateActuelle.nom = nomGrille;
        grilleTemplateActuelle.description = document.getElementById('descriptionGrille')?.value?.trim() || '';
        grilleTemplateActuelle.pratiquesCompatibles = pratiquesCompatibles;
        grilleTemplateActuelle.dateModification = new Date().toISOString();

        // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
        if (typeof ajouterContributeurSiNecessaire === 'function') {
            grilleTemplateActuelle = ajouterContributeurSiNecessaire(grilleTemplateActuelle);
        }

        const index = grilles.findIndex(g => g.id === grilleTemplateActuelle.id);
        if (index === -1) {
            // 🔧 #466/CO-16 (21 août 2026) : la branche absente produisait un
            // « sauvegardée ! » SANS écriture quand la grille éditée n'est pas
            // dans le namespace du trimestre actif (édition à cheval sur une
            // bascule). Refus bruyant, patron de la sentinelle horaire (29 mai).
            console.warn('[Grilles] Sauvegarde refusée : grille', grilleTemplateActuelle.id, 'absente du trimestre actif', cle('grillesTemplates'));
            notifications.erreur(
                'Impossible d\'enregistrer cette grille',
                'Elle n\'appartient pas au trimestre actif. Bascule sur son trimestre pour la modifier.'
            );
            return;
        }
        grilles[index] = grilleTemplateActuelle;
    } else {
        // Mode création
        // 🆕 Beta 95.3 : Capturer discipline depuis infoCours
        const infoCours = typeof db !== 'undefined' && db.getSync ? db.getSync('infoCours', {}) : {};
        const discipline = infoCours?.discipline || '';

        // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
        const identiteUtilisateur = obtenirIdentiteCCUtilisateur();

        const nouvelleGrille = {
            id: genererIdUnique('GRILLE_'),
            nom: nomGrille,
            criteres: window.tempCriteres || [],
            pratiquesCompatibles: pratiquesCompatibles,
            discipline: discipline, // 🆕 Beta 95.3
            description: document.getElementById('descriptionGrille')?.value?.trim() || '',
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            dansBibliotheque: true,  // ✅ AJOUT (8 décembre 2025) - Nouvelle grille dans bibliothèque par défaut
            metadata_cc: {
                auteur_original: identiteUtilisateur,
                date_creation: new Date().toISOString().split('T')[0],
                contributeurs: []
            }
        };
        grilles.push(nouvelleGrille);
        grilleTemplateActuelle = nouvelleGrille;

        // Nettoyer les critères temporaires
        window.tempCriteres = [];
    }

    await db.set(cle('grillesTemplates'), grilles);

    // Recharger la liste des grilles
    await chargerListeGrillesTemplates();

    // Rafraîchir la nouvelle vue hiérarchique
    await afficherToutesLesGrillesCriteres();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeGrilles();

    // Sélectionner la grille actuelle
    const select = document.getElementById('selectGrilleTemplate');
    if (select && grilleTemplateActuelle) {
        select.value = grilleTemplateActuelle.id;
    }

    if (!silencieux) {
        notifications.succes(`Grille "${nomGrille}" sauvegardée !`);
    }
}

/* ===============================
   FONCTION: SAUVEGARDER NOM GRILLE
   Sauvegarde automatique du nom
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Sauvegarde automatique quand le nom change
 * 
 * UTILISÉ PAR:
 * - Input "Nom de la grille" (événement onchange)
 * 
 * FONCTIONNEMENT:
 * Appelle sauvegarderGrilleTemplate(true) en mode silencieux
 */
function sauvegarderNomGrille() {
    if (grilleTemplateActuelle) {
        sauvegarderGrilleTemplate(true);
    }
}

/* ===============================
   FONCTION: AFFICHER GRILLES CRITÈRES
   Affiche le modal des grilles existantes
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Affiche le modal avec toutes les grilles disponibles
 * 
 * UTILISÉ PAR:
 * - Bouton "Voir les grilles existantes"
 * 
 * FONCTIONNEMENT:
 * 1. Charge toutes les grilles
 * 2. Si liste vide : affiche message
 * 3. Sinon : génère le HTML pour chaque grille
 * 4. Affiche le modal
 */
async function afficherGrillesCriteres() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const listeDiv = document.getElementById('listeGrilles');

    if (!listeDiv) return;

    if (grilles.length === 0) {
        listeDiv.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; 
                 text-align: center; color: var(--bleu-leger);">
                <p>Aucune grille de critères disponible</p>
                <small>Crée d'abord une grille de critères pour pouvoir la réutiliser</small>
            </div>
        `;
    } else {
        listeDiv.innerHTML = grilles.map(grille => `
            <div class="item-liste" style="background: var(--bleu-tres-pale); padding: 15px; margin-bottom: 15px;">
                <div class="grille-flex-between-mb10">
                    <div>
                        <strong style="color: var(--accent-primaire);">${echapperHtml(grille.nom)}</strong>
                        <small style="color: var(--bleu-leger); margin-left: 10px;">
                            ${new Date(grille.dateCreation).toLocaleDateString()}
                        </small>
                        ${grille.baseSur ? `<br><small class="grille-texte-bleu-leger">(basé sur ${echapperHtml(grille.baseSur)})</small>` : ''}
                    </div>
                    <div class="grille-nowrap">
                        <button class="btn btn-principal" data-action="chargerGrilleEnEdition" data-param="${grille.id}">
                            Charger
                        </button>
                        <button class="btn btn-modifier" data-action="dupliquerGrille" data-param="${grille.id}">
                            Dupliquer
                        </button>
                        <button class="btn btn-supprimer" data-action="supprimerGrille" data-param="${grille.id}">
                            Supprimer
                        </button>
                    </div>
                </div>
                <div style="color: var(--gris-moyen); font-size: 0.85rem;">
                    <span class="grille-mr-20">${grille.criteres?.length || 0} critères</span>
                    <span>Pondération totale : ${grille.criteres?.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0) || 0}%</span>
                </div>
                <details class="u-mt-10">
                    <summary style="cursor: pointer; color: var(--texte-secondaire); font-size: 0.9rem;">
                        Voir les critères
                    </summary>
                    <div style="margin-top: 10px; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                        ${(grille.criteres || []).map(c => `
                            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--bleu-tres-pale);">
                                <strong>${echapperHtml(c.nom)}</strong> (${c.ponderation}% - ${getTypeCritereLabel(c.type)})
                                ${c.description ? `<br><small style="color: var(--gris-moyen);">${echapperHtml(c.description)}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </details>
            </div>
        `).join('');
    }

    const modal = document.getElementById('modalGrilles');
    if (modal) modal.classList.remove('u-hide');
}

/* ===============================
   ❌ FONCTION: FERMER MODAL GRILLES
   Ferme le modal des grilles
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Ferme le modal des grilles existantes
 * 
 * UTILISÉ PAR:
 * - Bouton de fermeture du modal
 * - Clic en dehors du modal
 * 
 * FONCTIONNEMENT:
 * Cache simplement le modal
 */
function fermerModalGrilles() {
    const modal = document.getElementById('modalGrilles');
    if (modal) modal.classList.add('u-hide');
}

/* ===============================
   FONCTION: CHARGER GRILLE EN ÉDITION
   Charge une grille depuis le modal
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Charge une grille pour édition depuis le modal
 * 
 * @param {string} grilleId - ID de la grille
 * 
 * UTILISÉ PAR:
 * - Bouton "Utiliser" dans le modal
 * 
 * FONCTIONNEMENT:
 * 1. Trouve la grille
 * 2. Met à jour le select
 * 3. Appelle chargerGrilleTemplate()
 * 4. Ferme le modal
 */
async function chargerGrilleEnEdition(grilleId) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (grille) {
        const select = document.getElementById('selectGrilleTemplate');
        if (select) select.value = grilleId;
        await chargerGrilleTemplate();
        fermerModalGrilles();
    }
}

/* ===============================
   FONCTION: SUPPRIMER GRILLE
   Supprime une grille après confirmation
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Supprime une grille de critères
 * 
 * @param {string} grilleId - ID de la grille
 * 
 * UTILISÉ PAR:
 * - Bouton "Supprimer" dans le modal
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Filtre la grille de la liste
 * 3. Sauvegarde dans localStorage
 * 4. Rafraîchit le modal
 */
async function supprimerGrille(grilleId) {
    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) {
        return;
    }

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(grilleId)) {
        window.marquerRessourceSupprimee(grilleId);
    }

    let grilles = await db.get(cle('grillesTemplates')) || [];
    grilles = grilles.filter(g => g.id !== grilleId);
    await db.set(cle('grillesTemplates'), grilles);

    // Rafraîchir le modal
    await afficherGrillesCriteres();

    // Recharger le select
    await chargerListeGrillesTemplates();

    // Rafraîchir la nouvelle vue hiérarchique
    await afficherToutesLesGrillesCriteres();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeGrilles();

    notifications.succes('Grille supprimée');
}

/* ===============================
   📑 FONCTION: DUPLIQUER GRILLE
   Duplique une grille depuis le modal
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Duplique une grille existante
 * 
 * @param {string} grilleId - ID de la grille à dupliquer
 * 
 * UTILISÉ PAR:
 * - Bouton "Dupliquer" dans le modal
 * 
 * FONCTIONNEMENT:
 * 1. Trouve la grille originale
 * 2. Demande un nouveau nom
 * 3. Crée une copie avec nouveaux IDs
 * 4. Sauvegarde
 * 5. Charge la nouvelle grille
 */
async function dupliquerGrille(grilleId) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grilleOriginale = grilles.find(g => g.id === grilleId);

    if (!grilleOriginale) {
        alert('Grille introuvable');
        return;
    }

    // Fermer le modal
    fermerModalGrilles();

    // Demander le nom de la nouvelle grille
    const nouveauNom = prompt('Nom de la nouvelle grille :', nommerCopie(grilleOriginale.nom, grilles));

    if (!nouveauNom || nouveauNom.trim() === '') {
        return;
    }

    // Auteur de l'utilisateur actif (CC BY) ; fallback « Inconnu » si pas défini
    const auteurActif = (typeof obtenirProfilAuteurActifSync === 'function'
        ? obtenirProfilAuteurActifSync()?.auteur_original
        : null) || 'Inconnu';

    // Créer la nouvelle grille. Elle devient un nouvel original de l'utilisateur,
    // avec trace d'origine `inspireDe` (respect CC BY quel que soit l'auteur source).
    // Si la source était une démo, le nouvel item perd le flag isDemo.
    const nouvelleGrille = {
        id: genererIdUnique('GRILLE_'),
        nom: nouveauNom.trim(),
        criteres: grilleOriginale.criteres.map(c => ({
            ...c,
            id: genererIdUnique('CR_')
        })),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        auteur: auteurActif,
        isDemo: false,
        // ✅ D5 — provenance COMPLÈTE (`sourceId` compris). Avant, l'objet était
        // construit à la main sur trois clés : deux grilles homonymes rendaient la
        // filiation indécidable.
        inspireDe: BibliothequeUI.forgerInspireDe(grilleOriginale),
        dansBibliotheque: true  // ✅ AJOUT (Beta 95.2 - Bug Bruno) - Grille dupliquée dans bibliothèque
    };

    // Sauvegarder
    grilles.push(nouvelleGrille);
    await db.set(cle('grillesTemplates'), grilles);

    // Charger la nouvelle grille en édition
    grilleTemplateActuelle = nouvelleGrille;
    await chargerListeGrillesTemplates();
    await afficherToutesLesGrillesCriteres();
    // ✅ AJOUT (Beta 95.2) : Rafraîchir la sidebar
    await afficherListeGrilles();
    const select = document.getElementById('selectGrilleTemplate');
    if (select) select.value = nouvelleGrille.id;
    await chargerGrilleTemplate();

    notifications.succes(`Grille "${nouvelleGrille.nom}" créée à partir de "${grilleOriginale.nom}" !`);
}

/* ===============================
   🔒 FONCTION: BASCULER VERROUILLAGE CRITÈRE
   Verrouille ou déverrouille un critère
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Bascule le verrouillage d'un critère
 * 
 * @param {string} critereId - ID du critère
 * 
 * UTILISÉ PAR:
 * - Checkbox "🔒" dans la liste
 * 
 * FONCTIONNEMENT:
 * 1. Trouve le critère
 * 2. Inverse son statut verrouille
 * 3. Sauvegarde si grille existante
 * 4. Rafraîchit l'affichage
 */
async function basculerVerrouillageCritere(critereId) {
    if (!grilleTemplateActuelle && (!window.tempCriteres || window.tempCriteres.length === 0)) {
        return;
    }

    let criteres;
    if (grilleTemplateActuelle) {
        criteres = grilleTemplateActuelle.criteres;
    } else {
        criteres = window.tempCriteres;
    }

    const index = criteres.findIndex(c => c.id === critereId);
    if (index !== -1) {
        // Basculer directement l'état (pas de checkbox, juste un span cliquable)
        criteres[index].verrouille = !criteres[index].verrouille;

        if (grilleTemplateActuelle) {
            // Sauvegarder en mode silencieux pour éviter la notification "Grille sauvegardée"
            await sauvegarderGrilleTemplate(true);

            // Afficher une notification spécifique au verrouillage
            const statut = criteres[index].verrouille ? 'verrouillé' : 'déverrouillé';
            notifications.succes(`Critère "${criteres[index].nom}" ${statut}`);
        }

        afficherListeCriteres(criteres, grilleTemplateActuelle?.id || null);
    }
}

/* ===============================
   FONCTION: GET TYPE CRITÈRE LABEL
   Retourne le libellé d'un type
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Convertit un code de type en libellé lisible
 * 
 * @param {string} type - Code du type
 * @returns {string} - Libellé du type
 * 
 * UTILISÉ PAR:
 * - afficherListeCriteres() pour l'affichage
 * - afficherGrillesCriteres() dans le modal
 * 
 * TYPES DISPONIBLES:
 * - holistique : Holistique (jugement global)
 * - analytique : Analytique (points par élément)
 * - algorithmique : Algorithmique (calcul automatique)
 */
function getTypeCritereLabel(type) {
    const labels = {
        'holistique': 'Holistique',
        'analytique': 'Analytique',
        'algorithmique': 'Algorithmique'
    };
    return labels[type] || type;
}

/* ===============================
   FONCTION: CALCULER TOTAL PONDÉRATION
   Calcule et affiche le total des pondérations
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Calcule la pondération totale et met à jour l'affichage
 * 
 * @param {Array} criteres - Liste des critères
 * 
 * UTILISÉ PAR:
 * - afficherListeCriteres() après affichage
 * 
 * FONCTIONNEMENT:
 * 1. Calcule la somme des pondérations
 * 2. Affiche le total
 * 3. Affiche un statut coloré :
 *    - Vert si = 100%
 *    - Orange si < 100%
 *    - Rouge si > 100%
 */
function calculerTotalPonderationCriteres(criteres) {
    const total = criteres.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0);
    const totalSpan = document.getElementById('totalPonderationCriteres');
    const statutSpan = document.getElementById('statutPonderationCriteres');

    if (!totalSpan || !statutSpan) return;

    totalSpan.textContent = total + '%';

    if (total === 100) {
        totalSpan.style.color = 'var(--niveau-attention-minimal)';
        statutSpan.innerHTML = '<span class="grille-texte-minimal"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>Pondération complète</span>';
    } else if (total < 100) {
        totalSpan.style.color = 'var(--niveau-attention-modere)';
        statutSpan.innerHTML = `<span class="grille-texte-modere">${100 - total}% manquant</span>`;
    } else {
        totalSpan.style.color = 'var(--niveau-attention-critique)';
        statutSpan.innerHTML = `<span class="grille-texte-critique">${total - 100}% en trop</span>`;
    }
}

/* ===============================
   FONCTION: ENREGISTRER COMME GRILLE
   Alias de sauvegarde (compatibilité)
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Enregistre la grille (alias pour compatibilité)
 * 
 * UTILISÉ PAR:
 * - Bouton "Sauvegarder la grille"
 * 
 * FONCTIONNEMENT:
 * Appelle sauvegarderGrilleTemplate() et initialise les évaluations
 */
function enregistrerCommeGrille() {
    sauvegarderGrilleTemplate();
    if (typeof initialiserEvaluationsIndividuelles === 'function') {
        initialiserEvaluationsIndividuelles();
    }
}

/* ===============================
   NOUVELLE VUE HIÉRARCHIQUE
   Affichage toutes les grilles avec leurs critères
   =============================== */

/**
 * Affiche toutes les grilles avec leurs critères
 *
 * FONCTIONNEMENT:
 * - Utilise <details> pour sections repliables
 * - Chaque grille montre ses critères
 * - Bouton contextuel pour ajouter un critère à la grille
 * - Affiche totaux de pondération
 */
async function afficherToutesLesGrillesCriteres() {
    const container = document.getElementById('vueGrillesCriteres');
    if (!container) {
        console.error('❌ Conteneur vueGrillesCriteres introuvable');
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];

    if (grilles.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p class="grille-texte-bleu-leger">Aucune grille définie</p>
                <small>Crée une grille en utilisant le formulaire ci-dessous</small>
            </div>
        `;
        return;
    }

    /**
     * Fonction helper pour générer le HTML d'un critère (format compact optimisé)
     */
    function genererHtmlCritere(critere, grilleId) {
        return `
            <div class="item-liste" style="margin-bottom: 8px; padding: 12px 15px;
                 border-left: 4px solid var(--accent-primaire);
                 display: flex; justify-content: space-between; align-items: center;
                 transition: background 0.2s;">
                <div class="grille-flex-1">
                    <div style="font-weight: 600; color: var(--accent-primaire); margin-bottom: 2px;">
                        ${echapperHtml(critere.nom)} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
                    </div>
                    ${critere.description ? `
                        <details class="grille-mt-4">
                            <summary style="cursor: pointer; color: var(--texte-secondaire); font-size: 0.85rem; padding: 4px 0;">
                                Voir la description
                            </summary>
                            <div style="margin-top: 8px; padding: 8px; background: var(--bleu-tres-pale);
                                 border-radius: 4px; font-size: 0.85rem; color: var(--gris-moyen);">
                                ${echapperHtml(critere.description)}
                            </div>
                        </details>
                    ` : ''}
                </div>
                <div style="white-space: nowrap; margin-left: 15px;">
                    <button class="btn btn-modifier" data-action="modifierCritere" data-param="${critere.id}"
                            style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">
                        Modifier
                    </button>
                    <button class="btn btn-supprimer" data-action="supprimerCritere" data-param="${critere.id}"
                            style="padding: 4px 10px; font-size: 0.8rem;">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Fonction helper pour calculer total pondération
     */
    function calculerTotal(criteres) {
        const total = criteres.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0);
        let couleur = '#666';
        let texteStatut = '';

        if (total < 100) {
            couleur = 'var(--niveau-attention-eleve)';
            texteStatut = '⚠️ Incomplet';
        } else if (total > 100) {
            couleur = 'var(--niveau-attention-critique)';
            texteStatut = '❌ Dépasse 100%';
        } else {
            couleur = 'var(--vert-valide)';
            texteStatut = '✅ Complet';
        }

        return { total, couleur, texteStatut };
    }

    // Construire le HTML
    const html = grilles.map(grille => {
        const criteres = grille.criteres || [];
        const { total, couleur, texteStatut } = calculerTotal(criteres);

        return `
            <details class="grille-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 ${echapperHtml(grille.nom)}</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${criteres.length} critère${criteres.length > 1 ? 's' : ''} ·
                        <span style="color: ${total === 100 ? 'var(--vert-succes)' : total < 100 ? 'var(--orange-accent)' : 'var(--rouge-erreur)'};">
                            ${total}%
                        </span>
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${criteres.length > 0 ? `
                        <div class="u-mb-15">
                            ${criteres.map(c => genererHtmlCritere(c, grille.id)).join('')}
                        </div>
                        <div style="padding: 10px; background: var(--bleu-tres-pale); border-radius: 4px; margin-bottom: 15px;">
                            <strong>Pondération totale: <span style="color: ${couleur};">${total}%</span></strong>
                            <span style="color: ${couleur}; margin-left: 10px;">${texteStatut}</span>
                        </div>
                    ` : `
                        <p style="color: var(--bleu-leger); font-style: italic; margin-bottom: 15px;">
                            Aucun critère pour cette grille
                        </p>
                    `}

                    <div class="u-flex-gap-10">
                        <button class="btn btn-confirmer" data-action="ajouterCritereAGrille" data-param="${grille.id}">
                            + Ajouter un critère à cette grille
                        </button>
                        <button class="btn btn-modifier" data-action="chargerGrilleTemplate" data-param="${grille.id}">
                            ✏️ Modifier la grille
                        </button>
                        <button class="btn btn-principal" data-action="dupliquerGrille" data-param="${grille.id}">
                            📋 Dupliquer
                        </button>
                        <button class="btn btn-supprimer" data-action="supprimerGrille" data-param="${grille.id}">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </details>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Ajoute un critère à une grille spécifique
 *
 * @param {string} grilleId - ID de la grille
 *
 * FONCTIONNEMENT:
 * 1. Charge la grille dans le select
 * 2. Affiche le formulaire de critère
 * 3. Scroll vers le formulaire
 */
function ajouterCritereAGrille(grilleId) {
    // Charger la grille dans le select
    const select = document.getElementById('selectGrilleTemplate');
    if (select) {
        select.value = grilleId;
        chargerGrilleTemplate();
    }

    // Afficher le formulaire de critère (s'il existe)
    const formCritere = document.getElementById('formAjoutCritere');
    if (formCritere) {
        formCritere.classList.remove('u-hide');
        formCritere.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Focus sur le champ nom
    const champNom = document.getElementById('critereNom');
    if (champNom) {
        setTimeout(() => champNom.focus(), 300);
    }
}

/* ===============================
   FONCTION: RETOUR VUE HIÉRARCHIQUE
   Retourne à la vue d'ensemble des grilles
   ⚠️ NE PAS RENOMMER - Référencé dans HTML
   =============================== */

/**
 * Retourne à la vue hiérarchique des grilles
 *
 * UTILISÉ PAR:
 * - Bouton "← Retour à la vue d'ensemble"
 *
 * FONCTIONNEMENT:
 * 1. Cache le conteneur d'édition
 * 2. Réaffiche la vue hiérarchique
 * 3. Rafraîchit la vue hiérarchique
 * 4. Réinitialise le formulaire
 */
function retourVueHierarchique() {
    // Cacher le conteneur d'édition
    const conteneurEdition = document.getElementById('conteneurEditionGrille');
    const vueHierarchique = document.getElementById('vueGrillesCriteres');

    if (conteneurEdition) conteneurEdition.classList.add('u-hide');
    if (vueHierarchique) vueHierarchique.classList.remove('u-hide');

    // Réinitialiser le formulaire
    const formCritere = document.getElementById('formAjoutCritere');
    if (formCritere) formCritere.classList.add('u-hide');

    const select = document.getElementById('selectGrilleTemplate');
    if (select) select.value = '';

    // Réinitialiser l'état global
    grilleTemplateActuelle = null;
    critereEnEdition = null;

    // Rafraîchir la vue hiérarchique
    afficherToutesLesGrillesCriteres();

    // Scroll vers la vue hiérarchique
    if (vueHierarchique) {
        vueHierarchique.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* ===============================
   🚀 FONCTION D'INITIALISATION
   Point d'entrée du module
   ⚠️ NE PAS RENOMMER - Appelée par 99-main.js
   =============================== */

/**
 * Initialise le module Grilles au chargement
 * 
 * APPELÉ PAR:
 * - 99-main.js dans la section des chargements conditionnels
 * 
 * FONCTIONNEMENT:
 * 1. Log de démarrage
 * 2. Charge la liste des grilles dans le select
 * 3. Vérifie si on est sur la sous-section grilles
 * 4. Si oui : initialise l'interface
 * 5. Log de succès
 */

/**
 * Migration des grilles existantes vers le système de bibliothèque
 * ✅ AJOUT (8 décembre 2025) : Support système bibliothèque avec sidebar
 *
 * Ajoute le flag dansBibliotheque: true à toutes les grilles existantes
 * qui n'ont pas encore ce flag (migration une seule fois)
 */
async function migrerGrillesVersBibliotheque() {
    const grilles = await db.get(cle('grillesTemplates')) || [];

    let nbMigrees = 0;
    grilles.forEach(grille => {
        if (grille.dansBibliotheque === undefined) {
            grille.dansBibliotheque = true;
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        await db.set(cle('grillesTemplates'), grilles);
    }
}

/**
 * Assure la présence de la grille générique dans la bibliothèque
 * Facilite la compréhension du système pour les nouveaux utilisateurs
 */
async function assurerGrilleGenerique() {
    // 🆕 #358 — Garde anti-resemage du global hérité. Au boot (DOMContentLoaded,
    // AVANT db-ready) avec localStorage saturé (#353), `trimestreActif` n'est pas
    // encore réhydraté → obtenirTrimestreId() est vide → cle('grillesTemplates')
    // retombe sur la clé GLOBALE nue (trimestres.js:307). Semer ici recréerait
    // l'exemple dans le global hérité que #358 retire (re-création à chaque boot →
    // vidage G4 impossible). On ne sème QUE lorsque cle() résout vers une copie
    // namespacée ; la navigation vers la section ré-appelle ce module une fois le
    // trimestre actif établi (navigation.js:223).
    if (cle('grillesTemplates') === 'grillesTemplates') return;

    const grilles = await db.get(cle('grillesTemplates')) || [];

    // Vérifier si la grille générique existe déjà ou a été supprimée volontairement
    const existe = grilles.some(g => g.id === 'GRILLE_GENERIQUE');
    if (existe || window.estRessourceSupprimee('GRILLE_GENERIQUE')) return;


    const grilleGenerique = {
        id: 'GRILLE_GENERIQUE',
        nom: 'Grille générique (exemple)',
        description: 'Grille 4 critères - Modifie ou duplique selon tes besoins',
        echelleId: 'ECHELLE_GENERIQUE',
        criteres: [
            { id: 'CR_COMPREHENSION', code: 'comp', nom: 'Compréhension', ponderation: 25, description: 'Capacité à saisir le sens et les enjeux du sujet', type: 'holistique' },
            { id: 'CR_APPLICATION', code: 'appl', nom: 'Application', ponderation: 25, description: 'Capacité à utiliser les connaissances dans un contexte donné', type: 'holistique' },
            { id: 'CR_ANALYSE', code: 'anal', nom: 'Analyse', ponderation: 25, description: 'Capacité à décomposer et examiner les éléments', type: 'holistique' },
            { id: 'CR_SYNTHESE', code: 'synt', nom: 'Synthèse', ponderation: 25, description: 'Capacité à intégrer et reformuler de manière cohérente', type: 'holistique' }
        ],
        verrouille: false,
        dansBibliotheque: true
    };

    grilles.push(grilleGenerique);
    await db.set(cle('grillesTemplates'), grilles);
}

async function initialiserModuleGrilles() {

    // En trimestre ARCHIVÉ (lecture seule), ne pas auto-migrer ni réinjecter la grille
    // générique : une simple consultation ne doit pas modifier la copie d'archive
    // (a2025_grillesTemplates = golden master). Lot B1 namespacing — 26 juin 2026.
    if (!(window.estTrimestreArchive && window.estTrimestreArchive())) {
        // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
        await migrerGrillesVersBibliotheque();

        // ✅ AJOUT (3 janvier 2026) : Assurer présence de la grille générique
        await assurerGrilleGenerique();
    }

    // Charger la liste des grilles
    await chargerListeGrillesTemplates();

    // Afficher la sidebar avec la liste des grilles (Beta 80.5+)
    if (typeof afficherListeGrilles === 'function') {
        await afficherListeGrilles();
    }

    // Toujours afficher la vue hiérarchique (indépendamment de la section active)
    await afficherToutesLesGrillesCriteres();

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - 01-config.js (grilleTemplateActuelle, critereEnEdition)
 * - 02-navigation.js (afficherSection, afficherSousSection)
 * - 14-utilitaires.js (notifications - optionnel)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - 04-productions.js (peut associer des grilles aux productions)
 * - Modules d'évaluation (utilisent les grilles pour évaluer)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module DOIT être chargé APRÈS 01-config.js et 02-navigation.js
 * 
 * LOCALSTORAGE UTILISÉ:
 * - 'grillesTemplates' : Array des grilles de critères
 *   Structure: [{ id, nom, criteres: [...], dateCreation, dateModification, baseSur }, ...]
 * - window.tempCriteres : Array temporaire pour nouvelle grille (pas persisté)
 * 
 * FONCTIONS EXPORTÉES (accessibles globalement):
 * - chargerListeGrillesTemplates()
 * - chargerGrilleTemplate()
 * - afficherFormCritere(id)
 * - sauvegarderCritere()
 * - sauvegarderEtFermer()
 * - annulerAjoutCritere()
 * - modifierCritere(id)
 * - supprimerCritere(id)
 * - afficherListeCriteres(criteres, grilleId)
 * - afficherChampFormule()
 * - sauvegarderGrilleTemplate(silencieux)
 * - sauvegarderNomGrille()
 * - afficherGrillesCriteres()
 * - fermerModalGrilles()
 * - chargerGrilleEnEdition(grilleId)
 * - supprimerGrille(grilleId)
 * - dupliquerGrille(grilleId)
 * - basculerVerrouillageCritere(critereId)
 * - getTypeCritereLabel(type)
 * - calculerTotalPonderationCriteres(criteres)
 * - enregistrerCommeGrille()
 * - initialiserModuleGrilles()
 * 
 * STRUCTURE D'UN CRITÈRE:
 * {
 *   id: string,
 *   nom: string,
 *   description: string,
 *   ponderation: number,
 *   type: 'holistique' | 'analytique' | 'algorithmique',
 *   formule: string (pour algorithmique),
 *   verrouille: boolean
 * }
 * 
 * AMÉLIORATIONS FUTURES:
 * - Moderniser les événements (remplacer onclick par addEventListener)
 * - Ajouter validation côté client plus robuste
 * - Permettre le glisser-déposer pour réorganiser les critères
 * - ✅ Export/Import de grilles au format JSON (complété avec licence CC)
 * - Prévisualisation d'une grille avant utilisation
 */

/* ===============================
   EXPORT/IMPORT AVEC LICENCE CC
   =============================== */

/**
 * Exporte les grilles de critères avec métadonnées Creative Commons
 * Les exports incluent uniquement la structure des grilles et critères,
 * JAMAIS les données d'étudiants ou les évaluations
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les grilles depuis localStorage
 * 2. Ajoute métadonnées CC BY-NC-SA 4.0 (auteur, licence, version)
 * 3. Génère nom de fichier avec watermark CC
 * 4. Télécharge le fichier JSON
 *
 * FORMAT EXPORT:
 * {
 *   metadata: { licence, auteur_original, version, date, ... },
 *   contenu: { grilles: [...] }
 * }
 */
async function exporterGrilles() {
    const toutesGrilles = await db.get(cle('grillesTemplates')) || [];

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const grilles = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesGrilles, 'grille')
        : toutesGrilles.filter(g => !g.estDemo && !g.auteurOriginal);
    const nbExclues = toutesGrilles.length - grilles.length;

    if (grilles.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune grille personnelle à exporter.\n\n${nbExclues} grille(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune grille à exporter.');
        }
        return;
    }

    // Informer si des grilles ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Grilles de critères',
        `${grilles.length} grille(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { grilles: grilles },
        'grilles',
        'Grilles de critères d\'évaluation',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('grilles', { inclureLicence: true, precisionDate: 'minute' });

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notifications.succes(`${grilles.length} grille(s) exportée(s) avec succès`);
}

/**
 * Exporte la grille actuellement en cours d'édition
 */
async function exporterGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille sélectionnée à exporter.');
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleTemplateActuelle);

    if (!grille) {
        alert('Grille introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Grille de critères',
        grille.nom
    );

    if (!metaEnrichies) {
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...grille };

    // Si la grille a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (grille.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Tu exportes un matériel créé par ' + grille.metadata_cc.auteur_original + '.\n\n' +
            'Entre ton nom pour être crédité comme contributeur :\n' +
            '(Laisse vide si tu n\'as fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = grille.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...grille.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(contenuExport, 'grille-criteres', grille.nom, metaEnrichies);

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 🆕 Beta 95.3 : Nommage standardisé
    const nomFichier = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('grille', { nom: grille.nom, discipline: grille.discipline, inclureLicence: true })
        : `grille-${grille.nom.replace(/[^a-z0-9]/gi, '-')}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes(`Grille "${grille.nom}" exportée avec succès`);
}

/**
 * Importe un fichier JSON pour remplacer la grille actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
async function importerDansGrilleActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de la grille active
    if (!grilleTemplateActuelle) {
        alert('Aucune grille sélectionnée. Veuillez d\'abord sélectionner une grille à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une grille
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let grilleImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                grilleImportee = donnees.contenu;
            } else {
                // Ancien format direct
                grilleImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `⚠️ ATTENTION: Cette action va remplacer la grille actuelle.\n\n` +
                `Veux-tu continuer ?`
            );

            if (!confirmation) {
                event.target.value = '';
                return;
            }

            // Récupérer les grilles
            const grilles = await db.get(cle('grillesTemplates')) || [];
            const index = grilles.findIndex(g => g.id === grilleTemplateActuelle);

            if (index === -1) {
                alert('Grille introuvable.');
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et remplacer les données
            const grilleMiseAJour = {
                ...grilleImportee,
                id: grilleTemplateActuelle // Garder l'ID original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                grilleMiseAJour.metadata_cc = metadata;
            }

            // Remplacer dans le tableau
            grilles[index] = grilleMiseAJour;

            // Sauvegarder
            await db.set(cle('grillesTemplates'), grilles);

            // Recharger la grille dans le formulaire
            await chargerGrillePourModif(grilleTemplateActuelle);

            // Rafraîchir la liste
            await afficherGrillesExistantes();

            notifications.succes('Grille importée et remplacée avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assure-toi qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Importe des grilles depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec grilles existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event} event - Événement de changement du file input
 */
async function importerGrilles(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._grillesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-grilles` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            const modal = document.createElement('div');
            modal.classList.add('modal-import-grilles');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px;">
                        <div data-apercu-cc-slot class="u-mb-15"></div>
                        <p><strong>Veux-tu importer ces grilles ?</strong></p>
                        <div class="u-flex-gap-10" style="margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportGrilles">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportGrilles">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox) {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les grilles
 * Fonction helper appelée depuis le modal de confirmation
 */
window.confirmerImportGrilles = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let grillesImportees;
        let metadata = null;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            metadata = donnees.metadata;

            if (donnees.contenu.grilles) {
                // Batch export: { metadata, contenu: { grilles: [...] } }
                grillesImportees = donnees.contenu.grilles;
            } else {
                // Individual export: { metadata, contenu: { ...grille... } }
                grillesImportees = [donnees.contenu];
            }
        } else {
            // Ancien format direct
            grillesImportees = donnees.grilles || [donnees];
        }

        if (!Array.isArray(grillesImportees)) {
            throw new Error('Format invalide: grilles doit être un tableau');
        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeGrilles
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_GRILLES || 'bibliothequeGrilles';
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE) || [];

        // Fusionner dans la bibliothèque partagée uniquement
        let nbAjoutees = 0;
        let nbMisesAJour = 0;
        grillesImportees.forEach(grille => {
            // Préserver les métadonnées CC dans la grille importée
            if (metadata && metadata.licence) {
                grille.metadata_cc = {
                    auteur_original: metadata.auteur_original,
                    date_creation: metadata.date_creation,
                    licence: metadata.licence,
                    contributeurs: metadata.contributeurs || []
                };
            }

            const indexBiblio = bibliotheque.findIndex(g => g.id === grille.id);
            if (indexBiblio >= 0) {
                bibliotheque[indexBiblio] = { ...grille, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                nbMisesAJour++;
            } else {
                bibliotheque.push({ ...grille, dateAjoutBiblio: new Date().toISOString() });
                nbAjoutees++;
            }
        });

        // Sauvegarder uniquement la bibliothèque
        await db.set(CLE_BIBLIOTHEQUE, bibliotheque);

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeGrilles')) {
            await afficherBibliothequeGrilles();
        }

        const details = [];
        if (nbAjoutees > 0) details.push(`${nbAjoutees} nouvelle(s) grille(s) ajoutée(s).`);
        if (nbMisesAJour > 0) details.push(`${nbMisesAJour} grille(s) mise(s) à jour.`);
        details.push('Consulte « Grilles disponibles » pour les ajouter à ta barre latérale.');
        notifications.succes('Import réussi', details.join(' '));

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

// Exports des nouvelles fonctions hiérarchiques
window.afficherToutesLesGrillesCriteres = afficherToutesLesGrillesCriteres;
window.ajouterCritereAGrille = ajouterCritereAGrille;
window.retourVueHierarchique = retourVueHierarchique;

// Exports des fonctions existantes (pour compatibilité)
window.chargerListeGrillesTemplates = chargerListeGrillesTemplates;
window.chargerGrilleTemplate = chargerGrilleTemplate;
window.afficherFormCritere = afficherFormCritere;
window.sauvegarderCritere = sauvegarderCritere;
window.sauvegarderEtFermer = sauvegarderEtFermer;
window.annulerAjoutCritere = annulerAjoutCritere;
window.modifierCritere = modifierCritere;
window.supprimerCritere = supprimerCritere;
window.afficherListeCriteres = afficherListeCriteres;
window.afficherChampFormule = afficherChampFormule;
window.sauvegarderGrilleTemplate = sauvegarderGrilleTemplate;
// 🆕 #466/CO-16 (21 août 2026) : appelé par changerTrimestreActifV2 — le pointeur
// d'édition ne survit pas à la bascule (sinon : « sauvegardée ! » sans écriture,
// ou édition fantôme d'une grille de l'ancien trimestre).
function reinitialiserEditeurGrillesApresBascule() { grilleTemplateActuelle = null; }
window.reinitialiserEditeurGrillesApresBascule = reinitialiserEditeurGrillesApresBascule;
window.sauvegarderNomGrille = sauvegarderNomGrille;
window.afficherGrillesCriteres = afficherGrillesCriteres;
window.fermerModalGrilles = fermerModalGrilles;
window.chargerGrilleEnEdition = chargerGrilleEnEdition;
window.supprimerGrille = supprimerGrille;
window.dupliquerGrille = dupliquerGrille;
window.basculerVerrouillageCritere = basculerVerrouillageCritere;
window.getTypeCritereLabel = getTypeCritereLabel;
window.calculerTotalPonderationCriteres = calculerTotalPonderationCriteres;

// Export/Import avec licence CC
window.exporterGrilles = exporterGrilles;
window.exporterGrilleActive = exporterGrilleActive;
window.importerDansGrilleActive = importerDansGrilleActive;
window.importerGrilles = importerGrilles;
window.enregistrerCommeGrille = enregistrerCommeGrille;
window.initialiserModuleGrilles = initialiserModuleGrilles;
// Exposée pour la sentinelle #358 (garde anti-resemage du global hérité).
window.assurerGrilleGenerique = assurerGrilleGenerique;

// ✅ AJOUT (8 décembre 2025) : Exports fonctions bibliothèque
window.afficherBibliothequeGrilles = afficherBibliothequeGrilles;
window.retirerGrilleDeBibliotheque = retirerGrilleDeBibliotheque;
window.ajouterGrillesABibliotheque = ajouterGrillesABibliotheque;
window.fermerModalBibliothequeGrilles = fermerModalBibliothequeGrilles;
window.ajouterGrilleIndividuelle = ajouterGrilleIndividuelle;
// Brique C namespacing — pas 4 : import inter-trimestre de grilles (data-action).
window.listerTrimestresAvecGrilles = listerTrimestresAvecGrilles;
window.afficherGrillesTrimestreModal = afficherGrillesTrimestreModal;
window.importerToutGrillesTrimestreModal = importerToutGrillesTrimestreModal;
window.importerUneGrilleTrimestre = importerUneGrilleTrimestre;
// Primitive de copie inter-trimestre (réutilisable + point de test stable, sans DOM).
window.copierGrilleDepuisTrimestre = copierGrilleDepuisTrimestre;
window.dupliquerGrilleBibliotheque = dupliquerGrilleBibliotheque;
window.dupliquerEtEditerGrille = dupliquerEtEditerGrille;
window.supprimerGrilleDefinitivement = supprimerGrilleDefinitivement;
window.supprimerGrilleDeBibliothequePartagee = supprimerGrilleDeBibliothequePartagee;
window.ajouterMesGrillesALaBibliotheque = ajouterMesGrillesALaBibliotheque;

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes - Stubs minimaux
   =============================== */

/**
 * Génère le badge « Dépistage » si la grille est celle configurée comme
 * référence pour le dépistage SOLO (preferences.grilleReferenceDepistage).
 * Rendu vide sinon.
 */
function genererBadgeGrilleDepistage(grille) {
    if (!grille || !grille.id) return '';
    var refId = (typeof obtenirPreference === 'function')
        ? obtenirPreference('grilleReferenceDepistage')
        : '';
    if (!refId || grille.id !== refId) return '';
    return '<span class="badge-grille-depistage" title="Grille utilisée pour le dépistage SOLO (configurée dans Labo › Outils d’observation)">Dépistage</span>';
}

async function afficherListeGrilles() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const container = document.getElementById('sidebarListeGrilles');
    if (!container) return;

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les grilles dans la bibliothèque
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const grillesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        grilles.filter(g => g.dansBibliotheque !== false)
    );

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div class="u-mb-15">
            <button data-action="afficherBibliothequeGrilles" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (grillesDansBibliotheque.length === 0) {
        html += '<p class="sidebar-vide">Crée une nouvelle grille ou puisez dans la bibliothèque</p>';
        container.innerHTML = html;
        return;
    }

    html += grillesDansBibliotheque.map(grille => {
        const nomGrille = grille.nom || 'Sans titre';
        const nbCriteres = grille.criteres?.length || 0;
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(grille)
            : '';
        const badgeDepistage = genererBadgeGrilleDepistage(grille);
        return `
            <div class="sidebar-item" data-id="${grille.id}" data-action="chargerGrillePourModif" data-param="${grille.id}">
                <div class="sidebar-item-titre">${echapperHtml(nomGrille)}</div>
                <div class="sidebar-item-badges">${badgesPratiques}${badgeDepistage} <span class="badge-caracteristique">${nbCriteres} critères</span></div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * ✅ AJOUT (8 décembre 2025) : Afficher le modal de gestion de la bibliothèque de grilles
 * Permet d'ajouter/retirer des grilles de la barre latérale
 * Avec filtre par discipline
 */
async function preparerDonneesBibliothequeGrilles() {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const grillesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        grilles.filter(g => g.dansBibliotheque !== false)
    );
    const grillesDisponibles = BibliothequeUI.filtrerParModeDemo(
        await obtenirToutesLesGrillesBibliotheque()
    );
    // #291 — `reunirSources` évite la fausse collision : la même grille vit
    // légitimement dans la sélection ET dans la bibliothèque partagée, avec
    // le même `id` (ajouterGrilleALaBibliotheque le conserve).
    const doublonsDetectes = analyserDoublons(
        reunirSources(grillesDansBibliotheque, grillesDisponibles), 'nom');

    // #327 — dossiers de classement (couche par-dessus, range par identité).
    const repsGrilles = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('grilles')
        : [];
    const repParGrille = {};
    repsGrilles.forEach(r => (r.itemIds || []).forEach(id => { repParGrille[id] = r.id; }));

    // Section 1 : cartes pour les grilles dans la sélection
    const cartesSection1 = grillesDansBibliotheque.map(grille => ({
        nom: BibliothequeUI.formaterTitreDemo(grille.nom || 'Sans titre', BibliothequeUI.estItemDemo(grille)),
        id: grille.id,
        afficherId: true,
        badgeSource: BibliothequeUI.genererBadgeSource(grille, grillesDansBibliotheque),
        badgesPratiques: typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(grille) : '',
        metadonnees: BibliothequeUI.formaterMetadonnees(grille, {
            quantite: `${grille.criteres?.length || 0} critère(s)`,
            discipline: true
        }),
        description: grille.description || '',
        inspireDe: BibliothequeUI.formaterInspireDe(grille),
        boutonPrincipal: { label: 'Dupliquer', action: 'dupliquerGrilleBibliotheque', param: grille.id, classe: 'btn-confirmer', title: 'Créer une copie' },
        actionsMenu: [
            { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'grille', param2: grille.id, classe: 'btn-secondaire', title: 'Générer un fichier .lcz signé à transmettre (#329)' },
            { label: 'Retirer', action: 'retirerGrilleDeBibliotheque', param: grille.id, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
            { label: 'Supprimer', action: 'supprimerGrilleDefinitivement', param: grille.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
        ]
    }));

    // Section 2 : #327 — cartes à plat (le groupage par dossier se fait au rendu
    // via repertoiresBibliotheque.grouper). Chaque carte porte au menu ⋮ les
    // actions « Classer dans … » / « Retirer du dossier » selon son dossier courant.
    const cartesSection2 = grillesDisponibles.map(grille => {
        const dejaPresent = grilles.some(g => (g.id === grille.id || g.idOriginal === grille.id) && g.dansBibliotheque !== false);
        const repCourant = repParGrille[grille.id] || null;
        const actionsMenu = [];
        repsGrilles.forEach(r => {
            if (r.id !== repCourant) {
                actionsMenu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'grilles', param2: grille.id, param3: r.id, classe: 'btn-secondaire', title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            actionsMenu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'grilles', param2: grille.id, classe: 'btn-secondaire', title: 'Sortir du dossier (repasse en non classées)' });
        }
        actionsMenu.push({ label: 'Supprimer', action: 'supprimerGrilleDeBibliothequePartagee', param: grille.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true });

        return {
            nom: BibliothequeUI.formaterTitreDemo(grille.nom || 'Sans titre', BibliothequeUI.estItemDemo(grille)),
            id: grille.id,
            afficherId: true,
            badgeSource: BibliothequeUI.genererBadgeSource(grille, grillesDansBibliotheque),
            badgesPratiques: (typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(grille) : '') + genererBadgeGrilleDepistage(grille),
            metadonnees: BibliothequeUI.formaterMetadonnees(grille, {
                quantite: `${grille.criteres?.length || 0} critère(s)`,
                discipline: true
            }),
            inspireDe: BibliothequeUI.formaterInspireDe(grille),
            description: grille.description || '',
            dejaPresent: dejaPresent,
            classeItem: 'grille-disponible-item',
            boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterGrilleIndividuelle', param: grille.id, classe: 'btn-confirmer', title: 'Ajouter cette grille à ta sélection' },
            actionsMenu: actionsMenu
        };
    });

    return { cartesSection1, cartesSection2, doublonsDetectes, repsGrilles, grillesDansBibliotheque };
}

async function afficherBibliothequeGrilles() {
    // #327 — enregistre la biblio « grilles » auprès du helper générique de
    // répertoires (idempotent). Les items de Section 2 sont des cartes-config
    // déjà libellées : labelItem lit leur .nom tel quel.
    BibliothequeUI.repertoires.enregistrer('grilles', {
        rafraichir: afficherBibliothequeGrilles,
        ajouterItem: (id) => ajouterGrilleIndividuelle(id),
        supprimerItem: (id) => supprimerGrilleDeBibliothequePartagee(id),
        labelItem: (c) => c.nom,
        labelPluriel: 'grilles'
    });

    const data = await preparerDonneesBibliothequeGrilles();

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune grille dans la barre latérale</p>';
    } else {
        data.cartesSection1.forEach(carte => {
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    // Boutons après Section 1
    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button data-action="ajouterMesGrillesALaBibliotheque" class="btn btn-principal btn-mini">Ajouter mes grilles à la bibliothèque</button>
            <button data-action="exporterGrilles" class="btn btn-secondaire btn-mini">Exporter toutes mes grilles (JSON)</button>
            <button data-action="ouvrirFilePickerImportGrilles" class="btn btn-secondaire btn-mini">Importer des grilles (JSON)</button>
            <button data-action="partageImport.ouvrirSelecteurFichier" class="btn btn-secondaire btn-mini">Importer un partage (.lcz)</button>
            <input type="file" id="fichier-import-grilles-modal" accept=".json" style="display: none;" data-on-change="importerGrilles">
        </div>`;

    // Section import inter-trimestre (Brique C namespacing — pas 4, modèle COPIE).
    // listerTrimestresAvecGrilles() ne retient que les trimestres ayant une COPIE
    // PROPRE de grilles (clé namespacée <id>_grillesTemplates) = trimestres archivés
    // (golden master). Les trimestres vivants partagent le catalogue global → rien à
    // importer d'eux. Destination de la copie = trimestre ACTIF (cf. dupliquerGrillePartagee).
    let sectionImportTrimestre = '';
    const trimestresAvecGrilles = listerTrimestresAvecGrilles();
    if (trimestresAvecGrilles.length > 0) {
        sectionImportTrimestre = `
            <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImportGrilles" class="controle-form" style="flex: 1; min-width: 200px;">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestresAvecGrilles.map(t => `<option value="${echapperHtml(t.id)}">${echapperHtml(t.nom)} (${t.nombre} grille${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <button data-action="afficherGrillesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les grilles</button>
                    <button data-action="importerToutGrillesTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
                </div>
                <div id="previewGrillesTrimestre" class="u-hide" style="margin-top: 10px;"></div>
            </div>`;
    }

    // Filtres Section 2 : #327 — le filtre discipline est retiré (incohérent avec
    // l'organisation par dossiers). La zone « Mes dossiers » (repliable) tient lieu
    // de tête de section ; le toggle « masquer déjà présents » (#293) est conservé.
    const filtresHTML = BibliothequeUI.repertoires.genererZone('grilles') +
        BibliothequeUI.renderToggleMasquerDejaPresent('afficherBibliothequeGrilles');

    // Section 2 — #293 (masquer déjà présents) puis #327 (groupage par dossier).
    const cartesAffichables = BibliothequeUI.filtrerParDejaPresent(data.cartesSection2);
    const enteteGroupe = (titre) => `<h4 style="margin:18px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--bordure, #ddd); color:var(--texte-secondaire, #555); font-size:0.95rem;">${echapperHtml(titre)}</h4>`;

    let contenuSection2 = '';
    if (cartesAffichables.length === 0) {
        contenuSection2 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune grille disponible à ajouter</p>';
    } else if (data.repsGrilles && data.repsGrilles.length === 0) {
        // Aucun dossier → liste à plat (comportement d'origine)
        cartesAffichables.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
    } else {
        // Dossier → select compact ; « Non classées » → cartes (ce qui reste à ranger).
        const groupes = window.repertoiresBibliotheque.grouper(cartesAffichables, 'grilles');
        groupes.forEach(g => {
            const cleGroupe = g.id || '__nonclasse__';
            contenuSection2 += `<div class="biblio-groupe-repertoire" data-repertoire-id="${echapperHtml(cleGroupe)}">`;
            contenuSection2 += enteteGroupe(g.titre);
            if (g.id) {
                contenuSection2 += BibliothequeUI.repertoires.renderLigneDossierSelect('grilles', g);
            } else {
                g.items.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
            }
            contenuSection2 += `</div>`;
        });
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeGrilles',
        titre: 'Bibliothèque de grilles de critères',
        sousTitre: 'Gérez les grilles de critères affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeGrilles',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes, {
            itemsSelection: data.grillesDansBibliotheque,
            actions: {
                retirer: 'retirerGrilleDeBibliotheque',
                supprimer: 'supprimerGrilleDefinitivement',
                supprimerPartagee: 'supprimerGrilleDeBibliothequePartagee'
            }
        }),
        titreSection1: 'Grilles dans la barre latérale',
        contenuIdListe1: 'listeGrillesDansBibliotheque',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Grilles disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeGrillesDisponibles',
        contenuSection2: contenuSection2,
        sectionPartages: window.partageSection ? partageSection.genererSectionHTML('grille') : ''
    });
}

/* ===================================================================
   IMPORT INTER-TRIMESTRE DE GRILLES (Brique C namespacing — pas 4)
   Modèle COPIE : une grille d'un trimestre source est DUPLIQUÉE dans le
   trimestre actif (id neuf + trace inspireDe), la source n'est jamais mutée.
   Outils réutilisés (livrés aux pas 2-3) : cleSource() (lecture d'un trimestre
   nommé sans swap) et partageSection.dupliquerGrillePartagee() (copie grille +
   cartouches, lecteur de cartouches injecté). D-C4 reporté : l'echelleId d'une
   cartouche copiée n'est PAS remappé ici (verrouillé par un test-témoin).
   =================================================================== */

/**
 * Liste les trimestres qui possèdent une COPIE PROPRE de grilles, c.-à-d. une clé
 * namespacée <id>_grillesTemplates non vide (cas des trimestres archivés / golden
 * master). Les trimestres vivants partagent le catalogue global partagé : leurs
 * grilles sont déjà visibles dans la bibliothèque, rien à « importer » d'eux.
 * Voie canonique = cleSource() (PAS de scan localStorage).
 * @returns {Array<{id:string, nom:string, nombre:number}>}
 */
function listerTrimestresAvecGrilles() {
    if (typeof obtenirTrimestres !== 'function' || typeof cleSource !== 'function') return [];
    // Garde D-C7 (cadrage §2.3) : la CIBLE d'un import n'est JAMAIS un trimestre
    // archivé. La copie écrit la clé globale nue 'grillesTemplates' (cf. Brique D),
    // or un actif archivé lit cle()='<id>_grillesTemplates' → la copie irait au
    // mauvais endroit (catalogue global, invisible dans l'actif) et polluerait le
    // partagé. Tant que la destination n'est pas namespacée (Brique D), on masque
    // l'import quand l'actif est archivé : aucune source listée → pas de section.
    if (window.estTrimestreArchive && window.estTrimestreArchive()) return [];
    const actif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : (window.trimestreActif || '');
    const resultat = [];
    (obtenirTrimestres() || []).forEach(t => {
        if (!t || !t.id || t.id === actif) return;
        const k = cleSource('grillesTemplates', t.id);
        // Pas de copie propre (cleSource rend la clé globale partagée) → déjà dans la biblio.
        if (k === 'grillesTemplates') return;
        const grilles = db.getSync(k, []) || [];
        if (Array.isArray(grilles) && grilles.length > 0) {
            resultat.push({ id: t.id, nom: t.nom || t.id, nombre: grilles.length });
        }
    });
    resultat.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return resultat;
}

/**
 * Copie une grille d'un trimestre source vers le trimestre ACTIF.
 * Pose la trace de provenance (inspireDe) sur une COPIE de l'objet lu — la grille
 * source en mémoire n'est jamais mutée. Les cartouches liées sont lues par leur clé
 * namespacée du trimestre source (cleSource), puis copiées par dupliquerGrillePartagee.
 * @param {Object} grilleSource - grille telle que lue dans le trimestre source
 * @param {string} srcId - id du trimestre source (ex. 'a2025')
 * @returns {{grille:Object, nbCartouches:number}}
 */
function copierGrilleDepuisTrimestre(grilleSource, srcId) {
    // Trace de provenance : OBJET inspireDe structuré (schéma CC transversal lu par
    // formaterInspireDe / cc-license : {nom, auteur, date, sourceId}) + trimestre
    // source. NB : une STRING brute (grilleSource.id) afficherait « Inspiré de
    // Inconnu par Inconnu » sur la carte (formaterInspireDe lit src.nom/src.auteur).
    const source = Object.assign({}, grilleSource, {
        inspireDe: BibliothequeUI.forgerInspireDe(grilleSource),
        inspireDeTrimestre: srcId
    });
    const lireCartouchesParCle = (g) => db.getSync(cleSource('cartouches_' + g.id, srcId), []) || [];
    return partageSection.dupliquerGrillePartagee(source, lireCartouchesParCle);
}

/** État de la section d'import, à reposer après reconstruction du modal. */
function etatImportGrilles() {
    return BibliothequeUI.capturerImportTrimestre({
        modalId: 'modalBibliothequeGrilles',
        selects: ['selectTrimestreImportGrilles'],
        apercu: 'previewGrillesTrimestre'
    });
}

/**
 * Bouton « Voir les grilles » : affiche, sous le sélecteur, la liste des grilles du
 * trimestre choisi avec un bouton « Importer » par ligne.
 */
function afficherGrillesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportGrilles');
    const preview = document.getElementById('previewGrillesTrimestre');
    if (!select || !preview) return;

    const srcId = select.value;
    if (!srcId) { preview.classList.add('u-hide'); return; }

    const grilles = db.getSync(cleSource('grillesTemplates', srcId), []) || [];
    if (grilles.length === 0) {
        preview.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucune grille trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    let html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    grilles.forEach(grille => {
        const nbCriteres = Array.isArray(grille.criteres) ? grille.criteres.length : 0;
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${echapperHtml(grille.nom || 'Sans titre')}</strong>
                    <br><small style="color: var(--gris-moyen);">${nbCriteres} critère${nbCriteres > 1 ? 's' : ''}</small>
                </div>
                <button data-action="importerUneGrilleTrimestre" data-param="${echapperHtml(srcId)}" data-param2="${echapperHtml(grille.id)}" class="btn btn-confirmer btn-tres-compact">
                    Importer
                </button>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * Bouton « Tout importer » : copie toutes les grilles du trimestre sélectionné dans
 * le trimestre actif.
 */
async function importerToutGrillesTrimestreModal() {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est archivé (consultation). Active un trimestre courant pour importer des grilles.');
        return;
    }
    const select = document.getElementById('selectTrimestreImportGrilles');
    if (!select || !select.value) { alert('Sélectionne d\'abord un trimestre.'); return; }

    const srcId = select.value;
    const nomTrim = (typeof formaterNomTrimestre === 'function') ? formaterNomTrimestre(srcId) : srcId;
    const grilles = db.getSync(cleSource('grillesTemplates', srcId), []) || [];
    if (grilles.length === 0) { alert('Aucune grille à importer dans ce trimestre.'); return; }

    const confirmation = confirm(
        `Veux-tu importer les ${grilles.length} grille(s) de ${nomTrim} dans ce trimestre ?\n\n` +
        'Chaque grille est COPIÉE (l\'original du trimestre source reste intact).'
    );
    if (!confirmation) return;

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportGrilles();

    let nbGrilles = 0, nbCartouches = 0;
    for (const grille of grilles) {
        const res = copierGrilleDepuisTrimestre(grille, srcId);
        nbGrilles++;
        nbCartouches += res.nbCartouches || 0;
    }

    fermerModalBibliothequeGrilles();
    await afficherListeGrilles();
    await afficherBibliothequeGrilles();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherGrillesTrimestreModal);

    notifications.succes('Import terminé', `${nbGrilles} grille(s) copiée(s)` + (nbCartouches ? ` • ${nbCartouches} cartouche(s)` : '') + '.');
}

/**
 * Bouton « Importer » d'une ligne d'aperçu : copie une seule grille du trimestre source.
 * @param {string} srcId - id du trimestre source
 * @param {string} grilleId - id de la grille dans le trimestre source
 */
async function importerUneGrilleTrimestre(srcId, grilleId) {
    if (window.estTrimestreArchive && window.estTrimestreArchive()) {
        alert('Import impossible : le trimestre actif est archivé (consultation). Active un trimestre courant pour importer des grilles.');
        return;
    }
    const grilles = db.getSync(cleSource('grillesTemplates', srcId), []) || [];
    const grille = grilles.find(g => g.id === grilleId);
    if (!grille) { alert('Grille introuvable.'); return; }

    // L'import reconstruit le modal : sans capture/restauration, le trimestre
    // choisi, l'aperçu déplié et le défilement disparaissent avec l'ancien DOM.
    const etatSection = etatImportGrilles();

    const res = copierGrilleDepuisTrimestre(grille, srcId);

    fermerModalBibliothequeGrilles();
    await afficherListeGrilles();
    await afficherBibliothequeGrilles();
    await BibliothequeUI.restaurerImportTrimestre(etatSection, afficherGrillesTrimestreModal);

    const suffixe = res.nbCartouches ? ` (avec ${res.nbCartouches} cartouche${res.nbCartouches > 1 ? 's' : ''})` : '';
    notifications.succes(`« ${grille.nom || 'Grille'} » importée dans ce trimestre${suffixe}.`);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Ajoute une grille individuelle à la bibliothèque
 * @param {string} id - ID de la grille à ajouter
 */
async function ajouterGrilleIndividuelle(id) {
    try {
        let grilles = await db.get(cle('grillesTemplates')) || [];

        // Vérifier si la grille existe déjà (par ID direct ou par idOriginal pour les imports)
        let grille = grilles.find(g => g.id === id);
        if (!grille) {
            grille = grilles.find(g => g.idOriginal === id);
        }

        if (!grille) {
            // C'est une grille de la bibliothèque externe, il faut l'importer
            const toutesGrilles = await obtenirToutesLesGrillesBibliotheque();
            const grilleSource = toutesGrilles.find(g => g.id === id);

            if (grilleSource) {
                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('GRILLE_');
                grille = {
                    ...grilleSource,
                    id: nouvelId,
                    idOriginal: grilleSource.id,
                    dansBibliotheque: true,
                    dateImport: new Date().toISOString()
                };
                // #476 — garde d'identité au point d'écriture. Les recherches
                // ci-dessus ne couvrent que `id` et `idOriginal` ; un exemplaire
                // arrivé par un paquet collègue porte son ascendance dans
                // `inspireDe`, et passait donc au travers.
                const gardeGrille = ajouterAvecGardeIdentite(grilles, grille);
                if (!gardeGrille.ajoute) {
                    const nomEnPlace = (gardeGrille.conflit && gardeGrille.conflit.nom) || 'Une grille';
                    alert(`« ${nomEnPlace} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`);
                    return;
                }
                grilles = gardeGrille.liste;
            } else {
                alert('Grille introuvable');
                return;
            }
        } else {
            // Grille existante ou déjà importée, simplement la marquer comme dans la bibliothèque
            grille.dansBibliotheque = true;
        }

        // Sauvegarder
        await db.set(cle('grillesTemplates'), grilles);

        // ⚠ NE PAS ANNONCER UN SUCCÈS SANS L'AVOIR VÉRIFIÉ (patron du 22 août).
        // `db.set` fait un `return;` NU quand une garde refuse l'écriture
        // (js/db.js:449) : la valeur de retour ne distingue pas le refus du
        // succès. On relit donc la collection — c'est la seule preuve qui vaille.
        const verifGrille = await db.get(cle('grillesTemplates')) || [];

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeGrilles();
        await afficherListeGrilles();
        await afficherBibliothequeGrilles();

        if (!verifGrille.some(g => g.id === grille.id)) {
            console.error('[grilles] Écriture non confirmée —', grille.id, 'absente après db.set.');
            alert(`« ${grille.nom || 'Grille'} » n'a PAS pu être ajoutée.\n\nL'enregistrement a été refusé. Ouvre la console : une ligne « [DB][GARDE] Écriture BLOQUÉE » en donne la raison.`);
            return;
        }

        notifications.succes('Grille ajoutée à ta sélection !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la grille');
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Retirer une grille de la bibliothèque (soft delete)
 * @param {string} id - ID de la grille à retirer
 */
async function retirerGrilleDeBibliotheque(id) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    // Soft delete : marquer comme non présente dans la bibliothèque
    grille.dansBibliotheque = false;

    await db.set(cle('grillesTemplates'), grilles);

    // Rafraîchir les affichages
    await afficherListeGrilles();
    fermerModalBibliothequeGrilles();
    await afficherBibliothequeGrilles();

}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une grille (hard delete)
 * @param {string} id - ID de la grille à supprimer
 */
async function supprimerGrilleDefinitivement(id) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    // Vérifier dépendances : cartouches liées à cette grille
    const cartouches = await db.get(`cartouches_${id}`) || [];
    if (cartouches.length > 0) {
        alert(`Impossible de supprimer cette grille.\n\n${cartouches.length} cartouche(s) y sont associée(s).\nSupprimez d'abord les cartouches.`);
        return;
    }

    // Confirmation
    if (!confirm(`Supprimer définitivement la grille «${grille.nom}» ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    // Suppression définitive du store local
    const nouvellesGrilles = grilles.filter(g => g.id !== id);
    await db.set(cle('grillesTemplates'), nouvellesGrilles);

    // Suppression du store partagé
    if (typeof retirerGrilleDeLaBibliotheque === 'function') {
        await retirerGrilleDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeGrilles();
    await afficherListeGrilles();
    await afficherBibliothequeGrilles();

}

/**
 * Supprimer une grille de la bibliothèque partagée uniquement (Section 2)
 * @param {string} id - ID de la grille à supprimer
 */
async function supprimerGrilleDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesGrillesBibliotheque === 'function'
        ? await obtenirToutesLesGrillesBibliotheque()
        : [];
    const grille = biblio.find(g => g.id === id);
    if (!grille) return;

    if (!confirm(`Supprimer définitivement «${grille.nom || 'Sans titre'}» de la bibliothèque partagée ?\n\nCette action est irréversible.`)) return;

    // #468/CO-25 (21 août 2026) : poser le tombstone AVANT le retrait. Sans lui,
    // un gabarit fourni par défaut revenait au prochain chargement — la
    // suppression semblait marcher, puis se défaisait toute seule.
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    await retirerGrilleDeLaBibliotheque(id);

    fermerModalBibliothequeGrilles();
    await afficherBibliothequeGrilles();
}

/**
 * Ajouter toutes les grilles locales à la bibliothèque partagée
 */
async function ajouterMesGrillesALaBibliotheque() {
    try {
        const grilles = await db.get(cle('grillesTemplates')) || [];

        if (grilles.length === 0) {
            alert('Aucune grille à ajouter.\n\nCréez d\'abord des grilles.');
            return;
        }

        if (!confirm(`Veux-tu ajouter tes ${grilles.length} grille(s) à la bibliothèque partagée ?\n\nElles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`)) return;

        const resultat = await importerGrillesDansBibliotheque(grilles);

        fermerModalBibliothequeGrilles();
        await afficherBibliothequeGrilles();

        if (resultat.ajoutees > 0) {
            notifications.succes(
                `${resultat.ajoutees} grille(s) ajoutée(s) à la bibliothèque !`,
                resultat.existantes > 0 ? `${resultat.existantes} étai(en)t déjà présente(s).` : ''
            );
        } else {
            notifications.info('Toutes tes grilles étaient déjà dans la bibliothèque.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        alert('Erreur lors de l\'ajout des grilles à la bibliothèque.');
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une grille dans la bibliothèque
 * @param {string} id - ID de la grille à dupliquer
 */
async function dupliquerGrilleBibliotheque(id) {
    // #476 volet 2 — séquence partagée (BibliothequeUI.dupliquerVersBibliotheque).
    await BibliothequeUI.dupliquerVersBibliotheque({
        id: id,
        prefixeId: 'GRILLE_',
        lireListe: async () => await db.get(cle('grillesTemplates')) || [],
        ecrireListe: async (liste) => { await db.set(cle('grillesTemplates'), liste); }, // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
        nommerLaCopie: (copie, source, liste) => { copie.nom = nommerCopie(source.nom, liste); },
        // ✅ D5 — aligné sur les trois autres familles : `forgerInspireDe` pose
        // aussi `sourceId`, ce qui rend l'arbre de filiation décidable.
        forgerProvenance: (source) => BibliothequeUI.forgerInspireDe(source),
        siIntrouvable: () => alert('Grille introuvable'),
        rafraichirUI: async () => {
            fermerModalBibliothequeGrilles();
            await afficherListeGrilles();
            await afficherBibliothequeGrilles();
        }
    });
}

/**
 * ✅ AJOUT (8 décembre 2025) : Ajouter les grilles sélectionnées à la bibliothèque
 */
async function ajouterGrillesABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeGrillesDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Veuillez sélectionner au moins une grille à ajouter');
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grillesBibliotheque = await obtenirToutesLesGrillesBibliotheque();

    let nbAjoutees = 0;

    checkboxes.forEach(checkbox => {
        const grilleId = checkbox.value;

        // Trouver la grille dans la bibliothèque
        const grilleBiblio = grillesBibliotheque.find(g => g.id === grilleId);
        if (!grilleBiblio) return;

        // Vérifier si déjà présente
        const grilleExistante = grilles.find(g => g.id === grilleId);

        if (grilleExistante) {
            // Réactiver une grille retirée
            grilleExistante.dansBibliotheque = true;
            nbAjoutees++;
        } else {
            // Ajouter nouvelle grille
            const nouvelleGrille = {
                ...grilleBiblio,
                id: grilleId + '-local',  // Ajouter suffix pour éviter conflits
                dansBibliotheque: true
            };
            grilles.push(nouvelleGrille);
            nbAjoutees++;
        }
    });

    await db.set(cle('grillesTemplates'), grilles);

    // Rafraîchir les affichages
    await afficherListeGrilles();
    fermerModalBibliothequeGrilles();

    if (nbAjoutees > 0) {
        notifications.succes(`${nbAjoutees} grille(s) ajoutée(s) à la barre latérale`);
    }
}

// #327 — filtrerGrillesParDiscipline retiré : le filtre par discipline n'existe
// plus (incohérent avec l'organisation par dossiers). Remplacé par la zone
// « Mes dossiers » + le groupage par dossier dans afficherBibliothequeGrilles.

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeGrilles() {
    BibliothequeUI.fermerModal('modalBibliothequeGrilles');
}

function creerNouvelleGrille() {
    document.getElementById('accueilGrilles').classList.add('u-hide');
    document.getElementById('conteneurEditionGrille').classList.remove('u-hide');

    // Note: Section optionsImportExportGrilles supprimée (Beta 92)
    // Note: Export/Import se font maintenant via la bibliothèque

    // Cacher les boutons Dupliquer et Supprimer (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const btnSupprimer = document.getElementById('btnSupprimerGrille');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Réinitialiser grilleTemplateActuelle
    grilleTemplateActuelle = null;

    // Réinitialiser le formulaire
    document.getElementById('nomGrilleTemplate').value = '';
    document.getElementById('descriptionGrille').value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesGrille');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Initialiser tempCriteres avec un premier critère vide
    window.tempCriteres = [{
        id: genererIdUnique('TEMP_CR_'),
        nom: '',
        type: 'holistique',
        ponderation: 0,
        description: ''
    }];

    // Afficher le premier critère avec placeholders
    afficherCriteresTemp();

    // Réinitialiser le total de pondération
    const totalElement = document.getElementById('totalPonderationAffichage');
    if (totalElement) {
        totalElement.textContent = '0%';
        totalElement.style.color = 'var(--orange-accent)';
    }

    // Retirer le highlight
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

}

/**
 * Affiche les critères temporaires (mode création nouvelle grille)
 * Avec formulaire éditable inline et placeholders orientés rédaction
 */
function afficherCriteresTemp() {
    const container = document.getElementById('listeCriteres');
    if (!container) return;

    if (!window.tempCriteres || window.tempCriteres.length === 0) {
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun critère défini</p>';
        return;
    }

    const html = window.tempCriteres.map((critere, index) => `
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--bordure-claire); border-radius: 6px; margin-bottom: 10px;">
                            ${window.boutonRetirerBloc({
                                action: 'supprimerCritereTemp',
                                param: index,
                                coin: true,
                                titre: 'Supprimer ce critère'
                            })}
            <div style="display: grid; grid-template-columns: 60px 2fr 140px 90px 150px 3fr; gap: 12px; align-items: end;">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div class="bloc-reordonner">
                        ${window.boutonsReordonnerBloc({
                            actionHaut: 'deplacerCritereTempHaut', actionBas: 'deplacerCritereTempBas',
                            param: index, premier: index === 0, dernier: index === window.tempCriteres.length - 1,
                            quoi: 'ce critère'
                        })}
                    </div>
                </div>
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Nom du critère <span class="text-danger u-texte-medium" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(critere.nom)}"
                           placeholder="Ex: Rédaction"
                           data-on-change="modifierCritereTempHandler" data-critere-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-type-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Type
                        <span class="primo-aide" data-target="grille-type-critere-detail"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierTypeCritereTempHandler" data-critere-index="${index}">
                        <option value="holistique" ${critere.type === 'holistique' ? 'selected' : ''}>Holistique</option>
                        <option value="analytique" ${critere.type === 'analytique' ? 'selected' : ''}>Analytique</option>
                        <option value="algorithmique" ${critere.type === 'algorithmique' ? 'selected' : ''}>Algorithmique</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Pond. (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(critere.ponderation)}"
                           min="0"
                           max="100"
                           data-on-change="modifierPonderationCritereTempHandler" data-critere-index="${index}">
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Niveau SOLO
                        <span class="primo-aide" data-target="grille-niveau-solo"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierCritereTempHandler" data-critere-index="${index}" data-champ="niveauSOLO">
                        <option value="multistructurel" ${(critere.niveauSOLO || 'multistructurel') === 'multistructurel' ? 'selected' : ''}>Multistructurel</option>
                        <option value="relationnel" ${critere.niveauSOLO === 'relationnel' ? 'selected' : ''}>Relationnel</option>
                        <option value="abstrait_etendu" ${critere.niveauSOLO === 'abstrait_etendu' ? 'selected' : ''}>Abstrait étendu</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Description</label>
                    <input type="text"
                           class="controle-form"
                           value="${critere.description || ''}"
                           placeholder="Ex: Qualité de la langue, structure du texte..."
                           data-on-change="modifierCritereTempHandler" data-critere-index="${index}" data-champ="description">
                </div>
            </div>
            ${critere.type === 'algorithmique' ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--bordure-claire);">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: var(--gris-moyen);">Facteur de normalisation (nombre de mots)</label>
                        <input type="number"
                               class="controle-form"
                               value="${critere.facteurNormalisation || 500}"
                               min="1"
                               placeholder="500"
                               data-on-change="modifierCritereTempHandler" data-critere-index="${index}" data-champ="facteurNormalisation" data-parse-int
                               title="Nombre de mots de référence pour le calcul (défaut: 500)">
                    </div>
                    <div style="grid-column: span 2;">
                        <p style="font-size: 0.85rem; color: var(--gris-moyen); margin: 0; padding-top: 8px;">
                            <strong>Formule:</strong> Note = Pondération − (Erreurs ÷ Mots × ${critere.facteurNormalisation || 500})
                        </p>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `).join('');

    // Ajouter le bouton pour ajouter un critère (pleine largeur comme échelles)
    container.innerHTML = html + `
        <button class="sidebar-btn-ajouter" data-action="ajouterCritereTemp">
            + Ajouter un critère
        </button>
    `;
}

/**
 * Modifie un critère temporaire
 */
function modifierCritereTemp(index, champ, valeur) {
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    window.tempCriteres[index][champ] = valeur;
}

/**
 * Ajoute un nouveau critère temporaire
 */
function ajouterCritereTemp() {
    if (!window.tempCriteres) window.tempCriteres = [];
    window.tempCriteres.push({
        id: genererIdUnique('TEMP_CR_'),
        nom: '',
        type: 'holistique',
        ponderation: 0,
        description: ''
    });
    afficherCriteresTemp();
    mettreAJourTotalTemp();
}

/**
 * Supprime un critère temporaire
 */
function supprimerCritereTemp(index) {
    if (!window.tempCriteres) return;
    window.tempCriteres.splice(index, 1);
    afficherCriteresTemp();
    mettreAJourTotalTemp();
}

/**
 * Met à jour le total de pondération pour les critères temporaires
 */
function mettreAJourTotalTemp() {
    const total = (window.tempCriteres || []).reduce((sum, c) => sum + (c.ponderation || 0), 0);
    const totalElement = document.getElementById('totalPonderationAffichage');
    if (totalElement) {
        totalElement.textContent = total + '%';
        totalElement.style.color = total === 100 ? 'var(--vert-accent)' : 'var(--orange-accent)';
    }
}

/**
 * Déplace un critère temporaire vers le haut
 */
function deplacerCritereTempHaut(index) {
    if (!window.tempCriteres || index <= 0) return;
    [window.tempCriteres[index - 1], window.tempCriteres[index]] = [window.tempCriteres[index], window.tempCriteres[index - 1]];
    afficherCriteresTemp();
}

/**
 * Déplace un critère temporaire vers le bas
 */
function deplacerCritereTempBas(index) {
    if (!window.tempCriteres) return;
    if (index >= window.tempCriteres.length - 1) return;
    [window.tempCriteres[index], window.tempCriteres[index + 1]] = [window.tempCriteres[index + 1], window.tempCriteres[index]];
    afficherCriteresTemp();
}

/**
 * Déplace un critère de grille vers le haut
 */
async function deplacerCritereGrilleHaut(grilleId, index) {
    if (index <= 0) return;
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    if (!grille || !grille.criteres) return;

    [grille.criteres[index - 1], grille.criteres[index]] = [grille.criteres[index], grille.criteres[index - 1]];
    grille.dateModification = new Date().toISOString();
    await db.set(cle('grillesTemplates'), grilles);

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    afficherCriteresGrille(grille);
}

/**
 * Déplace un critère de grille vers le bas
 */
async function deplacerCritereGrilleBas(grilleId, index) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    if (!grille || !grille.criteres) return;
    if (index >= grille.criteres.length - 1) return;

    [grille.criteres[index], grille.criteres[index + 1]] = [grille.criteres[index + 1], grille.criteres[index]];
    grille.dateModification = new Date().toISOString();
    await db.set(cle('grillesTemplates'), grilles);

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    afficherCriteresGrille(grille);
}

async function chargerGrillePourModif(id) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    document.getElementById('accueilGrilles').classList.add('u-hide');
    const conteneur = document.getElementById('conteneurEditionGrille');
    conteneur.classList.remove('u-hide');

    // Note: Export/Import se font maintenant via la bibliothèque

    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const btnSupprimer = document.getElementById('btnSupprimerGrille');
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

    // Définir la grille actuelle (objet complet, pas juste l'ID)
    grilleTemplateActuelle = grille;

    // Remplir le formulaire
    document.getElementById('nomGrilleTemplate').value = grille.nom || '';
    document.getElementById('descriptionGrille').value = grille.description || '';

    // Afficher les checkboxes pratiques compatibles
    const containerPratiques = document.getElementById('checkboxesPratiquesGrille');
    if (containerPratiques && typeof GabaritsUtils !== 'undefined') {
        const pratiquesActuelles = grille.pratiquesCompatibles || [];
        containerPratiques.innerHTML = GabaritsUtils.genererCheckboxesPratiques('grille', pratiquesActuelles);
    }

    // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
    const panneauMeta = document.getElementById('panneauMetadonneesGrille');
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
        panneauMeta.innerHTML = genererPanneauMetadonnees(grille, 'grille');
    }

    // Afficher les critères
    afficherCriteresGrille(grille);

    // Phase 4.B : mode lecture seule si item démo
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneur, grille, 'dupliquerEtEditerGrille', 'Dupliquer pour créer ma grille');
    }

    // Mettre le highlight
    definirGrilleActive(id);

}

/**
 * Phase 4.B : fork une grille démo et charge la copie en édition.
 * Déclenché depuis le bandeau du formulaire en lecture seule.
 */
async function dupliquerEtEditerGrille(id) {
    // #476 volet 2 — la séquence vit dans BibliothequeUI.dupliquerEtEditerItem ;
    // il ne reste ici que la plomberie propre aux grilles.
    await BibliothequeUI.dupliquerEtEditerItem({
        id: id,
        prefixeId: 'GRILLE_',
        lireListe: async () => await db.get(cle('grillesTemplates')) || [],
        ecrireListe: async (liste) => { await db.set(cle('grillesTemplates'), liste); }, // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
        rafraichirListe: async () => { await afficherListeGrilles(); },
        chargerPourModif: async (idCopie) => { await chargerGrillePourModif(idCopie); },
        champFocus: 'nomGrilleTemplate'
    });
}

function afficherCriteresGrille(grille) {
    const container = document.getElementById('listeCriteres');
    if (!container) return;

    if (!grille.criteres || grille.criteres.length === 0) {
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun critère défini</p>';
        return;
    }

    const html = grille.criteres.map((critere, index) => `
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--bordure-claire); border-radius: 6px; margin-bottom: 10px;">
                            ${window.boutonRetirerBloc({
                                action: 'supprimerCritereGrille',
                                param: grille.id,
                                param2: index,
                                coin: true,
                                titre: 'Supprimer ce critère'
                            })}
            <div style="display: grid; grid-template-columns: 60px 2fr 140px 90px 150px 3fr; gap: 12px; align-items: end;">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div class="bloc-reordonner">
                        ${window.boutonsReordonnerBloc({
                            actionHaut: 'deplacerCritereGrilleHaut', actionBas: 'deplacerCritereGrilleBas',
                            param: grille.id,
                            param2: index,
                            premier: index === 0, dernier: index === grille.criteres.length - 1, quoi: 'ce critère'
                        })}
                    </div>
                </div>
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Nom du critère <span class="text-danger u-texte-medium" title="Champ obligatoire">*</span></label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(critere.nom)}"
                           data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-type-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Type
                        <span class="primo-aide" data-target="grille-type-critere-detail"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierTypeCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}">
                        <option value="holistique" ${critere.type === 'holistique' ? 'selected' : ''}>Holistique</option>
                        <option value="analytique" ${critere.type === 'analytique' ? 'selected' : ''}>Analytique</option>
                        <option value="algorithmique" ${critere.type === 'algorithmique' ? 'selected' : ''}>Algorithmique</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Pond. (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(critere.ponderation)}"
                           min="0"
                           max="100"
                           data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="ponderation" data-parse-int>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Niveau SOLO
                        <span class="primo-aide" data-target="grille-niveau-solo"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <select class="controle-form"
                            data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="niveauSOLO">
                        <option value="multistructurel" ${(critere.niveauSOLO || 'multistructurel') === 'multistructurel' ? 'selected' : ''}>Multistructurel</option>
                        <option value="relationnel" ${critere.niveauSOLO === 'relationnel' ? 'selected' : ''}>Relationnel</option>
                        <option value="abstrait_etendu" ${critere.niveauSOLO === 'abstrait_etendu' ? 'selected' : ''}>Abstrait étendu</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Description</label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(critere.description || '')}"
                           data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="description">
                </div>
            </div>
            ${critere.type === 'algorithmique' ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--bordure-claire);">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: var(--gris-moyen);">Facteur de normalisation (nombre de mots)</label>
                        <input type="number"
                               class="controle-form"
                               value="${critere.facteurNormalisation || 500}"
                               min="1"
                               placeholder="500"
                               data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="facteurNormalisation" data-parse-int
                               title="Nombre de mots de référence pour le calcul (défaut: 500)">
                    </div>
                    <div style="grid-column: span 2;">
                        <p style="font-size: 0.85rem; color: var(--gris-moyen); margin: 0; padding-top: 8px;">
                            <strong>Formule:</strong> Note = Pondération − (Erreurs ÷ Mots × ${critere.facteurNormalisation || 500})
                        </p>
                        <p style="font-size: 0.75rem; color: var(--gris-clair); margin: 4px 0 0 0;">
                            Lors de l'évaluation, tu saisiras le nombre d'erreurs et le nombre de mots de la rédaction.
                        </p>
                    </div>
                </div>

                <!-- Gestion des sous-critères -->
                <div class="sous-criteres-conteneur">
                    <div class="sous-criteres-header">
                        <h4 class="sous-criteres-titre">
                            Sous-critères
                            ${critere.sousCriteres && critere.sousCriteres.length > 0 ?
                                `<span class="sous-criteres-compteur">(${critere.sousCriteres.length})</span>` :
                                ''}
                        </h4>
                        ${!critere.sousCriteres || critere.sousCriteres.length === 0 ? `
                        <button class="btn btn-secondaire btn-tres-compact sous-criteres-btn-defaut"
                                data-action="initialiserSousCriteresParDefaut" data-param="${grille.id}" data-param2="${index}">
                            📋 Utiliser sous-critères par défaut (0-10)
                        </button>
                        ` : ''}
                    </div>

                    ${critere.sousCriteres && critere.sousCriteres.length > 0 ? `
                    <div class="sous-criteres-liste-conteneur">
                        ${critere.sousCriteres.map((sc, scIndex) => `
                        <div class="sous-critere-item">
                            <div class="sous-critere-champs-grid">
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Code</label>
                                    <input type="text"
                                           class="controle-form sous-critere-input-code"
                                           value="${sc.code || scIndex}"
                                           data-on-change="modifierSousCritereHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-sc-index="${scIndex}" data-champ="code">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Nom</label>
                                    <input type="text"
                                           class="controle-form sous-critere-input-standard"
                                           value="${sc.nom || ''}"
                                           placeholder="Ex: Syntaxe, Ponctuation..."
                                           data-on-change="modifierSousCritereHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-sc-index="${scIndex}" data-champ="nom">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Pondération</label>
                                    <input type="number"
                                           class="controle-form sous-critere-input-standard"
                                           value="${sc.ponderation !== undefined ? sc.ponderation : 1.0}"
                                           min="0"
                                           step="0.1"
                                           placeholder="1.0"
                                           data-on-change="modifierSousCritereHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-sc-index="${scIndex}" data-champ="ponderation" data-parse-float
                                           title="Ex: 1.0 pour erreur complète, 0.5 pour demi-point">
                                </div>
                                <button class="btn btn-supprimer btn-tres-compact"
                                        data-action="supprimerSousCritere" data-param="${grille.id}" data-param2="${index}" data-param3="${scIndex}"
                                        title="Supprimer ce sous-critère">
                                    ✕
                                </button>
                            </div>
                            <div class="groupe-form sous-critere-description-groupe">
                                <label class="sous-critere-label-petit">Description / Rétroaction</label>
                                <textarea class="controle-form sous-critere-textarea"
                                          rows="2"
                                          placeholder="Ex: La plupart des erreurs concernent la construction syntaxique..."
                                          data-on-change="modifierSousCritereHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-sc-index="${scIndex}" data-champ="retroaction">${sc.retroaction || ''}</textarea>
                            </div>
                        </div>
                        `).join('')}

                        <!-- Bouton ajouter après la liste -->
                        <button class="btn btn-ajouter btn-tres-compact sous-criteres-btn-ajouter-liste"
                                data-action="ajouterSousCritere" data-param="${grille.id}" data-param2="${index}">
                            + Ajouter un sous-critère
                        </button>
                    </div>
                    ` : `
                    <p class="sous-criteres-vide-message">
                        Aucun sous-critère défini. Utilise les sous-critères par défaut ou crée les tiens.
                    </p>

                    <!-- Bouton ajouter quand liste vide -->
                    <button class="btn btn-ajouter btn-tres-compact sous-criteres-btn-ajouter-vide"
                            data-action="ajouterSousCritere" data-param="${grille.id}" data-param2="${index}">
                        + Ajouter un sous-critère
                    </button>
                    `}

                    <p class="sous-criteres-info">
                        💡 Les sous-critères permettent de catégoriser les erreurs avec des pondérations différentes (ex: ponctuation = 0.5 point).
                    </p>
                </div>
            </div>
            ` : ''}
        </div>
    `).join('');

    // Ajouter un bouton pour ajouter un nouveau critère
    const btnAjouterCritere = `
        <button class="btn btn-principal" data-action="ajouterCritereGrille" data-param="${grille.id}" class="u-mt-10">
            + Ajouter un critère
        </button>
    `;

    container.innerHTML = html + btnAjouterCritere;

    // Calculer et afficher le total de pondération
    calculerEtAfficherTotalPonderation(grille);
}

/**
 * Calcule et affiche le total de pondération des critères
 */
function calculerEtAfficherTotalPonderation(grille) {
    const totalElement = document.getElementById('totalPonderationAffichage');
    if (!totalElement) return;

    let total = 0;
    if (grille && grille.criteres) {
        total = grille.criteres.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0);
    }

    totalElement.textContent = total + '%';

    // Changer la couleur selon le total
    if (total === 100) {
        totalElement.style.color = 'var(--vert-moyen)';
    } else if (total > 100) {
        totalElement.style.color = 'var(--rouge)';
    } else {
        totalElement.style.color = 'var(--orange-accent)';
    }
}

/**
 * Modifie un critère d'une grille
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère à modifier
 * @param {string} champ - Nom du champ à modifier
 * @param {any} valeur - Nouvelle valeur
 */
/**
 * Obtient une grille par son ID
 */
async function obtenirGrilleParId(grilleId) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    return grilles.find(g => g.id === grilleId);
}

async function modifierCritereGrille(grilleId, critereIndex, champ, valeur) {
    // #510 (25 août 2026) — LA SAISIE QUI NE RESTAIT PAS.
    //
    // Cette fonction lisait la collection entière, y changeait une valeur et la
    // réécrivait entière. Or le `change` d'un champ part au BLUR : quitter un
    // champ pour cliquer dans le suivant lance deux enregistrements coup sur
    // coup, qui lisaient le même instantané — le second réécrivait la grille
    // sans la modification du premier, sans erreur et sans message.
    // `db.modifier` sérialise la séquence entière par clé (cf. db.js).
    //
    // ⚠ Le mutateur rend `undefined` pour ANNULER l'écriture : une grille ou un
    // critère introuvable ne doit pas réécrire la collection telle quelle.
    let grilleModifiee = null;
    await db.modifier(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === grilleId);
        if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return undefined;

        // Mettre à jour le champ
        grille.criteres[critereIndex][champ] = valeur;
        grille.dateModification = new Date().toISOString();
        grilleModifiee = grille;
        return grilles;
    }, []);

    if (!grilleModifiee) return;
    const grille = grilleModifiee;

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle pour éviter l'écrasement
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    // Recalculer et afficher la pondération totale
    if (champ === 'ponderation') {
        calculerEtAfficherTotalPonderation(grille);
    }

}

/* ===============================
   GESTION DES SOUS-CRITÈRES
   =============================== */

/**
 * Initialise les sous-critères par défaut (codes 0-10) pour un critère algorithmique
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 */
async function initialiserSousCriteresParDefaut(grilleId, critereIndex) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Sous-critères par défaut (vos 11 catégories)
    const sousCriteresParDefaut = [
        {
            id: 'sc_0',
            code: '0',
            nom: 'Aucune erreur',
            ponderation: 0,
            retroaction: 'Le nombre d\'erreurs de français est trop petit pour cibler un objectif de travail précis.'
        },
        {
            id: 'sc_1',
            code: '1',
            nom: 'Syntaxe',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs concernent la construction syntaxique (sujet, prédicat, complément de phrase ou autres compléments) ou l\'accord du verbe (accord avec le sujet, conjugaison, etc.). Il arrive que certaines phrases sont incomplètes ou confuses, ou encore que le lien entre le verbe et son sujet soit erroné. Vérifie que chaque phrase a bien un sujet et un verbe (et parfois un complément) en les identifiant dans l\'interligne. Assure-toi qu\'il n\'y a pas trop de compléments (ce qui pourrait rendre la phrase confuse). Vérifie également la conjugaison et l\'accord des verbes en t\'aidant de l\'Annexe de grammaire de ton manuel Méthodes quantitatives.'
        },
        {
            id: 'sc_2',
            code: '2',
            nom: 'Subordination',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont causées par des subordonnées employées seules. Elles sont construites comme des compléments qui ne se rattachent à aucun prédicat. Relis la phrase pour vérifier sa clarté et assure-toi que chaque subordonnée est rattachée à une phrase principale par un mot de liaison. On peut parfois aussi ajuster la ponctuation pour y remédier.'
        },
        {
            id: 'sc_3',
            code: '3',
            nom: 'Ponctuation',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont liées à l\'emploi de la ponctuation. Certains signes de ponctuation (comme la virgule) sont employés de manière superflue ou manquent là où ils seraient nécessaires. Dans d\'autres cas, le point d\'interrogation ou d\'exclamation doit être remplacé par un point. Pour réviser, tu peux te servir de la section portant sur la ponctuation dans l\'Annexe de grammaire de ton manuel.'
        },
        {
            id: 'sc_4',
            code: '4',
            nom: 'Orthographe d\'usage',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont liées à l\'orthographe d\'usage, c\'est-à-dire que les mots sont mal orthographiés, ce qui peut parfois modifier le sens de la phrase. Il est conseillé de te servir d\'un dictionnaire (comme Antidote) pour réviser ton texte avant de le remettre. Utilise également un outil de synthèse vocale pour entendre ton texte : cela aide généralement à repérer et corriger ce type d\'erreur.'
        },
        {
            id: 'sc_5',
            code: '5',
            nom: 'Homophones',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont causées par la confusion entre des homophones, c\'est-à-dire des mots qui se prononcent de la même façon, mais qui s\'écrivent différemment (par exemple : «ce» et «se», «a» et «à», «son» et «sont», etc.). Il est possible de réviser les règles générales de ces mots dans l\'Annexe de grammaire de ton manuel. Un truc : en lisant ton texte à voix haute, tu peux parfois repérer ces erreurs.'
        },
        {
            id: 'sc_6',
            code: '6',
            nom: 'Accords dans le GN',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs concernent les accords dans le groupe nominal (déterminant, nom et adjectif). Vérifie que tous les mots d\'un même groupe nominal sont bien accordés en genre (masculin ou féminin) et en nombre (singulier ou pluriel). Pour réviser, sers-toi de ton manuel ou d\'Antidote. Un truc : surligne les groupes nominaux dans ton texte pour vérifier les accords.'
        },
        {
            id: 'sc_7',
            code: '7',
            nom: 'Participes passés',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs concernent l\'accord des participes passés. Cet accord dépend de la présence et de la position du complément direct (CD) par rapport au verbe. Il est possible de réviser les règles dans l\'Annexe de grammaire de ton manuel. Un truc : identifie d\'abord le verbe conjugué, puis cherche le complément direct (CD) en posant les questions «qui ?» ou «quoi ?» après le verbe.'
        },
        {
            id: 'sc_8',
            code: '8',
            nom: 'Mots inappropriés',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont liées à un mauvais usage de certains mots. Par exemple : des anglicismes, des mots employés dans un sens erroné, ou encore un registre de langue trop familier pour un texte scientifique. Assure-toi d\'employer les bons termes en consultant un dictionnaire (comme Antidote). Pour le registre de langue, révise ton texte en cherchant les mots ou expressions qui pourraient être trop familiers.'
        },
        {
            id: 'sc_9',
            code: '9',
            nom: 'Répétitions et pléonasmes',
            ponderation: 1.0,
            retroaction: 'La plupart des erreurs sont liées à des répétitions (un même mot revient trop souvent) ou à des pléonasmes (redondance inutile, comme «monter en haut»). Pour corriger, utilise des synonymes pour varier ton vocabulaire et assure-toi de ne pas répéter inutilement une idée déjà exprimée.'
        },
        {
            id: 'sc_10',
            code: '10',
            nom: 'Autres erreurs',
            ponderation: 1.0,
            retroaction: 'Les erreurs sont variées et ne relèvent pas d\'une seule catégorie précise. Continue de t\'exercer en français écrit et n\'hésite pas à consulter ton enseignant pour des conseils personnalisés.'
        }
    ];

    grille.criteres[critereIndex].sousCriteres = sousCriteresParDefaut;

    // Sauvegarder dans localStorage
    await db.set(cle('grillesTemplates'), grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

}

/**
 * Ajoute un nouveau sous-critère vide à un critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 */
async function ajouterSousCritere(grilleId, critereIndex) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Initialiser le tableau sousCriteres si nécessaire
    if (!grille.criteres[critereIndex].sousCriteres) {
        grille.criteres[critereIndex].sousCriteres = [];
    }

    // Générer un ID unique et un code par défaut
    const nouveauCode = grille.criteres[critereIndex].sousCriteres.length;

    const nouveauSousCritere = {
        id: genererIdUnique('SC_'),
        code: nouveauCode.toString(),
        nom: '',
        ponderation: 1.0,
        retroaction: ''
    };

    grille.criteres[critereIndex].sousCriteres.push(nouveauSousCritere);

    // Sauvegarder dans localStorage
    await db.set(cle('grillesTemplates'), grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

}

/**
 * Modifie un champ d'un sous-critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 * @param {number} sousCritereIndex - Index du sous-critère
 * @param {string} champ - Nom du champ à modifier
 * @param {any} valeur - Nouvelle valeur
 */
async function modifierSousCritere(grilleId, critereIndex, sousCritereIndex, champ, valeur) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex] ||
        !grille.criteres[critereIndex].sousCriteres ||
        !grille.criteres[critereIndex].sousCriteres[sousCritereIndex]) return;

    // Mettre à jour le champ
    grille.criteres[critereIndex].sousCriteres[sousCritereIndex][champ] = valeur;

    // Sauvegarder dans localStorage
    await db.set(cle('grillesTemplates'), grilles);

}

/**
 * Supprime un sous-critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 * @param {number} sousCritereIndex - Index du sous-critère
 */
async function supprimerSousCritere(grilleId, critereIndex, sousCritereIndex) {
    if (!confirm('Supprimer ce sous-critère ?')) return;

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex] ||
        !grille.criteres[critereIndex].sousCriteres) return;

    // Supprimer le sous-critère
    grille.criteres[critereIndex].sousCriteres.splice(sousCritereIndex, 1);

    // Sauvegarder dans localStorage
    await db.set(cle('grillesTemplates'), grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

}

/**
 * Ajoute un nouveau critère à une grille
 * @param {string} grilleId - ID de la grille
 */
async function ajouterCritereGrille(grilleId) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // Initialiser le tableau de critères si nécessaire
    if (!grille.criteres) {
        grille.criteres = [];
    }

    // Créer un nouveau critère avec des valeurs par défaut
    const nouveauCritere = {
        nom: 'Nouveau critère',
        type: 'holistique',
        ponderation: 0,
        description: ''
    };

    // Ajouter le critère à la grille
    grille.criteres.push(nouveauCritere);

    // Sauvegarder dans localStorage
    await db.set(cle('grillesTemplates'), grilles);

    // Réafficher la liste des critères (calculera automatiquement le total)
    afficherCriteresGrille(grille);

}

/**
 * Supprime un critère d'une grille
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère à supprimer
 */
async function supprimerCritereGrille(grilleId, critereIndex) {
    if (!confirm('Es-tu sûr de vouloir supprimer ce critère ?')) {
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Supprimer le critère
    grille.criteres.splice(critereIndex, 1);
    grille.dateModification = new Date().toISOString();

    // Sauvegarder dans IndexedDB
    await db.set(cle('grillesTemplates'), grilles);

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    // Réafficher la liste des critères (calculera automatiquement le total)
    afficherCriteresGrille(grille);

}

function definirGrilleActive(id) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

async function dupliquerGrilleDepuisSidebar(id) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    // ✅ D1 + D4 + D5 (arbitrage du 24 août) — LA COPIE DEVIENT CELLE DE
    // L'UTILISATEUR. Avant, cette voie se contentait d'étaler la source : elle ne
    // posait ni `auteur`, ni `isDemo`, ni `inspireDe`, et gardait `metadata_cc`.
    // Or `BibliothequeUI.estItemDemo` rend vrai sur `isDemo === true` OU sur
    // l'auteur « Demo Labo Codex » — la copie gardait LES DEUX, et
    // `appliquerModeLectureSeuleDemo` désactivait alors tous ses champs :
    // dupliquer un exemple depuis la barre latérale rendait une copie qu'on ne
    // pouvait toujours pas modifier, soit exactement ce que le geste doit débloquer.
    const copie = {
        ...grille,
        id: genererIdUnique('GRILLE_'),
        nom: nommerCopie(grille.nom, grilles),
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: BibliothequeUI.forgerInspireDe(grille),
        verrouille: false
    };
    delete copie.metadata_cc;
    delete copie.auteurOriginal;

    grilles.push(copie);
    await db.set(cle('grillesTemplates'), grilles);

    await afficherListeGrilles();
    await chargerGrillePourModif(copie.id);

    notifications.succes('Grille "' + copie.nom + '" dupliquée !');
}

async function supprimerGrilleDepuisSidebar(id) {
    // ⚠ GARDE D'ORPHELINAGE (24 août 2026, sur relevé du corpus de Grégoire).
    //
    // Les cartouches ne vivent pas DANS la grille : elles sont ancrées à part,
    // dans `cartouches_{grilleId}`. Retirer la grille de la liste sans toucher à
    // cette clé ne détruit rien — mais plus personne ne peut lire ce qu'elle
    // contient : la barre latérale et la bibliothèque n'énumèrent que les
    // cartouches des grilles PRÉSENTES. Les cartouches deviennent invisibles, et
    // l'enseignant conclut qu'elles n'ont pas été enregistrées.
    //
    // C'est exactement ce qui s'est passé : son diagnostic du 24 août a retrouvé
    // « Carte mentale A26 », « Plan de rédaction A26 » et « Stratégies de lecture
    // A26 » vivantes dans des clés dont la grille avait disparu de son trimestre.
    //
    // `supprimerGrilleDefinitivement` portait DÉJÀ cette garde. Ce chemin-ci —
    // celui de la corbeille de la barre latérale, le plus utilisé — ne l'avait
    // jamais reçue. Deux chemins, une même action, une seule protégée.
    const cartouchesLiees = await db.get(`cartouches_${id}`) || [];
    if (cartouchesLiees.length > 0) {
        const noms = cartouchesLiees.slice(0, 5).map(c => (c && c.nom) || 'sans nom').join(', ');
        const reste = cartouchesLiees.length > 5 ? `, et ${cartouchesLiees.length - 5} autre(s)` : '';
        alert(
            `Impossible de supprimer cette grille.\n\n` +
            `${cartouchesLiees.length} cartouche(s) y sont rattachée(s) : ${noms}${reste}.\n\n` +
            `Supprime-les d'abord, ou déplace-les vers une autre grille — sinon elles ` +
            `deviendraient introuvables.`
        );
        return;
    }

    if (!confirm('Supprimer cette grille ?')) return;

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const index = grilles.findIndex(g => g.id === id);

    if (index !== -1) {
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
            window.marquerRessourceSupprimee(id);
        }
        grilles.splice(index, 1);
        await db.set(cle('grillesTemplates'), grilles);
        await afficherListeGrilles();
        document.getElementById('conteneurEditionGrille').classList.add('u-hide');
        // Note: optionsImportExportGrilles supprimé en Beta 92
        document.getElementById('accueilGrilles').classList.remove('u-hide');
        notifications.succes('Grille supprimée');
    }
}

/**
 * Annule l'édition de grille et retourne à l'accueil
 */
function annulerFormGrille() {
    document.getElementById('conteneurEditionGrille').classList.add('u-hide');
    // Note: optionsImportExportGrilles supprimé en Beta 92
    document.getElementById('accueilGrilles').classList.remove('u-hide');

    // Retirer le highlight
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Réinitialiser la grille actuelle
    grilleTemplateActuelle = null;
}

/**
 * Duplique la grille actuellement en édition
 */
async function dupliquerGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille en cours d\'édition');
        return;
    }
    // ✅ CORRIGÉ (16 mars 2026) : grilleTemplateActuelle est un objet, pas un ID
    // ✅ D10 (arbitrage du 24 août) : `async` + `await`, aligné sur
    // `dupliquerEchelleActive`. Avant, seule des 22 à être synchrone, elle rendait
    // la main AVANT l'écriture — un appelant qui enchaînait lisait l'état d'avant.
    await dupliquerGrilleDepuisSidebar(grilleTemplateActuelle.id);
}

/**
 * Supprime la grille actuellement en édition
 */
async function supprimerGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille en cours d\'édition');
        return;
    }

    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) {
        return;
    }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    // ✅ CORRIGÉ (6 jan 2026) : grilleTemplateActuelle est un objet, pas un ID
    const index = grilles.findIndex(g => g.id === grilleTemplateActuelle.id);

    if (index !== -1) {
        const nomGrille = grilleTemplateActuelle.nom || 'Grille';
        grilles.splice(index, 1);
        await db.set(cle('grillesTemplates'), grilles);

        // ✅ CORRIGÉ (16 mars 2026) : marquer comme supprimée pour empêcher assurerGrilleGenerique() de la réinjecter
        window.marquerRessourceSupprimee(grilleTemplateActuelle.id);

        // Fermer le formulaire et retourner à l'accueil
        annulerFormGrille();

        // Recharger la liste
        await afficherListeGrilles();

        // ✅ Notification au lieu d'alert
        notifications.succes(`Grille "${nomGrille}" supprimée`);
    }
}

/**
 * Sauvegarde complète de la grille (nom + critères)
 * ✅ CORRIGÉ (6 jan 2026 - Bug Bruno) : Utiliser sauvegarderGrilleTemplate directement
 */
async function sauvegarderGrilleComplete() {
    // ✅ CORRIGÉ : Appeler sauvegarderGrilleTemplate avec await
    // sauvegarderNomGrille() ne fonctionne que pour les grilles existantes
    await sauvegarderGrilleTemplate(false);

    // Récupérer l'ID APRÈS la sauvegarde (pour nouvelles grilles)
    const idSauvegarde = grilleTemplateActuelle?.id;

    // Recharger la liste pour refléter les changements
    await afficherListeGrilles();

    // Réouvrir la grille en mode édition pour qu'elle reste visible
    if (idSauvegarde && typeof chargerGrillePourModif === 'function') {
        setTimeout(() => {
            chargerGrillePourModif(idSauvegarde);
        }, 100);
    }
}

// Export global
window.afficherListeGrilles = afficherListeGrilles;
window.creerNouvelleGrille = creerNouvelleGrille;
window.afficherCriteresTemp = afficherCriteresTemp;
window.modifierCritereTemp = modifierCritereTemp;
window.ajouterCritereTemp = ajouterCritereTemp;
window.supprimerCritereTemp = supprimerCritereTemp;
window.mettreAJourTotalTemp = mettreAJourTotalTemp;
window.deplacerCritereTempHaut = deplacerCritereTempHaut;
window.deplacerCritereTempBas = deplacerCritereTempBas;
window.deplacerCritereGrilleHaut = deplacerCritereGrilleHaut;
window.deplacerCritereGrilleBas = deplacerCritereGrilleBas;
/**
 * Affiche la configuration des catégories d'erreurs pour un critère algorithmique
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 */
async function afficherConfigurationCategoriesErreurs(grilleId, critereIndex) {
    const grille = await obtenirGrilleParId(grilleId);
    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) {
        alert('Critère introuvable');
        return;
    }

    const critere = grille.criteres[critereIndex];

    // Catégories par défaut basées sur votre système
    const categoriesParDefaut = [
        { code: "0", retroaction: "Le nombre d'erreurs de français est trop petit pour cibler un objectif de travail précis." },
        { code: "1", retroaction: "La plupart des erreurs concernent la construction syntaxique (sujet, prédicat, complément de phrase ou autres compléments) ou l'accord du verbe (accord avec le sujet, conjugaison, etc.). Il arrive que certaines phrases sont incomplètes ou confuses, ou encore que le lien entre le verbe et son sujet soit erroné. Vérifie que chaque phrase a bien un sujet et un verbe (et parfois un complément) en les identifiant dans l'interligne. Assure-toi qu'il n'y a pas trop de compléments (ce qui pourrait rendre la phrase confuse). Vérifie également la conjugaison et l'accord des verbes en utilisant des tableaux de conjugaison." },
        { code: "2", retroaction: "La plupart des erreurs sont causées par des subordonnées employées seules. Elles sont construites comme des compléments qui ne se rattachent à aucun prédicat. Relis la phrase pour vérifier sa clarté et assure-toi que chaque subordonnée est rattachée à une phrase principale par un mot de liaison. On peut parfois aussi ajuster la ponctuation pour y remédier." },
        { code: "3", retroaction: "La plupart des erreurs concernent l'utilisation de la ponctuation. Elle peut être relative au coordonnant, au complément de phrase, au complément du nom, à l'organisateur textuel, à une énumération (dont la juxtaposition de phrases) ou encore à une citation. La ponctuation fautive vient embrouiller la structure et la clarté des idées. Vérifie les règles de ponctuation pour les différents types de phrases et de propositions. Certaines conjonctions rendent obligatoire l'usage de la virgule. Utilise des guides de ponctuation pour vérifier cet usage." },
        { code: "4", retroaction: "La plupart des erreurs concernent l'accord en genre et en nombre dans le groupe du nom (déterminant, nom, adjectif). Il devient plus difficile de comprendre le lien entre les mots si ces accords ne sont pas faits. Identifie dans l'interligne le genre et le nombre du nom, puis assure-toi que tous les éléments du groupe concordent." },
        { code: "5", retroaction: "La plupart des erreurs concernent l'accord du pronom ou le lien avec son antécédent. Il devient plus difficile de comprendre l'objet dont on parle ou ce à quoi on fait référence quand il y a de l'ambiguïté sur ce plan. Relis ta phrase pour clarifier à quoi ou à qui chaque pronom se réfère. Assure-toi qu'il n'y a pas d'autres noms qui pourraient faire écran entre les deux. Vérifie le lien du pronom avec son antécédent et assure-toi que l'accord est correct." },
        { code: "6", retroaction: "La plupart des erreurs concernent l'accord du participe passé. Révise les règles d'accord du participe passé avec avoir (accord avec le COD s'il est placé avant) et avec être (accord avec le sujet). Identifie ces éléments dans l'interligne, fais des flèches et vérifie les accords." },
        { code: "7", retroaction: "La plupart des erreurs concernent les mots invariables, plus précisément l'usage de la préposition, de l'adverbe ou de la conjonction. L'orthographe de ces mots ne change jamais. Consulte les listes de mots invariables et l'usage qu'on en fait. Vérifie surtout le sens de ces mots, car ils sont parfois confondus les uns avec les autres." },
        { code: "8", retroaction: "La plupart des erreurs concernent l'usage du déterminant. Choisis le déterminant approprié en fonction du nom et du contexte, puis vérifie qu'il concorde en genre et en nombre avec le nom qu'il accompagne." },
        { code: "9", retroaction: "La plupart des erreurs concernent le vocabulaire, c'est-à-dire le sens d'un mot ou son utilisation dans un certain contexte. L'utilisation inexacte d'une citation entre aussi dans cette catégorie. Utilise systématiquement un dictionnaire pour vérifier le sens des mots. Surtout, méfie-toi des synonymes parce qu'ils renvoient toujours à un contexte très précis qui n'est peut-être pas celui dans lequel tu écris. Vérifie tes citations en les relisant attentivement dans l'oeuvre. Évite les anglicismes (dû à, mettre l'emphase, canceller)." },
        { code: "10", retroaction: "La plupart des erreurs concernent l'orthographe d'usage (lettre, chiffre) ou des éléments de typographie (majuscule, minuscule, soulignement, italique, etc.). Relis ton texte et vérifie systématiquement dans le dictionnaire les mots dont l'orthographe est incertain. Dans le cas de mots étrangers ou de noms de personnages, relis bien ton oeuvre. N'oublie pas également que les titres d'oeuvres ou de chapitres requièrent respectivement l'italique ou le soulignement (les guillemets fonctionnent aussi)." }
    ];

    // Initialiser avec les catégories par défaut si elles n'existent pas encore
    if (!critere.categoriesErreurs) {
        critere.categoriesErreurs = categoriesParDefaut;

        // Sauvegarder immédiatement dans localStorage
        const grilles = await db.get(cle('grillesTemplates')) || [];
        const grilleIndex = grilles.findIndex(g => g.id === grilleId);
        if (grilleIndex !== -1) {
            grilles[grilleIndex] = grille;
            await db.set(cle('grillesTemplates'), grilles);
        }
    }

    // Créer le modal de configuration
    const modalHtml = `
        <div id="modalCategoriesErreurs" class="modal-js-overlay" style="z-index: 9999;">
            <div class="modal-js-contenu" style="max-width: 900px; width: 90%;">
                <h3 style="margin-top: 0; color: var(--accent-primaire);">⚙️ Configuration des catégories d'erreurs</h3>
                <p style="color: var(--gris-moyen); font-size: 0.9rem;">Personnalisez les catégories d'erreurs (codes 0-10) et leurs rétroactions associées.</p>

                <div id="listeCategoriesErreurs" style="margin-top: 20px;">
                    ${critere.categoriesErreurs.map((cat, idx) => `
                        <div class="categorie-erreur-item" style="margin-bottom: 20px; padding: 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--bleu-moyen);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <strong style="color: var(--accent-primaire); font-size: 1.1rem;">Code ${cat.code}</strong>
                            </div>
                            <textarea id="cat_retro_${idx}"
                                      class="controle-form"
                                      rows="4"
                                      placeholder="Rétroaction pour cette catégorie..."
                                      style="width: 100%; font-size: 0.85rem; line-height: 1.5;">${cat.retroaction || ''}</textarea>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; gap: 10px; margin-top: 25px; justify-content: flex-end;">
                    <button class="btn btn-annuler" data-action="fermerModalCategoriesErreurs">Annuler</button>
                    <button class="btn btn-confirmer" data-action="sauvegarderCategoriesErreurs" data-param="${grilleId}" data-param2="${critereIndex}">Sauvegarder</button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Sauvegarde les catégories d'erreurs configurées
 */
async function sauvegarderCategoriesErreurs(grilleId, critereIndex) {
    const grille = await obtenirGrilleParId(grilleId);
    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    const critere = grille.criteres[critereIndex];

    // Récupérer les rétroactions depuis les textareas
    critere.categoriesErreurs.forEach((cat, idx) => {
        const textarea = document.getElementById(`cat_retro_${idx}`);
        if (textarea) {
            cat.retroaction = textarea.value.trim();
        }
    });

    // Sauvegarder dans localStorage
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grilleIndex = grilles.findIndex(g => g.id === grilleId);
    if (grilleIndex !== -1) {
        grilles[grilleIndex] = grille;
        await db.set(cle('grillesTemplates'), grilles);
    }

    // Fermer le modal et rafraîchir l'affichage
    fermerModalCategoriesErreurs();
    afficherCriteresGrille(grille);

    notifications.succes('Catégories d\'erreurs sauvegardées !');
}

/**
 * Ferme le modal de configuration des catégories
 */
function fermerModalCategoriesErreurs() {
    const modal = document.getElementById('modalCategoriesErreurs');
    if (modal) {
        modal.remove();
    }
}

window.chargerGrillePourModif = chargerGrillePourModif;
window.dupliquerGrilleDepuisSidebar = dupliquerGrilleDepuisSidebar;
window.supprimerGrilleDepuisSidebar = supprimerGrilleDepuisSidebar;
window.annulerFormGrille = annulerFormGrille;
window.dupliquerGrilleActive = dupliquerGrilleActive;
window.supprimerGrilleActive = supprimerGrilleActive;
window.sauvegarderGrilleComplete = sauvegarderGrilleComplete;
/* ===============================
   MIGRATION AUTOMATIQUE
   Convertit les anciennes catégories d'erreurs en sous-critères
   =============================== */

/**
 * Migre automatiquement les anciennes catégories d'erreurs vers les sous-critères
 * Exécuté au chargement du module
 */
async function migrerCategoriesVersSousCriteres() {
    // 🆕 #464/CO-11 (21 août 2026) : garde anti-global-nu (jumelle de celle
    // d'assurerEchelleGenerique). Cette migration s'exécute AU PARSE du script,
    // avant que le trimestre actif soit établi — cle() retomberait alors sur la
    // clé GLOBALE nue que #358 interdit de réécrire. Sans effet aujourd'hui
    // (global vide), mais c'est la famille « code dormant qui se réveille ».
    if (cle('grillesTemplates') === 'grillesTemplates') return;
    const grilles = await db.get(cle('grillesTemplates')) || [];
    let nbMigrations = 0;

    grilles.forEach(grille => {
        if (!grille.criteres) return;

        grille.criteres.forEach(critere => {
            // Détecter l'ancienne structure avec categoriesErreurs
            if (critere.categoriesErreurs && critere.categoriesErreurs.length > 0 && !critere.sousCriteres) {

                // Convertir chaque catégorie en sous-critère
                critere.sousCriteres = critere.categoriesErreurs.map(cat => ({
                    id: `sc_${cat.code}`,
                    code: cat.code,
                    nom: cat.nom || `Catégorie ${cat.code}`,
                    ponderation: 1.0, // Par défaut, toutes les anciennes catégories valent 1.0
                    retroaction: cat.retroaction || ''
                }));

                // Marquer comme migré (garder l'ancienne structure pour compatibilité temporaire)
                critere._categoriesmigrees = true;

                nbMigrations++;
            }
        });
    });

    if (nbMigrations > 0) {
        await db.set(cle('grillesTemplates'), grilles);
    }
}

// Exécuter la migration au chargement du module
migrerCategoriesVersSousCriteres();

window.modifierCritereGrille = modifierCritereGrille;
window.ajouterCritereGrille = ajouterCritereGrille;
window.supprimerCritereGrille = supprimerCritereGrille;
window.afficherConfigurationCategoriesErreurs = afficherConfigurationCategoriesErreurs;
window.sauvegarderCategoriesErreurs = sauvegarderCategoriesErreurs;
window.fermerModalCategoriesErreurs = fermerModalCategoriesErreurs;
// Exports des fonctions de gestion des sous-critères
window.initialiserSousCriteresParDefaut = initialiserSousCriteresParDefaut;
window.ajouterSousCritere = ajouterSousCritere;
window.modifierSousCritere = modifierSousCritere;
window.supprimerSousCritere = supprimerSousCritere;

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler délégué pour modifierCritereTemp(index, champ, valeur) */
function modifierCritereTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-int') ? parseInt(el.value) : el.value;
    modifierCritereTemp(index, champ, valeur);
}

/** Handler délégué pour modifierCritereTemp + afficherCriteresTemp (type change) */
function modifierTypeCritereTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    modifierCritereTemp(index, 'type', el.value);
    afficherCriteresTemp();
}

/** Handler délégué pour modifierCritereGrille(grilleId, index, champ, valeur) */
function modifierCritereGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-int') ? parseInt(el.value) : el.value;
    modifierCritereGrille(grilleId, index, champ, valeur);
}

/** Handler délégué pour modifierCritereGrille type + refresh */
async function modifierTypeCritereGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    modifierCritereGrille(grilleId, index, 'type', el.value);
    // 🔧 #466/CO-21 (21 août 2026) : obtenirGrilleParId est ASYNC — le renderer
    // recevait une Promise et affichait « Aucun critère défini » (les données
    // étaient sauves, l'écran mentait ; retour au rechargement seulement).
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

/** Handler délégué pour modifierSousCritere(grilleId, critereIndex, scIndex, champ, valeur) */
function modifierSousCritereHandler(el) {
    var grilleId = el.dataset.grilleId;
    var critereIndex = parseInt(el.dataset.critereIndex);
    var scIndex = parseInt(el.dataset.scIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    modifierSousCritere(grilleId, critereIndex, scIndex, champ, valeur);
}

/** Handler délégué pour modifierCritereTemp pondération + mise à jour total */
function modifierPonderationCritereTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    modifierCritereTemp(index, 'ponderation', parseInt(el.value));
    mettreAJourTotalTemp();
}

/** Annuler import grilles */
function fermerModalImportGrilles() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-grilles');
    if (wrapper) wrapper.remove();
    delete window._grillesImportEnAttente;
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportGrilles() {
    window.confirmerImportGrilles(window._grillesImportEnAttente);
    fermerModalImportGrilles();
}

/** Ouvrir le file picker pour import grilles */
function ouvrirFilePickerImportGrilles() {
    var input = document.getElementById('fichier-import-grilles-modal');
    if (input) input.click();
}

window.modifierCritereTempHandler = modifierCritereTempHandler;
window.modifierTypeCritereTempHandler = modifierTypeCritereTempHandler;
window.modifierCritereGrilleHandler = modifierCritereGrilleHandler;
window.modifierTypeCritereGrilleHandler = modifierTypeCritereGrilleHandler;
window.modifierSousCritereHandler = modifierSousCritereHandler;
window.modifierPonderationCritereTempHandler = modifierPonderationCritereTempHandler;
window.fermerModalImportGrilles = fermerModalImportGrilles;
window.confirmerEtFermerImportGrilles = confirmerEtFermerImportGrilles;
window.ouvrirFilePickerImportGrilles = ouvrirFilePickerImportGrilles;

// ================================================================
// API SSOT — Point d'écriture centralisé pour `grillesTemplates`
// Tier 6.4 : Les modules externes doivent passer par cette fonction
// au lieu d'écrire directement dans 'grillesTemplates'.
// ================================================================

/**
 * Importe des grilles depuis une source externe (import, primo, démo).
 * Gère la déduplication par ID et le merge avec les grilles existantes.
 *
 * @param {Array} nouvellesGrilles - Grilles à importer
 * @param {Object} [options] - Options d'import
 * @param {boolean} [options.remplacer=false] - Remplacer les grilles existantes avec le même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre de grilles ajoutées/mises à jour
 */
window.importerGrillesExternes = function(nouvellesGrilles, options) {
    if (!nouvellesGrilles || nouvellesGrilles.length === 0) return 0;
    options = options || {};

    var grilles = db.getSync(cle('grillesTemplates'), []);
    var compteur = 0;

    for (var i = 0; i < nouvellesGrilles.length; i++) {
        var grille = nouvellesGrilles[i];
        var index = grilles.findIndex(function(g) { return g.id === grille.id; });

        if (index >= 0) {
            if (options.remplacer) {
                grilles[index] = grille;
                compteur++;
            }
            // sinon: grille existe déjà, on la saute
        } else {
            grilles.push(grille);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync(cle('grillesTemplates'), grilles);

        if (!options.silencieux) {
            if (typeof chargerListeGrillesTemplates === 'function') chargerListeGrillesTemplates();
            if (typeof afficherToutesLesGrillesCriteres === 'function') afficherToutesLesGrillesCriteres();
            if (typeof afficherListeGrilles === 'function') afficherListeGrilles();
        }
    }

    return compteur;
};

})();
