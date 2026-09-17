/**
 * PRATIQUE DE TEST - Pratique factice pour valider l'infrastructure
 *
 * Cette pratique NE DOIT PAS être utilisée en production.
 * Elle sert uniquement à tester le registre et l'interface IPratique.
 *
 * VERSION : 1.0
 * DATE : 11 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

class PratiqueTest {
    // ========================================================================
    // MÉTHODES D'IDENTITÉ
    // ========================================================================

    obtenirNom() {
        return "Pratique de test";
    }

    obtenirId() {
        return "test";
    }

    obtenirDescription() {
        return "Pratique factice pour valider l'infrastructure. Ne pas utiliser en production.";
    }

    // Représentations (Session B) — déléguées au registre (source unique)
    obtenirCode() { return window.obtenirCodePratique(this.obtenirId()); }
    obtenirCouleur() { return window.obtenirCouleurPratique(this.obtenirId()); }
    obtenirLabelFamille() { return window.obtenirLabelFamillePratique(this.obtenirId()); }

    // ========================================================================
    // MÉTHODES DE CALCUL
    // ========================================================================

    calculerPerformance(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return null;
        }

        // Retourner une valeur fixe pour les tests
        return 0.75; // 75%
    }

    calculerDetailsCompletion(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return null;
        }

        // Retourner une valeur fixe pour les tests : 8 remises sur 10 (80 %)
        return { remis: 8, total: 10 };
    }

    // #871 : l'indice découle du détail, comme dans les vraies pratiques.
    calculerCompletion(da) {
        const details = this.calculerDetailsCompletion(da);
        return details ? details.remis / details.total : null;
    }

    // ========================================================================
    // MÉTHODES D'ANALYSE
    // ========================================================================

    detecterDefis(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return { type: 'test', defis: [], forces: [] };
        }

        // Retourner des défis factices
        return {
            type: 'test',
            defis: [
                {
                    nom: 'Défi de test 1',
                    valeur: 0.68,
                    seuil: 0.75,
                    priorite: 'haute'
                },
                {
                    nom: 'Défi de test 2',
                    valeur: 0.72,
                    seuil: 0.75,
                    priorite: 'moyenne'
                }
            ],
            forces: [
                {
                    nom: 'Force de test 1',
                    valeur: 0.85
                }
            ]
        };
    }

    identifierPattern(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return {
                type: 'inconnu',
                description: 'DA invalide',
                couleur: '#999999'
            };
        }

        // Retourner un pattern factice
        return {
            type: 'stable',
            description: 'Pattern de test - Stable',
            indices: {
                A: 0.85,
                C: 0.80,
                P: 0.75
            },
            couleur: '#4caf50',
            recommandation: 'Recommandation de test : Maintenir l\'engagement'
        };
    }

    genererCibleIntervention(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return null;
        }

        // Retourner une cible factice
        return {
            type: 'test',
            cible: 'Cible de test',
            niveau_actuel: 0.68,
            niveau_cible: 0.75,
            strategies: [
                'Stratégie de test 1',
                'Stratégie de test 2',
                'Stratégie de test 3'
            ],
            ressources: [
                'Ressource de test 1',
                'Ressource de test 2'
            ]
        };
    }
}

// ============================================================================
// AUTO-ENREGISTREMENT
// ============================================================================

/**
 * Enregistrer automatiquement la pratique de test au chargement du module
 *
 * NOTE : En production, cet enregistrement ne devrait se faire que si
 * le mode debug est activé.
 */
(function() {
    // Vérifier que le registre est disponible
    if (typeof window.enregistrerPratique !== 'function') {
        console.error(
            '[PratiqueTest] Le registre n\'est pas chargé ! ' +
            'Assure-toi de charger pratique-registre.js avant pratique-test.js'
        );
        return;
    }

    // Créer et enregistrer une instance
    const instance = new PratiqueTest();

    try {
        window.enregistrerPratique('test', instance);
    } catch (error) {
        console.error('[PratiqueTest] Erreur lors de l\'enregistrement:', error);
    }
})();

// ============================================================================
// TESTS UNITAIRES (à exécuter manuellement dans la console)
// ============================================================================

/**
 * Fonction pour tester la pratique de test
 *
 * À exécuter dans la console navigateur :
 * testerPratiqueTest()
 */
function testerPratiqueTest() {

    const pratique = new PratiqueTest();
    const daTest = '1234567';
    const daInvalide = '123'; // Trop court

    // Test 1: Méthodes d'identité

    // Test 2: Calculs avec DA valide
    const p = pratique.calculerPerformance(daTest);
    const c = pratique.calculerCompletion(daTest);

    // Test 3: Calculs avec DA invalide
    const pInvalide = pratique.calculerPerformance(daInvalide);
    const cInvalide = pratique.calculerCompletion(daInvalide);

    // Test 4: Détection défis
    const defis = pratique.detecterDefis(daTest);

    // Test 5: Identification pattern
    const pattern = pratique.identifierPattern(daTest);

    // Test 6: Génération cible RàI
    const cible = pratique.genererCibleIntervention(daTest);

}

// Exporter pour utilisation dans la console
window.testerPratiqueTest = testerPratiqueTest;
window.PratiqueTest = PratiqueTest;



})();
