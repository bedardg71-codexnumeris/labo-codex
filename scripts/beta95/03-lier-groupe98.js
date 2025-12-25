// ============================================
// SCRIPT 3 : Lier le groupe 98 au cours Littérature
// ============================================
// À exécuter dans la console du navigateur
// Prérequis : Le cours Littérature 601-101-MQ doit exister

(function() {
    var etudiantsList = db.getSync('groupeEtudiants') || [];
    var listeCours = db.getSync('listeCours') || [];

    // Trouver le cours Littérature H2026
    var coursLitt = null;
    for (var i = 0; i < listeCours.length; i++) {
        if (listeCours[i].sigle === '601-101-MQ' && listeCours[i].trimestreId === 'h2026') {
            coursLitt = listeCours[i];
            break;
        }
    }

    if (coursLitt) {
        var nbMaj = 0;
        for (var j = 0; j < etudiantsList.length; j++) {
            if (etudiantsList[j].groupe === '00098') {
                etudiantsList[j].coursId = coursLitt.id;
                nbMaj++;
            }
        }

        db.setSync('groupeEtudiants', etudiantsList);
        console.log('✅ Groupe 98 lié au cours ' + coursLitt.sigle);
        console.log('   Cours ID: ' + coursLitt.id);
        console.log('   Étudiants mis à jour: ' + nbMaj);
    } else {
        console.log('❌ Cours Littérature 601-101-MQ non trouvé pour H2026');
        console.log('   Cours disponibles:');
        for (var k = 0; k < listeCours.length; k++) {
            if (listeCours[k].trimestreId === 'h2026') {
                console.log('   - ' + listeCours[k].sigle + ' (' + listeCours[k].id + ')');
            }
        }
    }
})();
