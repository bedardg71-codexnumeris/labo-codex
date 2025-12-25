// ============================================
// SCRIPT 1 : Créer les 3 nouveaux cours H2026
// ============================================
// À exécuter dans la console du navigateur
// Prérequis : H2026 doit être le trimestre actif

(function() {
    var coursH2026 = db.getSync('listeCours') || [];

    // Vérifier qu'on ne duplique pas
    var siglesCours = coursH2026.map(function(c) { return c.sigle; });

    // Cours Philosophie (Groupe 97)
    if (siglesCours.indexOf('340-101-MQ') === -1) {
        coursH2026.push({
            id: 'COURS-PHILO-H2026',
            sigle: '340-101-MQ',
            titre: 'Philosophie et rationalité',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00097',
            pratiqueId: 'pan-maitrise',
            formatHoraire: '3x1h',
            actif: true
        });
        console.log('✅ Cours Philosophie (340-101-MQ) créé');
    } else {
        console.log('⚠️ Cours Philosophie déjà existant');
    }

    // Cours Chimie (Groupe 96)
    if (siglesCours.indexOf('202-NYA-05') === -1) {
        coursH2026.push({
            id: 'COURS-CHIMIE-H2026',
            sigle: '202-NYA-05',
            titre: 'Chimie générale',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00096',
            pratiqueId: 'pan-specifications',
            formatHoraire: '2x2h30',
            actif: true
        });
        console.log('✅ Cours Chimie (202-NYA-05) créé');
    } else {
        console.log('⚠️ Cours Chimie déjà existant');
    }

    // Cours Biologie (Groupe 95)
    if (siglesCours.indexOf('101-NYA-05') === -1) {
        coursH2026.push({
            id: 'COURS-BIO-H2026',
            sigle: '101-NYA-05',
            titre: 'Biologie générale',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00095',
            pratiqueId: 'sommative',
            formatHoraire: '2x2h',
            actif: true
        });
        console.log('✅ Cours Biologie (101-NYA-05) créé');
    } else {
        console.log('⚠️ Cours Biologie déjà existant');
    }

    db.setSync('listeCours', coursH2026);
    console.log('');
    console.log('=== RÉSUMÉ ===');
    console.log('Total cours H2026:', coursH2026.filter(function(c) { return c.trimestreId === 'h2026'; }).length);
})();
