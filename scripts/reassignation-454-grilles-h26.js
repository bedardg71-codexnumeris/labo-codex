/* ============================================================================
   #454 — RENDRE AUX ARTEFACTS H26 LEUR GRILLE, LEUR CARTOUCHE, LEUR ÉCHELLE
   ----------------------------------------------------------------------------
   DRY-RUN PAR DÉFAUT. Rien n'est écrit tant que `{ executer: true }` n'est pas
   donné explicitement.

   ── CE QUI A ÉTÉ ÉTABLI AVANT D'ÉCRIRE CE SCRIPT ────────────────────────────
   1. Les 10 artefacts H26 citent 3 identifiants de grilles qui n'existent plus
      (dry-run #453 du 11 août).
   2. Les 3 magasins `cartouches_{ancienId}` ont survécu à la renumérotation et
      portent l'EMPREINTE des grilles disparues : les identifiants de leurs
      critères (`identifier454`, 11 août).
   3. Ces identifiants de critères se retrouvent TELS QUELS dans 3 grilles
      vivantes de H26 — dont les identifiants portent eux-mêmes la marque de la
      renumérotation (`GRILLE_1782504228322_1_…`, `_a_…`, `_f_…`).
   4. Grégoire a reconnu les trois correspondances (11 août) et confirmé que
      **chaque artefact a sa propre cartouche de rétroaction**.

   ⚠⚠ LES CORRESPONDANCES CI-DESSOUS SONT DES DONNÉES QUE J'AI TAPÉES. Elles ne
   sont donc PAS une preuve — la preuve est dans ses données. Le script les
   REVÉRIFIE toutes avant d'agir : le magasin fantôme doit exister, la grille
   vivante doit exister dans le trimestre visé, et leurs critères doivent porter
   les mêmes identifiants. **Une correspondance qui ne se revérifie pas est
   refusée**, même si elle vient de moi.

   ── CE QUE LE SCRIPT FAIT, DANS CET ORDRE ───────────────────────────────────
   ÉTAPE 1 — DÉMÉNAGER LES CARTOUCHES. Repointer la grille ne suffirait pas :
     les cartouches vivent encore dans le tiroir de l'ANCIEN identifiant, et le
     sélecteur lit `cartouches_{grilleId}`. Elles sont donc recopiées dans le
     tiroir de la grille vivante, avec leur `grilleId` mis à jour.
     ⚠ Fusion PAR IDENTITÉ (leçon #448) : une cartouche déjà présente sous le
     même identifiant et au même contenu est IGNORÉE, pas dupliquée. Même
     identifiant mais contenu DIFFÉRENT ⇒ **REFUS** : on n'écrase pas une
     cartouche vivante par une ancienne.
     ⚠ Les tiroirs d'origine ne sont PAS supprimés — ils restent les témoins.

   ÉTAPE 2 — REPOINTER LES ARTEFACTS. `grilleId` vers la grille vivante, et
     `cartoucheId` vers la cartouche que nomment ses évaluations — **seulement
     si cette cartouche est joignable après l'étape 1**. Sinon, refus.

   ÉTAPE 3 — L'ÉCHELLE, ET SEULEMENT SUR ORDRE EXPLICITE. Les grilles sont
     établies par PREUVE (identifiants de critères). L'échelle, elle, ne se
     prouve que par la forme de ses niveaux — c'est un indice, pas une preuve.
     Le script LISTE les échelles vivantes du trimestre avec leurs niveaux et
     n'écrit `echelleId` que si on lui passe `{ echelle: 'ID' }`.

   ── CE QU'IL NE TOUCHE JAMAIS ───────────────────────────────────────────────
   · les ÉVALUATIONS — c'est le registre de ce qui a été fait, et c'est aussi
     le témoin qui a permis tout ce diagnostic. On ne réécrit pas la mémoire ;
   · les magasins de cartouches d'origine (témoins) ;
   · un champ DÉJÀ renseigné ;
   · autre chose que `grilleId`, `cartoucheId`, `echelleId` ;
   · le pack démo — ni comme source, ni comme cible.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await reassigner454()`                          → dry-run, n'écrit rien
     3. `await reassigner454({ executer: true })`        → grilles + cartouches
        ou `await reassigner454({ executer: true, echelle: 'ID_LU_AU_DRY_RUN' })`
     4. `annuler454()`                                   → restaure (même session)
   Repère : le rapport commence par « ==== #454 · réassignation ».
   ⚠ À faire dans LES DEUX navigateurs : leurs magasins sont indépendants.
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r2 · 11 août 2026 (échelle découplée du repointage)';
    const TRIMESTRE = 'h2026';

    // ⚠ DONNÉES TAPÉES À LA MAIN — REVÉRIFIÉES PLUS BAS CONTRE LES DONNÉES.
    const CORRESPONDANCES = [
        { fantome: 'grille_1770742838756_23q82vbsk',
          vivante: 'GRILLE_1782504228330_a_4b469c6b7b5e',
          libelle: 'Grille-4 H26',            note: 'artefacts 1, 3, 5, 8, 9' },
        { fantome: 'grille_1772187755149_uq1oiiafa',
          vivante: 'GRILLE_1782504228322_1_6398d555452d',
          libelle: 'Grille-5 FR-HOLIS H26',   note: 'artefacts 2, 4, 7' },
        { fantome: 'GRILLE1759529438501',
          vivante: 'GRILLE_1782504228333_f_db90dd7b3554',
          libelle: 'Grille-5 FR-ALGO H26',    note: 'artefacts 6, 10' }
    ];

    // Champs que l'APPLICATION pose elle-même : ils ne comptent pas dans la
    // comparaison de contenu (liste de `securite-hash.js`, même raison).
    const CHAMPS_VOLATILES = (window.SecuriteHash && window.SecuriteHash.CHAMPS_VOLATILES)
        || ['_hash_v1', 'dateImport', 'dateAjoutBiblio', 'dansBibliotheque',
            'dateCreation', 'dateModification'];

    function nomDe(o) {
        if (!o || typeof o !== 'object') return '(sans nom)';
        return String(o.nom || o.titre || o.libelle || '(sans nom)');
    }

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    function signature(valeur, ignores) {
        const vus = new WeakSet();
        const rendre = (v) => {
            if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
            if (vus.has(v)) return '"~cycle~"';
            vus.add(v);
            if (Array.isArray(v)) return '[' + v.map(rendre).join(',') + ']';
            const cles = Object.keys(v).filter((k) => ignores.indexOf(k) === -1).sort();
            return '{' + cles.map((k) => JSON.stringify(k) + ':' + rendre(v[k])).join(',') + '}';
        };
        try { return rendre(valeur); } catch (e) { return null; }
    }

    async function reassigner454(options) {
        const executer = !!(options && options.executer);
        const echelleVoulue = (options && options.echelle) || null;
        const out = [];
        const L = (m) => out.push(m);
        L('==== #454 · réassignation · ' + (executer ? 'EXÉCUTION' : 'DRY-RUN (rien n\'est écrit)') + ' ====');
        L('     outil ' + VERSION_OUTIL + ' · trimestre ' + TRIMESTRE);

        const grilles = (await lire(TRIMESTRE + '_grillesTemplates')) || [];
        const echelles = (await lire(TRIMESTRE + '_echellesTemplates')) || [];
        const productions = (await lire(TRIMESTRE + '_productions')) || [];
        const evals = (await lire(TRIMESTRE + '_evaluationsSauvegardees')) || [];
        if (!Array.isArray(productions) || !productions.length) {
            L('⚠ Aucune production dans ' + TRIMESTRE + '. Rien à faire.');
            console.log(out.join('\n'));
            return { erreur: 'aucune production' };
        }

        // ── ÉTAPE 0 · REVÉRIFIER CHAQUE CORRESPONDANCE ──────────────────────
        L('');
        L('── ÉTAPE 0 · revérification des correspondances (elles viennent de MOI)');
        const valides = [];
        for (const c of CORRESPONDANCES) {
            const ancien = await lire('cartouches_' + c.fantome);
            const vivante = grilles.find((g) => g && g.id === c.vivante);
            if (!Array.isArray(ancien) || !ancien.length) {
                L('  ⛔ ' + c.libelle + ' : le magasin cartouches_' + c.fantome + ' est absent ou vide.');
                continue;
            }
            if (!vivante) {
                L('  ⛔ ' + c.libelle + ' : la grille ' + c.vivante + ' est absente de '
                  + TRIMESTRE + '_grillesTemplates.');
                continue;
            }
            // La PREUVE : les critères portent-ils bien les mêmes identifiants ?
            const idsVivante = new Set((Array.isArray(vivante.criteres) ? vivante.criteres : [])
                .map((x) => x && x.id).filter(Boolean));
            const idsFantome = new Set();
            for (const ct of ancien) {
                for (const cr of (Array.isArray(ct && ct.criteres) ? ct.criteres : [])) {
                    if (cr && cr.id) idsFantome.add(cr.id);
                }
            }
            let communs = 0;
            for (const x of idsFantome) if (idsVivante.has(x)) communs++;
            const taux = idsFantome.size ? communs / Math.max(idsFantome.size, idsVivante.size) : 0;
            if (taux < 1) {
                L('  ⛔ ' + c.libelle + ' : les critères NE correspondent PAS ('
                  + Math.round(taux * 100) + ' % communs). Correspondance REFUSÉE.');
                continue;
            }
            L('  ✓ ' + c.libelle + ' — critères identiques (preuve revérifiée) · ' + c.note);
            valides.push(Object.assign({}, c, { ancien: ancien, nomVivante: nomDe(vivante) }));
        }
        if (!valides.length) {
            L('');
            L('⛔ Aucune correspondance ne se revérifie. Rien ne sera fait.');
            console.log(out.join('\n'));
            return { correspondances: 0 };
        }

        // ── ÉTAPE 1 · DÉMÉNAGER LES CARTOUCHES ──────────────────────────────
        L('');
        L('── ÉTAPE 1 · cartouches à déménager vers le tiroir de la grille vivante');
        const planCartouches = [];   // { cle, liste, ajouts:[] }
        const joignablesApres = new Map();   // grilleVivante → Set(idCartouche)
        let refusCartouches = 0;
        for (const c of valides) {
            const cleCible = 'cartouches_' + c.vivante;
            const enPlace = (await lire(cleCible)) || [];
            const parId = new Map();
            for (const ct of enPlace) if (ct && ct.id) parId.set(ct.id, ct);

            const dejaLa = new Set(parId.keys());
            // ⚠ DÉFAUT TROUVÉ AU BANC : quand un déménagement est REFUSÉ (même
            // identifiant, contenu différent), cet identifiant existe quand
            // même dans le tiroir cible — donc il paraissait « joignable », et
            // l'artefact recevait LA CARTOUCHE DE QUELQU'UN D'AUTRE. Joignable
            // doit vouloir dire « celle que le témoin désigne », pas
            // « quelque chose qui porte le même numéro ».
            const refuses = new Set();
            const ajouts = [];
            for (const ct of c.ancien) {
                if (!ct || !ct.id) continue;
                const homonyme = parId.get(ct.id);
                if (homonyme) {
                    const a = signature(homonyme, CHAMPS_VOLATILES.concat(['grilleId']));
                    const b = signature(ct, CHAMPS_VOLATILES.concat(['grilleId']));
                    if (a !== null && a === b) {
                        L('  · « ' + nomDe(ct) + ' » déjà présente à l\'identique — ignorée');
                        continue;
                    }
                    L('  ⛔ « ' + nomDe(ct) + ' » : même identifiant, contenu DIFFÉRENT dans '
                      + cleCible + '. On n\'écrase pas — REFUS.');
                    refuses.add(ct.id);
                    refusCartouches++;
                    continue;
                }
                const copie = JSON.parse(JSON.stringify(ct));
                copie.grilleId = c.vivante;      // le seul champ réécrit
                ajouts.push(copie);
                dejaLa.add(ct.id);
                L('  ✔ « ' + nomDe(ct) + ' » → ' + cleCible);
            }
            for (const id of refuses) dejaLa.delete(id);
            joignablesApres.set(c.vivante, dejaLa);
            if (ajouts.length) planCartouches.push({ cle: cleCible, liste: enPlace, ajouts: ajouts });
        }
        if (!planCartouches.length) L('  (aucune cartouche à déménager)');

        // ── ÉTAPE 2 · REPOINTER LES ARTEFACTS ───────────────────────────────
        L('');
        L('── ÉTAPE 2 · artefacts à repointer');
        const parFantome = new Map(valides.map((c) => [c.fantome, c]));
        const gestes = [];
        let sansTemoin = 0, cartoucheInjoignable = 0, dejaRempli = 0;

        for (let i = 0; i < productions.length; i++) {
            const p = productions[i];
            if (!p || !p.id || p.type === 'portfolio') continue;
            if (p.grilleId) { dejaRempli++; continue; }

            // Le témoin : les évaluations de CETTE production, non remplacées.
            const vusG = new Set(), vusC = new Set();
            for (const e of evals) {
                if (!e || e.remplaceeParId || e.productionId !== p.id) continue;
                if (e.grilleId) vusG.add(e.grilleId);
                if (e.cartoucheId) vusC.add(e.cartoucheId);
            }
            if (vusG.size !== 1) { sansTemoin++; continue; }
            const corr = parFantome.get([...vusG][0]);
            if (!corr) { sansTemoin++; continue; }

            const geste = { idx: i, artefact: nomDe(p), grilleId: corr.vivante,
                            libelle: corr.libelle, cartoucheId: null };

            // La cartouche : une seule, et joignable APRÈS l'étape 1.
            if (vusC.size === 1) {
                const idC = [...vusC][0];
                if ((joignablesApres.get(corr.vivante) || new Set()).has(idC)) {
                    geste.cartoucheId = idC;
                } else {
                    L('  ⚠ ' + nomDe(p) + ' : cartouche ' + idC
                      + ' introuvable même après déménagement — grille seule.');
                    cartoucheInjoignable++;
                }
            } else if (vusC.size > 1) {
                L('  ⚠ ' + nomDe(p) + ' : ses évaluations citent ' + vusC.size
                  + ' cartouches différentes — on ne tranche pas, grille seule.');
            }

            L('  ✔ ' + geste.artefact + ' → « ' + corr.libelle + ' »'
              + (geste.cartoucheId ? ' + sa cartouche' : ' (grille seule)'));
            gestes.push(geste);
        }
        if (!gestes.length) L('  (aucun artefact à repointer)');
        if (dejaRempli) L('  · ' + dejaRempli + ' artefact(s) ont déjà une grille — intouchés.');
        if (sansTemoin) L('  · ' + sansTemoin + ' artefact(s) sans témoin exploitable — intouchés.');

        // ── ÉTAPE 3 · L'ÉCHELLE ─────────────────────────────────────────────
        L('');
        L('── ÉTAPE 3 · échelle de performance');
        L('  Les grilles sont établies par PREUVE. L\'échelle, non : elle ne se');
        L('  reconnaît qu\'à la forme de ses niveaux. Le script ne l\'écrit donc');
        L('  QUE sur ordre explicite.');
        L('  Échelles vivantes de ' + TRIMESTRE + ' :');
        for (const e of echelles) {
            if (!e || !e.id) continue;
            const niv = (Array.isArray(e.niveaux) ? e.niveaux : []).map((n) => n && n.code).filter(Boolean);
            L('     ' + e.id + '   « ' + nomDe(e) + ' »   niveaux : ' + (niv.join(' ') || '(aucun)'));
        }
        let echelleOk = null;
        const gestesEchelle = [];
        if (echelleVoulue) {
            echelleOk = echelles.find((e) => e && e.id === echelleVoulue) || null;
            if (!echelleOk) {
                L('  ⛔ L\'échelle demandée (' + echelleVoulue + ') n\'existe pas dans '
                  + TRIMESTRE + '_echellesTemplates. Elle ne sera PAS écrite.');
            } else {
                // ⚠ PASSE INDÉPENDANTE, et ce n'est pas un détail : après le
                // premier passage les artefacts ONT une grille, donc l'étape 2
                // les saute. Accrocher l'échelle au repointage la rendait
                // impossible à poser en second temps — or c'est exactement le
                // déroulé prévu (grilles prouvées d'abord, échelle ensuite).
                const vivantesOk = new Set(valides.map((c) => c.vivante));
                for (let i = 0; i < productions.length; i++) {
                    const p = productions[i];
                    if (!p || !p.id || p.type === 'portfolio') continue;
                    if (p.echelleId) continue;                 // jamais d'écrasement
                    const repointe = gestes.some((g) => g.idx === i);
                    // On ne touche QUE les artefacts de ce dossier : ceux qu'on
                    // vient de repointer, ou ceux qui portent déjà l'une des
                    // trois grilles retrouvées.
                    if (!repointe && !vivantesOk.has(p.grilleId)) continue;
                    gestesEchelle.push({ idx: i, artefact: nomDe(p) });
                }
                L('  ⮕ Demandée : « ' + nomDe(echelleOk) + ' » — sera posée sur '
                  + gestesEchelle.length + ' artefact(s) : '
                  + (gestesEchelle.map((g) => g.artefact).join(' · ') || '(aucun)'));
                if (!gestesEchelle.length) {
                    L('     (aucun artefact concerné n\'a l\'échelle vide — rien à faire)');
                }
            }
        } else {
            L('  ⮕ Aucune échelle demandée. Pour l\'ajouter, relancer avec :');
            L('       await reassigner454({ executer: true, echelle: \'ID_CI_DESSUS\' })');
        }

        L('');
        L('==== BILAN ====');
        L('Correspondances revérifiées : ' + valides.length + ' / ' + CORRESPONDANCES.length);
        L('Cartouches à déménager      : ' + planCartouches.reduce((s, p) => s + p.ajouts.length, 0)
          + (refusCartouches ? '   (⛔ ' + refusCartouches + ' refus : contenu différent)' : ''));
        L('Artefacts à repointer       : ' + gestes.length
          + (cartoucheInjoignable ? '   (' + cartoucheInjoignable + ' sans cartouche)' : ''));
        L('Échelle                     : ' + (echelleOk ? nomDe(echelleOk) + ' → ' + gestesEchelle.length + ' artefact(s)' : 'non demandée'));

        if (!executer) {
            L('');
            L('DRY-RUN — rien n\'a été écrit.');
            L('Pour appliquer, APRÈS un backup Codex :');
            L('   await reassigner454({ executer: true })');
            console.log(out.join('\n'));
            return { correspondances: valides.length, cartouches: planCartouches.reduce((s, p) => s + p.ajouts.length, 0),
                     artefacts: gestes.length, refusCartouches: refusCartouches,
                     echelle: echelleOk ? echelleOk.id : null, artefactsEchelle: gestesEchelle.length };
        }

        // ── Exécution ───────────────────────────────────────────────────────
        window._pre454 = {};
        for (const pc of planCartouches) {
            window._pre454[pc.cle] = JSON.parse(JSON.stringify(pc.liste));
            await db.set(pc.cle, pc.liste.concat(pc.ajouts));
            L('✔ ' + pc.cle + ' : +' + pc.ajouts.length + ' cartouche(s)');
        }
        if (gestes.length) {
            window._pre454[TRIMESTRE + '_productions'] = JSON.parse(JSON.stringify(productions));
            for (const g of gestes) {
                productions[g.idx].grilleId = g.grilleId;
                if (g.cartoucheId) productions[g.idx].cartoucheId = g.cartoucheId;
            }
            await db.set(TRIMESTRE + '_productions', productions);
            L('✔ ' + TRIMESTRE + '_productions : ' + gestes.length + ' artefact(s) repointé(s)');
        }
        if (echelleOk && gestesEchelle.length) {
            if (!window._pre454[TRIMESTRE + '_productions']) {
                window._pre454[TRIMESTRE + '_productions'] = JSON.parse(JSON.stringify(productions));
            }
            for (const g of gestesEchelle) productions[g.idx].echelleId = echelleOk.id;
            await db.set(TRIMESTRE + '_productions', productions);
            L('✔ ' + TRIMESTRE + '_productions : échelle posée sur ' + gestesEchelle.length + ' artefact(s)');
        }
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R), puis rouvre un artefact pour vérifier.');
        L('   Filet même-session : annuler454(). Filet durable : ton backup Codex.');
        L('   ⚠ Les tiroirs d\'origine sont INTACTS — ne les supprime pas avant vérification.');
        L('   ⚠ À refaire dans l\'AUTRE navigateur : les magasins sont indépendants.');
        console.log(out.join('\n'));
        return { correspondances: valides.length, cartouches: planCartouches.reduce((s, p) => s + p.ajouts.length, 0),
                 artefacts: gestes.length, refusCartouches: refusCartouches,
                     echelle: echelleOk ? echelleOk.id : null, artefactsEchelle: gestesEchelle.length };
    }

    window.reassigner454 = reassigner454;

    window.annuler454 = async function () {
        if (!window._pre454 || !Object.keys(window._pre454).length) {
            console.log('#454 : aucune pré-image en mémoire (la page a été rechargée ?). Filet : backup Codex.');
            return;
        }
        for (const cle in window._pre454) {
            await db.set(cle, window._pre454[cle]);
            console.log('↩ ' + cle + ' restauré à son état d\'avant.');
        }
        console.log('#454 : annulation faite. RECHARGE la page (Cmd+R).');
    };

    console.log('#454 réassignation chargée — outil ' + VERSION_OUTIL
        + '. Tape :  await reassigner454()   (dry-run, n\'écrit rien)');
})();
