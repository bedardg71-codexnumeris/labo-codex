// Script de diagnostic pour comprendre pourquoi C, P, E ne s'affichent pas
// Copiez-collez ce code dans la console JavaScript

console.log('=== DIAGNOSTIC INDICES SNAPSHOTS ===');

// 1. Charger les snapshots depuis IndexedDB (async)
db.get('snapshots').then(data => {
    if (!data || !data.hebdomadaires) {
        console.error('❌ Aucun snapshot trouvé!');
        return;
    }

    const snapshots = data.hebdomadaires;
    console.log('\n1. Nombre total de snapshots:', snapshots.length);

    // 2. Vérifier la structure d'un snapshot
    if (snapshots.length > 0) {
        const premier = snapshots[0];
        console.log('\n2. Structure du premier snapshot:');
        console.log('   - id:', premier.id);
        console.log('   - numSemaine:', premier.numSemaine, '(devrait exister maintenant)');
        console.log('   - numeroSemaine:', premier.numeroSemaine);
        console.log('   - dateSeance:', premier.dateSeance);
        console.log('   - dateDebut:', premier.dateDebut, '(devrait exister maintenant)');
        console.log('   - Nombre d\'étudiants:', premier.etudiants?.length);
    }

    // 3. Vérifier les indices d'un étudiant dans chaque snapshot
    console.log('\n3. Vérification indices premier étudiant:');
    const premierEtudiantDA = snapshots[0]?.etudiants?.[0]?.da;

    if (premierEtudiantDA) {
        console.log(`   DA: ${premierEtudiantDA}`);
        console.log('   Snapshot | A   | C    | P    | E');
        console.log('   ---------|-----|------|------|------');

        snapshots.slice(0, 10).forEach((snap, idx) => {
            const etud = snap.etudiants.find(e => e.da === premierEtudiantDA);
            if (etud) {
                const A = etud.A !== undefined ? etud.A : 'undef';
                const C = etud.C !== null ? etud.C : 'null';
                const P = etud.P !== null ? etud.P : 'null';
                const E = etud.E !== null ? etud.E?.toFixed(2) : 'null';
                console.log(`   Snap ${idx + 1}  | ${A} | ${C} | ${P} | ${E}`);
            }
        });
    }

    // 4. Compter combien de snapshots ont C/P/E null
    let nbAvecC = 0, nbAvecP = 0, nbAvecE = 0;
    let nbSansC = 0, nbSansP = 0, nbSansE = 0;

    snapshots.forEach(snap => {
        snap.etudiants.forEach(etud => {
            if (etud.C !== null && etud.C !== undefined) nbAvecC++;
            else nbSansC++;

            if (etud.P !== null && etud.P !== undefined) nbAvecP++;
            else nbSansP++;

            if (etud.E !== null && etud.E !== undefined) nbAvecE++;
            else nbSansE++;
        });
    });

    const total = snapshots.length * (snapshots[0]?.etudiants?.length || 0);

    console.log('\n4. Répartition des indices (sur tous les étudiants × snapshots):');
    console.log(`   - C: ${nbAvecC} avec valeur, ${nbSansC} null (${((nbSansC/total)*100).toFixed(0)}% null)`);
    console.log(`   - P: ${nbAvecP} avec valeur, ${nbSansP} null (${((nbSansP/total)*100).toFixed(0)}% null)`);
    console.log(`   - E: ${nbAvecE} avec valeur, ${nbSansE} null (${((nbSansE/total)*100).toFixed(0)}% null)`);

    // 5. Vérifier les moyennes du groupe
    console.log('\n5. Moyennes groupe (10 premiers snapshots):');
    console.log('   Snap | A_moy | C_moy | P_moy | E_moy');
    console.log('   -----|-------|-------|-------|-------');

    snapshots.slice(0, 10).forEach((snap, idx) => {
        const A = snap.groupe?.moyenneA || 'undef';
        const C = snap.groupe?.moyenneC !== null ? snap.groupe?.moyenneC : 'null';
        const P = snap.groupe?.moyenneP !== null ? snap.groupe?.moyenneP : 'null';
        const E = snap.groupe?.moyenneE !== null ? snap.groupe?.moyenneE?.toFixed(2) : 'null';
        console.log(`   ${idx + 1}    | ${A}   | ${C}  | ${P}  | ${E}`);
    });

    // 6. Vérifier s'il y a des évaluations
    // ✅ CORRECTION (7 déc 2025): Utiliser 'evaluationsSauvegardees' (clé correcte)
    const evaluations = db.getSync('evaluationsSauvegardees', []);
    console.log('\n6. Évaluations dans la base:');
    console.log(`   - Nombre total: ${evaluations.length}`);

    if (evaluations.length > 0) {
        const datesEval = evaluations
            .filter(e => e.dateEvaluation)
            .map(e => e.dateEvaluation)
            .sort();
        console.log(`   - Première évaluation: ${datesEval[0]}`);
        console.log(`   - Dernière évaluation: ${datesEval[datesEval.length - 1]}`);

        const types = {};
        evaluations.forEach(e => {
            types[e.type] = (types[e.type] || 0) + 1;
        });
        console.log('   - Par type:', types);
    } else {
        console.warn('   ⚠️ AUCUNE évaluation trouvée!');
        console.warn('   → C\'est normal que C, P, E soient null si aucune évaluation');
    }

    // 7. Résumé
    console.log('\n=== RÉSUMÉ ===');
    if (nbSansC === total && nbSansP === total && nbSansE === total) {
        console.error('❌ TOUS les indices C, P, E sont null!');
        if (evaluations.length === 0) {
            console.log('   CAUSE: Aucune évaluation dans la base de données');
            console.log('   SOLUTION: Ajouter des évaluations ou importer donnees-demo.json');
        } else {
            console.log('   CAUSE: Problème dans le calcul des indices historiques');
            console.log('   SOLUTION: Vérifier la fonction calculerIndicesHistoriques()');
        }
    } else if (nbSansC > total * 0.5) {
        console.warn('⚠️ Plus de 50% des indices sont null');
        console.log('   Cela peut être normal si les évaluations sont récentes (semaines 7+)');
    } else {
        console.log('✅ Les indices C, P, E sont calculés correctement');
        console.log('   Si le graphique ne les affiche pas, recharger la page et relancer reconstruction');
    }

    console.log('\n=== FIN DIAGNOSTIC ===');
});

console.log('⏳ Chargement des snapshots depuis IndexedDB...');
