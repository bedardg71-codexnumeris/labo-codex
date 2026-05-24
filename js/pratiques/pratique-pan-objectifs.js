/**
 * PRATIQUE PAN-OBJECTIFS
 *
 * Pratique PAN basée sur 6 objectifs de compétence qui doivent TOUS être réussis.
 * Système de notation non-linéaire avec seuils critiques par objectif.
 *
 * CARACTÉRISTIQUES :
 * - 6 objectifs avec critères multiples (3-6 critères par objectif)
 * - Échelle 4 niveaux par objectif (1-2-3-4)
 * - Calcul de note finale basé sur des seuils critiques (non moyenne)
 * - Tous les objectifs doivent atteindre niveau 3+ pour réussir
 * - Bonus de 3.33% par objectif niveau 4
 *
 * LOGIQUE DE NOTATION :
 * - Tous objectifs niveau 3        → 80%
 * - Tous 3+ avec bonus niveau 4    → 80% + (3.33% × nb objectifs niveau 4)
 * - Un objectif niveau 2           → 55%
 * - Deux niveau 2 OU un niveau 1   → 50%
 * - Autres cas                     → 0-40% (selon nb objectifs < 3)
 *
 * VERSION : 1.0
 * DATE : 9 décembre 2025
 * AUTEUR : Grégoire Bédard
 * DISCIPLINE : Informatique
 */

(function() {
'use strict';

class PratiquePANObjectifs {

    constructor() {
    }

    // ========================================================================
    // MÉTHODES D'IDENTITÉ (Interface IPratique)
    // ========================================================================

    obtenirNom() {
        return "PAN-Objectifs";
    }

    obtenirId() {
        return "pan-objectifs";
    }

    obtenirDescription() {
        return "Pratique PAN basée sur 6 objectifs de compétence. " +
               "Système de notation non-linéaire avec seuils critiques : tous les objectifs doivent " +
               "atteindre niveau 3+ pour réussir. Discipline : Informatique (Interfaces et BD).";
    }

    // ========================================================================
    // MÉTHODES DE CALCUL (Interface IPratique)
    // ========================================================================

    /**
     * Calcule l'indice P (Performance) selon PAN-Objectifs
     *
     * Formule : Note finale basée sur niveau minimum des 6 objectifs + bonus niveau 4
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice P entre 0 et 1, ou null si pas de données
     */
    calculerPerformance(da) {
        if (!da || da.length !== 7) {
            console.warn('[PAN-Objectifs] DA invalide:', da);
            return null;
        }

        // Lire configuration et évaluations
        const config = this._lireConfiguration();
        const objectifs = config.objectifs || [];

        if (objectifs.length === 0) {
            console.warn('[PAN-Objectifs] Aucun objectif configuré');
            return null;
        }

        // Calculer le niveau de chaque objectif
        const niveauxObjectifs = this._calculerNiveauxObjectifs(da, objectifs);

        if (niveauxObjectifs === null || niveauxObjectifs.length === 0) {
            return null;
        }

        // Appliquer la logique de notation non-linéaire
        const noteFinal = this._calculerNoteFinale(niveauxObjectifs);


        return noteFinal;
    }

    /**
     * Calcule l'indice C (Complétion) selon PAN-Objectifs
     *
     * Logique : Nombre d'objectifs évalués / Total objectifs
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
        if (!da || da.length !== 7) {
            console.warn('[PAN-Objectifs] DA invalide:', da);
            return null;
        }

        // Lire configuration
        const config = this._lireConfiguration();
        const objectifs = config.objectifs || [];

        if (objectifs.length === 0) {
            console.warn('[PAN-Objectifs] Aucun objectif configuré');
            return null;
        }

        // Compter objectifs évalués
        const niveauxObjectifs = this._calculerNiveauxObjectifs(da, objectifs);

        if (niveauxObjectifs === null) {
            return 0; // Aucun objectif évalué
        }

        const nbObjectifsEvalues = niveauxObjectifs.filter(obj => obj.niveau !== null).length;
        const nbObjectifsTotal = objectifs.length;

        const indiceC = nbObjectifsEvalues / nbObjectifsTotal;


        return indiceC;
    }

    // ========================================================================
    // MÉTHODES D'ANALYSE (Interface IPratique)
    // ========================================================================

    /**
     * Détecte les défis spécifiques (objectifs faibles)
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} Défis identifiés par objectif
     */
    detecterDefis(da) {
        const config = this._lireConfiguration();
        const objectifs = config.objectifs || [];
        const niveauxObjectifs = this._calculerNiveauxObjectifs(da, objectifs);

        if (!niveauxObjectifs || niveauxObjectifs.length === 0) {
            return { type: 'objectifs', defis: [], forces: [] };
        }

        const defis = [];
        const forces = [];

        niveauxObjectifs.forEach(obj => {
            if (obj.niveau === null) {
                // Objectif non évalué
                defis.push({
                    objectif: obj.nom,
                    niveau: 'Non évalué',
                    priorite: 'haute',
                    description: 'Objectif non encore évalué'
                });
            } else if (obj.niveau < 3) {
                // Objectif en difficulté (niveau 1 ou 2)
                defis.push({
                    objectif: obj.nom,
                    niveau: obj.niveau,
                    priorite: obj.niveau === 1 ? 'critique' : 'haute',
                    description: obj.niveau === 1
                        ? 'Niveau 1 - Compréhension insuffisante'
                        : 'Niveau 2 - En développement, mais sous le seuil de réussite'
                });
            } else if (obj.niveau === 4) {
                // Force (niveau 4)
                forces.push({
                    objectif: obj.nom,
                    niveau: obj.niveau,
                    description: 'Niveau 4 - Maîtrise excellente'
                });
            }
        });

        return {
            type: 'objectifs',
            defis: defis.sort((a, b) => {
                const priorite = { critique: 0, haute: 1, moyenne: 2 };
                return priorite[a.priorite] - priorite[b.priorite];
            }),
            forces
        };
    }

    /**
     * Identifie le pattern d'apprentissage selon les objectifs
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} Pattern identifié
     */
    identifierPattern(da) {
        const config = this._lireConfiguration();
        const objectifs = config.objectifs || [];
        const niveauxObjectifs = this._calculerNiveauxObjectifs(da, objectifs);

        if (!niveauxObjectifs || niveauxObjectifs.length === 0) {
            return {
                type: 'aucune-donnee',
                description: 'Aucune évaluation disponible',
                couleur: '#9e9e9e',
                recommandation: 'En attente d\'évaluations'
            };
        }

        // Compter les niveaux
        const nbObjectifs = niveauxObjectifs.filter(obj => obj.niveau !== null).length;
        const nbNiveau1 = niveauxObjectifs.filter(obj => obj.niveau === 1).length;
        const nbNiveau2 = niveauxObjectifs.filter(obj => obj.niveau === 2).length;
        const nbNiveau3 = niveauxObjectifs.filter(obj => obj.niveau === 3).length;
        const nbNiveau4 = niveauxObjectifs.filter(obj => obj.niveau === 4).length;

        // Patterns selon la logique seuils critiques
        if (nbNiveau1 > 0 || nbNiveau2 >= 2) {
            // Échec certain (niveau 1 présent OU 2+ objectifs niveau 2)
            return {
                type: 'difficulte-persistante',
                description: 'Difficulté persistante - Échec du cours imminent',
                couleur: '#d32f2f',
                recommandation: 'Intervention intensive immédiate (Niveau 3)',
                details: `${nbNiveau1} objectif(s) niveau 1, ${nbNiveau2} objectif(s) niveau 2`
            };
        }

        if (nbNiveau2 === 1) {
            // Risque d'échec (1 objectif niveau 2)
            return {
                type: 'difficulte-emergente',
                description: 'Difficulté émergente - Un objectif sous le seuil de réussite',
                couleur: '#f57c00',
                recommandation: 'Intervention ciblée urgente (Niveau 2-3)',
                details: '1 objectif niveau 2 (note : 55%)'
            };
        }

        if (nbNiveau3 + nbNiveau4 === objectifs.length) {
            // Tous objectifs réussis (niveau 3+)
            if (nbNiveau4 === objectifs.length) {
                // Excellence (tous niveau 4)
                return {
                    type: 'excellence',
                    description: 'Excellence - Tous les objectifs au niveau 4',
                    couleur: '#1b5e20',
                    recommandation: 'Maintenir l\'excellence et encourager le dépassement',
                    details: `Note finale : ${80 + (3.33 * nbNiveau4).toFixed(0)}%`
                };
            } else if (nbNiveau4 >= 3) {
                // Progression forte
                return {
                    type: 'progression',
                    description: 'Progression solide - Plusieurs objectifs au niveau 4',
                    couleur: '#388e3c',
                    recommandation: 'Maintenir l\'engagement et viser l\'excellence',
                    details: `${nbNiveau4} objectif(s) niveau 4 (bonus : +${(3.33 * nbNiveau4).toFixed(0)}%)`
                };
            } else {
                // Stable (tous niveau 3, quelques niveau 4)
                return {
                    type: 'stable',
                    description: 'Stable - Tous les objectifs réussis (niveau 3+)',
                    couleur: '#689f38',
                    recommandation: 'Encourager le dépassement vers niveau 4',
                    details: nbNiveau4 > 0
                        ? `${nbNiveau4} objectif(s) niveau 4 (bonus : +${(3.33 * nbNiveau4).toFixed(0)}%)`
                        : 'Tous objectifs niveau 3 (note : 80%)'
                };
            }
        }

        // Cas par défaut (objectifs incomplets)
        const nbObjectifsManquants = objectifs.length - nbObjectifs;
        return {
            type: 'en-cours',
            description: 'Évaluation en cours - Objectifs incomplets',
            couleur: '#ffa726',
            recommandation: 'Compléter les évaluations manquantes',
            details: `${nbObjectifsManquants} objectif(s) non évalué(s)`
        };
    }

    /**
     * Génère une cible d'intervention RàI personnalisée
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {Object} Cible d'intervention
     */
    genererCibleIntervention(da) {
        const defis = this.detecterDefis(da);

        if (!defis.defis || defis.defis.length === 0) {
            return null; // Aucune intervention nécessaire
        }

        // Prendre le défi prioritaire
        const defiPrincipal = defis.defis[0];

        // Générer stratégies selon le niveau
        let strategies = [];
        let ressources = [];

        if (defiPrincipal.niveau === 'Non évalué') {
            strategies = [
                'Compléter l\'évaluation de cet objectif dès que possible',
                'Réviser les concepts associés avant l\'évaluation',
                'Participer aux séances de pratique'
            ];
            ressources = [
                'Matériel de cours pour cet objectif',
                'Exemples et exercices pratiques'
            ];
        } else if (defiPrincipal.niveau === 1) {
            strategies = [
                `Rencontre individuelle obligatoire pour diagnostic approfondi sur : ${defiPrincipal.objectif}`,
                'Révision intensive des concepts de base avec tutoriel',
                'Exercices de remédiation ciblés et progressifs',
                'Suivi hebdomadaire avec l\'enseignant',
                'Possibilité de reprise après remédiation'
            ];
            ressources = [
                'Matériel de remédiation (exercices de base)',
                'Capsules vidéo de révision',
                'Laboratoire dirigé avec accompagnement'
            ];
        } else if (defiPrincipal.niveau === 2) {
            strategies = [
                `Rencontre de soutien pour ${defiPrincipal.objectif}`,
                'Identifier les lacunes spécifiques dans les critères',
                'Pratique guidée avec rétroaction continue',
                'Révision ciblée des aspects problématiques',
                'Préparation à une reprise si nécessaire'
            ];
            ressources = [
                'Exemples commentés de niveau 3',
                'Grille d\'auto-évaluation pour cet objectif',
                'Séances de pratique en laboratoire'
            ];
        }

        return {
            type: 'objectif-faible',
            objectif: defiPrincipal.objectif,
            niveau_actuel: defiPrincipal.niveau,
            niveau_cible: 3, // Seuil de réussite
            priorite: defiPrincipal.priorite,
            strategies,
            ressources,
            echeance: defiPrincipal.niveau === 1 || defiPrincipal.niveau === 2
                ? 'Reprise possible après remédiation (voir enseignant)'
                : 'À compléter avant la fin du cours'
        };
    }

    // ========================================================================
    // MÉTHODES PRIVÉES (HELPERS)
    // ========================================================================

    /**
     * Lit la configuration PAN-Objectifs
     *
     * @returns {Object} Configuration avec objectifs
     */
    _lireConfiguration() {
        const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});

        // Configuration par défaut PAN-Objectifs
        const configDefaut = {
            objectifs: [
                {
                    id: 1,
                    nom: 'Objectif 1 - Base de données relationnelle',
                    description: 'Tables, clés, formes normales, scripts de création',
                    criteres: [
                        'Les tables nécessaires à la résolution de la problématique et ses clés sont identifiées de façon juste et précise',
                        'Les champs de chaque table et ses contraintes sont identifiés de façon juste et précise',
                        'Les trois formes normales sont appliquées de façon juste et rigoureuse',
                        'Le script de création de tables est fidèle au modèle relationnel et judicieusement documenté',
                        'Le script de contraintes est fidèle au modèle relationnel et judicieusement documenté',
                        'Les scripts de création de vues sont fidèles au modèle relationnel et judicieusement documentés'
                    ]
                },
                {
                    id: 2,
                    nom: 'Objectif 2 - Programmation SQL avancée',
                    description: 'Procédures stockées, déclencheurs, jobs',
                    criteres: [
                        'Les entrées des procédures stockées sont correctement définies',
                        'Les sorties des procédures stockées sont correctement définies',
                        'La programmation des procédures stockées est presque optimale',
                        'Les entrées d\'un déclencheur sont correctement identifiées',
                        'La programmation des déclencheurs est presque optimale',
                        'L\'utilité et le fonctionnement des jobs sont expliqués correctement'
                    ]
                },
                {
                    id: 3,
                    nom: 'Objectif 3 - Sécurité et sauvegarde',
                    description: 'Schémas, chiffrement, sauvegardes',
                    criteres: [
                        'L\'utilité et le fonctionnement des schémas sont expliqués correctement',
                        'La table est adaptée correctement afin de pouvoir chiffrer au moins un de ses champs',
                        'Des données chiffrées sont rigoureusement et parfaitement insérées dans une table',
                        'Les sauvegardes sont faites à une fréquence convenable et avec le type approprié',
                        'Les sauvegardes sont adéquatement restaurées'
                    ]
                },
                {
                    id: 4,
                    nom: 'Objectif 4 - Modélisation objet (DB First)',
                    description: 'Classes, propriétés, encapsulation, DB First',
                    criteres: [
                        'Les classes nécessaires au fonctionnement de l\'application sont correctement identifiées',
                        'Les propriétés des classes sont correctement identifiées',
                        'L\'encapsulation à faire pour chaque propriété est correctement identifiés',
                        'La commande permettant la programmation base de données en premier (DB First) est correctement exécutée',
                        'Les classes générées par la programmation base de données en premier sont correctement ajustées'
                    ]
                },
                {
                    id: 5,
                    nom: 'Objectif 5 - Interface utilisateur',
                    description: 'Composants, positionnement, simplicité, rétroaction',
                    criteres: [
                        'Les composants d\'affichage sont judicieusement choisis pour présenter correctement les données',
                        'Les éléments ayant un lien entre eux sont positionnés correctement',
                        'L\'interface conçue est simple et intuitive',
                        'Lorsque l\'utilisateur pose une action, une rétroaction adéquate est fournie instantanément'
                    ]
                },
                {
                    id: 6,
                    nom: 'Objectif 6 - Programmation application',
                    description: 'Méthodes, découpage, LINQ',
                    criteres: [
                        'Les méthodes des classes sont correctement identifiées et programmées',
                        'Les entrées et sorties des méthodes sont correctement identifiées et programmées',
                        'Le découpage par fonction est optimal',
                        'Les méthodes synchrones et asynchrones sont utilisées judicieusement',
                        'Les données utilisées par l\'application programmée proviennent de la bonne base de données',
                        'Les requêtes à la base de données sont uniquement en LINQ et correctement programmées'
                    ]
                }
            ],
            seuils: {
                fragile: 0.55,     // 55% - Un objectif niveau 2
                acceptable: 0.80,  // 80% - Tous objectifs niveau 3
                bon: 0.90          // 90% - Plusieurs objectifs niveau 4
            }
        };

        return modalites.configPANObjectifs || configDefaut;
    }

    /**
     * Calcule le niveau de chaque objectif pour un étudiant
     *
     * Logique : Niveau = MINIMUM des critères de l'objectif
     *
     * @param {string} da - Numéro de dossier d'admission
     * @param {Array} objectifs - Liste des objectifs configurés
     * @returns {Array} Niveaux par objectif { id, nom, niveau, criteres: [...] }
     */
    _calculerNiveauxObjectifs(da, objectifs) {
        const evaluations = this._lireEvaluations();
        const evaluationsEleve = evaluations.filter(e =>
            e.etudiantDA === da &&
            !e.remplaceeParId // Exclure évaluations remplacées
        );

        if (evaluationsEleve.length === 0) {
            return null;
        }

        // Calculer le niveau de chaque objectif
        const niveauxObjectifs = objectifs.map(obj => {
            // Pour chaque objectif, trouver le niveau MINIMUM de tous ses critères
            // (logique : l'objectif est au niveau de son critère le plus faible)

            // Note : Dans la pratique PAN-Objectifs, les évaluations devraient contenir
            // une note par critère OU une note globale par objectif
            // Pour l'instant, on utilise la note finale de l'évaluation comme proxy

            const evaluationsObjectif = evaluationsEleve.filter(e => {
                // Filtrer évaluations liées à cet objectif
                // (on suppose que la production est associée à l'objectif)
                const production = this._lireProduction(e.productionId);
                return production && production.objectifId === obj.id;
            });

            if (evaluationsObjectif.length === 0) {
                return { id: obj.id, nom: obj.nom, niveau: null, criteres: [] };
            }

            // Prendre la dernière évaluation (plus récente)
            evaluationsObjectif.sort((a, b) => new Date(b.dateEvaluation) - new Date(a.dateEvaluation));
            const derniere = evaluationsObjectif[0];

            // Convertir la note finale (0-100) en niveau (1-4)
            const niveau = this._convertirNoteEnNiveau(derniere.noteFinale);

            return {
                id: obj.id,
                nom: obj.nom,
                niveau,
                noteFinale: derniere.noteFinale,
                criteres: obj.criteres
            };
        });

        return niveauxObjectifs;
    }

    /**
     * Convertit une note (0-100) en niveau (1-4)
     *
     * Échelle PAN-Objectifs :
     * - Niveau 1 : < 40%
     * - Niveau 2 : 40-59%
     * - Niveau 3 : 60-89%
     * - Niveau 4 : 90-100%
     *
     * @param {number} note - Note sur 100
     * @returns {number} Niveau (1-4)
     */
    _convertirNoteEnNiveau(note) {
        if (note < 40) return 1;
        if (note < 60) return 2;
        if (note < 90) return 3;
        return 4;
    }

    /**
     * Calcule la note finale selon la logique non-linéaire PAN-Objectifs
     *
     * @param {Array} niveauxObjectifs - Niveaux de chaque objectif
     * @returns {number} Note finale (0-1)
     */
    _calculerNoteFinale(niveauxObjectifs) {
        // Compter les objectifs par niveau
        const nbNiveau1 = niveauxObjectifs.filter(obj => obj.niveau === 1).length;
        const nbNiveau2 = niveauxObjectifs.filter(obj => obj.niveau === 2).length;
        const nbNiveau3 = niveauxObjectifs.filter(obj => obj.niveau === 3).length;
        const nbNiveau4 = niveauxObjectifs.filter(obj => obj.niveau === 4).length;
        const nbObjectifsTotal = niveauxObjectifs.length;
        const nbNonEvalues = niveauxObjectifs.filter(obj => obj.niveau === null).length;

        // Cas 1 : Tous objectifs niveau 3+ (réussite)
        if (nbNiveau3 + nbNiveau4 === nbObjectifsTotal) {
            // Note de base : 80%
            let note = 80;

            // Bonus : +3.33% par objectif niveau 4
            note += (3.33 * nbNiveau4);

            return note / 100;
        }

        // Cas 2 : Un objectif niveau 2
        if (nbNiveau2 === 1 && nbNiveau1 === 0) {
            return 0.55; // 55%
        }

        // Cas 3 : Deux objectifs niveau 2 OU un objectif niveau 1
        if (nbNiveau2 >= 2 || nbNiveau1 >= 1) {
            return 0.50; // 50%
        }

        // Cas 4 : Autres cas (plusieurs objectifs < 3)
        // Note entre 0% et 40% selon le nombre d'objectifs n'ayant pas atteint niveau 3
        const nbObjectifsSousNiveau3 = nbNiveau1 + nbNiveau2;
        const note = Math.max(0, 40 - (nbObjectifsSousNiveau3 * 10));

        return note / 100;
    }

    /**
     * Lit toutes les évaluations depuis localStorage
     *
     * @returns {Array} Liste des évaluations
     */
    _lireEvaluations() {
        const evaluationsEtudiants = db.getSync('evaluationsEtudiants', []);
        return evaluationsEtudiants;
    }

    /**
     * Lit une production par son ID
     *
     * @param {string} productionId - ID de la production
     * @returns {Object} Production ou null
     */
    _lireProduction(productionId) {
        const productions = db.getSync(cle('productions'), []);
        return productions.find(p => p.id === productionId) || null;
    }
}

// ============================================================================
// AUTO-ENREGISTREMENT
// ============================================================================

// Auto-enregistrement de la pratique au chargement du module
if (typeof window !== 'undefined') {
    // Export de la classe
    window.PratiquePANObjectifs = PratiquePANObjectifs;

    // Auto-enregistrement dans le registre
    if (typeof window.enregistrerPratique === 'function') {
        const instance = new PratiquePANObjectifs();
        window.enregistrerPratique('pan-objectifs', instance);
    } else {
        console.warn('[PAN-Objectifs] Registre non disponible, enregistrement différé');
        // Enregistrement différé après chargement du registre
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window.enregistrerPratique === 'function') {
                const instance = new PratiquePANObjectifs();
                window.enregistrerPratique('pan-objectifs', instance);
            }
        });
    }
}



})();
