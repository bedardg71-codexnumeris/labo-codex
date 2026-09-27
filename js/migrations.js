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
    // Fraîche installation — rien à migrer, silent.
    if (!Array.isArray(etudiants) || etudiants.length === 0) return 0;

    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        // Étudiants présents mais aucun cours actif — anomalie réelle, on warne.
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
    // Fraîche installation — rien à migrer, silent.
    if (!Array.isArray(productions) || productions.length === 0) return 0;

    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        // Productions présentes mais aucun cours actif — anomalie réelle.
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
    // Fraîche installation — rien à migrer, silent.
    // Les présences peuvent être un objet ({date: {...}}) ou un tableau.
    const videPresences = !presences ||
        (Array.isArray(presences) && presences.length === 0) ||
        (typeof presences === 'object' && !Array.isArray(presences) && Object.keys(presences).length === 0);
    if (videPresences) return 0;

    const cours = db.getSync('listeCours', []);
    const coursActif = cours.find(c => c.actif) || cours[0];

    if (!coursActif) {
        // Présences enregistrées mais aucun cours actif — anomalie réelle.
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
    const resultats = {
        etudiants: migrerEtudiantsVersCoursId(),
        productions: migrerProductionsVersCoursId(),
        presences: migrerPresencesVersCoursId(),
        cours: migrerCoursVersTrimestreId()
    };

    const total = Object.values(resultats).reduce((sum, n) => sum + (n || 0), 0);

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
    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);
    if (!trimestreActif) {
        return { nbCoursMigres: 0, nbSeancesGenerees: 0 };
    }

    // Obtenir les cours du trimestre actif
    const listeCours = db.getSync('listeCours', []);
    const coursTrimestreActif = listeCours.filter(c => c.trimestreId === trimestreActif.id);
    if (coursTrimestreActif.length === 0) {
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
        return { nbCoursMigres: 0, nbSeancesGenerees: 0 };
    }

    // Copier l'horaire vers chaque cours qui n'en a pas encore
    let nbCoursMigres = 0;
    coursTrimestreActif.forEach(cours => {
        const cleHoraireCours = `seancesHoraire_${cours.id}`;
        const horaireExistant = db.getSync(cleHoraireCours, null);

        if (!horaireExistant || horaireExistant.length === 0) {
            // Copier l'horaire global vers ce cours
            db.setSync(cleHoraireCours, horaireGlobal);
            nbCoursMigres++;
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
    const resultats = {
        horaires: migrerHoraireVersMultiCours()
    };

    const total = resultats.horaires.nbCoursMigres || 0;

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
    const listeCours = db.getSync('listeCours', []);
    if (listeCours.length === 0) {
        return { nbSeancesMigrees: 0, nbCoursMigres: 0 };
    }

    // Obtenir la durée de période (défaut: 55 min) — clé SSOT du domaine
    // horaire depuis le Lot 0 #328 (l'ancien champ legacy des modalités
    // d'évaluation est purgé au Lot 3)
    const dureePeriode = db.getSync(cle('dureePeriode'), null) || (window.DUREE_PERIODE_DEFAUT || 50);

    let nbSeancesMigrees = 0;
    let nbCoursMigres = 0;

    listeCours.forEach(cours => {
        // Migrer l'horaire du cours
        const cleHoraireCours = `seancesHoraire_${cours.id}`;
        const seancesHoraire = db.getSync(cleHoraireCours, []);
        let modified = false;

        // #540 lot E2 (26 août 2026) — CETTE MIGRATION NE DEVINE PLUS.
        //
        // Elle convertissait `duree` (heures) en périodes par une division. Or une
        // période comprend sa pause — 50 minutes d'enseignement plus 10 de pause ici,
        // 55 plus 5 ailleurs : diviser par la seule durée d'enseignement gonflait le
        // compte dès la troisième période, et 4 heures d'horloge rendaient 5 périodes.
        // Ce nombre étant le dénominateur de l'assiduité, la migration ÉCRIVAIT un faux
        // en base, à chaque démarrage, pour toute séance qui n'avait qu'une durée.
        //
        // Depuis E1, `nombrePeriodes` est une donnée SAISIE. Une séance qui ne le porte
        // pas reste incomplète — l'écran Horaire le DIT (« N sans nombre de périodes »)
        // et l'utilisateur la complète en la voyant. Un dénominateur absent qui se
        // remarque vaut mieux qu'un dénominateur faux qui passe inaperçu.
        //
        // ⚠ CE QUE CELA NE RÉPARE PAS : les `nombrePeriodes` que les exécutions
        // PASSÉES ont déjà écrits. Ils sont en base, potentiellement gonflés, et rien
        // ici ne les corrige — les corriger demanderait de savoir ce que `duree`
        // signifiait, ce que personne ne peut dire après coup.
        void dureePeriode;

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
                // #540 lot E2 : même raison qu'au-dessus — le cache ne se remplit plus
                // d'un nombre déduit. Il se régénère depuis l'horaire
                // (`genererSeancesCompletes`), qui propage désormais `nombrePeriodes`.
                void seancesDuJour;
            }
        });

        if (Object.keys(seancesCompletes).length > 0) {
            db.setSync(cleSeancesCompletes, seancesCompletes);
        }
    });

    if (nbSeancesMigrees > 0) {
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
    // Obtenir la durée de période (défaut: 55 min) — clé SSOT du domaine
    // horaire depuis le Lot 0 #328 (l'ancien champ legacy des modalités
    // d'évaluation est purgé au Lot 3)
    const dureePeriode = db.getSync(cle('dureePeriode'), null) || (window.DUREE_PERIODE_DEFAUT || 50);

    // Lire les présences (utiliser clé namespacée si disponible)
    const clePresences = cle('presences');
    const presences = db.getSync(clePresences, []);

    if (!Array.isArray(presences) || presences.length === 0) {
        return 0;
    }

    let nbMigrees = 0;

    presences.forEach(presence => {
        // #540 lot E2 : les présences FACULTATIVES (interventions RàI) sont exclues.
        // Leur champ `heures` porte en réalité des PÉRIODES — `interventions.js` y écrit
        // `intervention.duree`, dont le libellé de saisie est « Durée (périodes) ». Les
        // convertir revenait à diviser des périodes par une durée de période. L'écart
        // restait petit, donc plausible, donc invisible : c'est exactement la forme de
        // faux qui survit le plus longtemps.
        if (presence.facultatif === true) return;

        if (presence.heures !== undefined && presence.periodesPresentes === undefined) {
            // Conversion légitime, celle-ci : `heures` est écrit par la saisie comme
            // `periodesPresentes × dureePeriode / 60`. On refait l'aller-retour avec le
            // même diviseur, donc on retombe sur la valeur d'origine quel que soit son
            // réglage. Ce n'est pas une mesure de temps d'horloge.
            presence.periodesPresentes = Math.round((presence.heures * 60) / dureePeriode);
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        db.setSync(clePresences, presences);
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
    const resultats = {
        seances: migrerSeancesVersPeriodes(),
        presences: migrerPresencesVersPeriodes()
    };

    const totalSeances = resultats.seances.nbSeancesMigrees || 0;
    const totalPresences = resultats.presences || 0;
    const total = totalSeances + totalPresences;

    return resultats;
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
    const listeCours = db.getSync('listeCours', []);
    const enseignantsExistants = db.getSync('enseignants', []);

    if (enseignantsExistants.length > 0) {
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
            const id = genererIdUnique('ENS_');
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
    const listeCours = db.getSync('listeCours', []);
    const coursExistants = db.getSync('cours', []);

    if (coursExistants.length > 0) {
        return { nbCoursExtraits: 0, mapAncienNouvel: {} };
    }

    // Map pour éviter les doublons: clé = codeCours
    const coursMap = new Map();

    listeCours.forEach(ancienCours => {
        const codeCours = ancienCours.sigle || ancienCours.codeCours || ancienCours.code || '';

        if (!codeCours) return;

        // Si ce code cours existe déjà, ne pas dupliquer
        if (!coursMap.has(codeCours)) {
            const id = genererIdUnique('COURS_');
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
    const listeCours = db.getSync('listeCours', []);
    // 🆕 FIX (1er fév 2026) : Utiliser cle() pour namespacing (horaires est dans CLES_NAMESPACEES)
    const cleHoraires = cle('horaires');
    const horairesExistants = db.getSync(cleHoraires, []);

    if (horairesExistants.length > 0) {
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
            const id = genererIdUnique('HOR_');

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
    const listeCours = db.getSync('listeCours', []);
    const trimestres = db.getSync('trimestres', []);

    let nbTotal = 0;

    // Traiter chaque trimestre
    for (const trimestre of trimestres) {
        const coursTrimmestre = listeCours.filter(c => c.trimestreId === trimestre.id);
        const cleGC = `${trimestre.id}_groupesCours`;
        const groupesCoursExistants = db.getSync(cleGC, []);

        if (groupesCoursExistants.length > 0) {
            continue;
        }

        const groupesCours = [];

        coursTrimmestre.forEach(ancienCours => {
            const gcId = genererIdUnique('GC_');

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
    // Vérifier si déjà migré
    if (db.getSync('migrationBeta96Effectuee', false)) {
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
                nbMigres += anciennes.length;
            } else {
                // Fusionner : ajouter celles qui manquent
                const idsExistants = new Set(existantes.map(p => p.id));
                const nouvelles = anciennes.filter(p => !idsExistants.has(p.id));
                if (nouvelles.length > 0) {
                    db.setSync(nouvelleCle, [...existantes, ...nouvelles]);
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
            nbMigres += nue.length;
        }
    }

    db.setSync('migrationCleProductionsFaite', true);
    return nbMigres;
}

/**
 * #374 (relais Cadre→Trimestre, 5 août 2026) — Fusion des deux clés
 * d'événements en UNE : evenementsPrevus + evenementsImprevus →
 * journeesSansCours (par trimestre). La prévisibilité n'est plus une
 * propriété de l'endroit de saisie.
 *
 * SANS flag « fait » : re-scanne à chaque boot (coût : une passe sur les
 * clés localStorage) pour couvrir aussi les codex/archives antérieurs à la
 * fusion, dont l'import réécrit les anciennes clés puis recharge l'app.
 * Idempotente : dédoublonne par id, retire les anciennes clés après fusion.
 */
function migrerJourneesSansCours() {
    let nbMigres = 0;
    // Énumérer les DEUX couches du stockage hybride. Une clé même petite
    // peut vivre UNIQUEMENT dans memoryCache+IndexedDB (bascule silencieuse
    // sur quota localStorage, cf. db.js en-tête) — constaté le 5 août sur le
    // poste réel de Grégoire : localStorage seul ratait ses 2 congés A2026.
    const nomsCles = new Set();
    for (let i = 0; i < localStorage.length; i++) {
        nomsCles.add(localStorage.key(i));
    }
    if (typeof db !== 'undefined' && db.memoryCache && typeof db.memoryCache.keys === 'function') {
        for (const k of db.memoryCache.keys()) nomsCles.add(k);
    }
    const clesAMigrer = [...nomsCles].filter(k => /(^|_)evenements(Prevus|Imprevus)$/.test(k));
    if (clesAMigrer.length === 0) return 0;

    const parPrefixe = {};
    clesAMigrer.forEach(k => {
        const prefixe = k.replace(/evenements(Prevus|Imprevus)$/, '');
        (parPrefixe[prefixe] = parPrefixe[prefixe] || []).push(k);
    });

    Object.keys(parPrefixe).forEach(prefixe => {
        const cleFusion = prefixe + 'journeesSansCours';
        const fusionnes = db.getSync(cleFusion, []);
        const idsVus = new Set(fusionnes.map(e => e && e.id).filter(Boolean));
        // Dédoublonnage par CONTENU en plus de l'id (6 août 2026) : si la
        // fusion arrive en retard (hydratation IndexedDB terminée après la
        // première passe) et que l'utilisateur a déjà RECRÉÉ le même congé à
        // la main, la copie recréée porte un id neuf — l'id seul laisserait
        // entrer un doublon « même jour, même libellé ». Constaté sur les 2
        // congés A2026 de Grégoire, recréés le 6 août.
        const cleContenu = e => e && e.dateEvenement
            ? e.dateEvenement + '|' + String(e.description || '').trim().toLowerCase()
            : null;
        const contenusVus = new Set(fusionnes.map(cleContenu).filter(Boolean));
        // Prévus d'abord : préserve l'ordre de saisie par bloc d'origine
        ['evenementsPrevus', 'evenementsImprevus'].forEach(suffixe => {
            const anciens = db.getSync(prefixe + suffixe, null);
            if (Array.isArray(anciens)) {
                anciens.forEach(evt => {
                    if (!evt) return;
                    if (evt.id && idsVus.has(evt.id)) return;
                    const contenu = cleContenu(evt);
                    if (contenu && contenusVus.has(contenu)) return;
                    if (evt.id) idsVus.add(evt.id);
                    if (contenu) contenusVus.add(contenu);
                    fusionnes.push(evt);
                    nbMigres++;
                });
            }
            db.removeSync(prefixe + suffixe);
        });
        db.setSync(cleFusion, fusionnes);
    });

    if (nbMigres > 0) {
        console.warn('[Migration #374] ' + nbMigres + ' événement(s) fusionné(s) vers journeesSansCours');
    }
    return nbMigres;
}

/**
 * 🆕 Beta 99.01 — Migration des clés sans namespace vers clés namespacées
 * Concerne : indicesPatternsRaI, indicesEvaluation, horaireSelectionne
 * Ces clés étaient stockées sans préfixe trimestre. Cette migration copie
 * les données vers la clé namespacée cle('x') sans supprimer l'ancienne.
 */
function migrerClesSansNamespace() {
    if (typeof cle !== 'function') return 0;

    const clesAMigrer = ['indicesPatternsRaI', 'indicesEvaluation', 'horaireSelectionne'];
    let nbMigrees = 0;

    clesAMigrer.forEach(function(cleBrute) {
        const cleNamespacee = cle(cleBrute);

        // Si la clé namespacée est identique à la clé brute, pas de migration nécessaire
        if (cleNamespacee === cleBrute) return;

        const donneesNues = db.getSync(cleBrute, null);
        const donneesNamespacees = db.getSync(cleNamespacee, null);

        // Migrer seulement si : données nues existent ET clé namespacée vide
        if (donneesNues !== null && donneesNamespacees === null) {
            db.setSync(cleNamespacee, donneesNues);
            nbMigrees++;
            console.warn('[migrations] Clé migrée : ' + cleBrute + ' → ' + cleNamespacee);
        }
    });

    return nbMigrees;
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
    // 🆕 Beta 95.2 - Entités modulaires
    window.executerMigrationsBeta96 = executerMigrationsBeta96;
    // 🆕 Beta 97 - Unification clé productions
    window.migrerCleProductionsPedagogiques = migrerCleProductionsPedagogiques;
    window.migrerJourneesSansCours = migrerJourneesSansCours;
    // 🆕 Beta 99.01 - Clés sans namespace → namespacées
    window.migrerClesSansNamespace = migrerClesSansNamespace;
    window.migrerVersEntiteEnseignants = migrerVersEntiteEnseignants;
    window.migrerVersEntiteCours = migrerVersEntiteCours;
    window.migrerVersEntiteHoraires = migrerVersEntiteHoraires;
    window.migrerVersGroupeCours = migrerVersGroupeCours;
    // 🆕 Beta 99.06 - Renommage description → activiteApprentissage
    window.migrerDescriptionVersActivite = migrerDescriptionVersActivite;
}

/**
 * Migre le champ `description` → `activiteApprentissage` sur les productions.
 * Copie la valeur existante sans supprimer l'ancien champ (rétrocompat exports).
 */
function migrerDescriptionVersActivite() {
    var flag = 'migration_activiteApprentissage';
    if (db.getSync(flag)) return 0;
    var productions = (typeof obtenirDonneesSelonMode === 'function')
        ? obtenirDonneesSelonMode('productions')
        : db.getSync(cle('productions'), []);
    if (!productions || productions.length === 0) { db.setSync(flag, true); return 0; }
    var nb = 0;
    productions.forEach(function(p) {
        if (p.description && !p.activiteApprentissage) {
            p.activiteApprentissage = p.description;
            nb++;
        }
    });
    if (nb > 0) {
        sauvegarderDonneesSelonMode('productions', productions, { discret: true });
        console.warn('[migrations] ' + nb + ' productions : description → activiteApprentissage');
    }
    db.setSync(flag, true);
    return nb;
}


})();
