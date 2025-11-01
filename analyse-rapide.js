// COMMANDE RAPIDE - Copier-coller dans la console
// ================================================

(() => {
    const etudiants = JSON.parse(localStorage.getItem('etudiants') || '[]');
    let risqueFaible = 0, rai2 = 0, risqueFaibleEtRai2 = 0;
    const cas = [];

    etudiants.forEach(e => {
        const indices = calculerTousLesIndices(e.da);
        const cible = determinerCibleIntervention(e.da);
        const risque = indices.R <= 0.20 ? 'Faible' : 'Autre';

        if (risque === 'Faible') risqueFaible++;
        if (cible.niveau === 2) rai2++;
        if (risque === 'Faible' && cible.niveau === 2) {
            risqueFaibleEtRai2++;
            cas.push({
                'Nom': e.nom,
                'Prénom': e.prenom,
                'A%': Math.round(indices.A),
                'C%': Math.round(indices.C),
                'P%': Math.round(indices.P),
                'R%': (indices.R * 100).toFixed(1),
                'Pattern': cible.pattern,
                'Pourquoi RàI 2': cible.cible
            });
        }
    });

    console.log(`\n🎯 RÉSUMÉ`);
    console.log(`Total: ${etudiants.length} | Risque faible: ${risqueFaible} | RàI 2: ${rai2}`);
    console.log(`\n⚠️  RISQUE FAIBLE + RàI 2 = ${risqueFaibleEtRai2} étudiants\n`);

    if (cas.length > 0) {
        console.table(cas);
    } else {
        console.log('✅ Aucun cas de ce type');
    }
})();
