// ============================================
// DIAGNOSTIC PRE-PAUSE - Beta 94
// À exécuter dans la console navigateur
// ============================================

console.log('=== DIAGNOSTIC PRE-PAUSE BETA 94 ===');
console.log('Date:', new Date().toLocaleString('fr-CA'));
console.log('');

const resultats = {
    ok: [],
    warnings: [],
    erreurs: []
};

// ============================================
// 1. MODULES CRITIQUES CHARGÉS
// ============================================
console.log('1. MODULES CRITIQUES');
const modulesCritiques = [
    'obtenirDonneesSelonMode',
    'db',
    'calculerEtStockerIndicesCP',
    'calculerEtSauvegarderIndicesAssiduite',
    'basculerDonneesDemo',
    'genererCalendrierComplet',
    'capturerSnapshotHebdomadaire'
];

modulesCritiques.forEach(nom => {
    const existe = typeof window[nom] !== 'undefined';
    if (existe) {
        resultats.ok.push(`Module ${nom}`);
        console.log(`   ✅ ${nom}`);
    } else {
        resultats.erreurs.push(`Module ${nom} manquant`);
        console.log(`   ❌ ${nom} - MANQUANT`);
    }
});
console.log('');

// ============================================
// 2. SYSTÈME DE MODES
// ============================================
console.log('2. SYSTÈME DE MODES');
const modeActuel = localStorage.getItem('modeApplication');
if (modeActuel) {
    resultats.ok.push(`Mode application: ${modeActuel}`);
    console.log(`   ✅ Mode actuel: ${modeActuel}`);
} else {
    resultats.warnings.push('Mode application non défini');
    console.log('   ⚠️ Mode application non défini (défaut: simulation)');
}
console.log('');

// ============================================
// 3. DONNÉES ESSENTIELLES
// ============================================
console.log('3. DONNÉES ESSENTIELLES');
const donneesEssentielles = [
    'listeCours',
    'groupeEtudiants',
    'modalitesEvaluation',
    'grillesTemplates',
    'echellesTemplates'
];

donneesEssentielles.forEach(cle => {
    try {
        const data = obtenirDonneesSelonMode(cle);
        const count = Array.isArray(data) ? data.length : (data ? 'présent' : 'absent');
        if (data) {
            resultats.ok.push(`${cle}: ${count}`);
            console.log(`   ✅ ${cle}: ${count}`);
        } else {
            resultats.warnings.push(`${cle} vide`);
            console.log(`   ⚠️ ${cle}: vide`);
        }
    } catch (error) {
        resultats.erreurs.push(`${cle} erreur: ${error.message}`);
        console.log(`   ❌ ${cle}: ERREUR - ${error.message}`);
    }
});
console.log('');

// ============================================
// 4. SNAPSHOTS HEBDOMADAIRES
// ============================================
console.log('4. SNAPSHOTS HEBDOMADAIRES');
try {
    const snapshots = obtenirDonneesSelonMode('snapshotsHebdo') || [];
    if (snapshots.length > 0) {
        resultats.ok.push(`Snapshots: ${snapshots.length} semaines`);
        console.log(`   ✅ ${snapshots.length} snapshots trouvés`);
        console.log(`   📅 Première semaine: ${snapshots[0]?.dateSeance || 'N/A'}`);
        console.log(`   📅 Dernière semaine: ${snapshots[snapshots.length-1]?.dateSeance || 'N/A'}`);
    } else {
        resultats.warnings.push('Aucun snapshot (normal si pas de présences)');
        console.log('   ⚠️ Aucun snapshot (normal si pas de présences saisies)');
    }
} catch (error) {
    resultats.erreurs.push(`Snapshots erreur: ${error.message}`);
    console.log(`   ❌ ERREUR: ${error.message}`);
}
console.log('');

// ============================================
// 5. DONNÉES DEMO (si activées)
// ============================================
console.log('5. DONNÉES DEMO');
const flagDemo = localStorage.getItem('demo-chargees');
if (flagDemo === 'true') {
    console.log('   ℹ️ Données demo ACTIVÉES');

    const cours = obtenirDonneesSelonMode('listeCours') || [];
    const coursDemo = cours.find(c => c.groupe === '9999');

    if (coursDemo) {
        resultats.ok.push('Groupe demo 9999 présent');
        console.log(`   ✅ Cours demo: ${coursDemo.id}`);

        const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const etudiantsDemo = etudiants.filter(e => e.groupe === '9999');
        console.log(`   ✅ Étudiants demo: ${etudiantsDemo.length}`);

        const productions = obtenirDonneesSelonMode('productions') || [];
        const prodDemo = productions.filter(p => p.coursId === coursDemo.id);
        console.log(`   ✅ Productions demo: ${prodDemo.length}`);
    } else {
        resultats.erreurs.push('Flag demo=true mais cours 9999 absent');
        console.log('   ❌ Flag demo=true mais cours 9999 ABSENT');
    }
} else {
    console.log('   ℹ️ Données demo non activées');
}
console.log('');

// ============================================
// 6. ERREURS CONSOLE
// ============================================
console.log('6. VÉRIFICATION CONSOLE');
console.log('   ℹ️ Vérifiez manuellement qu\'il n\'y a pas d\'erreurs rouges ci-dessus');
console.log('');

// ============================================
// RÉSUMÉ FINAL
// ============================================
console.log('=== RÉSUMÉ FINAL ===');
console.log(`✅ OK: ${resultats.ok.length}`);
console.log(`⚠️ Warnings: ${resultats.warnings.length}`);
console.log(`❌ Erreurs: ${resultats.erreurs.length}`);
console.log('');

if (resultats.erreurs.length > 0) {
    console.log('🔴 ERREURS CRITIQUES:');
    resultats.erreurs.forEach(e => console.log(`   - ${e}`));
    console.log('');
    console.log('⚠️ CORRECTION NÉCESSAIRE AVANT PAUSE');
} else if (resultats.warnings.length > 0) {
    console.log('🟡 WARNINGS (non-bloquants):');
    resultats.warnings.forEach(w => console.log(`   - ${w}`));
    console.log('');
    console.log('✅ Peut partir en pause (warnings mineurs)');
} else {
    console.log('🎉 TOUT EST FONCTIONNEL !');
    console.log('✅ Application prête pour une pause');
}

console.log('');
console.log('--- Fin du diagnostic ---');
