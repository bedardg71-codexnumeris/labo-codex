/* =================================================================
   LE PARCOURS « ÉVALUER UNE PREMIÈRE PRODUCTION » (troisième parcours, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md.

   De ta propre grille à la rétroaction de ta première évaluation, réécrite avec tes mots : la
   grille (Mon matériel), la production, ses consignes, une première évaluation (sur papier, si tu
   veux), la pratique de notation, son application au cours actif, le point qui s'allume dans le
   Suivi, la cartouche, puis la rétroaction réécrite. Il ne démarre jamais de lui-même.

   ⚠ Les neuf textes, la bulle du choix et la phrase du panneau sont ceux que Grégoire a validés
   le 8 nov. (7 h 37 à 8 h 08, revus de 13 h 51 à 14 h 20), avec les six corrections du 9 nov.
   (étapes 3, 4, 5, 6, 7 et 9), posés mot pour mot :
   tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js les confronte à la consigne.

   · Une étape avance quand la donnée est RÉELLEMENT enregistrée (une grille, une production, la
     case « Consignes transmises », une évaluation verrouillée, une pratique, son application, une
     cartouche) ; l'étape 7 attend « Continuer », la 9, « Terminer ».
   · Ce qui existait au départ ne fait pas avancer : le parcours retient, à « Commencer », ce qui
     était déjà là, et ensuite ce qu'il a vu naître (`parcoursEvaluer`, une préférence : des
     identifiants, rien des données de la personne). « Reprendre » relit ce repère.
   · Il se joue sur les vraies données : si la démo est ouverte, il la referme d'abord ; si elle
     s'ouvre en route, il se ferme et attend.
   · La condition d'entrée : une classe en place (un groupe-cours réel avec ses étudiant·es).
   ================================================================= */
(function () {
    'use strict';

    var ID = 'evaluer';
    var CLE_CTX = 'parcoursEvaluer';
    var M = function () { return window.ParcoursMoteur; };

    // Texte validé par Grégoire (8 nov., 14 h 20) : la phrase du panneau quand aucune classe n'existe.
    var REFUS_SANS_CLASSE = "Commence par « Mettre ta classe en place » : il faut une classe pour évaluer une production.";

    // ---------- Utilitaires (ceux des deux premiers parcours ; le moteur ne les offre pas) ----------

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

    function el(id) { return document.getElementById(id); }
    function vis(e) { return !!(e && M().visible(e)); }
    function qs(sel) { return document.querySelector(sel); }

    function sousSectionVisible(id) { return vis(el(id)); }

    /** Le premier champ visible encore vide de la liste (par id), sinon `fin` : le contour suit ce qui reste à remplir. */
    function premierAFaire(idsChamps, fin) {
        for (var k = 0; k < idsChamps.length; k++) {
            var c = el(idsChamps[k]);
            if (vis(c) && String(c.value || '').trim() === '') return c;
        }
        return fin;
    }

    /** Une zone pleine largeur : seule la cible est désignée (la bulle s'y accroche, qu'elle suit au défilement). */
    function surLaCible(cible) {
        return [cible];
    }

    function aller(section, sous) {
        if (sousSectionVisible(section + '-' + sous)) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    function enDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    // ---------- Ce que le parcours retient (`parcoursEvaluer`) ----------

    // Le modèle (13 nov. 2026) se joue dans la démo : ce qu'il retient reste en mémoire, jamais dans les préférences,
    // qui sont des données réelles. Il le reconstruit à chaque lancement à partir de ce que la démo contient.
    var enModele = false;
    var ctxModele = {};

    function lireCtx() {
        if (enModele) return ctxModele;
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? v : {};
    }

    function majCtx(maj) {
        if (enModele) { ctxModele = Object.assign({}, ctxModele, maj); return ctxModele; }
        var ctx = Object.assign({}, lireCtx(), maj);
        if (typeof definirPreference === 'function') definirPreference(CLE_CTX, ctx);
        return ctx;
    }

    // ---------- Les données, lues ----------

    function lireListe(nom) {
        if (typeof db === 'undefined' || typeof cle !== 'function') return [];
        var v = db.getSync(cle(nom), []);
        return Array.isArray(v) ? v : [];
    }

    function ids(liste) {
        return liste.filter(function (x) { return x && x.id; }).map(function (x) { return x.id; });
    }

    function grilles() { return lireListe('grillesTemplates'); }
    function productions() { return lireListe('productions'); }
    function pratiques() { return lireListe('pratiquesConfigurables'); }
    function evaluations() { return lireListe('evaluationsSauvegardees'); }
    function cartouchesDe(grilleId) { return grilleId ? lireListe('cartouches_' + grilleId) : []; }

    function parId(liste, id) {
        return liste.find(function (x) { return x && x.id === id; }) || null;
    }

    function nouveau(liste, avant) {
        var deja = Array.isArray(avant) ? avant : [];
        return liste.find(function (x) { return x && x.id && deja.indexOf(x.id) === -1; }) || null;
    }

    /** Le groupe-cours actif (le pointeur que lisent le Cadre et le deuxième parcours ; les échéances s'y rangent). */
    function groupeCoursActifId() {
        var gc = typeof db !== 'undefined' ? db.getSync('groupeCoursActif', null) : null;
        return gc && gc.id ? gc.id : null;
    }

    /** La pratique appliquée au groupe-cours actif, lue par la désignation unique du registre (lot N1b). */
    function pratiqueAppliquee() {
        var d = typeof window.designerPratiqueActive === 'function' ? window.designerPratiqueActive() : null;
        return d && d.idBrut ? d.idBrut : null;
    }

    function laProduction() { return parId(productions(), lireCtx().productionId); }

    /** La grille du parcours : celle de la production, sinon celle que Mon matériel vient de créer. */
    function laGrilleId() {
        var p = laProduction();
        return (p && p.grilleId) || lireCtx().grilleId || null;
    }

    // ---------- La condition d'entrée ----------

    /**
     * Une classe en place : un groupe-cours réel avec ses étudiant·es. La démo ouverte, son groupe ne compte pas :
     * le pointeur réel est celui qu'elle a gardé en entrant (`demo-etat-precedent`, demo-activation.js) ; les
     * étudiant·es se relisent au lancement, une fois la démo refermée. Un service d'orthopédagogie n'évalue pas de
     * production.
     */
    function classeEnPlace() {
        if (enDemo()) {
            var avant = typeof db !== 'undefined' ? db.getSync('demo-etat-precedent', null) : null;
            return !!(avant && avant.groupeCoursActif && avant.groupeCoursActif.id);
        }
        if (typeof contexteActifEstService === 'function' && contexteActifEstService()) return false;
        if (!groupeCoursActifId()) return false;
        var etudiants = typeof obtenirEtudiantsCoursActif === 'function' ? (obtenirEtudiantsCoursActif() || []) : [];
        return etudiants.length > 0;
    }

    function condition() { return classeEnPlace() ? null : REFUS_SANS_CLASSE; }

    // ---------- Étape 1 : la grille (Mon matériel) ----------

    function dissectionOuverte() { return vis(el('materiel-dissection')); }
    function choixVisible() { return vis(el('dissection-creer-choix')); }
    function editeurGrilleVisible() { return sousSectionVisible('conception-grille-criteres'); }
    function dissection() { return window.materielDissection || null; }
    function exempleOuvert() { var d = dissection(); return dissectionOuverte() && d ? d.exempleOuvert() : null; }

    /**
     * Lot de la dissection sur l'iPad (12 nov. 2026), revu le 14 nov. 2026 (essai novice de Grégoire, lot 4). L'étape 1
     * a plusieurs façons de se montrer (`modeEtape1`) :
     *  · 'pourquoi', puis 'apprends' : les deux bulles d'ouverture, avant « Ta grille » (lot 4b) ;
     *  · 'accueil' : la page d'accueil de « Mon matériel ». La bulle ne porte plus de bouton d'action (règle 5 : « la
     *    bulle guide, la page agit ») : elle montre la zone où coller et les deux boutons de l'exemple, qui sont sur la
     *    page (lot 4c). L'exemple n'est plus « offert » par la bulle ;
     *  · 'exemple-haut', 'exemple-bas' : devant l'exemple étiqueté, puis devant la grille telle que l'application la
     *    comprend, quand elle est à l'écran (lots 4d et 4e) ;
     *  · 'choix' : la bulle du choix des points ou des niveaux (inchangée) ;
     *  · 'existante' : une grille déjà dans l'application, ouverte dans Conception › Grilles (point 7) : « Prendre cette
     *    grille » fait passer à « Ta production » avec elle ;
     *  · 'composer' : Conception › Grilles sans grille ouverte (« Composer ma grille », 13 nov. 2026) ;
     *  · 'grille' : l'étiquetage (sa grille, ou l'exercice sur l'exemple) : l'aide pas à pas, point 4.
     * Le moteur rend la bulle une fois par étape : quand la façon change, la même étape est rendue de nouveau (`allerA`,
     * sans refondre le moteur) ; `avant` ne déplace rien. Dans une même façon, la ligne du geste suit l'état (le moteur la relit).
     */
    var modeRendu = 'grille';

    /** La grille déjà enregistrée ouverte dans l'éditeur de Conception › Grilles (pas une grille en création). */
    function grilleOuverteDansLEditeur() {
        if (!editeurGrilleVisible() || !vis(el('conteneurEditionGrille'))) return null;
        var g = typeof grilleTemplateActuelle !== 'undefined' ? grilleTemplateActuelle : null;   // eslint-disable-line no-undef
        return g && g.id ? parId(grilles(), g.id) : null;
    }

    function modeEtape1() {
        // Les deux bulles d'ouverture : seulement à « Commencer » et à « Refaire » (`poserLeRepere`) ; un parcours en
        // cours avant ce lot n'a pas `ouverture` dans son repère, et reprend où il était.
        var ouverture = lireCtx().ouverture;
        if (ouverture === 0) return 'pourquoi';
        if (ouverture === 1) return 'apprends';
        if (choixVisible() && !exempleOuvert()) return 'choix';
        if (grilleOuverteDansLEditeur()) return 'existante';
        // 13 nov. 2026 : dans Conception › Grilles (« Composer ma grille »), l'étape a son texte (`TEXTE_1_COMPOSER`).
        if (editeurGrilleVisible() && !dissectionOuverte()) return 'composer';
        if (exempleOuvert() === 'complet') return lectureDevant() ? 'exemple-bas' : 'exemple-haut';
        if (!dissectionOuverte() && vis(el('materiel-accueil'))) return 'accueil';
        return 'grille';
    }

    /**
     * L'exemple étiqueté : la grille « telle que l'application la comprendrait » est-elle devant la personne ? Son haut
     * a passé le milieu de l'écran. (Pas « une partie à l'écran » : la bulle changerait dès que son titre paraît.)
     */
    function lectureDevant() {
        var r = qs('#materiel-dissection .dissection-resultat');
        if (!vis(r)) return false;
        return r.getBoundingClientRect().top < window.innerHeight / 2;
    }

    function continuerLOuverture() {
        majCtx({ ouverture: (lireCtx().ouverture || 0) + 1 });
        M().allerA(0);
    }

    function grilleCreee() {
        var g = nouveau(grilles(), lireCtx().grillesAvant);
        // Une grille née avec ses rétroactions (Mon matériel peut créer sa cartouche) : elles ne font pas avancer l'étape 8.
        if (g && !lireCtx().grilleId) majCtx({ grilleId: g.id, cartouchesAvant: (lireCtx().cartouchesAvant || []).concat(ids(cartouchesDe(g.id))) });
        return !!g;
    }

    /** Point 7 : une grille déjà là, prise par « Prendre cette grille » (son identifiant retenu, rien d'écrit dans les données). */
    function grillePrise() {
        var ctx = lireCtx();
        return !!(ctx.grillePrise && ctx.grilleId && parId(grilles(), ctx.grilleId));
    }

    function prendreCetteGrille() {
        var g = grilleOuverteDansLEditeur();
        if (g) majCtx({ grilleId: g.id, grillePrise: true });
    }

    /**
     * Lot « La carte d'aide dans Apporter mon matériel » (13 nov. 2026) : ce qui guide l'accueil, l'étiquetage et
     * l'exemple ne dépend que de la page ; il vit dans `materiel-aide.js`, que cette étape et la carte de la page
     * appellent toutes deux (les zones, les flèches, ce que la carte évite, le halo, la ligne du geste, le complément).
     */
    function A() { return window.MaterielAide; }

    /** Toutes les cartouches existantes, toutes grilles confondues (le repère de « Commencer »). */
    function toutesLesCartouches() {
        return grilles().reduce(function (acc, g) { return acc.concat(ids(cartouchesDe(g && g.id))); }, []);
    }

    function zonesEtape1() {
        if (modeRendu === 'choix') return [el('dissection-creer-choix')];
        // Les deux bulles d'ouverture ne désignent rien, mais elles ne couvrent ni le texte de la page ni la zone où
        // coller (vécu le 14 nov. : la bulle, au centre, cachait les deux) : la bulle les évite, sans flèche.
        if (modeRendu === 'pourquoi' || modeRendu === 'apprends') return [qs('#materiel-accueil .materiel-intro'), qs('#materiel-accueil .materiel-collage')].filter(vis);
        if (modeRendu === 'exemple-bas') return ciblesDeLaLecture();
        if (dissectionOuverte()) return A().zones();
        if (editeurGrilleVisible()) return [el('conception-grille-criteres')];
        if (modeRendu === 'accueil') return [el('materiel-zone-collage')].concat(boutonsDeLExemple());
        return A().zones();
    }

    /** Dans la dissection, la bulle ne couvre jamais ce que l'aide désigne ; l'exemple complet : sa lecture. */
    function aussiEviterEtape1() {
        // Les bulles d'ouverture : la zone où coller d'abord. Quand l'écran n'a pas de place libre (1180 × 820), la
        // bulle mord sur le texte de la page plutôt que sur le formulaire.
        if (modeRendu === 'pourquoi' || modeRendu === 'apprends') return [el('materiel-zone-collage')].filter(vis);
        return dissectionOuverte() ? A().aussiEviter() : [];
    }

    /** Les deux boutons de l'exemple, sur la page d'accueil (« Voir un exemple de grille étiquetée », « Étiqueter l'exemple moi-même »). */
    function boutonsDeLExemple() {
        return [].slice.call(document.querySelectorAll('#materiel-accueil [data-action="materiel.ouvrirExemple"]')).filter(vis);
    }

    /** Devant la grille comprise : la grille refaite, son résumé, le choix du résultat ; une flèche par ligne de la bulle. */
    function ciblesDeLaLecture() {
        return [el('dissection-comprise'), el('dissection-constats'), el('dissection-creer-choix')].filter(vis);
    }

    function contourEtape1() {
        if (modeRendu === 'pourquoi' || modeRendu === 'apprends') return null;
        if (modeRendu === 'exemple-haut' || modeRendu === 'exemple-bas') return null;   // rien à toucher : on regarde
        if (modeRendu === 'choix') return el('dissection-creer-choix');
        if (dissectionOuverte()) return A().contour();
        if (modeRendu === 'existante') return null;   // « Prendre cette grille » est dans la bulle
        if (editeurGrilleVisible()) {
            if (vis(el('btnCreerGrille'))) return el('btnCreerGrille');
            var nouvelle = qs('#conception-grille-criteres [data-action="creerNouvelleGrille"]');
            return vis(nouvelle) ? nouvelle : null;
        }
        return A().contour();
    }

    // Lignes du geste PROPOSÉES (12 nov. 2026, à valider par Grégoire) : elles nomment les boutons tels qu'ils sont écrits.
    // Celles de l'accueil, de l'étiquetage et de l'exemple ouvert : `materiel-aide.js` (`geste`).
    var GESTE_GRILLES = "Touche « + Nouvelle grille », compose-la, puis touche « Créer la grille » ; ou ouvre une de tes grilles.";
    var GESTE_EXISTANTE = "Touche « Prendre cette grille » pour évaluer avec la grille ouverte ; ou ouvre-en une autre.";

    function gesteEtape1() {
        // Les bulles en lignes portent leur consigne en dernière ligne (règle 2) : pas de ligne du geste à part.
        if (LIGNES_1[modeRendu]) return '';
        if (modeRendu === 'choix') return "Choisis les points ou les niveaux.";
        if (dissectionOuverte()) return A().geste();
        if (modeRendu === 'existante') return GESTE_EXISTANTE;
        if (editeurGrilleVisible()) return GESTE_GRILLES;
        return A().geste();
    }

    /**
     * Le complément de la bulle (13 nov. 2026) : les consignes que la page ne dit plus, à la suite du texte validé, qui
     * ne change pas. Dans l'étiquetage seulement : ni devant le choix des points ou des niveaux, ni dans Conception ›
     * Grilles, ni dans une bulle en lignes (elle tient en une page, 14 nov. 2026).
     */
    function complementEtape1() {
        if (modeRendu !== 'grille') return null;
        return A().complement();
    }

    /** Les boutons de la bulle, selon la façon dont l'étape se montre (rendus avec la bulle). */
    function boutonsEtape1() {
        if (modeRendu === 'pourquoi' || modeRendu === 'apprends') return [{ libelle: 'Continuer', primaire: true, action: continuerLOuverture }];
        if (modeRendu === 'existante') return [{ libelle: 'Prendre cette grille', primaire: true, action: prendreCetteGrille }];
        // 14 nov. 2026 (règle 5) : « Prendre une grille déjà créée » n'est plus dans la bulle ; « Composer ma grille », sur
        // la page, mène au même endroit (Conception › Grilles), où une grille ouverte se prend (« Prendre cette grille »).
        return null;
    }

    // ---------- Étape 2 et 3 : la production, ses consignes ----------

    function ficheProductionOuverte() { return vis(el('formulaireProduction')); }

    // Vrai quand l'étape 2 vient de voir naître la production : l'application rouvre alors sa fiche elle-même.
    var vientDeCreer = false;

    function productionCreee() {
        var p = nouveau(productions(), lireCtx().productionsAvant);
        if (p && !lireCtx().productionId) { majCtx({ productionId: p.id }); vientDeCreer = true; }
        return !!p;
    }

    function consignesTransmises() {
        var p = laProduction();
        var gc = groupeCoursActifId();
        var entree = p && gc && p.echeancesParGroupe ? p.echeancesParGroupe[gc] : null;
        return !!(entree && entree.assignee === true && entree.date);
    }

    function ficheDe(id) {
        return typeof productionEnEdition !== 'undefined' && productionEnEdition === id && ficheProductionOuverte();
    }

    /**
     * La fiche de la production du parcours, ouverte (la reprise, ou après un détour). Rien ne s'écrit. Juste après
     * « Créer la production », l'application ferme la fiche, puis la rouvre elle-même (`sauvegarderProduction`) : on
     * l'attend d'abord. La rouvrir en même temps qu'elle faisait parfois paraître une question (mesuré sous Chromium).
     */
    async function ouvrirLaProduction() {
        aller('conception', 'productions');
        await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
        var id = lireCtx().productionId;
        if (!id || typeof window.modifierProduction !== 'function') return;
        var attente = vientDeCreer ? 3000 : 1;   // 0 vaudrait le délai par défaut d’`attendre`
        vientDeCreer = false;
        if (await attendre(function () { return ficheDe(id); }, attente)) return;
        await window.modifierProduction(id);
        await attendre(function () { return ficheDe(id); }, 2000);
    }

    /** Le menu de la fiche et son étiquette (« Grille de critères d'évaluation », « Échelle de performance »). */
    function groupeDe(id) {
        var s = el(id);
        return s ? (s.closest('.groupe-form') || s) : null;
    }

    /**
     * « … et son échelle si elle en a une » (Grégoire, 9 nov., 13 h 37 ; 11 nov., 9 h 35). L'échelle est attendue tant
     * qu'elle est à « Aucune » et que la grille choisie se note par niveaux : une grille entièrement en points n'en
     * demande pas (`grilleEntierementEnPoints`, la règle de l'évaluation, #941). Avant le 11 nov., l'échelle n'était
     * cherchée que dans les descripteurs de la grille, que l'éditeur de Conception › Grilles ne pose pas : une grille
     * composée à la main n'y passait jamais (capture 16). Seulement si le menu offre au moins une échelle.
     */
    function echelleAttendue() {
        var sg = el('productionGrille'), se = el('productionEchelle');
        if (!sg || !sg.value || !se || se.value) return false;
        var g = parId(grilles(), sg.value);
        if (!g || typeof window.grilleEntierementEnPoints !== 'function' || window.grilleEntierementEnPoints(g)) return false;
        return [].some.call(se.options, function (o) { return !!o.value; });
    }

    /**
     * Étape 2, les champs obligatoires remplis (la règle des formulaires, `formulaire`) : la grille si elle manque, puis
     * l'échelle attendue. « Puis associe-lui la grille que tu viens de créer, et son échelle si elle en a une. »
     */
    function aAssocier() {
        if (!ficheProductionOuverte()) return [];
        var sg = el('productionGrille');
        if (vis(sg) && !sg.value) return [groupeDe('productionGrille')];
        return echelleAttendue() ? [groupeDe('productionEchelle')] : [];
    }

    /**
     * Sur la fiche de la production, la bulle ne couvre jamais les menus « Grille de critères d'évaluation » ni
     * « Échelle de performance » (Grégoire, 9 nov., 13 h 37) : ils sont désignés avec le champ visé, et le moteur pose
     * la bulle hors de leur union. La bulle accrochée au champ (gardé, même décision).
     */
    function surLaFiche(cible) {
        var menus = ['productionGrille', 'productionEchelle'].map(groupeDe);
        return surLaCible(cible).concat(menus.filter(vis));
    }

    function caseConsignes() {
        var c = el('productionEcheanceAssignee');
        return c ? (c.closest('.echeance-simple-ligne') || c) : qs('#listeEcheancesGroupes .echeance-gc-checkbox');
    }

    // ---------- Étapes 4 et 9 : l'évaluation ----------

    function ecranEvaluationVisible() { return vis(el('evaluations-contenu-evaluation')); }

    function evaluationVerrouillee() {
        var pid = lireCtx().productionId, da = daDeLaLigne();
        var e = evaluations().find(function (x) {
            return x && x.productionId === pid && x.verrouillee === true && !x.remplaceeParId && (!da || String(x.etudiantDA) === da);
        });
        if (e && !lireCtx().evaluationId) majCtx({ evaluationId: e.id, evaluationDA: e.etudiantDA });
        return !!e;
    }

    /**
     * L'étudiant·e que l'étape 4 désigne : dans le modèle, toujours celle du matériel (Grégoire, 17 nov. 2026 : la
     * première ligne de la Liste suivait son tri, et un tri par prénom désignait Antilope Vaillante, l'une des trois
     * copies du modèle de « Recevoir ») ; dans le parcours, la première ligne (rien de désigné : `undefined`).
     */
    function daDeLaLigne() { return enModele ? MATERIEL.etudiantEvalue.da : undefined; }

    /** La ligne de l'étape 4 : celle de la production, et dans le modèle, celle de l'étudiant·e du matériel. */
    function ligneAEvaluer() { return ligneDeLaListe(lireCtx().productionId, daDeLaLigne()); }

    /** La ligne de la Liste qui porte cette production (et cet·te étudiant·e, si donné·e). */
    function ligneDeLaListe(productionId, da) {
        var lignes = document.querySelectorAll('#evaluations-liste select.eval-actions-select');
        for (var k = 0; k < lignes.length; k++) {
            var s = lignes[k];
            var vals = [].map.call(s.options, function (o) { return o.value; }).join(' ');
            if (vals.indexOf('|' + productionId) === -1) continue;
            if (da && vals.indexOf('|' + da + '|') === -1 && vals.indexOf('|' + da) === -1) continue;
            if (!vis(s)) continue;
            return s;
        }
        return null;
    }

    function rangeeDe(select) { return select ? (select.closest('tr') || select.parentElement) : null; }

    /**
     * Le menu « Actions… » d'une ligne, amené dans la vue de côté : à 1180 px, la Liste dépasse l'écran (l'application le
     * dit : « Le tableau dépasse l'écran ») et la colonne « Actions » restait hors de vue, son contour avec elle (captures du
     * 9 nov.). Le moteur n'amène que de haut en bas.
     */
    function amenerDeCote(el) {
        if (!el) return;
        var r = el.getBoundingClientRect();
        if (r.right > window.innerWidth || r.left < 0) el.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    /** Un critère encore sans niveau ni points : le menu du niveau, ou le champ des points. */
    function critereAAttribuer() {
        var champs = document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]');
        for (var k = 0; k < champs.length; k++) {
            var c = champs[k];
            if (vis(c) && String(c.value || '').trim() === '') return c;
        }
        return null;
    }

    /**
     * Où toucher en évaluant : l'échelle, si les critères l'attendent (une grille à niveaux, une production qui n'en
     * nomme pas et plus d'une échelle au trimestre : l'écran dit « Choisis maintenant une échelle de performance »,
     * mesuré sous Chromium le 9 nov.) ; puis le premier critère sans niveau ni points ; puis « Verrouiller ».
     */
    function ouToucherEnEvaluant() {
        var echelle = el('selectEchelle1');
        var critere = critereAAttribuer();
        if (!critere && vis(echelle) && !echelle.value && !qs('#listeCriteresGrille1 [id^="eval_"]')) return echelle;
        return critere || boutonVerrou();
    }

    function boutonVerrou() { return el('btnVerrouillerEvaluation'); }

    /** L'écran d'évaluation a fini de se dessiner : ses critères sont là, ou il demande l'échelle. */
    function evaluationPrete() {
        if (!ecranEvaluationVisible()) return false;
        if (qs('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]')) return true;
        return ouToucherEnEvaluant() === el('selectEchelle1');
    }

    /** Étape 9 : « Déverrouiller », puis la cartouche, puis « Verrouiller ». */
    function ouToucherEnReecrivant() {
        if (evaluationOuverteVerrouillee()) return boutonVerrou();
        var s = el('selectCartoucheEval');
        return s && vis(s) && !s.value ? s : boutonVerrou();
    }

    function evaluationOuverteVerrouillee() {
        var b = boutonVerrou();
        return !!(b && /Déverrouiller/.test((b.getAttribute('aria-label') || '') + ' ' + (b.title || '') + ' ' + b.textContent));
    }

    // ---------- Étapes 5 et 6 : la pratique ----------

    function wizardOuvert() {
        var m = el('modalWizardPratiqueV2');
        return !!(m && m.classList.contains('actif'));
    }

    // La bulle et le contour au-dessus de l'assistant, tant qu'il est ouvert (css/parcours.css, la règle du neuvième
    // parcours). Pas sur un téléphone : l'assistant y prend tout l'écran ; la bulle attend derrière lui.
    var LARGEUR_MIN_SUR_MODALE = 700;
    function surModale(oui) {
        document.body.classList.toggle('parcours-sur-modale', !!oui && window.innerWidth >= LARGEUR_MIN_SUR_MODALE);
    }

    function pratiqueCreee() {
        var p = nouveau(pratiques(), lireCtx().pratiquesAvant);
        if (p && !lireCtx().pratiqueId) majCtx({ pratiqueId: p.id });
        return !!p;
    }

    function fichePratiqueOuverte() {
        var c = el('conteneurEditionPratique');
        return !!(c && !c.classList.contains('u-hide') && vis(c));
    }

    function boutonAppliquer() { return qs('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]'); }

    // « Appliquer au cours actif » est au pied de la fiche (à y ≈ 1 867 px pour 900 px d'écran, mesuré par la session H) :
    // la fiche ouverte, il est amené dans la vue. La fiche se dessine
    // en plusieurs temps et peut remonter la page : il y est ramené pendant les vingt premiers passages de la sonde
    // (environ deux secondes et demie), puis la personne garde la main.
    var appliquerAmene = 0;
    function amenerAppliquer() {
        var b = boutonAppliquer();
        if (appliquerAmene >= 20 || !vis(b)) return;
        appliquerAmene++;
        var r = b.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) b.scrollIntoView({ block: 'center' });
    }

    function pratiqueEstAppliquee() {
        var id = pratiqueAppliquee();
        return !!(id && id !== lireCtx().pratiqueAppliqueeAvant);
    }

    // ---------- Étape 7 : la bande de performance ----------

    function blocPerformance() {
        var h = qs('#section-suivi h4[data-tooltip="tdb-performance"]');
        return h ? h.parentElement : null;
    }

    // ---------- Étape 8 : la cartouche ----------

    function cartoucheCreee() {
        var ctx = lireCtx();
        var c = nouveau(cartouchesDe(laGrilleId()), ctx.cartouchesAvant);
        if (c && !ctx.cartoucheId) majCtx({ cartoucheId: c.id });
        return !!c;
    }

    function ficheCartoucheOuverte() { return vis(el('btnCreerCartouche')) || vis(el('actionsFicheCartouche')); }

    /** La production du parcours nomme la cartouche née à l'étape 8 (décision de Grégoire, 9 nov., 15 h 55). */
    function productionNommeLaCartouche() {
        var ctx = lireCtx(), p = laProduction();
        return !!(p && ctx.cartoucheId && p.cartoucheId === ctx.cartoucheId);
    }

    /**
     * La cartouche créée, où la nommer : son menu dans la fiche de la production ; sinon « Modifier » sur la ligne de la
     * production ; sinon l'onglet « Productions ». Le parcours ne change pas de page à ta place : la cartouche vient
     * d'être créée, et ses commentaires s'écrivent dans sa matrice, sur la page des cartouches.
     */
    function ouNommerLaCartouche() {
        var id = lireCtx().productionId;
        if (ficheDe(id)) return el('productionCartouche');
        if (sousSectionVisible('conception-productions')) return qs('#conception-productions [data-action="modifierProduction"][data-param="' + id + '"]');
        return qs('#sous-navigation [data-sous-onglet="conception-productions"]');
    }

    /**
     * La fiche ouverte, son menu « Cartouche de rétroaction » est amené dans la vue, entier (Cowork et Grégoire, 9 nov.,
     * 17 h 52, sur la capture ; mesuré : à 1180 × 900, il restait à 938 px, sous le bas de l'écran, sans défilement
     * ensuite, et rien ne disait où aller). La fiche se dessine en plusieurs temps : il y est ramené pendant les vingt
     * premiers passages de la sonde (environ deux secondes et demie), puis la personne garde la main.
     */
    var cartoucheAmenee = 0;
    function amenerLaCartouche() {
        var s = el('productionCartouche');
        if (cartoucheAmenee >= 20 || !vis(s)) return;
        cartoucheAmenee++;
        var r = s.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) s.scrollIntoView({ block: 'center' });
    }

    function zonesPourNommer() {
        var cible = ouNommerLaCartouche();
        if (ficheDe(lireCtx().productionId)) { amenerLaCartouche(); return surLaFiche(cible); }
        cartoucheAmenee = 0;
        return [cible];
    }

    function nomDeGrille(id) {
        var g = parId(grilles(), id);
        return g ? (g.nom || 'sans nom') : '';
    }

    /**
     * La grille sous laquelle est rangée la cartouche ouverte : celle de la cartouche en base, sinon (en création) celle
     * que montre son menu « Grille (critères) ».
     */
    function grilleDeLaCartoucheOuverte() {
        var c = window.cartoucheActuel;
        if (c && c.id && c.grilleId && cartouchesDe(c.grilleId).some(function (x) { return x && x.id === c.id; })) return c.grilleId;
        var s = el('selectGrilleCartouche');
        return s && vis(s) ? s.value : '';
    }

    /**
     * La cartouche ouverte est rangée sous une autre grille que celle du parcours (11 nov. 2026, captures 19 et 20,
     * BLOQUANT : « Cartouche de départ (copie) », sous « Grille de départ » ; la fiche de la production, grille « Test 1 »,
     * n'offrait que « Aucune », puisque son menu ne liste que les cartouches de SA grille). Mesuré sous WebKit : choisir
     * l'autre grille vide le menu de l'échelle, et rien ne se passe avant qu'une échelle soit choisie ; alors
     * l'application pose sa question et copie la cartouche sous la grille choisie (`traiterChangementDeGrilleCartouche`).
     * Cette copie est une cartouche neuve de la grille du parcours : l'étape la compte.
     */
    function cartoucheHorsDeLaGrille() {
        if (!ficheCartoucheOuverte() || cartoucheCreee()) return false;
        var g = grilleDeLaCartoucheOuverte(), id = laGrilleId();
        return !!(g && id && g !== id);
    }

    /** La grille du parcours déjà choisie dans la fiche, la cartouche pas encore copiée : reste l'échelle. */
    function grilleChoisieEchelleAttendue() {
        var s = el('selectGrilleCartouche'), e = el('selectEchelleCartouche');
        return cartoucheHorsDeLaGrille() && !!s && s.value === laGrilleId() && vis(e) && !e.value;
    }

    // Phrases PROPOSÉES (11 nov. 2026, à valider par Grégoire) : lues par l'enseignant·e.
    function avisCartouche() {
        if (!cartoucheHorsDeLaGrille()) return null;
        if (grilleChoisieEchelleAttendue()) {
            return "Choisis maintenant l'échelle : une copie de cette cartouche sera rangée sous « " + nomDeGrille(laGrilleId()) +
                " », et l'originale restera telle quelle.";
        }
        return "Cette cartouche est rangée sous la grille « " + nomDeGrille(grilleDeLaCartoucheOuverte()) +
            " » : pour que ta production la trouve, choisis « " + nomDeGrille(laGrilleId()) + " » dans « Grille (critères) ».";
    }

    /** Le menu à toucher quand la cartouche est hors de la grille : « Grille (critères) », puis l'échelle. */
    function menuHorsDeLaGrille() {
        return el(grilleChoisieEchelleAttendue() ? 'selectEchelleCartouche' : 'selectGrilleCartouche');
    }

    /**
     * Étape 8 : la grille, si la cartouche ouverte n'est pas sous celle du parcours ; sinon, en création, le nom, ta
     * grille, ton échelle, puis « Créer la cartouche ». Une cartouche déjà enregistrée n'a aucun geste utile à désigner :
     * rien (11 nov. 2026 : le halo tombait sur « Dupliquer · Supprimer · Fermer » ; jamais sur un groupe qui porte
     * « Supprimer »).
     */
    function ouToucherCartouche() {
        if (cartoucheHorsDeLaGrille()) return menuHorsDeLaGrille();
        var creer = el('btnCreerCartouche');
        if (!vis(creer)) return null;
        return premierAFaire(['nomCartouche', 'selectGrilleCartouche', 'selectEchelleCartouche'], creer);
    }

    // ---------- Les neuf étapes ----------

    // Les deux phrases sur la longueur de la dissection : validées par Grégoire mot pour mot (11 nov. 2026, 8 h 38).
    // « Composer ma grille », dernière phrase de TEXTE_1 (Grégoire, 11 nov., 8 h 58 ; mots validés).
    var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà : colle-la ici, puis montre à l'application ce que veut dire chaque partie (un critère, un niveau, des points). C'est ainsi qu'elle pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. C'est souvent long, parce que chaque grille est construite à sa façon et que l'application ne peut pas deviner le rôle de chaque partie. Mais tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle. Pas de grille sous la main ? Touche « Composer ma grille ».";
    // PROPOSÉ (13 nov. 2026, à valider par Grégoire) : dans Conception › Grilles (« Composer ma grille »), la bulle disait
    // encore « colle-la ici » (essai du 12 nov.). `TEXTE_1` ne change pas ailleurs.
    var TEXTE_1_COMPOSER = "Pour évaluer une première production, il te faut ta grille. Ici, tu la composes à la main : donne-lui un nom, puis ajoute ses critères un à un, avec leur pondération. C'est ainsi que l'application pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. Tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle. Ta grille existe déjà dans un document ? Reviens à « Mon matériel » pour la coller.";
    var TEXTE_1_CHOIX = "Ta grille porte des points et des niveaux. Le résultat d'une évaluation viendra de l'un ou de l'autre : des points qui s'additionnent en une note, ou un niveau par critère (comme « maîtrisé »), que ton échelle traduit ensuite en note. Choisis ce qui correspond à ta façon d'évaluer.";

    // ---------- Les bulles en lignes de l'étape 1 (essai novice du 14 nov. 2026, lot 4 b à e) ----------
    // plans de travail/CONSIGNE-2026-11-14-essai-novice.md. « Tu es dans « Conception », à l'onglet « Mon matériel ». »
    // est écrite par le moteur (`lieu`), d'après le menu.
    function note(texte) { return { texte: texte, note: true }; }
    function consigne(texte) { return { texte: texte, geste: true }; }

    var TITRES_1 = {
        // PROPOSÉ par Cowork (le texte de la bulle est validé, « sauf le titre »).
        pourquoi: 'Pourquoi étiqueter',
        apprends: 'Tu apprends aussi',
        'exemple-haut': "L'exemple étiqueté",
        'exemple-bas': "La grille, comprise par l'application"
    };

    var LIGNES_1 = {
        // Validé par Grégoire, 14 nov. 2026.
        pourquoi: [
            note("Ici, tu numérises ta grille. Une photo n'en garderait que l'apparence : l'application, elle, doit savoir ce que chaque partie veut dire. C'est toi qui le lui expliques, en posant une étiquette sur chaque partie : critère, niveau, pondération."),
            consigne("Touche « Continuer »")
        ],
        // Proposé par Cowork, d'après les mots de Grégoire.
        apprends: [
            note("Ces mots sont les mêmes pour toutes les disciplines, alors que chaque grille est faite à sa façon. En expliquant la tienne, tu découvriras peut-être un critère flou ou un total qui ne tombe pas juste. C'est normal : ici, l'enseignant·e apprend aussi, et l'erreur fait partie du travail."),
            consigne("Touche « Continuer »")
        ],
        // ÉCRIT le 14 nov. 2026 (à valider par Grégoire) : la consigne dit seulement que la bulle « montre la zone où
        // coller et les deux boutons de la page », sans en donner les mots.
        accueil: [
            { texte: "Colle ici la grille que tu utilises déjà (copie le tableau entier, depuis Word ou Pages)" },
            { texte: "Pas de grille sous la main ? Ces deux boutons ouvrent un exemple" },
            consigne("Colle ta grille, ou touche un des deux boutons")
        ],
        // Proposé par Cowork. Les couleurs nommées tiennent en clair et en sombre (lu dans styles.css le 14 nov. : le
        // fond d'une partie étiquetée est jaune pour « Critère », bleu pour « Descripteur », rose pour « Points », dans
        // les deux thèmes ; seul le trait fonce en clair).
        'exemple-haut': [
            { texte: "Chaque couleur est une étiquette : la légende, à gauche, les nomme" },
            { texte: "Regarde une rangée : le critère en jaune, ses descriptions en bleu, ses points en rose" },
            { texte: "Descends voir la grille telle que l'application la comprend" }
        ],
        // Validé par Grégoire, 14 nov. 2026 ; une flèche par ligne (`ciblesDeLaLecture`).
        'exemple-bas': [
            { texte: "C'est la grille de l'exemple, refaite d'après ses étiquettes" },
            { texte: "Ce résumé dit ce que l'application y a trouvé : 4 critères, 4 niveaux de performance, un total de 30 qui tombe juste" },
            { texte: "Le résultat d'une copie peut se compter en points, ou se dire par un niveau de performance, d'« Insuffisant » à « Remarquable »" }
        ]
    };

    function texteEtape1() {
        if (LIGNES_1[modeRendu]) return '';
        if (modeRendu === 'choix') return TEXTE_1_CHOIX;
        if (modeRendu === 'composer') return TEXTE_1_COMPOSER;
        // Dans l'étiquetage, la grille est déjà collée : la bulle ne redit pas « colle-la ici ». Elle ne porte que les
        // consignes de l'étiquetage (le complément) et la ligne du geste, qui suit le premier manque.
        return dissectionOuverte() ? '' : TEXTE_1;
    }

    var ETAPES = [
        {
            get titre() { return TITRES_1[modeRendu] || 'Ta grille'; },
            get texte() { return texteEtape1(); },
            lignes: function () { return LIGNES_1[modeRendu] || []; },
            // La page change à l'ouverture du parcours : la première bulle dit où l'on est, la page s'ouvre en haut.
            get lieu() { return modeRendu === 'pourquoi'; },
            // Devant l'exemple, la personne défile pour regarder : la bulle changée ne ramène rien dans la vue.
            get centre() { return modeRendu === 'exemple-haut' || modeRendu === 'exemple-bas'; },
            get geste() { return gesteEtape1(); },
            get boutons() { return boutonsEtape1(); },
            avant: async function () {
                modeRendu = modeEtape1();
                // La personne est peut-être déjà dans la dissection, ou dans l'éditeur (« Composer ma grille ») : rien ne bouge.
                if (sousSectionVisible('conception-materiel') || editeurGrilleVisible()) return;
                aller('conception', 'materiel');
                await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
            },
            zones: zonesEtape1,
            // L'aide : une flèche vers l'étiquette à prendre, une vers le morceau (ou le champ) ; l'exemple complet : ses zones.
            // Une bulle en lignes : ses flèches vont à ses zones (la zone de collage et les deux boutons ; la légende et
            // la grille ; la grille comprise, son résumé, le choix).
            fleches: function () {
                if (modeRendu === 'pourquoi' || modeRendu === 'apprends') return [];
                if (LIGNES_1[modeRendu]) return zonesEtape1();
                return dissectionOuverte() ? A().fleches() : null;
            },
            complement: complementEtape1,
            aussiEviter: aussiEviterEtape1,
            contour: contourEtape1,
            atteint: function () {
                if (grilleCreee() || grillePrise()) return true;
                if (modeEtape1() !== modeRendu) M().allerA(0);   // l'exemple, le choix, une grille déjà là, ou le retour à l'étape
                return false;
            }
        },
        {
            titre: 'Ta production',
            geste: "Touche « + Nouvelle production », remplis les champs obligatoires, choisis ta grille, puis touche « Créer la production ».",
            texte: "Une production, c'est ce que tes étudiant·es font dans une activité d'apprentissage : un texte, mais aussi un stage, un film, un enregistrement, une entrevue, un labo. Ce n'est pas toujours un objet qu'on remet : c'est ce que l'étudiant·e fait quand il ou elle apprend, et c'est cet apprentissage que tu évalues à travers elle. Décris celle que tu demandes : son titre, son type, sa pondération, et surtout l'activité d'apprentissage : c'est ce que tes étudiant·es retrouveront en tête de leur synthèse de rétroaction. Puis associe-lui la grille que tu viens de créer, et son échelle si elle en a une. La production relie ce que tu demandes à la façon dont tu l'évalues : ce que chaque étudiant·e fait s'y rattache, et sa pondération dit ce qu'elle pèsera dans la note du cours.",
            avant: async function () {
                aller('conception', 'productions');
                await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
            },
            // La règle des formulaires (11 nov. 2026, 9 h 35, capture 16) : une flèche par champ obligatoire encore vide ;
            // puis la grille, puis l'échelle attendue (`aAssocier`) ; le halo sur « Créer la production ».
            formulaire: function () { return ficheProductionOuverte() ? el('formulaireProduction') : null; },
            fleches: aAssocier,
            zones: function () {
                if (ficheProductionOuverte()) return surLaFiche(null);
                // 11 nov. 2026 : la rangée ne porte que « + Nouvelle production », que la pulsation désigne : pas de flèche.
                return [];
            },
            contour: function () {
                // La fiche d'une production déjà enregistrée : aucun bouton à désigner (sa rangée porte « Supprimer »).
                if (ficheProductionOuverte()) return vis(el('btnCreerProduction')) ? el('btnCreerProduction') : null;
                return qs('#conception-productions [data-action="creerNouvelleProduction"]');
            },
            atteint: productionCreee
        },
        {
            titre: 'Tes consignes',
            geste: "Écris la date de remise, puis coche « Consignes transmises ».",
            texte: "Écris ce que tes étudiant·es doivent savoir pour réussir : l'objectif d'apprentissage, la tâche, les consignes précises. Touche « Préparer le PDF » : la feuille de consignes et ta grille en sortent prêtes à remettre. Remettre la grille avec la tâche, c'est leur dire d'avance sur quoi leur production sera évaluée. Quand la feuille est remise, pose la date de remise et coche « Consignes transmises » : la production entre alors au calendrier. Dès ta première évaluation, ce que tes étudiant·es ont remis compte dans leur complétion, et tes évaluations, dans leur performance.",
            avant: ouvrirLaProduction,
            // La date et la case, ensemble : la bulle se pose au-dessus ou au-dessous du bloc, sans couvrir la date.
            zones: function () { return [el('sectionPlanification') || caseConsignes()]; },
            // Un geste à la fois (11 nov. 2026, 12 h 05) : la date de remise d'abord, puis la case.
            contour: function () {
                var s = el('sectionPlanification');
                var date = s ? s.querySelector('input[type="date"]') : null;
                return date && vis(date) && !date.value ? date : caseConsignes();
            },
            nommeLeContour: true,   // « coche « Consignes transmises » » (11 nov. 2026, 9 h 47)
            atteint: consignesTransmises
        },
        {
            titre: 'Une première production',
            geste: "Touche « Actions › Évaluer » sur sa ligne, choisis un niveau par critère, puis touche « Verrouiller ».",
            texte: "Évalue une première production. Elle est sur papier, ou c'est un exposé, une performance ? Rien à importer : touche « Actions › Évaluer » sur la ligne de l'étudiant·e. Pour chaque critère, choisis le niveau ou les points que tu attribuerais : la note se calcule à mesure, et une rétroaction s'écrit sous tes yeux : chaque critère de ta grille, avec ce que tu lui attribues. Tu y mettras bientôt tes propres mots. Quand tu es satisfait·e, touche « Verrouiller » : l'évaluation ne bougera plus par mégarde, et tu pourras la rouvrir au besoin.",
            avant: async function () {
                if (ecranEvaluationVisible()) return;
                aller('evaluations', 'liste');
                await attendre(function () { return !!ligneAEvaluer(); }, 3000);
                amenerDeCote(ligneAEvaluer());
            },
            zones: function () {
                if (ecranEvaluationVisible()) return surLaCible(ouToucherEnEvaluant());
                return [rangeeDe(ligneAEvaluer())];
            },
            contour: function () {
                if (ecranEvaluationVisible()) return ouToucherEnEvaluant();
                return ligneAEvaluer();
            },
            // « Actions › Évaluer », un niveau par critère, « Verrouiller » : la bulle nomme ce qu'il faut toucher, la
            // flèche y va (11 nov. 2026, 9 h 35, capture 17 : elle montait à la cellule « Niveau » de la rangée).
            nommeLeContour: true,
            // Capture 18 : l'écran d'évaluation ouvert, la bulle passe à la page des critères et le premier critère est
            // amené dans la vue ; revenue à la Liste, à celle d'« Actions › Évaluer ».
            pageQuiDit: function () {
                if (!ecranEvaluationVisible()) return 'Rien à importer';
                return evaluationPrete() ? 'Pour chaque critère' : null;
            },
            atteint: evaluationVerrouillee
        },
        {
            titre: 'Ta pratique',
            geste: "Touche « + Nouvelle pratique », choisis « Partir d'un modèle », puis suis l'assistant jusqu'à « Créer la pratique ».",
            texte: "Ta première évaluation est faite. Reste à décider comment tu construis la note du cours : c'est ta pratique de notation. Touche « + Nouvelle pratique », puis « Partir d'un modèle », et choisis le tien : « Modèle sommatif » si la note du cours est la moyenne de tes travaux selon leur pondération. Si tu pratiques une notation alternative, ton modèle y est aussi : par standards (niveaux de maîtrise), par spécifications, par dénotation. Tu ne sais pas lequel te correspond ? Touche « Décrire ma pratique » : à partir de quelques questions, l'assistant le trouve pour toi. La note que tu viens d'attribuer ne changera pas.",
            avant: async function () {
                aller('conception', 'pratiques-notation');
                await attendre(function () { return sousSectionVisible('conception-pratiques-notation'); }, 2000);
            },
            zones: function () {
                surModale(wizardOuvert());
                if (wizardOuvert()) return [qs('#modalWizardPratiqueV2 .modal-contenu')];
                return [];   // « + Nouvelle pratique » a la pulsation (11 nov. 2026)
            },
            // 11 nov. 2026 : la bulle couvre forcément une partie de la fenêtre ; jamais ses boutons du geste suivant.
            aussiEviter: function () {
                if (!wizardOuvert()) return [];
                // Les cartes de choix de la page affichée aussi (11 nov. 2026, cinquième aperçu : la ligne du geste a grandi
                // la bulle, qui couvrait le modèle à choisir).
                var cartes = [].slice.call(document.querySelectorAll('#modalWizardPratiqueV2 .wizard-v2-radio-card')).filter(vis);
                return ['wizard-v2-btn-precedent', 'wizard-v2-btn-suivant', 'wizard-v2-btn-creer'].map(el).concat(cartes);
            },
            nommeLeContour: true,   // « + Nouvelle pratique », puis « Partir d'un modèle » (11 nov. 2026, 9 h 47)
            contour: function () {
                if (!wizardOuvert()) return qs('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
                var r = qs('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]');
                var carte = r ? (r.closest('.wizard-v2-radio-card') || r) : null;
                if (carte && vis(carte) && !r.checked) return carte;
                // Puis l'assistant, un geste à la fois (11 nov. 2026, 12 h 05) : « Créer la pratique » quand il paraît,
                // sinon « Suivant → ».
                var creer = el('wizard-v2-btn-creer');
                if (vis(creer)) return creer;
                var suivant = el('wizard-v2-btn-suivant');
                return vis(suivant) ? suivant : (carte && vis(carte) ? carte : null);
            },
            atteint: function () {
                var ok = pratiqueCreee();
                if (ok) surModale(false);
                return ok;
            }
        },
        {
            titre: "L'appliquer à ton cours",
            geste: "Choisis ta pratique dans le menu en haut de la page, puis touche « Appliquer au cours actif ».",
            texte: "Ta pratique est créée, mais elle ne s'applique encore à aucun cours. Une pratique se prépare une fois et peut resservir, à toi comme à tes collègues, avec qui tu peux la partager. Choisis-la dans le menu en haut de la page, puis touche « Appliquer au cours actif ». Sans pratique appliquée, l'application ne sait pas comment tu construis ta note : elle n'en calcule aucune.",
            avant: async function () {
                surModale(false);
                aller('conception', 'pratiques-notation');
                await attendre(function () { return sousSectionVisible('conception-pratiques-notation'); }, 2000);
            },
            zones: function () {
                if (fichePratiqueOuverte()) { amenerAppliquer(); return [boutonAppliquer()]; }
                appliquerAmene = 0;
                return [];   // le menu en haut est ce qu'il faut toucher : la pulsation le désigne (11 nov. 2026)
            },
            contour: function () {
                if (fichePratiqueOuverte()) return boutonAppliquer();
                return qs('#selectionPratiques select') || el('selectionPratiques');
            },
            nommeLeContour: true,   // « le menu en haut de la page », puis « Appliquer au cours actif » (11 nov. 2026)
            atteint: pratiqueEstAppliquee
        },
        {
            titre: "Le point qui s'allume",
            geste: "Touche « Continuer ».",
            texte: "Regarde : l'étudiant·e dont tu viens d'évaluer la production a maintenant son point en performance. Les autres n'y sont pas encore : ils apparaîtront à mesure que tu évalueras leur production. La complétion, elle, suit la remise : dès ta première évaluation, chaque production importée pour ce travail compte comme remise ; sans fichier, c'est ton évaluation qui confirme la remise. Évaluation après évaluation, c'est ainsi que se construit le coup d'œil sur ta classe.",
            avant: async function () {
                aller('suivi', 'groupe');
                await attendre(blocPerformance, 3000);
                // La flèche va à la bande (11 nov. 2026) ; son titre, « Performance (P) », reste dans la vue : le bloc est
                // amené sous l'en-tête, et le moteur n'a plus à faire défiler pour la bande.
                var bloc = blocPerformance(), entete = qs('header.entete');
                var haut = entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
                if (bloc) window.scrollTo(0, Math.max(0, window.scrollY + bloc.getBoundingClientRect().top - haut - 16));
            },
            // « Son point en performance » : la bande des points, pas le bloc et son titre (11 nov. 2026).
            zones: function () { var b = blocPerformance(); return [(b && b.querySelector('.barre-indicateur')) || b]; },
            boutons: [{ libelle: 'Continuer', primaire: true, action: function (m) { m.allerA(7); } }]
        },
        {
            titre: 'Ta cartouche',
            geste: "Touche « + Nouvelle cartouche », remplis-la, enregistre-la, puis choisis-la dans la fiche de ta production.",
            texte: "La rétroaction de ton évaluation vient de ta grille. Pour qu'elle parle avec tes mots, écris ta cartouche : choisis ta grille, puis ton échelle de performance : celle que Mon matériel a créée avec ta grille si elle a des niveaux ; si elle est en points, les paliers de l'échelle de départ, dont tu peux ajuster les bornes. Puis, pour chaque critère et chaque niveau de l'échelle, note le commentaire que tu écrirais dans la marge. Tu l'écris une fois ; ensuite, chaque évaluation compose la rétroaction à partir de tes phrases. Tes étudiant·es reçoivent un commentaire cohérent d'une évaluation à l'autre, et tu n'as plus à le réécrire chaque fois. Puis, dans la fiche de ta production, choisis cette cartouche : elle s'y appliquera à chaque évaluation.",
            avant: async function () {
                aller('conception', 'retroactions');
                await attendre(function () { return sousSectionVisible('conception-retroactions'); }, 2000);
            },
            zones: function () {
                if (cartoucheCreee()) return zonesPourNommer();
                // « Grille (critères) », puis l'échelle, l'étiquette avec son menu : la flèche y va, l'avis le nomme.
                if (cartoucheHorsDeLaGrille()) { var s = menuHorsDeLaGrille(); return [s.closest('.groupe-form') || s]; }
                if (ficheCartoucheOuverte()) return surLaCible(ouToucherCartouche());
                return [];   // « + Nouvelle cartouche » a la pulsation (11 nov. 2026)
            },
            avis: avisCartouche,
            contour: function () {
                if (cartoucheCreee()) return ouNommerLaCartouche();
                if (ficheCartoucheOuverte()) return ouToucherCartouche();
                return qs('#conception-retroactions [data-action="creerNouvelleCartouche"]');
            },
            // Décision du 9 nov. (15 h 55) : la cartouche enregistrée ET nommée par la production.
            atteint: function () { return cartoucheCreee() && productionNommeLaCartouche(); }
        },
        {
            titre: 'Ta rétroaction, avec tes mots',
            geste: "Touche « Actions › Consulter », puis « Déverrouiller » ; écris ton mot, verrouille, puis touche « Terminer ».",
            texte: "Reviens à ta première évaluation : touche « Actions › Consulter », puis « Déverrouiller ». Choisis ta cartouche : la rétroaction se réécrit avec tes phrases. Relis-la comme ton étudiant·e la lira, dans sa synthèse de rétroaction. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ». Puis verrouille. Désormais, chaque production que tu évalueras recevra sa rétroaction de la même façon.",
            sansSortie: true,
            avant: async function () {
                if (ecranEvaluationVisible()) return;
                aller('evaluations', 'liste');
                var ctx = lireCtx();
                await attendre(function () { return !!ligneDeLaListe(ctx.productionId, ctx.evaluationDA); }, 3000);
                amenerDeCote(ligneDeLaListe(ctx.productionId, ctx.evaluationDA));
            },
            zones: function () {
                if (ecranEvaluationVisible()) return surLaCible(ouToucherEnReecrivant());
                var ctx = lireCtx();
                return [rangeeDe(ligneDeLaListe(ctx.productionId, ctx.evaluationDA))];
            },
            contour: function () {
                if (ecranEvaluationVisible()) return ouToucherEnReecrivant();
                var ctx = lireCtx();
                return ligneDeLaListe(ctx.productionId, ctx.evaluationDA);
            },
            // « Actions › Consulter », « Déverrouiller », ta cartouche, « verrouille » (11 nov. 2026, 9 h 47).
            nommeLeContour: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard' };

    // ---------- Le lancement, « Plus tard », la fin ----------

    /** Ce qui existait à « Commencer » : ce qui en naîtra ensuite fera avancer les étapes. */
    function poserLeRepere() {
        majCtx({
            grillesAvant: ids(grilles()), productionsAvant: ids(productions()), pratiquesAvant: ids(pratiques()),
            pratiqueAppliqueeAvant: pratiqueAppliquee(),
            // Relecture neuve du 9 nov. : le repère des cartouches couvre TOUTES les grilles. La production peut
            // nommer une grille déjà là, avec ses cartouches : l'étape 8 n'avançait alors sur aucune cartouche neuve.
            grilleId: null, cartouchesAvant: toutesLesCartouches(), productionId: null, evaluationId: null, evaluationDA: null,
            pratiqueId: null, cartoucheId: null,
            // 14 nov. 2026 (lot 4b) : les deux bulles d'ouverture d'abord ; aucune grille déjà là prise. (L'exemple
            // n'est plus « offert » par la bulle : ses deux boutons sont sur la page.)
            ouverture: 0, grillePrise: false
        });
    }

    async function lancer(depuis) {
        enModele = false;
        // Les vraies données : la démo ouverte se referme d'abord ; un import en cours l'en empêche, rien ne part.
        if (enDemo() && typeof desactiverModeDemo === 'function') await desactiverModeDemo();
        if (enDemo()) return;
        if (!classeEnPlace()) {
            // La démo refermée ne laisse aucune classe : le panneau se rouvre et dit pourquoi, sous le bouton (la phrase
            // ne s'écrit qu'au toucher : le bouton est touché pour elle ; la condition, non remplie, ne lance rien).
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-parcours-bouton');
                if (b) b.click();
            }
            return;
        }
        // « Reprendre » (le parcours en cours) relit le repère, même à l'étape 1 (relecture neuve du 9 nov. : à l'étape 1,
        // il était refait, et une grille créée pendant « Plus tard » ne comptait plus) ; « Commencer » et « Refaire » le posent.
        var reprise = window.Assistance.etatDe(ID).etat === 'en-cours' && lireCtx().grillesAvant;
        if (!reprise) { depuis = 0; poserLeRepere(); }
        window.Assistance.definirEtat(ID, 'en-cours', depuis);
        return M().lancer(DEF, {
            depuis: depuis,
            surEtape: function (i) { window.Assistance.definirEtat(ID, 'en-cours', i); },
            // « Plus tard » (et Échap) : la bulle se ferme, le parcours attend à cette étape.
            surQuitter: function () { surModale(false); },
            // La dernière bulle, sans « Plus tard » : Échap la termine, comme « Terminer ».
            surEchap: function () { terminer(); },
            // Entrée dans la démo en cours de route : le parcours se ferme et attend.
            verifier: function () { return !enDemo(); }
        });
    }

    function terminer() {
        surModale(false);
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }


    // =================================================================
    // LE MODÈLE (« Je regarde ») : refait le 18 nov. 2026, dans l'ordre décidé par Grégoire le 15 nov.
    // =================================================================
    // Consigne : `plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md` (A à G). Dix étapes, une bulle par
    // écran : la pratique de notation, son modèle, son échelle, son application au cours, la grille, la cartouche, la
    // production, ses consignes, l'évaluation de Yack Amical, le point qui s'allume. Le modèle se joue dans la démo, sur
    // le deuxième groupe ; la personne fait chaque geste dans les vrais écrans ; « Remplir » pose le matériel fourni.
    // Les étapes sont PROPRES au modèle : elles ne reprennent plus celles de la Pratique guidée (`ETAPES`, inchangées),
    // seulement ses outils (ce qui lit la démo, l'assistant, la Liste). Retirés avec l'ancien ordre : le détour par
    // « Holistique », les bulles « Pourquoi étiqueter », « Tu apprends aussi », « Ta grille est créée », le retour en
    // arrière pour choisir la cartouche.
    // CE QUE LE MODÈLE PRODUIT NE CHANGE PAS (consigne, B) : le modèle de « Recevoir » le lit
    // (js/parcours-recevoir-modele.js) : la grille par son nom, la production qui la porte avec son échelle et sa
    // cartouche, l'évaluation de Yack Amical, la pratique appliquée au cours du deuxième groupe.

    /*
     * LE MATÉRIEL DE L'EXEMPLE : celui de Grégoire, tiré de son cours 601-101. La grille s'appelle « Grille générale à
     * 4 critères » depuis le 18 nov. 2026 (« G4H Sans français » avant) ; sa description et ses quatre critères ne
     * changent pas. Les vingt commentaires et la grille d'autoévaluation sont ses fichiers du 18 nov., tels quels
     * (`plans de travail/materiel-evaluer/`) : tests/unit/sentinelle-je-regarde-evaluer-2026-11-18.test.js les confronte.
     * « Deux-Rives », le texte créé pour l'exercice (15 nov.) ; l'échéance, le mardi 9 septembre 2025, une séance du
     * deuxième groupe (la page la dit « 2e séance de la semaine 3 »).
     */
    var MATERIEL = Object.freeze({
        grille: Object.freeze({
            nom: 'Grille générale à 4 critères',
            description: 'Grille à 4 critères | sans français écrit',
            criteres: Object.freeze([
                ['Structure', "Établir et rendre lisibles les relations entre les éléments de son travail : pour chaque élément, on peut dire de quoi il dépend et ce qu'il sert.", '20\u00a0%'],
                ['Rigueur', "Rendre compte avec exactitude de ce que dit le texte : relever les éléments importants sans en omettre, les nommer avec le terme juste, et expliquer ce qu'on avance sans laisser le lecteur deviner.", '30\u00a0%'],
                ['Plausibilité', "Fonder son interprétation sur le texte : chaque idée avancée s'appuie sur des éléments précis du texte, et chaque élément retenu sert une idée.", '15\u00a0%'],
                ['Nuance', "Interpréter au lieu de s'en tenir à la lecture évidente : dire ce qu'un élément révèle, ce que le rapprochement de deux éléments fait voir (une nuance, une tension, une contradiction qu'on explique), et ce que l'analyse permet de conclure.", '35\u00a0%']
            ])
        }),
        production: Object.freeze({
            titre: 'Artefact 1',
            description: 'Appliquer des stratégies de lecture variées (Deux-Rives)',
            type: 'artefact-portfolio',
            nomDuType: 'Artefact',
            objectif: "Développer ta capacité à choisir les stratégies de lecture qu'appelle un texte donné, plutôt que de les appliquer au hasard.",
            tache: "Annoter le texte «\u00a0Deux-Rives\u00a0» en y appliquant au moins trois stratégies de lecture, puis formuler une première hypothèse d'objectif de communication.",
            detailTache: "Une stratégie de lecture te fait regarder le texte sous un angle précis. En en appliquant plusieurs, tu vois des choses qu'une simple lecture ne montre pas.\n\n1. Lis et annote l'extrait \nApplique au moins trois stratégies de lecture différentes, choisies parmi les quinze du Manuel\nLaisse des traces visibles directement sur le texte imprimé\n\n2. Identifie chaque stratégie utilisée • Écris le nom de la stratégie en haut de la page • Utilise un système de couleurs et de symboles constant • Assure-toi que tes annotations restent lisibles\n\n3. Formule ton hypothèse d'objectif de communication \nÉcris ton HOC en bas de la page, en une phrase complète \nElle doit refléter ce que tu comprends du texte après avoir appliqué tes stratégies\n\nRappels importants \nTrois stratégies, c'est un minimum, pas un objectif. \nUne stratégie appliquée à moitié ne compte pas : va au bout de chacune.",
            // Le mardi 9 septembre 2025 : une séance du deuxième groupe (mardi et vendredi).
            echeance: '2025-09-09',
            // Un bloc libre (« + Nouveau champ », #499) : le fichier de Grégoire sans sa première ligne (son titre).
            autoevaluation: Object.freeze({ titre: "Grille d'autoévaluation", contenu: [
                "Étape 1 sur 4 : les idées naissent. Chaque stratégie te fait regarder le texte sous un angle précis ; tu notes ce que tu vois, et une première hypothèse apparaît.",
                "",
                "Avant de remettre ton travail, coche ce que tu trouves dans ta copie. Le seuil de réussite correspond au niveau D de l'échelle ; le seuil de maîtrise, au niveau M. La question en italique t'aide à vérifier.",
                "",
                "Structure",
                "",
                "☐ Réussite : J'ai écrit le nom de chaque stratégie en haut de la page. Pour au moins trois annotations sur cinq, on peut dire de quelle stratégie elles relèvent.",
                "",
                "☐ Maîtrise : Pour au moins quatre annotations sur cinq, on peut dire de quelle stratégie elles relèvent et sur quel passage elles portent. Mon moyen de les distinguer (couleur, symbole) reste le même sur toutes les pages.",
                "",
                "Pour vérifier : pour chaque annotation, puis-je dire de quelle stratégie elle vient et sur quel passage elle porte ?",
                "",
                "Rigueur",
                "",
                "☐ Réussite : J'ai appliqué au moins trois stratégies. Au moins trois annotations sur cinq disent une idée, pas seulement un surlignement.",
                "",
                "☐ Maîtrise : Chacune de mes stratégies est menée jusqu'au bout, du début à la fin du chapitre. Au moins quatre annotations sur cinq nomment avec précision ce que j'ai repéré.",
                "",
                "Pour vérifier : chaque passage surligné porte-t-il quelques mots dans la marge ? Chaque stratégie couvre-t-elle tout le chapitre ?",
                "",
                "Plausibilité",
                "",
                "☐ Réussite : Ma HOC est écrite en une phrase complète et se rattache à un thème que mes annotations font ressortir.",
                "",
                "☐ Maîtrise : Ma HOC est une intention d'écriture, et on peut suivre le chemin qui y mène : des passages annotés aux thèmes, des thèmes au propos, du propos à la HOC. Au moins quatre annotations sur cinq se rattachent à ce chemin.",
                "",
                "Pour vérifier : ma HOC dit-elle ce que l'autrice cherche à faire, et pas seulement ce qu'elle dit ? Suit-elle la structure du manuel (l'autrice, un verbe d'action, un objet, un angle) ?",
                "",
                "Nuance",
                "",
                "☐ Réussite : Au moins une de mes annotations dit ce qu'un élément révèle d'un thème ou du propos, au lieu de seulement le relever.",
                "",
                "☐ Maîtrise : Au moins deux de mes annotations rapprochent deux éléments (deux passages, ou ce que deux stratégies ont fait ressortir) et disent ce que ce rapprochement révèle : une distinction, un point commun, une tension ou une contradiction.",
                "",
                "Pour vérifier : ai-je écrit ce que révèle chacun des liens que j'ai tracés ?"
            ].join('\n') })
        }),
        niveaux: Object.freeze([['Structure', 'M'], ['Rigueur', 'D'], ['Plausibilité', 'D'], ['Nuance', 'D']]),
        // La personne évaluée (Grégoire, 17 nov. 2026) : Yack Amical, du deuxième groupe, quel que soit le tri de la
        // Liste. Elle n'a pas de copie dans le modèle de « Recevoir » (Loutre Enjouée, Tapir Doux, Antilope Vaillante).
        etudiantEvalue: Object.freeze({ da: '9900007', nom: 'Yack Amical' }),
        echelle: 'IDME et niv 0',
        // Le modèle par standards de l'assistant (`STD-n-meilleurs`).
        pratique: Object.freeze({ id: 'STD-n-meilleurs', nom: 'N meilleures évaluations' }),
        // Son nom est celui de la production (consigne, C.4).
        cartouche: 'Appliquer des stratégies de lecture variées (Deux-Rives)',
        commentaires: [
            "## STRUCTURE",
            "**STRUCTURE (0)** : L'évaluation n'est pas possible.",
            "**STRUCTURE (I)** : Il est possible que les stratégies appliquées ne soient pas nommées, ou que l'on ne puisse pas dire de quelle stratégie relèvent la plupart des annotations. Sans ce rattachement, les traces seront difficiles à réutiliser pour la carte mentale. Pour atteindre le seuil, écris le nom de chaque stratégie en haut de la page et choisis un moyen de distinguer ses annotations des autres (une couleur, un symbole, une marge). L'important est qu'on sache d'où vient chaque annotation.",
            "**STRUCTURE (D)** : Les stratégies appliquées sont nommées, et pour la majorité des annotations, on peut dire de quelle stratégie elles relèvent. Le rattachement reste toutefois incomplet : certaines annotations ne renvoient à aucune stratégie ou à aucun passage précis, ou le moyen de les distinguer change d'une page à l'autre. Pour atteindre la maîtrise, reprends chaque annotation : de quelle stratégie vient-elle, sur quel passage porte-t-elle ? Garde le même moyen de les distinguer sur toutes les pages.",
            "**STRUCTURE (M)** : Pour au moins quatre annotations sur cinq, on peut dire de quelle stratégie elles relèvent et sur quel passage elles portent. Le même moyen de les distinguer sert sur toutes les pages : on retrouve en quelques secondes ce qu'une stratégie a fait ressortir. Ces traces seront directement utilisables pour la carte mentale. Pour aller plus loin, regroupe tes annotations selon un principe qui t'appartient : par thème, par personnage, par question.",
            "**STRUCTURE (E)** : Chaque annotation est rattachée à sa stratégie et à son passage, et les pages vont au-delà de ce qui était demandé. Elles proposent un principe d'organisation qui leur est propre : un index, une légende, un regroupement par thème ou par question que la consigne du travail ne prévoyait pas et qui fait voir le texte autrement. Ce choix personnel fait des pages annotées un outil de travail réutilisable pour l'analyse d'un autre texte.",
            "## RIGUEUR",
            "**RIGUEUR (0)** : L'évaluation n'est pas possible.",
            "**RIGUEUR (I)** : Il est possible que moins de trois stratégies soient appliquées, ou que la plupart des annotations se limitent à un surlignement sans dire ce qui est repéré. Le matériau recueilli sera alors trop mince pour construire la carte mentale. Pour atteindre le seuil, applique au moins trois stratégies et, pour chaque élément relevé, écris quelques mots qui disent ce que tu as repéré. Un passage surligné sans annotation ne garde aucune trace de ta lecture.",
            "**RIGUEUR (D)** : Au moins trois stratégies sont appliquées, et la majorité des annotations expriment une idée plutôt qu'un simple surlignement. L'application reste toutefois inégale : certaines parties du texte ne sont pas couvertes, ou certaines annotations restent vagues. Pour atteindre la maîtrise, mène chaque stratégie jusqu'au bout, du début à la fin du texte, et reprends les annotations vagues pour nommer avec précision ce qui est repéré. Une stratégie appliquée à moitié laissera des trous dans ta carte mentale.",
            "**RIGUEUR (M)** : Chacune des stratégies est menée jusqu'au bout, sur l'ensemble du texte, et au moins quatre annotations sur cinq nomment avec précision ce qui est repéré. Le repérage est complet : il fournit une base solide pour la carte mentale. Pour aller plus loin, ne t'arrête pas à ce que la stratégie te fait chercher : note aussi ce qu'elle ne permet pas de saisir dans ce texte, ou essaie une stratégie que tu n'as pas encore pratiquée.",
            "**RIGUEUR (E)** : Le repérage est complet et précis, et il dépasse l'application des stratégies telles qu'elles sont enseignées. Les pages montrent une stratégie adaptée au texte, combinée à une autre ou inventée pour saisir ce que les stratégies du manuel ne faisaient pas ressortir. Cet apport personnel montre que les stratégies sont assez maîtrisées pour être transformées, et qu'elles pourront servir devant un texte très différent.",
            "## PLAUSIBILITÉ",
            "**PLAUSIBILITÉ (0)** : L'évaluation n'est pas possible.",
            "**PLAUSIBILITÉ (I)** : Il est possible que la HOC soit absente, qu'elle ne soit pas rédigée en une phrase complète, ou qu'elle ne se rattache à aucun thème que tes annotations font ressortir. L'interprétation ne repose alors pas encore sur ta lecture. Pour atteindre le seuil, relis tes annotations, dégage un thème qui revient, puis écris au bas de la page une HOC en une phrase complète qui s'appuie sur ce thème. À ce stade exploratoire, ajuster son hypothèse est normal.",
            "**PLAUSIBILITÉ (D)** : Une HOC est écrite en une phrase complète et elle se rattache à un thème que les annotations font ressortir. Elle énonce toutefois un propos (ce que l'auteur ou l'autrice dit) plutôt qu'une intention d'écriture (ce qu'il ou elle cherche à faire), ou plusieurs annotations restent sans rapport avec elle. Pour atteindre la maîtrise, transforme ton propos en intention selon la structure du manuel (auteur ou autrice, verbe d'action, objet, angle) et vérifie que tes annotations mènent des passages aux thèmes, puis au propos, puis à la HOC.",
            "**PLAUSIBILITÉ (M)** : La HOC est formulée comme une intention d'écriture, et l'on peut suivre dans les annotations le chemin qui y mène : des passages annotés aux thèmes, des thèmes au propos, du propos à la HOC. Les annotations sans rapport avec ce chemin restent l'exception. Cette hypothèse tient à ta lecture et servira de point de départ à la carte mentale. Pour aller plus loin, demande-toi jusqu'où ton hypothèse tient : y a-t-il un passage où elle cesse de tenir, ou d'autres passages de l'œuvre où elle vaudrait aussi ?",
            "**PLAUSIBILITÉ (E)** : La HOC tient à la lecture. Les pages énoncent en outre la portée de l'hypothèse : elles nomment un passage où elle cesse de tenir, ou d'autres passages de l'œuvre où elle vaudrait aussi, et s'appuient sur le texte pour le montrer. Cette démarche dépasse ce que la consigne du travail demandait : elle traite l'hypothèse comme une idée dont on connaît les limites, ce qui se transfère à la lecture d'autres textes.",
            "## NUANCE",
            "**NUANCE (0)** : L'évaluation n'est pas possible.",
            "**NUANCE (I)** : Il est possible que les annotations relèvent des éléments sans dire ce qu'ils révèlent : réactions spontanées, éléments évidents, repérages sans interprétation. La lecture reste alors à la surface du texte. Pour atteindre le seuil, choisis un élément que tu as repéré et écris ce qu'il révèle d'un thème ou du propos de l'auteur ou de l'autrice. Interpréter, c'est faire ce lien : un élément relevé ne dit rien tant qu'on n'a pas écrit ce qu'il laisse entendre.",
            "**NUANCE (D)** : Au moins une annotation est interprétative : elle dit ce que l'élément repéré révèle d'un thème ou du propos, au lieu de seulement le relever. La lecture reste toutefois dans l'évidence, parce que les éléments repérés ne sont pas encore rapprochés les uns des autres. Pour atteindre la maîtrise, rapproche au moins deux fois deux éléments (deux passages, ou ce que deux stratégies ont fait ressortir) et écris dans la marge, au bout de ta flèche, ce que ce rapprochement révèle : une distinction, un point commun, une tension, une contradiction que tu expliques.",
            "**NUANCE (M)** : Au moins deux annotations rapprochent deux éléments et disent ce que ce rapprochement révèle : une distinction entre deux éléments semblables, un point commun entre deux éléments différents, une tension ou une contradiction expliquée. La lecture dépasse l'évidence et fournit un matériau riche pour la carte mentale. Pour aller plus loin, demande-toi ce que cette lecture éclaire en dehors du texte : un autre texte, une autre situation.",
            "**NUANCE (E)** : Les rapprochements entre les éléments repérés font voir les subtilités du texte, et les pages portent cette lecture au-delà de lui. Elles rapprochent ce qui a été dégagé d'un autre texte, d'une autre situation ou d'un autre contexte, et disent ce que ce rapprochement apporte à la compréhension de l'un et de l'autre. Cet apport original montre une lecture qui ne s'arrête pas au texte étudié et qui pourra nourrir d'autres analyses."
        ].join('\n'),
        mot: 'Bon départ !'
    });

    /** La grille, en tableau : une rangée de titre (nom, description), puis une rangée par critère (nom, description, pondération). */
    function tableauDeLaGrille() {
        var g = MATERIEL.grille;
        return [[g.nom, g.description].join('\t')].concat(g.criteres.map(function (c) { return c.join('\t'); })).join('\n');
    }

    /** Les vingt commentaires, par « CRITÈRE_niveau » (« STRUCTURE_M ») : lus dans le texte fourni, sans le retoucher. */
    function commentairesParCase() {
        var cases = {};
        MATERIEL.commentaires.split('\n').forEach(function (ligne) {
            var m = /^\*\*(.+?) \((.+?)\)\*\* : (.*)$/.exec(ligne);
            if (m) cases[m[1] + '_' + m[2]] = m[3];
        });
        return cases;
    }

    // =================================================================
    // LES TEXTES DES BULLES — ÉCRITS PAR GRÉGOIRE, VALIDÉS LE 18 NOV. 2026 (7 H 39 À 12 H 32), MOT POUR MOT
    // =================================================================
    // Consigne, section D. `lieuSuite` : la suite de la phrase du lieu, que le moteur écrit d'après le menu (« Tu es dans
    // « Conception », à l'onglet « Pratiques » ») ; `confirme` : la première ligne (« C'est fait : … ») ; `phrase` : une
    // phrase hors de la liste ; `lignes` : la liste ; `consignes` : les gestes (en gras dans la consigne, dans la couleur
    // du geste ici) ; `devient` : la forme suivante de la bulle, après un geste qui change l'écran. Une ligne mêlant
    // explication et geste (« Ici, termine… ou touche… ») est tout entière une consigne : la bulle n'a pas de gras dans
    // une ligne. L'objectif, « Objectif atteint », la phrase de la suite, « Pour revoir une étape » et la phrase de la
    // poignée sont posés par le moteur. Seules les lignes marquées PROPOSÉ sont de la session.
    var EN_MESURE = "d'expliquer comment une production s'évalue dans l'application, de la pratique de notation à la rétroaction";

    var TEXTES = {
        objectif: 'À la fin de ce parcours, tu seras en mesure ' + EN_MESURE + '.',
        objectifAtteint: 'Objectif atteint : tu es en mesure ' + EN_MESURE + '.',
        // PROPOSÉS (15 nov. 2026), inchangés : le panneau sans le deuxième groupe ; la bulle sur un autre groupe.
        refus: "Commence par la Modélisation de « Mettre ta classe en place » : ce modèle se joue sur le groupe que tu y montes.",
        choisirLeGroupe: "Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui)",
        // PROPOSÉ (18 nov. 2026) : sous « Créer ma grille », tant que des rangées restent sans étiquettes.
        rangeesAEtiqueter: 'toutes les rangées de la grille étiquetées',
        etape1: {
            titre: 'Ta pratique de notation',
            lieuSuite: ": c'est là que tu dis comment se construit la note de ton cours.",
            phrase: "Dans la démo, tu évalues une première production de ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données.",
            lignes: [
                "Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation sommative, qu'on appelle aussi cumulative",
                "Ici, le mot ne parle pas du moment de l'évaluation (en fin d'apprentissage, par opposition à formative) mais de la façon dont la note se construit : en faisant la « somme » des résultats aux productions antérieures, ou le « cumul » de leurs points",
                "Il en existe d'autres, dites alternatives. L'exemple en prend une : la note s'y construit à partir de niveaux de maîtrise plutôt que de points",
                "Ta pratique, c'est l'ensemble des règles que l'application suivra pour établir la note de l'étudiant·e"
            ],
            consignes: ["Touche « + Nouvelle pratique »"],
            devient: {
                confirme: "C'est fait : l'assistant de configuration est ouvert.",
                lignes: [
                    "Un assistant te pose quelques questions (un écran à la fois) et construit ta pratique avec tes réponses",
                    "« Partir d'un modèle » : tu adoptes une pratique toute prête, que tu pourras ajuster ensuite",
                    "« Décrire ma pratique » : tu réponds à des questions sur ta façon de noter et l'assistant trouve la pratique qui te correspond"
                ],
                consignes: ["Touche « Partir d'un modèle », puis « Suivant → »"]
            }
        },
        etape2: {
            titre: 'Un modèle',
            confirme: "C'est fait : tu es à l'écran « Choisis un modèle ».",
            lignes: [
                "Chaque carte est une pratique toute prête, décrite en une ligne",
                "Le code à côté du nom dit sa famille : SOM pour la sommative, STD pour les standards ; les autres codes désignent d'autres pratiques alternatives",
                "L'exemple prend « N meilleures évaluations », par standards : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10",
                "Avec ta classe, tu choisiras la tienne, qu'elle soit traditionnelle ou alternative"
            ],
            consignes: ["Touche « N meilleures évaluations », puis « Suivant → »"],
            devient: {
                lignes: [
                    "Le récapitulatif dit sa famille et ce qu'elle fait : « PAN – Standards » (PAN : pratique alternative de notation)",
                    "Son nom reste modifiable ; l'exemple le garde tel quel"
                ],
                consignes: ["Touche « Créer la pratique »"]
            }
        },
        etape3: {
            titre: 'Une échelle de performance',
            confirme: "C'est fait : l'assistant te demande une échelle.",
            lignes: [
                "Par standards, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau",
                "L'échelle de performance nomme ces niveaux. Celle de l'exemple, « IDME et niv 0 », en a cinq : 0 « Aucun », I « Incomplet ou insuffisant », D « En développement », M « Maîtrisé », E « Étendu »",
                "Pour établir la note, l'application convertit ensuite chaque niveau en pourcentage (un M vaut 75\u00a0%)",
                "Tu retrouveras ces niveaux à chaque étape de ce parcours, jusqu'à l'évaluation"
            ],
            consignes: ["Choisis « IDME et niv 0 », puis touche « Adopter »"]
        },
        etape4: {
            titre: "L'appliquer à ton cours",
            confirme: "C'est fait : la pratique « N meilleures évaluations » est créée.",
            phrase: "Tu es en haut de l'onglet « Pratiques ». Le cours actif est celui de l'en-tête : celui de ton deuxième groupe.",
            lignes: [
                "Une pratique créée ne s'applique encore à aucun cours. Tu la prépares une fois ; elle peut resservir et se partager avec tes collègues",
                "Sans pratique appliquée, l'application ne calcule aucune note"
            ],
            consignes: [
                "Choisis « N meilleures évaluations » dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche",
                "Touche « Appliquer au cours actif »"
            ]
        },
        etape5: {
            titre: 'Ta grille',
            confirme: "C'est fait : la pratique s'applique au cours de ton deuxième groupe.",
            lieuSuite: ": c'est là que tu apportes la grille que tu utilises déjà.",
            lignes: [
                "Une grille réunit tes critères (ce que tu regardes dans une production) et ce que vaut chacun. Celle de l'exemple se juge par niveaux : ceux de l'échelle que tu viens de choisir",
                "Ici, tu numérises une grille que tu as déjà, faite dans un traitement de texte. Une photo n'en garderait que l'apparence : l'application doit savoir ce que chaque partie veut dire. C'est toi qui le lui dis, en posant une étiquette sur chaque partie",
                "Ce passage du document à l'application ne se fait qu'une fois. Ensuite, tu crées et modifies tes grilles directement dans l'application"
            ],
            consignes: ["Regarde la grille de l'exemple arriver : touche « Remplir »"],
            // Une fois la grille collée : une étiquette à la fois, chacune confirmée par sa phrase.
            etiqueter: {
                lignes: ["La grille de l'exemple est là, telle qu'elle était écrite dans un traitement de texte. La palette compte plusieurs étiquettes ; quatre suffisent pour celle-ci"],
                gestes: [
                    ['Prends « Titre », puis touche le nom de la grille', "C'est ça : « Grille générale à 4 critères » est son titre, le nom sous lequel tu la retrouveras. Tu le choisis librement."],
                    ['Prends « Critère », puis touche « Structure »', "C'est ça : « Structure » est un critère, un aspect de la production que tu regardes pour la juger."],
                    ['Prends « Description », puis touche la phrase à côté de « Structure »', "C'est ça : la description définit le critère. Elle dit ce que tu attends, quelle que soit la production."],
                    ['Prends « Pondération », puis touche « 20\u00a0% »', "C'est ça : la pondération dit ce que pèse le critère dans le résultat de la production."]
                ]
            },
            rigueur: {
                lignes: ["La rangée de « Structure » est faite"],
                // Les mêmes confirmations, adaptées (consigne, C.3), à mesure que la personne étiquette la rangée.
                confirmations: [
                    "C'est ça : « Rigueur » est un critère, un aspect de la production que tu regardes pour la juger.",
                    "C'est ça : la description définit le critère. Elle dit ce que tu attends, quelle que soit la production.",
                    "C'est ça : la pondération dit ce que pèse le critère dans le résultat de la production."
                ],
                consignes: ["À toi : étiquette seul·e la rangée de « Rigueur » (critère, description, pondération)"]
            },
            suite: {
                lignes: ["Avec ta propre grille, tu étiquetteras tout : l'application ne devine rien"],
                consignes: ["Ici, termine « Plausibilité » et « Nuance » si tu veux t'exercer encore, ou touche « Voir la suite de l'exemple » : elle est déjà préparée"],
                bouton: "Voir la suite de l'exemple"
            },
            lecture: {
                lignes: [
                    "C'est la grille de l'exemple, refaite d'après ses étiquettes : compare-la à l'originale, plus haut",
                    "Ce résumé dit ce que l'application y a trouvé : 4 critères, des pondérations qui font 100\u00a0%",
                    "Elle ne porte pas de niveaux : chaque critère se jugera avec ceux de ton échelle, de 0 à E"
                ],
                consignes: ["Touche « Créer ma grille »"]
            }
        },
        etape6: {
            titre: 'Ta cartouche',
            confirme: "C'est fait : la « Grille générale à 4 critères » est créée.",
            lieuSuite: ": c'est là que tu prépares tes rétroactions.",
            lignes: [
                "Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance : un par critère et par niveau",
                "Ta grille vaut pour toutes tes productions ; une cartouche est propre à une production : elle dit ce qu'on observe à chaque niveau dans cette tâche",
                "Tu l'écris une fois. Ensuite, elle t'aide à juger, et chaque évaluation compose la rétroaction de l'étudiant·e avec tes phrases"
            ],
            consignes: ["Touche « + Nouvelle cartouche »"],
            fiche: { consignes: ["Regarde l'exemple se remplir : touche « Remplir »"] },
            remplie: {
                lignes: [
                    "Son nom : celui de la production qu'elle servira à évaluer (tu la décriras tout à l'heure)",
                    "Sa grille (« Grille générale à 4 critères ») et son échelle (« IDME et niv 0 ») : chaque commentaire a sa case, à la rencontre d'un critère et d'un niveau",
                    "Vingt commentaires : quatre critères, cinq niveaux. Lis celui de « Structure » au niveau M : sa première phrase décrit ce que tu observes, la suite dit à l'étudiant·e comment aller plus loin"
                ],
                consignes: ["Touche « Créer la cartouche »"]
            }
        },
        etape7: {
            titre: 'Ta production',
            confirme: "C'est fait : la cartouche est créée.",
            lieuSuite: ": c'est là que tu décris ce que tu demandes à tes étudiant·es.",
            lignes: [
                "Une production, c'est tout ce que tu demandes de faire, formatif ou certificatif : un plan de rédaction, un exposé oral, un laboratoire, une mesure sur le terrain",
                "De ton côté, ce sont les consignes que tu donnes, la tâche que tu demandes d'effectuer et l'objectif qu'elle cherche à atteindre"
            ],
            consignes: ["Touche « + Nouvelle production »"],
            fiche: {
                type: ['Ouvre le menu « Type » et parcours-le', "C'est ça : de l'examen au stage, chaque type est une production."],
                consignes: ["Puis regarde l'exemple se remplir : touche « Remplir »"]
            },
            remplie: {
                lignes: [
                    "Son nom dit ce qu'elle fait faire. Il est repris dans « Activité d'apprentissage », que tes étudiant·es liront en tête de leur rétroaction",
                    "Son type, « Artefact » : une pièce d'un portfolio, une pratique courante en littérature. Dans d'autres disciplines, tu nommeras tes productions autrement (laboratoire, examen, entrevue) ; ta pratique retiendra alors ses évaluations parmi elles",
                    "Plus bas, ce que tu viens de préparer s'y rattache d'un coup : sa grille, son échelle et sa cartouche",
                    "Les champs à astérisque rouge suffisent pour la créer ; plus tu en remplis, plus ce que l'application te rend est précis"
                ],
                consignes: ["Touche « Créer la production »"]
            }
        },
        etape8: {
            titre: 'Tes consignes',
            confirme: "C'est fait : la production est créée.",
            phrase: "Tu es plus bas dans sa fiche, aux consignes : ce que tes étudiant·es doivent savoir pour réussir.",
            consignes: ["Regarde l'exemple se remplir : touche « Remplir »"],
            remplie: {
                lignes: [
                    "L'objectif : ce que la production cherche à développer",
                    "La tâche, en une phrase : c'est la consigne du travail. Puis son détail, pas à pas",
                    "Ta grille d'autoévaluation, dans un bloc à part : pour chaque critère, les deux seuils de cette tâche, la réussite (D) et la maîtrise (M). Ta grille dit ce que tu attends en général ; les seuils le précisent pour cette tâche",
                    "Avec ta classe, « Préparer le PDF » en tire une feuille à remettre : tes étudiant·es savent d'avance ce que tu attends et peuvent vérifier leur travail avant de le remettre",
                    "La date d'échéance : le mardi 9 septembre 2025, une séance du groupe"
                ],
                consignes: ["Coche « Consignes transmises » (la production entre alors au calendrier du groupe)"]
            }
        },
        etape9: {
            titre: 'Évaluer',
            confirme: "C'est fait : les consignes sont transmises.",
            lieuSuite: ": c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.",
            lignes: ["La production de Yack Amical est sur papier : rien à importer. Pour un exposé ou une entrevue, c'est pareil : tu évalues depuis sa ligne"],
            consignes: ["Sur la ligne de Yack Amical, touche « Actions › Évaluer »"],
            criteres: {
                lignes: [
                    "La grille, l'échelle et la cartouche sont déjà là : elles viennent de la production",
                    "Pour chaque critère, choisis un niveau : son commentaire de la cartouche paraît aussitôt dans la rétroaction",
                    "Compare-le à la copie. S'il ne lui ressemble pas, essaie le niveau voisin : c'est la cartouche qui t'aide à juger"
                ],
                consignes: ["Choisis un niveau pour chacun des quatre critères (suggestion pour suivre l'exemple : M, D, D, D)"]
            },
            verrou: {
                lignes: [
                    "La note de la copie se calcule à mesure, d'après les niveaux et les pondérations",
                    "La rétroaction réunit tes quatre commentaires : c'est ce que Yack Amical lira"
                ],
                consignes: [
                    "Dans « Un mot pour ton étudiant·e », écris « Bon départ ! » (il s'imprime sur son PDF, après son niveau)",
                    "Touche le cadenas « Verrouiller » : l'évaluation est terminée et ne bougera plus par mégarde ; tu pourras la rouvrir au besoin"
                ]
            }
        },
        etape10: {
            titre: "Le point qui s'allume",
            confirme: "C'est fait : l'évaluation de Yack Amical est verrouillée.",
            lieuSuite: ": c'est là que tu vois ta classe d'un coup d'œil.",
            lignes: [
                "Dans la bande « Performance (P) », Yack Amical a maintenant son point. Les autres apparaîtront à mesure que tu évalueras leur production",
                "Évaluation après évaluation, l'application garde ses niveaux, critère par critère : c'est ainsi qu'elle pourra nommer son défi"
            ]
        }
    };

    // Les outils communs aux modèles (js/parcours-classe.js) : « Remplir », les trois suites de la fin.
    function C() { return window.ParcoursClasse; }

    // ---------- Le deuxième groupe, et ce que la démo contient déjà du modèle ----------

    function deuxiemeGroupe() {
        return C() && typeof C().deuxiemeGroupe === 'function' ? C().deuxiemeGroupe() : null;
    }

    function refusModele() { return deuxiemeGroupe() ? null : TEXTES.refus; }

    function surLeDeuxiemeGroupe() {
        var g = deuxiemeGroupe();
        return !!g && groupeCoursActifId() === g.id;
    }

    /** Les grilles que le modèle a créées dans la démo : celles qui portent le nom de la grille fournie. */
    function grillesDuModele() {
        return grilles().filter(function (g) { return g && g.nom === MATERIEL.grille.nom; });
    }

    /**
     * Le repère du modèle, refait à chaque lancement, en mémoire : tout ce que la démo contient, sauf ce qui vient du
     * modèle (sa grille par son nom, la production qui la porte, une pratique qui n'est pas du pack, les cartouches de sa
     * grille). Les étapes avancent alors sur ce qui a déjà été fait, comme à une reprise, sans rien écrire hors de la démo.
     */
    function poserLeRepereModele() {
        var miennes = ids(grillesDuModele());
        var hors = function (liste, garde) { return ids(liste.filter(function (x) { return x && garde(x); })); };
        ctxModele = {
            grillesAvant: hors(grilles(), function (g) { return miennes.indexOf(g.id) === -1; }),
            productionsAvant: hors(productions(), function (p) { return miennes.indexOf(p.grilleId) === -1; }),
            // Les pratiques du pack portent un identifiant « demo-… » (`pack-demo-10.js`) ; celle du modèle, non.
            pratiquesAvant: hors(pratiques(), function (p) { return String(p.id).indexOf('demo-') === 0; }),
            pratiqueAppliqueeAvant: null,
            cartouchesAvant: grilles().reduce(function (acc, g) {
                return g && miennes.indexOf(g.id) === -1 ? acc.concat(ids(cartouchesDe(g.id))) : acc;
            }, []),
            grilleId: null, productionId: null, evaluationId: null, evaluationDA: null, pratiqueId: null, cartoucheId: null,
            grillePrise: false
        };
    }

    function grilleDuModele() {
        grilleCreee();
        var g = parId(grilles(), lireCtx().grilleId);
        return g && g.nom === MATERIEL.grille.nom ? g : null;
    }

    // ---------- Les lignes d'une bulle ----------

    /** Une ligne d'explication (avec ce qu'elle montre, si donné). */
    function ligne(texte, montre) { return montre ? { texte: texte, montre: montre } : { texte: texte }; }

    /** Une consigne : dans la couleur du geste ; faite (`fait`), elle se grise d'un crochet. */
    function geste(texte, fait) { return fait ? { texte: texte, geste: true, fait: fait } : consigne(texte); }

    /** Une forme de bulle : sa phrase hors de la liste, ses lignes, puis ses consignes (en dernier). */
    function forme(t, plus) {
        var l = t.phrase ? [note(t.phrase)] : [];
        return l.concat((t.lignes || []).map(function (x) { return ligne(x); }), plus || [], (t.consignes || []).map(function (c) { return geste(c); }));
    }

    function fait() { return true; }

    /**
     * Une étape du modèle. Tant que le deuxième groupe n'est pas le groupe actif, elle n'avance pas : elle montre le
     * menu de l'en-tête et le dit ; ses boutons ne paraissent pas (« Remplir » ne remplit jamais la fiche d'un autre groupe).
     */
    function etapeDuModele(o) {
        var e = {
            titre: o.titre,
            texte: '',
            geste: '',
            lignesVivantes: true,
            lignes: function () { return surLeDeuxiemeGroupe() ? o.lignes() : [consigne(TEXTES.choisirLeGroupe)]; },
            zones: function () { return surLeDeuxiemeGroupe() && o.zones ? (o.zones() || []).filter(Boolean) : []; },
            contour: function () { return surLeDeuxiemeGroupe() ? (o.contour ? o.contour() : null) : el('selectGroupeCoursHeader'); },
            atteint: function () { return surLeDeuxiemeGroupe() && !!o.atteint(); }
        };
        if (o.lieu) e.lieu = function () { return surLeDeuxiemeGroupe() && (typeof o.lieu === 'function' ? o.lieu() : true); };
        if (o.lieuSuite) e.lieuSuite = o.lieuSuite;
        if (o.lieu) e.amener = true;   // le lieu ouvre la page en haut ; ce que l'étape montre y est ramené au besoin
        if (o.confirme) e.confirme = o.confirme;
        if (o.avant) e.avant = o.avant;
        if (o.fleches) e.fleches = function () { return surLeDeuxiemeGroupe() ? (o.fleches() || []).filter(Boolean) : []; };
        if (o.aussiEviter) e.aussiEviter = function () { return surLeDeuxiemeGroupe() ? (o.aussiEviter() || []).filter(Boolean) : []; };
        if (o.avis) e.avis = function () { return surLeDeuxiemeGroupe() ? o.avis() : ''; };
        if (o.nommeLeContour) e.nommeLeContour = o.nommeLeContour;
        if (o.sansSortie) e.sansSortie = true;
        Object.defineProperty(e, 'boutons', { get: function () { return surLeDeuxiemeGroupe() && o.boutons ? o.boutons() : null; } });
        return e;
    }

    // ---------- Étapes 1 à 3 : l'assistant de la pratique, puis la question de l'échelle ----------

    function titreDeLAssistant() {
        var t = el('wizard-v2-titre');
        return wizardOuvert() && t ? String(t.textContent || '').trim() : '';
    }
    function aLEcranChoixModele() { return titreDeLAssistant() === 'Choisis un modèle'; }
    function auRecapitulatif() { return vis(el('wizard-v2-btn-creer')); }
    function questionDeLEchelle() { return vis(el('ui-dialogue-question')); }

    function carteDe(nom, valeur) {
        var r = qs('#modalWizardPratiqueV2 input[name="' + nom + '"][value="' + valeur + '"]');
        return r ? { radio: r, carte: r.closest('.wizard-v2-radio-card') || r } : null;
    }

    /** Dans l'assistant, un geste à la fois : la carte de l'écran, puis « Suivant → » ; au récapitulatif, « Créer la pratique ». */
    function ouToucherDansLAssistant() {
        if (!wizardOuvert()) return qs('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
        if (auRecapitulatif()) return el('wizard-v2-btn-creer');
        var c = aLEcranChoixModele() ? carteDe('modeleChoisi', MATERIEL.pratique.id) : carteDe('porteEntree', 'modele');
        if (c && vis(c.carte) && !c.radio.checked) return c.carte;
        var suivant = el('wizard-v2-btn-suivant');
        return vis(suivant) ? suivant : null;
    }

    /** La fenêtre de l'assistant, ou celle de la question de l'échelle : la bulle passe au-dessus d'elles (`surModale`). */
    function zonesDeLAssistant() {
        var q = el('ui-dialogue-question');
        surModale(wizardOuvert() || questionDeLEchelle());
        if (questionDeLEchelle()) return [q.closest('.modal-contenu') || q.parentElement];
        return wizardOuvert() ? [qs('#modalWizardPratiqueV2 .modal-contenu')] : [];
    }

    /** Les boutons et les cartes de l'assistant, les choix et les boutons de la question : jamais sous la bulle. */
    function aussiEviterDansLAssistant() {
        // La question de l'échelle : ce qu'elle fait toucher, la ligne de l'échelle et « Adopter », seulement (mesuré le
        // 18 nov. 2026 à 1180 × 820 : à éviter toute la rangée des boutons et toutes les lignes, la bulle couvrait « Adopter »).
        if (questionDeLEchelle()) return [ligneDeLEchelle(), boutonAdopter()];
        return ETAPES[4].aussiEviter() || [];
    }

    function ligneDeLEchelle() {
        return [].slice.call(document.querySelectorAll('#overlay-ui-dialogue .ui-dialogue-choix-ligne')).filter(function (l) {
            return String(l.textContent || '').indexOf(MATERIEL.echelle) !== -1;
        })[0] || null;
    }

    function boutonAdopter() {
        return [].slice.call(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).filter(function (b) {
            return String(b.textContent || '').trim() === 'Adopter';
        })[0] || null;
    }

    function echelleChoisie() {
        var l = ligneDeLEchelle(), r = l ? l.querySelector('input') : null;
        return !!(r && r.checked);
    }

    // ---------- Étape 4 : la pratique appliquée au cours du deuxième groupe ----------

    function laPratiqueEstChoisie() {
        var s = el('menuPratiques');
        return fichePratiqueOuverte() && !!s && !!lireCtx().pratiqueId && s.value === lireCtx().pratiqueId;
    }

    /** C'est la pratique du modèle qui est appliquée au cours actif (pas une autre, ni celle d'avant). */
    function laPratiqueDuModeleEstAppliquee() {
        pratiqueCreee();
        var id = lireCtx().pratiqueId;
        return !!id && pratiqueAppliquee() === id;
    }

    // ---------- Étape 5 : la grille, étiquetée une rangée à la fois ----------

    function dissectionDuModele() {
        var d = dissection(), e = d && dissectionOuverte() ? d.etatCourant() : null;
        return e && e.doc && e.echelleExistante ? e : null;
    }

    /**
     * Les morceaux de la grille de l'exemple, par leur place dans le tableau collé : la rangée du titre (nom,
     * description), puis une rangée par critère (nom, description, pondération). Les étiquettes qu'ils attendent.
     */
    function rangeesDeLExemple(e) {
        var rows = e && e.doc && e.doc.mode === 'table' ? e.doc.rows : [];
        var id = function (r, c) { return rows[r] && rows[r][c] && rows[r][c].lines[0] ? rows[r][c].lines[0].id : null; };
        return {
            titre: [id(0, 0), 'titre'],
            description: [id(0, 1), 'description'],
            criteres: MATERIEL.grille.criteres.map(function (x, k) {
                return [[id(k + 1, 0), 'critere'], [id(k + 1, 1), 'description'], [id(k + 1, 2), 'ponderation']];
            })
        };
    }

    function posee(e, paire) { return !!(e && paire[0] && e.liens[paire[0]] === paire[1]); }
    function rangeeFaite(e, k) { return rangeesDeLExemple(e).criteres[k].every(function (p) { return posee(e, p); }); }

    /** Les rangées que « Créer ma grille » attend : le titre et les quatre critères. */
    function rangeesFaites(e) {
        var r = rangeesDeLExemple(e);
        return posee(e, r.titre) && r.criteres.every(function (x, k) { return rangeeFaite(e, k); });
    }

    /** Les quatre gestes de « Structure », dans l'ordre de la bulle : titre, critère, description, pondération. */
    function gestesDeStructure(e) {
        var r = rangeesDeLExemple(e);
        return [r.titre].concat(r.criteres[0]);
    }

    /** La façon dont l'étape 5 se montre : l'accueil, « Structure » guidée, « Rigueur », la suite, la lecture. */
    function formeDeLaGrille() {
        var e = dissectionDuModele();
        if (!e) return 'accueil';
        if (!gestesDeStructure(e).every(function (p) { return posee(e, p); })) return 'structure';
        if (!rangeeFaite(e, 1)) return 'rigueur';
        return rangeesFaites(e) ? 'lecture' : 'suite';
    }

    function morceau(id) { return id ? qs('#dissection-contenu .dissection-morceau[data-id="' + id + '"]') : null; }
    function etiquetteDeLaPalette(type) { return qs('#dissection-palette .dissection-etiquette[data-type="' + type + '"]'); }

    /** Le premier geste de « Structure » qui reste : l'étiquette à prendre, puis le morceau à toucher. */
    function prochainGesteDeStructure() {
        var e = dissectionDuModele();
        var p = e ? gestesDeStructure(e).filter(function (x) { return !posee(e, x); })[0] : null;
        if (!p) return null;
        return e.actif === p[1] ? morceau(p[0]) : etiquetteDeLaPalette(p[1]);
    }

    /** « Remplir » : la grille de l'exemple entre dans l'étiquetage, comme un collage, tenue pour jugée par niveaux. */
    function ouvrirLaGrilleDeLExemple() {
        var lecture = window.materielDissectionLecture, d = dissection();
        if (!lecture || !d) return;
        var doc = lecture.docDepuisPressePapiers({ texte: tableauDeLaGrille() });
        if (!doc || !d.ouvrir(doc)) return;
        d.tenirPourNiveaux({ attendre: function () {
            var e = dissectionDuModele();
            return e && !rangeesFaites(e) ? TEXTES.rangeesAEtiqueter : '';
        } });
    }

    /** « Voir la suite de l'exemple » : les étiquettes qui restent, posées par le modèle (la description de la grille comprise). */
    function voirLaSuiteDeLExemple() {
        var e = dissectionDuModele(), d = dissection();
        if (!e || !d) return;
        var r = rangeesDeLExemple(e), liens = {};
        [r.titre, r.description].concat(r.criteres.reduce(function (a, x) { return a.concat(x); }, [])).forEach(function (p) { if (p[0]) liens[p[0]] = p[1]; });
        d.poserEtiquettes(liens);
    }

    function lignesDeLaGrille(f) {
        var t = TEXTES.etape5, e = dissectionDuModele();
        if (f === 'accueil') return forme(t);
        if (f === 'structure') {
            var l = forme(t.etiqueter), suivant = true;
            gestesDeStructure(e).forEach(function (p, k) {
                if (!suivant) return;
                if (posee(e, p)) { l.push(geste(t.etiqueter.gestes[k][0], fait), ligne(t.etiqueter.gestes[k][1])); return; }
                l.push(geste(t.etiqueter.gestes[k][0]));
                suivant = false;
            });
            return l;
        }
        if (f === 'rigueur') {
            var confirmees = rangeesDeLExemple(e).criteres[1].map(function (p, k) { return posee(e, p) ? ligne(t.rigueur.confirmations[k]) : null; }).filter(Boolean);
            // Le dernier geste de « Structure » (la pondération) fait changer la bulle : sa confirmation l'ouvre, jusqu'au
            // premier geste sur « Rigueur ».
            var derniere = confirmees.length ? [] : [ligne(t.etiqueter.gestes[3][1])];
            return derniere.concat(forme(t.rigueur, confirmees));
        }
        if (f === 'suite') return forme(t.suite);
        return [
            ligne(t.lecture.lignes[0], function () { return [el('dissection-comprise')]; }),
            ligne(t.lecture.lignes[1], function () { return [el('dissection-constats')]; }),
            ligne(t.lecture.lignes[2], function () { return [el('dissection-logique')]; }),
            geste(t.lecture.consignes[0])
        ];
    }

    // La lecture amenée une fois dans la vue, quand toute la grille est étiquetée (« la page défile jusqu'à la lecture »).
    var lectureAmenee = false;
    function amenerLaLecture() {
        var r = qs('#materiel-dissection .dissection-resultat');
        if (lectureAmenee || !vis(r)) return;
        lectureAmenee = true;
        r.scrollIntoView({ block: 'start' });
    }

    function boutonCreerMaGrille() { return qs('#materiel-dissection [data-action="materielDissection.creer"]'); }

    function zonesDeLaGrille(f) {
        var e = dissectionDuModele();
        if (f === 'lecture') { amenerLaLecture(); return []; }
        lectureAmenee = false;
        if (f === 'rigueur') return rangeesDeLExemple(e).criteres[1].map(function (p) { return morceau(p[0]); });
        if (f === 'suite') return rangeesDeLExemple(e).criteres.slice(2).reduce(function (a, r) { return a.concat(r.map(function (p) { return morceau(p[0]); })); }, []);
        return [];
    }

    // ---------- Étape 6 : la cartouche, remplie avec l'exemple ----------

    function casesDeCommentaires() {
        return [].slice.call(document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]'));
    }

    /** La fiche d'une cartouche en création est ouverte. */
    function cartoucheEnCreation() { return vis(el('btnCreerCartouche')); }

    function cartoucheRemplie() {
        var cases = casesDeCommentaires();
        return cartoucheEnCreation() && cases.length > 0 && cases.every(function (t) { return String(t.value || '').trim() !== ''; });
    }

    /**
     * Le nom, la grille du modèle, l'échelle du pack (aucune échelle neuve), puis les vingt commentaires, chacun dans sa
     * case (« comm_<critère>_<niveau> »). La page redessine son échelle puis sa matrice : chaque geste attend le suivant.
     */
    async function remplirLaCartouche() {
        var g = grilleDuModele();
        if (!g) return;
        C().poser(el('nomCartouche'), MATERIEL.cartouche);
        C().poser(el('selectGrilleCartouche'), g.id);
        await attendre(function () { return C().choisir(el('selectEchelleCartouche'), MATERIEL.echelle); }, 3000);
        await attendre(function () { return casesDeCommentaires().length > 0; }, 3000);
        if (!enDemo() || !cartoucheEnCreation()) return;
        var textes = commentairesParCase(), noms = {};
        (g.criteres || []).forEach(function (c) { noms[String(c.id)] = String(c.nom || '').toUpperCase(); });
        casesDeCommentaires().forEach(function (t) {
            var reste = t.id.slice('comm_'.length), coupe = reste.lastIndexOf('_');
            var texte = textes[noms[reste.slice(0, coupe)] + '_' + reste.slice(coupe + 1)];
            if (texte) C().poser(t, texte);
        });
    }

    /** La case de « Structure » au niveau M (« Lis celui de « Structure » au niveau M »). */
    function caseStructureM() {
        var g = grilleDuModele(), c = g ? (g.criteres || []).find(function (x) { return x && x.nom === 'Structure'; }) : null;
        return c ? el('comm_' + c.id + '_M') : null;
    }

    function formeDeLaCartouche() {
        if (!ficheCartoucheOuverte()) return 'liste';
        return cartoucheRemplie() ? 'remplie' : 'fiche';
    }

    // ---------- Étape 7 : la production ----------

    function texteChoisi(id) {
        var s = el(id);
        return s && s.selectedOptions && s.selectedOptions[0] ? s.selectedOptions[0].textContent : '';
    }

    // Le menu « Type », ouvert par la personne : il n'a pas d'événement d'ouverture ; son focus (au doigt, à la souris,
    // au clavier) en tient lieu.
    var typeOuvert = false, typeEcoute = false;
    function ecouterLeType() {
        if (typeEcoute) return;
        typeEcoute = true;
        var vu = function (ev) { if (ev.target && ev.target.id === 'productionType') typeOuvert = true; };
        document.addEventListener('focusin', vu);
        document.addEventListener('pointerdown', vu, true);
    }

    function productionRemplie() {
        var g = grilleDuModele();
        return !!g && ficheProductionOuverte() && String((el('productionTitre') || {}).value) === MATERIEL.production.description
            && String((el('productionGrille') || {}).value) === String(g.id)
            && texteChoisi('productionEchelle').indexOf(MATERIEL.echelle) !== -1
            && !!lireCtx().cartoucheId && String((el('productionCartouche') || {}).value) === String(lireCtx().cartoucheId);
    }

    /**
     * Le nom de la production est ce qu'elle fait faire (la démo a déjà un « Artefact 1 »), repris en « Activité
     * d'apprentissage ». La grille choisie, la page peuple le menu de ses cartouches : la cartouche est choisie ensuite.
     */
    async function remplirLaProduction() {
        var g = grilleDuModele(), p = MATERIEL.production, cid = lireCtx().cartoucheId;
        if (!g) return;
        C().poser(el('productionTitre'), p.description);
        C().poser(el('productionActivite'), p.description);
        C().poser(el('productionType'), p.type);
        C().poser(el('productionGrille'), g.id);
        C().choisir(el('productionEchelle'), MATERIEL.echelle);
        var offerte = function () { var s = el('productionCartouche'); return !!s && [].some.call(s.options, function (o) { return o.value === cid; }); };
        if (cid && await attendre(offerte, 3000) && enDemo()) C().poser(el('productionCartouche'), cid);
    }

    function formeDeLaProduction() {
        if (!ficheProductionOuverte()) return 'liste';
        return productionRemplie() ? 'remplie' : 'fiche';
    }

    // ---------- Étape 8 : les consignes, un bloc libre et l'échéance ----------

    function champEcheance() {
        var s = el('sectionPlanification');
        return s ? s.querySelector('input[type="date"]') : null;
    }

    /** Le bloc libre « Grille d'autoévaluation » de la fiche ouverte, s'il y est. */
    function blocDAutoevaluation() {
        return [].slice.call(document.querySelectorAll('#champsPersonnalisesListe .champ-perso:not([data-ancre])')).filter(function (b) {
            var t = b.querySelector('.champ-perso-titre');
            return t && String(t.value || '').trim() === MATERIEL.production.autoevaluation.titre;
        })[0] || null;
    }

    function consignesRemplies() {
        var d = champEcheance(), b = blocDAutoevaluation(), c = b ? b.querySelector('.champ-perso-contenu') : null;
        return String((el('productionObjectif') || {}).value) === MATERIEL.production.objectif && !!d && d.value === MATERIEL.production.echeance
            && !!c && c.value === MATERIEL.production.autoevaluation.contenu;
    }

    /** L'objectif, la tâche, son détail ; un bloc libre (« + Nouveau champ ») pour la grille d'autoévaluation ; l'échéance. */
    function remplirLesConsignes() {
        var p = MATERIEL.production;
        C().poser(el('productionObjectif'), p.objectif);
        C().poser(el('productionTache'), p.tache);
        C().poser(el('productionDetailTache'), p.detailTache);
        if (!blocDAutoevaluation() && typeof window.ajouterChampPersonnalise === 'function') {
            window.ajouterChampPersonnalise();
            var blocs = document.querySelectorAll('#champsPersonnalisesListe .champ-perso:not([data-ancre])');
            var b = blocs[blocs.length - 1];
            if (b) C().poser(b.querySelector('.champ-perso-titre'), p.autoevaluation.titre);
        }
        var bloc = blocDAutoevaluation();
        if (bloc) C().poser(bloc.querySelector('.champ-perso-contenu'), p.autoevaluation.contenu);
        C().poser(champEcheance(), p.echeance);
    }

    /** La fiche de la production du modèle ouverte, puis amenée à ses consignes. */
    async function ouvrirLesConsignes() {
        await ouvrirLaProduction();
        var l = el('champsPersonnalisesListe');
        if (l && vis(l)) l.scrollIntoView({ block: 'start' });
    }

    // ---------- Étape 9 : l'évaluation de Yack Amical ----------

    function formeDeLEvaluation() {
        if (!ecranEvaluationVisible()) return 'liste';
        return critereAAttribuer() ? 'criteres' : 'verrou';
    }

    function motEcrit() { return String((el('motPourEtudiant1') || {}).value || '').trim() !== ''; }

    function ouToucherPourLeVerrou() {
        var mot = el('motPourEtudiant1');
        return vis(mot) && !motEcrit() ? mot : boutonVerrou();
    }

    // ---------- Étape 10 : le point qui s'allume ----------

    async function montrerLaBande() {
        aller('suivi', 'groupe');
        await attendre(blocPerformance, 3000);
    }

    function bandeDePerformance() { var b = blocPerformance(); return (b && b.querySelector('.barre-indicateur')) || b; }

    // =================================================================
    // LES DIX ÉTAPES
    // =================================================================

    var NOMBRE_D_ETAPES_DU_MODELE = 10;

    // Construites au premier besoin : elles s'appuient sur les outils communs de js/parcours-classe.js (`C()`), que
    // ce fichier ne suppose pas chargés à sa lecture.
    var etapesDuModele = null;
    function etapesModele() {
        if (!etapesDuModele) etapesDuModele = construireLesEtapesDuModele();
        return etapesDuModele;
    }

    function construireLesEtapesDuModele() {
        var T = TEXTES;
        var remplir = function (gestes) { return [{ libelle: C().mots.remplir, primaire: true, action: function () { C().remplir(gestes); } }]; };
        return [
            // 1. Ta pratique de notation : Conception › Pratiques, puis le premier écran de l'assistant.
            etapeDuModele({
                titre: T.etape1.titre,
                lieu: function () { return !wizardOuvert(); },
                lieuSuite: T.etape1.lieuSuite,
                confirme: function () { return wizardOuvert() ? T.etape1.devient.confirme : ''; },
                lignes: function () { return wizardOuvert() ? forme(T.etape1.devient) : forme(T.etape1); },
                avant: async function () {
                    surModale(false);
                    aller('conception', 'pratiques-notation');
                    await attendre(function () { return sousSectionVisible('conception-pratiques-notation'); }, 2000);
                },
                zones: zonesDeLAssistant,
                aussiEviter: aussiEviterDansLAssistant,
                contour: ouToucherDansLAssistant,
                nommeLeContour: true,
                atteint: aLEcranChoixModele
            }),
            // 2. Un modèle : « Choisis un modèle », puis le récapitulatif.
            etapeDuModele({
                titre: T.etape2.titre,
                confirme: function () { return auRecapitulatif() ? '' : T.etape2.confirme; },
                lignes: function () { return auRecapitulatif() ? forme(T.etape2.devient) : forme(T.etape2); },
                zones: zonesDeLAssistant,
                aussiEviter: aussiEviterDansLAssistant,
                contour: ouToucherDansLAssistant,
                nommeLeContour: true,
                atteint: function () { return questionDeLEchelle() || pratiqueCreee(); }
            }),
            // 3. Une échelle de performance : la question de l'échelle à l'adoption.
            etapeDuModele({
                titre: T.etape3.titre,
                confirme: T.etape3.confirme,
                lignes: function () { return forme(T.etape3); },
                zones: zonesDeLAssistant,
                aussiEviter: aussiEviterDansLAssistant,
                contour: function () {
                    if (!questionDeLEchelle()) return ouToucherDansLAssistant();
                    return echelleChoisie() ? boutonAdopter() : ligneDeLEchelle();
                },
                nommeLeContour: true,
                atteint: function () {
                    var ok = pratiqueCreee();
                    if (ok) surModale(false);
                    return ok;
                }
            }),
            // 4. L'appliquer à ton cours : l'étape s'ouvre en haut de l'onglet « Pratiques ».
            etapeDuModele({
                titre: T.etape4.titre,
                confirme: T.etape4.confirme,
                lignes: function () {
                    return forme({ phrase: T.etape4.phrase, lignes: T.etape4.lignes }).concat([
                        geste(T.etape4.consignes[0], laPratiqueEstChoisie), geste(T.etape4.consignes[1])
                    ]);
                },
                avant: async function () {
                    surModale(false);
                    aller('conception', 'pratiques-notation');
                    await attendre(function () { return sousSectionVisible('conception-pratiques-notation'); }, 2000);
                    window.scrollTo(0, 0);
                },
                zones: function () { return laPratiqueEstChoisie() ? [boutonAppliquer()] : []; },
                contour: function () { return laPratiqueEstChoisie() ? boutonAppliquer() : el('menuPratiques'); },
                nommeLeContour: true,
                atteint: laPratiqueDuModeleEstAppliquee
            }),
            // 5. Ta grille : Mon matériel ; étiqueter, lire, créer.
            etapeDuModele({
                titre: T.etape5.titre,
                lieu: function () { return formeDeLaGrille() === 'accueil'; },
                lieuSuite: T.etape5.lieuSuite,
                confirme: function () { return formeDeLaGrille() === 'accueil' ? T.etape5.confirme : ''; },
                lignes: function () { return lignesDeLaGrille(formeDeLaGrille()); },
                boutons: function () {
                    var f = formeDeLaGrille();
                    if (f === 'accueil') return remplir(ouvrirLaGrilleDeLExemple);
                    if (f === 'suite') return [{ libelle: T.etape5.suite.bouton, primaire: true, action: voirLaSuiteDeLExemple }];
                    return null;
                },
                avant: async function () {
                    lectureAmenee = false;
                    if (sousSectionVisible('conception-materiel')) return;
                    aller('conception', 'materiel');
                    await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
                },
                zones: function () { return zonesDeLaGrille(formeDeLaGrille()); },
                fleches: function () { var f = formeDeLaGrille(); return f === 'rigueur' || f === 'suite' ? zonesDeLaGrille(f) : []; },
                contour: function () {
                    var f = formeDeLaGrille();
                    if (f === 'structure') return prochainGesteDeStructure();
                    return f === 'lecture' ? boutonCreerMaGrille() : null;
                },
                atteint: function () { return !!grilleDuModele(); }
            }),
            // 6. Ta cartouche : Conception › Cartouches.
            etapeDuModele({
                titre: T.etape6.titre,
                lieu: function () { return formeDeLaCartouche() === 'liste'; },
                lieuSuite: T.etape6.lieuSuite,
                confirme: function () { return formeDeLaCartouche() === 'liste' ? T.etape6.confirme : ''; },
                lignes: function () {
                    var f = formeDeLaCartouche();
                    if (f === 'liste') return forme(T.etape6);
                    if (f === 'fiche') return forme(T.etape6.fiche);
                    var r = T.etape6.remplie;
                    return [
                        ligne(r.lignes[0], function () { return [el('nomCartouche')]; }),
                        ligne(r.lignes[1], function () { return [el('selectGrilleCartouche'), el('selectEchelleCartouche')]; }),
                        ligne(r.lignes[2], function () { return [caseStructureM()]; }),
                        geste(r.consignes[0])
                    ];
                },
                boutons: function () { return formeDeLaCartouche() === 'fiche' ? remplir(remplirLaCartouche) : null; },
                avant: async function () {
                    grilleCreee();
                    aller('conception', 'retroactions');
                    await attendre(function () { return sousSectionVisible('conception-retroactions'); }, 2000);
                },
                contour: function () {
                    var f = formeDeLaCartouche();
                    if (f === 'liste') return qs('#conception-retroactions [data-action="creerNouvelleCartouche"]');
                    return f === 'remplie' ? el('btnCreerCartouche') : null;
                },
                atteint: cartoucheCreee
            }),
            // 7. Ta production : Conception › Productions.
            etapeDuModele({
                titre: T.etape7.titre,
                lieu: function () { return formeDeLaProduction() === 'liste'; },
                lieuSuite: T.etape7.lieuSuite,
                confirme: function () { return formeDeLaProduction() === 'liste' ? T.etape7.confirme : ''; },
                lignes: function () {
                    var f = formeDeLaProduction(), t = T.etape7;
                    if (f === 'liste') return forme(t);
                    if (f === 'remplie') {
                        return [
                            ligne(t.remplie.lignes[0], function () { return [el('productionTitre'), el('productionActivite')]; }),
                            ligne(t.remplie.lignes[1], function () { return [el('productionType')]; }),
                            ligne(t.remplie.lignes[2], function () { return [el('productionGrille'), el('productionEchelle'), el('productionCartouche')]; }),
                            ligne(t.remplie.lignes[3]),
                            geste(t.remplie.consignes[0])
                        ];
                    }
                    if (!typeOuvert) return [geste(t.fiche.type[0])];
                    return [geste(t.fiche.type[0], fait), ligne(t.fiche.type[1]), geste(t.fiche.consignes[0])];
                },
                boutons: function () { return formeDeLaProduction() === 'fiche' && typeOuvert ? remplir(remplirLaProduction) : null; },
                avant: async function () {
                    ecouterLeType();
                    typeOuvert = false;
                    cartoucheCreee();
                    aller('conception', 'productions');
                    await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
                },
                contour: function () {
                    var f = formeDeLaProduction();
                    if (f === 'liste') return qs('#conception-productions [data-action="creerNouvelleProduction"]');
                    if (f === 'remplie') return el('btnCreerProduction');
                    return typeOuvert ? null : el('productionType');
                },
                atteint: productionCreee
            }),
            // 8. Tes consignes : les blocs de consignes de la même fiche.
            etapeDuModele({
                titre: T.etape8.titre,
                confirme: function () { return consignesRemplies() ? '' : T.etape8.confirme; },
                lignes: function () {
                    if (!consignesRemplies()) return forme({ phrase: T.etape8.phrase, consignes: T.etape8.consignes });
                    var r = T.etape8.remplie;
                    return [
                        ligne(r.lignes[0], function () { return [el('productionObjectif')]; }),
                        ligne(r.lignes[1], function () { return [el('productionTache')]; }),
                        ligne(r.lignes[2], function () { return [blocDAutoevaluation()]; }),
                        // « Préparer le PDF » est en haut de la fiche : la flèche ferait remonter la page (rien à toucher ici).
                        ligne(r.lignes[3]),
                        ligne(r.lignes[4], function () { return [champEcheance()]; }),
                        geste(r.consignes[0])
                    ];
                },
                boutons: function () { return consignesRemplies() ? null : remplir(remplirLesConsignes); },
                avant: ouvrirLesConsignes,
                contour: function () { return consignesRemplies() ? caseConsignes() : null; },
                atteint: consignesTransmises
            }),
            // 9. Évaluer : Évaluation › Liste, la ligne de Yack Amical, puis l'écran d'évaluation.
            etapeDuModele({
                titre: T.etape9.titre,
                lieu: function () { return !ecranEvaluationVisible(); },
                lieuSuite: T.etape9.lieuSuite,
                confirme: function () { return ecranEvaluationVisible() ? '' : T.etape9.confirme; },
                lignes: function () {
                    var f = formeDeLEvaluation(), t = T.etape9;
                    if (f === 'liste') return forme(t);
                    if (f === 'criteres') return forme(t.criteres);
                    return forme({ lignes: t.verrou.lignes }).concat([geste(t.verrou.consignes[0], motEcrit), geste(t.verrou.consignes[1])]);
                },
                avant: async function () {
                    if (ecranEvaluationVisible()) return;
                    aller('evaluations', 'liste');
                    await attendre(function () { return !!ligneAEvaluer(); }, 3000);
                    amenerDeCote(ligneAEvaluer());
                },
                zones: function () {
                    var f = formeDeLEvaluation();
                    if (f === 'liste') { amenerDeCote(ligneAEvaluer()); return [rangeeDe(ligneAEvaluer())]; }
                    return surLaCible(f === 'criteres' ? critereAAttribuer() : ouToucherPourLeVerrou());
                },
                contour: function () {
                    var f = formeDeLEvaluation();
                    if (f === 'liste') return ligneAEvaluer();
                    return f === 'criteres' ? critereAAttribuer() : ouToucherPourLeVerrou();
                },
                nommeLeContour: true,
                atteint: evaluationVerrouillee
            }),
            // 10. Le point qui s'allume : Suivi › Groupe ; la fin, trois boutons de même poids.
            etapeDuModele({
                titre: T.etape10.titre,
                lieu: true,
                lieuSuite: T.etape10.lieuSuite,
                confirme: T.etape10.confirme,
                lignes: function () { return forme(T.etape10); },
                boutons: function () { return C().suitesDuModele(ID, terminerModele); },
                avant: montrerLaBande,
                zones: function () { return [bandeDePerformance()]; },
                sansSortie: true,
                atteint: function () { return false; }
            })
        ];
    }

    var defDuModele = null;
    function definitionDuModele() {
        if (!defDuModele) {
            defDuModele = {
                id: ID + '-modele', etapes: etapesModele(), lienSortie: 'Plus tard',
                // L'objectif, à la première forme de la première bulle seulement : la seconde (l'assistant ouvert) ne le redit pas.
                objectif: function () { return wizardOuvert() ? '' : TEXTES.objectif; },
                objectifAtteint: TEXTES.objectifAtteint
            };
        }
        return defDuModele;
    }

    /** La première étape du modèle que la démo n'a pas encore : une reprise y revient, sans rien retenir hors de la démo. */
    function premiereNonFaiteModele() {
        var faits = [
            [0, pratiqueCreee], [3, laPratiqueDuModeleEstAppliquee], [4, function () { return !!grilleDuModele(); }],
            [5, cartoucheCreee], [6, productionCreee], [7, consignesTransmises], [8, evaluationVerrouillee]
        ];
        for (var k = 0; k < faits.length; k++) {
            if (!faits[k][1]()) return faits[k][0];
        }
        return 9;
    }

    /**
     * Le modèle part de sa première étape non faite, gestes compris : JAMAIS en visite (Grégoire, 14 nov. 2026, 10 h 56).
     * Fait, il ne repart que par « Refaire », au panneau, qui remet d'abord la démo à neuf (js/assistance.js).
     */
    async function lancerModele() {
        // Le modèle se joue dans la démo : il l'ouvre si elle ne l'est pas. Un import en cours l'en empêche : rien ne part.
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        if (!deuxiemeGroupe()) {
            // Le deuxième groupe n'est plus là (la démo remise à neuf entre-temps) : le panneau se rouvre et le dit.
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-modele-bouton');
                if (b) b.click();
            }
            return;
        }
        enModele = true;
        poserLeRepereModele();
        vientDeCreer = false;
        var depuis = premiereNonFaiteModele();
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(definitionDuModele(), {
            depuis: depuis,
            surEtape: function (i) {
                if (i > 2) surModale(false);
                window.Assistance.definirEtatModele(ID, 'en-cours', i);
            },
            surQuitter: function () { surModale(false); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route (le bandeau vert) : le modèle se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        surModale(false);
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Évaluer une première production',
        // Validée par Grégoire le 9 nov. (13 h 37 à 13 h 42, en Cowork).
        ligne: 'De ta grille à ta première rétroaction, réécrite avec tes mots.',
        total: ETAPES.length,
        refus: condition,
        prealable: 'classe',
        lancer: lancer,
        // Les deux temps (13 nov. 2026) : le modèle, dans la démo, sur le deuxième groupe.
        totalModele: NOMBRE_D_ETAPES_DU_MODELE,   // dix étapes, propres au modèle depuis le 18 nov. 2026
        lancerModele: lancerModele,
        refusModele: refusModele
    });

    // Pour les bancs : la condition, le repère, les étapes et la bulle du choix, lus sans lancer le parcours.
    window.ParcoursEvaluer = {
        refus: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        texteDuChoix: TEXTE_1_CHOIX,
        // Le modèle : son matériel, ses textes, ses étapes, le tableau de sa grille.
        materiel: MATERIEL,
        textes: TEXTES,
        etapesModele: etapesModele,
        tableauDeLaGrille: tableauDeLaGrille,
        refusModele: refusModele
    };
})();
