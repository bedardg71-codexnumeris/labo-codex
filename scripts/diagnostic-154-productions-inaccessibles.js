/* ============================================================================
   DIAGNOSTIC #154 — productions et groupes-cours inaccessibles (H26)
   ----------------------------------------------------------------------------
   Rapport terrain de Grégoire, 9 août 2026 : la Liste des étudiant·es affiche
   ses 23 personnes avec l'assiduité, mais C=0 %, P=—, le profil dit « Aucune
   production configurée » et le formulaire Groupe-cours est vide. « Cette
   rupture est assez fréquente. »

   CE SCRIPT NE MODIFIE RIEN. Il lit les trois étages du stockage hybride
   (localStorage, memoryCache, IndexedDB) pour les clés en cause et imprime un
   rapport à coller tel quel dans la conversation.

   Usage : ouvrir l'app sur l'état FAUTIF (avant tout rechargement), console
   (Cmd+Option+J sur Chrome, Cmd+Option+C sur Safari), coller tout le fichier,
   Entrée. Copier le bloc « ==== DIAG #154 ==== ».

   Hypothèses qu'il départage :
     A. Boot/saturation — clés en IDB seulement, lecture avant la synchro
        (famille #413/#418 ; localStorage à 173 % du budget, cf. #353)
     B. Données — coursId des productions ≠ cours actif (famille #346),
        et/ou liste groupesCours réellement vide dans le trimestre
     C. Pointeur — trimestreActif mal résolu, lectures dans le mauvais préfixe
   ============================================================================ */
(async function diag154() {
    'use strict';
    const out = [];
    const L = s => out.push(s);
    const forme = v => v === null ? 'ABSENT'
        : v === undefined ? '—'
        : Array.isArray(v) ? v.length + ' élément(s)'
        : typeof v === 'object' ? 'objet'
        : JSON.stringify(v);

    L('==== DIAG #154 · ' + new Date().toISOString() + ' ====');

    // ── 1. Les pointeurs de contexte ──────────────────────────────────────
    const tA = db.getSync('trimestreActif', null);
    L('trimestreActif (storage) : ' + forme(tA) + ' · window.trimestreActif : ' + forme(window.trimestreActif));
    L('cle("groupesCours") résout vers : ' + (typeof window.cle === 'function' ? window.cle('groupesCours') : '⚠ window.cle ABSENT'));
    L('db.useIndexedDB : ' + db.useIndexedDB + ' · db.ready : ' + db.ready + ' · memoryCache : ' + db.memoryCache.size + ' clé(s)');
    L('mode démo : ' + (typeof estEnModeDemo === 'function' && estEnModeDemo() ? 'OUI ⚠' : 'non'));

    const infoCours = db.getSync('infoCours', null);
    L('infoCours : ' + (infoCours ? 'id=' + infoCours.id + ' · groupe=' + JSON.stringify(infoCours.groupe) : 'ABSENT'));
    const gca = db.getSync('groupeCoursActif', null);
    L('groupeCoursActif (pointeur) : ' + (gca ? 'id=' + gca.id + ' · coursId=' + gca.coursId + ' · horaireId=' + gca.horaireId : 'ABSENT'));

    // ── 2. Sonde trois-étages par clé ─────────────────────────────────────
    async function lireIDB(k) {
        if (!db.useIndexedDB || !db.db) return 'IDB indisponible';
        try {
            return await new Promise((res, rej) => {
                const rq = db.db.transaction(['keyvalue'], 'readonly').objectStore('keyvalue').get(k);
                rq.onsuccess = () => res(rq.result ? rq.result.value : null);
                rq.onerror = () => rej(rq.error);
            });
        } catch (e) { return 'ERREUR ' + (e && e.name); }
    }
    async function sonde(base) {
        const k = typeof window.cle === 'function' ? window.cle(base) : base;
        let ls;
        try { const raw = localStorage.getItem(k); ls = raw === null ? null : JSON.parse(raw); }
        catch (e) { ls = 'ERREUR ' + e.name; }
        const mc = db.memoryCache.has(k) ? db.memoryCache.get(k) : undefined;
        const idb = await lireIDB(k);
        L(k + ' → localStorage: ' + forme(ls) + ' · memoryCache: ' + forme(mc) + ' · IndexedDB: ' + forme(idb));
        // La valeur « vue » par l'app = memoryCache puis localStorage (getSync)
        return mc !== undefined ? mc : ls;
    }

    L('— Sonde trois-étages (ce que chaque étage contient réellement) —');
    const gcVus    = await sonde('groupesCours');
    const prodVues = await sonde('productions');
    await sonde('groupeEtudiants');
    await sonde('evaluationsSauvegardees');
    await sonde('indicesCP');

    // ── 3. Analyse coursId (hypothèse B, famille #346) ────────────────────
    if (Array.isArray(gcVus) && gcVus.length) {
        L('— groupesCours vus par l’app —');
        gcVus.forEach(g => L('  · ' + g.id + ' « ' + (g.nom || '?') + ' » coursId=' + g.coursId +
            ' groupeNum=' + (g.groupeNum || g.groupe || '?') + ' actif=' + !!g.actif + (g.isDemo ? ' [démo]' : '')));
    } else {
        L('groupesCours vus par l’app : VIDE — c’est le sélecteur vide de la capture 3');
    }
    if (Array.isArray(prodVues) && prodVues.length) {
        const parCours = {};
        prodVues.forEach(p => { const c = p.coursId || '(sans coursId)'; parCours[c] = (parCours[c] || 0) + 1; });
        L('— productions brutes par coursId (avant filtre) —');
        Object.keys(parCours).forEach(c => L('  · ' + c + ' : ' + parCours[c] + ' production(s)' +
            (infoCours && c === infoCours.id ? '  ← MATCH infoCours' : '')));
    }
    if (typeof obtenirDonneesSelonMode === 'function') {
        L('productions APRÈS filtre (ce que voient les écrans) : ' + obtenirDonneesSelonMode('productions').length);
    }

    // ── 4. Ces clés existent-elles sous un AUTRE préfixe de trimestre ? ───
    const suffixes = ['_groupesCours', '_productions'];
    const ailleursLS = Object.keys(localStorage).filter(k => suffixes.some(s => k.endsWith(s)));
    L('clés *_groupesCours / *_productions dans localStorage : ' + (ailleursLS.join(' · ') || 'aucune'));
    if (db.useIndexedDB && db.db) {
        try {
            const toutes = await new Promise((res, rej) => {
                const rq = db.db.transaction(['keyvalue'], 'readonly').objectStore('keyvalue').getAllKeys();
                rq.onsuccess = () => res(rq.result || []); rq.onerror = () => rej(rq.error);
            });
            L('… et dans IndexedDB : ' + (toutes.filter(k => suffixes.some(s => String(k).endsWith(s))).join(' · ') || 'aucune'));
        } catch (e) { L('… scan IndexedDB impossible : ' + (e && e.name)); }
    }

    // ── 5. Budget de stockage (hypothèse A, #353) ─────────────────────────
    if (db.statsStockage) {
        const st = db.statsStockage(5);
        L('— budget localStorage — ' + Math.round(st.octets / 1024) + ' Ko / ' +
          Math.round(st.budget / 1024) + ' Ko (' + Math.round(st.ratio * 100) + ' %) · ' + st.nbCles + ' clés');
        st.topCles.forEach(x => L('  top · ' + x.cle + ' : ' + Math.round(x.octets / 1024) + ' Ko'));
    }

    L('==== FIN DIAG #154 ====');
    console.log(out.join('\n'));
})();
