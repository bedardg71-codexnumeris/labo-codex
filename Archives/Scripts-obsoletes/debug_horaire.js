// Script de diagnostic horaire - Exécuter dans la console du navigateur
console.log('=== DIAGNOSTIC HORAIRE ===\n');

// 1. Registre des trimestres
const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
console.log('TRIMESTRES:', trimestres);
const actif = trimestres.find(t => t.actif);
console.log('Trimestre actif:', actif ? `${actif.nom} (${actif.id})` : 'AUCUN ⚠️');

// 2. Cours actif
const infoCours = JSON.parse(localStorage.getItem('infoCours') || 'null');
console.log('\nCOURS ACTIF:', infoCours ? `${infoCours.codeCours || infoCours.sigle} - ${infoCours.titre || infoCours.nomCours}` : 'Aucun');
if (infoCours) {
    console.log('  Session:', infoCours.session);
    console.log('  Année:', infoCours.annee);
    console.log('  Groupe:', infoCours.groupe);
    console.log('  trimestreId:', infoCours.trimestreId || 'NON DÉFINI');
}

// 3. Recherche des clés d'horaire
console.log('\n--- CLÉS HORAIRE TROUVÉES ---');
const clesHoraire = Object.keys(localStorage).filter(k =>
    k.includes('horaire') || k.includes('Horaire') || k.includes('seances') || k.includes('Seances')
);
clesHoraire.forEach(cle => {
    const val = localStorage.getItem(cle);
    let resume = '';
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
            resume = `[Array: ${parsed.length} éléments]`;
        } else if (typeof parsed === 'object') {
            resume = `[Object: ${Object.keys(parsed).length} clés]`;
        }
    } catch(e) {
        resume = val?.substring(0, 50) + '...';
    }
    console.log(`  ${cle}: ${resume}`);
});

// 4. Contenu horaireHebdo sans préfixe
const horaireNonPrefixe = JSON.parse(localStorage.getItem('horaireHebdo') || '[]');
console.log('\nhoraireHebdo (sans préfixe):', horaireNonPrefixe.length, 'séances');

// 5. Contenu horaireHebdo avec préfixe A2025
const horaireA2025 = JSON.parse(localStorage.getItem('a2025_horaireHebdo') || '[]');
console.log('a2025_horaireHebdo:', horaireA2025.length, 'séances');
if (horaireA2025.length > 0) {
    console.log('  Détails:', horaireA2025);
}

// 6. seancesCompletes
const seancesNonPrefixe = JSON.parse(localStorage.getItem('seancesCompletes') || '{}');
const seancesA2025 = JSON.parse(localStorage.getItem('a2025_seancesCompletes') || '{}');
console.log('\nseancesCompletes (sans préfixe):', Object.keys(seancesNonPrefixe).length, 'jours');
console.log('a2025_seancesCompletes:', Object.keys(seancesA2025).length, 'jours');

// 7. horaireHebdomadaire (format Primo)
const horaireHebdo = JSON.parse(localStorage.getItem('horaireHebdomadaire') || 'null');
if (horaireHebdo) {
    console.log('\nhoraireHebdomadaire (format Primo):', horaireHebdo);
}

console.log('\n=== FIN DIAGNOSTIC ===');
