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
        // 🔧 #625 (31 août 2026) — T7.3, décision C. Cette porte d'ENTRÉE en
        // création remet à zéro, comme `creerNouvelleGrille` : elle ne PRÉSERVE
        // plus le résidu (`|| []`), qui était précisément le chemin par lequel
        // des critères fantômes revenaient dans une grille neuve.
        // ⚠ CETTE BRANCHE EST PRÉSUMÉE MORTE au 31 août 2026, par MESURE
        // STATIQUE et SANS exécution du test §4.4 : `#selectGrilleTemplate` est
        // un `<div>` vide du bloc « Conteneurs cachés pour compatibilité »
        // (index.html), aucun `addEventListener` n'existe dans ce fichier, et
        // les quatre appelants de `chargerGrilleTemplate` passent tous l'id
        // d'une grille EXISTANTE. Le JSDoc de la fonction décrit donc une UI
        // disparue. Le retrait du div et de cette branche appartient à
        // S10 / #628 ; cette ligne est là pour que le résidu soit inoffensif
        // AU CAS OÙ la branche serait atteignable par un chemin que la mesure
        // statique n'a pas vu — une inférence statique ne distingue pas
        // « aucun chemin » de « aucun chemin que j'ai su voir ».
        // ⮕ Ce n'est pas une ceinture sur une bretelle : la purge posée dans
        // `retourVueHierarchique` ferme le cas où l'on abandonne puis revient ;
        // celle-ci couvre ce qui reste, c'est-à-dire toute autre entrée par ce
        // chemin avec un tampon encore plein.
        window.tempCriteres = [];
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
        document.getElementById('critereType').value = typeCritereParDefautEnCours();
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
        alert('Donne d\'abord un nom à la grille.');
        const nomInput = document.getElementById('nomGrilleTemplate');
        if (nomInput) nomInput.focus();
        return;
    }

    // Créer l'objet critère
    const critere = {
        nom: nom,
        description: document.getElementById('critereDescription')?.value?.trim() || '',
        ponderation: parseInt(document.getElementById('criterePonderation')?.value) || 0,
        type: document.getElementById('critereType')?.value || typeCritereParDefautEnCours(),
        formule: document.getElementById('critereFormule')?.value?.trim() || '',
        // Lot 4, volet B (4 sept. 2026) : le menu offre aussi « Aucun » (`'aucun'`), EN TÊTE
        // (coup d'œil de Grégoire, retouche a) — ce critère ne nourrit pas la lecture SOLO ;
        // il compte dans la note, le dépistage le saute. Le DÉFAUT reste « multistructurel » :
        // un critère sans étiquette est une fondation, comme le lisent `calculerIPB` et
        // l'export (#542) — l'ordre des options change, pas la valeur choisie.
        // #1117 (19 oct. 2026) : « aucun » quand l'observation SOLO est désactivée.
        niveauSOLO: niveauSOLOCritereNeuf(observationSOLOActive()),
        verrouille: false
    };

    // Si on est en édition de grille existante
    if (grilleTemplateActuelle) {
        if (!critereEnEdition) critere.id = genererIdUnique('CR_');
        const idEnEdition = critereEnEdition;

        // Sauvegarder automatiquement la grille — le critère est posé sur la
        // version EN BASE (#957), pas sur l'objet mémoire.
        await sauvegarderGrilleTemplate(true, (g) => {  // true = sauvegarde silencieuse
            if (!g.criteres) g.criteres = [];
            if (idEnEdition) {
                // Modifier le critère existant
                const index = g.criteres.findIndex(c => c.id === idEnEdition);
                if (index !== -1) g.criteres[index] = { ...g.criteres[index], ...critere };
            } else {
                // Ajouter nouveau critère
                g.criteres.push(critere);
            }
        });
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
    document.getElementById('critereType').value = typeCritereParDefautEnCours();
    document.getElementById('critereFormule').value = '';
    afficherChampFormule();

    critereEnEdition = null;

    // Notification
    notifications.succes(`Critère "${nom}" ajouté et grille "${nomGrille}" enregistrée !`);
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

/**
 * #1007, lot 2b — la ligne qu'on retire porte-t-elle des notes ? (lecture seule,
 * `ligneEmployeeParUneEvaluation`, evaluation-sauvegarde.js)
 */
function _lignePorteDesNotes(ligne) {
    return typeof window.ligneEmployeeParUneEvaluation === 'function' && window.ligneEmployeeParUneEvaluation(ligne);
}

/** #1007, lot 2b — le critère tel qu'il est écrit, lu avant l'attente de la fenêtre. */
function _critereEnBase(grilleId, critereIndex) {
    const g = (db.getSync(cle('grillesTemplates'), []) || []).find(x => x.id === grilleId);
    return (g && g.criteres && g.criteres[critereIndex]) || null;
}

/** #1007, lot 2b — après l'attente, la ligne à cet index est-elle encore celle qu'on a lue ? */
function _memeCritere(c, lu) {
    return !lu || !!(c && (lu.id ? c.id === lu.id : (!c.id && c.nom === lu.nom)));
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

    // #1007, lot 2b : un critère qu'une évaluation emploie porte des notes ; le codex est
    // proposé avant la question. Une grille neuve (`tempCriteres`) ne propose jamais rien.
    const critereLu = grilleTemplateActuelle ? (grilleTemplateActuelle.criteres || []).find(c => c.id === id) : null;
    const porteDesNotes = !!critereLu && _lignePorteDesNotes({ grilleId: grilleTemplateActuelle.id, critere: critereLu });
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('critere'))) return;
    if (confirm('Es-tu sûr de vouloir supprimer ce critère ?')) {
        if (grilleTemplateActuelle) {
            // #957 : retiré de la version en base, pas de l'objet mémoire.
            await sauvegarderGrilleTemplate(false, (g) => {
                g.criteres = (g.criteres || []).filter(c => c.id !== id);
            });
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

    const enPoints = ponderationEnPoints(criteres);
    container.innerHTML = criteres.map(critere => `
        <div class="item-liste" style="margin-bottom: 8px; padding: 12px 15px;
             border-left: 4px solid var(--accent-primaire);
             display: flex; justify-content: space-between; align-items: center;">
            <div class="grille-flex-1">
                <div style="font-weight: 600; color: var(--accent-primaire); margin-bottom: 2px;">
                    ${echapperHtml(critere.nom)} (${texteDePonderationDuCritere(critere, enPoints)}) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
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
 * @param {Function} [appliquer] - #957 : en édition, le changement propre au geste,
 *   appliqué à la version EN BASE de la grille (jamais à `grilleTemplateActuelle`)
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
async function sauvegarderGrilleTemplate(silencieux = false, appliquer = null) {
    let nomGrille = document.getElementById('nomGrilleTemplate')?.value?.trim();

    if (!nomGrille) {
        if (!silencieux) {
            alert('Le nom de la grille est obligatoire');
        } else if (grilleTemplateActuelle && window.temoinEnregistrement) {
            // Lot E1 (D3) : un nom vidé sur une grille existante le dit, par le témoin.
            window.temoinEnregistrement.nonEnregistre('le nom ne peut pas être vide.', 'Modifier la grille', cle('grillesTemplates'));
        }
        return;
    }

    // ⚠ Cette lecture sert à POSER LA QUESTION du doublon, pas de base à
    // l'écriture : `verifierEtGererDoublon` peut attendre l'utilisateur. La
    // collection écrite plus bas est relue DANS la file.
    const grilles = await db.get(cle('grillesTemplates')) || [];
    let ecraserLeDoublon = false;

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    const idActuel = grilleTemplateActuelle?.id || null;
    const isCreation = !grilleTemplateActuelle;
    const isNameChange = grilleTemplateActuelle && grilleTemplateActuelle.nom !== nomGrille;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        // #967 — un homonyme employé est refusé par la question elle-même.
        // ⚠ Issue 3, notée en mesurant #967 : le nom part au `change`, donc au clic dans
        // la liste ; si ce clic ouvre l'homonyme pendant la question, l'écriture plus bas
        // vise la grille ouverte, ne la trouve plus après le retrait par le nom et refuse
        // (« Elle n'appartient pas au trimestre actif ») : rien n'est écrit, rien ne
        // disparaît, mais le motif dit est faux et le nouveau nom n'est pas posé.
        const resultat = await verifierEtGererDoublon('grille', nomGrille, grilles, idActuel, {
            porteursHomonymes: (homonymes) => compterPorteursHomonymesGrille(homonymes)
        });

        if (resultat === null) {
            // Utilisateur a annulé
            return;
        }

        if (resultat && resultat.action === 'renommer') {
            nomGrille = resultat.nouveauNom;
            document.getElementById('nomGrilleTemplate').value = nomGrille;
        }

        if (resultat && resultat.action === 'ecraser') {
            // Le retrait de l'homonyme est REPORTÉ dans la file, avec l'écriture.
            // #967 : seul un homonyme que rien n'emploie arrive ici.
            ecraserLeDoublon = true;
        }
    }


    let horsTrimestreActif = false;

    // Lot E1 (D0 point 2) : par le témoin commun. Un échec y est dit ; ici, on se tait.
    try {
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
    let grillesEnFile = lues || [];

    // L'homonyme n'est retiré qu'ici : entre la question et l'écriture, la
    // collection a pu changer.
    if (ecraserLeDoublon) {
        grillesEnFile = grillesEnFile.filter(g => g.nom !== nomGrille);
    }

    if (grilleTemplateActuelle) {
        // Mode édition
        const index = grillesEnFile.findIndex(g => g.id === grilleTemplateActuelle.id);
        if (index === -1) {
            // 🔧 #466/CO-16 (21 août 2026) : la branche absente produisait un
            // « sauvegardée ! » SANS écriture quand la grille éditée n'est pas
            // dans le namespace du trimestre actif (édition à cheval sur une
            // bascule). Refus bruyant, patron de la sentinelle horaire (29 mai).
            horsTrimestreActif = true;
            return undefined;
        }

        // #957 (26 sept. 2026) — L'ÉCRITURE PART DE LA GRILLE EN BASE, pas de
        // `grilleTemplateActuelle`. Cet objet mémoire n'est pas tenu à jour par
        // les écritures partielles (ajouter un critère, les sous-critères, les
        // catégories, la bibliothèque, d'autres modules : 23 écrivains recensés) ;
        // le réécrire entier effaçait ce qu'elles venaient d'écrire — « + Ajouter
        // un critère » puis « Enregistrer » : 5 → 6 → 5, sous « sauvegardée ! ».
        // Ce que ce formulaire possède (nom, description) est posé sur la version
        // en base ; un geste qui change autre chose passe son changement par
        // `appliquer`, exécuté sur cette même version, dans la file.
        let grille = Object.assign({}, grillesEnFile[index], {
            nom: nomGrille,
            description: document.getElementById('descriptionGrille')?.value?.trim() || '',
            dateModification: new Date().toISOString()
        });
        if (typeof appliquer === 'function') appliquer(grille);

        // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
        if (typeof ajouterContributeurSiNecessaire === 'function') {
            grille = ajouterContributeurSiNecessaire(grille);
        }

        grillesEnFile[index] = grille;
        grilleTemplateActuelle = grille;
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
            // Lot 1 (3 sept. 2026) : le type choisi au menu — seulement s'il l'a été.
            ...(TYPES_GRILLE.includes(window.tempTypeGrille) ? { type: window.tempTypeGrille } : {}),
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
        grillesEnFile.push(nouvelleGrille);
        grilleTemplateActuelle = nouvelleGrille;

        // Nettoyer les critères temporaires
        window.tempCriteres = [];
        window.tempTypeGrille = '';
    }

    return grillesEnFile;
    }, [], { geste: isCreation ? 'Créer la grille' : 'Modifier la grille' });
    } catch (e) {
        return;
    }

    if (horsTrimestreActif) {
        console.warn('[Grilles] Sauvegarde refusée : grille', grilleTemplateActuelle.id, 'absente du trimestre actif', cle('grillesTemplates'));
        notifications.erreur(
            'Impossible d\'enregistrer cette grille',
            'Elle n\'appartient pas au trimestre actif. Bascule sur son trimestre pour la modifier.'
        );
        return;
    }

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

    // Lot E1 (D3) : en modification, le témoin a dit « Enregistré » ; seul le geste
    // de création a son message.
    if (!silencieux && isCreation) {
        notifications.succes(`Grille «\u00a0${nomGrille}\u00a0» créée.`);
    }

    // #483 (11 oct. 2026) — des pondérations qui ne font pas 100 % : le geste explicite
    // (créer, « Sauvegarder la grille ») le CONFIRME, sans bloquer. L'éditeur montrait déjà
    // le total en couleur ; rien ne le disait au moment d'enregistrer. Même somme que
    // `calculerTotalPonderationCriteres`. Les sauvegardes automatiques se taisent.
    // Relecture de Cowork (11 oct.) : « Supprimer un critère » passe aussi ici, non silencieux,
    // AVEC une modification à appliquer ; il ne doit pas confirmer un total (l'ajout et le
    // changement de pondération se taisent). Le geste explicite, lui, n'en apporte aucune :
    // « Sauvegarder la grille » (enregistrerCommeGrille) et sauvegarderGrilleComplete.
    const gesteExplicite = !silencieux && !appliquer;
    const criteresEnregistres = (grilleTemplateActuelle && grilleTemplateActuelle.criteres) || [];
    if (gesteExplicite && criteresEnregistres.length > 0 && !ponderationEnPoints(criteresEnregistres)) {
        const totalPonderation = criteresEnregistres.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0);
        if (totalPonderation !== 100) {
            notifications.warning(`Grille enregistrée : ses critères totalisent ${totalPonderation}\u00a0%, pas 100\u00a0%.`);
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
                    <span>Pondération totale : ${texteDuTotal(grille.criteres, grille.criteres?.reduce((sum, c) => sum + (parseInt(c.ponderation) || 0), 0) || 0)}</span>
                </div>
                <details class="u-mt-10">
                    <summary style="cursor: pointer; color: var(--texte-secondaire); font-size: 0.9rem;">
                        Voir les critères
                    </summary>
                    <div style="margin-top: 10px; padding: 10px; background: var(--surface-conteneur, #162c36); border-radius: 4px;">
                        ${(grille.criteres || []).map(c => `
                            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--bleu-tres-pale);">
                                <strong>${echapperHtml(c.nom)}</strong> (${texteDePonderationDuCritere(c, ponderationEnPoints(grille.criteres))} - ${getTypeCritereLabel(c.type)})
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
/**
 * #967 — tout ce qui nomme une grille, dans des magasins déjà lus. Pure.
 * Même forme que `compterPorteursEchelleDans` (echelles.js) : la phrase de refus
 * les décrit par `decrirePorteursEchelle`. Les cartouches ne nomment pas leur
 * grille par un champ : elles vivent sous `cartouches_<grilleId>` (#624).
 * @param {string} grilleId
 * @param {{evaluations: Array, productions: Array, pratiques: Array, cartouchesParGrille: Object}} magasins
 */
function compterPorteursGrilleDans(grilleId, magasins) {
    const liste = (x) => Array.isArray(x) ? x : (x ? [x] : []);
    const m = magasins || {};
    const nommeLaGrille = (x) => !!x && x.grilleId === grilleId;
    const nb = {
        evaluations: liste(m.evaluations).filter(nommeLaGrille).length,
        productions: liste(m.productions).filter(nommeLaGrille).length,
        pratiques: liste(m.pratiques).filter(p => !!p && p.configuration && p.configuration.grilleId === grilleId).length,
        cartouches: Array.isArray((m.cartouchesParGrille || {})[grilleId]) ? m.cartouchesParGrille[grilleId].length : 0
    };
    nb.total = nb.evaluations + nb.productions + nb.pratiques + nb.cartouches;
    return nb;
}

/**
 * #967 — les porteurs réunis des homonymes qu'« Écraser » retirerait (trimestre actif).
 * Lecture hors file : elle sert à refuser, jamais de base à une écriture.
 */
async function compterPorteursHomonymesGrille(homonymes) {
    const cartouchesParGrille = {};
    for (const h of (homonymes || [])) {
        if (h && h.id) cartouchesParGrille[h.id] = await db.get(cle(`cartouches_${h.id}`));
    }
    const magasins = {
        evaluations: await db.get(cle('evaluationsSauvegardees')) || [],
        productions: await db.get(cle('productions')) || [],
        pratiques: await db.get(cle('pratiquesConfigurables')) || [],
        cartouchesParGrille
    };
    const nb = { evaluations: 0, productions: 0, pratiques: 0, cartouches: 0, total: 0 };
    (homonymes || []).forEach(h => {
        const n = compterPorteursGrilleDans(h.id, magasins);
        Object.keys(nb).forEach(k => { nb[k] += n[k]; });
    });
    return nb;
}

async function supprimerGrille(grilleId) {
    // #624 — PORTE NUE REFERMEE. Ce chemin supprimait sans vérifier AUCUNE
    // dépendance : les cartouches ancrées sous `cartouches_<grilleId>` devenaient
    // introuvables, sans un mot. Il passe désormais par le chemin unique, qui
    // bloque, nomme les cartouches, et offre de les déplacer.
    await supprimerGrilleAvecPorteDeSortie(grilleId, {
        apres: async () => {

            // Rafraîchir le modal, le select, la vue hiérarchique et la barre
            // latérale. La notification est posée par le chemin unique.
            await afficherGrillesCriteres();
            await chargerListeGrillesTemplates();
            await afficherToutesLesGrillesCriteres();
            await afficherListeGrilles();
        }
    });
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
    // ⚠ Lecture hors file : elle sert à proposer un nom de copie. Le `prompt`
    // ci-dessous est la plus longue fenêtre du geste — la collection est relue
    // DANS la file au moment d'écrire.
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
        // Lot 1 (3 sept. 2026) : le type déclaré suit la copie, comme ceux de ses critères.
        ...(TYPES_GRILLE.includes(grilleOriginale.type) ? { type: grilleOriginale.type } : {}),
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
        dansBibliotheque: true  // ✅ AJOUT (Beta 95.2) — la copie doit atterrir dans la bibliothèque
    };

    // Sauvegarder
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const liste = lues || [];
        liste.push(nouvelleGrille);
        return liste;
    }, [], { geste: 'Dupliquer la grille' });

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

    if (grilleTemplateActuelle) {
        // #957 : basculé sur la version EN BASE, pas sur l'objet mémoire.
        // Sauvegarder en mode silencieux pour éviter la notification "Grille sauvegardée"
        let bascule = null;
        await sauvegarderGrilleTemplate(true, (g) => {
            const c = (g.criteres || []).find(x => x.id === critereId);
            if (!c) return;
            c.verrouille = !c.verrouille;
            bascule = c;
        });
        if (!bascule) return;

        // Afficher une notification spécifique au verrouillage
        const statut = bascule.verrouille ? 'verrouillé' : 'déverrouillé';
        notifications.succes(`Critère "${bascule.nom}" ${statut}`);
        afficherListeCriteres(grilleTemplateActuelle.criteres, grilleTemplateActuelle.id);
        return;
    }

    const criteres = window.tempCriteres;
    const index = criteres.findIndex(c => c.id === critereId);
    if (index !== -1) {
        // Basculer directement l'état (pas de checkbox, juste un span cliquable)
        criteres[index].verrouille = !criteres[index].verrouille;
        afficherListeCriteres(criteres, null);
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
/**
 * La dissection, lot 2a, C2 (verdict de Cowork, 18 oct. 2026) : une grille dont TOUS les critères
 * sont analytiques (`grilleEntierementEnPoints`, #941) compte des POINTS ; son total et sa colonne
 * de pondération le disent, sans « % », et ne se mesurent pas à 100. Affichage seulement : aucun
 * calcul ne change. Une grille mixte garde ses « % » (inscrit au BACKLOG).
 */
function ponderationEnPoints(criteres) {
    return typeof window.grilleEntierementEnPoints === 'function' && window.grilleEntierementEnPoints({ criteres: criteres || [] });
}

/** « 30 points », « 1 point » ; ou « 30% », comme avant, hors d'une grille en points. Validé G. 18 oct. */
function texteDePonderation(n, enPoints) {
    return enPoints ? n + (Math.abs(n) >= 2 ? ' points' : ' point') : n + '%';
}

/**
 * La dissection, lot 9 (`CONSIGNE-LOT-2026-10-18-dissection-9-creer-quand-meme.md`) : un critère peut être
 * créé SANS pondération (`null`), à compléter ici. La règle de l'absence est celle de la note
 * (`ponderationAbsente`, evaluation-calcul.js). Textes validés G. 18 oct. 20 h 08.
 */
function critereSansPonderation(c) {
    return typeof window.ponderationAbsente === 'function' && window.ponderationAbsente(c);
}

/** La pondération d'un critère, ou « sans points » / « sans pondération » : jamais « null point » ni « NaN% ». */
function texteDePonderationDuCritere(c, enPoints) {
    if (critereSansPonderation(c)) return enPoints ? 'sans points' : 'sans pondération';
    return texteDePonderation(c.ponderation || 0, enPoints);
}

/** Le total ; en points, suivi du nombre de critères qui n'ont pas encore de points. Le signal part quand tous en ont. */
function texteDuTotal(criteres, total) {
    const enPoints = ponderationEnPoints(criteres);
    const n = enPoints ? (criteres || []).filter(critereSansPonderation).length : 0;
    return texteDePonderation(total, enPoints) + (n ? ' (' + n + (n > 1 ? ' critères sans points)' : ' critère sans points)') : '');
}

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

    if (ponderationEnPoints(criteres)) {
        totalSpan.textContent = texteDuTotal(criteres, total);
        totalSpan.style.color = '';
        statutSpan.textContent = '';
        return;
    }

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
    function genererHtmlCritere(critere, grilleId, enPoints) {
        return `
            <div class="item-liste" style="margin-bottom: 8px; padding: 12px 15px;
                 border-left: 4px solid var(--accent-primaire);
                 display: flex; justify-content: space-between; align-items: center;
                 transition: background 0.2s;">
                <div class="grille-flex-1">
                    <div style="font-weight: 600; color: var(--accent-primaire); margin-bottom: 2px;">
                        ${echapperHtml(critere.nom)} (${texteDePonderationDuCritere(critere, enPoints)}) • ${getTypeCritereLabel(critere.type)}${critere.type === 'algorithmique' && critere.formule ? ` • ${echapperHtml(critere.formule)}` : ''}
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
        const enPoints = ponderationEnPoints(criteres);
        const { total, couleur, texteStatut } = enPoints
            ? Object.assign(calculerTotal(criteres), { couleur: 'inherit', texteStatut: '' })
            : calculerTotal(criteres);

        return `
            <details class="grille-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 ${echapperHtml(grille.nom)}</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${criteres.length} critère${criteres.length > 1 ? 's' : ''} ·
                        <span style="color: ${enPoints ? 'inherit' : total === 100 ? 'var(--vert-succes)' : total < 100 ? 'var(--orange-accent)' : 'var(--rouge-erreur)'};">
                            ${texteDuTotal(criteres, total)}
                        </span>
                    </span>
                </summary>
                <div style="padding: 15px;">
                    ${criteres.length > 0 ? `
                        <div class="u-mb-15">
                            ${criteres.map(c => genererHtmlCritere(c, grille.id, enPoints)).join('')}
                        </div>
                        <div style="padding: 10px; background: var(--bleu-tres-pale); border-radius: 4px; margin-bottom: 15px;">
                            <strong>Pondération totale: <span style="color: ${couleur};">${texteDuTotal(criteres, total)}</span></strong>
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
    // 🔧 #625 (31 août 2026) : le TAMPON DE CRÉATION aussi, pas seulement le
    // pointeur d'édition. Sans cette ligne, les critères saisis dans une grille
    // abandonnée survivaient à l'abandon et repartaient dans la grille suivante
    // (constat S3 de l'audit du 30 août). `annulerFormEchelle` (echelles.js)
    // nettoyait déjà les siens : c'est ce contraste entre les deux éditeurs qui
    // a révélé l'oubli.
    window.tempCriteres = [];

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
    await db.modifier(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];

        let nbMigrees = 0;
        grilles.forEach(grille => {
            if (grille.dansBibliotheque === undefined) {
                grille.dansBibliotheque = true;
                nbMigrees++;
            }
        });

        // Rien à migrer : le mutateur rend `undefined`, aucune écriture.
        if (nbMigrees === 0) return undefined;
        return grilles;
    }, []);
}

/**
 * Assure la présence de la grille générique dans la bibliothèque
 * Facilite la compréhension du système pour les nouveaux utilisateurs
 */
async function assurerGrilleDeDepart() {
    // 🆕 #358 — Garde anti-resemage du global hérité. Au boot (DOMContentLoaded,
    // AVANT db-ready) avec localStorage saturé (#353), `trimestreActif` n'est pas
    // encore réhydraté → obtenirTrimestreId() est vide → cle('grillesTemplates')
    // retombe sur la clé GLOBALE nue (trimestres.js:307). Semer ici recréerait
    // l'exemple dans le global hérité que #358 retire (re-création à chaque boot →
    // vidage G4 impossible). On ne sème QUE lorsque cle() résout vers une copie
    // namespacée ; la navigation vers la section ré-appelle ce module une fois le
    // trimestre actif établi (navigation.js:223).
    if (cle('grillesTemplates') === 'grillesTemplates') return;

    // Vérifier si elle a été supprimée volontairement : ce test ne dépend pas de
    // la collection, il reste ici. La présence, elle, se vérifie DANS la file.
    if (window.estRessourceSupprimee('GRILLE_GENERIQUE')) return;


    const grilleGenerique = {
        id: 'GRILLE_GENERIQUE',
        // §3 du PLAN-2026-09-01 — « générique (exemple) » disait « ceci ILLUSTRE » à
        // qui avait besoin de lire « ceci SERT ». Le nom porte seul le message :
        // mesuré le 1er septembre, la `description` d'une grille n'est affichée
        // dans AUCUNE liste — elle ne sort que sur les PDF de la grille.
        // ⚠ ET CE NOM VOYAGE JUSQU'À L'ÉLÈVE : `travaux-export-pdf.js` l'imprime
        // sous « Évaluation : … ». Un élève lisait donc le mot « exemple » sur son
        // propre document. C'est la première raison de ce changement, avant même
        // le confort du nouvel enseignant.
        nom: 'Grille de départ',
        // La description s'IMPRIME sur les PDF de la grille (`export-pdf.js`) :
        // elle décrit la grille pour ses lecteurs, elle ne porte pas un message de
        // statut adressé au propriétaire. « Modifie ou duplique selon tes besoins »
        // était une consigne d'interface égarée dans un document.
        description: 'Quatre critères pondérés à parts égales : compréhension, application, analyse, synthèse.',
        // #574/#578 (29 août 2026) : plus d'`echelleId` — l'échelle générique n'est plus
        // semée, et une grille dit les CRITÈRES ; l'échelle se choisit là où on s'en sert.
        criteres: [
            { id: 'CR_COMPREHENSION', code: 'comp', nom: 'Compréhension', ponderation: 25, description: 'Capacité à saisir le sens et les enjeux du sujet', type: 'holistique' },
            { id: 'CR_APPLICATION', code: 'appl', nom: 'Application', ponderation: 25, description: 'Capacité à utiliser les connaissances dans un contexte donné', type: 'holistique' },
            { id: 'CR_ANALYSE', code: 'anal', nom: 'Analyse', ponderation: 25, description: 'Capacité à décomposer et examiner les éléments', type: 'holistique' },
            { id: 'CR_SYNTHESE', code: 'synt', nom: 'Synthèse', ponderation: 25, description: 'Capacité à intégrer et reformuler de manière cohérente', type: 'holistique' }
        ],
        verrouille: false,
        dansBibliotheque: true
    };

    await db.modifier(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        // Semer deux fois est le défaut que la file empêche : la présence est
        // vérifiée à l'instant de l'écriture, pas avant.
        if (grilles.some(g => g.id === 'GRILLE_GENERIQUE')) return undefined;
        grilles.push(grilleGenerique);
        return grilles;
    }, []);
}

async function initialiserModuleGrilles() {

    // En trimestre ARCHIVÉ (lecture seule), ne pas auto-migrer ni réinjecter la grille
    // générique : une simple consultation ne doit pas modifier la copie d'archive
    // (a2025_grillesTemplates = golden master). Lot B1 namespacing — 26 juin 2026.
    if (!(window.estTrimestreArchive && window.estTrimestreArchive())) {
        // ✅ AJOUT (8 décembre 2025) : Migration vers système bibliothèque
        await migrerGrillesVersBibliotheque();

        // ✅ AJOUT (3 janvier 2026) : Assurer présence de la grille générique
        await assurerGrilleDeDepart();
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
 * STRUCTURE D'UNE GRILLE — lot 1 (3 septembre 2026) :
 *   type: 'holistique' | 'analytique' | 'algorithmique' — facultatif, DÉFAUT de ses
 *   critères ; absent sur toute grille d'avant ce lot (rien n'y est écrit). Le badge
 *   de composition ne le lit jamais : il dit ce qui EST, pas ce qui est déclaré.
 *   Retouche du 4 sept. : le MENU montre ce que les données portent (« Non précisé »
 *   = champ absent) ; la déduction se dit en clair sous le menu, jamais par une couleur.
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
        // #467 — un nom reçu n'entre pas brut dans la Bibliothèque (import-export.js).
        grillesImportees = grillesImportees.map(g => window.assainirImportJson(g, 'grille'));

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeGrilles
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_GRILLES || 'bibliothequeGrilles';
        // #599 — la fusion passe par la file : la Bibliothèque est
        // relue à l'instant de l'écriture. Hors file, un import et un ajout
        // concurrents s'écrasaient l'un l'autre.
        let nbAjoutees = 0;
        let nbMisesAJour = 0;
        let idsImportes = [];

        const ecritLotF = await db.modifier(CLE_BIBLIOTHEQUE, (lues) => {
            const bibliotheque = lues || [];
            nbAjoutees = 0;
            nbMisesAJour = 0;
            idsImportes = [];
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

                if (grille.id) idsImportes.push(grille.id);

                const indexBiblio = bibliotheque.findIndex(g => g.id === grille.id);
                if (indexBiblio >= 0) {
                    bibliotheque[indexBiblio] = { ...grille, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                    nbMisesAJour++;
                } else {
                    bibliotheque.push({ ...grille, dateAjoutBiblio: new Date().toISOString() });
                    nbAjoutees++;
                }
            });

            return bibliotheque;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_BIBLIOTHEQUE);   // lot F : geste hors témoin (confirmerImportGrilles)

        // Rafraîchir le modal de bibliothèque s'il est ouvert, PUIS conduire l'œil
        // au résultat. Rapport testeur du 8 septembre 2026 : « la bibliothèque
        // n'est pas rafraîchie au moment de l'importation d'une grille ». Elle
        // l'était — la carte arrivait en fin de liste, à 8 548 px sous le bas de
        // la fenêtre, sur une modale que la reconstruction remet en haut.
        // Un rafraîchissement qu'on ne voit pas ne se distingue pas d'une panne.
        // #793 : le geste vit dans `BibliothequeUI.conduireAuxImportes`, pour les cinq familles.
        const ligneMasquee = await BibliothequeUI.conduireAuxImportes(
            'modalBibliothequeGrilles', afficherBibliothequeGrilles, idsImportes, { repliFiltre: true });

        const details = [];
        if (nbAjoutees > 0) details.push(`${nbAjoutees} nouvelle(s) grille(s) ajoutée(s).`);
        if (nbMisesAJour > 0) details.push(`${nbMisesAJour} grille(s) mise(s) à jour.`);
        details.push(ligneMasquee || 'Consulte « Grilles disponibles » pour les ajouter à ta barre latérale.');
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
// 🔧 #625 (31 août 2026) : le TAMPON DE CRÉATION non plus. #466 ne purgeait que le
// pointeur : `grilleTemplateActuelle` devenait nul, `tempCriteres` restait plein, et
// la branche CRÉATION du save (l. ~703, `criteres: window.tempCriteres || []`) était
// donc encore armée. Les critères saisis dans l'ancien trimestre partaient en base
// dans le namespace du NOUVEAU — une écriture inter-trimestre, pas un défaut
// d'affichage. Constat S3 de l'audit du 30 août, angle mort §4.5.
function reinitialiserEditeurGrillesApresBascule() {
    grilleTemplateActuelle = null;
    window.tempCriteres = [];
}
window.reinitialiserEditeurGrillesApresBascule = reinitialiserEditeurGrillesApresBascule;
window.sauvegarderNomGrille = sauvegarderNomGrille;
window.compterPorteursGrilleDans = compterPorteursGrilleDans;
window.compterPorteursHomonymesGrille = compterPorteursHomonymesGrille;
window.afficherGrillesCriteres = afficherGrillesCriteres;
window.fermerModalGrilles = fermerModalGrilles;
window.chargerGrilleEnEdition = chargerGrilleEnEdition;
window.supprimerGrille = supprimerGrille;
window.verifierUtilisationGrille = verifierUtilisationGrille;
window.deplacerCartouchesVersAutreGrille = deplacerCartouchesVersAutreGrille;
window.supprimerGrilleAvecPorteDeSortie = supprimerGrilleAvecPorteDeSortie;
window.dupliquerGrille = dupliquerGrille;
window.basculerVerrouillageCritere = basculerVerrouillageCritere;
window.getTypeCritereLabel = getTypeCritereLabel;
window.calculerTotalPonderationCriteres = calculerTotalPonderationCriteres;

// Export/Import avec licence CC
window.exporterGrilles = exporterGrilles;
window.importerGrilles = importerGrilles;
window.enregistrerCommeGrille = enregistrerCommeGrille;
window.initialiserModuleGrilles = initialiserModuleGrilles;
// Exposée pour la sentinelle #358 (garde anti-resemage du global hérité).
window.assurerGrilleDeDepart = assurerGrilleDeDepart;

// ✅ AJOUT (8 décembre 2025) : Exports fonctions bibliothèque
window.afficherBibliothequeGrilles = afficherBibliothequeGrilles;
window.retirerGrilleDeBibliotheque = retirerGrilleDeBibliotheque;
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
        // Volet C (3 sept. 2026) — le badge dit la COMPOSITION de la grille, déduite
        // des types de ses critères ; les cases « Pratiques compatibles » sont parties.
        const badgeComposition = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgeComposition(grille)
            : '';
        const badgeDepistage = genererBadgeGrilleDepistage(grille);
        return `
            <div class="sidebar-item" data-id="${grille.id}" data-action="ouvrirGrilleDepuisListe" data-param="${grille.id}">
                <div class="sidebar-item-titre">${echapperHtml(nomGrille)}</div>
                <div class="sidebar-item-badges">${badgeComposition}${badgeDepistage} <span class="badge-caracteristique">${nbCriteres} critères</span></div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
    // Lot 3b1 (17 oct.) : l'objet ouvert reste sélectionné quand la liste se redessine — l'initialisation
    // de la sous-section la redessine 100 ms après une ouverture venue d'un autre onglet (« Apporter mon matériel »).
    const edition = document.getElementById('conteneurEditionGrille');
    if (grilleTemplateActuelle && edition && !edition.classList.contains('u-hide')) definirGrilleActive(grilleTemplateActuelle.id);
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
    // légitimement dans la sélection ET dans la Bibliothèque, avec
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
        nom: BibliothequeUI.formaterTitreDemo(echapperHtml(grille.nom || 'Sans titre'), BibliothequeUI.estItemDemo(grille)),
        id: grille.id,
        afficherId: true,
        badgeSource: BibliothequeUI.genererBadgeSource(grille, grillesDansBibliotheque),
        badgesPratiques: typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgeComposition(grille) : '',
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
            nom: BibliothequeUI.formaterTitreDemo(echapperHtml(grille.nom || 'Sans titre'), BibliothequeUI.estItemDemo(grille)),
            libelle: BibliothequeUI.formaterTitre(grille.nom || 'Sans titre'),   // #467 : texte brut, pour le select des dossiers
            id: grille.id,
            afficherId: true,
            badgeSource: BibliothequeUI.genererBadgeSource(grille, grillesDansBibliotheque),
            badgesPratiques: (typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgeComposition(grille) : '') + genererBadgeGrilleDepistage(grille),
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
    // déjà libellées : labelItem lit leur .libelle (texte brut ; le .nom est du HTML
    // échappé depuis #467, et le select l'échapperait une seconde fois).
    BibliothequeUI.repertoires.enregistrer('grilles', {
        rafraichir: afficherBibliothequeGrilles,
        ajouterItem: (id) => ajouterGrilleIndividuelle(id),
        supprimerItem: (id) => supprimerGrilleDeBibliothequePartagee(id),
        labelItem: (c) => c.libelle,
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
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre <button class="btn-aide-contextuelle" data-aide="import-autre-trimestre" aria-label="Aide : importer depuis un autre trimestre" title="Aide : importer depuis un autre trimestre"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImportGrilles" class="controle-form" style="flex: 1; min-width: 200px;">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestresAvecGrilles.map(t => `<option value="${echapperHtml(t.id)}">${echapperHtml(t.nom)} (${t.nombre} grille${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <button data-action="afficherGrillesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les grilles</button>
                    <button data-action="importerToutGrillesTrimestreModal" class="btn btn-principal btn-compact" data-tooltip="import-trimestre-tout-grilles">Tout importer</button>
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
   cartouches, lecteur de cartouches injecté). D-C4 statué le 11 oct. 2026 (#656) :
   l'echelleId d'une cartouche copiée se rattache comme à l'import (rattacherEchelle).
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
    // #656 — l'échelle d'une cartouche se reconnaît telle qu'elle est dans le trimestre source.
    const lireEchelleSource = (id) => (db.getSync(cleSource('echellesTemplates', srcId), []) || [])
        .find(e => e && e.id === id) || null;
    return partageSection.dupliquerGrillePartagee(source, lireCartouchesParCle, lireEchelleSource);
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
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des grilles.');
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
        alert('Import impossible : le trimestre actif est clos (consultation). Active un trimestre courant pour importer des grilles.');
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
        // ⚠ La garde d'identité de #476 doit voir la collection telle qu'elle
        // est AU MOMENT DE L'ÉCRITURE : lue hors file, elle laisserait passer un
        // doublon ajouté entre-temps. Tout le geste entre dans la file, et les
        // deux messages sortent APRÈS — la file ne porte que l'écriture.
        let grille = null;
        let nomEnConflit = null;
        let sourceIntrouvable = false;

        const ecritLotF = await db.modifier(cle('grillesTemplates'), async (lues) => {
            let grilles = lues || [];

            // Vérifier si la grille existe déjà (par ID direct ou par idOriginal pour les imports)
            let trouvee = grilles.find(g => g.id === id);
            if (!trouvee) {
                trouvee = grilles.find(g => g.idOriginal === id);
            }

            if (!trouvee) {
                // C'est une grille de la bibliothèque externe, il faut l'importer
                const toutesGrilles = await obtenirToutesLesGrillesBibliotheque();
                const grilleSource = toutesGrilles.find(g => g.id === id);
                if (!grilleSource) {
                    sourceIntrouvable = true;
                    return undefined;
                }

                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('GRILLE_');
                trouvee = {
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
                const gardeGrille = ajouterAvecGardeIdentite(grilles, trouvee);
                if (!gardeGrille.ajoute) {
                    nomEnConflit = (gardeGrille.conflit && gardeGrille.conflit.nom) || 'Une grille';
                    return undefined;
                }
                grilles = gardeGrille.liste;
            } else {
                // Grille existante ou déjà importée, simplement la marquer comme dans la bibliothèque
                trouvee.dansBibliotheque = true;
            }

            grille = trouvee;
            return grilles;
        }, []);
        if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('grillesTemplates'));   // lot F : geste hors témoin (ajouterGrilleIndividuelle)

        if (nomEnConflit) {
            alert(`« ${nomEnConflit} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`);
            return;
        }
        if (sourceIntrouvable) {
            alert('Grille introuvable');
            return;
        }
        if (!grille) return;

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
    const ecritLotF = await db.modifier(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === id);
        if (!grille) return undefined;

        // Soft delete : marquer comme non présente dans la bibliothèque
        grille.dansBibliotheque = false;
        return grilles;
    }, []);
    if (ecritLotF !== undefined && window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('grillesTemplates'));   // lot F : geste hors témoin (retirerGrilleDeBibliotheque)

    // Rafraîchir les affichages
    await afficherListeGrilles();
    fermerModalBibliothequeGrilles();
    await afficherBibliothequeGrilles();

}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une grille (hard delete)
 * @param {string} id - ID de la grille à supprimer
 */
/**
 * Vérifie si une grille porte des cartouches (dépendance d'ancrage).
 *
 * ⚠ Les cartouches ne vivent pas DANS la grille : elles sont ancrées à part,
 * sous `cartouches_{grilleId}`. Retirer la grille sans toucher à cette clé ne
 * détruit rien — mais plus personne ne peut lire ce qu'elle contient, puisque la
 * barre latérale et la bibliothèque n'énumèrent que les cartouches des grilles
 * PRÉSENTES. C'est le diagnostic du 24 août de Grégoire : « Carte mentale A26 »,
 * « Plan de rédaction A26 » et « Stratégies de lecture A26 » vivantes dans des
 * clés dont la grille avait disparu.
 *
 * ⚠ `Array.isArray` PLUTÔT QUE `|| []`, ET CE N'EST PAS DE LA DÉCORATION. Le
 * `|| []` de l'ancienne garde ne protège que de `null`/`undefined` : sur une
 * valeur BOOLÉENNE, `true || []` rend `true`, `.length` rend `undefined`, et
 * `undefined > 0` est faux — la garde passerait en silence. Or le dépôt porte
 * déjà une clé de ce genre (`migration_cartouches_namespacees_done`, un booléen
 * dans la famille `cartouches_`) qui a fait tomber deux codes différents le
 * 31 août. Ici on lit une clé EXACTE, donc ce piège précis n'est pas atteignable
 * — mais la garde sur le TYPE coûte une ligne et ferme la classe entière.
 *
 * @param {string} grilleId
 * @returns {Promise<{utilisee: boolean, nbCartouches: number, cartouches: Array}>}
 */
async function verifierUtilisationGrille(grilleId) {
    let cartouches = await db.get(cle(`cartouches_${grilleId}`));
    if (!Array.isArray(cartouches)) cartouches = [];

    return {
        utilisee: cartouches.length > 0,
        nbCartouches: cartouches.length,
        cartouches
    };
}

/**
 * Déplace les cartouches d'une grille vers une autre, en REMAPPANT leurs critères.
 *
 * ⚠⚠ POURQUOI CE N'EST PAS LE MÊME GESTE QUE MIGRER UNE ÉVALUATION.
 * Une évaluation ne fait que POINTER son échelle (`ev.echelleId`) : changer le
 * pointeur suffit, et c'est pourquoi `migrerEvaluationsVersNouvelleEchelle` tient
 * en huit lignes. Une cartouche, elle, COPIE les critères de sa grille
 * (`criteres: criteres.map(c => ({id: c.id, nom: c.nom}))`, cartouches.js:465) et
 * indexe TOUS ses commentaires par `critereId_niveauCode`. Déplacée telle quelle,
 * elle reste cohérente avec elle-même mais ne correspond plus à la grille qui
 * l'accueille — on aurait remplacé un orphelinage par un autre, en silence.
 *
 * ⮕ REMÈDE : correspondance par ID PUIS par NOM, le patron que le projet emploie
 * déjà pour reporter les niveaux d'une grille à l'autre (`chargerGrilleSelectionnee`,
 * js/evaluation-chargement.js:705). Les commentaires dont le critère ne trouve
 * AUCUNE correspondance ne sont pas jetés en silence : ils sont RENDUS à l'appelant
 * pour qu'il les nomme. Décision de Grégoire du 31 août 2026.
 *
 * ⚠ Les NIVEAUX ne sont pas remappés, et c'est voulu : ils viennent de l'échelle,
 * pas de la grille. Seule la moitié `critereId` de la clé de commentaire change.
 *
 * @param {string} ancienneGrilleId
 * @param {string} nouvelleGrilleId
 * @returns {Promise<{nbDeplacees: number, orphelins: Array<{cartouche: string, critere: string, nbCommentaires: number}>}>}
 */
async function deplacerCartouchesVersAutreGrille(ancienneGrilleId, nouvelleGrilleId) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const nouvelleGrille = grilles.find(g => g.id === nouvelleGrilleId);
    const criteresCible = (nouvelleGrille && nouvelleGrille.criteres) || [];

    let aDeplacer = await db.get(cle(`cartouches_${ancienneGrilleId}`));
    if (!Array.isArray(aDeplacer)) aDeplacer = [];

    const orphelins = [];
    let sansCritere = 0;

    const remappees = aDeplacer.map(cartouche => {
        const criteresSource = Array.isArray(cartouche.criteres) ? cartouche.criteres : [];

        // Table ancienCritereId -> nouveauCritère, par ID d'abord, par NOM ensuite.
        const correspondance = {};
        criteresSource.forEach(cs => {
            let cible = criteresCible.find(cc => cc.id === cs.id);
            if (!cible && cs.nom) {
                cible = criteresCible.find(cc => cc.nom === cs.nom);
            }
            if (cible) correspondance[cs.id] = cible;
        });

        // Réindexer les commentaires. La clé est `critereId_niveauCode`.
        //
        // ⚠⚠ NE PAS DÉCOUPER LA CLÉ. Un identifiant de critère est produit par
        // `genererIdUnique('CR_')` (grilles.js:351, :371, :1033) : il CONTIENT
        // déjà un souligné. Un `clef.indexOf('_')` ou un `clef.split('_')[0]`
        // rendrait « CR », pas « CR_a1b2c3 » — et le remappage viserait un critère
        // qui n'existe pas, en silence. Première version de ce bloc écrite avec
        // ce défaut, attrapée au pré-vol.
        //
        // ⮕ Remède : on ne LIT pas l'identifiant dans la clé, on le RECONNAÎT.
        // Les identifiants sources sont connus ; on cherche celui qui préfixe la
        // clé, en gardant le PLUS LONG au cas où l'un préfixerait l'autre.
        const commentaires = cartouche.commentaires || {};
        const commentairesRemappes = {};
        const perdusParCritere = {};

        Object.keys(commentaires).forEach(clef => {
            let source = null;
            criteresSource.forEach(cs => {
                if (!cs.id) return;
                if (clef.startsWith(cs.id + '_') && (!source || cs.id.length > source.id.length)) {
                    source = cs;
                }
            });
            // Une clé qu'aucun critère de la cartouche ne revendique n'est pas une
            // perte imputable au déplacement : elle était déjà orpheline AVANT. On la
            // transporte telle quelle plutôt que de la faire disparaître à l'occasion
            // d'un geste qui n'a pas ça pour objet.
            //
            // ⚠ MAIS ELLE NE VOYAGE PAS MUETTE. Elle référence un critère qui n'existe
            // nulle part ; si l'annonce disait « tout est passé » sans la mentionner,
            // l'enseignant lirait un déplacement propre alors qu'il emporte des
            // commentaires que rien ne raccroche. On la compte, et l'appelant la dit.
            if (!source) {
                commentairesRemappes[clef] = commentaires[clef];
                if (commentaires[clef]) sansCritere++;
                return;
            }

            const suffixe = clef.slice(source.id.length);
            const cible = correspondance[source.id];

            if (cible) {
                commentairesRemappes[cible.id + suffixe] = commentaires[clef];
            } else if (commentaires[clef]) {
                // Seuls les commentaires NON VIDES comptent comme une perte : une
                // cellule jamais remplie n'est rien à annoncer.
                perdusParCritere[source.nom || source.id] =
                    (perdusParCritere[source.nom || source.id] || 0) + 1;
            }
        });

        Object.keys(perdusParCritere).forEach(nom => {
            orphelins.push({
                cartouche: cartouche.nom || 'sans nom',
                critere: nom,
                nbCommentaires: perdusParCritere[nom]
            });
        });

        return {
            ...cartouche,
            grilleId: nouvelleGrilleId,
            criteres: criteresSource
                .filter(cs => correspondance[cs.id])
                .map(cs => ({ id: correspondance[cs.id].id, nom: correspondance[cs.id].nom })),
            commentaires: commentairesRemappes
        };
    });

    // ⚠ LES DEUX ÉCRITURES PASSENT PAR LA FILE, et dans cet ordre : on AJOUTE à la
    // destination avant de vider la source. Si la seconde échoue, les cartouches
    // existent en double — récupérable. L'ordre inverse les ferait disparaître.
    // (Motif de #650 : `db.set` après un dialogue écrase ce qui s'est enregistré
    // pendant. Ici les dialogues sont TOUS passés avant d'arriver ici.)
    await modifierEtAnnoncer(cle(`cartouches_${nouvelleGrilleId}`), (lues) => {
        const existantes = Array.isArray(lues) ? lues : [];
        const idsExistants = new Set(existantes.map(c => c.id));
        const ajouts = remappees.filter(c => !idsExistants.has(c.id));
        if (ajouts.length === 0) return undefined;
        return existantes.concat(ajouts);
    }, [], { geste: 'Supprimer la grille' });

    await modifierEtAnnoncer(cle(`cartouches_${ancienneGrilleId}`), (lues) => {
        if (!Array.isArray(lues) || lues.length === 0) return undefined;
        return [];
    }, [], { geste: 'Supprimer la grille' });

    return { nbDeplacees: remappees.length, orphelins, sansCritere };
}

/**
 * LE CHEMIN UNIQUE DE SUPPRESSION D'UNE GRILLE — bloque, NOMME, et offre l'issue.
 *
 * ⚠⚠ POURQUOI UN SEUL CHEMIN. Avant le 31 août 2026, `js/grilles.js` portait
 * QUATRE portes pour le même geste, sous DEUX politiques opposées :
 *   · `supprimerGrille` (:948)              — aucune garde, orphelinage silencieux
 *   · `supprimerGrilleDefinitivement`(:2702)— bloque avec un alert
 *   · `supprimerGrilleDepuisSidebar` (:3876)— bloque (garde ajoutée le 24 août)
 *   · `supprimerGrilleActive` (:3968)       — aucune garde, orphelinage silencieux
 * Trois boutons réels de l'interface menaient aux deux portes nues. Même geste,
 * quatre portes, deux issues — et l'enseignant ne pouvait pas savoir laquelle il
 * actionnait. Ajouter une cinquième copie de la garde aurait été une cinquième
 * chose à faire dériver : elles passent toutes ici.
 *
 * ⚠ #624 : « un blocage sans issue n'est pas une garde ». On bloque, on nomme les
 * référents, et on offre la porte de sortie — comme le fait déjà le chemin des
 * échelles (`supprimerEchelleDepuisSidebar`, js/echelles.js:4309).
 *
 * @param {string} grilleId
 * @param {{apres?: Function, marquerToujours?: boolean}} options
 *        `apres`           — rafraîchissement propre à l'écran appelant.
 *        `marquerToujours` — voir la note sur le tombstone plus bas.
 * @returns {Promise<boolean>} true si la grille a été supprimée.
 */
async function supprimerGrilleAvecPorteDeSortie(grilleId, options = {}) {
    const grilles = await db.get(cle('grillesTemplates')) || [];
    const grille = grilles.find(g => g.id === grilleId);
    if (!grille) return false;

    const nomGrille = grille.nom || 'cette grille';

    // #624 (11 oct. 2026) — UNE GRILLE QUI PORTE DES NOTES NE PART PAS. Ce chemin ne
    // comptait que les cartouches : une grille employée par des évaluations ou des
    // productions, sans cartouche, partait sur un « Supprimer ? » et les laissait sans
    // référence. L'onglet Données bloquait déjà ce cas (`verifierDependancesGrille`,
    // donnees-v2.js) : même règle ici, mêmes mots pour les comptes. Aucune issue n'est
    // offerte : rattacher des évaluations à une autre grille changerait leurs notes.
    // Lecture sous `cle()`, comme la grille elle-même : même trimestre.
    const nbEvaluations = (db.getSync(cle('evaluationsSauvegardees'), []) || []).filter(ev => ev && ev.grilleId === grilleId).length;
    const nbProductions = (db.getSync(cle('productions'), []) || []).filter(p => p && p.grilleId === grilleId).length;
    if (nbEvaluations > 0 || nbProductions > 0) {
        const emplois = [];
        if (nbEvaluations > 0) emplois.push(`Utilisée par ${nbEvaluations} évaluation(s)`);
        if (nbProductions > 0) emplois.push(`Utilisée par ${nbProductions} production(s)`);
        alert(`Impossible de supprimer la grille « ${nomGrille} ».\n\n${emplois.join('\n')}\n\nSans elle, ces notes n'auraient plus de grille.`);
        return false;
    }

    const utilisation = await verifierUtilisationGrille(grilleId);

    if (utilisation.utilisee) {
        const autresGrilles = grilles.filter(g => g.id !== grilleId);
        const noms = utilisation.cartouches.slice(0, 5).map(c => (c && c.nom) || 'sans nom').join(', ');
        const reste = utilisation.nbCartouches > 5
            ? `, et ${utilisation.nbCartouches - 5} autre(s)`
            : '';

        // ⚠ NOMMER LES RÉFÉRENTS : quoi, combien, et où. Un compte seul ne dit pas
        // à l'enseignant ce qu'il s'apprête à perdre.
        let message = `La grille « ${nomGrille} » porte ${utilisation.nbCartouches} cartouche(s) : ${noms}${reste}.\n\n`;

        if (autresGrilles.length === 0) {
            message += 'Impossible de la supprimer : il n\'existe aucune autre grille vers laquelle déplacer ces cartouches.\n\n';
            message += 'Crée d\'abord une autre grille, ou supprime ces cartouches.';
            alert(message);
            return false;
        }

        message += 'Ces cartouches deviendraient introuvables si la grille partait sans elles.\n\n';
        message += 'Veux-tu les déplacer vers une autre grille ?';

        // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
        if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('grille'))) return false;
        if (!confirm(message)) {
            alert('Suppression annulée. Les cartouches sont préservées.');
            return false;
        }

        let liste = 'Sélectionne la grille d\'accueil :\n\n';
        autresGrilles.forEach((g, idx) => {
            liste += `${idx + 1}. ${g.nom} (${(g.criteres || []).length} critère(s))\n`;
        });

        const choix = parseInt(prompt(liste + '\nEntre le numéro de la grille :'), 10);
        if (!choix || choix < 1 || choix > autresGrilles.length) {
            alert('Déplacement annulé. La grille n\'a pas été supprimée.');
            return false;
        }

        const cible = autresGrilles[choix - 1];
        const { nbDeplacees, orphelins, sansCritere } = await deplacerCartouchesVersAutreGrille(grilleId, cible.id);

        // ⚠ DIRE CE QUI N'A PAS SUIVI, PLUTÔT QUE DE LE PERDRE EN SILENCE. Les
        // critères de la cartouche sont mis en correspondance par ID puis par NOM ;
        // ceux qui n'ont aucun équivalent dans la grille d'accueil emportent leurs
        // commentaires. L'enseignant l'apprend ICI, pas en s'en apercevant plus tard.
        if (orphelins.length > 0 || sansCritere > 0) {
            let avis = 'Déplacement effectué, avec une réserve à te signaler.\n\n';

            if (orphelins.length > 0) {
                const detail = orphelins
                    .map(o => `· « ${o.critere} » (cartouche « ${o.cartouche} ») : ${o.nbCommentaires} commentaire(s)`)
                    .join('\n');
                avis += `Ces critères n'existent pas dans « ${cible.nom} », ni par identifiant ni par nom. `;
                avis += `Leurs commentaires n'ont pas pu suivre :\n\n${detail}\n\n`;
            }

            // ⚠ LIGNE DISTINCTE, PAS FONDUE DANS LA PRÉCÉDENTE. Ces commentaires-là
            // ne sont pas perdus par le déplacement : ils référençaient déjà un
            // critère absent de leur propre cartouche. Ils ont suivi, intacts, mais
            // rien ne les raccroche. Les compter avec les vraies pertes ferait un
            // chiffre juste dans une phrase fausse.
            if (sansCritere > 0) {
                avis += `${sansCritere} commentaire(s) ont été transportés sans critère d'origine : `;
                avis += `ils étaient déjà détachés avant ce déplacement, et le restent.`;
            }

            alert(avis);
        }

        const supprimee = await _retirerGrilleDeLaListe(grilleId, options);
        if (supprimee) {
            if (typeof options.apres === 'function') await options.apres();
            notifications.succes(
                `Grille « ${nomGrille} » supprimée`,
                `${nbDeplacees} cartouche(s) déplacée(s) vers « ${cible.nom} ».`
            );
        }
        return supprimee;
    }

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('grille'))) return false;
    if (!confirm(`Supprimer la grille « ${nomGrille} » ?`)) return false;

    const supprimee = await _retirerGrilleDeLaListe(grilleId, options);
    if (supprimee) {
        if (typeof options.apres === 'function') await options.apres();
        notifications.succes(`Grille « ${nomGrille} » supprimée`);
    }
    return supprimee;
}

/**
 * Retrait de la grille de sa collection. ⚠ L'index est recalculé DANS la file :
 * celui d'avant les questions posées à l'enseignant ne vaut plus rien.
 *
 * ⚠ SUR `marquerToujours` — UN BUG LATENT PRÉSERVÉ EXPRÈS, PAS UN OUBLI.
 * `supprimerGrilleActive` appelait `marquerRessourceSupprimee` INCONDITIONNELLEMENT,
 * là où les trois autres chemins ne le font que pour les gabarits codés en dur.
 * Le tombstone ne sert qu'à empêcher les `assurer*()` de réinjecter un gabarit
 * codé en dur : pour tout autre id, il ne fait qu'enfler `ressourcesSupprimees`
 * sans effet. Aligner sans le dire changerait un comportement en silence pendant
 * un lot qui n'a pas ça pour objet ; on préserve, on inscrit, on traite à part.
 */
async function _retirerGrilleDeLaListe(grilleId, options = {}) {
    let supprimee = false;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const liste = lues || [];
        const i = liste.findIndex(g => g.id === grilleId);
        if (i === -1) return undefined;

        if (options.marquerToujours ||
            (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(grilleId))) {
            window.marquerRessourceSupprimee(grilleId);
        }
        liste.splice(i, 1);
        supprimee = true;
        return liste;
    }, [], { geste: 'Supprimer la grille' });
    return supprimee;
}

async function supprimerGrilleDefinitivement(id) {
    // #624 — CE CHEMIN PORTAIT DEJA UNE GARDE, mais un blocage sans issue n'en est
    // pas une : il refusait en citant le nombre de cartouches et laissait
    // l'enseignant sans autre recours que de les supprimer une a une. Il passe
    // desormais par le chemin unique, qui bloque, NOMME les cartouches, et offre de
    // les deplacer vers une autre grille.
    await supprimerGrilleAvecPorteDeSortie(id, {
        apres: async () => {
            // Le store partage n'est pas touche par le chemin unique : il ne connait
            // que la collection locale. On le retire ici, apres la suppression.
            if (typeof retirerGrilleDeLaBibliotheque === 'function') {
                await retirerGrilleDeLaBibliotheque(id);
            }
            fermerModalBibliothequeGrilles();
            await afficherListeGrilles();
            await afficherBibliothequeGrilles();
        }
    });
}

/**
 * Supprimer une grille de la Bibliothèque uniquement (Section 2)
 * @param {string} id - ID de la grille à supprimer
 */
async function supprimerGrilleDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesGrillesBibliotheque === 'function'
        ? await obtenirToutesLesGrillesBibliotheque()
        : [];
    const grille = biblio.find(g => g.id === id);
    if (!grille) return;

    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('grilleBibliotheque'))) return;
    if (!confirm(`Supprimer définitivement «${grille.nom || 'Sans titre'}» de la Bibliothèque ?\n\nCette action est irréversible.`)) return;

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
 * Ajouter toutes les grilles locales à la Bibliothèque
 */
async function ajouterMesGrillesALaBibliotheque() {
    try {
        const grilles = await db.get(cle('grillesTemplates')) || [];

        if (grilles.length === 0) {
            alert('Aucune grille à ajouter.\n\nCréez d\'abord des grilles.');
            return;
        }

        if (!confirm(`Veux-tu ajouter tes ${grilles.length} grille(s) à la Bibliothèque ?\n\nElles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`)) return;

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
        modifierListe: (mutateur) => db.modifier(cle('grillesTemplates'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement — aucune source externe
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

// #327 — filtrerGrillesParDiscipline retiré : le filtre par discipline n'existe
// plus (incohérent avec l'organisation par dossiers). Remplacé par la zone
// « Mes dossiers » + le groupage par dossier dans afficherBibliothequeGrilles.

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeGrilles() {
    BibliothequeUI.fermerModal('modalBibliothequeGrilles');
}

/* ===============================
   LE TYPE DE LA GRILLE — lot 1 (3 septembre 2026)
   =============================== */

/**
 * Le type monte à la grille (consigne du 3 septembre 2026, lot 1). `grille.type`
 * est le DÉFAUT de ses critères ; un critère peut déroger par son propre menu —
 * la politique départementale impose 20 % pour le français, alors que la pratique
 * de Grégoire est ailleurs. « Mixte » n'est pas une valeur : c'est le badge de
 * composition qui le constate, depuis les critères, jamais depuis ce champ.
 *
 * ⚠ Aucune grille d'avant ce lot ne porte `grille.type`, et on n'écrit rien dans
 * ses données : sans type déclaré, un critère neuf est holistique — le
 * comportement d'avant, à l'identique. Tarir n'est pas réparer.
 */
const TYPES_GRILLE = ['holistique', 'analytique', 'algorithmique'];

/** Le type qu'un critère neuf reçoit : celui que la grille déclare, sinon holistique. */
function typeCritereParDefaut(grille) {
    return (grille && TYPES_GRILLE.includes(grille.type)) ? grille.type : 'holistique';
}

/**
 * Lot 4, C.3 (décision de Grégoire, 4 sept. 2026) — UN CRITÈRE ALGORITHMIQUE NEUF NAÎT
 * « SANS PROJECTION ». Le registre ne distingue pas, à la LECTURE, un critère d'avant
 * #668 d'un critère tout neuf (aucun des deux ne porte de champ) : le neuf ÉCRIT donc
 * son choix, à la naissance et au changement de type — la source, jamais le stock. Les
 * critères existants gardent leur modèle. Sans le registre (bancs sans projection),
 * rien n'est écrit.
 * ↻ 21 oct. 2026 (consigne `CONSIGNE-LOT-2026-10-21-critere-algorithmique-etape-0.md`) : au MÊME
 * moment, le critère reçoit la marque des codes (`codesAnnotation.marquerNeuf`) — ses codes seront
 * ses sous-critères, plus les dix du français. Même condition que le gabarit neuf : un critère qui
 * devient algorithmique sans avoir de modèle de projection écrit ; jamais un critère qui en porte un.
 */
function avecProjectionNeuve(critere) {
    const neuf = !!critere && critere.type === 'algorithmique'
        && !(typeof critere.modeleProjection === 'string' && critere.modeleProjection.trim());
    if (typeof window.projectionAlgo !== 'undefined' && typeof window.projectionAlgo.poserDefautNeuf === 'function') {
        window.projectionAlgo.poserDefautNeuf(critere);
    }
    if (neuf && typeof window.codesAnnotation !== 'undefined' && typeof window.codesAnnotation.marquerNeuf === 'function') {
        window.codesAnnotation.marquerNeuf(critere);
    }
    return critere;
}

/**
 * Coup d'œil de Grégoire, 4 sept. 2026 (retouche c) : UN SEUL bouton de suppression dans
 * l'éditeur de grille — la corbeille en coin (`boutonRetirerBloc`, ui-blocs.js), pour les
 * critères, les sous-critères et les paliers. Le geste ne change pas (ce que chaque
 * suppression fait et dit reste #647 et sœurs) ; seul le rendu change. Sans ui-blocs
 * (bancs qui ne le chargent pas), rien n'est rendu.
 */
function retirerBloc(o) {
    return (typeof window.boutonRetirerBloc === 'function') ? window.boutonRetirerBloc(o) : '';
}

/** Les chevrons d'un bloc (`boutonsReordonnerBloc`, ui-blocs.js) — §8 f : les sous-critères aussi. */
function reordonnerBloc(o) {
    return (typeof window.boutonsReordonnerBloc === 'function') ? window.boutonsReordonnerBloc(o) : '';
}

/** Le défaut de l'écran courant : la grille en édition, ou le choix fait pour la grille en création. */
function typeCritereParDefautEnCours() {
    return typeCritereParDefaut(grilleTemplateActuelle || { type: window.tempTypeGrille });
}

/**
 * #1117 (19 oct. 2026) — LA COMPLEXITÉ SOLO SUIT LE RÉGLAGE. Case décochée (« Activer
 * l'observation de la structure des résultats d'apprentissage », `afficherDescriptionsSOLO`),
 * le menu « Complexité SOLO du critère » n'est pas rendu : un menu dont la seule option utile
 * serait « Aucun » ne sert à rien (Grégoire). Même lecture que les autres lecteurs de la
 * préférence (`!== false`) ; sans `obtenirPreference` (bancs), le menu est montré.
 */
function observationSOLOActive() {
    return typeof obtenirPreference !== 'function' || obtenirPreference('afficherDescriptionsSOLO') !== false;
}

/**
 * Le `niveauSOLO` d'un critère créé à la main. Préférence activée : le défaut du lot 4,
 * volet B — « multistructurel », une fondation, comme le lisent `calculerIPB` et l'export.
 * Désactivée : « aucun » (Grégoire, 19 oct., 22 h 05) — le critère compte dans la note, le
 * dépistage le saute. Seul un critère NEUF le reçoit : masquer le menu n'écrit rien.
 * @param {boolean} soloActive
 * @returns {'multistructurel'|'aucun'}
 */
function niveauSOLOCritereNeuf(soloActive) {
    return soloActive ? 'multistructurel' : 'aucun';
}

/**
 * Le menu « Complexité SOLO du critère », pour les deux éditeurs (création, grille
 * existante) — rien du tout quand l'observation SOLO est désactivée (#1117).
 * @param {Object} critere
 * @param {string} attrs - les attributs `data-*` du `<select>` propres à l'éditeur
 */
function menuComplexiteSOLOCritere(critere, attrs) {
    if (!observationSOLOActive()) return '';
    return `
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Complexité SOLO du critère
                        <span class="primo-aide" data-target="grille-niveau-solo"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <select class="controle-form"
                            ${attrs} data-champ="niveauSOLO">
                        <option value="aucun" ${critere.niveauSOLO === 'aucun' ? 'selected' : ''}>Aucun</option>
                        <option value="multistructurel" ${(critere.niveauSOLO || 'multistructurel') === 'multistructurel' ? 'selected' : ''}>Multistructurel</option>
                        <option value="relationnel" ${critere.niveauSOLO === 'relationnel' ? 'selected' : ''}>Relationnel</option>
                        <option value="abstrait_etendu" ${critere.niveauSOLO === 'abstrait_etendu' ? 'selected' : ''}>Abstrait étendu</option>
                    </select>
                </div>`;
}

/**
 * Le type déclaré ; sinon celui de ses critères quand ils n'en ont qu'un ; sinon
 * rien (composition mixte, aucun critère, type inconnu). Lecture seule — ce qui
 * est déduit n'est jamais écrit.
 * ↻ Retouche du 4 sept. 2026 (décision de Grégoire) : ne remplit PLUS le menu —
 * un type déduit y passait pour un type déclaré. Elle nourrit la phrase sous le
 * menu (`phrasePrecisionTypeGrille`), et rien d'autre.
 */
function typeGrilleAffiche(grille) {
    if (!grille) return '';
    if (TYPES_GRILLE.includes(grille.type)) return grille.type;
    const types = new Set((grille.criteres || []).map(c => c && c.type).filter(Boolean));
    if (types.size !== 1) return '';
    const seul = [...types][0];
    return TYPES_GRILLE.includes(seul) ? seul : '';
}

function rendreMenuTypeGrille(valeur) {
    const menu = document.getElementById('typeGrille');
    if (menu) menu.value = TYPES_GRILLE.includes(valeur) ? valeur : '';
}

/**
 * La phrase sous le menu — ce que ses critères disent quand la grille ne déclare
 * rien (retouche du 4 sept. 2026). Texte arrêté par Grégoire, à ne pas reformuler.
 * RIEN quand un type est déclaré, quand les types divergent (le badge MIXTE le dit
 * déjà) ou sans critère. ⛔ Pas de couleur pour porter cette information : l'orange
 * veut déjà dire « avertissement », et « déduit » est l'état normal de toute grille
 * d'avant le lot 1.
 */
const ADJECTIFS_TYPE_GRILLE = { holistique: 'holistiques', analytique: 'analytiques', algorithmique: 'algorithmiques' };
function phrasePrecisionTypeGrille(grille) {
    if (!grille || TYPES_GRILLE.includes(grille.type)) return '';
    const deduit = typeGrilleAffiche(grille);
    return deduit ? 'Tes critères sont tous ' + ADJECTIFS_TYPE_GRILLE[deduit] + '.' : '';
}

function rendrePrecisionTypeGrille(grille) {
    const ligne = document.getElementById('precisionTypeGrille');
    if (ligne) ligne.textContent = phrasePrecisionTypeGrille(grille);
    rendreAvisCriteresSansType(grille);   // #703
}

/**
 * #703 (décision de Grégoire, 19 sept. 2026) — L'ÉDITEUR LE DIT ET PROPOSE.
 *
 * LE FAIT (constat C-1 de l'audit du moteur) : le type DÉCLARÉ à la grille n'est lu ni par
 * le calcul ni par la palette, qui ne connaissent que `critere.type`. Passer une grille en
 * « Analytique » ne touche pas ses critères existants (décision du lot 1) : un critère sans
 * type y reste holistique — 24 points saisis ignorés, mesuré — sans que rien ne le dise.
 * ÉCARTÉ par Grégoire : faire suivre le type d'office, qui changerait en silence la façon
 * de noter des évaluations déjà faites cet automne.
 *
 * ⮕ Sous le menu : le compte des critères sans type, et un bouton qui leur applique le type
 * de la grille. RIEN ne change sans ce geste ; un critère qui a DÉJÀ un type n'est jamais
 * touché. Seulement pour une grille enregistrée (en création, les critères suivent déjà le
 * menu — lot 4, C.3) et pour un type qui change le calcul : sous « Holistique », un critère
 * sans type se calcule déjà en holistique, il n'y a rien à dire.
 *
 * ▣ MESURÉ AVANT D'ÉCRIRE (sentinelle #703) : le geste ne recalcule AUCUNE note enregistrée.
 * `noteFinale` est écrite à l'enregistrement ; la portée relue pour le PDF lit un critère
 * analytique sans points par son niveau, comme avant (lot 2), et un critère algorithmique
 * sans mémoire algorithmique par la valeur de son niveau. La phrase le dit donc, avec le
 * compte des évaluations concernées.
 */
function criteresSansType(grille) {
    return ((grille && Array.isArray(grille.criteres)) ? grille.criteres : [])
        .filter(c => c && !TYPES_GRILLE.includes(c.type));
}

const ADJECTIF_TYPE_CRITERE = { analytique: 'analytique', algorithmique: 'algorithmique' };

/** Les mots de l'avis — du texte, posé par `textContent`. `null` quand il n'y a rien à dire. */
function motsAvisCriteresSansType(grille, nbEvaluations) {
    if (!grille || !grille.id || !ADJECTIF_TYPE_CRITERE[grille.type]) return null;
    const n = criteresSansType(grille).length;
    if (n === 0) return null;
    const un = n === 1;
    let phrase = un
        ? 'Un critère de cette grille n\'a pas de type : il se calcule encore en holistique.'
        : `${n} critères de cette grille n\'ont pas de type : ils se calculent encore en holistique.`;
    if (nbEvaluations > 0) {
        phrase += nbEvaluations === 1
            ? (un ? ' L\'évaluation déjà faite avec ce critère garde sa note.' : ' L\'évaluation déjà faite avec ces critères garde sa note.')
            : ` Les ${nbEvaluations} évaluations déjà faites avec ${un ? 'ce critère' : 'ces critères'} gardent leur note.`;
    }
    return { phrase: phrase, bouton: (un ? 'Le passer en ' : 'Les passer en ') + ADJECTIF_TYPE_CRITERE[grille.type] };
}

/** Combien d'évaluations enregistrées de cette grille portent au moins un de ces critères. */
function _compterEvaluationsDesCriteres(grille, criteres) {
    const ids = new Set(criteres.map(c => c.id));
    return (db.getSync(cle('evaluationsSauvegardees'), []) || []).filter(e => e && e.grilleId === grille.id
        && Array.isArray(e.criteres) && e.criteres.some(c => c && ids.has(c.critereId))).length;
}

function rendreAvisCriteresSansType(grille) {
    const avis = document.getElementById('avisTypeCriteresGrille');
    if (!avis) return;
    const sansType = criteresSansType(grille);
    const mots = motsAvisCriteresSansType(grille, sansType.length ? _compterEvaluationsDesCriteres(grille, sansType) : 0);
    avis.classList.toggle('u-hide', !mots);
    // Des constantes et un compte — aucun nom de critère ; échappés quand même (règle 1).
    avis.innerHTML = mots
        ? `<span>${echapperHtml(mots.phrase)}</span><br>`
            + `<button type="button" class="btn btn-secondaire u-mt-5" data-action="appliquerTypeGrilleAuxCriteresSansType">${echapperHtml(mots.bouton)}</button>`
        : '';
}

/** #703 — LE GESTE : le type de la grille va aux critères SANS type, et à eux seuls. */
async function appliquerTypeGrilleAuxCriteresSansType() {
    const grille = grilleTemplateActuelle;
    if (!grille || !ADJECTIF_TYPE_CRITERE[grille.type]) return;
    if (criteresSansType(grille).length === 0) return;
    // #957 : appliqué à la version EN BASE, pas à l'objet mémoire.
    await sauvegarderGrilleTemplate(true, (g) => {
        if (!ADJECTIF_TYPE_CRITERE[g.type]) return;
        criteresSansType(g).forEach(c => {
            c.type = g.type;
            if (c.type === 'algorithmique') avecProjectionNeuve(c);   // lot 4, C.3 — comme un critère qui change de type
        });
    });
    afficherCriteresGrille(grilleTemplateActuelle);
}

async function creerNouvelleGrille() {
    // Lot E1 (D3) : une grille en cours de création ne se perd pas sans question.
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('grille'))) return;
    document.getElementById('accueilGrilles').classList.add('u-hide');
    document.getElementById('conteneurEditionGrille').classList.remove('u-hide');

    // Note: Section optionsImportExportGrilles supprimée (Beta 92)
    // Note: Export/Import se font maintenant via la bibliothèque

    // Cacher les boutons Dupliquer et Supprimer (mode création)
    const btnDupliquer = document.getElementById('btnDupliquerGrille');
    const btnSupprimer = document.getElementById('btnSupprimerGrille');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');
    rendreModeFicheGrille(true);

    // #1042 — un exemple ouvert juste avant a verrouillé ce formulaire : le rouvrir d'abord.
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.quitterModeLectureSeuleDemo) BibliothequeUI.quitterModeLectureSeuleDemo(document.getElementById('conteneurEditionGrille'));
    // Réinitialiser grilleTemplateActuelle
    grilleTemplateActuelle = null;

    // Réinitialiser le formulaire
    document.getElementById('nomGrilleTemplate').value = '';
    document.getElementById('descriptionGrille').value = '';
    // Lot 1 (3 sept. 2026) : le type de la grille en création attend son choix ;
    // sans lui, un critère neuf est holistique, comme avant.
    window.tempTypeGrille = '';
    rendreMenuTypeGrille('');

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesGrille');
    if (panneauMeta) panneauMeta.innerHTML = '';

    // Initialiser tempCriteres avec un premier critère vide
    window.tempCriteres = [avecProjectionNeuve({
        id: genererIdUnique('TEMP_CR_'),
        nom: '',
        type: typeCritereParDefautEnCours(),
        ponderation: 0,
        description: ''
    })];

    // Afficher le premier critère avec placeholders
    afficherCriteresTemp();

    // Réinitialiser le total de pondération
    const totalElement = document.getElementById('totalPonderationAffichage');
    if (totalElement) {
        totalElement.textContent = texteDePonderation(0, ponderationEnPoints(window.tempCriteres));
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
    rendrePrecisionTypeGrille({ type: window.tempTypeGrille, criteres: window.tempCriteres });
    const container = document.getElementById('listeCriteres');
    if (!container) return;
    capturerPlisGabaritAlgo(container);

    if (!window.tempCriteres || window.tempCriteres.length === 0) {
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun critère défini</p>';
        return;
    }

    const html = window.tempCriteres.map((critere, index) => `
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--bordure-claire); border-radius: 6px; margin-bottom: 10px;">
            <div class="bloc-coin-outils">
                ${window.boutonsReordonnerBloc({
                    actionHaut: 'deplacerCritereTempHaut', actionBas: 'deplacerCritereTempBas',
                    param: index, premier: index === 0, dernier: index === window.tempCriteres.length - 1,
                    quoi: 'ce critère'
                })}
                ${window.boutonRetirerBloc({
                    action: 'supprimerCritereTemp',
                    param: index,
                    titre: 'Supprimer ce critère'
                })}
            </div>
            <div class="critere-rangee" style="display: grid; grid-template-columns: 2fr 140px 90px 150px 3fr; gap: 12px; align-items: end;">
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Nom du critère <span class="champ-requis u-texte-medium" title="Champ obligatoire">*</span></label>
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
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">${ponderationEnPoints(window.tempCriteres) ? 'Points' : 'Pond. (%)'}</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(critere.ponderation)}"
                           min="0"
                           max="100"
                           data-on-change="modifierPonderationCritereTempHandler" data-critere-index="${index}">
                </div>
                ${menuComplexiteSOLOCritere(critere, `data-on-change="modifierCritereTempHandler" data-critere-index="${index}"`)}
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Description</label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(critere.description || '')}"
                           placeholder="Ex: Qualité de la langue, structure du texte..."
                           data-on-change="modifierCritereTempHandler" data-critere-index="${index}" data-champ="description">
                </div>
            </div>
            ${rendreCartesGabaritAlgo(critere, { mode: "temp", index: index })}${rendreAttenduCritere(critere, { grilleId: 'temp', index: index })}
        </div>
    `).join('');

    // Ajouter le bouton pour ajouter un critère (pleine largeur comme échelles)
    container.innerHTML = html + `
        <button class="sidebar-btn-ajouter" data-action="ajouterCritereTemp">
            + Ajouter un critère
        </button>
    `;
    ajusterHauteursAuto(container);
    monterVuesBadges(container);
}

/**
 * Le texte troué, étape 3 (5 sept. 2026) — après chaque rendu du gabarit, la VUE qui
 * montre les badges dans la phrase se pose par-dessus chaque zone à badges (les deux
 * zones de chaque palier, les énoncés). Le `<textarea>` reste la valeur et le porteur
 * des handlers ; sans composeur disponible, rien ne se passe et l'écran est celui
 * d'avant. Voir `js/composeur-badges.js`.
 */
function monterVuesBadges(container) {
    if (typeof window.composeurBadges === 'undefined' || typeof window.composeurBadges.monterTout !== 'function') return 0;
    return window.composeurBadges.monterTout(container);
}

/**
 * Modifie un critère temporaire
 */
/**
 * #667 — LE BLOC « FORMULE » DU GABARIT, POUR LES DEUX ÉCRANS DE GRILLE.
 *
 * Il était écrit deux fois (critère temporaire et critère enregistré), avec
 * dans chacun le texte de la formule TAPÉ À LA MAIN — donc libre de mentir sur
 * le calcul réellement appliqué. Un seul rendu, engendré par le registre.
 *
 * @param {object} critere - le critère de grille
 * @param {object} ctx - {mode: 'temp'|'grille', index, grilleId}
 * @returns {string} HTML du bloc, ou '' si le critère n'est pas algorithmique
 */
function rendreBlocFormuleAlgo(critere, ctx) {
    if (!critere || critere.type !== 'algorithmique') return '';
    if (typeof window.formulesAlgo === 'undefined') return '';

    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t)) : '');
    const f = window.formulesAlgo.normaliser(critere);
    const modeles = window.formulesAlgo.listerModeles();

    const estTemp = ctx.mode === 'temp';
    const handlerModele = estTemp ? 'modifierModeleFormuleTempHandler' : 'modifierModeleFormuleGrilleHandler';
    const handlerParam = estTemp ? 'modifierParamFormuleTempHandler' : 'modifierParamFormuleGrilleHandler';
    const datasCommunes = estTemp
        ? `data-critere-index="${ctx.index}"`
        : `data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}"`;

    const options = modeles.map(m =>
        `<option value="${esc(m.id)}"${m.id === f.modeleId ? ' selected' : ''}>${esc(m.nom)}</option>`
    ).join('');

    const champsParams = f.modele.parametres.map(p => `
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: var(--gris-moyen);">${esc(p.libelle)}</label>
                        <input type="number"
                               class="controle-form"
                               value="${esc(f.params[p.cle])}"
                               min="${esc(p.min)}"
                               max="${esc(p.max)}"
                               data-on-change="${handlerParam}" ${datasCommunes} data-param-cle="${esc(p.cle)}"
                               title="${esc(p.aide)}">
                    </div>`).join('');

    // ⚠ Le texte de la formule N'EST PAS écrit ici : il sort du registre, de la
    // même source que le calcul. C'est tout l'objet de #667.
    //
    // Lot 4 (4 sept. 2026) : le bloc se dessine SANS cadre — c'est la carte
    // « Formule » de `rendreCartesGabaritAlgo` qui le porte, sur les deux écrans.
    return `
            <div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Modèle de formule</label>
                    <select class="controle-form"
                            data-on-change="${handlerModele}" ${datasCommunes}>
                        ${options}
                    </select>
                    <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">${esc(f.modele.description)}</small>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
                    ${champsParams}
                </div>
                <p style="font-size: 0.85rem; color: var(--gris-moyen); margin: 10px 0 0 0;">
                    <strong>Formule appliquée :</strong> ${esc(window.formulesAlgo.libelleSymbolique(critere))}
                </p>
                <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">
                    ${f.modele.utiliseMots
                        ? 'Lors de l\'évaluation, tu saisiras le nombre d\'erreurs et le nombre de mots de la rédaction.'
                        : 'Lors de l\'évaluation, seul le nombre d\'erreurs entre dans la note. Le nombre de mots reste saisi pour la rétroaction.'}
                </small>${f.herite && critere.modeleFormule ? `
                <small style="font-size: 0.78rem; color: var(--orange-accent); display: block; margin-top: 4px;">
                    Le modèle « ${esc(critere.modeleFormule)} » enregistré dans cette grille est inconnu de cette version. Le modèle historique est appliqué en attendant.
                </small>` : ''}
            </div>`;
}

/**
 * #668 — Le bloc PROJECTION du gabarit, sous le même patron que la formule.
 *
 * Deux normes cohabitent sur le même critère, et l'écran doit les tenir
 * distinctes : la formule dit combien de points l'élève perd (norme du COURS,
 * 600 mots en 601-101) ; la projection dit où il se situe face à l'épreuve
 * uniforme (norme FIXE, 900 mots). Le bloc est donc voisin, jamais fondu dans
 * celui de la formule.
 *
 * Rien n'est écrit ici : les textes viennent du registre, comme la formule
 * depuis #667. Zéro handler inline, `esc()` sur tout — les textes de paliers
 * sont saisis par l'enseignant·e.
 */
/**
 * #581 — Le bloc ÉNONCÉS du gabarit, sous le même patron que la formule (#667)
 * et la projection (#668).
 *
 * Ce que ce bloc règle : les PHRASES qu'un critère algorithmique engendre.
 * Elles étaient écrites dans le moteur et nommaient la discipline de leur
 * auteur — « Ta rédaction contient N erreurs de français » sortait pour un
 * critère qui compte des erreurs de calcul, et le PDF remis à l'élève
 * rebaptisait son critère « Français écrit ».
 *
 * ⚠ CES TEXTES SONT LUS PAR DES ÉLÈVES. Chaque zone porte le texte du modèle
 * choisi ; la vider fait TAIRE l'énoncé, elle ne le remet pas au défaut —
 * c'est `normaliser` qui tranche, et la distinction (`''` = choix,
 * `undefined` = absence) est ce qui rend le silence possible.
 *
 * Zéro handler inline, `esc()` sur tout : les textes sont saisis par
 * l'enseignant·e et relus par l'élève.
 */
/**
 * Les boutons d'une palette de repères — le texte troué, étapes 1 (les quatre
 * énoncés) et 2 (les deux zones de chaque palier de projection). Un bouton par
 * repère ; le badge montre le mot SANS accolades (« retire les accolades » —
 * Grégoire, essai iPad du 3 sept.), ce qu'il pose les garde (`data-jeton`,
 * le format que les deux registres lisent). Même `data-action` pour les deux
 * usages : c'est `insererRepereEnonce` qui reconnaît sa zone.
 *
 * @param {Array} reperes - `enoncesAlgo.reperesDeCle(cle)` ou `projectionAlgo.listerReperes()`
 * @param {string} cible - la fin de l'étiquette lue par un lecteur d'écran (« dans le palier 2 »)
 */
function rendreBoutonsReperes(reperes, cible) {
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    return (reperes || []).map(r => `
                            <button type="button" class="repere-enonce repere-enonce--${esc(r.famille)}"
                                    data-action="insererRepereEnonce" data-jeton="${esc(r.jeton)}"
                                    title="${esc(r.libelle)} — ${esc(r.aide)}"
                                    aria-label="Poser ${esc(r.libelle)}, ${esc(r.jeton)}, ${esc(cible)}">${esc(r.jeton.slice(1, -1))}</button>`).join('');
}

/**
 * UN énoncé du gabarit : son étiquette, sa palette de repères, sa zone, son aide.
 * ↻ §8 (5 sept. 2026) — factorisé pour servir PLUSIEURS endroits : « Bilan » rend
 * les deux énoncés que l'élève lit dans son bilan, « Ce que l'élève lit » rend
 * le décompte, avant les paliers, et la liste « Sous-critères » rend « Aucune
 * annotation » sous la case des codes (la carte « Bilan », 1.120 — ce texte ne
 * s'affiche qu'à l'enseignant·e). Même zone, mêmes attributs, mêmes handlers
 * (`modifierTexteEnonce*Handler`, `data-enonce-cle`) : un énoncé s'écrit et se
 * lit exactement comme avant, seul l'endroit où on le compose peut bouger.
 *
 * Le texte troué, étape 1 (3 septembre 2026) — AU-DESSUS de chaque zone, les
 * repères qu'elle OFFRE. Un clic pose le repère au curseur (`insererRepereEnonce`) :
 * rien à taper, donc plus de `[service]` tapé pour `{service}`. La zone reste
 * éditable à la main — on ajoute un chemin, on n'en ferme aucun. ⚠ Chaque zone
 * n'offre que ce qu'un appel remplit (`reperesDeCle`) : « Aucune annotation »
 * n'offre pas {erreurs}, qui y vaudrait toujours vide. Deux familles, deux
 * couleurs (cadrage du 2 sept.). ⚠ LE BADGE S'AFFICHE SANS ACCOLADES (« retire
 * les accolades » — Grégoire, essai iPad du 3 sept.) ; ce qui se pose dans la
 * zone les garde, c'est le format que le moteur lit (`data-jeton`,
 * `insererRepere`). ⚠ LA RANGÉE PRÉCÈDE LA ZONE, ET C'EST GRÉGOIRE QUI L'A
 * DEMANDÉ au premier coup d'œil (3 sept., après-midi) : il l'a cherchée là sans
 * qu'on le lui dise — une palette d'outils se place avant l'établi, pas après.
 * L'aide, elle, reste SOUS le champ : c'est la zone qu'elle décrit, pas les repères.
 *
 * @param {Object} c - une clé de `enoncesAlgo.listerCles()`
 * @param {Object} e - `enoncesAlgo.normaliser(critere)`, les textes en vigueur
 * @param {Object} ctx - { mode: 'temp' | 'grille', index, grilleId }
 */
function rendreChampEnonceAlgo(c, e, ctx) {
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const estTemp = ctx.mode === 'temp';
    const handlerTexte = estTemp ? 'modifierTexteEnonceTempHandler' : 'modifierTexteEnonceGrilleHandler';
    const datasCommunes = estTemp
        ? `data-critere-index="${ctx.index}"`
        : `data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}"`;
    const reperes = rendreBoutonsReperes(window.enoncesAlgo.reperesDeCle(c.cle), 'dans « ' + c.libelle + ' »');
    return `
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: var(--gris-moyen);">${esc(c.libelle)}</label>
                        <div class="reperes-enonce" role="group" aria-label="Repères à poser dans « ${esc(c.libelle)} »">
                            <span class="reperes-enonce-mot">Poser :</span>${reperes}
                        </div>
                        <textarea class="controle-form" rows="2"
                                  data-on-change="${handlerTexte}" ${datasCommunes} data-enonce-cle="${esc(c.cle)}"
                                  title="${esc(c.aide)}">${esc(e.enonces[c.cle])}</textarea>
                        <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 2px;">${esc(c.aide)}</small>
                    </div>`;
}

function rendreBlocEnoncesAlgo(critere, ctx) {
    if (!critere || critere.type !== 'algorithmique') return '';
    if (typeof window.enoncesAlgo === 'undefined') return '';

    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const e = window.enoncesAlgo.normaliser(critere);
    const modeles = window.enoncesAlgo.listerModeles();
    // ↻ §8 (5 sept. 2026, 7 h 15 — décision de Grégoire : « non pas doublonner, mais
    // fondre les deux en un seul endroit d'écriture ») : le DÉCOMPTE se compose dans la
    // carte « Ce que l'élève lit » (`rendreBlocProjectionAlgo`), avant les paliers — la
    // phrase de l'élève se lit de haut en bas. ↻ La carte « Bilan » (cadrage du 5 sept.,
    // 7 h 55, livrée en 1.120) : « Aucune annotation » ne s'affiche qu'à l'enseignant·e —
    // elle se compose sous la case des codes (`rendrePliAucuneAnnotation`), pas ici. Ici
    // restent le menu du modèle et les DEUX énoncés que l'élève lit dans son bilan. Même
    // clé, mêmes handlers : rien ne change dans les données, et le modèle fournit toujours
    // le texte de départ du décompte.
    const cles = window.enoncesAlgo.listerCles().filter((c) => c.cle !== 'decompte' && c.cle !== 'aucune');

    const estTemp = ctx.mode === 'temp';
    const handlerModele = estTemp ? 'modifierModeleEnoncesTempHandler' : 'modifierModeleEnoncesGrilleHandler';
    const datasCommunes = estTemp
        ? `data-critere-index="${ctx.index}"`
        : `data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}"`;

    const options = modeles.map(m =>
        `<option value="${esc(m.id)}"${m.id === e.modeleId ? ' selected' : ''}>${esc(m.nom)}</option>`
    ).join('');
    const modeleCourant = modeles.find(m => m.id === e.modeleId);

    // Chaque énoncé : étiquette, palette, zone, aide — `rendreChampEnonceAlgo`
    // (le texte troué, étape 1 ; factorisé au §8 du 5 sept. pour la carte
    // « Ce que l'élève lit », qui rend le décompte par le même helper).
    const champs = cles.map((c) => rendreChampEnonceAlgo(c, e, ctx)).join('');

    // Lot 4 (4 sept. 2026) : « Modèle d'OBSERVATION », décision de Grégoire (17 h 50,
    // consigne h) — la rétroaction, c'est la cartouche, sur le travail ; « commentaire »
    // n'entre pas. ↻ La carte « Bilan » (5 sept., point 4) : le menu dit les DEUX choses
    // qu'il fait — le texte de départ des phrases du bilan (ici) ET du décompte (carte
    // « Ce que l'élève lit ») — et une ligne d'aide le dit sous lui, avant ce que le
    // modèle choisi dit de lui-même. La clé sous le menu ne porte aucun de ces mots :
    // rien qui voyage ne change. Sans cadre : la carte « Bilan » le porte.
    return `
            <div>
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Modèle des phrases (bilan et décompte)</label>
                    <select class="controle-form"
                            data-on-change="${handlerModele}" ${datasCommunes}>
                        ${options}
                    </select>
                    <small class="modele-phrases-aide">Fournit le texte de départ des deux phrases du bilan et du décompte de la carte « Ce que l'élève lit ».</small>
                    <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">${esc(modeleCourant ? modeleCourant.description : '')}</small>
                </div>
                <div style="margin-top: 10px;">
                    ${champs}
                </div>
                <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">
                    Un clic sur un repère le pose dans la phrase, là où est le curseur — rien à taper.
                    Le repère bleu est écrit dans la grille ; les verts se remplissent à la correction, copie par copie.
                    Un repère que la phrase n'a pas à remplir disparaît proprement.
                    Une zone laissée VIDE fait taire l'énoncé.
                </small>${e.herite && critere.modeleEnonces ? `
                <small style="font-size: 0.78rem; color: var(--orange-accent); display: block; margin-top: 4px;">
                    Le modèle « ${esc(critere.modeleEnonces)} » enregistré dans cette grille est inconnu de cette version. Un modèle par défaut est appliqué en attendant.
                </small>` : ''}
            </div>`;
}

/**
 * Codes par grille, lot 3 (3 septembre 2026) — le GESTE d'activation.
 *
 * Décision de Grégoire : les codes d'annotation d'une grille SONT les
 * sous-critères de son critère algorithmique, et ça s'active par un geste,
 * partout. Sans lui, rien ne change : la palette montre les dix codes de
 * l'écran Annoter › palette, comme avant. Les mots de la case sont les siens
 * (« Utiliser ces sous-critères comme codes d'annotation »).
 *
 * ⚠ ABSENT = REPLI. Le handler n'écrit jamais `false` : décocher RETIRE le
 * champ. Une grille d'avant ce lot et une grille décochée sont la même chose.
 */
function rendreActivationCodes(critere, ctx) {
    if (typeof window.codesAnnotation === 'undefined') return '';
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const actif = window.codesAnnotation.donneSesCodes(critere);
    const apercu = window.codesAnnotation.apercuCodes(critere);
    const n = apercu.length;
    const sansPoids = (critere.sousCriteres || []).length - n;
    const note = actif
        ? `Sur toute copie évaluée avec cette grille, la palette des codes montre ${n === 1 ? 'ce sous-critère' : 'ces ' + n + ' sous-critères'} : le numéro est le code, avec le nom, la couleur et l'observation d'ici.`
        : `Décochée : la palette montre les dix codes de l'écran Annoter › palette, comme avant.`;
    const precision = sansPoids > 0
        ? ` Un sous-critère de pondération 0 n'est pas un code posable (${sansPoids === 1 ? 'un ici' : sansPoids + ' ici'}).`
        : '';
    // 21 oct. 2026 — un critère MARQUÉ (né depuis l'étape 0) n'a pas de repli à choisir : ses codes sont ses
    // sous-critères. Pas de case ; la note d'une case cochée, dès qu'il en a un qui se pose.
    if (critere[window.codesAnnotation.MARQUE] === true) {
        return n === 0 ? '' : `
                        <div class="sous-criteres-codes sous-criteres-codes--actif">
                            <small class="sous-criteres-codes-note">${esc(note)}${esc(precision)}</small>
                        </div>`;
    }
    return `
                        <div class="sous-criteres-codes${actif ? ' sous-criteres-codes--actif' : ''}">
                            <label class="sous-criteres-codes-choix">
                                <input type="checkbox"
                                       data-on-change="modifierCodesDepuisSousCriteresHandler" data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}"
                                       ${actif ? 'checked' : ''}${(n === 0 && !actif) ? ' disabled' : ''}>
                                Utiliser ces sous-critères comme codes d'annotation
                            </label>
                            <small class="sous-criteres-codes-note">${esc(note)}${esc(precision)}</small>
                            <small class="sous-criteres-codes-palette">Sans cette case, la copie utilise la palette générale (Annoter › palette). Cochée, ce sont ces sous-critères qui deviennent les codes de la copie.</small>
                        </div>`;
}

/**
 * Consigne du 3 sept. 2026 (16 h) — UNE SEULE FAÇON DE CHOISIR UNE COULEUR. Le
 * champ Couleur d'un sous-critère prend le sélecteur de la palette d'annotation
 * (`travauxOutils.renderPickerCouleur`, #287) : les douze pastilles prédéfinies,
 * plus « Personnalisé… » qui ouvre le sélecteur du système. Une définition, des
 * appels — celui-ci rejoint ceux d'`echelles.js`. Le sélecteur pose l'input caché
 * qui porte `data-on-change` : choisir une pastille passe par le même handler que
 * les autres champs du sous-critère. Une couleur déjà enregistrée hors des douze
 * s'affiche telle quelle : on change le CHOIX, pas ce qui est enregistré.
 */
function rendreCouleurSousCritere(critere, sc, ctx) {
    const couleur = couleurDeSousCritere(critere, sc);
    if (typeof window.travauxOutils === 'undefined' || typeof window.travauxOutils.renderPickerCouleur !== 'function') {
        return `<span class="travaux-retro-couleur" style="background:${echapperHtml(couleur)}" title="Palette d'annotation absente : couleur non modifiable ici"></span>`;
    }
    return window.travauxOutils.renderPickerCouleur(couleur, {
        dataAttrs: {
            'on-change': 'modifierSousCritereHandler',
            'grille-id': ctx.grilleId,
            'critere-index': ctx.index,
            'sc-index': ctx.scIndex,
            'champ': 'couleur'
        }
    });
}

/** La couleur qu'un sous-critère aurait comme code — la sienne, sinon celle des dix par position ; gris s'il ne se pose pas. */
function couleurDeSousCritere(critere, sc) {
    if (typeof window.codesAnnotation === 'undefined' || !sc) return '#888888';
    const code = (sc.code === undefined || sc.code === null) ? '' : String(sc.code).trim();
    const entree = window.codesAnnotation.apercuCodes(critere).find(c => c.code === code);
    return entree ? entree.couleur : '#888888';
}

async function modifierCodesDepuisSousCriteresHandler(el) {
    // #1131 (21 oct. 2026) : `data-grille-id` vaut `temp` en création (`_modifierCritereCible`).
    var cible = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var actif = !!el.checked;
    var ecrit = await _modifierCritereCible(cible, index, function(critere) {
        if (actif) critere.codesDepuisSousCriteres = true;
        else delete critere.codesDepuisSousCriteres;
    });
    if (ecrit) await _redessinerCible(cible);
}

function rendreBlocProjectionAlgo(critere, ctx) {
    if (!critere || critere.type !== 'algorithmique') return '';
    if (typeof window.projectionAlgo === 'undefined') return '';

    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t)) : '');
    const nb = (v) => (v === undefined || v === null || v === '') ? '' : esc(v);
    const p = window.projectionAlgo.normaliser(critere);
    const modeles = window.projectionAlgo.listerModeles();

    const estTemp = ctx.mode === 'temp';
    const hModele = estTemp ? 'modifierModeleProjectionTempHandler' : 'modifierModeleProjectionGrilleHandler';
    const hParam = estTemp ? 'modifierParamProjectionTempHandler' : 'modifierParamProjectionGrilleHandler';
    const hPalier = estTemp ? 'modifierPalierProjectionTempHandler' : 'modifierPalierProjectionGrilleHandler';
    const datas = estTemp
        ? `data-critere-index="${ctx.index}"`
        : `data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}"`;
    const actionAjout = estTemp ? 'ajouterPalierProjectionTemp' : 'ajouterPalierProjectionGrille';
    const actionRetrait = estTemp ? 'supprimerPalierProjectionTemp' : 'supprimerPalierProjectionGrille';
    const paramsAction = estTemp ? `data-param="${ctx.index}"` : `data-param="${esc(ctx.grilleId)}" data-param2="${ctx.index}"`;
    const paramPalier = estTemp ? 'data-param2' : 'data-param3';

    const options = modeles.map(m =>
        `<option value="${esc(m.id)}"${m.id === p.modeleId ? ' selected' : ''}>${esc(m.nom)}</option>`
    ).join('');

    // Lot B (5 sept. 2026) — LES COLLECTIONS DE PARAMÈTRES : les jeux nommés du trimestre
    // (`collectionsProjection`), sous un sous-titre, APRÈS les modèles livrés (liste fermée,
    // intouchée). La valeur porte le préfixe `collection:` que les deux handlers du menu
    // reconnaissent. Choisir COPIE (décision de Grégoire, 4 sept.) : le menu montre ensuite le
    // modèle copié, pas la collection — le critère ne garde aucun lien.
    // ↻ 21 oct. 2026 (constat 11, Grégoire, 8 h 31 : « Labo Anatomie » lu comme une propriété du critère) :
    // la liste des collections, avec la corbeille et la ligne qui dit la copie, ne suit plus le menu.
    // Elle prend le titre du menu, « Mes collections », et vient en fin de carte, à côté de
    // « Enregistrer ces paliers sous un nom… » : ce qu'on gère pour tout le trimestre, après ce critère.
    const collections = (typeof window.collectionsProjection !== 'undefined') ? window.collectionsProjection.lister() : [];
    const optionsCollections = collections.length ? `
                        <optgroup label="Mes collections">${collections.map((c) => `
                            <option value="collection:${esc(c.id)}">${esc(c.nom)}</option>`).join('')}
                        </optgroup>` : '';
    const cibleCollection = estTemp ? 'temp' : ctx.grilleId;
    const listeCollections = collections.length ? `
                <div class="collections-section">
                    <h4 class="collections-titre">Mes collections</h4>
                    <div class="collections-liste">${collections.map((c) => `
                        <div class="collection-ligne"><span class="collection-nom">${esc(c.nom)}</span>${retirerBloc({ action: 'supprimerCollectionProjection', param: c.id, param2: cibleCollection, param3: ctx.index, titre: 'Supprimer la collection « ' + esc(c.nom) + ' »' })}</div>`).join('')}
                    </div>
                    <small class="collections-aide">Choisir une collection copie ses paliers et ses réglages dans ce critère. Corriger ou supprimer la collection ensuite ne change pas cette grille, ni ce qu'un élève a déjà lu.</small>
                </div>` : '';

    const enTete = `
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Modèle de projection</label>
                    <select class="controle-form" data-on-change="${hModele}" ${datas}>
                        ${options}${optionsCollections}
                    </select>
                    <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">${esc(p.modele.description)}</small>
                </div>`;

    // ↻ §8 (5 sept. 2026, 7 h 15) — LE DÉCOMPTE VIENT ICI, avant les paliers : la carte
    // « Ce que l'élève lit » se lit de haut en bas dans l'ordre exact de la phrase de
    // l'élève (décompte du bloc 3, puis projection du bloc 2). Le décompte gris de la ligne
    // « L'élève lira : » ne tombe plus du ciel : son composeur est juste au-dessus. Même
    // clé (`enonces.decompte`), mêmes handlers, même helper que les deux énoncés de la
    // carte « Bilan » ; le texte de départ vient toujours du modèle des phrases
    // (`enoncesAlgo.normaliser`), et une ligne le dit. Rendu AVANT le `if` qui suit : sous
    // « Aucune projection », l'élève lit quand même le décompte, il reste composable.
    const cleDecompte = (typeof window.enoncesAlgo !== 'undefined')
        ? window.enoncesAlgo.listerCles().find((c) => c.cle === 'decompte') : null;
    const blocDecompte = cleDecompte ? `
                <div class="decompte-eleve">
                    ${rendreChampEnonceAlgo(cleDecompte, window.enoncesAlgo.normaliser(critere), ctx)}
                    <small class="decompte-texte-depart">Texte de départ : le modèle des phrases, carte « Bilan ».</small>
                </div>` : '';

    // « Aucune projection » : rien d'autre à régler. Le dire, plutôt que de
    // laisser un bloc vide qui ressemble à un chargement raté.
    if (!p.modele.projette) {
        return `${enTete}${blocDecompte}
                <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 6px;">
                    Aucune projection ne sera proposée à l'élève pour ce critère.
                </small>` + listeCollections;
    }

    const champsParams = p.modele.parametres.map(par => {
        const commun = `data-on-change="${hParam}" ${datas} data-param-cle="${esc(par.cle)}" title="${esc(par.aide)}"`;
        const champ = (par.type === 'texte')
            ? `<input type="text" class="controle-form" value="${esc(p.params[par.cle])}" ${par.max ? `maxlength="${esc(par.max)}"` : ''} ${commun}>`
            : `<input type="number" class="controle-form" value="${nb(p.params[par.cle])}" min="${nb(par.min)}" max="${nb(par.max)}" ${commun}>`;
        return `
                    <div class="groupe-form">
                        <label style="font-size: 0.85rem; color: var(--gris-moyen);">${esc(par.libelle)}</label>
                        ${champ}
                    </div>`;
    }).join('');

    // Le seuil dans les DEUX unités — comme libelleSymbolique dit la formule.
    // Le ratio normalisé, lui, ne s'affiche jamais à l'élève ; ici il sert à
    // l'enseignant·e, toujours accompagné de son équivalent en mots.
    //
    // ↻ 4 SEPT. 2026 (coup d'œil de Grégoire, retouche b) — UN PALIER SUR DEUX RANGÉES,
    // pas quatre : « Palier · Jusqu'à », puis « Ce que l'élève lit · Phrase de
    // recommandation », côte à côte dans la grille du formulaire groupe-cours
    // (`grille-form-2col`, empruntée telle quelle — mesuré : elle ne s'empile pas sur
    // iPad en portrait, ce formulaire-là non plus). Le nom du palier a toute sa colonne
    // (« Sans erreur » s'affichait « Sans erre » dans les 80 px du code d'un
    // sous-critère). La corbeille en coin (retouche c). La note « Écris {service}… »
    // UNE fois, sous les paliers, pas sous chacun.
    //
    // ↻ §8 e) — LES PALIERS SONT NUMÉROTÉS par rang (« Palier 1 »…, « Sans erreur »
    // compris) et N'ONT PAS de chevrons : le calcul lit les paliers dans leur ordre
    // (`_paliersDeRatio`, le terminal en dernier), l'ordre EST le seuil, un déplacement à
    // la main pourrait le contredire. ▣ Mesuré : ni le registre ni les handlers ne rangent
    // les paliers par seuil à la saisie — inscrit, rien n'est réécrit dans les grilles.
    // Le texte troué, étape 2 (4 sept. 2026) — UNE palette par palier, au-dessus de
    // ses deux zones. ▣ Décidé seul, dit : mesuré sur les six paliers de migration,
    // deux palettes par palier feraient 96 boutons dans la carte, une par palier en
    // fait 48 ; et la rangée de huit tient sur une ligne en pleine largeur, là où
    // elle se plierait sur deux dans chaque demi-colonne (question 4 du cadrage).
    // Le badge se pose dans la zone du palier où est le curseur — sans curseur,
    // dans « Ce que l'élève lit » (`insererRepereEnonce`). Même composant, mêmes
    // classes, même `data-action` que les énoncés.
    const reperesPalier = (typeof window.projectionAlgo.listerReperes === 'function')
        ? window.projectionAlgo.listerReperes() : [];
    // Un jeton INCONNU de cette version reste dans le texte au rendu — l'élève le
    // lirait tel quel. Le gabarit le DIT sous le palier, comme `herite` le dit pour
    // un modèle inconnu (carte du 4 sept., §d : le risque nommé de ce lot).
    const ligneInconnus = (pal) => {
        const inconnus = (typeof window.projectionAlgo.jetonsInconnus === 'function')
            ? window.projectionAlgo.jetonsInconnus((pal.texte || '') + ' ' + (pal.texteAide || '')) : [];
        if (!inconnus.length) return '';
        const un = inconnus.length === 1;
        return `
                            <small class="palier-jetons-inconnus" style="font-size: 0.78rem; color: var(--orange-accent); display: block; margin-top: 4px;">
                                ${un ? 'Le badge' : 'Les badges'} ${inconnus.map(j => '« ' + esc(j) + ' »').join(', ')} ${un ? 'est inconnu' : 'sont inconnus'} de cette version de l'application : l'élève ${un ? 'le lirait tel quel' : 'les lirait tels quels'}.
                            </small>`;
    };

    // ↻ §5 (4 sept. 2026, 18 h 38 — coup d'œil de Grégoire : « on compose dans le palier,
    // on lit le résultat dans une autre carte, plus bas, repliée ») : L'APERÇU VIENT SOUS
    // CHAQUE PALIER. C'est l'aperçu au niveau du gabarit des arrêtés 4 et 5 (ce que l'élève
    // lit vient de deux blocs à la fois) : la copie FICTIVE de ce palier
    // (`projectionAlgo.copiesExemple`, retrouvée par sa `cle`), et la phrase = décompte du
    // bloc 3 PUIS projection du bloc 2, dans l'ordre exact où
    // `_construireRetroactionAlgoCategories` (evaluation-calcul.js) les concatène. Rendu
    // pur, aucun état : le gabarit se redessine à chaque frappe, l'aperçu suit. La copie
    // non corrigée n'a AUCUNE phrase (l'application s'arrête sans erreurs ni mots) : une
    // ligne en bas de la carte le dit, une fois. ⚠ Ce que l'aperçu ne montre pas, et dit :
    // la rétroaction du sous-critère dominant, qui dépend des codes posés sur une vraie copie.
    const apercuPossible = typeof window.enoncesAlgo !== 'undefined'
        && typeof window.projectionAlgo.copiesExemple === 'function';
    const copies = apercuPossible ? window.projectionAlgo.copiesExemple(critere) : [];
    // ↻ §7 (5 sept. 2026, 6 h 50 — coup d'œil de Grégoire : rien ne montrait que la ligne
    // grise est FABRIQUÉE à partir des deux zones) : la ligne rend DEUX segments. En gris,
    // ce qui est engendré — le décompte du bloc 3, puis le préfixe « Tu fais en moyenne… »
    // s'il y en a un ; dans l'encre normale, ce qu'il a écrit — verdict et recommandation,
    // remplis. `_resultat` rend `prefixe` ET `texte` = préfixe + ' ' + verdict : le préfixe
    // se retire par sa LONGUEUR, pas par regex. Verdict et recommandation restent UN seul
    // segment : les séparer exigerait de changer le module de projection (hors périmètre).
    const segmentsDe = (copie) => {
        const decompte = window.enoncesAlgo.enonce(critere, 'decompte', { erreurs: copie.erreurs, mots: copie.mots });
        const projection = window.projectionAlgo.calculer(critere, { erreurs: copie.erreurs, mots: copie.mots });
        const prefixe = projection.applicable ? (projection.prefixe || '') : '';
        const texte = projection.applicable ? (projection.texte || '') : '';
        return {
            engendre: [decompte, prefixe].filter(Boolean).join(' '),
            ecrit: (prefixe && texte.startsWith(prefixe)) ? texte.slice(prefixe.length).trim() : texte
        };
    };
    const ligneApercu = (pal) => {
        const copie = copies.find((c) => c.corrigee && c.cle === pal.cle);
        if (!copie) return '';
        const s = segmentsDe(copie);
        const vide = !s.engendre && !s.ecrit;
        return `
                            <div class="palier-apercu">
                                <span class="palier-apercu-mot">L'élève lira :</span>
                                <span class="palier-apercu-engendre">${esc(s.engendre)}</span>
                                <span class="palier-apercu-ecrit">${esc(s.ecrit)}</span>${vide ? '<em class="palier-apercu-vide">aucune phrase — le décompte est vide et ce palier ne dit rien</em>' : ''}
                                <span class="palier-apercu-copie">— copie fictive, ${esc(copie.erreurs)} erreur${copie.erreurs > 1 ? 's' : ''} pour ${esc(copie.mots)} mots</span>
                            </div>`;
    };

    const paliers = p.paliers.map((pal, i) => {
        const mpe = window.projectionAlgo.motsParErreurDuRatio(critere, pal.ratioMax);
        const seuilCol = pal.sansErreur
            ? `<span style="font-size: 0.78rem; color: var(--gris-clair);">aucune erreur</span>`
            : (pal.ratioMax === null
                ? `<span style="font-size: 0.78rem; color: var(--gris-clair);">au-delà du dernier seuil</span>`
                : `<input type="number" class="controle-form sous-critere-input-standard"
                          value="${esc(pal.ratioMax)}" min="0.01" max="100" step="0.05"
                          data-on-change="${hPalier}" ${datas} data-palier-index="${i}" data-champ="ratioMax"
                          title="Seuil en ratio normalisé. 1 = exactement au seuil de l'épreuve.">
                   <small style="font-size: 0.72rem; color: var(--gris-clair);">soit 1 erreur / ${mpe === null ? '?' : esc(Math.round(mpe * 10) / 10)} mots</small>`);
        const retirer = retirerBloc(estTemp
            ? { action: actionRetrait, param: ctx.index, param2: i, coin: true, titre: 'Supprimer ce palier' }
            : { action: actionRetrait, param: ctx.grilleId, param2: ctx.index, param3: i, coin: true, titre: 'Supprimer ce palier' });
        return `
                        <div class="sous-critere-item palier-projection">
                            <div class="grille-form-2col palier-rangee">
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Palier ${i + 1}</label>
                                    <input type="text" class="controle-form sous-critere-input-standard palier-nom"
                                           value="${esc(pal.libelle || pal.cle)}"
                                           data-on-change="${hPalier}" ${datas} data-palier-index="${i}" data-champ="libelle">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Jusqu'à</label>
                                    ${seuilCol}
                                </div>
                            </div>
                            <div class="reperes-enonce reperes-palier" role="group" aria-label="Badges à poser dans le palier ${i + 1}">
                                <span class="reperes-enonce-mot">Poser :</span>${rendreBoutonsReperes(reperesPalier, 'dans le palier ' + (i + 1))}
                            </div>
                            <div class="grille-form-2col palier-rangee">
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Verdict</label>
                                    <textarea class="controle-form sous-critere-textarea" rows="2"
                                              data-on-change="${hPalier}" ${datas} data-palier-index="${i}" data-champ="texte">${esc(pal.texte || '')}</textarea>
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Recommandation (facultative)</label>
                                    <textarea class="controle-form sous-critere-textarea" rows="2"
                                              placeholder="Laisser vide pour ne rien recommander à ce palier"
                                              data-on-change="${hPalier}" ${datas} data-palier-index="${i}" data-champ="texteAide">${esc(pal.texteAide || '')}</textarea>
                                </div>
                            </div>
                            <label class="palier-leve-signalement">
                                <input type="checkbox" ${pal.leveSignalement ? 'checked' : ''}
                                       data-on-change="${hPalier}" ${datas} data-palier-index="${i}" data-champ="leveSignalement">
                                <span>Ce palier lève un signalement <small>— pour toi, à côté du palier RàI de l'élève. Rien n'est écrit sur sa copie.</small></span>
                            </label>
                            ${ligneInconnus(pal)}
                            ${ligneApercu(pal)}
                            ${retirer}
                        </div>`;
    }).join('');

    const basApercu = apercuPossible ? `
                <small class="palier-apercu-non-corrigee" style="font-size: 0.78rem; color: var(--gris-moyen); display: block; margin-top: 8px;">
                    Copie non corrigée : aucune phrase avant la correction.
                </small>
                <small class="palier-apercu-note" style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">
                    Copies fictives, calculées depuis tes paliers — aucune donnée d'élève. L'aperçu ne montre pas la rétroaction du sous-critère dominant : elle dépend des codes posés sur une vraie copie.
                </small>` : '';

    return `${enTete}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
                    ${champsParams}
                </div>
                <p style="font-size: 0.85rem; color: var(--gris-moyen); margin: 10px 0 0 0;">
                    <strong>Seuil de l'épreuve :</strong> ${esc(window.projectionAlgo.libelleSeuil(critere))}
                </p>
                <small style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 4px;">
                    Ce seuil est indépendant du facteur de normalisation de la formule : l'élève est noté selon la norme du cours, et situé selon celle de l'épreuve.
                </small>
                <small class="palier-note-composer" style="font-size: 0.78rem; color: var(--gris-clair); display: block; margin-top: 8px;">
                    Un clic sur un badge le pose dans la zone où est le curseur — sans curseur, dans « Verdict ».
                    Les badges bleus sont écrits dans la grille ; les verts se remplissent à la correction, copie par copie, et un badge sans valeur disparaît.
                    Sans badge, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un badge, elle est entière : c'est toi qui l'écris.
                </small>${blocDecompte}
                <div class="sous-criteres-liste-conteneur" style="margin-top: 10px;">
                    ${paliers}
                </div>
${basApercu}
                <button class="btn btn-secondaire btn-tres-compact" style="margin-top: 8px;"
                        data-action="${actionAjout}" ${paramsAction}>+ Ajouter un palier</button>${rendreSaisieCollectionProjection(critere, ctx)}${listeCollections}`;
}

/**
 * Lot B (5 sept. 2026) — le geste qui ENREGISTRE les réglages d'un critère sous un nom :
 * un bouton, qui ouvre une section INLINE dans la carte (⛔ pas de `prompt()`, pas de
 * modale) — le nom, « Enregistrer », « Annuler », et le message d'un nom déjà pris. L'état
 * ouvert / fermé et le nom tapé vivent en mémoire (`_etatSaisieCollection`, comme les plis),
 * jamais dans la grille, et survivent aux redessins. Rendu seulement sous un modèle qui
 * projette : « Aucune projection » n'a rien à nommer. En édition comme en création.
 */
const _etatSaisieCollection = {};

function rendreSaisieCollectionProjection(critere, ctx) {
    if (typeof window.collectionsProjection === 'undefined') return '';
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const cleCritere = critere.id || ('critere-' + ctx.index);
    const cible = ctx.mode === 'temp' ? 'temp' : ctx.grilleId;
    const params = `data-param="${esc(cible)}" data-param2="${ctx.index}"`;
    const etat = _etatSaisieCollection[cleCritere];
    if (!etat) {
        return `
                <button type="button" class="btn btn-secondaire btn-tres-compact collection-bouton-enregistrer"
                        data-action="ouvrirSaisieCollectionProjection" ${params}>Enregistrer ces paliers sous un nom…</button>`;
    }
    return `
                <div class="collection-saisie">
                    <label class="sous-critere-label-petit" for="collection-nom-${esc(cleCritere)}">Nom de la collection</label>
                    <div class="collection-saisie-rangee">
                        <input type="text" id="collection-nom-${esc(cleCritere)}" class="controle-form" maxlength="80"
                               value="${esc(etat.nom || '')}" placeholder="Ex. : EUF" data-collection-nom="${esc(cleCritere)}">
                        <button type="button" class="btn btn-principal btn-tres-compact" data-action="enregistrerCollectionProjection" ${params}>Enregistrer</button>
                        <button type="button" class="btn btn-secondaire btn-tres-compact" data-action="annulerSaisieCollectionProjection" ${params}>Annuler</button>
                    </div>${etat.message ? `
                    <small class="collection-saisie-message">${esc(etat.message)}</small>` : ''}
                </div>`;
}

/*
 * LES DEUX CIBLES D'UN GESTE SUR UN CRITÈRE — en création (`temp`, `window.tempCriteres`), ou une grille
 * enregistrée (son id). Nées pour les collections ; #1120 (21 oct., consigne
 * `CONSIGNE-LOT-2026-10-21-grille-neuve-sous-criteres-bareme.md`) : le barème et les sous-critères d'un
 * critère non algorithmique les prennent aussi. En création, rien ne s'écrit en base avant « Créer la grille »
 * (décision E1) : le critère temporaire change, et part avec la grille.
 */
/** Le critère visé par un geste : en création (`temp`), ou dans une grille enregistrée. */
async function _critereCible(cible, index) {
    if (cible === 'temp') return (window.tempCriteres || [])[index] || null;
    const grille = await obtenirGrilleParId(cible);
    return (grille && grille.criteres && grille.criteres[index]) || null;
}

async function _redessinerCible(cible) {
    if (cible === 'temp') { afficherCriteresTemp(); return; }
    afficherCriteresGrille(await obtenirGrilleParId(cible));
}

/** Le critère tel qu'il est écrit, lu avant l'attente d'une fenêtre (#1007, lot 2b) : le temporaire, ou celui en base. */
function _critereLuCible(cible, index) {
    return cible === 'temp' ? ((window.tempCriteres || [])[index] || null) : _critereEnBase(cible, index);
}

/**
 * Une écriture sur UN critère de la cible. En création, le critère temporaire change en place ; dans une grille
 * enregistrée, l'écriture est sérialisée (#510). `mutateur(c)` rend `false` pour ne rien écrire. Rend le critère
 * écrit, ou `null`.
 */
async function _modifierCritereCible(cible, index, mutateur) {
    if (cible === 'temp') {
        const c = (window.tempCriteres || [])[index];
        return c && mutateur(c) !== false ? c : null;
    }
    let ecrit = null, grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === cible);
        const c = g && g.criteres && g.criteres[index];
        if (!c || mutateur(c) === false) return undefined;
        g.dateModification = new Date().toISOString();
        grille = g;
        ecrit = c;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (grille && grilleTemplateActuelle && grilleTemplateActuelle.id === cible) grilleTemplateActuelle = grille;
    return ecrit;
}

async function ouvrirSaisieCollectionProjection(cible, index) {
    const critere = await _critereCible(cible, index);
    if (!critere) return;
    _etatSaisieCollection[critere.id || ('critere-' + index)] = { nom: '', message: '' };
    await _redessinerCible(cible);
}

async function annulerSaisieCollectionProjection(cible, index) {
    const critere = await _critereCible(cible, index);
    if (!critere) return;
    delete _etatSaisieCollection[critere.id || ('critere-' + index)];
    await _redessinerCible(cible);
}

async function enregistrerCollectionProjection(cible, index) {
    const critere = await _critereCible(cible, index);
    if (!critere) return;
    const cleCritere = critere.id || ('critere-' + index);
    const input = document.querySelector('input[data-collection-nom="' + cleCritere + '"]');
    const nom = input ? String(input.value || '') : '';
    if (!nom.trim()) {
        marquerChampRefuse(input, 'Donne un nom à la collection.');
        return;
    }
    const r = await window.collectionsProjection.enregistrer(nom, critere);
    if (!r.ok) {
        _etatSaisieCollection[cleCritere] = {
            nom: nom,
            message: r.raison === 'nom_pris' ? 'Une collection porte déjà ce nom.' : 'Ce modèle n\'a pas de paliers à enregistrer.'
        };
        await _redessinerCible(cible);
        return;
    }
    delete _etatSaisieCollection[cleCritere];
    if (typeof notifications !== 'undefined' && notifications.succes) {
        notifications.succes(`Collection « ${r.collection.nom} » enregistrée.`, 'Tu la retrouveras dans le menu de projection de tes grilles.');
    }
    await _redessinerCible(cible);
}

async function supprimerCollectionProjection(id, cible, index) {
    const c = window.collectionsProjection.obtenir(id);
    if (!c) { await _redessinerCible(cible); return; }
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('collection'))) return;
    if (!confirm(`Supprimer la collection « ${c.nom} » ? Les grilles qui l'ont copiée ne changent pas.`)) return;
    await window.collectionsProjection.supprimer(id);
    await _redessinerCible(cible);
}

/** Un choix du menu de projection est-il une collection ? Rend son id, ou null. */
function _idCollectionChoisie(valeur) {
    return (typeof valeur === 'string' && valeur.indexOf('collection:') === 0) ? valeur.slice('collection:'.length) : null;
}

function _direCollectionDisparue() {
    // Lot E1 : `notifications.avertissement` n'existe pas (l'API est succes / erreur /
    // warning / info) ; la garde rendait ce message muet. Branché sur la vraie méthode.
    if (typeof notifications !== 'undefined' && notifications.warning) {
        notifications.warning('Cette collection n\'existe plus.', 'Rien n\'a été changé sur le critère.');
    }
}

/* ===============================
   LOT 4 (4 septembre 2026) — LE GABARIT ALGORITHMIQUE SE RANGE
   =============================== */

/**
 * Les PLIS du gabarit vivent ici — pas dans le DOM, pas dans la grille.
 *
 * Chaque handler de champ redessine le bloc entier (`afficherCriteresTemp`,
 * `afficherCriteresGrille`) : un pli qui ne vivrait que dans le DOM se refermerait
 * sous les doigts à la première frappe (cadrage « accordéons » du 3 sept., obstacle 2).
 * Avant chaque redessin, `capturerPlisGabaritAlgo` relève l'état des cartes en
 * place ; le rendu le relit par `pliGabaritAlgoFerme`.
 *
 * ⛔ Rien de ceci n'entre dans les données de la grille : un pli d'écran n'est pas
 * une propriété de la grille, il ne voyage ni à l'export ni au partage — il meurt
 * avec la page, et c'est voulu. Les cartes ne portent pas d'`id` non plus :
 * `toggleAccordeonV2` persisterait alors leur état dans `etatsAccordeonsV2`.
 *
 * Clé : `<id du critère>:<section>` ; valeur : `true` = repliée.
 */
const plisGabaritAlgo = {};

function capturerPlisGabaritAlgo(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    const cartes = container.querySelectorAll('.carte.accordeon[data-pli]') || [];
    Array.prototype.forEach.call(cartes, (carte) => {
        const clePli = (carte.dataset && carte.dataset.pli)
            || (typeof carte.getAttribute === 'function' ? carte.getAttribute('data-pli') : '');
        if (!clePli || !carte.classList) return;
        plisGabaritAlgo[clePli] = carte.classList.contains('ferme');
    });
}

function pliGabaritAlgoFerme(clePli, fermeParDefaut) {
    return Object.prototype.hasOwnProperty.call(plisGabaritAlgo, clePli)
        ? plisGabaritAlgo[clePli]
        : fermeParDefaut;
}

/**
 * Une section repliable du gabarit — le composant `.carte.accordeon` de l'application
 * (bascule `toggleAccordeonV2`, délégation des clics dans main.js), employé tel quel :
 * la bascule exige une VRAIE carte, et son sélecteur ne s'assouplit pas pour un écran.
 * Règle de Grégoire (3 sept.) : ouvert ce qui porte la note, fermé ce qui porte les mots.
 * Le chevron suit ce que la bascule écrit (▼ ouvert, ▶ replié).
 */
function carteGabaritAlgo(critere, ctx, section, titre, contenu, fermeParDefaut) {
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const clePli = `${critere.id || ('critere-' + ctx.index)}:${section}`;
    const ferme = pliGabaritAlgoFerme(clePli, fermeParDefaut);
    return `
                <div class="carte accordeon gabarit-algo-carte${ferme ? ' ferme' : ''}" data-pli="${esc(clePli)}">
                    <div class="accordeon-header">
                        <h3 class="carte-titre-bleu" style="margin: 0;">
                            <span class="accordeon-chevron">${ferme ? '▶' : '▼'}</span> ${esc(titre)}
                        </h3>
                    </div>
                    <div class="accordeon-contenu">${contenu}</div>
                </div>`;
}

/** Le code qu'un sous-critère affiche : le sien, sinon sa position (comme avant ce lot). */
function codeAfficheSousCritere(sc, scIndex) {
    return (sc.code === undefined || sc.code === null || sc.code === '') ? String(scIndex) : String(sc.code);
}

/**
 * Les SOUS-CRITÈRES — en tête du gabarit, tout de suite sous la rangée du critère
 * (décision de Grégoire, 4 sept.) : ils portent la note, on les relit souvent. À
 * plat, pas repliables : la ligne code · nom · pondération est ce que l'enseignant
 * vérifie quand il fait son total.
 * ↻ LOT A (5 sept. 2026, décision de Grégoire du 4, cadrage codes par grille, points 7-8) :
 * UNE SEULE LISTE — le gabarit rendait le même objet deux fois (« Sous-critères »,
 * puis la carte « Codes d'annotation » avec la couleur et le texte, le nom recopié).
 * Une rangée par sous-critère : code · nom · pondération · pastille de couleur ·
 * chevrons · corbeille ; le texte du code — « Observation », UN champ, `sc.retroaction`
 * — sous un pli par rangée, fermé par défaut (règle des cartes : fermé ce qui porte
 * les mots). La case « Utiliser ces sous-critères comme codes d'annotation » en tête
 * de la liste ; couleur et observation n'apparaissent que si elle est cochée. Rien ne
 * change dans les données : mêmes clés, mêmes handlers, même drapeau. Les plis vivent
 * en mémoire (`plisGabaritAlgo`, par `data-pli`), jamais dans la grille.
 * ↻ #1131 (21 oct. 2026) : en création aussi — les gestes prennent la cible `temp` (`_modifierCritereCible`),
 * comme le barème et les sous-critères des autres types ; rien ne s'écrit avant « Créer la grille ».
 * `esc()` sur tout ce qui vient de la grille — le nom d'un sous-critère est saisi.
 */
function rendreSousCriteresAlgo(critere, ctx) {
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const grilleId = ctx.mode === 'grille' ? ctx.grilleId : 'temp';
    const index = ctx.index;
    const scs = Array.isArray(critere.sousCriteres) ? critere.sousCriteres : [];
    const datas = (scIndex) => `data-on-change="modifierSousCritereHandler" data-grille-id="${esc(grilleId)}" data-critere-index="${index}" data-sc-index="${scIndex}"`;
    const codesActifs = window.codesAnnotation ? window.codesAnnotation.donneSesCodes(critere) : critere.codesDepuisSousCriteres === true;   // 21 oct. : la marque aussi
    const cleCritere = critere.id || ('critere-' + index);

    const lignes = scs.map((sc, scIndex) => `
                        <div class="sous-critere-item avec-outils">
                            <div class="sous-critere-champs-grid ${codesActifs ? 'sous-critere-champs-grid--note-codes' : 'sous-critere-champs-grid--note'}">
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Code</label>
                                    <input type="text"
                                           class="controle-form sous-critere-input-code"
                                           value="${esc(codeAfficheSousCritere(sc, scIndex))}"
                                           ${datas(scIndex)} data-champ="code">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Nom</label>
                                    <input type="text"
                                           class="controle-form sous-critere-input-standard"
                                           value="${esc(sc.nom || '')}"
                                           placeholder="Ex: Syntaxe, Ponctuation..."
                                           ${datas(scIndex)} data-champ="nom">
                                </div>
                                <div class="groupe-form">
                                    <label class="sous-critere-label-petit">Pondération</label>
                                    <input type="number"
                                           class="controle-form sous-critere-input-standard"
                                           value="${esc(sc.ponderation !== undefined ? sc.ponderation : 1.0)}"
                                           min="0"
                                           step="0.1"
                                           placeholder="1.0"
                                           ${datas(scIndex)} data-champ="ponderation" data-parse-float
                                           title="Ex: 1.0 pour erreur complète, 0.5 pour demi-point">
                                </div>${codesActifs ? `
                                <div class="groupe-form sous-critere-couleur-groupe">
                                    <label class="sous-critere-label-petit">Couleur</label>
                                    ${rendreCouleurSousCritere(critere, sc, { grilleId: grilleId, index: index, scIndex: scIndex })}
                                </div>` : ''}
                            </div>
                            <div class="bloc-coin-outils">
                                ${reordonnerBloc({
                                    actionHaut: 'deplacerSousCritereHaut', actionBas: 'deplacerSousCritereBas',
                                    param: grilleId, param2: index, param3: scIndex,
                                    premier: scIndex === 0, dernier: scIndex === scs.length - 1, quoi: 'ce sous-critère'
                                })}
                                ${retirerBloc({ action: 'supprimerSousCritere', param: grilleId, param2: index, param3: scIndex, titre: 'Supprimer ce sous-critère' })}
                            </div>${codesActifs ? rendrePliObservationSousCritere(sc, scIndex, { grilleId: grilleId, index: index, cleCritere: cleCritere }) : ''}
                        </div>`).join('');

    const boutonAjouter = (classe) => `
                    <button class="btn btn-ajouter btn-tres-compact ${classe}"
                            data-action="ajouterSousCritere" data-param="${esc(grilleId)}" data-param2="${index}">
                        + Ajouter un sous-critère
                    </button>`;

    return `
                <div class="sous-criteres-conteneur sous-criteres-conteneur--en-tete">
                    <div class="sous-criteres-header">
                        <h4 class="sous-criteres-titre">
                            Sous-critères
                            ${scs.length > 0 ? `<span class="sous-criteres-compteur">(${scs.length})</span>` : ''}
                        </h4>
                        ${scs.length === 0 ? `
                        <button class="btn btn-secondaire btn-tres-compact sous-criteres-btn-defaut"
                                data-action="initialiserSousCriteresParDefaut" data-param="${esc(grilleId)}" data-param2="${index}">
                            Partir de la liste du français écrit (codes 1 à 10)
                        </button>` : ''}
                    </div>
                    ${rendreActivationCodes(critere, { grilleId: grilleId, index: index })}
                    ${rendrePliAucuneAnnotation(critere, ctx)}
                    ${scs.length > 0 ? `
                    <div class="sous-criteres-liste-conteneur">
                        ${lignes}
                        ${boutonAjouter('sous-criteres-btn-ajouter-liste')}
                    </div>` : `
                    <p class="sous-criteres-vide-message">
                        Aucun sous-critère défini. Utilise les sous-critères par défaut ou crée les tiens.
                    </p>
                    ${boutonAjouter('sous-criteres-btn-ajouter-vide')}`}
                    <p class="sous-criteres-info">
                        💡 Les sous-critères permettent de catégoriser les erreurs avec des pondérations différentes (ex: ponctuation = 0.5 point).
                    </p>
                </div>`;
}

/**
 * Lot A (5 sept. 2026) — le texte d'un code, « Observation », sous un PLI par rangée :
 * le composant `.carte.accordeon` de l'application, employé tel quel (bascule
 * `toggleAccordeonV2` par le dispatcher de main.js, état relevé par
 * `capturerPlisGabaritAlgo` avant chaque redessin, relu par `pliGabaritAlgoFerme`),
 * fermé par défaut — ce qui porte les mots. Sans l'habit de carte : `styles.css`,
 * règle scopée `.sous-critere-pli`. UN champ, `sc.retroaction`, le même handler et
 * les mêmes index que le code, le nom et la pondération de sa rangée.
 * ⛔ Le pli ne porte pas d'`id` : rien ne se persiste, il meurt avec la page.
 */
function rendrePliObservationSousCritere(sc, scIndex, ctx) {
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const clePli = `${ctx.cleCritere}:sc:${sc.id || ('rang-' + scIndex)}`;
    const ferme = pliGabaritAlgoFerme(clePli, true);
    return `
                            <div class="carte accordeon sous-critere-pli${ferme ? ' ferme' : ''}" data-pli="${esc(clePli)}">
                                <div class="accordeon-header">
                                    <h3 class="sous-critere-pli-titre"><span class="accordeon-chevron">${ferme ? '▶' : '▼'}</span> Observation</h3>
                                </div>
                                <div class="accordeon-contenu">
                                    <div class="groupe-form sous-critere-observation-groupe">
                                        <textarea class="controle-form sous-critere-textarea"
                                                  rows="2"
                                                  placeholder="Ex: La plupart des erreurs concernent la construction syntaxique..."
                                                  aria-label="Observation du code ${esc(codeAfficheSousCritere(sc, scIndex))}"
                                                  data-on-change="modifierSousCritereHandler" data-grille-id="${esc(ctx.grilleId)}" data-critere-index="${ctx.index}" data-sc-index="${scIndex}" data-champ="retroaction">${esc(sc.retroaction || '')}</textarea>
                                    </div>
                                </div>
                            </div>`;
}

/**
 * La carte « Bilan » (cadrage du 5 sept. 2026, point 3 ; livrée en 1.120) — « Aucune
 * annotation » ne s'affiche qu'à l'enseignant·e, dans le panneau de correction, quand
 * la copie ne porte ni tampon ni erreur (`evaluation-retroaction.js`, clé `aucune`).
 * Elle ne va pas dans le bilan de l'élève : elle quitte la carte « Bilan » et vit ICI,
 * sous la case « Utiliser ces sous-critères comme codes d'annotation », sous un pli
 * fermé — le même composant que le pli « Observation » des rangées (`.carte.accordeon`,
 * bascule `toggleAccordeonV2`, état en mémoire par `data-pli`, jamais dans la grille).
 * UNE seule maison : `rendreBlocEnoncesAlgo` la filtre. Même helper, même clé
 * `enonces.aucune`, mêmes handlers que dans la carte : rien ne change dans les données.
 * ⚠ Réserve nommée au cadrage : comme la case, elle n'est rendue qu'en ÉDITION d'une
 * grille enregistrée (`rendreSousCriteresAlgo` s'arrête avant, en création) ; la phrase
 * se compose une fois la grille enregistrée.
 */
function rendrePliAucuneAnnotation(critere, ctx) {
    if (typeof window.enoncesAlgo === 'undefined') return '';
    const esc = (t) => (typeof echapperHtml === 'function' ? echapperHtml(String(t == null ? '' : t)) : '');
    const cleAucune = window.enoncesAlgo.listerCles().find((c) => c.cle === 'aucune');
    if (!cleAucune) return '';
    const clePli = `${critere.id || ('critere-' + ctx.index)}:aucune`;
    const ferme = pliGabaritAlgoFerme(clePli, true);
    return `
                    <div class="carte accordeon sous-critere-pli sous-critere-pli--aucune${ferme ? ' ferme' : ''}" data-pli="${esc(clePli)}">
                        <div class="accordeon-header">
                            <h3 class="sous-critere-pli-titre"><span class="accordeon-chevron">${ferme ? '▶' : '▼'}</span> Quand la copie ne porte aucun code</h3>
                        </div>
                        <div class="accordeon-contenu">
                            ${rendreChampEnonceAlgo(cleAucune, window.enoncesAlgo.normaliser(critere), ctx)}
                        </div>
                    </div>`;
}

/**
 * LE GABARIT D'UN CRITÈRE ALGORITHMIQUE, pour les deux écrans de grille — un seul
 * rendu, deux contextes (`ctx.mode` : 'temp' en création, 'grille' en édition).
 * Ordre décidé par Grégoire le 4 sept. : les sous-critères d'abord, sous la rangée
 * du critère ; puis la formule (ouverte : elle porte la note), « Bilan » et
 * « Ce que l'élève lit » (repliées : elles portent les mots). ↻ Lot A du 5 sept. :
 * la carte « Codes d'annotation » n'existe plus — la liste des sous-critères porte
 * tout (`rendreSousCriteresAlgo`). ↻ La carte « Bilan » (1.120) : « Observation »
 * s'appelle « Bilan » et ne porte que ce que l'élève lit dans son bilan ; la clé de
 * pli `commentaire` reste (mémoire des plis seulement). Chaque carte a son
 * titre et sa bande — c'est ce qui sépare la formule de la projection, sans marge
 * ajoutée à part. Rien ici n'écrit dans la grille : l'ordre change le rendu, pas
 * les données, et les `data-critere-index` des handlers restent ceux du critère.
 */
/**
 * « Apporter mon matériel », lot 3b1 (17 oct. 2026) : ce que l'assistant a écrit dans un critère,
 * EN LECTURE — le texte de chaque niveau (`descripteurs.parNiveau`, nommé par l'échelle
 * `descripteurs.echelleId` du trimestre ; le code seul si elle n'existe plus), puis les
 * sous-critères. Rien pour un critère qui n'en porte pas : son HTML reste celui d'avant.
 * Les sous-critères d'un critère algorithmique ont déjà leur place, éditable (gabarit) : pas ici.
 * Titres de Claude Code (17 oct.) ; « Ce qui est attendu à chaque niveau » gardé tel quel par décision de
 * Grégoire, 18 oct.
 * La dissection, lot 13 (19 oct.) : les réponses se MODIFIENT, à leur place (voir « LES RÉPONSES D'UN
 * CRITÈRE » plus bas) ; les sous-critères restent en lecture. Une réponse au texte vide se montre :
 * c'est celle qu'on vient d'ajouter. `ctx` : { grilleId, index }, ceux des handlers du critère ; #1120 (21 oct.) :
 * `grilleId` vaut `temp` pour une grille en création (`afficherCriteresTemp`), où les mêmes sections se montrent.
 */
function rendreAttenduCritere(critere, ctx) {
    const d = critere && critere.descripteurs;
    const analytique = !!critere && critere.type === 'analytique';
    // Les textes par niveau d'une échelle : ceux d'un critère holistique, ou d'un analytique encore lié à
    // une échelle (#1120 : rien n'est caché). Ceux d'un analytique SANS échelle sont son barème, lu plus bas.
    const par = (d && d.parNiveau && (!analytique || d.echelleId)) ? d.parNiveau : {};
    const codes = Object.keys(par);
    const bareme = analytique && ctx ? rendreBaremeCritere(critere, ctx) : '';
    // 20 oct. (Grégoire, 13 h 56) : les sous-critères d'un critère non algorithmique se modifient, et leur
    // section se montre même vide, pour créer le premier. Sans contexte de handlers, rien à modifier : rien.
    const sous = critere && critere.type !== 'algorithmique' && ctx ? rendreSousCriteresCritere(critere, ctx) : '';
    if (!bareme && !codes.length && !sous) return '';
    // 21 oct. (Grégoire) : le barème SOUS les sous-critères — critère, ce qu'on observe, ce que ça vaut ; l'ordre du PDF.
    return `
            <div class="grille-attendu">${rendreAttenduNiveaux(d, codes, ctx)}${sous}${bareme}
            </div>`;
}

/**
 * Le texte de chaque niveau, dans l'ordre de l'échelle ; un code qu'elle ne connaît pas suit, dans l'ordre écrit.
 * Seul le texte se modifie, et l'écran le dit quand une échelle les nomme. Textes de Claude Code (lot 13),
 * validé G. 19 oct. 19 h 29. #1120 : les points, l'ajout et le retrait des réponses sont partis avec elles
 * (le barème les remplace) ; un critère holistique sans échelle garde ses textes, sous leur clé.
 */
function rendreAttenduNiveaux(descripteurs, codes, ctx) {
    if (!codes.length) return '';
    const echelle = descripteurs.echelleId ? (db.getSync(cle('echellesTemplates'), []) || []).find(e => e && e.id === descripteurs.echelleId) : null;
    const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
    const ordre = niveaux.map(n => n.code).filter(c => codes.includes(c)).concat(codes.filter(c => !niveaux.some(n => n.code === c)));
    const nomDe = (c) => { const n = niveaux.find(x => x.code === c); return n && String(n.nom || '').trim() ? n.nom : c; };
    const attrs = (c) => `data-grille-id="${echapperHtml(ctx.grilleId)}" data-critere-index="${ctx.index}" data-reponse-index="${codes.indexOf(c)}" data-reponse-cle="${echapperHtml(c)}"`;
    return `
                <h4 class="grille-attendu-titre">Ce qui est attendu à chaque niveau</h4>${descripteurs.echelleId ? mentionEchelleReponses(echelle) : ''}
                <div class="grille-attendu-niveaux">${ordre.map(c => `
                    <div class="grille-attendu-niveau"><strong>${echapperHtml(nomDe(c))}</strong>
                        <textarea class="controle-form" rows="3" aria-label="Texte du niveau ${echapperHtml(nomDe(c))}" data-on-change="modifierTexteReponseGrilleHandler" ${attrs(c)}>${echapperHtml(String(descripteurs.parNiveau[c] == null ? '' : descripteurs.parNiveau[c]))}</textarea>
                    </div>`).join('')}
                </div>`;
}

function mentionEchelleReponses(echelle) {
    const nomme = echelle && String(echelle.nom || '').trim();
    return `
                <p class="grille-attendu-mention">Les niveaux viennent de ${nomme ? `l’échelle « ${echapperHtml(echelle.nom)} »` : 'l’échelle de la grille'} : ici, seul leur texte se modifie.</p>`;
}

/*
 * LES SOUS-CRITÈRES D'UN CRITÈRE NON ALGORITHMIQUE — 20 oct. 2026 (Grégoire, 13 h 56). Ils se modifient,
 * à leur place : le nom seul se montre ; on ajoute, on retire, on réordonne, par les gestes du gabarit
 * algorithmique (`ajouterSousCritere`, `modifierSousCritere`, `supprimerSousCritere`,
 * `deplacerSousCritereHaut/Bas`), qui écrivent la forme de la dissection (id, code, nom, ponderation 1.0,
 * retroaction). Bornes : celles de l'assistant (`MAX_NOM`, `MAX_SOUS_CRITERES`), pour tout critère.
 * ⚠ Ils ne deviennent pas des codes d'annotation : `codes-annotation.js` ne lit que le critère algorithmique
 * activé (sentinelle `sous-criteres-editables`).
 * Textes de Claude Code, validés G. 20 oct. 14 h 35 : le nom de chaque champ et les deux refus ; le titre et le bouton sont
 * ceux du gabarit algorithmique.
 */
const TEXTES_SOUS_CRITERES = {
    titre: 'Sous-critères',
    ajouter: '+ Ajouter un sous-critère',
    nom: (n) => 'Nom du sous-critère ' + n
};
const REFUS_SOUS_CRITERES = {
    trop: (max) => 'Au plus ' + max + ' sous-critères par critère',
    nomLong: (max) => 'Le nom d’un sous-critère fait ' + max + ' caractères au plus'
};

/** Les bornes de l'assistant, lues chez lui (une seule source) ; sans lui, aucune borne. */
function _bornesSousCriteres() {
    const A = window.materielAssistant;
    return { nom: (A && A.MAX_NOM) || Infinity, nombre: (A && A.MAX_SOUS_CRITERES) || Infinity };
}

/**
 * Le code d'un sous-critère neuf : le plus grand code numérique du critère, plus un ; le rang s'il n'y en a aucun.
 * F1 du verdict du 20 oct. : le rang seul (`length`) redonnait, après un retrait, un code déjà porté (0, 1, 2 ; on
 * retire 0 ; on ajoute : « 2 » deux fois) — inerte hors algorithmique, mais le second ne serait pas posable si le
 * critère le devenait (`_depuisSousCriteres` : le premier gagne).
 */
function codeSousCritereNeuf(scs) {
    const numeros = scs.map(sc => String(sc && sc.code != null ? sc.code : '').trim()).filter(c => /^\d+$/.test(c)).map(Number);
    return String(numeros.length ? Math.max(...numeros) + 1 : scs.length);
}

/** Le refus d'un sous-critère de plus, quand le critère en porte déjà `n` ; sinon `null`. */
function refusAjoutSousCritere(n) {
    const max = _bornesSousCriteres().nombre;
    return n >= max ? REFUS_SOUS_CRITERES.trop(max) : null;
}

/** Le refus d'un nom de sous-critère trop long ; sinon `null`. */
function refusNomSousCritere(nom) {
    const max = _bornesSousCriteres().nom;
    return String(nom == null ? '' : nom).length > max ? REFUS_SOUS_CRITERES.nomLong(max) : null;
}

function rendreSousCriteresCritere(critere, ctx) {
    const scs = Array.isArray(critere.sousCriteres) ? critere.sousCriteres : [];
    const T = TEXTES_SOUS_CRITERES;
    const max = _bornesSousCriteres().nom;
    const lignes = scs.map((sc, i) => `
                    <div class="grille-sous-critere">
                        <input type="text" class="controle-form" value="${echapperHtml((sc && sc.nom) || '')}"${max !== Infinity ? ` maxlength="${max}"` : ''}
                               aria-label="${echapperHtml(T.nom(i + 1))}" data-champ="nom"
                               data-on-change="modifierSousCritereHandler" data-grille-id="${echapperHtml(ctx.grilleId)}" data-critere-index="${ctx.index}" data-sc-index="${i}">
                        <div class="grille-sous-critere-outils">
                            ${reordonnerBloc({
                                actionHaut: 'deplacerSousCritereHaut', actionBas: 'deplacerSousCritereBas',
                                param: ctx.grilleId, param2: ctx.index, param3: i,
                                premier: i === 0, dernier: i === scs.length - 1, quoi: 'ce sous-critère'
                            })}
                            ${retirerBloc({ action: 'supprimerSousCritere', param: ctx.grilleId, param2: ctx.index, param3: i, titre: 'Supprimer ce sous-critère' })}
                        </div>
                    </div>`).join('');
    return `
                <h4 class="grille-attendu-titre">${echapperHtml(T.titre)}</h4>
                <div class="grille-sous-criteres">${lignes}</div>
                <div><button type="button" class="btn btn-secondaire" data-action="ajouterSousCritere" data-param="${echapperHtml(ctx.grilleId)}" data-param2="${ctx.index}">${echapperHtml(T.ajouter)}</button></div>`;
}

/*
 * LES TEXTES PAR NIVEAU D'UN CRITÈRE — la dissection, lot 13 (19 oct. 2026), réduit au lot 1 du barème.
 * Une entrée de `descripteurs.parNiveau` : sa CLÉ est le code d'un niveau, sa valeur son texte ; seul
 * le texte se modifie. ⚠ Aucune évaluation ne lit ces textes : une copie notée garde son niveau.
 * La fonction pure rend `{ parNiveau }` (un objet NEUF, dans l'ordre) ou `{ refuse }` — `null` quand
 * le niveau visé n'est plus à sa place : rien n'est écrit, rien n'est dit.
 */
const MAX_TEXTE_REPONSE = 5000;
// Texte du lot 13, validé G. 19 oct. 19 h 29.
const REFUS_REPONSES = {
    texteLong: 'Une réponse fait 5 000 caractères au plus'
};

function _reponseVisee(par, index, cleLue) {
    return Object.keys(par || {})[index] === cleLue;
}

function reponseTexteModifie(par, index, cleLue, texte) {
    if (!_reponseVisee(par, index, cleLue)) return { refuse: null };
    const t = String(texte == null ? '' : texte).trim();
    if (t.length > MAX_TEXTE_REPONSE) return { refuse: REFUS_REPONSES.texteLong };
    return { parNiveau: Object.assign({}, par, { [cleLue]: t }) };
}

/**
 * Une écriture des textes par niveau du critère, sérialisée (#510). Un critère analytique sans échelle
 * n'est pas touché ici : ses anciennes réponses sont son barème (`_modifierBaremeCritere`).
 */
async function _modifierReponsesCritere(grilleId, critereIndex, operation) {
    let resultat = { refuse: null }, grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === grilleId);
        const c = g && g.criteres && g.criteres[critereIndex];
        if (!c || !c.descripteurs || !c.descripteurs.parNiveau) return undefined;
        if (c.type === 'analytique' && !c.descripteurs.echelleId) return undefined;
        resultat = operation(c);
        if (!resultat.parNiveau) return undefined;
        c.descripteurs.parNiveau = resultat.parNiveau;
        g.dateModification = new Date().toISOString();
        grille = g;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (grille && grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) grilleTemplateActuelle = grille;
    return { resultat, grille };
}

function modifierTexteReponseGrilleHandler(el) {
    const d = { grilleId: el.dataset.grilleId, critereIndex: parseInt(el.dataset.critereIndex),
        index: parseInt(el.dataset.reponseIndex), cle: el.dataset.reponseCle };
    return _modifierReponsesCritere(d.grilleId, d.critereIndex,
        c => reponseTexteModifie(c.descripteurs.parNiveau, d.index, d.cle, el.value))
        .then(({ resultat }) => marquerChampRefuse(el, resultat.refuse));
}

/*
 * LE BARÈME D'UN CRITÈRE ANALYTIQUE — #1120, lot 1 (20 oct. 2026), consigne
 * `CONSIGNE-LOT-2026-10-20-bareme-1-editeur.md`. Il REMPLACE les réponses du lot 13 pour les critères
 * analytiques. La lecture, les refus et la conversion sont ceux de `js/bareme.js` (une seule source).
 * Chaque tranche : son nom (facultatif), ses points (un nombre ou deux bornes), son texte.
 * LA CONVERSION : un critère qui porte encore ses réponses les montre lues comme un barème ; sa première
 * modification écrit `bareme` tel qu'affiché et retire `parNiveau` de CE critère, dans la même écriture
 * (`bareme.ecrireSurCritere`). Rien ne se convertit sans geste.
 * UNE TRANCHE NEUVE s'écrit aussitôt, sans points, « à compléter » ; son nom, ses points et son texte au
 * fil de la saisie, comme ceux de toute tranche (C1 du verdict du 20 oct. : « tout enregistré seul »,
 * règle de Grégoire du 19 oct. pour cet éditeur ; l'iPad recharge une page mise en arrière-plan, #1031).
 * Un refus de points refuse les points seuls : le nom et le texte déjà écrits restent.
 * ⚠ Aucun calcul ne lit le barème (invariant 1) : une copie notée garde ses points, quoi qu'on change ici.
 * Textes (D1 à D3) : validé G. 20 oct. 9 h 23 (plans de travail/TEXTES-2026-10-20-bareme.md). Lot 2 : l'aide « i »
 * `grille-bareme` à côté du titre, et les bulles E1 à E6 (`BULLES_BAREME`, accompagnement-contenu-hover.js).
 */
const TEXTES_BAREME = {
    titre: 'Barème',
    nom: 'Nom',
    points: 'Points',
    texte: 'Texte',
    ajouter: '+ Ajouter une tranche',
    retirer: 'Retirer cette tranche',
    aCompleter: 'à compléter',
    horsBareme: 'hors barème',
    confirmer: 'Es-tu sûr de vouloir retirer cette tranche ?',
    // Complément du 21 oct., texte validé G. 8 h 11 : la seule dépendance d'ordre (les points d'une tranche vont
    // de 0 à la pondération ; à 0, tous sont refusés). Une aide en ligne, qui ne bloque rien.
    pointsDAbord: 'Donne d’abord ses points à ce critère : ceux de ses tranches iront de 0 à ce nombre.'
};

// #1120, lot 2 : la bulle de chaque champ, de « + Ajouter une tranche » et de chaque marque (clés du catalogue).
const BULLES_BAREME = {
    nom: 'bareme-tranche-nom', points: 'bareme-tranche-points', texte: 'bareme-tranche-texte', ajouter: 'bareme-ajouter-tranche',
    [TEXTES_BAREME.aCompleter]: 'bareme-a-completer', [TEXTES_BAREME.horsBareme]: 'bareme-hors-bareme'
};

function rendreBaremeCritere(critere, ctx) {
    const lignes = window.bareme.tranchesDuCritere(critere).map(t => trancheBaremeHtml(t, critere, ctx));
    return `
                <h4 class="grille-attendu-titre">${echapperHtml(TEXTES_BAREME.titre)} <span class="primo-aide" data-target="grille-bareme"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span></h4>
                <p class="grille-attendu-mention" data-points-d-abord="${echapperHtml(String(ctx.index))}"${_aDesPoints(critere) ? ' hidden' : ''}>${echapperHtml(TEXTES_BAREME.pointsDAbord)}</p>
                <div class="grille-bareme">${lignes.join('')}
                </div>
                <div><button type="button" class="btn btn-secondaire" data-action="ajouterTrancheBareme" data-param="${echapperHtml(ctx.grilleId)}" data-param2="${ctx.index}" data-tooltip="${echapperHtml(BULLES_BAREME.ajouter)}">${echapperHtml(TEXTES_BAREME.ajouter)}</button></div>`;
}

function _aDesPoints(critere) {
    return Number(critere && critere.ponderation) > 0;
}

/**
 * La phrase « Donne d'abord ses points… » suit la pondération sans redessiner la liste (le focus est déjà dans le
 * champ suivant) : appelée par les deux handlers de pondération, en création et en modification.
 */
function suivrePointsDAbord(index, critere) {
    const p = [...document.querySelectorAll('#listeCriteres [data-points-d-abord]')].find(x => x.dataset.pointsDAbord === String(index));
    if (p) p.hidden = _aDesPoints(critere);
}

/** La marque d'une tranche : « à compléter » (sans points), « hors barème » (au-delà de la pondération), ou rien. */
function marqueTranche(t, critere) {
    const B = window.bareme;
    return B.aCompleter(t) ? TEXTES_BAREME.aCompleter : B.horsBareme(t, critere.ponderation) ? TEXTES_BAREME.horsBareme : '';
}

const _idMarqueTranche = (index, id) => `bareme-marque-${index}-${id}`;

/**
 * Une tranche, sur UNE ligne (20 oct., Grégoire, 13 h 56 — le modèle de la rangée du critère) : nom, points,
 * texte, sa marque, la corbeille. Le texte est un champ d'une ligne qui s'agrandit avec son contenu
 * (`ajusterHauteursAuto`), sans rien cacher ; sur l'iPad en long, il passe sous le nom et les points.
 */
function trancheBaremeHtml(t, critere, ctx) {
    const marque = marqueTranche(t, critere);
    const idMarque = _idMarqueTranche(ctx.index, t.id);
    const attrs = `data-grille-id="${echapperHtml(ctx.grilleId)}" data-critere-index="${ctx.index}" data-critere-id="${echapperHtml(critere.id || '')}" data-tranche-id="${echapperHtml(t.id)}" data-on-change="modifierTrancheBaremeHandler"`;
    return `
                    <div class="grille-bareme-tranche" data-tranche-id="${echapperHtml(t.id)}">
                        <label class="grille-bareme-champ grille-bareme-nom">${echapperHtml(TEXTES_BAREME.nom)}
                            <input type="text" class="controle-form" value="${echapperHtml(t.nom)}" data-champ="nom" data-tooltip="${echapperHtml(BULLES_BAREME.nom)}" ${attrs}>
                        </label>
                        <label class="grille-bareme-champ grille-bareme-points">${echapperHtml(TEXTES_BAREME.points)}
                            <input type="text" inputmode="decimal" class="controle-form" value="${echapperHtml(window.bareme.pointsEnTexte(t))}" data-champ="points" data-tooltip="${echapperHtml(BULLES_BAREME.points)}"${marque ? ` aria-describedby="${echapperHtml(idMarque)}"` : ''} ${attrs}>
                        </label>
                        <label class="grille-bareme-champ grille-bareme-texte">${echapperHtml(TEXTES_BAREME.texte)}
                            <textarea class="controle-form" rows="1" data-hauteur-auto data-champ="texte" data-tooltip="${echapperHtml(BULLES_BAREME.texte)}" ${attrs}>${echapperHtml(t.texte)}</textarea>
                        </label>
                        <div class="grille-bareme-marque-cellule">${marque ? `
                            <p class="grille-bareme-marque" id="${echapperHtml(idMarque)}" data-tooltip="${echapperHtml(BULLES_BAREME[marque])}">${echapperHtml(marque)}</p>` : ''}
                        </div>
                        ${retirerBloc({ action: 'retirerTrancheBareme', param: ctx.grilleId, param2: ctx.index, param3: t.id, titre: TEXTES_BAREME.retirer })}
                    </div>`;
}

/*
 * UN CHAMP D'UNE LIGNE QUI S'AGRANDIT AVEC SON CONTENU (20 oct.) — un `textarea[data-hauteur-auto]` prend la
 * hauteur de son texte : au rendu, à la frappe, et quand la liste change de largeur (rotation de l'iPad, panneau
 * rendu caché puis montré : `ResizeObserver`). Hors de la page (largeur nulle), rien n'est touché : le champ
 * garde sa hauteur et défile (`overflow-y: auto`), il ne coupe jamais le texte.
 */
function ajusterHauteurAuto(el) {
    if (!el || !el.clientWidth) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + el.offsetHeight - el.clientHeight) + 'px';
}

const _hauteurAutoBranchee = new WeakSet();   // un seul jeu d'écouteurs par liste, quel que soit le nombre de rendus

function ajusterHauteursAuto(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    container.querySelectorAll('textarea[data-hauteur-auto]').forEach(ajusterHauteurAuto);
    if (_hauteurAutoBranchee.has(container) || typeof container.addEventListener !== 'function') return;
    _hauteurAutoBranchee.add(container);
    container.addEventListener('input', (e) => {
        if (e.target && e.target.matches && e.target.matches('textarea[data-hauteur-auto]')) ajusterHauteurAuto(e.target);
    });
    if (typeof ResizeObserver === 'function') {
        let largeur = container.clientWidth;
        new ResizeObserver(() => {
            if (container.clientWidth === largeur) return;
            largeur = container.clientWidth;
            container.querySelectorAll('textarea[data-hauteur-auto]').forEach(ajusterHauteurAuto);
        }).observe(container);
    }
}

/**
 * Une écriture du barème d'un critère, sur sa cible (`temp` en création, ou l'id d'une grille enregistrée :
 * `_modifierCritereCible`). `operation(tranches, critere)` rend ce que rendent les gestes de `bareme.js` ;
 * sans `tranches`, rien n'est écrit. Le critère visé est relu au moment d'écrire : analytique, et le même
 * (`_memeCritere`, par son identifiant) qu'au moment du geste. Rend `{ resultat, critere }` (le critère écrit, ou null).
 */
async function _modifierBaremeCritere(cible, critereIndex, critereId, operation) {
    let resultat = { refuse: null };
    const critere = await _modifierCritereCible(cible, critereIndex, (c) => {
        if (c.type !== 'analytique' || !_memeCritere(c, critereId ? { id: critereId } : null)) return false;
        resultat = operation(window.bareme.tranchesDuCritere(c), c);
        if (!resultat.tranches) return false;
        window.bareme.ecrireSurCritere(c, resultat.tranches);
    });
    return { resultat, critere };
}

function _dataTranche(el) {
    return { grilleId: el.dataset.grilleId, critereIndex: parseInt(el.dataset.critereIndex), critereId: el.dataset.critereId || '',
        id: el.dataset.trancheId, champ: el.dataset.champ };
}

/**
 * Des points écrits : ils se relisent (« 3 à 4 »), et la marque suit ce que la tranche est devenue (posée
 * quand ses points sont effacés, retirée quand elle en reçoit), sans rendre la liste : le focus est ailleurs.
 */
function _apresEcriturePoints(el, d, c) {
    const bloc = el.closest('.grille-bareme-tranche');
    const t = window.bareme.tranchesDuCritere(c).find(x => x.id === d.id);
    if (!bloc || !t) return;
    el.value = window.bareme.pointsEnTexte(t);
    const texte = marqueTranche(t, c), idMarque = _idMarqueTranche(d.critereIndex, t.id);
    let p = bloc.querySelector('.grille-bareme-marque');
    if (!texte) {
        if (p) p.remove();
        el.removeAttribute('aria-describedby');
        return;
    }
    if (!p) {
        p = document.createElement('p');
        p.className = 'grille-bareme-marque';
        p.id = idMarque;
        bloc.querySelector('.grille-bareme-marque-cellule').append(p);
    }
    p.textContent = texte;
    p.dataset.tooltip = BULLES_BAREME[texte];
    el.setAttribute('aria-describedby', idMarque);
}

/** Un champ d'une tranche : nom, points ou texte. */
function modifierTrancheBaremeHandler(el) {
    const B = window.bareme, d = _dataTranche(el);
    return _modifierBaremeCritere(d.grilleId, d.critereIndex, d.critereId, (tranches, c) => (
        d.champ === 'points' ? B.modifierPoints(tranches, d.id, el.value, c.ponderation)
            : d.champ === 'nom' ? B.modifierNom(tranches, d.id, el.value)
                : B.modifierTexte(tranches, d.id, el.value)))
        .then(({ resultat, critere }) => {
            marquerChampRefuse(el, resultat.refuse);
            if (critere && d.champ === 'points') _apresEcriturePoints(el, d, critere);
        });
}

/** « + Ajouter une tranche » : une tranche neuve, en dernier, écrite aussitôt (« à compléter ») ; le focus sur son nom. */
async function ajouterTrancheBareme(cible, critereIndex) {
    const critereLu = _critereLuCible(cible, critereIndex);
    if (!critereLu || critereLu.type !== 'analytique') return;
    const id = genererIdUnique('TR_');
    const { resultat, critere } = await _modifierBaremeCritere(cible, critereIndex, critereLu.id || '',
        (tranches) => window.bareme.ajouter(tranches, id));
    if (resultat.refuse && window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(resultat.refuse), undefined, cle('grillesTemplates'));
    }
    if (!critere) return;
    await _redessinerCible(cible);
    const champ = [...document.querySelectorAll('#listeCriteres [data-champ="nom"][data-tranche-id]')]
        .find(x => x.dataset.critereIndex === String(critereIndex) && x.dataset.trancheId === id);
    if (champ) champ.focus();
}

/** La corbeille d'une tranche : le geste et la confirmation du retrait d'un critère (`supprimerCritereGrille`). */
async function retirerTrancheBareme(cible, critereIndex, trancheId) {
    const critereLu = _critereLuCible(cible, critereIndex);
    if (!critereLu || critereLu.type !== 'analytique') return;
    const id = String(trancheId);
    if (!window.bareme.tranchesDuCritere(critereLu).some(t => t.id === id)) return;
    if (!confirm(TEXTES_BAREME.confirmer)) return;
    const { critere } = await _modifierBaremeCritere(cible, critereIndex, critereLu.id || '',
        (tranches, c) => (_memeCritere(c, critereLu) ? window.bareme.retirer(tranches, id) : { refuse: null }));
    if (critere) await _redessinerCible(cible);
}

function rendreCartesGabaritAlgo(critere, ctx) {
    if (!critere || critere.type !== 'algorithmique') return '';
    return `
            <div class="gabarit-algo" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--bordure-claire);">
                ${rendreSousCriteresAlgo(critere, ctx)}
                ${carteGabaritAlgo(critere, ctx, 'formule', 'Formule', rendreBlocFormuleAlgo(critere, ctx), false)}
                ${carteGabaritAlgo(critere, ctx, 'commentaire', 'Bilan', rendreBlocEnoncesAlgo(critere, ctx), true)}
                ${carteGabaritAlgo(critere, ctx, 'projection', 'Ce que l\'élève lit', rendreBlocProjectionAlgo(critere, ctx), true)}
            </div>`;
}

/**
 * #667 — Écrit le modèle de formule et ses paramètres sur un critère ENREGISTRÉ.
 *
 * Une écriture unique plutôt que trois appels à `modifierCritereGrille` : le
 * modèle, ses paramètres et le miroir `facteurNormalisation` doivent atterrir
 * ensemble. Trois écritures séparées laisseraient, entre deux, une grille dont
 * le modèle ne correspond pas à ses paramètres.
 */
async function modifierFormuleCritereGrille(grilleId, critereIndex, modeleId, params) {
    let grilleModifiee = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === grilleId);
        if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return undefined;
        window.formulesAlgo.appliquerAuCritere(grille.criteres[critereIndex], modeleId, params);
        grille.dateModification = new Date().toISOString();
        grilleModifiee = grille;
        return grilles;
    }, [], { geste: 'Modifier la grille' });

    if (!grilleModifiee) return null;
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grilleModifiee;
    }
    return grilleModifiee;
}

/**
 * #667 — Change UN paramètre de formule d'un critère enregistré.
 *
 * La lecture des paramètres actuels et leur réécriture se font DANS le
 * mutateur : lire d'abord la grille pour fusionner ensuite, hors du verrou,
 * rejouerait le bug #510 — deux champs quittés coup sur coup liraient le même
 * instantané et le second écraserait le premier, sans erreur ni message.
 */
async function modifierParamFormuleCritereGrille(grilleId, critereIndex, cleParam, valeur) {
    let grilleModifiee = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === grilleId);
        if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return undefined;
        const critere = grille.criteres[critereIndex];
        const f = window.formulesAlgo.normaliser(critere);
        const params = Object.assign({}, f.params);
        params[cleParam] = valeur;
        window.formulesAlgo.appliquerAuCritere(critere, f.modeleId, params);
        grille.dateModification = new Date().toISOString();
        grilleModifiee = grille;
        return grilles;
    }, [], { geste: 'Modifier la grille' });

    if (!grilleModifiee) return null;
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grilleModifiee;
    }
    return grilleModifiee;
}

/**
 * La dissection, lot 9b (`CONSIGNE-LOT-2026-10-18-dissection-9b-la-garde.md`, décision de Grégoire, 18 oct.,
 * 18 h 32) : la pondération d'un critère, saisie ou VIDÉE. Vidé, le champ écrit `null` (plus NaN) et pose la
 * marque `ponderationACompleter` : tant qu'elle y est, la note d'une copie affiche « -- » (`calculerPortee`).
 * Un nombre saisi retire la marque. Seuls ce geste et la création de la dissection posent la marque : une
 * grille existante ne la porte pas, et ses notes ne changent pas.
 */
function poserPonderation(critere, valeur) {
    const n = (valeur === '' || valeur == null) ? NaN : Number(valeur);
    if (Number.isFinite(n)) {
        critere.ponderation = n;
        delete critere.ponderationACompleter;
    } else {
        critere.ponderation = null;
        critere.ponderationACompleter = true;
    }
}

function modifierCritereTemp(index, champ, valeur) {
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    if (champ === 'ponderation') poserPonderation(window.tempCriteres[index], valeur);
    else window.tempCriteres[index][champ] = valeur;
    if (champ === 'type') avecProjectionNeuve(window.tempCriteres[index]);   // lot 4, C.3
}

/**
 * Ajoute un nouveau critère temporaire
 */
function ajouterCritereTemp() {
    if (!window.tempCriteres) window.tempCriteres = [];
    window.tempCriteres.push(avecProjectionNeuve({
        id: genererIdUnique('TEMP_CR_'),
        nom: '',
        type: typeCritereParDefautEnCours(),
        ponderation: 0,
        description: '',
        niveauSOLO: niveauSOLOCritereNeuf(observationSOLOActive())   // #1117
    }));
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
        const enPoints = ponderationEnPoints(window.tempCriteres);
        totalElement.textContent = texteDuTotal(window.tempCriteres, total);
        totalElement.style.color = enPoints ? '' : total === 100 ? 'var(--vert-accent)' : 'var(--orange-accent)';
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
    let grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === grilleId);
        if (!g || !g.criteres || !g.criteres[index] || !g.criteres[index - 1]) return undefined;

        [g.criteres[index - 1], g.criteres[index]] = [g.criteres[index], g.criteres[index - 1]];
        g.dateModification = new Date().toISOString();
        grille = g;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (!grille) return;

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    afficherCriteresGrille(grille);
}

/**
 * §8 f (4 sept. 2026) — DÉPLACER UN SOUS-CRITÈRE, comme un critère. ▣ Mesuré avant
 * d'écrire : le code d'annotation d'un sous-critère est PORTÉ par lui (`sc.code`, écrit à
 * sa naissance ; la palette et le calcul le lisent par `s.code === code`, jamais par le
 * rang) — déplacer ne change pas le sens des tampons déjà posés (`errfr_<code>`). Seul
 * l'ordre d'affichage change, dans la grille ; la carte des codes le suit.
 */
async function _deplacerSousCritere(cible, critereIndex, scIndex, vers) {
    // #1120 (21 oct.) : `cible`, `temp` en création ou l'id d'une grille enregistrée (`_modifierCritereCible`).
    const critere = await _modifierCritereCible(cible, critereIndex, (c) => {
        const scs = c.sousCriteres;
        if (!Array.isArray(scs) || !scs[scIndex] || !scs[scIndex + vers]) return false;
        [scs[scIndex], scs[scIndex + vers]] = [scs[scIndex + vers], scs[scIndex]];
    });
    if (critere) await _redessinerCible(cible);
}
async function deplacerSousCritereHaut(cible, critereIndex, scIndex) { await _deplacerSousCritere(cible, critereIndex, scIndex, -1); }
async function deplacerSousCritereBas(cible, critereIndex, scIndex) { await _deplacerSousCritere(cible, critereIndex, scIndex, 1); }

/**
 * Déplace un critère de grille vers le bas
 */
async function deplacerCritereGrilleBas(grilleId, index) {
    let grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === grilleId);
        if (!g || !g.criteres) return undefined;
        // Le dernier critère ne descend pas : refus, l'écriture est annulée.
        if (index >= g.criteres.length - 1) return undefined;

        [g.criteres[index], g.criteres[index + 1]] = [g.criteres[index + 1], g.criteres[index]];
        g.dateModification = new Date().toISOString();
        grille = g;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (!grille) return;

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
    rendreModeFicheGrille(false);

    // Définir la grille actuelle (objet complet, pas juste l'ID)
    grilleTemplateActuelle = grille;

    // Remplir le formulaire
    document.getElementById('nomGrilleTemplate').value = grille.nom || '';
    document.getElementById('descriptionGrille').value = grille.description || '';
    // Lot 1 (3 sept. 2026), retouché le 4 : le menu montre ce que les DONNÉES portent —
    // « Non précisé » quand `grille.type` est absent. La déduction se dit sous le menu
    // (rendue par afficherCriteresGrille, qui suit chaque changement de critère).
    rendreMenuTypeGrille(grille.type);

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
        modifierListe: (mutateur) => db.modifier(cle('grillesTemplates'), mutateur, []), // security-ok: la liste écrite est la collection lue en stockage, augmentée d'une copie forgée localement par forkerItem — aucune source externe
        rafraichirListe: async () => { await afficherListeGrilles(); },
        chargerPourModif: async (idCopie) => { await chargerGrillePourModif(idCopie); },
        champFocus: 'nomGrilleTemplate'
    });
}

function afficherCriteresGrille(grille) {
    rendrePrecisionTypeGrille(grille);
    const container = document.getElementById('listeCriteres');
    if (!container) return;
    capturerPlisGabaritAlgo(container);

    if (!grille.criteres || grille.criteres.length === 0) {
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun critère défini</p>';
        return;
    }

    const html = grille.criteres.map((critere, index) => `
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); border: 1px solid var(--bordure-claire); border-radius: 6px; margin-bottom: 10px;">
            <div class="bloc-coin-outils">
                ${window.boutonsReordonnerBloc({
                    actionHaut: 'deplacerCritereGrilleHaut', actionBas: 'deplacerCritereGrilleBas',
                    param: grille.id,
                    param2: index,
                    premier: index === 0, dernier: index === grille.criteres.length - 1, quoi: 'ce critère'
                })}
                ${window.boutonRetirerBloc({
                    action: 'supprimerCritereGrille',
                    param: grille.id,
                    param2: index,
                    titre: 'Supprimer ce critère'
                })}
            </div>
            <div class="critere-rangee" style="display: grid; grid-template-columns: 2fr 140px 90px 150px 3fr; gap: 12px; align-items: end;">
                <div class="groupe-form">
                    <label data-tooltip="cn-grille-critere" style="font-size: 0.85rem; color: var(--gris-moyen);">Nom du critère <span class="champ-requis u-texte-medium" title="Champ obligatoire">*</span></label>
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
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">${ponderationEnPoints(grille.criteres) ? 'Points' : 'Pond. (%)'}</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(critere.ponderation)}"
                           min="0"
                           max="100"
                           data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="ponderation" data-parse-int>
                </div>
                ${menuComplexiteSOLOCritere(critere, `data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}"`)}
                <div class="groupe-form">
                    <label style="font-size: 0.85rem; color: var(--gris-moyen);">Description</label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(critere.description || '')}"
                           data-on-change="modifierCritereGrilleHandler" data-grille-id="${grille.id}" data-critere-index="${index}" data-champ="description">
                </div>
            </div>
            ${rendreCartesGabaritAlgo(critere, { mode: "grille", index: index, grilleId: grille.id })}${rendreAttenduCritere(critere, { grilleId: grille.id, index: index })}
        </div>
    `).join('');

    // Ajouter un bouton pour ajouter un nouveau critère
    const btnAjouterCritere = `
        <button class="btn btn-principal u-mt-10" data-action="ajouterCritereGrille" data-param="${grille.id}">
            + Ajouter un critère
        </button>
    `;

    container.innerHTML = html + btnAjouterCritere;
    ajusterHauteursAuto(container);
    monterVuesBadges(container);

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

    if (ponderationEnPoints(grille && grille.criteres)) {
        totalElement.textContent = texteDuTotal(grille.criteres, total);
        totalElement.style.color = '';
        return;
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

/**
 * #516 — CE QUE LA LÉGENDE PROMET, ET QUE LE CODE DOIT TENIR.
 * Le libellé exact est repris de la validation qui vivait dans du code mort :
 * elle disait déjà la bonne chose, personne ne l'exécutait.
 */
const REFUS_NOM_CRITERE = 'Le nom du critère est obligatoire';

async function modifierCritereGrille(grilleId, critereIndex, champ, valeur) {
    // ⚠⚠ #516 (26 août 2026) — L'ASTÉRISQUE PROMETTAIT UN REFUS QUI N'EXISTAIT PAS.
    //
    // La légende de #506 dit : « Champ obligatoire — l'enregistrement est refusé
    // sans lui. » Il ne l'était pas : une grille dont un critère avait un nom
    // VIDE s'enregistrait sans un mot. La « preuve » qu'en donnait la sentinelle
    // vivait dans `sauvegarderCritere()`, qui lit `#critereNom` — un id absent
    // d'index.html, dans une fonction sans appelant vivant. Le test gardait du
    // code mort ; la promesse, elle, n'était tenue nulle part.
    //
    // ⚠ ON REFUSE L'ÉCRITURE, ON NE BLOQUE PAS LA FRAPPE. Ces champs
    // s'enregistrent seuls au blur : restaurer l'ancienne valeur dans le champ
    // ferait se re-remplir sous les doigts de quelqu'un qui vide pour retaper.
    // Le nom vide n'atteint donc pas les données, l'écran garde ce qui est tapé,
    // et le champ est marqué pour que l'écart soit VU (cf. le handler).
    if (champ === 'nom' && !String(valeur == null ? '' : valeur).trim()) {
        return { refuse: REFUS_NOM_CRITERE };
    }

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
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === grilleId);
        if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return undefined;

        // Mettre à jour le champ (lot 9b : la pondération, par `poserPonderation`)
        if (champ === 'ponderation') poserPonderation(grille.criteres[critereIndex], valeur);
        else grille.criteres[critereIndex][champ] = valeur;
        if (champ === 'type') avecProjectionNeuve(grille.criteres[critereIndex]);   // lot 4, C.3
        grille.dateModification = new Date().toISOString();
        grilleModifiee = grille;
        return grilles;
    }, [], { geste: 'Modifier la grille' });

    if (!grilleModifiee) return { refuse: null };   // grille ou critère introuvable
    const grille = grilleModifiee;

    // FIX (10 jan 2026) : Synchroniser grilleTemplateActuelle pour éviter l'écrasement
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grille;
    }

    // Recalculer et afficher la pondération totale
    if (champ === 'ponderation') {
        calculerEtAfficherTotalPonderation(grille);
        suivrePointsDAbord(critereIndex, grille.criteres[critereIndex]);
    }

    return { ok: true };
}

/* ===============================
   GESTION DES SOUS-CRITÈRES
   =============================== */

/**
 * LA LISTE DU FRANÇAIS ÉCRIT (21 oct. 2026, consigne du lot de mots) : celle de Grégoire, la seule
 * définition du code applicatif. Les sous-critères 1 à 10 du critère « Français écrit » de la grille
 * démo « Grille-5 FR-ALGO-20 H26 » (`pack-demo-10.js`), à l'identique, SANS le code 0 : ses grilles
 * n'en ont plus, « Quand la copie ne porte aucun code » le remplace. Le pack garde sa propre copie :
 * c'est une donnée, comme la grille d'un utilisateur (l'égalité est verrouillée par un banc Vitest).
 * Une grille qui porte déjà des sous-critères les garde : seul ce que crée le bouton change.
 */
const LISTE_FRANCAIS_ECRIT = Object.freeze([
    { id: 'sc_1', code: '1', nom: 'Construction syntaxique ou accord du verbe', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent la construction syntaxique (sujet, prédicat, complément de phrase ou autres compléments) ou l\'accord du verbe (accord avec le sujet, conjugaison, etc.). Il arrive que certaines phrases sont incomplètes ou confuses, ou encore que le lien entre le verbe et son sujet soit erroné. Vérifie que chaque phrase a bien un sujet et un verbe (et parfois un complément) en les identifiant dans l\'interligne. Assure-toi qu\'il n\'y a pas trop de compléments (ce qui pourrait rendre la phrase confuse). Vérifie également la conjugaison et l\'accord des verbes en utilisant des tableaux de conjugaison.' },
    { id: 'sc_2', code: '2', nom: 'Subordonnées employées seules', ponderation: 1,
      retroaction: 'La plupart des erreurs sont causées par des subordonnées employées seules. Elles sont construites comme des compléments qui ne se rattachent à aucun prédicat. Relis la phrase pour vérifier sa clarté et assure-toi que chaque subordonnée est rattachée à une phrase principale par un mot de liaison. On peut parfois aussi ajuster la ponctuation pour y remédier.' },
    { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'utilisation de la ponctuation. Elle peut être relative au coordonnant, au complément de phrase, au complément du nom, à l\'organisateur textuel, à une énumération (dont la juxtaposition de phrases) ou encore à une citation. La ponctuation fautive vient embrouiller la structure et la clarté des idées. Vérifie les règles de ponctuation pour les différents types de phrases et de propositions. Certaines conjonctions rendent obligatoire l\'usage de la virgule. Utilise des guides de ponctuation pour vérifier cet usage.' },
    { id: 'sc_4', code: '4', nom: 'Groupe du nom', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'accord en genre et en nombre dans le groupe du nom (déterminant, nom, adjectif). Il devient plus difficile de comprendre le lien entre les mots si ces accords ne sont pas faits. Identifie dans l\'interligne le genre et le nombre du nom, puis assure-toi que tous les éléments du groupe concordent.' },
    { id: 'sc_5', code: '5', nom: 'Accord du pronom ou le lien avec son antécédent', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'accord du pronom ou le lien avec son antécédent. Il devient plus difficile de comprendre l\'objet dont on parle ou ce à quoi on fait référence quand il y a de l\'ambiguïté sur ce plan. Relis ta phrase pour clarifier à quoi ou à qui chaque pronom se réfère. Assure-toi qu\'il n\'y a pas d\'autres noms qui pourraient faire écran entre les deux. Vérifie le lien du pronom avec son antécédent et assure-toi que l\'accord est correct.' },
    { id: 'sc_6', code: '6', nom: 'Accord du participe passé', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'accord du participe passé. Révise les règles d\'accord du participe passé avec avoir (accord avec le COD s\'il est placé avant) et avec être (accord avec le sujet). Identifie ces éléments dans l\'interligne, fais des flèches et vérifie les accords.' },
    { id: 'sc_7', code: '7', nom: 'Mots invariables', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent les mots invariables, plus précisément l\'usage de la préposition, de l\'adverbe ou de la conjonction. L\'orthographe de ces mots ne change jamais. Consulte les listes de mots invariables et l\'usage qu\'on en fait. Vérifie surtout le sens de ces mots, car ils sont parfois confondus les uns avec les autres.' },
    { id: 'sc_8', code: '8', nom: 'Déterminant', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'usage du déterminant. Choisis le déterminant approprié en fonction du nom et du contexte, puis vérifie qu\'il concorde en genre et en nombre avec le nom qu\'il accompagne.' },
    { id: 'sc_9', code: '9', nom: 'Vocabulaire', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent le vocabulaire, c\'est-à-dire le sens d\'un mot ou son utilisation dans un certain contexte. L\'utilisation inexacte d\'une citation entre aussi dans cette catégorie. Utilise systématiquement un dictionnaire pour vérifier le sens des mots. Surtout, méfie-toi des synonymes parce qu\'ils renvoient toujours à un contexte très précis qui n\'est peut-être pas celui dans lequel tu écris. Vérifie tes citations en les relisant attentivement dans l\'oeuvre. Évite les anglicismes (dû à, mettre l\'emphase, canceller).' },
    { id: 'sc_10', code: '10', nom: 'Orthographe d\'usage ou éléments de typographie', ponderation: 1,
      retroaction: 'La plupart des erreurs concernent l\'orthographe d\'usage (lettre, chiffre) ou des éléments de typographie (majuscule, minuscule, soulignement, italique, etc.). Relis ton texte et vérifie systématiquement dans le dictionnaire les mots dont l\'orthographe est incertain. Dans le cas de mots étrangers ou de noms de personnages, relis bien ton oeuvre. N\'oublie pas également que les titres d\'oeuvres ou de chapitres requièrent respectivement l\'italique ou le soulignement (les guillemets fonctionnent aussi).' }
].map(Object.freeze));

/**
 * « Partir de la liste du français écrit (codes 1 à 10) » : pose une copie de la liste sur le critère.
 * @param {string} cible - `temp` en création, ou l'ID de la grille
 * @param {number} critereIndex - Index du critère
 */
async function initialiserSousCriteresParDefaut(cible, critereIndex) {
    // #1131 (21 oct. 2026) : `cible`, `temp` en création ou l'id d'une grille enregistrée (`_modifierCritereCible`).
    const critere = await _modifierCritereCible(cible, critereIndex, (c) => { c.sousCriteres = LISTE_FRANCAIS_ECRIT.map((sc) => ({ ...sc })); });
    if (critere) await _redessinerCible(cible);
}

/**
 * Ajoute un nouveau sous-critère vide à un critère
 * @param {string} cible - `temp` en création, ou l'ID de la grille (#1120, 21 oct. : `_modifierCritereCible`)
 * @param {number} critereIndex - Index du critère
 */
async function ajouterSousCritere(cible, critereIndex) {
    let refus = null, nouvelIndex = -1;
    const critere = await _modifierCritereCible(cible, critereIndex, (c) => {
        const scs = Array.isArray(c.sousCriteres) ? c.sousCriteres : [];
        // 20 oct. : la borne de l'assistant (`MAX_SOUS_CRITERES`), pour tout critère.
        refus = refusAjoutSousCritere(scs.length);
        if (refus) return false;

        // Générer un ID unique et un code par défaut
        c.sousCriteres = scs;
        nouvelIndex = scs.length;

        scs.push({   // ⚠ ancre lue par materiel-lot3a-roles (F.b)
            id: genererIdUnique('SC_'),
            code: codeSousCritereNeuf(scs),
            nom: '',
            ponderation: 1.0,
            retroaction: ''
        });
    });
    if (refus && window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(refus), undefined, cle('grillesTemplates'));
    }
    if (!critere) return;

    // Réafficher la grille ; le focus sur le nom du sous-critère neuf (comme « + Ajouter une tranche »).
    await _redessinerCible(cible);
    const champ = [...document.querySelectorAll('#listeCriteres [data-champ="nom"][data-sc-index]')]
        .find(x => x.dataset.critereIndex === String(critereIndex) && x.dataset.scIndex === String(nouvelIndex));
    if (champ) champ.focus();
}

/**
 * Modifie un champ d'un sous-critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 * @param {number} sousCritereIndex - Index du sous-critère
 * @param {string} champ - Nom du champ à modifier
 * @param {any} valeur - Nouvelle valeur
 */
async function modifierSousCritere(cible, critereIndex, sousCritereIndex, champ, valeur) {
    // 20 oct. : la borne de l'assistant (`MAX_NOM`) ; un nom refusé n'écrit rien.
    const refuse = champ === 'nom' ? refusNomSousCritere(valeur) : null;
    if (refuse) return { refuse };
    // ⚠ C'est LE geste de #510 : le `change` d'un champ de sous-critère part au
    // blur, donc au moment précis où l'on clique dans le champ suivant (sérialisé par `_modifierCritereCible`).
    await _modifierCritereCible(cible, critereIndex, (c) => {
        const sc = c.sousCriteres && c.sousCriteres[sousCritereIndex];
        if (!sc) return false;
        sc[champ] = valeur;
    });
    return { refuse: null };
}

/**
 * Supprime un sous-critère
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère
 * @param {number} sousCritereIndex - Index du sous-critère
 */
async function supprimerSousCritere(cible, critereIndex, sousCritereIndex) {
    // #1007, lot 2b : un code de catégorie qu'une évaluation a saisi porte des notes (jamais en création).
    const critereLu = _critereLuCible(cible, critereIndex);
    const sousCritereLu = (critereLu && critereLu.sousCriteres && critereLu.sousCriteres[sousCritereIndex]) || null;
    const porteDesNotes = cible !== 'temp' && !!sousCritereLu && _lignePorteDesNotes({ grilleId: cible, critere: critereLu, sousCritereCode: sousCritereLu.code });
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('sousCritere'))) return;
    if (!confirm('Supprimer ce sous-critère ?')) return;

    const critere = await _modifierCritereCible(cible, critereIndex, (c) => {
        if (!c.sousCriteres) return false;
        // Relu après l'attente : la ligne a changé de place, rien n'est retiré.
        if (!_memeCritere(c, critereLu)) return false;
        const sc = c.sousCriteres[sousCritereIndex];
        if (sousCritereLu && !(sc && sc.code === sousCritereLu.code)) return false;
        c.sousCriteres.splice(sousCritereIndex, 1);
    });
    if (critere) await _redessinerCible(cible);
}

/**
 * Ajoute un nouveau critère à une grille
 * @param {string} grilleId - ID de la grille
 */
async function ajouterCritereGrille(grilleId) {
    let grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === grilleId);
        if (!g) return undefined;

        // Initialiser le tableau de critères si nécessaire
        if (!g.criteres) {
            g.criteres = [];
        }

        // Créer un nouveau critère avec des valeurs par défaut
        g.criteres.push(avecProjectionNeuve({
            // ⚠⚠ UN CRITÈRE NAÎT AVEC SON IDENTIFIANT (2 septembre 2026, sonde sur les
            // données de Grégoire). Cet éditeur travaille par INDEX et ne s'en apercevait
            // pas ; l'écran d'évaluation, le PDF et la réouverture d'une copie travaillent
            // par IDENTIFIANT : quatre critères sans `id` y devenaient UN SEUL
            // (`eval_undefined`), le niveau choisi sur l'un était lu sur le premier, la note
            // portait ce seul niveau sur leur poids cumulé, et le PDF imprimait la
            // description du premier sous les quatre. Mesuré sur « Grille-5 FR-ALGO A26 » :
            // 4 critères sur 5 sans identifiant, 27 évaluations d'A26 sur cette grille.
            // Le chemin modal (`sauvegarderCritere`) posait déjà l'identifiant ; celui-ci
            // l'oubliait. Tarir n'est pas réparer : les grilles déjà écrites gardent leurs
            // critères sans identifiant — voir `scripts/diagnostic-674-criteres-sans-id.js`.
            id: genererIdUnique('CR_'),
            nom: 'Nouveau critère',
            type: typeCritereParDefaut(g),
            ponderation: 0,
            description: '',
            niveauSOLO: niveauSOLOCritereNeuf(observationSOLOActive())   // #1117
        }));

        grille = g;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (!grille) return;

    // Réafficher la liste des critères (calculera automatiquement le total)
    afficherCriteresGrille(grille);

}

/**
 * Supprime un critère d'une grille
 * @param {string} grilleId - ID de la grille
 * @param {number} critereIndex - Index du critère à supprimer
 */
async function supprimerCritereGrille(grilleId, critereIndex) {
    // #1007, lot 2b : un critère qu'une évaluation emploie porte des notes.
    const critereLu = _critereEnBase(grilleId, critereIndex);
    const porteDesNotes = !!critereLu && _lignePorteDesNotes({ grilleId, critere: critereLu });
    if (porteDesNotes && typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('critere'))) return;
    if (!confirm('Es-tu sûr de vouloir supprimer ce critère ?')) {
        return;
    }

    let grille = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const g = grilles.find(x => x.id === grilleId);
        if (!g || !g.criteres || !g.criteres[critereIndex]) return undefined;
        // Relu après l'attente : la ligne a changé de place, rien n'est retiré.
        if (!_memeCritere(g.criteres[critereIndex], critereLu)) return undefined;

        // Supprimer le critère
        g.criteres.splice(critereIndex, 1);
        g.dateModification = new Date().toISOString();
        grille = g;
        return grilles;
    }, [], { geste: 'Modifier la grille' });
    if (!grille) return;

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
    let copieCreee = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === id);

        if (!grille) return undefined;

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
        delete copie.idOriginal;   // #586 : la copie ne répond pas à l'identifiant de sa source

        grilles.push(copie);
        copieCreee = copie;
        return grilles;
    }, [], { geste: 'Dupliquer la grille' });

    if (!copieCreee) return;
    const copie = copieCreee;

    await afficherListeGrilles();
    await chargerGrillePourModif(copie.id);

    notifications.succes('Grille "' + copie.nom + '" dupliquée !');
}

async function supprimerGrilleDepuisSidebar(id) {
    // #624 — LA GARDE D'ORPHELINAGE DU 24 AOUT EST CONSERVEE, ET ELLE A MAINTENANT
    // UNE ISSUE.
    //
    // Les cartouches ne vivent pas DANS la grille : elles sont ancrees a part, sous
    // `cartouches_{grilleId}`. Retirer la grille sans toucher a cette cle ne detruit
    // rien — mais plus personne ne peut lire ce qu'elle contient, la barre laterale
    // et la bibliotheque n'enumerant que les cartouches des grilles PRESENTES.
    // Le diagnostic du 24 aout de Gregoire a retrouve « Carte mentale A26 », « Plan
    // de redaction A26 » et « Strategies de lecture A26 » vivantes dans des cles dont
    // la grille avait disparu de son trimestre.
    //
    // Ce chemin avait recu la garde ce jour-la ; deux des quatre ne l'avaient jamais
    // eue. Les quatre passent maintenant par le meme corps, et le refus s'accompagne
    // d'une porte de sortie — « un blocage sans issue n'est pas une garde » (#624).
    await supprimerGrilleAvecPorteDeSortie(id, {
        apres: async () => {
            await afficherListeGrilles();
            document.getElementById('conteneurEditionGrille').classList.add('u-hide');
            // Note: optionsImportExportGrilles supprime en Beta 92
            document.getElementById('accueilGrilles').classList.remove('u-hide');
        }
    });
}

/**
 * Annule l'édition de grille et retourne à l'accueil
 */
/**
 * Lot E1 (D3) — une grille existante s'enregistre toute seule, champ par champ : son
 * pied ne montre que « Fermer ». Une grille en création montre « Créer la grille » :
 * rien n'est écrit avant ce clic.
 * @param {boolean} enCreation
 */
function rendreModeFicheGrille(enCreation) {
    const btnCreer = document.getElementById('btnCreerGrille');
    if (btnCreer) btnCreer.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/**
 * Lot E1 : « ma fiche est en création et porte une saisie » — lu par la question de
 * sortie et par le `beforeunload` communs (`ui-dialogues.js`).
 */
function grilleEnCreationSaisie() {
    const conteneur = document.getElementById('conteneurEditionGrille');
    if (grilleTemplateActuelle || !conteneur || conteneur.classList.contains('u-hide')) return false;
    const nom = document.getElementById('nomGrilleTemplate')?.value?.trim();
    const description = document.getElementById('descriptionGrille')?.value?.trim();
    // #1120 (21 oct.) : des sous-critères ou des tranches saisis en création sont une saisie, comme un nom.
    const criteres = (window.tempCriteres || []).some(c => (c.nom || '').trim() || (c.description || '').trim()
        || (Array.isArray(c.sousCriteres) && c.sousCriteres.length) || (Array.isArray(c.bareme) && c.bareme.length));
    return !!(nom || description || criteres || window.tempTypeGrille);
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('grille', grilleEnCreationSaisie);

/** Lot E1 (D3) : « Fermer » (il n'annulait rien) — avec la question, en création. */
async function fermerFicheGrille() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('grille'))) return;
    annulerFormGrille();
}

/** Lot E1 : ouvrir une autre grille depuis la liste, sans perdre une création en cours. */
async function ouvrirGrilleDepuisListe(id) {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('grille'))) return;
    await chargerGrillePourModif(id);
}

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
        alert('Aucune grille en cours d\'edition');
        return;
    }

    // #624 — PORTE NUE REFERMEE. Ce chemin — le bouton « Supprimer cette grille » de
    // l'editeur — ne verifiait AUCUNE dependance, alors que son jumeau
    // `dupliquerGrilleActive`, six lignes plus haut, delegue deja au chemin commun.
    //
    // ⚠ `marquerToujours` PRESERVE UN BUG LATENT, IL NE LE CORRIGE PAS. Ce chemin
    // appelait `marquerRessourceSupprimee` INCONDITIONNELLEMENT, la ou les trois
    // autres ne le font que pour les gabarits codes en dur. Le tombstone ne sert qu'a
    // empecher les `assurer*()` de reinjecter un gabarit code en dur : pour tout autre
    // identifiant il ne fait qu'enfler `ressourcesSupprimees`, sans effet. Aligner
    // sans le dire changerait un comportement en silence pendant un lot qui n'a pas
    // ca pour objet — on preserve, on inscrit, on traite a part.
    await supprimerGrilleAvecPorteDeSortie(grilleTemplateActuelle.id, {
        marquerToujours: true,
        apres: async () => {
            annulerFormGrille();
            await afficherListeGrilles();
        }
    });
}

/**
 * Sauvegarde complète de la grille (nom + critères)
 * ✅ CORRIGÉ (6 janv. 2026) : passer par sauvegarderGrilleTemplate directement —
 * sauvegarderNomGrille() ne traite que les grilles déjà existantes.
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
window.texteDePonderation = texteDePonderation;   // 21 oct. 2026 — lu aussi par l'évaluation (« (30 points) » sur une grille en points)
window.modifierCritereTemp = modifierCritereTemp;
window.ajouterCritereTemp = ajouterCritereTemp;
window.supprimerCritereTemp = supprimerCritereTemp;
window.mettreAJourTotalTemp = mettreAJourTotalTemp;
window.deplacerCritereTempHaut = deplacerCritereTempHaut;
window.deplacerCritereTempBas = deplacerCritereTempBas;
window.deplacerCritereGrilleHaut = deplacerCritereGrilleHaut;
window.deplacerCritereGrilleBas = deplacerCritereGrilleBas;
window.chargerGrillePourModif = chargerGrillePourModif;
window.dupliquerGrilleDepuisSidebar = dupliquerGrilleDepuisSidebar;
window.supprimerGrilleDepuisSidebar = supprimerGrilleDepuisSidebar;
window.annulerFormGrille = annulerFormGrille;
window.fermerFicheGrille = fermerFicheGrille;
window.ouvrirGrilleDepuisListe = ouvrirGrilleDepuisListe;
window.rendreAttenduCritere = rendreAttenduCritere;   // lot 3b1 (17 oct.) : exposé pour les bancs
// La dissection, lot 13 (19 oct.) : le texte par niveau d'un critère — le geste, puis la fonction pure (bancs)
window.modifierTexteReponseGrilleHandler = modifierTexteReponseGrilleHandler;
window.reponsesCritere = { texteModifie: reponseTexteModifie, REFUS: REFUS_REPONSES };
// #1120, lot 1 (20 oct.) : le barème d'un critère analytique — ses gestes (data-action, data-on-change)
window.modifierTrancheBaremeHandler = modifierTrancheBaremeHandler;
window.ajouterTrancheBareme = ajouterTrancheBareme;
window.retirerTrancheBareme = retirerTrancheBareme;
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
    await db.modifier(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
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

        // Rien migré : le mutateur rend `undefined`, aucune écriture.
        if (nbMigrations === 0) return undefined;
        return grilles;
    }, []);
}

// Exécuter la migration au chargement du module
migrerCategoriesVersSousCriteres();

window.modifierCritereGrille = modifierCritereGrille;
window.marquerChampRefuse = marquerChampRefuse;                             // #516 — le refus se VOIT
window.REFUS_NOM_CRITERE = REFUS_NOM_CRITERE;
window.ajouterCritereGrille = ajouterCritereGrille;
window.supprimerCritereGrille = supprimerCritereGrille;
// Exports des fonctions de gestion des sous-critères
window.initialiserSousCriteresParDefaut = initialiserSousCriteresParDefaut;
window.ajouterSousCritere = ajouterSousCritere;
window.modifierSousCritere = modifierSousCritere;
window.supprimerSousCritere = supprimerSousCritere;
window.deplacerSousCritereHaut = deplacerSousCritereHaut;   // §8 f (4 sept. 2026)
window.deplacerSousCritereBas = deplacerSousCritereBas;

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

/**
 * #667 — Handlers du bloc « formule » du gabarit.
 *
 * Ils passent tous par `formulesAlgo.appliquerAuCritere`, jamais par une
 * écriture directe de champ : c'est lui qui borne les valeurs, pose les défauts
 * déclarés du modèle et tient à jour le miroir `facteurNormalisation`.
 *
 * Ils re-rendent l'écran parce que changer de modèle change les paramètres à
 * afficher ET le texte de la formule. Le déclencheur est `change` (au blur),
 * pas `input` : personne ne perd le focus en cours de frappe.
 */
/**
 * #668 — Écrit le modèle de projection, ses paramètres et ses paliers sur un
 * critère ENREGISTRÉ, en UNE seule écriture.
 *
 * Même raison qu'au #667 : trois écritures séparées laisseraient, entre deux,
 * une grille dont les paliers ne correspondent pas à leur modèle.
 */
async function modifierProjectionCritereGrille(grilleId, critereIndex, muter) {
    let grilleModifiee = null;
    await modifierEtAnnoncer(cle('grillesTemplates'), (lues) => {
        const grilles = lues || [];
        const grille = grilles.find(g => g.id === grilleId);
        if (!grille || !grille.criteres || !grille.criteres[critereIndex]) return undefined;
        if (muter(grille.criteres[critereIndex]) === false) return undefined;
        grille.dateModification = new Date().toISOString();
        grilleModifiee = grille;
        return grilles;
    }, [], { geste: 'Modifier la grille' });

    if (!grilleModifiee) return null;
    if (grilleTemplateActuelle && grilleTemplateActuelle.id === grilleId) {
        grilleTemplateActuelle = grilleModifiee;
    }
    return grilleModifiee;
}

/**
 * #668 — Les paliers d'un critère MIGRÉ ne sont pas encore écrits : ils vivent
 * dans le registre, par migration à la lecture. Le premier geste d'édition doit
 * donc les matérialiser sur le critère — sinon l'utilisateur modifierait une
 * liste qui n'existe pas, et son geste se perdrait sans un mot.
 *
 * C'est la SEULE écriture que ce chantier provoque sur des données existantes,
 * et elle est déclenchée par un geste explicite, jamais en masse.
 */
function _paliersEditablesDuCritere(critere) {
    const p = window.projectionAlgo.normaliser(critere);
    return p.paliers.map((x) => Object.assign({}, x));
}

function _appliquerPaliers(critere, paliers) {
    const p = window.projectionAlgo.normaliser(critere);
    window.projectionAlgo.appliquerAuCritere(critere, p.modeleId, p.params, paliers);
}

/**
 * Ce qu'un champ de palier vaut, selon sa nature.
 *
 * #790 — les deux handlers lisaient `el.value` sans exception. Une case à cocher
 * y répond « on » quoi qu'il arrive : décocher n'aurait rien décoché. Un seul
 * lecteur pour les deux, plutôt que la même condition écrite deux fois.
 */
function _valeurChampPalier(el) {
    return (el && el.type === 'checkbox') ? !!el.checked : (el ? el.value : '');
}

function _muterPalier(critere, index, champ, valeur) {
    const paliers = _paliersEditablesDuCritere(critere);
    if (!paliers[index]) return false;
    if (champ === 'ratioMax') {
        const n = parseFloat(valeur);
        // Un seuil illisible n'est pas « zéro » : on refuse le geste plutôt que
        // de déplacer un palier vers une valeur que personne n'a voulue.
        if (isNaN(n) || n <= 0) return false;
        paliers[index].ratioMax = n;
    } else if (champ === 'leveSignalement') {
        // #790 — le seul champ BOOLÉEN d'un palier. Les deux handlers passent
        // `el.checked` pour lui et `el.value` pour les autres ; le `String(valeur)`
        // de la branche générale en aurait fait la chaîne « false », qui est vraie.
        paliers[index].leveSignalement = (valeur === true || valeur === 'true');
    } else {
        paliers[index][champ] = String(valeur);
    }
    _appliquerPaliers(critere, paliers);
    return true;
}

function modifierModeleProjectionTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    // Lot B : une collection choisie se COPIE dans le critère (paliers compris).
    var idCollection = _idCollectionChoisie(el.value);
    if (idCollection !== null) {
        if (!window.collectionsProjection.appliquer(window.tempCriteres[index], idCollection)) _direCollectionDisparue();
        afficherCriteresTemp();
        return;
    }
    // params null ET paliers null : le nouveau modèle repart de SES défauts.
    window.projectionAlgo.appliquerAuCritere(window.tempCriteres[index], el.value, null, null);
    delete window.tempCriteres[index].paliersProjection;
    afficherCriteresTemp();
}

function modifierParamProjectionTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    var critere = window.tempCriteres[index];
    var p = window.projectionAlgo.normaliser(critere);
    var params = Object.assign({}, p.params);
    params[el.dataset.paramCle] = el.value;
    window.projectionAlgo.appliquerAuCritere(critere, p.modeleId, params, critere.paliersProjection);
    afficherCriteresTemp();
}

function modifierPalierProjectionTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    if (_muterPalier(window.tempCriteres[index], parseInt(el.dataset.palierIndex), el.dataset.champ, _valeurChampPalier(el)) === false) {
        if (typeof marquerChampRefuse === 'function') marquerChampRefuse(el, 'Le seuil doit être un nombre supérieur à zéro.');
        return;
    }
    afficherCriteresTemp();
}

async function modifierModeleProjectionGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var valeur = el.value;
    // Lot B : une collection choisie se COPIE dans le critère (paliers compris) ; un id
    // disparu entre le rendu et le clic n'écrit rien (le mutateur rend false).
    var idCollection = _idCollectionChoisie(valeur);
    if (idCollection !== null) {
        var appliquee = false;
        await modifierProjectionCritereGrille(grilleId, index, function(critere) {
            appliquee = window.collectionsProjection.appliquer(critere, idCollection);
            return appliquee ? undefined : false;
        });
        if (!appliquee) _direCollectionDisparue();
        afficherCriteresGrille(await obtenirGrilleParId(grilleId));
        return;
    }
    await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        window.projectionAlgo.appliquerAuCritere(critere, valeur, null, null);
        delete critere.paliersProjection;
    });
    // ⚠ obtenirGrilleParId est ASYNC (#466/CO-21) : sans await, le renderer
    // reçoit une Promise et affiche « Aucun critère défini ».
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

async function modifierParamProjectionGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var cleParam = el.dataset.paramCle;
    var valeur = el.value;
    await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        var p = window.projectionAlgo.normaliser(critere);
        var params = Object.assign({}, p.params);
        params[cleParam] = valeur;
        window.projectionAlgo.appliquerAuCritere(critere, p.modeleId, params, critere.paliersProjection);
    });
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

/* ---------------------------------------------------------------------
   #581 — Les énoncés d'un critère algorithmique
   --------------------------------------------------------------------- */

function _enoncesEditesDepuis(critere, cleModifiee, valeur) {
    // ⚠ ON REPART DES TEXTES RENDUS, PAS DE `critere.enonces`. Un critère
    // migré n'a rien d'écrit : ses textes vivent dans le registre. Sans cette
    // lecture, le premier geste d'édition effacerait les trois autres zones.
    var e = window.enoncesAlgo.normaliser(critere);
    var textes = Object.assign({}, e.enonces);
    if (cleModifiee) textes[cleModifiee] = String(valeur);
    return textes;
}

function modifierModeleEnoncesTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    // ⚠ CE QUI A ÉTÉ RÉDIGÉ SURVIT — voir `enoncesRediges`. Les zones restées
    // au défaut prennent celui du nouveau modèle ; les phrases écrites à la
    // main restent. Changer de modèle ne détruit donc rien qu'on n'ait voulu.
    var critere = window.tempCriteres[index];
    window.enoncesAlgo.appliquerAuCritere(critere, el.value,
        window.enoncesAlgo.enoncesRediges(critere));
    afficherCriteresTemp();
}

/**
 * Le texte troué, étape 1 (3 septembre 2026) — l'ÉCRITURE d'une zone, sans son
 * rendu. Deux gestes y passent : la frappe (`change`, qui re-rend ensuite,
 * comme tout le gabarit) et la pose d'un repère (`insererRepereEnonce`, qui ne
 * re-rend PAS — le curseur doit survivre au clic, voir là-bas).
 */
function _ecrireTexteEnonceTemp(index, cleEnonce, valeur) {
    if (!window.tempCriteres || !window.tempCriteres[index]) return false;
    var critere = window.tempCriteres[index];
    var e = window.enoncesAlgo.normaliser(critere);
    window.enoncesAlgo.appliquerAuCritere(critere, e.modeleId,
        _enoncesEditesDepuis(critere, cleEnonce, valeur));
    return true;
}

function _ecrireTexteEnonceGrille(grilleId, index, cleEnonce, valeur) {
    return modifierProjectionCritereGrille(grilleId, index, function(critere) {
        var e = window.enoncesAlgo.normaliser(critere);
        window.enoncesAlgo.appliquerAuCritere(critere, e.modeleId,
            _enoncesEditesDepuis(critere, cleEnonce, valeur));
    });
}

function modifierTexteEnonceTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!_ecrireTexteEnonceTemp(index, el.dataset.enonceCle, el.value)) return;
    afficherCriteresTemp();
}

async function modifierModeleEnoncesGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var valeur = el.value;
    await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        // Même règle que côté temp : la prose rédigée survit au changement.
        window.enoncesAlgo.appliquerAuCritere(critere, valeur,
            window.enoncesAlgo.enoncesRediges(critere));
    });
    // ⚠ obtenirGrilleParId est ASYNC (#466/CO-21) : sans await, le renderer
    // reçoit une Promise et affiche « Aucun critère défini ».
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

async function modifierTexteEnonceGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    await _ecrireTexteEnonceGrille(grilleId, index, el.dataset.enonceCle, el.value);
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

/**
 * Le texte troué, étape 1 — un clic sur un repère le pose dans sa zone, au
 * curseur. `data-action="insererRepereEnonce"`, sans paramètre : le
 * dispatcher de main.js passe le bouton, et la zone est celle du même
 * `.groupe-form`.
 *
 * ⚠ LA ZONE N'EST PAS RE-RENDUE, ET C'EST LE POINT. Les autres gestes du
 * gabarit re-rendent tout le bloc après l'écriture ; ici, le rendu détruirait
 * la zone que l'enseignant·e est en train d'écrire, et son curseur avec. La
 * valeur est posée dans la zone, le curseur remis après le repère, et
 * l'écriture part derrière — même chemin que la frappe, sans le rendu. Le
 * `change` qui suivra, à la sortie de la zone, réécrira la même valeur.
 *
 * ⚠ LE CURSEUR N'A DE SENS QU'UNE FOIS LA ZONE VISITÉE. Une zone fraîchement
 * rendue répond (0, 0) à `selectionStart`, et y poser un repère le mettrait en
 * tête de phrase. Sans visite depuis le rendu (`data-curseur-vu`, posé au
 * focus et emporté par tout re-rendu), le repère s'ajoute à la fin.
 */
function insererRepereEnonce(el) {
    if (typeof window.enoncesAlgo === 'undefined') return;
    // Étape 2 (4 sept. 2026) : la palette d'un PALIER sert ses deux zones. La
    // cible est la zone où est le curseur (le focus y reste : `pointerdown`
    // annulé plus bas), sinon la dernière visitée depuis le rendu, sinon « Ce
    // que l'élève lit » (`_zoneCibleDuPalier`). Les badges sont ceux du
    // registre de projection ; la pose, elle, est commune (`insererRepere`,
    // ouvert d'une palette).
    var palier = (el && typeof el.closest === 'function') ? el.closest('.palier-projection') : null;
    var zone = null;
    var palette = null;
    if (palier) {
        if (typeof window.projectionAlgo === 'undefined' || typeof window.projectionAlgo.listerReperes !== 'function') return;
        palette = window.projectionAlgo.listerReperes();
        zone = _zoneCibleDuPalier(palier);
    } else {
        var groupe = (el && typeof el.closest === 'function') ? el.closest('.groupe-form') : null;
        zone = groupe ? groupe.querySelector('textarea[data-enonce-cle]') : null;
    }
    if (!zone) return;

    // Étape 3 (5 sept. 2026) : quand la zone porte une VUE (composeur-badges), le
    // caret vient de la vue, en positions de texte ; le texte reste `zone.value`.
    var vue = _vueBadgesDe(zone);
    var visitee = zone.dataset.curseurVu === '1';
    var debut = visitee ? zone.selectionStart : zone.value.length;
    var fin = visitee ? zone.selectionEnd : zone.value.length;
    if (vue) {
        var c = visitee ? window.composeurBadges.curseur(vue) : null;
        debut = c ? c.debut : zone.value.length;
        fin = c ? c.fin : zone.value.length;
    }
    var r = window.enoncesAlgo.insererRepere(zone.value, debut, fin, el.dataset.jeton, palette);
    if (!r) return;

    zone.value = r.texte;
    zone.dataset.curseurVu = '1';
    if (vue) {
        // La vue se redessine depuis le texte et replace le caret après le badge ; ce
        // qu'elle écrira au `focusout` est déjà ce que la donnée porte.
        zone.dataset.composeurEcrit = r.texte;
        try { vue.focus({ preventScroll: true }); } catch (err) { /* rien : le badge est posé */ }
        window.composeurBadges.ecrire(vue, r.texte, r.curseur);
    } else {
        try {
            zone.focus({ preventScroll: true });
            zone.setSelectionRange(r.curseur, r.curseur);
        } catch (err) {
            // Un moteur sans setSelectionRange sur un textarea : le repère est
            // posé quand même, seul le curseur n'est pas replacé.
        }
    }

    var index = parseInt(zone.dataset.critereIndex);
    if (palier) {
        // Même chemin d'écriture que la frappe dans la zone (`_muterPalier`,
        // qui matérialise les paliers d'un critère migré au premier geste),
        // sans le rendu — le curseur doit survivre au clic, comme pour les énoncés.
        var palierIndex = parseInt(zone.dataset.palierIndex);
        var champ = zone.dataset.champ;
        if (zone.dataset.grilleId) {
            modifierProjectionCritereGrille(zone.dataset.grilleId, index, function(critere) {
                return _muterPalier(critere, palierIndex, champ, r.texte);
            }).catch(function(err) {
                console.warn('[paliers] le badge est à l\'écran mais pas enregistré :', err);
            });
        } else if (window.tempCriteres && window.tempCriteres[index]) {
            _muterPalier(window.tempCriteres[index], palierIndex, champ, r.texte);
        }
        return;
    }
    var cleEnonce = zone.dataset.enonceCle;
    if (zone.dataset.grilleId) {
        _ecrireTexteEnonceGrille(zone.dataset.grilleId, index, cleEnonce, r.texte)
            .catch(function(err) {
                console.warn('[énoncés] le repère est à l\'écran mais pas enregistré :', err);
            });
    } else {
        _ecrireTexteEnonceTemp(index, cleEnonce, r.texte);
    }
}

/** La zone d'un palier qui reçoit le badge — voir `insererRepereEnonce`. */
/** La vue (composeur-badges) posée sur une zone, s'il y en a une. */
function _vueBadgesDe(zone) {
    return (typeof window.composeurBadges !== 'undefined' && typeof window.composeurBadges.vueDe === 'function')
        ? window.composeurBadges.vueDe(zone) : null;
}

/** Le `<textarea>` qu'un élément focalisé représente : lui-même, ou celui de sa vue (étape 3). */
function _zoneDeFocus(el) {
    if (!el) return null;
    if (el.tagName === 'TEXTAREA') return el;
    if (typeof window.composeurBadges !== 'undefined' && typeof window.composeurBadges.textareaDe === 'function') {
        var vue = (typeof el.closest === 'function') ? el.closest('.composeur-badges') : null;
        if (vue) return window.composeurBadges.textareaDe(vue);
    }
    return null;
}

function _zoneCibleDuPalier(palier) {
    var actif = _zoneDeFocus((typeof document !== 'undefined') ? document.activeElement : null);
    if (actif && actif.tagName === 'TEXTAREA' && actif.dataset && actif.dataset.palierIndex !== undefined
        && typeof palier.contains === 'function' && palier.contains(actif)) {
        return actif;
    }
    var champ = (palier.dataset && palier.dataset.zoneActive) || 'texte';
    return palier.querySelector('textarea[data-palier-index][data-champ="' + champ + '"]')
        || palier.querySelector('textarea[data-palier-index]');
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    // Le drapeau « zone visitée » — voir `insererRepereEnonce`. Il tombe avec
    // l'élément à chaque rendu du gabarit, et c'est voulu.
    document.addEventListener('focusin', function(e) {
        var zone = _zoneDeFocus(e.target);
        if (!zone || zone.tagName !== 'TEXTAREA' || !zone.dataset) return;
        if (zone.dataset.enonceCle !== undefined) {
            zone.dataset.curseurVu = '1';
            return;
        }
        // Étape 2 : une zone de palier visitée devient la cible de la palette
        // de son palier, jusqu'au prochain rendu (`_zoneCibleDuPalier`).
        if (zone.dataset.palierIndex !== undefined) {
            zone.dataset.curseurVu = '1';
            var palier = (typeof zone.closest === 'function') ? zone.closest('.palier-projection') : null;
            if (palier && palier.dataset) palier.dataset.zoneActive = zone.dataset.champ || 'texte';
        }
    });
    // ⚠ LE CLIC SUR UN REPÈRE NE DOIT PAS PRENDRE LE FOCUS. Sinon la zone le
    // perd d'abord, son `change` part, le gabarit se re-rend, et le bouton
    // sous le doigt n'existe plus quand le clic arrive : le premier repère
    // posé après une frappe se perdait. Annuler `pointerdown` (et `mousedown`,
    // pour les moteurs qui l'émettent encore) laisse le focus — et le
    // curseur — dans la zone ; le clic, lui, part quand même.
    ['pointerdown', 'mousedown'].forEach(function(type) {
        document.addEventListener(type, function(e) {
            var cible = e.target;
            if (!cible || typeof cible.closest !== 'function') return;
            if (cible.closest('[data-action="insererRepereEnonce"]')) e.preventDefault();
        });
    });
}

async function modifierPalierProjectionGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var palierIndex = parseInt(el.dataset.palierIndex);
    var champ = el.dataset.champ;
    var valeur = _valeurChampPalier(el);
    var res = await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        return _muterPalier(critere, palierIndex, champ, valeur);
    });
    if (!res) {
        if (typeof marquerChampRefuse === 'function') marquerChampRefuse(el, 'Le seuil doit être un nombre supérieur à zéro.');
        return;
    }
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

/** Un palier neuf naît AU-DESSUS du terminal, avec un seuil visible et vide de texte. */
function _palierNeuf(paliers) {
    var avecSeuil = paliers.filter(function(x) { return !x.sansErreur && x.ratioMax !== null; });
    var dernier = avecSeuil.length ? avecSeuil[avecSeuil.length - 1].ratioMax : 0.5;
    return {
        cle: 'palier_' + Date.now().toString(36),
        libelle: 'Nouveau palier',
        ratioMax: Math.round((dernier + 0.1) * 100) / 100,
        texte: '',
        texteAide: ''
    };
}

function ajouterPalierProjectionTemp(index) {
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    var critere = window.tempCriteres[index];
    var paliers = _paliersEditablesDuCritere(critere);
    paliers.push(_palierNeuf(paliers));
    _appliquerPaliers(critere, paliers);
    afficherCriteresTemp();
}

function supprimerPalierProjectionTemp(index, palierIndex) {
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    var critere = window.tempCriteres[index];
    var paliers = _paliersEditablesDuCritere(critere);
    if (!paliers[palierIndex]) return;
    paliers.splice(palierIndex, 1);
    _appliquerPaliers(critere, paliers);
    afficherCriteresTemp();
}

async function ajouterPalierProjectionGrille(grilleId, index) {
    await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        var paliers = _paliersEditablesDuCritere(critere);
        paliers.push(_palierNeuf(paliers));
        _appliquerPaliers(critere, paliers);
    });
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

async function supprimerPalierProjectionGrille(grilleId, index, palierIndex) {
    await modifierProjectionCritereGrille(grilleId, index, function(critere) {
        var paliers = _paliersEditablesDuCritere(critere);
        if (!paliers[palierIndex]) return false;
        paliers.splice(palierIndex, 1);
        _appliquerPaliers(critere, paliers);
    });
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

function modifierModeleFormuleTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    // params null : le nouveau modèle repart de SES défauts déclarés — ceux de
    // l'ancien ne veulent rien dire pour lui.
    window.formulesAlgo.appliquerAuCritere(window.tempCriteres[index], el.value, null);
    afficherCriteresTemp();
}

function modifierParamFormuleTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    if (!window.tempCriteres || !window.tempCriteres[index]) return;
    var critere = window.tempCriteres[index];
    var f = window.formulesAlgo.normaliser(critere);
    var params = Object.assign({}, f.params);
    params[el.dataset.paramCle] = el.value;
    window.formulesAlgo.appliquerAuCritere(critere, f.modeleId, params);
    afficherCriteresTemp();
}

async function modifierModeleFormuleGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    await modifierFormuleCritereGrille(grilleId, index, el.value, null);
    // ⚠ obtenirGrilleParId est ASYNC (cf. #466/CO-21) : sans await, le renderer
    // reçoit une Promise et affiche « Aucun critère défini ».
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

async function modifierParamFormuleGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    await modifierParamFormuleCritereGrille(grilleId, index, el.dataset.paramCle, el.value);
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
}

/**
 * Le menu « Type de la grille » — lot 1 (3 septembre 2026).
 *
 * Grille en ÉDITION : le choix s'écrit sur la grille par le même chemin que le
 * nom et la description (le vide RETIRE le champ, il n'écrit jamais `''`). Ses
 * critères existants ne bougent pas : ce sont des données, et le badge dit ce
 * qui est. Grille en CRÉATION : le choix attend l'enregistrement, et les
 * critères temporaires qui SUIVAIENT l'ancien défaut suivent le nouveau — ceux
 * qui dérogeaient (un type choisi à la main, différent du défaut) sont gardés.
 */
async function modifierTypeGrilleHandler(el) {
    const valeur = TYPES_GRILLE.includes(el.value) ? el.value : '';
    if (grilleTemplateActuelle) {
        // #957 : posé sur la version EN BASE, pas sur l'objet mémoire.
        await sauvegarderGrilleTemplate(true, (g) => {
            if (valeur) g.type = valeur;
            else delete g.type;
        });
        rendrePrecisionTypeGrille(grilleTemplateActuelle);
        return;
    }
    const ancien = typeCritereParDefautEnCours();
    window.tempTypeGrille = valeur;
    const nouveau = typeCritereParDefautEnCours();
    (window.tempCriteres || []).forEach(c => { if (c && c.type === ancien) { c.type = nouveau; avecProjectionNeuve(c); } });   // lot 4, C.3
    afficherCriteresTemp();
}

/** Handler délégué pour modifierCritereTemp + afficherCriteresTemp (type change) */
function modifierTypeCritereTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    modifierCritereTemp(index, 'type', el.value);
    afficherCriteresTemp();
}

/** Handler délégué pour modifierCritereGrille(grilleId, index, champ, valeur) */
/**
 * #516 — le champ REFUSÉ se voit, et ne le dit qu'une fois.
 *
 * ⚠ La notification n'est émise qu'au PASSAGE en refus. Sans cette garde, vider
 * un champ puis cliquer trois fois ailleurs produirait trois bandeaux pour un
 * seul problème — et le troisième ferait fermer la barre sans la lire.
 */
function marquerChampRefuse(el, raison) {
    if (!el || !el.classList) return;
    if (!raison) { el.classList.remove('champ-refuse'); return; }
    const dejaMarque = el.classList.contains('champ-refuse');
    el.classList.add('champ-refuse');
    // Lot E1 (D3) : un seul message, par le témoin commun — « Non enregistré : ‹raison› ».
    // Avant : un panneau d'erreur à deux phrases, en plus du champ marqué. Le témoin
    // s'efface à la prochaine écriture réussie de la même clé.
    if (!dejaMarque && window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(raison), undefined, cle('grillesTemplates'));
    }
}

function modifierCritereGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-int') ? parseInt(el.value) : el.value;
    Promise.resolve(modifierCritereGrille(grilleId, index, champ, valeur))
        .then(function (resultat) { marquerChampRefuse(el, resultat && resultat.refuse); });
}

/** Handler délégué pour modifierCritereGrille type + refresh */
async function modifierTypeCritereGrilleHandler(el) {
    var grilleId = el.dataset.grilleId;
    var index = parseInt(el.dataset.critereIndex);
    await modifierCritereGrille(grilleId, index, 'type', el.value);
    // 🔧 #466/CO-21 (21 août 2026) : obtenirGrilleParId est ASYNC — le renderer
    // recevait une Promise et affichait « Aucun critère défini » (les données
    // étaient sauves, l'écran mentait ; retour au rechargement seulement).
    afficherCriteresGrille(await obtenirGrilleParId(grilleId));
    // Lot 1 (3 sept. 2026) : le badge de composition de la barre latérale dit ce
    // qui EST — il suit le changement de type sans attendre un rechargement.
    await afficherListeGrilles();
}

/** Handler délégué pour modifierSousCritere(grilleId, critereIndex, scIndex, champ, valeur) */
function modifierSousCritereHandler(el) {
    var grilleId = el.dataset.grilleId;
    var critereIndex = parseInt(el.dataset.critereIndex);
    var scIndex = parseInt(el.dataset.scIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    return modifierSousCritere(grilleId, critereIndex, scIndex, champ, valeur)
        .then(function (r) { marquerChampRefuse(el, r && r.refuse); });
}

/** Handler délégué pour modifierCritereTemp pondération + mise à jour total */
function modifierPonderationCritereTempHandler(el) {
    var index = parseInt(el.dataset.critereIndex);
    modifierCritereTemp(index, 'ponderation', parseInt(el.value));
    mettreAJourTotalTemp();
    if (window.tempCriteres && window.tempCriteres[index]) suivrePointsDAbord(index, window.tempCriteres[index]);
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
// #667 — le dispatcher data-on-change résout les handlers par NOM dans window.
// Sans ces quatre lignes, le bloc « formule » du gabarit s'affiche et ne réagit
// à rien, en silence.
window.modifierModeleProjectionTempHandler = modifierModeleProjectionTempHandler;
window.ouvrirSaisieCollectionProjection = ouvrirSaisieCollectionProjection;         // Lot B (5 sept. 2026)
window.annulerSaisieCollectionProjection = annulerSaisieCollectionProjection;
window.enregistrerCollectionProjection = enregistrerCollectionProjection;
window.supprimerCollectionProjection = supprimerCollectionProjection;
window.modifierParamProjectionTempHandler = modifierParamProjectionTempHandler;
window.modifierPalierProjectionTempHandler = modifierPalierProjectionTempHandler;
window.modifierModeleProjectionGrilleHandler = modifierModeleProjectionGrilleHandler;
window.modifierParamProjectionGrilleHandler = modifierParamProjectionGrilleHandler;
window.modifierPalierProjectionGrilleHandler = modifierPalierProjectionGrilleHandler;
window.modifierModeleEnoncesTempHandler = modifierModeleEnoncesTempHandler;
window.modifierTexteEnonceTempHandler = modifierTexteEnonceTempHandler;
window.modifierModeleEnoncesGrilleHandler = modifierModeleEnoncesGrilleHandler;
window.modifierTexteEnonceGrilleHandler = modifierTexteEnonceGrilleHandler;
window.insererRepereEnonce = insererRepereEnonce;
window.modifierCodesDepuisSousCriteresHandler = modifierCodesDepuisSousCriteresHandler;
window.ajouterPalierProjectionTemp = ajouterPalierProjectionTemp;
window.supprimerPalierProjectionTemp = supprimerPalierProjectionTemp;
window.ajouterPalierProjectionGrille = ajouterPalierProjectionGrille;
window.supprimerPalierProjectionGrille = supprimerPalierProjectionGrille;
window.modifierModeleFormuleTempHandler = modifierModeleFormuleTempHandler;
window.modifierParamFormuleTempHandler = modifierParamFormuleTempHandler;
window.modifierModeleFormuleGrilleHandler = modifierModeleFormuleGrilleHandler;
window.modifierParamFormuleGrilleHandler = modifierParamFormuleGrilleHandler;
window.modifierTypeCritereTempHandler = modifierTypeCritereTempHandler;
window.modifierCritereGrilleHandler = modifierCritereGrilleHandler;
window.modifierTypeCritereGrilleHandler = modifierTypeCritereGrilleHandler;
// Lot 1 (3 sept. 2026) — le menu « Type de la grille » et ses deux lectures.
window.modifierTypeGrilleHandler = modifierTypeGrilleHandler;
window.appliquerTypeGrilleAuxCriteresSansType = appliquerTypeGrilleAuxCriteresSansType;   // #703 — data-action
window.typeCritereParDefaut = typeCritereParDefaut;
window.typeGrilleAffiche = typeGrilleAffiche;
window.rendreCartesGabaritAlgo = rendreCartesGabaritAlgo;   // lot 4 — le gabarit algorithmique, pour les sentinelles
window.afficherCriteresGrille = afficherCriteresGrille;       // lot 4 — l'écran d'édition, exécuté par les sentinelles (afficherCriteresTemp l'est déjà plus haut)
window.niveauSOLOCritereNeuf = niveauSOLOCritereNeuf;         // #1117 — le défaut d'un critère neuf, éprouvé par sa sentinelle
window.capturerPlisGabaritAlgo = capturerPlisGabaritAlgo;
window.phrasePrecisionTypeGrille = phrasePrecisionTypeGrille;
window.motsAvisCriteresSansType = motsAvisCriteresSansType;   // #703 — les mots, éprouvés par leur sentinelle
window.TYPES_GRILLE = TYPES_GRILLE;
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
