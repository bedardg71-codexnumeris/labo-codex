// ============================================
// SCRIPT 4 : Vérification finale Beta 95
// ============================================
// À exécuter dans la console du navigateur
// Exécuter après les scripts 01, 02 et 03

(function() {
    var etudiants = db.getSync('groupeEtudiants') || [];
    var cours = db.getSync('listeCours') || [];
    var coursH2026 = cours.filter(function(c) { return c.trimestreId === 'h2026'; });

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           VÉRIFICATION BETA 95 - H2026                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    console.log('=== COURS H2026 (' + coursH2026.length + ') ===');
    console.log('');

    var totalEtudiants = 0;

    for (var i = 0; i < coursH2026.length; i++) {
        var c = coursH2026[i];
        var etudiantsCours = etudiants.filter(function(e) { return e.coursId === c.id; });
        totalEtudiants += etudiantsCours.length;

        console.log('📚 ' + c.sigle + ' - ' + c.titre);
        console.log('   Groupe: ' + c.groupe);
        console.log('   Pratique: ' + c.pratiqueId);
        console.log('   Étudiants: ' + etudiantsCours.length);
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('TOTAL ÉTUDIANTS H2026: ' + totalEtudiants);
    console.log('');

    // Vérification des attentes
    var attenduCours = 4;
    var attenduEtudiants = 40;

    if (coursH2026.length === attenduCours && totalEtudiants === attenduEtudiants) {
        console.log('✅ SUCCÈS: Configuration Beta 95 complète!');
    } else {
        console.log('⚠️ ATTENTION: Écarts détectés');
        console.log('   Cours: ' + coursH2026.length + '/' + attenduCours);
        console.log('   Étudiants: ' + totalEtudiants + '/' + attenduEtudiants);
    }

    console.log('');
    console.log('=== DÉTAIL PAR GROUPE ===');
    var groupes = ['00098', '00097', '00096', '00095'];
    for (var j = 0; j < groupes.length; j++) {
        var g = groupes[j];
        var nb = etudiants.filter(function(e) { return e.groupe === g; }).length;
        console.log('Groupe ' + g + ': ' + nb + ' étudiants');
    }
})();
