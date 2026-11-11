/* =================================================================
   LE HUITIÈME PARCOURS, « AUTOMATISER TES COMMENTAIRES » (9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md.

   De la grille d'une production pas encore évaluée à une rétroaction que l'application écrit
   à partir des codes posés, relue puis verrouillée. Il se joue sur les vraies données de la
   personne et n'écrit rien de lui-même : seuls ses gestes écrivent. Il ne démarre jamais de
   lui-même : « Commencer », « Reprendre » ou « Refaire », dans le panneau « Assistance ».

   ⚠ Les douze bulles (onze étapes, et la variante sans fichier de l'étape 10) sont celles que
   Grégoire a validées une à une le 8 nov., posées mot pour mot : la sentinelle
   tests/unit/sentinelle-parcours-commentaires-2026-11-09.test.js les confronte à la consigne.

   DEUX CHEMINS, DES ÉTAPES SAUTÉES QUI NE COMPTENT PAS
     Avec fichier : 1 à 11. Sans fichier (« Rien à importer », à l'étape 8) : 1 à 8, la
     variante de l'étape 10, puis 11. L'étape 7 est sautée si la grille est déjà associée à une
     production ; l'étape 8, si des productions sont déjà importées pour elle. Le moteur compte
     « n sur N » sur `def.etapes` : le chemin se reconstruit à chaque étape (`surEtape`), les
     étapes déjà passées restent telles quelles, et un saut se fige à l'entrée de la place où il
     joue. Le chemin, la grille et la voie se gardent dans la préférence `parcoursCommentaires`,
     pour « Reprendre » ; « Commencer » et « Refaire » repartent d'un chemin neuf.

   CE QUE LE MOTEUR N'A PAS, CONTOURNÉ SANS LE REFONDRE (lot « Les deux parcours »)
     · un bouton de bulle qui ne paraît qu'à une condition (« Continuer » des étapes 3 à 6) :
       la sonde de l'étape (`atteint`, appelée toutes les 120 ms) montre ou cache le bouton ;
   ================================================================= */
(function () {
    'use strict';

    var ID = 'commentaires';
    var CLE_CTX = 'parcoursCommentaires';
    var M = function () { return window.ParcoursMoteur; };

    var REFUS = 'Commence par « Évaluer une première production » : il te faut une production et sa grille pour automatiser tes commentaires.';

    // ---------- Les bulles, mot pour mot (validées le 8 nov., 17 h 13 à 17 h 38) ----------

    var TEXTES = {
        grille: {
            titre: "Ta grille",
            texte: "Un critère algorithmique calcule sa note à partir de ce que tu relèves et comptes dans la production de chaque étudiant·e, et il écrit à ta place le commentaire qui convient à chaque cas. Il prend place dans une grille, seul ou à côté de tes autres critères. Choisis dans le menu en haut de la page la grille de ta prochaine production, ou touche « + Nouvelle grille ». Ajoute ce critère avant d'évaluer cette production : les évaluations déjà enregistrées garderaient leur note sans lui, et les productions ne seraient pas toutes évaluées sur les mêmes critères.",
            geste: "Ajoute un critère, nomme-le, puis choisis « Algorithmique » dans son menu « Type » : l'atelier du critère s'ouvre.",
        },
        compte: {
            titre: "Ce que tu comptes",
            texte: "Voici l'atelier de ton critère. En haut, ses cinq étapes, à faire dans l'ordre : une coche marque celles qui sont réglées, un point d'exclamation celles qui t'attendent. Commence par nommer ce que tu relèves dans une production et ce à quoi tu rapportes ce compte : des erreurs sur des mots, des unités manquantes sur des calculs, ou ce qui convient à ta discipline. Écris chaque nom au singulier et au pluriel : l'étudiant·e les lira dans la phrase qui lui donne son compte, et dans son PDF.",
            geste: "Écris les quatre formes.",
        },
        codes: {
            titre: "Tes codes",
            texte: "Tes codes sont les catégories de ce que tu relèves : chacun a un numéro, que tu poseras sur la production, et un nom. Ajoute un sous-critère par code. Sa pondération dit ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié. Ouvre son « Observation » et écris ce que l'étudiant·e lira à propos de ce code : sa rétroaction reprend les trois codes les plus fréquents de sa production, avec leur nombre et leur observation. Tu enseignes le français écrit ? « Partir de la liste du français écrit » crée d'un coup dix codes, que tu modifies ensuite.",
            geste: "Ajoute tes codes, puis touche « Continuer ».",
        },
        note: {
            titre: "Ta note",
            texte: "Donne d'abord au critère sa pondération, à côté de son type : c'est sa part dans la note de la grille. Si ta grille a d'autres critères, l'étape « Pondération », en tête de la fiche, te dit si le total tombe juste. Choisis ensuite comment ce que tu comptes construit la note. Trois calculs sont prêts : une pénalité proportionnelle à la longueur, où le même compte coûte moins dans une production plus longue ; un rapport visé, où une occurrence à chaque 60 mots, par exemple, donne la note entière ; une pénalité fixe, où chaque occurrence retire les mêmes points. Le premier est choisi au départ. Ajuste le réglage de celui que tu retiens : la carte montre aussitôt la note d'une production fictive.",
            geste: "Écris la pondération, choisis ton calcul, puis touche « Continuer ».",
        },
        cas: {
            titre: "Tes cas",
            texte: "Un compte seul ne dit pas si c'est beaucoup. Si tu as une limite en tête, fixe-la : une longueur de référence et la tolérance sur cette longueur, par exemple au plus 4 unités manquantes pour 12 calculs. L'application situe alors chaque production dans des paliers, de « Aucune occurrence » à « Au-delà », et l'étudiant·e lit la phrase du palier où tombe sa production. Réécris ces phrases avec tes mots. Pas de limite ? Laisse l'étape telle quelle : la phrase du compte suffit. La simulation montre ce que lirait l'étudiant·e : change le compte de la production fictive, ou touche « Voir ce que l'étudiant·e lirait à ce palier ».",
            geste: "Fixe ta limite si tu en as une, relis la simulation, puis touche « Continuer ».",
        },
        lit: {
            titre: "Ce que l'étudiant·e lit",
            texte: "Voici les phrases que l'application écrira à ta place sur chaque production. La première donne le compte, sous le critère et dans le PDF de l'étudiant·e : « Ta production contient… ». Les deux autres s'écrivent dans son bilan, selon le cas : quand la note de ce critère tombe à 0, et quand tous les critères de la grille sont maîtrisés. Les blocs, comme le compte ou le nom du critère, se remplissent à l'évaluation. Tu peux réécrire tout le reste, et poser d'autres blocs depuis la palette, là où est ton curseur. « Revenir au modèle » remet la phrase de départ. Si le nom de ton critère contient « français », ces phrases partent du modèle « Français écrit » : choisis « Générique » au menu « Modèle des phrases » pour que tes noms y paraissent. Ta grille est nouvelle ? Donne-lui un nom (il s'imprime dans le PDF de tes étudiant·es), puis touche « Créer la grille ». Une grille existante s'enregistre d'elle-même.",
            geste: "Relis tes phrases, puis touche « Continuer », ou « Créer la grille » pour une grille nouvelle.",
        },
        production: {
            titre: "Ta production",
            texte: "Ta grille est prête : relie-la maintenant à la production qu'elle évaluera. Choisis ta prochaine production dans le menu en haut de la page, ou crée-la avec « + Nouvelle production », comme ta première. Dans « Grille de critères d'évaluation », choisis la grille que tu viens de régler. Choisis une production que tu n'as pas encore évaluée : une production déjà évaluée garde la grille de ses évaluations. Garde une échelle de performance : elle traduit la note de ce critère en niveau, comme pour tes autres critères. La cartouche, elle, ne sert pas à ce critère : il écrit ses phrases seul.",
            geste: "Choisis ta grille ; pour une production nouvelle, touche ensuite « Créer la production ».",
        },
        productions: {
            titre: "Tes productions",
            texte: "Pour poser tes codes, il te faut les productions de tes étudiant·es dans l'application. Dépose leurs fichiers ici, vérifie l'étudiant·e de chacun, puis touche « Importer ». Une fois tes fichiers déposés, choisis bien, dans l'Inspecteur, la production à laquelle tu viens d'associer ta grille : elle s'applique à tout le lot. Le parcours « Recevoir les productions, rendre tes rétroactions » détaille chacun de ces gestes. Tes productions sont sans fichier ? Touche « Rien à importer » : tu taperas ton compte à l'évaluation.",
            geste: "Importe au moins une production, ou touche « Rien à importer ».",
        },
        poser: {
            titre: "Poser tes codes",
            texte: "Dans la liste, touche « Actions › Annoter » sur la ligne d'une production importée. La palette « Codes » porte les codes de ta grille. Touche un code, puis l'endroit de la production où tu l'observes : son numéro s'y pose, dans sa couleur. Sur un clavier, la touche de son numéro le choisit aussi (0 pour le code 10). Chaque code posé compte : leur nombre paraît dans la palette, et le compte du critère se fait tout seul, chaque code selon sa pondération. Les codes identifient des éléments de la production ; les tampons, eux, la commentent : tu peux poser les deux.",
            geste: "Pose tes codes, puis touche « Annoter ▾ », en haut de la production, et choisis « Évaluer ».",
        },
        retro: {
            titre: "Ta rétroaction s'écrit seule",
            texte: "Dans « Évaluation », ton critère algorithmique porte déjà le compte de tes codes. Écris ce à quoi tu le rapportes, par exemple le nombre de mots ou de calculs de cette production : sans ce nombre, la note ne se calcule pas, sauf avec une pénalité fixe. Évalue tes autres critères comme d'habitude. Ouvre ensuite la palette « Rétroaction ». Sous ton critère, tu trouves la phrase du compte et, si tu as fixé une limite, celle de son palier ; dans « Spécifique », ses trois codes les plus fréquents, avec leur observation ; et son PDF nommera, sous « Points récurrents », le code qui revient le plus. Tu n'as écrit aucune phrase pour cette production : tout vient de tes règles. Relis-la comme ton étudiant·e la lira. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Puis touche le cadenas « Verrouiller », en haut de « Paramètres ».",
            geste: "Écris ce nombre, relis la rétroaction, puis verrouille.",
        },
        retroSans: {
            titre: "Ta rétroaction s'écrit seule",
            texte: "Pas besoin d'importer : touche « Actions › Évaluer » sur la ligne de l'étudiant·e. Dans le panneau « Critères », ton critère algorithmique attend deux nombres : ton compte, et ce à quoi tu le rapportes, par exemple le nombre de mots ou de calculs de sa production. Tapé, ton compte vaut tel quel : la pondération de tes codes ne s'applique pas. Évalue tes autres critères comme d'habitude. Regarde ensuite la rétroaction, à côté : sous ton critère, tu trouves la phrase du compte et, si tu as fixé une limite, celle de son palier. Sans codes posés, l'application ne sait pas lesquels reviennent : ni « Spécifique » ni « Bilan » ne les nomment. Tu n'as écrit aucune phrase pour cette production : tout vient de tes règles. Relis-la comme ton étudiant·e la lira. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Puis touche le cadenas « Verrouiller », en haut de « Paramètres ».",
            geste: "Tape tes deux nombres, relis la rétroaction, puis verrouille.",
        },
        loin: {
            titre: "Pour aller plus loin",
            texte: "Te voilà avec une première rétroaction écrite à partir de tes règles. Chaque production que tu évalueras avec cette grille recevra la sienne de la même façon. Tu n'as rien de plus à faire ; si tu veux aller plus loin, à ton rythme, tout se trouve dans l'atelier du critère. « Montrer d'où vient chaque phrase », dans la simulation, et l'encadré « Ce que l'application choisit sans toi », dans l'étape « Cas d'interprétation », disent comment chaque phrase se construit. Une table de cas ajoute un texte selon une valeur de la production, comme la note ou le code le plus fréquent. « Composer ton propre calcul » va au-delà des trois calculs prêts. Un palier peut nommer un service d'aide, ou te signaler l'étudiant·e à côté de son niveau RàI. « Enregistrer ces paliers sous un nom… » les garde pour une autre grille. Pour un prochain critère, crée-le dans Grilles : tant qu'il n'a aucun code, Conception › Mon matériel y colle d'un coup une liste tirée d'un tableur.",
            geste: "Touche « Terminer ».",
        }
    };

    // ---------- Ce que le parcours lit (il n'écrit jamais dans les données) ----------

    function enDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    /** Le groupe-cours actif est réel : ni la démo, ni un service d'orthopédagogie. */
    function groupeCoursReel() {
        if (enDemo()) return false;
        if (!(typeof obtenirIdContexteActif === 'function' && obtenirIdContexteActif())) return false;
        return !(typeof contexteActifEstService === 'function' && contexteActifEstService());
    }

    function lireCle(nom, defaut) {
        if (typeof db === 'undefined' || typeof cle !== 'function') return defaut;
        var v = db.getSync(cle(nom), defaut);
        return v == null ? defaut : v;
    }

    function grilles() { return [].concat(lireCle('grillesTemplates', []) || []); }
    function grilleExiste(id) { return !!id && grilles().some(function (g) { return g && g.id === id; }); }

    /** Les productions du groupe-cours actif (le filtre du cours, celui de toute l'application). */
    function productions() {
        var p = typeof obtenirDonneesSelonMode === 'function' ? obtenirDonneesSelonMode('productions') : lireCle('productions', []);
        return Array.isArray(p) ? p.filter(Boolean) : [];
    }

    function productionsDeLaGrille(grilleId) {
        if (!grilleId) return [];
        return productions().filter(function (p) { return p.grilleId === grilleId; });
    }

    /** La condition d'entrée : une production avec sa grille, dans le groupe-cours actif réel. */
    function refus() {
        if (!groupeCoursReel()) return REFUS;
        return productions().some(function (p) { return grilleExiste(p.grilleId); }) ? '' : REFUS;
    }

    /** Les productions importées (des fichiers) pour ces productions, dans le groupe-cours actif. */
    function fichiersImportes(prods) {
        var S = window.travauxStockage;
        if (!S || typeof S.obtenirFichiersProduction !== 'function') return [];
        return (prods || []).reduce(function (tout, p) { return tout.concat(S.obtenirFichiersProduction(p.id) || []); }, []);
    }

    function evaluationsVerrouillees(prods) {
        var ids = (prods || []).map(function (p) { return p.id; });
        return [].concat(lireCle('evaluationsSauvegardees', []) || []).filter(function (e) {
            return e && e.verrouillee === true && ids.indexOf(e.productionId) !== -1;
        }).map(function (e) { return e.id; });
    }

    // ---------- Le contexte du parcours (sa préférence ; jamais les données de la personne) ----------

    function lireCtx() {
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? Object.assign({}, v) : {};
    }

    function ecrireCtx(c) {
        if (typeof definirPreference === 'function') definirPreference(CLE_CTX, c);
    }

    // ---------- La page ----------

    function sectionCourante() {
        return typeof sectionActive !== 'undefined' ? sectionActive : null;
    }

    function sousSectionVisible(id) {
        var el = document.getElementById(id);
        return !!(el && M().visible(el));
    }

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    // Compte ses tours plutôt que l'heure : sous une horloge figée (les bancs), Date.now() ne bouge pas.
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

    function $(sel, racine) { return (racine || document).querySelector(sel); }
    function vis(el) { return el && M().visible(el) ? el : null; }

    // ---------- Conception › Grilles et l'atelier du critère ----------

    function ficheOuverte() {
        var c = document.getElementById('conteneurEditionGrille');
        return !!(c && !c.classList.contains('u-hide') && sousSectionVisible('conception-grille-criteres'));
    }

    /** La grille ouverte, enregistrée (null en création, ou fiche fermée). */
    function grilleOuverte() {
        if (!ficheOuverte()) return null;
        return typeof grilleTemplateActuelle !== 'undefined' && grilleTemplateActuelle ? grilleTemplateActuelle : null;
    }

    function enCreation() { return ficheOuverte() && !grilleOuverte(); }

    /** Les critères de la fiche ouverte : ceux de la création en cours, ou ceux de la grille enregistrée (relus). */
    function criteresDeLaFiche() {
        if (enCreation()) return Array.isArray(window.tempCriteres) ? window.tempCriteres : [];
        var g = grilleOuverte();
        if (!g) return [];
        var frais = grilles().find(function (x) { return x && x.id === g.id; });
        return (frais || g).criteres || [];
    }

    /**
     * L'atelier du premier critère algorithmique de la grille ouverte : les codes ne vont qu'à lui (#1132).
     * Le critère se lit sur l'atelier (`_critere`, posé par atelierAlgo.monter) ; un atelier redessiné sans
     * lui (mesuré : la bulle restait sur l'étape 2, le parcours croyant l'atelier parti) le reprend des données.
     */
    function atelier() {
        if (!ficheOuverte()) return null;
        var a = $('#listeCriteres .gabarit-algo[data-atelier-algo]');
        return a && critereDe(a) ? a : null;
    }

    function critereDe(a) {
        if (a._critere) return a._critere;
        var c = criteresDeLaFiche()[parseInt(a.dataset.atelierAlgo, 10)];
        return c && c.type === 'algorithmique' ? c : null;
    }

    function critere() { var a = atelier(); return a ? critereDe(a) : null; }

    function etapesAtelier() {
        var a = atelier();
        if (!a || !window.atelierAlgo) return [];
        return window.atelierAlgo.etapes(critereDe(a), (a._ctx && a._ctx.criteres) || criteresDeLaFiche());
    }

    function reglee(id) {
        return etapesAtelier().some(function (e) { return e.id === id && e.reglee; });
    }

    function sectionAtelier(id) {
        var a = atelier();
        return a ? a.querySelector('.atelier-algo-etape[data-etape="' + id + '"]') : null;
    }

    function corpsAtelier(id) {
        var s = sectionAtelier(id);
        return s ? s.querySelector('.atelier-algo-etape-corps') : null;
    }

    /** La carte d'un critère, dans la fiche : son en-tête porte le nom, le « Type » et la pondération. */
    function carteDuCritere(a) {
        var el = a || atelier();
        if (!el) return null;
        // Dans une grille enregistrée, l'atelier n'est pas dans la carte : on la retrouve par le rang du critère.
        var menu = $('#listeCriteres select[data-on-change^="modifierTypeCritere"][data-critere-index="' + el.dataset.atelierAlgo + '"]');
        return (menu && menu.closest('.item-liste')) || el.closest('.item-liste');
    }

    function menuType(carte) {
        return carte ? carte.querySelector('select[data-on-change^="modifierTypeCritere"]') : null;
    }

    function champPonderation(carte) {
        return carte ? carte.querySelector('input[data-on-change="modifierPonderationCritereTempHandler"], input[data-on-change="modifierCritereGrilleHandler"][data-champ="ponderation"]') : null;
    }

    function cartesDesCriteres() {
        return [].slice.call(document.querySelectorAll('#listeCriteres .item-liste')).filter(function (el) { return !!menuType(el); });
    }

    function ouvrirEtape(id) {
        var a = atelier(), s = sectionAtelier(id);
        if (a && a._critere && s && !s.hasAttribute('data-ouverte') && window.atelierAlgo) window.atelierAlgo.ouvrir(a, id, false);
    }

    /**
     * Ramène la fiche de la grille du parcours (après un rechargement, « Reprendre » la trouve fermée).
     * Une grille en création qu'un rechargement a perdue ne se retrouve pas : le parcours repart de
     * l'étape 1, où l'on choisit la grille.
     */
    async function assurerAtelier(id) {
        aller('conception', 'grille-criteres');
        await attendre(function () { return sousSectionVisible('conception-grille-criteres'); }, 2000);
        // La fiche se redessine après chaque changement enregistré (le « Type », un nom) : l'atelier peut
        // manquer un instant. On l'attend d'abord ; la fiche ne se rouvre que si elle est fermée (après un
        // rechargement) — la rouvrir pendant qu'on écrit effacerait ce qu'on vient de taper.
        await attendre(atelier, 1500);
        var c = lireCtx();
        if (!atelier() && !ficheOuverte() && c.grilleId && grilleExiste(c.grilleId) && typeof chargerGrillePourModif === 'function') {
            await chargerGrillePourModif(c.grilleId);
            await attendre(atelier, 2000);
        }
        if (!atelier()) { M().allerA(0); return; }
        ouvrirEtape(id);
    }

    // ---------- Ce qu'attend « Continuer » (le moteur : `attend`, 11 nov. 2026, captures 32 et 33) ----------
    // PROPOSÉ (11 nov. 2026, à valider par Grégoire) : les phrases lues sous « Continuer », inactif tant que manque ce
    // qu'elles disent. Le bouton ne se cache plus : « je ne sais pas ce qu'il faut faire pour voir le bouton ».
    var ATTENTES = {
        codes: "Pour continuer, ajoute un premier code : touche « + Ajouter un sous-critère ».",
        ponderation: "Pour continuer, écris la pondération de ton critère, à côté de son type.",
        calcul: "Pour continuer, règle ton calcul : son réglage doit dépasser 0.",
        limite: "Pour continuer, écris la longueur de référence et la tolérance, ou touche « Retirer la limite ».",
        grille: "Pour continuer, donne un nom à ta grille, puis touche « Créer la grille »."
    };

    function nombreDeCodes() {
        var c = critere(), C = window.codesAnnotation;
        return c && C && typeof C.apercuCodes === 'function' ? C.apercuCodes(c).length : 0;
    }

    function ponderationManque() {
        var p = champPonderation(carteDuCritere());
        return !!p && !(Number(p.value) > 0);
    }

    /** La limite fixée, son premier nombre encore vide (la longueur, puis la tolérance) : le geste suivant. */
    function champDeLimiteVide() {
        var corps = corpsAtelier('paliers');
        if (!corps || reglee('paliers')) return null;
        var champs = ['motsReference', 'erreursTolerees'].map(function (k) { return vis(corps.querySelector('[data-param-cle="' + k + '"]')); });
        return champs.find(function (c) { return c && !(Number(c.value) > 0); }) || null;
    }

    function suivante() {
        var i = M().etapeCourante();
        if (i !== null) M().allerA(i + 1);
    }

    /** Le plus petit élément qui contient tous ceux-là (le contour d'un groupe de champs). */
    function ancetreCommun(els) {
        var liste = (els || []).filter(Boolean);
        if (!liste.length) return null;
        var a = liste[0].parentElement;
        while (a && !liste.every(function (el) { return a.contains(el); })) a = a.parentElement;
        return a;
    }

    function boutonQuiDit(racine, mots) {
        if (!racine) return null;
        var b = racine.querySelectorAll('button');
        for (var k = 0; k < b.length; k++) if (b[k].textContent.indexOf(mots) !== -1 && M().visible(b[k])) return b[k];
        return null;
    }

    // ---------- Étape 1 : la grille, et le critère qu'on y ajoute ----------

    // Les critères déjà là quand la fiche a paru dans l'étape : ceux d'après sont ceux qu'on ajoute.
    var cartesAuDepart = { cle: null, n: 0 };

    function cleDeLaFiche() {
        if (!ficheOuverte()) return null;
        var g = grilleOuverte();
        return g ? 'grille:' + g.id : 'creation';
    }

    function carteAjoutee() {
        var k = cleDeLaFiche();
        if (!k) return null;
        var cartes = cartesDesCriteres();
        if (cartesAuDepart.cle !== k) cartesAuDepart = { cle: k, n: k === 'creation' ? 0 : cartes.length };
        return cartes.length > cartesAuDepart.n ? cartes[cartes.length - 1] : null;
    }

    function rangeeDesGrilles() {
        var e = document.getElementById('selectionGrilles');
        return e ? e.closest('.rangee-selection') : null;
    }

    function boutonAjouterCritere() {
        return vis($('#conteneurEditionGrille [data-action="ajouterCritereTemp"], #conteneurEditionGrille [data-action="ajouterCritereGrille"]'));
    }

    // ---------- Les étapes 7 à 10 : la production, ses fichiers, les codes, l'évaluation ----------

    function grilleDuParcours() {
        var c = lireCtx();
        return c.grilleId || (grilleOuverte() ? grilleOuverte().id : null);
    }

    function productionsDuParcours() { return productionsDeLaGrille(grilleDuParcours()); }

    function critereAlgoDuParcours() {
        var g = grilles().find(function (x) { return x && x.id === grilleDuParcours(); });
        var cs = g && Array.isArray(g.criteres) ? g.criteres : [];
        return cs.find(function (x) { return x && x.type === 'algorithmique'; }) || null;
    }

    function fichierOuvert() {
        var v = window.travauxVisionneuse;
        var f = v && typeof v.getFichierActuel === 'function' ? v.getFichierActuel() : null;
        return f && f.id ? f : null;
    }

    function mode() {
        return window.travauxUI && typeof window.travauxUI.getModeCourant === 'function' ? window.travauxUI.getModeCourant() : null;
    }

    function idsDuParcours() { return productionsDuParcours().map(function (p) { return p.id; }); }

    function annoterOuvert() {
        var f = fichierOuvert();
        return !!(f && idsDuParcours().indexOf(f.productionId) !== -1 && sousSectionVisible('evaluations-annoter'));
    }

    /** L'évaluation sans fichier (« Actions › Évaluer » sans production importée) : trois panneaux, pas de palettes. */
    function evaluationSansFichier() {
        var e = document.getElementById('evaluations-contenu-evaluation');
        if (!e || e.classList.contains('u-hide') || !sousSectionVisible('evaluations-annoter')) return false;
        if ($('#travaux-palette-eval-gauche')) return false;
        var s = document.getElementById('selectProduction1');
        return !!(s && idsDuParcours().indexOf(s.value) !== -1);
    }

    /** L'évaluation en cours porte sur une production du parcours (avec ou sans fichier). */
    function evaluationOuverte() {
        if (evaluationSansFichier()) return true;
        var f = fichierOuvert();
        return !!(mode() === 'evaluer' && $('#travaux-palette-eval-gauche') && f && idsDuParcours().indexOf(f.productionId) !== -1);
    }

    /** Le menu « Actions » d'une ligne de la liste qui offre ce geste sur une production du parcours. */
    function menuActions(geste) {
        var ids = idsDuParcours();
        var lignes = document.querySelectorAll('#evaluations-liste tr[data-production-id]');
        for (var k = 0; k < lignes.length; k++) {
            if (ids.indexOf(lignes[k].dataset.productionId) === -1) continue;
            var s = lignes[k].querySelector('select.eval-actions-select');
            if (s && M().visible(s) && s.querySelector('option[value^="' + geste + '|"]')) return s;
        }
        return null;
    }

    function palette(id) { return vis(document.getElementById(id)); }

    function champAlgo(prefixe) {
        var c = critereAlgoDuParcours();
        return c ? vis(document.getElementById(prefixe + c.id)) : null;
    }

    function vide(champ) { return !!champ && String(champ.value || '').trim() === ''; }

    /** Où toucher dans le mode Évaluer : les nombres, puis la palette « Rétroaction » si elle est repliée, puis le verrou. */
    function contourEvaluation(avecCompte) {
        if (avecCompte && vide(champAlgo('eval_erreurs_'))) return champAlgo('eval_erreurs_');
        if (vide(champAlgo('eval_mots_'))) return champAlgo('eval_mots_');
        var r = palette('travaux-palette-eval-retro');
        if (r && r.classList.contains('replie')) return r.querySelector('[data-action="travauxUI.togglePaletteEvalReplie"]') || r;
        return vis(document.getElementById('btnVerrouillerEvaluation'));
    }

    /** Les palettes du mode Évaluer ; sans fichier, les trois panneaux qui en tiennent lieu. */
    function zonesEvaluation() {
        var p = ['travaux-palette-eval-droite', 'travaux-palette-eval-retro', 'travaux-palette-eval-gauche'].map(palette).filter(Boolean);
        if (p.length) return p;
        return ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'].map(palette).filter(Boolean);
    }

    function verrouNeuf() {
        var avant = lireCtx().verrousAvant || [];
        return evaluationsVerrouillees(productionsDuParcours()).some(function (id) { return avant.indexOf(id) === -1; });
    }

    function retenirVerrous() {
        var c = lireCtx();
        if (!Array.isArray(c.verrousAvant)) {
            c.verrousAvant = evaluationsVerrouillees(productionsDuParcours());
            ecrireCtx(c);
        }
    }

    // ---------- Les étapes ----------

    var ETAPES = {
        grille: Object.assign({}, TEXTES.grille, {
            avant: async function () {
                aller('conception', 'grille-criteres');
                await attendre(function () { return sousSectionVisible('conception-grille-criteres'); }, 2000);
                // Une grille enregistrée restée ouverte se referme (rien ne s'écrit : elle s'enregistre
                // d'elle-même) : la personne choisit celle de sa prochaine production. Une création en
                // cours reste là.
                if (grilleOuverte() && !atelier() && typeof annulerFormGrille === 'function') annulerFormGrille();
                cartesAuDepart = { cle: null, n: 0 };
                window.scrollTo(0, 0);
            },
            zones: function () {
                if (!ficheOuverte()) return [rangeeDesGrilles()];
                var c = carteAjoutee();
                return [c || boutonAjouterCritere()];
            },
            contour: function () {
                if (!ficheOuverte()) return rangeeDesGrilles();
                var c = carteAjoutee();
                return c ? menuType(c) : boutonAjouterCritere();
            },
            atteint: function () { return !!atelier(); }
        }),
        compte: Object.assign({}, TEXTES.compte, {
            // Ce que la bulle ne couvre que faute de mieux (11 nov. 2026 : la règle de `bulleHors`, retirée, passe au moteur).
            aussiEviter: function () { var a = atelier(); return [a && a.querySelector('.atelier-algo-chaine')]; },
            avant: function () { return assurerAtelier('compte'); },
            zones: function () { var a = atelier(); return a ? [a.querySelector('.atelier-algo-chaine'), sectionAtelier('compte')] : []; },
            contour: function () {
                var corps = corpsAtelier('compte');
                return corps ? ancetreCommun([].slice.call(corps.querySelectorAll('input[type="text"]'))) : null;
            },
            atteint: function () {
                return reglee('compte');
            }
        }),
        codes: Object.assign({}, TEXTES.codes, {
            avant: function () { return assurerAtelier('codes'); },
            zones: function () { return [sectionAtelier('codes')]; },
            contour: function () { return boutonQuiDit(corpsAtelier('codes'), 'Ajouter un sous-crit'); },
            boutons: [{ libelle: 'Continuer', primaire: true, action: suivante,
                attend: function () { return nombreDeCodes() > 0 ? '' : ATTENTES.codes; } }],
            atteint: function () { return false; }
        }),
        note: Object.assign({}, TEXTES.note, {
            avant: function () { return assurerAtelier('note'); },
            zones: function () { return [champPonderation(carteDuCritere()), sectionAtelier('note')]; },
            contour: function () {
                var p = champPonderation(carteDuCritere());
                if (p && !(Number(p.value) > 0)) return p;
                var corps = corpsAtelier('note');
                return corps ? (corps.querySelector('.formules-algo, .gabarit-algo-formules, [role="radiogroup"]')
                    || ancetreCommun([].slice.call(corps.querySelectorAll('input[type="radio"]')))) : null;
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: suivante,
                attend: function () { return reglee('note') ? '' : (ponderationManque() ? ATTENTES.ponderation : ATTENTES.calcul); } }],
            atteint: function () { return false; }
        }),
        cas: Object.assign({}, TEXTES.cas, {
            // Ce que la bulle ne couvre que faute de mieux (11 nov. 2026 : la règle de `bulleHors`, retirée, passe au moteur).
            // « ou touche « Retirer la limite » » (la phrase sous « Continuer », 11 nov. 2026) : la bulle ne le couvre pas non plus.
            aussiEviter: function () {
                var a = atelier();
                return [a ? vis(a.querySelector('.apercu-algo')) : null, champDeLimiteVide() ? boutonQuiDit(corpsAtelier('paliers'), 'Retirer la limite') : null];
            },
            avant: function () { return assurerAtelier('paliers'); },
            zones: function () { var a = atelier(); return [sectionAtelier('paliers'), a ? a.querySelector('.apercu-algo') : null]; },
            contour: function () {
                // La limite fixée et incomplète : son premier nombre vide, un geste à la fois (capture 33).
                var vide = champDeLimiteVide();
                if (vide) return vide;
                var fixer = boutonQuiDit(corpsAtelier('paliers'), 'Fixer une limite');
                if (fixer) return fixer;
                var a = atelier();
                return a ? vis(a.querySelector('.apercu-algo')) : null;
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: suivante,
                attend: function () { return reglee('paliers') ? '' : ATTENTES.limite; } }],
            atteint: function () { return false; }
        }),
        lit: Object.assign({}, TEXTES.lit, {
            // Ce que la bulle ne couvre que faute de mieux (11 nov. 2026 : la règle de `bulleHors`, retirée, passe au moteur).
            aussiEviter: function () { return [enCreation() ? vis(document.getElementById('nomGrilleTemplate')) : null]; },
            avant: function () { return assurerAtelier('eleve'); },
            // Une grille nouvelle : le nom et « Créer la grille » restent touchables ; le contour est sur les
            // trois phrases, puis sur « Créer la grille » dès que la grille a un nom (la consigne : « puis »).
            zones: function () {
                var z = [sectionAtelier('eleve')];
                if (enCreation()) z.push(vis(document.getElementById('nomGrilleTemplate')), vis(document.getElementById('btnCreerGrille')));
                return z;
            },
            contour: function () {
                var nom = vis(document.getElementById('nomGrilleTemplate'));
                if (enCreation() && nom && !vide(nom)) return vis(document.getElementById('btnCreerGrille'));
                return corpsAtelier('eleve');
            },
            boutons: [{ libelle: 'Continuer', primaire: true, action: suivante,
                attend: function () { return enCreation() ? ATTENTES.grille : ''; } }],
            atteint: function () {
                if (enCreation()) { creationVue = true; return false; }
                // Une grille nouvelle : l'étape avance quand elle est créée (« Créer la grille » peut refuser).
                var g = grilleOuverte();
                return !!(creationVue && g && grilleExiste(g.id) && atelier());
            }
        }),
        production: Object.assign({}, TEXTES.production, {
            avant: async function () {
                aller('conception', 'productions');
                await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
                window.scrollTo(0, 0);
            },
            zones: function () {
                var g = vis(document.getElementById('champGrille'));
                if (g) return [g];
                var r = document.getElementById('conception-productions');
                return r ? [r.querySelector('.rangee-selection')] : [];
            },
            contour: function () {
                var s = vis(document.getElementById('productionGrille'));
                if (s) return s;
                var r = document.getElementById('conception-productions');
                return r ? vis(r.querySelector('.rangee-selection')) : null;
            },
            atteint: function () { return productionsDuParcours().length > 0; }
        }),
        productions: Object.assign({}, TEXTES.productions, {
            avant: async function () {
                aller('evaluations', 'importer');
                await attendre(function () { return !!vis(document.getElementById('travaux-drop-zone')); }, 2000);
                window.scrollTo(0, 0);
            },
            zones: function () { return [document.getElementById('travaux-drop-zone')]; },
            contour: function () { return vis(document.getElementById('travaux-drop-zone')); },
            boutons: [{ libelle: 'Rien à importer', action: function () {
                var c = lireCtx();
                c.sansFichier = true;
                ecrireCtx(c);
                suivante();
            } }],
            atteint: function () { return fichiersImportes(productionsDuParcours()).length > 0; }
        }),
        poser: Object.assign({}, TEXTES.poser, {
            // Ce que la bulle ne couvre que faute de mieux (11 nov. 2026 : la règle de `bulleHors`, retirée, passe au moteur).
            aussiEviter: function () {
                return annoterOuvert() ? [palette('travaux-palette-erreurs-fr'), vis(document.getElementById('travaux-btn-actions'))] : [];
            },
            avant: async function () {
                if (annoterOuvert() || evaluationOuverte()) return;
                aller('evaluations', 'liste');
                await attendre(function () { return !!menuActions('annoter'); }, 3000);
            },
            zones: function () {
                // La production elle-même reste touchable : on y pose les codes.
                // « Annoter ▾ » et son menu aussi : le geste suivant y passe (« … puis touche « Annoter ▾ », en haut de la production, et choisis « Évaluer » »).
                if (annoterOuvert()) {
                    return [palette('travaux-palette-erreurs-fr'), vis(document.getElementById('travaux-canvas-annotation')),
                        vis(document.getElementById('travaux-btn-actions')), vis(document.getElementById('travaux-actions-dropdown'))];
                }
                var s = menuActions('annoter');
                return s ? [s.closest('tr')] : [];
            },
            contour: function () {
                if (annoterOuvert()) return palette('travaux-palette-erreurs-fr') || vis(document.getElementById('travaux-btn-actions'));
                return menuActions('annoter');
            },
            // Sur la Liste, « Actions › Annoter » : la bulle le nomme, la flèche y va (11 nov. 2026, 9 h 47).
            nommeLeContour: function () { return !annoterOuvert() && !evaluationOuverte(); },
            atteint: function () {
                return evaluationOuverte();
            }
        }),
        retro: Object.assign({}, TEXTES.retro, {
            avant: async function () {
                retenirVerrous();
                if (evaluationOuverte()) return;
                aller('evaluations', 'liste');
                await attendre(function () { return !!menuActions('annoter'); }, 3000);
            },
            zones: function () {
                if (evaluationOuverte()) return zonesEvaluation();
                var s = menuActions('annoter');
                return s ? [s.closest('tr')] : [];
            },
            contour: function () { return evaluationOuverte() ? contourEvaluation(false) : menuActions('annoter'); },
            nommeLeContour: function () { return !evaluationOuverte(); },   // « Actions › Annoter » sur la Liste (11 nov. 2026)
            atteint: function () {
                return verrouNeuf();
            }
        }),
        retroSans: Object.assign({}, TEXTES.retroSans, {
            avant: async function () {
                retenirVerrous();
                if (evaluationOuverte()) return;
                aller('evaluations', 'liste');
                await attendre(function () { return !!menuActions('evaluer'); }, 3000);
            },
            zones: function () {
                if (evaluationOuverte()) return zonesEvaluation();
                var s = menuActions('evaluer');
                return s ? [s.closest('tr')] : [];
            },
            contour: function () { return evaluationOuverte() ? contourEvaluation(true) : menuActions('evaluer'); },
            nommeLeContour: function () { return !evaluationOuverte(); },   // « Actions › Évaluer » sur la Liste (11 nov. 2026)
            atteint: function () {
                return verrouNeuf();
            }
        }),
        loin: Object.assign({}, TEXTES.loin, {
            centre: true,
            sansSortie: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        })
    };

    // Vu en création pendant l'étape 6 : la grille est nouvelle, l'étape attend qu'elle soit créée.
    var creationVue = false;

    // ---------- Le chemin : les étapes qui s'appliquent, dans l'ordre de la consigne ----------

    var ORDRE = ['grille', 'compte', 'codes', 'note', 'cas', 'lit', 'production', 'productions', 'poser', 'retro', 'retroSans', 'loin'];

    /** Ce que les données disent aujourd'hui des étapes 7 et 8 (une étape déjà figée ne bouge plus). */
    function sautsPrevus(c) {
        // La grille du parcours seulement (surEtape la tient à jour) : pas une fiche restée ouverte au lancement.
        var prods = productionsDeLaGrille(c.grilleId);
        var saute7 = typeof c.saute7 === 'boolean' ? c.saute7 : prods.length > 0;
        // L'étape 8 se juge sur les productions qui portent la grille à l'entrée de sa place : une
        // production associée à l'étape 7 et déjà importée la fait sauter aussi (relecture neuve, 9 nov.).
        var saute8 = typeof c.saute8 === 'boolean' ? c.saute8 : fichiersImportes(prods).length > 0;
        return { saute7: saute7, saute8: saute8 };
    }

    function cheminDe(c, s) {
        var k = ['grille', 'compte', 'codes', 'note', 'cas', 'lit'];
        if (!s.saute7) k.push('production');
        if (!s.saute8) k.push('productions');
        if (c.sansFichier) k.push('retroSans');
        else k.push('poser', 'retro');
        k.push('loin');
        return k;
    }

    var DEF = { id: ID, etapes: [], lienSortie: 'Plus tard' };

    function poserChemin(cles) { DEF.etapes = cles.map(function (k) { return ETAPES[k]; }); }

    /**
     * LA GARDE DE L'ÉTAPE 1 (lot « Les flèches des parcours », 10 nov. 2026 : le voile du moteur est retiré). L'étape
     * demande d'ajouter un critère et de choisir son type. Le « Type » d'un critère DÉJÀ LÀ était sous le voile : changé,
     * il s'écrirait aussitôt dans la grille enregistrée et ferait avancer l'étape. Il ne répond pas le temps de l'étape :
     * le menu reprend sa valeur, le changement ne va pas plus loin. Le modèle de `garderOuvrir` (js/parcours-donnees.js).
     */
    function garderLeType(ev) {
        var m = M();
        if (!m || !m.joue(DEF) || DEF.etapes[m.etapeCourante()] !== ETAPES.grille) return;
        var menu = ev.target && ev.target.closest ? ev.target.closest('select[data-on-change^="modifierTypeCritere"]') : null;
        if (!menu) return;
        var ajoutee = carteAjoutee();
        if (ajoutee && ajoutee.contains(menu)) return;
        var avant = [].slice.call(menu.options).find(function (o) { return o.defaultSelected; });
        if (avant) menu.value = avant.value; else menu.selectedIndex = 0;
        ev.preventDefault();
        ev.stopPropagation();
    }
    // En capture sur window : avant le répartiteur des data-on-change (main.js, sur document).
    window.addEventListener('change', garderLeType, true);

    /**
     * À l'entrée de l'étape i (le moteur l'appelle avant de la lire) : le chemin se reconstruit,
     * les étapes 0 à i − 1 gardent leur place ; un saut se fige à l'entrée de la place où il joue.
     */
    function surEtape(i) {
        var c = lireCtx();
        var avant = Array.isArray(c.chemin) ? c.chemin.slice(0, i) : [];
        // Jusqu'à l'étape 6, la grille du parcours est celle de la fiche : aucune à l'étape 1 (elle n'est
        // pas encore choisie, et `avant` referme une fiche restée ouverte), aucune pendant une création.
        // Fiche fermée (« Reprendre » après un rechargement) : la grille retenue reste, l'étape la rouvre.
        if (i === 0) c.grilleId = null;
        else if (i <= ORDRE.indexOf('lit') + 1 && ficheOuverte()) c.grilleId = grilleOuverte() ? grilleOuverte().id : null;
        var s = sautsPrevus(c);
        var neuf = cheminDe(c, s);
        var cleEtape = neuf[i];
        var rang = ORDRE.indexOf(cleEtape);
        if (rang >= ORDRE.indexOf('production')) c.saute7 = s.saute7;
        if (rang >= ORDRE.indexOf('productions')) c.saute8 = s.saute8;
        // Les étapes passées ne changent pas : le préfixe reste celui qu'on a parcouru.
        if (avant.length === i && avant.join() !== neuf.slice(0, i).join()) neuf = avant.concat(neuf.slice(i));
        c.chemin = neuf;
        ecrireCtx(c);
        poserChemin(neuf);
        if (cleEtape === 'lit') creationVue = enCreation();
        window.Assistance.definirEtat(ID, 'en-cours', i);
    }

    // ---------- Le lancement, « Plus tard », la fin ----------

    async function lancer(depuis) {
        var e = window.Assistance.etatDe(ID);
        var reprise = e.etat === 'en-cours' && depuis > 0;
        var c = reprise ? lireCtx() : {};
        if (!reprise) ecrireCtx(c);
        var chemin = Array.isArray(c.chemin) && c.chemin.length ? c.chemin : cheminDe(c, sautsPrevus(c));
        poserChemin(chemin);
        var i = Math.min(reprise ? depuis : 0, chemin.length - 1);
        return M().lancer(DEF, {
            depuis: i,
            surEtape: surEtape,
            // « Plus tard » (et Échap) : la bulle se ferme ; le parcours attend dans le panneau.
            surQuitter: function () { window.Assistance.majMenu(); },
            // Le parcours se joue sur les vraies données : la démo ouverte en route le met en attente.
            verifier: function () { return !enDemo(); }
        });
    }

    function terminer() {
        window.Assistance.definirEtat(ID, 'fait', 0);
        ecrireCtx({});
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Automatiser tes commentaires',
        ligne: "De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.",
        // « Étape n sur N » : N est la longueur du chemin de la personne (étapes sautées hors du compte).
        get total() {
            var c = lireCtx();
            return Array.isArray(c.chemin) && c.chemin.length ? c.chemin.length : ORDRE.length - 1;
        },
        // Pas sur téléphone (file de Cowork, 9 nov. : à la fusion du groupe 3, avec la bulle sur téléphone).
        grandEcranSeulement: true,
        refus: refus,
        prealable: 'evaluer',
        lancer: lancer
    });

    // Pour les bancs : les étapes telles qu'elles sont posées, et le chemin courant.
    window.ParcoursCommentaires = { etapes: ETAPES, chemin: function () { return DEF.etapes.slice(); }, refus: refus };
})();
