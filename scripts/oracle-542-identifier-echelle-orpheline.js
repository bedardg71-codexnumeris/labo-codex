/* ============================================================================
   ORACLE #542 — LAQUELLE DE TES ÉCHELLES A PRODUIT LES 339 ÉVALUATIONS
   ORPHELINES ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   ── CE QU'IL RÉPOND, ET COMMENT ─────────────────────────────────────────────

   339 évaluations de H2026 désignent l'échelle `1767389426695`, qui n'existe
   plus. Mais SIX échelles subsistent avec la signature exacte
   `0=0 I=40 D=65 M=75 E=100`, dont deux dans H2026. Laquelle est la bonne ?

   Ce n'est pas une question d'opinion, parce qu'un TÉMOIN existe : chaque
   évaluation a enregistré sa `noteFinale` au moment où elle a été produite. Si
   l'on recalcule cette note à partir des niveaux saisis et d'une échelle
   candidate, et qu'on retombe sur la note stockée, alors cette échelle-là est
   celle qui a servi. Ce n'est pas un jugement, c'est une vérification.

   La formule reproduite est celle de `calculerNote` (`evaluation-calcul.js`),
   au détail près :

       valeur(niveau)   = `valeurNumeriqueDuNiveau` — la valeur ponctuelle si
                          elle existe (`!= null`, `!== ''`, numérique), sinon
                          null : le critère sort du calcul, numérateur ET
                          dénominateur (règle unique #525/#527)
       note             = Σ(valeur × pondération/100) / Σ(pondération/100)
       plafond          = si `plafondNoteCiblee`, la note est écrêtée au `max`
                          du niveau plafond
       stockée          = `pourcentage.toFixed(1)` — d'où une tolérance de 0,06

   ── ⚠ POURQUOI IL Y A UN GROUPE TÉMOIN, ET POURQUOI IL COMMANDE TOUT ────────

   Trois sondes de suite, le 27 août au soir, ont rendu un verdict que leur
   mesure ne portait pas : le lot 0 a titré « risque latent » pendant que 57 %
   des données étaient inconvertibles ; `542bis` a conclu « perdu » sans avoir
   regardé les champs voisins ; `542ter` r1 a marqué ✅ dix-huit cartouches.

   Un oracle qui se trompe de la même façon serait pire que les trois : il
   servirait à ÉCRIRE dans les données de Grégoire.

   ⮕ D'où la discipline posée ici : avant de se prononcer sur les évaluations
     dont l'échelle est inconnue, cet outil se teste sur celles dont l'échelle
     est CONNUE ET PRÉSENTE. S'il ne sait pas reproduire des notes qu'il devrait
     savoir reproduire, sa formule est fausse, et **il refuse de conclure sur le
     reste**. Un outil qui n'a pas fait ses preuves n'a pas de verdict à rendre.

   ── r2 (27 août 2026) — CE QUE LE PREMIER PASSAGE A APPRIS ──────────────────

   Le passage r1 a rendu : témoin 100 % (279/280), puis CINQ candidates à 84 %
   (283/338) — toutes portant `0=0 I=40 D=65 M=75 E=100` — contre 28 % pour la
   seule candidate structurellement différente (`M=85`). Son verdict a pourtant
   annoncé « aucune candidate », à cause d'un seuil de 95 % que j'avais inventé.
   Un écart de 56 points entre la meilleure et la suivante ne se lit pas
   « aucune ». TROIS corrections en découlent :

     1. LE MODE ALGORITHMIQUE SE DÉCIDE PAR CRITÈRE, pas par évaluation. r1
        n'essayait que « tout algorithmique » ou « tout au niveau » ; l'appli
        tranche critère par critère. r2 énumère les combinaisons.

     2. LES SEUILS INVENTÉS SONT RETIRÉS (0,90 et 0,95). Le groupe témoin ne
        sert plus de test à passer : il MESURE le plafond de l'outil sur des
        évaluations dont l'échelle est certaine, et les candidates sont
        comparées à ce plafond. Aucun nombre arbitraire.

     3. LES ÉCHECS SONT VENTILÉS, pas comptés. Un échec dû à un code de niveau
        INCONNU dit qu'une autre échelle a servi ; un échec dû à un plafond de
        reprise ou à un critère algorithmique parle du calcul. Les confondre,
        c'était transformer du bruit en verdict.

   ⮕ Et la ligne « ratées 55 · dont 25 à critère algorithmique » était fausse à
     la lecture : le « dont » comptait parmi les RÉUSSITES. Corrigé.

   ── CE QU'IL NE FAIT PAS ────────────────────────────────────────────────────

   Il ne répare rien et ne propose aucune écriture. Identifier l'échelle est une
   chose ; décider quoi en faire — la recréer sous l'ancien identifiant, ou
   repointer les évaluations vers l'identifiant survivant — en est une autre,
   qui appartient à Grégoire et qui passera par un dry-run relu et une
   sauvegarde, comme #448 et #453.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await oracle542()`
        (ou `await oracle542('AUTRE_ID')` pour un autre identifiant orphelin)
   ========================================================================= */

(function () {
    'use strict';

    const CIBLE_PAR_DEFAUT = '1767389426695';
    const TOLERANCE = 0.06;   // la note stockée est un `toFixed(1)`

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

    /* ── La règle de valeur, recopiée de `valeurNumeriqueDuNiveau`
       (`echelles.js:3258`). Recopiée VOLONTAIREMENT plutôt qu'appelée : si un
       jour la règle de l'application change, l'oracle doit continuer de
       reproduire celle qui a produit les notes STOCKÉES, pas la nouvelle.
       ⮕ Le repli sur le milieu de plage, retiré par #527 le 26 août 2026, n'est
       PAS remis ici : toutes les échelles candidates portent une valeur
       ponctuelle sur chaque niveau, il n'a donc jamais pu s'appliquer à ces
       évaluations. ────────────────────────────────────────────────────────── */
    function valeurDuNiveau(niveau) {
        if (!niveau) return null;
        const ponctuelle = Number(niveau.valeurCalcul);
        if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(ponctuelle)) {
            return ponctuelle;
        }
        return null;
    }

    function estEchelle(o) {
        if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
        if (!Array.isArray(o.niveaux) || o.niveaux.length === 0) return false;
        return o.niveaux.some(function (n) { return valeurDuNiveau(n) !== null && n.code != null; });
    }

    function tableDe(echelle) {
        const t = {};
        echelle.niveaux.forEach(function (n) {
            if (!n || n.code == null) return;
            const v = valeurDuNiveau(n);
            if (v !== null) t[String(n.code).trim().toUpperCase()] = v;
        });
        return t;
    }

    function signature(o) {
        return o.niveaux.map(function (n) {
            const v = valeurDuNiveau(n);
            return String(n && n.code) + '=' + (v === null ? '∅' : v);
        }).join('  ');
    }

    function idsDuVoisinage(echelle, parent, grandParent) {
        const ids = new Set();
        [echelle, parent, grandParent].forEach(function (o) {
            if (!o || typeof o !== 'object') return;
            ['id', 'idOriginal', 'echelleId', 'idEchelle'].forEach(function (champ) {
                if (o[champ] != null && typeof o[champ] !== 'object') ids.add(String(o[champ]));
            });
        });
        return Array.from(ids);
    }

    function collecter(noeud, chemin, vus, sortie, parent, grandParent, prof) {
        if (noeud == null || prof > 12 || typeof noeud !== 'object') return;
        if (vus.has(noeud)) return;
        vus.add(noeud);

        if (estEchelle(noeud)) {
            sortie.push({
                chemin: chemin,
                nom: noeud.nom || (parent && parent.nom) || (grandParent && grandParent.nom) || '(sans nom)',
                signature: signature(noeud),
                ids: idsDuVoisinage(noeud, parent, grandParent),
                table: tableDe(noeud),
                niveaux: noeud.niveaux
            });
            return;   // les niveaux d'une échelle ne sont pas des échelles
        }
        if (Array.isArray(noeud)) {
            for (var i = 0; i < noeud.length; i++) collecter(noeud[i], chemin + '[' + i + ']', vus, sortie, noeud, parent, prof + 1);
            return;
        }
        for (var k in noeud) {
            if (!Object.prototype.hasOwnProperty.call(noeud, k)) continue;
            collecter(noeud[k], chemin + '.' + k, vus, sortie, noeud, parent, prof + 1);
        }
    }

    /* ── LE RECALCUL, calqué sur `calculerNote` ──────────────────────────────

       ⚠⚠ CORRIGÉ EN r2 (27 août 2026) — LA r1 DÉCIDAIT PAR ÉVALUATION, L'APPLI
       DÉCIDE PAR CRITÈRE.

       Un critère algorithmique a été noté avec un POURCENTAGE EXACT
       (`donneesAlgorithmiques[id].pourcentage`) plutôt qu'avec la valeur de son
       niveau — SAUF si l'enseignant avait choisi un niveau à la main (jeton de
       reprise ciblée). `calculerNote` tranche ce cas critère PAR critère, en
       lisant le `<select>` de chacun (`evaluation-calcul.js:592`).

       La r1 essayait deux lectures GLOBALES : « tout en algorithmique » ou
       « tout au niveau ». Une évaluation mêlant les deux — un critère
       algorithmique laissé au calcul et un autre repris à la main — échouait
       donc dans les deux essais, alors que l'échelle était la bonne. C'est la
       cause probable des 55 « ratées » du premier passage, et de l'unique raté
       du groupe témoin (76,6 contre 76,0).

       ⮕ r2 énumère les combinaisons : chaque critère algorithmique peut avoir
         été lu d'une façon ou de l'autre, indépendamment des autres. Si UNE des
         combinaisons retombe sur la note stockée, l'évaluation est reproduite.
         Au-delà de 12 critères algorithmiques (4096 combinaisons), l'outil ne
         tente que les deux lectures globales ET LE DIT — il ne conclut pas en
         silence sur ce qu'il n'a pas énuméré.
       ──────────────────────────────────────────────────────────────────────── */

    const PLAFOND_COMBINAISONS = 12;

    // Prépare les contributions d'une évaluation sous une échelle donnée.
    // `fixes` = critères dont la valeur ne dépend d'aucun choix ;
    // `variables` = critères algorithmiques, qui ont DEUX lectures possibles.
    function preparerContributions(evaluation, echelle) {
        const table = echelle.table;
        const algo = evaluation.donneesAlgorithmiques || {};
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const fixes = [];
        const variables = [];
        const codesInconnus = new Set();

        for (const c of criteres) {
            if (!c) continue;
            const brut = c.niveauSelectionne;
            if (brut == null || String(brut).trim() === '') continue;
            const code = String(brut).trim().toUpperCase();
            const ponderation = (Number(c.ponderation) || 0) / 100;

            // ⚠ `undefined` = ce code n'existe pas dans l'échelle candidate. Le
            // critère sort du calcul, pondération comprise — jamais de zéro
            // silencieux (c'est la règle de `calculerNote`). On NOTE le code :
            // un code inconnu est le signe qu'une AUTRE échelle a servi, et
            // c'est le diagnostic le plus utile qu'on puisse tirer d'un échec.
            const vNiveau = table[code];
            if (vNiveau === undefined) codesInconnus.add(code);

            const dAlgo = c.critereId != null ? algo[c.critereId] : undefined;
            const vAlgo = (dAlgo && dAlgo.pourcentage !== undefined) ? Number(dAlgo.pourcentage) : undefined;

            if (vAlgo !== undefined && !isNaN(vAlgo)) {
                variables.push({ vAlgo: vAlgo, vNiveau: vNiveau, ponderation: ponderation });
            } else if (vNiveau !== undefined && !isNaN(vNiveau)) {
                fixes.push({ valeur: vNiveau, ponderation: ponderation });
            }
        }
        return { fixes: fixes, variables: variables, codesInconnus: Array.from(codesInconnus) };
    }

    function appliquerPlafond(pourcentage, evaluation, echelle) {
        if (!evaluation.plafondNoteCiblee) return pourcentage;
        const plafond = (echelle.niveaux || []).find(function (n) {
            return n && String(n.code) === String(evaluation.plafondNoteCiblee);
        });
        if (plafond && plafond.max != null && pourcentage > Number(plafond.max)) {
            return Number(plafond.max);
        }
        return pourcentage;
    }

    // Rend le MEILLEUR écart atteignable, toutes lectures confondues.
    function meilleurEcart(evaluation, echelle, stockee) {
        const prep = preparerContributions(evaluation, echelle);
        let baseNote = 0, basePond = 0;
        for (const f of prep.fixes) { baseNote += f.valeur * f.ponderation; basePond += f.ponderation; }

        const k = prep.variables.length;
        const enumerable = k <= PLAFOND_COMBINAISONS;
        const nbCombinaisons = enumerable ? (1 << k) : 2;

        let best = null;
        for (let masque = 0; masque < nbCombinaisons; masque++) {
            let note = baseNote, pond = basePond;
            for (let i = 0; i < k; i++) {
                const v = prep.variables[i];
                // Bit à 1 = lecture algorithmique ; à 0 = valeur du niveau.
                // Hors énumération, `masque` vaut 0 puis 1 : les deux lectures
                // globales de la r1, appliquées à TOUS les variables.
                const prendreAlgo = enumerable ? !!(masque & (1 << i)) : (masque === 1);
                if (prendreAlgo) {
                    note += v.vAlgo * v.ponderation;
                    pond += v.ponderation;
                } else if (v.vNiveau !== undefined && !isNaN(v.vNiveau)) {
                    note += v.vNiveau * v.ponderation;
                    pond += v.ponderation;
                }
                // vNiveau inconnu et lecture « niveau » : le critère sort, comme
                // dans l'application.
            }
            if (pond <= 0) continue;
            const pourcentage = appliquerPlafond(note / pond, evaluation, echelle);
            const ecart = Math.abs(pourcentage - stockee);
            if (best === null || ecart < best.ecart) best = { ecart: ecart, pourcentage: pourcentage };
        }

        if (best === null) return null;
        best.nbAlgo = k;
        best.enumerable = enumerable;
        best.codesInconnus = prep.codesInconnus;
        best.nbCriteres = prep.fixes.length + k;
        return best;
    }

    function eprouver(evaluations, echelle) {
        let reproduites = 0, ratees = 0, indecidables = 0;
        let reproduitesAvecAlgo = 0, nonEnumerees = 0;
        const echecs = [];

        for (const ev of evaluations) {
            const stockee = Number(ev.noteFinale);
            if (ev.noteFinale == null || isNaN(stockee)) { indecidables++; continue; }

            const best = meilleurEcart(ev, echelle, stockee);
            if (best === null) { indecidables++; continue; }
            if (!best.enumerable) nonEnumerees++;

            if (best.ecart <= TOLERANCE) {
                reproduites++;
                if (best.nbAlgo > 0) reproduitesAvecAlgo++;
            } else {
                ratees++;
                echecs.push({
                    nom: ev.productionNom || '(sans nom)',
                    stockee: stockee,
                    recalculee: best.pourcentage,
                    ecart: best.ecart,
                    nbCriteres: best.nbCriteres,
                    nbAlgo: best.nbAlgo,
                    plafond: ev.plafondNoteCiblee || null,
                    codesInconnus: best.codesInconnus,
                    enumerable: best.enumerable
                });
            }
        }

        const examinees = reproduites + ratees;
        return {
            reproduites: reproduites,
            ratees: ratees,
            indecidables: indecidables,
            reproduitesAvecAlgo: reproduitesAvecAlgo,
            nonEnumerees: nonEnumerees,
            taux: examinees > 0 ? (reproduites / examinees) : null,
            echecs: echecs
        };
    }

    // Le détail critère par critère d'UNE évaluation sous UNE échelle. Sert aux
    // évaluations qu'aucune candidate ne reproduit : à ce stade, compter ne dit
    // plus rien, il faut regarder.
    function detailler(ev, echelle, L) {
        const table = echelle.table;
        const algo = ev.donneesAlgorithmiques || {};
        L('        ▸ ' + (ev.productionNom || '(sans nom)')
            + '   —   stockée ' + Number(ev.noteFinale).toFixed(1)
            + (ev.plafondNoteCiblee ? '   [plafond ' + ev.plafondNoteCiblee + ']' : ''));
        let note = 0, pond = 0, hors = 0;
        for (const c of (Array.isArray(ev.criteres) ? ev.criteres : [])) {
            if (!c) continue;
            const brut = c.niveauSelectionne;
            const code = (brut == null) ? '' : String(brut).trim().toUpperCase();
            const p = Number(c.ponderation) || 0;
            if (!code) {
                L('            · ' + (c.critereNom || '(sans nom)') + '  : aucun niveau saisi   pond ' + p + ' %');
                continue;
            }
            const v = table[code];
            const dA = (c.critereId != null) ? algo[c.critereId] : undefined;
            const a = (dA && dA.pourcentage !== undefined) ? Number(dA.pourcentage) : null;
            L('            · ' + (c.critereNom || '(sans nom)') + '  : ' + code
                + ' → ' + (v === undefined ? '(HORS ÉCHELLE)' : v)
                + '   pond ' + p + ' %'
                + (a !== null ? '   · algo ' + a : ''));
            if (v === undefined) { hors++; continue; }
            note += v * (p / 100);
            pond += p / 100;
        }
        if (pond > 0) {
            L('            ⇒ sans algorithme : ' + (note / pond).toFixed(1)
                + '   ·   Σ pondérations retenues : ' + (pond * 100).toFixed(0) + ' %'
                + (hors ? '   ·   ' + hors + ' critère(s) hors échelle' : ''));
        } else {
            L('            ⇒ rien de calculable');
        }
    }

    /* ── LE CROISEMENT (r3) ──────────────────────────────────────────────────
       La question que les étapes 1 et 2 ne tranchent pas : les évaluations que
       la MEILLEURE candidate ne reproduit pas sont-elles reproduites par une
       AUTRE ? Si oui, deux échelles ont circulé, et les traiter en bloc serait
       une faute. Si non, la cause est dans le calcul, pas dans l'échelle.

       ⚠ ET UNE SECONDE QUESTION, QUE JE N'AVAIS PAS POSÉE : combien de ces
       évaluations DISCRIMINENT réellement ? Les familles d'échelles en présence
       partagent `I=40`, `D=65`, `E=100` ; elles ne diffèrent que sur `M`
       (75 contre 85) et sur l'existence du niveau `0`. Une évaluation qui
       n'emploie ni `M` ni `0` est reproduite par les deux et ne prouve RIEN.
       Compter ces évaluations-là comme des preuves gonflerait la certitude sans
       l'augmenter — c'est le même défaut que les quatre verdicts précédents,
       pris à la racine cette fois. ─────────────────────────────────────────── */
    function croiser(orphelines, candidates) {
        const parEval = [];
        for (const ev of orphelines) {
            const stockee = Number(ev.noteFinale);
            if (ev.noteFinale == null || isNaN(stockee)) continue;
            const notes = [], reproduisent = [];
            for (let i = 0; i < candidates.length; i++) {
                const best = meilleurEcart(ev, candidates[i], stockee);
                notes.push(best ? best.pourcentage : null);
                if (best && best.ecart <= TOLERANCE) reproduisent.push(i);
            }
            // Discriminante = les candidates ne rendent PAS toutes la même note.
            const definies = notes.filter(function (n) { return n !== null; });
            let discriminante = false;
            for (const n of definies) {
                if (Math.abs(n - definies[0]) > TOLERANCE) { discriminante = true; break; }
            }
            parEval.push({ ev: ev, reproduisent: reproduisent, discriminante: discriminante });
        }
        return parEval;
    }

    // Ventilation des échecs : de quoi NOMMER la cause au lieu de la supposer.
    function ventiler(echecs, L) {
        if (!echecs.length) { L('      (aucun échec à ventiler)'); return; }

        const avecCodeInconnu = echecs.filter(function (e) { return e.codesInconnus.length > 0; });
        const avecPlafond = echecs.filter(function (e) { return e.plafond && !e.codesInconnus.length; });
        const avecAlgo = echecs.filter(function (e) { return e.nbAlgo > 0 && !e.plafond && !e.codesInconnus.length; });
        const nues = echecs.filter(function (e) {
            return !e.codesInconnus.length && !e.plafond && e.nbAlgo === 0;
        });
        const horsEnumeration = echecs.filter(function (e) { return !e.enumerable; });

        L('      ' + avecCodeInconnu.length + ' portent un CODE DE NIVEAU absent de cette échelle');
        if (avecCodeInconnu.length) {
            const codes = new Map();
            for (const e of avecCodeInconnu) for (const c of e.codesInconnus) codes.set(c, (codes.get(c) || 0) + 1);
            L('           codes vus : ' + [...codes].map(function (x) { return x[0] + ' ×' + x[1]; }).join(' · '));
            L('           ⮕ SEUL indice d\'une AUTRE échelle. Tout le reste est du bruit de calcul.');
        }
        L('      ' + avecPlafond.length + ' portent un plafond de reprise ciblée');
        L('      ' + avecAlgo.length + ' ont au moins un critère algorithmique');
        L('      ' + nues.length + ' n\'ont AUCUNE de ces particularités — inexpliqués');
        if (horsEnumeration.length) {
            L('      ⚠ ' + horsEnumeration.length + ' ont plus de ' + PLAFOND_COMBINAISONS
                + ' critères algorithmiques : combinaisons NON énumérées, verdict non concluant sur elles');
        }

        // Distribution des écarts : un nuage serré autour de zéro ne se lit pas
        // comme une poignée d'écarts massifs.
        const tries = echecs.map(function (e) { return e.ecart; }).sort(function (a, b) { return a - b; });
        const median = tries[Math.floor(tries.length / 2)];
        L('      écarts : médian ' + median.toFixed(2) + ' · max ' + tries[tries.length - 1].toFixed(2)
            + ' · sous 1 point : ' + tries.filter(function (x) { return x < 1; }).length + '/' + tries.length);
        for (const e of echecs.slice(0, 4)) {
            L('        ✗ ' + e.nom + ' : stockée ' + e.stockee.toFixed(1)
                + ' · recalculée ' + e.recalculee.toFixed(1)
                + '  (' + e.nbCriteres + ' critères, ' + e.nbAlgo + ' algo'
                + (e.plafond ? ', plafond ' + e.plafond : '') + ')');
        }
    }

    async function oracle542(cible) {
        cible = cible || CIBLE_PAR_DEFAUT;
        const out = [];
        const L = (m) => out.push(m);
        L('==== ORACLE #542 · quelle échelle a produit les évaluations orphelines ? ====');
        L('     cible : « ' + cible +' »   ·   LECTURE SEULE');
        L('');

        const cles = await toutesLesCles();

        // ── Inventaire des échelles candidates ──────────────────────────────
        const echelles = [];
        for (const c of cles) {
            const contenu = await lire(c);
            if (contenu == null) continue;
            collecter(contenu, c, new WeakSet(), echelles, null, null, 0);
        }
        // Les échelles du pack démo n'ont rien produit de réel.
        const candidates = echelles.filter(function (e) { return e.chemin.indexOf('demo') !== 0; });

        L('Échelles exploitables trouvées : ' + echelles.length
            + '  (dont ' + candidates.length + ' hors pack démo)');
        L('');

        // ── Les évaluations, réparties en TÉMOIN et ORPHELINES ──────────────
        // Une échelle « connue » = présente dans un magasin `*echellesTemplates`,
        // donc résoluble par le calcul tel qu'il est aujourd'hui.
        const idsConnus = new Set();
        for (const c of cles) {
            if (!/echellesTemplates$/.test(c)) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const e of liste) {
                if (!e) continue;
                if (e.id) idsConnus.add(String(e.id));
                if (e.idOriginal) idsConnus.add(String(e.idOriginal));
            }
        }

        const temoin = [];      // échelle connue → l'oracle DOIT savoir les reproduire
        const orphelines = [];  // échelle == cible → ce qu'on cherche à identifier
        const temoinParId = new Map();

        for (const c of cles) {
            if (!/(^|_)evaluationsSauvegardees$/.test(c)) continue;
            if (c.indexOf('demo') === 0) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const ev of liste) {
                if (!ev || ev.remplaceeParId) continue;
                if (!Array.isArray(ev.criteres) || ev.criteres.length === 0) continue;
                const id = String(ev.echelleId || '');
                if (id === cible) orphelines.push(ev);
                else if (id && idsConnus.has(id)) {
                    temoin.push(ev);
                    if (!temoinParId.has(id)) temoinParId.set(id, []);
                    temoinParId.get(id).push(ev);
                }
            }
        }

        L('Évaluations TÉMOIN (échelle connue et présente) : ' + temoin.length);
        L('Évaluations ORPHELINES (échelle « ' + cible + ' ») : ' + orphelines.length);
        L('');

        // ══ ÉTAPE 1 — L'ORACLE FAIT SES PREUVES, OU IL SE TAIT ══════════════
        L('══ ÉTAPE 1 · le groupe TÉMOIN — cet outil sait-il reproduire une note ? ══');
        L('');
        if (temoin.length === 0) {
            L('⚠ AUCUNE évaluation témoin : impossible d\'éprouver la formule.');
            L('  ⮕ L\'oracle REFUSE de se prononcer sur les orphelines. Un outil qui');
            L('    n\'a pas fait ses preuves n\'a pas de verdict à rendre.');
            L('');
            L('⚠ Rien n\'a été modifié.');
            console.log(out.join('\n'));
            return { statut: 'sans-temoin' };
        }

        // ⚠ r2 — LE TÉMOIN N'EST PLUS UN SEUIL, C'EST UN PLAFOND MESURÉ.
        // La r1 refusait de conclure sous 90 %, et déclarait « identifiée »
        // au-dessus de 95 %. Ces deux nombres, je les avais INVENTÉS : ce sont
        // exactement les valeurs métier arbitraires que ce projet s'interdit,
        // posées dans l'outil censé les traquer.
        // ⮕ Le témoin mesure ce que cet outil sait reproduire QUAND l'échelle
        //   est certaine. C'est son plafond. Une candidate qui atteint ce
        //   plafond a été identifiée ; une candidate qui reste dessous doit
        //   expliquer son écart. Aucun nombre inventé : la comparaison se fait
        //   à une référence mesurée sur les données de Grégoire.
        let temoinReproduites = 0, temoinExaminees = 0;
        const echecsTemoin = [];
        for (const [id, evals] of temoinParId) {
            const ech = candidates.find(function (e) { return e.ids.indexOf(id) !== -1; });
            if (!ech) continue;
            const r = eprouver(evals, ech);
            temoinReproduites += r.reproduites;
            temoinExaminees += (r.reproduites + r.ratees);
            for (const e of r.echecs) echecsTemoin.push(e);
            L('   ' + id + '  (' + ech.nom + ', ' + evals.length + ' évals)');
            L('      reproduites : ' + r.reproduites + ' / ' + (r.reproduites + r.ratees)
                + (r.taux !== null ? '   (' + (r.taux * 100).toFixed(1) + ' %)' : ''));
        }
        const meilleurTemoin = temoinExaminees > 0 ? (temoinReproduites / temoinExaminees) : null;
        if (echecsTemoin.length) {
            L('');
            L('   Ce que l\'outil ne sait PAS reproduire, échelle pourtant certaine :');
            ventiler(echecsTemoin, L);
        }
        L('');

        if (meilleurTemoin === null) {
            L('⚠ Aucune échelle témoin n\'a pu être appariée à ses évaluations.');
            L('  ⮕ L\'oracle REFUSE de se prononcer sur les orphelines.');
            L('');
            L('⚠ Rien n\'a été modifié.');
            console.log(out.join('\n'));
            return { statut: 'temoin-non-apparie' };
        }

        // Seule garde conservée, et elle n'est pas un réglage : si l'outil
        // reproduit MOINS DE LA MOITIÉ des notes dont l'échelle est certaine,
        // il ne calcule pas comme l'application, et rien de ce qu'il dirait
        // ensuite n'aurait de sens.
        if (meilleurTemoin < 0.5) {
            L('⛔ LA FORMULE NE REPRODUIT PAS LES NOTES CONNUES (témoin : '
                + (meilleurTemoin * 100).toFixed(1) + ' %).');
            L('  Ce n\'est pas un problème de données : c\'est que cet outil ne calcule');
            L('  pas comme l\'application. Son verdict sur les orphelines n\'aurait');
            L('  aucune valeur — il ne le rendra donc pas.');
            L('  ⮕ Envoie-moi ce rapport : la formule est à corriger AVANT toute suite.');
            L('');
            L('⚠ Rien n\'a été modifié.');
            console.log(out.join('\n'));
            return { statut: 'formule-invalide', tauxTemoin: meilleurTemoin };
        }

        L('✅ PLAFOND DE L\'OUTIL : ' + (meilleurTemoin * 100).toFixed(1) + ' % ('
            + temoinReproduites + '/' + temoinExaminees + '), mesuré sur des évaluations');
        L('   dont l\'échelle est CERTAINE. C\'est la référence à laquelle les');
        L('   candidates seront comparées — aucun seuil inventé.');
        L('');

        // ══ ÉTAPE 2 — LES ORPHELINES, CANDIDATE PAR CANDIDATE ═══════════════
        L('══ ÉTAPE 2 · les ' + orphelines.length + ' orphelines, éprouvées sur chaque candidate ══');
        L('');
        if (orphelines.length === 0) {
            L('   Aucune évaluation ne porte cet identifiant. Rien à identifier.');
            L('');
            L('⚠ Rien n\'a été modifié.');
            console.log(out.join('\n'));
            return { statut: 'sans-orphelines' };
        }

        const resultats = [];
        for (const ech of candidates) {
            const r = eprouver(orphelines, ech);
            if (r.taux === null) continue;
            resultats.push({ echelle: ech, r: r });
        }
        resultats.sort(function (a, b) { return b.r.taux - a.r.taux; });

        for (const x of resultats.slice(0, 8)) {
            L('   ' + ((x.r.taux * 100).toFixed(1) + ' %').padStart(7) + '  '
                + x.echelle.nom + '   [' + x.echelle.chemin + ']');
            L('           ' + x.echelle.signature);
            // ⚠ r2 — la r1 écrivait « ratées 55 · dont 25 à critère
            // algorithmique », et le « dont » se lisait comme portant sur les
            // RATÉES alors qu'il comptait parmi les RÉUSSITES. Chaque nombre
            // dit maintenant ce qu'il compte.
            L('           reproduites ' + x.r.reproduites + '  ·  ratées ' + x.r.ratees
                + '  ·  écart au plafond : '
                + (meilleurTemoin !== null ? ((meilleurTemoin - x.r.taux) * 100).toFixed(1) + ' pts' : 'n/a'));
            L('           (' + x.r.reproduitesAvecAlgo + ' des RÉUSSITES portent un critère algorithmique)');
            if (x.echelle.ids.length) L('           ids voisins : ' + x.echelle.ids.join(' · '));
        }
        L('');

        // Ventilation des échecs de la MEILLEURE candidate : c'est là que se
        // décide s'il reste une autre échelle en circulation, ou seulement du
        // bruit de calcul.
        if (resultats.length) {
            L('   ── ce que la meilleure candidate ne reproduit pas ──');
            ventiler(resultats[0].r.echecs, L);
            L('');
        }

        // ══ ÉTAPE 3 · LE CROISEMENT ═════════════════════════════════════════
        L('══ ÉTAPE 3 · le croisement — une SECONDE échelle a-t-elle circulé ? ══');
        L('');

        const meilleureIdx = candidates.indexOf(resultats.length ? resultats[0].echelle : null);
        const croisement = croiser(orphelines, candidates);

        const parBest = croisement.filter(function (x) { return x.reproduisent.indexOf(meilleureIdx) !== -1; });
        const parAutreSeulement = croisement.filter(function (x) {
            return x.reproduisent.length > 0 && x.reproduisent.indexOf(meilleureIdx) === -1;
        });
        const parPersonne = croisement.filter(function (x) { return x.reproduisent.length === 0; });

        L('   reproduites par la meilleure candidate ............ ' + parBest.length);
        L('   reproduites par une AUTRE candidate SEULEMENT ..... ' + parAutreSeulement.length
            + (parAutreSeulement.length ? '   ⚠ le cas qui changerait tout' : '   ← aucune seconde échelle'));
        L('   reproduites par AUCUNE candidate .................. ' + parPersonne.length);
        L('');

        if (parAutreSeulement.length) {
            const parQui = new Map();
            for (const x of parAutreSeulement) {
                for (const i of x.reproduisent) {
                    if (!parQui.has(i)) parQui.set(i, 0);
                    parQui.set(i, parQui.get(i) + 1);
                }
            }
            L('   ⚠ CES ÉVALUATIONS SONT REPRODUITES PAR :');
            for (const [i, n] of [...parQui].sort(function (a, b) { return b[1] - a[1]; })) {
                L('        ' + candidates[i].nom + '   [' + candidates[i].chemin + ']  → ' + n);
                L('             ' + candidates[i].signature);
            }
            L('');
        }

        // ⚠ La force de la preuve, mesurée plutôt qu'affirmée.
        const discriminantes = croisement.filter(function (x) { return x.discriminante; });
        const preuvesReelles = parBest.filter(function (x) { return x.discriminante; });
        L('   ── ce que ces reproductions PROUVENT vraiment ──');
        L('      évaluations DISCRIMINANTES (les candidates y divergent) : '
            + discriminantes.length + ' / ' + croisement.length);
        L('      … dont reproduites par la meilleure : ' + preuvesReelles.length);
        L('      Les autres emploient des niveaux sur lesquels les candidates');
        L('      s\'accordent (I=40, D=65, E=100) : elles ne départagent rien.');
        L('');

        if (parPersonne.length) {
            L('   ── les évaluations qu\'AUCUNE candidate ne reproduit ──');
            L('      (détail critère par critère, sous la meilleure candidate)');
            const aDetailler = parPersonne.slice(0, 6);
            for (const x of aDetailler) detailler(x.ev, resultats[0].echelle, L);
            if (parPersonne.length > aDetailler.length) {
                L('        … et ' + (parPersonne.length - aDetailler.length) + ' autre(s) non détaillée(s)');
            }
            L('');
        }

        // ══ VERDICT ═════════════════════════════════════════════════════════
        L('==== VERDICT ====');
        L('');
        // ⚠ r2 — plus de seuil inventé. Une candidate est retenue quand son
        // taux ATTEINT LE PLAFOND MESURÉ sur le groupe témoin : l'outil ne peut
        // pas exiger d'une échelle inconnue mieux qu'il ne fait sur une échelle
        // certaine. La marge est celle du témoin lui-même, pas un réglage.
        const margeTemoin = meilleurTemoin !== null ? (1 - meilleurTemoin) : 0;
        const gagnantes = resultats.filter(function (x) {
            return meilleurTemoin !== null && x.r.taux >= (meilleurTemoin - margeTemoin - 1e-9);
        });

        if (gagnantes.length === 0) {
            const meilleur = resultats.length ? resultats[0] : null;
            L('⮕ Aucune candidate n\'atteint le plafond de l\'outil : '
                + (meilleur ? (meilleur.r.taux * 100).toFixed(1) + ' %' : 'n/a')
                + ' contre ' + (meilleurTemoin * 100).toFixed(1) + ' %.');
            L('');
            // ⮕ C'EST LE CROISEMENT QUI TRANCHE, PAS LE TAUX. Un taux sous le
            // plafond dit qu'il reste des évaluations inexpliquées ; il ne dit
            // pas POURQUOI. Les trois cas ci-dessous ne se réparent pas pareil,
            // et c'est l'étape 3 qui les sépare.
            if (parAutreSeulement.length > 0) {
                L('  ⛔ DEUX ÉCHELLES ONT CIRCULÉ. ' + parAutreSeulement.length + ' évaluation(s)');
                L('     sont reproduites par une candidate DIFFÉRENTE de la meilleure.');
                L('     ⮕ NE LES TRAITE PAS EN BLOC. Une réparation qui repointerait les');
                L('       ' + orphelines.length + ' vers une seule échelle fausserait le dépistage de');
                L('       celles-là. Le tableau de l\'étape 3 dit lesquelles, et vers quoi.');
            } else if (parPersonne.length > 0) {
                L('  ✅ UNE SEULE ÉCHELLE, et c\'est le résultat qui commandait la réparation.');
                L('     Aucune des ' + orphelines.length + ' évaluations n\'est reproduite par une autre');
                L('     candidate que la meilleure. Il n\'y a pas de seconde échelle en');
                L('     circulation — les ' + parPersonne.length + ' non reproduites ne le sont par PERSONNE,');
                L('     ce qui parle du CALCUL (cf. #350, le recalcul algorithmique à');
                L('     l\'ouverture) et non de l\'échelle.');
                L('     ⮕ Le détail critère par critère ci-dessus est là pour le vérifier');
                L('       plutôt que le supposer : un « Σ pondérations » qui ne fait pas');
                L('       100 %, ou un critère hors échelle, se voit à l\'œil.');
            }
        } else if (gagnantes.length === 1) {
            const g = gagnantes[0];
            L('⮕ IDENTIFIÉE, et sans rien inventer :');
            L('     ' + g.echelle.nom + '   [' + g.echelle.chemin + ']');
            L('     ' + g.echelle.signature);
            L('     ' + (g.r.taux * 100).toFixed(1) + ' % des ' + orphelines.length
                + ' orphelines reproduites (plafond de l\'outil : ' + (meilleurTemoin * 100).toFixed(1) + ' %).');
            L('  Cette échelle-là a produit tes notes : elles retombent dessus au dixième.');
        } else {
            L('⮕ ' + gagnantes.length + ' candidates reproduisent tes notes aussi bien :');
            for (const g of gagnantes) L('     · ' + g.echelle.nom + '   [' + g.echelle.chemin + ']');
            L('  C\'est ATTENDU si elles portent les mêmes valeurs : des échelles');
            L('  identiques produisent des notes identiques. L\'oracle ne peut pas les');
            L('  départager, et il ne le prétend pas — mais il n\'en a pas besoin :');
            L('  n\'importe laquelle rendrait les mêmes notes. Le choix devient un choix');
            L('  de RANGEMENT (laquelle garder, sous quel nom), pas de calcul.');
        }
        L('');
        L('⚠ AUCUNE RÉPARATION N\'EST PROPOSÉE ICI, et aucune ne doit être faite à la');
        L('  main. Envoie-moi ce rapport : l\'outil de réparation sera écrit, relu en');
        L('  dry-run et précédé d\'une sauvegarde Codex, comme pour #448 et #453.');
        L('');
        L('⚠ Rien n\'a été modifié.');
        console.log(out.join('\n'));

        return {
            statut: 'conclu',
            tauxTemoin: meilleurTemoin,
            orphelines: orphelines.length,
            classement: resultats.slice(0, 8).map(function (x) {
                return { nom: x.echelle.nom, chemin: x.echelle.chemin, taux: x.r.taux };
            })
        };
    }

    window.oracle542 = oracle542;
    console.log('Oracle #542 chargé. Tape :  await oracle542()');
})();
