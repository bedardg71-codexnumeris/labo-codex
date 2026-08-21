/* ===============================
   MODULE EVALUATION: ÉVALUATIONS ET RÉTROACTIONS
   Index: 50 10-10-2025a → Modularisation
   Version: 2025122905 (29 déc 2025 - Fix anonymisation)

   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère l'évaluation des productions étudiantes
   et la génération automatique de rétroactions.
   
   Contenu de ce module:
   - Sélection étudiant/production/grille/échelle/cartouche
   - Évaluation par critères avec niveaux
   - Génération automatique de rétroaction
   - Calcul de la note finale
   - Sauvegarde des évaluations
   - Navigation vers la liste des évaluations
   =============================== */

// PATTERN LECTURE ÉVALUATIONS :
// - obtenirDonneesSelonMode() → lectures read-only (affichage, stats) — filtré par coursId
// - db.getSync(cle()) → lectures read-modify-write (modification, suppression) — toutes les évals
// - sauvegarderDonneesSelonMode() → toutes les écritures

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales, evaluationEnCours
   - 02-navigation.js : Pour navigation vers liste
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #selectGroupeEval : Select pour filtrer par groupe
   - #selectEtudiantEval : Select pour choisir l'étudiant
   - #selectProduction1 : Select pour choisir la production
   - #selectGrille1 : Select pour choisir la grille
   - #selectEchelle1 : Select pour choisir l'échelle
   - #selectCartoucheEval : Select pour choisir la cartouche
   - #remiseProduction1 : Select pour le statut de remise
   - #listeCriteresGrille1 : Conteneur des critères
   - #noteProduction1 : Affichage de la note
   - #niveauProduction1 : Affichage du niveau
   - #retroactionFinale1 : Textarea de la rétroaction
   - #afficherDescription1, #afficherObjectif1, etc. : Checkboxes options
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'productions' : Array des productions (nom historique)
   - 'grillesTemplates' : Array des grilles de critères
   - 'niveauxEchelle' : Array des niveaux de performance
   - 'cartouches_{grilleId}' : Array des cartouches par grille
   - 'evaluationsSauvegardees' : Array des évaluations complètes
   =============================== */

/**
 * Change l'échelle d'évaluation
 */
function changerEchelleEvaluation(num) {
    const echelleId = document.getElementById('selectEchelle1').value;

    if (evaluationEnCours) {
        evaluationEnCours.echelleId = echelleId;
        // Recalculer la note et regénérer la rétroaction avec la nouvelle échelle
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
        window.calculerNote();
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
    }
}

/**
 * Coche toutes les options par défaut
 */
function cocherOptionsParDefaut() {
    const options = ['Description', 'Objectif', 'Tache', 'Adresse', 'Contexte'];
    options.forEach(option => {
        const checkbox = document.getElementById(`afficher${option}1`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Initialiser affichageNote depuis la pratique active du groupe-cours
    try {
        const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
            ? obtenirPratiqueActiveGroupeCours() : null;
        const configurations = db.getSync(cle('pratiquesConfigurables'), null) || [];
        // ✅ CORRIGÉ (16 mars 2026) : chercher par id, puis fallback par type
        // (les anciens groupe-cours stockent le type 'pan-standards' au lieu de l'ID unique)
        var pratiqueActive = pratiqueId ? configurations.find(function(p) { return p.id === pratiqueId; }) : null;
        if (!pratiqueActive && pratiqueId) {
            pratiqueActive = configurations.find(function(p) { return p.type === pratiqueId; });
        }
        if (pratiqueActive?.affichageNote === 'lettre') {
            document.getElementById('affichageNoteLettre1').checked = true;
        } else {
            document.getElementById('affichageNoteComplet1').checked = true;
        }
    } catch(e) {
        const radioComplet = document.getElementById('affichageNoteComplet1');
        if (radioComplet) radioComplet.checked = true;
    }
}

/**
 * Prépare une nouvelle évaluation (réinitialise le formulaire ET les sélections mémorisées)
 */
function nouvelleEvaluation() {
    // Réinitialiser tous les selects
    document.getElementById('selectGroupeEval').value = '';
    document.getElementById('selectEtudiantEval').value = '';
    document.getElementById('selectProduction1').value = '';
    document.getElementById('selectGrille1').value = '';
    document.getElementById('selectEchelle1').value = '';
    document.getElementById('selectCartoucheEval').value = '';
    document.getElementById('remiseProduction1').value = 'non-recu';
    window.mettreAJourPillStatut('non-recu');
    document.getElementById('listeCriteresGrille1').innerHTML = '<p class="eval-texte-placeholder">Sélectionne une grille et une cartouche</p>';
    document.getElementById('retroactionFinale1').value = '';
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Masquer les badges de jetons et boutons de jetons
    const section = document.getElementById('gestionJetonsEvaluation');
    const boutonDelai = document.getElementById('boutonJetonDelai');
    const boutonReprise = document.getElementById('boutonJetonReprise');
    if (section) section.classList.add('u-hide');
    if (boutonDelai) boutonDelai.classList.add('u-hide');
    if (boutonReprise) boutonReprise.classList.add('u-hide');

    cocherOptionsParDefaut();

    // Annuler tout auto-save en attente (race condition) — Patch §5.6 fix #109 (étape 4)
    if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }

    // 🔄 Réinitialiser evaluationEnCours à un objet vide (pas null) pour permettre l'affichage des jetons
    window.evaluationEnCours = {
        criteres: {}
    };
    filtrerEtudiantsParGroupe();

    // 🔄 Effacer les sélections mémorisées du mode évaluation en série
    db.removeSync('dernieresSelectionsEvaluation');

    // Masquer l'indicateur de progression
    const indicateur = document.getElementById('indicateurProgressionEval');
    if (indicateur) indicateur.classList.add('u-hide');

    // Masquer l'indicateur de modification
    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.classList.add('u-hide');

    // Masquer le bouton de verrouillage et réactiver le formulaire
    afficherOuMasquerBoutonVerrouillage(false);
    desactiverFormulaireEvaluation(false);

    // Afficher les options de jetons pour nouvelle évaluation
    window.afficherGestionJetons(true);

    // Masquer le bouton Éditer (sera réaffiché au prochain chargement d'évaluation)
    var btnEditer = document.getElementById('btnEditerFichierEval');
    if (btnEditer) btnEditer.classList.add('u-hide');

    notifications.succes('Paramètres réinitialisés - Prêt pour une nouvelle série d\'évaluations');
}

/**
 * Réinitialise uniquement le formulaire (critères, notes) sans effacer les sélections
 */
function reinitialiserFormulaire() {
    // Réinitialiser uniquement les éléments du formulaire de notation
    document.getElementById('listeCriteresGrille1').innerHTML = '<p class="eval-texte-placeholder">Sélectionne une grille et une cartouche</p>';
    document.getElementById('retroactionFinale1').value = '';
    document.getElementById('noteProduction1').textContent = '0.0';
    document.getElementById('niveauProduction1').textContent = '--';

    // Réinitialiser les checkboxes jetons
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    const checkboxReprise = document.getElementById('checkboxJetonReprise');
    if (checkboxDelai) checkboxDelai.checked = false;
    if (checkboxReprise) checkboxReprise.checked = false;

    // Réinitialiser la rétroaction finale
    const retroactionFinale = document.getElementById('retroactionFinale1');
    if (retroactionFinale) retroactionFinale.value = '';

    notifications.succes('Formulaire réinitialisé - Les sélections sont conservées');
}

/**
 * Navigation vers la liste des évaluations
 */
function naviguerVersListeEvaluations() {
    afficherSousSection('evaluations-liste');
}

/**
 * Navigation vers le formulaire d'évaluation pour un étudiant et une production spécifiques
 * Appelée depuis les badges d'artefacts dans le profil étudiant
 *
 * FONCTIONNEMENT:
 * - Si l'évaluation existe déjà : charge l'évaluation existante avec notes et commentaires
 * - Si l'évaluation n'existe pas : affiche un formulaire vide prêt à évaluer
 *
 * @param {string} da - Code permanent de l'étudiant
 * @param {string} productionId - ID de la production à évaluer
 */
function evaluerProduction(da, productionId) {

    // 1. Naviguer vers la section Évaluations › Annoter et évaluer
    afficherSection('evaluations');
    afficherSousSection('evaluations-annoter');

    // Rendre le formulaire d'évaluation visible
    setTimeout(() => {
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
        const visDiv2 = document.getElementById('evaluations-contenu-visionneuse');
        if (evalDiv) evalDiv.classList.remove('u-hide');
        if (fichiersDiv) fichiersDiv.classList.add('u-hide');
        if (visDiv2) visDiv2.classList.add('u-hide');
    }, 50);

    // 2. Attendre que le DOM soit prêt et pré-remplir le formulaire
    setTimeout(() => {
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        const selectProduction = document.getElementById('selectProduction1');

        if (!selectEtudiant || !selectProduction) {
            console.error('❌ Éléments de formulaire introuvables');
            return;
        }

        // 3. Pré-sélectionner l'étudiant
        selectEtudiant.value = da;

        // 4. Déclencher le chargement des productions pour cet étudiant
        chargerEvaluationsEtudiant();

        // 5. Attendre que les productions soient chargées et pré-sélectionner la production
        setTimeout(() => {
            selectProduction.value = productionId;

            // 6. Déclencher le chargement de la production
            // Le système va automatiquement détecter si une évaluation existe (via verifierEtChargerEvaluationExistante)
            // et la charger, sinon affichera un formulaire vide
            const event = new Event('change', { bubbles: true });
            selectProduction.dispatchEvent(event);

        }, 200);
    }, 100);
}


/* ===============================
   REFONTE MODULE EVALUATION: LISTE DES ÉVALUATIONS
   Nouvelles fonctions pour la liste avec calcul des indices
   =============================== */

// === VARIABLES GLOBALES ===
let donneesEvaluationsFiltrees = [];

/* ===============================
   CALCUL DES INDICES
   =============================== */

// SUPPRIMÉ (Tier 6.2, 3 avril 2026) : calculerEtSauvegarderIndicesEvaluation()
// Écrivait dans cle('indicesEvaluation') avec une structure {DA: {completion, performance}}
// mais la clé n'est lue par aucun module. Les vrais indices C et P sont dans
// cle('indicesCP') (calculés par portfolio.js). Code mort supprimé.

/**
 * Convertit une note lettre en valeur numérique
 */
function convertirNoteEnValeur(note) {
    if (typeof note === 'number') return note;

    const conversion = {
        'M': 4, 'Maîtrise': 4,
        'I': 3, 'Intermédiaire': 3,
        'D': 2, 'Développement': 2,
        'B': 1, 'Base': 1,
        'O': 0, 'Observation': 0
    };

    return conversion[note] || 0;
}

/**
 * Obtient le nom réel d'une cartouche
 */
function obtenirNomCartouche(cartoucheId, grilleId) {
    if (!cartoucheId) return '—';

    // Si pas de grilleId, chercher dans toutes les cartouches
    if (!grilleId) {
        // #389 : keysSync (localStorage ∪ memoryCache) — une banque de cartouches
        // basculée hors localStorage (quota) disparaissait de l'évaluation.
        const cartouchesKeys = db.keysSync().filter(key => key.startsWith('cartouches_'));
        for (let key of cartouchesKeys) {
            const cartouches = db.getSync(key, []);
            const cartouche = cartouches.find(c => c.id === cartoucheId);
            if (cartouche) return cartouche.nom;
        }
        return cartoucheId; // Retourner l'ID si rien trouvé
    }

    // Chercher dans la grille spécifique
    const cartouchesKey = `cartouches_${grilleId}`;
    const cartouches = db.getSync(cle(cartouchesKey), []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    return cartouche ? cartouche.nom : cartoucheId;
}

/**
 * Obtient la classe CSS ou le style pour une note selon l'échelle
 */
function obtenirClasseNote(note, echelleId) {
    // Si pas d'échelle spécifiée, utiliser les classes par défaut
    if (!echelleId) {
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Chercher l'échelle dans localStorage
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        // Fallback sur les classes par défaut si échelle non trouvée
        const classes = {
            'M': 'note-maitrise',
            'I': 'note-intermediaire',
            'D': 'note-developpement',
            'B': 'note-base',
            'O': 'note-observation'
        };
        return classes[note] || '';
    }

    // Trouver le niveau correspondant à la note
    const niveau = echelle.niveaux?.find(n => n.lettre === note || n.nom?.startsWith(note));

    // Si on a une couleur personnalisée, retourner un style inline
    if (niveau && niveau.couleur) {
        // Retourner comme attribut style au lieu de classe
        return `style="background: ${niveau.couleur}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"`;
    }

    // Sinon utiliser les classes par défaut
    const classes = {
        'M': 'note-maitrise',
        'I': 'note-intermediaire',
        'D': 'note-developpement',
        'B': 'note-base',
        'O': 'note-observation'
    };
    return classes[note] || '';
}

/* ===============================
   AFFICHAGE DE LA LISTE
   =============================== */

/**
 * Charge et affiche la liste des évaluations avec accordéon
 */
function chargerListeEvaluationsRefonte() {

    // 🆕 NOUVEAU : Les indices sont maintenant calculés par liste-evaluations.js
    // L'ancien calcul est désactivé pour éviter les conflits de structure

    // Récupérer toutes les données
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    // 🎯 LECTURE DEPUIS LA SOURCE UNIQUE : saisie-presences.js génère indicesAssiduiteDetailles
    const indicesAssiduiteDetailles = db.getSync(cle('indicesAssiduite'), {});
    // 🎯 LECTURE DEPUIS LA SOURCE UNIQUE : portfolio.js génère indicesCP
    const indicesCP = db.getSync(cle('indicesCP'), {});

    // Détecter la pratique active — #328 L2-b1 : type dérivé de la SSOT.
    const typeActif = (typeof obtenirTypePratiqueActive === 'function') ? obtenirTypePratiqueActive() : null;
    const pratique = typeActif === 'sommative' ? 'SOM' : 'PAN';

    // Grouper les évaluations par étudiant
    const evaluationsParEtudiant = {};
    evaluations.forEach(evaluation => {
        if (!evaluationsParEtudiant[evaluation.etudiantDA]) {
            evaluationsParEtudiant[evaluation.etudiantDA] = [];
        }
        evaluationsParEtudiant[evaluation.etudiantDA].push(evaluation);
    });

    // Préparer les données pour l'affichage
    donneesEvaluationsFiltrees = etudiants.map(etudiant => {
        const evalsEtudiant = evaluationsParEtudiant[etudiant.da] || [];

        // 🎯 Lire l'indice A depuis saisie-presences.js (Single Source of Truth)
        const indiceA = indicesAssiduiteDetailles[etudiant.da]?.actuel?.indice ?? 0;

        // 🎯 Lire les indices C et P depuis portfolio.js (Single Source of Truth)
        // Utiliser la pratique active (SOM ou PAN)
        const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel?.[pratique] || null;
        const indiceC = indicesCPEtudiant && typeof indicesCPEtudiant.C === 'number' ? indicesCPEtudiant.C / 100 : 0;
        const indiceP = indicesCPEtudiant && typeof indicesCPEtudiant.P === 'number' ? indicesCPEtudiant.P / 100 : 0;

        // Calculer l'indice N (Niveau d'attention) = 1 - (A × C × P)
        const indiceN = 1 - (indiceA * indiceC * indiceP);

        return {
            ...etudiant,
            evaluations: evalsEtudiant,
            indices: {
                assiduite: indiceA,
                completion: indiceC,
                performance: indiceP,
                niveauAttention: indiceN
            }
        };
    });

    // Charger les filtres
    chargerFiltresEvaluations();

    // Afficher la liste
    afficherListeEvaluations(donneesEvaluationsFiltrees);

    // Mettre à jour les statistiques
    mettreAJourStatistiquesEvaluations();

    // Vérifier s'il y a une préférence sauvegardée
    const preference = db.getSync('preferenceTriEvaluations', null);
    if (preference) {
        // Restaurer la préférence sauvegardée
        restaurerPreferenceTri();
    } else {
        // Appliquer le tri alphabétique par défaut
        const elTri = document.getElementById('tri-evaluations');
        if (elTri) elTri.value = 'nom-asc';
        trierListeEvaluations();
    }
}

/**
 * Génère le badge de complétion selon les réglages d'affichage
 * @param {Object} etudiant - Données de l'étudiant avec indices
 * @returns {string} HTML du badge
 */
function genererBadgeCompletion(etudiant) {
    // 🎯 Lire depuis la source unique : portfolio.js génère indicesCP
    // Session C (Lot 3) : jeton SOM|PAN retiré — couche unique de la pratique active.

    // Compter uniquement les artefacts distincts (exclure les évaluations remplacées)
    const evaluationsActives = etudiant.evaluations.filter(e => !e.remplaceeParId);
    const productionsDistinctes = new Set(evaluationsActives.map(e => e.productionId));
    const nbArtefacts = productionsDistinctes.size;

    // Convertir de pourcentage (0-100) en proportion (0-1)
    let completion = 0;

    // PRIORITÉ 1 : Utiliser obtenirIndicesCP si disponible (Single Source of Truth)
    if (typeof obtenirIndicesCP === 'function') {
        const indicesCPEtudiant = obtenirIndicesCP(etudiant.da);
        if (indicesCPEtudiant && typeof indicesCPEtudiant.C === 'number' && !isNaN(indicesCPEtudiant.C)) {
            completion = indicesCPEtudiant.C / 100;
        }
    }

    // PRIORITÉ 2 : Fallback final - Calculer depuis le nombre d'artefacts
    if (completion === 0 && nbArtefacts > 0) {
        const productions = obtenirDonneesSelonMode('productions');
        const productionsAttendues = productions.filter(p => p.type !== 'portfolio').length;
        completion = productionsAttendues > 0 ? nbArtefacts / productionsAttendues : 0;
    }

    // Déterminer la couleur selon le taux de complétion
    let couleurFond = 'var(--alerte-fond-succes, #e8f5e9)'; // Vert clair par défaut
    if (completion < 0.5) {
        couleurFond = 'var(--alerte-fond-erreur, #ffebee)'; // Rouge clair
    } else if (completion < 0.75) {
        couleurFond = 'var(--alerte-fond-attention)'; // Orange clair
    }

    // Affichage unique (les indices C et P n'ont pas de modalité sommatif/alternatif)
    return `
        <span class="carte-metrique" style="padding:8px 15px; background: ${couleurFond}; border-radius: 6px;">
            <strong class="eval-texte-11">C</strong>
            <span style="font-size: 1.1rem; font-weight: 600; margin-left: 8px;">
                ${Math.round(completion * 100)}%
            </span>
            <span style="font-size: 0.75rem; color: var(--gris-moyen); margin-left: 5px;">(${nbArtefacts} artefacts)</span>
        </span>
    `;
}

/**
 * Affiche la liste des évaluations en accordéon
 */
function afficherListeEvaluations(donneesEtudiants) {
    const conteneur = document.getElementById('conteneur-evaluations-accordeon');
    const messageVide = document.getElementById('message-aucune-evaluation');

    if (!conteneur) return;

    if (donneesEtudiants.length === 0) {
        conteneur.innerHTML = '';
        conteneur.classList.add('u-hide');
        messageVide.classList.remove('u-hide');
        return;
    }

    conteneur.classList.remove('u-hide');
    messageVide.classList.add('u-hide');

    // NE PAS TRIER ICI - Le tri est géré par trierListeEvaluations()
    // La fonction affiche les données dans l'ordre reçu

    // Générer le HTML
    const html = donneesEtudiants.map(etudiant => {
        const iconToggle = '▶';

        return `
            <div class="carte etudiant-evaluation-carte" data-da="${etudiant.da}">
                <!-- En-tête cliquable -->
                <div class="etudiant-header" data-action="toggleEtudiantEval" data-param="${etudiant.da}" style="cursor:pointer; padding: 15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="toggle-icon" id="toggle-${etudiant.da}">${iconToggle}</span>
                            <strong>${(typeof anonymiserNom === 'function' && anonymiserNom(etudiant.da)) || (echapperHtml(etudiant.nom) + ', ' + echapperHtml(etudiant.prenom))}</strong>
                            <span class="badge-info">${etudiant.da}</span>
                            <span class="badge-info">${etudiant.groupe || 'Sans groupe'}</span>
                        </div>
                        <div style="display:flex; gap:15px; align-items:center;">
${genererBadgeCompletion(etudiant)}

</div>
                    </div>
                </div>
                
                <!-- Détails cachés par défaut -->
                <div class="etudiant-details" id="details-eval-${etudiant.da}" style="display:none; padding: 0 15px 15px 15px;">
                    ${genererDetailsEtudiant(etudiant)}
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;
}

/**
 * Génère le HTML des détails d'un étudiant
 */
function genererDetailsEtudiant(etudiant) {
    const evaluations = etudiant.evaluations || [];
    const productions = obtenirDonneesSelonMode('productions');

    // Créer un tableau avec TOUTES les productions et leur statut
    const tableauComplet = productions.map(production => {
        // Chercher si cette production a été évaluée pour cet étudiant
        // PRIORISER l'évaluation active (sans remplaceeParId) si elle existe
        const evaluationsProduction = evaluations.filter(e => e.productionId === production.id);
        let evaluation = null;

        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une évaluation de reprise active (repriseDeId ET non remplacée)
            // C'est l'évaluation qui doit afficher l'étoile ⭐ violette
            evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);

            // PRIORITÉ 2 : Si pas de reprise, chercher une évaluation avec jeton de délai actif
            // C'est l'évaluation qui doit afficher l'étoile ⭐ orange
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Si pas de jeton, chercher toute évaluation active (non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }

            // PRIORITÉ 4 : Si toutes sont remplacées, prendre la première (cas rare)
            if (!evaluation) {
                evaluation = evaluationsProduction[0];
            }
        }

        return {
            production: production,
            evaluation: evaluation
        };
    });

    // Générer le tableau HTML
    const tableauHTML = `
        <table class="tableau u-mt-15">
            <thead>
                <tr>
                    <th>Production</th>
                    <th>Grille</th>
                    <th>Cartouche</th>
                    <th>Note</th>
                    <th>Date</th>
                    <th>Actions</th>
                    <th class="eval-width-60" title="Verrouillage"><img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">/<img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon"></th>
                </tr>
            </thead>
            <tbody>
                ${tableauComplet.map(item => {
        if (item.evaluation) {
            // Production évaluée
            const estRemplacee = item.evaluation.remplaceeParId ? true : false;
            const estReprise = item.evaluation.repriseDeId ? true : false;

            // Formater la note combinée
                                const noteLettre = item.evaluation.niveauFinal || '--';
                                const notePourcent = item.evaluation.noteFinale !== null ? Math.round(item.evaluation.noteFinale) : 0;
                                const noteAffichage = noteLettre !== '--' ? `${noteLettre} (${notePourcent}%)` : `— (${notePourcent}%)`;

                                return `
                            <tr ${estRemplacee ? 'class="eval-desactive"' : ''}>
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>${echapperHtml(item.evaluation.grilleNom || '—')}</td>
                                <td>${echapperHtml(obtenirNomCartouche(item.evaluation.cartoucheId, item.evaluation.grilleId) || '—')}</td>
                                <td>
                                    <span ${obtenirClasseNote(item.evaluation.niveauFinal, item.evaluation.echelleId)}>
                                        ${noteAffichage}
                                    </span>
                                    ${estRemplacee ? '<span class="badge-statut eval-ml-6">Remplacée</span>' : ''}
                                    ${estReprise ? '<span style="color: var(--violet-jeton, #9c27b0); font-size: 1.2rem; margin-left: 6px;" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${item.evaluation.jetonDelaiApplique ? '<span style="color: var(--orange-accent); font-size: 1.2rem; margin-left: 6px;" title="Jeton de délai appliqué">⭐</span>' : ''}
                                </td>
                                <td>${item.evaluation.dateEvaluation ? new Date(item.evaluation.dateEvaluation).toLocaleDateString('fr-CA') : '—'}</td>
                                <td>
                                    ${estRemplacee ? `
                                        <button class="btn btn-modifier btn-compact" data-action="modifierEvaluation" data-param="${item.evaluation.id}">
                                            Consulter
                                        </button>
                                    ` : `
                                        <button class="btn btn-modifier btn-compact" data-action="modifierEvaluation" data-param="${item.evaluation.id}">
                                            Consulter
                                        </button>
                                        <button class="btn btn-supprimer btn-compact" data-tooltip="eval-btn-supprimer" data-action="supprimerEvaluation" data-param="${item.evaluation.id}" ${item.evaluation.verrouillee ? 'disabled title="Déverrouillez d\'abord pour supprimer"' : ''}>
                                            Supprimer
                                        </button>
                                    `}
                                </td>
                                <td class="u-text-center">
                                    ${estRemplacee ? '' : `
                                        <span id="cadenas-${item.evaluation.id}"
                                              data-action="basculerVerrouillageEvaluation" data-param="${item.evaluation.id}"
                                              style="font-size: 1.2rem; cursor: pointer; user-select: none;"
                                              title="${item.evaluation.verrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                                            ${item.evaluation.verrouillee ? '<img src="icons/icon-lock.svg" alt="Verrouillée" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">'}
                                        </span>
                                    `}
                                </td>
                            </tr>
                        `;
        } else {
            // Production non évaluée
            return `
                            <tr class="u-opacity-07">
                                <td>${echapperHtml(item.production.titre || item.production.nom || '—')}</td>
                                <td>—</td>
                                <td>—</td>
                                <td>
                                    <span class="badge-statut">
                                        Non remis
                                    </span>
                                </td>
                                <td>—</td>
                                <td>
                                    <button class="btn btn-confirmer btn-compact" data-action="evaluerProduction" data-param="${etudiant.da}" data-param2="${item.production.id}">
                                        Évaluer
                                    </button>
                                </td>
                                <td>—</td>
                            </tr>
                        `;
        }
    }).join('')}
            </tbody>
        </table>
    `;

    // Ajouter le résumé
    const nbAttendus = productions.filter(p => p.type !== 'portfolio').length;

    // Compter les artefacts distincts actifs (exclure remplacées)
    const evaluationsActives = evaluations.filter(e => !e.remplaceeParId);
    const productionsDistinctes = new Set(evaluationsActives.map(e => e.productionId));
    const nbRemis = productionsDistinctes.size;

    // Lire les indices depuis la source unique (portfolio.js)
    const indicesCP = db.getSync(cle('indicesCP'), {});
    const indicesCPEtudiant = indicesCP[etudiant.da]?.actuel || null;

    // Lire C et P directement depuis actuel (structure plate, plus de branches SOM/PAN)
    const tauxCompletion = indicesCPEtudiant?.C ?? (nbAttendus > 0 ? Math.round((nbRemis / nbAttendus) * 100) : 0);

    // Calcul de la performance moyenne avec fallback
    let performanceMoyenne = 0;
    if (indicesCPEtudiant && typeof indicesCPEtudiant.P === 'number' && !isNaN(indicesCPEtudiant.P)) {
        performanceMoyenne = Math.round(indicesCPEtudiant.P);
    } else if (evaluationsActives.length > 0) {
        // Fallback : calculer la moyenne des notes des évaluations actives
        const sommeNotes = evaluationsActives.reduce((sum, e) => sum + (e.noteFinale || 0), 0);
        performanceMoyenne = Math.round(sommeNotes / evaluationsActives.length);
    }

    const nbRemplacees = evaluations.filter(e => e.remplaceeParId).length;
    const nbReprises = evaluations.filter(e => e.repriseDeId).length;
    const nbDelais = evaluations.filter(e => e.jetonDelaiApplique && !e.remplaceeParId).length;

    const resumeHTML = `
        <div class="carte" style="margin-top: 15px; background: var(--bleu-pale);">
            <h4 style="margin-bottom: 10px;">Résumé de l'étudiant</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <strong>Artefacts remis:</strong> ${nbRemis} / ${nbAttendus}
                </div>
                <div>
                    <strong>Performance moyenne:</strong> ${performanceMoyenne}%
                </div>
                <div>
                    <strong>Tendance:</strong> ${obtenirTendance(evaluationsActives)}
                </div>
            </div>
        </div>
    `;

    return tableauHTML + resumeHTML;
}

/**
 * Toggle l'affichage des détails d'un étudiant
 */
function toggleEtudiantEval(da) {
    const details = document.getElementById(`details-eval-${da}`);
    const toggle = document.getElementById(`toggle-${da}`);

    if (!details) return;

    if (details.classList.contains('u-hide')) {
        details.classList.remove('u-hide');
        if (toggle) toggle.textContent = '▼';
    } else {
        details.classList.add('u-hide');
        if (toggle) toggle.textContent = '▶';
    }
}

/* ===============================
   🔍 FILTRAGE
   =============================== */

/**
 * Charge les options de filtrage
 */
function chargerFiltresEvaluations() {
    // Charger les groupes
    const selectGroupe = document.getElementById('filtre-groupe-eval');
    if (selectGroupe) {
        const groupes = [...new Set(donneesEvaluationsFiltrees.map(e => e.groupe).filter(g => g))];
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>' +
            groupes.sort().map(groupe =>
                `<option value="${echapperHtml(groupe)}">Groupe ${echapperHtml(groupe)}</option>`
            ).join('');
    }

    // Charger les productions
    const selectProduction = document.getElementById('filtre-production-eval');
    if (selectProduction) {
        const productions = obtenirDonneesSelonMode('productions');
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>' +
            productions.map(prod => `<option value="${echapperHtml(prod.id)}">${echapperHtml(prod.titre || prod.nom)}</option>`).join('');
    }
}

/**
 * Recharge le filtre de production
 * (Appelée depuis productions.js après ajout/modification d'une production)
 */
function rechargerFiltreProduction() {
    const selectProduction = document.getElementById('filtre-production-eval');
    if (selectProduction) {
        const productions = obtenirDonneesSelonMode('productions');
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>' +
            productions.map(prod => `<option value="${echapperHtml(prod.id)}">${echapperHtml(prod.titre || prod.nom)}</option>`).join('');
    }
}

/**
 * Réinitialise tous les filtres
 * OBSOLETE: Cette fonction est maintenant gérée par liste-evaluations.js
 * Ne pas redéfinir ici pour éviter d'écraser la fonction moderne
 */
// function reinitialiserFiltresEval() {
//     // FONCTION OBSOLÈTE - Voir liste-evaluations.js ligne 377
//     // La fonction moderne reinitialiserFiltres() est exportée comme window.reinitialiserFiltresEval
// }

/**
 * Trie la liste des évaluations selon le critère sélectionné
 */
function trierListeEvaluations() {
    const selectTri = document.getElementById('tri-evaluations');
    if (!selectTri) return;

    const critere = selectTri.value;
    let donneesTries = [...donneesEvaluationsFiltrees];

    // Debug - voir avant le tri

    switch (critere) {
        case 'nom-asc':
            donneesTries.sort((a, b) => {
                const nomA = (a.nom || '').toLowerCase();
                const nomB = (b.nom || '').toLowerCase();
                return nomA.localeCompare(nomB, 'fr');
            });
            break;

        case 'assiduite-asc':
            donneesTries.sort((a, b) => a.indices.assiduite - b.indices.assiduite);
            break;

        case 'assiduite-desc':
            donneesTries.sort((a, b) => b.indices.assiduite - a.indices.assiduite);
            break;

        case 'completion-asc':
            donneesTries.sort((a, b) => a.indices.completion - b.indices.completion);
            break;

        case 'completion-desc':
            donneesTries.sort((a, b) => b.indices.completion - a.indices.completion);
            break;

        case 'performance-asc':
            donneesTries.sort((a, b) => a.indices.performance - b.indices.performance);
            break;

        case 'performance-desc':
            donneesTries.sort((a, b) => b.indices.performance - a.indices.performance);
            break;

        case 'niveau-attention-asc':
            donneesTries.sort((a, b) => a.indices.niveauAttention - b.indices.niveauAttention);
            break;

        case 'niveau-attention-desc':
            donneesTries.sort((a, b) => b.indices.niveauAttention - a.indices.niveauAttention);
            break;
    }

    // Debug - voir après le tri

    // IMPORTANT : Mettre à jour la variable globale
    donneesEvaluationsFiltrees = donneesTries;

    // Réafficher avec les données triées
    afficherListeEvaluations(donneesTries);

    // Sauvegarder la préférence
    db.setSync('preferenceTriEvaluations', critere);
}

/**
 * Restaure la préférence de tri sauvegardée
 */
function restaurerPreferenceTri() {
    const preference = db.getSync('preferenceTriEvaluations', null);
    if (preference) {
        const selectTri = document.getElementById('tri-evaluations');
        if (selectTri) {
            selectTri.value = preference;
            trierListeEvaluations();
        }
    }
}

/* ===============================
   STATISTIQUES
   =============================== */

/**
 * Met à jour les statistiques globales
 */
function mettreAJourStatistiquesEvaluations() {
    const etudiants = donneesEvaluationsFiltrees;
    const nbEtudiants = etudiants.length;
    const etudiantsEvalues = etudiants.filter(e => e.evaluations.length > 0).length;

    // 🎯 Calculer le total d'artefacts DONNÉS (même logique que portfolio.js)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions');

    // Identifier les artefacts-portfolio
    const artefactsPortfolioIds = new Set(
        productions
            .filter(p => p.type === 'artefact-portfolio')
            .map(a => a.id)
    );

    // Identifier les artefacts réellement donnés (avec au moins une évaluation)
    const artefactsDonnes = new Set();
    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            artefactsDonnes.add(evaluation.productionId);
        }
    });

    const nbArtefactsDonnes = artefactsDonnes.size;
    const totalArtefactsAttendus = nbEtudiants * nbArtefactsDonnes;
    const totalArtefactsRemis = etudiants.reduce((sum, e) => sum + e.evaluations.length, 0);

    // Calculer les moyennes C et P
    const moyenneC = nbEtudiants > 0
        ? etudiants.reduce((sum, e) => sum + (e.indices.completion || 0), 0) / nbEtudiants
        : 0;
    const moyenneP = nbEtudiants > 0
        ? etudiants.reduce((sum, e) => sum + (e.indices.performance || 0), 0) / nbEtudiants
        : 0;

    // Mettre à jour l'affichage
    const statEtudiants = document.getElementById('stat-etudiants-evalues');
    if (statEtudiants) {
        statEtudiants.textContent = `${etudiantsEvalues}/${nbEtudiants}`;
    }

    const statArtefacts = document.getElementById('stat-artefacts-completes');
    if (statArtefacts) {
        statArtefacts.textContent = `${totalArtefactsRemis}/${totalArtefactsAttendus}`;
    }

    const statMoyenne = document.getElementById('stat-moyenne-groupe');
    if (statMoyenne) {
        statMoyenne.innerHTML = `<strong>C:</strong> ${Math.round(moyenneC * 100)}%`;
    }
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

// ✅ Fonction obtenirNomCartouche() supprimée (doublon incorrect)
// La version correcte est définie ligne 1107

/**
 * Formate une date ISO en format court "2026-02-06" (fr-CA par défaut)
 * Distinct de formaterDate() canonique qui retourne "6 février 2026"
 */
function formaterDateISO(dateISO) {
    if (!dateISO) return '—';
    const date = new Date(dateISO + 'T12:00:00');
    return date.toLocaleDateString('fr-CA');
}

/**
 * Détermine la tendance d'un étudiant
 */
function obtenirTendance(evaluations) {
    if (evaluations.length < 2) return '—';

    // Trier par date (plus récente en premier)
    const triees = [...evaluations].sort((a, b) =>
        new Date(b.dateEvaluation || b.dateRemise || 0) - new Date(a.dateEvaluation || a.dateRemise || 0)
    );

    if (triees.length < 2) return '—';

    // Comparer les 2 dernières évaluations
    const derniere = convertirNoteEnValeur(triees[0].niveauFinal);
    const avantDerniere = convertirNoteEnValeur(triees[1].niveauFinal);

    if (derniere > avantDerniere) return '↗ En progression';
    if (derniere < avantDerniere) return '↘ En régression';
    return '→ Stable';
}

/* ===============================
   🚀 INITIALISATION
   =============================== */

/**
 * Ajouter à la fonction d'initialisation existante
 */
// DÉSACTIVÉ : Cette fonction est maintenant gérée par liste-evaluations.js (vue tableau)
// function initialiserListeEvaluations() {
//
//     const sousSection = document.getElementById('evaluations-liste');
//     if (!sousSection) {
//         return;
//     }
//
//     // Charger la liste refaite
//     chargerListeEvaluationsRefonte();
//
// }

// Appeler lors du changement vers cette sous-section
// Ou ajouter dans le module existant

/* ===============================
   🔄 MODE ÉVALUATION EN SÉRIE
   Mémorisation et navigation fluide pour évaluer plusieurs étudiants
   =============================== */

/**
 * Mémorise les sélections actuelles pour réutilisation
 * Appelée automatiquement lors des changements de select
 */
function memoriserSelectionsEvaluation() {
    // Ne pas mémoriser pendant le setup (afficherPalettesEval) pour éviter
    // d'écraser les bonnes valeurs avec des selects encore vides
    if (window._bloquerMemorisation) return;

    const selections = {
        production: document.getElementById('selectProduction1')?.value || '',
        grille: document.getElementById('selectGrille1')?.value || '',
        echelle: document.getElementById('selectEchelle1')?.value || '',
        cartouche: document.getElementById('selectCartoucheEval')?.value || '',
        remise: document.getElementById('remiseProduction1')?.value || 'evalue',
        // Options d'affichage
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };

    db.setSync('dernieresSelectionsEvaluation', selections);
}

/**
 * Sauvegarde les sélections actuelles pour les restaurer lors de la navigation
 * Appelée avant de changer d'étudiant (Précédent/Suivant)
 */
function sauvegarderSelectionsEvaluation() {
    const selectProduction = document.getElementById('selectProduction1');
    const selectGrille = document.getElementById('selectGrille1');
    const selectEchelle = document.getElementById('selectEchelle1');
    const selectCartouche = document.getElementById('selectCartoucheEval');
    const selectRemise = document.getElementById('remiseProduction1');

    const selections = {
        production: selectProduction?.value || '',
        grille: selectGrille?.value || '',
        echelle: selectEchelle?.value || '',
        cartouche: selectCartouche?.value || '',
        remise: selectRemise?.value || '',
        afficherDescription: document.getElementById('afficherDescription1')?.checked ?? true,
        afficherObjectif: document.getElementById('afficherObjectif1')?.checked ?? true,
        afficherTache: document.getElementById('afficherTache1')?.checked ?? true,
        afficherAdresse: document.getElementById('afficherAdresse1')?.checked ?? true,
        afficherContexte: document.getElementById('afficherContexte1')?.checked ?? true,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };

    db.setSync('dernieresSelectionsEvaluation', JSON.stringify(selections));
}

/**
 * Restaure les dernières sélections utilisées
 * Appelée lors du passage à un nouvel étudiant
 */
function restaurerSelectionsEvaluation() {
    const selectionsRaw = db.getSync('dernieresSelectionsEvaluation', null);
    if (!selectionsRaw) return;

    try {
        // Supporter les deux formats : objet (memoriser) et string JSON (sauvegarder)
        const selections = (typeof selectionsRaw === 'string') ? JSON.parse(selectionsRaw) : selectionsRaw;

        // Restaurer les selects
        const selectProduction = document.getElementById('selectProduction1');
        const selectGrille = document.getElementById('selectGrille1');
        const selectEchelle = document.getElementById('selectEchelle1');
        const selectCartouche = document.getElementById('selectCartoucheEval');
        const selectRemise = document.getElementById('remiseProduction1');

        if (selectProduction && selections.production) {
            selectProduction.value = selections.production;
            // Déclencher le changement pour charger les dépendances
            const event = new Event('change', { bubbles: true });
            selectProduction.dispatchEvent(event);
        }

        // Attendre un court instant pour que les selects dépendants se remplissent
        setTimeout(() => {
            if (selectGrille && selections.grille) {
                selectGrille.value = selections.grille;
                selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
            }

            setTimeout(() => {
                if (selectEchelle && selections.echelle) {
                    selectEchelle.value = selections.echelle;
                }
                if (selectCartouche && selections.cartouche) {
                    selectCartouche.value = selections.cartouche;
                    selectCartouche.dispatchEvent(new Event('change', { bubbles: true }));
                }
                if (selectRemise && selections.remise) {
                    selectRemise.value = selections.remise;
                    window.mettreAJourPillStatut(selections.remise);
                    selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Restaurer les options d'affichage
                const checkboxes = {
                    'afficherDescription1': selections.afficherDescription,
                    'afficherObjectif1': selections.afficherObjectif,
                    'afficherTache1': selections.afficherTache,
                    'afficherAdresse1': selections.afficherAdresse,
                    'afficherContexte1': selections.afficherContexte
                };

                Object.entries(checkboxes).forEach(([id, value]) => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) checkbox.checked = value ?? true;
                });

                // Appliquer affichageNote depuis la PRATIQUE ACTIVE (pas la mémorisation)
                try {
                    var _pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
                        ? obtenirPratiqueActiveGroupeCours() : null;
                    var _configs = db.getSync(cle('pratiquesConfigurables'), null) || [];
                    var _pratique = _pratiqueId ? _configs.find(function(p) { return p.id === _pratiqueId; }) : null;
                    if (!_pratique && _pratiqueId) {
                        _pratique = _configs.find(function(p) { return p.type === _pratiqueId; });
                    }
                    if (_pratique?.affichageNote === 'lettre') {
                        document.getElementById('affichageNoteLettre1').checked = true;
                    } else {
                        document.getElementById('affichageNoteComplet1').checked = true;
                    }
                } catch(_e) {
                    var _rc = document.getElementById('affichageNoteComplet1');
                    if (_rc) _rc.checked = true;
                }

                // Après restauration, vérifier s'il existe une évaluation sauvegardée pour cet étudiant
                setTimeout(() => {
                    verifierEtChargerEvaluationExistante();
                }, 200);
            }, 100);
        }, 100);
    } catch (error) {
        console.error('Erreur lors de la restauration des sélections:', error);
    }
}

/**
 * Vérifie s'il existe une évaluation sauvegardée pour l'étudiant et la production actuels
 * et charge les niveaux de maîtrise si elle existe
 */
function verifierEtChargerEvaluationExistante() {
    // 🔧 FIX (20 mars 2026) : Ne pas interférer quand modifierEvaluation charge une évaluation spécifique
    if (window._modifierEvaluationEnCours) {
        return;
    }

    // Suspendre l'auto-save pendant la cascade de restauration (selects de
    // critères dispatch des events 'change' qui trigger niveauSelectionne →
    // _debouncerAutoSave). Sans cette suspension, un snapshot pris entre le
    // reset partiel et la restauration finale peut écraser les valeurs déjà
    // persistées en DB (criteres, donneesAlgorithmiques) par un état tronqué.
    if (typeof _suspendreAutoSaveTemporairement === 'function') {
        _suspendreAutoSaveTemporairement();
    }

    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    // Ne pas écraser si modifierEvaluation a déjà chargé une évaluation spécifique
    // pour ce même étudiant+production (protège originale remplacée ET reprise)
    if (window.evaluationEnCours?.idModification &&
        window.evaluationEnCours?.etudiantDA === etudiantDA &&
        window.evaluationEnCours?.productionId === productionId) {
        return;
    }

    if (!etudiantDA || !productionId) {
        return;
    }

    // Chercher une évaluation existante
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationExistante = evaluations.find(e =>
        e.etudiantDA === etudiantDA &&
        e.productionId === productionId &&
        !e.remplaceeParId // Exclure les évaluations remplacées par un jeton
    );

    if (!evaluationExistante) {

        // Masquer l'indicateur de verrouillage et réactiver le formulaire
        afficherOuMasquerBoutonVerrouillage(false);
        desactiverFormulaireEvaluation(false);

        // Réinitialiser l'ID de modification si présent
        if (window.evaluationEnCours?.idModification) {
            delete window.evaluationEnCours.idModification;
        }

        // Réinitialiser les données algorithmiques (codes d'erreurs, nombre de mots)
        if (window.evaluationEnCours) {
            window.evaluationEnCours.donneesAlgorithmiques = {};
        }

        // Vider les champs algorithmiques dans le DOM
        // IDs: eval_categories_*, eval_erreurs_*, eval_mots_*, resultat_algo_*
        const champsCategories = document.querySelectorAll('input[id^="eval_categories_"]');
        const champsErreurs = document.querySelectorAll('input[id^="eval_erreurs_"]');
        const champsMots = document.querySelectorAll('input[id^="eval_mots_"]');
        const zonesResultat = document.querySelectorAll('div[id^="resultat_algo_"]');

        champsCategories.forEach(input => input.value = '');
        champsErreurs.forEach(input => input.value = '');
        champsMots.forEach(input => input.value = '');
        zonesResultat.forEach(div => {
            const spans = div.querySelectorAll('span');
            spans.forEach(span => span.textContent = '--');
        });

        // Masquer les badges de jetons
        const section = document.getElementById('gestionJetonsEvaluation');
        if (section) section.classList.add('u-hide');

        // Régénérer la rétroaction avec les options d'affichage actuelles
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
        return;
    }

    // Charger la grille (AVANT la cartouche — nécessaire pour peupler les options cartouche)
    if (evaluationExistante.grilleId) {
        const selectGrille = document.getElementById('selectGrille1');
        if (selectGrille) {
            selectGrille.value = evaluationExistante.grilleId;
            // Peupler les cartouches pour cette grille
            chargerGrilleSelectionnee();
        }
    }

    // Charger la cartouche (les options existent maintenant grâce à chargerGrilleSelectionnee)
    if (evaluationExistante.cartoucheId) {
        const selectCartouche = document.getElementById('selectCartoucheEval');
        if (selectCartouche) {
            selectCartouche.value = evaluationExistante.cartoucheId;
        }
    }

    // Charger le statut de remise
    if (evaluationExistante.statutRemise) {
        const selectRemise = document.getElementById('remiseProduction1');
        if (selectRemise) {
            // Mapper les anciens statuts vers les nouveaux
            const statutMap = { 'non-remis': 'non-recu', 'remis': 'evalue' };
            selectRemise.value = statutMap[evaluationExistante.statutRemise] || evaluationExistante.statutRemise;
            window.mettreAJourPillStatut(selectRemise.value);
        }
    }

    // Charger l'échelle (si elle existe)
    if (evaluationExistante.echelleId) {
        const selectEchelle = document.getElementById('selectEchelle1');
        if (selectEchelle) {
            selectEchelle.value = evaluationExistante.echelleId;
        }
    }

    // Déclencher l'affichage des critères maintenant que cartouche et statut sont chargés
    cartoucheSelectionnee();

    // Charger les niveaux de maîtrise dans les selects de critères
    // Attendre que les selects soient générés
    setTimeout(() => {
        let criteresCharges = 0;

        evaluationExistante.criteres.forEach(critere => {
            const selectId = `eval_${critere.critereId}`;
            const selectCritere = document.getElementById(selectId);

            if (selectCritere) {
                // Vérifier si c'est un critère algorithmique avec données sauvegardées
                const estAlgorithmique = evaluationExistante.donneesAlgorithmiques &&
                                         evaluationExistante.donneesAlgorithmiques[critere.critereId] &&
                                         evaluationExistante.donneesAlgorithmiques[critere.critereId].pourcentage !== undefined;

                if (estAlgorithmique) {
                    // Pour les critères algorithmiques, laisser le select VIDE
                    // Le niveau sera calculé automatiquement à partir des données algorithmiques
                    selectCritere.value = '';
                } else {
                    // Pour les critères normaux, restaurer le niveau sélectionné
                    selectCritere.value = critere.niveauSelectionne;
                }
                selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
                criteresCharges++;
            }
        });

        // Charger la rétroaction finale
        // ✅ CORRECTION (30 déc 2025): Anonymiser le texte si en mode Anonymisé
        const retroaction = document.getElementById('retroactionFinale1');
        if (retroaction && evaluationExistante.retroactionFinale) {
            // Utiliser anonymiserTexteRetroaction() pour remplacer les prénoms réels
            const texteRetroaction = typeof anonymiserTexteRetroaction === 'function'
                ? anonymiserTexteRetroaction(evaluationExistante.retroactionFinale, evaluationExistante.etudiantDA)
                : evaluationExistante.retroactionFinale;
            retroaction.value = texteRetroaction;
        }
        // Patch §5.6 — promotion mettreAJourCompteurMots vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.mettreAJourCompteurMots();

        // Mettre à jour evaluationEnCours pour indiquer qu'on modifie cette évaluation
        if (window.evaluationEnCours) {
            window.evaluationEnCours.idModification = evaluationExistante.id;
            window.evaluationEnCours.delaiAccorde = evaluationExistante.delaiAccorde || false;
            window.evaluationEnCours.grilleId = evaluationExistante.grilleId;
            window.evaluationEnCours.echelleId = evaluationExistante.echelleId;
            window.evaluationEnCours.cartoucheId = evaluationExistante.cartoucheId;
            window.evaluationEnCours.statutRemise = evaluationExistante.statutRemise;
            window.evaluationEnCours.criteres = {};
            evaluationExistante.criteres.forEach(c => {
                window.evaluationEnCours.criteres[c.critereId] = c.niveauSelectionne;
            });

            // Restaurer les données algorithmiques (français écrit)
            if (evaluationExistante.donneesAlgorithmiques && Object.keys(evaluationExistante.donneesAlgorithmiques).length > 0) {

                // Sauvegarder dans evaluationEnCours
                window.evaluationEnCours.donneesAlgorithmiques = evaluationExistante.donneesAlgorithmiques;

                Object.keys(evaluationExistante.donneesAlgorithmiques).forEach(critereId => {
                    const donnees = evaluationExistante.donneesAlgorithmiques[critereId];

                    // Restaurer le champ des codes (si existant - catégories)
                    if (donnees.codes && Array.isArray(donnees.codes)) {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        if (inputCategories) {
                            inputCategories.value = donnees.codes.join(';');
                        }
                    }

                    // Restaurer le champ du nombre de mots
                    if (donnees.mots !== undefined) {
                        const inputMots = document.getElementById(`eval_mots_${critereId}`);
                        if (inputMots) {
                            inputMots.value = donnees.mots;
                        }
                    }

                    // Restaurer le champ d'erreurs (si mode simple - sans catégorisation)
                    // CORRECTION: Supporter aussi totalErreurs pour compatibilité avec anciennes évaluations
                    const nbErreurs = donnees.erreurs !== undefined ? donnees.erreurs : donnees.totalErreurs;
                    if (nbErreurs !== undefined) {
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
                        if (inputErreurs) {
                            inputErreurs.value = nbErreurs;
                        }
                    }

                    // Déclencher le recalcul pour afficher les résultats
                    setTimeout(() => {
                        const inputCategories = document.getElementById(`eval_categories_${critereId}`);
                        const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);

                        if (inputCategories) {
                            inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
                        } else if (inputErreurs) {
                            inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, 100);
                });

            }

            // Note: Jetons de délai sont maintenant gérés par les badges cliquables
            // Plus besoin de restaurer une checkbox

            // Afficher l'indicateur de verrouillage si l'évaluation existe
            afficherOuMasquerBoutonVerrouillage(true, evaluationExistante.verrouillee || false);

            // Désactiver le formulaire si l'évaluation est verrouillée
            if (evaluationExistante.verrouillee) {
                desactiverFormulaireEvaluation(true);
            } else {
                desactiverFormulaireEvaluation(false);
            }

            // Afficher les badges des jetons appliqués
            window.afficherBadgesJetons();
        }

        // Recalculer la note APRÈS restauration des données algorithmiques
        // IMPORTANT: Délai de 350ms pour s'assurer que les données algorithmiques
        // sont restaurées (100ms) et que leur recalcul est déclenché (100ms de plus)
        setTimeout(() => {
            // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
            if (typeof window.calculerNote === 'function') {
                window.calculerNote();
            }
            // Restaurer les options d'affichage sauvegardées dans l'évaluation
            if (evaluationExistante.optionsAffichage) {
                const opts = evaluationExistante.optionsAffichage;
                const checkboxMap = {
                    'afficherDescription1': opts.description,
                    'afficherObjectif1': opts.objectif,
                    'afficherTache1': opts.tache,
                    'afficherAdresse1': opts.adresse,
                    'afficherContexte1': opts.contexte
                };
                Object.entries(checkboxMap).forEach(([id, val]) => {
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = val ?? true;
                });
                if (opts.affichageNote === 'lettre') {
                    const r = document.getElementById('affichageNoteLettre1');
                    if (r) r.checked = true;
                } else {
                    const r = document.getElementById('affichageNoteComplet1');
                    if (r) r.checked = true;
                }
            }
            // Régénérer la rétroaction avec les options d'affichage restaurées
            // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
            window.genererRetroaction(1);
        }, 350);
    }, 300);
}

/**
 * Navigue vers l'étudiant précédent dans la liste
 */
function naviguerEtudiantPrecedent() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant || !selectEtudiant.value) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const indexActuel = options.findIndex(opt => opt.value === selectEtudiant.value);

    if (indexActuel > 0) {
        // Changer l'étudiant sélectionné
        selectEtudiant.value = options[indexActuel - 1].value;

        // ✅ Charger le nouvel étudiant (préserve production/grille/échelle, réinitialise critères)
        chargerEvaluationsEtudiant();

        mettreAJourIndicateurProgression();
    }
}

/**
 * Navigue vers l'étudiant suivant dans la liste
 */
function naviguerEtudiantSuivant() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant || !selectEtudiant.value) return;

    const options = Array.from(selectEtudiant.options).filter(opt => opt.value !== '');
    const indexActuel = options.findIndex(opt => opt.value === selectEtudiant.value);

    if (indexActuel >= 0 && indexActuel < options.length - 1) {
        // Changer l'étudiant sélectionné
        selectEtudiant.value = options[indexActuel + 1].value;

        // ✅ Charger le nouvel étudiant (préserve production/grille/échelle, réinitialise critères)
        chargerEvaluationsEtudiant();

        mettreAJourIndicateurProgression();
    }
}

/**
 * Met à jour l'indicateur de progression (X/Y évaluations réalisées)
 */
function mettreAJourIndicateurProgression() {
    const selectProduction = document.getElementById('selectProduction1');
    const indicateur = document.getElementById('indicateurProgressionEval');

    if (!selectProduction || !indicateur) return;

    const productionId = selectProduction.value;

    // Si aucune production sélectionnée, masquer l'indicateur
    if (!productionId) {
        indicateur.classList.add('u-hide');
        return;
    }

    // Compter le nombre total d'étudiants actifs
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));
    const totalEtudiants = etudiantsActifs.length;

    // Compter les évaluations déjà réalisées pour cette production
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationsProduction = evaluations.filter(e => e.productionId === productionId);

    // Compter les étudiants uniques évalués (au cas où il y aurait plusieurs évaluations par étudiant)
    const etudiantsEvalues = new Set(evaluationsProduction.map(e => e.etudiantDA));
    const nbEvaluations = etudiantsEvalues.size;

    // Afficher le compteur
    indicateur.textContent = `${nbEvaluations}/${totalEtudiants} évaluations`;
    indicateur.classList.remove('u-hide');

    // Changer la couleur selon la progression
    if (nbEvaluations === totalEtudiants) {
        indicateur.style.color = 'var(--vert-succes)'; // Vert - Terminé
    } else if (nbEvaluations > totalEtudiants / 2) {
        indicateur.style.color = 'var(--accent-primaire)'; // Bleu - En cours (meilleur contraste)
    } else {
        indicateur.style.color = 'var(--accent-primaire)'; // Bleu - Début
    }
}

/**
 * Attache les événements de mémorisation aux selects
 * Appelée lors de l'initialisation du module
 */
function attacherEvenementsMemorisation() {
    const selectsAMemoriser = [
        'selectProduction1',
        'selectGrille1',
        'selectEchelle1',
        'selectCartoucheEval',
        'remiseProduction1'
    ];

    selectsAMemoriser.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.dataset.memoAttache) {
            select.addEventListener('change', memoriserSelectionsEvaluation);
            select.dataset.memoAttache = '1';
        }
    });

    // Mémoriser aussi les checkboxes
    const checkboxesAMemoriser = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    checkboxesAMemoriser.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && !checkbox.dataset.memoAttache) {
            checkbox.addEventListener('change', memoriserSelectionsEvaluation);
            checkbox.dataset.memoAttache = '1';
        }
    });

    // Mémoriser aussi les radios affichageNote
    ['affichageNoteComplet1', 'affichageNoteLettre1'].forEach(id => {
        const radio = document.getElementById(id);
        if (radio && !radio.dataset.memoAttache) {
            radio.addEventListener('change', memoriserSelectionsEvaluation);
            radio.dataset.memoAttache = '1';
        }
    });
}

/**
 * Insère les boutons de navigation et l'indicateur dans l'interface
 */
function insererNavigationEvaluationSerie() {
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (!selectEtudiant) return;

    // Vérifier si déjà inséré
    if (document.getElementById('navigationEvaluationSerie')) return;

    // Créer le conteneur de navigation
    const nav = document.createElement('div');
    nav.id = 'navigationEvaluationSerie';
    nav.style.cssText = 'display: flex; gap: 10px; align-items: center; margin: 15px 0; justify-content: center;';

    nav.innerHTML = `
        <button class="btn btn-principal btn-compact" data-action="naviguerEtudiantPrecedent"
                title="Évaluer l'étudiant·e précédent·e"
                style="padding: 6px 10px; min-width: auto; font-size: 0.9rem;">
            ←
        </button>

        <span id="indicateurProgressionEval"
              style="font-weight: 400; color: var(--gris-moyen); padding: 0 10px; display: inline-block; font-size: 0.85rem;">
            0/0 évaluations
        </span>

        <button class="btn btn-principal btn-compact" data-action="naviguerEtudiantSuivant"
                title="Évaluer l'étudiant·e suivant·e"
                style="padding: 6px 10px; min-width: auto; font-size: 0.9rem;">
            →
        </button>

        <button id="btnVoirProfilDepuisEval" class="btn btn-secondaire btn-compact"
                data-action="ouvrirProfilDepuisEvaluation"
                style="margin-left: 10px; display: none; padding: 6px 10px; min-width: auto; font-size: 0.85rem;"
                title="Voir le profil de l'étudiant·e">
            <img src="icons/icon-profile.svg" alt="" class="btn-inline-icon">
        </button>

        <button id="btnVoirTravailDepuisEval" class="btn btn-secondaire btn-compact"
                data-action="ouvrirTravailDepuisEvaluation"
                style="margin-left: 6px; display: none; padding: 6px 10px; min-width: auto; font-size: 0.85rem;"
                title="Voir le travail de l'étudiant·e">
            <img src="icons/icon-pdf.svg" alt="" class="btn-inline-icon"> Travail
        </button>
    `;

    // Insérer après le select étudiant
    const parentContainer = selectEtudiant.closest('.form-group') || selectEtudiant.parentElement;
    if (parentContainer && parentContainer.nextSibling) {
        parentContainer.parentNode.insertBefore(nav, parentContainer.nextSibling);
    } else {
        selectEtudiant.parentElement?.appendChild(nav);
    }

}

/**
 * Initialise le mode évaluation en série
 * À appeler depuis initialiserModuleEvaluation()
 */
function initialiserModeEvaluationSerie() {
    // Insérer l'interface de navigation
    insererNavigationEvaluationSerie();

    // Attacher les événements de mémorisation
    attacherEvenementsMemorisation();

    // Restaurer les dernières sélections si elles existent
    const selectEtudiant = document.getElementById('selectEtudiantEval');
    if (selectEtudiant && selectEtudiant.value) {
        restaurerSelectionsEvaluation();
    }

    // Mettre à jour l'indicateur lors des changements
    selectEtudiant?.addEventListener('change', mettreAJourIndicateurProgression);

    // Mettre à jour aussi lors du changement de production
    const selectProduction = document.getElementById('selectProduction1');
    selectProduction?.addEventListener('change', mettreAJourIndicateurProgression);

    mettreAJourIndicateurProgression();

}

/* ===============================
   🔄 REPRISE ET VERROUILLAGE D'ÉVALUATIONS
   =============================== */

/**
 * Charge une évaluation existante dans le formulaire pour modification
 * Utilisé notamment lors de l'application de jetons de reprise
 * @param {string} evaluationId - ID de l'évaluation à charger
 */

/**
 * ✨ FALLBACK: Extrait les niveaux des critères depuis la rétroaction
 * Utilisé quand evaluation.criteres est vide mais que la rétroaction contient les niveaux
 * Format attendu : "STRUCTURE (I) : commentaire..."
 */
function extraireNiveauxDepuisRetroaction(retroaction, grille) {
    if (!retroaction || !grille) return {};

    const niveauxExtrait = {};

    // Regex pour capturer : NOM_CRITERE (NIVEAU)
    // Ex: "STRUCTURE (I)" ou "PLAUSIBILITÉ (M)"
    const regex = /([A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ\s]+)\s*\(([IDMBE])\)/gi;
    let match;

    while ((match = regex.exec(retroaction)) !== null) {
        const nomCritere = match[1].trim();
        const niveau = match[2].toUpperCase();

        // Trouver le critère correspondant dans la grille
        const critere = grille.criteres.find(c =>
            c.nom.toUpperCase() === nomCritere.toUpperCase()
        );

        if (critere) {
            niveauxExtrait[critere.id] = niveau;
        } else {
            console.warn(`  ⚠️ Critère non trouvé dans la grille : ${nomCritere}`);
        }
    }

    return niveauxExtrait;
}

/**
 * Affiche les critères d'une évaluation quand la grille n'existe plus dans les templates.
 * Reconstruit un affichage en lecture seule depuis les données sauvegardées.
 */
function _afficherCriteresDepuisEvaluation(evaluation) {
    const conteneur = document.getElementById('listeCriteresGrille1');
    if (!conteneur) return;

    // Récupérer les niveaux de l'échelle pour afficher les noms
    let niveauxMap = {};
    const echelleId = evaluation.echelleId;
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const p = pratiques.find(pr => pr.id === pratiqueId);
        if (p?.config?.echelle?.niveaux) {
            p.config.echelle.niveaux.forEach(n => { niveauxMap[n.code] = n.nom || n.code; });
        }
    } else {
        const echelles = db.getSync(cle('echellesTemplates'), []);
        const echelle = echelles.find(e => e.id === echelleId);
        if (echelle?.niveaux) {
            echelle.niveaux.forEach(n => { niveauxMap[n.code] = n.nom || n.code; });
        }
    }
    // Fallback IDME
    if (Object.keys(niveauxMap).length === 0) {
        niveauxMap = { I: 'Insuffisant', D: 'Développement', M: 'Maîtrisé', E: 'Étendu' };
    }

    const html = evaluation.criteres.map(critere => {
        const nom = echapperHtml(critere.critereNom || critere.critereId);
        const niveau = critere.niveauSelectionne || '--';
        const niveauNom = niveauxMap[niveau] || niveau;
        // Générer un <select> avec le même ID que le flux normal pour que l'étape 10 puisse le remplir
        const selectId = `eval_${critere.critereId}`;
        const optionsHtml = Object.keys(niveauxMap).map(code =>
            `<option value="${code}"${code === niveau ? ' selected' : ''}>${code} — ${echapperHtml(niveauxMap[code])}</option>`
        ).join('');
        return `
        <div class="eval-critere-carte">
            <div class="eval-grid-critere">
                <div>
                    <strong class="u-texte-09">${nom}</strong>
                </div>
                <div>
                    <select id="${selectId}" class="eval-select-niveau" data-on-change="niveauSelectionne" data-param="${critere.critereId}">
                        <option value="">--</option>
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        </div>`;
    }).join('');

    conteneur.innerHTML = `
        <div class="alerte alerte-attention" style="margin-bottom: 1rem">
            Grille d'origine introuvable dans les modèles actuels — affichage depuis les données sauvegardées.
        </div>
        ${html}`;
}

/**
 * Charge une évaluation existante pour modification
 * Refactorisé le 16 novembre 2025 pour corriger bug timing chargement
 *
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
function modifierEvaluation(evaluationId) {

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const estVerrouillee = evaluation.verrouillee || false;

    // Flag pour empêcher afficherFichiers() de masquer le formulaire d'évaluation
    // (afficherSousSection déclenche initialiserModuleTravaux → rafraichirUI → afficherFichiers
    // qui masquerait le formulaire avant qu'on ait le temps de le rendre visible)
    window._modifierEvaluationEnCours = true;

    // Naviguer vers la section d'évaluation (onglet Annoter et évaluer)
    // Ne pas re-naviguer si on y est déjà (sinon ça réinitialise le module et écrase le mode évaluer)
    if (typeof sousSectionActive === 'undefined' || sousSectionActive !== 'evaluations-annoter') {
        afficherSousSection('evaluations-annoter');
    }

    // ========== FONCTIONS HELPER ==========

    /**
     * Attend qu'une option spécifique apparaisse dans un select
     * Utilise un polling actif au lieu de délais fixes
     */
    const attendreOption = (selectId, valeurCherchee, maxTentatives = 20, delai = 100) => {
        return new Promise((resolve, reject) => {
            let tentatives = 0;
            const intervalle = setInterval(() => {
                tentatives++;
                const select = document.getElementById(selectId);
                const optionTrouvee = select ? Array.from(select.options).find(opt => opt.value === valeurCherchee) : null;

                if (optionTrouvee) {
                    clearInterval(intervalle);
                    resolve(select);
                } else if (tentatives >= maxTentatives) {
                    clearInterval(intervalle);
                    reject(new Error(`Timeout: option "${valeurCherchee}" introuvable dans #${selectId}`));
                }
            }, delai);
        });
    };

    /**
     * Trouve le numéro de groupe d'un étudiant
     * Cherche d'abord dans les étudiants, puis en fallback dans l'évaluation elle-même
     */
    const trouverGroupeEtudiant = (da) => {
        // Méthode 1: Chercher dans la liste des étudiants
        // NOTE: La clé est 'groupeEtudiants', pas 'etudiants' (cohérence avec reste du code)
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && etudiant.groupe) {
            return etudiant.groupe;
        }

        // Méthode 2 (fallback): Si l'étudiant n'est pas trouvé, chercher le groupe
        // depuis l'évaluation elle-même (peut arriver si mode données différent)
        console.warn(`⚠️ Étudiant DA ${da} non trouvé dans liste étudiants, utilisation fallback`);

        // L'évaluation contient déjà le groupe via etudiantNom qui peut être parsé
        // OU on peut chercher dans d'autres évaluations du même étudiant
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const autreEval = evaluations.find(e => e.etudiantDA === da && e.id !== evaluationId);

        if (autreEval && autreEval.groupe) {
            return autreEval.groupe;
        }

        // Si l'évaluation actuelle contient le groupe, l'utiliser
        if (evaluation.groupe) {
            return evaluation.groupe;
        }

        return null;
    };

    /**
     * Attend que les selects de critères soient générés dans le DOM
     */
    const attendreSelectsCriteres = (evaluation) => {
        return new Promise((resolve, reject) => {
            if (!evaluation.criteres || evaluation.criteres.length === 0) {
                console.warn('⚠️ Aucun critère à charger');
                resolve(false); // Pas de critères, mais pas une erreur
                return;
            }

            let tentatives = 0;
            const maxTentatives = 30; // 3 secondes max
            const premierCritereId = `eval_${evaluation.criteres[0].critereId}`;

            const intervalle = setInterval(() => {
                tentatives++;
                const premierSelect = document.getElementById(premierCritereId);

                if (premierSelect) {
                    clearInterval(intervalle);
                    resolve(true);
                } else if (tentatives >= maxTentatives) {
                    clearInterval(intervalle);
                    console.error('❌ Timeout: selects de critères non générés');
                    console.error('Contenu listeCriteresGrille1:', document.getElementById('listeCriteresGrille1')?.innerHTML.substring(0, 200));
                    reject(new Error('Timeout génération selects critères'));
                }
            }, 100);
        });
    };

    // ========== CHARGEMENT SÉQUENTIEL ==========

    setTimeout(async () => {
        try {
            // 🔧 FIX (20 mars 2026) : _forceStandaloneEval permet à modifierEvaluationRemplacee()
            // de forcer le mode standalone pour éviter que preRemplirEvaluation charge la reprise
            const enModeEvaluer = !window._forceStandaloneEval && !!document.getElementById('travaux-palette-eval-gauche');
            if (window._forceStandaloneEval) {
                window._forceStandaloneEval = false;
            }
            // 🔧 FIX (29 mars 2026) : Ne JAMAIS basculer en standalone si _resterEnModeAnnoter
            // est actif — l'appel vient du mode annotation et masquer le conteneur fichiers
            // détruit la visionneuse.
            if (!enModeEvaluer && window._resterEnModeAnnoter) {
                window._modifierEvaluationEnCours = false;
                return;
            }
            _setupAffichagePanneauxModif(enModeEvaluer);

            // Chargement selects (deux branches : enModeEvaluer / standalone)
            if (enModeEvaluer) {
                _chargerSelectsModeEvaluer(evaluation);
            } else {
                await _chargerSelectsStandalone(evaluation, attendreOption, trouverGroupeEtudiant);
            }

            // Annuler tout auto-save en attente (race condition) — Patch §5.6 fix #109 (étape 4)
            if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }

            // ÉTAPE 5 : Initialiser evaluationEnCours + pré-remplir critères + fallback rétroaction
            _initEvaluationEnCoursPourModif(evaluation, evaluationId);

            // ÉTAPES 6+7 : Charger échelle + cartouche/fallback critères + fallback grille manquante
            _chargerEchelleEtCartoucheModif(evaluation);

            // ÉTAPE 8 : Charger statuts (remise + intégrité) + afficher badges jetons
            _chargerStatutsEtBadgesModif(evaluation);

            // ÉTAPES 9-10 : Attendre selects critères + charger valeurs + données algorithmiques
            await _chargerValeursEtAlgoModif(evaluation, attendreSelectsCriteres);

            // ÉTAPES 11-12 : Options d'affichage + rétroaction finale (avec anonymisation)
            _chargerOptionsEtRetroactionModif(evaluation);

            // ÉTAPES 13-14 : Indicateur mode modification + verrouillage
            _gererIndicateurEtVerrouillageModif(evaluation, estVerrouillee);

            // ÉTAPES 15-16 : Gestion jetons + bouton Éditer
            window.afficherGestionJetons(true);
            _afficherBoutonEditerFichierModif();

            // ÉTAPE 17 : Ouvrir le travail de l'étudiant en vue côte à côte (si disponible)
            await _ouvrirVueCoteACoteModif(evaluation, enModeEvaluer);

        } catch (erreur) {
            console.error('❌ Erreur lors du chargement de l\'évaluation:', erreur);
            notifications.erreur(
                'Erreur de chargement',
                `Impossible de charger l'évaluation: ${erreur.message}`
            );
        } finally {
            window._modifierEvaluationEnCours = false;
        }
    }, 200);
}

// ========== HELPERS PRIVÉS _Modif* (extraction étape 4 — éclatement async arrow cyc 78 → cyc ≤ 30) ==========

function _setupAffichagePanneauxModif(enModeEvaluer) {
    // Si on est en mode évaluer (visionneuse avec fichier ouvert), les panneaux sont déjà
    // visibles via afficherPalettesEval. Sinon (standalone), afficher le formulaire directement.
    if (enModeEvaluer) return;
    const evalDiv = document.getElementById('evaluations-contenu-evaluation');
    const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
    const visDiv3 = document.getElementById('evaluations-contenu-visionneuse');
    if (evalDiv) evalDiv.classList.remove('u-hide');
    if (fichiersDiv) fichiersDiv.classList.add('u-hide');
    if (visDiv3) visDiv3.classList.add('u-hide');

    // Rendre visibles les panneaux enfants du formulaire (u-hide par défaut)
    ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'].forEach(id => {
        const panneau = document.getElementById(id);
        if (panneau) panneau.classList.remove('u-hide');
    });
}

function _chargerSelectsModeEvaluer(evaluation) {
    // 🔧 FIX (5 mars 2026) : En mode évaluer, les selects groupe/étudiant/production sont
    // déjà peuplés par afficherPalettesEval(). Les reconfigurer provoque un timeout.
    if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
    if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();
    const selectGrille = document.getElementById('selectGrille1');
    if (selectGrille && evaluation.grilleId) {
        selectGrille.value = evaluation.grilleId;
        selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function _chargerSelectsStandalone(evaluation, attendreOption, trouverGroupeEtudiant) {
    // ÉTAPE 0 : selects de base (groupes, grilles, échelles)
    if (typeof chargerGroupesEval === 'function') chargerGroupesEval();
    if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
    if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();

    // ÉTAPES 1-3 : Charger groupe, étudiant, production (tolérantes aux données manquantes)
    const numeroGroupe = trouverGroupeEtudiant(evaluation.etudiantDA);
    if (numeroGroupe) {
        const selectGroupe = document.getElementById('selectGroupeEval');
        if (selectGroupe) {
            selectGroupe.value = numeroGroupe;
            selectGroupe.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else {
        console.warn('⚠️ Groupe introuvable pour DA', evaluation.etudiantDA, '— étapes étudiant/production ignorées');
    }

    // Étudiant
    try {
        await attendreOption('selectEtudiantEval', evaluation.etudiantDA);
        const selectEtudiant = document.getElementById('selectEtudiantEval');
        selectEtudiant.value = evaluation.etudiantDA;
        selectEtudiant.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errEtudiant) {
        console.warn('⚠️ Étudiant', evaluation.etudiantDA, 'introuvable dans les selects');
    }

    // Production
    try {
        await attendreOption('selectProduction1', evaluation.productionId);
        const selectProduction = document.getElementById('selectProduction1');
        selectProduction.value = evaluation.productionId;
        selectProduction.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errProd) {
        console.warn('⚠️ Production', evaluation.productionId, 'introuvable dans les selects');
    }

    // ÉTAPE 4 : Grille (peut ne plus exister dans les templates)
    try {
        await attendreOption('selectGrille1', evaluation.grilleId);
        const selectGrille = document.getElementById('selectGrille1');
        selectGrille.value = evaluation.grilleId;
        selectGrille.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (_errGrille) {
        console.warn('⚠️ Grille', evaluation.grilleId, 'introuvable dans les templates — affichage depuis les données sauvegardées');
    }
}

function _initEvaluationEnCoursPourModif(evaluation, evaluationId) {
    window.evaluationEnCours = {
        etudiantDA: evaluation.etudiantDA,
        productionId: evaluation.productionId,
        grilleId: evaluation.grilleId,
        echelleId: evaluation.echelleId,
        cartoucheId: evaluation.cartoucheId,
        statutRemise: evaluation.statutRemise,
        statutIntegrite: evaluation.statutIntegrite || 'recevable',
        notesIntegrite: evaluation.notesIntegrite || '',
        delaiAccorde: evaluation.delaiAccorde || false,
        jetonDelaiApplique: evaluation.jetonDelaiApplique || false,
        dateApplicationJetonDelai: evaluation.dateApplicationJetonDelai,
        jetonRepriseApplique: evaluation.jetonRepriseApplique || false,
        repriseDeId: evaluation.repriseDeId,
        dateApplicationJetonReprise: evaluation.dateApplicationJetonReprise,
        jetonRepriseCibleeApplique: evaluation.jetonRepriseCibleeApplique || false,
        repriseDeIdCiblee: evaluation.repriseDeIdCiblee,
        critereRepriseCiblee: evaluation.critereRepriseCiblee,
        plafondNoteCiblee: evaluation.plafondNoteCiblee,
        dateApplicationJetonRepriseCiblee: evaluation.dateApplicationJetonRepriseCiblee,
        criteres: {},
        idModification: evaluationId
    };

    // Pré-remplir les critères depuis l'évaluation
    if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
        evaluation.criteres.forEach(critere => {
            window.evaluationEnCours.criteres[critere.critereId] = critere.niveauSelectionne;
        });
        return;
    }

    // FALLBACK : Extraire depuis rétroaction si criteres[] vide
    console.warn('⚠️ Extraction niveaux depuis rétroaction...');
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === evaluation.grilleId);
    if (!grille || !evaluation.retroactionFinale) return;
    const niveauxExtrait = extraireNiveauxDepuisRetroaction(evaluation.retroactionFinale, grille);
    if (Object.keys(niveauxExtrait).length === 0) return;
    window.evaluationEnCours.criteres = niveauxExtrait;
    evaluation.criteres = Object.keys(niveauxExtrait).map(critereId => ({
        critereId,
        critereNom: grille.criteres.find(c => c.id === critereId)?.nom || critereId,
        niveauSelectionne: niveauxExtrait[critereId]
    }));
}

function _chargerCartoucheDropdownModif(evaluation) {
    // Charger échelle
    const selectEchelle = document.getElementById('selectEchelle1');
    if (selectEchelle) {
        selectEchelle.value = evaluation.echelleId;
        selectEchelle.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // ÉTAPE 7 : Charger cartouche OU générer critères depuis grille (fallback)
    const selectCartouche = document.getElementById('selectCartoucheEval');
    if (!selectCartouche || !evaluation.grilleId) return false;

    // ✅ CORRIGÉ (31 déc 2025) : Peupler explicitement le dropdown avant de sélectionner
    const cartouches = db.getSync(cle(`cartouches_${evaluation.grilleId}`), []);
    selectCartouche.innerHTML = '<option value="">— Choisir une cartouche —</option>';
    cartouches.forEach(cartouche => {
        const option = document.createElement('option');
        option.value = cartouche.id;
        option.textContent = cartouche.nom || cartouche.id;
        selectCartouche.appendChild(option);
    });

    // Sélectionner la cartouche si elle existe dans l'évaluation
    if (!evaluation.cartoucheId) return false;
    const cartoucheExiste = cartouches.some(c => c.id === evaluation.cartoucheId);
    if (cartoucheExiste) {
        selectCartouche.value = evaluation.cartoucheId;
        selectCartouche.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }
    console.warn(`   ⚠️ Cartouche ${evaluation.cartoucheId} non trouvée dans les ${cartouches.length} cartouches`);
    return false;
}

function _appliquerFallbackGrilleManquanteModif(evaluation) {
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grilleExiste = grilles.some(g => g.id === evaluation.grilleId);
    if (grilleExiste) return;

    if (evaluation.criteres && Array.isArray(evaluation.criteres) && evaluation.criteres.length > 0) {
        _afficherCriteresDepuisEvaluation(evaluation);
    }
    // Afficher la note et le niveau sauvegardés (calculerNote() ne peut pas fonctionner sans grille)
    const noteElem = document.getElementById('noteProduction1');
    const niveauElem = document.getElementById('niveauProduction1');
    if (noteElem && evaluation.noteFinale != null) {
        noteElem.textContent = Math.round(evaluation.noteFinale * 10) / 10 + ' %';
    }
    if (niveauElem && evaluation.niveauFinal) {
        niveauElem.textContent = evaluation.niveauFinal;
    }
}

function _chargerEchelleEtCartoucheModif(evaluation) {
    const cartoucheChargee = _chargerCartoucheDropdownModif(evaluation);

    // FALLBACK : Si pas de cartouche, générer les critères directement depuis la grille
    if (!cartoucheChargee) {
        // Patch §5.6 — promotion afficherCriteresDepuisGrille (session A étape 3)
        window.afficherCriteresDepuisGrille(evaluation.grilleId, evaluation.echelleId);
    }

    _appliquerFallbackGrilleManquanteModif(evaluation);
}

function _chargerStatutsEtBadgesModif(evaluation) {
    // ÉTAPE 8 : Charger statut de remise
    const selectRemise = document.getElementById('remiseProduction1');
    if (selectRemise) {
        selectRemise.value = evaluation.statutRemise;
        window.mettreAJourPillStatut(evaluation.statutRemise);
        selectRemise.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Charger statut d'intégrité académique
    const selectIntegrite = document.getElementById('statutIntegrite');
    const notesIntegrite = document.getElementById('notesIntegrite');
    if (selectIntegrite) {
        selectIntegrite.value = evaluation.statutIntegrite || 'recevable';
        if (notesIntegrite) notesIntegrite.value = evaluation.notesIntegrite || '';
        selectIntegrite.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Afficher badges jetons
    window.afficherBadgesJetons();
}

function _restaurerDonneesAlgorithmiquesModif(evaluation) {
    if (!evaluation.donneesAlgorithmiques || Object.keys(evaluation.donneesAlgorithmiques).length === 0) return;

    Object.keys(evaluation.donneesAlgorithmiques).forEach(critereId => {
        const donnees = evaluation.donneesAlgorithmiques[critereId];

        // Restaurer le champ des codes (catégories)
        if (donnees.codes && Array.isArray(donnees.codes)) {
            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
            if (inputCategories) inputCategories.value = donnees.codes.join(';');
        }
        // Restaurer le champ du nombre de mots
        if (donnees.mots !== undefined) {
            const inputMots = document.getElementById(`eval_mots_${critereId}`);
            if (inputMots) inputMots.value = donnees.mots;
        }
        // Restaurer le champ d'erreurs (mode simple sans catégorisation)
        if (donnees.erreurs !== undefined) {
            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
            if (inputErreurs) inputErreurs.value = donnees.erreurs;
        }

        // Déclencher le recalcul pour afficher les résultats (attendre que le DOM soit prêt)
        setTimeout(() => {
            const inputCategories = document.getElementById(`eval_categories_${critereId}`);
            const inputErreurs = document.getElementById(`eval_erreurs_${critereId}`);
            if (inputCategories) {
                inputCategories.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (inputErreurs) {
                inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 100);
    });
}

async function _chargerValeursEtAlgoModif(evaluation, attendreSelectsCriteres) {
    // ÉTAPE 9 : Attendre que les selects de critères soient générés
    const criteresGeneres = await attendreSelectsCriteres(evaluation);

    if (!criteresGeneres || !evaluation.criteres || !Array.isArray(evaluation.criteres)) return;

    // ÉTAPE 10 : Charger les valeurs des critères
    evaluation.criteres.forEach(critere => {
        const selectId = `eval_${critere.critereId}`;
        const selectCritere = document.getElementById(selectId);
        if (selectCritere) {
            selectCritere.value = critere.niveauSelectionne;
            selectCritere.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            console.warn(`  ⚠️ Select non trouvé pour critère ${critere.critereId}`);
        }
    });

    // ÉTAPE 10.5 : Restaurer les données algorithmiques (français écrit)
    _restaurerDonneesAlgorithmiquesModif(evaluation);

    // Forcer le recalcul de la note après restauration données algorithmiques
    setTimeout(() => {
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B étape 3)
        if (typeof window.calculerNote === 'function') window.calculerNote();
    }, 200);
}

function _chargerOptionsEtRetroactionModif(evaluation) {
    // ÉTAPE 11 : Charger les options d'affichage
    // 🔧 FIX (24 fév 2026) : Les checkboxes sont toujours cochées par défaut au chargement.
    // L'utilisateur peut les décocher manuellement. cocherOptionsParDefaut() coche tout
    // ET applique la préférence de pratique pour le radio affichageNote.
    cocherOptionsParDefaut();

    // ÉTAPE 12 : Charger la rétroaction finale (anonymisation si mode Anonymisé)
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) {
        const texteRetroaction = typeof anonymiserTexteRetroaction === 'function'
            ? anonymiserTexteRetroaction(evaluation.retroactionFinale || '', evaluation.etudiantDA)
            : (evaluation.retroactionFinale || '');
        retroaction.value = texteRetroaction;
    }
}

function _gererIndicateurEtVerrouillageModif(evaluation, estVerrouillee) {
    // ÉTAPE 13 : Afficher indicateur de mode modification
    afficherIndicateurModeModification(evaluation);

    // ÉTAPE 14 : Gérer le verrouillage
    afficherOuMasquerBoutonVerrouillage(true, estVerrouillee);
    if (estVerrouillee) {
        desactiverFormulaireEvaluation(true);
        notifications.succes('Évaluation chargée en lecture seule (verrouillée)');
    } else {
        notifications.succes('Évaluation chargée - Tu peux maintenant la modifier');
    }
}

function _afficherBoutonEditerFichierModif() {
    const btnEditer = document.getElementById('btnEditerFichierEval');
    if (!btnEditer) return;
    const fichierDispo = (typeof travauxVisionneuse !== 'undefined' && typeof travauxVisionneuse.getFichierActuel === 'function')
        ? travauxVisionneuse.getFichierActuel() : null;
    if (fichierDispo) {
        btnEditer.classList.remove('u-hide');
    } else {
        btnEditer.classList.add('u-hide');
    }
}

async function _ouvrirVueCoteACoteModif(evaluation, enModeEvaluer) {
    // ÉTAPE 17 : Seulement en standalone (pas quand le fichier est déjà dans la visionneuse en mode évaluer)
    if (enModeEvaluer || typeof travauxStockage === 'undefined' || typeof travauxUI === 'undefined') return;
    try {
        const fichierCote = (typeof travauxResolution !== 'undefined')
            ? travauxResolution.trouverFichierPourEvaluation(evaluation) : null;
        if (!fichierCote) return;
        const conteneurGrille = document.getElementById('listeCriteresGrille1')?.closest('.form-group') || document.getElementById('listeCriteresGrille1');
        if (conteneurGrille) {
            await travauxUI.ouvrirVueCoteACote(fichierCote.id, conteneurGrille);
        }
    } catch (e) {
        console.warn('⚠️ Ouverture du travail ignorée:', e.message);
    }
}

/**
 * Sauvegarde une évaluation modifiée (écrase l'ancienne)
 * Appelée à la place de sauvegarderEvaluation() si on modifie une évaluation existante
 */
// Helpers privés _Mod pour sauvegarderEvaluationModifiee (extraction étape 4 — éclatement cyc 58 → cyc ≤ 30)
// Note : helpers dupliqués depuis evaluation-sauvegarde.js _Sauv (pattern profil-etudiant —
// duplication intra-IIFE préférée à consolidation cross-IIFE qui exigerait promotion window.X).

function _lireEntreesFormulaireMod() {
    const ec = window.evaluationEnCours;
    return {
        etudiantDA: document.getElementById('selectEtudiantEval').value || (ec && ec.etudiantDA) || '',
        productionId: document.getElementById('selectProduction1').value || (ec && ec.productionId) || '',
        grilleId: document.getElementById('selectGrille1').value || (ec && ec.grilleId) || ''
    };
}

function _validerReferencesMod(etudiant, production, grille, etudiantDA, productionId, grilleId) {
    if (!etudiant) {
        notifications.erreur('Étudiant introuvable', `L'étudiant ${etudiantDA} n'existe pas dans le groupe actif.`);
        console.error('[Évaluation] ❌ Référence invalide: etudiantDA', etudiantDA);
        return false;
    }
    if (!production) {
        notifications.erreur('Production introuvable', `La production sélectionnée n'existe plus.`);
        console.error('[Évaluation] ❌ Référence invalide: productionId', productionId);
        return false;
    }
    if (!grille) {
        notifications.erreur('Grille introuvable', `La grille de critères sélectionnée n'existe plus.`);
        console.error('[Évaluation] ❌ Référence invalide: grilleId', grilleId);
        return false;
    }
    return true;
}

function _validerReferencesNonDemoMod(productionId, grilleId) {
    if (typeof BibliothequeUI === 'undefined' || !BibliothequeUI.verifierReferencesPasDemo) return true;
    const violationDemo = BibliothequeUI.verifierReferencesPasDemo([
        { id: productionId, collection: (typeof getCleProductions === 'function' ? getCleProductions() : cle('productions')), labelType: 'production' },
        { id: grilleId, collection: 'grillesTemplates', labelType: 'grille' }
    ]);
    if (violationDemo) {
        notifications.erreur('Référence démo non autorisée', violationDemo.message);
        return false;
    }
    return true;
}

function _collecterCriteresMod(grille) {
    const criteres = [];
    if (!grille || !grille.criteres) return criteres;
    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        if (niveau) {
            const commDiv = document.getElementById(`comm_${critere.id}`);
            criteres.push({
                critereId: critere.id,
                critereNom: critere.nom,
                niveauSelectionne: niveau,
                retroaction: commDiv ? commDiv.textContent : '',
                ponderation: critere.ponderation || 0
            });
        }
    });
    return criteres;
}

function _extraireProprietesJetons(evalExistante) {
    return {
        jetonRepriseCibleeApplique: evalExistante.jetonRepriseCibleeApplique,
        repriseDeIdCiblee: evalExistante.repriseDeIdCiblee,
        critereRepriseCiblee: evalExistante.critereRepriseCiblee,
        plafondNoteCiblee: evalExistante.plafondNoteCiblee,
        dateApplicationJetonRepriseCiblee: evalExistante.dateApplicationJetonRepriseCiblee,
        jetonDelaiApplique: evalExistante.jetonDelaiApplique,
        dateEcheanceOriginale: evalExistante.dateEcheanceOriginale,
        nombreJoursDelai: evalExistante.nombreJoursDelai,
        dateApplicationJetonDelai: evalExistante.dateApplicationJetonDelai,
        repriseDeId: evalExistante.repriseDeId,
        dateApplicationJetonReprise: evalExistante.dateApplicationJetonReprise,
        remplaceeParId: evalExistante.remplaceeParId,
        dateRemplacement: evalExistante.dateRemplacement,
        archivee: evalExistante.archivee,
        dateArchivage: evalExistante.dateArchivage
    };
}

function _lireChampsDOMMod(maintenant) {
    return {
        echelleId: document.getElementById('selectEchelle1').value,
        cartoucheId: document.getElementById('selectCartoucheEval').value,
        dateModification: maintenant.toISOString(),
        heureModification: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        statutRemise: document.getElementById('remiseProduction1').value,
        statutIntegrite: document.getElementById('statutIntegrite').value || 'recevable',
        notesIntegrite: document.getElementById('notesIntegrite').value || '',
        noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
        niveauFinal: document.getElementById('niveauProduction1').textContent,
        retroactionFinale: document.getElementById('retroactionFinale1').value
    };
}

function _lireOptionsAffichageMod() {
    return {
        description: document.getElementById('afficherDescription1').checked,
        objectif: document.getElementById('afficherObjectif1').checked,
        tache: document.getElementById('afficherTache1').checked,
        adresse: document.getElementById('afficherAdresse1').checked,
        contexte: document.getElementById('afficherContexte1').checked,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };
}

function _appliquerProfilACOMod(evalModifiee) {
    if (typeof obtenirPreference === 'function' && obtenirPreference('activerActionsRLO') === true) {
        evalModifiee.actionsRLO = (typeof actionsRLO !== 'undefined' && actionsRLO.agregerActionsRLO)
            ? actionsRLO.agregerActionsRLO(evalModifiee)
            : null;
    }
}

function _marquerModificationJournalMod(evalModifiee, dureeMs) {
    if (typeof Journal === 'undefined') return;
    Journal.capturerFinEvaluation(evalModifiee, dureeMs);
    const jrnl = evalModifiee.journal;
    if (!jrnl || jrnl.length === 0) return;
    // Trouver la dernière entrée evaluation_fin et ajouter le flag modification
    for (let ji = jrnl.length - 1; ji >= 0; ji--) {
        if (jrnl[ji].action === Journal.ACTIONS.EVALUATION_FIN) {
            jrnl[ji].details.modification = true;
            break;
        }
    }
}

function _traiterPostRepriseMod(evaluations, indexEval, evaluationId) {
    if (!window._snapshotAvantModifRemplacee || window._snapshotAvantModifRemplacee.evalId !== evaluationId) return;
    const snapshot = window._snapshotAvantModifRemplacee;
    const apres = {
        statutIntegrite: evaluations[indexEval].statutIntegrite,
        noteFinale: evaluations[indexEval].noteFinale,
        niveauFinal: evaluations[indexEval].niveauFinal,
        criteres: (evaluations[indexEval].criteres || []).map(function(c) {
            return { critereId: c.critereId, niveau: c.niveauSelectionne };
        })
    };
    if (typeof Journal !== 'undefined') {
        Journal.ajouterEntree(evaluations[indexEval],
            Journal.ACTIONS.MODIFICATION_POST_REPRISE,
            { avant: snapshot.avant, apres: apres });
    }
    evaluations[indexEval].verrouillee = true;
    sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
    window._snapshotAvantModifRemplacee = null;
}

function _ajouterCadenasBadgesMod() {
    [
        document.querySelector('.annot-badge.actif'),
        document.querySelector('#travaux-badge-fichier-actif .annot-badge')
    ].forEach(badge => {
        if (!badge) return;
        let verrou = badge.querySelector('.travaux-badge-verrou');
        if (!verrou) {
            verrou = document.createElement('span');
            verrou.className = 'travaux-badge-verrou';
            verrou.title = 'Évaluation verrouillée';
            verrou.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
            badge.appendChild(verrou);
        }
    });
}

function _postSauvegardeMod(evalModifiee) {
    notifications.succes(`Évaluation modifiée : ${evalModifiee.etudiantNom} - ${evalModifiee.productionNom}`);

    if (typeof travauxUI !== 'undefined' && travauxUI.arreterChrono) {
        travauxUI.arreterChrono();
    }

    window.majBadgesApresEvaluation(evalModifiee);
    _ajouterCadenasBadgesMod();

    // L'évaluation est enregistrée ET verrouillée (verrouillee:true). On CONSERVE
    // idModification : le cadenas de la palette en a besoin pour (dé)verrouiller
    // (basculerVerrouillageEvaluationCourante), et un nouvel « Enregistrer »
    // repasse correctement par le chemin modification.
    if (window.evaluationEnCours) window.evaluationEnCours.verrouillee = true;

    const indicateurModif = document.getElementById('indicateurModeModification');
    if (indicateurModif) indicateurModif.classList.add('u-hide');

    // Refléter l'état verrouillé : cadenas FERMÉ + formulaire en lecture seule.
    // Avant, on masquait le cadenas (afficher=false), si bien qu'après une
    // sauvegarde le cadenas ouvert disparaissait sans cadenas fermé pour rouvrir.
    afficherOuMasquerBoutonVerrouillage(true, true);
    if (typeof desactiverFormulaireEvaluation === 'function') {
        desactiverFormulaireEvaluation(true);
    }

    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }
}

function sauvegarderEvaluationModifiee() {
    // Annuler le debounce auto-save (la sauvegarde manuelle prend le relais) — Patch §5.6 fix #109 (étape 4)
    if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }
    window._pendingAutoSaveSnapshot = null;

    const evaluationId = window.evaluationEnCours?.idModification;
    if (!evaluationId) {
        // Pas en mode modification, utiliser la sauvegarde normale
        window.sauvegarderEvaluation();
        return;
    }

    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const indexEval = evaluations.findIndex(e => e.id === evaluationId);
    if (indexEval === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier que l'évaluation n'est pas verrouillée
    // Exception : modification post-reprise autorisée via _snapshotAvantModifRemplacee
    if (evaluations[indexEval].verrouillee && !window._snapshotAvantModifRemplacee) {
        notifications.erreur('Évaluation verrouillée', 'Impossible de modifier une évaluation verrouillée');
        return;
    }

    const { etudiantDA, productionId, grilleId } = _lireEntreesFormulaireMod();
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === etudiantDA);
    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === productionId);
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!_validerReferencesMod(etudiant, production, grille, etudiantDA, productionId, grilleId)) return;
    if (!_validerReferencesNonDemoMod(productionId, grilleId)) return;

    // Fix #110 v3 (restauré 24 mai 2026) : forcer recalcul algo depuis le DOM
    // avant collecte, sinon donneesAlgorithmiques peut être stale.
    if (typeof window._forcerRecalculAlgorithmiqueAvantSauvegarde === 'function') {
        window._forcerRecalculAlgorithmiqueAvantSauvegarde(grille);
    }

    const criteres = _collecterCriteresMod(grille);
    const maintenant = new Date();
    const proprietesJetons = _extraireProprietesJetons(evaluations[indexEval]);

    evaluations[indexEval] = Object.assign({},
        evaluations[indexEval], // Garder l'ID et la date originale
        {
            etudiantDA: etudiantDA,
            etudiantNom: etudiant ? `${etudiant.prenom} ${etudiant.nom}` : '',
            groupe: etudiant ? etudiant.groupe : '',
            productionId: productionId,
            productionNom: production ? (production.titre || production.nom) : '',
            grilleId: grilleId,
            grilleNom: grille ? grille.nom : '',
            criteres: criteres,
            optionsAffichage: _lireOptionsAffichageMod(),
            donneesAlgorithmiques: evaluationEnCours.donneesAlgorithmiques || {},
            verrouillee: true
        },
        _lireChampsDOMMod(maintenant),
        proprietesJetons // Préserver toutes les propriétés de jetons en dernier
    );

    _appliquerProfilACOMod(evaluations[indexEval]);

    // Persister la durée d'évaluation (modification)
    const dureeMsModif = (typeof travauxUI !== 'undefined' && travauxUI.getDureeMs)
        ? travauxUI.getDureeMs() : null;
    if (dureeMsModif) evaluations[indexEval].dureeEvaluation = Math.round(dureeMsModif / 1000);

    _marquerModificationJournalMod(evaluations[indexEval], dureeMsModif);

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    _traiterPostRepriseMod(evaluations, indexEval, evaluationId);
    _postSauvegardeMod(evaluations[indexEval]);
}

/**
 * Verrouille une évaluation individuelle (saisie de notes) pour empêcher sa modification
 * @param {string} evaluationId - ID de l'évaluation à verrouiller
 * NOTE: Fonction renommée pour éviter conflit avec verrouillerEvaluation de productions.js
 */
function verrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = true;
    evaluations[index].dateVerrouillage = new Date().toISOString();

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de verrouiller en mode anonymisation');
        return;
    }

    notifications.succes('Évaluation verrouillée');

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/**
 * Déverrouille une évaluation individuelle (saisie de notes) pour permettre sa modification
 * @param {string} evaluationId - ID de l'évaluation à déverrouiller
 * NOTE: Fonction renommée pour cohérence avec verrouillerEvaluationIndividuelle
 */
function deverrouillerEvaluationIndividuelle(evaluationId) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    evaluations[index].verrouillee = false;
    delete evaluations[index].dateVerrouillage;

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de déverrouiller en mode anonymisation');
        return;
    }

    notifications.succes('Évaluation déverrouillée');

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/**
 * Affiche un indicateur visuel indiquant qu'on est en mode modification d'une évaluation
 * @param {Object} evaluation - L'évaluation en cours de modification
 */
function afficherIndicateurModeModification(evaluation) {
    // Chercher si l'indicateur existe déjà
    let indicateur = document.getElementById('indicateurModeModification');

    if (!indicateur) {
        // Créer l'indicateur
        indicateur = document.createElement('div');
        indicateur.id = 'indicateurModeModification';
        indicateur.style.cssText = `
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            color: white;
            padding: 15px 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 5px solid var(--orange-accent);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // Insérer l'indicateur au début du formulaire d'évaluation
        const conteneurForm = document.querySelector('#evaluations-saisie .contenu');
        if (conteneurForm) {
            conteneurForm.insertBefore(indicateur, conteneurForm.firstChild);
        }
    }

    // Mettre à jour le contenu
    const dateEval = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleString('fr-CA') : 'Inconnue';
    indicateur.innerHTML = `
        <div class="u-flex-1">
            <strong>MODE MODIFICATION</strong><br>
            <span style="font-size: 0.9rem; opacity: 0.95;">
                Tu modifies l'évaluation de <strong>${echapperHtml(evaluation.etudiantNom)}</strong>
                pour <strong>${echapperHtml(evaluation.productionNom)}</strong><br>
                Évaluation initiale : ${dateEval}
            </span>
        </div>
    `;

    indicateur.classList.remove('u-hide');
}

/**
 * Supprime une évaluation après confirmation
 * Les évaluations verrouillées ne peuvent pas être supprimées
 * @param {string} evaluationId - ID de l'évaluation à supprimer
 */
function supprimerEvaluation(evaluationId) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    if (evaluation.verrouillee) {
        notifications.erreur(
            'Suppression impossible',
            'Cette évaluation est verrouillée. Déverrouille-la d\'abord pour la supprimer.'
        );
        return;
    }

    // Demander confirmation
    if (!confirm(`Veux-tu vraiment supprimer l'évaluation de ${evaluation.etudiantNom} pour ${evaluation.productionNom} ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer l'évaluation
    evaluations = evaluations.filter(e => e.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Suppression impossible', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    notifications.succes('Évaluation supprimée');

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Recharger la liste
    if (typeof chargerListeEvaluationsRefonte === 'function') {
        chargerListeEvaluationsRefonte();
    }
}

/* ===============================
   📚 BANQUE D'ÉVALUATIONS
   Système de recherche et chargement d'évaluations
   =============================== */

/**
 * Ouvre le modal de la banque d'évaluations
 */
function ouvrirBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (!modal) return;

    // Charger les filtres
    chargerFiltresBanqueEvaluations();

    // Afficher les évaluations
    filtrerBanqueEvaluations();

    modal.classList.add('actif');
}

/**
 * Ferme le modal de la banque d'évaluations
 */
function fermerBanqueEvaluations() {
    const modal = document.getElementById('modalBanqueEvaluations');
    if (modal) modal.classList.remove('actif');
}

/**
 * Charge les options de filtres
 */
function chargerFiltresBanqueEvaluations() {
    // ✅ NAMESPACING (Beta 95.5)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // Filtre étudiants
    const selectEtudiant = document.getElementById('filtreBanqueEtudiant');
    if (selectEtudiant) {
        const etudiantsAvecEval = [...new Set(evaluations.map(e => e.etudiantDA))];
        selectEtudiant.innerHTML = '<option value="">Tous les étudiant·es</option>';

        etudiantsAvecEval.forEach(da => {
            const etudiant = etudiants.find(e => e.da === da);
            if (etudiant) {
                const option = document.createElement('option');
                option.value = da;
                option.textContent = (typeof anonymiserNom === 'function' && anonymiserNom(da)) || `${etudiant.nom}, ${etudiant.prenom}`;
                selectEtudiant.appendChild(option);
            }
        });
    }

    // Filtre productions
    const selectProduction = document.getElementById('filtreBanqueProduction');
    if (selectProduction) {
        const productionsAvecEval = [...new Set(evaluations.map(e => e.productionId))];
        selectProduction.innerHTML = '<option value="">Toutes les productions</option>';

        productionsAvecEval.forEach(id => {
            const production = productions.find(p => p.id === id);
            if (production) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = production.titre || production.nom;
                selectProduction.appendChild(option);
            }
        });
    }

    // Filtre groupes
    const selectGroupe = document.getElementById('filtreBanqueGroupe');
    if (selectGroupe) {
        const groupesAvecEval = [...new Set(evaluations.map(e => e.groupe).filter(g => g))].sort();
        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>';

        groupesAvecEval.forEach(groupe => {
            const option = document.createElement('option');
            option.value = groupe;
            option.textContent = groupe;
            selectGroupe.appendChild(option);
        });
    }
}

/**
 * Filtre et affiche les évaluations selon les critères sélectionnés
 */
function filtrerBanqueEvaluations() {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Récupérer les filtres dropdown
    const filtreGroupe = document.getElementById('filtreBanqueGroupe')?.value || '';
    const filtreEtudiant = document.getElementById('filtreBanqueEtudiant')?.value || '';
    const filtreProduction = document.getElementById('filtreBanqueProduction')?.value || '';
    const tri = document.getElementById('triBanqueEvaluation')?.value || 'date-desc';

    // Récupérer le terme de recherche textuelle
    const recherche = document.getElementById('recherche-banque-evaluations');
    const termeRecherche = recherche ? recherche.value.toLowerCase().trim() : '';

    // Filtrer
    let evaluationsFiltrees = evaluations.filter(evaluation => {
        // Filtres dropdown
        if (filtreGroupe && evaluation.groupe !== filtreGroupe) return false;
        if (filtreEtudiant && evaluation.etudiantDA !== filtreEtudiant) return false;
        if (filtreProduction && evaluation.productionId !== filtreProduction) return false;

        // Filtre de recherche textuelle
        if (termeRecherche) {
            const texteRecherche = [
                evaluation.etudiantNom || '',
                evaluation.etudiantDA || '',
                evaluation.productionNom || '',
                evaluation.grilleNom || '',
                evaluation.groupe || ''
            ].join(' ').toLowerCase();

            if (!texteRecherche.includes(termeRecherche)) return false;
        }

        return true;
    });

    // Trier
    evaluationsFiltrees.sort((a, b) => {
        switch (tri) {
            case 'date-desc':
                return new Date(b.dateEvaluation) - new Date(a.dateEvaluation);
            case 'date-asc':
                return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
            case 'groupe-asc':
                return (a.groupe || '').localeCompare(b.groupe || '');
            case 'etudiant-asc':
                // Trier par nom de famille (dernier mot)
                const nomA = a.etudiantNom.split(' ').pop();
                const nomB = b.etudiantNom.split(' ').pop();
                return nomA.localeCompare(nomB);
            case 'production-asc':
                return a.productionNom.localeCompare(b.productionNom);
            case 'note-desc':
                return b.noteFinale - a.noteFinale;
            case 'note-asc':
                return a.noteFinale - b.noteFinale;
            default:
                return 0;
        }
    });

    // Afficher
    afficherListeBanqueEvaluations(evaluationsFiltrees);
}

/**
 * Affiche la liste filtrée des évaluations
 */
function afficherListeBanqueEvaluations(evaluations) {
    const conteneur = document.getElementById('listeBanqueEvaluations');
    if (!conteneur) return;

    if (evaluations.length === 0) {
        conteneur.innerHTML = '<p style="text-align: center; color: var(--gris-clair); padding: 40px;">Aucune évaluation trouvée avec ces critères.</p>';
        return;
    }

    const html = evaluations.map(evaluation => {
        const dateEval = new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA');
        const heureEval = evaluation.heureEvaluation || new Date(evaluation.dateEvaluation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
        const estRemplacee = evaluation.remplaceeParId ? true : false;
        const estReprise = evaluation.repriseDeId ? true : false;
        const estDelai = evaluation.jetonDelaiApplique ? true : false;

        return `
            <div class="carte" style="margin-bottom: 15px; ${estRemplacee ? 'opacity: 0.6; border-left: 3px solid var(--gris-clair);' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div class="u-flex-1">
                        <h4 style="margin: 0 0 10px 0;">
                            ${echapperHtml(evaluation.etudiantNom)}
                            ${evaluation.verrouillee ? '<span style="color: var(--orange-accent); margin-left: 8px;">(Verrouillée)</span>' : ''}
                            ${estReprise ? '<span style="color: var(--violet-jeton, #9c27b0); margin-left: 8px;" title="Jeton de reprise appliqué">(Reprise)</span>' : ''}
                            ${estDelai ? '<span style="color: var(--orange-accent); margin-left: 8px;" title="Jeton de délai de remise appliqué">(Délai)</span>' : ''}
                            ${estRemplacee ? '<span style="color: var(--gris-clair); margin-left: 8px;" title="Évaluation remplacée">(Remplacée)</span>' : ''}
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; color: var(--gris-moyen); font-size: 0.9rem;">
                            <div><strong>Production:</strong> ${echapperHtml(evaluation.productionNom)}</div>
                            <div><strong>Grille:</strong> ${echapperHtml(evaluation.grilleNom)}</div>
                            <div><strong>Note:</strong> ${evaluation.niveauFinal} (${Math.round(evaluation.noteFinale)}%)</div>
                            <div><strong>Date:</strong> ${dateEval} à ${heureEval}</div>
                        </div>
                        ${estRemplacee ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--gris-tres-pale); border-radius: 4px; font-size: 0.85rem; color: var(--gris-moyen);">
                                Cette évaluation a été remplacée par un jeton de reprise et ne compte plus dans les indices
                            </div>
                        ` : ''}
                        ${estReprise ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--violet-pale, #f3e5f5); border-radius: 4px; font-size: 0.85rem; color: var(--violet-jeton, #7b1fa2); display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de reprise appliqué - Remplace l'évaluation précédente</span>
                                <button class="btn-jeton-retirer" data-action="retirerJeton" data-param="${evaluation.id}" data-param2="reprise"
                                        title="Retirer le jeton de reprise"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                            </div>
                        ` : ''}
                        ${estDelai ? `
                            <div style="margin-top: 10px; padding: 8px; background: var(--alerte-fond-attention); border-radius: 4px; font-size: 0.85rem; color: var(--orange-accent); display: flex; justify-content: space-between; align-items: center;">
                                <span>⭐ Jeton de délai appliqué - Date limite étendue</span>
                                <button class="btn-jeton-retirer" data-action="retirerJeton" data-param="${evaluation.id}" data-param2="delai"
                                        title="Retirer le jeton de délai"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                            </div>
                        ` : ''}
                    </div>
                    <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 6px;">
                        <button class="btn btn-modifier btn-compact" data-action="chargerEvaluationDepuisBanque" data-param="${evaluation.id}">
                            Charger
                        </button>
                        <button class="btn btn-modifier btn-compact" data-action="appliquerJetonRepriseDepuisBanque" data-param="${evaluation.id}">
                            Jeton de reprise
                        </button>
                        <span data-action="basculerVerrouillageEvaluation" data-param="${evaluation.id}"
                              style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-right: 8px;"
                              title="${evaluation.verrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                            ${evaluation.verrouillee ? '<img src="icons/icon-lock.svg" alt="Verrouillée" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">'}
                        </span>
                        <button class="btn btn-supprimer btn-compact" data-action="supprimerEvaluationBanque" data-param="${evaluation.id}">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    conteneur.innerHTML = html;
}

/**
 * Charge une évaluation depuis la banque dans le formulaire
 * @param {string} evaluationId - ID de l'évaluation à charger
 */
function chargerEvaluationDepuisBanque(evaluationId) {
    // Utiliser la fonction existante modifierEvaluation
    fermerBanqueEvaluations();
    modifierEvaluation(evaluationId);
}

/**
 * Applique un jeton de reprise depuis la Banque d'évaluations
 * Crée un duplicata de l'évaluation, marque l'originale comme remplacée,
 * et charge le duplicata pour modification immédiate
 * @param {string} evaluationId - ID de l'évaluation originale
 */
function appliquerJetonRepriseDepuisBanque(evaluationId) {
    // Utiliser le module evaluation-jetons.js pour appliquer le jeton
    if (typeof appliquerJetonReprise !== 'function') {
        notifications.erreur('Erreur', 'Module jetons non disponible');
        return;
    }

    // Appliquer le jeton (archiver l'originale par défaut)
    const nouvelleEvaluation = appliquerJetonReprise(evaluationId, true);

    if (!nouvelleEvaluation) {
        // L'erreur a déjà été affichée par le module
        return;
    }

    // Fermer la banque
    if (typeof fermerBanqueEvaluations === 'function') {
        fermerBanqueEvaluations();
    }

    // Charger le duplicata pour modification immédiate
    setTimeout(() => {
        if (typeof modifierEvaluation === 'function') {
            modifierEvaluation(nouvelleEvaluation.id);
        }
    }, 500);
}

/**
 * Applique un jeton de reprise depuis la sidebar (pendant l'édition)
 * Transforme l'évaluation en cours en reprise de l'évaluation précédente
 */
/**
 * Applique un jeton de délai depuis la sidebar (pendant l'édition)
 */
function appliquerJetonDelaiDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        notifications.erreur('Erreur', 'Tu dois charger une évaluation existante pour appliquer un jeton de délai');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appliquer le jeton via le module evaluation-jetons.js
    if (typeof appliquerJetonDelai === 'function') {
        const succes = appliquerJetonDelai(evaluationId);
        if (succes) {
            // Masquer le bouton et afficher le badge
            const bouton = document.getElementById('boutonJetonDelai');
            if (bouton) bouton.classList.add('u-hide');
            window.afficherBadgesJetons();
        }
    } else {
        console.error('❌ Fonction appliquerJetonDelai non disponible');
        notifications.erreur('Erreur', 'Module jetons non disponible');
    }
}

function appliquerJetonRepriseDepuisSidebar() {
    // Vérifier qu'on est en train de modifier une évaluation
    if (!window.evaluationEnCours || !window.evaluationEnCours.idModification) {
        notifications.erreur('Erreur', 'Tu dois charger une évaluation existante pour appliquer un jeton de reprise');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Demander confirmation
    const confirmation = confirm(
        'Veux-tu vraiment appliquer un jeton de reprise ?\n\n' +
        'Cela va créer une nouvelle évaluation qui remplacera la précédente.\n' +
        'L\'ancienne évaluation sera archivée et ne comptera plus dans les indices.'
    );

    if (!confirmation) {
        return;
    }

    // Appliquer le jeton en utilisant la fonction existante
    appliquerJetonRepriseDepuisBanque(evaluationId);

    // Le bouton va disparaître car la nouvelle évaluation aura déjà le jeton appliqué
    const bouton = document.getElementById('boutonJetonReprise');
    if (bouton) bouton.classList.add('u-hide');
}

/**
 * Bascule le verrouillage d'une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function basculerVerrouillageEvaluation(evaluationId) {
    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Basculer le statut
    evaluations[index].verrouillee = !evaluations[index].verrouillee;
    const estVerrouillee = evaluations[index].verrouillee;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    const message = estVerrouillee ? 'Évaluation verrouillée' : 'Évaluation déverrouillée';
    notifications.succes(message);

    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-${evaluationId}`);
    if (cadenasElement) {
        cadenasElement.innerHTML = estVerrouillee ? '<img src="icons/icon-lock.svg" alt="Verrouillée" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">';
        cadenasElement.title = estVerrouillee ? 'Verrouillée - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller';
    }

    // Rafraîchir la liste de la banque (sans reload de page)
    if (typeof filtrerBanqueEvaluations === 'function') {
        filtrerBanqueEvaluations();
    }

    // Rafraîchir le profil étudiant si affiché (sans reload de page)
    if (typeof afficherProfilComplet === 'function' && window.profilActuelDA) {
        setTimeout(() => afficherProfilComplet(window.profilActuelDA), 100);
    }
}

/**
 * Retire un jeton (reprise ou délai) d'une évaluation
 * @param {string} evaluationId - ID de l'évaluation
 * @param {string} typeJeton - Type de jeton à retirer ('reprise' ou 'delai')
 */
function retirerJeton(evaluationId, typeJeton) {
    // Demander confirmation
    const typeTexte = typeJeton === 'reprise' ? 'de reprise' : 'de délai';
    const confirmation = confirm(`Veux-tu vraiment retirer ce jeton ${typeTexte} ?\n\nCette action est irréversible.`);

    if (!confirmation) {
        return; // Annulation
    }

    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    const evaluation = evaluations[index];

    if (typeJeton === 'reprise') {
        // Retirer le jeton de reprise
        delete evaluation.jetonRepriseApplique;
        delete evaluation.dateApplicationJetonReprise;
        delete evaluation.repriseDeId;
        notifications.succes('Jeton de reprise retiré');
    } else if (typeJeton === 'delai') {
        // Retirer le jeton de délai
        delete evaluation.jetonDelaiApplique;
        delete evaluation.dateApplicationJetonDelai;
        delete evaluation.delaiAccorde;
        notifications.succes('Jeton de délai retiré');
    }

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    // Rafraîchir la liste
    filtrerBanqueEvaluations();

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
}

/**
 * Supprime une évaluation depuis la banque
 * @param {string} evaluationId - ID de l'évaluation
 */
function supprimerEvaluationBanque(evaluationId) {
    if (!confirm('Es-tu sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.')) {
        return;
    }

    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const evaluation = evaluations.find(e => e.id === evaluationId);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Vérifier si l'évaluation est verrouillée
    if (evaluation.verrouillee) {
        notifications.erreur('Suppression impossible', 'Déverrouillez l\'évaluation avant de la supprimer');
        return;
    }

    // Supprimer
    evaluations = evaluations.filter(e => e.id !== evaluationId);

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Suppression impossible', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    notifications.succes('Évaluation supprimée');

    // Recalculer les indices
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/**
 * Verrouille ou déverrouille toutes les évaluations
 * @param {boolean} verrouiller - true pour verrouiller, false pour déverrouiller
 */
function verrouillerToutesEvaluations(verrouiller) {
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);

    if (evaluations.length === 0) {
        notifications.erreur('Aucune évaluation', 'Aucune évaluation à modifier');
        return;
    }

    const message = verrouiller
        ? 'Es-tu sûr de vouloir verrouiller TOUTES les évaluations ?'
        : 'Es-tu sûr de vouloir déverrouiller TOUTES les évaluations ?';

    if (!confirm(message)) {
        return;
    }

    // Modifier toutes les évaluations
    evaluations = evaluations.map(e => ({
        ...e,
        verrouillee: verrouiller
    }));

    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de modifier en mode anonymisation');
        return;
    }

    const resultat = verrouiller
        ? `${evaluations.length} évaluations verrouillées`
        : `${evaluations.length} évaluations déverrouillées`;

    notifications.succes(resultat);

    // Rafraîchir la liste
    filtrerBanqueEvaluations();
}

/* ===============================
   SYSTÈME DE VERROUILLAGE
   =============================== */

/**
 * Bascule le verrouillage de l'évaluation courante
 */
function basculerVerrouillageEvaluationCourante() {
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        notifications.erreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    // CORRECTION: Lire TOUTES les évaluations (pas seulement celles du cours actif)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);
    const index = evaluations.findIndex(e => e.id === evaluationId);

    if (index === -1) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Basculer le statut de verrouillage
    evaluations[index].verrouillee = !evaluations[index].verrouillee;
    const estVerrouillee = evaluations[index].verrouillee;

    // Sauvegarder
    if (!sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)) {
        notifications.erreur('Modification impossible', 'Impossible de sauvegarder en mode anonymisation');
        return;
    }

    // Mettre à jour evaluationEnCours pour refléter le changement
    if (window.evaluationEnCours) {
        window.evaluationEnCours.verrouillee = estVerrouillee;
    }

    // Mettre à jour l'icône de verrouillage
    if (typeof mettreAJourBoutonVerrouillage === 'function') {
        mettreAJourBoutonVerrouillage(estVerrouillee);
    }

    // Notification
    const message = estVerrouillee
        ? `Évaluation verrouillée - Modification impossible`
        : `Évaluation déverrouillée - Modification autorisée`;
    notifications.succes(message);

    // Activer/désactiver tous les champs du formulaire (sans reload)
    if (typeof desactiverFormulaireEvaluation === 'function') {
        desactiverFormulaireEvaluation(estVerrouillee);
    }

    // Mettre à jour le cadenas sur le badge du fichier actuel (sans reconstruire la grille)
    const fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (fichierActuel) {
        const badge = document.querySelector(`.annot-badge[data-fichier-id="${fichierActuel.id}"]`);
        if (badge) {
            const verrouExistant = badge.querySelector('.travaux-badge-verrou');
            if (estVerrouillee && !verrouExistant) {
                // Ajouter le cadenas avant le bouton supprimer
                const btnSupp = badge.querySelector('.annot-badge-supprimer');
                const span = document.createElement('span');
                span.className = 'travaux-badge-verrou';
                span.title = 'Évaluation verrouillée';
                span.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
                if (btnSupp) badge.insertBefore(span, btnSupp);
                else badge.appendChild(span);
            } else if (!estVerrouillee && verrouExistant) {
                verrouExistant.remove();
            }
        }
    }
}

/**
 * Met à jour l'icône de verrouillage (style productions)
 */
function mettreAJourBoutonVerrouillage(estVerrouillee) {
    // Bouton cadenas dans la barre de palette Paramètres
    const btnVerrouPalette = document.getElementById('btnVerrouPalette');
    if (btnVerrouPalette) {
        btnVerrouPalette.style.display = '';
        btnVerrouPalette.innerHTML = estVerrouillee ? '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon">';
        btnVerrouPalette.title = estVerrouillee
            ? 'Évaluation verrouillée - Clique pour déverrouiller'
            : 'Évaluation modifiable - Clique pour verrouiller';
    }

    // Cadenas sur les badges (sidebar actif + toolbar)
    const badgesActifs = [
        document.querySelector('.annot-badge.actif'),
        document.querySelector('#travaux-badge-fichier-actif .annot-badge')
    ];
    badgesActifs.forEach(badge => {
        if (!badge) return;
        let verrou = badge.querySelector('.travaux-badge-verrou');
        if (estVerrouillee) {
            if (!verrou) {
                verrou = document.createElement('span');
                verrou.className = 'travaux-badge-verrou';
                const pill = badge.querySelector('.travaux-badge-pill');
                if (pill) pill.after(verrou);
            }
            verrou.innerHTML = '<img src="icons/icon-lock.svg" alt="" class="btn-inline-icon">';
            verrou.title = 'Évaluation verrouillée';
        } else {
            if (verrou) verrou.remove();
        }
    });
}

/**
 * Affiche ou masque l'indicateur de verrouillage selon le contexte
 */
function afficherOuMasquerBoutonVerrouillage(afficher, estVerrouillee = false) {
    if (afficher) {
        mettreAJourBoutonVerrouillage(estVerrouillee);
    } else {
        // Masquer le bouton cadenas dans la barre de palette
        const btnVerrouPalette = document.getElementById('btnVerrouPalette');
        if (btnVerrouPalette) btnVerrouPalette.style.display = 'none';
        // Retirer le cadenas des badges
        document.querySelectorAll('.travaux-badge-verrou').forEach(el => el.remove());
    }
}

/**
 * Désactive ou active les champs du formulaire d'évaluation
 */
function desactiverFormulaireEvaluation(desactiver) {

    // Désactiver les selects de paramètres principaux
    // 🔧 #355 (2 juillet 2026) : selectEtudiantEval RETIRÉ de la liste — c'est
    // de la NAVIGATION (passer à l'élève suivant·e), pas de l'édition. En
    // consultation/verrouillé, changer d'élève recharge son évaluation, qui
    // ré-applique elle-même l'état verrouillé au reste du formulaire.
    const selects = [
        'selectGroupeEval',
        'selectProduction1',
        'selectGrille1',
        'selectCartoucheEval',
        'selectEchelle1',
        'remiseProduction1',
        'statutIntegrite'  // Intégrité académique (recevabilité)
    ];

    selects.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.disabled = desactiver;
        }
    });

    // Désactiver tous les selects de critères dans listeCriteresGrille1
    const selectsCriteres = document.querySelectorAll('#listeCriteresGrille1 select');
    selectsCriteres.forEach(select => {
        select.disabled = desactiver;
    });

    // Désactiver tous les champs algorithmiques (codes d'erreurs, nombre de mots)
    const inputsAlgorithmiques = document.querySelectorAll('#listeCriteresGrille1 input[type="text"], #listeCriteresGrille1 input[type="number"]');
    inputsAlgorithmiques.forEach(input => {
        input.disabled = desactiver;
    });

    // Désactiver la zone de rétroaction finale
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) {
        retroaction.disabled = desactiver;
    }

    // Désactiver les checkboxes d'options d'affichage
    const checkboxes = [
        'afficherDescription1',
        'afficherObjectif1',
        'afficherTache1',
        'afficherAdresse1',
        'afficherContexte1'
    ];

    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.disabled = desactiver;
    });

    // Désactiver le bouton de sauvegarde
    // Chercher dans le formulaire statique ET dans les palettes flottantes
    // (en mode visionneuse, les panneaux sont déplacés dans les palettes)
    const boutonsSauvegarde = document.querySelectorAll(
        '#evaluations-contenu-evaluation button, .travaux-palette-eval button'
    );
    boutonsSauvegarde.forEach(btn => {
        if (btn.textContent.includes('Enregistrer')) {
            btn.disabled = desactiver;
        }
    });

}

/**
 * Ouvre la banque d'évaluations avec le terme de recherche pré-rempli
 */
function ouvrirBanqueAvecRecherche() {
    // Récupérer le terme de recherche rapide
    const rechercheRapide = document.getElementById('recherche-rapide-evaluation');
    const terme = rechercheRapide ? rechercheRapide.value : '';

    // Ouvrir la banque
    ouvrirBanqueEvaluations();

    // Transférer le terme dans le champ de recherche de la banque
    setTimeout(() => {
        const rechercheBanque = document.getElementById('recherche-banque-evaluations');
        if (rechercheBanque) {
            rechercheBanque.value = terme;
            rechercheBanque.focus();
            // Appliquer le filtre si un terme est présent
            if (terme.trim()) {
                filtrerBanqueEvaluations();
            }
        }
    }, 100);
}

/**
 * Ouvre le profil de l'étudiant depuis le formulaire d'évaluation
 */
function ouvrirProfilDepuisEvaluation() {
    const etudiantDA = document.getElementById('selectEtudiantEval').value;

    if (!etudiantDA) {
        alert('Sélectionne un·e étudiant·e');
        return;
    }

    // Naviguer vers la section Suivi > Profil
    afficherSection('suivi');

    // Attendre que la section soit chargée
    setTimeout(() => {
        // Afficher la sous-section profil
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('suivi-profil');
        }

        // Attendre un peu puis charger le profil de l'étudiant
        setTimeout(() => {
            if (typeof afficherProfilComplet === 'function') {
                afficherProfilComplet(etudiantDA);

                // Attendre que le profil soit généré, puis scroller vers la section Productions
                setTimeout(() => {
                    const sectionProductions = document.querySelector('#contenuProfilEtudiant h3:contains("Productions")');
                    if (sectionProductions) {
                        sectionProductions.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        // Fallback: chercher par texte
                        const allH3 = document.querySelectorAll('#contenuProfilEtudiant h3');
                        for (let h3 of allH3) {
                            if (h3.textContent.includes('Productions')) {
                                h3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                break;
                            }
                        }
                    }
                }, 300);
            } else {
                console.error('❌ Fonction afficherProfilComplet non disponible');
            }
        }, 100);
    }, 200);
}

/**
 * Ouvre le travail de l'etudiant en vue cote-a-cote depuis l'evaluation
 * 🆕 BETA 96.3 : Integration module Travaux
 */
function ouvrirTravailDepuisEvaluation() {
    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    if (!etudiantDA) {
        alert('Sélectionne un·e étudiant·e');
        return;
    }

    if (typeof travauxStockage === 'undefined') {
        console.warn('[Evaluation] Module Travaux non disponible');
        return;
    }

    // Trouver le fichier associé via résolution centralisée
    let fichierTrouve = null;
    if (typeof travauxResolution !== 'undefined' && productionId) {
        fichierTrouve = travauxResolution.trouverFichierPourEvaluation({ etudiantDA, productionId });
    }
    // Fallback : recherche directe si la résolution centralisée échoue
    if (!fichierTrouve) {
        let fichiers = travauxStockage.obtenirFichiersEtudiant(etudiantDA);
        if (productionId) {
            fichiers = fichiers.filter(f => f.productionId === productionId);
        }
        if (fichiers.length > 0) fichierTrouve = fichiers[0];
    }

    if (!fichierTrouve) {
        alert('Aucun travail trouvé pour cet·te étudiant·e');
        return;
    }

    const fichierId = fichierTrouve.id;
    const conteneurGrille = document.getElementById('listeCriteresGrille1')?.closest('.form-group') || document.getElementById('listeCriteresGrille1');

    if (conteneurGrille && typeof travauxUI !== 'undefined') {
        travauxUI.ouvrirVueCoteACote(fichierId, conteneurGrille);
    }
}

/**
 * Met a jour la visibilite du bouton "Voir le travail"
 * Appele quand l'etudiant ou la production change
 * 🆕 BETA 96.3
 */
function mettreAJourBoutonVoirTravail() {
    const btn = document.getElementById('btnVoirTravailDepuisEval');
    if (!btn) return;

    if (typeof travauxStockage === 'undefined') {
        btn.classList.add('u-hide');
        return;
    }

    const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
    const productionId = document.getElementById('selectProduction1')?.value;

    if (!etudiantDA) {
        btn.classList.add('u-hide');
        return;
    }

    let fichiers = travauxStockage.obtenirFichiersEtudiant(etudiantDA);
    if (productionId) {
        fichiers = fichiers.filter(f => f.productionId === productionId);
    }

    toggleDisplay(btn, fichiers.length > 0);
}

// Exporter les fonctions
// window.filtrerListeEvaluations = filtrerListeEvaluations; // DÉSACTIVÉ : Géré par liste-evaluations.js
window.filtrerBanqueEvaluations = filtrerBanqueEvaluations;
window.ouvrirBanqueAvecRecherche = ouvrirBanqueAvecRecherche;
window.modifierEvaluationParId = modifierEvaluation; // Export sous un nom différent pour éviter conflit avec liste-evaluations.js
window.ouvrirProfilDepuisEvaluation = ouvrirProfilDepuisEvaluation;
window.ouvrirTravailDepuisEvaluation = ouvrirTravailDepuisEvaluation;
window.mettreAJourBoutonVoirTravail = mettreAJourBoutonVoirTravail;
window.rechargerFiltreProduction = rechargerFiltreProduction; // Pour mise à jour du filtre après ajout/modification de productions

// ============================================
// FONCTIONS POUR JETONS PERSONNALISÉS
// ============================================

/**
 * Affiche les jetons personnalisés disponibles dans le sidebar d'évaluation
 */
function afficherJetonsPersonnalisesEvaluation() {
    const conteneur = document.getElementById('jetonsPersonnalisesOptions');
    if (!conteneur) {
        return;
    }

    // Récupérer les jetons personnalisés depuis la configuration
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    const jetonsPersonnalises = config.jetons?.typesPersonnalises || [];

    if (jetonsPersonnalises.length === 0) {
        conteneur.innerHTML = '';
        conteneur.classList.add('u-hide');
        return;
    }

    // Afficher le conteneur
    conteneur.classList.remove('u-hide');

    // Générer un badge avec checkbox pour chaque jeton personnalisé
    conteneur.innerHTML = jetonsPersonnalises.map(jeton => `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <input type="checkbox" id="checkboxJetonPerso_${jeton.id}" class="u-mt-6">
            <div class="u-flex-1">
                <span class="badge-jeton-personnalise-wrapper">
                    <span class="badge-jeton-titre">${echapperHtml(jeton.nom)}</span>
                </span>
                <p class="text-085-muted-m5-0-0-0" style="margin: 4px 0 0 0; font-size: 0.75rem;">
                    ${echapperHtml(jeton.description)}
                </p>
            </div>
        </div>
    `).join('');
}

/**
 * Applique un jeton personnalisé à l'évaluation
 * @param {string} jetonId - ID du jeton à appliquer
 */
function appliquerJetonPersonnalise(jetonId) {
    if (!window.evaluationEnCours?.idModification) {
        notifications.erreur('Erreur', 'Tu dois charger une évaluation existante pour appliquer un jeton');
        return;
    }

    // Récupérer les informations du jeton
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    const jeton = config.jetons?.typesPersonnalises?.find(j => j.id === jetonId);

    if (!jeton) {
        notifications.erreur('Erreur', 'Jeton personnalisé introuvable');
        return;
    }

    // Confirmer l'application
    if (!confirm(`Veux-tu appliquer le jeton «${jeton.nom}» à cette évaluation ?\n\n${jeton.description}`)) {
        return;
    }

    // Récupérer l'évaluation
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === window.evaluationEnCours.idModification);

    if (!evaluation) {
        notifications.erreur('Erreur', 'Évaluation introuvable');
        return;
    }

    // Ajouter le jeton personnalisé à l'évaluation
    if (!evaluation.jetonsPersonnalises) {
        evaluation.jetonsPersonnalises = [];
    }

    // Vérifier si ce jeton n'est pas déjà appliqué
    if (evaluation.jetonsPersonnalises.some(j => j.id === jetonId)) {
        notifications.erreur('Erreur', 'Ce jeton est déjà appliqué à cette évaluation');
        return;
    }

    evaluation.jetonsPersonnalises.push({
        id: jetonId,
        nom: jeton.nom,
        description: jeton.description,
        dateApplication: new Date().toISOString()
    });

    // Sauvegarder
    db.setSync(cle('evaluationsSauvegardees'), evaluations);
    // Tier 6.3 : Invalider les caches de moyennes
    window._moyennesQualifies = null;
    window._moyennesToutes = null;

    // Rafraîchir l'affichage
    window.afficherBadgesJetons();
    window.peuplementOptJetons();

    notifications.succes('Succès', `Jeton «${jeton.nom}» appliqué`);
}

/**
 * Confirme et supprime l'évaluation en cours depuis le sidebar
 */
function confirmerSuppressionEvaluationSidebar() {
    if (!window.evaluationEnCours?.idModification) {
        notifications.erreur('Erreur', 'Aucune évaluation en cours de modification');
        return;
    }

    const evaluationId = window.evaluationEnCours.idModification;

    // Appeler la fonction existante de suppression (qui inclut déjà la confirmation)
    supprimerEvaluation(evaluationId);

    // Si la suppression réussit, réinitialiser le formulaire
    setTimeout(() => {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const evalExiste = evaluations.find(e => e.id === evaluationId);

        if (!evalExiste) {
            // L'évaluation a été supprimée, réinitialiser le formulaire
            nouvelleEvaluation();
        }
    }, 100);
}

// Écouter les changements de mode pour régénérer la rétroaction avec les noms anonymisés/réels
window.addEventListener('modeChanged', (event) => {

    // Si une évaluation est en cours et que la checkbox d'adresse est cochée, régénérer la rétroaction
    if (window.evaluationEnCours && document.getElementById('afficherAdresse1')?.checked) {
        // Patch §5.6 — promotion genererRetroaction vers evaluation-retroaction.js (session B étape 3 refactor 2026-05-18)
        window.genererRetroaction(1);
    }
});

/**
 * Copie du texte en format TSV (Tab-Separated Values)
 * Utilise l'API Clipboard moderne avec le bon MIME type
 */
async function copierEnFormatTSV(texte) {
    try {
        const blob = new Blob([texte], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/plain': blob
        });
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie TSV:', err);
        return false;
    }
}

/**
 * Copie les 4 premiers critères (SRPN) dans le presse-papiers
 */
async function copierCriteresSRPN() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        notifications.erreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Extraire les 4 premiers critères (SRPN) avec tabulations
    const texte = element.textContent.trim();
    const criteres = texte.split('\t');
    const srpn = criteres.slice(0, 4).join('\t');

    // Copier en format TSV
    const succes = await copierEnFormatTSV(srpn);
    if (succes) {
        notifications.succes('Copié', 'SRPN copiés dans le presse-papiers');
    } else {
        notifications.erreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

/**
 * Copie les 5 critères (SRPNF) dans le presse-papiers
 */
async function copierCriteresSRPNF() {
    const element = document.getElementById('criteresCopier');
    if (!element || element.textContent === '--') {
        notifications.erreur('Erreur', 'Aucun critère à copier');
        return;
    }

    // Copier tous les critères avec tabulations
    const texte = element.textContent.trim();

    // Copier en format TSV
    const succes = await copierEnFormatTSV(texte);
    if (succes) {
        notifications.succes('Copié', 'SRPNF copiés dans le presse-papiers');
    } else {
        notifications.erreur('Erreur', 'Impossible de copier dans le presse-papiers');
    }
}

// Exporter les fonctions
window.afficherJetonsPersonnalisesEvaluation = afficherJetonsPersonnalisesEvaluation;
window.appliquerJetonPersonnalise = appliquerJetonPersonnalise;
window.confirmerSuppressionEvaluationSidebar = confirmerSuppressionEvaluationSidebar;
window.reinitialiserFormulaire = reinitialiserFormulaire;
window.copierCriteresSRPN = copierCriteresSRPN;
window.copierCriteresSRPNF = copierCriteresSRPNF;

// Exports requis pour le mode evaluation depuis la visionneuse (travaux-ui.js)
window.changerEchelleEvaluation = changerEchelleEvaluation;
window.basculerVerrouillageEvaluationCourante = basculerVerrouillageEvaluationCourante;
window.nouvelleEvaluation = nouvelleEvaluation;

// Promotion §5.6 (session B 3e sous-module) — sauvegarderEvaluationModifiee
// reste résidu mais est appelée depuis evaluation-sauvegarde.js (2 sites internes).
window.sauvegarderEvaluationModifiee = sauvegarderEvaluationModifiee;

// Phase 5 — fonctions utilisées par data-action / data-on-change
window.toggleEtudiantEval = toggleEtudiantEval;
window.modifierEvaluation = modifierEvaluation;
window.supprimerEvaluation = supprimerEvaluation;
window.basculerVerrouillageEvaluation = basculerVerrouillageEvaluation;
window.chargerEvaluationDepuisBanque = chargerEvaluationDepuisBanque;
window.appliquerJetonRepriseDepuisBanque = appliquerJetonRepriseDepuisBanque;
window.supprimerEvaluationBanque = supprimerEvaluationBanque;
window.evaluerProduction = evaluerProduction;
window.naviguerEtudiantPrecedent = naviguerEtudiantPrecedent;
window.naviguerEtudiantSuivant = naviguerEtudiantSuivant;
window.retirerJeton = retirerJeton;

// Exports manqués lors de l'extraction de evaluation-chargement.js et autres
// sous-modules (refactor évaluation 18-21 mai 2026). Sans ces exports, les
// fonctions définies ici déclenchent ReferenceError ou échec silencieux quand
// appelées depuis evaluation-chargement.js, evaluation-calcul.js,
// evaluation-retroaction.js, evaluation-sauvegarde.js, modes.js, travaux-ui.js,
// liste-evaluations.js. Bug rapporté 21 mai 2026 (rien ne s'affiche au clic) :
// verifierEtChargerEvaluationExistante crashait au changement d'étudiant ou de
// production → l'éval existante n'était jamais pré-chargée.
window.verifierEtChargerEvaluationExistante = verifierEtChargerEvaluationExistante;
window.desactiverFormulaireEvaluation = desactiverFormulaireEvaluation;
window.appliquerJetonDelaiDepuisSidebar = appliquerJetonDelaiDepuisSidebar;
window.attacherEvenementsMemorisation = attacherEvenementsMemorisation;
window.chargerListeEvaluationsRefonte = chargerListeEvaluationsRefonte;
window.cocherOptionsParDefaut = cocherOptionsParDefaut;
window.memoriserSelectionsEvaluation = memoriserSelectionsEvaluation;
window.obtenirNomCartouche = obtenirNomCartouche;
window.sauvegarderSelectionsEvaluation = sauvegarderSelectionsEvaluation;
window.trierListeEvaluations = trierListeEvaluations;
// Exposé pour révéler le cadenas de (dé)verrouillage depuis le module de
// sauvegarde (evaluation-sauvegarde.js) après une première sauvegarde.
window.afficherOuMasquerBoutonVerrouillage = afficherOuMasquerBoutonVerrouillage;

})();
