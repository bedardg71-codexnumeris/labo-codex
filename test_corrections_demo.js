// Test rapide des corrections apportées au système de données demo
// À exécuter dans la console après avoir activé les données demo

console.log('=== TEST CORRECTIONS DONNÉES DEMO ===');
console.log('');

// Test 1 : Vérifier le flag demo-chargees
console.log('1. TEST FLAG DEMO-CHARGEES');
const flagDemo = localStorage.getItem('demo-chargees');
if (flagDemo === 'true') {
    console.log('   ✅ Flag demo-chargees correctement sauvegardé');
} else {
    console.log('   ❌ Flag demo-chargees manquant ou incorrect:', flagDemo);
}
console.log('');

// Test 2 : Vérifier les noms de productions
console.log('2. TEST NOMS PRODUCTIONS');
const listeCours = obtenirDonneesSelonMode('listeCours') || [];
const coursDemo = listeCours.find(c => c.groupe === '9999');

if (coursDemo) {
    const productions = obtenirDonneesSelonMode('productions') || [];
    const productionsDemo = productions.filter(p => p.coursId === coursDemo.id);

    if (productionsDemo.length > 0) {
        console.log(`   Trouvé ${productionsDemo.length} productions demo`);

        let tousOK = true;
        productionsDemo.forEach((p, i) => {
            const nom = p.titre || p.nom;
            if (nom) {
                console.log(`   ✅ Production ${i+1}: "${nom}" (${p.type})`);
            } else {
                console.log(`   ❌ Production ${i+1}: NOM MANQUANT (${p.type})`);
                tousOK = false;
            }
        });

        if (tousOK) {
            console.log('   ✅ Tous les noms de productions sont présents');
        } else {
            console.log('   ❌ Certaines productions n\'ont pas de nom');
        }
    } else {
        console.log('   ❌ Aucune production demo trouvée');
    }
} else {
    console.log('   ⚠️ Cours demo non trouvé - vérifiez que les données sont activées');
}
console.log('');

// Test 3 : Score final
console.log('=== SCORE FINAL ===');
const tests = [
    { nom: 'Flag demo-chargees', ok: flagDemo === 'true' },
    { nom: 'Cours demo présent', ok: !!coursDemo },
    { nom: 'Productions demo présentes', ok: coursDemo ? productions.filter(p => p.coursId === coursDemo.id).length > 0 : false }
];

const nbOk = tests.filter(t => t.ok).length;
const nbTotal = tests.length;

tests.forEach(t => {
    console.log(`${t.ok ? '✅' : '❌'} ${t.nom}`);
});

console.log('');
console.log(`Score: ${nbOk}/${nbTotal} (${Math.round(nbOk/nbTotal*100)}%)`);

if (nbOk === nbTotal) {
    console.log('');
    console.log('🎉 TOUTES LES CORRECTIONS SONT FONCTIONNELLES !');
    console.log('');
    console.log('Vous pouvez maintenant exécuter test_donnees_demo.js');
    console.log('pour un test complet (devrait afficher 8/8).');
} else {
    console.log('');
    console.log('⚠️ Certaines corrections ne fonctionnent pas encore');
}
