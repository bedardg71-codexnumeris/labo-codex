/* ===============================
   MODULE PORTFOLIO: GESTION DES PORTFOLIOS ÉTUDIANTS
   
   Contenu:
   - Affichage du portfolio d'un étudiant
   - Liste des artefacts (remis/non remis)
   - Sélection des artefacts retenus pour note finale
   - Calcul notes provisoires et finales
   - Sauvegarde des sélections
   =============================== */

/* ===============================
   DÉPENDANCES
   
   LocalStorage lu:
   - 'productions' : Array des productions (inclut portfolio + artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations par étudiant
   - 'portfoliosEleves' : Object {da: {portfolioId: {artefactsRetenus: [...]}}}
   =============================== */

/**
 * Charge et affiche le portfolio détaillé d'un étudiant
 * @param {string} da - DA de l'étudiant
 */
function chargerPortfolioEleveDetail(da) {
    try {
        // Récupérer les données
        const productions = JSON.parse(localStorage.getItem('productions') || '[]');
        const portfolio = productions.find(p => p.type === 'portfolio');

        if (!portfolio) {
            document.getElementById('portfolioEleveDetail').innerHTML =
                '<p class="text-muted">Aucun portfolio configuré dans Réglages › Productions.</p>';
            return;
        }

        // Récupérer tous les artefacts-portfolio créés
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

        // Récupérer les évaluations de cet élève
        const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        // Récupérer les sélections de portfolio
        const selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
        const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

        // Nombre total prévu (nouveau champ)
        const nombreTotal = portfolio.regles.nombreTotal || artefactsPortfolio.length;
        const minimumRequis = portfolio.regles.minimumCompletion || 7;
        const nombreARetenir = portfolio.regles.nombreARetenir || 3;

        // Construire la liste des artefacts avec leur statut
        const artefacts = [];
        
        // Ajouter les artefacts existants
        artefactsPortfolio.forEach(art => {
            const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
            artefacts.push({
                id: art.id,
                titre: art.titre,
                description: art.description || '',
                remis: !!evaluation,
                note: evaluation?.noteFinale || null,
                niveau: evaluation?.niveauFinal || null,
                retenu: selectionEleve.artefactsRetenus.includes(art.id),
                existe: true
            });
        });

        // Ajouter les artefacts "à venir" si nécessaire
        const artefactsManquants = nombreTotal - artefactsPortfolio.length;
        for (let i = 0; i < artefactsManquants; i++) {
            artefacts.push({
                id: null,
                titre: `Artefact #${artefactsPortfolio.length + i + 1}`,
                description: 'À venir',
                remis: false,
                note: null,
                niveau: null,
                retenu: false,
                existe: false
            });
        }

        // Trier : artefacts remis en premier, puis existants, puis à venir
        artefacts.sort((a, b) => {
            if (a.remis && !b.remis) return -1;
            if (!a.remis && b.remis) return 1;
            if (a.existe && !b.existe) return -1;
            if (!a.existe && b.existe) return 1;
            return 0;
        });

        // ✨ SÉLECTION AUTOMATIQUE des meilleurs artefacts si aucune sélection manuelle
        if (selectionEleve.artefactsRetenus.length === 0) {
            // Récupérer les artefacts remis avec note, triés par note décroissante
            const artefactsRemisAvecNote = artefacts
                .filter(a => a.remis && a.note !== null)
                .sort((a, b) => b.note - a.note);

            // Sélectionner automatiquement les N meilleurs (N = nombreARetenir)
            const meilleurs = artefactsRemisAvecNote.slice(0, nombreARetenir);

            if (meilleurs.length > 0) {
                // Mettre à jour la sélection
                selectionEleve.artefactsRetenus = meilleurs.map(a => a.id);

                // Sauvegarder dans localStorage
                if (!selectionsPortfolios[da]) {
                    selectionsPortfolios[da] = {};
                }
                selectionsPortfolios[da][portfolio.id] = {
                    artefactsRetenus: selectionEleve.artefactsRetenus,
                    dateSelection: new Date().toISOString(),
                    auto: true // Flag pour indiquer sélection automatique
                };
                localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

                // 🔄 Recalculer les indices C et P après sélection automatique
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }

                // Mettre à jour le flag retenu dans les artefacts
                artefacts.forEach(art => {
                    art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
                });

                console.log(`✨ Sélection automatique : ${meilleurs.length} meilleur(s) artefact(s) sélectionné(s)`);
            }
        }

        // Statistiques
        const nbRemis = artefacts.filter(a => a.remis).length;
        const nbRetenus = selectionEleve.artefactsRetenus.length;

        // Calculer les notes
        const artefactsAvecNote = artefacts.filter(a => a.remis && a.note !== null);
        const noteProvisoire = artefactsAvecNote.length > 0
            ? artefactsAvecNote.reduce((sum, a) => sum + a.note, 0) / artefactsAvecNote.length
            : null;

        const artefactsRetenusAvecNote = artefacts.filter(a => a.retenu && a.note !== null);
        const noteFinale = nbRetenus === nombreARetenir && artefactsRetenusAvecNote.length > 0
            ? artefactsRetenusAvecNote.reduce((sum, a) => sum + a.note, 0) / artefactsRetenusAvecNote.length
            : null;

        // Générer le HTML
        const container = document.getElementById('portfolioEleveDetail');
        container.innerHTML = `
            <!-- Barre de progression -->
            <div style="background: var(--bleu-tres-pale); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span><strong>Progression :</strong> ${nbRemis}/${minimumRequis} remis ${nombreTotal > minimumRequis ? `(${nombreTotal} artefacts prévus)` : ''}</span>
                    <span style="color: ${nbRemis >= minimumRequis ? 'green' : 'orange'};">
                        ${nbRemis >= minimumRequis ? '✓ Minimum atteint' : 'Minimum requis'}
                    </span>
                </div>
                <div style="background: #ddd; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background: var(--bleu-principal); height: 100%; width: ${Math.min((nbRemis / minimumRequis) * 100, 100)}%; 
                                transition: width 0.3s ease;"></div>
                </div>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    <strong>${nombreARetenir}</strong> artefacts à retenir pour la note finale
                </p>
            </div>

            <!-- Liste des artefacts -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--bleu-principal); margin-bottom: 15px;">📑 Artefacts du portfolio (${artefacts.length})</h4>
                ${artefacts.map((art, index) => `
                    <div style="padding: 15px; margin-bottom: 10px;
                                background: ${art.retenu ? 'linear-gradient(to right, #d4edda, #e8f5e9)' : (!art.existe ? '#f8f9fa' : 'white')};
                                border: ${art.retenu ? '3px' : '2px'} solid ${art.retenu ? '#28a745' : (art.existe ? '#ddd' : '#e0e0e0')};
                                border-radius: 8px; ${!art.remis ? 'opacity: 0.7;' : ''}
                                ${art.retenu ? 'box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);' : ''}
                                transition: all 0.3s ease;">
                        ${art.existe ? `
                        <label style="display: flex; align-items: start; cursor: ${art.remis ? 'pointer' : 'not-allowed'};">
                            <input type="checkbox"
                                   name="artefactRetenu"
                                   value="${art.id}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   onchange="toggleArtefactPortfolio('${da}', '${portfolio.id}', ${nombreARetenir})"
                                   style="margin-right: 15px; margin-top: 3px; transform: scale(1.4); accent-color: #28a745;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: ${art.retenu ? '#155724' : 'var(--bleu-principal)'}; margin-bottom: 5px;">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div style="display: flex; gap: 15px; font-size: 0.85rem;">
                                    ${art.remis
                                        ? `<span style="color: green;">✓ Remis</span>
                                           <span><strong>Note :</strong> ${art.note}/100</span>
                                           <span><strong>Niveau :</strong> ${echapperHtml(art.niveau)}</span>`
                                        : '<span style="color: #999;">— Non remis</span>'}
                                </div>
                            </div>
                        </label>
                        ` : `
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 18px; height: 18px; border: 2px dashed #ccc; border-radius: 3px;"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 500; color: #999; margin-bottom: 3px;">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div style="font-size: 0.85rem; color: #999; font-style: italic;">
                                    Artefact à venir (non encore créé dans Réglages › Productions)
                                </div>
                            </div>
                        </div>
                        `}
                    </div>
                `).join('')}
            </div>

            <!-- Calcul de la note -->
            <div style="padding: 20px; background: ${nbRetenus === nombreARetenir ? '#d4edda' : '#fff3cd'}; 
                        border-left: 4px solid ${nbRetenus === nombreARetenir ? '#28a745' : '#ffc107'}; 
                        border-radius: 8px;">
                <h4 style="margin-top: 0; color: ${nbRetenus === nombreARetenir ? '#155724' : '#856404'};">
                    ${nbRetenus === nombreARetenir ? '✓ Mode FINAL actif' : '⚠️ Mode PROVISOIRE'}
                </h4>
                
                ${noteProvisoire !== null 
                    ? `<p><strong>Note provisoire :</strong> ${noteProvisoire.toFixed(2)}/100 
                       <span style="font-size: 0.9rem; color: #666;">(moyenne de ${artefactsAvecNote.length} artefact${artefactsAvecNote.length > 1 ? 's' : ''})</span></p>` 
                    : ''}
                
                ${noteFinale !== null 
                    ? `<p style="font-size: 1.2rem;"><strong>Note finale :</strong> 
                       <span style="color: #28a745; font-size: 1.3rem;">${noteFinale.toFixed(2)}/100</span>
                       <span style="font-size: 0.9rem; color: #666;">(moyenne des ${nombreARetenir} retenus)</span></p>` 
                    : ''}
                
                <p style="margin-bottom: 0; color: ${nbRetenus === nombreARetenir ? '#155724' : '#856404'};">
                    ${nbRetenus === nombreARetenir
                        ? `Les ${nombreARetenir} artefacts sélectionnés déterminent la note finale`
                        : `Sélectionne ${nombreARetenir - nbRetenus} artefact${nombreARetenir - nbRetenus > 1 ? 's' : ''} supplémentaire${nombreARetenir - nbRetenus > 1 ? 's' : ''} pour activer le mode FINAL`}
                </p>
            </div>
        `;

    } catch (error) {
        console.error('Erreur chargement portfolio:', error);
        document.getElementById('portfolioEleveDetail').innerHTML =
            '<p style="color: red;">Erreur lors du chargement du portfolio.</p>';
    }
}

/**
 * Bascule la sélection d'un artefact pour le portfolio
 * @param {string} da - DA de l'étudiant
 * @param {string} portfolioId - ID du portfolio
 * @param {number} nombreARetenir - Nombre max d'artefacts à retenir
 */
function toggleArtefactPortfolio(da, portfolioId, nombreARetenir) {
    try {
        const checkboxes = document.querySelectorAll('input[name="artefactRetenu"]:checked');
        const artefactsRetenus = Array.from(checkboxes).map(cb => cb.value);

        // Limiter au nombre défini
        if (artefactsRetenus.length > nombreARetenir) {
            alert(`Tu ne peux sélectionner que ${nombreARetenir} artefact${nombreARetenir > 1 ? 's' : ''} maximum.`);
            event.target.checked = false;
            return;
        }

        // Sauvegarder la sélection
        let selectionsPortfolios = JSON.parse(localStorage.getItem('portfoliosEleves') || '{}');
        if (!selectionsPortfolios[da]) {
            selectionsPortfolios[da] = {};
        }

        selectionsPortfolios[da][portfolioId] = {
            artefactsRetenus: artefactsRetenus,
            dateSelection: new Date().toISOString()
        };

        localStorage.setItem('portfoliosEleves', JSON.stringify(selectionsPortfolios));

        // 🔄 Recalculer les indices C et P après modification de sélection
        if (typeof calculerEtStockerIndicesCP === 'function') {
            calculerEtStockerIndicesCP();
        }

        // Recharger TOUT le profil pour mettre à jour les indices A-C-P-M-E-R
        if (typeof afficherProfilComplet === 'function') {
            afficherProfilComplet(da);

            // Rouvrir automatiquement le panneau Portfolio après rechargement
            if (typeof toggleDetailIndice === 'function') {
                toggleDetailIndice('P', da);
                console.log('✅ Panneau Portfolio rouvert automatiquement');
            }
        } else {
            // Fallback : recharger uniquement le portfolio
            chargerPortfolioEleveDetail(da);
        }

    } catch (error) {
        console.error('Erreur toggle artefact:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

/* ===============================
   📌 NOTES
   =============================== */

/*
 * STRUCTURE DES DONNÉES:
 *
 * productions:
 * [
 *   {id, type: 'portfolio', regles: {nombreARetenir, minimumCompletion}, ...},
 *   {id, type: 'artefact-portfolio', titre, description, ...},
 *   ...
 * ]
 * 
 * evaluationsSauvegardees:
 * [
 *   {etudiantDA, productionId, noteFinale, niveauFinal, ...},
 *   ...
 * ]
 * 
 * portfoliosEleves:
 * {
 *   "DA123": {
 *     "PORTFOLIO_ID": {
 *       artefactsRetenus: ["ARTEFACT1", "ARTEFACT2"],
 *       dateSelection: "2025-10-10T..."
 *     }
 *   }
 * }
 *
 * indicesCP (généré par ce module - Single Source of Truth):
 * Structure DUALE : calcule TOUJOURS les deux pratiques (SOM et PAN)
 * {
 *   "DA123": {
 *     historique: [
 *       {
 *         date: "2025-10-26T...",
 *         SOM: {
 *           C: 67,
 *           P: 72,
 *           details: {
 *             nbProductionsRemises: 2,
 *             nbProductionsDonnees: 3,
 *             productionsRetenues: ["EXAM1", "TRAVAIL1"],
 *             notes: [75, 69]
 *           }
 *         },
 *         PAN: {
 *           C: 87,
 *           P: 85,
 *           details: {
 *             nbArtefactsRemis: 7,
 *             nbArtefactsDonnes: 8,
 *             artefactsRetenus: ["ART1", "ART2", "ART3"],
 *             notes: [88, 85, 82]
 *           }
 *         }
 *       }
 *     ],
 *     actuel: {
 *       date: "2025-10-26T...",
 *       SOM: { C: 67, P: 72, details: {...} },
 *       PAN: { C: 87, P: 85, details: {...} }
 *     }
 *   },
 *   dateCalcul: "2025-10-26T..."
 * }
 */

/* ===============================
   🔧 FONCTIONS HELPERS POUR SUPPORT SOM ET PAN
   =============================== */

/**
 * Détermine le mode de pratique pédagogique actuel
 *
 * @returns {string} - 'SOM' (sommative traditionnelle) ou 'PAN' (pratique alternative)
 *
 * SOURCE : localStorage.modalitesEvaluation.pratique
 * - 'sommative' → retourne 'SOM'
 * - 'alternative' → retourne 'PAN'
 * - Par défaut (si non configuré) → retourne 'PAN' (rétrocompatibilité)
 */
function obtenirModePratique() {
    const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    return config.pratique === 'sommative' ? 'SOM' : 'PAN';
}

/**
 * Détermine si une production compte dans le dépistage (indices C et P)
 *
 * @param {Object} production - Objet production avec propriété 'type'
 * @param {string} mode - 'SOM' ou 'PAN'
 * @returns {boolean} - true si la production doit être comptée
 *
 * LOGIQUE :
 * - Mode PAN : Seuls les 'artefact-portfolio' comptent
 * - Mode SOM : Tous les types SAUF formatifs et conteneurs
 *   - ✅ Compte : examen, travail, quiz, presentation, autre
 *   - ❌ Ne compte PAS : *-formatif, portfolio (conteneur)
 */
function comptesDansDepistage(production, mode) {
    const type = production.type;

    if (mode === 'PAN') {
        // En PAN, seuls les artefacts-portfolio comptent
        return type === 'artefact-portfolio';
    } else {
        // En SOM, tous les types sommative comptent (pas les formatifs ni le conteneur portfolio)
        const estFormatif = type.endsWith('-formatif');
        const estConteneur = type === 'portfolio';
        return !estFormatif && !estConteneur;
    }
}

/**
 * Convertit un niveau de performance (IDME) en pourcentage
 *
 * @param {string} niveau - Code du niveau ('I', 'D', 'M', 'E')
 * @param {string} echelleId - ID de l'échelle de performance (optionnel)
 * @returns {number} - Valeur en % (0-100)
 *
 * FONCTIONNEMENT :
 * - Cherche le niveau dans l'échelle spécifiée (ou échelle par défaut)
 * - Utilise la valeur 'valeurCalcul' définie dans echelles.js
 * - Valeurs par défaut si échelle non trouvée :
 *   I = 32%, D = 69.5%, M = 79.5%, E = 92.5%
 *
 * UTILISÉ PAR :
 * - Calcul indice P en mode PAN (artefacts évalués avec IDME)
 * - Conversion des notes qualitatives en notes quantitatives
 */
function convertirNiveauEnPourcentage(niveau, echelleId = null) {
    // Valeurs par défaut (basées sur les niveaux IDME standard)
    const valeursDefaut = {
        '0': 0,
        'I': 32,
        'D': 69.5,
        'M': 79.5,
        'E': 92.5
    };

    // Tenter de récupérer depuis l'échelle configurée
    const echelles = JSON.parse(localStorage.getItem('echellesPerformance') || '[]');
    let echelle;

    if (echelleId) {
        echelle = echelles.find(e => e.id === echelleId);
    } else {
        echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
    }

    if (echelle && echelle.niveaux) {
        const niveauObj = echelle.niveaux.find(n => n.code === niveau);
        if (niveauObj && niveauObj.valeurCalcul !== undefined) {
            return niveauObj.valeurCalcul;
        }
    }

    // Fallback sur valeurs par défaut
    return valeursDefaut[niveau] || 0;
}

/* ===============================
   🔄 CALCUL ET STOCKAGE DES INDICES C et P

   SOURCE UNIQUE (Single Source of Truth):
   - Calcule l'indice C (Complétion) pour tous les étudiants
   - Calcule l'indice P (Performance) pour tous les étudiants
   - Stocke dans localStorage.indicesCP avec historique
   - À appeler après chaque évaluation ou modification de sélection

   SUPPORT UNIVERSEL SOM ET PAN :
   - Détecte automatiquement le mode via obtenirModePratique()
   - Filtre les productions via comptesDansDepistage()
   - Calcule P avec logique bifurquée (PAN vs SOM)
   =============================== */

/**
 * Calcule et stocke les indices C (Complétion) et P (Performance) pour tous les étudiants
 * Maintient un historique pour analyse longitudinale
 *
 * 🔀 CALCUL DUAL (SOM ET PAN SIMULTANÉMENT) :
 * - Calcule TOUJOURS les deux pratiques en parallèle
 * - Stocke les résultats dans une structure à deux branches
 * - Permet la comparaison expérimentale des deux approches
 *
 * PRATIQUE SOM (Sommative traditionnelle) :
 * - C_som : (évaluations sommatives remises) / (sommatives données) × 100
 * - P_som : Moyenne pondérée provisoire
 *
 * PRATIQUE PAN (Alternative - Portfolio) :
 * - C_pan : (artefacts remis) / (artefacts donnés) × 100
 * - P_pan : Moyenne des N meilleurs artefacts
 *
 * @returns {Object} - Structure complète avec indices SOM et PAN pour chaque étudiant
 */
function calculerEtStockerIndicesCP() {
    console.log('🔄 Calcul DUAL des indices C et P (SOM + PAN)...');

    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves');

    // Récupérer l'historique existant ou initialiser
    const indicesCP = obtenirDonneesSelonMode('indicesCP');

    // 🎯 PRÉPARER LES FILTRES POUR LES DEUX PRATIQUES

    // Productions SOM : toutes les sommatives (exclut formatifs et conteneur portfolio)
    const productionsSOM = productions.filter(p => comptesDansDepistage(p, 'SOM'));
    const productionsSOMIds = new Set(productionsSOM.map(p => p.id));

    // Productions PAN : uniquement artefact-portfolio
    const productionsPAN = productions.filter(p => comptesDansDepistage(p, 'PAN'));
    const productionsPANIds = new Set(productionsPAN.map(p => p.id));

    // Identifier les productions SOM réellement données
    const productionsSOMDonnees = new Set();
    evaluations.forEach(evaluation => {
        if (productionsSOMIds.has(evaluation.productionId)) {
            productionsSOMDonnees.add(evaluation.productionId);
        }
    });

    // Identifier les artefacts PAN réellement donnés
    const artefactsPANDonnes = new Set();
    evaluations.forEach(evaluation => {
        if (productionsPANIds.has(evaluation.productionId)) {
            artefactsPANDonnes.add(evaluation.productionId);
        }
    });

    const nbProductionsSOMDonnees = productionsSOMDonnees.size;
    const nbArtefactsPANDonnes = artefactsPANDonnes.size;

    // Portfolio (pour PAN)
    const portfolio = productions.find(p => p.type === 'portfolio');

    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );

    const dateCalcul = new Date().toISOString();

    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        const da = etudiant.da;

        // ========================================
        // CALCUL PRATIQUE SOM
        // ========================================

        const evaluationsSOM = evaluations.filter(e =>
            e.etudiantDA === da &&
            productionsSOMDonnees.has(e.productionId) &&
            !e.remplaceeParId  // Exclure les évaluations remplacées par des reprises
        );
        // Compter les productions DISTINCTES (pas le nombre total d'évaluations)
        // Un étudiant peut avoir plusieurs évaluations du même artefact (reprises, jetons)
        const productionsSOMRemises = new Set(evaluationsSOM.map(e => e.productionId));
        const nbSOMRemises = productionsSOMRemises.size;
        const C_som = nbProductionsSOMDonnees === 0 ? 0 : Math.round((nbSOMRemises / nbProductionsSOMDonnees) * 100);

        let P_som = 0;
        let notesSOM = [];
        let productionsSOMRetenues = [];

        const evaluationsSOMAvecNote = evaluationsSOM.filter(e => e.noteFinale !== null);
        if (evaluationsSOMAvecNote.length > 0) {
            let sommePonderee = 0;
            let totalPonderation = 0;

            evaluationsSOMAvecNote.forEach(evaluation => {
                const production = productions.find(p => p.id === evaluation.productionId);
                const ponderation = production?.ponderation || 0;
                sommePonderee += evaluation.noteFinale * ponderation;
                totalPonderation += ponderation;
            });

            if (totalPonderation > 0) {
                P_som = Math.round(sommePonderee / totalPonderation);
            } else {
                // Fallback : moyenne simple si pondérations = 0
                const somme = evaluationsSOMAvecNote.map(e => e.noteFinale).reduce((sum, note) => sum + note, 0);
                P_som = Math.round(somme / evaluationsSOMAvecNote.length);
            }

            productionsSOMRetenues = evaluationsSOMAvecNote.map(e => e.productionId);
            notesSOM = evaluationsSOMAvecNote.map(e => e.noteFinale);
        }

        // ========================================
        // CALCUL PRATIQUE PAN
        // ========================================

        const evaluationsPAN = evaluations.filter(e =>
            e.etudiantDA === da &&
            artefactsPANDonnes.has(e.productionId) &&
            !e.remplaceeParId  // Exclure les évaluations remplacées par des reprises
        );
        // Compter les artefacts DISTINCTS (pas le nombre total d'évaluations)
        // Un étudiant peut avoir plusieurs évaluations du même artefact (reprises, jetons)
        const artefactsPANRemis = new Set(evaluationsPAN.map(e => e.productionId));
        const nbPANRemis = artefactsPANRemis.size;
        const C_pan = nbArtefactsPANDonnes === 0 ? 0 : Math.round((nbPANRemis / nbArtefactsPANDonnes) * 100);

        let P_pan = 0;
        let notesPAN = [];
        let artefactsPANRetenus = [];

        if (portfolio && selectionsPortfolios[da]?.[portfolio.id]) {
            // Utiliser les artefacts sélectionnés manuellement
            artefactsPANRetenus = selectionsPortfolios[da][portfolio.id].artefactsRetenus || [];
            const evaluationsRetenues = evaluationsPAN.filter(e =>
                artefactsPANRetenus.includes(e.productionId) && e.noteFinale !== null
            );

            if (evaluationsRetenues.length > 0) {
                notesPAN = evaluationsRetenues.map(e => e.noteFinale);
                const somme = notesPAN.reduce((sum, note) => sum + note, 0);
                P_pan = Math.round(somme / evaluationsRetenues.length);
            }
        } else {
            // Sélection automatique des N meilleurs
            const nombreARetenir = portfolio?.regles?.nombreARetenir || 3;
            const evaluationsPANAvecNote = evaluationsPAN
                .filter(e => e.noteFinale !== null)
                .sort((a, b) => b.noteFinale - a.noteFinale)
                .slice(0, nombreARetenir);

            if (evaluationsPANAvecNote.length > 0) {
                artefactsPANRetenus = evaluationsPANAvecNote.map(e => e.productionId);
                notesPAN = evaluationsPANAvecNote.map(e => e.noteFinale);
                const somme = notesPAN.reduce((sum, note) => sum + note, 0);
                P_pan = Math.round(somme / evaluationsPANAvecNote.length);
            }
        }

        // ========================================
        // STRUCTURE À DEUX BRANCHES
        // ========================================

        const entreeActuelle = {
            date: dateCalcul,
            SOM: {
                C: C_som,
                P: P_som,
                details: {
                    nbProductionsRemises: nbSOMRemises,
                    nbProductionsDonnees: nbProductionsSOMDonnees,
                    productionsRetenues: productionsSOMRetenues,
                    notes: notesSOM
                }
            },
            PAN: {
                C: C_pan,
                P: P_pan,
                details: {
                    nbArtefactsRemis: nbPANRemis,
                    nbArtefactsDonnes: nbArtefactsPANDonnes,
                    artefactsRetenus: artefactsPANRetenus,
                    notes: notesPAN
                }
            }
        };

        // Initialiser ou mettre à jour l'historique
        if (!indicesCP[da]) {
            indicesCP[da] = {
                historique: [],
                actuel: null
            };
        }

        // Ajouter à l'historique (seulement si différent du dernier)
        const dernierHistorique = indicesCP[da].historique[indicesCP[da].historique.length - 1];
        const aDiffere = !dernierHistorique ||
            dernierHistorique.SOM?.C !== C_som ||
            dernierHistorique.SOM?.P !== P_som ||
            dernierHistorique.PAN?.C !== C_pan ||
            dernierHistorique.PAN?.P !== P_pan;

        if (aDiffere) {
            indicesCP[da].historique.push(entreeActuelle);
        }

        // Mettre à jour l'actuel
        indicesCP[da].actuel = entreeActuelle;
    });

    // Ajouter la date de calcul globale
    indicesCP.dateCalcul = dateCalcul;

    // Sauvegarder
    // IMPORTANT : Utiliser sauvegarderDonneesSelonMode pour respecter le mode actuel
    sauvegarderDonneesSelonMode('indicesCP', indicesCP);

    console.log('✅ Indices C et P sauvegardés (SOM + PAN)');
    console.log('   Étudiants:', etudiantsActifs.length);
    console.log('   Productions SOM données:', nbProductionsSOMDonnees);
    console.log('   Artefacts PAN donnés:', nbArtefactsPANDonnes);

    return indicesCP;
}

/**
 * Récupère les indices C et P actuels pour un étudiant
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} pratique - (Optionnel) 'SOM' ou 'PAN' pour une pratique spécifique
 * @returns {Object} - Structure complète ou pratique spécifique, ou null
 *
 * EXEMPLES :
 * obtenirIndicesCP('1234567')        → { date, SOM: {...}, PAN: {...} }
 * obtenirIndicesCP('1234567', 'SOM') → { C: 67, P: 72, details: {...} }
 * obtenirIndicesCP('1234567', 'PAN') → { C: 87, P: 85, details: {...} }
 */
function obtenirIndicesCP(da, pratique = null) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const actuel = indicesCP[da]?.actuel;

    if (!actuel) return null;

    // Si une pratique spécifique est demandée
    if (pratique === 'SOM') return actuel.SOM || null;
    if (pratique === 'PAN') return actuel.PAN || null;

    // Sinon retourner la structure complète
    return actuel;
}

/**
 * Récupère l'historique complet des indices C et P pour un étudiant
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} pratique - (Optionnel) 'SOM' ou 'PAN' pour une pratique spécifique
 * @returns {Array} - Historique complet ou filtré par pratique
 *
 * EXEMPLES :
 * obtenirHistoriqueIndicesCP('1234567')        → [{ date, SOM: {...}, PAN: {...} }, ...]
 * obtenirHistoriqueIndicesCP('1234567', 'SOM') → [{ date, C: 67, P: 72 }, ...]
 * obtenirHistoriqueIndicesCP('1234567', 'PAN') → [{ date, C: 87, P: 85 }, ...]
 */
function obtenirHistoriqueIndicesCP(da, pratique = null) {
    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const indicesCP = obtenirDonneesSelonMode('indicesCP') || {};
    const historique = indicesCP[da]?.historique || [];

    if (!pratique) return historique;

    // Transformer l'historique pour n'inclure que la pratique demandée
    return historique.map(entree => ({
        date: entree.date,
        C: entree[pratique]?.C || 0,
        P: entree[pratique]?.P || 0,
        details: entree[pratique]?.details || {}
    }));
}