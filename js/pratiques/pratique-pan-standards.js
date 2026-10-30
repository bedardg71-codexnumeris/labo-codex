/**
 * PRATIQUE PAN-STANDARDS - Implémentation complète
 *
 * Pratique PAN Standards-Based Grading (SBG) selon l'approche de Grégoire Bédard.
 * Évaluation formative basée sur les N meilleurs artefacts de portfolio.
 *
 * CARACTÉRISTIQUES :
 * - Échelle de niveaux (ex: IDME - Incomplet, en Développement, Maîtrisé, Étendu)
 * - ✅ Critères d'évaluation configurables (grille de référence)
 * - Performance calculée sur N meilleurs artefacts (configurable: 3, 7 ou 12)
 * - Meilleur résultat retenu (non-rétrogradable)
 * - Détection défis spécifiques par critère
 * - Cibles RàI personnalisées selon pattern et défi principal
 *
 * TAXONOMIE : PAN-Standards (Standards-Based Grading)
 * - Distinction avec PAN-Spécifications (Pass/Fail, bundles)
 * - Distinction avec PAN-Dénotation (sans notes pendant le cours)
 *
 * VERSION : 2.0 (Taxonomie 4 familles)
 * DATE : 25 décembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

/**
 * Suggestion holistique partagée (mode / médiane / moyenne des notes par objectif).
 *
 * Helper PUR extrait de _calculerModeHolistique (#318, DEN-1) pour être réutilisé
 * SANS instancier une PratiquePANStandards entière :
 *  - STD (mode holistique) l'appelle ci-dessous — comportement strictement identique
 *    à l'avant-extraction (sentinelle de parité, golden master) ;
 *  - l'UI de saisie DEN (couche 2, DEN-2) l'appellera comme ANCRAGE de la note
 *    (« l'algorithme propose, le jugement tranche »), jamais comme valeur
 *    finale du calcul.
 *
 * @param {Array<{note:number}|null>} niveauxParObjectif - niveaux atteints par objectif
 *   (sortie de _calculerNiveauxParObjectif : un élément par objectif, ou null)
 * @param {'mode'|'mediane'|'moyenne'} methode
 * @returns {number|null} note suggérée en décimal 0-1, ou null si aucune note exploitable
 */
function suggererNoteHolistique(niveauxParObjectif, methode) {
    if (!Array.isArray(niveauxParObjectif)) return null;

    const notes = niveauxParObjectif
        .map(niveau => (niveau ? niveau.note : undefined))
        .filter(n => n !== undefined && n !== null);

    if (notes.length === 0) return null;

    switch (methode) {
        case 'mode': {
            // Mode : note la plus fréquente
            const frequences = {};
            notes.forEach(n => {
                const key = Math.round(n * 100);
                frequences[key] = (frequences[key] || 0) + 1;
            });
            const modeKey = Object.entries(frequences).reduce((a, b) => b[1] > a[1] ? b : a)[0];
            return parseInt(modeKey) / 100;
        }
        case 'mediane': {
            const sorted = [...notes].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        case 'moyenne':
        default: {
            return notes.reduce((a, b) => a + b, 0) / notes.length;
        }
    }
}

class PratiquePANStandards {

    constructor() {
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
    }

    // ========================================================================
    // MÉTHODES D'IDENTITÉ (Interface IPratique)
    // ========================================================================

    obtenirNom() {
        return "PAN-Standards";
    }

    obtenirId() {
        return "standards";
    }

    obtenirDescription() {
        return "Pratique PAN-Standards (SBG) basée sur les N meilleurs artefacts de portfolio " +
               "avec évaluation par niveaux de maîtrise et critères configurables.";
    }

    // Représentations (Session B) — déléguées au registre (source unique)
    obtenirCode() { return window.obtenirCodePratique(this.obtenirId()); }
    obtenirCouleur() { return window.obtenirCouleurPratique(this.obtenirId()); }
    obtenirLabelFamille() { return window.obtenirLabelFamillePratique(this.obtenirId()); }

    // Session C — source unique des modalités de calcul.
    // Pour la pratique ACTIVE : repli sur le SSOT global `modalitesEvaluation`
    // (décision b, comportement strictement identique à avant). Une instance
    // SIMULÉE (#307) peut porter `this.config.modalites` pour calculer une pratique
    // NON active sur les mêmes données. Ce singleton n'a pas de `this.config` →
    // retourne donc toujours le global : aucun changement de comportement.
    _modalites() {
        if (this.config && this.config.modalites) return this.config.modalites;
        return db.getSync(cle('modalitesEvaluation'), null) || {};
    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon PAN-Standards
     *
     * Formule : Selon la modalité configurée dans la pratique active (pratiquesConfigurables)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // #435 (9 août 2026) — le routage « par-objectifs » est RETIRÉ, extension
        // de la décision #396 (Grégoire, 5 août : retirer les chemins par
        // objectifs jamais fonctionnels). Celui-ci avait le même défaut de
        // naissance que pan_par_objectif : _calculerNiveauxParObjectif apparie
        // les productions par `objectifId` (AUCUN écrivain dans js/) ou par
        // égalité stricte texte-libre ↔ nom d'objectif. Une modalité stockée
        // portant encore `varianteCalcul: 'par-objectifs'` tombe désormais dans
        // le calcul portfolio ci-dessous — qui, lui, calcule.

        // #339 (15 oct. 2026) : le détour par `calculerNoteAvecCategories` (Sélection/Obligatoires) est retiré
        // avec la fonction — la note hybride n'a plus qu'un moteur, celui du profil (`calculerDetailsNoteFinale`).

        // Lire configuration
        const config = this._lireConfiguration();
        const portfolioActif = config.portfolioActif;
        const nombreARetenir = config.nombreARetenir;
        const methodeSelection = config.methodeSelection;

        // Si portfolio désactivé, retourner null (productions indépendantes)
        if (!portfolioActif) {
            return null;
        }

        // Lire les évaluations et productions
        // #326 R2 : injection mémoire prioritaire (banc de décision) ; repli inchangé.
        const evaluations = this._lireEvaluations();
        const productions = (typeof obtenirDonneesSimulationOuNull === 'function' && obtenirDonneesSimulationOuNull('productions')) || db.getSync(cle('productions'), []);

        // #394 (D1) : rôles des productions par la SSOT partagée avec le chemin riche
        // (pratique-registre.js) — terminale = type === 'terminale' STRICT, jamais
        // une inférence par pondération ; pool = artefacts déclarés sinon productions
        // non pondérées ; récence = numéro de production.
        const productionTerminale = window.identifierProductionTerminale(productions);
        const terminalId = productionTerminale?.id || null;
        const artefactsIds = window.obtenirArtefactsIdsPoolStd(productions, terminalId);
        const parRecence = window.creerComparateurRecenceStd(productions);

        // Filtrer les évaluations de cet étudiant sur les artefacts du pool — #706 : la règle
        // unique du registre (remplacées, sans note, brouillons, portée nulle : hors note).
        // 28 oct. 2026 : une copie non recevable sort du portfolio (règle par défaut du registre), comme au chemin riche.
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            window.evaluationEntreDansLaNote(e) &&
            (!window.valeurCopieNonRecevable(e) || window.valeurCopieNonRecevable(e).dansLePortfolio)
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // Appliquer la logique de sélection selon la modalité — triée et sommée sur la note que le calcul retient
        // (registre, 28 oct. 2026) : un réglage qui garderait la copie non recevable au pool n'aurait rien à changer ici.
        const noteRetenue = (e) => window.noteRetenueParLeCalcul(e);
        let artefactsRetenus = [];

        switch (methodeSelection) {
            case 'meilleurs':
                // Trier par note décroissante et prendre les N meilleurs
                evaluationsEleve.sort((a, b) => noteRetenue(b) - noteRetenue(a));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents':
                // Trier par récence (SSOT #394) et prendre les N plus récents
                evaluationsEleve.sort(parRecence);
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents-meilleurs':
                // Filtrer top 50% par note, puis prendre les N plus récents
                const nombreMeilleurs = Math.max(1, Math.ceil(evaluationsEleve.length * 0.5));
                evaluationsEleve.sort((a, b) => noteRetenue(b) - noteRetenue(a));
                const topMeilleurs = evaluationsEleve.slice(0, nombreMeilleurs);
                topMeilleurs.sort(parRecence);
                artefactsRetenus = topMeilleurs.slice(0, nombreARetenir);
                break;

            case 'tous':
                // Tous les artefacts
                artefactsRetenus = evaluationsEleve;
                break;

            default:
                console.warn(`[PAN] Modalité inconnue: ${methodeSelection}, utilisation de 'meilleurs' par défaut`);
                evaluationsEleve.sort((a, b) => noteRetenue(b) - noteRetenue(a));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;
        }

        // Calculer la moyenne du pool (N artefacts retenus)
        const somme = artefactsRetenus.reduce((acc, e) => acc + noteRetenue(e), 0);
        const moyennePortfolio = somme / artefactsRetenus.length;

        // #394 (D1) : agrégation pool + terminale ALIGNÉE sur le chemin riche.
        // Pas de terminale typée → rien n'en tient lieu, le pool vaut 100 %.
        if (!productionTerminale) {
            return moyennePortfolio / 100;
        }

        // Trouver l'évaluation de l'étudiant sur l'évaluation terminale (#706 : un brouillon
        // de terminale n'est pas une terminale — la note reste provisoire)
        const evalTerminale = evaluations.find(e =>
            e.etudiantDA === da &&
            e.productionId === productionTerminale.id &&
            window.evaluationEntreDansLaNote(e)
        );

        // Si l'évaluation terminale n'est pas encore faite, note provisoire = pool seul
        if (!evalTerminale) {
            return moyennePortfolio / 100;
        }

        // Pondérations SAISIES par l'utilisateur — les défauts 60/40 sont morts (D1).
        // Conteneur portfolio optionnel : absent → règle du complément (pool = 100 − p).
        const productionPortfolio = productions.find(p => p.type === 'portfolio');
        const ponderationTerminale = productionTerminale.ponderation;
        if (ponderationTerminale == null) {
            return null; // pondération manquante → non constructible (parité chemin riche)
        }
        let ponderationPortfolio;
        if (!productionPortfolio) {
            ponderationPortfolio = Math.max(0, 100 - ponderationTerminale);
        } else {
            ponderationPortfolio = productionPortfolio.ponderation;
            if (ponderationPortfolio == null) {
                return null; // pondération manquante → non constructible (parité chemin riche)
            }
        }
        const totalPonderation = ponderationPortfolio + ponderationTerminale;
        if (!(totalPonderation > 0)) {
            return null; // 0/0 : configuration invalide, jamais un NaN
        }

        const moyennePonderee = (
            (moyennePortfolio * ponderationPortfolio / totalPonderation) +
            (window.noteRetenueParLeCalcul(evalTerminale) * ponderationTerminale / totalPonderation)   // 28 oct. : non recevable → 0
        );

        return moyennePonderee / 100;
    }

    // Lot 2 des standards sans portfolio (29 oct. 2026) : `calculerPerformanceRecente` est retirée — aucun appelant
    // (git grep sur js/ et tests/), et elle refaisait sa propre sélection (« N plus récents » par date).

    /**
     * Calcule l'indice C (Complétion) selon PAN-Standards
     *
     * Formule : Nombre d'artefacts portfolio remis / Nombre d'artefacts évalués
     * Un artefact est considéré "évalué" si au moins une évaluation existe pour celui-ci
     * (pas seulement "créé dans le système")
     *
     * #871 (17 sept. 2026) : rend le DÉTAIL — { remis, total } — et non plus le quotient ; `calculerCompletion`
     * en découle (plus bas). Ce que cette famille compte n'a pas changé.
     * @param {string} da - Numéro de dossier d'admission
     * @returns {{remis:number,total:number}|null} Le détail de la complétion, ou null si pas de données
     */
    calculerDetailsCompletion(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // ✅ CORRECTION (11 déc 2025): Utiliser dateEcheance pour identifier les travaux assignés
        // C = travaux certifiés remis / travaux assignés (avec dateEcheance)

        // Lire les productions
        const productions = this._lireProductions();

        // Lire les évaluations
        const evaluations = this._lireEvaluations();

        // 1. Identifier les travaux ASSIGNÉS (ont une dateEcheance et ne sont pas facultatifs)
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe + assignee)
        const infoCoursC = db.getSync('infoCours', null);
        const gcIdC = obtenirIdContexteActif(infoCoursC);
        const travauxAssignes = productions.filter(p => {
            if (p.facultatif || p.type === 'portfolio') return false;
            if (typeof obtenirEcheanceEffective === 'function') {
                const { date, assignee } = obtenirEcheanceEffective(p, gcIdC);
                return assignee && !!date;
            }
            return !!p.dateEcheance;
        });

        if (travauxAssignes.length === 0) {
            return null;
        }

        // 2. Compter combien CET ÉTUDIANT a remis — lot A du 16 sept. 2026 (#737, #738) : une copie
        // qui COMPTE (enregistrée, règle unique #706) et qui n'est pas NON REMISE (les deux chaînes).
        // Lot 30 (17 sept. 2026) — LE DÉTAIL DIT AUSSI LESQUELLES : `productions` porte chaque production comptée au
        // dénominateur et si elle est remise ; `remis` en est le compte (jamais un second calcul). La carte Complétion
        // du profil y lit sa liste des non-remises et son message, comme la fraction (DEMO006 : « 9/10 » à côté de
        // « tous les artefacts remis ! » — la terminale manquante n'était nulle part).
        const detailProductions = travauxAssignes.map(travail => ({
            id: travail.id,
            remis: evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === travail.id &&
                window.evaluationCompteCommeRemise(e, evaluations)   // lot 30 (17 sept.) et le statut incomplet (25 oct. 2026) : la règle de pratique-registre.js
            )
        }));

        return { remis: detailProductions.filter(p => p.remis).length, total: detailProductions.length, productions: detailProductions };
    }

    /**
     * #871, volet complétion (17 sept. 2026) — L'INDICE C DÉCOULE DU DÉTAIL, jamais l'inverse.
     * « Le pourcentage doit suivre la fraction » (Grégoire, 15 sept.) : `calculerDetailsCompletion` compte,
     * ici on divise. Le profil et le rapport lisent le même détail (`obtenirDetailsCompletion`, portfolio.js) :
     * la fraction affichée à côté de C ne peut plus compter autre chose que lui.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number|null} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
        const details = this.calculerDetailsCompletion(da);
        return details ? details.remis / details.total : null;
    }

    // ========================================================================
    // MÉTHODES D'ANALYSE (Interface IPratique)
    // ========================================================================

    /**
     * Détecte les défis SRPNF de l'étudiant sur les N derniers artefacts
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type: 'srpnf', defis: [], forces: [] }
     */
    detecterDefis(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return { type: 'srpnf', defis: [], forces: [] };
        }

        // Calculer moyennes SRPNF sur N derniers artefacts
        const moyennes = this._calculerMoyennesCriteresRecents(da);

        if (!moyennes) {
            return { type: 'srpnf', defis: [], forces: [] };
        }

        // Diagnostiquer forces et défis
        const diagnostic = this._diagnostiquerForcesChallenges(moyennes);

        return {
            type: 'srpnf',
            defis: diagnostic.defis,
            forces: diagnostic.forces,
            principalDefi: diagnostic.principalDefi,
            principaleForce: diagnostic.principaleForce
        };
    }

    /**
     * Identifie le pattern d'apprentissage de l'étudiant
     *
     * Patterns PAN :
     * - Difficulté persistante : sous le repère de suffisance de l'échelle
     * - Difficulté émergente : sous le repère de maîtrise ET a un défi
     * - Défi spécifique : Performance acceptable mais a un défi récurrent
     * - Stable : Pas de défi ou performance maîtrisée
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, description, indices, couleur, recommandation }
     */
    identifierPattern(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return {
                type: 'inconnu',
                description: 'DA invalide',
                couleur: '#999999'
            };
        }

        // Calculer performance sur N derniers artefacts
        const indices3Derniers = this._calculerIndicesTroisDerniersArtefacts(da);
        const performancePAN3 = indices3Derniers.performance;

        // Détecter s'il y a un défi
        const defis = this.detecterDefis(da);
        const aUnDefi = defis.principalDefi !== null;

        // Identifier le pattern
        const patternType = this._identifierPatternActuel(performancePAN3, aUnDefi);

        // Générer description et recommandation
        let description, couleur, recommandation;

        switch (patternType) {
            case 'Difficulté persistante':
                description = 'Difficulté persistante - Risque d\'échec élevé';
                couleur = '#dc3545'; // Rouge
                recommandation = 'Intervention intensive immédiate (Niveau 3 RàI)';
                break;

            case 'Difficulté émergente':
                description = 'Difficulté émergente - Performance en développement avec défis';
                couleur = '#ff9800'; // Orange
                recommandation = 'Intervention préventive ciblée (Niveau 2 RàI)';
                break;

            case 'Défi spécifique':
                description = 'Défi spécifique - Performance acceptable mais défis récurrents';
                couleur = '#ffc107'; // Ambre
                recommandation = 'Suivi régulier et renforcement (Niveau 1-2 RàI)';
                break;

            case 'Stable':
                description = 'Stable - Maîtrise en développement sans défis majeurs';
                couleur = '#4caf50'; // Vert
                recommandation = 'Maintenir l\'engagement et encourager';
                break;

            default:
                description = 'Pattern non identifié';
                couleur = '#999999'; // Gris
                recommandation = 'Collecte de données insuffisante';
        }

        return {
            type: patternType,
            description: description,
            indices: {
                P: performancePAN3,
                nbArtefacts: indices3Derniers.nbArtefacts
            },
            couleur: couleur,
            recommandation: recommandation
        };
    }

    /**
     * Génère une cible d'intervention RàI personnalisée
     *
     * Cible basée sur :
     * - Pattern actuel (Difficulté persistante/émergente, Défi spécifique, Stable)
     * - Défi principal SRPNF identifié
     * - Niveau de français (indicateur secondaire)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, cible, strategies, ressources, niveau }
     */
    genererCibleIntervention(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Obtenir le pattern et les défis
        const pattern = this.identifierPattern(da);
        const defis = this.detecterDefis(da);

        const defiPrincipal = defis.principalDefi ? defis.principalDefi.nom : 'Aucun';

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        // Logique de décision selon pattern et défi principal
        return this._determinerCibleIntervention(
            pattern.type,
            defiPrincipal,
            pattern.indices.P
        );
    }

    // ========================================================================
    // MÉTHODES PRIVÉES (HELPERS)
    // ========================================================================

    /**
     * Lit la configuration du pool (portfolio) de la pratique
     * #394 (L10) : source canonique = pratiquesConfigurables via
     * obtenirConfigPratiqueActive (Phase G2-a) — la source legacy
     * modalitesEvaluation.configPAN, qui driftait à l'édition wizard, n'est
     * plus consultée. Repli explicite : défauts neutres (3 / meilleurs) pour
     * l'id registre 'standards' sans configurable associée.
     * Une instance SIMULÉE (#307) peut porter sa config via this.config.modalites
     * (chemin conservé pour la parité du banc de décision).
     * @private
     */
    _lireConfiguration() {
        let portfolio = null;

        if (this.config && this.config.modalites && this.config.modalites.configPAN) {
            // Instance simulée (#307) : config injectée, pas de lecture du stockage.
            portfolio = this.config.modalites.configPAN.portfolio || null;
        } else if (typeof obtenirConfigPratiqueActive === 'function') {
            const cfgActive = obtenirConfigPratiqueActive();
            portfolio = (cfgActive && cfgActive.portfolio) || null;
        }

        let methodeSelection = (portfolio && portfolio.methodeSelection) || 'meilleurs';
        if (methodeSelection === 'derniers') methodeSelection = 'recents'; // alias legacy (parité chemin riche)

        return {
            nombreCours: 3,                                                        // fenêtre « récents » du dépistage (3 cours = 6 artefacts)
            portfolioActif: portfolio ? portfolio.actif !== false : true,
            // E12 (mesure du 28 oct. 2026) : ces défauts ne sont pas ceux du chemin riche (N = 4, profil-etudiant-actions.js),
            // et l'instance n'a ni hybride ni plafonnement. Sans conséquence : `calculerNoteDuCours` (portfolio.js) ne
            // l'atteint jamais pour une standards ; la note est celle de `calculerDetailsNoteFinale`.
            nombreARetenir: (portfolio && portfolio.nombreARetenir) || 3,
            minimumCompletion: (portfolio && portfolio.minimumCompletion) || 7,
            methodeSelection: methodeSelection
        };
    }

    /**
     * Lit les évaluations depuis db.getSync
     * @private
     */
    _lireEvaluations() {
    // #790, PORTES 1 ET 3 — LA NOTE, L'INDICE P ET LA COMPLÉTION, EN UN SEUL POINT.
    // ⮕ LE FILTRE EST POSÉ ICI, DANS L'ACCESSEUR, ET PAS DANS CHAQUE CALCUL. Motif
    // mesuré : tous les appelants de ces deux accesseurs sont des CALCULS
    // (performance, historique, complétion, défis, patterns, données du profil) —
    // aucun n'affiche la liste des copies d'un élève. Poser l'exclusion dans chaque
    // `calculer*` aurait fait huit sites à tenir alignés, et le neuvième écrit dans
    // six mois serait passé au travers.
    // ⚠ CE QUI RESTE VISIBLE, ET C'EST LA DÉCISION : la production diagnostique
    // demeure ENTIÈRE dans le dossier de l'élève — copie, annotation, rétroaction,
    // résultat. Le dossier ne passe pas par ces accesseurs. On lui retire son poids,
    // pas son existence.
        // Utiliser obtenirDonneesSelonMode si disponible, sinon db.getSync direct
        const brutes = (typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
            : db.getSync(cle('evaluationsSauvegardees'), []);
        return window.ProductionDiagnostique
            ? window.ProductionDiagnostique.filtrerEvaluations(brutes, this._lireProductionsBrutes())
            : brutes;
    }

    /**
     * Les productions TELLES QU'ELLES SONT EN BASE, diagnostiques comprises — voir
     * la note de `_lireEvaluations` : sans elles, une copie diagnostique n'a plus de
     * production à laquelle se rattacher, et passe au travers du filtre.
     * @private
     */
    _lireProductionsBrutes() {
        return obtenirDonneesSelonMode('productions') || [];
    }

    /**
     * Retourne les IDs des productions du pool d'artefacts STD
     * #394 : délègue à la SSOT partagée avec le chemin riche (pratique-registre.js) —
     * artefacts déclarés, sinon repli sur les productions non pondérées.
     * @private
     */
    _lireArtefactsPortfolio() {
        // ✅ CORRECTION (30 déc 2025): Utiliser obtenirDonneesSelonMode pour respecter coursId
        const productions = this._lireProductions();
        const terminale = window.identifierProductionTerminale(productions);
        return window.obtenirArtefactsIdsPoolStd(productions, terminale?.id || null);
    }

    /**
     * Lit toutes les productions depuis le stockage
     * @private
     * @returns {Array} Liste des productions
     */
    _lireProductions() {
        const brutes = this._lireProductionsBrutes();
        return window.ProductionDiagnostique
            ? window.ProductionDiagnostique.filtrerProductions(brutes)
            : brutes;
    }

    /**
     * Obtient la grille de référence configurée pour le dépistage
     * @private
     * @returns {Object|null} Grille avec critères ou null si non configurée
     */
    _obtenirGrilleReference() {
        const grilleId = obtenirPreference('grilleReferenceDepistage');

        if (!grilleId) {
            console.warn('⚠️ [PAN-Standards] Aucune grille de référence configurée');
            return null;
        }

        // 🆕 #358 (Option A) : résolution namespacée par id (actif puis repli pool) —
        // la grille de référence de dépistage peut vivre dans un autre trimestre que
        // l'actif consulté (la préférence grilleReferenceDepistage est globale).
        const grille = (typeof resoudreModeleParId === 'function')
            ? resoudreModeleParId('grille', grilleId)
            : ((db.getSync('grillesTemplates', []) || []).find(g => g.id === grilleId) || null);

        if (!grille) {
            console.error(`❌ [PAN-Standards] Grille "${grilleId}" introuvable`);
            return null;
        }

        return grille;
    }

    /**
     * Cherche les interventions RàI configurées pour un critère spécifique
     * Supporte le nouveau format avec interventions{} dans la grille
     *
     * @private
     * @param {string} nomCritere - Nom du critère (ex: "Français", "Structure")
     * @param {number} niveau - Niveau RàI (1, 2 ou 3)
     * @returns {Object|null} { cible, strategies } ou null si non configuré
     */
    _obtenirInterventionConfiguree(nomCritere, niveau) {
        const grille = this._obtenirGrilleReference();
        if (!grille || !grille.criteres) {
            return null;
        }

        // Trouver le critère correspondant (insensible aux accents/casse)
        const critere = grille.criteres.find(c => {
            const nomRef = c.nom.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '');
            const nomRecherche = nomCritere.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '');

            return nomRef === nomRecherche ||
                   nomRef.startsWith(nomRecherche) ||
                   nomRecherche.startsWith(nomRef);
        });

        if (!critere || !critere.interventions) {
            return null;
        }

        // Chercher l'intervention pour le niveau spécifique
        const interventionNiveau = critere.interventions[`niveau${niveau}`];

        if (interventionNiveau && interventionNiveau.cible && interventionNiveau.strategies) {
            return {
                cible: interventionNiveau.cible,
                strategies: interventionNiveau.strategies
            };
        }

        return null;
    }

    /**
     * Calcule les moyennes des critères sur les N derniers artefacts
     * ✅ VERSION UNIVERSELLE - Utilise la grille de référence configurée
     *
     * Extrait les critères depuis retroactionFinale avec regex dynamique
     * Format attendu: "CRITÈRE (NIVEAU)" ex: "STRUCTURE (M)"
     *
     * @private
     * @param {string} da - Numéro DA
     * @returns {Object|null} Moyennes par critère (clés capitalisées) ou null
     */
    _calculerMoyennesCriteresRecents(da) {
        // ✅ Obtenir la grille de référence configurée
        const grille = this._obtenirGrilleReference();
        if (!grille || !grille.criteres || grille.criteres.length === 0) {
            console.warn('⚠️ [PAN-Standards] Pas de grille de référence - calcul impossible');
            return null;
        }

        const config = this._lireConfiguration();
        const nombreArtefacts = config.nombreCours * 2; // 3 cours = 6 artefacts

        const evaluations = this._lireEvaluations();
        const artefactsIds = this._lireArtefactsPortfolio();

        // Filtrer évaluations de cet étudiant sur artefacts portfolio
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            e.retroactionFinale &&
            !e.remplaceeParId
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // Trier par date (plus récent d'abord)
        evaluationsEleve.sort((a, b) => {
            const dateA = a.dateEvaluation || a.dateCreation || 0;
            const dateB = b.dateEvaluation || b.dateCreation || 0;
            return new Date(dateB) - new Date(dateA);
        });

        // Prendre les N derniers
        const derniersArtefacts = evaluationsEleve.slice(0, nombreArtefacts);

        // #529 (26 août 2026) — CE BLOC LISAIT LA PROSE, LUI AUSSI.
        //
        // Il construisait une regex depuis les noms de critères de la grille
        // — ce qui était déjà mieux que son jumeau de `profil-etudiant-calculs`
        // — puis la faisait courir sur `retroactionFinale` avec les codes de
        // niveau EN DUR : `\(([IDME0])\)`. Une échelle A/B/C/D ne matchait donc
        // rien, et le diagnostic « forces et défis » de la pratique PAN restait
        // vide sans le dire.
        //
        // Les scores vivent dans `evaluation.criteres[]` (structuré, depuis la
        // création du dépôt). Deux chemins lisaient la même chose de deux
        // façons différentes ; il n'en reste qu'une.
        const cacheTables = new Map();

        derniersArtefacts.forEach(evaluation => {
            if (!Array.isArray(evaluation.criteres)) return;
            const tableEvaluation = this._obtenirTableConversionNiveaux(evaluation.echelleId);
            evaluation.criteres.forEach(critereSauvegarde => {
                if (!critereSauvegarde) return;
                const score = this._convertirNiveauEnScore(critereSauvegarde.niveauSelectionne, tableEvaluation);
                if (score === null) return;

                const nomEval = String(critereSauvegarde.critereNom || '').toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
                if (!nomEval) return;

                const critereReference = grille.criteres.find(c => {
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
                    return nomRef === nomEval || nomRef.startsWith(nomEval) || nomEval.startsWith(nomRef);
                });
                if (!critereReference) return;

                const cleNormalisee = critereReference.nom.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
                if (scoresCriteres[cleNormalisee]) scoresCriteres[cleNormalisee].push(score);
            });
        });

        // Calculer moyennes
        const moyennes = {};
        let aucuneDonnee = true;

        Object.keys(scoresCriteres).forEach(cleNormalisee => {
            const scores = scoresCriteres[cleNormalisee];

            // Trouver le nom original du critère pour la clé capitalisée
            const critereOriginal = grille.criteres.find(c => {
                const cle = c.nom.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '');
                return cle === cleNormalisee;
            });

            const cleFormatee = critereOriginal ? critereOriginal.nom : cleNormalisee;

            if (scores.length > 0) {
                moyennes[cleFormatee] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                aucuneDonnee = false;
            } else {
                moyennes[cleFormatee] = null;
            }
        });

        return aucuneDonnee ? null : moyennes;
    }

    /**
     * Diagnostique forces et défis selon moyennes des critères
     * ✅ VERSION UNIVERSELLE - Utilise la grille de référence configurée
     *
     * @private
     * @param {Object} moyennes - Moyennes par critère (clés = noms des critères)
     * @returns {Object} { forces[], defis[], principaleForce, principalDefi }
     */
    _diagnostiquerForcesChallenges(moyennes) {
        // Utiliser seuil configurable (défaut 70%, `SEUILS_PAR_DEFAUT`)
        // #555 lot 2 (28 août 2026) — repli `|| 0.75` retiré : il contredisait la
        // source (0,70) et `_obtenirSeuil` garantit déjà une valeur. Le « défaut
        // 75% » de la ligne ci-dessus datait du même malentendu : corrigé aussi,
        // un commentaire faux survit plus longtemps qu'un repli mort.
        const seuil = this._obtenirSeuil('defiSpecifique');

        if (!moyennes) {
            return {
                forces: [],
                defis: [],
                principaleForce: null,
                principalDefi: null
            };
        }

        // ✅ Construire dynamiquement le tableau de critères depuis moyennes
        const criteres = Object.keys(moyennes)
            .filter(nom => moyennes[nom] !== null)
            .map(nom => {
                const cleNormalisee = nom.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '');

                return {
                    nom: nom,
                    cle: cleNormalisee,
                    score: moyennes[nom]
                };
            });

        const forces = criteres
            .filter(c => c.score >= seuil)
            .sort((a, b) => b.score - a.score);

        const defis = criteres
            .filter(c => c.score < seuil)
            .sort((a, b) => a.score - b.score);

        return {
            forces: forces,
            defis: defis,
            principaleForce: forces.length > 0 ? forces[0] : null,
            principalDefi: defis.length > 0 ? defis[0] : null
        };
    }

    /**
     * Calcule indices sur les N derniers artefacts (pour pattern actuel)
     *
     * @private
     * @param {string} da - Numéro DA
     * @returns {Object} { performance, nbArtefacts }
     */
    _calculerIndicesTroisDerniersArtefacts(da) {
        const config = this._lireConfiguration();
        const nombreArtefacts = config.nombreCours * 2;

        const evaluations = this._lireEvaluations();
        const artefactsIds = this._lireArtefactsPortfolio();

        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            window.evaluationEntreDansLaNote(e)   // #737 (lot A, 16 sept. 2026) : un brouillon ne compte nulle part
        );

        if (evaluationsEleve.length === 0) {
            return {
                performance: 0,
                nbArtefacts: 0
            };
        }

        // Trier par date (plus récent d'abord)
        evaluationsEleve.sort((a, b) => {
            const dateA = a.dateEvaluation || a.dateCreation || 0;
            const dateB = b.dateEvaluation || b.dateCreation || 0;
            return new Date(dateB) - new Date(dateA);
        });

        const derniers = evaluationsEleve.slice(0, nombreArtefacts);

        // Performance moyenne
        const performance = derniers.reduce((sum, e) => sum + e.noteFinale, 0) / derniers.length / 100;

        // #536 (11 oct. 2026) — `idmeMoyen` retiré, avec sa conversion des niveaux finaux
        // et `_tablePour` : aucun lecteur (jumeau du retrait dans profil-etudiant-calculs).

        // #553 — la « moyenne du critère de langue » est retirée. Elle reconnaissait ce
        // critère par son NOM (`startsWith('francais')`), et sa valeur n'avait plus aucun
        // lecteur depuis #552 : jumelle du retrait fait le 27 août dans
        // `profil-etudiant-calculs` (#537). Le critère de langue est un critère comme un autre.

        return {
            performance: performance,
            nbArtefacts: derniers.length
        };
    }

    /**
     * Identifie le pattern actuel selon performance et présence de défis
     *
     * @private
     * @param {number} performancePAN3 - Performance sur N derniers (0-1)
     * @param {boolean} aUnDefi - Si l'étudiant a au moins un défi
     * @returns {string} 'Difficulté persistante'|'Difficulté émergente'|'Défi spécifique'|'Stable'
     */
    _identifierPatternActuel(performancePAN3, aUnDefi) {
        // Une seule règle : celle de la carte RàI (30 oct. 2026), qui lit les repères de l'échelle.
        return window.identifierPatternActuel(performancePAN3, aUnDefi);
    }

    /**
     * Détermine la cible d'intervention RàI selon pattern et défi principal
     * ✅ VERSION UNIVERSELLE - Système à 2 niveaux :
     *    1. Cherche interventions configurées dans la grille
     *    2. Sinon, utilise recommandations génériques intelligentes
     *
     * @private
     * @param {string} pattern - Pattern actuel
     * @param {string} defiPrincipal - Nom du défi principal (critère de la grille)
     * @param {number} performance - Performance actuelle (0-1)
     * @returns {Object} { type, cible, strategies, ressources, niveau, couleur, emoji }
     */
    _determinerCibleIntervention(pattern, defiPrincipal, performance) {
        // Cible par défaut
        let cible = {
            type: 'critere-grille',
            cible: defiPrincipal,
            strategies: [],
            ressources: [],
            niveau: 1,
            couleur: '#4caf50'
        };

        // DIFFICULTÉ PERSISTANTE (Niveau 3 RàI)
        if (pattern === 'Difficulté persistante') {
            cible.niveau = 3;
            cible.couleur = '#dc3545';

            // ✅ NIVEAU 1 : Chercher intervention configurée dans la grille
            const interventionConfig = this._obtenirInterventionConfiguree(defiPrincipal, 3);
            if (interventionConfig) {
                cible.cible = interventionConfig.cible;
                cible.strategies = interventionConfig.strategies;
            } else {
                // ✅ NIVEAU 2 : Recommandations génériques intelligentes
                cible.cible = `Remédiation intensive en ${defiPrincipal}`;
                cible.strategies = [
                    `Rencontre individuelle pour diagnostic approfondi`,
                    `Exercices de remédiation ciblés sur ${defiPrincipal}`,
                    `Référence aux ressources d'aide disponibles`,
                    `Plan d'action personnalisé avec suivi hebdomadaire`
                ];
            }
        }

        // DIFFICULTÉ ÉMERGENTE (Niveau 2 RàI)
        else if (pattern === 'Difficulté émergente') {
            cible.niveau = 2;
            cible.couleur = '#ff9800';

            // ✅ NIVEAU 1 : Chercher intervention configurée dans la grille
            const interventionConfig = this._obtenirInterventionConfiguree(defiPrincipal, 2);
            if (interventionConfig) {
                cible.cible = interventionConfig.cible;
                cible.strategies = interventionConfig.strategies;
            } else {
                // ✅ NIVEAU 2 : Recommandations génériques intelligentes
                cible.cible = `Intervention préventive sur ${defiPrincipal}`;
                cible.strategies = [
                    `Renforcement ciblé sur ${defiPrincipal}`,
                    `Pratique délibérée avec feedback formatif`,
                    `Suivi régulier des progrès`,
                    `Consultation ressources d'aide si disponibles`
                ];
            }
        }

        // DÉFI SPÉCIFIQUE (Niveau 1-2 RàI)
        else if (pattern === 'Défi spécifique') {
            cible.niveau = 1;
            cible.couleur = '#ffc107';

            // ✅ NIVEAU 1 : Chercher intervention configurée dans la grille
            const interventionConfig = this._obtenirInterventionConfiguree(defiPrincipal, 1);
            if (interventionConfig) {
                cible.cible = interventionConfig.cible;
                cible.strategies = interventionConfig.strategies;
            } else {
                // ✅ NIVEAU 2 : Recommandations génériques intelligentes
                cible.cible = `Renforcement sur ${defiPrincipal}`;
                cible.strategies = [
                    `Exercices supplémentaires ciblés sur ${defiPrincipal}`,
                    `Feedback formatif régulier`,
                    `Auto-évaluation guidée`
                ];
            }
        }

        // STABLE (Niveau 1 RàI - Universel)
        else {
            cible.niveau = 1;
            cible.couleur = '#4caf50';
            cible.cible = 'Maintien et consolidation';
            cible.strategies = [
                'Encourager la persévérance',
                'Viser l\'excellence (niveau E)',
                'Développer l\'autonomie'
            ];
        }

        // Ajouter ressources génériques
        cible.ressources = [
            'Guide de rétroaction formative',
            'Capsules vidéo sur les critères d\'évaluation',
            'Grilles d\'auto-évaluation'
        ];

        return cible;
    }

    /**
     * Obtient la table de conversion IDME (niveaux → scores)
     * @private
     */
    _obtenirTableConversionNiveaux(echelleId) {
        // #529 — le repli qui vivait ici est RETIRÉ. Il rendait
        // {I:0.55, D:0.70, M:0.80, E:0.90} — des valeurs qui n'étaient celles
        // de personne, et qui ne s'accordaient MÊME PAS avec l'autre repli du
        // projet ({I:0.40, D:0.65, M:0.75, E:1.00}, profil-etudiant-calculs).
        // Selon le chemin emprunté, un même niveau valait donc 0.55 ou 0.40 :
        // deux vérités pour une seule donnée. Désormais une seule source, et
        // `null` quand elle est absente — au lieu d'un chiffre inventé.
        if (typeof obtenirTableConversionNiveaux === 'function') {
            return obtenirTableConversionNiveaux(echelleId || null);
        }
        return null;
    }

    /**
     * Convertit un niveau IDME en score (0-1)
     * Supporte deux formats de table:
     * - Format complet: {I: {min, max, valeur}, D: {...}, ...}
     * - Format simple: {I: 0.4, D: 0.65, ...}
     * @private
     */
    _convertirNiveauEnScore(niveau, tableConversion) {
        niveau = niveau.trim().toUpperCase();
        const entry = tableConversion[niveau];

        if (entry === null || entry === undefined) {
            return null;
        }

        // Format complet avec objet {min, max, valeur}
        if (typeof entry === 'object' && entry.valeur !== undefined) {
            return entry.valeur;
        }

        // Format simple: nombre direct
        if (typeof entry === 'number') {
            return entry;
        }

        return null;
    }

    /**
     * Obtient un seuil configurable
     * @private
     */
    _obtenirSeuil(nomSeuil) {
        // Utiliser la fonction globale si disponible
        if (typeof obtenirSeuil === 'function') {
            return obtenirSeuil(nomSeuil);
        }

        // Sinon, valeurs par défaut.
        // #555 lot 2 (28 août 2026) — `defiSpecifique` valait 0,75 ICI et 0,70
        // dans `SEUILS_PAR_DEFAUT` (`interpretation-config.js`). Cette table est
        // un MIROIR de la source, atteignable seulement quand `obtenirSeuil` n'est
        // pas chargée (cas de test) : elle doit lui être identique, jamais une
        // seconde convention.
        // Verrouillé par la sentinelle #555 des replis.
        const seuilsDefaut = {
            'defiSpecifique': 0.70
        };

        // Un seuil inconnu est une ERREUR d'appel, pas un cas à deviner : rendre
        // 0,75 au hasard fabriquait une quatrième convention. `undefined` laisse
        // le défaut échoir à l'appelant plutôt que de mentir sur une valeur.
        return seuilsDefaut[nomSeuil];
    }

    // #435 (9 août 2026) — le « système de comptage d'objectifs » (Beta 95) est
    // RETIRÉ : _calculerPerformanceParObjectifs et ses quatre modes (comptage,
    // moyenne-ponderee, seuils-critiques, holistique) sont partis avec le
    // routage de calculerPerformance. `_calculerNiveauxParObjectif` (juste en
    // dessous) et le helper pur `suggererNoteHolistique` SURVIVENT : la
    // suggestion holistique de DEN (denotation-saisie-ui.js) s'en sert — et
    // elle est défensive (null si rien d'exploitable), pas un chemin de note.

    /**
     * Calcule les niveaux atteints par objectif pour un étudiant
     * @returns {Array} Tableau de {note, meilleureNote} par objectif
     */
    _calculerNiveauxParObjectif(da, objectifs) {
        const evaluations = this._lireEvaluations();
        // #326 R2 : injection mémoire prioritaire ; repli inchangé.
        const productions = (typeof obtenirDonneesSimulationOuNull === 'function' && obtenirDonneesSimulationOuNull('productions')) || db.getSync(cle('productions'), []);

        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        return objectifs.map(obj => {
            // Trouver les productions liées à cet objectif
            const productionsObj = productions.filter(p =>
                p.objectifId === obj.id || p.objectif === obj.nom
            );

            if (productionsObj.length === 0) {
                return null;
            }

            // Trouver la meilleure note de l'étudiant pour cet objectif
            const productionsIds = productionsObj.map(p => p.id);
            const evalsObj = evaluationsEleve.filter(e => productionsIds.includes(e.productionId));

            if (evalsObj.length === 0) {
                return null;
            }

            const meilleureNote = Math.max(...evalsObj.map(e => e.noteFinale));
            return {
                note: meilleureNote / 100,
                meilleureNote: meilleureNote
            };
        });
    }

    // (#435 : _convertirNoteEnNiveau est partie avec _calculerModeSeuilsCritiques,
    //  son unique appelant.)
}

// ============================================================================
// AUTO-ENREGISTREMENT
// ============================================================================

(function() {
    // Vérifier que le registre est chargé
    if (typeof window.enregistrerPratique !== 'function') {
        console.error(
            '[PAN-Standards] Le registre n\'est pas chargé ! ' +
            'Assure-toi de charger pratique-registre.js avant pratique-pan-standards.js'
        );
        return;
    }

    // Créer et enregistrer l'instance
    const instance = new PratiquePANStandards();

    try {
        window.enregistrerPratique('standards', instance);
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
    } catch (error) {
        console.error('[PAN-Standards] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export pour utilisation directe
window.PratiquePANStandards = PratiquePANStandards;

// Helper de suggestion holistique partagé (STD + UI de saisie DEN, #318)
window.suggererNoteHolistique = suggererNoteHolistique;

// ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

})();
