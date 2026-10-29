/* ===============================
   INTERVENTIONS.JS - Beta 85
   Gestion des interventions RàI
   =============================== */

(function() {
'use strict';

// Lot A de l'enregistrement (26 sept. 2026, #751) — en anonymisation, un texte libre ne se
// dé-identifie pas de façon fiable (un nom de famille, un surnom, une allusion) : il est MASQUÉ,
// dans les cartes comme dans le formulaire, et un champ masqué ne s'écrit pas — ce qui est en
// base y reste. Avant : description et observations s'affichaient en clair dans le formulaire,
// et la note individuelle, pré-remplie avec « Élève N », s'écrivait telle quelle à l'Enregistrer.
function _texteLibreMasque() {
    return typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation();
}
function _texteLibreAffiche(texte) {
    return _texteLibreMasque()
        ? '<em class="text-muted">' + echapperHtml(window.MENTION_MASQUE_ANONYMISATION) + '</em>'
        : echapperHtml(texte || '');
}
function _valeurTexteLibre(texte) {
    return _texteLibreMasque() ? '' : echapperHtml(texte || '');
}
function _attributsTexteLibre(placeholder) {
    return _texteLibreMasque()
        ? 'placeholder="' + echapperHtml(window.MENTION_MASQUE_ANONYMISATION) + '" disabled data-masque-anonymisation="1"'
        : 'placeholder="' + echapperHtml(placeholder) + '"';
}
// Relecture croisée R4 : le titre aussi est un texte libre — un titre générique daté en anonymisation.
function _titreAffiche(intervention) {
    if (typeof window.titreInterventionAffiche !== 'function') return intervention.titre || '';
    return window.titreInterventionAffiche(intervention, '', _enVueRencontres() ? 'Rencontre' : 'Intervention');
}
function _texteDuChamp(champ, valeurEnBase) {
    if (champ && champ.dataset.masqueAnonymisation === '1') return valeurEnBase || '';
    return champ ? champ.value : '';
}

/**
 * MODULE INTERVENTIONS - SOURCE UNIQUE
 *
 * RESPONSABILITÉ :
 * - Planifier des interventions (niveau 2 groupe, niveau 3 individuel)
 * - Documenter la présence des étudiants
 * - Analyser les besoins communs du sous-groupe
 * - Conserver l'historique des interventions
 *
 * CLÉ LOCALSTORAGE :
 * - cle('interventions') (namespacée par trimestre) : Array des interventions ENREGISTRÉES.
 *   « Planifier » n'y écrit rien : le formulaire d'une nouvelle intervention travaille sur un brouillon
 *   EN MÉMOIRE (`_brouillon`), qui n'entre dans le tableau qu'à « Enregistrer » (lot 5 du cadrage 11).
 *
 * STRUCTURE D'UNE INTERVENTION :
 * {
 *   id: 'intervention-…',   // genererIdUnique('intervention-') : horodatage + compteur + aléa
 *   date: '2025-11-04',
 *   heure: '13:30',
 *   type: 'groupe' | 'individuel',
 *   niveauRai: 2 | 3,
 *   titre: 'Intervention Rigueur et Nuance',
 *   description: 'Séance focalisée sur...',
 *   etudiants: ['1234567', '7654321'], // DAs des étudiants présents
 *   analyse: {
 *     nbEtudiants: 7,
 *     patternsCommuns: { 'Difficulté émergente': 5 },
 *     progressions: { 'En progression': 3, 'Plateau': 2, 'Régression': 2 },
 *     niveauxRai: { '1': 0, '2': 5, '3': 2 }
 *   },
 *   observations: 'Notes prises durant la rencontre...',
 *   notesIndividuelles: { '1234567': 'Excellente participation...', '7654321': 'A besoin de...' },
 *   statut: 'planifiee' | 'en-cours' | 'completee',   // 'planifiee' à la construction
 *   groupeCoursId: 'GC_…' | null,  // lot D du cadrage « Rencontres » (12 sept. 2026) : le contexte de NAISSANCE
 *                                  // (obtenirIdContexteActif). Absent sur les interventions d'avant : elles restent
 *                                  // visibles dans tous les contextes et sont estampillées au prochain Enregistrer.
 *   dateCreation: '2026-09-12T16:05:00.000Z',   // chaîne ISO
 *   dateModification: 1757693100000             // horodatage en millisecondes
 * }
 * ⮕ Les deux dates n'ont pas le même type (audit du 6 sept., I-6). Le stock porte les deux formes : c'est
 *   documenté ici, pas harmonisé (commenté le 12 sept. 2026, lot 5 du cadrage 11).
 *
 * API PUBLIQUE :
 * - obtenirInterventions() : Array de toutes les interventions en base (brouillons d'avant le 12 sept. compris)
 * - obtenirIntervention(id) : Une intervention spécifique (ou le brouillon en cours, s'il porte cet id)
 * - obtenirInterventionsEtudiant(da) : Interventions pour un étudiant
 * - analyserSousGroupe(dasEtudiants) : Analyser les besoins communs
 * - supprimerIntervention(interventionId) : Supprimer une intervention
 * (creerIntervention, marquerPresences et completerIntervention sont retirées le 12 sept. 2026 : aucun
 *  appelant en production — la création passe par le brouillon, les présences par « Enregistrer ».)
 */

/* ===============================
   VOCABULAIRE ET CONTENEUR — lot C du cadrage « Rencontres » (12 sept. 2026)

   Le sous-onglet Suivi › Rencontres montre LES MÊMES interventions, dans le MÊME
   module, avec le vocabulaire « rencontre » (mots tranchés par Grégoire le 11 sept.,
   19 h 35). Pas de copie du module : un paramètre de vocabulaire et un conteneur.
   `rencontres.js` pose le vocabulaire avant d'afficher ; l'observateur de la sous-
   section Interventions le remet. Sur un SERVICE (contexteActifEstService), le contexte
   et le bloc « Gestion des absences » sont cachés : ils supposent une séance de groupe.
   (Le champ « Séance concernée », écrit et jamais lu, est retiré le 29 oct. 2026 : #1152,
   retouche 2 du lot 5, décision de Grégoire. Une intervention qui porte `seanceConcernee`
   la garde, sans lecteur ; le report des présences écrit à la date de l'intervention.)
   =============================== */
const VOCABULAIRES = {
    interventions: {
        boutonNouvelle: 'Planifier une intervention',
        titreNouvelle: 'Planifier une intervention',
        vide: 'Aucune intervention planifiée ou complétée.',
        videAide: 'Clique sur «Planifier une intervention» pour commencer.',
        introuvable: 'Intervention non trouvée.',
        supprimer: 'Supprimer cette intervention ?',
        // Lot E3 (D3, 28 sept. 2026) : créer ou modifier ; mots proposés à Grégoire.
        creer: 'Créer l\'intervention',
        modifier: 'Modifier l\'intervention',
        creee: 'Intervention créée.',
        pasEncoreCree: 'Cette intervention n\'est pas encore créée.',
        // Mots acceptés par Grégoire le 28 sept. (19 h 46), mot pour mot.
        completerTitre: 'Marquer cette intervention complétée ?',
        caseReport: 'Reporter les présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours.',
        caseReportUneFois: 'Le report se fait une seule fois : il ne se refait pas si tu modifies l\'intervention ensuite.',
        labelNiveau: 'Niveau R\u00e0I :',
        // #1152, lot 5 (texte n° 14, décidé par Grégoire le 28 oct. 2026) : le niveau porte son nom d'intensité.
        niveau2: 'Niveau 2 – Préventif, en groupe ciblé',
        niveau3: 'Niveau 3 – Intensif, individuel',
        placeholderTitre: 'Ex. Intervention sur deux critères ciblés',
        titreApercu: 'Aperçu du sous-groupe',
        titrePresences: 'Marquer les présences et notes individuelles',
        aidePresences: 'Coche les étudiant·es présent·es et documente tes observations spécifiques.',
        titreBilan: 'Bilan post-intervention',
        aideBilan: 'Comparaison automatique des critères ciblés avant et après l\'intervention.'
    },
    rencontres: {
        boutonNouvelle: '+ Nouvelle rencontre',
        titreNouvelle: 'Nouvelle rencontre',
        vide: 'Aucune rencontre.',
        videAide: 'Clique sur « + Nouvelle rencontre » pour en créer une.',
        introuvable: 'Rencontre introuvable.',
        supprimer: 'Supprimer cette rencontre ?',
        // Lot E3 (D3, 28 sept. 2026) : créer ou modifier ; mots proposés à Grégoire.
        creer: 'Créer la rencontre',
        modifier: 'Modifier la rencontre',
        creee: 'Rencontre créée.',
        pasEncoreCree: 'Cette rencontre n\'est pas encore créée.',
        // Même phrase, « rencontre » pour « intervention » (comme le titre accepté).
        completerTitre: 'Marquer cette rencontre complétée ?',
        caseReport: 'Reporter les présences dans la saisie des présences : la présence à cette rencontre compensera une absence au cours.',
        caseReportUneFois: 'Le report se fait une seule fois : il ne se refait pas si tu modifies la rencontre ensuite.',
        labelNiveau: 'Rencontre :',
        niveau2: 'En sous-groupe',
        niveau3: 'Individuelle',
        placeholderTitre: 'Ex. Planifier une dissertation',
        titreApercu: 'Aperçu des participants',
        titrePresences: 'Participants et notes',
        aidePresences: 'Coche les élèves présents à la rencontre et note tes observations pour chacun.',
        titreBilan: 'Bilan de la rencontre',
        // Consigne du 12 sept., 10 h 35 (lot C) : texte ARRÊTÉ par Grégoire à 10 h 40. Sur un service, la carte
        // des critères ciblés n'est pas rendue : il n'y a plus de comparaison avant/après à annoncer.
        aideBilan: 'Ce que tu retiens de la rencontre.'
    }
};
let _vocabulaireActif = 'interventions';
function definirVocabulaireInterventions(nom) {
    _vocabulaireActif = VOCABULAIRES[nom] ? nom : 'interventions';
}
function V() { return VOCABULAIRES[_vocabulaireActif]; }
function _enVueRencontres() { return _vocabulaireActif === 'rencontres'; }
function _idConteneurPrincipal() { return _enVueRencontres() ? 'conteneurRencontres' : 'conteneurPrincipal'; }
function _idListe() { return _enVueRencontres() ? 'listeRencontres' : 'listeInterventions'; }
function _surService() { return typeof contexteActifEstService === 'function' && contexteActifEstService(); }

/* ===============================
   LE BROUILLON — lot 5 du cadrage 11 (12 sept. 2026, audit du 6 sept., I-1)

   « Planifier une intervention » écrivait l'intervention EN BASE avant toute saisie
   (`jamaisSauvegardee: true`), et le ré-affichage suivant de la liste la purgeait sans un mot :
   un formulaire à moitié rempli disparaissait, et un export pris entre-temps contenait un fantôme.
   Désormais elle naît ICI, en mémoire, et n'entre en base qu'à « Enregistrer »
   (sauvegarderPresencesIntervention) ; « Annuler » la jette sans rien écrire. Un seul brouillon à
   la fois : celui qu'on abandonne en changeant d'onglet reste ici, inerte, jusqu'au prochain
   « Planifier » — il n'est jamais écrit.
   =============================== */
let _brouillon = null;
function _estBrouillon(id) { return _brouillon !== null && _brouillon.id === id; }

/* ===============================
   FONCTIONS D'ACCÈS AUX DONNÉES
   =============================== */

/**
 * Obtenir toutes les interventions
 * @returns {Array} Liste des interventions
 */
function obtenirInterventions() {
    // db.getSync retourne déjà l'objet parsé, pas besoin de JSON.parse
    // Utiliser cle() pour namespacing par trimestre
    return db.getSync(cle('interventions'), []);
}

/**
 * Obtenir une intervention spécifique
 * @param {string} id - ID de l'intervention
 * @returns {Object|null} L'intervention ou null
 */
function obtenirIntervention(id) {
    // Le formulaire d'une nouvelle intervention relit son objet par l'id (ouvrirIntervention,
    // mettreAJourCriteresCibles) : le brouillon en mémoire répond à son id, la base au reste.
    const intervention = _estBrouillon(id) ? _brouillon : obtenirInterventions().find(i => i.id === id);
    if (intervention) {
        // Rétrocompatibilité : valeurs par défaut pour les champs ajoutés (Phase 3)
        if (!intervention.criteresCibles) intervention.criteresCibles = [];
        if (intervention.objectifVise === undefined) intervention.objectifVise = '';
        if (intervention.bilan === undefined) intervention.bilan = null;
    }
    return intervention || null;
}

/**
 * Obtenir les interventions d'un étudiant
 * @param {string} da - DA de l'étudiant
 * #746 (13 sept. 2026) — même filtre de contexte que la liste (`interventionsDuContexteActif`) : le profil,
 * l'historique, les graphiques et le compteur de la Liste ne montrent plus celles d'un autre groupe-cours.
 * Une intervention sans `groupeCoursId` (écrite avant le 12 sept.) reste visible partout, comme dans la liste.
 * @returns {Array} Liste des interventions où l'étudiant était présent
 */
function obtenirInterventionsEtudiant(da) {
    const interventions = interventionsDuContexteActif(_interventionsLisibles(obtenirInterventions(), false));
    return interventions.filter(i => i.etudiants && i.etudiants.includes(da));
}

/**
 * Le STOCK du lot 5 (cadrage 11, 12 sept. 2026) : avant ce lot, « Planifier » écrivait un brouillon
 * `jamaisSauvegardee: true` en base, purgé au ré-affichage suivant de la liste. Un brouillon laissé là
 * entre-temps peut y dormir encore. À la lecture de Suivi (la liste, les comptes par élève) : ni rendu,
 * ni compté — et dit en console quand `dire` est vrai. JAMAIS supprimé : écrire dans les données de
 * quelqu'un remonte à Grégoire. Les écritures relisent `obtenirInterventions()` brut : il y reste.
 * @param {Array} interventions - Le tableau lu en base
 * @param {boolean} dire - Signaler en console le nombre de brouillons ignorés
 * @returns {Array} Les interventions enregistrées
 */
function _interventionsLisibles(interventions, dire) {
    const lisibles = interventions.filter(i => i.jamaisSauvegardee !== true);
    if (dire && lisibles.length !== interventions.length) {
        console.warn('Interventions : ' + (interventions.length - lisibles.length) + ' brouillon(s) d\'avant le 12 sept. 2026 ignoré(s) — jamais enregistré(s), laissé(s) en base.');
    }
    return lisibles;
}

/* ===============================
   CRÉATION ET MODIFICATION
   =============================== */

/**
 * Construire une nouvelle intervention, EN MÉMOIRE — rien n'est écrit (lot 5 du cadrage 11, 12 sept.
 * 2026 : était `creerIntervention`, qui la poussait en base aussitôt).
 * @param {Object} data - Données de l'intervention
 * @returns {Object} L'intervention, statut « planifiée »
 */
function _construireIntervention(data) {
    const now = new Date().toISOString();
    return {
        id: genererIdUnique('intervention-'),
        date: data.date || '',
        heure: data.heure || '',
        duree: data.duree || 2,
        type: data.type || 'groupe',
        niveauRai: data.niveauRai || 2,
        contexte: data.contexte || null,
        titre: data.titre || '',
        description: data.description || '',
        marquerNonParticipantsMotives: data.marquerNonParticipantsMotives || false,
        etudiants: [],
        analyse: null,
        criteresCibles: data.criteresCibles || [],
        objectifVise: data.objectifVise || '',
        bilan: null,
        // Lot D (cadrage « Rencontres », 12 sept. 2026) — une intervention SAIT dans quel
        // groupe-cours elle est née (constat de l'audit du 5 sept. : « les interventions ne
        // portent pas leur groupe-cours »). Un seul point de lecture : obtenirIdContexteActif.
        groupeCoursId: data.groupeCoursId !== undefined ? data.groupeCoursId : obtenirIdContexteActif(),
        statut: 'planifiee',
        dateCreation: now,        // chaîne ISO…
        dateModification: now     // …ici aussi ; chaque écriture la remplace ensuite par Date.now() (I-6, commenté)
    };
}

/**
 * Poser les présences sur une intervention, EN MÉMOIRE — l'appelant écrit. Participants, analyse du
 * sous-groupe, statut « planifiée » → « en cours ». Lot 5 du cadrage 11 (12 sept. 2026) : était
 * `marquerPresences`, qui relisait et réécrivait tout le tableau — la première des DEUX écritures
 * complètes d'un seul « Enregistrer » (audit du 6 sept., § 5.1).
 * @param {Object} intervention - L'intervention à compléter
 * @param {Array} dasEtudiants - Liste des DAs des étudiants présents
 */
function _appliquerPresences(intervention, dasEtudiants) {
    intervention.etudiants = dasEtudiants;
    intervention.dateModification = Date.now();

    // Générer l'analyse du sous-groupe
    if (dasEtudiants.length > 0) {
        intervention.analyse = analyserSousGroupe(dasEtudiants);
    }

    // Changer le statut si c'était planifié
    if (intervention.statut === 'planifiee') {
        intervention.statut = 'en-cours';
    }
}

/**
 * Analyser les besoins communs d'un sous-groupe d'étudiants
 * @param {Array} dasEtudiants - Liste des DAs des étudiants
 * @returns {Object} Analyse des besoins communs
 */
function analyserSousGroupe(dasEtudiants) {
    const patternsCommuns = {};
    const progressions = {};
    const niveauxRai = { '1': 0, '2': 0, '3': 0 };
    let nbEtudiants = dasEtudiants.length;

    dasEtudiants.forEach(da => {
        // Calculer les indices pour cet étudiant
        const indices = calculerTousLesIndices(da);
        var niveauRaiEtud = typeof determinerNiveauRaiPedagogique === 'function'
            ? determinerNiveauRaiPedagogique(da) : null;
        var niveauEtud = niveauRaiEtud ? niveauRaiEtud.niveau : 1;

        // Compter les niveaux RàI
        niveauxRai[niveauEtud] = (niveauxRai[niveauEtud] || 0) + 1;

        // Compter les patterns
        var patternEtud = niveauRaiEtud ? niveauRaiEtud.pattern : 'Données insuffisantes';
        patternsCommuns[patternEtud] = (patternsCommuns[patternEtud] || 0) + 1;

        // Calculer la progression (fonction à créer ou utiliser existante)
        if (typeof calculerProgressionArtefacts === 'function') {
            const progression = calculerProgressionArtefacts(da);
            if (progression && progression.interpretation) {
                const progLabel = progression.interpretation;
                progressions[progLabel] = (progressions[progLabel] || 0) + 1;
            }
        }

        // ⮕ #575 (lot 4 du plan SOLO, B1+B2+B3+B4) — LE BLOC « DÉFIS » A ÉTÉ
        // RETIRÉ D'ICI, PAS RÉPARÉ.
        //
        // Il comptait, par étudiant, les critères sous le seuil de défi et
        // alimentait `defisCommuns`. Trois raisons de le retirer plutôt que de le
        // corriger, constatées ensemble le 27 août 2026 :
        //
        //   1. AUCUN ÉCRAN NE LE LISAIT. `defisCommuns` était écrit dans
        //      `intervention.analyse` et sauvegardé en base ; `genererAffichageAnalyseCartes`
        //      n'affiche que les patterns et les niveaux RàI. Grep sur tout le dépôt :
        //      aucun lecteur, et aucun depuis sa création (Beta 0.85). Réparer un
        //      calcul que personne ne regarde, c'est du travail sans effet.
        //
        //   2. LE MÊME BESOIN EST DÉJÀ SERVI, ET JUSTE. `mettreAJourCriteresCibles`
        //      (plus bas dans ce fichier) compte les étudiants en défi PAR CRITÈRE DE
        //      LA GRILLE de l'utilisateur, avec `calculerMoyennesCriteres`, et l'affiche
        //      à côté de chaque case (« — 3/5 en défi »). C'est le chemin vivant ;
        //      celui-ci en était un doublon codé en dur.
        //
        //   3. IL PORTAIT DEUX FOIS LE CONTEXTE DE GRÉGOIRE. Les cinq noms de ses
        //      critères en toutes lettres (B3/B4) ; et, via `obtenirPerformancesSRPNF`
        //      → `convertirNiveauEnPourcentage`, un quatrième repli IDME
        //      `{I:32, D:69.5, M:79.5, E:92.5}` derrière une clé de base
        //      (`echellesPerformance`) que RIEN n'écrivait (B1/B2). Ce repli était donc
        //      toujours actif : faux même chez lui (ses valeurs sont 40/65/75/100), et
        //      0 % pour tout code non IDME ailleurs.
        //
        // Les deux fonctions qui le servaient sont supprimées avec lui.
    });

    return {
        nbEtudiants: nbEtudiants,
        patternsCommuns: patternsCommuns,
        progressions: progressions,
        niveauxRai: niveauxRai
    };
}

/**
 * Supprimer une intervention
 * @param {string} interventionId - ID de l'intervention
 */
function supprimerIntervention(interventionId) {
    let interventions = obtenirInterventions();
    interventions = interventions.filter(i => i.id !== interventionId);
    // Lot E3 (D0 point 2) : par le témoin commun, comme les suppressions du Cadre (lot E2).
    return sauvegarderDonneesSelonMode('interventions', interventions, { geste: _enVueRencontres() ? 'Supprimer la rencontre' : 'Supprimer l\'intervention' });
}

/* ===============================
   INTERFACE UTILISATEUR
   =============================== */

/**
 * Afficher la liste des interventions
 */
function afficherListeInterventions() {

    // S'assurer que le conteneur principal existe et contient le bon HTML
    const conteneurPrincipal = document.getElementById(_idConteneurPrincipal());
    if (conteneurPrincipal) {
        // Vérifier si le conteneur de liste existe, sinon le recréer
        let container = document.getElementById(_idListe());
        if (!container) {
            conteneurPrincipal.innerHTML = '<div id="' + _idListe() + '"></div>'; // security-ok: _idListe() rend l'un de deux identifiants littéraux du module, jamais une donnée
            container = document.getElementById(_idListe());
        }
    }

    // Lot 5 du cadrage 11 (12 sept. 2026, I-1) : plus de purge — « Planifier » n'écrit plus rien. Un
    // brouillon d'avant le lot, resté en base, n'est ni rendu ni effacé (_interventionsLisibles).
    let interventions = _interventionsLisibles(obtenirInterventions(), true);
    // Lot D (cadrage « Rencontres ») : la liste ne mêle plus les interventions d'un autre
    // groupe-cours. Une intervention sans contexte (d'avant le lot) reste visible partout —
    // aucune purge, aucun semis : elle prend son contexte au prochain Enregistrer.
    interventions = interventionsDuContexteActif(interventions);

    const container = document.getElementById(_idListe());

    if (!container) {
        console.error('❌ Conteneur #' + _idListe() + ' introuvable');
        return;
    }

    // Trier par date (plus récentes en premier)
    interventions.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.heure || '00:00'));
        const dateB = new Date(b.date + ' ' + (b.heure || '00:00'));
        return dateB - dateA;
    });

    // Bouton pour planifier une nouvelle intervention.
    // Le bouton « Guide RàI » (module guides-pedagogiques.js) suit la préférence activerRai,
    // par cohérence avec les autres zones RàI de l'app.
    const raiActif = (typeof obtenirPreference === 'function')
        && obtenirPreference('activerRai') !== false;
    let html = `
        <div class="actions-principales">
            <button data-action="afficherFormulaireIntervention" class="btn btn-principal" data-tooltip="interv-btn-planifier">
                ${V().boutonNouvelle}
            </button>
            ${raiActif ? `<button data-action="ouvrirGuidePedagogique" data-param="rai" class="btn btn-secondaire" title="Guide RàI">
                <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide RàI
            </button>` : ''}
        </div>
    `;

    if (interventions.length === 0) {
        html += `
            <div class="message-vide">
                <p>${V().vide}</p>
                <p class="message-vide-aide">${V().videAide}</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    // Consigne du 12 sept., 10 h 50 (lot D) : « Tes prochains rendez-vous », sur un service, en tête de la liste.
    // Rendu ICI et non dans afficherRencontres : ouvrir une rencontre remplace le conteneur, et le retour ne
    // reconstruit que la liste — un bloc posé ailleurs disparaîtrait, et ne suivrait pas un Enregistrer.
    if (_enVueRencontres() && _surService()) html += _blocProchainsRendezVous(interventions);

    interventions.forEach(intervention => {
        const badgeStatut = genererBadgeStatut(intervention.statut);
        const ctx = intervention.contexte || '';
        var badgeType;
        if (ctx === 'rattrapage') badgeType = 'Rattrapage';
        else if (ctx === 'en-classe') badgeType = 'En classe';
        else if (ctx === 'mio' || intervention.type === 'mio') badgeType = 'MIO';
        else if (intervention.type === 'individuel' || intervention.niveauRai === 3) badgeType = 'Hors classe';
        else badgeType = intervention.type === 'groupe' ? 'Groupe' : 'Individuel';
        // Vue Rencontres : deux formes, individuelle ou en sous-groupe ; le palier RàI n'est pas affiché.
        if (_enVueRencontres()) badgeType = _formeRencontre(intervention);
        const badgeNiveau = _enVueRencontres() ? '' : `Niveau ${intervention.niveauRai}`;

        html += `
            <div class="carte intervention-item u-mb-15">
                <div class="intervention-header">
                    <div>
                        <h4 class="intervention-titre" data-tooltip="interv-carte">${echapperHtml(_titreAffiche(intervention))}</h4>
                        <div class="intervention-badges">
                            <span>${badgeStatut}</span>
                            <span class="badge-type-intervention">${badgeType}</span>
                            ${badgeNiveau ? `<span class="badge-rai-${intervention.niveauRai}">${badgeNiveau}</span>` : ''}
                        </div>
                    </div>
                    <div class="intervention-actions">
                        <button data-action="ouvrirIntervention" data-param="${intervention.id}" class="btn btn-principal">
                            Ouvrir
                        </button>
                        <button data-action="supprimerInterventionEtRafraichir" data-param="${intervention.id}" class="btn btn-supprimer">Supprimer</button>
                    </div>
                </div>

                <p class="intervention-description">${_texteLibreAffiche(intervention.description)} <span class="text-muted">${formaterDateLisible(intervention.date)}${intervention.heure ? ` à ${echapperHtml(intervention.heure)}` : ''}</span></p>

                ${(intervention.analyse || (intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0)) ? `
                    <h4 class="intervention-titre u-mb-10 u-mt-10">${V().titreApercu} (${formaterNbEtudiants(intervention.analyse ? intervention.analyse.nbEtudiants : 0)})</h4>
                    <div class="intervention-cartes-row">
                        ${intervention.analyse ? genererAffichageAnalyseCartes(intervention.analyse) : ''}
                        ${intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0 ? genererAffichageNotesIndividuelles(intervention.notesIndividuelles) : ''}
                    </div>
                ` : ''}

                ${intervention.observations ? `
                    <div class="carte intervention-observations">
                        <h5>Observations générales</h5>
                        <p>${_texteLibreAffiche(intervention.observations)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Lot D — les interventions visibles dans le contexte actif : celles nées ici, et celles
 * d'avant le lot (sans `groupeCoursId`). Sans contexte actif, tout est visible.
 *
 * Relecture croisée de Cowork (12 sept. 2026) : l'estampille n'a pas la même granularité
 * selon le mode — `obtenirIdContexteActif` rend l'id du groupe-cours en mode groupe-cours,
 * mais le coursId en mode cours fusionné (`_definirInfoCoursModeCours` n'écrit pas
 * `_groupeCoursId`). Un enseignant qui passe d'un mode à l'autre (Grégoire a deux groupes du
 * même cours) aurait vu disparaître une intervention née dans l'autre mode. Le filtre accepte
 * donc aussi (a) une estampille égale au coursId du contexte actif, et (b) en mode cours,
 * toute estampille qui est l'id d'un groupe-cours de ce cours. En mode groupe-cours, une
 * intervention née dans l'AUTRE groupe du même cours reste cachée : c'est l'objet du lot.
 * @param {Array} interventions
 * @returns {Array}
 */
function interventionsDuContexteActif(interventions) {
    const gcActif = obtenirIdContexteActif();
    if (!gcActif) return interventions;
    const acceptes = _estampillesAcceptees(gcActif);
    return interventions.filter(function(i) { return !i.groupeCoursId || acceptes.has(i.groupeCoursId); });
}

/** Les estampilles visibles depuis le contexte actif (voir `interventionsDuContexteActif`). Lecture seule. */
function _estampillesAcceptees(gcActif) {
    const acceptes = new Set([gcActif]);
    const gca = db.getSync('groupeCoursActif', null);
    const infoCours = db.getSync('infoCours', null);
    const modeCours = !!(gca && gca.modeCours) || !!(infoCours && infoCours._modeCours);
    const coursId = (gca && gca.coursId) || (modeCours && infoCours && infoCours.id) || null;
    if (!coursId) return acceptes;
    acceptes.add(coursId);
    if (modeCours) {
        (db.getSync(cle('groupesCours'), []) || []).forEach(function(g) {
            if (g && g.id && g.coursId === coursId) acceptes.add(g.id);
        });
    }
    return acceptes;
}

/** Lot D (12 sept. 2026) — la forme d'une rencontre, lue dans VOCABULAIRES.rencontres (pas une seconde écriture) ;
 *  même prédicat que le badge de la liste, pour que le bloc et la liste ne se contredisent jamais. */
function _formeRencontre(intervention) {
    const v = VOCABULAIRES.rencontres;
    return (intervention.type === 'individuel' || intervention.niveauRai === 3) ? v.niveau3 : v.niveau2;
}

/**
 * Lot D (consigne du 12 sept., 10 h 50 ; mots arrêtés par Grégoire à 10 h 52) — « Tes prochains rendez-vous » :
 * les rencontres déjà filtrées par contexte dont la date est ≥ aujourd'hui (date LOCALE, dateLocaleYMD — #398),
 * la plus proche en premier (date, puis heure), quatre au plus. Lecture seule ; son tri porte sur une copie :
 * celui de la liste (plus récentes d'abord) ne bouge pas. Appelé seulement quand la liste n'est pas vide.
 * @param {Array} interventions - la liste du contexte actif, sans les fantômes
 * @returns {string} HTML du bloc
 */
function _blocProchainsRendezVous(interventions) {
    const aujourdhui = dateLocaleYMD();
    const cleTri = (i) => i.date + ' ' + (i.heure || '00:00');
    const aVenir = interventions
        .filter(function(i) { return i.date && i.date >= aujourdhui; })
        .sort(function(a, b) { return cleTri(a).localeCompare(cleTri(b)); })
        .slice(0, 4);
    const corps = aVenir.length === 0
        ? '<p class="text-muted u-m-0">Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous.</p>'
        : '<ul style="margin: 0; padding-left: 20px;">' + aVenir.map(function(i) {
            return '<li><strong>' + echapperHtml(formaterDateLisible(i.date)) + '</strong>'
                + (i.heure ? ' à ' + echapperHtml(i.heure) : '')
                + ' — ' + echapperHtml(_titreAffiche(i)) + ' · ' + _formeRencontre(i).toLowerCase() + '</li>';
        }).join('') + '</ul>';
    return '<div class="carte u-mb-15" id="prochainsRendezVous">'
        + '<h4 class="intervention-titre u-mb-10">Tes prochains rendez-vous</h4>' + corps + '</div>';
}

/**
 * Générer un badge de statut
 * @param {string} statut - Statut de l'intervention
 * @returns {string} HTML du badge
 */
function genererBadgeStatut(statut) {
    const badges = {
        'planifiee': '<span class="badge-statut-planifiee">Planifiée</span>',
        'en-cours': '<span class="badge-statut-en-cours">En cours</span>',
        'completee': '<span class="badge-statut-completee">Complétée</span>'
    };
    return badges[statut] || '';
}

/**
 * Alias de formaterDateComplete() pour rétrocompatibilité (exporté via window.*)
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} Date formatée "jeudi 6 février 2026"
 */
function formaterDateLisible(dateStr) {
    return formaterDateComplete(dateStr);
}

/**
 * Obtenir la classe CSS correspondant à un pattern
 * @param {string} pattern - Nom du pattern
 * @returns {string} Classe CSS du pattern
 */
function obtenirClassePattern(pattern) {
    // Normaliser le nom du pattern pour correspondre aux classes CSS
    const patternNormalise = pattern.toLowerCase()
        .replace(/[éè]/g, 'e')
        .replace(/\s+/g, '-');

    // Mapping des patterns vers leurs classes CSS
    const mapping = {
        'stable': 'badge-pattern-stable',
        'progression': 'badge-pattern-progression',
        'defi-specifique': 'badge-pattern-defi-specifique',
        'difficulte-emergente': 'badge-pattern-difficulte-emergente',
        'difficulte-persistante': 'badge-pattern-difficulte-persistante'
    };

    return mapping[patternNormalise] || 'badge-pattern-analyse';
}

/**
 * Générer seulement les cartes d'analyse (Patterns et Niveaux RàI)
 * @param {Object} analyse - Données d'analyse
 * @returns {string} HTML des cartes d'analyse
 */
function genererAffichageAnalyseCartes(analyse) {
    if (!analyse || analyse.nbEtudiants === 0) return '';

    let html = '';

    // CARTE 1: Patterns d'apprentissage
    html += '<div class="profil-carte">';

    // Calculer le nombre de patterns distincts
    const nbPatterns = analyse.patternsCommuns ? Object.keys(analyse.patternsCommuns).length : 0;

    html += `
        <div class="carte-metrique-header">
            <h4 data-tooltip="interv-patterns">Patterns d'apprentissage</h4>
            <strong>${nbPatterns}</strong>
        </div>
    `;

    if (analyse.patternsCommuns && Object.keys(analyse.patternsCommuns).length > 0) {
        html += '<div class="badges-centres">';
        Object.entries(analyse.patternsCommuns)
            .sort((a, b) => b[1] - a[1])
            .forEach(([pattern, count]) => {
                // Convertir le nom du pattern en classe CSS
                const classePattern = obtenirClassePattern(pattern);
                html += `
                    <span class="badge-analyse ${classePattern}">
                        ${pattern}
                        <span class="badge-analyse-count">${count}</span>
                    </span>
                `;
            });
        html += '</div>';
    } else {
        html += '<p class="text-muted u-text-center">Aucune donnée</p>';
    }
    html += '</div>';

    // CARTE 2: Niveaux RàI
    html += '<div class="profil-carte">';

    // Calculer le nombre de niveaux distincts présents
    const nbNiveauxRai = analyse.niveauxRai ? Object.values(analyse.niveauxRai).filter(c => c > 0).length : 0;

    html += `
        <div class="carte-metrique-header">
            <h4 data-tooltip="interv-niveaux-rai">Niveaux RàI</h4>
            <strong>${nbNiveauxRai}</strong>
        </div>
    `;

    if (analyse.niveauxRai && Object.values(analyse.niveauxRai).some(c => c > 0)) {
        html += '<div class="badges-centres">';
        Object.entries(analyse.niveauxRai)
            .filter(([niveau, count]) => count > 0)
            .forEach(([niveau, count]) => {
                html += `
                    <span class="badge-analyse badge-rai-analyse-${niveau}">
                        Niveau ${niveau}
                        <span class="badge-analyse-count">${count}</span>
                    </span>
                `;
            });
        html += '</div>';
    } else {
        html += '<p class="text-muted u-text-center">Aucune donnée</p>';
    }
    html += '</div>';

    return html;
}

/**
 * Générer l'affichage des notes individuelles pour la liste des interventions
 * @param {Object} notesIndividuelles - Objet avec format { 'DA': 'note text', ... }
 * @returns {string} HTML des notes individuelles
 */
function genererAffichageNotesIndividuelles(notesIndividuelles) {
    if (!notesIndividuelles || Object.keys(notesIndividuelles).length === 0) return '';

    // Lot 5 du cadrage 11 (12 sept. 2026, audit du 6 sept. I-7, #748) — décision de Grégoire (11 sept.,
    // 17 h 47) : « la note reste visible, grisée, avec la mention « (n'est plus dans le groupe) » ». Avant,
    // la note d'un élève introuvable n'était pas rendue et le compteur la comptait quand même. Le compteur
    // compte désormais les lignes rendues.
    // Le groupe : celui du contexte actif (obtenirEtudiantsCoursActif, comme les cases du formulaire).
    // Le nom d'un élève qui n'y est plus : sa fiche du trimestre, tous groupes, si elle existe ; sinon son
    // DA. En anonymisation, ni l'une ni l'autre — la fiche brute n'est pas anonymisée : « --- », comme la
    // colonne DA de la Liste.
    const enAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();
    const groupe = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif() : obtenirDonneesSelonMode('groupeEtudiants');
    const trimestre = enAnonymisation ? [] : db.getSync(cle('groupeEtudiants'), []);
    const trouver = (liste, da) => liste.find(e => (e.daReel || e.da) === da);

    let lignes = '';
    let nbLignes = 0;
    Object.entries(notesIndividuelles).forEach(([da, note]) => {
        if (!note) return;
        const noteAff = _texteLibreAffiche(note);
        nbLignes++;
        const etudiant = trouver(groupe, da);
        if (etudiant) {
            lignes += `
                <div style="margin-bottom: 8px; font-size: 0.9rem;">
                    <strong>${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}:</strong> ${noteAff}
                </div>
            `;
            return;
        }
        const fiche = trouver(trimestre, da);
        const qui = fiche
            ? echapperHtml(fiche.prenom) + ' ' + echapperHtml(fiche.nom)
            : (enAnonymisation ? '---' : echapperHtml(da));
        lignes += `
                <div class="etud-texte-gris-clair" style="margin-bottom: 8px; font-size: 0.9rem;">
                    <strong>${qui}</strong> (n'est plus dans le groupe) : ${noteAff}
                </div>
            `;
    });

    if (nbLignes === 0) return '';
    return `
        <div class="profil-carte">
            <div class="carte-metrique-header">
                <h4 data-tooltip="interv-notes-individuelles">Notes individuelles</h4>
                <strong>${nbLignes}</strong>
            </div>
    ` + lignes + '</div>';
}

/**
 * Gère la visibilité du contexte et du panneau absences selon le niveau RàI sélectionné.
 * Appelé dynamiquement par les onchange du formulaire d'intervention.
 */
function gererVisibiliteContexteIntervention() {
    var niveau = document.getElementById('interventionNiveau');
    var contexteBloc = document.getElementById('interventionContexteBloc');
    var absencesBloc = document.getElementById('interventionAbsencesBloc');
    var contexteSelect = document.getElementById('interventionContexte');

    if (!niveau || !contexteBloc || !absencesBloc) return;

    // Sur un service : ni contexte de classe, ni gestion des absences — ces deux blocs supposent
    // une séance de groupe (cadrage « Rencontres », § C).
    if (_surService()) {
        contexteBloc.style.display = 'none';
        absencesBloc.style.display = 'none';
        return;
    }

    var val = parseInt(niveau.value);

    if (val === 2) {
        // Niveau 2 : afficher le choix de contexte
        contexteBloc.style.display = '';
        // Afficher le panneau absences seulement si contexte = rattrapage
        var ctx = contexteSelect ? contexteSelect.value : '';
        if (ctx === 'rattrapage') {
            absencesBloc.style.display = '';
        } else {
            absencesBloc.style.display = 'none';
        }
    } else {
        // Niveau 3 : toujours hors classe, pas de contexte ni d'absences
        contexteBloc.style.display = 'none';
        absencesBloc.style.display = 'none';
    }
}

/**
 * Afficher le formulaire de création d'intervention
 * @param {string} [daPreselectionne] - DA de l'étudiant à pré-cocher (depuis profil)
 */
function afficherFormulaireIntervention(daPreselectionne) {
    var container = document.getElementById(_idConteneurPrincipal());
    if (!container) return;

    // Déterminer le niveau RàI initial si un DA est pré-sélectionné.
    // Vue Rencontres : individuelle par défaut (`type: 'individuel'`, cadrage § C).
    var niveauInitial = _enVueRencontres() ? 3 : 2;
    if (daPreselectionne && typeof determinerNiveauRaiPedagogique === 'function') {
        var niveauRai = determinerNiveauRaiPedagogique(daPreselectionne);
        if (niveauRai && niveauRai.niveau >= 3) niveauInitial = 3;
    }

    // Lot 5 du cadrage 11 (12 sept. 2026, I-1) : l'intervention naît EN MÉMOIRE (le brouillon) — rien
    // n'est écrit tant qu'on n'a pas cliqué « Enregistrer ».
    var aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE
    _brouillon = _construireIntervention({
        date: aujourdhui,
        duree: 2,
        niveauRai: niveauInitial
    });

    // Ouvrir directement la vue complète (formulaire unifié)
    ouvrirIntervention(_brouillon.id, { modeCreation: true, daPreselectionne: daPreselectionne });
}

/**
 * Lot E3 (D3) — « ma fiche est en création et porte une saisie » : lu par la question de sortie et
 * par le `beforeunload` communs (`ui-dialogues.js`). La date du jour, la durée et le niveau posés à
 * l'ouverture ne sont pas une saisie.
 */
function interventionEnCreationSaisie() {
    if (!_brouillon) return false;
    const fiche = document.querySelector('[data-fiche-intervention="' + _brouillon.id + '"]');
    if (!fiche) return false;
    const valeur = (id) => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
    const coches = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked').length > 0;
    const notes = Array.from(document.querySelectorAll('#listeEtudiantsIntervention textarea')).some(t => String(t.value || '').trim());
    const statut = document.querySelector('input[name="interventionStatut"]:checked');
    return !!(valeur('interventionTitre') || valeur('interventionDescription') || valeur('observationsIntervention')
        || valeur('interventionHeure') || valeur('objectifVise') || coches || notes
        || valeur('interventionDate') !== (_brouillon.date || '')
        || (statut && statut.value === 'completee'));
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('intervention', interventionEnCreationSaisie);

/**
 * Lot E3 (D3) — « Fermer » (il n'annulait rien). En création : la question, puis le brouillon est
 * jeté sans rien écrire (lot 5 du cadrage 11). Une intervention existante est déjà enregistrée.
 * @param {string} interventionId
 */
async function fermerFicheIntervention(interventionId) {
    if (_estBrouillon(interventionId)) {
        if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('intervention', V().pasEncoreCree))) return;
        _brouillon = null;
    }
    afficherListeInterventions();
}

/**
 * Lot E3 (D3) — au retour sur le sous-onglet, une création en cours n'est plus remplacée par la liste :
 * elle était perdue en silence (inventaire du 26 sept.). Changer de sous-onglet passe par
 * `navigation.js` (zone protégée), où la question ne peut pas être posée ; la fiche, elle, reste.
 */
function interventionEnCreationAffichee() {
    return !!(_brouillon && document.querySelector('[data-fiche-intervention="' + _brouillon.id + '"]'));
}

/**
 * Ouvrir une intervention pour marquer les présences
 * @param {string} interventionId - ID de l'intervention
 * @param {Object} [options] - Options d'affichage
 * @param {boolean} [options.modeCreation] - true si on vient de créer l'intervention
 * @param {string} [options.daPreselectionne] - DA à pré-cocher dans la liste
 */
function ouvrirIntervention(interventionId, options) {
    options = options || {};
    const intervention = obtenirIntervention(interventionId);

    if (!intervention) {
        alert(V().introuvable);
        return;
    }

    const container = document.getElementById(_idConteneurPrincipal());
    if (!container) return;

    // Obtenir la liste des étudiants (filtrée par groupe-cours actif)
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');

    // Trier alphabétiquement
    etudiants.sort((a, b) => {
        const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
        const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
        return nomA.localeCompare(nomB);
    });

    // Générer la liste avec checkboxes et notes individuelles
    let listeHtml = '';
    let nbCheckboxesCochees = 0;
    etudiants.forEach(etudiant => {
        const checked = intervention.etudiants.includes(etudiant.da) ? 'checked' : '';
        if (checked) {
            nbCheckboxesCochees++;
        }
        const niveauRaiEtud = typeof determinerNiveauRaiPedagogique === 'function'
            ? determinerNiveauRaiPedagogique(etudiant.da) : null;
        const niveauBadge = niveauRaiEtud ? niveauRaiEtud.niveau : 0;
        const noteExistante = intervention.notesIndividuelles?.[etudiant.da] || '';

        listeHtml += `
            <div style="display: grid; grid-template-columns: auto 1fr 2fr auto; gap: 10px; align-items: center;
                        padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 5px;">
                <input type="checkbox" id="etud-${etudiant.da}" value="${echapperHtml(etudiant.da)}" ${checked}
                       data-on-change="onChangementSelectionEtudiants" data-param="${intervention.id}"
                       style="width: auto; margin: 0;">
                <label for="etud-${etudiant.da}" style="font-weight: 500; margin: 0; cursor: pointer;">
                    ${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}
                </label>
                <textarea id="note-${etudiant.da}" class="controle-form" rows="1"
                          ${_attributsTexteLibre('Note individuelle…')}
                          style="font-size: 0.85rem; resize: vertical;">${_valeurTexteLibre(noteExistante)}</textarea>
                <span class="badge-rai-${niveauBadge}">Niveau ${niveauBadge}</span>
            </div>
        `;
    });

    // Contexte existant ou dérivé pour rétrocompatibilité
    var contexteExistant = intervention.contexte || '';
    if (!contexteExistant) {
        // Migration : dériver le contexte depuis les anciens champs
        if (intervention.niveauRai === 3) contexteExistant = 'hors-classe';
        else if (intervention.type === 'mio') contexteExistant = 'mio';
        else if (intervention.marquerNonParticipantsMotives) contexteExistant = 'rattrapage';
        else contexteExistant = 'en-classe';
    }

    // Générer les checkboxes critères ciblés depuis la grille de dépistage
    var grilleRef = typeof obtenirGrilleReferenceDepistage === 'function' ? obtenirGrilleReferenceDepistage() : null;
    var criteresInitHtml = '';
    if (grilleRef && grilleRef.criteres && grilleRef.criteres.length > 0) {
        criteresInitHtml = grilleRef.criteres.map(function(c) {
            var checked = intervention.criteresCibles.indexOf(c.nom) >= 0 ? 'checked' : '';
            // #552 — une seule écriture de la table SOLO, dans
            // `profil-etudiant-calculs.js`. Elle vivait ici en double.
            var niveauLabel = typeof libelleNiveauSOLO === 'function'
                ? libelleNiveauSOLO(c.niveauSOLO)
                : 'multistructurel';
            // Lot 4, volet B (4 sept. 2026) : un critère « Aucun » n'a pas de badge SOLO —
            // il reste ciblable par l'intervention, il n'est simplement pas étiqueté.
            // #740 (16 sept.) : il n'est jamais PROPOSÉ — ni compté « en défi » ni pré-coché —
            // parce que `calculerMoyennesCriteres` ne le lit plus (filtre unique, helpers).
            // #1117 (19 oct. 2026) : observation SOLO désactivée, pas de badge non plus.
            var soloActive = typeof obtenirPreference !== 'function' || obtenirPreference('afficherDescriptionsSOLO') !== false;
            var badgeSolo = niveauLabel && soloActive
                ? '<span class="badge-sys" style="font-size: 0.75rem; padding: 2px 6px; opacity: 0.7;">' + echapperHtml(niveauLabel) + '</span>'
                : '';
            return '<label style="display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer;">' +
                '<input type="checkbox" class="critere-cible-cb" value="' + echapperHtml(c.nom) + '" ' + checked + ' style="width: auto; margin: 0;">' +
                '<span>' + echapperHtml(c.nom) + '</span>' +
                badgeSolo +
                '<span class="critere-defi-count" style="font-size: 0.8rem; color: var(--gris-moyen);"></span>' +
                '</label>';
        }).join('');
    } else {
        criteresInitHtml = '<p class="text-muted" style="font-style: italic;">Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère.</p>';
    }

    // Consigne du 12 sept., 10 h 35 (lot C, décision de Grégoire) : sur un service, la carte « Critères ciblés /
    // Objectif visé » n'est PAS rendue — la carte entière, « Suggérer » compris, qui ne sait partir que d'un critère
    // coché. Masquée, pas supprimée : un besoin semblable peut revenir. Hors service, rien ne change. Conteneur
    // absent ⇒ sauvegarderPresencesIntervention ne touche ni `criteresCibles` ni `objectifVise`.
    container.innerHTML = `
        <div class="carte" data-fiche-intervention="${echapperHtml(interventionId)}">
            <h3 style="margin: 0 0 20px 0;">${options.modeCreation ? V().titreNouvelle : echapperHtml(_titreAffiche(intervention))}</h3>

            <!-- Section informations éditables -->
            <div class="intervention-grid-1-09">
                <!-- Colonne gauche : Informations de base -->
                <div>
                    <!-- Ligne 1 : Titre + Niveau RàI -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionTitre" class="label-formulaire">Titre :</label>
                            <input type="text" id="interventionTitre" class="controle-form" required
                                   ${_texteLibreMasque() ? _attributsTexteLibre('') : 'value="' + echapperHtml(intervention.titre) + '" placeholder="' + echapperHtml(V().placeholderTitre) + '"'}>
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionNiveau" class="label-formulaire">${V().labelNiveau}</label>
                            <select id="interventionNiveau" class="controle-form" required
                                    data-on-change="gererVisibiliteContexteIntervention">
                                <option value="2" ${intervention.niveauRai === 2 ? 'selected' : ''}>${V().niveau2}</option>
                                <option value="3" ${intervention.niveauRai === 3 ? 'selected' : ''}>${V().niveau3}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Contexte niveau 2 -->
                    <div id="interventionContexteBloc" style="margin-bottom: 15px;">
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionContexte" class="label-formulaire">Contexte de l\u2019intervention :</label>
                            <select id="interventionContexte" class="controle-form" required
                                    data-on-change="gererVisibiliteContexteIntervention">
                                <option value="rattrapage" ${contexteExistant === 'rattrapage' ? 'selected' : ''}>S\u00e9ance de rattrapage \u2014 les non-participants ont cong\u00e9</option>
                                <option value="en-classe" ${contexteExistant === 'en-classe' ? 'selected' : ''}>Petit groupe cibl\u00e9 pendant le cours r\u00e9gulier</option>
                            </select>
                        </div>
                    </div>

                    <!-- Ligne 2 : Date, Heure, Durée -->
                    <div class="intervention-grid-3col">
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionDate" class="label-formulaire">Date :</label>
                            <input type="date" id="interventionDate" class="controle-form" required value="${echapperHtml(intervention.date)}">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionHeure" class="label-formulaire">Heure :</label>
                            <input type="time" id="interventionHeure" class="controle-form" value="${echapperHtml(intervention.heure || '')}">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionDuree" class="label-formulaire">Dur\u00e9e (p\u00e9riodes) :</label>
                            <input type="number" id="interventionDuree" class="controle-form" min="0.5" max="4" step="0.5" value="${intervention.duree || 2}" required>
                        </div>
                    </div>

                    <!-- Ligne 3 : Description -->
                    <div class="champ-formulaire u-m-0">
                        <label for="interventionDescription" class="label-formulaire">Description (optionnel) :</label>
                        <textarea id="interventionDescription" class="controle-form" rows="3"
                                  ${_attributsTexteLibre("Objectifs de l'intervention, sujets abord\u00e9s\u2026")}>${_valeurTexteLibre(intervention.description)}</textarea>
                    </div>
                </div>

                <!-- Colonne droite : Statut + gestion des absences -->
                <div>
                    <div class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0 0 15px 0;">
                        <h4 style="margin: 0 0 10px 0; color: var(--accent-primaire);">Statut de l\u2019intervention</h4>
                        <div class="champ-formulaire u-m-0">
                            <div style="display: flex; gap: 15px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="interventionStatut" value="en-cours" ${intervention.statut !== 'completee' ? 'checked' : ''} style="width: auto; margin: 0;">
                                    <span class="u-texte-09">En pr\u00e9paration</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="interventionStatut" value="completee" ${intervention.statut === 'completee' ? 'checked' : ''} style="width: auto; margin: 0;">
                                    <span class="u-texte-09">Compl\u00e9t\u00e9e</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div id="interventionAbsencesBloc" class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0; height: fit-content;">
                        <h4 style="margin: 0 0 10px 0; color: var(--accent-primaire);" data-tooltip="interv-gestion-absences">Gestion des absences</h4>
                        <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                            Les \u00e9tudiant\u00b7es non s\u00e9lectionn\u00e9\u00b7es pour cette s\u00e9ance de rattrapage
                            b\u00e9n\u00e9ficieront d\u2019un cong\u00e9 (absence motiv\u00e9e).
                        </p>
                    </div>
                </div>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--bordure-claire);">

            <div style="display: grid; grid-template-columns: 40fr 60fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                <!-- Colonne gauche: Aperçu du sous-groupe (40%) -->
                <div>
                    <h4 data-tooltip="interv-apercu-sous-groupe">${V().titreApercu}</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cette agrégation des profils des étudiant·es vise à éclairer ta préparation.
                    </p>
                    <div id="analyseTempsReel"></div>
                </div>

                <!-- Colonne droite: Liste des étudiants avec notes (60%) -->
                <div>
                    <h4 data-tooltip="interv-presences-notes">${V().titrePresences}</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        ${V().aidePresences}
                    </p>

                    <div id="listeEtudiantsIntervention" class="liste-etudiants-intervention">
                        ${listeHtml}
                    </div>
                </div>
            </div>

            ${_surService() ? '' : `
            <!-- Critères ciblés et objectif visé -->
            <div class="carte" style="margin-bottom: 20px;">
                <h4 class="intervention-mt-0" data-tooltip="interv-criteres-cibles">Critères ciblés</h4>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 10px;">
                    Sur quoi porte l'intervention ? Pré-cochés selon les défis communs du sous-groupe.
                </p>
                <div id="criteresCiblesContainer">
                    ${criteresInitHtml}
                </div>

                <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--bordure-claire);">

                <h4 class="intervention-mt-0" data-tooltip="interv-objectif-vise">Objectif visé</h4>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 10px;">
                    Qu'espères-tu voir changer à la suite de cette intervention ?
                </p>
                <div style="display: flex; gap: 10px; align-items: start;">
                    <input type="text" id="objectifVise" class="controle-form" style="flex: 1;"
                           value="${echapperHtml(intervention.objectifVise || '')}"
                           placeholder="Ex. Amener un critère au seuil visé">
                    <button data-action="suggererObjectifIntervention" data-param="${interventionId}" class="btn btn-secondaire" style="white-space: nowrap;">Suggérer</button>
                </div>
            </div>
            `}

            <!-- Observations générales (pleine largeur) -->
            <div class="carte" style="margin-bottom: 20px;">
                <h4 class="intervention-mt-0">Observations générales</h4>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 10px;">
                    Note tes observations durant l'intervention (stratégies à nouveau enseignées, réception du groupe...)
                </p>
                <!-- #733 — règle 1 : texte libre de l'enseignant (ou importé) dans du HTML → echapperHtml, comme le bilan plus bas -->
                <textarea id="observationsIntervention" class="controle-form" rows="6" ${_attributsTexteLibre('Ex. Stratégie de lecture n°3…')}>${_valeurTexteLibre(intervention.observations)}</textarea>
            </div>

            ${(() => {
                // Section Bilan — visible uniquement quand statut = complétée
                if (intervention.statut !== 'completee') return '';

                // Tableau comparatif avant/après sur les critères ciblés
                var bilanTableau = '';
                if (intervention.snapshotAvant && intervention.criteresCibles && intervention.criteresCibles.length > 0) {
                    var clesGrilleBilan = clesCriteresGrilleReference();
                    var lignes = intervention.criteresCibles.map(function(nom) {
                        // #553 — la clé est le nom normalisé ENTIER, comme dans `calculerMoyennesCriteres`.
                        var cleNorm = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

                        // Moyenne avant (snapshot) et après (actuel) sur les DAs de l'intervention
                        var totalAvant = 0, countAvant = 0, totalApres = 0, countApres = 0;
                        (intervention.etudiants || []).forEach(function(da) {
                            var snap = intervention.snapshotAvant[da];
                            var valeurAvant = lireCritereSnapshotIntervention(snap && snap.criteres, cleNorm, clesGrilleBilan);
                            if (valeurAvant !== null) {
                                totalAvant += valeurAvant;
                                countAvant++;
                            }
                            var moyActuelles = typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null;
                            if (moyActuelles && typeof moyActuelles[cleNorm] === 'number') {
                                totalApres += moyActuelles[cleNorm];
                                countApres++;
                            }
                        });
                        var avant = countAvant > 0 ? totalAvant / countAvant : null;
                        var apres = countApres > 0 ? totalApres / countApres : null;

                        if (avant === null && apres === null) return '';

                        // Lot 5 du cadrage 11 (12 sept. 2026, audit du 6 sept. I-5, produit de #742) : la lettre
                        // sort de la fonction qu'emploie le reste de l'application (seuils idme.insuffisant /
                        // idme.developpement / idme.maitrise — 0,64 / 0,75 / 0,85 par défaut), calculée sur le
                        // pourcentage AFFICHÉ à côté d'elle. Avant : 0,65 / 0,75 / 0,85 en clair, et un arrondi
                        // indépendant — « I 65 % » sur l'écran où la suggestion disait « seuil D (64 %) ». La
                        // SOURCE change, pas les bornes (#821, #822). Qu'un bilan traduise une moyenne en lettre
                        // reste une règle, citée (#742). Garde de chargement seulement : sans la fonction, pas de
                        // lettre inventée.
                        var pctAvant = avant !== null ? Math.round(avant * 100) : null;
                        var pctApres = apres !== null ? Math.round(apres * 100) : null;
                        var lettre = function(pct) {
                            return (pct !== null && typeof obtenirNiveauIDMEDepuisPourcentage === 'function')
                                ? obtenirNiveauIDMEDepuisPourcentage(pct) : '—';
                        };
                        var niveauAvant = lettre(pctAvant);
                        var niveauApres = lettre(pctApres);
                        var delta = (avant !== null && apres !== null) ? Math.round((apres - avant) * 100) : null;
                        var deltaTexte = delta !== null ? ((delta >= 0 ? '+' : '') + formaterPoints(delta, 0)) : '—';
                        var deltaFleche = delta !== null ? (delta > 0 ? ' ↗' : delta < 0 ? ' ↘' : ' →') : '';
                        var deltaCouleur = delta !== null ? (delta > 0 ? 'var(--vert-succes)' : delta < 0 ? 'var(--orange-attention, #e8a838)' : 'var(--gris-moyen)') : 'var(--gris-moyen)';

                        return '<tr>' +
                            '<td style="padding: 6px 12px; font-weight: 500;">' + echapperHtml(nom) + '</td>' +
                            '<td style="padding: 6px 12px; text-align: center;">' + niveauAvant + ' ' + (pctAvant !== null ? formaterPourcentage(pctAvant) : '') + '</td>' +
                            '<td style="padding: 6px 12px; text-align: center;">' + niveauApres + ' ' + (pctApres !== null ? formaterPourcentage(pctApres) : '') + '</td>' +
                            '<td style="padding: 6px 12px; text-align: center; color: ' + deltaCouleur + '; font-weight: 600;">' + deltaTexte + deltaFleche + '</td>' +
                            '</tr>';
                    }).join('');

                    if (lignes) {
                        bilanTableau = '<table class="tableau-simple" style="font-size: 0.9rem; margin-bottom: 15px; width: 100%;">' +
                            '<thead><tr><th style="padding: 6px 12px;">Critère</th><th style="padding: 6px 12px; text-align: center;">Avant</th><th style="padding: 6px 12px; text-align: center;">Après</th><th style="padding: 6px 12px; text-align: center;">Évolution</th></tr></thead>' +
                            '<tbody>' + lignes + '</tbody></table>';
                    }
                } else if (!intervention.snapshotAvant) {
                    bilanTableau = '<p class="text-muted" style="font-style: italic; font-size: 0.9rem;">Données de référence non disponibles (intervention créée avant la mise à jour).</p>';
                }

                var bilan = intervention.bilan || {};
                return '<div class="carte" style="margin-bottom: 20px;">' +
                    '<h4 class="intervention-mt-0" data-tooltip="interv-bilan">' + V().titreBilan + '</h4>' +
                    '<p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">' + V().aideBilan + '</p>' +
                    bilanTableau +
                    '<div style="margin-bottom: 15px;">' +
                        '<label class="label-formulaire">Objectif atteint ?</label>' +
                        '<div style="display: flex; gap: 15px; margin-top: 5px;">' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanAtteint" value="oui" ' + (bilan.atteint === 'oui' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Oui</label>' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanAtteint" value="partiellement" ' + (bilan.atteint === 'partiellement' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Partiellement</label>' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanAtteint" value="non" ' + (bilan.atteint === 'non' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Non</label>' +
                        '</div>' +
                    '</div>' +
                    '<div style="margin-bottom: 15px;">' +
                        '<label class="label-formulaire">Suite envisagée</label>' +
                        '<div style="display: flex; gap: 15px; margin-top: 5px; flex-wrap: wrap;">' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanSuite" value="reconduire" ' + (bilan.suite === 'reconduire' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Reconduire</label>' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanSuite" value="ajuster" ' + (bilan.suite === 'ajuster' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Ajuster</label>' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanSuite" value="referer" ' + (bilan.suite === 'referer' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Référer</label>' +
                            '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="radio" name="bilanSuite" value="aucune" ' + (bilan.suite === 'aucune' ? 'checked' : '') + ' style="width: auto; margin: 0;"> Aucune action</label>' +
                        '</div>' +
                    '</div>' +
                    '<div>' +
                        '<label for="observationsBilan" class="label-formulaire">Observations de bilan</label>' +
                        '<textarea id="observationsBilan" class="controle-form" rows="3" ' + _attributsTexteLibre("Réflexions sur l'intervention, ajustements à apporter…") + '>' + _valeurTexteLibre(bilan.observationsBilan) + '</textarea>' +
                    '</div>' +
                '</div>';
            })()}

            <!-- Lot E3 (D3) : une intervention existante s'enregistre toute seule ; le bouton qui crée
                 ne paraît que sur un brouillon. -->
            <div class="actions-fiche-intervention" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button data-action="fermerFicheIntervention" data-param="${interventionId}" class="btn btn-secondaire">Fermer</button>
                ${_estBrouillon(interventionId)
                    ? '<button data-action="sauvegarderPresencesIntervention" data-param="' + interventionId + '" class="btn btn-principal">' + echapperHtml(V().creer) + '</button>'
                    : ''}
            </div>
        </div>
    `;

    // Lot E3 (D3) : l'écouteur unique de la fiche (un nœud neuf à chaque rendu : rien ne s'empile).
    const fiche = container.querySelector('[data-fiche-intervention]');
    if (fiche && typeof fiche.addEventListener === 'function') {
        fiche.addEventListener('change', (e) => { surChangementFicheIntervention(interventionId, e.target); });
    }

    // Initialiser la visibilité des blocs contexte/absences
    gererVisibiliteContexteIntervention();

    // Pré-sélection et analyse initiale
    setTimeout(function() {
        // Pré-cocher le DA si fourni (mode création depuis le profil)
        if (options.daPreselectionne) {
            var cb = document.getElementById('etud-' + options.daPreselectionne);
            if (cb && !cb.checked) {
                cb.checked = true;
            }
        }
        // Afficher l'analyse si des étudiants sont cochés
        var checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
        if (checkboxes.length > 0) {
            afficherAnalyseTempsReel(interventionId);
            mettreAJourCriteresCibles(interventionId);
        }
    }, 100);
}

/**
 * Afficher l'analyse en temps réel du sous-groupe sélectionné
 * @param {string} interventionId - ID de l'intervention
 */
function afficherAnalyseTempsReel(interventionId) {
    const checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    const dasSelectionnes = Array.from(checkboxes).map(cb => cb.value);

    const analyseDiv = document.getElementById('analyseTempsReel');

    if (dasSelectionnes.length === 0) {
        analyseDiv.innerHTML = '<p class="text-muted" style="font-style: italic;">Coche des étudiant·es pour voir l\'analyse du sous-groupe.</p>';
        return;
    }

    const analyse = analyserSousGroupe(dasSelectionnes);
    analyseDiv.innerHTML = genererAffichageAnalyseCartes(analyse);
}

/**
 * Handler combiné appelé quand l'enseignant coche/décoche un étudiant.
 * Met à jour l'analyse du sous-groupe ET les critères ciblés.
 * @param {string} interventionId - ID de l'intervention
 */
function onChangementSelectionEtudiants(interventionId) {
    afficherAnalyseTempsReel(interventionId);
    mettreAJourCriteresCibles(interventionId);
}

/**
 * #553 — Les clés (noms normalisés entiers) des critères de la grille de référence du dépistage.
 * Sert à la lecture tolérante du stock : savoir COMBIEN de critères commencent par « francais ».
 * @returns {string[]} vide si la grille est introuvable
 */
function clesCriteresGrilleReference() {
    var grille = typeof obtenirGrilleReferenceDepistage === 'function' ? obtenirGrilleReferenceDepistage() : null;
    if (!grille || !Array.isArray(grille.criteres)) return [];
    return grille.criteres
        .filter(function(c) { return c && c.nom; })
        .map(function(c) {
            return String(c.nom).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
        });
}

/**
 * #553 — Lit la valeur « avant » d'un critère dans le stock d'une intervention (`snapshotAvant[da].criteres`).
 *
 * TARIR N'EST PAS RÉPARER. Jusqu'à la 1.152.2, la clé d'un critère dont le nom commence par
 * « Français » était rabotée en `francais` avant d'être enregistrée. La source est tarie (la clé est
 * maintenant le nom normalisé entier) ; le stock, lui, reste tel quel chez les gens et n'est JAMAIS
 * réécrit. Il est lu avec tolérance :
 *   · la clé exacte d'abord ;
 *   · sinon l'ancienne clé `francais` — à condition qu'UN SEUL critère de la grille commence par
 *     « francais » ET que ce soit le critère demandé. Avec deux candidats (oral, écrit),
 *     l'ancienne valeur était celle du dernier écrasant l'autre : on ne sait pas à qui elle est,
 *     donc on n'apparie rien plutôt que d'inventer une valeur.
 *
 * @param {Object|null} criteresSnap - `snapshotAvant[da].criteres`
 * @param {string} cleNorm - nom normalisé entier du critère ciblé
 * @param {string[]} clesGrille - clés des critères de la grille de référence
 * @returns {number|null}
 */
function lireCritereSnapshotIntervention(criteresSnap, cleNorm, clesGrille) {
    if (!criteresSnap) return null;
    if (typeof criteresSnap[cleNorm] === 'number') return criteresSnap[cleNorm];
    if (typeof criteresSnap.francais !== 'number') return null;
    var candidats = (clesGrille || []).filter(function(k) { return k.indexOf('francais') === 0; });
    if (candidats.length !== 1 || candidats[0] !== cleNorm) return null;
    return criteresSnap.francais;
}

/**
 * Met à jour les critères ciblés selon les défis communs des étudiants sélectionnés.
 * Pré-coche les critères en défi commun et affiche le compteur par critère.
 * @param {string} interventionId - ID de l'intervention
 */
function mettreAJourCriteresCibles(interventionId) {
    var container = document.getElementById('criteresCiblesContainer');
    if (!container) return;

    var checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    var dasSelectionnes = Array.from(checkboxes).map(function(cb) { return cb.value; });
    var nbEtudiants = dasSelectionnes.length;

    if (nbEtudiants === 0) {
        // Réinitialiser les compteurs
        var counts = container.querySelectorAll('.critere-defi-count');
        counts.forEach(function(el) { el.textContent = ''; });
        return;
    }

    // Récupérer le seuil de défi configurable
    // #555 lot 2 (28 août 2026) — le `|| 0.70` confondait DEUX cas sous un seul
    // opérateur : la fonction absente (garde de chargement, réelle en test —
    // `interpretation-config.js` est chargé avant ce fichier en production) et
    // une valeur falsy rendue par la fonction (repli de valeur, jamais atteint,
    // qui aurait écrasé un 0 délibéré). Séparés : la garde subsiste, le repli
    // de valeur est retiré. Le 0,70 ci-dessous MIROITE `SEUILS_PAR_DEFAUT` et ne
    // doit jamais en diverger — verrouillé par la sentinelle #555 des replis.
    var seuilDefi = typeof obtenirSeuil === 'function'
        ? obtenirSeuil('defiSpecifique')
        : 0.70;

    // Compter combien d'étudiants sont en défi pour chaque critère
    var defisParCritere = {};
    dasSelectionnes.forEach(function(da) {
        var moyennes = typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null;
        if (!moyennes) return;
        Object.keys(moyennes).forEach(function(cle) {
            if (typeof moyennes[cle] === 'number' && moyennes[cle] < seuilDefi) {
                if (!defisParCritere[cle]) defisParCritere[cle] = 0;
                defisParCritere[cle]++;
            }
        });
    });

    // Mettre à jour chaque checkbox critère
    var criteresCbs = container.querySelectorAll('.critere-cible-cb');
    criteresCbs.forEach(function(cb) {
        var nomCritere = cb.value;
        // Normaliser pour correspondre aux clés de calculerMoyennesCriteres
        var cleNorm = nomCritere.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

        var nbEnDefi = defisParCritere[cleNorm] || 0;
        var countSpan = cb.parentElement.querySelector('.critere-defi-count');
        if (countSpan) {
            countSpan.textContent = nbEnDefi > 0 ? '— ' + nbEnDefi + '/' + nbEtudiants + ' en défi' : '';
            countSpan.style.color = nbEnDefi > nbEtudiants / 2 ? 'var(--orange-attention, #e8a838)' : 'var(--gris-moyen)';
        }

        // Pré-cocher les critères en défi — seulement sur un brouillon : une intervention enregistrée garde
        // les critères que l'enseignant a choisis.
        if (_estBrouillon(interventionId)) {
            cb.checked = nbEnDefi > 0;
        }
    });
}

/**
 * Génère une suggestion d'objectif basée sur les critères ciblés et le profil du sous-groupe.
 * @param {string} interventionId - ID de l'intervention
 */
function suggererObjectifIntervention(interventionId) {
    var objectifField = document.getElementById('objectifVise');
    if (!objectifField) return;

    var checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    var dasSelectionnes = Array.from(checkboxes).map(function(cb) { return cb.value; });

    if (dasSelectionnes.length === 0) {
        _poserObjectif(objectifField, '');
        return;
    }

    // Trouver le critère ciblé le plus faible
    var criteresCibles = Array.from(document.querySelectorAll('.critere-cible-cb:checked')).map(function(cb) { return cb.value; });
    if (criteresCibles.length === 0) {
        _poserObjectif(objectifField, '');
        return;
    }

    // #551, garde seule (13 sept. 2026) — la même séparation que `seuilDefi` plus haut (#555 lot 2) : la garde
    // de chargement subsiste, le repli de valeur est retiré — un seuil délibérément réglé à 0 reste 0. Les 0,75
    // et 0,64 MIROITENT `SEUILS_PAR_DEFAUT.idme`, verrouillés par la sentinelle #555 des replis.
    var seuilDeveloppement = typeof obtenirSeuil === 'function' ? obtenirSeuil('idme.developpement') : 0.75;
    var seuilInsuffisant = typeof obtenirSeuil === 'function' ? obtenirSeuil('idme.insuffisant') : 0.64;

    // Calculer la moyenne du sous-groupe pour chaque critère ciblé
    var plusFaible = null;
    var scorePlusFaible = 1;
    criteresCibles.forEach(function(nom) {
        var cleNorm = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

        var total = 0;
        var count = 0;
        dasSelectionnes.forEach(function(da) {
            var moyennes = typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null;
            if (moyennes && typeof moyennes[cleNorm] === 'number') {
                total += moyennes[cleNorm];
                count++;
            }
        });
        var moyenne = count > 0 ? total / count : 0;
        if (moyenne < scorePlusFaible) {
            scorePlusFaible = moyenne;
            plusFaible = nom;
        }
    });

    if (!plusFaible) return;

    // Déterminer le prochain seuil atteignable. Le texte dit le pourcentage sans nommer de niveau (#551) : D et M
    // étaient les lettres de l'échelle de Grégoire, et cette phrase s'enregistre dans le dossier de l'élève.
    // Textes approuvés par Grégoire le 13 sept. 2026, au caractère près.
    var suggestion = '';
    if (scorePlusFaible < seuilInsuffisant) {
        suggestion = 'Amener ' + plusFaible + ' à ' + formaterPourcentage(Math.round(seuilInsuffisant * 100));
    } else if (scorePlusFaible < seuilDeveloppement) {
        suggestion = 'Amener ' + plusFaible + ' à ' + formaterPourcentage(Math.round(seuilDeveloppement * 100));
    } else {
        suggestion = 'Stabiliser ' + plusFaible + ' au-dessus de ' + formaterPourcentage(Math.round(seuilDeveloppement * 100));
    }

    _poserObjectif(objectifField, suggestion);
}

/** Lot E3 (D3) : une valeur posée par script n'émet aucun « change » ; sans lui, l'objectif suggéré ne
 * s'enregistrerait pas sur une intervention existante. */
function _poserObjectif(champ, valeur) {
    champ.value = valeur;
    if (typeof champ.dispatchEvent === 'function' && typeof Event === 'function') {
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

/**
 * Lot E3 (D3) — ce que le formulaire dit, posé sur l'intervention EN MÉMOIRE ; l'appelant écrit.
 * Le corps de l'ancien « Enregistrer », inchangé : #772 (ce que le formulaire n'a pas montré n'est pas
 * touché), lot A (un texte masqué en anonymisation ne s'écrit pas), lot C (critères absents sur un
 * service), lot D (le contexte au premier geste).
 * @param {Object} intervention
 */
function _poserFormulaireSurIntervention(intervention) {
    const checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    const dasSelectionnes = Array.from(checkboxes).map(cb => cb.value);
    // #772 (6 sept. 2026) — ce que le formulaire n'a pas MONTRÉ n'est pas touché. Le formulaire ne construit
    // des cases que pour les élèves du groupe-cours actif : les participants d'un autre groupe-cours (une
    // intervention planifiée sous GC2, rouverte sous GC1) restaient invisibles et étaient retirés, avec leurs
    // notes, par un simple « Enregistrer ». On distingue donc les DA affichés (cochés ou non) des autres.
    const dasAffiches = Array.from(document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]')).map(cb => cb.value);
    const observationsField = document.getElementById('observationsIntervention');

    // Lire le statut depuis les boutons radio
    const statutRadio = document.querySelector('input[name="interventionStatut"]:checked');
    const nouveauStatut = statutRadio ? statutRadio.value : 'en-cours';

    // Les présences (etudiants et analyse) : les cochés du formulaire, plus les participants que le
    // formulaire n'a pas montrés (#772).
    const participantsNonAffiches = (intervention.etudiants || []).filter(da => !dasAffiches.includes(da));
    _appliquerPresences(intervention, [...new Set(participantsNonAffiches.concat(dasSelectionnes))]);

    // Dériver contexte, type et absences depuis le formulaire
    var niveauSave = parseInt(document.getElementById('interventionNiveau').value);
    var contexteElSave = document.getElementById('interventionContexte');
    // Sur un service, le contexte de classe n'existe pas : hors-classe, quel que soit le niveau (cadrage § C).
    var contexteSave = (niveauSave === 2 && contexteElSave && !_surService()) ? contexteElSave.value : 'hors-classe';
    var typeSave = 'groupe';
    if (contexteSave === 'mio') typeSave = 'mio';
    else if (niveauSave === 3) typeSave = 'individuel';

    // Mettre à jour les informations de base
    intervention.titre = _texteDuChamp(document.getElementById('interventionTitre'), intervention.titre);
    intervention.date = document.getElementById('interventionDate').value;
    intervention.heure = document.getElementById('interventionHeure').value;
    intervention.duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
    intervention.niveauRai = niveauSave;
    intervention.contexte = contexteSave;
    intervention.type = typeSave;
    intervention.description = _texteDuChamp(document.getElementById('interventionDescription'), intervention.description);

    // Absences seulement si rattrapage
    // #1152, retouche 2 du lot 5 : `seanceConcernee` n'est plus écrite ; une intervention qui la porte la garde.
    if (contexteSave === 'rattrapage') {
        intervention.marquerNonParticipantsMotives = true;
    } else {
        intervention.marquerNonParticipantsMotives = false;
    }

    // Mettre à jour le statut
    intervention.statut = nouveauStatut;

    // Mettre à jour observations
    intervention.observations = _texteDuChamp(observationsField, intervention.observations);

    // Notes individuelles (#772) : on part de celles en base et on n'écrit que ce que le formulaire a
    // montré — un champ affiché vide efface la note, un champ affiché rempli la pose (coché ou non) ;
    // les DA sans champ (autre groupe-cours, élève parti) gardent la leur.
    const notesIndividuelles = Object.assign({}, intervention.notesIndividuelles || {});
    dasAffiches.forEach(da => {
        const noteField = document.getElementById(`note-${da}`);
        // Masqué en anonymisation : la note en base reste telle quelle.
        if (!noteField || noteField.dataset.masqueAnonymisation === '1') return;
        const texte = noteField.value.trim();
        if (texte) notesIndividuelles[da] = texte;
        else delete notesIndividuelles[da];
    });
    intervention.notesIndividuelles = notesIndividuelles;

    // Snapshot incrémental par étudiant (Phase 4 — PT-2 + PT-3)
    if (!intervention.snapshotAvant) intervention.snapshotAvant = {};
    dasSelectionnes.forEach(function(da) {
        if (!intervention.snapshotAvant[da]) {
            var indicesSnap = typeof calculerTousLesIndices === 'function' ? calculerTousLesIndices(da) : null;
            var moyennesSnap = typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null;
            var criteresSnap = {};
            if (moyennesSnap) {
                Object.keys(moyennesSnap).forEach(function(k) {
                    if (typeof moyennesSnap[k] === 'number') criteresSnap[k] = moyennesSnap[k];
                });
            }
            // #777 (15 oct. 2026) : une note non constructible s'écrit `null` (« non calculable »), plus le 0 que
            // `calculerTousLesIndices` rend avec `noteConstructible: false` (#394). Aucun écran ne lit ce P aujourd'hui
            // (le bilan lit `criteres`) ; ce qui est déjà écrit reste tel quel.
            intervention.snapshotAvant[da] = {
                P: (indicesSnap && indicesSnap.noteConstructible !== false) ? indicesSnap.P : null,
                criteres: criteresSnap
            };
        }
    });

    // Sauvegarder les critères ciblés et l'objectif (Phase 3). Lot C du 12 sept. : sur un service, leur carte
    // n'est pas rendue — conteneur ou champ ABSENT ⇒ on ne touche pas au champ : ce qui est en base y reste
    // (une liste vide lue dans un conteneur absent effacerait des critères que personne n'a décochés).
    if (document.getElementById('criteresCiblesContainer')) {
        var criteresCiblesCbs = document.querySelectorAll('#criteresCiblesContainer .critere-cible-cb:checked');
        intervention.criteresCibles = Array.from(criteresCiblesCbs).map(function(cb) { return cb.value; });
    }
    var objectifField = document.getElementById('objectifVise');
    if (objectifField) intervention.objectifVise = objectifField.value;

    // Sauvegarder le bilan si l'intervention est complétée (Phase 4)
    if (nouveauStatut === 'completee') {
        var bilanAtteintRadio = document.querySelector('input[name="bilanAtteint"]:checked');
        var bilanSuiteRadio = document.querySelector('input[name="bilanSuite"]:checked');
        var observationsBilanField = document.getElementById('observationsBilan');
        intervention.bilan = {
            atteint: bilanAtteintRadio ? bilanAtteintRadio.value : null,
            suite: bilanSuiteRadio ? bilanSuiteRadio.value : null,
            observationsBilan: _texteDuChamp(observationsBilanField, (intervention.bilan || {}).observationsBilan),
            dateBilan: Date.now()
        };
    }

    // Lot 5 : le drapeau `jamaisSauvegardee` n'existe plus (le brouillon vit en mémoire). Une intervention
    // du stock qui le porte encore (à false) le perd ici, à son propre Enregistrer — jamais en masse.
    delete intervention.jamaisSauvegardee;

    // Lot D : une intervention d'avant le lot prend son contexte au premier Enregistrer
    // qui la touche — celui où l'enseignant la rouvre. Jamais réécrite en masse.
    if (!intervention.groupeCoursId) {
        const contexteNaissance = obtenirIdContexteActif();
        if (contexteNaissance) intervention.groupeCoursId = contexteNaissance;
    }

    intervention.dateModification = Date.now();
}

/**
 * Lot E3 (D3, D0 point 2) — L'ÉCRIVAIN UNIQUE DE LA FICHE, pour créer comme pour modifier.
 *
 * · Un brouillon (« Planifier ») n'entre en base qu'ici, par « Créer l'intervention » / « Créer la
 *   rencontre » (lot 5 du cadrage 11) ; le message de la création suit l'écriture ; la fiche se rouvre,
 *   existante.
 * · Une intervention existante s'enregistre toute seule, champ par champ (`surChangementFicheIntervention`) :
 *   aucun message, la fiche reste ouverte ; le témoin commun parle.
 *
 * ⚠⚠ LE REPORT VERS LES PRÉSENCES (`transfererPresencesVersModule`) n'a lieu qu'au PASSAGE à « Complétée »
 * (ou à la création d'une intervention déjà complétée), ET SEULEMENT SI L'USAGER L'A CHOISI : la case
 * « Reporter les présences… » de la question de complétion, décochée par défaut. Décision de Grégoire
 * (28 sept., 19 h 43) : « la compensation d'une absence par la présence à une intervention est laissée à
 * la discrétion de l'usager ». Sans ce choix (`options.reporter !== true`), rien ne s'écrit dans les
 * présences : ni présence RàI, ni absence motivée de rattrapage.
 * Avant ce lot, chaque « Enregistrer » d'une intervention complétée relançait le report ; une date
 * corrigée en laissait à l'ancienne date (`ajouterPresencesIntervention` ajoute, ne retire jamais).
 * Aucune présence déjà écrite n'est touchée (le passé reste tel quel, Grégoire, 19 h 45).
 *
 * @param {string} interventionId
 * @param {{reporter: boolean}} [options] - la réponse à la question de complétion
 * @returns {boolean|Promise<boolean>} true si l'intervention a été écrite ; une promesse quand la
 *   création d'une intervention déjà complétée doit d'abord poser la question
 */
function sauvegarderPresencesIntervention(interventionId, options) {
    const creation = _estBrouillon(interventionId);
    // Créer une intervention déjà « Complétée » : la même question qu'au passage, AVANT toute écriture.
    if (creation && options === undefined && _statutDuFormulaire() === 'completee' && !_mioDuFormulaire()) {
        return _demanderReport().then(reponse => (reponse ? sauvegarderPresencesIntervention(interventionId, reponse) : false));
    }
    // La collection lue est COPIÉE avant d'être modifiée (lot E2, R1) : `db.getSync` peut rendre l'objet
    // de son cache, et une écriture qui échoue le laisserait faux en mémoire.
    const interventions = JSON.parse(JSON.stringify(obtenirInterventions()));
    let index = interventions.findIndex(i => i.id === interventionId);
    if (index === -1 && creation) {
        interventions.push(JSON.parse(JSON.stringify(_brouillon)));
        index = interventions.length - 1;
    }

    // Relecture croisée de Cowork (12 sept. 2026, 13 h 10) : un id qui n'est ni en base ni le brouillon
    // n'écrit rien, et le dit (lot E3 : par le témoin).
    const geste = creation ? V().creer : V().modifier;
    if (index === -1) {
        console.error('Interventions : rien d\'enregistré — id ni en base ni en brouillon :', interventionId);
        if (window.temoinEnregistrement) window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(V().introuvable), geste, cle('interventions'));
        return false;
    }

    const ancienStatut = creation ? null : interventions[index].statut;
    _poserFormulaireSurIntervention(interventions[index]);
    const nouveauStatut = interventions[index].statut;

    if (!sauvegarderDonneesSelonMode('interventions', interventions, { geste })) return false;
    if (creation) _brouillon = null;

    // Le report, au seul passage à « Complétée », et seulement si la case est cochée (voir l'en-tête).
    if (nouveauStatut === 'completee' && ancienStatut !== 'completee' && options && options.reporter === true) {
        transfererPresencesVersModule(interventionId);
    }

    if (creation) {
        notifications.succes(V().creee);
        ouvrirIntervention(interventionId);
    } else if (nouveauStatut !== ancienStatut) {
        // Le bilan paraît (ou disparaît) avec « Complétée ».
        ouvrirIntervention(interventionId);
    }
    return true;
}

function _statutDuFormulaire() {
    const radio = document.querySelector('input[name="interventionStatut"]:checked');
    return radio ? radio.value : 'en-cours';
}

/** Un MIO n'écrit pas de présences : pas de question, pas de case. */
function _mioDuFormulaire() {
    const niveau = parseInt((document.getElementById('interventionNiveau') || {}).value, 10);
    const contexte = (document.getElementById('interventionContexte') || {}).value;
    return niveau === 2 && contexte === 'mio' && !_surService();
}

/**
 * La question de complétion, avec sa case DÉCOCHÉE par défaut (mots de Grégoire, 28 sept., 19 h 46).
 * Pour un rattrapage (les non-participant·es reçoivent une absence motivée), la case le dit aussi.
 * @returns {Promise<{reporter: boolean}|null>} null si « Annuler »
 */
async function _demanderReport() {
    if (!window.uiDialogues) return { reporter: false };   // sans question, aucun report
    const contexte = (document.getElementById('interventionContexte') || {}).value;
    const niveau = parseInt((document.getElementById('interventionNiveau') || {}).value, 10);
    const rattrapage = niveau === 2 && contexte === 'rattrapage' && !_surService();
    const texte = rattrapage
        ? V().caseReport.replace(/\.$/, '') + ' ; les non-participant·es auront une absence motivée.'
        : V().caseReport;
    const reponse = await window.uiDialogues.confirmerAction({
        titre: V().completerTitre,
        caseACocher: { texte: texte, aide: V().caseReportUneFois },
        texteAnnuler: 'Annuler',
        texteConfirmer: 'Marquer complétée'
    });
    return reponse ? { reporter: reponse.coche === true } : null;
}

/**
 * Lot E3 (D3) — un changement dans la fiche. En création, rien n'est écrit avant le bouton. Sur une
 * intervention existante, l'écrivain unique ; le passage à « Complétée » pose d'abord la question, dont
 * la case (décochée) décide du report des présences (sauf un MIO, qui n'en écrit pas).
 * @param {string} interventionId
 * @param {Element} [champ]
 */
async function surChangementFicheIntervention(interventionId, champ) {
    // Les écouteurs du même changement agissent d'abord (contexte, analyse, critères pré-cochés).
    await new Promise(resolve => setTimeout(resolve, 0));
    if (_estBrouillon(interventionId)) return false;
    if (!document.querySelector('[data-fiche-intervention="' + interventionId + '"]')) return false;

    let options = { reporter: false };
    if (champ && champ.name === 'interventionStatut' && champ.value === 'completee') {
        const enBase = obtenirInterventions().find(i => i.id === interventionId);
        if (enBase && enBase.statut !== 'completee' && !_mioDuFormulaire()) {
            const reponse = await _demanderReport();
            if (!reponse) {
                const enPreparation = document.querySelector('input[name="interventionStatut"][value="en-cours"]');
                if (enPreparation) enPreparation.checked = true;
                return false;
            }
            options = reponse;
        }
    }
    return sauvegarderPresencesIntervention(interventionId, options);
}

/**
 * Transférer les présences d'une intervention vers le module presences.js
 * Cette fonction crée des entrées de présences facultatives pour TOUS les étudiants,
 * qu'ils aient participé ou non à l'intervention.
 *
 * @param {string} interventionId - ID de l'intervention
 */
function transfererPresencesVersModule(interventionId) {
    const intervention = obtenirIntervention(interventionId);
    if (!intervention) {
        console.error('❌ Intervention introuvable:', interventionId);
        return;
    }

    // Les MIO ne génèrent pas d'entrées de présences/absences
    if (intervention.type === 'mio') {
        return;
    }

    // Obtenir tous les étudiants du groupe (filtrés par groupe-cours actif)
    // Tier 6.4 : Utiliser l'API centralisée de saisie-presences.js
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');

    // #540 lot C : ces périodes-là entrent au NUMÉRATEUR de l'assiduité — une présence
    // écrite dans les données. Le repli `|| 2` en inventait deux quand l'intervention ne
    // disait rien. En pratique `_construireIntervention` pose toujours une durée, donc le repli
    // ne se déclenchait pas ; il n'en était pas moins une valeur métier en dur sur le
    // chemin d'écriture des présences. On refuse et on le dit, plutôt que de compter des
    // périodes que personne n'a saisies.
    const dureeIntervention = parseFloat(intervention.duree);
    if (!(dureeIntervention > 0)) {
        if (typeof notifications !== 'undefined' && notifications.erreur) {
            notifications.erreur(
                'Durée de l\'intervention manquante',
                'Indique sa durée en périodes avant de reporter les présences : c\'est elle qui est comptée à l\'assiduité.');
        }
        return;
    }
    const marquerMotives = intervention.marquerNonParticipantsMotives === true;

    // Construire les entrées de présence
    const entrees = [];
    let nbPresentsAjoutes = 0;
    let nbAbsentsAjoutes = 0;

    etudiants.forEach(etudiant => {
        const estPresent = intervention.etudiants.includes(etudiant.da);

        if (!marquerMotives && !estPresent) {
            return;
        }

        let heures, note;
        if (estPresent) {
            heures = dureeIntervention;
            note = `Intervention RàI : ${intervention.titre}`;
            nbPresentsAjoutes++;
        } else {
            heures = 0;
            note = 'Absence motivée RàI';
            nbAbsentsAjoutes++;
        }

        entrees.push({
            date: intervention.date,
            da: etudiant.da,
            heures: heures,
            notes: note,
            coursId: typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : undefined,
            facultatif: true
        });
    });

    // Écriture centralisée (inclut recalcul indices d'assiduité)
    if (typeof window.ajouterPresencesIntervention === 'function') {
        window.ajouterPresencesIntervention(entrees);
    } else {
        // Fallback si l'API n'est pas encore chargée
        console.warn('⚠️ ajouterPresencesIntervention non disponible — écriture directe');
        const clePresences = cle('presences');
        let presences = db.getSync(clePresences, []);
        entrees.forEach(e => presences.push(e));
        db.setSync(clePresences, presences);
        if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
            calculerEtSauvegarderIndicesAssiduite();
        }
    }

}

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialiser le module Interventions
 */
function initialiserModuleInterventions() {
    // Vérifier que les interventions existent pour ce trimestre
    if (!db.getSync(cle('interventions'), null)) {
        db.setSync(cle('interventions'), []);
    }

    // Observer les changements de visibilité de la sous-section
    const observer = new MutationObserver(() => {
        const sousSection = document.getElementById('suivi-interventions');
        if (sousSection && sousSection.classList.contains('active')) {
            definirVocabulaireInterventions('interventions');
            // Lot E3 : une création en cours reste à l'écran (voir interventionEnCreationAffichee).
            if (!interventionEnCreationAffichee()) afficherListeInterventions();
        }
    });

    // Observer les changements de classe sur toutes les sous-sections
    document.querySelectorAll('.sous-section').forEach(section => {
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });

    // Afficher la liste si la sous-section est déjà active
    const sousSection = document.getElementById('suivi-interventions');
    if (sousSection && sousSection.classList.contains('active')) {
        definirVocabulaireInterventions('interventions');
        afficherListeInterventions();
    }

}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Supprimer intervention avec confirmation + rafraichir liste */
async function supprimerInterventionEtRafraichir(interventionId) {
    // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
    if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression(_enVueRencontres() ? 'rencontre' : 'intervention'))) return;
    if (confirm(V().supprimer)) {
        supprimerIntervention(interventionId);
        afficherListeInterventions();
    }
}

// Exporter les fonctions publiques
window.obtenirInterventions = obtenirInterventions;
window.obtenirIntervention = obtenirIntervention;
window.obtenirInterventionsEtudiant = obtenirInterventionsEtudiant;
window.analyserSousGroupe = analyserSousGroupe;
window.supprimerIntervention = supprimerIntervention;
window.afficherListeInterventions = afficherListeInterventions;
window.afficherFormulaireIntervention = afficherFormulaireIntervention;
window.gererVisibiliteContexteIntervention = gererVisibiliteContexteIntervention;
window.fermerFicheIntervention = fermerFicheIntervention;                     // Lot E3 (D3)
window.surChangementFicheIntervention = surChangementFicheIntervention;       // Lot E3 (D3)
window.interventionEnCreationAffichee = interventionEnCreationAffichee;       // Lot E3 : rencontres.js, au retour
window.ouvrirIntervention = ouvrirIntervention;
window.onChangementSelectionEtudiants = onChangementSelectionEtudiants;
window.mettreAJourCriteresCibles = mettreAJourCriteresCibles;
window.lireCritereSnapshotIntervention = lireCritereSnapshotIntervention;   // #553 — pure, testée
window.clesCriteresGrilleReference = clesCriteresGrilleReference;
window.suggererObjectifIntervention = suggererObjectifIntervention;
window.sauvegarderPresencesIntervention = sauvegarderPresencesIntervention;
// terminerIntervention et rouvrirIntervention supprimés (Phase 5)
window.transfererPresencesVersModule = transfererPresencesVersModule;
window.initialiserModuleInterventions = initialiserModuleInterventions;
window.formaterDateLisible = formaterDateLisible;
window.genererBadgeStatut = genererBadgeStatut;
window.supprimerInterventionEtRafraichir = supprimerInterventionEtRafraichir;
window.interventionsDuContexteActif = interventionsDuContexteActif;
window.definirVocabulaireInterventions = definirVocabulaireInterventions;
window.afficherAnalyseTempsReel = afficherAnalyseTempsReel;


})();
