/* ============================================================================
   #453 — RENDRE AUX ARTEFACTS LA GRILLE / L'ÉCHELLE / LA CARTOUCHE EFFACÉES
   ----------------------------------------------------------------------------
   DRY-RUN PAR DÉFAUT. Rien n'est écrit tant que `{ executer: true }` n'est pas
   donné explicitement.

   ── CE QUE LA MESURE A ÉTABLI (relevé r2 du 11 août, données réelles) ────────
       saines 13 · ailleurs 0 · introuvables 0 · PERDUES 27 · indécidables 0
   27 champs sont vides alors qu'un TÉMOIN nomme encore la ressource. Ce n'est
   donc pas « jamais assigné » : c'est assigné, puis effacé. Et les témoins
   disent QUOI rendre.

   ── D'OÙ VIENT L'EFFACEMENT (lu au code — il efface sa propre trace) ─────────
       productions.js:778   selectGrille.value = prod.grilleId || '';
       productions.js:988   const grilleId = grille ? grille.value : '';
   Un `<select>` à qui on assigne un id ABSENT de ses options retombe
   SILENCIEUSEMENT sur '' — « Aucune ». Ouvrir l'artefact, corriger un détail,
   enregistrer : le '' de l'AFFICHAGE devient le '' du DISQUE.

   ⚠⚠ CE QUE CE SCRIPT REFUSE DE FAIRE, ET POURQUOI C'EST LE CŒUR DE L'OUTIL.
   Rendre une référence que le formulaire ne sait PAS résoudre, c'est réarmer
   exactement le piège : à la prochaine ouverture-enregistrement, elle
   redeviendrait « Aucune », et cette fois le témoin lui-même pourrait avoir
   disparu. Une réparation qui se re-casse toute seule est pire que l'absence
   de réparation — elle consomme la confiance.

     CAS A — LA CIBLE VIT DANS LE MÊME TRIMESTRE QUE L'ARTEFACT.
       Le `<select>` la listera, donc la référence tiendra. ⮕ RESTAURÉE.

     CAS B — LE TÉMOIN NOMME UNE CIBLE QUI N'EST PAS DANS CE TRIMESTRE.
       ⮕ **REFUS.** Rapporté avec son nom, pour que Grégoire décide : importer
       la grille dans le trimestre, ou réassigner. Décider qu'une grille
       appartient à un trimestre n'est pas une décision de script.

     CAS C — LES TÉMOINS SE CONTREDISENT (évaluations qui ne s'accordent pas).
       ⮕ **REFUS.** On ne tranche pas entre deux passés à la majorité.

   ⮕ Le partage CAS A / CAS B est lui-même un DIAGNOSTIC : beaucoup de CAS B
   voudrait dire que les identifiants sont périmés (renumérotation à l'import,
   cf. #448) ; presque que des CAS A voudrait dire que les références étaient
   valides et que seul le chemin d'écriture les a blanchies.

   ── TROIS CHAMPS, DONT UN JAMAIS MESURÉ ─────────────────────────────────────
   `grilleId` et `echelleId` sont ceux du relevé r2. `cartoucheId` est mesuré
   ICI POUR LA PREMIÈRE FOIS — il est rapporté à part, et il ne compte pas dans
   les 27. Une réparation ne doit pas faire passer en douce du travail que la
   mesure n'a pas couvert.

   ── CE QU'IL NE TOUCHE JAMAIS ───────────────────────────────────────────────
   · un champ DÉJÀ renseigné (on ne corrige pas ce qui n'est pas cassé) ;
   · autre chose que ces trois champs — ni dates, ni pondérations, ni titres ;
   · le pack démo ;
   · les évaluations et la bibliothèque : ce sont les TÉMOINS, ils restent
     intacts, sinon la mesure ne serait plus refaisable après coup.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await reparer453()`                       → dry-run, n'écrit rien
     3. `await reparer453({ executer: true })`     → applique, APRÈS backup Codex
     4. `annuler453()`                             → restaure (même session)
   Repère : le rapport commence par « ==== #453 · références · ».
   ⚠ À faire dans LES DEUX navigateurs : leurs magasins sont indépendants.
   ========================================================================= */

(function () {
    'use strict';

    // ⚠ REPÈRE DE VERSION (leçon #448 du 11 août) : un rapport qui ne dit pas
    // QUI l'a produit ne permet pas de conclure. Deux rapports identiques ne
    // prouvent alors rien — ni que le correctif marche, ni qu'il a tourné.
    const VERSION_OUTIL = 'r1 · 11 août 2026';

    // Les trois champs, dans cet ordre : la cartouche ne peut être résolue
    // qu'une fois la grille connue (elle vit dans `cartouches_{grilleId}`).
    const CHAMPS = [
        { champ: 'grilleId', etiq: 'grille', mesureR2: true },
        { champ: 'echelleId', etiq: 'échelle', mesureR2: true },
        { champ: 'cartoucheId', etiq: 'cartouche', mesureR2: false }
    ];

    function nomDe(o) {
        if (!o || typeof o !== 'object') return '(sans nom)';
        return String(o.nom || o.titre || o.libelle || '(sans nom)');
    }

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try {
            const k = await db.keys();
            for (let i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible */ }
        for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    // ── LES TÉMOINS ─────────────────────────────────────────────────────────
    // ⚠ LOGIQUE IDENTIQUE À CELLE DU DIAGNOSTIC r2, VOLONTAIREMENT. Si la
    // réparation interrogeait ses témoins autrement que la mesure, elle
    // réparerait autre chose que ce qui a été diagnostiqué — et le relevé
    // qu'on a relu ne vaudrait plus rien.
    function temoinEvaluations(evals, prod, champ) {
        const valeurs = new Set();
        for (const e of (evals || [])) {
            if (!e || e.remplaceeParId) continue;   // état d'AVANT une reprise
            if (e.productionId !== prod.id) continue;
            if (e[champ]) valeurs.add(e[champ]);
        }
        if (valeurs.size === 1) return { valeur: [...valeurs][0], accord: true, source: 'évaluations' };
        if (valeurs.size > 1) return { valeur: null, accord: false, source: 'évaluations', divergentes: [...valeurs] };
        return null;
    }

    function temoinBibliotheque(biblio, prod, champ) {
        if (!Array.isArray(biblio) || !biblio.length) return null;
        let e = prod.idOriginal ? biblio.find((b) => b && b.id === prod.idOriginal) : null;
        let voie = 'idOriginal';
        if (!e) { e = biblio.find((b) => b && b.id === prod.id); voie = 'id'; }
        if (!e && prod.titre) {
            // Un rattachement PAR TITRE n'a pas la valeur de preuve d'un
            // rattachement par identifiant : au moindre homonyme, on se tait.
            const memeTitre = biblio.filter((b) => b && b.titre === prod.titre);
            if (memeTitre.length === 1) { e = memeTitre[0]; voie = 'titre'; }
        }
        if (!e || !e[champ]) return null;
        return { valeur: e[champ], accord: true, source: 'bibliothèque/' + voie };
    }

    async function reparer453(options) {
        const executer = !!(options && options.executer);
        const out = [];
        const L = (m) => out.push(m);
        L('==== #453 · références · ' + (executer ? 'EXÉCUTION' : 'DRY-RUN (rien n\'est écrit)') + ' ====');
        L('     outil ' + VERSION_OUTIL);

        const cles = await toutesLesCles();

        // Où vit chaque grille / échelle, et sous quelle clé
        const grilleOu = new Map();
        const echelleOu = new Map();
        for (const c of cles) {
            let cible = null;
            if (/grillesTemplates$|bibliothequeGrilles$/.test(c)) cible = grilleOu;
            else if (/echellesTemplates$|bibliothequeEchelles$/.test(c)) cible = echelleOu;
            if (!cible) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const g of liste) {
                if (!g || !g.id) continue;
                if (!cible.has(g.id)) cible.set(g.id, []);
                cible.get(g.id).push({ cle: c, nom: nomDe(g) });
            }
        }
        const indexPour = (champ) => (champ === 'grilleId' ? grilleOu : echelleOu);

        const biblio = (await lire('bibliothequeProductions')) || [];

        const tousProd = cles.filter((c) => /(^|_)productions?$|productionsCours$/.test(c));
        const magasinsProd = tousProd.filter((c) => c.indexOf('demo') !== 0);
        if (!magasinsProd.length) {
            L('⚠ Aucun magasin de productions RÉEL trouvé (hors démo). Rien à faire.');
            console.log(out.join('\n'));
            return { restaurables: 0, refus: 0 };
        }

        const plan = [];          // { cle, liste, gestes: [...] }
        const casA = [];          // restaurables
        const casB = [];          // refus : cible hors trimestre
        const casC = [];          // refus : témoins en désaccord
        const cartouches = [];    // hors périmètre du relevé r2

        for (const cleProd of magasinsProd) {
            const liste = await lire(cleProd);
            if (!Array.isArray(liste) || !liste.length) continue;

            const prefixe = cleProd.indexOf('_') !== -1 ? cleProd.split('_')[0] : '(global)';
            const evals = (await lire(prefixe + '_evaluationsSauvegardees'))
                       || (await lire('evaluationsSauvegardees')) || [];

            const gestes = [];
            for (let i = 0; i < liste.length; i++) {
                const p = liste[i];
                if (!p || !p.id) continue;
                if (p.type === 'portfolio') continue;   // conteneur : vide légitime

                // La grille RETENUE pour cet artefact — celle en place si elle
                // y est encore, sinon celle qu'on s'apprête à rendre. C'est
                // elle qui décide où chercher la cartouche.
                let grilleRetenue = p.grilleId || null;

                for (const spec of CHAMPS) {
                    const champ = spec.champ;
                    if (p[champ]) {                       // déjà renseigné : on n'y touche pas
                        if (champ === 'grilleId') grilleRetenue = p[champ];
                        continue;
                    }

                    const tE = temoinEvaluations(evals, p, champ);
                    if (tE && tE.accord === false) {
                        casC.push({ magasin: cleProd, artefact: nomDe(p), champ: champ,
                                    divergentes: tE.divergentes.join(' / ') });
                        continue;
                    }
                    const temoin = tE || temoinBibliotheque(biblio, p, champ);
                    if (!temoin || !temoin.valeur) continue;

                    // ── Résolution : la cible est-elle atteignable D'ICI ? ──
                    let nomCible = '(inconnue)';
                    let joignable = false;
                    let ou = null;

                    if (champ === 'cartoucheId') {
                        // La cartouche vit dans `cartouches_{grilleId}` — clé
                        // GLOBALE, sans préfixe de trimestre. Sans grille
                        // retenue, elle n'est joignable par personne.
                        if (grilleRetenue) {
                            const cartes = (await lire('cartouches_' + grilleRetenue)) || [];
                            const c = Array.isArray(cartes) ? cartes.find((x) => x && x.id === temoin.valeur) : null;
                            if (c) { joignable = true; nomCible = nomDe(c); }
                        }
                        cartouches.push({
                            magasin: cleProd, artefact: nomDe(p), productionId: p.id,
                            valeur: temoin.valeur, cible: nomCible,
                            joignable: joignable ? 'oui' : 'NON', temoin: temoin.source
                        });
                        if (joignable) gestes.push({ idx: i, champ: champ, valeur: temoin.valeur, horsR2: true });
                        continue;
                    }

                    ou = indexPour(champ).get(temoin.valeur);
                    const chezSoi = ou && ou.find((o) => o.cle.indexOf(prefixe + '_') === 0);
                    if (chezSoi) { joignable = true; nomCible = chezSoi.nom; }
                    else if (ou && ou.length) nomCible = ou[0].nom + '  [vit dans ' + ou.map((o) => o.cle).join(' / ') + ']';

                    const fiche = {
                        magasin: cleProd, artefact: nomDe(p), productionId: p.id,
                        champ: champ, valeur: temoin.valeur, cible: nomCible,
                        temoin: temoin.source
                    };
                    if (joignable) { casA.push(fiche); gestes.push({ idx: i, champ: champ, valeur: temoin.valeur }); }
                    else casB.push(fiche);

                    if (champ === 'grilleId' && joignable) grilleRetenue = temoin.valeur;
                }
            }
            if (gestes.length) plan.push({ cle: cleProd, liste: liste, gestes: gestes });
        }

        // ── LE RAPPORT, EN TEXTE COPIABLE ───────────────────────────────────
        // ⚠ PAS de console.table pour la partie décisive : le 11 août, un
        // rapport rendu en tableau est arrivé AMPUTÉ de ses tableaux, et il a
        // fallu un aller-retour de plus pour rien. Ce qui doit être relu doit
        // pouvoir être copié.
        const ligne = (f) => '   · ' + f.magasin + ' | ' + f.artefact
            + ' | ' + f.champ + ' → ' + f.valeur + ' | « ' + f.cible + ' » | témoin ' + f.temoin;

        L('');
        L('── CAS A · RESTAURABLES (' + casA.length + ') — la cible vit dans le même trimestre');
        if (!casA.length) L('   (aucun)');
        else casA.forEach((f) => L(ligne(f)));

        L('');
        L('── CAS B · ⛔ REFUS (' + casB.length + ') — le témoin nomme une cible HORS de ce trimestre');
        if (!casB.length) L('   (aucun)');
        else {
            casB.forEach((f) => L(ligne(f)));
            L('   ⮕ Rendre ces références réarmerait le piège : le formulaire ne les');
            L('     listant pas, le prochain enregistrement les reblanchirait.');
            L('     ⮕ Décision à prendre : importer la ressource dans le trimestre,');
            L('       ou réassigner l\'artefact à une ressource qui y vit déjà.');
        }

        if (casC.length) {
            L('');
            L('── CAS C · ⛔ REFUS (' + casC.length + ') — les évaluations se contredisent');
            casC.forEach((f) => L('   · ' + f.magasin + ' | ' + f.artefact + ' | ' + f.champ
                                  + ' : ' + f.divergentes));
            L('   ⮕ On ne tranche pas entre deux passés à la majorité.');
        }

        L('');
        L('── CARTOUCHES (' + cartouches.length + ') — ⚠ HORS du relevé r2, mesuré ici pour la 1re fois');
        if (!cartouches.length) L('   (aucune)');
        else cartouches.forEach((f) => L('   · ' + f.magasin + ' | ' + f.artefact + ' | → ' + f.valeur
                                         + ' | « ' + f.cible + ' » | joignable ' + f.joignable
                                         + ' | témoin ' + f.temoin));

        const nbGestes = plan.reduce((s, p) => s + p.gestes.length, 0);
        L('');
        L('==== BILAN ====');
        L('CAS A restaurables            : ' + casA.length + '   (grille / échelle)');
        L('Cartouches joignables         : ' + cartouches.filter((c) => c.joignable === 'oui').length
          + ' / ' + cartouches.length);
        L('⛔ REFUS cible hors trimestre : ' + casB.length);
        L('⛔ REFUS témoins contradictoires : ' + casC.length);
        L('Écritures prévues             : ' + nbGestes + ' champ(s) sur ' + plan.length + ' magasin(s)');
        L('');
        L('⮕ CE QUE LE PARTAGE A/B DIT DE L\'ORIGINE :');
        L('   beaucoup de CAS B ⇒ les identifiants sont PÉRIMÉS (renumérotation à');
        L('   l\'import, cf. #448). Presque que des CAS A ⇒ les références étaient');
        L('   VALIDES, et c\'est bien le chemin d\'écriture qui les a blanchies.');

        if (!executer) {
            L('');
            L('DRY-RUN — rien n\'a été écrit.');
            L('Pour appliquer, APRÈS un backup Codex :');
            L('   await reparer453({ executer: true })');
            console.log(out.join('\n'));
            return { restaurables: casA.length, cartouches: cartouches.length,
                     refusHorsTrimestre: casB.length, refusContradictoires: casC.length, ecritures: nbGestes };
        }

        // ── Exécution ───────────────────────────────────────────────────────
        window._pre453 = {};
        for (const p of plan) {
            window._pre453[p.cle] = JSON.parse(JSON.stringify(p.liste));
            for (const g of p.gestes) p.liste[g.idx][g.champ] = g.valeur;
            await db.set(p.cle, p.liste);
            L('✔ ' + p.cle + ' : ' + p.gestes.length + ' champ(s) rendu(s)');
        }
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R), puis rouvre un artefact pour vérifier.');
        L('   Filet même-session : annuler453(). Filet durable : ton backup Codex.');
        L('   ⚠ À refaire dans l\'AUTRE navigateur : les magasins sont indépendants.');
        if (casB.length) {
            L('   ⚠ ' + casB.length + ' référence(s) restent VIDES volontairement (CAS B ci-dessus).');
        }
        console.log(out.join('\n'));
        return { restaurables: casA.length, cartouches: cartouches.length,
                 refusHorsTrimestre: casB.length, refusContradictoires: casC.length, ecritures: nbGestes };
    }

    window.reparer453 = reparer453;

    window.annuler453 = async function () {
        if (!window._pre453 || !Object.keys(window._pre453).length) {
            console.log('#453 : aucune pré-image en mémoire (la page a été rechargée ?). Filet : backup Codex.');
            return;
        }
        for (const cle in window._pre453) {
            await db.set(cle, window._pre453[cle]);
            console.log('↩ ' + cle + ' restauré à son état d\'avant.');
        }
        console.log('#453 : annulation faite. RECHARGE la page (Cmd+R).');
    };

    console.log('#453 réparation chargée — outil ' + VERSION_OUTIL
        + '. Tape :  await reparer453()   (dry-run, n\'écrit rien)');
})();
