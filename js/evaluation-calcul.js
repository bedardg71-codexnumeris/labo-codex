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

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        // Exclure le niveau "0" (Non recevable) — réservé à l'intégrité académique
        const niveau = echelleSelectionnee.niveaux.find(n => {
            if (n.code === '0' || n.code === 0) return false;
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Sauvegarder dans evaluationEnCours
    evaluationEnCours.criteres[critereId] = niveauIDME;

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
 * voisin immédiat (Boucher a reçu le 59 d'Allache, Bourgeois le 11 de Dumont,
 * Nanthavong le 8 de Patenaude). Des PDF faux étaient déjà remis aux élèves.
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
    evaluationEnCours.donneesAlgorithmiques[critereId] = Object.assign(
        evaluationEnCours.donneesAlgorithmiques[critereId] || {},
        { erreurs: erreurs, mots: mots }
    );
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

function _critereFormulePourCalcul(critereId, facteurRecu) {
    return _critereDeGrille(critereId) || { facteurNormalisation: facteurRecu };
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

function _determinerNiveauIDMEAlgo(pctFinal) {
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux) return '--';
    const niveau = echelleSelectionnee.niveaux.find(n => {
        if (n.code === '0' || n.code === 0) return false;
        return pctFinal >= n.min && pctFinal <= n.max;
    });
    return niveau ? niveau.code : '--';
}

function _appliquerResultatsAlgoCategories(critereId, noteCalculee, pctFinal, niveauIDME) {
    const noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    const pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    const nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);
    evaluationEnCours.criteres[critereId] = niveauIDME;
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
    const critereEnonces = _critereDeGrille(critereId);
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

    if (mots === 0 || totalErreurs === 0) {
        _resetAffichageAlgoCategories(critereId);
        // Fix #110 v3 (restauré 24 mai 2026, perdu lors du refactoring du 20 mai) :
        // préserver mots+codes+totalErreurs même quand le calcul ne tourne pas,
        // sinon la sauvegarde persiste l'ancienne valeur de donneesAlgorithmiques.
        if (!evaluationEnCours.donneesAlgorithmiques) evaluationEnCours.donneesAlgorithmiques = {};
        evaluationEnCours.donneesAlgorithmiques[critereId] = Object.assign(
            evaluationEnCours.donneesAlgorithmiques[critereId] || {},
            { codes: codesSousCriteres, mots: mots, totalErreurs: totalErreurs }
        );
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

    if (codeDominant === null) {
        document.getElementById(`cat_dominante_${critereId}`).textContent = '--';
        // ⚠ #673 — BRANCHE INATTEIGNABLE, MESURÉE le 1er septembre 2026, PAS retirée.
        // `_trouverCodeDominant` ne rend `null` que sur une liste VIDE ; une liste vide
        // donne `totalErreurs === 0`, déjà intercepté par la garde du dessus, qui sort
        // par `return`. Aucun chemin n'arrive donc ici.
        // ⮕ Ce qui explique qu'un écrasement inconditionnel du div ait pu survivre ici
        // sans jamais détruire le texte de personne : il ne s'exécute pas.
        // ⛔ NE PAS retirer ce bloc à la légère : sa chaîne est la SEULE occurrence de la
        // troisième amorce dans `js/`, et la sentinelle statique de #672 l'exige présente.
        // La retirer demande de traiter les deux ensemble — et de garder la chaîne dans la
        // liste de reconnaissance, puisque des évaluations ENREGISTRÉES la portent encore.
        const commDiv = document.getElementById(`comm_${critereId}`);
        if (commDiv) commDiv.textContent = 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)';
    } else {
        const scDominant = sousCriteres.find(s => s.code === codeDominant);
        const nomDominant = scDominant ? scDominant.nom : `Code ${codeDominant}`;
        document.getElementById(`cat_dominante_${critereId}`).textContent =
            `${nomDominant} (${maxFreq} occurrence${maxFreq > 1 ? 's' : ''} du code ${codeDominant})`;

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

    // Déterminer le niveau IDME selon l'échelle
    const echelleId = evaluationEnCours?.echelleId || document.getElementById('selectEchelle1')?.value;
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleSelectionnee = echelles.find(e => e.id === echelleId);

    let niveauIDME = '--';
    if (echelleSelectionnee && echelleSelectionnee.niveaux) {
        // Exclure le niveau "0" (Non recevable) — réservé à l'intégrité académique
        const niveau = echelleSelectionnee.niveaux.find(n => {
            if (n.code === '0' || n.code === 0) return false;
            return pctFinal >= n.min && pctFinal <= n.max;
        });
        niveauIDME = niveau ? niveau.code : '--';
    }

    // Afficher les résultats (guards si éléments pas encore dans le DOM)
    var noteAlgoEl = document.getElementById(`note_algo_${critereId}`);
    var pctAlgoEl = document.getElementById(`pct_algo_${critereId}`);
    var nivAlgoEl = document.getElementById(`niveau_algo_${critereId}`);
    if (noteAlgoEl) noteAlgoEl.textContent = noteCalculee.toFixed(2);
    if (pctAlgoEl) pctAlgoEl.textContent = pctFinal.toFixed(1);
    if (nivAlgoEl) nivAlgoEl.textContent = niveauIDME;
    _appliquerStyleResultatAlgo(critereId, niveauIDME);

    // Construire la rétroaction générique simple
    // #581 — même registre que le mode catégories ci-dessus : la phrase est
    // celle que le gabarit de la grille porte, et elle ne nomme aucune
    // discipline que son auteur·e n'a pas écrite.
    let retroactionGenerique = window.enoncesAlgo.enonce(
        _critereDeGrille(critereId), 'decompte', { erreurs: erreurs, mots: mots });

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

    // Sauvegarder le critère dans evaluationEnCours.criteres avec le niveau
    evaluationEnCours.criteres[critereId] = niveauIDME;

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
 * @param {Object} evaluation     - l'évaluation enregistrée
 * @param {Object} grille         - sa grille, résolue par l'appelant dans le bon trimestre
 * @param {Array}  niveauxEchelle - les niveaux BRUTS de son échelle (avec `valeurCalcul`)
 * @returns {Object} même forme que `calculerPortee`
 */
function porteeDepuisEvaluation(evaluation, grille, niveauxEchelle) {
    const parId = {};
    const parNom = {};
    (Array.isArray(evaluation && evaluation.criteres) ? evaluation.criteres : []).forEach(c => {
        if (!c) return;
        if (c.critereId) parId[c.critereId] = c;
        if (c.critereNom) parNom[c.critereNom] = c;
    });
    const valeurs = {};
    (Array.isArray(niveauxEchelle) ? niveauxEchelle : []).forEach(n => {
        if (!n) return;
        const v = (typeof valeurNumeriqueDuNiveau === 'function')
            ? valeurNumeriqueDuNiveau(n)
            : ((n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(Number(n.valeurCalcul))) ? Number(n.valeurCalcul) : null);
        if (v !== null && !isNaN(v)) valeurs[n.code] = v;
    });
    const algo = (evaluation && evaluation.donneesAlgorithmiques) || {};

    const portee = calculerPortee(
        (grille && Array.isArray(grille.criteres)) ? grille.criteres : [],
        critere => {
            const c = parId[critere.id] || parNom[critere.nom];
            return c ? (c.niveauSelectionne || '') : '';
        },
        (critere, niveau) => {
            const a = algo[critere.id];
            if (a && a.pourcentage !== undefined) return a.pourcentage;
            return valeurs[niveau];
        }
    );

    if (evaluation && typeof evaluation.ponderationCouverte === 'number') {
        portee.ponderationCouverte = evaluation.ponderationCouverte;
        portee.incomplete = portee.commencee && (portee.ponderationCouverte < portee.ponderationGrille - 0.001);
    }
    return portee;
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
        window._autoSauvegarderCriteres(null);
    }
    const details = phrasesPorteeIncomplete(portee).join(' ')
        + ' Ton travail est conservé en brouillon : complète l\'évaluation, puis enregistre.';
    if (typeof notifications !== 'undefined' && notifications && typeof notifications.erreur === 'function') {
        notifications.erreur('Évaluation incomplète', details);
    }
    console.warn('[Évaluation] #674 enregistrement refusé — ' + texteCriteresHorsNote(portee));
    return false;
}

/**
 * La valeur qui entre dans la note pour un critère de l'écran — extraite telle quelle
 * du corps historique de `calculerNote` (#674), pour que la même résolution serve au
 * calcul ET à la portée. Pour un critère algorithmique, le pourcentage exact calculé
 * (ex. 61,5 % au lieu des 32 % du niveau I) SAUF si un niveau a été choisi à la main
 * (jeton de reprise ciblée) ; sinon la valeur ponctuelle du niveau, ou `undefined`.
 */
function _valeurCritereEnCours(critere, niveau, valeurs) {
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
function calculerNote() {
    if (!evaluationEnCours) return;
    window.porteeCalculeeCourante = null;   // #674 — inconnue tant qu'elle n'est pas calculée

    const grilleId = evaluationEnCours.grilleId;
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) return;

    // LECTURE DE L'ÉCHELLE SÉLECTIONNÉE (pas l'ancienne niveauxEchelle)
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

    // SÉCURITÉ: Vérifier que l'échelle existe. Si non résolue (consultation d'un
    // trimestre archivé sans copie d'échelle = pilote A25 pas posé, ou échelle pas
    // encore sélectionnée), on dégrade SILENCIEUSEMENT (note « -- ») — comme le cas
    // « grille manquante » plus haut. Le problème de fond est déjà signalé une fois par
    // l'avertissement « Grille introuvable » ; crier ❌ à chaque recalcul en cascade au
    // chargement ne fait que polluer la console (4× à l'ouverture d'une éval A25). (#348-résiduel)
    if (!echelleSelectionnee || !echelleSelectionnee.niveaux || echelleSelectionnee.niveaux.length === 0) {
        const elNote = document.getElementById('noteProduction1');
        const elNiveau = document.getElementById('niveauProduction1');
        if (elNote) elNote.textContent = '--';
        if (elNiveau) elNiveau.textContent = '--';
        window.noteCalculeeCourante = null;   // #572 — pas de note calculable
        _ecrirePorteeEcran(null);             // #674 — rien à nommer : l'échelle manque, l'écran le dit déjà
        return;
    }

    const niveaux = echelleSelectionnee.niveaux;

    // Utiliser les valeurs ponctuelles configurées par l'utilisateur
    const valeurs = {};
    // #525 — UNE SEULE RÈGLE, celle de `echelles.js`. Ce site repliait la valeur
    // ponctuelle sur le milieu de plage par un OU-logique : celui-ci traitait une
    // valeur ponctuelle de ZÉRO comme absente et la remplaçait par le milieu. Sur un
    // niveau 0 dont la plage irait de 0 à 59, la note valait 29,5 au lieu de 0.
    // `consolidation.js` appliquait déjà la bonne règle — deux lecteurs, deux
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
    const portee = calculerPortee(
        grille.criteres,
        critere => evaluationEnCours.criteres[critere.id],
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

        // Déterminer le niveau global selon l'échelle
        const niveauFinal = niveaux.find(n => {
            return pourcentage >= n.min && pourcentage <= n.max;
        });

        if (niveauFinal) {
            niveauGlobal = niveauFinal.code;
        } else if (niveaux.length > 0) {
            // Fallback : si le pourcentage ne tombe dans aucune plage exacte
            // (bornes non contiguës ou arrondis), prendre le niveau le plus proche
            var plusProche = niveaux[0];
            var distMin = Infinity;
            niveaux.forEach(function(n) {
                var mid = (n.min + n.max) / 2;
                var dist = Math.abs(pourcentage - mid);
                if (dist < distMin) { distMin = dist; plusProche = n; }
            });
            niveauGlobal = plusProche.code;
            console.warn('[calculerNote] Fallback niveau : ' + pourcentage.toFixed(1) + '% → ' + plusProche.code + ' (aucune plage exacte, plus proche de [' + plusProche.min + '-' + plusProche.max + '])');
        }

    }

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
    if (noteContainer && niveauGlobal !== '--') {
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
window.verifierPorteeAvantSauvegarde = verifierPorteeAvantSauvegarde;
window.texteCriteresHorsNote = texteCriteresHorsNote;

})();
