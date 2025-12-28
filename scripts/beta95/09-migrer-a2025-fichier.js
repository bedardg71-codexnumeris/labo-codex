/**
 * Script de migration A2025 avec sélecteur de fichier
 *
 * Usage: Copier-coller ce script dans la console du navigateur
 * Un dialogue s'ouvrira pour sélectionner le fichier backup JSON
 */

(function() {
    // Créer un input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) {
            console.log("❌ Aucun fichier sélectionné");
            return;
        }

        console.log(`📂 Lecture du fichier: ${file.name}`);

        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const backup = JSON.parse(event.target.result);
                await executerMigration(backup);
            } catch (error) {
                console.error("❌ Erreur de parsing JSON:", error.message);
            }
        };
        reader.readAsText(file);
    };

    // Ouvrir le dialogue
    console.log("📂 Ouverture du sélecteur de fichier...");
    input.click();
})();

async function executerMigration(backup) {
    const COURS_A2025_ID = "COURS1759148752954";
    const GROUPE_A2025 = "00001";

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         MIGRATION AUTOMATIQUE A2025                        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    // === 1. ÉTUDIANTS ===
    console.log("\n📚 Migration des étudiants...");
    const backupEtudiants = JSON.parse(backup.groupeEtudiants || "[]");
    const currentEtudiants = db.getSync('groupeEtudiants', []);

    const etudiantsMigres = backupEtudiants.map(e => ({
        ...e,
        coursId: COURS_A2025_ID,
        groupe: e.groupe || GROUPE_A2025
    }));

    const etudiantsExistantsDAs = new Set(currentEtudiants.map(e => e.da));
    const nouveauxEtudiants = etudiantsMigres.filter(e => !etudiantsExistantsDAs.has(e.da));
    const etudiantsFusionnes = [...currentEtudiants, ...nouveauxEtudiants];

    console.log(`   Backup: ${backupEtudiants.length} | Actuels: ${currentEtudiants.length} | Ajoutés: ${nouveauxEtudiants.length}`);
    db.setSync('groupeEtudiants', etudiantsFusionnes);
    console.log(`   ✅ Total: ${etudiantsFusionnes.length} étudiants`);

    // === 2. PRÉSENCES ===
    console.log("\n📅 Migration des présences...");
    const backupPresences = JSON.parse(backup.presences || "[]");
    const currentPresences = db.getSync('presences', []);

    const presencesMigrees = backupPresences.map(p => ({
        ...p,
        coursId: p.coursId || COURS_A2025_ID
    }));

    const presencesExistantes = new Set(currentPresences.map(p => `${p.date}_${p.da}`));
    const nouvellesPresences = presencesMigrees.filter(p => !presencesExistantes.has(`${p.date}_${p.da}`));
    const presencesFusionnees = [...currentPresences, ...nouvellesPresences];

    console.log(`   Backup: ${backupPresences.length} | Actuels: ${currentPresences.length} | Ajoutés: ${nouvellesPresences.length}`);
    db.setSync('presences', presencesFusionnees);
    console.log(`   ✅ Total: ${presencesFusionnees.length} présences`);

    // === 3. PORTFOLIOS / ÉVALUATIONS ===
    console.log("\n📝 Migration des évaluations...");
    const backupPortfolios = JSON.parse(backup.portfoliosEleves || "{}");
    const currentPortfolios = db.getSync('portfoliosEleves', {});

    const portfoliosFusionnes = { ...currentPortfolios };
    let nbEvaluationsAjoutees = 0;

    for (const [da, artefacts] of Object.entries(backupPortfolios)) {
        if (!portfoliosFusionnes[da]) {
            portfoliosFusionnes[da] = artefacts;
            nbEvaluationsAjoutees += Object.keys(artefacts).length;
        } else {
            for (const [artId, evaluation] of Object.entries(artefacts)) {
                if (!portfoliosFusionnes[da][artId]) {
                    portfoliosFusionnes[da][artId] = evaluation;
                    nbEvaluationsAjoutees++;
                }
            }
        }
    }

    console.log(`   DAs backup: ${Object.keys(backupPortfolios).length} | DAs actuels: ${Object.keys(currentPortfolios).length}`);
    console.log(`   Évaluations ajoutées: ${nbEvaluationsAjoutees}`);
    db.setSync('portfoliosEleves', portfoliosFusionnes);
    console.log(`   ✅ Total: ${Object.keys(portfoliosFusionnes).length} DAs avec évaluations`);

    // === 4. INDICES CP ===
    console.log("\n📊 Migration des indices CP...");
    const backupIndicesCP = JSON.parse(backup.indicesCP || "{}");
    const currentIndicesCP = db.getSync('indicesCP', {});

    const indicesCPFusionnes = { ...currentIndicesCP };
    let nbIndicesCPAjoutes = 0;

    for (const [da, indices] of Object.entries(backupIndicesCP)) {
        if (!indicesCPFusionnes[da]) {
            indicesCPFusionnes[da] = indices;
            nbIndicesCPAjoutes++;
        }
    }

    db.setSync('indicesCP', indicesCPFusionnes);
    console.log(`   ✅ ${nbIndicesCPAjoutes} indices CP ajoutés`);

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
    console.log(`   ✅ ${nbIndicesAAjoutes} indices assiduité ajoutés`);

    // === 6. MISE À JOUR DU COURS ===
    console.log("\n🎓 Vérification du cours A2025...");
    const listeCours = db.getSync('listeCours', []);
    const coursA2025 = listeCours.find(c => c.id === COURS_A2025_ID);

    if (coursA2025) {
        coursA2025.groupe = coursA2025.groupe || GROUPE_A2025;
        db.setSync('listeCours', listeCours);
        console.log(`   ✅ Cours: ${coursA2025.codeCours || coursA2025.sigle} (groupe ${coursA2025.groupe})`);
    } else {
        console.log("   ⚠️ Cours A2025 non trouvé dans listeCours");
    }

    // === RÉSUMÉ ===
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    ✅ MIGRATION TERMINÉE                    ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log(`║  Étudiants:    ${String(etudiantsFusionnes.length).padStart(4)} total (${nouveauxEtudiants.length} ajoutés)`.padEnd(61) + "║");
    console.log(`║  Présences:    ${String(presencesFusionnees.length).padStart(4)} total (${nouvellesPresences.length} ajoutées)`.padEnd(61) + "║");
    console.log(`║  Évaluations:  ${String(Object.keys(portfoliosFusionnes).length).padStart(4)} DAs (${nbEvaluationsAjoutees} éval. ajoutées)`.padEnd(61) + "║");
    console.log(`║  Indices CP:   ${String(nbIndicesCPAjoutes).padStart(4)} ajoutés`.padEnd(61) + "║");
    console.log(`║  Indices A:    ${String(nbIndicesAAjoutes).padStart(4)} ajoutés`.padEnd(61) + "║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║  ⚠️  RECHARGEZ LA PAGE (Cmd+R) pour voir les changements   ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    return {
        success: true,
        etudiants: etudiantsFusionnes.length,
        presences: presencesFusionnees.length,
        portfolios: Object.keys(portfoliosFusionnes).length
    };
}
