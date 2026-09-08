/* ============================================================================
   #785 — LES PRÉSENCES DE DEUX INSTANCES : QU'EST-CE QUI VIT DE CHAQUE CÔTÉ ?
   ----------------------------------------------------------------------------
   Grégoire a ouvert Labo Codex à DEUX adresses cet automne — son fichier local
   (`file://`) et `https://app.codexnumeris.org` — et a saisi des présences dans
   les deux. Ce sont deux ORIGINES au sens du navigateur : localStorage et
   IndexedDB y sont cloisonnés, rien ne passe de l'une à l'autre. Deux jeux
   partiels existent donc, peut-être sur les mêmes dates, peut-être divergents.

   Adopter le web comme source unique (décision du 8 sept.) abandonne en silence
   ce qui n'existe QUE dans le local. Cette sonde dit ce que c'est, avant que la
   décision se prenne.

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
   1. Ouvre la PREMIÈRE instance, colle ce fichier dans la console. Copie la
      sortie.
   2. Ouvre la SECONDE instance, colle le MÊME fichier. Copie la sortie.
   3. Compare les deux « SIGNATURE » : elles se lisent ligne à ligne.

   ⚠ Les deux instances doivent être mesurées SÉPARÉMENT. C'est tout l'objet :
   une seule console ne voit qu'un seul coffre.

   ── COMMENT LIRE LA SIGNATURE ──────────────────────────────────────────────
   Une ligne par (trimestre · date · groupe-cours), au format :

       a2026 · 2026-09-03 · COURS…7356 · 28 él · 84 pér

   · même ligne des deux côtés  ⮕ la séance est identique, rien à décider
   · ligne d'UN SEUL côté       ⮕ elle n'existe que là : c'est ce qu'un
                                  abandon ferait disparaître
   · même date, comptes DIFFÉRENTS ⮕ divergence réelle, à trancher séance par
                                  séance (aucune fusion automatique : deux
                                  saisies partielles de la même séance ne se
                                  additionnent pas)

   `console.log` est le mode de sortie assumé ici, comme dans les autres
   `scripts/diagnostic-*.js` : la règle « zéro console.log » vise `js/`, le code
   livré, pas un outil de console collé à la main.
   ============================================================================ */
(function () {
    'use strict';

    window.sonde785 = function () {
        var out = [];
        var L = function (s) { out.push(s); };

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
            : 'ADRESSE WEB — la source unique décidée le 8 sept.'));
        L('VERSION    : ' + (window.VERSION_MAJEURE || '(inconnue)')
                          + ' · build ' + (window.BUILD_ID || '(inconnu)'));
        if (estLocal) {
            L('             ⚠ en file://, `version.json` n\'est jamais lu (#495) :');
            L('               ce numéro vient des valeurs de repli du script, il');
            L('               peut ne pas décrire ce que ce fichier contient.');
        }
        L('MESURÉE LE : ' + new Date().toISOString());
        L('');

        // ── 2. DE QUOI DISPOSE-T-ON ? ──────────────────────────────────────
        if (typeof db === 'undefined' || typeof db.keysSync !== 'function'
            || typeof db.getSync !== 'function') {
            L('⛔ `db` indisponible (page pas encore initialisée ?).');
            L('   Attends que l\'application soit chargée, puis recolle.');
            L('==== FIN SONDE #785 ====');
            console.log(out.join('\n'));
            return;
        }

        // Toutes les clés de présences, tous trimestres confondus. On ne se
        // limite PAS au trimestre actif : Grégoire ne sait pas où il a saisi,
        // c'est précisément la question.
        var clesPresences = db.keysSync()
            .filter(function (k) { return /_presences$/.test(k); })
            .sort();

        if (!clesPresences.length) {
            L('AUCUNE clé de présences dans cette instance.');
            L('⮕ Ce coffre ne porte aucune présence : rien à rapatrier d\'ici.');
            L('==== FIN SONDE #785 ====');
            console.log(out.join('\n'));
            return;
        }

        // ── 3. LE DÉTAIL, PAR TRIMESTRE ────────────────────────────────────
        var signature = [];
        var totalGeneral = 0;

        clesPresences.forEach(function (cleP) {
            var trimestre = cleP.replace(/_presences$/, '');
            var presences = db.getSync(cleP, []);
            if (!Array.isArray(presences)) {
                L('⚠ ' + cleP + ' : contenu inattendu (' + typeof presences + '), ignoré.');
                return;
            }

            // Regroupement par (date · coursId). Aucun DA n'est conservé : on
            // n'en garde que le COMPTE, dans un Set pour ne pas compter deux
            // fois un doublon éventuel.
            var seances = new Map();
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
                if (isFinite(n)) s.periodes += n;
                if (p.facultatif === true) s.facultatifs += 1;
            });

            var listeSeances = Array.from(seances.values()).sort(function (a, b) {
                return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0);
            });

            totalGeneral += presences.length;

            L('── ' + trimestre + ' ' + '─'.repeat(Math.max(0, 60 - trimestre.length)));
            L('   ' + presences.length + ' présence(s) · '
                    + listeSeances.length + ' séance(s) distincte(s)');
            if (listeSeances.length) {
                L('   de ' + listeSeances[0].date
                        + ' à ' + listeSeances[listeSeances.length - 1].date);
            }
            L('');

            listeSeances.forEach(function (s) {
                // Le coursId est un identifiant technique, pas une donnée d'élève.
                // Abrégé pour rester lisible tout en restant appariable.
                var idCourt = s.coursId.length > 12
                    ? s.coursId.slice(0, 5) + '…' + s.coursId.slice(-4)
                    : s.coursId;
                var ligne = trimestre + ' · ' + s.date + ' · ' + idCourt
                          + ' · ' + s.das.size + ' él'
                          + ' · ' + (Math.round(s.periodes * 100) / 100) + ' pér'
                          + (s.facultatifs ? ' · ' + s.facultatifs + ' fac' : '');
                signature.push(ligne);
                L('   ' + ligne);
            });
            L('');
        });

        // ── 4. LA SIGNATURE, À COMPARER ENTRE LES DEUX INSTANCES ───────────
        L('==== SIGNATURE — copie ce bloc des DEUX côtés et compare ====');
        L('# instance : ' + origine);
        L('# total    : ' + totalGeneral + ' présence(s) · ' + signature.length + ' séance(s)');
        signature.forEach(function (l) { L(l); });
        L('==== FIN SIGNATURE ====');
        L('');
        L('⛔ Rien n\'a été écrit. Cette sonde ne sait pas écrire.');
        L('⚠ Une séance présente des deux côtés avec des comptes DIFFÉRENTS ne se');
        L('  fusionne pas : ce sont deux saisies partielles de la même séance, et');
        L('  seule une personne qui était là peut dire laquelle fait foi.');
        L('==== FIN SONDE #785 ====');

        console.log(out.join('\n'));
    };

    // Lecture seule : rien ne justifie d'attendre une confirmation.
    window.sonde785();
})();
