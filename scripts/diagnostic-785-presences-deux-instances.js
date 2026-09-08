/* ============================================================================
   #785 — LES PRÉSENCES DE DEUX INSTANCES : QU'EST-CE QUI VIT DE CHAQUE CÔTÉ ?
   ----------------------------------------------------------------------------
   Grégoire a ouvert Labo Codex à DEUX adresses cet automne — son fichier local
   (`file://`) et `https://app.codexnumeris.org` — et a saisi des présences dans
   les deux. Ce sont deux ORIGINES au sens du navigateur : localStorage et
   IndexedDB y sont cloisonnés, rien ne passe de l'une à l'autre. Deux jeux
   partiels existaient donc, et deux séances d'automne (21 août, 1er septembre)
   ne vivaient que dans le local — mesuré le 8 septembre, ressaisies depuis.

   ⛔ ELLE N'ÉCRIT RIEN, NULLE PART, JAMAIS. Aucune fonction de réparation, aucun
   volet `executer`, aucun `db.set`. C'est délibéré et ça ne doit pas changer :
   écrire dans les données de quelqu'un remonte à lui (CLAUDE.md, « tarir n'est
   pas réparer »). Elle mesure, elle sépare, elle rapporte. La suite lui revient.

   ⛔ ELLE NE SORT AUCUNE DONNÉE PERSONNELLE. Pas un DA, pas un nom, pas une note
   de présence (texte libre de l'enseignant). Uniquement des COMPTES, des DATES
   et des SOMMES. Motif, frais : le 7 septembre, le plan de purge #781
   transportait lui-même les 19 DA qu'il devait effacer. Un rapport destiné à
   être copié-collé dans une conversation ne doit pas porter ce qu'il mesure.

   ── COMMENT S'EN SERVIR ────────────────────────────────────────────────────
   1. Ouvre la PREMIÈRE instance, colle ce fichier dans la console.
   2. Ouvre la SECONDE instance, colle le MÊME fichier.
   3. Compare les deux blocs « SIGNATURE », ligne à ligne.

   ⚠ Les deux instances se mesurent SÉPARÉMENT. C'est tout l'objet : une seule
   console ne voit qu'un seul coffre.

   ── CE QUE LA SONDE MONTRE, ET CE QU'ELLE RÉSUME ───────────────────────────
   Par défaut : le DÉTAIL séance par séance du trimestre ACTIF, un RÉSUMÉ pour
   les autres, et `demo` écarté (trimestre de démonstration, sans enjeu).

     sonde785()                        → défaut
     sonde785({ detail: ['h2026'] })   → déroule un trimestre de plus
     sonde785({ tout: true })          → tout en détail, `demo` compris
     copy(sonde785())                  → met la SIGNATURE dans le presse-papier

   ⚠ Un résumé concordant (mêmes totaux, même plage, même somme de périodes)
   rend une divergence très improbable — il ne la rend pas impossible. Pour une
   comparaison ligne à ligne, déroule le trimestre.

   ── COMMENT LIRE UNE LIGNE DE SIGNATURE ────────────────────────────────────
       a2026 · 2026-09-03 · COURS…7356 · 28 él · 84 pér

   · même ligne des deux côtés     ⮕ séance identique, rien à décider
   · ligne d'UN SEUL côté          ⮕ elle n'existe que là : c'est ce qu'un
                                     abandon ferait disparaître
   · même date, comptes différents ⮕ divergence réelle, à trancher séance par
                                     séance (aucune fusion automatique : deux
                                     saisies partielles d'une même séance ne
                                     s'additionnent pas)

   ── POURQUOI LA SORTIE EST DÉCOUPÉE ────────────────────────────────────────
   La première version rendait tout en UN SEUL `console.log`. Chrome tronque une
   chaîne trop longue : le 8 septembre, les deux sorties se sont coupées en plein
   `h2026` et le bloc SIGNATURE — celui qui sert à comparer — n'est jamais
   arrivé. Chaque bloc part donc dans son propre appel. Ne pas recoller.

   `console.log` est le mode de sortie assumé ici, comme dans les autres
   `scripts/diagnostic-*.js` : la règle « zéro console.log » vise `js/`, le code
   livré, pas un outil de console collé à la main.
   ============================================================================ */
(function () {
    'use strict';

    window.sonde785 = function (opts) {
        opts = opts || {};
        var tout = !!opts.tout;
        var detailDemande = opts.detail || [];

        // Un bloc = un console.log. Voir « POURQUOI LA SORTIE EST DÉCOUPÉE ».
        var bloc = [];
        var L = function (s) { bloc.push(s); };
        var EMETTRE = function () {
            if (bloc.length) console.log(bloc.join('\n'));
            bloc = [];
        };

        // ── 1. QUELLE INSTANCE SUIS-JE ? ───────────────────────────────────
        // C'est le discriminant que l'écran ne montre pas, et toute la raison
        // d'être de cette sonde. `location.origin` rend « null » en file:// sur
        // certains moteurs : on retombe alors sur le protocole et le chemin.
        var origine;
        try {
            origine = (location.origin && location.origin !== 'null')
                ? location.origin
                : (location.protocol + '//' + (location.pathname || ''));
        } catch (e) {
            origine = '(origine illisible)';
        }
        var estLocal = (location.protocol === 'file:');

        L('==== SONDE #785 · présences par instance · LECTURE SEULE ====');
        L('');
        L('INSTANCE   : ' + origine);
        L('NATURE     : ' + (estLocal
            ? 'FICHIER LOCAL (file://) — coffre séparé du web'
            : 'ADRESSE WEB'));
        L('VERSION    : ' + (window.VERSION_MAJEURE || '(inconnue)')
                          + ' · build ' + (window.BUILD_ID || '(inconnu)'));
        if (estLocal) {
            L('             ⚠ en file://, `version.json` n\'est jamais lu (#495) :');
            L('               ce numéro vient des valeurs de repli du script, il');
            L('               peut ne pas décrire ce que ce fichier contient.');
        } else {
            L('             ⚠ ce numéro est celui chargé au DÉMARRAGE de l\'onglet.');
            L('               Un onglet ouvert avant un déploiement affiche encore');
            L('               l\'ancien (mesuré le 8 sept.). Recharge en forçant.');
        }
        L('MESURÉE LE : ' + new Date().toISOString());
        EMETTRE();

        // ── 2. DE QUOI DISPOSE-T-ON ? ──────────────────────────────────────
        if (typeof db === 'undefined' || typeof db.keysSync !== 'function'
            || typeof db.getSync !== 'function') {
            L('⛔ `db` indisponible (page pas encore initialisée ?).');
            L('   Attends que l\'application soit chargée, puis recolle.');
            EMETTRE();
            return '';
        }

        var trimestreActif = (typeof window.trimestreActif === 'string')
            ? window.trimestreActif : '';

        // Toutes les clés de présences, tous trimestres confondus. On ne se
        // limite PAS au trimestre actif : la question est justement de savoir
        // où des présences ont été saisies.
        var clesPresences = db.keysSync()
            .filter(function (k) { return /_presences$/.test(k); })
            .sort();

        if (!clesPresences.length) {
            L('AUCUNE clé de présences dans cette instance.');
            L('⮕ Ce coffre ne porte aucune présence : rien à rapatrier d\'ici.');
            EMETTRE();
            return '';
        }

        // ── 3. LE DÉTAIL, TRIMESTRE PAR TRIMESTRE ──────────────────────────
        var signature = [];
        var ecartes = [];

        clesPresences.forEach(function (cleP) {
            var trimestre = cleP.replace(/_presences$/, '');

            // `demo` est un trimestre de démonstration : il n'a aucun enjeu de
            // rapatriement, et ses 32 séances noyaient le reste de la sortie.
            if (!tout && trimestre === 'demo') {
                ecartes.push(trimestre);
                return;
            }

            var presences = db.getSync(cleP, []);
            if (!Array.isArray(presences)) {
                L('⚠ ' + cleP + ' : contenu inattendu (' + typeof presences + '), ignoré.');
                EMETTRE();
                return;
            }

            // Regroupement par (date · coursId). Aucun DA n'est conservé : on
            // n'en garde que le COMPTE, dans un Set pour ne pas compter deux
            // fois un doublon éventuel.
            var seances = new Map();
            var periodesTotal = 0;
            presences.forEach(function (p) {
                if (!p || !p.date) return;
                var coursId = p.coursId || '(sans cours)';
                var cleS = p.date + '|' + coursId;
                var s = seances.get(cleS);
                if (!s) {
                    s = { date: p.date, coursId: coursId, das: new Set(), periodes: 0, facultatifs: 0 };
                    seances.set(cleS, s);
                }
                if (p.da) s.das.add(p.da);
                // `periodesPresentes` depuis Beta 95.1 ; `heures` sur les
                // enregistrements plus anciens, que rien ne réécrit.
                var n = parseFloat(p.periodesPresentes);
                if (!isFinite(n)) n = parseFloat(p.heures);
                if (isFinite(n)) { s.periodes += n; periodesTotal += n; }
                if (p.facultatif === true) s.facultatifs += 1;
            });

            var listeSeances = Array.from(seances.values()).sort(function (a, b) {
                return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0);
            });

            var arrondi = function (x) { return Math.round(x * 100) / 100; };
            var estActif = (trimestre === trimestreActif);
            var deroule = tout || estActif || detailDemande.indexOf(trimestre) !== -1;

            L('── ' + trimestre + (estActif ? ' (ACTIF)' : '')
                + ' ' + '─'.repeat(Math.max(0, 52 - trimestre.length)));
            L('   ' + presences.length + ' présence(s) · '
                    + listeSeances.length + ' séance(s) · '
                    + arrondi(periodesTotal) + ' période(s)');
            if (listeSeances.length) {
                L('   de ' + listeSeances[0].date
                        + ' à ' + listeSeances[listeSeances.length - 1].date);
            }

            if (deroule) {
                L('');
                listeSeances.forEach(function (s) {
                    // Le coursId est un identifiant technique, pas une donnée
                    // d'élève. Abrégé pour rester lisible ET appariable.
                    var idCourt = s.coursId.length > 12
                        ? s.coursId.slice(0, 5) + '…' + s.coursId.slice(-4)
                        : s.coursId;
                    var ligne = trimestre + ' · ' + s.date + ' · ' + idCourt
                              + ' · ' + s.das.size + ' él'
                              + ' · ' + arrondi(s.periodes) + ' pér'
                              + (s.facultatifs ? ' · ' + s.facultatifs + ' fac' : '');
                    signature.push(ligne);
                    L('   ' + ligne);
                });
            } else {
                // Empreinte agrégée : quatre nombres qui se comparent d'un coup
                // d'œil entre deux instances, sans dérouler 44 lignes.
                signature.push(trimestre + ' · RÉSUMÉ · ' + presences.length + ' prés · '
                             + listeSeances.length + ' séances · '
                             + arrondi(periodesTotal) + ' pér');
                L('   (résumé — `sonde785({ detail: [\'' + trimestre + '\'] })` pour dérouler)');
            }
            EMETTRE();
        });

        if (ecartes.length) {
            L('── écartés : ' + ecartes.join(', ')
                + ' (démonstration — `sonde785({ tout: true })` pour les inclure)');
            EMETTRE();
        }

        // ── 4. LA SIGNATURE, À COMPARER ENTRE LES DEUX INSTANCES ───────────
        // Bloc séparé, et le DERNIER : c'est celui qui compte, il ne doit jamais
        // se faire tronquer par ce qui le précède.
        var texteSignature = [];
        texteSignature.push('==== SIGNATURE — copie ce bloc des DEUX côtés et compare ====');
        texteSignature.push('# instance : ' + origine);
        texteSignature.push('# lignes   : ' + signature.length);
        signature.forEach(function (l) { texteSignature.push(l); });
        texteSignature.push('==== FIN SIGNATURE ====');
        console.log(texteSignature.join('\n'));

        L('');
        L('⛔ Rien n\'a été écrit. Cette sonde ne sait pas écrire.');
        L('⚠ Une séance présente des deux côtés avec des comptes DIFFÉRENTS ne se');
        L('  fusionne pas : ce sont deux saisies partielles de la même séance, et');
        L('  seule une personne qui était là peut dire laquelle fait foi.');
        L('▣ `copy(sonde785())` met la signature dans le presse-papier.');
        L('==== FIN SONDE #785 ====');
        EMETTRE();

        // Retour exploitable : `copy(sonde785())` colle la signature seule.
        return texteSignature.join('\n');
    };

    // Lecture seule : rien ne justifie d'attendre une confirmation.
    window.sonde785();
})();
