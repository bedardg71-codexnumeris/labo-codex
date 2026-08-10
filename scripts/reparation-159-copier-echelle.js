/* ============================================================================
   RÉPARATION #159b — copier une échelle personnelle vers d'autres trimestres
   ----------------------------------------------------------------------------
   Constat (sonde #159, 10 août 2026) : les échelles personnelles de Grégoire
   (« IDME et niv 0 ») ne vivent QUE dans `a2025_echellesTemplates` ;
   `h2026_echellesTemplates` n'a que l'exemple générique, et `a2026` (la
   rentrée) n'a encore rien. Les sélecteurs d'échelle lisent le trimestre
   actif → son échelle est introuvable partout sauf en a2025.

   PATRON Brique C (#357) : la copie inter-trimestre est une COPIE — id neuf,
   champ `inspireDe`, source INTOUCHÉE.

   - `reparer159b()`                       → DRY-RUN : liste les échelles
     candidates de tous les trimestres, n'écrit rien
   - `reparer159b({ source: 'ECH…', vers: ['h2026','a2026'], executer: true })`
     → copie l'échelle désignée vers les trimestres nommés
   - Refuse : source introuvable, trimestre cible où un modèle du même nom
     existe déjà (pas de doublon silencieux — la sonde a déjà trouvé
     « IDME et niv 0 » en DOUBLE dans a2025, famille #442).
   ============================================================================ */
(function () {
    'use strict';

    function _stores() {
        const cles = new Set();
        Object.keys(localStorage).forEach(k => { if (k.endsWith('_echellesTemplates')) cles.add(k); });
        for (const k of db.memoryCache.keys()) { if (String(k).endsWith('_echellesTemplates')) cles.add(String(k)); }
        return [...cles].sort();
    }
    function _lire(k) {
        if (db.memoryCache.has(k)) return db.memoryCache.get(k) || [];
        try { const raw = localStorage.getItem(k); return raw ? (JSON.parse(raw) || []) : []; }
        catch (e) { return []; }
    }

    window.reparer159b = function (opts) {
        opts = opts || {};
        const out = [];
        const L = s => out.push(s);
        const executer = !!opts.executer;
        L('==== RÉPARATION #159b · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');

        // Inventaire
        const stores = _stores();
        let sourceEchelle = null, sourceStore = null;
        stores.forEach(k => {
            const liste = _lire(k);
            L('— ' + k + ' (' + liste.length + ') —');
            liste.forEach(e => {
                L('   · ' + e.id + ' « ' + (e.nom || '?') + ' » — ' + ((e.niveaux || []).length) + ' niveaux' +
                  ((e.niveaux || []).length ? ' [' + e.niveaux.map(n => n.code).join('/') + ']' : ''));
                if (opts.source && e.id === opts.source) { sourceEchelle = e; sourceStore = k; }
            });
        });

        if (!opts.source) {
            L('');
            L('DRY-RUN d\'inventaire. Pour copier :');
            L("    reparer159b({ source: 'ECH…', vers: ['h2026','a2026'], executer: true })");
            console.log(out.join('\n'));
            return;
        }
        if (!sourceEchelle) {
            L('⛔ REFUS : échelle « ' + opts.source + ' » introuvable. Rien n\'a été écrit.');
            console.log(out.join('\n'));
            return;
        }
        const vers = Array.isArray(opts.vers) ? opts.vers : [];
        if (vers.length === 0) {
            L('⛔ REFUS : préciser les trimestres cibles — vers: [\'h2026\', \'a2026\']');
            console.log(out.join('\n'));
            return;
        }

        L('Source : ' + sourceEchelle.id + ' « ' + sourceEchelle.nom + ' » (' + sourceStore + ') — la source ne sera PAS modifiée');
        vers.forEach(trim => {
            const kCible = trim + '_echellesTemplates';
            const liste = _lire(kCible);
            const homonyme = liste.find(e => (e.nom || '').trim() === (sourceEchelle.nom || '').trim());
            if (homonyme) {
                L('⚠ ' + kCible + ' : un modèle « ' + homonyme.nom + ' » existe déjà (' + homonyme.id + ') — SAUTÉ (pas de doublon)');
                return;
            }
            const copie = JSON.parse(JSON.stringify(sourceEchelle));
            copie.id = 'ECH_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            copie.inspireDe = sourceEchelle.id;
            copie.dansBibliotheque = true;
            if (!executer) {
                L('→ ' + kCible + ' : COPIERAIT « ' + copie.nom + ' » sous l\'id ' + copie.id);
                return;
            }
            liste.push(copie);
            db.setSync(kCible, liste);
            L('✔ ' + kCible + ' : « ' + copie.nom + ' » copiée (' + copie.id + ', inspireDe=' + sourceEchelle.id + ')');
        });

        if (!executer) L('\nSi le plan est bon ET que le backup Codex est fait : rejouer avec executer: true');
        else L('\n✅ Terminé. Recharge la page — les sélecteurs d\'échelle des trimestres cibles la verront.');
        console.log(out.join('\n'));
    };

    console.log('#159b chargé. D\'abord : reparer159b()  (inventaire, n\'écrit rien)');
})();
