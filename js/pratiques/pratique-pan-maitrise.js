/**
 * PRATIQUE PAN-MAÎTRISE - Implémentation complète
 *
 * Pratique PAN (Plan d'apprentissage numérique) selon l'approche de Grégoire Bédard.
 * Évaluation formative basée sur les N meilleurs artefacts de portfolio.
 *
 * CARACTÉRISTIQUES :
 * - Échelle IDME (Insuffisant, Développement, Maîtrisé, Étendu)
 * - ✅ Critères d'évaluation configurables (grille de référence)
 * - Performance calculée sur N meilleurs artefacts (configurable: 3, 7 ou 12 cours)
 * - Détection défis spécifiques par critère
 * - Cibles RàI personnalisées selon pattern et défi principal
 *
 * VERSION : 1.1 (Universelle)
 * DATE : 3 décembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

class PratiquePANMaitrise {

    constructor() {
        console.log('🎯 Initialisation de la pratique PAN-Maîtrise');
    }

    // ========================================================================
    // MÉTHODES D'IDENTITÉ (Interface IPratique)
    // ========================================================================

    obtenirNom() {
        return "PAN-Maîtrise";
    }

    obtenirId() {
        return "pan-maitrise";
    }

    obtenirDescription() {
        return "Pratique PAN-Maîtrise basée sur les N meilleurs artefacts de portfolio " +
               "avec évaluation formative selon l'échelle IDME et la grille de critères configurée.";
    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon PAN-Maîtrise
     *
     * Formule : Selon la modalité configurée dans modalitesEvaluation.configPAN.portfolio
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Lire configuration
        const config = this._lireConfiguration();
        const portfolioActif = config.portfolioActif;
        const nombreARetenir = config.nombreARetenir;
        const methodeSelection = config.methodeSelection;

        // Si portfolio désactivé, retourner null (productions indépendantes)
        if (!portfolioActif) {
            console.log('[PAN] Portfolio désactivé - productions indépendantes');
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
            console.log('[PAN] Aucune évaluation pour DA', da);
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

        // Calculer la moyenne
        const somme = artefactsRetenus.reduce((acc, e) => acc + e.noteFinale, 0);
        const moyenne = somme / artefactsRetenus.length;

        // Convertir en indice 0-1
        const indiceP = moyenne / 100;

        console.log(`[PAN] Performance DA ${da}: ${(indiceP * 100).toFixed(1)}% (${artefactsRetenus.length} artefacts - modalité: ${methodeSelection})`);

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
            console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Lire configuration
        const config = this._lireConfiguration();
        const portfolioActif = config.portfolioActif;
        const nombreARetenir = config.nombreARetenir;

        // Si portfolio désactivé, retourner null (productions indépendantes)
        if (!portfolioActif) {
            console.log('[PAN] Portfolio désactivé - productions indépendantes');
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
            console.log('[PAN] Aucune évaluation récente pour DA', da);
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

        console.log(`[PAN] Performance récente DA ${da}: ${(indicePRecent * 100).toFixed(1)}% (${artefactsRecents.length} derniers artefacts)`);

        return indicePRecent;
    }

    /**
     * Calcule l'indice C (Complétion) selon PAN-Maîtrise
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
            console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Lire les productions artefacts
        const productions = db.getSync('productions', []);
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

        // Lire les évaluations
        const evaluations = this._lireEvaluations();

        // 1. Identifier les artefacts QUI ONT ÉTÉ ÉVALUÉS (au moins 1 évaluation existe)
        const artefactsEvalues = artefactsPortfolio.filter(artefact => {
            return evaluations.some(e =>
                e.productionId === artefact.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        if (artefactsEvalues.length === 0) {
            console.log('[PAN] Aucun artefact portfolio évalué');
            return null;
        }

        // 2. Compter combien CET ÉTUDIANT a remis parmi les artefacts évalués
        const artefactsRemis = artefactsEvalues.filter(artefact => {
            return evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === artefact.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        const indiceC = artefactsRemis.length / artefactsEvalues.length;

        console.log(`[PAN] Complétion DA ${da}: ${(indiceC * 100).toFixed(1)}% (${artefactsRemis.length}/${artefactsEvalues.length} évalués)`);

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
            console.warn('[PAN] DA invalide:', da);
            return { type: 'srpnf', defis: [], forces: [] };
        }

        // Calculer moyennes SRPNF sur N derniers artefacts
        const moyennes = this._calculerMoyennesCriteresRecents(da);

        if (!moyennes) {
            console.log('[PAN] Pas de moyennes calculables pour DA', da);
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
     * - Blocage critique : Performance < 64% (unistructurel)
     * - Blocage émergent : Performance < 75% ET a un défi
     * - Défi spécifique : Performance acceptable mais a un défi récurrent
     * - Stable : Pas de défi ou performance maîtrisée
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, description, indices, couleur, recommandation }
     */
    identifierPattern(da) {
        if (!da || da.length !== 7) {
            console.warn('[PAN] DA invalide:', da);
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
            case 'Blocage critique':
                description = 'Blocage critique - Risque d\'échec élevé';
                couleur = '#dc3545'; // Rouge
                recommandation = 'Intervention intensive immédiate (Niveau 3 RàI)';
                break;

            case 'Blocage émergent':
                description = 'Blocage émergent - Performance en développement avec défis';
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
     * - Pattern actuel (Blocage critique/émergent, Défi spécifique, Stable)
     * - Défi principal SRPNF identifié
     * - Niveau de français (indicateur secondaire)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, cible, strategies, ressources, niveau }
     */
    genererCibleIntervention(da) {
        if (!da || da.length !== 7) {
            console.warn('[PAN] DA invalide:', da);
            return null;
        }

        // Obtenir le pattern et les défis
        const pattern = this.identifierPattern(da);
        const defis = this.detecterDefis(da);
        const indices3Derniers = this._calculerIndicesTroisDerniersArtefacts(da);

        const defiPrincipal = defis.principalDefi ? defis.principalDefi.nom : 'Aucun';
        const francaisMoyen = indices3Derniers.francaisMoyen;

        console.log('[PAN] Génération cible RàI pour DA', da, {
            pattern: pattern.type,
            defi: defiPrincipal,
            francais: francaisMoyen.toFixed(1) + '%'
        });

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
        const config = db.getSync('modalitesEvaluation', {});
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
            const productions = db.getSync('productions', []);
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
     * Lit les évaluations depuis db.getSync (avec support mode simulation)
     * @private
     */
    _lireEvaluations() {
        // Utiliser obtenirDonneesSelonMode si disponible, sinon db.getSync direct
        if (typeof obtenirDonneesSelonMode === 'function') {
            return obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        }
        return db.getSync('evaluationsSauvegardees', []);
    }

    /**
     * Retourne les IDs des productions de type artefact-portfolio
     * @private
     */
    _lireArtefactsPortfolio() {
        const productions = db.getSync('productions', []);
        return productions
            .filter(p => p.type === 'artefact-portfolio')
            .map(p => p.id);
    }

    /**
     * Obtient la grille de référence configurée pour le dépistage
     * @private
     * @returns {Object|null} Grille avec critères ou null si non configurée
     */
    _obtenirGrilleReference() {
        const modalites = db.getSync('modalitesEvaluation', {});
        const grilleId = modalites.grilleReferenceDepistage;

        if (!grilleId) {
            console.warn('⚠️ [PAN-Maîtrise] Aucune grille de référence configurée');
            return null;
        }

        const grilles = db.getSync('grillesTemplates', []);
        const grille = grilles.find(g => g.id === grilleId);

        if (!grille) {
            console.error(`❌ [PAN-Maîtrise] Grille "${grilleId}" introuvable`);
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
            console.warn('⚠️ [PAN-Maîtrise] Pas de grille de référence - calcul impossible');
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

        console.log(`✅ [PAN-Maîtrise] Regex dynamique: ${regexCritere.source}`);

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
     * @returns {string} 'Blocage critique'|'Blocage émergent'|'Défi spécifique'|'Stable'
     */
    _identifierPatternActuel(performancePAN3, aUnDefi) {
        // Seuils IDME configurables
        const seuilInsuffisant = this._obtenirSeuil('idme.insuffisant') || 0.64;
        const seuilDeveloppement = this._obtenirSeuil('idme.developpement') || 0.75;

        // Blocage critique : < 64% (unistructurel)
        if (performancePAN3 < seuilInsuffisant) {
            return 'Blocage critique';
        }

        // Blocage émergent : < 75% (multistructurel) ET a un défi
        if (performancePAN3 < seuilDeveloppement && aUnDefi) {
            return 'Blocage émergent';
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
            couleur: '#4caf50',
            emoji: '🟢'
        };

        // BLOCAGE CRITIQUE (Niveau 3 RàI)
        if (pattern === 'Blocage critique') {
            cible.niveau = 3;
            cible.couleur = '#dc3545';
            cible.emoji = '🔴';

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

        // BLOCAGE ÉMERGENT (Niveau 2 RàI)
        else if (pattern === 'Blocage émergent') {
            cible.niveau = 2;
            cible.couleur = '#ff9800';
            cible.emoji = '🟠';

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
            cible.emoji = '🟡';

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
            cible.emoji = '🟢';
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
}

// ============================================================================
// AUTO-ENREGISTREMENT
// ============================================================================

(function() {
    // Vérifier que le registre est chargé
    if (typeof window.enregistrerPratique !== 'function') {
        console.error(
            '[PAN] Le registre n\'est pas chargé ! ' +
            'Assurez-vous de charger pratique-registre.js avant pratique-pan-maitrise.js'
        );
        return;
    }

    // Créer et enregistrer l'instance
    const instance = new PratiquePANMaitrise();

    try {
        window.enregistrerPratique('pan-maitrise', instance);
        console.log('✅ [PAN] Pratique PAN-Maîtrise enregistrée avec succès');
    } catch (error) {
        console.error('[PAN] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export pour utilisation directe
window.PratiquePANMaitrise = PratiquePANMaitrise;

console.log('✅ Module pratique-pan-maitrise.js chargé');
