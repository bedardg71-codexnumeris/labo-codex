/* ===============================
   MODULE EVALUATION-SAUVEGARDE — Sauvegarde + jetons + badges + statuts

   Extrait de js/evaluation.js (session B 3e sous-module refactor evaluation,
   2026-05-18 — beta 99.48). Zone Sauvegarde + jetons résidu L60-893,
   ~833 LOC. Risque ÉLEVÉ selon MODULES-MAP §2.1 (touche au pivot
   `window.evaluationEnCours`), MAIS audit pivot pré-extraction approfondi
   a conclu LOW :
     · 0 réassignation du pivot dans la zone (les 4 sites de réassignation
       sont dans `chargement.js:464` `chargerEvaluationsEtudiant`,
       `evaluation.js:976` `nouvelleEvaluation`, `evaluation.js:2951`
       `modifierEvaluation`, `travaux-ui.js:4639` cross-module). Aucune
       n'est dans la zone Sauvegarde extraite.
     · Toutes les mutations sont des `.<prop> = X` sur l'objet pivot
       existant. Atomicité préservée 1:1 post-extraction (même objet,
       mêmes patterns d'accès bare + window.).
     · 1 couple atomique `idModification = id; sauvegarderEvaluationModifiee()`
       préservé (sauvegarderEvaluationModifiee reste résidu — §5.6 patches
       à 2 sites internes).

   12 fonctions migrées :
     · sauvegarderEvaluation (cyc 70 MONSTRE — préservé tel quel,
       éclatement reporté étape 4 si N=50 acté avec Grégoire)
     · majBadgesApresEvaluation (PROMOTION §5.6 — appelée par sauvegarder
       Evaluation intra-zone, mais aussi par sauvegarderEvaluationModifiee
       du résidu)
     · mettreAJourPillStatut (déjà exporté)
     · changerStatutRemise (déjà exporté)
     · changerStatutIntegrite (déjà exporté)
     · afficherBadgesJetons (PROMOTION §5.6 — appelée par évalContext
       residue + 3 sites evaluation-jetons.js typeof-guarded)
     · afficherGestionJetons (PROMOTION §5.6 — appelée par évalContext
       residue 2 sites)
     · peuplementOptJetons (cyc 33 — déjà exporté)
     · gererChangementCheckboxJetonDelai (déjà exporté)
     · gererChangementCheckboxJetonReprise (déjà exporté)
     · retirerJetonDepuisSidebar (déjà exporté)

   11 exports window.X (8 préservés + 3 PROMOTIONS §5.6 nouvelles ; #563 a retiré
   gererChangementCheckboxJetonRepriseCiblee avec la case) :
     · window.sauvegarderEvaluation
     · window.majBadgesApresEvaluation (NOUVEAU — utilisé sauvegarder
       EvaluationModifiee résidu)
     · window.mettreAJourPillStatut
     · window.changerStatutRemise
     · window.changerStatutIntegrite
     · window.afficherBadgesJetons (NOUVEAU — utilisé 4 sites résidu +
       3 typeof-guarded evaluation-jetons.js)
     · window.afficherGestionJetons (NOUVEAU — utilisé 2 sites résidu)
     · window.peuplementOptJetons
     · window.gererChangementCheckboxJetonDelai
     · window.gererChangementCheckboxJetonReprise
     · window.retirerJetonDepuisSidebar

   Patches §5.6 appliqués DANS ce sous-module :
     · 2 sites `sauvegarderEvaluationModifiee()` → `window.sauvegarder
       EvaluationModifiee()` (L94 mode modification existante + L253
       garde-fou double-clic). sauvegarderEvaluationModifiee reste dans
       le résidu zone Modification — promotion `window.sauvegarder
       EvaluationModifiee = ...` ajoutée au résidu (cycle Cat-B en cours).
     · 1 site `initialiserListeEvaluations()` → bare reference préservée
       (déjà sur window via liste-evaluations.js:2787, bare ref walks
       scope chain → globalThis → trouve).

   Bug #109 FIXÉ (étape 4, 2026-05-18) :
     · `_timerAutoSave` et `_pendingAutoSaveSnapshot` promus `window.X` dans
       evaluation-chargement.js (L1086-1087). Tous les sites cross-IIFE
       (résidu evaluation.js × 3 + ce sous-module × 1) patchés §5.6 vers
       `window._timerAutoSave` / `window._pendingAutoSaveSnapshot`. Plus
       de ReferenceError au runtime — sauvegarde manuelle exerce le path
       sans crash.

   Helpers cross-module consommés (script-scope globaux, bare access OK
   via window.X fallthrough) :
     · evaluationEnCours (let global config.js L145)
     · db.getSync, db.setSync (db.js global)
     · echapperHtml, cle (config.js global)
     · obtenirDonneesSelonMode, sauvegarderDonneesSelonMode (donnees-v2.js)
     · obtenirPreference, obtenirCoursActifId (preferences/main.js)
     · genererIdUnique (main.js)
     · obtenirConfigJetons, obtenirTousTypesJetons, obtenirStatutJetons
       Etudiant (evaluation-jetons.js)
     · verifierDisponibiliteJeton, compterJetonsUtilises (evaluation-
       jetons.js, déjà window.X)
     · appliquerJetonDelai, appliquerJetonReprise, appliquerJetonReprise
       Ciblee (evaluation-jetons.js, déjà window.X)
     · retirerJetonReprise, retirerJetonDelai (evaluation-jetons.js)
     · calculerEtStockerIndicesCP (portfolio.js, déjà window.X)
     · initialiserListeEvaluations (liste-evaluations.js, déjà window.X)
     · Journal.capturerFinEvaluation (journal.js namespace)
     · travauxUI, travauxVisionneuse, travauxStockage (travaux-*.js
       namespaces)
     · actionsRLO.agregerActionsRLO (actions-rlo.js namespace)
     · BibliothequeUI.verifierReferencesPasDemo (bibliotheque-ui.js)
     · cartoucheSelectionnee (chargement.js, déjà window.X session A)
     · window.calculerNote (calcul.js session B 1er sous-module, déjà
       patché §5.6 dans le code extrait)

   Chargé ENTRE evaluation-retroaction.js et evaluation.js dans
   index.html (4e position dans la séquence d'évaluation, juste avant
   le résidu). Les exports window.X sont consommés :
     · ~13 sites résidu pour les 12 fonctions extraites (patches §5.6
       appliqués dans evaluation.js)
     · 1 site evaluation-chargement.js (mettreAJourPillStatut L494 —
       patch §5.6 nouveau, parallèle au pattern obtenirCouleurNiveau
       session B 1er sous-module)
     · 3 sites evaluation-jetons.js (afficherBadgesJetons typeof-guarded,
       devient maintenant fonctionnel — réveil de dead-code par effet
       de bord de la promotion §5.6). Documenté en commit comme side
       effect bénin.
     · 8 sites travaux-ui.js (typeof-guarded bare refs — continuent
       de fonctionner via window fallthrough après promotion §5.6).
   =============================== */

(function() {
'use strict';

/**
 * Sauvegarde l'évaluation complète dans localStorage
 *
 * FONCTIONNEMENT:
 * 1. Valide les champs obligatoires
 * 2. Crée l'objet évaluation complet
 * 3. Sauvegarde dans localStorage
 * 4. Affiche notification de succès
 *
 * STRUCTURE DONNÉES:
 * Evaluation = {
 *   id, etudiantDA, etudiantNom, groupe,
 *   productionId, productionNom,
 *   grilleId, grilleNom,
 *   echelleId, cartoucheId,
 *   dateEvaluation, statutRemise,
 *   criteres: [{critereId, critereNom, niveauSelectionne, retroaction, ponderation}],
 *   noteFinale, niveauFinal,
 *   retroactionFinale,
 *   optionsAffichage: {description, objectif, tache, adresse, contexte}
 * }
 */
// Helpers privés _Sauv* pour sauvegarderEvaluation (extraction étape 4 — éclatement cyc 70 → cyc ≤ 30)

function _lireEntreesFormulaireSauv() {
    const ec = window.evaluationEnCours;
    return {
        etudiantDA: document.getElementById('selectEtudiantEval').value || (ec && ec.etudiantDA) || '',
        productionId: document.getElementById('selectProduction1').value || (ec && ec.productionId) || '',
        grilleId: document.getElementById('selectGrille1').value || (ec && ec.grilleId) || ''
    };
}

function _validerReferencesSauv(etudiant, production, grille, etudiantDA, productionId, grilleId) {
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

function _validerReferencesNonDemoSauv(productionId, grilleId) {
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

/**
 * #674 — LA PORTE DE L'ENREGISTREMENT : une note qui ne porte pas sur toute la grille
 * ne s'enregistre pas. Même patron que `_validerReferencesSauv` (dit pourquoi, rend
 * `false`, l'appelant sort). La règle et le message vivent dans `evaluation-calcul.js`
 * (`verifierPorteeAvantSauvegarde`), à côté du calcul dont ils sont la portée.
 * ⚠ Jamais appelée par l'auto-save : pendant la saisie, l'évaluation est incomplète
 * par nature, et elle continue de s'écrire — avec sa portée.
 */
function _validerPorteeSauv() {
    if (typeof window.verifierPorteeAvantSauvegarde !== 'function') return true;
    return window.verifierPorteeAvantSauvegarde();
}

function _collecterCriteresSauv(grille) {
    const criteres = [];
    if (!grille || !grille.criteres) return criteres;
    grille.criteres.forEach(critere => {
        const niveau = evaluationEnCours.criteres[critere.id];
        // #941 lot S1 — sans échelle, un critère analytique n'a pas de niveau déduit : ses
        // points suffisent à le faire entrer (`niveauSelectionne` vide).
        const ptsSaisis = (evaluationEnCours.pointsAnalytiques || {})[critere.id];
        const aDesPoints = critere.type === 'analytique' && typeof ptsSaisis === 'number' && !isNaN(ptsSaisis);
        if (niveau || aDesPoints) {
            const commDiv = document.getElementById(`comm_${critere.id}`);
            const entree = {
                critereId: critere.id,
                critereNom: critere.nom,
                niveauSelectionne: niveau || '',
                retroaction: commDiv ? commDiv.textContent : '',
                ponderation: critere.ponderation || 0
            };
            // Lot 3 (4 sept. 2026) — un critère analytique entre avec ses POINTS et son
            // niveau DÉDUIT (`niveauSelectionne`, posé par `calculerNote`) : les seize
            // lecteurs de `criteres[]` voient le niveau, et le PDF de l'élève imprime
            // « points / pondération ». La source des points reste `pointsAnalytiques`.
            const pts = (evaluationEnCours.pointsAnalytiques || {})[critere.id];
            if (critere.type === 'analytique' && typeof pts === 'number' && !isNaN(pts)) entree.points = pts;
            criteres.push(entree);
        }
    });
    return criteres;
}

function _lireChampsDOMSauv() {
    return {
        echelleId: document.getElementById('selectEchelle1').value,
        cartoucheId: document.getElementById('selectCartoucheEval').value,
        statutRemise: document.getElementById('remiseProduction1').value,
        statutIntegrite: document.getElementById('statutIntegrite').value || 'recevable',
        notesIntegrite: document.getElementById('notesIntegrite').value || '',
        noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,   // #572 — la valeur calculée, pas l'écran
        ponderationCouverte: (window.porteeCalculeeCourante && typeof window.porteeCalculeeCourante.ponderationCouverte === 'number') ? window.porteeCalculeeCourante.ponderationCouverte : null,   // #674 — la portée voyage avec la note
        niveauFinal: document.getElementById('niveauProduction1').textContent,
        retroactionFinale: document.getElementById('retroactionFinale1').value,
        retroactionReecrite: (typeof window.marqueRetroactionAEcrire === 'function') ? window.marqueRetroactionAEcrire() === true : false   // #961 — copie neuve : jamais « à demander »
    };
}

function _lireOptionsAffichageSauv() {
    return {
        description: document.getElementById('afficherDescription1').checked,
        objectif: document.getElementById('afficherObjectif1').checked,
        tache: document.getElementById('afficherTache1').checked,
        adresse: document.getElementById('afficherAdresse1').checked,
        contexte: document.getElementById('afficherContexte1').checked,
        affichageNote: document.querySelector('input[name="affichageNote1"]:checked')?.value || 'complet'
    };
}

function _construireObjetEvaluationSauv(ctx) {
    const { etudiant, production, grille, etudiantDA, productionId, grilleId, criteres, coursId, groupeCoursActif, maintenant } = ctx;
    return Object.assign({
        id: genererIdUnique('EVAL_'),
        etudiantDA: etudiantDA,
        etudiantNom: etudiant ? `${etudiant.prenom} ${etudiant.nom}` : '',
        groupe: etudiant ? etudiant.groupe : '',
        coursId: coursId,
        groupeCoursId: groupeCoursActif?.id || null,
        productionId: productionId,
        productionNom: production ? (production.titre || production.nom) : '',
        grilleId: grilleId,
        grilleNom: grille ? grille.nom : '',
        dateEvaluation: maintenant.toISOString(),
        heureEvaluation: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
        criteres: criteres,
        optionsAffichage: _lireOptionsAffichageSauv(),
        donneesAlgorithmiques: evaluationEnCours.donneesAlgorithmiques || {},
        pointsAnalytiques: evaluationEnCours.pointsAnalytiques || {},   // lot 2 — les points, sous leur nom
        verrouillee: true
    }, _lireChampsDOMSauv());
}

function _appliquerProfilACOSauv(evaluation) {
    // Profil ACO — uniquement si l'observation des actions est activée.
    // null explicite quand toggle activé mais pas d'annotation : distingue « pas de données »
    // de « zéro geste observé » (objet aux compteurs à zéro).
    if (typeof obtenirPreference === 'function' && obtenirPreference('activerActionsRLO') === true) {
        evaluation.actionsRLO = (typeof actionsRLO !== 'undefined' && actionsRLO.agregerActionsRLO)
            ? actionsRLO.agregerActionsRLO(evaluation)
            : null;
    }
}

function _appliquerJetonDelaiSiCocheSauv(evaluation, etudiantDA, maintenant) {
    const checkboxDelai = document.getElementById('checkboxJetonDelai');
    if (!checkboxDelai || !checkboxDelai.checked) return;
    if (typeof verifierDisponibiliteJeton === 'function' && verifierDisponibiliteJeton(etudiantDA, 'delai')) {
        const config = obtenirConfigJetons();
        evaluation.jetonDelaiApplique = true;
        evaluation.dateApplicationJetonDelai = maintenant.toISOString();
        evaluation.delaiAccorde = true;
        evaluation.dureeDelaiJours = config.delai.dureeJours;
    } else {
        checkboxDelai.checked = false;
        const config = obtenirConfigJetons();
        const utilises = compterJetonsUtilises(etudiantDA, 'delai');
        notifications.erreur(
            'Jetons épuisés',
            `Plus de jetons de délai disponibles (${utilises}/${config.delai.nombre} utilisés)`
        );
    }
}

function _basculerEnModificationActiveSauv(existanteActive) {
    console.warn(`[Évaluation] Évaluation active existante détectée (${existanteActive.id}) — bascule en modification`);
    // Sans copie ouverte depuis le chargement de la page, seul le `let evaluationEnCours` de
    // config.js est posé (`chargerEvaluationsEtudiant`) : `window.evaluationEnCours` reste
    // undefined. L'id n'était alors posé nulle part, `sauvegarderEvaluationModifiee` renvoyait
    // à `sauvegarderEvaluation`, qui revenait ici : pile débordée, rien d'écrit, aucun message
    // (#919, rapport du 18 sept. 2026 : trois enregistrements perdus en A24). Le pivot est donc
    // garanti AVANT le renvoi, et PRÊTÉ le temps de l'enregistrement seulement : laissé en
    // place, il garderait l'élève de cet instant, et la garde de `verifierEtChargerEvaluationExistante`
    // (même élève, même production, id posé) sauterait le rechargement au retour sur cet élève.
    const pivotPrete = !window.evaluationEnCours;
    if (pivotPrete) window.evaluationEnCours = { idModification: existanteActive.id };
    else window.evaluationEnCours.idModification = existanteActive.id;
    try {
        // Patch §5.6 — promotion sauvegarderEvaluationModifiee vers résidu evaluation.js
        window.sauvegarderEvaluationModifiee();
    } finally {
        if (pivotPrete) window.evaluationEnCours = undefined;
    }
}

function _gererErreurPersistanceSauv(resultatSauvegarde) {
    if (resultatSauvegarde === 'quota') {
        notifications.erreur(
            'Espace de stockage insuffisant',
            'Le quota de stockage du navigateur est dépassé. Exporte tes données (Réglages → Données) puis supprime des évaluations anciennes.'
        );
    } else {
        notifications.erreur(
            'Erreur de sauvegarde',
            'Une erreur inattendue s\'est produite. Consulte la console pour plus de détails.'
        );
    }
}

function _synchroniserGroupeCoursFichierSauv(groupeCoursActif) {
    // 🔧 FIX (5 mars 2026) : Synchroniser UNIQUEMENT le groupeCoursId du fichier.
    // NE PAS écraser productionId ni etudiantDA — cela corrompait les métadonnées
    // quand le formulaire affichait une production différente du fichier ouvert.
    const fichierActuel = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (!fichierActuel || typeof travauxStockage === 'undefined' || !travauxStockage.mettreAJourFichier) return;
    const modifications = {};
    if (groupeCoursActif?.id && fichierActuel.groupeCoursId !== groupeCoursActif.id) {
        modifications.groupeCoursId = groupeCoursActif.id;
        fichierActuel.groupeCoursId = groupeCoursActif.id;
    }
    if (Object.keys(modifications).length > 0) {
        travauxStockage.mettreAJourFichier(fichierActuel.id, modifications);
    }
}

function _postSauvegardeSauv(evaluation, groupeCoursActif) {
    // Tier 6.3 : Invalider les caches de moyennes
    window._moyennesQualifies = null;
    window._moyennesToutes = null;

    notifications.succes(`Évaluation sauvegardée : ${evaluation.etudiantNom} - ${evaluation.productionNom}`);

    if (typeof travauxUI !== 'undefined' && travauxUI.arreterChrono) {
        travauxUI.arreterChrono();
    }

    // Basculer en mode modification pour qu'un 2e clic ne crée pas de doublon
    if (window.evaluationEnCours) {
        window.evaluationEnCours.idModification = evaluation.id;
    }

    // L'évaluation est enregistrée ET verrouillée (verrouillee:true). Refléter
    // l'état verrouillé comme le chemin modification : cadenas FERMÉ visible +
    // formulaire en lecture seule. Sans ça, après une PREMIÈRE sauvegarde le
    // cadenas restait masqué (display:none) — impossible de (dé)verrouiller.
    if (window.evaluationEnCours) window.evaluationEnCours.verrouillee = !!evaluation.verrouillee;
    if (typeof window.afficherOuMasquerBoutonVerrouillage === 'function') {
        window.afficherOuMasquerBoutonVerrouillage(true, !!evaluation.verrouillee);
    }
    if (evaluation.verrouillee && typeof window.desactiverFormulaireEvaluation === 'function') {
        window.desactiverFormulaireEvaluation(true);
    }

    _synchroniserGroupeCoursFichierSauv(groupeCoursActif);
    majBadgesApresEvaluation(evaluation);

    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
    if (typeof initialiserListeEvaluations === 'function') {
        setTimeout(() => initialiserListeEvaluations(), 150);
    }
}

function sauvegarderEvaluation() {
    // Annuler le debounce auto-save (la sauvegarde manuelle prend le relais) — Patch §5.6 fix #109 (étape 4)
    if (window._timerAutoSave) { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; }
    window._pendingAutoSaveSnapshot = null;

    // 🔄 Détecter si on est en mode modification d'une évaluation existante
    if (window.evaluationEnCours?.idModification) {
        // Patch §5.6 — promotion sauvegarderEvaluationModifiee vers résidu evaluation.js (session B 3e sous-module)
        window.sauvegarderEvaluationModifiee();
        return;
    }

    const { etudiantDA, productionId, grilleId } = _lireEntreesFormulaireSauv();
    if (!etudiantDA || !productionId || !grilleId) {
        alert('Sélectionne un·e étudiant·e, une production et une grille avant d\'enregistrer.');
        return;
    }

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === etudiantDA);
    const productions = obtenirDonneesSelonMode('productions');
    const production = productions.find(p => p.id === productionId);
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!_validerReferencesSauv(etudiant, production, grille, etudiantDA, productionId, grilleId)) return;
    if (!_validerReferencesNonDemoSauv(productionId, grilleId)) return;

    // Fix #110 v3 (restauré 24 mai 2026) : forcer recalcul algo depuis le DOM
    // avant collecte, sinon donneesAlgorithmiques peut être stale.
    if (typeof window._forcerRecalculAlgorithmiqueAvantSauvegarde === 'function') {
        window._forcerRecalculAlgorithmiqueAvantSauvegarde(grille);
    }

    // #674 — après le recalcul algorithmique, avant toute collecte : la portée jugée
    // est celle de la note qui serait écrite.
    if (!_validerPorteeSauv()) return;

    const criteres = _collecterCriteresSauv(grille);
    const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;
    const groupeCoursActif = db.getSync('groupeCoursActif', null);
    const maintenant = new Date();

    const evaluation = _construireObjetEvaluationSauv({
        etudiant, production, grille,
        etudiantDA, productionId, grilleId,
        criteres, coursId, groupeCoursActif, maintenant
    });

    _appliquerProfilACOSauv(evaluation);
    _appliquerJetonDelaiSiCocheSauv(evaluation, etudiantDA, maintenant);

    // Garde-fou : si une évaluation active existe déjà pour ce couple étudiant+production,
    // basculer en modification plutôt que d'en créer une deuxième (double-clic, etc.)
    let evaluations = db.getSync(cle('evaluationsSauvegardees'), []);

    // #360 — réconciliation des doublons NOTE-ÉGALE déjà présents pour ce couple
    // (re-clic ou non-persistance d'un reload antérieur). On marque les
    // surnuméraires AVANT la garde double-clic, pour que `existanteActive` voie
    // l'état nettoyé et pointe le survivant. PERSISTER si modifié : la bascule en
    // modification (`sauvegarderEvaluationModifiee`) RE-LIT le disque et jetterait
    // sinon le tableau muté — le chemin de naissance le plus courant ne taris rien.
    if (typeof window.ReconciliationEvaluations !== 'undefined') {
        const recon = window.ReconciliationEvaluations.reconcilierActivesNoteEgale(
            evaluations, etudiantDA, productionId
        );
        if (recon.modifie) {
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
        }
    }

    const existanteActive = evaluations.find(e =>
        !e.remplaceeParId && e.etudiantDA === etudiantDA && e.productionId === productionId
    );
    if (existanteActive) {
        _basculerEnModificationActiveSauv(existanteActive);
        return;
    }

    // Persister la durée d'évaluation + journal
    const dureeMs = (typeof travauxUI !== 'undefined' && travauxUI.getDureeMs)
        ? travauxUI.getDureeMs() : null;
    if (dureeMs) evaluation.dureeEvaluation = Math.round(dureeMs / 1000);
    if (typeof Journal !== 'undefined') {
        Journal.capturerFinEvaluation(evaluation, dureeMs);
    }

    evaluations.push(evaluation);
    const resultatSauvegarde = sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);
    if (resultatSauvegarde !== true) {
        _gererErreurPersistanceSauv(resultatSauvegarde);
        return;
    }

    _postSauvegardeSauv(evaluation, groupeCoursActif);
}

/**
 * Met à jour les badges (pills) du fichier actif après sauvegarde d'évaluation.
 * Passe la pill à "ÉVALUÉ" (vert) UNIQUEMENT si l'évaluation contient au moins
 * un critère noté. Une sauvegarde sans critère (ex. application d'un jeton de
 * délai uniquement) ne doit pas marquer le fichier comme évalué.
 *
 * @param {Object} [evaluation] - L'évaluation qui vient d'être sauvegardée.
 *   Si omis, on laisse la pill telle quelle.
 */
function majBadgesApresEvaluation(evaluation) {
    const fichier = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getFichierActuel)
        ? travauxVisionneuse.getFichierActuel() : null;
    if (!fichier) return;

    const evaluationNotee = evaluation
        && Array.isArray(evaluation.criteres)
        && evaluation.criteres.length > 0;
    if (!evaluationNotee) return;

    document.querySelectorAll(`.annot-badge[data-fichier-id="${fichier.id}"]`).forEach(badge => {
        const pill = badge.querySelector('.travaux-badge-pill');
        if (!pill) return;
        pill.textContent = 'ÉVALUÉ';
        pill.className = 'travaux-badge-pill evalue';
        // Mettre à jour l'état d'origine stocké (pour la restauration lors du changement de fichier)
        if (pill.dataset.origTexte !== undefined) {
            pill.dataset.origTexte = 'ÉVALUÉ';
            pill.dataset.origClasse = 'evalue';
        }
    });
}

/* ===============================
   🔄 AUTRES FONCTIONS
   =============================== */

/**
 * Met à jour la pill de statut dans la palette Paramètres
 */
function mettreAJourPillStatut(valeur) {
    const pill = document.getElementById('travaux-eval-statut-pill');
    if (!pill) return;
    const map = {
        'non-recu': { texte: 'Non reçu',  classe: '' },
        'recu':     { texte: 'Reçu',      classe: 'en-cours' },
        'importe':  { texte: 'Importé',    classe: 'en-cours' },
        'annote':   { texte: 'Annoté',     classe: 'en-cours' },
        'evalue':   { texte: 'Évalué',     classe: 'evalue' }
    };
    const info = map[valeur] || map['importe'];
    pill.textContent = info.texte;
    pill.className = 'travaux-badge-pill' + (info.classe ? ' ' + info.classe : '');
}

/**
 * Change le statut de remise
 */
function changerStatutRemise(num) {
    const statut = document.getElementById('remiseProduction1').value;

    if (evaluationEnCours) {
        evaluationEnCours.statutRemise = statut;
    }

    mettreAJourPillStatut(statut);

    // Si non reçu, masquer les critères
    if (statut === 'non-recu') {
        document.getElementById('listeCriteresGrille1').innerHTML =
            '<p class="eval-texte-italic-gris">Le travail doit être reçu avant évaluation</p>';
    } else if (evaluationEnCours?.cartoucheId) {
        cartoucheSelectionnee();
    }
}

/**
 * Gère le changement de statut d'intégrité académique
 */
function changerStatutIntegrite() {
    const statut = document.getElementById('statutIntegrite').value;
    const divNotes = document.getElementById('divNotesIntegrite');
    const notes = document.getElementById('notesIntegrite');

    // Sauvegarder dans evaluationEnCours
    if (evaluationEnCours) {
        evaluationEnCours.statutIntegrite = statut;
        const masque = typeof champMasqueAnonymisation === 'function' && champMasqueAnonymisation(notes);   // Lot A, R4
        if (!masque) evaluationEnCours.notesIntegrite = notes.value;
    }

    // Afficher le champ de notes seulement si ce n'est pas "recevable"
    if (statut !== 'recevable') {
        divNotes.classList.remove('u-hide');
        // Lot A, R4 : en anonymisation, le champ se montre masqué (texte libre).
        if (typeof estModeAnonymisation === 'function' && estModeAnonymisation()
            && typeof poserChampTexteLibre === 'function') poserChampTexteLibre(notes, '');
    } else {
        divNotes.classList.add('u-hide');
        notes.value = ''; // Vider les notes si on repasse à recevable
        if (evaluationEnCours) {
            delete evaluationEnCours.notesIntegrite;
        }
    }

    // Si non recevable (plagiat ou IA), mettre tous les critères à 0 et désactiver
    const estNonRecevable = (statut === 'plagiat' || statut === 'ia');

    if (estNonRecevable) {
        // Récupérer tous les selects de critères
        const listeCriteres = document.getElementById('listeCriteresGrille1');
        const selectsCriteres = listeCriteres ? listeCriteres.querySelectorAll('select[id^="critere"]') : [];

        selectsCriteres.forEach(select => {
            select.value = '0'; // Mettre à "0 - Aucun"
            select.disabled = true; // Désactiver
            select.style.opacity = '0.5';
        });

        // Afficher un message d'avertissement
        const messageExistant = document.getElementById('message-non-recevable');
        if (!messageExistant && listeCriteres) {
            const message = document.createElement('div');
            message.id = 'message-non-recevable';
            message.className = 'alerte alerte-info';
            message.style.marginBottom = '15px';
            message.innerHTML = `
                <strong>Travail non recevable</strong><br>
                Les critères sont automatiquement à 0. Cette évaluation sera exclue des calculs de moyenne.
                ${statut === 'plagiat' ? 'Un jeton de reprise peut être appliqué pour permettre une nouvelle remise.' : ''}
            `;
            listeCriteres.insertBefore(message, listeCriteres.firstChild);
        }

        // Recalculer la note (qui sera 0)
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B 1er sous-module)
        window.calculerNote();
    } else {
        // Réactiver les selects de critères
        const listeCriteres = document.getElementById('listeCriteresGrille1');
        const selectsCriteres = listeCriteres ? listeCriteres.querySelectorAll('select[id^="critere"]') : [];

        selectsCriteres.forEach(select => {
            select.disabled = false;
            select.style.opacity = '1';
        });

        // Retirer le message d'avertissement si présent
        const message = document.getElementById('message-non-recevable');
        if (message) {
            message.remove();
        }

        // Recalculer la note avec les valeurs actuelles
        // Patch §5.6 — promotion calculerNote vers evaluation-calcul.js (session B 1er sous-module)
        window.calculerNote();
    }
}

// Fonction gererDelaiAccorde() supprimée - remplacée par appliquerJetonDelaiDepuisSidebar()

/**
 * Affiche les badges des jetons appliqués sur l'évaluation courante
 */
function afficherBadgesJetons() {
    const section = document.getElementById('gestionJetonsEvaluation');
    const conteneur = document.getElementById('infoJetonsAppliques');

    if (!section || !conteneur || !window.evaluationEnCours?.idModification) {
        if (section) section.classList.add('u-hide');
        return;
    }

    // CORRECTION: Utiliser obtenirDonneesSelonMode au lieu de localStorage direct
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const evaluation = evaluations.find(e => e.id === window.evaluationEnCours.idModification);

    if (evaluation) {
    }

    if (!evaluation) {
        section.classList.add('u-hide');
        return;
    }

    let badges = [];

    // Badge pour jeton de reprise (violet)
    // CORRECTION: Vérifier aussi si l'ID commence par EVAL_REPRISE_ (même logique que le tableau)
    const estNouvelleReprise = evaluation.jetonRepriseApplique || evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_');
    if (estNouvelleReprise) {
        badges.push(`
            <span class="statut-badge" style="background: var(--violet-jeton, #9c27b0); color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px;">
                <span>⭐ Reprise</span>
                <button class="btn-jeton-retirer" data-action="retirerJetonDepuisSidebar" data-param="${evaluation.id}" data-param2="reprise"
                        title="Retirer le jeton de reprise"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
            </span>
        `);
    }

    // Badge pour jeton de délai (orange)
    const aDejaJetonDelai = evaluation.jetonDelaiApplique || evaluation.delaiAccorde;
    if (aDejaJetonDelai) {
        badges.push(`
            <span class="statut-badge" style="background: var(--orange-accent); color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px;">
                <span>⭐ Délai</span>
                <button class="btn-jeton-retirer" data-action="retirerJetonDepuisSidebar" data-param="${evaluation.id}" data-param2="delai"
                        title="Retirer le jeton de délai"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
            </span>
        `);
    }

    // Afficher ou masquer la section selon qu'il y a des badges
    if (badges.length > 0) {
        conteneur.innerHTML = badges.join('');
        section.classList.remove('u-hide');
    } else {
        section.classList.add('u-hide');
    }
}

/**
 * Affiche ou masque la section de gestion des jetons
 * @param {boolean} afficher - true pour afficher, false pour masquer
 */
function afficherGestionJetons(afficher) {
    const sectionBadges = document.getElementById('gestionJetonsEvaluation');
    const sectionOptions = document.getElementById('optionsJetons');

    if (afficher) {
        // Masquer la section des badges inline (on utilise les checkboxes)
        if (sectionBadges) sectionBadges.classList.add('u-hide');

        // Peupler dynamiquement les jetons selon la config
        peuplementOptJetons();

        // Afficher la section
        if (sectionOptions) sectionOptions.classList.remove('u-hide');
    } else {
        // MODE MASQUÉ : Tout masquer
        if (sectionBadges) sectionBadges.classList.add('u-hide');
        if (sectionOptions) sectionOptions.classList.add('u-hide');
    }
}

/**
 * Peuple dynamiquement le conteneur de jetons dans le formulaire d'évaluation.
 * Source unique de vérité : obtenirTousTypesJetons() (basé sur la pratique de notation).
 * Utilisé en mode standalone ET en mode visionneuse (plus de doublon).
 */
function _collecterJetonsUtilisesParType(da) {
    var jetonsParType = { delai: [], reprise: [], repriseCiblee: [] };
    if (!da) return { jetonsParType, totalUtilises: 0, totalMax: 0 };
    var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees');
    var productions = typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('productions') || [] : [];
    toutesEvals.filter(function(e) {
        return e.etudiantDA === da && !e.remplaceeParId;
    }).forEach(function(e) {
        var prod = productions.find(function(p) { return p.id === e.productionId; });
        var nomProd = prod ? (prod.titre || prod.nom || e.productionId) : e.productionId;
        if (e.jetonDelaiApplique) jetonsParType.delai.push(echapperHtml(nomProd));
        if (e.jetonRepriseApplique || e.repriseDeId) jetonsParType.reprise.push(echapperHtml(nomProd));
        if (e.jetonRepriseCibleeApplique) jetonsParType.repriseCiblee.push(echapperHtml(nomProd));
    });
    var totalUtilises = jetonsParType.delai.length + jetonsParType.reprise.length + jetonsParType.repriseCiblee.length;
    // #328 L2-c : nombreParEleve dérive de la pratique active (plus du miroir configPAN.jetons) ;
    // repli historique configurationJetons (config v2, non-miroir) puis défaut.
    var configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
    var modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
    var totalMax = (configJetons && configJetons.nombreParEleve)
        || (modalites.configurationJetons && modalites.configurationJetons.nombreParEleve)
        || 2;
    return { jetonsParType, totalUtilises, totalMax };
}

function _construireMapPredefinis(evalCourante) {
    return {
        'delai': {
            checkboxId: 'checkboxJetonDelai',
            handler: 'gererChangementCheckboxJetonDelai',
            wrapperClass: 'badge-jeton-delai-wrapper',
            tooltip: 'eval-jeton-delai',
            estCoche: function() {
                return evalCourante ? !!(evalCourante.jetonDelaiApplique || evalCourante.delaiAccorde) : false;
            }
        },
        'reprise': {
            checkboxId: 'checkboxJetonReprise',
            handler: 'gererChangementCheckboxJetonReprise',
            wrapperClass: 'badge-jeton-reprise-wrapper',
            tooltip: 'eval-jeton-reprise',
            estCoche: function() {
                return evalCourante ? !!(evalCourante.jetonRepriseApplique || evalCourante.repriseDeId || (evalCourante.id && evalCourante.id.startsWith('EVAL_REPRISE_'))) : false;
            }
        },
        // #563 (29 août 2026, option C de Grégoire) — la case « Reprise ciblée »
        // est RETIRÉE. Décocher ne retirait rien (le retrait n'existe pas : défaire
        // une reprise ciblée = supprimer l'évaluation qu'elle a créée), et cette
        // case était le SEUL chemin qui appliquait ce jeton. « Retirons la case et
        // voyons à l'usage ce qu'en feront les utilisateurs. » Les reprises ciblées
        // déjà faites restent visibles là où elles s'affichent (liste, bilan).
    };
}

function _renderHtmlJetonPredefini(type, mp, artefacts, tokenImg) {
    var coche = mp.estCoche() ? ' checked' : '';
    var ligne =
        '<div>' +
            '<div class="u-flex-gap-8 u-align-center">' +
                '<input type="checkbox" id="' + mp.checkboxId + '" data-on-change="' + mp.handler + '"' + coche + '>' +
                '<span class="' + mp.wrapperClass + '">' +
                    // #240 : cliquer le mot du jeton active le tampon texte (apposé sur le
                    // travail annoté, il coche cette checkbox). role/tabindex = activable au clavier.
                    '<span class="badge-jeton-titre badge-jeton-titre--tampon" data-tooltip="' + mp.tooltip + '" data-action="travauxOutils.activerTamponJeton" data-param="' + type.id + '" role="button" tabindex="0" title="Cliquer pour apposer le tampon « ' + echapperHtml(type.nom) + ' » sur le travail">' + echapperHtml(type.nom.replace(/^Jeton de /i, '').replace(/^./, function(c) { return c.toUpperCase(); })) + '</span>' +
                '</span>' +
                tokenImg +
            '</div>';
    if (artefacts.length > 0) {
        ligne += '<div class="eval-aide" style="margin-left: 26px;">';
        artefacts.forEach(function(nom) { ligne += '<div>• ' + nom + '</div>'; });
        ligne += '</div>';
    }
    return ligne + '</div>';
}

function _renderHtmlJetonPerso(type, tokenImg) {
    return '<div style="display: flex; align-items: flex-start; gap: 10px;">' +
                '<input type="checkbox" id="checkboxJetonPerso_' + type.id + '" class="u-mt-6">' +
                '<div class="u-flex-1">' +
                    '<span class="badge-jeton-personnalise-wrapper">' +
                        '<span class="badge-jeton-titre">' + echapperHtml(type.nom) + '</span>' +
                    '</span>' +
                    (type.description ? '<p class="text-085-muted-m5-0-0-0 u-texte-075">' + echapperHtml(type.description) + '</p>' : '') +
                '</div>' +
                tokenImg +
            '</div>';
}

function peuplementOptJetons() {
    var conteneur = document.getElementById('optionsJetonsContenu');
    if (!conteneur) return;

    var config = typeof obtenirConfigJetons === 'function' ? obtenirConfigJetons() : null;
    if (!config || !config.actif) {
        conteneur.innerHTML = '<p class="eval-vide">Système de jetons désactivé</p>';
        return;
    }

    var types = typeof obtenirTousTypesJetons === 'function' ? obtenirTousTypesJetons() : [];
    if (types.length === 0) {
        conteneur.innerHTML = '<p class="eval-vide">Aucun type de jeton configuré</p>';
        return;
    }

    var evalId = window.evaluationEnCours ? window.evaluationEnCours.idModification : null;
    var evaluations = typeof obtenirDonneesSelonMode === 'function'
        ? obtenirDonneesSelonMode('evaluationsSauvegardees') || [] : [];
    var evalCourante = evalId ? evaluations.find(function(e) { return e.id === evalId; }) : null;
    var da = window.evaluationEnCours ? window.evaluationEnCours.etudiantDA : null;
    var statut = (da && typeof obtenirStatutJetonsEtudiant === 'function')
        ? obtenirStatutJetonsEtudiant(da) : {};

    var { jetonsParType, totalUtilises, totalMax } = _collecterJetonsUtilisesParType(da);
    var mapPredefinis = _construireMapPredefinis(evalCourante);

    var htmlJetons = [];
    var htmlPerso = [];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        var s = statut[type.id] || { utilises: 0, total: type.nombreTotal || 0 };
        var tokenIdx = Math.min(s.utilises, 2);
        var tokenImg = '<img src="icons/outils-token' + tokenIdx + '-100.png" alt="' + s.utilises + '/' + s.total + '" class="jeton-icone" title="' + s.utilises + ' / ' + s.total + ' utilisés">';
        var artefacts = jetonsParType[type.id] || [];

        if (type.predefini && mapPredefinis[type.id]) {
            htmlJetons.push(_renderHtmlJetonPredefini(type, mapPredefinis[type.id], artefacts, tokenImg));
        } else if (!type.predefini) {
            htmlPerso.push(_renderHtmlJetonPerso(type, tokenImg));
        }
    }

    var html = '<div style="display: flex; flex-direction: column; gap: 8px;">' + htmlJetons.join('') + '</div>';
    if (htmlPerso.length > 0) {
        html += '<div class="u-flex-gap-10 u-flex-col" style="margin-top: 10px;">' + htmlPerso.join('') + '</div>';
    }
    html += '<div class="eval-aide" style="margin-top: 6px; padding-top: 4px; border-top: 1px solid var(--bordure-claire); text-align: right;">' +
        'Total utilisés : <strong>' + totalUtilises + ' / ' + totalMax + '</strong></div>';

    conteneur.innerHTML = html;
}

/**
 * Gère le changement de la checkbox jeton de délai
 * Applique ou retire le jeton selon l'état de la checkbox
 */
function gererChangementCheckboxJetonDelai() {
    const checkbox = document.getElementById('checkboxJetonDelai');
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        // Nouvelle évaluation : on laisse la checkbox cochée
        // Le jeton sera appliqué lors de la sauvegarde
        if (checkbox.checked) {
        }
        return;
    }

    // Évaluation existante : appliquer ou retirer immédiatement
    if (checkbox.checked) {
        // Appliquer le jeton
        const succes = appliquerJetonDelai(evaluationId);
        if (!succes) {
            // Si l'application a échoué, décocher la checkbox
            checkbox.checked = false;
        }
    } else {
        // Retirer le jeton
        retirerJetonDelai(evaluationId);
    }
}

/**
 * Gère le changement de la checkbox jeton de reprise
 * Applique ou retire le jeton selon l'état de la checkbox
 */
function gererChangementCheckboxJetonReprise() {
    const checkbox = document.getElementById('checkboxJetonReprise');
    const evaluationId = window.evaluationEnCours?.idModification;

    if (!evaluationId) {
        console.warn('⚠️ Jeton de reprise : Impossible d\'appliquer sur une nouvelle évaluation (pas encore sauvegardée)');
        checkbox.checked = false;
        notifications.erreur('Erreur', 'Enregistre d\'abord l\'évaluation avant d\'appliquer un jeton');
        return;
    }

    if (checkbox.checked) {
        // Pour le jeton de reprise, demander confirmation car cela crée une nouvelle évaluation
        const confirmer = confirm(
            'Appliquer un jeton de reprise créera une nouvelle évaluation qui remplacera celle-ci.\n\n' +
            'Veux-tu continuer ?'
        );

        if (confirmer) {
            const nouvelleEval = appliquerJetonReprise(evaluationId);
            if (nouvelleEval) {
                // Charger la nouvelle évaluation dans le formulaire
                setTimeout(() => {
                    if (typeof modifierEvaluation === 'function') {
                        modifierEvaluation(nouvelleEval.id);
                    }
                }, 500);
            } else {
                // Si l'application a échoué, décocher la checkbox
                checkbox.checked = false;
            }
        } else {
            // L'utilisateur a annulé, décocher la checkbox
            checkbox.checked = false;
        }
    } else {
        // Retirer le jeton — si l'utilisateur annule le confirm, rien n'a
        // changé : la checkbox doit refléter l'état réel (jeton en place).
        const retire = retirerJetonReprise(evaluationId);
        if (!retire) {
            checkbox.checked = true;
        }
    }
}

/**
 * Retire un jeton depuis la barre latérale (pendant l'édition)
 *
 * #563 : le JSDoc annonçait trois types, le code n'en a jamais géré que deux —
 * 'reprise-ciblee' tombait dans le vide, sans `else` ni message. Documenté tel
 * qu'il EST, avec le manque nommé plutôt que suggéré.
 *
 * @param {string} evaluationId - ID de l'évaluation
 * @param {string} typeJeton - 'reprise' ou 'delai'. 'reprise-ciblee' n'est PAS
 *   pris en charge : `retirerJetonRepriseCiblee` n'existe pas, et défaire une
 *   reprise ciblée suppose de supprimer l'évaluation qu'elle a créée. Depuis #563
 *   (29 août 2026), la case qui APPLIQUAIT ce jeton est retirée : une reprise
 *   ciblée ne peut plus naître, seules les anciennes subsistent.
 */
function retirerJetonDepuisSidebar(evaluationId, typeJeton) {

    if (typeJeton === 'reprise') {
        // Utiliser le module evaluation-jetons.js pour retirer le jeton de reprise
        if (typeof retirerJetonReprise === 'function') {
            retirerJetonReprise(evaluationId);
        } else {
            console.error('❌ Fonction retirerJetonReprise non disponible');
            notifications.erreur('Erreur', 'Module jetons non disponible');
        }
    } else if (typeJeton === 'delai') {
        // Utiliser le module evaluation-jetons.js pour retirer le jeton de délai
        if (typeof retirerJetonDelai === 'function') {
            const succes = retirerJetonDelai(evaluationId);
            if (succes) {
                // Réafficher le bouton pour permettre de réappliquer le jeton
                const bouton = document.getElementById('boutonJetonDelai');
                if (bouton) bouton.classList.remove('u-hide');
            }
        } else {
            console.error('❌ Fonction retirerJetonDelai non disponible');
            notifications.erreur('Erreur', 'Module jetons non disponible');
        }
    } else {
        // #563 — 'reprise-ciblee' arrivait ici et repartait sans rien faire ni
        // rien dire. Le type n'est pas pris en charge : autant que l'appelant et
        // l'utilisateur l'apprennent, plutôt qu'un silence qui passe pour un succès.
        console.warn('[Jetons] Retrait non pris en charge pour le type : ' + typeJeton);
        notifications.info('Retrait non disponible', 'Ce type de jeton ne peut pas être retiré ici.');
    }
}

// =====================================================================
// Exports window.X (12) — voir en-tête pour détails
// =====================================================================

// Préservés depuis bloc principal evaluation.js :
window.sauvegarderEvaluation = sauvegarderEvaluation;
window.mettreAJourPillStatut = mettreAJourPillStatut;
window.changerStatutRemise = changerStatutRemise;
window.changerStatutIntegrite = changerStatutIntegrite;
window.peuplementOptJetons = peuplementOptJetons;
window.gererChangementCheckboxJetonDelai = gererChangementCheckboxJetonDelai;
window.gererChangementCheckboxJetonReprise = gererChangementCheckboxJetonReprise;
window.retirerJetonDepuisSidebar = retirerJetonDepuisSidebar;

// Promotions §5.6 nouvelles (session B 3e sous-module) :
window.majBadgesApresEvaluation = majBadgesApresEvaluation;
window.afficherBadgesJetons = afficherBadgesJetons;
window.afficherGestionJetons = afficherGestionJetons;

})();
