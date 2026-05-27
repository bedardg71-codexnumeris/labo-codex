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
        return "pan-standards";
    }

    obtenirDescription() {
        return "Pratique PAN-Standards (SBG) basée sur les N meilleurs artefacts de portfolio " +
               "avec évaluation par niveaux de maîtrise et critères configurables.";
    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon PAN-Standards
     *
     * Formule : Selon la modalité configurée dans modalitesEvaluation.configPAN.portfolio
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // ✅ NOUVEAU (Beta 95) : Vérifier si la variante est "par-objectifs"
        const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
        if (modalites.varianteCalcul === 'par-objectifs') {
            return this._calculerPerformanceParObjectifs(da);
        }

        // 🆕 Beta 95.4 : Vérifier si les catégories Sélection/Obligatoires sont actives
        const configCategories = typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null;
        if (configCategories && configCategories.actif) {
            // Utiliser le calcul avec catégories
            const resultat = typeof calculerNoteAvecCategories === 'function'
                ? calculerNoteAvecCategories(da, configCategories)
                : null;

            if (resultat && resultat.valide) {
                // Convertir en indice 0-1
                return resultat.noteFinale / 100;
            }
            // Si le calcul avec catégories échoue, continuer avec la logique standard
        }

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
        const evaluations = this._lireEvaluations();
        const artefactsIds = this._lireArtefactsPortfolio();

        // Filtrer les évaluations de cet étudiant sur les artefacts portfolio
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            !e.remplaceeParId && // Exclure les évaluations remplacées
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // Appliquer la logique de sélection selon la modalité
        let artefactsRetenus = [];

        switch (methodeSelection) {
            case 'meilleurs':
                // Trier par note décroissante et prendre les N meilleurs
                evaluationsEleve.sort((a, b) => b.noteFinale - a.noteFinale);
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents':
                // Trier par date décroissante et prendre les N plus récents
                evaluationsEleve.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents-meilleurs':
                // Filtrer top 50% par note, puis prendre les N plus récents
                const nombreMeilleurs = Math.max(1, Math.ceil(evaluationsEleve.length * 0.5));
                evaluationsEleve.sort((a, b) => b.noteFinale - a.noteFinale);
                const topMeilleurs = evaluationsEleve.slice(0, nombreMeilleurs);
                topMeilleurs.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
                artefactsRetenus = topMeilleurs.slice(0, nombreARetenir);
                break;

            case 'tous':
                // Tous les artefacts
                artefactsRetenus = evaluationsEleve;
                break;

            default:
                console.warn(`[PAN] Modalité inconnue: ${methodeSelection}, utilisation de 'meilleurs' par défaut`);
                evaluationsEleve.sort((a, b) => b.noteFinale - a.noteFinale);
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;
        }

        // Calculer la moyenne du portfolio (N meilleurs artefacts)
        const somme = artefactsRetenus.reduce((acc, e) => acc + e.noteFinale, 0);
        const moyennePortfolio = somme / artefactsRetenus.length;

        // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Intégrer évaluation terminale avec pondération
        const productions = db.getSync(cle('productions'), []);

        // Trouver la production portfolio (conteneur)
        const productionPortfolio = productions.find(p => p.type === 'portfolio');

        // Trouver l'évaluation terminale (production avec pondération > 0 qui n'est ni portfolio ni artefact)
        const productionTerminale = productions.find(p =>
            p.ponderation > 0 &&
            p.type !== 'portfolio' &&
            p.type !== 'artefact-portfolio'
        );

        // Si pas de pondérations configurées, retourner juste la moyenne du portfolio
        if (!productionPortfolio || !productionTerminale) {
            const indiceP = moyennePortfolio / 100;
            return indiceP;
        }

        // Trouver l'évaluation de l'étudiant sur l'évaluation terminale
        const evalTerminale = evaluations.find(e =>
            e.etudiantDA === da &&
            e.productionId === productionTerminale.id &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        // Si l'évaluation terminale n'est pas encore faite, retourner seulement le portfolio
        if (!evalTerminale) {
            const indiceP = moyennePortfolio / 100;
            return indiceP;
        }

        // Calculer P pondéré : (Portfolio × pond%) + (Terminale × pond%)
        const ponderationPortfolio = productionPortfolio.ponderation || 60;
        const ponderationTerminale = productionTerminale.ponderation || 40;
        const totalPonderation = ponderationPortfolio + ponderationTerminale;

        const moyennePonderee = (
            (moyennePortfolio * ponderationPortfolio / totalPonderation) +
            (evalTerminale.noteFinale * ponderationTerminale / totalPonderation)
        );

        const indiceP = moyennePonderee / 100;

        // ✅ DÉSACTIVÉ (10 déc 2025): Pour performance Safari

        return indiceP;
    }

    /**
     * Calcule la performance HISTORIQUE jusqu'à une date spécifique (pour snapshots)
     * Applique la logique PAN avec filtrage temporel
     *
     * Règle : Si < N artefacts évalués, moyenne de TOUS. Si >= N, sélection des N meilleurs.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
     * @param {Array} evaluationsCache - Cache des évaluations (evaluationsEtudiants)
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformanceHistorique(da, dateLimite, evaluationsCache = null) {
        if (!da || da.length !== 7) {
            console.warn('[PAN-Historique] DA invalide:', da);
            return null;
        }

        // Lire configuration
        const config = this._lireConfiguration();
        const portfolioActif = config.portfolioActif;
        const nombreARetenir = config.nombreARetenir;
        const methodeSelection = config.methodeSelection;

        // Si portfolio désactivé, retourner null
        if (!portfolioActif) {
            // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
            return null;
        }

        // Lire artefacts portfolio
        const artefactsIds = this._lireArtefactsPortfolio();

        // Utiliser le cache fourni (evaluationsEtudiants)
        if (!evaluationsCache || evaluationsCache.length === 0) {
            console.warn('[PAN-Historique] Cache évaluations vide ou manquant');
            return null;
        }

        // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Lire productions pour dateEcheance
        const productions = this._lireProductions();

        // Fonction helper pour obtenir dateEcheance de la production
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        const infoCoursPan = db.getSync('infoCours', null);
        const gcIdPan = infoCoursPan ? (infoCoursPan._groupeCoursId || infoCoursPan.id || null) : null;
        const obtenirDateEcheance = (evaluation) => {
            const production = productions.find(p => p.id === evaluation.productionId);
            if (!production) {
                return evaluation.dateEvaluation;
            }
            if (typeof obtenirEcheanceEffective === 'function') {
                const { date, assignee } = obtenirEcheanceEffective(production, gcIdPan);
                if (!assignee) return null;
                return date || evaluation.dateEvaluation;
            }
            return production.dateEcheance || evaluation.dateEvaluation;
        };

        // ✅ DEBUG TEMPORAIRE (10 déc 2025): Vérifier filtrage pour DA spécifique
        if (da === '9000116') {
            const toutes = evaluationsCache.filter(e => e.etudiantDA === da);

            const avecDateEcheance = toutes.map(e => {
                const prod = productions.find(p => p.id === e.productionId);
                return {
                    prodId: e.productionId,
                    dateEcheance: prod?.dateEcheance || 'N/A',
                    statutRemise: e.statutRemise,
                    noteFinale: e.noteFinale
                };
            });
        }

        // Filtrer évaluations de cet étudiant sur artefacts portfolio jusqu'à dateLimite
        // ✅ CORRECTIF CRITIQUE (10 déc 2025): Utiliser les bons noms de champs
        // etudiantDA (pas da) et noteFinale (pas note) - alignement avec calculerPerformance()
        // ✅ NOUVEAU (Beta 94): Utiliser dateEcheance de la production (jetons = compteur seulement)
        const evaluationsEleve = evaluationsCache.filter(e => {
            if (e.etudiantDA !== da) return false;
            if (!artefactsIds.includes(e.productionId)) return false;
            if (e.statutRemise === 'non-remis') return false;
            if (e.remplaceeParId) return false;
            if (e.noteFinale === null || e.noteFinale === undefined) return false;

            // ✅ NOUVEAU (Beta 94): Filtrer par dateEcheance de la production
            const dateEcheance = obtenirDateEcheance(e);
            if (!dateEcheance) return false;

            return dateEcheance <= dateLimite;
        });

        if (evaluationsEleve.length === 0) {
            // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
            return null;
        }

        // ✅ RÈGLE CRITIQUE : Si < N artefacts, moyenne de TOUS
        if (evaluationsEleve.length < nombreARetenir) {
            // ✅ CORRECTIF (10 déc 2025): Utiliser noteFinale au lieu de note
            const somme = evaluationsEleve.reduce((acc, e) => acc + parseFloat(e.noteFinale || 0), 0);
            const moyenne = somme / evaluationsEleve.length;
            const indiceP = moyenne / 100;

            // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
            return indiceP;
        }

        // ✅ Si >= N artefacts : Appliquer logique de sélection
        let artefactsRetenus = [];

        switch (methodeSelection) {
            case 'meilleurs':
                // ✅ CORRECTIF (10 déc 2025): Utiliser noteFinale au lieu de note
                evaluationsEleve.sort((a, b) => parseFloat(b.noteFinale) - parseFloat(a.noteFinale));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents':
                evaluationsEleve.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;

            case 'recents-meilleurs':
                const nombreMeilleurs = Math.max(1, Math.ceil(evaluationsEleve.length * 0.5));
                // ✅ CORRECTIF (10 déc 2025): Utiliser noteFinale au lieu de note
                evaluationsEleve.sort((a, b) => parseFloat(b.noteFinale) - parseFloat(a.noteFinale));
                const topMeilleurs = evaluationsEleve.slice(0, nombreMeilleurs);
                topMeilleurs.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
                artefactsRetenus = topMeilleurs.slice(0, nombreARetenir);
                break;

            case 'tous':
                artefactsRetenus = evaluationsEleve;
                break;

            default:
                console.warn(`[PAN-Historique] Modalité inconnue: ${methodeSelection}, utilisation de 'meilleurs'`);
                // ✅ CORRECTIF (10 déc 2025): Utiliser noteFinale au lieu de note
                evaluationsEleve.sort((a, b) => parseFloat(b.noteFinale) - parseFloat(a.noteFinale));
                artefactsRetenus = evaluationsEleve.slice(0, nombreARetenir);
                break;
        }

        // Calculer la moyenne du portfolio (N meilleurs artefacts)
        // ✅ CORRECTIF (10 déc 2025): Utiliser noteFinale au lieu de note
        const somme = artefactsRetenus.reduce((acc, e) => acc + parseFloat(e.noteFinale || 0), 0);
        const moyennePortfolio = somme / artefactsRetenus.length;

        // ✅ NOUVEAU (Beta 94 - 10 déc 2025): Intégrer évaluation terminale avec pondération
        // Trouver la production portfolio (conteneur)
        const productionPortfolio = productions.find(p => p.type === 'portfolio');

        // Trouver l'évaluation terminale (production avec pondération > 0 qui n'est ni portfolio ni artefact)
        const productionTerminale = productions.find(p =>
            p.ponderation > 0 &&
            p.type !== 'portfolio' &&
            p.type !== 'artefact-portfolio'
        );

        // Si pas de pondérations configurées, retourner juste la moyenne du portfolio
        if (!productionPortfolio || !productionTerminale) {
            const indiceP = moyennePortfolio / 100;
            return indiceP;
        }

        // Vérifier si l'évaluation terminale était due avant dateLimite
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        const echeanceTerminale = (typeof obtenirEcheanceEffective === 'function')
            ? obtenirEcheanceEffective(productionTerminale, gcIdPan)
            : { date: productionTerminale.dateEcheance, assignee: true };
        const dateEcheanceTerminale = echeanceTerminale.date;
        if (!dateEcheanceTerminale || dateEcheanceTerminale > dateLimite) {
            // L'évaluation terminale n'était pas encore due, retourner seulement le portfolio
            const indiceP = moyennePortfolio / 100;
            return indiceP;
        }

        // Trouver l'évaluation de l'étudiant sur l'évaluation terminale
        const evalTerminale = evaluationsCache.find(e =>
            e.etudiantDA === da &&
            e.productionId === productionTerminale.id &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        // Si l'évaluation terminale n'est pas encore faite, retourner seulement le portfolio
        if (!evalTerminale) {
            const indiceP = moyennePortfolio / 100;
            return indiceP;
        }

        // Calculer P pondéré : (Portfolio × pond%) + (Terminale × pond%)
        const ponderationPortfolio = productionPortfolio.ponderation || 60;
        const ponderationTerminale = productionTerminale.ponderation || 40;
        const totalPonderation = ponderationPortfolio + ponderationTerminale;

        const moyennePonderee = (
            (moyennePortfolio * ponderationPortfolio / totalPonderation) +
            (parseFloat(evalTerminale.noteFinale) * ponderationTerminale / totalPonderation)
        );

        const indiceP = moyennePonderee / 100;

        // ✅ DEBUG TEMPORAIRE (10 déc 2025): Vérifier calcul historique
        if (da === '9000116') {
        }

        return indiceP;
    }

    /**
     * Calcule la performance RÉCENTE (P_recent) pour le calcul du risque
     * Toujours basé sur les N dernières productions, peu importe la modalité choisie
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P_recent entre 0 et 1, ou null si pas de données
     */
    calculerPerformanceRecente(da) {
        if (!da || da.length !== 7) {
            // console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Lire configuration
        const config = this._lireConfiguration();
        const portfolioActif = config.portfolioActif;
        const nombreARetenir = config.nombreARetenir;

        // Si portfolio désactivé, retourner null (productions indépendantes)
        if (!portfolioActif) {
            return null;
        }

        // Lire les évaluations et productions
        const evaluations = this._lireEvaluations();
        const artefactsIds = this._lireArtefactsPortfolio();

        // Filtrer les évaluations de cet étudiant sur les artefacts portfolio
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // TOUJOURS utiliser les N plus récents pour le dépistage
        evaluationsEleve.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
        const artefactsRecents = evaluationsEleve.slice(0, nombreARetenir);

        // Calculer la moyenne
        const somme = artefactsRecents.reduce((acc, e) => acc + e.noteFinale, 0);
        const moyenne = somme / artefactsRecents.length;

        // Convertir en indice 0-1
        const indicePRecent = moyenne / 100;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        return indicePRecent;
    }

    /**
     * Calcule l'indice C (Complétion) selon PAN-Standards
     *
     * Formule : Nombre d'artefacts portfolio remis / Nombre d'artefacts évalués
     * Un artefact est considéré "évalué" si au moins une évaluation existe pour celui-ci
     * (pas seulement "créé dans le système")
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
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
        const gcIdC = infoCoursC ? (infoCoursC._groupeCoursId || infoCoursC.id || null) : null;
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

        // 2. Compter combien CET ÉTUDIANT a remis (évaluation avec note existante)
        const travauxRemis = travauxAssignes.filter(travail => {
            return evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === travail.id &&
                e.statutRemise !== 'non-remis' &&
                !e.remplaceeParId &&
                e.noteFinale !== null &&
                e.noteFinale !== undefined
            );
        });

        const indiceC = travauxRemis.length / travauxAssignes.length;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        return indiceC;
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
     * - Difficulté persistante : Performance < 64% (unistructurel)
     * - Difficulté émergente : Performance < 75% ET a un défi
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
        const indices3Derniers = this._calculerIndicesTroisDerniersArtefacts(da);

        const defiPrincipal = defis.principalDefi ? defis.principalDefi.nom : 'Aucun';
        const francaisMoyen = indices3Derniers.francaisMoyen;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        // Logique de décision selon pattern et défi principal
        return this._determinerCibleIntervention(
            pattern.type,
            defiPrincipal,
            francaisMoyen,
            pattern.indices.P
        );
    }

    // ========================================================================
    // MÉTHODES PRIVÉES (HELPERS)
    // ========================================================================

    /**
     * Lit la configuration PAN depuis db.getSync
     * @private
     */
    _lireConfiguration() {
        const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
        const configPAN = config.configPAN || {};

        // ✅ PHASE 3: SINGLE SOURCE OF TRUTH centralisé dans modalitesEvaluation.configPAN.portfolio
        // Lire depuis le nouvel emplacement avec fallback vers productions pour rétrocompatibilité
        let portfolioActif = true;
        let nombreARetenir = 3;
        let minimumCompletion = 7;
        let nombreTotal = 10;
        let methodeSelection = 'meilleurs';

        if (configPAN.portfolio) {
            // Nouveau format (Phase 3)
            portfolioActif = configPAN.portfolio.actif !== false;
            nombreARetenir = configPAN.portfolio.nombreARetenir || 3;
            minimumCompletion = configPAN.portfolio.minimumCompletion || 7;
            nombreTotal = configPAN.portfolio.nombreTotal || 10;
            methodeSelection = configPAN.portfolio.methodeSelection || 'meilleurs';
        } else {
            // Ancien format (fallback pour rétrocompatibilité)
            const productions = db.getSync(cle('productions'), []);
            const portfolio = productions.find(p => p.type === 'portfolio');

            if (portfolio && portfolio.regles) {
                nombreARetenir = portfolio.regles.nombreARetenir || 3;
                minimumCompletion = portfolio.regles.minimumCompletion || 7;
                nombreTotal = portfolio.regles.nombreTotal || 10;
            }
        }

        return {
            nombreCours: configPAN.nombreCours || 3,  // 3, 7 ou 12 cours
            portfolioActif: portfolioActif,           // Portfolio activé ou non
            nombreARetenir: nombreARetenir,           // Lecture depuis modalitesEvaluation.configPAN.portfolio
            minimumCompletion: minimumCompletion,     // Nouvelle donnée disponible
            nombreTotal: nombreTotal,                 // Nouvelle donnée disponible
            methodeSelection: methodeSelection        // Modalité de sélection des artefacts
        };
    }

    /**
     * Lit les évaluations depuis db.getSync
     * @private
     */
    _lireEvaluations() {
        // Utiliser obtenirDonneesSelonMode si disponible, sinon db.getSync direct
        if (typeof obtenirDonneesSelonMode === 'function') {
            return obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        }
        return db.getSync(cle('evaluationsSauvegardees'), []);
    }

    /**
     * Retourne les IDs des productions de type artefact-portfolio
     * @private
     */
    _lireArtefactsPortfolio() {
        // ✅ CORRECTION (30 déc 2025): Utiliser obtenirDonneesSelonMode pour respecter coursId
        // Avant: db.getSync(cle('productions'), []) ne filtrait pas par cours actif
        const productions = this._lireProductions();
        return productions
            .filter(p => p.type === 'artefact-portfolio')
            .map(p => p.id);
    }

    /**
     * Lit toutes les productions depuis le stockage
     * @private
     * @returns {Array} Liste des productions
     */
    _lireProductions() {
        return obtenirDonneesSelonMode('productions') || [];
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

        const grilles = db.getSync('grillesTemplates', []);
        const grille = grilles.find(g => g.id === grilleId);

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

        // Obtenir table de conversion IDME
        const tableConversion = this._obtenirTableConversionIDME();

        // ✅ Initialiser accumulateurs dynamiquement selon la grille
        const scoresCriteres = {};
        grille.criteres.forEach(c => {
            const cleNormalisee = c.nom.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '');
            scoresCriteres[cleNormalisee] = [];
        });

        // ✅ Construire regex dynamique depuis les noms de critères de la grille
        // Ex: (STRUCTURE|RIGUEUR|PLAUSIBILITE|NUANCE|FRANCAIS)\s*\(([IDME0])\)
        const nomsRegex = grille.criteres.map(c => {
            // Échapper les caractères spéciaux et supporter les variantes accentuées
            return c.nom.toUpperCase()
                .replace(/É/g, '[ÉE]')
                .replace(/È/g, '[ÈE]')
                .replace(/Ç/g, '[ÇC]')
                .replace(/\s+/g, '\\s+');
        }).join('|');

        const regexCritere = new RegExp(`(${nomsRegex})\\s*\\(([IDME0])\\)`, 'gi');

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        derniersArtefacts.forEach(evaluation => {
            const retroaction = evaluation.retroactionFinale || '';

            let match;
            while ((match = regexCritere.exec(retroaction)) !== null) {
                const nomCritere = match[1].toUpperCase();
                const niveauIDME = match[2].toUpperCase();
                const score = this._convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

                if (score !== null) {
                    // ✅ Trouver le critère correspondant dans la grille
                    const critereReference = grille.criteres.find(c => {
                        const nomRef = c.nom.toUpperCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, '');
                        const nomMatch = nomCritere
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, '');

                        return nomRef === nomMatch ||
                               nomRef.startsWith(nomMatch) ||
                               nomMatch.startsWith(nomRef);
                    });

                    if (critereReference) {
                        const cleNormalisee = critereReference.nom.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, '');
                        scoresCriteres[cleNormalisee].push(score);
                    }
                }
            }
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
        // Utiliser seuil configurable (défaut 75%)
        const seuil = this._obtenirSeuil('defiSpecifique') || 0.75;

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
     * @returns {Object} { performance, idmeMoyen, francaisMoyen, nbArtefacts }
     */
    _calculerIndicesTroisDerniersArtefacts(da) {
        const config = this._lireConfiguration();
        const nombreArtefacts = config.nombreCours * 2;

        const evaluations = this._lireEvaluations();
        const artefactsIds = this._lireArtefactsPortfolio();

        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsIds.includes(e.productionId) &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return {
                performance: 0,
                idmeMoyen: 0,
                francaisMoyen: 0,
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

        // IDME moyen
        const tableConversion = this._obtenirTableConversionIDME();
        const niveauxIDME = derniers
            .map(e => e.niveauFinal)
            .filter(n => n && ['I', 'D', 'M', 'E', '0'].includes(n))
            .map(n => this._convertirNiveauIDMEEnScore(n, tableConversion))
            .filter(s => s !== null);

        const idmeMoyen = niveauxIDME.length > 0
            ? niveauxIDME.reduce((sum, s) => sum + s, 0) / niveauxIDME.length
            : 0;

        // Moyenne français
        const scoresFrancais = [];
        const regexFrancais = /FRAN[ÇC]AIS\s+[ÉE]CRIT\s*\(([IDME])\)/gi;

        derniers.forEach(evaluation => {
            const retroaction = evaluation.retroactionFinale || '';
            let match;
            while ((match = regexFrancais.exec(retroaction)) !== null) {
                const niveauIDME = match[1].toUpperCase();
                const score = this._convertirNiveauIDMEEnScore(niveauIDME, tableConversion);
                if (score !== null) {
                    scoresFrancais.push(score * 100);
                }
            }
        });

        const francaisMoyen = scoresFrancais.length > 0
            ? scoresFrancais.reduce((sum, s) => sum + s, 0) / scoresFrancais.length
            : 0;

        return {
            performance: performance,
            idmeMoyen: idmeMoyen,
            francaisMoyen: francaisMoyen,
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
        // Seuils IDME configurables
        const seuilInsuffisant = this._obtenirSeuil('idme.insuffisant') || 0.64;
        const seuilDeveloppement = this._obtenirSeuil('idme.developpement') || 0.75;

        // Difficulté persistante : < 64% (unistructurel)
        if (performancePAN3 < seuilInsuffisant) {
            return 'Difficulté persistante';
        }

        // Difficulté émergente : < 75% (multistructurel) ET a un défi
        if (performancePAN3 < seuilDeveloppement && aUnDefi) {
            return 'Difficulté émergente';
        }

        // Défi spécifique : Performance acceptable mais défi récurrent
        if (aUnDefi) {
            return 'Défi spécifique';
        }

        // Stable : Pas de défi majeur
        return 'Stable';
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
     * @param {number} francaisMoyen - Moyenne du critère de langue (0-100)
     * @param {number} performance - Performance actuelle (0-1)
     * @returns {Object} { type, cible, strategies, ressources, niveau, couleur, emoji }
     */
    _determinerCibleIntervention(pattern, defiPrincipal, francaisMoyen, performance) {
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
    _obtenirTableConversionIDME() {
        // Utiliser la fonction globale si disponible
        if (typeof obtenirTableConversionIDME === 'function') {
            return obtenirTableConversionIDME();
        }

        // Sinon, valeurs par défaut
        return {
            'I': { min: 0, max: 64, valeur: 0.55 },
            'D': { min: 65, max: 74, valeur: 0.70 },
            'M': { min: 75, max: 84, valeur: 0.80 },
            'E': { min: 85, max: 100, valeur: 0.90 },
            '0': { min: 0, max: 0, valeur: 0 }
        };
    }

    /**
     * Convertit un niveau IDME en score (0-1)
     * Supporte deux formats de table:
     * - Format complet: {I: {min, max, valeur}, D: {...}, ...}
     * - Format simple: {I: 0.4, D: 0.65, ...}
     * @private
     */
    _convertirNiveauIDMEEnScore(niveau, tableConversion) {
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

        // Sinon, valeurs par défaut
        const seuilsDefaut = {
            'defiSpecifique': 0.75,
            'idme.insuffisant': 0.64,
            'idme.developpement': 0.75
        };

        return seuilsDefaut[nomSeuil] || 0.75;
    }

    // =========================================================================
    // SYSTÈME DE COMPTAGE D'OBJECTIFS - Beta 95
    // =========================================================================

    /**
     * Calcule la performance selon le système de comptage d'objectifs
     *
     * Logique :
     * 1. Pour chaque objectif configuré, trouver la meilleure note de l'étudiant
     * 2. Un objectif est "maîtrisé" si note >= seuil de maîtrise
     * 3. Note finale = grille de conversion[nb objectifs maîtrisés]
     * 4. Si un objectif essentiel n'est pas maîtrisé → plafond à 55%
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     * @private
     */
    _calculerPerformanceParObjectifs(da) {
        const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
        const config = modalites.parObjectifs || {};
        const mode = config.modeCalcul || 'comptage';

        const objectifs = config.objectifs || [];

        if (objectifs.length === 0) {
            console.warn('[PAN-Standards] Aucun objectif configuré');
            return null;
        }

        // Dispatch vers le mode de calcul approprié
        switch (mode) {
            case 'comptage':
                return this._calculerModeComptage(da, objectifs, config.comptage || {});
            case 'moyenne-ponderee':
                return this._calculerModeMoyennePonderee(da, objectifs, config.moyennePonderee || {});
            case 'seuils-critiques':
                return this._calculerModeSeuilsCritiques(da, objectifs, config.seuilsCritiques || {});
            case 'holistique':
                return this._calculerModeHolistique(da, objectifs, config.holistique || {});
            default:
                console.warn(`[PAN-Standards] Mode inconnu: ${mode}, utilisation du mode comptage`);
                return this._calculerModeComptage(da, objectifs, config.comptage || {});
        }
    }

    /**
     * Mode Comptage
     * Note = grille de conversion selon nombre d'objectifs maîtrisés
     * Plafond si objectifs essentiels non maîtrisés
     */
    _calculerModeComptage(da, objectifs, configComptage) {
        const seuilMaitrise = (configComptage.seuilMaitrise || 75) / 100;
        const plafond = (configComptage.plafondSiEssentielNonMaitrise || 55) / 100;
        const grilleConversion = configComptage.grilleConversion || {};

        const niveauxParObjectif = this._calculerNiveauxParObjectif(da, objectifs);
        if (!niveauxParObjectif) return null;

        let nbObjectifsMaitrises = 0;
        let essentielsNonMaitrises = [];

        objectifs.forEach((obj, index) => {
            const niveau = niveauxParObjectif[index];
            if (niveau && niveau.note >= seuilMaitrise) {
                nbObjectifsMaitrises++;
            } else if (obj.essentiel) {
                essentielsNonMaitrises.push(obj.nom);
            }
        });

        // Note selon grille de conversion
        let noteFinale = (grilleConversion[nbObjectifsMaitrises] || 0) / 100;

        // Plafond si essentiels non maîtrisés
        if (essentielsNonMaitrises.length > 0) {
            noteFinale = Math.min(noteFinale, plafond);
        }

        return noteFinale;
    }

    /**
     * Mode Moyenne pondérée
     * Note = moyenne des niveaux × pondération de chaque objectif
     */
    _calculerModeMoyennePonderee(da, objectifs, configMoyenne) {
        const niveauxParObjectif = this._calculerNiveauxParObjectif(da, objectifs);
        if (!niveauxParObjectif) return null;

        let sommeNotesPonderees = 0;
        let sommePonderations = 0;

        objectifs.forEach((obj, index) => {
            const niveau = niveauxParObjectif[index];
            const ponderation = obj.ponderation || 0;

            if (niveau && ponderation > 0) {
                sommeNotesPonderees += niveau.note * ponderation;
                sommePonderations += ponderation;
            }
        });

        if (sommePonderations === 0) return null;

        return sommeNotesPonderees / sommePonderations;
    }

    /**
     * Mode Seuils critiques (Xavier C.-T.)
     * Tous les objectifs doivent atteindre niveau 3+, bonus pour niveau 4
     */
    _calculerModeSeuilsCritiques(da, objectifs, configSeuils) {
        // ✅ CORRECTION (4 jan 2026) : Prioriser les noms des formulaires, garder fallback pour compatibilité
        const niveauMinimum = configSeuils.seuilReussite || configSeuils.niveauMinimum || 3;
        const noteBase = (configSeuils.noteBaseReussite || configSeuils.noteBase || 80) / 100;
        const bonusNiveau4 = (configSeuils.bonusNiveau4 || 3.33) / 100;

        const niveauxParObjectif = this._calculerNiveauxParObjectif(da, objectifs);
        if (!niveauxParObjectif) return null;

        let objectifsNonAtteints = 0;
        let objectifsNiveau4 = 0;
        let objectifsNiveau2 = 0;
        let objectifsNiveau1 = 0;

        objectifs.forEach((obj, index) => {
            const niveau = niveauxParObjectif[index];
            if (!niveau) {
                objectifsNonAtteints++;
                return;
            }

            // Convertir la note (0-1) en niveau (1-4)
            const niveauNum = this._convertirNoteEnNiveau(niveau.note);

            if (niveauNum >= 4) {
                objectifsNiveau4++;
            } else if (niveauNum >= niveauMinimum) {
                // OK, niveau atteint
            } else if (niveauNum === 2) {
                objectifsNiveau2++;
            } else {
                objectifsNiveau1++;
            }
        });

        // Règles Xavier : tous niveau 3+ → 80% | Bonus niveau 4 → +3.33%
        // Un objectif niveau 2 → 55% | Deux niveau 2 OU un niveau 1 → 50%
        if (objectifsNiveau1 > 0 || objectifsNiveau2 >= 2) {
            return 0.50;
        }
        if (objectifsNiveau2 === 1) {
            return 0.55;
        }

        // Tous les objectifs au niveau requis ou plus
        return Math.min(1.0, noteBase + (objectifsNiveau4 * bonusNiveau4));
    }

    /**
     * Mode Holistique
     * Suggestion statistique (mode, médiane, moyenne) + validation enseignant
     */
    _calculerModeHolistique(da, objectifs, configHolistique) {
        const methode = configHolistique.methodeSuggestion || 'mode';
        const niveauxParObjectif = this._calculerNiveauxParObjectif(da, objectifs);
        if (!niveauxParObjectif) return null;

        const notes = objectifs
            .map((obj, index) => niveauxParObjectif[index]?.note)
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

    /**
     * Calcule les niveaux atteints par objectif pour un étudiant
     * @returns {Array} Tableau de {note, meilleureNote} par objectif
     */
    _calculerNiveauxParObjectif(da, objectifs) {
        const evaluations = this._lireEvaluations();
        const productions = db.getSync(cle('productions'), []);

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

    /**
     * Convertit une note (0-1) en niveau IDME (1-4)
     */
    _convertirNoteEnNiveau(note) {
        if (note >= 0.85) return 4; // Étendu
        if (note >= 0.75) return 3; // Maîtrisé
        if (note >= 0.65) return 2; // en Développement
        return 1; // Incomplet
    }
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
        window.enregistrerPratique('pan-standards', instance);
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
    } catch (error) {
        console.error('[PAN-Standards] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export pour utilisation directe
window.PratiquePANStandards = PratiquePANStandards;

// ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

})();
