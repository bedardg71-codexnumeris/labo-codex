/* =================================================================
   LE PARCOURS « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS » (quatrième parcours, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md.

   Le cycle pour lequel l'application existe : recevoir les productions (Évaluation › Préparer), les
   vérifier avant l'import, les annoter (les tampons d'abord), les évaluer, verrouiller la rétroaction,
   puis la rendre en PDF (« Exporter pour Léa ») et la remettre. Deux voies : avec des fichiers (neuf
   étapes) ; sans fichier (« Rien à importer », à la bulle 1 : les étapes 6 à 9, comptées « n sur 4 »).
   Il ne démarre jamais de lui-même.

   ⚠ Les textes sont ceux que Grégoire a validés le 8 nov. (8 h 49 à 9 h 15, revus de 14 h 24 à 14 h 30),
   avec les corrections du 9 nov. (10 h 01 à 10 h 04 : étapes 5 et 7), posés mot pour mot :
   tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js les confronte à la consigne.

   · Une étape avance sur l'état atteint : des fichiers dans la file, un fichier neuf en stock, la page
     d'annotation ouverte, « Enregistrer » touché dans « Rétroactions — Observations », le mode Évaluer,
     chaque critère avec son niveau ou ses points, une évaluation neuve verrouillée, l'export Léa fini.
   · Le parcours retient sa voie et ce qui existait à « Commencer » (`parcoursRecevoir`, une préférence :
     des identifiants, rien des données de la personne), pour « Reprendre » comme pour « Refaire ».
   · La condition d'entrée (question 7, Cowork, 9 nov.) : une production du groupe-cours actif qui nomme sa
     grille, son échelle et sa cartouche. Il se joue sur les vraies données : la démo ouverte se referme.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'recevoir';
    var CLE_CTX = 'parcoursRecevoir';
    var M = function () { return window.ParcoursMoteur; };

    // Texte validé par Grégoire (8 nov., 14 h 30) : la phrase du panneau sans production prête.
    var REFUS = "Commence par « Évaluer une première production » : il te faut décrire ta production, avec sa grille, pour recevoir celles de tes étudiant·es.";

    // ---------- Utilitaires (ceux des parcours précédents ; le moteur ne les offre pas) ----------

    function attendre(condition, delai) {
        var restants = Math.ceil((delai || 2000) / 50);
        return new Promise(function (ok) {
            (function tour() {
                var v = false;
                try { v = !!condition(); } catch (e) { v = false; }
                if (v || restants-- <= 0) { ok(v); return; }
                setTimeout(tour, 50);
            })();
        });
    }

    function el(id) { return document.getElementById(id); }
    function vis(e) { return !!(e && M().visible(e)); }
    function qs(sel) { return document.querySelector(sel); }
    function sousSectionVisible(id) { return vis(el(id)); }

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    function enDemo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }

    function poserVoile(nom) {
        var v = el('parcours-voile');
        var cls = 'parcours-voile parcours-voile--' + nom;
        if (v && v.getAttribute('class') !== cls) v.setAttribute('class', cls);
    }

    /** Une fenêtre (9999) au-dessus du voile : la bulle et le contour passent au-dessus d'elle (règle du parcours 9). */
    function surModale(oui) {
        document.body.classList.toggle('parcours-sur-modale', !!oui && window.innerWidth >= 700);
    }

    // ---------- Ce que le parcours retient (`parcoursRecevoir`) ----------

    function lireCtx() {
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? v : {};
    }

    function majCtx(maj) {
        var ctx = Object.assign({}, lireCtx(), maj);
        if (typeof definirPreference === 'function') definirPreference(CLE_CTX, ctx);
        return ctx;
    }

    // ---------- Les données, lues ----------

    function lireMode(nom) {
        if (typeof obtenirDonneesSelonMode === 'function') return obtenirDonneesSelonMode(nom) || [];
        return [];
    }

    function fichiersDuGroupe() {
        var s = window.travauxStockage;
        return s && typeof s.obtenirFichiersGroupeActif === 'function' ? (s.obtenirFichiersGroupeActif() || []) : [];
    }

    function evaluationsVerrouillees() {
        return lireMode('evaluationsSauvegardees').filter(function (e) { return e && e.id && e.verrouillee === true && !e.remplaceeParId; });
    }

    function ids(liste) { return liste.map(function (x) { return x.id; }); }

    /** Une production prête : elle nomme sa grille, son échelle et sa cartouche (question 7, 9 nov.). */
    function productionPrete(p) { return !!(p && p.id && p.grilleId && p.echelleId && p.cartoucheId); }

    function condition() {
        if (enDemo()) return null;   // lue sur les vraies données, au lancement, une fois la démo refermée
        if (typeof contexteActifEstService === 'function' && contexteActifEstService()) return REFUS;
        var gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        if (!gc || !gc.id) return REFUS;
        return lireMode('productions').some(productionPrete) ? null : REFUS;
    }

    // ---------- La file, l'import, la page d'annotation ----------

    function fileDAttente() {
        var t = window.travauxImport;
        return t && typeof t.obtenirFileDAttente === 'function' ? (t.obtenirFileDAttente() || []) : [];
    }

    function fichierNeuf() {
        var avant = lireCtx().fichiersAvant || [];
        var f = fichiersDuGroupe().find(function (x) { return x && x.id && avant.indexOf(x.id) === -1; });
        if (f && !lireCtx().productionId) majCtx({ productionId: f.productionId });
        return f || null;
    }

    function fichierOuvert() {
        var v = window.travauxVisionneuse;
        var f = v && typeof v.getFichierActuel === 'function' ? v.getFichierActuel() : null;
        return f && f.id ? f : null;
    }

    function mode() {
        return window.travauxUI && typeof window.travauxUI.getModeCourant === 'function' ? window.travauxUI.getModeCourant() : null;
    }

    function annotationOuverte() { return sousSectionVisible('evaluations-annoter') && !!fichierOuvert(); }

    function paletteTampons() { return el('travaux-palette-tampons'); }
    function engrenageTampons() { var p = paletteTampons(); return p ? p.querySelector('[title="Personnaliser"]') : null; }
    function fenetreTampons() { return el('modal-retro-observations'); }

    // « Enregistrer » touché dans « Rétroactions — Observations » : noté au toucher (la fenêtre se ferme ensuite).
    var tamponsEnregistres = false;
    document.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t && t.closest && t.closest('#modal-retro-observations [data-action="travauxOutils.enregistrerRetroObservations"]')) tamponsEnregistres = true;
        if (t && t.closest && t.closest('[data-action="travauxUI.lancerExportLea"]')) exportTouche = true;
    }, true);

    // ---------- L'évaluation ----------

    function ecranEvaluationVisible() { return vis(el('evaluations-contenu-evaluation')); }

    function champsDesCriteres() {
        return [].slice.call(document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]'));
    }

    /** L'évaluation ouverte, telle qu'elle vit à l'écran (le pivot de evaluation.js), ou null. */
    function evaluationVivante() {
        if (typeof window.etatVivantEvaluationEnCours === 'function') return window.etatVivantEvaluationEnCours() || null;
        return window.evaluationEnCours || null;
    }

    /**
     * Chaque critère de la grille de l'évaluation ouverte a son niveau ou ses points. Lu dans l'évaluation, pas dans les
     * menus : au passage en mode Évaluer, les menus d'une autre copie restent un instant à l'écran (mesuré : l'étape 6
     * avançait sans aucun niveau choisi). Avec un fichier, l'évaluation doit être celle du fichier ouvert.
     */
    function chaqueCritereAttribue() {
        var ec = evaluationVivante();
        if (!ec || !ec.grilleId || !ec.etudiantDA) return false;
        var f = fichierOuvert();
        if (voie() === 'fichiers' && (!f || f.etudiantDA !== ec.etudiantDA || f.productionId !== ec.productionId)) return false;
        var g = (typeof db !== 'undefined' && typeof cle === 'function' ? (db.getSync(cle('grillesTemplates'), []) || []) : [])
            .find(function (x) { return x && x.id === ec.grilleId; });
        var criteres = g && Array.isArray(g.criteres) ? g.criteres : [];
        var niveaux = ec.criteres || {}, points = ec.pointsAnalytiques || {};
        var champs = champsDesCriteres().filter(vis);
        return criteres.length > 0 && champs.length > 0
            && champs.every(function (c) { return String(c.value || '').trim() !== ''; })
            && criteres.every(function (c) { return !!niveaux[c.id] || (typeof points[c.id] === 'number' && !isNaN(points[c.id])); });
    }

    /**
     * Vrai quand `condition` l'est trois passages de suite de la sonde (environ 360 ms). Au passage en mode Évaluer,
     * l'écran et l'évaluation gardent un instant les niveaux de la copie précédente (mesuré sous Chromium : l'étape 6
     * avançait sans aucun niveau choisi) ; ils ne tiennent pas trois passages.
     */
    function tenu(condition) {
        var suite = 0;
        return function () {
            suite = condition() ? suite + 1 : 0;
            return suite >= 3;
        };
    }

    function critereAAttribuer() {
        return champsDesCriteres().find(function (c) { return vis(c) && String(c.value || '').trim() === ''; }) || null;
    }

    function verrouNeuf() {
        var avant = lireCtx().verrousAvant || [];
        return evaluationsVerrouillees().some(function (e) { return avant.indexOf(e.id) === -1; });
    }

    function boutonVerrou() { return el('btnVerrouillerEvaluation'); }

    /** Le menu « Actions… » d'une ligne de la Liste qui offre ce geste (`evaluer`, `annoter`). */
    function menuActions(geste) {
        var menus = document.querySelectorAll('#evaluations-liste select.eval-actions-select');
        for (var k = 0; k < menus.length; k++) {
            if (vis(menus[k]) && menus[k].querySelector('option[value^="' + geste + '|"]')) return menus[k];
        }
        return null;
    }

    function rangeeDe(s) { return s ? (s.closest('tr') || s.parentElement) : null; }

    // ---------- L'export ----------

    var exportTouche = false;
    function exportFini() {
        var t = el('travaux-texte-progression-lea');
        var m = t ? String(t.textContent || '').match(/^(\d+)\/(\d+) fichiers traités/) : null;
        return !!(exportTouche && m && m[1] === m[2]);
    }
    function boutonExportLea() { return qs('[data-action="travauxUI.lancerExportLea"]'); }
    function carteExportLea() { var b = boutonExportLea(); return b ? b.closest('.travaux-archivage-carte') : null; }

    // ---------- Les contours en plus (l'étape 2 en demande trois ; le moteur n'en pose qu'un) ----------
    // Le même dessin que le moteur (classe `parcours-contour`), posé ici et retiré avec l'étape, comme le second
    // contour du deuxième parcours. Le moteur n'est pas modifié.

    var extras = [];
    var extrasTimer = null;

    function majExtras() {
        extras.forEach(function (x) {
            var cible = x.cible();
            if (!M().actif() || !vis(cible)) { x.div.hidden = true; return; }
            var r = cible.getBoundingClientRect();
            x.div.hidden = false;
            x.div.style.left = (r.left - 5) + 'px';
            x.div.style.top = (r.top - 5) + 'px';
            x.div.style.width = (r.width + 10) + 'px';
            x.div.style.height = (r.height + 10) + 'px';
        });
    }

    function poserExtras(cibles) {
        retirerExtras();
        extras = cibles.map(function (cible, k) {
            var div = document.createElement('div');
            div.className = 'parcours-contour';
            div.id = 'parcours-contour-extra-' + k;
            div.hidden = true;
            document.body.appendChild(div);
            return { div: div, cible: cible };
        });
        extrasTimer = setInterval(majExtras, 120);
        majExtras();
    }

    function retirerExtras() {
        if (extrasTimer) clearInterval(extrasTimer);
        extrasTimer = null;
        extras.forEach(function (x) { if (x.div.parentNode) x.div.parentNode.removeChild(x.div); });
        extras = [];
    }

    // ---------- Les étapes ----------

    var TEXTE_7_SPECIFIQUE = "« Générale » reprend les phrases de ta cartouche, critère par critère ; « Spécifique », celles de tes tampons, avec le nombre de fois où tu les as posés.";
    var TEXTE_7_SANS_FICHIER = "« Générale » reprend les phrases de ta cartouche, critère par critère.";
    function texte7(deuxieme) {
        return "Ouvre la palette « Rétroaction » : c'est ce que ton étudiant·e lira dans sa synthèse. " + deuxieme +
            " Relis-les comme ton étudiant·e les lira. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Plus ta cartouche est précise, plus ton étudiant·e comprend ce que tu as constaté dans sa production. Quand tu es satisfait·e, touche le cadenas « Verrouiller », en haut de « Paramètres » : l'évaluation entre dans la note, et la rétroaction ne bougera plus par mégarde.";
    }

    var ETAPE_1 = {
        titre: 'Leurs productions',
        texte: "Tes étudiant·es t'ont remis leurs productions en ligne, dans Léa par exemple ? Télécharge-les dans un dossier, décompresse-les si elles arrivent en ZIP, puis dépose les fichiers ici. Garde leur nom tel quel : il porte le DA de l'étudiant·e, la production et la date de remise, et l'application s'en sert pour ranger chacune. Ta production n'a pas de fichier à importer : elle est sur papier, ou c'est un exposé, une performance, une entrevue ? Touche « Rien à importer » : on passe directement à l'évaluation.",
        avant: async function () {
            aller('evaluations', 'importer');
            await attendre(function () { return !!el('travaux-drop-zone'); }, 3000);
        },
        zones: function () { return [el('travaux-drop-zone')]; },
        contour: function () { return el('travaux-drop-zone'); },
        boutons: [{ libelle: 'Rien à importer', action: function () { choisirVoie('sans-fichier', 0); } }],
        atteint: function () { return fileDAttente().length > 0; }
    };

    var ETAPE_2 = {
        titre: "Vérifie avant d'importer",
        texte: "Avant d'importer, vérifie trois choses. En haut, la production : elle s'applique à tout le lot. À droite, pour chaque fichier, l'étudiant·e que l'application a trouvé·e par son DA ; s'il manque un nom, choisis-le. À gauche, les pages remises par un·e même étudiant·e : si elles arrivent séparées, coche-les, touche « Réunir en une copie », puis remets-les dans l'ordre. Une photo est de travers ou trop sombre ? « Réglages spécifiques » la pivote, la recadre et en règle le contraste. Touche ensuite « Importer », puis confirme. Un fichier mal associé se règle ici d'un geste ; une fois importé, il faut passer par la liste.",
        voile: 'aucun',
        avant: async function () {
            aller('evaluations', 'importer');
            await attendre(function () { return !!qs('.pipeline-col-originaux'); }, 3000);
            poserExtras([function () { return qs('.pipeline-col-confirmes'); }, function () { return qs('.pipeline-col-originaux'); }]);
        },
        zones: function () { return [qs('.pipeline-production-selecteur')]; },
        contour: function () { return qs('.pipeline-production-selecteur'); },
        // « Importer » ouvre la confirmation (une fenêtre à 9999) : elle reste au-dessus de la bulle et des contours, ses
        // boutons doivent rester touchables (mesuré : par-dessus, la bulle les couvrait).
        atteint: function () {
            var ok = !!fichierNeuf();
            if (ok) retirerExtras();
            return ok;
        }
    };

    var ETAPE_3 = {
        titre: 'La liste',
        texte: "Leurs productions sont importées. Chacune est rangée sous le nom de son étudiant·e, avec le statut « Importé » ; les étudiant·es qui n'ont rien remis restent « Non reçu » : tu vois d'un coup d'œil qui relancer. Une production est sous le mauvais nom ? « Actions › Réassigner » la déplace. Touche maintenant « Actions › Annoter » sur la ligne d'un·e étudiant·e pour l'ouvrir.",
        avant: async function () {
            retirerExtras();
            aller('evaluations', 'liste');
            await attendre(function () { return !!menuActions('annoter'); }, 3000);
        },
        zones: function () { return [rangeeDe(menuActions('annoter'))]; },
        contour: function () { return menuActions('annoter'); },
        atteint: annotationOuverte
    };

    var ETAPE_4 = {
        titre: 'Tes tampons',
        texte: "Avant d'annoter, regarde tes tampons. Chaque tampon que tu poses ajoute sa phrase à la synthèse de rétroaction de ton étudiant·e. Ceux de départ ont été écrits pour l'analyse littéraire : lis leurs phrases avant de t'en servir. Touche l'engrenage de la palette « Tampons » : garde les phrases qui disent ce que tu dirais, réécris les autres, change leur image ou crée tes propres tampons, une catégorie par cours si tu en donnes plusieurs. Puis touche « Enregistrer » : tes tampons te suivront d'un trimestre à l'autre, et tu pourras les partager avec tes collègues.",
        avant: async function () {
            tamponsEnregistres = false;
            await attendre(function () { return vis(paletteTampons()); }, 2000);
        },
        zones: function () {
            var f = fenetreTampons();
            surModale(vis(f));
            if (vis(f)) return [f.querySelector('.modal-contenu') || f];
            return [paletteTampons()];
        },
        contour: function () {
            var f = fenetreTampons();
            if (vis(f)) return f.querySelector('[data-action="travauxOutils.enregistrerRetroObservations"]');
            return engrenageTampons();
        },
        atteint: function () {
            var ok = tamponsEnregistres && !vis(fenetreTampons());
            if (ok) surModale(false);
            return ok;
        }
    };

    var ETAPE_5 = {
        titre: 'Annoter',
        texte: "Annote la production comme tu le ferais sur papier : souligne, encercle, écris dans la marge. Ces traces restent sur le fichier que ton étudiant·e recevra. Pose aussi tes tampons là où tu observes quelque chose : sur la production, le tampon montre l'endroit ; dans la synthèse, sa phrase dit ce que tu as observé, et combien de fois. Quand tu as fini, touche « Annoter ▾ », au-dessus de la production, et choisis « Évaluer ».",
        voile: 'aucun',   // la production entière s'annote : rien n'est voilé
        zones: function () { return [el('travaux-btn-actions')]; },
        contour: function () { return el('travaux-btn-actions'); },
        atteint: function () { return mode() === 'evaluer' && vis(el('travaux-palette-eval-gauche')); }
    };

    var ETAPE_6_FICHIER = {
        titre: 'Évaluer',
        texte: "Te voici en mode Évaluer. Dans « Paramètres », ta grille, ton échelle et ta cartouche sont déjà choisies : ce sont celles de ta production. Dans « Évaluation », choisis pour chaque critère le niveau ou les points que tu attribues ; la note se calcule à mesure.",
        voile: 'aucun',
        zones: function () { return [critereAAttribuer() || el('travaux-palette-eval-droite')]; },
        contour: critereAAttribuer,
        atteint: tenu(chaqueCritereAttribue)
    };

    var ETAPE_6_SANS_FICHIER = {
        titre: 'Évaluer',
        texte: "Rien à importer : touche « Actions › Évaluer » sur la ligne de l'étudiant·e. Ta grille, ton échelle et ta cartouche sont déjà choisies : ce sont celles de ta production. Pour chaque critère, choisis le niveau ou les points que tu attribues.",
        avant: async function () {
            if (ecranEvaluationVisible()) return;
            aller('evaluations', 'liste');
            await attendre(function () { return !!menuActions('evaluer'); }, 3000);
        },
        zones: function () {
            if (ecranEvaluationVisible()) { poserVoile('aucun'); return [critereAAttribuer() || boutonVerrou()]; }
            poserVoile('normal');
            return [rangeeDe(menuActions('evaluer'))];
        },
        contour: function () { return ecranEvaluationVisible() ? critereAAttribuer() : menuActions('evaluer'); },
        atteint: tenu(function () { return ecranEvaluationVisible() && chaqueCritereAttribue(); })
    };

    var ETAPE_7_FICHIER = {
        titre: 'Ta rétroaction',
        texte: texte7(TEXTE_7_SPECIFIQUE),
        voile: 'aucun',
        zones: function () { return [boutonVerrou()]; },
        contour: boutonVerrou,
        atteint: verrouNeuf
    };

    var ETAPE_7_SANS_FICHIER = {
        titre: 'Ta rétroaction',
        texte: texte7(TEXTE_7_SANS_FICHIER),
        voile: 'aucun',
        zones: function () { return [boutonVerrou()]; },
        contour: boutonVerrou,
        atteint: verrouNeuf
    };

    var ETAPE_8 = {
        titre: 'Rends tes rétroactions',
        texte: "Évalue de la même façon les productions des autres étudiant·es : « Plus tard » garde le parcours ici, et « Reprendre » t'y ramène. Quand tes évaluations sont faites et verrouillées, il reste à rendre tes rétroactions. Choisis la production, laisse « Tous » pour tout le groupe, puis touche « Exporter pour Léa ». Chaque étudiant·e reçoit un PDF : sa synthèse de rétroaction, précédée de sa production annotée si tu l'as importée. Le nom du fichier porte son DA : c'est ce qui permet de le remettre à la bonne personne. Avec plusieurs étudiant·es, les PDF arrivent réunis dans un ZIP.",
        avant: async function () {
            exportTouche = false;
            aller('evaluations', 'exporter');
            await attendre(function () { return vis(boutonExportLea()); }, 3000);
        },
        zones: function () { return [carteExportLea()]; },
        contour: boutonExportLea,
        atteint: exportFini
    };

    var ETAPE_9 = {
        titre: 'Remets-les',
        texte: "Dernier geste, hors de l'application : remettre les PDF. Dans Léa, par exemple, renomme le ZIP « Travaux.zip », dépose-le dans la liste des travaux de la production, puis touche « Transmettre » : chaque PDF rejoint l'étudiant·e dont il porte le DA. Ailleurs, dépose chaque PDF là où tes étudiant·es reçoivent leurs travaux évalués ; sans fichier, imprime la synthèse et remets-la, avec la production si elle est sur papier. Tu as bouclé le cycle pour lequel Labo Codex existe : recevoir, évaluer, rendre.",
        centre: true,
        sansSortie: true,
        boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
    };

    var VOIES = {
        'fichiers': [ETAPE_1, ETAPE_2, ETAPE_3, ETAPE_4, ETAPE_5, ETAPE_6_FICHIER, ETAPE_7_FICHIER, ETAPE_8, ETAPE_9],
        'sans-fichier': [ETAPE_6_SANS_FICHIER, ETAPE_7_SANS_FICHIER, ETAPE_8, ETAPE_9]
    };

    function voie() { return lireCtx().voie === 'sans-fichier' ? 'sans-fichier' : 'fichiers'; }

    // ---------- Le lancement, la voie, « Plus tard », la fin ----------

    function poserLeRepere(v) {
        majCtx({ voie: v, fichiersAvant: ids(fichiersDuGroupe()), verrousAvant: ids(evaluationsVerrouillees()), productionId: null });
    }

    function opts(depuis) {
        return {
            depuis: depuis,
            surEtape: function (i) { window.Assistance.definirEtat(ID, 'en-cours', i); },
            surQuitter: function () { retirerExtras(); surModale(false); },
            surEchap: function () { terminer(); },
            verifier: function () { return !enDemo(); }
        };
    }

    /** « Rien à importer » : la voie sans fichier, de sa première étape (l'évaluation). Elle est retenue. */
    function choisirVoie(v, depuis) {
        retirerExtras();
        majCtx({ voie: v });
        window.Assistance.definirEtat(ID, 'en-cours', depuis);
        return M().lancer({ id: ID, etapes: VOIES[v], lienSortie: 'Plus tard' }, opts(depuis));
    }

    async function lancer(depuis) {
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        if (enDemo()) return;
        if (condition()) {
            // La démo refermée ne laisse aucune production prête : le panneau se rouvre et dit pourquoi, sous le bouton.
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-parcours-bouton');
                if (b) b.click();
            }
            return;
        }
        // « Reprendre » (le parcours en cours) relit la voie et le repère, à toute étape (la leçon de la relecture du
        // troisième parcours) ; « Commencer » et « Refaire » les posent.
        var reprise = window.Assistance.etatDe(ID).etat === 'en-cours' && lireCtx().fichiersAvant;
        // « Refaire » repart de la voie retenue ; « Commencer », de la première bulle (avec ses deux voies).
        var v = reprise || window.Assistance.etatDe(ID).etat === 'fait' ? voie() : 'fichiers';
        if (!reprise) { depuis = 0; poserLeRepere(v); }
        return choisirVoie(v, depuis);
    }

    function terminer() {
        retirerExtras();
        surModale(false);
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Recevoir les productions, rendre tes rétroactions',
        ligne: 'De la remise de tes étudiant·es à leur rétroaction en PDF, avec ou sans fichier à importer.',
        // Sur la voie sans fichier, le panneau compte « n sur 4 » (tranché par Cowork).
        get total() { return VOIES[voie()].length; },
        condition: condition,
        lancer: lancer
    });

    // Pour les bancs : la condition, le repère, les deux voies, lus sans lancer le parcours.
    window.ParcoursRecevoir = {
        condition: condition,
        contexte: lireCtx,
        voies: function () { return VOIES; }
    };
})();
