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
       `modeAlgo` : les critères algorithmiques ont été notés avec un pourcentage
       EXACT, pas avec la valeur du niveau — sauf si l'enseignant avait choisi un
       niveau à la main (jeton de reprise). La donnée sauvegardée ne dit PAS
       lequel des deux cas s'est produit : c'est une ambiguïté irréductible, pas
       une négligence. On essaie donc les deux lectures, et l'évaluation est dite
       reproduite si l'une des deux retombe sur la note stockée. Les évaluations
       concernées sont comptées à part : elles discriminent moins bien entre
       candidates, et le rapport le dit. ──────────────────────────────────── */
    function recalculer(evaluation, echelle, modeAlgo) {
        const table = echelle.table;
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres : [];
        const algo = evaluation.donneesAlgorithmiques || {};
        let noteTotal = 0, ponderationTotal = 0, utilises = 0;

        for (const c of criteres) {
            if (!c) continue;
            const niveau = c.niveauSelectionne;
            if (niveau == null || String(niveau).trim() === '') continue;
            const ponderation = (Number(c.ponderation) || 0) / 100;

            let valeur;
            const dAlgo = c.critereId != null ? algo[c.critereId] : undefined;
            if (modeAlgo && dAlgo && dAlgo.pourcentage !== undefined) {
                valeur = Number(dAlgo.pourcentage);
            } else {
                valeur = table[String(niveau).trim().toUpperCase()];
            }
            // ⚠ `undefined` = le niveau n'existe pas dans cette échelle. Le
            // critère sort du calcul, pondération comprise — jamais de zéro
            // silencieux (c'est la règle de `calculerNote`).
            if (valeur === undefined || valeur === null || isNaN(valeur)) continue;

            noteTotal += valeur * ponderation;
            ponderationTotal += ponderation;
            utilises++;
        }

        if (ponderationTotal <= 0) return null;
        let pourcentage = noteTotal / ponderationTotal;

        // Plafond de reprise ciblée : écrêtage au `max` du niveau plafond.
        if (evaluation.plafondNoteCiblee) {
            const plafond = (echelle.niveaux || []).find(function (n) {
                return n && String(n.code) === String(evaluation.plafondNoteCiblee);
            });
            if (plafond && plafond.max != null && pourcentage > Number(plafond.max)) {
                pourcentage = Number(plafond.max);
            }
        }
        return { pourcentage: pourcentage, criteresUtilises: utilises };
    }

    function eprouver(evaluations, echelle) {
        let reproduites = 0, ratees = 0, indecidables = 0, ambigues = 0;
        let ecartTotal = 0;
        const ratesExemples = [];

        for (const ev of evaluations) {
            const stockee = Number(ev.noteFinale);
            if (ev.noteFinale == null || isNaN(stockee)) { indecidables++; continue; }

            const aAlgo = !!(ev.donneesAlgorithmiques && Object.keys(ev.donneesAlgorithmiques).length);
            const essais = aAlgo ? [true, false] : [false];
            let meilleur = null;

            for (const modeAlgo of essais) {
                const r = recalculer(ev, echelle, modeAlgo);
                if (!r) continue;
                const ecart = Math.abs(r.pourcentage - stockee);
                if (meilleur === null || ecart < meilleur.ecart) meilleur = { ecart: ecart, r: r };
            }

            if (meilleur === null) { indecidables++; continue; }
            if (meilleur.ecart <= TOLERANCE) {
                reproduites++;
                if (aAlgo) ambigues++;
            } else {
                ratees++;
                ecartTotal += meilleur.ecart;
                if (ratesExemples.length < 4) {
                    ratesExemples.push((ev.productionNom || '(sans nom)')
                        + ' : stockée ' + stockee.toFixed(1)
                        + ' · recalculée ' + meilleur.r.pourcentage.toFixed(1));
                }
            }
        }

        const examinees = reproduites + ratees;
        return {
            reproduites: reproduites,
            ratees: ratees,
            indecidables: indecidables,
            ambigues: ambigues,
            taux: examinees > 0 ? (reproduites / examinees) : null,
            ecartMoyenRates: ratees > 0 ? (ecartTotal / ratees) : null,
            exemples: ratesExemples
        };
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

        let meilleurTemoin = null;
        for (const [id, evals] of temoinParId) {
            const ech = candidates.find(function (e) { return e.ids.indexOf(id) !== -1; });
            if (!ech) continue;
            const r = eprouver(evals, ech);
            L('   ' + id + '  (' + ech.nom + ', ' + evals.length + ' évals)');
            L('      reproduites : ' + r.reproduites + ' / ' + (r.reproduites + r.ratees)
                + (r.taux !== null ? '   (' + Math.round(r.taux * 100) + ' %)' : ''));
            if (r.ratees > 0 && r.exemples.length) {
                for (const x of r.exemples) L('        ✗ ' + x);
            }
            if (meilleurTemoin === null || (r.taux || 0) > meilleurTemoin) meilleurTemoin = (r.taux || 0);
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

        if (meilleurTemoin < 0.90) {
            L('⛔ LA FORMULE NE REPRODUIT PAS LES NOTES CONNUES (meilleur taux : '
                + Math.round(meilleurTemoin * 100) + ' %).');
            L('  Ce n\'est pas un problème de données : c\'est que cet outil ne calcule');
            L('  pas comme l\'application. Son verdict sur les orphelines n\'aurait');
            L('  aucune valeur — il ne le rendra donc pas.');
            L('  ⮕ Envoie-moi ce rapport : la formule est à corriger AVANT toute suite.');
            L('');
            L('⚠ Rien n\'a été modifié.');
            console.log(out.join('\n'));
            return { statut: 'formule-invalide', tauxTemoin: meilleurTemoin };
        }

        L('✅ La formule reproduit ' + Math.round(meilleurTemoin * 100) + ' % des notes connues.');
        L('   L\'oracle a fait ses preuves ; son verdict sur les orphelines a un sens.');
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
            L('   ' + (Math.round(x.r.taux * 100) + ' %').padStart(5) + '  '
                + x.echelle.nom + '   [' + x.echelle.chemin + ']');
            L('           ' + x.echelle.signature);
            L('           reproduites ' + x.r.reproduites + ' · ratées ' + x.r.ratees
                + (x.r.ambigues ? ' · dont ' + x.r.ambigues + ' à critère algorithmique (moins discriminantes)' : ''));
            if (x.echelle.ids.length) L('           ids voisins : ' + x.echelle.ids.join(' · '));
        }
        L('');

        // ══ VERDICT ═════════════════════════════════════════════════════════
        L('==== VERDICT ====');
        L('');
        const gagnantes = resultats.filter(function (x) { return x.r.taux >= 0.95; });

        if (gagnantes.length === 0) {
            L('⮕ AUCUNE candidate ne reproduit tes notes (meilleur taux : '
                + (resultats.length ? Math.round(resultats[0].r.taux * 100) + ' %' : 'n/a') + ').');
            L('  L\'échelle qui a produit ces évaluations n\'est donc PAS parmi celles');
            L('  qui subsistent — et cette conclusion vaut, puisque la formule a fait');
            L('  ses preuves sur le groupe témoin.');
            L('  ⮕ Reste la piste d\'une archive Codex antérieure au 5 août 2026.');
        } else if (gagnantes.length === 1) {
            const g = gagnantes[0];
            L('⮕ IDENTIFIÉE, et sans rien inventer :');
            L('     ' + g.echelle.nom + '   [' + g.echelle.chemin + ']');
            L('     ' + g.echelle.signature);
            L('     ' + Math.round(g.r.taux * 100) + ' % des ' + orphelines.length + ' orphelines reproduites.');
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
