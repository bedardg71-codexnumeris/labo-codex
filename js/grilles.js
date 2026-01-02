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
async function chargerListeGrillesTemplates() {
    const grilles = await db.get('grillesTemplates') || [];
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
async function chargerGrilleTemplate(grilleId) {
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
        const grilles = await db.get('grillesTemplates') || [];
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
async function supprimerCritere(id) {
    if (!grilleTemplateActuelle && (!window.tempCriteres || window.tempCriteres.length === 0)) {
        alert('Aucune grille en cours de modification');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
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
             border-left: 4px solid var(--bleu-principal);
             display: flex; justify-content: space-between; align-items: center;">
            <div class="grille-flex-1">
                <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 2px;">
                    ${critere.nom} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${critere.formule}` : ''}
                </div>
                ${critere.description ? `
                    <details class="grille-mt-4">
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
async function sauvegarderGrilleTemplate(silencieux = false) {
    const nomGrille = document.getElementById('nomGrilleTemplate')?.value?.trim();

    if (!nomGrille) {
        if (!silencieux) {
            alert('Le nom de la grille est obligatoire');
        }
        return;
    }

    let grilles = await db.get('grillesTemplates') || [];

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
            dateModification: new Date().toISOString(),
            dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Nouvelle grille dans bibliothèque par défaut
        };
        grilles.push(nouvelleGrille);
        grilleTemplateActuelle = nouvelleGrille;

        // Nettoyer les critères temporaires
        window.tempCriteres = [];
    }

    await db.set('grillesTemplates', grilles);

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
async function afficherGrillesCriteres() {
    const grilles = await db.get('grillesTemplates') || [];
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
                <div class="grille-flex-between-mb10">
                    <div>
                        <strong style="color: var(--bleu-principal);">${grille.nom}</strong>
                        <small style="color: var(--bleu-leger); margin-left: 10px;">
                            ${new Date(grille.dateCreation).toLocaleDateString()}
                        </small>
                        ${grille.baseSur ? `<br><small class="grille-texte-bleu-leger">(basé sur ${grille.baseSur})</small>` : ''}
                    </div>
                    <div class="grille-nowrap">
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
                    <span class="grille-mr-20">${grille.criteres?.length || 0} critères</span>
                    <span>Pondération totale : ${grille.criteres?.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0) || 0}%</span>
                </div>
                <details class="u-mt-10">
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
async function chargerGrilleEnEdition(grilleId) {
    const grilles = await db.get('grillesTemplates') || [];
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette grille ?')) {
        return;
    }

    let grilles = await db.get('grillesTemplates') || [];
    grilles = grilles.filter(g => g.id !== grilleId);
    await db.set('grillesTemplates', grilles);

    // Rafraîchir le modal
    await afficherGrillesCriteres();

    // Recharger le select
    await chargerListeGrillesTemplates();

    // Rafraîchir la nouvelle vue hiérarchique
    await afficherToutesLesGrillesCriteres();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeGrilles();

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
async function dupliquerGrille(grilleId) {
    const grilles = await db.get('grillesTemplates') || [];
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
    await db.set('grillesTemplates', grilles);

    // Charger la nouvelle grille en édition
    grilleTemplateActuelle = nouvelleGrille;
    await chargerListeGrillesTemplates();
    await afficherToutesLesGrillesCriteres();
    const select = document.getElementById('selectGrilleTemplate');
    if (select) select.value = nouvelleGrille.id;
    await chargerGrilleTemplate();

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
async function dupliquerGrilleActuelle() {
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
        baseSur: grilleTemplateActuelle.nom,
        dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Grille dupliquée dans bibliothèque par défaut
    };

    // Sauvegarder la nouvelle grille
    let grilles = await db.get('grillesTemplates') || [];
    grilles.push(nouvelleGrille);
    await db.set('grillesTemplates', grilles);

    // Mettre à jour l'interface
    grilleTemplateActuelle = nouvelleGrille;
    await chargerListeGrillesTemplates();
    await afficherToutesLesGrillesCriteres();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeGrilles();

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
        statutSpan.innerHTML = '<span class="grille-texte-minimal">✓ Pondération complète</span>';
    } else if (total < 100) {
        totalSpan.style.color = 'var(--risque-modere)';
        statutSpan.innerHTML = `<span class="grille-texte-modere">${100 - total}% manquant</span>`;
    } else {
        totalSpan.style.color = 'var(--risque-critique)';
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
    console.log('📋 Appel de afficherToutesLesGrillesCriteres()');
    const container = document.getElementById('vueGrillesCriteres');
    if (!container) {
        console.error('❌ Conteneur vueGrillesCriteres introuvable');
        return;
    }

    const grilles = await db.get('grillesTemplates') || [];
    console.log('📋 Nombre de grilles trouvées:', grilles.length);

    if (grilles.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 6px; text-align: center;">
                <p class="grille-texte-bleu-leger">Aucune grille définie</p>
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
                <div class="grille-flex-1">
                    <div style="font-weight: 600; color: var(--bleu-principal); margin-bottom: 2px;">
                        ${echapperHtml(critere.nom)} (${critere.ponderation || 0}%) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
                    </div>
                    ${critere.description ? `
                        <details class="grille-mt-4">
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

/**
 * Migration des grilles existantes vers le système de bibliothèque
 * ✅ AJOUT (8 décembre 2025) : Support système bibliothèque avec sidebar
 *
 * Ajoute le flag dansBibliotheque: true à toutes les grilles existantes
 * qui n'ont pas encore ce flag (migration une seule fois)
 */
async function migrerGrillesVersBibliotheque() {
    const grilles = await db.get('grillesTemplates') || [];

    let nbMigrees = 0;
    grilles.forEach(grille => {
        if (grille.dansBibliotheque === undefined) {
            grille.dansBibliotheque = true;
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        await db.set('grillesTemplates', grilles);
        console.log(`✅ Migration bibliothèque: ${nbMigrees} grille(s) ajoutée(s) à la bibliothèque`);
    }
}

async function initialiserModuleGrilles() {
    console.log('Initialisation du module Grilles');

    // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
    await migrerGrillesVersBibliotheque();

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

    console.log('✅ Module Grilles initialisé avec layout sidebar (Beta 80.5)');
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
    const grilles = await db.get('grillesTemplates') || [];

    if (grilles.length === 0) {
        alert('Aucune grille à exporter.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Grilles de critères',
        `${grilles.length} grille(s)`
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { grilles: grilles },
        'grilles',
        'Grilles de critères d\'évaluation',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    const nomFichier = genererNomFichierCC(
        'grilles',
        'Grilles-criteres',
        donnees.metadata.version
    );

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

    console.log('✅ Grilles exportées avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${grilles.length} grille(s) exportée(s) avec succès`);
    }
}

/**
 * Exporte la grille actuellement en cours d'édition
 */
async function exporterGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille sélectionnée à exporter.');
        return;
    }

    const grilles = await db.get('grillesTemplates') || [];
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
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...grille };

    // Si la grille a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (grille.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Vous allez exporter un matériel créé par ' + grille.metadata_cc.auteur_original + '.\n\n' +
            'Entrez votre nom pour être crédité comme contributeur :\n' +
            '(Laissez vide si vous n\'avez fait aucune modification)'
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
    a.download = `grille-${grille.nom.replace(/[^a-z0-9]/gi, '-')}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Grille exportée avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Grille "${grille.nom}" exportée avec succès`);
    }
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
                `Voulez-vous continuer ?`
            );

            if (!confirmation) {
                console.log('Import annulé par l\'utilisateur');
                event.target.value = '';
                return;
            }

            // Récupérer les grilles
            const grilles = await db.get('grillesTemplates') || [];
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
            await db.set('grillesTemplates', grilles);

            // Recharger la grille dans le formulaire
            await chargerGrillePourModif(grilleTemplateActuelle);

            // Rafraîchir la liste
            await afficherGrillesExistantes();

            console.log('✅ Grille importée et remplacée avec succès');
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Grille importée et remplacée avec succès');
            } else {
                alert('Grille importée et remplacée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assurez-vous qu\'il s\'agit d\'un fichier valide.');
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
function importerGrilles(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._grillesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            let message = estCC ?
                '<div style="margin-bottom: 15px;">' + genererBadgeCC(donnees.metadata) + '</div>' :
                '';

            message += '<p><strong>Voulez-vous importer ces grilles ?</strong></p>';

            // Créer modal avec badge CC
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10001; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                        ${message}
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn" onclick="this.closest('div[style*=fixed]').parentElement.remove(); delete window._grillesImportEnAttente;">Annuler</button>
                            <button class="btn btn-confirmer" onclick="window.confirmerImportGrilles(window._grillesImportEnAttente); this.closest('div[style*=fixed]').parentElement.remove(); delete window._grillesImportEnAttente;">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Avertir si pas de licence CC
            if (!estCC) {
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

        // Charger grilles existantes
        const grillesExistantes = await db.get('grillesTemplates') || [];

        // Fusionner (remplacer si même ID, sinon ajouter)
        grillesImportees.forEach(grille => {
            // ✅ AJOUT (8 décembre 2025) : Les grilles importées ne sont pas automatiquement dans la bibliothèque
            // L'utilisateur doit utiliser "Gérer la bibliothèque" pour les ajouter à la barre latérale
            grille.dansBibliotheque = false;

            // Préserver les métadonnées CC dans la grille importée
            if (metadata && metadata.licence) {
                grille.metadata_cc = {
                    auteur_original: metadata.auteur_original,
                    date_creation: metadata.date_creation,
                    licence: metadata.licence,
                    contributeurs: metadata.contributeurs || []
                };
            }

            const index = grillesExistantes.findIndex(g => g.id === grille.id);
            if (index >= 0) {
                grillesExistantes[index] = grille;
            } else {
                grillesExistantes.push(grille);
            }
        });

        // Sauvegarder
        await db.set('grillesTemplates', grillesExistantes);

        // Rafraîchir l'affichage
        if (typeof afficherToutesLesGrillesCriteres === 'function') {
            await afficherToutesLesGrillesCriteres();
        }

        // ✅ AJOUT (8 décembre 2025) : Mention de la bibliothèque dans le message de succès
        alert(`✅ Import réussi !\n\n${grillesImportees.length} grille(s) importée(s).\n\nUtilisez "Consulter la bibliothèque" pour les ajouter à la barre latérale.`);
        console.log('✅ Grilles importées:', grillesImportees.length);

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

// Export/Import avec licence CC
window.exporterGrilles = exporterGrilles;
window.exporterGrilleActive = exporterGrilleActive;
window.importerDansGrilleActive = importerDansGrilleActive;
window.importerGrilles = importerGrilles;
window.enregistrerCommeGrille = enregistrerCommeGrille;
window.initialiserModuleGrilles = initialiserModuleGrilles;

// ✅ AJOUT (8 décembre 2025) : Exports fonctions bibliothèque
window.afficherBibliothequeGrilles = afficherBibliothequeGrilles;
window.retirerGrilleDeBibliotheque = retirerGrilleDeBibliotheque;
window.ajouterGrillesABibliotheque = ajouterGrillesABibliotheque;
window.filtrerGrillesParDiscipline = filtrerGrillesParDiscipline;
window.fermerModalBibliothequeGrilles = fermerModalBibliothequeGrilles;

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes - Stubs minimaux
   =============================== */

async function afficherListeGrilles() {
    const grilles = await db.get('grillesTemplates') || [];
    const container = document.getElementById('sidebarListeGrilles');
    if (!container) return;

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les grilles dans la bibliothèque
    const grillesDansBibliotheque = grilles.filter(g => g.dansBibliotheque !== false);

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div style="margin-bottom: 15px;">
            <button onclick="afficherBibliothequeGrilles()" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (grillesDansBibliotheque.length === 0) {
        html += '<p class="sidebar-vide">Créez une nouvelle grille ou puisez dans la bibliothèque</p>';
        container.innerHTML = html;
        return;
    }

    html += grillesDansBibliotheque.map(grille => {
        const nomGrille = grille.nom || 'Sans titre';
        const nbCriteres = grille.criteres?.length || 0;
        return `
            <div class="sidebar-item" data-id="${grille.id}" onclick="chargerGrillePourModif('${grille.id}')">
                <div class="sidebar-item-titre">${nomGrille}</div>
                <div class="sidebar-item-badge">${nbCriteres} critères</div>
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
async function afficherBibliothequeGrilles() {
    const grilles = await db.get('grillesTemplates') || [];

    // Séparer grilles dans la bibliothèque vs disponibles
    const grillesDansBibliotheque = grilles.filter(g => g.dansBibliotheque !== false);
    const grillesDisponibles = await obtenirToutesLesGrillesBibliotheque();

    // Obtenir les disciplines disponibles
    const disciplines = obtenirDisciplinesDisponiblesGrilles();

    let html = `
        <div id="modalBibliothequeGrilles" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 8px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <!-- Bouton X sticky -->
                <button onclick="fermerModalBibliothequeGrilles()" style="
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">
                    ×
                </button>
                <h2 style="margin-top: 0; color: #2c3e50;">Bibliothèque de grilles de critères</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    Gérez les grilles de critères affichées dans la barre latérale.
                </p>

                <!-- Section 1 : Grilles dans votre sélection -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Grilles dans la barre latérale
                </h3>
                <div style="margin-bottom: 30px;">
                    <div id="listeGrillesDansBibliotheque">
    `;

    if (grillesDansBibliotheque.length === 0) {
        html += '<p style="color: #999; font-style: italic;">Aucune grille dans la barre latérale</p>';
    } else {
        grillesDansBibliotheque.forEach(grille => {
            const nomGrille = grille.nom || 'Sans titre';
            const nbCriteres = grille.criteres?.length || 0;
            const discipline = grille.discipline || '';

            html += `
                <div style="
                    border: 1px solid var(--bleu-clair);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: var(--bleu-tres-pale);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                ${typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(grille) : ''}
                                ${nomGrille}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em;">
                                ${nbCriteres} critère(s)${discipline ? ' • ' + discipline : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button
                                onclick="partagerGrille('${grille.id}')"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Partager avec la communauté">
                                Partager
                            </button>
                            <button
                                onclick="retirerGrilleDeBibliotheque('${grille.id}')"
                                class="btn btn-supprimer btn-tres-compact"
                                title="Retirer de votre sélection">
                                Retirer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `
                    </div>

                    <!-- Bouton "Partager toutes mes grilles" après la Section 1 -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="exporterGrilles()" class="btn btn-secondaire">
                            Partager toutes mes grilles
                        </button>
                    </div>
                </div>

                <!-- Section 2 : Grilles disponibles -->
                <h3 style="color: #3498db; font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Grilles disponibles à ajouter
                </h3>

                <!-- Filtre par discipline -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                        Filtrer par discipline :
                    </label>
                    <select id="filtreDisciplineGrilles"
                            class="controle-form"
                            onchange="filtrerGrillesParDiscipline()"
                            style="max-width: 300px;">
                        <option value="">Toutes les disciplines</option>
    `;

    disciplines.forEach(discipline => {
        html += `<option value="${discipline}">${discipline}</option>`;
    });

    html += `
                        </select>
                    </div>

                    <div id="listeGrillesDisponibles">
    `;

    // Organiser par discipline
    const grillesParDiscipline = {};
    grillesDisponibles.forEach(grille => {
        const disc = grille.discipline || 'Autre';
        if (!grillesParDiscipline[disc]) {
            grillesParDiscipline[disc] = [];
        }
        grillesParDiscipline[disc].push(grille);
    });

    // Afficher par discipline
    Object.keys(grillesParDiscipline).sort().forEach(discipline => {
        html += `<h4 style="margin-top: 20px; margin-bottom: 10px; color: #666;">${discipline}</h4>`;

        grillesParDiscipline[discipline].forEach(grille => {
            const nomGrille = grille.nom || 'Sans titre';
            const nbCriteres = grille.criteres?.length || 0;
            const description = grille.description || '';
            const auteur = grille.auteur || '';

            // Vérifier si déjà dans la bibliothèque
            const dejaPresent = grilles.some(g => g.id === grille.id && g.dansBibliotheque !== false);

            html += `
                <div class="grille-disponible-item" data-discipline="${discipline}" style="
                    padding: 12px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    gap: 12px;
                    ${dejaPresent ? 'opacity: 0.5;' : ''}
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            ${typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(grille) : ''}
                            ${nomGrille}
                        </div>
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">
                            ${nbCriteres} critère(s)${auteur ? ' • ' + auteur : ''}
                        </div>
                        ${description ? `<div style="font-size: 0.85rem; color: #888;">${description}</div>` : ''}
                        ${dejaPresent ? '<div style="font-size: 0.8rem; color: var(--bleu-clair); font-style: italic; margin-top: 4px;">Déjà dans la barre latérale</div>' : ''}
                    </div>
                    ${!dejaPresent ? `
                        <button
                            onclick="ajouterGrilleIndividuelle('${grille.id}')"
                            class="btn btn-confirmer btn-tres-compact"
                            title="Ajouter cette grille à votre sélection">
                            Ajouter à ma sélection
                        </button>
                    ` : ''}
                </div>
            `;
        });
    });

    html += `
                    </div>

                    <!-- Bouton "Ajouter des grilles" après la Section 2 -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="document.getElementById('fichier-import-grilles-modal').click()" class="btn btn-secondaire">
                            Ajouter des grilles
                        </button>
                        <input type="file" id="fichier-import-grilles-modal" accept=".json" style="display: none;" onchange="importerGrilles(event)">
                    </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Ajoute une grille individuelle à la bibliothèque
 * @param {string} id - ID de la grille à ajouter
 */
async function ajouterGrilleIndividuelle(id) {
    try {
        const grilles = await db.get('grillesTemplates') || [];

        // Vérifier si la grille existe déjà
        let grille = grilles.find(g => g.id === id);

        if (!grille) {
            // C'est une grille de la bibliothèque externe, il faut l'importer
            const toutesGrilles = await obtenirToutesLesGrillesBibliotheque();
            const grilleSource = toutesGrilles.find(g => g.id === id);

            if (grilleSource) {
                // Créer une copie avec un nouvel ID local
                grille = { ...grilleSource };
                grille.dansBibliotheque = true;
                grilles.push(grille);
            } else {
                alert('Grille introuvable');
                return;
            }
        } else {
            // Grille existante, simplement la marquer comme dans la bibliothèque
            grille.dansBibliotheque = true;
        }

        // Sauvegarder
        await db.set('grillesTemplates', grilles);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeGrilles();
        await afficherListeGrilles();
        await afficherBibliothequeGrilles();

        alert('Grille ajoutée à votre sélection avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de la grille');
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Partage une grille avec la communauté
 * @param {string} id - ID de la grille à partager
 */
async function partagerGrille(id) {
    try {
        const grilles = await db.get('grillesTemplates') || [];
        const grille = grilles.find(g => g.id === id);

        if (!grille) {
            alert('Grille introuvable');
            return;
        }

        // Demander métadonnées CC enrichies
        const metadata = await demanderMetadonneesEnrichies('grille', grille.nom);
        if (!metadata) {
            return; // Annulé par l'utilisateur
        }

        // Marquer comme partagée (retirer de ma sélection)
        grille.dansBibliotheque = false;

        // Ajouter métadonnées CC
        grille.metadata_cc = metadata;

        // Sauvegarder
        await db.set('grillesTemplates', grilles);

        // Rafraîchir modal et sidebar
        fermerModalBibliothequeGrilles();
        await afficherListeGrilles();
        await afficherBibliothequeGrilles();

        alert('Grille partagée avec succès !\n\nElle est maintenant disponible dans la section "Grilles disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage de la grille');
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Retirer une grille de la bibliothèque (soft delete)
 * @param {string} id - ID de la grille à retirer
 */
async function retirerGrilleDeBibliotheque(id) {
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    // Soft delete : marquer comme non présente dans la bibliothèque
    grille.dansBibliotheque = false;

    await db.set('grillesTemplates', grilles);

    // Rafraîchir les affichages
    await afficherListeGrilles();
    fermerModalBibliothequeGrilles();
    await afficherBibliothequeGrilles();

    console.log(`Grille "${grille.nom}" retirée de la barre latérale`);
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

    const grilles = await db.get('grillesTemplates') || [];
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

    await db.set('grillesTemplates', grilles);

    // Rafraîchir les affichages
    await afficherListeGrilles();
    fermerModalBibliothequeGrilles();

    if (nbAjoutees > 0) {
        alert(`${nbAjoutees} grille(s) ajoutée(s) à la barre latérale`);
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Filtrer les grilles disponibles par discipline
 */
function filtrerGrillesParDiscipline() {
    const select = document.getElementById('filtreDisciplineGrilles');
    const disciplineSelectionnee = select ? select.value : '';

    const items = document.querySelectorAll('.grille-disponible-item');
    const titresDisciplines = document.querySelectorAll('#listeGrillesDisponibles h4');

    if (!disciplineSelectionnee) {
        // Afficher tout
        items.forEach(item => item.style.display = 'flex');
        titresDisciplines.forEach(titre => titre.style.display = 'block');
    } else {
        // Filtrer par discipline
        items.forEach(item => {
            const discipline = item.dataset.discipline;
            item.style.display = discipline === disciplineSelectionnee ? 'flex' : 'none';
        });

        titresDisciplines.forEach(titre => {
            const disciplineTitre = titre.textContent.trim();
            titre.style.display = disciplineTitre === disciplineSelectionnee ? 'block' : 'none';
        });
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeGrilles() {
    const modal = document.getElementById('modalBibliothequeGrilles');
    if (modal) {
        modal.remove();
    }
}

function creerNouvelleGrille() {
    document.getElementById('accueilGrilles').style.display = 'none';
    document.getElementById('conteneurEditionGrille').style.display = 'block';

    // Note: Section optionsImportExportGrilles supprimée (Beta 92)
    // Note: Export/Import se font maintenant via la bibliothèque

    // Cacher les boutons Dupliquer et Supprimer (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const btnSupprimer = document.getElementById('btnSupprimerGrille');
    if (btnDupliquer) btnDupliquer.style.display = 'none';
    if (btnSupprimer) btnSupprimer.style.display = 'none';

    // Réinitialiser grilleTemplateActuelle
    grilleTemplateActuelle = null;

    // Réinitialiser le formulaire
    document.getElementById('nomGrilleTemplate').value = '';
    document.getElementById('listeCriteres').innerHTML = '<p style="color: #999; font-style: italic;">Utilisez les fonctions d\'édition existantes pour ajouter des critères</p>';

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

    console.log('Création nouvelle grille - Interface prête');
}

async function chargerGrillePourModif(id) {
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    document.getElementById('accueilGrilles').style.display = 'none';
    document.getElementById('conteneurEditionGrille').style.display = 'block';

    // Note: Export/Import se font maintenant via la bibliothèque

    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const btnSupprimer = document.getElementById('btnSupprimerGrille');
    if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
    if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

    // Définir la grille actuelle
    grilleTemplateActuelle = id;

    // Remplir le formulaire
    document.getElementById('nomGrilleTemplate').value = grille.nom || '';

    // Afficher les critères
    afficherCriteresGrille(grille);

    // Mettre le highlight
    definirGrilleActive(id);

    console.log('Grille chargée:', grille.nom);
}

function afficherCriteresGrille(grille) {
    const container = document.getElementById('listeCriteres');
    if (!container) return;

    if (!grille.criteres || grille.criteres.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">Aucun critère défini</p>';
        return;
    }

    const html = grille.criteres.map((critere, index) => `
        <div class="item-liste" style="padding: 15px; background: white; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
            <div style="display: grid; grid-template-columns: 2fr 140px 90px 3fr auto; gap: 12px; align-items: end;">
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: #666;">Nom du critère</label>
                    <input type="text"
                           class="controle-form"
                           value="${critere.nom}"
                           onchange="modifierCritereGrille('${grille.id}', ${index}, 'nom', this.value)"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: #666;">Type</label>
                    <select class="controle-form"
                            onchange="modifierCritereGrille('${grille.id}', ${index}, 'type', this.value); afficherCriteresGrille(obtenirGrilleParId('${grille.id}'));">
                        <option value="holistique" ${critere.type === 'holistique' ? 'selected' : ''}>Holistique</option>
                        <option value="analytique" ${critere.type === 'analytique' ? 'selected' : ''}>Analytique</option>
                        <option value="algorithmique" ${critere.type === 'algorithmique' ? 'selected' : ''}>Algorithmique</option>
                    </select>
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: #666;">Pond. (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${critere.ponderation}"
                           min="0"
                           max="100"
                           onchange="modifierCritereGrille('${grille.id}', ${index}, 'ponderation', parseInt(this.value))">
                </div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: #666;">Description</label>
                    <input type="text"
                           class="controle-form"
                           value="${critere.description || ''}"
                           onchange="modifierCritereGrille('${grille.id}', ${index}, 'description', this.value)">
                </div>
                <div style="padding-top: 20px;">
                    <button class="btn btn-supprimer btn-tres-compact"
                            onclick="supprimerCritereGrille('${grille.id}', ${index})"
                            title="Supprimer ce critère">
                        Supprimer
                    </button>
                </div>
            </div>
            ${critere.type === 'algorithmique' ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: #666;">Facteur de normalisation (nombre de mots)</label>
                        <input type="number"
                               class="controle-form"
                               value="${critere.facteurNormalisation || 500}"
                               min="1"
                               placeholder="500"
                               onchange="modifierCritereGrille('${grille.id}', ${index}, 'facteurNormalisation', parseInt(this.value))"
                               title="Nombre de mots de référence pour le calcul (défaut: 500)">
                    </div>
                    <div style="grid-column: span 2;">
                        <p style="font-size: 0.85rem; color: #666; margin: 0; padding-top: 8px;">
                            <strong>Formule:</strong> Note = Pondération − (Erreurs ÷ Mots × ${critere.facteurNormalisation || 500})
                        </p>
                        <p style="font-size: 0.75rem; color: #999; margin: 4px 0 0 0;">
                            Lors de l'évaluation, vous saisirez le nombre d'erreurs et le nombre de mots de la rédaction.
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
                                onclick="initialiserSousCriteresParDefaut('${grille.id}', ${index})">
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
                                           onchange="modifierSousCritere('${grille.id}', ${index}, ${scIndex}, 'code', this.value)">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Nom</label>
                                    <input type="text"
                                           class="controle-form sous-critere-input-standard"
                                           value="${sc.nom || ''}"
                                           placeholder="Ex: Syntaxe, Ponctuation..."
                                           onchange="modifierSousCritere('${grille.id}', ${index}, ${scIndex}, 'nom', this.value)">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Pondération</label>
                                    <input type="number"
                                           class="controle-form sous-critere-input-standard"
                                           value="${sc.ponderation !== undefined ? sc.ponderation : 1.0}"
                                           min="0"
                                           step="0.1"
                                           placeholder="1.0"
                                           onchange="modifierSousCritere('${grille.id}', ${index}, ${scIndex}, 'ponderation', parseFloat(this.value))"
                                           title="Ex: 1.0 pour erreur complète, 0.5 pour demi-point">
                                </div>
                                <button class="btn btn-supprimer btn-tres-compact"
                                        onclick="supprimerSousCritere('${grille.id}', ${index}, ${scIndex})"
                                        title="Supprimer ce sous-critère">
                                    ✕
                                </button>
                            </div>
                            <div class="groupe-form sous-critere-description-groupe">
                                <label class="sous-critere-label-petit">Description / Rétroaction</label>
                                <textarea class="controle-form sous-critere-textarea"
                                          rows="2"
                                          placeholder="Ex: La plupart des erreurs concernent la construction syntaxique..."
                                          onchange="modifierSousCritere('${grille.id}', ${index}, ${scIndex}, 'retroaction', this.value)">${sc.retroaction || ''}</textarea>
                            </div>
                        </div>
                        `).join('')}

                        <!-- Bouton ajouter après la liste -->
                        <button class="btn btn-ajouter btn-tres-compact sous-criteres-btn-ajouter-liste"
                                onclick="ajouterSousCritere('${grille.id}', ${index})">
                            + Ajouter un sous-critère
                        </button>
                    </div>
                    ` : `
                    <p class="sous-criteres-vide-message">
                        Aucun sous-critère défini. Utilisez les sous-critères par défaut ou créez les vôtres.
                    </p>

                    <!-- Bouton ajouter quand liste vide -->
                    <button class="btn btn-ajouter btn-tres-compact sous-criteres-btn-ajouter-vide"
                            onclick="ajouterSousCritere('${grille.id}', ${index})">
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
        <button class="btn btn-principal" onclick="ajouterCritereGrille('${grille.id}')" class="u-mt-10">
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
    const grilles = await db.get('grillesTemplates') || [];
    return grilles.find(g => g.id === grilleId);
}

async function modifierCritereGrille(grilleId, critereIndex, champ, valeur) {
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Mettre à jour le champ
    grille.criteres[critereIndex][champ] = valeur;

    // Sauvegarder dans localStorage
    await db.set('grillesTemplates', grilles);

    // Recalculer et afficher la pondération totale
    if (champ === 'ponderation') {
        calculerEtAfficherTotalPonderation(grille);
    }

    console.log('Critère modifié:', champ, '=', valeur);
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
    const grilles = await db.get('grillesTemplates') || [];
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
    await db.set('grillesTemplates', grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

    console.log('Sous-critères par défaut initialisés pour critère:', critereIndex);
}

/**
 * Ajoute un nouveau sous-critère vide à un critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 */
async function ajouterSousCritere(grilleId, critereIndex) {
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Initialiser le tableau sousCriteres si nécessaire
    if (!grille.criteres[critereIndex].sousCriteres) {
        grille.criteres[critereIndex].sousCriteres = [];
    }

    // Générer un ID unique et un code par défaut
    const nouveauCode = grille.criteres[critereIndex].sousCriteres.length;

    const nouveauSousCritere = {
        id: `sc_${Date.now()}`,
        code: nouveauCode.toString(),
        nom: '',
        ponderation: 1.0,
        retroaction: ''
    };

    grille.criteres[critereIndex].sousCriteres.push(nouveauSousCritere);

    // Sauvegarder dans localStorage
    await db.set('grillesTemplates', grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

    console.log('Nouveau sous-critère ajouté au critère:', critereIndex);
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
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex] ||
        !grille.criteres[critereIndex].sousCriteres ||
        !grille.criteres[critereIndex].sousCriteres[sousCritereIndex]) return;

    // Mettre à jour le champ
    grille.criteres[critereIndex].sousCriteres[sousCritereIndex][champ] = valeur;

    // Sauvegarder dans localStorage
    await db.set('grillesTemplates', grilles);

    console.log('Sous-critère modifié:', champ, '=', valeur);
}

/**
 * Supprime un sous-critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 * @param {number} sousCritereIndex - Index du sous-critère
 */
async function supprimerSousCritere(grilleId, critereIndex, sousCritereIndex) {
    if (!confirm('Supprimer ce sous-critère ?')) return;

    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex] ||
        !grille.criteres[critereIndex].sousCriteres) return;

    // Supprimer le sous-critère
    grille.criteres[critereIndex].sousCriteres.splice(sousCritereIndex, 1);

    // Sauvegarder dans localStorage
    await db.set('grillesTemplates', grilles);

    // Réafficher la grille
    afficherCriteresGrille(grille);

    console.log('Sous-critère supprimé:', sousCritereIndex);
}

/**
 * Ajoute un nouveau critère à une grille
 * @param {string} grilleId - ID de la grille
 */
async function ajouterCritereGrille(grilleId) {
    const grilles = await db.get('grillesTemplates') || [];
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
    await db.set('grillesTemplates', grilles);

    // Réafficher la liste des critères (calculera automatiquement le total)
    afficherCriteresGrille(grille);

    console.log('Nouveau critère ajouté à la grille:', grilleId);
}

/**
 * Supprime un critère d'une grille
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère à supprimer
 */
async function supprimerCritereGrille(grilleId, critereIndex) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce critère ?')) {
        return;
    }

    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return;

    // Supprimer le critère
    grille.criteres.splice(critereIndex, 1);

    // Sauvegarder dans localStorage
    await db.set('grillesTemplates', grilles);

    // Réafficher la liste des critères (calculera automatiquement le total)
    afficherCriteresGrille(grille);

    console.log('Critère supprimé de la grille:', grilleId);
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
    const grilles = await db.get('grillesTemplates') || [];
    const grille = grilles.find(g => g.id === id);

    if (!grille) return;

    const copie = {
        ...grille,
        id: Date.now().toString(),
        nom: grille.nom + ' (copie)',
        verrouille: false
    };

    grilles.push(copie);
    await db.set('grillesTemplates', grilles);

    await afficherListeGrilles();
    await chargerGrillePourModif(copie.id);

    alert('Grille "' + copie.nom + '" dupliquée avec succès');
}

async function supprimerGrilleDepuisSidebar(id) {
    if (!confirm('Supprimer cette grille ?')) return;

    const grilles = await db.get('grillesTemplates') || [];
    const index = grilles.findIndex(g => g.id === id);

    if (index !== -1) {
        grilles.splice(index, 1);
        await db.set('grillesTemplates', grilles);
        await afficherListeGrilles();
        document.getElementById('conteneurEditionGrille').style.display = 'none';
        document.getElementById('optionsImportExportGrilles').style.display = 'none';
        document.getElementById('accueilGrilles').style.display = 'block';
        alert('Grille supprimée');
    }
}

/**
 * Annule l'édition de grille et retourne à l'accueil
 */
function annulerFormGrille() {
    document.getElementById('conteneurEditionGrille').style.display = 'none';
    document.getElementById('optionsImportExportGrilles').style.display = 'none';
    document.getElementById('accueilGrilles').style.display = 'block';

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
function dupliquerGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille en cours d\'édition');
        return;
    }
    dupliquerGrilleDepuisSidebar(grilleTemplateActuelle);
}

/**
 * Supprime la grille actuellement en édition
 */
async function supprimerGrilleActive() {
    if (!grilleTemplateActuelle) {
        alert('Aucune grille en cours d\'édition');
        return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette grille ?')) {
        return;
    }

    const grilles = await db.get('grillesTemplates') || [];
    const index = grilles.findIndex(g => g.id === grilleTemplateActuelle);

    if (index !== -1) {
        grilles.splice(index, 1);
        await db.set('grillesTemplates', grilles);

        // Fermer le formulaire et retourner à l'accueil
        annulerFormGrille();

        // Recharger la liste
        await afficherListeGrilles();

        alert('Grille supprimée avec succès');
    }
}

/**
 * Sauvegarde complète de la grille (nom + critères)
 */
function sauvegarderGrilleComplete() {
    // Sauvegarder le nom si modifié
    sauvegarderNomGrille();

    // Message de confirmation
    alert('Grille sauvegardée avec succès');

    // Recharger la liste pour refléter les changements
    afficherListeGrilles();
}

// Export global
window.afficherListeGrilles = afficherListeGrilles;
window.creerNouvelleGrille = creerNouvelleGrille;
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
        const grilles = await db.get('grillesTemplates') || [];
        const grilleIndex = grilles.findIndex(g => g.id === grilleId);
        if (grilleIndex !== -1) {
            grilles[grilleIndex] = grille;
            await db.set('grillesTemplates', grilles);
        }
    }

    // Créer le modal de configuration
    const modalHtml = `
        <div id="modalCategoriesErreurs" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 8px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="margin-top: 0; color: var(--bleu-principal);">⚙️ Configuration des catégories d'erreurs</h3>
                <p style="color: #666; font-size: 0.9rem;">Personnalisez les catégories d'erreurs (codes 0-10) et leurs rétroactions associées.</p>

                <div id="listeCategoriesErreurs" style="margin-top: 20px;">
                    ${critere.categoriesErreurs.map((cat, idx) => `
                        <div class="categorie-erreur-item" style="margin-bottom: 20px; padding: 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--bleu-moyen);">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <strong style="color: var(--bleu-principal); font-size: 1.1rem;">Code ${cat.code}</strong>
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
                    <button class="btn btn-secondaire" onclick="fermerModalCategoriesErreurs()">Annuler</button>
                    <button class="btn btn-confirmer" onclick="sauvegarderCategoriesErreurs('${grilleId}', ${critereIndex})">Sauvegarder</button>
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
    const grilles = await db.get('grillesTemplates') || [];
    const grilleIndex = grilles.findIndex(g => g.id === grilleId);
    if (grilleIndex !== -1) {
        grilles[grilleIndex] = grille;
        await db.set('grillesTemplates', grilles);
    }

    // Fermer le modal et rafraîchir l'affichage
    fermerModalCategoriesErreurs();
    afficherCriteresGrille(grille);

    alert('Catégories d\'erreurs sauvegardées avec succès !');
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
    const grilles = await db.get('grillesTemplates') || [];
    let nbMigrations = 0;

    grilles.forEach(grille => {
        if (!grille.criteres) return;

        grille.criteres.forEach(critere => {
            // Détecter l'ancienne structure avec categoriesErreurs
            if (critere.categoriesErreurs && critere.categoriesErreurs.length > 0 && !critere.sousCriteres) {
                console.log(`🔄 Migration: Conversion de ${critere.categoriesErreurs.length} catégories en sous-critères pour critère "${critere.nom}"`);

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
        await db.set('grillesTemplates', grilles);
        console.log(`✅ Migration complétée: ${nbMigrations} critères migrés vers le système de sous-critères`);
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