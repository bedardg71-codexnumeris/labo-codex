/* ===============================
   MODULE 15a: PROFIL ÉTUDIANT — HELPERS
   Extrait de profil-etudiant.js (zone L50-636) — refactor 17 mai 2026

   Contenu de ce sous-module :
   - Helpers IDME (couleurs, conversion pourcentage→niveau)
   - Terminologie configurable (artefact/production)
   - Accesseurs (pratique actuelle, grille de référence, critères avec valeurs)
   - Init module (initialiserModuleProfilEtudiant)
   - Badges (pratique, pattern)
   - Interprétations des indices A-C-P-M (mobilisation, performance, complétion, assiduité)

   Tous les helpers sont promus `window.X` (Écart #4 MODULES-MAP §2.3 + décision
   étape 1 b — convention systématique cross-zones).

   Chargé AVANT profil-etudiant.js (zone résidu) dans index.html — les sections,
   calculs, diagnostics, rapport, actions et confidentiel l'utilisent via window.X.
   =============================== */

(function() {
'use strict';

/* ===============================
   🎨 FONCTIONS HELPER POUR COULEURS IDME
   =============================== */

/* ===============================
   📚 FONCTION HELPER POUR TERMINOLOGIE CONFIGURABLE
   =============================== */

/**
 * Retourne le terme approprié pour désigner les productions évaluées selon la pratique de notation
 * Évite le terme "artefact" codé en dur qui est spécifique au portfolio
 *
 * DISTINCTION IMPORTANTE :
 * - Production = Travail soumis par l'élève (objet évalué)
 * - Évaluation = Acte pédagogique de l'enseignant (porter un jugement)
 *
 * @param {string} context - Contexte d'utilisation: 'singulier', 'pluriel', 'partitif' (d'artefact)
 * @param {boolean} majuscule - Mettre une majuscule (défaut: false)
 * @returns {string} - Le terme approprié ("artefact", "production", "travail", etc.)
 */
function obtenirTermeProduction(context = 'singulier', majuscule = false) {
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) || (window.PRATIQUE_DEFAUT || 'standards');

    // Définir les termes selon la pratique
    let termes = {
        singulier: 'artefact',
        pluriel: 'artefacts',
        partitif: "d'artefact"
    };

    // Standards : terme "artefact" (portfolio d'apprentissage)
    if (pratique === 'standards') {
        // Terme personnalisé configurable — champ PROPRE des modalités
        // (pas un miroir ; seule la dérivation du type a migré en L2-b1)
        const config = db.getSync(cle('modalitesEvaluation'), null) || {};
        const termePerso = config.termeProduction || 'artefact';
        termes = {
            singulier: termePerso,
            pluriel: termePerso + 's',
            partitif: "d'" + termePerso
        };
    }
    // Sommative ou autre : terme "production" (neutre et non ambigu)
    else {
        termes = {
            singulier: 'production',
            pluriel: 'productions',
            partitif: 'de production'
        };
    }

    let terme = termes[context] || termes.singulier;

    // Appliquer majuscule si demandé
    if (majuscule) {
        terme = terme.charAt(0).toUpperCase() + terme.slice(1);
    }

    return terme;
}

/**
 * Table d'accord (genre + nombre) des mots qui qualifient le terme production/artefact.
 * #309 : quand le terme passe au féminin (« production »), ces mots doivent suivre,
 * sinon « productions remis / totaux » au lieu de « remises / totales ».
 * Ordre des formes : [masc-sing, masc-plur, fém-sing, fém-plur].
 */
const _ACCORDS_TERME_PRODUCTION = {
    remis:     ['remis', 'remis', 'remise', 'remises'],
    retenu:    ['retenu', 'retenus', 'retenue', 'retenues'],
    evalue:    ['évalué', 'évalués', 'évaluée', 'évaluées'],
    recevable: ['recevable', 'recevables', 'recevable', 'recevables'],
    meilleur:  ['meilleur', 'meilleurs', 'meilleure', 'meilleures'],
    recent:    ['récent', 'récents', 'récente', 'récentes'],
    aucun:     ['aucun', 'aucuns', 'aucune', 'aucunes'],
    total:     ['total', 'totaux', 'totale', 'totales'],
    tous:      ['tout', 'tous', 'toute', 'toutes'],
    dernier:   ['dernier', 'derniers', 'dernière', 'dernières']
};

/**
 * Genre du terme production/artefact selon la pratique active. #309.
 * 'standards' (portfolio) → « artefact » masculin (terme perso = masculin par défaut,
 * décision Grégoire 2 juin 2026) ; toute autre pratique → « production » féminin.
 * Même résolution de pratique que obtenirTermeProduction (id canonique normalisé).
 * @returns {'m'|'f'}
 */
function genreTermeProduction() {
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    const pratique = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) || (window.PRATIQUE_DEFAUT || 'standards');
    return pratique === 'standards' ? 'm' : 'f';
}

/**
 * Renvoie un mot d'accord accordé au genre du terme actif ET au nombre. #309.
 * @param {string} motCle - clé dans _ACCORDS_TERME_PRODUCTION (ex. 'remis', 'total', 'aucun')
 * @param {number} nombre - quantité (>1 → pluriel)
 * @param {boolean} majuscule - capitaliser la 1re lettre (ex. « Aucune » en début de phrase)
 * @returns {string} la forme accordée ; renvoie motCle tel quel si la clé est inconnue
 */
function accordTermeProduction(motCle, nombre = 1, majuscule = false) {
    const formes = _ACCORDS_TERME_PRODUCTION[motCle];
    if (!formes) {
        console.warn('[accordTermeProduction] mot-clé inconnu : ' + motCle);
        return motCle;
    }
    const idx = (genreTermeProduction() === 'f' ? 2 : 0) + (nombre > 1 ? 1 : 0);
    let forme = formes[idx];
    if (majuscule) forme = forme.charAt(0).toUpperCase() + forme.slice(1);
    return forme;
}

/**
 * Obtient la couleur d'un niveau IDME depuis l'échelle configurée
 * @param {string} codeNiveau - Code du niveau (I, D, M, E, 0)
 * @returns {string} - Couleur CSS (hex ou var(--...))
 */
function obtenirCouleurNiveauIDME(codeNiveau) {
    if (!codeNiveau) return '#999999';

    // Lire l'échelle IDME par défaut (première échelle trouvée)
    const echelles = db.getSync(cle('echellesTemplates'), []);
    const echelleIDME = echelles.find(e => e.nom && e.nom.toLowerCase().includes('idme')) || echelles[0];

    if (!echelleIDME || !echelleIDME.niveaux) {
        // Couleurs par défaut si pas d'échelle
        const couleursDefaut = {
            '0': '#9E9E9E',
            'I': '#F44336',
            'D': '#FF9800',
            'M': '#4CAF50',
            'E': '#2196F3'
        };
        return couleursDefaut[codeNiveau] || '#999999';
    }

    const niveau = echelleIDME.niveaux.find(n => n.code === codeNiveau);
    return niveau ? niveau.couleur : '#999999';
}

/**
 * Détermine le niveau d'un pourcentage selon les seuils configurés.
 *
 * ⚠⚠ LE DÉFAUT CORRIGÉ ICI : DEUX UNITÉS COMPARÉES SANS CONVERSION (#541,
 * 26 août 2026).
 *
 * Cette fonction reçoit un POURCENTAGE, sur 0-100. C'est son nom, c'est son
 * contrat documenté, et c'est ce que passent ses appelants — `critere.score
 * * 100` dans `profil-etudiant-diagnostics`, `P` dans `sections-affichage`
 * (comparé deux lignes plus bas à `seuil * 100`).
 *
 * Les seuils, eux, viennent d'`obtenirSeuil('idme.*')` et valent 0-1 : 0.64,
 * 0.75, 0.85. Les deux étaient comparés TELS QUELS. Conséquence : tout
 * pourcentage supérieur à 0.85 — c'est-à-dire tout score au-dessus de 1 %,
 * donc à peu près tous — traversait les trois `if` sans en satisfaire aucun et
 * tombait dans le dernier `return`. **Un critère à 12 % était classé « E »,
 * Étendu.**
 *
 * Le bloc « Forces et défis » du diagnostic ne pouvait donc afficher que des
 * forces exceptionnelles, pour tout le monde, y compris pour un élève en
 * difficulté sur tous ses critères — et rien ne le signalait. Le défaut est
 * antérieur au décodage-en-dur de #529 : il existe au moins depuis
 * l'extraction du 17 mai 2026 (d9c67936), et aucun test ne l'exerçait.
 *
 * ⮕ CE QUI N'A PAS ÉTÉ CHANGÉ, ET POURQUOI. Le contrat reste 0-100 : le nom
 * de la fonction l'annonce, les deux appelants le respectent déjà, et le
 * déplacer aurait demandé de toucher des sites d'appel que ce correctif n'a
 * pas à rouvrir. C'est la conversion qui manquait, pas le contrat.
 *
 * Verrouillé par `tests/unit/sentinelle-541-niveau-depuis-pourcentage.test.js`.
 *
 * @param {number} pourcentage - Pourcentage sur 0-100 (et non un score 0-1)
 * @returns {string} - Code du niveau, selon les seuils configurés
 */
function obtenirNiveauIDMEDepuisPourcentage(pourcentage) {
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant'); // 0-1 — défaut 0.64
    const seuilDeveloppement = obtenirSeuil('idme.developpement'); // 0-1 — défaut 0.75
    const seuilMaitrise = obtenirSeuil('idme.maitrise'); // 0-1 — défaut 0.85

    // Ramener l'entrée sur l'échelle des seuils. PAS de détection du genre
    // « si c'est petit, c'est sans doute déjà 0-1 » : 0.8 serait alors
    // indistinguable de 0,8 % et de 80 %, et la fonction deviendrait un
    // devineur. Un seul contrat, celui que le nom annonce.
    const score = pourcentage / 100;

    if (score < seuilInsuffisant) return 'I';
    if (score < seuilDeveloppement) return 'D';
    if (score < seuilMaitrise) return 'M';
    return 'E';
}

/**
 * Situe un pourcentage dans les PLAGES de l'échelle fournie et rend le NIVEAU
 * atteint — l'objet complet, pas seulement son code.
 *
 * ⮕ #542 lot 3, pas 1. C'est la moitié « SITUER » du dépistage. La moitié
 * « INTERPRÉTER » — lire l'étiquette `niveauSOLO` du niveau obtenu — est
 * volontairement dehors : les deux ne demandent pas la même chose de
 * l'utilisateur. Situer ne demande que des plages, présentes dans toute
 * échelle ; interpréter demande une étiquette SOLO, facultative.
 *
 * POURQUOI ELLE EXISTE. `obtenirNiveauIDMEDepuisPourcentage` (juste au-dessus)
 * compare la moyenne à `idme.insuffisant` / `idme.developpement` /
 * `idme.maitrise` — 0,64 / 0,75 / 0,85. Mesuré le 26 août 2026 sur les données
 * réelles : ce sont les bornes de l'échelle de Grégoire, au chiffre près,
 * recopiées dans le code il y a des mois. Le dépistage d'un utilisateur qui note
 * autrement lit donc l'échelle d'un autre. Ici, les bornes viennent de SON
 * échelle.
 *
 * CE QUI RESTE NUMÉRIQUE, ET POURQUOI. Agréger plusieurs évaluations exige une
 * moyenne, donc des nombres. Ce qui doit disparaître n'est pas le calcul : c'est
 * le fait que les BORNES viennent d'ailleurs que de l'échelle de l'utilisateur.
 *
 * CONTRAT D'ENTRÉE : un POURCENTAGE 0-100, comme les `min`/`max` des niveaux.
 * Aucune détection du genre « si c'est petit, c'est sans doute déjà 0-1 » —
 * c'est exactement le défaut #541, et un devineur n'est pas un contrat.
 *
 * LA PREMIÈRE PLAGE QUI CONTIENT LA VALEUR GAGNE. Ce n'est pas un détail : dans
 * l'échelle réelle de Grégoire, « 0 » couvre 0-0 et « I » couvre 0-64 — les deux
 * contiennent 0. Une moyenne de 0 rend donc « 0 », pas « I ». C'est le
 * comportement de `calculerNote` (`evaluation-calcul.js`) depuis toujours, et le
 * reproduire ici est délibéré : deux écrans qui situent la même note ne doivent
 * pas rendre deux niveaux différents.
 *
 * AUCUNE PLAGE NE CONTIENT LA VALEUR : rend `null`. PAS de repli « niveau le
 * plus proche ». Décision du pas 1, et son motif : `calculerNote` a un tel repli
 * (par distance au milieu de la plage), mais il fabrique une réponse que
 * l'échelle ne donne pas. C'est un fallback arbitraire, et le projet en interdit
 * — le même argument qu'a retenu #526 pour refuser de déduire `valeurCalcul` du
 * milieu d'une plage (`echelles.js`, `refusChampNiveau`). Ici, `null` veut dire
 * « cette échelle ne répond pas pour cette valeur », et c'est à l'appelant de le
 * DIRE, jamais de le masquer. `calculerNote` garde son repli : la notation est
 * hors du périmètre du lot 3, et le changer serait une régression écrite en
 * passant.
 *
 * ⮕ CINQ SITES DU DÉPÔT répètent cette mise en plage à la main —
 * `evaluation-calcul.js:130, 263, 439, 638` et
 * `profil-etudiant-sections-affichage.js:709`. Ils sont candidats à converger
 * ici, mais aucun n'est touché par le lot 3 : ce sont des écrans de NOTATION.
 *
 * Verrouillé par `tests/unit/sentinelle-542-situer-pourcentage-dans-echelle.test.js`.
 *
 * @param {number} pourcentage - Pourcentage sur 0-100 (et non un score 0-1)
 * @param {Object} echelle - Échelle de l'évaluation, avec son tableau `niveaux`
 * @returns {Object|null} - Le niveau atteint (objet complet), ou `null`
 */
function situerPourcentageDansEchelle(pourcentage, echelle) {
    if (!Number.isFinite(pourcentage)) return null;

    const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : null;
    if (!niveaux || niveaux.length === 0) return null;

    const trouve = niveaux.find(function(n) {
        const min = _borneNumeriqueOuNull(n && n.min);
        const max = _borneNumeriqueOuNull(n && n.max);
        if (min === null || max === null) return false;
        return pourcentage >= min && pourcentage <= max;
    });

    return trouve || null;
}

/**
 * Une borne de niveau lue comme nombre, ou `null` si elle n'en est pas un.
 *
 * `Number('')` vaut 0 : une borne VIDE deviendrait donc la borne zéro, et un
 * niveau mal saisi capturerait toutes les moyennes nulles. #526 refuse désormais
 * une borne vide à la saisie (`refusChampNiveau`), mais les échelles écrites
 * avant lui vivent encore dans les données. Privée au module : ce n'est pas une
 * règle métier, c'est la lecture prudente d'un champ.
 */
function _borneNumeriqueOuNull(valeur) {
    if (valeur === null || valeur === undefined || valeur === '') return null;
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : null;
}

/**
 * Interprète le NIVEAU ATTEINT — celui que rend `situerPourcentageDansEchelle` —
 * par l'étiquette SOLO que l'utilisateur a posée dessus.
 *
 * ⮕ #542 lot 3, pas 2. C'est la moitié « INTERPRÉTER ». Elle est séparée de la
 * moitié « SITUER » parce que les deux ne demandent pas la même chose : situer ne
 * demande que des plages, présentes dans TOUTE échelle ; interpréter demande une
 * étiquette SOLO, qui est FACULTATIVE.
 *
 * ⚠ DÉCISION DE GRÉGOIRE, 27 août 2026 — OPTION B : « l'étiquette est
 * facultative, et son absence est DITE ». Deux options ont été écartées ce
 * jour-là, et il faut savoir pourquoi avant de les rouvrir :
 *
 *   A — exiger que l'utilisateur étiquette son échelle d'abord. Écartée : elle
 *       rend le dépistage MUET tant que la porte n'est pas passée, et un
 *       utilisateur qui n'a jamais entendu parler de SOLO ne la passera jamais.
 *   C — retomber sur les seuils `idme.*` quand l'étiquette manque. Écartée : ce
 *       sont les bornes de Grégoire recopiées dans le code, et les retirer est
 *       tout l'objet du chantier. Un repli les y remettrait par la porte
 *       arrière — c'est exactement la manière dont ils y étaient entrés.
 *
 * ⮕ CE QUE B DONNE, ET QUI EST LE POINT : sans étiquette, le dépistage rend le
 * NOM DU NIVEAU ATTEINT — « Avancé », « Maîtrise », ce que l'utilisateur a écrit —
 * et DIT que l'interprétation SOLO n'est pas configurée. Il ne se tait pas, il
 * n'invente pas, et il nomme ce qui manque. C'est le patron du lot 1
 * (`diagnostiquerConversionNiveaux`) : un message qui NOMME la cause, parce
 * qu'une cause nommée se répare et qu'un silence ne se répare pas.
 *
 * ⚠ AUJOURD'HUI, AUCUNE ÉCHELLE RÉELLE NE PORTE D'ÉTIQUETTE : le lot 2 a livré le
 * champ, et il naît vide. Le chemin « non interprétée » est donc, pour l'instant,
 * le SEUL que les données de Grégoire empruntent. Ce n'est pas un cas de bord
 * théorique, c'est le cas courant — et c'est lui qu'une porte terrain doit
 * regarder.
 *
 * Verrouillé par `tests/unit/sentinelle-542-interpreter-niveau-atteint.test.js`.
 *
 * @param {Object|null} niveau - Le niveau atteint, tel que rendu par `situerPourcentageDansEchelle`
 * @returns {Object} - `{ interpretee, solo, libelleSOLO, texte, raison, message }`
 */
function interpreterNiveauAtteint(niveau) {
    // Aucun niveau : la moyenne ne tombait dans aucune plage, ou l'échelle est
    // introuvable. Il n'y a rien à interpréter, et surtout rien à supposer.
    if (!niveau) {
        return {
            interpretee: false,
            solo: null,
            libelleSOLO: null,
            texte: null,
            raison: 'sans-niveau',
            message: 'La moyenne ne correspond à aucun niveau de l\'échelle utilisée. '
                + 'Vérifie que les plages de l\'échelle couvrent bien tout l\'intervalle des notes.'
        };
    }

    const nomDuNiveau = String(niveau.nom || niveau.code || '').trim() || null;
    const etiquette = String(niveau.niveauSOLO == null ? '' : niveau.niveauSOLO).trim();

    // Sans étiquette : le NOM du niveau, et l'absence est dite. C'est l'option B.
    if (!etiquette) {
        return {
            interpretee: false,
            solo: null,
            libelleSOLO: null,
            texte: nomDuNiveau,
            raison: 'sans-etiquette',
            message: 'Le niveau atteint est affiché tel que tu l\'as nommé. '
                + 'Pour obtenir une interprétation en termes de taxonomie SOLO, associe une '
                + 'étiquette SOLO à chaque niveau de ton échelle, dans l\'éditeur d\'échelles.'
        };
    }

    // La table des cinq niveaux SOLO vit dans `echelles.js` — UN seul producteur,
    // celui-là même qui alimente le menu de l'éditeur (#542 lot 2). On la lit, on
    // n'en refait pas une copie : deux copies d'une même liste finissent toujours
    // par diverger, et #529 a passé une session à défaire ce patron.
    const table = (typeof NIVEAUX_SOLO_ECHELLE !== 'undefined')
        ? NIVEAUX_SOLO_ECHELLE
        : (typeof window !== 'undefined' ? window.NIVEAUX_SOLO_ECHELLE : null);

    const entree = Array.isArray(table)
        ? table.find(function(n) { return n && n.valeur === etiquette; })
        : null;

    // Étiquette posée mais inconnue de la table — donnée importée, ou table non
    // chargée. On ne devine pas : on retombe sur le nom du niveau, et on dit
    // laquelle des deux causes s'applique.
    if (!entree || !entree.description) {
        return {
            interpretee: false,
            solo: etiquette,
            libelleSOLO: entree ? entree.libelle : null,
            texte: nomDuNiveau,
            raison: Array.isArray(table) ? 'etiquette-inconnue' : 'table-absente',
            message: Array.isArray(table)
                ? 'Ce niveau porte l\'étiquette SOLO « ' + etiquette + ' », qui ne fait pas '
                    + 'partie des cinq niveaux de la taxonomie. Le niveau atteint est affiché tel quel.'
                : 'La table des niveaux SOLO n\'est pas disponible. Le niveau atteint est affiché tel quel.'
        };
    }

    return {
        interpretee: true,
        solo: entree.valeur,
        libelleSOLO: entree.libelle,
        texte: entree.description,
        raison: null,
        message: null
    };
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Obtient le nombre de productions à analyser pour les patterns
 * depuis la configuration des seuils d'interprétation
 * @returns {number} - Nombre de productions (défaut: 3)
 */
function obtenirNombreProductionsPourPatterns() {
    const seuils = chargerSeuilsInterpretation();
    return seuils.nombreProductionsAnalyse || 3;
}

/**
 * Retourne les IDs des productions évaluables selon la pratique active.
 * PAN/Standards : artefacts de portfolio uniquement (type 'artefact-portfolio')
 * Sommative : toutes les productions sauf le conteneur portfolio
 * @param {Array} productions - Liste des productions
 * @returns {Array<string>} - IDs des productions évaluables
 */
function obtenirIdsProductionsEvaluables(productions) {
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    var estPAN = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) === 'standards';
    if (estPAN) {
        return productions.filter(function(p) { return p.type === 'artefact-portfolio'; }).map(function(p) { return p.id; });
    }
    // Sommative : toutes les productions sauf le conteneur portfolio
    return productions.filter(function(p) { return p.type !== 'portfolio'; }).map(function(p) { return p.id; });
}

/**
 * Obtient l'instance de la pratique actuelle configurée
 * @returns {Object} - Instance de la pratique (PratiquePANStandards ou PratiqueSommative)
 */
function obtenirPratiqueActuelle() {
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    // (On passe le TYPE au registre, comme avant — même classe d'instance.)
    const pratiqueId = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) || (window.PRATIQUE_DEFAUT || 'standards');

    // Obtenir l'instance depuis le registre
    if (typeof obtenirPratiqueParId === 'function') {
        const pratique = obtenirPratiqueParId(pratiqueId);
        // ✅ CORRECTIF (10 déc 2025): Ne retourner que si non-null
        if (pratique) {
            return pratique;
        }
        // Sinon, continuer vers le fallback
    }

    // Fallback : créer une instance directement (id déjà canonique).
    //
    // ⚠⚠ LE DÉFAUT CORRIGÉ ICI : CE REPLI LEVAIT UN `ReferenceError` (#542
    // lot 3, 27 août 2026). Il instanciait `PratiquePANMaitrise`, une classe qui
    // N'EXISTE NULLE PART dans le dépôt — la classe s'appelle
    // `PratiquePANStandards` (`js/pratiques/pratique-pan-standards.js:75`). Le
    // nom fautif ne vivait qu'ici et dans le JSDoc juste au-dessus.
    //
    // ⮕ IL EST ATTEIGNABLE, ce n'est pas du code mort. `obtenirPratiqueParId`
    // rend `null` dans deux cas réels : la pratique configurable a été
    // supprimée, ou sa construction a levé et a été rattrapée par le `catch` de
    // `pratique-registre.js`. Le repli prenait alors la main et faisait tomber
    // TOUT le profil de l'élève.
    //
    // ⮕ REPRODUIT AVANT D'ÊTRE CORRIGÉ, pas déduit de la lecture : un registre
    // stubbé à `null` rend « ReferenceError : PratiquePANMaitrise is not
    // defined ». Trouvé en écrivant le pas 3b — le nom de la classe ne
    // correspondait pas à ce que le test attendait.
    //
    // Verrouillé par `tests/unit/sentinelle-542-repli-pratique-actuelle.test.js`.
    if (pratiqueId === 'sommative') {
        return new PratiqueSommative();
    } else {
        // Standards (et toutes ses variantes normalisées) par défaut.
        return new PratiquePANStandards();
    }
}

/**
 * La grille de référence du dépistage, AVEC la cause quand il n'y en a pas.
 *
 * ⮕ #550 — CE QUI MANQUAIT, ET POURQUOI ÇA COMPTE. L'écran voyait `null` et
 * n'avait aucun moyen de savoir POURQUOI. Il affichait donc « Aucune force ni
 * défi identifié selon la taxonomie SOLO » — une phrase qui se lit comme un
 * verdict rassurant SUR L'ÉLÈVE, alors qu'elle voulait dire « je n'ai aucun
 * critère à quoi comparer ». Symptôme vécu par Grégoire le 27 août 2026 au
 * matin, sur ses données réelles.
 *
 * ⮕ C'est le patron A2/A3 de #542, que le lot 1 a refermé pour les conversions
 * d'échelle et le lot 3 pour les échelles absentes : **nommer la cause, parce
 * qu'une cause nommée se répare et qu'un silence ne se répare pas.** Même forme
 * de retour que `obtenirEchelleCommuneDesEvaluations` et
 * `diagnostiquerConversionNiveaux` — `{ …, raison, message }`.
 *
 * ⚠ TROIS CAUSES DISTINCTES, et elles ne demandent pas le même geste :
 *   · `aucune-grille-designee` — la préférence est vide. Fraîche installation,
 *     ou grille jamais choisie. C'est le cas de Grégoire ce matin-là.
 *   · `grille-introuvable` — la grille désignée a été supprimée. La préférence
 *     est auto-nettoyée ici même (comportement d'origine, préservé).
 *   · `grille-sans-criteres` — la grille existe et est bien désignée, mais elle
 *     est vide. L'écran serait tout aussi muet, pour une raison encore
 *     différente : c'est la grille qu'il faut remplir, pas en choisir une autre.
 *
 * ⚠ L'AUTO-NETTOYAGE FAIT QUE `grille-introuvable` NE S'OBSERVE QU'UNE FOIS :
 * l'appel suivant, dans le même rendu ou le suivant, verra une préférence vide
 * et rendra `aucune-grille-designee`. C'est sans conséquence pratique — les deux
 * messages mènent au même geste, désigner une grille — mais il ne faut pas
 * écrire de test qui suppose l'ordre des appels.
 *
 * Verrouillé par `tests/unit/sentinelle-550-grille-reference-cause-nommee.test.js`.
 *
 * @returns {Object} `{ grille, raison, message }` — `grille` non nulle et `raison`
 *   nulle quand une grille utilisable est désignée.
 */
function diagnostiquerGrilleReferenceDepistage() {
    // Le chemin de réglage est cité tel qu'il s'écrit à l'écran : « Labo →
    // Outils d'observation », section « Grille de critères pour le dépistage »
    // (`index.html`). Un message qui envoie vers un libellé périmé est pire
    // qu'un message absent — il fait chercher.
    const OU = 'Labo → Outils d\'observation → « Grille de critères pour le dépistage »';

    const grilleId = obtenirPreference('grilleReferenceDepistage');

    if (!grilleId) {
        return {
            grille: null,
            raison: 'aucune-grille-designee',
            message: 'Aucune grille de critères n\'est désignée pour le dépistage : il n\'y a '
                + 'rien à quoi comparer les résultats. Choisis-en une dans ' + OU + '.'
        };
    }

    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille) {
        // Auto-nettoyage silencieux : la grille référencée a été supprimée
        // (cas d'une grille utilisateur effacée puis référence non nettoyée).
        // On retire la préférence pour éviter que le message d'erreur ne se
        // répète à chaque rendu de l'aperçu.
        console.warn(`[Depistage] Grille de référence "${grilleId}" introuvable — préférence auto-nettoyée`);
        if (typeof definirPreference === 'function') {
            definirPreference('grilleReferenceDepistage', '');
        }
        return {
            grille: null,
            raison: 'grille-introuvable',
            message: 'La grille désignée pour le dépistage a été supprimée : il n\'y a plus '
                + 'rien à quoi comparer les résultats. Désignes-en une autre dans ' + OU + '.'
        };
    }

    if (!Array.isArray(grille.criteres) || grille.criteres.length === 0) {
        // ⚠ LA GRILLE EST RENDUE QUAND MÊME, et c'est délibéré. Avant #550,
        // `obtenirGrilleReferenceDepistage` rendait une grille vide telle quelle,
        // et ses treize appelants comptent là-dessus — celui qui veut son `nom`
        // le perdrait si on rendait `null` ici. Le contrat de l'adaptateur ne
        // change pas : ce qui s'ajoute, c'est une `raison` que seul l'écran lit.
        // Un correctif d'affichage n'a pas à modifier ce que douze autres sites
        // reçoivent.
        return {
            grille: grille,
            raison: 'grille-sans-criteres',
            message: 'La grille « ' + (grille.nom || grille.id) + ' » est désignée pour le '
                + 'dépistage, mais elle ne contient aucun critère. Ajoute-lui des critères, ou '
                + 'désignes-en une autre dans ' + OU + '.'
        };
    }

    return { grille: grille, raison: null, message: null };
}

/**
 * Obtient la grille de référence configurée pour le dépistage
 * Cette grille définit les critères utilisés pour identifier forces/défis
 *
 * ⮕ #550 — ADAPTATEUR. Tout le travail vit dans
 * `diagnostiquerGrilleReferenceDepistage` ; celle-ci n'en garde que la grille.
 * Le contrat est INCHANGÉ, et c'est délibéré : treize sites l'appellent, et
 * aucun n'avait besoin de changer pour que #550 soit réglé. Un seul chemin de
 * décision, donc un seul endroit où l'auto-nettoyage se produit.
 *
 * @returns {Object|null} - Grille complète avec {id, nom, criteres[], ...} ou null si non configurée
 */
function obtenirGrilleReferenceDepistage() {
    return diagnostiquerGrilleReferenceDepistage().grille;
}

/**
 * Obtient la liste des critères de la grille de référence avec leurs valeurs pour un étudiant
 * Cette fonction remplace le tableau SRPNF codé en dur par une extraction dynamique
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Array} - Tableau de { nom, valeur, cleNormalisee } ou tableau vide si erreur
 */
/**
 * Clé de moyenne d'un nom de critère (#529).
 *
 * ⚠ MÊME normalisation que `calculerMoyennesCriteres`, qui construit ses clés
 * ainsi. Toute divergence entre les deux rend les blocs silencieusement vides :
 * l'affichage cherche des clés que le calcul n'a pas produites, ne trouve
 * rien, et n'a aucun moyen de le signaler. D'où un seul endroit pour la règle.
 */
function cleCritere(nom) {
    return String(nom || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
}

/**
 * Les critères à représenter dans les blocs du profil : ceux de la GRILLE de
 * l'utilisateur, dans son ordre à elle.
 *
 * ⮕ #529 — remplace le tableau littéral
 * `['structure','rigueur','plausibilite','nuance','francais']`, présent en
 * QUATRE exemplaires (deux dans `sections-affichage`, deux dans
 * `diagnostics`). Il décrivait la grille de Grégoire ; pour toute autre
 * grille, les barres restaient vides et les blocs ne montraient rien, sans
 * dire pourquoi.
 *
 * @returns {Array<{nom: string, cle: string}>}
 */
function criteresDeLaGrillePourAffichage() {
    const grille = (typeof obtenirGrilleReferenceDepistage === 'function')
        ? obtenirGrilleReferenceDepistage() : null;
    if (!grille || !Array.isArray(grille.criteres)) return [];
    return grille.criteres
        .filter(c => c && c.nom)
        .map(c => ({ nom: c.nom, cle: cleCritere(c.nom) }));
}

function obtenirCriteresAvecValeurs(da) {
    const grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - impossible d\'obtenir les critères');
        return [];
    }

    const moyennesCriteres = calculerMoyennesCriteres(da);
    if (!moyennesCriteres) {
        console.warn('⚠️ Pas de moyennes calculées pour DA', da);
        return [];
    }

    // Construire le tableau dynamiquement depuis la grille
    return grille.criteres.map(critere => {
        const cleNormalisee = critere.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, '');

        // Standardiser la clé pour correspondre au format de calculerMoyennesCriteres()
        // "francaisecrit" → "francais" pour éviter les 0% incorrects
        let cleStandard = cleNormalisee;
        if (cleNormalisee.startsWith('francais')) {
            cleStandard = 'francais';
        }

        return {
            nom: critere.nom,
            valeur: moyennesCriteres[cleStandard] ?? 0,
            cleNormalisee: cleNormalisee
        };
    });
}

/**
 * Initialise le module de profil étudiant
 * Appelée automatiquement par 99-main.js au chargement
 *
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent
 * 2. Attache les événements si nécessaire
 *
 * NOTE: Ce module est principalement appelé par d'autres modules
 * via afficherProfilComplet(da)
 */
function initialiserModuleProfilEtudiant() {

    // Vérifier que le conteneur existe
    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        return;
    }

}

/* ===============================
   🔧 FONCTIONS HELPERS
   =============================== */

/**
 * Génère un badge compact indiquant la pratique de notation pour le profil
 * DÉPRÉCIÉ: Utiliser genererBadgePratique() global à la place
 * Session C (#303) : paramètre modeComparatif retiré (mode comparatif supprimé).
 * @param {string} pratiqueUtilisee - 'SOM' ou 'PAN' (fourni par calculerTousLesIndices)
 * @returns {string} - HTML du badge
 */
function genererBadgePratiqueProfil(pratiqueUtilisee) {
    return genererBadgePratique(pratiqueUtilisee, true);
}

/**
 * Génère un badge de pattern (Beta 84)
 * @param {string} pattern - Pattern d'apprentissage
 * @returns {string} - HTML du badge
 */
function genererBadgePatternProfil(pattern) {
    let classe = '';

    switch(pattern) {
        case 'Difficulté persistante':
            classe = 'badge-sys badge-pattern-difficulte-persistante';
            break;
        case 'Difficulté émergente':
            classe = 'badge-sys badge-pattern-difficulte-emergente';
            break;
        case 'Défi spécifique':
            classe = 'badge-sys badge-pattern-defi-specifique';
            break;
        case 'Stable':
            classe = 'badge-sys badge-pattern-stable';
            break;
        case 'En progression':
            classe = 'badge-sys badge-pattern-progression';
            break;
        default:
            classe = 'badge-sys';
    }

    return `<span class="${classe}">${pattern}</span>`;
}

// calculerTousLesIndices → déplacé dans indices.js (#206)

/**
 * Interprète l'indice M (Mobilisation) selon la logique pédagogique avancée
 * Implémente la formule Excel avec diagnostic précis des composantes A et C
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @param {boolean} statutDecrochage - Indicateur de décrochage (défaut: false)
 * @returns {Object} - { niveau, emoji, couleur }
 */
function interpreterMobilisation(A, C, statutDecrochage = false) {
    // 1. Décrochage (priorité absolue - interventions impossibles)
    if (statutDecrochage) {
        return {
            niveau: 'Décrochage',
            couleur: '#9e9e9e' // Gris
        };
    }

    // 2. Assiduité ET complétion critiques (A<0.7 ET C<0.7)
    if (A < 0.7 && C < 0.7) {
        return {
            niveau: 'Assiduité ET complétion critiques',
            couleur: '#dc3545' // Rouge
        };
    }

    // 3. Assiduité critique seule (A<0.7)
    if (A < 0.7) {
        return {
            niveau: 'Assiduité critique',
            couleur: '#ff9800' // Orange
        };
    }

    // 4. Complétion critique seule (C<0.7)
    if (C < 0.7) {
        return {
            niveau: 'Complétion critique',
            couleur: '#ff9800' // Orange
        };
    }

    // 5. Mobilisation fragile (A<0.8 ET C<0.8)
    if (A < 0.8 && C < 0.8) {
        return {
            niveau: 'Mobilisation fragile',
            couleur: '#ffc107' // Jaune
        };
    }

    // 6. Assiduité fragile (A<0.8 ET C≥0.8)
    if (A < 0.8 && C >= 0.8) {
        return {
            niveau: 'Assiduité fragile',
            couleur: '#ffc107' // Jaune
        };
    }

    // 7. Complétion fragile (A≥0.8 ET C<0.8)
    if (A >= 0.8 && C < 0.8) {
        return {
            niveau: 'Complétion fragile',
            couleur: '#ffc107' // Jaune
        };
    }

    // 8. Favorable (A≥0.9 ET C≥0.9)
    if (A >= 0.9 && C >= 0.9) {
        return {
            niveau: 'Favorable',
            couleur: '#2196F3' // Bleu
        };
    }

    // 9. Acceptable (sinon: A≥0.8 ET C≥0.8, mais pas tous deux ≥0.9)
    return {
        niveau: 'Acceptable',
        couleur: '#28a745' // Vert
    };
}

// ⚠⚠ #542 lot 3, pas 3c-3 — `interpreterPerformance` A ÉTÉ SUPPRIMÉE, ET ELLE
// N'A PAS ÉTÉ REMPLACÉE : SON RÉSULTAT N'ÉTAIT LU NULLE PART.
//
// Elle portait le plus gros gisement de valeurs en dur du dépistage : QUATRE
// seuils (0,85 / 0,75 / 0,65 / 0,40) ET un TROISIÈME jeu de descriptions SOLO
// reformulées — « Maîtrise étendue des compétences avec transfert à d'autres
// contextes » pour l'abstrait étendu, « Points pertinents identifiés, liens à
// consolider » pour le multistructurel, et ainsi de suite. Elle était exportée
// sur `window`, et ses deux voisines `interpreterCompletion` et
// `interpreterAssiduite` lisent leurs seuils par `obtenirSeuil` : elle seule ne
// consultait rien.
//
// ⮕ CE QUE LA VÉRIFICATION A MONTRÉ. Ses deux appelants
// (`profil-etudiant-sections-affichage.js`) rangeaient le résultat dans une
// variable `interpP`… que rien ne lisait. Grep récursif sur tout le dépôt :
// deux appels, une définition, un export, une ligne de sentinelle d'exports.
// Aucun appel dynamique par nom (`window[...]`) ne la rattrape. Ses quatre
// descriptions ne se sont jamais affichées.
//
// ⮕ La consigne du lot 3 la donnait pour vivante — « elle est exportée sur
// `window` et son résultat s'affiche ». C'est faux, et c'est ce qui change le
// geste : la brancher sur l'échelle de l'utilisateur aurait rendu vivant du
// code mort. Le retrait est complet, avec ses deux appels et son export.
//
// ⮕ CE QUI SUBSISTE DE SON RÔLE : la performance globale est située dans
// l'échelle de la pratique depuis le pas 3c-1, et interprétée par l'étiquette
// SOLO du niveau atteint (`situerPourcentageDansEchelle` +
// `interpreterNiveauAtteint`). C'est le chemin vivant, celui qui s'affiche.
//
// Verrouillé par `tests/unit/sentinelle-542-3c3-depistage-sans-seuils.test.js`.

/**
 * Interprète l'indice C (Complétion)
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, emoji, couleur, description }
 */
function interpreterCompletion(valeur) {
    const c = valeur / 100; // Normaliser en 0-1
    const seuilExcellent = obtenirSeuil('interpretation.excellent');
    const seuilBon = obtenirSeuil('interpretation.bon');
    const seuilAcceptable = obtenirSeuil('interpretation.acceptable');

    if (c >= seuilExcellent) {
        return {
            niveau: 'Taux de complétion excellent',
            couleur: '#2196F3', // Bleu
            description: 'Remise régulière et complète des travaux'
        };
    }
    if (c >= seuilBon) {
        return {
            niveau: 'Bon taux de complétion',
            couleur: '#28a745', // Vert
            description: 'Majorité des travaux remis'
        };
    }
    if (c >= seuilAcceptable) {
        return {
            niveau: 'Complétion acceptable',
            couleur: '#ffc107', // Jaune
            description: 'Quelques travaux manquants, suivi recommandé'
        };
    }
    if (c >= 0.60) {
        return {
            niveau: 'Complétion insuffisante',
            couleur: '#ff9800', // Orange
            description: 'Nombreux travaux manquants, intervention nécessaire'
        };
    }
    return {
        niveau: 'Complétion critique',
        couleur: '#dc3545', // Rouge
        description: 'Travaux non remis, situation critique'
    };
}

/**
 * Interprète l'indice A (Assiduité)
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, emoji, couleur, description }
 */
function interpreterAssiduite(valeur) {
    const a = valeur / 100; // Normaliser en 0-1
    const seuilExcellent = obtenirSeuil('interpretation.excellent');
    const seuilBon = obtenirSeuil('interpretation.bon');
    const seuilAcceptable = obtenirSeuil('interpretation.acceptable');

    if (a >= seuilExcellent) {
        return {
            niveau: 'Assiduité exemplaire',
            couleur: '#2196F3', // Bleu
            description: 'Présence constante et engagement soutenu'
        };
    }
    if (a >= seuilBon) {
        return {
            niveau: 'Bonne assiduité',
            couleur: '#28a745', // Vert
            description: 'Présence régulière avec absences rares et justifiées'
        };
    }
    if (a >= seuilAcceptable) {
        return {
            niveau: 'Assiduité acceptable',
            couleur: '#ffc107', // Jaune
            description: 'Quelques absences, suivi recommandé'
        };
    }
    if (a >= 0.60) {
        return {
            niveau: 'Assiduité insuffisante',
            couleur: '#ff9800', // Orange
            description: 'Absences fréquentes, intervention nécessaire'
        };
    }
    return {
        niveau: 'Assiduité critique',
        couleur: '#dc3545', // Rouge
        description: 'Absences excessives, situation d\'urgence'
    };
}

// Exporter les fonctions vers window (décision étape 1 b — convention systématique
// cross-zones, Écart #4 MODULES-MAP §2.3).
// ⮕ Ce libellé annonçait « les 16 fonctions ». Le compte réel était de 19 au
// 27 août 2026, AVANT l'ajout de #542 : le chiffre s'était périmé en silence à
// coups d'extractions. Il est retiré plutôt que corrigé — un compte figé dans un
// commentaire se re-périme au prochain ajout.
window.obtenirTermeProduction = obtenirTermeProduction;
window.genreTermeProduction = genreTermeProduction;
window.accordTermeProduction = accordTermeProduction;
window.obtenirCouleurNiveauIDME = obtenirCouleurNiveauIDME;
window.obtenirNiveauIDMEDepuisPourcentage = obtenirNiveauIDMEDepuisPourcentage;
window.situerPourcentageDansEchelle = situerPourcentageDansEchelle;
window.interpreterNiveauAtteint = interpreterNiveauAtteint;
window.obtenirNombreProductionsPourPatterns = obtenirNombreProductionsPourPatterns;
window.obtenirIdsProductionsEvaluables = obtenirIdsProductionsEvaluables;
window.obtenirPratiqueActuelle = obtenirPratiqueActuelle;
window.obtenirGrilleReferenceDepistage = obtenirGrilleReferenceDepistage;
// #550 — le diagnostiqueur qui NOMME la cause quand il n'y a pas de grille.
window.diagnostiquerGrilleReferenceDepistage = diagnostiquerGrilleReferenceDepistage;
window.cleCritere = cleCritere;
window.criteresDeLaGrillePourAffichage = criteresDeLaGrillePourAffichage;
window.obtenirCriteresAvecValeurs = obtenirCriteresAvecValeurs;
window.initialiserModuleProfilEtudiant = initialiserModuleProfilEtudiant;
window.genererBadgePratiqueProfil = genererBadgePratiqueProfil;
window.genererBadgePatternProfil = genererBadgePatternProfil;
window.interpreterMobilisation = interpreterMobilisation;
// `window.interpreterPerformance` retiré au pas 3c-3 de #542 — la fonction n'existe plus.
window.interpreterCompletion = interpreterCompletion;
window.interpreterAssiduite = interpreterAssiduite;

})();
