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

        // Fusionner avec les données existantes
        console.log('   → Fusion avec données existantes...');
        await fusionnerDonneesDemo(packDemo);

        // Marquer comme chargées
        localStorage.setItem('demo-chargees', 'true');

        console.log('   ✅ Données demo chargées avec succès (groupe 9999)');
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
    const groupeEtudiants = await db.get('groupeEtudiants') || [];
    const etudiantsDemo = packDemo.groupeEtudiants || [];

    for (const etudiant of etudiantsDemo) {
        const existe = groupeEtudiants.some(e => e.da === etudiant.da);
        if (!existe) {
            // ✅ Marquer comme demo pour identification visuelle
            etudiant.isDemo = true;
            groupeEtudiants.push(etudiant);
        }
    }
    await db.set('groupeEtudiants', groupeEtudiants);
    console.log('   ➜ groupeEtudiants fusionné');

    // 3. Fusionner productions
    if (packDemo.productions) {
        const productions = await db.get('productions') || [];
        const productionsDemo = packDemo.productions || [];

        for (const prod of productionsDemo) {
            const existe = productions.some(p => p.id === prod.id);
            if (!existe) {
                productions.push(prod);
            }
        }
        await db.set('productions', productions);
        console.log('   ➜ productions fusionnées');
    }

    // 4. Fusionner evaluations
    if (packDemo.evaluations) {
        const evaluations = await db.get('evaluations') || {};
        const evaluationsDemo = packDemo.evaluations || {};

        // Fusionner les évaluations par DA
        for (const [da, evals] of Object.entries(evaluationsDemo)) {
            if (!evaluations[da]) {
                evaluations[da] = [];
            }

            for (const eval of evals) {
                const existe = evaluations[da].some(e => e.id === eval.id);
                if (!existe) {
                    evaluations[da].push(eval);
                }
            }
        }
        await db.set('evaluations', evaluations);
        console.log('   ➜ evaluations fusionnées');
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
    if (packDemo.echellesPerformance) {
        const echelles = await db.get('echellesPerformance') || [];
        const echellesDemo = packDemo.echellesPerformance || [];

        for (const echelle of echellesDemo) {
            const existe = echelles.some(e => e.id === echelle.id);
            if (!existe) {
                echelles.push(echelle);
            }
        }
        await db.set('echellesPerformance', echelles);
        console.log('   ➜ echellesPerformance fusionnées');
    }

    // 7. Fusionner présences (si présentes)
    if (packDemo.presences) {
        const presences = await db.get('presences') || {};
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
        await db.set('presences', presences);
        console.log('   ➜ presences fusionnées');
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
 * Supprime toutes les données du groupe 9999
 */
async function supprimerGroupe9999() {
    // 1. Supprimer étudiants groupe 9999
    const groupeEtudiants = await db.get('groupeEtudiants') || [];
    const etudiantsFiltres = groupeEtudiants.filter(e => e.groupe !== '9999');
    await db.set('groupeEtudiants', etudiantsFiltres);
    console.log('   ➜ Étudiants groupe 9999 supprimés');

    // 2. Supprimer cours avec groupe 9999
    const listeCours = await db.get('listeCours') || [];
    const coursFiltres = listeCours.filter(c => c.groupe !== '9999');
    await db.set('listeCours', coursFiltres);
    console.log('   ➜ Cours groupe 9999 supprimés');

    // 3. Supprimer évaluations des étudiants groupe 9999
    const evaluations = await db.get('evaluations') || {};
    const dasGroupe9999 = groupeEtudiants
        .filter(e => e.groupe === '9999')
        .map(e => e.da);

    for (const da of dasGroupe9999) {
        delete evaluations[da];
    }
    await db.set('evaluations', evaluations);
    console.log('   ➜ Évaluations groupe 9999 supprimées');

    // 4. Supprimer présences des étudiants groupe 9999
    const presences = await db.get('presences') || {};
    for (const date in presences) {
        for (const da of dasGroupe9999) {
            delete presences[date][da];
        }
    }
    await db.set('presences', presences);
    console.log('   ➜ Présences groupe 9999 supprimées');

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
