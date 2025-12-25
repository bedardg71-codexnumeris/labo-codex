// ============================================
// SCRIPT 2 : Créer les 30 nouveaux étudiants
// ============================================
// À exécuter dans la console du navigateur
// Prérequis : Script 01 doit avoir été exécuté

(function() {
    var etudiants = db.getSync('groupeEtudiants') || [];

    // Vérifier les DA existants pour éviter les doublons
    var dasExistants = {};
    etudiants.forEach(function(e) { dasExistants[e.da] = true; });

    var nouveauxEtudiants = [];
    var i, da;

    // Groupe 97 - Philosophie (10 étudiants)
    for (i = 1; i <= 10; i++) {
        da = '970000' + i;
        if (!dasExistants[da]) {
            nouveauxEtudiants.push({
                da: da,
                nom: 'Test-97',
                prenom: 'philo-' + (i < 10 ? '0' + i : i),
                groupe: '00097',
                coursId: 'COURS-PHILO-H2026',
                programme: '300.A1',
                statut: 'actif'
            });
        }
    }

    // Groupe 96 - Chimie (10 étudiants)
    for (i = 1; i <= 10; i++) {
        da = '960000' + i;
        if (!dasExistants[da]) {
            nouveauxEtudiants.push({
                da: da,
                nom: 'Test-96',
                prenom: 'chim-' + (i < 10 ? '0' + i : i),
                groupe: '00096',
                coursId: 'COURS-CHIMIE-H2026',
                programme: '200.B1',
                statut: 'actif'
            });
        }
    }

    // Groupe 95 - Biologie (10 étudiants)
    for (i = 1; i <= 10; i++) {
        da = '950000' + i;
        if (!dasExistants[da]) {
            nouveauxEtudiants.push({
                da: da,
                nom: 'Test-95',
                prenom: 'bio-' + (i < 10 ? '0' + i : i),
                groupe: '00095',
                coursId: 'COURS-BIO-H2026',
                programme: '200.B1',
                statut: 'actif'
            });
        }
    }

    if (nouveauxEtudiants.length > 0) {
        etudiants = etudiants.concat(nouveauxEtudiants);
        db.setSync('groupeEtudiants', etudiants);
        console.log('✅ ' + nouveauxEtudiants.length + ' étudiants créés');
    } else {
        console.log('⚠️ Tous les étudiants existent déjà');
    }

    console.log('');
    console.log('=== RÉSUMÉ PAR GROUPE ===');
    console.log('Groupe 97 (Philo):', etudiants.filter(function(e) { return e.groupe === '00097'; }).length, 'étudiants');
    console.log('Groupe 96 (Chimie):', etudiants.filter(function(e) { return e.groupe === '00096'; }).length, 'étudiants');
    console.log('Groupe 95 (Bio):', etudiants.filter(function(e) { return e.groupe === '00095'; }).length, 'étudiants');
})();
