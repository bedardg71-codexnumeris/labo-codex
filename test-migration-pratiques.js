/**
 * SCRIPT DE TEST - Migration Phase 2
 *
 * Compare les résultats de calcul avant/après la délégation aux pratiques
 *
 * UTILISATION :
 * 1. Ouvrir index 90 (architecture).html dans le navigateur
 * 2. Copier-coller ce script dans la console
 * 3. Exécuter : testerMigrationPratiques()
 *
 * Le script va :
 * - Sauvegarder les valeurs actuelles
 * - Recalculer via le nouveau système
 * - Comparer et afficher un rapport
 */

function testerMigrationPratiques() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TEST DE MIGRATION - Phase 2 : Délégation aux pratiques');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // ========================================================================
    // ÉTAPE 1 : Vérifier que le registre est chargé
    // ========================================================================

    console.log('📋 ÉTAPE 1 : Vérification du registre de pratiques');
    console.log('-----------------------------------------------------------');

    if (typeof obtenirPratiqueParId !== 'function') {
        console.error('❌ ERREUR : Le registre de pratiques n\'est pas chargé !');
        console.error('   Assurez-vous que pratique-registre.js est chargé.');
        return;
    }

    const pratiqueSommative = obtenirPratiqueParId('sommative');
    const pratiquePAN = obtenirPratiqueParId('pan-maitrise');

    if (!pratiqueSommative) {
        console.error('❌ ERREUR : Pratique "sommative" non trouvée dans le registre');
        return;
    }

    if (!pratiquePAN) {
        console.error('❌ ERREUR : Pratique "pan-maitrise" non trouvée dans le registre');
        return;
    }

    console.log('✅ Registre disponible');
    console.log('✅ Pratique Sommative :', pratiqueSommative.obtenirNom());
    console.log('✅ Pratique PAN-Maîtrise :', pratiquePAN.obtenirNom());
    console.log('');

    // ========================================================================
    // ÉTAPE 2 : Sauvegarder les valeurs actuelles
    // ========================================================================

    console.log('💾 ÉTAPE 2 : Sauvegarde des valeurs actuelles');
    console.log('-----------------------------------------------------------');

    const indicesCPAvant = JSON.parse(localStorage.getItem('indicesCP') || '{}');

    if (Object.keys(indicesCPAvant).length === 0 || !indicesCPAvant.dateCalcul) {
        console.warn('⚠️ Aucune donnée indicesCP trouvée dans localStorage');
        console.warn('   Le test va calculer les valeurs initiales...');
    } else {
        console.log('✅ Données indicesCP sauvegardées');

        // Compter le nombre d'étudiants
        const nbEtudiants = Object.keys(indicesCPAvant).filter(k => k !== 'dateCalcul').length;
        console.log(`   ${nbEtudiants} étudiant(s) dans l'historique`);
        console.log(`   Date dernière sauvegarde : ${new Date(indicesCPAvant.dateCalcul).toLocaleString('fr-CA')}`);
    }
    console.log('');

    // ========================================================================
    // ÉTAPE 3 : Recalculer via le nouveau système
    // ========================================================================

    console.log('🔄 ÉTAPE 3 : Recalcul via le registre de pratiques');
    console.log('-----------------------------------------------------------');

    if (typeof calculerEtStockerIndicesCP !== 'function') {
        console.error('❌ ERREUR : Fonction calculerEtStockerIndicesCP() non disponible');
        return;
    }

    // Déclencher le recalcul
    const startTime = performance.now();
    const indicesCPApres = calculerEtStockerIndicesCP();
    const endTime = performance.now();
    const duree = (endTime - startTime).toFixed(2);

    console.log(`✅ Recalcul terminé en ${duree}ms`);
    console.log('');

    // ========================================================================
    // ÉTAPE 4 : Comparer les résultats
    // ========================================================================

    console.log('🔍 ÉTAPE 4 : Comparaison des résultats');
    console.log('-----------------------------------------------------------');

    // Obtenir la liste des étudiants
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );

    if (etudiantsActifs.length === 0) {
        console.warn('⚠️ Aucun étudiant actif trouvé');
        return;
    }

    console.log(`Analyse de ${etudiantsActifs.length} étudiant(s) actif(s)...\n`);

    // Tableaux pour les statistiques
    const differences = [];
    let nbIdentiques = 0;
    let nbDifferents = 0;
    let maxDifference = 0;

    // Comparer chaque étudiant
    etudiantsActifs.forEach((etudiant, index) => {
        const da = etudiant.da;
        const nom = `${etudiant.prenom} ${etudiant.nom}`;

        // Valeurs avant
        const avant = indicesCPAvant[da]?.actuel;

        // Valeurs après
        const apres = indicesCPApres[da]?.actuel;

        if (!avant || !apres) {
            console.warn(`⚠️ [${da}] ${nom} : Données manquantes`);
            return;
        }

        // Comparer SOM
        const diffSOM_C = Math.abs(avant.SOM.C - apres.SOM.C);
        const diffSOM_P = Math.abs(avant.SOM.P - apres.SOM.P);

        // Comparer PAN
        const diffPAN_C = Math.abs(avant.PAN.C - apres.PAN.C);
        const diffPAN_P = Math.abs(avant.PAN.P - apres.PAN.P);

        // Différence maximale
        const maxDiff = Math.max(diffSOM_C, diffSOM_P, diffPAN_C, diffPAN_P);
        maxDifference = Math.max(maxDifference, maxDiff);

        // Tolérance : ±1% acceptable (arrondi)
        const tolerance = 1;
        const estIdentique = maxDiff <= tolerance;

        if (estIdentique) {
            nbIdentiques++;
        } else {
            nbDifferents++;
        }

        differences.push({
            da,
            nom,
            avant,
            apres,
            diffSOM_C,
            diffSOM_P,
            diffPAN_C,
            diffPAN_P,
            maxDiff,
            estIdentique
        });

        // Afficher seulement les 3 premiers pour ne pas surcharger
        if (index < 3) {
            const icon = estIdentique ? '✅' : '⚠️';
            console.log(`${icon} [${da}] ${nom}`);
            console.log(`   SOM: C=${avant.SOM.C}% → ${apres.SOM.C}% (Δ${diffSOM_C}), P=${avant.SOM.P}% → ${apres.SOM.P}% (Δ${diffSOM_P})`);
            console.log(`   PAN: C=${avant.PAN.C}% → ${apres.PAN.C}% (Δ${diffPAN_C}), P=${avant.PAN.P}% → ${apres.PAN.P}% (Δ${diffPAN_P})`);
        }
    });

    console.log('');

    // ========================================================================
    // ÉTAPE 5 : Rapport final
    // ========================================================================

    console.log('📊 ÉTAPE 5 : Rapport final');
    console.log('═══════════════════════════════════════════════════════');

    const pourcentageIdentiques = ((nbIdentiques / etudiantsActifs.length) * 100).toFixed(1);
    const succes = nbDifferents === 0;

    console.log('');
    console.log('RÉSULTATS GLOBAUX :');
    console.log('-----------------------------------------------------------');
    console.log(`Total étudiants testés     : ${etudiantsActifs.length}`);
    console.log(`Résultats identiques       : ${nbIdentiques} (${pourcentageIdentiques}%)`);
    console.log(`Résultats différents       : ${nbDifferents}`);
    console.log(`Différence maximale        : ${maxDifference}%`);
    console.log(`Tolérance acceptée         : ±1%`);
    console.log('');

    if (succes) {
        console.log('✅✅✅ TEST RÉUSSI ! ✅✅✅');
        console.log('');
        console.log('Tous les calculs sont identiques (±1% tolérance).');
        console.log('La migration vers le registre de pratiques est validée.');
        console.log('');
    } else {
        console.warn('⚠️⚠️⚠️ TEST PARTIEL ⚠️⚠️⚠️');
        console.warn('');
        console.warn(`${nbDifferents} étudiant(s) ont des différences > 1%`);
        console.warn('');
        console.warn('ÉTUDIANTS AVEC DIFFÉRENCES :');
        console.warn('-----------------------------------------------------------');

        differences
            .filter(d => !d.estIdentique)
            .forEach(d => {
                console.warn(`[${d.da}] ${d.nom}`);
                console.warn(`   SOM: C=${d.avant.SOM.C}→${d.apres.SOM.C} (Δ${d.diffSOM_C}), P=${d.avant.SOM.P}→${d.apres.SOM.P} (Δ${d.diffSOM_P})`);
                console.warn(`   PAN: C=${d.avant.PAN.C}→${d.apres.PAN.C} (Δ${d.diffPAN_C}), P=${d.avant.PAN.P}→${d.apres.PAN.P} (Δ${d.diffPAN_P})`);
            });
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // ========================================================================
    // ÉTAPE 6 : Détails techniques (optionnel)
    // ========================================================================

    console.log('🔧 DÉTAILS TECHNIQUES');
    console.log('-----------------------------------------------------------');
    console.log('Structure details dans indicesCP :');

    const premierDA = etudiantsActifs[0]?.da;
    if (premierDA && indicesCPApres[premierDA]) {
        console.log('');
        console.log('Exemple étudiant [' + premierDA + '] :');
        console.log(JSON.stringify(indicesCPApres[premierDA].actuel, null, 2));
    }

    console.log('');
    console.log('✅ Test terminé');
    console.log('');

    // Retourner les résultats pour inspection
    return {
        succes: succes,
        nbIdentiques: nbIdentiques,
        nbDifferents: nbDifferents,
        maxDifference: maxDifference,
        differences: differences
    };
}

// ============================================================================
// FONCTION HELPER : Test individuel d'un étudiant
// ============================================================================

function testerEtudiant(da) {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🧪 TEST INDIVIDUEL - Étudiant DA: ${da}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Vérifier que les pratiques sont disponibles
    const pratiqueSommative = obtenirPratiqueParId('sommative');
    const pratiquePAN = obtenirPratiqueParId('pan-maitrise');

    if (!pratiqueSommative || !pratiquePAN) {
        console.error('❌ Pratiques non disponibles dans le registre');
        return;
    }

    // Calculer via les pratiques
    console.log('📊 Calculs via pratiques :');
    console.log('-----------------------------------------------------------');

    // Sommative
    const C_som = pratiqueSommative.calculerCompletion(da);
    const P_som = pratiqueSommative.calculerPerformance(da);

    console.log('Sommative :');
    console.log(`  C (Complétion)  : ${C_som !== null ? (C_som * 100).toFixed(1) : 'N/A'}%`);
    console.log(`  P (Performance) : ${P_som !== null ? (P_som * 100).toFixed(1) : 'N/A'}%`);
    console.log('');

    // PAN-Maîtrise
    const C_pan = pratiquePAN.calculerCompletion(da);
    const P_pan = pratiquePAN.calculerPerformance(da);

    console.log('PAN-Maîtrise :');
    console.log(`  C (Complétion)  : ${C_pan !== null ? (C_pan * 100).toFixed(1) : 'N/A'}%`);
    console.log(`  P (Performance) : ${P_pan !== null ? (P_pan * 100).toFixed(1) : 'N/A'}%`);
    console.log('');

    // Comparer avec indicesCP
    const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
    const indices = indicesCP[da]?.actuel;

    if (indices) {
        console.log('📋 Valeurs dans indicesCP :');
        console.log('-----------------------------------------------------------');
        console.log('Sommative :');
        console.log(`  C : ${indices.SOM.C}%`);
        console.log(`  P : ${indices.SOM.P}%`);
        console.log('');
        console.log('PAN-Maîtrise :');
        console.log(`  C : ${indices.PAN.C}%`);
        console.log(`  P : ${indices.PAN.P}%`);
        console.log('');

        // Différences
        const diffSOM_C = Math.abs(indices.SOM.C - (C_som * 100));
        const diffSOM_P = Math.abs(indices.SOM.P - (P_som * 100));
        const diffPAN_C = Math.abs(indices.PAN.C - (C_pan * 100));
        const diffPAN_P = Math.abs(indices.PAN.P - (P_pan * 100));

        console.log('🔍 Différences :');
        console.log('-----------------------------------------------------------');
        console.log(`SOM C : Δ${diffSOM_C.toFixed(1)}%`);
        console.log(`SOM P : Δ${diffSOM_P.toFixed(1)}%`);
        console.log(`PAN C : Δ${diffPAN_C.toFixed(1)}%`);
        console.log(`PAN P : Δ${diffPAN_P.toFixed(1)}%`);
        console.log('');

        const maxDiff = Math.max(diffSOM_C, diffSOM_P, diffPAN_C, diffPAN_P);
        if (maxDiff <= 1) {
            console.log('✅ Résultats identiques (tolérance ±1%)');
        } else {
            console.warn(`⚠️ Différence maximale : ${maxDiff.toFixed(1)}%`);
        }
    } else {
        console.warn('⚠️ Aucune donnée dans indicesCP pour cet étudiant');
    }

    console.log('');
}

// ============================================================================
// INSTRUCTIONS D'UTILISATION
// ============================================================================

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('📋 SCRIPT DE TEST - Migration Phase 2');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('FONCTIONS DISPONIBLES :');
console.log('');
console.log('1. testerMigrationPratiques()');
console.log('   → Teste tous les étudiants et génère un rapport complet');
console.log('');
console.log('2. testerEtudiant("1234567")');
console.log('   → Teste un étudiant spécifique avec détails');
console.log('');
console.log('EXEMPLE D\'UTILISATION :');
console.log('  const resultats = testerMigrationPratiques();');
console.log('  console.log(resultats);');
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('');
