/* ===============================
   MODULE: DONNÉES DE DÉMONSTRATION
   [Chantier 2 — 6 fev 2026] Réécriture complète

   La démo est une ROUTE, pas un mode.
   Entrée : entrerEnDemo() → charge données, active trimestre demo, bandeau
   Sortie  : quitterDemo() → nettoie tout, restaure état précédent
   Sécurité: nettoyerResiduDemo() au démarrage si crash pendant la demo
   =============================== */

(function() {
'use strict';

// ============================================
// CARTE MENTALE DÉMO (alignement pédagogique)
// ============================================

var CARTE_DEMO_ALIGNEMENT = {
    index: {
        active: 'carte_1',
        compteurCartes: 1,
        cartes: [{ id: 'carte_1', nom: 'Écriture et littérature (démo)', dateCreation: '2026-02-17T00:00:00.000Z' }]
    },
    cartes: {
        'carte_1': {
            compteur: 14,
            compteurLiens: 14,
            modeIndividuel: null,
            noeuds: [
                // Compétence
                { id: 'noeud_1', type: 'competence', titre: 'Analyser des textes littéraires en reconnaissant les procédés utilisés et en rendant compte de sa compréhension dans une analyse littéraire', description: '', x: 5200, y: 3000, parent: null, enfants: [], metadata: { niveauCognitif: 'analyser' }, cloneSourceId: null },
                // 3 Idées maîtresses
                { id: 'noeud_2', type: 'idee-maitresse', titre: 'Les procédés littéraires sont des outils que l\u2019auteur utilise intentionnellement pour produire un effet sur le lecteur', description: '', x: 4900, y: 3200, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_3', type: 'idee-maitresse', titre: 'L\u2019analyse littéraire repose sur une méthode structurée qui relie observation, interprétation et argumentation', description: '', x: 5200, y: 3200, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_4', type: 'idee-maitresse', titre: 'La qualité de la langue est indissociable de la qualité de l\u2019analyse', description: '', x: 5500, y: 3200, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
                // Séquence
                { id: 'noeud_5', type: 'sequence', titre: 'Séquence 1 — L\u2019analyse littéraire', description: '', x: 4900, y: 3420, parent: null, enfants: ['noeud_6', 'noeud_7'], metadata: {}, cloneSourceId: null },
                // Leçon 1 (dans séquence)
                { id: 'noeud_6', type: 'lecon', titre: 'Leçon 1 — Lire et observer le texte', description: '', x: 4930, y: 3490, parent: 'noeud_5', enfants: ['noeud_8', 'noeud_9', 'noeud_10'], metadata: {}, cloneSourceId: null },
                // Leçon 2 (dans séquence)
                { id: 'noeud_7', type: 'lecon', titre: 'Leçon 2 — Rédiger l\u2019analyse', description: '', x: 5330, y: 3490, parent: 'noeud_5', enfants: ['noeud_11', 'noeud_12', 'noeud_13'], metadata: {}, cloneSourceId: null },
                // Contenu Leçon 1
                { id: 'noeud_8', type: 'factuelle', titre: 'Les procédés stylistiques (figures de style, champs lexicaux, tonalités)', description: '', x: 4950, y: 3560, parent: 'noeud_6', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_9', type: 'procedurale', titre: 'Appliquer une méthode d\u2019annotation efficace', description: '', x: 4950, y: 3640, parent: 'noeud_6', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_10', type: 'activite', titre: 'Atelier d\u2019annotation guidée', description: '', x: 4950, y: 3720, parent: 'noeud_6', enfants: [], metadata: {}, cloneSourceId: null },
                // Contenu Leçon 2
                { id: 'noeud_11', type: 'factuelle', titre: 'La structure de l\u2019analyse littéraire (introduction, développement, conclusion)', description: '', x: 5350, y: 3560, parent: 'noeud_7', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_12', type: 'procedurale', titre: 'Rédiger un paragraphe argumentatif avec preuve textuelle', description: '', x: 5350, y: 3640, parent: 'noeud_7', enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'noeud_13', type: 'activite', titre: 'Rédaction d\u2019un paragraphe de développement', description: '', x: 5350, y: 3720, parent: 'noeud_7', enfants: [], metadata: {}, cloneSourceId: null },
                // Évaluation
                { id: 'noeud_14', type: 'evaluation', titre: 'Analyse littéraire (rédaction finale)', description: '', x: 5200, y: 3900, parent: null, enfants: [], metadata: {}, cloneSourceId: null }
            ],
            liens: [
                // Compétence → Idées maîtresses
                { id: 'lien_1', source: 'noeud_1', cible: 'noeud_2', type: 'se_decline_en' },
                { id: 'lien_2', source: 'noeud_1', cible: 'noeud_3', type: 'se_decline_en' },
                { id: 'lien_3', source: 'noeud_1', cible: 'noeud_4', type: 'se_decline_en' },
                // Idées maîtresses → Leçons
                { id: 'lien_4', source: 'noeud_2', cible: 'noeud_6', type: 'se_concretise_dans' },
                { id: 'lien_5', source: 'noeud_3', cible: 'noeud_6', type: 'se_concretise_dans' },
                { id: 'lien_6', source: 'noeud_3', cible: 'noeud_7', type: 'se_concretise_dans' },
                { id: 'lien_7', source: 'noeud_4', cible: 'noeud_7', type: 'se_concretise_dans' },
                // Connaissances → Activités
                { id: 'lien_8', source: 'noeud_8', cible: 'noeud_10', type: 's_acquiert_par' },
                { id: 'lien_9', source: 'noeud_9', cible: 'noeud_10', type: 's_acquiert_par' },
                { id: 'lien_10', source: 'noeud_11', cible: 'noeud_13', type: 's_acquiert_par' },
                { id: 'lien_11', source: 'noeud_12', cible: 'noeud_13', type: 's_acquiert_par' },
                // Idées maîtresses → Évaluation
                { id: 'lien_12', source: 'noeud_2', cible: 'noeud_14', type: 'se_verifie_par' },
                { id: 'lien_13', source: 'noeud_3', cible: 'noeud_14', type: 'se_verifie_par' },
                { id: 'lien_14', source: 'noeud_4', cible: 'noeud_14', type: 'se_verifie_par' }
            ]
        }
    }
};

// ============================================
// SAUVEGARDE / RESTAURATION ÉTAT
// ============================================

/**
 * Sauvegarde l'état utilisateur avant d'entrer en démo
 * (trimestre actif, infoCours, groupeCoursActif, mode)
 */
function sauvegarderEtatAvantDemo() {
    const etat = {
        infoCours: db.getSync('infoCours', null),
        groupeCoursActif: db.getSync('groupeCoursActif', null),
        modeApplication: db.getSync('modeApplication', 'normal'),
        modalitesEvaluation: db.getSync('modalitesEvaluation', null)
    };

    // Trouver le trimestre actif actuel
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif === true);
    etat.trimestreActifId = trimestreActif?.id || null;

    db.setSync('demo-etat-precedent', etat);
    console.log('[Demo] État sauvegardé:', {
        trimestre: etat.trimestreActifId,
        cours: etat.infoCours?.id,
        gc: etat.groupeCoursActif?.id,
        mode: etat.modeApplication
    });
}

/**
 * Restaure l'état utilisateur après la démo
 */
async function restaurerEtatApresDemo() {
    const etat = db.getSync('demo-etat-precedent', null);
    if (!etat) {
        console.warn('[Demo] Aucun état précédent à restaurer');
        return;
    }

    // Restaurer le trimestre actif
    if (etat.trimestreActifId) {
        if (typeof changerTrimestreActif === 'function') {
            await changerTrimestreActif(etat.trimestreActifId);
        }
    }

    // Restaurer infoCours et groupeCoursActif
    if (etat.infoCours) {
        db.setSync('infoCours', etat.infoCours);
    } else {
        db.removeSync('infoCours');
    }

    if (etat.groupeCoursActif) {
        db.setSync('groupeCoursActif', etat.groupeCoursActif);
    } else {
        db.removeSync('groupeCoursActif');
    }

    // Restaurer modalitesEvaluation
    if (etat.modalitesEvaluation) {
        db.setSync('modalitesEvaluation', etat.modalitesEvaluation);
    }

    // Restaurer le mode (forcer normal si c'était simulation)
    const mode = (etat.modeApplication === 'simulation') ? 'normal' : (etat.modeApplication || 'normal');
    db.setSync('modeApplication', mode);

    // Nettoyer l'état sauvegardé
    db.removeSync('demo-etat-precedent');

    console.log('[Demo] État restauré:', {
        trimestre: etat.trimestreActifId,
        cours: etat.infoCours?.id,
        mode: mode
    });
}

// ============================================
// ENTRÉE EN DÉMO
// ============================================

/**
 * Orchestre l'entrée complète en mode démo
 * Appelé par le bouton "Explorer la démo"
 */
async function entrerEnDemo() {
    // Guard: déjà en démo — si on est sur la page d'accueil, c'est un résidu
    if (db.getSync('demo-actif', null) === 'true') {
        // Vérifier si on est réellement en démo (bandeau visible) ou si c'est un résidu
        var bandeau = document.getElementById('bandeau-demo');
        if (bandeau && bandeau.style.display !== 'none') {
            console.log('[Demo] Déjà en mode démo');
            return;
        }
        // Résidu d'une session crashée — nettoyer et continuer
        console.log('[Demo] Résidu détecté, nettoyage avant re-entrée...');
        db.setSync('demo-actif', null);
        db.setSync('demo-chargees', null);
    }

    console.log('🎬 [Demo] Entrée en mode démo...');

    try {
        // 1. Sauvegarder l'état actuel
        sauvegarderEtatAvantDemo();

        // 2. Activer le flag démo
        db.setSync('demo-actif', 'true');

        // 2b. Forcer un chargement frais (évite les flags stale après crash/refresh)
        db.setSync('demo-chargees', null);

        // 3. Charger les données demo (crée trimestre + merge données)
        const success = await chargerDonneesDemo();
        if (!success) {
            console.error('[Demo] Échec chargement données, rollback');
            db.setSync('demo-actif', null);
            db.removeSync('demo-etat-precedent');
            return;
        }

        // 3b. Vérifier que les données sont bien chargées
        const etudiantsVerif = db.getSync('demo_groupeEtudiants', null);
        if (!etudiantsVerif || !Array.isArray(etudiantsVerif) || etudiantsVerif.length === 0) {
            console.error('[Demo] ❌ Données demo_groupeEtudiants absentes après chargement!');
            console.log('[Demo] Tentative IndexedDB → localStorage sync...');
            await db.syncToLocalStorageCache();
            // Re-vérifier après sync
            const etudiantsRetry = db.getSync('demo_groupeEtudiants', []);
            console.log(`[Demo] Après sync: ${etudiantsRetry.length} étudiants`);
        } else {
            console.log(`[Demo] ✅ ${etudiantsVerif.length} étudiants vérifiés dans demo_groupeEtudiants`);
        }

        // 4. Activer le trimestre demo
        if (typeof changerTrimestreActif === 'function') {
            await changerTrimestreActif('demo');
        }

        // 5. Fixer infoCours = cours demo
        const listeCours = db.getSync('listeCours', []);
        const coursDemo = listeCours.find(c => c.id === 'demo-cours');
        if (coursDemo) {
            db.setSync('infoCours', coursDemo);
        }

        // 6. Fixer groupeCoursActif = GC_DEMO
        const cleGC = 'demo_groupesCours';
        const groupesCours = db.getSync(cleGC, []);
        const gcDemo = groupesCours.find(gc => gc.id === 'GC_DEMO');
        if (gcDemo) {
            db.setSync('groupeCoursActif', gcDemo);
        }

        // 7. Forcer le mode normal (pas d'anonymisation pendant la démo par défaut)
        db.setSync('modeApplication', 'normal');
        if (typeof initialiserSystemeModes === 'function') {
            initialiserSystemeModes();
        }

        // 8. Afficher le bandeau démo
        afficherBandeauDemo(true);

        // 9. Rafraîchir le dropdown groupe-cours dans le bandeau
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }

        // 10. Naviguer vers le tableau de bord
        if (typeof afficherSection === 'function') {
            afficherSection('tableau-bord');
        }

        // 11. Rafraîchir le contenu
        if (typeof rafraichirContenuSelonMode === 'function') {
            rafraichirContenuSelonMode();
        }

        console.log('🎬 [Demo] Entrée en mode démo terminée');

    } catch (error) {
        console.error('[Demo] Erreur entrée en démo:', error);
        // Rollback
        db.setSync('demo-actif', null);
        await restaurerEtatApresDemo();
    }
}

// ============================================
// SORTIE DE DÉMO
// ============================================

/**
 * Orchestre la sortie complète du mode démo
 * Appelé par le bouton "Quitter la démo" dans le bandeau
 */
async function quitterDemo() {
    console.log('🏁 [Demo] Sortie du mode démo...');

    try {
        // 1. Décharger les données demo (supprime demo_* + globaux)
        await dechargerDonneesDemo();

        // 2. Désactiver le flag démo
        db.setSync('demo-actif', null);

        // 3. Masquer le bandeau + retirer encarts de guidage
        afficherBandeauDemo(false);
        if (typeof retirerGuidageDemo === 'function') retirerGuidageDemo();

        // 4. Restaurer l'état précédent
        await restaurerEtatApresDemo();

        // 5. Réinitialiser le système de modes (met à jour sélecteur)
        if (typeof initialiserSystemeModes === 'function') {
            initialiserSystemeModes();
        }

        // 6. Rafraîchir le dropdown groupe-cours dans le bandeau
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }

        // 7. Naviguer vers le tableau de bord
        if (typeof afficherSection === 'function') {
            afficherSection('tableau-bord');
        }

        // 8. Rafraîchir le contenu
        if (typeof rafraichirContenuSelonMode === 'function') {
            rafraichirContenuSelonMode();
        }

        console.log('🏁 [Demo] Sortie du mode démo terminée');

    } catch (error) {
        console.error('[Demo] Erreur sortie de démo:', error);
        // Forcer le nettoyage même en cas d'erreur
        db.setSync('demo-actif', null);
        afficherBandeauDemo(false);
    }
}

// ============================================
// NETTOYAGE AU DÉMARRAGE (FILET DE SÉCURITÉ)
// ============================================

/**
 * Nettoie les résidus de démo si l'application a crashé pendant la démo
 * Appelé au démarrage par main.js
 * @returns {Promise<boolean>} true si des résidus ont été nettoyés
 */
async function nettoyerResiduDemo() {
    const demoActif = db.getSync('demo-actif', null);
    if (demoActif !== 'true') {
        return false;
    }

    console.warn('[Demo] Résidus de démo détectés au démarrage, nettoyage...');

    try {
        // Décharger les données
        await dechargerDonneesDemo();

        // Désactiver le flag
        db.setSync('demo-actif', null);

        // Restaurer l'état précédent si disponible
        await restaurerEtatApresDemo();

        console.log('[Demo] Résidus nettoyés avec succès');
        return true;

    } catch (error) {
        console.error('[Demo] Erreur nettoyage résidus:', error);
        // Forcer le flag off même en cas d'erreur
        db.setSync('demo-actif', null);
        db.removeSync('demo-etat-precedent');
        return true;
    }
}

// ============================================
// UI : BANDEAU DÉMO
// ============================================

/**
 * Affiche ou masque le bandeau démo en bas de l'écran
 * @param {boolean} show - true pour afficher, false pour masquer
 */
function afficherBandeauDemo(show) {
    const bandeau = document.getElementById('bandeau-demo');
    if (bandeau) {
        toggleDisplay(bandeau, show);
    }

    // Ajouter/retirer le padding en bas du body
    if (show) {
        document.body.classList.add('mode-demo');
    } else {
        document.body.classList.remove('mode-demo');
    }
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

/**
 * Charge les données de démonstration dans le namespace demo_
 * Crée le trimestre demo si nécessaire, fusionne les données du pack
 * @returns {Promise<boolean>} True si succès, false sinon
 */
async function chargerDonneesDemo() {
    try {
        console.log('📦 [Demo] Chargement des données de démonstration...');

        // Vérifier si déjà chargées
        if (db.getSync('demo-chargees', null) === 'true') {
            console.log('   ℹ️ Données demo déjà chargées');
            return true;
        }

        // Obtenir le pack de données
        let packDemo = null;
        if (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) {
            packDemo = PACK_DEMARRAGE;
        } else {
            console.error('   ❌ PACK_DEMARRAGE non disponible');
            return false;
        }

        console.log(`   → Pack: ${packDemo.groupeEtudiants?.length || 0} étudiants, ${packDemo.listeCours?.length || 0} cours`);

        // Créer le trimestre demo s'il n'existe pas
        const trimestres = db.getSync('trimestres', []);
        const indexDemo = trimestres.findIndex(t => t.id === 'demo');
        const trimestreDemo = {
            id: 'demo',
            nom: 'Démonstration',
            session: 'D',
            annee: '2025',
            actif: false,   // changerTrimestreActif('demo') l'activera proprement
            isDemo: true
        };

        if (indexDemo >= 0) {
            trimestres[indexDemo] = trimestreDemo;
        } else {
            trimestres.push(trimestreDemo);
        }
        db.setSync('trimestres', trimestres);

        // Fusionner avec les données existantes (préfixe demo_ explicite)
        fusionnerDonneesDemo(packDemo, 'demo_');

        // [Chantier 2] Charger cadreCalendrier et horaireHebdo (manquants dans fusionnerDonneesDemo)
        if (packDemo.cadreCalendrier) {
            db.setSync('demo_cadreCalendrier', packDemo.cadreCalendrier);
            console.log('   ➜ demo_cadreCalendrier chargé');
        }
        if (packDemo.horaireHebdo) {
            db.setSync('demo_horaireHebdo', packDemo.horaireHebdo);
            console.log('   ➜ demo_horaireHebdo chargé');
        }

        // [Chantier 2] Sauvegarder et écraser modalitesEvaluation (clé globale)
        if (packDemo.modalitesEvaluation) {
            db.setSync('modalitesEvaluation', packDemo.modalitesEvaluation);
            console.log('   ➜ modalitesEvaluation demo écrasé');
        }

        // Carte mentale démo (alignement pédagogique)
        db.setSync('demo_planification_mindmap', CARTE_DEMO_ALIGNEMENT);
        console.log('   ➜ demo_planification_mindmap chargée');

        // Marquer comme chargées
        db.setSync('demo-chargees', 'true');

        console.log('   ✅ Données demo chargées avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur chargement données demo:', error);
        return false;
    }
}

// ============================================
// FUSION DES DONNÉES (RÉUTILISÉ TEL QUEL)
// ============================================

/**
 * Fusionne les données demo avec les données existantes
 * @param {Object} packDemo - Données du pack de démonstration
 * @param {string} prefixe - Préfixe de clé explicite (ex: 'demo_') pour éviter race condition avec cle()
 */
function fusionnerDonneesDemo(packDemo, prefixe) {
    // Helper pour construire la clé sans dépendre de cle() (évite race condition)
    const cleDemo = (nom) => prefixe ? prefixe + nom : cle(nom);
    // 1. Fusionner listeCours
    const listeCours = db.getSync('listeCours', []);
    const coursDemo = packDemo.listeCours || [];

    // Ajouter les cours demo s'ils n'existent pas déjà
    for (const cours of coursDemo) {
        const existe = listeCours.some(c => c.id === cours.id);
        if (!existe) {
            // ✅ Marquer comme demo pour identification visuelle
            cours.isDemo = true;
            listeCours.push(cours);
        }
    }
    db.setSync('listeCours', listeCours);
    console.log('   ➜ listeCours fusionnée');

    // 2. Fusionner groupeEtudiants
    const cleEtudiants = cleDemo('groupeEtudiants');
    console.log(`   📦 Clé étudiants: ${cleEtudiants}`);
    const groupeEtudiants = db.getSync(cleEtudiants, []);
    const etudiantsDemo = packDemo.groupeEtudiants || [];

    for (const etudiant of etudiantsDemo) {
        etudiant.isDemo = true;
        const index = groupeEtudiants.findIndex(e => e.da === etudiant.da);
        if (index >= 0) {
            groupeEtudiants[index] = etudiant;
        } else {
            groupeEtudiants.push(etudiant);
        }
    }
    db.setSync(cleEtudiants, groupeEtudiants);
    console.log(`   ➜ ${cleEtudiants} fusionné (${etudiantsDemo.length} étudiants demo)`);

    // 3. Fusionner productions
    if (packDemo.productions) {
        const cleProductions = cleDemo('productions');
        console.log(`   📦 Clé productions: ${cleProductions}`);
        const productions = db.getSync(cleProductions, []);
        const productionsDemo = packDemo.productions || [];

        for (const prod of productionsDemo) {
            prod.estDemo = true;
            const index = productions.findIndex(p => p.id === prod.id);
            if (index >= 0) {
                productions[index] = prod;
            } else {
                productions.push(prod);
            }
        }
        db.setSync(cleProductions, productions);
        console.log(`   ➜ ${cleProductions} fusionnées (${productionsDemo.length} productions demo)`);
    }

    // 4. Fusionner evaluations (evaluationsSauvegardees)
    const evaluationsDemo = packDemo.evaluationsSauvegardees || packDemo.evaluations || [];
    if (evaluationsDemo.length > 0) {
        const cleEvaluations = cleDemo('evaluationsSauvegardees');
        console.log(`   📦 Clé évaluations: ${cleEvaluations}`);
        const evaluations = db.getSync(cleEvaluations, []);

        for (const evalDemo of evaluationsDemo) {
            const index = evaluations.findIndex(e => e.id === evalDemo.id);
            if (index >= 0) {
                evaluations[index] = evalDemo;
            } else {
                evaluations.push(evalDemo);
            }
        }
        db.setSync(cleEvaluations, evaluations);
        console.log(`   ➜ ${cleEvaluations} fusionnées (${evaluationsDemo.length} évaluations demo)`);
    }

    // 5. Fusionner grilles (si présentes)
    if (packDemo.grillesTemplates) {
        const grilles = db.getSync('grillesTemplates', []);
        const grillesDemo = packDemo.grillesTemplates || [];

        for (const grille of grillesDemo) {
            grille.estDemo = true;
            const index = grilles.findIndex(g => g.id === grille.id);
            if (index >= 0) {
                grilles[index] = grille;
            } else {
                grilles.push(grille);
            }
        }
        db.setSync('grillesTemplates', grilles);
        console.log('   ➜ grillesTemplates fusionnées');
    }

    // 6. Fusionner échelles (si présentes)
    const echellesDemo = packDemo.echellesTemplates || packDemo.echellesPerformance || [];
    if (echellesDemo.length > 0) {
        const echelles = db.getSync('echellesTemplates', []);

        for (const echelle of echellesDemo) {
            echelle.estDemo = true;
            const index = echelles.findIndex(e => e.id === echelle.id);
            if (index >= 0) {
                echelles[index] = echelle;
            } else {
                echelles.push(echelle);
            }
        }
        db.setSync('echellesTemplates', echelles);
        console.log(`   ➜ echellesTemplates fusionnées (${echellesDemo.length} ajoutées)`);
    }

    // 7. Fusionner présences (si présentes)
    if (packDemo.presences) {
        const clePresences = cleDemo('presences');
        console.log(`   📦 Clé présences: ${clePresences}`);
        let presences = db.getSync(clePresences, []);
        if (!Array.isArray(presences)) presences = [];
        const presencesDemo = packDemo.presences || {};

        // Convertir format Object {date: {da: data}} → Array [{date, da, ...}]
        for (const [date, presDate] of Object.entries(presencesDemo)) {
            for (const [da, pres] of Object.entries(presDate)) {
                const existe = presences.some(p => p.date === date && p.da === da);
                if (!existe) {
                    presences.push({
                        date: date,
                        da: da,
                        ...pres,
                        estDemo: true
                    });
                }
            }
        }
        db.setSync(clePresences, presences);
        console.log(`   ➜ ${clePresences} fusionnées (${presences.length} entrées)`);
    }

    // 8. Fusionner cartouches (clés cartouches_*)
    const clesCartouches = Object.keys(packDemo).filter(k => k.startsWith('cartouches_'));
    for (const cleCartouche of clesCartouches) {
        const cartouchesDemo = packDemo[cleCartouche] || [];
        if (cartouchesDemo.length > 0) {
            const cartouches = db.getSync(cleCartouche, []);

            for (const cartouche of cartouchesDemo) {
                const existe = cartouches.some(c => c.id === cartouche.id);
                if (!existe) {
                    cartouche.estDemo = true;
                    cartouches.push(cartouche);
                }
            }
            db.setSync(cleCartouche, cartouches);
            console.log(`   ➜ ${cleCartouche} fusionnées (${cartouchesDemo.length} ajoutées)`);
        }
    }

    // 9. Créer un horaire demo (s'il n'existe pas)
    const cleHoraires = cleDemo('horaires');
    console.log(`   📦 Clé horaires: ${cleHoraires}`);
    let horaires = db.getSync(cleHoraires, []);
    const horaireDemo = horaires.find(h => h.id === 'HOR_DEMO');

    let horaireId = 'HOR_DEMO';
    if (!horaireDemo) {
        const nouvelHoraire = {
            id: 'HOR_DEMO',
            nom: 'Lun-AM / Mer-PM',
            periodesParSeance: 2,
            seances: [
                { jour: 'lundi', periode: 'AM' },
                { jour: 'mercredi', periode: 'PM' }
            ],
            isDemo: true,
            dateCreation: new Date().toISOString()
        };
        horaires.push(nouvelHoraire);
        db.setSync(cleHoraires, horaires);
        console.log(`   ➜ Horaire demo créé: ${nouvelHoraire.nom}`);
    } else {
        console.log('   ➜ Horaire demo déjà existant');
    }

    // 10. Créer un groupe-cours demo (s'il n'existe pas)
    const cleGC = cleDemo('groupesCours');
    console.log(`   📦 Clé groupesCours: ${cleGC}`);
    let groupesCours = db.getSync(cleGC, []);
    const gcDemo = groupesCours.find(gc => gc.id === 'GC_DEMO');

    if (!gcDemo) {
        const premierCoursDemo = packDemo.listeCours?.[0];
        const coursId = premierCoursDemo?.id || '601-101-h2026-9999';
        const groupeNum = premierCoursDemo?.groupe || '9999';
        const sigle = premierCoursDemo?.sigle || '601-101';

        const nouveauGC = {
            id: 'GC_DEMO',
            nom: `DEMO-${sigle}-MQ-${groupeNum.toString().padStart(5, '0')} (Lun-AM / Mer-PM)`,
            trimestreId: 'demo',
            coursId: coursId,
            groupeNum: groupeNum,
            horaireId: horaireId,
            enseignantId: 'profil',
            pratiqueId: null,
            dateCreation: new Date().toISOString(),
            actif: true,
            isDemo: true
        };
        groupesCours.push(nouveauGC);
        db.setSync(cleGC, groupesCours);
        console.log(`   ➜ Groupe-cours demo créé: ${nouveauGC.nom}`);
    } else {
        console.log('   ➜ Groupe-cours demo déjà existant');
    }
}

// ============================================
// DÉCHARGEMENT DES DONNÉES
// ============================================

/**
 * Décharge toutes les données de démonstration
 * Nettoie les clés namespacées (demo_*) ET les globaux (grilles, échelles, cartouches, cours)
 * @returns {Promise<boolean>} True si succès, false sinon
 */
async function dechargerDonneesDemo() {
    try {
        console.log('🗑️ [Demo] Déchargement des données de démonstration...');

        // 1. Supprimer les données namespacées demo_*
        await supprimerDonneesNamespaceesDemo();

        // 2. Supprimer les données GLOBALES injectées par la démo
        await supprimerDonneesGlobalesDemo();

        // 3. Supprimer le trimestre demo de la liste des trimestres
        // 🔧 FIX: Écrire aux deux storages pour éviter résidus après rechargement
        const trimestres = db.getSync('trimestres', []);
        const trimSansDemo = trimestres.filter(t => t.id !== 'demo');
        db.setSync('trimestres', trimSansDemo);
        await db.set('trimestres', trimSansDemo);
        console.log('   ➜ Trimestre demo supprimé de la liste');

        // 4. Marquer comme non chargées
        db.setSync('demo-chargees', null);

        // 5. Synchroniser
        await db.syncToLocalStorageCache();

        console.log('   ✅ Données demo déchargées avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur déchargement données demo:', error);
        return false;
    }
}

/**
 * Supprime les données namespacées demo_* (étudiants, productions, évaluations, présences, etc.)
 */
async function supprimerDonneesNamespaceesDemo() {
    const prefixe = 'demo_';
    const clesNamespacees = [
        'groupeEtudiants', 'productions', 'evaluationsSauvegardees',
        'presences', 'horaires', 'groupesCours',
        'indicesAssiduiteDetailles', 'indicesCP', 'indicesAssiduite',
        'calendrierComplet', 'snapshots',
        'cadreCalendrier', 'horaireHebdo',
        'planification_mindmap'
    ];

    for (const cle of clesNamespacees) {
        db.removeSync(prefixe + cle);   // 🔧 FIX: Nettoyer localStorage immédiatement
        await db.remove(prefixe + cle); // Nettoyer IndexedDB
    }
    console.log(`   ➜ ${clesNamespacees.length} clés demo_* supprimées (localStorage + IndexedDB)`);

    // Supprimer la clé snapshots avec suffixe groupe-cours démo (demo_snapshots_GC_DEMO)
    db.removeSync('demo_snapshots_GC_DEMO');
    await db.remove('demo_snapshots_GC_DEMO');
    console.log('   ➜ demo_snapshots_GC_DEMO supprimée');

    // Nettoyage générique : supprimer TOUTE clé commençant par demo_ dans IndexedDB
    try {
        const toutesCles = await db.keys();
        const clesDemoRestantes = toutesCles.filter(c => c.startsWith('demo_'));
        for (const cleDemo of clesDemoRestantes) {
            db.removeSync(cleDemo);
            await db.remove(cleDemo);
        }
        if (clesDemoRestantes.length > 0) {
            console.log(`   ➜ ${clesDemoRestantes.length} clé(s) demo_* résiduelles supprimées`);
        }
    } catch (e) {
        console.warn('   ⚠️ Nettoyage générique demo_* impossible:', e.message);
    }
}

/**
 * Supprime les données GLOBALES injectées par la démo
 * (cours, grilles, échelles, cartouches marqués estDemo/isDemo)
 */
async function supprimerDonneesGlobalesDemo() {
    // 🔧 FIX: Lire depuis localStorage (source de vérité synchrone) et écrire aux deux

    // Cours demo (listeCours est globale)
    const listeCours = db.getSync('listeCours', []);
    const coursFiltres = listeCours.filter(c => !c.isDemo);
    db.setSync('listeCours', coursFiltres);
    await db.set('listeCours', coursFiltres);
    console.log(`   ➜ Cours demo supprimés (${listeCours.length - coursFiltres.length})`);

    // Grilles demo (grillesTemplates est globale)
    const grilles = db.getSync('grillesTemplates', []);
    const grillesFiltrees = grilles.filter(g => !g.estDemo);
    db.setSync('grillesTemplates', grillesFiltrees);
    await db.set('grillesTemplates', grillesFiltrees);
    console.log(`   ➜ Grilles demo supprimées (${grilles.length - grillesFiltrees.length})`);

    // Échelles demo (echellesTemplates est globale)
    const echelles = db.getSync('echellesTemplates', []);
    const echellesFiltrees = echelles.filter(e => !e.estDemo);
    db.setSync('echellesTemplates', echellesFiltrees);
    await db.set('echellesTemplates', echellesFiltrees);
    console.log(`   ➜ Échelles demo supprimées (${echelles.length - echellesFiltrees.length})`);

    // Cartouches demo (clés cartouches_* sont globales)
    const cartouchesDemo = db.getSync('cartouches_GRILLE_DEMO', []);
    if (cartouchesDemo.length > 0) {
        db.removeSync('cartouches_GRILLE_DEMO');
        await db.remove('cartouches_GRILLE_DEMO');
        console.log('   ➜ cartouches_GRILLE_DEMO supprimées');
    }
}

// ============================================
// UTILITAIRES EXISTANTS (CONSERVÉS)
// ============================================

/**
 * Vérifie si les données demo sont chargées
 * @returns {boolean} True si chargées, false sinon
 */
function sontDonnesDemoChargees() {
    return db.getSync('demo-chargees', null) === 'true';
}

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le module des données demo
 * [Chantier 2] Plus d'auto-chargement sur mode simulation
 * Le nettoyage des résidus est géré par main.js
 */
function initialiserModuleDonneesDemo() {
    console.log('🔄 [Demo] Module Données Demo initialisé');

    // Afficher le bandeau si déjà en mode démo (rechargement de page)
    if (db.getSync('demo-actif', null) === 'true') {
        afficherBandeauDemo(true);
    }
}

// ============================================
// EXPORTS
// ============================================

window.entrerEnDemo = entrerEnDemo;
window.quitterDemo = quitterDemo;
window.nettoyerResiduDemo = nettoyerResiduDemo;
window.chargerDonneesDemo = chargerDonneesDemo;
window.dechargerDonneesDemo = dechargerDonneesDemo;
window.sontDonnesDemoChargees = sontDonnesDemoChargees;
window.afficherBandeauDemo = afficherBandeauDemo;
window.initialiserModuleDonneesDemo = initialiserModuleDonneesDemo;


})();
