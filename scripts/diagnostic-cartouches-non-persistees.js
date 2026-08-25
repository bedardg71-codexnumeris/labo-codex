/* ============================================================================
   DIAGNOSTIC — cartouches nouvellement configurées qui « ne persistent pas »
   ----------------------------------------------------------------------------
   Rapport terrain de Grégoire, 24 août 2026, 19 h 57 : « Mes cartouches
   nouvellement configurées n'ont pas persisté au changement de page. » La
   barre latérale n'affiche qu'une cartouche, alors que l'éditeur montrait
   « Carte mentale A26 » rattachée à « Grille-5 FR-HOLIS H26 ».

   POURQUOI CE SCRIPT EXISTE PLUTÔT QU'UN CORRECTIF. Trois reproductions ont
   été jouées dans un vrai navigateur, contre le vrai index.html, et TOUTES
   TROIS ont persisté au rechargement :
     · créer une cartouche à la main, recharger → elle survit ;
     · « Tout importer » 25 cartouches de 259 Ki, recharger → les 25 survivent ;
     · le formulaire et la barre latérale lisent la MÊME source de grilles
       (`cle('grillesTemplates')`), donc pas de décalage de périmètre.
   Ne reproduisant pas la perte, corriger à l'aveugle reviendrait à deviner.
   Ce script va chercher l'état réel.

   CE SCRIPT NE MODIFIE RIEN. Lecture seule des trois étages du stockage
   (localStorage, memoryCache, IndexedDB).

   ─────────────────────────────────────────────────────────────────────────
   USAGE — une seule fenêtre, celle du navigateur :

     1. Ouvre l'app sur l'état FAUTIF (celui de ta capture), SANS recharger.
     2. Console : Cmd+Option+J (Chrome) ou Cmd+Option+C (Safari).
        Si Chrome refuse le collage, tape d'abord `allow pasting` + Entrée.
     3. Colle CE FICHIER EN ENTIER, Entrée.
     4. Le rapport doit COMMENCER par
          ==== DIAG CARTOUCHES · <date> ====
        S'il commence autrement, c'est une ancienne copie : refais `git pull`.
     5. Copie tout le bloc et colle-le dans la conversation.
   ============================================================================ */
(async function diagCartouches() {
    'use strict';
    const out = [];
    const L = s => out.push(s);
    const ko = n => Math.round(n / 1024) + ' Ki';

    L('==== DIAG CARTOUCHES · ' + new Date().toISOString() + ' ====');

    // ── 1. Où on est
    const actif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : '(indisponible)';
    L('');
    L('-- CONTEXTE --');
    L('Version affichée      : ' + (window.VERSION_MAJEURE || '?') + ' build ' + (window.BUILD_ID || '?'));
    L('Trimestre actif       : ' + actif);
    L('Trimestre archivé ?   : ' + (window.estTrimestreArchive ? window.estTrimestreArchive() : '?'));
    L('Clé grilles résolue   : ' + (typeof cle === 'function' ? cle('grillesTemplates') : '?'));
    L('db.ready              : ' + (window.db ? db.ready : '?') + ' · useIndexedDB : ' + (window.db ? db.useIndexedDB : '?'));

    // ── 2. Les grilles du trimestre actif, et leurs cartouches
    const grilles = (typeof cle === 'function' ? await db.get(cle('grillesTemplates')) : null) || [];
    L('');
    L('-- GRILLES DU TRIMESTRE ACTIF : ' + grilles.length + ' --');

    let totalCartouches = 0;
    for (const g of grilles) {
        if (!g || !g.id) { L('  (entrée sans id)'); continue; }
        const lot = await db.get('cartouches_' + g.id) || [];
        const visibles = lot.filter(c => c && c.dansBibliotheque !== false).length;
        totalCartouches += lot.length;
        L('  ' + (g.nom || 'sans nom') + '  [' + g.id + ']');
        L('     cartouches_' + g.id + ' : ' + lot.length + ' cartouche(s), '
          + visibles + ' visible(s) en barre latérale, ' + ko(JSON.stringify(lot).length));
        lot.forEach(c => L('        · ' + (c.nom || 'sans nom')
          + (c.dansBibliotheque === false ? '  [MASQUÉE : dansBibliotheque=false]' : '')
          + (c.inspireDeTrimestre ? '  [importée de ' + c.inspireDeTrimestre + ']' : '')));
    }
    L('  TOTAL : ' + totalCartouches + ' cartouche(s) rattachée(s) aux grilles de ce trimestre.');

    // ── 3. TOUTES les clés cartouches_* du stockage, y compris orphelines
    //    C'est le cœur du diagnostic : une cartouche écrite sous une grille qui
    //    n'est pas (ou plus) dans le trimestre actif existe, mais reste
    //    INVISIBLE — la barre latérale n'énumère que les grilles de l'actif.
    L('');
    L('-- TOUTES LES CLÉS cartouches_* DU STOCKAGE --');
    const idsGrillesActif = new Set(grilles.map(g => g && g.id).filter(Boolean));
    const vues = new Set();

    const ajouterCle = async (k) => {
        if (!k || k.indexOf('cartouches_') === -1 || vues.has(k)) return;
        vues.add(k);
        const lot = await db.get(k) || [];
        const idGrille = k.slice(k.indexOf('cartouches_') + 'cartouches_'.length);
        const rattachee = idsGrillesActif.has(idGrille);
        L('  ' + k + ' : ' + (Array.isArray(lot) ? lot.length + ' cartouche(s)' : 'forme inattendue')
          + (rattachee ? '' : '   ⚠ ORPHELINE — sa grille n\'est PAS dans le trimestre actif'));
        if (!rattachee && Array.isArray(lot)) {
            lot.slice(0, 8).forEach(c => L('        · ' + (c && c.nom || 'sans nom')));
            if (lot.length > 8) L('        · … et ' + (lot.length - 8) + ' autre(s)');
        }
    };

    try { for (let i = 0; i < localStorage.length; i++) await ajouterCle(localStorage.key(i)); } catch (e) {}
    try { if (db.memoryCache) for (const k of db.memoryCache.keys()) await ajouterCle(k); } catch (e) {}
    try {
        if (typeof db.keys === 'function') {
            const toutes = await db.keys();
            if (toutes && typeof toutes.forEach === 'function') {
                for (const k of toutes) await ajouterCle(k);
            }
        }
    } catch (e) { L('  (énumération db.keys indisponible : ' + (e && e.message) + ')'); }
    if (vues.size === 0) L('  (aucune clé cartouches_* trouvée)');

    // ── 4. Les grilles des AUTRES trimestres, pour situer
    L('');
    L('-- GRILLES PAR TRIMESTRE --');
    try {
        const trimestres = (typeof obtenirTrimestres === 'function') ? (obtenirTrimestres() || []) : [];
        for (const t of trimestres) {
            if (!t || !t.id) continue;
            const lot = await db.get(t.id + '_grillesTemplates') || [];
            L('  ' + (t.nom || t.id) + ' [' + t.id + ']' + (t.id === actif ? '  ← ACTIF' : '')
              + ' : ' + lot.length + ' grille(s)');
        }
        const nu = await db.get('grillesTemplates');
        L('  (clé globale nue « grillesTemplates ») : ' + (nu === null ? 'ABSENTE' : (nu || []).length + ' grille(s)'));
    } catch (e) { L('  (indisponible : ' + (e && e.message) + ')'); }

    L('');
    L('==== FIN DIAG CARTOUCHES ====');

    const texte = out.join('\n');
    console.log(texte);
    try { await navigator.clipboard.writeText(texte); console.log('(rapport copié dans le presse-papiers)'); } catch (e) {}
    return texte;
})();
