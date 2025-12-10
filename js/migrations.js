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
    const etudiants = db.getSync('groupeEtudiants', []);
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
        db.setSync('groupeEtudiants', etudiants);
        console.log(`✅ [Migration] ${nbMigres} étudiant(s) → coursId: ${coursActif.id}`);
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
    const productions = db.getSync('productions', []);
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
        db.setSync('productions', productions);
        console.log(`✅ [Migration] ${nbMigres} production(s) → coursId: ${coursActif.id}`);
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
    const presences = db.getSync('presences', {});
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
        db.setSync('presences', presences);
        console.log(`✅ [Migration] ${nbMigres} date(s) de présences → coursId: ${coursActif.id}`);
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

// Export des fonctions
if (typeof window !== 'undefined') {
    window.executerMigrationsBeta935 = executerMigrationsBeta935;
    window.migrerEtudiantsVersCoursId = migrerEtudiantsVersCoursId;
    window.migrerProductionsVersCoursId = migrerProductionsVersCoursId;
    window.migrerPresencesVersCoursId = migrerPresencesVersCoursId;
    window.migrerCoursVersTrimestreId = migrerCoursVersTrimestreId;
}
