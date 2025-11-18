// Script pour calculer les corrélations A-P, C-P et RàI

// 1. Charger les données depuis localStorage (simulé ici)
console.log("=== CALCUL DES CORRÉLATIONS ===\n");

// On va créer un script qui peut être copié-collé dans la console du navigateur
const script = `
// Récupérer les données
const indicesAssiduites = JSON.parse(localStorage.getItem('indicesAssiduiteDetailles') || '{}');
const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');
const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
const pratique = modalites.pratiqueActive || 'pan-maitrise';

console.log("📊 Analyse des corrélations - Groupe actuel");
console.log("=".repeat(60));

// Préparer les données
const donnees = [];
etudiants.forEach(etudiant => {
    const da = etudiant.da;
    const assiduiteData = indicesAssiduites[da];
    const cpData = indicesCP[da];
    
    if (!assiduiteData || !cpData || !cpData.actuel) return;
    
    // Récupérer les indices selon la pratique active
    const pratiqueDonnees = cpData.actuel[pratique.toUpperCase()] || cpData.actuel.PAN || cpData.actuel;
    
    const A = assiduiteData.dernier12?.taux ?? assiduiteData.global?.taux ?? 0;
    const C = pratiqueDonnees.C ?? 0;
    const P = pratiqueDonnees.P ?? 0;
    const E = A * C * P / 10000; // Engagement (formule: A×C×P/10000)
    
    // Calculer niveau RàI (1, 2, ou 3)
    let niveauRai = 1; // Universel par défaut
    if (E < 0.35) {
        niveauRai = 3; // Intensif
    } else if (E < 0.55) {
        niveauRai = 2; // Préventif
    }
    
    donnees.push({
        nom: etudiant.prenom + ' ' + etudiant.nom,
        A: A,
        C: C,
        P: P,
        E: E,
        niveauRai: niveauRai
    });
});

console.log(\`\\n📈 Données collectées: \${donnees.length} étudiants\\n\`);

// Fonction pour calculer la corrélation de Pearson
function correlationPearson(x, y) {
    const n = x.length;
    if (n === 0 || n !== y.length) return null;
    
    const moyX = x.reduce((a, b) => a + b, 0) / n;
    const moyY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerateur = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
        const diffX = x[i] - moyX;
        const diffY = y[i] - moyY;
        numerateur += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }
    
    if (denomX === 0 || denomY === 0) return null;
    
    return numerateur / Math.sqrt(denomX * denomY);
}

// Fonction pour interpréter la corrélation
function interpreterCorrelation(r) {
    const absR = Math.abs(r);
    let force = '';
    if (absR < 0.3) force = 'Très faible';
    else if (absR < 0.5) force = 'Faible';
    else if (absR < 0.7) force = 'Modérée';
    else if (absR < 0.9) force = 'Forte';
    else force = 'Très forte';
    
    const direction = r > 0 ? 'positive' : 'négative';
    return \`\${force} (\${direction})\`;
}

// Calculer les corrélations
const A_values = donnees.map(d => d.A);
const C_values = donnees.map(d => d.C);
const P_values = donnees.map(d => d.P);
const E_values = donnees.map(d => d.E);
const RaI_values = donnees.map(d => d.niveauRai);

const r_AP = correlationPearson(A_values, P_values);
const r_CP = correlationPearson(C_values, P_values);
const r_RaiP = correlationPearson(RaI_values, P_values);
const r_RaiA = correlationPearson(RaI_values, A_values);
const r_RaiC = correlationPearson(RaI_values, C_values);
const r_AC = correlationPearson(A_values, C_values);

// Afficher les résultats
console.log("🔢 CORRÉLATIONS CALCULÉES");
console.log("=".repeat(60));
console.log(\`\\n1️⃣  Assiduité (A) ↔ Performance (P)\`);
console.log(\`   Coefficient r = \${r_AP?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_AP ? interpreterCorrelation(r_AP) : 'Données insuffisantes'}\`);

console.log(\`\\n2️⃣  Complétion (C) ↔ Performance (P)\`);
console.log(\`   Coefficient r = \${r_CP?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_CP ? interpreterCorrelation(r_CP) : 'Données insuffisantes'}\`);

console.log(\`\\n3️⃣  Niveau RàI ↔ Performance (P)\`);
console.log(\`   Coefficient r = \${r_RaiP?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_RaiP ? interpreterCorrelation(r_RaiP) : 'Données insuffisantes'}\`);
console.log(\`   Note: Plus le niveau RàI est élevé (3=Intensif), plus le risque est grand\`);

console.log(\`\\n📊 CORRÉLATIONS ADDITIONNELLES\`);
console.log("=".repeat(60));

console.log(\`\\n4️⃣  Assiduité (A) ↔ Complétion (C)\`);
console.log(\`   Coefficient r = \${r_AC?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_AC ? interpreterCorrelation(r_AC) : 'Données insuffisantes'}\`);

console.log(\`\\n5️⃣  Niveau RàI ↔ Assiduité (A)\`);
console.log(\`   Coefficient r = \${r_RaiA?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_RaiA ? interpreterCorrelation(r_RaiA) : 'Données insuffisantes'}\`);

console.log(\`\\n6️⃣  Niveau RàI ↔ Complétion (C)\`);
console.log(\`   Coefficient r = \${r_RaiC?.toFixed(3) ?? 'N/A'}\`);
console.log(\`   Interprétation: \${r_RaiC ? interpreterCorrelation(r_RaiC) : 'Données insuffisantes'}\`);

// Statistiques descriptives
console.log(\`\\n📈 STATISTIQUES DESCRIPTIVES\`);
console.log("=".repeat(60));

function stats(values, nom) {
    const n = values.length;
    const moy = values.reduce((a,b) => a+b, 0) / n;
    const sorted = [...values].sort((a,b) => a-b);
    const min = sorted[0];
    const max = sorted[n-1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const mediane = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - moy, 2), 0) / n;
    const ecartType = Math.sqrt(variance);
    
    console.log(\`\\n\${nom}:\`);
    console.log(\`  Moyenne: \${moy.toFixed(1)}%  |  Médiane: \${mediane.toFixed(1)}%\`);
    console.log(\`  Min: \${min.toFixed(1)}%  |  Max: \${max.toFixed(1)}%\`);
    console.log(\`  Écart-type: \${ecartType.toFixed(1)}  |  Q1: \${q1.toFixed(1)}%  |  Q3: \${q3.toFixed(1)}%\`);
}

stats(A_values, 'Assiduité (A)');
stats(C_values, 'Complétion (C)');
stats(P_values, 'Performance (P)');
stats(E_values.map(e => e*100), 'Engagement (E)');

// Distribution RàI
const niv1 = RaI_values.filter(r => r === 1).length;
const niv2 = RaI_values.filter(r => r === 2).length;
const niv3 = RaI_values.filter(r => r === 3).length;

console.log(\`\\n📊 Distribution niveaux RàI:\`);
console.log(\`  Niveau 1 (Universel): \${niv1} étudiants (\${(niv1/donnees.length*100).toFixed(1)}%)\`);
console.log(\`  Niveau 2 (Préventif): \${niv2} étudiants (\${(niv2/donnees.length*100).toFixed(1)}%)\`);
console.log(\`  Niveau 3 (Intensif): \${niv3} étudiants (\${(niv3/donnees.length*100).toFixed(1)}%)\`);

console.log(\`\\n=".repeat(60)\`);
console.log("✅ Analyse terminée\\n");

// Retourner un objet avec toutes les corrélations
return {
    correlations: {
        A_P: r_AP,
        C_P: r_CP,
        RaI_P: r_RaiP,
        A_C: r_AC,
        RaI_A: r_RaiA,
        RaI_C: r_RaiC
    },
    statistiques: {
        A: { moy: A_values.reduce((a,b)=>a+b,0)/A_values.length },
        C: { moy: C_values.reduce((a,b)=>a+b,0)/C_values.length },
        P: { moy: P_values.reduce((a,b)=>a+b,0)/P_values.length },
        E: { moy: E_values.reduce((a,b)=>a+b,0)/E_values.length }
    },
    nEtudiants: donnees.length
};
`;

console.log(script);
