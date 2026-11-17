/* =================================================================
   LE MODÈLE DE « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS » (« Je regarde », 17 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md, et le relais de Cowork du 17 nov. au soir.

   Le principe est celui de « Mettre ta classe en place » : le modèle se joue dans la démo, sur le deuxième groupe ; la
   personne fait chaque geste dans les vrais écrans ; le matériel est fourni. Les neuf étapes sont celles du parcours
   réel, voie « avec des fichiers » (js/parcours-recevoir.js, `pourLeModele`) : ce que chaque étape désigne et ce qui la
   fait avancer ne changent pas. Le modèle n'y ajoute que ses lignes, son bouton de matériel et deux resserrements :
   · étape 2 : la production choisie est celle du modèle d'« Évaluer » ;
   · étape 3 : la copie ouverte est celle de Loutre Enjouée (une seule copie est travaillée, décision 5).

   S'APPUIE SUR CE QUE PRODUIT LE MODÈLE D'« ÉVALUER », PAS SUR L'ORDRE DE SES ÉTAPES (relais du 17 nov.) : sa grille
   (par son nom), la production qui la porte avec une échelle et une cartouche, cette cartouche. L'évaluation de Yack
   Amical n'est pas exigée : si elle manque, la sienne est posée avec les six autres.

   LES SEPT ÉVALUATIONS DE L'EXEMPLE (décision 7). Au lancement, dans la démo seulement, en ajout : une personne qui a
   déjà une évaluation de cette production n'en reçoit pas d'autre. Aucune sur les trois copies (Loutre Enjouée, Tapir
   Doux, Antilope Vaillante). Elles s'écrivent directement dans `evaluationsSauvegardees` de la démo : l'application n'a
   aucune fonction qui écrive une évaluation hors du formulaire (mesure 3.2). Leurs champs sont ceux qu'écrit le
   formulaire (`_construireObjetEvaluationSauv`, js/evaluation-sauvegarde.js, relevés le 17 nov. 2026 sur l'évaluation
   de Yack Amical) ; leur note vient des fonctions de calcul de l'application (`calculerPortee`,
   `valeurNumeriqueDuNiveau`, `niveauDuPourcentage`), comme `calculerNote` les enchaîne ; leur rétroaction s'écrit
   comme `genererRetroaction` l'écrit, avec les commentaires de la cartouche.

   TAPIR DOUX reste importé, sans évaluation : le modèle suivant (« Lire ta classe ») posera la sienne (D, I, I, I,
   décision du 15 nov.). Rien ici ne l'en empêche : `evaluationDeLExemple(da, niveaux)` la construit pour lui aussi.

   ⚠ LES TEXTES SONT PROVISOIRES (`TEXTES`, plus bas, et rien ailleurs) : Grégoire écrit les bulles avec Cowork, une à la
   fois. Ils se remplacent sans toucher la mécanique.
   ================================================================= */
(function () {
    'use strict';

    var ID = 'recevoir';
    var M = function () { return window.ParcoursMoteur; };
    var C = function () { return window.ParcoursClasse; };
    var R = function () { return window.ParcoursRecevoir.pourLeModele; };

    // =================================================================
    // LE MATÉRIEL
    // =================================================================

    var MATERIEL = Object.freeze({
        // Les trois copies (js/materiel-copies-deux-rives.js), par DA ; seule celle de Loutre Enjouée est travaillée.
        copies: Object.freeze(['9900002', '9900005', '9900006']),
        copieTravaillee: Object.freeze({ da: '9900002', nom: 'Loutre Enjouée' }),
        // Les sept autres, déjà évalué·es (validé par Grégoire : « oui, c'est plausible ») : Structure, Rigueur,
        // Plausibilité, Nuance. Yack Amical porte les niveaux imposés du modèle d'« Évaluer ».
        criteres: Object.freeze(['Structure', 'Rigueur', 'Plausibilité', 'Nuance']),
        evaluations: Object.freeze([
            Object.freeze(['9900010', 'Toucan Souriante', Object.freeze(['E', 'E', 'M', 'M'])]),
            Object.freeze(['9900004', 'Hermine Généreuse', Object.freeze(['E', 'M', 'M', 'M'])]),
            Object.freeze(['9900008', 'Cigogne Bienveillante', Object.freeze(['M', 'M', 'M', 'D'])]),
            Object.freeze(['9900001', 'Koala Câlin', Object.freeze(['M', 'M', 'D', 'D'])]),
            Object.freeze(['9900007', 'Yack Amical', Object.freeze(['M', 'D', 'D', 'D'])]),
            Object.freeze(['9900003', 'Lémur Rieur', Object.freeze(['D', 'D', 'I', 'D'])]),
            Object.freeze(['9900009', 'Caribou Attentionné', Object.freeze(['D', 'I', 'D', 'I'])])
        ])
    });

    // =================================================================
    // LES TEXTES — PROVISOIRES (17 nov. 2026). Courts et fonctionnels : le geste, et ce qu'il faut toucher.
    // La forme du 16 nov. : une liste, la consigne (la ligne orange) en dernier, une ligne qui confirme le geste
    // précédent (`confirme`). Les noms entre « » sont ceux des écrans.
    // =================================================================

    var TEXTES = {
        objectif: "de recevoir les productions de tes étudiant·es, de les annoter, de les évaluer et de leur rendre leur rétroaction",
        refus: "Commence par la Modélisation d'« Évaluer une première production » : ce modèle reçoit les copies de la production qu'on y crée.",
        choisirLeGroupe: "Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui)",
        etape1: {
            lignes: [
                "Dans la démo, tu reçois trois copies du deuxième groupe. Rien ne touche à tes données.",
                "Avec ta classe, elles viennent de Léa : tu les télécharges, puis tu les déposes ici"
            ],
            consigne: "Regarde les copies arriver : touche « Remplir »"
        },
        etape2: {
            confirme: "C'est fait : les trois copies sont dans la zone. Rien n'est encore importé.",
            lignes: [
                "Sous « Originaux », les trois copies, une page chacune",
                "Sous « Aperçu », chaque copie a trouvé son étudiant·e par le DA de son nom"
            ],
            choisir: function (titre) { return "Sous « Inspecteur », choisis la production « " + titre + " »"; },
            importer: "Touche « Importer », puis « Oui, importer »"
        },
        etape3: {
            confirme: "C'est fait : les trois copies sont importées.",
            lignes: [
                "Loutre Enjouée, Tapir Doux et Antilope Vaillante : « Importé »",
                "Les sept autres sont déjà évalué·es par l'exemple, sans copie"
            ],
            consigne: "Sur la ligne de Loutre Enjouée, touche « Actions › Annoter »",
            pasLaBonneCopie: "Ce modèle travaille la copie de Loutre Enjouée : reviens à la Liste et ouvre la sienne."
        },
        etape4: {
            confirme: "C'est fait : la copie de Loutre Enjouée est ouverte.",
            lignes: ["La palette « Tampons » : chaque tampon posé ajoute sa phrase à la rétroaction"],
            ouvrir: "Touche l'engrenage de la palette « Tampons »",
            // « Annuler », pas « Enregistrer » (17 nov. 2026) : les réglages des tampons sont ceux de la personne, hors de
            // la démo ; « Enregistrer » les écrirait (mesuré : quatorze clés globales).
            fermer: "Lis les phrases, puis touche « Annuler » (avec ta classe, tu les réécris et tu touches « Enregistrer »)"
        },
        etape5: {
            confirme: "C'est fait : tu as vu tes tampons.",
            lignes: ["Annote comme tu veux : souligne, écris dans la marge, pose des tampons"],
            ouvrir: "Quand tu as fini, touche « Annoter ▾ »",
            evaluer: "Choisis « Évaluer »"
        },
        etape6: {
            confirme: "C'est fait : tu es en mode Évaluer.",
            lignes: ["La grille, l'échelle et la cartouche sont celles de la production"],
            consigne: "Choisis un niveau pour chaque critère, celui que tu veux"
        },
        etape7: {
            confirme: "C'est fait : chaque critère a son niveau.",
            lignes: [
                "La palette « Rétroaction » : ce que Loutre Enjouée lira",
                "« Générale » : les phrases de la cartouche ; « Spécifique » : celles de tes tampons"
            ],
            consigne: "Relis, puis touche le cadenas « Verrouiller »"
        },
        etape8: {
            confirme: "C'est fait : l'évaluation est verrouillée.",
            lignes: [
                "Huit évaluations verrouillées : celle de Loutre Enjouée et les sept de l'exemple",
                "Chacun·e reçoit un PDF : sa copie annotée et sa synthèse, ou sa synthèse seule"
            ],
            choisir: function (titre) { return "Choisis la production « " + titre + " », et laisse « — Tous — »"; },
            exporter: "Touche « Exporter pour Léa »"
        },
        etape9: {
            confirme: "C'est fait : le ZIP est téléchargé.",
            lignes: ["Avec ta classe, tu déposes ce ZIP dans Léa : chaque PDF rejoint l'étudiant·e dont il porte le DA"]
        }
    };

    // =================================================================
    // LES OUTILS
    // =================================================================

    function el(id) { return document.getElementById(id); }
    function vis(e) { return !!(e && M().visible(e)); }
    function enDemo() { return typeof estEnModeDemo === 'function' && estEnModeDemo(); }
    function note(texte) { return { texte: texte, note: true }; }
    function consigne(texte) { return { texte: texte, geste: true }; }
    function lignes(liste) { return liste.map(function (t) { return { texte: t }; }); }

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

    function aller(section, sous) {
        if (vis(el(section + '-' + sous))) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    /** Une liste de la démo, lue sous son préfixe : le panneau la lit aussi hors de la démo (le refus). */
    function deLaDemo(nom) {
        var v = typeof db !== 'undefined' ? db.getSync('demo_' + nom, []) : [];
        return Array.isArray(v) ? v : [];
    }

    // ---------- Ce que le modèle d'« Évaluer » a produit ----------

    function grilleDuModele() {
        var nom = window.ParcoursEvaluer ? window.ParcoursEvaluer.materiel.grille.nom : null;
        return deLaDemo('grillesTemplates').find(function (g) { return g && g.nom === nom; }) || null;
    }

    /** La production qui porte cette grille, avec son échelle et sa cartouche. */
    function productionDuModele() {
        var g = grilleDuModele();
        if (!g) return null;
        return deLaDemo('productions').find(function (p) { return p && p.grilleId === g.id && p.echelleId && p.cartoucheId; }) || null;
    }

    function cartoucheDuModele(p) {
        return p ? deLaDemo('cartouches_' + p.grilleId).find(function (c) { return c && c.id === p.cartoucheId; }) || null : null;
    }

    function deuxiemeGroupe() { return C() && typeof C().deuxiemeGroupe === 'function' ? C().deuxiemeGroupe() : null; }

    function refus() {
        if (!deuxiemeGroupe()) return TEXTES.refus;
        return cartoucheDuModele(productionDuModele()) ? null : TEXTES.refus;
    }

    function surLeDeuxiemeGroupe() {
        var g = deuxiemeGroupe(), gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        return !!(g && gc && gc.id === g.id);
    }

    function titreDeLaProduction() {
        var p = productionDuModele();
        return p ? (p.titre || p.nom || '') : '';
    }

    // =================================================================
    // LES SEPT ÉVALUATIONS DE L'EXEMPLE
    // =================================================================

    /** Les valeurs des niveaux de l'échelle, comme `calculerNote` les lit (#525 : `valeurNumeriqueDuNiveau`). */
    function valeursDesNiveaux(echelle) {
        var valeurs = {};
        echelle.niveaux.forEach(function (n) {
            var v = valeurNumeriqueDuNiveau(n);
            if (v !== null && !isNaN(v)) valeurs[n.code] = v;
        });
        return valeurs;
    }

    /**
     * La note d'un jeu de niveaux, par les fonctions de l'application, dans l'ordre de `calculerNote`
     * (js/evaluation-calcul.js) : la portée, la moyenne pondérée, le niveau global (#701), « -- » si la portée est
     * incomplète (#674). Un critère sans valeur sort de la note, comme à l'écran.
     */
    function noteDeLExemple(grille, echelle, niveauParCritere) {
        var valeurs = valeursDesNiveaux(echelle);
        var portee = calculerPortee(grille.criteres,
            function (c) { return niveauParCritere[c.id]; },
            function (c, niveau) { return valeurs[niveau]; });
        var total = 0, ponderations = 0;
        portee.criteresComptes.forEach(function (x) {
            total += x.valeur * ((x.critere.ponderation || 0) / 100);
            ponderations += (x.critere.ponderation || 0) / 100;
        });
        var pourcentage = ponderations > 0 ? total / ponderations : 0;
        var niveau = ponderations > 0 ? (niveauDuPourcentage(pourcentage, echelle.niveaux) || '--') : '--';
        return { pourcentage: pourcentage, niveauFinal: portee.incomplete ? '--' : niveau, portee: portee };
    }

    /** Le commentaire de la cartouche pour ce critère et ce niveau (`commentaireDuCritere`, la règle du PDF). */
    function commentaire(cartouche, critereId, niveau) {
        var d = window.syntheseRetroactionData;
        return d && typeof d.commentaireDuCritere === 'function'
            ? d.commentaireDuCritere({ enregistre: null, algorithmique: '', cartouche: cartouche, critereId: critereId, niveau: niveau })
            : '';
    }

    /** La rétroaction, comme `genererRetroaction` l'écrit avec toutes ses options cochées (js/evaluation-retroaction.js). */
    function retroactionDeLExemple(x) {
        var p = x.production, texte = '';
        if (p.activiteApprentissage || p.description) texte += 'Production : ' + (p.activiteApprentissage || p.description) + '\n';
        if (p.objectif) texte += 'Objectif : ' + p.objectif + '\n';
        if (p.tache) texte += 'Tâche : ' + p.tache + '\n';
        texte += '\nBonjour ' + x.etudiant.prenom + ' !\n\n';
        if (x.cartouche && x.cartouche.contexte) texte += x.cartouche.contexte + '\n\n';
        texte += 'Voici quelques observations :\n\n';
        x.criteres.forEach(function (c, k) {
            texte += 'Critère ' + (k + 1) + ' (' + c.critereNom + ') — ' + c.niveauSelectionne + '\n' + (c.retroaction ? c.retroaction + '\n' : '') + '\n';
        });
        var noteDite = formaterNotePourcentage(x.note.pourcentage);
        if (noteDite && !x.note.portee.incomplete) texte += '---\nNote finale : ' + noteDite;
        if (x.note.niveauFinal !== '--') texte += '  |  Niveau : ' + x.note.niveauFinal;
        return texte.trim();
    }

    /** Le journal que le formulaire pose à la fin d'une évaluation (relevé sur celle de Yack Amical). */
    function journalDe(criteres, note, quand) {
        return [
            { date: quand, action: 'evaluation_fin', details: { dureeMs: null, dureeSec: null, noteFinale: note.pourcentage, niveauFinal: note.niveauFinal, statutIntegrite: 'recevable' } },
            { date: quand, action: 'codes_idme', details: { criteres: criteres.map(function (c) { return { critereId: c.critereId, niveau: c.niveauSelectionne }; }) } }
        ];
    }

    /** Le matériel du modèle d'« Évaluer », lu dans la démo ; null s'il manque quelque chose. */
    function contexteDesEvaluations() {
        var production = productionDuModele(), grille = grilleDuModele(), cartouche = cartoucheDuModele(production);
        var echelle = production && typeof resoudreEchelleEvaluation === 'function' ? resoudreEchelleEvaluation(production.echelleId) : null;
        if (!production || !grille || !cartouche || !echelle || !Array.isArray(echelle.niveaux)) return null;
        return { production: production, grille: grille, cartouche: cartouche, echelle: echelle, groupeCours: deuxiemeGroupe() };
    }

    /**
     * Une évaluation de l'exemple, construite sans rien écrire : les champs du formulaire, verrouillée, sans fichier.
     * @param {Object} etudiant - { da, prenom, nom, groupe } ; @param {string[]} niveaux - un par critère de MATERIEL
     */
    function evaluationDeLExemple(etudiant, niveaux, ctx) {
        var g = ctx.grille, p = ctx.production, maintenant = new Date(), parId = {};
        var criteres = g.criteres.map(function (c) {
            var niveau = niveaux[MATERIEL.criteres.indexOf(c.nom)];
            parId[c.id] = niveau;
            return { critereId: c.id, critereNom: c.nom, niveauSelectionne: niveau, retroaction: commentaire(ctx.cartouche, c.id, niveau), ponderation: c.ponderation };
        });
        var n = noteDeLExemple(g, ctx.echelle, parId);
        var e = {
            id: genererIdUnique('EVAL_'), etudiantDA: etudiant.da, etudiantNom: etudiant.prenom + ' ' + etudiant.nom,
            groupe: etudiant.groupe || '', coursId: p.coursId || null, groupeCoursId: ctx.groupeCours ? ctx.groupeCours.id : null,
            productionId: p.id, productionNom: p.titre || p.nom || '', grilleId: g.id, grilleNom: g.nom,
            dateEvaluation: maintenant.toISOString(),
            heureEvaluation: maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
            criteres: criteres,
            optionsAffichage: { description: true, objectif: true, tache: true, adresse: true, contexte: true, affichageNote: 'complet' },
            donneesAlgorithmiques: {}, pointsAnalytiques: {}, verrouillee: true,
            echelleId: p.echelleId, cartoucheId: p.cartoucheId, statutRemise: 'recu', statutIntegrite: 'recevable', notesIntegrite: '',
            noteFinale: n.pourcentage, ponderationCouverte: n.portee.ponderationCouverte, niveauFinal: n.niveauFinal,
            retroactionReecrite: false
        };
        e.retroactionFinale = retroactionDeLExemple({ production: p, etudiant: etudiant, cartouche: ctx.cartouche, criteres: criteres, note: n });
        e.journal = journalDe(criteres, n, e.dateEvaluation);
        return e;
    }

    /**
     * Les sept évaluations, posées au lancement : dans la démo seulement, en ajout, sans rien remplacer (skill
     * `integrite-globaux` : push sans replace). La clé écrite doit être celle de la démo, sinon rien ne s'écrit.
     * @returns {number} le nombre d'évaluations posées
     */
    function poserLesEvaluationsDeLExemple() {
        var ctx = enDemo() ? contexteDesEvaluations() : null;
        var cleEvals = typeof cle === 'function' ? cle('evaluationsSauvegardees') : '';
        if (!ctx || cleEvals.indexOf('demo_') !== 0) return 0;
        var existantes = db.getSync(cleEvals, []) || [];
        var etudiants = deLaDemo('groupeEtudiants');
        var neuves = MATERIEL.evaluations.filter(function (x) {
            return !existantes.some(function (e) { return e && e.productionId === ctx.production.id && String(e.etudiantDA) === x[0] && !e.remplaceeParId; });
        }).map(function (x) {
            var etudiant = etudiants.find(function (e) { return e && String(e.da) === x[0]; });
            return etudiant ? evaluationDeLExemple(etudiant, x[2], ctx) : null;
        }).filter(Boolean);
        if (!neuves.length) return 0;
        db.setSync(cleEvals, existantes.concat(neuves));
        window._moyennesQualifies = null;
        window._moyennesToutes = null;
        return neuves.length;
    }

    // =================================================================
    // LES COPIES : le bouton de l'étape 1 les dépose dans la zone (option a)
    // =================================================================

    function chargerLesCopies() {
        return new Promise(function (ok) {
            if (window.MaterielCopiesDeuxRives) { ok(window.MaterielCopiesDeuxRives); return; }
            var s = document.createElement('script');
            // Jeton écrit en dur : le fichier change, ce jeton change (#825, garde pre-commit #547).
            s.src = 'js/materiel-copies-deux-rives.js?v=20261117a';
            s.onload = function () { ok(window.MaterielCopiesDeuxRives || null); };
            s.onerror = function () { ok(null); };
            document.head.appendChild(s);
        });
    }

    function fichierDe(copie) {
        var octets = atob(copie.base64), tableau = new Uint8Array(octets.length);
        for (var k = 0; k < octets.length; k++) tableau[k] = octets.charCodeAt(k);
        return new File([tableau], copie.nom, { type: copie.type });
    }

    /** Le chemin d'un dépôt fait à la main (js/travaux-ui.js, le rappel de la zone) : la file, puis la page. */
    async function deposerLesCopies() {
        if (!enDemo() || !surLeDeuxiemeGroupe()) return;
        var copies = await chargerLesCopies();
        if (!copies || !window.travauxImport || !window.travauxUI) return;
        window.travauxImport.ajouterFichiersEnAttente(copies.map(fichierDe));
        window.travauxUI.identifierAutoPipeline();
        window.travauxUI.rafraichirPipelineUI();
    }

    // =================================================================
    // LES ÉTAPES : celles du parcours, avec les lignes du modèle
    // =================================================================

    /**
     * Une étape du parcours, reprise : ce qu'elle désigne et ce qui la fait avancer ne changent pas, sauf ce que `plus`
     * redonne (`zones`, `contour`, `atteint`, `avis`). Ses lignes et ses boutons sont ceux du modèle. Tant que le
     * deuxième groupe n'est pas le groupe actif, l'étape n'avance pas : elle montre le menu de l'en-tête.
     */
    function pourLeModele(base, plus) {
        var e = Object.create(base);
        var de = function (k) { return plus[k] || base[k]; };
        e.texte = '';
        e.geste = '';
        if (plus.avant) e.avant = plus.avant;
        e.lignesVivantes = true;
        e.confirme = plus.confirme || null;
        e.lignes = function () { return surLeDeuxiemeGroupe() ? plus.lignes() : [consigne(TEXTES.choisirLeGroupe)]; };
        e.zones = function () { return surLeDeuxiemeGroupe() && de('zones') ? de('zones').call(e) : []; };
        e.contour = function () { return surLeDeuxiemeGroupe() ? (de('contour') ? de('contour').call(e) : null) : el('selectGroupeCoursHeader'); };
        e.avis = function () { return surLeDeuxiemeGroupe() && plus.avis ? plus.avis() : ''; };
        e.atteint = function () { return surLeDeuxiemeGroupe() && !!de('atteint').call(e); };
        Object.defineProperty(e, 'boutons', { get: function () { return surLeDeuxiemeGroupe() && plus.boutons ? plus.boutons() : null; } });
        return e;
    }

    function menuDeLaProductionAImporter() { var s = document.querySelector('.pipeline-production-selecteur select'); return s || null; }
    function productionAImporterChoisie() {
        var menu = menuDeLaProductionAImporter(), p = productionDuModele();
        return !!(menu && p && menu.value === p.id);
    }

    /** Le menu « Actions… » de la ligne de Loutre Enjouée, quand il offre « Annoter ». */
    function menuDeLaCopieTravaillee() {
        var menus = document.querySelectorAll('#evaluations-liste select.eval-actions-select');
        for (var k = 0; k < menus.length; k++) {
            var valeurs = [].map.call(menus[k].options, function (o) { return o.value; });
            var annoter = valeurs.some(function (v) { return v.indexOf('annoter|') === 0; });
            if (annoter && vis(menus[k]) && valeurs.join(' ').indexOf('|' + MATERIEL.copieTravaillee.da) !== -1) return menus[k];
        }
        return null;
    }

    function copieTravailleeOuverte() {
        var f = R().fichierOuvert();
        return !!f && String(f.etudiantDA) === MATERIEL.copieTravaillee.da;
    }

    function fenetreTamponsOuverte() { return vis(el('modal-retro-observations')); }
    function boutonAnnulerDesTampons() { return document.querySelector('#modal-retro-observations [data-action="travauxOutils.fermerModalRetroObservations"]'); }
    var tamponsVus = false;
    var passagesTenus = 0;
    var PASSAGES_A_TENIR = 9;
    function menuAnnoterOuvert() { var m = el('travaux-actions-dropdown'); return !!(m && m.classList.contains('ouvert') && vis(m)); }
    function menuExport() { return el('travaux-archivage-lea-production'); }
    function productionAExporterChoisie() { var s = menuExport(), p = productionDuModele(); return !!(s && p && s.value === p.id); }

    function ameneDeCote(e) {
        if (!e) return;
        var r = e.getBoundingClientRect();
        if (r.right > window.innerWidth || r.left < 0) e.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function construireLesEtapes() {
        var B = R().etapes();
        var T = TEXTES;
        return [
            pourLeModele(B[0], {
                lignes: function () { return [note(T.etape1.lignes[0]), { texte: T.etape1.lignes[1] }, consigne(T.etape1.consigne)]; },
                boutons: function () { return R().fileDAttente().length ? null : [{ libelle: C().mots.remplir, primaire: true, action: deposerLesCopies }]; },
                // « Remplir » est dans la bulle : rien n'est désigné sur la page (la règle des modèles), la zone reste à voir.
                contour: function () { return null; }
            }),
            pourLeModele(B[1], {
                confirme: T.etape2.confirme,
                lignes: function () {
                    var fin = productionAImporterChoisie() ? T.etape2.importer : T.etape2.choisir(titreDeLaProduction());
                    return lignes(T.etape2.lignes).concat([consigne(fin)]);
                },
                contour: function () { return productionAImporterChoisie() ? B[1].contour() : document.querySelector('.pipeline-production-selecteur'); },
                // Le parcours avance au premier fichier importé ; le modèle attend la fin de l'import (mesuré le 17 nov.
                // 2026 : à la Liste, la troisième copie restait « Non reçu » le temps que son import finisse).
                atteint: function () { return B[1].atteint() && !(window.travauxImport && window.travauxImport.importEnCours); }
            }),
            pourLeModele(B[2], {
                confirme: T.etape3.confirme,
                lignes: function () { return lignes(T.etape3.lignes).concat([consigne(T.etape3.consigne)]); },
                avant: async function () {
                    R().nettoyer();
                    aller('evaluations', 'liste');
                    await attendre(menuDeLaCopieTravaillee, 3000);
                    ameneDeCote(menuDeLaCopieTravaillee());
                },
                zones: function () { var s = menuDeLaCopieTravaillee(); return s ? [s.closest('tr') || s.parentElement] : []; },
                contour: menuDeLaCopieTravaillee,
                avis: function () { return R().fichierOuvert() && !copieTravailleeOuverte() ? T.etape3.pasLaBonneCopie : ''; },
                atteint: function () { return copieTravailleeOuverte() && B[2].atteint(); }
            }),
            pourLeModele(B[3], {
                confirme: T.etape4.confirme,
                lignes: function () { return lignes(T.etape4.lignes).concat([consigne(fenetreTamponsOuverte() ? T.etape4.fermer : T.etape4.ouvrir)]); },
                avant: function () { tamponsVus = false; return B[3].avant(); },
                contour: function () { return fenetreTamponsOuverte() ? boutonAnnulerDesTampons() : B[3].contour(); },
                // La fenêtre ouverte, puis refermée sans rien écrire (« Annuler ») : le modèle ne fait pas toucher
                // « Enregistrer », qui écrirait les réglages réels des tampons.
                atteint: function () {
                    if (fenetreTamponsOuverte()) { tamponsVus = true; return false; }
                    if (tamponsVus) R().nettoyer();
                    return tamponsVus;
                }
            }),
            pourLeModele(B[4], {
                confirme: T.etape5.confirme,
                lignes: function () { return lignes(T.etape5.lignes).concat([consigne(menuAnnoterOuvert() ? T.etape5.evaluer : T.etape5.ouvrir)]); }
            }),
            pourLeModele(B[5], {
                confirme: T.etape6.confirme,
                lignes: function () { return lignes(T.etape6.lignes).concat([consigne(T.etape6.consigne)]); },
                avant: function () { passagesTenus = 0; return B[5].avant(); },
                // Plus ferme que le parcours (trois passages, 360 ms) : au passage en mode Évaluer, l'évaluation de la
                // copie ouverte garde un temps les niveaux de la dernière ouverte, celle de Yack Amical dans ce modèle
                // (mesuré le 17 nov. 2026 : de 100 à plus de 360 ms ; une passe sur trois avançait sans aucun niveau
                // choisi). Aucun chargement en cours, et l'état tenu neuf passages de la sonde de suite (environ une
                // seconde ; compté en passages, pas à l'horloge).
                atteint: function () {
                    if (window._chargementsEvaluationEnCours > 0 || !B[5].atteint()) { passagesTenus = 0; return false; }
                    passagesTenus++;
                    return passagesTenus >= PASSAGES_A_TENIR;
                }
            }),
            pourLeModele(B[6], {
                confirme: T.etape7.confirme,
                lignes: function () { return lignes(T.etape7.lignes).concat([consigne(T.etape7.consigne)]); }
            }),
            pourLeModele(B[7], {
                confirme: T.etape8.confirme,
                lignes: function () {
                    var fin = productionAExporterChoisie() ? T.etape8.exporter : T.etape8.choisir(titreDeLaProduction());
                    return lignes(T.etape8.lignes).concat([consigne(fin)]);
                },
                contour: function () { return productionAExporterChoisie() ? B[7].contour() : menuExport(); }
            }),
            pourLeModele(B[8], {
                confirme: T.etape9.confirme,
                // « Objectif atteint » et la phrase de la suite : posés par le moteur (`objectifAtteint`, sur la définition).
                lignes: function () { return lignes(T.etape9.lignes).concat([consigne(C().consigneDesSuites(suites()))]); },
                boutons: suites,
                atteint: function () { return false; }
            })
        ];
    }

    function suites() { return C().suitesDuModele(ID, terminerModele); }

    var definition = null;
    function definitionDuModele() {
        if (!definition) {
            definition = {
                id: ID + '-modele', etapes: construireLesEtapes(), lienSortie: 'Plus tard',
                objectif: 'À la fin de ce parcours, tu seras en mesure ' + TEXTES.objectif + '.',
                objectifAtteint: 'Objectif atteint : tu es en mesure ' + TEXTES.objectif + '.'
            };
        }
        return definition;
    }

    // =================================================================
    // LE LANCEMENT, LA REPRISE, LA FIN
    // =================================================================

    function copieTravailleeImportee(p) {
        return R().fichiersDuGroupe().find(function (f) {
            return f && f.productionId === p.id && String(f.etudiantDA) === MATERIEL.copieTravaillee.da;
        }) || null;
    }

    function evaluationsVerrouillees() {
        var v = typeof obtenirDonneesSelonMode === 'function' ? obtenirDonneesSelonMode('evaluationsSauvegardees') || [] : [];
        return v.filter(function (e) { return e && e.id && e.verrouillee === true && !e.remplaceeParId; });
    }

    function estLaCopieTravaillee(e, p) { return e.productionId === p.id && String(e.etudiantDA) === MATERIEL.copieTravaillee.da; }

    /**
     * Le repère, refait à chaque lancement, en mémoire : tout ce que la démo contient, sauf ce que le modèle produit
     * (les trois copies de sa production ; l'évaluation verrouillée de Loutre Enjouée). Les étapes avancent ainsi sur
     * ce qui a déjà été fait, comme à une reprise. La première étape non faite : l'export si Loutre Enjouée est évaluée,
     * la Liste si sa copie est importée, sinon le dépôt.
     */
    function poserLeRepere() {
        var p = productionDuModele(), copie = copieTravailleeImportee(p);
        var avant = R().fichiersDuGroupe().filter(function (f) {
            return f && !(f.productionId === p.id && MATERIEL.copies.indexOf(String(f.etudiantDA)) !== -1);
        });
        var verrous = evaluationsVerrouillees().filter(function (e) { return !estLaCopieTravaillee(e, p); });
        R().entrer({
            voie: 'fichiers', fichiersAvant: avant.map(function (f) { return f.id; }), verrousAvant: verrous.map(function (e) { return e.id; }),
            fichierId: copie ? copie.id : null, productionId: copie ? p.id : null
        });
        if (evaluationsVerrouillees().some(function (e) { return estLaCopieTravaillee(e, p); })) return 7;
        return copie ? 2 : 0;
    }

    async function lancerModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        if (refus()) {
            // Le préalable n'est plus là (la démo remise à neuf entre-temps) : le panneau se rouvre et le dit.
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-modele-bouton');
                if (b) b.click();
            }
            return;
        }
        poserLesEvaluationsDeLExemple();
        var depuis = poserLeRepere();
        var def = definitionDuModele();
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(def, {
            depuis: depuis,
            surEtape: function (i) {
                if (i !== 1) R().bulleSousLesColonnes(false);
                window.Assistance.definirEtatModele(ID, 'en-cours', i);
            },
            surQuitter: function () { R().nettoyer(); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route : le modèle se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        R().nettoyer();
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    // Pour le parcours (son enregistrement délègue ici) et pour les bancs.
    window.ParcoursRecevoirModele = {
        lancer: lancerModele,
        refus: refus,
        materiel: MATERIEL,
        textes: TEXTES,
        etapes: function () { return definitionDuModele().etapes; },
        evaluationDeLExemple: function (da, niveaux) {
            var ctx = contexteDesEvaluations(), e = deLaDemo('groupeEtudiants').find(function (x) { return x && String(x.da) === String(da); });
            return ctx && e ? evaluationDeLExemple(e, niveaux, ctx) : null;
        }
    };
})();
