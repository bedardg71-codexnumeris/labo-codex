// Script de diagnostic pour identifier les séances problématiques
// Exécuter dans la console du navigateur

(function() {
    const presences = JSON.parse(localStorage.getItem('presences')) || [];
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants')) || [];
    const nbEtudiants = etudiants.length;

    console.log(`\n========== DIAGNOSTIC PRÉSENCES ==========`);
    console.log(`Nombre total d'étudiants: ${nbEtudiants}`);
    console.log(`Nombre total d'enregistrements de présences: ${presences.length}`);

    // Grouper par date
    const parDate = {};
    presences.forEach(p => {
        if (!parDate[p.date]) parDate[p.date] = [];
        parDate[p.date].push(p);
    });

    const dates = Object.keys(parDate).sort();
    console.log(`\nNombre de dates uniques: ${dates.length}`);

    console.log(`\n---------- DATES AVEC PEU D'ENREGISTREMENTS ----------`);
    console.log(`(Dates où moins de 80% des étudiants ont un enregistrement)\n`);

    const seuilAlerte = nbEtudiants * 0.8;
    let datesSuspectes = [];

    dates.forEach(date => {
        const nbEnregistrements = parDate[date].length;
        const pourcentage = Math.round((nbEnregistrements / nbEtudiants) * 100);

        if (nbEnregistrements < seuilAlerte) {
            datesSuspectes.push({date, nbEnregistrements, pourcentage});
            console.log(`⚠️ ${date}: ${nbEnregistrements}/${nbEtudiants} enregistrements (${pourcentage}%)`);

            // Lister les étudiants présents pour cette date
            const dasPresents = parDate[date].map(p => p.da);
            console.log(`   DAs avec enregistrement: ${dasPresents.join(', ')}`);
        }
    });

    if (datesSuspectes.length === 0) {
        console.log(`✅ Aucune date suspecte trouvée.`);
    }

    console.log(`\n---------- RÉSUMÉ PAR SEMAINE ----------`);

    // Identifier les semaines
    const semaines = {};
    dates.forEach(date => {
        const d = new Date(date + 'T12:00:00');
        const debutAnnee = new Date(d.getFullYear(), 0, 1);
        const numSemaine = Math.ceil((((d - debutAnnee) / 86400000) + debutAnnee.getDay() + 1) / 7);
        const cleSemaine = `Sem ${numSemaine}`;

        if (!semaines[cleSemaine]) semaines[cleSemaine] = [];
        semaines[cleSemaine].push({
            date,
            nbEnregistrements: parDate[date].length,
            pourcentage: Math.round((parDate[date].length / nbEtudiants) * 100)
        });
    });

    Object.keys(semaines).sort((a, b) => {
        const numA = parseInt(a.replace('Sem ', ''));
        const numB = parseInt(b.replace('Sem ', ''));
        return numA - numB;
    }).forEach(semaine => {
        const seances = semaines[semaine];
        console.log(`\n${semaine}:`);
        seances.forEach((s, i) => {
            const alerte = s.pourcentage < 80 ? '⚠️' : '✅';
            console.log(`  ${alerte} Séance ${i+1} (${s.date}): ${s.nbEnregistrements} enregistrements (${s.pourcentage}%)`);
        });
    });

    console.log(`\n========================================`);

    if (datesSuspectes.length > 0) {
        console.log(`\n🔧 Pour supprimer une date problématique, exécutez:`);
        console.log(`   supprimerPresencesDate('YYYY-MM-DD')`);
    }

    // Exposer fonction de suppression
    window.supprimerPresencesDate = function(date) {
        const presences = JSON.parse(localStorage.getItem('presences')) || [];
        const avant = presences.length;
        const apres = presences.filter(p => p.date !== date);
        localStorage.setItem('presences', JSON.stringify(apres));
        console.log(`✅ Supprimé ${avant - apres.length} enregistrements pour la date ${date}`);
        console.log(`   Rechargez la page et reconstruisez les snapshots.`);
    };
})();
