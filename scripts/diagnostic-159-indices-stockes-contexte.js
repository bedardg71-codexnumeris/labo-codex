/* ============================================================================
   DIAGNOSTIC #159 — indices stockés vs calcul direct, contexte de groupe,
   échelles/grilles (consolide #156)
   ----------------------------------------------------------------------------
   Terrain du 10 août 2026 (Grégoire, re-vérification des portes) :
   « J'ai essayé 6 puis 4 artefacts : les résultats changent, mais PAS
   PARTOUT » — le profil suit (69,8 %), la distribution P de l'aperçu dit
   « Incomplet : 23 ». Hypothèse principale : la distribution lit les
   indicesCP STOCKÉS, calculés AVANT la réparation #154 (productions
   invisibles → P nul pour tous) ; le profil calcule EN DIRECT.

   S'y ajoutent : l'en-tête passé de gr.00008 (Mar-Jeu) à gr.00002
   (Lun-Jeu) après un aller-retour A26↔H26 (le switch remet les pointeurs à
   null et re-sélectionne « le premier cours » — #446), et l'échelle
   personnelle absente du sélecteur (#156, jamais sondé).

   CE SCRIPT NE MODIFIE RIEN. Console sur H26 (Cmd+Option+J), coller,
   copier le bloc ==== DIAG #159 ====.
   ============================================================================ */
(async function diag159() {
    'use strict';
    const out = [];
    const L = s => out.push(s);
    L('==== DIAG #159 · ' + new Date().toISOString() + ' ====');

    // ── 1. Contexte : quel groupe est actif, et depuis quel pointeur ─────
    L('trimestreActif : ' + JSON.stringify(db.getSync('trimestreActif', null)));
    const infoCours = db.getSync('infoCours', null);
    L('infoCours : ' + (infoCours ? 'id=' + infoCours.id + ' groupe=' + JSON.stringify(infoCours.groupe) : 'ABSENT (null)'));
    const gca = db.getSync('groupeCoursActif', null);
    L('groupeCoursActif (pointeur) : ' + (gca ? gca.id + ' coursId=' + gca.coursId : 'ABSENT (null)'));
    const listeGC = db.getSync(cle('groupesCours'), []);
    L('— ' + cle('groupesCours') + ' (' + listeGC.length + ') —');
    listeGC.forEach(g => L('   · ' + g.id + ' « ' + (g.nom || '?') + ' » groupeNum=' + (g.groupeNum || g.groupe || '?') +
        ' actif=' + !!g.actif + ' horaireId=' + (g.horaireId || '?')));

    // ── 2. Indices stockés : frais ou d'avant la réparation ? ────────────
    const cp = db.getSync(cle('indicesCP'), {}) || {};
    const das = Object.keys(cp);
    L('— ' + cle('indicesCP') + ' : ' + das.length + ' étudiant·es —');
    das.slice(0, 8).forEach(da => {
        const e = cp[da] || {};
        const a = e.actuel || e;
        L('   · DA ' + da + ' → P=' + JSON.stringify(a.P) + ' C=' + JSON.stringify(a.C) +
          (a.noteConstructible !== undefined ? ' noteConstructible=' + a.noteConstructible : '') +
          (a.dateCalcul || a.date ? ' date=' + (a.dateCalcul || a.date) : ''));
    });
    if (das.length > 8) L('   … et ' + (das.length - 8) + ' autres');

    // ── 3. Échelles et grilles (consolide #156) ──────────────────────────
    L('echellePerformanceActive : ' + JSON.stringify(db.getSync('echellePerformanceActive', null)));
    L('drapeau migration modèles : ' + JSON.stringify(db.getSync('migration_modeles_namespacees_done', null)));
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
        } catch (e) { /* tant pis pour le scan */ }
    }
    for (const k of [...clesVues].sort()) {
        let v = db.memoryCache.has(k) ? db.memoryCache.get(k) : null;
        if (v === null) { try { const raw = localStorage.getItem(k); v = raw ? JSON.parse(raw) : null; } catch (e) { v = null; } }
        if (v === null) v = await lireIDB(k);
        if (!Array.isArray(v)) { L(k + ' → ' + (v === null ? 'ABSENT' : typeof v)); continue; }
        L(k + ' → ' + v.length + ' modèle(s) : ' + v.map(m => (m.id || '?') + ' « ' + (m.nom || '?') + ' »' +
            (m.dansBibliotheque === false ? ' ⚠filtré' : '')).join(' · '));
    }

    // ── 4. Snapshots du GC actif (fraîcheur) ─────────────────────────────
    const gcActif = listeGC.find(g => g && g.actif);
    if (gcActif) {
        const ksnap = cle('snapshots_' + gcActif.id);
        const snaps = db.getSync(ksnap, null) || db.getSync(cle('snapshots'), null);
        if (snaps && typeof snaps === 'object') {
            const dates = Array.isArray(snaps) ? snaps.map(s => s.date || s.dateSeance).slice(-3)
                : Object.keys(snaps).slice(-3);
            L('snapshots (' + (Array.isArray(snaps) ? snaps.length : Object.keys(snaps).length) + ') — derniers : ' + dates.join(' · '));
        } else L('snapshots : ABSENT');
    }

    L('==== FIN DIAG #159 ====');
    console.log(out.join('\n'));
})();
