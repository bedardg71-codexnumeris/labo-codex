/* ===============================
   MODULE 15b: PROFIL ÉTUDIANT — CALCULS PÉDAGOGIQUES
   Extrait de profil-etudiant.js (zone L3597-5098 résidu post-helpers,
   correspond à L4185-5686 du fichier original) — refactor 18 mai 2026

   Contenu de ce sous-module (14 fonctions, ~1500 LOC) :
   - Conversion IDME : obtenirTableConversionNiveaux, convertirNiveauEnScore
   - Moyennes critères : calculerMoyennesCriteres, calculerMoyennesCriteresRecents
   - IPB : calculerIPB (cyc <30, éclaté en helpers privés Cat-B Track 3 phase 2 — 21 mai 2026)
   - Diagnostic apprentissage : diagnostiquerSuiviApprentissage, diagnostiquerForcesChallenges
   - Indices N derniers : calculerIndicesNDerniersArtefacts
   - Progression : calculerProgressionEleve
   - Défi/Pattern : identifierDefiSpecifique, identifierPatternActuel
   - RàI : determinerNiveauRaiPedagogique, determinerAlerteContextuelle,
     determinerCibleIntervention (cyc 58 — éclatement reporté étape 4)

   Tous les calculs sont promus window.X (décision étape 1 b — convention
   systématique cross-zones). Logique pure, faible risque.

   Chargé AVANT profil-etudiant.js (zone résidu) dans index.html, APRÈS
   profil-etudiant-helpers.js (calculerMoyennesCriteres appelle des helpers
   du module précédent).
   =============================== */

(function() {
'use strict';

/**
 * Table « code de niveau -> score 0-1 », construite depuis l'échelle de
 * l'utilisateur. AUCUN code de niveau n'est présumé.
 *
 * ⚠⚠ CE QUI A ÉTÉ RETIRÉ ICI, ET POURQUOI (#529, 26 août 2026).
 *
 * 1. UN FILTRE NOMINAL. La version précédente ne retenait que les niveaux dont
 *    le code appartenait à `['0','I','D','M','E']`, et choisissait même
 *    l'échelle en cherchant ces codes-là. Une échelle A/B/C/D — ou toute
 *    échelle que l'utilisateur a nommée autrement — produisait une table VIDE,
 *    donc aucun score, donc un profil muet, sans message.
 *
 * 2. UN REPLI FABRIQUÉ : `{0:0, I:0.40, D:0.65, M:0.75, E:1.00}`. Ces cinq
 *    nombres n'étaient les valeurs de PERSONNE — ni de l'échelle lue, ni d'un
 *    réglage. Ils rendaient impossible de distinguer « l'échelle dit 0.65 » de
 *    « on n'a rien trouvé ». Pire : `pratique-pan-standards.js` portait un
 *    SECOND repli aux valeurs DIFFÉRENTES (I:0.55, D:0.70, M:0.80, E:0.90) —
 *    selon le chemin emprunté, un même niveau valait 0.40 ou 0.55.
 *
 * ⮕ RÈGLE APPLIQUÉE (Grégoire, 26 août) : « rien ne doit être codé en dur,
 *   mais l'échelle IDME peut être seedée ». Un seed est une ÉCHELLE LIVRÉE,
 *   que l'utilisateur voit et modifie — pas des nombres qu'un calcul invente
 *   quand il ne trouve rien. En l'absence d'échelle exploitable : `null`, et
 *   l'appelant doit le dire plutôt que d'afficher un chiffre inventé.
 *
 * @param {string} [echelleId] - échelle à lire. Sans elle, l'échelle n'est
 *   résolue que s'il n'y a AUCUNE ambiguïté (une seule échelle disponible).
 * @returns {Object|null} - { <code>: score 0-1 }, ou null si rien d'exploitable
 */
/**
 * Résout une échelle EMBARQUÉE dans une pratique configurable.
 *
 * ⚠⚠ LE DÉFAUT CORRIGÉ ICI : LE DÉPISTAGE ÉTAIT MUET SUR TOUTE ÉVALUATION
 * PRODUITE AVEC UNE PRATIQUE CONFIGURABLE (#542 lot 1, défaut A2 du plan SOLO).
 *
 * Une évaluation faite sous une pratique configurable enregistre
 * `echelleId = 'pratique-<id>'` (`evaluation-chargement.js:251`,
 * `_resoudreEchellePratique`). Or son échelle ne vit PAS dans
 * `echellesTemplates` : elle est embarquée dans
 * `pratiquesConfigurables[].config.echelle`. `obtenirTableConversionNiveaux` ne
 * lisait que le premier gisement — donc, pour ces évaluations, elle rendait
 * `null`, tous les scores valaient `null`, et le profil affichait : aucun défi,
 * pattern « Stable », RàI calculé sur P seul. Sans message.
 *
 * ⮕ ON CONVERGE, ON N'INVENTE PAS. Ce chemin de résolution existe déjà, mot
 * pour mot, dans `evaluation-calcul.js:526` (`calculerNote`). Le dépistage
 * lisait simplement l'autre moitié du monde. Aucune valeur n'est fabriquée :
 * si la pratique ou son échelle a disparu, on rend `null`, comme avant.
 *
 * @param {string} echelleId - identifiant de la forme `pratique-<id>`
 * @returns {Object|null} l'échelle embarquée, ou null si non résolue
 */
function _echelleDePratiqueConfigurable(echelleId) {
    var pratiqueId = String(echelleId).slice('pratique-'.length);
    if (!pratiqueId) return null;
    var pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
    if (!Array.isArray(pratiques)) return null;
    var pratique = pratiques.find(function (p) { return p && p.id === pratiqueId; });
    if (!pratique || !pratique.config || !pratique.config.echelle) return null;
    var echelle = pratique.config.echelle;
    if (!Array.isArray(echelle.niveaux) || echelle.niveaux.length === 0) return null;
    return echelle;
}

/**
 * Résout l'échelle désignée et la rend TELLE QUELLE — ses niveaux, donc ses
 * PLAGES (`min`/`max`) et leurs étiquettes `niveauSOLO`.
 *
 * ⮕ #542 lot 3, pas 3a. Extraite de `obtenirTableConversionNiveaux`, qui faisait
 * DEUX choses : résoudre une échelle, puis la réduire à une table
 * `{ code: score }`. Le dépistage a maintenant besoin des deux moitiés
 * séparément — la table pour convertir un niveau en note, les PLAGES pour situer
 * une moyenne (`situerPourcentageDansEchelle`) et l'étiquette pour l'interpréter
 * (`interpreterNiveauAtteint`).
 *
 * ⚠ **CE QUI N'A PAS BOUGÉ, ET C'EST LE POINT** : la RÉSOLUTION est désormais
 * écrite à UN SEUL endroit. La recopier pour obtenir les plages aurait recréé
 * exactement le patron que #529 a passé une session à défaire — deux chemins
 * parallèles qui finissent par diverger, et un même identifiant qui résout
 * différemment selon l'appelant. Les deux gisements (`echellesTemplates` et
 * l'échelle embarquée d'une pratique configurable, #542 A2), la reconnaissance
 * par `idOriginal`, et le refus de deviner quand plusieurs échelles existent :
 * tout cela vit ici, et `obtenirTableConversionNiveaux` le lit.
 *
 * @param {string} [echelleId] - échelle à lire. Sans elle, l'échelle n'est
 *   résolue que s'il n'y a AUCUNE ambiguïté (une seule échelle utilisable).
 * @returns {Object|null} - l'échelle, avec son tableau `niveaux`, ou `null`
 */
function obtenirEchelleResolue(echelleId = null) {
    // #542 A2 — les échelles de pratique AVANT tout : elles ne vivent pas dans
    // `echellesTemplates`, et le garde-fou « aucune échelle template » plus bas
    // les aurait écartées d'entrée sur un trimestre qui n'en compte aucune.
    if (echelleId && String(echelleId).indexOf('pratique-') === 0) {
        return _echelleDePratiqueConfigurable(echelleId);
    }

    var echelles = db.getSync(cle('echellesTemplates'), []) || [];
    if (!Array.isArray(echelles) || echelles.length === 0) return null;

    var echelle = null;
    if (echelleId) {
        echelle = echelles.find(function (e) {
            return e && (e.id === echelleId || e.idOriginal === echelleId);
        }) || null;
    } else {
        // Sans désignation : on ne DEVINE pas. Une seule échelle = pas
        // d'ambiguïté ; plusieurs = l'appelant doit dire laquelle (chaque
        // évaluation porte son `echelleId`, cf. _lireChampsDOMAutoSave).
        var utilisables = echelles.filter(function (e) {
            return e && Array.isArray(e.niveaux) && e.niveaux.length > 0;
        });
        if (utilisables.length === 1) echelle = utilisables[0];
    }

    // Une échelle SANS aucun niveau ne sert à personne — ni à situer, ni à
    // convertir. C'est le comportement historique de la table, préservé ici.
    if (!echelle || !Array.isArray(echelle.niveaux) || echelle.niveaux.length === 0) return null;

    return echelle;
}

function obtenirTableConversionNiveaux(echelleId = null) {
    var echelle = obtenirEchelleResolue(echelleId);
    return echelle ? _tableDepuisNiveaux(echelle.niveaux) : null;
}

/**
 * Construit la table `{ <code>: score 0-1 }` à partir des niveaux d'une échelle.
 *
 * Extrait le 27 août 2026 (#542 A2) pour que les DEUX gisements d'échelles —
 * `echellesTemplates` et l'échelle embarquée d'une pratique configurable —
 * produisent leur table par le MÊME code. Deux constructions parallèles auraient
 * fini par diverger, ce qui est exactement le patron que #529 a eu à défaire
 * (deux replis aux valeurs différentes selon le chemin emprunté).
 *
 * Un niveau SANS `valeurCalcul` exploitable est volontairement absent de la
 * table : il ne produit pas de note, et le critère sort du calcul. C'est le
 * mécanisme « jugement suspendu », déjà en place de bout en bout.
 *
 * @param {Array} niveaux - niveaux de l'échelle
 * @returns {Object|null} table de conversion, ou null si aucun niveau exploitable
 */
function _tableDepuisNiveaux(niveaux) {
    if (!Array.isArray(niveaux)) return null;
    var table = {};
    niveaux.forEach(function (niveau) {
        if (!niveau || niveau.code == null) return;
        var code = String(niveau.code).trim().toUpperCase();
        if (!code) return;
        // `valeurCalcul` = la note ponctuelle du niveau (CODE -> note chiffrée).
        // C'est la conversion qui sert la notation sommative ; les plages
        // min/max servent l'inverse (note -> code) et ne conviennent pas ici.
        var brut = niveau.valeurCalcul;
        if (brut == null || String(brut).trim() === '') return;
        var valeur = parseFloat(brut);
        if (isNaN(valeur)) return;
        table[code] = valeur / 100;
    });

    return Object.keys(table).length > 0 ? table : null;
}

/**
 * Convertit un niveau IDME en score numérique 0-1 selon l'échelle configurée
 * @param {string} niveau - I, D, M ou E
 * @param {Object} tableConversion - Table de conversion IDME
 * @returns {number} - Score 0-1
 */
function convertirNiveauEnScore(niveau, tableConversion) {
    // #529 — la table peut désormais valoir `null` (aucune échelle
    // exploitable). Avant, elle était toujours un objet grâce à un repli
    // fabriqué ; ce repli est retiré, donc ce garde-fou n'est pas décoratif.
    if (!tableConversion || niveau == null) return null;
    var code = String(niveau).trim().toUpperCase();
    if (!code) return null;
    var score = tableConversion[code];
    // `0` est un score LÉGITIME (niveau « 0 » d'une échelle 0-IDME) : tester
    // la présence, jamais la véracité — `|| null` le transformait en absence.
    return (score === undefined || score === null) ? null : score;
}

/**
 * Calcule les moyennes par critère SRPNF pour un étudiant
 * Parse les rétroactions finales pour extraire les niveaux IDME
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure, rigueur, plausibilite, nuance, francais } (scores 0-1)
 */
/**
 * Table de conversion applicable à UNE évaluation : celle de l'échelle qui a
 * servi à la produire.
 *
 * POURQUOI PAR ÉVALUATION, ET PAS UNE FOIS POUR TOUTES (#529). Chaque
 * évaluation enregistre son `echelleId` (cf. `_lireChampsDOMAutoSave`). Les
 * calculs lisaient pourtant UNE table globale, résolue en cherchant des codes
 * IDME parmi les échelles : deux évaluations produites avec des échelles
 * différentes étaient donc converties avec la même table — celle de l'une des
 * deux, au hasard de l'ordre de stockage.
 *
 * @param {Object} evaluation - évaluation sauvegardée
 * @param {Map} cache - mémo par echelleId (une échelle relue N fois sinon)
 * @returns {Object|null} table de conversion, ou null si non résolue
 */
function tableConversionPourEvaluation(evaluation, cache) {
    var id = (evaluation && evaluation.echelleId) || '';
    if (cache && cache.has(id)) return cache.get(id);
    // Sans `echelleId` (évaluation ancienne), `obtenirTableConversionNiveaux`
    // ne résout que s'il n'y a AUCUNE ambiguïté. Elle ne devine jamais.
    var table = obtenirTableConversionNiveaux(id || null);
    if (cache) cache.set(id, table);
    return table;
}

/**
 * Dit si le dépistage a pu convertir les évaluations d'un élève — et sinon,
 * POURQUOI.
 *
 * ⚠⚠ CE QUE CETTE FONCTION EXISTE POUR EMPÊCHER (#542 lot 1, défaut A3 du plan
 * SOLO). Quand la table de conversion n'est pas résolue, tous les scores valent
 * `null`, donc aucun défi n'est détecté, donc le pattern rendu est « Stable » et
 * le RàI se calcule sur P seul. **Un dépistage muet qui affiche « Stable » est
 * pire qu'un dépistage qui s'avoue aveugle** : le premier ment par omission, et
 * l'enseignant n'a aucun moyen de le savoir.
 *
 * Le choix de #529 — ne pas DEVINER l'échelle quand plusieurs existent — reste
 * juste et n'est pas rouvert ici. C'est son SILENCE qu'on corrige, pas lui.
 *
 * LECTURE SEULE, et volontairement sans `console.warn` : un avertissement de
 * console n'atteint pas Grégoire devant son écran. Le rendu est destiné à
 * l'affichage.
 *
 * @param {string} da - Numéro de DA
 * @returns {Object|null} `null` si tout est convertible (le cas normal, aucun
 *   message à afficher) ; sinon
 *   `{ total, nonConverties, raisons: {pratiqueIntrouvable, echelleIntrouvable,
 *      echelleNonDesignee}, message }`
 */
function diagnostiquerConversionNiveaux(da) {
    var evaluations = (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
        .filter(function (e) {
            // Mêmes exclusions que les calculs : les évaluations remplacées
            // portent l'état d'AVANT une reprise, les compter ferait remonter
            // un modèle périmé.
            return e && e.etudiantDA === da && e.retroactionFinale && !e.remplaceeParId;
        });

    if (evaluations.length === 0) return null;

    var cache = new Map();
    var nonConverties = 0;
    var raisons = { pratiqueIntrouvable: 0, echelleIntrouvable: 0, echelleNonDesignee: 0 };

    evaluations.forEach(function (evaluation) {
        if (tableConversionPourEvaluation(evaluation, cache)) return;
        nonConverties++;
        var id = evaluation.echelleId || '';
        if (id.indexOf('pratique-') === 0) raisons.pratiqueIntrouvable++;
        else if (id) raisons.echelleIntrouvable++;
        else raisons.echelleNonDesignee++;
    });

    if (nonConverties === 0) return null;

    // Le message NOMME la cause, parce qu'elles ne se réparent pas pareil :
    // une échelle non désignée se règle en rouvrant l'évaluation, une échelle
    // introuvable se règle en la recréant (cf. la réparation du 5 août).
    var causes = [];
    if (raisons.echelleNonDesignee > 0) {
        causes.push(raisons.echelleNonDesignee + ' ne désigne'
            + (raisons.echelleNonDesignee > 1 ? 'nt' : '')
            + ' aucune échelle, et ce trimestre en compte plusieurs');
    }
    if (raisons.echelleIntrouvable > 0) {
        causes.push(raisons.echelleIntrouvable + ' désigne'
            + (raisons.echelleIntrouvable > 1 ? 'nt' : '')
            + ' une échelle introuvable dans ce trimestre');
    }
    if (raisons.pratiqueIntrouvable > 0) {
        causes.push(raisons.pratiqueIntrouvable + ' désigne'
            + (raisons.pratiqueIntrouvable > 1 ? 'nt' : '')
            + ' l\'échelle d\'une pratique qui n\'existe plus');
    }

    var toutes = (nonConverties === evaluations.length);
    return {
        total: evaluations.length,
        nonConverties: nonConverties,
        raisons: raisons,
        message: (toutes
            ? 'Aucune des ' + evaluations.length + ' évaluations de cet élève n\'a pu être convertie'
            : nonConverties + ' des ' + evaluations.length + ' évaluations de cet élève n\'ont pas pu être converties')
            + ' : ' + causes.join(' ; ') + '. '
            + (toutes
                ? 'Les critères, les défis et le pattern ci-dessous ne reposent donc sur AUCUNE donnée de performance — ne les lis pas comme un portrait de l\'élève.'
                : 'Le portrait ci-dessous est calculé sur les autres seulement.')
    };
}

/**
 * Calcule les moyennes des critères SRPNF sur TOUTES les évaluations de l'étudiant
 * Utilisé pour la pratique sommative (SOM) qui considère toutes les évaluations
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Moyennes par critère ou null
 */
function calculerMoyennesCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Filtrer toutes les évaluations de l'étudiant avec rétroaction finale
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);


    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        if (!window._avertiGrilleMoyennes) {
            console.warn('⚠️ Pas de grille de référence - calcul moyennes impossible');
            window._avertiGrilleMoyennes = true;
        }
        return null;
    }

    // #529 — la table dépend de l'échelle de CHAQUE évaluation, pas d'une
    // échelle globale devinée. Cache pour ne pas relire N fois la même.
    const cacheTables = new Map();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)

    evaluationsEleve.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauEnScore(niveauIDME, tableConversionPourEvaluation(evaluation, cacheTables));

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });


    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé pour compatibilité avec l'interface
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        if (scores.length > 0) {
            moyennes[cleStandard] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleStandard] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

// G2-b (#436) : fenêtre « artefacts récents » du profil. 3 cours × 2 artefacts.
// Valeur effective inchangée depuis toujours — voir le commentaire dans
// calculerMoyennesCriteresRecents pour pourquoi elle n'était pas une constante.
const NB_ARTEFACTS_RECENTS_DEFAUT = 6;

/**
 * Calcule les moyennes des critères sur les N derniers artefacts
 * Spécifique à la PAN-maîtrise (regarde les artefacts récents, pas toutes les évaluations)
 * Utilise la grille de référence configurée pour les critères.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {number} nombreArtefacts - Nombre d'artefacts récents à considérer (défaut: NB_ARTEFACTS_RECENTS_DEFAUT)
 * @returns {Object|null} - Moyennes par critère (clés normalisées) ou null
 */
function calculerMoyennesCriteresRecents(da, nombreArtefacts = null) {
    if (nombreArtefacts === null) {
        // G2-b (#436, 9 août 2026) : ce défaut lisait `configPAN.nombreCours`,
        // un champ du miroir qu'AUCUN code n'écrit — il rendait donc toujours 3,
        // et la valeur effective était toujours 6. La lecture fantôme est
        // retirée ; la constante dit ce que le code faisait réellement.
        // (Le moteur STD code d'ailleurs le même 3 en dur, cf. _lireConfiguration.)
        nombreArtefacts = NB_ARTEFACTS_RECENTS_DEFAUT;
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (ou moins si pas assez)
    const derniersArtefacts = evaluationsEleve.slice(0, nombreArtefacts);


    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - calcul moyennes critères récents impossible');
        return null;
    }

    // #529 — une table PAR évaluation (chacune porte son `echelleId`).
    const cacheTables = new Map();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)

    derniersArtefacts.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauEnScore(niveauIDME, tableConversionPourEvaluation(evaluation, cacheTables));

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });


    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé en minuscules (cohérent avec calculerMoyennesCriteres)
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        if (scores.length > 0) {
            moyennes[cleStandard] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleStandard] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

// [Phase 6] calculerIndiceBlocage() supprimé — remplacé par calculerIPB() + diagnostiquerSuiviApprentissage()

// [Phase 6] calculerProgressionBlocage() supprimé — utilisait calculerIndiceBlocage() retiré ci-dessus

function _normaliserNomCritereIPB(nom) {
    var n = (nom || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
    return n.startsWith('francais') ? 'francais' : n;
}

function _filtrerEtTrierEvaluationsIPB(evaluations, da, productionsIds) {
    var filtrees = evaluations.filter(function (e) {
        return e.etudiantDA === da &&
            productionsIds.indexOf(e.productionId) >= 0 &&
            e.retroactionFinale &&
            e.criteres && Array.isArray(e.criteres);
    });
    // Trier chronologiquement (plus récent d'abord)
    filtrees.sort(function (a, b) {
        var dateA = a.dateEvaluation || a.dateCreation || '';
        var dateB = b.dateEvaluation || b.dateCreation || '';
        return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
    });
    return filtrees;
}

function _calculerScoreMultiArtefactIPB(ev, nomsMulti, cacheTables) {
    // #529 — l'échelle est celle de CETTE évaluation, pas une globale devinée.
    var tableConversion = tableConversionPourEvaluation(ev, cacheTables);
    var scores = {};
    ev.criteres.forEach(function (cs) {
        var score = convertirNiveauEnScore(cs.niveauSelectionne, tableConversion);
        if (score === null) return;
        var nomEval = _normaliserNomCritereIPB(cs.critereNom);
        nomsMulti.forEach(function (cm) {
            if (cm.nom === nomEval || cm.nom.startsWith(nomEval) || nomEval.startsWith(cm.nom)) {
                scores[cm.nom] = score;
            }
        });
    });
    // Moyenne pondérée adaptative (ignorer les critères absents)
    var totalPond = 0;
    var totalScore = 0;
    nomsMulti.forEach(function (cm) {
        if (scores[cm.nom] !== undefined) {
            var pond = cm.ponderation || 1;
            totalPond += pond;
            totalScore += scores[cm.nom] * pond;
        }
    });
    if (totalPond === 0) return null;
    return { score: totalScore / totalPond, details: scores };
}

function _construireHistoriqueIPB(evaluationsEleve, productions, nomsMulti, cacheTables) {
    var prodMap = {};
    productions.forEach(function (p) { prodMap[p.id] = p; });
    var historiqueRecentsVersAnciens = [];
    for (var h = 0; h < evaluationsEleve.length; h++) {
        var ev = evaluationsEleve[h];
        var res = _calculerScoreMultiArtefactIPB(ev, nomsMulti, cacheTables);
        var prod = prodMap[ev.productionId];
        var nomActivite = '';
        if (prod) {
            nomActivite = prod.activiteApprentissage || prod.description || prod.titre || prod.nom || '';
        }
        historiqueRecentsVersAnciens.push({
            score: res ? res.score : null,
            productionId: ev.productionId,
            productionTitre: nomActivite,
            date: (ev.dateEvaluation || ev.dateCreation || '').substring(0, 10),
            estJeton: !!(ev.repriseDeId || ev.jetonRepriseApplique || ev.jetonRepriseCibleeApplique),
            evaluationId: ev.id || ev.evaluationId || ''
        });
    }
    return historiqueRecentsVersAnciens.slice().reverse(); // ancien → récent
}

function _determinerDirectionScoreIPB(actuel, precedent, seuilProgression) {
    if (actuel === null || precedent === null) return '→'; // →
    var delta = actuel - precedent;
    if (delta > seuilProgression) return '↗'; // ↗
    if (delta < -seuilProgression) return '↘'; // ↘
    return '→'; // →
}

function _identifierCriteresEnDefiIPB(dernierEvaluation, nomsMulti, cacheTables, seuilDefi) {
    if (!dernierEvaluation) return [];
    var dernierResult = _calculerScoreMultiArtefactIPB(dernierEvaluation, nomsMulti, cacheTables);
    if (!dernierResult) return [];
    var criteresEnDefi = [];
    nomsMulti.forEach(function (cm) {
        if (dernierResult.details[cm.nom] !== undefined && dernierResult.details[cm.nom] < seuilDefi) {
            criteresEnDefi.push(cm.nom);
        }
    });
    return criteresEnDefi;
}

/**
 * Calcule l'Indice de Persistance du Blocage (IPB) sur les critères multistructurels.
 * Compte les artefacts consécutifs récents dont le score pondéré des critères
 * multistructurels est sous le seuil de défi configurable.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { ipb, scoreActuel, scorePrecedent, direction, criteresMulti, criteresEnDefi }
 */
function calculerIPB(da) {
    var grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres) return null;

    // Filtrer les critères multistructurels (défaut si pas de tag)
    var criteresMulti = grille.criteres.filter(function (c) {
        return (c.niveauSOLO || 'multistructurel') === 'multistructurel';
    });
    if (criteresMulti.length === 0) return null;

    var seuilDefi = obtenirSeuil('defiSpecifique') || 0.70;
    var seuilProgression = (obtenirSeuil('progressionArtefacts') || 0.10);
    var fenetreN = obtenirNombreProductionsPourPatterns() || 3;

    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    var productions = obtenirDonneesSelonMode('productions') || [];
    var productionsIds = obtenirIdsProductionsEvaluables(productions);
    var cacheTables = new Map();   // #529 — une table par échelle d'évaluation

    var evaluationsEleve = _filtrerEtTrierEvaluationsIPB(evaluations, da, productionsIds);
    if (evaluationsEleve.length === 0) return null;

    // Normaliser les noms des critères multistructurels
    var nomsMulti = criteresMulti.map(function (c) {
        return { nom: _normaliserNomCritereIPB(c.nom), ponderation: c.ponderation || 0 };
    });

    // Scores pour les artefacts récents (dans la fenêtre IPB)
    var limite = Math.min(evaluationsEleve.length, fenetreN);
    var scoresRecents = [];
    for (var i = 0; i < limite; i++) {
        var result = _calculerScoreMultiArtefactIPB(evaluationsEleve[i], nomsMulti, cacheTables);
        scoresRecents.push(result ? result.score : null);
    }

    // IPB : compter les consécutifs sous le seuil (depuis le plus récent)
    var ipb = 0;
    for (var j = 0; j < scoresRecents.length; j++) {
        if (scoresRecents[j] !== null && scoresRecents[j] < seuilDefi) {
            ipb++;
        } else {
            break;
        }
    }

    var scoreActuel = scoresRecents.length > 0 ? scoresRecents[0] : null;
    var scorePrecedent = scoresRecents.length > 1 ? scoresRecents[1] : null;
    var direction = _determinerDirectionScoreIPB(scoreActuel, scorePrecedent, seuilProgression);

    return {
        ipb: ipb,
        scoreActuel: scoreActuel,
        scorePrecedent: scorePrecedent,
        direction: direction,
        criteresMulti: nomsMulti.map(function (c) { return c.nom; }),
        criteresEnDefi: _identifierCriteresEnDefiIPB(evaluationsEleve[0], nomsMulti, cacheTables, seuilDefi),
        fenetre: limite,
        seuil: seuilDefi,
        scoresParArtefact: scoresRecents.slice().reverse(), // ancien → récent
        historiqueComplet: _construireHistoriqueIPB(evaluationsEleve, productions, nomsMulti, cacheTables)
    };
}

/**
 * Diagnostique le portrait de suivi de l'apprentissage.
 * Croise l'IPB (persistance) avec la direction pour produire un diagnostic en langage clair.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { diagnostic, ipb, direction, scoreActuel, niveauRaI, criteresEnDefi, couleur }
 */
function diagnostiquerSuiviApprentissage(da) {
    var ipbData = calculerIPB(da);
    if (!ipbData) return null;

    var ipb = ipbData.ipb;
    var dir = ipbData.direction;
    var diagnostic, couleur, niveauRaI;

    if (ipb === 0) {
        diagnostic = 'Maîtrise acquise';
        couleur = '#28a745';
        niveauRaI = 1;
    } else if (ipb === 1 && dir === '↗') {
        diagnostic = 'Difficulté résolue';
        couleur = '#28a745';
        niveauRaI = 1;
    } else if (ipb === 1) {
        diagnostic = 'Difficulté émergente';
        couleur = '#ff9800';
        niveauRaI = 1;
    } else if (ipb === 2 && dir === '↗') {
        diagnostic = 'Progression';
        couleur = '#2196f3';
        niveauRaI = 2;
    } else if (ipb === 2 && dir === '→') {
        diagnostic = 'Plateau';
        couleur = '#ff9800';
        niveauRaI = 2;
    } else if (ipb === 2) {
        diagnostic = 'Difficulté constante';
        couleur = '#dc3545';
        niveauRaI = 2;
    } else {
        // ipb >= 3
        if (dir === '↗') {
            diagnostic = 'Progression lente';
            couleur = '#2196f3';
            niveauRaI = 2;
        } else {
            diagnostic = 'Difficulté persistante';
            couleur = '#dc3545';
            niveauRaI = 3;
        }
    }

    return {
        diagnostic: diagnostic,
        ipb: ipb,
        direction: dir,
        scoreActuel: ipbData.scoreActuel,
        niveauRaI: niveauRaI,
        criteresEnDefi: ipbData.criteresEnDefi,
        criteresMulti: ipbData.criteresMulti,
        couleur: couleur,
        fenetre: ipbData.fenetre,
        seuil: ipbData.seuil,
        scoresParArtefact: ipbData.scoresParArtefact,
        historiqueComplet: ipbData.historiqueComplet
    };
}

// [Phase 6] interpreterIndiceBlocage() supprimé — remplacé par diagnostiquerSuiviApprentissage()

/**
 * Diagnostique les forces et défis selon le seuil pédagogique
 * @param {Object} moyennes - Moyennes par critère
 * @param {number} seuil - Seuil pour identifier une force (défaut: valeur configurable via interpretation-config.js)
 * @returns {Object} - { forces: [], defis: [], principaleForce: '', principalDefi: '' }
 */
function diagnostiquerForcesChallenges(moyennes, seuil = null) {
    // Utiliser le seuil configurable si aucun seuil n'est fourni
    if (seuil === null) {
        seuil = obtenirSeuil('defiSpecifique');
    }
    if (!moyennes) {
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - diagnostic forces/défis impossible');
        console.warn('   → Grille:', grille);
        console.warn('   → Allez dans Conception → Pratiques de notation pour configurer une grille de référence');
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Construire dynamiquement le tableau des critères depuis la grille
    const criteres = grille.criteres.map(c => {
        // Normaliser le nom du critère pour trouver sa clé dans moyennes
        // Ex: "Structure" → "structure", "Plausibilité" → "plausibilite"
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever accents
            .replace(/\s+/g, '');  // Enlever espaces

        return {
            nom: c.nom,
            cle: cleNormalisee,
            score: moyennes[cleNormalisee] ?? null,
            ponderation: c.ponderation || 0
        };
    }).filter(c => c.score !== null); // Garder seulement critères avec score

    // Trier forces et défis (considérer pondération pour importance)
    const forces = criteres.filter(c => c.score >= seuil).sort((a, b) => {
        // Tri primaire : par score descendant
        if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
        // Tri secondaire : par pondération (critères importants en premier)
        return b.ponderation - a.ponderation;
    });

    const defis = criteres.filter(c => c.score < seuil).sort((a, b) => {
        // Tri primaire : par score ascendant (pire défi en premier)
        if (Math.abs(a.score - b.score) > 0.01) return a.score - b.score;
        // Tri secondaire : par pondération (défis importants en premier)
        return b.ponderation - a.ponderation;
    });

    return {
        forces: forces,
        defis: defis,
        principaleForce: forces.length > 0 ? forces[0] : null,
        principalDefi: defis.length > 0 ? defis[0] : null,
        moyennesCriteres: moyennes // Inclure les moyennes pour affichage par niveau IDME
    };
}

/* ===============================
   🎯 SYSTÈME DE CIBLES D'INTERVENTION
   Calcul du Pattern actuel et détermination des cibles d'intervention
   basé sur les indices A-C-P et les critères SRPNF
   =============================== */

/**
 * Calcule les indices sur les N DERNIERS artefacts (chronologiquement)
 *
 * DISTINCTION IMPORTANTE :
 * - Dépistage (pourDepistage=true) : Utilise nombreProductionsAnalyse (défaut 3)
 *   → Détection précoce des patterns pour intervenir à temps
 * - Performance finale (pourDepistage=false) : Utilise nombreARetenir (défaut 4)
 *   → Calcul de la note finale du portfolio
 *
 * @param {string} da - Numéro de DA
 * @param {boolean} pourDepistage - Si true, utilise fenêtre de dépistage (3). Si false, utilise N pour note finale (4)
 * @returns {Object} - { performance, idmeMoyen, francaisMoyen, nbArtefacts }
 */
function calculerIndicesNDerniersArtefacts(da, pourDepistage = false) {
    // Déterminer le nombre d'artefacts selon l'usage
    let nombreArtefacts;
    if (pourDepistage) {
        // Pour dépistage : fenêtre glissante (défauts interpretation-config.js — plus d'UI de réglage, #299)
        nombreArtefacts = obtenirNombreProductionsPourPatterns(); // Défaut 3
    } else {
        // Pour performance finale : N meilleurs artefacts (config portfolio de la pratique active).
        // G2-b (#436) : lu à la SSOT `pratiquesConfigurables` via obtenirConfigPratiqueActive,
        // comme le calcul de la note (G2-a). Le miroir `configPAN.portfolio` qu'on lisait ici
        // ne se rafraîchit qu'à l'APPLICATION d'une pratique : éditer le N dans les réglages
        // changeait la note du profil sans changer ce nombre-ci.
        const cfgActive = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
        nombreArtefacts = cfgActive?.portfolio?.nombreARetenir || 4; // Défaut 4
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() au lieu de db.getSync()
    // pour respecter le namespace du trimestre archivé et le filtrage par coursId
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    if (evaluationsEleve.length === 0) {
        return { performance: 0, idmeMoyen: 0, francaisMoyen: 0, nbArtefacts: 0 };
    }

    // Trier par date de création (la plus récente d'abord)
    // Si pas de date, utiliser l'ordre inverse d'ajout (derniers ajoutés = plus récents)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (selon config PAN, ou moins si pas assez d'artefacts)
    const troisDerniers = evaluationsEleve.slice(0, nombreArtefacts);

    // Calculer la performance moyenne (notes)
    const performance = troisDerniers.reduce((sum, e) => sum + e.noteFinale, 0) / troisDerniers.length / 100;

    // Moyenne des niveaux finaux — #529.
    //
    // CE QUI A ÉTÉ RETIRÉ : `.filter(n => ['I','D','M','E'].includes(n))`. Ce
    // filtre écartait tout niveau final dont le code n'était pas IDME. Pour une
    // échelle A/B/C/D, il écartait TOUS les niveaux, la moyenne tombait à 0 —
    // et 0 n'est pas « aucune donnée », c'est la pire note possible. Le calcul
    // en aval traitait donc un élève sans niveau lisible comme un élève en
    // échec total, sans un mot.
    //
    // Il n'y a plus de liste de codes admis : un niveau compte s'il est
    // convertible par SON échelle, et rien d'autre ne le qualifie.
    const cacheTablesNiveaux = new Map();
    const scoresNiveauxFinaux = troisDerniers
        .map(e => convertirNiveauEnScore(e.niveauFinal, tableConversionPourEvaluation(e, cacheTablesNiveaux)))
        .filter(s => s !== null);

    // ⚠ LE ZÉRO EST CONSERVÉ ICI, DÉLIBÉRÉMENT (#529, 26 août 2026).
    //
    // Rendre `null` serait plus juste — rien de convertible n'est pas la même
    // chose qu'une moyenne de zéro. Mais le contrat de cette fonction distingue
    // déjà l'absence par `nbArtefacts` (cf. le retour anticipé plus haut :
    // `{performance:0, idmeMoyen:0, francaisMoyen:0, nbArtefacts:0}`), et ses
    // consommateurs s'y fient. Changer la convention DANS un chantier de
    // dé-codage-en-dur mêlerait deux corrections dans le même diff, et la
    // seconde n'a pas été demandée. Inscrit au backlog plutôt que glissé ici.
    const idmeMoyen = scoresNiveauxFinaux.length > 0
        ? scoresNiveauxFinaux.reduce((sum, s) => sum + s, 0) / scoresNiveauxFinaux.length
        : 0;

    // Moyenne du critère de LANGUE — #529, correction partielle assumée.
    //
    // CE QUI A DISPARU : une SECONDE expression régulière sur la prose,
    // /FRAN[ÇC]AIS\s+[ÉE]CRIT\s*\(([IDME])\)/gi — même défaut que la
    // première, au même endroit du même fichier. Elle lisait la rétroaction
    // pour retrouver un niveau enregistré structuré dans `criteres[]`.
    //
    // ⚠ CE QUI RESTE EN DUR, ET POURQUOI JE NE L'AI PAS TRANCHÉ SEUL.
    // Reconnaître « le critère de langue » par son NOM reste une convention
    // écrite dans le code. Ce n'est pas un simple libellé : au collégial
    // québécois, le français écrit a un statut à part (épreuve uniforme, CAF),
    // et `_resoudreCibleDefiSpecifique` lui réserve des cibles d'intervention
    // que les autres critères n'ont pas. Le sortir du code suppose que
    // l'utilisateur puisse DÉSIGNER quel critère de sa grille joue ce rôle —
    // une décision de conception qui appartient à Grégoire, pas au refactor
    // qui passe. Inscrit au backlog ; ici, on cesse au moins de dépendre de la
    // prose et des codes IDME.
    const NOM_CRITERE_LANGUE = 'francais';   // à remplacer par un réglage utilisateur
    const scoresFrancais = [];
    const cacheTablesLangue = new Map();

    troisDerniers.forEach(evaluation => {
        if (!Array.isArray(evaluation.criteres)) return;
        const table = tableConversionPourEvaluation(evaluation, cacheTablesLangue);
        evaluation.criteres.forEach(critereSauvegarde => {
            if (!critereSauvegarde) return;
            const nom = String(critereSauvegarde.critereNom || '')
                .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
            if (!nom.startsWith(NOM_CRITERE_LANGUE)) return;
            const score = convertirNiveauEnScore(critereSauvegarde.niveauSelectionne, table);
            if (score !== null) scoresFrancais.push(score * 100);
        });
    });

    const francaisMoyen = scoresFrancais.length > 0
        ? scoresFrancais.reduce((sum, s) => sum + s, 0) / scoresFrancais.length
        : 0;


    return {
        performance: performance,
        idmeMoyen: idmeMoyen,
        francaisMoyen: francaisMoyen,
        nbArtefacts: troisDerniers.length
    };
}

/**
 * Calcule la progression (direction) selon le Guide de monitorage
 * Compare la performance des N artefacts les plus récents (AM) vs les N suivants avec chevauchement (AL)
 * Le nombre N vient des seuils d'interprétation (interpretation-config.js — plus d'UI de réglage, #299)
 *
 * Fenêtre glissante: Si artefacts = A, B, C, ..., N, N+1 (du plus récent au plus ancien)
 * - AM = moyenne(A, B, ..., N)
 * - AL = moyenne(B, C, ..., N+1)
 *
 * Formule: SI(AM > AL + seuil; "↗"; SI(AM < AL - seuil; "↘"; "→"))
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { direction: '↗'|'→'|'↘', interpretation, AM, AL, difference }
 */
function calculerProgressionEleve(da) {
    // 🆕 NOUVELLE LOGIQUE : Basée sur les critères individuels plutôt que sur la note globale
    // Obtenir les directions pour chaque critère
    const pratique = obtenirPratiqueActuelle();
    const directionsCriteres = calculerDirectionsCriteres(da);

    // Vérifier si nous avons suffisamment de données
    const criteres = Object.keys(directionsCriteres);
    const criteresAvecDonnees = criteres.filter(c => directionsCriteres[c].symbole !== '');

    if (criteresAvecDonnees.length === 0) {
        return {
            direction: null,
            interpretation: 'Données insuffisantes',
            AM: null,
            AL: null,
            difference: null,
            nbCriteres: 0,
            criteresDetail: directionsCriteres
        };
    }

    // Compter les critères en amélioration, en baisse, et en plateau
    let nbAmelioration = 0;
    let nbBaisse = 0;
    let nbPlateau = 0;

    criteresAvecDonnees.forEach(critere => {
        const symbole = directionsCriteres[critere].symbole;
        if (symbole === '→') {
            nbAmelioration++;
        } else if (symbole === '←') {
            nbBaisse++;
        } else if (symbole === '—') {
            nbPlateau++;
        }
    });

    // Déterminer la direction globale selon la majorité
    let direction, interpretation;
    if (nbAmelioration > nbBaisse && nbAmelioration > nbPlateau) {
        direction = '↗';
        interpretation = 'Progression';
    } else if (nbBaisse > nbAmelioration && nbBaisse > nbPlateau) {
        direction = '↘';
        interpretation = 'Régression';
    } else {
        direction = '—';
        interpretation = 'Plateau';
    }

    // Calculer une moyenne pondérée des différences pour information
    let sommeDifferences = 0;
    let nbDifferences = 0;
    criteresAvecDonnees.forEach(critere => {
        const diff = parseFloat(directionsCriteres[critere].difference);
        if (!isNaN(diff)) {
            sommeDifferences += diff;
            nbDifferences++;
        }
    });
    const differenceGlobale = nbDifferences > 0 ? (sommeDifferences / nbDifferences).toFixed(1) : '0.0';


    return {
        direction,
        interpretation,
        AM: null, // Non utilisé dans la nouvelle logique
        AL: null, // Non utilisé dans la nouvelle logique
        difference: differenceGlobale,
        nbCriteres: criteresAvecDonnees.length,
        nbAmelioration,
        nbBaisse,
        nbPlateau,
        criteresDetail: directionsCriteres
    };
}

/**
 * Identifie le défi spécifique (critère SRPNF le plus faible) sur les N derniers artefacts
 * Le nombre N vient des seuils d'interprétation (interpretation-config.js — plus d'UI de réglage, #299)
 * Seuil: Valeur configurable (défaut: 71.25%, ajustable via interpretation-config.js)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { defi: <nom du critère le plus faible, tel qu'il est
 *   écrit dans la grille de l'utilisateur> | 'Aucun', score (0-1) | null }
 */
function identifierDefiSpecifique(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return { defi: 'Aucun', score: null };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N plus récents
    const derniers = evaluationsEleve.slice(0, N);

    // #529 (26 août 2026) — CE QUI A DISPARU D'ICI : une expression régulière.
    //
    //   /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi
    //
    // Elle relisait la PROSE de la rétroaction pour y retrouver des scores qui
    // avaient été enregistrés structurés quelques lignes plus tôt, dans
    // `evaluation.criteres[]` (critereId, critereNom, niveauSelectionne — cf.
    // `_collecterCriteresAutoSave`). Trois défauts, du plus visible au plus
    // profond :
    //
    //   1. Les cinq noms de critères de Grégoire y étaient écrits. Une grille
    //      « Méthode / Résultats / Discussion » ne produisait AUCUN score : le
    //      bloc « Forces et défis » restait muet, sans expliquer pourquoi.
    //   2. Les quatre codes IDME aussi. Une échelle A/B/C/D ne matchait rien —
    //      alors que ces libellés sont configurables par l'utilisateur.
    //   3. Même pour Grégoire, la moindre reformulation d'un libellé de
    //      rétroaction cassait le calcul EN SILENCE : plus de match, plus de
    //      score, aucune erreur.
    //
    // La donnée structurée existe depuis la création du dépôt (octobre 2025).
    // Le patron de lecture est celui qu'utilisent déjà `calculerMoyennesCriteres`
    // et le calcul de l'IPB dans ce même fichier : on converge, on n'invente pas.
    const cacheTables = new Map();

    // Accumulation par critereId — identifiant STABLE, contrairement au nom qui
    // peut être renommé d'une grille à l'autre. Le nom n'est gardé que pour
    // l'affichage, et c'est le dernier vu qui l'emporte (le plus récent, les
    // évaluations étant triées).
    const scoresParCritere = new Map();

    derniers.forEach(evaluation => {
        if (!Array.isArray(evaluation.criteres)) return;
        const table = tableConversionPourEvaluation(evaluation, cacheTables);
        evaluation.criteres.forEach(critereSauvegarde => {
            if (!critereSauvegarde) return;
            const score = convertirNiveauEnScore(critereSauvegarde.niveauSelectionne, table);
            if (score === null) return;
            const id = critereSauvegarde.critereId || critereSauvegarde.critereNom;
            if (!id) return;
            if (!scoresParCritere.has(id)) {
                scoresParCritere.set(id, { nom: critereSauvegarde.critereNom || String(id), scores: [] });
            }
            scoresParCritere.get(id).scores.push(score);
        });
    });

    // Identifier le critère le plus faible sous le seuil.
    const seuil = obtenirSeuil('defiSpecifique');
    let defiMinimum = null;
    let scoreMinimum = null;

    scoresParCritere.forEach(entree => {
        if (entree.scores.length === 0) return;
        const moyenne = entree.scores.reduce((somme, s) => somme + s, 0) / entree.scores.length;
        if (moyenne >= seuil) return;
        // `scoreMinimum === null` au départ, et non 1.0 : un critère à 1.0 sous
        // un seuil supérieur à 1 doit pouvoir être retenu. L'ancienne borne
        // rendait ce cas invisible.
        if (scoreMinimum === null || moyenne < scoreMinimum) {
            scoreMinimum = moyenne;
            defiMinimum = entree.nom;
        }
    });


    return {
        defi: defiMinimum || 'Aucun',
        score: defiMinimum ? scoreMinimum : null
    };
}

/**
 * Identifie le Pattern actuel selon la formule pédagogique
 *
 * Formule: SI(AH≤0,4;"Difficulté persistante";
 *             SI(ET(AH≤0,5;N≠"Aucun");"Difficulté émergente";
 *                SI(ET(AH≤0,75;N≠"Aucun");"Défi spécifique";"Stable")))
 *
 * @param {number} performancePAN3 - Performance sur 3 derniers artefacts (0-1)
 * @param {boolean} aUnDefi - True si un défi est identifié
 * @returns {string} - Pattern: 'Difficulté persistante', 'Difficulté émergente', 'Défi spécifique', 'Stable'
 */
function identifierPatternActuel(performancePAN3, aUnDefi) {
    // Utiliser les seuils configurables IDME
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');      // Par défaut 0.64 (64%)
    const seuilDeveloppement = obtenirSeuil('idme.developpement');  // Par défaut 0.75 (75%)


    // Difficulté persistante : Performance < 64% (Incomplet - unistructurel)
    if (performancePAN3 < seuilInsuffisant) {
        return 'Difficulté persistante';
    }

    // Difficulté émergente : Performance < 75% (En développement - multistructurel) ET a un défi
    if (performancePAN3 < seuilDeveloppement && aUnDefi) {
        return 'Difficulté émergente';
    }

    // Défi spécifique : Performance acceptable mais a un défi récurrent
    if (aUnDefi) {
        return 'Défi spécifique';
    }

    // Stable : Pas de défi ou performance maîtrisée
    return 'Stable';
}

/**
 * Détermine la cible d'intervention selon la formule pédagogique complète
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { cible, pattern, niveau, couleur, emoji }
 */
/**
 * Détermine le Modèle de la Réponse à l'intervention (RàI) basé UNIQUEMENT sur P et SRPNF
 * (sans tenir compte de la mobilisation A-C)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Modèle de la Réponse à l'intervention (RàI) avec pattern et descriptif
 */
function determinerNiveauRaiPedagogique(da) {
    // Récupérer les indices de performance
    const indices = calculerTousLesIndices(da);
    const P = indices.P / 100; // Convertir en décimal 0-1

    // Déterminer quelle fonction utiliser selon la pratique
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) || (window.PRATIQUE_DEFAUT || 'standards');

    // Calculer moyennes SRPNF
    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);


    // Détecter les défis
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    // 🆕 BETA 98.9: Vérifier si données suffisantes avant interprétation
    if (indices3Derniers.nbArtefacts === 0) {
        // Élève présent mais aucune production → Non-participation (signal prioritaire)
        if (indices.A > 0) {
            return {
                niveau: 3,
                label: 'Non-participation',
                pattern: 'Non-participation',
                defi: 'Aucun',
                description: 'Étudiant·e présent·e en classe mais aucune production remise. Profil prioritaire nécessitant une intervention immédiate.',
                badgeClasse: 'badge-rai-3',
                patternBadge: 'badge-pattern-difficulte-persistante',
                donneesSuffisantes: false,
                nbArtefacts: 0,
                fenetreAnalyse: obtenirNombreProductionsPourPatterns()
            };
        }
        // Aucune présence et aucune production → En attente
        return {
            niveau: 0,
            label: 'En attente',
            pattern: 'Données insuffisantes',
            defi: 'Aucun',
            description: 'Aucune production évaluée. L\'interprétation sera disponible après la première évaluation.',
            badgeClasse: 'badge-attente',
            patternBadge: 'badge-attente',
            donneesSuffisantes: false,
            nbArtefacts: 0,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Déterminer le pattern basé uniquement sur la performance
    const pattern = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);

    // Seuils configurables
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');


    // LOGIQUE PÉDAGOGIQUE (basée uniquement sur P et SRPNF)

    // Niveau 3 - Intensif : Difficulté persistante (P < insuffisant OU plusieurs critères < développement)
    if (pattern === 'Difficulté persistante' || P < seuilInsuffisant) {
        return {
            niveau: 3,
            label: 'Niveau 3 - Intensif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: 'Difficultés pédagogiques majeures nécessitant un soutien intensif.',
            badgeClasse: 'badge-rai-3',
            patternBadge: 'badge-pattern-difficulte-persistante',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Niveau 2 - Préventif : Performance en développement (<75%) OU Difficulté émergente OU Défi spécifique
    // Un élève avec P en zone "Développement" (65-74%) nécessite un accompagnement préventif,
    // même si son pattern est "Stable" (pas de défi identifié).
    if (P < seuilDeveloppement || pattern === 'Difficulté émergente' || pattern === 'Défi spécifique') {
        // Déterminer la description selon le contexte
        let description;
        if (P < seuilDeveloppement && pattern === 'Stable') {
            description = 'Performance en développement nécessitant un accompagnement préventif.';
        } else if (pattern === 'Difficulté émergente') {
            description = 'Difficultés émergentes nécessitant une intervention préventive ciblée.';
        } else {
            description = 'Défi spécifique identifié nécessitant un accompagnement ciblé.';
        }

        return {
            niveau: 2,
            label: 'Niveau 2 - Préventif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: description,
            badgeClasse: 'badge-rai-2',
            patternBadge: pattern === 'Difficulté émergente'
                ? 'badge-pattern-difficulte-emergente'
                : pattern === 'Défi spécifique'
                    ? 'badge-pattern-defi-specifique'
                    : 'badge-pattern-stable',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Niveau 1 - Universel : Performance maîtrisée (≥75%) et stable
    return {
        niveau: 1,
        label: 'Niveau 1 - Universel',
        pattern: pattern,
        defi: diagnostic.principalDefi?.nom || 'Aucun',
        description: 'Performance stable. Suivi régulier en classe.',
        badgeClasse: 'badge-rai-1',
        patternBadge: 'badge-pattern-stable',
        nbArtefacts: indices3Derniers.nbArtefacts,
        fenetreAnalyse: obtenirNombreProductionsPourPatterns()
    };
}

/**
 * Détermine l'alerte contextuelle basée UNIQUEMENT sur A et C
 * (sans tenir compte de la performance P)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Alerte contextuelle avec niveau d'engagement
 */
function determinerAlerteContextuelle(da) {
    // Récupérer les indices de mobilisation
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100; // Convertir en décimal 0-1
    const C = indices.C / 100; // Convertir en décimal 0-1

    // 🆕 BETA 96.1: Vérifier si données suffisantes pour C
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);
    const cEstCalculable = indices3Derniers.nbArtefacts > 0 || C > 0;

    // Interpréter la mobilisation
    const interpMobilisation = interpreterMobilisation(A, C);


    // 🆕 BETA 96.1: Si C n'est pas calculable, retourner un état "en attente"
    if (!cEstCalculable) {
        return {
            niveau: 'attente',
            label: 'En attente',
            description: 'Données insuffisantes pour évaluer le contexte. En attente des premières remises.',
            badgeClasse: 'badge-attente',
            A: (A * 100).toFixed(0) + '%',
            C: 'En attente',
            recommandation: 'L\'interprétation du contexte d\'apprentissage sera disponible après les premières remises.',
            donneesSuffisantes: false
        };
    }

    // LOGIQUE CONTEXTUELLE (basée uniquement sur A et C)

    // Contexte très favorable : A ≥ 85% ET C ≥ 85%
    if (A >= 0.85 && C >= 0.85) {
        return {
            niveau: 'tres-favorable',
            label: 'Très favorable',
            description: 'Contexte très favorable. L\'étudiant·e est assidu·e et mobilisé·e.',
            badgeClasse: 'badge-engagement-tres-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte favorable : A ≥ 75% ET C ≥ 75%
    if (A >= 0.75 && C >= 0.75) {
        return {
            niveau: 'favorable',
            label: 'Favorable',
            description: 'Contexte favorable. L\'étudiant·e est présent·e et mobilisé·e.',
            badgeClasse: 'badge-engagement-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte modéré : A ≥ 65% ET C ≥ 65%
    if (A >= 0.65 && C >= 0.65) {
        return {
            niveau: 'modere',
            label: 'Modéré',
            description: 'Contexte modéré. Performance adéquate mais mobilisation pourrait être améliorée.',
            badgeClasse: 'badge-engagement-modere',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Suivi régulier recommandé pour maintenir l\'engagement et éviter une baisse de performance.'
        };
    }

    // Contexte fragile : A < 65% OU C < 65%
    if (A < 0.65 || C < 0.65) {
        return {
            niveau: 'fragile',
            label: 'Fragile',
            description: 'Contexte fragile. La tendance actuelle invite à un suivi rapproché.',
            badgeClasse: 'badge-engagement-fragile',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Interventions recommandées : Rencontrer l\'étudiant·e pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s\'il y a des obstacles (emploi, santé, etc.).'
        };
    }

    // Contexte insuffisant : A < 50% OU C < 50%
    return {
        niveau: 'insuffisant',
        label: 'Insuffisant',
        description: 'Contexte insuffisant. Une rencontre individuelle est recommandée.',
        badgeClasse: 'badge-engagement-insuffisant',
        A: (A * 100).toFixed(0) + '%',
        C: (C * 100).toFixed(0) + '%',
        recommandation: 'Intervention urgente requise : Rencontre individuelle, contact avec aide pédagogique, vérifier situation personnelle.'
    };
}

function _resoudreCibleDifficultePersistante(M, N, I) {
    if (N === 'Français' && I <= 17) {
        return { cible: 'Rencontre individuelle | CAF | Dépistage', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Structure' && I <= 17) {
        return { cible: 'Remédiation en Structure | Exercice supplémentaire | CAF', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Rigueur' && I <= 17) {
        return { cible: 'Remédiation en Rigueur | CAF', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Aucun') {
        return { cible: 'Rencontre individuelle | CAF | Dépistage', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    return null;
}

function _resoudreCibleDifficulteEmergente(M, N, I) {
    if (N === 'Français' && I >= 18 && I <= 20) {
        return { cible: 'Remédiation en stratégie de révision ciblée | CAF recommandé', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Structure' && I >= 18 && I <= 27) {
        return { cible: 'Remédiation en Structure', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Rigueur' && I >= 18 && I <= 27) {
        return { cible: 'Remédiation en Rigueur', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Aucun') {
        return { cible: 'Remédiation en rigueur', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    return null;
}

function _resoudreCibleDefiSpecifique(M, N, I) {
    if (N === 'Français') {
        if (I <= 17) return { cible: 'Rencontre individuelle | CAF | Dépistage SA', pattern: M, niveau: 2, couleur: '#ffc107' };
        if (I >= 18 && I <= 20) return { cible: 'Remédiation en révision linguistique | CAF recommandé', pattern: M, niveau: 2, couleur: '#ffc107' };
        if (I >= 21 && I <= 27) return { cible: 'Remédiation en révision linguistique', pattern: M, niveau: 2, couleur: '#ffc107' };
    }
    if (N === 'Structure' && I >= 18) return { cible: 'Pratique guidée en Structure', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Rigueur' && I >= 18) return { cible: 'Pratique guidée en Rigueur', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Plausibilité' && I >= 18) return { cible: 'Pratique guidée en Plausibilité', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Nuance' && I >= 18) return { cible: 'Pratique guidée en Nuance', pattern: M, niveau: 2, couleur: '#ffc107' };
    return null;
}

function _resoudreCibleStable(M, N, I) {
    if (N === 'Aucun') {
        return I >= 25
            ? { cible: 'Pratique autonome → Explorer jumelage', pattern: M, niveau: 1, couleur: '#28a745' }
            : { cible: 'Suivi régulier | Performance stable', pattern: M, niveau: 1, couleur: '#28a745' };
    }
    if (I < 21) return null;
    const ciblesParDefi = {
        'Structure': 'Pratique autonome → Explorer structures originales',
        'Rigueur': 'Pratique autonome → Explorer pistes originales',
        'Plausibilité': 'Pratique autonome → Explorer hypothèses originales',
        'Nuance': 'Pratique autonome → Explorer interprétations originales',
        'Français': 'Pratique autonome → Explorer style'
    };
    if (ciblesParDefi[N]) {
        return { cible: ciblesParDefi[N], pattern: M, niveau: 1, couleur: '#28a745' };
    }
    return null;
}

function determinerCibleIntervention(da) {
    const indices = calculerTousLesIndices(da);
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) || (window.PRATIQUE_DEFAUT || 'standards');

    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);

    const diagnostic = diagnostiquerForcesChallenges(moyennes);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    if (indices3Derniers.nbArtefacts === 0 && indices.A > 0) {
        return { cible: 'Non-participation', pattern: 'Non-participation', niveau: 3, couleur: '#dc3545' };
    }

    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);
    const E = interpMobilisation.niveau;
    const I = indices3Derniers.francaisMoyen;
    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);
    const N = diagnostic.principalDefi ? diagnostic.principalDefi.nom : 'Aucun';

    if (E === 'Décrochage') {
        return { cible: 'Décrochage', pattern: M, niveau: 3, couleur: '#9e9e9e' };
    }

    if (M === 'Difficulté persistante') {
        const cible = _resoudreCibleDifficultePersistante(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Difficulté émergente') {
        const cible = _resoudreCibleDifficulteEmergente(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Défi spécifique') {
        const cible = _resoudreCibleDefiSpecifique(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Stable') {
        const cible = _resoudreCibleStable(M, N, I);
        if (cible) return cible;
    }

    if (E.includes('fragile') || E.includes('critique')) {
        return { cible: 'Risque de démotivation', pattern: M, niveau: 2, couleur: '#ff9800' };
    }

    return { cible: 'À clarifier en rencontre individuelle', pattern: M, niveau: 1, couleur: '#8aa4b0' };
}

// Exporter les 14 fonctions vers window (décision étape 1 b — convention systématique)
window.obtenirEchelleResolue = obtenirEchelleResolue;
window.obtenirTableConversionNiveaux = obtenirTableConversionNiveaux;
window.convertirNiveauEnScore = convertirNiveauEnScore;
// #542 A3 — consommée par `profil-etudiant-sections-affichage.js` (carte RàI).
window.diagnostiquerConversionNiveaux = diagnostiquerConversionNiveaux;
window.calculerMoyennesCriteres = calculerMoyennesCriteres;
window.calculerMoyennesCriteresRecents = calculerMoyennesCriteresRecents;
window.calculerIPB = calculerIPB;
window.diagnostiquerSuiviApprentissage = diagnostiquerSuiviApprentissage;
window.diagnostiquerForcesChallenges = diagnostiquerForcesChallenges;
window.calculerIndicesNDerniersArtefacts = calculerIndicesNDerniersArtefacts;
window.calculerProgressionEleve = calculerProgressionEleve;
window.identifierDefiSpecifique = identifierDefiSpecifique;
window.identifierPatternActuel = identifierPatternActuel;
window.determinerNiveauRaiPedagogique = determinerNiveauRaiPedagogique;
window.determinerAlerteContextuelle = determinerAlerteContextuelle;
window.determinerCibleIntervention = determinerCibleIntervention;

})();
