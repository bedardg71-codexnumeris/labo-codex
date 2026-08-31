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
   ─────────────────────────────────────────────────────────────────────────
   ⚠ RÉGIME DES CLÉS DEPUIS S5/#623 — LIRE AVANT DE TOUCHER À UNE CLÉ ICI.

   `cartouches_<grilleId>` n'est plus une clé de stockage. Le magasin vit sous
   `<trimestreId>_cartouches_<grilleId>`, un exemplaire PAR TRIMESTRE (la
   migration au boot a copié le lot dans chacun — js/trimestres.js:1044).

   TROIS RÈGLES, et la deuxième est l'inverse de la première :
     R1 · LIRE   = balayer TOUS les trimestres, et NOMMER lequel. Ce n'est pas
                   une précaution : un outil qui ne lirait que le trimestre
                   actif sous-compterait PAR CONSTRUCTION, puisque le même lot
                   existe légitimement dans chaque trimestre.
     R2 · ÉCRIRE = exiger un trimestre EXPLICITE, et refuser sans lui. Balayer
                   en écriture recréerait exactement le partage entre trimestres
                   que S5 vient de refermer.
     R3 · Une source DATÉE (dump, backup) garde ses clés d'époque : ce qui
                   décide, c'est le RÉGIME de la donnée, pas son support.
   ⮕ Donc `'cartouches_' + id` demande DEUX traitements OPPOSÉS selon qu'elle
     lit ou qu'elle écrit — parfois à quarante lignes d'écart dans un fichier.

   ⚠⚠ « SURVIVRE AU GREP » ≠ « JUSTE APRÈS S5 ». Un prédicat sur ces clés a
   TROIS issues, pas deux (mesuré le 31 août 2026 sur les deux régimes) :
     · ancré   (`startsWith`, `indexOf(…)===0`, `/^cartouches_/`) → MENT PAR
       ZÉRO : ne voit plus rien, et « 0 trouvé » se lit « rien à réparer » ;
     · lâche   (`indexOf(…) !== -1`) → MENT PAR INFLATION : voit les copies de
       TOUS les trimestres et compte la même grille autant de fois ;
     · décomposé (ci-dessous) → voit ET attribue. C'est le seul juste.
   ============================================================================ */
(async function diagCartouches() {
    'use strict';
    const out = [];
    const L = s => out.push(s);
    const ko = n => Math.round(n / 1024) + ' Ki';

    /**
     * Décompose une clé de cartouches dans les DEUX régimes.
     * @returns {{trimestre: string|null, grilleId: string}|null}
     *   trimestre === null ⇒ clé NUE (résidu pré-S5 non migré : à signaler,
     *   c'est un état que la migration au boot aurait dû résorber).
     * Ni ancré ni lâche : c'est la troisième issue, celle qui attribue.
     *
     * ⚠ LE PRÉFIXE DOIT ÊTRE UN ID DE TRIMESTRE, ET C'EST UNE GARDE PAYÉE.
     * Premier jet : « le motif suit un `_` » — trop large. Il happait
     * `migration_cartouches_namespacees_done`, le DRAPEAU POSÉ PAR LA MIGRATION
     * S5 ELLE-MÊME (js/main.js:735), dont la valeur est un booléen : le rapport
     * plantait sur `.forEach`. Trouvé par Playwright le 31 août 2026, pas à la
     * relecture. C'est exactement le défaut « prédicat lâche » décrit en tête de
     * fichier — desserrer un ancrage happe des clés d'une AUTRE famille.
     * ⮕ `[ahe]\d{4}` couvre les trois sessions (`creerTrimestre` accepte 'A',
     *   'H' et 'E' — js/trimestres.js), `demo` couvre le pack de démonstration.
     *   Si la fabrique d'ids change, ce motif doit changer AVEC elle.
     */
    const RE_TRIMESTRE = /^([ahe]\d{4}|demo)$/;
    const decomposerCleCartouches = (k) => {
        if (typeof k !== 'string') return null;
        const i = k.indexOf('cartouches_');
        if (i === -1) return null;
        // Nue = commence par le motif ; namespacée = un ID DE TRIMESTRE puis `_`.
        if (i === 0) return { trimestre: null, grilleId: k.slice('cartouches_'.length) };
        const prefixe = k.slice(0, i - 1);
        if (k[i - 1] !== '_' || !RE_TRIMESTRE.test(prefixe)) return null;
        return { trimestre: prefixe, grilleId: k.slice(i + 'cartouches_'.length) };
    };

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

    // R1 restreint au trimestre ACTIF : cette section-ci décrit ce que la barre
    // latérale montre, donc l'actif et lui seul. Le balayage de tous les
    // trimestres est la section 3. `cle()` résout vers `<actif>_cartouches_<id>`.
    //
    // ⚠ Sans `cle()`, on NE retombe PAS sur la clé nue : elle ne désigne plus
    // rien depuis S5, et la lire rendrait un 0 qui se lirait « aucune cartouche »
    // au lieu de « je n'ai pas su où regarder ». Le script le DIT et s'abstient.
    const routageDispo = (typeof cle === 'function');
    if (!routageDispo) {
        L('  ⛔ `cle()` indisponible — es-tu bien dans l\'onglet de l\'app ? Sans elle,');
        L('     ce script ne peut PAS savoir où vivent les cartouches du trimestre actif.');
        L('     Section NON CONCLUANTE (ce n\'est pas « aucune cartouche »).');
    }
    let totalCartouches = 0;
    for (const g of grilles) {
        if (!g || !g.id) { L('  (entrée sans id)'); continue; }
        L('  ' + (g.nom || 'sans nom') + '  [' + g.id + ']');
        if (!routageDispo) { L('     (clé non résolue — voir ci-dessus)'); continue; }
        const cleLot = cle('cartouches_' + g.id);
        const lot = await db.get(cleLot) || [];
        const visibles = lot.filter(c => c && c.dansBibliotheque !== false).length;
        totalCartouches += lot.length;
        L('     ' + cleLot + ' : ' + lot.length + ' cartouche(s), '
          + visibles + ' visible(s) en barre latérale, ' + ko(JSON.stringify(lot).length));
        lot.forEach(c => L('        · ' + (c.nom || 'sans nom')
          + (c.dansBibliotheque === false ? '  [MASQUÉE : dansBibliotheque=false]' : '')
          + (c.inspireDeTrimestre ? '  [importée de ' + c.inspireDeTrimestre + ']' : '')));
    }
    L('  TOTAL : ' + (routageDispo
        ? totalCartouches + ' cartouche(s) rattachée(s) aux grilles de ce trimestre.'
        : 'NON MESURÉ (routage indisponible) — ne pas lire ce total comme un zéro.'));

    // ── 3. TOUTES les clés de cartouches du stockage, y compris orphelines
    //    C'est le cœur du diagnostic : une cartouche écrite sous une grille qui
    //    n'est pas (ou plus) dans SON trimestre existe, mais reste INVISIBLE —
    //    la barre latérale n'énumère que les grilles du trimestre actif.
    //
    // ⚠ R1 — CE QUI A CHANGÉ AVEC S5, ET POURQUOI LE PRÉDICAT LÂCHE NE SUFFIT PAS.
    // Le test `indexOf('cartouches_') !== -1` voit toujours les clés (il n'a pas
    // menti par zéro), mais il ne dit plus À QUI elles appartiennent. Or la
    // migration a copié le même lot dans CHAQUE trimestre : comparer aux grilles
    // du trimestre ACTIF marquait « ⚠ ORPHELINE » toutes les copies des autres
    // trimestres — un faux positif par trimestre et par grille. On décompose donc
    // la clé et on juge chaque lot DANS SON PROPRE trimestre.
    L('');
    L('-- TOUTES LES CLÉS DE CARTOUCHES DU STOCKAGE (tous trimestres) --');

    // Catalogue des grilles PAR trimestre — le référentiel d'orphelinat.
    const grillesParTrimestre = new Map();   // trimestreId → Set(grilleId)
    try {
        const tousTrimestres = (typeof obtenirTrimestres === 'function') ? (obtenirTrimestres() || []) : [];
        for (const t of tousTrimestres) {
            if (!t || !t.id) continue;
            const lot = await db.get(t.id + '_grillesTemplates') || [];
            grillesParTrimestre.set(t.id, new Set(lot.map(g => g && g.id).filter(Boolean)));
        }
    } catch (e) { L('  (catalogue des grilles par trimestre indisponible : ' + (e && e.message) + ')'); }

    const vues = new Set();
    let nues = 0;

    const ajouterCle = async (k) => {
        const d = decomposerCleCartouches(k);
        if (!d || vues.has(k)) return;
        vues.add(k);
        const lot = await db.get(k) || [];
        const taille = Array.isArray(lot) ? lot.length + ' cartouche(s)' : 'forme inattendue';

        if (d.trimestre === null) {
            // Clé NUE encore présente : la migration au boot ne l'a pas résorbée.
            // Ce n'est pas un orphelin, c'est un RÉSIDU — état distinct, et le
            // confondre avec un orphelin enverrait vers la mauvaise réparation.
            nues++;
            L('  ' + k + ' : ' + taille + '   ⚠ CLÉ NUE (régime pré-S5) — la migration '
              + 'au boot ne l\'a pas migrée ; plus aucun écran ne la lit.');
            return;
        }

        const connuesDuTrimestre = grillesParTrimestre.get(d.trimestre);
        if (!connuesDuTrimestre) {
            L('  ' + k + ' : ' + taille + '   ⚠ trimestre « ' + d.trimestre
              + ' » INCONNU du registre — clé sans propriétaire.');
            return;
        }
        const rattachee = connuesDuTrimestre.has(d.grilleId);
        L('  ' + k + ' : ' + taille + '   [trimestre ' + d.trimestre + ']'
          + (rattachee ? '' : '   ⚠ ORPHELINE — la grille ' + d.grilleId
             + ' n\'est PAS dans les grilles de ' + d.trimestre));
        if (!rattachee && Array.isArray(lot)) {
            lot.slice(0, 8).forEach(c => L('        · ' + (c && c.nom || 'sans nom')));
            if (lot.length > 8) L('        · … et ' + (lot.length - 8) + ' autre(s)');
        }
    };

    // Compter les clés VUES à chaque étage : c'est le témoin qui donne son sens
    // au zéro final. Un « 0 cartouche » sur 0 clé examinée dit « je n'ai rien
    // regardé » ; sur 400 clés examinées il dit « il n'y a rien ». Sans ce
    // compteur, les deux s'écrivent pareil.
    let clesExaminees = 0;
    try { for (let i = 0; i < localStorage.length; i++) { clesExaminees++; await ajouterCle(localStorage.key(i)); } } catch (e) {}
    try { if (db.memoryCache) for (const k of db.memoryCache.keys()) { clesExaminees++; await ajouterCle(k); } } catch (e) {}
    try {
        if (typeof db.keys === 'function') {
            const toutes = await db.keys();
            if (toutes && typeof toutes.forEach === 'function') {
                for (const k of toutes) { clesExaminees++; await ajouterCle(k); }
            }
        }
    } catch (e) { L('  (énumération db.keys indisponible : ' + (e && e.message) + ')'); }
    if (vues.size === 0) {
        L(clesExaminees === 0
            ? '  ⛔ AUCUNE CLÉ EXAMINÉE — énumération du stockage indisponible. Ce n\'est PAS'
              + ' « aucune cartouche » : le script n\'a rien pu regarder.'
            : '  (aucune clé de cartouches parmi les ' + clesExaminees + ' clés examinées)');
    } else {
        L('  → ' + vues.size + ' clé(s) de cartouches sur ' + clesExaminees + ' clé(s) examinée(s)'
          + (nues ? '   ⚠ dont ' + nues + ' NUE(S), non migrée(s)' : ''));
    }

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
