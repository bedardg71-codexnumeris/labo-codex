/* ===============================
   INTERVENTIONS.JS - Beta 85
   Gestion des interventions RàI
   =============================== */

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
    console.log('💾 sauvegarderInterventions() - ÉCRITURE localStorage');
    console.log('   Nombre d\'interventions à sauvegarder:', interventions.length);

    // Afficher les DAs de chaque intervention pour debug
    interventions.forEach((interv, index) => {
        console.log(`   [${index}] ${interv.id}:`, {
            titre: interv.titre,
            nbEtudiants: interv.etudiants.length,
            etudiants: interv.etudiants
        });
    });

    db.setSync(cle('interventions'), interventions);

    // Vérifier immédiatement la lecture
    const verification = db.getSync(cle('interventions'), null);
    console.log('   ✅ Vérification lecture immédiate:');
    console.log('   Nombre d\'interventions relues:', verification ? verification.length : 0);
    console.log('💾 sauvegarderInterventions() - FIN');
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
    const now = Date.now();

    const nouvelleIntervention = {
        id: `intervention-${now}`,
        date: data.date || '',
        heure: data.heure || '',
        duree: data.duree || 2,
        type: data.type || 'groupe',
        niveauRai: data.niveauRai || 2,
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
    console.log('🔍 marquerPresences() - DÉBUT');
    console.log('   interventionId:', interventionId);
    console.log('   dasEtudiants reçus:', dasEtudiants);
    console.log('   Nombre d\'étudiants:', dasEtudiants.length);

    const interventions = obtenirInterventions();
    const intervention = interventions.find(i => i.id === interventionId);

    if (!intervention) {
        console.error('❌ Intervention non trouvée:', interventionId);
        return;
    }

    console.log('   État AVANT modification:', {
        etudiantsAvant: intervention.etudiants,
        nbAvant: intervention.etudiants.length
    });

    intervention.etudiants = dasEtudiants;
    intervention.dateModification = Date.now();

    console.log('   État APRÈS modification:', {
        etudiantsApres: intervention.etudiants,
        nbApres: intervention.etudiants.length
    });

    // Générer l'analyse du sous-groupe
    if (dasEtudiants.length > 0) {
        intervention.analyse = analyserSousGroupe(dasEtudiants);
        console.log('   ✅ Analyse générée pour', dasEtudiants.length, 'étudiant(s)');
    }

    // Changer le statut si c'était planifié
    if (intervention.statut === 'planifiee') {
        intervention.statut = 'en-cours';
        console.log('   ✅ Statut changé: planifiee → en-cours');
    }

    sauvegarderInterventions(interventions);
    console.log('🔍 marquerPresences() - FIN');
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
    console.log('📋 afficherListeInterventions() appelée');

    // S'assurer que le conteneur principal existe et contient le bon HTML
    const conteneurPrincipal = document.getElementById('conteneurPrincipal');
    if (conteneurPrincipal) {
        // Vérifier si #listeInterventions existe, sinon le recréer
        let container = document.getElementById('listeInterventions');
        if (!container) {
            console.log('   ⚠️ #listeInterventions manquant, restauration...');
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

    console.log(`   ✅ Affichage de ${interventions.length} intervention(s)`);

    // Trier par date (plus récentes en premier)
    interventions.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.heure || '00:00'));
        const dateB = new Date(b.date + ' ' + (b.heure || '00:00'));
        return dateB - dateA;
    });

    // Bouton pour planifier une nouvelle intervention
    let html = `
        <div class="actions-principales">
            <button onclick="afficherFormulaireIntervention()" class="btn btn-principal">
                Planifier une intervention
            </button>
        </div>
    `;

    if (interventions.length === 0) {
        html += `
            <div class="message-vide">
                <p>Aucune intervention planifiée ou complétée.</p>
                <p class="message-vide-aide">Cliquez sur «Planifier une intervention» pour commencer.</p>
            </div>
        `;
        container.innerHTML = html;
        return;
    }

    interventions.forEach(intervention => {
        const badgeStatut = genererBadgeStatut(intervention.statut);
        const badgeType = intervention.type === 'groupe' ? 'Groupe' : 'Individuel';
        const badgeNiveau = `Niveau ${intervention.niveauRai}`;

        html += `
            <div class="carte intervention-item u-mb-15">
                <div class="intervention-header">
                    <div>
                        <h4 class="intervention-titre">${intervention.titre}</h4>
                        <div class="intervention-badges">
                            <span>${badgeStatut}</span>
                            <span class="badge-type-intervention">${badgeType}</span>
                            <span class="badge-rai-${intervention.niveauRai}">${badgeNiveau}</span>
                        </div>
                    </div>
                    <div class="intervention-actions">
                        ${intervention.statut !== 'completee' ? `
                            <button onclick="ouvrirIntervention('${intervention.id}')" class="btn btn-principal">
                                Modifier
                            </button>
                        ` : `
                            <button onclick="ouvrirIntervention('${intervention.id}')" class="btn btn-secondaire">
                                Consulter
                            </button>
                        `}
                        <button onclick="if(confirm('Supprimer cette intervention ?')) { supprimerIntervention('${intervention.id}'); afficherListeInterventions(); }" class="btn btn-supprimer">Supprimer</button>
                    </div>
                </div>

                <p class="intervention-description">${intervention.description || ''} <span class="text-muted">${formaterDateLisible(intervention.date)}${intervention.heure ? ` à ${intervention.heure}` : ''}</span></p>

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
                        <p>${intervention.observations}</p>
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
 * Formater une date en format lisible
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} Date formatée
 */
function formaterDateLisible(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-CA', options);
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
            <h4>Patterns d'apprentissage</h4>
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
            <h4>Niveaux RàI</h4>
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
                <h4>Notes individuelles</h4>
                <strong>${nbNotes}</strong>
            </div>
    `;

    Object.entries(notesIndividuelles).forEach(([da, note]) => {
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && note) {
            html += `
                <div style="margin-bottom: 8px; font-size: 0.9rem;">
                    <strong>${etudiant.prenom} ${etudiant.nom}:</strong> ${note}
                </div>
            `;
        }
    });

    html += '</div>';
    return html;
}

/**
 * Afficher le formulaire de création d'intervention
 */
function afficherFormulaireIntervention() {
    const container = document.getElementById('conteneurPrincipal');

    if (!container) return;

    // Date d'aujourd'hui par défaut
    const aujourdhui = new Date().toISOString().split('T')[0];

    container.innerHTML = `
        <div class="carte">
            <h3 class="intervention-mt-0">Planifier une intervention</h3>

            <form onsubmit="sauvegarderNouvelleIntervention(event); return false;">
                <!-- Layout 2 colonnes : formulaire | gestion absences -->
                <div class="intervention-grid-1-09">
                    <!-- Colonne gauche : Champs du formulaire (50%) -->
                    <div>
                        <!-- Ligne 1 : Titre, Niveau RàI, Type -->
                        <div class="intervention-grid-2-1-1">
                            <div class="champ-formulaire u-m-0">
                                <label for="interventionTitre" class="label-formulaire">Titre :</label>
                                <input type="text" id="interventionTitre" class="controle-form" required
                                       placeholder="Ex: Intervention Rigueur et Nuance">
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionNiveau" class="label-formulaire">Niveau RàI :</label>
                                <select id="interventionNiveau" class="controle-form" required>
                                    <option value="2">Niveau 2 (Groupe ciblé)</option>
                                    <option value="3">Niveau 3 (Individuel)</option>
                                </select>
                            </div>

                            <div class="champ-formulaire u-m-0">
                                <label for="interventionType" class="label-formulaire">Type :</label>
                                <select id="interventionType" class="controle-form" required>
                                    <option value="groupe">Groupe (séance en classe)</option>
                                    <option value="individuel">Individuel (rencontre en dispo)</option>
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
                                <label for="interventionDuree" class="label-formulaire">Durée (heures) :</label>
                                <input type="number" id="interventionDuree" class="controle-form" min="0.5" max="4" step="0.5" value="2" required>
                            </div>
                        </div>

                        <!-- Ligne 3 : Description -->
                        <div class="champ-formulaire u-m-0">
                            <label for="interventionDescription" class="label-formulaire">Description (optionnel) :</label>
                            <textarea id="interventionDescription" class="controle-form" rows="3"
                                      placeholder="Objectifs de l'intervention, sujets abordés..."></textarea>
                        </div>
                    </div>

                    <!-- Colonne droite : Gestion des absences -->
                    <div class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0; height: fit-content;">
                        <h4 style="margin: 0 0 10px 0; color: var(--bleu-principal);">Gestion des absences</h4>
                        <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                            Si cette intervention correspond à une séance de cours, vous pouvez marquer comme motivée l'absence des non-participants.
                        </p>

                        <div class="champ-formulaire" style="margin: 0 0 15px 0;">
                            <label for="interventionSeance" class="label-formulaire">Séance concernée :</label>
                            <input type="date" id="interventionSeance" class="controle-form">
                        </div>

                        <div class="champ-formulaire u-m-0">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 5px;">
                                <input type="checkbox" id="interventionMarquerMotivees" style="width: auto;">
                                <span class="u-texte-09">Marquer les non-participants comme absents motivés</span>
                            </label>
                            <small class="text-muted" style="font-size: 0.85rem;">
                                Les élèves non sélectionnés bénéficieront d'un «congé» pour cette séance.
                            </small>
                        </div>
                    </div>
                </div>

                <div class="intervention-flex-end">
                    <button type="button" onclick="afficherListeInterventions()" class="btn btn-secondaire">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-principal">
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
    `;
}

/**
 * Sauvegarder une nouvelle intervention
 * @param {Event} event - Événement de soumission du formulaire
 */
function sauvegarderNouvelleIntervention(event) {
    event.preventDefault();

    const data = {
        titre: document.getElementById('interventionTitre').value,
        date: document.getElementById('interventionDate').value,
        heure: document.getElementById('interventionHeure').value,
        duree: parseFloat(document.getElementById('interventionDuree').value) || 2,
        niveauRai: parseInt(document.getElementById('interventionNiveau').value),
        type: document.getElementById('interventionType').value,
        description: document.getElementById('interventionDescription').value,
        seanceConcernee: document.getElementById('interventionSeance').value || null,
        marquerNonParticipantsMotives: document.getElementById('interventionMarquerMotivees').checked
    };

    const interventionId = creerIntervention(data);

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    afficherNotificationSucces('Intervention planifiée avec succès');
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

            <form onsubmit="sauvegarderModificationIntervention(event, '${interventionId}'); return false;">
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
                                <label for="interventionDuree" class="label-formulaire">Durée (heures) :</label>
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
                        <h4 style="margin: 0 0 10px 0; color: var(--bleu-principal);">Gestion des absences</h4>
                        <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                            Si cette intervention correspond à une séance de cours, vous pouvez marquer comme motivée l'absence des non-participants.
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
                    <button type="button" onclick="afficherListeInterventions()" class="btn btn-secondaire">
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

    // Mettre à jour les données
    interventions[index].titre = document.getElementById('interventionTitre').value;
    interventions[index].date = document.getElementById('interventionDate').value;
    interventions[index].heure = document.getElementById('interventionHeure').value;
    interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
    interventions[index].niveauRai = parseInt(document.getElementById('interventionNiveau').value);
    interventions[index].type = document.getElementById('interventionType').value;
    interventions[index].description = document.getElementById('interventionDescription').value;
    interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
    interventions[index].marquerNonParticipantsMotives = document.getElementById('interventionMarquerMotivees').checked;
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

    // Obtenir la liste des étudiants
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

    console.log('🔍 ouvrirIntervention() - RENDU CHECKBOXES');
    console.log('   interventionId:', interventionId);
    console.log('   intervention.etudiants:', intervention.etudiants);
    console.log('   Nombre d\'étudiants présents:', intervention.etudiants.length);
    console.log('   Nombre total d\'étudiants du groupe:', etudiants.length);

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
            console.log(`   ✅ Checkbox cochée pour: ${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`);
        }
        const indices = calculerTousLesIndices(etudiant.da);
        const cible = determinerCibleIntervention(etudiant.da);
        const noteExistante = intervention.notesIndividuelles?.[etudiant.da] || '';

        listeHtml += `
            <div style="display: grid; grid-template-columns: auto 1fr 2fr auto; gap: 10px; align-items: center;
                        padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 5px;">
                <input type="checkbox" id="etud-${etudiant.da}" value="${etudiant.da}" ${checked}
                       onchange="afficherAnalyseTempsReel('${intervention.id}')"
                       style="width: auto; margin: 0;">
                <label for="etud-${etudiant.da}" style="font-weight: 500; margin: 0; cursor: pointer;">
                    ${etudiant.prenom} ${etudiant.nom}
                </label>
                <textarea id="note-${etudiant.da}" class="controle-form" rows="1"
                          placeholder="Note individuelle..."
                          style="font-size: 0.85rem; resize: vertical;">${noteExistante}</textarea>
                <span class="badge-rai-${cible.niveau}">Niveau ${cible.niveau}</span>
            </div>
        `;
    });

    console.log(`   📊 Résumé rendu: ${nbCheckboxesCochees} checkbox(es) cochée(s) sur ${etudiants.length}`);
    console.log('🔍 ouvrirIntervention() - FIN RENDU');

    container.innerHTML = `
        <div class="carte">
            <h3 style="margin: 0 0 20px 0;">${intervention.titre}</h3>

            <!-- Section informations éditables -->
            <div class="intervention-grid-1-09">
                <!-- Colonne gauche : Informations de base (50%) -->
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
                            <label for="interventionDuree" class="label-formulaire">Durée (heures) :</label>
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

                <!-- Colonne droite : Statut et gestion des absences -->
                <div class="carte" style="background: var(--bleu-tres-pale); padding: 15px; margin: 0; height: fit-content;">
                    <h4 style="margin: 0 0 10px 0; color: var(--bleu-principal);">Statut de l'intervention</h4>
                    <div class="champ-formulaire" style="margin: 0 0 20px 0;">
                        <div style="display: flex; gap: 15px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="interventionStatut" value="en-cours" ${intervention.statut !== 'completee' ? 'checked' : ''} style="width: auto; margin: 0;">
                                <span class="u-texte-09">En préparation</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="interventionStatut" value="completee" ${intervention.statut === 'completee' ? 'checked' : ''} style="width: auto; margin: 0;">
                                <span class="u-texte-09">Complétée</span>
                            </label>
                        </div>
                    </div>

                    <hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;">

                    <h4 style="margin: 0 0 10px 0; color: var(--bleu-principal);">Gestion des absences</h4>
                    <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                        Si cette intervention correspond à une séance de cours, vous pouvez marquer comme motivée l'absence des non-participants.
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

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

            <div style="display: grid; grid-template-columns: 40fr 60fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                <!-- Colonne gauche: Aperçu du sous-groupe (40%) -->
                <div>
                    <h4>Aperçu du sous-groupe</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cette aggrégation des profils des étudiant·e·s vise à éclairer votre préparation.
                    </p>
                    <div id="analyseTempsReel"></div>
                </div>

                <!-- Colonne droite: Liste des étudiants avec notes (60%) -->
                <div>
                    <h4>Marquer les présences et notes individuelles</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cochez les étudiant·e·s présent·e·s et documentez vos observations spécifiques.
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
                    Notez vos observations durant l'intervention (stratégies à nouveau enseignées, réception du groupe...)
                </p>
                <textarea id="observationsIntervention" class="controle-form" rows="6" placeholder="Ex: Stratégie de lecture n°3...">${intervention.observations || ''}</textarea>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button onclick="afficherListeInterventions()" class="btn btn-secondaire">
                    Annuler
                </button>
                <button onclick="sauvegarderPresencesIntervention('${interventionId}')" class="btn btn-principal">
                    Sauvegarder
                </button>
            </div>
        </div>
    `;

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
        analyseDiv.innerHTML = '<p class="text-muted" style="font-style: italic;">Cochez des étudiant·e·s pour voir l\'analyse du sous-groupe.</p>';
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
                Documentez vos observations spécifiques pour chaque étudiant·e (participation, compréhension, besoins identifiés...)
            </p>
    `;

    dasSelectionnes.forEach(da => {
        const etudiant = etudiants.find(e => e.da === da);
        if (!etudiant) return;

        const noteExistante = intervention.notesIndividuelles[da] || '';

        html += `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px; color: var(--bleu-principal);">
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
    console.log('====================================');
    console.log('📝 DÉBUT sauvegarderPresencesIntervention()');
    console.log('====================================');

    const checkboxes = document.querySelectorAll('#listeEtudiantsIntervention input[type="checkbox"]:checked');
    const dasSelectionnes = Array.from(checkboxes).map(cb => cb.value);
    const observationsField = document.getElementById('observationsIntervention');
    const observations = observationsField ? observationsField.value : '';

    // Lire le statut depuis les boutons radio
    const statutRadio = document.querySelector('input[name="interventionStatut"]:checked');
    const nouveauStatut = statutRadio ? statutRadio.value : 'en-cours';

    console.log('💾 Sauvegarde intervention:', interventionId);
    console.log('   Nombre de checkboxes cochées trouvées:', checkboxes.length);
    console.log('   DAs extraits:', dasSelectionnes);
    console.log('   Observations:', observations ? `"${observations.substring(0, 50)}..."` : 'Aucune');
    console.log('   Nouveau statut:', nouveauStatut);

    // Marquer les présences (met à jour etudiants et analyse)
    marquerPresences(interventionId, dasSelectionnes);

    // Sauvegarder TOUTES les informations de l'intervention
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        const ancienStatut = interventions[index].statut;

        // Mettre à jour les informations de base
        interventions[index].titre = document.getElementById('interventionTitre').value;
        interventions[index].date = document.getElementById('interventionDate').value;
        interventions[index].heure = document.getElementById('interventionHeure').value;
        interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
        interventions[index].niveauRai = parseInt(document.getElementById('interventionNiveau').value);
        interventions[index].type = document.getElementById('interventionType').value;
        interventions[index].description = document.getElementById('interventionDescription').value;
        interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
        interventions[index].marquerNonParticipantsMotives = document.getElementById('interventionMarquerMotivees').checked;

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
        console.log('✅ Intervention sauvegardée dans localStorage');
        console.log('   Notes individuelles:', Object.keys(notesIndividuelles).length, 'étudiant(s)');

        // Si l'intervention vient d'être marquée comme complétée, transférer les présences
        if (nouveauStatut === 'completee' && ancienStatut !== 'completee') {
            console.log('🔄 Intervention marquée comme complétée : transfert des présences vers le module...');
            transfererPresencesVersModule(interventionId);
        }
        // Si l'intervention est déjà complétée, re-transférer les présences au cas où il y aurait des changements
        else if (nouveauStatut === 'completee') {
            console.log('🔄 Intervention complétée : re-transfert des présences vers le module...');
            transfererPresencesVersModule(interventionId);
        }
    }

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    afficherNotificationSucces('Intervention sauvegardée avec succès');

    console.log('====================================');
    console.log('✅ FIN sauvegarderPresencesIntervention()');
    console.log('====================================');
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

    console.log('✅ Complétion intervention:', interventionId);

    // Marquer les présences (met à jour etudiants et analyse)
    marquerPresences(interventionId, dasSelectionnes);

    // Sauvegarder TOUTES les informations de l'intervention
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        // Mettre à jour les informations de base
        interventions[index].titre = document.getElementById('interventionTitre').value;
        interventions[index].date = document.getElementById('interventionDate').value;
        interventions[index].heure = document.getElementById('interventionHeure').value;
        interventions[index].duree = parseFloat(document.getElementById('interventionDuree').value) || 2;
        interventions[index].niveauRai = parseInt(document.getElementById('interventionNiveau').value);
        interventions[index].type = document.getElementById('interventionType').value;
        interventions[index].description = document.getElementById('interventionDescription').value;
        interventions[index].seanceConcernee = document.getElementById('interventionSeance').value || null;
        interventions[index].marquerNonParticipantsMotives = document.getElementById('interventionMarquerMotivees').checked;

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
    if (!confirm('Rouvrir cette intervention ? Elle repassera au statut "En cours" et vous pourrez la modifier à nouveau.')) {
        return;
    }

    console.log('🔄 Réouverture intervention:', interventionId);

    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
        // Changer le statut de 'completee' à 'en-cours'
        interventions[index].statut = 'en-cours';
        interventions[index].dateModification = Date.now();

        sauvegarderInterventions(interventions);
        console.log('✅ Intervention rouverte: statut changé à "en-cours"');
    }

    // Recharger la page de l'intervention pour afficher le bouton "Marquer comme complétée"
    ouvrirIntervention(interventionId);

    // Notification de succès
    afficherNotificationSucces('Intervention rouverte - Vous pouvez maintenant la modifier');
}

/**
 * Transférer les présences d'une intervention vers le module presences.js
 * Cette fonction crée des entrées de présences facultatives pour TOUS les étudiants,
 * qu'ils aient participé ou non à l'intervention.
 *
 * @param {string} interventionId - ID de l'intervention
 */
function transfererPresencesVersModule(interventionId) {
    console.log('====================================');
    console.log('📤 DÉBUT transfererPresencesVersModule()');
    console.log('====================================');

    const intervention = obtenirIntervention(interventionId);
    if (!intervention) {
        console.error('❌ Intervention introuvable:', interventionId);
        return;
    }

    console.log('   Intervention:', intervention.titre);
    console.log('   Date:', intervention.date);
    console.log('   Étudiants présents:', intervention.etudiants.length);

    // Obtenir tous les étudiants du groupe
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    console.log('   Total étudiants du groupe:', etudiants.length);

    // Obtenir les présences existantes
    // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée pour le trimestre actif
    const clePresences = (typeof cle === 'function') ? cle('presences') : 'presences';
    let presences = db.getSync(clePresences, []);

    // Supprimer les entrées existantes pour cette date (pour éviter les doublons)
    presences = presences.filter(p => p.date !== intervention.date);
    console.log('   Présences après filtrage doublons:', presences.length);

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
            console.log(`   ⊘ ${etudiant.prenom} ${etudiant.nom}: NON CONCERNÉ (checkbox non cochée)`);
            return; // Ne pas créer d'entrée de présence
        }

        // Déterminer les heures et la note selon la présence
        let heures, note;
        if (estPresent) {
            // Étudiant présent : heures selon la durée de l'intervention
            heures = dureeIntervention;
            note = `Intervention RàI : ${intervention.titre}`;
            nbPresentsAjoutes++;
            console.log(`   ✅ ${etudiant.prenom} ${etudiant.nom}: PRÉSENT (${heures}h)`);
        } else {
            // Étudiant absent (niveau 2 seulement) : 0 heures + note d'absence motivée
            heures = 0;
            note = 'Absence motivée RàI';
            nbAbsentsAjoutes++;
            console.log(`   ⚪ ${etudiant.prenom} ${etudiant.nom}: ABSENT MOTIVÉ (absence justifiée)`);
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

    console.log('   ───────────────────────────────────');
    if (estNiveau3) {
        console.log(`   📊 Résumé niveau 3 (hors classe): ${nbPresentsAjoutes} participant(s) ajouté(s)`);
        console.log(`   ℹ️  Les autres étudiants ne sont PAS affectés (pas d'entrée de présence créée)`);
    } else {
        console.log(`   📊 Résumé niveau 2 (en classe): ${nbPresentsAjoutes} présents, ${nbAbsentsAjoutes} absents motivés`);
    }
    console.log('   ───────────────────────────────────');

    // Sauvegarder les présences mises à jour
    db.setSync('presences', presences);
    console.log('   💾 Présences sauvegardées dans localStorage');

    // Recalculer les indices d'assiduité
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
        console.log('   🔄 Indices d\'assiduité recalculés');
    } else {
        console.warn('   ⚠️ Fonction calculerEtSauvegarderIndicesAssiduite non disponible');
    }

    console.log('====================================');
    console.log(`✅ FIN transfererPresencesVersModule()`);
    console.log('====================================');
}

/* ===============================
   NOTIFICATIONS
   =============================== */

/**
 * Afficher une notification de succès
 * @param {string} message - Message à afficher
 */
function afficherNotificationSucces(message) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--vert-succes);
        color: white;
        padding: 16px 24px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-size: 0.95rem;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Retirer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
        const sousSection = document.getElementById('tableau-bord-interventions');
        if (sousSection && sousSection.classList.contains('active')) {
            console.log('🔄 Sous-section Interventions devenue active, affichage de la liste...');
            afficherListeInterventions();
        }
    });

    // Observer les changements de classe sur toutes les sous-sections
    document.querySelectorAll('.sous-section').forEach(section => {
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });

    // Afficher la liste si la sous-section est déjà active
    const sousSection = document.getElementById('tableau-bord-interventions');
    if (sousSection && sousSection.classList.contains('active')) {
        afficherListeInterventions();
    }

    console.log('✅ Module Interventions initialisé');
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

    // Récupérer tous les étudiants du groupe
    const tousLesEtudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
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
