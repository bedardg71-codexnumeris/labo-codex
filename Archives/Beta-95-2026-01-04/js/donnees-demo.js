/* ===============================
   MODULE: DONNÉES DE DÉMONSTRATION
   Gère le chargement et déchargement des données demo (groupe 9999)
   - Chargement automatique en mode Assisté
   - Déchargement en mode Normal/Anonymisé
   - Filtrage transparent dans les modules d'affichage
   =============================== */

/**
 * Charge les données de démonstration
 * Utilise PACK_DEMARRAGE (variable globale) ou fetch() comme fallback
 * @returns {Promise<boolean>} True si succès, false sinon
 */
async function chargerDonneesDemo() {
    try {
        console.log('📦 Chargement des données de démonstration...');

        // Vérifier si déjà chargées
        const demoChargees = localStorage.getItem('demo-chargees');
        if (demoChargees === 'true') {
            console.log('   ℹ️ Données demo déjà chargées');
            return true;
        }

        let packDemo = null;

        // PRIORITÉ 1 : Utiliser la variable globale PACK_DEMARRAGE (fonctionne en mode file://)
        if (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) {
            console.log('   → Utilisation de PACK_DEMARRAGE (variable globale)');
            packDemo = PACK_DEMARRAGE;
        } else {
            // PRIORITÉ 2 : Charger via fetch (nécessite un serveur HTTP)
            try {
                console.log('   → Tentative de chargement pack-demarrage-complet.json...');
                const response = await fetch('pack-demarrage-complet.json');
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                packDemo = await response.json();
                console.log('   ✅ Fichier pack-demarrage-complet.json chargé via fetch');
            } catch (fetchError) {
                console.warn('   ⚠️ fetch() a échoué (mode file:// ?):', fetchError.message);
                console.error('   ❌ Impossible de charger les données demo - PACK_DEMARRAGE non disponible');
                return false;
            }
        }

        if (!packDemo) {
            console.error('   ❌ Aucune source de données demo disponible');
            return false;
        }

        console.log(`   → Contient: ${packDemo.listeCours?.length || 0} cours, ${packDemo.groupeEtudiants?.length || 0} étudiants`);

        // ✅ DÉPLACÉ AVANT FUSION (31 déc 2025) : Activer le trimestre demo d'abord
        // Pour que cle() retourne le préfixe 'demo_' lors de la fusion des données
        // obtenirTrimestreActif() cherche dans le tableau trimestres celui avec actif: true
        const trimestres = await db.get('trimestres') || [];

        // Désactiver tous les trimestres existants
        trimestres.forEach(t => t.actif = false);

        // Ajouter ou mettre à jour le trimestre demo
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
        console.log('   → Trimestre demo activé AVANT fusion');

        // ✅ Activer le cours demo comme cours actif
        // Pour que obtenirDonneesSelonMode() filtre correctement les données
        const coursDemo = packDemo.listeCours?.[0];
        if (coursDemo) {
            await db.set('infoCours', coursDemo);
            console.log(`   → Cours actif défini: ${coursDemo.sigle} (${coursDemo.id})`);
        }

        // Fusionner avec les données existantes (APRÈS activation trimestre)
        console.log('   → Fusion avec données existantes...');
        await fusionnerDonneesDemo(packDemo);

        // Marquer comme chargées
        localStorage.setItem('demo-chargees', 'true');

        console.log('   ✅ Données demo chargées avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur chargement données demo:', error);
        console.error('   → Détails:', error.message);
        return false;
    }
}

/**
 * Fusionne les données demo avec les données existantes
 * @param {Object} packDemo - Données du pack de démonstration
 */
async function fusionnerDonneesDemo(packDemo) {
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
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser cle() pour le namespacing par trimestre
    const cleEtudiants = (typeof window.cle === 'function') ? window.cle('groupeEtudiants') : 'groupeEtudiants';
    console.log(`   📦 Clé étudiants: ${cleEtudiants}`);
    const groupeEtudiants = await db.get(cleEtudiants) || [];
    const etudiantsDemo = packDemo.groupeEtudiants || [];

    for (const etudiant of etudiantsDemo) {
        const existe = groupeEtudiants.some(e => e.da === etudiant.da);
        if (!existe) {
            // ✅ Marquer comme demo pour identification visuelle
            etudiant.isDemo = true;
            groupeEtudiants.push(etudiant);
        }
    }
    await db.set(cleEtudiants, groupeEtudiants);
    console.log(`   ➜ ${cleEtudiants} fusionné (${etudiantsDemo.length} étudiants demo)`);

    // 3. Fusionner productions
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser cle() pour le namespacing par trimestre
    if (packDemo.productions) {
        const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
        console.log(`   📦 Clé productions: ${cleProductions}`);
        const productions = await db.get(cleProductions) || [];
        const productionsDemo = packDemo.productions || [];

        for (const prod of productionsDemo) {
            const existe = productions.some(p => p.id === prod.id);
            if (!existe) {
                productions.push(prod);
            }
        }
        await db.set(cleProductions, productions);
        console.log(`   ➜ ${cleProductions} fusionnées (${productionsDemo.length} productions demo)`);
    }

    // 4. Fusionner evaluations (evaluationsSauvegardees)
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser cle() pour le namespacing par trimestre
    const evaluationsDemo = packDemo.evaluationsSauvegardees || packDemo.evaluations || [];
    if (evaluationsDemo.length > 0) {
        const cleEvaluations = (typeof window.cle === 'function') ? window.cle('evaluationsSauvegardees') : 'evaluationsSauvegardees';
        console.log(`   📦 Clé évaluations: ${cleEvaluations}`);
        const evaluations = await db.get(cleEvaluations) || [];

        for (const evalDemo of evaluationsDemo) {
            const existe = evaluations.some(e => e.id === evalDemo.id);
            if (!existe) {
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
            const existe = grilles.some(g => g.id === grille.id);
            if (!existe) {
                grilles.push(grille);
            }
        }
        await db.set('grillesTemplates', grilles);
        console.log('   ➜ grillesTemplates fusionnées');
    }

    // 6. Fusionner échelles (si présentes)
    // ✅ CORRIGÉ (31 déc 2025) : Le pack utilise echellesTemplates, pas echellesPerformance
    const echellesDemo = packDemo.echellesTemplates || packDemo.echellesPerformance || [];
    if (echellesDemo.length > 0) {
        const echelles = await db.get('echellesTemplates') || [];

        for (const echelle of echellesDemo) {
            const existe = echelles.some(e => e.id === echelle.id);
            if (!existe) {
                echelles.push(echelle);
            }
        }
        await db.set('echellesTemplates', echelles);
        console.log(`   ➜ echellesTemplates fusionnées (${echellesDemo.length} ajoutées)`);
    }

    // 7. Fusionner présences (si présentes)
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser cle() pour le namespacing par trimestre
    if (packDemo.presences) {
        const clePresences = (typeof window.cle === 'function') ? window.cle('presences') : 'presences';
        console.log(`   📦 Clé présences: ${clePresences}`);
        const presences = await db.get(clePresences) || {};
        const presencesDemo = packDemo.presences || {};

        // Fusionner les présences par date
        for (const [date, presDate] of Object.entries(presencesDemo)) {
            if (!presences[date]) {
                presences[date] = {};
            }

            for (const [da, pres] of Object.entries(presDate)) {
                if (!presences[date][da]) {
                    presences[date][da] = pres;
                }
            }
        }
        await db.set(clePresences, presences);
        console.log(`   ➜ ${clePresences} fusionnées`);
    }

    // 8. Fusionner cartouches (clés cartouches_*)
    // ✅ AJOUTÉ (31 déc 2025) : Les cartouches sont stockées par grille
    const clesCartouches = Object.keys(packDemo).filter(k => k.startsWith('cartouches_'));
    for (const cleCartouche of clesCartouches) {
        const cartouchesDemo = packDemo[cleCartouche] || [];
        if (cartouchesDemo.length > 0) {
            const cartouches = await db.get(cleCartouche) || [];

            for (const cartouche of cartouchesDemo) {
                const existe = cartouches.some(c => c.id === cartouche.id);
                if (!existe) {
                    cartouches.push(cartouche);
                }
            }
            await db.set(cleCartouche, cartouches);
            console.log(`   ➜ ${cleCartouche} fusionnées (${cartouchesDemo.length} ajoutées)`);
        }
    }

    // Synchroniser vers localStorage cache
    await db.syncToLocalStorageCache();
}

/**
 * Décharge les données de démonstration (supprime le groupe 9999)
 * @returns {Promise<boolean>} True si succès, false sinon
 */
async function dechargerDonneesDemo() {
    try {
        console.log('🗑️ Déchargement des données de démonstration...');

        // Vérifier si chargées
        const demoChargees = localStorage.getItem('demo-chargees');
        if (demoChargees !== 'true') {
            console.log('   ℹ️ Aucune donnée demo à décharger');
            return true;
        }

        // Supprimer le groupe 9999 de toutes les structures
        await supprimerGroupe9999();

        // ✅ AJOUTÉ (31 déc 2025) : Désactiver le trimestre demo et réactiver un autre
        const trimestres = await db.get('trimestres') || [];
        const indexDemo = trimestres.findIndex(t => t.id === 'demo');

        if (indexDemo >= 0) {
            // Désactiver le trimestre demo
            trimestres[indexDemo].actif = false;

            // Réactiver le premier trimestre non-demo (ex: a2025)
            const autresTrimestres = trimestres.filter(t => t.id !== 'demo');
            if (autresTrimestres.length > 0) {
                const trimestreAReactiver = autresTrimestres[0];
                const indexAReactiver = trimestres.findIndex(t => t.id === trimestreAReactiver.id);
                if (indexAReactiver >= 0) {
                    trimestres[indexAReactiver].actif = true;
                    console.log(`   → Trimestre ${trimestreAReactiver.id} réactivé`);
                }
            }

            await db.set('trimestres', trimestres);
        }

        // Marquer comme non chargées
        localStorage.removeItem('demo-chargees');

        console.log('   ✅ Données demo déchargées avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur déchargement données demo:', error);
        return false;
    }
}

/**
 * Supprime toutes les données demo
 * ✅ CORRIGÉ (31 déc 2025) : Utilise cle() pour les clés namespacées
 */
async function supprimerGroupe9999() {
    // ✅ Utiliser cle() pour les clés namespacées (le trimestre demo est encore actif)
    const cleEtudiants = (typeof window.cle === 'function') ? window.cle('groupeEtudiants') : 'groupeEtudiants';
    const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
    const cleEvaluations = (typeof window.cle === 'function') ? window.cle('evaluationsSauvegardees') : 'evaluationsSauvegardees';
    const clePresences = (typeof window.cle === 'function') ? window.cle('presences') : 'presences';

    console.log(`   📦 Clés à nettoyer: ${cleEtudiants}, ${cleProductions}, ${cleEvaluations}, ${clePresences}`);

    // 1. Supprimer étudiants groupe demo
    const groupeEtudiants = await db.get(cleEtudiants) || [];
    const dasDemo = groupeEtudiants
        .filter(e => e.groupe === 'demo' || e.coursId === 'demo-cours' || e.da?.startsWith('DEMO'))
        .map(e => e.da);
    const etudiantsFiltres = groupeEtudiants.filter(e =>
        e.groupe !== 'demo' && e.coursId !== 'demo-cours' && !e.da?.startsWith('DEMO')
    );
    await db.set(cleEtudiants, etudiantsFiltres);
    console.log(`   ➜ ${dasDemo.length} étudiants demo supprimés de ${cleEtudiants}`);

    // 2. Supprimer cours demo (listeCours n'est pas namespacé)
    const listeCours = await db.get('listeCours') || [];
    const coursFiltres = listeCours.filter(c => c.id !== 'demo-cours' && c.groupe !== 'demo');
    await db.set('listeCours', coursFiltres);
    console.log('   ➜ Cours demo supprimés');

    // 3. Supprimer évaluations demo
    const evaluations = await db.get(cleEvaluations) || [];
    const evalsFiltrees = evaluations.filter(e =>
        e.coursId !== 'demo-cours' && !e.id?.startsWith('EVAL_DEMO')
    );
    await db.set(cleEvaluations, evalsFiltrees);
    console.log(`   ➜ Évaluations demo supprimées de ${cleEvaluations}`);

    // 4. Supprimer présences des étudiants demo
    const presences = await db.get(clePresences) || {};
    for (const date in presences) {
        for (const da of dasDemo) {
            delete presences[date]?.[da];
        }
    }
    await db.set(clePresences, presences);
    console.log(`   ➜ Présences demo supprimées de ${clePresences}`);

    // 5. Supprimer productions demo
    const productions = await db.get(cleProductions) || [];
    const prodsFiltrees = productions.filter(p =>
        p.coursId !== 'demo-cours' && !p.id?.startsWith('PROD_')
    );
    await db.set(cleProductions, prodsFiltrees);
    console.log(`   ➜ Productions demo supprimées de ${cleProductions}`);

    // Synchroniser vers localStorage cache
    await db.syncToLocalStorageCache();
}

/**
 * Vérifie si les données demo sont chargées
 * @returns {boolean} True si chargées, false sinon
 */
function sontDonnesDemoChargees() {
    return localStorage.getItem('demo-chargees') === 'true';
}

/**
 * Filtre les étudiants pour exclure le groupe 9999 si non en mode Assisté
 * ⚠️ MODIFIÉ Beta 93.5 : Le groupe 9999 est maintenant TOUJOURS visible
 * C'est un bac à sable permanent pour explorer l'application
 * @param {Array} etudiants - Liste complète des étudiants
 * @returns {Array} Liste filtrée (retourne tous les étudiants)
 */
function filtrerEtudiantsDemo(etudiants) {
    // ✅ Beta 93.5 : Groupe 9999 visible dans tous les modes
    return etudiants; // Tout afficher
}

/**
 * Filtre les cours pour exclure le groupe 9999 si non en mode Assisté
 * ⚠️ MODIFIÉ Beta 93.5 : Le groupe 9999 est maintenant TOUJOURS visible
 * C'est un bac à sable permanent pour explorer l'application
 * @param {Array} cours - Liste complète des cours
 * @returns {Array} Liste filtrée (retourne tous les cours)
 */
function filtrerCoursDemo(cours) {
    // ✅ Beta 93.5 : Groupe 9999 visible dans tous les modes
    return cours; // Tout afficher
}

/**
 * Initialise le module des données demo
 * ✅ CORRIGÉ (9 décembre 2025) : Vérifie si DB prête OU attend 'db-ready'
 */
async function initialiserModuleDonneesDemo() {
    console.log('🔄 Initialisation du module Données Demo');

    // Fonction pour charger les données demo selon le mode
    async function chargerSelonMode() {
        console.log('   → Base de données prête, vérification du mode...');

        // ✅ CORRIGÉ : Utiliser db.getSync() au lieu de localStorage direct
        const modeActuel = db.getSync('modeApplication', 'normal');
        console.log(`   → Mode actuel détecté: ${modeActuel}`);

        if (modeActuel === 'simulation') {  // ✅ CORRIGÉ : 'simulation' pas 'assiste'
            // Charger les données demo si mode assisté
            console.log('   → Mode Assisté détecté, chargement données demo...');
            const success = await chargerDonneesDemo();
            if (success) {
                console.log('   ✅ Module Données Demo initialisé (mode Assisté)');
            }
        } else {
            console.log('   ✅ Module Données Demo initialisé (mode Normal/Anonymisé) - Aucun chargement');
        }
    }

    // ✅ SOLUTION ROBUSTE : Toujours écouter l'événement db-ready
    // Mais aussi le déclencher immédiatement si la DB est déjà prête
    console.log('   → Installation écouteur db-ready...');

    // Installer l'écouteur AVANT de vérifier le flag (évite race condition)
    window.addEventListener('db-ready', chargerSelonMode, { once: true });

    // Si DB déjà prête, déclencher manuellement l'événement
    if (window.dbReady === true) {
        console.log('   → DB déjà prête, déclenchement manuel de db-ready...');
        window.dispatchEvent(new CustomEvent('db-ready', { detail: { manual: true } }));
    }
}

// Exporter les fonctions
window.chargerDonneesDemo = chargerDonneesDemo;
window.dechargerDonneesDemo = dechargerDonneesDemo;
window.sontDonnesDemoChargees = sontDonnesDemoChargees;
window.filtrerEtudiantsDemo = filtrerEtudiantsDemo;
window.filtrerCoursDemo = filtrerCoursDemo;
window.initialiserModuleDonneesDemo = initialiserModuleDonneesDemo;
