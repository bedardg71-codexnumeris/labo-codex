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

     CAS B1 — LA CIBLE EXISTE, MAIS DANS UN AUTRE TRIMESTRE.
       ⮕ **REFUS.** Rapporté avec son nom et son magasin, pour que Grégoire
       décide : importer la ressource dans le trimestre, ou réassigner.
       Décider qu'une grille appartient à un trimestre n'est pas une décision
       de script.

     CAS B2 — LA CIBLE N'EXISTE **NULLE PART**. L'identifiant est un fantôme.
       ⮕ **REFUS**, et surtout : rien à importer, rien à réassigner tant qu'on
       n'a pas retrouvé sous QUEL nouvel identifiant la ressource vit
       aujourd'hui. ⚠ Le premier jet de ce script confondait B1 et B2 et
       conseillait « importer la ressource dans le trimestre » pour les deux —
       un conseil impossible à suivre pour B2, qui aurait envoyé Grégoire
       chercher quelque chose qui n'existe plus.

     CAS C — LES TÉMOINS SE CONTREDISENT (évaluations qui ne s'accordent pas).
       ⮕ **REFUS.** On ne tranche pas entre deux passés à la majorité.

   ⮕ Le partage A / B1 / B2 est lui-même un DIAGNOSTIC :
     · surtout des CAS A ⇒ les références étaient VALIDES et seul le chemin
       d'écriture les a blanchies ;
     · surtout des CAS B2 ⇒ les identifiants ont été RENUMÉROTÉS (import,
       famille #448) et les témoins eux-mêmes pointent désormais des fantômes.
   ⮕ Pour B2, le script cherche une TRACE SURVIVANTE : un magasin
   `cartouches_{ancienId}` encore présent atteste que la grille a existé sous
   cet identifiant et donne un point d'accroche pour la retrouver.

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
    const VERSION_OUTIL = 'r2 · 11 août 2026 (B1 « ailleurs » séparé de B2 « nulle part »)';

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

        // Quels magasins de cartouches existent encore ? C'est la seule trace qui
        // survit à une renumérotation de grille : le magasin garde l'ANCIEN
        // identifiant de grille dans son nom de clé.
        //
        // ⚠ S5/#623 — LA CLÉ N'EST PLUS NUE : `<trimestreId>_cartouches_<grilleId>`.
        // Le test ancré `indexOf(…)===0` rendait un ensemble VIDE, donc la trace
        // « cartouches_… EXISTE ENCORE » — que le rapport désigne explicitement
        // comme « le fil à tirer » — ne s'imprimait plus jamais. Un outil de
        // réparation qui perd sa seule trace ne dit pas qu'il l'a perdue : il dit
        // qu'il n'y a rien à réparer. Mesuré : 2 clés avant S5, 0 après.
        //
        // R1 · on indexe par GRILLE (la question est « cette grille a-t-elle
        // existé ? », pas « dans quel trimestre »), tous trimestres confondus.
        const RE_CARTOUCHES = /^(?:([ahe]\d{4}|demo)_)?cartouches_(.+)$/;
        const magasinsCartouches = new Map();   // grilleId → [clés, tous trimestres]
        for (const c of cles) {
            const m = typeof c === 'string' ? c.match(RE_CARTOUCHES) : null;
            if (!m) continue;
            if (!magasinsCartouches.has(m[2])) magasinsCartouches.set(m[2], []);
            magasinsCartouches.get(m[2]).push(c);
        }

        const plan = [];          // { cle, liste, gestes: [...] }
        const casA = [];          // restaurables
        const casB1 = [];         // refus : la cible vit dans un AUTRE trimestre
        const casB2 = [];         // refus : la cible n'existe NULLE PART
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
                        // ⚠ S5/#623 — CE COMMENTAIRE DISAIT « clé GLOBALE, sans
                        // préfixe de trimestre ». Ce n'est plus vrai : la
                        // cartouche vit dans `{trimestre}_cartouches_{grilleId}`.
                        // Sans grille retenue, elle n'est joignable par personne.
                        //
                        // ⚠⚠ ICI, R1 (« balayer tous les trimestres ») SERAIT FAUX.
                        // La question posée est « cette cartouche est-elle joignable
                        // POUR CET ARTEFACT ? ». L'artefact vit dans le trimestre
                        // `prefixe` ; seule la copie de CE trimestre le rend
                        // joignable. Trouver la cartouche dans un autre trimestre
                        // et répondre « oui » serait un faux positif — et c'est
                        // exactement le partage inter-trimestres que S5 referme.
                        // Le trimestre explicite ne vient donc pas d'un choix mais
                        // de la donnée : c'est celui du magasin de productions lu.
                        if (grilleRetenue) {
                            const cartes = (await lire(prefixe + '_cartouches_' + grilleRetenue)) || [];
                            const c = Array.isArray(cartes) ? cartes.find((x) => x && x.id === temoin.valeur) : null;
                            if (c) { joignable = true; nomCible = nomDe(c); }
                        }
                        cartouches.push({
                            magasin: cleProd, artefact: nomDe(p), productionId: p.id,
                            valeur: temoin.valeur, cible: nomCible,
                            joignable: joignable ? 'oui' : 'NON', temoin: temoin.source,
                            // Distinguer « pas de magasin du tout » de « magasin
                            // présent mais cette cartouche-là n'y est plus » :
                            // ce n'est pas la même histoire ni le même remède.
                            // Index par grilleId, tous trimestres confondus : ici
                            // la question est « un magasin existe-t-il quelque
                            // part ? », pas « est-il joignable » (traité ci-dessus).
                            magasinPresent: grilleRetenue
                                ? (magasinsCartouches.has(grilleRetenue)
                                    ? 'oui (' + magasinsCartouches.get(grilleRetenue).join(', ') + ')'
                                    : 'NON')
                                : 'sans grille'
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
                    else if (ou && ou.length) casB1.push(fiche);
                    else {
                        // Fantôme. Seule trace possible d'une grille renumérotée :
                        // son magasin de cartouches, qui porte l'ANCIEN id en clé.
                        fiche.trace = (champ === 'grilleId' && magasinsCartouches.has(temoin.valeur))
                            ? magasinsCartouches.get(temoin.valeur).join(', ') + ' EXISTE ENCORE'
                            : 'aucune trace';
                        casB2.push(fiche);
                    }

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
        L('── CAS B1 · ⛔ REFUS (' + casB1.length + ') — la cible EXISTE, mais dans un AUTRE trimestre');
        if (!casB1.length) L('   (aucun)');
        else {
            casB1.forEach((f) => L(ligne(f)));
            L('   ⮕ Rendre ces références réarmerait le piège : le formulaire ne les');
            L('     listant pas, le prochain enregistrement les reblanchirait.');
            L('     ⮕ Décision à prendre : importer la ressource dans le trimestre,');
            L('       ou réassigner l\'artefact à une ressource qui y vit déjà.');
        }

        L('');
        L('── CAS B2 · ⛔ REFUS (' + casB2.length + ') — la cible n\'existe NULLE PART (identifiant fantôme)');
        if (!casB2.length) L('   (aucun)');
        else {
            casB2.forEach((f) => L(ligne(f) + (f.trace ? ' | trace : ' + f.trace : '')));
            L('   ⮕ Ici il n\'y a RIEN à importer ni à réassigner : l\'identifiant lui-même');
            L('     a disparu. Le témoin pointe un fantôme — la ressource a très');
            L('     probablement été RENUMÉROTÉE (import, famille #448) et vit aujourd\'hui');
            L('     sous un autre identifiant.');
            L('   ⮕ Les lignes « trace : …_cartouches_… EXISTE ENCORE » sont le fil à tirer :');
            L('     ce magasin porte l\'ANCIEN identifiant dans son nom et a survécu à la');
            L('     renumérotation. Son contenu permet de reconnaître la grille d\'origine.');
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
                                         + ' | magasin de la grille : ' + f.magasinPresent
                                         + ' | témoin ' + f.temoin));

        const nbGestes = plan.reduce((s, p) => s + p.gestes.length, 0);
        const parMagasin = plan.map((p) => p.cle + ' (' + p.gestes.length + ')').join(' · ') || '(aucun)';
        L('');
        L('==== BILAN ====');
        L('CAS A restaurables               : ' + casA.length + '   (grille / échelle)');
        L('Cartouches joignables            : ' + cartouches.filter((c) => c.joignable === 'oui').length
          + ' / ' + cartouches.length);
        L('⛔ REFUS cible dans un autre trim. : ' + casB1.length);
        L('⛔ REFUS identifiant fantôme       : ' + casB2.length);
        L('⛔ REFUS témoins contradictoires   : ' + casC.length);
        L('Écritures prévues                 : ' + nbGestes + ' champ(s) — ' + parMagasin);
        L('');
        L('⮕ CE QUE LE PARTAGE A / B1 / B2 DIT DE L\'ORIGINE :');
        L('   surtout des CAS A  ⇒ les références étaient VALIDES, et c\'est le chemin');
        L('                        d\'écriture qui les a blanchies ;');
        L('   surtout des CAS B2 ⇒ les identifiants ont été RENUMÉROTÉS (import,');
        L('                        famille #448) et les témoins pointent des fantômes.');
        L('   ⚠ Les deux peuvent coexister dans des trimestres DIFFÉRENTS : ce ne serait');
        L('     alors pas une histoire, mais deux, et elles n\'appellent pas le même geste.');

        if (!executer) {
            L('');
            L('DRY-RUN — rien n\'a été écrit.');
            L('Pour appliquer, APRÈS un backup Codex :');
            L('   await reparer453({ executer: true })');
            console.log(out.join('\n'));
            return { restaurables: casA.length, cartouches: cartouches.length,
                     refusAilleurs: casB1.length, refusFantome: casB2.length,
                     refusContradictoires: casC.length, ecritures: nbGestes };
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
        if (casB1.length || casB2.length) {
            L('   ⚠ ' + (casB1.length + casB2.length) + ' référence(s) restent VIDES volontairement');
            L('     (CAS B1 / B2 ci-dessus) — les rendre les reblanchirait au prochain');
            L('     enregistrement. Ce n\'est pas un oubli, c\'est le refus.');
        }
        console.log(out.join('\n'));
        return { restaurables: casA.length, cartouches: cartouches.length,
                 refusAilleurs: casB1.length, refusFantome: casB2.length,
                 refusContradictoires: casC.length, ecritures: nbGestes };
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
