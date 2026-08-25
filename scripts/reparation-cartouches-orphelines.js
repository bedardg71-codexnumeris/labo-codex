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
   ============================================================================ */
(async function reparationOrphelines() {
    'use strict';

    const lots = [];      // { n, cle, idGrille, cartouches }
    const accueils = [];  // { lettre, id, nom }

    const grilles = await db.get(cle('grillesTemplates')) || [];
    const idsPresents = new Set(grilles.map(g => g && g.id).filter(Boolean));
    grilles.forEach((g, i) => {
        if (g && g.id) accueils.push({ lettre: String.fromCharCode(65 + i), id: g.id, nom: g.nom || 'sans nom' });
    });

    // Énumération des trois étages, sans doublon.
    const clesVues = new Set();
    const ajouter = async (k) => {
        if (!k || typeof k !== 'string' || k.indexOf('cartouches_') !== 0 || clesVues.has(k)) return;
        clesVues.add(k);
        const idGrille = k.slice('cartouches_'.length);
        if (idsPresents.has(idGrille)) return;              // rattachée : rien à faire
        const lot = await db.get(k);
        if (!Array.isArray(lot) || lot.length === 0) return; // vide : rien à récupérer
        lots.push({ n: lots.length + 1, cle: k, idGrille, cartouches: lot });
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
        out.push('  ' + l.n + ' · ' + l.cartouches.length + ' cartouche(s)   [grille disparue : ' + l.idGrille + ']');
        l.cartouches.forEach(c => out.push('        · ' + ((c && c.nom) || 'sans nom')));
    });
    if (lots.length === 0) out.push('  (rien à récupérer — tout est rattaché)');
    out.push('');
    out.push('Pour rattacher :  reparerOrphelines(<numéro>, \'<lettre>\')');
    out.push('==== FIN DRY-RUN ====');
    console.log(out.join('\n'));

    window.reparerOrphelines = async function (numero, lettre) {
        const lot = lots.find(l => l.n === numero);
        const cible = accueils.find(a => a.lettre === String(lettre).toUpperCase());
        if (!lot) { console.error('Lot n° ' + numero + ' introuvable. Relance le script pour la liste à jour.'); return; }
        if (!cible) { console.error('Grille « ' + lettre + ' » introuvable. Relance le script pour la liste à jour.'); return; }

        const ok = confirm(
            'Rattacher ' + lot.cartouches.length + ' cartouche(s) à « ' + cible.nom + ' » ?\n\n' +
            lot.cartouches.map(c => '· ' + ((c && c.nom) || 'sans nom')).join('\n') + '\n\n' +
            'Les cartouches déjà présentes sur cette grille sont CONSERVÉES ; ' +
            'les orphelines s\'y ajoutent. Le lot d\'origine est laissé intact.'
        );
        if (!ok) { console.log('Annulé — rien n\'a été écrit.'); return; }

        const destination = 'cartouches_' + cible.id;
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
