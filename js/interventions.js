/* ===============================
   INTERVENTIONS.JS - Beta 85
   Gestion des interventions RàI
   =============================== */

(function() {
'use strict';

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
 * - 'interventions' : Array des interventions planifiées et complétées
 *
 * STRUCTURE D'UNE INTERVENTION :
 * {
 *   id: 'intervention-timestamp',
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
 *     niveauxRai: { '1': 0, '2': 5, '3': 2 },
 *     niveauxRai: { '1': 2, '2': 3, '3': 0 }
 *   },
 *   observations: 'Notes prises durant la rencontre...',
 *   notesIndividuelles: { '1234567': 'Excellente participation...', '7654321': 'A besoin de...' },
 *   statut: 'planifiee' | 'en-cours' | 'completee',
 *   dateCreation: timestamp,
 *   dateModification: timestamp
 * }
 *
 * API PUBLIQUE :
 * - obtenirInterventions() : Array de toutes les interventions
 * - obtenirIntervention(id) : Une intervention spécifique
 * - obtenirInterventionsEtudiant(da) : Interventions pour un étudiant
 * - creerIntervention(data) : Créer une nouvelle intervention
 * - marquerPresences(interventionId, dasEtudiants) : Marquer qui est présent
 * - analyserSousGroupe(dasEtudiants) : Analyser les besoins communs
 * - completerIntervention(interventionId) : Marquer comme complétée
 * - supprimerIntervention(interventionId) : Supprimer une intervention
 */

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
    const interventions = obtenirInterventions();
    const intervention = interventions.find(i => i.id === id);
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
 * @returns {Array} Liste des interventions où l'étudiant était présent
 */
function obtenirInterventionsEtudiant(da) {
    const interventions = obtenirInterventions();
    return interventions.filter(i => i.etudiants && i.etudiants.includes(da));
}

/**
 * Sauvegarder les interventions dans localStorage
 * @param {Array} interventions - Liste des interventions
 */
function sauvegarderInterventions(interventions) {
    db.setSync(cle('interventions'), interventions);
}

/* ===============================
   CRÉATION ET MODIFICATION
   =============================== */

/**
 * Créer une nouvelle intervention
 * @param {Object} data - Données de l'intervention
 * @returns {string} ID de l'intervention créée
 */
function creerIntervention(data) {
    const interventions = obtenirInterventions();
    const now = new Date().toISOString();
    const nouvelleIntervention = {
        id: genererIdUnique('intervention-'),
        date: data.date || '',
        heure: data.heure || '',
        duree: data.duree || 2,
        type: data.type || 'groupe',
        niveauRai: data.niveauRai || 2,
        contexte: data.contexte || null,
        titre: data.titre || '',
        description: data.description || '',
        seanceConcernee: data.seanceConcernee || null,
        marquerNonParticipantsMotives: data.marquerNonParticipantsMotives || false,
        etudiants: [],
        analyse: null,
        criteresCibles: data.criteresCibles || [],
        objectifVise: data.objectifVise || '',
        bilan: null,
        jamaisSauvegardee: data.jamaisSauvegardee || false,
        statut: 'planifiee',
        dateCreation: now,
        dateModification: now
    };

    interventions.push(nouvelleIntervention);
    sauvegarderInterventions(interventions);

    return nouvelleIntervention.id;
}

/**
 * Marquer les présences à une intervention
 * @param {string} interventionId - ID de l'intervention
 * @param {Array} dasEtudiants - Liste des DAs des étudiants présents
 */
function marquerPresences(interventionId, dasEtudiants) {
    const interventions = obtenirInterventions();
    const intervention = interventions.find(i => i.id === interventionId);

    if (!intervention) {
        console.error('❌ Intervention non trouvée:', interventionId);
        return;
    }


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

    sauvegarderInterventions(interventions);
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
 * Marquer une intervention comme complétée
 * @param {string} interventionId - ID de l'intervention
 */
function completerIntervention(interventionId) {
    const interventions = obtenirInterventions();
    const intervention = interventions.find(i => i.id === interventionId);

    if (!intervention) {
        console.error('Intervention non trouvée:', interventionId);
        return;
    }

    intervention.statut = 'completee';
    intervention.dateModification = Date.now();

    sauvegarderInterventions(interventions);
}

/**
 * Supprimer une intervention
 * @param {string} interventionId - ID de l'intervention
 */
function supprimerIntervention(interventionId) {
    let interventions = obtenirInterventions();
    interventions = interventions.filter(i => i.id !== interventionId);
    sauvegarderInterventions(interventions);
}

/* ===============================
   INTERFACE UTILISATEUR
   =============================== */

/**
 * Afficher la liste des interventions
 */
function afficherListeInterventions() {

    // S'assurer que le conteneur principal existe et contient le bon HTML
    const conteneurPrincipal = document.getElementById('conteneurPrincipal');
    if (conteneurPrincipal) {
        // Vérifier si #listeInterventions existe, sinon le recréer
        let container = document.getElementById('listeInterventions');
        if (!container) {
            conteneurPrincipal.innerHTML = '<div id="listeInterventions"></div>';
            container = document.getElementById('listeInterventions');
        }
    }

    let interventions = obtenirInterventions();
    // Purger les interventions fantômes (créées mais jamais sauvegardées)
    const avantPurge = interventions.length;
    interventions = interventions.filter(function(i) { return !i.jamaisSauvegardee; });
    if (interventions.length !== avantPurge) {
        sauvegarderInterventions(interventions);
    }

    const container = document.getElementById('listeInterventions');

    if (!container) {
        console.error('❌ Conteneur #listeInterventions introuvable');
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
                Planifier une intervention
            </button>
            ${raiActif ? `<button data-action="ouvrirGuidePedagogique" data-param="rai" class="btn btn-secondaire" title="Guide RàI">
                <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide RàI
            </button>` : ''}
        </div>
    `;

    if (interventions.length === 0) {
        html += `
            <div class="message-vide">
                <p>Aucune intervention planifiée ou complétée.</p>
                <p class="message-vide-aide">Clique sur «Planifier une intervention» pour commencer.</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    interventions.forEach(intervention => {
        const badgeStatut = genererBadgeStatut(intervention.statut);
        const ctx = intervention.contexte || '';
        var badgeType;
        if (ctx === 'rattrapage') badgeType = 'Rattrapage';
        else if (ctx === 'en-classe') badgeType = 'En classe';
        else if (ctx === 'mio' || intervention.type === 'mio') badgeType = 'MIO';
        else if (intervention.type === 'individuel' || intervention.niveauRai === 3) badgeType = 'Hors classe';
        else badgeType = intervention.type === 'groupe' ? 'Groupe' : 'Individuel';
        const badgeNiveau = `Niveau ${intervention.niveauRai}`;

        html += `
            <div class="carte intervention-item u-mb-15">
                <div class="intervention-header">
                    <div>
                        <h4 class="intervention-titre" data-tooltip="interv-carte">${echapperHtml(intervention.titre)}</h4>
                        <div class="intervention-badges">
                            <span>${badgeStatut}</span>
                            <span class="badge-type-intervention">${badgeType}</span>
                            <span class="badge-rai-${intervention.niveauRai}">${badgeNiveau}</span>
                        </div>
                    </div>
                    <div class="intervention-actions">
                        <button data-action="ouvrirIntervention" data-param="${intervention.id}" class="btn btn-principal">
                            Ouvrir
                        </button>
                        <button data-action="supprimerInterventionEtRafraichir" data-param="${intervention.id}" class="btn btn-supprimer">Supprimer</button>
                    </div>
                </div>

                <p class="intervention-description">${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(intervention.description || '', null) : (intervention.description || ''))} <span class="text-muted">${formaterDateLisible(intervention.date)}${intervention.heure ? ` à ${echapperHtml(intervention.heure)}` : ''}</span></p>

                ${(intervention.analyse || (intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0)) ? `
                    <h4 class="intervention-titre u-mb-10 u-mt-10">Aperçu du sous-groupe (${formaterNbEtudiants(intervention.analyse ? intervention.analyse.nbEtudiants : 0)})</h4>
                    <div class="intervention-cartes-row">
                        ${intervention.analyse ? genererAffichageAnalyseCartes(intervention.analyse) : ''}
                        ${intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0 ? genererAffichageNotesIndividuelles(intervention.notesIndividuelles) : ''}
                    </div>
                ` : ''}

                ${intervention.observations ? `
                    <div class="carte intervention-observations">
                        <h5>Observations générales</h5>
                        <p>${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(intervention.observations, null) : intervention.observations)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
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

    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const nbNotes = Object.keys(notesIndividuelles).length;

    let html = `
        <div class="profil-carte">
            <div class="carte-metrique-header">
                <h4 data-tooltip="interv-notes-individuelles">Notes individuelles</h4>
                <strong>${nbNotes}</strong>
            </div>
    `;

    Object.entries(notesIndividuelles).forEach(([da, note]) => {
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && note) {
            // ✅ ANONYMISATION (Tier 0.4) + SÉCURITÉ : echapperHtml + anonymiser prénoms dans le texte libre
            const noteAff = typeof anonymiserTexteRetroaction === 'function'
                ? anonymiserTexteRetroaction(note, da) : note;
            html += `
                <div style="margin-bottom: 8px; font-size: 0.9rem;">
                    <strong>${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}:</strong> ${echapperHtml(noteAff)}
                </div>
            `;
        }
    });

    html += '</div>';
    return html;
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

    var val = parseInt(niveau.value);

    if (val === 2) {
        // Niveau 2 : afficher le choix de contexte
        contexteBloc.style.display = '';
        // Afficher le panneau absences seulement si contexte = rattrapage
        var ctx = contexteSelect ? contexteSelect.value : '';
        if (ctx === 'rattrapage') {
            absencesBloc.style.display = '';
            // Pré-remplir la date de séance depuis la date de l'intervention
            var dateIntervention = document.getElementById('interventionDate');
            var dateSeance = document.getElementById('interventionSeance');
            if (dateIntervention && dateSeance && !dateSeance.value) {
                dateSeance.value = dateIntervention.value;
            }
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
    var container = document.getElementById('conteneurPrincipal');
    if (!container) return;

    // Déterminer le niveau RàI initial si un DA est pré-sélectionné
    var niveauInitial = 2;
    if (daPreselectionne && typeof determinerNiveauRaiPedagogique === 'function') {
        var niveauRai = determinerNiveauRaiPedagogique(daPreselectionne);
        if (niveauRai && niveauRai.niveau >= 3) niveauInitial = 3;
    }

    // Créer l'intervention avec des valeurs par défaut
    var aujourdhui = window.dateLocaleYMD(); // #398 : date LOCALE
    var interventionId = creerIntervention({
        date: aujourdhui,
        duree: 2,
        niveauRai: niveauInitial,
        jamaisSauvegardee: true
    });

    // Ouvrir directement la vue complète (formulaire unifié)
    ouvrirIntervention(interventionId, { modeCreation: true, daPreselectionne: daPreselectionne });
}

/**
 * Annuler la création d'une intervention jamais sauvegardée
 * @param {string} interventionId - ID de l'intervention à supprimer
 */
function annulerNouvelleIntervention(interventionId) {
    supprimerIntervention(interventionId);
    afficherListeInterventions();
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
        alert('Intervention non trouvée.');
        return;
    }

    const container = document.getElementById('conteneurPrincipal');
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
                          placeholder="Note individuelle…"
                          style="font-size: 0.85rem; resize: vertical;">${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(noteExistante, etudiant.da) : noteExistante)}</textarea>
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
            var badgeSolo = niveauLabel
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

    container.innerHTML = `
        <div class="carte">
            <h3 style="margin: 0 0 20px 0;">${options.modeCreation ? 'Planifier une intervention' : echapperHtml(intervention.titre)}</h3>

            <!-- Section informations éditables -->
            <div class="intervention-grid-1-09">
                <!-- Colonne gauche : Informations de base -->
                <div>
                    <!-- Ligne 1 : Titre + Niveau RàI -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionTitre" class="label-formulaire">Titre :</label>
                            <input type="text" id="interventionTitre" class="controle-form" required
                                   value="${echapperHtml(intervention.titre)}" placeholder="Ex. Intervention Rigueur et Nuance">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionNiveau" class="label-formulaire">Niveau R\u00e0I :</label>
                            <select id="interventionNiveau" class="controle-form" required
                                    data-on-change="gererVisibiliteContexteIntervention">
                                <option value="2" ${intervention.niveauRai === 2 ? 'selected' : ''}>Niveau 2 (Groupe cibl\u00e9)</option>
                                <option value="3" ${intervention.niveauRai === 3 ? 'selected' : ''}>Niveau 3 (Individuel)</option>
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
                                  placeholder="Objectifs de l'intervention, sujets abord\u00e9s\u2026">${echapperHtml(intervention.description || '')}</textarea>
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
                            Les \u00e9l\u00e8ves non s\u00e9lectionn\u00e9s pour cette s\u00e9ance de rattrapage
                            b\u00e9n\u00e9ficieront d\u2019un cong\u00e9 (absence motiv\u00e9e).
                        </p>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionSeance" class="label-formulaire">S\u00e9ance concern\u00e9e :</label>
                            <input type="date" id="interventionSeance" class="controle-form" value="${echapperHtml(intervention.seanceConcernee || '')}">
                        </div>
                    </div>
                </div>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--bordure-claire);">

            <div style="display: grid; grid-template-columns: 40fr 60fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                <!-- Colonne gauche: Aperçu du sous-groupe (40%) -->
                <div>
                    <h4 data-tooltip="interv-apercu-sous-groupe">Aperçu du sous-groupe</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cette agrégation des profils des étudiant·es vise à éclairer ta préparation.
                    </p>
                    <div id="analyseTempsReel"></div>
                </div>

                <!-- Colonne droite: Liste des étudiants avec notes (60%) -->
                <div>
                    <h4 data-tooltip="interv-presences-notes">Marquer les présences et notes individuelles</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Coche les étudiant·es présent·es et documente tes observations spécifiques.
                    </p>

                    <div id="listeEtudiantsIntervention" class="liste-etudiants-intervention">
                        ${listeHtml}
                    </div>
                </div>
            </div>

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
                           placeholder="Ex. Amener Structure au seuil D (65%)">
                    <button data-action="suggererObjectifIntervention" data-param="${interventionId}" class="btn btn-secondaire" style="white-space: nowrap;">Suggérer</button>
                </div>
            </div>

            <!-- Observations générales (pleine largeur) -->
            <div class="carte" style="margin-bottom: 20px;">
                <h4 class="intervention-mt-0">Observations générales</h4>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 10px;">
                    Note tes observations durant l'intervention (stratégies à nouveau enseignées, réception du groupe...)
                </p>
                <!-- #733 — règle 1 : texte libre de l'enseignant (ou importé) dans du HTML → echapperHtml, comme le bilan plus bas -->
                <textarea id="observationsIntervention" class="controle-form" rows="6" placeholder="Ex. Stratégie de lecture n°3…">${echapperHtml(intervention.observations || '')}</textarea>
            </div>

            ${(() => {
                // Section Bilan — visible uniquement quand statut = complétée
                if (intervention.statut !== 'completee') return '';

                // Tableau comparatif avant/après sur les critères ciblés
                var bilanTableau = '';
                if (intervention.snapshotAvant && intervention.criteresCibles && intervention.criteresCibles.length > 0) {
                    var lignes = intervention.criteresCibles.map(function(nom) {
                        var cleNorm = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
                        if (cleNorm.startsWith('francais')) cleNorm = 'francais';

                        // Moyenne avant (snapshot) et après (actuel) sur les DAs de l'intervention
                        var totalAvant = 0, countAvant = 0, totalApres = 0, countApres = 0;
                        (intervention.etudiants || []).forEach(function(da) {
                            var snap = intervention.snapshotAvant[da];
                            if (snap && snap.criteres && typeof snap.criteres[cleNorm] === 'number') {
                                totalAvant += snap.criteres[cleNorm];
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

                        var niveauAvant = avant !== null ? (avant >= 0.85 ? 'E' : avant >= 0.75 ? 'M' : avant >= 0.65 ? 'D' : 'I') : '—';
                        var niveauApres = apres !== null ? (apres >= 0.85 ? 'E' : apres >= 0.75 ? 'M' : apres >= 0.65 ? 'D' : 'I') : '—';
                        var delta = (avant !== null && apres !== null) ? Math.round((apres - avant) * 100) : null;
                        var deltaTexte = delta !== null ? ((delta >= 0 ? '+' : '') + delta + ' pts') : '—';
                        var deltaFleche = delta !== null ? (delta > 0 ? ' ↗' : delta < 0 ? ' ↘' : ' →') : '';
                        var deltaCouleur = delta !== null ? (delta > 0 ? 'var(--vert-succes)' : delta < 0 ? 'var(--orange-attention, #e8a838)' : 'var(--gris-moyen)') : 'var(--gris-moyen)';

                        return '<tr>' +
                            '<td style="padding: 6px 12px; font-weight: 500;">' + echapperHtml(nom) + '</td>' +
                            '<td style="padding: 6px 12px; text-align: center;">' + niveauAvant + ' ' + (avant !== null ? Math.round(avant * 100) + '%' : '') + '</td>' +
                            '<td style="padding: 6px 12px; text-align: center;">' + niveauApres + ' ' + (apres !== null ? Math.round(apres * 100) + '%' : '') + '</td>' +
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
                    '<h4 class="intervention-mt-0" data-tooltip="interv-bilan">Bilan post-intervention</h4>' +
                    '<p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">Comparaison automatique des critères ciblés avant et après l\'intervention.</p>' +
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
                        '<textarea id="observationsBilan" class="controle-form" rows="3" placeholder="Réflexions sur l\'intervention, ajustements à apporter…">' + echapperHtml(bilan.observationsBilan || '') + '</textarea>' +
                    '</div>' +
                '</div>';
            })()}

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                ${intervention.jamaisSauvegardee
                    ? '<button data-action="annulerNouvelleIntervention" data-param="' + interventionId + '" class="btn btn-secondaire">Annuler</button>'
                    : '<button data-action="afficherListeInterventions" class="btn btn-secondaire">Annuler</button>'}
                <button data-action="sauvegarderPresencesIntervention" data-param="${interventionId}" class="btn btn-principal">
                    Enregistrer
                </button>
            </div>
        </div>
    `;

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
        if (cleNorm.startsWith('francais')) cleNorm = 'francais';

        var nbEnDefi = defisParCritere[cleNorm] || 0;
        var countSpan = cb.parentElement.querySelector('.critere-defi-count');
        if (countSpan) {
            countSpan.textContent = nbEnDefi > 0 ? '— ' + nbEnDefi + '/' + nbEtudiants + ' en défi' : '';
            countSpan.style.color = nbEnDefi > nbEtudiants / 2 ? 'var(--orange-attention, #e8a838)' : 'var(--gris-moyen)';
        }

        // Pré-cocher si majorité du sous-groupe est en défi (uniquement si pas déjà sauvegardé)
        var intervention = obtenirIntervention(interventionId);
        if (intervention && intervention.jamaisSauvegardee) {
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
        objectifField.value = '';
        return;
    }

    // Trouver le critère ciblé le plus faible
    var criteresCibles = Array.from(document.querySelectorAll('.critere-cible-cb:checked')).map(function(cb) { return cb.value; });
    if (criteresCibles.length === 0) {
        objectifField.value = '';
        return;
    }

    var seuilDeveloppement = (typeof obtenirSeuil === 'function' ? obtenirSeuil('idme.developpement') : null) || 0.75;
    var seuilInsuffisant = (typeof obtenirSeuil === 'function' ? obtenirSeuil('idme.insuffisant') : null) || 0.64;

    // Calculer la moyenne du sous-groupe pour chaque critère ciblé
    var plusFaible = null;
    var scorePlusFaible = 1;
    criteresCibles.forEach(function(nom) {
        var cleNorm = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
        if (cleNorm.startsWith('francais')) cleNorm = 'francais';

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

    // Déterminer le prochain seuil atteignable
    var suggestion = '';
    if (scorePlusFaible < seuilInsuffisant) {
        suggestion = 'Amener ' + plusFaible + ' au seuil D (' + Math.round(seuilInsuffisant * 100) + '%)';
    } else if (scorePlusFaible < seuilDeveloppement) {
        suggestion = 'Amener ' + plusFaible + ' au seuil M (' + Math.round(seuilDeveloppement * 100) + '%)';
    } else {
        suggestion = 'Stabiliser ' + plusFaible + ' au-dessus du seuil M (' + Math.round(seuilDeveloppement * 100) + '%)';
    }

    objectifField.value = suggestion;
}

/**
 * Afficher les champs de notes individuelles pour les étudiants sélectionnés
 * @param {string} interventionId - ID de l'intervention
 * @param {Array} dasSelectionnes - Liste des DAs sélectionnés
 */
function afficherNotesIndividuelles(interventionId, dasSelectionnes) {
    const intervention = obtenirIntervention(interventionId);
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const container = document.getElementById('notesIndividuellesContainer');

    if (!container || dasSelectionnes.length === 0) return;

    // Initialiser notesIndividuelles si inexistant
    if (!intervention.notesIndividuelles) {
        intervention.notesIndividuelles = {};
    }

    let html = `
        <div class="carte" style="margin-top: 20px;">
            <h4 class="intervention-mt-0">Notes individuelles</h4>
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                Documente tes observations spécifiques pour chaque étudiant·e (participation, compréhension, besoins identifiés...)
            </p>
    `;

    dasSelectionnes.forEach(da => {
        const etudiant = etudiants.find(e => e.da === da);
        if (!etudiant) return;

        const noteExistante = intervention.notesIndividuelles[da] || '';

        html += `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid var(--bordure-claire);">
                <label style="display: block; font-weight: 600; margin-bottom: 5px; color: var(--accent-primaire);">
                    ${etudiant.prenom} ${etudiant.nom}
                </label>
                <textarea
                    id="note-${da}"
                    class="controle-form"
                    rows="2"
                    placeholder="Ex. Excellente participation, a bien saisi la stratégie enseignée…"
                    class="u-texte-09">${noteExistante}</textarea>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}

/**
 * Sauvegarder toutes les informations d'une intervention (infos de base + présences + observations + statut)
 * @param {string} interventionId - ID de l'intervention
 */
function sauvegarderPresencesIntervention(interventionId) {

    const checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    const dasSelectionnes = Array.from(checkboxes).map(cb => cb.value);
    // #772 (6 sept. 2026) — ce que le formulaire n'a pas MONTRÉ n'est pas touché. Le formulaire ne construit
    // des cases que pour les élèves du groupe-cours actif : les participants d'un autre groupe-cours (une
    // intervention planifiée sous GC2, rouverte sous GC1) restaient invisibles et étaient retirés, avec leurs
    // notes, par un simple « Enregistrer ». On distingue donc les DA affichés (cochés ou non) des autres.
    const dasAffiches = Array.from(document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]')).map(cb => cb.value);
    const observationsField = document.getElementById('observationsIntervention');
    const observations = observationsField ? observationsField.value : '';

    // Lire le statut depuis les boutons radio
    const statutRadio = document.querySelector('input[name="interventionStatut"]:checked');
    const nouveauStatut = statutRadio ? statutRadio.value : 'en-cours';

    // Marquer les présences (met à jour etudiants et analyse) : les cochés du formulaire, plus les
    // participants que le formulaire n'a pas montrés (#772).
    const existante = obtenirInterventions().find(i => i.id === interventionId);
    const participantsNonAffiches = ((existante && existante.etudiants) || []).filter(da => !dasAffiches.includes(da));
    marquerPresences(interventionId, [...new Set(participantsNonAffiches.concat(dasSelectionnes))]);

    // Sauvegarder TOUTES les informations de l'intervention
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        const ancienStatut = interventions[index].statut;

        // Dériver contexte, type et absences depuis le formulaire
        var niveauSave = parseInt(document.getElementById('interventionNiveau').value);
        var contexteElSave = document.getElementById('interventionContexte');
        var contexteSave = (niveauSave === 2 && contexteElSave) ? contexteElSave.value : 'hors-classe';
        var typeSave = 'groupe';
        if (contexteSave === 'mio') typeSave = 'mio';
        else if (niveauSave === 3) typeSave = 'individuel';

        // Mettre à jour les informations de base
        interventions[index].titre = document.getElementById('interventionTitre').value;
        interventions[index].date = document.getElementById('interventionDate').value;
        interventions[index].heure = document.getElementById('interventionHeure').value;
        interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
        interventions[index].niveauRai = niveauSave;
        interventions[index].contexte = contexteSave;
        interventions[index].type = typeSave;
        interventions[index].description = document.getElementById('interventionDescription').value;

        // Absences seulement si rattrapage
        if (contexteSave === 'rattrapage') {
            interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
            interventions[index].marquerNonParticipantsMotives = true;
        } else {
            interventions[index].seanceConcernee = null;
            interventions[index].marquerNonParticipantsMotives = false;
        }

        // Mettre à jour le statut
        interventions[index].statut = nouveauStatut;

        // Mettre à jour observations
        interventions[index].observations = observations;

        // Notes individuelles (#772) : on part de celles en base et on n'écrit que ce que le formulaire a
        // montré — un champ affiché vide efface la note, un champ affiché rempli la pose (coché ou non) ;
        // les DA sans champ (autre groupe-cours, élève parti) gardent la leur.
        const notesIndividuelles = Object.assign({}, interventions[index].notesIndividuelles || {});
        dasAffiches.forEach(da => {
            const noteField = document.getElementById(`note-${da}`);
            if (!noteField) return;
            const texte = noteField.value.trim();
            if (texte) notesIndividuelles[da] = texte;
            else delete notesIndividuelles[da];
        });
        interventions[index].notesIndividuelles = notesIndividuelles;

        // Snapshot incrémental par étudiant (Phase 4 — PT-2 + PT-3)
        if (!interventions[index].snapshotAvant) interventions[index].snapshotAvant = {};
        dasSelectionnes.forEach(function(da) {
            if (!interventions[index].snapshotAvant[da]) {
                var indicesSnap = typeof calculerTousLesIndices === 'function' ? calculerTousLesIndices(da) : null;
                var moyennesSnap = typeof calculerMoyennesCriteres === 'function' ? calculerMoyennesCriteres(da) : null;
                var criteresSnap = {};
                if (moyennesSnap) {
                    Object.keys(moyennesSnap).forEach(function(k) {
                        if (typeof moyennesSnap[k] === 'number') criteresSnap[k] = moyennesSnap[k];
                    });
                }
                interventions[index].snapshotAvant[da] = {
                    P: indicesSnap ? indicesSnap.P : null,
                    criteres: criteresSnap
                };
            }
        });

        // Sauvegarder les critères ciblés et l'objectif (Phase 3)
        var criteresCiblesCbs = document.querySelectorAll('#criteresCiblesContainer .critere-cible-cb:checked');
        interventions[index].criteresCibles = Array.from(criteresCiblesCbs).map(function(cb) { return cb.value; });
        var objectifField = document.getElementById('objectifVise');
        interventions[index].objectifVise = objectifField ? objectifField.value : '';

        // Sauvegarder le bilan si l'intervention est complétée (Phase 4)
        if (nouveauStatut === 'completee') {
            var bilanAtteintRadio = document.querySelector('input[name="bilanAtteint"]:checked');
            var bilanSuiteRadio = document.querySelector('input[name="bilanSuite"]:checked');
            var observationsBilanField = document.getElementById('observationsBilan');
            interventions[index].bilan = {
                atteint: bilanAtteintRadio ? bilanAtteintRadio.value : null,
                suite: bilanSuiteRadio ? bilanSuiteRadio.value : null,
                observationsBilan: observationsBilanField ? observationsBilanField.value : '',
                dateBilan: Date.now()
            };
        }

        // Effacer le flag fantôme (l'intervention est maintenant sauvegardée par l'utilisateur)
        interventions[index].jamaisSauvegardee = false;

        interventions[index].dateModification = Date.now();
        sauvegarderInterventions(interventions);
        // Si l'intervention vient d'être marquée comme complétée, transférer les présences
        if (nouveauStatut === 'completee' && ancienStatut !== 'completee') {
            transfererPresencesVersModule(interventionId);
        }
        // Si l'intervention est déjà complétée, re-transférer les présences au cas où il y aurait des changements
        else if (nouveauStatut === 'completee') {
            transfererPresencesVersModule(interventionId);
        }
    }

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    notifications.succes('Intervention enregistrée');

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
    // disait rien. En pratique `creerIntervention` pose toujours une durée, donc le repli
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
            afficherListeInterventions();
        }
    });

    // Observer les changements de classe sur toutes les sous-sections
    document.querySelectorAll('.sous-section').forEach(section => {
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });

    // Afficher la liste si la sous-section est déjà active
    const sousSection = document.getElementById('suivi-interventions');
    if (sousSection && sousSection.classList.contains('active')) {
        afficherListeInterventions();
    }

}

/**
 * Obtenir la liste des DAs avec absence motivée pour une date donnée
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {Array} Liste des DAs avec absence motivée
 */
function obtenirAbsencesMotiveesParDate(date) {
    const interventions = obtenirInterventions();
    const dasMotives = [];

    // Filtrer les interventions qui:
    // 1. Ont marquerNonParticipantsMotives = true
    // 2. Ont seanceConcernee = date
    const interventionsConcernees = interventions.filter(intervention =>
        intervention.marquerNonParticipantsMotives === true &&
        intervention.seanceConcernee === date
    );

    if (interventionsConcernees.length === 0) {
        return [];
    }

    // Récupérer tous les étudiants du groupe (filtrés par groupe-cours actif)
    const tousLesEtudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : (obtenirDonneesSelonMode('groupeEtudiants') || []);
    const tousLesDas = tousLesEtudiants.map(e => e.da);

    // Pour chaque intervention concernée
    interventionsConcernees.forEach(intervention => {
        // Les participants à l'intervention
        const participants = intervention.etudiants || [];

        // Les non-participants = tous les étudiants - participants
        const nonParticipants = tousLesDas.filter(da => !participants.includes(da));

        // Ajouter à la liste des DAs motivés (sans doublons)
        nonParticipants.forEach(da => {
            if (!dasMotives.includes(da)) {
                dasMotives.push(da);
            }
        });
    });

    return dasMotives;
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Supprimer intervention avec confirmation + rafraichir liste */
function supprimerInterventionEtRafraichir(interventionId) {
    if (confirm('Supprimer cette intervention ?')) {
        supprimerIntervention(interventionId);
        afficherListeInterventions();
    }
}

// Exporter les fonctions publiques
window.obtenirInterventions = obtenirInterventions;
window.obtenirIntervention = obtenirIntervention;
window.obtenirInterventionsEtudiant = obtenirInterventionsEtudiant;
window.creerIntervention = creerIntervention;
window.marquerPresences = marquerPresences;
window.analyserSousGroupe = analyserSousGroupe;
window.completerIntervention = completerIntervention;
window.supprimerIntervention = supprimerIntervention;
window.afficherListeInterventions = afficherListeInterventions;
window.afficherFormulaireIntervention = afficherFormulaireIntervention;
window.gererVisibiliteContexteIntervention = gererVisibiliteContexteIntervention;
window.annulerNouvelleIntervention = annulerNouvelleIntervention;
window.ouvrirIntervention = ouvrirIntervention;
window.onChangementSelectionEtudiants = onChangementSelectionEtudiants;
window.mettreAJourCriteresCibles = mettreAJourCriteresCibles;
window.suggererObjectifIntervention = suggererObjectifIntervention;
window.sauvegarderPresencesIntervention = sauvegarderPresencesIntervention;
// terminerIntervention et rouvrirIntervention supprimés (Phase 5)
window.transfererPresencesVersModule = transfererPresencesVersModule;
window.initialiserModuleInterventions = initialiserModuleInterventions;
window.formaterDateLisible = formaterDateLisible;
window.genererBadgeStatut = genererBadgeStatut;
window.obtenirAbsencesMotiveesParDate = obtenirAbsencesMotiveesParDate;
window.supprimerInterventionEtRafraichir = supprimerInterventionEtRafraichir;
window.afficherAnalyseTempsReel = afficherAnalyseTempsReel;


})();
