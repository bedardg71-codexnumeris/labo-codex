// ============================================
// SCRIPT 6 : Configuration complète des cours H2026
// Beta 95 - Horaires par cours-groupe
// ============================================
// À exécuter dans la console du navigateur
//
// Ce script crée :
// - 3 nouveaux cours (Philo, Bio, Chimie)
// - 10 étudiants par nouveau groupe
// - Horaires distincts pour chaque cours-groupe
// - Séances complètes du trimestre
//
// Cours existants (littérature) :
// - 601-101-MQ groupe 00094 : 2×2h (Lundi 13h + Mercredi 14h)
// - 601-101-MQ groupe 00098 : 1×4h (Mardi 13h)
//
// Nouveaux cours :
// - 340-101-MQ Philosophie groupe 00001 : 1×3h (Mercredi 10h) - Sommative
// - 101-NYA-05 Biologie groupe 00001 : 1×3h (Mardi 9h) - PAN-Spec
// - 202-NYB-05 Chimie groupe 00001 : 1×3h+1×2h (Lundi 9h + Jeudi 14h) - PAN-Spec

(function() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     CONFIGURATION COURS H2026 - BETA 95                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // ========================================
    // 1. RÉCUPÉRER LES DONNÉES EXISTANTES
    // ========================================
    var listeCours = db.getSync('listeCours', []);
    var etudiants = db.getSync('groupeEtudiants', []);

    console.log('📋 État initial:');
    console.log('   - Cours existants:', listeCours.length);
    console.log('   - Étudiants existants:', etudiants.length);

    // ========================================
    // 2. CRÉER LES NOUVEAUX COURS
    // ========================================
    console.log('');
    console.log('📚 Création des nouveaux cours...');

    var nouveauxCours = [
        {
            id: 'COURS-PHILO-01-H2026',
            sigle: '340-101-MQ',
            titre: 'Philosophie et rationalité',
            codeCours: '340-101-MQ',
            nomCours: 'Philosophie et rationalité',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00001',
            pratiqueId: 'sommative',
            formatHoraire: '1x3h',
            actif: false,
            dansBibliotheque: true,
            enseignant: 'Sophie Laporte',
            discipline: 'Philosophie'
        },
        {
            id: 'COURS-BIO-01-H2026',
            sigle: '101-NYA-05',
            titre: 'Biologie générale',
            codeCours: '101-NYA-05',
            nomCours: 'Biologie générale',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00001',
            pratiqueId: 'pan-specifications',
            formatHoraire: '1x3h',
            actif: false,
            dansBibliotheque: true,
            enseignant: 'Jean-François Bélanger',
            discipline: 'Biologie'
        },
        {
            id: 'COURS-CHIMIE-01-H2026',
            sigle: '202-NYB-05',
            titre: 'Chimie organique',
            codeCours: '202-NYB-05',
            nomCours: 'Chimie organique',
            session: 'H',
            annee: '2026',
            trimestreId: 'h2026',
            groupe: '00001',
            pratiqueId: 'pan-specifications',
            formatHoraire: '1x3h+1x2h',
            actif: false,
            dansBibliotheque: true,
            enseignant: 'Marie Tremblay',
            discipline: 'Chimie'
        }
    ];

    // Ajouter seulement si n'existe pas déjà
    nouveauxCours.forEach(function(cours) {
        var existe = listeCours.some(function(c) {
            return c.id === cours.id;
        });
        if (!existe) {
            listeCours.push(cours);
            console.log('   ✅ Créé:', cours.sigle, '(' + cours.groupe + ') -', cours.pratiqueId);
        } else {
            console.log('   ⚠️ Existe déjà:', cours.sigle, '(' + cours.groupe + ')');
        }
    });

    db.setSync('listeCours', listeCours);

    // ========================================
    // 3. CRÉER LES ÉTUDIANTS POUR CHAQUE GROUPE
    // ========================================
    console.log('');
    console.log('👥 Création des étudiants...');

    // Noms fictifs pour les étudiants
    var prenomsH = ['Alexandre', 'Benjamin', 'Charles', 'David', 'Étienne', 'François', 'Gabriel', 'Hugo', 'Isaac', 'Jacob'];
    var prenomsF = ['Alice', 'Béatrice', 'Charlotte', 'Delphine', 'Émilie', 'Florence', 'Gabrielle', 'Hélène', 'Isabelle', 'Julie'];
    var noms = ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Gagné'];
    var programmes = ['300.A1', '200.B1', '500.A1', '700.B1', '200.B2'];

    function creerEtudiantsGroupe(coursId, groupe, prefixDa, nbEtudiants) {
        var dasExistants = {};
        etudiants.forEach(function(e) { dasExistants[e.da] = true; });

        var nouveaux = [];
        for (var i = 1; i <= nbEtudiants; i++) {
            var da = prefixDa + String(i).padStart(3, '0');
            if (!dasExistants[da]) {
                var estFemme = i % 2 === 0;
                var prenom = estFemme ? prenomsF[(i-1) % 10] : prenomsH[(i-1) % 10];
                var nom = noms[(i-1) % 10];

                nouveaux.push({
                    da: da,
                    nom: nom,
                    prenom: prenom,
                    groupe: groupe,
                    coursId: coursId,
                    programme: programmes[(i-1) % 5],
                    statut: 'actif'
                });
            }
        }

        if (nouveaux.length > 0) {
            etudiants = etudiants.concat(nouveaux);
            console.log('   ✅', nouveaux.length, 'étudiants créés pour', coursId);
        }
        return nouveaux.length;
    }

    // Créer 10 étudiants par nouveau groupe
    creerEtudiantsGroupe('COURS-PHILO-01-H2026', '00001', '3401', 10);
    creerEtudiantsGroupe('COURS-BIO-01-H2026', '00001', '1011', 10);
    creerEtudiantsGroupe('COURS-CHIMIE-01-H2026', '00001', '2021', 10);

    db.setSync('groupeEtudiants', etudiants);

    // ========================================
    // 4. CONFIGURER LES HORAIRES PAR COURS
    // ========================================
    console.log('');
    console.log('🕐 Configuration des horaires par cours-groupe...');

    // Format des séances : { jour, heureDebut, duree, local }
    // duree en heures (avec pauses de 10 min incluses : 1 période = 1h)

    var horaires = {
        // Littérature groupe 94 : 2×2h (Lundi 13h + Mercredi 14h)
        'COURS-LITT-94-H2026': [
            { jour: 'Lundi', heureDebut: '13:00', duree: 2, local: 'A-201' },
            { jour: 'Mercredi', heureDebut: '14:00', duree: 2, local: 'A-201' }
        ],
        // Littérature groupe 98 : 1×4h (Mardi 13h)
        'COURS-LITT-98-H2026': [
            { jour: 'Mardi', heureDebut: '13:00', duree: 4, local: 'A-202' }
        ],
        // Philosophie : 1×3h (Mercredi 10h)
        'COURS-PHILO-01-H2026': [
            { jour: 'Mercredi', heureDebut: '10:00', duree: 3, local: 'B-101' }
        ],
        // Biologie : 1×3h (Mardi 9h)
        'COURS-BIO-01-H2026': [
            { jour: 'Mardi', heureDebut: '09:00', duree: 3, local: 'C-301' }
        ],
        // Chimie : 1×3h théorie (Lundi 9h) + 1×2h labo (Jeudi 14h)
        'COURS-CHIMIE-01-H2026': [
            { jour: 'Lundi', heureDebut: '09:00', duree: 3, local: 'D-401' },
            { jour: 'Jeudi', heureDebut: '14:00', duree: 2, local: 'D-LAB1' }
        ]
    };

    // Trouver les IDs des cours de littérature existants
    var coursLitt94 = listeCours.find(function(c) {
        return c.sigle === '601-101-MQ' && c.groupe === '00094' && c.trimestreId === 'h2026';
    });
    var coursLitt98 = listeCours.find(function(c) {
        return c.sigle === '601-101-MQ' && c.groupe === '00098' && c.trimestreId === 'h2026';
    });

    // Remapper si les IDs sont différents
    if (coursLitt94 && coursLitt94.id !== 'COURS-LITT-94-H2026') {
        horaires[coursLitt94.id] = horaires['COURS-LITT-94-H2026'];
        delete horaires['COURS-LITT-94-H2026'];
        console.log('   📌 Remappé horaire Litt.94 vers', coursLitt94.id);
    }
    if (coursLitt98 && coursLitt98.id !== 'COURS-LITT-98-H2026') {
        horaires[coursLitt98.id] = horaires['COURS-LITT-98-H2026'];
        delete horaires['COURS-LITT-98-H2026'];
        console.log('   📌 Remappé horaire Litt.98 vers', coursLitt98.id);
    }

    // Sauvegarder chaque horaire dans sa clé spécifique
    Object.keys(horaires).forEach(function(coursId) {
        var cleHoraire = 'seancesHoraire_' + coursId;
        db.setSync(cleHoraire, horaires[coursId]);
        console.log('   ✅ Horaire sauvegardé:', coursId);
        horaires[coursId].forEach(function(s) {
            console.log('      -', s.jour, s.heureDebut, '(' + s.duree + 'h)', s.local);
        });
    });

    // ========================================
    // 5. GÉNÉRER LES SÉANCES COMPLÈTES
    // ========================================
    console.log('');
    console.log('📅 Génération des séances complètes du trimestre...');

    if (typeof genererSeancesCompletes === 'function') {
        Object.keys(horaires).forEach(function(coursId) {
            try {
                genererSeancesCompletes(coursId);

                // Compter les séances générées
                var cleSeances = 'seancesCompletes_' + coursId;
                var seances = db.getSync(cleSeances, {});
                var nbDates = Object.keys(seances).length;
                console.log('   ✅', coursId, ':', nbDates, 'dates de cours');
            } catch (e) {
                console.warn('   ⚠️ Erreur génération pour', coursId, ':', e.message);
            }
        });
    } else {
        console.warn('   ⚠️ Fonction genererSeancesCompletes non disponible');
    }

    // ========================================
    // 6. RÉSUMÉ FINAL
    // ========================================
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RÉSUMÉ FINAL                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    var coursH2026 = listeCours.filter(function(c) { return c.trimestreId === 'h2026'; });
    console.log('📚 COURS H2026 (' + coursH2026.length + '):');
    console.log('');

    coursH2026.forEach(function(c) {
        var nbEtu = etudiants.filter(function(e) { return e.coursId === c.id; }).length;
        var cleSeances = 'seancesCompletes_' + c.id;
        var seances = db.getSync(cleSeances, {});
        var nbSeances = Object.keys(seances).length;

        console.log('   ' + c.sigle + ' (' + c.groupe + ')');
        console.log('      Titre: ' + c.titre);
        console.log('      Pratique: ' + c.pratiqueId);
        console.log('      Format: ' + (c.formatHoraire || 'non défini'));
        console.log('      Étudiants: ' + nbEtu);
        console.log('      Séances: ' + nbSeances + ' dates');
        console.log('');
    });

    console.log('');
    console.log('🕐 GRILLE HORAIRE HEBDOMADAIRE:');
    console.log('');
    console.log('   LUNDI');
    console.log('      09h-12h : Chimie 202-NYB-05 (théorie) - D-401');
    console.log('      13h-15h : Littérature 601-101-MQ gr.94 - A-201');
    console.log('');
    console.log('   MARDI');
    console.log('      09h-12h : Biologie 101-NYA-05 - C-301');
    console.log('      13h-17h : Littérature 601-101-MQ gr.98 - A-202');
    console.log('');
    console.log('   MERCREDI');
    console.log('      10h-13h : Philosophie 340-101-MQ - B-101');
    console.log('      14h-16h : Littérature 601-101-MQ gr.94 - A-201');
    console.log('');
    console.log('   JEUDI');
    console.log('      14h-16h : Chimie 202-NYB-05 (labo) - D-LAB1');
    console.log('');
    console.log('   VENDREDI');
    console.log('      (libre)');
    console.log('');

    console.log('✅ Configuration terminée !');
    console.log('');
    console.log('💡 Pour changer de cours actif, utilisez le dropdown dans l\'en-tête');
    console.log('   ou exécutez: changerCoursDepuisEntete("COURS-ID")');
    console.log('');

})();
