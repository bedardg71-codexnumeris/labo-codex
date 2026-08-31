/* ============================================================================
   BIBLIOTHÈQUES — « LESQUELS SONT LESQUELS ? »
   ----------------------------------------------------------------------------
   LECTURE SEULE. Ce fichier n'écrit rien, ne supprime rien, ne répare rien.
   Il compte, il compare, il rapporte.

   POURQUOI IL EXISTE

   Le 23 août 2026, Grégoire, capture de la bibliothèque de cartouches à l'appui :

     « J'ai une information m'indiquant que j'ai des doublons, mais ils ne sont
       pas identifiés explicitement et les rechercher manuellement par leur ID
       est laborieux : ILS NE SONT PAS AFFICHÉS ! […] Un utilisateur ne peut pas
       savoir quoi faire pour résoudre les conflits de doublons. LESQUELS SONT
       LESQUELS ? »

   Il avait raison, et la cause était plus grave que l'affichage : les cinq
   détecteurs de doublons DÉDUPLIQUAIENT PAR `id` avant de regrouper par nom.
   Une vraie collision d'identifiant rendait donc `[]` — l'anomalie la plus
   grave était la seule invisible — et une copie ressortait indiscernable de
   deux entités légitimement homonymes.

   Ce script répond à la question sur TES données, exemplaire par exemplaire.

   LES TROIS CATÉGORIES, ET CE QU'ELLES VEULENT DIRE

     🔴 COLLISION D'IDENTIFIANT — deux entrées du MÊME magasin portent le même
        identifiant. C'est une anomalie de données : un identifiant est censé
        être unique. À signaler.

     🟠 COPIES — plusieurs exemplaires issus du même original (l'un descend de
        l'autre, ou tous deux d'une même source). Tu peux n'en garder qu'un.

     🔵 HOMONYMES — des entités DISTINCTES qui portent le même nom. CE N'EST PAS
        UN DÉFAUT. Tes deux échelles « IDME et niv 0 » de a2025 sont exactement
        ça, et elles servent toutes les deux. Renomme-les seulement si tu veux
        les distinguer d'un coup d'œil.

   ⚠ UN MÊME IDENTIFIANT DES DEUX CÔTÉS N'EST PAS UNE COLLISION. Publier une
   grille dans la bibliothèque partagée conserve son identifiant : le même objet
   se voit alors depuis deux magasins. Le rapport en tient compte.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. taper :  await diagDoublons()

   Repère : le rapport commence par « ==== BIBLIOTHÈQUES · doublons · LECTURE
   SEULE ». S'il ne s'affiche pas, le fichier n'est pas passé (un script se colle
   en entier, la commande s'appelle APRÈS).
   ========================================================================= */

(function () {
    'use strict';

    const LIGNE = '─'.repeat(74);

    /* ---------------------------------------------------------------------
       Les cinq familles, et où vivent leurs deux magasins.
       --------------------------------------------------------------------- */
    const FAMILLES = [
        { nom: 'Grilles',    cleLocale: 'grillesTemplates',      clePartagee: 'bibliothequeGrilles',     champ: 'nom' },
        { nom: 'Échelles',   cleLocale: 'echellesTemplates',     clePartagee: 'bibliothequeEchelles',    champ: 'nom' },
        { nom: 'Productions', cleLocale: 'productions',          clePartagee: 'bibliothequeProductions', champ: 'titre' },
        { nom: 'Pratiques',  cleLocale: 'pratiquesConfigurables', clePartagee: 'bibliothequePratiques',  champ: 'nom' }
        // Les cartouches sont traitées à part : leur magasin est
        // `cartouches_<grilleId>`, une clé par grille (voir plus bas).
    ];

    /* ---------------------------------------------------------------------
       La logique de classement.

       Ce script est AUTOPORTANT : il doit tourner sur le build que tu as
       actuellement chargé, y compris s'il est ANTÉRIEUR à js/identite-item.js.
       Il utilise donc les fonctions de l'app QUAND elles sont là, et sa propre
       copie sinon — et il DIT laquelle il a utilisée, pour qu'aucun rapport ne
       soit ambigu sur ce qu'il a mesuré.
       --------------------------------------------------------------------- */
    function jetonsIdentiteLocal(item) {
        const jetons = new Set();
        if (!item || typeof item !== 'object') return jetons;
        const ajouter = (v) => { if (typeof v === 'string' && v.trim()) jetons.add(v.trim()); };
        ajouter(item.id);
        ajouter(item.idOriginal);
        if (item.inspireDe && typeof item.inspireDe === 'object') {
            ajouter(item.inspireDe.idOriginal);
            ajouter(item.inspireDe.sourceId);
        }
        return jetons;
    }

    function memeIdentiteLocal(a, b) {
        const ja = jetonsIdentiteLocal(a);
        if (!ja.size) return false;
        for (const j of jetonsIdentiteLocal(b)) if (ja.has(j)) return true;
        return false;
    }

    // Vraie si l'app expose déjà la brique livrée avec #291.
    const APP_A_LA_BRIQUE = (typeof window.analyserDoublons === 'function' &&
                             typeof window.reunirSources === 'function');

    const memeIdentite = (typeof window.memeIdentite === 'function')
        ? window.memeIdentite : memeIdentiteLocal;

    function normaliser(t) {
        return String(t == null ? '' : t).trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function idCourt(id) {
        if (!id || id.length < 6) return id || '?';
        return id.slice(-6);
    }

    /**
     * Réunit les deux magasins sans compter deux fois le même objet, tout en
     * PRÉSERVANT une répétition à l'intérieur d'un même magasin (la collision).
     */
    function reunir(locaux, partages) {
        if (APP_A_LA_BRIQUE) return window.reunirSources(locaux, partages);
        const sortie = [];
        const emis = new Map();
        [locaux, partages].forEach((liste) => {
            const vus = new Map(), ajouts = new Map();
            (liste || []).forEach((item) => {
                if (!item || typeof item !== 'object') return;
                const id = typeof item.id === 'string' ? item.id.trim() : '';
                if (!id) { sortie.push(item); return; }
                const rang = vus.get(id) || 0;
                vus.set(id, rang + 1);
                if (rang < (emis.get(id) || 0)) return;
                sortie.push(item);
                ajouts.set(id, (ajouts.get(id) || 0) + 1);
            });
            ajouts.forEach((n, id) => emis.set(id, (emis.get(id) || 0) + n));
        });
        return sortie;
    }

    /** Groupes de même nom, classés. Même contrat que `analyserDoublons`. */
    function analyser(liste, champ) {
        if (APP_A_LA_BRIQUE) return window.analyserDoublons(liste, champ);

        const groupes = new Map();
        (liste || []).forEach((item) => {
            if (!item || typeof item !== 'object') return;
            const n = normaliser(item[champ]);
            if (!n) return;
            if (!groupes.has(n)) groupes.set(n, []);
            groupes.get(n).push(item);
        });

        const sortie = [];
        groupes.forEach((exemplaires) => {
            if (exemplaires.length < 2) return;

            // Lignées par fermeture transitive (X ← Y ← Z est UNE lignée).
            const parent = exemplaires.map((_, i) => i);
            const racine = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
            for (let a = 0; a < exemplaires.length; a++) {
                for (let b = a + 1; b < exemplaires.length; b++) {
                    if (memeIdentite(exemplaires[a], exemplaires[b])) {
                        const ra = racine(a), rb = racine(b);
                        if (ra !== rb) parent[ra] = rb;
                    }
                }
            }
            const numeros = new Map();
            const lignees = exemplaires.map((_, k) => {
                const r = racine(k);
                if (!numeros.has(r)) numeros.set(r, numeros.size + 1);
                return numeros.get(r);
            });

            const compte = new Map();
            exemplaires.forEach((it) => {
                const id = typeof it.id === 'string' ? it.id.trim() : '';
                if (id) compte.set(id, (compte.get(id) || 0) + 1);
            });

            let categorie = 'homonymes';
            if ([...compte.values()].some((n) => n > 1)) categorie = 'collision-id';
            else if (new Set(lignees).size < lignees.length) categorie = 'copie';

            sortie.push({
                nom: exemplaires[0][champ] || 'Sans titre',
                categorie,
                count: exemplaires.length,
                exemplaires: exemplaires.map((it, k) => {
                    const id = typeof it.id === 'string' ? it.id.trim() : '';
                    return {
                        item: it, id, idCourt: idCourt(id),
                        nomAffiche: it[champ] || 'Sans titre',
                        lignee: lignees[k],
                        collisionId: !!id && compte.get(id) > 1
                    };
                })
            });
        });
        return sortie;
    }

    const ETIQUETTE = {
        'collision-id': '🔴 COLLISION D\'IDENTIFIANT — anomalie de données, à signaler',
        'copie': '🟠 COPIES — même original, tu peux n\'en garder qu\'un',
        'homonymes': '🔵 HOMONYMES — entités distinctes, CE N\'EST PAS UN DÉFAUT'
    };

    function dateDe(item) {
        const d = item.dateModification || item.dateCreation ||
                  item.dateAjoutBiblio || item.dateImport || item.dateAjout || '';
        return d ? String(d).slice(0, 10) : '—';
    }

    function decrireExemplaire(ex, nbLignees) {
        const it = ex.item || {};
        const bouts = [
            '       · « ' + ex.nomAffiche +' »',
            '         id       : ' + (ex.id || '(aucun)') + '   [affiché #' + ex.idCourt + ']'
        ];
        if (it.idOriginal) bouts.push('         copie de : ' + it.idOriginal);
        if (it.inspireDe && typeof it.inspireDe === 'object') {
            const src = it.inspireDe.idOriginal || it.inspireDe.sourceId;
            if (src) bouts.push('         inspiré de : ' + src);
        }
        if (it.inspireDeTrimestre) bouts.push('         importé du trimestre : ' + it.inspireDeTrimestre);
        bouts.push('         modifié le : ' + dateDe(it) +
            '   ·   ' + (it.dansBibliotheque === false ? 'RETIRÉE de ta sélection' : 'dans ta sélection'));
        if (nbLignees > 1) bouts.push('         lignée   : ' + ex.lignee);
        if (ex.collisionId) bouts.push('         ⚠ CET IDENTIFIANT EST PORTÉ PAR PLUS D\'UNE ENTRÉE');
        return bouts.join('\n');
    }

    /** Collisions d'identifiant À L'INTÉRIEUR d'un seul magasin. */
    function collisionsIntraListe(liste) {
        const compte = new Map();
        (liste || []).forEach((it) => {
            if (!it || typeof it.id !== 'string') return;
            const id = it.id.trim();
            if (id) compte.set(id, (compte.get(id) || 0) + 1);
        });
        return [...compte.entries()].filter(([, n]) => n > 1);
    }

    async function diagDoublons() {
        console.log('==== BIBLIOTHÈQUES · doublons · LECTURE SEULE ====');

        /* --- Contexte : écarter d'emblée le « build en retard » ------------ */
        const version = window.VERSION_MAJEURE || '(inconnue)';
        const build = window.BUILD_ID || '(inconnu)';
        console.log('Version chargée : ' + version + '  ·  build ' + build);

        if (APP_A_LA_BRIQUE) {
            console.log('✓ Build À JOUR : le rapport utilise `analyserDoublons` de l\'app.');
        } else {
            console.warn('⚠ CE BUILD EST ANTÉRIEUR au correctif #291 (js/identite-item.js absent).');
            console.warn('  Le rapport ci-dessous est calculé par la copie EMBARQUÉE dans ce script :');
            console.warn('  il est juste, mais l\'APPLICATION que tu as sous les yeux, elle, affiche');
            console.warn('  encore l\'ancien bandeau. Fais `git pull` et recharge à fond pour la suite.');
        }

        if (typeof cle !== 'function' || typeof db === 'undefined') {
            console.error('`cle()` ou `db` indisponible : es-tu bien dans l\'onglet de l\'app ?');
            return;
        }

        const trimestres = db.getSync('trimestres', []) || [];
        const trimestreActif = db.getSync('trimestreActif', null);
        console.log('Trimestre actif : ' + (trimestreActif || '(aucun)'));
        console.log('Trimestres connus : ' + (trimestres.map((t) => t.id).join(', ') || '(aucun)'));
        console.log(LIGNE);

        const releve = { version, build, briqueApp: APP_A_LA_BRIQUE, familles: [] };
        let totalGroupes = 0, totalCollisions = 0, totalCopies = 0, totalHomonymes = 0;

        /* --- Les quatre familles à clé simple ----------------------------- */
        for (const famille of FAMILLES) {
            // Chaque trimestre a son magasin local ; la bibliothèque est partagée.
            const idsTrimestres = trimestres.length
                ? trimestres.map((t) => t.id)
                : (trimestreActif ? [trimestreActif] : []);

            const partages = (await db.get(famille.clePartagee)) || [];

            for (const idTrimestre of idsTrimestres) {
                const cleLocale = idTrimestre + '_' + famille.cleLocale;
                let locaux = (await db.get(cleLocale)) || [];
                // Repli : certaines familles vivent encore sous une clé nue.
                if (!locaux.length) locaux = (await db.get(famille.cleLocale)) || [];

                const bilan = rapporterUnMagasin(
                    famille.nom + ' · ' + idTrimestre, locaux, partages, famille.champ);
                releve.familles.push(bilan.donnees);
                totalGroupes += bilan.groupes;
                totalCollisions += bilan.collisions;
                totalCopies += bilan.copies;
                totalHomonymes += bilan.homonymes;
            }
        }

        /* --- Les cartouches : une clé par grille ET par trimestre ---------- */
        // `db.keys()` est ASYNCHRONE (js/db.js:861) : sans `await`, on filtrerait
        // une promesse et le bloc cartouches serait silencieusement vide.
        //
        // ⚠ S5/#623 — LE MOTIF ANCRÉ `/^cartouches_/` NE TROUVE PLUS RIEN. Le
        // magasin vit sous `<trimestreId>_cartouches_<grilleId>`, un exemplaire
        // par trimestre. Mesuré : 2 clés avant S5, 0 après — et ce zéro
        // s'imprimait « aucun magasin trouvé », qui se lit « rien à signaler ».
        // R1 : un dédoublonneur veut les copies de TOUS les trimestres, et doit
        // dire de quel trimestre vient chaque magasin, sans quoi il présente
        // comme doublons des lots qui appartiennent légitimement à deux
        // trimestres différents.
        const RE_CARTOUCHES = /^(?:([ahe]\d{4}|demo)_)?cartouches_(.+)$/;
        const toutesLesCles = (typeof db.keys === 'function') ? (await db.keys()) : [];
        const clesCartouches = (Array.isArray(toutesLesCles) ? toutesLesCles : [])
            .filter((k) => typeof k === 'string' && RE_CARTOUCHES.test(k));
        // `bibliothequeCartouches` reste GLOBALE par conception
        // (js/cartouches-bibliotheque.js:11-20) : elle n'est PAS namespacée et
        // ne doit pas l'être. Vérifié aux registres de js/trimestres.js.
        const cartouchesPartagees = (await db.get('bibliothequeCartouches')) || [];

        if (!clesCartouches.length) {
            // Le zéro porte son témoin : sans le nombre de clés examinées, « aucun
            // magasin » couvre aussi bien « il n'y en a pas » que « je n'ai pas su
            // regarder ». Les deux s'écrivaient pareil.
            const examinees = Array.isArray(toutesLesCles) ? toutesLesCles.length : 0;
            console.log(examinees === 0
                ? 'Cartouches : ⛔ AUCUNE CLÉ EXAMINÉE — énumération du stockage indisponible. '
                  + 'Ce n\'est PAS « aucun magasin ».'
                : 'Cartouches : aucun magasin de cartouches parmi les ' + examinees + ' clé(s) examinée(s).');
            console.log(LIGNE);
        }
        for (const cleCart of clesCartouches) {
            const locaux = (await db.get(cleCart)) || [];
            if (!locaux.length) continue;
            const m = cleCart.match(RE_CARTOUCHES);
            const trimestre = m[1] || null;   // null ⇒ clé NUE, résidu pré-S5
            const grilleId = m[2];
            const partagesDeCetteGrille = cartouchesPartagees.filter(
                (c) => c && c.grilleId === grilleId);
            const bilan = rapporterUnMagasin(
                'Cartouches · grille ' + idCourt(grilleId)
                    + (trimestre ? ' · trimestre ' + trimestre : ' · ⚠ CLÉ NUE (pré-S5)'),
                locaux, partagesDeCetteGrille, 'nom');
            releve.familles.push(bilan.donnees);
            totalGroupes += bilan.groupes;
            totalCollisions += bilan.collisions;
            totalCopies += bilan.copies;
            totalHomonymes += bilan.homonymes;
        }

        /* --- Résumé -------------------------------------------------------- */
        console.log('RÉSUMÉ');
        console.log('   Groupes de même nom, toutes familles : ' + totalGroupes);
        console.log('     🔴 collisions d\'identifiant : ' + totalCollisions + '   (anomalies — à signaler)');
        console.log('     🟠 copies                    : ' + totalCopies + '   (tu peux n\'en garder qu\'un)');
        console.log('     🔵 homonymes                 : ' + totalHomonymes + '   (rien à faire, c\'est légitime)');
        console.log('');
        console.log('   RIEN N\'A ÉTÉ MODIFIÉ. Copie ce rapport et renvoie-le-moi.');
        console.log('   Le détail complet est aussi dans window.__diagDoublons —');
        console.log('   pour me l\'envoyer d\'un bloc :  copy(JSON.stringify(window.__diagDoublons))');
        console.log('==== fin du relevé ====');

        releve.totaux = {
            groupes: totalGroupes, collisions: totalCollisions,
            copies: totalCopies, homonymes: totalHomonymes
        };
        window.__diagDoublons = releve;
        return releve;
    }

    /** Rapporte UN magasin (locaux + partagés) et rend ses compteurs. */
    function rapporterUnMagasin(etiquette, locaux, partages, champ) {
        console.log(etiquette.toUpperCase());
        console.log('   Ta sélection : ' + locaux.length +
            '   ·   Bibliothèque partagée : ' + partages.length);

        // Les collisions intra-magasin, signalées à part : c'est le cas que
        // l'ancien détecteur faisait disparaître avant même l'affichage.
        [['ta sélection', locaux], ['la bibliothèque partagée', partages]].forEach(([ou, liste]) => {
            collisionsIntraListe(liste).forEach(([id, n]) => {
                console.warn('   🔴 ' + n + ' entrées de ' + ou + ' portent le MÊME identifiant ' + id);
            });
        });

        const groupes = analyser(reunir(locaux, partages), champ);
        if (!groupes.length) {
            console.log('   Aucun groupe de même nom. Rien à trancher ici.');
            console.log(LIGNE);
            return { groupes: 0, collisions: 0, copies: 0, homonymes: 0,
                     donnees: { magasin: etiquette, groupes: [] } };
        }

        let collisions = 0, copies = 0, homonymes = 0;
        groupes.forEach((g) => {
            if (g.categorie === 'collision-id') collisions++;
            else if (g.categorie === 'copie') copies++;
            else homonymes++;

            const nbLignees = new Set(g.exemplaires.map((e) => e.lignee)).size;
            console.log('');
            console.log('   ' + ETIQUETTE[g.categorie]);
            console.log('   « ' + g.nom + ' » — ' + g.count + ' exemplaires');
            g.exemplaires.forEach((ex) => console.log(decrireExemplaire(ex, nbLignees)));

            if (g.categorie === 'copie') {
                console.log('       ⮕ Garde celui que tu veux, retire les autres depuis le bandeau');
                console.log('         de la bibliothèque (bouton « Retirer » : les données restent).');
            } else if (g.categorie === 'homonymes') {
                console.log('       ⮕ Rien à faire. Renomme-les seulement si l\'ambiguïté te gêne.');
            } else {
                console.log('       ⮕ Envoie-moi ce bloc : une collision d\'identifiant se répare');
                console.log('         au cas par cas, jamais en masse.');
            }
        });
        console.log(LIGNE);

        return {
            groupes: groupes.length, collisions, copies, homonymes,
            donnees: {
                magasin: etiquette,
                groupes: groupes.map((g) => ({
                    nom: g.nom, categorie: g.categorie, count: g.count,
                    exemplaires: g.exemplaires.map((e) => ({
                        id: e.id, nom: e.nomAffiche, lignee: e.lignee,
                        collisionId: e.collisionId,
                        idOriginal: (e.item && e.item.idOriginal) || null,
                        date: dateDe(e.item || {}),
                        dansBibliotheque: !(e.item && e.item.dansBibliotheque === false)
                    }))
                }))
            }
        };
    }

    window.diagDoublons = diagDoublons;
    console.log('Script chargé. Tape maintenant :  await diagDoublons()');
})();
