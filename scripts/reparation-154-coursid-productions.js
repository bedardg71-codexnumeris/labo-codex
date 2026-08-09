/* ============================================================================
   RÉPARATION #154 — réapparier les coursId périmés (productions, évaluations,
   présences) sur le cours réel du trimestre actif
   ----------------------------------------------------------------------------
   Diagnostic confirmé (sonde du 9 août 2026, données réelles H26) : les 11
   productions portent `coursId=COURS1766455789356` (format d'avant la
   migration, décembre 2025) alors que le cours actif est
   `h2026-601-101-MQ-00001`. Le filtre de `obtenirDonneesSelonMode`
   (coursId === cours actif) rend donc zéro production, et l'indice C tombe à
   0 % en cascade. C'est la résurgence du #346 (« réparé en données » le
   24 juin — la réparation n'avait pas de vecteur durable).

   MÉCANIQUE (précédent : corrigerHorairesGroupes, bug #129) :
   - `reparer154()`            → DRY-RUN : imprime le plan, n'écrit RIEN
   - `reparer154({executer:true})` → applique, après backup Codex
   - `annuler154()`            → restaure l'état d'avant (même session
                                  seulement — le filet inter-session est le
                                  backup Codex)

   GARDE-FOUS :
   - La cible est le coursId du groupe-cours ACTIF, à condition qu'il existe
     dans le magasin `cours`. À défaut, le cours unique du magasin. Si aucune
     cible sûre (multi-cours ambigu, id périmé présent comme VRAI cours), le
     script REFUSE et imprime pourquoi — il ne devine jamais.
   - Ne réécrit que le champ `coursId` des items dont l'id ne correspond à
     AUCUN cours du magasin. Un item pointant sur un autre cours réel n'est
     pas touché.
   - Pré-image gardée dans `window._pre154` pour `annuler154()`.

   Usage : console (Cmd+Option+J), coller le fichier, Entrée, puis appeler
   `reparer154()`. Coller le rapport dans la conversation AVANT d'exécuter.
   ============================================================================ */
(function () {
    'use strict';

    function _analyser() {
        const cours = db.getSync('cours', []);
        const idsValides = new Set(cours.map(c => c.id));
        const listeGC = db.getSync(cle('groupesCours'), []);
        const gcActif = listeGC.find(g => g && g.actif);

        // Choix de la cible
        let cible = null, motifCible = '';
        if (gcActif && idsValides.has(gcActif.coursId)) {
            cible = gcActif.coursId;
            motifCible = 'coursId du groupe-cours ACTIF (' + gcActif.id + '), présent dans le magasin cours';
        } else if (cours.length === 1) {
            cible = cours[0].id;
            motifCible = 'cours UNIQUE du magasin';
        }

        const clesData = ['productions', 'evaluationsSauvegardees', 'presences'];
        const plan = { cible, motifCible, cours, gcActif, cles: {} };

        clesData.forEach(base => {
            const k = cle(base);
            const donnees = db.getSync(k, []);
            const items = Array.isArray(donnees) ? donnees : [];
            const perimes = {};      // coursId périmé → compte
            const autresValides = {}; // coursId ≠ cible mais VRAI cours → compte (non touchés)
            let sansCoursId = 0;
            items.forEach(it => {
                if (!it || !it.coursId) { sansCoursId++; return; }
                if (idsValides.has(it.coursId)) {
                    if (it.coursId !== cible) autresValides[it.coursId] = (autresValides[it.coursId] || 0) + 1;
                } else {
                    perimes[it.coursId] = (perimes[it.coursId] || 0) + 1;
                }
            });
            plan.cles[base] = { k, total: items.length, sansCoursId, perimes, autresValides };
        });
        return plan;
    }

    window.reparer154 = function (opts) {
        const executer = !!(opts && opts.executer);
        const p = _analyser();
        const out = [];
        const L = s => out.push(s);

        L('==== RÉPARATION #154 · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');
        L('Magasin cours (' + p.cours.length + ') : ' + p.cours.map(c => c.id + ' « ' + (c.codeCours || c.sigle || c.nom || '?') + ' »').join(' · '));
        L('GC actif : ' + (p.gcActif ? p.gcActif.id + ' → coursId=' + p.gcActif.coursId : 'AUCUN'));

        if (!p.cible) {
            L('⛔ REFUS : aucune cible sûre — ni le GC actif ne pointe sur un cours du magasin, ni le magasin n\'a un cours unique.');
            L('   Rien n\'a été écrit. Colle ce rapport dans la conversation.');
            console.log(out.join('\n'));
            return;
        }
        L('Cible retenue : ' + p.cible + ' (' + p.motifCible + ')');

        let totalARemapper = 0;
        Object.keys(p.cles).forEach(base => {
            const c = p.cles[base];
            const nb = Object.values(c.perimes).reduce((a, b) => a + b, 0);
            totalARemapper += nb;
            L('— ' + c.k + ' : ' + c.total + ' item(s), dont ' + nb + ' à réapparier' +
              (c.sansCoursId ? ' · ' + c.sansCoursId + ' sans coursId (intouchés)' : ''));
            Object.keys(c.perimes).forEach(id => L('    · ' + id + ' → ' + p.cible + ' (' + c.perimes[id] + ' item(s))'));
            Object.keys(c.autresValides).forEach(id =>
                L('    ⚠ ' + c.autresValides[id] + ' item(s) sur l\'AUTRE cours réel ' + id + ' — NON touchés (à signaler si inattendu)'));
        });

        if (totalARemapper === 0) {
            L('✅ Rien à réparer — tous les coursId correspondent à des cours du magasin.');
            console.log(out.join('\n'));
            return;
        }

        if (!executer) {
            L('');
            L('DRY-RUN terminé. Si le plan est bon ET que le backup Codex est fait :');
            L('    reparer154({executer: true})');
            console.log(out.join('\n'));
            return;
        }

        // ── Exécution ────────────────────────────────────────────────────
        window._pre154 = {};
        Object.keys(p.cles).forEach(base => {
            const c = p.cles[base];
            const nb = Object.values(c.perimes).reduce((a, b) => a + b, 0);
            if (nb === 0) return;
            const donnees = db.getSync(c.k, []);
            window._pre154[c.k] = JSON.parse(JSON.stringify(donnees));
            const idsValides = new Set(p.cours.map(x => x.id));
            let faits = 0;
            donnees.forEach(it => {
                if (it && it.coursId && !idsValides.has(it.coursId)) { it.coursId = p.cible; faits++; }
            });
            db.setSync(c.k, donnees);
            L('✔ ' + c.k + ' : ' + faits + ' coursId réappariés et sauvegardés');
        });
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R) — les indices C/P se recalculent au prochain rendu.');
        L('   Filet même-session : annuler154(). Filet durable : ton backup Codex.');
        console.log(out.join('\n'));
    };

    window.annuler154 = function () {
        if (!window._pre154 || !Object.keys(window._pre154).length) {
            console.log('#154 : aucune pré-image en mémoire (la page a été rechargée ?). Filet : backup Codex.');
            return;
        }
        Object.keys(window._pre154).forEach(k => {
            db.setSync(k, window._pre154[k]);
            console.log('↩ ' + k + ' restauré à l\'état d\'avant réparation');
        });
        window._pre154 = {};
        console.log('✅ Annulation faite. Recharge la page.');
    };

    console.log('#154 chargé. D\'abord : reparer154()  (dry-run, n\'écrit rien)');
})();
