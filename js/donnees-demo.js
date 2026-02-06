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
        const demoChargees = db.getSync('demo-chargees', null);
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

        // 🆕 FIX (20 jan 2026) : Ne plus changer le trimestre actif automatiquement
        // Le mode Assisté affiche les boutons 😎 d'aide, pas les données demo
        // L'utilisateur peut choisir "Démonstration" manuellement s'il veut expérimenter
        const trimestres = await db.get('trimestres') || [];

        // Sauvegarder le trimestre actif actuel AVANT toute modification
        const trimestreActifAvant = trimestres.find(t => t.actif === true);
        const idTrimestreActifAvant = trimestreActifAvant?.id || null;
        console.log(`   → Trimestre actif avant: ${idTrimestreActifAvant || '(aucun)'}`);

        // Désactiver tous les trimestres TEMPORAIREMENT pour la fusion
        trimestres.forEach(t => t.actif = false);

        // Ajouter ou mettre à jour le trimestre demo (actif temporairement pour fusion)
        const indexDemo = trimestres.findIndex(t => t.id === 'demo');
        const trimestreDemo = {
            id: 'demo',
            nom: 'Démonstration',
            session: 'D',
            annee: '2025',
            actif: true,  // Temporairement actif pour que cle() retourne 'demo_'
            isDemo: true
        };

        if (indexDemo >= 0) {
            trimestres[indexDemo] = trimestreDemo;
        } else {
            trimestres.push(trimestreDemo);
        }

        await db.set('trimestres', trimestres);
        await db.syncToLocalStorageCache();
        console.log('   → Trimestre demo activé TEMPORAIREMENT pour fusion');

        // Fusionner avec les données existantes (préfixe demo_ explicite)
        console.log('   → Fusion avec données existantes...');
        await fusionnerDonneesDemo(packDemo, 'demo_');

        // 🆕 RESTAURER le trimestre actif original APRÈS la fusion
        if (idTrimestreActifAvant) {
            const trimestresApres = await db.get('trimestres') || [];
            // Désactiver demo, réactiver l'original
            trimestresApres.forEach(t => {
                t.actif = (t.id === idTrimestreActifAvant);
            });
            await db.set('trimestres', trimestresApres);
            await db.syncToLocalStorageCache();
            console.log(`   → Trimestre actif restauré: ${idTrimestreActifAvant}`);
        } else {
            // Aucun trimestre actif avant, laisser demo actif (premier lancement)
            console.log('   → Aucun trimestre précédent, demo reste actif');
        }

        // Marquer comme chargées
        db.setSync('demo-chargees', 'true');

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
    // ✅ CORRIGÉ (31 déc 2025) : Utiliser cle() pour le namespacing par trimestre
    const cleEtudiants = cleDemo('groupeEtudiants');
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
        const cleProductions = cleDemo('productions');
        console.log(`   📦 Clé productions: ${cleProductions}`);
        const productions = await db.get(cleProductions) || [];
        const productionsDemo = packDemo.productions || [];

        for (const prod of productionsDemo) {
            const existe = productions.some(p => p.id === prod.id);
            if (!existe) {
                // ✅ AJOUTÉ (6 jan 2026) : Marquer comme démo pour filtrage export
                prod.estDemo = true;
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
        const cleEvaluations = cleDemo('evaluationsSauvegardees');
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
                // ✅ AJOUTÉ (6 jan 2026) : Marquer comme démo pour filtrage export
                grille.estDemo = true;
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
                // ✅ AJOUTÉ (6 jan 2026) : Marquer comme démo pour filtrage export
                echelle.estDemo = true;
                echelles.push(echelle);
            }
        }
        await db.set('echellesTemplates', echelles);
        console.log(`   ➜ echellesTemplates fusionnées (${echellesDemo.length} ajoutées)`);
    }

    // 7. Fusionner présences (si présentes)
    // ✅ CORRIGÉ (Beta 97) : Format Array cohérent avec saisie-presences.js
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
    // ✅ AJOUTÉ (31 déc 2025) : Les cartouches sont stockées par grille
    const clesCartouches = Object.keys(packDemo).filter(k => k.startsWith('cartouches_'));
    for (const cleCartouche of clesCartouches) {
        const cartouchesDemo = packDemo[cleCartouche] || [];
        if (cartouchesDemo.length > 0) {
            const cartouches = await db.get(cleCartouche) || [];

            for (const cartouche of cartouchesDemo) {
                const existe = cartouches.some(c => c.id === cartouche.id);
                if (!existe) {
                    // ✅ AJOUTÉ (6 jan 2026) : Marquer comme démo pour filtrage export
                    cartouche.estDemo = true;
                    cartouches.push(cartouche);
                }
            }
            await db.set(cleCartouche, cartouches);
            console.log(`   ➜ ${cleCartouche} fusionnées (${cartouchesDemo.length} ajoutées)`);
        }
    }

    // ✅ AJOUTÉ (21 jan 2026) : Créer horaire et groupe-cours pour les données demo
    // Sans ces entrées, les données ne peuvent pas être affichées dans Trimestre V2

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
        // Récupérer le premier cours demo pour les infos
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
            enseignantId: 'profil',  // Utilise le profil enseignant
            pratiqueId: null,        // Pas de pratique spécifique
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

/**
 * Décharge les données de démonstration (supprime le groupe 9999)
 * @returns {Promise<boolean>} True si succès, false sinon
 */
async function dechargerDonneesDemo() {
    try {
        console.log('🗑️ Déchargement des données de démonstration...');

        // Vérifier si chargées
        const demoChargees = db.getSync('demo-chargees', null);
        if (demoChargees !== 'true') {
            console.log('   ℹ️ Aucune donnée demo à décharger');
            return true;
        }

        // Supprimer le groupe 9999 de toutes les structures
        await supprimerGroupe9999();

        // 🆕 FIX (20 jan 2026) : Ne plus changer le trimestre actif
        // Le mode Assisté n'affecte plus le trimestre actif, donc pas besoin de le restaurer
        // Le trimestre "Démonstration" reste disponible dans le dropdown pour l'utilisateur
        console.log('   → Trimestre actif inchangé (mode Assisté = boutons 😎 seulement)');

        // Marquer comme non chargées
        db.setSync('demo-chargees', null);

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
    // Utiliser le préfixe demo_ explicitement pour éviter race condition avec cle()
    const prefixe = 'demo_';
    const cleEtudiants = prefixe + 'groupeEtudiants';
    const cleProductions = prefixe + 'productions';
    const cleEvaluations = prefixe + 'evaluationsSauvegardees';
    const clePresences = prefixe + 'presences';

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
    let presences = await db.get(clePresences) || [];
    if (Array.isArray(presences)) {
        presences = presences.filter(p => !p.estDemo && !dasDemo.includes(p.da));
    } else {
        // Legacy Object format
        for (const date in presences) {
            for (const da of dasDemo) {
                delete presences[date]?.[da];
            }
        }
    }
    await db.set(clePresences, presences);
    console.log(`   ➜ Présences demo supprimées de ${clePresences}`);

    // 5. Supprimer productions demo
    const productions = await db.get(cleProductions) || [];
    const prodsFiltrees = productions.filter(p => !p.estDemo);
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
    return db.getSync('demo-chargees', null) === 'true';
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
