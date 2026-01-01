// Test complet des données de démonstration (groupe 9999)
// À exécuter dans la console du navigateur en mode Assisté

console.log('=== TEST COMPLET DONNÉES DEMO (GROUPE 9999) ===');
console.log('');

// 1. Vérifier si les données demo sont chargées
const demoChargees = localStorage.getItem('demo-chargees');
console.log('1. STATUT CHARGEMENT');
console.log('   demo-chargees:', demoChargees);
console.log('   ' + (demoChargees === 'true' ? '✅ Données demo chargées' : '❌ Données demo NON chargées'));
console.log('');

// 2. Vérifier le cours demo (groupe 9999)
const listeCours = obtenirDonneesSelonMode('listeCours') || [];
const coursDemo = listeCours.find(c => c.groupe === '9999');
console.log('2. COURS DEMO');
if (coursDemo) {
    console.log('   ✅ Cours trouvé:', coursDemo.id);
    console.log('      Sigle:', coursDemo.sigle);
    console.log('      Titre:', coursDemo.titre);
    console.log('      Enseignant:', coursDemo.enseignant);
    console.log('      Groupe:', coursDemo.groupe);
    console.log('      Actif:', coursDemo.actif);
} else {
    console.log('   ❌ Cours demo NON trouvé (groupe 9999)');
}
console.log('');

// 3. Vérifier les étudiants demo
const groupeEtudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
const etudiantsDemo = groupeEtudiants.filter(e => e.groupe === '9999');
console.log('3. ÉTUDIANTS DEMO');
console.log('   Total étudiants demo:', etudiantsDemo.length);
if (etudiantsDemo.length > 0) {
    console.log('   ✅ Étudiants trouvés');
    console.log('   Exemples:');
    etudiantsDemo.slice(0, 3).forEach((e, i) => {
        console.log(`      ${i+1}. ${e.prenom} ${e.nom} (DA: ${e.da}, Programme: ${e.programme})`);
    });
    if (etudiantsDemo.length > 3) {
        console.log(`      ... et ${etudiantsDemo.length - 3} autres`);
    }
} else {
    console.log('   ❌ Aucun étudiant demo trouvé');
}
console.log('');

// 4. Vérifier les productions demo
const productions = obtenirDonneesSelonMode('productions') || [];
const productionsDemo = productions.filter(p => p.coursId === coursDemo?.id);
console.log('4. PRODUCTIONS DEMO');
console.log('   Total productions demo:', productionsDemo.length);
if (productionsDemo.length > 0) {
    console.log('   ✅ Productions trouvées');
    productionsDemo.forEach((p, i) => {
        console.log(`      ${i+1}. ${p.titre || p.nom} (${p.type})`);
        console.log(`         Échéance: ${p.dateEcheance || 'Non définie'}`);
    });
} else {
    console.log('   ❌ Aucune production demo trouvée');
}
console.log('');

// 5. Vérifier les présences demo
const presences = obtenirDonneesSelonMode('presences') || [];
const presencesDemo = presences.filter(p => {
    return etudiantsDemo.some(e => e.da === p.da);
});
console.log('5. PRÉSENCES DEMO');
console.log('   Total entrées présences demo:', presencesDemo.length);
if (presencesDemo.length > 0) {
    console.log('   ✅ Présences trouvées');

    // Grouper par date
    const dates = [...new Set(presencesDemo.map(p => p.date))].sort();
    console.log('   Dates avec présences:', dates.length);
    console.log('   Première date:', dates[0]);
    console.log('   Dernière date:', dates[dates.length - 1]);

    // Échantillon pour une date
    if (dates.length > 0) {
        const dateTest = dates[0];
        const presDate = presencesDemo.filter(p => p.date === dateTest);
        console.log(`   Exemple (${dateTest}): ${presDate.length} étudiants enregistrés`);
    }
} else {
    console.log('   ❌ Aucune présence demo trouvée');
}
console.log('');

// 6. Vérifier les évaluations demo
const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
const evaluationsDemo = evaluations.filter(e => {
    return etudiantsDemo.some(et => et.da === e.etudiantDA);
});
console.log('6. ÉVALUATIONS DEMO');
console.log('   Total évaluations demo:', evaluationsDemo.length);
if (evaluationsDemo.length > 0) {
    console.log('   ✅ Évaluations trouvées');

    // Compter par production
    const parProduction = {};
    evaluationsDemo.forEach(e => {
        const prod = productions.find(p => p.id === e.productionId);
        const nomProd = prod ? (prod.titre || prod.nom) : 'Production inconnue';
        parProduction[nomProd] = (parProduction[nomProd] || 0) + 1;
    });

    console.log('   Répartition par production:');
    Object.entries(parProduction).forEach(([nom, count]) => {
        console.log(`      ${nom}: ${count} évaluations`);
    });
} else {
    console.log('   ❌ Aucune évaluation demo trouvée');
}
console.log('');

// 7. Vérifier les grilles et échelles
const grilles = obtenirDonneesSelonMode('grillesTemplates') || [];
const echelles = obtenirDonneesSelonMode('echellesTemplates') || [];
console.log('7. MATÉRIEL PÉDAGOGIQUE');
console.log('   Grilles disponibles:', grilles.length);
console.log('   Échelles disponibles:', echelles.length);
if (grilles.length > 0) {
    console.log('   ✅ Grilles trouvées');
    grilles.forEach((g, i) => {
        console.log(`      ${i+1}. ${g.nom} (${g.criteres?.length || 0} critères)`);
    });
}
if (echelles.length > 0) {
    console.log('   ✅ Échelles trouvées');
    echelles.forEach((e, i) => {
        console.log(`      ${i+1}. ${e.nom} (${e.niveaux?.length || 0} niveaux)`);
    });
}
console.log('');

// 8. Test des indices calculés
if (etudiantsDemo.length > 0) {
    console.log('8. TEST INDICES CALCULÉS (1er étudiant)');
    const etudiantTest = etudiantsDemo[0];
    console.log(`   Étudiant test: ${etudiantTest.prenom} ${etudiantTest.nom} (${etudiantTest.da})`);

    // Essayer de calculer les indices
    try {
        // Assiduité
        if (typeof calculerAssiduiteHistorique === 'function') {
            const assiduite = calculerAssiduiteHistorique(etudiantTest.da);
            console.log(`   Assiduité: ${(assiduite * 100).toFixed(1)}%`);
        }

        // Complétion et Performance
        if (typeof obtenirIndicesCP === 'function') {
            const indicesCP = obtenirIndicesCP(etudiantTest.da);
            if (indicesCP?.actuel) {
                console.log(`   Complétion: ${indicesCP.actuel.C}%`);
                console.log(`   Performance: ${indicesCP.actuel.P}%`);
            }
        }
    } catch (error) {
        console.log('   ⚠️ Erreur calcul indices:', error.message);
    }
}
console.log('');

// 9. Résumé final
console.log('=== RÉSUMÉ FINAL ===');
const checks = [
    { nom: 'Données chargées', ok: demoChargees === 'true' },
    { nom: 'Cours demo', ok: !!coursDemo },
    { nom: 'Étudiants (10)', ok: etudiantsDemo.length === 10 },
    { nom: 'Productions', ok: productionsDemo.length > 0 },
    { nom: 'Présences', ok: presencesDemo.length > 0 },
    { nom: 'Évaluations', ok: evaluationsDemo.length > 0 },
    { nom: 'Grilles', ok: grilles.length > 0 },
    { nom: 'Échelles', ok: echelles.length > 0 }
];

const nbOk = checks.filter(c => c.ok).length;
const nbTotal = checks.length;

checks.forEach(c => {
    console.log(`${c.ok ? '✅' : '❌'} ${c.nom}`);
});

console.log('');
console.log(`Score: ${nbOk}/${nbTotal} (${Math.round(nbOk/nbTotal*100)}%)`);

if (nbOk === nbTotal) {
    console.log('');
    console.log('🎉 TOUTES LES DONNÉES DEMO SONT FONCTIONNELLES !');
} else {
    console.log('');
    console.log('⚠️ Certaines données demo sont manquantes ou non chargées');
    console.log('   → Vérifiez que vous êtes en mode Assisté');
    console.log('   → Essayez de recharger la page');
}
