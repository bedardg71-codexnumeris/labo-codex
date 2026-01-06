/* ===============================
   MODULE: MIGRATIONS BETA 93.5
   Date: 11 décembre 2025

   Objectif:
   Ajouter coursId aux données existantes pour supporter
   le groupe démo et préparer le système multi-cours Beta 94

   Migrations:
   1. Étudiants → coursId
   2. Productions → coursId
   3. Présences → coursId
   =============================== */

/**
 * Migration 1: Ajouter coursId aux étudiants
 *
 * Contexte:
 * Les étudiants n'ont actuellement qu'un champ "groupe" ambigu.
 * On ajoute coursId pour lier chaque étudiant à un cours-groupe précis.
 *
 * @returns {number} Nombre d'étudiants migrés
 */
function migrerEtudiantsVersCoursId() {
    // ✅ NAMESPACING (Beta 95.5) : Lire depuis cle namespacee si disponible
    const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
    const etudiants = db.getSync(cleEtudiants, []);
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        console.warn('⚠️ [Migration] Aucun cours actif, impossible de migrer les étudiants');
        return 0;
    }

    let nbMigres = 0;
    etudiants.forEach(e => {
        if (!e.coursId) {
            e.coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Sauvegarder dans la clé namespacée
        db.setSync(cleEtudiants, etudiants);
        console.log(`✅ [Migration] ${nbMigres} étudiant(s) → coursId: ${coursActif.id} (clé: ${cleEtudiants})`);
    }

    return nbMigres;
}

/**
 * Migration 2: Ajouter coursId aux productions
 *
 * Contexte:
 * Les productions devraient déjà avoir coursId, mais on vérifie
 * et on ajoute si manquant.
 *
 * @returns {number} Nombre de productions migrées
 */
function migrerProductionsVersCoursId() {
    // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
    const cleProductions = (typeof cle === 'function') ? cle('productions') : 'productions';
    const productions = db.getSync(cleProductions, []);
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        console.warn('⚠️ [Migration] Aucun cours actif, impossible de migrer les productions');
        return 0;
    }

    let nbMigres = 0;
    productions.forEach(p => {
        if (!p.coursId) {
            p.coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync(cleProductions, productions);
        console.log(`✅ [Migration] ${nbMigres} production(s) → coursId: ${coursActif.id} (clé: ${cleProductions})`);
    }

    return nbMigres;
}

/**
 * Migration 3: Ajouter coursId aux présences
 *
 * Contexte:
 * Chaque date de présence doit être liée au cours-groupe correspondant.
 *
 * Structure avant:
 * {
 *   "2026-01-15": {
 *     presences: { "2234567": { present: true, heures: 2.0 } }
 *   }
 * }
 *
 * Structure après:
 * {
 *   "2026-01-15": {
 *     coursId: "601-101-h2026-01",
 *     presences: { "2234567": { present: true, heures: 2.0 } }
 *   }
 * }
 *
 * @returns {number} Nombre de dates migrées
 */
function migrerPresencesVersCoursId() {
    // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
    const clePresences = (typeof cle === 'function') ? cle('presences') : 'presences';
    const presences = db.getSync(clePresences, {});
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        console.warn('⚠️ [Migration] Aucun cours actif, impossible de migrer les présences');
        return 0;
    }

    let nbMigres = 0;
    Object.keys(presences).forEach(date => {
        if (!presences[date].coursId) {
            presences[date].coursId = coursActif.id;
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync(clePresences, presences);
        console.log(`✅ [Migration] ${nbMigres} date(s) de présences → coursId: ${coursActif.id} (clé: ${clePresences})`);
    }

    return nbMigres;
}

/**
 * Migration 4: Ajouter trimestreId aux cours
 *
 * Contexte:
 * Avec l'architecture Trimestre ↔ Cours, chaque cours doit être lié à un trimestre.
 * On génère un trimestreId basé sur session+annee (ex: "h2026", "a2025")
 *
 * @returns {number} Nombre de cours migrés
 */
function migrerCoursVersTrimestreId() {
    const cours = db.getSync('listeCours', []);

    let nbMigres = 0;
    cours.forEach(c => {
        if (!c.trimestreId && c.session && c.annee) {
            // Générer trimestreId: session (lowercase) + année
            // Ex: H + 2026 → "h2026", A + 2025 → "a2025"
            c.trimestreId = (c.session || 'H').toLowerCase() + (c.annee || '2025');
            nbMigres++;
        }
    });

    if (nbMigres > 0) {
        db.setSync('listeCours', cours);
        console.log(`✅ [Migration] ${nbMigres} cours → trimestreId`);
    }

    return nbMigres;
}

/**
 * Exécuter toutes les migrations Beta 93.5
 *
 * Appelé au chargement de l'application dans js/main.js
 *
 * @returns {Object} Résultats des migrations { etudiants, productions, presences, cours }
 */
function executerMigrationsBeta935() {
    console.log('🔄 [Migration] Démarrage migrations Beta 93.5...');

    const resultats = {
        etudiants: migrerEtudiantsVersCoursId(),
        productions: migrerProductionsVersCoursId(),
        presences: migrerPresencesVersCoursId(),
        cours: migrerCoursVersTrimestreId()
    };

    const total = Object.values(resultats).reduce((sum, n) => sum + (n || 0), 0);

    if (total > 0) {
        console.log(`✅ [Migration] Beta 93.5 terminée (${total} éléments migrés)`);
        console.log(`   - Étudiants: ${resultats.etudiants}`);
        console.log(`   - Productions: ${resultats.productions}`);
        console.log(`   - Présences: ${resultats.presences}`);
        console.log(`   - Cours: ${resultats.cours}`);
    } else {
        console.log('✅ [Migration] Aucune migration nécessaire (déjà à jour)');
    }

    return resultats;
}

/* ===============================
   MIGRATIONS BETA 95 : HORAIRES PAR COURS
   Date: 24 décembre 2025

   Objectif:
   Migrer l'horaire global existant vers des horaires par cours-groupe
   =============================== */

/**
 * Migration 5: Copier l'horaire global vers chaque cours du trimestre actif
 *
 * Contexte:
 * Avant Beta 95, un seul horaire était partagé par tous les cours.
 * Après Beta 95, chaque cours-groupe a son propre horaire.
 *
 * Cette migration copie l'horaire global existant vers chaque cours
 * du trimestre actif, permettant ensuite de les personnaliser.
 *
 * @returns {Object} { nbCoursMigres, nbSeancesGenerees }
 */
function migrerHoraireVersMultiCours() {
    console.log('🔄 [Migration Beta 95] Migration horaires multi-cours...');

    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);
    if (!trimestreActif) {
        console.log('   ⚠️ Aucun trimestre actif, migration reportée');
        return { nbCoursMigres: 0, nbSeancesGenerees: 0 };
    }

    // Obtenir les cours du trimestre actif
    const listeCours = db.getSync('listeCours', []);
    const coursTrimestreActif = listeCours.filter(c => c.trimestreId === trimestreActif.id);
    if (coursTrimestreActif.length === 0) {
        console.log('   ⚠️ Aucun cours dans le trimestre actif');
        return { nbCoursMigres: 0, nbSeancesGenerees: 0 };
    }

    // Chercher l'horaire global existant (plusieurs sources possibles)
    let horaireGlobal = [];

    // Source 1: horaireHebdo namespacé par trimestre
    if (typeof cle === 'function') {
        horaireGlobal = db.getSync(cle('horaireHebdo'), []);
    }

    // Source 2: seancesHoraire namespacé par trimestre
    if (horaireGlobal.length === 0 && typeof cle === 'function') {
        horaireGlobal = db.getSync(cle('seancesHoraire'), []);
    }

    // Source 3: seancesHoraire non namespacé (legacy)
    if (horaireGlobal.length === 0) {
        horaireGlobal = db.getSync('seancesHoraire', []);
    }

    if (horaireGlobal.length === 0) {
        console.log('   ⚠️ Aucun horaire global existant, pas de migration nécessaire');
        return { nbCoursMigres: 0, nbSeancesGenerees: 0 };
    }

    console.log(`   📋 Horaire global trouvé: ${horaireGlobal.length} séance(s)`);
    console.log(`   📚 Cours à migrer: ${coursTrimestreActif.length}`);

    // Copier l'horaire vers chaque cours qui n'en a pas encore
    let nbCoursMigres = 0;
    coursTrimestreActif.forEach(cours => {
        const cleHoraireCours = `seancesHoraire_${cours.id}`;
        const horaireExistant = db.getSync(cleHoraireCours, null);

        if (!horaireExistant || horaireExistant.length === 0) {
            // Copier l'horaire global vers ce cours
            db.setSync(cleHoraireCours, horaireGlobal);
            nbCoursMigres++;
            console.log(`   ✅ Horaire copié vers: ${cours.sigle || cours.id} (${cours.groupe || 'sans groupe'})`);
        }
    });

    // Générer les séances complètes pour chaque cours migré
    let nbSeancesGenerees = 0;
    if (nbCoursMigres > 0 && typeof genererSeancesCompletes === 'function') {
        coursTrimestreActif.forEach(cours => {
            try {
                genererSeancesCompletes(cours.id);
                nbSeancesGenerees++;
            } catch (e) {
                console.warn(`   ⚠️ Erreur génération séances pour ${cours.id}:`, e);
            }
        });
    }

    console.log(`✅ [Migration Beta 95] Terminée: ${nbCoursMigres} cours migré(s), ${nbSeancesGenerees} séances générées`);

    return { nbCoursMigres, nbSeancesGenerees };
}

/**
 * Exécuter toutes les migrations Beta 95
 *
 * Appelé au chargement de l'application dans js/main.js
 *
 * @returns {Object} Résultats des migrations
 */
function executerMigrationsBeta95() {
    console.log('🔄 [Migration] Démarrage migrations Beta 95...');

    const resultats = {
        horaires: migrerHoraireVersMultiCours()
    };

    const total = resultats.horaires.nbCoursMigres || 0;

    if (total > 0) {
        console.log(`✅ [Migration] Beta 95 terminée (${total} cours migré(s))`);
    } else {
        console.log('✅ [Migration] Aucune migration Beta 95 nécessaire (déjà à jour)');
    }

    return resultats;
}

/* ===============================
   MIGRATIONS BETA 95.1 : PÉRIODES AU LIEU DES HEURES
   Date: 5 janvier 2026

   Objectif:
   Migrer les données existantes vers le système de périodes
   - Séances: duree → nombrePeriodes
   - Présences: heures → periodesPresentes
   =============================== */

/**
 * Migration 6: Ajouter nombrePeriodes aux séances existantes
 *
 * Contexte:
 * Beta 95.1 introduit le comptage en périodes au lieu des heures.
 * Cette migration ajoute nombrePeriodes aux séances qui n'ont que duree.
 *
 * @returns {Object} { nbSeancesMigrees, nbCoursMigres }
 */
function migrerSeancesVersPeriodes() {
    console.log('🔄 [Migration Beta 95.1] Migration séances vers périodes...');

    const listeCours = db.getSync('listeCours', []);
    if (listeCours.length === 0) {
        console.log('   ⚠️ Aucun cours, pas de migration nécessaire');
        return { nbSeancesMigrees: 0, nbCoursMigres: 0 };
    }

    // Obtenir la durée de période (défaut: 55 min)
    const modalites = db.getSync('modalitesEvaluation', {});
    const dureePeriode = modalites.dureePeriodeMinutes || 55;

    let nbSeancesMigrees = 0;
    let nbCoursMigres = 0;

    listeCours.forEach(cours => {
        // Migrer l'horaire du cours
        const cleHoraireCours = `seancesHoraire_${cours.id}`;
        const seancesHoraire = db.getSync(cleHoraireCours, []);
        let modified = false;

        seancesHoraire.forEach(seance => {
            if (seance.duree !== undefined && seance.nombrePeriodes === undefined) {
                // Convertir la durée en périodes
                seance.nombrePeriodes = Math.round((seance.duree * 60) / dureePeriode);
                nbSeancesMigrees++;
                modified = true;
            }
        });

        if (modified) {
            db.setSync(cleHoraireCours, seancesHoraire);
            nbCoursMigres++;
        }

        // Migrer aussi les séances complètes
        const cleSeancesCompletes = `seancesCompletes_${cours.id}`;
        const seancesCompletes = db.getSync(cleSeancesCompletes, {});

        Object.keys(seancesCompletes).forEach(date => {
            const seancesDuJour = seancesCompletes[date];
            if (Array.isArray(seancesDuJour)) {
                seancesDuJour.forEach(seance => {
                    if (seance.duree !== undefined && seance.nombrePeriodes === undefined) {
                        seance.nombrePeriodes = Math.round((seance.duree * 60) / dureePeriode);
                        nbSeancesMigrees++;
                    }
                });
            }
        });

        if (Object.keys(seancesCompletes).length > 0) {
            db.setSync(cleSeancesCompletes, seancesCompletes);
        }
    });

    if (nbSeancesMigrees > 0) {
        console.log(`   ✅ ${nbSeancesMigrees} séance(s) migrée(s) (${nbCoursMigres} cours)`);
    }

    return { nbSeancesMigrees, nbCoursMigres };
}

/**
 * Migration 7: Ajouter periodesPresentes aux présences existantes
 *
 * Contexte:
 * Beta 95.1 stocke les présences en périodes.
 * Cette migration ajoute periodesPresentes aux présences qui n'ont que heures.
 *
 * @returns {number} Nombre de présences migrées
 */
function migrerPresencesVersPeriodes() {
    console.log('🔄 [Migration Beta 95.1] Migration présences vers périodes...');

    // Obtenir la durée de période (défaut: 55 min)
    const modalites = db.getSync('modalitesEvaluation', {});
    const dureePeriode = modalites.dureePeriodeMinutes || 55;

    // Lire les présences (utiliser clé namespacée si disponible)
    const clePresences = (typeof cle === 'function') ? cle('presences') : 'presences';
    const presences = db.getSync(clePresences, []);

    if (!Array.isArray(presences) || presences.length === 0) {
        console.log('   ⚠️ Aucune présence, pas de migration nécessaire');
        return 0;
    }

    let nbMigrees = 0;

    presences.forEach(presence => {
        if (presence.heures !== undefined && presence.periodesPresentes === undefined) {
            // Convertir les heures en périodes
            presence.periodesPresentes = Math.round((presence.heures * 60) / dureePeriode);
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        db.setSync(clePresences, presences);
        console.log(`   ✅ ${nbMigrees} présence(s) migrée(s)`);
    }

    return nbMigrees;
}

/**
 * Exécuter toutes les migrations Beta 95.1
 *
 * Appelé au chargement de l'application dans js/main.js
 *
 * @returns {Object} Résultats des migrations
 */
function executerMigrationsBeta951() {
    console.log('🔄 [Migration] Démarrage migrations Beta 95.1...');

    const resultats = {
        seances: migrerSeancesVersPeriodes(),
        presences: migrerPresencesVersPeriodes()
    };

    const totalSeances = resultats.seances.nbSeancesMigrees || 0;
    const totalPresences = resultats.presences || 0;
    const total = totalSeances + totalPresences;

    if (total > 0) {
        console.log(`✅ [Migration] Beta 95.1 terminée:`);
        console.log(`   - Séances: ${totalSeances}`);
        console.log(`   - Présences: ${totalPresences}`);
    } else {
        console.log('✅ [Migration] Aucune migration Beta 95.1 nécessaire (déjà à jour)');
    }

    return resultats;
}

// Export des fonctions
if (typeof window !== 'undefined') {
    window.executerMigrationsBeta935 = executerMigrationsBeta935;
    window.migrerEtudiantsVersCoursId = migrerEtudiantsVersCoursId;
    window.migrerProductionsVersCoursId = migrerProductionsVersCoursId;
    window.migrerPresencesVersCoursId = migrerPresencesVersCoursId;
    window.migrerCoursVersTrimestreId = migrerCoursVersTrimestreId;
    // 🆕 Beta 95
    window.executerMigrationsBeta95 = executerMigrationsBeta95;
    window.migrerHoraireVersMultiCours = migrerHoraireVersMultiCours;
    // 🆕 Beta 95.1
    window.executerMigrationsBeta951 = executerMigrationsBeta951;
    window.migrerSeancesVersPeriodes = migrerSeancesVersPeriodes;
    window.migrerPresencesVersPeriodes = migrerPresencesVersPeriodes;
}
