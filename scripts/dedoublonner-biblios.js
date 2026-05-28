/* =====================================================================
   DÉDOUBLONNER LES BIBLIOTHÈQUES PARTAGÉES (snippet console)

   Usage : ouvrir l'app dans Safari, ouvrir la console (Cmd+Opt+I → Console),
           coller TOUT ce fichier (sélectionner tout dans l'éditeur,
           Cmd+A / Cmd+C / Cmd+V dans la console, Entrée).

   Effet : sur les 5 bibliothèques partagées (grillesTemplates,
           echellesTemplates, cartouches_*, bibliothequeProductions,
           bibliothequePratiques), garde le PREMIER item rencontré pour
           chaque ID et retire les autres. Sauvegarde + résumé en console.

   Sécurité : aucune action irréversible côté codex (les fichiers .zip
              codex sur disque ne sont pas touchés). Seul le stockage
              IndexedDB / localStorage local est modifié.

   Après exécution : re-générer un nouveau codex (Sauvegarder le Codex)
                     pour figer cet état propre comme base de démo AQPC.

   Compatibilité : Safari Mac. Pas d'arrow function ni de const, pour
                   éviter les pièges de la console quand les retours à la
                   ligne sont avalés au collage.
   ===================================================================== */

(async function () {
    var clesBiblio = [
        'grillesTemplates',
        'echellesTemplates',
        'bibliothequeProductions',
        'bibliothequePratiques'
    ];

    /* Ajout des clés cartouches_<idGrille> (une par grille) */
    var clesCartouches = [];
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('cartouches_') === 0) {
            clesCartouches.push(k);
        }
    }

    var toutesCles = clesBiblio.concat(clesCartouches);
    var resume = [];

    for (var n = 0; n < toutesCles.length; n++) {
        var c = toutesCles[n];
        var items = (await db.get(c)) || [];
        if (!Array.isArray(items) || items.length === 0) {
            resume.push('  ' + c + ' : vide');
            continue;
        }
        var vus = new Map();
        var dups = 0;
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            if (!item || !item.id) continue;
            if (vus.has(item.id)) {
                dups++;
                console.log('  doublon retire dans ' + c + ' : id=' + item.id + ', nom=' + (item.nom || item.titre || '?'));
                continue;
            }
            vus.set(item.id, item);
        }
        if (dups > 0) {
            var nouveau = Array.from(vus.values());
            await db.set(c, nouveau);
            resume.push('  ' + c + ' : ' + items.length + ' -> ' + nouveau.length + ' (-' + dups + ')');
        } else {
            resume.push('  ' + c + ' : ' + items.length + ' items, 0 doublon');
        }
    }

    console.log('=== RESUME DEDOUBLONNAGE ===');
    for (var r = 0; r < resume.length; r++) {
        console.log(resume[r]);
    }
    console.log('=== Pense a re-generer ton codex (Sauvegarder le Codex) pour figer cet etat propre ===');
})();
