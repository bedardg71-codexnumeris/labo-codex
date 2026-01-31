/**
 * Script de nettoyage des clés obsolètes
 * Usage : Copier-coller dans la console du navigateur (fichier local MacBook)
 */

(function() {
    // === CONFIGURATION ===

    const testPatterns = ['test', 'simulation_', 'temp_'];

    const seancesTests = [
        '999-999', '88888', '9999', 'Test Migration', 'demo-cours',
        'COURS-BIO', 'COURS-CHIMIE', 'COURS-LITT', 'COURS-PHILO',
        'COURS1759', 'COURS1766', 'code-h2026', 'GC_1767'
    ];

    const globalesObsoletes = [
        'presences', 'groupeEtudiants', 'evaluations', 'horaires',
        'groupesCours', 'cadreCalendrier', 'productions', 'horaireHebdomadaire',
        'seancesHoraire', 'seancesCompletes', 'evaluationsDetaillees',
        'indicesEvaluation', 'portfoliosEleves', 'listeCours'
    ];

    const migrationFlags = [
        'migrationBibliothequeV2', 'migrationConfigsSpecifiques',
        'migrationLegacyEffectuee', 'migrationPratiquesBeta90Effectuee',
        'nouveautes-beta-93-vue', 'setItem'
    ];

    const snapshotPattern = 'snapshot_a2024_';

    // === ÉTAPE 1 : IDENTIFICATION ===
    window.etape1_identifier = async function() {
        const aSupprimer = [];
        const keys = await db.keys();

        for (const k of keys) {
            let raison = null;

            if (testPatterns.some(p => k.startsWith(p) || k === p)) {
                raison = 'test/simulation';
            }
            else if ((k.startsWith('seancesCompletes_') || k.startsWith('seancesHoraire_'))
                     && seancesTests.some(t => k.includes(t))) {
                raison = 'séance test';
            }
            else if (globalesObsoletes.includes(k)) {
                const hasNamespaced = keys.some(nk => nk.endsWith('_' + k));
                if (hasNamespaced) raison = 'global obsolète';
            }
            else if (migrationFlags.includes(k)) {
                raison = 'flag migration';
            }
            else if (k.startsWith(snapshotPattern)) {
                raison = 'snapshot ancien';
            }

            if (raison) aSupprimer.push({ cle: k, raison: raison });
        }

        console.log(`\n🗑️ ${aSupprimer.length} clés à supprimer :\n`);

        const parRaison = {};
        aSupprimer.forEach(item => {
            if (!parRaison[item.raison]) parRaison[item.raison] = [];
            parRaison[item.raison].push(item.cle);
        });

        Object.keys(parRaison).forEach(raison => {
            console.log(`\n--- ${raison.toUpperCase()} (${parRaison[raison].length}) ---`);
            parRaison[raison].forEach(cle => console.log(`  ${cle}`));
        });

        window._clesASupprimer = aSupprimer.map(i => i.cle);
        console.log(`\n✅ ${aSupprimer.length} clés identifiées`);
        console.log(`👉 Prochaine étape : etape2_backup()`);
        return aSupprimer;
    };

    // === ÉTAPE 2 : BACKUP ===
    window.etape2_backup = async function() {
        if (!window._clesASupprimer || window._clesASupprimer.length === 0) {
            console.error('❌ Exécutez d\'abord etape1_identifier()');
            return;
        }

        const backup = {};
        for (const cle of window._clesASupprimer) {
            const valeur = await db.get(cle, null);
            if (valeur !== null) backup[cle] = valeur;
        }

        const blob = new Blob([JSON.stringify({ date: new Date().toISOString(), cles: backup }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup-nettoyage-${new Date().toISOString().slice(0,10)}.json`;
        a.click();

        console.log(`\n💾 Backup téléchargé : ${Object.keys(backup).length} clés`);
        console.log(`👉 Prochaine étape : etape3_supprimer()`);
        window._backupOK = true;
    };

    // === ÉTAPE 3 : SUPPRESSION ===
    window.etape3_supprimer = async function() {
        if (!window._clesASupprimer?.length) {
            console.error('❌ Exécutez d\'abord etape1_identifier()');
            return;
        }
        if (!window._backupOK && !confirm('Pas de backup ! Continuer quand même ?')) return;
        if (!confirm(`Supprimer ${window._clesASupprimer.length} clés ?`)) return;

        let ok = 0;
        for (const cle of window._clesASupprimer) {
            try {
                await db.remove(cle);
                localStorage.removeItem(cle);
                ok++;
            } catch (e) { console.error(cle, e); }
        }

        console.log(`\n✅ ${ok} clés supprimées`);
        console.log(`🔄 Rechargez la page pour vérifier`);
        delete window._clesASupprimer;
        delete window._backupOK;
    };

    console.log(`
╔═══════════════════════════════════════════════╗
║     SCRIPT DE NETTOYAGE CHARGÉ                ║
╠═══════════════════════════════════════════════╣
║  1. etape1_identifier()  → Lister             ║
║  2. etape2_backup()      → Sauvegarder        ║
║  3. etape3_supprimer()   → Supprimer          ║
╚═══════════════════════════════════════════════╝
`);

})();
