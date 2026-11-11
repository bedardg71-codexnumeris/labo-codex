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

    // La bulle du choix a son propre texte : le moteur rend la bulle une fois par étape. Quand le choix paraît ou
    // disparaît, la même étape est rendue de nouveau (`allerA`, sans refondre le moteur) ; `avant` ne déplace rien.
    var choixRendu = false;

    function grilleCreee() {
        var g = nouveau(grilles(), lireCtx().grillesAvant);
        // Une grille née avec ses rétroactions (Mon matériel peut créer sa cartouche) : elles ne font pas avancer l'étape 8.
        if (g && !lireCtx().grilleId) majCtx({ grilleId: g.id, cartouchesAvant: (lireCtx().cartouchesAvant || []).concat(ids(cartouchesDe(g.id))) });
        return !!g;
    }

    /** Toutes les cartouches existantes, toutes grilles confondues (le repère de « Commencer »). */
    function toutesLesCartouches() {
        return grilles().reduce(function (acc, g) { return acc.concat(ids(cartouchesDe(g && g.id))); }, []);
    }

    function zonesEtape1() {
        if (dissectionOuverte()) return [el('materiel-dissection')];
        if (editeurGrilleVisible()) return [el('conception-grille-criteres')];
        return [qs('#materiel-accueil .materiel-collage')];
    }

    function contourEtape1() {
        if (choixRendu) return el('dissection-creer-choix');
        if (dissectionOuverte()) return qs('[data-action="materielDissection.creer"]');
        if (editeurGrilleVisible()) return vis(el('btnCreerGrille')) ? el('btnCreerGrille') : null;
        return el('materiel-zone-collage');
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

    /** Étape 2 : les champs que la bulle nomme, dans l'ordre de la fiche, puis « Créer la production ». */
    function ouToucherProduction() {
        var creer = el('btnCreerProduction');
        if (!vis(creer)) return el('actionsFicheProduction');
        var champs = ['productionTitre', 'productionType', 'productionActivite', 'productionPonderation', 'productionGrille'];
        if (echelleDeLaGrilleChoisie()) champs.push('productionEchelle');
        return premierAFaire(champs, creer);
    }

    /**
     * « … et son échelle si elle en a une » (Grégoire, 9 nov., 13 h 37) : l'échelle d'une grille, c'est celle de ses
     * descripteurs (`criteres[].descripteurs.echelleId`, posée par Mon matériel quand la grille a des niveaux ; l'éditeur
     * ne pose pas `grille.echelleId`, cartouches.js:439). Seulement si le menu « Échelle » de la fiche l'offre.
     */
    function echelleDeLaGrilleChoisie() {
        var sg = el('productionGrille'), se = el('productionEchelle');
        if (!sg || !sg.value || !se) return null;
        var g = (typeof db !== 'undefined' && typeof cle === 'function' ? (db.getSync(cle('grillesTemplates'), []) || []) : [])
            .find(function (x) { return x && x.id === sg.value; });
        var cr = g && Array.isArray(g.criteres)
            ? g.criteres.find(function (c) { return c && c.descripteurs && c.descripteurs.echelleId; }) : null;
        var id = cr ? cr.descripteurs.echelleId : null;
        return id && [].some.call(se.options, function (o) { return o.value === id; }) ? id : null;
    }

    /**
     * Sur la fiche de la production, la bulle ne couvre jamais les menus « Grille de critères d'évaluation » ni
     * « Échelle de performance » (Grégoire, 9 nov., 13 h 37) : ils sont désignés avec le champ visé, et le moteur pose
     * la bulle hors de leur union. La bulle accrochée au champ (gardé, même décision).
     */
    function surLaFiche(cible) {
        var menus = ['productionGrille', 'productionEchelle'].map(function (id) {
            var s = el(id);
            return s ? (s.closest('.groupe-form') || s) : null;
        });
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

    /** Étape 8 : le nom, ta grille, ton échelle, puis « Créer la cartouche » (les commentaires sont dans la matrice). */
    function ouToucherCartouche() {
        var creer = el('btnCreerCartouche');
        if (!vis(creer)) return el('actionsFicheCartouche');
        return premierAFaire(['nomCartouche', 'selectGrilleCartouche', 'selectEchelleCartouche'], creer);
    }

    // ---------- Les neuf étapes ----------

    // Les deux phrases sur la longueur de la dissection : validées par Grégoire mot pour mot (11 nov. 2026, 8 h 38).
    var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà : colle-la ici, puis montre à l'application ce que veut dire chaque morceau (un critère, un niveau, des points). C'est ainsi qu'elle pourra lire tes évaluations, puis nommer le critère où un·e étudiant·e bute. C'est souvent long, parce que chaque grille est construite à sa façon et que l'application ne peut pas deviner le rôle de chaque morceau. Mais tu ne le fais qu'une fois : ta grille servira ensuite à chaque copie que tu évalueras avec elle. Pas de grille sous la main ? Touche « Partir de zéro ».";
    var TEXTE_1_CHOIX = "Ta grille porte des points et des niveaux. Le résultat d'une évaluation viendra de l'un ou de l'autre : des points qui s'additionnent en une note, ou un niveau par critère (comme « maîtrisé »), que ton échelle traduit ensuite en note. Choisis ce qui correspond à ta façon d'évaluer.";

    var ETAPES = [
        {
            titre: 'Ta grille',
            get texte() { return choixRendu ? TEXTE_1_CHOIX : TEXTE_1; },
            avant: async function () {
                choixRendu = choixVisible();
                // La personne est peut-être déjà dans la dissection, ou dans l'éditeur (« Partir de zéro ») : rien ne bouge.
                if (sousSectionVisible('conception-materiel') || editeurGrilleVisible()) return;
                aller('conception', 'materiel');
                await attendre(function () { return sousSectionVisible('conception-materiel'); }, 2000);
            },
            zones: zonesEtape1,
            contour: contourEtape1,
            atteint: function () {
                if (grilleCreee()) return true;
                if (choixVisible() !== choixRendu) M().allerA(0);   // la bulle du choix, ou le retour au texte de l'étape
                return false;
            }
        },
        {
            titre: 'Ta production',
            texte: "Une production, c'est ce que tes étudiant·es font dans une activité d'apprentissage : un texte, mais aussi un stage, un film, un enregistrement, une entrevue, un labo. Ce n'est pas toujours un objet qu'on remet : c'est ce que l'étudiant·e fait quand il ou elle apprend, et c'est cet apprentissage que tu évalues à travers elle. Décris celle que tu demandes : son titre, son type, sa pondération, et surtout l'activité d'apprentissage : c'est ce que tes étudiant·es retrouveront en tête de leur synthèse de rétroaction. Puis associe-lui la grille que tu viens de créer, et son échelle si elle en a une. La production relie ce que tu demandes à la façon dont tu l'évalues : ce que chaque étudiant·e fait s'y rattache, et sa pondération dit ce qu'elle pèsera dans la note du cours.",
            avant: async function () {
                aller('conception', 'productions');
                await attendre(function () { return sousSectionVisible('conception-productions'); }, 2000);
            },
            zones: function () {
                if (ficheProductionOuverte()) return surLaFiche(ouToucherProduction());
                // 11 nov. 2026 : la rangée ne porte que « + Nouvelle production », que la pulsation désigne : pas de flèche.
                return [];
            },
            contour: function () {
                if (ficheProductionOuverte()) return ouToucherProduction();
                return qs('#conception-productions [data-action="creerNouvelleProduction"]');
            },
            atteint: productionCreee
        },
        {
            titre: 'Tes consignes',
            texte: "Écris ce que tes étudiant·es doivent savoir pour réussir : l'objectif d'apprentissage, la tâche, les consignes précises. Touche « Préparer le PDF » : la feuille de consignes et ta grille en sortent prêtes à remettre. Remettre la grille avec la tâche, c'est leur dire d'avance sur quoi leur production sera évaluée. Quand la feuille est remise, pose la date de remise et coche « Consignes transmises » : la production entre alors au calendrier. Dès ta première évaluation, ce que tes étudiant·es ont remis compte dans leur complétion, et tes évaluations, dans leur performance.",
            avant: ouvrirLaProduction,
            // La date et la case, ensemble : la bulle se pose au-dessus ou au-dessous du bloc, sans couvrir la date.
            zones: function () { return [el('sectionPlanification') || caseConsignes()]; },
            contour: caseConsignes,
            atteint: consignesTransmises
        },
        {
            titre: 'Une première production',
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
            atteint: evaluationVerrouillee
        },
        {
            titre: 'Ta pratique',
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
                return wizardOuvert() ? ['wizard-v2-btn-precedent', 'wizard-v2-btn-suivant', 'wizard-v2-btn-creer'].map(el) : [];
            },
            contour: function () {
                if (!wizardOuvert()) return qs('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
                var r = qs('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]');
                return r && vis(r.closest('.wizard-v2-radio-card') || r) ? (r.closest('.wizard-v2-radio-card') || r) : null;
            },
            atteint: function () {
                var ok = pratiqueCreee();
                if (ok) surModale(false);
                return ok;
            }
        },
        {
            titre: "L'appliquer à ton cours",
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
            atteint: pratiqueEstAppliquee
        },
        {
            titre: "Le point qui s'allume",
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
            texte: "La rétroaction de ton évaluation vient de ta grille. Pour qu'elle parle avec tes mots, écris ta cartouche : choisis ta grille, puis ton échelle de performance : celle que Mon matériel a créée avec ta grille si elle a des niveaux ; si elle est en points, les paliers de l'échelle de départ, dont tu peux ajuster les bornes. Puis, pour chaque critère et chaque niveau de l'échelle, note le commentaire que tu écrirais dans la marge. Tu l'écris une fois ; ensuite, chaque évaluation compose la rétroaction à partir de tes phrases. Tes étudiant·es reçoivent un commentaire cohérent d'une évaluation à l'autre, et tu n'as plus à le réécrire chaque fois. Puis, dans la fiche de ta production, choisis cette cartouche : elle s'y appliquera à chaque évaluation.",
            avant: async function () {
                aller('conception', 'retroactions');
                await attendre(function () { return sousSectionVisible('conception-retroactions'); }, 2000);
            },
            zones: function () {
                if (cartoucheCreee()) return zonesPourNommer();
                if (ficheCartoucheOuverte()) return surLaCible(ouToucherCartouche());
                return [];   // « + Nouvelle cartouche » a la pulsation (11 nov. 2026)
            },
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
            pratiqueId: null, cartoucheId: null
        });
    }

    async function lancer(depuis) {
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

    window.Assistance.enregistrer({
        id: ID,
        titre: 'Évaluer une première production',
        // Validée par Grégoire le 9 nov. (13 h 37 à 13 h 42, en Cowork).
        ligne: 'De ta grille à ta première rétroaction, réécrite avec tes mots.',
        total: ETAPES.length,
        refus: condition,
        prealable: 'classe',
        lancer: lancer
    });

    // Pour les bancs : la condition, le repère, les étapes et la bulle du choix, lus sans lancer le parcours.
    window.ParcoursEvaluer = {
        refus: condition,
        contexte: lireCtx,
        etapes: function () { return ETAPES; },
        texteDuChoix: TEXTE_1_CHOIX
    };
})();
