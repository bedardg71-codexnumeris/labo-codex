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

        console.log(`✅ Pratique "${this.config.nom}" validée`);
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
            const indicesCP = db.getSync('indicesCP', {});
            return indicesCP[da]?.actuel?.PAN?.P || 0;
        }

        // Charger les évaluations de l'étudiant
        const evaluations = db.getSync('evaluations', {});
        const evaluationsEtudiant = Object.values(evaluations).filter(evaluation => {
            return evaluation.etudiantId === da &&
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
            const evaluationsObjectif = evaluationsEtudiant.filter(eval => {
                // Vérifier si l'évaluation est taguée avec cet objectif
                // (Suppose que les évaluations ont un champ 'objectifs' avec les IDs)
                return eval.objectifs && eval.objectifs.includes(objectif.id);
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
            const moyenneObjectif = meilleures.reduce((sum, eval) => sum + eval.note, 0) / meilleures.length;

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
        const indicesCP = db.getSync('indicesCP', {});
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
     * @param {string} da - DA de l'étudiant
     * @returns {number} Indice C (0-1, décimal)
     */
    calculerCompletion(da) {
        const indicesCP = db.getSync('indicesCP', {});
        const donneesEtudiant = indicesCP[da];

        if (!donneesEtudiant || !donneesEtudiant.actuel) {
            return 0;
        }

        // La complétion est calculée de la même manière pour toutes les pratiques
        const C_pct = donneesEtudiant.actuel.SOM?.C || donneesEtudiant.actuel.PAN?.C || 0;

        // Convertir en décimal 0-1
        return C_pct / 100;
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

        const indicesCP = db.getSync('indicesCP', {});
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

            console.log(`[Multi-Objectifs] Défis détectés pour DA ${da}:`, {
                integrateurs: defisIntegrateurs.length,
                fondamentaux: nbFondamentauxFaibles >= 3 ? defisFondamentaux.length : 0,
                transversaux: defisTransversaux.length,
                total: defis.length
            });

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
     * Calcule note par spécifications (ex: François)
     * @private
     */
    calculerParSpecifications(evaluations) {
        // TODO : Implémenter la logique des spécifications
        // Pour l'instant, retourner 0
        console.warn('Méthode "specifications" pas encore implémentée');
        return 0;
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
     * @private
     */
    appliquerDoubleVerrou(noteActuelle, evaluations, condition) {
        // TODO : Implémenter la logique du double verrou
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

console.log('✅ Module pratique-configurable.js chargé');
