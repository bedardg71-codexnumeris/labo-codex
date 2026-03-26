/**
 * PRATIQUE CONFIGURABLE - Classe de base pour pratiques JSON
 *
 * Permet de créer des pratiques d'évaluation entièrement configurables
 * via des fichiers JSON, sans écrire de code JavaScript.
 *
 * Cette classe implémente l'interface IPratique et interprète
 * les configurations JSON pour appliquer des règles d'évaluation
 * personnalisées.
 *
 * VERSION : 1.0
 * DATE : 25 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================

class PratiqueConfigurable {
    constructor(config) {
        this.config = config;
        this.valider();
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    /**
     * Valide la structure de la configuration JSON
     * @throws {Error} Si la configuration est invalide
     */
    valider() {
        // Vérifier champs obligatoires
        const champsObligatoires = ['id', 'nom', 'echelle', 'calcul_note'];
        for (const champ of champsObligatoires) {
            if (!this.config[champ]) {
                throw new Error(`Champ obligatoire manquant : ${champ}`);
            }
        }

        // Vérifier cohérence échelle
        if (this.config.echelle.type === 'niveaux' && !this.config.echelle.niveaux) {
            throw new Error('Échelle de type "niveaux" requiert le champ "niveaux"');
        }

    }

    // ========================================================================
    // INTERFACE IPratique - Méthodes d'identité
    // ========================================================================

    obtenirNom() {
        return this.config.nom;
    }

    obtenirId() {
        return this.config.id;
    }

    obtenirDescription() {
        return this.config.description || '';
    }

    // ========================================================================
    // GESTION DES NIVEAUX
    // ========================================================================

    /**
     * Obtient un niveau par son code
     * @param {string} code - Code du niveau (ex: "3", "M", "B")
     * @returns {object} Objet niveau
     */
    getNiveau(code) {
        if (this.config.echelle.type !== 'niveaux') {
            throw new Error('Cette méthode nécessite une échelle de type "niveaux"');
        }

        return this.config.echelle.niveaux.find(n => n.code === code);
    }

    /**
     * Convertit un niveau en pourcentage
     * @param {string} niveauCode - Code du niveau
     * @returns {number} Note en pourcentage
     */
    niveauVersPourcentage(niveauCode) {
        const niveau = this.getNiveau(niveauCode);
        if (!niveau) {
            console.warn(`Niveau inconnu : ${niveauCode}`);
            return 0;
        }
        return niveau.valeur_pourcentage;
    }

    // ========================================================================
    // CALCUL DE LA PERFORMANCE (Indice P)
    // ========================================================================

    /**
     * Calcule la performance selon la méthode PAN par objectif
     * Pour chaque objectif, prend les N meilleurs artefacts, puis fait une moyenne pondérée
     * @param {string} da - DA de l'étudiant
     * @returns {number} Performance en pourcentage (0-100)
     */
    calculerPerformanceParObjectif(da) {
        // Vérifier que la configuration contient les objectifs
        if (!this.config.objectifs || !Array.isArray(this.config.objectifs)) {
            console.warn('Configuration multi-objectifs manquante, fallback sur PAN standard');
            const indicesCP = db.getSync(cle('indicesCP'), {});
            return indicesCP[da]?.actuel?.PAN?.P || 0;
        }

        // Charger les évaluations de l'étudiant
        const cleEval = cle('evaluationsSauvegardees');
        const evaluations = db.getSync(cleEval, []);
        const evaluationsEtudiant = (Array.isArray(evaluations) ? evaluations : Object.values(evaluations)).filter(evaluation => {
            return (evaluation.etudiantDA === da || evaluation.etudiantId === da) &&
                   evaluation.note !== null &&
                   evaluation.note !== undefined &&
                   !evaluation.remplaceeParId;  // Exclure les évaluations remplacées
        });

        if (evaluationsEtudiant.length === 0) {
            return 0;
        }

        // Nombre d'artefacts à retenir par objectif (configurable)
        const nombreArtefacts = this.config.calcul_note.nombre_artefacts || 3;

        // Pour chaque objectif, calculer la moyenne des N meilleurs artefacts
        let sommeNotesPonderees = 0;
        let sommePoids = 0;

        this.config.objectifs.forEach(objectif => {
            // Filtrer les évaluations associées à cet objectif
            const evaluationsObjectif = evaluationsEtudiant.filter(evaluation => {
                // Vérifier si l'évaluation est taguée avec cet objectif
                // (Suppose que les évaluations ont un champ 'objectifs' avec les IDs)
                return evaluation.objectifs && evaluation.objectifs.includes(objectif.id);
            });

            if (evaluationsObjectif.length === 0) {
                // Pas d'évaluation pour cet objectif, contribue 0 à la moyenne
                return;
            }

            // Trier par note décroissante et prendre les N meilleures
            const meilleures = evaluationsObjectif
                .sort((a, b) => b.note - a.note)
                .slice(0, nombreArtefacts);

            // Calculer la moyenne pour cet objectif
            const moyenneObjectif = meilleures.reduce((sum, evaluation) => sum + evaluation.note, 0) / meilleures.length;

            // Ajouter à la somme pondérée
            sommeNotesPonderees += moyenneObjectif * objectif.poids;
            sommePoids += objectif.poids;
        });

        // Calcul de la moyenne pondérée finale
        if (sommePoids === 0) {
            return 0;
        }

        const performancePct = sommeNotesPonderees / sommePoids;
        return Math.round(performancePct * 100) / 100;  // Arrondir à 2 décimales
    }

    /**
     * Calcule l'indice de performance selon la méthode configurée
     * @param {string} da - DA de l'étudiant
     * @returns {number} Indice P (0-1, décimal)
     */
    calculerPerformance(da) {
        const indicesCP = db.getSync(cle('indicesCP'), {});
        const donneesEtudiant = indicesCP[da];

        if (!donneesEtudiant || !donneesEtudiant.actuel) {
            return 0;
        }

        // Déterminer quelle branche utiliser (SOM ou PAN)
        const modalites = db.getSync('modalitesEvaluation', {});
        const pratique = modalites.pratique;

        let P_pct = 0;

        // Pour les pratiques configurables, utiliser la méthode définie dans la config
        switch (this.config.calcul_note.methode) {
            case 'conversion_niveaux':
                // Comme PAN : moyenne des niveaux convertis
                P_pct = donneesEtudiant.actuel.PAN?.P || 0;
                break;

            case 'moyenne_ponderee':
                // Comme SOM : moyenne pondérée
                P_pct = donneesEtudiant.actuel.SOM?.P || 0;
                break;

            case 'pan_par_objectif':
                // Calcul PAN par objectif : moyenne pondérée des N meilleurs par objectif
                P_pct = this.calculerPerformanceParObjectif(da);
                break;

            case 'specifications':
            case 'jugement_global':
                // Pour ces méthodes, utiliser le calcul custom si défini
                // Sinon, fallback sur PAN
                P_pct = donneesEtudiant.actuel.PAN?.P || 0;
                break;

            default:
                console.warn(`Méthode de calcul inconnue : ${this.config.calcul_note.methode}`);
                P_pct = donneesEtudiant.actuel.PAN?.P || 0;
        }

        // Convertir en décimal 0-1
        return P_pct / 100;
    }

    // ========================================================================
    // CALCUL DE LA COMPLÉTION (Indice C)
    // ========================================================================

    /**
     * Calcule l'indice de complétion
     * Ratio : productions remises par l'étudiant / productions évaluées du groupe
     *
     * 🔧 FIX (23 fév 2026) : Calcul indépendant à partir des productions et évaluations
     * au lieu de lire depuis indicesCP (dépendance circulaire avec calculerEtStockerIndicesCP)
     *
     * @param {string} da - DA de l'étudiant
     * @returns {number|null} Indice C (0-1, décimal), ou null si aucune production évaluée
     */
    calculerCompletion(da) {
        if (!da) return null;

        // Lire les productions et évaluations via le namespace du mode actif
        const productions = typeof obtenirDonneesSelonMode === 'function'
            ? obtenirDonneesSelonMode('productions') || []
            : db.getSync(cle('productions'), []);
        const evaluations = typeof obtenirDonneesSelonMode === 'function'
            ? obtenirDonneesSelonMode('evaluationsSauvegardees') || []
            : db.getSync(cle('evaluationsSauvegardees'), []);

        // Identifier les productions qui ont été évaluées (au moins 1 évaluation existe)
        const productionsEvaluees = productions.filter(production => {
            if (production.facultatif) return false;
            return evaluations.some(e =>
                e.productionId === production.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        if (productionsEvaluees.length === 0) {
            return null;
        }

        // Compter combien cet étudiant a remis parmi les productions évaluées
        const productionsRemises = productionsEvaluees.filter(production => {
            return evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                !e.remplaceeParId &&
                e.noteFinale !== null
            );
        });

        return productionsRemises.length / productionsEvaluees.length;
    }

    // ========================================================================
    // DÉTECTION DES DÉFIS
    // ========================================================================

    /**
     * Détecte les défis de l'étudiant selon les seuils configurés
     * @param {string} da - DA de l'étudiant
     * @returns {Array<string>} Liste des défis détectés
     */
    detecterDefis(da) {
        const defis = [];

        const indicesCP = db.getSync(cle('indicesCP'), {});
        const donneesEtudiant = indicesCP[da];

        if (!donneesEtudiant || !donneesEtudiant.actuel) {
            return defis;
        }

        // === PRATIQUE MULTI-OBJECTIFS ===
        if (this.config.calcul_note.methode === 'pan_par_objectif') {
            // Utiliser les performances par objectif depuis indicesCP
            const donnees = donneesEtudiant.actuel.PAN;

            if (!donnees || !donnees.details || !donnees.details.performancesObjectifs) {
                return defis;
            }

            const performances = donnees.details.performancesObjectifs;
            const ensembleId = donnees.details.ensembleObjectifsId;

            if (!ensembleId) {
                return defis;
            }

            // Charger l'ensemble d'objectifs pour obtenir les types et poids
            const ensembles = typeof chargerEnsemblesObjectifs === 'function'
                ? chargerEnsemblesObjectifs()
                : db.getSync('objectifsTemplates', []);
            const ensemble = ensembles.find(e => e.id === ensembleId);

            if (!ensemble || !ensemble.objectifs) {
                return defis;
            }

            // Seuils configurés
            const seuils = this.config.seuils || {};
            const seuilIntegrateur = seuils.difficulte || 70;  // 70% pour objectifs intégrateurs
            const seuilFondamental = seuils.acceptable || 75;   // 75% pour objectifs fondamentaux

            let nbFondamentauxFaibles = 0;
            let defisIntegrateurs = [];
            let defisFondamentaux = [];
            let defisTransversaux = [];

            ensemble.objectifs.forEach(objectif => {
                const perf = performances[objectif.id];

                if (!perf || perf.P === null) {
                    return; // Objectif non évalué
                }

                const P = perf.P;
                const poids = objectif.poids;
                const type = objectif.type;

                // Détection selon le type d'objectif
                if (type === 'integrateur' && poids >= 10 && P < seuilIntegrateur) {
                    // Alerte prioritaire: Objectif intégrateur avec poids ≥ 10% et P < 70%
                    defisIntegrateurs.push({
                        nom: objectif.nom,
                        P: P,
                        poids: poids,
                        priorite: 'haute'
                    });
                } else if (type === 'fondamental' && P < seuilFondamental) {
                    // Compter les objectifs fondamentaux faibles
                    nbFondamentauxFaibles++;
                    defisFondamentaux.push({
                        nom: objectif.nom,
                        P: P,
                        poids: poids
                    });
                } else if (type === 'transversal' && P < seuilFondamental) {
                    // Suivi des objectifs transversaux
                    defisTransversaux.push({
                        nom: objectif.nom,
                        P: P,
                        poids: poids
                    });
                }
            });

            // Construire la liste des défis
            // Format: nom de l'objectif (pas juste le type)
            defisIntegrateurs.forEach(d => defis.push(d.nom));

            // Alerte générale si 3+ objectifs fondamentaux faibles
            if (nbFondamentauxFaibles >= 3) {
                defisFondamentaux.forEach(d => defis.push(d.nom));
            }

            // Ajouter les objectifs transversaux en monitoring
            defisTransversaux.forEach(d => defis.push(d.nom));


            return defis;
        }

        // === PRATIQUE TRADITIONNELLE (critères) ===
        // Obtenir les données selon la méthode de calcul
        let donnees;
        if (this.config.calcul_note.methode === 'moyenne_ponderee') {
            donnees = donneesEtudiant.actuel.SOM;
        } else {
            donnees = donneesEtudiant.actuel.PAN;
        }

        if (!donnees) {
            return defis;
        }

        // Seuils configurés
        const seuils = this.config.seuils || {};
        const seuilFragile = seuils.grande_difficulte || 55;

        // Vérifier chaque critère
        if (donnees.details && donnees.details.moyennesCriteres) {
            const moyennes = donnees.details.moyennesCriteres;

            for (const [critere, valeur] of Object.entries(moyennes)) {
                if (valeur < seuilFragile) {
                    defis.push(critere);
                }
            }
        }

        return defis;
    }

    // ========================================================================
    // IDENTIFICATION DES PATTERNS
    // ========================================================================

    /**
     * Identifie le pattern actuel de l'étudiant
     * @param {string} da - DA de l'étudiant
     * @returns {string} Pattern identifié ('stable', 'fragile', 'blocage', etc.)
     */
    identifierPattern(da) {
        const defis = this.detecterDefis(da);

        // Logique simplifiée basée sur le nombre de défis
        if (defis.length === 0) {
            return 'stable';
        } else if (defis.length <= 2) {
            return 'fragile';
        } else {
            return 'blocage';
        }
    }

    // ========================================================================
    // CALCUL DE LA NOTE FINALE
    // ========================================================================

    /**
     * Calcule la note finale selon la méthode du profil
     * @param {array} evaluations - Tableau des évaluations
     * @returns {number} Note finale en pourcentage
     */
    calculerNoteFinale(evaluations) {
        switch (this.config.calcul_note.methode) {
            case 'conversion_niveaux':
                return this.calculerParConversionNiveaux(evaluations);

            case 'moyenne_ponderee':
                return this.calculerMoyennePonderee(evaluations);

            case 'specifications':
                return this.calculerParSpecifications(evaluations);

            case 'remplacement-progression':
                return this.calculerParRemplacementProgression(evaluations);

            case 'jugement_global':
                // Pas de calcul automatique
                return null;

            default:
                throw new Error(`Méthode de calcul inconnue : ${this.config.calcul_note.methode}`);
        }
    }

    /**
     * Calcule note par conversion de niveaux (ex: Bruno)
     * @private
     */
    calculerParConversionNiveaux(evaluations) {
        let somme = 0;
        let count = 0;

        for (const evaluation of evaluations) {
            if (evaluation.niveauFinal && evaluation.niveauFinal !== '--') {
                const pct = this.niveauVersPourcentage(evaluation.niveauFinal);
                somme += pct;
                count++;
            }
        }

        let noteBrute = count > 0 ? somme / count : 0;

        // Appliquer conditions spéciales (plafonnement, double verrou, etc.)
        if (this.config.calcul_note.conditions_speciales) {
            noteBrute = this.appliquerConditionsSpeciales(noteBrute, evaluations);
        }

        return Math.round(noteBrute * 10) / 10;
    }

    /**
     * Calcule moyenne pondérée classique (ex: Marie-Hélène)
     * @private
     */
    calculerMoyennePonderee(evaluations) {
        let somme = 0;
        let poidsTotal = 0;

        for (const evaluation of evaluations) {
            if (evaluation.note !== undefined && evaluation.note !== null) {
                const poids = evaluation.poids || 1;
                somme += evaluation.note * poids;
                poidsTotal += poids;
            }
        }

        const noteBrute = poidsTotal > 0 ? somme / poidsTotal : 0;

        // Appliquer conditions spéciales
        if (this.config.calcul_note.conditions_speciales) {
            return this.appliquerConditionsSpeciales(noteBrute, evaluations);
        }

        return Math.round(noteBrute * 10) / 10;
    }

    /**
     * Calcule note par remplacement progressif
     * Pour chaque paire d'évaluations, utilise max(initiale, finale) × poids.
     *
     * Référence : PRATIQUE_SOMMATIVE_REMPLACEMENT_JORDAN dans pratiques-predefines.js
     * @private
     */
    calculerParRemplacementProgression(evaluations) {
        const structure = this.config.structure_evaluations;
        if (!structure) {
            console.warn('[PratiqueConfigurable] Pas de structure d\'évaluations configurée');
            return this.calculerMoyennePonderee(evaluations);
        }

        let somme = 0;
        let poidsTotal = 0;

        // Traiter les paires de remplacement
        const paires = structure.paires_remplacement || [];
        for (const paire of paires) {
            const evalInitiale = evaluations.find(e =>
                e.id === paire.evaluation_initiale.id ||
                e.nom === paire.evaluation_initiale.nom ||
                e.evaluationId === paire.evaluation_initiale.id
            );
            const evalFinale = evaluations.find(e =>
                e.id === paire.evaluation_finale.id ||
                e.nom === paire.evaluation_finale.nom ||
                e.evaluationId === paire.evaluation_finale.id
            );

            const noteInitiale = (evalInitiale && evalInitiale.note != null) ? evalInitiale.note : null;
            const noteFinale = (evalFinale && evalFinale.note != null) ? evalFinale.note : null;

            const poidsInitial = paire.evaluation_initiale.poids || 0;
            const poidsFinal = paire.evaluation_finale.poids || 0;

            if (paire.regle_remplacement === 'max' && noteInitiale != null && noteFinale != null) {
                // Si la note finale est supérieure, elle remplace l'initiale
                if (noteFinale >= noteInitiale) {
                    // Finale remplace : tout le poids combiné va à la note finale
                    somme += noteFinale * (poidsInitial + poidsFinal);
                    poidsTotal += poidsInitial + poidsFinal;
                } else {
                    // Pas de remplacement : chacune garde son poids
                    somme += noteInitiale * poidsInitial + noteFinale * poidsFinal;
                    poidsTotal += poidsInitial + poidsFinal;
                }
            } else {
                // Pas de remplacement ou données incomplètes
                if (noteInitiale != null) {
                    somme += noteInitiale * poidsInitial;
                    poidsTotal += poidsInitial;
                }
                if (noteFinale != null) {
                    somme += noteFinale * poidsFinal;
                    poidsTotal += poidsFinal;
                }
            }
        }

        // Traiter les autres évaluations (non appariées)
        const autresEvals = structure.autres_evaluations || [];
        for (const autreConfig of autresEvals) {
            const evaluation = evaluations.find(e =>
                e.id === autreConfig.id ||
                e.nom === autreConfig.nom ||
                e.evaluationId === autreConfig.id
            );
            if (evaluation && evaluation.note != null) {
                const poids = autreConfig.poids || 0;
                somme += evaluation.note * poids;
                poidsTotal += poids;
            }
        }

        const noteBrute = poidsTotal > 0 ? somme / poidsTotal : 0;

        // Appliquer conditions spéciales si configurées
        if (this.config.calcul_note.conditions_speciales) {
            return this.appliquerConditionsSpeciales(noteBrute, evaluations);
        }

        return Math.round(noteBrute * 10) / 10;
    }

    /**
     * Calcule note par spécifications
     * Vérifie quelles spécifications sont satisfaites et retourne
     * la note du forfait (bundle) le plus élevé satisfait.
     *
     * Référence : PRATIQUE_PAN_SPECIFICATIONS dans pratiques-predefines.js
     * @private
     */
    calculerParSpecifications(evaluations) {
        const structure = this.config.structure_evaluations;
        if (!structure || !structure.specifications) {
            console.warn('[PratiqueConfigurable] Pas de spécifications configurées');
            return 0;
        }

        const specifications = structure.specifications;

        // Déterminer quelles spécifications sont satisfaites
        const specsSatisfaites = new Set();
        for (const spec of specifications) {
            // Chercher une évaluation correspondante qui est réussie
            const evalCorrespondante = evaluations.find(e =>
                (e.nom === spec.nom || e.specificationId === spec.id) &&
                e.note !== null && e.note !== undefined &&
                (e.reussi === true || e.note >= (spec.seuil || 60))
            );
            if (evalCorrespondante) {
                specsSatisfaites.add(spec.nom || spec.id);
            }
        }

        // Déterminer les notes possibles (forfaits), triées du plus élevé au plus bas
        const echelle = this.config.echelle;
        const notesPossibles = (echelle && echelle.notes_possibles)
            ? [...echelle.notes_possibles].sort((a, b) => b - a)
            : [100, 80, 60, 50];

        // Pour chaque note (de la plus haute à la plus basse),
        // vérifier si toutes les spécifications requises sont satisfaites
        for (const note of notesPossibles) {
            const specsRequises = specifications.filter(s =>
                s.requis_pour && s.requis_pour.includes(note)
            );

            const toutesRequisesSatisfaites = specsRequises.every(s =>
                specsSatisfaites.has(s.nom || s.id)
            );

            if (toutesRequisesSatisfaites && specsRequises.length > 0) {
                return note;
            }
        }

        // Aucun forfait satisfait — note minimale ou 0
        const noteMin = notesPossibles.length > 0
            ? notesPossibles[notesPossibles.length - 1]
            : 0;

        // Vérifier si au moins les specs du niveau minimal sont satisfaites
        const specsMin = specifications.filter(s =>
            s.requis_pour && s.requis_pour.includes(noteMin)
        );
        const minSatisfait = specsMin.every(s =>
            specsSatisfaites.has(s.nom || s.id)
        );

        return minSatisfait ? noteMin : 0;
    }

    /**
     * Applique les conditions spéciales (plafonnement, verrous, etc.)
     * @private
     */
    appliquerConditionsSpeciales(noteBrute, evaluations) {
        let noteFinale = noteBrute;

        if (!this.config.calcul_note.conditions_speciales) {
            return noteFinale;
        }

        for (const condition of this.config.calcul_note.conditions_speciales) {
            switch (condition.type) {
                case 'plafonnement':
                    noteFinale = this.appliquerPlafonnement(noteFinale, evaluations, condition);
                    break;

                case 'double_verrou':
                    noteFinale = this.appliquerDoubleVerrou(noteFinale, evaluations, condition);
                    break;
            }
        }

        return noteFinale;
    }

    /**
     * Applique un plafonnement conditionnel
     * @private
     */
    appliquerPlafonnement(noteActuelle, evaluations, condition) {
        // Extraire les évaluations concernées
        const ciblesIds = condition.condition.cibles;
        const evals = evaluations.filter(e => ciblesIds.includes(e.standardId || e.id));

        // Calculer moyenne de ces évaluations
        let somme = 0;
        let count = 0;
        for (const evaluation of evals) {
            const pct = evaluation.niveauFinal
                ? this.niveauVersPourcentage(evaluation.niveauFinal)
                : evaluation.note;
            if (pct !== undefined && pct !== null) {
                somme += pct;
                count++;
            }
        }

        const moyenne = count > 0 ? somme / count : 0;

        // Vérifier condition
        const seuil = condition.condition.seuil;
        const comparateur = condition.condition.comparateur;

        let conditionRemplie = false;
        switch (comparateur) {
            case '<':
                conditionRemplie = moyenne < seuil;
                break;
            case '<=':
                conditionRemplie = moyenne <= seuil;
                break;
            case '>':
                conditionRemplie = moyenne > seuil;
                break;
            case '>=':
                conditionRemplie = moyenne >= seuil;
                break;
        }

        // Appliquer conséquence
        if (conditionRemplie && condition.consequence.action === 'plafonner') {
            return Math.min(noteActuelle, condition.consequence.valeur);
        }

        return noteActuelle;
    }

    /**
     * Applique un double verrou
     * Si l'évaluation verrouillée est sous le seuil, la note finale est plafonnée.
     *
     * Référence : PRATIQUE_SOMMATIVE_TRADITIONNELLE dans pratiques-predefines.js
     * @private
     */
    appliquerDoubleVerrou(noteActuelle, evaluations, condition) {
        // Trouver l'évaluation verrouillée
        const nomCible = condition.condition.evaluation;
        const evalVerrouillee = evaluations.find(e =>
            e.nom === nomCible || e.id === nomCible || e.evaluationId === nomCible
        );

        if (!evalVerrouillee || evalVerrouillee.note === null || evalVerrouillee.note === undefined) {
            // Évaluation pas encore passée — pas de verrou appliqué
            return noteActuelle;
        }

        // Vérifier la condition
        const seuil = condition.condition.seuil;
        const comparateur = condition.condition.comparateur || '<';
        let conditionRemplie = false;

        switch (comparateur) {
            case '<':
                conditionRemplie = evalVerrouillee.note < seuil;
                break;
            case '<=':
                conditionRemplie = evalVerrouillee.note <= seuil;
                break;
            case '>':
                conditionRemplie = evalVerrouillee.note > seuil;
                break;
            case '>=':
                conditionRemplie = evalVerrouillee.note >= seuil;
                break;
        }

        // Appliquer la conséquence
        if (conditionRemplie) {
            if (condition.consequence.action === 'echec') {
                // Note plafonnée au maximum spécifié (ex: 55%)
                const noteMax = condition.consequence.note_max || 55;
                return Math.min(noteActuelle, noteMax);
            } else if (condition.consequence.action === 'plafonner') {
                return Math.min(noteActuelle, condition.consequence.valeur);
            }
        }

        return noteActuelle;
    }

    // ========================================================================
    // INTERPRÉTATION DES NIVEAUX
    // ========================================================================

    /**
     * Interprète le niveau de risque selon les seuils du profil
     * @param {number} valeur - Valeur à interpréter (note ou indice)
     * @param {string} typeIndice - 'performance', 'assiduite', 'completion', etc.
     * @returns {string} 'bon', 'acceptable', 'fragile'
     */
    interpreterNiveau(valeur, typeIndice = null) {
        if (this.config.seuils.type === 'aucun') {
            return null;
        }

        // Déterminer les seuils à utiliser
        let seuils;
        if (typeIndice && this.config.seuils.seuils_par_indice?.[typeIndice]) {
            seuils = this.config.seuils.seuils_par_indice[typeIndice];
        } else {
            seuils = {
                va_bien: this.config.seuils.va_bien,
                difficulte: this.config.seuils.difficulte,
                grande_difficulte: this.config.seuils.grande_difficulte
            };
        }

        // Interpréter
        if (valeur >= seuils.va_bien) return 'bon';
        if (valeur >= seuils.difficulte) return 'acceptable';
        return 'fragile';
    }

    // ========================================================================
    // CIBLES D'INTERVENTION RÀI
    // ========================================================================

    /**
     * Génère une cible d'intervention personnalisée
     * @param {string} da - DA de l'étudiant
     * @returns {object} Cible d'intervention
     */
    genererCibleIntervention(da) {
        const defis = this.detecterDefis(da);
        const pattern = this.identifierPattern(da);

        return {
            niveau: defis.length <= 2 ? 2 : 3,
            cibles: defis,
            pattern: pattern,
            recommandation: `Intervenir sur : ${defis.join(', ')}`
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

window.PratiqueConfigurable = PratiqueConfigurable;



})();
