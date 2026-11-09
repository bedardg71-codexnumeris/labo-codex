/* =================================================================
   LE PARCOURS « METTRE TES DONNÉES À L'ABRI » — le sixième parcours de l'assistance
   plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md (9 nov. 2026).

   La personne ouvre le menu Codex, met son codex à jour, le range dans un lieu protégé,
   puis apprend quand le rouvrir, SANS le faire : ouvrir un codex remplace tout ce qui est
   dans l'application (chargerCodex, codex.js). Pendant ce parcours, « Ouvrir un codex… » ne
   répond pas (garde ci-dessous), même éclairé à l'étape 4.

   ⚠ Les quatre textes, la ligne du panneau et la phrase du refus sont ceux que Grégoire a
   validés le 8 nov. (12 h 48 à 13 h 43), posés mot pour mot :
   tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js les confronte à la consigne.

   Le moment (étape 3) : une bulle ne peut pas se poser sur une fenêtre du système (choix
   d'emplacement, feuille de partage), et le toucher qui l'ouvre doit rester frais. L'étape 2
   avance donc quand l'aperçu « Mettre à jour le codex » s'ouvre, et la bulle 3 se pose près de
   son bouton « Mettre à jour », AU-DESSUS de l'aperçu : elle est lue avant le toucher qui
   ouvrira la fenêtre du système. Sa phrase est choisie à ce moment-là, selon le chemin que
   prendra l'écriture (Codex.cheminDeLaProchaineEcriture). Si la préparation du fichier
   dépasse le toucher, l'application demande déjà un toucher frais (« Ton codex est prêt »).
   ================================================================= */
(function () {
    'use strict';

    var ID = 'donnees';
    var M = function () { return window.ParcoursMoteur; };
    var C = function () { return window.Codex; };

    // ---------- Les textes validés (8 nov. 2026) ----------

    var LIGNE = 'Une copie complète de ton travail, hors du navigateur et rangée dans un lieu protégé : ton codex.';
    var REFUS_SANS_TRIMESTRE = 'Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis.';

    var TEXTE_1 = "Tes données vivent dans ce navigateur, sur cet appareil : Labo Codex ne les envoie nulle part. Elles peuvent donc être perdues si tu effaces les données de sites, changes de navigateur ou d'ordinateur. Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place. Touche « Codex », en haut de l'écran.";

    var TEXTE_2 = "Touche « Mettre à jour le codex ». Une fenêtre d'aperçu s'ouvre ; son « i » te dit ce que contient le fichier. Touche « Mettre à jour » : l'application rassemble tes données et les fichiers des productions de tes étudiant·es en un seul fichier. Plus tu as importé de productions, plus il est lourd, et plus sa préparation peut prendre un moment. Refais ce geste chaque semaine, et après chaque séance de travail importante : une saisie de présences, une série d'évaluations.";

    var TEXTE_3_DEBUT = "Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire. Range-le dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification. Ton ordinateur, lui, devrait avoir un mot de passe et un disque chiffré.";
    var TEXTE_3_FIN = "Quand le menu affiche « Ton codex est à jour », ta copie est faite.";

    // La phrase « selon le navigateur ». Celle de la fenêtre de choix tient en deux phrases :
    // le fichier déjà tenu prend la seconde seule (consigne), et des copies qui manquent la
    // première seule (#1012 : l'application redemande alors où écrire et ne garde pas le
    // fichier, la seconde serait fausse ; traitement proposé dans le rapport).
    var FENETRE_1 = "Une fenêtre te demande où l'enregistrer : choisis ta clé ou ton dossier synchronisé.";
    var FENETRE_2 = "Jusqu'à ce que tu recharges la page, chaque mise à jour réécrira ce même fichier, sans rien te demander.";
    var PARTAGE = "Ton appareil te propose de partager le fichier : choisis de l'enregistrer, sur ta clé ou dans ton dossier synchronisé.";
    var TELECHARGEMENT = "Le fichier arrive dans tes téléchargements. Quand tu l'y vois, réponds « Il y est », puis déplace-le sur ta clé ou dans ton dossier synchronisé. Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte.";

    var TEXTE_4 = "Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd. Touche alors « Ouvrir un codex… », ici, dans le menu. Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. Ouvre donc toujours ton codex le plus récent. Pour savoir où tu en es, regarde le haut du menu : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ». Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis.";

    /** La phrase de l'étape 3 pour un chemin d'écriture (Codex.cheminDeLaProchaineEcriture). */
    function phraseDuChemin(chemin, copiesManquent) {
        if (chemin === 'tenu') return FENETRE_2;
        if (chemin === 'fenetre') return copiesManquent ? FENETRE_1 : FENETRE_1 + ' ' + FENETRE_2;
        if (chemin === 'partage') return PARTAGE;
        return TELECHARGEMENT;
    }

    function texteEtape3(chemin, copiesManquent) {
        return TEXTE_3_DEBUT + ' ' + phraseDuChemin(chemin, copiesManquent) + ' ' + TEXTE_3_FIN;
    }

    // ---------- Ce que le parcours regarde ----------

    function q(sel) { return document.querySelector(sel); }
    function visible(el) { return !!(el && M().visible(el)); }

    function boutonCodex() { return document.getElementById('btn-codex'); }

    function menuOuvert() {
        var m = document.getElementById('codex-menu');
        return !!(m && !m.classList.contains('u-hide') && visible(m));
    }

    function dansLeMenu(sel) { return menuOuvert() ? q('#codex-menu ' + sel) : null; }
    function itemMettreAJour() { return dansLeMenu('[data-action="Codex.actionEnregistrer"]'); }
    function itemOuvrir() { return dansLeMenu('[data-action="Codex.actionOuvrir"]'); }
    function hautDuMenu() { return dansLeMenu('#codex-menu-statut-haut'); }

    // toggleMenu est la seule porte du menu (codex.js) : il ouvre s'il est fermé, et inversement.
    function ouvrirMenu() { if (!menuOuvert() && C() && typeof C().toggleMenu === 'function') C().toggleMenu(); }
    function fermerMenu() { if (menuOuvert() && C() && typeof C().toggleMenu === 'function') C().toggleMenu(); }

    /** L'aperçu « Mettre à jour le codex » (securite-export-preview.js), quand il est ouvert. */
    function apercu() {
        var a = q('.export-preview-modal');
        return visible(a) ? a : null;
    }

    function boutonDeLApercu() {
        var a = apercu();
        return a ? a.querySelector('.btn-confirmer') : null;
    }

    /** Une fenêtre de l'application ouverte pendant l'écriture : « Ton codex est prêt », « Il y est », l'échec… */
    function fenetreDeDialogue() {
        var d = q('#overlay-ui-dialogue .modal-contenu');
        return visible(d) ? d : null;
    }

    /** La fenêtre de progression (lecture des données, compression) : rien à y toucher. */
    function progression() {
        var p = q('#progression-overlay');
        return visible(p) ? p.querySelector('.progression-boite') || p : null;
    }

    function tentativeEnCours() {
        var t = C() && typeof C().derniereTentative === 'function' ? C().derniereTentative() : null;
        return !!(t && t.issue === 'en cours');
    }

    function derniereEcriture() {
        var e = C() && typeof C().etat === 'function' ? C().etat() : null;
        return e && e.actif ? e.derniereSauvegarde : null;
    }

    function aUnTrimestreReel() {
        var liste = typeof window.enumererTrimestres === 'function' ? window.enumererTrimestres()
            : (typeof db !== 'undefined' ? db.getSync('trimestres', []) : []);
        // La démo ne compte pas : le codex l'exclut (_sansLeDemo, codex.js).
        return Array.isArray(liste) && liste.some(function (t) { return t && t.id && t.id !== 'demo'; });
    }

    // ---------- Les éléments du moteur, pour CE parcours ----------

    // Le moteur ne dit pas quel parcours il joue : ses éléments, recréés à chaque lancement,
    // portent notre marque. La garde et la bulle au-dessus des fenêtres ne valent que pour eux.
    function elementsDuMoteur() {
        return [document.getElementById('parcours-bulle'), document.getElementById('parcours-contour')].filter(Boolean);
    }

    function cestNotreParcours() {
        var b = document.getElementById('parcours-bulle');
        return !!(b && b.dataset.parcours === ID && M().actif());
    }

    /** Étape 3 : la bulle et le contour passent au-dessus des fenêtres (l'aperçu est à 99999). */
    function auDessusDesFenetres(oui) {
        elementsDuMoteur().forEach(function (el) { el.classList.toggle('parcours--par-dessus-les-fenetres', !!oui); });
    }

    /** « Ouvrir un codex… » ne répond pas pendant ce parcours : il remplacerait l'espace de travail. */
    function garderOuvrir(ev) {
        if (!cestNotreParcours()) return;
        var cible = ev.target && ev.target.closest ? ev.target.closest('[data-action="Codex.actionOuvrir"]') : null;
        if (!cible) return;
        ev.preventDefault();
        ev.stopPropagation();
    }
    // En capture sur window : avant le répartiteur des data-action (main.js, sur document).
    window.addEventListener('click', garderOuvrir, true);

    // ---------- Les quatre étapes ----------

    var repereEcriture = null;

    var ETAPES = [
        {
            titre: 'Pourquoi un codex',
            texte: TEXTE_1,
            avant: async function () {
                auDessusDesFenetres(false);
                // Le geste à faire est d'ouvrir le menu : il part fermé.
                fermerMenu();
            },
            contour: boutonCodex,
            atteint: menuOuvert
        },
        {
            titre: 'Mettre à jour',
            texte: TEXTE_2,
            avant: async function () {
                auDessusDesFenetres(false);
                ouvrirMenu();
            },
            zones: function () { return [hautDuMenu()]; },
            // Le menu refermé (un toucher à côté), le contour revient sur « Codex ».
            contour: function () { return itemMettreAJour() || (tentativeEnCours() ? null : boutonCodex()); },
            atteint: function () { return !!apercu(); }
        },
        {
            titre: 'Range ton fichier',
            texte: texteEtape3('fenetre', false),
            voile: 'leger',
            avant: async function () {
                auDessusDesFenetres(true);
                // La phrase se choisit maintenant, l'aperçu ouvert : avant le toucher qui ouvrira
                // la fenêtre du système. Le compte des copies manquantes est déjà gardé.
                var t = C().derniereTentative();
                var manquent = !!(t && t.issue === 'en cours' && t.copiesManquantes > 0);
                ETAPES[2].chemin = C().cheminDeLaProchaineEcriture(manquent);
                ETAPES[2].copiesManquent = manquent;
                ETAPES[2].texte = texteEtape3(ETAPES[2].chemin, manquent);
                repereEcriture = derniereEcriture();
            },
            zones: function () {
                // La bulle passe au-dessus de l'aperçu et de la progression ; elle cède la place
                // aux fenêtres qui suivent (« Ton codex est prêt », « Il y est », l'échec), dont
                // les boutons doivent rester touchables : à 390 px, elle couvrait « Il y est ».
                auDessusDesFenetres(!fenetreDeDialogue());
                // L'aperçu n'est pas une zone : la bulle ne tient à côté de lui à aucune largeur
                // et s'y poserait au hasard. Elle évite son bouton (le contour), et la progression.
                var p = apercu() ? null : progression();
                return p ? [p] : [];
            },
            contour: function () {
                var b = boutonDeLApercu();
                if (b) return b;
                if (fenetreDeDialogue() || tentativeEnCours()) return null;
                // Aperçu refusé, ou échec refermé : on repart du menu, la bulle reste.
                return itemMettreAJour() || boutonCodex();
            },
            // L'état posé par _marquerCodexAJour, après l'écriture réussie : une nouvelle date.
            // Un échec (« Codex non mis à jour ») n'y arrive pas : la bulle reste.
            atteint: function () {
                var d = derniereEcriture();
                return !!d && d !== repereEcriture;
            }
        },
        {
            titre: 'Quand le rouvrir',
            texte: TEXTE_4,
            sansSortie: true,
            avant: async function () {
                auDessusDesFenetres(false);
                // La mise à jour a refermé le menu (_mettreAJourLeCodex) : on le rouvre.
                ouvrirMenu();
            },
            zones: function () { return [hautDuMenu()]; },
            contour: function () { return itemOuvrir() || boutonCodex(); },
            boutons: [{ libelle: 'Terminer', primaire: true, action: function () { terminer(); } }]
        }
    ];

    var DEF = { id: ID, etapes: ETAPES, lienSortie: 'Quitter le parcours' };

    // ---------- Le lancement, la sortie, la fin ----------

    async function lancer(depuis) {
        var d = depuis || 0;
        // L'étape 3 se joue sur l'aperçu ouvert : une reprise à cette étape repart de la deuxième.
        if (d === 2 && !apercu()) d = 1;
        window.Assistance.definirEtat(ID, 'en-cours', d);
        var enCours = M().lancer(DEF, {
            depuis: d,
            surEtape: function (i) { window.Assistance.definirEtat(ID, 'en-cours', i); },
            surQuitter: quitter,
            // À la dernière bulle, sans lien de sortie, Échap vaut « Terminer ».
            surEchap: function () { terminer(); }
        });
        // Les éléments du moteur sont créés dès l'appel : on les marque.
        var b = document.getElementById('parcours-bulle');
        if (b) b.dataset.parcours = ID;
        return enCours;
    }

    function quitter() {
        // Mots de « Découvrir » (validés pour la sortie d'un parcours), repris ici : voir le rapport.
        if (window.notifications && typeof window.notifications.info === 'function') {
            window.notifications.info('Tu pourras reprendre ce parcours depuis « Assistance », dans le menu.');
        }
    }

    function terminer() {
        window.Assistance.definirEtat(ID, 'fait', 0);
        M().fermer();
        fermerMenu();
    }

    window.Assistance.enregistrer({
        id: ID,
        titre: "Mettre tes données à l'abri",
        ligne: LIGNE,
        total: ETAPES.length,
        condition: function () { return aUnTrimestreReel() ? null : REFUS_SANS_TRIMESTRE; },
        lancer: lancer
    });

    // Pour la sentinelle des textes (tests/unit) : les étapes et les phrases telles qu'elles sont posées.
    window.ParcoursDonnees = {
        etapes: ETAPES,
        ligne: LIGNE,
        refus: REFUS_SANS_TRIMESTRE,
        texteEtape3: texteEtape3,
        phrases: { fenetre1: FENETRE_1, fenetre2: FENETRE_2, partage: PARTAGE, telechargement: TELECHARGEMENT }
    };
})();
