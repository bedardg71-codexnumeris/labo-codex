// Script de diagnostic horaire 2 - Voir le contenu exact
console.log('=== CONTENU HORAIRE ===\n');

// seancesHoraire (format tableau)
const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
console.log('seancesHoraire:', seancesHoraire);

// horaireHebdomadaire (format Primo)
const horaireHebdomadaire = JSON.parse(localStorage.getItem('horaireHebdomadaire') || 'null');
console.log('\nhoraireHebdomadaire:', horaireHebdomadaire);

// Quelques entrées de a2025_seancesCompletes
const seancesCompletes = JSON.parse(localStorage.getItem('a2025_seancesCompletes') || '{}');
const dates = Object.keys(seancesCompletes).slice(0, 3);
console.log('\na2025_seancesCompletes (3 premiers jours):');
dates.forEach(d => {
    console.log(`  ${d}:`, seancesCompletes[d]);
});

console.log('\n=== FIN ===');
