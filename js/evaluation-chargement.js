/* ===============================
   MODULE EVALUATION-CHARGEMENT — Init + chargement + sélection grille/cartouche + auto-save

   Extrait de js/evaluation.js (zone L77-1110 Chargement + zone L1112-1247 Auto-save,
   session A étape 3 refactor evaluation, 2026-05-18 — beta 99.48 b0518-0720).

   16 fonctions migrées : chargerListeEtudiantsEval,
   chargerGroupesEval, filtrerEtudiantsParGroupe, chargerProductionsDansSelect,
   chargerGrillesDansSelect, chargerEchellePerformance, chargerEvaluationsEtudiant,
   chargerProduction, _selectionnerCartoucheProduction, chargerGrilleSelectionnee,
   cartoucheSelectionnee, afficherCriteresDepuisGrille, niveauSelectionne,
   _debouncerAutoSave, _flusherAutoSave, _autoSauvegarderCriteres (cyc 55).

   + 1 fonction ajoutée Track 4 chantier F Cat-B (21 mai 2026, beta 99.61) :
   demarrerEvaluationDepuisFichier — API découplage travaux-ui ↔ window.evaluationEnCours.
   Encapsule la création/reset du pivot + selects cachés + pré-sélection grille/échelle/
   cartouche depuis la production. Sentinelle Vitest associée empêche toute écriture
   du pivot depuis un module externe à evaluation*.js + config.js.

   Variables module-scope promues window.X (étape 4 fix #109, 2026-05-18) :
   window._timerAutoSave, window._pendingAutoSaveSnapshot. Initialement déclarées
   `let` IIFE-local (session A), promues à window après audit empirique session B
   (bare cross-IIFE refs résidu/sauvegarde jetaient ReferenceError au runtime).

   14 exports window.X :
     · Bloc principal evaluation.js (10) : chargerListeEtudiantsEval,
       chargerGroupesEval, filtrerEtudiantsParGroupe, chargerGrillesDansSelect,
       chargerEchellePerformance, chargerEvaluationsEtudiant, chargerProduction,
       chargerGrilleSelectionnee, cartoucheSelectionnee, niveauSelectionne
     · Dispersé L7026 d'origine (1) : chargerProductionsDansSelect
     · Promotion nouvelle §5.6 (1) : afficherCriteresDepuisGrille (consommée L5521
       du résidu — patch call-site fait dans evaluation.js)
     · API Track 4 chantier F Cat-B (1) : demarrerEvaluationDepuisFichier
       (consommée par travaux-ui.js — basculerMode + afficherPalettesEval)
     · Déclencheur d'auto-save #564 (1) : retroactionModifiee (consommée par
       data-on-input du textarea #retroactionFinale1, délégation main.js)

   NON exportées (préservation comportementale stricte) :
     · _selectionnerCartoucheProduction, _debouncerAutoSave, _flusherAutoSave,
       _autoSauvegarderCriteres : préfixe _, privées d'origine (§5.10)

   Chargé AVANT evaluation.js dans index.html — le résidu evaluation.js consomme
   window.afficherCriteresDepuisGrille (L5521) via window.X promotion §5.6.
   =============================== */

(function() {
'use strict';

/* ===============================
   📂 CHARGEMENT DES LISTES
   =============================== */

/**
 * Charge la liste des étudiants dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les étudiants depuis localStorage
 * 2. Remplit le select avec les options
 * 
 * CLÉ LOCALSTORAGE:
 * - 'groupeEtudiants' : Array des étudiants
 */
function chargerListeEtudiantsEval() {
    // 🆕 FIX (9 jan 2026) : Log groupe-cours actif pour debug
    const groupeCoursActif = db.getSync('groupeCoursActif', null);

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const select = document.getElementById('selectEtudiantEval');

    if (!select) return;

    // ✅ CORRIGÉ (29 déc 2025): Détecter mode anonymisation via db directement
    // modeActuel n'est PAS accessible depuis evaluation.js (variable locale à modes.js)
    // On utilise db.getSync comme source de vérité
    const modeDepuisDb = db.getSync('modeApplication', 'normal');
    const modeAnonymisation = modeDepuisDb === 'anonymisation' ||
                              (typeof estModeeLectureSeule === 'function' && estModeeLectureSeule());

    // NOUVEAU (Beta 84): Trier par nom de famille (ordre alphabétique)
    etudiants.sort((a, b) => {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

    select.innerHTML = '<option value="">— Choisir un·e étudiant·e —</option>';
    etudiants.forEach((etudiant, index) => {
        const option = document.createElement('option');
        // Toujours utiliser le DA réel pour la valeur (nécessaire pour les calculs)
        option.value = etudiant.daReel || etudiant.da;

        // En mode anonymisation, afficher "Élève X" sans DA
        if (modeAnonymisation) {
            // Générer nom anonyme "Élève 1", "Élève 2", etc.
            option.textContent = `Élève ${index + 1}`;
        } else {
            option.textContent = `${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`;
        }
        select.appendChild(option);
    });
}

/**
 * Charge les groupes dans le select de filtre
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les étudiants depuis localStorage
 * 2. Extrait les groupes uniques
 * 3. Remplit le select des groupes
 */
function chargerGroupesEval() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const groupes = [...new Set(etudiants.map(e => e.groupe).filter(g => g))];
    groupes.sort();

    const select = document.getElementById('selectGroupeEval');
    if (!select) return;

    select.innerHTML = '<option value="">Tous les groupes</option>';
    groupes.forEach(groupe => {
        const option = document.createElement('option');
        option.value = groupe;
        option.textContent = `Groupe ${groupe}`;
        select.appendChild(option);
    });
}

/**
 * Filtre les étudiants selon le groupe sélectionné
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le groupe sélectionné
 * 2. Filtre la liste des étudiants
 * 3. Recharge le select des étudiants
 * 
 * UTILISÉ PAR:
 * - onchange="#selectGroupeEval" dans le HTML
 */
function filtrerEtudiantsParGroupe() {
    const groupeId = document.getElementById('selectGroupeEval').value;
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    // ✅ CORRIGÉ (29 déc 2025): Détecter mode anonymisation via db directement
    // modeActuel n'est PAS accessible depuis evaluation.js (variable locale à modes.js)
    // On utilise db.getSync comme source de vérité
    const modeDepuisDb = db.getSync('modeApplication', 'normal');
    const estFonctionDisponible = typeof estModeeLectureSeule === 'function';
    const estModeDepuisFonction = estFonctionDisponible ? estModeeLectureSeule() : false;
    const modeAnonymisation = modeDepuisDb === 'anonymisation' || estModeDepuisFonction;

    const etudiantsFiltres = groupeId
        ? etudiants.filter(e => e.groupe === groupeId)
        : etudiants;

    // NOUVEAU (Beta 84): Trier par nom de famille (ordre alphabétique)
    etudiantsFiltres.sort((a, b) => {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

    const select = document.getElementById('selectEtudiantEval');
    if (!select) return;

    select.innerHTML = '<option value="">— Choisir un·e étudiant·e —</option>';
    etudiantsFiltres.forEach((etudiant, index) => {
        const option = document.createElement('option');
        // Toujours utiliser le DA réel pour la valeur (nécessaire pour les calculs)
        option.value = etudiant.daReel || etudiant.da;

        // En mode anonymisation, afficher "Élève X" sans DA
        if (modeAnonymisation) {
            // Générer nom anonyme "Élève 1", "Élève 2", etc.
            option.textContent = `Élève ${index + 1}`;
        } else {
            option.textContent = `${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`;
        }
        select.appendChild(option);
    });
}

/**
 * Charge les productions (évaluations) dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les productions depuis localStorage
 * 2. Remplit le select
 * 
 * CLÉ LOCALSTORAGE:
 * - 'productions' : Array des productions (nom historique)
 */
function chargerProductionsDansSelect() {
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser obtenirDonneesSelonMode pour le namespacing
    const productions = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('productions')
        : db.getSync(cle('productions'), []);
    const select = document.getElementById('selectProduction1');

    if (!select) return;

    select.innerHTML = '<option value="">— Choisir une production —</option>';
    productions.forEach(prod => {
        const nomEchappe = echapperHtml(prod.titre || prod.nom);
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = nomEchappe;
        select.appendChild(option);
    });
}

/**
 * Charge les grilles de critères dans le select
 * 
 * CLÉ LOCALSTORAGE:
 * - 'grillesTemplates' : Array des grilles de critères
 */
function chargerGrillesDansSelect() {
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const select = document.getElementById('selectGrille1');

    if (!select) return;

    select.innerHTML = '<option value="">— Choisir une grille —</option>';
    grilles.forEach(grille => {
        const nomEchappe = echapperHtml(grille.nom);
        const option = document.createElement('option');
        option.value = grille.id;
        option.textContent = nomEchappe;
        select.appendChild(option);
    });
}

/**
 * Charge les échelles de performance disponibles dans le select
 *
 * CLÉ LOCALSTORAGE:
 * - 'echellesTemplates' : Array des échelles créées par l'utilisateur
 *
 * NOUVEAU (Beta 92): Support pratiques configurables
 * Si une pratique configurable est active, son échelle est ajoutée à la liste
 */
function _obtenirPratiqueIdActive() {
    const coursActifId = getCoursActifId();
    if (coursActifId) return getPratiqueCours(coursActifId);
    // Lot N1b (21 sept. 2026) : l'id que rend LA désignation, sans repli « sommative » — le seul
    // lecteur (`_resoudreEchellePratique`) rend null sans id, comme il le faisait pour « sommative ».
    return (typeof obtenirIdPratiqueActive === 'function') ? obtenirIdPratiqueActive() : null;
}

// #328 L2-c : `_synchroniserJetonsPratique` RETIRÉ — le miroir modalites.configPAN.jetons
// n'est plus écrit ; obtenirConfigJetons() dérive la config des jetons de la pratique active.

function _resoudreEchellePratique() {
    if (!window.PratiqueManager) return null;
    const pratiqueId = _obtenirPratiqueIdActive();
    const pratiquesCodeesDur = ['pan-standards', 'pan-maitrise', 'sommative', 'pan-specifications'];
    if (!pratiqueId || pratiquesCodeesDur.includes(pratiqueId)) return null;
    const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
    const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);
    if (!pratiqueData) return null;
    if (!pratiqueData.config || !pratiqueData.config.echelle) return null;
    return {
        id: `pratique-${pratiqueId}`,
        nom: `${pratiqueData.config.nom} (Pratique active)`,
        niveaux: pratiqueData.config.echelle.niveaux || [],
        type: pratiqueData.config.echelle.type || 'niveaux',
        source: 'pratique'
    };
}

function _renderOptionsEchelles(select, echelles, echellePratique) {
    let html = '<option value="">— Choisir une échelle —</option>';
    if (echellePratique) {
        const nbNiveaux = echellePratique.niveaux?.length || 0;
        const nomEchappe = echapperHtml(echellePratique.nom);
        html += `<option value="${echapperHtml(echellePratique.id)}" style="background: var(--bleu-pale); font-weight: 600;">${nomEchappe} (${nbNiveaux} niveaux)</option>`;
    }
    if (echelles && echelles.length > 0) {
        html += echelles.map(echelle => {
            const nomEchappe = echapperHtml(echelle.nom || 'Échelle sans nom');
            const nbNiveaux = echelle.niveaux?.length || 0;
            return `<option value="${echapperHtml(echelle.id)}">${nomEchappe} (${nbNiveaux} niveaux)</option>`;
        }).join('');
    }
    select.innerHTML = html;
}

function chargerEchellePerformance() {
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const select = document.getElementById('selectEchelle1');
    if (!select) return;

    const echellePratique = _resoudreEchellePratique();

    if ((!echelles || echelles.length === 0) && !echellePratique) {
        console.error('❌ Aucune échelle de performance configurée');
        // ⚠ CHEMIN CORRIGÉ le 1er septembre 2026 — « Matériel › Niveaux de
        // performance » n'existe pas : ZÉRO occurrence de « Matériel » dans
        // `index.html`, et l'onglet s'appelle « Échelles de performance ». Ce
        // message envoyait donc l'enseignant nulle part, au moment précis où il
        // n'a pas d'échelle. Le vocabulaire employé ici est celui du reste de
        // l'app (`index.html` : « Gérer les échelles dans Conception → Échelles
        // de performance »).
        select.innerHTML = '<option value="">Aucune échelle configurée — Conception → Échelles de performance</option>';
        document.getElementById('noteProduction1').textContent = '--';
        document.getElementById('niveauProduction1').textContent = '--';
        return;
    }

    _renderOptionsEchelles(select, echelles, echellePratique);

    // #941 lot S1 — ce choix-ci est celui de l'APPLICATION, pas de l'enseignant·e : il est
    // marqué, pour qu'une grille entièrement en points puisse le défaire (`_retirerEchelleDOffice`).
    delete select.dataset.choixAuto;
    if (echellePratique) {
        select.value = echellePratique.id;
    } else if (echelles.length === 1) {
        select.value = echelles[0].id;
        select.dataset.choixAuto = echelles[0].id;
        // La grille peut être choisie AVANT ce remplissage (première copie, grille unique) : même règle ici.
        _retirerEchelleDOffice(grilleSelectionneeEnPoints());
    }
}

/**
 * #941 lot S1 (D1, 24 sept. 2026) — AUCUNE ÉCHELLE GLISSÉE D'OFFICE sous une grille entièrement
 * en points. Quand le trimestre n'a qu'une échelle, `chargerEchellePerformance` la choisissait
 * pour l'enseignant·e, avant même qu'une grille soit connue ; chaque copie en points l'emportait
 * en base. Défait ici, au choix de la grille, à trois conditions :
 *   - l'échelle affichée est encore celle que l'application a choisie (un choix fait au menu
 *     efface la marque, `changerEchelleEvaluation`) ;
 *   - la copie n'a pas d'évaluation enregistrée : une copie déjà évaluée garde l'échelle
 *     qu'elle porte (en coulisse — aucun nom ne s'affiche, décision A) ; rien n'est réécrit ;
 *   - la grille est entièrement en points (les grilles mixtes ne changent pas).
 * Rend `true` quand l'échelle a été retirée.
 */
/** #941 lot S1 — la grille choisie à l'écran est-elle entièrement en points ? */
function grilleSelectionneeEnPoints() {
    const grilleId = (document.getElementById('selectGrille1') || {}).value;
    if (!grilleId || typeof window.grilleEntierementEnPoints !== 'function') return false;
    const grille = (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id === grilleId);
    return window.grilleEntierementEnPoints(grille);
}

function _retirerEchelleDOffice(enPoints) {
    const select = document.getElementById('selectEchelle1');
    if (!enPoints || !select || !select.value || select.dataset.choixAuto !== select.value) return false;
    const vivant = (typeof window.etatVivantEvaluationEnCours === 'function') ? window.etatVivantEvaluationEnCours() : null;
    // Relecture de Cowork (24 sept.) : garde redondante avec `dejaEvaluee` ci-dessous (même élève, même
    // production) — la retirer ne rougit rien ; gardée comme court-circuit, sans suite.
    if (vivant && vivant.idModification) return false;
    if (vivant && vivant.etudiantDA && vivant.productionId) {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const dejaEvaluee = evaluations.some(e => e && e.etudiantDA === vivant.etudiantDA
            && e.productionId === vivant.productionId && !e.remplaceeParId);
        if (dejaEvaluee) return false;
    }
    select.value = '';
    delete select.dataset.choixAuto;
    if (evaluationEnCours) evaluationEnCours.echelleId = '';
    if (window.evaluationEnCours) window.evaluationEnCours.echelleId = '';
    return true;
}

/* ===============================
   🎯 CHARGEMENT D'UNE ÉVALUATION
   =============================== */

/**
 * Charge les évaluations d'un étudiant sélectionné
 * 
 * FONCTIONNEMENT:
 * 1. Récupère l'étudiant sélectionné
 * 2. Charge les productions disponibles
 * 3. Initialise evaluationEnCours
 * 
 * UTILISÉ PAR:
 * - onchange="#selectEtudiantEval" dans le HTML
 */
function chargerEvaluationsEtudiant() {
    // Flusher l'auto-save en attente AVANT de charger le nouvel étudiant
    // (sauvegarde les erreurs de français et critères non encore persistés)
    _flusherAutoSave();
    // Suspendre les nouveaux debounces pendant la cascade de chargement.
    _suspendreAutoSaveTemporairement();

    const etudiantDA = document.getElementById('selectEtudiantEval').value;
    const btnVoirProfil = document.getElementById('btnVoirProfilDepuisEval');

    if (!etudiantDA) {
        // Masquer le bouton de profil si aucun étudiant
        if (btnVoirProfil) btnVoirProfil.classList.add('u-hide');
        return;
    }

    // Afficher le bouton de profil
    if (btnVoirProfil) btnVoirProfil.classList.remove('u-hide');

    // 🆕 BETA 96.3 : Mettre a jour le bouton "Voir le travail"
    if (typeof mettreAJourBoutonVoirTravail === 'function') {
        setTimeout(mettreAJourBoutonVoirTravail, 200);
    }

    // ✅ FIX: Préserver les sélections actuelles (production, grille, échelle, cartouche)
    const selectProduction = document.getElementById('selectProduction1');
    const selectGrille = document.getElementById('selectGrille1');
    const selectEchelle = document.getElementById('selectEchelle1');
    const selectCartouche = document.getElementById('selectCartoucheEval');
    const selectRemise = document.getElementById('remiseProduction1');

    const productionActuelle = selectProduction?.value || null;
    const grilleActuelle = selectGrille?.value || null;
    const echelleActuelle = selectEchelle?.value || null;
    // #941 lot S1 — l'échelle préservée garde sa nature : choisie par l'application, ou au menu.
    const echelleActuelleAuto = !!echelleActuelle && selectEchelle?.dataset.choixAuto === echelleActuelle;
    const cartoucheActuelle = selectCartouche?.value || null;
    const remiseActuelle = selectRemise?.value || 'non-recu';

    // ✅ Vider IMMÉDIATEMENT les critères AVANT de changer quoi que ce soit
    // (important pour éviter que les valeurs de l'étudiant précédent persistent)
    const selects = document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]');
    selects.forEach(select => {
        select.value = '';
        // ✅ Réinitialiser aussi la couleur de fond (enlever les couleurs vert/jaune/etc.)
        select.style.backgroundColor = '';
        select.style.borderColor = 'var(--bordure-claire)';
        select.style.fontWeight = 'normal';

        // ✅ Vider aussi le commentaire de rétroaction du critère
        const critereId = select.id.replace('eval_', '');
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) {
            commDiv.textContent = 'Sélectionne un niveau';
            commDiv.style.fontStyle = 'italic';
            commDiv.style.color = 'var(--gris-clair)';
        }
    });

    // ✅ Vider les champs algorithmiques (codes d'erreurs, nombre de mots)
    // IDs: eval_categories_*, eval_erreurs_*, eval_mots_*, resultat_algo_*
    const champsCategories = document.querySelectorAll('input[id^="eval_categories_"]');
    const champsErreurs = document.querySelectorAll('input[id^="eval_erreurs_"]');
    const champsMots = document.querySelectorAll('input[id^="eval_mots_"]');
    const zonesResultat = document.querySelectorAll('div[id^="resultat_algo_"]');

    // #671 — ON VIDE, ET ON MARQUE À QUI LE PANNEAU APPARTIENT DÉSORMAIS.
    //
    // Les ids `eval_erreurs_<critereId>` portent le CRITÈRE, pas l'élève : les
    // mêmes champs servent aux 27 copies. La bascule d'une copie à l'autre est
    // asynchrone (`preRemplirEvaluation` réessaie jusqu'à 1,5 s), et pendant
    // cette fenêtre les champs portent encore les valeurs du précédent. Une
    // sauvegarde qui part là écrit le compte du voisin sous le nom du nouvel
    // élève — mesuré sur 5 copies réelles le 31 août 2026.
    //
    // Le correctif de décembre 2025 (`5d2d41c7`) couvrait la course par un
    // DÉLAI de 350 ms. Un délai n'est pas une synchronisation : la course est
    // revenue dès que les données ont grossi. Ce marquage-ci ne dépend d'aucune
    // horloge — il dit une IDENTITÉ, et le calcul refuse quand elle ne
    // correspond pas (voir `_panneauAppartientALEvaluation`).
    const marquer = (input) => { input.value = ''; input.dataset.da = etudiantDA || ''; };
    champsCategories.forEach(marquer);
    // 21 oct. 2026 : la somme pondérée de la copie précédente part avec son nombre.
    champsErreurs.forEach((input) => { marquer(input); window.poserErreursDuChamp(input, ''); });
    champsMots.forEach(marquer);
    zonesResultat.forEach(div => {
        // Réinitialiser le contenu avec les placeholders
        const spans = div.querySelectorAll('span');
        spans.forEach(span => span.textContent = '--');
    });

    // Réinitialiser la note et le niveau
    const noteElem = document.getElementById('noteProduction1');
    const niveauElem = document.getElementById('niveauProduction1');
    if (noteElem) noteElem.textContent = '--';
    if (niveauElem) niveauElem.textContent = '--';

    // Vider la rétroaction finale
    const retroaction = document.getElementById('retroactionFinale1');
    if (retroaction) retroaction.value = '';
    mettreAJourCompteurMots();

    // Initialiser evaluationEnCours avec le nouvel étudiant mais préserver les sélections
    evaluationEnCours = {
        etudiantDA: etudiantDA,
        productionId: productionActuelle,
        grilleId: grilleActuelle,
        echelleId: echelleActuelle,
        cartoucheId: cartoucheActuelle,
        criteres: {},  // ✅ Réinitialiser SEULEMENT les critères évalués
        donneesAlgorithmiques: {},  // ✅ Réinitialiser les données algorithmiques (codes erreurs, nb mots)
        pointsAnalytiques: {},      // Lot 2 — les points des critères analytiques, à part
        statutRemise: remiseActuelle
    };

    // Charger les productions pour le nouvel étudiant (réinitialise le select)
    chargerProductionsDansSelect();

    // ✅ IMPORTANT: Restaurer la production sélectionnée APRÈS le rechargement du select
    setTimeout(() => {
        if (productionActuelle && selectProduction) {
            selectProduction.value = productionActuelle;
        }
        if (grilleActuelle && selectGrille) {
            selectGrille.value = grilleActuelle;
        }
        if (echelleActuelle && selectEchelle) {
            selectEchelle.value = echelleActuelle;
            if (echelleActuelleAuto) selectEchelle.dataset.choixAuto = echelleActuelle;
            // #941 lot S1 — restaurée sous une grille en points, une échelle d'office repart.
            _retirerEchelleDOffice(grilleSelectionneeEnPoints());
        }
        if (cartoucheActuelle && selectCartouche) {
            selectCartouche.value = cartoucheActuelle;
        }
        if (remiseActuelle && selectRemise) {
            selectRemise.value = remiseActuelle;
            // Patch §5.6 — promotion mettreAJourPillStatut vers evaluation-sauvegarde.js (session B 3e sous-module 2026-05-18)
            window.mettreAJourPillStatut(remiseActuelle);
        }

        // Vérifier si une évaluation existe déjà pour ce nouvel étudiant
        // (Si oui, elle sera chargée et remplacera les critères vides)
        verifierEtChargerEvaluationExistante();
    }, 100);
}

/**
 * Démarre (ou réinitialise) une évaluation depuis un fichier de la visionneuse Travaux.
 *
 * Encapsule la création/reset du pivot window.evaluationEnCours + le peuplement
 * des selects cachés (étudiant, production) + la pré-sélection grille/échelle/
 * cartouche depuis la production. Chantier F Cat-B (21 mai 2026) : SEUL appelant
 * cross-module autorisé à écrire window.evaluationEnCours en dehors du module
 * evaluation*.js. Toute autre tentative d'écriture du pivot depuis travaux-ui ou
 * un autre module externe doit passer par cette API (sentinelle Vitest associée).
 *
 * @param {Object} fichier - { etudiantDA, productionId, ... } depuis travaux
 * @param {Object} [opts]
 * @param {string} [opts.productionIdEffective] - Production à utiliser (sinon
 *                 fallback fichier.productionId, puis travauxResolution).
 * @param {boolean} [opts.recreer=true] - true : création complète + pré-sélection
 *                 grille/échelle/cartouche (1re ouverture palettes éval).
 *                 false : reset partiel critères + identité (palettes déjà
 *                 créées, on change juste de fichier dans basculerMode).
 * @returns {string} La productionIdEffective utilisée (utile à l'appelant pour
 *                   remplirLabelsIdentite + preRemplirEvaluation).
 */
function demarrerEvaluationDepuisFichier(fichier, opts) {
    opts = Object.assign({ recreer: true }, opts || {});
    // Suspendre l'auto-save pendant le reset partiel + restauration depuis DB.
    // Sans ça, un snapshot capturé entre les deux peut écrire `criteres: []`
    // ou `donneesAlgorithmiques: {}` en DB, écrasant les valeurs persistées.
    _suspendreAutoSaveTemporairement();

    let productionIdEffective = opts.productionIdEffective || fichier.productionId || '';
    if (!productionIdEffective && typeof window.travauxResolution !== 'undefined') {
        const evalLiee = window.travauxResolution.trouverEvaluationPourFichier(fichier);
        if (evalLiee && evalLiee.productionId) {
            productionIdEffective = evalLiee.productionId;
        }
    }

    if (!opts.recreer) {
        // Reset partiel (palettes éval déjà existantes, on change de fichier)
        if (window.evaluationEnCours &&
            (window.evaluationEnCours.etudiantDA !== (fichier.etudiantDA || '') ||
             window.evaluationEnCours.productionId !== (productionIdEffective || ''))) {
            window.evaluationEnCours.criteres = {};
            window.evaluationEnCours.donneesAlgorithmiques = {};
            window.evaluationEnCours.pointsAnalytiques = {};   // lot 2
            window.evaluationEnCours.etudiantDA = fichier.etudiantDA || '';
            window.evaluationEnCours.productionId = productionIdEffective || '';
            delete window.evaluationEnCours.idModification;
            if (typeof desactiverFormulaireEvaluation === 'function') {
                desactiverFormulaireEvaluation(false);
            }
        }
        return productionIdEffective;
    }

    // === Création complète (1re ouverture palettes éval) ===

    // Pivot : réinitialiser si absent OU si élève/production a changé
    var daChange = window.evaluationEnCours && window.evaluationEnCours.etudiantDA !== (fichier.etudiantDA || '');
    var prodChange = window.evaluationEnCours && window.evaluationEnCours.productionId !== (productionIdEffective || '');
    if (!window.evaluationEnCours || daChange || prodChange) {
        window.evaluationEnCours = {
            etudiantDA: fichier.etudiantDA || '',
            productionId: productionIdEffective || '',
            grilleId: '',
            echelleId: '',
            cartoucheId: '',
            criteres: {},
            donneesAlgorithmiques: {},
            pointsAnalytiques: {},   // lot 2
            statutRemise: 'evalue'
        };
    }

    // Selects cachés (lus par sauvegarderEvaluation)
    const selEtud = document.getElementById('selectEtudiantEval');
    if (selEtud && fichier.etudiantDA) selEtud.value = fichier.etudiantDA;
    const selProd = document.getElementById('selectProduction1');
    if (selProd && productionIdEffective) selProd.value = productionIdEffective;

    // Pré-sélection grille/échelle/cartouche depuis la production
    const productions = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('productions')
        : (typeof db !== 'undefined' ? db.getSync(cle('productions'), []) : []);
    const prod = productionIdEffective ? productions.find(p => p.id === productionIdEffective) : null;
    // Modèle isolé par trimestre (évals existantes prioritaires sur le champ périmé).
    const refModele = _modeleProductionPourEval(prod);
    if (prod && refModele.grilleId) {
        const selG = document.getElementById('selectGrille1');
        if (selG && Array.from(selG.options).some(o => o.value === refModele.grilleId)) {
            selG.value = refModele.grilleId;
            window.evaluationEnCours.grilleId = refModele.grilleId;
        }

        if (refModele.echelleId) {
            const selE = document.getElementById('selectEchelle1');
            if (selE && Array.from(selE.options).some(o => o.value === refModele.echelleId)) {
                selE.value = refModele.echelleId;
                window.evaluationEnCours.echelleId = refModele.echelleId;
            }
        }

        if (typeof chargerGrilleSelectionnee === 'function') chargerGrilleSelectionnee();

        const cartoucheModele = _cartoucheModelePourLaCopie(fichier.etudiantDA, productionIdEffective, refModele);   // #946
        if (cartoucheModele) {
            var _tentativesCartouche = 0;
            var _essayerCartouche = function() {
                _tentativesCartouche++;
                var selC = document.getElementById('selectCartoucheEval');
                if (selC && Array.from(selC.options).some(function(o) { return o.value === cartoucheModele; })) {
                    if (window.evaluationEnCours) window.evaluationEnCours.cartoucheId = cartoucheModele;
                    poserCartoucheParChargeur(selC, cartoucheModele);   // #944
                } else if (_tentativesCartouche < 8) {
                    setTimeout(_essayerCartouche, 250);
                }
            };
            setTimeout(_essayerCartouche, 150);
        }
    }

    return productionIdEffective;
}

/**
 * Modèle (grille / échelle / cartouche) à utiliser pour pré-remplir une NOUVELLE
 * évaluation d'une production.
 *
 * SOURCE DE VÉRITÉ = les évaluations existantes de cette production dans le
 * trimestre courant (toutes s'accordent sur un seul modèle par construction :
 * une production = une grille pour tous ses élèves). On NE fait PAS confiance
 * aveuglément à `production.grilleId/echelleId/cartoucheId` : ces champs peuvent
 * être un résidu de migration périmé (cf. #346 coursId, famille Brique D #358)
 * pointant un modèle GLOBAL partagé — les pré-sélectionner ré-injecterait ce
 * modèle dans une éval fraîche et défairait l'isolation par trimestre (oracle L2).
 *
 * Repli sur les champs de la production seulement si AUCUNE éval n'existe encore
 * pour elle, ou si les évals existantes divergent (cas anormal — on ne tranche
 * pas ici). Lecture seule.
 */
function _modeleProductionPourEval(prod) {
    if (!prod) return { grilleId: '', echelleId: '', cartoucheId: '' };
    const evals = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('evaluationsSauvegardees')
        : (typeof db !== 'undefined' ? db.getSync(cle('evaluationsSauvegardees'), []) : []);
    const liees = (evals || []).filter(function(e) {
        return e && !e.remplaceeParId && e.productionId === prod.id && e.grilleId;
    });
    if (liees.length) {
        const unique = function(champ) {
            const vus = new Set(liees.map(function(e) { return e[champ] || ''; }));
            return vus.size === 1 ? [...vus][0] : null;
        };
        const grilleId = unique('grilleId');
        if (grilleId) {
            return { grilleId: grilleId, echelleId: unique('echelleId') || '', cartoucheId: unique('cartoucheId') || '' };
        }
    }
    return { grilleId: prod.grilleId || '', echelleId: prod.echelleId || '', cartoucheId: prod.cartoucheId || '' };
}

/**
 * #946 (25 sept. 2026) — La cartouche du modèle ne se pose que sur une copie SANS évaluation.
 * Règle de Grégoire (#939) : ce qui est enregistré avec l'évaluation fait foi. Sur une copie
 * déjà évaluée, le chargeur de l'évaluation pose la sienne (`verifierEtChargerEvaluationExistante`,
 * `modifierEvaluation`) ; le modèle, s'il la posait aussi, la remplaçait selon l'ordre des
 * minuteries — et « Enregistrer » l'écrivait. `_modeleProductionPourEval` ne suffit pas à
 * l'éviter : quand les grilles des évaluations divergent, il retombe sur la production.
 */
function _cartoucheModelePourLaCopie(etudiantDA, productionId, refModele) {
    return _evaluationEnregistreeDeLaCopie({ etudiantDA, productionId }) ? '' : refModele.cartoucheId;
}

/**
 * Charge une production sélectionnée pour évaluation
 *
 * FONCTIONNEMENT:
 * 1. Récupère la production sélectionnée
 * 2. Met à jour evaluationEnCours
 * 3. Affiche les informations de la production
 *
 * UTILISÉ PAR:
 * - onchange="#selectProduction1" dans le HTML
 */
function chargerProduction(productionNum) {
    const productionId = document.getElementById('selectProduction1').value;

    if (!productionId || !evaluationEnCours) {
        return;
    }

    evaluationEnCours.productionId = productionId;

    // Récupérer les infos de la production
    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === productionId);

    if (production) {

        // Modèle isolé par trimestre : les évals existantes priment sur le champ
        // production.grilleId (potentiellement périmé → re-pollution, cf. oracle L2).
        const refModele = _modeleProductionPourEval(production);

        // Pré-sélectionner la grille associée à cette production
        if (refModele.grilleId) {
            const selectGrille = document.getElementById('selectGrille1');
            // Garde : ne poser que si la grille est offerte au dropdown actif
            // (sinon on laisserait un id fantôme qui ne charge aucun critère).
            if (selectGrille && Array.from(selectGrille.options).some(o => o.value === refModele.grilleId)) {
                selectGrille.value = refModele.grilleId;
                if (evaluationEnCours) evaluationEnCours.grilleId = refModele.grilleId;

                // Pré-sélectionner l'échelle AVANT chargerGrilleSelectionnee
                // (sinon echelleId est vide et les critères ne s'affichent pas)
                if (refModele.echelleId) {
                    const selE = document.getElementById('selectEchelle1');
                    if (selE) selE.value = refModele.echelleId;
                    if (evaluationEnCours) evaluationEnCours.echelleId = refModele.echelleId;
                }

                // Déclencher le chargement de la grille et des cartouches
                chargerGrilleSelectionnee();

                // Pré-sélectionner la cartouche immédiatement (les options sont déjà là) —
                // sur une copie sans évaluation seulement (#946).
                const etudiantDA = document.getElementById('selectEtudiantEval')?.value;
                _selectionnerCartoucheProduction(_cartoucheModelePourLaCopie(etudiantDA, productionId, refModele));

                // Vérifier si une évaluation existante doit être chargée. #946 : la cartouche
                // du modèle n'est plus réappliquée 200 ms plus tard — elle écrasait celle de
                // l'évaluation qu'on venait de charger.
                setTimeout(() => {
                    verifierEtChargerEvaluationExistante();
                }, 100);
            }
        }
    }
}

/* ===============================
   GRILLE ET CARTOUCHE
   =============================== */

/**
 * Sélectionne une cartouche dans le select si l'option existe
 */
function _selectionnerCartoucheProduction(cartoucheId) {
    if (!cartoucheId) return;
    const selC = document.getElementById('selectCartoucheEval');
    if (!selC) return;
    const optionExiste = Array.from(selC.options).some(o => o.value === cartoucheId);
    if (optionExiste) poserCartoucheParChargeur(selC, cartoucheId);   // #944
}

/**
 * Charge la grille sélectionnée
 *
 * FONCTIONNEMENT:
 * 1. Récupère la grille sélectionnée
 * 2. Charge les cartouches disponibles pour cette grille
 * 3. Met à jour evaluationEnCours
 *
 * UTILISÉ PAR:
 * - onchange="#selectGrille1" dans le HTML
 */
/* ─────────────────────────────────────────────────────────────────────────
   LES TROIS PIÈCES DE L'ÉCRAN D'ÉVALUATION (1er septembre 2026)

   L'écran a besoin de TROIS pièces pour rendre ses critères : la grille dit
   QUOI évaluer, l'échelle AVEC QUELS NIVEAUX, la cartouche AVEC QUELS
   COMMENTAIRES. Le texte d'attente n'en nommait que deux — « une grille et une
   cartouche ». L'échelle, seule pièce sans laquelle RIEN ne s'affiche, était la
   pièce muette : un nouvel enseignant choisissait sa grille, ne voyait rien
   bouger, et n'avait aucun moyen de savoir pourquoi.

   ⚠ DEUX SOURCES, UN SEUL TEXTE. Le littéral de `MESSAGE_ATTENTE_CRITERES` est
   aussi écrit en dur dans `index.html` (#listeCriteresGrille1) : l'état initial
   de la page ne peut appeler aucun JS. `tests/unit/sentinelle-attente-criteres-
   trois-pieces.test.js` exige que les deux disent la même chose — la seule
   vérité est tenue par un test, pas par la vigilance.
   ───────────────────────────────────────────────────────────────────────── */
const MESSAGE_ATTENTE_CRITERES = 'Sélectionne une grille, une échelle de performance et une cartouche.';

/**
 * Ce que l'écran DIT quand une grille est choisie sans échelle.
 *
 * Deux situations, deux gestes différents — et c'est la distinction que
 * `chargerEchellePerformance` fait déjà pour peupler son select : soit aucune
 * échelle n'existe encore (il faut en CRÉER une), soit il en existe mais aucune
 * n'est choisie (il faut en CHOISIR une). Envoyer quelqu'un choisir dans une
 * liste vide est la deuxième façon de mentir sur cet écran.
 */
function messageEchelleManquante() {
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echellePratique = _resoudreEchellePratique();
    const aucuneEchelle = (!Array.isArray(echelles) || echelles.length === 0) && !echellePratique;
    return aucuneEchelle
        ? 'Grille chargée. Aucune échelle de performance n’existe encore : crée-la dans Conception → Échelles de performance. Sans échelle, les critères ne peuvent pas apparaître.'
        : 'Grille chargée. Choisis maintenant une échelle de performance : sans elle, les critères ne peuvent pas apparaître.';
}

/** Écrit un texte d'attente dans la zone des critères. Texte constant, jamais de donnée utilisateur. */
function ecrireAttenteCriteres(texte) {
    const zone = document.getElementById('listeCriteresGrille1');
    if (!zone) return;
    const p = document.createElement('p');
    p.className = 'eval-texte-placeholder';
    p.textContent = texte;
    zone.replaceChildren(p);
}

function chargerGrilleSelectionnee() {
    const grilleId = document.getElementById('selectGrille1').value;

    if (!grilleId || !evaluationEnCours) {
        return;
    }

    // Sauvegarder l'ancienne grille pour matcher les critères par nom
    evaluationEnCours._ancienneGrilleId = evaluationEnCours.grilleId;
    evaluationEnCours.grilleId = grilleId;

    // Charger les cartouches pour cette grille
    const cartouches = db.getSync(cle(`cartouches_${grilleId}`), []);
    const selectCartouche = document.getElementById('selectCartoucheEval');

    if (selectCartouche) {
        selectCartouche.innerHTML = '<option value="">— Choisir une cartouche —</option>';
        cartouches.forEach(cartouche => {
            const nomEchappe = echapperHtml(cartouche.nom);
            const option = document.createElement('option');
            option.value = cartouche.id;
            option.textContent = nomEchappe;
            selectCartouche.appendChild(option);
        });
    }

    // Régénérer les critères depuis la nouvelle grille et recalculer la note
    // #941 lot S1 (D1) — une grille entièrement en points n'attend pas d'échelle : ses champs de
    // points n'en ont pas besoin, et sa note se calcule sans elle (`calculerNote`).
    const grilleChoisie = (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id === grilleId);
    const enPoints = typeof window.grilleEntierementEnPoints === 'function' && window.grilleEntierementEnPoints(grilleChoisie);
    _retirerEchelleDOffice(enPoints);
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    if (echelleId || enPoints) {
        // Construire un map nom→niveau depuis l'ancienne grille pour matcher par nom
        const grilles = db.getSync(cle('grillesTemplates'), []);
        const ancienneGrilleId = evaluationEnCours._ancienneGrilleId || '';
        const ancienneGrille = ancienneGrilleId ? grilles.find(g => g.id === ancienneGrilleId) : null;
        const mapNomNiveau = {};
        if (ancienneGrille && evaluationEnCours.criteres) {
            ancienneGrille.criteres.forEach(c => {
                const niveau = evaluationEnCours.criteres[c.id];
                if (niveau) {
                    mapNomNiveau[c.nom.toLowerCase().trim()] = niveau;
                }
            });
        }

        afficherCriteresDepuisGrille(grilleId, echelleId);

        // Restaurer les niveaux déjà sélectionnés pour les critères communs
        const grille = grilles.find(g => g.id === grilleId);
        if (grille && evaluationEnCours.criteres) {
            grille.criteres.forEach(critere => {
                // Match par ID d'abord, puis par nom de critère (grilles différentes, mêmes critères)
                let niveauExistant = evaluationEnCours.criteres[critere.id];
                if (!niveauExistant) {
                    niveauExistant = mapNomNiveau[critere.nom.toLowerCase().trim()];
                }
                if (niveauExistant) {
                    // Mettre à jour evaluationEnCours avec le nouvel ID
                    evaluationEnCours.criteres[critere.id] = niveauExistant;
                    const select = document.getElementById(`eval_${critere.id}`);
                    if (select) {
                        select.value = niveauExistant;
                        // Colorer le select
                        // Patch §5.6 — promotion obtenirCouleurNiveau vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
                        const couleur = typeof window.obtenirCouleurNiveau === 'function' ? window.obtenirCouleurNiveau(niveauExistant) : '';
                        if (couleur && couleur !== 'transparent') {
                            select.style.backgroundColor = couleur + '30';
                            select.style.borderColor = couleur;
                        }
                    }
                }
            });
        }

        // #645 — REPORTER AUSSI LA SAISIE ALGORITHMIQUE, pas seulement les niveaux.
        //
        // Le bloc ci-dessus reporte les NIVEAUX d'une grille à l'autre, par ID puis
        // par NOM de critère — précisément pour qu'un changement de grille ne coûte
        // pas la saisie. `donneesAlgorithmiques` (erreurs, mots, codes) n'était pas
        // du voyage : le critère algorithmique renaissait les champs VIDES, et rien
        // ne relançait son calcul. Signalé par Grégoire le 31 août 2026 sur une
        // grille « français seul » : compte d'erreurs reparti à zéro et résultat
        // bloqué à « -- erreurs sur -- mots ».
        //
        // ⚠ Ce n'est pas qu'un problème d'affichage : la sauvegarde suivante
        // persiste ce que portent les champs. Une saisie non réaffichée est une
        // saisie que le prochain enregistrement écrase par du vide.
        //
        // Même correspondance que les niveaux (ID puis NOM), pour la même raison :
        // une grille refaite porte les mêmes critères sous d'autres identifiants.
        if (grille) {
            const mapNomAlgo = {};
            if (ancienneGrille && evaluationEnCours.donneesAlgorithmiques) {
                ancienneGrille.criteres.forEach(c => {
                    const donnees = evaluationEnCours.donneesAlgorithmiques[c.id];
                    if (donnees) mapNomAlgo[c.nom.toLowerCase().trim()] = donnees;
                });
            }
            // Lot 2 (4 sept. 2026) — LES POINTS D'UN CRITÈRE ANALYTIQUE suivent aussi le
            // changement de grille, par identifiant puis par nom (même règle que #645).
            const mapNomPts = {};
            if (ancienneGrille && evaluationEnCours.pointsAnalytiques) {
                ancienneGrille.criteres.forEach(c => {
                    const pts = evaluationEnCours.pointsAnalytiques[c.id];
                    if (typeof pts === 'number') mapNomPts[c.nom.toLowerCase().trim()] = pts;
                });
            }
            grille.criteres.forEach(critere => {
                if (critere.type !== 'analytique') return;
                const ptsEx = (evaluationEnCours.pointsAnalytiques || {})[critere.id];
                const pts = (typeof ptsEx === 'number') ? ptsEx : mapNomPts[critere.nom.toLowerCase().trim()];
                if (typeof pts !== 'number') return;
                if (!evaluationEnCours.pointsAnalytiques) evaluationEnCours.pointsAnalytiques = {};
                evaluationEnCours.pointsAnalytiques[critere.id] = pts;
                const inputPts = document.getElementById(`eval_pts_${critere.id}`);
                if (inputPts) {
                    inputPts.value = pts;
                    // Lot 3 — relancer par l'événement de la frappe (même chemin que le bloc
                    // algorithmique ci-dessous) : le niveau se déduit sous le NOUVEL identifiant
                    // et la cartouche s'ouvre — remplir le champ ne suffit pas.
                    inputPts.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            grille.criteres.forEach(critere => {
                if (critere.type !== 'algorithmique') return;
                const existantes = (evaluationEnCours.donneesAlgorithmiques || {})[critere.id]
                    || mapNomAlgo[critere.nom.toLowerCase().trim()];
                if (!existantes) return;

                if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
                evaluationEnCours.donneesAlgorithmiques[critere.id] = existantes;

                const inputMots = document.getElementById(`eval_mots_${critere.id}`);
                if (inputMots && existantes.mots !== undefined) inputMots.value = existantes.mots;

                const inputCategories = document.getElementById(`eval_categories_${critere.id}`);
                if (inputCategories && Array.isArray(existantes.codes)) {
                    inputCategories.value = existantes.codes.join(';');
                }

                const nbErreurs = existantes.erreurs !== undefined ? existantes.erreurs : existantes.totalErreurs;
                const inputErreurs = document.getElementById(`eval_erreurs_${critere.id}`);
                // 21 oct. 2026 : avec sa somme pondérée, si l'évaluation en porte une (`poserErreursDuChamp`).
                if (inputErreurs && nbErreurs !== undefined) window.poserErreursDuChamp(inputErreurs, nbErreurs, existantes.sommePonderee, { enregistree: true });

                // RELANCER LE CALCUL. Remplir les champs ne suffit pas : la ligne de
                // résultat et la note ne se recalculent que sur `input`. C'est le même
                // évènement que la saisie au clavier — on ne réécrit pas le calcul ici,
                // on emprunte le chemin qui existe déjà.
                const declencheur = inputCategories || inputErreurs;
                if (declencheur) declencheur.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }

        // Recalculer la note avec les nouvelles pondérations
        setTimeout(() => calculerNote(), 50);
    } else {
        // ⚠ SANS ÉCHELLE, CE BLOC NE RENDAIT RIEN — ET NE LE DISAIT PAS.
        // `afficherCriteresDepuisGrille` a besoin d'un `echelleId` pour bâtir
        // les selects de niveaux : sans lui, la fonction entière était sautée en
        // silence. L'enseignant choisissait sa grille, la zone des critères
        // gardait son texte d'attente, et rien ne distinguait « il manque une
        // pièce » de « l'application ne réagit pas ».
        ecrireAttenteCriteres(messageEchelleManquante());
    }
}

/**
 * Charge la cartouche sélectionnée et affiche les critères
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la cartouche sélectionnée
 * 2. Vérifie le statut de remise
 * 3. Affiche les critères avec les niveaux
 * 
 * UTILISÉ PAR:
 * - onchange="#selectCartoucheEval" dans le HTML
 */
/**
 * 21 oct. 2026 (constat 7, `MESURE-2026-10-21-critere-algorithmique.md`) — LES LIBELLÉS D'UN CRITÈRE À
 * L'ÉVALUATION disent la grille et l'échelle de l'évaluation, avec les mots déjà en usage : « (30 points) »
 * sur une grille en points (`texteDePonderation`, Grilles de critères), « (30%) » sinon ; « Niveau de
 * l’échelle « X » » (la mention de Grilles de critères), ou « Niveau » sans échelle nommée. Ils disaient
 * « (30%) » et « Niveau IDME » sous toute grille et toute échelle.
 */
function libellePonderationEval(ponderation, grille) {
    const enPoints = typeof window.grilleEntierementEnPoints === 'function' && window.grilleEntierementEnPoints(grille);
    if (typeof ponderation !== 'number' || typeof window.texteDePonderation !== 'function') return ponderation + '%';
    return window.texteDePonderation(ponderation, enPoints);
}

function libelleNiveauEval(echelle) {
    const nom = (echelle && typeof echelle.nom === 'string') ? echelle.nom.trim() : '';
    return nom ? 'Niveau de l’échelle « ' + nom + ' »' : 'Niveau';
}

function cartoucheSelectionnee() {
    const cartoucheId = document.getElementById('selectCartoucheEval').value;

    if (!cartoucheId || !evaluationEnCours) {
        return;
    }

    evaluationEnCours.cartoucheId = cartoucheId;

    const statut = document.getElementById('remiseProduction1').value;
    if (statut === 'non-recu') {
        document.getElementById('listeCriteresGrille1').innerHTML =
            '<p class="eval-texte-italic-gris">Le travail doit être reçu avant évaluation</p>';
        return;
    }

    const grilleId = evaluationEnCours.grilleId;
    const cartouches = db.getSync(cle(`cartouches_${grilleId}`), []);
    const cartouche = cartouches.find(c => c.id === cartoucheId);

    if (!cartouche) return;

    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // CRITIQUE: Lire les niveaux depuis l'échelle sélectionnée (pas depuis la cartouche)
    // Cela permet d'utiliser des échelles avec plus ou moins de niveaux que la cartouche
    // NOUVEAU (Beta 92): Support échelles de pratiques configurables
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    let echelleSelectionnee = null;

    // Vérifier si c'est une échelle de pratique configurable
    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);

        if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
            echelleSelectionnee = {
                id: echelleId,
                niveaux: pratiqueData.config.echelle.niveaux || [],
                type: pratiqueData.config.echelle.type || 'niveaux'
            };
        }
    } else {
        // Échelle personnalisée classique
        const echelles = db.getSync(cle('echellesTemplates'), []);
        echelleSelectionnee = echelles.find(e => e.id === echelleId);
    }

    // Fallback: Si pas d'échelle sélectionnée ou non trouvée, utiliser les niveaux de la cartouche
    const niveauxDisponibles = (echelleSelectionnee && echelleSelectionnee.niveaux)
        ? echelleSelectionnee.niveaux
        : cartouche.niveaux;

    // Afficher les critères
    const html = cartouche.criteres.map(critere => {
        const critereGrille = grille.criteres.find(c => c.id === critere.id);
        const ponderation = critereGrille ? critereGrille.ponderation : '?';
        const estAlgorithmique = critereGrille?.type === 'algorithmique';
        const estAnalytique = critereGrille?.type === 'analytique';   // lot 2
        const facteur = critereGrille?.facteurNormalisation || 500;

        // Vérifier si la catégorisation des erreurs est activée
        const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
        let categorisationActive = modalites.activerCategorisationErreurs === true;

        // DÉTECTION AUTOMATIQUE : Si l'évaluation a des codes sauvegardés, forcer le mode catégorisation
        // Cela préserve les données existantes et la rétroaction précise
        // #1034 — « Modifier » (`_initEvaluationEnCoursPourModif`) ne pose que le pivot `window` :
        // la liaison nue de config.js ne portait pas les codes de l'évaluation rouverte. Le pivot
        // `window` d'une évaluation en modification est lu d'abord.
        const pivotModif = (window.evaluationEnCours && window.evaluationEnCours.idModification) ? window.evaluationEnCours : null;
        if ((pivotModif || evaluationEnCours)?.donneesAlgorithmiques?.[critere.id]?.codes) {
            categorisationActive = true;
        }

        return `
    <div class="eval-critere-carte">
        <div class="eval-grid-critere">
            <div>
    <div class="eval-critere-header">
        <strong class="u-texte-09" data-tooltip="eval-critere">${echapperHtml(critere.nom)}</strong>
        <small class="eval-label">(${echapperHtml(libellePonderationEval(ponderation, grille))})</small>
        ${estAlgorithmique ? '<span data-tooltip="eval-francais-ecrit" class="eval-badge-algo">ALGORITHMIQUE</span>' : ''}
    </div>
    ${critereGrille?.description ?
                `<small class="eval-critere-description">${echapperHtml(critereGrille.description)}</small>` : ''}

    ${estAlgorithmique ? (categorisationActive ? `
        <!-- Interface algorithmique AVEC catégorisation -->
        <div class="eval-grille-algo-large">
            <div class="groupe-form">
                <label data-tooltip="eval-codes-erreurs" class="eval-label">Codes d'erreurs → séparer par ;</label>
                <input type="text"
                       id="eval_categories_${critere.id}"
                       class="controle-form"
                       placeholder="Ex: 1;4;6;1;4;10"
                       data-on-input="calculerNoteAlgoCatHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}" data-critere-grille-id="${critereGrille?.id || ''}">
                <small class="eval-aide">(Voir configuration de la grille)</small>
            </div>
            <div class="groupe-form">
                <label class="eval-label">Nombre de mots</label>
                <input type="number"
                       id="eval_mots_${critere.id}"
                       class="controle-form"
                       min="1"
                       data-on-input="calculerNoteAlgoCatHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}" data-critere-grille-id="${critereGrille?.id || ''}">
            </div>
        </div>
        <div id="resultat_algo_${critere.id}" class="eval-resultat-algo">
            <span id="total_erreurs_${critere.id}">--</span> erreurs / <span id="mots_formule_${critere.id}">--</span> mots → <span id="note_algo_${critere.id}">--</span>/${ponderation} (<span id="pct_algo_${critere.id}">--</span>%) | Niveau: <span id="niveau_algo_${critere.id}">--</span><br>
            <strong>Catégorie dominante:</strong> <span id="cat_dominante_${critere.id}" class="eval-badge-algo">--</span>
            <!-- #667 — formule chiffrée, remplie par _afficherFormuleAlgo -->
            <div id="formule_algo_${critere.id}" class="eval-formule-algo u-hide"></div>
        </div>
        <div>
            <label data-tooltip="eval-niveau-idme" class="eval-label">${echapperHtml(libelleNiveauEval(echelleSelectionnee))} (modifiable manuellement) :</label>
            <select id="eval_${critere.id}" class="controle-form eval-select-niveau"
                    data-on-change="niveauSelectionne" data-param="${critere.id}">
                <option value="">— Utiliser le niveau calculé —</option>
                ${niveauxDisponibles.map(n => `<option value="${echapperHtml(n.code)}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
            </select>
            <small class="eval-aide">Par défaut: utilise le niveau calculé automatiquement. Modifiez uniquement si nécessaire (ex: jeton de reprise ciblée).</small>
        </div>
    ` : `
        <!-- Interface algorithmique SIMPLE (sans catégorisation) -->
        <div class="eval-grille-algo">
            <div class="groupe-form">
                <label class="eval-label">Nombre d'erreurs</label>
                <input type="number"
                       id="eval_erreurs_${critere.id}"
                       class="controle-form"
                       min="0"
                       placeholder="0"
                       data-on-input="calculerNoteAlgoSimpleHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}">
            </div>
            <div class="groupe-form">
                <label class="eval-label">Nombre de mots</label>
                <input type="number"
                       id="eval_mots_${critere.id}"
                       class="controle-form"
                       min="1"
                       data-on-input="calculerNoteAlgoSimpleHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}">
            </div>
        </div>
        <div id="resultat_algo_${critere.id}" class="eval-resultat-algo">
            <span id="total_erreurs_simple_${critere.id}">--</span> erreurs sur <span id="mots_simple_${critere.id}">--</span> mots → <span id="note_algo_${critere.id}">--</span>/${ponderation} (<span id="pct_algo_${critere.id}">--</span>%) | Niveau: <span id="niveau_algo_${critere.id}">--</span>
            <!-- #667 — formule chiffrée, remplie par _afficherFormuleAlgo -->
            <div id="formule_algo_${critere.id}" class="eval-formule-algo u-hide"></div>
        </div>
        <div>
            <label data-tooltip="eval-niveau-idme" class="eval-label">${echapperHtml(libelleNiveauEval(echelleSelectionnee))} (modifiable manuellement) :</label>
            <select id="eval_${critere.id}" class="controle-form eval-select-niveau"
                    data-on-change="niveauSelectionne" data-param="${critere.id}">
                <option value="">— Utiliser le niveau calculé —</option>
                ${niveauxDisponibles.map(n => `<option value="${echapperHtml(n.code)}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
            </select>
            <small class="eval-aide">Par défaut: utilise le niveau calculé automatiquement. Modifiez uniquement si nécessaire (ex: jeton de reprise ciblée).</small>
        </div>
    `) : estAnalytique ? `
        <!-- Interface analytique (lot 2, 4 sept. 2026) : des points, sur le poids du critère.
             Le maximum EST le poids ; la note en bas de la palette se fait depuis les points.
             Le champ vide montre « – », pas « 0 » : un vrai zéro se tape (retouche du 4 sept.,
             vécu par Grégoire — « je ne savais pas que le zéro prérempli était une absence »). -->
        <div class="eval-saisie-points">
            <input type="number" id="eval_pts_${critere.id}" class="controle-form eval-input-points"
                   min="0" max="${ponderation}" step="any" placeholder="–" inputmode="decimal"
                   data-on-input="pointsSaisis" data-param="${critere.id}">
            <small class="eval-label">sur ${ponderation}</small>
        </div>
    ` : `
        <!-- Interface standard (holistique) -->
        <select id="eval_${critere.id}" class="controle-form eval-select-niveau"
                data-on-change="niveauSelectionne" data-param="${critere.id}">
            <option value="">--</option>
            ${niveauxDisponibles.map(n => `<option value="${echapperHtml(n.code)}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
        </select>
    `}
</div>
            <div id="comm_${critere.id}" style="display:none;">
                ${estAlgorithmique ? 'Saisissez les erreurs et le nombre de mots' : (estAnalytique ? 'Saisis les points' : 'Sélectionne un niveau')}
            </div>
        </div>
    </div>
`;
    }).join('');

    document.getElementById('listeCriteresGrille1').innerHTML = html;
    _signalerCriteresHorsGrille(document.getElementById('listeCriteresGrille1'), grille);   // #652
    _signalerCriteresAjoutesDepuis(document.getElementById('listeCriteresGrille1'), grille);   // #705

    // Restaurer les niveaux précédemment sélectionnés (s'ils existent)
    // puis recalculer la note et regénérer la rétroaction en temps réel
    if (evaluationEnCours && evaluationEnCours.criteres) {
        let niveauxRestaures = 0;
        // Lot 2 — les points des critères analytiques reviennent dans leur champ, AVANT les
        // niveaux : le recalcul que ceux-ci déclenchent les voit.
        // Lot 3 — et par le MÊME CHEMIN que la frappe (`pointsSaisis`, comme les niveaux
        // repassent par `niveauSelectionne` ci-dessous) : le niveau se déduit, la cartouche
        // s'ouvre, le div `comm_` reçoit son commentaire au lieu de garder l'amorce.
        Object.entries(evaluationEnCours.pointsAnalytiques || {}).forEach(([critereId, pts]) => {
            const champ = document.getElementById(`eval_pts_${critereId}`);
            if (!champ || typeof pts !== 'number') return;
            champ.value = pts;
            pointsSaisis(critereId, champ);
            niveauxRestaures++;
        });
        for (const [critereId, niveau] of Object.entries(evaluationEnCours.criteres)) {
            if (!niveau) continue;
            const selectEl = document.getElementById(`eval_${critereId}`);
            if (selectEl) {
                // Vérifier que l'option existe dans le nouveau select
                const optionExiste = Array.from(selectEl.options).some(o => o.value === niveau);
                if (optionExiste) {
                    selectEl.value = niveau;
                    niveauxRestaures++;
                    // Mettre à jour le visuel du commentaire et la couleur
                    niveauSelectionne(critereId);
                }
            }
        }
        if (niveauxRestaures === 0) {
            // Aucun niveau restauré, générer quand même la rétroaction (vide de critères)
            calculerNote();
            genererRetroaction(1);
        }
    }
}

/**
 * Génère les critères directement depuis la grille (FALLBACK sans cartouche)
 *
 * UTILISÉ PAR:
 * - consulterEvaluation() quand cartoucheId est vide
 *
 * @param {string} grilleId - ID de la grille
 * @param {string} echelleId - ID de l'échelle
 */
function afficherCriteresDepuisGrille(grilleId, echelleId) {

    // Le panneau « Critères » (#listeCriteresGrille1) est déplacé par JS dans la
    // visionneuse de travaux ; il peut être absent du DOM (ex. consultation d'une
    // éval terminale sans visionneuse déployée). Garde alignée sur le jumeau gardé
    // _afficherCriteresDepuisEvaluation : on dégrade au lieu de planter — le fallback
    // _appliquerFallbackGrilleManquanteModif rend alors les critères depuis l'éval. (#348)
    const conteneur = document.getElementById('listeCriteresGrille1');
    if (!conteneur) {
        console.warn('⚠️ Conteneur listeCriteresGrille1 absent du DOM — critères non rendus depuis la grille (le fallback données sauvegardées prend le relais)');
        return;
    }

    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres) {
        console.error('❌ Grille introuvable ou sans critères');
        conteneur.innerHTML =
            '<p class="eval-texte-italic-gris">Grille introuvable</p>';
        return;
    }

    // Récupérer les niveaux de l'échelle
    let niveauxDisponibles = [];

    if (echelleId && echelleId.startsWith('pratique-')) {
        const pratiqueId = echelleId.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);
        if (pratiqueData?.config?.echelle?.niveaux) {
            niveauxDisponibles = pratiqueData.config.echelle.niveaux;
        }
    } else {
        const echelles = db.getSync(cle('echellesTemplates'), []);
        const echelle = echelles.find(e => e.id === echelleId);
        if (echelle?.niveaux) {
            niveauxDisponibles = echelle.niveaux;
        }
    }

    // Fallback: niveaux IDME par défaut
    if (niveauxDisponibles.length === 0) {
        niveauxDisponibles = [
            { code: 'I', nom: 'Incomplet' },
            { code: 'D', nom: 'Développement' },
            { code: 'M', nom: 'Maîtrise' },
            { code: 'E', nom: 'Étendu' }
        ];
    }

    // Générer le HTML pour chaque critère
    const html = grille.criteres.map(critere => {
        const ponderation = critere.ponderation || '?';
        const estAlgorithmique = critere.type === 'algorithmique';
        const estAnalytique = critere.type === 'analytique';   // lot 2
        const facteur = critere.facteurNormalisation || 500;

        return `
    <div class="eval-critere-carte">
        <div class="eval-grid-critere">
            <div>
                <div class="eval-critere-header">
                    <strong class="u-texte-09" data-tooltip="eval-critere">${echapperHtml(critere.nom)}</strong>
                    <small class="eval-label">(${echapperHtml(libellePonderationEval(ponderation, grille))})</small>
                    ${estAlgorithmique ? '<span data-tooltip="eval-francais-ecrit" class="eval-badge-algo">ALGORITHMIQUE</span>' : ''}
                </div>
                ${critere.description ? `<small class="eval-critere-description">${echapperHtml(critere.description)}</small>` : ''}

                ${estAlgorithmique ? `
                    <!-- Interface algorithmique SIMPLE (mode consultation) -->
                    <div class="eval-grille-algo">
                        <div class="groupe-form">
                            <label class="eval-label">Nombre d'erreurs</label>
                            <input type="number"
                                   id="eval_erreurs_${critere.id}"
                                   class="controle-form"
                                   min="0"
                                   placeholder="0"
                                   data-on-input="calculerNoteAlgoSimpleHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}">
                        </div>
                        <div class="groupe-form">
                            <label class="eval-label">Nombre de mots</label>
                            <input type="number"
                                   id="eval_mots_${critere.id}"
                                   class="controle-form"
                                   min="1"
                                   data-on-input="calculerNoteAlgoSimpleHandler" data-critere-id="${critere.id}" data-ponderation="${ponderation}" data-facteur="${facteur}">
                        </div>
                    </div>
                    <!-- #645 — LA LIGNE DE RESULTAT ETAIT DU TEXTE FIGE, et le calcul
                         n'avait donc nulle part ou ecrire. Elle affichait « -- erreurs sur
                         -- mots » quoi qu'il arrive : calculerNoteAlgorithmiqueSimple
                         cherchait « total_erreurs_simple_<id> » et ses voisins, ne les
                         trouvait pas, et renoncait par ses gardes — en silence. Mesure le
                         31 aout 2026 sur ce chemin : « eval_erreurs_<id> » existait,
                         « total_erreurs_simple_<id> » non, et le calcul rendait pourtant
                         note, pourcentage, niveau et retroaction. Ce n'etait pas un calcul
                         en panne, c'etait un afficheur absent.
                         Memes id que le chemin jumeau (cartoucheSelectionnee), qui les
                         portait deja : on ne cree pas un second vocabulaire.
                         ⚠ Pas d'accent grave dans ce commentaire : il vit DANS un litteral
                         de gabarit, ou un accent grave termine le gabarit. -->
                    <div id="resultat_algo_${critere.id}" class="eval-resultat-algo">
                        <span id="total_erreurs_simple_${critere.id}">--</span> erreurs sur <span id="mots_simple_${critere.id}">--</span> mots &rarr; <span id="note_algo_${critere.id}">--</span>/${ponderation} (<span id="pct_algo_${critere.id}">--</span>%) | Niveau: <span id="niveau_algo_${critere.id}">--</span>
                        <!-- #667 — formule chiffrée (mode consultation) -->
                        <div id="formule_algo_${critere.id}" class="eval-formule-algo u-hide"></div>
                    </div>
                    <select id="eval_${critere.id}" class="controle-form eval-select-niveau"
                            data-on-change="niveauSelectionne" data-param="${critere.id}">
                        <option value="">--</option>
                        ${niveauxDisponibles.map(n => `<option value="${echapperHtml(n.code)}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
                    </select>
                ` : estAnalytique ? `
                    <!-- Interface analytique (lot 2, 4 sept. 2026) : des points, sur le poids.
                         Le champ vide montre « – », pas « 0 » : un vrai zéro se tape (retouche du 4 sept.). -->
                    <div class="eval-saisie-points">
                        <input type="number" id="eval_pts_${critere.id}" class="controle-form eval-input-points"
                               min="0" max="${ponderation}" step="any" placeholder="–" inputmode="decimal"
                               data-on-input="pointsSaisis" data-param="${critere.id}">
                        <small class="eval-label">sur ${ponderation}</small>
                    </div>
                ` : `
                    <!-- Interface standard -->
                    <select id="eval_${critere.id}" class="controle-form eval-select-niveau"
                            data-on-change="niveauSelectionne" data-param="${critere.id}">
                        <option value="">--</option>
                        ${niveauxDisponibles.map(n => `<option value="${echapperHtml(n.code)}">${echapperHtml(n.code)} - ${echapperHtml(n.nom)}</option>`).join('')}
                    </select>
                `}
            </div>
            <div id="comm_${critere.id}" class="u-hide">
                ${estAlgorithmique ? 'Saisissez les erreurs et le nombre de mots' : (estAnalytique ? 'Saisis les points' : 'Sélectionne un niveau')}
            </div>
        </div>
    </div>
`;
    }).join('');

    conteneur.innerHTML = html;
    _signalerCriteresHorsGrille(conteneur, grille);   // #652
    _signalerCriteresAjoutesDepuis(conteneur, grille);   // #705
}

/* ===============================
   📝 ÉVALUATION DES CRITÈRES
   =============================== */

/**
 * Gère la sélection d'un niveau pour un critère
 * 
 * FONCTIONNEMENT:
 * 1. Enregistre le niveau sélectionné
 * 2. Affiche le commentaire correspondant
 * 3. Calcule la note en temps réel
 * 4. Génère la rétroaction en temps réel
 * 
 * UTILISÉ PAR:
 * - onchange sur les selects de critères
 */
/**
 * Le commentaire de cartouche attaché à un niveau d'un critère, écrit dans le div
 * `comm_<critereId>` (caché ; c'est lui que les collecteurs de `criteres[]` lisent
 * comme `retroaction` à l'enregistrement). Clé de la cartouche : `critereId_niveau`.
 * Extrait de `niveauSelectionne` au lot 3 (4 sept. 2026) pour servir aussi au niveau
 * DÉDUIT d'un critère analytique (`pointsSaisis`) : une seule façon d'ouvrir la
 * cartouche, qu'on ait choisi le niveau au menu ou tapé un chiffre.
 */
function _afficherCommentaireCritere(critereId, niveau) {
    if (!niveau || !evaluationEnCours) return;
    const grilleId = evaluationEnCours.grilleId;
    const cartouches = evaluationEnCours.cartoucheId ? (db.getSync(cle(`cartouches_${grilleId}`), []) || []) : [];
    const cartouche = cartouches.find(c => c.id === evaluationEnCours.cartoucheId) || null;
    // #960 — `null` : rien d'enregistré à ce niveau ; un texte, VIDE compris (D6, la règle partagée).
    const enregistre = _commentaireEnregistreDuCritere(critereId, niveau);
    if (!cartouche && enregistre === null) return;

    // #939 — LE COMMENTAIRE ENREGISTRÉ PASSE AVANT LA CARTOUCHE VIVANTE (décision de Grégoire,
    // 24 sept. 2026 : une cartouche retouchée ne change pas une copie déjà évaluée). À la
    // réouverture, les niveaux repassent par `niveauSelectionne` : ce div recevait la cartouche
    // d'AUJOURD'HUI, et le prochain enregistrement écrasait le commentaire d'alors. Même règle
    // que le PDF (`commentaireDuCritere`). Sans commentaire nulle part, le div est vidé — plus
    // de « [Non défini] », que les collecteurs enregistraient et que l'élève lisait.
    const commentaire = window.syntheseRetroactionData.commentaireDuCritere({ enregistre, cartouche, critereId, niveau });

    const commDiv = document.getElementById(`comm_${critereId}`);
    if (commDiv) {
        commDiv.textContent = commentaire;
        commDiv.style.fontStyle = 'normal';
        commDiv.style.color = 'var(--gris-moyen)';
    }
}

/**
 * #939 — Le commentaire enregistré avec CETTE copie pour ce critère, s'il a été écrit au MÊME
 * niveau (un texte, vide compris : #960, D6) ; sinon null. Un niveau changé, c'est un autre commentaire : celui de la cartouche au
 * nouveau niveau. L'identifiant, l'élève et la production viennent de
 * `etatVivantEvaluationEnCours` (les deux liaisons, #699 / #919) ; une évaluation d'un autre
 * élève ou d'une autre production n'est jamais lue.
 * ⚠ Sans identifiant, la même recherche que `verifierEtChargerEvaluationExistante` (même
 * élève, même production, non remplacée) : ce chargeur restaure les niveaux AVANT de poser
 * `idModification` (evaluation.js, le `setTimeout` de la restauration). Mesuré en WebKit le
 * 24 sept. : un second passage (`cartoucheSelectionnee`) suit, identifiant posé ; sans ce
 * repli, le div porte la cartouche d'aujourd'hui entre les deux. Le banc Vitest #939 le
 * tient, la spec WebKit ne le distingue pas (le second passage le masque).
 */
function _commentaireEnregistreDuCritere(critereId, niveau) {
    const vivant = _etatVivantDeLaCopie();
    const evaluation = _evaluationEnregistreeDeLaCopie(vivant);
    if (!evaluation || _remplacementConfirmeActif(vivant, evaluation)) return null;
    const critere = (evaluation.criteres || []).find(c => c.critereId === critereId);
    // Seule une CHAÎNE est un enregistré : sans clé `retroaction` (ou `null`), rien d'enregistré,
    // la cartouche — la même frontière que le PDF, qui reçoit `c.retroaction` tel quel (#960, R1).
    return (critere && critere.niveauSelectionne === niveau && typeof critere.retroaction === 'string')
        ? critere.retroaction : null;
}

function _etatVivantDeLaCopie() {
    return (typeof window.etatVivantEvaluationEnCours === 'function')
        ? window.etatVivantEvaluationEnCours() : (evaluationEnCours || {});
}

/** L'évaluation enregistrée de la copie ouverte (#939), ou null. */
function _evaluationEnregistreeDeLaCopie(vivant) {
    if (!vivant || !vivant.etudiantDA || !vivant.productionId) return null;
    // Le lecteur du chargeur (`obtenirDonneesSelonMode`) : l'élève et la production s'y comparent
    // comme lui les compare.
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluation = vivant.idModification
        ? evaluations.find(e => e.id === vivant.idModification)
        : evaluations.find(e => e.etudiantDA === vivant.etudiantDA && e.productionId === vivant.productionId && !e.remplaceeParId);
    if (!evaluation || evaluation.etudiantDA !== vivant.etudiantDA || evaluation.productionId !== vivant.productionId) return null;
    return evaluation;
}

/* ===============================
   #944 — CHANGER DE CARTOUCHE SUR UNE COPIE DÉJÀ ÉVALUÉE
   =============================== */

/**
 * #944 (24 sept. 2026) — LA RÈGLE #939 A UNE EXCEPTION, ET UNE SEULE : LE GESTE CONFIRMÉ.
 * Décision de Grégoire : une cartouche retouchée en arrière-plan ne change jamais une copie
 * déjà évaluée ; mais l'enseignant qui CHOISIT une autre cartouche au menu, et le confirme,
 * veut ses commentaires. Sans cette exception, le commentaire enregistré (clé critère +
 * niveau, indépendant de la cartouche) gagnait toujours : changer de cartouche ne changeait
 * rien (BUG_grégoire_2026-09-24_15-52-33, « Carte mentale A26 (rev) »).
 *
 * Le remplacement vaut pour UNE copie (élève + production) et UNE cartouche. Il n'est actif
 * que tant que la cartouche appliquée est celle qu'on a confirmée ET qu'elle diffère de celle
 * de l'évaluation enregistrée : dès le prochain enregistrement, la cartouche enregistrée EST
 * la nouvelle, le commentaire enregistré est le nouveau, et #939 le protège de nouveau. Revenir
 * à la cartouche enregistrée, ou rouvrir la copie sans avoir enregistré, rend aussi la main
 * aux commentaires d'alors. Rien n'est écrit dans le stock : seulement dans cette variable.
 */
let _remplacementConfirme = null;   // { etudiantDA, productionId, cartoucheId }

function _remplacementConfirmeActif(vivant, evaluation) {
    const r = _remplacementConfirme;
    return !!(r && vivant && evaluation
        && r.etudiantDA === vivant.etudiantDA && r.productionId === vivant.productionId
        && r.cartoucheId === vivant.cartoucheId && r.cartoucheId !== evaluation.cartoucheId);
}

/** La copie a-t-elle au moins un commentaire enregistré qui fait foi (règle #939) ? */
function _aDesCommentairesEnregistres(evaluation) {
    const regle = window.syntheseRetroactionData.commentaireDuCritere;
    return !!evaluation && (evaluation.criteres || []).some(c => regle({ enregistre: c.retroaction }) !== '');
}

/**
 * #944 — Les CHARGEURS posent eux aussi la cartouche au menu par un `change` scripté (la
 * mémorisation des sélections l'écoute). Ce n'est pas le geste de l'enseignant : ils passent
 * par ici, et `choisirCartoucheEval` les laisse filer sans rien demander. Sans cette marque,
 * la réapplication de la cartouche modèle (`chargerProduction`, 300 ms après l'ouverture
 * d'une copie évaluée) ouvrirait la confirmation toute seule.
 */
let _cartouchePoseeParChargeur = false;
function poserCartoucheParChargeur(select, cartoucheId) {
    select.value = cartoucheId;
    _cartouchePoseeParChargeur = true;
    try {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    } finally {
        _cartouchePoseeParChargeur = false;
    }
}

/**
 * #944 — LE GESTE : l'enseignant choisit une cartouche au menu (`data-on-change`).
 * Copie sans commentaire enregistré, ou retour à la cartouche de l'évaluation : rien à
 * demander, comportement d'avant. Sinon, la confirmation ; le menu montre l'ancienne
 * cartouche le temps de la question, pour qu'un enregistrement automatique ne lise pas
 * la nouvelle avant la réponse. Annuler : rien ne change, cartoucheId compris.
 */
async function choisirCartoucheEval(select) {
    if (_cartouchePoseeParChargeur || !select || !evaluationEnCours) return cartoucheSelectionnee();
    // #961 — le remplacement CONFIRMÉ remplace la rétroaction, retouches comprises (la question
    // le dit) : elle suit de nouveau les niveaux. Les chemins sans question (R1 de Cowork) gardent
    // la marque : les commentaires des critères s'appliquent, la garde garde le texte.
    const changerAuGeste = () => {
        if (typeof window.poserRetroactionReecrite === 'function') window.poserRetroactionReecrite(false);
        return cartoucheSelectionnee();
    };

    const nouvelle = select.value;
    const vivant = _etatVivantDeLaCopie();
    const evaluation = _evaluationEnregistreeDeLaCopie(vivant);
    const r = _remplacementConfirme;
    const dejaConfirme = r && vivant && r.etudiantDA === vivant.etudiantDA
        && r.productionId === vivant.productionId && r.cartoucheId === nouvelle;
    if (!nouvelle || !evaluation || nouvelle === evaluation.cartoucheId || dejaConfirme) {
        return cartoucheSelectionnee();
    }
    // Rien d'écrit à perdre : pas de question, mais c'est bien le geste de l'enseignant. Il vaut
    // remplacement, sans quoi un commentaire enregistré vide resterait vide (#960, D6) sous la
    // cartouche qu'il vient de choisir.
    if (!_aDesCommentairesEnregistres(evaluation)) {
        _remplacementConfirme = { etudiantDA: vivant.etudiantDA, productionId: vivant.productionId, cartoucheId: nouvelle };
        return cartoucheSelectionnee();
    }

    const precedente = evaluationEnCours.cartoucheId || evaluation.cartoucheId || '';
    const option = Array.from(select.options).find(o => o.value === nouvelle);
    const nom = option ? option.textContent : nouvelle;
    select.value = precedente;
    if (typeof window.memoriserSelectionsEvaluation === 'function') window.memoriserSelectionsEvaluation();

    const remplacer = await window.uiDialogues.confirmerAction({
        titre: 'Changer de cartouche',
        message: `Remplacer les commentaires de cette copie par ceux de la cartouche « ${nom} » ? `
            + 'Les retouches faites à la main dans la rétroaction de cette copie seront perdues.',
        texteConfirmer: 'Remplacer',
        texteAnnuler: 'Garder les commentaires actuels',
        variante: 'danger'
    });
    if (!remplacer) return;

    _remplacementConfirme = { etudiantDA: vivant.etudiantDA, productionId: vivant.productionId, cartoucheId: nouvelle };
    select.value = nouvelle;
    if (typeof window.memoriserSelectionsEvaluation === 'function') window.memoriserSelectionsEvaluation();
    changerAuGeste();
}

function niveauSelectionne(critereId) {
    const selectElement = document.getElementById(`eval_${critereId}`);
    const niveau = selectElement.value;

    if (!evaluationEnCours) return;

    evaluationEnCours.criteres[critereId] = niveau;

    // Si le dropdown est vidé et qu'il y a des données algorithmiques, restaurer le niveau calculé
    // (corrige le bug où le critère était ignoré du calcul après revert d'une sélection manuelle)
    if (!niveau && evaluationEnCours.donneesAlgorithmiques?.[critereId]?.niveau) {
        evaluationEnCours.criteres[critereId] = evaluationEnCours.donneesAlgorithmiques[critereId].niveau;
    }

    // Mettre à jour la couleur du select
    if (niveau) {
        // Patch §5.6 — promotion obtenirCouleurNiveau vers evaluation-calcul.js (session B étape 3 refactor 2026-05-18)
        const couleur = window.obtenirCouleurNiveau ? window.obtenirCouleurNiveau(niveau) : 'transparent';
        selectElement.style.backgroundColor = couleur + '30'; // 30 = 20% opacité
        selectElement.style.borderColor = couleur;
        selectElement.style.fontWeight = 'normal';
    } else {
        selectElement.style.backgroundColor = 'transparent';
        selectElement.style.borderColor = 'var(--bordure-claire)';
        selectElement.style.fontWeight = 'normal';
    }

    // Afficher le commentaire correspondant
    _afficherCommentaireCritere(critereId, niveau);

    // Calculer la note et générer la rétroaction en temps réel
    calculerNote();

    // Marquer le critère modifié pour auto-scroll dans la rétroaction
    if (evaluationEnCours) {
        evaluationEnCours._dernierCritereModifie = critereId;
    }
    genererRetroaction(1);
    if (evaluationEnCours) {
        evaluationEnCours._dernierCritereModifie = null;
    }

    // Auto-déplier la palette Rétroaction si elle est repliée
    const paletteRetro = document.getElementById('travaux-palette-eval-retro');
    if (paletteRetro && paletteRetro.classList.contains('replie')) {
        paletteRetro.classList.remove('replie');
        const btn = paletteRetro.querySelector('[data-action="travauxUI.togglePaletteEvalReplie"]'); // #936 : pas le « ↔ »
        if (btn) btn.innerHTML = '&#x2212;';
    }

    // Auto-sauvegarder apres un delai
    _debouncerAutoSave();
}

/**
 * Lot 2 (4 sept. 2026) — LES POINTS D'UN CRITÈRE ANALYTIQUE, jumeau de `niveauSelectionne`.
 * Le champ va de 0 au poids du critère (le maximum EST le poids, décision de Grégoire) ;
 * la valeur est gardée telle que saisie dans `evaluationEnCours.pointsAnalytiques[critereId]`,
 * le pourcentage n'est jamais stocké, il se dérive dans `evaluation-calcul.js`. Un champ
 * vidé RETIRE l'entrée : le critère redevient « sans niveau » pour la portée (#674) et la
 * note se retient. Hors bornes, la valeur est ramenée dans [0, poids] et le champ le montre.
 * Écrit dans le nom nu, comme `niveauSelectionne` (#646 : deux emplacements).
 */
function pointsSaisis(critereId, el) {
    if (!evaluationEnCours) return;
    if (!evaluationEnCours.pointsAnalytiques) evaluationEnCours.pointsAnalytiques = {};
    const champ = (el && typeof el === 'object') ? el : document.getElementById(`eval_pts_${critereId}`);
    const brut = champ ? String(champ.value == null ? '' : champ.value).trim() : '';
    if (brut === '' || isNaN(Number(brut))) {
        delete evaluationEnCours.pointsAnalytiques[critereId];
        // Lot 3 — le niveau déduit part avec les points : le critère redevient « sans
        // niveau », et une cartouche ne s'ouvre plus sur un chiffre qui n'y est plus.
        if (evaluationEnCours.criteres) delete evaluationEnCours.criteres[critereId];
    } else {
        const max = Number(champ && champ.max);
        let pts = Number(brut);
        if (pts < 0) pts = 0;
        if (!isNaN(max) && max > 0 && pts > max) pts = max;
        if (champ && Number(champ.value) !== pts) champ.value = pts;
        evaluationEnCours.pointsAnalytiques[critereId] = pts;
    }

    // Calculer la note et générer la rétroaction en temps réel — comme un niveau choisi.
    // Lot 3 — `calculerNote` déduit le niveau des points par les bornes de l'échelle et
    // l'écrit dans `evaluationEnCours.criteres[critereId]` ; c'est ce niveau qui ouvre la
    // cartouche, exactement comme un niveau choisi au menu.
    calculerNote();
    _afficherCommentaireCritere(critereId, (evaluationEnCours.criteres || {})[critereId]);
    evaluationEnCours._dernierCritereModifie = critereId;
    genererRetroaction(1);
    evaluationEnCours._dernierCritereModifie = null;

    // Auto-sauvegarder apres un delai
    _debouncerAutoSave();
}
/* ===============================
   AUTO-SAUVEGARDE DEBOUNCE (1.5s)
   Persiste les criteres en IDB apres chaque modification
   =============================== */

window._timerAutoSave = null;
window._pendingAutoSaveSnapshot = null;

/**
 * Suspend l'auto-save temporairement (500 ms). Utilisé pendant le chargement
 * d'une évaluation (reset partiel + restauration depuis DB + dispatch d'events
 * sur les selects de critères), pour éviter qu'un snapshot capturé dans la
 * fenêtre de race condition écrase les valeurs déjà persistées (criteres,
 * donneesAlgorithmiques, etc.) par un état intermédiaire vide ou tronqué.
 */
function _suspendreAutoSaveTemporairement() {
    window._autoSaveSuspendu = true;
    clearTimeout(window._autoSaveSuspendreTimer);
    window._autoSaveSuspendreTimer = setTimeout(function() {
        window._autoSaveSuspendu = false;
    }, 500);
}

function _debouncerAutoSave() {
    // Ignorer les debounces pendant le chargement d'une évaluation (cf.
    // `_suspendreAutoSaveTemporairement`).
    if (window._autoSaveSuspendu) return;
    // #960 — un chargeur qui restaure une évaluation n'écrit rien : ses `change` scriptés ne
    // sont pas des gestes. La suspension de 500 ms ne couvrait pas « Modifier », qui restaure
    // les niveaux bien après (mesuré : +660 ms sur le trajet de la copie).
    if (window._chargementsEvaluationEnCours > 0) return;
    if (window._timerAutoSave) clearTimeout(window._timerAutoSave);
    // Snapshot de l'état ACTUEL pour pouvoir flusher si l'utilisateur change d'élève.
    // #699 (G-2, audit du 5 sept. 2026) — pris LÀ OÙ LE CALCUL LIT : le nom nu l'emporte
    // (`etatVivantEvaluationEnCours`, evaluation-calcul.js). L'instantané pris sur `window`
    // seul écrivait la note neuve avec les critères anciens après une réouverture (spec WebKit
    // #699). Le littéral ci-dessous ne sert plus que si le module de calcul n'est pas chargé.
    window._pendingAutoSaveSnapshot = (typeof window.etatVivantEvaluationEnCours === 'function')
        ? window.etatVivantEvaluationEnCours()
        : {
        etudiantDA: window.evaluationEnCours?.etudiantDA,
        productionId: window.evaluationEnCours?.productionId,
        grilleId: window.evaluationEnCours?.grilleId,
        echelleId: window.evaluationEnCours?.echelleId,
        cartoucheId: window.evaluationEnCours?.cartoucheId,
        criteres: Object.assign({}, window.evaluationEnCours?.criteres),
        donneesAlgorithmiques: window.evaluationEnCours?.donneesAlgorithmiques
            ? JSON.parse(JSON.stringify(window.evaluationEnCours.donneesAlgorithmiques)) : {},
        pointsAnalytiques: window.evaluationEnCours?.pointsAnalytiques
            ? JSON.parse(JSON.stringify(window.evaluationEnCours.pointsAnalytiques)) : {}   // lot 2
    };
    // Lot C — l'intégrité voyage DANS l'instantané : l'écriture peut partir après un changement
    // de copie, quand l'écran montre déjà l'élève suivant (#959 le remet à « recevable »).
    window._pendingAutoSaveSnapshot.integrite = _lireIntegriteEcran();
    window._timerAutoSave = setTimeout(function() { _autoSauvegarderCriteres(window._pendingAutoSaveSnapshot); }, 1500);
}

/**
 * #564 — Déclencheur d'auto-save pour la rétroaction finale.
 *
 * Avant ce correctif, `_debouncerAutoSave` n'avait qu'un seul appelant :
 * `niveauSelectionne`. Modifier SEULEMENT le texte de la rétroaction, sans
 * toucher un critère, ne créait donc aucun snapshot — `_flusherAutoSave` au
 * changement de fichier n'avait rien à persister et le texte était perdu. Seul
 * le bouton « Enregistrer » le sauvait. Perte réelle en navigation rapide
 * entre copies.
 *
 * `_autoSauvegarderCriteres` lisait DÉJÀ `retroactionFinale1` dans le DOM (via
 * `_majEvaluationExistanteAutoSave`) : il ne manquait que le déclencheur.
 *
 * Câblé par `data-on-input` sur le textarea (délégation `main.js`). Les
 * générations automatiques de rétroaction passent par `.value = …`, qui NE
 * déclenche PAS d'événement `input` : seule une frappe de l'utilisateur arme
 * le debounce. La garde `_autoSaveSuspendu` de `_debouncerAutoSave` reste donc
 * le seul rempart nécessaire contre la race condition de chargement.
 */
function retroactionModifiee() {
    // #961 (D7) — une frappe marque la rétroaction : elle ne suit plus les niveaux.
    if (typeof window.poserRetroactionReecrite === 'function') window.poserRetroactionReecrite(true);
    _debouncerAutoSave();
}

/**
 * Flush l'auto-save en attente immédiatement (appelé avant changement d'étudiant/fermeture)
 */
function _flusherAutoSave() {
    if (window._timerAutoSave) {
        clearTimeout(window._timerAutoSave);
        window._timerAutoSave = null;
    }
    if (window._pendingAutoSaveSnapshot) {
        _autoSauvegarderCriteres(window._pendingAutoSaveSnapshot);
        window._pendingAutoSaveSnapshot = null;
    }
}

// Helpers privés pour _autoSauvegarderCriteres (extraction étape 4 — éclatement cyc 55 → cyc ≤ 15)

/**
 * #652 (16 sept. 2026) — LES CRITÈRES ÉVALUÉS QUI NE SONT PLUS DANS LEUR GRILLE.
 *
 * Une grille modifiée après coup (critère retiré) laisse dans `evaluation.criteres[]` des
 * entrées qu'aucune carte ne rend plus. Arrêté par Grégoire le 16 sept. 2026 : on les
 * CONSERVE et on les SIGNALE. Les collecteurs de `criteres[]` parcourent la grille : sans
 * cette fonction, la première réécriture (auto-save, « Enregistrer ») les effaçait en silence.
 *
 * Rend les entrées de `evaluation` dont le `critereId` n'est pas un critère de `grille` —
 * seulement si l'évaluation porte sur CETTE grille (changer de grille n'emporte rien).
 */
function criteresHorsGrille(evaluation, grille) {
    if (!evaluation || !grille || !Array.isArray(grille.criteres)) return [];
    if (evaluation.grilleId !== grille.id || !Array.isArray(evaluation.criteres)) return [];
    const ids = new Set(grille.criteres.map(c => c && c.id));
    return evaluation.criteres.filter(c => c && c.critereId && !ids.has(c.critereId));
}

/**
 * #652 — nomme, en tête des critères, ceux que l'évaluation OUVERTE garde mais que la grille ne
 * rend plus. Appelée par les DEUX renderers juste après leur `innerHTML` : la liste est réécrite
 * plusieurs fois pendant une ouverture (sélection différée de la cartouche de la production,
 * mesurée à +700 ms), un avis posé une fois par l'ouverture était effacé.
 * Seulement en modification (`idModification`) ; construit par `textContent` (noms = données).
 */
function _signalerCriteresHorsGrille(conteneur, grille) {
    // Sur `window` : c'est là que l'ouverture pose `idModification` (le nom nu de config.js est un autre objet).
    const idModification = window.evaluationEnCours && window.evaluationEnCours.idModification;
    if (!conteneur || !idModification) return;
    const evaluation = db.getSync(cle('evaluationsSauvegardees'), []).find(e => e.id === idModification);
    const horsGrille = criteresHorsGrille(evaluation, grille);
    if (horsGrille.length === 0) return;

    const avis = document.createElement('div');
    avis.id = 'avisCriteresHorsGrille';
    avis.className = 'alerte alerte-attention';
    const titre = document.createElement('strong');
    titre.textContent = horsGrille.length === 1
        ? 'Un critère évalué n\'est plus dans la grille'
        : `${horsGrille.length} critères évalués ne sont plus dans la grille`;
    const detail = document.createElement('div');
    detail.textContent = horsGrille.map(c => {
        const valeur = typeof c.points === 'number' ? `${c.points} pts` : (c.niveauSelectionne || '—');
        return `${c.critereNom || c.critereId} (${valeur})`;
    }).join(' · ');
    const explication = document.createElement('small');
    explication.textContent = 'L\'évaluation garde ce qui a été enregistré. La note se recalcule sur la grille actuelle dès que tu modifies cette copie.';
    avis.append(titre, detail, explication);
    conteneur.prepend(avis);
}

/**
 * #705 (19 sept. 2026) — LE JUMEAU INVERSÉ DE #652 : les critères que la grille porte et que
 * l'évaluation OUVERTE ne couvre pas, parce qu'ils ont été ajoutés après elle. Décision de
 * Grégoire (17 sept.) : l'évaluation se juge contre SA grille, sa note et son PDF concluent ;
 * le critère ajouté est SIGNALÉ, ici, à l'enseignant·e — jamais sur le PDF de l'élève. La règle
 * (« ajouté depuis » : mesuré par la date quand elle existe, présumé sinon) vit dans
 * `criteresAjoutesDepuis` (evaluation-calcul.js), la même que lit la portée du PDF.
 * Mêmes contraintes que #652 : appelée par les DEUX renderers après leur `innerHTML`,
 * seulement en modification, seulement sur la grille de l'évaluation, par `textContent`.
 */
function _signalerCriteresAjoutesDepuis(conteneur, grille) {
    const idModification = window.evaluationEnCours && window.evaluationEnCours.idModification;
    if (!conteneur || !grille || !idModification || typeof window.criteresAjoutesDepuis !== 'function') return;
    const evaluation = db.getSync(cle('evaluationsSauvegardees'), []).find(e => e.id === idModification);
    if (!evaluation || evaluation.grilleId !== grille.id) return;
    const ajoutes = window.criteresAjoutesDepuis(evaluation, grille);
    if (ajoutes.length === 0) return;

    const un = ajoutes.length === 1;
    const avis = document.createElement('div');
    avis.id = 'avisCriteresAjoutesDepuis';
    avis.className = 'alerte alerte-attention';
    const titre = document.createElement('strong');
    titre.textContent = un
        ? 'Un critère a été ajouté à la grille après cette évaluation'
        : `${ajoutes.length} critères ont été ajoutés à la grille après cette évaluation`;
    const detail = document.createElement('div');
    detail.textContent = ajoutes.map(c => `${c.nom} (${c.ponderation} %)`).join(' · ');
    const explication = document.createElement('small');
    explication.textContent = (un ? 'La note enregistrée ne le couvre pas' : 'La note enregistrée ne les couvre pas')
        + ' et reste valable : le PDF de l\'élève conclut normalement. Si tu modifies cette copie, il faudra '
        + (un ? 'lui' : 'leur') + ' donner un niveau avant de verrouiller.';
    avis.append(titre, detail, explication);
    conteneur.prepend(avis);
}

function _collecterCriteresAutoSave(grille, ec) {
    const criteres = [];
    grille.criteres.forEach(function(c) {
        const niveau = ec.criteres[c.id];
        // #941 lot S1 — sans échelle, un critère analytique n'a pas de niveau déduit : ses
        // points suffisent à le faire entrer (`niveauSelectionne` vide).
        const ptsSaisis = (ec.pointsAnalytiques || {})[c.id];
        const aDesPoints = c.type === 'analytique' && typeof ptsSaisis === 'number' && !isNaN(ptsSaisis);
        if (niveau || aDesPoints) {
            const commDiv = document.getElementById('comm_' + c.id);
            const entree = {
                critereId: c.id,
                critereNom: c.nom,
                niveauSelectionne: niveau || '',
                retroaction: commDiv ? commDiv.textContent : '',
                ponderation: c.ponderation || 0
            };
            // Lot 3 (4 sept. 2026) — un critère analytique entre avec ses POINTS et son
            // niveau DÉDUIT (`niveauSelectionne`, posé par `calculerNote`) : les seize
            // lecteurs de `criteres[]` voient le niveau, et le PDF de l'élève imprime
            // « points / pondération ». La source des points reste `pointsAnalytiques`.
            const pts = (ec.pointsAnalytiques || {})[c.id];
            if (c.type === 'analytique' && typeof pts === 'number' && !isNaN(pts)) entree.points = pts;
            criteres.push(entree);
        }
    });
    return criteres;
}

function _majEvaluationExistanteAutoSave(evalExistante, ec, criteres) {
    // #944 — un remplacement confirmé écrit ses commentaires ici même (les niveaux restaurés
    // arment l'auto-save) : la cartouche part avec eux, sinon la base porterait les
    // commentaires de la nouvelle sous le nom de l'ancienne. Hors ce geste, l'auto-save ne
    // touche jamais `cartoucheId` (seul « Enregistrer » l'écrit).
    if (_remplacementConfirme && _remplacementConfirmeActif(_etatVivantDeLaCopie(), evalExistante)) {
        evalExistante.cartoucheId = _remplacementConfirme.cartoucheId;
    }
    evalExistante.criteres = criteres;
    evalExistante.noteFinale = (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : evalExistante.noteFinale;   // #572
    evalExistante.ponderationCouverte = (window.porteeCalculeeCourante && typeof window.porteeCalculeeCourante.ponderationCouverte === 'number') ? window.porteeCalculeeCourante.ponderationCouverte : evalExistante.ponderationCouverte;   // #674 — la portée voyage avec la note
    evalExistante.niveauFinal = (document.getElementById('niveauProduction1') || {}).textContent || evalExistante.niveauFinal;
    var retroEl = document.getElementById('retroactionFinale1');
    if (retroEl) evalExistante.retroactionFinale = retroEl.value;
    // #961 — la marque voyage avec le texte, lue pour la copie de l'instantané ; question du stock
    // sans réponse (R2) : la clé reste absente.
    if (retroEl && typeof window.marqueRetroactionAEcrire === 'function') {
        const marque = window.marqueRetroactionAEcrire(ec);
        if (marque !== undefined) evalExistante.retroactionReecrite = marque;
    }
    // #882 (16 sept. 2026) — « Note chiffrée / Niveau de performance » et les cases d'affichage
    // suivent l'écran : seul « Enregistrer » les écrivait, et le PDF de l'élève relisait le choix
    // d'avant. Seulement si le panneau est là : absent, la lecture rendrait des cases décochées.
    if (document.querySelector('input[name="affichageNote1"]')) {
        evalExistante.optionsAffichage = _lireOptionsAffichageAutoSave();
    }
    evalExistante.dateModification = new Date().toISOString();
    // Ne PAS écraser donneesAlgorithmiques avec un objet vide. En JS `{}` est
    // truthy donc `ec.donneesAlgorithmiques || evalExistante.donneesAlgorithmiques`
    // retourne TOUJOURS le snapshot, même quand celui-ci a été pris dans la
    // fenêtre de race condition entre le reset partiel
    // (`demarrerEvaluationDepuisFichier` l.502 met `donneesAlgorithmiques = {}`)
    // et la restauration depuis la DB. Le test explicite préserve les valeurs
    // déjà persistées (nombre d'erreurs, nombre de mots, etc.).
    if (ec.donneesAlgorithmiques && Object.keys(ec.donneesAlgorithmiques).length > 0) {
        evalExistante.donneesAlgorithmiques = ec.donneesAlgorithmiques;
    }
    // Lot 2 — les points suivent, MÊME VIDÉS : un champ effacé retire son entrée, et la
    // base ne doit pas garder des points que l'écran n'a plus (la suspension de l'auto-save
    // au chargement couvre la fenêtre de course que la garde ci-dessus visait).
    if (ec.pointsAnalytiques && typeof ec.pointsAnalytiques === 'object') {
        evalExistante.pointsAnalytiques = ec.pointsAnalytiques;
    }
}

function _lireChampsDOMAutoSave() {
    return {
        echelleId: (document.getElementById('selectEchelle1') || {}).value || '',
        cartoucheId: (document.getElementById('selectCartoucheEval') || {}).value || '',
        statutRemise: (document.getElementById('remiseProduction1') || {}).value || '',
        statutIntegrite: (document.getElementById('statutIntegrite') || {}).value || 'recevable',
        notesIntegrite: (document.getElementById('notesIntegrite') || {}).value || '',
        noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,   // #572
        ponderationCouverte: (window.porteeCalculeeCourante && typeof window.porteeCalculeeCourante.ponderationCouverte === 'number') ? window.porteeCalculeeCourante.ponderationCouverte : null,   // #674 — la portée voyage avec la note
        niveauFinal: (document.getElementById('niveauProduction1') || {}).textContent || '',
        retroactionFinale: (document.getElementById('retroactionFinale1') || {}).value || ''
    };
}

function _lireOptionsAffichageAutoSave() {
    return {
        description: (document.getElementById('afficherDescription1') || {}).checked || false,
        objectif: (document.getElementById('afficherObjectif1') || {}).checked || false,
        tache: (document.getElementById('afficherTache1') || {}).checked || false,
        adresse: (document.getElementById('afficherAdresse1') || {}).checked || false,
        contexte: (document.getElementById('afficherContexte1') || {}).checked || false,
        affichageNote: (document.querySelector('input[name="affichageNote1"]:checked') || {}).value || 'complet'
    };
}

function _construireNouvelleEvaluationAutoSave(ec, grille, criteres) {
    var etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    var etudiant = etudiants.find(function(e) { return e.da === ec.etudiantDA; });
    var productions = obtenirDonneesSelonMode('productions');
    var production = productions.find(function(p) { return p.id === ec.productionId; });
    if (!etudiant || !production) return null;

    var coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    var groupeCoursActif = db.getSync('groupeCoursActif', null);
    var maintenant = new Date();
    var champsDOM = _lireChampsDOMAutoSave();

    return Object.assign({
        id: genererIdUnique('EVAL_'),
        etudiantDA: ec.etudiantDA,
        etudiantNom: etudiant.prenom + ' ' + etudiant.nom,
        groupe: etudiant.groupe || '',
        coursId: coursId,
        groupeCoursId: groupeCoursActif ? groupeCoursActif.id : null,
        productionId: ec.productionId,
        productionNom: production.titre || production.nom || '',
        grilleId: ec.grilleId,
        grilleNom: grille.nom || '',
        dateEvaluation: maintenant.toISOString(),
        heureEvaluation: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        criteres: criteres,
        optionsAffichage: _lireOptionsAffichageAutoSave(),
        donneesAlgorithmiques: ec.donneesAlgorithmiques || {},
        pointsAnalytiques: ec.pointsAnalytiques || {},   // lot 2
        retroactionReecrite: (typeof window.marqueRetroactionAEcrire === 'function') ? window.marqueRetroactionAEcrire(ec) === true : false,   // #961 — copie neuve : jamais « à demander »
        verrouillee: false
    }, champsDOM);
}

function _autoSauvegarderCriteres(snapshot) {
    window._timerAutoSave = null;
    var ec = snapshot || window.evaluationEnCours;
    if (!ec || !ec.etudiantDA || !ec.productionId || !ec.grilleId) return;

    // Au moins un critere doit etre renseigne
    // Lot C de l'enregistrement (D1) — ou l'intégrité signalée : « IA » posé avant tout niveau
    // se perdait au changement d'élève. Une EXISTANTE reçoit ses champs d'intégrité même sans
    // niveau dans l'instantané (plus bas) ; seuls les critères exigent des niveaux.
    const aDesNiveaux = Object.values(ec.criteres || {}).some(function(v) { return v; })
        || Object.keys(ec.pointsAnalytiques || {}).length > 0;   // lot 2 — des points seuls comptent
    const integrite = ec.integrite || _lireIntegriteEcran();
    const integriteSignalee = integrite.statutIntegrite !== 'recevable';

    // Collecter les criteres
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(function(g) { return g.id === ec.grilleId; });
    if (!grille || !grille.criteres) return;

    const criteres = _collecterCriteresAutoSave(grille, ec);

    // ACCÈS DIRECT — read-modify-write : doit lire TOUTES les évaluations du trimestre
    // pour ne pas perdre celles d'autres cours lors de la réécriture (idem lignes 2222, 5656+)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);

    // #360 — réconciliation des doublons NOTE-ÉGALE pour ce couple AVANT de
    // chercher l'active à mettre à jour, pour que `findIndex` pointe le survivant.
    // Persister si modifié : la branche verrouillée plus bas `return` AVANT le
    // `sauvegarderDonneesSelonMode` final → sans ça les marques seraient perdues.
    if (typeof window.ReconciliationEvaluations !== 'undefined') {
        const recon = window.ReconciliationEvaluations.reconcilierActivesNoteEgale(
            evaluations, ec.etudiantDA, ec.productionId
        );
        if (recon.modifie) {
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
        }
    }

    const idx = evaluations.findIndex(function(e) {
        return !e.remplaceeParId &&
            e.etudiantDA === ec.etudiantDA &&
            e.productionId === ec.productionId;
    });

    if (idx !== -1) {
        // GARDE (Phase 0 A25, juin 2026) : ne JAMAIS réécrire une évaluation
        // VERROUILLÉE par auto-save silencieux. Le verrouillage = lecture seule ;
        // toute modification passe par un déverrouillage explicite. Protège les
        // notes archivées d'un recalcul accidentel déclenché par une interaction
        // sur un formulaire mal désactivé (angle mort terminale #348 ; risque #350).
        if (evaluations[idx].verrouillee === true) return;
        _majIntegriteAutoSave(evaluations[idx], integrite);   // lot C
        // Sans niveau dans l'instantané, les critères ne sont pas réécrits : un instantané vide
        // effacerait ceux de la base (la garde d'origine de cette fonction).
        if (aDesNiveaux) _majEvaluationExistanteAutoSave(evaluations[idx], ec, criteres.concat(criteresHorsGrille(evaluations[idx], grille)));   // #652
    } else {
        if (!aDesNiveaux && !integriteSignalee) return;
        // #697 (A-1, audit du 5 sept. 2026) — ne rien CRÉER sans échelle résolue : `calculerNote`
        // n'a pas pu calculer, et la nouvelle évaluation porterait `0` sans portée (mesuré au
        // banc : A5). Une existante garde sa note (`_majEvaluationExistanteAutoSave`, `#572`).
        // #941 lot S1 — une grille entièrement en points se note sans échelle : `calculerNote` a
        // calculé, la création passe (même règle que la porte de l'enregistrement).
        const enPoints = typeof window.grilleEntierementEnPoints === 'function' && window.grilleEntierementEnPoints(grille);
        if (!enPoints && typeof window.resoudreEchelleEvaluation === 'function') {
            const echelleId = ec.echelleId || (document.getElementById('selectEchelle1') || {}).value || '';
            if (!window.resoudreEchelleEvaluation(echelleId)) return;
        }
        // Creer une nouvelle evaluation (brouillon non verrouille)
        const nouvelle = _construireNouvelleEvaluationAutoSave(ec, grille, criteres);
        if (!nouvelle) return;
        _majIntegriteAutoSave(nouvelle, integrite);   // lot C — l'instantané, pas l'écran
        if (typeof integrite.notesIntegrite !== 'string') nouvelle.notesIntegrite = '';   // masquées : rien
        evaluations.push(nouvelle);
        ec.idModification = nouvelle.id;
    }

    if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations) !== true) return;
    if (idx === -1) _signalerEvaluationCreeeAutoSave(ec);
}

/**
 * Lot C de l'enregistrement (D1) — L'INTÉGRITÉ S'ENREGISTRE TOUTE SEULE, comme les niveaux :
 * seul « Enregistrer » l'écrivait, et « IA » ou ses notes se perdaient au changement d'élève.
 * Lue à l'écran au moment du geste (les deux chargeurs la restaurent : #959,
 * `_chargerStatutsEtBadgesModif`) et portée par l'instantané. Notes masquées en anonymisation :
 * absentes, la base garde les siennes (lot A, R4). Le statut de remise n'y est pas : aucun geste
 * ne le change à l'écran (son menu est caché), seuls des chargeurs l'écrivent ; « Verrouiller
 * l'évaluation » l'écrit, comme « Enregistrer » avant.
 */
function _lireIntegriteEcran() {
    const statut = document.getElementById('statutIntegrite');
    const notes = document.getElementById('notesIntegrite');
    const lue = { statutIntegrite: (statut && statut.value) || 'recevable' };
    if (notes && !(typeof champMasqueAnonymisation === 'function' && champMasqueAnonymisation(notes))) {
        lue.notesIntegrite = notes.value || '';
    }
    return lue;
}

function _majIntegriteAutoSave(evaluation, integrite) {
    evaluation.statutIntegrite = integrite.statutIntegrite;
    if (typeof integrite.notesIntegrite === 'string') evaluation.notesIntegrite = integrite.notesIntegrite;
}

/**
 * Lot C — l'évaluation que l'enregistrement automatique vient de CRÉER est celle de l'écran :
 * son id passe au pivot (le cadenas, les jetons et « Verrouiller l'évaluation » la trouvent) et
 * le cadenas ouvert s'affiche. Seulement si l'écran montre encore cette copie : au changement
 * d'élève, l'écriture en attente part quand le menu porte déjà le suivant.
 */
function _signalerEvaluationCreeeAutoSave(ec) {
    if (!ec || !ec.idModification) return;
    const da = (document.getElementById('selectEtudiantEval') || {}).value || '';
    const prod = (document.getElementById('selectProduction1') || {}).value || '';
    if (da !== ec.etudiantDA || prod !== ec.productionId) return;
    if (window.evaluationEnCours) window.evaluationEnCours.idModification = ec.idModification;
    if (typeof window.afficherOuMasquerBoutonVerrouillage === 'function') window.afficherOuMasquerBoutonVerrouillage(true, false);
}

/**
 * Lot C — les notes d'intégrité, tapées au clavier, arment l'enregistrement automatique
 * (`data-on-input` du champ, index.html). Masquées en anonymisation : rien à écrire.
 */
function notesIntegriteModifiees(champ) {
    if (typeof champMasqueAnonymisation === 'function' && champMasqueAnonymisation(champ)) return;
    if (typeof evaluationEnCours !== 'undefined' && evaluationEnCours) evaluationEnCours.notesIntegrite = champ ? champ.value : '';
    _debouncerAutoSave();
}

// =====================================================================
// Exports window.X (12) — voir en-tête pour détails et bugs préservés
// =====================================================================

// Bloc principal d'origine (10) :
window.chargerListeEtudiantsEval = chargerListeEtudiantsEval;
window.chargerGroupesEval = chargerGroupesEval;
window.filtrerEtudiantsParGroupe = filtrerEtudiantsParGroupe;
window.chargerGrillesDansSelect = chargerGrillesDansSelect;
window.chargerEchellePerformance = chargerEchellePerformance;
window.grilleSelectionneeEnPoints = grilleSelectionneeEnPoints;   // #941 lot S1
window.chargerEvaluationsEtudiant = chargerEvaluationsEtudiant;
window.chargerProduction = chargerProduction;
window.chargerGrilleSelectionnee = chargerGrilleSelectionnee;

// Les trois pièces de l'écran d'évaluation — consommés par `evaluation.js`
// (reinitialiserEvaluation, reinitialiserFormulaire) et par la sentinelle qui
// compare le littéral au texte statique d'`index.html`.
window.MESSAGE_ATTENTE_CRITERES = MESSAGE_ATTENTE_CRITERES;
window.criteresHorsGrille = criteresHorsGrille;   // #652 — lue par evaluation.js (modification, ouverture)
window.ecrireAttenteCriteres = ecrireAttenteCriteres;
window.messageEchelleManquante = messageEchelleManquante;
window.libellePonderationEval = libellePonderationEval;   // 21 oct. 2026 — exposés pour les bancs
window.libelleNiveauEval = libelleNiveauEval;
window.cartoucheSelectionnee = cartoucheSelectionnee;
window.choisirCartoucheEval = choisirCartoucheEval;             // #944 — le geste au menu (index.html)
window.poserCartoucheParChargeur = poserCartoucheParChargeur;   // #944 — evaluation.js, travaux-ui.js
window._evaluationEnregistreeDeLaCopie = _evaluationEnregistreeDeLaCopie;   // #947 — la restauration de la visionneuse (travaux-ui.js)
window.niveauSelectionne = niveauSelectionne;
window.pointsSaisis = pointsSaisis;   // lot 2

// Export dispersé d'origine (L7026 résidu — mise à jour après dup/modif productions) :
window.chargerProductionsDansSelect = chargerProductionsDansSelect;

// Promotion §5.6 nouvelle (consommée L5521 résidu — patch call-site fait) :
window.afficherCriteresDepuisGrille = afficherCriteresDepuisGrille;

// Chantier F Cat-B (21 mai 2026) — API découplage travaux-ui ↔ evaluationEnCours.
// Seul appelant cross-module autorisé à écrire le pivot. Sentinelle Vitest associée.
window.demarrerEvaluationDepuisFichier = demarrerEvaluationDepuisFichier;

// Exposé pour la sentinelle auto-save ↔ verrouillage (Phase 0 A25, juin 2026) :
// vérifie que l'auto-save ne réécrit JAMAIS une évaluation verrouillée.
window._autoSauvegarderCriteres = _autoSauvegarderCriteres;
// #882 — les options d'affichage (evaluation.js) arment l'auto-save comme un critère : nom privé de cette IIFE.
window._debouncerAutoSave = _debouncerAutoSave;
// Lot C — travaux-annotation.js le lisait par son nom nu, privé à cette IIFE : `typeof` rendait
// toujours faux, et la fermeture de la copie comme le rechargement ne vidaient rien.
window._flusherAutoSave = _flusherAutoSave;
window.notesIntegriteModifiees = notesIntegriteModifiees;   // lot C — data-on-input (index.html)

// Exposé pour la sentinelle anti-re-pollution (Brique D hygiène, juin 2026) :
// la pré-sélection d'une nouvelle éval suit le modèle des évals existantes,
// pas un production.grilleId périmé qui ré-injecterait un modèle partagé.
window._modeleProductionPourEval = _modeleProductionPourEval;

// #564 — Consommé par `data-on-input` du textarea #retroactionFinale1
// (délégation main.js). SANS cet export, la saisie de rétroaction ne déclenche
// aucun auto-save et le texte est perdu au changement de fichier.
window.retroactionModifiee = retroactionModifiee;

})();
