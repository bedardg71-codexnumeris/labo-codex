/* ===============================
   MODULE : QUALIFICATION DES SIGNAUX DU SUIVI
   Créé le 10 septembre 2026 (#821, lot A) — sur l'arbitrage de Grégoire :
   « L'application nomme un contexte et on ne sait pas comment elle fait pour
   le qualifier ainsi. […] Il faut unifier les définitions. »

   ⮕ DÉCISION DE GRÉGOIRE DU 30 OCTOBRE 2026 : UNE SEULE SOURCE PAR FAMILLE DE SEUILS.
   Couleur, pastille, filtre, badge, libellé, encadré, zone de bande : chaque signal
   du Suivi lit ici, et ici seulement. Aucune valeur n'est écrite dans ce module.

   | Famille                | Source                                                  |
   |------------------------|---------------------------------------------------------|
   | Assiduité, complétion  | `obtenirSeuil('interpretation.*')` : les trois champs   |
   |                        | de Labo › Outils d'observation                          |
   | Performance (P)        | les repères de l'échelle de l'enseignant                |
   |                        | (`seuilSuffisance`, `seuilMaitrise`), lus par           |
   |                        | `reperesPerformance`                                    |
   | Note de passage        | `NOTE_DE_PASSAGE` (`interpretation-config.js`)          |

   ⮕ LES MOTS (15 oct. 2026, décision de Grégoire, groupe 4 question 3) : des mots qui
   DÉCRIVENT ce qu'on observe (la présence, la remise), pas des mots qui jugent l'élève.
   Quatre paliers depuis le 30 oct. : la borne fixe à 60 % a disparu avec son cinquième mot.
   « Décrochage », statut posé par l'enseignant, reste.

   ⚠ CE QUI NE SE FUSIONNE PAS : le contexte du profil et la carte Mobilisation lisent les
   mêmes bornes, mais par CONJONCTION sur A et C (ce que les deux atteignent ensemble) ; les
   mots et les couleurs de la liste qualifient UN indice. Une seule source, plusieurs règles.

   Verrouillé par `tests/unit/sentinelle-821a-quatre-regles-un-seul-endroit.test.js` et
   `tests/unit/sentinelle-seuils-une-source-2026-10-30.test.js`.

   Chargé après `interpretation-config.js`. Les résolveurs d'échelle vivent dans
   `profil-etudiant-calculs.js`, chargé plus tard : ils sont lus à l'appel.
   =============================== */

(function() {
'use strict';

/* ===============================
   ASSIDUITÉ ET COMPLÉTION — les trois champs de Labo › Outils d'observation
   =============================== */

/** Les trois seuils réglables, lus à l'appel — jamais mis en cache ici. */
function seuilsInterpretation() {
    return {
        excellent: obtenirSeuil('interpretation.excellent'),
        bon: obtenirSeuil('interpretation.bon'),
        acceptable: obtenirSeuil('interpretation.acceptable')
    };
}

// Les quatre paliers, du plus régulier au moins régulier. ⚠ Le mot du dernier palier est
// à la validation de Grégoire (« le libellé le plus fort sous 85 % », consigne du 30 oct.) :
// c'est le plus fort qui existait déjà, aucun mot n'a été inventé.
const MOTS_PRESENCE = ['Aucune absence ou presque', 'Absences rares', 'Quelques absences',
    'Absences très fréquentes'];
const MOTS_REMISE = ['Aucun travail manquant ou presque', 'Travaux manquants rares',
    'Quelques travaux manquants', 'Travaux manquants très fréquents'];
const COULEURS_PALIERS = ['#2196F3', '#28a745', '#ffc107', '#dc3545']; // bleu, vert, jaune, rouge
const ZONES_PALIERS = ['audela', 'acquis', 'signale', 'bas'];

/**
 * Le palier (0 = le plus régulier, 3 = le moins régulier) d'une proportion 0-1, selon les
 * trois seuils réglés. Une valeur illisible (NaN) tombe au dernier palier, comme avant.
 */
function palierInterpretation(p) {
    const seuils = seuilsInterpretation();
    if (p >= seuils.excellent) return 0;
    if (p >= seuils.bon) return 1;
    if (p >= seuils.acceptable) return 2;
    return 3;
}

/**
 * Interprète l'indice A (Assiduité).
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, couleur }
 */
function interpreterAssiduite(valeur) {
    const i = palierInterpretation(valeur / 100);
    return { niveau: MOTS_PRESENCE[i], couleur: COULEURS_PALIERS[i] };
}

/**
 * Interprète l'indice C (Complétion).
 * @param {number} valeur - Valeur en pourcentage (0-100)
 * @returns {Object} - { niveau, couleur }
 */
function interpreterCompletion(valeur) {
    const i = palierInterpretation(valeur / 100);
    return { niveau: MOTS_REMISE[i], couleur: COULEURS_PALIERS[i] };
}

/**
 * La phrase qui dit un contexte par ses deux observations : « Absences rares,
 * quelques travaux manquants ». C'est le seul mot du contexte et de la Mobilisation.
 * Les proportions sont lues telles quelles (pas de passage par ×100 / ÷100,
 * qui déplace 0,57 sous 0,57).
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @returns {string}
 */
function decrireContexte(A, C) {
    const remise = MOTS_REMISE[palierInterpretation(C)];
    return MOTS_PRESENCE[palierInterpretation(A)] + ', ' + remise.charAt(0).toLowerCase() + remise.slice(1);
}

/** La zone de A ou de C : le vocabulaire commun aux pastilles, à la liste et aux bandes. */
function zoneAssiduiteCompletion(pourcentage) {
    return ZONES_PALIERS[palierInterpretation(pourcentage / 100)];
}

/** La borne du palier le plus bas, en pourcentage entier : le filtre « A ou C < … » et son libellé. */
function borneBasseAssiduiteCompletion() {
    return Math.round(seuilsInterpretation().acceptable * 100);
}

/** L'encadré « Mobilisation » de la carte RàI : A ou C porte une couleur dès qu'il passe sous « Absences rares ». */
function sousLePalierRares(pourcentage) {
    return pourcentage / 100 < seuilsInterpretation().bon;
}

/**
 * Les bornes de la carte Mobilisation du profil, lues aux trois champs. Le mot `critique` nomme le
 * palier le plus bas ; `fragile`, tout ce qui est sous « Absences rares » ; `favorable`, le palier du haut.
 */
function bornesMobilisation() {
    const s = seuilsInterpretation();
    return { critique: s.acceptable, fragile: s.bon, favorable: s.excellent };
}

/* ===============================
   PERFORMANCE — les repères de l'échelle de l'enseignant
   =============================== */

const SANS_ECHELLE = { echelle: null };

function _niveauxSansZero(echelle) {
    return ((echelle && echelle.niveaux) || []).filter((n) => n && n.code !== '0' && n.code !== 0);
}

/** Deux échelles aux mêmes plages disent la même chose, même sous deux identifiants (A2025, H2026). */
function _signatureDesPlages(echelle) {
    return _niveauxSansZero(echelle)
        .map((n) => String(n.code).trim().toUpperCase() + ':' + Number(n.min) + ':' + Number(n.max))
        .sort()
        .join('|');
}

/**
 * L'échelle dans laquelle se lit la performance du groupe : celle des copies qui comptent, pas celle
 * rangée dans la bibliothèque du trimestre (une bibliothèque peut en contenir plusieurs, sans qu'aucune
 * ne serve). DÉCISION DE GRÉGOIRE (30 oct. 2026, 11 h 33) : dans TOUTES les pratiques, quand cette échelle
 * en porte. La règle du 27 août (`lireEchelleNoteGlobale`) tient pour l'expression de la note du cours ; elle
 * ne régit plus les signaux. Plusieurs échelles aux plages différentes : aucune n'est choisie, parce que
 * « choisir la bonne reviendrait à en écarter une autre sans le dire » ; la note de passage reste.
 * @returns {{echelle: (Object|null), raison: (string|null)}}
 */
function _echelleDeLaPerformance() {
    const designation = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive() : null;
    if (!designation || designation.etat !== 'ok') return { echelle: null, raison: 'sans-pratique' };
    // Une copie en points n'a pas d'échelle, et rien ne change pour elle. Sans cette garde, `obtenirEchelleResolue(null)`
    // lui prêterait la seule échelle de la bibliothèque. Standards et dénotation gardent leur lecture de toujours.
    const sansEchelleSiNonDesignee = designation.famille === 'sommative' || designation.famille === 'specifications';

    const toutes = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];
    const diag = window.ProductionDiagnostique;
    const copies = (diag ? diag.filtrerEvaluations(toutes, productions) : toutes)
        .filter((e) => e && window.evaluationEntreDansLaNote(e));

    const parSignature = new Map();
    new Set(copies.map((e) => e.echelleId || '')).forEach((id) => {
        if (!id && sansEchelleSiNonDesignee) return;
        const echelle = window.obtenirEchelleResolue(id || null);
        if (!echelle) return;
        const signature = _signatureDesPlages(echelle);
        const connues = parSignature.get(signature) || [];
        connues.push(echelle);
        parSignature.set(signature, connues);
    });

    if (parSignature.size === 0) return { echelle: null, raison: 'aucune-copie' };
    if (parSignature.size > 1) return { echelle: null, raison: 'echelles-divergentes' };

    // Mêmes plages : les repères de celle qui en porte. Deux repères contradictoires ne se tranchent pas.
    const memes = [...parSignature.values()][0];
    const reperes = (champ) => [...new Set(memes.map((e) => e[champ]).filter(Boolean))];
    if (reperes('seuilSuffisance').length > 1 || reperes('seuilMaitrise').length > 1) {
        return { echelle: null, raison: 'echelles-divergentes' };
    }
    return {
        echelle: Object.assign({}, memes[0], {
            seuilSuffisance: reperes('seuilSuffisance')[0],
            seuilMaitrise: reperes('seuilMaitrise')[0]
        }),
        raison: null
    };
}

/**
 * Les repères de la performance, en pourcentages (0-100), tels que l'enseignant les a posés.
 * ⚠ Un repère absent reste absent : rien n'est deviné, ni par les lettres, ni par la position dans la
 * liste, ni par un pourcentage (même règle que `zoneDuNiveau`, #555). Sans aucun repère, seule la note
 * de passage signale. À lire UNE fois par rendu, et à passer aux lecteurs d'une boucle.
 * @returns {{echelle: (Object|null), raison: (string|null), suffisance: (number|null),
 *            maitrise: (number|null), audela: (number|null), passage: number}}
 */
function reperesPerformance() {
    const lecture = (typeof window.obtenirEchelleResolue === 'function') ? _echelleDeLaPerformance() : SANS_ECHELLE;
    const passage = Math.round(window.NOTE_DE_PASSAGE * 100);
    const echelle = lecture.echelle;
    const minDuCode = (code) => {
        if (!echelle || !code) return null;
        const cible = String(code).trim().toUpperCase();
        const niveau = _niveauxSansZero(echelle).find((n) => String(n.code).trim().toUpperCase() === cible);
        return (niveau && !isNaN(Number(niveau.min))) ? Number(niveau.min) : null;
    };
    const suffisance = minDuCode(echelle && echelle.seuilSuffisance);
    const maitrise = minDuCode(echelle && echelle.seuilMaitrise);
    // Le niveau au-dessus de la maîtrise, s'il y en a un : la seule marque du haut que porte une échelle.
    const audessus = (maitrise === null) ? [] : _niveauxSansZero(echelle).map((n) => Number(n.min)).filter((m) => m > maitrise);
    return {
        echelle: echelle || null,
        raison: lecture.raison || null,
        suffisance,
        maitrise,
        audela: audessus.length ? Math.min.apply(null, audessus) : null,
        passage
    };
}

/**
 * La zone d'une performance. `'neutre'` : l'échelle ne dit rien ici (au-dessus de la note de passage,
 * sans repère), et l'écran ne colore donc pas.
 * @param {number} pourcentage - 0-100
 * @param {Object} [reperes] - `reperesPerformance()`, déjà lus par l'appelant d'une boucle
 * @returns {'bas'|'signale'|'acquis'|'audela'|'neutre'}
 */
function zonePerformance(pourcentage, reperes) {
    const r = reperes || reperesPerformance();
    if (r.suffisance === null && r.maitrise === null) return pourcentage < r.passage ? 'bas' : 'neutre';
    if (r.maitrise !== null && pourcentage >= r.maitrise) {
        return (r.audela !== null && pourcentage >= r.audela) ? 'audela' : 'acquis';
    }
    if (r.suffisance !== null && pourcentage >= r.suffisance) return 'signale';
    return 'bas';
}

/** La borne du filtre « P < … » et de son libellé : là où commence la zone basse. */
function borneBassePerformance(reperes) {
    const r = reperes || reperesPerformance();
    if (r.suffisance !== null) return r.suffisance;
    if (r.maitrise !== null) return r.maitrise;
    return r.passage;
}

/**
 * Les deux bornes du dépistage, en proportions 0-1 : `bas` (sous le repère de suffisance, ou sous la
 * note de passage quand il n'est pas posé) et `maitrise` (null quand il n'est pas posé : le test
 * « sous la maîtrise » n'existe alors pas, puisque l'échelle ne dit pas où elle commence).
 */
function bornesDepistage(reperes) {
    const r = reperes || reperesPerformance();
    return {
        bas: (r.suffisance !== null ? r.suffisance : r.passage) / 100,
        maitrise: r.maitrise !== null ? r.maitrise / 100 : null
    };
}

/* ===============================
   CE QUE L'ÉCRAN FAIT D'UNE ZONE — pastilles, liste, bandes
   =============================== */

const CLASSE_PASTILLE = { bas: ' prioritaire-indice-critique', signale: ' prioritaire-indice-attention' };
const COULEUR_LISTE = { audela: '#0284c7', acquis: 'var(--vert-succes)', signale: '#ca8a04', bas: '#dc2626', neutre: 'inherit' };
const COULEUR_BANDE = { audela: '#2196F3', acquis: '#28a745', signale: '#ffc107', bas: '#dc3545', neutre: '#8aa4b0' };

function classePastilleDeLaZone(zone) {
    return CLASSE_PASTILLE[zone] || '';
}

/**
 * La couleur de A ou de C dans la liste des étudiant·es.
 * @param {number} pourcentage - Valeur en pourcentage (0-100)
 * @returns {string} - Couleur CSS
 */
function obtenirCouleurSelonSeuils(pourcentage) {
    return COULEUR_LISTE[zoneAssiduiteCompletion(pourcentage)];
}

/** La couleur de P dans la liste des étudiant·es. */
function obtenirCouleurPerformanceSelonEchelle(pourcentage, reperes) {
    return COULEUR_LISTE[zonePerformance(pourcentage, reperes)];
}

/**
 * Les zones de couleur d'une barre A, C ou P de l'Aperçu, en scores 0-1, de bas en haut et sans trou.
 * Mêmes bornes que les pastilles : un·e élève signalé·e dans une pastille ne paraît pas dans le bleu.
 * @param {'A'|'C'|'P'} indice
 * @param {Object} [reperes] - `reperesPerformance()`, pour P
 * @returns {Array<{de: number, a: number, zone: string, couleur: string}>}
 */
function zonesDeLaBarre(indice, reperes) {
    let coupes;
    if (indice === 'P') {
        const r = reperes || reperesPerformance();
        if (r.suffisance === null && r.maitrise === null) {
            coupes = [[r.passage / 100, 'neutre']];
        } else {
            coupes = [];
            if (r.suffisance !== null) coupes.push([r.suffisance / 100, 'signale']);
            if (r.maitrise !== null) coupes.push([r.maitrise / 100, 'acquis']);
            if (r.audela !== null) coupes.push([r.audela / 100, 'audela']);
        }
    } else {
        const s = seuilsInterpretation();
        coupes = [[s.acceptable, 'signale'], [s.bon, 'acquis'], [s.excellent, 'audela']];
    }
    const zones = [];
    let de = 0;
    let zone = 'bas';
    coupes.forEach(([borne, zoneSuivante]) => {
        zones.push({ de, a: borne, zone, couleur: COULEUR_BANDE[zone] });
        de = borne;
        zone = zoneSuivante;
    });
    zones.push({ de, a: 1, zone, couleur: COULEUR_BANDE[zone] });
    return zones;
}

/* ===============================
   LE CONTEXTE D'APPRENTISSAGE DU PROFIL — conjonction sur A et C
   =============================== */

/**
 * Qualifie le contexte d'apprentissage à partir de A et C seuls (sans P). Chaque palier demande que
 * A ET C atteignent la borne ; le dernier est un OU : « fragile » dès qu'UN des deux passe sous le
 * palier le plus bas. La lecture des indices et le cas « En attente » restent chez l'appelant
 * (`determinerAlerteContextuelle`, `profil-etudiant-calculs.js`).
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @returns {Object} - { niveau, label, badgeClasse, A, C, recommandation }
 */
function qualifierContexteApprentissage(A, C) {
    const s = seuilsInterpretation();

    if (A >= s.excellent && C >= s.excellent) {
        return {
            niveau: 'tres-favorable',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-tres-favorable',
            A: formaterPourcentage(A * 100, 0),
            C: formaterPourcentage(C * 100, 0),
            recommandation: 'À la lumière de ces données, les interventions pourraient se concentrer sur le développement des habiletés et des compétences.'
        };
    }

    if (A >= s.bon && C >= s.bon) {
        return {
            niveau: 'favorable',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-favorable',
            A: formaterPourcentage(A * 100, 0),
            C: formaterPourcentage(C * 100, 0),
            recommandation: 'À la lumière de ces données, les interventions pourraient se concentrer sur le développement des habiletés et des compétences.'
        };
    }

    if (A >= s.acceptable && C >= s.acceptable) {
        return {
            niveau: 'modere',
            label: decrireContexte(A, C),
            badgeClasse: 'badge-engagement-modere',
            A: formaterPourcentage(A * 100, 0),
            C: formaterPourcentage(C * 100, 0),
            recommandation: 'À la lumière de ces données, un suivi régulier pourrait aider à garder le cap.'
        };
    }

    // #822 (lot C du cadrage du 16 sept. 2026) : un cinquième palier, « Insuffisant », suivait celui-ci
    // sans pouvoir être atteint. Retiré sur décision de Grégoire : son mot qualifiait la personne.
    return {
        niveau: 'fragile',
        label: decrireContexte(A, C),
        badgeClasse: 'badge-engagement-fragile',
        A: formaterPourcentage(A * 100, 0),
        C: formaterPourcentage(C * 100, 0),
        recommandation: 'À la lumière de ces données, il pourrait être pertinent de rencontrer l\'étudiant·e pour comprendre les absences ou les travaux manquants, et de vérifier s\'il y a des obstacles (emploi, santé, etc.).'
    };
}

/* ===============================
   LA CARTE MOBILISATION DU PROFIL — conjonction sur A et C
   =============================== */

/**
 * Interprète A et C pour la carte Mobilisation. Les neuf branches gardent leurs couleurs ; elles n'ont
 * pas de mot à elles. `code` nomme la branche (les lecteurs choisissent leur prose par lui) ; `niveau`
 * est la phrase des deux observations (`decrireContexte`), sauf « Décrochage », statut posé par l'enseignant.
 * @param {number} A - Assiduité en proportion 0-1
 * @param {number} C - Complétion en proportion 0-1
 * @param {boolean} statutDecrochage - Indicateur de décrochage (défaut: false)
 * @returns {Object} - { code, niveau, couleur }
 */
function interpreterMobilisation(A, C, statutDecrochage = false) {
    // 1. Décrochage (priorité absolue - interventions impossibles)
    if (statutDecrochage) {
        return { code: 'decrochage', niveau: 'Décrochage', couleur: '#9e9e9e' }; // Gris
    }
    const branche = brancheMobilisation(A, C);
    return { code: branche.code, niveau: decrireContexte(A, C), couleur: branche.couleur };
}

/** Les branches 2 à 9 de la mobilisation : un code et une couleur, sans mot. */
function brancheMobilisation(A, C) {
    const B = bornesMobilisation();

    // 2. Les deux au palier le plus bas
    if (A < B.critique && C < B.critique) return { code: 'critiques', couleur: '#dc3545' }; // Rouge
    // 3. Assiduité seule au palier le plus bas
    if (A < B.critique) return { code: 'assiduite-critique', couleur: '#ff9800' }; // Orange
    // 4. Complétion seule au palier le plus bas
    if (C < B.critique) return { code: 'completion-critique', couleur: '#ff9800' }; // Orange
    // 5. Les deux sous « Absences rares »
    if (A < B.fragile && C < B.fragile) return { code: 'fragile', couleur: '#ffc107' }; // Jaune
    // 6. Assiduité seule sous « Absences rares »
    if (A < B.fragile && C >= B.fragile) return { code: 'assiduite-fragile', couleur: '#ffc107' }; // Jaune
    // 7. Complétion seule sous « Absences rares »
    if (A >= B.fragile && C < B.fragile) return { code: 'completion-fragile', couleur: '#ffc107' }; // Jaune
    // 8. Les deux au palier du haut
    if (A >= B.favorable && C >= B.favorable) return { code: 'favorable', couleur: '#2196F3' }; // Bleu
    // 9. Sinon : les deux au moins à « Absences rares », mais pas tous deux au palier du haut
    return { code: 'acceptable', couleur: '#28a745' }; // Vert
}

/* ===============================
   L'AIDE LIT LA MÊME SOURCE
   =============================== */

/**
 * Le tableau « Les mots qui décrivent A et C » et les bornes citées dans l'Aide, écrits à partir des
 * défauts et des mots de ce module. L'Aide n'en porte plus de copie : `index.html` n'a que des cases vides.
 * @param {ParentNode} [racine] - `document` par défaut
 */
function remplirAideSeuilsDeDepart(racine) {
    const doc = racine || (typeof document !== 'undefined' ? document : null);
    if (!doc || !window.SEUILS_PAR_DEFAUT) return;
    const d = window.SEUILS_PAR_DEFAUT.interpretation;
    const pct = (p) => Math.round(p * 100);

    const corps = doc.querySelector('#aide-table-paliers-a-c tbody');
    if (corps) {
        const bornes = [
            '≥ ' + formaterPourcentage(pct(d.excellent)),
            pct(d.bon) + '-' + formaterPourcentage(pct(d.excellent) - 1),
            pct(d.acceptable) + '-' + formaterPourcentage(pct(d.bon) - 1),
            '< ' + formaterPourcentage(pct(d.acceptable))
        ];
        corps.replaceChildren(...bornes.map((borne, i) => {
            const ligne = doc.createElement('tr');
            [borne, MOTS_PRESENCE[i], MOTS_REMISE[i]].forEach((texte, colonne) => {
                const cellule = doc.createElement('td');
                if (colonne === 0) cellule.className = 'text-center';
                cellule.textContent = texte;
                ligne.appendChild(cellule);
            });
            return ligne;
        }));
    }

    doc.querySelectorAll('[data-seuil-depart]').forEach((el) => {
        const chemin = el.getAttribute('data-seuil-depart');
        const valeur = chemin === 'notePassage' ? window.NOTE_DE_PASSAGE : d[chemin];
        if (typeof valeur === 'number') el.textContent = formaterPourcentage(pct(valeur));
    });
}

/* ===============================
   LES RÈGLES, DÉCLARÉES CÔTE À CÔTE
   =============================== */

/**
 * Le tableau des règles, avec leurs bornes VIVANTES. C'est la vue comparable ; les fonctions
 * ci-dessus restent les seules à qualifier.
 * @returns {Array<Object>}
 */
function reglesDeQualification() {
    const s = seuilsInterpretation();
    return [
        { nom: 'Mots, couleurs et pastilles de A et C', entree: 'un pourcentage', bornes: s },
        { nom: 'Contexte d\'apprentissage (profil)', entree: 'A et C', bornes: s },
        { nom: 'Carte Mobilisation (profil)', entree: 'A et C', bornes: bornesMobilisation() },
        { nom: 'Performance', entree: 'un pourcentage', bornes: reperesPerformance() }
    ];
}

// Exporter vers window (convention systématique cross-zones).
window.interpreterAssiduite = interpreterAssiduite;
window.interpreterCompletion = interpreterCompletion;
window.decrireContexte = decrireContexte;
window.zoneAssiduiteCompletion = zoneAssiduiteCompletion;
window.borneBasseAssiduiteCompletion = borneBasseAssiduiteCompletion;
window.sousLePalierRares = sousLePalierRares;
window.bornesMobilisation = bornesMobilisation;
window.reperesPerformance = reperesPerformance;
window.zonePerformance = zonePerformance;
window.borneBassePerformance = borneBassePerformance;
window.bornesDepistage = bornesDepistage;
window.classePastilleDeLaZone = classePastilleDeLaZone;
window.obtenirCouleurSelonSeuils = obtenirCouleurSelonSeuils;
window.obtenirCouleurPerformanceSelonEchelle = obtenirCouleurPerformanceSelonEchelle;
window.zonesDeLaBarre = zonesDeLaBarre;
window.qualifierContexteApprentissage = qualifierContexteApprentissage;
window.interpreterMobilisation = interpreterMobilisation;
window.remplirAideSeuilsDeDepart = remplirAideSeuilsDeDepart;
window.reglesDeQualification = reglesDeQualification;

if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', () => remplirAideSeuilsDeDepart());
}

})();
