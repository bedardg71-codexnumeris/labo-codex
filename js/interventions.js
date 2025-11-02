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
 *     risqueMoyen: 0.45,
 *     risqueDistribution: { 'Minimal': 0, 'Faible': 2, 'Modéré': 3, 'Élevé': 2, 'Critique': 0 }
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
    const interventions = localStorage.getItem('interventions');
    return interventions ? JSON.parse(interventions) : [];
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

    localStorage.setItem('interventions', JSON.stringify(interventions));

    // Vérifier immédiatement la lecture
    const verification = localStorage.getItem('interventions');
    const parsed = JSON.parse(verification);
    console.log('   ✅ Vérification lecture immédiate:');
    console.log('   Nombre d\'interventions relues:', parsed.length);
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
    const risqueDistribution = { 'Minimal': 0, 'Faible': 0, 'Modéré': 0, 'Élevé': 0, 'Critique': 0 };
    let sommeRisque = 0;
    let nbEtudiants = dasEtudiants.length;

    dasEtudiants.forEach(da => {
        // Calculer les indices pour cet étudiant
        const indices = calculerTousLesIndices(da);
        const cible = determinerCibleIntervention(da);

        // Compter les niveaux RàI
        niveauxRai[cible.niveau] = (niveauxRai[cible.niveau] || 0) + 1;

        // Accumuler les risques
        sommeRisque += indices.R;

        // Distribution du risque
        const interpR = interpreterRisque(indices.R);
        risqueDistribution[interpR.niveau] = (risqueDistribution[interpR.niveau] || 0) + 1;

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
        risqueMoyen: nbEtudiants > 0 ? (sommeRisque / nbEtudiants) : 0,
        risqueDistribution: risqueDistribution
    };
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

    if (interventions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>Aucune intervention planifiée ou complétée.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Cliquez sur «Planifier une intervention» pour commencer.</p>
            </div>
        `;
        return;
    }

    let html = '';

    interventions.forEach(intervention => {
        const badgeStatut = genererBadgeStatut(intervention.statut);
        const badgeType = intervention.type === 'groupe' ? 'Groupe' : 'Individuel';
        const badgeNiveau = `Niveau ${intervention.niveauRai}`;

        html += `
            <div class="carte intervention-item" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 8px 0; color: var(--bleu-principal);">${intervention.titre}</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.85rem;">
                            <span>${badgeStatut}</span>
                            <span class="badge-sys" style="background: var(--bleu-tres-pale); color: var(--bleu-principal);">${badgeType}</span>
                            <span class="badge-sys badge-rai-${intervention.niveauRai}">${badgeNiveau}</span>
                            <span class="text-muted">${formaterDateLisible(intervention.date)}</span>
                            ${intervention.heure ? `<span class="text-muted">${intervention.heure}</span>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${intervention.statut !== 'completee' ? `
                            <button onclick="ouvrirIntervention('${intervention.id}')" class="btn btn-principal">
                                Ouvrir
                            </button>
                            <button onclick="afficherFormulaireModification('${intervention.id}')" class="btn btn-modifier">
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

                ${intervention.description ? `
                    <p style="margin: 10px 0; color: #666; font-size: 0.9rem;">${intervention.description}</p>
                ` : ''}

                ${intervention.etudiants && intervention.etudiants.length > 0 ? `
                    <p class="text-muted"><strong>Étudiants présents :</strong> ${intervention.etudiants.length}</p>
                ` : ''}

                ${intervention.analyse ? genererAffichageAnalyse(intervention.analyse) : ''}

                ${intervention.observations ? `
                    <div class="carte" style="margin-top: 10px; background: #fffef7;">
                        <h5 style="margin: 0 0 8px 0; color: var(--bleu-principal);">Observations générales</h5>
                        <p style="margin: 0; white-space: pre-wrap; color: #555;">${intervention.observations}</p>
                    </div>
                ` : ''}

                ${intervention.notesIndividuelles && Object.keys(intervention.notesIndividuelles).length > 0 ? genererAffichageNotesIndividuelles(intervention.notesIndividuelles) : ''}
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
        'planifiee': '<span class="badge-sys" style="background: #e3f2fd; color: #1976d2;">Planifiée</span>',
        'en-cours': '<span class="badge-sys" style="background: #fff3e0; color: #f57c00;">En cours</span>',
        'completee': '<span class="badge-sys" style="background: #e8f5e9; color: #388e3c;">Complétée</span>'
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
 * Générer l'affichage de l'analyse du sous-groupe
 * @param {Object} analyse - Données d'analyse
 * @returns {string} HTML de l'analyse
 */
function genererAffichageAnalyse(analyse) {
    if (!analyse || analyse.nbEtudiants === 0) return '';

    let html = `
        <div class="carte" style="background: var(--bleu-tres-pale); margin-top: 15px;">
            <h4 style="margin-top: 0; color: var(--bleu-principal);">Profilage du sous-groupe (${analyse.nbEtudiants} étudiant·e·s)</h4>
    `;

    // Niveaux RàI
    if (analyse.niveauxRai) {
        html += '<div class="profil-info-item"><strong>Répartition RàI :</strong><br>';
        const niveaux = Object.entries(analyse.niveauxRai)
            .filter(([niveau, count]) => count > 0)
            .map(([niveau, count]) => {
                const badge = niveau === '1' ? 'badge-rai-1' : niveau === '2' ? 'badge-rai-2' : 'badge-rai-3';
                return `<span class="badge-sys ${badge}">Niveau ${niveau} (${count})</span>`;
            })
            .join(' ');
        html += `${niveaux}</div>`;
    }

    // Distribution du risque
    if (analyse.risqueDistribution) {
        html += '<div class="profil-info-item"><strong>Répartition du risque :</strong><br>';
        const risques = Object.entries(analyse.risqueDistribution)
            .filter(([niveau, count]) => count > 0)
            .map(([niveau, count]) => `${niveau} (${count})`)
            .join(' • ');
        html += `<span class="text-muted">${risques}</span><br>`;
        html += `<strong>Risque moyen :</strong> ${(analyse.risqueMoyen * 100).toFixed(1)}%</div>`;
    }

    // Patterns d'apprentissage
    if (analyse.patternsCommuns && Object.keys(analyse.patternsCommuns).length > 0) {
        html += '<div class="profil-info-item"><strong>Patterns d\'apprentissage :</strong><br>';
        const patterns = Object.entries(analyse.patternsCommuns)
            .sort((a, b) => b[1] - a[1])
            .map(([pattern, count]) => `${pattern} (${count})`)
            .join(' • ');
        html += `<span class="text-muted">${patterns}</span></div>`;
    }

    // Progressions
    if (analyse.progressions && Object.keys(analyse.progressions).length > 0) {
        html += '<div class="profil-info-item"><strong>Progression :</strong><br>';
        const progs = Object.entries(analyse.progressions)
            .sort((a, b) => b[1] - a[1])
            .map(([prog, count]) => `${prog} (${count})`)
            .join(' • ');
        html += `<span class="text-muted">${progs}</span></div>`;
    }

    // Défis SRPNF communs
    if (analyse.defisCommuns && Object.keys(analyse.defisCommuns).length > 0) {
        html += '<div class="profil-info-item"><strong>Défis SRPNF communs :</strong><br>';
        const defis = Object.entries(analyse.defisCommuns)
            .sort((a, b) => b[1] - a[1])
            .map(([defi, count]) => `${defi} (${count})`)
            .join(' • ');
        html += `<span class="text-muted">${defis}</span></div>`;
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
    let html = `
        <div class="carte" style="margin-top: 10px; background: #f0f8ff;">
            <h5 style="margin: 0 0 8px 0; color: var(--bleu-principal);">Notes individuelles</h5>
    `;

    Object.entries(notesIndividuelles).forEach(([da, note]) => {
        const etudiant = etudiants.find(e => e.da === da);
        if (etudiant && note) {
            html += `
                <div style="margin-bottom: 8px;">
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
            <h3 style="margin-top: 0;">Planifier une intervention</h3>

            <form onsubmit="sauvegarderNouvelleIntervention(event); return false;">
                <div class="champ-formulaire">
                    <label for="interventionTitre" class="label-formulaire">Titre :</label>
                    <input type="text" id="interventionTitre" class="controle-form" required
                           placeholder="Ex: Intervention Rigueur et Nuance">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label for="interventionDate" class="label-formulaire">Date :</label>
                        <input type="date" id="interventionDate" class="controle-form" required value="${aujourdhui}">
                    </div>

                    <div>
                        <label for="interventionHeure" class="label-formulaire">Heure :</label>
                        <input type="time" id="interventionHeure" class="controle-form">
                    </div>

                    <div>
                        <label for="interventionNiveau" class="label-formulaire">Niveau RàI :</label>
                        <select id="interventionNiveau" class="controle-form" required>
                            <option value="2">Niveau 2 (Groupe ciblé)</option>
                            <option value="3">Niveau 3 (Individuel)</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 15px;">
                    <div class="champ-formulaire" style="margin: 0;">
                        <label for="interventionType" class="label-formulaire">Type :</label>
                        <select id="interventionType" class="controle-form" required>
                            <option value="groupe">Groupe (séance en classe)</option>
                            <option value="individuel">Individuel (rencontre en dispo)</option>
                        </select>
                    </div>

                    <div class="champ-formulaire" style="margin: 0;">
                        <label for="interventionDescription" class="label-formulaire">Description (optionnel) :</label>
                        <textarea id="interventionDescription" class="controle-form" rows="2"
                                  placeholder="Objectifs de l'intervention, sujets abordés..."></textarea>
                    </div>
                </div>

                <div class="carte" style="background: var(--bleu-tres-pale); padding: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--bleu-principal);">Gestion des absences</h4>
                    <p class="text-muted" style="margin: 0 0 15px 0; font-size: 0.9rem;">
                        Si cette intervention correspond à une séance de cours, vous pouvez marquer comme motivée l'absence des non-participants.
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; align-items: start;">
                        <div class="champ-formulaire" style="margin: 0;">
                            <label for="interventionSeance" class="label-formulaire">Séance concernée :</label>
                            <input type="date" id="interventionSeance" class="controle-form">
                        </div>

                        <div class="champ-formulaire" style="margin: 0;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 5px;">
                                <input type="checkbox" id="interventionMarquerMotivees" style="width: auto;">
                                <span>Marquer les non-participants comme absents motivés</span>
                            </label>
                            <small class="text-muted" style="font-size: 0.85rem;">
                                Les élèves non sélectionnés bénéficieront d'un «congé» pour cette séance.
                            </small>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="afficherListeInterventions()" class="btn btn-secondaire">
                        Annuler
                    </button>
                    <button type="submit" class="btn btn-principal">
                        Planifier l'intervention
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
            <h3 style="margin-top: 0;">Modifier l'intervention</h3>

            <form onsubmit="sauvegarderModificationIntervention(event, '${interventionId}'); return false;">
                <div class="champ-formulaire">
                    <label for="interventionTitre" class="label-formulaire">Titre :</label>
                    <input type="text" id="interventionTitre" class="controle-form" required
                           value="${intervention.titre}" placeholder="Ex: Intervention Rigueur et Nuance">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label for="interventionDate" class="label-formulaire">Date :</label>
                        <input type="date" id="interventionDate" class="controle-form" required value="${intervention.date}">
                    </div>

                    <div>
                        <label for="interventionHeure" class="label-formulaire">Heure :</label>
                        <input type="time" id="interventionHeure" class="controle-form" value="${intervention.heure || ''}">
                    </div>

                    <div>
                        <label for="interventionNiveau" class="label-formulaire">Niveau RàI :</label>
                        <select id="interventionNiveau" class="controle-form" required>
                            <option value="2" ${intervention.niveauRai === 2 ? 'selected' : ''}>Niveau 2 (Groupe ciblé)</option>
                            <option value="3" ${intervention.niveauRai === 3 ? 'selected' : ''}>Niveau 3 (Individuel)</option>
                        </select>
                    </div>
                </div>

                <div class="champ-formulaire">
                    <label for="interventionType" class="label-formulaire">Type :</label>
                    <select id="interventionType" class="controle-form" required>
                        <option value="groupe" ${intervention.type === 'groupe' ? 'selected' : ''}>Groupe (séance en classe)</option>
                        <option value="individuel" ${intervention.type === 'individuel' ? 'selected' : ''}>Individuel (rencontre en dispo)</option>
                    </select>
                </div>

                <div class="champ-formulaire">
                    <label for="interventionDescription" class="label-formulaire">Description (optionnel) :</label>
                    <textarea id="interventionDescription" class="controle-form" rows="3"
                              placeholder="Objectifs de l'intervention, sujets abordés...">${intervention.description || ''}</textarea>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
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
    interventions[index].niveauRai = parseInt(document.getElementById('interventionNiveau').value);
    interventions[index].type = document.getElementById('interventionType').value;
    interventions[index].description = document.getElementById('interventionDescription').value;
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
                <span class="badge-sys badge-rai-${cible.niveau}">Niveau ${cible.niveau}</span>
            </div>
        `;
    });

    console.log(`   📊 Résumé rendu: ${nbCheckboxesCochees} checkbox(es) cochée(s) sur ${etudiants.length}`);
    console.log('🔍 ouvrirIntervention() - FIN RENDU');

    container.innerHTML = `
        <div class="carte">
            <h3 style="margin-top: 0;">${intervention.titre}</h3>

            <div style="margin-bottom: 20px;">
                ${genererBadgeStatut(intervention.statut)}
                <span class="badge-sys" style="background: var(--bleu-tres-pale); color: var(--bleu-principal); margin-left: 8px;">
                    ${intervention.type === 'groupe' ? 'Groupe' : 'Individuel'}
                </span>
                <span class="badge-sys badge-rai-${intervention.niveauRai}" style="margin-left: 8px;">Niveau ${intervention.niveauRai}</span>
            </div>

            <p><strong>Date :</strong> ${formaterDateLisible(intervention.date)} ${intervention.heure ? 'à ' + intervention.heure : ''}</p>
            ${intervention.description ? `<p><strong>Description :</strong> ${intervention.description}</p>` : ''}

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; margin-bottom: 20px;">
                <!-- Colonne gauche: Liste des étudiants avec notes (66%) -->
                <div>
                    <h4>Marquer les présences et notes individuelles</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cochez les étudiant·e·s présent·e·s et documentez vos observations spécifiques.
                    </p>

                    <div id="listeEtudiantsIntervention" class="liste-etudiants-intervention">
                        ${listeHtml}
                    </div>
                </div>

                <!-- Colonne droite: Analyse du sous-groupe -->
                <div>
                    <h4>Profilage du sous-groupe</h4>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">
                        Cette aggrégation des profils des étudiant·e·s vise à éclairer votre préparation.
                    </p>
                    <div id="analyseTempsReel"></div>
                </div>
            </div>

            <!-- Observations générales (pleine largeur) -->
            <div class="carte" style="margin-bottom: 20px;">
                <h4 style="margin-top: 0;">Observations générales</h4>
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
                ${intervention.statut !== 'completee' ? `
                    <button onclick="terminerIntervention('${interventionId}')" class="btn btn-principal" style="background: var(--vert-succes);">
                        Marquer comme complétée
                    </button>
                ` : ''}
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
    analyseDiv.innerHTML = genererAffichageAnalyse(analyse);
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
            <h4 style="margin-top: 0;">Notes individuelles</h4>
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
                    style="font-size: 0.9rem;">${noteExistante}</textarea>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}

/**
 * Sauvegarder les présences, l'analyse et les observations d'une intervention
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

    console.log('💾 Sauvegarde intervention:', interventionId);
    console.log('   Nombre de checkboxes cochées trouvées:', checkboxes.length);
    console.log('   DAs extraits:', dasSelectionnes);
    console.log('   Observations:', observations ? `"${observations.substring(0, 50)}..."` : 'Aucune');

    // Marquer les présences (met à jour etudiants et analyse)
    marquerPresences(interventionId, dasSelectionnes);

    // Sauvegarder les observations et notes individuelles
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
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
 * Terminer une intervention
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

    // Sauvegarder les observations et notes individuelles
    const interventions = obtenirInterventions();
    const index = interventions.findIndex(i => i.id === interventionId);

    if (index !== -1) {
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

    // Retourner à la liste
    afficherListeInterventions();

    // Notification de succès
    afficherNotificationSucces('Intervention complétée avec succès');
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
    // Vérifier que localStorage.interventions existe
    if (!localStorage.getItem('interventions')) {
        localStorage.setItem('interventions', JSON.stringify([]));
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
window.initialiserModuleInterventions = initialiserModuleInterventions;
window.formaterDateLisible = formaterDateLisible;
window.genererBadgeStatut = genererBadgeStatut;
window.obtenirAbsencesMotiveesParDate = obtenirAbsencesMotiveesParDate;
