/**
 * Script de diagnostic et nettoyage des productions en double
 * Version 2.1 - Support architecture hybride IndexedDB/localStorage
 *
 * À exécuter dans la console du navigateur.
 *
 * Fonctionnalités :
 * - Analyse toutes les productions et leurs évaluations liées
 * - Protège les portfolios conteneurs (utilisés pour la note finale)
 * - Protège les productions avec au moins une évaluation
 * - Identifie les productions inutilisées pouvant être supprimées
 * - Utilise db.get()/db.set() pour compatibilité IndexedDB (Beta 91.1+)
 *
 * Usage :
 *   1. Coller ce script dans la console du navigateur
 *   2. Analyser le résumé affiché
 *   3. Si des productions sont supprimables, exécuter : nettoyerProductionsInutilisees()
 *
 * @author Claude Code
 * @version 2.1
 * @date 2025-12-30
 */

(async function() {
    console.log('='.repeat(70));
    console.log('DIAGNOSTIC DES PRODUCTIONS - Analyse complète');
    console.log('='.repeat(70));

    // 1. Charger les données depuis IndexedDB (architecture hybride)
    const productions = await db.get('productions') || [];
    const evaluations = await db.get('evaluationsSauvegardees') || [];

    console.log(`\n📦 Total productions: ${productions.length}`);
    console.log(`📝 Total évaluations: ${evaluations.length}`);

    // 2. Analyser chaque production
    console.log('\n' + '='.repeat(70));
    console.log('ANALYSE DÉTAILLÉE DE CHAQUE PRODUCTION');
    console.log('='.repeat(70));

    const analyse = productions.map((prod, index) => {
        const evalsLiees = evaluations.filter(e => e.productionId === prod.id);
        const estPortfolioConteneur = prod.type === 'portfolio';
        const estProtege = estPortfolioConteneur || evalsLiees.length > 0;

        return {
            index,
            id: prod.id,
            nom: prod.nom,
            description: prod.description,
            type: prod.type,
            ponderation: prod.ponderation,
            coursId: prod.coursId,
            nbEvaluations: evalsLiees.length,
            estPortfolioConteneur,
            estProtege,
            raison: estPortfolioConteneur
                ? '📁 Portfolio conteneur (note finale)'
                : evalsLiees.length > 0
                    ? `📝 ${evalsLiees.length} évaluation(s) liée(s)`
                    : '🗑️ Peut être supprimé'
        };
    });

    // 3. Afficher le tableau
    analyse.forEach(prod => {
        const status = prod.estProtege ? '🔒 PROTÉGÉ' : '🗑️ SUPPRIMABLE';
        console.log(`\n${status}: ${prod.description || prod.nom}`);
        console.log(`   ID: ${prod.id}`);
        console.log(`   Type: ${prod.type}, Pondération: ${prod.ponderation}%`);
        console.log(`   CoursId: ${prod.coursId}`);
        console.log(`   Raison: ${prod.raison}`);
    });

    // 4. Résumé
    const aSupprimer = analyse.filter(p => !p.estProtege);
    const aGarder = analyse.filter(p => p.estProtege);

    console.log('\n' + '='.repeat(70));
    console.log('RÉSUMÉ');
    console.log('='.repeat(70));

    console.log(`\n🔒 Productions PROTÉGÉES (à conserver): ${aGarder.length}`);
    aGarder.forEach(prod => {
        console.log(`   ✅ "${prod.description || prod.nom}" - ${prod.raison}`);
    });

    console.log(`\n🗑️ Productions SUPPRIMABLES (sans usage): ${aSupprimer.length}`);
    aSupprimer.forEach(prod => {
        console.log(`   ❌ "${prod.description || prod.nom}" (ID: ${prod.id})`);
    });

    // 5. Commande de suppression
    const idsASupprimer = aSupprimer.map(p => p.id);

    if (idsASupprimer.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('COMMANDE DE SUPPRESSION');
        console.log('='.repeat(70));
        console.log('\nPour supprimer les productions inutilisées, exécutez:');
        console.log(`nettoyerProductionsInutilisees()`);
    } else {
        console.log('\n✅ Aucune production à supprimer.');
    }

    // Exposer la fonction de nettoyage (async pour IndexedDB)
    window.nettoyerProductionsInutilisees = async function() {
        const productions = await db.get('productions') || [];
        const evaluations = await db.get('evaluationsSauvegardees') || [];

        // Recalculer les IDs à supprimer (au cas où les données ont changé)
        const idsASupprimer = productions
            .filter(prod => {
                // Protéger le portfolio conteneur
                if (prod.type === 'portfolio') return false;
                // Protéger les productions avec évaluations
                const evalsLiees = evaluations.filter(e => e.productionId === prod.id);
                return evalsLiees.length === 0;
            })
            .map(p => p.id);

        if (idsASupprimer.length === 0) {
            console.log('✅ Aucune production à supprimer.');
            return { supprimees: 0 };
        }

        // Afficher ce qui va être supprimé
        console.log(`\n🗑️ Productions à supprimer (${idsASupprimer.length}):`);
        idsASupprimer.forEach(id => {
            const prod = productions.find(p => p.id === id);
            console.log(`   - ${prod?.description || prod?.nom || id}`);
        });

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${idsASupprimer.length} production(s) inutilisée(s) ?\n\nLe portfolio conteneur et les productions avec évaluations seront CONSERVÉS.`)) {
            console.log('❌ Annulé.');
            return { supprimees: 0 };
        }

        const avantCount = productions.length;
        const productionsNettoyees = productions.filter(p => !idsASupprimer.includes(p.id));

        // Sauvegarder dans IndexedDB ET localStorage (architecture hybride)
        await db.set('productions', productionsNettoyees);

        const supprimees = avantCount - productionsNettoyees.length;
        console.log(`\n✅ ${supprimees} production(s) supprimée(s).`);
        console.log('📄 Rechargez la page pour voir les changements.');

        return { supprimees, restantes: productionsNettoyees.length };
    };

    // Retourner les données pour analyse
    return {
        totalProductions: productions.length,
        totalEvaluations: evaluations.length,
        protegees: aGarder.length,
        supprimables: aSupprimer.length,
        idsASupprimer,
        details: analyse
    };
})();
