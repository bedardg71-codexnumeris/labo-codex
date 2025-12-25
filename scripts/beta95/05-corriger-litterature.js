// ============================================
// SCRIPT 5 : Corriger groupe Littérature et ajouter groupe 94
// ============================================
// À exécuter dans la console du navigateur

(function() {
    var listeCours = db.getSync('listeCours') || [];
    var etudiants = db.getSync('groupeEtudiants') || [];

    // ========================================
    // 1. Corriger le groupe du cours Littérature existant (00001 → 00098)
    // ========================================
    var coursLitt = null;
    for (var i = 0; i < listeCours.length; i++) {
        if (listeCours[i].sigle === '601-101-MQ' && listeCours[i].trimestreId === 'h2026') {
            coursLitt = listeCours[i];
            console.log('✅ Cours Littérature trouvé:', coursLitt.id);
            console.log('   Ancien groupe:', coursLitt.groupe);
            coursLitt.groupe = '00098';
            console.log('   Nouveau groupe:', coursLitt.groupe);
            break;
        }
    }

    if (!coursLitt) {
        console.log('❌ Cours Littérature 601-101-MQ non trouvé pour H2026');
        return;
    }

    // ========================================
    // 2. Créer un nouveau cours Littérature groupe 94
    // ========================================
    var coursLitt94Existe = listeCours.some(function(c) {
        return c.sigle === '601-101-MQ' && c.groupe === '00094' && c.trimestreId === 'h2026';
    });

    if (!coursLitt94Existe) {
        var nouveauCoursLitt94 = {
            id: 'COURS-LITT-94-H2026',
            sigle: '601-101-MQ',
            titre: 'Écriture et littérature',
            codeCours: '601-101-MQ',
            nomCours: 'Écriture et littérature',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00094',
            pratiqueId: 'pan-maitrise',
            formatHoraire: '2x2h',
            actif: false,
            dansBibliotheque: true
        };
        listeCours.push(nouveauCoursLitt94);
        console.log('✅ Cours Littérature groupe 94 créé');
    } else {
        console.log('⚠️ Cours Littérature groupe 94 existe déjà');
    }

    // ========================================
    // 3. Créer 10 étudiants pour le groupe 94
    // ========================================
    var dasExistants = {};
    etudiants.forEach(function(e) { dasExistants[e.da] = true; });

    var nouveauxEtudiants = [];
    for (var j = 1; j <= 10; j++) {
        var da = '940000' + j;
        if (!dasExistants[da]) {
            nouveauxEtudiants.push({
                da: da,
                nom: 'Test-94',
                prenom: 'litt2-' + (j < 10 ? '0' + j : j),
                groupe: '00094',
                coursId: 'COURS-LITT-94-H2026',
                programme: '500.A1',
                statut: 'actif'
            });
        }
    }

    if (nouveauxEtudiants.length > 0) {
        etudiants = etudiants.concat(nouveauxEtudiants);
        console.log('✅ ' + nouveauxEtudiants.length + ' étudiants créés pour groupe 94');
    } else {
        console.log('⚠️ Étudiants groupe 94 existent déjà');
    }

    // ========================================
    // 4. Sauvegarder
    // ========================================
    db.setSync('listeCours', listeCours);
    db.setSync('groupeEtudiants', etudiants);

    // ========================================
    // 5. Résumé
    // ========================================
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           RÉSUMÉ DES MODIFICATIONS                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    var coursH2026 = listeCours.filter(function(c) { return c.trimestreId === 'h2026'; });
    console.log('Cours H2026 (' + coursH2026.length + '):');
    coursH2026.forEach(function(c) {
        var nbEtu = etudiants.filter(function(e) { return e.coursId === c.id; }).length;
        console.log('  - ' + c.sigle + ' (groupe ' + c.groupe + '): ' + nbEtu + ' étudiants - ' + c.pratiqueId);
    });

    console.log('');
    console.log('Total étudiants H2026:', etudiants.filter(function(e) {
        return coursH2026.some(function(c) { return c.id === e.coursId; });
    }).length);
})();
