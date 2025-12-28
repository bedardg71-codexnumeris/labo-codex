/**
 * Script de migration A2025 avec bouton visible
 *
 * Usage: Copier-coller ce script dans la console du navigateur
 * Un bouton apparaîtra en haut de la page - cliquez dessus pour sélectionner le fichier
 */

// Créer le conteneur du bouton
const container = document.createElement('div');
container.id = 'migration-a2025-container';
container.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    background: #1a1a2e;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

container.innerHTML = `
    <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 18px;">Migration des données A2025</h3>
    <p style="color: #aaa; margin: 0 0 15px 0; font-size: 14px;">Sélectionnez le fichier backup JSON</p>
    <input type="file" id="migration-file-input" accept=".json" style="display: none;">
    <button id="migration-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-right: 10px;
    ">Choisir le fichier backup</button>
    <button id="migration-cancel" style="
        background: #444;
        color: #ccc;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
    ">Annuler</button>
`;

document.body.appendChild(container);

// Gestionnaires d'événements
document.getElementById('migration-btn').onclick = function() {
    document.getElementById('migration-file-input').click();
};

document.getElementById('migration-cancel').onclick = function() {
    container.remove();
    console.log("Migration annulée");
};

document.getElementById('migration-file-input').onchange = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Mettre à jour l'interface
    container.innerHTML = `
        <h3 style="color: #fff; margin: 0 0 15px 0;">Migration en cours...</h3>
        <p style="color: #aaa; margin: 0; font-size: 14px;">Fichier: ${file.name}</p>
    `;

    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const backup = JSON.parse(event.target.result);
            const result = await executerMigrationA2025(backup);

            if (result.success) {
                container.innerHTML = `
                    <h3 style="color: #4ade80; margin: 0 0 15px 0;">✅ Migration terminée!</h3>
                    <p style="color: #fff; margin: 0 0 5px 0;">${result.etudiants} étudiants</p>
                    <p style="color: #fff; margin: 0 0 5px 0;">${result.presences} présences</p>
                    <p style="color: #fff; margin: 0 0 15px 0;">${result.portfolios} portfolios</p>
                    <button onclick="location.reload()" style="
                        background: #4ade80;
                        color: #1a1a2e;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Recharger la page</button>
                `;
            }
        } catch (error) {
            container.innerHTML = `
                <h3 style="color: #f87171; margin: 0 0 15px 0;">❌ Erreur</h3>
                <p style="color: #fff; margin: 0 0 15px 0;">${error.message}</p>
                <button onclick="this.parentElement.remove()" style="
                    background: #444;
                    color: #ccc;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                ">Fermer</button>
            `;
            console.error("Erreur:", error);
        }
    };
    reader.readAsText(file);
};

async function executerMigrationA2025(backup) {
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
    }

    // === RÉSUMÉ ===
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║                    ✅ MIGRATION TERMINÉE                    ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`   Étudiants: ${etudiantsFusionnes.length}`);
    console.log(`   Présences: ${presencesFusionnees.length}`);
    console.log(`   Portfolios: ${Object.keys(portfoliosFusionnes).length}`);

    return {
        success: true,
        etudiants: etudiantsFusionnes.length,
        presences: presencesFusionnees.length,
        portfolios: Object.keys(portfoliosFusionnes).length
    };
}

console.log("✅ Bouton de migration ajouté en haut de la page");
