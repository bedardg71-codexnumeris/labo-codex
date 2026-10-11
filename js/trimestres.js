/* ===============================
   MODULE: TRIMESTRES (Beta 95)
   Gestion multi-trimestres avec namespacing

   Ce module gère le registre des trimestres et le namespacing
   des clés localStorage/IndexedDB pour isoler les données
   de chaque trimestre (A2025, H2026, etc.)

   ÉCRITURES pratiquesConfigurables : copie namespacée lors de l'archivage de trimestre

   IMPORTANT: Ce module NE REMPLACE PAS trimestre.js ni trimestre-v2.js
   Il s'ajoute PAR-DESSUS pour permettre la gestion de plusieurs trimestres.
   =============================== */

(function() {
    'use strict';

    /* ===============================
       HELPERS SESSION (3 sessions : Hiver, Été, Automne)
       Plages de mois de DÉBUT du trimestre (acté 28 mai 2026, calendrier
       Cégep ; ex. été 2025 = 28 mai → 30 juin) :
         Hiver   = janvier–avril   (1-4)
         Été     = mai–juillet     (5-7)
         Automne = août–décembre   (8-12)
       Centralisés ici pour éviter la duplication des déductions binaires
       legacy (jan-juin / juil-déc) dispersées dans le code.
       =============================== */

    function sessionDepuisMois(mois) {
        if (mois >= 1 && mois <= 4) return 'H';
        if (mois >= 5 && mois <= 7) return 'E';
        return 'A'; // 8-12
    }

    function nomSession(lettre) {
        switch (String(lettre || '').toUpperCase()) {
            case 'H': return 'Hiver';
            case 'E': return 'Été';
            case 'A': return 'Automne';
            default:  return String(lettre || '');
        }
    }

    /* ===============================
       CONSTANTES
       =============================== */

    // Clés qui doivent être namespacées par trimestre
    // ✅ CORRECTION (31 déc 2025): Ajouter groupeEtudiants, productions, presences, evaluationsSauvegardees
    // pour que le mode démo fonctionne correctement (données isolées par trimestre)
    const CLES_NAMESPACEES = [
        'calendrierComplet',
        'cadreCalendrier',
        'journeesSansCours', // fusion #374 (5 août 2026), ex evenementsPrevus+evenementsImprevus
        'seancesCompletes',
        'horaireHebdo',
        'interventions',
        'indicesAssiduite',
        'indicesCP',
        'snapshots',
        // ✅ Clés liées aux données étudiants (critiques pour le mode démo)
        'groupeEtudiants',
        'productions',
        'presences',
        'evaluationsSauvegardees',
        // ✅ FIX (21 jan 2026) : Ajouter groupesCours et horaires pour cohérence
        // Ces clés étaient utilisées avec namespacing direct (${trimestre}_xxx)
        // mais cle() ne les reconnaissait pas, causant le bug A2025/Démo
        'groupesCours',
        'horaires',
        // 🆕 BETA 96.3 : Module Travaux
        'fichiersTravaux',
        'annotationsTravaux',
        'archivesBundles',
        // 🆕 FIX #69 (6 fév 2026) : Clés manquantes identifiées par audit
        'portfoliosEleves',
        'indicesEvaluation',
        'indicesPatternsRaI',
        'horaireSelectionne',
        'seancesHoraire',
        // 🆕 FIX (17 fév 2026) : Carte mentale doit être namespacée pour le mode démo
        'planification_mindmap',
        // 🆕 #367 (7 août 2026) : notes/étapes des vues leçon. Elle n'avait
        // JAMAIS été namespacée — `cle()` la retournait nue, donc les notes
        // étaient partagées entre tous les trimestres ET avec la démo (sonde
        // Chromium du 4 août). Migration au boot dans main.js
        // (migration_planification_seances_done), qui compose aussi la clé du
        // dictionnaire en `<carteId>::<leconId>` : namespacer sans composer
        // n'aurait réglé que la moitié du rouge D1.
        'planification_seances',
        // 🆕 Lot B (5 sept. 2026) : les collections de paramètres de projection — un jeu
        // NOMMÉ de réglages (modèle, paramètres, paliers), COPIÉ dans un critère au choix.
        // Propriétaire : js/collections-projection.js. Par trimestre, comme les modèles.
        'collectionsProjection',
        // 🆕 #749 (11 sept. 2026) : la liste des élèves suivis du Suivi du groupe.
        // Clé RÉELLE composée : `<trim>_etudiantsSuivis_gc_<groupeCoursId>` (une
        // liste par groupe-cours, tableau-bord-apercu.js : cleEtudiantsSuivis) —
        // même forme que `snapshots` (`<trim>_snapshots_<id>`). Les boucles de
        // copie/migration de ce fichier ne voient donc pas ces clés suffixées,
        // comme pour snapshots ; la clé nue `etudiantsSuivis` d'avant n'est plus
        // que lue (semis), jamais migrée ici.
        'etudiantsSuivis',
        // 🆕 #749 lot 3 (11 sept. 2026) : les dates verrouillées de la saisie des
        // présences. Clé RÉELLE composée : `<trim>_datesVerrouillees_gc_<groupeCoursId>`
        // (saisie-presences.js : cleDatesVerrouillees), même forme qu'`etudiantsSuivis`
        // et `snapshots` — les boucles de copie/migration de ce fichier ne voient pas
        // ces clés suffixées ; la clé nue `datesVerrouillees` d'avant n'est plus que
        // lue (semis, la liste entière), jamais migrée ici.
        'datesVerrouillees',
        // 🆕 #749 lot 3 (11 sept. 2026) : les quatre états d'écran de la saisie des
        // présences (date, sous-groupe, tri, recherche), par trimestre. Inscrits ici
        // pour que `cle()` les préfixe (une clé absente du registre est rendue nue,
        // avec un warn) ; sans semis, et hors de l'inventaire de donnees-v2.js : un
        // état d'écran ne voyage pas.
        'presences_date',
        'presences_groupe',
        'presences_tri',
        'recherchePresences',
        // 🆕 Lot 4 du cadrage 11 (11 sept. 2026, P-2) : les six cases « Inclure … » du
        // rapport du profil, par trimestre (profil-etudiant-rapport.js). Sans semis
        // (de la forme, pas un contenu) ; la nue `preferencesRapport` devient
        // orpheline, connue de diagnostic-353.
        'preferencesRapport',
        // 🆕 #866 (15 sept. 2026) : les notes libres de l'enseignant dans le rapport
        // du profil, un objet { [da]: texte } par trimestre (profil-etudiant-rapport.js).
        // Sans semis : c'est du contenu propre à Grégoire, pas de la forme — le pack
        // démo n'en pose pas, et un trimestre neuf part vide.
        'notesRapport',
        // #913 (17 sept. 2026) : les résultats obtenus APRÈS le trimestre, un objet
        // { [da]: [{ cours, trimestre, note }] } par trimestre. ⚠ #915 lot 3 (18 sept. 2026) :
        // PLUS AUCUN ÉCRIVAIN — la saisie vit dans le registre longitudinal (clé globale). La clé
        // reste au registre parce que le STOCK déjà écrit chez les gens existe : il voyage avec
        // l'archive du trimestre, il est LU par registre-longitudinal.js (reprise) et par
        // exporterFormatRecherche (repli), il n'est ni réécrit ni effacé.
        'resultatsUlterieurs',
        // #1012, l'élève désinscrit (2 oct. 2026) : la trace des DA supprimés, une liste
        // de { da, date } par trimestre. Seul « Supprimer » l'écrit
        // (trimestre-v2-etudiants.js) ; l'import par cases la lit (import-export.js).
        // Sans semis ; elle voyage comme toute clé du trimestre.
        'elevesDesinscrits',
        // 🆕 Corbeille fichiers travaux (4 mars 2026)
        'corbeilleFichiers',
        // 🆕 (24 mai 2026) Pratique de notation active : namespacée par trimestre
        // pour que chaque session conserve sa propre pratique (modèle qui évolue
        // d'un semestre à l'autre — Hybride h2026 vs 4-meilleurs a2025).
        // Migration au boot dans main.js (migration_modalites_namespacees_done).
        'modalitesEvaluation',
        // 🆕 (24 mai 2026) Bibliothèque locale de templates de pratiques :
        // namespacée pour isoler chaque trimestre (modèle C). Le partage
        // inter-utilisateurs passera par la Voûte (future), pas par cette clé.
        // Migration au boot dans main.js (migration_pratiques_namespacees_done).
        'pratiquesConfigurables',
        // 🆕 #358 (Option A — 28 juin 2026) : grilles/échelles de TRAVAIL namespacées
        // par trimestre (chaque session porte ses propres modèles ; import inter-
        // trimestre = COPIE). DÉPLACÉES depuis CLES_GLOBALES (l'« interrupteur »).
        // Peuplement au boot par migrerModelesVersNamespace() (C1,
        // migration_modeles_namespacees_done) AVANT tout lecteur, par USAGE.
        // ⚠ Le catalogue de GABARITS (bibliothequeGrilles/Echelles) reste une
        // collection DISJOINTE, intouchée. Le retrait de la clé globale héritée est
        // la TOUTE DERNIÈRE étape (live, sur backup) — voir PLAN-358 §0bis.
        'grillesTemplates',
        'echellesTemplates',
        // 🆕 #464/CT-26 (21 août 2026) : inventaire exhaustif des clés passées à cle()
        // — ces 15 clés étaient appelées via cle() par leurs modules (intention de
        // namespacing) mais ABSENTES des registres : le fallthrough les rendait NUES,
        // donc partagées entre tous les trimestres ET avec la démo (classe de bug
        // #367 ; rouvre le constat de #365 : le bilan réflexif n'était PAS namespacé).
        // Vérifié clé par clé : AUCUN accès nu direct concurrent (pas de cerveau
        // divisé). Les résidus nus existants sont rapatriés par migrerResidusClesNues().
        'autoreflexionBilan',
        'parcoursBilan',
        'questionnaireBilan',
        'resultatsBilan',
        'chronoEvaluations',
        'confidentielEtudiants',
        'groupeSelectionne',
        'migrationRLO_evals_v1_done',
        'productionsPedagogiques',   // legacy en extinction — sa migration flaguée compose ses deux formes elle-même
        'corbeilleFichiers_backup_v1',
        'evaluationsSauvegardees_backup_v1',
        'fichiersTravaux_backup_v1',
        'migration_snapshot_v1',
        'migration_fichierId_supprime_v1',
        // 🆕 #464 suite de porte (21 août 2026, relevé 2.5) : la file d'attente
        // d'import des travaux (sessionStorage) composait sa clé avec cle(chaîne vide) —
        // qui rend '' — et restait partagée entre trimestres. Clé réelle inscrite.
        'pipeline_queue',
        // 🆕 #464/CT-07 : la durée de période est PAR TRIMESTRE (modèle « horaire
        // propre au trimestre », 29 mai ; DATA-OWNERSHIP la déclarait déjà NS).
        // Rend enfin lues les écritures existantes de purgerLegacy()
        // ({id}_dureePeriode) et du pack démo (demo_dureePeriode). La valeur nue
        // héritée est copiée vers TOUS les trimestres par migrerResidusClesNues().
        'dureePeriode'
    ];

    // 🆕 #464/CT-26 : clés inconnues déjà signalées (un seul warn par clé et par
    // session — cle() est la primitive la plus appelée de l'app).
    const _clesInconnuesSignalees = new Set();

    // Clés globales (partagées entre trimestres)
    // Ces clés ne sont JAMAIS préfixées (sauf si archivées)
    const CLES_GLOBALES = [
        'trimestres',
        'modeApplication',
        'etatsAccordeonsV2',
        'cours',       // Bibliothèque de cours partagée (clé canonique, remplace listeCours)
        'listeCours',  // Legacy — migré vers 'cours' au chargement, conservé pour rétrocompatibilité
        // #915 (17 sept. 2026) : le registre longitudinal traverse les trimestres par
        // construction — un élève, N dossiers figés. Global, jamais préfixé ; survit à
        // supprimerTrimestre (le filtre `includes(id)` ne l'atteint pas). Seul écrivain :
        // js/registre-longitudinal.js.
        'registreLongitudinal',
        // Lot E2 de l'enregistrement (28 sept. 2026) : les profils enseignants sont partagés
        // entre trimestres depuis toujours (lus et écrits sans préfixe). Inscrits ici pour que
        // `sauvegarderDonneesSelonMode('enseignants', …)` — le témoin commun — les écrive au
        // même endroit, sans l'avertissement de cle(). Aucun changement de rangement.
        'enseignants',
        // Lot E3 (28 sept. 2026) : les seuils d'interprétation (Réglages) sont lus et écrits sans
        // préfixe depuis toujours ; même motif que `enseignants`. Aucun changement de rangement.
        'seuilsInterpretation'
    ];

    // ✅ AJOUT (28 janvier 2026) : Templates à copier lors de l'archivage
    // Ces templates globaux sont copiés vers des clés namespacées pour isoler les archives
    const CLES_TEMPLATES_ARCHIVES = [
        'grillesTemplates',
        'echellesTemplates',
        'pratiquesConfigurables'
    ];

    /* ===============================
       REGISTRE DES TRIMESTRES
       =============================== */

    /**
     * Obtient la liste de tous les trimestres, sans doublon d'id.
     *
     * #477 (lot 8, 11 oct. 2026, constat CT-19) : LECTURE SEULE. Les doublons se règlent à la lecture
     * (le premier de chaque id est gardé) ; la liste enregistrée n'est jamais réécrite. Avant, la
     * fonction détectait aussi les noms jumeaux, mais ne dédoublonnait que par id, puis RÉÉCRIVAIT
     * le stockage : deux trimestres de même nom et d'ids différents la faisaient réécrire et avertir
     * à chaque appel (donc à chaque `cle()`), sans jamais converger. Deux noms jumeaux sont deux
     * trimestres : ils restent. (Même prudence qu'`enumererTrimestres` : avant `db-ready`, `getSync`
     * peut rendre une liste périmée ; la persister effacerait des trimestres réels.)
     * @returns {Array} Liste des trimestres (sans doublon d'id)
     */
    function obtenirTrimestres() {
        return dedoublonnerTrimestresParId(db.getSync('trimestres', []));
    }

    /**
     * #477 : le premier trimestre de chaque id, dans l'ordre de la liste. Une liste qui n'en est pas
     * une rend []. Ne modifie pas la liste reçue.
     */
    function dedoublonnerTrimestresParId(trimestres) {
        if (!Array.isArray(trimestres)) return [];
        const idsVus = new Set();
        return trimestres.filter(t => {
            if (!t) return false;
            if (idsVus.has(t.id)) return false;
            idsVus.add(t.id);
            return true;
        });
    }

    /**
     * Énumère les trimestres EXPLOITABLES pour bâtir des clés namespacées.
     *
     * Invariant (#300) : un trimestre sans `id` ne peut porter aucune donnée
     * namespacée — la clé `${id}_suffixe` deviendrait `_suffixe` (mauvais
     * namespace → lectures/écritures muettes hors cible, agrégations amputées).
     * On écarte donc tout trimestre à `id` falsy.
     *
     * LECTURE SEULE, JAMAIS DE RÉÉCRITURE : au démarrage, avant l'évènement
     * `db-ready`, `getSync` peut rendre un localStorage périmé (ids vides) le
     * temps que `syncToLocalStorageCache` réhydrate depuis IndexedDB. Persister
     * la liste filtrée effacerait alors des trimestres réels du stockage. On
     * filtre uniquement la valeur retournée, on ne touche pas au stockage.
     *
     * Tout code qui construit une clé `${trimestre.id}_…` DOIT énumérer via
     * cette fonction plutôt que `db.getSync('trimestres')` directement.
     *
     * @returns {Array} Trimestres dont l'`id` est non vide.
     */
    function enumererTrimestres() {
        // #477 : sans doublon d'id, comme `obtenirTrimestres`.
        return dedoublonnerTrimestresParId(db.getSync('trimestres', [])).filter(t => t && t.id);
    }

    /**
     * Obtient le trimestre actuellement actif
     * @returns {Object|null} Le trimestre actif ou null
     */
    function obtenirTrimestreActif() {
        const trimestres = obtenirTrimestres();
        const actifs = trimestres.filter(t => t.actif === true);

        // 🆕 FIX (9 jan 2026): Si plusieurs trimestres sont actifs, corriger
        if (actifs.length > 1) {
            console.warn(`[Trimestres] ⚠️ ${actifs.length} trimestres actifs détectés, correction...`);
            corrigerTrimestresMultiplesActifs(trimestres);
            // Relire après correction
            return trimestres.find(t => t.actif === true) || null;
        }

        return actifs[0] || null;
    }

    /**
     * Corrige les données quand plusieurs trimestres ont actif=true
     * Garde le trimestre le plus approprié selon la date actuelle
     * 🆕 FIX (9 jan 2026)
     */
    function corrigerTrimestresMultiplesActifs(trimestres) {
        // 🔧 FIX #335 Lot B (11 juin 2026) : l'INTENTION prime sur le calendrier.
        // L'ancienne version choisissait le trimestre suggéré par la DATE DU JOUR
        // même s'il n'était pas marqué actif — en important un codex H2026 en
        // juin, l'app basculait sur Été 2026 et PERSISTAIT ce choix (incident I2
        // du 10 juin). On choisit désormais PARMI les trimestres réellement
        // marqués actifs (l'intention déclarée — celle du codex importé, ou de
        // l'utilisateur) : le plus récent par le tri existant (année décroissante,
        // H > E > A). La date du jour ne décide plus rien ici ; elle ne servirait
        // qu'en l'absence totale d'actif (cas où cette fonction n'est pas appelée).
        const rangSession = s => (s === 'H' ? 2 : s === 'E' ? 1 : 0);
        const plusRecent = (liste) => liste.sort((a, b) => {
            if (b.annee !== a.annee) return b.annee - a.annee;
            return rangSession(b.session) - rangSession(a.session);
        })[0];

        const actifs = trimestres.filter(t => t && t.actif === true && t.id !== 'demo');
        const trimestreAGarder = actifs.length > 0
            ? plusRecent(actifs)
            : plusRecent(trimestres.filter(t => t && t.id !== 'demo'));

        if (trimestreAGarder) {
            // Désactiver tous, activer le bon
            trimestres.forEach(t => t.actif = false);
            trimestreAGarder.actif = true;
            db.setSync('trimestres', trimestres);
        }
    }

    /**
     * Obtient l'ID du trimestre actif (ex: "a2025", "h2026")
     * @returns {string} L'ID du trimestre actif, ou chaîne vide si aucun
     */
    function obtenirTrimestreId() {
        const actif = obtenirTrimestreActif();
        return actif ? actif.id : '';
    }

    /* ===============================
       NAMESPACING DES CLÉS
       =============================== */

    /**
     * Retourne la clé namespacée pour le trimestre actif
     *
     * @param {string} nomCle - Nom de la clé (ex: 'calendrierComplet')
     * @returns {string} Clé namespacée (ex: 'a2025_calendrierComplet')
     *
     * IMPORTANT: Si aucun trimestre n'est actif, retourne la clé originale
     * pour assurer la rétrocompatibilité avec l'ancien format.
     */
    function cle(nomCle) {
        // Obtenir l'ID du trimestre actif
        const trimestreId = obtenirTrimestreId();

        // ✅ AJOUT (28 janvier 2026) : Si trimestre archivé et template global,
        // utiliser la copie archivée si elle existe
        if (trimestreId && estTrimestreArchive()) {
            // Cas 1: Template global (grilles, échelles, pratiques)
            if (CLES_TEMPLATES_ARCHIVES.includes(nomCle)) {
                const cleArchivee = `${trimestreId}_${nomCle}`;
                // Vérifier si la copie archivée existe
                if (db.getSync(cleArchivee, null) !== null) {
                    return cleArchivee;
                }
                // Fallback vers la clé globale si pas de copie (rétrocompatibilité)
            }

            // Cas 2 (cartouches) RETIRÉ par S5/#623 : sous D2-A la famille composée
            // `cartouches_<grilleId>` est namespacée comme toute clé namespacée, y
            // compris hors archive. Le routage général plus bas rend la même valeur,
            // sans le repli SILENCIEUX vers la clé globale — repli qui était la
            // mécanique même du partage entre trimestres que ce lot referme.
        }

        // Vérifier si c'est une clé globale (jamais namespacée sauf archive)
        // ⚠ S5/#623 : `cartouches_<grilleId>` N'EST PLUS ICI. Cette disjonction
        // faisait des cartouches une collection GLOBALE — une seule case pour tous
        // les trimestres. Deux trimestres portant la même grille s'y écrasaient.
        if (CLES_GLOBALES.includes(nomCle)) {
            return nomCle;
        }

        // Si pas de trimestre actif, retourner la clé originale (rétrocompatibilité)
        if (!trimestreId) {
            return nomCle;
        }

        // Vérifier si c'est une clé à namespacer
        if (CLES_NAMESPACEES.includes(nomCle)) {
            return `${trimestreId}_${nomCle}`;
        }

        // S5/#623 — FAMILLE COMPOSÉE `cartouches_<grilleId>`.
        // Elle ne peut pas figurer dans CLES_NAMESPACEES, qui liste des noms fixes :
        // son suffixe est un id de grille. D'où cette branche, qui la traite comme
        // une clé namespacée ordinaire. Pas de vérification d'existence, pas de
        // repli : la migration au boot (js/main.js) garantit la copie, et un repli
        // rendrait le partage entre trimestres possible à nouveau, en silence.
        if (nomCle.startsWith('cartouches_')) {
            return `${trimestreId}_${nomCle}`;
        }

        // Clé non reconnue : fallthrough BRUYANT (#464/CT-26 — le silence de ce
        // chemin est la mécanique commune de #367, CT-07, CT-12, CO-09 : une clé
        // que son appelant CROIT namespacée devient globale de fait, partagée
        // entre trimestres et avec la démo). Un warn par clé et par session.
        if (!_clesInconnuesSignalees.has(nomCle)) {
            _clesInconnuesSignalees.add(nomCle);
            console.warn(`[Trimestres] cle('${nomCle}') : clé ABSENTE des registres CLES_NAMESPACEES/CLES_GLOBALES — rendue nue (non namespacée). Inscrire la clé au registre.`);
        }
        return nomCle;
    }

    /**
     * Retourne la clé de stockage où vivent les données d'un trimestre NOMMÉ,
     * SANS changer le trimestre actif. Helper de LECTURE inter-trimestre (Brique C
     * du namespacing — cadrage C/D §2.2). Miroir de cle() paramétré par une source :
     * répond à « où est la version de nomCle propre au trimestre trimestreSourceId ? »,
     * que ce trimestre soit actif, archivé, ou ni l'un ni l'autre.
     *
     * Le swap du trimestre actif pour lire une autre source est un anti-pattern
     * fragile : ce helper l'évite. Import inter-trimestre = COPIE, source jamais mutée.
     *
     * Routage (calqué sur cle()) :
     *   1. copie namespacée du trimestre source (templates archivés / cartouches) si elle existe ;
     *   2. clé globale partagée (catalogue commun, ex. grilles/échelles non archivées, cours) ;
     *   3. clé namespacée pure (pratiques, modalités, données étudiants) → préfixée par la source ;
     *   4. clé non reconnue → telle quelle.
     *
     * @param {string} nomCle - Nom de la clé (ex: 'grillesTemplates', 'pratiquesConfigurables')
     * @param {string} trimestreSourceId - ID du trimestre source (ex: 'a2025')
     * @returns {string} Clé de stockage du trimestre source pour nomCle
     */
    function cleSource(nomCle, trimestreSourceId) {
        // Garde : sans source explicite, retomber sur le routage du trimestre actif.
        if (!trimestreSourceId) {
            console.warn('[Trimestres] cleSource appelée sans trimestreSourceId — repli sur cle()');
            return cle(nomCle);
        }

        // 1. Copie namespacée du trimestre source (templates archivés ou cartouches) :
        //    si elle existe, c'est la version propre à ce trimestre (cas archivé, ou
        //    futur régime hybride D-D1). Prioritaire sur la clé globale partagée.
        if (CLES_TEMPLATES_ARCHIVES.includes(nomCle)) {
            const cleCopie = `${trimestreSourceId}_${nomCle}`;
            if (db.getSync(cleCopie, null) !== null) {
                return cleCopie;
            }
            // Pas de copie → poursuivre le routage (globale partagée ou namespacée pure).
        }

        // 2. Clé globale partagée (jamais préfixée hors copie d'archivage).
        // ⚠ S5/#623 : `cartouches_<grilleId>` retirée d'ici, comme dans cle().
        if (CLES_GLOBALES.includes(nomCle)) {
            return nomCle;
        }

        // 3. Clé namespacée : emplacement canonique = préfixe du trimestre source.
        if (CLES_NAMESPACEES.includes(nomCle)) {
            return `${trimestreSourceId}_${nomCle}`;
        }

        // 3 bis. S5/#623 — famille composée `cartouches_<grilleId>`, miroir de cle().
        if (nomCle.startsWith('cartouches_')) {
            return `${trimestreSourceId}_${nomCle}`;
        }

        // 4. Clé non reconnue, retourner telle quelle.
        return nomCle;
    }

    /* ===============================
       GESTION DES TRIMESTRES
       =============================== */

    /**
     * Crée un nouveau trimestre
     *
     * @param {string} session - 'A' (Automne), 'H' (Hiver) ou 'E' (Été)
     * @param {string} annee - Année (ex: '2025', '2026')
     * @param {boolean} activerImmediatement - Si true, active ce trimestre
     * @returns {Object} Le trimestre créé
     */
    function creerTrimestre(session, annee, activerImmediatement = false) {
        const id = `${session.toLowerCase()}${annee}`;
        const nom = `${nomSession(session)} ${annee}`;

        const trimestres = obtenirTrimestres();

        // Vérifier si ce trimestre existe déjà
        if (trimestres.find(t => t.id === id)) {
            console.warn(`[Trimestres] Le trimestre ${id} existe déjà`);
            return null;
        }

        // Si on active ce trimestre, désactiver les autres
        if (activerImmediatement) {
            trimestres.forEach(t => t.actif = false);
        }

        const nouveauTrimestre = {
            id: id,
            nom: nom,
            session: session.toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: activerImmediatement
        };

        trimestres.push(nouveauTrimestre);
        db.setSync('trimestres', trimestres);

        return nouveauTrimestre;
    }

    /**
     * Change le trimestre actif
     *
     * @param {string} id - ID du trimestre à activer (ex: 'a2025')
     * @returns {boolean} true si le changement a réussi
     */
    function changerTrimestreActif(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return false;
        }

        // Désactiver tous les trimestres
        trimestres.forEach(t => t.actif = false);

        // Activer le trimestre demandé
        trimestre.actif = true;

        db.setSync('trimestres', trimestres);

        // Synchroniser les trois miroirs du trimestre actif
        // (tableau .actif, window.trimestreActif, clé storage 'trimestreActif')
        window.trimestreActif = id;
        db.setSync('trimestreActif', id);

        // Réinitialiser le contexte : le pointeur `groupeCoursActif` est GLOBAL
        // (non namespacé), donc invalide dès qu'on change de trimestre.
        //
        // #446 (10 août 2026) — la RESTAURATION du bon groupe se fait ensuite,
        // dans `peuplerDropdownGroupeCoursActif` (trimestre-v2-orchestre.js) :
        // c'est le seul endroit qui décide quel groupe devient actif quand le
        // pointeur est invalide, et il choisit désormais celui marqué
        // `actif===true` dans la liste du trimestre (SSOT #130) plutôt que le
        // premier venu. Un seul mécanisme, donc — ne pas en rajouter un ici :
        // deux chemins d'activation, c'est la dette qu'on évite.
        db.setSync('infoCours', null);
        db.setSync('groupeCoursActif', null);

        // 🆕 FIX (21 jan 2026): Créer groupe-cours demo si nécessaire
        // Corrige le bug où les données demo n'étaient pas affichables
        // car le groupe-cours n'existait pas (données chargées avant la correction)
        if (id === 'demo') {
            creerGroupeCoursDemoSiNecessaire();
        }

        // Mettre à jour le bandeau d'archivage après changement
        mettreAJourBandeauArchive();

        // Régénérer le calendrier complet pour le nouveau trimestre
        if (typeof genererCalendrierComplet === 'function') {
            try {
                genererCalendrierComplet();
            } catch (e) {
                console.warn('[Trimestres] Erreur régénération calendrier:', e);
            }
        }

        return true;
    }

    /**
     * Crée le groupe-cours demo si nécessaire
     * 🆕 FIX (21 jan 2026) : Appelée quand on change vers le trimestre demo
     * Corrige le bug où les données demo n'avaient pas de groupe-cours
     */
    function creerGroupeCoursDemoSiNecessaire() {

        // Vérifier si le groupe-cours demo existe
        const cleGC = cle('groupesCours');
        let groupesCours = db.getSync(cleGC, []);
        const gcDemo = groupesCours.find(gc => gc.id === 'GC_DEMO');

        if (gcDemo) {
            return;
        }

        // Créer l'horaire demo si nécessaire
        const cleHoraires = cle('horaires');
        let horaires = db.getSync(cleHoraires, []);
        if (!horaires.find(h => h.id === 'HOR_DEMO')) {
            const nouvelHoraire = {
                id: 'HOR_DEMO',
                nom: 'Lun-AM / Mer-PM',
                periodesParSeance: 2,
                seances: [
                    { jour: 'lundi', periode: 'AM' },
                    { jour: 'mercredi', periode: 'PM' }
                ],
                isDemo: true,
                dateCreation: new Date().toISOString()
            };
            horaires.push(nouvelHoraire);
            db.setSync(cleHoraires, horaires);
        }

        // Récupérer le cours demo depuis listeCours
        const listeCours = db.getSync('cours', []);
        const coursDemo = listeCours.find(c => c.isDemo || c.id?.includes('9999'));
        const coursId = coursDemo?.id || '601-101-h2026-9999';
        const groupeNum = coursDemo?.groupe || '9999';
        const sigle = coursDemo?.sigle || '601-101';

        // Créer le groupe-cours demo
        const nouveauGC = {
            id: 'GC_DEMO',
            nom: `DEMO-${sigle}-MQ-${String(groupeNum).padStart(5, '0')} (Lun-AM / Mer-PM)`,
            trimestreId: 'demo',
            coursId: coursId,
            groupeNum: groupeNum,
            horaireId: 'HOR_DEMO',
            enseignantId: 'profil',
            pratiqueId: null,
            dateCreation: new Date().toISOString(),
            actif: true,
            isDemo: true
        };
        groupesCours.push(nouveauGC);
        db.setSync(cleGC, groupesCours);
    }

    /* ===============================
       ARCHIVAGE DES TRIMESTRES
       =============================== */

    /**
     * Archive un trimestre (fin de session)
     *
     * Un trimestre archivé est en lecture seule et ne peut plus être modifié
     * sans désarchivage explicite.
     *
     * @param {string} id - ID du trimestre à archiver (ex: 'a2025')
     * @returns {Object} Résultat de l'archivage
     */
    function archiverTrimestre(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return { success: false, error: 'Trimestre non trouvé' };
        }

        if (trimestre.archive) {
            console.warn(`[Trimestres] Trimestre déjà archivé: ${id}`);
            return { success: false, error: 'Trimestre déjà clos' };
        }

        if (trimestre.actif) {
            console.error(`[Trimestres] Impossible d'archiver le trimestre actif`);
            return { success: false, error: 'Impossible de clore le trimestre actif. Change de trimestre d\'abord.' };
        }

        // Calculer les statistiques finales
        const stats = calculerStatistiquesFinales(id);

        // 🆕 BETA 96: Créer des snapshots des ressources
        const snapshotResult = creerSnapshotRessources(id);

        // ⚠⚠ S5/#623 — LE REFUS SE LIT AVANT LE GESTE, PAS APRÈS.
        //
        // `creerSnapshotRessources` peut désormais REFUSER (fil de détente : des
        // cartouches vivent encore sous la clé nue, la migration n'a pas eu lieu).
        // Ce refus est une valeur RENDUE, pas une exception : rien ne l'attrape tout
        // seul. Sans cette lecture, la fonction poursuivait et posait `archive = true`
        // avec un snapshot amputé — le refus aurait été décoratif.
        //
        // ⮕ On s'arrête AVANT de toucher au trimestre. Aucun drapeau posé, aucune
        // date de fin écrite : l'état reste exactement celui d'avant l'appel.
        if (snapshotResult && snapshotResult.refus === 'cartouches-non-migrees') {
            if (typeof notifications !== 'undefined' && notifications && notifications.erreur) {
                notifications.erreur(snapshotResult.message);
            }
            return { success: false, refus: snapshotResult.refus, message: snapshotResult.message };
        }

        // Marquer comme archivé
        trimestre.archive = true;
        trimestre.dateFin = new Date().toISOString().split('T')[0];
        trimestre.statistiquesFinales = stats;
        trimestre.snapshotRessources = snapshotResult.success ? snapshotResult.cleSnapshot : null;

        db.setSync('trimestres', trimestres);

        // #1002 (4 oct. 2026, décision de Grégoire) : clore ne télécharge plus de
        // fichier. L'export `trimestre-<id>-archive-<date>.json` n'a aucun lecteur
        // (#1006) ; il reste offert par « Exporter les données » de la bibliothèque.
        return {
            success: true,
            trimestre: trimestre,
            statistiques: stats,
            snapshotRessources: snapshotResult
        };
    }

    /**
     * ✅ AJOUT (28 janvier 2026) : Identifie les templates utilisés par un trimestre
     * Analyse les productions pour trouver les grilles, échelles et pratiques référencées
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} IDs des templates utilisés {grilleIds, echelleIds, pratiqueIds}
     */
    function identifierTemplatesUtilises(trimestreId) {
        // Récupérer les productions du trimestre.
        // #622/B1 : les défauts étaient `[]`, et `[]` est TRUTHY — les deux replis `||`
        // ne s'exécutaient donc JAMAIS et la forme legacy n'était jamais lue. Le défaut
        // est `null` (signature `getSync(key, defaultValue = null)`, db.js:1466) : on
        // ne se rabat que sur une clé réellement ABSENTE. Une clé présente et vide est
        // une réponse, pas un silence.
        const productions = db.getSync(`${trimestreId}_productions`, null)
            || db.getSync(`${trimestreId}_productionsPedagogiques`, null)
            || [];

        // 🆕 C2 (#358) : les ÉVALUATIONS sont la source grade-bearing des modèles
        // réellement utilisés. Le `production.grilleId` est souvent périmé (résidu de
        // contamination inter-trimestre) ; s'en tenir aux productions amputerait le
        // snapshot d'archivage et la migration namespacée des modèles vraiment notés.
        const evaluations = db.getSync(`${trimestreId}_evaluationsSauvegardees`, []) || [];

        // Collecter les IDs des grilles utilisées (productions + évaluations)
        const grilleIds = new Set();
        productions.forEach(p => {
            if (p.grilleId) grilleIds.add(p.grilleId);
        });
        evaluations.forEach(e => {
            if (e && e.grilleId) grilleIds.add(e.grilleId);
        });

        // Collecter les IDs des échelles utilisées (via les grilles ou directement)
        const echelleIds = new Set();
        const grilles = db.getSync('grillesTemplates', []);
        grilles.forEach(g => {
            if (grilleIds.has(g.id) && g.echelleId) {
                echelleIds.add(g.echelleId);
            }
        });
        productions.forEach(p => {
            if (p.echelleId) echelleIds.add(p.echelleId);
        });

        // Collecter les IDs des pratiques utilisées
        const pratiqueIds = new Set();
        productions.forEach(p => {
            if (p.pratiqueId) pratiqueIds.add(p.pratiqueId);
        });

        // 🆕 C2 (#358) : échelles et pratiques référencées DIRECTEMENT par les évals.
        // Dans une évaluation, un `echelleId` préfixé « pratique- » désigne une pratique
        // (cf. evaluation-chargement.js) ; sinon c'est une échelle classique.
        evaluations.forEach(e => {
            if (!e || typeof e.echelleId !== 'string' || !e.echelleId) return;
            if (e.echelleId.startsWith('pratique-')) {
                pratiqueIds.add(e.echelleId.slice('pratique-'.length));
            } else {
                echelleIds.add(e.echelleId);
            }
        });

        // Récupérer aussi les pratiques ACTIVES des groupes-cours du trimestre
        // (#328 L2-a : SSOT `groupesCours[].pratiqueId` — l'ancien miroir
        // `modalitesEvaluation.pratiqueId` ne stockait qu'UNE pratique pour le
        // trimestre alors que chaque groupe-cours a la sienne)
        const groupesCoursTrimestre = db.getSync(`${trimestreId}_groupesCours`, null);
        if (Array.isArray(groupesCoursTrimestre)) {
            groupesCoursTrimestre.forEach(gc => {
                if (gc && gc.pratiqueId) pratiqueIds.add(gc.pratiqueId);
            });
        }

        return { grilleIds, echelleIds, pratiqueIds };
    }

    /**
     * Crée un snapshot (copie) des ressources pédagogiques pour un trimestre
     * 🆕 BETA 96 - Modifié (28 jan 2026) pour copier vers des clés namespacées
     *
     * Cette fonction copie les templates UTILISÉS vers des clés namespacées
     * pour isoler les archives du trimestre actif.
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} Résultat avec cleSnapshot si succès
     */
    function creerSnapshotRessources(trimestreId) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleSnapshot = `snapshot_${trimestreId}_${timestamp}`;

            // ✅ AJOUT (28 jan 2026) : Identifier les templates utilisés
            const { grilleIds, echelleIds, pratiqueIds } = identifierTemplatesUtilises(trimestreId);

            // Récupérer les modèles de travail du trimestre concerné.
            // #358 Option A : la source des grilles/échelles est la copie namespacée
            // `${trimestreId}_grillesTemplates` (peuplée par C1 au boot et maintenue par
            // les writers `cle()`).
            // #622/B3 : `cle()` route par le trimestre ACTIF, et on ne peut archiver
            // qu'un trimestre NON actif (garde plus haut dans archiverTrimestre) :
            // lire les pratiques par `cle()` garantissait de lire un AUTRE trimestre,
            // puis d'écrire le résultat sous celui qu'on archive. Le trimestre archivé
            // est nommé — on lit son namespace explicitement, comme les deux autres.
            const toutesGrilles   = db.getSync(`${trimestreId}_grillesTemplates`, []);
            const toutesEchelles  = db.getSync(`${trimestreId}_echellesTemplates`, []);
            const toutesPratiques = db.getSync(`${trimestreId}_pratiquesConfigurables`, null) || [];

            // Quels modèles ont réellement servi. Cette information reste utile
            // (statistiques finales, futur élagage EXPLICITE) — ce qui était fautif,
            // c'est de s'en servir pour ÉCRIRE. Elle part désormais en métadonnée du
            // snapshot, et nulle part ailleurs.
            const grillesUtilisees = toutesGrilles.filter(g => grilleIds.has(g.id));
            const echellesUtilisees = toutesEchelles.filter(e => echelleIds.has(e.id));
            const pratiquesUtilisees = toutesPratiques.filter(p => pratiqueIds.has(p.id));

            // #622/B1 — RETIRÉ : les trois `db.setSync` qui réécrivaient les clés de
            // TRAVAIL avec le sous-ensemble filtré. Écrites en janvier 2026, quand
            // `<id>_*Templates` étaient des copies d'archive neuves ; depuis #358
            // (28 juin 2026) ce sont les collections VIVANTES du trimestre. Archiver
            // retirait donc du stockage tout modèle non « utilisé », sans copie de
            // secours — le snapshot ci-dessous n'enregistrait que les survivants.
            // Mesuré sur les données réelles (#630) : archiver Hiver 2026 détruisait
            // ses dix pratiques, l'intersection avec le trimestre actif étant vide.
            // L'archivage est désormais une LECTURE : il n'écrit que le snapshot.

            // Cartouches des grilles utilisées — RÉÉCRIT par S5/#623.
            //
            // AVANT : la boucle lisait la clé NUE `cartouches_<grilleId>` (collection
            // globale) et en ÉCRIVAIT une copie sous `<trimestreId>_cartouches_<id>`.
            // Sous D2-A cette copie n'a plus lieu d'être : la donnée du trimestre vit
            // DÉJÀ sous la clé namespacée. L'écrire reviendrait à la copier sur
            // elle-même, et lire la clé nue reviendrait à ramasser ce qui reste d'un
            // régime que ce lot supprime.
            //
            // ⚠ L'ARCHIVAGE RESTE UNE LECTURE (#622/B1) : rien n'est écrit ici.
            const cartouchesSnapshot = {};
            const grillesNonMigrees = [];
            grilleIds.forEach(grilleId => {
                // ⚠ `cleSource`, PAS `cle`. `cle()` route par le trimestre ACTIF ;
                // cette fonction reçoit `trimestreId` en PARAMÈTRE et peut archiver un
                // trimestre qui n'est pas l'actif. Router par l'actif lirait alors les
                // cartouches du mauvais trimestre — un snapshot juste en apparence,
                // rempli des données d'un autre. C'est exactement la question à
                // laquelle `cleSource` répond : « où vit cette clé POUR ce trimestre ».
                const cartouches = db.getSync(cleSource(`cartouches_${grilleId}`, trimestreId), []);
                if (cartouches.length > 0) {
                    cartouchesSnapshot[grilleId] = cartouches;
                    return;
                }

                // ⚠⚠ FIL DE DÉTENTE S5/#623 — L'ÉTAT « ENCORE SOUS CLÉ NUE ».
                //
                // Rien sous la clé namespacée. Deux causes possibles, et elles ne se
                // traitent pas pareil : soit cette grille n'a réellement aucune
                // cartouche (cas normal, on n'écrit rien), soit la migration au boot
                // n'a pas tourné et la donnée vit ENCORE sous la clé nue.
                //
                // Dans le second cas, se taire produirait un snapshot d'archivage
                // AMPUTÉ de ses cartouches — sans erreur, sans message. Or l'archivage
                // est le filet de la suppression définitive : le trou ne se verrait
                // qu'au moment de rouvrir, quand il est trop tard.
                //
                // On ne se rabat PAS non plus sur la clé nue en silence : un repli
                // discret rendrait une migration ratée indétectable, ce qui est
                // exactement le défaut que ce lot referme.
                //
                // ⮕ Donc on MESURE la différence, et on la DIT. Un code qui ne peut
                // pas faire ce qu'on lui demande doit le dire.
                const restee = db.getSync(`cartouches_${grilleId}`, []);
                if (Array.isArray(restee) && restee.length > 0) {
                    grillesNonMigrees.push(grilleId);
                }
            });

            // Refus BRUYANT plutôt que snapshot amputé. Après la migration du volet (b),
            // cet état n'existe plus : si ce refus se déclenche, c'est que la migration
            // a échoué — et c'est ce qu'il faut apprendre MAINTENANT, pas au
            // désarchivage.
            if (grillesNonMigrees.length > 0) {
                const details = grillesNonMigrees.join(', ');
                console.error(
                    `[Trimestres] ARCHIVAGE REFUSÉ pour ${trimestreId} : les cartouches de ` +
                    `${grillesNonMigrees.length} grille(s) vivent encore sous la clé NUE ` +
                    `(${details}). La migration des cartouches n'a pas eu lieu pour ce ` +
                    `trimestre. Archiver maintenant produirait un snapshot SANS ces ` +
                    `cartouches. Recharger l'application (la migration s'exécute au ` +
                    `démarrage), puis réessayer.`
                );
                return {
                    success: false,
                    refus: 'cartouches-non-migrees',
                    grilles: grillesNonMigrees,
                    message: `Clôture refusée : les cartouches de ${grillesNonMigrees.length} ` +
                             `grille(s) (${details}) n'ont pas encore été migrées. ` +
                             `Recharge l'application, puis réessaie.`
                };
            }

            // Ressources pour le snapshot (backup complet)
            const ressources = {
                // #622/B1 : `getSync` sans valeur par défaut rend `null` — le repli sur
                // la clé NUE `productions` était donc ATTEIGNABLE, et le snapshot
                // pouvait enregistrer, sous le nom du trimestre archivé, le contenu
                // d'une clé partagée entre trimestres. Le snapshot d'un trimestre ne
                // lit que le namespace de ce trimestre.
                productions: db.getSync(`${trimestreId}_productions`, []),
                // #622/B1 : le snapshot enregistrait le sous-ensemble filtré — il ne
                // pouvait donc rien restaurer de ce que l'archivage venait de retirer,
                // alors que son propre commentaire annonce un « backup complet ». Il
                // enregistre désormais les collections COMPLÈTES, et les cartouches
                // elles-mêmes plutôt que leur compte : un nombre ne restaure rien.
                grilles:    toutesGrilles,
                echelles:   toutesEchelles,
                pratiques:  toutesPratiques,
                cartouches: cartouchesSnapshot,
                utilises: {
                    grilleIds:   Array.from(grilleIds),
                    echelleIds:  Array.from(echelleIds),
                    pratiqueIds: Array.from(pratiqueIds)
                },
                _meta: {
                    trimestreId: trimestreId,
                    dateCreation: new Date().toISOString(),
                    version: 'Beta 96',
                    isolationArchive: true
                }
            };

            // Sauvegarder le snapshot (backup)
            db.setSync(cleSnapshot, ressources);

            return {
                success: true,
                cleSnapshot: cleSnapshot,
                // #622/B1 : le résumé comptait les SURVIVANTS du filtre en les
                // nommant comme le contenu du snapshot. Chiffres exacts, libellé
                // faux — et c'est ce libellé qui a fait croire pendant sept mois
                // que le backup était complet. Il compte désormais ce que le
                // snapshot contient VRAIMENT, et dit à part combien ont servi.
                resume: {
                    productions: ressources.productions.length,
                    grilles: toutesGrilles.length,
                    echelles: toutesEchelles.length,
                    pratiques: toutesPratiques.length,
                    // S5/#623 : `nbCartouchesCopies` retiré avec la copie qu'il comptait.
                    // Le rapport dit désormais combien de GRILLES portent des cartouches
                    // dans le snapshot — l'archivage ne copiant plus rien, un « nombre de
                    // cartouches copiées » n'aurait plus de référent.
                    cartouches: Object.keys(cartouchesSnapshot).length,
                    utilises: {
                        grilles: grillesUtilisees.length,
                        echelles: echellesUtilisees.length,
                        pratiques: pratiquesUtilisees.length
                    }
                }
            };
        } catch (error) {
            console.error('[Trimestres] Erreur création snapshot:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🆕 C1 (#358) — Peuple la copie namespacée `<trim>_<nomCle>` d'UN trimestre
     * à partir des modèles réellement utilisés. ADDITIF (ne retire jamais),
     * IDEMPOTENT (n'écrit que s'il y a un ajout), SOURCE EXACTE (copie byte-à-byte
     * depuis la copie locale existante puis la clé globale).
     *
     * @param {string} trimestreId
     * @param {string} nomCle - 'grillesTemplates' ou 'echellesTemplates'
     * @param {Set<string>} idsUtilises - ids des modèles utilisés (cf. identifierTemplatesUtilises)
     * @returns {{total:number, ajoutes:number, introuvables:string[]}}
     */
    function _peuplerCopieModeleNamespace(trimestreId, nomCle, idsUtilises) {
        const copieExistante = db.getSync(`${trimestreId}_${nomCle}`, []) || [];
        const globalModeles = db.getSync(nomCle, []) || [];
        const parId = new Map(copieExistante.map(m => [m.id, m]));
        const ajoutes = [];
        const introuvables = [];
        idsUtilises.forEach(id => {
            if (!id || parId.has(id)) return;            // déjà présent dans la copie locale
            const modele = globalModeles.find(m => m && m.id === id);
            if (modele) { parId.set(id, modele); ajoutes.push(id); }
            else introuvables.push(id);                  // ni copie ni global → référence déjà cassée (pré-existante)
        });
        if (ajoutes.length > 0) {
            db.setSync(`${trimestreId}_${nomCle}`, [...parId.values()]);
        }
        return { total: parId.size, ajoutes: ajoutes.length, introuvables };
    }

    /**
     * 🆕 C1 (#358) — Socle de la migration Option A des modèles. Peuple les copies
     * namespacées `<trim>_grillesTemplates` / `<trim>_echellesTemplates` de CHAQUE
     * trimestre vivant à partir des modèles RÉELLEMENT utilisés (productions +
     * évaluations grade-bearing, via `identifierTemplatesUtilises` corrigé par C2).
     *
     * Une fois ces copies complètes, basculer `cle()` vers le régime namespacé
     * préserve chaque note (invariant vérifié par
     * `tests/unit/sentinelle-integrite-migration-modeles-358.test.js`).
     *
     * NON-INTRUSIF : ne touche NI au catalogue `bibliothequeGrilles/Echelles`, NI à
     * la clé globale, NI au registre `CLES_GLOBALES`/`CLES_NAMESPACEES`. Le
     * déplacement du registre (l'interrupteur), le re-pointage des lecteurs bruts et
     * le retrait du global forment un BLOC COORDONNÉ ultérieur — cette fonction n'est
     * pas encore appelée au boot (câblage avec ce bloc, flag idempotent en dernier).
     *
     * @returns {{trimestres: Object}} rapport par trimestre/famille
     */
    /**
     * S5/#623 — MIGRATION DES CARTOUCHES VERS LE NAMESPACE DE LEUR TRIMESTRE.
     *
     * AVANT : `cartouches_<grilleId>` était une clé GLOBALE. Tous les trimestres
     * lisaient et écrivaient la même case ; deux trimestres portant la même grille
     * s'écrasaient mutuellement, en silence.
     *
     * APRÈS : chaque trimestre a ses propres `<trimestreId>_cartouches_<grilleId>`.
     *
     * POURQUOI ON COPIE VERS **CHAQUE** TRIMESTRE, et non vers un seul. Aujourd'hui
     * tous voient la collection globale ; leur donner à tous la même copie préserve
     * donc EXACTEMENT ce que chacun affichait. Ils divergeront ensuite, chacun de son
     * côté — ce qui est le but. Écrire la copie dans un seul trimestre ferait
     * disparaître les cartouches de tous les autres.
     *
     * ⚠ CETTE MIGRATION SUPPRIME LES CLÉS NUES, ET IL N'Y A AUCUNE ANNULATION.
     * D'où l'ordre strict : copier → DRAINER → RELIRE chaque copie et la comparer à
     * sa source → et seulement alors supprimer. Une copie qui ne se relit pas
     * interrompt tout : rien n'est supprimé, le drapeau n'est pas posé, et le prochain
     * démarrage réessaie (la fonction est idempotente).
     *
     * @returns {Promise<Object>} rapport { migrees, trimestres, nuesSupprimees, echecs }
     */
    async function migrerCartouchesVersNamespace() {
        const rapport = { migrees: 0, trimestres: 0, nuesSupprimees: 0, echecs: [] };

        const trimestres = enumererTrimestres();
        if (trimestres.length === 0) return rapport;

        // 1. Recenser les clés NUES `cartouches_<grilleId>`.
        //
        // ⚠ UNE CLAUSE A ÉTÉ RETIRÉE ICI, ET SON RETRAIT EST DÉLIBÉRÉ. La première
        // version filtrait aussi `!prefixes.some(pfx => k.startsWith(pfx))`, censée
        // empêcher qu'une clé déjà namespacée soit reprise et redouble son préfixe.
        // Mesuré par break-test (kuekatsheu-4c, 31 août 2026) : la neutraliser laisse
        // les 10 cas VERTS. Elle ne protégeait de rien — une clé qui commence par
        // `h2026_` ne commence pas par `cartouches_`, donc la condition ci-dessous
        // l'écarte déjà. Les deux ne pouvaient être vraies ensemble que pour un
        // trimestre dont l'id serait littéralement `cartouches`.
        //
        // ⮕ Et dans ce cas dégénéré, elle était NUISIBLE : son préfixe `cartouches_`
        // aurait exclu TOUTES les clés nues, et la migration n'aurait rien fait, en
        // silence. Une garde qui ne garde rien et qui casse dans son seul cas
        // d'application n'est pas une ceinture : c'est un alibi.
        //
        // La protection réelle contre le double préfixe est le `startsWith` ci-dessous.
        const clesNues = (db.keysSync() || []).filter(k =>
            typeof k === 'string' && k.startsWith('cartouches_')
        );
        if (clesNues.length === 0) return rapport;

        // 2. COPIER vers chaque trimestre. Idempotent : une copie déjà présente et non
        //    vide n'est pas écrasée — un second passage ne doit pas détruire le travail
        //    fait depuis la première migration.
        clesNues.forEach(cleNue => {
            const valeur = db.getSync(cleNue, null);
            if (!Array.isArray(valeur) || valeur.length === 0) return;
            trimestres.forEach(tr => {
                const cible = `${tr.id}_${cleNue}`;
                const dejaLa = db.getSync(cible, null);
                if (Array.isArray(dejaLa) && dejaLa.length > 0) return;
                db.setSync(cible, valeur);
                rapport.migrees++;
            });
        });
        rapport.trimestres = trimestres.length;

        // 3. DRAINER avant de vérifier. Sans ce flush, on relirait le cache et non ce
        //    qui est réellement durable — et on supprimerait la source sur la foi
        //    d'une écriture qui n'a pas atterri.
        if (db && typeof db.flush === 'function') {
            await db.flush();
        }

        // 4. RELIRE chaque copie et la comparer à sa source. C'est la condition de la
        //    suppression, et elle porte sur CHAQUE trimestre : il suffit d'une copie
        //    manquante pour qu'on renonce à supprimer la clé nue.
        clesNues.forEach(cleNue => {
            const source = db.getSync(cleNue, null);
            if (!Array.isArray(source) || source.length === 0) return;
            const manquantes = trimestres.filter(tr => {
                const copie = db.getSync(`${tr.id}_${cleNue}`, null);
                return !Array.isArray(copie) || copie.length === 0;
            }).map(tr => tr.id);
            if (manquantes.length > 0) {
                rapport.echecs.push({ cle: cleNue, trimestresSansCopie: manquantes });
            }
        });

        // 5. Un seul échec suffit à tout retenir. On ne supprime PAS partiellement :
        //    un état mi-migré est plus difficile à diagnostiquer qu'un état non migré,
        //    et le fil de détente de `creerSnapshotRessources` sait reconnaître ce
        //    dernier.
        if (rapport.echecs.length > 0) {
            console.error(
                `[Trimestres] Migration des cartouches INTERROMPUE : ${rapport.echecs.length} ` +
                `clé(s) n'ont pas pu être recopiées dans tous les trimestres. Aucune clé nue ` +
                `n'a été supprimée, rien n'est perdu, et la migration sera retentée au ` +
                `prochain démarrage.`, rapport.echecs
            );
            return rapport;
        }

        // 6. Supprimer les clés nues. C'est le geste irréversible, et il n'a lieu que
        //    lorsque chaque copie a été relue.
        clesNues.forEach(cleNue => {
            const source = db.getSync(cleNue, null);
            if (!Array.isArray(source) || source.length === 0) return;
            db.removeSync(cleNue);
            rapport.nuesSupprimees++;
        });

        return rapport;
    }

    function migrerModelesVersNamespace() {
        const rapport = { trimestres: {} };
        const trimestres = obtenirTrimestres().filter(t => t && t.id);
        trimestres.forEach(t => {
            const { grilleIds, echelleIds } = identifierTemplatesUtilises(t.id);
            const grilles = _peuplerCopieModeleNamespace(t.id, 'grillesTemplates', grilleIds);
            const echelles = _peuplerCopieModeleNamespace(t.id, 'echellesTemplates', echelleIds);
            rapport.trimestres[t.id] = { grilles, echelles };
            if (grilles.introuvables.length || echelles.introuvables.length) {
                console.warn(`[Migration modèles #358] ${t.id} : références sans définition globale ` +
                    `(pré-existantes, ignorées) — grilles ${JSON.stringify(grilles.introuvables)} · ` +
                    `échelles ${JSON.stringify(echelles.introuvables)}`);
            }
        });
        return rapport;
    }

    /**
     * 🆕 G4 (#358) — Vidage de la clé GLOBALE héritée `grillesTemplates`/`echellesTemplates`.
     * TOUTE DERNIÈRE étape de la migration Option A : appelée au boot APRÈS
     * migrerModelesVersNamespace (même bloc flaggé `migration_modeles_namespacees_done`),
     * une fois les copies `<trim>_*` peuplées et tous les lecteurs re-pointés vers
     * cle()/le pool. Le global n'a plus de lecteur → zéro-dette, on le retire.
     *
     * PRÉSERVATION DES DONNÉES (contrainte non négociable — cf. CLAUDE.md) : on ne
     * retire du global QUE les modèles REDONDANTS, ceux dont l'id est déjà capturé
     * dans une copie de travail `<trim>_<nomCle>` (union pool). Un modèle global
     * orphelin — présent NULLE PART ailleurs, sans trimestre propriétaire — est
     * CONSERVÉ dans le global et journalisé, jamais perdu silencieusement. Cas
     * nominal (tout capturé) : la clé globale est entièrement retirée.
     *
     * IDEMPOTENT : un global déjà vide/absent → no-op. NON-INTRUSIF pour le catalogue
     * de gabarits (`bibliothequeGrilles/Echelles`) — collection DISJOINTE, intouchée.
     *
     * @returns {{grilles:Object, echelles:Object}} rapport {retires, conserves, orphelins[]} par famille
     */
    function viderModelesGlobalHerite() {
        function viderUneFamille(nomCle) {
            const globalModeles = db.getSync(nomCle, null);
            if (!Array.isArray(globalModeles) || globalModeles.length === 0) {
                // Déjà vide ou jamais peuplé : retirer la clé si elle traîne, sinon no-op.
                if (globalModeles !== null && globalModeles !== undefined) db.removeSync(nomCle);
                return { retires: 0, conserves: 0, orphelins: [] };
            }
            // Ids capturés dans la copie de travail d'un trimestre quelconque (pool).
            const captures = new Set(
                _toutesModelesTravail(nomCle).map(m => m && m.id).filter(Boolean)
            );
            const orphelins = globalModeles.filter(m => m && m.id && !captures.has(m.id));
            const retires = globalModeles.length - orphelins.length;
            if (orphelins.length === 0) {
                db.removeSync(nomCle);
            } else {
                // security-ok: filtre d'une collection DÉJÀ stockée (conserve les orphelins non capturés), aucune donnée externe.
                db.setSync(nomCle, orphelins);
                console.warn(`[Migration modèles #358] ${nomCle} : ${retires} modèle(s) redondant(s) retiré(s) du global ; ` +
                    `${orphelins.length} orphelin(s) NON capturé(s) CONSERVÉ(s) (sans trimestre propriétaire) : ` +
                    JSON.stringify(orphelins.map(m => m.id)));
            }
            return { retires, conserves: orphelins.length, orphelins: orphelins.map(m => m.id) };
        }
        return {
            grilles: viderUneFamille('grillesTemplates'),
            echelles: viderUneFamille('echellesTemplates')
        };
    }

    /**
     * 🆕 #358 (Option A) — Union DÉDUPLIQUÉE des modèles de TRAVAIL (`<trim>_<nomCle>`)
     * de TOUS les trimestres vivants. Source des sites POOL_INTER_TRIMESTRE (inventaires
     * « toutes mes grilles », compteurs, lookup-par-id de suppression). N'inclut PAS le
     * catalogue de GABARITS (`bibliothequeGrilles/Echelles`) — collection DISJOINTE.
     * Dédup par id, PREMIER GAGNANT (l'ordre de obtenirTrimestres() départage les rares
     * collisions d'id à contenu divergent — cf. PLAN-358 §1, D-D6).
     * @param {'grillesTemplates'|'echellesTemplates'} nomCle
     * @returns {Array<Object>}
     */
    function _toutesModelesTravail(nomCle) {
        const parId = new Map();
        obtenirTrimestres().forEach(t => {
            if (!t || !t.id) return;
            const liste = db.getSync(`${t.id}_${nomCle}`, []) || [];
            liste.forEach(m => { if (m && m.id && !parId.has(m.id)) parId.set(m.id, m); });
        });
        return [...parId.values()];
    }
    function toutesGrillesTravail() { return _toutesModelesTravail('grillesTemplates'); }
    function toutesEchellesTravail() { return _toutesModelesTravail('echellesTemplates'); }

    /**
     * 🆕 #358 (Option A) — Résout UN modèle (grille/échelle) PAR ID en régime namespacé :
     * 1) copie du trimestre ACTIF (cle()), 2) REPLI sur l'union inter-trimestre. Un id
     * grade-bearing doit rester résoluble même s'il a été créé dans un autre trimestre
     * (ex. grille de dépistage h2026 consultée depuis a2025). NE consulte PAS le catalogue
     * de gabarits. Remplace les lectures `db.getSync('grillesTemplates'/'echellesTemplates')`
     * suivies d'un `.find(id)` aux sites de résolution-par-id (pratique-
     * registre, pan-standards). Retourne l'objet modèle ou null.
     *
     * ⮕ #590 (option A de Grégoire, 28 août 2026) — L'ANCIEN IDENTIFIANT D'UNE ÉCHELLE
     * EST RECONNU. Une échelle importée porte un id neuf et garde l'ancien dans
     * `idOriginal` ; ce qui a été écrit avant l'import pointe l'ancien. Ce résolveur ne
     * comparait que `m.id` quand `obtenirEchelleResolue` lisait aussi `idOriginal` : un
     * même identifiant résolvait selon l'appelant. Ordre : l'id exact avant
     * `idOriginal`, le trimestre actif avant le pool. `obtenirEchelleResolue` se replie
     * ici : une seule règle pour les deux.
     * ⚠ Les GRILLES n'apprennent pas `idOriginal` : des évaluations d'H2026 pointent des
     * grilles absentes, et les rattacher changerait des notes déjà remises.
     * @param {'grille'|'echelle'} type
     * @param {string} id
     * @returns {Object|null}
     */
    function resoudreModeleParId(type, id) {
        if (!id) return null;
        const nomCle = type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates';
        const chercher = (liste) => liste.find(m => m && m.id === id)
            || (type === 'echelle' ? liste.find(m => m && m.idOriginal === id) : null)
            || null;
        const actif = db.getSync(cle(nomCle), []) || [];
        return chercher(actif) || chercher(_toutesModelesTravail(nomCle));
    }

    /**
     * Désarchive un trimestre (permet modifications à nouveau)
     *
     * @param {string} id - ID du trimestre à désarchiver
     * @returns {Object} Résultat du désarchivage
     */
    function desarchiverTrimestre(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = trimestres.find(t => t.id === id);

        if (!trimestre) {
            console.error(`[Trimestres] Trimestre non trouvé: ${id}`);
            return { success: false, error: 'Trimestre non trouvé' };
        }

        if (!trimestre.archive) {
            console.warn(`[Trimestres] Trimestre pas archivé: ${id}`);
            return { success: false, error: 'Trimestre non clos' };
        }

        // Retirer le flag archivé
        trimestre.archive = false;
        delete trimestre.dateFin;
        // Conserver statistiquesFinales comme référence historique

        db.setSync('trimestres', trimestres);

        // 🆕 FIX #359 (26 juin 2026) : purger les copies namespacées posées à
        // l'archivage (creerSnapshotRessources) qui REDEVIENNENT orphelines une fois
        // `archive` retiré — celles dont cle() retombe sur une clé GLOBALE partagée
        // (cartouches ; et, avant Option A, grilles/échelles). Place perdue (cf. #353
        // quota saturé) et, pire, source de cartouches périmées si ré-archivage.
        // ⚠ RÉCONCILIATION #358 (Option A) : grilles/échelles ne sont PLUS purgées —
        // namespacées, `<id>_grillesTemplates` est la donnée VIVANTE du trimestre
        // désarchivé. purgerCopiesModelesArchive dérive la condition du registre
        // (CLES_GLOBALES). Le snapshot de sauvegarde `snapshot_<id>_*` est CONSERVÉ.
        const copiesPurgees = purgerCopiesModelesArchive(id);

        return { success: true, trimestre: trimestre, copiesPurgees: copiesPurgees };
    }

    /**
     * 🆕 FIX #359 (26 juin 2026) : retire les copies de modèles namespacées qu'un
     * archivage (creerSnapshotRessources) a posées pour un trimestre — opération
     * symétrique de cette création. À appeler au désarchivage : hors mode archive,
     * cle() ne lit plus ces copies, qui ne sont donc plus que des orphelins.
     * ⮕ Vaut pour les MODÈLES (grilles, échelles, pratiques). PAS pour les cartouches
     * depuis S5/#623 — voir l'avertissement plus bas.
     *
     * NE TOUCHE PAS au snapshot de sauvegarde `snapshot_<id>_*` : c'est un backup
     * historique délibéré, pointé par `trimestre.snapshotRessources`.
     *
     * ⚠ S5/#623 — CETTE FONCTION NE TOUCHE PLUS AUX CARTOUCHES, et ce n'est pas un
     * oubli. Elle re-dérivait leurs grilleIds par identifierTemplatesUtilises(id) pour
     * purger `<id>_cartouches_<grilleId>`. Sous D2-A ces clés ne sont plus des copies :
     * ce sont les cartouches MÊMES du trimestre. Les purger au désarchivage les
     * détruirait. La branche a été retirée ; voir le bloc commenté dans le corps.
     *
     * removeSync
     * retire la clé de toutes les couches (localStorage + cache + IDB), donc un orphelin
     * refoulé en IDB-seul par la saturation (#353) est bien nettoyé.
     *
     * @param {string} id - ID du trimestre désarchivé
     * @returns {Array<string>} Clés effectivement retirées (présentes avant la purge)
     */
    function purgerCopiesModelesArchive(id) {
        const clesRetirees = [];
        const retirer = (cleComplete) => {
            if (db.getSync(cleComplete, null) !== null) {
                db.removeSync(cleComplete);
                clesRetirees.push(cleComplete);
            }
        };

        // 🆕 #358 (réconciliation #359) : ne purger que les copies qui REDEVIENNENT
        // ORPHELINES au désarchivage — celles dont cle() retombe sur la clé GLOBALE
        // partagée une fois `archive` retiré. Après Option A, grillesTemplates/
        // echellesTemplates ont rejoint CLES_NAMESPACEES : `<id>_grillesTemplates` est
        // désormais la donnée VIVANTE du trimestre (lue par cle() hors archive) → NE
        // PLUS la purger (sinon perte de notes). pratiquesConfigurables était déjà
        // namespacé (même invariant). La condition est dérivée du REGISTRE
        // (CLES_GLOBALES) et non d'un flag : elle s'auto-ajuste au déplacement du registre.
        CLES_TEMPLATES_ARCHIVES
            .filter(nomCle => CLES_GLOBALES.includes(nomCle))
            .forEach(nomCle => retirer(`${id}_${nomCle}`));

        // ⛔ BRANCHE CARTOUCHES RETIRÉE PAR S5/#623 — NE PAS LA REMETTRE.
        //
        // Elle purgeait `<id>_cartouches_<grilleId>` au désarchivage. Ce geste était
        // CORRECT tant que les cartouches étaient globales : la copie namespacée
        // n'était qu'un doublon, et le trimestre désarchivé retrouvait la collection
        // globale intacte.
        //
        // Sous D2-A la même ligne DÉTRUIT DES DONNÉES VIVANTES : `<id>_cartouches_<x>`
        // n'est plus une copie, c'est la SEULE cartouche du trimestre. La purger, c'est
        // les perdre — sans erreur, sans message, au moment précis où l'utilisateur
        // croit rouvrir son trimestre.
        //
        // ⚠ C'est mot pour mot la perte que #358/#359 ont corrigée pour les grilles.
        // Verrouillé par `tests/unit/sentinelle-623-s5-cartouches-namespacees.test.js` :
        // remettre cette boucle rend ROUGE le cas « les cartouches d'A2025 survivent à
        // archivage PUIS désarchivage ».
        //
        // ⮕ Rien ne remplace cette boucle : il n'y a plus de copie à purger.

        return clesRetirees;
    }

    /**
     * Vérifie si le trimestre actif est archivé (mode lecture seule)
     * @returns {boolean} true si le trimestre actif est archivé
     */
    function estTrimestreArchive() {
        const actif = obtenirTrimestreActif();
        return actif ? actif.archive === true : false;
    }

    /**
     * Calcule les statistiques finales d'un trimestre pour l'archivage
     *
     * @param {string} trimestreId - ID du trimestre
     * @returns {Object} Statistiques calculées
     */
    function calculerStatistiquesFinales(trimestreId) {
        try {
            // Obtenir les cours liés à ce trimestre
            const listeCours = db.getSync('cours', []);
            const coursTrimestr = listeCours.filter(c => c.trimestreId === trimestreId);

            if (coursTrimestr.length === 0) {
                return { nbEtudiants: 0, nbCours: 0, message: 'Aucun cours trouvé' };
            }

            // Statistiques globales - lire directement depuis le trimestre ciblé
            const etudiants = db.getSync(`${trimestreId}_groupeEtudiants`, []);
            const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

            return {
                nbEtudiants: etudiantsActifs.length,
                nbCours: coursTrimestr.length,
                dateCalcul: new Date().toISOString().split('T')[0]
            };
        } catch (error) {
            console.error('[Trimestres] Erreur calcul statistiques:', error);
            return { error: error.message };
        }
    }

    /* ===============================
       SUPPRESSION DÉFINITIVE D'UN TRIMESTRE (#361)
       =============================== */

    /**
     * 🆕 #361 (2 juillet 2026) : supprime DÉFINITIVEMENT un trimestre et toutes
     * ses données. Contrairement à l'archivage (lecture seule, données
     * conservées), la suppression EFFACE. Logique éprouvée par le snippet
     * console utilisé pour e2026/a2024 le 28 juin 2026 (cf. BACKLOG #361).
     *
     * Garde-fous :
     *  - JAMAIS le trimestre ACTIF (garde anti-actif, sentinelle Vitest) ;
     *  - énumération des clés = UNION de db.keys() (IndexedDB), localStorage
     *    et db.memoryCache — db.keys() ne rend QUE l'IDB, les petites clés
     *    localStorage seraient ratées sinon ;
     *  - `await db.remove(k)` par clé (couvre localStorage + IDB + memoryCache) ;
     *  - retrait de l'entrée du registre `trimestres` (jamais balayé par le
     *    filtre de clés) + nettoyage des items du global `cours` ;
     *  - `db.flush()` final (durabilité Option A/B/C).
     *
     * @param {string} id - ID du trimestre à supprimer (ex: 'a2024')
     * @returns {Promise<Object>} { success, nbCles?, nom?, error? }
     */
    async function supprimerTrimestre(id) {
        const trimestres = obtenirTrimestres();
        const trimestre = id ? trimestres.find(t => t && t.id === id) : null;

        if (!trimestre) {
            return { success: false, error: 'Trimestre non trouvé' };
        }

        // GARDE ANTI-ACTIF : le trimestre actif porte l'espace de travail
        // courant — sa suppression détruirait la session en cours.
        const actif = obtenirTrimestreActif();
        if ((actif && actif.id === id) || trimestre.actif === true) {
            return {
                success: false,
                error: 'Impossible de supprimer le trimestre ACTIF. Active un autre trimestre d\'abord.'
            };
        }

        try {
            // Union des clés : IDB + localStorage + memoryCache
            const clesIDB = await db.keys();
            const clesLS = Object.keys(localStorage);
            const clesMem = (db.memoryCache && typeof db.memoryCache.keys === 'function')
                ? Array.from(db.memoryCache.keys())
                : [];
            const toutesLesCles = new Set([...clesIDB, ...clesLS, ...clesMem]);

            // Clés liées au trimestre : id exact, préfixe namespace `<id>_…`,
            // ou id inclus (copies d'archive, snapshots par groupe-cours).
            // Le registre `trimestres` est protégé explicitement.
            const cibles = [...toutesLesCles].filter(k =>
                typeof k === 'string' && k !== 'trimestres' &&
                (k === id || k.startsWith(id + '_') || k.includes(id))
            );

            for (const k of cibles) {
                await db.remove(k);
            }

            // Retirer l'entrée du registre
            db.setSync('trimestres', trimestres.filter(t => !t || t.id !== id));

            // #455 (19 août 2026) : le magasin global `cours` N'EST PLUS touché.
            // La fiche de cours est globale (le devis ministériel ne change pas
            // d'un trimestre à l'autre) : elle survit à la suppression de tout
            // trimestre. L'ancien nettoyage filtrait par `trimestreId` — un
            // champ HISTORIQUE de fiches legacy — et aurait détruit la fiche
            // partagée que les autres trimestres pointent encore (la fiche
            // réelle de Grégoire porte `trimestreId: "h2026"` et sert A26).
            // Supprimer une fiche de cours est un geste distinct, avec garde de
            // dépendances : chantier #449 (Bibliothèque, menu ⋮).

            // Durabilité : drainer les écritures avant de rendre la main
            if (typeof db.flush === 'function') {
                await db.flush();
            }

            return { success: true, nbCles: cibles.length, nom: trimestre.nom };

        } catch (error) {
            console.error('[Trimestres] Erreur suppression:', error);
            return { success: false, error: error.message };
        }
    }

    /* ===============================
       MIGRATION DES DONNÉES EXISTANTES
       =============================== */

    /**
     * Force la migration des clés vers le format namespacé
     * Utilisé quand le registre existe mais les clés ne sont pas renommées
     *
     * @param {string} trimestreId - ID du trimestre cible (ex: 'a2025')
     * @returns {Object} Résultat de la migration
     */
    function forcerMigration(trimestreId) {

        // 🔧 #464/CO-10 (21 août 2026) : l'écriture était INCONDITIONNELLE — tout
        // résidu de clé nue ÉCRASAIT la copie namespacée du trimestre actif
        // (étudiants/présences/évaluations compris) à chaque boot où le déclencheur
        // s'armait. Politique alignée sur copie-SEULEMENT-si-cible-vide ; le résidu
        // est purgé dans TOUS les cas (copie faite, ou refus journalisé) : la purge
        // auto-éteint le déclencheur — pas besoin de flag, et la capture bénéfique
        // du travail pré-trimestre (reproductible) est préservée.
        let clesMigrees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            const valeur = db.getSync(nomCle, null);
            if (valeur !== null) {
                const nouvelleCle = `${trimestreId}_${nomCle}`;
                const cible = db.getSync(nouvelleCle, null);
                const cibleVide = cible === null || (Array.isArray(cible) && cible.length === 0);
                if (cibleVide) {
                    db.setSync(nouvelleCle, valeur);
                    clesMigrees++;
                } else {
                    console.warn(`[Trimestres] forcerMigration : résidu nu « ${nomCle} » NON copié (la cible ${nouvelleCle} porte déjà des données) — résidu purgé sans copie.`);
                }
                db.removeSync(nomCle);
            }
        });

        return { success: true, clesMigrees: clesMigrees };
    }

    /**
     * 🆕 #464 (21 août 2026) — Rapatriement ONE-SHOT des résidus de clés nues.
     * Pour chaque clé de CLES_NAMESPACEES dont il reste un résidu nu (données
     * d'avant le namespacing, ou clés nouvellement inscrites au registre par
     * CT-26) : copie vers le trimestre ACTIF si la cible est vide (warn sinon),
     * puis purge du nu. Cas spécial dureePeriode : la valeur nue est copiée vers
     * TOUS les trimestres du registre qui n'en ont pas (comportement identique
     * préservé partout), puis purgée.
     * Ferme CO-09 (fallback pratiques), CT-11/CT-12 (résidus horaires) côté données.
     */
    function migrerResidusClesNues() {
        const FLAG = 'migration_residus_cles_nues_done';
        if (db.getSync(FLAG, false)) return { success: true, dejaFait: true };
        const trimestres = obtenirTrimestres();
        const actif = obtenirTrimestreActif();
        if (!actif) return { success: true, sansTrimestre: true }; // pré-trimestre : rien à rapatrier (le flag n'est PAS posé)

        // dureePeriode : copie vers tous les trimestres, jamais d'écrasement
        const dureeNue = db.getSync('dureePeriode', null);
        if (dureeNue !== null) {
            trimestres.forEach(t => {
                if (db.getSync(`${t.id}_dureePeriode`, null) === null) {
                    db.setSync(`${t.id}_dureePeriode`, dureeNue);
                }
            });
            db.removeSync('dureePeriode');
        }

        let rapatriees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            if (nomCle === 'dureePeriode') return;
            const valeur = db.getSync(nomCle, null);
            if (valeur === null) return;
            const nouvelleCle = `${actif.id}_${nomCle}`;
            const cible = db.getSync(nouvelleCle, null);
            const cibleVide = cible === null || (Array.isArray(cible) && cible.length === 0);
            if (cibleVide) {
                db.setSync(nouvelleCle, valeur);
                rapatriees++;
                console.warn(`[Trimestres] #464 : résidu nu « ${nomCle} » rapatrié vers ${nouvelleCle}.`);
            } else {
                console.warn(`[Trimestres] #464 : résidu nu « ${nomCle} » NON copié (${nouvelleCle} porte déjà des données) — purgé sans copie.`);
            }
            db.removeSync(nomCle);
        });

        db.setSync(FLAG, true);
        return { success: true, rapatriees };
    }

    /**
     * Migre les données existantes vers le format multi-trimestres
     *
     * Cette fonction:
     * 1. Détecte si l'ancien format existe (clés sans préfixe)
     * 2. Lit cadreCalendrier pour déterminer le trimestre
     * 3. Crée l'entrée dans le registre des trimestres
     * 4. Renomme les clés avec le préfixe approprié
     *
     * @returns {Object} Résultat de la migration
     */
    function migrerVersMultiTrimestres() {

        // Vérifier si des clés non-namespacées existent encore
        const calendrierNonNamespace = db.getSync('calendrierComplet', null);

        // Vérifier si la migration a déjà été effectuée
        const trimestres = obtenirTrimestres();
        if (trimestres.length > 0) {
            // Le registre existe - vérifier si les clés sont migrées
            if (calendrierNonNamespace !== null) {
                // Les clés ne sont pas encore migrées, forcer la migration
                const actif = obtenirTrimestreActif();
                if (actif) {
                    return forcerMigration(actif.id);
                }
            }
            return { success: true, alreadyMigrated: true };
        }

        // Vérifier si des données anciennes existent
        const cadreCalendrier = db.getSync('cadreCalendrier', null);
        if (!cadreCalendrier) {
            return { success: true, noData: true };
        }

        // Déterminer le trimestre depuis le cadre calendrier
        let session = cadreCalendrier.session || '';
        let annee = cadreCalendrier.annee || '';

        // Si session/année non définies, les déduire de dateDebut
        if (!session || !annee) {
            const dateDebut = cadreCalendrier.dateDebut;
            if (dateDebut) {
                const date = new Date(dateDebut);
                annee = date.getFullYear().toString();
                const mois = date.getMonth() + 1; // 1-12
                session = sessionDepuisMois(mois);
            }
        }

        if (!session || !annee) {
            console.error('[Trimestres] Impossible de déterminer le trimestre');
            return { success: false, error: 'Session/année non déterminées' };
        }

        const trimestreId = `${session.toLowerCase()}${annee}`;
        const nomTrimestre = `${nomSession(session)} ${annee}`;

        // Créer l'entrée dans le registre
        const nouveauTrimestre = {
            id: trimestreId,
            nom: nomTrimestre,
            session: session.toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        };

        db.setSync('trimestres', [nouveauTrimestre]);

        // Renommer les clés existantes avec le préfixe
        let clesMigrees = 0;
        CLES_NAMESPACEES.forEach(nomCle => {
            const valeur = db.getSync(nomCle, null);
            if (valeur !== null) {
                const nouvelleCle = `${trimestreId}_${nomCle}`;
                db.setSync(nouvelleCle, valeur);
                db.removeSync(nomCle);
                clesMigrees++;
            }
        });

        return {
            success: true,
            trimestreId: trimestreId,
            nom: nomTrimestre,
            clesMigrees: clesMigrees
        };
    }

    /**
     * Migration ponctuelle : clés globales (non namespacées) vers le bon trimestre.
     *
     * 🔒 ZERO-DETTE (29 avr 2026, fix P1 ultrareview Lot 2) :
     * L'ancienne version hardcodait `a2025_*` comme destination, ce qui
     * pouvait reclasser des donnees H2025 sous a2025_* et les rendre
     * inaccessibles. Correctif : deriver la destination depuis cadreCalendrier
     * (meme logique que migrerVersMultiTrimestres) ; fallback sur le trimestre
     * actif. Si aucun signal -> ne pas migrer (ne pas inventer une destination).
     *
     * Idempotente via flag `migration-cles-globales-done`.
     */
    function migrerClesVersA2025() {
        // Idempotence : ne s'execute qu'une fois
        if (db.getSync('migration-cles-globales-done', null)) return;

        // Liste des clés à migrer
        const clesAMigrer = [
            // Données étudiants et évaluations (critiques!)
            'groupeEtudiants',
            'productions',
            'presences',
            'evaluationsSauvegardees',
            // Calendrier et horaire
            'calendrierComplet',
            'cadreCalendrier',
            'horaireHebdo',
            'seancesCompletes',
            'journeesSansCours', // fusion #374 (5 août 2026)
            // Indices et snapshots (existants)
            'interventions',
            'indicesAssiduite',
            'indicesCP',
            'snapshots'
        ];

        // Determiner le trimestre cible : meme logique que migrerVersMultiTrimestres
        // (cadreCalendrier.session/annee ou deduction depuis dateDebut), fallback
        // sur le trimestre actif si dispo.
        let prefixe = '';
        const cadreCalendrier = db.getSync('cadreCalendrier', null);
        if (cadreCalendrier) {
            let session = cadreCalendrier.session || '';
            let annee = cadreCalendrier.annee || '';
            if ((!session || !annee) && cadreCalendrier.dateDebut) {
                const date = new Date(cadreCalendrier.dateDebut);
                annee = date.getFullYear().toString();
                const mois = date.getMonth() + 1;
                session = sessionDepuisMois(mois);
            }
            if (session && annee) {
                prefixe = `${session.toLowerCase()}${annee}_`;
            }
        }
        if (!prefixe) {
            const trimestreActif = obtenirTrimestreActif();
            if (trimestreActif && trimestreActif.id) {
                prefixe = trimestreActif.id + '_';
            }
        }
        if (!prefixe) {
            // Aucun signal -> ne pas inventer une destination. Marquer fait
            // pour ne pas retenter en boucle, mais ne pas migrer.
            console.warn('[Trimestres] migrerClesVersA2025 : aucun trimestre derivable, migration sautee');
            db.setSync('migration-cles-globales-done', '1');
            return;
        }

        let clesMigrees = 0;
        clesAMigrer.forEach(nomCle => {
            const donneesAnciennes = db.getSync(nomCle, null);

            // Si des données existent dans l'ancienne clé
            if (donneesAnciennes !== null) {
                // Vérifier que ce n'est pas vide
                const estVide = Array.isArray(donneesAnciennes)
                    ? donneesAnciennes.length === 0
                    : (typeof donneesAnciennes === 'object' && Object.keys(donneesAnciennes).length === 0);

                if (!estVide) {
                    const cleNouvelle = prefixe + nomCle;
                    const existantes = db.getSync(cleNouvelle, null);

                    // Ne migrer que si la clé namespacée n'existe pas déjà
                    if (existantes === null) {
                        db.setSync(cleNouvelle, donneesAnciennes);
                        clesMigrees++;
                    }

                    // ⚠️ NE PAS supprimer l'ancienne clé pour l'instant
                    // Les modules qui lisent directement sans cle() en ont besoin
                    // db.removeSync(nomCle);
                }
            }
        });

        if (clesMigrees > 0) {
            console.warn('[Trimestres] migrerClesVersA2025 : ' + clesMigrees + ' cles migrees vers ' + prefixe);
        }
        db.setSync('migration-cles-globales-done', '1');
    }

    // #464/CT-12 (21 août 2026) : migrerHorairesEtGroupesCours RETIRÉE — elle
    // recopiait à CHAQUE boot tout résidu nu horaires/groupesCours vers le
    // trimestre actif SANS jamais purger (le résidu ressuscitait dans tout
    // trimestre au namespace vide). Remplacée par migrerResidusClesNues()
    // (one-shot, copie-si-vide + purge), qui couvre TOUTES les clés du registre.

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModuleTrimestres() {

        // Exécuter la migration si nécessaire
        const resultatMigration = migrerVersMultiTrimestres();

        // Migration ponctuelle des clés vers A2025
        migrerClesVersA2025();

        // 🆕 #464 (21 août 2026) : rapatriement one-shot des résidus de clés nues
        // (remplace migrerHorairesEtGroupesCours, et couvre les 15 clés inscrites
        // au registre par l'inventaire CT-26 + dureePeriode).
        migrerResidusClesNues();

        // Synchroniser les miroirs window.trimestreActif + clé storage avec le tableau .actif
        const actif = obtenirTrimestreActif();
        if (actif) {
            window.trimestreActif = actif.id;
            db.setSyncSiChange('trimestreActif', actif.id);   // #1040 : rien si inchangé
        }

        // Mettre à jour l'affichage du bandeau d'archivage
        mettreAJourBandeauArchive();
    }

    /* ===============================
       BANDEAU VISUEL ARCHIVAGE
       =============================== */

    /**
     * Met à jour l'affichage du bandeau et le mode lecture seule
     * Appelée au chargement et lors du changement de trimestre
     */
    function mettreAJourBandeauArchive() {
        const bandeau = document.getElementById('bandeau-archive');
        const isArchive = estTrimestreArchive();

        if (bandeau) {
            toggleDisplay(bandeau, isArchive);
            // Restaurer la couleur par défaut
            bandeau.style.background = 'var(--bleu-clair, #065dbb)';
        }

        // Réinitialiser le mode écriture temporaire
        document.body.classList.remove('mode-ecriture-temp');
        const checkboxEcriture = document.getElementById('checkbox-ecriture-temp');
        if (checkboxEcriture) {
            checkboxEcriture.checked = false;
        }

        // ✅ CORRIGÉ (29 déc 2025): Par défaut = mode normal (vrais noms visibles)
        // L'utilisateur peut activer l'anonymisation au besoin via la checkbox
        const checkboxAnonyme = document.getElementById('checkbox-anonymiser-archive');
        const modeActuel = db.getSync('modeApplication', 'normal');

        // Toujours décocher la checkbox par défaut
        if (checkboxAnonyme) {
            checkboxAnonyme.checked = false;
        }

        // Si on était en mode anonymisation, revenir en mode normal
        if (modeActuel === 'anonymisation' && typeof window.changerMode === 'function') {
            window.changerMode('normal');
        }

        // Ajouter/retirer la classe mode-archive sur le body
        if (isArchive) {
            document.body.classList.add('mode-archive');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
        } else {
            document.body.classList.remove('mode-archive');
        }

        // Mettre à jour le texte du bandeau avec le nom du trimestre
        if (isArchive && bandeau) {
            const actif = obtenirTrimestreActif();
            const texteElement = bandeau.querySelector('.bandeau-archive-texte');
            if (texteElement && actif) {
                texteElement.innerHTML = `<strong>LECTURE SEULE</strong> — ${echapperHtml(actif.nom)}`;
            }
        }
    }

    /* ===============================
       EXPORT FORMAT RECHERCHE
       =============================== */

    /**
     * Génère une clé d'anonymisation aléatoire
     * @returns {string} Clé de 32 caractères
     */
    function genererCleAnonymisation() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const valeurs = new Uint32Array(32);
        crypto.getRandomValues(valeurs);
        let cle = '';
        for (let i = 0; i < 32; i++) {
            cle += caracteres.charAt(valeurs[i] % caracteres.length);
        }
        return cle;
    }

    /**
     * Anonymise un DA avec une clé secrète (hash SHA-256 tronqué)
     * @param {string} da - Le DA à anonymiser
     * @param {string} cleSecrete - La clé secrète
     * @returns {Promise<string>} ID anonyme (8 caractères hex)
     */
    async function anonymiserDA(da, cleSecrete) {
        const donnee = da + ':' + cleSecrete;
        const encoder = new TextEncoder();
        const data = encoder.encode(donnee);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Exporte les données au format recherche (anonymisé)
     * Produit deux fichiers : données anonymisées + table de correspondance
     *
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} Résultat de l'export
     */
    async function exporterFormatRecherche(options = {}) {

        try {
            // 1. Obtenir ou générer la clé d'anonymisation
            let cleSecrete = options.cleSecrete;
            if (!cleSecrete) {
                cleSecrete = genererCleAnonymisation();
            }

            // 2. Collecter les données sources
            // ✅ NAMESPACING (Beta 95.5)
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            // IMPORTANT: Inclure TOUS les étudiants pour l'anonymisation (du trimestre actif)
            const tousLesEtudiants = etudiants;
            const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));
            const productions = obtenirDonneesSelonMode('productions');
            // #1013 (décision de Grégoire, 4 oct. 2026) : ce qui part chez quelqu'un écarte l'élève
            // supprimé — ni ses présences, ni ses évaluations, ni ses lignes de snapshots. Le codex,
            // lui, garde tout. Écarté ici, à la source : aucun identifiant anonyme n'est créé pour lui.
            const supprimes = typeof window.dasElevesSupprimes === 'function' ? window.dasElevesSupprimes() : new Set();
            const garde = (da) => !da || !supprimes.has(String(da));
            const evaluations = (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).filter(e => garde(e.etudiantDA));
            const presences = (obtenirDonneesSelonMode('presences') || []).filter(p => garde(p.da));
            const snapshotsRaw = db.getSync(cle('snapshots'), { hebdomadaires: [], interventions: [] });
            // Les snapshots sont stockés comme { hebdomadaires: [...], interventions: [...], metadata: {...} }
            // On exporte les snapshots hebdomadaires
            const snapshots = (snapshotsRaw.hebdomadaires || []).map(s => (s && Array.isArray(s.etudiants))
                ? Object.assign({}, s, { etudiants: s.etudiants.filter(e => garde(e && e.da)) }) : s);
            // #358 Option A : modèles de travail du trimestre ACTIF (cohérent avec les
            // étudiants/productions/évaluations namespacés collectés juste au-dessus).
            const grilles = db.getSync(cle('grillesTemplates'), []);
            const echelles = db.getSync(cle('echellesTemplates'), []);
            const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
            const indicesCP = db.getSync(cle('indicesCP'), {});
            // #902 : A ne vit pas dans indicesCP — sa source est indicesAssiduite (sommatif[da]).
            const indicesAssiduite = db.getSync(cle('indicesAssiduite'), {});
            // #913 / #915 lot 3 : rangés par DA — le DA ne sort jamais, la sortie se fait sous id_anonyme.
            // Deux sources : le REGISTRE longitudinal (clé globale, par DA) d'abord, et l'ancienne clé du
            // trimestre en repli, en union sans doublon. Dès que le registre a REPRIS le stock d'un DA
            // (`reprise913`), il fait foi seul : un résultat retiré là-bas ne revient pas par l'ancienne clé.
            const resultatsUlterieurs = db.getSync(cle('resultatsUlterieurs'), {}) || {};
            const registreLongitudinal = db.getSync('registreLongitudinal', null);
            const inscritsAuRegistre = (registreLongitudinal && registreLongitudinal.format === 'registre-longitudinal'
                && registreLongitudinal.eleves && typeof registreLongitudinal.eleves === 'object') ? registreLongitudinal.eleves : {};
            const resultatsUlterieursDe = (da) => {
                const inscrit = inscritsAuRegistre[da];
                const duRegistre = inscrit && Array.isArray(inscrit.resultatsUlterieurs) ? inscrit.resultatsUlterieurs : [];
                const duTrimestre = (inscrit && inscrit.reprise913) || !Array.isArray(resultatsUlterieurs[da]) ? [] : resultatsUlterieurs[da];
                const vus = new Set();
                // Trois champs recopiés un à un : rien d'autre de l'objet rangé ne voyage.
                return duRegistre.concat(duTrimestre)
                    .filter(r => r && typeof r === 'object')
                    .map(r => ({ cours: r.cours, trimestre: r.trimestre, note: r.note }))
                    .filter(r => { const k = r.cours + '\u0000' + r.trimestre + '\u0000' + r.note; if (vus.has(k)) return false; vus.add(k); return true; });
            };
            const cours = db.getSync('cours', []);
            const coursActif = cours.find(c => c.actif);

            // 3. Déterminer le trimestre — refonte chantier B : on cible le trimestre
            // ACTIF (où vivent les données via le namespacing), plus celui qui était
            // embarqué dans le cours (le cours ne porte plus de période).
            const trimestres = db.getSync('trimestres', []);
            let trimestre = trimestres.find(t => t.actif);

            if (!trimestre && trimestres.length > 0) {
                // Dernier fallback : premier trimestre disponible
                trimestre = trimestres[0];
            }

            if (!trimestre) {
                return { success: false, error: 'Aucun trimestre trouvé' };
            }

            // Obtenir le cadreCalendrier du bon trimestre
            const cadreCalendrier = db.getSync(trimestre.id + '_cadreCalendrier', {})
                                 || db.getSync('cadreCalendrier', {});

            // 4. Créer la table de correspondance et anonymiser TOUS les étudiants
            const tableCorrespondance = {};
            const daVersAnonyme = {};

            // Anonymiser tous les étudiants (actifs ET inactifs)
            for (const etudiant of tousLesEtudiants) {
                const idAnonyme = await anonymiserDA(etudiant.da, cleSecrete);
                tableCorrespondance[idAnonyme] = etudiant.da;
                daVersAnonyme[etudiant.da] = idAnonyme;
            }

            // Aussi anonymiser les DA présents dans les données mais pas dans la liste
            const dasPresences = [...new Set(presences.map(p => p.da).filter(Boolean))];
            const dasEvaluations = [...new Set(evaluations.map(e => e.etudiantDA).filter(Boolean))];
            const dasSnapshots = [...new Set(snapshots.flatMap(s => (s.etudiants || []).map(e => e.da)).filter(Boolean))];
            const tousLesDAs = [...new Set([...dasPresences, ...dasEvaluations, ...dasSnapshots])];

            for (const da of tousLesDAs) {
                if (!daVersAnonyme[da]) {
                    const idAnonyme = await anonymiserDA(da, cleSecrete);
                    tableCorrespondance[idAnonyme] = da;
                    daVersAnonyme[da] = idAnonyme;
                }
            }

            // 5. Obtenir la grille de référence pour SOLO (préférence utilisateur)
            const grilleRefId = obtenirPreference('grilleReferenceDepistage');
            const grilleRef = grilles.find(g => g.id === grilleRefId) || grilles[0];

            // 6. Construire le JSON selon les spécifications
            const exportData = {
                meta: {
                    // #908 : la version du code CHARGÉ (version.js, #849) — « 6.0.0-beta95 » était écrit en dur depuis la Beta 95.
                    version_monitorage: typeof window.VERSION_MAJEURE === 'string' ? window.VERSION_MAJEURE : 'inconnue',
                    version_format: '1.2', // #902 (1.1) : indices_finaux porte null et note_constructible ; #913 (1.2) : resultats_ulterieurs sous chaque élève — ajouts additifs
                    date_export: new Date().toISOString(),
                    trimestre: {
                        id: trimestre.id,
                        nom: trimestre.nom,
                        session: trimestre.session,
                        annee: trimestre.annee
                    },
                    anonymisation: {
                        methode: 'SHA-256 tronqué (8 caractères)',
                        cle_hash: cleSecrete.substring(0, 4) + '****'
                    }
                },

                contexte: {
                    cours: coursActif ? {
                        code: coursActif.sigle || coursActif.id,
                        titre: coursActif.titre || coursActif.nom,
                        groupe: coursActif.groupe
                    } : {},
                    grille_evaluation: grilleRef ? {
                        id: grilleRef.id,
                        nom: grilleRef.nom,
                        // ⚠⚠ #542 lot 3, pas 4 (suite) — DEUX VALEURS EN DUR RETIRÉES
                        // D'ICI, ET C'EST PLUS GRAVE QU'À L'ÉCRAN.
                        //
                        // Ce qui vivait là :
                        //     echelle: ['I', 'D', 'M', 'E'],
                        //     seuil_reussite: 'M',
                        //
                        // ⮕ TROIS FAITS, MESURÉS AVANT LE GESTE :
                        //   1. Cette fonction CHARGE déjà les échelles réelles du
                        //      trimestre (`echelles`, plus haut) — et ne s'en servait
                        //      JAMAIS. La variable était lue et jetée.
                        //   2. Les évaluations exportées portaient leurs
                        //      `niveauSelectionne` (« M », « Y »…) mais PAS leur
                        //      `echelleId` : le chercheur recevait des codes de niveau
                        //      sans savoir dans quelle échelle les lire.
                        //   3. Le seul repère qu'on lui donnait était cette liste
                        //      IDME écrite dans le code.
                        //
                        // ⮕ Chez un utilisateur qui note autrement, le fichier produit
                        // n'était pas incomplet : il était FAUX. Un affichage trompeur
                        // se corrige au rechargement ; un jeu de données de recherche
                        // part ailleurs et survit à sa correction.
                        //
                        // ✅ DÉCISION DE GRÉGOIRE (27 août 2026) : l'export livre le
                        // CATALOGUE RÉEL des échelles (voir `echelles` ci-dessous) et
                        // chaque évaluation porte son `echelle_id`. Le lecteur relie
                        // les deux lui-même, sans que l'application ne suppose rien.
                        //
                        // ⮕ `seuil_reussite` est RETIRÉ, sans remplaçant : AUCUNE
                        // donnée du dépôt ne dit quel niveau marque la réussite. Le
                        // « seuil de maîtrise » est justement ce qui manque aussi à
                        // #549 et à la troisième option écartée au pas 3c-3. Écrire
                        // « M » était une supposition, et une supposition exportée est
                        // indiscernable d'une mesure.
                        criteres: (grilleRef.criteres || []).map(c => ({
                            code: c.id,
                            nom: c.nom,
                            ponderation: c.ponderation,
                            // ⚠⚠ #542 lot 3, pas 4 — LE SOLO D'UN CRITÈRE SE LIT, IL NE SE
                            // DEVINE PLUS DEPUIS SON NOM.
                            //
                            // Ce qui vivait ici : `obtenirNiveauSOLO(c.nom)`, qui cherchait
                            // « structure », « rigueur », « français », « plausibilité »,
                            // « nuance » dans le NOM du critère — les cinq critères de
                            // Grégoire écrits dans le code — et rendait `multistructural`
                            // par défaut pour tout le reste.
                            //
                            // ⮕ TROIS DÉFAUTS, du plus visible au plus profond :
                            //   1. Une grille « Méthode / Résultats / Discussion » recevait
                            //      `multistructural` sur TOUS ses critères, sans que rien ne
                            //      le dise. C'est le même défaut que l'expression régulière
                            //      retirée d'`identifierDefiSpecifique` par #529.
                            //   2. Le vocabulaire rendu était ANGLAIS — `multistructural`,
                            //      `relational`, `extended_abstract` — alors que le champ
                            //      configuré par l'utilisateur est en français. Deux
                            //      vocabulaires pour la même chose, dans le même dépôt.
                            //   3. Surtout : LE CHAMP EXISTE. `critere.niveauSOLO` est
                            //      configuré dans l'éditeur de grilles (`grilles.js`, menu à
                            //      trois valeurs), et c'est déjà lui que lit `calculerIPB`
                            //      (`profil-etudiant-calculs.js`) pour choisir les critères
                            //      « fondations ». La fonction devinait donc une réponse que
                            //      l'utilisateur avait déjà donnée — et pouvait la CONTREDIRE.
                            //
                            // ⮕ LE DÉFAUT « multistructurel » N'EST PAS ARBITRAIRE : c'est la
                            // valeur que l'éditeur de grilles présélectionne et celle que
                            // `calculerIPB` applique déjà à un critère sans étiquette. Une
                            // troisième lecture du même champ doit lire le même défaut, sans
                            // quoi l'IPB et l'export diraient deux choses d'un même critère.
                            //
                            // ⚠ LE FORMAT D'EXPORT CHANGE, et c'est voulu : `niveau_solo`
                            // passe du vocabulaire anglais deviné au vocabulaire français
                            // configuré. Un fichier exporté avant ce jour et un fichier
                            // exporté après ne portent pas les mêmes valeurs dans ce champ.
                            niveau_solo: (c.niveauSOLO || 'multistructurel'),
                            type: typeCritereSelonSOLO(c)
                        }))
                    } : {},

                    // ⮕ #542 lot 3, pas 4 (suite) — LE CATALOGUE DES ÉCHELLES DU
                    // TRIMESTRE, qui remplace la liste `['I','D','M','E']` retirée
                    // ci-dessus. Ces échelles étaient déjà chargées par la fonction et
                    // jetées sans usage.
                    //
                    // TOUTES celles du trimestre, et pas « celle de la grille » : une
                    // grille ne désigne pas d'échelle dans ce dépôt, et plusieurs
                    // peuvent coexister sur un même trimestre. Choisir aurait été
                    // deviner — c'est le geste que tout ce lot retire. Le lien se fait
                    // par l'`echelle_id` que porte désormais chaque évaluation.
                    //
                    // Les PLAGES et l'étiquette SOLO partent avec, parce que sans elles
                    // un code de niveau reste illisible : « M » ne dit ni à quel
                    // pourcentage il correspond, ni ce qu'il signifie.
                    echelles: (echelles || []).map(ech => ({
                        id: ech.id,
                        nom: ech.nom,
                        niveaux: (ech.niveaux || []).map(n => ({
                            code: n.code,
                            nom: n.nom,
                            min: n.min,
                            max: n.max,
                            valeur_calcul: (n.valeurCalcul !== undefined ? n.valeurCalcul : n.valeur),
                            // Vide tant que l'utilisateur n'a pas étiqueté son échelle
                            // (#542 lot 2). `null` plutôt qu'une valeur devinée : c'est
                            // la même règle que partout dans ce lot.
                            niveau_solo: n.niveauSOLO || null
                        }))
                    })),

                    calendrier: {
                        date_debut: cadreCalendrier.dateDebut || '',
                        date_fin: cadreCalendrier.dateFin || '',
                        session: cadreCalendrier.session || trimestre.session,
                        annee: cadreCalendrier.annee || trimestre.annee
                    },
                    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
                    artefacts: productions.filter(p => p.type === 'artefact-portfolio').map(p => {
                        const dateEchTrim = (typeof obtenirEcheanceEffective === 'function')
                            ? obtenirEcheanceEffective(p, null).date : p.dateEcheance;
                        return {
                            id: p.id,
                            titre: p.titre || p.nom,
                            type: p.type,
                            date_echeance: dateEchTrim,
                            semaine: calculerSemaine(dateEchTrim, cadreCalendrier.dateDebut)
                        };
                    })
                },

                observations: {
                    etudiants: etudiantsActifs.map(e => ({
                        id_anonyme: daVersAnonyme[e.da],
                        statut: e.statut || 'actif',
                        profil: {
                            programme: e.programme || '',
                            // Lot 4 du cadrage 11 (11 sept. 2026) : une seule source, la liste
                            // des étudiant·es (`sa`) — `e.servicesAdaptes` n'existait sur aucun
                            // élève (c'était le booléen du volet confidentiel) : toujours faux.
                            services_adaptes: e.sa === 'Oui' || e.sa === true
                        },
                        // #913 : une liste, vide quand il n'y a rien — jamais un champ absent.
                        resultats_ulterieurs: resultatsUlterieursDe(e.da)
                    })),

                    presences: presences
                        .filter(p => daVersAnonyme[p.da]) // Exclure si DA non anonymisable
                        .map(p => ({
                            id_etudiant: daVersAnonyme[p.da],
                            date: p.date,
                            statut: p.statut,
                            duree_cours: p.heures || p.duree || 3,
                            justifie: p.justifie || false,
                            facultatif: p.facultatif || false
                        })),

                    evaluations: evaluations
                        .filter(e => daVersAnonyme[e.etudiantDA]) // Exclure si DA non anonymisable
                        .map(e => ({
                            id_etudiant: daVersAnonyme[e.etudiantDA],
                            id_artefact: e.productionId,
                            date_echeance: obtenirDateEcheance(e.productionId, productions),
                            statut_remise: e.statutRemise,
                            // ⮕ #542 lot 3, pas 4 (suite) — SANS CE CHAMP, LES NIVEAUX
                            // CI-DESSOUS SONT ILLISIBLES. `criteres` rend des codes
                            // (« M », « Y »…) qui n'ont de sens que dans une échelle
                            // donnée ; l'export n'en désignait aucune. Le catalogue
                            // `contexte.echelles` porte les échelles, celui-ci dit
                            // laquelle lire pour CETTE évaluation.
                            // `null` quand l'évaluation n'en désigne pas — une donnée
                            // ancienne, ou une échelle disparue du trimestre. On ne
                            // choisit pas à sa place.
                            echelle_id: e.echelleId || null,
                            criteres: (e.criteres || []).reduce((acc, c) => {
                                acc[normaliserNomCritere(c.critereNom)] = c.niveauSelectionne;
                                return acc;
                            }, {}),
                            note_finale: e.noteFinale,
                            niveau_final: e.niveauFinal,
                            reprise_de: e.repriseDeId || null,
                            jeton_delai: e.jetonDelaiApplique || false,
                            jeton_reprise: e.jetonRepriseCibleeApplique || false
                        }))
                },

                calculs: {
                    // #908 (21 sept. 2026) — CES TEXTES DISENT CE QUE L'APPLICATION CALCULE. description, A et P : mots de
                    // Grégoire, tels quels ; C : proposé par Claude Code, validé par Grégoire le 21 sept. 2026. (Minuscule
                    // initiale voulue : des définitions dans un JSON.) Verrouillés par la sentinelle #908.
                    description: 'Indices calculés par Labo Codex',
                    formules: {
                        indice_A: 'assiduité : périodes présentes ÷ périodes offertes, cumulées depuis le début du trimestre (%)',
                        // C : trois familles comptent remis ÷ attendus ; la classe PAN-Spécifications compte acceptables ÷ requis du
                        // palier le plus haut — d'où la réserve. « productions étudiantes » et non « artefacts » : tous n'ont pas de portfolio.
                        indice_C: 'complétion : productions étudiantes remises ÷ productions étudiantes attendues (%) ; en pratique par spécifications, productions acceptables ÷ productions requises',
                        indice_P: 'performance calculée par la pratique de notation du cours ; la méthode varie selon la pratique'
                    },

                    snapshots_hebdomadaires: snapshots.map(s => ({
                        semaine: s.numSemaine,
                        date: s.dateSeance,
                        indices_par_etudiant: (s.etudiants || [])
                            .filter(e => daVersAnonyme[e.da]) // Exclure si DA non anonymisable
                            .map(e => ({
                                id_etudiant: daVersAnonyme[e.da],
                                A: e.A_cumulatif || e.A,
                                C: e.C,
                                P: e.P,
                                pattern: e.pattern,
                                rai: e.rai
                            }))
                    })),

                    // #902 (17 sept. 2026) : ce bloc lisait `indicesCP[da].actuel.PAN || .SOM`, format
                    // retiré en Beta 95.5 — A, C et P valaient 0 pour CHAQUE élève, et A n'a jamais
                    // vécu dans `indicesCP` (sa source est `indicesAssiduite`). Le lecteur unique de
                    // l'app (`calculerTousLesIndices`) rend les trois, de 0 à 100 comme les snapshots
                    // ci-dessus, et connaît l'ancien format « nombre » de A.
                    // ⮕ Règle #394 : un P non constructible n'est PAS un 0. Ce fichier voyage, et un
                    //   0 entre dans une moyenne sans que personne le voie : `null` (valeur manquante
                    //   pour R, pandas, etc.), avec `note_constructible` qui dit pourquoi.
                    // #743 (lot D) : A suit la même règle — inconnu tant qu'aucune séance saisie ne compte.
                    unites: 'A, C et P de 0 à 100. P_final vaut null (jamais 0) quand la note n\'est pas constructible : voir note_constructible. A_final vaut null (et non 0 ou 100) tant qu\'aucune séance saisie ne compte pour l\'étudiant·e : assiduité inconnue. C_final vaut null (jamais 0) quand aucune pratique de notation n\'est assignée au groupe-cours : la complétion se calcule par la pratique.',

                    indices_finaux: etudiantsActifs.map(e => {
                        const indices = calculerTousLesIndices(e.da, indicesAssiduite, indicesCP);
                        const constructible = indices.noteConstructible !== false;
                        return {
                            id_etudiant: daVersAnonyme[e.da],
                            A_final: indices.A,
                            C_final: indices.C,
                            P_final: constructible ? indices.P : null,
                            note_constructible: constructible
                        };
                    }),

                    performance_par_critere: calculerPerformanceParCritere(etudiantsActifs, evaluations, daVersAnonyme, grilleRef)
                }
            };

            // 6bis. Profils RLO — conditionnel au toggle `activerActionsRLO`
            // (étape 9 du chantier RLO, spec SPEC-EXPORT-GRAPHIQUE-RLO.md)
            if (typeof obtenirPreference === 'function' &&
                obtenirPreference('activerActionsRLO') === true) {
                exportData.profilsRLO = construireProfilsRLO(
                    evaluations, productions, daVersAnonyme
                );
            }

            // 7. Générer et télécharger le fichier anonymisé
            const jsonAnonyme = JSON.stringify(exportData, null, 2);
            const blobAnonyme = new Blob([jsonAnonyme], { type: 'application/json' });
            const urlAnonyme = URL.createObjectURL(blobAnonyme);

            const dateStr = new Date().toISOString().split('T')[0];
            const lienAnonyme = document.createElement('a');
            lienAnonyme.href = urlAnonyme;
            lienAnonyme.download = `monitorage_${trimestre.id}_anonyme_${dateStr}.json`;
            lienAnonyme.click();
            URL.revokeObjectURL(urlAnonyme);

            // 8. Sauvegarder la table de correspondance localement (PRIVÉ)
            const tablePrivee = {
                cle_secrete: cleSecrete,
                date_generation: new Date().toISOString(),
                trimestre: trimestre.id,
                correspondances: tableCorrespondance
            };
            db.setSync(`tableCorrespondance_${trimestre.id}`, tablePrivee);

            // 9. Télécharger aussi la table de correspondance (fichier séparé)
            const jsonTable = JSON.stringify(tablePrivee, null, 2);
            const blobTable = new Blob([jsonTable], { type: 'application/json' });
            const urlTable = URL.createObjectURL(blobTable);

            const lienTable = document.createElement('a');
            lienTable.href = urlTable;
            lienTable.download = `table_correspondance_${trimestre.id}_PRIVE_${dateStr}.json`;

            // Délai pour que le premier téléchargement se lance
            setTimeout(() => {
                lienTable.click();
                URL.revokeObjectURL(urlTable);
            }, 500);

            return {
                success: true,
                nbEtudiants: etudiantsActifs.length,
                nbEvaluations: evaluations.length,
                nbPresences: presences.length,
                nbSnapshots: snapshots.length
            };

        } catch (error) {
            console.error('[Export Recherche] Erreur:', error);
            return { success: false, error: error.message };
        }
    }

    // ⚠⚠ #542 lot 3, pas 4 — `obtenirNiveauSOLO()` A ÉTÉ SUPPRIMÉE.
    //
    // Elle redevinait le niveau SOLO d'un critère depuis son NOM : cinq mots-clés
    // — « structure », « rigueur », « français », « plausibilité », « nuance » —
    // qui sont les critères de Grégoire, écrits dans le code. Tout autre nom
    // recevait `multistructural`, en silence.
    //
    // ⮕ ELLE CONTREDISAIT LE CHAMP QUE L'UTILISATEUR CONFIGURE. `critere.niveauSOLO`
    // existe, il est saisi dans l'éditeur de grilles, et `calculerIPB` s'en sert
    // déjà. Son unique appelant — l'export de recherche — le lit désormais
    // directement ; voir le commentaire à `niveau_solo`.
    //
    // ⮕ C'était le défaut B9 du plan `PLAN-SOLO-echelle-et-depistage.md`, et le
    // même patron que l'expression régulière retirée d'`identifierDefiSpecifique`
    // par #529 : du code qui relit des noms pour retrouver une donnée déjà
    // structurée ailleurs.
    //
    // Verrouillé par `tests/unit/sentinelle-542-pas4-solo-critere-configure.test.js`.

    /**
     * Le TYPE d'un critère, dérivé de son étiquette SOLO configurée.
     *
     * ⚠⚠ #542 lot 3, pas 4 — CE QUI VIVAIT ICI ÉTAIT LE JUMEAU EXACT DE
     * `obtenirNiveauSOLO()` : les mêmes cinq mots-clés cherchés dans le NOM du
     * critère (« structure », « rigueur », « français », « plausibilité »,
     * « nuance »), pour rendre un vocabulaire différent — `fondamental`,
     * `transitionnel`, `complexe` — du MÊME axe. Deux fonctions, deux
     * vocabulaires, une seule question, et le même défaut : les critères de
     * Grégoire écrits dans le code.
     *
     * ⮕ LE MAPPING CI-DESSOUS N'EST PAS UNE INVENTION, et c'est ce qui autorise
     * à le poser sans demander. Les deux fonctions supprimées répondaient aux
     * MÊMES mots-clés par des valeurs parallèles, ligne pour ligne :
     *     structure / rigueur / français  →  multistructural  ET  fondamental
     *     plausibilité                    →  relational       ET  transitionnel
     *     nuance                          →  extended_abstract ET  complexe
     * La correspondance était déjà posée par le code ; on la lit désormais sur
     * la donnée configurée au lieu de la redécouvrir sur un nom.
     *
     * ⚠ NE PAS CONFONDRE AVEC LE `type` D'UN OBJECTIF (`js/objectifs.js`), qui
     * porte le même vocabulaire mais est un champ CONFIGURÉ, sur un autre objet.
     * Deux notions distinctes ; seul le mot est commun.
     *
     * @param {Object} critere - Le critère de la grille, avec son `niveauSOLO`
     * @returns {string} Type du critère
     */
    function typeCritereSelonSOLO(critere) {
        // Même défaut que `calculerIPB` et que l'éditeur de grilles : un critère
        // sans étiquette est multistructurel, donc « fondation ».
        const solo = (critere && critere.niveauSOLO) || 'multistructurel';
        // Lot 4, volet B (4 sept. 2026) : « Aucun » n'est ni fondamental, ni
        // transitionnel, ni complexe — l'export le dit tel quel (`niveau_solo` porte
        // déjà `'aucun'`), plutôt qu'un type deviné. ⚠ Le format d'export gagne une
        // valeur dans ces deux colonnes ; un lecteur qui n'attend que trois valeurs
        // doit apprendre la quatrième.
        if (solo === 'aucun') return 'aucun';
        if (solo === 'relationnel') return 'transitionnel';
        if (solo === 'abstrait_etendu') return 'complexe';
        return 'fondamental';
    }

    /**
     * Calcule le numéro de semaine à partir d'une date
     * @param {string} dateStr - Date au format YYYY-MM-DD
     * @param {string} dateDebut - Date de début du trimestre
     * @returns {number} Numéro de semaine
     */
    function calculerSemaine(dateStr, dateDebut) {
        if (!dateStr || !dateDebut) return 0;
        const date = new Date(dateStr);
        const debut = new Date(dateDebut);
        const diff = date - debut;
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    }

    /**
     * Obtient la date d'échéance d'une production
     * @param {string} productionId - ID de la production
     * @param {Array} productions - Liste des productions
     * @returns {string} Date d'échéance
     */
    function obtenirDateEcheance(productionId, productions) {
        const prod = productions.find(p => p.id === productionId);
        if (!prod) return null;
        // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
        if (typeof obtenirEcheanceEffective === 'function') {
            const infoC = db.getSync('infoCours', null);
            const gcId = obtenirIdContexteActif(infoC);
            return obtenirEcheanceEffective(prod, gcId).date;
        }
        return prod.dateEcheance || null;
    }

    /**
     * Construit la section `profilsRLO` de l'export recherche.
     *
     * Produit une entrée par évaluation qui contient le champ `actionsRLO`,
     * que celui-ci soit `null` (artefact non observé) ou peuplé. Les
     * évaluations sans champ `actionsRLO` sont ignorées (pas de donnée
     * disponible — on ne suppose rien).
     *
     * @param {Array} evaluations - Évaluations du trimestre actif
     * @param {Array} productions - Productions du trimestre actif
     * @param {Object} daVersAnonyme - Table DA → ID anonyme (SHA-256 tronqué)
     * @returns {Array} Liste des profils RLO (vide si aucune évaluation qualifie)
     */
    function construireProfilsRLO(evaluations, productions, daVersAnonyme) {
        // Numéro d'artefact = ordre chronologique par date d'échéance
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
        const artefactsOrdonnes = artefactsPortfolio.slice().sort((a, b) => {
            const da = obtenirDateEcheance(a.id, productions) || '';
            const db = obtenirDateEcheance(b.id, productions) || '';
            return String(da).localeCompare(String(db));
        });
        const numeroArtefact = {};
        artefactsOrdonnes.forEach((art, idx) => {
            numeroArtefact[art.id] = idx + 1;
        });

        const arrondir = v => Math.round(v * 10) / 10;
        const profils = [];

        for (const e of evaluations) {
            if (!daVersAnonyme[e.etudiantDA]) continue;
            if (!('actionsRLO' in e)) continue;

            const rlo = e.actionsRLO;
            const prod = productions.find(p => p.id === e.productionId) || {};
            const entry = {
                id_etudiant: daVersAnonyme[e.etudiantDA],
                id_artefact: e.productionId,
                numero_artefact: numeroArtefact[e.productionId] || null,
                type_artefact: prod.titre || prod.type || '',
                niveau_final: e.niveauFinal || null,
                observe: rlo !== null && rlo !== undefined,
                actions: null,
                ratios_cognitifs: null
            };

            if (entry.observe) {
                const reperage  = rlo.reperage  || 0;
                const liaison   = rlo.liaison   || 0;
                const ouverture = rlo.ouverture || 0;
                const incertain = rlo.incertain || 0;
                const incomplet = rlo.incomplet || 0;
                const inexact   = rlo.inexact   || 0;
                const totalCog  = reperage + liaison + ouverture;
                const totalDif  = incertain + incomplet + inexact;

                entry.actions = {
                    gestes_cognitifs: {
                        reperage, liaison, ouverture, total: totalCog
                    },
                    gestes_en_difficulte: {
                        incertain, incomplet, inexact, total: totalDif
                    },
                    total_general: totalCog + totalDif
                };
                entry.ratios_cognitifs = totalCog > 0 ? {
                    reperage_pct:  arrondir((reperage  / totalCog) * 100),
                    liaison_pct:   arrondir((liaison   / totalCog) * 100),
                    ouverture_pct: arrondir((ouverture / totalCog) * 100)
                } : {
                    reperage_pct: 0.0,
                    liaison_pct: 0.0,
                    ouverture_pct: 0.0
                };
            }

            profils.push(entry);
        }

        return profils;
    }

    /**
     * Normalise le nom d'un critère (minuscules, sans accents)
     * @param {string} nom - Nom du critère
     * @returns {string} Nom normalisé
     */
    function normaliserNomCritere(nom) {
        if (!nom) return '';
        return nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');
    }

    /**
     * Calcule la performance agrégée par critère pour chaque étudiant
     * @param {Array} etudiants - Liste des étudiants
     * @param {Array} evaluations - Liste des évaluations
     * @param {Object} daVersAnonyme - Table de correspondance DA → ID anonyme
     * @param {Object} grilleRef - Grille de référence
     * @returns {Array} Performance par critère par étudiant
     */
    function calculerPerformanceParCritere(etudiants, evaluations, daVersAnonyme, grilleRef) {
        const niveauVersScore = { 'I': 0, 'D': 1, 'M': 2, 'E': 3 };

        return etudiants.map(etudiant => {
            const evalEtudiant = evaluations.filter(e => e.etudiantDA === etudiant.da);
            const perfCriteres = {};

            if (grilleRef && grilleRef.criteres) {
                grilleRef.criteres.forEach(critere => {
                    const nomNorm = normaliserNomCritere(critere.nom);
                    const evaluationsCritere = [];

                    evalEtudiant.forEach(ev => {
                        const c = (ev.criteres || []).find(c =>
                            normaliserNomCritere(c.critereNom) === nomNorm
                        );
                        if (c && c.niveauSelectionne) {
                            evaluationsCritere.push(c.niveauSelectionne);
                        }
                    });

                    if (evaluationsCritere.length > 0) {
                        const nbI = evaluationsCritere.filter(n => n === 'I').length;
                        const nbD = evaluationsCritere.filter(n => n === 'D').length;
                        const nbM = evaluationsCritere.filter(n => n === 'M').length;
                        const nbE = evaluationsCritere.filter(n => n === 'E').length;
                        const total = evaluationsCritere.length;

                        perfCriteres[nomNorm] = {
                            nb_evaluations: total,
                            nb_I: nbI,
                            nb_D: nbD,
                            nb_M: nbM,
                            nb_E: nbE,
                            taux_maitrise: Math.round((nbM + nbE) / total * 100) / 100
                        };
                    }
                });
            }

            return {
                id_etudiant: daVersAnonyme[etudiant.da],
                ...perfCriteres
            };
        }).filter(p => p.id_etudiant);
    }

    /**
     * Lance l'export recherche depuis l'interface utilisateur
     * Affiche le résultat dans un modal
     */
    async function lancerExportRecherche() {
        // Afficher modal de chargement
        afficherModalExportRecherche('loading');

        try {
            const result = await exporterFormatRecherche();

            if (result.success) {
                afficherModalExportRecherche('success', result);
            } else {
                afficherModalExportRecherche('error', { message: result.error || 'Une erreur inattendue s\'est produite.' });
            }
        } catch (error) {
            console.error('[Export Recherche] Erreur:', error);
            afficherModalExportRecherche('error', { message: error.message });
        }
    }

    /**
     * Affiche le modal de résultat d'export recherche
     * @param {string} etat - 'loading', 'success', 'error'
     * @param {Object} data - Données à afficher
     */
    function afficherModalExportRecherche(etat, data = {}) {
        // Supprimer modal existant si présent
        const existant = document.getElementById('modal-export-recherche');
        if (existant) existant.remove();

        let contenu = '';

        if (etat === 'loading') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <h2 class="modal-titre">Export en cours...</h2>
                    <div class="texte-centre">
                        <p>Génération de l'export anonymisé.</p>
                        <p class="texte-muted">Veuillez patienter quelques instants.</p>
                    </div>
                </div>
            `;
        } else if (etat === 'success') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <button class="modal-fermer" data-action="fermerModalExportRecherche"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                    <h2 class="modal-titre">Export généré avec succès</h2>

                    <div class="alerte alerte-succes">
                        <strong>Deux fichiers ont été téléchargés</strong>
                    </div>

                    <div class="liste-statistiques">
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbEtudiants || 0}</span>
                            <span class="statistique-label">étudiants anonymisés</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbEvaluations || 0}</span>
                            <span class="statistique-label">évaluations</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbPresences || 0}</span>
                            <span class="statistique-label">présences</span>
                        </div>
                        <div class="statistique-item">
                            <span class="statistique-valeur">${data.nbSnapshots || 0}</span>
                            <span class="statistique-label">snapshots</span>
                        </div>
                    </div>

                    <div class="alerte alerte-attention">
                        <strong>Important</strong><br>
                        Conserve la table de correspondance (<code>*_PRIVE_*.json</code>) en lieu sûr.
                        Elle te permettra de retrouver les correspondances DA si nécessaire.
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-principal" data-action="fermerModalExportRecherche">Fermer</button>
                    </div>
                </div>
            `;
        } else if (etat === 'error') {
            contenu = `
                <div class="modal-contenu modal-compact">
                    <button class="modal-fermer" data-action="fermerModalExportRecherche"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                    <h2 class="modal-titre">Erreur lors de l'export</h2>

                    <div class="alerte alerte-erreur">
                        <strong>L'export a échoué</strong><br>
                        ${data.message || 'Une erreur inattendue s\'est produite.'}
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-principal" data-action="fermerModalExportRecherche">Fermer</button>
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = 'modal-export-recherche';
        modal.className = 'modal-overlay actif';
        modal.innerHTML = contenu;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fermerModalExportRecherche();
        });

        document.body.appendChild(modal);
    }

    /**
     * Ferme le modal d'export recherche
     */
    function fermerModalExportRecherche() {
        const modal = document.getElementById('modal-export-recherche');
        if (modal) modal.remove();
    }

    /* ===============================
       MODE ÉCRITURE TEMPORAIRE
       =============================== */

    /**
     * Bascule le mode écriture temporaire pour les trimestres archivés
     * Permet de faire des corrections ponctuelles (absences, jetons, etc.)
     * @param {boolean} activer - true pour activer le mode correction
     */
    function basculerModeEcritureTemp(activer) {
        if (typeof activer === 'object' && activer !== null) activer = activer.checked;
        if (activer) {
            document.body.classList.add('mode-ecriture-temp');
        } else {
            document.body.classList.remove('mode-ecriture-temp');
        }
    }

    /**
     * Bascule le mode anonymisation depuis le bandeau lecture seule
     * Permet de faire des captures d'écran sans afficher les identités réelles
     * @param {boolean} activer - true pour anonymiser
     */
    async function basculerAnonymisationArchive(activer) {
        if (typeof activer === 'object' && activer !== null) activer = activer.checked;
        if (activer) {
            // Activer le mode anonymisation
            await changerMode('anonymisation');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
            // Changer la couleur du bandeau archive pour indiquer l'anonymisation
            const bandeauArchive = document.getElementById('bandeau-archive');
            if (bandeauArchive) {
                bandeauArchive.style.background = 'var(--bleu-fonce)'; // Bleu très foncé (anonymisation)
            }
        } else {
            // Retour au mode normal
            await changerMode('normal');
            // Masquer le bandeau-mode car on a déjà le bandeau archive
            const bandeauMode = document.getElementById('bandeau-mode');
            if (bandeauMode) {
                bandeauMode.classList.add('u-hide');
            }
            // Restaurer la couleur du bandeau archive
            const bandeauArchive = document.getElementById('bandeau-archive');
            if (bandeauArchive) {
                bandeauArchive.style.background = 'var(--bleu-clair, #065dbb)';
            }
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    // Fonctions publiques
    window.obtenirTrimestres = obtenirTrimestres;
    window.enumererTrimestres = enumererTrimestres;
    window.obtenirTrimestreActif = obtenirTrimestreActif;
    window.obtenirTrimestreId = obtenirTrimestreId;
    window.cle = cle;
    window.cleSource = cleSource;
    window.sessionDepuisMois = sessionDepuisMois;
    window.nomSession = nomSession;
    window.creerTrimestre = creerTrimestre;
    window.changerTrimestreActif = changerTrimestreActif;
    window.forcerMigration = forcerMigration;
    window.migrerResidusClesNues = migrerResidusClesNues;   // #464 (testabilité + relance console si besoin)
    window.migrerVersMultiTrimestres = migrerVersMultiTrimestres;
    window.initialiserModuleTrimestres = initialiserModuleTrimestres;

    // Fonctions d'archivage
    window.archiverTrimestre = archiverTrimestre;
    window.desarchiverTrimestre = desarchiverTrimestre;
    // 🆕 #361 : suppression définitive (garde anti-actif ; parcours UI avec
    // confirmation forte dans trimestre-v2-liste.js → confirmerSuppressionTrimestre)
    window.supprimerTrimestre = supprimerTrimestre;
    window.estTrimestreArchive = estTrimestreArchive;
    // Exposé pour la sentinelle C2 (#358) : SSOT d'usage des modèles par trimestre
    // (réconcilie productions + évaluations grade-bearing).
    window.identifierTemplatesUtilises = identifierTemplatesUtilises;
    // Exposé pour la sentinelle SPECIAL_ARCHIVE (#358) : le snapshot d'archivage lit la
    // source des grilles/échelles dans la copie namespacée `${trim}_*`, pas le global.
    window.creerSnapshotRessources = creerSnapshotRessources;
    // 🆕 C1 (#358) : socle de migration (peuplement des copies namespacées). Exposé
    // pour la sentinelle d'intégrité + le câblage boot (migration_modeles_namespacees_done).
    window.migrerModelesVersNamespace = migrerModelesVersNamespace;
    window.migrerCartouchesVersNamespace = migrerCartouchesVersNamespace;
    // 🆕 G4 (#358) : vidage de la clé globale héritée (dernière étape, au boot après C1).
    // Exposé pour le câblage boot + la sentinelle (préservation des orphelins non capturés).
    window.viderModelesGlobalHerite = viderModelesGlobalHerite;
    // 🆕 #358 (Option A) : helpers de résolution namespacée des modèles.
    // toutesGrillesTravail/toutesEchellesTravail = union inter-trimestre (sites POOL) ;
    // resoudreModeleParId = namespace actif puis repli pool (sites résolution-par-id).
    window.toutesGrillesTravail = toutesGrillesTravail;
    window.toutesEchellesTravail = toutesEchellesTravail;
    window.resoudreModeleParId = resoudreModeleParId;
    window.calculerStatistiquesFinales = calculerStatistiquesFinales;
    window.mettreAJourBandeauArchive = mettreAJourBandeauArchive;
    window.basculerModeEcritureTemp = basculerModeEcritureTemp;
    window.basculerAnonymisationArchive = basculerAnonymisationArchive;

    // Fonctions d'export recherche
    window.exporterFormatRecherche = exporterFormatRecherche;
    window.genererCleAnonymisation = genererCleAnonymisation;
    window.lancerExportRecherche = lancerExportRecherche;
    window.fermerModalExportRecherche = fermerModalExportRecherche;

    // Purge des trimestres orphelins (5.5.4)
    function listerTrimestresOrphelins() {
        const trimestres = obtenirTrimestres();
        const actif = obtenirTrimestreActif();
        const prefixeActif = actif ? actif.id + '_' : null;

        // #388 : scanner TOUTES les couches synchrones (localStorage ∪ memoryCache)
        // — un trimestre orphelin dont les clés ont basculé hors localStorage
        // (quota) était invisible à l'outil. Taille best-effort (les clés en
        // memoryCache seulement comptent 0 octet localStorage).
        const prefixesTrouves = new Map();
        const clesStockage = (typeof db.keysSync === 'function') ? db.keysSync() : Object.keys(localStorage);
        for (let i = 0; i < clesStockage.length; i++) {
            const cle = clesStockage[i];
            const match = cle.match(/^([a-z]\d{4})_/);
            if (match) {
                const prefixe = match[1];
                if (!prefixesTrouves.has(prefixe)) {
                    prefixesTrouves.set(prefixe, { cles: 0, taille: 0 });
                }
                const info = prefixesTrouves.get(prefixe);
                info.cles++;
                info.taille += (localStorage.getItem(cle) || '').length * 2;
            }
        }

        // Identifier les orphelins (pas le trimestre actif, pas 'demo')
        const orphelins = [];
        prefixesTrouves.forEach((info, prefixe) => {
            const estActif = prefixeActif && prefixeActif.startsWith(prefixe);
            const estDemo = prefixe === 'demo';
            const estDansTrimestres = trimestres.some(t => t.id === prefixe);
            if (!estActif && !estDemo) {
                orphelins.push({
                    prefixe,
                    cles: info.cles,
                    tailleMo: (info.taille / 1024 / 1024).toFixed(2),
                    dansTrimestres: estDansTrimestres
                });
            }
        });

        return orphelins;
    }

    function purgerTrimestresOrphelins(prefixes) {
        // #388 (audit 5 août, rapport C1) : la purge passait par
        // localStorage.removeItem BRUT — la copie IndexedDB survivait et
        // syncToLocalStorageCache RESSUSCITAIT les clés au boot suivant.
        // db.removeSync supprime les TROIS couches (localStorage, memoryCache,
        // IndexedDB, durable via Option C) ; énumération union comme
        // supprimerTrimestre.
        let clesSupprimees = 0;
        const toutesLesCles = (typeof db.keysSync === 'function') ? db.keysSync() : Object.keys(localStorage);
        prefixes.forEach(prefixe => {
            toutesLesCles.forEach(cle => {
                if (cle.startsWith(prefixe + '_')) {
                    db.removeSync(cle);
                    clesSupprimees++;
                }
            });
        });
        return clesSupprimees;
    }

    window.listerTrimestresOrphelins = listerTrimestresOrphelins;
    window.purgerTrimestresOrphelins = purgerTrimestresOrphelins;

    // Constantes exportées pour debug
    window.CLES_NAMESPACEES = CLES_NAMESPACEES;
    window.CLES_GLOBALES = CLES_GLOBALES;

})();
