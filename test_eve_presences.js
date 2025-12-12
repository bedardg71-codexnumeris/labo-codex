// Test pour diagnostiquer le problème d'assiduité d'Eve
// Elle devrait avoir 100% mais affiche 92% (24h/26h) au 2025-10-01

const da = '9000116'; // Eve
const dateLimite = '2025-10-01';

console.log('=== DIAGNOSTIC ASSIDUITÉ EVE ===');
console.log(`DA: ${da}`);
console.log(`Date limite: ${dateLimite}`);
console.log('');

// Récupérer toutes les présences
const presences = obtenirDonneesSelonMode('presences') || [];
console.log(`Total présences dans le système: ${presences.length}`);

// Filtrer jusqu'à la date limite
const presencesFiltrees = presences.filter(p => p.date <= dateLimite);
console.log(`Présences jusqu'au ${dateLimite}: ${presencesFiltrees.length}`);

// Trouver toutes les dates de séances
const datesSaisies = [...new Set(presencesFiltrees.map(p => p.date))].sort();
console.log(`Dates de séances: ${datesSaisies.length}`);
console.log('');

// Filtrer les présences d'Eve
const presencesEve = presencesFiltrees.filter(p => p.da === da);
console.log(`Présences d'Eve: ${presencesEve.length}`);
console.log('');

// Analyser chaque séance
console.log('=== ANALYSE DÉTAILLÉE PAR SÉANCE ===');
let totalHeuresDonnees = 0;
let totalHeuresPresentes = 0;
let seancesNormales = 0;
let seancesFacultatives = 0;

datesSaisies.forEach(date => {
    const presenceEve = presencesEve.find(p => p.date === date);

    if (!presenceEve) {
        // Eve n'a pas de présence enregistrée cette date
        // Vérifier si c'était une séance facultative
        const presencesDate = presencesFiltrees.filter(p => p.date === date);
        const estSeanceFacultative = presencesDate.length > 0 &&
                                     presencesDate.every(p => p.facultatif === true);

        if (estSeanceFacultative) {
            console.log(`${date}: ABSENTE (séance facultative - non comptabilisée)`);
            seancesFacultatives++;
        } else {
            console.log(`${date}: ❌ ABSENTE (séance normale) → +2h données, +0h présentes`);
            totalHeuresDonnees += 2;
            seancesNormales++;
        }
    } else {
        const estFacultatif = presenceEve.facultatif === true;
        const heures = presenceEve.heures || 0;

        if (estFacultatif && heures === 0) {
            console.log(`${date}: Absente (séance facultative - non comptabilisée) [facultatif=${estFacultatif}]`);
            seancesFacultatives++;
        } else if (estFacultatif && heures > 0) {
            console.log(`${date}: ✅ PRÉSENTE ${heures}h (séance facultative) → +${heures}h données, +${heures}h présentes [facultatif=${estFacultatif}]`);
            totalHeuresDonnees += heures;
            totalHeuresPresentes += heures;
            seancesFacultatives++;
        } else {
            // Séance normale
            const heuresCours = 2;
            if (heures > heuresCours) {
                console.log(`${date}: ✅ PRÉSENTE ${heures}h (dépassement) → +${heures}h données, +${heures}h présentes`);
                totalHeuresDonnees += heures;
                totalHeuresPresentes += heures;
            } else {
                console.log(`${date}: ✅ PRÉSENTE ${heures}h/2h → +2h données, +${heures}h présentes`);
                totalHeuresDonnees += heuresCours;
                totalHeuresPresentes += heures;
            }
            seancesNormales++;
        }
    }
});

console.log('');
console.log('=== SOMMAIRE ===');
console.log(`Séances normales: ${seancesNormales}`);
console.log(`Séances facultatives: ${seancesFacultatives}`);
console.log(`Total heures données: ${totalHeuresDonnees}h`);
console.log(`Total heures présentes: ${totalHeuresPresentes}h`);
console.log(`Assiduité: ${totalHeuresPresentes}h / ${totalHeuresDonnees}h = ${((totalHeuresPresentes / totalHeuresDonnees) * 100).toFixed(1)}%`);
console.log('');

// Calculer avec la fonction du système
const resultatSysteme = calculerAssiduiteJusquADate(da, dateLimite);
console.log('=== RÉSULTAT FONCTION SYSTÈME ===');
console.log(`Indice: ${(resultatSysteme.indice * 100).toFixed(1)}%`);
console.log(`Heures présentes: ${resultatSysteme.heuresPresentes}h`);
console.log(`Heures offertes: ${resultatSysteme.heuresOffertes}h`);
console.log(`Nombre séances: ${resultatSysteme.nombreSeances}`);
console.log('');

// Identifier les absences
console.log('=== ABSENCES IDENTIFIÉES ===');
datesSaisies.forEach(date => {
    const presenceEve = presencesEve.find(p => p.date === date);
    if (!presenceEve || (presenceEve && presenceEve.heures === 0 && !presenceEve.facultatif)) {
        console.log(`${date}: Absence détectée`);

        // Vérifier dans les interventions si c'était une absence motivée
        const interventions = obtenirDonneesSelonMode('interventions') || [];
        const interventionDate = interventions.find(i =>
            i.dateIntervention === date &&
            i.participantsDA &&
            i.participantsDA.includes(da)
        );

        if (interventionDate) {
            console.log(`   → Intervention RàI trouvée: "${interventionDate.sujet}" (${interventionDate.typeIntervention})`);
            console.log(`      Statut: ${interventionDate.statutIntervention}`);
        }
    }
});
