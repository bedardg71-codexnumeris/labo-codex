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
 * Les niveaux d'une échelle, du plus faible au plus fort, chacun avec son rang.
 *
 * ⮕ #575 (lot 4 du plan SOLO). L'ORDRE DES NIVEAUX NE SE DEVINE PAS. Deux
 * modules l'écrivaient en dur — `{ I:1, D:2, M:3, E:4 }` pour le tri de la
 * colonne « Niveau » (`liste-evaluations.js`) et `{ E:4, M:3, D:2, I:1 }` pour
 * le bilan de rétroaction (`evaluation-retroaction.js`). Hors IDME, les deux
 * rendent le même rang à tout le monde : le tri ne trie plus, et le bilan
 * n'annonce plus aucun progrès.
 *
 * ⚠ Et il ne se lit pas non plus dans l'ordre de SAISIE de l'utilisateur : rien
 * ne l'oblige à saisir ses niveaux du plus faible au plus fort. Le seul ordre
 * qui ne soit pas inventé est celui des PLAGES — `min` croissant, la conversion
 * « note chiffrée → code » du §7 bis du skill `pratiques-notation`. C'est déjà
 * la convention du dépôt : `niveauxEtGradientDesEvaluations`,
 * `graphiques-progression.js` et `tableau-bord-apercu.js` trient tous par `min`.
 *
 * ⚠ ON NE SE RABAT PAS SUR `valeurCalcul` quand la borne manque. Ce serait un
 * second chemin, aux résultats parfois différents du premier — le patron exact
 * que #529 a passé une session à défaire. La plage et la valeur ponctuelle sont
 * deux conversions INVERSES ; l'une ne se déduit pas de l'autre. Un niveau sans
 * borne inférieure exploitable n'a donc PAS de rang, et l'appelant doit le dire.
 *
 * @param {string} [echelleId] - échelle à lire (résolue par `obtenirEchelleResolue`)
 * @returns {Array} `[{ code, nom, min, max, rang }]`, `rang` 1 = le plus faible.
 *   Tableau VIDE quand aucune échelle ne se résout — jamais un ordre par défaut.
 */
function niveauxOrdonnesDeLEchelle(echelleId = null) {
    var echelle = (typeof obtenirEchelleResolue === 'function')
        ? obtenirEchelleResolue(echelleId)
        : null;
    return ordonnerNiveauxParPlage((echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : []);
}

/**
 * Le même ordre, à partir d'un TABLEAU de niveaux déjà en main.
 *
 * ⮕ #555. `echelles.js` doit ranger les niveaux d'une échelle qu'il tient
 * (pour valider les deux repères de maîtrise) sans passer par la résolution :
 * pendant une écriture, le cache synchrone n'est pas une source fiable, et
 * relire ce qu'on est en train de modifier invite la course. Recopier le tri
 * aurait donné deux ordres pouvant diverger — le patron que #529 a défait.
 *
 * @param {Array} brut - niveaux tels que saisis
 * @returns {Array} `[{ code, nom, min, max, rang }]`, `rang` 1 = le plus faible
 */
function ordonnerNiveauxParPlage(brut) {
    brut = Array.isArray(brut) ? brut : [];

    // ⚠ `Number('')` vaut ZÉRO, pas NaN : sans ce filtre, une borne laissée vide
    // ferait passer son niveau pour le plancher de l'échelle. Même garde que
    // `valeurNumeriqueDuNiveau` (#525).
    var borne = function (v) {
        return (v == null || String(v).trim() === '') ? NaN : Number(v);
    };

    return brut
        .filter(function (n) {
            return n && n.code != null && String(n.code).trim() !== ''
                && Number.isFinite(borne(n.min));
        })
        .map(function (n) {
            return {
                code: String(n.code).trim().toUpperCase(),
                nom: (n.nom == null ? '' : String(n.nom)),
                min: borne(n.min),
                max: borne(n.max),
                rang: 0
            };
        })
        // ⚠ DEUX NIVEAUX PEUVENT PARTAGER LA MÊME BORNE INFÉRIEURE, et le cas
        // n'est pas théorique : les échelles « IDME et niv 0 » de Grégoire
        // portent un « Suspendu » de 0 à 0 à côté d'un « Insuffisant » de 0 à
        // 64. Départager par la borne SUPÉRIEURE range le plus étroit d'abord —
        // une dérivation de plus, pas une règle inventée. Sans elle, l'ordre de
        // SAISIE tranchait, ce qui est exactement ce que ce helper refuse.
        .sort(function (a, b) {
            if (a.min !== b.min) return a.min - b.min;
            var maxA = Number.isFinite(a.max) ? a.max : Infinity;
            var maxB = Number.isFinite(b.max) ? b.max : Infinity;
            return maxA - maxB;
        })
        .map(function (n, i) { n.rang = i + 1; return n; });
}

/**
 * Le niveau que désigne un code, dans SON échelle — nom et rang compris.
 *
 * ⮕ #575. Le point d'entrée des appelants qui tiennent un code enregistré
 * (`niveauFinal`, `niveauSelectionne`) et l'`echelleId` de l'évaluation qui l'a
 * produit. Rendre `null` plutôt qu'un rang de repli est le comportement voulu :
 * un code étranger à l'échelle n'a pas de place dans son ordre.
 *
 * @param {string} code - le code enregistré (comparé sans casse ni espaces)
 * @param {string} [echelleId] - l'échelle de l'évaluation qui porte ce code
 * @returns {Object|null} `{ code, nom, min, max, rang }`, ou `null`
 */
function niveauDuCodeDansEchelle(code, echelleId = null) {
    if (code == null || String(code).trim() === '') return null;
    var cible = String(code).trim().toUpperCase();
    var niveaux = niveauxOrdonnesDeLEchelle(echelleId);
    for (var i = 0; i < niveaux.length; i++) {
        if (niveaux[i].code === cible) return niveaux[i];
    }
    return null;
}

/**
 * La zone d'un code, à partir de niveaux DÉJÀ rangés et de l'échelle qui les porte.
 *
 * ⮕ #555 lot 2 (b) — LA RÈGLE, EXTRAITE DE SON RÉSOLVEUR. Elle était écrite
 * DEUX fois : ici, pour `zoneDuNiveau` ; et dans l'aperçu de l'éditeur d'échelle
 * (`echelles.js`), qui la recopiait sous un autre vocabulaire (« maîtrisé »,
 * « suffisant », « à travailler »). Deux copies d'une même règle finissent par
 * diverger — c'est exactement le patron des replis `|| 0.70` / `|| 0.75` que ce
 * même item a passé la journée à défaire.
 *
 * ⮕ POURQUOI DES NIVEAUX ET UNE ÉCHELLE, PLUTÔT QU'UN IDENTIFIANT. L'éditeur
 * tient une échelle en cours de saisie, parfois JAMAIS ENREGISTRÉE : la résoudre
 * par son id rendrait `null` là où l'utilisateur voit ses niveaux à l'écran.
 * Même motif que `ordonnerNiveauxParPlage` (#555 lot 1), et même remède.
 *
 * Le sens des trois zones et celui de `null` sont documentés sur `zoneDuNiveau`,
 * juste dessous : c'est le point d'entrée de qui tient un `echelleId`.
 *
 * @param {string} code - le code dont on cherche la zone
 * @param {Array} niveauxRanges - `[{ code, rang }]` rangés par `ordonnerNiveauxParPlage`
 * @param {Object} echelle - l'échelle qui porte `seuilSuffisance` / `seuilMaitrise`
 * @returns {'priorite'|'signale'|'acquis'|null} `null` = refus de répondre
 */
function zoneDuCodeDansNiveaux(code, niveauxRanges, echelle) {
    if (code == null || String(code).trim() === '') return null;
    if (!Array.isArray(niveauxRanges) || niveauxRanges.length === 0) return null;
    if (!echelle) return null;

    var rangDuCode = function (valeur) {
        if (valeur == null || String(valeur).trim() === '') return null;
        var cible = String(valeur).trim().toUpperCase();
        for (var i = 0; i < niveauxRanges.length; i++) {
            if (niveauxRanges[i].code === cible && niveauxRanges[i].rang != null) {
                return niveauxRanges[i].rang;
            }
        }
        return null;
    };

    var rang = rangDuCode(code);
    if (rang == null) return null;

    var rangMaitrise = rangDuCode(echelle.seuilMaitrise);
    var rangSuffisance = rangDuCode(echelle.seuilSuffisance);

    // Aucun repère lisible : l'échelle ne dit pas où commence la maîtrise.
    if (rangMaitrise == null && rangSuffisance == null) return null;

    if (rangMaitrise != null && rang >= rangMaitrise) return 'acquis';
    if (rangSuffisance != null && rang >= rangSuffisance) return 'signale';
    return 'priorite';
}

/**
 * La ZONE d'un code dans son échelle : priorité, signalé, ou acquis.
 *
 * ⮕ #555 lot 2 — LE LECTEUR UNIQUE DE LA MARQUE DE MAÎTRISE. Jusqu'ici, « ce
 * critère est-il un défi ? » et « tous les critères sont-ils maîtrisés ? » se
 * répondaient en testant les codes EN TOUTES LETTRES : `=== 'I' || === 'D'`,
 * `=== 'M' || === 'E'`, à quatorze endroits du PDF remis à l'élève et dix-huit
 * du bilan à l'écran. Ces réponses ne valaient que sur l'échelle de Grégoire.
 *
 * ⮕ LES TROIS ZONES SONT CELLES QU'IL A CHOISIES le 28 août 2026, et elles
 * viennent de sa pratique, pas d'une convention d'ici : sa gradation
 * PAN-Standards distingue **trois** états — insuffisant ; réel mais NON DURABLE
 * (« maîtrisé, mais en développement ») ; acquis.
 *
 *   `'priorite'` — sous le seuil de suffisance
 *   `'signale'`  — entre les deux repères : à nommer, sans être prioritaire
 *   `'acquis'`   — au seuil de maîtrise ou au-dessus
 *
 * ⚠⚠ `null` N'EST PAS UNE QUATRIÈME ZONE, C'EST UN REFUS DE RÉPONDRE, et
 * l'appelant doit le traiter comme tel — ne rien afficher plutôt que de ranger
 * l'élève dans une case au hasard. Trois causes, toutes légitimes :
 *   · l'échelle ne se résout pas ;
 *   · le code lui est étranger (il n'a donc pas de rang) ;
 *   · l'échelle ne porte AUCUN des deux repères — le cas de toute échelle
 *     antérieure au lot 1. Aucune valeur n'est devinée à leur place : ni par
 *     les lettres, ni par une position dans la liste, ni par un pourcentage.
 *
 * ⚠ UN SEUL REPÈRE SUFFIT À RÉPONDRE, et la réponse reste honnête :
 *   · maîtrise seule → `'acquis'` au-dessus, `'priorite'` en dessous. C'est le
 *     modèle à UNE frontière, que le modèle à deux contient.
 *   · suffisance seule → `'priorite'` en dessous, `'signale'` au-dessus. On sait
 *     ce qui est insuffisant ; on ne sait PAS où commence l'acquis, donc on ne
 *     le dit pas.
 *
 * @param {string} code - le code enregistré (`niveauSelectionne`, `niveauFinal`)
 * @param {string} [echelleId] - l'échelle de l'évaluation qui porte ce code
 * @returns {'priorite'|'signale'|'acquis'|null}
 */
function zoneDuNiveau(code, echelleId = null) {
    var echelle = (typeof obtenirEchelleResolue === 'function')
        ? obtenirEchelleResolue(echelleId || null)
        : null;
    if (!echelle) return null;

    // La règle vit dans `zoneDuCodeDansNiveaux` ; ici, on ne fait que RÉSOUDRE
    // l'échelle et lui ranger ses niveaux. #555 lot 2 (b).
    return zoneDuCodeDansNiveaux(code, niveauxOrdonnesDeLEchelle(echelleId), echelle);
}

/* ===============================
   DIAGNOSTIC — LES DEUX RÉSOLVEURS D'ÉCHELLE SONT-ILS D'ACCORD ?
   Audit du 28 août 2026 : Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md
   =============================== */

/**
 * Diagnostic LECTURE SEULE : combien d'identifiants d'échelle, portés par des
 * données réelles, les DEUX résolveurs du dépôt traitent-ils différemment ?
 * N'écrit RIEN (aucun db.set/setSync) — uniquement des lectures + console.
 * À lancer en console : _diagnostiquerResolutionEchelles()
 *
 * ⚠ POURQUOI CE DIAGNOSTIC EXISTE. Le dépôt a DEUX résolveurs, et leur
 * divergence est CROISÉE — chacun sait ce que l'autre ignore :
 *
 *   | capacité                      | obtenirEchelleResolue | resoudreModeleParId |
 *   |-------------------------------|-----------------------|---------------------|
 *   | `idOriginal` (échelle importée)| oui                  | oui (#590)          |
 *   | identifiant `pratique-*`      | oui                   | NON                 |
 *   | repli pool inter-trimestre    | NON                   | oui                 |
 *   | refus d'une échelle sans niveaux | oui                | non                 |
 *
 * `resoudreModeleParId` n'est appelé pour une ÉCHELLE que par
 * `pratique-registre.js` (`construireConfigComplete`) depuis le retrait du
 * module « Consolidation » (10 septembre 2026) — il en avait un second
 * appelant, `consolidation.js`, parti avec lui.
 *
 * ⮕ #590 (11 oct. 2026, option A de Grégoire) : `resoudreModeleParId` reconnaît
 * `idOriginal`, et la pratique dont l'échelle est introuvable ne retombe plus sur
 * une IDME codée en dur. Restent deux causes : `echelle-de-pratique` et
 * `pool-inter-trimestre`. La seconde n'a pas été réconciliée : `echellesComparables`
 * lit une échelle introuvable comme une absence (rétroaction « Progrès ») — la
 * rendre trouvable au pool changerait ce que lisent des élèves.
 *
 * ⮕ CE QUE CE DIAGNOSTIC TRANCHE, ET QU'AUCUNE LECTURE DE CODE NE PEUT DIRE :
 * si la divergence touche des données RÉELLES, ou si elle reste théorique.
 * Réconcilier les deux résolveurs est un chantier ; on ne l'ouvre pas sans ce
 * chiffre.
 *
 * Les DEUX gisements d'identifiants sont examinés, car ils n'ont pas les mêmes
 * contraintes : le sélecteur d'une PRODUCTION (`peuplerEchellesProduction`) ne
 * propose que des `echellesTemplates`, tandis que celui d'une ÉVALUATION
 * (`chargerEchellePerformance`) propose EN PLUS l'échelle de la pratique active,
 * sous un identifiant `pratique-<id>` que l'auto-save persiste tel quel.
 *
 * @returns {{total:number, divergents:Array, parCause:Object, lignes:Array}}
 */
function _diagnostiquerResolutionEchelles() {
    var lireCollection = function (nomCle) {
        try {
            var cleReelle = (nomCle === 'productions' && typeof getCleProductions === 'function')
                ? getCleProductions()
                : ((typeof cle === 'function') ? cle(nomCle) : nomCle);
            return db.getSync(cleReelle, []) || [];
        } catch (e) {
            return [];
        }
    };

    var productions = lireCollection('productions');
    var evaluations = lireCollection('evaluationsSauvegardees');

    // id -> { productions, evaluations }
    var usages = {};
    var recenser = function (liste, champ) {
        (liste || []).forEach(function (item) {
            var id = item && item.echelleId;
            if (!id) return;
            if (!usages[id]) usages[id] = { productions: 0, evaluations: 0 };
            usages[id][champ]++;
        });
    };
    recenser(productions, 'productions');
    recenser(evaluations, 'evaluations');

    var lignes = Object.keys(usages).map(function (id) {
        var parResolue = (typeof obtenirEchelleResolue === 'function')
            ? !!obtenirEchelleResolue(id) : null;
        var parRegistre = (typeof resoudreModeleParId === 'function')
            ? !!resoudreModeleParId('echelle', id) : null;

        // La CAUSE se nomme, elle ne se devine pas : chaque hypothèse est
        // vérifiée sur les données, et « indéterminée » reste une réponse.
        var cause = null;
        if (parResolue !== parRegistre) {
            if (String(id).indexOf('pratique-') === 0) {
                cause = 'echelle-de-pratique';
            } else if (parRegistre && !parResolue) {
                cause = 'pool-inter-trimestre';
            } else {
                cause = 'indeterminee';
            }
        }

        return {
            echelleId: id,
            productions: usages[id].productions,
            evaluations: usages[id].evaluations,
            resolueParRetroaction: parResolue,
            resolueParRegistre: parRegistre,
            divergent: parResolue !== parRegistre,
            cause: cause
        };
    });

    var divergents = lignes.filter(function (l) { return l.divergent; });
    var parCause = {};
    divergents.forEach(function (l) { parCause[l.cause] = (parCause[l.cause] || 0) + 1; });

    // ⚠ `console.log` ASSUMÉ ICI, contre la règle 5 de CLAUDE.md (« zéro
    // console.log dans le nouveau code »), et l'exception est NOMMÉE plutôt que
    // subie : pour un outil de diagnostic, la SORTIE CONSOLE EST LE PRODUIT —
    // il n'a pas d'autre interface. Même statut que `_diagnostiquerModeleCours`
    // (`cours.js`) et que les `diagnostiquer*` de `travaux-resolution.js`, dont
    // l'audit du 28 août a établi qu'ils ne sont pas de la dette : les retirer
    // casserait l'outil. `warn`/`error` seraient sémantiquement faux — rien
    // n'est anormal quand un diagnostic rend son compte.
    if (typeof console !== 'undefined' && console.table) console.table(lignes);
    console.log('[Diagnostic résolveurs] ' + lignes.length + ' identifiant(s) d\'échelle porté(s) par des données.');
    console.log('[Diagnostic résolveurs] DIVERGENTS : ' + divergents.length + (divergents.length ? '' : ' — la divergence est théorique sur ces données.'));
    divergents.forEach(function (l) {
        console.log('  · ' + l.echelleId + ' — ' + l.productions + ' production(s), ' + l.evaluations
            + ' évaluation(s) — rétroaction: ' + l.resolueParRetroaction
            + ' · registre: ' + l.resolueParRegistre + ' — cause : ' + l.cause);
    });

    return { total: lignes.length, divergents: divergents, parCause: parCause, lignes: lignes };
}

/**
 * Deux évaluations parlent-elles du MÊME barème ?
 *
 * ⮕ #575 B10 — EXTRAIT, PAS ÉCRIT. Ce raisonnement a été livré le 28 août dans
 * `evaluation-retroaction.js` (`_memeEchelleBilan`), après la porte terrain 2.7 ;
 * `synthese-retroaction-data.js` en a besoin du mot pour mot pour la ligne
 * « Progrès » du PDF. Le recopier, c'est le patron des replis divergents que
 * #529 a passé une session à défaire — et que #555 constate encore aujourd'hui
 * (`|| 0.70` d'un côté, `|| 0.75` de l'autre).
 *
 * ⮕ LES DEUX RÈGLES VIENNENT D'`obtenirEchelleCommuneDesEvaluations` (#542 lot 3),
 * pas d'une invention :
 *   1. la comparaison porte sur l'échelle RÉSOLUE, jamais sur l'id désigné —
 *      c'est ce qui dédoublonne un import ou une restauration. Chez Grégoire,
 *      l'échelle courante est « IDME et niv 0 (restaurée) », recréée par la
 *      réparation de #542 sous un identifiant NEUF, pendant que ses évaluations
 *      d'H2026 en désignent un ancien : comparer les ids bruts effaçait la
 *      ligne « Progrès » de tous ses élèves ;
 *   2. « une échelle introuvable n'est pas une AUTRE échelle : c'est une
 *      absence. » Une évaluation qui n'en désigne aucune, ou qui en désigne une
 *      disparue, se lit dans l'échelle courante — la seule qui existe.
 *
 * ⚠ LA FONCTION EST ASYMÉTRIQUE, ET C'EST VOULU. L'absence est tolérée du côté
 * ANCIEN (on lit alors dans l'échelle courante) mais pas du côté COURANT : sans
 * échelle courante, il n'y a aucun ordre où situer quoi que ce soit. Ce qui
 * reste refusé est le seul cas qui empêche vraiment de conclure — deux échelles
 * qui existent TOUTES LES DEUX et diffèrent. Le 3e niveau d'un barème à cinq et
 * le 3e d'un barème à trois ne disent pas la même chose.
 *
 * @param {string} idAncien - l'`echelleId` de l'évaluation la plus ancienne
 * @param {string} idCourant - l'`echelleId` de l'évaluation de référence
 * @returns {boolean} `true` quand les deux rangs sont comparables
 */
function echellesComparables(idAncien, idCourant) {
    if (!idAncien) return true;
    var resoudre = function (id) {
        return (typeof obtenirEchelleResolue === 'function') ? obtenirEchelleResolue(id || null) : null;
    };
    var ancienne = resoudre(idAncien);
    if (!ancienne) return true;
    var courante = resoudre(idCourant);
    if (!courante) return false;
    return ancienne.id === courante.id;
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
 * Le score 0-1 d'UN critère d'une évaluation, dans l'échelle de CETTE évaluation.
 *
 * ⮕ #752 (lot 4 du cadrage 11, 11 sept. 2026). Les graphiques de progression
 * convertissaient I/D/M/E en 40 / 65 / 75 / 100 écrits en dur, et lisaient tout
 * nombre ≤ 4 comme une note sur 4. Ici, une seule règle, sans rien inventer :
 *   - un critère analytique porte ses POINTS (`points` / `ponderation`, lot 2 du
 *     4 sept.) : sa valeur est sa fraction (21 / 30 → 0,70), pas le niveau déduit ;
 *   - sinon, `niveauSelectionne` converti par la table de l'évaluation
 *     (`tableConversionPourEvaluation`), comme le dépistage ;
 *   - sans valeur convertible : `null`, et l'appelant le DIT (jamais deviné —
 *     décision de Grégoire du 11 sept., 17 h 15).
 * ⮕ #739 (lot B du cadrage du 16 sept. 2026, tranché par Grégoire) : le dépistage
 * lit ICI aussi — moyennes par critère (barres), IPB, défi spécifique, directions.
 * Un critère à 22/30 vaut 0,73 partout sur le profil, plus 0,65 (son niveau « D »)
 * pour le dépistage et 0,73 pour les courbes. UNE source pour ce chiffre : aucun
 * lecteur du profil n'appelle plus `convertirNiveauEnScore` sur un critère.
 *
 * @param {Object} critere - une entrée de `evaluation.criteres[]`
 * @param {Object|null} tableConversion - table de l'évaluation (code → 0-1)
 * @returns {number|null} score 0-1
 */
function scoreCritereEvaluation(critere, tableConversion) {
    if (!critere) return null;
    if (typeof critere.points === 'number' && !isNaN(critere.points)) {
        var max = Number(critere.ponderation);
        return (Number.isFinite(max) && max > 0) ? critere.points / max : null;
    }
    return convertirNiveauEnScore(critere.niveauSelectionne, tableConversion);
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
/**
 * L'échelle commune aux évaluations retenues d'un élève, ou la raison pour
 * laquelle il n'y en a pas.
 *
 * ⮕ #542 lot 3, pas 3b. Sert aux pratiques qui établissent leur note globale
 * PAR NIVEAUX — elles convertissent déjà évaluation par évaluation, chacune avec
 * son `echelleId` ; c'est cette même échelle qui doit relire la moyenne.
 *
 * ⚠ POURQUOI CE HELPER N'EST PAS DANS UNE PRATIQUE. Deux pratiques en ont besoin
 * (PAN-Standards et toute configurable travaillant par niveaux) et elles ne
 * partagent pas de classe de base. L'écrire deux fois, c'est le patron que #529
 * a défait — et le geste que le pas 3a vient d'éviter pour la résolution.
 *
 * ⚠ IL NE DEVINE PAS. Si les évaluations désignent des échelles DIFFÉRENTES, il
 * n'en choisit aucune : la moyenne n'est alors située dans rien, et l'appelant
 * doit le DIRE. C'est la même règle que #529 pour une évaluation isolée, portée
 * à l'échelle du portrait — et le même refus que `obtenirEchelleResolue(null)`
 * oppose à l'ambiguïté.
 *
 * Mêmes exclusions que `diagnostiquerConversionNiveaux` : une évaluation
 * remplacée porte l'état d'AVANT une reprise.
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} `{ echelle, raison, message }` — `echelle` non nulle et
 *   `raison` nulle quand une seule échelle est en jeu et qu'elle se résout.
 */
function obtenirEchelleCommuneDesEvaluations(da) {
    // #718 (lot A, 16 sept. 2026) — une copie enregistrée situe une note, texte ou pas.
    var evaluations = (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
        .filter(function (e) {
            return e && e.etudiantDA === da && window.evaluationEntreDansLaNote(e);
        });

    if (evaluations.length === 0) {
        return {
            echelle: null,
            raison: 'aucune-evaluation',
            message: 'Aucune évaluation retenue pour cet·te étudiant·e : il n\'y a pas de note globale à situer.'
        };
    }

    var ids = [];
    evaluations.forEach(function (e) {
        var id = (e && e.echelleId) || '';
        if (ids.indexOf(id) === -1) ids.push(id);
    });

    // ⚠⚠ ON NE COMPTE QUE LES ÉCHELLES RÉSOLUES, ET C'EST TOUT LE SUJET.
    //
    // Défaut trouvé le 27 août 2026 par la porte terrain, sur les données
    // réelles de Grégoire — pas par une fixture. Un élève avait 10 évaluations :
    // 9 sur son échelle, 1 désignant une échelle disparue du trimestre. La
    // première version comptait les IDENTIFIANTS distincts, trouvait « 2 », et
    // concluait « échelles divergentes » : plus aucun niveau ne s'affichait.
    //
    // ⮕ C'était incohérent avec le reste de l'application. Cette 10e évaluation
    // est DÉJÀ écartée du calcul — la performance globale est calculée sur les 9
    // autres, et `diagnostiquerConversionNiveaux` l'annonce à l'écran
    // (« Dépistage incomplet · 1 des 10 évaluations n'a pas pu être convertie »).
    // La compter ici comme une échelle concurrente, c'est refuser de situer une
    // moyenne à cause d'une donnée qui n'entre pas dans cette moyenne.
    //
    // ⮕ Une échelle introuvable n'est pas une AUTRE échelle : c'est une absence,
    // et l'absence est déjà dite ailleurs. La divergence qui empêche vraiment de
    // conclure, c'est deux échelles qui existent toutes les deux.
    //
    // ⮕ Effet de bord voulu : deux identifiants qui pointent vers la MÊME
    // échelle (par `idOriginal`, après un import) se dédoublonnent ici, puisque
    // la comparaison porte sur l'échelle résolue et non sur l'id désigné.
    var resolues = [];
    ids.forEach(function (id) {
        var e = obtenirEchelleResolue(id || null);
        if (e && !resolues.some(function (x) { return x.id === e.id; })) resolues.push(e);
    });

    if (resolues.length === 0) {
        return {
            echelle: null,
            raison: 'echelle-non-resolue',
            message: 'Aucune des échelles désignées par les évaluations de cet·te étudiant·e n\'est '
                + 'trouvable dans ce trimestre. Sa note globale ne peut pas être située tant '
                + 'qu\'elles ne sont pas rétablies.'
        };
    }

    if (resolues.length > 1) {
        return {
            echelle: null,
            raison: 'echelles-divergentes',
            message: 'Les évaluations de cet·te étudiant·e emploient ' + resolues.length + ' échelles '
                + 'différentes, toutes les deux présentes dans ce trimestre. Sa note globale '
                + 'n\'est donc située dans aucune — choisir la « bonne » reviendrait à en '
                + 'écarter une autre sans le dire.'
        };
    }

    return { echelle: resolues[0], raison: null, message: null };
}

function diagnostiquerConversionNiveaux(da) {
    var evaluations = (obtenirDonneesSelonMode('evaluationsSauvegardees') || [])
        .filter(function (e) {
            // Mêmes exclusions que les calculs (lot A, 16 sept. 2026) : la règle
            // unique #706 — les remplacées portent l'état d'AVANT une reprise, les
            // brouillons ne sont pas encore le jugement de l'enseignant.
            return e && e.etudiantDA === da && window.evaluationEntreDansLaNote(e);
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
            ? 'Aucune des ' + evaluations.length + ' évaluations de cet·te étudiant·e n\'a pu être convertie'
            : nonConverties + ' des ' + evaluations.length + ' évaluations de cet·te étudiant·e n\'ont pas pu être converties')
            + ' : ' + causes.join(' ; ') + '. '
            + (toutes
                ? 'Les critères, les défis et le pattern ci-dessous ne reposent donc sur AUCUNE donnée de performance — ne les lis pas comme un portrait de l\'étudiant·e.'
                : 'Le portrait ci-dessous est calculé sur les autres seulement.')
    };
}

/**
 * Nom de critère normalisé pour l'appariement et les clés de moyennes :
 * minuscules, sans accents, sans espaces. ⚠ MÊME règle que `cleCritere`
 * (`profil-etudiant-helpers.js`), qui construit les clés côté affichage.
 */
function _normaliserNomCritere(nom) {
    return String(nom || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
}

/**
 * Le critère de la grille de référence qui répond à un critère d'ÉVALUATION —
 * ou `null` si le dépistage ne le lit pas.
 *
 * Deux raisons de rendre `null`, et une seule est signalée :
 *   - le nom n'est dans la grille de référence sous aucune forme (évaluation
 *     produite avec une autre grille) : avertissement console, comme avant ;
 *   - le critère est réglé « Aucun » au menu SOLO (#740) : silence — c'est un
 *     réglage, pas une anomalie. La règle vit dans `estCritereSurveilleParDepistage`.
 *
 * L'appariement est celui que les moyennes et l'IPB faisaient chacun de leur
 * côté : égalité, ou l'un des deux noms normalisés commence par l'autre
 * (« francais » ↔ « francaisecrit »).
 *
 * @param {string} nomCritere - `critereNom` d'une entrée de `evaluation.criteres[]`
 * @param {Object} grille - la grille de référence du dépistage
 * @returns {Object|null}
 */
function trouverCritereDepistage(nomCritere, grille) {
    if (!grille || !Array.isArray(grille.criteres)) return null;
    const nomEval = _normaliserNomCritere(nomCritere);
    if (!nomEval) return null;
    const reference = grille.criteres.find(c => {
        const nomRef = _normaliserNomCritere(c && c.nom);
        return !!nomRef && (nomRef === nomEval || nomRef.startsWith(nomEval) || nomEval.startsWith(nomRef));
    });
    if (!reference) {
        console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
        return null;
    }
    return estCritereSurveilleParDepistage(reference) ? reference : null;
}

/**
 * Moyenne par critère surveillé, sur un lot d'évaluations. Le corps commun de
 * `calculerMoyennesCriteres` (toutes les évaluations) et de
 * `calculerMoyennesCriteresRecents` (les N dernières), qui l'avaient en double.
 *
 * Lit chaque critère par `scoreCritereEvaluation` (#739 : les points d'abord, le
 * niveau sinon), dans l'échelle de SON évaluation (#529), et n'accumule que ce
 * que `trouverCritereDepistage` reconnaît (#740).
 *
 * @param {Array} evaluations - évaluations de l'élève, déjà filtrées
 * @param {Object} grille - grille de référence (non nulle, avec critères)
 * @returns {Object|null} - { <cleNormalisee>: 0-1 | null }, ou null si rien n'a été lu
 */
function _moyennesCriteresDepistage(evaluations, grille) {
    const cacheTables = new Map();
    const scoresCriteres = {};
    criteresSurveillesParDepistage(grille).forEach(c => {
        scoresCriteres[_normaliserNomCritere(c.nom)] = [];
    });

    evaluations.forEach(evaluation => {
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }
        const table = tableConversionPourEvaluation(evaluation, cacheTables);
        evaluation.criteres.forEach(critereSauvegarde => {
            if (!critereSauvegarde) return;
            const score = scoreCritereEvaluation(critereSauvegarde, table);
            if (score === null) return;
            const reference = trouverCritereDepistage(critereSauvegarde.critereNom, grille);
            if (!reference) return;
            scoresCriteres[_normaliserNomCritere(reference.nom)].push(score);
        });
    });

    // #553 — la clé d'un critère est son nom normalisé, ENTIER. Ce site rabotait
    // « francaisecrit » en « francais » : `diagnostiquerForcesChallenges`, qui
    // cherche le nom entier, écartait alors le critère sans un mot, et deux
    // critères « Français… » (oral, écrit) n'en faisaient qu'un, le dernier
    // écrasant l'autre (banc de l'audit du 21 sept. 2026).
    const moyennes = {};
    let aucuneDonnee = true;
    Object.keys(scoresCriteres).forEach(cleCritereNorm => {
        const scores = scoresCriteres[cleCritereNorm];
        if (scores.length > 0) {
            moyennes[cleCritereNorm] = scores.reduce((somme, s) => somme + s, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleCritereNorm] = null;
        }
    });
    return aucuneDonnee ? null : moyennes;
}

/**
 * Calcule les moyennes des critères SRPNF sur TOUTES les évaluations de l'étudiant
 * Utilisé pour la pratique sommative (SOM) qui considère toutes les évaluations
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Moyennes par critère ou null
 */
function calculerMoyennesCriteres(da) {
    // #1055 (15 oct. 2026, verdict de Cowork de 15 h 07) : sans le travail diagnostique, comme
    // `calculerMoyennesCriteresRecents` en standards (porte 2). Ces moyennes donnent la « Progression
    // par critère » du profil, et le défi qui mène au pattern et au palier RàI : un diagnostic n'y
    // entre pas (décisions de Grégoire du 7 sept. et du 15 oct.). La règle des paliers ne bouge pas.
    const evaluations = window.ProductionDiagnostique.filtrerEvaluations(
        obtenirDonneesSelonMode('evaluationsSauvegardees') || [], obtenirDonneesSelonMode('productions'));

    // Les copies qui COMPTENT (#741, lot A du 16 sept. 2026) : la règle unique #706 — enregistrées,
    // non remplacées (#730 : l'originale d'une reprise porte l'état d'avant), avec ou sans commentaire final.
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && window.evaluationEntreDansLaNote(e));


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

    return _moyennesCriteresDepistage(evaluationsEleve, grille);
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
        window.evaluationEntreDansLaNote(e) &&   // #741 (lot A) : la règle unique #706 ; #730 pour la remplacée
        productionsIds.includes(e.productionId)
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

    return _moyennesCriteresDepistage(derniersArtefacts, grille);
}

// [Phase 6] calculerIndiceBlocage() supprimé — remplacé par calculerIPB() + diagnostiquerSuiviApprentissage()

// [Phase 6] calculerProgressionBlocage() supprimé — utilisait calculerIndiceBlocage() retiré ci-dessus

// #553 — `_normaliserNomCritereIPB` est retirée : copie de `_normaliserNomCritere` qui
// rabotait en plus « francais… » vers « francais ». Une seule règle : le nom normalisé entier.

function _filtrerEtTrierEvaluationsIPB(evaluations, da, productionsIds) {
    var filtrees = evaluations.filter(function (e) {
        return e.etudiantDA === da &&
            window.evaluationEntreDansLaNote(e) &&   // #741 (lot A) : la règle unique #706 ; #730 — l'IPB comptait l'originale ET la reprise
            productionsIds.indexOf(e.productionId) >= 0 &&
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
        if (!cs) return;
        var score = scoreCritereEvaluation(cs, tableConversion);   // #739 — les points d'abord
        if (score === null) return;
        var nomEval = _normaliserNomCritere(cs.critereNom);
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
 * multistructurels est sous le seuil de défi configurable. Observation SOLO
 * désactivée : sur tous les critères (#1117, suite — `criteresSuiviFondations`).
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { ipb, scoreActuel, scorePrecedent, direction, criteresMulti, criteresEnDefi }
 */
function calculerIPB(da) {
    var grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres) return null;

    // Les critères du suivi des fondations : les multistructurels (défaut si pas de
    // tag) parmi ceux que le dépistage lit — ou tous, observation SOLO désactivée
    // (#1117, suite). La règle vit dans `criteresSuiviFondations`, que lit aussi
    // le sous-titre de la barre au tableau de bord.
    var criteresMulti = criteresSuiviFondations(grille);
    if (criteresMulti.length === 0) return null;

    // #555 lot 2 (28 août 2026) — le repli `|| 0.70` est RETIRÉ, pas déplacé.
    // `obtenirSeuil` rend toujours une valeur : clé absente → `SEUILS_PAR_DEFAUT`.
    // Le repli local ne se déclenchait donc que sur une valeur falsy, et il
    // aurait alors écrasé un 0 délibéré. Source unique : `interpretation-config.js`.
    var seuilDefi = obtenirSeuil('defiSpecifique');
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
        return { nom: _normaliserNomCritere(c.nom), ponderation: c.ponderation || 0 };
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
 *
 * #744 (lot C du cadrage du 16 sept. 2026) — CE DIAGNOSTIC NE REND PLUS DE PALIER.
 * Règle tranchée par Grégoire : la carte RàI (`determinerNiveauRaiPedagogique`) donne
 * SEULE le palier d'intervention, partout ; le suivi des fondations décrit la
 * PERSISTANCE (IPB × direction). Le champ `niveauRaI` qu'il portait disait un second
 * palier, que la cible d'intervention suivait. Le mot « Difficulté récente » (IPB = 1,
 * direction → ou ↘) est celui de Grégoire, choisi le 17 sept. : « Difficulté émergente »
 * reste le pattern de la carte RàI (sous le repère de maîtrise, et un défi), et lui seul.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { diagnostic, ipb, direction, scoreActuel, criteresEnDefi, couleur }
 */
function diagnostiquerSuiviApprentissage(da) {
    var ipbData = calculerIPB(da);
    if (!ipbData) return null;

    var ipb = ipbData.ipb;
    var dir = ipbData.direction;
    var diagnostic, couleur;

    if (ipb === 0) {
        diagnostic = 'Maîtrise acquise';
        couleur = '#28a745';
    } else if (ipb === 1 && dir === '↗') {
        diagnostic = 'Difficulté résolue';
        couleur = '#28a745';
    } else if (ipb === 1) {
        diagnostic = 'Difficulté récente';
        couleur = '#ff9800';
    } else if (ipb === 2 && dir === '↗') {
        diagnostic = 'Progression';
        couleur = '#2196f3';
    } else if (ipb === 2 && dir === '→') {
        diagnostic = 'Plateau';
        couleur = '#ff9800';
    } else if (ipb === 2) {
        diagnostic = 'Difficulté constante';
        couleur = '#dc3545';
    } else if (dir === '↗') {
        // ipb >= 3
        diagnostic = 'Progression lente';
        couleur = '#2196f3';
    } else {
        diagnostic = 'Difficulté persistante';
        couleur = '#dc3545';
    }

    return {
        diagnostic: diagnostic,
        ipb: ipb,
        direction: dir,
        scoreActuel: ipbData.scoreActuel,
        criteresEnDefi: ipbData.criteresEnDefi,
        criteresMulti: ipbData.criteresMulti,
        couleur: couleur,
        fenetre: ipbData.fenetre,
        seuil: ipbData.seuil,
        scoresParArtefact: ipbData.scoresParArtefact,
        historiqueComplet: ipbData.historiqueComplet
    };
}

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
        // #806 — le chemin cité était faux ici aussi (console, mais c'est la
        // console que Grégoire lit quand il cherche). Le réglage vit dans
        // « Labo → Outils d'observation ».
        console.warn('⚠️ Pas de grille de référence - diagnostic forces/défis impossible');
        console.warn('   → Grille:', grille);
        console.warn('   → Choisis-en une dans Labo → Outils d\'observation → « Grille de critères pour le dépistage »');
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Construire dynamiquement le tableau des critères depuis la grille — ceux que
    // le dépistage lit (#740). Les moyennes ne portent pas la clé d'un critère
    // « Aucun » ; la liste partagée l'exclut même si un appelant en fournit une.
    const criteres = criteresSurveillesParDepistage(grille).map(c => {
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
            ponderation: c.ponderation || 0,
            // #552 — LE NIVEAU SOLO VOYAGE AVEC LE CRITÈRE.
            //
            // Sans lui, tout consommateur qui veut savoir SI un défi touche une
            // fondation ou une compétence supérieure n'a plus que le NOM du
            // critère pour le deviner — c'est-à-dire le défaut B9, retiré de
            // `trimestres.js` au pas 4 du lot 3 de #542, et qui vivait encore
            // dans les résolveurs de cibles.
            //
            // ⮕ MÊME DÉFAUT QUE `calculerIPB` ET QUE L'ÉDITEUR DE GRILLES : un
            // critère sans étiquette est une fondation. C'est le défaut posé à
            // la création d'un critère (`grilles.js`), pas une valeur choisie ici.
            niveauSOLO: c.niveauSOLO || 'multistructurel'
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
 * @returns {Object} - { performance, nbArtefacts }
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
        window.evaluationEntreDansLaNote(e) &&   // #737 (lot A) : un brouillon ne compte nulle part ; #730 — la performance du RàI lisait 50, 75, 55 là où la note du cours lit 50, 75, 70
        productionsIds.includes(e.productionId)
    );

    if (evaluationsEleve.length === 0) {
        return { performance: 0, nbArtefacts: 0 };
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

    // #536 (11 oct. 2026) — `idmeMoyen` RETIRÉ. Il rendait 0 quand aucun niveau final
    // n'était convertible (le zéro conservé par #529 en attendant cette fiche), mais
    // `grep` ne lui trouve AUCUN lecteur : les appelants lisent `performance` et
    // `nbArtefacts`. Un champ que personne ne lit n'a pas à dire « pas de donnée » :
    // il part, avec sa conversion des niveaux finaux.

    // ⚠⚠ #537 (27 août 2026) — LE CALCUL DE `francaisMoyen` A ÉTÉ RETIRÉ, ET
    // AVEC LUI LA DERNIÈRE RECONNAISSANCE D'UN CRITÈRE PAR SON NOM DANS CE
    // FICHIER.
    //
    // Ce qui vivait ici : `const NOM_CRITERE_LANGUE = 'francais'`, un
    // `nom.startsWith(NOM_CRITERE_LANGUE)` sur chaque critère de chaque
    // évaluation, et une moyenne en pourcentage rendue sous le nom
    // `francaisMoyen`. Le commentaire qui l'accompagnait disait pourquoi il
    // n'avait pas été tranché en #529 : « `_resoudreCibleDefiSpecifique` lui
    // réserve des cibles d'intervention que les autres critères n'ont pas ».
    //
    // ⮕ CE QUI A CHANGÉ, ET QUI AUTORISE LE RETRAIT. Ces résolveurs n'existent
    // plus (#552), et Grégoire a tranché le 27 août 2026 : le critère de langue
    // est un critère comme un autre, sans statut propre et sans désignation par
    // l'utilisateur. `francaisMoyen` disparaît comme notion — pas remplacé par
    // un réglage, retiré.
    //
    // ⚠ CE QUI SUBSISTE AILLEURS, et qu'il ne faut pas croire réglé : une
    // SECONDE implémentation de ces indices vit dans
    // `js/pratiques/pratique-pan-standards.js` et calcule encore son propre
    // `francaisMoyen`. Elle appartient au système de pratiques (#307), dont le
    // câblage n'est pas fini et dont le contrat `IPratique` est verrouillé.
    // Geste distinct, item distinct.

    return {
        performance: performance,
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
 * Le nombre N et le seuil viennent tous deux des seuils d'interprétation
 * (interpretation-config.js) et se règlent dans Labo > Outils d'observation :
 * « Fenêtre d'analyse des patterns » et « Seuil de défi spécifique » (défaut 70 %).
 * #817 — la mention « défaut: 71.25% » qui vivait ici était fausse : ce nombre
 * n'apparaît nulle part dans interpretation-config.js. Il venait des deux copies
 * en dur de l'AFFICHAGE (diagnostics par critère et badges de critères), depuis
 * alignées elles aussi sur `defiSpecifique`. La mention « plus d'UI de réglage,
 * #299 » était périmée : les deux réglages ont retrouvé une UI.
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
        window.evaluationEntreDansLaNote(e) &&   // #741 (lot A) : la règle unique #706 ; #730
        productionsIds.includes(e.productionId)
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

    // #740 — le défi spécifique lit les mêmes critères que les moyennes et l'IPB :
    // ceux de la grille de référence, sans les « Aucun ». Sans grille configurée,
    // il n'y a rien pour reconnaître un critère : tout est lu, comme avant.
    const grille = obtenirGrilleReferenceDepistage();

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
            if (grille && !trouverCritereDepistage(critereSauvegarde.critereNom, grille)) return;
            const score = scoreCritereEvaluation(critereSauvegarde, table);   // #739
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
    // Les repères de l'échelle de l'enseignant (30 oct. 2026) : `maitrise` vaut null quand il n'est pas posé.
    const bornes = window.bornesDepistage();

    // Difficulté persistante : sous le repère de suffisance (ou sous la note de passage, sans ce repère)
    if (performancePAN3 < bornes.bas) {
        return 'Difficulté persistante';
    }

    // Difficulté émergente : sous le repère de maîtrise ET a un défi
    if (bornes.maitrise !== null && performancePAN3 < bornes.maitrise && aUnDefi) {
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
 * #731 — Le groupe permet-il de juger la « non-participation » d'un élève qui n'a rien remis ?
 *
 * RÈGLE ARRÊTÉE PAR GRÉGOIRE (5 septembre 2026, au mot) : un élève qui n'a rien remis n'est
 * « Non-participation » que lorsqu'un travail est dû ET qu'au moins une copie du groupe est
 * évaluée ; avant, tout le monde reste « En attente ».
 *
 * CE QUE ÇA CORRIGE (audit de l'onglet Suivi, constats D-2 et D-3). La règle « aucun artefact ET
 * assiduité > 0 → Non-participation, niveau 3 » ne regardait ni si un travail était dû, ni si une
 * copie était évaluée : au retour de la première séance, TOUTE la classe était en palier intensif —
 * carte RàI, cible d'intervention, barre RàI et barre des patterns du groupe, alerte nommée. Et un
 * élève à zéro donnée l'était aussi dès qu'un écran du Suivi avait calculé les indices, parce
 * qu'une assiduité sans séance vaut 100 % (`indices.js`, non touché ici : la garde le couvre).
 *
 * UNE FONCTION, TROIS LECTEURS — `determinerNiveauRaiPedagogique`, `determinerCibleIntervention`,
 * `afficherAlerteNonParticipation` (tableau-bord-apercu.js) — plutôt que trois copies qui divergeraient.
 *
 * « Un travail dû » : une production non facultative, hors conteneur portfolio, assignée au groupe-cours,
 * dont l'échéance effective est passée (`obtenirEcheanceEffective`, productions.js). « Une copie
 * évaluée » : une évaluation du groupe non remplacée qui porte une note.
 *
 * @returns {{possible: boolean, raison: (string|null)}} `raison` : 'aucun-travail-du' | 'aucune-copie-evaluee'
 */
function depistagePeutJugerLaNonParticipation() {
    const productions = obtenirDonneesSelonMode('productions') || [];
    const aujourdhui = (typeof window.dateLocaleYMD === 'function') ? window.dateLocaleYMD() : new Date().toISOString().slice(0, 10);
    const infoCours = db.getSync('infoCours', null);
    const groupeCoursId = obtenirIdContexteActif(infoCours);
    // #790, PORTE 4 — LA PLUS FACILE À OUBLIER, ET CELLE QUI ANNULE LES TROIS AUTRES.
    // En première semaine, la production diagnostique remplit à elle seule les DEUX
    // conditions ci-dessous dès que l'enseignant a corrigé une première copie : elle
    // est un travail dû, et elle fournit une copie évaluée. Un élève arrivé en retard
    // pour une raison d'horaire basculerait donc en « Non-participation → niveau 3 »
    // par CETTE porte, sans que son exclusion de C ni de la note n'y change rien.
    // ⚠ IL FAUT L'ÉCARTER DES DEUX CÔTÉS, pas d'un seul : si un AUTRE travail est dû
    // mais que la seule copie corrigée est celle du diagnostique, le verdict passerait
    // encore. Les deux conditions se valident indépendamment.
    const dsp = window.ProductionDiagnostique;
    const productionsJugeables = dsp ? dsp.filtrerProductions(productions) : productions;
    const travailDu = productionsJugeables.some(p => {
        if (!p || p.facultatif || p.type === 'portfolio') return false;
        const echeance = (typeof obtenirEcheanceEffective === 'function')
            ? obtenirEcheanceEffective(p, groupeCoursId)
            : { date: p.dateEcheance || null, assignee: true };
        return echeance.assignee && !!echeance.date && echeance.date <= aujourdhui;
    });
    if (!travailDu) return { possible: false, raison: 'aucun-travail-du' };

    const evaluationsBrutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluations = dsp ? dsp.filtrerEvaluations(evaluationsBrutes, productions) : evaluationsBrutes;
    // #737 (lot A, 16 sept. 2026) — « copie évaluée » = copie qui compte : un brouillon commencé ne rend
    // pas la classe jugeable (réserve de la relecture croisée du 5 sept., tranchée avec #737).
    const copieEvaluee = evaluations.some(e => window.evaluationEntreDansLaNote(e));
    if (!copieEvaluee) return { possible: false, raison: 'aucune-copie-evaluee' };

    return { possible: true, raison: null };
}

/* ===============================
   LE NIVEAU COMPARÉ AU GROUPE-COURS — décision de Grégoire, 30 oct. 2026 (lot 2 des seuils)
   Mesuré avant d'être codé : scripts/mesures-depistage/regles-1-et-2.mjs.

   Niveau 3 : plus d'un écart-type sous la moyenne du groupe-cours.
   Niveau 2 : entre un demi et un écart-type sous la moyenne.
   Niveau 1 : le reste.
   Condition commune aux niveaux 2 et 3 : être aussi sous le repère de maîtrise de l'échelle. Sans ce
   repère, la condition se lève (même lecture que `bornesDepistage`).
   Règle 1 : signal de groupe éteint (moyenne à la note de passage ou plus), un élève sous la note de
   passage est au moins au niveau 2. Signal allumé : rien ne change, c'est l'enseignement universel
   qui est en cause, pas un signalement individuel.
   Règle 2 : pas de comparaison au groupe avant 2 copies corrigées. La règle 1 s'applique, elle, dès la
   première copie : la note de passage n'est pas une comparaison au groupe.
   =============================== */
const COPIES_MINIMUM_COMPARAISON = 2;
const EFFECTIF_MINIMUM_GROUPE = 5;

/**
 * La règle nue, sans lecture du stockage.
 * @param {number} note - la moyenne des copies de l'élève, 0-100
 * @param {number} nbCopies - ses copies corrigées
 * @param {{moyenne:number, ecartType:number}|null} reference - son groupe ; null sous l'effectif minimum
 * @param {number|null} repereMaitrise - 0-100 ; null : l'échelle n'en pose pas
 * @param {number} passage - 0-100
 * @returns {{niveau:(1|2|3), motif:string}}
 */
function classerNiveauDansLeGroupe(note, nbCopies, reference, repereMaitrise, passage) {
    const comparable = nbCopies >= COPIES_MINIMUM_COMPARAISON && !!reference
        && (repereMaitrise === null || note < repereMaitrise);
    if (comparable && note < reference.moyenne - reference.ecartType) return { niveau: 3, motif: 'sous-un-ecart-type' };
    if (comparable && note < reference.moyenne - reference.ecartType / 2) return { niveau: 2, motif: 'sous-un-demi-ecart-type' };
    if (note < passage) {
        const signalAllume = !!reference && reference.moyenne < passage;
        return signalAllume ? { niveau: 1, motif: 'signal-de-groupe' } : { niveau: 2, motif: 'sous-la-note-de-passage' };
    }
    return { niveau: 1, motif: nbCopies < COPIES_MINIMUM_COMPARAISON ? 'une-seule-copie' : 'dans-le-groupe' };
}

const _lectureDuGroupeParLot = new WeakMap();

/**
 * Les copies de chaque élève et la référence de chaque groupe-cours, lues en un seul passage. Gardées le temps
 * d'un lot de calculs (`jetonCacheLecture`, même raison que l'index de pratique-registre.js) ; reconstruites à
 * chaque lecture hors lot. Les élèves exclus par statut restent hors de la référence (#745), mais se classent.
 * En mode « tous les groupes », chaque élève reste comparé à SON groupe-cours.
 */
function _lireLeGroupeDuDepistage() {
    const simule = typeof obtenirDonneesSimulationOuNull === 'function' && obtenirDonneesSimulationOuNull('evaluationsSauvegardees');
    const lot = (!simule && typeof jetonCacheLecture === 'function') ? jetonCacheLecture() : null;
    if (lot && _lectureDuGroupeParLot.has(lot)) return _lectureDuGroupeParLot.get(lot);

    const productions = obtenirDonneesSelonMode('productions') || [];
    const brutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const diag = window.ProductionDiagnostique;
    const evaluations = diag ? diag.filtrerEvaluations(brutes, productions) : brutes;
    const evaluables = new Set(obtenirIdsProductionsEvaluables(productions));

    const copies = new Map();
    evaluations.forEach((c) => {
        if (!evaluables.has(c.productionId) || !window.evaluationEntreDansLaNote(c, brutes) || window.evaluationNonRemise(c)) return;
        const lignes = copies.get(c.etudiantDA) || { remises: 0, notes: [] };
        lignes.remises++;
        const note = window.noteRetenueParLeCalcul(c);
        if (typeof note === 'number') lignes.notes.push(note);
        copies.set(c.etudiantDA, lignes);
    });
    const moyenneDe = (notes) => notes.reduce((a, b) => a + b, 0) / notes.length;

    // Un groupe-cours actif ne rend que ses élèves ; « tous les groupes » les rend tous. Un service n'a qu'un groupe,
    // quel que soit le numéro porté par ses fiches (cadrage « Rencontres », lot A).
    const etudiants = obtenirEtudiantsCoursActif();
    const normaliser = window.normaliserNumeroGroupe || String;
    const numeroDe = (e) => normaliser(e.groupeReel || e.groupe);
    const plusieursGroupes = new Set(etudiants.map(numeroDe)).size > 1
        && !(typeof contexteActifEstService === 'function' && contexteActifEstService());
    const cleDe = (e) => plusieursGroupes ? numeroDe(e) : 'groupe';

    const groupeDe = new Map(etudiants.map((e) => [e.da, cleDe(e)]));
    const notesParGroupe = new Map();
    etudiants.filter((e) => !estEtudiantExclu(e)).forEach((e) => {
        const notes = (copies.get(e.da) || { notes: [] }).notes;
        if (!notes.length) return;
        const groupe = cleDe(e);
        notesParGroupe.set(groupe, (notesParGroupe.get(groupe) || []).concat(moyenneDe(notes)));
    });
    const references = new Map();
    notesParGroupe.forEach((valeurs, groupe) => {
        if (valeurs.length < EFFECTIF_MINIMUM_GROUPE) return;
        const moyenne = moyenneDe(valeurs);
        const ecartType = Math.sqrt(valeurs.reduce((a, v) => a + (v - moyenne) ** 2, 0) / (valeurs.length - 1));
        references.set(groupe, { moyenne, ecartType });
    });

    const lecture = { copies, groupeDe, references, plusieursGroupes, moyenneDe };
    if (lot) _lectureDuGroupeParLot.set(lot, lecture);
    return lecture;
}

/**
 * Le signal de groupe : les groupes-cours dont la moyenne est sous la note de passage. Un signal pour le niveau
 * universel, pas pour un élève. `groupe` : le numéro, seulement quand l'écran montre plusieurs groupes.
 * @returns {Array<{groupe:(string|null), moyenne:number, passage:number}>}
 */
function signauxDeGroupeDepistage() {
    const { references, plusieursGroupes } = _lireLeGroupeDuDepistage();
    const passage = reperesPerformance().passage;
    return [...references.entries()]
        .filter(([, r]) => r.moyenne < passage)
        .map(([groupe, r]) => ({ groupe: plusieursGroupes ? groupe : null, moyenne: r.moyenne, passage }));
}

const DESCRIPTION_DU_MOTIF = {
    'sous-un-ecart-type': 'Plus d\'un écart-type sous la moyenne de son groupe.',
    'sous-un-demi-ecart-type': 'Entre un demi et un écart-type sous la moyenne de son groupe.',
    'sous-la-note-de-passage': 'Sous la note de passage, alors que la moyenne de son groupe est au-dessus.',
    'signal-de-groupe': 'Sous la note de passage, comme la moyenne de son groupe : un signal pour l\'enseignement universel.',
    'une-seule-copie': 'Une seule copie corrigée : pas encore de comparaison au groupe.',
    'dans-le-groupe': 'Dans la moyenne de son groupe. Suivi régulier en classe.'
};
const AFFICHAGE_DU_NIVEAU = {
    1: { label: 'Niveau 1 - Universel', badgeClasse: 'badge-rai-1' },
    2: { label: 'Niveau 2 - Préventif', badgeClasse: 'badge-rai-2' },
    3: { label: 'Niveau 3 - Intensif', badgeClasse: 'badge-rai-3' }
};
const BADGE_DU_PATTERN = {
    'Difficulté persistante': 'badge-pattern-difficulte-persistante',
    'Difficulté émergente': 'badge-pattern-difficulte-emergente',
    'Défi spécifique': 'badge-pattern-defi-specifique'
};

/**
 * Détermine le niveau de la Réponse à l'intervention (RàI) : la moyenne des copies de l'élève, comparée à son
 * groupe-cours (voir le bloc ci-dessus). Sans tenir compte de la mobilisation A-C. Le pattern et le défi restent
 * à côté : ils nomment le besoin, ils ne fixent plus le niveau.
 * @param {string} da - Numéro de DA
 * @returns {Object} - Modèle de la Réponse à l'intervention (RàI) avec pattern et descriptif
 */
function determinerNiveauRaiPedagogique(da) {
    // Récupérer les indices
    const indices = calculerTousLesIndices(da);

    // Déterminer quelle fonction utiliser selon la pratique
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null);   // lot N1b : null sans pratique assignée — aucun repli

    // Calculer moyennes SRPNF
    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);


    // Détecter les défis
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    const lecture = _lireLeGroupeDuDepistage();
    const copies = lecture.copies.get(da) || { remises: 0, notes: [] };

    // 🆕 BETA 98.9: Vérifier si données suffisantes avant interprétation
    // Lot 2 (30 oct. 2026) : une copie « non remise » n'est pas une production remise. Avant ce lot, un élève qui n'en
    // avait que de telles tombait au niveau 3 par sa performance de 0 ; il garde ce niveau, sous son vrai nom.
    if (indices3Derniers.nbArtefacts === 0 || copies.remises === 0) {
        // Élève présent mais aucune production → Non-participation (signal prioritaire)
        // #731 — seulement si le groupe permet de le juger : un travail dû ET une copie évaluée
        // (règle de Grégoire, 5 sept. 2026). Sinon la branche « En attente » ci-dessous vaut pour tous.
        if (indices.A > 0 && depistagePeutJugerLaNonParticipation().possible) {
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

    // Le pattern nomme le besoin, sur les N derniers artefacts. Il ne fixe plus le niveau.
    const pattern = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);
    const defi = diagnostic.principalDefi?.nom || 'Aucun';

    // Des copies remises sans aucune note chiffrée : rien à comparer.
    if (copies.notes.length === 0) {
        return {
            niveau: 0,
            label: 'En attente',
            pattern: pattern,
            defi: defi,
            description: 'Aucune note à comparer pour l\'instant.',
            badgeClasse: 'badge-attente',
            patternBadge: BADGE_DU_PATTERN[pattern] || 'badge-pattern-stable',
            signalGroupe: false,
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    const reperes = reperesPerformance();
    const reference = lecture.references.get(lecture.groupeDe.get(da)) || null;
    const { niveau, motif } = classerNiveauDansLeGroupe(
        lecture.moyenneDe(copies.notes), copies.notes.length, reference, reperes.maitrise, reperes.passage);

    return {
        niveau: niveau,
        label: AFFICHAGE_DU_NIVEAU[niveau].label,
        pattern: pattern,
        defi: defi,
        description: DESCRIPTION_DU_MOTIF[motif],
        badgeClasse: AFFICHAGE_DU_NIVEAU[niveau].badgeClasse,
        patternBadge: BADGE_DU_PATTERN[pattern] || 'badge-pattern-stable',
        signalGroupe: motif === 'signal-de-groupe',
        nbArtefacts: indices3Derniers.nbArtefacts,
        fenetreAnalyse: obtenirNombreProductionsPourPatterns()
    };
}

/**
 * Détermine l'alerte contextuelle basée UNIQUEMENT sur A et C
 * (sans tenir compte de la performance P). La règle : `qualifierContexteApprentissage`.
 * @param {string} da - Numéro de DA
 * @returns {Object} - Alerte contextuelle avec niveau d'engagement
 */
function determinerAlerteContextuelle(da) {
    // Récupérer les indices de mobilisation
    const indices = calculerTousLesIndices(da);
    // #743 (lot D, 19 sept. 2026) : une assiduité INCONNUE reste `null` — `null / 100` vaudrait 0.
    const assiduiteInconnue = indices.A === null || indices.A === undefined;
    const A = assiduiteInconnue ? null : indices.A / 100; // décimal 0-1, ou null
    // Lot N1b (21 sept. 2026) : une complétion INCONNUE (`null`, sans pratique assignée) reste `null` —
    // `null / 100` vaut 0, et tout le groupe se lisait « Fragile » sur un zéro qui n'existe pas.
    const completionInconnue = indices.C === null || indices.C === undefined;
    const C = completionInconnue ? null : indices.C / 100; // décimal 0-1, ou null
    const texteA = assiduiteInconnue ? '—' : formaterPourcentage(A * 100, 0);

    // Lot N1b — SANS COMPLÉTION, LE CONTEXTE NE SE QUALIFIE PAS (même forme que l'assiduité inconnue,
    // #743) : un tiret à la place du palier. La phrase est celle du diagnostic du profil — aucun mot neuf.
    if (completionInconnue) {
        return {
            niveau: 'inconnu',
            label: '—',
            description: '',
            badgeClasse: 'badge-attente',
            A: texteA,
            C: '—',
            recommandation: (typeof window._diagnostiquerNoteNonCalculable === 'function') ? window._diagnostiquerNoteNonCalculable() : '',
            donneesSuffisantes: false
        };
    }

    // 🆕 BETA 96.1: Vérifier si données suffisantes pour C
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);
    const cEstCalculable = indices3Derniers.nbArtefacts > 0 || C > 0;

    // 🆕 BETA 96.1: Si C n'est pas calculable, retourner un état "en attente"
    if (!cEstCalculable) {
        return {
            niveau: 'attente',
            label: 'En attente',
            description: 'Données insuffisantes pour évaluer le contexte. En attente des premières remises.',
            badgeClasse: 'badge-attente',
            A: texteA,
            C: 'En attente',
            recommandation: 'L\'interprétation du contexte d\'apprentissage sera disponible après les premières remises.',
            donneesSuffisantes: false
        };
    }

    // #743 (lot D) — SANS ASSIDUITÉ, LE CONTEXTE NE SE QUALIFIE PAS. Les quatre paliers sont une
    // conjonction sur A ET C : avec un A inconnu, « Très favorable » (l'ancien A = 100 %) était une donnée
    // qui n'existe pas. Un tiret à la place du palier ; C, lui, se lit. La phrase sous le tiret est
    // de Grégoire (validée le 19 sept. 2026, « s'affichera ») : rangée dans `recommandation`, le ton
    // gris de la carte — `description` s'y dessine en couleur d'alerte, et ceci n'en est pas une.
    if (assiduiteInconnue) {
        return {
            niveau: 'inconnu',
            label: '—',
            description: '',
            badgeClasse: 'badge-attente',
            A: texteA,
            C: formaterPourcentage(C * 100, 0),
            recommandation: 'L\'assiduité n\'est pas encore connue : le contexte s\'affichera dès qu\'une séance sera saisie pour cet·te étudiant·e.',
            donneesSuffisantes: false
        };
    }

    // #821 lot A (10 sept. 2026) — LA RÈGLE N'EST PLUS ICI. Les quatre paliers
    // par conjonction sur A et C (bornes 85 / 75 / 65) vivent dans
    // `contexte-qualification.js`, à côté des trois autres mécanismes qui
    // qualifient un contexte — pour qu'on puisse les comparer. Cette fonction
    // lit les indices, décide si C est calculable, puis délègue.
    // Retiré au passage : un appel à `interpreterMobilisation(A, C)` dont le
    // résultat n'était lu nulle part.
    return qualifierContexteApprentissage(A, C);
}

/**
 * Le libellé lisible d'un niveau SOLO configuré sur un critère de grille.
 *
 * ⮕ POURQUOI UN HELPER PLUTÔT QUE LA CORRESPONDANCE ÉCRITE DEUX FOIS. La même
 * table vivait inline dans `interventions.js` (badge du sélecteur de critères
 * ciblés). Deux écritures d'une seule table, c'est deux endroits à changer le
 * jour où un niveau s'ajoute — et un des deux qu'on oublie.
 *
 * ⚠ NE PAS CONFONDRE avec le `niveauSOLO` d'un NIVEAU D'ÉCHELLE (`js/echelles.js`),
 * qui porte le même vocabulaire sur un autre objet. Ici : l'étiquette d'un
 * CRITÈRE, saisie dans l'éditeur de grilles.
 *
 * @param {string} niveauSOLO - Étiquette configurée du critère
 * @returns {string} Libellé lisible
 */
function libelleNiveauSOLO(niveauSOLO) {
    // Même défaut que `calculerIPB`, `typeCritereSelonSOLO` et l'éditeur de
    // grilles : un critère sans étiquette est une fondation.
    // Lot 4, volet B (4 sept. 2026) : « Aucun » n'a PAS de libellé — ce critère ne
    // nourrit pas la lecture SOLO, et un badge « multistructurel » mentirait. Les
    // lecteurs sautent un libellé vide (badge, parenthèse du défi).
    if (niveauSOLO === 'aucun') return '';
    if (niveauSOLO === 'relationnel') return 'relationnel';
    if (niveauSOLO === 'abstrait_etendu') return 'abstrait étendu';
    return 'multistructurel';
}

/**
 * Le nom d'un défi, suivi de son étiquette SOLO entre parenthèses — sauf quand le
 * critère n'en a pas (« Aucun », lot 4) : alors le nom seul, pas « Langue () ».
 * @param {{nom: string, niveauSOLO: string}} defi
 * @returns {string}
 */
function nommerDefiAvecSOLO(defi) {
    // #1117 (19 oct. 2026) : observation SOLO désactivée, le nom seul — l'étiquette du critère
    // suit le réglage, comme son menu dans l'éditeur de grilles.
    const soloActive = typeof obtenirPreference !== 'function' || obtenirPreference('afficherDescriptionsSOLO') !== false;
    const libelle = soloActive ? libelleNiveauSOLO(defi && defi.niveauSOLO) : '';
    return libelle ? defi.nom + ' (' + libelle + ')' : String((defi && defi.nom) || '');
}

/**
 * Ce que le dépistage OBSERVE chez un élève, et à quelle intensité.
 *
 * ⚠⚠ #552 · #535 · #537 (27 août 2026) — CE QUI VIVAIT ICI ÉTAIT LE CONTEXTE
 * DE GRÉGOIRE, ÉCRIT DANS LE CODE.
 *
 * Quatre résolveurs (`_resoudreCibleDifficultePersistante`, `...Emergente`,
 * `...DefiSpecifique`, `...Stable`) branchaient sur le NOM du critère en défi
 * — « Structure », « Rigueur », « Plausibilité », « Nuance », « Français » —
 * croisé avec `I`, la moyenne de l'élève au critère de langue, comparée aux
 * seuils 17 / 18 / 20 / 21 / 25 / 27. Ils rendaient un vocabulaire
 * d'intervention (« CAF », « Dépistage SA », « Remédiation en X », « Pratique
 * guidée en X ») et une intensité RàI 1/2/3.
 *
 * ⮕ TROIS DÉFAUTS SUPERPOSÉS, mesurés le 27 août :
 *   1. `I` conditionnait les branches de TOUS les critères, pas seulement
 *      celles du français. Trois élèves de performance identique, tous en défi
 *      sur le même critère, recevaient trois cibles différentes selon leur
 *      seule note de langue — et la difficulté des deux derniers n'était même
 *      plus nommée.
 *   2. Les seuils étaient des NOTES BRUTES SUR 30 (17/30 = seuil d'échec)
 *      comparées à un POURCENTAGE 0-100 (`scoresFrancais.push(score * 100)`).
 *      Même patron que la correction 1.102. Sur une pondération de 20, la bande
 *      `I >= 21 && I <= 27` ne pouvait plus jamais correspondre à une note réelle.
 *   3. Le vocabulaire d'intervention était celui de son réseau. Un enseignant
 *      qui n'a pas de CAF recevait une prescription qui ne le concerne pas.
 *
 * ⮕ CE QUI LES REMPLACE, et pourquoi ce n'est pas un autre arbitraire :
 *   · L'INTENSITÉ vient de la carte RàI (`determinerNiveauRaiPedagogique`),
 *     et d'elle SEULE — #744, lot C du cadrage du 16 sept. 2026, règle tranchée
 *     par Grégoire. Jusqu'au 17 sept. elle venait du suivi des fondations
 *     (`suivi.niveauRaI`) : deux paliers pour un même élève, selon l'écran.
 *   · LA PERSISTANCE vient de `diagnostiquerSuiviApprentissage` — le croisement
 *     IPB × direction, qui compte les artefacts consécutifs sous le seuil de
 *     défi CONFIGURÉ et lit une tendance. Aucun nom de critère, aucun seuil
 *     écrit ici. Elle NOMME la cible ; elle ne rend plus de palier.
 *   · LA CAUSE est NOMMÉE, pas prescrite : le critère en défi — dont le nom
 *     vient de la grille de l'utilisateur — et son niveau SOLO configuré.
 *     « L'app fournit les données ; l'enseignant prend les décisions »
 *     (`depistage-rai`). C'est le geste de #550 et du lot 3 de #542 : nommer
 *     plutôt que deviner.
 *
 * ⚠ CE QUI RESTE À TRAITER, et qu'il ne faut pas croire réglé :
 *   · Le seuil de défi (`obtenirSeuil('defiSpecifique')`) a un défaut à 0,70 et
 *     des replis en dur qui divergent selon les fichiers (0,70 ici et dans
 *     `interventions.js`, 0,75 dans `sections-affichage.js` et
 *     `pratique-pan-standards.js`). C'est le point de convergence du §6 de la
 *     consigne #552/#537/#535.
 *   · #554 (11 oct. 2026) : la branche « Décrochage » reçoit le statut de la
 *     fiche (Cadre › Trimestre, `trimestre-v2-etudiants.js`). Rien ne change à
 *     l'écran aujourd'hui : le seul appelant vivant (`tableau-bord-apercu.js`)
 *     écarte déjà les élèves exclus (`estEtudiantExclu`) et ne lit que `.pattern`.
 *
 * @param {string} da - Le DA de l'élève
 * @returns {Object} { cible, pattern, niveau, couleur }
 */
function determinerCibleIntervention(da) {
    const indices = calculerTousLesIndices(da);
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null);   // lot N1b : null sans pratique assignée — aucun repli

    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);

    const diagnostic = diagnostiquerForcesChallenges(moyennes);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    // Élève présent, aucune production remise : il n'y a rien à mesurer, et
    // c'est en soi le signal le plus fort. Conséquence logique, pas seuil.
    if (indices3Derniers.nbArtefacts === 0) {
        // #731 — même garde que la carte RàI : sans travail dû ou sans copie évaluée dans le groupe,
        // « En attente » (niveau 0), pas un palier inventé.
        if (!depistagePeutJugerLaNonParticipation().possible) {
            return { cible: 'En attente', pattern: 'Données insuffisantes', niveau: 0, couleur: '#8aa4b0' };
        }
        if (indices.A > 0) {
            return { cible: 'Non-participation', pattern: 'Non-participation', niveau: 3, couleur: '#dc3545' };
        }
    }

    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);

    // La mobilisation prime sur le dépistage : un élève décroché ne se lit pas
    // dans ses critères. #554 : le statut vient de la fiche du groupe-cours actif.
    const fiche = (typeof obtenirEtudiantsCoursActif === 'function')
        ? obtenirEtudiantsCoursActif().find(e => e.da === da) : null;
    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100,
        !!fiche && fiche.statut === 'décrochage');
    if (interpMobilisation.code === 'decrochage') {
        return { cible: 'Décrochage', pattern: M, niveau: 3, couleur: '#9e9e9e' };
    }

    const suivi = (typeof diagnostiquerSuiviApprentissage === 'function')
        ? diagnostiquerSuiviApprentissage(da)
        : null;

    // #744 — LE PALIER EST CELUI DE LA CARTE RàI, dans les deux sorties ci-dessous.
    // Les sorties anticipées plus haut (« En attente », « Non-participation ») rendent
    // déjà ce que la carte rend dans les mêmes cas (même garde #731).
    const palierCarte = determinerNiveauRaiPedagogique(da).niveau;

    // ⮕ SANS SUIVI, ON NOMME LA CAUSE — on n'invente pas une persistance.
    // `diagnostiquerSuiviApprentissage` rend `null` quand aucune grille de
    // référence n'est utilisable ou qu'aucune évaluation n'est comparable.
    // Le palier, lui, ne dépend plus du suivi : la carte le donne (#744).
    // ⚠ Conséquence nommée : un élève jamais présent (A = 0) et sans copie passe
    // par ici ; la carte le dit « En attente » (niveau 0), et la barre des patterns
    // du groupe l'écarte désormais comme la barre RàI l'écartait déjà (#731).
    if (!suivi) {
        return {
            cible: 'Persistance non calculable — aucun suivi des fondations disponible',
            pattern: M,
            niveau: palierCarte,
            couleur: '#8aa4b0'
        };
    }

    // ⮕ CE QUI N'EST PLUS MÊLÉ ICI : le contexte de mobilisation. Il avait sa
    // branche de repli (« Risque de démotivation », niveau 2, sur `fragile` ou
    // `critique`), qui mêlait une lecture d'ENGAGEMENT à une intensité
    // PÉDAGOGIQUE. Le skill `depistage-rai` les tient séparés, et l'écran aussi :
    // `determinerAlerteContextuelle` a sa propre carte.
    const defi = diagnostic.principalDefi;
    const cible = defi
        ? suivi.diagnostic + ' — ' + nommerDefiAvecSOLO(defi)
        : suivi.diagnostic;

    return { cible: cible, pattern: M, niveau: palierCarte, couleur: suivi.couleur };
}

// Exporter vers window (décision étape 1 b — convention systématique).
// Le compte est retiré : il disait 14 et le module en exporte davantage depuis
// #552 — un chiffre juste sous un mauvais libellé est un chiffre faux.
window.obtenirEchelleResolue = obtenirEchelleResolue;
window.obtenirEchelleCommuneDesEvaluations = obtenirEchelleCommuneDesEvaluations;
window.obtenirTableConversionNiveaux = obtenirTableConversionNiveaux;
// #575 — l'ordre des niveaux, dérivé de l'échelle. Consommées par
// `liste-evaluations.js` (tri de la colonne « Niveau ») et
// `evaluation-retroaction.js` (bilan : libellés, défis, progrès).
window.niveauxOrdonnesDeLEchelle = niveauxOrdonnesDeLEchelle;
window.ordonnerNiveauxParPlage = ordonnerNiveauxParPlage;
window.niveauDuCodeDansEchelle = niveauDuCodeDansEchelle;
window.echellesComparables = echellesComparables;
window.zoneDuNiveau = zoneDuNiveau;                                           // #555 lot 2
window._diagnostiquerResolutionEchelles = _diagnostiquerResolutionEchelles;   // diagnostic console (audit du 28 août)
// #555 lot 2 (b) — la règle nue, pour qui tient déjà son échelle plutôt qu'un
// identifiant : l'aperçu de l'éditeur (`echelles.js`), sur une échelle en cours
// de saisie que `obtenirEchelleResolue` ne peut pas résoudre.
window.zoneDuCodeDansNiveaux = zoneDuCodeDansNiveaux;
window.convertirNiveauEnScore = convertirNiveauEnScore;
// #752 — consommées par `graphiques-progression.js` (courbes par critère du profil,
// trajectoires par habileté) : la même conversion que le dépistage, par évaluation.
window.tableConversionPourEvaluation = tableConversionPourEvaluation;
window.scoreCritereEvaluation = scoreCritereEvaluation;
window.trouverCritereDepistage = trouverCritereDepistage;   // #740 — l'appariement partagé des lecteurs
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
window.classerNiveauDansLeGroupe = classerNiveauDansLeGroupe;   // lot 2 des seuils : la règle nue
window.signauxDeGroupeDepistage = signauxDeGroupeDepistage;     // la phrase sous la barre RàI
window.determinerAlerteContextuelle = determinerAlerteContextuelle;
window.libelleNiveauSOLO = libelleNiveauSOLO;
window.nommerDefiAvecSOLO = nommerDefiAvecSOLO;   // lot 4, volet B
window.determinerCibleIntervention = determinerCibleIntervention;
window.depistagePeutJugerLaNonParticipation = depistagePeutJugerLaNonParticipation;   // #731 — la garde partagée des trois lecteurs

})();
