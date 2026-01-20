// Supprimer la seance fantome du 30 septembre 2025 pour TOUS les etudiants
const dateFantome = '2025-09-30';

console.log('=== SUPPRESSION SEANCE FANTOME DU 30 SEPTEMBRE 2025 ===');
console.log('');

// 1. Supprimer des presences
const presences = obtenirDonneesSelonMode('presences') || [];
console.log('Presences totales avant: ' + presences.length);

const presencesDate = presences.filter(p => p.date === dateFantome);
console.log('Presences le ' + dateFantome + ': ' + presencesDate.length + ' etudiants');

const presencesCorrigees = presences.filter(p => p.date !== dateFantome);
console.log('Presences apres suppression: ' + presencesCorrigees.length);
console.log('Presences supprimees: ' + (presences.length - presencesCorrigees.length));

localStorage.setItem('presences', JSON.stringify(presencesCorrigees));
console.log('OK Presences du 30 septembre supprimees');
console.log('');

// 2. Recalculer les indices d assiduité
console.log('=== RECALCUL DES INDICES ASSIDUITE ===');
calculerEtSauvegarderIndicesAssiduiteGlobal();
console.log('OK Indices assiduite recalcules');
console.log('');

// 3. Verifier pour Eve
const resultatEve = calculerAssiduiteJusquADate('9000116', '2025-10-01');
console.log('=== ASSIDUITE EVE APRES CORRECTION ===');
console.log('Indice: ' + (resultatEve.indice * 100).toFixed(1) + '%');
console.log(resultatEve.heuresPresentes + 'h / ' + resultatEve.heuresOffertes + 'h');
console.log('Seances: ' + resultatEve.nombreSeances);
console.log('');

// 4. Reconstruire les snapshots si necessaire
if (typeof reconstruireSnapshotsHistoriques === 'function') {
    console.log('=== RECONSTRUCTION DES SNAPSHOTS ===');
    console.log('IMPORTANT: Allez dans Reglages puis Captures de progression');
    console.log('   et cliquez sur "Reconstruire les snapshots historiques"');
    console.log('   pour mettre a jour tous les graphiques.');
} else {
    console.log('Rechargez la page pour voir les changements dans les graphiques');
}
