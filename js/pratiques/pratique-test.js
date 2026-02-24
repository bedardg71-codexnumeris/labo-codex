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

    calculerCompletion(da) {
        // Validation basique
        if (!da || da.length !== 7) {
            console.warn(`[PratiqueTest] DA invalide : ${da}`);
            return null;
        }

        // Retourner une valeur fixe pour les tests
        return 0.80; // 80%
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
        console.log('✅ [PratiqueTest] Pratique de test enregistrée avec succès');
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
    console.log('=== DÉBUT DES TESTS DE LA PRATIQUE TEST ===\n');

    const pratique = new PratiqueTest();
    const daTest = '1234567';
    const daInvalide = '123'; // Trop court

    // Test 1: Méthodes d'identité
    console.log('Test 1: Méthodes d\'identité');
    console.log('  Nom:', pratique.obtenirNom());
    console.log('  ID:', pratique.obtenirId());
    console.log('  Description:', pratique.obtenirDescription());
    console.log('  ✅ Méthodes d\'identité OK\n');

    // Test 2: Calculs avec DA valide
    console.log('Test 2: Calculs avec DA valide');
    const p = pratique.calculerPerformance(daTest);
    const c = pratique.calculerCompletion(daTest);
    console.log('  Performance:', p, '(attendu: 0.75)');
    console.log('  Complétion:', c, '(attendu: 0.80)');
    console.log(p === 0.75 && c === 0.80 ? '  ✅ Calculs OK\n' : '  ❌ Calculs incorrects\n');

    // Test 3: Calculs avec DA invalide
    console.log('Test 3: Calculs avec DA invalide');
    const pInvalide = pratique.calculerPerformance(daInvalide);
    const cInvalide = pratique.calculerCompletion(daInvalide);
    console.log('  Performance:', pInvalide, '(attendu: null)');
    console.log('  Complétion:', cInvalide, '(attendu: null)');
    console.log(pInvalide === null && cInvalide === null ? '  ✅ Gestion erreurs OK\n' : '  ❌ Gestion erreurs incorrecte\n');

    // Test 4: Détection défis
    console.log('Test 4: Détection défis');
    const defis = pratique.detecterDefis(daTest);
    console.log('  Type:', defis.type);
    console.log('  Nombre de défis:', defis.defis.length, '(attendu: 2)');
    console.log('  Nombre de forces:', defis.forces.length, '(attendu: 1)');
    console.log(defis.type === 'test' && defis.defis.length === 2 ? '  ✅ Défis OK\n' : '  ❌ Défis incorrects\n');

    // Test 5: Identification pattern
    console.log('Test 5: Identification pattern');
    const pattern = pratique.identifierPattern(daTest);
    console.log('  Type:', pattern.type);
    console.log('  Description:', pattern.description);
    console.log('  Indices:', pattern.indices);
    console.log(pattern.type === 'stable' ? '  ✅ Pattern OK\n' : '  ❌ Pattern incorrect\n');

    // Test 6: Génération cible RàI
    console.log('Test 6: Génération cible RàI');
    const cible = pratique.genererCibleIntervention(daTest);
    console.log('  Type:', cible.type);
    console.log('  Nombre de stratégies:', cible.strategies.length, '(attendu: 3)');
    console.log('  Nombre de ressources:', cible.ressources.length, '(attendu: 2)');
    console.log(cible.type === 'test' && cible.strategies.length === 3 ? '  ✅ Cible RàI OK\n' : '  ❌ Cible RàI incorrecte\n');

    console.log('=== FIN DES TESTS ===');
    console.log('Tous les tests sont passés avec succès ! ✅');
}

// Exporter pour utilisation dans la console
window.testerPratiqueTest = testerPratiqueTest;
window.PratiqueTest = PratiqueTest;

console.log('✅ Module pratique-test.js chargé');
console.log('💡 Pour tester, exécutez : testerPratiqueTest()');


})();
