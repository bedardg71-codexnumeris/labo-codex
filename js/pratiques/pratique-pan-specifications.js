/**
 * PRATIQUE PAN PAR SPÉCIFICATIONS - Implémentation complète V2.0
 *
 * Pratique par spécifications (Specification Grading) basée sur les principes
 * de Linda B. Nilson (2014) et un collègue en chimie (2025).
 *
 * PRINCIPES FONDAMENTAUX :
 * - Évaluation BINAIRE : Travail acceptable ou non acceptable (pas de niveaux)
 * - BUNDLES : Note = f(ensembles de travaux acceptables), pas f(objectifs)
 * - SPÉCIFICATIONS : Caractéristiques observables qui définissent l'acceptable
 * - RÉVISIONS MULTIPLES : Jetons pour reprises et extensions de délais
 * - CLARTÉ : Spécifications rédigées à l'avance, compréhensibles par tous
 *
 * ARCHITECTURE :
 * - UNIVERSEL (codé en dur) : Évaluation binaire, logique bundles, calcul completion
 * - CONFIGURABLE (via wizard) : Types de travaux, spécifications, table de correspondance, jetons
 *
 * RÉFÉRENCES :
 * - Nilson, L. B. (2014). Specifications Grading: Restoring Rigor, Motivating Students, and Saving Faculty Time
 * - Collègue en chimie (2025). Exploration au pays des spécifications (article AQPC)
 *
 * VERSION : 2.0
 * DATE : 9 décembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

class PratiquePanSpecifications {

    constructor() {

        // =====================================================================
        // CONFIGURATION PAR DÉFAUT (surchargée par wizard)
        // =====================================================================
        this.config = {
            // Types de travaux avec leurs spécifications
            typesTravaux: [
                // EXEMPLE (cours de chimie) :
                // {
                //     id: 'prise-position',
                //     nom: 'Prise de position',
                //     seuilAcceptable: 75, // Note minimale pour être "acceptable"
                //     specifications: [
                //         'Équivalent à environ 750 mots',
                //         'Au moins 2 sources fiables citées convenablement',
                //         'Faits établis tirés des sources et utilisés pour étayer arguments',
                //         '...'
                //     ]
                // },
                // { id: 'test', nom: 'Test', seuilAcceptable: 75, specifications: [...] },
                // { id: 'portfolio', nom: 'Portfolio des activités', seuilAcceptable: 75, specifications: [...] }
            ],

            // Table de correspondance : bundles → notes
            tableBundles: [
                // EXEMPLE (cours François) :
                // { noteFixe: 100, label: 'A', requis: {'prise-position': 2, 'test': 2, 'portfolio': 1}, description: 'Excellence' },
                // { noteFixe: 80, label: 'B', requis: {'prise-position': 2, 'test': 1, 'portfolio': 1}, description: 'Bonne performance' },
                // { noteFixe: 70, label: 'C+', requis: {'prise-position': 1, 'test': 1, 'portfolio': 1}, description: 'Maîtrise acceptable' },
                // { noteFixe: 60, label: 'C', requis: {'prise-position': 1, 'test': 1}, description: 'Réussite minimale' },
                // { noteFixe: 50, label: 'F', requis: null, description: 'Échec' }
            ],

            // Configuration jetons (délai, reprise)
            jetons: {
                actif: true,
                delai: { nombre: 2, dureeJours: 2 },  // 🆕 Beta 95.7 : défaut 2 jours
                reprise: { nombre: 2, maxParProduction: 1 }
            },

            // Métadonnées
            seuilReussite: 60,
            seuilExcellence: 80
        };
    }

    // ========================================================================
    // MÉTHODES D'IDENTITÉ (Interface IPratique)
    // ========================================================================

    obtenirNom() {
        return "PAN par spécifications";
    }

    obtenirId() {
        return "specifications";
    }

    obtenirDescription() {
        return "Pratique par spécifications (Specification Grading) basée sur Nilson (2014). " +
               "Évaluation binaire (acceptable/non-acceptable) de travaux selon des spécifications claires. " +
               "Note finale = f(ensembles de travaux acceptables). Révisions multiples via jetons. " +
               "Approche qui clarifie les attentes, responsabilise les étudiants, et valorise la persévérance.";
    }

    // Représentations (Session B) — déléguées au registre (source unique)
    obtenirCode() { return window.obtenirCodePratique(this.obtenirId()); }
    obtenirCouleur() { return window.obtenirCouleurPratique(this.obtenirId()); }
    obtenirLabelFamille() { return window.obtenirLabelFamillePratique(this.obtenirId()); }

    // ========================================================================
    // CONFIGURATION (Spécifique à PAN-Spécifications)
    // ========================================================================

    /**
     * Configure la pratique avec des paramètres spécifiques
     *
     * @param {Object} configuration - Configuration de la pratique
     * @param {Array} configuration.typesTravaux - Types de travaux avec spécifications
     * @param {Array} configuration.tableBundles - Table de correspondance bundles → notes
     * @param {Object} configuration.jetons - Configuration des jetons
     */
    configurerPratique(configuration) {
        if (configuration.typesTravaux) {
            this.config.typesTravaux = configuration.typesTravaux;
        }

        if (configuration.tableBundles) {
            this.config.tableBundles = configuration.tableBundles;
        }

        if (configuration.jetons) {
            this.config.jetons = { ...this.config.jetons, ...configuration.jetons };
        }

        if (configuration.seuilReussite !== undefined) {
            this.config.seuilReussite = configuration.seuilReussite;
        }

        if (configuration.seuilExcellence !== undefined) {
            this.config.seuilExcellence = configuration.seuilExcellence;
        }

    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon pratique PAN-Spécifications V2.0
     *
     * LOGIQUE BUNDLES (universel, codé en dur) :
     * 1. Compter les travaux acceptables par type (évaluation binaire)
     * 2. Déterminer le palier de note le plus élevé dont tous les requis sont satisfaits
     * 3. Retourner cette note fixe
     *
     * PRINCIPE CLÉS :
     * - Note = f(bundles de travaux acceptables), PAS f(objectifs)
     * - Évaluation binaire : acceptable si TOUTES les spécifications sont respectées
     * - Révisions incluses dans le comptage (jetons utilisés = travaux révisés)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            console.warn('[SPEC] DA invalide:', da);
            return null;
        }

        // Lire les évaluations
        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // ÉTAPE 1 : Compter travaux acceptables par type
        const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);


        // ÉTAPE 2 : Déterminer palier de note atteint (logique bundles)
        const noteAtteinte = this._determinerPalierBundle(comptesAcceptables);


        return noteAtteinte / 100;
    }

    /**
     * C2-c (Comparateur, fiche de profil) — RÉCIT DE CALCUL SPE, traçabilité ADDITIVE.
     *
     * Produit l'objet normalisé `RecitCalcul` (contrat NOTE-CONCEPTION-C2 §4). En
     * spécifications, la note est un PALIER : chaque type de travail est décrit par
     * son sort vis-à-vis du palier atteint —
     *   - `satisfait`  : exigé par le palier atteint, et atteint (par construction du bundle) ;
     *   - `manquant`   : non exigé au palier atteint mais requis (et déficitaire) au palier suivant ;
     *   - `non-exige`  : ni exigé au palier atteint, ni bloquant pour le suivant.
     *
     * Orientation A (SSOT, additif) : la note finale vient DIRECTEMENT de
     * calculerPerformance (palier ÷ 100) ; on ne décrit ici que la composition.
     * calculerPerformance reste inchangée → la note ne bouge pas (sentinelle de parité).
     *
     * Repli (NOTE §5) : sans config exploitable (types/bundles), renvoie null
     * (« récit indisponible »), JAMAIS d'échec global hors STD.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object|null} RecitCalcul §4, ou null si non calculable
     */
    decrireCalcul(da) {
        if (!da || da.length !== 7) {
            return null;
        }

        // Config exploitable requise (sinon repli « récit indisponible »).
        const types = (this.config && this.config.typesTravaux) || [];
        const bundles = (this.config && this.config.tableBundles) || [];
        if (types.length === 0 || bundles.length === 0) {
            return null;
        }

        const evaluations = this._lireEvaluations();
        // MÊMES critères de validité que calculerPerformance (garantit la parité).
        const valides = (evaluations || []).filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );

        if (valides.length === 0) {
            return null;
        }

        const comptes = this._compterTravauxAcceptables(da, valides);
        const noteAtteinte = this._determinerPalierBundle(comptes);
        const palierAtteint = bundles.find(p => p.noteFixe === noteAtteinte) || null;

        // Palier immédiatement supérieur (pour qualifier le « manquant »).
        const prochain = bundles
            .filter(p => p.requis && p.noteFixe > noteAtteinte)
            .sort((a, b) => a.noteFixe - b.noteFixe)[0] || null;

        const labelPalier = (p) => p ? (p.label || p.description || (p.noteFixe + ' %')) : null;

        const resultats = types.map(t => {
            const nbAcc = comptes[t.id] || 0;
            const reqAtteint = (palierAtteint && palierAtteint.requis && palierAtteint.requis[t.id]) || 0;
            const reqProchain = (prochain && prochain.requis && prochain.requis[t.id]) || 0;

            let sort, detail;
            if (reqAtteint > 0) {
                sort = 'satisfait';
                detail = nbAcc + ' acceptable' + (nbAcc > 1 ? 's' : '') +
                         ' · ' + reqAtteint + ' exigé' + (reqAtteint > 1 ? 's' : '') +
                         ' (palier ' + labelPalier(palierAtteint) + ')';
            } else if (reqProchain > nbAcc) {
                const manque = reqProchain - nbAcc;
                sort = 'manquant';
                detail = 'il manque ' + manque + ' acceptable' + (manque > 1 ? 's' : '') +
                         ' pour le palier ' + labelPalier(prochain);
            } else {
                sort = 'non-exige';
                detail = nbAcc > 0
                    ? (nbAcc + ' acceptable' + (nbAcc > 1 ? 's' : '') + ' · au-delà des exigences du palier atteint')
                    : 'non exigé pour le palier atteint';
            }

            return {
                label: t.nom || t.id,
                date: null,           // un type agrège plusieurs travaux : pas de date unique
                niveau: null,         // SPE binaire : pas de niveau d'échelle
                note: null,           // la note est le palier, pas un score par type
                sort: sort,
                detail: detail
            };
        });

        const indiceP = this.calculerPerformance(da);   // SSOT — la note ne bouge pas
        const noteFinale = (indiceP === null || indiceP === undefined) ? null : indiceP * 100;

        return {
            famille: this.obtenirCode(),     // 'SPE' (registre, source unique)
            pratiqueNom: this.obtenirNom(),
            resultats: resultats,
            synthese: {
                formuleTexte: palierAtteint
                    ? ('palier ' + labelPalier(palierAtteint) + ' atteint'
                       + (palierAtteint.description ? ' — ' + palierAtteint.description : ''))
                    : 'aucun palier atteint',
                noteFinale: noteFinale,
                plafonnement: null               // les spécifications ne plafonnent pas
            }
        };
    }

    /**
     * Calcule l'indice C (Complétion) selon pratique PAN-Spécifications V2.0
     *
     * LOGIQUE (universel, codé en dur) :
     * Formule : Nombre de travaux acceptables remis / Nombre total de travaux attendus
     *
     * PRINCIPE :
     * - Complétion = proportion de travaux acceptables dans le bundle le plus élevé
     * - Un travail "remis mais non acceptable" compte dans le dénominateur (attendu) mais pas dans le numérateur
     * - Les révisions sont comptées (si un travail devient acceptable après révision)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
        if (!da || da.length !== 7) {
            console.warn('[SPEC] DA invalide:', da);
            return null;
        }

        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // Compter travaux acceptables par type
        const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);

        // Calculer total travaux attendus (bundle le plus élevé, ou bundle A)
        const palierMax = this.config.tableBundles
            .filter(p => p.requis)
            .sort((a, b) => b.noteFixe - a.noteFixe)[0];

        if (!palierMax || !palierMax.requis) {
            console.warn('[SPEC] Aucun palier avec requis configuré');
            return null;
        }

        // Total attendu = somme des requis du palier max
        const totalAttendu = Object.values(palierMax.requis).reduce((sum, nb) => sum + nb, 0);

        // Total acceptable = somme des comptesAcceptables
        const totalAcceptable = Object.values(comptesAcceptables).reduce((sum, nb) => sum + nb, 0);

        if (totalAttendu === 0) {
            console.warn('[SPEC] Aucun travail attendu configuré');
            return null;
        }

        const indiceC = Math.min(totalAcceptable / totalAttendu, 1.0);


        return indiceC;
    }

    // ========================================================================
    // MÉTHODES D'ANALYSE (Interface IPratique)
    // ========================================================================

    /**
     * Détecte les défis spécifiques à la pratique PAN-Spécifications V2.0
     *
     * LOGIQUE BUNDLES :
     * - Travaux non acceptables (blocage pour palier supérieur)
     * - Travaux critiques manquants (requis pour réussite)
     * - Opportunités de révision disponibles (jetons restants)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type: 'specifications', defis: [], travauxAcceptables: {}, prochainPalier: null }
     */
    detecterDefis(da) {
        if (!da || da.length !== 7) {
            console.warn('[SPEC] DA invalide:', da);
            return { type: 'specifications', defis: [], travauxAcceptables: {}, prochainPalier: null };
        }

        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null
        );

        if (evaluationsEleve.length === 0) {
            return { type: 'specifications', defis: [], travauxAcceptables: {}, prochainPalier: null };
        }

        // Compter travaux acceptables
        const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);
        const noteActuelle = this._determinerPalierBundle(comptesAcceptables);

        // Identifier défis pour palier supérieur
        const defis = [];
        const paliers = [...this.config.tableBundles]
            .filter(p => p.requis)
            .sort((a, b) => b.noteFixe - a.noteFixe);

        // Trouver le prochain palier
        const prochainPalier = paliers.find(p => p.noteFixe > noteActuelle);

        if (prochainPalier) {
            // Pour chaque type de travail requis
            Object.entries(prochainPalier.requis).forEach(([typeTravail, nbRequis]) => {
                const nbAcceptables = comptesAcceptables[typeTravail] || 0;
                const manque = nbRequis - nbAcceptables;

                if (manque > 0) {
                    const typeTravailConfig = this.config.typesTravaux.find(t => t.id === typeTravail);
                    defis.push({
                        type: 'travaux-manquants',
                        typeTravail: typeTravail,
                        nomTravail: typeTravailConfig?.nom || typeTravail,
                        nbManquants: manque,
                        nbAcceptables: nbAcceptables,
                        nbRequis: nbRequis,
                        palier: prochainPalier.noteFixe,
                        priorite: noteActuelle < this.config.seuilReussite ? 'haute' : 'moyenne'
                    });
                }
            });
        }

        // Identifier défis critiques (requis pour réussite)
        if (noteActuelle < this.config.seuilReussite) {
            const palierReussite = paliers.find(p => p.noteFixe >= this.config.seuilReussite);
            if (palierReussite && palierReussite.requis) {
                Object.entries(palierReussite.requis).forEach(([typeTravail, nbRequis]) => {
                    const nbAcceptables = comptesAcceptables[typeTravail] || 0;
                    if (nbAcceptables < nbRequis) {
                        const typeTravailConfig = this.config.typesTravaux.find(t => t.id === typeTravail);
                        defis.push({
                            type: 'travaux-critiques',
                            typeTravail: typeTravail,
                            nomTravail: typeTravailConfig?.nom || typeTravail,
                            nbManquants: nbRequis - nbAcceptables,
                            priorite: 'haute',
                            message: 'Requis pour la réussite du cours'
                        });
                    }
                });
            }
        }

        return {
            type: 'specifications',
            defis: defis,
            travauxAcceptables: comptesAcceptables,
            noteActuelle: noteActuelle,
            prochainPalier: prochainPalier
        };
    }

    /**
     * Identifie le pattern actuel de l'étudiant
     *
     * Pour PAN-Spécifications V2.0, les patterns sont basés sur le palier de note atteint
     * et le nombre de travaux acceptables.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {string} Pattern identifié: 'excellence', 'stable', 'difficulte', 'risque'
     */
    identifierPattern(da) {
        if (!da || da.length !== 7) {
            console.warn('[SPEC] DA invalide:', da);
            return 'stable';
        }

        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null
        );

        if (evaluationsEleve.length === 0) {
            return 'stable';
        }

        // Calculer note actuelle selon logique bundles
        const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);
        const noteActuelle = this._determinerPalierBundle(comptesAcceptables);

        // Déterminer pattern selon note atteinte
        if (noteActuelle >= this.config.seuilExcellence) {
            return 'excellence'; // 80%+
        } else if (noteActuelle >= this.config.seuilReussite) {
            return 'stable'; // 60-79%
        } else if (noteActuelle >= 50) {
            return 'difficulte'; // 50-59%
        } else {
            return 'risque'; // < 50%
        }
    }

    /**
     * Génère la cible d'intervention RàI pour un étudiant
     * Méthode requise par l'interface IPratique
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} { type, cible, strategies, ressources, niveau }
     */
    genererCibleIntervention(da) {
        if (!da || da.length !== 7) {
            console.warn('[SPEC] DA invalide:', da);
            return null;
        }

        // Obtenir le pattern et les défis
        const pattern = this.identifierPattern(da);
        const defis = this.detecterDefis(da);

        // Déterminer la cible principale d'intervention
        // Pour PAN-Spécifications, la cible est basée sur les objectifs non atteints
        const defiPrincipal = defis.principalDefi ? defis.principalDefi.nom : 'Aucun';


        // Retourner un objet structuré compatible avec l'interface
        return {
            type: pattern,
            cible: defiPrincipal,
            strategies: [],  // À implémenter selon les besoins
            ressources: [],  // À implémenter selon les besoins
            niveau: pattern === 'risque' ? 3 : (pattern === 'difficulte' ? 2 : 1)
        };
    }

    /**
     * Calcule le niveau RàI (Réponse à l'Intervention)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {number} indiceA - Assiduité (0-1)
     * @param {number} indiceC - Complétion (0-1)
     * @param {number} indiceP - Performance (0-1)
     * @returns {number} Niveau RàI (1, 2, ou 3)
     */
    calculerNiveauRai(da, indiceA, indiceC, indiceP) {
        // Logique RàI universelle basée sur A-C-P
        const engagement = indiceA * indiceC * indiceP;

        if (engagement >= 0.65) {
            return 1; // Universel
        } else if (engagement >= 0.50) {
            return 2; // Préventif
        } else {
            return 3; // Intensif
        }
    }

    /**
     * Détermine la cible d'intervention RàI
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {number} indiceA - Assiduité (0-1)
     * @param {number} indiceC - Complétion (0-1)
     * @param {number} indiceP - Performance (0-1)
     * @returns {string} Cible principale: 'A', 'C', ou 'P'
     */
    determinerCibleIntervention(da, indiceA, indiceC, indiceP) {
        // Trouver l'indice le plus faible
        const indices = { A: indiceA, C: indiceC, P: indiceP };
        let ciblePrincipale = 'P';
        let valeurMin = indiceP;

        if (indiceC < valeurMin) {
            ciblePrincipale = 'C';
            valeurMin = indiceC;
        }

        if (indiceA < valeurMin) {
            ciblePrincipale = 'A';
        }

        return ciblePrincipale;
    }

    /**
     * Obtient les données formatées pour le profil étudiant
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {Object} indices - Indices A, C, P
     * @returns {Object} Données structurées pour affichage
     */
    obtenirDonneesProfil(da, indices) {
        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId &&
            e.noteFinale !== null
        );

        const comptesAcceptables = this._compterTravauxAcceptables(da, evaluationsEleve);
        const noteActuelle = this._determinerPalierBundle(comptesAcceptables);
        const defis = this.detecterDefis(da);

        // Calculer total travaux acceptables et attendus
        const totalAcceptables = Object.values(comptesAcceptables).reduce((sum, nb) => sum + nb, 0);
        const palierMax = this.config.tableBundles
            .filter(p => p.requis)
            .sort((a, b) => b.noteFixe - a.noteFixe)[0];
        const totalAttendus = palierMax && palierMax.requis
            ? Object.values(palierMax.requis).reduce((sum, nb) => sum + nb, 0)
            : 0;

        return {
            noteFinale: noteActuelle,
            travauxAcceptables: totalAcceptables,
            travauxTotaux: totalAttendus,
            detailsTravauxAcceptables: comptesAcceptables,
            palierActuel: this._obtenirDescriptionPalier(noteActuelle),
            prochainPalier: defis.prochainPalier ? this._obtenirDescriptionPalier(defis.prochainPalier.noteFixe) : null,
            travauxManquants: defis.defis.filter(d => d.type === 'travaux-manquants'),
            travauxCritiques: defis.defis.filter(d => d.type === 'travaux-critiques')
        };
    }

    // ========================================================================
    // MÉTHODES PRIVÉES (Logique interne - UNIVERSELLE)
    // ========================================================================

    /**
     * Compte le nombre de travaux acceptables par type
     *
     * PRINCIPE UNIVERSEL (codé en dur) :
     * Pour chaque type de travail configuré, compte combien de travaux sont acceptables
     * selon les spécifications définies.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {Array} evaluations - Évaluations de l'étudiant
     * @returns {Object} { 'type-travail-1': 2, 'type-travail-2': 1, ... }
     * @private
     */
    _compterTravauxAcceptables(da, evaluations) {
        const comptes = {};

        // Lire les productions pour avoir accès aux types
        const productions = this._lireProductions();

        // Pour chaque type de travail configuré
        this.config.typesTravaux.forEach(typeTravail => {
            comptes[typeTravail.id] = 0;

            // Filtrer les évaluations de ce type
            const evaluationsCeType = evaluations.filter(e => {
                const prod = productions.find(p => p.id === e.productionId);
                return prod && (prod.type === typeTravail.id || prod.identifiant === typeTravail.id);
            });

            // Compter celles qui sont acceptables
            evaluationsCeType.forEach(evaluation => {
                if (this._estTravailAcceptable(evaluation, typeTravail)) {
                    comptes[typeTravail.id]++;
                }
            });
        });

        return comptes;
    }

    /**
     * Vérifie si un travail est acceptable selon les spécifications (ÉVALUATION BINAIRE)
     *
     * PRINCIPE UNIVERSEL (codé en dur) :
     * Un travail est acceptable SI ET SEULEMENT SI toutes les spécifications sont respectées.
     * Pas de niveaux intermédiaires : c'est tout ou rien.
     *
     * @param {Object} evaluation - Évaluation à vérifier
     * @param {Object} typeTravail - Type de travail avec ses spécifications
     * @returns {boolean} True si toutes les spécifications sont respectées
     * @private
     */
    _estTravailAcceptable(evaluation, typeTravail) {
        if (!evaluation || !typeTravail) {
            return false;
        }

        // Si le travail a un statut "non remis" ou null, il n'est pas acceptable
        if (!evaluation.noteFinale && evaluation.noteFinale !== 0) {
            return false;
        }

        if (evaluation.statutRemise === 'non-remis') {
            return false;
        }

        // LOGIQUE BINAIRE : Vérifier toutes les spécifications
        // Pour l'instant, on utilise un seuil simple (sera raffiné avec vraies spécifications)
        const seuil = typeTravail.seuilAcceptable || 60; // Seuil par défaut B+ (75-80%)

        return evaluation.noteFinale >= seuil;
    }


    /**
     * Détermine le palier de note atteint selon les bundles de travaux acceptables
     *
     * PRINCIPE UNIVERSEL (codé en dur) :
     * Trouver le palier le plus élevé dont TOUS les requis sont satisfaits.
     * Si aucun palier n'est atteint, retourner la note d'échec.
     *
     * @param {Object} comptesAcceptables - Comptes de travaux acceptables par type
     * @returns {number} Note fixe du palier atteint
     * @private
     */
    _determinerPalierBundle(comptesAcceptables) {
        // Trier paliers par ordre décroissant (A → B → C → F)
        const paliers = [...this.config.tableBundles].sort((a, b) => b.noteFixe - a.noteFixe);

        // Trouver le palier le plus élevé dont TOUS les requis sont satisfaits
        for (const palier of paliers) {
            // Skip palier échec (pas de requis)
            if (!palier.requis) continue;

            // Vérifier si tous les requis de ce palier sont satisfaits
            const tousRequisSatisfaits = Object.entries(palier.requis).every(([typeTravail, nbRequis]) => {
                const nbAcceptables = comptesAcceptables[typeTravail] || 0;
                return nbAcceptables >= nbRequis;
            });

            if (tousRequisSatisfaits) {
                return palier.noteFixe;
            }
        }

        // Aucun palier atteint : retourner note d'échec
        const palierEchec = this.config.tableBundles.find(p => !p.requis);
        return palierEchec ? palierEchec.noteFixe : 50;
    }

    /**
     * Obtient la description d'un palier de note
     *
     * @param {number} note - Note du palier
     * @returns {string} Description du palier
     * @private
     */
    _obtenirDescriptionPalier(note) {
        const palier = this.config.tableBundles.find(p => p.noteFixe === note);
        if (palier) {
            return palier.description || `${palier.label} (${note}%)`;
        }
        return `Note de ${note}%`;
    }

    /**
     * Lit les évaluations via obtenirDonneesSelonMode (namespace + mode)
     * @private
     */
    _lireEvaluations() {
        return (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('evaluationsSauvegardees')
            : db.getSync(cle('evaluationsSauvegardees'), []);
    }

    /**
     * Lit les productions via obtenirDonneesSelonMode (namespace + mode)
     * @private
     */
    _lireProductions() {
        return (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions')
            : db.getSync(cle('productions'), []);
    }
}

// ============================================================================
// AUTO-ENREGISTREMENT DANS LE REGISTRE
// ============================================================================

(function() {
    // Attendre que le registre soit disponible
    if (typeof window.enregistrerPratique !== 'function') {
        console.error(
            '[SPEC] Impossible d\'enregistrer PratiquePanSpecifications : ' +
            'Assure-toi de charger pratique-registre.js avant pratique-pan-specifications.js'
        );
        return;
    }

    // Créer et enregistrer l'instance
    const instance = new PratiquePanSpecifications();

    try {
        window.enregistrerPratique('specifications', instance);
    } catch (error) {
        console.error('[SPEC] Erreur lors de l\'enregistrement:', error);
    }
})();

// Export de la classe pour utilisation directe
window.PratiquePanSpecifications = PratiquePanSpecifications;



})();
