/**
 * profil-etudiant-actions.js
 *
 * Sous-module extrait de profil-etudiant.js (session C refactor, 18 mai 2026).
 *
 * Périmètre : zone HIGH partie 1 — orchestrateur cascade `consulterEvaluation`
 * (multi-timeouts T+200/500/300ms avec race guard `window._consulterEvalTimerId`
 * et callback `window._apresOuvertureFichier`), CRUD évaluations, calcul détails
 * note finale, jetons personnalisés, patterns de groupe (Beta 91).
 *
 * 8 fonctions, 8 exports window.X.
 *
 * Cyc > 30 hérité : `calculerDetailsNoteFinale` 57 (à éclater étape 4 session D).
 *
 * Timers cascade globaux préservés (`window._consulterEvalTimerId`,
 * `window._apresOuvertureFichier`) — atomicité critique pour les clics rapides.
 *
 * Consommé par d'autres modules (4 exports critiques) :
 * - consulterEvaluation : evaluation.js, travaux-ui.js
 * - calculerDetailsNoteFinale : portfolio.js, synthese-retroaction-data.js (FIX #37 Beta 96)
 * - calculerEtStockerPatternsGroupe + obtenirPatternEtudiant : tableau-bord-apercu.js
 *
 * @see SESSION.md — Récap session C
 * @see audit/refactoring-prep/MODULES-MAP.md §2.3
 */
(function () {
    'use strict';

// ============================================
// FONCTIONS HELPER POUR SECTION PRODUCTIONS
// ============================================

/**
 * Consulte une évaluation existante (ouvre le fichier dans la visionneuse en mode évaluer)
 */
function consulterEvaluation(da, productionId) {
    // 🔧 FIX (6 mars 2026) : Annuler tout timer d'ouverture précédent (même protection
    // que consulterEvaluationDepuisListe pour éviter les courses sur clics rapides)
    if (window._consulterEvalTimerId) {
        clearTimeout(window._consulterEvalTimerId);
        window._consulterEvalTimerId = null;
    }
    window._apresOuvertureFichier = null;

    // Trouver l'évaluation (résolution centralisée + fallback)
    let evaluation = null;
    if (typeof travauxResolution !== 'undefined') {
        evaluation = travauxResolution.trouverEvaluationPourFichier({ id: null, etudiantDA: da, productionId });
    }
    if (!evaluation) {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        evaluation = evaluations.find(e => e.etudiantDA === da && e.productionId === productionId && !e.remplaceeParId);
    }

    if (!evaluation) {
        alert('Évaluation non trouvée');
        return;
    }

    // Trouver le fichier importé (résolution centralisée)
    let fichierId = null;
    if (typeof travauxResolution !== 'undefined') {
        const fichierTrouve = travauxResolution.trouverFichierPourEvaluation(evaluation);
        if (fichierTrouve) fichierId = fichierTrouve.id;
    }

    // Naviguer vers la section Évaluations d'abord (on vient du profil étudiant)
    afficherSection('evaluations');

    if (fichierId && typeof travauxUI !== 'undefined' && typeof travauxUI.ouvrirFichier === 'function') {
        // Mettre le filtre production sur la bonne production AVANT d'ouvrir le fichier
        if (productionId) {
            sessionStorage.setItem(cle('travaux-filtre-production'), productionId);
        }
        // Workflow visionneuse : naviguer vers Annoter, attendre l'init du module,
        // puis ouvrir le fichier. Le callback _apresOuvertureFichier est appelé
        // par ouvrirFichier APRÈS que le fichier soit complètement chargé dans le canvas.
        window._apresOuvertureFichier = function() {
            // Basculer en mode évaluer (affiche les palettes eval par-dessus le canvas)
            if (typeof travauxUI.basculerMode === 'function') {
                travauxUI.basculerMode('evaluer');
            }
            // Charger l'évaluation sauvegardée dans le formulaire
            setTimeout(function() {
                if (typeof window.modifierEvaluationParId === 'function') {
                    window.modifierEvaluationParId(evaluation.id);
                }
            }, 200);
        };
        // Naviguer vers evaluations-annoter (déclenche initialiserModuleTravaux à +100ms)
        afficherSousSection('evaluations-annoter');
        // Attendre que initialiserModuleTravaux soit terminé (+300ms de marge),
        // puis ouvrir le fichier dans la visionneuse
        window._consulterEvalTimerId = setTimeout(function() {
            window._consulterEvalTimerId = null;
            // Synchroniser le dropdown filtre avec la production cible
            // 🔧 FIX (5 mars 2026) : Synchroniser le dropdown SANS passer le select
            // en argument — passer le select déclenche l'auto-navigation (estChangementManuel)
            // qui ouvre un fichier parasite AVANT ouvrirFichier(fichierId), créant une course.
            const selectFiltre = document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (selectFiltre && productionId) {
                selectFiltre.value = productionId;
                if (typeof travauxUI.filtrerBadgesParProduction === 'function') {
                    travauxUI.filtrerBadgesParProduction();
                }
            }
            travauxUI.ouvrirFichier(fichierId);
        }, 500);
    } else {
        // Fallback : pas de fichier importé, ouvrir le formulaire en standalone
        setTimeout(function() {
            if (typeof window.modifierEvaluationParId === 'function') {
                window.modifierEvaluationParId(evaluation.id);
            }
        }, 300);
    }
}

// #868 (15 sept. 2026) — `evaluerProduction` ne vit plus ici : sa définition unique est dans
// evaluation.js. Celle-ci visait deux identifiants inexistants et était écrasée au chargement.


// #128 (31 mai) : message DIAGNOSTIQUE du « non calculable ». Objectif (retour Grégoire) :
// que l'enseignant sache si c'est SON assignation/config à corriger, ou si c'est l'app qui
// ne sait pas encore calculer cette famille (ses données étant cohérentes). Brique de la
// future fonction « simuler / comparer des pratiques sur les mêmes données ».
function _diagnostiquerNoteNonCalculable() {
    // #762 (6 sept. 2026) — LA SOURCE DE VÉRITÉ D'ABORD. `obtenirPratiqueActiveGroupeCours`
    // (modes.js) ne rend jamais null : sans `pratiqueId`, elle rend le repli « sommative », que
    // ce diagnostic cherchait ensuite dans la bibliothèque — d'où « introuvable dans la
    // bibliothèque (supprimée, ou assignation vers un identifiant obsolète) » pour un
    // groupe-cours simplement SANS pratique, et une consigne qui ne pouvait pas le résoudre.
    // Mesuré sur les données de Grégoire (BUG_grégoire_2026-09-06_07-48-42 : `pratiqueId: null`)
    // et par l'audit du 5 septembre (constat A-1, #710). Le groupe-cours actif est lu tel quel ;
    // sans groupe-cours résolu, rien ne peut porter l'assignation : même réponse.
    const gcActif = db.getSync('groupeCoursActif', null);
    const groupesCours = db.getSync(cle('groupesCours'), []) || [];
    const gc = (gcActif && gcActif.id && Array.isArray(groupesCours))
        ? groupesCours.find(g => g && g.id === gcActif.id) : null;
    const pratiqueId = (gc && gc.pratiqueId) ? gc.pratiqueId : null;
    if (!pratiqueId) {
        return 'Aucune pratique de notation n\'est assignée à ce groupe-cours. Ouvre Conception → Pratiques de notation, choisis ta pratique et clique « Appliquer au cours actif ».';
    }
    // Lot N1a (#711) : la même désignation que le calcul (id brut, puis normalisé). Avant, l'id
    // brut seul : un pointeur ancien qui menait à une pratique se disait « introuvable ».
    const pratiqueData = (typeof trouverPratiqueEnBibliotheque === 'function')
        ? trouverPratiqueEnBibliotheque(pratiqueId)
        : ((db.getSync(cle('pratiquesConfigurables'), null) || []).find(p => p.id === pratiqueId) || null);
    if (!pratiqueData) {
        return 'La pratique assignée à ce groupe-cours est introuvable dans la bibliothèque (supprimée, ou assignation vers un identifiant obsolète). Réassigne une pratique dans Conception → Pratiques de notation.';
    }
    const famille = (typeof normaliserIdPratique === 'function') ? normaliserIdPratique(pratiqueData.type || '') : (pratiqueData.type || '');
    const methode = pratiqueData.calcul_note && pratiqueData.calcul_note.methode;
    if (famille === 'sommative' || methode === 'moyenne_ponderee') {
        return 'Cette pratique est de type Sommative (moyenne pondérée). La note de session affichée ici se calcule par portfolio, propre aux PAN-Standards : le calcul Sommatif dans le profil n\'est pas encore branché. Tes données sont cohérentes – c\'est l\'affichage qui ne couvre pas encore cette famille (à venir).';
    }
    if (famille === 'specifications' || methode === 'specifications') {
        return 'Cette pratique est de type Spécifications (exigences/seuils). Son calcul dans le profil n\'est pas encore branché. Tes données sont cohérentes – c\'est l\'affichage qui ne couvre pas encore cette famille (à venir).';
    }
    if (famille === 'denotation' || methode === 'jugement_global') {
        // DEN couche 2 (#318, DEN-4) : la note finale est un JUGEMENT saisi, pas un
        // calcul sur les artefacts — elle ne « manque » pas, elle se pose. On oriente
        // donc l'enseignant vers la saisie plutôt que vers une config à corriger.
        return 'Cette pratique est de type Dénotation : la note finale est un jugement que tu poses, pas un calcul sur les artefacts. Ouvre la section « Jugement » du profil pour confirmer les cibles atteintes et saisir la note (la garde « cibles atteintes » conditionne la certification ≥ 60).';
    }
    return 'Pratique PAN-Standards, mais sa configuration de portfolio (nombre d\'artefacts à retenir, minimum requis) est absente ou incomplète. Ouvre « Réglages de la pratique » pour la compléter.';
}
// #318 DEN-4 : exposé pour la sentinelle du diagnostic DEN (diagnostic-denotation-DEN4).
window._diagnostiquerNoteNonCalculable = _diagnostiquerNoteNonCalculable;

function _obtenirConfigPortfolioCalcul(modalites, pratiqueIdDemande = null) {
    // Phase G2-a (24 mai 2026) : la pratique active est lue UNIQUEMENT depuis
    // la bibliothèque (pratiquesConfigurables, via obtenirConfigPratiqueActive).
    // Plus de fallback sur le snapshot modalitesEvaluation.configPAN.portfolio,
    // qui drift quand l'utilisateur édite la pratique dans le wizard.
    // #307 : pratiqueIdDemande permet de lire la config d'une pratique simulée
    // (absent ⇒ pratique active, comportement inchangé).
    const configPratiqueActive = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive(pratiqueIdDemande) : null;
    if (!configPratiqueActive || !configPratiqueActive.portfolio) {
        // Message précis selon la cause réelle (#128) au lieu d'un générique.
        return { erreur: _diagnostiquerNoteNonCalculable() };
    }
    const configPortfolio = configPratiqueActive.portfolio;
    let methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    if (methodeSelection === 'derniers') methodeSelection = 'recents';
    const configCategories = configPratiqueActive.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories(pratiqueIdDemande) : null);
    return {
        nombreARetenir: configPortfolio.nombreARetenir || 4,
        minimumRequis: configPortfolio.minimumCompletion || 7,
        methodeSelection,
        reglesConformite: configPortfolio.reglesConformite || { actif: false },
        modeHybride: !!(configCategories && configCategories.actif),
        configCategories,
        configPratique: configPratiqueActive   // lot 4 : ses productions exclues, pour le pool (la pratique demandée, #307)
    };
}

// #394 : l'identification de la terminale et du pool vit dans la SSOT partagée
// avec l'instance registre (window.identifierProductionTerminale /
// window.obtenirArtefactsIdsPoolStd, pratique-registre.js) — plus de définition
// locale qui pourrait dériver de celle des snapshots/replis.

function _filtrerEvaluationsArtefactsValides(evaluations, da, artefactsIds, terminalId) {
    return evaluations.filter(e => {
        if (e.etudiantDA !== da) return false;
        if (!artefactsIds.includes(e.productionId)) return false;
        if (e.productionId === terminalId) return false;
        // #706 — la règle unique du registre : remplacées, sans note, brouillons (non
        // verrouillées) et portée nulle n'entrent pas dans la note du cours.
        if (!window.evaluationEntreDansLaNote(e)) return false;
        // Une copie non recevable sort du portfolio : la règle par défaut du registre (28 oct. 2026), pas une relecture du statut.
        const nonRecevable = window.valeurCopieNonRecevable(e);
        if (nonRecevable && !nonRecevable.dansLePortfolio) return false;
        return true;
    });
}

// La note qu'un calcul retient pour une copie (registre, 28 oct. 2026) : sa note, ou ce que vaut une copie non recevable.
// Les deux sélections trient et somment sur elle : un réglage qui garderait la copie au pool n'aurait rien à changer ici.
const noteRetenue = (e) => window.noteRetenueParLeCalcul(e);

function _selectionnerArtefactsHybride(evalsArtefacts, productions, configCategories, estFinale, terminalId) {
    const { nombreARetenir: nSelection, ponderation: pondSel } = configCategories.selection || { nombreARetenir: 4, ponderation: 65 };
    const { ponderation: pondObl } = configCategories.obligatoires || { ponderation: 35 };
    const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');

    const evalsSelection = evalsArtefacts.filter(ev => {
        const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
        return prod && prod.categorie === 'selection';
    });
    const evalsObligatoires = evalsArtefacts.filter(ev => {
        const prod = productionsNonPortfolio.find(p => p.id === ev.productionId);
        return prod && prod.categorie === 'obligatoire';
    });

    // N meilleures du pool Sélection
    const meilleuresSelection = [...evalsSelection]
        .sort((a, b) => (noteRetenue(b) || 0) - (noteRetenue(a) || 0))
        .slice(0, nSelection);

    const artefactsRetenus = [...meilleuresSelection, ...evalsObligatoires];

    // Règle UI (wizard pratique) : « Note = 0 si production non remise ».
    // S'applique UNIQUEMENT en mode finale (notesFinales coché). En mode
    // provisoire (au fil de la session), les obligatoires non remises sont
    // ignorées — elles ne pénalisent pas la note tant que la session n'est
    // pas terminée.
    // #339 (15 oct. 2026) — LE ZÉRO FANTÔME : l'écran laisse marquer la terminale « obligatoire »
    // (pratiques-gestion.js, cases des catégories), mais sa copie n'entre jamais dans le pool
    // (`_filtrerEvaluationsArtefactsValides` l'écarte) ; elle comptait pourtant au dénominateur en notes
    // finales, comme une obligatoire non remise : un zéro pour une copie remise. La terminale garde sa
    // propre pondération (plus bas) ; elle ne compte pas parmi les obligatoires du portfolio.
    const nombreObligatoiresTotal = productionsNonPortfolio
        .filter(p => p.categorie === 'obligatoire' && p.id !== terminalId).length;
    const denominateurObl = estFinale ? nombreObligatoiresTotal : evalsObligatoires.length;

    // Moyenne pondérée Hybride
    let moyennePortfolio = null;
    if (meilleuresSelection.length > 0 || denominateurObl > 0) {
        const moySel = meilleuresSelection.length > 0
            ? meilleuresSelection.reduce((s, e) => s + noteRetenue(e), 0) / meilleuresSelection.length : 0;
        const moyObl = denominateurObl > 0
            ? evalsObligatoires.reduce((s, e) => s + noteRetenue(e), 0) / denominateurObl : 0;
        if (meilleuresSelection.length > 0 && denominateurObl > 0) {
            moyennePortfolio = (moySel * pondSel + moyObl * pondObl) / (pondSel + pondObl);
        } else if (meilleuresSelection.length > 0) {
            moyennePortfolio = moySel;
        } else {
            moyennePortfolio = moyObl;
        }
    }
    return { artefactsRetenus, moyennePortfolio };
}

function _selectionnerArtefactsLegacy(evalsArtefacts, productions, methodeSelection, nombreARetenir) {
    // #394 (L9) : LE comparateur de récence du moteur STD (SSOT, pratique-registre.js).
    const parRecence = window.creerComparateurRecenceStd(productions);

    let artefactsRetenus = [...evalsArtefacts];
    // Égalité à la coupure (audit du 5 sept. 2026, D-2b) : le tri est stable, l'ordre de
    // stockage départage deux notes égales ; la note ne change pas, seul le récit nomme
    // « écartée » l'une plutôt que l'autre. Commenté, pas de fiche.
    if (methodeSelection === 'meilleurs' || methodeSelection === 'hybride') {
        artefactsRetenus.sort((a, b) => noteRetenue(b) - noteRetenue(a));
    } else if (methodeSelection === 'recents') {
        artefactsRetenus.sort(parRecence);
    } else if (methodeSelection === 'recents-meilleurs') {
        const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRetenus.length * 0.5));
        artefactsRetenus.sort((a, b) => noteRetenue(b) - noteRetenue(a));
        artefactsRetenus = artefactsRetenus.slice(0, nombreMeilleurs);
        artefactsRetenus.sort(parRecence);
    }
    // #715 (21 sept. 2026) : « tous » veut dire tous — la coupe à N ne vaut que pour les modes qui
    // trient. Avant, elle s'appliquait aussi sous « tous », dans l'ordre de stockage, et ce chemin
    // s'écartait de l'instance (pratique-pan-standards.js, case 'tous'), qui prend tout.
    if (methodeSelection !== 'tous') {
        artefactsRetenus = artefactsRetenus.slice(0, nombreARetenir);
    }

    let moyennePortfolio = null;
    if (artefactsRetenus.length > 0) {
        const somme = artefactsRetenus.reduce((acc, e) => acc + noteRetenue(e), 0);
        moyennePortfolio = somme / artefactsRetenus.length;
    }
    return { artefactsRetenus, moyennePortfolio };
}

function _appliquerPlafonnementConformite(moyennePortfolio, reglesConformite, deficit) {
    if (!reglesConformite.actif || deficit <= 0 || moyennePortfolio === null) {
        return { moyenne: moyennePortfolio, plafonnement: null };
    }
    const plafonds = reglesConformite.plafonds || [];
    // Déficit 3+ utilise la règle deficit:3 ; sinon règle exacte
    const cibleDeficit = deficit >= 3 ? 3 : deficit;
    const plafondApplicable = plafonds.find(p => p.deficit === cibleDeficit);
    if (!plafondApplicable) {
        return { moyenne: moyennePortfolio, plafonnement: null };
    }
    if (plafondApplicable.echec) {
        return {
            moyenne: 0,
            plafonnement: {
                actif: true,
                deficit: deficit,
                niveauCode: null,
                seuilMax: 0,
                echec: true,
                moyenneOriginale: moyennePortfolio
            }
        };
    }
    if (plafondApplicable.seuilMax !== null && moyennePortfolio > plafondApplicable.seuilMax) {
        return {
            moyenne: plafondApplicable.seuilMax,
            plafonnement: {
                actif: true,
                deficit: deficit,
                niveauCode: plafondApplicable.niveauCode,
                seuilMax: plafondApplicable.seuilMax,
                echec: false,
                moyenneOriginale: moyennePortfolio
            }
        };
    }
    return { moyenne: moyennePortfolio, plafonnement: null };
}

/**
 * E7, ajout de Cowork (28 oct. 2026, 14 h 55) — seule une terminale PRÉVUE (une production de ce type existe) qui ne
 * compte pas encore rend la note provisoire. Sans production terminale (des standards sans terminale, en chimie par
 * exemple), la note est celle du pool, à 100 % : elle n'attend rien. Avant : « provisoire » pour toujours à l'export.
 */
function _noteAttendSaTerminale(productionTerminale, noteTerminale) {
    return productionTerminale !== null && noteTerminale === null;
}

function _obtenirNoteTerminaleEtudiant(evaluations, da, productionTerminale) {
    if (!productionTerminale) return { noteTerminale: null, evaluationTerminale: null };
    // #706 : un brouillon de terminale n'est pas une terminale — la note reste provisoire.
    const evaluationTerminale = evaluations.find(e =>
        e.etudiantDA === da &&
        e.productionId === productionTerminale.id &&
        window.evaluationEntreDansLaNote(e)
    ) || null;
    // 28 oct. 2026 : une terminale non recevable vaut ce que dit le registre (0 par défaut), pas sa note calculée.
    const noteTerminale = evaluationTerminale ? window.noteRetenueParLeCalcul(evaluationTerminale) : null;
    return { noteTerminale, evaluationTerminale };
}

function _calculerNoteFinaleAggregee(moyennePortfolio, noteTerminale, pondP, pondT, totalPond) {
    if (moyennePortfolio === null) return null;
    if (noteTerminale === null) return moyennePortfolio; // provisoire
    return (moyennePortfolio * pondP / totalPond) + (noteTerminale * pondT / totalPond);
}

/**
 * Lot 1 des standards sans portfolio (28 oct. 2026), mot neuf 2 — aucune production du pool n'a de note : la note manque,
 * et l'on dit pourquoi (avant : `erreur: null`). Seule la terminale notée passe avant (décision Q3). Une note qui manque
 * pour une autre raison n'a pas de phrase ici. La phrase vient du registre (`causeNoteStdSansProductionNotee`).
 * @returns {string|null}
 */
function _causeNoteAbsenteStd(erreurConfiguration, noteFinale, nombreEvaluesAuPool, avecArtefacts, noteTerminale) {
    if (erreurConfiguration || noteFinale !== null || nombreEvaluesAuPool > 0) return null;
    return window.causeNoteStdSansProductionNotee(avecArtefacts, noteTerminale !== null);
}

/**
 * Mot neuf 1 du lot 1 (validé par Grégoire le 28 oct. 2026, 15 h 20) — la formule du récit : une partie absente ne
 * s'écrit pas ; « portfolio » avec un « Artefact », « productions retenues » sans (décision Q1).
 * @param {boolean} avecArtefacts
 * @param {Object|null} productionTerminale
 * @param {number} ponderationTerminale - sans poids, la terminale ne s'écrit pas (jamais « terminale × 0 % »)
 * @param {string} pctPool - pondération normalisée du pool
 * @param {string} pctTerminale - pondération normalisée de la terminale
 */
function _formuleRecitStd(avecArtefacts, productionTerminale, ponderationTerminale, pctPool, pctTerminale) {
    if (productionTerminale === null || !(ponderationTerminale > 0)) return avecArtefacts ? 'moyenne du portfolio' : 'moyenne des productions retenues';
    return (avecArtefacts ? 'portfolio' : 'productions retenues') + ' × ' + formaterPourcentage(pctPool)
        + ' + terminale × ' + formaterPourcentage(pctTerminale);
}

/**
 * Les copies du pool qu'une autre remplace, relues pour les nommer dans le récit. E4 (28 oct. 2026) : une originale
 * gardée dont la reprise ne compte pas encore est au pool, pas ici. Lot 1 (28 oct. 2026) : un doublon réconcilié (#360)
 * n'est pas une reprise — nommé à part, comme au récit sommatif.
 * @returns {{remplacees: Array, doublons: Array}}
 */
function _copiesRemplaceesDuPoolStd(evaluations, da, artefactsIds, terminalId) {
    const duPool = evaluations.filter(e => e.etudiantDA === da && artefactsIds.includes(e.productionId) && e.productionId !== terminalId);
    return {
        remplacees: duPool.filter(e => e.remplaceeParId && !e.reconcilieParDoublon && window.originaleEstRemplacee(e, evaluations)),
        doublons: duPool.filter(e => e.reconcilieParDoublon)
    };
}

/**
 * Calcule les détails de la note finale de session pour un étudiant (pratique PAN-Standards)
 * Retourne les informations nécessaires pour afficher la construction de la note
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string|null} pratiqueIdDemande - Session C : si fourni, identifie explicitement
 *   la pratique à représenter (brique simulation #307). Si null (cas par défaut, tous les
 *   appelants actuels), on résout la pratique ACTIVE du groupe-cours → comportement
 *   strictement identique à avant. NB : le basculement complet de la CONFIG de calcul vers
 *   la pratique demandée (lecture de sa config au lieu du SSOT global) arrive au Lot 5 ;
 *   ici on plombe la signature + la résolution d'identité, sans changer le calcul actif.
 * @returns {Object|null} - Détails de la note finale ou null si pas de données
 */
/**
 * #941 lot S1 (décision A, 24 sept. 2026) — le niveau que le récit de la note porte VERS LES VUES :
 * aucun pour une copie en points, ni « -- ». Le calcul de la note ne lit pas ce champ.
 */
function _niveauVu(evaluation) {
    if (!evaluation) return null;
    if (typeof niveauFinalAffichable === 'function') return niveauFinalAffichable(evaluation) || null;
    return evaluation.niveauFinal || null;
}

function calculerDetailsNoteFinale(da, pratiqueIdDemande = null) {
    const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
    // Lot N1a (#710, 21 sept. 2026) : LA résolution du registre, sans repli. Avant, le TYPE de
    // la pratique active, et PRATIQUE_DEFAUT (« standards ») quand rien n'était assigné — pendant
    // que l'indice P, lui, se calculait en « sommative ».
    // La désignation suffit (id, entrée de bibliothèque, famille) : le portfolio se calcule sur la
    // configuration, sans instance — et aucune instance n'est construite par élève.
    const resolution = (!pratiqueIdDemande && typeof designerPratiqueActive === 'function')
        ? designerPratiqueActive() : null;

    // On gère seulement Standards (portfolio à note construite). Les autres pratiques
    // (sommative, specifications, denotation) n'ont pas de détail de note finale portfolio.
    // #307 (simulation) : la garde porte sur la famille de la pratique DEMANDÉE (via son
    // code court 'STD'), pas l'active — sinon simuler une sommative pendant qu'une
    // standards est active calculerait un portfolio à tort. Sans demande, garde inchangée.
    let estFamilleStandards;
    if (pratiqueIdDemande) {
        const _instDemande = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(pratiqueIdDemande) : null;
        estFamilleStandards = !!(_instDemande && typeof _instDemande.obtenirCode === 'function' && _instDemande.obtenirCode() === 'STD');
    } else if (resolution && resolution.etat !== 'ok') {
        // Aucune pratique assignée, ou un id qui ne mène à rien : aucune note, et la vraie raison.
        return {
            pratique: null,
            pratiqueId: null,
            pratiqueNom: null,
            erreur: _diagnostiquerNoteNonCalculable(),
            portfolio: null,
            terminal: null,
            noteFinale: null,
            estProvisoire: false,
            ecartees: window.compterEvaluationsEcarteesDeLaNote(da),
            recit: null
        };
    } else {
        estFamilleStandards = !!(resolution && resolution.famille === 'standards');
    }
    if (!estFamilleStandards) return null;

    // #127 (31 mai) : identifier la pratique active DÈS MAINTENANT, pour la nommer
    // même dans le cas « non calculable » (retour Grégoire 05:26 : « celles qui ne
    // sont pas calculables ne sont pas identifiées »). Lu depuis la bibliothèque.
    // Session C (Lot 2) : si une pratique est explicitement demandée (#307), on la
    // privilégie ; sinon repli sur la pratique active du groupe-cours (identique à avant).
    const pratiqueId = pratiqueIdDemande || (resolution ? resolution.id : null);
    const pratiqueNom = ((typeof trouverPratiqueEnBibliotheque === 'function')
        ? trouverPratiqueEnBibliotheque(pratiqueId)?.nom : null) || null;

    // Lecture config portfolio (source canonique : pratiquesConfigurables, via
    // obtenirConfigPratiqueActive). Plus de fallback sur configPAN.portfolio
    // (Phase G2-a, 24 mai 2026).
    // #706 — combien d'évaluations de l'élève sont écartées de la note (brouillons, portée
    // nulle) : dit au profil et à l'export, sur le modèle « 2 évaluations en brouillon, non comptées ».
    const ecartees = window.compterEvaluationsEcarteesDeLaNote(da);

    const cfg = _obtenirConfigPortfolioCalcul(modalites, pratiqueIdDemande);
    if (cfg.erreur) {
        return {
            pratique: 'PAN-Standards',
            pratiqueId: pratiqueId,
            pratiqueNom: pratiqueNom,
            erreur: cfg.erreur,
            portfolio: null,
            terminal: null,
            noteFinale: null,
            estProvisoire: false,
            ecartees: ecartees,
            recit: null
        };
    }
    const { nombreARetenir, minimumRequis, reglesConformite, modeHybride: modeHybrideNote, configCategories: configCategoriesNote } = cfg;
    let methodeSelection = cfg.methodeSelection;

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // #883 (16 sept. 2026) — LA PORTE 1 DE #790 MANQUAIT ICI. Les familles de `js/pratiques/`
    // retirent les productions diagnostiques ; ce second système (profil, PDF de l'élève)
    // les lisait toutes : un « Portrait de lecteur » diagnostique comptait dans « N évaluées »
    // et réduisait le déficit du plafonnement (mesuré sur A2026 : 28 élèves sur 28), et
    // entrait dans la note en sélection non hybride. Filtré ici, il sort du pool d'artefacts,
    // donc de tout ce qui en découle.
    const productionsBrutes = obtenirDonneesSelonMode('productions') || [];
    const productions = (typeof window.ProductionDiagnostique !== 'undefined')
        ? window.ProductionDiagnostique.filtrerProductions(productionsBrutes)
        : productionsBrutes;

    const productionPortfolio = productions.find(p => p.type === 'portfolio');
    const productionTerminale = window.identifierProductionTerminale(productions);
    const terminalId = productionTerminale?.id || null;

    const artefactsIds = window.obtenirArtefactsIdsPoolStd(productions, terminalId, cfg.configPratique);
    const evaluationsArtefacts = _filtrerEvaluationsArtefactsValides(evaluations, da, artefactsIds, terminalId);

    // Statut Provisoire/Finale lu tôt — pilote la règle « obligatoires non
    // remises = 0 » : appliquée uniquement en mode finale. En provisoire,
    // les non-remises restent simplement ignorées.
    const cfgPratiqueActive = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive(pratiqueIdDemande) : null;
    // Lot N2 (#716) : le P historique d'un snapshot se calcule en provisoire (décision de Grégoire,
    // 22 sept. 2026) — voir `contexteImposeNoteProvisoire` (modes.js).
    const estFinale = !!(cfgPratiqueActive && cfgPratiqueActive.notesFinales)
        && !(typeof contexteImposeNoteProvisoire === 'function' && contexteImposeNoteProvisoire());
    // pratiqueId / pratiqueNom : déjà résolus en tête de fonction (#127, pour couvrir
    // aussi le cas « non calculable »).

    // Sélection des artefacts retenus + moyenne (Hybride ou Legacy)
    const { artefactsRetenus, moyennePortfolio: moyenneBrute } = modeHybrideNote
        ? _selectionnerArtefactsHybride(evaluationsArtefacts, productions, configCategoriesNote, estFinale, terminalId)
        : _selectionnerArtefactsLegacy(evaluationsArtefacts, productions, methodeSelection, nombreARetenir);

    // Plafonnement conformité (déficit d'artefacts)
    const nombreEvalues = evaluationsArtefacts.length;
    const deficit = minimumRequis - nombreEvalues;
    const { moyenne: moyennePortfolio, plafonnement } = _appliquerPlafonnementConformite(moyenneBrute, reglesConformite, deficit);

    // Pondérations : déterminées par l'utilisateur, jamais de fallback arbitraire.
    // - Pas de terminale → pool = 100% (conséquence logique, pas un défaut codé en dur).
    // - Terminale présente + conteneur portfolio présent → pondérations explicites
    //   obligatoires sur les deux productions.
    // - #394 (D1, règle du complément) : le conteneur « Portfolio » est OPTIONNEL —
    //   sans conteneur, une terminale pondérée p donne au pool le complément 100 − p.
    //   L'avertissement de transparence (zone « À vérifier » des Productions) le
    //   signale ; ici on porte le flag ponderationParComplement dans le retour.
    let ponderationPortfolio;
    let ponderationTerminale;
    let erreurConfiguration = null;
    let ponderationParComplement = false;
    if (productionTerminale === null) {
        ponderationPortfolio = 100;
        ponderationTerminale = 0;
    } else {
        const pondT = productionTerminale.ponderation;
        if (pondT == null) {
            erreurConfiguration = 'Pondération manquante (pondération de l\'évaluation terminale). Corriger la configuration des productions pour que la note finale soit calculable.';
            ponderationPortfolio = 0;
            ponderationTerminale = 0;
        } else if (productionPortfolio == null) {
            ponderationTerminale = pondT;
            ponderationPortfolio = Math.max(0, 100 - pondT);
            ponderationParComplement = true;
        } else {
            const pondP = productionPortfolio.ponderation;
            if (pondP == null) {
                erreurConfiguration = 'Pondération manquante (pondération du portfolio). Corriger la configuration des productions pour que la note finale soit calculable.';
            }
            ponderationPortfolio = pondP ?? 0;
            ponderationTerminale = pondT;
        }
    }
    const totalPonderation = ponderationPortfolio + ponderationTerminale;
    // #399 (L6) : pondérations 0/0 — sans cette garde, la division par totalPond
    // produit NaN, qui traverse « erreur == null » et se STOCKE (affichages « NaN »).
    if (!erreurConfiguration && productionTerminale !== null && totalPonderation === 0) {
        erreurConfiguration = 'Pondérations nulles (portfolio 0\u00a0% + terminale 0\u00a0%). Saisir des pondérations pour que la note finale soit calculable.';
    }

    // Note terminale + agrégation finale
    const { noteTerminale, evaluationTerminale } = _obtenirNoteTerminaleEtudiant(evaluations, da, productionTerminale);
    const noteFinale = erreurConfiguration
        ? null
        : _calculerNoteFinaleAggregee(moyennePortfolio, noteTerminale, ponderationPortfolio, ponderationTerminale, totalPonderation);
    // Lot 1 des standards sans portfolio (28 oct. 2026) : la règle des mots est celle du pool (décision Q1).
    const avecArtefacts = window.poolStdFaitDArtefacts(productions, terminalId);
    const causeNoteAbsente = _causeNoteAbsenteStd(erreurConfiguration, noteFinale, evaluationsArtefacts.length, avecArtefacts, noteTerminale);

    // Label méthode de sélection en français (forcer 'hybride' si actif)
    if (modeHybrideNote) methodeSelection = 'hybride';
    const methodesLabels = {
        'meilleurs': 'meilleurs',
        'recents': 'plus récents',
        'recents-meilleurs': 'récents parmi les meilleurs',
        'tous': 'tous',
        'hybride': 'hybride (catégories)'
    };

    const normaliser = (pond) => totalPonderation > 0 ? (pond / totalPonderation * 100).toFixed(0) : '0';
    // `estFinale` et `pratiqueId` sont déjà calculés plus haut (avant l'appel
    // au calculateur hybride, car le flag pilote le traitement des obligatoires
    // non remises).

    // ── C2-a (Comparateur, fiche de profil) : récit de calcul STD — traçabilité
    // ADDITIVE. Contrat NOTE-CONCEPTION-C2 §4 : on ne lit QUE des valeurs déjà
    // établies ci-dessus pour décrire le « sort » de chaque résultat. Aucun calcul
    // n'est modifié → la note finale est strictement inchangée (sentinelle de parité).
    const _titreProd = (pid) => {
        const p = productions.find(pr => pr.id === pid);
        return p?.titre || p?.activiteApprentissage || p?.description || pid;
    };
    const _estObligatoireHybride = (pid) => {
        if (!modeHybrideNote) return false;
        const p = productions.find(pr => pr.id === pid);
        return !!(p && p.categorie === 'obligatoire');
    };
    const _resArtefact = (e, sort, detail) => ({
        label: _titreProd(e.productionId),
        date: e.dateEvaluation || null,
        niveau: _niveauVu(e),   // code BRUT — traduit par l'échelle à la vue (neutralité) ; #941 lot S1
        enPoints: typeof evaluationEnPoints === 'function' && evaluationEnPoints(e),
        note: (noteRetenue(e) ?? null),   // la note que la sélection a retenue (parité)
        sort: sort,
        detail: detail
    });
    // Écartées = évaluées et valides mais hors sélection (mêmes références d'objets
    // que artefactsRetenus, donc comparaison par identité fiable).
    const _artefactsEcartes = evaluationsArtefacts.filter(e => !artefactsRetenus.includes(e));
    // Remplacées par reprise : exclues dès le filtrage des valides (remplaceeParId),
    // relues ici dans les évaluations brutes pour les nommer dans le récit.
    const { remplacees: _remplacees, doublons: _doublons } = _copiesRemplaceesDuPoolStd(evaluations, da, artefactsIds, terminalId);
    const _resultatsRecit = [];
    artefactsRetenus.forEach(e => {
        const obl = _estObligatoireHybride(e.productionId);
        _resultatsRecit.push(_resArtefact(e, obl ? 'obligatoire' : 'compte',
            obl ? 'obligatoire · comptée' : 'retenue dans la sélection'));
    });
    _artefactsEcartes.forEach(e => {
        _resultatsRecit.push(_resArtefact(e, 'ecarte',
            'écartée · hors des ' + artefactsRetenus.length + ' retenues'));
    });
    _remplacees.forEach(e => {
        _resultatsRecit.push(_resArtefact(e, 'remplace', 'remplacée par une reprise'));
    });
    _doublons.forEach(e => {
        _resultatsRecit.push(_resArtefact(e, 'remplace', 'en double · comptée une seule fois'));
    });
    // #706 — brouillons et portée nulle (pool et terminale) : nommés, non comptés.
    evaluations
        .filter(e => e.etudiantDA === da &&
            (artefactsIds.includes(e.productionId) || e.productionId === terminalId) &&
            !e.remplaceeParId && e.noteFinale !== null && e.noteFinale !== undefined &&
            !window.evaluationEntreDansLaNote(e))
        .forEach(e => {
            _resultatsRecit.push(_resArtefact(e, 'ecarte',
                e.verrouillee === false ? 'évaluation non verrouillée · non comptée' : 'sans critère évalué · non comptée'));
        });
    if (productionTerminale && noteTerminale !== null) {
        _resultatsRecit.push({
            label: productionTerminale.titre || productionTerminale.activiteApprentissage || 'Évaluation terminale',
            date: evaluationTerminale?.dateEvaluation || null,
            niveau: _niveauVu(evaluationTerminale),
            enPoints: typeof evaluationEnPoints === 'function' && evaluationEnPoints(evaluationTerminale),
            note: noteTerminale,
            sort: 'compte',
            detail: 'comptée · poids ' + formaterPourcentage(normaliser(ponderationTerminale))
        });
    }
    const recit = {
        famille: 'STD',
        pratiqueNom: pratiqueNom,
        resultats: _resultatsRecit,
        synthese: {
            formuleTexte: erreurConfiguration ? null
                : _formuleRecitStd(avecArtefacts, productionTerminale, ponderationTerminale,
                    normaliser(ponderationPortfolio), normaliser(ponderationTerminale)),
            noteFinale: noteFinale,
            plafonnement: plafonnement
        }
    };

    return {
        pratique: 'PAN-Standards',
        erreur: erreurConfiguration || causeNoteAbsente,
        // La même phrase, seule : ce que la pratique déclare au rapport et à l'export (`expliquerNoteNonConstructible`).
        causeNoteAbsente: causeNoteAbsente,
        pratiqueId: pratiqueId,
        pratiqueNom: pratiqueNom,
        estFinale: estFinale,
        portfolio: {
            nombreARetenir: nombreARetenir,
            nombreEvalues: evaluationsArtefacts.length,
            nombreRetenus: artefactsRetenus.length,
            minimumRequis: minimumRequis,
            methodeSelection: methodesLabels[methodeSelection] || methodeSelection,
            // #714 — la CLÉ, à côté du libellé : le panneau « Développement des habiletés » choisit
            // sa phrase de règle sur elle ('meilleurs', 'recents', 'recents-meilleurs', 'tous', 'hybride').
            methodeSelectionCle: methodeSelection,
            moyenne: moyennePortfolio,
            ponderation: ponderationPortfolio,
            ponderationNormalisee: normaliser(ponderationPortfolio),
            artefactsRetenus: artefactsRetenus.map(e => ({
                productionId: e.productionId,
                note: e.noteFinale,
                niveau: _niveauVu(e),   // #941 lot S1 — affichage seulement
                enPoints: typeof evaluationEnPoints === 'function' && evaluationEnPoints(e)
            })),
            plafonnement: plafonnement
        },
        terminal: {
            nom: productionTerminale?.titre || productionTerminale?.activiteApprentissage || productionTerminale?.description || 'Évaluation terminale',
            note: noteTerminale,
            niveau: _niveauVu(evaluationTerminale),
            enPoints: typeof evaluationEnPoints === 'function' && evaluationEnPoints(evaluationTerminale),
            ponderation: ponderationTerminale,
            ponderationNormalisee: normaliser(ponderationTerminale),
            present: productionTerminale !== null
        },
        noteFinale: noteFinale,
        estProvisoire: _noteAttendSaTerminale(productionTerminale, noteTerminale),
        ponderationParComplement: ponderationParComplement,
        ecartees: ecartees,   // #706 : { brouillons, sansPortee, total }
        recit: recit
    };
}

/* ===============================
   GESTION DES JETONS PERSONNALISÉS
   =============================== */



// Exporter les fonctions vers window

// 🆕 Exporter les nouvelles fonctions de niveau RàI (Beta 90+)
// window.determinerNiveauRaiPedagogique → profil-etudiant-calculs.js
// window.determinerAlerteContextuelle → profil-etudiant-calculs.js
// window.determinerCibleIntervention → profil-etudiant-calculs.js (FIX Beta 97.4 : utilisé par afficherPatternsApprentissage)
// window.calculerMoyennesCriteres → profil-etudiant-calculs.js
// window.calculerIPB → profil-etudiant-calculs.js
// window.obtenirGrilleReferenceDepistage → profil-etudiant-helpers.js

/**
 * 🆕 BETA 91: Calcule et stocke les patterns + RàI pour TOUT le groupe
 * Cette fonction est appelée par apercu-contenu.js au chargement
 * pour avoir des données à jour pour tous les étudiants
 *
 * @returns {Object} - Patterns et RàI de tous les étudiants
 */
function calculerEtStockerPatternsGroupe() {
    // ✅ NAMESPACING (Beta 95.5)
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const patternsGroupe = {};


    etudiants.forEach(etudiant => {
        const da = etudiant.da;

        try {
            // Récupérer le modèle RàI (contient pattern et niveau)
            const modelRai = determinerNiveauRaiPedagogique(da);

            // Récupérer les indices pour avoir la performance
            const indices = calculerTousLesIndices(da);

            // Stocker les informations essentielles
            patternsGroupe[da] = {
                pattern: modelRai.pattern,
                niveauRai: modelRai.niveau,
                defi: modelRai.defi,
                performancePct: indices.P, // 0-100
                dateCalcul: new Date().toISOString()
            };
        } catch (error) {
            console.warn('⚠️ Erreur calcul pattern pour DA', da, error);
            patternsGroupe[da] = {
                pattern: 'Inconnu',
                niveauRai: null,
                defi: null,
                performancePct: 0,
                dateCalcul: new Date().toISOString()
            };
        }
    });

    // Stocker avec namespace trimestre
    db.setSyncSiChange(cle('indicesPatternsRaI'), patternsGroupe, ['dateCalcul']);   // #1040


    return patternsGroupe;
}

/**
 * 🆕 BETA 91: Récupère les patterns stockés pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - Pattern et RàI de l'étudiant, ou null si non trouvé
 */
function obtenirPatternEtudiant(da) {
    const patterns = db.getSync(cle('indicesPatternsRaI'), null) || db.getSync('indicesPatternsRaI', {});
    return patterns[da] || null;
}


    // === EXPORTS window.X (convention systématique session A décision b) ===
    // Lot 4 du cadrage 11 (11 sept. 2026, tableau 4.1 de l'audit du 6) : trois gestes
    // exportés sans aucun bouton ni appelant — `supprimerEvaluationDepuisProfil`,
    // `attribuerJetonPersonnaliseAvecPrompt`, `retirerJetonPersonnaliseAvecConfirmation`
    // (remesurés dans js/, index.html et tests/, chaîne comprise) — retirés, pas câblés.
    window.consulterEvaluation                       = consulterEvaluation;
    window.calculerDetailsNoteFinale                 = calculerDetailsNoteFinale;
    window.calculerEtStockerPatternsGroupe           = calculerEtStockerPatternsGroupe;
    window.obtenirPatternEtudiant                    = obtenirPatternEtudiant;
})();
