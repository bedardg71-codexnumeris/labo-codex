// ============================================
// SCRIPT 7 : Nettoyer les cours en double
// Beta 95
// ============================================
// À exécuter dans la console du navigateur
//
// Ce script supprime les cours non désirés créés par erreur :
// - 101-NYA-05 (00095)
// - 202-NYA-05 (00096)
// - 340-101-MQ (00097)

(function() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     NETTOYAGE DES COURS EN DOUBLE                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    var listeCours = db.getSync('listeCours', []);
    var etudiants = db.getSync('groupeEtudiants', []);

    console.log('📋 Avant nettoyage:');
    console.log('   - Cours:', listeCours.length);
    console.log('   - Étudiants:', etudiants.length);

    // Groupes à supprimer (cours créés par erreur)
    var groupesASupprimer = ['00095', '00096', '00097'];

    // Trouver les cours à supprimer
    var coursASupprimer = listeCours.filter(function(c) {
        return groupesASupprimer.includes(c.groupe);
    });

    console.log('');
    console.log('🗑️ Cours à supprimer:', coursASupprimer.length);
    coursASupprimer.forEach(function(c) {
        console.log('   -', c.sigle, '(' + c.groupe + ')', c.id);
    });

    // IDs des cours à supprimer
    var idsASupprimer = coursASupprimer.map(function(c) { return c.id; });

    // Supprimer les cours
    listeCours = listeCours.filter(function(c) {
        return !idsASupprimer.includes(c.id);
    });

    // Supprimer les étudiants associés
    var nbEtudiantsAvant = etudiants.length;
    etudiants = etudiants.filter(function(e) {
        return !idsASupprimer.includes(e.coursId);
    });
    var nbEtudiantsSupprimes = nbEtudiantsAvant - etudiants.length;

    // Supprimer les horaires et séances associés
    idsASupprimer.forEach(function(coursId) {
        var cleHoraire = 'seancesHoraire_' + coursId;
        var cleSeances = 'seancesCompletes_' + coursId;
        db.removeSync(cleHoraire);
        db.removeSync(cleSeances);
        console.log('   🗑️ Supprimé horaire/séances pour', coursId);
    });

    // Sauvegarder
    db.setSync('listeCours', listeCours);
    db.setSync('groupeEtudiants', etudiants);

    console.log('');
    console.log('📋 Après nettoyage:');
    console.log('   - Cours:', listeCours.length);
    console.log('   - Étudiants:', etudiants.length, '(-' + nbEtudiantsSupprimes + ')');

    // Afficher les cours restants
    console.log('');
    console.log('✅ Cours H2026 restants:');
    var coursH2026 = listeCours.filter(function(c) { return c.trimestreId === 'h2026'; });
    coursH2026.forEach(function(c) {
        var nbEtu = etudiants.filter(function(e) { return e.coursId === c.id; }).length;
        console.log('   -', c.sigle, '(' + c.groupe + '):', nbEtu, 'étudiants -', c.pratiqueId || 'non défini');
    });

    console.log('');
    console.log('💡 Rechargez la page pour voir les changements.');
    console.log('');

})();
