/* ============================================================================
 * Campagne C0 — Comparateur de pratiques (SPEC §4)
 * Diagnostic : simule les 3 pratiques de référence sur les 20 étudiant·es démo
 * et fait émerger les profils-types contrastés.
 *
 * USAGE (Safari, file://) :
 *   1. Active le mode démo (bandeau vert) — la vue doit afficher le groupe démo.
 *   2. Ouvre la console (Cmd+Option+C).
 *   3. Colle TOUT ce fichier d'un coup. Lecture seule : aucune écriture, la
 *      pratique active du groupe-cours n'est pas touchée (simulerIndices, #307).
 *   4. Lis la table imprimée, puis renvoie-moi `window.__C0` (objet complet)
 *      OU une capture de la table.
 * ==========================================================================*/
(function comparateurC0() {
    if (typeof simulerIndices !== 'function' || typeof obtenirPratiqueParId !== 'function') {
        console.warn('[C0] simulerIndices / obtenirPratiqueParId introuvables — scripts non chargés ?');
        return;
    }
    if (db.getSync('demo-actif') !== 'true') {
        console.warn('[C0] Mode démo INACTIF. Active la démo (bandeau) puis recolle ce script.');
        return;
    }

    var pratiquesRef = ['sommative', 'standards', 'specifications'];

    // Résolution + famille de chaque pratique de référence
    var dispo = {};
    pratiquesRef.forEach(function (pid) {
        var inst = obtenirPratiqueParId(pid);
        dispo[pid] = inst
            ? (typeof inst.obtenirCode === 'function' ? inst.obtenirCode() : '(pas de code)')
            : 'INTROUVABLE';
    });
    console.log('[C0] Pratiques de référence résolues :', JSON.stringify(dispo));

    var cfgs = db.getSync(cle('pratiquesConfigurables'), []) || [];
    console.log('[C0] pratiquesConfigurables (démo) :',
        cfgs.length ? cfgs.map(function (p) { return p.id + ' / ' + (p.nom || ''); }) : '(aucune)');

    var etudiants = db.getSync(cle('groupeEtudiants'), []) || [];
    if (!etudiants.length) {
        console.warn('[C0] Aucun étudiant sous cle("groupeEtudiants"). trimestreActif =',
            db.getSync('trimestreActif'));
        return;
    }

    var lignes = [];
    etudiants.forEach(function (e) {
        var da = e.da || e.DA || e.numeroDA;
        var row = { da: da, nom: ((e.nom || '') + ', ' + (e.prenom || '')).trim() };
        pratiquesRef.forEach(function (pid) {
            var r = null, erreur = null;
            try { r = simulerIndices(da, pid); } catch (err) { erreur = String(err); }
            if (erreur) { row[pid] = null; row[pid + '_note'] = 'ERR'; row[pid + '_C'] = null; }
            else if (!r) { row[pid] = null; row[pid + '_note'] = 'null'; row[pid + '_C'] = null; }
            else {
                row[pid] = r.P; // métrique commune 0-100 (note finale/100 pour STD, performance sinon)
                row[pid + '_C'] = r.C;
                row[pid + '_note'] = (r.noteFinale === null || r.noteFinale === undefined)
                    ? 'fallback' : r.noteFinale; // 'fallback' = calculerDetailsNoteFinale n'a pas produit de note finale
            }
        });
        var som = typeof row.sommative === 'number' ? row.sommative : null;
        var std = typeof row.standards === 'number' ? row.standards : null;
        var spe = typeof row.specifications === 'number' ? row.specifications : null;
        var panMax = null;
        if (std !== null) panMax = std;
        if (spe !== null) panMax = (panMax === null) ? spe : Math.max(panMax, spe);
        row.ecartSOMvsPAN = (som !== null && panMax !== null) ? (som - panMax) : null;
        lignes.push(row);
    });

    // Tri : écart SOM−PAN croissant → en tête les profils où SOM est nettement
    // SOUS les PAN (signature "irrégulier" : échec à fort poids racheté ensuite).
    lignes.sort(function (a, b) {
        var ea = a.ecartSOMvsPAN === null ? 9999 : a.ecartSOMvsPAN;
        var eb = b.ecartSOMvsPAN === null ? 9999 : b.ecartSOMvsPAN;
        return ea - eb;
    });

    console.table(lignes.map(function (r) {
        return {
            DA: r.da, Nom: r.nom,
            SOM: r.sommative, STD: r.standards, SPE: r.specifications,
            'STD note?': r.standards_note,
            'écart SOM−PAN': r.ecartSOMvsPAN
        };
    }));

    window.__C0 = lignes;
    console.log('[C0] ' + lignes.length + ' étudiant·es. Détail complet (C/P/note par pratique) dans window.__C0.');
    console.log('[C0] Pour me le renvoyer : copy(JSON.stringify(window.__C0)) puis colle-le moi.');
})();
