/* ===============================
   MODULE EVALUATION-CALCUL — Calcul des notes (algorithmique + simple + catégories)

   Extrait de js/evaluation.js (zone L61-L720 Calcul de notes + Gestion des
   couleurs, session B étape 3 refactor evaluation, 2026-05-18 — beta 99.48).

   6 fonctions migrées :
     · calculerNoteAlgorithmique (privée à l'IIFE — pas d'export)
     · _projectionEUF (privée à l'IIFE — délègue au registre evaluation-projection.js).
       DEUX appelants réels, pas trois : _construireRetroactionAlgoCategories
       (mode catégories) et calculerNoteAlgorithmiqueSimple. L'ancien en-tête en
       annonçait trois — calculerNoteAlgorithmique est du code mort et n'a jamais
       appelé ce helper. Corrigé au passage (#668).
     · calculerNoteAlgorithmiqueAvecCategories (cyc 42 — héritage Cat-B accepté,
       sous le seuil proposé N=50)
     · calculerNoteAlgorithmiqueSimple
     · calculerNote (note finale pondérée — appelée 6× depuis le résidu via
       window.calculerNote après extraction)
     · obtenirCouleurNiveau (appelée 2× depuis evaluation-chargement.js via
       window.obtenirCouleurNiveau après extraction)

   Variables module-scope encapsulées (anti-pattern §5.10) : aucune
   (toutes les locals sont à l'intérieur des function bodies).

   4 exports window.X :
     · window.calculerNoteAlgorithmiqueAvecCategories (déjà exporté en session A
       pour evaluation-handlers.js — préservé)
     · window.calculerNoteAlgorithmiqueSimple (déjà exporté en session A pour
       evaluation-handlers.js — préservé)
     · window.calculerNote (PROMOTION §5.6 — appelée depuis le résidu zones
       Sauvegarde + Modification : changerStatutIntegrite, changerEchelleEvaluation,
       verifierEtChargerEvaluationExistante, modifierEvaluation × 2)
     · window.obtenirCouleurNiveau (PROMOTION §5.6 — appelée depuis
       evaluation-chargement.js : chargerGrilleSelectionnee, niveauSelectionne)

   NON exportées (préservation comportementale stricte) :
     · calculerNoteAlgorithmique : pas d'export d'origine, appelée uniquement
       via HTML inline handlers résolus par le dispatcher data-action (cherche
       dans window) — non, en réalité elle N'EST PAS exportée et n'est appelée
       que depuis evaluation-handlers.js via... ah non, handlers appelle
       window.calculerNoteAlgorithmiqueSimple et window.calculerNoteAlgorithmique
       AvecCategories — PAS calculerNoteAlgorithmique sans suffixe. Donc cette
       fonction est apparemment dead code (préservation Cat-B post-merge).
     · _projectionEUF : helper interne, DEUX appelants au sein du même IIFE.

   Patches §5.6 appliqués DANS ce sous-module :
     · 3 sites `genererRetroaction(1)` → `window.genererRetroaction(1)` aux
       lignes correspondantes (calculerNoteAlgorithmique fin de fonction,
       calculerNoteAlgorithmiqueAvecCategories fin, calculerNoteAlgorithmiqueSimple
       fin). Raison : `genererRetroaction` reste dans le résidu (zone Rétroaction
       L741), exporté via window.genererRetroaction depuis le résidu.

   Helpers cross-module consommés (script-scope globaux, donc bare access OK) :
     · evaluationEnCours (let global config.js L145)
     · db.getSync (db.js global)
     · document.getElementById, Math.*, parseInt, console.warn/error (natifs)

   Chargé AVANT evaluation.js dans index.html (entre evaluation-chargement.js
   et evaluation.js) — le résidu evaluation.js consomme window.calculerNote
   et evaluation-chargement.js consomme window.obtenirCouleurNiveau via
   promotion §5.6.
   =============================== */

(function() {
'use strict';

/**
 * Colore le bloc résultat (.eval-resultat-algo) selon le niveau calculé,
 * pour aligner visuellement les critères algorithmiques sur les autres
 * critères (qui ont un select dropdown coloré). Passer `null`/`'--'` pour
 * retirer le style (état pas-encore-calculé).
 */
function _appliquerStyleResultatAlgo(critereId, niveau) {
    const bloc = document.getElementById(`resultat_algo_${critereId}`);
    const nivAlgo = document.getElementById(`niveau_algo_${critereId}`);
    if (!bloc) return;
    if (niveau && niveau !== '--' && typeof obtenirCouleurNiveau === 'function') {
        const couleur = obtenirCouleurNiveau(niveau);
        bloc.style.borderLeft = `4px solid ${couleur}`;
        bloc.style.background = couleur + '20';
        if (nivAlgo) { nivAlgo.style.color = couleur; nivAlgo.style.fontWeight = '700'; }
    } else {
        bloc.style.borderLeft = '';
        bloc.style.background = '';
        if (nivAlgo) { nivAlgo.style.color = ''; nivAlgo.style.fontWeight = ''; }
    }
}

/**
 * Calcule automatiquement la note pour un critère algorithmique
 * Formule: Note = Pondération − (Erreurs ÷ Mots × Facteur)
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmique(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    if (mots === 0) {
        // Réinitialiser l'affichage
        document.getElementById(`note_algo_${critereId}`).textContent = '--';
        document.getElementById(`pct_algo_${critereId}`).textContent = '--';
        document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
        _appliquerStyleResultatAlgo(critereId, null);
        return;
    }

    // #667 — branchée sur le registre comme les autres. Cette fonction n'a
    // aucun appelant (voir l'en-tête du module), mais une règle de calcul qui
    // dort dans du code mort est exactement ce qui finit par diverger de la
    // règle vivante. Elle est donc alignée, pas laissée de côté.
    const resFormuleMorte = window.formulesAlgo.calculer(
        _critereFormulePourCalcul(critereId, facteur),
        { ponderation: ponderation, erreurs: erreurs, mots: mots }
    );
    if (!resFormuleMorte.applicable) return;
    const noteCalculee = resFormuleMorte.note;
    const pctFinal = resFormuleMorte.pctBorne;

    // #701 / #702 — le niveau par la règle unique ; `undefined` quand rien ne se déduit.
    const niveauIDME = _determinerNiveauIDMEAlgo(pctFinal);

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME || '--';
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Sauvegarder dans evaluationEnCours (#702 : jamais « -- »)
    _poserNiveauCalculeAlgo(critereId, niveauIDME);

    // Sauvegarder les données algorithmiques séparément pour pouvoir les recharger
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }
    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal
    };

    // Calculer la note globale et générer la rétroaction
    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/**
 * #668 — La projection EUF vient du GABARIT de la grille, plus du code.
 *
 * Remplace `genererRetroactionEUF`, qui portait en dur cinq verdicts, quatre
 * seuils et le nom d'un service d'aide propre au collège de son auteur — un
 * service qui n'existe d'ailleurs plus (le Centre d'aide en français est devenu
 * Passerelle +). L'application disait à des élèves de s'inscrire à un service
 * disparu, et personne ne pouvait le corriger sans toucher au code.
 *
 * Le registre `evaluation-projection.js` porte la mécanique ; le critère de
 * grille porte les réglages. Le texte rendu ici est donc celui que
 * l'enseignant·e a écrit, pas celui qu'un développeur a écrit pour elle.
 *
 * ⚠ L'ESPACE INITIALE APPARTIENT AU SITE DE CONCATÉNATION. Le registre rend une
 * phrase autonome (le PDF du Lot 6 en a besoin comme paragraphe) ; c'est ici
 * qu'elle devient une queue de phrase. La sentinelle #668 compare exactement
 * cette forme-ci au golden extrait de l'ancienne fonction.
 *
 * @param {string} critereId - le critère évalué, qui porte les réglages
 * @param {number} erreurs - compte d'erreurs (brut, comme avant #668)
 * @param {number} mots - nombre de mots du texte
 * @returns {string} le fragment à concaténer, ou '' si rien à conclure
 */
function _projectionEUF(critereId, erreurs, mots) {
    if (!window.projectionAlgo) {
        // Ne pas deviner un texte de remplacement : un module absent est un
        // défaut de chargement, pas un cas d'usage. Mieux vaut aucune projection
        // qu'une projection dont personne ne pilote la règle.
        console.warn('[_projectionEUF] registre de projection absent', critereId);
        return '';
    }
    var resultat = window.projectionAlgo.calculer(
        _critereDeGrille(critereId), { erreurs: erreurs, mots: mots }
    );
    return resultat.applicable ? ' ' + resultat.texte : '';
}

/**
 * #671 — LE PANNEAU APPARTIENT-IL BIEN À L'ÉVALUATION EN COURS ?
 *
 * Les champs `eval_erreurs_<critereId>` portent le CRITÈRE dans leur id, pas
 * l'élève : les mêmes champs servent aux 27 copies d'un lot. La bascule d'une
 * copie à l'autre est ASYNCHRONE — `preRemplirEvaluation` (travaux-ui.js:5145)
 * réessaie jusqu'à 10 fois à 150 ms, puis attend encore la production. Pendant
 * cette fenêtre de plus d'une seconde, les champs portent ENCORE les valeurs de
 * la copie précédente pendant que `evaluationEnCours` désigne déjà la nouvelle.
 * Un calcul déclenché là écrit le compte du voisin sous le nom du nouvel élève.
 *
 * MESURÉ le 31 août 2026 sur 27 copies réelles : 5 contaminées, dont 3 par le
 * voisin immédiat (Fictif a reçu le 59 d'Exemple, Gabarit le 11 de Simulacre,
 * Maquette le 8 de Croquis). Des PDF faux étaient déjà remis aux élèves.
 *
 * ⚠ POURQUOI PAS UN DÉLAI DE PLUS. Le correctif du 15 décembre 2025
 * (`5d2d41c7`) couvrait déjà cette course en « augmentant le délai de recalcul
 * à 350 ms ». Un délai n'est pas une synchronisation : il rend la course moins
 * probable et la fait revenir dès que la machine ralentit ou que les données
 * grossissent. Cette garde-ci ne consulte aucune horloge — elle compare une
 * IDENTITÉ, et refuse quand elle ne correspond pas.
 *
 * Le marquage est posé par `chargerEvaluationsEtudiant` au moment où le panneau
 * est lié à un élève. Un champ SANS marque n'est pas refusé : il n'a jamais été
 * lié, donc il est vide, donc il ne peut rien contaminer.
 */
function _panneauAppartientALEvaluation(critereId) {
    var attendu = (window.evaluationEnCours && evaluationEnCours.etudiantDA) || '';
    if (!attendu) return true;
    var ids = ['eval_erreurs_' + critereId, 'eval_mots_' + critereId, 'eval_categories_' + critereId];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (!el || !el.dataset) continue;
        var marque = el.dataset.da;
        if (marque === undefined || marque === '') continue;   // jamais lié : rien à contaminer
        if (String(marque) !== String(attendu)) {
            console.warn('[#671] Calcul REFUSÉ : le panneau porte encore la copie de ' + marque
                + ' alors que l\'évaluation en cours est ' + attendu
                + '. Aucune écriture. Le calcul repartira quand le panneau sera chargé.');
            return false;
        }
    }
    return true;
}

/**
 * Calcule la note algorithmique AVEC catégorisation des erreurs
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * + Calcul du mode (catégorie dominante) pour rétroaction différenciée
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 * @param {string} critereGrilleId - ID du critère dans la grille (pour récupérer les catégories)
 */
function _parserCodesAlgoCategories(critereId) {
    const categoriesInput = document.getElementById(`eval_categories_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);
    const categoriesTexte = categoriesInput?.value.trim() || '';
    const mots = parseInt(motsInput?.value) || 0;
    let codesSousCriteres = [];
    if (categoriesTexte) {
        codesSousCriteres = categoriesTexte.split(';').map(c => c.trim()).filter(c => c !== '');
    }
    return { codesSousCriteres, mots, totalErreurs: codesSousCriteres.length };
}

function _resetAffichageAlgoCategories(critereId) {
    _effacerRetroactionMachine(critereId);   // #673 — même règle qu'en mode simple
    document.getElementById(`note_algo_${critereId}`).textContent = '--';
    document.getElementById(`pct_algo_${critereId}`).textContent = '--';
    document.getElementById(`niveau_algo_${critereId}`).textContent = '--';
    document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
    _masquerFormuleAlgo(critereId);
    _appliquerStyleResultatAlgo(critereId, null);
    const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
    if (retroDiv) retroDiv.classList.add('u-hide');
}

function _obtenirSousCriteresGrille(critereId) {
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grilleId = evaluationEnCours?.grilleId;
    const grille = grilles.find(g => g.id === grilleId);
    if (grille && grille.criteres) {
        const critereGrille = grille.criteres.find(c => c.id === critereId);
        if (critereGrille && critereGrille.sousCriteres) {
            return critereGrille.sousCriteres;
        }
    }
    return [];
}

/** #673 — Le prédicat d'amorce, emprunté à son propriétaire. Voir le bloc ci-dessous. */
function _estAmorceDeSaisieAlgo(texte) {
    // La liste vit dans synthese-retroaction-data.js (#672) et n'est pas recopiée ici :
    // deux inventaires divergeraient en silence. Si le module manque, on ne classe rien
    // — et faute de classement, on n'efface rien.
    const api = window.syntheseRetroactionData;
    return !!(api && typeof api.estAmorceDeSaisie === 'function' && api.estAmorceDeSaisie(texte));
}

/**
 * #673 — RETIRE LA RÉTROACTION PÉRIMÉE, ET RIEN D'AUTRE.
 *
 * LE DÉFAUT. Quand un calcul redevient inapplicable, l'écran repasse à « -- » mais le
 * div `comm_<critereId>` garde la rétroaction de la saisie PRÉCÉDENTE. Les trois
 * collecteurs lisent ce div : un compte d'erreurs périmé partait en base, puis au PDF.
 * Pire qu'une amorce — une amorce se reconnaît, un compte périmé est PLAUSIBLE.
 *
 * ⛔ CE QU'IL NE FAUT SURTOUT PAS FAIRE : vider le div sans condition. Il porte AUSSI
 * les commentaires que l'enseignant·e écrit à la main.
 *
 * LA RÈGLE (décision de Grégoire, 1er septembre 2026) : n'effacer QUE ce que le code a
 * lui-même écrit. Le div ne part que s'il correspond EXACTEMENT au dernier texte
 * engendré, ou à l'une des amorces de saisie. Sinon on n'y touche pas. Même discipline
 * que les scripts de réparation de la veille : correspondance exacte avec du contenu
 * machine, jamais une ressemblance.
 *
 * ⚠ ET LES DEUX EMPLACEMENTS, PAS UN. Le texte périmé vit aussi dans
 * `donneesAlgorithmiques[critereId].retroaction`, où la cascade du PDF (#672) le prend
 * en REPLI dès que le div est vide. Ne vider que le div déplacerait le défaut au lieu
 * de le retirer. Cette moitié-là est inconditionnelle : cette clé ne contient jamais
 * que du texte engendré.
 */
function _effacerRetroactionMachine(critereId) {
    const memo = (evaluationEnCours && evaluationEnCours.donneesAlgorithmiques)
        ? evaluationEnCours.donneesAlgorithmiques[critereId]
        : null;
    // Lu AVANT le retrait : c'est lui qui sert de pièce de comparaison.
    const engendre = String((memo && memo.retroaction) || '').trim();

    const div = document.getElementById(`comm_${critereId}`);
    const courant = String((div && div.textContent) || '').trim();
    const estTexteMachine = (engendre !== '' && courant === engendre) || _estAmorceDeSaisieAlgo(courant);
    if (div && courant !== '' && estTexteMachine) div.textContent = '';

    if (memo) delete memo.retroaction;
}

/**
 * #667 — Remet le bloc résultat du mode SIMPLE à l'état « pas de conclusion ».
 *
 * Extrait tel quel de la garde `mots === 0` de calculerNoteAlgorithmiqueSimple,
 * y compris le fix #110 v3 : erreurs et mots restent écrits dans
 * donneesAlgorithmiques même quand le calcul ne tourne pas, sinon la sauvegarde
 * repersiste l'ancienne valeur.
 */
function _viderResultatAlgoSimple(critereId, erreurs, mots) {
    _effacerRetroactionMachine(critereId);
    var noteEl = document.getElementById(`note_algo_${critereId}`);
    var pctEl = document.getElementById(`pct_algo_${critereId}`);
    var nivEl = document.getElementById(`niveau_algo_${critereId}`);
    var totalErreursElem = document.getElementById(`total_erreurs_simple_${critereId}`);
    var motsElem = document.getElementById(`mots_simple_${critereId}`);
    if (noteEl) noteEl.textContent = '--';
    if (pctEl) pctEl.textContent = '--';
    if (nivEl) nivEl.textContent = '--';
    if (totalErreursElem) totalErreursElem.textContent = '--';
    if (motsElem) motsElem.textContent = '--';
    _masquerFormuleAlgo(critereId);
    _appliquerStyleResultatAlgo(critereId, null);
    if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
    // #698 — la saisie reste, le RÉSULTAT part (voir `_memoireAlgoSansResultat`), et la note
    // se recalcule tout de suite : un critère sans résultat est un critère sans niveau.
    evaluationEnCours.donneesAlgorithmiques[critereId] = _memoireAlgoSansResultat(
        evaluationEnCours.donneesAlgorithmiques[critereId],
        { erreurs: erreurs, mots: mots }
    );
    _retirerNiveauCalculeAlgo(critereId);
    calculerNote();
    if (typeof window.genererRetroaction === 'function') window.genererRetroaction(1);
}

/**
 * #698 (D-2 de l'audit du moteur, 5 septembre 2026) — L'EFFACEMENT TARIT LA MÉMOIRE DU CRITÈRE.
 *
 * Les deux réinitialisations (mode simple ci-dessus, mode catégories dans
 * `calculerNoteAlgorithmiqueAvecCategories`) fusionnaient la saisie neuve SUR l'ancien objet :
 * `pourcentage`, `noteCalculee`, `niveau` et `sommePonderee` survivaient à des codes ou à des
 * mots effacés, `evaluationEnCours.criteres[critereId]` gardait le niveau, et `calculerNote`
 * n'était pas rappelée. La note ne bougeait pas ; l'enregistrement rejouait la même garde
 * (`_forcerRecalculAlgorithmiqueAvantSauvegarde`) et persistait « 0 erreur → 17,50/20
 * (87,5 %) », que le PDF de l'élève imprime tel quel. Mesuré au banc de l'audit (D2, D3, D4).
 * Le fix #110 v3 voulait garder erreurs, mots et codes pour que la sauvegarde ne repersiste pas
 * l'ancienne SAISIE ; il gardait aussi le RÉSULTAT. On garde la saisie, on retire le résultat.
 * La rétroaction engendrée, elle, part déjà par `_effacerRetroactionMachine` (#673).
 */
function _memoireAlgoSansResultat(ancienne, saisie) {
    const memo = Object.assign({}, ancienne || {}, saisie);
    delete memo.pourcentage;
    delete memo.noteCalculee;
    delete memo.niveau;
    delete memo.sommePonderee;
    return memo;
}

/**
 * #698 — Le niveau qu'un calcul avait posé part avec lui. Un niveau choisi À LA MAIN dans le
 * menu du critère (jeton de reprise ciblée : `_valeurCritereEnCours` lit le select) n'est pas
 * un résultat de calcul — il reste.
 */
function _retirerNiveauCalculeAlgo(critereId) {
    if (!evaluationEnCours || !evaluationEnCours.criteres) return;
    const select = document.getElementById(`eval_${critereId}`);
    if (select && select.value) return;
    delete evaluationEnCours.criteres[critereId];
}

/**
 * #667 — Écrit la formule CHIFFRÉE sous le résultat, dans le module Évaluer.
 *
 * C'est la demande d'origine : voir le calcul, pas seulement son produit. Le
 * texte est engendré par le registre à partir du même modèle et des mêmes
 * paramètres que le calcul — il ne peut pas décrire autre chose que ce qui a
 * été fait.
 *
 * textContent, jamais innerHTML : le libellé contient des valeurs venues de la
 * grille de l'utilisateur.
 */
function _afficherFormuleAlgo(critereId, critere, donnees) {
    var el = document.getElementById(`formule_algo_${critereId}`);
    if (!el) return;
    var texte = '';
    try {
        texte = window.formulesAlgo.libelleChiffre(critere, donnees);
    } catch (e) {
        console.warn('[_afficherFormuleAlgo] libellé indisponible', critereId, e);
    }
    if (texte) {
        el.textContent = texte;
        el.classList.remove('u-hide');
    } else {
        _masquerFormuleAlgo(critereId);
    }
}

/** #667 — Cache la ligne de formule : mieux vaut rien qu'un calcul en tirets. */
function _masquerFormuleAlgo(critereId) {
    var el = document.getElementById(`formule_algo_${critereId}`);
    if (!el) return;
    el.textContent = '';
    el.classList.add('u-hide');
}

/**
 * #667 — Retrouve le critère de grille pour lire SA formule (modèle + paramètres).
 *
 * Les fonctions de calcul ne reçoivent que `(critereId, ponderation, facteur)` :
 * la formule, elle, vit sur le critère de la grille. On va donc la chercher là.
 *
 * Quand la grille est introuvable (hors mode Évaluer, grille supprimée), on
 * reconstitue un critère minimal à partir du facteur reçu en argument : le
 * registre le lira comme le modèle historique et le calcul restera identique
 * à celui d'avant #667. Aucune note ne change parce qu'une grille manque.
 */
function _critereDeGrille(critereId) {
    try {
        const grilles = db.getSync(cle('grillesTemplates'), []);
        const grille = grilles.find(g => g.id === evaluationEnCours?.grilleId);
        const critere = grille?.criteres?.find(c => c.id === critereId);
        if (critere) return critere;
    } catch (e) {
        console.warn('[_critereDeGrille] grille illisible', critereId, e);
    }
    return null;
}

/**
 * #686 — Le critère dont les ÉNONCÉS se lisent : celui de la grille, sinon le nom que
 * l'évaluation enregistrée porte (`criteres[].critereNom`). Sans ce repli, un critère qui
 * s'appelle « Français écrit » recevait les mots du modèle générique dès que sa grille
 * était introuvable. ⚠ Pour les énoncés SEULEMENT : la formule garde son propre repli
 * (`_critereFormulePourCalcul`), qui ne doit pas recevoir un objet sans paramètres.
 * L'évaluation enregistrée est repérée par `idModification`, posé sur `window` à l'ouverture.
 */
function _critereEnoncesPour(critereId) {
    const deGrille = _critereDeGrille(critereId);
    if (deGrille || !window.enoncesAlgo || typeof window.enoncesAlgo.critereAlgorithmiqueOuNomme !== 'function') return deGrille;
    const idModification = (window.evaluationEnCours && window.evaluationEnCours.idModification)
        || (evaluationEnCours && evaluationEnCours.idModification);
    if (!idModification) return null;
    const enregistree = (db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e && e.id === idModification);
    return window.enoncesAlgo.critereAlgorithmiqueOuNomme(null, enregistree, critereId);
}

function _critereFormulePourCalcul(critereId, facteurRecu) {
    return _critereDeGrille(critereId) || { facteurNormalisation: facteurRecu };
}

/**
 * #701 / #702 — LE NIVEAU D'UN POURCENTAGE, UNE SEULE RÈGLE POUR LES TROIS CHEMINS
 * (note globale, critère algorithmique, critère analytique à points).
 *
 * CE QUI EXISTAIT (audit du moteur, constats B-1 et B-2). Cinq copies de
 * `pourcentage >= n.min && pourcentage <= n.max`, et trois réponses différentes quand
 * le pourcentage tombait ENTRE deux bornes (74,5 entre « 60-74 » et « 75-89 ») : la
 * note globale prenait le niveau le plus proche ; le critère algorithmique écrivait
 * « -- » — et ce « -- », vrai pour un `if (niveau)`, entrait en base comme
 * `niveauSelectionne`, ouvrait la clé de cartouche `a1_--` et s'imprimait sur le PDF
 * de l'élève ; le critère analytique n'avait aucun niveau.
 *
 * LA RÈGLE (décision de Grégoire, 17 sept. 2026, 13 h 42) : le pourcentage est
 * ARRONDI À L'ENTIER avant la recherche (74,5 → 75 → niveau supérieur ; 74,4 → 74).
 * Des bornes entières (« 60-74 / 75-89 ») ou en « ,99 » (« 65-74,99 / 75-84,99 »)
 * n'ont alors plus aucun trou. Écartés par lui : imposer des bornes contiguës dans
 * l'éditeur d'échelle ; descendre au niveau inférieur à égalité de distance.
 *
 * ⚠ L'arrondi sert à CHERCHER LE NIVEAU, jamais à noter : la note garde son
 * pourcentage exact partout (`noteCalculeeCourante`, `donneesAlgorithmiques`).
 *
 * ⚠ Le premier arrondi, au millionième, retire le bruit de la virgule flottante : une
 * moyenne pondérée qui VAUT 74,5 peut sortir 74,49999999999999 du calcul, et
 * tomberait d'un niveau pour une raison que personne ne peut lire à l'écran.
 *
 * ▣ TROU RÉSIDUEL (échelle aux bornes espacées, « 60-70 / 75-89 » devant 72) : le
 * niveau le plus proche, par la distance au MILIEU de plage — la règle que la note
 * globale appliquait déjà, reprise telle quelle et étendue aux deux autres chemins
 * (décision de Cowork, consigne du 19 sept., en ligne avec #701). À égalité, le
 * premier niveau dans l'ordre de l'échelle, comme avant.
 *
 * @param {number} pourcentage - 0-100, non arrondi
 * @param {Array}  niveaux     - les niveaux de l'échelle (code, min, max)
 * @param {{sansNiveauZero?: boolean}} [options] - le niveau « 0 » (non recevable,
 *   réservé à l'intégrité académique) ne se déduit jamais d'un chiffre : les chemins
 *   algorithmique et analytique l'écartent, comme avant.
 * @returns {string|undefined} le code du niveau, ou `undefined` quand rien ne se
 *   déduit (pas de pourcentage, pas de niveau utilisable). ⛔ Jamais « -- ».
 */
function niveauDuPourcentage(pourcentage, niveaux, options) {
    if (pourcentage === null || pourcentage === undefined || pourcentage === '') return undefined;
    const p = Number(pourcentage);
    if (isNaN(p) || !Array.isArray(niveaux)) return undefined;
    const sansZero = !!(options && options.sansNiveauZero);
    const candidats = niveaux.filter(n => n
        && !(sansZero && (n.code === '0' || n.code === 0))
        && !isNaN(Number(n.min)) && !isNaN(Number(n.max)));
    if (candidats.length === 0) return undefined;

    const entier = Math.round(Math.round(p * 1e6) / 1e6);
    const exact = candidats.find(n => entier >= Number(n.min) && entier <= Number(n.max));
    if (exact) return exact.code;

    let plusProche = candidats[0];
    let distMin = Infinity;
    candidats.forEach(n => {
        const dist = Math.abs(entier - (Number(n.min) + Number(n.max)) / 2);
        if (dist < distMin) { distMin = dist; plusProche = n; }
    });
    console.warn('[niveauDuPourcentage] ' + entier + ' % ne tombe dans aucune plage : niveau le plus proche, '
        + plusProche.code + ' [' + plusProche.min + '-' + plusProche.max + ']');
    return plusProche.code;
}

function _calculerScoreAlgoCategories(codesSousCriteres, sousCriteres, ponderation, mots, facteur, critereId) {
    let sommePonderee = 0;
    codesSousCriteres.forEach(code => {
        const sc = sousCriteres.find(s => s.code === code);
        sommePonderee += sc && sc.ponderation !== undefined ? sc.ponderation : 1.0;
    });
    // #667 — la formule vient du gabarit de la grille, plus du code. En mode
    // catégories, c'est la somme PONDÉRÉE des codes qui tient lieu d'erreurs.
    const critere = _critereFormulePourCalcul(critereId, facteur);
    const res = window.formulesAlgo.calculer(critere, {
        ponderation: ponderation,
        erreurs: sommePonderee,
        mots: mots
    });
    if (!res.applicable) {
        return { sommePonderee, noteCalculee: 0, pctFinal: 0, applicable: false };
    }
    return { sommePonderee, noteCalculee: res.note, pctFinal: res.pctBorne, applicable: true };
}

/**
 * Le niveau d'un critère algorithmique, par la règle unique (`niveauDuPourcentage`).
 * ⮕ L'échelle se résout comme au calcul de la note (`resoudreEchelleEvaluation`, #697) :
 * ce site ne lisait que `echellesTemplates`, et rendait « -- » sous une échelle de
 * pratique (`pratique-<id>`) que la note globale, elle, savait lire.
 * Rend `undefined` quand rien ne se déduit — jamais « -- » (#702).
 */
function _determinerNiveauIDMEAlgo(pctFinal) {
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelleSelectionnee = resoudreEchelleEvaluation(echelleId);
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) return undefined;
    return niveauDuPourcentage(pctFinal, echelleSelectionnee.niveaux, { sansNiveauZero: true });
}

/**
 * #702 — LE NIVEAU CALCULÉ ENTRE DANS L'ÉVALUATION EN COURS, OU N'Y ENTRE PAS. Les trois
 * calculs algorithmiques écrivaient `criteres[critereId] = niveau` même quand le niveau
 * valait « -- » : les collecteurs de `criteres[]` testent `if (niveau)`, « -- » est vrai,
 * et il partait en base puis au PDF. Sans niveau déductible, l'entrée est retirée — par
 * la règle de #698 (un niveau choisi à la main au menu reste).
 */
function _poserNiveauCalculeAlgo(critereId, niveau) {
    if (!evaluationEnCours.criteres) evaluationEnCours.criteres = {};
    if (niveau) evaluationEnCours.criteres[critereId] = niveau;
    else _retirerNiveauCalculeAlgo(critereId);
}

function _appliquerResultatsAlgoCategories(critereId, noteCalculee, pctFinal, niveauIDME) {
    const noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    const pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    const nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME || '--';
    _appliquerStyleResultatAlgo(critereId, niveauIDME);
    _poserNiveauCalculeAlgo(critereId, niveauIDME);
    const selectAlgoCat = document.getElementById(`eval_${critereId}`);
    if (selectAlgoCat && selectAlgoCat.value) {
        selectAlgoCat.value = '';
        selectAlgoCat.style.backgroundColor = 'transparent';
        selectAlgoCat.style.borderColor = 'var(--bordure-claire)';
    }
}

function _trouverCodeDominant(codesSousCriteres) {
    const frequences = {};
    let maxFreq = 0;
    let codeDominant = null;
    codesSousCriteres.forEach(code => {
        frequences[code] = (frequences[code] || 0) + 1;
        if (frequences[code] > maxFreq) {
            maxFreq = frequences[code];
            codeDominant = code;
        }
    });
    return { codeDominant, maxFreq };
}

function _construireRetroactionAlgoCategories(critereId, totalErreurs, sommePonderee, mots, scDominant) {
    // #581 — LA PHRASE VIENT DU GABARIT DE LA GRILLE, PLUS DU MOTEUR. Elle
    // disait « Ta rédaction contient N erreurs de français » à TOUT critère
    // algorithmique : celui qui compte des erreurs de calcul comme celui qui
    // compte des fautes d'orthographe. Même geste que #667 (les formules) et
    // #668 (la projection).
    // ⚠ LA MENTION PONDÉRÉE RESTE CALCULÉE ICI, pas dans le registre : c'est
    // une donnée du calcul, pas un choix de rédaction. Elle arrive comme le
    // jeton {points}, avec son espace de tête, exactement là où elle était.
    const critereEnonces = _critereEnoncesPour(critereId);   // #686
    const mentionPoints = (scDominant && scDominant.retroaction && Math.abs(sommePonderee - totalErreurs) > 0.01)
        ? ` (${sommePonderee.toFixed(1)} points)`
        : '';
    let retroaction = window.enoncesAlgo.enonce(critereEnonces, 'decompte', {
        erreurs: totalErreurs,
        mots: mots,
        points: mentionPoints
    });
    // #668 — LE COMPTE BRUT, PAS LA SOMME PONDÉRÉE. Comportement d'avant,
    // conservé tel quel : la note suit la pondération par catégorie, la
    // projection suit le nombre d'erreurs réellement commises. Les deux
    // répondent à des questions différentes. Faire suivre la pondération à la
    // projection serait une décision pédagogique — elle déplacerait des
    // verdicts déjà rendus — pas un ajustement de code.
    const retroactionEUF = _projectionEUF(critereId, totalErreurs, mots);
    if (retroactionEUF) retroaction += retroactionEUF;
    if (scDominant && scDominant.retroaction) retroaction += ` ${scDominant.retroaction}`;
    return retroaction;
}

function _sauvegarderDonneesAlgo(critereId, donnees) {
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }
    evaluationEnCours.donneesAlgorithmiques[critereId] = donnees;
}

function calculerNoteAlgorithmiqueAvecCategories(critereId, ponderation, facteur, critereGrilleId) {
    if (!evaluationEnCours) return;
    if (!_panneauAppartientALEvaluation(critereId)) return;   // #671

    const { codesSousCriteres, mots, totalErreurs } = _parserCodesAlgoCategories(critereId);
    document.getElementById(`total_erreurs_${critereId}`).textContent = totalErreurs;
    document.getElementById(`mots_formule_${critereId}`).textContent = mots;

    // #704 (décision de Grégoire, 17 sept. 2026) — ZÉRO ERREUR DONNE LA NOTE COMPLÈTE,
    // dans les deux modes. La garde réunissait `mots === 0 || totalErreurs === 0` : une
    // copie sans faute ne pouvait être notée qu'en choisissant le niveau au menu, alors
    // qu'en mode simple 0 erreur sur 500 mots rendait 100 %. Seule la copie SANS TEXTE
    // reste sans résultat ; la formule, elle, sait déjà quoi faire de zéro erreur.
    // ⚠ SAUF SI UN NIVEAU EST CHOISI À LA MAIN AU MENU DU CRITÈRE. Jusqu'ici, c'était la
    // seule façon de noter une copie sans faute en mode catégories (et c'est le geste d'un
    // jeton de reprise ciblée, #698 C) : le calcul, qui remet le menu à vide, remplacerait
    // ce choix par 100 % à la première réouverture suivie d'un enregistrement. Le choix
    // reste ; revenu à « Utiliser le niveau calculé », le critère reçoit la note complète au
    // prochain calcul (une frappe dans la saisie, ou l'enregistrement, qui recalcule d'abord).
    const menuCritere = document.getElementById(`eval_${critereId}`);
    const niveauChoisiALaMain = !!(menuCritere && menuCritere.value);
    if (mots === 0 || (totalErreurs === 0 && niveauChoisiALaMain)) {
        _resetAffichageAlgoCategories(critereId);
        // Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
        // préserver mots+codes+totalErreurs même quand le calcul ne tourne pas,
        // sinon la sauvegarde persiste l'ancienne valeur de donneesAlgorithmiques.
        if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
        // #698 — la saisie reste, le RÉSULTAT part (voir `_memoireAlgoSansResultat`).
        evaluationEnCours.donneesAlgorithmiques[critereId] = _memoireAlgoSansResultat(
            evaluationEnCours.donneesAlgorithmiques[critereId],
            { codes: codesSousCriteres, mots: mots, totalErreurs: totalErreurs }
        );
        _retirerNiveauCalculeAlgo(critereId);
        calculerNote();
        if (typeof window.genererRetroaction === 'function') window.genererRetroaction(1);
        return;
    }

    const sousCriteres = _obtenirSousCriteresGrille(critereId);
    const { sommePonderee, noteCalculee, pctFinal } = _calculerScoreAlgoCategories(
        codesSousCriteres, sousCriteres, ponderation, mots, facteur, critereId
    );
    const niveauIDME = _determinerNiveauIDMEAlgo(pctFinal);
    _appliquerResultatsAlgoCategories(critereId, noteCalculee, pctFinal, niveauIDME);
    // #667 — en mode catégories, ce sont les codes PONDÉRÉS qui tiennent lieu
    // d'erreurs : la formule affichée doit montrer cette somme, pas le nombre
    // brut de codes saisis, sinon elle ne redonne pas la note.
    _afficherFormuleAlgo(critereId, _critereFormulePourCalcul(critereId, facteur), {
        ponderation: ponderation,
        erreurs: sommePonderee,
        mots: mots
    });

    const { codeDominant, maxFreq } = _trouverCodeDominant(codesSousCriteres);

    // #704 — SANS AUCUN CODE, IL N'Y A PAS DE CATÉGORIE DOMINANTE, MAIS IL Y A UNE NOTE.
    // Cette branche (`codeDominant === null`) était inatteignable tant que la garde du
    // dessus sortait sur zéro erreur (mesuré le 1er sept., #673) ; elle écrivait l'amorce
    // « Saisissez les codes… » par-dessus le div. Depuis #704 elle est le chemin d'une copie
    // sans faute : elle reçoit la même rétroaction que le mode simple (l'énoncé `decompte`
    // du gabarit, à zéro erreur, et la projection), et sa mémoire est écrite comme les
    // autres — sans `pourcentage` en mémoire, le critère ne compterait pas dans la note.
    // ⮕ L'amorce n'est donc plus PRODUITE nulle part ; elle reste dans la liste de
    // reconnaissance du PDF (`AMORCES_DE_SAISIE`) : des évaluations enregistrées la portent.
    const scDominant = (codeDominant === null) ? null : (sousCriteres.find(s => s.code === codeDominant) || null);
    if (codeDominant === null) {
        document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
    } else {
        const nomDominant = scDominant ? scDominant.nom : `Code ${codeDominant}`;
        document.getElementById(`cat_dominante_${critereId}`).textContent =
            `${nomDominant} (${maxFreq} occurrence${maxFreq > 1 ? 's' : ''} du code ${codeDominant})`;
    }

    const retroaction = _construireRetroactionAlgoCategories(critereId, totalErreurs, sommePonderee, mots, scDominant);
    const commDiv = document.getElementById(`comm_${critereId}`);
    if (commDiv) commDiv.textContent = retroaction;

    _sauvegarderDonneesAlgo(critereId, {
        codes: codesSousCriteres, mots, totalErreurs, sommePonderee,
        noteCalculee, pourcentage: pctFinal, niveau: niveauIDME, retroaction
    });

    if (scDominant && scDominant.retroaction) {
        const retroDiv = document.getElementById(`retroaction_cat_${critereId}`);
        if (retroDiv) retroDiv.classList.add('u-hide');
    }

    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/**
 * Calcule la note algorithmique SIMPLE (sans catégorisation des erreurs)
 * Formule: Note = Pondération − (Total Erreurs ÷ Mots × Facteur)
 * Rétroaction générique : l'énoncé `decompte` du gabarit de la grille (#581),
 * rendu par `window.enoncesAlgo`. La chaîne « Ta rédaction contient X erreurs
 * de français pour Y mots. » n'est plus écrite ici : c'est le défaut du modèle
 * `discipline_francais`, choisi quand le nom du critère dit « français ».
 *
 * @param {string} critereId - ID du critère
 * @param {number} ponderation - Pondération du critère (ex: 30)
 * @param {number} facteur - Facteur de normalisation (ex: 500 mots)
 */
function calculerNoteAlgorithmiqueSimple(critereId, ponderation, facteur) {
    if (!evaluationEnCours) return;
    if (!_panneauAppartientALEvaluation(critereId)) return;   // #671

    const erreursInput = document.getElementById(`eval_erreurs_${critereId}`);
    const motsInput = document.getElementById(`eval_mots_${critereId}`);

    const erreurs = parseInt(erreursInput?.value) || 0;
    const mots = parseInt(motsInput?.value) || 0;

    // Mettre à jour l'affichage du résumé
    const totalErreursElem = document.getElementById(`total_erreurs_simple_${critereId}`);
    const motsElem = document.getElementById(`mots_simple_${critereId}`);
    if (totalErreursElem) totalErreursElem.textContent = erreurs;
    if (motsElem) motsElem.textContent = mots;

    // #667 — la garde ne présume plus que TOUTE formule a besoin des mots :
    // c'est le modèle choisi dans le gabarit qui le dit (`utiliseMots`). Une
    // pénalité fixe par erreur se calcule sans nombre de mots.
    const motsRequisSimple = window.formulesAlgo
        .normaliser(_critereFormulePourCalcul(critereId, facteur)).modele.utiliseMots;
    if (motsRequisSimple && mots === 0) {
        _viderResultatAlgoSimple(critereId, erreurs, mots);
        return;
    }

    // #667 — la formule vient du gabarit de la grille (modèle + paramètres),
    // plus d'une expression écrite ici. Le libellé affiché sort de la MÊME
    // source que le calcul : les deux ne peuvent plus diverger.
    const critereFormuleAlgo = _critereFormulePourCalcul(critereId, facteur);
    const resFormule = window.formulesAlgo.calculer(critereFormuleAlgo, {
        ponderation: ponderation,
        erreurs: erreurs,
        mots: mots
    });
    if (!resFormule.applicable) {
        _viderResultatAlgoSimple(critereId, erreurs, mots);
        return;
    }
    const noteCalculee = resFormule.note;
    const pctFinal = resFormule.pctBorne;
    _afficherFormuleAlgo(critereId, critereFormuleAlgo, { ponderation, erreurs, mots });

    // #701 / #702 — le niveau par la règle unique ; `undefined` quand rien ne se déduit.
    const niveauIDME = _determinerNiveauIDMEAlgo(pctFinal);

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME || '--';
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Construire la rétroaction générique simple
    // #581 — même registre que le mode catégories ci-dessus : la phrase est
    // celle que le gabarit de la grille porte, et elle ne nomme aucune
    // discipline que son auteur·e n'a pas écrite.
    let retroactionGenerique = window.enoncesAlgo.enonce(
        _critereEnoncesPour(critereId), 'decompte', { erreurs: erreurs, mots: mots });   // #686

    // Ajouter la rétroaction EUF (Épreuve Uniforme de Français)
    const retroactionEUF = _projectionEUF(critereId, erreurs, mots);
    if (retroactionEUF) {
        retroactionGenerique += retroactionEUF;
    }

    // #672 — `textContent`, PAS `.value`. `comm_<critereId>` est un `<div>`
    // (evaluation-chargement.js:1028 et :1194, les deux chemins de rendu) : `.value`
    // y posait une propriété JS parasite et laissait le texte du gabarit en place.
    // Le mode catégories écrit `textContent` sur ce même div depuis toujours (l.517
    // et :526) — c'est cette dissymétrie qui a caché le défaut. Les trois collecteurs
    // de sauvegarde lisent `textContent` : ce qu'ils persistaient sous
    // `criteres[].retroaction`, c'était l'amorce « Saisissez les erreurs… ».
    const champCommentaire = document.getElementById(`comm_${critereId}`);
    if (champCommentaire) {
        champCommentaire.textContent = retroactionGenerique;
    }

    // === SAUVEGARDE DANS evaluationEnCours ===
    if (!evaluationEnCours.donneesAlgorithmiques) {
        evaluationEnCours.donneesAlgorithmiques = {};
    }

    evaluationEnCours.donneesAlgorithmiques[critereId] = {
        erreurs: erreurs,
        mots: mots,
        noteCalculee: noteCalculee,
        pourcentage: pctFinal,  // Sauvegarder comme nombre, pas string
        niveau: niveauIDME,
        retroaction: retroactionGenerique
    };

    // Sauvegarder le critère dans evaluationEnCours.criteres avec le niveau (#702 : jamais « -- »)
    _poserNiveauCalculeAlgo(critereId, niveauIDME);

    // Réinitialiser le sélecteur manuel pour que calculerNote() utilise le % exact algorithmique
    const selectAlgo = document.getElementById(`eval_${critereId}`);
    if (selectAlgo && selectAlgo.value) {
        selectAlgo.value = '';
        selectAlgo.style.backgroundColor = 'transparent';
        selectAlgo.style.borderColor = 'var(--bordure-claire)';
    }

    // Déclencher le recalcul et la régénération de rétroaction
    calculerNote();
    window.genererRetroaction(1); // Patch §5.6 — genererRetroaction reste dans le résidu evaluation.js
}

/* ===============================
   🧮 CALCUL DE LA NOTE
   =============================== */

/* ===============================
   #674 — LA NOTE DIT SUR QUOI ELLE PORTE (énoncé 5, cohorte 1)
   =============================== */

/**
 * La portée d'une note : sur quelle part de la grille elle a été calculée.
 *
 * ⚠⚠ LE DÉFAUT QUE CETTE RÈGLE FERME NE BAISSAIT PAS LA NOTE, IL LA MONTAIT.
 * `calculerNote` sautait tout critère sans niveau : il quittait le numérateur ET
 * `ponderationTotal`, et la division finale renormalisait les pondérations restantes
 * à 100 %. Mesuré sous WebKit le 1er septembre 2026, grille 50/30/20 : les trois
 * critères renseignés rendent 84,0 % (M) ; le critère à 20 % sans niveau rend
 * 95,0 % (E). Onze points et un niveau de plus, sans un mot — une note trop basse
 * se conteste, une note trop haute passe. Même silence quand l'échelle est choisie
 * mais qu'aucun de ses niveaux n'a de `valeurCalcul` (la forme des huit échelles
 * disciplinaires retirées le 1er septembre, dont les copies restent chez qui les
 * avait adoptées) : tous les critères sortent du total et l'écran rendait « 0.0 % »
 * comme un résultat.
 *
 * ⮕ CE QUI MANQUAIT N'EST PAS UN ÉTAT, C'EST UNE PORTÉE (décision de Grégoire,
 * 1er septembre : pas d'état « brouillon / conclue », aucun geste de plus, aucune
 * intention à deviner). `ponderationTotal` était calculée à chaque appel puis jetée.
 * Elle est désormais publiée à côté de la note (`window.porteeCalculeeCourante`,
 * jumelle de `window.noteCalculeeCourante`, #572), écrite en base avec elle
 * (`ponderationCouverte`, sur les quatre chemins qui écrivent `noteFinale`), et
 * chaque consommateur décide pour lui-même : l'écran retient la conclusion et NOMME
 * ce qui manque ; l'enregistrement refuse ; le PDF de l'élève refuse de conclure.
 * ⛔ Jamais de refus pendant la saisie : une évaluation en cours est forcément
 * incomplète, et l'auto-save continue d'écrire — la note AVEC sa portée.
 *
 * ▣ UNE SEULE RÈGLE pour « ce critère compte-t-il ? », partagée par le calcul de la
 * note (sur l'état vivant de l'écran) et par la relecture des évaluations déjà en
 * base (`porteeDepuisEvaluation`). Un critère compte quand il a un niveau ET que ce
 * niveau a une valeur — la valeur ponctuelle de l'échelle, ou le pourcentage exact
 * d'un critère algorithmique. Un critère de pondération nulle ne peut pas déplacer
 * la note : il n'est jamais « hors note ».
 *
 * ▣ « INCOMPLÈTE » = commencée ET au moins un critère pondéré hors note. Une
 * évaluation où AUCUN critère n'a de niveau n'est pas incomplète, elle est vide :
 * son zéro est visible et ne renormalise rien (c'est aussi ce qui laisse passer un
 * enregistrement fait pour poser un jeton de délai seul).
 *
 * @param {Array}    criteresGrille - les critères de la grille (id, nom, ponderation)
 * @param {Function} niveauDe       - critère → code du niveau choisi, ou vide
 * @param {Function} valeurDe       - (critère, niveau) → valeur numérique, ou undefined
 * @returns {{ponderationCouverte:number, ponderationGrille:number, criteresComptes:Array,
 *   criteresHorsNote:Array, nbCriteresAvecNiveau:number, commencee:boolean, incomplete:boolean}}
 */
function calculerPortee(criteresGrille, niveauDe, valeurDe) {
    const criteresComptes = [];
    const criteresHorsNote = [];
    let ponderationCouverte = 0;
    let ponderationGrille = 0;
    let nbCriteresAvecNiveau = 0;

    (Array.isArray(criteresGrille) ? criteresGrille : []).forEach(critere => {
        const ponderation = Number(critere.ponderation) || 0;
        ponderationGrille += ponderation;
        const niveau = niveauDe(critere);
        if (!niveau) {
            if (ponderation > 0) {
                criteresHorsNote.push({ critereId: critere.id, nom: critere.nom || critere.id, ponderation: ponderation, motif: 'sans-niveau', niveau: '' });
            }
            return;
        }
        nbCriteresAvecNiveau++;
        const valeur = valeurDe(critere, niveau);
        // Même test que le calcul historique : seule l'ABSENCE de valeur exclut.
        if (valeur === undefined) {
            if (ponderation > 0) {
                criteresHorsNote.push({ critereId: critere.id, nom: critere.nom || critere.id, ponderation: ponderation, motif: 'niveau-sans-valeur', niveau: niveau });
            }
            return;
        }
        criteresComptes.push({ critere: critere, niveau: niveau, valeur: valeur });
        ponderationCouverte += ponderation;
    });

    const commencee = nbCriteresAvecNiveau > 0;
    return {
        ponderationCouverte: ponderationCouverte,
        ponderationGrille: ponderationGrille,
        criteresComptes: criteresComptes,
        criteresHorsNote: criteresHorsNote,
        nbCriteresAvecNiveau: nbCriteresAvecNiveau,
        commencee: commencee,
        incomplete: commencee && criteresHorsNote.length > 0
    };
}

/**
 * La portée d'une évaluation DÉJÀ EN BASE, depuis ses `criteres[]`, sa grille et les
 * niveaux de son échelle — c'est ce qui rend le correctif RÉTROACTIF. Les évaluations
 * écrites avant ce lot n'ont pas de `ponderationCouverte`, et c'est précisément chez
 * les utilisateurs déjà en place que le défaut vit (copies muettes des huit échelles).
 *
 * ▣ Quand la déclaration existe (`evaluation.ponderationCouverte`), elle fait foi
 * pour le NOMBRE : c'est la portée de la note telle qu'elle a été calculée et
 * écrite. Une grille ou une échelle modifiée depuis ne réécrit pas cette note ; la
 * relecture sert alors à NOMMER ce qui manque, pas à trancher.
 *
 * ⚠ Un critère algorithmique compte par son pourcentage exact (`donneesAlgorithmiques`),
 * comme au calcul. Sinon, la valeur ponctuelle du niveau choisi, par la règle unique
 * de `echelles.js` (`valeurNumeriqueDuNiveau`, #525/#527) : jamais de milieu de plage.
 *
 * ▣ #705 (décision de Grégoire, 17 sept. 2026, 13 h 43) — CHAQUE ÉVALUATION SE JUGE CONTRE
 * SA GRILLE : les critères qu'elle portait. Cette fonction parcourait la grille COURANTE ;
 * un critère ajouté après coup rendait « incomplètes » des évaluations déjà remises, et
 * leur PDF refusait de conclure (constat E-2 de l'audit du moteur, trois cas). Un critère
 * de la grille que l'évaluation ne porte pas sort donc de la référence : il est rendu à
 * part (`criteresNonCouverts`), signalé à l'enseignant·e, et n'invalide rien — même
 * règle que « conserver et signaler » (#652). Écartés par lui : garder la grille courante
 * comme référence avec une mention ; rouvrir les évaluations pour les compléter.
 * ⮕ « AJOUTÉ DEPUIS » SE MESURE QUAND C'EST POSSIBLE, ET SE PRÉSUME SINON — voir
 * `criteresAjoutesDepuis`. Un critère né AVANT l'évaluation et resté sans niveau n'est pas
 * un ajout : c'est le défaut de #674 (95 % sur 80 % de la grille), et il reste « hors note ».
 *
 * @param {Object} evaluation     - l'évaluation enregistrée
 * @param {Object} grille         - sa grille, résolue par l'appelant dans le bon trimestre
 * @param {Array}  niveauxEchelle - les niveaux BRUTS de son échelle (avec `valeurCalcul`)
 * @returns {Object} même forme que `calculerPortee`, plus `criteresNonCouverts`
 */
function porteeDepuisEvaluation(evaluation, grille, niveauxEchelle) {
    const { parId, parNom } = _criteresPortesPar(evaluation);
    const valeurs = {};
    (Array.isArray(niveauxEchelle) ? niveauxEchelle : []).forEach(n => {
        if (!n) return;
        const v = (typeof valeurNumeriqueDuNiveau === 'function')
            ? valeurNumeriqueDuNiveau(n)
            : ((n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(Number(n.valeurCalcul))) ? Number(n.valeurCalcul) : null);
        if (v !== null && !isNaN(v)) valeurs[n.code] = v;
    });
    const algo = (evaluation && evaluation.donneesAlgorithmiques) || {};

    const declaree = !!evaluation && typeof evaluation.ponderationCouverte === 'number';
    const nonCouverts = criteresAjoutesDepuis(evaluation, grille);
    const idsNonCouverts = new Set(nonCouverts.map(c => c.critereId));
    const reference = ((grille && Array.isArray(grille.criteres)) ? grille.criteres : [])
        .filter(c => c && !idsNonCouverts.has(c.id));

    const portee = calculerPortee(
        reference,
        critere => {
            // Lot 2 — même règle qu'à l'écran : les points l'emportent quand ils existent.
            const pts = _pointsAnalytiquesDe(evaluation, critere);
            if (pts !== undefined) return String(pts);
            const c = parId[critere.id] || parNom[critere.nom];
            return c ? (c.niveauSelectionne || '') : '';
        },
        (critere, niveau) => {
            const pts = _pointsAnalytiquesDe(evaluation, critere);
            if (pts !== undefined) return _pourcentageDesPoints(critere, pts);
            const a = algo[critere.id];
            if (a && a.pourcentage !== undefined) return a.pourcentage;
            return valeurs[niveau];
        }
    );

    if (declaree) {
        portee.ponderationCouverte = evaluation.ponderationCouverte;
        portee.incomplete = portee.commencee && (portee.ponderationCouverte < portee.ponderationGrille - 0.001);
    }
    portee.criteresNonCouverts = nonCouverts;
    return portee;
}

/** Les entrées de `evaluation.criteres[]`, par identifiant et par nom de critère. */
function _criteresPortesPar(evaluation) {
    const parId = {};
    const parNom = {};
    (Array.isArray(evaluation && evaluation.criteres) ? evaluation.criteres : []).forEach(c => {
        if (!c) return;
        if (c.critereId) parId[c.critereId] = c;
        if (c.critereNom) parNom[c.critereNom] = c;
    });
    return { parId: parId, parNom: parNom };
}

/**
 * La date de naissance d'un critère, lue dans son identifiant : `genererIdUnique('CR_')`
 * (main.js) écrit `CR_<millisecondes>_<compteur>_<hex>` ; avant lui, `CR<millisecondes>`
 * — c'est la forme de TOUS les critères d'A2025 (mesuré sur le pack démo le 19 sept. 2026 :
 * sans elle, deux évaluations où un critère avait été sauté passaient pour antérieures à son
 * ajout). Rend `null` quand l'identifiant ne porte pas de date (critères semés
 * `CR_COMPREHENSION`, grilles importées d'ailleurs).
 */
function _naissanceDuCritere(critere) {
    const m = /^CR_?(\d{12,14})(?:_|$)/.exec(String((critere && critere.id) || ''));
    return m ? Number(m[1]) : null;
}

/**
 * LA DATE QUI TRANCHE : celle où l'évaluation a été FAITE (`dateEvaluation`), ou `null`.
 *
 * ⚠ PAS `dateModification` (relecture croisée de Cowork, 19 sept. 2026, sur le premier jet du
 * lot). Le premier jet prenait le plus tardif des deux, en lisant `dateModification` comme « la
 * dernière écriture des critères ». C'est faux : trois gestes la posent, et l'un d'eux —
 * retoucher la rétroaction depuis le modal de Travaux (`sauvegarderRetroactionDepuisModal`,
 * travaux-ui.js) — n'écrit que `retroactionFinale`. Une évaluation du 5, un critère né le 20, un
 * mot corrigé le 22 : le critère passait « né avant », et le PDF refusait de conclure — le
 * symptôme de #705, rouvert par un geste sans rapport avec la note.
 * ⮕ `dateEvaluation` n'est écrite qu'à la CRÉATION (enregistrement, auto-save de création,
 * copie d'un jeton de reprise) : aucun geste ultérieur ne la déplace, et rien n'est stocké de
 * plus. Les deux gestes qui réécrivent les critères d'une évaluation existante n'ont pas besoin
 * d'elle : « Enregistrer » refuse une grille incomplète (le critère ajouté reçoit donc un
 * niveau, et l'évaluation le PORTE) ; l'auto-save ne touche que les brouillons, qui ne comptent
 * nulle part et que leur prochain enregistrement complétera.
 */
function _dateDeLEvaluation(evaluation) {
    const t = (evaluation && evaluation.dateEvaluation) ? new Date(evaluation.dateEvaluation).getTime() : NaN;
    return isNaN(t) ? null : t;
}

/**
 * #705 — LES CRITÈRES DE LA GRILLE AJOUTÉS APRÈS L'ÉVALUATION : ceux qu'elle ne porte pas
 * (ni entrée dans `criteres[]`, par identifiant ou par nom, ni points analytiques) ET qui
 * n'existaient pas quand elle a été faite. Le jumeau inversé de `criteresHorsGrille` (#652,
 * evaluation-chargement.js), qui rend les critères évalués que la grille ne porte plus.
 *
 * ▣ QUAND LA DATE PARLE, ELLE TRANCHE. L'identifiant d'un critère porte l'instant de sa
 * création ; l'évaluation porte sa date. Né après : ajouté depuis, à coup sûr. Né avant et
 * sans niveau : il était dans la grille ce jour-là et a été sauté — ce n'est pas un ajout.
 * ▣ QUAND ELLE NE DIT RIEN (identifiant sans date, évaluation sans date), la règle arrêtée
 * par Grégoire s'applique : les critères que l'évaluation portait font sa grille, l'absent
 * est présumé ajouté depuis. ⚠ SAUF POUR UN BROUILLON QUI DÉCLARE SA PORTÉE
 * (`verrouillee === false`, la convention de `pratique-registre.js`) : là, « pas encore de
 * niveau » est la lecture ordinaire de l'absence, et la déclaration se compare à la grille.
 * ⚠ CONSÉQUENCE ASSUMÉE de la présomption : une évaluation d'avant #674 (sans déclaration)
 * où un critère SANS DATE avait été sauté conclut, elle aussi — rien en base ne dit quelle
 * était sa grille ce jour-là.
 *
 * Un critère de pondération nulle ne peut rien déplacer : il n'est pas signalé. Une
 * évaluation VIDE ne porte rien : aucun critère n'est « ajouté depuis », elle n'est pas
 * commencée. Du TEXTE, jamais du HTML : `nom` est une donnée utilisateur (règle 1).
 */
function criteresAjoutesDepuis(evaluation, grille) {
    if (!evaluation || !grille || !Array.isArray(grille.criteres)) return [];
    const { parId, parNom } = _criteresPortesPar(evaluation);
    const porte = c => !!(parId[c.id] || parNom[c.nom]) || _pointsAnalytiquesDe(evaluation, c) !== undefined;
    if (!grille.criteres.some(c => c && porte(c))) return [];
    const dateEvaluation = _dateDeLEvaluation(evaluation);
    const brouillonDeclare = typeof evaluation.ponderationCouverte === 'number' && evaluation.verrouillee === false;
    return grille.criteres
        .filter(c => {
            if (!c || porte(c) || !((Number(c.ponderation) || 0) > 0)) return false;
            const naissance = _naissanceDuCritere(c);
            if (naissance !== null && dateEvaluation !== null) return naissance > dateEvaluation;
            return !brouillonDeclare;
        })
        .map(c => ({ critereId: c.id, nom: c.nom || c.id, ponderation: Number(c.ponderation) || 0 }));
}

/**
 * Ce qui manque, en une liste courte — « Langue (20 %) », « Démarche (M) ». Partagé par
 * l'écran, le refus d'enregistrement et l'avertissement d'export. Du TEXTE, jamais du
 * HTML : les noms de critères sont des données utilisateur (règle 1), l'appelant pose
 * par `textContent` ou échappe.
 */
function texteCriteresHorsNote(portee) {
    const hors = (portee && Array.isArray(portee.criteresHorsNote)) ? portee.criteresHorsNote : [];
    const sansNiveau = hors.filter(c => c.motif === 'sans-niveau').map(c => c.nom + ' (' + c.ponderation + ' %)');
    const sansValeur = hors.filter(c => c.motif === 'niveau-sans-valeur').map(c => c.nom + ' (' + c.niveau + ')');
    const parts = [];
    if (sansNiveau.length) parts.push('sans niveau : ' + sansNiveau.join(', '));
    if (sansValeur.length) parts.push('niveau sans valeur dans l\'échelle : ' + sansValeur.join(', '));
    return parts.join(' ; ');
}

/**
 * Ce que l'enseignant·e lit quand la portée est incomplète : ce qui manque, pourquoi
 * ça compte, et quoi faire. Une phrase par mécanisme, les deux si les deux jouent.
 * (Texte pour l'enseignant·e ; les mots que l'ÉLÈVE lit sont dans le rendu de la
 * synthèse, et c'est Grégoire qui les arrête.)
 */
function phrasesPorteeIncomplete(portee) {
    const hors = (portee && Array.isArray(portee.criteresHorsNote)) ? portee.criteresHorsNote : [];
    const sansNiveau = hors.filter(c => c.motif === 'sans-niveau');
    const sansValeur = hors.filter(c => c.motif === 'niveau-sans-valeur');
    const phrases = [];
    if (sansNiveau.length) {
        const pct = portee.ponderationGrille > 0 ? Math.round((portee.ponderationCouverte / portee.ponderationGrille) * 100) : 0;
        phrases.push('Pas de note tant qu\'un critère est sans niveau — '
            + sansNiveau.map(c => c.nom + ' (' + c.ponderation + ' %)').join(', ')
            + '. Sans ' + (sansNiveau.length > 1 ? 'eux' : 'lui') + ', la note ne porterait que sur ' + pct + ' % de la grille.');
    }
    if (sansValeur.length) {
        phrases.push('Pas de note : ' + (sansValeur.length > 1 ? 'les niveaux choisis n\'ont pas de valeur' : 'le niveau choisi n\'a pas de valeur')
            + ' dans l\'échelle — ' + sansValeur.map(c => c.nom + ' (' + c.niveau + ')').join(', ')
            + '. Donne une valeur ponctuelle à chaque niveau (Conception → Échelles de performance).');
    }
    return phrases;
}

/**
 * L'écran DIT ce qui manque, sous la note — et se tait quand rien ne manque : un
 * correctif qui avertit tout le monde n'avertit personne. Posé par `textContent`.
 */
function _ecrirePorteeEcran(portee) {
    const el = document.getElementById('porteeNote1');
    if (!el) return;
    if (!portee || !portee.incomplete) {
        el.textContent = '';
        el.classList.add('u-hide');
        return;
    }
    el.textContent = phrasesPorteeIncomplete(portee).join(' ');
    el.classList.remove('u-hide');
}

/**
 * L'instantané que la porte donne à l'auto-save pour écrire le brouillon.
 *
 * ⚠⚠ `evaluationEnCours` DÉSIGNE DEUX EMPLACEMENTS (#646, constat du 31 août) : le nom
 * nu (`let` de `config.js`, qui ne crée aucune propriété sur `window`), où
 * `niveauSelectionne` écrit les niveaux et que `calculerNote` vient de lire ; et
 * `window.evaluationEnCours`, que le flux Travaux crée à part
 * (`demarrerEvaluationDepuisFichier`) et que l'auto-save lit — sans y trouver un seul
 * critère. Il rendait donc la main sans écrire, en silence : c'est pourquoi le second
 * correctif du 2 septembre (`_autoSauvegarderCriteres(null)`) n'a rien changé à
 * l'écran de Grégoire (captures de 18 h 04). Mesuré en Playwright dans le vrai flux
 * (`tests/integration/evaluation-674-refus-conserve-le-brouillon.spec.js`) : nu ≠
 * window, critères nu [c1, c2], critères window [].
 *
 * ⮕ L'instantané prend les critères LÀ OÙ ILS SONT (les deux, le nu l'emportant) et
 * les identifiants là où l'enregistrement manuel les prend (les sélecteurs d'abord).
 * Ce n'est pas la réparation de #646 — c'est le chemin qui la contourne, pour ce
 * geste-ci. L'auto-save DÉBOUNCÉ, lui, lit toujours `window` : dans ce flux, il
 * n'écrit rien (mesuré, même banc) ; c'est #646.
 */
function _instantanePourBrouillon() {
    return etatVivantEvaluationEnCours();
}

/**
 * #699 (G-2 de l'audit du moteur, 5 septembre 2026) — L'ÉTAT VIVANT DE L'ÉVALUATION EN COURS,
 * UNE SEULE RÈGLE pour la porte (`_instantanePourBrouillon`), l'auto-save débouncé
 * (`_debouncerAutoSave`, evaluation-chargement.js) et le bilan (`genererRetroactionBilan`,
 * evaluation-retroaction.js).
 *
 * ⚠ LE NOM NU L'EMPORTE EN BLOC, pas clé par clé. À la réouverture d'une évaluation,
 * `verifierEtChargerEvaluationExistante` remplit `window.evaluationEnCours.criteres` depuis la
 * base ET rejoue les selects vers le nu : les deux portent les mêmes niveaux, puis seul le nu
 * bouge (c'est lui que `niveauSelectionne`, `pointsSaisis` et les calculs algorithmiques
 * écrivent, et lui que `calculerNote` lit). Mesuré sous WebKit le 5 septembre
 * (`tests/integration/evaluation-699-auto-save-lit-la-source-du-calcul.spec.js`) : l'auto-save,
 * qui lisait `window`, écrivait la note NEUVE (95) avec les critères ANCIENS (c3 = I), et le
 * bilan nommait encore l'ancien défi. Une fusion clé par clé (l'ancienne règle de la porte)
 * ne suffirait pas : un niveau RETIRÉ du nu (points effacés, #698) resurgirait depuis `window`.
 * Les données algorithmiques gardent le repli sur `window` quand le nu n'en a aucune : la
 * réouverture les y pose en premier, et `_majEvaluationExistanteAutoSave` refuse de toute façon
 * d'écraser la base par un objet vide.
 *
 * Ce n'est pas la réunification des deux emplacements (#646, inscrite) : c'est le chemin qui
 * fait lire à l'écriture ce que le calcul a lu, en attendant.
 */
function etatVivantEvaluationEnCours() {
    const nu = (typeof evaluationEnCours !== 'undefined' && evaluationEnCours && typeof evaluationEnCours === 'object') ? evaluationEnCours : null;
    const w = window.evaluationEnCours || {};
    const source = nu || w;
    const val = (id) => { const el = document.getElementById(id); return (el && el.value) ? el.value : ''; };
    const copie = (v) => JSON.parse(JSON.stringify(v || {}));
    const algoNu = nu && nu.donneesAlgorithmiques && Object.keys(nu.donneesAlgorithmiques).length ? nu.donneesAlgorithmiques : null;
    return {
        etudiantDA: val('selectEtudiantEval') || w.etudiantDA || (nu && nu.etudiantDA) || '',
        productionId: val('selectProduction1') || w.productionId || (nu && nu.productionId) || '',
        grilleId: val('selectGrille1') || (nu && nu.grilleId) || w.grilleId || '',
        echelleId: val('selectEchelle1') || (nu && nu.echelleId) || w.echelleId || '',
        cartoucheId: val('selectCartoucheEval') || (nu && nu.cartoucheId) || w.cartoucheId || '',
        idModification: w.idModification || (nu && nu.idModification) || undefined,
        criteres: Object.assign({}, source.criteres || {}),
        donneesAlgorithmiques: copie(algoNu || w.donneesAlgorithmiques),
        pointsAnalytiques: copie(source.pointsAnalytiques)
    };
}

/**
 * La porte de l'ENREGISTREMENT — même patron que `_validerReferencesSauv` : dit
 * pourquoi, rend `false`, et l'appelant sort. Recalcule d'abord : la portée lue est
 * celle de la note qui va être écrite (#572, la valeur calculée est la source).
 * Appelée par `sauvegarderEvaluation` et `sauvegarderEvaluationModifiee`. Jamais par
 * l'auto-save. Décision de Grégoire, 1er septembre : « un critère dont on ne tient
 * pas compte n'est pas un critère non noté — c'est une grille différente » ; une
 * couverture sous 100 % est toujours un défaut, jamais une intention.
 */
function verifierPorteeAvantSauvegarde() {
    calculerNote();
    // #697 (A-1 de l'audit du moteur, 5 septembre 2026) — UNE ÉCHELLE QUI NE SE RÉSOUT PAS N'EST
    // PAS UNE PORTÉE COMPLÈTE. `calculerNote` sort tôt et publie `noteCalculeeCourante = null` ;
    // cette porte ne testait que `portee.incomplete` : une portée NULLE passait, et les trois
    // sites d'écriture posaient leur repli `: 0` — un zéro verrouillé, sans portée, par-dessus
    // une vraie note en modification (mesuré au banc de l'audit : A1, A2 ; 84 → 0). Refus nommé,
    // et RIEN n'est écrit : un brouillon porterait le même zéro. L'échelle est nommée par son
    // identifiant, c'est tout ce qu'on a d'elle quand elle manque.
    if (window.noteCalculeeCourante === null) {
        const echelleId = (evaluationEnCours && evaluationEnCours.echelleId) || document.getElementById('selectEchelle1')?.value || '';
        const details = echelleId
            ? 'L\'échelle « ' + echelleId + ' » de cette évaluation n\'existe plus dans ce trimestre : aucune note ne peut être calculée. Choisis une échelle de performance, puis verrouille.'
            : 'Aucune échelle de performance n\'est choisie : aucune note ne peut être calculée. Choisis une échelle, puis verrouille.';
        if (typeof notifications !== 'undefined' && notifications && typeof notifications.erreur === 'function') {
            notifications.erreur('Échelle introuvable', details);
        }
        console.warn('[Évaluation] #697 enregistrement refusé — échelle non résolue : ' + (echelleId || '(aucune)'));
        return false;
    }
    const portee = window.porteeCalculeeCourante;
    if (!portee || !portee.incomplete) return true;
    // ⚠⚠ LE REFUS NE JETTE RIEN. `sauvegarderEvaluation` ANNULE l'auto-save en attente
    // avant d'arriver ici (« la sauvegarde manuelle prend le relais », fix #109) : tant
    // que la sauvegarde manuelle écrivait toujours, rien ne se perdait. Un refus qui
    // n'écrit rien laissait la copie sans AUCUNE évaluation en base — mesuré par
    // Grégoire le 2 septembre 2026 à 17 h 53 : badge « Importé », export Léa « aucune
    // évaluation trouvée ». Le brouillon est donc écrit ICI, tout de suite, exactement
    // comme l'auto-save l'aurait fait 1,5 s plus tard : la note AVEC sa portée, non
    // verrouillée. La copie reste exportable, et son PDF dit qu'il ne conclut pas.
    if (typeof window._autoSauvegarderCriteres === 'function') {
        const instantane = _instantanePourBrouillon();
        window._autoSauvegarderCriteres(instantane);
        // L'auto-save pose `idModification` sur ce qu'il reçoit : le rendre aux deux
        // emplacements, pour que le prochain Enregistrer modifie ce brouillon-là.
        if (instantane.idModification) {
            if (window.evaluationEnCours) window.evaluationEnCours.idModification = instantane.idModification;
            if (evaluationEnCours) evaluationEnCours.idModification = instantane.idModification;
        }
    }
    const details = phrasesPorteeIncomplete(portee).join(' ')
        + ' Ton travail est enregistré, mais l\'évaluation n\'est pas verrouillée : complète-la, puis verrouille.';   // lot C (D1)
    if (typeof notifications !== 'undefined' && notifications && typeof notifications.erreur === 'function') {
        notifications.erreur('Évaluation incomplète', details);
    }
    console.warn('[Évaluation] #674 enregistrement refusé — ' + texteCriteresHorsNote(portee));
    return false;
}

/**
 * Lot 2 (4 sept. 2026) — LES POINTS D'UN CRITÈRE ANALYTIQUE, pour les DEUX lecteurs.
 * Les points vivent dans `pointsAnalytiques[critereId]` — sur l'évaluation en cours à
 * l'écran comme sur l'évaluation enregistrée en base — sous leur nom, jamais dans
 * `donneesAlgorithmiques` : c'est la donnée vraie, telle que saisie. Le pourcentage se
 * dérive, `points / pondération × 100`, et entre dans la boucle de `calculerNote`
 * comme n'importe quelle valeur en pourcentage (24 sur 30 → 80 %). Le maximum EST le
 * poids (décision de Grégoire) ; un critère de pondération nulle ne rend rien.
 * ⚠ Les points l'emportent quand ils existent ; sans eux, un critère analytique se lit
 * exactement comme avant (le niveau qu'il porterait encore d'une évaluation faite
 * quand il était holistique). Même règle à l'écran et en base : c'est ce qui empêche
 * un bilan de rendre « -- » sur une copie que l'écran note à 80 %.
 */
function _pointsAnalytiquesDe(source, critere) {
    if (!critere || critere.type !== 'analytique' || !source || !source.pointsAnalytiques) return undefined;
    const pts = source.pointsAnalytiques[critere.id];
    return (typeof pts === 'number' && !isNaN(pts)) ? pts : undefined;
}

function _pourcentageDesPoints(critere, points) {
    const ponderation = Number(critere && critere.ponderation) || 0;
    if (ponderation <= 0) return undefined;
    return points / ponderation * 100;
}

/**
 * Lot 3 (4 sept. 2026) — LE CHIFFRE TROUVE SON NIVEAU. Le pourcentage des points d'un
 * critère analytique tombe dans un niveau par les BORNES de l'échelle de l'évaluation —
 * la règle du système, énoncée dans `echelles.js` (« note chiffrée → CODE :
 * `pourcentage >= n.min && pourcentage <= n.max` »), celle du niveau général et du
 * critère algorithmique (`_determinerNiveauIDMEAlgo`, et ses deux jumeaux en ligne).
 * Comme pour l'algorithmique, le niveau « 0 » (non recevable, réservé à l'intégrité
 * académique) ne se déduit jamais d'un chiffre.
 * Ce niveau ouvre la cartouche (clé `critereId_niveau`) et fait entrer le critère dans
 * `evaluation.criteres[]` ; il n'entre PAS dans la note, que les points font seuls
 * (`_valeurCritereEnCours`, `porteeDepuisEvaluation`).
 * Rend `undefined` sans points ou sans pondération.
 * ⮕ #701 (19 sept. 2026) : la recherche passe par la règle unique `niveauDuPourcentage` —
 * pourcentage arrondi à l'entier, et niveau le plus proche sur une échelle aux bornes
 * espacées. Avant, un pourcentage tombé dans un trou laissait le critère sans niveau,
 * donc sans cartouche ; la note, elle, n'a jamais dépendu de ce niveau.
 */
function niveauDeduitDesPoints(critere, points, niveaux) {
    const pct = (typeof points === 'number' && !isNaN(points)) ? _pourcentageDesPoints(critere, points) : undefined;
    if (pct === undefined || !Array.isArray(niveaux)) return undefined;
    return niveauDuPourcentage(pct, niveaux, { sansNiveauZero: true });
}

/**
 * Lot 3 — LE NIVEAU DÉDUIT ENTRE DANS L'ÉVALUATION EN COURS sous le même nom que les
 * niveaux choisis au menu, `evaluationEnCours.criteres[critereId]` : c'est ce qui le
 * rend visible à tout ce qui lit ce tableau SANS qu'aucun lecteur change — la
 * cartouche (`genererRetroaction`), les trois collecteurs de `criteres[]`
 * (enregistrement, modification, auto-save), le bilan.
 * Appelée par `calculerNote`, le seul endroit où l'échelle résolue et les points se
 * rencontrent dans TOUS les flux (frappe, réouverture, changement d'échelle, de grille
 * ou de cartouche) : une règle, pas un flux oublié.
 * ⚠ Sans points, rien n'est écrit ni retiré : un critère analytique sans points se lit
 * comme avant (lot 2). Avec des points mais sans niveau déductible, l'entrée est
 * RETIRÉE : un niveau périmé n'ouvre pas une cartouche qui ne lui correspond plus.
 */
function _deduireNiveauxAnalytiques(grille, niveaux) {
    if (!grille || !Array.isArray(grille.criteres) || !evaluationEnCours) return;
    if (!evaluationEnCours.criteres) evaluationEnCours.criteres = {};
    grille.criteres.forEach(critere => {
        const pts = _pointsAnalytiquesDe(evaluationEnCours, critere);
        if (pts === undefined) return;
        const code = niveauDeduitDesPoints(critere, pts, niveaux);
        if (code) evaluationEnCours.criteres[critere.id] = code;
        else delete evaluationEnCours.criteres[critere.id];
    });
}

/**
 * Ce que `calculerPortee` reçoit comme « niveau » pour un critère de l'écran : pour un
 * critère analytique à points, les points eux-mêmes — c'est aussi ce que la ligne à
 * copier-coller des critères montre pour lui.
 * ⮕ Lot 3, décidé : la ligne à copier GARDE LES POINTS (la donnée saisie, celle qu'un
 * tableur reçoit) ; le niveau déduit, lui, vit dans `evaluationEnCours.criteres` et en
 * base (`_deduireNiveauxAnalytiques`). Les points restent ce qui fait compter le critère
 * dans la portée, avec ou sans niveau déductible.
 */
function _niveauCritereEnCours(critere) {
    const pts = _pointsAnalytiquesDe(evaluationEnCours, critere);
    return (pts !== undefined) ? String(pts) : evaluationEnCours.criteres[critere.id];
}

/**
 * La valeur qui entre dans la note pour un critère de l'écran — extraite telle quelle
 * du corps historique de `calculerNote` (#674), pour que la même résolution serve au
 * calcul ET à la portée. Pour un critère algorithmique, le pourcentage exact calculé
 * (ex. 61,5 % au lieu des 32 % du niveau I) SAUF si un niveau a été choisi à la main
 * (jeton de reprise ciblée) ; sinon la valeur ponctuelle du niveau, ou `undefined`.
 */
function _valeurCritereEnCours(critere, niveau, valeurs) {
    // Lot 2 — un critère analytique à points vaut son pourcentage de points.
    const pts = _pointsAnalytiquesDe(evaluationEnCours, critere);
    if (pts !== undefined) return _pourcentageDesPoints(critere, pts);
    // Vérifier si le select du critère est en mode manuel (valeur non vide)
    const selectCritere = document.getElementById(`eval_${critere.id}`);
    const niveauManuel = selectCritere?.value; // vide si "-- Utiliser le niveau calculé --"
    const algo = evaluationEnCours.donneesAlgorithmiques && evaluationEnCours.donneesAlgorithmiques[critere.id];
    if (algo && algo.pourcentage !== undefined && !niveauManuel) {
        return algo.pourcentage; // algorithme exact
    }
    return valeurs[niveau]; // niveau par défaut, ou manuel (jeton)
}

/**
 * Calcule la note finale basée sur les critères évalués
 *
 * FONCTIONNEMENT:
 * 1. Récupère tous les niveaux sélectionnés
 * 2. Calcule la moyenne pondérée en pourcentage
 * 3. Détermine le niveau global
 * 4. Met à jour l'affichage
 */
/**
 * #697 — L'ÉCHELLE DE L'ÉVALUATION, RÉSOLUE PAR UNE SEULE FONCTION. La résolution vivait dans le
 * corps de `calculerNote` (échelle d'une pratique configurable `pratique-<id>`, ou échelle du
 * trimestre). Extraite telle quelle pour que la porte de l'enregistrement et l'auto-save de
 * création (`_autoSauvegarderCriteres`) posent la MÊME question que le calcul : « cette échelle
 * existe-t-elle ici ? ». Rend l'échelle, ou `null` — jamais un objet qui aurait l'air d'une échelle.
 */
function resoudreEchelleEvaluation(echelleId) {
    if (!echelleId) return null;
    const id = String(echelleId);
    if (id.startsWith('pratique-')) {
        const pratiqueId = id.replace('pratique-', '');
        const pratiquesConfigurables = db.getSync(cle('pratiquesConfigurables'), null) || [];
        const pratiqueData = pratiquesConfigurables.find(p => p.id === pratiqueId);
        if (pratiqueData && pratiqueData.config && pratiqueData.config.echelle) {
            return {
                id: id,
                niveaux: pratiqueData.config.echelle.niveaux || [],
                type: pratiqueData.config.echelle.type || 'niveaux'
            };
        }
        return null;
    }
    const echelles = db.getSync(cle('echellesTemplates'), []);
    return echelles.find(e => e.id === id) || null;
}

/**
 * #941 lot S1 — la case « Niveau » de la note finale n'a rien à dire pour une grille
 * entièrement en points : elle se masque, la note chiffrée reste seule.
 */
function _montrerNiveauEcran(montrer) {
    const el = document.getElementById('niveauProduction1');
    const bloc = el ? el.closest('.u-text-right') : null;
    if (bloc) bloc.classList.toggle('u-hide', !montrer);
}

function calculerNote() {
    if (!evaluationEnCours) return;
    window.porteeCalculeeCourante = null;   // #674 — inconnue tant qu'elle n'est pas calculée

    const grilleId = evaluationEnCours.grilleId;
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    // NOUVEAU (Beta 92): Support échelles de pratiques configurables — #697 : par `resoudreEchelleEvaluation`.
    const echelleId = evaluationEnCours.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelleSelectionnee = resoudreEchelleEvaluation(echelleId);

    // #941 lot S1 (D1, 24 sept. 2026) — UNE GRILLE ENTIÈREMENT EN POINTS SE NOTE SANS ÉCHELLE.
    // Sa note ne dépend que des points (`_valeurCritereEnCours`) : l'échelle ne donnait qu'un
    // nom de niveau, que l'élève ne lit plus (décision A). Une échelle choisie exprès sert
    // encore en coulisse (niveau déduit → cartouche) ; sans elle, la note se calcule quand même.
    // Le chiffre est le même avec ou sans échelle : aucune note enregistrée ne change.
    const enPoints = typeof grilleEntierementEnPoints === 'function' && grilleEntierementEnPoints(grille);
    _montrerNiveauEcran(!enPoints);

    // SÉCURITÉ: Vérifier que l'échelle existe. Si non résolue (consultation d'un
    // trimestre archivé sans copie d'échelle = pilote A25 pas posé, ou échelle pas
    // encore sélectionnée), on dégrade SILENCIEUSEMENT (note « -- ») — comme le cas
    // « grille manquante » plus haut. Le problème de fond est déjà signalé une fois par
    // l'avertissement « Grille introuvable » ; crier ❌ à chaque recalcul en cascade au
    // chargement ne fait que polluer la console (4× à l'ouverture d'une éval A25). (#348-résiduel)
    const echelleResolue = !!(echelleSelectionnee && echelleSelectionnee.niveaux && echelleSelectionnee.niveaux.length > 0);
    if (!echelleResolue && !enPoints) {
        const elNote = document.getElementById('noteProduction1');
        const elNiveau = document.getElementById('niveauProduction1');
        if (elNote) elNote.textContent = '--';
        if (elNiveau) elNiveau.textContent = '--';
        window.noteCalculeeCourante = null;   // #572 — pas de note calculable
        _ecrirePorteeEcran(null);             // #674 — rien à nommer : l'échelle manque, l'écran le dit déjà
        return;
    }

    const niveaux = echelleResolue ? echelleSelectionnee.niveaux : [];

    // Utiliser les valeurs ponctuelles configurées par l'utilisateur
    const valeurs = {};
    // #525 — UNE SEULE RÈGLE, celle de `echelles.js`. Ce site repliait la valeur
    // ponctuelle sur le milieu de plage par un OU-logique : celui-ci traitait une
    // valeur ponctuelle de ZÉRO comme absente et la remplaçait par le milieu. Sur un
    // niveau 0 dont la plage irait de 0 à 59, la note valait 29,5 au lieu de 0.
    // le module Consolidation (retiré) appliquait déjà la bonne règle — deux lecteurs, deux
    // résultats pour la même échelle.
    niveaux.forEach(niveau => {
        const valeur = (typeof valeurNumeriqueDuNiveau === 'function')
            ? valeurNumeriqueDuNiveau(niveau)
            : (niveau.valeurCalcul != null ? Number(niveau.valeurCalcul) : (Number(niveau.min) + Number(niveau.max)) / 2);
        // ⚠ `null` = « je ne sais pas calculer » (ni valeur ponctuelle, ni bornes
        // exploitables). On ne pose PAS 0 à la place : un zéro inventé se
        // propagerait dans la note sans que rien ne le distingue d'un vrai zéro.
        if (valeur !== null && !isNaN(valeur)) valeurs[niveau.code] = valeur;
    });

    // #674 — QUELS CRITÈRES COMPTENT : une seule règle (`calculerPortee`), la même
    // qui relit les évaluations déjà en base. La boucle historique décidait ici, en
    // silence, quels critères entraient dans le total ; elle ne fait plus que sommer.
    // Lot 3 — le chiffre trouve son niveau AVANT que la portée ne lise l'évaluation.
    _deduireNiveauxAnalytiques(grille, niveaux);

    const portee = calculerPortee(
        grille.criteres,
        critere => _niveauCritereEnCours(critere),
        (critere, niveau) => _valeurCritereEnCours(critere, niveau, valeurs)
    );

    let noteTotal = 0;
    let ponderationTotal = 0;
    const notesCriteres = []; // Pour collecter les notes à copier-coller

    portee.criteresComptes.forEach(({ critere, niveau, valeur }) => {
        const ponderation = (critere.ponderation || 0) / 100;
        noteTotal += valeur * ponderation;
        ponderationTotal += ponderation;
        // Collecter le niveau IDME du critère pour l'export (ex: M, D, E, I)
        notesCriteres.push(niveau);
    });

    let pourcentage = 0;
    let niveauGlobal = '--';

    if (ponderationTotal > 0) {
        // La moyenne pondérée est directement en pourcentage
        pourcentage = noteTotal / ponderationTotal;

        // APPLIQUER LE PLAFOND (CEILING) si c'est une reprise ciblée
        if (evaluationEnCours.plafondNoteCiblee) {
            const niveauPlafond = niveaux.find(n => n.code === evaluationEnCours.plafondNoteCiblee);
            if (niveauPlafond && pourcentage > niveauPlafond.max) {
                pourcentage = niveauPlafond.max;
            }
        }

        // #701 — le niveau global par la règle unique : pourcentage arrondi à l'entier,
        // puis niveau le plus proche s'il reste un trou. Le repli vivait ici, seul.
        niveauGlobal = niveauDuPourcentage(pourcentage, niveaux) || '--';

    }
    // #941 lot S1 — en points, le niveau général ne s'AFFICHE nulle part (case masquée ici,
    // `niveauFinalAffichable` ailleurs). Il reste CALCULÉ et écrit quand une échelle est là
    // (décision A : « en coulisse ») : une pratique qui convertit les niveaux en note
    // (`calculerParConversionNiveaux`) compte une copie re-enregistrée comme avant. Sans
    // échelle, `niveauDuPourcentage` n'a rien à rendre : « -- ».

    // #674 — L'ÉCRAN RETIENT LA CONCLUSION QUAND LA PORTÉE EST INCOMPLÈTE, ET DIT
    // POURQUOI. Un « 95,0 % » calculé sur 80 % de la grille n'est pas une note sur
    // 100 : il ne s'affiche plus comme telle. Le niveau global est retenu avec elle.
    if (portee.incomplete) niveauGlobal = '--';

    // #572 — LA VALEUR CALCULÉE EST LA SOURCE, l'écran n'en est que l'affichage.
    // La sauvegarde relisait `parseFloat(textContent)` : un rendu arrondi, ou
    // tronqué par un affichage différé (#321), redevenait la note stockée.
    // #674 — et la valeur voyage AVEC sa portée : les quatre chemins d'écriture lisent
    // les deux ensemble. « 95 sur 80 % » est une donnée honnête que chaque
    // consommateur peut juger ; « 95 » seul ne l'était pas.
    window.noteCalculeeCourante = pourcentage;
    window.porteeCalculeeCourante = portee;

    // Mettre à jour l'affichage
    document.getElementById('noteProduction1').textContent = portee.incomplete ? '--' : (pourcentage.toFixed(1) + ' %');
    document.getElementById('niveauProduction1').textContent = niveauGlobal;
    _ecrirePorteeEcran(portee);

    // Afficher les notes des critères pour copier-coller
    const criteresCopierElement = document.getElementById('criteresCopier');
    if (criteresCopierElement) {
        if (notesCriteres.length > 0) {
            criteresCopierElement.textContent = notesCriteres.join('\t');
        } else {
            criteresCopierElement.textContent = '--';
        }
    }

    // Colorer l'encadré de la note finale selon le niveau
    const noteContainer = document.getElementById('noteProduction1').closest('div[style*="background"]');
    if (noteContainer && niveauGlobal !== '--' && !enPoints) {   // #941 lot S1 : pas la couleur d'un niveau non affiché
        const couleur = obtenirCouleurNiveau(niveauGlobal);
        if (couleur && couleur !== 'transparent') {
            noteContainer.style.background = couleur + '20'; // 20% opacité
            noteContainer.style.borderLeft = `4px solid ${couleur}`;
            noteContainer.style.transition = 'all 0.3s ease';
        }
    } else if (noteContainer) {
        // Réinitialiser si pas de niveau
        noteContainer.style.background = 'var(--gris-tres-pale)';
        noteContainer.style.borderLeft = '4px solid var(--bordure-claire)';
    }

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.noteMoyenne = pourcentage;
    evaluationEnCours.niveauFinal = niveauGlobal;
}

/* ===============================
   🎨 GESTION DES COULEURS
   =============================== */

/**
 * Récupère la couleur associée à un niveau de performance
 *
 * PARAMÈTRES:
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, 0, etc.)
 *
 * RETOUR:
 * @returns {string} - Couleur CSS (var(--...) ou #...)
 */
function obtenirCouleurNiveau(codeNiveau) {
    if (!codeNiveau) return 'transparent';

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) {
        return 'transparent';
    }

    const niveau = echelleSelectionnee.niveaux.find(n => n.code === codeNiveau);

    return niveau ? niveau.couleur : 'transparent';
}

/**
 * Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
 * force un dernier recalcul algorithmique pour chaque critère algo de la grille
 * avant la sauvegarde. Garantit que `evaluationEnCours.donneesAlgorithmiques`
 * reflète les valeurs DOM courantes — défense contre les états désynchronisés
 * (race condition au chargement, re-render, focus/blur, navigation entre élèves).
 *
 * Renforcement v3.1 (24 mai 2026) : déclenche d'abord `mettreAJourCompteursErreurs`
 * qui propage le comptage live des tampons errfr_* de l'annotation vers le champ
 * eval_erreurs_*. Sans ça, si l'utilisateur clique Sauvegarder dans les ~2 secondes
 * après navigation (avant que le setTimeout 2000ms d'afficherPalettesEval ne fire),
 * le DOM affiche encore la valeur DB héritée d'avant — et la sauvegarde la persiste,
 * propageant la corruption. Bug historique de toute la session a2025.
 *
 * À appeler depuis sauvegarderEvaluation et sauvegarderEvaluationModifiee,
 * AVANT la collecte des critères.
 */
function _forcerRecalculAlgorithmiqueAvantSauvegarde(grille) {
    if (!grille || !grille.criteres) return;

    // v3.1 : propager le comptage live des tampons errfr_* AVANT le recalcul
    // (sinon le DOM peut afficher une valeur stale héritée du chargement DB).
    if (typeof travauxOutils !== 'undefined'
        && typeof travauxOutils.mettreAJourCompteursErreurs === 'function') {
        try { travauxOutils.mettreAJourCompteursErreurs(); }
        catch (e) { console.warn('[_forcerRecalculAlgorithmiqueAvantSauvegarde] mettreAJour échec', e); }
    }

    grille.criteres.forEach(function(critere) {
        if (critere.type !== 'algorithmique') return;
        const ponderation = critere.ponderation || 20;
        const facteur = critere.facteurNormalisation || 500;
        const aCategories = critere.sousCriteres
            && Array.isArray(critere.sousCriteres)
            && critere.sousCriteres.length > 0;
        try {
            if (aCategories && typeof calculerNoteAlgorithmiqueAvecCategories === 'function') {
                // Guard : si le DOM input n'existe pas (hors mode Évaluer), skip
                if (!document.getElementById('eval_categories_' + critere.id)) return;
                calculerNoteAlgorithmiqueAvecCategories(critere.id, ponderation, facteur, critere.id);
            } else if (typeof calculerNoteAlgorithmiqueSimple === 'function') {
                if (!document.getElementById('eval_erreurs_' + critere.id)) return;
                calculerNoteAlgorithmiqueSimple(critere.id, ponderation, facteur);
            }
        } catch (e) {
            console.warn('[_forcerRecalculAlgorithmiqueAvantSauvegarde] échec critère', critere.id, e);
        }
    });
}

// =====================================================================
// Exports window.X (5) — voir en-tête pour détails
// =====================================================================

// Préservés depuis bloc principal evaluation.js (session A) :
window.calculerNoteAlgorithmiqueAvecCategories = calculerNoteAlgorithmiqueAvecCategories;
window.calculerNoteAlgorithmiqueSimple = calculerNoteAlgorithmiqueSimple;

// Promotions §5.6 nouvelles (session B) :
window.calculerNote = calculerNote;
// Lot 2 — exposés pour les bancs : la même règle sert l'écran et la base.
window._pointsAnalytiquesDe = _pointsAnalytiquesDe;
window._pourcentageDesPoints = _pourcentageDesPoints;
window.niveauDeduitDesPoints = niveauDeduitDesPoints;   // lot 3 — le chiffre trouve son niveau
window.niveauDuPourcentage = niveauDuPourcentage;       // #701 — la règle unique, éprouvée par sa sentinelle
window.obtenirCouleurNiveau = obtenirCouleurNiveau;

// Restauration fix #110 v3 (24 mai 2026) — appelé par sauvegarderEvaluation
// (evaluation-sauvegarde.js) et sauvegarderEvaluationModifiee (evaluation.js) :
window._forcerRecalculAlgorithmiqueAvantSauvegarde = _forcerRecalculAlgorithmiqueAvantSauvegarde;

// #674 — la portée de la note (énoncé 5). `calculerPortee` est la règle unique ;
// `porteeDepuisEvaluation` la relit sur ce qui est déjà en base (PDF de l'élève,
// `synthese-retroaction-data.js`) ; `verifierPorteeAvantSauvegarde` est la porte des
// deux enregistrements manuels ; `texteCriteresHorsNote` nomme ce qui manque à
// l'export. Sentinelle : `tests/unit/sentinelle-674-*.test.js`.
window.calculerPortee = calculerPortee;
window.porteeDepuisEvaluation = porteeDepuisEvaluation;
window.criteresAjoutesDepuis = criteresAjoutesDepuis;   // #705 — lue par evaluation-chargement.js (le signalement à l'écran)
window.verifierPorteeAvantSauvegarde = verifierPorteeAvantSauvegarde;
window.texteCriteresHorsNote = texteCriteresHorsNote;
// #697 — la même résolution d'échelle pour le calcul, la porte et l'auto-save de création.
window.resoudreEchelleEvaluation = resoudreEchelleEvaluation;
// #699 — l'état vivant (le nu l'emporte) pour l'auto-save débouncé et le bilan.
window.etatVivantEvaluationEnCours = etatVivantEvaluationEnCours;

})();
