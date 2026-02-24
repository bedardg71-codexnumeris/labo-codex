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

(function() {
'use strict';

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
    const cleEtudiants = cle('groupeEtudiants');
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
    const cleProductions = cle('productions');
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
    const clePresences = cle('presences');
    const presences = db.getSync(clePresences, []);
    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        console.warn('⚠️ [Migration] Aucun cours actif, impossible de migrer les présences');
        return 0;
    }

    let nbMigres = 0;

    if (Array.isArray(presences)) {
        // Format Array (courant depuis Beta 95)
        presences.forEach(p => {
            if (!p.coursId) {
                p.coursId = coursActif.id;
                nbMigres++;
            }
        });
    } else if (presences && typeof presences === 'object') {
        // Format Object legacy {date: {coursId, ...}}
        Object.keys(presences).forEach(date => {
            if (!presences[date].coursId) {
                presences[date].coursId = coursActif.id;
                nbMigres++;
            }
        });
    }

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
    horaireGlobal = db.getSync(cle('horaireHebdo'), []);

    // Source 2: seancesHoraire namespacé par trimestre
    if (horaireGlobal.length === 0) {
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
    const clePresences = cle('presences');
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

/* ===============================
   ASSISTANT DE MIGRATION LEGACY
   Date: 5 janvier 2026

   Objectif:
   Détecter automatiquement les données legacy (pré-Beta 93.5)
   et proposer une migration guidée vers le format moderne
   =============================== */

/**
 * Détecte si les données stockées sont au format legacy (ancien)
 *
 * Critères de détection:
 * - Présence de clés non namespacées (groupeEtudiants, presences, productions)
 * - Absence de système de trimestres
 * - Flag de migration non présent
 *
 * @returns {Object} { isLegacy, details }
 */
function detecterDonneesLegacy() {
    // Déjà migré ?
    if (db.getSync('migrationLegacyEffectuee', false)) {
        return { isLegacy: false, details: 'Migration déjà effectuée' };
    }

    // Beta 96.2: Détecter si des données namespacées existent (format moderne)
    // Si oui, marquer automatiquement la migration comme effectuée
    const trimestres = db.getSync('trimestres', []);
    if (trimestres.length > 0) {
        // Vérifier si au moins un trimestre a des données namespacées
        for (const t of trimestres) {
            const cleTest = `${t.id}_groupeEtudiants`;
            const cleTest2 = `${t.id}_groupesCours`;
            if (db.getSync(cleTest, null) !== null || db.getSync(cleTest2, null) !== null) {
                // Données namespacées détectées → marquer migration effectuée
                console.log(`✅ [Migration] Données namespacées détectées (${t.id}), migration non nécessaire`);
                db.setSync('migrationLegacyEffectuee', true);
                return { isLegacy: false, details: 'Données namespacées détectées' };
            }
        }
    }

    // Vérifier la présence du système de trimestres
    const listeCours = db.getSync('listeCours', []);

    // Clés legacy typiques (non namespacées)
    const clesLegacy = [
        'groupeEtudiants',
        'presences',
        'productions',
        'seancesHoraire',
        'horaireHebdo',
        'modalitesEvaluation',
        'infoCours'
    ];

    // Compter les clés legacy présentes avec des données
    let clesLegacyPresentes = [];
    clesLegacy.forEach(cle => {
        const valeur = db.getSync(cle, null);
        if (valeur !== null) {
            // Vérifier que ce n'est pas vide
            if (Array.isArray(valeur) && valeur.length > 0) {
                clesLegacyPresentes.push(cle);
            } else if (typeof valeur === 'object' && Object.keys(valeur).length > 0) {
                clesLegacyPresentes.push(cle);
            } else if (typeof valeur === 'string' && valeur.length > 0) {
                clesLegacyPresentes.push(cle);
            }
        }
    });

    // Conditions pour être considéré legacy:
    // 1. Pas de trimestres OU pas de cours
    // 2. Au moins 2 clés legacy avec des données
    const pasDeSystemeTrimestres = trimestres.length === 0 || listeCours.length === 0;
    const aDonneesLegacy = clesLegacyPresentes.length >= 2;

    if (pasDeSystemeTrimestres && aDonneesLegacy) {
        return {
            isLegacy: true,
            details: {
                clesDetectees: clesLegacyPresentes,
                nbCles: clesLegacyPresentes.length,
                trimestres: trimestres.length,
                cours: listeCours.length
            }
        };
    }

    return { isLegacy: false, details: 'Format moderne détecté' };
}

/**
 * Affiche le modal d'assistant de migration legacy
 *
 * @param {Object} detailsLegacy - Détails des données legacy détectées
 */
function afficherModalMigrationLegacy(detailsLegacy) {
    const nbCles = detailsLegacy.nbCles || 0;

    const modalHTML = `
        <div id="modalMigrationLegacy" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10001;
             align-items: center; justify-content: center;">
            <div style="background: var(--surface-conteneur, #162c36); border-radius: 12px; padding: 30px; max-width: 580px;
                 width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">

                <!-- Icône et titre -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🔄</div>
                    <h2 style="margin: 0; color: var(--texte-secondaire); font-size: 1.4rem;">
                        Mise à jour de tes données
                    </h2>
                </div>

                <!-- Contexte : pourquoi cette migration -->
                <div style="background: var(--bleu-tres-pale); border-radius: 8px; padding: 18px; margin-bottom: 18px;">
                    <p style="margin: 0; font-size: 0.95rem; line-height: 1.6; color: var(--gris-fonce);">
                        L'application Monitorage a beaucoup évolué récemment pour mieux répondre aux
                        besoins des enseignants. Pour profiter de toutes les nouvelles fonctionnalités,
                        tes données doivent être réorganisées une seule fois.
                    </p>
                </div>

                <!-- Ce qui change -->
                <div style="background: var(--bleu-pale); border-radius: 8px; padding: 18px; margin-bottom: 18px;">
                    <p style="margin: 0 0 10px 0; font-size: 0.95rem;">
                        <strong>Ce qui change :</strong>
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.6;">
                        <li>Gestion de plusieurs <strong>trimestres</strong> (archivage automatique)</li>
                        <li>Support de plusieurs <strong>cours-groupes</strong> par trimestre</li>
                        <li>Comptage en <strong>périodes</strong> (configurable)</li>
                    </ul>
                </div>

                <!-- Ce qui va se passer -->
                <div style="background: var(--gris-tres-pale); border-left: 4px solid var(--bleu-moyen);
                     padding: 15px; margin-bottom: 18px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 0.95rem;">
                        <strong>📋 ${nbCles} ensemble(s) de données détecté(s)</strong>
                    </p>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--gris-moyen);">
                        La migration va créer un trimestre à partir de tes données actuelles.
                        <strong>Aucune donnée ne sera perdue.</strong>
                    </p>
                </div>

                <!-- Rassurant -->
                <div style="background: var(--alerte-fond-succes, #d4edda); border-radius: 8px; padding: 12px; margin-bottom: 18px;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--alerte-texte-succes);">
                        ✅ <strong>Rassure-toi :</strong> Cette opération est automatique et ne prendra
                        que quelques secondes. C'est une opération ponctuelle qui ne devrait pas se reproduire.
                    </p>
                </div>

                <!-- Avertissement export -->
                <div style="background: var(--alerte-fond-attention); border-radius: 8px; padding: 12px; margin-bottom: 22px;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--gris-fonce);">
                        💡 <strong>Conseil :</strong> Si tu préfères, exporte d'abord tes données
                        (Réglages → Export localStorage) avant de continuer.
                    </p>
                </div>

                <!-- Boutons -->
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="reporterMigrationLegacy()"
                            style="padding: 12px 24px; background: var(--surface-conteneur, #162c36); color: var(--gris-fonce);
                                   border: 1px solid var(--gris-clair); border-radius: 6px;
                                   cursor: pointer; font-size: 0.95rem;">
                        Plus tard
                    </button>
                    <button onclick="executerMigrationLegacy()"
                            style="padding: 12px 28px; background: var(--bleu-moyen); color: white;
                                   border: none; border-radius: 6px; cursor: pointer;
                                   font-size: 1rem; font-weight: 500;">
                        Migrer mes données
                    </button>
                </div>
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.id = 'containerMigrationLegacy';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
}

/**
 * Ferme le modal de migration legacy
 */
function fermerModalMigrationLegacy() {
    const container = document.getElementById('containerMigrationLegacy');
    if (container) {
        container.remove();
    }
}

/**
 * Reporter la migration (l'utilisateur choisit "Plus tard")
 * On ne redemande pas pendant cette session
 */
function reporterMigrationLegacy() {
    fermerModalMigrationLegacy();
    // Flag de session pour ne pas redemander
    window._migrationLegacyReportee = true;
    console.log('⏸️ Migration legacy reportée par l\'utilisateur');
}

/**
 * Exécute la migration complète des données legacy vers le format moderne
 *
 * Étapes:
 * 1. Créer un trimestre par défaut
 * 2. Créer un cours par défaut
 * 3. Copier les données vers les clés namespacées
 * 4. Exécuter les migrations progressives
 * 5. Marquer comme migré
 */
async function executerMigrationLegacy() {
    console.log('🚀 [Migration Legacy] Démarrage...');

    try {
        // 1. CRÉER LE TRIMESTRE
        const maintenant = new Date();
        const mois = maintenant.getMonth(); // 0-11
        const annee = maintenant.getFullYear();

        // Déterminer la session (H: jan-mai, A: août-déc)
        let session, sessionLettre;
        if (mois >= 0 && mois <= 4) {
            session = 'Hiver';
            sessionLettre = 'h';
        } else if (mois >= 7 && mois <= 11) {
            session = 'Automne';
            sessionLettre = 'a';
        } else {
            session = 'Été';
            sessionLettre = 'e';
        }

        const trimestreId = sessionLettre + annee; // ex: "h2026"

        const nouveauTrimestre = {
            id: trimestreId,
            nom: `${session} ${annee}`,
            session: session,
            annee: annee,
            actif: true,
            dateCreation: maintenant.toISOString()
        };

        // Sauvegarder le trimestre
        db.setSync('trimestres', [nouveauTrimestre]);
        db.setSync('trimestreActif', trimestreId);
        console.log(`   ✅ Trimestre créé: ${nouveauTrimestre.nom} (${trimestreId})`);

        // 2. CRÉER UN COURS PAR DÉFAUT
        // Essayer de récupérer infoCours legacy pour les infos
        const infoCours = db.getSync('infoCours', {});
        const sigle = infoCours.sigle || '000-000-XX';
        const titre = infoCours.titre || 'Mon cours';
        const groupe = infoCours.groupe || '01';

        const coursId = `${sigle.toLowerCase().replace(/\s/g, '-')}-${sessionLettre}${annee}-${groupe}`;

        const nouveauCours = {
            id: coursId,
            sigle: sigle,
            titre: titre,
            groupe: groupe,
            session: session.charAt(0).toUpperCase(), // 'H', 'A', 'E'
            annee: annee,
            trimestreId: trimestreId,
            actif: true,
            dateCreation: maintenant.toISOString()
        };

        db.setSync('listeCours', [nouveauCours]);
        console.log(`   ✅ Cours créé: ${sigle} gr.${groupe} (${coursId})`);

        // 3. COPIER LES DONNÉES VERS LES CLÉS NAMESPACÉES
        // Préfixe pour ce trimestre
        const prefixe = trimestreId + '_';

        // Fonction helper pour copier une clé
        const copierVersNamespace = (cleSource, cleDestSuffix) => {
            const valeur = db.getSync(cleSource, null);
            if (valeur !== null) {
                const cleNamespacee = prefixe + cleDestSuffix;
                db.setSync(cleNamespacee, valeur);
                console.log(`   📦 ${cleSource} → ${cleNamespacee}`);
                return true;
            }
            return false;
        };

        // Copier les données principales
        copierVersNamespace('groupeEtudiants', 'groupeEtudiants');
        copierVersNamespace('presences', 'presences');
        copierVersNamespace('productions', 'productions');
        copierVersNamespace('horaireHebdo', 'horaireHebdo');
        copierVersNamespace('seancesHoraire', 'seancesHoraire');
        copierVersNamespace('evaluations', 'evaluations');
        copierVersNamespace('notesEtudiants', 'notesEtudiants');

        // Copier aussi vers la clé spécifique au cours (horaire)
        const horaireGlobal = db.getSync('seancesHoraire', null) || db.getSync('horaireHebdo', null);
        if (horaireGlobal) {
            db.setSync(`seancesHoraire_${coursId}`, horaireGlobal);
            console.log(`   📦 Horaire → seancesHoraire_${coursId}`);
        }

        // 4. EXÉCUTER LES MIGRATIONS PROGRESSIVES
        console.log('   🔄 Exécution des migrations progressives...');

        // Beta 93.5 : Ajouter coursId
        migrerEtudiantsVersCoursId();
        migrerProductionsVersCoursId();
        migrerPresencesVersCoursId();
        migrerCoursVersTrimestreId();

        // Beta 95 : Horaires multi-cours
        migrerHoraireVersMultiCours();

        // Beta 95.1 : Périodes
        migrerSeancesVersPeriodes();
        migrerPresencesVersPeriodes();

        // 5. MARQUER COMME MIGRÉ
        db.setSync('migrationLegacyEffectuee', true);
        db.setSync('migrationLegacyDate', maintenant.toISOString());
        db.setSync('migrationLegacyVersion', 'Beta 95.1');

        console.log('✅ [Migration Legacy] Terminée avec succès !');

        // Fermer le modal
        fermerModalMigrationLegacy();

        // Notification et rechargement
        alert(`Migration réussie !\n\nTes données ont été organisées pour le trimestre "${nouveauTrimestre.nom}".\n\nL'application va se recharger.`);

        location.reload();

    } catch (erreur) {
        console.error('❌ [Migration Legacy] Erreur:', erreur);
        alert('Erreur lors de la migration.\n\n' + erreur.message + '\n\nTes données n\'ont pas été modifiées.');
    }
}

/**
 * Vérifie au démarrage si une migration legacy est nécessaire
 * et propose le modal si oui
 *
 * Appelé depuis main.js après le chargement de db.js
 */
function verifierEtProposerMigrationLegacy() {
    // Ne pas vérifier si déjà reporté cette session
    if (window._migrationLegacyReportee) {
        return;
    }

    const detection = detecterDonneesLegacy();

    if (detection.isLegacy) {
        console.log('🔍 [Migration] Données legacy détectées:', detection.details);

        // Petit délai pour laisser l'interface se charger
        setTimeout(() => {
            afficherModalMigrationLegacy(detection.details);
        }, 500);
    } else {
        console.log('✅ [Migration] Données au format moderne');
    }
}

/* ===============================
   MIGRATIONS BETA 95.2 : ENTITÉS MODULAIRES
   Date: 6 janvier 2026

   Objectif:
   Migrer de l'architecture monolithique vers les entités modulaires:
   - listeCours → cours (infos générales)
   - listeCours → enseignants (profil auteur)
   - listeCours → horaires (séances)
   - listeCours + références → groupesCours (assemblage)
   =============================== */

/**
 * Migration 8: Extraire les enseignants de listeCours vers l'entité Enseignants
 *
 * @returns {Object} { nbEnseignantsExtraits, mapAncienNouvel }
 */
async function migrerVersEntiteEnseignants() {
    console.log('🔄 [Migration Beta 95.2] Extraction des enseignants...');

    const listeCours = db.getSync('listeCours', []);
    const enseignantsExistants = db.getSync('enseignants', []);

    if (enseignantsExistants.length > 0) {
        console.log('   ⚠️ Des enseignants existent déjà, migration non nécessaire');
        return { nbEnseignantsExtraits: 0, mapAncienNouvel: {} };
    }

    // Map pour éviter les doublons: clé = prenom_nom_courriel
    const enseignantsMap = new Map();

    listeCours.forEach(cours => {
        // Extraire les infos enseignant des différentes propriétés possibles
        const prenom = cours.prenomEnseignant || cours.auteur_prenom || '';
        const nom = cours.nomEnseignant || cours.auteur_nom || '';
        const courriel = cours.courriel || cours.courrielEnseignant || cours.email_auteur || '';
        const institution = cours.institution || cours.institutionEnseignant || '';
        const departement = cours.departement || cours.departementEnseignant || '';
        const discipline = cours.discipline || '';

        // Ignorer si pas de nom
        if (!prenom && !nom) return;

        const cle = `${prenom.toLowerCase()}_${nom.toLowerCase()}_${courriel.toLowerCase()}`;

        if (!enseignantsMap.has(cle)) {
            const id = 'ENS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            enseignantsMap.set(cle, {
                id: id,
                prenom: prenom,
                nom: nom,
                courriel: courriel,
                institution: institution,
                departement: departement || discipline,
                siteWeb: cours.siteWeb || cours.site_auteur || '',
                niveau: cours.niveau || 'Collégial',
                dateCreation: new Date().toISOString(),
                dateModification: new Date().toISOString(),
                // Garder référence aux anciens cours pour le mapping
                _anciensCoursIds: [cours.id]
            });
        } else {
            // Ajouter ce cours à la liste des cours de cet enseignant
            const ens = enseignantsMap.get(cle);
            if (!ens._anciensCoursIds.includes(cours.id)) {
                ens._anciensCoursIds.push(cours.id);
            }
        }
    });

    // Créer le mapping ancien coursId → nouvel enseignantId
    const mapAncienNouvel = {};
    enseignantsMap.forEach(ens => {
        ens._anciensCoursIds.forEach(coursId => {
            mapAncienNouvel[coursId] = ens.id;
        });
        // Supprimer la propriété temporaire
        delete ens._anciensCoursIds;
    });

    // Sauvegarder les enseignants
    const enseignantsArray = Array.from(enseignantsMap.values());
    if (enseignantsArray.length > 0) {
        db.setSync('enseignants', enseignantsArray);
        console.log(`   ✅ ${enseignantsArray.length} enseignant(s) extrait(s)`);
    }

    return {
        nbEnseignantsExtraits: enseignantsArray.length,
        mapAncienNouvel: mapAncienNouvel
    };
}

/**
 * Migration 9: Extraire les infos cours vers l'entité Cours
 *
 * @returns {Object} { nbCoursExtraits, mapAncienNouvel }
 */
async function migrerVersEntiteCours() {
    console.log('🔄 [Migration Beta 95.2] Extraction des cours (infos générales)...');

    const listeCours = db.getSync('listeCours', []);
    const coursExistants = db.getSync('cours', []);

    if (coursExistants.length > 0) {
        console.log('   ⚠️ Des cours existent déjà, migration non nécessaire');
        return { nbCoursExtraits: 0, mapAncienNouvel: {} };
    }

    // Map pour éviter les doublons: clé = codeCours
    const coursMap = new Map();

    listeCours.forEach(ancienCours => {
        const codeCours = ancienCours.sigle || ancienCours.codeCours || ancienCours.code || '';

        if (!codeCours) return;

        // Si ce code cours existe déjà, ne pas dupliquer
        if (!coursMap.has(codeCours)) {
            const id = 'COURS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            coursMap.set(codeCours, {
                id: id,
                codeCours: codeCours,
                nomCours: ancienCours.titre || ancienCours.nomCours || '',
                discipline: ancienCours.discipline || '',
                numeroCompetence: ancienCours.numeroCompetence || ancienCours.competenceId || '',
                competence: ancienCours.competence || ancienCours.competenceNom || '',
                elementsCompetence: ancienCours.elementsCompetence || '',
                dateCreation: new Date().toISOString(),
                dateModification: new Date().toISOString(),
                _anciensCoursIds: [ancienCours.id]
            });
        } else {
            // Ajouter ce cours à la liste
            const cours = coursMap.get(codeCours);
            if (!cours._anciensCoursIds.includes(ancienCours.id)) {
                cours._anciensCoursIds.push(ancienCours.id);
            }
        }
    });

    // Créer le mapping ancien coursId → nouveau coursId
    const mapAncienNouvel = {};
    coursMap.forEach(cours => {
        cours._anciensCoursIds.forEach(ancienId => {
            mapAncienNouvel[ancienId] = cours.id;
        });
        delete cours._anciensCoursIds;
    });

    // Sauvegarder les cours
    const coursArray = Array.from(coursMap.values());
    if (coursArray.length > 0) {
        db.setSync('cours', coursArray);
        console.log(`   ✅ ${coursArray.length} cours extrait(s)`);
    }

    return {
        nbCoursExtraits: coursArray.length,
        mapAncienNouvel: mapAncienNouvel
    };
}

/**
 * Migration 10: Extraire les horaires vers l'entité Horaires
 *
 * @returns {Object} { nbHorairesExtraits, mapAncienNouvel }
 */
async function migrerVersEntiteHoraires() {
    console.log('🔄 [Migration Beta 95.2] Extraction des horaires...');

    const listeCours = db.getSync('listeCours', []);
    // 🆕 FIX (1er fév 2026) : Utiliser cle() pour namespacing (horaires est dans CLES_NAMESPACEES)
    const cleHoraires = cle('horaires');
    const horairesExistants = db.getSync(cleHoraires, []);

    if (horairesExistants.length > 0) {
        console.log('   ⚠️ Des horaires existent déjà, migration non nécessaire');
        return { nbHorairesExtraits: 0, mapAncienNouvel: {} };
    }

    const horairesArray = [];
    const mapAncienNouvel = {};

    listeCours.forEach(cours => {
        // Essayer de récupérer l'horaire spécifique au cours
        const cleHoraire = `seancesHoraire_${cours.id}`;
        let seancesHoraire = db.getSync(cleHoraire, null);

        // Si pas d'horaire spécifique, utiliser l'horaire global namespacé
        if (!seancesHoraire && cours.trimestreId) {
            seancesHoraire = db.getSync(`${cours.trimestreId}_seancesHoraire`, null);
        }

        // Si pas encore, essayer l'horaire global
        if (!seancesHoraire) {
            seancesHoraire = db.getSync('seancesHoraire', null);
        }

        // Convertir les séances vers le format de l'entité Horaire
        let seances = [];
        if (seancesHoraire && Array.isArray(seancesHoraire)) {
            seances = seancesHoraire.map(s => ({
                jour: s.jour || 'lundi',
                heureDebut: s.heureDebut || '10:00',
                heureFin: s.heureFin || '12:00'
            }));
        }

        // Créer l'horaire si on a des séances
        if (seances.length > 0 || cours.periodesParSemaine || cours.formatHoraire) {
            const id = 'HOR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

            // Générer un nom basé sur les séances
            let nom = '';
            if (seances.length > 0) {
                const joursAbrev = seances.map(s => {
                    const joursMap = {
                        'lundi': 'Lun', 'mardi': 'Mar', 'mercredi': 'Mer',
                        'jeudi': 'Jeu', 'vendredi': 'Ven', 'samedi': 'Sam', 'dimanche': 'Dim'
                    };
                    return joursMap[s.jour] || s.jour;
                });
                const premiereHeure = seances[0]?.heureDebut?.split(':')[0] || '';
                nom = `${joursAbrev.join('-')} ${premiereHeure}h`;
            } else {
                nom = `Horaire ${cours.sigle || cours.groupe || ''}`;
            }

            const horaire = {
                id: id,
                nom: nom,
                periodesParSemaine: cours.periodesParSemaine || 4,
                formatHoraire: cours.formatHoraire || '2x2',
                local: cours.local || '',
                seances: seances,
                dateCreation: new Date().toISOString(),
                dateModification: new Date().toISOString()
            };

            horairesArray.push(horaire);
            mapAncienNouvel[cours.id] = id;
        }
    });

    // Sauvegarder les horaires
    if (horairesArray.length > 0) {
        db.setSync('horaires', horairesArray);
        console.log(`   ✅ ${horairesArray.length} horaire(s) extrait(s)`);
    }

    return {
        nbHorairesExtraits: horairesArray.length,
        mapAncienNouvel: mapAncienNouvel
    };
}

/**
 * Migration 11: Créer les groupe-cours à partir des mappings
 *
 * @param {Object} mapEnseignants - Mapping coursId → enseignantId
 * @param {Object} mapCours - Mapping coursId → nouveauCoursId
 * @param {Object} mapHoraires - Mapping coursId → horaireId
 * @returns {Object} { nbGroupeCoursCreés }
 */
async function migrerVersGroupeCours(mapEnseignants, mapCours, mapHoraires) {
    console.log('🔄 [Migration Beta 95.2] Création des groupe-cours...');

    const listeCours = db.getSync('listeCours', []);
    const trimestres = db.getSync('trimestres', []);

    let nbTotal = 0;

    // Traiter chaque trimestre
    for (const trimestre of trimestres) {
        const coursTrimmestre = listeCours.filter(c => c.trimestreId === trimestre.id);
        const cleGC = `${trimestre.id}_groupesCours`;
        const groupesCoursExistants = db.getSync(cleGC, []);

        if (groupesCoursExistants.length > 0) {
            console.log(`   ⚠️ ${trimestre.id}: groupe-cours existants, ignoré`);
            continue;
        }

        const groupesCours = [];

        coursTrimmestre.forEach(ancienCours => {
            const gcId = 'GC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

            const groupeCours = {
                id: gcId,
                trimestreId: trimestre.id,
                coursId: mapCours[ancienCours.id] || null,
                enseignantId: mapEnseignants[ancienCours.id] || null,
                horaireId: mapHoraires[ancienCours.id] || null,
                pratiqueId: ancienCours.pratiqueId || null,
                groupe: ancienCours.groupe || '00001',
                actif: ancienCours.actif || false,
                dateCreation: new Date().toISOString(),
                dateModification: new Date().toISOString(),
                // Garder référence à l'ancien cours pour rétrocompatibilité
                _ancienCoursId: ancienCours.id
            };

            groupesCours.push(groupeCours);
            nbTotal++;
        });

        if (groupesCours.length > 0) {
            db.setSync(cleGC, groupesCours);
            console.log(`   ✅ ${trimestre.id}: ${groupesCours.length} groupe-cours créé(s)`);
        }
    }

    return { nbGroupeCoursCreés: nbTotal };
}

/**
 * Exécuter toutes les migrations Beta 95.2
 *
 * @returns {Object} Résultats des migrations
 */
async function executerMigrationsBeta96() {
    console.log('🔄 [Migration] Démarrage migrations Beta 95.2 (entités modulaires)...');

    // Vérifier si déjà migré
    if (db.getSync('migrationBeta96Effectuee', false)) {
        console.log('✅ [Migration] Beta 95.2 déjà effectuée');
        return { deja_effectuee: true };
    }

    try {
        // 1. Extraire les enseignants
        const resultEnseignants = await migrerVersEntiteEnseignants();

        // 2. Extraire les cours
        const resultCours = await migrerVersEntiteCours();

        // 3. Extraire les horaires
        const resultHoraires = await migrerVersEntiteHoraires();

        // 4. Créer les groupe-cours
        const resultGC = await migrerVersGroupeCours(
            resultEnseignants.mapAncienNouvel,
            resultCours.mapAncienNouvel,
            resultHoraires.mapAncienNouvel
        );

        // Marquer comme migré
        db.setSync('migrationBeta96Effectuee', true);
        db.setSync('migrationBeta96Date', new Date().toISOString());

        const resultats = {
            enseignants: resultEnseignants.nbEnseignantsExtraits,
            cours: resultCours.nbCoursExtraits,
            horaires: resultHoraires.nbHorairesExtraits,
            groupesCours: resultGC.nbGroupeCoursCreés
        };

        const total = Object.values(resultats).reduce((a, b) => a + b, 0);

        if (total > 0) {
            console.log(`✅ [Migration] Beta 95.2 terminée:`);
            console.log(`   - Enseignants: ${resultats.enseignants}`);
            console.log(`   - Cours: ${resultats.cours}`);
            console.log(`   - Horaires: ${resultats.horaires}`);
            console.log(`   - Groupe-cours: ${resultats.groupesCours}`);
        } else {
            console.log('✅ [Migration] Aucune migration Beta 95.2 nécessaire (données vides ou déjà migrées)');
        }

        return resultats;

    } catch (err) {
        console.error('❌ [Migration] Erreur Beta 95.2:', err);
        return { erreur: err.message };
    }
}

/**
 * Migration Beta 97 : Unifier clé productions
 * Copie les données de 'productionsPedagogiques' vers 'productions' (clé canonique)
 */
function migrerCleProductionsPedagogiques() {
    if (db.getSync('migrationCleProductionsFaite', false)) return 0;

    let nbMigres = 0;
    const trimestres = db.getSync('trimestresDisponibles', []);
    const prefixes = trimestres.map(t => t.id + '_');
    // Ajouter aussi le trimestre actif au cas où
    const cleActuelle = cle('productionsPedagogiques');
    if (cleActuelle && !prefixes.some(p => cleActuelle.startsWith(p))) {
        prefixes.push(cleActuelle.replace('productionsPedagogiques', ''));
    }

    for (const prefix of prefixes) {
        const ancienneCle = prefix + 'productionsPedagogiques';
        const nouvelleCle = prefix + 'productions';
        const anciennes = db.getSync(ancienneCle, null);
        if (anciennes && Array.isArray(anciennes) && anciennes.length > 0) {
            const existantes = db.getSync(nouvelleCle, []);
            if (!existantes || existantes.length === 0) {
                // Copier vers la nouvelle clé
                db.setSync(nouvelleCle, anciennes);
                console.log(`✅ [Migration] ${ancienneCle} → ${nouvelleCle} (${anciennes.length} productions)`);
                nbMigres += anciennes.length;
            } else {
                // Fusionner : ajouter celles qui manquent
                const idsExistants = new Set(existantes.map(p => p.id));
                const nouvelles = anciennes.filter(p => !idsExistants.has(p.id));
                if (nouvelles.length > 0) {
                    db.setSync(nouvelleCle, [...existantes, ...nouvelles]);
                    console.log(`✅ [Migration] Fusionné ${nouvelles.length} productions de ${ancienneCle} vers ${nouvelleCle}`);
                    nbMigres += nouvelles.length;
                }
            }
        }
    }

    // Aussi vérifier la clé nue (sans préfixe)
    const nue = db.getSync('productionsPedagogiques', null);
    if (nue && Array.isArray(nue) && nue.length > 0) {
        const cleNouv = cle('productions');
        const existantes = db.getSync(cleNouv, []);
        if (!existantes || existantes.length === 0) {
            db.setSync(cleNouv, nue);
            console.log(`✅ [Migration] productionsPedagogiques (nue) → ${cleNouv} (${nue.length})`);
            nbMigres += nue.length;
        }
    }

    if (nbMigres > 0) {
        console.log(`🔄 [Migration] Total : ${nbMigres} productions migrées de productionsPedagogiques → productions`);
    }
    db.setSync('migrationCleProductionsFaite', true);
    return nbMigres;
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
    // 🆕 Beta 95.1 - Assistant migration legacy
    window.detecterDonneesLegacy = detecterDonneesLegacy;
    window.afficherModalMigrationLegacy = afficherModalMigrationLegacy;
    window.fermerModalMigrationLegacy = fermerModalMigrationLegacy;
    window.reporterMigrationLegacy = reporterMigrationLegacy;
    window.executerMigrationLegacy = executerMigrationLegacy;
    window.verifierEtProposerMigrationLegacy = verifierEtProposerMigrationLegacy;
    // 🆕 Beta 95.2 - Entités modulaires
    window.executerMigrationsBeta96 = executerMigrationsBeta96;
    // 🆕 Beta 97 - Unification clé productions
    window.migrerCleProductionsPedagogiques = migrerCleProductionsPedagogiques;
    window.migrerVersEntiteEnseignants = migrerVersEntiteEnseignants;
    window.migrerVersEntiteCours = migrerVersEntiteCours;
    window.migrerVersEntiteHoraires = migrerVersEntiteHoraires;
    window.migrerVersGroupeCours = migrerVersGroupeCours;
}


})();
