/* =================================================================
   LE PARCOURS « ÉVALUER UNE PREMIÈRE PRODUCTION » (troisième parcours, 9 nov. 2026)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md.

   DEUX TEMPS, DIX BULLES CHACUN, une bulle par écran :
   · « Je regarde » (le modèle, dans la démo, sur le deuxième groupe ; refait le 18 nov. 2026) ;
   · « Nous faisons » (la Pratique guidée, sur les vraies données ; RÉÉCRIT LE 20 NOV. 2026 avec Grégoire, après son
     essai sur l'iPad : plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D). L'ancienne version (neuf
     étapes, la grille d'abord, du 9 nov.) est retirée.
   De la pratique de notation à la rétroaction : la pratique, son modèle ou ses réponses, son application au cours,
   l'échelle, la grille (Mon matériel, ou composée dans « Grilles »), la cartouche, la production, ses consignes, une
   première évaluation sans fichier, le point qui s'allume dans le Suivi. Il ne démarre jamais de lui-même.

   ⚠ Les textes des deux temps sont ceux de Grégoire, posés mot pour mot :
   tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js (« Nous faisons ») et
   tests/unit/sentinelle-je-regarde-evaluer-2026-11-18.test.js (« Je regarde ») les confrontent à leurs consignes.

   · « Nous faisons » : une bulle avance quand la donnée est RÉELLEMENT enregistrée. Ce qui existait au départ ne fait
     pas avancer : le parcours retient, à « Commencer », ce qui était déjà là, et ensuite ce qu'il a vu naître
     (`parcoursEvaluer`, une préférence : des identifiants, rien des données de la personne). « Reprendre » relit ce repère.
   · Il se joue sur les vraies données : si la démo est ouverte, il la referme d'abord ; si elle s'ouvre en route, il
     se ferme et attend.
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

    // ---------- Les écrans, lus ----------

    function dissectionOuverte() { return vis(el('materiel-dissection')); }
    function editeurGrilleVisible() { return sousSectionVisible('conception-grille-criteres'); }
    function dissection() { return window.materielDissection || null; }

    function grilleCreee() {
        var g = nouveau(grilles(), lireCtx().grillesAvant);
        // Une grille née avec ses rétroactions (Mon matériel peut créer sa cartouche) : elles ne font pas avancer la bulle 6.
        if (g && !lireCtx().grilleId) majCtx({ grilleId: g.id, cartouchesAvant: (lireCtx().cartouchesAvant || []).concat(ids(cartouchesDe(g.id))) });
        return !!g;
    }

    /**
     * Lot « La carte d'aide dans Apporter mon matériel » (13 nov. 2026) : ce qui guide l'étiquetage ne dépend que de la
     * page ; il vit dans `materiel-aide.js`, que la bulle 5 et la carte de la page appellent toutes deux (les zones, les
     * flèches, ce que la bulle évite, le halo).
     */
    function A() { return window.MaterielAide; }

    /** Toutes les cartouches existantes, toutes grilles confondues (le repère de « Commencer »). */
    function toutesLesCartouches() {
        return grilles().reduce(function (acc, g) { return acc.concat(ids(cartouchesDe(g && g.id))); }, []);
    }

    // ---------- La production, ses consignes ----------

    function ficheProductionOuverte() { return vis(el('formulaireProduction')); }

    // Vrai quand la bulle 7 vient de voir naître la production : l'application rouvre alors sa fiche elle-même.
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
     * La case « Consignes transmises », à SA largeur (Grégoire, 20 nov. 2026, essai sur l'iPad : le halo prenait la
     * largeur de la page, celle de la rangée) : la case et son étiquette, pas la rangée entière.
     */
    function caseConsignes() {
        var c = el('productionEcheanceAssignee');
        if (!c) return qs('#listeEcheancesGroupes .echeance-gc-checkbox');
        // La rangée de la case est à sa largeur (`inline-flex`, js/productions.js) : la case, son étiquette, son aide.
        return c.closest('.echeance-simple-ligne') || c;
    }

    // ---------- L'évaluation ----------

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
     * L'étudiant·e que la bulle 9 désigne : dans le modèle, toujours celle du matériel (Grégoire, 17 nov. 2026 : la
     * première ligne de la Liste suivait son tri, et un tri par prénom désignait Antilope Vaillante, l'une des trois
     * copies du modèle de « Recevoir ») ; dans le parcours, la première ligne (rien de désigné : `undefined`).
     */
    function daDeLaLigne() { return enModele ? MATERIEL.etudiantEvalue.da : undefined; }

    /** La ligne de la bulle 9 : celle de la production, et dans le modèle, celle de l'étudiant·e du matériel. */
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

    var CHAMPS_DES_CRITERES = '#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]';

    /** Un critère encore sans niveau ni points : le menu du niveau, ou le champ des points. */
    function critereAAttribuer() {
        var champs = document.querySelectorAll(CHAMPS_DES_CRITERES);
        for (var k = 0; k < champs.length; k++) {
            var c = champs[k];
            if (vis(c) && String(c.value || '').trim() === '') return c;
        }
        return null;
    }

    function boutonVerrou() { return el('btnVerrouillerEvaluation'); }

    // ---------- La pratique ----------

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

    /** La pratique née dans ce parcours est celle que montre le menu en haut de la page, sa fiche ouverte. */
    function laPratiqueEstChoisie() {
        var s = el('menuPratiques');
        return fichePratiqueOuverte() && !!s && !!lireCtx().pratiqueId && s.value === lireCtx().pratiqueId;
    }

    /** C'est la pratique née dans ce parcours qui est appliquée au cours actif (pas une autre, ni celle d'avant). */
    function laPratiqueDuParcoursEstAppliquee() {
        pratiqueCreee();
        var id = lireCtx().pratiqueId;
        return !!id && pratiqueAppliquee() === id;
    }

    /**
     * L'assistant ouvert, la bulle couvre forcément une partie de la fenêtre ; jamais ses boutons du geste suivant ni
     * les cartes de choix de l'écran affiché (11 nov. 2026, cinquième aperçu : la bulle couvrait le modèle à choisir).
     */
    function aussiEviterLAssistantOuvert() {
        if (!wizardOuvert()) return [];
        var cartes = [].slice.call(document.querySelectorAll('#modalWizardPratiqueV2 .wizard-v2-radio-card')).filter(vis);
        return ['wizard-v2-btn-precedent', 'wizard-v2-btn-suivant', 'wizard-v2-btn-creer'].map(el).concat(cartes);
    }

    // ---------- La bande de performance ----------

    function blocPerformance() {
        var h = qs('#section-suivi h4[data-tooltip="tdb-performance"]');
        return h ? h.parentElement : null;
    }

    // ---------- La cartouche ----------

    /** La cartouche du MODÈLE : une cartouche neuve de sa grille (js/parcours-recevoir-modele.js la lit ainsi). */
    function cartoucheCreee() {
        var ctx = lireCtx();
        var c = nouveau(cartouchesDe(laGrilleId()), ctx.cartouchesAvant);
        if (c && !ctx.cartoucheId) majCtx({ cartoucheId: c.id });
        return !!c;
    }

    function ficheCartoucheOuverte() { return vis(el('btnCreerCartouche')) || vis(el('actionsFicheCartouche')); }

    // ---------- Les lignes d'une bulle ----------

    function note(texte) { return { texte: texte, note: true }; }
    function consigne(texte) { return { texte: texte, geste: true }; }
    /** Un geste que la page ne peut pas voir fait (hors de l'application, ou un regard) : la flèche reste, sans crochet. */
    function sansTemoin(texte, montre) {
        var l = { texte: texte, fait: function () { return false; } };
        if (montre) l.montre = montre;
        return l;
    }

    // =================================================================
    // « NOUS FAISONS » (la Pratique guidée) : DIX BULLES, ÉCRITES AVEC GRÉGOIRE LE 20 NOV. 2026
    // =================================================================
    // Consigne : `plans de travail/CONSIGNE-2026-11-20-essai-parcours.md`, section D ; les mots sont ceux de Grégoire,
    // validés un à un le 20 nov. (15 h 24 à 16 h 12) : tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js les
    // confronte à la consigne. La forme est celle des « Nous faisons » de « Mettre ta classe en place » et de
    // « Recevoir » : la confirmation (« C'est fait : … ») au-dessus du titre, seulement si l'étape d'avant a été faite
    // pendant ce passage ; la phrase du lieu ; les explications (`note`, sans marque) ; les gestes (une flèche à faire,
    // un crochet fait) ; la consigne en dernier. L'objectif, l'objectif atteint, la suite et la phrase de la poignée
    // sont posés par le moteur. Pas de « Remplir » : c'est le matériel de la personne.
    // L'ORDRE est celui de « Je regarde », sauf aux bulles 3 et 4, exprès : la pratique s'applique au cours (3) avant
    // l'échelle (4), qui est ici une étape pour tout le monde, même en notation sommative.
    // CE QUI FAIT AVANCER : ce qui NAÎT pendant le parcours (une pratique, son application, une échelle choisie, une
    // grille, une cartouche, une production, ses consignes transmises, une évaluation verrouillée). Le parcours
    // retient, à « Commencer », ce qui était déjà là (`parcoursEvaluer`, une préférence : des identifiants, rien des
    // données de la personne). « Reprendre » relit ce repère et repart de la première bulle qui reste à faire.
    // RETIRÉ AVEC L'ANCIENNE PRATIQUE GUIDÉE (neuf étapes, la grille d'abord ; zéro dette) : les deux bulles
    // d'ouverture (« Pourquoi étiqueter », « Tu apprends aussi »), les bulles devant l'exemple étiqueté, la bulle du
    // choix des points ou des niveaux, « Prendre cette grille », le complément en pages de l'étiquetage, la règle des
    // formulaires sur la fiche de la production, le « Continuer » du point qui s'allume, la cartouche à nommer dans la
    // fiche de la production après coup et son avis (la cartouche rangée sous une autre grille), et la neuvième étape,
    // « Ta rétroaction, avec tes mots » (rouvrir l'évaluation pour y choisir la cartouche) : la cartouche est
    // maintenant préparée AVANT la production, qui la porte dès la première évaluation.

    var EN_MESURE_NOUS = "d'évaluer une première production de ton groupe, de la pratique de notation à la rétroaction";
    var ID_ECHELLE_DE_DEPART = 'ECHELLE_IDME_DEPART';

    function echelles() { return lireListe('echellesTemplates'); }

    // ----- Bulles 1 et 2 : l'assistant de la pratique -----

    /** Le premier écran de l'assistant (« Partir d'un modèle », « Décrire ma pratique ») est à l'écran. */
    function aLEntreeDeLAssistant() {
        var c = carteDe('porteEntree', 'modele');
        return wizardOuvert() && !!c && vis(c.carte);
    }

    /** Une voie est prise : l'assistant a quitté son premier écran. La voie est retenue (elle donne sa forme à la bulle 2). */
    function voiePrise() {
        if (!wizardOuvert() || aLEntreeDeLAssistant()) return false;
        var voie = aLEcranChoixModele() ? 'modele' : (lireCtx().voiePratique || 'decrire');
        if (lireCtx().voiePratique !== voie) majCtx({ voiePratique: voie });
        return true;
    }

    function voieDeLaPratique() { return lireCtx().voiePratique === 'decrire' ? 'decrire' : 'modele'; }

    /** Le choix de l'écran affiché de l'assistant est fait (une carte cochée). */
    function carteCochee(nom) { return !!qs('#modalWizardPratiqueV2 input[name="' + nom + '"]:checked'); }

    /** La question de l'échelle, à l'adoption d'un modèle par niveaux : la ligne de l'échelle de départ, par son nom. */
    function ligneDeLEchelleDeDepart() {
        var e = parId(echelles(), ID_ECHELLE_DE_DEPART), nom = e ? String(e.nom || '') : '';
        if (!nom) return null;
        return [].slice.call(document.querySelectorAll('#overlay-ui-dialogue .ui-dialogue-choix-ligne')).filter(function (l) {
            return String(l.textContent || '').indexOf(nom) !== -1;
        })[0] || null;
    }

    function uneEchelleEstCochee() { return !!qs('#overlay-ui-dialogue .ui-dialogue-choix-ligne input:checked'); }

    /** Où toucher dans l'assistant, un geste à la fois : la question de l'échelle, le récapitulatif, puis « Suivant → ». */
    function ouToucherPourMaPratique() {
        if (questionDeLEchelle()) return uneEchelleEstCochee() ? boutonAdopter() : ligneDeLEchelleDeDepart();
        if (!wizardOuvert()) return null;
        if (auRecapitulatif()) return el('wizard-v2-btn-creer');
        var suivant = el('wizard-v2-btn-suivant');
        if (aLEntreeDeLAssistant()) return carteCochee('porteEntree') && vis(suivant) ? suivant : null;
        if (aLEcranChoixModele()) return carteCochee('modeleChoisi') && vis(suivant) ? suivant : null;
        return vis(suivant) ? suivant : null;
    }

    function aussiEviterPourMaPratique() {
        if (questionDeLEchelle()) return [ligneDeLEchelleDeDepart(), boutonAdopter()];
        return aussiEviterLAssistantOuvert();
    }

    // L'assistant se ferme un instant entre « Créer la pratique » et la question de l'échelle, ou l'écriture de la
    // pratique : la bulle 2 ne revient à la bulle 1 que si l'assistant reste fermé (une dizaine de passages de la sonde).
    var sansAssistant = 0;
    var PASSAGES_SANS_ASSISTANT = 10;

    // ----- Bulle 4 : l'échelle -----

    function ficheEchelleNeuve() { return vis(el('btnCreerEchelle')); }

    function echelleOuverte() {
        var m = el('menuEchelles');
        return m && vis(m) && m.value ? parId(echelles(), m.value) : null;
    }

    function echelleDeDepartOuverte() {
        var e = echelleOuverte();
        return !!e && e.id === ID_ECHELLE_DE_DEPART;
    }

    /** L'échelle est choisie : gardée par « Je garde celle-ci », ou née pendant le parcours (« + Nouvelle échelle »). */
    function monEchelleEstChoisie() {
        var ctx = lireCtx();
        if (ctx.echelleId && parId(echelles(), ctx.echelleId)) return true;
        var n = nouveau(echelles(), ctx.echellesAvant);
        if (n) majCtx({ echelleId: n.id });
        return !!n;
    }

    /** « Je garde celle-ci » : l'échelle ouverte, sinon l'échelle de départ. Rien ne s'écrit dans les données. */
    function garderCetteEchelle() {
        var e = echelleOuverte() || parId(echelles(), ID_ECHELLE_DE_DEPART);
        if (e) majCtx({ echelleId: e.id });
    }

    // ----- Bulle 5 : la grille, deux voies -----

    function ficheGrilleNeuve() { return editeurGrilleVisible() && vis(el('btnCreerGrille')); }

    /** La façon dont la bulle 5 se montre : 'accueil' et 'collee' (Mon matériel), 'liste' et 'fiche' (Grilles). */
    function formeDeMaGrille() {
        if (editeurGrilleVisible() && !sousSectionVisible('conception-materiel')) return ficheGrilleNeuve() ? 'fiche' : 'liste';
        return dissectionOuverte() ? 'collee' : 'accueil';
    }

    /** « Je la compose ici » : l'onglet « Grilles ». */
    function composerIci() { aller('conception', 'grille-criteres'); }

    /** Les étiquettes posées dans l'étiquetage, par type (« titre », « critere », « description », « ponderation »…). */
    function etiquettesPosees() {
        var d = dissection(), e = d && dissectionOuverte() ? d.etatCourant() : null, vues = {};
        Object.keys((e && e.liens) || {}).forEach(function (k) { if (e.liens[k]) vues[e.liens[k]] = true; });
        return vues;
    }

    function titreEtiquete() { return !!etiquettesPosees().titre; }

    /** Un critère au moins a son nom, sa définition et ce qu'il pèse (les trois étiquettes sont posées quelque part). */
    function criteresEtiquetes() {
        var v = etiquettesPosees();
        return !!(v.critere && v.description && v.ponderation);
    }

    function boutonCreerMaGrille() { return qs('#materiel-dissection [data-action="materielDissection.creer"]'); }

    /** La fiche d'une grille neuve : ses critères en cours de saisie (`tempCriteres`, js/grilles.js). */
    function criteresSaisis() { return Array.isArray(window.tempCriteres) ? window.tempCriteres : []; }

    function champDuCritere(k, champ) {
        if (champ === 'ponderation') return qs('#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"][data-critere-index="' + k + '"]');
        return qs('#listeCriteres [data-critere-index="' + k + '"][data-champ="' + champ + '"]');
    }

    function blocDuCritere(k) {
        var c = champDuCritere(k, 'nom');
        return c ? (c.closest('.item-liste') || c) : null;
    }

    function texteDuChamp(c) { return c ? String(c.value || '').trim() : ''; }

    function premierCritereDecrit() {
        return texteDuChamp(champDuCritere(0, 'nom')) !== '' && texteDuChamp(champDuCritere(0, 'description')) !== ''
            && Number(texteDuChamp(champDuCritere(0, 'ponderation'))) > 0;
    }

    function ponderationComplete() {
        var n = criteresSaisis().length, total = 0;
        for (var k = 0; k < n; k++) total += Number(texteDuChamp(champDuCritere(k, 'ponderation'))) || 0;
        return n > 0 && Math.abs(total - 100) < 0.005;
    }

    // ----- Bulle 6 : la cartouche -----

    /**
     * La cartouche née pendant le parcours, sous QUELLE GRILLE QUE CE SOIT : la bulle dit « Choisis ta grille », elle
     * ne retient pas la personne qui en choisit une autre. (La cartouche qu'une grille apporte en naissant ne compte
     * pas : `grilleCreee` l'a rangée dans le repère.)
     */
    function cartoucheNee() {
        var ctx = lireCtx();
        if (ctx.cartoucheId) return true;
        var nee = null;
        grilles().some(function (g) {
            nee = g && g.id ? nouveau(cartouchesDe(g.id), ctx.cartouchesAvant) : null;
            return !!nee;
        });
        if (nee) majCtx({ cartoucheId: nee.id });
        return !!nee;
    }

    function cartoucheEnCreation() { return vis(el('btnCreerCartouche')); }

    /** Un critère a ses commentaires, un par niveau : toutes les cases d'une rangée de la matrice sont écrites. */
    function unCritereCommente() {
        var rangees = {};
        [].forEach.call(document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]'), function (t) {
            var reste = t.id.slice('comm_'.length), critere = reste.slice(0, reste.lastIndexOf('_'));
            if (!rangees[critere]) rangees[critere] = [];
            rangees[critere].push(String(t.value || '').trim() !== '');
        });
        return Object.keys(rangees).some(function (c) { return rangees[c].every(Boolean); });
    }

    // ----- Bulle 7 : la production -----

    /**
     * L'échelle est attendue tant qu'elle est à « Aucune » et que la grille choisie se note par niveaux : une grille
     * entièrement en points n'en demande pas (`grilleEntierementEnPoints`, la règle de l'évaluation, #941).
     */
    function echelleAttendue() {
        var sg = el('productionGrille'), se = el('productionEchelle');
        if (!sg || !sg.value || !se || se.value) return false;
        var g = parId(grilles(), sg.value);
        if (!g || typeof window.grilleEntierementEnPoints !== 'function' || window.grilleEntierementEnPoints(g)) return false;
        return [].some.call(se.options, function (o) { return !!o.value; });
    }

    /** « Rattache ce que tu viens de préparer » : la grille et la cartouche choisies, et l'échelle si la grille l'attend. */
    function materielRattache() {
        var g = el('productionGrille'), c = el('productionCartouche');
        return !!(g && g.value && c && c.value) && !echelleAttendue();
    }

    /**
     * LES TROIS MENUS RESTENT VISIBLES À CÔTÉ DE LA BULLE (Grégoire, 20 nov. 2026, essai sur l'iPad : ils étaient sous
     * la bulle, et la page avait défilé seule). Le nom donné et le type choisi, la rangée des trois menus est amenée
     * au milieu de l'écran, UNE fois par fiche ouverte ; ensuite la personne garde la main sur le défilement. La bulle
     * les évite : ce sont les champs de sa ligne.
     */
    var menusAmenes = false;
    function amenerLesTroisMenus() {
        if (!ficheProductionOuverte()) { menusAmenes = false; return; }
        if (menusAmenes || texteDuChamp(el('productionTitre')) === '' || texteDuChamp(el('productionType')) === '') return;
        var g = groupeDe('productionGrille'), rangee = g ? (g.parentElement || g) : null;
        if (!vis(rangee)) return;
        menusAmenes = true;
        var r = rangee.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) rangee.scrollIntoView({ block: 'center' });
    }

    // ----- Bulle 8 : les consignes -----

    /** La fiche de la production du parcours, ouverte, puis amenée à ses consignes (son objectif, sous l'en-tête). */
    async function ouvrirMesConsignes() {
        await ouvrirLaProduction();
        var o = el('productionObjectif'), bloc = o ? (o.closest('.champ-perso') || o.closest('.groupe-form') || o) : null;
        if (bloc && vis(bloc)) bloc.scrollIntoView({ block: 'start' });
    }

    // ----- Bulle 9 : l'évaluation -----

    /** L'écran d'évaluation a dessiné ses critères. */
    function criteresAffiches() { return !!qs(CHAMPS_DES_CRITERES); }

    /** La façon dont la bulle 9 se montre : la Liste, les critères à évaluer, puis le verrou. */
    function formeDeMonEvaluation() {
        if (!ecranEvaluationVisible()) return 'liste';
        return critereAAttribuer() || !criteresAffiches() ? 'criteres' : 'verrou';
    }

    // ----- La confirmation -----

    /** L'étape k est faite, lue comme `premiereNonFaite` la lit. */
    function etapeFaite(k) {
        return [
            function () { return pratiqueCreee() || (wizardOuvert() && !aLEntreeDeLAssistant()); },
            pratiqueCreee, laPratiqueDuParcoursEstAppliquee, monEchelleEstChoisie, grilleCreee, cartoucheNee, productionCreee,
            consignesTransmises, evaluationVerrouillee
        ][k]();
    }

    // Les étapes déjà faites au lancement de ce passage (`lancer`) : null hors d'un passage.
    var faitesAuLancement = null;

    /**
     * « C'est fait : … », au-dessus du titre, SEULEMENT si l'étape d'avant (k) a été faite PENDANT CE PASSAGE (décision de
     * Cowork, relais du 19 nov. 2026) : une étape sautée parce que déjà réglée n'en a pas. `texte` : la phrase, ou ce
     * qui la rend (la bulle 2 a deux voies).
     */
    function confirmation(k, texte) {
        var dire = function () {
            return faitesAuLancement && !faitesAuLancement[k] && etapeFaite(k) ? (typeof texte === 'function' ? texte() : texte) : '';
        };
        dire.texte = texte;   // pour la sentinelle des textes : ce qu'elle dit, quand elle le dit
        return dire;
    }

    async function allerAuxPratiques() {
        aller('conception', 'pratiques-notation');
        await attendre(function () { return sousSectionVisible('conception-pratiques-notation'); }, 2000);
    }

    // Les mots des bulles à deux voies ou à plusieurs formes, lus aussi par la sentinelle.
    var NOUS = {
        objectif: 'À la fin de ce parcours, tu seras en mesure ' + EN_MESURE_NOUS + '.',
        objectifAtteint: 'Objectif atteint : tu es en mesure ' + EN_MESURE_NOUS + '.',
        bulle1: {
            page: function () {
                return [
                    note("Cette fois, c'est ton propre matériel : ce que tu crées ici reste dans ton application."),
                    note("Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation cumulative, qu'on appelle aussi sommative."),
                    note("Ici, « sommative » ne parle pas du moment de l'évaluation (en fin d'apprentissage, par opposition à formative) mais de la façon dont la note se construit : par le « cumul » des points, ou leur « somme »."),
                    note("Il en existe d'autres, dites alternatives : la note s'y construit à partir de niveaux de maîtrise plutôt que de points."),
                    note("Ta pratique, c'est l'ensemble des règles que l'application suivra pour établir la note de l'étudiant·e."),
                    consigne("Touche « + Nouvelle pratique »")
                ];
            },
            assistant: function () {
                return [
                    note("Un assistant te pose quelques questions (un écran à la fois) et construit ta pratique avec tes réponses."),
                    note("« Partir d'un modèle » : tu adoptes une pratique toute prête, que tu pourras ajuster ensuite."),
                    note("« Décrire ma pratique » : tu réponds à des questions sur ta façon de noter et l'assistant trouve la pratique qui te correspond."),
                    consigne("Choisis la voie qui te convient, puis touche « Suivant → »")
                ];
            }
        },
        bulle2: {
            modele: {
                titre: 'Un modèle',
                confirme: "C'est fait : tu es à l'écran « Choisis un modèle ».",
                choix: function () {
                    return [
                        note("Chaque carte est une pratique toute prête, décrite en une ligne."),
                        note("Le code à côté du nom dit sa famille : CUM pour la cumulative, HYB pour l'hybride, STD pour les standards ; les autres codes désignent d'autres pratiques."),
                        note("Adopter un modèle ne t'engage pas : tu pourras le renommer et l'ajuster ensuite."),
                        consigne("Touche le modèle le plus proche de ta façon de noter, puis « Suivant → »")
                    ];
                },
                recapitulatif: function () {
                    return [
                        note("Le récapitulatif dit la famille de ta pratique et ce qu'elle fait."),
                        note("Son nom reste modifiable : donne-lui le tien si tu veux."),
                        note("Si l'assistant te demande une échelle, choisis « Échelle de départ (IDME) » : tu la découvriras à l'étape 4."),
                        consigne("Touche « Créer la pratique »")
                    ];
                }
            },
            decrire: {
                titre: 'Tes réponses',
                confirme: "C'est fait : l'assistant commence ses questions.",
                lignes: function () {
                    return [
                        note("Chaque écran pose une question sur ta façon de noter : comment tu calcules la note finale, si tu appliques des règles particulières."),
                        note("Réponds d'après ce que tu fais déjà dans ton cours. Rien n'est définitif : tu pourras modifier ta pratique ensuite."),
                        { texte: "Réponds à chaque écran, puis touche « Suivant → »", fait: function () { return auRecapitulatif() || questionDeLEchelle(); } },
                        consigne("Au récapitulatif, touche « Créer la pratique »")
                    ];
                }
            }
        }
    };

    var ETAPES = [
        {
            // 1. Ta pratique de notation : Conception › Pratiques, puis le premier écran de l'assistant.
            titre: 'Ta pratique de notation',
            lieu: function () { return !wizardOuvert(); },
            lieuSuite: ": c'est là que tu dis comment se construit la note de ton cours.",
            secondeForme: wizardOuvert,
            lignesVivantes: true,
            lignes: function () { return wizardOuvert() ? NOUS.bulle1.assistant() : NOUS.bulle1.page(); },
            avant: async function () { surModale(false); await allerAuxPratiques(); },
            zones: zonesDeLAssistant,
            aussiEviter: aussiEviterPourMaPratique,
            contour: function () {
                return wizardOuvert() ? ouToucherPourMaPratique() : qs('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
            },
            nommeLeContour: true,
            atteint: function () { return voiePrise() || pratiqueCreee(); }
        },
        {
            // 2. Deux voies, selon le choix de la bulle 1 : « Un modèle » (deux formes), ou « Tes réponses ». La bulle ne
            // suit pas chaque écran de la voie « Décrire ma pratique ».
            get titre() { return NOUS.bulle2[voieDeLaPratique()].titre; },
            confirme: confirmation(0, function () { return NOUS.bulle2[voieDeLaPratique()].confirme; }),
            secondeForme: function () { return voieDeLaPratique() === 'modele' && (auRecapitulatif() || questionDeLEchelle()); },
            lignesVivantes: true,
            lignes: function () {
                var b = NOUS.bulle2;
                if (voieDeLaPratique() === 'decrire') return b.decrire.lignes();
                return auRecapitulatif() || questionDeLEchelle() ? b.modele.recapitulatif() : b.modele.choix();
            },
            avant: function () { sansAssistant = 0; },
            zones: zonesDeLAssistant,
            aussiEviter: aussiEviterPourMaPratique,
            contour: ouToucherPourMaPratique,
            nommeLeContour: true,
            atteint: function () {
                if (pratiqueCreee()) { surModale(false); return true; }
                var dans = (wizardOuvert() && !aLEntreeDeLAssistant()) || questionDeLEchelle();
                sansAssistant = dans ? 0 : sansAssistant + 1;
                // Revenue au premier écran de l'assistant (« ← Précédent »), ou l'assistant refermé : la bulle 1.
                if (aLEntreeDeLAssistant() || sansAssistant > PASSAGES_SANS_ASSISTANT) { sansAssistant = 0; M().allerA(0); }
                return false;
            }
        },
        {
            // 3. L'appliquer à ton cours : l'étape s'ouvre en haut de l'onglet « Pratiques ».
            titre: "L'appliquer à ton cours",
            confirme: confirmation(1, "C'est fait : ta pratique est créée."),
            lignes: function () {
                return [
                    note("Tu es en haut de l'onglet « Pratiques ». Le cours actif est celui de l'en-tête de l'application."),
                    note("Une pratique créée ne s'applique encore à aucun cours. Tu la prépares une fois ; elle peut resservir d'un cours à l'autre et se partager avec tes collègues."),
                    note("Sans pratique appliquée, l'application ne calcule aucune note."),
                    sansTemoin("Vérifie que le cours de l'en-tête est bien celui que tu veux évaluer", function () { return [el('selectGroupeCoursHeader')]; }),
                    { texte: "Choisis ta pratique dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche", fait: laPratiqueEstChoisie },
                    consigne("Touche « Appliquer au cours actif »")
                ];
            },
            avant: async function () {
                surModale(false);
                await allerAuxPratiques();
                window.scrollTo(0, 0);
            },
            zones: function () { return laPratiqueEstChoisie() ? [boutonAppliquer()] : []; },
            contour: function () { return laPratiqueEstChoisie() ? boutonAppliquer() : el('menuPratiques'); },
            nommeLeContour: true,
            atteint: laPratiqueDuParcoursEstAppliquee
        },
        {
            // 4. Ton échelle de performance : Conception › Échelles. Une étape pour tout le monde, même en notation sommative.
            titre: 'Ton échelle de performance',
            confirme: confirmation(2, "C'est fait : ta pratique s'applique à ton cours."),
            lieu: function () { return !ficheEchelleNeuve(); },
            lieuSuite: ": c'est là que tu nommes les niveaux avec lesquels tu évalues une production.",
            secondeForme: ficheEchelleNeuve,
            lignesVivantes: true,
            lignes: function () {
                if (ficheEchelleNeuve()) {
                    return [
                        note("Donne un nom à ton échelle, puis nomme chacun de ses niveaux et ce qu'il vaut."),
                        consigne("Touche « Créer l'échelle »")
                    ];
                }
                return [
                    note("Une échelle de performance, ce sont des niveaux nommés, du moins réussi au plus maîtrisé. Tu situes ce que l'étudiant·e a réussi à l'un d'eux."),
                    note("Tu notes en points ? L'échelle te sert quand même : c'est par niveaux que tu prépareras tes rétroactions."),
                    note("L'application en installe une, l'« Échelle de départ (IDME) », à cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu. Chaque niveau vaut un pourcentage, dont l'application se sert pour établir la note."),
                    { texte: "Choisis « Échelle de départ (IDME) » dans le menu et lis ses niveaux", fait: echelleDeDepartOuverte },
                    consigne("Touche « Je garde celle-ci », ou « + Nouvelle échelle » pour créer la tienne")
                ];
            },
            get boutons() { return ficheEchelleNeuve() ? null : [{ libelle: 'Je garde celle-ci', action: garderCetteEchelle }]; },
            avant: async function () {
                surModale(false);
                aller('conception', 'echelle-performance');
                await attendre(function () { return sousSectionVisible('conception-echelle-performance'); }, 2000);
            },
            contour: function () {
                if (ficheEchelleNeuve()) return el('btnCreerEchelle');
                return echelleDeDepartOuverte() ? null : el('menuEchelles');
            },
            atteint: monEchelleEstChoisie
        },
        {
            // 5. Ta grille, deux voies : « Mon matériel » (par défaut), ou « Je la compose ici » (Conception › Grilles).
            titre: 'Ta grille',
            confirme: confirmation(3, "C'est fait : ton échelle est choisie."),
            lieu: function () { var f = formeDeMaGrille(); return f === 'accueil' || f === 'liste'; },
            lieuSuite: function () {
                return formeDeMaGrille() === 'liste' ? ": c'est là que tu composes et modifies tes grilles."
                    : ": c'est là que tu apportes la grille que tu utilises déjà.";
            },
            secondeForme: function () { var f = formeDeMaGrille(); return f === 'collee' || f === 'fiche'; },
            lignesVivantes: true,
            lignes: function () {
                var f = formeDeMaGrille();
                var uneGrille = note("Une grille réunit tes critères (ce que tu regardes dans une production) et ce que pèse chacun.");
                if (f === 'accueil') {
                    return [
                        uneGrille,
                        note("Ici, tu numérises une grille que tu as déjà, faite dans un traitement de texte. Une photo n'en garderait que l'apparence : l'application doit savoir ce que chaque partie signifie et à quoi elle sert. C'est toi qui le lui dis, en posant une étiquette sur chaque partie."),
                        note("Ce passage du document à l'application ne se fait qu'une fois. Ensuite, tu crées et modifies tes grilles directement dans l'application."),
                        note("Tu n'as pas de grille dans un document ? « Je la compose ici » te mène à l'onglet « Grilles »."),
                        sansTemoin("Ouvre ta grille dans ton traitement de texte, sélectionne-la et copie-la"),
                        consigne("Colle-la dans la zone")
                    ];
                }
                if (f === 'collee') {
                    return [
                        note("Ta grille est là, telle qu'elle était écrite. À toi de dire ce qu'est chaque partie."),
                        { texte: "Prends « Titre », puis touche le nom de ta grille", fait: titreEtiquete },
                        { texte: "Pour chaque critère, prends « Critère » et touche son nom, « Description » et touche sa définition, « Pondération » et touche ce qu'il pèse", fait: criteresEtiquetes },
                        consigne("Quand tout est étiqueté, touche « Créer ma grille »")
                    ];
                }
                if (f === 'liste') return [uneGrille, consigne("Touche « + Nouvelle grille »")];
                return [
                    note("En haut, ce qui identifie ta grille : son nom et sa description. Dessous, un bloc par critère."),
                    note("Le « Type » d'un critère dit comment tu l'évalues. « Holistique » : tu lui donnes un niveau de ton échelle, d'un seul regard. « Analytique » : tu lui donnes des points, élément par élément."),
                    note("« Ce qui est attendu à chaque niveau » est facultatif : tu peux y décrire chaque niveau pour ce critère, maintenant ou plus tard."),
                    note("« Complexité SOLO » peut rester tel quel pour l'instant."),
                    { texte: "Donne un nom à ta grille", champs: function () { return [el('nomGrilleTemplate')]; } },
                    { texte: "Nomme ton premier critère, décris-le en une phrase et donne sa pondération", fait: premierCritereDecrit },
                    { texte: "Touche « + Ajouter un critère » pour chacun des suivants (la pondération totale doit atteindre 100\u00a0%)", fait: ponderationComplete },
                    consigne("Touche « Créer la grille »")
                ];
            },
            get boutons() { return formeDeMaGrille() === 'accueil' ? [{ libelle: 'Je la compose ici', action: composerIci }] : null; },
            avant: async function () {
                surModale(false);
                // La personne est peut-être déjà dans l'étiquetage, ou dans l'onglet « Grilles » : rien ne bouge.
                if (sousSectionVisible('conception-materiel') || editeurGrilleVisible()) return;
                aller('conception', 'materiel');
                await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
            },
            zones: function () {
                var f = formeDeMaGrille();
                if (f === 'accueil') return [el('materiel-zone-collage')];
                return f === 'collee' ? A().zones() : [];
            },
            // L'étiquetage : une flèche vers l'étiquette à prendre, une vers le morceau (`materiel-aide.js`). La fiche d'une
            // grille : vers son nom (la ligne du geste), puis vers le bloc du premier critère.
            fleches: function () {
                var f = formeDeMaGrille();
                if (f === 'accueil') return [el('materiel-zone-collage')];
                if (f === 'collee') return A().fleches() || [];
                if (f === 'fiche' && texteDuChamp(el('nomGrilleTemplate')) !== '' && !premierCritereDecrit()) return [blocDuCritere(0)];
                return [];
            },
            aussiEviter: function () { return formeDeMaGrille() === 'collee' ? A().aussiEviter() : []; },
            contour: function () {
                var f = formeDeMaGrille();
                if (f === 'accueil') return el('materiel-zone-collage');
                if (f === 'collee') return A().contour();
                if (f === 'liste') return qs('#conception-grille-criteres [data-action="creerNouvelleGrille"]');
                return el('btnCreerGrille');
            },
            atteint: grilleCreee
        },
        {
            // 6. Ta cartouche : Conception › Cartouches. La bulle reste sur la fiche jusqu'à « Créer la cartouche ».
            titre: 'Ta cartouche',
            confirme: confirmation(4, "C'est fait : ta grille est créée."),
            lieu: function () { return !ficheCartoucheOuverte(); },
            lieuSuite: ": c'est là que tu prépares tes rétroactions.",
            secondeForme: ficheCartoucheOuverte,
            lignesVivantes: true,
            lignes: function () {
                if (!ficheCartoucheOuverte()) {
                    return [
                        note("Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance."),
                        note("Elle croise ce que tu viens de créer : ta grille lui donne ses rangées (un critère par rangée) et ton échelle ses colonnes (un niveau par colonne). À chaque rencontre, une case : le commentaire que lira l'étudiant·e dont la production atteint ce niveau pour ce critère."),
                        note("Ta grille vaut pour toutes tes productions ; une cartouche est propre à une production : elle dit ce qu'on observe à chaque niveau dans cette tâche."),
                        note("Tu l'écris une fois. Ensuite, elle t'aide à évaluer et chaque évaluation compose la rétroaction avec tes phrases."),
                        consigne("Touche « + Nouvelle cartouche »")
                    ];
                }
                return [
                    { texte: "Donne-lui le nom de la production qu'elle servira à évaluer", champs: function () { return [el('nomCartouche')]; } },
                    { texte: "Choisis ta grille et ton échelle (les cases apparaissent)", champs: function () { return [el('selectGrilleCartouche'), el('selectEchelleCartouche')]; } },
                    note("Tu veux te faire aider par un assistant d'IA pour rédiger tes commentaires ? « Télécharger le prompt » te donne un fichier texte à lui remettre : il porte tes critères, tes niveaux et les consignes de rédaction. « Importer depuis un fichier texte » ramène ensuite ses réponses dans leurs cases."),
                    { texte: "Écris les commentaires d'un premier critère, un par niveau", fait: unCritereCommente },
                    consigne("Touche « Créer la cartouche »"),
                    note("Les autres cases peuvent attendre : tu les rempliras à mesure.")
                ];
            },
            avant: async function () {
                grilleCreee();
                aller('conception', 'retroactions');
                await attendre(function () { return sousSectionVisible('conception-retroactions'); }, 2000);
            },
            contour: function () {
                if (!ficheCartoucheOuverte()) return qs('#conception-retroactions [data-action="creerNouvelleCartouche"]');
                return cartoucheEnCreation() ? el('btnCreerCartouche') : null;
            },
            atteint: cartoucheNee
        },
        {
            // 7. Ta production : Conception › Productions.
            titre: 'Ta production',
            confirme: confirmation(5, "C'est fait : ta cartouche est créée."),
            lieu: function () { return !ficheProductionOuverte(); },
            lieuSuite: ": c'est là que tu décris ce que tu demandes à tes étudiant·es.",
            secondeForme: ficheProductionOuverte,
            lignesVivantes: true,
            lignes: function () {
                if (!ficheProductionOuverte()) {
                    return [
                        note("Une production, c'est ce que fait un·e étudiant·e lors d'une activité d'apprentissage. Ce peut être un ensemble de tâches (écrire un texte, faire une prise de sang) ou une performance (une entrevue, un geste, une chorégraphie). Elle peut être formative ou certificative."),
                        note("De ton côté, ce sont les consignes que tu donnes, la tâche que tu demandes d'effectuer et l'objectif qu'elle cherche à atteindre."),
                        consigne("Touche « + Nouvelle production »")
                    ];
                }
                return [
                    note("Les champs à astérisque rouge suffisent pour la créer ; plus tu en remplis, plus ce que l'application te rend est précis."),
                    note("Le « Type » range ta production parmi celles de ton cours (examen, laboratoire, stage) : ta pratique s'en sert pour retenir les évaluations qui comptent."),
                    { texte: "Donne-lui un nom qui dit ce qu'elle fait faire", champs: function () { return [el('productionTitre')]; } },
                    { texte: "Choisis son type", champs: function () { return [el('productionType')]; } },
                    // Les trois menus restent visibles à côté de la bulle : ce sont ses champs (elle les évite), et le
                    // moteur amène le premier qui reste à choisir quand le geste d'avant est fait.
                    { texte: "Plus bas, rattache ce que tu viens de préparer : ta grille, ton échelle et ta cartouche (déplace la bulle si elle les cache)",
                      champs: function () { return [el('productionGrille'), el('productionEchelle'), el('productionCartouche')]; }, fait: materielRattache },
                    consigne("Touche « Créer la production »")
                ];
            },
            avant: async function () {
                cartoucheNee();
                menusAmenes = false;
                aller('conception', 'productions');
                await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
            },
            contour: function () {
                amenerLesTroisMenus();
                if (!ficheProductionOuverte()) return qs('#conception-productions [data-action="creerNouvelleProduction"]');
                return vis(el('btnCreerProduction')) ? el('btnCreerProduction') : null;
            },
            atteint: productionCreee
        },
        {
            // 8. Tes consignes : la même fiche, plus bas.
            titre: 'Tes consignes',
            confirme: confirmation(6, "C'est fait : ta production est créée."),
            lignes: function () {
                return [
                    note("Tu es plus bas dans la fiche de la production, dans la section réservée à la description des consignes. C'est ici que tu décris les tâches à travers lesquelles tes étudiant·es vont faire leur apprentissage."),
                    note("L'objectif : ce que la production cherche à développer."),
                    note("La tâche, en une phrase : c'est la consigne du travail. Puis son détail, pas à pas."),
                    note("« + Nouveau champ » ajoute un bloc libre. Tu peux y mettre une grille d'autoévaluation : pour chaque critère, ce qui est attendu pour réussir et pour maîtriser dans cette tâche."),
                    note("« Préparer le PDF » en tire une feuille à remettre : tes étudiant·es savent d'avance ce que tu attends et peuvent vérifier leur travail avant de le remettre."),
                    { texte: "Écris l'objectif et la tâche", champs: function () { return [el('productionObjectif'), el('productionTache')]; } },
                    { texte: "Donne la date d'échéance", champs: function () { return [el('productionDateEcheance')]; } },
                    consigne("Coche « Consignes transmises » (la production entre alors au calendrier du groupe)")
                ];
            },
            avant: ouvrirMesConsignes,
            contour: caseConsignes,
            atteint: consignesTransmises
        },
        {
            // 9. Évaluer : Évaluation › Liste, puis l'écran d'évaluation, en trois formes. Ce parcours évalue sans fichier ;
            // l'import et l'annotation sont au parcours 4.
            titre: 'Évaluer',
            confirme: confirmation(7, "C'est fait : les consignes sont transmises."),
            lieu: function () { return !ecranEvaluationVisible(); },
            lieuSuite: ": c'est là que tu vois où en est chaque production de ton groupe, une ligne par étudiant·e.",
            secondeForme: ecranEvaluationVisible,
            lignesVivantes: true,
            lignes: function () {
                var f = formeDeMonEvaluation();
                if (f === 'liste') {
                    return [
                        note("Ici, tu évalues une première production depuis sa ligne, sans fichier : c'est ce que tu fais pour un travail sur papier, un exposé ou une entrevue. Recevoir des fichiers et les annoter, c'est l'objet du parcours suivant."),
                        consigne("Sur la ligne d'un·e étudiant·e, touche « Actions › Évaluer »")
                    ];
                }
                if (f === 'criteres') {
                    return [
                        note("Dans le panneau « Paramètres », ta grille, ton échelle et ta cartouche sont déjà là : elles viennent de la production."),
                        note("Pour chaque critère, tu choisis un niveau ou des points : le commentaire de ta cartouche paraît aussitôt dans la rétroaction."),
                        note("Compare-le à la production. S'il ne lui ressemble pas, essaie le niveau voisin : c'est la cartouche qui t'aide à évaluer."),
                        sansTemoin("Vérifie que ce sont les bonnes, au moins à ta première évaluation"),
                        consigne("Dans le panneau « Critères », choisis le niveau ou les points de chaque critère")
                    ];
                }
                return [
                    note("La note se calcule à mesure. La rétroaction réunit tes commentaires : c'est ce que ton étudiant·e lira."),
                    note("Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e » : il s'imprime sur son PDF."),
                    note("Verrouiller dit que l'évaluation est terminée : elle compte alors dans la note et ne bouge plus par mégarde. Tu pourras la rouvrir au besoin."),
                    sansTemoin("Relis la rétroaction comme ton étudiant·e la lira"),
                    consigne("Touche le cadenas « Verrouiller », en haut de « Paramètres »")
                ];
            },
            avant: async function () {
                if (ecranEvaluationVisible()) return;
                aller('evaluations', 'liste');
                await attendre(function () { return !!ligneAEvaluer(); }, 3000);
                amenerDeCote(ligneAEvaluer());
            },
            zones: function () {
                var f = formeDeMonEvaluation();
                if (f === 'liste') { amenerDeCote(ligneAEvaluer()); return [rangeeDe(ligneAEvaluer())]; }
                return surLaCible(f === 'criteres' ? critereAAttribuer() : boutonVerrou());
            },
            contour: function () {
                var f = formeDeMonEvaluation();
                if (f === 'liste') return ligneAEvaluer();
                return f === 'criteres' ? critereAAttribuer() : boutonVerrou();
            },
            nommeLeContour: true,
            atteint: evaluationVerrouillee
        },
        {
            // 10. Le point qui s'allume : Suivi › Groupe. L'objectif atteint, la suite suggérée et « Pour revoir une
            // étape » sont posés par le moteur, qui offre « Voir le parcours 4 » à côté de « Terminer ».
            titre: "Le point qui s'allume",
            confirme: confirmation(8, "C'est fait : l'évaluation est verrouillée."),
            lieu: true,
            amener: true,
            lieuSuite: ": c'est là que tu vois ta classe d'un coup d'œil.",
            lignes: function () {
                return [
                    note("Dans la bande « Performance (P) », l'étudiant·e que tu viens d'évaluer a maintenant son point. Les autres apparaîtront à mesure que tu évalueras leur production."),
                    note("Évaluation après évaluation, l'application garde ses résultats, critère par critère : c'est ainsi qu'elle pourra nommer son défi.")
                ];
            },
            sansSortie: true,
            avant: montrerLaBande,
            zones: function () { return [bandeDePerformance()]; },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Plus tard',
                // L'objectif, à la première forme de la première bulle seulement : la seconde (l'assistant ouvert) ne le redit pas.
                objectif: function () { return wizardOuvert() ? '' : NOUS.objectif; },
                objectifAtteint: NOUS.objectifAtteint };

    // ---------- Le lancement, « Plus tard », la fin ----------

    /** Ce qui existait à « Commencer » : ce qui en naîtra ensuite fera avancer les étapes. */
    function poserLeRepere() {
        majCtx({
            grillesAvant: ids(grilles()), productionsAvant: ids(productions()), pratiquesAvant: ids(pratiques()),
            echellesAvant: ids(echelles()),
            // Le repère des cartouches couvre TOUTES les grilles (relecture neuve du 9 nov.).
            cartouchesAvant: toutesLesCartouches(),
            grilleId: null, productionId: null, evaluationId: null, evaluationDA: null,
            pratiqueId: null, cartoucheId: null, echelleId: null, voiePratique: null
        });
    }

    /** La première bulle qui reste à faire (les neuf premières se lisent dans les données ; la dixième est la fin). */
    function premiereNonFaite() {
        for (var k = 0; k < ETAPES.length - 1; k++) {
            if (!etapeFaite(k)) return k;
        }
        return ETAPES.length - 1;
    }

    async function lancer() {
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
        // « Reprendre » (le parcours en cours) relit le repère ; « Commencer » et « Refaire » le posent. Un repère
        // d'avant le 20 nov. 2026 (l'ancienne Pratique guidée : pas d'`echellesAvant`) est refait.
        var reprise = window.Assistance.etatDe(ID).etat === 'en-cours' && Array.isArray(lireCtx().echellesAvant);
        if (!reprise) poserLeRepere();
        surModale(false);
        vientDeCreer = false;
        var depuis = premiereNonFaite();
        // Ce qui est déjà fait au départ de ce passage : la confirmation ne dira que ce qui s'y fait (`confirmation`).
        faitesAuLancement = ETAPES.slice(0, -1).map(function (e, k) { return etapeFaite(k); });
        window.Assistance.definirEtat(ID, 'en-cours', depuis);
        return M().lancer(DEF, {
            depuis: depuis,
            acquis: depuis,
            surEtape: function (i) {
                if (i > 1) surModale(false);
                window.Assistance.definirEtat(ID, 'en-cours', i);
            },
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
    // Les étapes sont PROPRES au modèle : elles ne reprennent pas celles de la Pratique guidée (`ETAPES`), seulement
    // les outils communs (ce qui lit les données, l'assistant, la Liste). Retirés avec l'ancien ordre : le détour par
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
        // Le modèle par standards de l'assistant (`STD-n-meilleurs`, celui que la vue simple appelle « Par sélection de productions »).
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
                "Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation cumulative, qu'on appelle aussi sommative",
                "Ici, « sommative » ne parle pas du moment de l'évaluation (en fin d'apprentissage, par opposition à formative) mais de la façon dont la note se construit : par le « cumul » des points, ou leur « somme »",
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
                "Le code à côté du nom dit sa famille : CUM pour la cumulative, HYB pour l'hybride, STD pour les standards ; les autres codes désignent d'autres pratiques",
                "L'exemple prend « N meilleures évaluations », une pratique hybride : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10",
                "Avec ta classe, tu choisiras la tienne, qu'elle soit traditionnelle ou alternative"
            ],
            consignes: ["Touche « N meilleures évaluations », puis « Suivant → »"],
            devient: {
                lignes: [
                    "Le récapitulatif dit sa famille et ce qu'elle fait : « Hybride »",
                    "Son nom reste modifiable ; l'exemple le garde tel quel"
                ],
                consignes: ["Touche « Créer la pratique »"]
            }
        },
        etape3: {
            titre: 'Une échelle de performance',
            confirme: "C'est fait : l'assistant te demande une échelle.",
            lignes: [
                "Avec cette pratique, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau",
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
                // 20 nov. 2026 (essai de Grégoire sur l'iPad) : « s'évalue » (A4 : « juger » devient « évaluer ») ; « signifie
                // et à quoi elle sert » (C1).
                "Une grille réunit tes critères (ce que tu regardes dans une production) et ce que vaut chacun. Celle de l'exemple s'évalue par niveaux : ceux de l'échelle que tu viens de choisir",
                "Ici, tu numérises une grille que tu as déjà, faite dans un traitement de texte. Une photo n'en garderait que l'apparence : l'application doit savoir ce que chaque partie signifie et à quoi elle sert. C'est toi qui le lui dis, en posant une étiquette sur chaque partie",
                "Ce passage du document à l'application ne se fait qu'une fois. Ensuite, tu crées et modifies tes grilles directement dans l'application"
            ],
            consignes: ["Regarde la grille de l'exemple arriver : touche « Remplir »"],
            // Une fois la grille collée : une étiquette à la fois, chacune confirmée par sa phrase.
            etiqueter: {
                lignes: ["La grille de l'exemple est là, telle qu'elle était écrite dans un traitement de texte. La palette compte plusieurs étiquettes ; quatre suffisent pour celle-ci"],
                gestes: [
                    ['Prends « Titre », puis touche le nom de la grille', "C'est ça : « Grille générale à 4 critères » est son titre, le nom sous lequel tu la retrouveras. Tu le choisis librement."],
                    ['Prends « Critère », puis touche « Structure »', "C'est ça : « Structure » est un critère, un aspect de la production que tu regardes pour l'évaluer."],
                    ['Prends « Description », puis touche la phrase à côté de « Structure »', "C'est ça : la description définit le critère. Elle dit ce que tu attends, quelle que soit la production."],
                    ['Prends « Pondération », puis touche « 20\u00a0% »', "C'est ça : la pondération dit ce que pèse le critère dans le résultat de la production."]
                ]
            },
            rigueur: {
                lignes: ["La rangée de « Structure » est faite"],
                // Les mêmes confirmations, adaptées (consigne, C.3), à mesure que la personne étiquette la rangée.
                confirmations: [
                    "C'est ça : « Rigueur » est un critère, un aspect de la production que tu regardes pour l'évaluer.",
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
                    "Elle ne porte pas de niveaux : chaque critère s'évaluera avec ceux de ton échelle, de 0 à E"
                ],
                consignes: ["Touche « Créer ma grille »"]
            }
        },
        etape6: {
            titre: 'Ta cartouche',
            confirme: "C'est fait : la « Grille générale à 4 critères » est créée.",
            lieuSuite: ": c'est là que tu prépares tes rétroactions.",
            lignes: [
                // Réécrites par Grégoire le 20 nov. 2026 (essai sur l'iPad ; consigne du 20 nov., C2).
                "Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance",
                "Elle croise deux choses que tu as déjà : ta grille, qui lui donne ses rangées (un critère par rangée), et l'échelle « IDME et niv 0 », choisie avec ta pratique, qui lui donne ses colonnes (un niveau par colonne). À chaque rencontre, une case : le commentaire que lira l'étudiant·e dont la production atteint ce niveau pour ce critère",
                "Ta grille vaut pour toutes tes productions ; une cartouche est propre à une production : elle dit ce qu'on observe à chaque niveau dans cette tâche",
                "Tu l'écris une fois. Ensuite, elle t'aide à évaluer et chaque évaluation compose la rétroaction de l'étudiant·e avec tes phrases"
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
                // Réécrite par Grégoire le 20 nov. 2026 (consigne du 20 nov., C3), comme la confirmation du menu « Type ».
                "Une production, c'est ce que fait un·e étudiant·e lors d'une activité d'apprentissage. Ce peut être un ensemble de tâches (écrire un texte, faire une prise de sang) ou une performance (une entrevue, un geste, une chorégraphie). Elle peut être formative ou certificative",
                "De ton côté, ce sont les consignes que tu donnes, la tâche que tu demandes d'effectuer et l'objectif qu'elle cherche à atteindre"
            ],
            consignes: ["Touche « + Nouvelle production »"],
            fiche: {
                type: ['Ouvre le menu « Type » et parcours-le', "C'est ça : chaque type nomme une sorte de production, de l'examen au stage."],
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
            // Réécrite par Grégoire le 20 nov. 2026 (consigne du 20 nov., C4).
            phrase: "Tu es plus bas dans la fiche de la production, dans la section réservée à la description des consignes. C'est ici que tu décris les tâches à travers lesquelles tes étudiant·es vont faire leur apprentissage.",
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
                    "Compare-le à la copie. S'il ne lui ressemble pas, essaie le niveau voisin : c'est la cartouche qui t'aide à évaluer"
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
            grilleId: null, productionId: null, evaluationId: null, evaluationDA: null, pratiqueId: null, cartoucheId: null
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
        return aussiEviterLAssistantOuvert();
    }

    /**
     * « Choisis un modèle », dans le modèle (« Je regarde », étape 2) : ce que la bulle fait toucher, seulement, la carte
     * de l'exemple et « Suivant → ». Mesuré le 22 nov. 2026 à 1180 × 820, après la carte « Modèle par standards » venue
     * de la 1.252.0 : à éviter les six cartes au poids du contour, la bulle n'avait plus de place que sur « Suivant → »
     * (le moindre recouvrement), et le toucher de la personne tombait sur la bulle. Même règle que la question de
     * l'échelle, plus bas (18 nov.). Au récapitulatif (plus de cartes de modèle), rien ne change.
     */
    function aussiEviterAuChoixDuModele() {
        if (questionDeLEchelle() || !wizardOuvert()) return aussiEviterDansLAssistant();
        var choix = qs('#modalWizardPratiqueV2 input[name="modeleChoisi"][value="' + MATERIEL.pratique.id + '"]');
        var carte = choix ? choix.closest('.wizard-v2-radio-card') : null;
        if (!carte) return aussiEviterDansLAssistant();
        return [carte, el('wizard-v2-btn-suivant'), el('wizard-v2-btn-creer')];
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

    // `laPratiqueEstChoisie` et `laPratiqueDuParcoursEstAppliquee` : communes aux deux temps (plus haut).

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

    /**
     * PENDANT L'ÉTIQUETAGE DU MODÈLE SEULEMENT (Grégoire, 20 nov. 2026, essai sur l'iPad ; consigne du 20 nov., C1) : les
     * flèches que la page trace de la légende vers les parties étiquetées sont masquées (css/parcours.css), pour ne
     * garder que la flèche du geste en cours, celle de la bulle. Pas dans l'application : la marque n'est posée que
     * par le modèle, tant que la grille de l'exemple s'étiquette, et retirée dès la lecture, à l'étape suivante, à
     * « Plus tard » et à la fin.
     */
    function masquerLesFlechesDeLaPage(oui) {
        document.body.classList.toggle('parcours-etiquetage-du-modele', !!oui);
    }

    function zonesDeLaGrille(f) {
        masquerLesFlechesDeLaPage(f === 'structure' || f === 'rigueur' || f === 'suite');
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
        var bloc = blocDAutoevaluation(), zone = bloc ? bloc.querySelector('.champ-perso-contenu') : null;
        if (zone) {
            C().poser(zone, p.autoevaluation.contenu);
            // LA ZONE S'OUVRE À LA HAUTEUR DE SON CONTENU (Grégoire, 20 nov. 2026, capture 15 : le bloc n'affichait que
            // ses premières lignes, les seuils de réussite et de maîtrise sous le bord). Mesuré : la zone naît à trois
            // rangées, et « Remplir » y pose le texte sans que rien ne la fasse grandir.
            zone.style.height = 'auto';
            zone.style.height = (zone.scrollHeight + zone.offsetHeight - zone.clientHeight) + 'px';
        }
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

    /** Le point d'un·e étudiant·e dans la bande « Performance (P) » (par son DA). */
    function pointDansLaBande(da) {
        var b = blocPerformance();
        return b ? b.querySelector('.barre-indicateur .barre-etudiant[data-da="' + da + '"]') : null;
    }

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
                aussiEviter: aussiEviterAuChoixDuModele,
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
                atteint: laPratiqueDuParcoursEstAppliquee
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
                // Une flèche vers le point blanc de Yack Amical dans la bande « Performance (P) » (Grégoire, 20 nov. 2026).
                lignes: function () {
                    return [ligne(T.etape10.lignes[0], function () { return [pointDansLaBande(MATERIEL.etudiantEvalue.da)]; }), ligne(T.etape10.lignes[1])];
                },
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
            [0, pratiqueCreee], [3, laPratiqueDuParcoursEstAppliquee], [4, function () { return !!grilleDuModele(); }],
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
                if (i !== 4) masquerLesFlechesDeLaPage(false);
                window.Assistance.definirEtatModele(ID, 'en-cours', i);
            },
            surQuitter: function () { surModale(false); masquerLesFlechesDeLaPage(false); },
            // La dernière bulle n'a pas de « Plus tard » : Échap vaut « Terminer ».
            surEchap: function () { terminerModele(); },
            // Sortie de la démo en cours de route (le bandeau vert) : le modèle se ferme et attend.
            verifier: enDemo
        });
    }

    function terminerModele() {
        surModale(false);
        masquerLesFlechesDeLaPage(false);
        window.Assistance.definirEtatModele(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Évaluer une première production',
        // Validée par Grégoire le 9 nov. (13 h 37 à 13 h 42, en Cowork). ⚠ Le « Nous faisons » du 20 nov. 2026 part de la
        // pratique de notation, plus de la grille : cette ligne est à revoir avec lui (dit au rapport du lot).
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

    // Pour les bancs et la sentinelle : la condition, le repère, les étapes, la définition et les mots de « Nous
    // faisons », lus sans lancer le parcours.
    window.ParcoursEvaluer = {
        refus: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        definition: DEF,
        nous: NOUS,
        // Le modèle : son matériel, ses textes, ses étapes, le tableau de sa grille.
        materiel: MATERIEL,
        textes: TEXTES,
        etapesModele: etapesModele,
        tableauDeLaGrille: tableauDeLaGrille,
        refusModele: refusModele
    };
})();
