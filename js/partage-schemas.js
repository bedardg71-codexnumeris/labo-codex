/**
 * partage-schemas.js — Schémas fermés du format `labo-codex-partage-v1`
 *
 * Chantier #329 Voûte Phase 1, lot P1.
 * Plan canonique : `plans de travail/PLAN-VOUTE-PHASES-1-8.md`.
 * Spec source : `docs/architecture/PLAN2-PHASE1-SPEC.md` (24 avril 2026),
 * amendée par les décisions D2/D3/D7 du 11 mai 2026 :
 *   - le manifeste porte le bloc signature DÈS la v1 (champs `signature`,
 *     `clePublique`, `algorithme`, à `null` tant que le lot F n'est pas livré) ;
 *   - les IDs du package sont conservés tels quels ; le préfixage `PARTAGE_*`
 *     se fait à l'import (D7), pas ici.
 *
 * Module de DONNÉES PURES : aucune dépendance, aucun accès au storage, aucun
 * effet. Consommé par `partage-validation.js` (interprète les descripteurs)
 * et `partage-format.js` (projette les entités internes sur ces schémas).
 *
 * Mini-langage des descripteurs de champ :
 *   { type, requis, nullable, max, maxValeur, minValeur, element,
 *     maxLongueurElement, schema, valeurs, valeurExacte }
 *   - type : 'chaine' | 'nombre' | 'booleen' | 'tableau' | 'objet'
 *            | 'objet-libre' | 'dictionnaire-chaines'
 *   - 'objet'        : sous-schéma fermé (clé `schema`) — champ inconnu = rejet
 *   - 'objet-libre'  : structure JSON imbriquée non énumérable (configurations
 *                      de pratiques) — validée structurellement par
 *                      partage-validation (profondeur max, types JSON purs,
 *                      chaînes bornées, aucune clé préfixée `_`)
 *   - 'dictionnaire-chaines' : objet plat { cléLibre: chaîne } (commentaires
 *                      de cartouche, indexés `<critereId>_<niveau>` ; descripteurs
 *                      d'un critère, indexés par code de niveau). `maxCles`
 *                      (facultatif) borne le nombre de clés.
 *   - 'tableau'      : `max` = nombre d'items ; `schema` = schéma fermé des
 *                      items objets, OU `element: 'chaine'` pour un tableau de
 *                      chaînes (bornées par `maxLongueurElement`)
 */
(function () {
    'use strict';

    var partageSchemas = {};

    // ------------------------------------------------------------------
    // Constantes du format
    // ------------------------------------------------------------------

    partageSchemas.FORMAT = 'labo-codex-partage-v1';
    partageSchemas.LICENCE = 'CC BY-NC-SA 4.0';
    partageSchemas.LICENCE_URL = 'https://creativecommons.org/licenses/by-nc-sa/4.0/';

    // Chaîne technique réservée au matériel d'exemple embarqué : toute
    // occurrence dans un champ auteur d'un package entrant = USURPATION_DEMO.
    partageSchemas.AUTEUR_RESERVE = 'Demo Labo Codex';
    // Tout item dont l'ID commence par ce préfixe = item du pack démo, rejet.
    partageSchemas.PREFIXE_ID_DEMO = 'demo-';

    // Bloc signature (D2) — câblé au lot F ; la valeur est tolérée à null d'ici là.
    partageSchemas.ALGORITHME_SIGNATURE = 'ECDSA-P256-SHA-256';

    // Clés racine d'un package. Toute clé hors liste = rejet (niveau 1).
    partageSchemas.CLES_RACINE = ['format', 'manifest', 'entites', 'references', 'medias'];

    // Types d'entités partageables (singulier = item_principal.type / references)
    // et clés correspondantes du dictionnaire `entites` (pluriel).
    partageSchemas.TYPES_ENTITES = ['grille', 'echelle', 'cartouche', 'production', 'pratique'];
    partageSchemas.CLES_ENTITES = {
        grille: 'grilles',
        echelle: 'echelles',
        cartouche: 'cartouches',
        production: 'productions',
        pratique: 'pratiques'
    };

    partageSchemas.NATURES_REFERENCE = ['utilise', 'reprend', 'derive_de'];

    // ------------------------------------------------------------------
    // Limites globales
    // ------------------------------------------------------------------
    // tailleMaxPackageOctets : 10 Mo, CONFIRMÉ par Grégoire le 10 juin 2026
    // (revue du format pré-P2). Couvre largement un package JSON v1 sans
    // médias ; relever cette limite plus tard est gratuit (aucune migration),
    // l'abaisser rejetterait des .lcz en circulation — d'où le départ bas.
    partageSchemas.LIMITES = {
        tailleMaxPackageOctets: 10 * 1024 * 1024,
        maxItemsParType: 50,
        maxReferences: 200,
        maxNiveauxChaineAttribution: 20,
        profondeurMaxObjetLibre: 10,
        longueurMaxChaineLibre: 5000
    };

    // ------------------------------------------------------------------
    // Champs au traitement transversal (tous types d'entités)
    // ------------------------------------------------------------------
    // Flags démo : retirés SILENCIEUSEMENT (pas de rejet) — spec §4 niveau 6,
    // test 10. Cohérent avec le pattern « filtrer plutôt que nettoyer ».
    partageSchemas.CHAMPS_RETIRES_SILENCIEUSEMENT = ['isDemo', 'estDemo'];
    // `auteur` au niveau d'une entité : interdit — l'attribution appartient au
    // manifeste (auteur + chaineAttribution) et aux metadata_cc. À l'export,
    // construirePackage le retire ; à l'import, sa présence = rejet (niveau 3).
    partageSchemas.CHAMPS_INTERDITS_COMMUNS = ['auteur'];
    // Tout champ préfixé `_` est interdit (état interne de l'application).
    partageSchemas.PREFIXE_CHAMP_INTERDIT = '_';

    // ------------------------------------------------------------------
    // Sous-schémas réutilisés
    // ------------------------------------------------------------------

    // Attribution CC portée par les entités. Forme réelle complète de
    // ajouterMetadonnéesCC / ajouterContributeurSiNecessaire (cc-license.js) :
    // CC_LICENSE_DEFAULTS + champs enrichis Beta 95.2. email/site = données
    // d'attribution publiques voulues par la licence CC BY, pas une fuite.
    var SCHEMA_METADATA_CC = {
        licence: { type: 'chaine', max: 100 },
        licence_url: { type: 'chaine', max: 300 },
        licence_resume: { type: 'chaine', max: 300 },
        auteur_original: { type: 'chaine', max: 200 },
        email_auteur: { type: 'chaine', max: 200 },
        site_auteur: { type: 'chaine', max: 300 },
        type: { type: 'chaine', max: 50 },
        nom: { type: 'chaine', max: 200 },
        date_creation: { type: 'chaine', max: 40 },
        date_modification: { type: 'chaine', max: 40 },
        version: { type: 'chaine', max: 20 },
        attribution: { type: 'chaine', max: 500 },
        discipline: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 100 },
        niveau: { type: 'chaine', max: 100 },
        institution: { type: 'chaine', max: 200 },
        description_courte: { type: 'chaine', max: 500 },
        contributeurs: {
            type: 'tableau', max: 50,
            schema: {
                nom: { type: 'chaine', max: 200 },
                date: { type: 'chaine', max: 40 },
                modifications: { type: 'chaine', max: 2000 }
            }
        }
    };

    // Trace de fork (forgée par BibliothequeUI.forgerInspireDe). `idOriginal`
    // est posé à l'import par le pipeline P3 (D7) — accepté dès la v1.
    var SCHEMA_INSPIRE_DE = {
        nom: { type: 'chaine', max: 200 },
        auteur: { type: 'chaine', max: 200 },
        date: { type: 'chaine', max: 40 },
        idOriginal: { type: 'chaine', max: 200 }
    };

    // ------------------------------------------------------------------
    // Schéma du manifeste (spec §3.2 + bloc signature D2)
    // ------------------------------------------------------------------

    partageSchemas.SCHEMA_MANIFESTE = {
        champs: {
            licence: { type: 'chaine', requis: true, valeurExacte: partageSchemas.LICENCE },
            licence_url: { type: 'chaine', max: 300 },
            dateExport: { type: 'chaine', requis: true, max: 40 }, // ISO 8601, parsabilité vérifiée au niveau 2
            auteur: {
                type: 'objet', requis: true,
                schema: {
                    nom: { type: 'chaine', requis: true, max: 200 },
                    courriel: { type: 'chaine', max: 200 },
                    institution: { type: 'chaine', max: 200 },
                    discipline: { type: 'chaine', max: 200 }
                }
            },
            item_principal: {
                type: 'objet', requis: true,
                schema: {
                    type: { type: 'chaine', requis: true, valeurs: partageSchemas.TYPES_ENTITES },
                    id: { type: 'chaine', requis: true, max: 200 }
                }
            },
            chaineAttribution: {
                type: 'tableau', max: partageSchemas.LIMITES.maxNiveauxChaineAttribution,
                schema: {
                    niveau: { type: 'nombre', requis: true, minValeur: 0, maxValeur: 1000 },
                    auteur: { type: 'chaine', requis: true, max: 200 },
                    nomItem: { type: 'chaine', max: 200 },
                    date: { type: 'chaine', max: 40 }
                }
            },
            // #643 (26 sept. 2026) — LE NOM du trimestre d'où viennent les cartouches
            // embarquées (« Automne 2026 »), jamais son id : un id de trimestre est
            // local à l'émettrice et ne dit rien à la destinataire. Posé par
            // `construirePackage` dès qu'une cartouche est lue dans les collections de
            // l'émettrice (le trimestre ACTIF, décision de Grégoire du 31 août) ;
            // absent d'un paquet sans cartouche, d'un ré-export de « Partagés », et de
            // tout fichier émis avant ce lot. Format `v1` prolongé (décision du 25 sept.).
            trimestreCartouches: { type: 'chaine', max: 200 },
            // Bloc signature (D2) — présent dès la v1 pour éviter un format v2
            // au lot F (zéro-dette appliqué au format). null accepté tant que
            // la signature n'est pas câblée.
            signature: { type: 'chaine', nullable: true, max: 1000 },
            clePublique: { type: 'chaine', nullable: true, max: 2000 },
            algorithme: { type: 'chaine', nullable: true, valeurExacte: partageSchemas.ALGORITHME_SIGNATURE }
        }
    };

    // ------------------------------------------------------------------
    // Schémas fermés par type d'entité
    // ------------------------------------------------------------------
    // Inventaires relevés sur les formes RÉELLES (pack-demo-10.js v20.3+,
    // grilles.js, echelles.js, wizard-pratique-v2.js, 10 juin 2026). La spec
    // d'avril résumait des shapes périmées (ex. cartouche « descripteurs ») —
    // ces schémas-ci font foi, l'écart est documenté dans SESSION.md.

    partageSchemas.SCHEMA_ENTITE = {

        grille: {
            champs: {
                id: { type: 'chaine', requis: true, max: 200 },
                nom: { type: 'chaine', requis: true, max: 200 },
                // Lot 1 (3 sept. 2026) — LE TYPE DE LA GRILLE VOYAGE. Même classe
                // que #667/#668/#581 : la projection ne copie que les champs
                // déclarés ici. Sans cette ligne, une grille déclarée
                // « analytique » arriverait sans type, et ses critères neufs
                // naîtraient holistiques chez le destinataire — sans un mot.
                type: { type: 'chaine', max: 50 },
                criteres: {
                    type: 'tableau', requis: true, max: 50,
                    schema: {
                        id: { type: 'chaine', requis: true, max: 200 },
                        nom: { type: 'chaine', requis: true, max: 200 },
                        description: { type: 'chaine', max: 2000 },
                        ponderation: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        type: { type: 'chaine', max: 50 },
                        formule: { type: 'chaine', max: 500 },
                        // #667 — LA FORMULE D'UN CRITÈRE ALGORITHMIQUE VOYAGE.
                        // La projection ne copie que les champs déclarés ici :
                        // sans ces trois lignes, une grille algorithmique
                        // partagée arrivait avec le modèle historique et le
                        // facteur par défaut, quel que soit le choix de son
                        // auteur·e — sans un mot, puisque le calcul, lui,
                        // continuait de fonctionner.
                        modeleFormule: { type: 'chaine', max: 60 },
                        paramsFormule: {
                            type: 'objet',
                            schema: {
                                facteurNormalisation: { type: 'nombre', minValeur: 1, maxValeur: 10000 },
                                motsParErreurCible: { type: 'nombre', minValeur: 1, maxValeur: 10000 },
                                pointsParErreur: { type: 'nombre', minValeur: 0, maxValeur: 100 }
                            }
                        },
                        facteurNormalisation: { type: 'nombre', minValeur: 1, maxValeur: 10000 },
                        // #668 Lot 4 — LA PROJECTION EUF VOYAGE AVEC LA GRILLE.
                        // Même classe de défaut que #667 : sans ces champs, une
                        // grille partagée projette selon le modèle de MIGRATION
                        // et ses paliers d'origine, quel que soit le réglage de
                        // son auteur·e — sans un mot, puisque la projection
                        // continue de fonctionner.
                        // ⚠ TROIS champs, pas deux. `modeleProjection` est le
                        // seul qui décide du modèle (`evaluation-projection.js`
                        // :315) : transporter les paramètres sans lui les
                        // ferait lire par un modèle reconstitué.
                        modeleProjection: { type: 'chaine', max: 60 },
                        paramsProjection: {
                            type: 'objet',
                            schema: {
                                motsReference: { type: 'nombre', minValeur: 1, maxValeur: 100000 },
                                erreursTolerees: { type: 'nombre', minValeur: 1, maxValeur: 10000 },
                                nomServiceAide: { type: 'chaine', max: 200 },
                                lienServiceAide: { type: 'chaine', max: 500 }
                            }
                        },
                        // ⚠ `ratioMax: null` est le palier TERMINAL — une valeur
                        // signifiante, pas une absence. `nullable` est ce qui
                        // l'empêche d'être rejetée à l'arrivée ; sans lui, tout
                        // package portant des paliers serait refusé en bloc.
                        paliersProjection: {
                            type: 'tableau', max: 20,
                            schema: {
                                cle: { type: 'chaine', requis: true, max: 100 },
                                libelle: { type: 'chaine', max: 200 },
                                sansErreur: { type: 'booleen' },
                                ratioMax: { type: 'nombre', nullable: true, minValeur: 0, maxValeur: 100 },
                                texte: { type: 'chaine', max: 5000 },
                                texteAide: { type: 'chaine', max: 5000 }
                            }
                        },
                        // #581 — LES ÉNONCÉS D'UN CRITÈRE ALGORITHMIQUE VOYAGENT.
                        // Troisième fois que ce trou se creuse, après #667 (la
                        // formule) et #668 (la projection) : la projection ne
                        // copie que les champs déclarés ici. Sans ces deux
                        // lignes, un critère dont l'auteur·e a réécrit les
                        // phrases arriverait chez le destinataire avec les
                        // phrases par défaut — sans un mot, puisque les phrases
                        // continueraient de sortir.
                        // ⚠ DEUX champs, et `modeleEnonces` est celui qui décide
                        // du modèle : transporter les textes sans lui les ferait
                        // lire sous un modèle reconstitué depuis le NOM du
                        // critère, qui peut ne pas être celui qu'on a réglé.
                        modeleEnonces: { type: 'chaine', max: 60 },
                        // ⚠ Schéma FERMÉ, quatre clés nommées. Une chaîne VIDE
                        // est signifiante — elle fait taire l'énoncé — et doit
                        // donc traverser telle quelle.
                        enonces: {
                            type: 'objet',
                            schema: {
                                decompte:  { type: 'chaine', max: 2000 },
                                priorite:  { type: 'chaine', max: 2000 },
                                concentre: { type: 'chaine', max: 2000 },
                                aucune:    { type: 'chaine', max: 2000 }
                            }
                        },
                        // « Apporter mon matériel », lot 1 (16 oct. 2026) — LES
                        // DESCRIPTEURS D'UN CRITÈRE VOYAGENT. Un texte par niveau
                        // (« à quoi ressemble ce niveau », avant la tâche), lié à
                        // l'échelle pour laquelle il a été écrit : ses clés sont les
                        // codes de niveaux de CETTE échelle. Absent = aucun
                        // descripteur ; aucune grille existante n'en porte.
                        // Même classe que #667/#668/#581 : non déclaré ici, il
                        // disparaîtrait au partage sans un mot. `maxCles` borne le
                        // nombre de niveaux (une échelle en compte rarement plus de 6).
                        descripteurs: {
                            type: 'objet',
                            schema: {
                                echelleId: { type: 'chaine', max: 200 },
                                parNiveau: { type: 'dictionnaire-chaines', maxLongueurElement: 5000, maxCles: 20 }
                            }
                        },
                        // #1120, lot 1 (20 oct. 2026) — LE BARÈME D'UN CRITÈRE ANALYTIQUE VOYAGE.
                        // Ses tranches (`js/bareme.js`) : un identifiant stable, un nom
                        // facultatif, des points (deux nombres, ou deux `null` pour une tranche
                        // « à compléter », lue d'une ancienne réponse) et un texte. Même classe
                        // que `descripteurs` : non déclaré ici, il disparaîtrait au partage. Ce
                        // que le schéma ne dit pas (bornes dans l'ordre, identifiants uniques) :
                        // `bareme.refusStructure`, appelé par partage-validation (niveau 3).
                        // ⚠ Pas de borne haute sur les points : une pondération baissée après
                        // coup laisse une tranche « hors barème », qui voyage telle quelle.
                        bareme: {
                            type: 'tableau', max: 20,
                            schema: {
                                id: { type: 'chaine', requis: true, max: 100 },
                                nom: { type: 'chaine', requis: true, max: 200 },
                                pointsMin: { type: 'nombre', requis: true, nullable: true, minValeur: 0 },
                                pointsMax: { type: 'nombre', requis: true, nullable: true, minValeur: 0 },
                                texte: { type: 'chaine', requis: true, max: 5000 }
                            }
                        },
                        // #669 — LES ONZE RÉTROACTIONS DE FRANÇAIS SE PERDAIENT
                        // AUSSI AU PARTAGE. #511 a comblé ce trou du côté
                        // import/export le 25 août (`5cca483b`) sans ouvrir ce
                        // fichier-ci : la couture ne tenait que d'un bord.
                        // ⚠ L'effet dépasse la perte des textes.
                        // `evaluation-calcul.js:992` choisit le MODE DE CALCUL
                        // sur `sousCriteres.length > 0`. Sans eux, l'évaluation
                        // bascule du mode catégories au mode simple : le
                        // destinataire perd les onze catégories ET la
                        // pondération décimale — la demi-faute de ponctuation.
                        sousCriteres: {
                            type: 'tableau', max: 30,
                            schema: {
                                id: { type: 'chaine', max: 100 },
                                // Chaîne dans les DEUX sources réelles mesurées
                                // (`grilles.js:4090`, `pack-demo-10.js:14093`).
                                // Un code numérique ferait rejeter le package —
                                // bruyamment, ce qui vaut mieux qu'un silence.
                                code: { type: 'chaine', max: 20 },
                                nom: { type: 'chaine', max: 200 },
                                ponderation: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                                retroaction: { type: 'chaine', max: 5000 },
                                // Codes par grille (3 sept. 2026) — la couleur du code
                                // sur la copie. Facultative ; absente, les dix par position.
                                couleur: { type: 'chaine', max: 20 }
                            }
                        },
                        // Structure antérieure aux sous-critères, encore lue par
                        // la migration de `grilles.js:4673` : la transporter est
                        // ce qui permet à cette migration de travailler chez le
                        // destinataire.
                        // ⚠ Son drapeau `_categoriesmigrees` NE PEUT PAS voyager
                        // (tout champ préfixé `_` est interdit au partage). La
                        // migration se redéclenchera donc à l'arrivée — sans
                        // effet : sa garde est `!critere.sousCriteres`, et ceux-ci
                        // voyagent désormais.
                        categoriesErreurs: {
                            type: 'tableau', max: 30,
                            schema: {
                                code: { type: 'chaine', max: 20 },
                                nom: { type: 'chaine', max: 200 },
                                retroaction: { type: 'chaine', max: 5000 }
                            }
                        },
                        niveauSOLO: { type: 'chaine', max: 50 },
                        verrouille: { type: 'booleen' },
                        // Codes par grille (3 sept. 2026) — le geste d'activation : les
                        // sous-critères sont les codes d'annotation. Sans lui, une grille
                        // partagée arriverait avec ses codes mais muette dans la palette.
                        codesDepuisSousCriteres: { type: 'booleen' },
                        // 21 oct. 2026 (étape 0) — la marque d'un critère né sans les dix codes du français :
                        // sans elle, une grille partagée retomberait chez le collègue sur le repli.
                        codesSousCriteresSeulement: { type: 'booleen' }
                    }
                },
                dateCreation: { type: 'chaine', max: 40 },
                dateModification: { type: 'chaine', max: 40 },
                dansBibliotheque: { type: 'booleen' },
                pratiquesCompatibles: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 20 },
                baseSur: { type: 'chaine', max: 200 },
                metadata_cc: { type: 'objet', schema: SCHEMA_METADATA_CC },
                inspireDe: { type: 'objet', schema: SCHEMA_INSPIRE_DE }
            },
            champsInterdits: []
        },

        echelle: {
            champs: {
                id: { type: 'chaine', requis: true, max: 200 },
                nom: { type: 'chaine', requis: true, max: 200 },
                niveaux: {
                    type: 'tableau', requis: true, max: 10,
                    schema: {
                        code: { type: 'chaine', requis: true, max: 20 },
                        nom: { type: 'chaine', requis: true, max: 200 },
                        min: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        max: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        valeurCalcul: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        // ⚠ `valeur` VOYAGE AUSSI — mesuré le 1er septembre 2026.
                        // Le canal d'import-export transporte les DEUX depuis
                        // l'audit du 28 août (`SCHEMAS_IMPORT.echelle`), pour une
                        // raison qui vaut identiquement ici : les données réelles
                        // portent l'un OU l'autre selon leur origine — `valeur`
                        // pour les échelles de catalogue (`echelles-bibliotheque.js`),
                        // `valeurCalcul` pour celles qu'un éditeur a écrites.
                        //
                        // Ce schéma est FERMÉ et `projeterEntite` (partage-format.js)
                        // ne copie que les champs déclarés : une échelle à `valeur`
                        // partait donc SANS AUCUNE valeur ponctuelle, sans erreur ni
                        // avertissement. Témoin WebKit du 1er septembre — l'échelle
                        // « Chimie organique » projetée rendait des niveaux réduits à
                        // {code, nom, min, max, couleur}, et `valeurNumeriqueDuNiveau`
                        // rendait `null` chez le destinataire : sa première évaluation
                        // affichait 0,0 % sans un mot. La liste blanche ne signale pas
                        // ce qu'elle oublie, elle le fait disparaître (#511).
                        valeur: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        couleur: { type: 'chaine', max: 30 },
                        // #680 (25 sept. 2026) — la description du niveau et son
                        // étiquette SOLO se saisissent dans l'éditeur d'échelle ;
                        // `niveauSOLO` part aussi dans l'export recherche.
                        // ⚠ BORNE GÉNÉREUSE POUR UN TEXTE LIBRE, délibérément (relecture
                        // de Cowork) : l'éditeur ne limite pas sa longueur, et
                        // l'auto-contrôle de l'export (`partage-export.js`) REFUSE tout le
                        // paquet au-delà de la borne. À 500, une échelle qui se partageait
                        // avant #680 (le champ tombait) ne se partageait plus du tout.
                        // La borne est un garde-fou contre l'abus, pas une règle de saisie.
                        description: { type: 'chaine', max: 10000 },
                        // Valeur d'une liste fermée (`optionsNiveauSOLOEchelle`).
                        niveauSOLO: { type: 'chaine', max: 50 }
                    }
                },
                // #583 (25 sept. 2026) — LES DEUX REPÈRES DE MAÎTRISE VOYAGENT. Ce
                // sont des CODES de niveau ('D', 'M'…), pas des scores : ils ne
                // valent que rapportés aux `niveaux` ci-dessus. Sans eux, le bilan
                // de la rétroaction (« Présentement… », « Points récurrents »)
                // restait muet chez la personne qui reçoit l'échelle — mesuré en
                // WebKit le 25 sept. (banc `partage-echelle-reperes-583.spec.js`).
                // Un repère qui ne désigne aucun code transporté est retiré à la
                // réception, et la prévisualisation le dit (partage-validation.js).
                seuilSuffisance: { type: 'chaine', max: 20 },
                seuilMaitrise: { type: 'chaine', max: 20 },
                config: {
                    type: 'objet',
                    schema: {
                        typeEchelle: { type: 'chaine', max: 50 },
                        seuilReussite: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                        notePassage: { type: 'chaine', max: 20 },
                        codesPersonnalises: { type: 'chaine', max: 2000 }
                    }
                },
                // #680 — saisies dans l'éditeur (description) et affichées ou
                // filtrées en bibliothèque (discipline). Bornes généreuses : voir
                // `niveaux[].description` ci-dessus.
                // `null` n'est pas accepté (pas de `nullable`) : mesuré le 25 sept.,
                // aucun écrivain ne le produit — l'éditeur écrit '' ou retire la
                // clé, l'import-export assainit en ''.
                description: { type: 'chaine', max: 10000 },
                discipline: { type: 'chaine', max: 1000 },
                dateCreation: { type: 'chaine', max: 40 },
                dateModification: { type: 'chaine', max: 40 },
                dansBibliotheque: { type: 'booleen' },
                pratiquesCompatibles: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 20 },
                baseSur: { type: 'chaine', max: 200 },
                metadata_cc: { type: 'objet', schema: SCHEMA_METADATA_CC },
                inspireDe: { type: 'objet', schema: SCHEMA_INSPIRE_DE }
            },
            champsInterdits: []
        },

        cartouche: {
            champs: {
                id: { type: 'chaine', requis: true, max: 200 },
                grilleId: { type: 'chaine', requis: true, max: 200 },
                nom: { type: 'chaine', max: 200 },
                criteres: {
                    type: 'tableau', max: 50,
                    schema: {
                        id: { type: 'chaine', requis: true, max: 200 },
                        nom: { type: 'chaine', max: 200 }
                    }
                },
                niveaux: {
                    type: 'tableau', max: 10,
                    schema: {
                        code: { type: 'chaine', requis: true, max: 20 },
                        nom: { type: 'chaine', max: 200 }
                    }
                },
                // Dictionnaire plat { '<critereId>_<code>': commentaire }.
                commentaires: { type: 'dictionnaire-chaines', maxLongueurElement: 5000 },
                contexte: { type: 'chaine', max: 2000 },
                verrouille: { type: 'booleen' },
                dansBibliotheque: { type: 'booleen' },
                pratiquesCompatibles: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 20 },
                metadata_cc: { type: 'objet', schema: SCHEMA_METADATA_CC },
                inspireDe: { type: 'objet', schema: SCHEMA_INSPIRE_DE }
            },
            champsInterdits: []
        },

        production: {
            champs: {
                id: { type: 'chaine', requis: true, max: 200 },
                titre: { type: 'chaine', requis: true, max: 200 },
                // Peut être vide ('' = production sans grille, ex. portfolio).
                grilleId: { type: 'chaine', requis: true, max: 200 },
                description: { type: 'chaine', max: 2000 },
                type: { type: 'chaine', max: 50 },
                ponderation: { type: 'nombre', minValeur: 0, maxValeur: 100 },
                objectif: { type: 'chaine', max: 2000 },
                tache: { type: 'chaine', max: 5000 },
                verrouille: { type: 'booleen' },
                regles: {
                    type: 'objet',
                    schema: {
                        nombreARetenir: { type: 'nombre', minValeur: 0, maxValeur: 1000 },
                        minimumCompletion: { type: 'nombre', minValeur: 0, maxValeur: 1000 },
                        nombreTotal: { type: 'nombre', minValeur: 0, maxValeur: 1000 }
                    }
                },
                modeCalcul: { type: 'chaine', max: 50 },
                code: { type: 'chaine', max: 50 },
                dansBibliotheque: { type: 'booleen' },
                metadata_cc: { type: 'objet', schema: SCHEMA_METADATA_CC },
                inspireDe: { type: 'objet', schema: SCHEMA_INSPIRE_DE }
            },
            // Champs LOCAUX au trimestre/cours de l'auteur : non portables,
            // retirés à l'export par construirePackage ; présents dans un
            // package entrant = champ inconnu = rejet (schéma fermé).
            champsInterdits: ['coursId', 'dateEcheance']
        },

        pratique: {
            champs: {
                id: { type: 'chaine', requis: true, max: 200 },
                nom: { type: 'chaine', requis: true, max: 200 },
                // Structures internes propres à chaque famille de pratique
                // (#319) : non énumérables champ par champ — validation
                // structurelle 'objet-libre' (profondeur, types JSON purs,
                // chaînes bornées, aucune clé `_`).
                configuration: { type: 'objet-libre', requis: true },
                calcul_note: { type: 'objet-libre' },
                echelle: { type: 'objet-libre' },
                seuils: { type: 'objet-libre' },
                type: { type: 'chaine', max: 50 },
                variante: { type: 'chaine', nullable: true, max: 50 },
                pratiques: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 20 },
                description: { type: 'chaine', max: 2000 },
                discipline: { type: 'chaine', max: 200 },
                nbEvaluationsPrevues: { type: 'nombre', minValeur: 0, maxValeur: 1000 },
                reglesSpeciales: { type: 'tableau', max: 20, element: 'chaine', maxLongueurElement: 50 },
                dateCreation: { type: 'chaine', max: 40 },
                dateModification: { type: 'chaine', max: 40 },
                dansBibliotheque: { type: 'booleen' },
                metadata_cc: { type: 'objet', schema: SCHEMA_METADATA_CC },
                inspireDe: { type: 'objet', schema: SCHEMA_INSPIRE_DE }
            },
            // `etablissement` est une donnée d'auteur (comme `auteur`) : portée
            // par manifest.auteur.institution, pas par l'entité.
            champsInterdits: ['etablissement']
        }
    };

    /**
     * #680 (25 sept. 2026) — CE QUE LE PARTAGE N'EMPORTE PAS D'UNE ÉCHELLE, ET POURQUOI.
     *
     * Jumeau de `CLES_ECHELLE_NON_TRANSPORTEES` (import-export.js) : le schéma
     * ci-dessus est une liste blanche, et une liste blanche ne signale pas ce
     * qu'elle oublie, elle le fait disparaître. Les repères de maîtrise sont
     * restés en chemin du 28 août au 25 sept. pour cette raison (#583).
     * `tests/unit/sentinelle-transport-echelles.test.js` (AE) relit les champs
     * qu'écrit echelles.js et exige que chacun soit déclaré au schéma OU inscrit
     * ici, avec sa raison.
     *
     * ⚠ DEUX REGISTRES ET NON UN, DÉLIBÉRÉMENT. Les deux canaux n'ont pas le
     * même contrat : l'import-export restaure les documents de la MÊME personne
     * (son auteur, ses dates d'import, son verrou la suivent) ; le partage les
     * remet à QUELQU'UN D'AUTRE, qui ne doit hériter d'aucun de ces états
     * locaux. Un registre commun devrait porter une disposition par canal, et
     * deux modules chargés indépendamment devraient le lire. La source unique
     * est ailleurs : le relevé des champs d'échelle, que le banc fait une seule
     * fois pour les deux canaux.
     */
    partageSchemas.CHAMPS_ECHELLE_NON_PARTAGES = {
        auteur: 'l\'attribution voyage dans le manifeste et la chaîne d\'attribution — interdit à la racine d\'une entité (CHAMPS_INTERDITS_COMMUNS)',
        auteurOriginal: 'ancienne forme de l\'attribution, remplacée par metadata_cc et inspireDe, qui voyagent',
        idOriginal: 'trace de la source d\'un import — la transporter ferait répondre la copie à l\'identifiant de la source (#542)',
        dateImport: 'date à laquelle CETTE personne a importé l\'échelle — un état local, sans sens chez le destinataire',
        dateAjoutBiblio: 'date d\'ajout à la bibliothèque de CETTE personne — un état local ; la duplication chez le destinataire la retire aussi',
        estDemo: 'drapeau du pack démo — retiré silencieusement à la réception (CHAMPS_RETIRES_SILENCIEUSEMENT)',
        isDemo: 'drapeau du pack démo — retiré silencieusement à la réception (CHAMPS_RETIRES_SILENCIEUSEMENT)',
        verrouille: 'verrou posé par CETTE personne sur son échelle — le destinataire décide du sien',
        // Lot 3 (10 oct. 2026) : connus de l'import sélectif depuis ce jour ; le partage n'a pas changé.
        metadata: 'résidu du formulaire CC quand metadata_cc manque — la licence et l\'attribution voyagent par metadata_cc et le manifeste',
        institution: 'copie à la racine de metadata_cc.institution (cc-license.js) — l\'attribution voyage par le manifeste, pas par la racine'
    };

    // ------------------------------------------------------------------
    // Schéma des références inter-entités (spec §3.4)
    // ------------------------------------------------------------------

    partageSchemas.SCHEMA_REFERENCE = {
        champs: {
            depuis: {
                type: 'objet', requis: true,
                schema: {
                    type: { type: 'chaine', requis: true, valeurs: partageSchemas.TYPES_ENTITES },
                    id: { type: 'chaine', requis: true, max: 200 }
                }
            },
            vers: {
                type: 'objet', requis: true,
                schema: {
                    type: { type: 'chaine', requis: true, valeurs: partageSchemas.TYPES_ENTITES },
                    id: { type: 'chaine', requis: true, max: 200 }
                }
            },
            nature: { type: 'chaine', requis: true, valeurs: partageSchemas.NATURES_REFERENCE }
        }
    };

    window.partageSchemas = partageSchemas;
})();
