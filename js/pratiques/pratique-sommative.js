/**
 * PRATIQUE SOMMATIVE TRADITIONNELLE - Implémentation complète
 *
 * Pratique sommative avec moyenne pondérée de toutes les évaluations.
 * Approche traditionnelle centrée sur la note finale.
 *
 * CARACTÉRISTIQUES :
 * - Moyenne pondérée de TOUTES les évaluations
 * - Respect des pondérations par production
 * - Exclut les évaluations remplacées
 * - Inclut les jetons de reprise
 * - Défis génériques (notes faibles, tendance, irrégularité)
 * - Cibles RàI basées sur productions faibles
 *
 * VERSION : 1.0
 * DATE : 11 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

class PratiqueSommative {

    constructor() {
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
        // console.log('📊 Initialisation de la pratique Sommative');
    }

    // ========================================================================
    // MÉTHODES D'IDENTITÉ (Interface IPratique)
    // ========================================================================

    obtenirNom() {
        return "Sommative traditionnelle";
    }

    obtenirId() {
        return "sommative";
    }

    obtenirDescription() {
        return "Pratique sommative traditionnelle avec moyenne pondérée de toutes les évaluations. " +
               "Approche centrée sur la note finale avec prise en compte des pondérations.";
    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon pratique sommative
     *
     * Formule : Moyenne pondérée de TOUTES les évaluations
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return null;
        }

        // Lire les données
        const evaluations = this._lireEvaluations();
        const productions = this._lireProductions();

        // Filtrer évaluations de cet étudiant (évaluations actives seulement)
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId && // Exclure remplacées
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            // console.log('[SOM] Aucune évaluation pour DA', da);
            return null;
        }

        // Calculer score pondéré total
        let scoreTotal = 0;
        let pondTotal = 0;

        evaluationsEleve.forEach(evaluation => {
            // Trouver la production correspondante
            const production = productions.find(p => p.id === evaluation.productionId);
            const ponderation = production?.ponderation || 1; // Défaut 1 si non trouvée

            scoreTotal += evaluation.noteFinale * ponderation;
            pondTotal += ponderation;
        });

        // Calculer moyenne pondérée
        const moyennePonderee = pondTotal > 0 ? scoreTotal / pondTotal : 0;
        const indiceP = moyennePonderee / 100;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
        // console.log(`[SOM] Performance DA ${da}: ${moyennePonderee.toFixed(1)}% (${evaluationsEleve.length} évaluations)`);

        return indiceP;
    }

    /**
     * Calcule la performance HISTORIQUE jusqu'à une date spécifique (pour snapshots)
     * Applique la logique Sommative avec filtrage temporel
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {string} dateLimite - Date limite au format 'YYYY-MM-DD' (incluse)
     * @param {Array} evaluationsCache - Cache des évaluations (evaluationsEtudiants)
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformanceHistorique(da, dateLimite, evaluationsCache = null) {
        if (!da || da.length !== 7) {
            console.warn('[SOM-Historique] DA invalide:', da);
            return null;
        }

        // Utiliser le cache fourni (evaluationsEtudiants)
        if (!evaluationsCache || evaluationsCache.length === 0) {
            console.warn('[SOM-Historique] Cache évaluations vide ou manquant');
            return null;
        }

        const productions = this._lireProductions();

        // Filtrer évaluations de cet étudiant jusqu'à dateLimite
        const evaluationsEleve = evaluationsCache.filter(e =>
            e.da === da &&
            e.dateEvaluation && e.dateEvaluation <= dateLimite && // ✅ Filtrage temporel
            e.statutRemise !== 'non-remis' && // ✅ Exclure non-remis
            e.note !== null &&
            e.note !== undefined
        );

        if (evaluationsEleve.length === 0) {
            // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
            // console.log(`[SOM-Historique] Aucune évaluation pour DA ${da} jusqu'à ${dateLimite}`);
            return null;
        }

        // Calculer score pondéré total
        let scoreTotal = 0;
        let pondTotal = 0;

        evaluationsEleve.forEach(evaluation => {
            // Trouver la production correspondante
            const production = productions.find(p => p.id === evaluation.productionId);
            const ponderation = production?.ponderation || 1;

            scoreTotal += parseFloat(evaluation.note) * ponderation;
            pondTotal += ponderation;
        });

        // Calculer moyenne pondérée
        const moyennePonderee = pondTotal > 0 ? scoreTotal / pondTotal : 0;
        const indiceP = moyennePonderee / 100;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
        // console.log(`[SOM-Historique] DA ${da}: ${moyennePonderee.toFixed(1)}% (${evaluationsEleve.length} évaluations)`);

        return indiceP;
    }

    /**
     * Calcule l'indice C (Complétion) selon pratique sommative
     *
     * Formule : Nombre de productions remises / Nombre de productions évaluées
     * Une production est considérée "évaluée" si au moins une évaluation existe pour celle-ci
     * (pas seulement "créée dans le système")
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return null;
        }

        // Lire les productions et évaluations
        const productions = this._lireProductions();
        const evaluations = this._lireEvaluations();

        // 1. Identifier les productions QUI ONT ÉTÉ ÉVALUÉES (au moins 1 évaluation existe)
        const productionsEvaluees = productions.filter(production => {
            // Exclure les productions facultatives
            if (production.facultatif) return false;

            // Vérifier qu'au moins une évaluation existe pour cette production
            return evaluations.some(e =>
                e.productionId === production.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        if (productionsEvaluees.length === 0) {
            // console.log('[SOM] Aucune production évaluée pour DA', da);
            return null;
        }

        // 2. Compter combien CET ÉTUDIANT a remis parmi les productions évaluées
        const productionsRemises = productionsEvaluees.filter(production => {
            return evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        const indiceC = productionsRemises.length / productionsEvaluees.length;

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
        // console.log(`[SOM] Complétion DA ${da}: ${(indiceC * 100).toFixed(1)}% (${productionsRemises.length}/${productionsEvaluees.length} évaluées)`);

        return indiceC;
    }

    // ========================================================================
    // MÉTHODES D'ANALYSE (Interface IPratique)
    // ========================================================================

    /**
     * Détecte les défis génériques de l'étudiant
     *
     * Défis génériques :
     * - Notes faibles (< 60%)
     * - Tendance à la baisse
     * - Irrégularité (écart-type élevé)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type: 'generique', defis: [], tendance: {} }
     */
    detecterDefis(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return { type: 'generique', defis: [], tendance: {} };
        }

        const evaluations = this._lireEvaluations();
        const productions = this._lireProductions();

        // Filtrer évaluations actives de l'étudiant
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return { type: 'generique', defis: [], tendance: {} };
        }

        // Trier par date
        evaluationsEleve.sort((a, b) => {
            const dateA = a.dateEvaluation || a.dateCreation || 0;
            const dateB = b.dateEvaluation || b.dateCreation || 0;
            return new Date(dateA) - new Date(dateB);
        });

        const defis = [];

        // DÉFI 1 : Notes faibles (< 60%)
        const notesFaibles = evaluationsEleve.filter(e => e.noteFinale < 60);
        if (notesFaibles.length > 0) {
            notesFaibles.forEach(e => {
                const production = productions.find(p => p.id === e.productionId);
                defis.push({
                    type: 'note-faible',
                    production: production?.titre || 'Production inconnue',
                    productionId: e.productionId,
                    note: e.noteFinale,
                    seuil: 60,
                    priorite: e.noteFinale < 50 ? 'haute' : 'moyenne'
                });
            });
        }

        // DÉFI 2 : Tendance à la baisse
        const tendance = this._calculerTendance(evaluationsEleve);
        if (tendance.direction === 'baisse' && tendance.variation < -10) {
            defis.push({
                type: 'tendance-baisse',
                variation: tendance.variation,
                moyenneRecente: tendance.moyenneRecente,
                moyenneAncienne: tendance.moyenneAncienne,
                priorite: 'haute'
            });
        }

        // DÉFI 3 : Irrégularité (écart-type élevé)
        const stats = this._calculerStatistiques(evaluationsEleve);
        if (stats.ecartType > 15) {
            defis.push({
                type: 'irregularite',
                ecartType: stats.ecartType,
                moyenne: stats.moyenne,
                priorite: 'moyenne'
            });
        }

        // Trier défis par priorité
        defis.sort((a, b) => {
            const priorites = { 'haute': 0, 'moyenne': 1, 'basse': 2 };
            return priorites[a.priorite] - priorites[b.priorite];
        });

        return {
            type: 'generique',
            defis: defis,
            tendance: tendance,
            statistiques: stats
        };
    }

    /**
     * Identifie le pattern d'apprentissage de l'étudiant
     *
     * Patterns universels (basés sur A-C-P) :
     * - Blocage critique : P < 60% OU Engagement < 30%
     * - Blocage émergent : A ≥ 75% mais C ou P < 65%
     * - Défi spécifique : P entre 70-80% avec défis identifiés
     * - Stable : P entre 80-85% sans défis majeurs
     * - Progression : P > 85% avec engagement soutenu
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, description, indices, couleur, recommandation }
     */
    identifierPattern(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return {
                type: 'inconnu',
                description: 'DA invalide',
                couleur: '#999999'
            };
        }

        // Calculer indices A-C-P
        const indiceP = this.calculerPerformance(da);
        const indiceC = this.calculerCompletion(da);

        if (indiceP === null || indiceC === null) {
            return {
                type: 'insuffisant',
                description: 'Données insuffisantes pour identifier le pattern',
                couleur: '#999999'
            };
        }

        // Calculer indice A (assiduité) si disponible
        let indiceA = 0.85; // Valeur par défaut optimiste
        try {
            const indicesAssiduite = db.getSync('indicesAssiduiteDetailles', {});
            if (indicesAssiduite[da]) {
                indiceA = indicesAssiduite[da].actuel.A / 100;
            }
        } catch (error) {
            // console.warn('[SOM] Erreur lecture assiduité:', error);
        }

        // Calculer engagement E = (A × C × P)^(1/3)
        const engagement = Math.pow(indiceA * indiceC * indiceP, 1/3);

        // Détecter défis
        const defis = this.detecterDefis(da);
        const aDesDefis = defis.defis.length > 0;

        // Identifier pattern
        let patternType, description, couleur, recommandation;

        if (indiceP < 0.60 || engagement < 0.30) {
            patternType = 'blocage-critique';
            description = 'Blocage critique - Engagement insuffisant';
            couleur = '#dc3545';
            recommandation = 'Intervention intensive immédiate (Niveau 3 RàI)';
        } else if (indiceA >= 0.75 && (indiceC < 0.65 || indiceP < 0.65)) {
            patternType = 'blocage-emergent';
            description = 'Blocage émergent - Assiduité présente mais performance faible';
            couleur = '#ff9800';
            recommandation = 'Intervention préventive ciblée (Niveau 2 RàI)';
        } else if (indiceP >= 0.70 && indiceP < 0.80 && aDesDefis) {
            patternType = 'defi-specifique';
            description = 'Défi spécifique - Performance acceptable mais défis identifiés';
            couleur = '#ffc107';
            recommandation = 'Suivi régulier et renforcement (Niveau 1-2 RàI)';
        } else if (indiceP >= 0.80 && indiceP < 0.85) {
            patternType = 'stable';
            description = 'Stable - Performance satisfaisante sans défis majeurs';
            couleur = '#4caf50';
            recommandation = 'Maintenir l\'engagement et encourager';
        } else if (indiceP >= 0.85) {
            patternType = 'progression';
            description = 'Progression - Excellente performance avec engagement soutenu';
            couleur = '#388e3c';
            recommandation = 'Valoriser les réussites et viser l\'excellence';
        } else {
            patternType = 'stable';
            description = 'Stable - Progression régulière';
            couleur = '#4caf50';
            recommandation = 'Poursuivre les efforts';
        }

        return {
            type: patternType,
            description: description,
            indices: {
                A: indiceA,
                C: indiceC,
                P: indiceP
            },
            couleur: couleur,
            recommandation: recommandation
        };
    }

    /**
     * Génère une cible d'intervention RàI personnalisée
     *
     * Cible basée sur :
     * - Pattern actuel
     * - Productions avec notes les plus faibles
     * - Tendance (baisse ou stabilité)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, cible, strategies, ressources, niveau }
     */
    genererCibleIntervention(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return null;
        }

        const pattern = this.identifierPattern(da);
        const defis = this.detecterDefis(da);

        // console.log('[SOM] Génération cible RàI pour DA', da, {
            pattern: pattern.type,
            nbDefis: defis.defis.length
        });

        // Identifier la production la plus faible
        const productionFaible = defis.defis.find(d => d.type === 'note-faible');

        // Cible par défaut
        let cible = {
            type: 'production-faible',
            cible: '',
            strategies: [],
            ressources: [],
            niveau: 1,
            couleur: pattern.couleur,
            emoji: '🟢'
        };

        // BLOCAGE CRITIQUE (Niveau 3 RàI)
        if (pattern.type === 'blocage-critique') {
            cible.niveau = 3;
            cible.couleur = '#dc3545';
            cible.emoji = '🔴';

            if (productionFaible) {
                cible.cible = `Reprise obligatoire : ${productionFaible.production}`;
                cible.strategies = [
                    'Rencontre individuelle pour identifier les obstacles',
                    'Plan de rattrapage détaillé avec échéances',
                    'Jeton de reprise disponible (sous conditions)',
                    'Suivi hebdomadaire des progrès'
                ];
            } else {
                cible.cible = 'Plan de rattrapage global';
                cible.strategies = [
                    'Rencontre d\'urgence avec l\'étudiant',
                    'Évaluation des difficultés (académiques, personnelles)',
                    'Référence aux services de soutien (SA, CAF, etc.)',
                    'Plan d\'action intensif individualisé'
                ];
            }

            cible.ressources = [
                'Services adaptés (SA)',
                'Centre d\'aide (CAF)',
                'Mentorat par les pairs',
                'Capsules de révision'
            ];
        }

        // BLOCAGE ÉMERGENT (Niveau 2 RàI)
        else if (pattern.type === 'blocage-emergent') {
            cible.niveau = 2;
            cible.couleur = '#ff9800';
            cible.emoji = '🟠';

            if (productionFaible) {
                cible.cible = `Rattrapage ciblé : ${productionFaible.production}`;
                cible.strategies = [
                    'Révision des concepts mal maîtrisés',
                    'Exercices supplémentaires sur les lacunes identifiées',
                    'Feedback formatif régulier',
                    'Possibilité de reprise (jeton)'
                ];
            } else {
                cible.cible = 'Renforcement des apprentissages';
                cible.strategies = [
                    'Séances de révision en petits groupes',
                    'Accompagnement personnalisé',
                    'Stratégies d\'étude efficaces'
                ];
            }

            cible.ressources = [
                'Séances de révision',
                'Exercices supplémentaires',
                'Tutorat par les pairs'
            ];
        }

        // DÉFI SPÉCIFIQUE (Niveau 1-2 RàI)
        else if (pattern.type === 'defi-specifique') {
            cible.niveau = 2;
            cible.couleur = '#ffc107';
            cible.emoji = '🟡';

            if (productionFaible) {
                cible.cible = `Amélioration : ${productionFaible.production}`;
                cible.strategies = [
                    'Révision ciblée des points faibles',
                    'Pratique délibérée avec feedback',
                    'Auto-évaluation guidée'
                ];
            } else if (defis.tendance.direction === 'baisse') {
                cible.cible = 'Renverser la tendance à la baisse';
                cible.strategies = [
                    'Identifier les causes de la baisse',
                    'Ajuster les stratégies d\'apprentissage',
                    'Renforcer la motivation et l\'engagement'
                ];
            } else {
                cible.cible = 'Consolidation des apprentissages';
                cible.strategies = [
                    'Pratique régulière',
                    'Feedback continu',
                    'Préparation aux évaluations futures'
                ];
            }

            cible.ressources = [
                'Grilles d\'auto-évaluation',
                'Capsules de révision',
                'Forum d\'entraide'
            ];
        }

        // STABLE ou PROGRESSION (Niveau 1 RàI)
        else {
            cible.niveau = 1;
            cible.couleur = pattern.type === 'progression' ? '#388e3c' : '#4caf50';
            cible.emoji = pattern.type === 'progression' ? '🟢' : '🟢';
            cible.cible = 'Maintien et consolidation';
            cible.strategies = [
                'Encourager la persévérance',
                'Viser l\'excellence',
                'Développer l\'autonomie d\'apprentissage'
            ];

            cible.ressources = [
                'Ressources d\'enrichissement',
                'Projets avancés',
                'Mentorat de pairs'
            ];
        }

        return cible;
    }

    // ========================================================================
    // MÉTHODES PRIVÉES (HELPERS)
    // ========================================================================

    /**
     * Lit les évaluations depuis localStorage
     * @private
     */
    _lireEvaluations() {
        if (typeof obtenirDonneesSelonMode === 'function') {
            return obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        }
        return db.getSync('evaluationsSauvegardees', []);
    }

    /**
     * Lit les productions depuis db.getSync
     * @private
     */
    _lireProductions() {
        return db.getSync('productions', []);
    }

    /**
     * Calcule la tendance (direction) des notes
     *
     * Compare la moyenne récente (1/3 dernières évaluations) vs moyenne ancienne (1/3 premières)
     *
     * @private
     * @param {Array} evaluations - Évaluations triées par date croissante
     * @returns {Object} { direction, variation, moyenneRecente, moyenneAncienne }
     */
    _calculerTendance(evaluations) {
        if (evaluations.length < 3) {
            return {
                direction: 'stable',
                variation: 0,
                moyenneRecente: 0,
                moyenneAncienne: 0
            };
        }

        const n = Math.ceil(evaluations.length / 3);

        // Anciennes : 1/3 premières
        const anciennes = evaluations.slice(0, n);
        const moyenneAncienne = anciennes.reduce((sum, e) => sum + e.noteFinale, 0) / anciennes.length;

        // Récentes : 1/3 dernières
        const recentes = evaluations.slice(-n);
        const moyenneRecente = recentes.reduce((sum, e) => sum + e.noteFinale, 0) / recentes.length;

        const variation = moyenneRecente - moyenneAncienne;

        let direction;
        if (variation > 5) {
            direction = 'hausse';
        } else if (variation < -5) {
            direction = 'baisse';
        } else {
            direction = 'stable';
        }

        return {
            direction: direction,
            variation: variation,
            moyenneRecente: moyenneRecente,
            moyenneAncienne: moyenneAncienne
        };
    }

    /**
     * Calcule statistiques descriptives des notes
     *
     * @private
     * @param {Array} evaluations - Évaluations de l'étudiant
     * @returns {Object} { moyenne, ecartType, min, max }
     */
    _calculerStatistiques(evaluations) {
        if (evaluations.length === 0) {
            return { moyenne: 0, ecartType: 0, min: 0, max: 0 };
        }

        const notes = evaluations.map(e => e.noteFinale);

        // Moyenne
        const moyenne = notes.reduce((sum, n) => sum + n, 0) / notes.length;

        // Écart-type
        const variance = notes.reduce((sum, n) => sum + Math.pow(n - moyenne, 2), 0) / notes.length;
        const ecartType = Math.sqrt(variance);

        // Min et max
        const min = Math.min(...notes);
        const max = Math.max(...notes);

        return {
            moyenne: moyenne,
            ecartType: ecartType,
            min: min,
            max: max
        };
    }
}

// ============================================================================
// AUTO-ENREGISTREMENT
// ============================================================================

(function() {
    // Vérifier que le registre est chargé
    if (typeof window.enregistrerPratique !== 'function') {
        console.error(
            '[SOM] Le registre n\'est pas chargé ! ' +
            'Assurez-vous de charger pratique-registre.js avant pratique-sommative.js'
        );
        return;
    }

    // Créer et enregistrer l'instance
    const instance = new PratiqueSommative();

    try {
        window.enregistrerPratique('sommative', instance);
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
        // console.log('✅ [SOM] Pratique Sommative enregistrée avec succès');
    } catch (error) {
        console.error('[SOM] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export pour utilisation directe
window.PratiqueSommative = PratiqueSommative;

// ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
// console.log('✅ Module pratique-sommative.js chargé');
