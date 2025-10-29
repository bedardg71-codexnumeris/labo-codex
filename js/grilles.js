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

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Variables du module 01-config.js:
   - grilleTemplateActuelle : Grille actuellement en édition
   - critereEnEdition : ID du critère en cours d'édition (variable globale locale)
   - echapperHtml() : Fonction de sécurité XSS (si utilisée)
   
   Variables globales locales:
   - window.tempCriteres : Array temporaire pour nouvelle grille
   
   Fonctions du module 14-utilitaires.js (si disponibles):
   - afficherNotificationSucces(message, details)
   - afficherNotificationErreur(message, details)
   
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
function chargerListeGrillesTemplates() {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const select = document.getElementById('selectGrilleTemplate');

    if (!select) return;

    select.innerHTML = '<option value="">-- Nouvelle grille --</option>';
    select.innerHTML += '<option value="new">➕ Créer une nouvelle grille</option>';
    grilles.forEach(grille => {
        select.innerHTML += `<option value="${grille.id}">${grille.nom}</option>`;
    });
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
function chargerGrilleTemplate(grilleId) {
    // Afficher le conteneur d'édition et cacher la vue hiérarchique
    const conteneurEdition = document.getElementById('conteneurEditionGrille');
    const vueHierarchique = document.getElementById('vueGrillesCriteres');
    if (conteneurEdition) conteneurEdition.style.display = 'block';
    if (vueHierarchique) vueHierarchique.style.display = 'none';

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
        if (nomContainer) nomContainer.style.display = 'block';
        if (nomInput) nomInput.value = '';
        if (criteresContainer) criteresContainer.style.display = 'block';
        if (aucuneEvalDiv) aucuneEvalDiv.style.display = 'none';
        if (btnDupliquer) btnDupliquer.style.display = 'none';

        // Initialiser avec un tableau vide
        grilleTemplateActuelle = null;
        window.tempCriteres = window.tempCriteres || [];
        afficherListeCriteres(window.tempCriteres, null);
    } else {
        // Charger la grille existante
        const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
        const grille = grilles.find(g => g.id === selectValue);

        if (grille) {
            // Mettre à jour le select si un ID a été passé en paramètre
            if (grilleId && select) {
                select.value = grilleId;
            }

            grilleTemplateActuelle = grille;
            if (nomContainer) nomContainer.style.display = 'block';
            if (nomInput) nomInput.value = grille.nom;
            if (criteresContainer) criteresContainer.style.display = 'block';
            if (aucuneEvalDiv) aucuneEvalDiv.style.display = 'none';
            if (btnDupliquer) btnDupliquer.style.display = 'inline-block';

            afficherListeCriteres(grille.criteres || [], grille.id);

            // Scroll vers le conteneur d'édition
            if (conteneurEdition) {
                conteneurEdition.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    form.style.display = 'block';
    btnAjouter.style.display = 'none';

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
function sauvegarderCritere() {
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
            critere.id = 'CR' + Date.now();
            grilleTemplateActuelle.criteres.push(critere);
        }

        // Sauvegarder automatiquement la grille
        sauvegarderGrilleTemplate(true);  // true = sauvegarde silencieuse
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
            critere.id = 'CR' + Date.now();
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
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Critère "${nom}" ajouté et grille "${nomGrille}" sauvegardée !`);
    }
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
function sauvegarderEtFermer() {
    sauvegarderCritere();
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

    if (form) form.style.display = 'none';
    if (btnAjouter) btnAjouter.style.display = 'inline-block';
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
function supprimerCritere(id) {
    if (!grilleTemplateActuelle && (!window.tempCriteres || window.tempCriteres.length === 0)) {
        alert('Aucune grille en cours de modification');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
        if (grilleTemplateActuelle) {
            grilleTemplateActuelle.criteres = grilleTemplateActuelle.criteres.filter(c => c.id !== id);
            sauvegarderGrilleTemplate();
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
        container.innerHTML = '<p class="text-muted" style="font-style: italic;">Aucun critère défini pour cette grille.</p>';
        const totalSpan = document.getElementById('totalPonderationCriteres');
        const statutSpan = document.getElementById('statutPonderationCriteres');
        if (totalSpan) totalSpan.textContent = '0%';
        if (statutSpan) statutSpan.textContent = '';
        return;
    }

    container.innerHTML = criteres.map(critere => `
        <div class="item-liste" style="margin-bottom: 8px; padding: 12px 15px;
             border-left: 4px solid var(--bleu-principal);
             display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 2px;">
                    ${critere.nom} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${critere.formule}` : ''}
                </div>
                ${critere.description ? `
                    <details style="margin-top: 4px;">
                        <summary style="cursor: pointer; color: var(--bleu-moyen); font-size: 0.85rem; padding: 4px 0;">
                            Voir la description
                        </summary>
                        <div style="margin-top: 8px; padding: 8px; background: var(--bleu-tres-pale);
                             border-radius: 4px; font-size: 0.85rem; color: #666;">
                            ${critere.description}
                        </div>
                    </details>
                ` : ''}
            </div>
            <div style="white-space: nowrap; margin-left: 15px;">
                <button class="btn btn-modifier" onclick="modifierCritere('${critere.id}')"
                        style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">
                    Modifier
                </button>
                <button class="btn btn-supprimer" onclick="supprimerCritere('${critere.id}')"
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

    if (type === 'algorithmique') {
        champFormule.style.display = 'block';
    } else {
        champFormule.style.display = 'none';
    }
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
function sauvegarderGrilleTemplate(silencieux = false) {
    const nomGrille = document.getElementById('nomGrilleTemplate')?.value?.trim();

    if (!nomGrille) {
        if (!silencieux) {
            alert('Le nom de la grille est obligatoire');
        }
        return;
    }

    let grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');

    if (grilleTemplateActuelle) {
        // Mode édition
        grilleTemplateActuelle.nom = nomGrille;
        grilleTemplateActuelle.dateModification = new Date().toISOString();

        const index = grilles.findIndex(g => g.id === grilleTemplateActuelle.id);
        if (index !== -1) {
            grilles[index] = grilleTemplateActuelle;
        }
    } else {
        // Mode création
        const nouvelleGrille = {
            id: 'GRILLE' + Date.now(),
            nom: nomGrille,
            criteres: window.tempCriteres || [],
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString()
        };
        grilles.push(nouvelleGrille);
        grilleTemplateActuelle = nouvelleGrille;

        // Nettoyer les critères temporaires
        window.tempCriteres = [];
    }

    localStorage.setItem('grillesTemplates', JSON.stringify(grilles));

    // Recharger la liste des grilles
    chargerListeGrillesTemplates();

    // Rafraîchir la nouvelle vue hiérarchique
    afficherToutesLesGrillesCriteres();

    // Sélectionner la grille actuelle
    const select = document.getElementById('selectGrilleTemplate');
    if (select && grilleTemplateActuelle) {
        select.value = grilleTemplateActuelle.id;
    }

    if (!silencieux) {
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`Grille "${nomGrille}" sauvegardée !`);
        }
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
function afficherGrillesCriteres() {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const listeDiv = document.getElementById('listeGrilles');

    if (!listeDiv) return;

    if (grilles.length === 0) {
        listeDiv.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; 
                 text-align: center; color: var(--bleu-leger);">
                <p>Aucune grille de critères disponible</p>
                <small>Créez d'abord une grille de critères pour pouvoir la réutiliser</small>
            </div>
        `;
    } else {
        listeDiv.innerHTML = grilles.map(grille => `
            <div class="item-liste" style="background: var(--bleu-tres-pale); padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <strong style="color: var(--bleu-principal);">${grille.nom}</strong>
                        <small style="color: var(--bleu-leger); margin-left: 10px;">
                            ${new Date(grille.dateCreation).toLocaleDateString()}
                        </small>
                        ${grille.baseSur ? `<br><small style="color: var(--bleu-leger);">(basé sur ${grille.baseSur})</small>` : ''}
                    </div>
                    <div style="white-space: nowrap;">
                        <button class="btn btn-principal" onclick="chargerGrilleEnEdition('${grille.id}')">
                            Charger
                        </button>
                        <button class="btn btn-modifier" onclick="dupliquerGrille('${grille.id}')">
                            Dupliquer
                        </button>
                        <button class="btn btn-supprimer" onclick="supprimerGrille('${grille.id}')">
                            Supprimer
                        </button>
                    </div>
                </div>
                <div style="color: #666; font-size: 0.85rem;">
                    <span style="margin-right: 20px;">${grille.criteres?.length || 0} critères</span>
                    <span>Pondération totale : ${grille.criteres?.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0) || 0}%</span>
                </div>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: var(--bleu-moyen); font-size: 0.9rem;">
                        Voir les critères
                    </summary>
                    <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px;">
                        ${(grille.criteres || []).map(c => `
                            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--bleu-tres-pale);">
                                <strong>${c.nom}</strong> (${c.ponderation}% - ${getTypeCritereLabel(c.type)})
                                ${c.description ? `<br><small style="color: #666;">${c.description}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </details>
            </div>
        `).join('');
    }

    const modal = document.getElementById('modalGrilles');
    if (modal) modal.style.display = 'block';
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
    if (modal) modal.style.display = 'none';
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
function chargerGrilleEnEdition(grilleId) {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grille = grilles.find(g => g.id === grilleId);

    if (grille) {
        const select = document.getElementById('selectGrilleTemplate');
        if (select) select.value = grilleId;
        chargerGrilleTemplate();
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
function supprimerGrille(grilleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette grille ?')) {
        return;
    }

    let grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    grilles = grilles.filter(g => g.id !== grilleId);
    localStorage.setItem('grillesTemplates', JSON.stringify(grilles));

    // Rafraîchir le modal
    afficherGrillesCriteres();

    // Recharger le select
    chargerListeGrillesTemplates();

    // Rafraîchir la nouvelle vue hiérarchique
    afficherToutesLesGrillesCriteres();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Grille supprimée');
    }
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
function dupliquerGrille(grilleId) {
    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    const grilleOriginale = grilles.find(g => g.id === grilleId);

    if (!grilleOriginale) {
        alert('Grille introuvable');
        return;
    }

    // Fermer le modal
    fermerModalGrilles();

    // Demander le nom de la nouvelle grille
    const nouveauNom = prompt('Nom de la nouvelle grille :', grilleOriginale.nom + ' (copie)');

    if (!nouveauNom || nouveauNom.trim() === '') {
        return;
    }

    // Créer la nouvelle grille
    const nouvelleGrille = {
        id: 'GRILLE' + Date.now(),
        nom: nouveauNom.trim(),
        criteres: grilleOriginale.criteres.map(c => ({
            ...c,
            id: 'CR' + Date.now() + Math.random()
        })),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        baseSur: grilleOriginale.nom
    };

    // Sauvegarder
    grilles.push(nouvelleGrille);
    localStorage.setItem('grillesTemplates', JSON.stringify(grilles));

    // Charger la nouvelle grille en édition
    grilleTemplateActuelle = nouvelleGrille;
    chargerListeGrillesTemplates();
    afficherToutesLesGrillesCriteres();
    const select = document.getElementById('selectGrilleTemplate');
    if (select) select.value = nouvelleGrille.id;
    chargerGrilleTemplate();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Grille "${nouvelleGrille.nom}" créée à partir de "${grilleOriginale.nom}" !`);
    }
}

/* ===============================
   📑 FONCTION: DUPLIQUER GRILLE ACTUELLE
   Duplique la grille en cours d'édition
   ⚠️ NE PAS RENOMMER - Référencé dans noms_stables.json
   =============================== */

/**
 * Duplique la grille actuellement en édition
 * 
 * UTILISÉ PAR:
 * - Bouton "Dupliquer cette grille"
 * 
 * FONCTIONNEMENT:
 * Vérifie qu'il y a une grille active puis appelle la logique de duplication
 */
function dupliquerGrilleActuelle() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille à dupliquer');
        return;
    }

    // Demander le nom de la nouvelle grille
    const nouveauNom = prompt('Nom de la nouvelle grille :', grilleTemplateActuelle.nom + ' (copie)');

    if (!nouveauNom || nouveauNom.trim() === '') {
        return;
    }

    // Créer la nouvelle grille avec les mêmes critères
    const nouvelleGrille = {
        id: 'GRILLE' + Date.now(),
        nom: nouveauNom.trim(),
        criteres: grilleTemplateActuelle.criteres.map(c => ({
            ...c,
            id: 'CR' + Date.now() + Math.random()
        })),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        baseSur: grilleTemplateActuelle.nom
    };

    // Sauvegarder la nouvelle grille
    let grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    grilles.push(nouvelleGrille);
    localStorage.setItem('grillesTemplates', JSON.stringify(grilles));

    // Mettre à jour l'interface
    grilleTemplateActuelle = nouvelleGrille;
    chargerListeGrillesTemplates();
    afficherToutesLesGrillesCriteres();
    const select = document.getElementById('selectGrilleTemplate');
    const nomInput = document.getElementById('nomGrilleTemplate');
    if (select) select.value = nouvelleGrille.id;
    if (nomInput) nomInput.value = nouvelleGrille.nom;
    afficherListeCriteres(nouvelleGrille.criteres, nouvelleGrille.id);

    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    if (btnDupliquer) btnDupliquer.style.display = 'inline-block';

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Grille "${nouvelleGrille.nom}" créée à partir de "${grilleTemplateActuelle.baseSur}" !`);
    }
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
function basculerVerrouillageCritere(critereId) {
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
            sauvegarderGrilleTemplate(true);

            // Afficher une notification spécifique au verrouillage
            const statut = criteres[index].verrouille ? 'verrouillé' : 'déverrouillé';
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces(`Critère "${criteres[index].nom}" ${statut}`);
            }
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
        totalSpan.style.color = 'var(--risque-minimal)';
        statutSpan.innerHTML = '<span style="color: var(--risque-minimal);">✓ Pondération complète</span>';
    } else if (total < 100) {
        totalSpan.style.color = 'var(--risque-modere)';
        statutSpan.innerHTML = `<span style="color: var(--risque-modere);">${100 - total}% manquant</span>`;
    } else {
        totalSpan.style.color = 'var(--risque-critique)';
        statutSpan.innerHTML = `<span style="color: var(--risque-critique);">${total - 100}% en trop</span>`;
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
function afficherToutesLesGrillesCriteres() {
    console.log('📋 Appel de afficherToutesLesGrillesCriteres()');
    const container = document.getElementById('vueGrillesCriteres');
    if (!container) {
        console.error('❌ Conteneur vueGrillesCriteres introuvable');
        return;
    }

    const grilles = JSON.parse(localStorage.getItem('grillesTemplates') || '[]');
    console.log('📋 Nombre de grilles trouvées:', grilles.length);

    if (grilles.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p style="color: var(--bleu-leger);">Aucune grille définie</p>
                <small>Créez une grille en utilisant le formulaire ci-dessous</small>
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
                 border-left: 4px solid var(--bleu-principal);
                 display: flex; justify-content: space-between; align-items: center;
                 transition: background 0.2s;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 2px;">
                        ${echapperHtml(critere.nom)} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
                    </div>
                    ${critere.description ? `
                        <details style="margin-top: 4px;">
                            <summary style="cursor: pointer; color: var(--bleu-moyen); font-size: 0.85rem; padding: 4px 0;">
                                Voir la description
                            </summary>
                            <div style="margin-top: 8px; padding: 8px; background: var(--bleu-tres-pale);
                                 border-radius: 4px; font-size: 0.85rem; color: #666;">
                                ${echapperHtml(critere.description)}
                            </div>
                        </details>
                    ` : ''}
                </div>
                <div style="white-space: nowrap; margin-left: 15px;">
                    <button class="btn btn-modifier" onclick="modifierCritere('${critere.id}')"
                            style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">
                        Modifier
                    </button>
                    <button class="btn btn-supprimer" onclick="supprimerCritere('${critere.id}')"
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
            couleur = 'var(--risque-eleve)';
            texteStatut = '⚠️ Incomplet';
        } else if (total > 100) {
            couleur = 'var(--risque-critique)';
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
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 ${echapperHtml(grille.nom)}</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${criteres.length} critère${criteres.length > 1 ? 's' : ''} ·
                        <span style="color: ${total === 100 ? '#4caf50' : total < 100 ? '#ff9800' : '#f44336'};">
                            ${total}%
                        </span>
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${criteres.length > 0 ? `
                        <div style="margin-bottom: 15px;">
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

                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-confirmer" onclick="ajouterCritereAGrille('${grille.id}')">
                            + Ajouter un critère à cette grille
                        </button>
                        <button class="btn btn-modifier" onclick="chargerGrilleTemplate('${grille.id}')">
                            ✏️ Éditer la grille
                        </button>
                        <button class="btn btn-principal" onclick="dupliquerGrille('${grille.id}')">
                            📋 Dupliquer
                        </button>
                        <button class="btn btn-supprimer" onclick="supprimerGrille('${grille.id}')">
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
        formCritere.style.display = 'block';
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

    if (conteneurEdition) conteneurEdition.style.display = 'none';
    if (vueHierarchique) vueHierarchique.style.display = 'block';

    // Réinitialiser le formulaire
    const formCritere = document.getElementById('formAjoutCritere');
    if (formCritere) formCritere.style.display = 'none';

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
function initialiserModuleGrilles() {
    console.log('Initialisation du module Grilles');

    // Charger la liste des grilles
    chargerListeGrillesTemplates();

    // Toujours afficher la vue hiérarchique (indépendamment de la section active)
    afficherToutesLesGrillesCriteres();

    // Pas d'événements globaux à attacher pour l'instant
    // Les événements sont gérés via les attributs onclick dans le HTML

    console.log('✅ Module Grilles initialisé avec nouvelle vue hiérarchique');
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
 * - dupliquerGrilleActuelle()
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
 * - Export/Import de grilles au format JSON
 * - Prévisualisation d'une grille avant utilisation
 */

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
window.sauvegarderNomGrille = sauvegarderNomGrille;
window.afficherGrillesCriteres = afficherGrillesCriteres;
window.fermerModalGrilles = fermerModalGrilles;
window.chargerGrilleEnEdition = chargerGrilleEnEdition;
window.supprimerGrille = supprimerGrille;
window.dupliquerGrille = dupliquerGrille;
window.dupliquerGrilleActuelle = dupliquerGrilleActuelle;
window.basculerVerrouillageCritere = basculerVerrouillageCritere;
window.getTypeCritereLabel = getTypeCritereLabel;
window.calculerTotalPonderationCriteres = calculerTotalPonderationCriteres;
window.enregistrerCommeGrille = enregistrerCommeGrille;
window.initialiserModuleGrilles = initialiserModuleGrilles;