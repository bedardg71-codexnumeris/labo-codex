/* ============================================================================
   RÉPARATION #442 — retirer les exemplaires en double des collections
   partagées (magasin global `cours`, magasins de modèles namespacés)
   ----------------------------------------------------------------------------
   Constats de terrain :
   · 9 août 2026 (dry-run `reparer154()`, Chrome de Grégoire) — le magasin
     global `cours` porte TROIS entrées 601-102-MQ à l'id identique
     `h2026-601-102-MQ-00001`.
   · 10 août 2026 (sonde #159) — « IDME et niv 0 » existe EN DOUBLE dans
     `a2025_echellesTemplates`. `reparer159b` a refusé de copier vers un
     trimestre où un homonyme existait déjà : le doublon est resté.

   Le vecteur côté code est bouché depuis le 10 août au soir (dédoublonnage par
   identité dans `_fusionnerListeCoursDansCours`, `js/trimestre-v2-cours.js`,
   sentinelle `sentinelle-fusion-cours-442`). Ce script s'occupe des
   exemplaires DÉJÀ installés dans les données.

   ── LA RÈGLE DE SÛRETÉ, ET POURQUOI ELLE TIENT ─────────────────────────
   On ne retire QUE les doublons d'IDENTITÉ (même `id`), et on garde
   TOUJOURS le PREMIER exemplaire de la liste.

   C'est ce qui rend l'opération démontrablement neutre : tous les lecteurs
   de ces collections résolvent par `find` / `findIndex` / `some` sur `.id`
   (cours.js, contexte.js, modes.js, echelles.js, cartouches.js…). Le
   premier exemplaire est donc DÉJÀ le seul que l'application atteigne ;
   les suivants sont inatteignables par construction et ne pèsent que sur
   le budget de stockage (#353). Garder « le plus riche » plutôt que le
   premier CHANGERAIT le comportement — on ne le fait pas.

   ⚠ Les homonymes à ids DIFFÉRENTS ne sont JAMAIS touchés : deux modèles
   qui portent le même nom peuvent être deux objets légitimes, et l'un des
   deux peut être référencé par des cartouches, des grilles ou des
   évaluations. Ils sont RAPPORTÉS, avec le nombre de fois où chaque id
   apparaît ailleurs dans les données — la décision reste humaine.

   MÉCANIQUE (précédent : reparer154, reparer159b)
   - `await reparer442()`                  → DRY-RUN : imprime le plan, n'écrit RIEN
   - `await reparer442({executer: true})`  → applique, après backup Codex
   - `annuler442()`                        → restaure l'état d'avant (même
                                             session seulement — le filet
                                             inter-session est le backup Codex)

   Usage : console (Cmd+Option+J), coller le fichier, Entrée, puis
   `await reparer442()`. Coller le rapport dans la conversation AVANT
   d'exécuter.
   ============================================================================ */
(function () {
    'use strict';

    // Collections visées.
    // · globales (jamais préfixées) : magasins d'entités + catalogues de gabarits ;
    // · suffixes : modèles de TRAVAIL, namespacés par trimestre depuis #358 ;
    // · cartouches : une clé par grille ET par trimestre depuis S5/#623
    //   (`<trimestreId>_cartouches_<idGrille>`) ; voir estCleCartouches.
    // Remplace `scripts/dedoublonner-biblios.js` (10 août 2026, soir), qui visait
    // encore les globales NUES `grillesTemplates`/`echellesTemplates` — vidées
    // au boot depuis #358, donc sans effet — et n'avait ni dry-run ni annulation.
    const CLES_GLOBALES_VISEES = [
        'cours', 'listeCours', 'enseignants',
        'bibliothequeGrilles', 'bibliothequeEchelles',
        'bibliothequePratiques', 'bibliothequeProductions'
    ];
    const SUFFIXES_MODELES = ['echellesTemplates', 'grillesTemplates'];

    // S5/#623 — LES CARTOUCHES SONT DEVENUES NAMESPACÉES, COMME LES MODÈLES.
    // `cartouches_<grilleId>` n'est plus une clé de stockage : le magasin vit
    // sous `<trimestreId>_cartouches_<grilleId>`. La famille rejoint donc la
    // forme de `SUFFIXES_MODELES` juste au-dessus — nue OU préfixée — au lieu
    // du `startsWith` seul, qui ne trouvait plus rien (mesuré : 2 clés avant
    // S5, 0 après). R1 : un dédoublonneur doit voir TOUTES les copies.
    // ⚠ Le suffixe est ici un PRÉFIXE COMPOSÉ (`cartouches_` + un id de
    // grille), pas un nom fixe : d'où le test sur la position du motif plutôt
    // qu'une égalité. Ne pas le replier dans SUFFIXES_MODELES, dont les entrées
    // sont des noms entiers.
    const estCleCartouches = (k) => {
        if (typeof k !== 'string') return false;
        const i = k.indexOf('cartouches_');
        if (i === 0) return true;                       // clé nue (résidu pré-S5)
        // Le préfixe doit être un ID DE TRIMESTRE, pas n'importe quoi suivi d'un
        // `_`. Sans cette garde, le motif happe la clé
        // `migration_cartouches_namespacees_done` — le drapeau posé par la
        // migration S5 elle-même (js/main.js:735), dont la valeur est un booléen
        // et non une liste de cartouches. Défaut mesuré par Playwright le
        // 31 août 2026, invisible à la relecture. `[ahe]` couvre les trois
        // sessions que `creerTrimestre` accepte (A, H, E), `demo` le pack démo.
        return i > 0 && k[i - 1] === '_' && /^([ahe]\d{4}|demo)$/.test(k.slice(0, i - 1));
    };

    function _nomLisible(item) {
        if (!item) return '?';
        return item.nom || item.nomCours || item.titre || item.codeCours ||
               item.sigle || item.code || '(sans nom)';
    }

    /**
     * Signature d'homonymie — sert UNIQUEMENT au rapport, jamais au retrait.
     *
     * Pour les magasins de COURS, deux fiches au même intitulé dans deux
     * périodes différentes sont deux objets parfaitement légitimes (le même
     * cours, enseigné deux fois) : la période entre donc dans la signature,
     * sinon chaque rentrée produirait une fausse alerte. C'est le même
     * raisonnement que le « tuple naturel » de `trimestre-v2-cours.js`.
     *
     * Pour les modèles (échelles, grilles, cartouches, bibliothèques),
     * l'intitulé seul est la bonne signature : c'est exactement le symptôme
     * rapporté par la sonde #159 (« IDME et niv 0 » en double dans a2025).
     */
    function _signatureHomonymie(item, cleCollection) {
        const nom = _nomLisible(item);
        if (cleCollection !== 'cours' && cleCollection !== 'listeCours') return nom;
        const session = (item.session || '').toString().charAt(0).toUpperCase();
        const annee = (item.annee || '').toString().trim();
        return (session && annee) ? nom + ' | ' + session + annee : nom;
    }

    /** Union des clés visibles : localStorage ∪ memoryCache ∪ IndexedDB. */
    async function _toutesLesCles() {
        const cles = new Set();
        try { db.keysSync().forEach(k => cles.add(String(k))); } catch (e) { /* best-effort */ }
        try { (await db.keys() || []).forEach(k => cles.add(String(k))); } catch (e) { /* best-effort */ }
        return [...cles];
    }

    async function _clesVisees() {
        const toutes = await _toutesLesCles();
        const retenues = toutes.filter(k =>
            CLES_GLOBALES_VISEES.includes(k) ||
            SUFFIXES_MODELES.some(s => k === s || k.endsWith('_' + s)) ||
            estCleCartouches(k)
        );
        return retenues.sort();
    }

    /**
     * Champs par lesquels les copies diffèrent de l'exemplaire gardé.
     * Le retrait reste un no-op fonctionnel (les copies sont inatteignables),
     * mais « elles diffèrent » sans dire EN QUOI est une alerte sans matière —
     * et c'est justement le moment où l'on décide de supprimer.
     */
    function _comparerCopies(garde, copies) {
        const ecarts = [];
        copies.forEach(function (copie, n) {
            const champs = new Set([...Object.keys(garde || {}), ...Object.keys(copie || {})]);
            const diffs = [];
            champs.forEach(function (k) {
                const a = JSON.stringify(garde ? garde[k] : undefined);
                const b = JSON.stringify(copie ? copie[k] : undefined);
                if (a !== b) {
                    diffs.push(k + ' : ' + (a === undefined ? '(absent)' : a) +
                               '  →  ' + (b === undefined ? '(absent)' : b));
                }
            });
            if (diffs.length) ecarts.push({ copie: n + 2, diffs: diffs });
        });
        return ecarts;
    }

    function _estVide(v) {
        return v === undefined || v === null || v === '';
    }

    /**
     * #442 (10 août 2026, sur pièces) — CHAMPS À RÉCUPÉRER avant de retirer.
     *
     * POURQUOI CETTE FONCTION EXISTE. Sur les données réelles de Grégoire, la
     * TROISIÈME copie de `h2026-601-102-MQ-00001` portait `heuresContact: 60`
     * et `ponderation: '2-2-3'` — deux attributs bien réels du cours 601-102-MQ
     * — alors que l'exemplaire GARDÉ (le 1er) avait ces champs vides.
     *
     * ⮕ Le retrait restait un no-op fonctionnel : `find` rend le 1er, donc
     * l'application ne lisait déjà QUE des champs vides. Mais « ne rien casser »
     * n'est pas « ne rien perdre » : ces valeurs auraient disparu des données
     * sans que personne ne s'en aperçoive, puisqu'elles n'étaient déjà affichées
     * nulle part. C'est le pire profil de perte — invisible avant ET après.
     *
     * On récupère donc AVANT de retirer, et seulement là où c'est sans ambiguïté :
     * champ vide chez le gardé, non vide chez UNE copie. Si deux copies proposent
     * des valeurs différentes pour le même champ, on REFUSE — le script ne
     * devine pas (même règle que `reparer154`).
     */
    function _champsRecuperables(garde, copies) {
        const propositions = {};   // champ → Set de valeurs (JSON) proposées
        copies.forEach(function (copie) {
            Object.keys(copie || {}).forEach(function (k) {
                if (!_estVide(garde ? garde[k] : undefined)) return;  // le gardé a déjà une valeur
                if (_estVide(copie[k])) return;
                if (!propositions[k]) propositions[k] = new Set();
                propositions[k].add(JSON.stringify(copie[k]));
            });
        });
        const recuperables = [];
        const ambigus = [];
        Object.keys(propositions).forEach(function (k) {
            const valeurs = Array.from(propositions[k]);
            if (valeurs.length === 1) recuperables.push({ champ: k, valeurJson: valeurs[0] });
            else ambigus.push({ champ: k, valeurs: valeurs });
        });
        return { recuperables: recuperables, ambigus: ambigus };
    }

    /**
     * Analyse une liste : groupes d'ids en double (retirables) et groupes
     * d'homonymes à ids différents (rapportés seulement).
     */
    function _analyserListe(liste, cleCollection) {
        const parId = new Map();
        const sansId = [];
        liste.forEach((item, index) => {
            if (!item || typeof item !== 'object') return;
            if (!item.id) { sansId.push({ index, nom: _nomLisible(item) }); return; }
            if (!parId.has(item.id)) parId.set(item.id, []);
            parId.get(item.id).push({ index, item });
        });

        const doublonsId = [];
        parId.forEach((occurrences, id) => {
            if (occurrences.length < 2) return;
            const garde = occurrences[0];
            const retires = occurrences.slice(1);
            const refJson = JSON.stringify(garde.item);
            doublonsId.push({
                id,
                nom: _nomLisible(garde.item),
                nbTotal: occurrences.length,
                indicesRetires: retires.map(o => o.index),
                identiques: retires.every(o => JSON.stringify(o.item) === refJson),
                // Ce qui DIFFÈRE entre l'exemplaire gardé et les autres. Sans ça,
                // « les copies diffèrent » est une inquiétude sans matière : on ne
                // peut pas décider d'un retrait qu'on ne voit pas.
                ecarts: _comparerCopies(garde.item, retires.map(o => o.item)),
                // Ce que le retrait FERAIT PERDRE si on ne le récupérait pas.
                recuperation: _champsRecuperables(garde.item, retires.map(o => o.item))
            });
        });

        // Homonymes à ids différents — jamais retirés, seulement signalés.
        const parNom = new Map();
        parId.forEach((occurrences, id) => {
            const sig = _signatureHomonymie(occurrences[0].item, cleCollection);
            if (!parNom.has(sig)) parNom.set(sig, []);
            parNom.get(sig).push(id);
        });
        const homonymes = [];
        parNom.forEach((ids, nom) => { if (ids.length > 1) homonymes.push({ nom, ids }); });

        return { doublonsId, homonymes, sansId, total: liste.length };
    }

    /**
     * Compte, pour chaque id donné, le nombre de clés où la chaîne apparaît
     * ailleurs dans les données. Comptage TEXTUEL et volontairement brut :
     * il ne prétend pas connaître le schéma, il dit « cet id est cité N fois ».
     */
    async function _compterCitations(ids, clesExclues) {
        const compte = {};
        ids.forEach(id => { compte[id] = 0; });
        const toutes = await _toutesLesCles();
        for (const k of toutes) {
            if (clesExclues.has(k)) continue;
            let brut;
            try { brut = JSON.stringify(await db.get(k, null)); } catch (e) { continue; }
            if (!brut) continue;
            ids.forEach(id => { if (brut.includes(id)) compte[id]++; });
        }
        return compte;
    }

    window.reparer442 = async function (opts) {
        const executer = !!(opts && opts.executer);
        const out = [];
        const L = s => out.push(s);
        L('==== RÉPARATION #442 · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');

        const cles = await _clesVisees();
        L('Collections scannées (' + cles.length + ') : ' + (cles.join(' · ') || 'AUCUNE'));
        L('');

        const plan = [];
        const homonymesGlobaux = [];

        for (const k of cles) {
            let liste;
            try { liste = await db.get(k, null); } catch (e) { liste = null; }
            if (!Array.isArray(liste)) {
                L('— ' + k + ' → ' + (liste === null ? 'ABSENTE' : 'pas un tableau (' + typeof liste + ') — ignorée'));
                continue;
            }
            const a = _analyserListe(liste, k);
            const nbARetirer = a.doublonsId.reduce((n, d) => n + d.indicesRetires.length, 0);

            L('— ' + k + ' : ' + a.total + ' entrée(s)' +
              (nbARetirer ? ' · ⚠ ' + nbARetirer + ' exemplaire(s) en trop' : ' · ✅ aucun doublon d\'id') +
              (a.sansId.length ? ' · ' + a.sansId.length + ' sans id (intouchées)' : ''));

            a.doublonsId.forEach(d => {
                L('    · ' + d.id + ' « ' + d.nom + ' » — ' + d.nbTotal + ' exemplaires, on garde le 1er, on retire ' +
                  d.indicesRetires.length +
                  (d.identiques ? ' (copies identiques au caractère près)' : ' ⚠ (les copies DIFFÈRENT du 1er)'));
                d.ecarts.forEach(e => {
                    L('        ⚠ exemplaire n°' + e.copie + ' — ce qui diffère du gardé :');
                    e.diffs.forEach(x => L('            ' + x));
                });
                if (d.ecarts.length) {
                    L('        ⮕ Le retrait reste sans effet sur l\'application : tous les lecteurs');
                    L('          résolvent par `find` sur l\'id, donc SEUL le 1er exemplaire était lu.');
                }
                const rec = d.recuperation.recuperables;
                const amb = d.recuperation.ambigus;
                if (rec.length) {
                    L('        ⚠ CHAMPS À RÉCUPÉRER — vides chez le gardé, renseignés chez une copie :');
                    rec.forEach(r => L('            ' + r.champ + ' = ' + r.valeurJson));
                    L('          ⮕ Sans récupération, ces valeurs DISPARAISSENT des données. Elles');
                    L('            n\'étaient déjà affichées nulle part (le 1er exemplaire seul est lu),');
                    L('            donc la perte serait invisible avant ET après — le pire profil.');
                    L('          ⮕ Pour les verser dans le 1er exemplaire puis retirer les copies :');
                    L('                await reparer442({ executer: true, fusionnerChamps: true })');
                }
                if (amb.length) {
                    L('        ⛔ CHAMPS AMBIGUS — deux copies proposent des valeurs différentes :');
                    amb.forEach(a => L('            ' + a.champ + ' : ' + a.valeurs.join('  |  ')));
                    L('          Le script ne devine pas : corrige le 1er exemplaire à la main.');
                }
            });
            a.homonymes.forEach(h => {
                homonymesGlobaux.push({ cle: k, nom: h.nom, ids: h.ids });
            });

            if (nbARetirer > 0) plan.push({ cle: k, analyse: a, liste });
        }

        // ── Homonymes : rapport seulement, avec comptage de citations ─────
        if (homonymesGlobaux.length > 0) {
            L('');
            L('⚠ HOMONYMES À IDS DIFFÉRENTS — NON TOUCHÉS par ce script (décision humaine) :');
            const clesExclues = new Set(homonymesGlobaux.map(h => h.cle));
            for (const h of homonymesGlobaux) {
                const cites = await _compterCitations(h.ids, clesExclues);
                L('    · ' + h.cle + ' « ' + h.nom + ' » → ' +
                  h.ids.map(id => id + ' (cité dans ' + cites[id] + ' autre(s) clé(s))').join(' · '));
            }
            L('    ⮕ Comptage TEXTUEL : un id cité ailleurs est probablement référencé (cartouche,');
            L('      grille, évaluation). Un id cité 0 fois est probablement l\'exemplaire orphelin.');
            L('      C\'est un indice, pas un verdict — à lire avant de supprimer à la main.');
        }

        const totalARetirer = plan.reduce(
            (n, p) => n + p.analyse.doublonsId.reduce((m, d) => m + d.indicesRetires.length, 0), 0);

        if (totalARetirer === 0) {
            L('');
            L('✅ Aucun doublon d\'identité à retirer.' +
              (homonymesGlobaux.length ? ' (Les homonymes ci-dessus restent à trancher à la main.)' : ''));
            console.log(out.join('\n'));
            return;
        }

        // Y a-t-il des valeurs qui disparaîtraient sans récupération ?
        const totalRecuperables = plan.reduce((n, p) =>
            n + p.analyse.doublonsId.reduce((m, d) => m + d.recuperation.recuperables.length, 0), 0);

        if (!executer) {
            L('');
            L('DRY-RUN terminé : ' + totalARetirer + ' exemplaire(s) en trop, dans ' + plan.length + ' collection(s).');
            if (totalRecuperables > 0) {
                L('⚠ ' + totalRecuperables + ' champ(s) seraient PERDUS par un simple retrait (voir ci-dessus).');
                L('Si le plan est bon ET que le backup Codex est fait :');
                L('    await reparer442({ executer: true, fusionnerChamps: true })   ← récupère puis retire');
                L('    await reparer442({ executer: true, ignorerChamps: true })     ← retire SANS récupérer');
            } else {
                L('Si le plan est bon ET que le backup Codex est fait :');
                L('    await reparer442({ executer: true })');
            }
            console.log(out.join('\n'));
            return;
        }

        // ⛔ REFUS EXPLICITE plutôt que perte silencieuse : si des valeurs
        // disparaîtraient, l'appelant doit dire ce qu'il en fait. Même posture
        // que `reparer154`, qui refuse toute cible ambiguë au lieu de deviner.
        const fusionner = !!(opts && opts.fusionnerChamps);
        const ignorer = !!(opts && opts.ignorerChamps);
        if (totalRecuperables > 0 && !fusionner && !ignorer) {
            L('');
            L('⛔ REFUS : ' + totalRecuperables + ' champ(s) renseignés chez une copie et VIDES chez');
            L('   l\'exemplaire gardé disparaîtraient. Rien n\'a été écrit.');
            L('   Choisis explicitement :');
            L('     await reparer442({ executer: true, fusionnerChamps: true })   ← récupère puis retire');
            L('     await reparer442({ executer: true, ignorerChamps: true })     ← retire SANS récupérer');
            console.log(out.join('\n'));
            return;
        }

        // ── Exécution ────────────────────────────────────────────────────
        window._pre442 = {};
        for (const p of plan) {
            window._pre442[p.cle] = JSON.parse(JSON.stringify(p.liste));
            const aRetirer = new Set();
            p.analyse.doublonsId.forEach(d => {
                // Récupération AVANT retrait : on ne remplit que du vide, donc
                // aucune valeur en place n'est écrasée.
                if (fusionner && d.recuperation.recuperables.length) {
                    const garde = p.liste.find(x => x && x.id === d.id);
                    d.recuperation.recuperables.forEach(r => {
                        if (garde && _estVide(garde[r.champ])) {
                            garde[r.champ] = JSON.parse(r.valeurJson);
                            L('  ↳ ' + d.id + ' · ' + r.champ + ' récupéré = ' + r.valeurJson);
                        }
                    });
                }
                d.indicesRetires.forEach(i => aRetirer.add(i));
            });
            const nettoyee = p.liste.filter((_, i) => !aRetirer.has(i));
            await db.set(p.cle, nettoyee);
            L('✔ ' + p.cle + ' : ' + p.liste.length + ' → ' + nettoyee.length + ' entrée(s)');
        }
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R).');
        L('   Filet même-session : annuler442(). Filet durable : ton backup Codex.');
        console.log(out.join('\n'));
    };

    window.annuler442 = async function () {
        if (!window._pre442 || !Object.keys(window._pre442).length) {
            console.log('#442 : aucune pré-image en mémoire (la page a été rechargée ?). Filet : backup Codex.');
            return;
        }
        for (const k of Object.keys(window._pre442)) {
            await db.set(k, window._pre442[k]);
            console.log('↩ ' + k + ' restauré à l\'état d\'avant réparation');
        }
        window._pre442 = {};
        console.log('✅ Annulation faite. Recharge la page.');
    };

    console.log('#442 chargé. D\'abord : await reparer442()  (dry-run, n\'écrit rien)');
})();
