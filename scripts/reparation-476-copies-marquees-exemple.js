/* ============================================================================
   RÉPARATION #476 — libérer les copies restées marquées « exemple »
   ----------------------------------------------------------------------------
   Le défaut, corrigé dans le code le 24 août (volet 2, convergence des voies de
   duplication) : « Dupliquer » depuis la BARRE LATÉRALE rendait une copie qui
   gardait le drapeau démo (`isDemo` / `estDemo`) et le nom de l'auteur
   d'origine. L'application la reconnaissait donc encore comme un exemple
   fourni : champs grisés, bandeau « exemple », copie inutilisable.

   Le vecteur est bouché. Ce script s'occupe des copies DÉJÀ faites.
   Décision de Grégoire, 26 août 2026 : « oui, un correctif ponctuel ».

   ── COMMENT ON DISTINGUE UNE COPIE D'UN VRAI EXEMPLE ───────────────────
   Le critère n'est PAS le drapeau démo seul : les exemples fournis le portent
   aussi, légitimement, et les libérer casserait la démo.

   Le critère est celui que `demo-activation.js` emploie déjà pour sa purge :
       drapeau démo  ET  id ABSENT du pack de démarrage (`PACK_DEMARRAGE`).

   Un exemple fourni a son id DANS le pack. Une copie a reçu un id neuf à la
   duplication. Un item marqué démo dont l'id est inconnu du pack ne peut donc
   être qu'une copie — ou un item que l'utilisateur a marqué lui-même, ce que
   l'interface ne permet pas.

   ⚠ SI LE PACK N'EST PAS CHARGÉ, LE SCRIPT REFUSE DE S'EXÉCUTER. Sans lui,
   « id absent du pack » serait vrai pour TOUT, exemples fournis compris : on
   les libérerait tous. Un critère qui devient universel quand sa référence
   manque n'est pas un critère, c'est un accident.

   ── CE QUI EST MODIFIÉ, ET CE QUI NE L'EST PAS ─────────────────────────
   Modifié   : `isDemo` / `estDemo` retirés ; `auteur` réattribué à l'auteur actif.
   PRÉSERVÉ  : `inspireDe` et `auteurOriginal` — la trace CC ne s'efface jamais.
               Si `auteurOriginal` manque alors que `auteur` porte encore le nom
               d'origine, il est POSÉ AVANT la réattribution : on n'échange pas
               une attribution contre une autre, on complète la chaîne.
   Jamais touché : le contenu pédagogique (critères, niveaux, descriptions).

   MÉCANIQUE (précédents : reparer154, reparer442)
   - `await reparer476()`                  → DRY-RUN : imprime le plan, n'écrit RIEN
   - `await reparer476({executer: true})`  → applique, après backup Codex
   - `annuler476()`                        → restaure l'état d'avant (même session
                                             seulement — le filet inter-session
                                             est le backup Codex)

   Usage : console (Cmd+Option+J), coller le fichier, Entrée, puis
   `await reparer476()`. Coller le rapport dans la conversation AVANT d'exécuter.
   ============================================================================ */
(function () {
    'use strict';

    // Les familles que « Dupliquer » de la barre latérale peut produire.
    const SUFFIXES_VISES = ['grillesTemplates', 'echellesTemplates', 'productions'];

    let _sauvegarde = null;   // { cle: valeurAvant } — filet de la session courante

    const L = (m) => console.log(m);

    function _nomLisible(item) {
        if (!item) return '?';
        return item.nom || item.titre || item.activiteApprentissage ||
               item.description || '(sans nom)';
    }

    function _estMarqueDemo(item) {
        // Même lecture que `estItemDemo` (demo-activation.js) : les deux
        // orthographes cohabitent dans les données.
        return !!(item && (item.isDemo === true || item.estDemo === true));
    }

    /** Les ids que le pack de démarrage revendique pour une collection. */
    function _idsDuPack(collection) {
        const pack = (typeof PACK_DEMARRAGE !== 'undefined' && PACK_DEMARRAGE) ? PACK_DEMARRAGE : null;
        if (!pack || !Array.isArray(pack[collection])) return null;
        const ids = new Set();
        pack[collection].forEach(item => { if (item && item.id) ids.add(item.id); });
        return ids;
    }

    async function _toutesLesCles() {
        const cles = new Set();
        try { db.keysSync().forEach(k => cles.add(String(k))); } catch (e) { /* best-effort */ }
        try { (await db.keys() || []).forEach(k => cles.add(String(k))); } catch (e) { /* best-effort */ }
        return [...cles];
    }

    /** `a2026_grillesTemplates` → `grillesTemplates` ; la clé nue reste elle-même. */
    function _collectionDe(cle) {
        return SUFFIXES_VISES.find(s => cle === s || cle.endsWith('_' + s)) || null;
    }

    /**
     * ⚠⚠ « Inconnu » N'EST PAS UN AUTEUR (constaté au dry-run du 26 août sur les
     * données réelles : le rapport annonçait « Auteur actif : Inconnu »).
     *
     * `obtenirAuteurActif` rend la chaîne 'Inconnu' quand aucun profil
     * enseignant n'est résolu — c'est un LIBELLÉ d'affichage, pas une identité.
     * L'écrire dans `auteur` remplacerait une attribution juste par une
     * attribution fausse, et de façon durable. Mieux vaut ne pas réattribuer :
     * la marque « exemple » part quand même, et c'est elle qui bloquait
     * l'édition.
     */
    const AUTEURS_NON_IDENTIFIES = ['inconnu', 'anonyme', ''];

    function _auteurActif() {
        const retenir = (valeur) => {
            const nom = String(valeur == null ? '' : valeur).trim();
            return (nom && AUTEURS_NON_IDENTIFIES.indexOf(nom.toLowerCase()) === -1) ? nom : null;
        };
        try {
            if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.obtenirAuteurActif) {
                const a = retenir(BibliothequeUI.obtenirAuteurActif());
                if (a) return a;
            }
        } catch (e) { /* on tente la voie suivante */ }
        try {
            if (typeof obtenirProfilAuteurActifSync === 'function') {
                const p = obtenirProfilAuteurActifSync();
                if (p) { const a = retenir(p.auteur_original); if (a) return a; }
            }
        } catch (e) { /* rien */ }
        return null;
    }

    async function reparer476(options) {
        const executer = !!(options && options.executer);
        L('══════════════════════════════════════════════════════════════');
        L('RÉPARATION #476 — copies restées marquées « exemple »');
        L(executer ? '⚙ MODE EXÉCUTION' : '👁 DRY-RUN — aucune écriture');
        L('══════════════════════════════════════════════════════════════');

        // ⚠ La garde qui empêche le critère de devenir universel.
        if (typeof PACK_DEMARRAGE === 'undefined' || !PACK_DEMARRAGE) {
            L('✖ REFUS : le pack de démarrage (PACK_DEMARRAGE) n\'est pas chargé.');
            L('  Sans lui, « id absent du pack » serait vrai pour TOUT — y compris');
            L('  les exemples fournis, qu\'on libérerait tous. Recharger la page');
            L('  puis relancer.');
            return { refuse: true };
        }

        const auteur = _auteurActif();
        if (!auteur) {
            L('⚠ Aucun auteur IDENTIFIÉ (« Inconnu » n\'en est pas un) : la marque');
            L('  « exemple » sera retirée — c\'est elle qui bloque l\'édition —, mais');
            L('  `auteur` ne sera pas réécrit. Rien d\'inventé dans tes données.');
        } else {
            L('Auteur actif : ' + auteur);
        }

        const cles = (await _toutesLesCles()).filter(_collectionDe).sort();
        L('Collections scannées (' + cles.length + ') : ' + (cles.join(' · ') || 'AUCUNE'));
        L('');

        const plan = [];
        for (const cle of cles) {
            const collection = _collectionDe(cle);
            const idsPack = _idsDuPack(collection);
            if (idsPack === null) {
                L('· ' + cle + ' — le pack ne décrit pas « ' + collection + ' » : SAUTÉE');
                L('    (sans référence, impossible de distinguer une copie d\'un exemple)');
                continue;
            }

            const liste = await db.get(cle) || [];
            if (!Array.isArray(liste)) continue;

            const touches = liste.filter(item => _estMarqueDemo(item) && !idsPack.has(item.id));
            const exemples = liste.filter(item => _estMarqueDemo(item) && idsPack.has(item.id));

            L('· ' + cle + ' — ' + liste.length + ' item(s) · ' + exemples.length +
              ' exemple(s) fourni(s) intact(s) · ' + touches.length + ' copie(s) à libérer');
            touches.forEach(item => {
                L('    ⮕ ' + _nomLisible(item) + '  [' + item.id + ']  auteur : ' +
                  (item.auteur || '(aucun)') +
                  (item.auteurOriginal ? ' · origine : ' + item.auteurOriginal : '') +
                  (item.inspireDe ? ' · inspireDe présent' : ''));
            });
            if (touches.length > 0) plan.push({ cle, liste, touches });
        }

        L('');
        const total = plan.reduce((n, p) => n + p.touches.length, 0);
        if (total === 0) {
            L('✔ Rien à réparer : aucune copie marquée « exemple » dans les données.');
            return { total: 0 };
        }
        L('TOTAL : ' + total + ' copie(s) à libérer dans ' + plan.length + ' collection(s).');

        if (!executer) {
            L('');
            L('Dry-run terminé. Rien n\'a été écrit.');
            L('Pour appliquer APRÈS un backup Codex : await reparer476({executer: true})');
            return { total, plan: plan.map(p => ({ cle: p.cle, n: p.touches.length })) };
        }

        _sauvegarde = {};
        for (const { cle, liste, touches } of plan) {
            _sauvegarde[cle] = JSON.parse(JSON.stringify(liste));
            touches.forEach(item => {
                // La trace CC d'abord : on complète la chaîne avant de la déplacer.
                if (!item.auteurOriginal && item.auteur) item.auteurOriginal = item.auteur;
                delete item.isDemo;
                delete item.estDemo;
                if (auteur) item.auteur = auteur;
            });
            await db.set(cle, liste);
            L('✔ ' + cle + ' — ' + touches.length + ' copie(s) libérée(s)');
        }
        L('');
        L('Terminé. Recharger la page pour voir les copies redevenues modifiables.');
        L('Pour revenir en arrière dans CETTE session : await annuler476()');
        return { total, applique: true };
    }

    async function annuler476() {
        if (!_sauvegarde) {
            L('Rien à annuler dans cette session. Le filet inter-session est le backup Codex.');
            return;
        }
        for (const cle of Object.keys(_sauvegarde)) {
            await db.set(cle, _sauvegarde[cle]);
            L('↩ ' + cle + ' restauré');
        }
        _sauvegarde = null;
        L('État d\'avant la réparation restauré. Recharger la page.');
    }

    window.reparer476 = reparer476;
    window.annuler476 = annuler476;
    L('Réparation #476 chargée. Lancer : await reparer476()   (dry-run)');
})();
