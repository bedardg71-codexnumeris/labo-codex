// Script de migration horaire vers format namespacé
// Exécuter dans la console du navigateur

console.log('=== MIGRATION HORAIRE ===\n');

// 1. Lire seancesHoraire existant
const seancesHoraire = JSON.parse(localStorage.getItem('seancesHoraire') || '[]');
console.log('seancesHoraire trouvé:', seancesHoraire.length, 'séances');

if (seancesHoraire.length === 0) {
    console.log('❌ Aucune séance à migrer');
} else {
    // 2. Afficher le contenu actuel
    console.log('Contenu:', seancesHoraire);

    // 3. Sauvegarder dans a2025_horaireHebdo
    localStorage.setItem('a2025_horaireHebdo', JSON.stringify(seancesHoraire));
    console.log('✅ Copié vers a2025_horaireHebdo');

    // 4. Vérifier
    const verifie = JSON.parse(localStorage.getItem('a2025_horaireHebdo') || '[]');
    console.log('Vérification a2025_horaireHebdo:', verifie.length, 'séances');

    console.log('\n✅ MIGRATION TERMINÉE');
    console.log('Rechargez la page pour voir les séances dans l\'accordéon Horaire.');
}

console.log('\n=== FIN ===');
