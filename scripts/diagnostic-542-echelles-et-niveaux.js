/* ============================================================================
   #542 — LOT 0 · CE QUE TES ÉVALUATIONS DISENT DE LEURS ÉCHELLES
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   POURQUOI CETTE SONDE EXISTE (plan `PLAN-SOLO-echelle-et-depistage.md`, §4).
   Le plan du 26 août ouvre quatre chantiers sur le dépistage. Trois d'entre eux
   se décident sur des faits que PERSONNE n'a encore mesurés :

     · faut-il retirer le niveau « 0 » de ton échelle ? — c'est une décision sur
       TES données, pas sur du code. On ne la prend pas sans savoir si des
       évaluations le portent ;
     · A2 et A3 (le dépistage rendu muet par une échelle non résolue) sont-ils
       des risques ACTIFS chez toi, ou seulement latents pour un autre
       utilisateur ? Le correctif est le même dans les deux cas, mais l'urgence
       ne l'est pas ;
     · le devenir des seuils `idme.*` (repli ou disparition, lot 3) dépend du
       nombre d'évaluations dont l'échelle est effectivement lisible.

   ⚠ CE QUE CETTE SONDE NE FAIT PAS. Elle ne conclut pas à ta place et elle
   refuse de conclure quand elle ne sait pas — patron des sondes #442 et #453.
   Un niveau introuvable dans son échelle n'est pas déclaré « faux » : il est
   déclaré NON CONVERTIBLE, ce qui est un fait, alors que « faux » serait un
   jugement que la mesure ne porte pas.

   ── LES QUATRE QUESTIONS DU LOT 0 ───────────────────────────────────────────
     Q1 — combien d'évaluations portent un niveau dont le code n'existe PLUS
          dans l'échelle qui les a produites ?
     Q2 — combien portent le niveau `0` ?
     Q3 — combien portent un `echelleId` préfixé `pratique-` ? (défaut A2 :
          `obtenirTableConversionNiveaux` ne lit que `echellesTemplates`, donc
          ces évaluations ne se convertissent pas)
     Q4 — combien n'ont AUCUN `echelleId` ? (défaut A3 : sans désignation, la
          table n'est résolue que s'il n'y a qu'UNE échelle dans le trimestre —
          sinon la conversion rend `null`, en silence)

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await diag542()`
   Repère : le rapport commence par « ==== #542 · lot 0 ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r1 · 27 août 2026 · lot 0 du plan SOLO';

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

    // La normalisation qu'applique `obtenirTableConversionNiveaux` aux codes de
    // niveau (`profil-etudiant-calculs.js`). On la RECOPIE ici volontairement :
    // la sonde doit mesurer ce que le calcul VOIT, pas ce qu'il devrait voir.
    function normaliserCode(v) {
        if (v == null) return '';
        return String(v).trim().toUpperCase();
    }

    // Les codes convertibles d'une échelle = ceux qui portent une valeur
    // ponctuelle exploitable. Un niveau SANS `valeurCalcul` est légitimement
    // hors calcul (« jugement suspendu », cf. §3-C4 du plan) — il n'est donc
    // pas compté comme une anomalie, mais il est compté à part.
    function codesDeLEchelle(echelle) {
        const avecValeur = new Set();
        const sansValeur = new Set();
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        for (const n of niveaux) {
            if (!n || n.code == null) continue;
            const code = normaliserCode(n.code);
            if (!code) continue;
            const brut = n.valeurCalcul;
            const vide = (brut == null || String(brut).trim() === '' || isNaN(parseFloat(brut)));
            if (vide) sansValeur.add(code); else avecValeur.add(code);
        }
        return { avecValeur, sansValeur };
    }

    async function diag542() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #542 · lot 0 · échelles et niveaux des évaluations · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);
        L('');

        const cles = await toutesLesCles();

        // ── Où vit chaque échelle, et sous quelle forme ─────────────────────
        // Deux gisements, et c'est TOUT le sujet du défaut A2 : les échelles
        // « templates » (celles que la table de conversion sait lire) et les
        // échelles EMBARQUÉES dans une pratique configurable (celles qu'elle
        // ignore, alors que l'évaluation les désigne par `pratique-<id>`).
        const echellesTemplates = new Map();   // id → { nom, magasin, echelle }
        const echellesPratiques = new Map();   // 'pratique-<id>' → { nom, magasin, echelle }

        for (const c of cles) {
            if (/echellesTemplates$/.test(c)) {
                const liste = await lire(c);
                if (!Array.isArray(liste)) continue;
                for (const e of liste) {
                    if (!e || !e.id) continue;
                    if (!echellesTemplates.has(e.id)) {
                        echellesTemplates.set(e.id, { nom: e.nom || '(sans nom)', magasin: c, echelle: e });
                    }
                    // `idOriginal` : la table de conversion le reconnaît aussi.
                    if (e.idOriginal && !echellesTemplates.has(e.idOriginal)) {
                        echellesTemplates.set(e.idOriginal, { nom: e.nom || '(sans nom)', magasin: c, echelle: e });
                    }
                }
            } else if (/pratiquesConfigurables$/.test(c)) {
                const liste = await lire(c);
                if (!Array.isArray(liste)) continue;
                for (const p of liste) {
                    if (!p || !p.id) continue;
                    const ech = p.config && p.config.echelle;
                    if (!ech) continue;
                    const idEchelle = 'pratique-' + p.id;
                    if (!echellesPratiques.has(idEchelle)) {
                        echellesPratiques.set(idEchelle, {
                            nom: (p.config.nom || p.nom || '(sans nom)') + ' — échelle embarquée',
                            magasin: c,
                            echelle: ech
                        });
                    }
                }
            }
        }

        L('Échelles « templates » lisibles par la conversion : ' + echellesTemplates.size);
        L('Échelles EMBARQUÉES dans une pratique (invisibles pour elle) : ' + echellesPratiques.size);
        for (const [id, info] of echellesPratiques) {
            L('   · ' + id + ' — ' + info.nom + '  [' + info.magasin + ']');
        }
        L('');

        // Combien d'échelles utilisables par magasin : c'est ce qui décide si
        // une évaluation SANS `echelleId` est résoluble (une seule = pas
        // d'ambiguïté) ou muette (plusieurs).
        const nbEchellesParMagasin = new Map();
        for (const c of cles) {
            if (!/echellesTemplates$/.test(c)) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            const utilisables = liste.filter((e) => e && Array.isArray(e.niveaux) && e.niveaux.length > 0);
            nbEchellesParMagasin.set(c, utilisables.length);
        }

        // ── Les évaluations, magasin par magasin ────────────────────────────
        // Le pack démo est ÉCARTÉ du verdict : ses évaluations sont fabriquées,
        // et les compter reviendrait à diagnostiquer la démonstration.
        const tousEvals = cles.filter((c) => /(^|_)evaluationsSauvegardees$/.test(c));
        const magasinsEvals = tousEvals.filter((c) => c.indexOf('demo') !== 0);
        const ecartes = tousEvals.filter((c) => c.indexOf('demo') === 0);
        if (ecartes.length) L('Écarté du verdict (pack démo) : ' + ecartes.join(', '));

        if (!magasinsEvals.length) {
            L('⚠ Aucun magasin d\'évaluations RÉEL trouvé (hors démo). Rien à mesurer.');
            console.log(out.join('\n'));
            return { magasins: 0 };
        }

        let nEvals = 0;                 // évaluations examinées
        let nCriteres = 0;              // couples (évaluation, critère) porteurs d'un niveau
        let q1 = 0;                     // Q1 — code absent de son échelle
        let q1SansValeur = 0;           //      code présent mais SANS valeur ponctuelle
        let q2 = 0;                     // Q2 — niveau « 0 »
        let q3Evals = 0, q3Criteres = 0; // Q3 — echelleId « pratique-* »
        let q4Evals = 0, q4Criteres = 0; // Q4 — aucun echelleId
        let q4Resoluble = 0;            //      … dont le magasin n'a qu'UNE échelle
        let nEchelleIntrouvable = 0;    // echelleId nommé mais absent partout
        let nConvertibles = 0;          // couples effectivement convertibles

        const detailQ1 = new Map();     // 'code @ echelleId' → n
        const detailQ2 = new Map();     // productionNom → n
        const detailQ3 = new Map();     // echelleId → n
        const detailIntrouvables = new Map();

        function compter(map, cle) { map.set(cle, (map.get(cle) || 0) + 1); }

        for (const cleEval of magasinsEvals) {
            const liste = await lire(cleEval);
            if (!Array.isArray(liste) || !liste.length) continue;

            const prefixe = cleEval.indexOf('_') !== -1 ? cleEval.split('_')[0] : '(global)';
            const cleEchelles = prefixe === '(global)' ? 'echellesTemplates' : prefixe + '_echellesTemplates';
            const nbEchelles = nbEchellesParMagasin.get(cleEchelles) || 0;

            for (const ev of liste) {
                if (!ev) continue;
                // Les évaluations remplacées portent l'état d'AVANT une reprise :
                // les compter ferait remonter un modèle périmé (patron #453).
                if (ev.remplaceeParId) continue;
                nEvals++;

                const idEchelle = ev.echelleId || '';
                const estPratique = idEchelle.indexOf('pratique-') === 0;
                const sansId = idEchelle === '';

                // Quelle échelle le CALCUL trouverait-il aujourd'hui ?
                let info = null;
                if (estPratique) {
                    info = null; // ⮕ défaut A2 : la conversion ne lit pas ce gisement
                } else if (idEchelle) {
                    info = echellesTemplates.get(idEchelle) || null;
                } else if (nbEchelles === 1) {
                    // Une seule échelle dans le magasin : pas d'ambiguïté, la
                    // conversion résout. On retrouve laquelle.
                    const liste2 = await lire(cleEchelles);
                    const u = (liste2 || []).filter((e) => e && Array.isArray(e.niveaux) && e.niveaux.length > 0);
                    info = u.length === 1 ? { nom: u[0].nom, magasin: cleEchelles, echelle: u[0] } : null;
                }

                // Pour Q1 on veut savoir si le code existe dans l'échelle qui a
                // VRAIMENT produit l'évaluation — y compris quand c'est une
                // échelle de pratique, que le calcul ignore mais qui existe.
                const infoReelle = info || (estPratique ? echellesPratiques.get(idEchelle) : null) || null;

                if (estPratique) {
                    q3Evals++;
                    compter(detailQ3, idEchelle + (echellesPratiques.has(idEchelle) ? '' : '  ⚠ pratique introuvable'));
                }
                if (sansId) {
                    q4Evals++;
                    if (nbEchelles === 1) q4Resoluble++;
                }
                if (idEchelle && !estPratique && !info) {
                    nEchelleIntrouvable++;
                    compter(detailIntrouvables, idEchelle + '  [' + cleEval + ']');
                }

                const criteres = Array.isArray(ev.criteres) ? ev.criteres : [];
                const codes = infoReelle ? codesDeLEchelle(infoReelle.echelle) : null;

                for (const c of criteres) {
                    if (!c) continue;
                    const niveau = c.niveauSelectionne;
                    if (niveau == null || String(niveau).trim() === '') continue;
                    nCriteres++;
                    const code = normaliserCode(niveau);

                    if (code === '0') {
                        q2++;
                        compter(detailQ2, (ev.productionNom || '(production sans nom)') + '  [' + cleEval + ']');
                    }
                    if (estPratique) q3Criteres++;
                    if (sansId) q4Criteres++;

                    if (codes) {
                        if (codes.avecValeur.has(code)) {
                            // Convertible SEULEMENT si le calcul sait atteindre
                            // l'échelle : une échelle de pratique est lisible
                            // ici mais invisible pour lui (A2).
                            if (info) nConvertibles++;
                        } else if (codes.sansValeur.has(code)) {
                            q1SansValeur++;
                        } else {
                            q1++;
                            compter(detailQ1, code + ' @ ' + (idEchelle || '(aucun echelleId)'));
                        }
                    }
                }
            }
        }

        // ── LE RAPPORT ──────────────────────────────────────────────────────
        L('Magasins d\'évaluations lus : ' + magasinsEvals.join(', '));
        L('Évaluations examinées (hors remplacées) : ' + nEvals);
        L('Niveaux saisis (couples évaluation × critère)  : ' + nCriteres);
        L('');
        L('── Q1 · un niveau dont le code n\'existe plus dans son échelle ──────');
        L('   codes ABSENTS de l\'échelle             : ' + q1);
        L('   codes présents mais SANS valeur ponctuelle : ' + q1SansValeur
            + '   ← hors calcul par construction, pas une anomalie');
        if (detailQ1.size) {
            for (const [k, n] of [...detailQ1].sort((a, b) => b[1] - a[1])) L('      · ' + k + ' → ' + n);
        }
        L('');
        L('── Q2 · le niveau « 0 » ────────────────────────────────────────────');
        L('   niveaux saisis au code « 0 » : ' + q2);
        if (detailQ2.size) {
            for (const [k, n] of [...detailQ2].sort((a, b) => b[1] - a[1]).slice(0, 20)) L('      · ' + k + ' → ' + n);
            if (detailQ2.size > 20) L('      … et ' + (detailQ2.size - 20) + ' autre(s)');
        }
        L('');
        L('── Q3 · echelleId préfixé « pratique- » (défaut A2) ────────────────');
        L('   évaluations concernées : ' + q3Evals + '   (niveaux : ' + q3Criteres + ')');
        if (detailQ3.size) {
            for (const [k, n] of [...detailQ3].sort((a, b) => b[1] - a[1])) L('      · ' + k + ' → ' + n);
        }
        L('');
        L('── Q4 · aucun echelleId (défaut A3) ────────────────────────────────');
        L('   évaluations concernées : ' + q4Evals + '   (niveaux : ' + q4Criteres + ')');
        L('   … dont RÉSOLUBLES sans ambiguïté (une seule échelle au magasin) : ' + q4Resoluble);
        L('   … dont MUETTES (plusieurs échelles, la conversion rend null)    : ' + (q4Evals - q4Resoluble));
        L('');
        L('── Hors questions, mais mesuré au passage ──────────────────────────');
        L('   echelleId nommé mais INTROUVABLE partout : ' + nEchelleIntrouvable);
        if (detailIntrouvables.size) {
            for (const [k, n] of [...detailIntrouvables].sort((a, b) => b[1] - a[1]).slice(0, 15)) L('      · ' + k + ' → ' + n);
        }
        L('   niveaux effectivement CONVERTIBLES aujourd\'hui : ' + nConvertibles + ' / ' + nCriteres);
        L('');

        // ── CE QUE ÇA DÉCIDE ────────────────────────────────────────────────
        L('==== CE QUE CETTE MESURE DÉCIDE (et ce qu\'elle ne décide pas) ====');
        L('');
        if (q2 === 0) {
            L('⮕ NIVEAU 0 — risque LATENT, pas actif. Aucune évaluation ne porte « 0 »,');
            L('  ce qui confirme au chiffre ce que tu disais le 26 août : « je n\'ai jamais');
            L('  attribué de zéro à un élève ». Retirer le 0 de ton échelle ne casserait');
            L('  donc RIEN chez toi — mais c\'est ta décision, pas celle de la sonde, et');
            L('  elle n\'est pas urgente puisque rien ne s\'appuie dessus.');
        } else {
            L('⮕ NIVEAU 0 — risque ACTIF : ' + q2 + ' niveau(x) « 0 » sont saisis dans tes');
            L('  données. NE RETIRE PAS le niveau 0 de ton échelle avant qu\'on ait regardé');
            L('  ensemble ce que ces évaluations-là deviennent. Le détail ci-dessus dit');
            L('  lesquelles.');
        }
        L('');
        if (q3Evals === 0) {
            L('⮕ A2 (échelles de pratique) — risque LATENT chez toi : aucune de tes');
            L('  évaluations ne désigne son échelle par « pratique-<id> ». Le correctif du');
            L('  lot 1 reste dû — il protège les autres utilisateurs et tes évaluations à');
            L('  venir — mais il ne répare aucun chiffre affiché aujourd\'hui.');
        } else {
            L('⮕ A2 (échelles de pratique) — risque ACTIF : ' + q3Evals + ' évaluation(s),');
            L('  ' + q3Criteres + ' niveau(x), ne se convertissent PAS. Ces élèves-là ont un profil');
            L('  muet — pas de défi, pattern « Stable », RàI calculé sur P seul. C\'est le');
            L('  correctif le plus rentable du lot 1.');
        }
        L('');
        const q4Muettes = q4Evals - q4Resoluble;
        if (q4Evals === 0) {
            L('⮕ A3 (aucun echelleId) — sans objet : toutes tes évaluations nomment leur');
            L('  échelle.');
        } else if (q4Muettes === 0) {
            L('⮕ A3 (aucun echelleId) — ' + q4Evals + ' évaluation(s) sans désignation, mais TOUTES');
            L('  résolubles : leur magasin ne contient qu\'une échelle, donc aucune ambiguïté.');
            L('  ⚠ Cet équilibre est FRAGILE : le jour où tu crées une deuxième échelle dans');
            L('  ce trimestre, ces ' + q4Evals + ' évaluations deviennent muettes d\'un coup, sans');
            L('  message. C\'est exactement ce que le message du lot 1 doit dire.');
        } else {
            L('⮕ A3 (aucun echelleId) — risque ACTIF : ' + q4Muettes + ' évaluation(s) sans');
            L('  désignation dans un magasin qui compte plusieurs échelles. La conversion');
            L('  rend null, et l\'écran n\'en dit rien aujourd\'hui.');
        }
        L('');
        if (q1 > 0) {
            L('⮕ Q1 — ' + q1 + ' niveau(x) portent un code ABSENT de leur échelle. Ce n\'est pas');
            L('  forcément une perte : une échelle renommée ou recréée (cf. la réparation');
            L('  du 5 août) suffit à produire ce constat. À regarder cas par cas, PAS à');
            L('  réparer en masse.');
        }
        L('');
        L('⚠ Rien n\'a été modifié. Copie ce rapport ENTIER avant toute décision.');
        console.log(out.join('\n'));

        return {
            evaluations: nEvals,
            niveaux: nCriteres,
            q1_codeAbsent: q1,
            q1_sansValeurPonctuelle: q1SansValeur,
            q2_niveauZero: q2,
            q3_echellePratique: { evaluations: q3Evals, niveaux: q3Criteres },
            q4_sansEchelleId: { evaluations: q4Evals, niveaux: q4Criteres, resolubles: q4Resoluble, muettes: q4Muettes },
            echelleIntrouvable: nEchelleIntrouvable,
            convertibles: nConvertibles
        };
    }

    window.diag542 = diag542;
    console.log('#542 lot 0 chargé — outil ' + VERSION_OUTIL + '. Tape :  await diag542()');
})();
