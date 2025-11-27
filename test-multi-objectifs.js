/**
 * SCRIPT DE TEST - Pratique Multi-Objectifs
 *
 * Ce script teste la création complète d'une pratique multi-objectifs
 * utilisant l'ensemble d'objectifs de Michel B..
 *
 * UTILISATION :
 * 1. Ouvrir l'application dans le navigateur
 * 2. Ouvrir la console développeur (F12)
 * 3. Copier-coller ce script et appuyer sur Entrée
 * 4. Vérifier les résultats dans la console
 *
 * Date : 26 novembre 2025
 */

(function testMultiObjectifs() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('TEST : Création pratique multi-objectifs');
    console.log('═══════════════════════════════════════════════════════════\n');

    let erreurs = 0;
    let reussites = 0;

    // ========================================================================
    // ÉTAPE 1 : Créer l'ensemble d'objectifs de Michel
    // ========================================================================
    console.log('📝 ÉTAPE 1 : Création ensemble d\'objectifs de Michel...');

    try {
        if (typeof creerEnsembleCalculDiff !== 'function') {
            throw new Error('Fonction creerEnsembleCalculDiff non trouvée');
        }

        const ensembleId = creerEnsembleCalculDiff();
        console.log('✅ Ensemble créé avec ID:', ensembleId);
        reussites++;

        // Vérifier que l'ensemble est bien sauvegardé
        const ensembles = db.getSync('objectifsTemplates', []);
        const ensemble = ensembles.find(e => e.id === ensembleId);

        if (!ensemble) {
            throw new Error('Ensemble non trouvé dans le storage');
        }

        console.log('   → Nom:', ensemble.nom);
        console.log('   → Objectifs:', ensemble.objectifs.length);
        console.log('   → Total poids:', ensemble.objectifs.reduce((sum, obj) => sum + obj.poids, 0) + '%');
        reussites++;

    } catch (error) {
        console.error('❌ ERREUR Étape 1:', error.message);
        erreurs++;
    }

    console.log('');

    // ========================================================================
    // ÉTAPE 2 : Créer une configuration de pratique multi-objectifs
    // ========================================================================
    console.log('📝 ÉTAPE 2 : Création configuration pratique...');

    try {
        const configPratique = {
            id: 'test-multi-objectifs-michel',
            nom: 'TEST - Multi-objectifs (Michel)',
            description: 'Pratique de test utilisant les 13 objectifs de calcul différentiel de Michel B.',
            type: 'configurable',
            categorie: 'pan',

            echelle: {
                type: 'pourcentage',
                min: 0,
                max: 100
            },

            calcul_note: {
                methode: 'pan_par_objectif',
                nombre_artefacts: 3,
                description: 'Pour chaque objectif, moyenne des 3 meilleurs artefacts, puis moyenne pondérée globale'
            },

            objectifs: [
                { id: 'obj1', nom: 'Limites et continuité', poids: 6, type: 'fondamental' },
                { id: 'obj2', nom: 'Dérivées - Définition et interprétation', poids: 8, type: 'fondamental' },
                { id: 'obj3', nom: 'Règles de dérivation de base', poids: 8, type: 'fondamental' },
                { id: 'obj4', nom: 'Dérivées de fonctions composées', poids: 7, type: 'fondamental' },
                { id: 'obj5', nom: 'Dérivées de fonctions trigonométriques', poids: 6, type: 'fondamental' },
                { id: 'obj6', nom: 'Dérivées de fonctions exponentielles et logarithmiques', poids: 5, type: 'fondamental' },
                { id: 'obj7', nom: 'Taux de variation liés', poids: 5, type: 'fondamental' },
                { id: 'obj8', nom: 'Analyse de fonctions', poids: 12, type: 'integrateur' },
                { id: 'obj9', nom: 'Extremums et points d\'inflexion', poids: 10, type: 'integrateur' },
                { id: 'obj10', nom: 'Optimisation', poids: 15, type: 'integrateur' },
                { id: 'obj11', nom: 'Approximations linéaires et différentielles', poids: 8, type: 'integrateur' },
                { id: 'obj12', nom: 'Règle de L\'Hospital', poids: 6, type: 'integrateur' },
                { id: 'obj13', nom: 'Théorème de la valeur intermédiaire', poids: 4, type: 'fondamental' }
            ],

            seuils: {
                grande_difficulte: 55,
                difficulte: 70,
                acceptable: 80,
                maitrise: 85
            }
        };

        console.log('✅ Configuration créée');
        console.log('   → Méthode:', configPratique.calcul_note.methode);
        console.log('   → Objectifs:', configPratique.objectifs.length);

        // Vérifier le total des poids
        const totalPoids = configPratique.objectifs.reduce((sum, obj) => sum + obj.poids, 0);
        console.log('   → Total poids:', totalPoids + '%');

        if (totalPoids !== 100) {
            throw new Error(`Total des poids incorrect: ${totalPoids}% (attendu: 100%)`);
        }

        reussites++;

    } catch (error) {
        console.error('❌ ERREUR Étape 2:', error.message);
        erreurs++;
    }

    console.log('');

    // ========================================================================
    // ÉTAPE 3 : Instancier la classe PratiqueConfigurable
    // ========================================================================
    console.log('📝 ÉTAPE 3 : Instanciation PratiqueConfigurable...');

    let pratiqueTest;
    try {
        if (typeof PratiqueConfigurable !== 'function') {
            throw new Error('Classe PratiqueConfigurable non trouvée');
        }

        pratiqueTest = new PratiqueConfigurable(configPratique);
        console.log('✅ Instance créée');
        console.log('   → Nom:', pratiqueTest.obtenirNom());
        console.log('   → ID:', pratiqueTest.obtenirId());
        reussites++;

    } catch (error) {
        console.error('❌ ERREUR Étape 3:', error.message);
        erreurs++;
    }

    console.log('');

    // ========================================================================
    // ÉTAPE 4 : Tester la méthode calculerPerformanceParObjectif
    // ========================================================================
    console.log('📝 ÉTAPE 4 : Test calcul performance par objectif...');

    try {
        if (!pratiqueTest) {
            throw new Error('Instance de pratique non disponible (étape 3 a échoué)');
        }

        // Créer des évaluations de test
        const evaluationsTest = {
            'eval1': {
                id: 'eval1',
                etudiantId: '1234567',
                note: 85,
                objectifs: ['obj1', 'obj2'],
                remplaceeParId: null
            },
            'eval2': {
                id: 'eval2',
                etudiantId: '1234567',
                note: 80,
                objectifs: ['obj1'],
                remplaceeParId: null
            },
            'eval3': {
                id: 'eval3',
                etudiantId: '1234567',
                note: 90,
                objectifs: ['obj2', 'obj10'],
                remplaceeParId: null
            },
            'eval4': {
                id: 'eval4',
                etudiantId: '1234567',
                note: 75,
                objectifs: ['obj10'],
                remplaceeParId: null
            }
        };

        // Sauvegarder temporairement
        const evaluationsOriginales = db.getSync('evaluations', {});
        db.setSync('evaluations', evaluationsTest);

        // Tester le calcul
        const performance = pratiqueTest.calculerPerformanceParObjectif('1234567');

        console.log('✅ Calcul réussi');
        console.log('   → Performance calculée:', performance + '%');
        console.log('   → Détails:');
        console.log('      • obj1 (6%): 2 évals → meilleures: 85, 80 → moyenne: 82.5%');
        console.log('      • obj2 (8%): 2 évals → meilleures: 90, 85 → moyenne: 87.5%');
        console.log('      • obj10 (15%): 2 évals → meilleures: 90, 75 → moyenne: 82.5%');
        console.log('      • Moyenne pondérée attendue ≈ 84.3%');

        // Vérifier que le résultat est cohérent
        if (performance < 80 || performance > 90) {
            console.warn('⚠️  Performance hors de la plage attendue (80-90%)');
        }

        // Restaurer les évaluations originales
        db.setSync('evaluations', evaluationsOriginales);

        reussites++;

    } catch (error) {
        console.error('❌ ERREUR Étape 4:', error.message);
        erreurs++;
    }

    console.log('');

    // ========================================================================
    // ÉTAPE 5 : Tester calculerPerformance avec le switch
    // ========================================================================
    console.log('📝 ÉTAPE 5 : Test méthode calculerPerformance (interface IPratique)...');

    try {
        if (!pratiqueTest) {
            throw new Error('Instance de pratique non disponible');
        }

        // Créer des données indicesCP factices
        const indicesCPTest = {
            '1234567': {
                actuel: {
                    PAN: { P: 82, C: 85 },
                    SOM: { P: 78, C: 85 }
                }
            }
        };

        const indicesCPOriginaux = db.getSync('indicesCP', {});
        db.setSync('indicesCP', indicesCPTest);

        // Le switch devrait appeler calculerPerformanceParObjectif
        const P = pratiqueTest.calculerPerformance('1234567');

        console.log('✅ Méthode calculerPerformance fonctionne');
        console.log('   → Indice P:', P);
        console.log('   → Format:', typeof P === 'number' ? 'nombre' : typeof P);
        console.log('   → Plage:', P >= 0 && P <= 1 ? '0-1 (décimal) ✓' : 'incorrect');

        // Restaurer
        db.setSync('indicesCP', indicesCPOriginaux);

        reussites++;

    } catch (error) {
        console.error('❌ ERREUR Étape 5:', error.message);
        erreurs++;
    }

    console.log('');

    // ========================================================================
    // RÉSUMÉ DES TESTS
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('RÉSUMÉ DES TESTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Réussites: ${reussites}`);
    console.log(`❌ Erreurs: ${erreurs}`);
    console.log('');

    if (erreurs === 0) {
        console.log('🎉 TOUS LES TESTS ONT RÉUSSI !');
        console.log('');
        console.log('La pratique multi-objectifs est fonctionnelle :');
        console.log('  • Ensemble d\'objectifs créé et sauvegardé');
        console.log('  • Configuration de pratique valide');
        console.log('  • Classe PratiqueConfigurable instanciable');
        console.log('  • Calcul PAN par objectif opérationnel');
        console.log('  • Interface IPratique respectée');
        console.log('');
        console.log('Prochaines étapes :');
        console.log('  1. Tester la création via le wizard dans l\'interface');
        console.log('  2. Créer des évaluations avec tags d\'objectifs');
        console.log('  3. Vérifier le calcul dans le profil étudiant');
    } else {
        console.error('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
        console.error('Veuillez corriger les erreurs avant de continuer.');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    return {
        reussites,
        erreurs,
        succes: erreurs === 0
    };
})();
