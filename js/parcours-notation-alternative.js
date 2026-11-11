/* =================================================================
   LE NEUVIÈME PARCOURS, « METTRE EN PLACE TA NOTATION ALTERNATIVE » (8 nov. 2026, nuit)
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md.

   La personne crée une pratique par standards, par spécifications ou par dénotation, l'ouvre, règle
   sa structure selon sa famille, choisit ce que lit l'étudiant·e, l'applique à son cours, évalue une
   production, puis lit la synthèse telle que l'étudiant·e la recevra.

   Une seule suite de bulles ; seule l'étape 3 change selon la famille, lue dans la pratique ouverte à
   l'étape 2 (aucune bulle ne la demande). L'étape 1 est sautée si la pratique du groupe-cours actif est
   déjà alternative. « n sur N » compte les étapes du chemin : `cheminDe`.

   ⚠ Les onze textes sont ceux que Grégoire a validés un à un le 8 nov. (21 h 10 à 21 h 43), posés mot
   pour mot : tests/unit/sentinelle-parcours-notation-alternative-2026-11-09.test.js les confronte à la
   consigne. Trois phrases propres à une famille (ou à l'écran) se retirent du texte quand elles ne
   valent pas : `texteDe`.

   Le parcours se joue sur les vraies données. Il n'écrit rien de lui-même : seuls les gestes de la
   personne écrivent. Il retient son chemin dans la préférence `parcoursNotationAlternative` (la
   famille, la pratique ouverte, l'évaluation verrouillée), pour « Reprendre ».

   Ce qu'il a fallu au moteur, sans le refondre (dit dans le rapport) : les étapes se reconstruisent
   quand la famille est connue (le moteur relit `def.etapes`) ; « Continuer » reste visible, inactif tant
   que manque ce qu'il attend, la raison dite dessous (`attend` du moteur, 11 nov. 2026, capture 34 ; il
   se cachait jusque-là) ; la bulle passe au-dessus de l'assistant
   (classe `parcours-sur-modale`) ; « Dossier PDF » annonce son
   fichier (`dossierPdfLivre`, travaux-export-pdf.js).
   ================================================================= */
(function () {
    'use strict';

    var ID = 'notation-alternative';
    var RANG = 9;
    var CLE_CTX = 'parcoursNotationAlternative';
    var ALTERNATIVES = ['standards', 'specifications', 'denotation'];
    var M = function () { return window.ParcoursMoteur; };

    var TITRE = "Mettre en place ta notation alternative";
    var LIGNE = "De ta pratique par standards, spécifications ou dénotation à la synthèse que lit ton étudiant·e, en niveaux si tu le veux.";
    var MOT_REFUS = "Commence par « Évaluer une première production » : il te faut une production et sa grille pour mettre en place ta notation alternative.";

    // Les bulles, telles que validées (titre, texte, geste), par étape du chemin.
    var TEXTES = {
        "pratique": {
            "titre": "Ta pratique",
            "texte": "Ta pratique de notation dit comment la note du cours se construit à partir de tes évaluations. Le Règlement sur le régime des études collégiales exige une note chiffrée à la fin du trimestre : c'est pour elle que des pondérations subsistent, et l'application t'aide à la produire. En notation alternative, on ne calcule pas une note pour savoir si l'étudiant·e est compétent·e : on juge d'abord sa compétence, puis on attribue la note. Par standards, la note retient certaines productions selon une règle que tu choisis : les meilleures, les plus récentes ou toutes. Par spécifications, chaque production est acceptable ou non, et la note est celle du plus haut forfait atteint. Par dénotation, c'est toi qui poses la note à la fin du trimestre, selon l'atteinte de tes cibles. Touche « + Nouvelle pratique », puis « Partir d'un modèle » : « N meilleures évaluations » ou « N plus récentes » pour les standards, « Modèle simple » pour les spécifications, « Modèle de base » pour la dénotation. Tu l'ajusteras ensuite. Tu ne sais pas laquelle te correspond ? « Décrire ma pratique » te pose quelques questions sur ta façon d'évaluer.",
            "geste": "Touche « + Nouvelle pratique », choisis ton modèle, puis « Créer la pratique »."
        },
        "ouvrir": {
            "titre": "L'ouvrir",
            "texte": "Pour régler ta pratique, ouvre-la : choisis-la dans le menu en haut de la page, à côté de « + Nouvelle pratique ». Sa fiche rassemble tout ce qui construit la note : la structure de tes évaluations, ton échelle, ce que lit l'étudiant·e et le cours auquel la pratique s'applique. Une pratique créée d'un modèle en porte le nom. Donne-lui le tien, dans « Informations de base » : tu la reconnaîtras parmi celles que tu prépareras ou que des collègues partageront avec toi.",
            "geste": "Choisis ta pratique dans le menu ; renomme-la si tu veux."
        },
        "std": {
            "titre": "Ta sélection",
            "texte": "En standards, la note repose sur les productions que tu tiens pour représentatives de la compétence de l'étudiant·e, chacune à un moment de son parcours. Dans « Mode de sélection », choisis la règle qui les retient pour chaque étudiant·e : les meilleures valorisent le progrès, les dernières, l'état actuel de la maîtrise. Tu peux aussi les retenir toutes, ou ajouter aux meilleures des productions obligatoires (« Hybride »). À côté, écris combien en retenir. Dessous, le minimum de productions évaluées pour que la performance d'un·e étudiant·e soit jugée fiable : sous ce nombre, son profil ne la donne pas encore. Dans « Productions qui comptent dans la note », décoche celles qui ne doivent pas compter, comme un exercice formatif. Une évaluation terminale, s'il y en a une, atteste l'acquisition de la compétence en fin de parcours ; elle compte selon sa pondération. Le jugement est dans tes évaluations et dans ce choix ; l'application construit ensuite la note. Chaque réglage s'enregistre dès que tu le changes.",
            "geste": "Règle ta sélection, puis touche « Continuer »."
        },
        "spe-types": {
            "titre": "Tes types de productions",
            "texte": "En spécifications, chaque production est acceptable ou non. Tu la juges selon ce que tu exiges d'un travail réussi ; l'application la retient comme acceptable quand ton évaluation atteint ton seuil. Écris ce seuil dans « Seuil d'acceptabilité (%) ». Dans « Types de productions », nomme ensuite les sortes de productions qui comptent pour la note. Donne à chacune le nom du « Type » de tes productions dans Conception › Productions (« Projet », « Laboratoire », « Examen »…) : c'est ce nom qui relie tes productions à ta pratique, et un type qui ne correspond à aucun « Type » ne compte aucune production. Touche « + Ajouter un type » pour chacun, ou renomme ceux qui y sont.",
            "geste": "Écris ton seuil et tes types, puis touche « Continuer »."
        },
        "spe-forfaits": {
            "titre": "Tes forfaits",
            "texte": "Un forfait dit quelle note attribuer selon le nombre de productions acceptables de chaque type. Chaque ligne de la table porte un nom (« Lettre ») et une note (« Note (%) ») ; sous chacun de tes types, elle donne le nombre de productions acceptables qu'elle exige. La note du cours est celle du plus haut forfait dont l'étudiant·e remplit toutes les exigences : l'ensemble de ses productions acceptables dit où en est sa compétence, puis la note suit. Ajoute en dernier un forfait qui n'exige rien : c'est la note de qui n'en atteint aucun autre. Sans lui, l'application ne sait pas quelle note attribuer à cet·te étudiant·e, alors que le règlement en demande une.",
            "geste": "Règle tes forfaits, puis touche « Continuer »."
        },
        "den": {
            "titre": "Tes cibles",
            "texte": "En dénotation, l'application ne construit pas la note du cours : c'est toi qui la poses à la fin du trimestre, quand tu juges si l'étudiant·e a atteint chacune de tes cibles d'apprentissage. Écris ces cibles ici, une par ligne : ce que tes étudiant·es doivent maîtriser à la fin du cours. Ajoute-les avec « + Ajouter une cible » ; remplace celles d'un modèle par les tiennes. À la fin, dans le profil de chaque étudiant·e, tu confirmeras les cibles atteintes ; tant qu'une seule ne l'est pas, la note reste sous la note de passage, à 59 au plus. D'ici là, tes évaluations nourrissent ta rétroaction et ton jugement ; la bulle suivante règle ce que tes étudiant·es y lisent.",
            "geste": "Écris tes cibles, puis touche « Continuer »."
        },
        "affichage": {
            "titre": "Ce que lit l'étudiant·e",
            "texte": "Dans sa synthèse, ton étudiant·e lit le niveau atteint à chaque critère et pour sa production. Ces niveaux viennent de l'échelle de performance associée à la production : chacun couvre une plage de notes. Choisis ici ce qu'il ou elle y lit, dans « Affichage de la note dans la rétroaction » : « Note chiffrée » ajoute les chiffres à ta rétroaction écrite et, en standards, à la note provisoire ; « Niveau de performance » n'y laisse que les niveaux, les chiffres restant dans l'application. En cours de trimestre, que la note soit chiffrée ou non importe peu : ce qui compte, c'est la compétence que tu observes. Ton choix vaut pour chaque nouvelle évaluation ; tu pourras le changer pour une évaluation, dans sa palette « Rétroaction ». Une production évaluée en points garde ses chiffres.",
            "geste": "Choisis l'affichage, puis touche « Continuer »."
        },
        "appliquer": {
            "titre": "L'appliquer à ton cours",
            "texte": "Ta pratique est prête : applique-la au groupe-cours actif, celui qui est nommé au centre de la bande, sous la navigation. Touche « Appliquer au cours actif » : dans la frise du haut, « Groupe-cours » passe à « active », et le menu marque ta pratique « (active) ». Si une autre pratique s'appliquait à ce groupe, les notes que tu as déjà attribuées ne bougent pas : seule la note du cours se construit désormais selon celle-ci. Tes évaluations déjà enregistrées gardent leur affichage. Pour en changer une, ouvre-la (« Actions › Consulter »), touche « Déverrouiller », choisis l'affichage dans sa palette « Rétroaction », puis « Verrouiller ». Pour un autre groupe-cours, choisis-le dans la bande, puis applique ta pratique de nouveau.",
            "geste": "Touche « Appliquer au cours actif »."
        },
        "evaluer": {
            "titre": "Évaluer une production",
            "texte": "C'est dans tes évaluations que ton jugement s'exerce. Évalue une production que tu n'as pas encore évaluée : touche « Actions › Évaluer » sur la ligne d'un·e étudiant·e. En spécifications, choisis une production dont le « Type » est l'un de ceux de ta pratique : les autres ne comptent pour aucun forfait. Choisis le niveau ou les points de chaque critère, comme d'habitude. Regarde ensuite la rétroaction : sous « Générale · Spécifique · Bilan », la ligne « Options : … » rappelle ton choix (« … · niveau de performance »). Touche-la pour changer ce choix pour cette évaluation seulement. Quand tu es satisfait·e, touche le cadenas « Verrouiller », en haut de « Paramètres ».",
            "geste": "Évalue la production, puis verrouille."
        },
        "synthese": {
            "titre": "Ta synthèse",
            "texte": "Voici ce que ton étudiant·e recevra. Sur la ligne de la production que tu viens d'évaluer, touche « Actions › Dossier PDF » : le PDF se télécharge. Il contient sa production annotée suivie de sa synthèse de rétroaction, ou la synthèse seule si rien n'a été importé. Ouvre-le et lis-le comme il ou elle le lira. Avec « Niveau de performance », la synthèse dit le niveau de la production et de chaque critère, sans note chiffrée. En standards, elle montre aussi une « Note provisoire » : les productions que ta pratique retient pour l'instant et celles qui sont à venir. Elle peut rassurer des étudiant·es habitué·es aux notes chiffrées ; avec « Niveau de performance », elle ne porte aucune note chiffrée. En spécifications et en dénotation, la note du cours n'y paraît pas. Tes étudiant·es y lisent où en est leur compétence ; la note chiffrée qu'exige le règlement viendra à la fin du trimestre.",
            "geste": "Touche « Actions › Dossier PDF » sur la ligne de ta production, puis « Continuer »."
        },
        "plus-loin": {
            "titre": "Pour aller plus loin",
            "texte": "Te voilà avec une pratique alternative appliquée à ton cours, et une première synthèse telle que tes étudiant·es la liront. Le reste viendra à ton rythme. En dénotation, pose ta note à la fin du trimestre dans le profil de chaque étudiant·e, section « Jugement » : confirme les cibles atteintes, puis écris la note et sa justification, et touche « Enregistrer le jugement ». Quand tes notes sont arrêtées, coche « Notes finalisées » dans la fiche de ta pratique : l'export les marque « final » ; en standards, la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir. Dans Suivi › Groupe, « Exporter la synthèse (CSV) », dans la carte « Résultats finaux », produit une ligne par étudiant·e : c'est la note chiffrée qu'exige le règlement, à reporter dans le système de ton établissement. Au bas de la fiche, « Système de jetons » offre des reprises et des délais. Labo › Exploration compare, sur des profils fictifs, la façon dont deux ou trois pratiques construisent la note.",
            "geste": "Touche « Terminer »."
        }
    };

    // Les phrases qui ne paraissent que pour une famille, ou quand la liste est à l'écran.
    var PHRASES = {
        listeQuiComptent: "Dans « Productions qui comptent dans la note », décoche celles qui ne doivent pas compter, comme un exercice formatif.",
        specificationsEvaluer: "En spécifications, choisis une production dont le « Type » est l'un de ceux de ta pratique : les autres ne comptent pour aucun forfait.",
        denotationJugement: "En dénotation, pose ta note à la fin du trimestre dans le profil de chaque étudiant·e, section « Jugement » : confirme les cibles atteintes, puis écris la note et sa justification, et touche « Enregistrer le jugement »."
    };

    // ---------- Ce que le parcours retient ----------

    function lireCtx() {
        var v = typeof obtenirPreference === 'function' ? obtenirPreference(CLE_CTX) : null;
        return v && typeof v === 'object' ? v : {};
    }

    function poserCtx(ctx) {
        if (typeof definirPreference === 'function') definirPreference(CLE_CTX, ctx);
        return ctx;
    }

    function majCtx(maj) {
        return poserCtx(Object.assign({}, lireCtx(), maj));
    }

    // ---------- Les données, lues ----------

    function pratiques() {
        if (typeof db === 'undefined' || typeof cle !== 'function') return [];
        return db.getSync(cle('pratiquesConfigurables'), []) || [];
    }

    function pratiqueParId(id) {
        return pratiques().find(function (p) { return p && p.id === id; }) || null;
    }

    /**
     * La famille d'une pratique, canonique : le `type` de la racine (celui que la fiche écrit et que le moteur lit
     * d'abord, `PratiqueConfigurable._typeFamille`), sinon `configuration.type` (les pratiques de la démo), sinon le
     * badge `pratiques[0]`. Pure.
     */
    function familleDe(p) {
        if (!p) return null;
        var PAR_CODE = { SOM: 'sommative', STD: 'standards', SPE: 'specifications', DEN: 'denotation' };
        var brut = p.type || (p.configuration && p.configuration.type) || (Array.isArray(p.pratiques) && p.pratiques[0]) || '';
        if (PAR_CODE[brut]) return PAR_CODE[brut];
        var canon = typeof normaliserIdPratique === 'function' ? normaliserIdPratique(brut) : brut;
        return canon || null;
    }

    function estAlternative(famille) {
        return ALTERNATIVES.indexOf(famille) !== -1;
    }

    /** La famille de la pratique appliquée au groupe-cours actif, si elle est alternative ; sinon null. */
    function familleActive() {
        var id = typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : null;
        var f = id ? familleDe(pratiqueParId(id)) : null;
        return estAlternative(f) ? f : null;
    }

    /**
     * Le motif qui empêche de lancer le parcours, ou null. Il faut un groupe-cours actif réel (ni la démo, ni un
     * service d'orthopédagogie) qui a au moins une production avec sa grille, lue dans les données.
     */
    function motifRefus() {
        var enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
        var service = typeof contexteActifEstService === 'function' && contexteActifEstService();
        var contexte = typeof obtenirIdContexteActif === 'function' ? obtenirIdContexteActif() : null;
        if (enDemo || service || !contexte) return MOT_REFUS;
        var grilles = (typeof db !== 'undefined' && typeof cle === 'function') ? (db.getSync(cle('grillesTemplates'), []) || []) : [];
        var prods = typeof obtenirDonneesSelonMode === 'function' ? (obtenirDonneesSelonMode('productions') || []) : [];
        var avecGrille = prods.some(function (p) {
            return p && p.grilleId && grilles.some(function (g) { return g && g.id === p.grilleId; });
        });
        return avecGrille ? null : MOT_REFUS;
    }

    // ---------- Le chemin ----------

    /**
     * Les étapes du chemin, dans l'ordre. La famille est celle de la pratique ouverte à l'étape 2 ; avant,
     * celle qu'on prévoit (la pratique créée à l'étape 1, ou celle du groupe-cours quand l'étape 1 est sautée),
     * sinon les standards. Pure.
     */
    function cheminDe(ctx) {
        var c = ctx || {};
        var f = c.famille || c.famillePrevue || 'standards';
        var ids = c.sauteEtape1 ? [] : ['pratique'];
        ids.push('ouvrir');
        if (f === 'specifications') ids.push('spe-types', 'spe-forfaits');
        else if (f === 'denotation') ids.push('den');
        else ids.push('std');
        return ids.concat(['affichage', 'appliquer', 'evaluer', 'synthese', 'plus-loin']);
    }

    function sans(texte, phrase) {
        return texte.replace(' ' + phrase, '');
    }

    /**
     * Le texte d'une étape, sans les phrases qui ne valent pas ici. Pure.
     * @param {string} id - l'étape du chemin
     * @param {{famille?: string, listeQuiComptent?: boolean}} etat - la famille retenue ; la liste
     *   « Productions qui comptent dans la note » est-elle à l'écran ?
     */
    function texteDe(id, etat) {
        var e = etat || {};
        var t = TEXTES[id].texte;
        if (id === 'std' && !e.listeQuiComptent) t = sans(t, PHRASES.listeQuiComptent);
        if (id === 'evaluer' && e.famille !== 'specifications') t = sans(t, PHRASES.specificationsEvaluer);
        if (id === 'plus-loin' && e.famille !== 'denotation') t = sans(t, PHRASES.denotationJugement);
        return t;
    }

    // ---------- L'écran ----------

    function el(id) { return document.getElementById(id); }

    function vis(x) { return !!x && M().visible(x); }

    function groupeDe(id) {
        var e = el(id);
        return e ? (e.closest('.groupe-form') || e) : null;
    }

    function parentDe(id) {
        var e = el(id);
        return e ? e.parentElement : null;
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

    function aller(section, sous) {
        if (vis(el(section + '-' + sous))) return;
        if (typeof naviguerVers === 'function') naviguerVers(section, sous);
    }

    function ficheOuverte() {
        var c = el('conteneurEditionPratique');
        return !!(c && !c.classList.contains('u-hide'));
    }

    /** L'id de la pratique dont la fiche est ouverte (le menu « Pratique ouverte »), sinon null. */
    function idOuverte() {
        return (ficheOuverte() && typeof obtenirPratiqueEnEditionMateriel === 'function') ? obtenirPratiqueEnEditionMateriel() : null;
    }

    /** Referme la fiche ouverte : l'étape 2 a pour geste de l'ouvrir. Rien ne s'écrit. */
    function fermerFiche() {
        if (!ficheOuverte()) return;
        var c = el('conteneurEditionPratique');
        var a = el('accueilPratiques');
        if (c) c.classList.add('u-hide');
        if (a) a.classList.remove('u-hide');
        if (typeof reinitialiserEditeurPratiquesApresBascule === 'function') reinitialiserEditeurPratiquesApresBascule();
        if (typeof afficherListePratiquesMateriel === 'function') afficherListePratiquesMateriel();
    }

    /** Conception › Pratiques, la fiche de la pratique retenue ouverte (la reprise, après un rechargement). */
    async function ouvrirLaPratique() {
        aller('conception', 'pratiques-notation');
        var id = lireCtx().pratiqueId;
        if (!id) return;
        if (idOuverte() !== id && typeof chargerPratiquePourModif === 'function') await chargerPratiquePourModif(id);
        await attendre(function () { return idOuverte() === id; }, 2000);
    }

    function wizardOuvert() {
        var m = el('modalWizardPratiqueV2');
        return !!(m && m.classList.contains('actif'));
    }

    /**
     * La bulle et le contour au-dessus de l'assistant, tant qu'il est ouvert (css/parcours.css). Pas sur un téléphone :
     * l'assistant y prend tout l'écran, et la bulle par-dessus couvrait ses boutons (mesuré à 390 px). Elle attend alors
     * derrière lui, et revient à sa fermeture.
     */
    var LARGEUR_MIN_SUR_MODALE = 700;

    function surModale(oui) {
        document.body.classList.toggle('parcours-sur-modale', !!oui && window.innerWidth >= LARGEUR_MIN_SUR_MODALE);
    }

    // ---------- La forme et la place de la bulle, à deux étapes (corrections du 9 nov. 2026) ----------

    /**
     * Une forme de bulle propre à une étape : `reduite` (étape 1, l'assistant ouvert), `large` (étape 3, standards),
     * ou aucune. Chaque étape repart de la forme ordinaire (`construireEtape`, à l'entrée de l'étape).
     */
    function formeDeBulle(nom) {
        var b = el('parcours-bulle');
        if (!b) return;
        b.classList.toggle('parcours-bulle--reduite', nom === 'reduite');
        b.classList.toggle('parcours-bulle--large', nom === 'large');
        b.style.maxHeight = '';   // une hauteur bornée par `bulleHorsDe` ne survit pas à sa place
    }

    /**
     * Étape 1 en deux temps (question 12, validée par Grégoire le 9 nov. 2026). Avant que l'assistant s'ouvre, la
     * bulle entière, près de « + Nouvelle pratique ». L'assistant ouvert, à partir de 700 px, elle se réduit à sa ligne
     * orange, posée au bord : ni ses deux cartes, ni « Suivant » ne sont couverts. Aucun mot ne change ; le titre et le
     * texte restent dans la bulle, cachés (css/parcours.css) ; le lecteur d'écran les a reçus par l'annonce de l'étape. Sous 700 px,
     * la place d'avant : le lot « La bulle sur téléphone » s'en charge.
     */
    function bulleDeLEtape1() {
        formeDeBulle(wizardOuvert() && window.innerWidth >= LARGEUR_MIN_SUR_MODALE ? 'reduite' : null);
    }

    /**
     * Place la bulle, après le moteur (la sonde de l'étape passe après lui : sa place l'emporte), à celle qui coûte le
     * moins. Le coût d'une place : l'aire qu'elle couvre de chaque garde, multipliée par son poids. Les places essayées :
     * celles que l'étape propose d'abord (`places`, chacune avec sa hauteur bornée au besoin : la bulle défile alors),
     * puis neuf places (trois colonnes, trois rangées, sous l'en-tête). La place du moteur reste si elle ne couvre rien.
     * Propre à cette étape : ses places proposées (hauteur bornée) passent avant. Le huitième parcours avait la même règle
     * (`bulleHors`), retirée le 11 nov. 2026 quand le moteur a pris le moindre recouvrement, le contour pesé ; celle-ci
     * reste, à unifier avec le moteur (le relevé de la bulle la juge, vert le 11 nov.).
     * @param {Array<{el: Element, poids: number}>} gardes
     * @param {Array<{x: number, y: number, hauteur?: number}>} [places]
     */
    function bulleHorsDe(gardes, places) {
        var b = el('parcours-bulle');
        if (!b) return;
        b.style.maxHeight = '';
        var rects = gardes.filter(function (g) { return vis(g.el); })
            .map(function (g) { return { r: g.el.getBoundingClientRect(), poids: g.poids }; });
        var bw = b.offsetWidth, bh = b.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
        var e = document.querySelector('header.entete');
        var haut = e ? Math.max(0, e.getBoundingClientRect().bottom) : 0;
        function cout(x, y, h) {
            return rects.reduce(function (t, o) {
                var w = Math.min(x + bw, o.r.right) - Math.max(x, o.r.left);
                var hh = Math.min(y + h, o.r.bottom) - Math.max(y, o.r.top);
                return t + (w > 0 && hh > 0 ? w * hh * o.poids : 0);
            }, 0);
        }
        var meilleur = { x: parseFloat(b.style.left) || 0, y: parseFloat(b.style.top) || 0, hauteur: null };
        meilleur.cout = cout(meilleur.x, meilleur.y, bh);
        if (meilleur.cout === 0) return;
        var marge = 8;
        var candidats = (places || []).slice();
        [marge, (vw - bw) / 2, vw - bw - marge].forEach(function (x) {
            [Math.max(marge, haut + marge), Math.max(marge, (vh - bh) / 2), Math.max(marge, vh - bh - marge)].forEach(function (y) {
                candidats.push({ x: x, y: y });
            });
        });
        candidats.forEach(function (p) {
            var h = p.hauteur ? Math.min(p.hauteur, bh) : bh;
            var c = cout(p.x, p.y, h);
            if (c < meilleur.cout) meilleur = { x: p.x, y: p.y, hauteur: h < bh ? h : null, cout: c };
        });
        b.style.left = Math.round(Math.max(marge, meilleur.x)) + 'px';
        b.style.top = Math.round(meilleur.y) + 'px';
        if (meilleur.hauteur) b.style.maxHeight = Math.floor(meilleur.hauteur) + 'px';
    }

    /**
     * Étape 3, standards (décision de Cowork du 9 nov. 2026) : la bulle couvrait le champ du nombre à retenir, à
     * droite de « Mode de sélection », dont elle parle. La carte « Structure des évaluations » occupe l'écran : le
     * moteur posait la bulle en son milieu. Le champ du nombre est le garde prioritaire, « Mode de sélection » et le
     * minimum viennent ensuite. La place préférée est juste sous le champ, à droite, la hauteur bornée à ce qui reste
     * jusqu'au bas de l'écran (la bulle défile au-delà) : elle tient aussi dans la fenêtre de Safari sur l'iPad à
     * l'horizontale (1180 × 770 environ, relecture du 9 nov.). À partir de 1180 px, la bulle est plus large, donc
     * moins haute.
     */
    var HAUTEUR_MIN_SOUS_LE_NOMBRE = 220;

    function bulleHorsDesReglagesStd() {
        var vw = document.documentElement.clientWidth;
        formeDeBulle(vw >= 1180 ? 'large' : null);
        var b = el('parcours-bulle');
        var nombre = el('mat-portfolio-nombre');
        var places = [];
        if (b && vis(nombre)) {
            var r = nombre.getBoundingClientRect();
            var y = r.bottom + 12;
            var hauteur = window.innerHeight - y - 8;
            if (hauteur >= HAUTEUR_MIN_SOUS_LE_NOMBRE) places.push({ x: vw - b.offsetWidth - 8, y: y, hauteur: hauteur });
        }
        bulleHorsDe([
            { el: nombre, poids: 10000 },
            { el: el('mat-portfolio-selection'), poids: 100 },
            { el: el('mat-portfolio-minimum'), poids: 100 }
        ], places);
    }

    function suivante(m) {
        m.allerA(m.etapeCourante() + 1);
    }

    // ---------- Étape 1 : la pratique créée ----------

    function carteModele() {
        var r = document.querySelector('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]');
        return r ? (r.closest('.wizard-v2-radio-card') || r) : null;
    }

    function zonesWizard() {
        var z = [document.querySelector('#modalWizardPratiqueV2 .modal-contenu')];
        // La question de l'échelle (un modèle Standards, demanderEchelleAdoption) s'ouvre par-dessus.
        var q = el('ui-dialogue-question');
        if (q) z.push(q.closest('.modal-contenu') || q.parentElement);
        return z.filter(Boolean);
    }

    /** Une pratique alternative qui n'existait pas au départ du parcours. Une sommative ne compte pas. */
    function pratiqueCreee() {
        var avant = lireCtx().pratiquesAvant || [];
        return pratiques().find(function (p) {
            return p && p.id && avant.indexOf(p.id) === -1 && p.dansBibliotheque !== false && estAlternative(familleDe(p));
        }) || null;
    }

    // ---------- Étape 3 ----------

    function listeQuiComptentVisible() {
        return vis(el('mat-productions-comptees'));
    }

    function configDeLaPratique() {
        var p = pratiqueParId(lireCtx().pratiqueId);
        return (p && (p.configuration || p.config)) || {};
    }

    var seuilTouche = false;

    function ecouterSeuil() {
        var s = el('mat-spec-seuil');
        if (!s || s.dataset.parcoursEcoute) return;
        s.dataset.parcoursEcoute = '1';
        ['change', 'blur'].forEach(function (t) { s.addEventListener(t, function () { seuilTouche = true; }); });
    }

    function ciblesNommees() {
        var c = el('mat-den-cibles');
        if (!c || !window.EditeurCibles || typeof window.EditeurCibles.lire !== 'function') return false;
        return (window.EditeurCibles.lire(c) || []).some(function (x) { return x && String(x.nom || '').trim(); });
    }

    // ---------- Étapes 6 et 7 : la liste, l'évaluation ----------

    function evaluations() {
        return typeof obtenirDonneesSelonMode === 'function' ? (obtenirDonneesSelonMode('evaluationsSauvegardees') || []) : [];
    }

    /**
     * Les évaluations verrouillées du cours actif (le filtre d'`obtenirDonneesSelonMode`). Pas de second filtre par
     * groupe-cours : `obtenirIdContexteActif` rend tantôt l'id du groupe-cours, tantôt celui du cours, selon le chemin
     * qui a écrit `infoCours` (mesuré au banc : l'évaluation verrouillée était écartée une fois sur cinq). Seule une
     * évaluation verrouillée APRÈS l'entrée dans l'étape compte : un autre groupe du même cours n'y entre pas par hasard.
     */
    function verrouillees() {
        return evaluations().filter(function (e) { return e && e.id && e.verrouillee === true; });
    }

    function enEvaluation() {
        return vis(el('btnVerrouillerEvaluation'));
    }

    function productionJugee() {
        var n = el('niveauProduction1');
        var t = n ? n.textContent.trim() : '';
        return !!t && t !== '—' && t !== '-';
    }

    function paletteRetro() {
        return M().premierVisible(['#travaux-palette-eval-retro', '#travaux-eval-retroaction']);
    }

    function lignesListe() {
        return [].slice.call(document.querySelectorAll('#conteneur-tableau-evaluations tr[data-da]')).filter(vis);
    }

    function productionDeLaLigne(tr) {
        var id = tr.getAttribute('data-production-id');
        var prods = typeof obtenirDonneesSelonMode === 'function' ? (obtenirDonneesSelonMode('productions') || []) : [];
        return prods.find(function (p) { return p && p.id === id; }) || null;
    }

    /** En spécifications, une production d'un « Type » de la pratique (même règle que le calcul, #708). */
    function compteDansUnForfait(tr) {
        var types = configDeLaPratique().typesTravaux || [];
        var prod = productionDeLaLigne(tr);
        return !!prod && typeof window.productionEstDuType === 'function'
            && types.some(function (t) { return window.productionEstDuType(prod, t); });
    }

    /** La ligne d'une production à évaluer (« Évaluer » au menu Actions) ; en spécifications, d'un type qui compte. */
    function ligneAEvaluer() {
        var aEvaluer = lignesListe().filter(function (tr) {
            var s = tr.querySelector('select.eval-actions-select');
            return s && [].some.call(s.options, function (o) { return o.value.indexOf('evaluer|') === 0; });
        });
        if (lireCtx().famille === 'specifications') {
            var qui = aEvaluer.find(compteDansUnForfait);
            if (qui) return qui;
        }
        return aEvaluer[0] || null;
    }

    /** L'évaluation verrouillée à l'étape 6, relue par son id : la préférence ne garde ni DA ni nom. */
    function evaluationRetenue() {
        var r = lireCtx().evaluation;
        var id = r && r.id;
        return id ? (evaluations().find(function (e) { return e && e.id === id; }) || null) : null;
    }

    function ligneEvaluee() {
        var ev = evaluationRetenue();
        if (!ev) return null;
        var e = { da: ev.etudiantDA, productionId: ev.productionId };
        return lignesListe().find(function (tr) {
            return tr.getAttribute('data-da') === String(e.da) && tr.getAttribute('data-production-id') === String(e.productionId);
        }) || null;
    }

    function menuActions(tr) {
        return tr ? tr.querySelector('select.eval-actions-select') : null;
    }

    var pdfLivre = false;
    document.addEventListener('dossierPdfLivre', function (ev) {
        var e = evaluationRetenue();
        var d = ev && ev.detail;
        if (!e || !d || (String(d.da) === String(e.etudiantDA) && String(d.productionId) === String(e.productionId))) pdfLivre = true;
    });

    // Étape 5 : la pratique déjà appliquée au groupe-cours à l'entrée de l'étape. Re-toucher « Appliquer au cours
    // actif » ne change alors rien de lisible : c'est ce toucher qui fait avancer (sinon l'étape passait seule).
    var activeALEntree = null;
    var appliquerTouche = false;
    document.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t && t.closest && t.closest('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]')) appliquerTouche = true;
    }, true);

    function idActive() {
        return typeof obtenirIdPratiqueActive === 'function' ? obtenirIdPratiqueActive() : null;
    }

    // ---------- Les étapes ----------

    function texteCourant(id) {
        return texteDe(id, { famille: lireCtx().famille, listeQuiComptent: id === 'std' && listeQuiComptentVisible() });
    }

    var CONTINUER = { libelle: 'Continuer', primaire: true, action: suivante };

    // PROPOSÉ (11 nov. 2026, à valider par Grégoire) : ce qu'attend « Continuer », dit sous lui tant que ça manque.
    var ATTENTES = {
        types: "Pour continuer, ajoute au moins un type de production.",
        forfaits: "Pour continuer, ajoute au moins un forfait à la table.",
        cibles: "Pour continuer, écris au moins une cible.",
        dossier: "Pour continuer, télécharge son dossier : « Actions › Dossier PDF », sur la ligne de la production que tu viens d'évaluer."
    };
    function continuerSi(raison) { return Object.assign({}, CONTINUER, { attend: raison }); }

    /** La Liste des évaluations est à l'écran. */
    function surLaListe() { return vis(el('evaluations-liste')); }

    var DEFINITIONS = {
        pratique: {
            avant: async function () {
                aller('conception', 'pratiques-notation');
                window.scrollTo(0, 0);
            },
            zones: function () {
                // Appelée par le moteur avant qu'il place la bulle : sa forme est prise avant sa place.
                bulleDeLEtape1();
                return wizardOuvert() ? zonesWizard()
                    : [document.querySelector('#conception-pratiques-notation .rangee-selection')].filter(Boolean);
            },
            contour: function () {
                if (wizardOuvert()) {
                    return (window.wizardState && window.wizardState.etapeActuelle === 'entree-pratique') ? carteModele() : null;
                }
                return document.querySelector('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
            },
            atteint: function () {
                surModale(wizardOuvert());
                var p = pratiqueCreee();
                if (!p) return false;
                majCtx({ pratiqueCreee: p.id, famillePrevue: familleDe(p) });
                reconstruire();
                return true;
            }
        },
        ouvrir: {
            avant: async function () {
                aller('conception', 'pratiques-notation');
                // Après « Créer la pratique », aucune pratique n'est ouverte : c'est le geste de cette étape.
                fermerFiche();
                window.scrollTo(0, 0);
            },
            zones: function () { return [el('menuPratiques')].filter(Boolean); },
            contour: function () { return el('menuPratiques'); },
            atteint: function () {
                var id = idOuverte();
                if (!id) return false;
                var f = familleDe(pratiqueParId(id));
                if (!estAlternative(f)) return false;
                majCtx({ pratiqueId: id, famille: f });
                reconstruire();
                return true;
            }
        },
        std: {
            avant: async function () {
                await ouvrirLaPratique();
                if (typeof afficherProductionsQuiComptentMat === 'function') await afficherProductionsQuiComptentMat();
            },
            zones: function () { return [el('mat-carte-structure')]; },
            contour: function () { return el('mat-carte-structure'); },
            boutons: [CONTINUER],
            // Rien ne fait avancer seul (« Continuer ») : la sonde ne sert qu'à la place de la bulle.
            atteint: function () { bulleHorsDesReglagesStd(); return false; }
        },
        'spe-types': {
            avant: async function () {
                await ouvrirLaPratique();
                seuilTouche = false;
                ecouterSeuil();
            },
            zones: function () { return [groupeDe('mat-spec-seuil'), parentDe('mat-spec-types-travaux-liste')]; },
            contour: function () { return seuilTouche ? parentDe('mat-spec-types-travaux-liste') : groupeDe('mat-spec-seuil'); },
            boutons: [continuerSi(function () { return (configDeLaPratique().typesTravaux || []).length > 0 ? '' : ATTENTES.types; })],
            atteint: function () { return false; }
        },
        'spe-forfaits': {
            avant: async function () {
                await ouvrirLaPratique();
                // La table ne se redessine pas quand un type change (inscrit au rapport) : ce qu'on vient de
                // régler à l'étape 3a y paraît. Rien ne s'écrit.
                var c = configDeLaPratique();
                if (typeof afficherForfaitsMat === 'function') afficherForfaitsMat(c.forfaits || [], c.typesTravaux || []);
            },
            zones: function () { return [parentDe('mat-spec-forfaits-liste')]; },
            contour: function () { return parentDe('mat-spec-forfaits-liste'); },
            boutons: [continuerSi(function () { return (configDeLaPratique().forfaits || []).length > 0 ? '' : ATTENTES.forfaits; })],
            atteint: function () { return false; }
        },
        den: {
            avant: ouvrirLaPratique,
            zones: function () { return [groupeDe('mat-den-cibles')]; },
            contour: function () { return groupeDe('mat-den-cibles'); },
            boutons: [continuerSi(function () { return ciblesNommees() ? '' : ATTENTES.cibles; })],
            atteint: function () { return false; }
        },
        affichage: {
            avant: ouvrirLaPratique,
            zones: function () { return [groupeDe('mat-affichage-note-complet')]; },
            contour: function () { return groupeDe('mat-affichage-note-complet'); },
            boutons: [CONTINUER]
        },
        appliquer: {
            avant: async function () {
                await ouvrirLaPratique();
                activeALEntree = idActive();
                appliquerTouche = false;
            },
            zones: function () { return [document.querySelector('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]')]; },
            contour: function () { return document.querySelector('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]'); },
            nommeLeContour: true,   // « Appliquer au cours actif » (Grégoire, 11 nov. 2026, 9 h 47 : la flèche va à ce que la bulle nomme)
            atteint: function () {
                var id = lireCtx().pratiqueId;
                if (!id || idActive() !== id) return false;
                if (activeALEntree === id && !appliquerTouche) return false;
                majCtx({ appliqueeLe: new Date().toISOString() });
                return true;
            }
        },
        evaluer: {
            avant: async function () {
                if (!enEvaluation()) { aller('evaluations', 'liste'); window.scrollTo(0, 0); }
                // Ce qui était déjà verrouillé : seule une évaluation verrouillée ensuite fait avancer.
                if (!Array.isArray(lireCtx().verrouilleesAvant)) {
                    majCtx({ verrouilleesAvant: verrouillees().map(function (e) { return e.id; }) });
                }
            },
            zones: function () {
                // Dans l'évaluation : la zone ne sert qu'à poser la bulle près de ce
                // qu'il faut toucher. Sans copie, les trois panneaux s'empilent sur toute la page : éclairés ensemble,
                // ils ne laissaient à la bulle aucune place, et elle couvrait le cadenas.
                if (enEvaluation()) return [this.contour()].filter(Boolean);
                var tr = ligneAEvaluer();
                return [tr || el('conteneur-tableau-evaluations')].filter(Boolean);
            },
            contour: function () {
                if (enEvaluation()) return productionJugee() ? el('btnVerrouillerEvaluation') : paletteRetro();
                return menuActions(ligneAEvaluer());
            },
            nommeLeContour: function () { return !enEvaluation(); },   // « Actions › Évaluer » sur la Liste (11 nov. 2026)
            atteint: function () {
                var avant = lireCtx().verrouilleesAvant || [];
                var e = verrouillees().find(function (x) { return avant.indexOf(x.id) === -1; });
                if (!e) return false;
                majCtx({ evaluation: { id: e.id } });
                return true;
            }
        },
        synthese: {
            avant: async function () {
                pdfLivre = false;
                aller('evaluations', 'liste');
                window.scrollTo(0, 0);
                await attendre(ligneEvaluee, 2000);
            },
            // Hors de la Liste (Grégoire, 11 nov. 2026, capture 34 : resté sur l'écran d'évaluation, ni halo ni flèche), la
            // flèche et le halo vont à « Liste » ; sur la Liste, à « Actions » de la ligne évaluée.
            zones: function () { return surLaListe() ? [ligneEvaluee() || el('conteneur-tableau-evaluations')].filter(Boolean) : []; },
            contour: function () {
                var liste = document.querySelector('#sous-navigation [data-sous-onglet="evaluations-liste"]');
                return surLaListe() ? menuActions(ligneEvaluee()) : (vis(liste) ? liste : null);
            },
            nommeLeContour: true,   // « Actions › Dossier PDF », ou « Liste » pour y revenir (11 nov. 2026)
            boutons: [continuerSi(function () { return pdfLivre ? '' : ATTENTES.dossier; })],
            atteint: function () { return false; }
        },
        'plus-loin': {
            centre: true,
            sansSortie: true,
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    };

    function construireEtape(id) {
        var d = DEFINITIONS[id];
        var etape = {
            titre: TEXTES[id].titre,
            get texte() { return texteCourant(id); }
        };
        // Étape 1 : l'assistant ouvert, Échap est le sien (il le ferme) et non la sortie du parcours. Le moteur lit
        // `sansSortie` au toucher : vrai, il passe la touche à `surEchap`.
        if (id === 'pratique') Object.defineProperty(etape, 'sansSortie', { get: wizardOuvert, enumerable: true });
        if (TEXTES[id].geste) etape.geste = TEXTES[id].geste;
        // `nommeLeContour` aussi (11 nov. 2026) : il était déclaré sur quatre étapes et n'arrivait jamais au moteur.
        ['centre', 'sansSortie', 'avant', 'zones', 'contour', 'nommeLeContour', 'atteint', 'boutons'].forEach(function (k) {
            if (d[k] !== undefined) etape[k] = d[k];
        });
        // Chaque étape repart de la forme ordinaire de la bulle (corrections du 9 nov. : étapes 1 et 3).
        var avantPropre = etape.avant;
        etape.avant = async function () {
            formeDeBulle(null);
            if (avantPropre) await avantPropre.apply(this, arguments);
        };
        etape.id = id;
        return etape;
    }

    var DEF = { id: ID, etapes: [], lienSortie: 'Plus tard' };

    /** Les étapes du moteur suivent le chemin : il relit `DEF.etapes` à chaque pas. */
    function reconstruire() {
        var nouvelles = cheminDe(lireCtx()).map(construireEtape);
        DEF.etapes.length = 0;
        Array.prototype.push.apply(DEF.etapes, nouvelles);
    }

    // ---------- Le lancement, la sortie, la fin ----------

    function enDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    async function lancer(depuis) {
        if (motifRefus()) return;
        var ctx;
        // « Reprendre » à l'étape 1 passe aussi 0 : le contexte n'est remis à zéro que pour « Commencer » et
        // « Refaire ». Sinon une pratique créée entre-temps entrait dans `pratiquesAvant`, et l'étape n'avançait plus.
        var reprise = window.Assistance.etatDe(ID).etat === 'en-cours' && Array.isArray(lireCtx().pratiquesAvant);
        if (!depuis && !reprise) {
            var fa = familleActive();
            ctx = poserCtx({
                sauteEtape1: !!fa,
                famillePrevue: fa,
                pratiquesAvant: pratiques().map(function (p) { return p && p.id; }).filter(Boolean)
            });
        } else {
            ctx = lireCtx();
        }
        reconstruire();
        var ids = cheminDe(ctx);
        var i = Math.max(0, Math.min(depuis || 0, ids.length - 1));
        // Ce que la reprise ne retrouve plus (préférence effacée) : on revient au geste qui le donne.
        if (i > ids.indexOf('ouvrir') && !ctx.pratiqueId) i = ids.indexOf('ouvrir');
        if (i > ids.indexOf('evaluer') && !ctx.evaluation) i = ids.indexOf('evaluer');
        window.Assistance.definirEtat(ID, 'en-cours', i);
        return M().lancer(DEF, {
            depuis: i,
            surEtape: function (n) {
                surModale(false);
                window.Assistance.definirEtat(ID, 'en-cours', n);
            },
            surQuitter: function () { surModale(false); },
            // Dans l'assistant (étape 1), Échap le ferme ; à la dernière bulle, sans lien de sortie, il vaut « Terminer ».
            surEchap: function () {
                if (wizardOuvert()) { if (typeof fermerWizardV2 === 'function') fermerWizardV2(); return; }
                terminer();
            },
            // Entrer dans la démo en cours de route : le parcours se ferme et attend dans le panneau.
            verifier: function () {
                if (!enDemo()) return true;
                surModale(false);
                return false;
            }
        });
    }

    function terminer() {
        surModale(false);
        poserCtx({});
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
    }

    window.Assistance.enregistrer({
        id: ID,
        rang: RANG,
        titre: TITRE,
        ligne: LIGNE,
        get total() { return cheminDe(lireCtx()).length; },
        refus: motifRefus,
        prealable: 'evaluer',
        lancer: lancer
    });

    // Pour les bancs : les textes, le chemin, la lecture de la famille, le refus.
    window.ParcoursNotationAlternative = {
        TEXTES: TEXTES,
        PHRASES: PHRASES,
        cheminDe: cheminDe,
        texteDe: texteDe,
        familleDe: familleDe,
        motifRefus: motifRefus,
        etapes: function () { return DEF.etapes.slice(); }
    };
})();
