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
    // LES TEXTES — ÉCRITS PAR GRÉGOIRE AVEC COWORK (17 nov. 2026, 18 h 20 à 19 h 19), MOT POUR MOT
    // RETOUCHES DE COWORK (18 nov. 2026, 7 h 40, mots lus par l'enseignant·e) : « à la section » devient « à l'onglet », que
    // le moteur pose lui-même avec le halo du menu (`lieu`, `lieuSuite` : la suite de chaque phrase, mot pour mot) ; la
    // bulle 4 dit « la mention « Spécifique », suivie de « Perspective » ».
    // plans de travail/CONSIGNE-LOT-2026-11-17-recevoir-dix-bulles.md, partie C. Les lignes `lieu` disent où l'on est
    // telles que Grégoire les a écrites (« à la section », là où le moteur dirait « à l'onglet ») : elles sont posées comme
    // des phrases de la bulle. `consignes` : les lignes en gras (la ligne orange), toujours en dernier. `devient` : la
    // seconde forme de la bulle, après le geste. Seules les lignes marquées PROPOSÉ sont de la session.
    // =================================================================

    var PRODUCTION_DITE = function (titre) { return '« ' + titre + ' »'; };

    var TEXTES = {
        objectif: "de décrire le chemin d'une production dans l'application, de sa remise à la rétroaction que tu rends",
        // PROPOSÉ (le panneau, le préalable manquant) : inchangé depuis le 17 nov.
        refus: "Commence par la Modélisation d'« Évaluer une première production » : ce modèle reçoit les copies de la production qu'on y crée.",
        // PROPOSÉ : inchangé depuis le 17 nov.
        choisirLeGroupe: "Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui)",
        etape1: {
            lieuSuite: ": c'est là que tu reçois les productions de tes étudiant·es.",
            phrase: "Dans la démo, trois étudiant·es du deuxième groupe t'ont remis leur production. Rien ne touche à tes données.",
            lignes: ["Avec ta classe, elles viennent de Léa : tu les télécharges, puis tu les déposes ici"],
            consignes: ["Regarde-les arriver : touche « Remplir »"]
        },
        etape2: {
            confirme: "C'est fait : les trois copies sont dans la zone. Rien n'est encore importé.",
            lignes: [
                "Sous « Originaux », les trois fichiers déposés : deux photos et un PDF",
                "Sous « Aperçu », chaque copie a trouvé son étudiant·e : Léa a mis son DA dans le nom du fichier, et l'application l'a lu",
                "C'est le moment de vérifier qu'aucune copie ne s'est trompée de nom",
                "Les deux photos ont déjà été ajustées : l'application a corrigé leurs couleurs (la balance des blancs). Le PDF passe tel quel",
                "La photo de Tapir Doux a été prise de travers : on la redresse avant d'importer"
            ],
            consignes: ["Touche la copie de Tapir Doux, puis l'engrenage « Réglages spécifiques »"],
            // PROPOSÉ : une autre copie choisie, ou le poste ouvert sur une autre photo.
            autreCopie: "Ce modèle redresse la photo de Tapir Doux : sous « Originaux », touche la sienne.",
            autrePhoto: "Ce n'est pas la photo de Tapir Doux : touche « ← Retour », puis choisis la sienne."
        },
        etape3: {
            confirme: "C'est fait : les réglages de la photo de Tapir Doux sont ouverts.",
            lieu: "Tu es dans les réglages spécifiques : ce que tu y fais ne touche que cette photo.",
            lignes: [
                "Dans « Découpe », l'outil « Perspective » remet droite une feuille photographiée de biais",
                "Il cherche les coins de la feuille et y pose une poignée ; s'il en rate un, tu le glisses à sa place"
            ],
            consignes: ["Touche « Perspective », puis ajuste les poignées au besoin", "Touche « Confirmer perspective »"],
            devient: {
                lignes: [
                    "La feuille remplit maintenant l'image, droite, comme vue d'en haut",
                    "Tu n'as rien d'autre à régler : à l'import, l'application ajuste d'office les couleurs de chaque photo",
                    "Les réglages spécifiques, c'est pour une photo d'exception : prise de travers, trop sombre, mal cadrée"
                ],
                consignes: ["Touche « Confirmer les réglages spécifiques »"]
            }
        },
        etape4: {
            confirme: "C'est fait : la photo de Tapir Doux est redressée.",
            lignes: [
                "Sous « Aperçu », sa copie porte maintenant la mention « Spécifique », suivie de « Perspective » : son réglage s'appliquera à l'import",
                "Il reste à dire à quelle production les trois copies répondent : leur grille et leur cartouche viendront avec elle"
            ],
            choisir: function (titre) { return "Sous « Inspecteur », choisis la production " + PRODUCTION_DITE(titre); },
            importer: "Touche « Importer », puis « Oui, importer »"
        },
        etape5: {
            confirme: "C'est fait : les trois copies sont importées.",
            lieuSuite: ": c'est là que tu vois où en est chaque copie de ton groupe.",
            lignes: [
                "Loutre Enjouée, Tapir Doux et Antilope Vaillante : « Importé ». Leur copie attend d'être annotée et évaluée",
                "Les sept autres étudiant·es ont déjà leur évaluation, posée par l'exemple, sans copie : l'export, à la fin, portera ainsi sur une classe entière"
            ],
            consignes: ["Sur la ligne de Loutre Enjouée, touche « Actions › Annoter »"],
            pasLaBonneCopie: "Ce modèle travaille la copie de Loutre Enjouée : reviens à la Liste et ouvre la sienne."
        },
        etape6: {
            confirme: "C'est fait : la copie de Loutre Enjouée est ouverte.",
            lieuSuite: ": c'est là que tu lis la copie et que tu y écris, comme au stylo.",
            lignes: [
                "La palette « Tampons » : un tampon est un signe que tu poses sur la copie ; chacun ajoute sa phrase à la rétroaction de l'étudiant·e",
                "Ces phrases sont les tiennes : tu les écris une fois, elles servent d'une copie à l'autre et d'un trimestre à l'autre"
            ],
            consignes: ["Touche l'engrenage de la palette « Tampons »"],
            devient: {
                lignes: [
                    "Chaque tampon, avec la phrase qu'il ajoute",
                    "Dans la démo, on regarde sans enregistrer : ces réglages sont les tiens, hors de la démo"
                ],
                consignes: ["Lis les phrases, puis touche « Annuler » (avec ta classe, tu les réécris à ta façon et tu touches « Enregistrer »)"]
            }
        },
        etape7: {
            confirme: "C'est fait : tu as vu tes tampons.",
            lignes: [
                "Les couleurs et les notes déjà sur la copie sont celles de Loutre Enjouée : sa tâche était d'annoter le texte avec trois stratégies de lecture",
                "Pour un commentaire, prends l'outil « Texte » : tu tapes un paragraphe lisible, qui reste d'un seul tenant",
                "Garde le « Stylo » pour encercler, souligner ou tracer une flèche : écrit à la main, chaque trait devient un élément à part sur la page",
                "Ici, on essaie les outils (texte, stylo, tampons), l'endroit importe peu. Loutre retrouvera tes marques dans le PDF que tu lui rendras"
            ],
            consignes: ["Quand tu as fini, touche « Annoter ▾ », puis choisis « Évaluer »"]
        },
        etape8: {
            confirme: "C'est fait : tu es en mode Évaluer.",
            lignes: [
                "La palette « Évaluation » reprend ce que porte la production : sa grille (les critères), son échelle (les niveaux) et sa cartouche (une phrase de rétroaction prévue pour chaque critère et chaque niveau)",
                "Tout ça est déjà en place : tu n'as rien à choisir"
            ],
            consignes: ["Choisis un niveau pour chaque critère, celui que tu veux (suggestion pour suivre l'exemple : M, D, D, D)"]
        },
        etape9: {
            confirme: "C'est fait : chaque critère a son niveau.",
            lignes: [
                "La palette « Rétroaction » montre ce que Loutre Enjouée lira",
                "« Générale » : les phrases de la cartouche, choisies d'après les niveaux que tu viens de donner",
                "« Spécifique » : les phrases des tampons que tu as posés sur sa copie",
                "« Bilan » : ses défis et sa force du moment ; plus tard, son progrès d'une production à l'autre",
                "Verrouiller dit que l'évaluation est terminée : seules les évaluations verrouillées partent à l'export"
            ],
            consignes: ["Relis, puis touche le cadenas « Verrouiller »"]
        },
        etape10: {
            confirme: "C'est fait : l'évaluation de Loutre Enjouée est verrouillée.",
            lieuSuite: ": c'est là que tu prépares ce que tu remets à tes étudiant·es.",
            lignes: [
                "Huit évaluations verrouillées partent : celle de Loutre Enjouée et les sept de l'exemple",
                "Tapir Doux et Antilope Vaillante n'ont pas encore d'évaluation : rien ne part pour eux",
                "Chacun·e reçoit un PDF : sa copie annotée et sa synthèse, ou sa synthèse seule s'il n'y a pas de copie"
            ],
            choisir: function (titre) { return "Dans la carte « Export Léa », choisis la production " + PRODUCTION_DITE(titre) + " et laisse « Étudiant·e » à « — Tous — »"; },
            exporter: "Touche « Exporter pour Léa »",
            devient: {
                lignes: [
                    "Garde ce fichier tel quel : son nom, avec la production et la date, en fait une archive facile à retrouver",
                    "Pour Léa, fais-en une copie renommée « travaux.zip » : c'est le nom qu'elle attend pour remettre chaque PDF à l'étudiant·e dont il porte le nom et le DA"
                ]
            }
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
            s.src = 'js/materiel-copies-deux-rives.js?v=20261117b';
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
        if (plus.titre) e.titre = plus.titre;
        if (plus.lieu) e.lieu = function () { return surLeDeuxiemeGroupe() && (typeof plus.lieu === 'function' ? plus.lieu() : true); };
        if (plus.lieuSuite) e.lieuSuite = plus.lieuSuite;
        // Le lieu remonte la page en haut ; `amener` y ramène ce que l'étape désigne (le moteur, 16 nov. 2026).
        if (plus.lieu) e.amener = true;
        if (plus.avant) e.avant = plus.avant;
        if (plus.nommeLeContour) e.nommeLeContour = true;
        if (plus.aussiEviter) e.aussiEviter = function () { return surLeDeuxiemeGroupe() ? plus.aussiEviter() : []; };
        if (plus.sansSortie) Object.defineProperty(e, 'sansSortie', { get: plus.sansSortie });
        e.lignesVivantes = true;
        e.confirme = plus.confirme || null;   // un texte, ou une fonction (une bulle à deux formes)
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

    var ameneeDeCote = 0;
    function ameneDeCote(e) {
        if (!e) return;
        var r = e.getBoundingClientRect();
        if (r.right > window.innerWidth || r.left < 0) e.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    // ---------- Les lignes : la phrase du lieu, les explications, les consignes (en dernier) ----------

    /** Une forme de bulle : ses phrases (`lieu`, `phrase`), sa liste, ses consignes ; `faites` : les consignes déjà faites. */
    function forme(t, consignes, faites) {
        var l = [];
        if (t.lieu) l.push(note(t.lieu));
        if (t.phrase) l.push(note(t.phrase));
        return l.concat(lignes(t.lignes || []), (consignes || t.consignes || []).map(function (c, k) {
            return faites && faites[k] ? { texte: c, fait: function () { return true; } } : consigne(c);
        }));
    }

    // ---------- Étapes 2 et 3 : la photo de Tapir Doux, choisie puis redressée ----------

    var DA_A_REDRESSER = '9900005';

    function indexDeLaPhotoARedresser() {
        var file = R().fileDAttente();
        for (var k = 0; k < file.length; k++) {
            if (file[k] && String(file[k].etudiantDA || (file[k].parseLea && file[k].parseLea.da) || file[k].daDetecte) === DA_A_REDRESSER) return k;
        }
        return -1;
    }

    function ligneChoisie() { return document.querySelector('.pipeline-col-originaux .pipeline-fichier-ligne.pipeline-fichier-selectionne'); }
    function indexChoisi() { var l = ligneChoisie(); return l ? parseInt(l.getAttribute('data-param'), 10) : -1; }
    function ligneDeLaPhotoARedresser() {
        var k = indexDeLaPhotoARedresser();
        return k < 0 ? null : document.querySelector('.pipeline-col-originaux .pipeline-fichier-ligne[data-param="' + k + '"]');
    }
    function engrenage() { return document.querySelector('[data-action="travauxUI.ouvrirPreparationFichier"]'); }
    function posteOuvert() { return vis(el('travaux-preparation-modal')); }

    /** Le poste est ouvert sur la photo de Tapir Doux : son nom est celui que le poste affiche. */
    function posteSurLaPhotoARedresser() {
        if (!posteOuvert()) return false;
        var f = R().fileDAttente()[indexDeLaPhotoARedresser()];
        var nom = document.querySelector('#travaux-preparation-modal .prep-mini-nom');
        return !!(f && nom && String(nom.textContent || '').indexOf(String(f.nomFichier || '').replace(/\.[^.]+$/, '')) !== -1);
    }

    function boutonPerspective() { return document.querySelector('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]'); }
    function boutonConfirmerPerspective() { return el('prep-btn-appliquer-persp'); }
    function boutonConfirmerLesReglages() { return el('prep-btn-confirmer'); }
    function perspectiveEnCours() { return vis(boutonConfirmerPerspective()); }

    /** La perspective est appliquée dans le poste (une opération `perspective` dans sa pile). */
    function perspectiveAppliquee() {
        var p = window.travauxPreparation;
        var ops = p && typeof p.operationsEnCours === 'function' ? p.operationsEnCours() : [];
        return ops.some(function (o) { return o && o.type === 'perspective'; });
    }

    /**
     * Les poignées de « Perspective » sont dessinées sur un canevas : rien, dans la page, que la bulle puisse éviter. Le
     * modèle pose sur chacune un repère invisible (`pointer-events: none`), que la bulle évite comme son contour. Mesuré
     * le 17 nov. 2026 à 820 × 1180 : aucune place hors de l'image n'accueille la bulle ; elle couvre l'image, jamais une poignée.
     */
    var reperes = [];
    function reperesDesPoignees() {
        var p = window.travauxPreparation, canevas = el('prep-canvas-apercu');
        var coins = perspectiveEnCours() && p && typeof p.coinsDePerspective === 'function' ? p.coinsDePerspective() : null;
        if (!coins || !vis(canevas)) { retirerLesReperes(); return []; }
        var r = canevas.getBoundingClientRect(), cote = 40;
        while (reperes.length < coins.length) {
            var d = document.createElement('div');
            d.setAttribute('data-parcours-repere', 'poignee');   // un repère, sans règle de style : tout est en ligne
            d.setAttribute('aria-hidden', 'true');
            d.style.cssText = 'position:fixed;width:' + cote + 'px;height:' + cote + 'px;pointer-events:none;opacity:0;';
            document.body.appendChild(d);
            reperes.push(d);
        }
        coins.forEach(function (c, k) {
            reperes[k].style.left = Math.round(r.left + c.x * r.width - cote / 2) + 'px';
            reperes[k].style.top = Math.round(r.top + c.y * r.height - cote / 2) + 'px';
        });
        return reperes.slice(0, coins.length);
    }
    function retirerLesReperes() {
        reperes.forEach(function (d) { if (d.parentNode) d.parentNode.removeChild(d); });
        reperes = [];
    }

    /** La copie de Tapir Doux porte l'opération dans la file : le poste l'a rendue. */
    function photoRedressee() {
        var f = R().fileDAttente()[indexDeLaPhotoARedresser()];
        return !!(f && Array.isArray(f.operations) && f.operations.some(function (o) { return o && o.type === 'perspective'; }));
    }

    // ---------- Étape 10 : l'export, puis la fin ----------

    var exportFait = false;
    window.addEventListener('travaux-export-lea-telecharge', function (ev) {
        if (ev && ev.detail && ev.detail.fichiers > 0) exportFait = true;
    });

    function construireLesEtapes() {
        var B = R().etapes();
        var T = TEXTES;
        return [
            pourLeModele(B[0], {
                lieu: true,
                lieuSuite: T.etape1.lieuSuite,
                lignes: function () { return forme(T.etape1); },
                boutons: function () { return R().fileDAttente().length ? null : [{ libelle: C().mots.remplir, primaire: true, action: deposerLesCopies }]; },
                // « Remplir » est dans la bulle : rien n'est désigné sur la page (la règle des modèles), la zone reste à voir.
                contour: function () { return null; }
            }),
            pourLeModele(B[1], {
                confirme: T.etape2.confirme,
                lignes: function () { return forme(T.etape2); },
                contour: function () {
                    var tapir = ligneDeLaPhotoARedresser();
                    return tapir && indexChoisi() === indexDeLaPhotoARedresser() ? engrenage() : tapir;
                },
                avis: function () {
                    if (posteOuvert() && !posteSurLaPhotoARedresser()) return T.etape2.autrePhoto;
                    return indexChoisi() >= 0 && indexChoisi() !== indexDeLaPhotoARedresser() ? T.etape2.autreCopie : '';
                },
                atteint: posteSurLaPhotoARedresser
            }),
            pourLeModele(B[1], {
                titre: 'Redresse une photo',
                confirme: function () { return perspectiveAppliquee() ? '' : T.etape3.confirme; },
                lignes: function () {
                    if (perspectiveAppliquee()) return forme(T.etape3.devient);
                    return forme(T.etape3, null, [perspectiveEnCours(), false]);
                },
                // Le poste couvre tout l'écran : la bulle passe au-dessus (la règle du parcours 9), et n'en couvre ni l'image
                // ni ses poignées.
                avant: async function () {
                    R().nettoyer();
                    R().surModale(true);
                    await attendre(function () { return vis(boutonPerspective()); }, 3000);
                },
                // Aucune zone : l'image remplit le poste et aucune place ne la laisse libre (mesuré à 820 × 1180) ; comptée,
                // elle pesait plus que les poignées. La bulle évite les poignées et les boutons à toucher (`aussiEviter`).
                zones: function () {
                    R().surModale(posteOuvert());
                    return [];
                },
                aussiEviter: function () {
                    var boutons = [boutonPerspective(), boutonConfirmerPerspective(), boutonConfirmerLesReglages()].filter(vis);
                    return reperesDesPoignees().concat(boutons);
                },
                contour: function () {
                    if (perspectiveAppliquee()) return boutonConfirmerLesReglages();
                    return perspectiveEnCours() ? boutonConfirmerPerspective() : boutonPerspective();
                },
                nommeLeContour: true,
                atteint: function () {
                    var ok = !posteOuvert() && photoRedressee();
                    if (ok) { R().surModale(false); retirerLesReperes(); }
                    return ok;
                }
            }),
            pourLeModele(B[1], {
                titre: 'Importe-les',
                confirme: T.etape4.confirme,
                lignes: function () {
                    var choisie = productionAImporterChoisie();
                    return forme(T.etape4, [T.etape4.choisir(titreDeLaProduction()), T.etape4.importer], [choisie, false]);
                },
                contour: function () { return productionAImporterChoisie() ? B[1].contour() : document.querySelector('.pipeline-production-selecteur'); },
                // Le parcours avance au premier fichier importé ; le modèle attend la fin de l'import (mesuré le 17 nov.
                // 2026 : à la Liste, la troisième copie restait « Non reçu » le temps que son import finisse).
                atteint: function () { return B[1].atteint() && !(window.travauxImport && window.travauxImport.importEnCours); }
            }),
            pourLeModele(B[2], {
                lieu: true,
                lieuSuite: T.etape5.lieuSuite,
                confirme: T.etape5.confirme,
                lignes: function () { return forme(T.etape5); },
                avant: async function () {
                    R().nettoyer();
                    ameneeDeCote = 0;
                    aller('evaluations', 'liste');
                    await attendre(menuDeLaCopieTravaillee, 3000);
                },
                // Le lieu remonte la page en haut et à gauche (`scrollTo(0, 0)`, le moteur) : à 1180 px, la colonne
                // « Actions » sort alors de l'écran. Le menu de Loutre Enjouée est ramené de côté, trois fois au plus.
                zones: function () {
                    var s = menuDeLaCopieTravaillee();
                    if (s && ameneeDeCote < 3) {
                        var r = s.getBoundingClientRect();
                        if (r.right > window.innerWidth || r.left < 0) { ameneeDeCote++; ameneDeCote(s); }
                    }
                    return s ? [s.closest('tr') || s.parentElement] : [];
                },
                contour: menuDeLaCopieTravaillee,
                avis: function () { return R().fichierOuvert() && !copieTravailleeOuverte() ? T.etape5.pasLaBonneCopie : ''; },
                atteint: function () { return copieTravailleeOuverte() && B[2].atteint(); }
            }),
            pourLeModele(B[3], {
                lieu: function () { return !fenetreTamponsOuverte(); },
                lieuSuite: T.etape6.lieuSuite,
                confirme: function () { return fenetreTamponsOuverte() ? '' : T.etape6.confirme; },
                lignes: function () { return fenetreTamponsOuverte() ? forme(T.etape6.devient) : forme(T.etape6); },
                avant: function () { tamponsVus = false; return B[3].avant(); },
                contour: function () { return fenetreTamponsOuverte() ? boutonAnnulerDesTampons() : B[3].contour(); },
                // La fenêtre ouverte, puis refermée sans rien écrire (« Annuler ») : le modèle ne fait pas toucher
                // « Enregistrer », qui écrirait les réglages réels des tampons (décision maintenue le 17 nov., soir).
                atteint: function () {
                    if (fenetreTamponsOuverte()) { tamponsVus = true; return false; }
                    if (tamponsVus) R().nettoyer();
                    return tamponsVus;
                }
            }),
            pourLeModele(B[4], {
                confirme: T.etape7.confirme,
                lignes: function () { return forme(T.etape7); }
            }),
            pourLeModele(B[5], {
                confirme: T.etape8.confirme,
                lignes: function () { return forme(T.etape8); },
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
                confirme: T.etape9.confirme,
                lignes: function () { return forme(T.etape9); }
            }),
            pourLeModele(B[7], {
                lieu: function () { return !exportFait; },
                lieuSuite: T.etape10.lieuSuite,
                confirme: function () { return exportFait ? '' : T.etape10.confirme; },
                // Avant l'export : la production, puis « Exporter pour Léa ». Après : la seconde forme ; « Objectif
                // atteint », la phrase de la suite et « Pour revoir une étape » sont posés par le moteur (la fin).
                lignes: function () {
                    if (exportFait) return forme(T.etape10.devient);
                    var choisie = productionAExporterChoisie();
                    return forme(T.etape10, [T.etape10.choisir(titreDeLaProduction()), T.etape10.exporter], [choisie, false]);
                },
                avant: function () { exportFait = false; return B[7].avant(); },
                contour: function () {
                    if (exportFait) return null;
                    return productionAExporterChoisie() ? B[7].contour() : menuExport();
                },
                boutons: function () { return exportFait ? suites() : null; },
                // La seconde forme est la fin : sans « Plus tard », comme la dernière bulle de « Mettre ta classe en place ».
                sansSortie: function () { return exportFait; },
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
                // La dernière bulle a deux formes : « Objectif atteint » ne paraît qu'à la seconde, le ZIP téléchargé.
                objectifAtteint: function () { return exportFait ? 'Objectif atteint : tu es en mesure ' + TEXTES.objectif + '.' : ''; }
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
     * ce qui a déjà été fait, comme à une reprise. La première étape non faite : l'export (10) si Loutre Enjouée est
     * évaluée, la Liste (5) si sa copie est importée, sinon le dépôt (1).
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
        if (evaluationsVerrouillees().some(function (e) { return estLaCopieTravaillee(e, p); })) return 9;
        return copie ? 4 : 0;
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
                // La bulle sous les colonnes de « Préparer » : aux étapes 2 et 4 (index 1 et 3), comme le parcours.
                if (i !== 1 && i !== 3) R().bulleSousLesColonnes(false);
                if (i !== 2) R().surModale(false);
                window.Assistance.definirEtatModele(ID, 'en-cours', i);
            },
            surQuitter: function () { R().nettoyer(); retirerLesReperes(); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route : le modèle se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        R().nettoyer();
        retirerLesReperes();
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
