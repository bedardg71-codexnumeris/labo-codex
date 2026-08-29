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
    const PRATIQUES_DISPONIBLES = [
        { code: 'SOM', nom: 'Sommative', description: 'Pratique traditionnelle avec moyenne pondérée' },
        { code: 'STD', nom: 'PAN-Standards', description: 'Standards-Based Grading (objectifs à maîtriser)' },
        { code: 'SPE', nom: 'PAN-Spécifications', description: 'Specifications Grading (forfaits/bundles)' },
        { code: 'DEN', nom: 'PAN-Dénotation', description: 'Ungrading (cibles et critères explicites, note certificative à la fin)' }
    ];

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

    /**
     * Obtient les pratiques d'un élément
     * @param {Object} element - Élément
     * @returns {string[]} - Liste des pratiques (ou ['all'] si non spécifié)
     */
    function obtenirPratiques(element) {
        if (!element) return ['all'];

        // Chercher dans pratiquesCompatibles (nouveau) ou pratiques (ancien)
        const pratiques = element.pratiquesCompatibles || element.pratiques;

        if (!pratiques || pratiques.length === 0) {
            // Rétrocompatibilité: déduire de gabaritType si présent
            if (element.gabaritType) {
                return [element.gabaritType];
            }
            return ['all'];
        }
        return pratiques;
    }

    // =========================================================================
    // FONCTIONS DE FILTRAGE
    // =========================================================================

    /**
     * Filtre les éléments par pratique
     * @param {Array} elements - Liste d'éléments
     * @param {string|null} pratique - Code pratique ('SOM', 'STD', 'SPE', 'DEN') ou null pour tous
     * @returns {Array} - Éléments filtrés
     */
    function filtrerParPratique(elements, pratique) {
        if (!pratique) return elements;

        return elements.filter(e => {
            const pratiques = obtenirPratiques(e);
            if (pratiques.includes('all')) return true;
            return pratiques.includes(pratique);
        });
    }

    /**
     * Sépare les éléments en gabarits et éléments utilisateur
     * @param {Array} elements - Liste d'éléments
     * @returns {Object} - { gabarits: [], elements: [] }
     */
    function separerGabaritsEtElements(elements) {
        const gabarits = elements.filter(e => estUnGabarit(e));
        const elementsUtilisateur = elements.filter(e => !estUnGabarit(e));
        return { gabarits, elements: elementsUtilisateur };
    }

    /**
     * Compte les éléments par pratique
     * @param {Array} elements - Liste d'éléments
     * @returns {Object} - { SOM: 0, STD: 0, SPE: 0, DEN: 0, all: 0 }
     */
    function compterParPratique(elements) {
        const compteur = { SOM: 0, STD: 0, SPE: 0, DEN: 0, all: 0 };

        elements.forEach(e => {
            const pratiques = obtenirPratiques(e);
            pratiques.forEach(p => {
                if (compteur[p] !== undefined) {
                    compteur[p]++;
                }
            });
        });

        return compteur;
    }

    // =========================================================================
    // INTERFACE UTILISATEUR
    // =========================================================================

    /**
     * Génère le HTML pour le badge de pratique (style solide avec texte blanc)
     * Utilise les classes CSS : .badge-type-pratique + .badge-type-som, etc.
     * @param {string} pratique - Code pratique ('SOM', 'STD', 'SPE', 'DEN', 'MULTI')
     * @returns {string} - HTML du badge
     */
    function genererBadgePratique(pratique) {
        const code = pratique.toUpperCase();
        const classeModificateur = `badge-type-${code.toLowerCase()}`;
        return `<span class="badge-type-pratique ${classeModificateur}">${code}</span>`;
    }

    /**
     * Génère les badges pour toutes les pratiques d'un élément
     * Règle MULTI : Si 3+ pratiques, affiche un seul badge MULTI (dégradé)
     * Sinon affiche les badges individuels
     * @param {Object} element - Élément avec propriété .pratiques ou .pratiquesCompatibles
     * @returns {string} - HTML des badges
     */
    function genererBadgesPratiques(element) {
        const pratiques = obtenirPratiques(element);

        // Si 3+ pratiques → afficher MULTI
        if (pratiques.length >= 3 || pratiques.includes('all')) {
            return genererBadgePratique('MULTI');
        }

        // Sinon afficher les badges individuels
        return pratiques.map(p => genererBadgePratique(p)).join(' ');
    }

    /**
     * Génère le HTML pour le filtre par pratique
     * @param {string} idFiltre - ID du select
     * @param {string} onchangeHandler - Nom de la fonction onchange
     * @param {Object} compteurs - Optionnel, compteur par pratique pour afficher les totaux
     * @returns {string} - HTML du filtre
     */
    function genererFiltrePratique(idFiltre, onchangeHandler, compteurs = null) {
        let options = '<option value="">Toutes les pratiques</option>';

        PRATIQUES_DISPONIBLES.forEach(p => {
            const count = compteurs ? ` (${compteurs[p.code] || 0})` : '';
            options += `<option value="${echapperHtml(p.code)}">${echapperHtml(p.nom)}${count}</option>`;
        });

        if (compteurs && compteurs.all > 0) {
            options += `<option value="all">Multi-pratiques (${compteurs.all})</option>`;
        }

        return `
            <label style="display: block; margin-bottom: 5px; color: var(--gris-moyen); font-weight: 500;">
                Filtrer par pratique de notation :
            </label>
            <select id="${idFiltre}"
                    class="controle-form"
                    data-on-change="${onchangeHandler}"
                    style="max-width: 300px;">
                ${options}
            </select>
        `;
    }

    /**
     * Génère le HTML pour la section gabarits
     * @param {Array} gabarits - Liste des gabarits
     * @param {string} pratiqueFiltree - Pratique sélectionnée pour filtrage
     * @param {string} typeMateriel - 'echelle', 'grille', 'production', 'cartouche'
     * @param {string} actionClick - Fonction à appeler au clic
     * @returns {string} - HTML de la section
     */
    function genererSectionGabarits(gabarits, pratiqueFiltree, typeMateriel, actionClick) {
        const gabaritsFiltres = filtrerParPratique(gabarits, pratiqueFiltree);

        if (gabaritsFiltres.length === 0) {
            return `
                <div class="gabarits-section">
                    <h4 style="margin-top: 15px; margin-bottom: 10px; color: #6f42c1; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">Gabarits</span>
                        <span style="font-size: 0.8rem; color: var(--gris-clair); font-weight: normal;">(formulaires pré-configurés)</span>
                    </h4>
                    <p style="color: var(--gris-clair); font-style: italic; font-size: 0.9rem;">
                        Aucun gabarit disponible pour cette pratique
                    </p>
                </div>
            `;
        }

        let html = `
            <div class="gabarits-section">
                <h4 style="margin-top: 15px; margin-bottom: 10px; color: #6f42c1; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.1rem;">Gabarits</span>
                    <span style="font-size: 0.8rem; color: var(--gris-clair); font-weight: normal;">(formulaires pré-configurés)</span>
                </h4>
        `;

        gabaritsFiltres.forEach(gabarit => {
            const nom = gabarit.nom || gabarit.titre || 'Sans titre';
            const description = gabarit.description || '';
            const badges = genererBadgesPratiques(gabarit);

            html += `
                <div class="gabarit-item" style="
                    padding: 12px;
                    background: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, #162c36 100%);
                    border: 1px solid rgba(139,92,246,0.2);
                    border-left: 4px solid #8b5cf6;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                " class="hover-translate-x"
                   data-action="${actionClick}" data-param="${gabarit.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                ${badges}
                                <span style="font-weight: 600; color: var(--accent-primaire);">${nom}</span>
                            </div>
                            ${description ? `<div style="font-size: 0.85rem; color: var(--gris-moyen);">${description}</div>` : ''}
                        </div>
                        <div style="color: #8b5cf6; font-size: 1.2rem; margin-left: 10px;">
                            →
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
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
     * Génère le HTML pour les checkboxes de sélection des pratiques compatibles
     * À intégrer dans les formulaires d'édition de matériel pédagogique
     * @param {string} idPrefix - Préfixe pour les IDs des checkboxes (ex: 'grille', 'echelle')
     * @param {string[]} pratiquesSelectionnees - Liste des pratiques actuellement sélectionnées
     * @returns {string} - HTML des checkboxes
     */
    function genererCheckboxesPratiques(idPrefix, pratiquesSelectionnees = []) {
        const checkboxes = PRATIQUES_DISPONIBLES.map(p => {
            const checked = pratiquesSelectionnees.includes(p.code) ? 'checked' : '';
            const couleurClasse = `badge-type-${p.code.toLowerCase()}`;
            return `
                <label class="checkbox-pratique" style="display: inline-flex; align-items: center; gap: 4px; margin-right: 15px; cursor: pointer;">
                    <input type="checkbox"
                           id="${idPrefix}_pratique_${p.code}"
                           name="${idPrefix}_pratiques"
                           value="${echapperHtml(p.code)}"
                           ${checked}
                           style="width: 14px; height: 14px; cursor: pointer;">
                    <span class="badge-type-pratique ${couleurClasse}">${p.code}</span>
                </label>
            `;
        }).join('');

        return `
            <div class="champ-pratiques-compatibles" data-tooltip="cn-pratiques-compat">
                <div style="font-weight: 500; font-size: 0.9rem; margin-bottom: 8px;">
                    Pratiques compatibles :
                </div>
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
                    ${checkboxes}
                </div>
            </div>
        `;
    }

    /**
     * Récupère les pratiques sélectionnées depuis les checkboxes
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
        PRATIQUES_DISPONIBLES,

        // Gabarits par défaut (échelles : retirés par #574)
        GABARITS_GRILLES_DEFAUT,
        GABARITS_PRODUCTIONS_DEFAUT,

        // Fonctions de détection
        estUnGabarit,
        estElementSysteme,
        obtenirPratiques,

        // Fonctions de filtrage
        filtrerParPratique,
        separerGabaritsEtElements,
        compterParPratique,

        // Interface utilisateur
        genererBadgePratique,
        genererBadgesPratiques,
        genererFiltrePratique,
        genererSectionGabarits,
        genererSeparateur,
        genererCheckboxesPratiques,
        lirePratiquesSelectionnees,

        // Initialisation
        ajouterGabaritsDefautSiManquants,
        initialiserTousLesGabarits
    };

    // Initialiser les gabarits au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiserTousLesGabarits);
    } else {
        // DOM déjà chargé
        setTimeout(initialiserTousLesGabarits, 100);
    }


})();
