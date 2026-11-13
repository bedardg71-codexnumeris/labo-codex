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
     * Lot de la dissection sur l'iPad (12 nov. 2026). L'étape 1 a quatre façons de se montrer (`modeEtape1`) :
     *  · 'exemple' : l'exemple offert à « Commencer » (point 5), avant que la personne passe à sa grille ;
     *  · 'choix' : la bulle du choix des points ou des niveaux (inchangée) ;
     *  · 'existante' : une grille déjà dans l'application, ouverte dans Conception › Grilles (point 7) : « Prendre cette
     *    grille » fait passer à « Ta production » avec elle ;
     *  · 'composer' : Conception › Grilles sans grille ouverte (« Composer ma grille », 13 nov. 2026) ;
     *  · 'grille' : coller sa grille et l'étiqueter (l'aide pas à pas, point 4).
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
        if (lireCtx().exemple === 'offert') return 'exemple';
        if (choixVisible() && !exempleOuvert()) return 'choix';
        if (grilleOuverteDansLEditeur()) return 'existante';
        // 13 nov. 2026 : dans Conception › Grilles (« Composer ma grille »), l'étape a son texte (`TEXTE_1_COMPOSER`).
        if (editeurGrilleVisible() && !dissectionOuverte()) return 'composer';
        return 'grille';
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

    /** Point 5 : l'exemple, ouvert dans Mon matériel (« complet » ou « exercice »). Rien ne s'écrit. */
    async function ouvrirLExemple(complet) {
        aller('conception', 'materiel');
        await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
        var d = dissection();
        if (d) d.ouvrirExemple(complet);
    }

    /** « Passer à ma grille » : l'exemple se ferme (le brouillon de la personne revient, s'il existe) ; l'étape passe à sa grille. */
    function passerAMaGrille() {
        if (window.materiel && typeof window.materiel.quitterExemple === 'function') window.materiel.quitterExemple();
        majCtx({ exemple: 'passe' });
        M().allerA(0);
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
        if (dissectionOuverte()) return A().zones();
        if (modeRendu === 'exemple') return [];   // les trois choix sont dans la bulle
        if (editeurGrilleVisible()) return [el('conception-grille-criteres')];
        return A().zones();
    }

    /** Dans la dissection, la bulle ne couvre jamais ce que l'aide désigne ; l'exemple complet : sa lecture. */
    function aussiEviterEtape1() {
        return dissectionOuverte() ? A().aussiEviter() : [];
    }

    function contourEtape1() {
        if (modeRendu === 'choix') return el('dissection-creer-choix');
        if (dissectionOuverte()) return A().contour();
        if (modeRendu === 'exemple') return null;
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
    var GESTE_EXEMPLE = "Touche « Voir le travail complet » ou « Faire l'exercice soi-même » ; ou « Passer à ma grille ».";

    function gesteEtape1() {
        if (modeRendu === 'choix') return "Choisis les points ou les niveaux.";
        // L'exemple offert par la bulle a sa sortie dans la bulle (« Passer à ma grille ») ; ouvert de la page, dans la page.
        if (dissectionOuverte()) return A().geste(modeRendu === 'exemple');
        if (modeRendu === 'exemple') return GESTE_EXEMPLE;
        if (modeRendu === 'existante') return GESTE_EXISTANTE;
        if (editeurGrilleVisible()) return GESTE_GRILLES;
        return A().geste(false);
    }

    /**
     * Le complément de la bulle (13 nov. 2026) : les consignes que la page ne dit plus, à la suite du texte validé, qui
     * ne change pas. À l'accueil et dans l'étiquetage seulement : ni devant le choix des points ou des niveaux, ni
     * devant l'exemple offert, ni dans Conception › Grilles.
     */
    function complementEtape1() {
        if (modeRendu === 'choix') return null;
        if (dissectionOuverte()) return A().complement();
        if (modeRendu !== 'grille') return null;
        return A().complement();
    }

    /** Les boutons de la bulle, selon la façon dont l'étape se montre (rendus avec la bulle). */
    function boutonsEtape1() {
        if (modeRendu === 'exemple') {
            return [
                { libelle: 'Voir le travail complet', action: function () { ouvrirLExemple(true); } },
                { libelle: "Faire l'exercice soi-même", action: function () { ouvrirLExemple(false); } },
                { libelle: 'Passer à ma grille', primaire: true, action: passerAMaGrille }
            ];
        }
        if (modeRendu === 'existante') return [{ libelle: 'Prendre cette grille', primaire: true, action: prendreCetteGrille }];
        if (modeRendu === 'grille') return [{ libelle: 'Prendre une grille déjà créée', action: function () { aller('conception', 'grille-criteres'); } }];
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
        var pid = lireCtx().productionId;
        var e = evaluations().find(function (x) {
            return x && x.productionId === pid && x.verrouillee === true && !x.remplaceeParId;
        });
        if (e && !lireCtx().evaluationId) majCtx({ evaluationId: e.id, evaluationDA: e.etudiantDA });
        return !!e;
    }

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
    var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà : colle-la ici, puis montre à l'application ce que veut dire chaque morceau (un critère, un niveau, des points). C'est ainsi qu'elle pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. C'est souvent long, parce que chaque grille est construite à sa façon et que l'application ne peut pas deviner le rôle de chaque morceau. Mais tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle. Pas de grille sous la main ? Touche « Composer ma grille ».";
    // PROPOSÉ (12 nov. 2026, à valider par Grégoire) : la bulle de l'exemple, avant sa grille (point 5).
    var TEXTE_1_EXEMPLE = "Avant ta grille, un exemple : une grille fictive, avec deux sections, quatre critères et quatre niveaux. Tu peux voir le travail complet, toutes ses étiquettes posées, ou faire l'exercice toi-même : la bulle te guide, une étiquette à la fois. Rien ne s'enregistre : l'exemple ne devient pas une de tes grilles. Ensuite, tu passes à ta grille.";
    // PROPOSÉ (13 nov. 2026, à valider par Grégoire) : dans Conception › Grilles (« Composer ma grille »), la bulle disait
    // encore « colle-la ici » (essai du 12 nov.). `TEXTE_1` ne change pas ailleurs.
    var TEXTE_1_COMPOSER = "Pour évaluer une première production, il te faut ta grille. Ici, tu la composes à la main : donne-lui un nom, puis ajoute ses critères un à un, avec leur pondération. C'est ainsi que l'application pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. Tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle. Ta grille existe déjà dans un document ? Reviens à « Mon matériel » pour la coller.";
    var TEXTE_1_CHOIX = "Ta grille porte des points et des niveaux. Le résultat d'une évaluation viendra de l'un ou de l'autre : des points qui s'additionnent en une note, ou un niveau par critère (comme « maîtrisé »), que ton échelle traduit ensuite en note. Choisis ce qui correspond à ta façon d'évaluer.";

    var ETAPES = [
        {
            titre: 'Ta grille',
            get texte() { return modeRendu === 'choix' ? TEXTE_1_CHOIX : modeRendu === 'exemple' ? TEXTE_1_EXEMPLE : modeRendu === 'composer' ? TEXTE_1_COMPOSER : TEXTE_1; },
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
            fleches: function () { return dissectionOuverte() ? A().fleches() : null; },
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
                await attendre(function () { return !!ligneDeLaListe(lireCtx().productionId); }, 3000);
                amenerDeCote(ligneDeLaListe(lireCtx().productionId));
            },
            zones: function () {
                if (ecranEvaluationVisible()) return surLaCible(ouToucherEnEvaluant());
                return [rangeeDe(ligneDeLaListe(lireCtx().productionId))];
            },
            contour: function () {
                if (ecranEvaluationVisible()) return ouToucherEnEvaluant();
                return ligneDeLaListe(lireCtx().productionId);
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
            // Lot de la dissection sur l'iPad (12 nov. 2026) : l'exemple offert d'abord ; aucune grille déjà là prise.
            exemple: 'offert', grillePrise: false
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
    // LE MODÈLE (13 nov. 2026) : le même parcours, dans la démo, sur le deuxième groupe, avec le matériel fourni
    // =================================================================
    // Consigne : `plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md`. Les étapes sont celles du parcours
    // (`ETAPES`) : chacune est reprise telle quelle (ses zones, ses flèches, son halo, ce qui la fait avancer), avec un
    // texte qui donne le matériel et, quand il est long, un bouton qui le copie. La personne fait chaque geste : rien ne
    // se remplit ni ne se clique tout seul.

    /*
     * LE MATÉRIEL FOURNI : celui de Grégoire, tiré de son cours 601-101, MOT POUR MOT (aucune retouche). Sa grille
     * « G4H Sans français », son Artefact 1, les niveaux qu'il impose (12 nov., 19 h 51), ses vingt commentaires, son mot.
     */
    var MATERIEL = Object.freeze({
        grille: Object.freeze({
            nom: 'G4H Sans français',
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
            description: 'Appliquer des stratégies de lecture variées (Madawigouche)',
            type: 'artefact-portfolio',
            nomDuType: 'Artefact',
            objectif: "Développer ta capacité à choisir les stratégies de lecture qu'appelle un texte donné, plutôt que de les appliquer au hasard.",
            tache: "Annoter le chapitre « Madawigouche » de Rivières-aux-Cartouches en y appliquant au moins trois stratégies de lecture, puis formuler une première hypothèse d'objectif de communication.",
            detailTache: "Une stratégie de lecture te fait regarder le texte sous un angle précis. En en appliquant plusieurs, tu vois des choses qu'une simple lecture ne montre pas.\n\n1. Lis et annote l'extrait \nApplique au moins trois stratégies de lecture différentes, choisies parmi les quinze du Manuel\nLaisse des traces visibles directement sur le texte imprimé\n\n2. Identifie chaque stratégie utilisée • Écris le nom de la stratégie en haut de la page • Utilise un système de couleurs et de symboles constant • Assure-toi que tes annotations restent lisibles\n\n3. Formule ton hypothèse d'objectif de communication \nÉcris ton HOC en bas de la page, en une phrase complète \nElle doit refléter ce que tu comprends du texte après avoir appliqué tes stratégies\n\nRappels importants \nTrois stratégies, c'est un minimum, pas un objectif. \nUne stratégie appliquée à moitié ne compte pas : va au bout de chacune."
        }),
        niveaux: Object.freeze([['Structure', 'M'], ['Rigueur', 'D'], ['Plausibilité', 'D'], ['Nuance', 'D']]),
        echelle: 'IDME et niv 0',
        // Le modèle par standards de l'assistant (`STD-n-meilleurs`, celui que la vue simple appelle « Par standards »).
        pratique: Object.freeze({ id: 'STD-n-meilleurs', nom: 'N meilleures évaluations' }),
        fichierCommentaires: 'commentaires-artefact-1.txt',
        commentaires: [
            "## STRUCTURE",
            "**STRUCTURE (0)** : Le travail n'est pas recevable.",
            "**STRUCTURE (I)** : Il est possible que les stratégies appliquées ne soient pas nommées, ou que l'on ne puisse pas dire de quelle stratégie relèvent la plupart des annotations. Sans ce rattachement, les traces seront difficiles à réutiliser pour la carte mentale. Pour atteindre le seuil, écris le nom de chaque stratégie en haut de la page et choisis un moyen de distinguer ses annotations des autres (une couleur, un symbole, une marge). L'important est qu'on sache d'où vient chaque annotation.",
            "**STRUCTURE (D)** : Les stratégies appliquées sont nommées, et pour la majorité des annotations, on peut dire de quelle stratégie elles relèvent. Le rattachement reste toutefois incomplet : certaines annotations ne renvoient à aucune stratégie ou à aucun passage précis, ou le moyen de les distinguer change d'une page à l'autre. Pour atteindre la maîtrise, reprends chaque annotation : de quelle stratégie vient-elle, sur quel passage porte-t-elle ? Garde le même moyen de les distinguer sur toutes les pages.",
            "**STRUCTURE (M)** : Pour au moins quatre annotations sur cinq, on peut dire de quelle stratégie elles relèvent et sur quel passage elles portent. Le même moyen de les distinguer sert sur toutes les pages : on retrouve en quelques secondes ce qu'une stratégie a fait ressortir. Ces traces seront directement utilisables pour la carte mentale. Pour aller plus loin, regroupe tes annotations selon un principe qui t'appartient : par thème, par personnage, par question.",
            "**STRUCTURE (E)** : Chaque annotation est rattachée à sa stratégie et à son passage, et les pages vont au-delà de ce qui était demandé. Elles proposent un principe d'organisation qui leur est propre : un index, une légende, un regroupement par thème ou par question que la consigne ne prévoyait pas et qui fait voir le texte autrement. Ce choix personnel fait des pages annotées un outil de travail réutilisable pour l'analyse d'un autre texte.",
            "## RIGUEUR",
            "**RIGUEUR (0)** : Le travail n'est pas recevable.",
            "**RIGUEUR (I)** : Il est possible que moins de trois stratégies soient appliquées, ou que la plupart des annotations se limitent à un surlignement sans dire ce qui est repéré. Le matériau recueilli sera alors trop mince pour construire la carte mentale. Pour atteindre le seuil, applique au moins trois stratégies et, pour chaque élément relevé, écris quelques mots qui disent ce que tu as repéré. Un passage surligné sans annotation ne garde aucune trace de ta lecture.",
            "**RIGUEUR (D)** : Au moins trois stratégies sont appliquées, et la majorité des annotations expriment une idée plutôt qu'un simple surlignement. L'application reste toutefois inégale : certaines parties du texte ne sont pas couvertes, ou certaines annotations restent vagues. Pour atteindre la maîtrise, mène chaque stratégie jusqu'au bout, du début à la fin du texte, et reprends les annotations vagues pour nommer avec précision ce qui est repéré. Une stratégie appliquée à moitié laissera des trous dans ta carte mentale.",
            "**RIGUEUR (M)** : Chacune des stratégies est menée jusqu'au bout, sur l'ensemble du texte, et au moins quatre annotations sur cinq nomment avec précision ce qui est repéré. Le repérage est complet : il fournit une base solide pour la carte mentale. Pour aller plus loin, ne t'arrête pas à ce que la stratégie te fait chercher : note aussi ce qu'elle ne permet pas de saisir dans ce texte, ou essaie une stratégie que tu n'as pas encore pratiquée.",
            "**RIGUEUR (E)** : Le repérage est complet et précis, et il dépasse l'application des stratégies telles qu'elles sont enseignées. Les pages montrent une stratégie adaptée au texte, combinée à une autre ou inventée pour saisir ce que les stratégies du manuel ne faisaient pas ressortir. Cet apport personnel montre que les stratégies sont assez maîtrisées pour être transformées, et qu'elles pourront servir devant un texte très différent.",
            "## PLAUSIBILITÉ",
            "**PLAUSIBILITÉ (0)** : Le travail n'est pas recevable.",
            "**PLAUSIBILITÉ (I)** : Il est possible que la HOC soit absente, qu'elle ne soit pas rédigée en une phrase complète, ou qu'elle ne se rattache à aucun thème que tes annotations font ressortir. L'interprétation ne repose alors pas encore sur ta lecture. Pour atteindre le seuil, relis tes annotations, dégage un thème qui revient, puis écris au bas de la page une HOC en une phrase complète qui s'appuie sur ce thème. À ce stade exploratoire, ajuster son hypothèse est normal.",
            "**PLAUSIBILITÉ (D)** : Une HOC est écrite en une phrase complète et elle se rattache à un thème que les annotations font ressortir. Elle énonce toutefois un propos (ce que l'auteur ou l'autrice dit) plutôt qu'une intention d'écriture (ce qu'il ou elle cherche à faire), ou plusieurs annotations restent sans rapport avec elle. Pour atteindre la maîtrise, transforme ton propos en intention selon la structure du manuel (auteur ou autrice, verbe d'action, objet, angle) et vérifie que tes annotations mènent des passages aux thèmes, puis au propos, puis à la HOC.",
            "**PLAUSIBILITÉ (M)** : La HOC est formulée comme une intention d'écriture, et l'on peut suivre dans les annotations le chemin qui y mène : des passages annotés aux thèmes, des thèmes au propos, du propos à la HOC. Les annotations sans rapport avec ce chemin restent l'exception. Cette hypothèse tient à ta lecture et servira de point de départ à la carte mentale. Pour aller plus loin, cherche un passage qui semble la contredire et demande-toi si elle lui résiste.",
            "**PLAUSIBILITÉ (E)** : La HOC tient à la lecture, et les pages la mettent elles-mêmes à l'épreuve. Elles relèvent un passage qui semble la contredire, ou envisagent une autre hypothèse possible, et montrent pourquoi la piste retenue résiste ou comment elle a été ajustée. Cette démarche dépasse ce qui était demandé : elle traite l'hypothèse comme une idée à tester, ce qui se transfère à la lecture d'autres textes.",
            "## NUANCE",
            "**NUANCE (0)** : Le travail n'est pas recevable.",
            "**NUANCE (I)** : Il est possible que les annotations relèvent des éléments sans dire ce qu'ils révèlent : réactions spontanées, éléments évidents, repérages sans interprétation. La lecture reste alors à la surface du texte. Pour atteindre le seuil, choisis un élément que tu as repéré et écris ce qu'il révèle d'un thème ou du propos de l'auteur ou de l'autrice. Interpréter, c'est faire ce lien : un élément relevé ne dit rien tant qu'on n'a pas écrit ce qu'il laisse entendre.",
            "**NUANCE (D)** : Au moins une annotation est interprétative : elle dit ce que l'élément repéré révèle d'un thème ou du propos, au lieu de seulement le relever. La lecture reste toutefois dans l'évidence, parce que les éléments repérés ne sont pas encore rapprochés les uns des autres. Pour atteindre la maîtrise, rapproche au moins deux fois deux éléments (deux passages, ou ce que deux stratégies ont fait ressortir) et écris ce que ce rapprochement révèle : une distinction, un point commun, une tension, une contradiction que tu expliques.",
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

    // Mots PROPOSÉS (13 nov. 2026), lus par l'enseignant·e : ils partent tels quels et restent corrigeables.
    var MOTS_M = {
        refus: "Commence par la modélisation de « Mettre ta classe en place » : ce modèle se joue sur le groupe que tu y montes.",
        groupe: "Ce modèle se joue sur le deuxième groupe de la démo : choisis-le dans l'en-tête.",
        copierGrille: 'Copier la grille', grilleCopiee: 'Grille copiée. Colle-la dans la zone de collage.',
        copierNom: 'Copier le nom', nomCopie: 'Nom copié. Colle-le dans le champ.',
        copierObjectif: "Copier l'objectif", objectifCopie: 'Objectif copié. Colle-le dans son champ.',
        copierTache: 'Copier la tâche', tacheCopiee: 'Tâche copiée. Colle-la dans son champ.',
        copierConsignes: 'Copier les consignes', consignesCopiees: 'Consignes copiées. Colle-les dans leur champ.',
        nonCopie: "Le texte n'a pas pu être copié. Essaie de nouveau.",
        telecharger: 'Télécharger les commentaires',
        telecharge: 'Fichier « ' + MATERIEL.fichierCommentaires + ' » téléchargé. Importe-le dans la cartouche.'
    };

    function copier(texte, libelle, fait) {
        return window.ParcoursClasse.copierTexte(texte, { fait: fait, titre: libelle, rate: MOTS_M.nonCopie });
    }

    /** Les vingt commentaires, en fichier texte : la cartouche les importe par « Importer depuis un fichier texte ». */
    function telechargerLesCommentaires() {
        var url = URL.createObjectURL(new Blob([MATERIEL.commentaires], { type: 'text/plain;charset=utf-8' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = MATERIEL.fichierCommentaires;
        a.className = 'parcours-tampon-copie';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        if (window.notifications && typeof window.notifications.succes === 'function') window.notifications.succes(MOTS_M.telecharge);
    }

    // ---------- Le deuxième groupe, et ce que la démo contient déjà du modèle ----------

    function deuxiemeGroupe() {
        return window.ParcoursClasse && typeof window.ParcoursClasse.deuxiemeGroupe === 'function' ? window.ParcoursClasse.deuxiemeGroupe() : null;
    }

    function refusModele() { return deuxiemeGroupe() ? null : MOTS_M.refus; }

    function surLeDeuxiemeGroupe() {
        var g = deuxiemeGroupe();
        return !!g && groupeCoursActifId() === g.id;
    }

    /** Les grilles que le modèle a créées dans la démo : celles qui portent le nom de la grille fournie. */
    function grillesDuModele() {
        return grilles().filter(function (g) { return g && g.nom === MATERIEL.grille.nom; });
    }

    /**
     * Le repère du modèle, refait à chaque lancement : tout ce que la démo contient, sauf ce qui vient du modèle (sa
     * grille par son nom, la production qui la porte, une pratique qui n'est pas du pack, les cartouches de sa grille).
     * Les étapes avancent alors sur ce qui a déjà été fait, comme à une reprise, sans rien écrire hors de la démo.
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
            exemple: 'passe', grillePrise: false
        };
    }

    // ---------- Étape 1 du modèle : la grille collée, étiquetée, créée ; puis ses critères, jugés par niveaux ----------

    function grilleDuModele() {
        grilleCreee();
        return parId(grilles(), lireCtx().grilleId);
    }

    /**
     * Mesuré le 13 nov. 2026 : étiquetée (nom, description, pondération), la grille fournie est créée EN POINTS, ses
     * critères analytiques (une grille sans niveau nommé se compte en points). Celle de Grégoire se juge par niveaux :
     * tant qu'un de ses critères ne l'est pas, l'étape montre où le passer à « Holistique ».
     */
    function grilleEnPoints() {
        var g = grilleDuModele();
        // Chaque critère, un à un : un seul passé à « Holistique » en fait déjà une grille mixte, qui n'est plus « en points ».
        return !!g && (g.criteres || []).some(function (c) { return c && c.type !== 'holistique'; });
    }

    function modeModele1() { return grilleEnPoints() ? 'types' : modeEtape1(); }

    /**
     * Le premier menu « Type » qui n'est pas à « Holistique ». Les quatre menus ont la même signature pour le moteur
     * (ni identifiant ni nom) : il ne ramène donc pas le suivant dans la vue. Mesuré le 13 nov. 2026 (trois passages sur
     * six) : après un menu, la liste redessinée, le suivant restait sous le bandeau de la démo, au bas de l'écran, et la
     * pulsation, cachée. Le menu désigné est donc amené entre l'en-tête et le bandeau, trois fois au plus par menu (la
     * liste se redessine en plusieurs temps), puis la personne garde la main.
     */
    var typeAmene = { menu: null, fois: 0 };
    function typeAChanger() {
        var menus = document.querySelectorAll('#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]');
        for (var k = 0; k < menus.length; k++) {
            if (!vis(menus[k]) || menus[k].value === 'holistique') continue;
            if (typeAmene.menu !== menus[k]) typeAmene = { menu: menus[k], fois: 0 };
            var r = menus[k].getBoundingClientRect(), entete = qs('header.entete'), bandeau = el('bandeau-demo');
            var haut = entete ? Math.max(0, entete.getBoundingClientRect().bottom) : 0;
            var bas = vis(bandeau) ? Math.min(window.innerHeight, bandeau.getBoundingClientRect().top) : window.innerHeight;
            if (typeAmene.fois < 3 && (r.top < haut + 4 || r.bottom > bas - 4)) {
                typeAmene.fois++;
                menus[k].scrollIntoView({ block: 'center' });
            }
            return menus[k];
        }
        return null;
    }

    function ouPasserAuxNiveaux() {
        var g = grilleDuModele(), ouverte = grilleOuverteDansLEditeur();
        if (editeurGrilleVisible()) return ouverte && g && ouverte.id === g.id ? typeAChanger() : el('menuGrilles');
        var voir = qs('#conception-materiel [data-action="materiel.voir"][data-param="grille-criteres"]');
        return vis(voir) ? voir : qs('#sous-navigation [data-sous-onglet="conception-grille-criteres"]');
    }

    function gesteDesTypes() {
        var g = grilleDuModele(), ouverte = grilleOuverteDansLEditeur();
        if (editeurGrilleVisible() && ouverte && g && ouverte.id === g.id) return "Dans le menu « Type » de chaque critère, choisis « Holistique ».";
        if (editeurGrilleVisible()) return "Dans le menu des grilles, ouvre « " + MATERIEL.grille.nom + " ».";
        return "Touche « La voir dans Grilles de critères ».";
    }

    // ---------- Étape 4 du modèle : l'étudiant·e de la ligne que la bulle pointe ----------

    function etudiantDeLaLigne() {
        var s = ligneDeLaListe(lireCtx().productionId);
        if (!s) return '';
        var v = [].map.call(s.options, function (o) { return o.value; }).filter(function (x) { return x.indexOf('evaluer|') === 0; })[0];
        var da = v ? v.split('|')[1] : '';
        var liste = typeof obtenirEtudiantsCoursActif === 'function' ? (obtenirEtudiantsCoursActif() || []) : [];
        var e = liste.find(function (x) { return x && String(x.da) === String(da); });
        return e ? [e.prenom, e.nom].filter(Boolean).join(' ') : '';
    }

    // ---------- Étape 8 du modèle : les commentaires, importés d'un fichier ----------

    function boutonImporter() { return qs('#conception-retroactions [data-action="ouvrirImportTxtCartouche"]'); }

    /** La fiche de la cartouche en création, sa grille et son échelle choisies, aucun commentaire encore écrit. */
    function commentairesAImporter() {
        if (!vis(el('btnCreerCartouche')) || !vis(boutonImporter())) return false;
        if (premierAFaire(['nomCartouche', 'selectGrilleCartouche', 'selectEchelleCartouche'], null)) return false;
        var cases = document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]');
        return cases.length > 0 && ![].some.call(cases, function (t) { return String(t.value || '').trim() !== ''; });
    }

    // ---------- Les textes du modèle (PROPOSÉS, 13 nov. 2026) ----------

    var NIVEAUX_DITS = MATERIEL.niveaux.map(function (n) { return n[0] + ' ' + n[1]; }).join(', ');

    var TEXTES_M = {
        grille: "Dans la démo, tu vas évaluer une première production du deuxième groupe, geste par geste, avec du matériel fourni. D'abord la grille : « " + MATERIEL.grille.nom + " », quatre critères, chacun avec sa description et sa pondération. Touche « Copier la grille », colle-la dans la zone de collage, puis montre à l'application ce qu'est chaque morceau : le nom de la grille (« Titre »), les descriptions (« Description »), les critères (« Critère ») et les pourcentages (« Pondération »). C'est le geste que tu feras avec ta propre grille, copiée de son document.",
        types: "Ta grille est créée. Elle n'a pas de niveaux : l'application l'a donc lue comme une grille en points. Celle-ci se juge par niveaux, avec une échelle que tu choisiras ensuite. Ouvre-la dans « Grilles de critères » et passe chacun de ses quatre critères à « Holistique » : ses pondérations ne changent pas.",
        production: "La grille est prête. Décris maintenant la production qu'elle servira à évaluer. Le matériel : le nom « " + MATERIEL.production.description + " » (touche « Copier le nom »), à coller aussi dans « Activité d'apprentissage » ; le type « " + MATERIEL.production.nomDuType + " » ; la grille « " + MATERIEL.grille.nom + " » ; l'échelle « " + MATERIEL.echelle + " ». La démo a déjà un « " + MATERIEL.production.titre + " » dans le cours de son premier groupe : celui-ci prend pour nom ce qu'il fait faire.",
        consignes: "Écris ce que les étudiant·es doivent savoir pour réussir. Le matériel : l'objectif, la tâche et les consignes d'une vraie production. Copie chacun, puis colle-le dans son champ. Ensuite, pose une date de remise (celle d'aujourd'hui convient) et coche « Consignes transmises » : la production entre alors au calendrier du groupe.",
        pratique: "La première évaluation est faite. Reste à dire comment se construit la note du cours : c'est la pratique de notation. Touche « + Nouvelle pratique », puis « Partir d'un modèle », et choisis « " + MATERIEL.pratique.nom + " » : le modèle par standards, où la note vient des niveaux de maîtrise. Suis l'assistant jusqu'à « Créer la pratique » : il te demande alors l'échelle. Choisis « " + MATERIEL.echelle + " », puis touche « Adopter ». La note que tu viens d'attribuer ne changera pas.",
        appliquer: "La pratique est créée, mais elle ne s'applique encore à aucun cours. Choisis-la dans le menu en haut de la page, puis touche « Appliquer au cours actif » : c'est le cours du deuxième groupe. Sans pratique appliquée, l'application ne calcule aucune note.",
        cartouche: "La rétroaction vient de la grille. Pour qu'elle parle avec des mots d'enseignant·e, crée une cartouche : donne-lui un nom, choisis la grille « " + MATERIEL.grille.nom + " », puis l'échelle « " + MATERIEL.echelle + " ». Le matériel : vingt commentaires, un par critère et par niveau. Touche « Télécharger les commentaires », puis « Importer depuis un fichier texte » et choisis le fichier téléchargé : la matrice se remplit d'un coup. Touche « Créer la cartouche ». Puis, dans la fiche de la production, choisis cette cartouche : elle s'y appliquera à chaque évaluation.",
        retroaction: "Reviens à la première évaluation : touche « Actions › Consulter », puis « Déverrouiller ». Choisis la cartouche : la rétroaction se réécrit avec ses commentaires, un par critère, selon le niveau attribué. Dans « Un mot pour ton étudiant·e », écris « " + MATERIEL.mot + " ». Puis verrouille. Tu as fait tous les gestes : il reste à les refaire avec ta grille, ta production et tes mots."
    };

    function texteEvaluation() {
        var qui = etudiantDeLaLigne();
        return "Évalue une première production : celle " + (qui ? "de " + qui + ", sur la ligne que la bulle pointe" : "de la ligne que la bulle pointe") +
            ". Rien à importer : touche « Actions › Évaluer ». Pour chaque critère, choisis le niveau fourni : " + NIVEAUX_DITS +
            ". La note se calcule à mesure, et une rétroaction s'écrit sous tes yeux. Puis touche « Verrouiller » : l'évaluation ne bougera plus par mégarde.";
    }

    // ---------- Les étapes du modèle : celles du parcours, avec le matériel ----------

    /**
     * Une étape du parcours, reprise pour le modèle : ce qu'elle désigne et ce qui la fait avancer ne changent pas ; `plus`
     * la surcharge (un texte, un geste, des boutons). Tant que le deuxième groupe n'est pas le groupe actif, l'étape
     * n'avance pas : elle montre le menu de l'en-tête, et le dit.
     */
    function pourLeModele(etape, plus) {
        var e = Object.create(etape);
        Object.keys(plus).forEach(function (k) { Object.defineProperty(e, k, Object.getOwnPropertyDescriptor(plus, k)); });
        var d = {};
        ['zones', 'fleches', 'contour', 'aussiEviter', 'formulaire', 'complement', 'avis', 'atteint'].forEach(function (k) { d[k] = e[k]; });
        var sinon = function (k, repli) {
            return function () { return surLeDeuxiemeGroupe() ? (typeof d[k] === 'function' ? d[k].apply(e, arguments) : repli) : null; };
        };
        e.zones = function () { return surLeDeuxiemeGroupe() ? (d.zones ? d.zones.call(e) : []) : []; };
        e.contour = function () { return surLeDeuxiemeGroupe() ? (d.contour ? d.contour.call(e) : null) : el('selectGroupeCoursHeader'); };
        e.avis = function () { return surLeDeuxiemeGroupe() ? (d.avis ? d.avis.call(e) : '') : MOTS_M.groupe; };
        ['fleches', 'aussiEviter', 'formulaire', 'complement'].forEach(function (k) { if (d[k]) e[k] = sinon(k, null); });
        if (d.atteint) e.atteint = function () { return surLeDeuxiemeGroupe() && d.atteint.call(e); };
        return e;
    }

    var ETAPES_MODELE = [
        pourLeModele(ETAPES[0], {
            get texte() { return modeRendu === 'types' ? TEXTES_M.types : TEXTES_M.grille; },
            get geste() { return modeRendu === 'types' ? gesteDesTypes() : gesteEtape1(); },
            get boutons() {
                if (modeRendu === 'types' || dissectionOuverte()) return null;
                return [{ libelle: MOTS_M.copierGrille, primaire: true, action: function () { copier(tableauDeLaGrille(), MOTS_M.copierGrille, MOTS_M.grilleCopiee); } }];
            },
            avant: async function () {
                modeRendu = modeModele1();
                if (modeRendu === 'types' || sousSectionVisible('conception-materiel')) return;
                aller('conception', 'materiel');
                await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
            },
            zones: function () { return modeRendu === 'types' ? surLaCible(ouPasserAuxNiveaux()) : zonesEtape1(); },
            fleches: function () { return modeRendu !== 'types' && dissectionOuverte() ? A().fleches() : null; },
            complement: function () { return modeRendu === 'types' ? null : complementEtape1(); },
            aussiEviter: function () { return modeRendu === 'types' ? [] : aussiEviterEtape1(); },
            contour: function () { return modeRendu === 'types' ? ouPasserAuxNiveaux() : contourEtape1(); },
            nommeLeContour: true,
            atteint: function () {
                if (grilleDuModele() && !grilleEnPoints()) return true;
                if (modeModele1() !== modeRendu) M().allerA(0);
                return false;
            }
        }),
        pourLeModele(ETAPES[1], {
            texte: TEXTES_M.production,
            geste: "Touche « + Nouvelle production », remplis-la avec le matériel fourni, puis touche « Créer la production ».",
            boutons: [{ libelle: MOTS_M.copierNom, primaire: true, action: function () { copier(MATERIEL.production.description, MOTS_M.copierNom, MOTS_M.nomCopie); } }]
        }),
        pourLeModele(ETAPES[2], {
            texte: TEXTES_M.consignes,
            geste: "Colle l'objectif, la tâche et les consignes ; écris la date de remise, puis coche « Consignes transmises ».",
            boutons: [
                { libelle: MOTS_M.copierObjectif, action: function () { copier(MATERIEL.production.objectif, MOTS_M.copierObjectif, MOTS_M.objectifCopie); } },
                { libelle: MOTS_M.copierTache, action: function () { copier(MATERIEL.production.tache, MOTS_M.copierTache, MOTS_M.tacheCopiee); } },
                { libelle: MOTS_M.copierConsignes, action: function () { copier(MATERIEL.production.detailTache, MOTS_M.copierConsignes, MOTS_M.consignesCopiees); } }
            ]
        }),
        pourLeModele(ETAPES[3], {
            get texte() { return texteEvaluation(); },
            geste: "Touche « Actions › Évaluer » sur sa ligne, choisis les niveaux fournis, puis touche « Verrouiller »."
        }),
        pourLeModele(ETAPES[4], {
            texte: TEXTES_M.pratique,
            geste: "Touche « + Nouvelle pratique », choisis « Partir d'un modèle », puis « " + MATERIEL.pratique.nom + " », jusqu'à « Créer la pratique » ; choisis l'échelle, puis « Adopter ».",
            // La question de l'échelle (un modèle par standards, `demanderEchelleAdoption`) s'ouvre par-dessus l'assistant :
            // la bulle ne la couvre pas non plus.
            zones: function () {
                var z = ETAPES[4].zones(), q = el('ui-dialogue-question');
                if (q) z = z.concat([q.closest('.modal-contenu') || q.parentElement]);
                return z.filter(Boolean);
            }
        }),
        pourLeModele(ETAPES[5], { texte: TEXTES_M.appliquer }),
        pourLeModele(ETAPES[6], {}),
        pourLeModele(ETAPES[7], {
            texte: TEXTES_M.cartouche,
            geste: "Touche « + Nouvelle cartouche », règle-la, importe les commentaires, crée-la, puis choisis-la dans la fiche de la production.",
            boutons: [{ libelle: MOTS_M.telecharger, action: function () { telechargerLesCommentaires(); } }],
            contour: function () {
                if (commentairesAImporter()) return boutonImporter();
                return ETAPES[7].contour();
            },
            zones: function () {
                if (commentairesAImporter()) return surLaCible(boutonImporter());
                return ETAPES[7].zones();
            }
        }),
        pourLeModele(ETAPES[8], {
            texte: TEXTES_M.retroaction,
            geste: "Touche « Actions › Consulter », puis « Déverrouiller » ; choisis la cartouche, écris le mot, verrouille, puis choisis la suite.",
            // La fin (consigne du 13 nov.) : la suite dans la démo, puis le même parcours sur les vraies données. Le
            // parcours suivant porte son titre quand il a son modèle ; d'ici là, comme dans « Mettre ta classe en place »,
            // « Explorer la démo » : il ne se lance pas sur les vraies données, et aucune phrase ne le dit.
            get boutons() {
                var suivant = suivantDansLaDemo();
                return [
                    suivant
                        ? { libelle: suivant.titre, primaire: true, action: function () { terminerModele(); suivant.lancerModele(0); } }
                        : { libelle: window.ParcoursClasse.mots.explorer, primaire: true, action: function () { terminerModele(); } },
                    { libelle: window.ParcoursClasse.mots.refaire, action: function () { refaireAvecMonMateriel(); } }
                ];
            }
        })
    ];

    /** Le parcours qui suit celui-ci dans le panneau, s'il a son modèle. */
    function suivantDansLaDemo() {
        var liste = window.Assistance.parcours();
        var k = liste.findIndex(function (p) { return p.id === ID; });
        var suivant = k >= 0 ? liste[k + 1] : null;
        return suivant && typeof suivant.lancerModele === 'function' ? suivant : null;
    }

    var DEF_MODELE = { id: ID + '-modele', etapes: ETAPES_MODELE, lienSortie: 'Plus tard' };

    /** La première étape du modèle que la démo n'a pas encore : une reprise y revient, sans rien retenir hors de la démo. */
    function premiereNonFaiteModele() {
        var faits = [
            function () { return !!grilleDuModele() && !grilleEnPoints(); },
            productionCreee, consignesTransmises, evaluationVerrouillee, pratiqueCreee, pratiqueEstAppliquee
        ];
        for (var k = 0; k < faits.length; k++) {
            if (!faits[k]()) return k;
        }
        // « Le point qui s'allume » n'a rien à faire : la reprise y repasse, sauf si la cartouche est déjà nommée.
        return cartoucheCreee() && productionNommeLaCartouche() ? 8 : 6;
    }

    async function lancerModele() {
        // Le modèle se joue dans la démo : il l'ouvre si elle ne l'est pas. Un import en cours l'en empêche : rien ne part.
        if (!enDemo() && typeof activerModeDemo === 'function') await activerModeDemo();
        if (!enDemo()) return;
        if (!deuxiemeGroupe()) {
            // Le deuxième groupe n'est plus là (la démo remise à neuf entre-temps) : le panneau se rouvre et le dit.
            if (window.Assistance && typeof window.Assistance.ouvrirPanneau === 'function') {
                window.Assistance.ouvrirPanneau();
                var b = document.querySelector('#panneau-assistance [data-parcours="' + ID + '"] .assistance-parcours-bouton');
                if (b) b.click();
            }
            return;
        }
        enModele = true;
        poserLeRepereModele();
        vientDeCreer = false;
        var depuis = premiereNonFaiteModele();
        window.Assistance.definirEtatModele(ID, 'en-cours', depuis);
        return M().lancer(DEF_MODELE, {
            depuis: depuis,
            surEtape: function (i) { window.Assistance.definirEtatModele(ID, 'en-cours', i); },
            surQuitter: function () { surModale(false); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Explorer la démo ».
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

    /** « Refaire avec mon matériel » : la démo se referme, le même parcours repart sur les vraies données. */
    async function refaireAvecMonMateriel() {
        terminerModele();
        window.Assistance.definirMateriel('mien');
        await lancer(0);
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
        totalModele: ETAPES_MODELE.length,
        lancerModele: lancerModele,
        refusModele: refusModele
    });

    // Pour les bancs : la condition, le repère, les étapes et la bulle du choix, lus sans lancer le parcours.
    window.ParcoursEvaluer = {
        refus: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        texteDuChoix: TEXTE_1_CHOIX,
        // Le modèle : son matériel, ses étapes, le tableau de sa grille, ce qu'il retient (en mémoire).
        materiel: MATERIEL,
        etapesModele: function () { return ETAPES_MODELE; },
        tableauDeLaGrille: tableauDeLaGrille,
        refusModele: refusModele
    };
})();
