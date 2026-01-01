// Vérifier les données utilisées par le graphique
const da = '9000116'; // Eve

// 1. Vérifier les snapshots bruts
const snapshots = JSON.parse(localStorage.getItem('snapshots'));
const hebdomadaires = snapshots?.hebdomadaires || [];

console.log('=== DONNÉES SNAPSHOTS POUR EVE (15 premières semaines) ===');
hebdomadaires.slice(0, 15).forEach(snap => {
    const etudiant = snap.etudiants.find(e => e.da === da);
    if (etudiant) {
        console.log(`Sem ${snap.numSemaine} (${snap.dateSeance}): A=${etudiant.A}%, C=${etudiant.C}%, P=${etudiant.P}%`);
    }
});

console.log('');
console.log('=== DONNÉES UTILISÉES PAR LE GRAPHIQUE ===');

// 2. Simuler ce que fait obtenirSnapshotsEtudiant()
function obtenirSnapshotsEtudiantTest(da) {
    const snapshots = JSON.parse(localStorage.getItem('snapshots'));
    if (!snapshots || !snapshots.hebdomadaires) return [];
    
    return snapshots.hebdomadaires.map(snap => {
        const etudiant = snap.etudiants.find(e => e.da === da);
        if (!etudiant) return null;
        
        return {
            id: snap.id,
            dateSeance: snap.dateSeance,
            numSemaine: snap.numSemaine,
            A: etudiant.A,
            C: etudiant.C,
            P: etudiant.P,
            pattern: etudiant.pattern,
            rai: etudiant.rai
        };
    }).filter(s => s !== null);
}

const snapshotsGraphique = obtenirSnapshotsEtudiantTest(da);
console.log('Snapshots pour le graphique:', snapshotsGraphique.length);
snapshotsGraphique.slice(0, 15).forEach(s => {
    console.log(`Sem ${s.numSemaine}: A=${s.A}%, C=${s.C}%, P=${s.P}%`);
});

