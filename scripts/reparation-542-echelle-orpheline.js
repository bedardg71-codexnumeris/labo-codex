/* ============================================================================
   RÉPARATION #542 — RENDRE À 338 ÉVALUATIONS L'ÉCHELLE QUI LES A PRODUITES
   ----------------------------------------------------------------------------
   DRY-RUN PAR DÉFAUT. Rien n'est écrit tant que tu n'as pas passé
   `{ executer: true, sauvegardeFaite: true }` — les deux, explicitement.

   ── CE QUE MESURE L'ORACLE, ET QUI FONDE CETTE RÉPARATION ───────────────────

   338 évaluations de H2026 désignent l'échelle `1767389426695`, dont plus aucune
   définition ne subsiste. Conséquence : 1706 niveaux sur 2983 (57 % des données)
   ne se convertissent pas, et le dépistage est aveugle sur ces élèves.

   L'oracle (`scripts/oracle-542-identifier-echelle-orpheline.js`) a établi :

     · plafond de l'outil ....................... 99,6 %  (279/280 notes témoins)
     · évaluations DISCRIMINANTES ............... 217 / 338
       (celles qui emploient `M` ou `0` — les seuls niveaux où les échelles
        candidates divergent ; les autres ne départagent rien)
     · … reproduites par la famille 0/40/65/75/100 .. 188
     · … reproduites par une AUTRE échelle .......... 0   ⮕ LE POINT DÉCISIF
     · codes de niveau inconnus sur les 338 ......... 0

   ⮕ Une seule échelle a circulé. Repointer ces évaluations vers une échelle aux
     valeurs `0=0 I=40 D=65 M=75 E=100` ne fausse le dépistage de personne.

   ── LE GESTE, ET POURQUOI CELUI-LÀ ──────────────────────────────────────────

   On RECRÉE l'échelle sous son identifiant d'origine, plutôt que de repointer
   les 338 évaluations :

     · une écriture au lieu de 338 ;
     · réversible en supprimant un objet ;
     · les évaluations gardent l'identifiant sous lequel elles ont réellement
       été produites — c'est la vérité historique, et on n'y touche pas.

   Le doublon ainsi créé (deux échelles aux mêmes valeurs dans H2026) est
   inoffensif pour le calcul : `obtenirTableConversionNiveaux` résout PAR
   IDENTIFIANT, et zéro évaluation est dépourvue d'`echelleId` — l'ambiguïté
   « plusieurs échelles » ne peut donc pas se déclencher. C'est un sujet de
   rangement, que #450 suit déjà.

   ── ⚠ CE QUE CETTE RÉPARATION NE FAIT PAS, ET NE DOIT PAS FAIRE ─────────────

   ELLE NE TOUCHE À AUCUNE NOTE. Les `noteFinale` stockées sont la trace de ce
   que tes élèves ont reçu ; elles ne se recalculent pas. La réparation rend la
   capacité de RELIRE les niveaux, rien d'autre.

   ELLE N'INVENTE AUCUNE VALEUR. L'échelle écrite est la COPIE d'une échelle qui
   existe dans tes données — et le script REVÉRIFIE lui-même, avant d'écrire,
   que cette copie reproduit tes notes. Il ne me croit pas sur parole : il
   refait la mesure. Si le taux s'effondre, il refuse d'écrire.

   ELLE NE RÉGLE PAS LES 55 NON REPRODUITES. Elles relèvent de deux causes
   distinctes, aucune n'étant l'échelle :
     · ~47 — le pourcentage algorithmique STOCKÉ n'est pas celui qui a servi
       (Français écrit stocké `algo 100` alors que la note exige ≈ 0) : famille
       du bug #350 ;
     · ~8 — la note stockée est impossible à produire depuis les niveaux
       sauvegardés (quatre critères tous à `D`=65 donnent 65 quelles que soient
       les pondérations ; la note stockée vaut 56,3). Désaccord note ↔ critères,
       vraisemblablement résidu des réparations d'août.
   Les deux sont versées au backlog. Aucune ne bloque ce geste-ci.

   ── USAGE ───────────────────────────────────────────────────────────────────

     1. coller CE FICHIER EN ENTIER dans la console, Entrée ;
     2. `await reparer542()`                       → DRY-RUN, n'écrit rien
     3. lire le plan, en entier ;
     4. FAIRE UNE SAUVEGARDE CODEX ;
     5. `await reparer542({ executer: true, sauvegardeFaite: true })`
   ========================================================================= */

(function () {
    'use strict';

    const CIBLE = '1767389426695';
    const TOLERANCE = 0.06;              // la note stockée est un `toFixed(1)`
    const PLAFOND_COMBINAISONS = 12;

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

    // Règle unique #525/#527, recopiée de `valeurNumeriqueDuNiveau`.
    function valeurDuNiveau(n) {
        if (!n) return null;
        const p = Number(n.valeurCalcul);
        if (n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(p)) return p;
        return null;
    }

    function estEchelle(o) {
        if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
        if (!Array.isArray(o.niveaux) || o.niveaux.length === 0) return false;
        return o.niveaux.some(function (n) { return n.code != null && valeurDuNiveau(n) !== null; });
    }

    function tableDe(niveaux) {
        const t = {};
        (niveaux || []).forEach(function (n) {
            if (!n || n.code == null) return;
            const v = valeurDuNiveau(n);
            if (v !== null) t[String(n.code).trim().toUpperCase()] = v;
        });
        return t;
    }

    function signature(niveaux) {
        return (niveaux || []).map(function (n) {
            const v = valeurDuNiveau(n);
            return String(n && n.code) + '=' + (v === null ? '∅' : v);
        }).join('  ');
    }

    /* ── LA REVÉRIFICATION, identique à celle de l'oracle ────────────────────
       Le mode algorithmique se décide critère PAR critère (`calculerNote`
       lit le `<select>` de chacun) : on énumère les combinaisons. ─────────── */
    function reproduit(ev, table, niveaux) {
        const stockee = Number(ev.noteFinale);
        if (ev.noteFinale == null || isNaN(stockee)) return null;

        const algo = ev.donneesAlgorithmiques || {};
        const fixes = [], variables = [];
        for (const c of (Array.isArray(ev.criteres) ? ev.criteres : [])) {
            if (!c) continue;
            const brut = c.niveauSelectionne;
            if (brut == null || String(brut).trim() === '') continue;
            const code = String(brut).trim().toUpperCase();
            const pond = (Number(c.ponderation) || 0) / 100;
            const vN = table[code];
            const dA = c.critereId != null ? algo[c.critereId] : undefined;
            const vA = (dA && dA.pourcentage !== undefined) ? Number(dA.pourcentage) : undefined;
            if (vA !== undefined && !isNaN(vA)) variables.push({ vA: vA, vN: vN, pond: pond });
            else if (vN !== undefined && !isNaN(vN)) fixes.push({ v: vN, pond: pond });
        }

        let baseNote = 0, basePond = 0;
        for (const f of fixes) { baseNote += f.v * f.pond; basePond += f.pond; }

        const k = variables.length;
        const enumerable = k <= PLAFOND_COMBINAISONS;
        const nb = enumerable ? (1 << k) : 2;
        for (let masque = 0; masque < nb; masque++) {
            let note = baseNote, pond = basePond;
            for (let i = 0; i < k; i++) {
                const v = variables[i];
                const algoIci = enumerable ? !!(masque & (1 << i)) : (masque === 1);
                if (algoIci) { note += v.vA * v.pond; pond += v.pond; }
                else if (v.vN !== undefined && !isNaN(v.vN)) { note += v.vN * v.pond; pond += v.pond; }
            }
            if (pond <= 0) continue;
            let pct = note / pond;
            if (ev.plafondNoteCiblee) {
                const pl = (niveaux || []).find(function (n) { return n && String(n.code) === String(ev.plafondNoteCiblee); });
                if (pl && pl.max != null && pct > Number(pl.max)) pct = Number(pl.max);
            }
            if (Math.abs(pct - stockee) <= TOLERANCE) return true;
        }
        return false;
    }

    // Combien de niveaux saisis le dépistage saura-t-il relire avec cette table ?
    function compterConvertibles(evals, table) {
        let n = 0;
        for (const ev of evals) {
            for (const c of (Array.isArray(ev.criteres) ? ev.criteres : [])) {
                if (!c || c.niveauSelectionne == null) continue;
                const code = String(c.niveauSelectionne).trim().toUpperCase();
                if (code && table[code] !== undefined) n++;
            }
        }
        return n;
    }

    async function reparer542(options) {
        options = options || {};
        const executer = options.executer === true;
        const sauvegardeFaite = options.sauvegardeFaite === true;

        const out = [];
        const L = (m) => out.push(m);
        L('==== RÉPARATION #542 · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien n\'est écrit)') + ' ====');
        L('');

        const cles = await toutesLesCles();

        // ── 1. Où vivent les évaluations orphelines ? ───────────────────────
        // ⚠ Le trimestre n'est PAS codé en dur : on le DÉDUIT de l'endroit où
        // les évaluations concernées se trouvent réellement.
        const magasinsOrphelins = new Map();   // clé évals → [évals]
        for (const c of cles) {
            if (!/(^|_)evaluationsSauvegardees$/.test(c)) continue;
            if (c.indexOf('demo') === 0) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            const concernees = liste.filter(function (e) {
                return e && !e.remplaceeParId && String(e.echelleId || '') === CIBLE;
            });
            if (concernees.length) magasinsOrphelins.set(c, concernees);
        }

        if (!magasinsOrphelins.size) {
            L('✅ Aucune évaluation ne désigne « ' + CIBLE +' ».');
            L('   Rien à réparer — peut-être est-ce déjà fait.');
            console.log(out.join('\n'));
            return { statut: 'rien-a-faire' };
        }

        let totalOrphelines = 0;
        for (const [c, evs] of magasinsOrphelins) {
            L('Orphelines : ' + evs.length + '   dans ' + c);
            totalOrphelines += evs.length;
        }
        // Le magasin d'échelles du MÊME trimestre que les évaluations.
        const cleEvals = [...magasinsOrphelins.keys()][0];
        const prefixe = cleEvals.indexOf('_') !== -1 ? cleEvals.split('_')[0] : null;
        const cleEchelles = prefixe ? prefixe + '_echellesTemplates' : 'echellesTemplates';
        L('Magasin d\'échelles visé : ' + cleEchelles);
        L('');

        if (magasinsOrphelins.size > 1) {
            L('⛔ Les orphelines sont réparties sur PLUSIEURS trimestres :');
            for (const c of magasinsOrphelins.keys()) L('     · ' + c);
            L('   Ce script écrit dans UN magasin. Il s\'arrête plutôt que de');
            L('   choisir à ta place — dis-le-moi, on adaptera.');
            console.log(out.join('\n'));
            return { statut: 'plusieurs-trimestres' };
        }

        // ── 2. L'identifiant est-il vraiment libre ? ────────────────────────
        const echellesCible = (await lire(cleEchelles)) || [];
        if (!Array.isArray(echellesCible)) {
            L('⛔ ' + cleEchelles + ' n\'est pas une liste. Arrêt.');
            console.log(out.join('\n'));
            return { statut: 'magasin-invalide' };
        }
        const dejaLa = echellesCible.find(function (e) {
            return e && (String(e.id) === CIBLE || String(e.idOriginal) === CIBLE);
        });
        if (dejaLa) {
            L('✅ L\'échelle « ' + CIBLE + ' » EXISTE DÉJÀ dans ' + cleEchelles + '.');
            L('   nom : ' + (dejaLa.nom || '(sans nom)'));
            L('   ' + signature(dejaLa.niveaux));
            L('   ⮕ Rien à faire. Ce script est idempotent : il ne réécrit jamais');
            L('     par-dessus une échelle existante.');
            console.log(out.join('\n'));
            return { statut: 'deja-repare' };
        }

        // ── 3. Choisir la SOURCE — et la vérifier soi-même ──────────────────
        const sources = [];
        function collecter(noeud, chemin, vus, prof, parent) {
            if (noeud == null || prof > 12 || typeof noeud !== 'object') return;
            if (vus.has(noeud)) return;
            vus.add(noeud);
            if (estEchelle(noeud)) {
                sources.push({
                    chemin: chemin, objet: noeud,
                    nom: noeud.nom || (parent && parent.nom) || '(sans nom)',
                    memeTrimestre: prefixe ? chemin.indexOf(prefixe) === 0 : false
                });
                return;
            }
            if (Array.isArray(noeud)) {
                for (let i = 0; i < noeud.length; i++) collecter(noeud[i], chemin + '[' + i + ']', vus, prof + 1, noeud);
                return;
            }
            for (const k in noeud) {
                if (!Object.prototype.hasOwnProperty.call(noeud, k)) continue;
                collecter(noeud[k], chemin + '.' + k, vus, prof + 1, noeud);
            }
        }
        for (const c of cles) {
            if (c.indexOf('demo') === 0) continue;
            const contenu = await lire(c);
            if (contenu != null) collecter(contenu, c, new WeakSet(), 0, null);
        }

        const orphelines = magasinsOrphelins.get(cleEvals);

        // ⚠ ON NE ME CROIT PAS SUR PAROLE : chaque source est ré-éprouvée ici,
        // maintenant, sur les évaluations réelles. Si aucune ne reproduit les
        // notes, le script refuse d'écrire.
        L('── Sources candidates, ré-éprouvées à l\'instant ──');
        const classees = [];
        for (const s of sources) {
            const table = tableDe(s.objet.niveaux);
            let ok = 0, vues = 0;
            for (const ev of orphelines) {
                const r = reproduit(ev, table, s.objet.niveaux);
                if (r === null) continue;
                vues++; if (r) ok++;
            }
            if (!vues) continue;
            classees.push({ s: s, taux: ok / vues, ok: ok, vues: vues });
        }
        classees.sort(function (a, b) {
            if (Math.abs(b.taux - a.taux) > 1e-9) return b.taux - a.taux;
            // À taux égal, on préfère une source du MÊME trimestre : c'est
            // celle dont les bornes min/max sont le plus probablement les
            // tiennes pour cette session-là.
            return (b.s.memeTrimestre ? 1 : 0) - (a.s.memeTrimestre ? 1 : 0);
        });
        for (const c of classees.slice(0, 6)) {
            L('   ' + ((c.taux * 100).toFixed(1) + ' %').padStart(7) + '  ' + c.s.nom
                + (c.s.memeTrimestre ? '   [même trimestre]' : '')
                + '   ' + c.s.chemin);
            L('            ' + signature(c.s.objet.niveaux));
        }
        L('');

        if (!classees.length || classees[0].taux < 0.5) {
            L('⛔ AUCUNE source ne reproduit tes notes (meilleur : '
                + (classees.length ? (classees[0].taux * 100).toFixed(1) + ' %' : 'n/a') + ').');
            L('   Le script REFUSE d\'écrire. Relance l\'oracle et envoie-moi le rapport.');
            console.log(out.join('\n'));
            return { statut: 'refus-verification' };
        }

        const retenue = classees[0];
        const meilleursTaux = classees.filter(function (c) { return Math.abs(c.taux - retenue.taux) < 1e-9; });

        // ── 4. L'objet qui serait écrit ─────────────────────────────────────
        // COPIE INTÉGRALE de la source (bornes, couleurs, descriptions
        // comprises), avec le seul identifiant changé. Aucune valeur inventée,
        // aucun champ inventé.
        const neuve = JSON.parse(JSON.stringify(retenue.s.objet));
        neuve.id = CIBLE;
        delete neuve.idOriginal;
        // ⚠ `parDefaut` N'EST PAS PROPAGÉ. Quatre sites choisissent une échelle
        // par `echelles.find(e => e.parDefaut) || echelles[0]`
        // (`graphiques-progression.js:381`, `portfolio.js:560`,
        // `tableau-bord-apercu.js:720` et `:1766`), dont le premier lit le
        // magasin même où l'on écrit. Copier un `parDefaut: true` y poserait
        // DEUX échelles par défaut. `find` rendrait encore la première, donc
        // rien ne casserait aujourd'hui — c'est exactement le genre de doublon
        // dormant que ce projet refuse de laisser derrière lui.
        // Cette échelle est un point d'ancrage historique, pas un défaut à
        // proposer : elle ne doit être choisie que par son identifiant.
        delete neuve.parDefaut;
        neuve.nom = (retenue.s.objet.nom || 'Échelle') + ' (restaurée #542)';
        neuve.restauree542 = {
            date: new Date().toISOString(),
            sourceChemin: retenue.s.chemin,
            sourceNom: retenue.s.objet.nom || null,
            tauxReproduction: Number((retenue.taux * 100).toFixed(1)),
            orphelinesConcernees: orphelines.length
        };

        L('── CE QUI SERAIT ÉCRIT ──');
        L('   magasin : ' + cleEchelles + '   (' + echellesCible.length + ' → ' + (echellesCible.length + 1) + ' échelles)');
        L('   id      : ' + neuve.id);
        L('   nom     : ' + neuve.nom);
        L('   copiée de : ' + retenue.s.chemin);
        L('   niveaux : ' + signature(neuve.niveaux));
        for (const n of (neuve.niveaux || [])) {
            L('        · ' + String(n.code).padEnd(3) + ' ' + String(n.nom || '').padEnd(22)
                + ' valeur ' + String(n.valeurCalcul).padStart(5)
                + '   plage ' + String(n.min) + '–' + String(n.max));
        }
        L('');
        // ⚠⚠ CORRIGÉ — LE TAUX DE REPRODUCTION N'EST PAS L'EFFET DE LA
        // RÉPARATION, et les confondre faisait dire au dry-run l'inverse de la
        // vérité : « 283 / 339 redeviennent convertibles » laissait croire que
        // 56 évaluations resteraient cassées.
        //   · CONVERTIBLE = le code du niveau se trouve dans l'échelle, donc le
        //     dépistage sait le lire. Aucun code inconnu n'existe sur ces
        //     évaluations : elles redeviennent TOUTES convertibles.
        //   · REPRODUITE = en plus, la note stockée se recalcule à l'identique.
        //     C'est une mesure de CONFIANCE dans l'identification, pas un effet.
        // Les 56 non reproduites relèvent de #543 (donnée algorithmique altérée,
        // ou désaccord note ↔ critères) ; leur dépistage, lui, redevient juste.
        const tableNeuve = tableDe(neuve.niveaux);
        const nivAvant = compterConvertibles(orphelines, {});
        const nivApres = compterConvertibles(orphelines, tableNeuve);
        L('   EFFET RÉEL — niveaux relisibles par le dépistage :');
        L('        avant : ' + nivAvant + '        après : ' + nivApres
            + '   (sur ' + orphelines.length + ' évaluations)');
        L('   CONFIANCE — notes stockées qui se recalculent à l\'identique : '
            + retenue.ok + ' / ' + retenue.vues + '  (' + (retenue.taux * 100).toFixed(1) + ' %)');
        L('        les ' + (retenue.vues - retenue.ok) + ' autres redeviennent convertibles elles aussi ;');
        L('        c\'est leur NOTE qui ne se recalcule pas — voir #543.');
        L('   ⚠ AUCUNE note n\'est touchée. AUCUNE évaluation n\'est modifiée.');
        if (meilleursTaux.length > 1) {
            L('   ℹ ' + meilleursTaux.length + ' sources reproduisent aussi bien (valeurs identiques).');
            L('     La retenue est celle du même trimestre quand il y en a une ;');
            L('     à valeurs identiques, le choix ne change aucun calcul.');
        }
        L('');

        // ── 5. Exécution, ou pas ────────────────────────────────────────────
        if (!executer) {
            L('==== DRY-RUN — RIEN N\'A ÉTÉ ÉCRIT ====');
            L('');
            L('Pour exécuter, dans l\'ordre :');
            L('  1. relis le plan ci-dessus EN ENTIER ;');
            L('  2. fais une SAUVEGARDE CODEX ;');
            L('  3. `await reparer542({ executer: true, sauvegardeFaite: true })`');
            L('');
            L('Le second drapeau n\'est pas une formalité : il n\'existe que pour');
            L('t\'obliger à répondre « oui, la sauvegarde est faite » consciemment.');
            console.log(out.join('\n'));
            return { statut: 'dry-run', taux: retenue.taux, orphelines: orphelines.length };
        }

        if (!sauvegardeFaite) {
            L('⛔ REFUS — `sauvegardeFaite: true` manquant.');
            L('   Fais la sauvegarde Codex, puis rappelle avec les DEUX drapeaux.');
            console.log(out.join('\n'));
            return { statut: 'refus-sauvegarde' };
        }

        const liste = echellesCible.slice();
        liste.push(neuve);
        try {
            if (typeof db.setSync === 'function') db.setSync(cleEchelles, liste);
            else await db.set(cleEchelles, liste);
        } catch (e) {
            L('⛔ ÉCHEC DE L\'ÉCRITURE : ' + (e && e.message ? e.message : e));
            L('   Rien n\'a été écrit. Ta sauvegarde reste valide.');
            console.log(out.join('\n'));
            return { statut: 'echec-ecriture' };
        }

        // ── 6. Relire, et VÉRIFIER que ce qu'on voulait est ce qui est là ───
        const relu = (await lire(cleEchelles)) || [];
        const posee = Array.isArray(relu) ? relu.find(function (e) { return e && String(e.id) === CIBLE; }) : null;
        L('==== EXÉCUTÉ ====');
        L('');
        if (!posee) {
            L('⛔ L\'échelle n\'est PAS relue après écriture. Quelque chose a échoué');
            L('   silencieusement — n\'utilise pas l\'application, envoie-moi ce rapport.');
            console.log(out.join('\n'));
            return { statut: 'ecriture-non-confirmee' };
        }
        L('✅ Échelle « ' + CIBLE + ' » posée et RELUE dans ' + cleEchelles);
        L('   ' + signature(posee.niveaux));
        L('   échelles dans le magasin : ' + relu.length);
        L('');
        L('   niveaux convertibles pour ces ' + orphelines.length + ' évaluations :');
        L('        avant : ' + nivAvant + '        après : ' + nivApres);
        L('');
        L('⚠ AUCUNE note n\'a été touchée, AUCUNE évaluation modifiée : une seule');
        L('  échelle a été ajoutée.');
        L('');
        L('⮕ À FAIRE MAINTENANT :');
        L('   1. RECHARGE la page (l\'échelle vit en mémoire côté calcul) ;');
        L('   2. relance la sonde du lot 0 — `await diag542()` — et vérifie que');
        L('      « niveaux convertibles » a bondi ;');
        L('   3. ouvre le profil d\'un élève de H2026 : l\'encadré « Dépistage');
        L('      incomplet » doit avoir DISPARU, et les critères porter des');
        L('      pourcentages.');
        L('   ⮕ Si l\'un des trois ne se vérifie pas, dis-le-moi AVANT de');
        L('     continuer à travailler dans l\'application.');
        console.log(out.join('\n'));
        return {
            statut: 'execute',
            echelle: CIBLE,
            magasin: cleEchelles,
            convertiblesAvant: nivAvant,
            convertiblesApres: nivApres
        };
    }

    window.reparer542 = reparer542;
    console.log('Réparation #542 chargée. DRY-RUN :  await reparer542()');
})();
