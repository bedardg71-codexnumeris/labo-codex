/* ===============================
   MODULE UTILITAIRE GABARITS
   Créé le 2 janvier 2026

   Fonctionnalités :
   - Détection des gabarits vs éléments utilisateur
   - Filtrage par pratique de notation
   - Interface de filtre réutilisable

   =============================== */

(function() {
    'use strict';


    // =========================================================================
    // CONSTANTES
    // =========================================================================

    /**
     * Tags de pratiques disponibles
     */

    // Session B (#303) : COULEURS_PRATIQUES retiré (zéro-dette). C'était une table
    // de couleurs en dur (jamais consommée) qui DIVERGEAIT du design system. La
    // couleur canonique d'une pratique vient désormais du registre
    // (obtenirCouleurPratique → var(--som-orange|--std-bleu|--spe-vert|--den-violet)).

    // =========================================================================
    // FONCTIONS DE DÉTECTION
    // =========================================================================

    /**
     * Vérifie si un élément est un gabarit
     * @param {Object} element - Élément à vérifier
     * @returns {boolean} - True si c'est un gabarit
     */
    function estUnGabarit(element) {
        return element && element.estGabarit === true;
    }

    /**
     * Vérifie si un élément est un élément système (non supprimable)
     * @param {Object} element - Élément à vérifier
     * @returns {boolean} - True si c'est un élément système
     */
    function estElementSysteme(element) {
        return element && element.systeme === true;
    }

    // =========================================================================
    // COMPOSITION D'UNE GRILLE — le badge qui dit ce qui EST
    // =========================================================================
    // Consigne du 3 sept. 2026 (volet C). Les cases « Pratiques compatibles » ne
    // faisaient rien : 29 lectures d'affichage et de transport hors grilles.js,
    // 0 filtre, 0 garde — « elles ne font que nommer l'intention de l'auteur »
    // (Grégoire). La SAISIE est retirée des cinq objets (grille, cartouche,
    // échelle, objectifs, production) ; le CHAMP `pratiquesCompatibles` reste
    // dans les données et voyage toujours (import-export.js, partage-schemas.js) :
    // tarir n'est pas réparer. La chaîne qui lisait ce champ ici (obtenir /
    // filtrer / séparer / compter par pratique, badges de pratique, filtre et
    // section de gabarits, cases à cocher, liste des pratiques disponibles)
    // n'avait AUCUN appelant vivant hors des badges et des cases — mesuré le
    // 3 sept. — et part avec elles. `lirePratiquesSelectionnees` reste définie,
    // sans appelant : c'est le témoin que la consigne nomme.
    //
    // À la place, les GRILLES reçoivent un badge DÉDUIT des types de leurs
    // critères — décision de Grégoire : « le type quand il est unique, "Mixte"
    // sinon » — qu'il encodait déjà à la main dans ses noms (« G5 FR-HOLIS A26 »).
    // Il dit vrai même quand un type change après coup. Les quatre autres objets
    // n'ont pas de critères : pas de badge, sans remplaçant (accepté par lui).
    const LIBELLES_COMPOSITION = { algorithmique: 'ALGO', holistique: 'HOLIS', analytique: 'ANALY' };
    const LIBELLES_COMPOSITION_LONGS = {
        ALGO: 'tous les critères sont algorithmiques',
        HOLIS: 'tous les critères sont holistiques',
        ANALY: 'tous les critères sont analytiques',
        MIXTE: 'plusieurs types de critères'
    };

    /**
     * La composition d'une grille, déduite des types de ses critères.
     * @returns {string} 'ALGO' | 'HOLIS' | 'ANALY' | 'MIXTE' | '' (aucun critère,
     *          ou un seul type que personne ne connaît)
     */
    function compositionGrille(grille) {
        const criteres = (grille && Array.isArray(grille.criteres)) ? grille.criteres : [];
        const types = new Set();
        criteres.forEach(c => { if (c && typeof c.type === 'string' && c.type) types.add(c.type); });
        if (types.size === 0) return '';
        if (types.size > 1) return 'MIXTE';
        return LIBELLES_COMPOSITION[[...types][0]] || '';
    }

    /**
     * #941 lot S1 (24 sept. 2026) — UNE GRILLE ENTIÈREMENT EN POINTS se note sans échelle
     * (décision D1 de Grégoire : les points « remplacent ni plus ni moins l'échelle de
     * performance »). Même règle que le badge « ANALY » : tous ses critères sont analytiques.
     * Une grille mixte n'en est pas une, et ne change pas.
     */
    function grilleEntierementEnPoints(grille) {
        return compositionGrille(grille) === 'ANALY';
    }

    /**
     * #941 lot S1 — UNE ÉVALUATION EN POINTS, lue dans l'évaluation seule (les lecteurs n'ont
     * pas tous sa grille, ni son trimestre) : chaque critère enregistré porte ses `points`
     * (les collecteurs ne les écrivent que pour un critère analytique). C'est le prédicat que
     * les rendus du lot 3 lisaient déjà critère par critère (« points présent »).
     * Sans `criteres[]` (brouillon commencé), les points saisis décident.
     * ⮕ Décision A de Grégoire (24 sept.) : une telle évaluation ne montre JAMAIS de nom de
     * niveau, copies déjà enregistrées comprises — règle d'affichage, rien n'est réécrit.
     * Une échelle choisie exprès peut servir en coulisse (cartouche par niveau) ; son nom
     * ne s'affiche pas.
     */
    function evaluationEnPoints(evaluation) {
        if (!evaluation || typeof evaluation !== 'object') return false;
        const criteres = Array.isArray(evaluation.criteres) ? evaluation.criteres.filter(Boolean) : [];
        if (criteres.length > 0) {
            return criteres.every(c => typeof c.points === 'number' && !isNaN(c.points));
        }
        const pts = evaluation.pointsAnalytiques;
        return !!pts && typeof pts === 'object'
            && Object.values(pts).some(v => typeof v === 'number' && !isNaN(v));
    }

    /**
     * #941 lot S1 — LE NIVEAU GÉNÉRAL QU'UN ÉCRAN PEUT MONTRER : '' pour une évaluation en
     * points (décision A, même une copie enregistrée avec l'échelle de départ) et pour le
     * « -- » que le calcul écrit faute de niveau ; sinon `niveauFinal`. Les lecteurs d'affichage
     * passent par ici ; les calculs (rangs, zones) gardent leur lecture.
     */
    function niveauFinalAffichable(evaluation) {
        if (!evaluation || evaluationEnPoints(evaluation)) return '';
        const niv = evaluation.niveauFinal;
        return (niv && niv !== '--') ? String(niv) : '';
    }

    /** Le badge de composition d'une grille — '' quand il n'y a rien à dire. */
    function genererBadgeComposition(grille) {
        const code = compositionGrille(grille);
        if (!code) return '';
        return `<span class="badge-type-pratique badge-composition badge-composition--${code.toLowerCase()}" title="${echapperHtml(LIBELLES_COMPOSITION_LONGS[code])}">${code}</span>`;
    }

    /**
     * Génère le HTML pour un séparateur visuel
     * @returns {string} - HTML du séparateur
     */
    function genererSeparateur() {
        return `
            <hr style="
                border: none;
                border-top: 1px dashed rgba(106,172,184,0.2);
                margin: 20px 0;
            ">
        `;
    }

    // =========================================================================
    // GABARITS PAR DÉFAUT (MULTI-PRATIQUES)
    // =========================================================================

    // #574 (29 août 2026, option B de Grégoire) — GABARITS_ECHELLES_DEFAUT RETIRÉ.
    // `GABARIT_ECHELLE_IDME` n'avait aucune valeur ponctuelle et
    // `GABARIT_ECHELLE_STD_MASTERY` écrivait `valeurNumerique` : depuis #527, une
    // évaluation sur une copie de ces gabarits était non calculable. Plutôt que de
    // leur poser des `valeurCalcul` choisies par le projet, on n'offre plus que des
    // échelles que l'utilisateur complète. Les copies déjà en bibliothèque restent.

    /**
     * Gabarits de grilles multi-pratiques
     */
    const GABARITS_GRILLES_DEFAUT = [
        {
            id: 'GABARIT_GRILLE_ANALYTIQUE',
            nom: '[Multi] Grille analytique',
            type: 'analytique',
            description: 'Gabarit multi-pratiques : Grille avec plusieurs critères et niveaux de performance',
            criteres: [
                { id: 'crit_1', nom: 'Critère 1', description: 'Description du critère 1', ponderation: 25 },
                { id: 'crit_2', nom: 'Critère 2', description: 'Description du critère 2', ponderation: 25 },
                { id: 'crit_3', nom: 'Critère 3', description: 'Description du critère 3', ponderation: 25 },
                { id: 'crit_4', nom: 'Critère 4', description: 'Description du critère 4', ponderation: 25 }
            ],
            estGabarit: true,
            pratiques: ['all'],
            dansBibliotheque: true,
            dateCreation: '2026-01-02T00:00:00.000Z',
            auteur: 'Labo Codex'
        },
        {
            id: 'GABARIT_GRILLE_CHECKLIST_SPE',
            nom: '[SPE] Checklist de spécifications',
            type: 'specifications',
            typeSPE: true,
            description: 'Gabarit SPE : Liste de spécifications binaires (oui/non) à cocher',
            criteres: [
                { id: 'spec_1', nom: 'Spécification 1', description: '', obligatoire: true, type: 'checkbox' },
                { id: 'spec_2', nom: 'Spécification 2', description: '', obligatoire: true, type: 'checkbox' },
                { id: 'spec_3', nom: 'Spécification 3', description: '', obligatoire: true, type: 'checkbox' }
            ],
            estGabarit: true,
            pratiques: ['SPE'],
            dansBibliotheque: true,
            dateCreation: '2026-01-02T00:00:00.000Z',
            auteur: 'Labo Codex'
        },
        {
            id: 'GABARIT_GRILLE_STD_OBJECTIFS',
            nom: '[STD] Grille par objectifs',
            type: 'standards',
            description: 'Gabarit PAN-Standards : Critères alignés sur les objectifs du cours',
            criteres: [
                { id: 'obj_1', nom: 'Objectif d\'apprentissage 1', description: '', estStandard: true },
                { id: 'obj_2', nom: 'Objectif d\'apprentissage 2', description: '', estStandard: true },
                { id: 'obj_3', nom: 'Objectif d\'apprentissage 3', description: '', estStandard: true }
            ],
            estGabarit: true,
            pratiques: ['STD'],
            dansBibliotheque: true,
            dateCreation: '2026-01-02T00:00:00.000Z',
            auteur: 'Labo Codex'
        }
    ];

    /**
     * Gabarits de productions
     * NOTE: Les types de base (examen, travail, artefact, portfolio) sont déjà
     * disponibles dans le formulaire de création via le select de type.
     * Seuls les gabarits spécifiques à certaines pratiques sont ici.
     * Le gabarit SPE "Prise de position" est créé par spe-specifications.js
     */
    const GABARITS_PRODUCTIONS_DEFAUT = [
        // Les gabarits SPE sont créés dans spe-specifications.js
        // Ici on peut ajouter d'autres gabarits spécifiques si nécessaire
    ];

    // #468/CO-25 (21 août 2026) : les deux gabarits de cartouches par défaut
    // (GABARIT_CART_ANALYTIQUE, GABARIT_CART_SPE_REVISION) sont RETIRÉS — verdict
    // Grégoire du 21 août. Ils portaient un schéma `sections[]` sans `grilleId`
    // ni `commentaires` : les ajouter affichait « 0 commentaire(s) » et menait
    // à un cul-de-sac. Zéro-dette : on retire ce qui ne peut pas servir plutôt
    // que d'inventer l'ancrage à une grille qu'ils n'ont jamais eu.

    // =========================================================================
    // FONCTIONS D'INITIALISATION DES GABARITS
    // =========================================================================

    /**
     * Ajoute les gabarits par défaut dans une bibliothèque si inexistants
     * @param {string} cleStorage - Clé localStorage de la bibliothèque
     * @param {Array} gabaritsDefaut - Liste des gabarits à ajouter
     */
    function ajouterGabaritsDefautSiManquants(cleStorage, gabaritsDefaut) {
        let bibliotheque = [];
        try {
            bibliotheque = db.getSync(cleStorage, []);
        } catch (e) {
            console.warn(`[gabarits-utils] Erreur lecture ${cleStorage}:`, e);
            bibliotheque = [];
        }

        let modifie = false;
        gabaritsDefaut.forEach(gabarit => {
            // #468/CO-25 (21 août 2026) : un gabarit que l'utilisateur a supprimé
            // NE REVIENT PAS. Cette fonction tourne à chaque chargement : sans
            // cette garde, la suppression ne tenait que jusqu'au rafraîchissement
            // suivant — le geste marchait, et se défaisait tout seul.
            if (typeof window !== 'undefined' && typeof window.estRessourceSupprimee === 'function'
                && window.estRessourceSupprimee(gabarit.id)) {
                return;
            }
            const existe = bibliotheque.some(e => e.id === gabarit.id);
            if (!existe) {
                bibliotheque.push(gabarit);
                modifie = true;
            }
        });

        if (modifie) {
            db.setSync(cleStorage, bibliotheque);
        }
    }

    /**
     * Récupère les pratiques sélectionnées depuis les checkboxes.
     * ⚠ PLUS AUCUN APPELANT depuis le 3 sept. 2026 (volet C) : les cases sont
     * parties des cinq objets. La définition reste — c'est le témoin que la
     * consigne nomme (« ne rend plus que sa définition ») — et rend toujours
     * un tableau, contrat que des bancs stubbent encore.
     * @param {string} idPrefix - Préfixe utilisé lors de la génération
     * @returns {string[]} - Liste des codes pratiques sélectionnés
     */
    function lirePratiquesSelectionnees(idPrefix) {
        const checkboxes = document.querySelectorAll(`input[name="${idPrefix}_pratiques"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Initialise tous les gabarits par défaut dans les bibliothèques
     */
    function initialiserTousLesGabarits() {

        // #574 : plus de gabarit d'échelle semé.
        ajouterGabaritsDefautSiManquants('bibliothequeGrilles', GABARITS_GRILLES_DEFAUT);
        ajouterGabaritsDefautSiManquants('bibliothequeProductions', GABARITS_PRODUCTIONS_DEFAUT);

    }

    // =========================================================================
    // EXPOSITION GLOBALE
    // =========================================================================

    window.GabaritsUtils = {
        // Constantes

        // Gabarits par défaut (échelles : retirés par #574)
        GABARITS_GRILLES_DEFAUT,
        GABARITS_PRODUCTIONS_DEFAUT,

        // Fonctions de détection
        estUnGabarit,
        estElementSysteme,

        // Composition d'une grille (3 sept. 2026, volet C)
        compositionGrille,
        genererBadgeComposition,
        grilleEntierementEnPoints,   // #941 lot S1
        evaluationEnPoints,          // #941 lot S1
        niveauFinalAffichable,       // #941 lot S1

        // Interface utilisateur
        genererSeparateur,
        lirePratiquesSelectionnees,

        // Initialisation
        ajouterGabaritsDefautSiManquants,
        initialiserTousLesGabarits
    };
    // #941 lot S1 — aussi en nom global : une trentaine de lecteurs, dans des fichiers
    // chargés après celui-ci, posent la même question.
    window.grilleEntierementEnPoints = grilleEntierementEnPoints;
    window.evaluationEnPoints = evaluationEnPoints;
    window.niveauFinalAffichable = niveauFinalAffichable;

    // Initialiser les gabarits au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiserTousLesGabarits);
    } else {
        // DOM déjà chargé
        setTimeout(initialiserTousLesGabarits, 100);
    }


})();
