/**
 * SCRIPT : Validation de l'architecture
 * VERSION : 1.0
 * DATE : 1er janvier 2026
 *
 * OBJECTIF : Detecter incoherences dans le namespacing et la structure des donnees
 *
 * USAGE :
 * - Ouvrir l'application dans le navigateur
 * - Ouvrir la console developpeur
 * - Copier-coller ce script
 * - Executer : validerArchitecture()
 */

function validerArchitecture() {
    console.log('VALIDATION DE L\'ARCHITECTURE');
    console.log('================================\n');

    const rapport = {
        trimestres: validerTrimestres(),
        namespacing: validerNamespacing(),
        coursId: validerCoursId(),
        pratiques: validerPratiques()
    };

    afficherRapport(rapport);
    return rapport;
}

function validerTrimestres() {
    console.log('Validation des trimestres...');
    const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
    const actif = trimestres.find(t => t.actif);

    return {
        nbTrimestres: trimestres.length,
        actif: actif ? actif.id : 'AUCUN',
        liste: trimestres.map(t => `${t.id} (${t.actif ? 'ACTIF' : 'inactif'})`),
        ok: trimestres.length > 0 && actif !== undefined
    };
}

function validerNamespacing() {
    console.log('Validation du namespacing...');

    const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
    const actif = trimestres.find(t => t.actif);

    if (!actif) {
        return { ok: false, erreur: 'Aucun trimestre actif' };
    }

    const clesCritiques = [
        'calendrierComplet',
        'cadreCalendrier',
        'evenementsPrevus',
        'evenementsImprevus',
        'seancesCompletes',
        'horaireHebdo'
    ];

    const resultats = {
        namespacees: [],
        nonNamespacees: [],
        doublons: []
    };

    clesCritiques.forEach(cle => {
        const cleNamespacee = `${actif.id}_${cle}`;
        const existeNamespacee = localStorage.getItem(cleNamespacee) !== null;
        const existeLegacy = localStorage.getItem(cle) !== null;

        if (existeNamespacee && existeLegacy) {
            resultats.doublons.push(cle);
        } else if (existeNamespacee) {
            resultats.namespacees.push(cle);
        } else if (existeLegacy) {
            resultats.nonNamespacees.push(cle);
        }
    });

    return {
        ...resultats,
        ok: resultats.doublons.length === 0,
        pourcentageNamespace: Math.round((resultats.namespacees.length / clesCritiques.length) * 100)
    };
}

function validerCoursId() {
    console.log('Validation des coursId...');

    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');

    const etudiantsSansCoursId = etudiants.filter(e => !e.coursId).length;
    const productionsSansCoursId = productions.filter(p => !p.coursId).length;
    const presencesSansCoursId = presences.filter(p => !p.coursId).length;

    return {
        etudiants: {
            total: etudiants.length,
            sansCoursId: etudiantsSansCoursId,
            pourcentage: etudiants.length > 0 ? Math.round((1 - etudiantsSansCoursId / etudiants.length) * 100) : 0
        },
        productions: {
            total: productions.length,
            sansCoursId: productionsSansCoursId,
            pourcentage: productions.length > 0 ? Math.round((1 - productionsSansCoursId / productions.length) * 100) : 0
        },
        presences: {
            total: presences.length,
            sansCoursId: presencesSansCoursId,
            pourcentage: presences.length > 0 ? Math.round((1 - presencesSansCoursId / presences.length) * 100) : 0
        },
        ok: etudiantsSansCoursId === 0 && productionsSansCoursId === 0 && presencesSansCoursId === 0
    };
}

function validerPratiques() {
    console.log('Validation des pratiques...');

    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratiqueActive = modalites.pratique;

    return {
        configuree: pratiqueActive !== undefined,
        pratique: pratiqueActive || 'AUCUNE',
        ok: pratiqueActive !== undefined
    };
}

function afficherRapport(rapport) {
    console.log('\nRAPPORT DE VALIDATION');
    console.log('========================\n');

    // Trimestres
    console.log('TRIMESTRES:');
    console.log(`   Nombre: ${rapport.trimestres.nbTrimestres}`);
    console.log(`   Actif: ${rapport.trimestres.actif}`);
    console.log(`   Statut: ${rapport.trimestres.ok ? 'OK' : 'PROBLEME'}\n`);

    // Namespacing
    console.log('NAMESPACING:');
    console.log(`   Namespacees: ${rapport.namespacing.namespacees?.length || 0}/6 (${rapport.namespacing.pourcentageNamespace || 0}%)`);
    console.log(`   Non-namespacees: ${rapport.namespacing.nonNamespacees?.length || 0}`);
    console.log(`   Doublons: ${rapport.namespacing.doublons?.length || 0}`);

    if (rapport.namespacing.doublons?.length > 0) {
        console.warn(`   DOUBLONS DETECTES: ${rapport.namespacing.doublons.join(', ')}`);
    }
    if (rapport.namespacing.nonNamespacees?.length > 0) {
        console.warn(`   NON-NAMESPACEES: ${rapport.namespacing.nonNamespacees.join(', ')}`);
    }
    console.log(`   Statut: ${rapport.namespacing.ok ? 'OK' : 'PROBLEME'}\n`);

    // CoursId
    console.log('COURSID:');
    console.log(`   Etudiants: ${rapport.coursId.etudiants.pourcentage}% (${rapport.coursId.etudiants.total - rapport.coursId.etudiants.sansCoursId}/${rapport.coursId.etudiants.total})`);
    console.log(`   Productions: ${rapport.coursId.productions.pourcentage}% (${rapport.coursId.productions.total - rapport.coursId.productions.sansCoursId}/${rapport.coursId.productions.total})`);
    console.log(`   Presences: ${rapport.coursId.presences.pourcentage}% (${rapport.coursId.presences.total - rapport.coursId.presences.sansCoursId}/${rapport.coursId.presences.total})`);
    console.log(`   Statut: ${rapport.coursId.ok ? 'OK' : 'PROBLEME'}\n`);

    // Pratiques
    console.log('PRATIQUES:');
    console.log(`   Configuree: ${rapport.pratiques.configuree ? 'Oui' : 'Non'}`);
    console.log(`   Pratique active: ${rapport.pratiques.pratique}`);
    console.log(`   Statut: ${rapport.pratiques.ok ? 'OK' : 'PROBLEME'}\n`);

    // Resume global
    const toutOk = rapport.trimestres.ok && rapport.namespacing.ok && rapport.coursId.ok && rapport.pratiques.ok;
    console.log('========================');
    console.log(`STATUT GLOBAL: ${toutOk ? 'AUCUN PROBLEME DETECTE' : 'PROBLEMES DETECTES'}`);
    console.log('========================\n');

    if (!toutOk) {
        console.warn('DES PROBLEMES ONT ETE DETECTES. Consulter le rapport ci-dessus.');
        console.warn('Documentation: docs/legacy/A2025-migration-incomplete.md');
    }
}

// Affichage aide
console.log('Script de validation charge.');
console.log('Executer : validerArchitecture()');
