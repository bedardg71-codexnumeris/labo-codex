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
 *     defisCommuns: { 'Rigueur': 5, 'Nuance': 4 },
 *     patternsCommuns: { 'Blocage émergent': 5 },
 *     progressions: { 'En progression': 3, 'Plateau': 2, 'Régression': 2 },
 *     niveauxRai: { '1': 0, '2': 5, '3': 2 },
 *     engagementMoyen: 0.55,
 *     engagementDistribution: { 'Excellent': 0, 'Bon': 2, 'En développement': 3, 'Insuffisant': 2, 'Critique': 0 }
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
    return interventions.find(i => i.id === id) || null;
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
    const defisCommuns = {};
    const patternsCommuns = {};
    const progressions = {};
    const niveauxRai = { '1': 0, '2': 0, '3': 0 };
    const engagementDistribution = { 'Excellent': 0, 'Bon': 0, 'En développement': 0, 'Insuffisant': 0, 'Critique': 0 };
    let sommeEngagement = 0;
    let nbEtudiants = dasEtudiants.length;

    dasEtudiants.forEach(da => {
        // Calculer les indices pour cet étudiant
        const indices = calculerTousLesIndices(da);
        const cible = determinerCibleIntervention(da);

        // Compter les niveaux RàI
        niveauxRai[cible.niveau] = (niveauxRai[cible.niveau] || 0) + 1;

        // Accumuler l'engagement (E = A × C × P)
        sommeEngagement += (indices.E || 0);

        // Distribution de l'engagement
        const niveauE = interpreterNiveauEngagement(indices.E);
        engagementDistribution[niveauE] = (engagementDistribution[niveauE] || 0) + 1;

        // Compter les patterns
        const pattern = cible.pattern;
        patternsCommuns[pattern] = (patternsCommuns[pattern] || 0) + 1;

        // Calculer la progression (fonction à créer ou utiliser existante)
        if (typeof calculerProgressionArtefacts === 'function') {
            const progression = calculerProgressionArtefacts(da);
            if (progression && progression.interpretation) {
                const progLabel = progression.interpretation;
                progressions[progLabel] = (progressions[progLabel] || 0) + 1;
            }
        }

        // Identifier les défis SRPNF (< 75% selon seuils par défaut)
        const seuils = chargerSeuilsInterpretation();
        const performances = obtenirPerformancesSRPNF(da);

        if (performances) {
            ['Structure', 'Rigueur', 'Plausibilité', 'Nuance', 'Français'].forEach(critere => {
                const score = performances[critere];
                if (score !== null && score < seuils.acceptable) {
                    defisCommuns[critere] = (defisCommuns[critere] || 0) + 1;
                }
            });
        }
    });

    return {
        nbEtudiants: nbEtudiants,
        defisCommuns: defisCommuns,
        patternsCommuns: patternsCommuns,
        progressions: progressions,
        niveauxRai: niveauxRai,
        engagementMoyen: nbEtudiants > 0 ? (sommeEngagement / nbEtudiants) : 0,
        engagementDistribution: engagementDistribution
    };
}

/**
 * Interprète le niveau d'engagement
 * @param {number} valeur - Valeur E entre 0 et 1
 * @returns {string} Niveau d'engagement
 */
function interpreterNiveauEngagement(valeur) {
    if (valeur >= 0.85) return 'Excellent';
    if (valeur >= 0.75) return 'Bon';
    if (valeur >= 0.65) return 'En développement';
    if (valeur >= 0.40) return 'Insuffisant';
    return 'Critique';
}

/**
 * Obtenir les performances SRPNF moyennes d'un étudiant
 * @param {string} da - DA de l'étudiant
 * @returns {Object|null} Performances par critère
 */
function obtenirPerformancesSRPNF(da) {
    // Obtenir les évaluations de l'étudiant
    const toutesEvaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluations = toutesEvaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);

    if (!evaluations || evaluations.length === 0) {
        return null;
    }

    const performances = {
        'Structure': [],
        'Rigueur': [],
        'Plausibilité': [],
        'Nuance': [],
        'Français': []
    };

    // Collecter toutes les notes par critère
    evaluations.forEach(evaluation => {
        if (evaluation.criteres) {
            Object.keys(evaluation.criteres).forEach(critere => {
                const niveau = evaluation.criteres[critere];
                if (niveau !== null && performances[critere]) {
                    // Convertir le niveau IDME en pourcentage
                    const pct = convertirNiveauEnPourcentage(niveau, evaluation.echelleId || 'idme');
                    performances[critere].push(pct);
                }
            });
        }
    });

    // Calculer les moyennes
    const moyennes = {};
    Object.keys(performances).forEach(critere => {
        const notes = performances[critere];
        if (notes.length > 0) {
            moyennes[critere] = notes.reduce((a, b) => a + b, 0) / notes.length;
        } else {
            moyennes[critere] = null;
        }
    });

    return moyennes;
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

    const interventions = obtenirInterventions();
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

    // Bouton pour planifier une nouvelle intervention
    let html = `
        <div class="actions-principales">
            <button data-action="afficherFormulaireIntervention" class="btn btn-principal" data-tooltip="interv-btn-planifier">
                Planifier une intervention
            </button>
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
                        <h4 class="intervention-titre" data-tooltip="interv-carte">${intervention.titre}</h4>
                        <div class="intervention-badges">
                            <span>${badgeStatut}</span>
                            <span class="badge-type-intervention">${badgeType}</span>
                            <span class="badge-rai-${intervention.niveauRai}">${badgeNiveau}</span>
                        </div>
                    </div>
                    <div class="intervention-actions">
                        ${intervention.statut !== 'completee' ? `
                            <button data-action="ouvrirIntervention" data-param="${intervention.id}" class="btn btn-principal">
                                Modifier
                            </button>
                        ` : `
                            <button data-action="ouvrirIntervention" data-param="${intervention.id}" class="btn btn-secondaire">
                                Consulter
                            </button>
                        `}
                        <button data-action="supprimerInterventionEtRafraichir" data-param="${intervention.id}" class="btn btn-supprimer">Supprimer</button>
                    </div>
                </div>

                <p class="intervention-description">${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(intervention.description || '', null) : (intervention.description || ''))} <span class="text-muted">${formaterDateLisible(intervention.date)}${intervention.heure ? ` à ${echapperHtml(intervention.heure)}` : ''}</span></p>

                ${(intervention.analyse || (intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0)) ? `
                    <h4 class="intervention-titre u-mb-10 u-mt-10">Aperçu du sous-groupe (${intervention.analyse ? intervention.analyse.nbEtudiants : 0} étudiant·e·s)</h4>
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
        'blocage-emergent': 'badge-pattern-blocage-emergent',
        'blocage-critique': 'badge-pattern-blocage-critique'
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
    const container = document.getElementById('conteneurPrincipal');

    if (!container) return;

    // Date d'aujourd'hui par défaut
    const aujourdhui = new Date().toISOString().split('T')[0];

    // Indicateur visuel si étudiant pré-sélectionné
    let bandeauPreselection = '';
    if (daPreselectionne) {
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : obtenirDonneesSelonMode('groupeEtudiants');
        const etudiant = etudiants.find(e => e.da === daPreselectionne);
        if (etudiant) {
            bandeauPreselection = `
                <div class="info-box info-box--info" style="margin-bottom: 15px;">
                    Intervention pour <strong>${etudiant.prenom} ${etudiant.nom}</strong> — l'élève sera pré-coché à la prochaine étape.
                </div>`;
        }
    }

    container.innerHTML = `
        <div class="carte">
            <h3 class="intervention-mt-0">Planifier une intervention</h3>
            ${bandeauPreselection}
            <!-- Tableau explicatif des niveaux -->
            <table class="tableau-simple" style="font-size: 0.85rem; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>Situation</th>
                        <th>Niveau</th>
                        <th>Lieu</th>
                        <th>Absences non-participants</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Rattrapage cibl\u00e9 (les autres ont cong\u00e9)</td>
                        <td>2</td>
                        <td>En classe</td>
                        <td>Absences motiv\u00e9es</td>
                    </tr>
                    <tr>
                        <td>Petit groupe pendant le cours r\u00e9gulier</td>
                        <td>2</td>
                        <td>En classe</td>
                        <td>Aucune (tous pr\u00e9sents)</td>
                    </tr>
                    <tr>
                        <td>Rencontre individuelle ou de groupe</td>
                        <td>3</td>
                        <td>Hors classe</td>
                        <td>Aucune</td>
                    </tr>
                </tbody>
            </table>

            <form id="form-nouvelle-intervention">
                <input type="hidden" id="interventionDaPreselectionne" value="${daPreselectionne || ''}">
                <!-- Layout 2 colonnes : formulaire | gestion absences -->
                <div class="intervention-grid-1-09">
                    <!-- Colonne gauche : Champs du formulaire -->
                    <div>
                        <!-- Ligne 1 : Titre + Niveau RàI -->
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionTitre" class="label-formulaire">Titre :</label>
                                <input type="text" id="interventionTitre" class="controle-form" required
                                       placeholder="Ex: Intervention Rigueur et Nuance">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionNiveau" class="label-formulaire">Niveau R\u00e0I :</label>
                                <select id="interventionNiveau" class="controle-form" required
                                        data-on-change="gererVisibiliteContexteIntervention">
                                    <option value="2">Niveau 2 (Groupe cibl\u00e9)</option>
                                    <option value="3">Niveau 3 (Individuel)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Contexte niveau 2 (visible seulement si niveau 2) -->
                        <div id="interventionContexteBloc" style="margin-bottom: 15px;">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionContexte" class="label-formulaire">Contexte de l\u2019intervention :</label>
                                <select id="interventionContexte" class="controle-form" required
                                        data-on-change="gererVisibiliteContexteIntervention">
                                    <option value="rattrapage">S\u00e9ance de rattrapage \u2014 les non-participants ont cong\u00e9</option>
                                    <option value="en-classe">Petit groupe cibl\u00e9 pendant le cours r\u00e9gulier</option>
                                </select>
                            </div>
                        </div>

                        <!-- Ligne 2 : Date, Heure, Durée -->
                        <div class="intervention-grid-3col">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionDate" class="label-formulaire">Date :</label>
                                <input type="date" id="interventionDate" class="controle-form" required value="${aujourdhui}">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionHeure" class="label-formulaire">Heure :</label>
                                <input type="time" id="interventionHeure" class="controle-form">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionDuree" class="label-formulaire">Dur\u00e9e (p\u00e9riodes) :</label>
                                <input type="number" id="interventionDuree" class="controle-form" min="0.5" max="4" step="0.5" value="2" required>
                            </div>
                        </div>

                        <!-- Ligne 3 : Description -->
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionDescription" class="label-formulaire">Description (optionnel) :</label>
                            <textarea id="interventionDescription" class="controle-form" rows="3"
                                      placeholder="Objectifs de l'intervention, sujets abord\u00e9s..."></textarea>
                        </div>
                    </div>

                    <!-- Colonne droite : Gestion des absences (visible seulement si rattrapage) -->
                    <div id="interventionAbsencesBloc" class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0; height: fit-content;">
                        <h4 style="margin: 0 0 10px 0; color: var(--accent-primaire);" data-tooltip="interv-gestion-absences">Gestion des absences</h4>
                        <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                            Les \u00e9l\u00e8ves non s\u00e9lectionn\u00e9s pour cette s\u00e9ance de rattrapage
                            b\u00e9n\u00e9ficieront d\u2019un cong\u00e9 (absence motiv\u00e9e).
                        </p>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionSeance" class="label-formulaire">S\u00e9ance concern\u00e9e :</label>
                            <input type="date" id="interventionSeance" class="controle-form">
                        </div>
                    </div>
                </div>

                <div class="intervention-flex-end">
                    <button type="button" data-action="afficherListeInterventions" class="btn btn-secondaire">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-principal">
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    `;

    // Initialiser la visibilité des blocs contexte/absences
    gererVisibiliteContexteIntervention();
}

/**
 * Sauvegarder une nouvelle intervention
 * @param {Event} event - Événement de soumission du formulaire
 */
function sauvegarderNouvelleIntervention(event) {
    event.preventDefault();

    var niveauRai = parseInt(document.getElementById('interventionNiveau').value);
    var contexteEl = document.getElementById('interventionContexte');
    var contexte = (niveauRai === 2 && contexteEl) ? contexteEl.value : 'hors-classe';

    // Dériver type et marquerMotivees depuis le contexte
    var type = 'groupe';
    if (contexte === 'mio') type = 'mio';
    else if (niveauRai === 3) type = 'individuel';

    var marquerMotivees = false;
    var seanceConcernee = null;
    if (contexte === 'rattrapage') {
        marquerMotivees = true;
        seanceConcernee = document.getElementById('interventionSeance').value || null;
    }

    const data = {
        titre: document.getElementById('interventionTitre').value,
        date: document.getElementById('interventionDate').value,
        heure: document.getElementById('interventionHeure').value,
        duree: parseFloat(document.getElementById('interventionDuree').value) || 2,
        niveauRai: niveauRai,
        contexte: contexte,
        type: type,
        description: document.getElementById('interventionDescription').value,
        seanceConcernee: seanceConcernee,
        marquerNonParticipantsMotives: marquerMotivees
    };

    const interventionId = creerIntervention(data);

    // Si un étudiant est pré-sélectionné, l'ajouter puis ouvrir l'intervention directement
    const daPreselectionne = document.getElementById('interventionDaPreselectionne');
    if (daPreselectionne && daPreselectionne.value) {
        marquerPresences(interventionId, [daPreselectionne.value]);
        ouvrirIntervention(interventionId);
        afficherNotificationSucces('Intervention créée — étudiant pré-sélectionné');
    } else {
        // Retourner à la liste
        afficherListeInterventions();
        afficherNotificationSucces('Intervention planifiée avec succès');
    }
}

/**
 * OBSOLÈTE : Cette fonction n'est plus utilisée. La modification se fait directement dans ouvrirIntervention().
 * Afficher le formulaire de modification d'une intervention
 * @param {string} interventionId - ID de l'intervention à modifier
 */
function afficherFormulaireModification(interventionId) {
    const intervention = obtenirIntervention(interventionId);

    if (!intervention) {
        alert('Intervention introuvable');
        return;
    }

    const container = document.getElementById('conteneurPrincipal');
    if (!container) return;

    container.innerHTML = `
        <div class="carte">
            <h3 class="intervention-mt-0">Modifier l'intervention</h3>

            <form id="form-modification-intervention" data-intervention-id="${interventionId}">
                <!-- Layout 2 colonnes : formulaire | gestion absences -->
                <div class="intervention-grid-1-09">
                    <!-- Colonne gauche : Champs du formulaire (50%) -->
                    <div>
                        <!-- Ligne 1 : Titre, Niveau RàI, Type -->
                        <div class="intervention-grid-2-1-1">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionTitre" class="label-formulaire">Titre :</label>
                                <input type="text" id="interventionTitre" class="controle-form" required
                                       value="${intervention.titre}" placeholder="Ex: Intervention Rigueur et Nuance">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionNiveau" class="label-formulaire">Niveau RàI :</label>
                                <select id="interventionNiveau" class="controle-form" required>
                                    <option value="2" ${intervention.niveauRai === 2 ? 'selected' : ''}>Niveau 2 (Groupe ciblé)</option>
                                    <option value="3" ${intervention.niveauRai === 3 ? 'selected' : ''}>Niveau 3 (Individuel)</option>
                                </select>
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionType" class="label-formulaire">Type :</label>
                                <select id="interventionType" class="controle-form" required>
                                    <option value="groupe" ${intervention.type === 'groupe' ? 'selected' : ''}>Groupe (séance en classe)</option>
                                    <option value="individuel" ${intervention.type === 'individuel' ? 'selected' : ''}>Individuel (rencontre en dispo)</option>
                                    <option value="mio" ${intervention.type === 'mio' ? 'selected' : ''}>Message écrit (MIO) à un groupe ciblé</option>
                                </select>
                            </div>
                        </div>

                        <!-- Ligne 2 : Date, Heure, Durée -->
                        <div class="intervention-grid-3col">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionDate" class="label-formulaire">Date :</label>
                                <input type="date" id="interventionDate" class="controle-form" required value="${intervention.date}">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionHeure" class="label-formulaire">Heure :</label>
                                <input type="time" id="interventionHeure" class="controle-form" value="${intervention.heure || ''}">
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
                                      placeholder="Objectifs de l'intervention, sujets abordés...">${intervention.description || ''}</textarea>
                        </div>
                    </div>

                    <!-- Colonne droite : Gestion des absences -->
                    <div class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0; height: fit-content;">
                        <h4 style="margin: 0 0 10px 0; color: var(--accent-primaire);" data-tooltip="interv-gestion-absences">Gestion des absences</h4>
                        <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                            Si cette intervention correspond à une séance de cours, tu peux marquer comme motivée l'absence des non-participants.
                        </p>

                        <div class="champ-formulaire" style="margin: 0 0 15px 0;">
                            <label for="interventionSeance" class="label-formulaire">Séance concernée :</label>
                            <input type="date" id="interventionSeance" class="controle-form" value="${intervention.seanceConcernee || ''}">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 5px;">
                                <input type="checkbox" id="interventionMarquerMotivees" style="width: auto;" ${intervention.marquerNonParticipantsMotives ? 'checked' : ''}>
                                <span class="u-texte-09">Marquer les non-participants comme absents motivés</span>
                            </label>
                            <small class="text-muted" style="font-size: 0.85rem;">
                                Les élèves non sélectionnés bénéficieront d'un «congé» pour cette séance.
                            </small>
                        </div>
                    </div>
                </div>

                <div class="intervention-flex-end">
                    <button type="button" data-action="afficherListeInterventions" class="btn btn-secondaire">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-principal">
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    `;
}

/**
 * OBSOLÈTE : Cette fonction n'est plus utilisée. La sauvegarde se fait via sauvegarderPresencesIntervention().
 * Sauvegarder les modifications d'une intervention
 * @param {Event} event - Événement de soumission du formulaire
 * @param {string} interventionId - ID de l'intervention à modifier
 */
function sauvegarderModificationIntervention(event, interventionId) {
    event.preventDefault();

    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index === -1) {
        alert('Intervention introuvable');
        return;
    }

    // Mettre à jour les données (OBSOLÈTE — conservé pour rétrocompatibilité)
    var niveauObs = parseInt(document.getElementById('interventionNiveau').value);
    var contexteObsEl = document.getElementById('interventionContexte');
    var contexteObs = (niveauObs === 2 && contexteObsEl) ? contexteObsEl.value : 'hors-classe';
    var typeObs = 'groupe';
    if (contexteObs === 'mio') typeObs = 'mio';
    else if (niveauObs === 3) typeObs = 'individuel';

    interventions[index].titre = document.getElementById('interventionTitre').value;
    interventions[index].date = document.getElementById('interventionDate').value;
    interventions[index].heure = document.getElementById('interventionHeure').value;
    interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
    interventions[index].niveauRai = niveauObs;
    interventions[index].contexte = contexteObs;
    interventions[index].type = typeObs;
    interventions[index].description = document.getElementById('interventionDescription').value;
    if (contexteObs === 'rattrapage') {
        interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
        interventions[index].marquerNonParticipantsMotives = true;
    } else {
        interventions[index].seanceConcernee = null;
        interventions[index].marquerNonParticipantsMotives = false;
    }
    interventions[index].dateModification = Date.now();

    sauvegarderInterventions(interventions);

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    afficherNotificationSucces('Intervention modifiée avec succès');
}

/**
 * Ouvrir une intervention pour marquer les présences
 * @param {string} interventionId - ID de l'intervention
 */
function ouvrirIntervention(interventionId) {
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
        const indices = calculerTousLesIndices(etudiant.da);
        const cible = determinerCibleIntervention(etudiant.da);
        const noteExistante = intervention.notesIndividuelles?.[etudiant.da] || '';

        listeHtml += `
            <div style="display: grid; grid-template-columns: auto 1fr 2fr auto; gap: 10px; align-items: center;
                        padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 5px;">
                <input type="checkbox" id="etud-${etudiant.da}" value="${etudiant.da}" ${checked}
                       data-on-change="afficherAnalyseTempsReel" data-param="${intervention.id}"
                       style="width: auto; margin: 0;">
                <label for="etud-${etudiant.da}" style="font-weight: 500; margin: 0; cursor: pointer;">
                    ${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}
                </label>
                <textarea id="note-${etudiant.da}" class="controle-form" rows="1"
                          placeholder="Note individuelle..."
                          style="font-size: 0.85rem; resize: vertical;">${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(noteExistante, etudiant.da) : noteExistante)}</textarea>
                <span class="badge-rai-${cible.niveau}">Niveau ${cible.niveau}</span>
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

    container.innerHTML = `
        <div class="carte">
            <h3 style="margin: 0 0 20px 0;">${intervention.titre}</h3>

            <!-- Section informations éditables -->
            <div class="intervention-grid-1-09">
                <!-- Colonne gauche : Informations de base -->
                <div>
                    <!-- Ligne 1 : Titre + Niveau RàI -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionTitre" class="label-formulaire">Titre :</label>
                            <input type="text" id="interventionTitre" class="controle-form" required
                                   value="${intervention.titre}" placeholder="Ex: Intervention Rigueur et Nuance">
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
                            <input type="date" id="interventionDate" class="controle-form" required value="${intervention.date}">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label for="interventionHeure" class="label-formulaire">Heure :</label>
                            <input type="time" id="interventionHeure" class="controle-form" value="${intervention.heure || ''}">
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
                                  placeholder="Objectifs de l'intervention, sujets abord\u00e9s...">${intervention.description || ''}</textarea>
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
                            <input type="date" id="interventionSeance" class="controle-form" value="${intervention.seanceConcernee || ''}">
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
                        Cette aggrégation des profils des étudiant·e·s vise à éclairer ta préparation.
                    </p>
                    <div id="analyseTempsReel"></div>
                </div>

                <!-- Colonne droite: Liste des étudiants avec notes (60%) -->
                <div>
                    <h4 data-tooltip="interv-presences-notes">Marquer les présences et notes individuelles</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Coche les étudiant·e·s présent·e·s et documente tes observations spécifiques.
                    </p>

                    <div id="listeEtudiantsIntervention" class="liste-etudiants-intervention">
                        ${listeHtml}
                    </div>
                </div>
            </div>

            <!-- Observations générales (pleine largeur) -->
            <div class="carte" style="margin-bottom: 20px;">
                <h4 class="intervention-mt-0">Observations générales</h4>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 10px;">
                    Note tes observations durant l'intervention (stratégies à nouveau enseignées, réception du groupe...)
                </p>
                <textarea id="observationsIntervention" class="controle-form" rows="6" placeholder="Ex: Stratégie de lecture n°3...">${intervention.observations || ''}</textarea>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button data-action="afficherListeInterventions" class="btn btn-secondaire">
                    Annuler
                </button>
                <button data-action="sauvegarderPresencesIntervention" data-param="${interventionId}" class="btn btn-principal">
                    Sauvegarder
                </button>
            </div>
        </div>
    `;

    // Initialiser la visibilité des blocs contexte/absences
    gererVisibiliteContexteIntervention();

    // Afficher l'analyse initiale si des étudiants sont déjà cochés
    setTimeout(() => {
        if (intervention.etudiants.length > 0) {
            afficherAnalyseTempsReel(interventionId);
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
        analyseDiv.innerHTML = '<p class="text-muted" style="font-style: italic;">Coche des étudiant·e·s pour voir l\'analyse du sous-groupe.</p>';
        return;
    }

    const analyse = analyserSousGroupe(dasSelectionnes);
    analyseDiv.innerHTML = genererAffichageAnalyseCartes(analyse);
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
                    placeholder="Ex: Excellente participation, a bien saisi la stratégie enseignée..."
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
    const observationsField = document.getElementById('observationsIntervention');
    const observations = observationsField ? observationsField.value : '';

    // Lire le statut depuis les boutons radio
    const statutRadio = document.querySelector('input[name="interventionStatut"]:checked');
    const nouveauStatut = statutRadio ? statutRadio.value : 'en-cours';

    // Marquer les présences (met à jour etudiants et analyse)
    marquerPresences(interventionId, dasSelectionnes);

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

        // Récupérer les notes individuelles pour chaque étudiant présent
        const notesIndividuelles = {};
        dasSelectionnes.forEach(da => {
            const noteField = document.getElementById(`note-${da}`);
            if (noteField && noteField.value.trim()) {
                notesIndividuelles[da] = noteField.value.trim();
            }
        });
        interventions[index].notesIndividuelles = notesIndividuelles;

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
    afficherNotificationSucces('Intervention sauvegardée avec succès');

}

/**
 * OBSOLÈTE : Cette fonction n'est plus utilisée. Le statut se gère via les boutons radio dans le formulaire.
 * Terminer une intervention (sauvegarder + marquer comme complétée)
 * @param {string} interventionId - ID de l'intervention
 */
function terminerIntervention(interventionId) {
    const checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    const dasSelectionnes = Array.from(checkboxes).map(cb => cb.value);
    const observationsField = document.getElementById('observationsIntervention');
    const observations = observationsField ? observationsField.value : '';

    // Marquer les présences (met à jour etudiants et analyse)
    marquerPresences(interventionId, dasSelectionnes);

    // Sauvegarder TOUTES les informations de l'intervention
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        // Dériver contexte, type et absences depuis le formulaire
        var niveauTerm = parseInt(document.getElementById('interventionNiveau').value);
        var contexteElTerm = document.getElementById('interventionContexte');
        var contexteTerm = (niveauTerm === 2 && contexteElTerm) ? contexteElTerm.value : 'hors-classe';
        var typeTerm = 'groupe';
        if (contexteTerm === 'mio') typeTerm = 'mio';
        else if (niveauTerm === 3) typeTerm = 'individuel';

        // Mettre à jour les informations de base
        interventions[index].titre = document.getElementById('interventionTitre').value;
        interventions[index].date = document.getElementById('interventionDate').value;
        interventions[index].heure = document.getElementById('interventionHeure').value;
        interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
        interventions[index].niveauRai = niveauTerm;
        interventions[index].contexte = contexteTerm;
        interventions[index].type = typeTerm;
        interventions[index].description = document.getElementById('interventionDescription').value;
        if (contexteTerm === 'rattrapage') {
            interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
            interventions[index].marquerNonParticipantsMotives = true;
        } else {
            interventions[index].seanceConcernee = null;
            interventions[index].marquerNonParticipantsMotives = false;
        }

        // Mettre à jour observations
        interventions[index].observations = observations;

        // Récupérer les notes individuelles pour chaque étudiant présent
        const notesIndividuelles = {};
        dasSelectionnes.forEach(da => {
            const noteField = document.getElementById(`note-${da}`);
            if (noteField && noteField.value.trim()) {
                notesIndividuelles[da] = noteField.value.trim();
            }
        });
        interventions[index].notesIndividuelles = notesIndividuelles;

        interventions[index].dateModification = Date.now();
        sauvegarderInterventions(interventions);
    }

    // Marquer comme complétée
    completerIntervention(interventionId);

    // Transférer les présences vers le module presences.js
    transfererPresencesVersModule(interventionId);

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    afficherNotificationSucces('Intervention complétée avec succès');
}

/**
 * OBSOLÈTE : Cette fonction n'est plus utilisée. Le statut se gère via les boutons radio dans le formulaire.
 * Rouvrir une intervention complétée pour permettre des corrections
 * @param {string} interventionId - ID de l'intervention
 */
function rouvrirIntervention(interventionId) {
    if (!confirm('Rouvrir cette intervention ? Elle repassera au statut "En cours" et tu pourras la modifier à nouveau.')) {
        return;
    }

    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        // Changer le statut de 'completee' à 'en-cours'
        interventions[index].statut = 'en-cours';
        interventions[index].dateModification = Date.now();

        sauvegarderInterventions(interventions);
    }

    // Recharger la page de l'intervention pour afficher le bouton "Marquer comme complétée"
    ouvrirIntervention(interventionId);

    // Notification de succès
    afficherNotificationSucces('Intervention rouverte - Tu peux maintenant la modifier');
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
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : obtenirDonneesSelonMode('groupeEtudiants');
    // Obtenir les présences existantes
    // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée pour le trimestre actif
    const clePresences = cle('presences');
    let presences = db.getSync(clePresences, []);

    // Supprimer les entrées existantes pour cette date (pour éviter les doublons)
    presences = presences.filter(p => p.date !== intervention.date);
    // Créer une entrée de présence pour chaque étudiant
    let nbPresentsAjoutes = 0;
    let nbAbsentsAjoutes = 0;

    // Obtenir la durée de l'intervention (par défaut 2h si non spécifiée)
    const dureeIntervention = intervention.duree || 2;

    // RÈGLE IMPORTANTE :
    // - Niveau 2 (préventif en classe) : Si checkbox cochée, créer entrée pour TOUS (absents = motivés)
    // - Niveau 3 (intensif hors classe) : Si checkbox cochée, créer entrée pour TOUS (absents = motivés)
    // - Si checkbox NON cochée : Créer entrée UNIQUEMENT pour participants
    const estNiveau3 = intervention.niveauRai === 3;
    const marquerMotives = intervention.marquerNonParticipantsMotives === true;

    etudiants.forEach(etudiant => {
        const estPresent = intervention.etudiants.includes(etudiant.da);

        // Si checkbox NON cochée : ignorer les non-participants (pas d'entrée de présence créée)
        if (!marquerMotives && !estPresent) {
            return; // Ne pas créer d'entrée de présence
        }

        // Déterminer les heures et la note selon la présence
        let heures, note;
        if (estPresent) {
            // Étudiant présent : heures selon la durée de l'intervention
            heures = dureeIntervention;
            note = `Intervention RàI : ${intervention.titre}`;
            nbPresentsAjoutes++;
        } else {
            // Étudiant absent (niveau 2 seulement) : 0 heures + note d'absence motivée
            heures = 0;
            note = 'Absence motivée RàI';
            nbAbsentsAjoutes++;
        }

        // Ajouter l'entrée de présence avec le flag facultatif
        presences.push({
            date: intervention.date,
            da: etudiant.da,
            heures: heures,
            notes: note,
            facultatif: true  // Flag indiquant que cette séance est facultative
        });
    });

    // Sauvegarder les présences mises à jour
    db.setSync(clePresences, presences);

    // Recalculer les indices d'assiduité
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    } else {
        console.warn('   ⚠️ Fonction calculerEtSauvegarderIndicesAssiduite non disponible');
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

// Delegation formulaires interventions (submit)
document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.id === 'form-nouvelle-intervention') {
        e.preventDefault();
        sauvegarderNouvelleIntervention(e);
    } else if (form.id === 'form-modification-intervention') {
        e.preventDefault();
        sauvegarderModificationIntervention(e, form.dataset.interventionId);
    }
});

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
window.sauvegarderNouvelleIntervention = sauvegarderNouvelleIntervention;
window.ouvrirIntervention = ouvrirIntervention;
window.sauvegarderPresencesIntervention = sauvegarderPresencesIntervention;
window.terminerIntervention = terminerIntervention;
window.rouvrirIntervention = rouvrirIntervention;
window.transfererPresencesVersModule = transfererPresencesVersModule;
window.initialiserModuleInterventions = initialiserModuleInterventions;
window.formaterDateLisible = formaterDateLisible;
window.genererBadgeStatut = genererBadgeStatut;
window.obtenirAbsencesMotiveesParDate = obtenirAbsencesMotiveesParDate;
window.supprimerInterventionEtRafraichir = supprimerInterventionEtRafraichir;
window.sauvegarderModificationIntervention = sauvegarderModificationIntervention;
window.afficherAnalyseTempsReel = afficherAnalyseTempsReel;


})();
