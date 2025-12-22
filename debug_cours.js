// Script de diagnostic - Exécuter dans la console du navigateur
console.log('=== DIAGNOSTIC COURS ET TRIMESTRES ===\n');

// 1. Trimestres
const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
console.log('TRIMESTRES:', trimestres);
const actif = trimestres.find(t => t.actif);
console.log('Trimestre actif:', actif ? `${actif.nom} (${actif.id})` : 'Aucun');

// 2. infoCours (cours actif global)
const infoCours = JSON.parse(localStorage.getItem('infoCours') || 'null');
console.log('\nINFO COURS (global):', infoCours);

// 3. listeCours
const listeCours = JSON.parse(localStorage.getItem('listeCours') || '[]');
console.log('\nLISTE COURS:', listeCours.length, 'cours');
listeCours.forEach((c, i) => {
    console.log(`  ${i+1}. ${c.sigle || c.id} - ${c.titre || '(sans titre)'} | trimestreId: ${c.trimestreId || 'NON DÉFINI'} | session: ${c.session} | annee: ${c.annee}`);
});

// 4. Clés namespacées pour A2025
console.log('\n--- Clés A2025 ---');
const clesA2025 = Object.keys(localStorage).filter(k => k.startsWith('a2025_'));
console.log('Clés trouvées:', clesA2025);

// 5. Clés namespacées pour H2026
console.log('\n--- Clés H2026 ---');
const clesH2026 = Object.keys(localStorage).filter(k => k.startsWith('h2026_'));
console.log('Clés trouvées:', clesH2026);

// 6. cadreCalendrier (ancien format)
const cadreCalendrier = JSON.parse(localStorage.getItem('cadreCalendrier') || 'null');
console.log('\ncadreCalendrier (non préfixé):', cadreCalendrier);

// 7. cadreCalendrier A2025
const cadreA2025 = JSON.parse(localStorage.getItem('a2025_cadreCalendrier') || 'null');
console.log('a2025_cadreCalendrier:', cadreA2025);

// 8. Chercher "Écriture" dans toutes les clés
console.log('\n--- Recherche "Écriture" ---');
Object.keys(localStorage).forEach(cle => {
    const val = localStorage.getItem(cle);
    if (val && val.includes('criture')) {
        console.log(`Trouvé dans "${cle}":`, val.substring(0, 200) + '...');
    }
});

console.log('\n=== FIN DIAGNOSTIC ===');
