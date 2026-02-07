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
    // Guard: déjà en démo
    if (db.getSync('demo-actif', null) === 'true') {
        console.log('[Demo] Déjà en mode démo');
        return;
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

        // 9. Naviguer vers le tableau de bord
        if (typeof afficherSection === 'function') {
            afficherSection('tableau-bord');
        }

        // 10. Rafraîchir le contenu
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

        // 6. Naviguer vers le tableau de bord
        if (typeof afficherSection === 'function') {
            afficherSection('tableau-bord');
        }

        // 7. Rafraîchir le contenu
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
        const trimestres = await db.get('trimestres') || [];
        const indexDemo = trimestres.findIndex(t => t.id === 'demo');
        const trimestreDemo = {
            id: 'demo',
            nom: 'Démonstration',
            session: 'D',
            annee: '2025',
            actif: true,
            isDemo: true
        };

        if (indexDemo >= 0) {
            trimestres[indexDemo] = trimestreDemo;
        } else {
            trimestres.push(trimestreDemo);
        }
        await db.set('trimestres', trimestres);
        await db.syncToLocalStorageCache();

        // Fusionner avec les données existantes (préfixe demo_ explicite)
        await fusionnerDonneesDemo(packDemo, 'demo_');

        // [Chantier 2] Charger cadreCalendrier et horaireHebdo (manquants dans fusionnerDonneesDemo)
        if (packDemo.cadreCalendrier) {
            await db.set('demo_cadreCalendrier', packDemo.cadreCalendrier);
            console.log('   ➜ demo_cadreCalendrier chargé');
        }
        if (packDemo.horaireHebdo) {
            await db.set('demo_horaireHebdo', packDemo.horaireHebdo);
            console.log('   ➜ demo_horaireHebdo chargé');
        }

        // [Chantier 2] Sauvegarder et écraser modalitesEvaluation (clé globale)
        if (packDemo.modalitesEvaluation) {
            db.setSync('modalitesEvaluation', packDemo.modalitesEvaluation);
            console.log('   ➜ modalitesEvaluation demo écrasé');
        }

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
async function fusionnerDonneesDemo(packDemo, prefixe) {
    // Helper pour construire la clé sans dépendre de cle() (évite race condition)
    const cleDemo = (nom) => prefixe ? prefixe + nom : cle(nom);
    // 1. Fusionner listeCours
    const listeCours = await db.get('listeCours') || [];
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
    await db.set('listeCours', listeCours);
    console.log('   ➜ listeCours fusionnée');

    // 2. Fusionner groupeEtudiants
    const cleEtudiants = cleDemo('groupeEtudiants');
    console.log(`   📦 Clé étudiants: ${cleEtudiants}`);
    const groupeEtudiants = await db.get(cleEtudiants) || [];
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
    await db.set(cleEtudiants, groupeEtudiants);
    console.log(`   ➜ ${cleEtudiants} fusionné (${etudiantsDemo.length} étudiants demo)`);

    // 3. Fusionner productions
    if (packDemo.productions) {
        const cleProductions = cleDemo('productions');
        console.log(`   📦 Clé productions: ${cleProductions}`);
        const productions = await db.get(cleProductions) || [];
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
        await db.set(cleProductions, productions);
        console.log(`   ➜ ${cleProductions} fusionnées (${productionsDemo.length} productions demo)`);
    }

    // 4. Fusionner evaluations (evaluationsSauvegardees)
    const evaluationsDemo = packDemo.evaluationsSauvegardees || packDemo.evaluations || [];
    if (evaluationsDemo.length > 0) {
        const cleEvaluations = cleDemo('evaluationsSauvegardees');
        console.log(`   📦 Clé évaluations: ${cleEvaluations}`);
        const evaluations = await db.get(cleEvaluations) || [];

        for (const evalDemo of evaluationsDemo) {
            const index = evaluations.findIndex(e => e.id === evalDemo.id);
            if (index >= 0) {
                evaluations[index] = evalDemo;
            } else {
                evaluations.push(evalDemo);
            }
        }
        await db.set(cleEvaluations, evaluations);
        console.log(`   ➜ ${cleEvaluations} fusionnées (${evaluationsDemo.length} évaluations demo)`);
    }

    // 5. Fusionner grilles (si présentes)
    if (packDemo.grillesTemplates) {
        const grilles = await db.get('grillesTemplates') || [];
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
        await db.set('grillesTemplates', grilles);
        console.log('   ➜ grillesTemplates fusionnées');
    }

    // 6. Fusionner échelles (si présentes)
    const echellesDemo = packDemo.echellesTemplates || packDemo.echellesPerformance || [];
    if (echellesDemo.length > 0) {
        const echelles = await db.get('echellesTemplates') || [];

        for (const echelle of echellesDemo) {
            echelle.estDemo = true;
            const index = echelles.findIndex(e => e.id === echelle.id);
            if (index >= 0) {
                echelles[index] = echelle;
            } else {
                echelles.push(echelle);
            }
        }
        await db.set('echellesTemplates', echelles);
        console.log(`   ➜ echellesTemplates fusionnées (${echellesDemo.length} ajoutées)`);
    }

    // 7. Fusionner présences (si présentes)
    if (packDemo.presences) {
        const clePresences = cleDemo('presences');
        console.log(`   📦 Clé présences: ${clePresences}`);
        let presences = await db.get(clePresences) || [];
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
        await db.set(clePresences, presences);
        console.log(`   ➜ ${clePresences} fusionnées (${presences.length} entrées)`);
    }

    // 8. Fusionner cartouches (clés cartouches_*)
    const clesCartouches = Object.keys(packDemo).filter(k => k.startsWith('cartouches_'));
    for (const cleCartouche of clesCartouches) {
        const cartouchesDemo = packDemo[cleCartouche] || [];
        if (cartouchesDemo.length > 0) {
            const cartouches = await db.get(cleCartouche) || [];

            for (const cartouche of cartouchesDemo) {
                const existe = cartouches.some(c => c.id === cartouche.id);
                if (!existe) {
                    cartouche.estDemo = true;
                    cartouches.push(cartouche);
                }
            }
            await db.set(cleCartouche, cartouches);
            console.log(`   ➜ ${cleCartouche} fusionnées (${cartouchesDemo.length} ajoutées)`);
        }
    }

    // 9. Créer un horaire demo (s'il n'existe pas)
    const cleHoraires = cleDemo('horaires');
    console.log(`   📦 Clé horaires: ${cleHoraires}`);
    let horaires = await db.get(cleHoraires) || [];
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
        await db.set(cleHoraires, horaires);
        console.log(`   ➜ Horaire demo créé: ${nouvelHoraire.nom}`);
    } else {
        console.log('   ➜ Horaire demo déjà existant');
    }

    // 10. Créer un groupe-cours demo (s'il n'existe pas)
    const cleGC = cleDemo('groupesCours');
    console.log(`   📦 Clé groupesCours: ${cleGC}`);
    let groupesCours = await db.get(cleGC) || [];
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
        await db.set(cleGC, groupesCours);
        console.log(`   ➜ Groupe-cours demo créé: ${nouveauGC.nom}`);
    } else {
        console.log('   ➜ Groupe-cours demo déjà existant');
    }

    // Synchroniser vers localStorage cache
    await db.syncToLocalStorageCache();
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
        const trimestres = await db.get('trimestres') || [];
        const trimSansDemo = trimestres.filter(t => t.id !== 'demo');
        await db.set('trimestres', trimSansDemo);
        console.log('   ➜ Trimestre demo supprimé de la liste');

        // 4. Nettoyer les clés spécifiques demo
        await db.remove('demo_cadreCalendrier');
        await db.remove('demo_horaireHebdo');
        console.log('   ➜ Clés demo supplémentaires nettoyées');

        // 5. Marquer comme non chargées
        db.setSync('demo-chargees', null);

        // 6. Synchroniser
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
        'calendrierComplet', 'snapshots'
    ];

    for (const cle of clesNamespacees) {
        await db.remove(prefixe + cle);
    }
    console.log(`   ➜ ${clesNamespacees.length} clés demo_* supprimées`);
}

/**
 * Supprime les données GLOBALES injectées par la démo
 * (cours, grilles, échelles, cartouches marqués estDemo/isDemo)
 */
async function supprimerDonneesGlobalesDemo() {
    // Cours demo (listeCours est globale)
    const listeCours = await db.get('listeCours') || [];
    const coursFiltres = listeCours.filter(c => !c.isDemo);
    await db.set('listeCours', coursFiltres);
    console.log(`   ➜ Cours demo supprimés (${listeCours.length - coursFiltres.length})`);

    // Grilles demo (grillesTemplates est globale)
    const grilles = await db.get('grillesTemplates') || [];
    const grillesFiltrees = grilles.filter(g => !g.estDemo);
    await db.set('grillesTemplates', grillesFiltrees);
    console.log(`   ➜ Grilles demo supprimées (${grilles.length - grillesFiltrees.length})`);

    // Échelles demo (echellesTemplates est globale)
    const echelles = await db.get('echellesTemplates') || [];
    const echellesFiltrees = echelles.filter(e => !e.estDemo);
    await db.set('echellesTemplates', echellesFiltrees);
    console.log(`   ➜ Échelles demo supprimées (${echelles.length - echellesFiltrees.length})`);

    // Cartouches demo (clés cartouches_* sont globales)
    // Identifier les clés cartouches qui contiennent des entrées demo
    // On nettoie spécifiquement cartouches_GRILLE_DEMO (connue du pack)
    const cartouchesDemo = await db.get('cartouches_GRILLE_DEMO') || [];
    if (cartouchesDemo.length > 0) {
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
