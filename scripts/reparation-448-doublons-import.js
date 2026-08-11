/* ============================================================================
   #448 — RETIRER LES COPIES MUETTES LAISSÉES PAR LES ANCIENS IMPORTS
   ----------------------------------------------------------------------------
   DRY-RUN PAR DÉFAUT. Rien n'est écrit tant que `{ executer: true }` n'est pas
   donné explicitement.

   CE QU'IL NETTOIE, ET CE QU'IL NE NETTOIE PAS
   Le vecteur est bouché depuis la 1.75.0 : réimporter un codex n'ajoute plus
   de copies. Restent celles fabriquées AVANT, et elles ne sont pas toutes de
   la même nature. Le script distingue deux cas et n'en traite qu'un seul de
   lui-même :

     CAS A — « une copie muette à côté d'un original vivant ».
       Deux entrées de même NOM dans un même magasin : l'une citée ailleurs
       dans les données (50, 61, 75, 79 fois chez Grégoire), l'autre citée
       ZÉRO fois. La muette est un jumeau fabriqué à l'import : rien ne la
       lit, la retirer est un no-op fonctionnel démontrable.
       ⮕ C'est le seul cas que ce script propose de retirer.

     CAS B — « un magasin dont PLUS RIEN n'est cité ».
       Toutes les entrées à zéro citation, y compris celles qui feraient
       figure d'originales. Ce n'est pas un doublon : c'est un magasin
       ORPHELIN, né d'une grille renumérotée à l'import (lot du 27 juin).
       Le retirer, c'est supprimer une grille entière et son contenu.
       ⮕ **Le script REFUSE d'y toucher sans un accord explicite et séparé.**
       Il le rapporte, il ne le purge pas. Décider qu'un contenu pédagogique
       est mort n'est pas une décision de script.

   ⚠⚠ LE GARDE-FOU QUI COMMANDE TOUT : « NE RIEN CASSER » N'EST PAS « NE RIEN
   PERDRE ». Le 10 août, sur #442, la 3e copie d'un cours portait
   `heuresContact: 60` et `ponderation: '2-2-3'` — invisibles, parce que seul
   le premier exemplaire était lu. Un retrait « démontrablement sans effet »
   les aurait effacées. Ce script compare donc CHAMP PAR CHAMP la copie et
   l'original avant tout retrait, et **refuse d'exécuter** si la muette porte
   du CONTENU que l'original n'a pas.

   ⮕ « Contenu » exclut les champs que l'APPLICATION pose elle-même à
   l'écriture (`dateImport`, `dateAjoutBiblio`, `dansBibliotheque`, `_hash_v1`).
   La liste n'est pas inventée ici : c'est celle de `securite-hash.js`, qui les
   écarte déjà du calcul des sceaux pour la même raison. Ils sont ÉCARTÉS du
   verdict mais AFFICHÉS dans le rapport — ignorer en silence reproduirait le
   défaut qu'on corrige.
   ⚠ Ça n'est pas un assouplissement de confort : au premier essai sur les
   données réelles (11 août), le script a refusé les 5 retraits parce que
   chaque copie portait le `dateImport` de l'import qui l'avait FABRIQUÉE.
   Perdre cet horodatage en supprimant la copie ne perd rien du travail de
   Grégoire. Le refus était un faux positif — du bon côté, mais un faux
   positif, et un garde qui crie à tort finit par ne plus être écouté.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await reparer448()`                       → dry-run, n'écrit rien
     3. `await reparer448({ executer: true })`     → applique, APRÈS backup Codex
     4. `annuler448()`                             → restaure (même session)
   Repère : le rapport commence par « ==== #448 · copies d'import · ».
   ⚠ À faire dans LES DEUX navigateurs : leurs magasins sont indépendants.
   ========================================================================= */

(function () {
    'use strict';

    function nomDe(item) {
        if (!item || typeof item !== 'object') return '(sans objet)';
        return String(item.nom || item.titre || item.libelle || item.name || '(sans nom)');
    }

    function estVide(v) {
        return v === undefined || v === null || v === ''
            || (Array.isArray(v) && v.length === 0)
            || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
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

    function compterCitations(id, corpus, cleSource) {
        let n = 0;
        for (const cle in corpus) {
            if (cle === cleSource) continue;
            const texte = corpus[cle];
            if (!texte) continue;
            let depuis = 0, pos;
            while ((pos = texte.indexOf(id, depuis)) !== -1) { n++; depuis = pos + id.length; }
        }
        return n;
    }

    /**
     * Champs que l'APPLICATION pose elle-même à l'écriture — pas du contenu.
     *
     * ⚠ CETTE LISTE N'EST PAS INVENTÉE ICI. C'est celle de `securite-hash.js`,
     * qui l'exclut déjà du calcul des sceaux d'intégrité pour exactement la
     * même raison : « champs volatiles, ajoutés par l'app à l'écriture ». Une
     * seconde liste maintenue à part aurait divergé au premier ajout.
     *
     * ⮕ Pourquoi ça compte ici : au premier essai sur les données réelles de
     * Grégoire (11 août), le script a REFUSÉ ses 5 retraits parce que chaque
     * copie portait un `dateImport` absent de l'original. Or `dateImport` est
     * l'horodatage de l'import qui a FABRIQUÉ la copie : le perdre en
     * supprimant la copie ne perd rien de son travail. Le refus était un faux
     * positif — du bon côté, mais un faux positif.
     */
    const CHAMPS_POSES_PAR_LAPP = (window.SecuriteHash && Array.isArray(window.SecuriteHash.CHAMPS_VOLATILES))
        ? window.SecuriteHash.CHAMPS_VOLATILES.slice()
        // Repli si le module n'est pas chargé — tenu à l'identique de
        // securite-hash.js:34. Si l'un bouge, l'autre doit bouger.
        : ['_hash_v1', 'dateImport', 'dateAjoutBiblio', 'dansBibliotheque'];

    /**
     * Ce que la COPIE porte et que l'ORIGINAL n'a pas. C'est la seule question
     * qui autorise ou interdit le retrait.
     * @returns {Array<{champ:string, valeurJson:string, motif:string}>}
     */
    function champsQuiDisparaitraient(copie, original, journalIgnores) {
        const perdus = [];
        if (!copie || typeof copie !== 'object') return perdus;
        for (const champ of Object.keys(copie)) {
            if (champ === 'id') continue;   // l'id de la copie est justement ce qu'on retire
            // Métadonnée posée par l'app : écartée du verdict, mais DITE.
            // Ignorer en silence, c'est reproduire le défaut qu'on corrige.
            if (CHAMPS_POSES_PAR_LAPP.indexOf(champ) !== -1) {
                if (journalIgnores && !estVide(copie[champ])) {
                    journalIgnores.push({ champ, valeurJson: JSON.stringify(copie[champ]) });
                }
                continue;
            }
            const vCopie = copie[champ];
            if (estVide(vCopie)) continue;
            const vOrig = original ? original[champ] : undefined;
            if (estVide(vOrig)) {
                perdus.push({ champ, valeurJson: JSON.stringify(vCopie), motif: 'absent de l\'exemplaire gardé' });
                continue;
            }
            if (JSON.stringify(vOrig) !== JSON.stringify(vCopie)) {
                perdus.push({ champ, valeurJson: JSON.stringify(vCopie), motif: 'DIFFÈRE de l\'exemplaire gardé (' + JSON.stringify(vOrig) + ')' });
            }
        }
        return perdus;
    }

    /**
     * Signature de CONTENU : clés triées récursivement, sans l'id ni les
     * champs posés par l'app. Deux cartouches de même signature portent la
     * même chose, quels que soient leurs identifiants.
     */
    function signatureDeContenu(valeur, souple) {
        const visiter = (v) => {
            if (v === null || typeof v !== 'object') return v;
            if (Array.isArray(v)) return v.map(visiter);
            const sortie = {};
            Object.keys(v).sort().forEach((k) => {
                if (k === 'id' || k === 'grilleId') return;      // l'appartenance change à l'import
                if (CHAMPS_POSES_PAR_LAPP.indexOf(k) !== -1) return;
                // ⚠ MODE SOUPLE — tout identifiant, à toute profondeur.
                // Un import qui recopie une grille RÉGÉNÈRE aussi les ids de
                // ses critères. Deux cartouches réellement jumelles portent
                // alors des ids internes différents, et une comparaison
                // stricte les déclare « uniques » toutes les deux. C'est ce
                // qui a produit 8 faux « CONTENU UNIQUE » sur le relevé de
                // Grégoire du 11 août, dans un magasin de 4 paires.
                if (souple && /(^|[a-z])[Ii]ds?$/.test(k)) return;
                sortie[k] = visiter(v[k]);
            });
            return sortie;
        };
        try { return JSON.stringify(visiter(valeur)); } catch (e) { return null; }
    }

    /**
     * LES DEUX QUESTIONS QUI PERMETTENT DE TRANCHER UN MAGASIN ORPHELIN.
     *
     * Demande de Grégoire, 11 août : après la purge des copies muettes, il
     * reste un magasin dont RIEN n'est cité — né d'une grille renumérotée à
     * l'import du 27 juin. Ses quatre noms sont ceux de sa vraie grille, ce
     * qui suggère une recopie inutile. **Mais « mêmes noms » n'est pas « même
     * contenu »**, et on ne supprime pas 76 K caractères sur une ressemblance
     * de titres.
     *
     *   Q1 — la grille parente existe-t-elle encore quelque part ?
     *   Q2 — le contenu de chaque cartouche existe-t-il DÉJÀ à l'identique
     *        dans un autre magasin ?
     *
     * Si la grille a disparu ET que chaque cartouche a un jumeau vivant
     * ailleurs, le magasin est redondant : le supprimer ne retire rien qui
     * n'existe en double. Si une seule cartouche est UNIQUE, c'est du contenu
     * réel — et il ne se supprime pas, il se récupère.
     *
     * LECTURE SEULE.
     */
    async function inspecterOrphelins448() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #448 · magasins orphelins · LECTURE SEULE ====');

        const cles = await toutesLesCles();
        const magasinsCartouches = cles.filter((c) => c.indexOf('cartouches_') === 0);

        // Toutes les grilles connues, quel que soit le trimestre ou le catalogue.
        const grillesConnues = new Map();   // id → [clés où on la trouve]
        for (const c of cles) {
            if (!/grillesTemplates$|^bibliothequeGrilles$|_bibliothequeGrilles$/.test(c)) continue;
            let liste = null;
            try { liste = await db.get(c); } catch (e) { continue; }
            if (!Array.isArray(liste)) continue;
            for (const g of liste) {
                if (!g || !g.id) continue;
                if (!grillesConnues.has(g.id)) grillesConnues.set(g.id, []);
                grillesConnues.get(g.id).push(c + (g.nom ? ' — « ' + g.nom + ' »' : ''));
            }
        }

        // Corpus des citations, pour retrouver les magasins réellement morts.
        const corpus = {};
        for (const c of cles) {
            try {
                const v = await db.get(c);
                corpus[c] = (v === null || v === undefined) ? '' : JSON.stringify(v);
            } catch (e) { corpus[c] = ''; }
        }

        // Deux index : contenu STRICT, et contenu à identifiants internes près.
        // ⚠ Ils incluent le magasin courant : deux jumelles DANS le même
        // magasin sont exactement ce qu'on cherche, et les exclure faisait
        // déclarer « unique » chacune des deux (défaut du 11 août).
        const parStrict = new Map();
        const parSouple = new Map();
        for (const c of magasinsCartouches) {
            let liste = null;
            try { liste = await db.get(c); } catch (e) { continue; }
            if (!Array.isArray(liste)) continue;
            liste.forEach((item, idx) => {
                const fiche = {
                    cle: c, idx,
                    id: item && item.id,
                    citations: compterCitations(item && item.id ? String(item.id) : ' ', corpus, c)
                };
                const sS = signatureDeContenu(item, false);
                if (sS !== null) {
                    if (!parStrict.has(sS)) parStrict.set(sS, []);
                    parStrict.get(sS).push(fiche);
                }
                const sL = signatureDeContenu(item, true);
                if (sL !== null) {
                    if (!parSouple.has(sL)) parSouple.set(sL, []);
                    parSouple.get(sL).push(fiche);
                }
            });
        }

        let nbOrphelins = 0;
        for (const cleMag of magasinsCartouches) {
            let liste = null;
            try { liste = await db.get(cleMag); } catch (e) { continue; }
            if (!Array.isArray(liste) || liste.length === 0) continue;

            const cite = liste.some((it) => it && it.id
                && compterCitations(String(it.id), corpus, cleMag) > 0);
            if (cite) continue;   // ce magasin sert : ce n'est pas un orphelin

            nbOrphelins++;
            const idGrille = cleMag.slice('cartouches_'.length);
            L('');
            L('▣ ' + cleMag + '  (' + liste.length + ' cartouches, AUCUNE citée)');

            // Q1
            const ou = grillesConnues.get(idGrille);
            if (ou && ou.length) {
                L('   Q1 · la grille parente EXISTE : ' + ou.join(' · '));
                L('        ⮕ Elle est visible dans ta bibliothèque. Supprimer ce magasin la viderait.');
            } else {
                L('   Q1 · la grille parente est INTROUVABLE (aucune bibliothèque ne la porte).');
                L('        ⮕ Ces cartouches pendent à une grille qui n\'existe plus.');
            }

            // Q2
            let uniques = 0, internes = 0;
            L('   Q2 · le contenu existe-t-il ailleurs ?');
            liste.forEach((item, idx) => {
                const nom = nomDe(item);
                const moi = (j) => j.cle === cleMag && j.idx === idx;
                const strictA = (parStrict.get(signatureDeContenu(item, false)) || []).filter((j) => !moi(j));
                const soupleA = (parSouple.get(signatureDeContenu(item, true)) || []).filter((j) => !moi(j));

                const dehors = strictA.filter((j) => j.cle !== cleMag);
                const dedans = strictA.filter((j) => j.cle === cleMag);
                const soupleDehors = soupleA.filter((j) => j.cle !== cleMag);

                if (dehors.length) {
                    const vivant = dehors.find((j) => j.citations > 0) || dehors[0];
                    L('        ✓ « ' + nom + ' » — identique à ' + vivant.id
                        + ' dans ' + vivant.cle + ' (' + vivant.citations + ' citations)');
                } else if (soupleDehors.length) {
                    const vivant = soupleDehors.find((j) => j.citations > 0) || soupleDehors[0];
                    L('        ≈ « ' + nom + ' » — même contenu que ' + vivant.id + ' dans '
                        + vivant.cle + ' (' + vivant.citations + ' citations), aux identifiants');
                    L('             internes près — signature d\'une recopie par import.');
                } else if (dedans.length) {
                    internes++;
                    L('        ⧉ « ' + nom + ' » — en DOUBLE dans ce magasin même (' + dedans[0].id + '),');
                    L('             mais ce contenu n\'existe nulle part ailleurs.');
                } else {
                    uniques++;
                    L('        ⚠ « ' + nom + ' » — CONTENU UNIQUE, il n\'existe nulle part ailleurs');
                }
            });

            L('');
            // ⚠⚠ `internes` COMPTE DANS CETTE CONDITION, et l'oublier a produit
            // le pire verdict possible à l'essai du 11 août : « REDONDANT,
            // supprime » sur un magasin dont le contenu n'existait QUE là, en
            // double interne. Deux exemplaires d'une chose unique restent une
            // chose unique — les supprimer ensemble la perd.
            if (uniques === 0 && internes === 0 && (!ou || !ou.length)) {
                L('   ⮕ VERDICT : grille disparue, et chacune de ces cartouches existe déjà');
                L('     ailleurs à l\'identique. Ce magasin est REDONDANT — le supprimer ne');
                L('     retire rien qui n\'existe en double.');
                L('     Pour l\'effacer, en toute connaissance de cause :');
                L('        await db.remove(\'' + cleMag + '\')');
            } else if (uniques > 0 || internes > 0) {
                if (uniques > 0) {
                    L('   ⛔ VERDICT : ' + uniques + ' cartouche(s) portent un contenu QUI N\'EXISTE');
                    L('     NULLE PART AILLEURS. Ce n\'est pas un doublon — c\'est du travail à toi');
                    L('     que rien ne référence. Ne supprime pas : récupère-le d\'abord.');
                }
                if (internes > 0) {
                    L('   ⧉ ' + internes + ' cartouche(s) sont en double DANS ce magasin, mais leur');
                    L('     contenu n\'existe pas ailleurs. Retirer le magasin entier les perdrait');
                    L('     toutes les deux. ⮕ Si ce contenu t\'est utile, il faut le RATTACHER à');
                    L('     une grille vivante, pas le supprimer.');
                }
            } else {
                L('   ⚠ VERDICT : le contenu est bien redondant, MAIS la grille parente existe');
                L('     encore et resterait vide. À trancher : garder, ou supprimer les deux.');
            }
        }

        if (nbOrphelins === 0) L('Aucun magasin orphelin. Rien à trancher.');
        console.log(out.join('\n'));
        return { orphelins: nbOrphelins };
    }

    window.inspecterOrphelins448 = inspecterOrphelins448;

    async function reparer448(opts) {
        const executer = !!(opts && opts.executer);
        const out = [];
        const L = (m) => out.push(m);

        L('==== #448 · copies d\'import · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');

        const cles = await toutesLesCles();

        // Corpus textuel complet, pour compter les citations.
        const corpus = {};
        for (const c of cles) {
            try {
                const v = await db.get(c);
                corpus[c] = (v === null || v === undefined) ? '' : JSON.stringify(v);
            } catch (e) { corpus[c] = ''; }
        }

        const FAMILLES = ['grillesTemplates', 'echellesTemplates', 'productionsCours', 'pratiquesConfigurables'];
        const magasins = [];
        for (const c of cles) {
            if (c.indexOf('cartouches_') === 0) { magasins.push(c); continue; }
            for (const f of FAMILLES) {
                if (c === f || c.endsWith('_' + f)) { magasins.push(c); break; }
            }
        }

        const plan = [];           // CAS A — retraits proposés
        const orphelins = [];      // CAS B — rapportés, jamais purgés d'office
        const bloquants = [];      // champs qui disparaîtraient

        for (const cleMag of magasins) {
            let liste = null;
            try { liste = await db.get(cleMag); } catch (e) { continue; }
            if (!Array.isArray(liste) || liste.length === 0) continue;

            const parNom = {};
            liste.forEach((item, idx) => {
                const n = nomDe(item);
                (parNom[n] = parNom[n] || []).push({ item, idx });
            });

            const retraits = [];
            for (const nom in parNom) {
                const groupe = parNom[nom];
                if (groupe.length < 2) continue;

                const avecCitations = groupe.map((g) => ({
                    ...g,
                    citations: compterCitations(g.item && g.item.id ? String(g.item.id) : ' ', corpus, cleMag)
                }));
                const vivants = avecCitations.filter((g) => g.citations > 0);
                const muets = avecCitations.filter((g) => g.citations === 0);

                if (vivants.length === 0) {
                    // CAS B : personne n'est cité. On rapporte, on ne touche pas.
                    orphelins.push({ cle: cleMag, nom, exemplaires: groupe.length });
                    continue;
                }
                if (muets.length === 0) continue;   // homonymes tous vivants : normal

                // CAS A. L'exemplaire gardé est le PLUS cité — celui que les
                // données désignent, pas le premier de la liste.
                const garde = vivants.slice().sort((a, b) => b.citations - a.citations)[0];
                for (const m of muets) {
                    const ignores = [];
                    const perdus = champsQuiDisparaitraient(m.item, garde.item, ignores);
                    if (perdus.length) {
                        bloquants.push({ cle: cleMag, nom, id: m.item && m.item.id, perdus });
                    }
                    retraits.push({
                        nom, idx: m.idx,
                        id: m.item && m.item.id,
                        idGarde: garde.item && garde.item.id,
                        citationsGarde: garde.citations,
                        perdus, ignores
                    });
                }
            }

            if (retraits.length) plan.push({ cle: cleMag, liste, retraits });
        }

        // ── Rapport ──────────────────────────────────────────────────────
        if (!plan.length && !orphelins.length) {
            L('Aucune copie muette, aucun magasin orphelin. Rien à faire.');
            console.log(out.join('\n'));
            return { retraits: 0, orphelins: 0 };
        }

        let totalRetraits = 0;
        for (const p of plan) {
            L('');
            L('— ' + p.cle + '  (' + p.liste.length + ' entrées)');
            for (const r of p.retraits) {
                totalRetraits++;
                L('   ✂ « ' + r.nom +' »  copie ' + r.id);
                L('        gardé : ' + r.idGarde + '  (' + r.citationsGarde + ' citations)');
                if (r.perdus.length) {
                    r.perdus.forEach((x) => L('        ⛔ ' + x.champ + ' = ' + x.valeurJson + '  — ' + x.motif));
                }
                if (r.ignores && r.ignores.length) {
                    r.ignores.forEach((x) => L('        · ' + x.champ + ' = ' + x.valeurJson
                        + '  — métadonnée posée par l\'app, écartée du verdict'));
                }
            }
        }

        if (orphelins.length) {
            L('');
            L('⚠ MAGASINS ORPHELINS — RAPPORTÉS, PAS TOUCHÉS :');
            const parCle = {};
            orphelins.forEach((o) => { (parCle[o.cle] = parCle[o.cle] || []).push(o.nom); });
            for (const c in parCle) {
                L('   ' + c);
                L('     ' + parCle[c].length + ' groupe(s) dont AUCUN exemplaire n\'est cité : ' + parCle[c].join(' · '));
            }
            L('   ⮕ Ce n\'est pas un doublon : c\'est un magasin entier que rien ne consulte,');
            L('     né d\'une grille renumérotée à l\'import. Le retirer supprime une grille et');
            L('     son contenu. **Décision humaine — ce script n\'y touchera pas.**');
            L('   ⮕ Pour trancher sur des FAITS plutôt que sur une ressemblance de titres :');
            L('        await inspecterOrphelins448()      (lecture seule)');
        }

        L('');
        L('BILAN : ' + totalRetraits + ' copie(s) muette(s) retirable(s) · ' + orphelins.length + ' groupe(s) orphelin(s) rapporté(s).');

        if (bloquants.length) {
            L('');
            L('⛔ REFUS — ' + bloquants.length + ' copie(s) portent une valeur que l\'exemplaire gardé n\'a pas.');
            L('   « Ne rien casser » n\'est pas « ne rien perdre » : ces valeurs disparaîtraient.');
            L('   Rien n\'a été écrit. Envoie-moi ce rapport avant d\'aller plus loin.');
            console.log(out.join('\n'));
            return { retraits: 0, orphelins: orphelins.length, bloquants: bloquants.length };
        }

        if (!executer) {
            L('');
            L('DRY-RUN — rien n\'a été écrit.');
            L('Pour appliquer, APRÈS un backup Codex :');
            L('   await reparer448({ executer: true })');
            console.log(out.join('\n'));
            return { retraits: totalRetraits, orphelins: orphelins.length, bloquants: 0 };
        }

        // ── Exécution ────────────────────────────────────────────────────
        window._pre448 = {};
        for (const p of plan) {
            window._pre448[p.cle] = JSON.parse(JSON.stringify(p.liste));
            const aRetirer = new Set(p.retraits.map((r) => r.idx));
            const nettoyee = p.liste.filter((_, i) => !aRetirer.has(i));
            await db.set(p.cle, nettoyee);
            L('✔ ' + p.cle + ' : ' + p.liste.length + ' → ' + nettoyee.length + ' entrée(s)');
        }
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R).');
        L('   Filet même-session : annuler448(). Filet durable : ton backup Codex.');
        L('   ⚠ À refaire dans l\'AUTRE navigateur : les magasins sont indépendants.');
        console.log(out.join('\n'));
        return { retraits: totalRetraits, orphelins: orphelins.length, bloquants: 0 };
    }

    window.reparer448 = reparer448;

    window.annuler448 = async function () {
        if (!window._pre448 || !Object.keys(window._pre448).length) {
            console.log('#448 : aucune pré-image en mémoire (la page a été rechargée ?). Filet : backup Codex.');
            return;
        }
        for (const k of Object.keys(window._pre448)) {
            await db.set(k, window._pre448[k]);
            console.log('↩ ' + k + ' restauré à l\'état d\'avant réparation');
        }
        window._pre448 = {};
        console.log('✅ Annulation faite. Recharge la page.');
    };

    console.log('#448 chargé.');
    console.log('  · await reparer448()             → dry-run des copies muettes (n\'écrit rien)');
    console.log('  · await inspecterOrphelins448()  → trancher les magasins orphelins (lecture seule)');
})();
