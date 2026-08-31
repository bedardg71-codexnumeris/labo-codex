/* ============================================================================
   RÉPARATION — rattacher des cartouches orphelines à une grille existante
   ----------------------------------------------------------------------------
   Contexte : relevé du 24 août 2026 sur le corpus de Grégoire. Des cartouches
   bien vivantes — « Carte mentale A26 », « Plan de rédaction A26 »,
   « Stratégies de lecture A26 »… — se trouvaient dans des clés
   `cartouches_<grille>` dont la grille avait disparu du trimestre. Rien n'était
   détruit ; plus rien ne pouvait les lire, parce que la barre latérale
   n'énumère que les grilles PRÉSENTES.

   La cause est corrigée en 1.95.4 : `supprimerGrilleDepuisSidebar` refuse
   désormais de retirer une grille qui porte des cartouches. Ce script-ci sert
   à récupérer celles qui sont DÉJÀ orphelines.

   ─────────────────────────────────────────────────────────────────────────
   IL NE MODIFIE RIEN TANT QUE TU NE LE LUI DEMANDES PAS.

   1. Ouvre l'app, console du navigateur (Cmd+Option+J).
      Si Chrome refuse le collage : tape `allow pasting` + Entrée.
   2. Colle CE FICHIER EN ENTIER, Entrée.
      Le rapport doit commencer par  ==== RÉPARATION ORPHELINES · DRY-RUN ====
      S'il commence autrement, c'est une ancienne copie : refais `git pull`.
   3. Lis la liste. Chaque lot orphelin porte un NUMÉRO, chaque grille d'accueil
      une LETTRE.
   4. Pour rattacher, tape par exemple :
         reparerOrphelines(3, 'A')
      → rattache le lot n° 3 à la grille A. Il te redemande confirmation.

   ⚠ AVANT D'APPLIQUER : exporte un Codex de sauvegarde. L'opération est
   réversible à la main, mais un export coûte trente secondes.

   ─────────────────────────────────────────────────────────────────────────
   ⚠⚠ CE FICHIER PORTE LES DEUX RÈGLES OPPOSÉES DE S5/#623, À TRENTE LIGNES
   D'ÉCART. Ne pas uniformiser : l'asymétrie est le correctif.

   Depuis S5/#623, `cartouches_<grilleId>` n'est plus une clé de stockage. Le
   magasin vit sous `<trimestreId>_cartouches_<grilleId>`, un exemplaire par
   trimestre (migration au boot, js/trimestres.js:1044).

     R1 · LA LECTURE BALAIE TOUS LES TRIMESTRES (§ énumération, plus bas).
          Un lot est orphelin quand sa grille manque à SON PROPRE trimestre —
          pas au trimestre actif. Juger tout le monde depuis l'actif
          marquerait « orphelines » toutes les copies des autres trimestres.
     R2 · L'ÉCRITURE EXIGE UN TRIMESTRE EXPLICITE (§ reparerOrphelines).
          Elle écrit par `cle()`, donc dans le trimestre ACTIF, et REFUSE un
          lot venu d'un autre trimestre. Balayer en écriture — « rattacher
          partout » — recréerait exactement le partage entre trimestres que
          S5 vient de refermer.
     R3 · Une source datée garde ses clés d'époque (sans objet ici).

   ⮕ Donc `'cartouches_' + id` se traite DANS LES DEUX SENS selon qu'on lit
     ou qu'on écrit. C'est la seule chose à retenir de ce cartouche.
   ⮕ Et « survivre au grep » ≠ « juste après S5 » : un prédicat ancré
     (`indexOf(…)===0`) ne trouve plus rien et son zéro se lit « aucune
     orpheline » ; un prédicat lâche trouve tout mais n'attribue rien.
   ============================================================================ */
(async function reparationOrphelines() {
    'use strict';

    const lots = [];      // { n, cle, trimestre, idGrille, cartouches }
    const accueils = [];  // { lettre, id, nom }

    /**
     * Décompose une clé de cartouches dans les DEUX régimes.
     * trimestre === null ⇒ clé NUE (résidu pré-S5 que la migration au boot
     * n'a pas résorbé). Ni ancré, ni lâche : voit ET attribue.
     *
     * ⚠ LE PRÉFIXE DOIT ÊTRE UN ID DE TRIMESTRE. Sans cette garde, le motif
     * happe `migration_cartouches_namespacees_done` — le drapeau de la
     * migration S5 elle-même (js/main.js:735), qui vaut un booléen. Défaut
     * mesuré par Playwright le 31 août 2026 (plantage sur `.forEach`), pas vu
     * en relecture. Desserrer un ancrage happe des clés d'une AUTRE famille.
     */
    const RE_TRIMESTRE = /^([ahe]\d{4}|demo)$/;
    const decomposerCleCartouches = (k) => {
        if (typeof k !== 'string') return null;
        const i = k.indexOf('cartouches_');
        if (i === -1) return null;
        if (i === 0) return { trimestre: null, grilleId: k.slice('cartouches_'.length) };
        const prefixe = k.slice(0, i - 1);
        if (k[i - 1] !== '_' || !RE_TRIMESTRE.test(prefixe)) return null;
        return { trimestre: prefixe, grilleId: k.slice(i + 'cartouches_'.length) };
    };

    // Ceinture-bretelles du motif ci-dessus : un magasin de cartouches est une
    // LISTE. Si la valeur n'en est pas une, la clé n'est pas de cette famille
    // quoi qu'en dise son nom — c'est ce qui a fait planter le rapport sur le
    // drapeau booléen `migration_cartouches_namespacees_done`. Deux gardes
    // valent mieux qu'une quand la première porte sur le NOM et la seconde sur
    // la VALEUR : elles ne peuvent pas se tromper ensemble.
    const lireListe = async (k) => {
        const v = await db.get(k);
        return Array.isArray(v) ? v : [];
    };

    const trimestreActif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : null;
    const grilles = await db.get(cle('grillesTemplates')) || [];
    grilles.forEach((g, i) => {
        if (g && g.id) accueils.push({ lettre: String.fromCharCode(65 + i), id: g.id, nom: g.nom || 'sans nom' });
    });

    // R1 — LE RÉFÉRENTIEL D'ORPHELINAT EST PAR TRIMESTRE, PAS GLOBAL.
    // Avant S5, une seule liste de grilles suffisait à juger tous les lots.
    // Depuis, chaque trimestre a les siennes : un lot de a2025 doit être jugé
    // contre les grilles de a2025. Comparer tout à l'actif fabriquerait un
    // faux orphelin par grille et par trimestre non actif.
    const grillesParTrimestre = new Map();   // trimestreId → Set(grilleId)
    try {
        const tousTrimestres = (typeof obtenirTrimestres === 'function') ? (obtenirTrimestres() || []) : [];
        for (const t of tousTrimestres) {
            if (!t || !t.id) continue;
            const lot = await db.get(t.id + '_grillesTemplates') || [];
            grillesParTrimestre.set(t.id, new Set(lot.map(g => g && g.id).filter(Boolean)));
        }
    } catch (e) { console.warn('[réparation] catalogue des grilles par trimestre indisponible', e); }

    // Énumération des trois étages, sans doublon. R1 : on balaie TOUT.
    const clesVues = new Set();
    let clesExaminees = 0;
    const ajouter = async (k) => {
        clesExaminees++;
        const d = decomposerCleCartouches(k);
        if (!d || clesVues.has(k)) return;
        clesVues.add(k);

        // ⚠ LES DEUX GARDES DE FIN S'APPLIQUENT AUSSI ICI. Premier jet : les
        // branches « résidu » et « indécidable » sortaient AVANT elles, donc
        // elles listaient des lots VIDES et — pire — présentaient « grille
        // disparue » pour des grilles bien vivantes. Trouvé en mesurant où
        // l'écriture atterrissait (31 août 2026), pas en relisant. Un chemin
        // ajouté à côté d'un chemin existant hérite rarement de ses gardes tout
        // seul : c'est au moment de l'ajouter qu'il faut les recopier.
        const lotResidu = await lireListe(k);
        const grilleVivanteQuelquePart = [...grillesParTrimestre.values()]
            .some(set => set.has(d.grilleId));

        // Une clé nue n'appartient à aucun trimestre et plus rien ne la lit.
        // Elle est récupérable — mais seulement si elle a quelque chose dedans.
        if (d.trimestre === null) {
            if (lotResidu.length === 0) return;         // vide : rien à récupérer
            lots.push({ n: lots.length + 1, cle: k, trimestre: null, idGrille: d.grilleId,
                        cartouches: lotResidu, residu: true,
                        // Dire la vérité sur la grille : une clé nue peut très bien
                        // porter une grille TOUJOURS VIVANTE. Annoncer « grille
                        // disparue » serait faux, et enverrait chercher un fantôme.
                        grilleVivante: grilleVivanteQuelquePart });
            return;
        }
        const connuesDuTrimestre = grillesParTrimestre.get(d.trimestre);
        // Trimestre inconnu du registre : on ne peut PAS conclure à l'orphelinat
        // — on ne sait pas contre quoi comparer. Le dire vaut mieux que trancher.
        if (!connuesDuTrimestre) {
            if (lotResidu.length === 0) return;
            lots.push({ n: lots.length + 1, cle: k, trimestre: d.trimestre, idGrille: d.grilleId,
                        cartouches: lotResidu, indecidable: true,
                        grilleVivante: grilleVivanteQuelquePart });
            return;
        }
        if (connuesDuTrimestre.has(d.grilleId)) return;      // rattachée : rien à faire
        const lot = await db.get(k);
        if (!Array.isArray(lot) || lot.length === 0) return; // vide : rien à récupérer
        lots.push({ n: lots.length + 1, cle: k, trimestre: d.trimestre, idGrille: d.grilleId, cartouches: lot });
    };
    try { for (let i = 0; i < localStorage.length; i++) await ajouter(localStorage.key(i)); } catch (e) {}
    try { if (db.memoryCache) for (const k of db.memoryCache.keys()) await ajouter(k); } catch (e) {}
    try {
        const toutes = typeof db.keys === 'function' ? await db.keys() : null;
        if (toutes && typeof toutes.forEach === 'function') for (const k of toutes) await ajouter(k);
    } catch (e) {}

    const out = [];
    out.push('==== RÉPARATION ORPHELINES · DRY-RUN · ' + new Date().toISOString() + ' ====');
    out.push('');
    out.push('-- GRILLES D\'ACCUEIL POSSIBLES (trimestre actif : ' + cle('grillesTemplates') + ') --');
    accueils.forEach(a => out.push('  ' + a.lettre + ' · ' + a.nom + '   [' + a.id + ']'));
    if (accueils.length === 0) out.push('  (aucune grille dans ce trimestre — crées-en une avant de réparer)');
    out.push('');
    out.push('-- LOTS ORPHELINS RÉCUPÉRABLES : ' + lots.length + ' --');
    lots.forEach(l => {
        // R2 annoncé DÈS LA LISTE : un lot d'un autre trimestre n'est pas
        // rattachable d'ici. Le dire au moment où Grégoire choisit un numéro,
        // pas après qu'il l'ait tapé.
        const etat = l.residu
            ? '   ⚠ CLÉ NUE (régime pré-S5) — rattachable au trimestre ACTIF'
            : l.indecidable
                ? '   ⚠ trimestre « ' + l.trimestre + ' » inconnu du registre — INDÉCIDABLE'
                : (l.trimestre === trimestreActif
                    ? '   [trimestre ' + l.trimestre + ' · ACTIF]'
                    : '   [trimestre ' + l.trimestre + '] — bascule vers ce trimestre pour le traiter');
        // « grille disparue » n'est vrai que si elle l'est. Un résidu nu peut
        // porter une grille bien vivante : le lot est alors injoignable non
        // parce que la grille a disparu, mais parce que la CLÉ n'est plus lue.
        const etatGrille = l.grilleVivante
            ? 'grille VIVANTE, clé non lue : ' : 'grille disparue : ';
        out.push('  ' + l.n + ' · ' + l.cartouches.length + ' cartouche(s)   ['
                 + etatGrille + l.idGrille + ']' + etat);
        l.cartouches.forEach(c => out.push('        · ' + ((c && c.nom) || 'sans nom')));
    });
    // Un zéro ne vaut que s'il porte son témoin : « rien à récupérer » sur zéro
    // clé examinée voudrait dire « je n'ai rien regardé ».
    if (lots.length === 0) {
        out.push(clesExaminees === 0
            ? '  ⛔ AUCUNE CLÉ EXAMINÉE — énumération du stockage indisponible. Ce n\'est PAS'
              + ' « tout est rattaché » : le script n\'a rien pu regarder.'
            : '  (rien à récupérer sur ' + clesExaminees + ' clé(s) examinée(s) — tout est rattaché)');
    } else {
        out.push('  → ' + lots.length + ' lot(s) sur ' + clesExaminees + ' clé(s) examinée(s)');
    }
    out.push('');
    out.push('Pour rattacher :  reparerOrphelines(<numéro>, \'<lettre>\')');
    out.push('==== FIN DRY-RUN ====');
    console.log(out.join('\n'));

    window.reparerOrphelines = async function (numero, lettre) {
        const lot = lots.find(l => l.n === numero);
        const cible = accueils.find(a => a.lettre === String(lettre).toUpperCase());
        if (!lot) { console.error('Lot n° ' + numero + ' introuvable. Relance le script pour la liste à jour.'); return; }
        if (!cible) { console.error('Grille « ' + lettre + ' » introuvable. Relance le script pour la liste à jour.'); return; }

        // ═══ R2 — L'ÉCRITURE REFUSE PLUTÔT QUE DE DEVINER ═══════════════════
        // Le balayage de tous les trimestres est juste EN LECTURE (voir plus
        // haut) et serait destructeur ICI : rattacher un lot de a2025 à une
        // grille de h2026 déplace des données d'un trimestre vers un autre —
        // exactement le partage inter-trimestres que S5/#623 vient de refermer.
        // Le script ne le fait donc pas en silence : il refuse et dit comment
        // procéder. La bascule de trimestre est une décision de Grégoire.
        // ⚠ UNE CLÉ NUE N'EST PAS UN LOT D'UN AUTRE TRIMESTRE, ET NE SE REFUSE PAS.
        // Premier jet : je refusais les deux. C'était une sur-application de R2,
        // et le banc navigateur l'a montrée (spec `reparation-cartouches-
        // orphelines`, 31 août 2026). R2 interdit de DEVINER le trimestre ; or
        // ici il n'y a rien à deviner dans les deux cas, mais pour des raisons
        // opposées :
        //   · lot d'un AUTRE trimestre → il a un propriétaire, le déplacer est un
        //     transfert inter-trimestre. REFUS (voir juste en dessous).
        //   · clé NUE → elle n'appartient à AUCUN trimestre, et plus rien ne la
        //     lit. La rattacher à une grille choisie à la main écrit dans UN seul
        //     trimestre, l'actif : pas de partage créé, et des cartouches
        //     autrement injoignables redeviennent lisibles. C'est précisément ce
        //     que cet outil existe pour faire. On l'AUTORISE, en le disant.
        if (lot.indecidable) {
            console.error('Lot n° ' + numero + ' NON rattachable : son trimestre « '
                + lot.trimestre + ' » est inconnu du registre, donc rien ne dit à quel '
                + 'trimestre appartiennent ces cartouches — ni si les déplacer est légitime.');
            return;
        }
        if (lot.residu) {
            console.warn('Lot n° ' + numero + ' vient d\'une clé NUE (' + lot.cle + '), régime '
                + 'pré-S5 : elle n\'appartient à aucun trimestre et plus rien ne la lit.\n'
                + '  ⮕ Elle sera rattachée au trimestre ACTIF (' + trimestreActif + '), et à lui '
                + 'seul. La clé nue d\'origine est CONSERVÉE intacte.');
        }
        // ⚠ `lot.trimestre !== null` EST INDISPENSABLE, et son absence était un
        // défaut : sans elle, cette garde rattrapait la clé nue que la garde
        // précédente venait d'autoriser, et le message disait « bascule vers
        // "null" ». Une garde qui parle de basculer vers `null` est une garde
        // appliquée hors de son domaine. Le refus vise le TRANSFERT entre deux
        // trimestres réels ; une clé nue n'en a pas, il n'y a donc rien à
        // transférer. Deux gardes voisines doivent avoir des domaines DISJOINTS.
        if (lot.trimestre !== null && lot.trimestre !== trimestreActif) {
            console.error('Lot n° ' + numero + ' appartient au trimestre « ' + lot.trimestre
                + ' », or le trimestre actif est « ' + trimestreActif + ' ».\n'
                + '  Le rattacher à une grille de « ' + trimestreActif + ' » DÉPLACERAIT ces '
                + 'cartouches d\'un trimestre à l\'autre — ce script ne le fait pas tout seul.\n'
                + '  ⮕ Bascule vers « ' + lot.trimestre +' », relance le script, et rattache '
                + 'le lot à une grille de CE trimestre.');
            return;
        }
        // À partir d'ici : le lot et la grille d'accueil sont du MÊME trimestre,
        // l'actif. La destination par `cle()` est donc juste PAR CONSTRUCTION —
        // `accueils` a été peuplé depuis `cle('grillesTemplates')`, la même
        // source. Ce n'est pas une supposition, c'est une identité.

        const ok = confirm(
            'Rattacher ' + lot.cartouches.length + ' cartouche(s) à « ' + cible.nom + ' » ?\n\n' +
            lot.cartouches.map(c => '· ' + ((c && c.nom) || 'sans nom')).join('\n') + '\n\n' +
            'Les cartouches déjà présentes sur cette grille sont CONSERVÉES ; ' +
            'les orphelines s\'y ajoutent. Le lot d\'origine est laissé intact.'
        );
        if (!ok) { console.log('Annulé — rien n\'a été écrit.'); return; }

        // R2 · destination EXPLICITE : `cle()` résout vers le trimestre actif,
        // dont on vient de vérifier qu'il est bien celui du lot.
        const destination = cle('cartouches_' + cible.id);
        const existantes = await db.get(destination) || [];

        // Ajout SANS remplacement (patron `fusionnerDemoVersGlobaux`) : on ne
        // touche jamais à ce qui est déjà là, et l'identité décide du doublon.
        let ajoutees = 0, deja = 0;
        let liste = existantes.slice();
        for (const c of lot.cartouches) {
            const copie = Object.assign({}, c, { grilleId: cible.id, dansBibliotheque: true });
            const garde = (typeof ajouterAvecGardeIdentite === 'function')
                ? ajouterAvecGardeIdentite(liste, copie)
                : { ajoute: !liste.some(x => x && x.id === copie.id), liste: liste.concat([copie]) };
            if (garde.ajoute) { liste = garde.liste; ajoutees++; } else { deja++; }
        }

        await db.set(destination, liste);

        // Relecture-vérification : `db.set` peut refuser en silence (garde #340).
        const verif = await db.get(destination) || [];
        if (verif.length !== liste.length) {
            console.error('[réparation] Écriture NON confirmée sur ' + destination +
                ' — attendu ' + liste.length + ', relu ' + verif.length + '. Rien n\'est perdu : ' +
                'le lot d\'origine ' + lot.cle + ' est intact.');
            return;
        }

        console.log('✔ ' + ajoutees + ' cartouche(s) rattachée(s) à « ' + cible.nom +' »'
            + (deja ? ' · ' + deja + ' déjà présente(s), ignorée(s)' : '')
            + '\n  Le lot d\'origine (' + lot.cle + ') est CONSERVÉ tel quel — à toi de le retirer '
            + 'plus tard si tu veux, une fois que tu auras vérifié le résultat à l\'écran.'
            + '\n  Recharge la page pour voir les cartouches apparaître.');
    };
})();
