// Script pour corriger les séances RàI partielles
// Ajoute des enregistrements facultatifs pour les étudiants manquants

(function() {
    const dateACorriger = '2025-11-03';

    const presences = JSON.parse(localStorage.getItem('presences')) || [];
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants')) || [];

    // Trouver les DAs déjà enregistrés pour cette date
    const dasAvecEnregistrement = new Set(
        presences.filter(p => p.date === dateACorriger).map(p => p.da)
    );

    console.log(`\n========== CORRECTION SÉANCE RAI ${dateACorriger} ==========`);
    console.log(`Étudiants avec enregistrement: ${dasAvecEnregistrement.size}`);
    console.log(`Étudiants total: ${etudiants.length}`);

    // Trouver les étudiants sans enregistrement
    const etudiantsSansEnregistrement = etudiants.filter(e => !dasAvecEnregistrement.has(e.da));

    console.log(`\nÉtudiants SANS enregistrement (seront ajoutés comme absence motivée):`);
    etudiantsSansEnregistrement.forEach(e => {
        console.log(`  - ${e.prenom} ${e.nom} (${e.da})`);
    });

    if (etudiantsSansEnregistrement.length === 0) {
        console.log(`\n✅ Aucune correction nécessaire.`);
        return;
    }

    // Ajouter les enregistrements manquants avec facultatif: true
    let nbAjoutes = 0;
    etudiantsSansEnregistrement.forEach(e => {
        presences.push({
            da: e.da,
            date: dateACorriger,
            heures: 0,
            facultatif: true  // Absence motivée - ne compte pas dans l'assiduité
        });
        nbAjoutes++;
    });

    // Sauvegarder
    localStorage.setItem('presences', JSON.stringify(presences));

    console.log(`\n✅ ${nbAjoutes} enregistrements ajoutés avec facultatif: true`);
    console.log(`   Ces absences ne seront PAS comptabilisées dans l'assiduité.`);
    console.log(`\n🔄 Rechargez la page et reconstruisez les snapshots.`);
})();
