/* ============================================================================
 * Campagne C0 — Comparateur de pratiques (SPEC §4)
 * Diagnostic : simule les 3 pratiques de référence sur les 20 étudiant·es démo
 * et fait émerger les profils-types contrastés.
 *
 * MÀJ 6 juin 2026 (post-seed démo 20.4) : on simule désormais les pratiques
 * CONFIGURÉES `demo-std-litt` / `demo-spe-litt` (créées au seed), PAS les ids
 * codés en dur `standards` / `specifications` (qui tombaient en fallback faute
 * de config — c'était le diagnostic du premier passage C0). `sommative` reste
 * l'id codé en dur (il calcule sans config).
 *
 * USAGE (Safari, file://) :
 *   1. Recharge l'app (Cmd+Option+R) pour déclencher le re-seed démo (v20.4).
 *   2. Active le mode démo (bandeau vert) — la vue doit afficher le groupe démo.
 *   3. Ouvre la console (Cmd+Option+C).
 *   4. Colle TOUT ce fichier d'un coup. Lecture seule : aucune écriture, la
 *      pratique active du groupe-cours n'est pas touchee (simulerIndices, lot 307).
 *   5. Lis la table imprimée, puis renvoie-moi `window.__C0` (objet complet)
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

    // pid = identifiant à simuler ; label = colonne affichée
    var pratiquesRef = [
        { pid: 'sommative',     label: 'SOM' },
        { pid: 'demo-std-litt', label: 'STD' },
        { pid: 'demo-spe-litt', label: 'SPE' }
    ];

    // Résolution + famille de chaque pratique de référence
    var dispo = {};
    pratiquesRef.forEach(function (p) {
        var inst = obtenirPratiqueParId(p.pid);
        dispo[p.pid] = inst
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
        pratiquesRef.forEach(function (p) {
            var r = null, erreur = null;
            try { r = simulerIndices(da, p.pid); } catch (err) { erreur = String(err); }
            if (erreur) { row[p.label] = null; row[p.label + '_note'] = 'ERR'; row[p.label + '_C'] = null; }
            else if (!r) { row[p.label] = null; row[p.label + '_note'] = 'null'; row[p.label + '_C'] = null; }
            else {
                row[p.label] = r.P; // métrique commune 0-100 (note finale/100 pour STD, performance sinon)
                row[p.label + '_C'] = r.C;
                row[p.label + '_note'] = (r.noteFinale === null || r.noteFinale === undefined)
                    ? 'fallback' : r.noteFinale; // 'fallback' = calculerDetailsNoteFinale n'a pas produit de note finale
            }
        });
        var som = typeof row.SOM === 'number' ? row.SOM : null;
        var std = typeof row.STD === 'number' ? row.STD : null;
        var spe = typeof row.SPE === 'number' ? row.SPE : null;
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
            SOM: r.SOM, STD: r.STD, SPE: r.SPE,
            'STD note?': r.STD_note,
            'écart SOM−PAN': r.ecartSOMvsPAN
        };
    }));

    window.__C0 = lignes;
    console.log('[C0] ' + lignes.length + ' étudiant·es. Détail complet (C/P/note par pratique) dans window.__C0.');
    console.log('[C0] Pour me le renvoyer : copy(JSON.stringify(window.__C0)) puis colle-le moi.');
})();
