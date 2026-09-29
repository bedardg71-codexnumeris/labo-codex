/**
 * preferences.js — API centralisée pour les préférences utilisateur
 *
 * Source de vérité unique pour les préférences globales de l'application.
 * Regroupe ce qui était dispersé dans deux emplacements :
 *   - 3 champs de modalitesEvaluation (RàI, SOLO, grille) — « découpler P/N » et
 *     « fenêtre patterns » en faisaient partie jusqu'au #823 (10 sept. 2026) :
 *     retirés, personne ne les lisait (la fenêtre vit dans seuilsInterpretation)
 *   - tout preferencesAffichage (patterns on/off, snapshots, graphiques, chrono, animations,
 *     visite guidée, aide contextuelle, mode clair, tooltips, mode expert, etc.)
 *
 * IMPORTANT : deux objets historiques NE SONT PAS absorbés.
 *
 * 1. `modalitesEvaluation` contient aussi la configuration de la pratique de
 *    notation active (pratique, specifications, parObjectifs, categories, etc.).
 *    Ces champs restent dans modalitesEvaluation — ce ne sont pas des
 *    préférences utilisateur. (La durée de période, ex-champ legacy, vit dans
 *    la clé `dureePeriode` du domaine horaire depuis le Lot 0 #328.)
 *
 * 2. `seuilsInterpretation` contient une structure mixte : quelques seuils
 *    ajustables par l'utilisateur (fragile, acceptable, bon, progression,
 *    risque, défi, et la fenêtre d'analyse `nombreProductionsAnalyse` depuis
 *    #823), mais aussi une hiérarchie de constantes (idme.*, risque.*,
 *    interpretation.*) lues en bloc par plusieurs modules via
 *    chargerSeuilsInterpretation(). Le refondre proprement demande
 *    un chantier dédié — laissé pour plus tard.
 *
 * API publique :
 *   obtenirPreference(cle)              → valeur (ou défaut si non définie)
 *   definirPreference(cle, valeur)      → écrit + notifie les abonnés
 *   abonnerPreference(cle, callback)    → callback(nouvelleValeur) sur changement
 *   desabonnerPreference(cle, callback) → retire l'abonnement
 *   obtenirToutesPreferences()          → copie de l'objet complet
 *   migrerPreferencesV3()               → migration one-shot depuis les 3 anciens objets
 *
 * Le stockage est un détail d'implémentation : une seule clé IDB/localStorage
 * `preferencesUtilisateur`. Les modules consomment l'API, jamais le stockage.
 */

(function() {
    'use strict';

    // =========================================================================
    // CONSTANTES
    // =========================================================================

    const CLE_STOCKAGE = 'preferencesUtilisateur';
    const CLE_FLAG_MIGRATION = 'migrationPrefs_v3_done';

    /**
     * Valeurs par défaut pour chaque préférence.
     * Utilisées si la clé n'existe pas dans le stockage.
     */
    const DEFAUTS = {
        // --- Observation ---
        afficherDescriptionsSOLO: true,
        activerActionsRLO: false,

        // --- Dépistage (RàI) ---
        activerRai: true,
        grilleReferenceDepistage: '',

        // --- Affichage ---
        depistageAcp: true,
        afficherGraphiques: true,
        afficherSeuilsVisuels: true,
        afficherDeveloppementHabiletes: true,
        afficherContexteGraphiques: true,
        animationPoints: true,
        chronoEvaluation: false,
        // #321 — « note différée » (couche 1 PRÉN) : masque les notes PAR TRAVAIL
        // pour que la rétroaction passe d'abord. N'altère aucun calcul ni la note
        // finale de session. Défaut false = notes visibles (comportement actuel).
        noteDifferee: false,
        sisDefaut: 'lea',
        modeExpert: false,
        modeClair: true,
        accompagnementActif: true,
        banniereAccueilRepliee: false,
        // #485 (21 août 2026) — Grille imprimable des présences : colonnes à
        // inclure et portée (groupe actif ou tous les groupes-cours). Lu et
        // écrit uniquement par presences-rapport.js, cloné à la lecture.
        rapportPresencesOptions: {
            da: false,
            sousGroupe: false,
            programme: true,
            nomProgramme: false,
            sa: true,
            portee: 'actif',
            notation: 'crochet'
        },

        // Disposition de la réserve « Non planifié » du planificateur
        // (7 août 2026) : 'bas' = sous la grille (défaut historique),
        // 'gauche' = en colonne à côté. Choix de l'utilisateur selon l'espace
        // dont il dispose — le compromis dépend de son écran, pas du nôtre.
        planifReserveDisposition: 'bas',

        // Affichage des deux palettes flottantes du module Alignement
        // (7 août 2026) : elles se commandent depuis la barre d'outils de la
        // carte. Visibles par défaut — masquer est un geste de l'enseignant qui
        // veut tout l'écran, pas un état dans lequel on le fait démarrer.
        // Remplace l'ancien « repli » porté par les palettes elles-mêmes : un
        // seul mécanisme, et il survit au rechargement.
        planifPaletteNoeudsVisible: true,
        planifPalettePlanificateurVisible: true,

        // #444 (10 août 2026) — familles REPLIÉES de la palette Nœuds, par
        // `data-zone`. Tableau des zones fermées : vide = tout ouvert, qui est
        // le comportement d'avant. Motif : les 18 pastilles en 6 familles
        // dépassent la hauteur de l'écran iPad ; replier ce dont on ne se sert
        // pas dans la séance rend la palette utilisable au doigt.
        planifPaletteFamillesRepliees: [],

        // Flags de transitions pédagogiques (js/transitions.js) — suivent
        // la progression de l'utilisateur entre les 4 étapes du parcours
        // Numérisation → Croisement → Observation → Compétence.
        // `false` par défaut = la bannière de transition est encore à voir.
        // Option B : variantes _demo pour tracker indépendamment les bandeaux
        // vus en mode démo vs en mode normal (messages distincts).
        transition_num_crois_vue: false,
        transition_num_crois_vue_demo: false,
        transition_crois_obs_vue: false,
        transition_crois_obs_vue_demo: false,
        transition_obs_comp_vue: false,
        transition_obs_comp_vue_demo: false,

        // État de la visite guidée 6 étapes (js/accompagnement.js)
        tourGuide_etape: null,
        tourGuide_complete: false,
        tourGuide_etapes_vues: [],

        // Export du plan — niveau « Personnalisé » (#431, 8 août 2026).
        // ⚠ REMPLACÉE par exportGabarits (#416 lot H, 12 août 2026). Elle
        // subsiste ici le temps que la migration la lise ; elle est effacée
        // (mise à null) dès qu'un gabarit en a été tiré, et la clé partira
        // quand plus aucun codex en circulation ne pourra la porter.
        // Forme : { contenus: {…8 drapeaux}, ordre: [ids de sections] }.
        exportPlanPersonnalise: null,

        // Gabarits d'export nommés (#416 lot H, 12 août 2026).
        // [] = aucun gabarit propre ; les gabarits GÉNÉRIQUES ne vivent pas ici,
        // ils sont dans le code (on ne persiste pas ce qu'on n'édite pas).
        // Forme : [{ id, nom, granularite, colonnes: [ids], renommages: {} }]
        exportGabarits: []
    };

    // Abonnés : { cle: [callback, callback, ...] }
    const abonnes = {};

    // =========================================================================
    // API DE LECTURE / ÉCRITURE
    // =========================================================================

    /**
     * Obtient la valeur d'une préférence.
     * Retourne le défaut si la clé n'est pas définie dans le stockage.
     * @param {string} cle - Nom canonique de la préférence
     * @returns {*} Valeur stockée ou défaut
     */
    function obtenirPreference(cle) {
        if (!(cle in DEFAUTS)) {
            console.warn('[preferences] Clé inconnue :', cle);
        }
        const prefs = lireStockage();
        return cle in prefs ? prefs[cle] : DEFAUTS[cle];
    }

    /**
     * Définit la valeur d'une préférence et notifie les abonnés.
     * @param {string} cle - Nom canonique de la préférence
     * @param {*} valeur - Nouvelle valeur
     */
    function definirPreference(cle, valeur) {
        if (!(cle in DEFAUTS)) {
            console.warn('[preferences] Écriture clé inconnue :', cle);
        }
        const prefs = lireStockage();
        const ancienne = prefs[cle];
        prefs[cle] = valeur;
        // Lot E3 (D0 point 2, 28 sept. 2026) : le résultat de l'écriture remonte, pour que la page
        // qui écrit (Réglages) le dise par le témoin commun. Rien d'autre ne change.
        const ecrit = ecrireStockage(prefs);
        if (ancienne !== valeur) {
            notifierAbonnes(cle, valeur);
        }
        return ecrit;
    }

    /**
     * Retourne une copie de toutes les préférences (valeurs stockées + défauts).
     * @returns {Object}
     */
    function obtenirToutesPreferences() {
        const prefs = lireStockage();
        const complet = {};
        for (const k in DEFAUTS) {
            complet[k] = k in prefs ? prefs[k] : DEFAUTS[k];
        }
        return complet;
    }

    // =========================================================================
    // ABONNEMENTS (pattern observer)
    // =========================================================================

    /**
     * S'abonne aux changements d'une préférence.
     * Le callback reçoit la nouvelle valeur.
     * @param {string} cle
     * @param {Function} callback
     */
    function abonnerPreference(cle, callback) {
        if (typeof callback !== 'function') return;
        if (!abonnes[cle]) abonnes[cle] = [];
        abonnes[cle].push(callback);
    }

    /**
     * Retire un abonnement.
     * @param {string} cle
     * @param {Function} callback
     */
    function desabonnerPreference(cle, callback) {
        if (!abonnes[cle]) return;
        abonnes[cle] = abonnes[cle].filter(cb => cb !== callback);
    }

    function notifierAbonnes(cle, valeur) {
        if (!abonnes[cle]) return;
        for (const cb of abonnes[cle]) {
            try {
                cb(valeur);
            } catch (e) {
                console.error('[preferences] Erreur dans abonné pour', cle, e);
            }
        }
    }

    // =========================================================================
    // STOCKAGE (interne)
    // =========================================================================

    function lireStockage() {
        try {
            return db.getSync(CLE_STOCKAGE, {}) || {};
        } catch (e) {
            console.error('[preferences] Erreur lecture stockage :', e);
            return {};
        }
    }

    /** @returns {boolean} false si l'écriture a été refusée (garde #340) ou a levé. */
    function ecrireStockage(prefs) {
        try {
            return db.setSync(CLE_STOCKAGE, prefs) !== false;
        } catch (e) {
            console.error('[preferences] Erreur écriture stockage :', e);
            return false;
        }
    }

    // =========================================================================
    // MIGRATION V3 — Fusion des 3 anciens objets
    // =========================================================================

    /**
     * Table de correspondance : anciens emplacements → noms canoniques.
     * Chaque entrée décrit où lire la valeur dans l'ancien système.
     */
    const MIGRATION_MAP = [
        // Depuis modalitesEvaluation — UNIQUEMENT les 3 champs qui sont des préférences
        // utilisateur. Le reste (pratique, specifications, parObjectifs, categories)
        // reste dans modalitesEvaluation car ce sont des paramètres de la pratique
        // active, pas des préférences utilisateur. NB SSOT Lot 0 (10 juin 2026) :
        // dureePeriodeMinutes a déménagé dans la clé `dureePeriode` (domaine horaire)
        // et les toggles afficherSommatif/afficherAlternatif ne sont plus écrits.
        { source: 'modalitesEvaluation', champ: 'afficherDescriptionsSOLO', cible: 'afficherDescriptionsSOLO' },
        { source: 'modalitesEvaluation', champ: 'activerRai',               cible: 'activerRai' },
        { source: 'modalitesEvaluation', champ: 'grilleReferenceDepistage', cible: 'grilleReferenceDepistage' },
        // `decouplerPN` et `fenetrePatterns` figuraient ici jusqu'au #823 :
        // retirés avec les contrôles, ils ne sont plus ni migrés ni purgés.

        // Depuis preferencesAffichage
        { source: 'preferencesAffichage', champ: 'depistageAcp',                cible: 'depistageAcp' },
        { source: 'preferencesAffichage', champ: 'afficherGraphiques',          cible: 'afficherGraphiques' },
        { source: 'preferencesAffichage', champ: 'afficherSeuilsVisuels',       cible: 'afficherSeuilsVisuels' },
        { source: 'preferencesAffichage', champ: 'afficherContexteGraphiques',  cible: 'afficherContexteGraphiques' },
        { source: 'preferencesAffichage', champ: 'animationPoints',             cible: 'animationPoints' },
        { source: 'preferencesAffichage', champ: 'chronoEvaluation',            cible: 'chronoEvaluation' },
        { source: 'preferencesAffichage', champ: 'sisDefaut',                   cible: 'sisDefaut' },
        { source: 'preferencesAffichage', champ: 'modeExpert',                  cible: 'modeExpert' },
        { source: 'preferencesAffichage', champ: 'modeClair',                   cible: 'modeClair' }
        // tourGuide, aideContextuelle, tooltips : retirés au profit de
        // `accompagnementActif` (pref unique — chantier 20 avril 2026).

        // seuilsInterpretation NON migré : structure mixte (plats + imbriqués)
        // consommée en bloc par chargerSeuilsInterpretation(). Voir en-tête.
    ];

    /**
     * Migre les 3 anciens objets vers `preferencesUtilisateur`.
     * Idempotente : protégée par le flag `migrationPrefs_v3_done`.
     *
     * Nettoie aussi les emplacements legacy (3 champs dans modalitesEvaluation,
     * clé preferencesAffichage entière) une fois la migration confirmée. Le
     * nettoyage s'exécute à chaque démarrage — idempotent et robuste face aux
     * réintroductions par import ou sortie de démo.
     *
     * @returns {Object} Rapport de migration { effectuee, champsMigres, erreurs }
     */
    function migrerPreferencesV3() {
        const rapport = { effectuee: false, champsMigres: 0, erreurs: [] };

        try {
            if (db.getSync(CLE_FLAG_MIGRATION, false) !== true) {
                // Lire les 3 anciennes sources
                // ⚠⚠ #419 (8 août 2026) — ASYMÉTRIE LECTURE/PURGE, corrigée ici.
                //
                // `modalitesEvaluation` est NAMESPACÉE PAR TRIMESTRE (registre
                // `CLES_NAMESPACEES`, trimestres.js) : les vraies données vivent
                // dans `a2025_modalitesEvaluation`, `h2026_modalitesEvaluation`…
                // Cette migration lisait pourtant la clé BRUTE `modalitesEvaluation`,
                // qui n'existe pas — elle ne voyait donc JAMAIS rien à migrer —
                // pendant que `nettoyerLegacy()` purgeait, lui, à travers le module
                // propriétaire, c'est-à-dire la clé namespacée du trimestre ACTIF.
                //
                // Une migration qui efface une clé qu'elle n'a jamais lue. Chez un
                // utilisateur dont le trimestre actif porte ces champs, ils
                // étaient supprimés sans jamais atteindre le magasin V3.
                //
                // Constat du 8 août : Grégoire n'a été épargné que par un hasard —
                // son trimestre actif (A2026) n'a aucune clé `modalitesEvaluation`,
                // donc la purge n'a rien trouvé. Ses valeurs réelles survivaient
                // dans a2024/a2025/h2026.
                //
                // ⮕ On lit désormais PAR LE MÊME CHEMIN qu'on purge : le module
                // propriétaire (SSOT #328 Lot 1). Repli sur la clé brute si le
                // module n'est pas chargé, pour ne pas dépendre d'un ordre de script.
                const sources = {
                    modalitesEvaluation: lireModalitesLegacy(),
                    preferencesAffichage: safeGet('preferencesAffichage'),
                    seuilsInterpretation: safeGet('seuilsInterpretation')
                };

                // Partir de l'objet existant (peut être vide ou partiel)
                const prefs = lireStockage();

                for (const entree of MIGRATION_MAP) {
                    const source = sources[entree.source];
                    if (!source || !(entree.champ in source)) continue;

                    const valeur = source[entree.champ];
                    // Ne pas écraser une valeur déjà migrée (migration idempotente par design,
                    // mais aussi : si l'utilisateur a modifié après une migration partielle)
                    //
                    // ⚠ #419 (8 août 2026) — « déjà migrée » ne peut PAS se réduire à
                    // « la clé existe ». Constat terrain le jour où cette migration a
                    // enfin tourné (#414) : le magasin V3 contenait
                    // `grilleReferenceDepistage: ''`. La clé était présente, donc la
                    // copie était sautée — puis `nettoyerLegacy()` purgeait la source.
                    // Une valeur legacy réelle aurait été écartée ET effacée, en
                    // silence, alors que le magasin d'arrivée n'avait qu'un espace
                    // réservé vide.
                    //
                    // Un espace réservé n'est pas un choix de l'utilisateur : `''`,
                    // `null` et `undefined` sont traités comme ABSENTS, et la valeur
                    // legacy l'emporte. Un `false` ou un `0`, eux, sont de vrais choix
                    // et restent protégés — d'où le test explicite plutôt qu'un
                    // simple test de véracité, qui les aurait écrasés.
                    const dejaRenseigne = (entree.cible in prefs)
                        && prefs[entree.cible] !== ''
                        && prefs[entree.cible] !== null
                        && prefs[entree.cible] !== undefined;
                    if (dejaRenseigne) continue;

                    // Symétrie : ne pas remplacer un espace réservé vide par un autre.
                    if (valeur === '' || valeur === null || valeur === undefined) continue;

                    prefs[entree.cible] = valeur;
                    rapport.champsMigres++;
                }

                ecrireStockage(prefs);
                db.setSync(CLE_FLAG_MIGRATION, true);
                rapport.effectuee = true;

                console.warn('[preferences] Migration V3 effectuée. Champs migrés :', rapport.champsMigres);
            }

            // Nettoyage des emplacements legacy — ne s'exécute qu'après migration confirmée
            // (les anciennes sources ne sont plus nécessaires). Idempotent.
            nettoyerLegacy();
        } catch (e) {
            rapport.erreurs.push(e.message);
            console.error('[preferences] Erreur pendant la migration V3 :', e);
        }

        return rapport;
    }

    // #429 (8 août 2026) — ENRICHISSEMENT : la migration V3 ne lisait que le
    // trimestre ACTIF. `lireModalitesLegacy()` passe par le module propriétaire,
    // donc par la clé namespacée du trimestre actif — si CELUI-CI n'a pas de
    // `modalitesEvaluation` (cas réel : A2026 chez Grégoire, créé après le
    // 16 avril), la migration ne trouve RIEN et pose les DÉFAUTS, pendant que
    // les vraies valeurs dorment dans a2024/a2025/h2026. Constaté au premier
    // contrôle terrain : grille de dépistage vide, et la fenêtre de patterns
    // 4 → 3 (préférence retirée depuis, #823 : elle n'était lue par personne).
    //
    // Ce correctif balaie TOUS les trimestres (du plus récent au plus ancien,
    // par dateCreation) et adopte, pour chaque champ resté à sa valeur PAR
    // DÉFAUT, la première valeur trouvée qui en diffère. LECTURE SEULE des clés
    // de trimestre — aucune purge : c'est l'asymétrie lecture/purge qui a fait
    // #419, on ne la recrée pas dans le correctif de son propre dégât.
    //
    // ONE-SHOT (drapeau propre) : sans drapeau, un utilisateur qui REMET un
    // champ à son défaut (vider la grille de référence, par exemple) le verrait
    // se re-remplir à chaque démarrage depuis un vieux trimestre.
    const CLE_FLAG_ENRICHISSEMENT = 'migrationPrefs_v3_enrichie_trimestres';

    function enrichirPrefsV3DepuisTrimestres() {
        const rapport = { effectuee: false, champsRecuperes: 0, erreurs: [] };
        try {
            if (db.getSync(CLE_FLAG_ENRICHISSEMENT, false) === true) return rapport;

            const champs = MIGRATION_MAP.filter(m => m.source === 'modalitesEvaluation');
            const trimestres = db.getSync('trimestres', []) || [];
            const tries = Array.isArray(trimestres)
                ? trimestres.slice().sort(function(a, b) {
                    return String((b && b.dateCreation) || '').localeCompare(String((a && a.dateCreation) || ''));
                })
                : [];

            const prefs = lireStockage();
            let modifie = false;

            champs.forEach(function(entree) {
                const courante = entree.cible in prefs ? prefs[entree.cible] : undefined;
                const estDefaut = courante === undefined || courante === DEFAUTS[entree.cible];
                if (!estDefaut) return; // valeur posée (migration ou main) : intouchable

                for (let i = 0; i < tries.length; i++) {
                    const t = tries[i];
                    if (!t || !t.id) continue;
                    const mod = safeGet(t.id + '_modalitesEvaluation');
                    if (entree.champ in mod && mod[entree.champ] !== undefined &&
                        mod[entree.champ] !== DEFAUTS[entree.cible]) {
                        prefs[entree.cible] = mod[entree.champ];
                        rapport.champsRecuperes++;
                        modifie = true;
                        break;
                    }
                }
            });

            if (modifie) {
                ecrireStockage(prefs);
                console.warn('[preferences] Enrichissement V3 depuis les trimestres :', rapport.champsRecuperes, 'champ(s) récupéré(s)');
            }
            db.setSync(CLE_FLAG_ENRICHISSEMENT, true);
            rapport.effectuee = true;
        } catch (e) {
            rapport.erreurs.push(e.message);
            console.error('[preferences] Erreur pendant l\'enrichissement V3 :', e);
        }
        return rapport;
    }

    /**
     * Supprime les emplacements legacy que la migration a absorbés :
     *   - les 3 champs de modalitesEvaluation qui sont devenus des préférences ;
     *   - la clé preferencesAffichage dans son ensemble.
     * Idempotent : aucune écriture si rien à nettoyer, pas d'effet si la clé
     * n'existe pas. Appelée à chaque démarrage (après garantie que la migration
     * a eu lieu) pour résister aux réintroductions (import de données anciennes,
     * restauration post-démo).
     */
    // Une valeur est « mise à l'abri » quand le magasin V3 en porte une VRAIE
    // (ni absente, ni espace réservé vide). C'est la seule condition qui rend
    // la suppression de la source légitime. Un `false` ou un `0` comptent :
    // ce sont des choix.
    function estRecueilli(cible, prefs) {
        return (cible in prefs)
            && prefs[cible] !== ''
            && prefs[cible] !== null
            && prefs[cible] !== undefined;
    }

    function nettoyerLegacy() {
        // ⚠ #419 : dérivé de MIGRATION_MAP au lieu d'être recopié à la main.
        // Une seconde liste en dur aurait pu diverger de la carte de migration
        // — et purger un champ que la migration ne recueille pas.
        const CHAMPS_LEGACY_MODALITES = MIGRATION_MAP
            .filter(function (e) { return e.source === 'modalitesEvaluation'; });

        try {
            const prefs = lireStockage();

            // ⚠⚠ #419 — ON NE PURGE QUE CE QUI EST DÉJÀ À L'ABRI.
            //
            // `nettoyerLegacy()` tourne à CHAQUE démarrage, y compris longtemps
            // après que le drapeau de migration a été posé — et il purge le
            // trimestre ACTIF. Un utilisateur qui change de trimestre des mois
            // plus tard voyait donc les champs de ce trimestre-là
            // supprimés alors que la migration, déjà marquée « faite », ne
            // repasserait jamais les recueillir. La purge devançait la mise à
            // l'abri au lieu de la suivre.
            const modalites = lireModalitesLegacy();
            if (modalites && typeof modalites === 'object') {
                const aPurger = CHAMPS_LEGACY_MODALITES.filter(function (e) {
                    return (e.champ in modalites) && estRecueilli(e.cible, prefs);
                });
                if (aPurger.length > 0) {
                    // Écriture via le module propriétaire (SSOT #328 Lot 1)
                    window.modalitesEvaluation.modifier(function (m) {
                        for (const e of aPurger) {
                            delete m[e.champ];
                        }
                    }, { discret: true });   // migration (lot F)
                }
            }

            // Même règle pour la clé entière : elle ne disparaît que lorsque
            // TOUT ce qu'elle porte encore d'utile est recueilli. Sinon on la
            // laisse en place — une clé legacy qui traîne coûte quelques
            // octets, une préférence effacée ne se retrouve pas.
            const affichage = safeGet('preferencesAffichage');
            const resteAMigrer = MIGRATION_MAP.some(function (e) {
                return e.source === 'preferencesAffichage'
                    && (e.champ in affichage)
                    && !estRecueilli(e.cible, prefs);
            });
            if (!resteAMigrer) {
                db.removeSync('preferencesAffichage'); // no-op si déjà absente
            }
        } catch (e) {
            console.error('[preferences] Erreur pendant le nettoyage legacy :', e);
        }
    }

    // Lecture du legacy `modalitesEvaluation` par le MÊME chemin que la purge
    // (#419). Le module propriétaire applique le namespace du trimestre actif ;
    // la clé brute ne sert que de repli si le module n'est pas encore chargé.
    function lireModalitesLegacy() {
        try {
            if (window.modalitesEvaluation && typeof window.modalitesEvaluation.lire === 'function') {
                return window.modalitesEvaluation.lire() || {};
            }
        } catch (e) {
            console.warn('[preferences] Lecture du legacy modalitesEvaluation impossible :', e);
        }
        return safeGet('modalitesEvaluation');
    }

    function safeGet(cle) {
        try {
            return db.getSync(cle, {}) || {};
        } catch (e) {
            return {};
        }
    }

    // =========================================================================
    // INTROSPECTION (utile pour debug et validation)
    // =========================================================================

    function obtenirDefauts() {
        return Object.assign({}, DEFAUTS);
    }

    function listerClesConnues() {
        return Object.keys(DEFAUTS);
    }

    // =========================================================================
    // EXPORTS GLOBAUX
    // =========================================================================

    window.obtenirPreference = obtenirPreference;
    window.definirPreference = definirPreference;
    window.obtenirToutesPreferences = obtenirToutesPreferences;
    window.abonnerPreference = abonnerPreference;
    window.desabonnerPreference = desabonnerPreference;
    window.migrerPreferencesV3 = migrerPreferencesV3;
    window.enrichirPrefsV3DepuisTrimestres = enrichirPrefsV3DepuisTrimestres;
    window.obtenirDefautsPreferences = obtenirDefauts;
    window.listerClesPreferencesConnues = listerClesConnues;

    // #321 — helpers « note différée » (couche 1 PRÉN). noteDiffereeActive() est
    // consulté par les écrans qui affichent une note PAR TRAVAIL ; badgeNoteDifferee()
    // fournit le repère HTML statique (CSP-safe) qui remplace la note masquée.
    function noteDiffereeActive() {
        return obtenirPreference('noteDifferee') === true;
    }
    function badgeNoteDifferee() {
        return '<span class="badge-note-differee" title="Note différée : la rétroaction passe d\'abord. Réglage dans Labo › Outils d\'observation.">note différée</span>';
    }
    window.noteDiffereeActive = noteDiffereeActive;
    window.badgeNoteDifferee = badgeNoteDifferee;

    // =========================================================================
    // AUTO-INITIALISATION : migration au démarrage
    // =========================================================================

    // ⚠⚠ #414 (8 août 2026) — CETTE MIGRATION N'A JAMAIS TOURNÉ.
    //
    // Deux défauts de naissance, présents depuis son écriture (16 avril 2026,
    // « Chantier RLO 1.2 — Branchement preferences.js »), et qui se couvraient
    // l'un l'autre :
    //   • la garde testait `db.isReady`, une propriété qui N'EXISTE PAS sur
    //     `db` (le drapeau d'instance est `db.ready`, le drapeau global
    //     `window.dbReady`) → toujours fausse, donc jamais d'exécution directe ;
    //   • le repli écoutait sur `document`, alors que `db.js` émet sur `window`
    //     et l'a TOUJOURS fait (vérifié sur l'historique complet). Un événement
    //     émis sur `window` ne descend pas vers `document` : écouteur mort-né.
    //
    // Aucun autre appelant : `migrerPreferencesV3` n'avait donc aucun chemin
    // d'exécution. Conséquence silencieuse — `obtenirPreference()` lit
    // UNIQUEMENT le magasin V3, sans repli sur le legacy : toute préférence
    // restée dans `modalitesEvaluation` / `preferencesAffichage` était ignorée
    // au profit de `DEFAUTS`.
    //
    // Réveil audité avant branchement (règle « code dormant » du CLAUDE.md),
    // car la migration purge le legacy via `nettoyerLegacy()` :
    //   • `preferencesAffichage` — clé supprimée en entier : ZÉRO lecteur
    //     ailleurs dans le code, la purge est sans effet de bord ;
    //   • les champs retirés de `modalitesEvaluation` — aucune lecture
    //     qualifiée (`modalites.activerRai` etc.). ⚠ `portfolio.decouplerPN`
    //     (config de pratique, champ imbriqué distinct de la préférence retirée
    //     au #823) n'a jamais été dans la table : `nettoyerLegacy` n'y touche pas.
    // La migration n'écrase jamais une valeur déjà présente en V3
    // (`if (entree.cible in prefs) continue`) : elle ne fait que combler les
    // trous. Et si l'écriture V3 échoue, `nettoyerLegacy()` n'est pas atteint —
    // l'ordre est déjà fail-safe.
    function lancerMigrationAuDemarrage() {
        window.auDbPret(function() {
            migrerPreferencesV3();
            // #429 : l'enrichissement vient APRÈS — il ne comble que ce que la
            // migration a laissé au défaut, jamais ce qu'elle a posé.
            enrichirPrefsV3DepuisTrimestres();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lancerMigrationAuDemarrage);
    } else {
        lancerMigrationAuDemarrage();
    }

})();
