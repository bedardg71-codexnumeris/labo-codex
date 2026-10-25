/**
 * PRATIQUE CONFIGURABLE - Classe de base pour pratiques JSON
 *
 * Permet de créer des pratiques d'évaluation entièrement configurables
 * via des fichiers JSON, sans écrire de code JavaScript.
 *
 * Cette classe implémente l'interface IPratique et interprète
 * les configurations JSON pour appliquer des règles d'évaluation
 * personnalisées.
 *
 * VERSION : 1.0
 * DATE : 25 novembre 2025
 * AUTEUR : Grégoire Bédard (Labo Codex)
 */

(function() {
'use strict';

// Les méthodes de calcul qui CONSOMMENT une échelle (conversion de niveaux). Le Sommatif
// ('moyenne_ponderee') et les Spécifications ('specifications') notent en % / par seuils.
// #396 : 'pan_par_objectif' retiré — seule conversion_niveaux consomme l'échelle.
// #1149, lot 3b : une seule liste, que la chaîne des étapes d'une pratique lit aussi (l'étape
// « Échelle » n'y paraît que pour ces méthodes).
const METHODES_AVEC_ECHELLE = ['conversion_niveaux'];

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================

class PratiqueConfigurable {
    constructor(config) {
        this.config = config;
        this.valider();
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    /**
     * Valide la structure de la configuration JSON
     * @throws {Error} Si la configuration est invalide
     */
    valider() {
        // Champs TOUJOURS obligatoires (échelle traitée séparément ci-dessous)
        const champsObligatoires = ['id', 'nom', 'calcul_note'];
        for (const champ of champsObligatoires) {
            if (!this.config[champ]) {
                throw new Error(`Champ obligatoire manquant : ${champ}`);
            }
        }

        // Bug 31 mai : l'échelle (IDME) n'est requise que pour les méthodes de calcul
        // qui la CONSOMMENT (conversion de niveaux). Le Sommatif ('moyenne_ponderee')
        // et les Spécifications ('specifications') notent en % / par seuils, sans échelle
        // IDME. Avant, l'échelle était exigée pour TOUTES les pratiques → une SOM/SPE
        // créée au wizard échouait à l'instanciation (« Champ obligatoire manquant : echelle »).
        const echelleRequise = METHODES_AVEC_ECHELLE.includes(this.config.calcul_note?.methode);
        if (echelleRequise && !this.config.echelle) {
            throw new Error('Champ obligatoire manquant : echelle');
        }

        // Vérifier cohérence échelle (si présente)
        if (this.config.echelle && this.config.echelle.type === 'niveaux' && !this.config.echelle.niveaux) {
            throw new Error('Échelle de type "niveaux" requiert le champ "niveaux"');
        }

    }

    // ========================================================================
    // INTERFACE IPratique - Méthodes d'identité
    // ========================================================================

    obtenirNom() {
        return this.config.nom;
    }

    obtenirId() {
        return this.config.id;
    }

    obtenirDescription() {
        return this.config.description || '';
    }

    // Représentations (Session B) — dérivées du TYPE canonique (famille), pas de l'id
    // (les ids configurables sont libres : pan-standards-bedard, pratique-1768…). Le
    // registre normalise le type et retombe sur le défaut (STD) si absent.
    _typeFamille() { return this.config.type || this.config.configuration?.type; }
    obtenirCode() { return window.obtenirCodePratique(this._typeFamille()); }
    obtenirCouleur() { return window.obtenirCouleurPratique(this._typeFamille()); }
    obtenirLabelFamille() { return window.obtenirLabelFamillePratique(this._typeFamille()); }

    // ========================================================================
    // GESTION DES NIVEAUX
    // ========================================================================

    /**
     * Obtient un niveau par son code
     * @param {string} code - Code du niveau (ex: "3", "M", "B")
     * @returns {object} Objet niveau
     */
    /**
     * L'échelle dans laquelle SA note globale se lit — pour une pratique
     * configurable : celle qu'elle EMBARQUE, quand elle travaille par niveaux.
     *
     * ⮕ #542 lot 3, pas 3b. C'est le cas le plus simple des trois : cette
     * pratique porte son échelle en propre (`config.echelle`), et c'est
     * exactement celle avec laquelle elle a converti (`calcul_note.methode ===
     * 'conversion_niveaux'`). Aucune résolution, aucune ambiguïté possible.
     *
     * ⚠ MAIS TOUTES NE TRAVAILLENT PAS PAR NIVEAUX. Une pratique configurable
     * peut calculer sa note autrement — l'échelle n'est exigée à la
     * construction que pour `conversion_niveaux` (`:52`). Quand elle ne porte
     * pas d'échelle de niveaux, sa note globale est un chiffre, et elle le dit :
     * même réponse que la pratique sommative.
     *
     * ⛔ LOT N7 (23 sept. 2026) — JAMAIS POUR UNE STANDARDS. Décision de Grégoire (22 sept.) : le
     * niveau d'une Standards se lit dans l'échelle commune à ses ÉVALUATIONS, pas dans celle rangée
     * dans la pratique — les deux divergent dès qu'une échelle est remplacée (#648). La règle vit
     * dans `lireEchelleNoteGlobale` (profil-etudiant-helpers.js), qui ne demande jamais ceci pour
     * une Standards ; cette garde tient si un autre chemin le demandait. Ce qui passe encore ici :
     * la dénotation.
     *
     * @returns {Object} `{ echelle, raison, message }`
     */
    obtenirEchelleNoteGlobale() {
        var famille = this._typeFamille();
        if ((typeof normaliserIdPratique === 'function' ? normaliserIdPratique(famille) : famille) === 'standards') {
            return {
                echelle: null,
                raison: 'echelle-des-evaluations',
                message: 'Une pratique par standards lit sa note globale dans l\'échelle de ses évaluations, '
                    + 'pas dans celle rangée dans la pratique.'
            };
        }
        var echelle = this.config && this.config.echelle;
        var aDesNiveaux = echelle
            && echelle.type === 'niveaux'
            && Array.isArray(echelle.niveaux)
            && echelle.niveaux.length > 0;

        if (!aDesNiveaux) {
            return {
                echelle: null,
                raison: 'note-chiffree',
                message: 'Cette pratique n\'établit pas sa note globale par niveaux : '
                    + 'il n\'y a pas de niveau atteint à en tirer.'
            };
        }

        return { echelle: echelle, raison: null, message: null };
    }

    getNiveau(code) {
        if (this.config.echelle.type !== 'niveaux') {
            throw new Error('Cette méthode nécessite une échelle de type "niveaux"');
        }

        return this.config.echelle.niveaux.find(n => n.code === code);
    }

    /**
     * Convertit un niveau en pourcentage
     * @param {string} niveauCode - Code du niveau
     * @returns {number} Note en pourcentage
     */
    niveauVersPourcentage(niveauCode) {
        const niveau = this.getNiveau(niveauCode);
        if (!niveau) {
            console.warn(`Niveau inconnu : ${niveauCode}`);
            return 0;
        }
        return niveau.valeur_pourcentage;
    }

    // ========================================================================
    // CALCUL DE LA PERFORMANCE (Indice P)
    // ========================================================================

    /**
     * Calcule l'indice de performance selon la méthode configurée
     * @param {string} da - DA de l'étudiant
     * @returns {number} Indice P (0-1, décimal)
     */
    calculerPerformance(da) {
        // DEN couche 2 (#318) : la note finale est un JUGEMENT saisi par
        // l'enseignant, pas un calcul sur les artefacts. Elle ne dépend donc pas
        // d'indicesCP — un étudiant peut être jugé sans aucune évaluation
        // enregistrée — d'où le court-circuit AVANT le garde indicesCP ci-dessous.
        // Retourne null quand aucune saisie n'existe (« non calculable » : le
        // diagnostic par cellule viendra à DEN-4), pas un zéro. portfolio.js mappe
        // déjà ce null → 0 pour l'indice stocké (P_decimal !== null ? … : 0).
        if (this.config.calcul_note && this.config.calcul_note.methode === 'jugement_global') {
            const pDen = this._calculerPerformanceDenotation(da);
            return pDen === null ? null : pDen / 100;
        }

        // #709 (audit du 5 septembre 2026, constat F-1) — LE CACHE `indicesCP` NE SE LIT QUE
        // POUR LA MÉTHODE QUI EN DÉPEND. Avant, il se lisait ici pour TOUTES les méthodes,
        // AVANT de déléguer, et rendait 0 — un nombre, « constructible » — tant que l'élève n'y
        // avait pas d'entrée : première passe d'indices d'un trimestre, élève ajouté, export
        // lancé avant un recalcul (mesuré au banc F1/F2 : « 0, final » dans le CSV). Une
        // sommative ou une spécification configurable calcule depuis les évaluations, sans
        // cache ; et un cache vide n'est pas une note : null (« non constructible »).
        //
        // Session C : `modalites`/`pratique` (SSOT global) ne sont plus lus — le calcul par
        // famille s'appuie sur this.config, pas sur l'état global actif.
        let P_pct;

        // Pour les pratiques configurables, utiliser la méthode définie dans la config
        switch (this.config.calcul_note.methode) {
            case 'conversion_niveaux':
                // #395 : le store indicesCP est PLAT depuis Beta 95.5 ({date, pratique,
                // C, P, details}). NB : pour une configurable de famille STD, la note
                // autoritative vient du chemin riche (calculerDetailsNoteFinale) en
                // amont ; cette valeur stockée n'est qu'un dernier repli.
                P_pct = this._lireIndiceStocke(da);
                break;

            case 'moyenne_ponderee':
                // #395 : délègue à la vraie moyenne pondérée de PratiqueSommative
                // (patron exact de la délégation SPE du 6 juin, cf. 'specifications'
                // ci-dessous). Instance jetable, lecture seule.
                P_pct = this._calculerPerformanceSommative(da);
                break;

            case 'specifications':
                // Délègue à la vraie logique tout-ou-rien (bundles) de
                // PratiquePanSpecifications, configurée avec la config de CETTE
                // instance (#708 : dans l'une ou l'autre forme). Lecture seule.
                P_pct = this._calculerPerformanceSpecifications(da);
                break;

            // 'jugement_global' (DEN) est traité par court-circuit en tête de
            // calculerPerformance (la note est saisie, indépendante d'indicesCP),
            // donc jamais atteint ici.

            default:
                console.warn(`Méthode de calcul inconnue : ${this.config.calcul_note.methode}`);
                P_pct = this._lireIndiceStocke(da);
        }

        // #395 : une délégation qui ne peut pas produire de valeur (aucune évaluation)
        // rend null → « non calculable », jamais un zéro déguisé.
        if (P_pct === null || P_pct === undefined) {
            return null;
        }

        // Convertir en décimal 0-1
        return P_pct / 100;
    }

    /**
     * #709 — la valeur PLATE stockée dans `indicesCP` pour cet élève (0-100), ou null si le
     * cache n'a pas d'entrée : un cache vide n'est pas un zéro.
     *
     * Audit du 16 sept. 2026, constat A-3 — NI UN CACHE « NON CONSTRUCTIBLE ». La passe
     * d'indices écrit `{ P: 0, noteConstructible: false }` quand la note n'a pas pu se
     * construire (portfolio.js) : ce 0 est un bouche-trou, pas une note. Relu ici sans la
     * garde, il revenait « 0, constructible » à la DEUXIÈME passe — une spécification créée
     * par l'assistant (ni types de travaux ni forfaits) exportait « 0, final » pour toute
     * la classe. Champ additif (#394) : absent ⇒ constructible.
     *
     * 20 sept. 2026 — NI LE CACHE D'UNE AUTRE PRATIQUE (chemin frère d'A-3, trouvé par le rouge
     * du runner GitHub sur « Flux E · SPE »). L'entrée porte la pratique qui l'a calculée
     * (`actuel.pratique`, portfolio.js). Une passe d'indices faite AVANT qu'on applique cette
     * pratique-ci (sous « sommative », le défaut d'un groupe-cours sans pratique) laissait
     * « 85, constructible » ; relu ici, il sortait « SPE, 85, final » à l'export, et chaque passe
     * suivante le réécrivait tel quel. Mesuré : le Mac finissait l'assistant avant cette
     * première passe, le runner non. Champ absent (cache d'avant Beta 95.5) ⇒ lu comme avant.
     * @param {string} da
     * @returns {number|null}
     */
    _lireIndiceStocke(da) {
        const indicesCP = db.getSync(cle('indicesCP'), {}) || {};
        const entree = indicesCP[da];
        if (!entree || !entree.actuel || typeof entree.actuel.P !== 'number') return null;
        if (entree.actuel.noteConstructible === false) return null;
        if (entree.actuel.pratique && entree.actuel.pratique !== this.config.id) return null;
        return entree.actuel.P;
    }

    /**
     * #395 — Performance « moyenne_ponderee » (Sommative configurable) : délègue à
     * la vraie logique de PratiqueSommative (moyenne pondérée des évaluations
     * actives, production.ponderation || 1), au lieu de relire le format dual
     * d'indicesCP retiré en Beta 95.5. Patron identique à la délégation SPE
     * (_calculerPerformanceSpecifications, 6 juin 2026). Lecture seule, instance
     * jetable.
     *
     * @param {string} da - DA de l'étudiant
     * @returns {number|null} P en pourcentage (0-100), null si non calculable
     */
    _calculerPerformanceSommative(da) {
        if (typeof window.PratiqueSommative !== 'function') {
            // Classe absente → repli sur la valeur PLATE connue du store (#709 : null si vide).
            return this._lireIndiceStocke(da);
        }
        const inst = new window.PratiqueSommative();
        const p = inst.calculerPerformance(da); // décimal 0-1, ou null
        if (p === null || p === undefined) return null;
        return this._appliquerVerrousSommatifs(p * 100, da, inst);
    }

    /**
     * #897 (audit du 16 sept. 2026, constat A-1 ; « brancher », tranché par Grégoire le 17) —
     * LE VERROU QUE L'ASSISTANT PROMET S'APPLIQUE À LA NOTE. « Une évaluation doit être réussie
     * pour que la note finale dépasse un plafond » : la moyenne pondérée est plafonnée à
     * `consequence.note_max` quand la copie de l'évaluation nommée est sous le seuil.
     *
     * Mesuré avant d'écrire : `calculerNoteFinale` et ses trois méthodes n'ont AUCUN appelant ;
     * la note d'une sommative configurable ne passait que par PratiqueSommative, qui ne connaît
     * aucune règle. On réemploie ici `appliquerDoubleVerrou` (comparateurs, conséquence), seule
     * pièce de cet ensemble qui se nourrit de ce que l'assistant collecte.
     *
     * - L'évaluation se reconnaît au TITRE de sa production (sans casse ni espaces de bord) :
     *   c'est un nom que l'assistant fait saisir, pas un identifiant.
     * - Seules les copies qui ENTRENT dans la note comptent (règle unique du registre) : tant
     *   que l'évaluation nommée n'est pas notée, le verrou ne s'applique pas.
     * - ⚠ NI LE PLAFONNEMENT NI LE REMPLACEMENT de l'assistant ne s'appliquent : le premier n'a
     *   pour condition qu'un texte libre (« Examen non remis »), le second qu'un nombre de
     *   paires sans dire lesquelles. Rien ici ne les devine (#903).
     *
     * @param {number} note - moyenne pondérée (0-100)
     * @param {string} da
     * @param {Object} inst - l'instance PratiqueSommative qui vient de calculer (mêmes lectures)
     * @returns {number} la note, plafonnée si un verrou se déclenche
     */
    _appliquerVerrousSommatifs(note, da, inst) {
        const conditions = (this.config.calcul_note && this.config.calcul_note.conditions_speciales) || [];
        const verrous = conditions.filter(c => c && c.type === 'double_verrou' && c.condition && c.consequence);
        if (verrous.length === 0) return note;

        const normaliser = (s) => String(s === null || s === undefined ? '' : s).trim().toLowerCase();
        const productions = inst._lireProductions();
        const copies = inst._lireEvaluations().filter(e =>
            e.etudiantDA === da && window.evaluationEntreDansLaNote(e)
        );

        let resultat = note;
        for (const verrou of verrous) {
            const cible = normaliser(verrou.condition.evaluation);
            if (!cible) continue;
            for (const copie of copies) {
                const production = productions.find(p => p.id === copie.productionId);
                if (!production || normaliser(production.titre) !== cible) continue;
                resultat = this.appliquerDoubleVerrou(
                    resultat, [{ nom: verrou.condition.evaluation, note: copie.noteFinale }], verrou
                );
            }
        }
        return resultat;
    }

    /**
     * Performance DEN (Dénotation couche 2, #318) — la note est un JUGEMENT saisi.
     *
     * LECTURE SEULE : lit la collection jugementsDenotation via le module SSOT
     * (denotation-jugements.js) ; ne l'écrit JAMAIS (l'écriture est le geste de
     * l'UI de saisie du profil, DEN-2).
     *
     * Contrat (SPEC §5.1) :
     *  - aucune saisie → null (« non calculable » : pas encore jugé, pas un zéro) ;
     *  - garde « cibles atteintes » (DEN-B) : si une cible n'est pas confirmée
     *    atteinte, la certification est plafonnée à 59 (RREC échec), jamais ≥ 60 —
     *    la garde CONDITIONNE la certification, elle ne fabrique pas la note ;
     *  - toutes cibles confirmées → la note saisie telle quelle (≥ 60 attendue).
     *
     * RREC : dès qu'une saisie existe, produit TOUJOURS un chiffre (59 ou la note),
     * jamais « pas de note ». DEN abandonne le TRI, garde la CERTIFICATION.
     *
     * @param {string} da - DA de l'étudiant
     * @returns {number|null} P en pourcentage (0-100), ou null si aucune saisie
     */
    _calculerPerformanceDenotation(da) {
        if (!window.denotationJugements) {
            console.warn('[DEN] Module denotation-jugements absent — note non calculable.');
            return null;
        }

        const pratiqueId = this.config.id;
        const saisie = window.denotationJugements.lireJugementDenotation(pratiqueId, da);
        if (!saisie) {
            return null; // pas encore jugé → non calculable (diagnostic DEN-4)
        }

        // Cibles de la config (réutilise les objectifs existants — zéro ontologie neuve).
        const cibles = this.config.objectifs
            || (this.config.configuration && this.config.configuration.objectifs)
            || [];
        const confirmations = saisie.ciblesAtteintes || {};
        const toutesAtteintes = cibles.length > 0
            && cibles.every(cible => confirmations[cible.id] === true);

        const note = (typeof saisie.noteFinale === 'number') ? saisie.noteFinale : 0;

        if (!toutesAtteintes) {
            // Non certifié : plafonné à 59 (RREC échec), jamais ≥ 60.
            return Math.min(note, 59);
        }
        return note;
    }

    /**
     * Récit de calcul DEN (Dénotation, #318 / #333 Lot 1) — RecitCalcul ADDITIF,
     * lecture seule. Comble le seul trou du chemin de récit unifié de
     * `simulerIndices` (SOM/SPE l'ont via leur `decrireCalcul`, STD via
     * `calculerDetailsNoteFinale.recit` ; DEN n'en avait aucun → `recit=null`).
     *
     * En Dénotation, il n'y a RIEN à décomposer arithmétiquement (SPEC §2/§8) : la
     * note est un JUGEMENT saisi, gardé par l'atteinte des cibles. Le récit décrit
     * donc l'état du jugement (note attribuée, sort de chaque cible, justification),
     * pas un calcul sur des artefacts.
     *
     * Parité (SSOT) : la `noteFinale` du récit vient DIRECTEMENT de
     * `_calculerPerformanceDenotation` (même garde « cibles → 59 ») — aucun recalcul
     * parallèle. Gardé à `jugement_global` : pour une pratique configurable d'une
     * autre famille (STD/SOM/SPE), retourne `null` (comportement antérieur inchangé).
     *
     * @param {string} da - DA de l'étudiant
     * @returns {Object|null} RecitCalcul `{famille, pratiqueNom, resultats, synthese}`,
     *   ou `null` si la pratique n'est pas DEN ou si aucun jugement n'a été saisi
     *   (« note non encore arrêtée » — jamais un zéro).
     */
    decrireCalcul(da) {
        if (!da) return null;
        if (this.config.calcul_note && this.config.calcul_note.methode === 'specifications') {
            // #708 — le récit d'une SPE configurable vient du même délégué que sa note
            // (parité C2-c), sous le nom de CETTE pratique.
            const inst = this._instanceSpecifications();
            const recit = inst ? inst.decrireCalcul(da) : null;
            return recit ? Object.assign(recit, { pratiqueNom: this.obtenirNom() }) : null;
        }
        if (this.config.calcul_note && this.config.calcul_note.methode === 'moyenne_ponderee') {
            // #921 — le récit d'une sommative configurable vient du même délégué que sa note (patron #708 de la SPE),
            // sous le nom de CETTE pratique. La note finale est celle de `_calculerPerformanceSommative` : le verrou
            // de #897 y est appliqué, et le récit dit quand il a plafonné la moyenne (`moyenneOriginale`).
            if (typeof window.PratiqueSommative !== 'function') return null;
            const recit = new window.PratiqueSommative().decrireCalcul(da);
            if (!recit) return null;
            const moyenne = recit.synthese.noteFinale;
            const note = this._calculerPerformanceSommative(da);
            recit.pratiqueNom = this.obtenirNom();
            recit.synthese.noteFinale = note;
            recit.synthese.plafonnement = (typeof note === 'number' && typeof moyenne === 'number' && note < moyenne)
                ? { moyenneOriginale: moyenne } : null;
            return recit;
        }
        if (!(this.config.calcul_note && this.config.calcul_note.methode === 'jugement_global')) {
            return null; // ni DEN, ni SPE, ni SOM : aucun récit à produire ici
        }
        if (!window.denotationJugements) return null;

        const saisie = window.denotationJugements.lireJugementDenotation(this.config.id, da);
        if (!saisie) {
            return null; // pas encore jugé → non calculable (l'export affichera « note non arrêtée »)
        }

        const cibles = this.config.objectifs
            || (this.config.configuration && this.config.configuration.objectifs)
            || [];
        const confirmations = saisie.ciblesAtteintes || {};
        const labelCible = (c) => c.nom || c.titre || c.description || c.id;

        // Une ligne par cible : son SORT est « confirmée » ou « non confirmée ».
        // niveau/note restent null (DEN ne note pas la cible — elle la confirme).
        const resultats = cibles.map(c => {
            const atteinte = confirmations[c.id] === true;
            return {
                label: labelCible(c),
                date: saisie.date || null,
                niveau: null,
                note: null,
                sort: atteinte ? 'compte' : 'ecarte',
                detail: atteinte ? 'cible confirmée atteinte' : 'cible non confirmée'
            };
        });

        // Note finale = note GARDÉE (parité avec le moteur), 0-100 ou null.
        const noteFinale = this._calculerPerformanceDenotation(da);

        // Plafonnement = la garde s'est-elle déclenchée ? (note saisie ≥ 60 ramenée à 59).
        const noteSaisie = (typeof saisie.noteFinale === 'number') ? saisie.noteFinale : null;
        const plafonne = noteSaisie !== null && noteFinale !== null && noteFinale < noteSaisie;

        return {
            famille: this.obtenirCode(),   // 'DEN' (registre, source unique)
            pratiqueNom: this.obtenirNom(),
            resultats: resultats,
            synthese: {
                formuleTexte: 'note attribuée par jugement (dénotation)',
                noteFinale: noteFinale,
                plafonnement: plafonne
                    ? { type: 'cibles-non-atteintes', noteGardee: noteFinale }
                    : null,
                justification: saisie.justification || ''
            }
        };
    }

    /**
     * L'instance PanSpecifications jetable configurée avec la config de CETTE pratique,
     * ou null si la classe est absente ou la config incomplète.
     *
     * #708 — la config peut être dans la forme du moteur (`tableBundles`) OU dans celle que
     * l'application écrit (`forfaits`, seuil à la racine) : `configurerPratique` traduit.
     * @returns {Object|null}
     */
    _instanceSpecifications() {
        const cfg = this.config.configuration || this.config;
        if (typeof window.PratiquePanSpecifications !== 'function' ||
            !cfg || !Array.isArray(cfg.typesTravaux) ||
            !(Array.isArray(cfg.tableBundles) || Array.isArray(cfg.forfaits))) {
            return null;
        }
        const inst = new window.PratiquePanSpecifications();
        inst.configurerPratique({
            typesTravaux: cfg.typesTravaux,
            tableBundles: cfg.tableBundles,
            forfaits: cfg.forfaits,
            seuilAcceptable: cfg.seuilAcceptable,
            seuilAcceptabilite: cfg.seuilAcceptabilite,
            jetons: cfg.jetons,
            seuilReussite: cfg.seuilReussite,
            seuilExcellence: cfg.seuilExcellence
        });
        return inst;
    }

    /**
     * Délègue le calcul de performance SPE à PratiquePanSpecifications.
     *
     * La logique des paliers (bundles, tout-ou-rien) vit UNIQUEMENT dans la classe
     * codée en dur. Une pratique configurable de type 'specifications' la réutilise
     * en configurant une instance jetable avec sa propre config. Aucune écriture.
     *
     * @param {string} da - DA de l'étudiant
     * @returns {number|null} P en pourcentage (0-100), null si non calculable
     */
    _calculerPerformanceSpecifications(da) {
        const inst = this._instanceSpecifications();
        if (!inst) {
            // Classe absente ou config incomplète → repli sur la valeur PLATE connue
            // (#395 : le format dual actuel.PAN a été retiré en Beta 95.5 ; #709 : null si vide).
            return this._lireIndiceStocke(da);
        }
        const perf = inst.calculerPerformance(da); // 0-1, ou null si pas de données
        // #709 : « pas de données » n'est pas un zéro.
        return (perf === null || perf === undefined) ? null : perf * 100;
    }

    /**
     * Lot N4 (#713) — la cause d'une note absente, lue au moteur de la famille (source unique :
     * `PratiquePanSpecifications.expliquerNoteNonConstructible`). Hors spécifications : null.
     * Configuration sans types ou sans forfaits : l'instance ne se construit pas, et c'est la cause.
     * @param {string} da
     * @returns {string|null}
     */
    expliquerNoteNonConstructible(da) {
        if (!this.config.calcul_note || this.config.calcul_note.methode !== 'specifications') return null;
        const inst = this._instanceSpecifications();
        if (inst) return inst.expliquerNoteNonConstructible(da);
        if (typeof window.PratiquePanSpecifications !== 'function') return null;
        return new window.PratiquePanSpecifications().expliquerNoteNonConstructible(da);
    }

    // ========================================================================
    // CALCUL DE LA COMPLÉTION (Indice C)
    // ========================================================================

    /**
     * Calcule l'indice de complétion
     * Ratio : productions remises par l'étudiant / productions évaluées du groupe
     *
     * 🔧 FIX (23 fév 2026) : Calcul indépendant à partir des productions et évaluations
     * au lieu de lire depuis indicesCP (dépendance circulaire avec calculerEtStockerIndicesCP)
     *
     * #871 (17 sept. 2026) : rend le DÉTAIL — { remis, total } — et non plus le quotient ; `calculerCompletion`
     * en découle (plus bas). Ce que cette famille compte n'a pas changé.
     * @param {string} da - DA de l'étudiant
     * @returns {{remis:number,total:number}|null} Le détail de la complétion, ou null si pas de données
     */
    calculerDetailsCompletion(da) {
        if (!da) return null;

        // Lire les productions et évaluations via le namespace du mode actif
        const productionsBrutes = typeof obtenirDonneesSelonMode === 'function'
            ? obtenirDonneesSelonMode('productions') || []
            : db.getSync(cle('productions'), []);
        const evaluationsBrutes = typeof obtenirDonneesSelonMode === 'function'
            ? obtenirDonneesSelonMode('evaluationsSauvegardees') || []
            : db.getSync(cle('evaluationsSauvegardees'), []);

        // #790, PORTE 3 — L'INDICE C. Cette famille est la seule à lire le stockage
        // en direct : sa PERFORMANCE, elle, délègue aux instances SOM/STD/SPE, déjà
        // filtrées dans leurs accesseurs, et la famille DEN ne lit aucune évaluation
        // (sa note est un jugement saisi). Il n'y a donc que la complétion à fermer ici.
        // Motif de Grégoire : « Certains élèves ne sont pas au premier cours pour des
        // raisons administratives (horaire, inscription, etc.) » — une non-remise en
        // première semaine ne dit rien de la mobilisation de l'élève.
        // ⚠ UN SEUL FILTRE, ET C'EST MESURÉ. Le premier jet en posait DEUX — sur les
        // productions et sur les évaluations. Chacun suffisait à lui seul, donc aucun
        // des deux ne pouvait être rendu ROUGE par un banc : le break-test du 8 sept.
        // les a laissés verts tous les deux. Deux mécanismes pour un seul effet, dont
        // aucun n'est éprouvable, c'est moins sûr qu'un seul qu'on peut faire échouer.
        // Celui qui reste est le plus direct : la production n'entre pas dans le
        // dénominateur, donc ses copies ne sont jamais consultées.
        const dsp = window.ProductionDiagnostique;
        const productions = dsp ? dsp.filtrerProductions(productionsBrutes) : productionsBrutes;
        const evaluations = evaluationsBrutes;

        // Identifier les productions qui ont été évaluées (au moins une copie qui COMPTE existe)
        // Lot A du cadrage du 16 sept. 2026 (#737, #738) — les deux prédicats de pratique-registre.js,
        // les mêmes que la sommative : une copie compte quand elle est ENREGISTRÉE ; une copie NON
        // REMISE (« non-remis » ou « non-recu ») n'est jamais une remise, même notée 0.
        const productionsEvaluees = productions.filter(production => {
            if (production.facultatif) return false;
            return evaluations.some(e =>
                e.productionId === production.id &&
                window.evaluationEntreDansLaNote(e)
            );
        });

        if (productionsEvaluees.length === 0) {
            return null;
        }

        // Compter combien cet étudiant a remis parmi les productions évaluées
        // Lot 30 (17 sept. 2026) — LE DÉTAIL DIT AUSSI LESQUELLES : `productions` porte chaque production comptée au
        // dénominateur et si elle est remise ; `remis` en est le compte (jamais un second calcul). La carte Complétion
        // du profil y lit sa liste des non-remises et son message, comme la fraction (DEMO006 : « 9/10 » à côté de
        // « tous les artefacts remis ! » — la terminale manquante n'était nulle part).
        const detailProductions = productionsEvaluees.map(production => ({
            id: production.id,
            remis: evaluations.some(e =>
                e.etudiantDA === da &&
                e.productionId === production.id &&
                window.evaluationEntreDansLaNote(e) &&
                !window.evaluationNonRemise(e) &&
                !window.evaluationNonRecevable(e)   // lot 30 : tranché par Grégoire, 17 sept. 2026
            )
        }));

        return { remis: detailProductions.filter(p => p.remis).length, total: detailProductions.length, productions: detailProductions };
    }

    /**
     * #871, volet complétion (17 sept. 2026) — L'INDICE C DÉCOULE DU DÉTAIL, jamais l'inverse.
     * « Le pourcentage doit suivre la fraction » (Grégoire, 15 sept.) : `calculerDetailsCompletion` compte,
     * ici on divise. Le profil et le rapport lisent le même détail (`obtenirDetailsCompletion`, portfolio.js) :
     * la fraction affichée à côté de C ne peut plus compter autre chose que lui.
     *
     * @param {string} da - Numéro de dossier d'admission
     * @returns {number|null} Indice C entre 0 et 1, ou null si pas de données
     */
    calculerCompletion(da) {
        const details = this.calculerDetailsCompletion(da);
        return details ? details.remis / details.total : null;
    }

    // ========================================================================
    // DÉTECTION DES DÉFIS
    // ========================================================================

    /**
     * Détecte les défis de l'étudiant selon les seuils configurés
     * @param {string} da - DA de l'étudiant
     * @returns {Array<string>} Liste des défis détectés
     */
    detecterDefis(da) {
        const defis = [];

        const indicesCP = db.getSync(cle('indicesCP'), {});
        const donneesEtudiant = indicesCP[da];

        if (!donneesEtudiant || !donneesEtudiant.actuel) {
            return defis;
        }

        // === PRATIQUE TRADITIONNELLE (critères) ===
        // #395/#396 : store PLAT (Beta 95.5) — l'aiguillage dual SOM/PAN est retiré.
        const donnees = donneesEtudiant.actuel;

        if (!donnees) {
            return defis;
        }

        // Seuils configurés
        const seuils = this.config.seuils || {};
        const seuilFragile = seuils.grande_difficulte || 55;

        // Vérifier chaque critère
        if (donnees.details && donnees.details.moyennesCriteres) {
            const moyennes = donnees.details.moyennesCriteres;

            for (const [critere, valeur] of Object.entries(moyennes)) {
                if (valeur < seuilFragile) {
                    defis.push(critere);
                }
            }
        }

        return defis;
    }

    // ========================================================================
    // IDENTIFICATION DES PATTERNS
    // ========================================================================

    /**
     * Identifie le pattern actuel de l'étudiant
     * @param {string} da - DA de l'étudiant
     * @returns {string} Pattern identifié ('stable', 'fragile', 'difficulte', etc.)
     */
    identifierPattern(da) {
        const defis = this.detecterDefis(da);

        // Logique simplifiée basée sur le nombre de défis
        if (defis.length === 0) {
            return 'stable';
        } else if (defis.length <= 2) {
            return 'fragile';
        } else {
            return 'difficulte';
        }
    }

    // ========================================================================
    // CALCUL DE LA NOTE FINALE — grappe RETIRÉE (#469, 11 oct. 2026)
    // ========================================================================
    // `calculerNoteFinale` et ses cinq méthodes (conversion de niveaux, moyenne pondérée,
    // remplacement-progression, conditions spéciales, plafonnement) n'avaient AUCUN appelant
    // (#897, #903) : la note passe par `calculerPerformance`. Seul `appliquerDoubleVerrou`
    // reste, réemployé par `_appliquerVerrousSommatifs`.

    /**
     * Applique un double verrou
     * Si l'évaluation verrouillée est sous le seuil, la note finale est plafonnée.
     *
     * Référence : PRATIQUE_SOMMATIVE_TRADITIONNELLE dans pratiques-predefines.js
     * @private
     */
    appliquerDoubleVerrou(noteActuelle, evaluations, condition) {
        // Trouver l'évaluation verrouillée
        const nomCible = condition.condition.evaluation;
        const evalVerrouillee = evaluations.find(e =>
            e.nom === nomCible || e.id === nomCible || e.evaluationId === nomCible
        );

        if (!evalVerrouillee || evalVerrouillee.note === null || evalVerrouillee.note === undefined) {
            // Évaluation pas encore passée — pas de verrou appliqué
            return noteActuelle;
        }

        // Vérifier la condition
        const seuil = condition.condition.seuil;
        const comparateur = condition.condition.comparateur || '<';
        let conditionRemplie = false;

        switch (comparateur) {
            case '<':
                conditionRemplie = evalVerrouillee.note < seuil;
                break;
            case '<=':
                conditionRemplie = evalVerrouillee.note <= seuil;
                break;
            case '>':
                conditionRemplie = evalVerrouillee.note > seuil;
                break;
            case '>=':
                conditionRemplie = evalVerrouillee.note >= seuil;
                break;
        }

        // Appliquer la conséquence
        if (conditionRemplie) {
            if (condition.consequence.action === 'echec') {
                // Note plafonnée au maximum spécifié (ex: 55%)
                const noteMax = condition.consequence.note_max || 55;
                return Math.min(noteActuelle, noteMax);
            } else if (condition.consequence.action === 'plafonner') {
                return Math.min(noteActuelle, condition.consequence.valeur);
            }
        }

        return noteActuelle;
    }

    // ========================================================================
    // INTERPRÉTATION DES NIVEAUX
    // ========================================================================

    /**
     * Interprète le niveau de risque selon les seuils du profil
     * @param {number} valeur - Valeur à interpréter (note ou indice)
     * @param {string} typeIndice - 'performance', 'assiduite', 'completion', etc.
     * @returns {string} 'bon', 'acceptable', 'fragile'
     */
    interpreterNiveau(valeur, typeIndice = null) {
        if (this.config.seuils.type === 'aucun') {
            return null;
        }

        // Déterminer les seuils à utiliser
        let seuils;
        if (typeIndice && this.config.seuils.seuils_par_indice?.[typeIndice]) {
            seuils = this.config.seuils.seuils_par_indice[typeIndice];
        } else {
            seuils = {
                va_bien: this.config.seuils.va_bien,
                difficulte: this.config.seuils.difficulte,
                grande_difficulte: this.config.seuils.grande_difficulte
            };
        }

        // Interpréter
        if (valeur >= seuils.va_bien) return 'bon';
        if (valeur >= seuils.difficulte) return 'acceptable';
        return 'fragile';
    }

    // ========================================================================
    // CIBLES D'INTERVENTION RÀI
    // ========================================================================

    /**
     * Génère une cible d'intervention personnalisée
     * @param {string} da - DA de l'étudiant
     * @returns {object} Cible d'intervention
     */
    genererCibleIntervention(da) {
        const defis = this.detecterDefis(da);
        const pattern = this.identifierPattern(da);

        return {
            niveau: defis.length <= 2 ? 2 : 3,
            cibles: defis,
            pattern: pattern,
            recommandation: `Intervenir sur : ${defis.join(', ')}`
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

window.PratiqueConfigurable = PratiqueConfigurable;
window.METHODES_AVEC_ECHELLE = METHODES_AVEC_ECHELLE;   // #1149, lot 3b : la chaîne de la pratique



})();
