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

    // ---------- Les bulles, mot pour mot (validées par Grégoire le 22 nov. 2026) ----------
    // plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 4.2 : dix bulles sur le chemin
    // complet, la variante sans fichier, mot pour mot ; tests/unit/sentinelle-parcours-commentaires-2026-11-22.test.js les
    // confronte à la consigne, dans les deux sens. Elles remplacent les douze textes du 8 nov.
    // Une bulle : `titre` ; `confirme` (en petit au-dessus du titre) ; `lieuSuite` (la suite de la phrase du lieu, que le
    // moteur ouvre par « Tu es dans « X », à l'onglet « Y » ») ; `lignes` : ['n', explication], ['g', geste], ['c', geste
    // principal] ; `puis` : la bulle après le geste. L'entrée, l'objectif et l'objectif atteint : le moteur (`OBJECTIFS`).

    var OBJECTIFS = {
        pratique: "À la fin de ce parcours, tu seras en mesure de régler un critère algorithmique dans ta grille et de l'appliquer à une première production.",
        pratiqueAtteint: "Objectif atteint : tu es en mesure de régler un critère algorithmique dans ta grille et de l'appliquer à une première production."
    };

    var TEXTES = {
        grille: {
            titre: "Ta grille",
            lieuSuite: ": c'est là que tu composes tes grilles.",
            lignes: [
                ['n', "Cette fois, c'est ton propre matériel : ta grille et les productions de ton groupe."],
                ['n', "Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », les commentaires par cible viendront dans une prochaine version."],
                ['n', "Tu comptes déjà certaines choses quand tu corriges : des erreurs de français, ou des unités oubliées dans des calculs. Un critère algorithmique garde ce compte, en tire sa note et écrit le commentaire qui convient."],
                ['n', "Il prend place dans une grille, seul ou à côté de tes autres critères."],
                ['n', "Prends la grille d'une production que tu n'as pas encore évaluée. Les évaluations déjà enregistrées garderaient leur note sans ce critère : tes étudiant·es ne seraient pas tou·tes évalué·es sur les mêmes critères."],
                ['c', "Choisis cette grille dans le menu en haut de la page, ou touche « + Nouvelle grille »"]
            ],
            puis: { lignes: [
                ['g', "Touche « + Ajouter un critère »"],
                ['g', "Écris son nom (ce que tu relèves, par exemple « Français écrit » ou « Unités de mesure »)"],
                ['c', "Dans le menu « Type » de ce critère, choisis « Algorithmique »"]
            ] }
        },
        compte: {
            titre: "Ce que tu comptes",
            confirme: "C'est fait : ton critère est algorithmique. Son atelier s'est ouvert.",
            lignes: [
                ['n', "L'atelier règle le critère en cinq étapes, à faire dans l'ordre. Elles sont en haut : une coche marque celles qui sont réglées, un point d'exclamation celles qui t'attendent."],
                ['n', "La première, « Ce que tu relèves et comptes », demande deux noms : ce que tu comptes dans une production, puis ce à quoi tu rapportes ce compte. Des erreurs sur des mots, des unités manquantes sur des calculs, ou ce qui convient à ta discipline."],
                ['n', "Écris chaque nom au singulier et au pluriel : l'étudiant·e les lira dans la phrase qui lui donne son compte et dans son PDF."],
                ['c', "Écris les quatre formes"]
            ]
        },
        codes: {
            titre: "Tes codes",
            confirme: "C'est fait : l'application sait ce que tu comptes et ce à quoi tu le rapportes.",
            lignes: [
                ['n', "Tu es à l'étape « Codes utilisés ». Un code est une catégorie de ce que tu relèves. Il porte un nom et un numéro : c'est ce numéro que tu poseras sur la production."],
                ['n', "Tu écris peut-être déjà un chiffre ou une abréviation dans la marge ; ici, l'application compte chaque code que tu poses."],
                ['g', "Touche « + Ajouter un sous-critère » et nomme ton premier code"],
                ['n', "Sa pondération dit ce que vaut un code posé dans le compte : 1 au départ, 0,5 pour le compter à moitié."],
                ['g', "Ouvre son « Observation » et écris ce que l'étudiant·e lira quand ce code revient souvent dans sa production"],
                ['g', "Ajoute tes autres codes de la même façon"],
                ['n', "Tu enseignes le français écrit ? « Partir de la liste du français écrit (codes 1 à 10) » crée dix codes d'un coup, que tu modifies ensuite."],
                ['c', "Touche « Continuer »"]
            ]
        },
        note: {
            titre: "Ta note",
            confirme: "C'est fait : ton critère a ses codes.",
            lignes: [
                ['n', "Tu es à l'étape « Note calculée ». Deux réglages font la note de ce critère."],
                ['g', "Écris sa pondération, dans l'en-tête du critère, à côté de son type (ce que pèse le critère dans le résultat de la production)"],
                ['n', "Si ta grille a d'autres critères, l'étape « Pondération », en tête de la fiche, te dit si le total tombe juste."],
                ['n', "Trois calculs sont prêts. « Pénalité proportionnelle à la longueur » : le même compte coûte moins dans une production plus longue. « Rapport visé » : un rapport que tu fixes donne la note entière, par exemple une occurrence à chaque 60 mots. « Pénalité fixe » : chaque occurrence retire les mêmes points."],
                ['g', "Choisis ton calcul et ajuste son réglage (la carte montre aussitôt la note d'une production fictive)"],
                ['c', "Touche « Continuer »"]
            ]
        },
        casLit: {
            titre: "Ce que l'étudiant·e lit",
            confirme: "C'est fait : la note de ton critère a sa règle.",
            lignes: [
                ['n', "Tu es à l'étape « Cas d'interprétation ». Un compte seul ne dit pas si c'est beaucoup."],
                ['n', "Tu as peut-être un repère en tête. Ici, il s'appelle une limite et tient en deux nombres : une longueur de référence et la tolérance sur cette longueur, par exemple au plus 4 unités manquantes pour 12 calculs."],
                ['n', "Avec une limite, l'application situe chaque production dans un palier. L'étudiant·e lit la phrase du palier où tombe sa production."],
                ['g', "Si tu as un repère, touche « Fixer une limite », écris ses deux nombres, puis réécris les phrases des paliers avec tes mots"],
                ['n', "Pas de repère ? Laisse l'étape telle quelle : la phrase du compte suffit."],
                ['c', "Touche « Continuer »"]
            ],
            puis: { lignes: [
                ['n', "Voici les phrases que l'application écrira à ta place sur chaque production."],
                ['n', "La première donne le compte : « Ta production contient… ». Les deux autres vont dans le bilan : l'une quand la note de ce critère tombe à 0, l'autre quand tous les critères de la grille sont maîtrisés."],
                ['n', "Les blocs colorés, comme le compte, se remplissent à l'évaluation. Le reste se réécrit avec tes mots ; « Revenir au modèle » remet la phrase de départ."],
                ['g', "Relis tes phrases"],
                ['n', "Ta grille est nouvelle ? Donne-lui un nom (il s'imprime dans le PDF de tes étudiant·es)."],
                ['c', "Touche « Continuer », ou « Créer la grille » pour une grille nouvelle"]
            ] }
        },
        production: {
            titre: "Ta production",
            confirme: "C'est fait : ton critère est réglé et ta grille est enregistrée.",
            lieuSuite: ": c'est là que tu décris ce que tu demandes à tes étudiant·es.",
            lignes: [
                ['n', "Ta grille ne sert qu'une fois reliée à la production qu'elle évaluera."],
                ['g', "Choisis ta prochaine production dans le menu en haut de la page, ou touche « + Nouvelle production »"],
                ['g', "Dans « Grille de critères d'évaluation », choisis la grille que tu viens de régler"],
                ['n', "Garde son échelle de performance : elle traduit la note de ce critère en niveau, comme pour tes autres critères."],
                ['c', "Pour une production nouvelle, touche « Créer la production »"]
            ]
        },
        productions: {
            titre: "Leurs productions",
            confirme: "C'est fait : ta grille est reliée à ta production.",
            lieuSuite: ": c'est là que tu reçois les productions de tes étudiant·es.",
            lignes: [
                ['n', "Pour poser tes codes, il te faut leurs productions dans l'application. Tu l'as fait au parcours 4 ; les gestes sont les mêmes."],
                ['g', "Dépose leurs fichiers dans la zone"],
                ['g', "Sous « Inspecteur », choisis la production à laquelle tu viens de relier ta grille"],
                ['c', "Touche « Importer », puis « Oui, importer »"],
                ['n', "Ta production est sur papier, ou c'est un exposé, une performance ? Touche « Rien à importer » : tu écriras ton compte à l'évaluation."]
            ]
        },
        poser: {
            titre: "Poser tes codes",
            confirme: "C'est fait : les productions de ton groupe sont reçues.",
            lieuSuite: ": c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.",
            lignes: [
                ['c', "Sur la ligne d'une production reçue, touche « Actions › Annoter »"]
            ],
            puis: { lignes: [
                ['n', "La palette « Codes » porte les codes de ta grille."],
                ['g', "Touche un code, puis l'endroit de la production où tu l'observes : son numéro s'y pose"],
                ['n', "Sur un clavier, la touche de son numéro le choisit aussi (0 pour le code 10). Le nombre de codes posés paraît dans la palette : le compte se fait seul."],
                ['n', "Un code relève ; il ne commente pas. Pour un commentaire sur la production, prends l'outil « Texte ». Le « Stylo » sert à encercler ou à tracer une flèche."],
                ['c', "Quand tu as fini, touche « Annoter ▾ », en haut de la production, puis choisis « Évaluer »"]
            ] }
        },
        retro: {
            titre: "Ta rétroaction s'écrit seule",
            confirme: "C'est fait : tes codes sont posés. Tu es en mode Évaluer.",
            lignes: [
                ['n', "Dans la palette « Évaluation », ton critère algorithmique porte déjà le compte de tes codes."],
                ['g', "Écris ce à quoi tu le rapportes, par exemple le nombre de mots ou de calculs de cette production (la note se calcule aussitôt)"],
                ['g', "Évalue tes autres critères comme d'habitude"],
                ['n', "Dans la palette « Rétroaction », sous ton critère : la phrase du compte et, si tu as fixé une limite, celle du palier. Dans la vue « Spécifique » : les codes les plus fréquents, chacun avec son observation."],
                ['n', "Tu n'as écrit aucune de ces phrases pour cette production : elles viennent toutes de tes règles."],
                ['g', "Relis la rétroaction comme ton étudiant·e la lira (un mot personnel s'écrit dans « Un mot pour ton étudiant·e »)"],
                ['c', "Touche le cadenas « Verrouiller », en haut de la palette « Paramètres »"]
            ]
        },
        retroSans: {
            titre: "Ta rétroaction s'écrit seule",
            confirme: "C'est fait : pas de fichier à importer.",
            lieuSuite: ": c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.",
            lignes: [
                ['c', "Sur la ligne d'un·e étudiant·e, touche « Actions › Évaluer »"]
            ],
            puis: { lignes: [
                ['n', "Sans fichier, il n'y a pas de codes à poser : tu comptes de ton côté."],
                ['g', "Dans le panneau « Critères », écris tes deux nombres : ton compte et ce à quoi tu le rapportes"],
                ['g', "Évalue tes autres critères comme d'habitude"],
                ['n', "La rétroaction, à côté, porte la phrase du compte et, si tu as fixé une limite, celle du palier. Elle ne nomme pas tes codes : l'application ne sait pas lesquels reviennent."],
                ['c', "Relis-la, puis touche le cadenas « Verrouiller »"]
            ] }
        },
        loin: {
            titre: "Et pour tes prochaines productions",
            confirme: "C'est fait : l'évaluation est verrouillée.",
            lignes: [
                ['n', "Chaque production que tu évalueras avec cette grille recevra sa rétroaction de la même façon : tu poses tes codes, l'application compte et écrit."],
                ['n', "Le réglage est fait. Tu peux y revenir quand tu veux, dans l'atelier du critère."]
            ]
        }
    };

    /** Une ligne de la bulle : ['n'|'g'|'c', texte] ; `plus` : sa fonction `fait`, ou { fait, champs, montre }. */
    function ligne(def, plus) {
        var t = def[0], texte = def[1];
        var o = typeof plus === 'function' ? { fait: plus } : (plus || {});
        var l = t === 'c' ? { texte: texte, geste: true } : t === 'g' ? { texte: texte } : { texte: texte, note: true };
        if (o.fait) l.fait = o.fait;
        else if (t === 'g' && !o.champs) l.fait = function () { return false; };
        if (o.champs) l.champs = o.champs;
        if (o.montre) { l.montre = o.montre; delete l.note; }
        return l;
    }
    function lignesDe(defs, plus) { return defs.map(function (d, k) { return ligne(d, plus && plus[k]); }); }

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

    // LA MODÉLISATION (« Je regarde ») garde son contexte EN MÉMOIRE : la préférence de la Pratique guidée, une clé hors de
    // la démo, n'est jamais touchée par le modèle (le confinement).
    var enModele = false;
    var ctxModele = {};

    function lireCtx() {
        if (enModele) return Object.assign({}, ctxModele);
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? Object.assign({}, v) : {};
    }

    function ecrireCtx(c) {
        if (enModele) { ctxModele = Object.assign({}, c); return; }
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
        // Sur la page d'annotation VISIBLE (22 nov. 2026) : la visionneuse garde son dernier fichier et son mode quand on
        // quitte la page. Mesuré au « Je regarde » : le modèle de « Recevoir » la laisse en « Évaluer » sur la copie de
        // Loutre Enjouée (même production) ; la bulle 6 se croyait dans l'évaluation, sans aller à la Liste.
        return !!(mode() === 'evaluer' && sousSectionVisible('evaluations-annoter') && $('#travaux-palette-eval-gauche') && f
            && idsDuParcours().indexOf(f.productionId) !== -1);
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

    var MECANIQUE = {
        grille: ({
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
        compte: ({
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
        codes: ({
            avant: function () { return assurerAtelier('codes'); },
            zones: function () { return [sectionAtelier('codes')]; },
            contour: function () { return boutonQuiDit(corpsAtelier('codes'), 'Ajouter un sous-crit'); },
            boutons: [{ libelle: 'Continuer', primaire: true, action: suivante,
                attend: function () { return nombreDeCodes() > 0 ? '' : ATTENTES.codes; } }],
            atteint: function () { return false; }
        }),
        note: ({
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
        cas: ({
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
        lit: ({
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
        production: ({
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
        productions: ({
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
        poser: ({
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
        retro: ({
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
        retroSans: ({
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
        loin: ({
            centre: true,
            sansSortie: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        })
    };

    // Vu en création pendant l'étape 6 : la grille est nouvelle, l'étape attend qu'elle soit créée.
    var creationVue = false;

    // ---------- Les bulles : la mécanique ci-dessus, les lignes du 22 nov. ----------

    /** Une étape : sa mécanique (ses descripteurs copiés, getters compris), puis ce que `o` redonne. */
    function etape(mecanique, o) {
        var e = {};
        Object.keys(mecanique).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(mecanique, k)); });
        Object.keys(o).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(o, k)); });
        // Une bulle en lignes ne fléche ses zones que si elle les déclare (`designe`, js/parcours-moteur.js).
        if (!e.fleches && e.zones) e.fleches = function () { return ((e.zones && e.zones()) || []).filter(Boolean); };
        return e;
    }

    // L'étape où ce passage a commencé : une bulle ne confirme l'étape d'avant que si elle a été faite pendant ce passage,
    // et que l'étape d'avant, sur le chemin, est bien celle que la confirmation nomme (une étape sautée n'en a pas).
    var debutDuPassage = 0;
    function confirmation(bulle, avant) {
        return function () {
            var m = M(), i = m && m.joue(DEF) ? m.etapeCourante() : null;
            var chemin = lireCtx().chemin || [];
            if (i === null || i <= debutDuPassage || chemin[i - 1] !== avant) return '';
            return TEXTES[bulle].confirme;
        };
    }

    // La bulle 5 : deux formes, l'étape « Cas d'interprétation », puis « Ce que l'étudiant·e lit » (« Continuer »).
    var formeLit = false;

    var ETAPES = {
        grille: etape(MECANIQUE.grille, {
            titre: TEXTES.grille.titre, amener: true, lieu: true, lieuSuite: TEXTES.grille.lieuSuite, lignesVivantes: true,
            // 22 nov. 2026, 15 h (consigne de la suite, 5) : à 1180 × 820, la première bulle, haute de 745 px, couvrait
            // « + Nouvelle grille » ; elle se limite à la bande libre sous la rangée du menu, son texte y défile.
            serrer: true,
            secondeForme: function () { return ficheOuverte(); },
            lignes: function () {
                if (!ficheOuverte()) return lignesDe(TEXTES.grille.lignes);
                return lignesDe(TEXTES.grille.puis.lignes, [function () { return !!carteAjoutee(); }, function () {
                    var c = carteAjoutee(), n = c ? c.querySelector('input[type="text"]') : null;
                    return !!(n && String(n.value || '').trim() && n.value !== 'Nouveau critère');
                }, function () { return !!atelier(); }]);
            }
        }),
        compte: etape(MECANIQUE.compte, { titre: TEXTES.compte.titre, confirme: confirmation('compte', 'grille'),
            lignes: function () { return lignesDe(TEXTES.compte.lignes, [null, null, null, function () { return reglee('compte'); }]); } }),
        codes: etape(MECANIQUE.codes, { titre: TEXTES.codes.titre, confirme: confirmation('codes', 'compte'), lignesVivantes: true,
            lignes: function () {
                var un = function () { return nombreDeCodes() > 0; };
                return lignesDe(TEXTES.codes.lignes, [null, null, un, null, null, function () { return nombreDeCodes() > 1; }]);
            } }),
        note: etape(MECANIQUE.note, { titre: TEXTES.note.titre, confirme: confirmation('note', 'codes'), lignesVivantes: true,
            lignes: function () {
                return lignesDe(TEXTES.note.lignes, [null, { champs: function () { return [champPonderation(carteDuCritere())].filter(Boolean); } }, null, null,
                    function () { return reglee('note'); }]);
            } }),
        casLit: etape(MECANIQUE.cas, {
            titre: TEXTES.casLit.titre,
            confirme: confirmation('casLit', 'note'),
            lignesVivantes: true,
            secondeForme: function () { return formeLit; },
            avant: function () { return assurerAtelier(formeLit ? 'eleve' : 'paliers'); },
            lignes: function () { return lignesDe(formeLit ? TEXTES.casLit.puis.lignes : TEXTES.casLit.lignes); },
            aussiEviter: function () { return formeLit ? MECANIQUE.lit.aussiEviter() : MECANIQUE.cas.aussiEviter(); },
            zones: function () { return formeLit ? MECANIQUE.lit.zones() : MECANIQUE.cas.zones(); },
            contour: function () { return formeLit ? MECANIQUE.lit.contour() : MECANIQUE.cas.contour(); },
            get boutons() {
                if (formeLit) return MECANIQUE.lit.boutons;
                return [{ libelle: 'Continuer', primaire: true,
                    action: function () { formeLit = true; creationVue = enCreation(); assurerAtelier('eleve'); },
                    attend: function () { return reglee('paliers') ? '' : ATTENTES.limite; } }];
            },
            atteint: function () { return formeLit && MECANIQUE.lit.atteint(); }
        }),
        production: etape(MECANIQUE.production, { titre: TEXTES.production.titre, confirme: confirmation('production', 'casLit'),
            amener: true, lieu: true, lieuSuite: TEXTES.production.lieuSuite, lignes: function () { return lignesDe(TEXTES.production.lignes); } }),
        productions: etape(MECANIQUE.productions, { titre: TEXTES.productions.titre, confirme: confirmation('productions', 'production'),
            amener: true, lieu: true, lieuSuite: TEXTES.productions.lieuSuite, lignes: function () { return lignesDe(TEXTES.productions.lignes); } }),
        poser: etape(MECANIQUE.poser, { titre: TEXTES.poser.titre, confirme: confirmation('poser', 'productions'),
            amener: true, lieu: function () { return !annoterOuvert() && !evaluationOuverte(); }, lieuSuite: TEXTES.poser.lieuSuite, lignesVivantes: true,
            secondeForme: function () { return annoterOuvert(); },
            lignes: function () { return lignesDe(annoterOuvert() ? TEXTES.poser.puis.lignes : TEXTES.poser.lignes); } }),
        retro: etape(MECANIQUE.retro, { titre: TEXTES.retro.titre, confirme: confirmation('retro', 'poser'), lignesVivantes: true,
            lignes: function () {
                return lignesDe(TEXTES.retro.lignes, [null, { champs: function () { return [champAlgo('eval_mots_')].filter(Boolean); } }]);
            } }),
        retroSans: etape(MECANIQUE.retroSans, { titre: TEXTES.retroSans.titre, confirme: confirmation('retroSans', 'productions'),
            amener: true, lieu: function () { return !evaluationOuverte(); }, lieuSuite: TEXTES.retroSans.lieuSuite, lignesVivantes: true,
            secondeForme: function () { return evaluationOuverte(); },
            lignes: function () {
                return evaluationOuverte() ? lignesDe(TEXTES.retroSans.puis.lignes, [null, { champs: function () { return [champAlgo('eval_erreurs_'), champAlgo('eval_mots_')].filter(Boolean); } }])
                    : lignesDe(TEXTES.retroSans.lignes);
            } }),
        // La consigne des boutons : « Touche « Terminer » », que le moteur dit « Touche « Voir le parcours 9 », ou
        // « Terminer » » quand il offre la suite (`consigneDeLaFin`) ; elle suit les boutons, elle n'est pas un texte écrit.
        loin: etape(MECANIQUE.loin, { titre: TEXTES.loin.titre, confirme: confirmation('loin', null),
            lignes: function () { return lignesDe(TEXTES.loin.lignes).concat([{ texte: 'Touche « Terminer »', geste: true }]); } })
    };
    // La dernière bulle confirme le verrou, d'où que l'on vienne (la rétroaction avec ou sans fichier).
    ETAPES.loin.confirme = function () {
        var m = M(), i = m && m.joue(DEF) ? m.etapeCourante() : null;
        var chemin = lireCtx().chemin || [];
        return i !== null && i > debutDuPassage && /^retro/.test(chemin[i - 1] || '') ? TEXTES.loin.confirme : '';
    };

    // ---------- Le chemin : les étapes qui s'appliquent, dans l'ordre de la consigne ----------

    var ORDRE = ['grille', 'compte', 'codes', 'note', 'casLit', 'production', 'productions', 'poser', 'retro', 'retroSans', 'loin'];

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
        var k = ['grille', 'compte', 'codes', 'note', 'casLit'];
        if (!s.saute7) k.push('production');
        if (!s.saute8) k.push('productions');
        if (c.sansFichier) k.push('retroSans');
        else k.push('poser', 'retro');
        k.push('loin');
        return k;
    }

    var DEF = { id: ID, etapes: [], lienSortie: 'Plus tard', objectif: OBJECTIFS.pratique, objectifAtteint: OBJECTIFS.pratiqueAtteint };

    function poserChemin(cles) { DEF.etapes = cles.map(function (k) { return ETAPES[k]; }); }

    /**
     * LA GARDE DE L'ÉTAPE 1 (lot « Les flèches des parcours », 10 nov. 2026 : le voile du moteur est retiré). L'étape
     * demande d'ajouter un critère et de choisir son type. Le « Type » d'un critère DÉJÀ LÀ était sous le voile : changé,
     * il s'écrirait aussitôt dans la grille enregistrée et ferait avancer l'étape. Il ne répond pas le temps de l'étape :
     * le menu reprend sa valeur, le changement ne va pas plus loin. Le modèle de `garderOuvrir` (js/parcours-donnees.js).
     */
    function garderLeType(ev) {
        var m = M();
        var enNous = m && m.joue(DEF) && DEF.etapes[m.etapeCourante()] === ETAPES.grille;
        // La bulle 1 du modèle aussi (22 nov. 2026) : le « Type » d'un des quatre critères de la grille de l'exemple.
        var auModele = m && DEF_MODELE && m.joue(DEF_MODELE) && m.etapeCourante() === 0;
        if (!enNous && !auModele) return;
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
        else if (i <= ORDRE.indexOf('casLit') + 1 && ficheOuverte()) c.grilleId = grilleOuverte() ? grilleOuverte().id : null;
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
        if (cleEtape === 'casLit') { formeLit = false; creationVue = enCreation(); }
        window.Assistance.definirEtat(ID, 'en-cours', i);
    }

    // =================================================================
    // « JE REGARDE » (la Modélisation), huit bulles, dans la démo, sur le deuxième groupe, après les modèles des parcours 2,
    // 3 et 4 (consigne du 22 nov., § 4.1 ; la suite, § 6). Le critère « Français écrit » s'ajoute DIRECTEMENT à la « Grille
    // générale à 4 critères » (mesuré : ni les notes, ni la Liste, ni les indices P, ni le PDF des évaluations déjà posées
    // ne changent). « Remplir » pose ce que la consigne dit, bulle par bulle, par les champs de la page ; rien ne s'écrit
    // hors de la démo. « Refaire » retire le cinquième critère (les quatre retrouvent 20, 30, 15, 35), les codes posés sur
    // la copie d'Antilope Vaillante et son évaluation (`defaireModele`) ; Tapir Doux et le reste restent.
    // =================================================================

    var TEXTES_MODELE = {
        objectif: "À la fin de ce parcours, tu seras en mesure d'expliquer comment les codes que tu poses sur une production deviennent une note et des commentaires.",
        objectifAtteint: "Objectif atteint : tu es en mesure d'expliquer comment les codes que tu poses sur une production deviennent une note et des commentaires.",
        bulles: [
            {
                titre: "Ta grille",
                lieuSuite: ": c'est là que tu composes tes grilles.",
                lignes: [
                    ['n', "Dans la démo, tu reprends la grille de ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données."],
                    ['n', "Ce parcours suit des productions évaluées. Si ta pratique est « Par standards », les commentaires par cible viendront dans une prochaine version."],
                    ['n', "Tu comptes déjà certaines choses quand tu corriges : des erreurs de français, ou des unités oubliées dans des calculs. Ici, l'application garde ce compte et en tire la note d'un critère."],
                    ['n', "Ce critère est dit algorithmique : sa note se calcule à partir de ce que tu comptes, selon une règle que tu fixes une seule fois. Les autres critères, eux, reçoivent le niveau que tu choisis."],
                    ['n', "Il écrit aussi le commentaire qui convient à chaque compte. C'est ce que veut dire « automatiser tes commentaires »."],
                    ['c', "Dans le menu en haut de la page, choisis « Grille générale à 4 critères »"]
                ],
                puis: { lignes: [
                    ['n', "Ses quatre critères s'évaluent par niveaux. Le critère algorithmique s'ajoute à côté d'eux."],
                    ['g', "Au bas de la liste des critères, touche « + Ajouter un critère »"],
                    ['g', "Regarde l'exemple se remplir : touche « Remplir » (le nom du critère s'écrit : « Français écrit »)"],
                    ['c', "Dans le menu « Type » de ce critère, choisis « Algorithmique »"]
                ] }
            },
            {
                titre: "Ce que tu comptes",
                confirme: "C'est fait : le critère « Français écrit » est algorithmique. Son atelier s'est ouvert.",
                lignes: [
                    ['n', "L'atelier règle le critère en cinq étapes, à faire dans l'ordre. Elles sont en haut : une coche marque celles qui sont réglées."],
                    ['n', "La première, « Ce que tu relèves et comptes », demande deux noms : ce que tu comptes dans une production, puis ce à quoi tu rapportes ce compte. Douze erreurs ne disent pas la même chose dans 300 mots que dans 900."],
                    ['n', "Chaque nom s'écrit au singulier et au pluriel, parce que l'étudiant·e les lira dans une phrase : « Ta production contient 12 erreurs pour 600 mots. »"],
                    ['n', "Dans une autre discipline, ce serait par exemple « unité manquante » et « calcul »."],
                    ['c', "Regarde l'exemple se remplir : touche « Remplir » (« erreur », « erreurs », « mot », « mots »)"]
                ]
            },
            {
                titre: "Tes codes",
                confirme: "C'est fait : l'application sait ce que tu comptes (des erreurs) et ce à quoi tu le rapportes (des mots).",
                lignes: [
                    ['n', "Tu es à l'étape « Codes utilisés ». Un code est une catégorie de ce que tu relèves. Il porte un nom et un numéro : c'est ce numéro que tu poseras sur la production."],
                    ['n', "Tu écris peut-être déjà un chiffre ou une abréviation dans la marge ; ici, l'application compte chaque code que tu poses."],
                    ['n', "Pour le français écrit, une liste de dix codes est prête. Dans une autre discipline, tu écrirais les tiens, un à la fois."],
                    ['c', "Touche « Partir de la liste du français écrit (codes 1 à 10) »"]
                ],
                puis: { lignes: [
                    ['n', "Chaque rangée est un code : son numéro, son nom et sa pondération. La pondération d'un code dit ce que vaut un code posé dans le compte : 1 au départ, 0,5 pour le compter à moitié."],
                    ['n', "Sous chaque code, son « Observation » : la phrase que l'étudiant·e lira quand ce code revient souvent dans sa production."],
                    ['g', "Ouvre l'« Observation » du code 1 et lis-la"],
                    ['c', "Touche « Continuer »"]
                ] }
            },
            {
                titre: "Ta note",
                confirme: "C'est fait : ton critère a ses dix codes.",
                lignes: [
                    ['n', "Tu es à l'étape « Note calculée ». Deux réglages font la note de ce critère."],
                    ['n', "Le premier est sa pondération, dans l'en-tête du critère, à côté de son type : ce que pèse le critère dans le résultat de la production."],
                    ['n', "Le second est le calcul. Trois sont prêts. L'exemple garde celui qui est choisi au départ, « Pénalité proportionnelle à la longueur » : le même nombre d'erreurs coûte moins dans une production plus longue."],
                    ['g', "Regarde l'exemple se remplir : touche « Remplir » (la pondération s'écrit : 20\u00a0%)"],
                    ['n', "La carte montre aussitôt la note d'une production fictive. Change son nombre d'erreurs : la note suit."],
                    ['c', "Touche « Continuer »"]
                ]
            },
            {
                titre: "Ce que l'étudiant·e lit",
                confirme: "C'est fait : la note de ton critère a sa règle.",
                lignes: [
                    ['n', "Tu es à l'étape « Cas d'interprétation ». Un compte seul ne dit pas si c'est beaucoup."],
                    ['n', "Tu as sans doute un repère en tête : au-delà d'un certain nombre d'erreurs, tu t'inquiètes. Ici, ce repère s'appelle une limite. Elle tient en deux nombres : une longueur de référence et la tolérance sur cette longueur."],
                    ['n', "Avec une limite, l'application situe chaque production dans un palier. L'étudiant·e lit la phrase du palier où tombe sa production."],
                    ['g', "Touche « Fixer une limite »"],
                    ['g', "Regarde l'exemple se remplir : touche « Remplir » (au plus 30 erreurs pour 900 mots)"],
                    ['c', "Lis les phrases des paliers, puis touche « Continuer »"]
                ],
                puis: { lignes: [
                    ['n', "Voici les phrases que l'application écrira à ta place sur chaque production."],
                    ['n', "La première donne le compte : « Ta rédaction contient… ». Elle paraît sous le critère et dans le PDF de l'étudiant·e."],
                    ['n', "Les deux autres vont dans son bilan : l'une quand la note de ce critère tombe à 0, l'autre quand tous les critères de la grille sont maîtrisés."],
                    ['n', "Les blocs colorés, comme le compte, se remplissent à l'évaluation. Le reste se réécrit avec tes mots."],
                    ['c', "Lis les trois phrases, puis touche « Continuer »"]
                ] }
            },
            {
                titre: "Poser tes codes",
                confirme: "C'est fait : ton critère est réglé. La grille s'est enregistrée d'elle-même.",
                lieuSuite: ": c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.",
                lignes: [
                    ['n', "Cette grille est celle de la production sur « Deux-Rives ». Celle d'Antilope Vaillante est déjà reçue et n'est pas encore évaluée."],
                    ['c', "Sur la ligne d'Antilope Vaillante, touche « Actions › Annoter »"]
                ],
                puis: { lignes: [
                    ['n', "La palette « Codes » porte les dix codes de ta grille."],
                    ['n', "Ici, on expérimente l'application, pas la correction : pose tes codes au hasard, sans lire le texte."],
                    ['g', "Touche un code dans la palette, puis un endroit de la production : son numéro s'y pose"],
                    ['g', "Recommence jusqu'à six codes (suggestion pour suivre l'exemple : trois fois le code 1, deux fois le code 4, une fois le code 10)"],
                    ['n', "Le nombre de codes posés paraît dans la palette : le compte se fait seul."],
                    ['c', "En haut de la production, touche « Annoter ▾ », puis choisis « Évaluer »"]
                ] }
            },
            {
                titre: "Ta rétroaction s'écrit seule",
                confirme: "C'est fait : six codes sont posés. Tu es en mode Évaluer.",
                lignes: [
                    ['n', "Dans la palette « Évaluation », « Français écrit » porte déjà son compte : 6 erreurs."],
                    ['n', "Il lui manque ce à quoi tu rapportes ce compte : la longueur de cette production."],
                    ['g', "Écris le nombre de mots : 300 (la note du critère se calcule aussitôt)"],
                    ['g', "Regarde l'exemple se remplir : touche « Remplir » (les quatre autres critères reçoivent leur niveau, comme au parcours 3)"],
                    ['n', "Dans la palette « Rétroaction », sous « Français écrit » : la phrase du compte, puis celle du palier. Dans la vue « Spécifique » : les codes les plus fréquents, chacun avec son observation."],
                    ['n', "Tu n'as écrit aucune de ces phrases pour cette production : elles viennent toutes de tes règles."],
                    ['g', "Lis la rétroaction comme Antilope Vaillante la lira"],
                    ['c', "Touche le cadenas « Verrouiller », en haut de la palette « Paramètres »"]
                ]
            },
            {
                titre: "Et pour tes prochaines productions",
                confirme: "C'est fait : l'évaluation d'Antilope Vaillante est verrouillée.",
                lignes: [
                    ['n', "Chaque production évaluée avec cette grille recevra sa rétroaction de la même façon : tu poses tes codes, l'application compte et écrit."],
                    ['n', "Le réglage se fait une fois. Tu peux y revenir quand tu veux, dans l'atelier du critère."]
                ]
            }
        ]
    };

    // PROPOSÉ par la session (22 nov. 2026), dans le moule du refus validé du parcours 7 (la suite, 1.7) : le panneau, sans le
    // « Je regarde » de « Recevoir » (la copie d'Antilope Vaillante n'est pas importée) ou sans la grille du modèle d'« Évaluer ».
    var REFUS_MODELE = "Commence par le « Je regarde » de « Recevoir les productions, rendre tes rétroactions » : c'est là qu'on importe la production d'Antilope Vaillante, que ce parcours évalue.";

    var MATERIEL_MODELE = Object.freeze({
        grille: 'Grille générale à 4 critères',
        critere: 'Français écrit',
        noms: Object.freeze([['erreurs', 'singulier', 'erreur'], ['erreurs', 'pluriel', 'erreurs'], ['mots', 'singulier', 'mot'], ['mots', 'pluriel', 'mots']]),
        ponderations: Object.freeze({ 'Français écrit': 20, Structure: 16, Rigueur: 24, 'Plausibilité': 12, Nuance: 28 }),
        avant: Object.freeze({ Structure: 20, Rigueur: 30, 'Plausibilité': 15, Nuance: 35 }),
        limite: Object.freeze({ motsReference: '900', erreursTolerees: '30' }),
        mots: '300',
        antilope: Object.freeze({ da: '9900006', nom: 'Antilope Vaillante' }),
        niveaux: Object.freeze({ Structure: 'M', Rigueur: 'M', 'Plausibilité': 'E', Nuance: 'M' })
    });

    var K = function () { return window.ParcoursClasse; };
    function deLaDemo(nom) { var v = typeof db !== 'undefined' ? db.getSync('demo_' + nom, []) : []; return Array.isArray(v) ? v : []; }
    function deuxiemeGroupe() { return K() && typeof K().deuxiemeGroupe === 'function' ? K().deuxiemeGroupe() : null; }
    function surLeDeuxiemeGroupe() {
        var g = deuxiemeGroupe(), gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        return !!g && !!gc && gc.id === g.id;
    }
    function grilleDuModele() { return deLaDemo('grillesTemplates').find(function (g) { return g && g.nom === MATERIEL_MODELE.grille; }) || null; }
    function copieDAntilope() { return deLaDemo('fichiersTravaux').find(function (f) { return f && String(f.etudiantDA) === MATERIEL_MODELE.antilope.da && f.productionId; }) || null; }
    function evaluationDAntilope() {
        var c = copieDAntilope();
        return c ? deLaDemo('evaluationsSauvegardees').find(function (e) {
            return e && String(e.etudiantDA) === MATERIEL_MODELE.antilope.da && e.productionId === c.productionId && !e.remplaceeParId;
        }) || null : null;
    }
    function refusModele() { return deuxiemeGroupe() && grilleDuModele() && copieDAntilope() ? null : REFUS_MODELE; }

    function poserChamp(champ, valeur) { return K() && typeof K().poser === 'function' ? K().poser(champ, valeur) : false; }
    function remplir(geste) { return K() && typeof K().remplir === 'function' ? K().remplir(geste) : false; }

    function grilleDuModeleOuverte() { var g = grilleOuverte(); return !!g && g.nom === MATERIEL_MODELE.grille; }
    function nomDuCritereAjoute() { var c = carteAjoutee(), n = c ? c.querySelector('input[data-champ="nom"]') : null; return n ? String(n.value || '').trim() : ''; }
    function critereDuModele() { var c = critere(); return !!c && c.nom === MATERIEL_MODELE.critere; }
    function champNom(paire, forme) { var a = atelier(); return a ? vis(a.querySelector('.noms-algo input[data-nom-paire="' + paire + '"][data-nom-forme="' + forme + '"]')) : null; }
    function boutonListeFrancais() { return vis($('#listeCriteres [data-action="initialiserSousCriteresParDefaut"]')); }
    function nomDeLaCarte(carte) { var n = carte ? carte.querySelector('input[data-champ="nom"]') : null; return n ? String(n.value || '').trim() : ''; }
    function ponderationsPosees() {
        return cartesDesCriteres().every(function (c) {
            var voulu = MATERIEL_MODELE.ponderations[nomDeLaCarte(c)], p = champPonderation(c);
            return voulu === undefined || (p && Number(p.value) === voulu);
        });
    }
    function champLimite(cleChamp) { var corps = corpsAtelier('paliers'); return corps ? vis(corps.querySelector('[data-param-cle="' + cleChamp + '"]')) : null; }
    function limiteFixee() { return !!champLimite('motsReference'); }
    function limitePosee() { var m = champLimite('motsReference'), e = champLimite('erreursTolerees'); return !!(m && e && m.value === MATERIEL_MODELE.limite.motsReference && e.value === MATERIEL_MODELE.limite.erreursTolerees); }
    function ligneDAntilope() {
        var c = copieDAntilope();
        return c ? $('#evaluations-liste tr[data-da="' + MATERIEL_MODELE.antilope.da + '"][data-production-id="' + c.productionId + '"]') : null;
    }
    function menuDAntilope() { var l = ligneDAntilope(), s = l ? l.querySelector('select.eval-actions-select') : null; return s && s.querySelector('option[value^="annoter|"]') ? vis(s) : null; }
    function annoterAntilope() { var f = fichierOuvert(); return annoterOuvert() && !!f && String(f.etudiantDA) === MATERIEL_MODELE.antilope.da; }
    function niveauxDuFormulaire() {
        var g = grilleDuModele();
        return g ? g.criteres.filter(function (c) { return MATERIEL_MODELE.niveaux[c.nom]; }).map(function (c) { return [c, vis(document.getElementById('eval_' + c.id))]; }) : [];
    }
    function niveauxPoses() { var n = niveauxDuFormulaire(); return n.length === 4 && n.every(function (x) { return x[1] && x[1].value === MATERIEL_MODELE.niveaux[x[0].nom]; }); }

    var GESTES_MODELE = {
        nom: function () { var c = carteAjoutee(), n = c ? c.querySelector('input[data-champ="nom"]') : null; poserChamp(n, MATERIEL_MODELE.critere); },
        noms: function () { MATERIEL_MODELE.noms.forEach(function (x) { poserChamp(champNom(x[0], x[1]), x[2]); }); },
        // Chaque carte relue par son nom : un champ posé peut faire redessiner la fiche.
        ponderations: function () {
            Object.keys(MATERIEL_MODELE.ponderations).forEach(function (nom) {
                var c = cartesDesCriteres().find(function (x) { return nomDeLaCarte(x) === nom; });
                if (c) poserChamp(champPonderation(c), String(MATERIEL_MODELE.ponderations[nom]));
            });
        },
        limite: function () { poserChamp(champLimite('motsReference'), MATERIEL_MODELE.limite.motsReference); poserChamp(champLimite('erreursTolerees'), MATERIEL_MODELE.limite.erreursTolerees); },
        niveaux: function () { niveauxDuFormulaire().forEach(function (x) { if (x[1]) poserChamp(x[1], MATERIEL_MODELE.niveaux[x[0].nom]); }); }
    };

    var debutDuModele = 0;
    function confirmationModele(k) { return function () { return k > debutDuModele ? TEXTES_MODELE.bulles[k].confirme : ''; }; }
    var B = TEXTES_MODELE.bulles;
    var REMPLIR = function (geste, primaire) { return { libelle: K().mots.remplir, primaire: !!primaire, action: function () { remplir(geste); } }; };
    var formeLitModele = false;

    /** Une bulle du modèle : hors du deuxième groupe, elle n'avance pas et montre le menu de l'en-tête. */
    function etapeDuModele(mecanique, o) {
        var e = etape(mecanique, o);
        var lignesDe_ = e.lignes, contour = e.contour, zones = e.zones, atteint = e.atteint, lieu = e.lieu;
        var choix = function () { return window.ParcoursEvaluer && window.ParcoursEvaluer.textes ? window.ParcoursEvaluer.textes.choisirLeGroupe : ''; };
        e.lignesVivantes = true;
        e.lignes = function () { return surLeDeuxiemeGroupe() ? (lignesDe_ ? lignesDe_.call(e) : []) : [{ texte: choix(), geste: true }]; };
        e.contour = function () { return surLeDeuxiemeGroupe() ? (contour ? contour.call(e) : null) : document.getElementById('selectGroupeCoursHeader'); };
        e.zones = function () { return surLeDeuxiemeGroupe() && zones ? (zones.call(e) || []).filter(Boolean) : []; };
        e.fleches = function () { return e.zones(); };
        if (atteint) e.atteint = function () { return surLeDeuxiemeGroupe() && !!atteint.call(e); };
        if (lieu) e.lieu = function () { return surLeDeuxiemeGroupe() && (typeof lieu === 'function' ? !!lieu() : true); };
        var boutons = Object.getOwnPropertyDescriptor(e, 'boutons');
        Object.defineProperty(e, 'boutons', { configurable: true, get: function () {
            if (!surLeDeuxiemeGroupe()) return null;
            return boutons ? (boutons.get ? boutons.get.call(e) : boutons.value) : null;
        } });
        return e;
    }

    function suitesDuModele() { return K().suitesDuModele(ID, terminerModele); }

    var ETAPES_MODELE = [
        etapeDuModele(MECANIQUE.grille, {
            titre: B[0].titre, lieu: true, amener: true, serrer: true, lieuSuite: B[0].lieuSuite,
            secondeForme: grilleDuModeleOuverte,
            lignes: function () {
                if (!grilleDuModeleOuverte()) return lignesDe(B[0].lignes);
                return lignesDe(B[0].puis.lignes, [null, function () { return !!carteAjoutee(); }, function () { return nomDuCritereAjoute() === MATERIEL_MODELE.critere; }, function () { return critereDuModele(); }]);
            },
            contour: function () {
                if (!grilleDuModeleOuverte()) return vis(document.getElementById('menuGrilles')) || rangeeDesGrilles();
                var c = carteAjoutee();
                if (!c) return boutonAjouterCritere();
                if (nomDuCritereAjoute() !== MATERIEL_MODELE.critere) return null;
                return menuType(c);
            },
            get boutons() {
                return grilleDuModeleOuverte() && carteAjoutee() && nomDuCritereAjoute() !== MATERIEL_MODELE.critere ? [REMPLIR(GESTES_MODELE.nom)] : null;
            },
            atteint: function () { return !!atelier() && critereDuModele(); }
        }),
        etapeDuModele(MECANIQUE.compte, {
            titre: B[1].titre, confirme: confirmationModele(1),
            lignes: function () { return lignesDe(B[1].lignes, [null, null, null, null, function () { return reglee('compte'); }]); },
            contour: function () { return null; },
            get boutons() { return reglee('compte') ? null : [REMPLIR(GESTES_MODELE.noms, true)]; }
        }),
        etapeDuModele(MECANIQUE.codes, {
            titre: B[2].titre, confirme: confirmationModele(2),
            secondeForme: function () { return nombreDeCodes() > 0; },
            lignes: function () { return nombreDeCodes() > 0 ? lignesDe(B[2].puis.lignes) : lignesDe(B[2].lignes); },
            contour: function () { return nombreDeCodes() > 0 ? null : boutonListeFrancais(); },
            get boutons() { return nombreDeCodes() > 0 ? [{ libelle: 'Continuer', primaire: true, action: suivante }] : null; }
        }),
        etapeDuModele(MECANIQUE.note, {
            titre: B[3].titre, confirme: confirmationModele(3),
            lignes: function () { return lignesDe(B[3].lignes, [null, null, null, ponderationsPosees, null, function () { return false; }]); },
            contour: function () { return null; },
            get boutons() {
                var b = [{ libelle: 'Continuer', primaire: true, action: suivante, attend: function () { return reglee('note') ? '' : ATTENTES.ponderation; } }];
                return ponderationsPosees() ? b : [REMPLIR(GESTES_MODELE.ponderations)].concat(b);
            }
        }),
        etapeDuModele(MECANIQUE.cas, {
            titre: B[4].titre, confirme: confirmationModele(4),
            secondeForme: function () { return formeLitModele; },
            avant: function () { return assurerAtelier(formeLitModele ? 'eleve' : 'paliers'); },
            lignes: function () { return formeLitModele ? lignesDe(B[4].puis.lignes) : lignesDe(B[4].lignes, [null, null, null, limiteFixee, limitePosee]); },
            aussiEviter: function () { return formeLitModele ? MECANIQUE.lit.aussiEviter() : MECANIQUE.cas.aussiEviter(); },
            zones: function () { return formeLitModele ? MECANIQUE.lit.zones() : MECANIQUE.cas.zones(); },
            contour: function () {
                if (formeLitModele) return null;
                return limiteFixee() ? null : boutonQuiDit(corpsAtelier('paliers'), 'Fixer une limite');
            },
            get boutons() {
                if (formeLitModele) return [{ libelle: 'Continuer', primaire: true, action: suivante }];
                var c = [{ libelle: 'Continuer', primaire: true, action: function () { formeLitModele = true; assurerAtelier('eleve'); },
                    attend: function () { return reglee('paliers') ? '' : ATTENTES.limite; } }];
                return limiteFixee() && !limitePosee() ? [REMPLIR(GESTES_MODELE.limite)].concat(c) : c;
            },
            atteint: function () { return false; }
        }),
        etapeDuModele(MECANIQUE.poser, {
            titre: B[5].titre, confirme: confirmationModele(5),
            lieu: function () { return !annoterAntilope() && !evaluationOuverte(); }, amener: true, lieuSuite: B[5].lieuSuite,
            secondeForme: annoterAntilope,
            avant: async function () {
                if (annoterOuvert() || evaluationOuverte()) return;
                aller('evaluations', 'liste');
                await attendre(menuDAntilope, 3000);
            },
            lignes: function () { return annoterAntilope() ? lignesDe(B[5].puis.lignes, [null, null, function () { return Number(($('#travaux-errfr-total-pastille') || {}).textContent) > 0; }, function () { return Number(($('#travaux-errfr-total-pastille') || {}).textContent) >= 6; }]) : lignesDe(B[5].lignes); },
            zones: function () { return annoterAntilope() ? MECANIQUE.poser.zones() : [ligneDAntilope()]; },
            contour: function () { return annoterAntilope() ? (palette('travaux-palette-erreurs-fr') || vis(document.getElementById('travaux-btn-actions'))) : menuDAntilope(); },
            nommeLeContour: function () { return !annoterAntilope(); },
            atteint: function () { var f = fichierOuvert(); return evaluationOuverte() && !!f && String(f.etudiantDA) === MATERIEL_MODELE.antilope.da; }
        }),
        etapeDuModele(MECANIQUE.retro, {
            titre: B[6].titre, confirme: confirmationModele(6),
            lignes: function () {
                return lignesDe(B[6].lignes, [null, null, { champs: function () { return [champAlgo('eval_mots_')].filter(Boolean); } }, niveauxPoses]);
            },
            get boutons() { return niveauxPoses() ? null : [REMPLIR(GESTES_MODELE.niveaux)]; },
            atteint: function () { var e = evaluationDAntilope(); return !!(e && e.verrouillee); }
        }),
        {
            titre: B[7].titre,
            confirme: confirmationModele(7),
            lignesVivantes: true,
            lignes: function () { return lignesDe(B[7].lignes).concat([{ texte: K().consigneDesSuites(suitesDuModele()), geste: true }]); },
            centre: true,
            sansSortie: true,
            get boutons() { return suitesDuModele(); }
        }
    ];

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard', objectif: TEXTES_MODELE.objectif, objectifAtteint: TEXTES_MODELE.objectifAtteint };

    /**
     * « Refaire » (au panneau) : ce que CE modèle a écrit dans la démo — le cinquième critère (les quatre autres retrouvent
     * leurs pondérations d'avant), les codes posés sur la copie d'Antilope Vaillante, son évaluation. Les clés écrites
     * doivent être celles de la démo. Le reste (Tapir Doux, les modèles d'avant) reste.
     */
    async function defaireModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo() || typeof cle !== 'function') return false;
        var cleG = cle('grillesTemplates'), cleE = cle('evaluationsSauvegardees'), cleA = cle('annotationsTravaux');
        if ([cleG, cleE, cleA].some(function (k) { return k.indexOf('demo_') !== 0; })) return false;
        var g = grilleDuModele(), copie = copieDAntilope(), e = evaluationDAntilope();
        if (g) db.setSync(cleG, (db.getSync(cleG, []) || []).map(function (x) { return x && x.id === g.id ? grilleSansLeCritere(x) : x; }));
        retirerDeLaListe(cleA, copie && function (a) { return a.fichierId === copie.id; });
        retirerDeLaListe(cleE, e && function (x) { return x.id === e.id; });
        refermerLaFiche(g);
        return true;
    }

    /** La grille de l'exemple sans le cinquième critère ; les quatre autres retrouvent leurs pondérations d'avant (une copie). */
    function grilleSansLeCritere(x) {
        var y = JSON.parse(JSON.stringify(x));
        y.criteres = (y.criteres || []).filter(function (c) { return c && c.nom !== MATERIEL_MODELE.critere; });
        y.criteres.forEach(function (c) { if (MATERIEL_MODELE.avant[c.nom] !== undefined) c.ponderation = MATERIEL_MODELE.avant[c.nom]; });
        return y;
    }

    /** Retire d'une liste de la démo ce que `vise` reconnaît ; sans `vise`, rien n'est écrit. */
    function retirerDeLaListe(cleListe, vise) {
        if (!vise) return;
        db.setSync(cleListe, (db.getSync(cleListe, []) || []).filter(function (o) { return !o || !vise(o); }));
    }

    /**
     * La fiche de la grille de l'exemple, restée ouverte, montrerait encore le cinquième critère et son atelier (mesuré au
     * banc : les bulles 1 et 2 se croyaient faites) : elle se referme ; la bulle 1 la fait rouvrir par le menu.
     */
    function refermerLaFiche(g) {
        var ouverte = typeof grilleTemplateActuelle !== 'undefined' ? grilleTemplateActuelle : null;
        if (g && ouverte && ouverte.id === g.id && typeof annulerFormGrille === 'function') annulerFormGrille();
    }

    /** Ce qu'un passage interrompu (« Plus tard ») a laissé : le cinquième critère, des codes, une évaluation non verrouillée. */
    function passageInterrompu() {
        var g = grilleDuModele(), copie = copieDAntilope(), e = evaluationDAntilope();
        var critereLa = !!g && (g.criteres || []).some(function (c) { return c && c.nom === MATERIEL_MODELE.critere; });
        var codesLa = !!copie && deLaDemo('annotationsTravaux').some(function (a) { return a && a.fichierId === copie.id; });
        return !(e && e.verrouillee) && (critereLa || codesLa || !!e);
    }

    async function lancerModele() {
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        if (refusModele()) {
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-modele-bouton');
                if (b) b.click();
            }
            return;
        }
        // Le modèle ne reprend pas au milieu (DÉCIDÉ par la session, 22 nov. 2026) : un passage interrompu repart de la
        // bulle 1, après avoir retiré de la démo ce que CE modèle y avait posé (sinon un second « Français écrit »
        // s'ajouterait). Fini (l'évaluation verrouillée), il repart de sa dernière bulle ; « Refaire » défait tout.
        if (passageInterrompu()) await defaireModele();
        enModele = true;
        ctxModele = { grilleId: grilleDuModele().id };
        formeLitModele = false;
        cartesAuDepart = { cle: null, n: 0 };
        var e = evaluationDAntilope();
        var depuis = e && e.verrouillee ? ETAPES_MODELE.length - 1 : 0;
        debutDuModele = depuis;
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(DEF_MODELE, {
            depuis: depuis,
            surEtape: function (n) { window.Assistance.definirEtatModele(ID, 'en-cours', n); },
            surQuitter: function () { enModele = false; },
            surEchap: function () { terminerModele(); },
            verifier: enDemo
        });
    }

    function terminerModele() {
        enModele = false;
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    // ---------- Le lancement, « Plus tard », la fin ----------

    async function lancer(depuis) {
        enModele = false;   // la Pratique guidée : son contexte à elle (la préférence)
        var e = window.Assistance.etatDe(ID);
        var reprise = e.etat === 'en-cours' && depuis > 0;
        var c = reprise ? lireCtx() : {};
        if (!reprise) ecrireCtx(c);
        var chemin = Array.isArray(c.chemin) && c.chemin.length ? c.chemin : cheminDe(c, sautsPrevus(c));
        poserChemin(chemin);
        var i = Math.min(reprise ? depuis : 0, chemin.length - 1);
        debutDuPassage = i;
        formeLit = false;
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
        prealable: function (raison) { return raison === REFUS_MODELE ? 'recevoir' : 'evaluer'; },
        lancer: lancer,
        // Les deux temps (22 nov. 2026) : le modèle, dans la démo, sur le deuxième groupe.
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele,
        refusModele: refusModele,
        defaireModele: defaireModele
    });

    // Pour les bancs : les étapes telles qu'elles sont posées, et le chemin courant.
    window.ParcoursCommentaires = { etapes: ETAPES, textes: TEXTES, objectifs: OBJECTIFS, attentes: ATTENTES, ordre: ORDRE,
        textesModele: TEXTES_MODELE, etapesModele: ETAPES_MODELE, definitionModele: DEF_MODELE, materielModele: MATERIEL_MODELE,
        refusModele: refusModele, texteRefusModele: REFUS_MODELE, enModele: function () { return enModele; },
        chemin: function () { return DEF.etapes.slice(); }, definition: DEF, refus: refus };
})();
