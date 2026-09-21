/* ===============================
   MODULE 15a: PROFIL ÉTUDIANT — HELPERS
   Extrait de profil-etudiant.js (zone L50-636) — refactor 17 mai 2026

   Contenu de ce sous-module :
   - Helpers IDME (couleurs, conversion pourcentage→niveau)
   - Terminologie configurable (artefact/production)
   - Accesseurs (pratique actuelle, grille de référence, critères avec valeurs)
   - Init module (initialiserModuleProfilEtudiant)
   - Badges (pratique, pattern)
   - (Les interprétations des indices A, C et M — `interpreterAssiduite`,
     `interpreterCompletion`, `interpreterMobilisation` — ont déménagé dans
     `contexte-qualification.js` le 10 sept. 2026, #821 lot A ; celle de P a été
     retirée par #542.)

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
        ? obtenirTypePratiqueActive() : null);   // lot N1b : null sans pratique assignée — aucun repli

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
        ? obtenirTypePratiqueActive() : null);   // lot N1b : null sans pratique assignée — aucun repli
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
    const seuilIdmeInsuffisant = obtenirSeuil('idme.insuffisant'); // 0-1 — défaut 0.64
    const seuilIdmeDeveloppement = obtenirSeuil('idme.developpement'); // 0-1 — défaut 0.75
    const seuilIdmeMaitrise = obtenirSeuil('idme.maitrise'); // 0-1 — défaut 0.85

    // Ramener l'entrée sur l'échelle des seuils. PAS de détection du genre
    // « si c'est petit, c'est sans doute déjà 0-1 » : 0.8 serait alors
    // indistinguable de 0,8 % et de 80 %, et la fonction deviendrait un
    // devineur. Un seul contrat, celui que le nom annonce.
    const score = pourcentage / 100;

    if (score < seuilIdmeInsuffisant) return 'I';
    if (score < seuilIdmeDeveloppement) return 'D';
    if (score < seuilIdmeMaitrise) return 'M';
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
 * #871 (17 sept. 2026) — UN NOMBRE DE PÉRIODES, TEL QU'IL S'ÉCRIT À L'ÉCRAN ET DANS LE RAPPORT.
 *
 * Règle de Grégoire (15 sept.) : « le pourcentage doit suivre la fraction » — la fraction montre les
 * présences TELLES QUE SAISIES, demi-période comprise (« 90% (22,5 / 25 périodes) »). Avant, le profil
 * arrondissait les périodes pour les afficher et écrivait « 90% (23 / 25 périodes) », or 23 / 25 = 92 %.
 * Le seul endroit où ce nombre se met en forme : virgule décimale, un entier reste un entier
 * (« 23 », jamais « 23,0 »), et le bruit binaire d'une somme de demi-périodes ou d'heures converties
 * est ramené à deux décimales au plus. Une valeur absente ou non numérique s'écrit « 0 », comme avant.
 *
 * @param {number} n - Nombre de périodes (entier, demi-période, ou conversion d'heures)
 * @returns {string}
 */
function formaterNombrePeriodes(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '0';
    return String(Math.round(v * 100) / 100).replace('.', ',');
}

/**
 * Retourne les IDs des productions évaluables selon la pratique active.
 * PAN/Standards : artefacts de portfolio uniquement (type 'artefact-portfolio')
 * Sommative : toutes les productions sauf le conteneur portfolio
 * @param {Array} productions - Liste des productions
 * @returns {Array<string>} - IDs des productions évaluables
 */
function obtenirIdsProductionsEvaluables(productions) {
    // #790, PORTE 2 — LA FENÊTRE DES PATTERNS. Cette fonction est le point unique
    // que cinq appelants du dépistage partagent, et la fenêtre qu'elle alimente
    // moyenne des NOTES FINALES : une production évaluée sur une seule dimension y
    // entrerait comme si elle mesurait la compétence entière, et ferait basculer en
    // palier 2 ou 3, dès la première semaine, un élève solide ailleurs — sans que
    // l'écran dise nulle part que ce palier repose sur une dimension unique.
    // ⚠ Le filtre est posé EN PREMIER, avant la bifurcation PAN/Sommative : il vaut
    // pour les deux, et une exclusion recopiée dans chaque branche finirait par ne
    // plus valoir que pour l'une.
    var evaluables = (typeof window.ProductionDiagnostique !== 'undefined')
        ? window.ProductionDiagnostique.filtrerProductions(productions)
        : (Array.isArray(productions) ? productions : []);
    // #328 L2-b1 : type dérivé de la SSOT (groupesCours), plus du miroir.
    var estPAN = ((typeof obtenirTypePratiqueActive === 'function')
        ? obtenirTypePratiqueActive() : null) === 'standards';
    if (estPAN) {
        return evaluables.filter(function(p) { return p.type === 'artefact-portfolio'; }).map(function(p) { return p.id; });
    }
    // Sommative : toutes les productions sauf le conteneur portfolio
    return evaluables.filter(function(p) { return p.type !== 'portfolio'; }).map(function(p) { return p.id; });
}

/**
 * Une couleur d'échelle, rendue sûre pour un attribut `style`.
 *
 * ⮕ #575 — EXTRAITE, PAS ÉCRITE. Cette fonction vivait en fermeture locale dans
 * `genererSectionPerformance` (`profil-etudiant-sections-affichage.js`), donc
 * inaccessible aux autres sites qui injectent une couleur d'échelle — dont les
 * badges d'artefacts, qui posaient `niveau.couleur` BRUT dans un `style`
 * (constat §5.5 de l'audit du 27 août 2026). Un seul des deux était protégé.
 *
 * ⚠ `echapperHtml` NE SUFFIT PAS ICI. Elle neutralise l'évasion d'attribut, pas
 * l'injection de CSS : une « couleur » valant `red; background: url(...)` passe
 * l'échappement HTML sans difficulté. On n'accepte donc qu'un code hexadécimal.
 *
 * @param {*} valeur - la couleur telle que l'utilisateur l'a saisie
 * @returns {string} un `#rrggbb`, ou le neutre `#999999`
 */
function couleurCssSure(valeur) {
    const c = String(valeur == null ? '' : valeur).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
    // `#RGB` est une écriture légitime : on la développe plutôt que de la
    // rejeter, sinon un suffixe alpha ajouté ensuite (`${couleur}22`) produirait
    // du CSS invalide.
    if (/^#[0-9a-fA-F]{3}$/.test(c)) return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    return '#999999';
}

/**
 * La couleur d'un CODE de niveau, lue dans l'échelle qui a produit ce code.
 *
 * ⮕ #575 (lot 4 du plan SOLO, rapport §3 n° 4). Les badges d'artefacts
 * choisissaient leur couleur en SITUANT la note dans `echelles.find(e => e.active)
 * || echelles[0]` — l'échelle « active, sinon la première », devinée, alors que
 * chaque évaluation porte la sienne. Et quand il n'y en avait aucune, ils
 * repliaient sur quatre couleurs IDME derrière `note >= 85 / 75 / 65`.
 *
 * Deux défauts en un : la couleur pouvait CONTREDIRE le code affiché juste à
 * côté (situer 82 dans une autre échelle ne redonne pas forcément le niveau que
 * l'évaluation a enregistré), et hors IDME elle ne voulait plus rien dire.
 *
 * ⮕ On ne situe plus rien : le code est DÉJÀ connu, on lit sa couleur dans SON
 * échelle. Sans échelle résolue, sans code, ou sans couleur saisie : le neutre.
 *
 * @param {string} code - le code de niveau enregistré par l'évaluation
 * @param {string} echelleId - l'échelle de cette évaluation
 * @returns {string} un `#rrggbb` sûr, neutre si rien ne se résout
 */
function couleurDuNiveau(code, echelleId) {
    if (code == null || String(code).trim() === '') return '#999999';
    const echelle = (typeof obtenirEchelleResolue === 'function')
        ? obtenirEchelleResolue(echelleId || null)
        : null;
    if (!echelle || !Array.isArray(echelle.niveaux)) return '#999999';
    const cherche = String(code).trim().toUpperCase();
    const niveau = echelle.niveaux.find(function(n) {
        return n && String(n.code == null ? '' : n.code).trim().toUpperCase() === cherche;
    });
    return niveau ? couleurCssSure(niveau.couleur) : '#999999';
}

/**
 * Les niveaux de l'échelle d'un élève et le dégradé qui les peint — ou rien.
 *
 * ⮕ #575 (lot 4 du plan SOLO, rapport §3 n° 5). Ce calcul existait en DEUX
 * exemplaires, à quelques lignes près : `_genererBarresSRPNF`
 * (`profil-etudiant-diagnostics.js`) et `_obtenirNiveauxEtGradientSRPNF`
 * (`profil-etudiant-sections-affichage.js`). Les deux devinaient l'échelle par
 * `echelles.find(e => e.active) || echelles[0]`, et les deux repliaient sur la
 * même table `I 0-64 / D 65-74 / M 75-84 / E 85-100`. L'audit du 27 août n'avait
 * relevé que la première ; la seconde peint le dégradé du bloc « Forces et
 * défis », que ce même audit donne en exemple de code proprement configurable.
 *
 * ⮕ L'ÉCHELLE JUSTE est celle des ÉVALUATIONS de l'élève
 * (`obtenirEchelleCommuneDesEvaluations`, pas 3b de #542) : elle refuse de
 * choisir quand elles divergent, et dit pourquoi. Sans elle, `niveaux` est vide
 * et `gradientCSS` vaut un fond neutre — une barre sans repères reste lisible,
 * une barre aux repères d'un autre ment.
 *
 * Les couleurs sont filtrées ici (`couleurCssSure`) : elles partent dans un
 * attribut `style`, et elles viennent de l'utilisateur.
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} `{ niveaux, gradientCSS, message }` — `niveaux` trié par
 *   borne inférieure croissante, vide si aucune échelle ne se résout.
 */
function niveauxEtGradientDesEvaluations(da) {
    const NEUTRE = 'var(--gris-pale, #e9e9e9)';
    const lecture = (typeof obtenirEchelleCommuneDesEvaluations === 'function')
        ? obtenirEchelleCommuneDesEvaluations(da)
        : { echelle: null, raison: 'helper-absent', message: '' };

    const brut = (lecture.echelle && Array.isArray(lecture.echelle.niveaux))
        ? lecture.echelle.niveaux : [];

    // Une borne non numérique rend le niveau impeignable : `Number('')` vaut 0,
    // et un niveau mal saisi capturerait tout le bas du dégradé.
    const niveaux = brut
        .filter(function(n) {
            return n && Number.isFinite(Number(n.min)) && Number.isFinite(Number(n.max));
        })
        .map(function(n) {
            return {
                code: n.code, nom: n.nom,
                min: Number(n.min), max: Number(n.max),
                couleur: couleurCssSure(n.couleur)
            };
        })
        .sort(function(a, b) { return a.min - b.min; });

    if (niveaux.length === 0) {
        return { niveaux: [], gradientCSS: NEUTRE, message: lecture.message || '' };
    }

    // ⚠ L'ORDRE DU TABLEAU `niveaux` DE L'UTILISATEUR N'EST PAS UN ORDRE DE
    // MÉRITE — rien ne l'oblige à saisir ses niveaux dans l'ordre. Le tri par
    // `min` ci-dessus est ce qui rend les 2 % de marge ci-dessous cohérents.
    const stops = [];
    niveaux.forEach(function(niveau, i) {
        const dernier = (i === niveaux.length - 1);
        const debut = (i === 0) ? niveau.min : niveau.min + 2;
        const fin = dernier ? niveau.max : niveaux[i + 1].min - 2;
        stops.push(niveau.couleur + ' ' + debut + '%');
        stops.push(niveau.couleur + ' ' + fin + '%');
    });

    return {
        niveaux: niveaux,
        gradientCSS: 'linear-gradient(to right, ' + stops.join(', ') + ')',
        message: ''
    };
}

/**
 * LE niveau dans lequel se lit la note globale d'un élève — ou la raison pour
 * laquelle il n'y en a pas.
 *
 * ⮕ #575 (lot 4 du plan SOLO) — EXTRAIT, PAS ÉCRIT. Ce raisonnement vivait déjà,
 * au complet, dans `genererSectionPerformance` (pas 3c-1 de #542, 27 août) ; le
 * bloc « Développement des habiletés » du MÊME écran, lui, affichait une lettre
 * IDME par un ternaire en dur (`P >= 85 ? 'E' : …`). Deux réponses différentes à
 * la même question, sur la même page, pour le même élève. L'extraction met la
 * règle à UN endroit plutôt que d'en recopier une seconde version — c'est le
 * patron que #529 a passé une session à défaire.
 *
 * ⮕ LA RÈGLE, TELLE QUE GRÉGOIRE L'A TRANCHÉE LE 27 AOÛT 2026 : « c'est la
 * pratique de notation qui établit la note globale de l'élève ». C'est donc elle
 * qui dit dans quoi cette note se lit. Une sommative répond « aucune échelle » —
 * et c'est la bonne réponse, pas un manque : un pourcentage pondéré n'a jamais
 * prétendu être un niveau atteint.
 *
 * Aucun repli : sans échelle, `niveau` vaut `null` et l'appelant n'affiche pas de
 * code. Jamais une lettre inventée.
 *
 * @param {string} da - Numéro de DA
 * @param {number} pourcentage - la note globale, 0-100
 * @returns {Object} `{ niveau, survol, raison }` — `niveau` est l'objet niveau de
 *   l'échelle (avec son `code`), ou `null` ; `survol` est le texte d'infobulle
 *   (explication SOLO quand il y en a une, sinon la cause) ; `raison` est nulle
 *   quand la lecture a abouti.
 */
function lireNiveauNoteGlobale(da, pourcentage) {
    const pratique = (typeof obtenirPratiqueActuelle === 'function')
        ? obtenirPratiqueActuelle() : null;
    const lecture = (pratique && typeof pratique.obtenirEchelleNoteGlobale === 'function')
        ? pratique.obtenirEchelleNoteGlobale(da)
        : { echelle: null, raison: 'pratique-sans-methode', message: '' };

    const niveau = lecture.echelle
        ? situerPourcentageDansEchelle(pourcentage, lecture.echelle)
        : null;

    if (!niveau) {
        return { niveau: null, survol: lecture.message || '', raison: lecture.raison || 'hors-echelle' };
    }

    // Le niveau atteint est ce qu'on LIT ; SOLO est ce qui l'explique, et il
    // reste au SURVOL — décision de Grégoire sur le comparateur, même esprit
    // ici : ne pas mettre une taxonomie en vedette devant un enseignant qui ne
    // l'emploie pas.
    const solo = (typeof interpreterNiveauAtteint === 'function')
        ? interpreterNiveauAtteint(niveau)
        : { interpretee: false, texte: '', message: '' };
    const survol = solo.interpretee
        ? solo.libelleSOLO + ' — ' + solo.texte
        : (solo.texte || '') + (solo.message ? ' · ' + solo.message : '');

    return { niveau: niveau, survol: survol, raison: null };
}

/**
 * L'instance de la pratique active du groupe-cours, ou null.
 *
 * Lot N1a (#719, #710 — 21 sept. 2026) : LA résolution du registre (`resoudrePratiqueActive`),
 * par l'ID de la pratique assignée. Avant, le TYPE de la pratique passait au registre :
 * « denotation » n'y est pas, une PratiquePANStandards était fabriquée, et le jugement 78
 * d'une dénotation se lisait « M » par une règle qu'aucune pratique de l'enseignant ne donne.
 * Sans pratique assignée, PRATIQUE_DEFAUT (« standards ») tenait lieu de pratique.
 *
 * ⮕ Aucun repli : rien d'assigné, ou un id qui ne mène à rien, rend null. Les appelants
 * (`lireNiveauNoteGlobale`, snapshots.js) savent lire null — « pas de code », « pas de P ».
 * Le repli `new PratiquePANStandards()` de #542 (lot 3) disparaît avec sa raison d'être.
 *
 * ⚠ CE QUI NE BOUGE PAS, ET POURQUOI. Pour une Standards, une sommative ou des spécifications,
 * ce qui est rendu reste l'instance du registre de LA FAMILLE de la pratique assignée, comme
 * avant ce lot. Elle porte deux règles que PratiqueConfigurable n'a pas : le P historique des
 * snapshots (`calculerPerformanceHistorique`), et la lecture du niveau de la note globale dans
 * l'échelle COMMUNE AUX ÉVALUATIONS de l'élève (#575, décision de Grégoire) — la configurable,
 * elle, lirait l'échelle rangée dans la pratique : mesuré, le « M » d'une échelle remplacée
 * (#648) disparaissait. Laquelle des deux échelles fait foi est une question de didactique ;
 * réunir les deux instances est l'objet du lot N2 (#716). Seule la dénotation change ici : la
 * famille n'a pas d'instance au registre, c'est la pratique assignée qui répond (#719).
 *
 * @returns {Object|null}
 */
function obtenirPratiqueActuelle() {
    const designation = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive() : null;
    if (!designation || designation.etat !== 'ok') return null;
    const duRegistre = (['standards', 'sommative', 'specifications'].includes(designation.famille) && typeof obtenirPratiqueParId === 'function')
        ? obtenirPratiqueParId(designation.famille) : null;
    return duRegistre || resoudrePratiqueActive().pratique;
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
 *   · `grille-introuvable` — la grille désignée n'est pas parmi celles du
 *     trimestre, ALORS QUE LA LISTE EN CONTIENT : elle a bien été supprimée.
 *   · `grilles-indisponibles` (#806) — la liste entière est vide. Ce n'est pas
 *     une suppression : c'est une base pas encore hydratée, ou un trimestre sans
 *     grilles. La préférence est CONSERVÉE, et le message le dit.
 *   · `grille-sans-criteres` — la grille existe et est bien désignée, mais elle
 *     est vide. L'écran serait tout aussi muet, pour une raison encore
 *     différente : c'est la grille qu'il faut remplir, pas en choisir une autre.
 *
 * ⛔ #806 (9 sept. 2026) — CETTE FONCTION N'ÉCRIT PLUS RIEN. Elle effaçait la
 * préférence quand la grille ne se résolvait pas (« auto-nettoyage »), ce qui
 * faisait perdre son choix à Grégoire à chaque course d'hydratation d'IndexedDB.
 * Un chemin d'affichage constate ; il ne détruit pas un réglage. Le corollaire
 * pour les tests : `grille-introuvable` s'observe autant de fois qu'on l'appelle,
 * et la préférence vaut toujours ce que l'utilisateur y a mis.
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

    // DÉMO (#749 lot 1, 11 sept. 2026). La préférence est GLOBALE
    // (`preferencesUtilisateur`, docs/DATA-OWNERSHIP.md) : elle porte l'id d'une
    // grille du trimestre RÉEL de l'enseignant, qui n'existe pas dans
    // `demo_grillesTemplates`. Résultat mesuré à l'audit du 6 : 520 avertissements
    // « Pas de grille de référence » à l'ouverture du Suivi, « Défi spécifique »
    // à 0 en démo — ce que vingt collègues verraient le 14. Poser la préférence
    // à l'activation de la démo aurait ÉCRASÉ le choix réel de l'enseignant (la
    // classe de défaut de #806) : la démo se résout donc À LA LECTURE, sans rien
    // écrire — la grille désignée si elle est dans le pack, sinon la première
    // grille du pack qui a des critères. Hors démo, rien ne change.
    if (typeof estEnModeDemo === 'function' && estEnModeDemo()) {
        const grillesDemo = db.getSync(cle('grillesTemplates'), []) || [];
        const designee = grilleId ? grillesDemo.find(g => g && g.id === grilleId) : null;
        const grilleDemo = designee || grillesDemo.find(g => g && g.isDemo
            && Array.isArray(g.criteres) && g.criteres.length > 0);
        if (grilleDemo && Array.isArray(grilleDemo.criteres) && grilleDemo.criteres.length > 0) {
            return { grille: grilleDemo, raison: null, message: null };
        }
    }

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
        // ⛔⛔ #806 — CETTE FONCTION N'ÉCRIT PLUS. Elle écrivait, et c'est ce qui
        // faisait « disparaître » le réglage de Grégoire (rapporté le 9 sept. 2026 :
        // « il faut régulièrement que je l'enregistre à nouveau »).
        //
        // Ce qui vivait ici :
        //     definirPreference('grilleReferenceDepistage', '');
        // sous le nom rassurant d'« auto-nettoyage silencieux ». Il partait d'une
        // prémisse fausse : « la grille est absente de la liste DONC elle a été
        // supprimée ». `db.getSync(cle('grillesTemplates'), [])` rend `[]` aussi
        // quand IndexedDB n'est pas encore hydratée — et le localStorage de
        // Grégoire est saturé (5 119 Ko au rapport), donc ses grilles vivent en
        // IDB. UN SEUL RENDU DE PROFIL PARTI TROP TÔT SUFFISAIT À EFFACER SON
        // CHOIX, définitivement, sans qu'il voie rien.
        //
        // ⮕ LA RÈGLE, ET ELLE NE VAUT PAS QUE POUR CE FICHIER : un chemin
        // d'AFFICHAGE ne détruit pas un réglage de l'utilisateur. Il constate, il
        // nomme, il laisse la donnée intacte. Réparer d'office est exclu (CLAUDE.md,
        // « tarir n'est pas réparer ») : on tarit la source, le stock déjà effacé
        // se re-désigne à la main, une fois.
        //
        // ⚠ DEUX CAUSES SOUS UN MÊME SILENCE, et elles ne se disent pas pareil.
        // Affirmer « supprimée » quand la liste entière est vide, c'est mentir à
        // l'utilisateur sur ce qui s'est passé — et l'envoyer réparer ce qui n'est
        // pas cassé.
        const listeVide = !Array.isArray(grilles) || grilles.length === 0;
        if (listeVide) {
            console.warn(`[Depistage] Aucune grille chargée pour le trimestre — la référence "${grilleId}" est CONSERVÉE`);
            return {
                grille: null,
                raison: 'grilles-indisponibles',
                message: 'Aucune grille n\'est chargée pour ce trimestre : le dépistage n\'a '
                    + 'rien à quoi comparer les résultats pour l\'instant. Ton choix de grille est '
                    + 'conservé. Si l\'écran reste vide après un rechargement, revérifie ' + OU + '.'
            };
        }

        console.warn(`[Depistage] Grille de référence "${grilleId}" absente des ${grilles.length} grilles du trimestre`);
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
 * #740 (lot B du cadrage du 16 sept. 2026, tranché par Grégoire) — CE QUE LE
 * DÉPISTAGE LIT D'UNE GRILLE : ses critères, SAUF ceux réglés « Aucun » au menu
 * « Niveau SOLO ». Un tel critère compte dans la note du cours comme les autres
 * (la note ne passe pas par ici), mais aucun lecteur du dépistage ne le voit :
 * ni les barres et moyennes par critère, ni l'IPB, ni le défi principal de la
 * carte RàI, ni le défi spécifique, ni les cibles proposées par une intervention.
 * C'est la phrase de l'Aide : « le dépistage des fondations ne le surveille pas ».
 *
 * ⚠ UN SEUL ENDROIT. Avant, `calculerIPB` filtrait seul (sur « multistructurel »),
 * et les quatre autres lecteurs prenaient un critère « Aucun » noté I pour un
 * défi (constat C-6 de l'audit du 5 sept.). Tout lecteur du dépistage passe par
 * `criteresSurveillesParDepistage` (la liste) ou `trouverCritereDepistage`
 * (l'appariement d'un critère d'évaluation, dans `profil-etudiant-calculs.js`),
 * qui reposent tous deux sur ce prédicat. Pas de garde par site.
 *
 * Le défaut ne bouge pas : sans étiquette, un critère est multistructurel
 * (#542), donc surveillé. Seul « aucun » sort.
 *
 * @param {Object|null} critere - un critère de la grille de référence
 * @returns {boolean}
 */
function estCritereSurveilleParDepistage(critere) {
    return !!critere && critere.niveauSOLO !== 'aucun';
}

/**
 * Les critères de la grille que le dépistage lit (voir `estCritereSurveilleParDepistage`).
 * @param {Object|null} grille - la grille de référence du dépistage
 * @returns {Array} - sous-ensemble de `grille.criteres`, dans l'ordre de la grille
 */
function criteresSurveillesParDepistage(grille) {
    if (!grille || !Array.isArray(grille.criteres)) return [];
    return grille.criteres.filter(estCritereSurveilleParDepistage);
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
    // #740 — pas de barre pour un critère « Aucun » : le dépistage ne le lit pas.
    return criteresSurveillesParDepistage(grille)
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

    // Construire le tableau dynamiquement depuis la grille — sans les critères
    // « Aucun » (#740) : `moyennesCriteres` ne porte pas leur clé, et `?? 0`
    // en ferait une valeur de 0 %.
    return criteresSurveillesParDepistage(grille).map(critere => {
        // #553 — la même clé que `calculerMoyennesCriteres` : le nom normalisé entier,
        // sans rabotage de « francais… » (deux critères de français gardent chacun leur valeur).
        const cleNormalisee = cleCritere(critere.nom);

        return {
            nom: critere.nom,
            valeur: moyennesCriteres[cleNormalisee] ?? 0,
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

// #821 lot A (10 sept. 2026) — `interpreterMobilisation` (neuf branches par
// conjonction sur A et C, bornes 70 / 80 / 90) vit dans
// `contexte-qualification.js`, LE SEUL endroit où les règles qui qualifient un
// contexte sont écrites côte à côte. Déplacée telle quelle, sans alias ici.

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

// #821 lot A (10 sept. 2026) — `interpreterCompletion` et `interpreterAssiduite`
// (un seuil sur un scalaire, réglable par `obtenirSeuil('interpretation.*')`,
// plus une borne fixe à 60 %) vivent dans `contexte-qualification.js`.

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
window.formaterNombrePeriodes = formaterNombrePeriodes;   // #871 — le seul formatage d'un nombre de périodes
window.obtenirPratiqueActuelle = obtenirPratiqueActuelle;
window.obtenirGrilleReferenceDepistage = obtenirGrilleReferenceDepistage;
// #740 — le seul filtre SOLO « Aucun » du dépistage.
window.estCritereSurveilleParDepistage = estCritereSurveilleParDepistage;
window.criteresSurveillesParDepistage = criteresSurveillesParDepistage;
// #550 — le diagnostiqueur qui NOMME la cause quand il n'y a pas de grille.
window.diagnostiquerGrilleReferenceDepistage = diagnostiquerGrilleReferenceDepistage;
window.cleCritere = cleCritere;
window.criteresDeLaGrillePourAffichage = criteresDeLaGrillePourAffichage;
window.obtenirCriteresAvecValeurs = obtenirCriteresAvecValeurs;
window.initialiserModuleProfilEtudiant = initialiserModuleProfilEtudiant;
window.genererBadgePratiqueProfil = genererBadgePratiqueProfil;
window.genererBadgePatternProfil = genererBadgePatternProfil;
// `window.interpreterPerformance` retiré au pas 3c-3 de #542 — la fonction n'existe plus.
window.niveauxEtGradientDesEvaluations = niveauxEtGradientDesEvaluations;  // #575 — UN dégradé, pour les deux blocs
window.couleurCssSure = couleurCssSure;                    // #575 — la couleur utilisateur, filtrée, pour TOUS les sites
window.couleurDuNiveau = couleurDuNiveau;                  // #575 — la couleur d'un code, dans SON échelle
window.lireNiveauNoteGlobale = lireNiveauNoteGlobale;      // #575 — LA règle, pour les deux blocs du profil

})();
