/**
 * Script de migration des données A2025 depuis le backup
 *
 * Usage: Copier-coller ce script dans la console du navigateur
 *
 * Ce script:
 * 1. Charge le backup (vous devez le coller manuellement)
 * 2. Ajoute coursId aux étudiants, présences, et portfoliosEleves
 * 3. Fusionne avec les données actuelles sans écraser H2026
 */

async function migrerDonneesA2025(backup) {
    const COURS_A2025_ID = "COURS1759148752954";
    const GROUPE_A2025 = "00001"; // Groupe par défaut pour A2025

    console.log("🔄 Migration des données A2025...");

    // === 1. ÉTUDIANTS ===
    console.log("\n📚 Migration des étudiants...");
    const backupEtudiants = JSON.parse(backup.groupeEtudiants || "[]");
    const currentEtudiants = db.getSync('groupeEtudiants', []);

    // Ajouter coursId aux étudiants du backup
    const etudiantsMigres = backupEtudiants.map(e => ({
        ...e,
        coursId: COURS_A2025_ID,
        groupe: e.groupe || GROUPE_A2025
    }));

    // Fusionner (garder les étudiants actuels + ajouter ceux du backup)
    const etudiantsExistantsDAs = new Set(currentEtudiants.map(e => e.da));
    const nouveauxEtudiants = etudiantsMigres.filter(e => !etudiantsExistantsDAs.has(e.da));
    const etudiantsFusionnes = [...currentEtudiants, ...nouveauxEtudiants];

    console.log(`  - Étudiants dans backup: ${backupEtudiants.length}`);
    console.log(`  - Étudiants actuels: ${currentEtudiants.length}`);
    console.log(`  - Nouveaux étudiants ajoutés: ${nouveauxEtudiants.length}`);

    db.setSync('groupeEtudiants', etudiantsFusionnes);
    console.log(`  ✅ Total étudiants: ${etudiantsFusionnes.length}`);

    // === 2. PRÉSENCES ===
    console.log("\n📅 Migration des présences...");
    const backupPresences = JSON.parse(backup.presences || "[]");
    const currentPresences = db.getSync('presences', []);

    // Ajouter coursId aux présences du backup
    const presencesMigrees = backupPresences.map(p => ({
        ...p,
        coursId: p.coursId || COURS_A2025_ID
    }));

    // Fusionner (éviter les doublons par date+da)
    const presencesExistantes = new Set(currentPresences.map(p => `${p.date}_${p.da}`));
    const nouvellesPresences = presencesMigrees.filter(p => !presencesExistantes.has(`${p.date}_${p.da}`));
    const presencesFusionnees = [...currentPresences, ...nouvellesPresences];

    console.log(`  - Présences dans backup: ${backupPresences.length}`);
    console.log(`  - Présences actuelles: ${currentPresences.length}`);
    console.log(`  - Nouvelles présences ajoutées: ${nouvellesPresences.length}`);

    db.setSync('presences', presencesFusionnees);
    console.log(`  ✅ Total présences: ${presencesFusionnees.length}`);

    // === 3. PORTFOLIOS / ÉVALUATIONS ===
    console.log("\n📝 Migration des évaluations (portfoliosEleves)...");
    const backupPortfolios = JSON.parse(backup.portfoliosEleves || "{}");
    const currentPortfolios = db.getSync('portfoliosEleves', {});

    // Fusionner les portfolios (par DA)
    const portfoliosFusionnes = { ...currentPortfolios };
    let nbEvaluationsAjoutees = 0;

    for (const [da, artefacts] of Object.entries(backupPortfolios)) {
        if (!portfoliosFusionnes[da]) {
            portfoliosFusionnes[da] = artefacts;
            nbEvaluationsAjoutees += Object.keys(artefacts).length;
        } else {
            // Fusionner les artefacts
            for (const [artId, eval] of Object.entries(artefacts)) {
                if (!portfoliosFusionnes[da][artId]) {
                    portfoliosFusionnes[da][artId] = eval;
                    nbEvaluationsAjoutees++;
                }
            }
        }
    }

    console.log(`  - DAs dans backup: ${Object.keys(backupPortfolios).length}`);
    console.log(`  - DAs actuels: ${Object.keys(currentPortfolios).length}`);
    console.log(`  - Évaluations ajoutées: ${nbEvaluationsAjoutees}`);

    db.setSync('portfoliosEleves', portfoliosFusionnes);
    console.log(`  ✅ Total DAs avec évaluations: ${Object.keys(portfoliosFusionnes).length}`);

    // === 4. INDICES CP ===
    console.log("\n📊 Migration des indices CP...");
    const backupIndicesCP = JSON.parse(backup.indicesCP || "{}");
    const currentIndicesCP = db.getSync('indicesCP', {});

    // Fusionner (garder les indices existants, ajouter les manquants)
    const indicesCPFusionnes = { ...currentIndicesCP };
    let nbIndicesAjoutes = 0;

    for (const [da, indices] of Object.entries(backupIndicesCP)) {
        if (!indicesCPFusionnes[da]) {
            indicesCPFusionnes[da] = indices;
            nbIndicesAjoutes++;
        }
    }

    db.setSync('indicesCP', indicesCPFusionnes);
    console.log(`  ✅ Indices ajoutés: ${nbIndicesAjoutes}`);

    // === 5. INDICES ASSIDUITÉ ===
    console.log("\n📈 Migration des indices d'assiduité...");
    const backupIndicesA = JSON.parse(backup.indicesAssiduiteDetailles || "{}");
    const currentIndicesA = db.getSync('indicesAssiduiteDetailles', {});

    const indicesAFusionnes = { ...currentIndicesA };
    let nbIndicesAAjoutes = 0;

    for (const [da, indices] of Object.entries(backupIndicesA)) {
        if (!indicesAFusionnes[da]) {
            indicesAFusionnes[da] = indices;
            nbIndicesAAjoutes++;
        }
    }

    db.setSync('indicesAssiduiteDetailles', indicesAFusionnes);
    console.log(`  ✅ Indices assiduité ajoutés: ${nbIndicesAAjoutes}`);

    // === 6. METTRE À JOUR LE COURS A2025 ===
    console.log("\n🎓 Mise à jour du cours A2025...");
    const listeCours = db.getSync('listeCours', []);
    const coursA2025 = listeCours.find(c => c.id === COURS_A2025_ID);

    if (coursA2025) {
        coursA2025.groupe = coursA2025.groupe || GROUPE_A2025;
        db.setSync('listeCours', listeCours);
        console.log(`  ✅ Cours mis à jour avec groupe: ${coursA2025.groupe}`);
    }

    // === RÉSUMÉ ===
    console.log("\n" + "=".repeat(50));
    console.log("✅ MIGRATION TERMINÉE");
    console.log("=".repeat(50));
    console.log(`Étudiants: ${etudiantsFusionnes.length}`);
    console.log(`Présences: ${presencesFusionnees.length}`);
    console.log(`Portfolios: ${Object.keys(portfoliosFusionnes).length} DAs`);
    console.log("\n⚠️ Rechargez la page pour voir les changements.");

    return {
        etudiants: etudiantsFusionnes.length,
        presences: presencesFusionnees.length,
        portfolios: Object.keys(portfoliosFusionnes).length
    };
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║         MIGRATION DES DONNÉES A2025                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. Chargez le fichier backup JSON:                        ║
║     const backup = await fetch('backups-donnees/export-... ║
║       .json').then(r => r.json());                         ║
║                                                            ║
║  2. Ou copiez-collez le contenu du fichier JSON:           ║
║     const backup = { ... };                                ║
║                                                            ║
║  3. Lancez la migration:                                   ║
║     await migrerDonneesA2025(backup);                      ║
║                                                            ║
║  4. Rechargez la page                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
