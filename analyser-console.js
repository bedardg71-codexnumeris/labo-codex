/**
 * Script d'analyse RàI vs Risque
 * À exécuter dans la console du navigateur pendant que l'application est ouverte
 *
 * Instructions:
 * 1. Ouvrir index 83 (seuils configurables).html
 * 2. Ouvrir la console (F12 ou Cmd+Option+I sur Mac)
 * 3. Copier-coller ce script complet
 * 4. Appuyer sur Entrée
 */

console.log('🔍 ANALYSE : Risque FAIBLE vs RàI Niveau 2');
console.log('==========================================\n');

// Récupérer les étudiants
const etudiants = JSON.parse(localStorage.getItem('etudiants') || '[]');

console.log(`📊 Total d'étudiants : ${etudiants.length}\n`);

if (etudiants.length === 0) {
    console.error('❌ Aucun étudiant trouvé dans localStorage');
    console.log('💡 Assurez-vous d\'avoir importé des données ou d\'être dans la bonne application');
} else {
    // Analyse de chaque étudiant
    let compteurs = {
        total: etudiants.length,
        risqueFaible: 0,
        risqueModere: 0,
        risqueEleve: 0,
        risqueTresEleve: 0,
        risqueCritique: 0,
        rai1: 0,
        rai2: 0,
        rai3: 0,
        risqueFaibleEtRai2: 0,
        risqueFaibleEtRai3: 0
    };

    let casCibles = []; // Étudiants avec risque faible ET RàI 2

    etudiants.forEach(etudiant => {
        const da = etudiant.da;

        // Calculer les indices si la fonction existe
        let indices = { A: 0, C: 0, P: 0, R: 0 };
        if (typeof calculerTousLesIndices === 'function') {
            indices = calculerTousLesIndices(da);
        }

        // Déterminer le niveau de risque
        let niveauRisque = 'Inconnu';
        if (indices.R <= 0.20) {
            niveauRisque = 'Faible';
            compteurs.risqueFaible++;
        } else if (indices.R <= 0.30) {
            niveauRisque = 'Modéré';
            compteurs.risqueModere++;
        } else if (indices.R <= 0.40) {
            niveauRisque = 'Élevé';
            compteurs.risqueEleve++;
        } else if (indices.R <= 0.50) {
            niveauRisque = 'Très élevé';
            compteurs.risqueTresEleve++;
        } else {
            niveauRisque = 'Critique';
            compteurs.risqueCritique++;
        }

        // Déterminer le niveau RàI
        let cibleInfo = { niveau: 0, cible: 'Inconnu', pattern: 'Inconnu' };
        if (typeof determinerCibleIntervention === 'function') {
            cibleInfo = determinerCibleIntervention(da);
        }

        // Compter les niveaux RàI
        if (cibleInfo.niveau === 1) compteurs.rai1++;
        else if (cibleInfo.niveau === 2) compteurs.rai2++;
        else if (cibleInfo.niveau === 3) compteurs.rai3++;

        // Identifier les cas cibles
        if (niveauRisque === 'Faible' && cibleInfo.niveau === 2) {
            compteurs.risqueFaibleEtRai2++;
            casCibles.push({
                nom: etudiant.nom,
                prenom: etudiant.prenom,
                da: da,
                A: Math.round(indices.A),
                C: Math.round(indices.C),
                P: Math.round(indices.P),
                R: (indices.R * 100).toFixed(1),
                pattern: cibleInfo.pattern,
                cible: cibleInfo.cible
            });
        }

        if (niveauRisque === 'Faible' && cibleInfo.niveau === 3) {
            compteurs.risqueFaibleEtRai3++;
        }
    });

    // Afficher les statistiques
    console.log('📈 STATISTIQUES GLOBALES');
    console.log('------------------------');
    console.log(`Total d'étudiants : ${compteurs.total}`);
    console.log('');
    console.log('RISQUE :');
    console.log(`  🟢 Risque faible : ${compteurs.risqueFaible}`);
    console.log(`  🟡 Risque modéré : ${compteurs.risqueModere}`);
    console.log(`  🟠 Risque élevé : ${compteurs.risqueEleve}`);
    console.log(`  🔴 Risque très élevé : ${compteurs.risqueTresEleve}`);
    console.log(`  ⚫ Risque critique : ${compteurs.risqueCritique}`);
    console.log('');
    console.log('RÀI :');
    console.log(`  Niveau 1 (Universel) : ${compteurs.rai1}`);
    console.log(`  Niveau 2 (Ciblé) : ${compteurs.rai2}`);
    console.log(`  Niveau 3 (Intensif) : ${compteurs.rai3}`);
    console.log('');
    console.log('🎯 CAS SPÉCIFIQUES :');
    console.log(`  ⚠️  Risque FAIBLE + RàI Niveau 2 : ${compteurs.risqueFaibleEtRai2}`);
    console.log(`  ⚠️  Risque FAIBLE + RàI Niveau 3 : ${compteurs.risqueFaibleEtRai3}`);
    console.log('');

    // Afficher les cas cibles en détail
    if (casCibles.length > 0) {
        console.log('📋 DÉTAILS : Étudiants avec Risque FAIBLE + RàI Niveau 2');
        console.log('========================================================');
        console.log('');

        casCibles.forEach((cas, index) => {
            console.log(`${index + 1}. ${cas.nom}, ${cas.prenom} (DA: ${cas.da})`);
            console.log(`   Indices : A=${cas.A}% | C=${cas.C}% | P=${cas.P}% | R=${cas.R}%`);
            console.log(`   Pattern : ${cas.pattern}`);
            console.log(`   ➜ Intervention : ${cas.cible}`);
            console.log('');
        });

        // Créer un tableau formaté
        console.log('📊 TABLEAU FORMATÉ (pour copier-coller)');
        console.log('========================================');
        console.table(casCibles.map(cas => ({
            'Nom': cas.nom,
            'Prénom': cas.prenom,
            'A%': cas.A,
            'C%': cas.C,
            'P%': cas.P,
            'R%': cas.R,
            'Pattern': cas.pattern,
            'Intervention': cas.cible
        })));
    } else {
        console.log('✅ Aucun étudiant avec Risque FAIBLE + RàI Niveau 2');
        console.log('   Cela signifie que tous les étudiants en RàI 2 ont un risque modéré ou plus élevé.');
    }

    console.log('');
    console.log('✅ Analyse terminée');
    console.log('');
    console.log('💡 Pour plus de détails, consultez EXPLICATION_RAI_VS_RISQUE.md');
}
