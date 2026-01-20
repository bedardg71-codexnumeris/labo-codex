// Script de test pour vérifier le calcul de C individuel
// À exécuter dans la console du navigateur

const da = '9000116'; // Eve (l'étudiante du graphique)
const productions = obtenirDonneesSelonMode('productions') || [];
const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

console.log('=== ANALYSE C INDIVIDUEL POUR EVE ===');
console.log(`DA: ${da}`);
console.log(`Total productions: ${productions.length}`);
console.log(`Total évaluations: ${evaluations.length}`);
console.log('');

// Lister toutes les productions avec échéances
console.log('--- PRODUCTIONS AVEC ÉCHÉANCES ---');
productions
    .filter(p => !p.facultatif && p.dateEcheance)
    .sort((a, b) => a.dateEcheance.localeCompare(b.dateEcheance))
    .forEach(p => {
        const eval_eve = evaluations.find(e => 
            e.etudiantDA === da && 
            e.productionId === p.id && 
            !e.remplaceeParId
        );
        
        const statut = eval_eve 
            ? `${eval_eve.statutRemise} (note: ${eval_eve.noteFinale}, eval: ${eval_eve.dateEvaluation})`
            : 'NON ÉVALUÉ';
        
        console.log(`${p.dateEcheance} - ${p.description}: ${statut}`);
    });

console.log('');
console.log('--- SIMULATION CALCUL C PAR SEMAINE ---');

// Simuler le calcul pour chaque semaine
const snapshots = JSON.parse(localStorage.getItem('snapshots'));
const hebdomadaires = snapshots?.hebdomadaires || [];

hebdomadaires.slice(0, 15).forEach(snap => {
    const dateLimite = snap.dateSeance;
    
    const productionsDues = productions.filter(p => 
        !p.facultatif && 
        p.dateEcheance && 
        p.dateEcheance <= dateLimite
    );
    
    const productionsRemises = productionsDues.filter(p => {
        return evaluations.some(e =>
            e.etudiantDA === da &&
            e.productionId === p.id &&
            e.statutRemise === 'remis' &&
            !e.remplaceeParId &&
            e.noteFinale !== null &&
            e.noteFinale !== undefined
        );
    });
    
    const c = productionsDues.length > 0 
        ? Math.round((productionsRemises.length / productionsDues.length) * 100)
        : null;
    
    const etudiantSnap = snap.etudiants.find(e => e.da === da);
    const cSnapshot = etudiantSnap ? etudiantSnap.C : 'N/A';
    
    console.log(`Sem ${snap.numSemaine} (${dateLimite}): ${productionsRemises.length}/${productionsDues.length} = ${c}% (snapshot: ${cSnapshot}%)`);
});

