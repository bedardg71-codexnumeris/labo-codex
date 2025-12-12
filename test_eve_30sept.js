// Analyse détaillée de la séance du 30 septembre 2025 pour Eve

const da = '9000116'; // Eve
const dateProbleme = '2025-09-30';

console.log('=== ANALYSE SÉANCE DU 30 SEPTEMBRE 2025 ===');
console.log(`DA: ${da} (Eve)`);
console.log('');

// 1. Vérifier la présence d'Eve ce jour-là
const presences = obtenirDonneesSelonMode('presences') || [];
const presenceEve = presences.find(p => p.da === da && p.date === dateProbleme);

console.log('--- DONNÉES DE PRÉSENCE ---');
if (presenceEve) {
    console.log('Présence trouvée:', presenceEve);
    console.log('');
    console.log('Détails:');
    console.log(`  date: ${presenceEve.date}`);
    console.log(`  heures: ${presenceEve.heures}`);
    console.log(`  facultatif: ${presenceEve.facultatif}`);
    console.log(`  statut: ${presenceEve.statut || 'non défini'}`);
    console.log(`  Objet complet:`, JSON.stringify(presenceEve, null, 2));
} else {
    console.log('❌ Aucune présence trouvée pour Eve à cette date');
}
console.log('');

// 2. Vérifier s'il y a une intervention RàI ce jour-là
const interventions = obtenirDonneesSelonMode('interventions') || [];
const interventionsDate = interventions.filter(i => i.dateIntervention === dateProbleme);

console.log('--- INTERVENTIONS RÀI LE 30 SEPTEMBRE ---');
if (interventionsDate.length > 0) {
    console.log(`Trouvé ${interventionsDate.length} intervention(s) ce jour:`);
    interventionsDate.forEach((inter, idx) => {
        console.log(`\nIntervention #${idx + 1}:`);
        console.log(`  Sujet: "${inter.sujet}"`);
        console.log(`  Type: ${inter.typeIntervention}`);
        console.log(`  Statut: ${inter.statutIntervention}`);
        console.log(`  Participants DA: ${inter.participantsDA}`);
        console.log(`  Eve incluse: ${inter.participantsDA?.includes(da) ? 'OUI ✅' : 'NON'}`);

        if (inter.participantsDA?.includes(da)) {
            console.log('  ⚠️ Eve est dans cette intervention !');
        }
    });
} else {
    console.log('Aucune intervention RàI trouvée ce jour');
}
console.log('');

// 3. Vérifier toutes les interventions impliquant Eve
console.log('--- TOUTES LES INTERVENTIONS D\'EVE ---');
const interventionsEve = interventions.filter(i => i.participantsDA?.includes(da));
console.log(`Total interventions RàI pour Eve: ${interventionsEve.length}`);

if (interventionsEve.length > 0) {
    interventionsEve.forEach((inter, idx) => {
        console.log(`\n${idx + 1}. ${inter.dateIntervention} - "${inter.sujet}"`);
        console.log(`   Type: ${inter.typeIntervention}, Statut: ${inter.statutIntervention}`);

        // Vérifier si complétée (ce qui devrait transférer vers présences)
        if (inter.statutIntervention === 'completee') {
            console.log('   ✅ Complétée → devrait avoir transféré vers présences avec facultatif=true');
        }
    });
}
console.log('');

// 4. Solution proposée
console.log('=== SOLUTION PROPOSÉE ===');
if (presenceEve && presenceEve.heures === 0 && !presenceEve.facultatif) {
    console.log('Le problème est confirmé:');
    console.log('  - Eve a une présence avec 0h le 30 septembre');
    console.log('  - Cette présence n\'est PAS marquée comme facultative');
    console.log('  - Elle compte donc comme une absence non motivée');
    console.log('');
    console.log('CORRECTIF à appliquer:');
    console.log('  1. Marquer cette présence comme facultatif: true');
    console.log('  OU');
    console.log('  2. Modifier les heures à 2h si Eve était effectivement présente');
    console.log('');
    console.log('Code pour corriger (à exécuter dans la console):');
    console.log('');
    console.log(`// Option 1: Marquer comme absence motivée`);
    console.log(`const presences = obtenirDonneesSelonMode('presences') || [];`);
    console.log(`const idx = presences.findIndex(p => p.da === '${da}' && p.date === '${dateProbleme}');`);
    console.log(`if (idx !== -1) {`);
    console.log(`    presences[idx].facultatif = true;`);
    console.log(`    localStorage.setItem('presences', JSON.stringify(presences));`);
    console.log(`    console.log('✅ Présence marquée comme facultative');`);
    console.log(`}`);
}
