/* ============================================================================
   DIAGNOSTIC #156 — échelles et grilles personnelles absentes des sélecteurs
   ----------------------------------------------------------------------------
   Rapport terrain de Grégoire, 10 août 2026 : le sélecteur « Échelle à
   utiliser » n'offre que « Échelle générique (exemple) » — ni son échelle
   personnelle ni sa grille de dépistage H26.

   Le sélecteur lit `cle('echellesTemplates')` (namespacé trimestre) filtré
   par `dansBibliotheque !== false`. Trois hypothèses :
     A. les modèles personnels n'existent NULLE PART dans cette copie
        (île Chrome incomplète — famille #154) ;
     B. le drapeau `migration_modeles_namespacees_done` dit « fait » alors
        que les modèles dorment encore sous les clés NUES pré-#358
        (désync drapeau/données — famille #142/#419) ;
     C. les modèles sont là mais filtrés (`dansBibliotheque: false`) ou
        rangés sous un AUTRE trimestre.

   CE SCRIPT NE MODIFIE RIEN. Console (Cmd+Option+J), coller, Entrée,
   copier le bloc ==== DIAG #156 ====.
   ============================================================================ */
(async function diag156() {
    'use strict';
    const out = [];
    const L = s => out.push(s);
    L('==== DIAG #156 · ' + new Date().toISOString() + ' ====');
    L('trimestreActif : ' + JSON.stringify(db.getSync('trimestreActif', null)) +
      ' · drapeau migration modèles : ' + JSON.stringify(db.getSync('migration_modeles_namespacees_done', null)));

    async function lireIDB(k) {
        if (!db.useIndexedDB || !db.db) return null;
        try {
            return await new Promise((res, rej) => {
                const rq = db.db.transaction(['keyvalue'], 'readonly').objectStore('keyvalue').get(k);
                rq.onsuccess = () => res(rq.result ? rq.result.value : null);
                rq.onerror = () => rej(rq.error);
            });
        } catch (e) { return null; }
    }

    // Toutes les clés candidates : nues + tout préfixe de trimestre + démo
    const suffixes = ['echellesTemplates', 'grillesTemplates'];
    const clesVues = new Set();
    Object.keys(localStorage).forEach(k => { if (suffixes.some(s => k === s || k.endsWith('_' + s))) clesVues.add(k); });
    for (const k of db.memoryCache.keys()) { if (suffixes.some(s => k === s || k.endsWith('_' + s))) clesVues.add(k); }
    if (db.useIndexedDB && db.db) {
        try {
            const toutes = await new Promise((res, rej) => {
                const rq = db.db.transaction(['keyvalue'], 'readonly').objectStore('keyvalue').getAllKeys();
                rq.onsuccess = () => res(rq.result || []); rq.onerror = () => rej(rq.error);
            });
            toutes.forEach(k => { if (suffixes.some(s => k === s || String(k).endsWith('_' + s))) clesVues.add(String(k)); });
        } catch (e) { L('scan IDB impossible : ' + (e && e.name)); }
    }

    for (const k of [...clesVues].sort()) {
        let v = db.memoryCache.has(k) ? db.memoryCache.get(k) : null;
        if (v === null) { try { const raw = localStorage.getItem(k); v = raw ? JSON.parse(raw) : null; } catch (e) { v = null; } }
        if (v === null) v = await lireIDB(k);
        if (!Array.isArray(v)) { L(k + ' → ' + (v === null ? 'ABSENT' : typeof v)); continue; }
        L(k + ' → ' + v.length + ' modèle(s) :');
        v.forEach(m => L('   · ' + (m.id || '?') + ' « ' + (m.nom || 'sans nom') + ' »' +
            (m.dansBibliotheque === false ? ' ⚠ dansBibliotheque:FALSE (filtré des sélecteurs)' : '') +
            (m.verrouille ? ' [verrouillée]' : '')));
    }

    L('==== FIN DIAG #156 ====');
    console.log(out.join('\n'));
})();
