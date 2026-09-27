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

(function() {
'use strict';

// #941 lot S1 (décision A, 24 sept. 2026) — ce que le RÉCIT dit du niveau d'une copie : rien pour
// une copie en points (`evaluationEnPoints`, gabarits-utils.js), ni pour le « -- » faute de niveau.
// Le récit est lu par les vues (profil, Comparateur) ; la note, elle, ne lit pas ce champ.
function estEnPoints(e) {
    return typeof window.evaluationEnPoints === 'function' && window.evaluationEnPoints(e);
}
function niveauDuRecit(e) {
    if (typeof window.niveauFinalAffichable === 'function') return window.niveauFinalAffichable(e) || null;
    return (e && e.niveauFinal) || null;
}

class PratiqueSommative {

    constructor() {
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
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

    // Représentations (Session B) — déléguées au registre (source unique)
    obtenirCode() { return window.obtenirCodePratique(this.obtenirId()); }
    obtenirCouleur() { return window.obtenirCouleurPratique(this.obtenirId()); }
    obtenirLabelFamille() { return window.obtenirLabelFamillePratique(this.obtenirId()); }

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

        // Filtrer évaluations de cet étudiant — #706 : la règle unique du registre
        // (remplacées, sans note, brouillons non verrouillés et portée nulle : hors note).
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da && window.evaluationEntreDansLaNote(e)
        );

        if (evaluationsEleve.length === 0) {
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

        return indiceP;
    }

    /**
     * C2-b (Comparateur, fiche de profil) — RÉCIT DE CALCUL SOM, traçabilité ADDITIVE.
     *
     * Produit l'objet normalisé `RecitCalcul` (contrat NOTE-CONCEPTION-C2 §4) qui
     * décrit le « sort » de chaque résultat : en sommative, chaque évaluation valide
     * est COMPTÉE UNE FOIS, à son poids ; les remplacées par reprise sont exclues de
     * la moyenne (nommées tout de même, pour l'honnêteté du récit).
     *
     * Orientation A (SSOT, additif) : la note finale du récit vient DIRECTEMENT de
     * `calculerPerformance` (aucun recalcul parallèle) ; on ne reproduit la boucle
     * de pondération que pour exprimer le poids effectif PAR résultat. `calculerPerformance`
     * reste inchangée → la note ne bouge pas (sentinelle de parité C2-b).
     *
     * Neutralité (continuité C1) : `niveau` reste un CODE BRUT, traduit par l'échelle
     * à la vue. Aucun littéral I/D/M/E ici.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object|null} RecitCalcul §4, ou null si non calculable
     */
    decrireCalcul(da) {
        if (!da || da.length !== 7) {
            return null;
        }

        const evaluations = this._lireEvaluations();
        const productions = this._lireProductions();

        const titreProd = (pid) => {
            const p = productions.find(pr => pr.id === pid);
            return p?.titre || p?.activiteApprentissage || p?.description || pid;
        };
        // MÊME règle que calculerPerformance : pondération de la production, défaut 1.
        const pondProd = (pid) => {
            const p = productions.find(pr => pr.id === pid);
            return p?.ponderation || 1;
        };

        // MÊMES critères de validité que calculerPerformance (garantit la parité) — #706.
        const valides = evaluations.filter(e =>
            e.etudiantDA === da && window.evaluationEntreDansLaNote(e)
        );

        if (valides.length === 0) {
            return null;
        }

        // Poids effectif normalisé, pour l'affichage PAR résultat. La note finale,
        // elle, vient de calculerPerformance (SSOT) — pas d'un recalcul parallèle.
        const pondTotal = valides.reduce((somme, e) => somme + pondProd(e.productionId), 0);
        const poidsPct = (pid) => pondTotal > 0 ? (pondProd(pid) / pondTotal * 100) : 0;

        const parDate = (a, b) =>
            new Date(a.dateEvaluation || a.dateCreation || 0) - new Date(b.dateEvaluation || b.dateCreation || 0);

        const resultats = [];

        // Comptées : chaque évaluation valide, une fois, à son poids.
        valides.slice().sort(parDate).forEach(e => {
            resultats.push({
                label: titreProd(e.productionId),
                // #922 — la vue en fait une pastille cliquable, à la couleur de SON échelle (#575) : elle ne devine rien.
                productionId: e.productionId,
                echelleId: e.echelleId ?? null,
                date: e.dateEvaluation || null,
                niveau: niveauDuRecit(e),   // code BRUT — traduit par l'échelle à la vue ; #941 lot S1 : aucun en points
                enPoints: estEnPoints(e),
                note: (e.noteFinale ?? null),
                sort: 'compte',
                // #921 — le poids en NOMBRE, pour qui écrit la ligne de calcul (profil) : `ponderation` est celle de la
                // production (défaut 1, même règle que `calculerPerformance`), `poids` sa part en % des copies comptées.
                ponderation: pondProd(e.productionId),
                poids: poidsPct(e.productionId),
                detail: 'comptée une fois · poids ' + poidsPct(e.productionId).toFixed(0) + ' %'
            });
        });

        // #706 — brouillons (non verrouillées) et portée nulle : nommés, non comptés.
        evaluations
            .filter(e => e.etudiantDA === da && !e.remplaceeParId
                && e.noteFinale !== null && e.noteFinale !== undefined
                && !window.evaluationEntreDansLaNote(e))
            .slice().sort(parDate)
            .forEach(e => {
                resultats.push({
                    label: titreProd(e.productionId),
                    date: e.dateEvaluation || null,
                    niveau: niveauDuRecit(e),
                    enPoints: estEnPoints(e),
                    note: (e.noteFinale ?? null),
                    sort: 'ecarte',
                    detail: e.verrouillee === false ? 'évaluation non verrouillée · non comptée' : 'sans critère évalué · non comptée'
                });
            });

        // Remplacées par reprise : exclues de la moyenne (parité), nommées pour l'honnêteté.
        // #360 — exclure les doublons réconciliés : ils portent remplaceeParId SANS
        // être des reprises ; les étiqueter « par une reprise » serait mensonger.
        evaluations
            .filter(e => e.etudiantDA === da && e.remplaceeParId && !e.reconcilieParDoublon)
            .slice().sort(parDate)
            .forEach(e => {
                resultats.push({
                    label: titreProd(e.productionId),
                    date: e.dateEvaluation || null,
                    niveau: niveauDuRecit(e),
                    enPoints: estEnPoints(e),
                    note: (e.noteFinale ?? null),
                    sort: 'remplace',
                    detail: 'remplacée par une reprise · exclue de la moyenne'
                });
            });

        // #360 — doublons note-égale réconciliés : exclus de la moyenne, motif honnête.
        evaluations
            .filter(e => e.etudiantDA === da && e.reconcilieParDoublon)
            .slice().sort(parDate)
            .forEach(e => {
                resultats.push({
                    label: titreProd(e.productionId),
                    date: e.dateEvaluation || null,
                    niveau: niveauDuRecit(e),
                    enPoints: estEnPoints(e),
                    note: (e.noteFinale ?? null),
                    sort: 'remplace',
                    detail: 'doublon note-égale · exclu de la moyenne'
                });
            });

        const indiceP = this.calculerPerformance(da);   // SSOT — la note ne bouge pas
        const noteFinale = (indiceP === null || indiceP === undefined) ? null : indiceP * 100;

        return {
            famille: this.obtenirCode(),     // 'SOM' (registre, source unique)
            pratiqueNom: this.obtenirNom(),
            resultats: resultats,
            synthese: {
                formuleTexte: 'moyenne pondérée de ' + valides.length + ' évaluation' + (valides.length > 1 ? 's' : ''),
                noteFinale: noteFinale,
                plafonnement: null               // la sommative ne plafonne pas
            }
        };
    }

    /**
     * Calcule l'indice C (Complétion) selon pratique sommative
     *
     * Formule : Nombre de productions remises / Nombre de productions évaluées
     * Une production est considérée "évaluée" si au moins une évaluation existe pour celle-ci
     * (pas seulement "créée dans le système")
     *
     * #871 (17 sept. 2026) : rend le DÉTAIL — { remis, total } — et non plus le quotient ; `calculerCompletion`
     * en découle (plus bas). Ce que cette famille compte n'a pas changé.
     * @param {string} da - Numéro de dossier d'admission
     * @returns {{remis:number,total:number}|null} Le détail de la complétion, ou null si pas de données
     */
    calculerDetailsCompletion(da) {
        if (!da || da.length !== 7) {
            // console.warn('[SOM] DA invalide:', da);
            return null;
        }

        // Lire les productions et évaluations
        const productions = this._lireProductions();
        const evaluations = this._lireEvaluations();

        // 1. Identifier les productions QUI ONT ÉTÉ ÉVALUÉES (au moins une copie qui COMPTE existe)
        // Lot A du cadrage du 16 sept. 2026 (#737, #738) — les deux prédicats de pratique-registre.js :
        // une copie compte quand elle est ENREGISTRÉE (un brouillon ne compte nulle part), et une copie
        // NON REMISE (« non-remis » ou « non-recu ») n'est jamais une remise, même notée 0. Au
        // dénominateur, un « non remis » enregistré atteste que le travail a été traité : il y reste.
        const productionsEvaluees = productions.filter(production => {
            // Exclure les productions facultatives
            if (production.facultatif) return false;

            // Vérifier qu'au moins une copie qui compte existe pour cette production
            return evaluations.some(e =>
                e.productionId === production.id &&
                window.evaluationEntreDansLaNote(e)
            );
        });

        if (productionsEvaluees.length === 0) {
            return null;
        }

        // 2. Compter combien CET ÉTUDIANT a remis parmi les productions évaluées
        // Lot 30 (17 sept. 2026) — LE DÉTAIL DIT AUSSI LESQUELLES : `productions` porte chaque production comptée au
        // dénominateur et si elle est remise ; `remis` en est le compte (jamais un second calcul). La carte Complétion
        // du profil y lit sa liste des non-remises et son message, comme la fraction (DEMO006 : « 9/10 » à côté de
        // « tous les artefacts remis ! » — la terminale manquante n'était nulle part).
        const detailProductions = productionsEvaluees.map(production => ({
            id: production.id,
            remis: evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                window.evaluationEntreDansLaNote(e) &&
                !window.evaluationNonRemise(e) &&
                !window.evaluationNonRecevable(e)   // lot 30 : tranché par Grégoire, 17 sept. 2026
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
     * - Difficulté persistante : P < 60% OU Engagement < 30%
     * - Difficulté émergente : A ≥ 75% mais C ou P < 65%
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
            patternType = 'difficulte-persistante';
            description = 'Difficulté persistante - Engagement insuffisant';
            couleur = '#dc3545';
            recommandation = 'Intervention intensive immédiate (Niveau 3 RàI)';
        } else if (indiceA >= 0.75 && (indiceC < 0.65 || indiceP < 0.65)) {
            patternType = 'difficulte-emergente';
            description = 'Difficulté émergente - Assiduité présente mais performance faible';
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

        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

        // Identifier la production la plus faible
        const productionFaible = defis.defis.find(d => d.type === 'note-faible');

        // Cible par défaut
        let cible = {
            type: 'production-faible',
            cible: '',
            strategies: [],
            ressources: [],
            niveau: 1,
            couleur: pattern.couleur
        };

        // DIFFICULTÉ PERSISTANTE (Niveau 3 RàI)
        if (pattern.type === 'difficulte-persistante') {
            cible.niveau = 3;
            cible.couleur = '#dc3545';

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
                    'Référence aux services de soutien du collège',
                    'Plan d\'action intensif individualisé'
                ];
            }

            cible.ressources = [
                'Services adaptés du collège',
                'Centre d\'aide du collège',
                'Mentorat par les pairs',
                'Capsules de révision'
            ];
        }

        // DIFFICULTÉ ÉMERGENTE (Niveau 2 RàI)
        else if (pattern.type === 'difficulte-emergente') {
            cible.niveau = 2;
            cible.couleur = '#ff9800';

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
        const brutes = (typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
            : db.getSync(cle('evaluationsSauvegardees'), []);
        return window.ProductionDiagnostique
            ? window.ProductionDiagnostique.filtrerEvaluations(brutes, this._lireProductionsBrutes())
            : brutes;
    }

    /**
     * Les productions TELLES QU'ELLES SONT EN BASE, diagnostiques comprises.
     * N'existe que pour que `_lireEvaluations` sache à quelle production rattacher
     * chaque copie : filtrer d'abord les productions rendrait les diagnostiques
     * introuvables, et leurs copies passeraient donc au travers.
     * @private
     */
    _lireProductionsBrutes() {
        if (typeof obtenirDonneesSelonMode === 'function') {
            return obtenirDonneesSelonMode('productions') || [];
        }
        return db.getSync(cle('productions'), []);
    }

    /**
     * Lit les productions depuis db.getSync
     * @private
     */
    _lireProductions() {
        const brutes = this._lireProductionsBrutes();
        return window.ProductionDiagnostique
            ? window.ProductionDiagnostique.filtrerProductions(brutes)
            : brutes;
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
            'Assure-toi de charger pratique-registre.js avant pratique-sommative.js'
        );
        return;
    }

    // Créer et enregistrer l'instance
    const instance = new PratiqueSommative();

    try {
        window.enregistrerPratique('sommative', instance);
        // ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari
    } catch (error) {
        console.error('[SOM] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export pour utilisation directe
window.PratiqueSommative = PratiqueSommative;

// ✅ DÉSACTIVÉ (7 déc 2025): Pour performance Safari

})();
