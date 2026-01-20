// TEST FINAL PRE-PAUSE - Version réexécutable
// Collez ce code dans la console du navigateur

console.log('=== TEST FINAL PRE-PAUSE ===');
console.log('');

var tests = {
    ok: 0,
    total: 0,
    erreurs: []
};

// Test modules critiques
console.log('📦 MODULES CRITIQUES:');
['obtenirDonneesSelonMode', 'db', 'calculerEtStockerIndicesCP', 'calculerEtSauvegarderIndicesAssiduite', 'basculerDonneesDemo', 'genererCalendrierComplet', 'capturerSnapshotHebdomadaire'].forEach(nom => {
    tests.total++;
    if (typeof window[nom] !== 'undefined') {
        tests.ok++;
        console.log(`   ✅ ${nom}`);
    } else {
        tests.erreurs.push(nom);
        console.log(`   ❌ ${nom}`);
    }
});

console.log('');
console.log('=== RÉSULTAT ===');
console.log(`Score: ${tests.ok}/${tests.total}`);

if (tests.ok === tests.total) {
    console.log('🎉 PARFAIT ! Tous les modules sont exportés.');
    console.log('✅ Application prête pour la pause !');
} else {
    console.log('🔴 ERREURS restantes:');
    tests.erreurs.forEach(e => console.log(`   - ${e}`));
    console.log('');
    console.log('⚠️ Rechargez la page (F5) et réessayez.');
}
