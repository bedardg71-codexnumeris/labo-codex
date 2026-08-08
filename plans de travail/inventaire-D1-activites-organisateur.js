/* ============================================================================
 * D1 — Inventaire des rattachements portés par les ACTIVITÉS de l'Organisateur
 *
 * Répond à UNE question, avant de supprimer la page « Plan de la leçon » :
 *   « `planification_seances[<carte>::<lecon>].activites[<act>]` contient-il
 *     quelque chose qui vaut d'être migré, ou est-ce vide ? »
 *
 * Si le total est ZÉRO : rien à MIGRER — mais la page ne peut PAS être
 *   supprimée pour autant. Le veto D2b du 8 août a montré que l'Organisateur
 *   porte une CAPACITÉ absente de la Carte : l'Inspecteur ne propose la
 *   rétroaction que sur un nœud Évaluation (`type === 'evaluation'`), jamais
 *   sur une activité. Ce relevé tranche l'existence de DONNÉES, pas celle du
 *   BESOIN.
 * Si ce n'est pas zéro : on sait en plus quoi migrer, vers quoi, et combien.
 *
 * LECTURE SEULE. Aucune écriture, aucun db.setSync, aucune purge. Le script
 * balaie TOUS les trimestres (pas seulement l'actif) : la clé est namespacée
 * depuis #367, et un rattachement peut dormir dans un trimestre inactif.
 *
 * USAGE (Safari, Mac) :
 *   1. Ouvre l'app normalement (pas besoin du mode démo — il fausserait plutôt).
 *   2. Console (Cmd+Option+C).
 *   3. Colle TOUT ce fichier d'un coup.
 *   4. Renvoie-moi la table imprimée, ou `window.__D1` en entier.
 * ==========================================================================*/
(function inventaireD1() {
    if (typeof db === 'undefined') {
        console.warn('[D1] `db` introuvable — scripts non chargés ?');
        return;
    }

    var trimestres = db.getSync('trimestres', []) || [];
    if (!Array.isArray(trimestres) || trimestres.length === 0) {
        console.warn('[D1] Aucun trimestre trouvé.');
        return;
    }

    var lignes = [];
    var detail = [];
    var total = { lecons: 0, activites: 0, retroactions: 0, productions: 0, orphelines: 0 };

    trimestres.forEach(function (t) {
        if (!t || !t.id) return;

        var seances = db.getSync(t.id + '_planification_seances', {}) || {};
        // Les productions vivantes du trimestre, pour repérer les références mortes
        // (c'est le trou §2.2 : la reprise inter-trimestre ne contrôle rien).
        // ⚠ Repli sur la clé NUE, comme `trimestres.js:717`. Sans lui, un
        // trimestre dont les productions vivent encore sous la clé non
        // namespacée verrait TOUTES ses références déclarées mortes — le relevé
        // accuserait un faux massacre. C'est l'asymétrie lecture/écriture qui a
        // causé #419 : lire par un chemin, juger par un autre.
        var prods = db.getSync(t.id + '_productions', null);
        if (prods === null) prods = db.getSync('productions', []) || [];
        var idsVivants = {};
        if (Array.isArray(prods)) prods.forEach(function (p) { if (p && p.id) idsVivants[p.id] = true; });

        var n = { lecons: 0, activites: 0, retroactions: 0, productions: 0, orphelines: 0 };

        Object.keys(seances).forEach(function (cleNote) {
            var entree = seances[cleNote];
            if (!entree || typeof entree !== 'object') return;
            var actes = entree.activites;
            if (!actes || typeof actes !== 'object') return;

            var idsAct = Object.keys(actes);
            if (idsAct.length === 0) return;
            n.lecons++;

            idsAct.forEach(function (actId) {
                var c = actes[actId];
                if (!c || typeof c !== 'object') return;
                n.activites++;

                // « aucune » est la valeur par défaut du sélecteur : ce n'est PAS
                // un rattachement. Ne compter que ce qui a été posé sciemment.
                var aRetro = c.retroaction && c.retroaction !== 'aucune';
                var aProd = !!c.productionId;
                if (aRetro) n.retroactions++;
                if (aProd) {
                    n.productions++;
                    if (!idsVivants[c.productionId]) n.orphelines++;
                }

                if (aRetro || aProd) {
                    detail.push({
                        trimestre: t.id,
                        cleNote: cleNote,
                        activite: actId,
                        retroaction: c.retroaction || null,
                        productionId: c.productionId || null,
                        productionVivante: aProd ? !!idsVivants[c.productionId] : null
                    });
                }
            });
        });

        Object.keys(n).forEach(function (k) { total[k] += n[k]; });
        lignes.push({
            Trimestre: t.id,
            'Leçons avec activités': n.lecons,
            'Activités': n.activites,
            'Rétroactions posées': n.retroactions,
            'Productions rattachées': n.productions,
            '⚠ Réf. mortes': n.orphelines
        });
    });

    lignes.push({
        Trimestre: '— TOTAL —',
        'Leçons avec activités': total.lecons,
        'Activités': total.activites,
        'Rétroactions posées': total.retroactions,
        'Productions rattachées': total.productions,
        '⚠ Réf. mortes': total.orphelines
    });

    console.table(lignes);

    var aMigrer = total.retroactions + total.productions;
    if (aMigrer === 0) {
        console.warn('[D1] ⮕ VERDICT : RIEN à migrer.');
        console.warn('[D1] ⚠ Cela ne veut PAS dire que la page peut être supprimée : '
            + 'le sélecteur de rétroaction n’existe que sur les nœuds Évaluation, '
            + 'donc l’Organisateur reste le seul endroit où poser une rétroaction '
            + 'formative sur une activité. La CAPACITÉ est à porter dans tous les cas.');
    } else {
        console.warn('[D1] ⮕ VERDICT : ' + aMigrer + ' rattachement(s) à migrer ('
            + total.retroactions + ' rétroaction(s), ' + total.productions + ' production(s)).'
            + (total.orphelines > 0
                ? ' ⚠ dont ' + total.orphelines + ' référence(s) MORTE(S) — voir §2.2 de l’audit.'
                : ''));
        console.warn('[D1] Détail dans window.__D1.detail');
    }

    window.__D1 = { lignes: lignes, total: total, detail: detail };
    return window.__D1;
})();
