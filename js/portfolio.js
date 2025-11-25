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

/* ===============================
   FONCTION HELPER: SÉLECTION SELON MODALITÉ
   =============================== */

/**
 * Sélectionne les artefacts selon la modalité configurée
 *
 * @param {Array} artefactsRemisAvecNote - Artefacts remis avec notes (non triés)
 * @param {number} nombreARetenir - Nombre d'artefacts à retenir
 * @param {string} modalite - 'meilleurs' | 'recents' | 'recents-meilleurs' | 'tous'
 * @returns {Array} Artefacts sélectionnés
 */
function selectionnerArtefactsSelonModalite(artefactsRemisAvecNote, nombreARetenir, modalite) {
    if (artefactsRemisAvecNote.length === 0) {
        return [];
    }

    switch (modalite) {
        case 'meilleurs':
            // MODALITÉ 1: N meilleurs artefacts (note décroissante)
            // Principe de maîtrise - évalue le plus haut niveau atteint
            return artefactsRemisAvecNote
                .sort((a, b) => b.note - a.note)
                .slice(0, nombreARetenir);

        case 'recents':
            // MODALITÉ 2: N récents artefacts (date décroissante)
            // Représentatif du niveau terminal/actuel
            return artefactsRemisAvecNote
                .sort((a, b) => new Date(b.dateRemise) - new Date(a.dateRemise))
                .slice(0, nombreARetenir);

        case 'recents-meilleurs':
            // MODALITÉ 3: N récents parmi les meilleurs (hybride)
            // Équilibre entre maîtrise maximale et représentativité actuelle
            // Algorithme: Filtrer top 50% par note, puis prendre les N plus récents
            const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRemisAvecNote.length * 0.5));
            const topMeilleurs = artefactsRemisAvecNote
                .sort((a, b) => b.note - a.note)
                .slice(0, nombreMeilleurs);

            return topMeilleurs
                .sort((a, b) => new Date(b.dateRemise) - new Date(a.dateRemise))
                .slice(0, nombreARetenir);

        case 'tous':
            // MODALITÉ 4: Tous les artefacts (moyenne complète)
            // Calcul sommative - pour comparaison avec PAN
            return artefactsRemisAvecNote;

        default:
            console.warn(`Modalité inconnue: ${modalite}, utilisation de 'meilleurs' par défaut`);
            return artefactsRemisAvecNote
                .sort((a, b) => b.note - a.note)
                .slice(0, nombreARetenir);
    }
}

/**
 * Charge et affiche le portfolio détaillé d'un étudiant
 * @param {string} da - DA de l'étudiant
 */
function chargerPortfolioEleveDetail(da) {
    try {
        // Récupérer les données
        const productions = db.getSync('productions', []);
        const portfolio = productions.find(p => p.type === 'portfolio');

        if (!portfolio) {
            document.getElementById('portfolioEleveDetail').innerHTML =
                '<p class="text-muted">Aucun portfolio configuré dans Réglages › Productions.</p>';
            return;
        }

        // Récupérer tous les artefacts-portfolio créés
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

        // Récupérer les évaluations de cet élève
        const evaluations = db.getSync('evaluationsSauvegardees', []);
        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        // Récupérer les sélections de portfolio
        const selectionsPortfolios = db.getSync('portfoliosEleves', {});
        const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

        // ✅ Configuration depuis modalitesEvaluation (avec fallback sur portfolio.regles)
        const modalites = db.getSync('modalitesEvaluation', {});
        const configPortfolio = modalites.configPAN?.portfolio || {};

        // Lire depuis nouvelle source (Phase 3), sinon ancienne source (rétrocompatibilité)
        const nombreTotal = configPortfolio.nombreTotal || portfolio.regles?.nombreTotal || artefactsPortfolio.length;
        const minimumRequis = configPortfolio.minimumCompletion || portfolio.regles?.minimumCompletion || 7;
        const nombreARetenir = configPortfolio.nombreARetenir || portfolio.regles?.nombreARetenir || 3;
        const methodeSelection = configPortfolio.methodeSelection || 'meilleurs';

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

        // ✨ SÉLECTION AUTOMATIQUE selon la modalité configurée
        if (selectionEleve.artefactsRetenus.length === 0) {
            // Récupérer les artefacts remis avec note (non triés - le tri se fait dans la fonction)
            const artefactsRemisAvecNote = artefacts
                .filter(a => a.remis && a.note !== null)
                .map(a => ({
                    ...a,
                    dateRemise: new Date().toISOString() // TODO: Ajouter vraie date de remise dans évaluations
                }));

            // Sélectionner selon la modalité configurée
            const artefactsSelectionnes = selectionnerArtefactsSelonModalite(
                artefactsRemisAvecNote,
                nombreARetenir,
                methodeSelection
            );

            if (artefactsSelectionnes.length > 0) {
                // Mettre à jour la sélection
                selectionEleve.artefactsRetenus = artefactsSelectionnes.map(a => a.id);

                // Sauvegarder dans localStorage
                if (!selectionsPortfolios[da]) {
                    selectionsPortfolios[da] = {};
                }
                selectionsPortfolios[da][portfolio.id] = {
                    artefactsRetenus: selectionEleve.artefactsRetenus,
                    dateSelection: new Date().toISOString(),
                    auto: true, // Flag pour indiquer sélection automatique
                    modalite: methodeSelection // Tracer quelle modalité a été utilisée
                };
                db.setSync('portfoliosEleves', selectionsPortfolios);

                // 🔄 Recalculer les indices C et P après sélection automatique
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }

                // Mettre à jour le flag retenu dans les artefacts
                artefacts.forEach(art => {
                    art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
                });

                console.log(`✨ Sélection automatique (${methodeSelection}) : ${artefactsSelectionnes.length} artefact(s) sélectionné(s)`);
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
            <div class="portfolio-progression">
                <div class="portfolio-progression-header">
                    <span><strong>Progression :</strong> ${nbRemis}/${minimumRequis} remis ${nombreTotal > minimumRequis ? `(${nombreTotal} artefacts prévus)` : ''}</span>
                    <span style="color: ${nbRemis >= minimumRequis ? 'green' : 'orange'};">
                        ${nbRemis >= minimumRequis ? '✓ Minimum atteint' : 'Minimum requis'}
                    </span>
                </div>
                <div class="portfolio-barre-progression">
                    <div class="portfolio-barre-remplissage" style="width: ${Math.min((nbRemis / minimumRequis) * 100, 100)}%;"></div>
                </div>
                <p class="portfolio-progression-aide">
                    <strong>${nombreARetenir}</strong> artefacts à retenir pour la note finale
                </p>
            </div>

            <!-- Liste des artefacts -->
            <div class="portfolio-artefacts-section">
                <h4 class="portfolio-artefacts-titre">📑 Artefacts du portfolio (${artefacts.length})</h4>
                ${artefacts.map((art, index) => `
                    <div class="portfolio-artefact-carte ${art.retenu ? 'portfolio-artefact-retenu' : (art.existe ? 'portfolio-artefact-disponible' : 'portfolio-artefact-avenir')}">
                        ${art.existe ? `
                        <label class="portfolio-artefact-label" style="cursor: ${art.remis ? 'pointer' : 'not-allowed'};">
                            <input type="checkbox"
                                   name="artefactRetenu"
                                   value="${art.id}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   onchange="toggleArtefactPortfolio('${da}', '${portfolio.id}', ${nombreARetenir})">
                            <div class="portfolio-artefact-contenu">
                                <div class="portfolio-artefact-titre ${art.retenu ? 'portfolio-artefact-titre-retenu' : 'portfolio-artefact-titre-normal'}">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div class="portfolio-artefact-meta">
                                    ${art.remis
                                        ? `<span class="u-texte-succes">✓ Remis</span>
                                           <span><strong>Note :</strong> ${art.note}/100</span>
                                           <span><strong>Niveau :</strong> ${echapperHtml(art.niveau)}</span>`
                                        : '<span class="portfolio-texte-gris-fade">— Non remis</span>'}
                                </div>
                            </div>
                        </label>
                        ` : `
                        <div class="portfolio-artefact-placeholder">
                            <div class="portfolio-artefact-checkbox-vide"></div>
                            <div class="portfolio-artefact-contenu">
                                <div class="portfolio-artefact-avenir-titre">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div class="portfolio-artefact-avenir-info">
                                    Artefact à venir (non encore créé dans Réglages › Productions)
                                </div>
                            </div>
                        </div>
                        `}
                    </div>
                `).join('')}
            </div>

            <!-- Calcul de la note -->
            <div class="portfolio-note-carte ${nbRetenus === nombreARetenir ? 'portfolio-note-finale' : 'portfolio-note-provisoire'}">
                <h4>
                    ${nbRetenus === nombreARetenir ? '✓ Mode FINAL actif' : '⚠️ Mode PROVISOIRE'}
                </h4>

                ${noteProvisoire !== null
                    ? `<p><strong>Note provisoire :</strong> ${noteProvisoire.toFixed(2)}/100
                       <span class="portfolio-note-detail">(moyenne de ${artefactsAvecNote.length} artefact${artefactsAvecNote.length > 1 ? 's' : ''})</span></p>`
                    : ''}

                ${noteFinale !== null
                    ? `<p class="u-texte-grand"><strong>Note finale :</strong>
                       <span class="portfolio-note-valeur">${noteFinale.toFixed(2)}/100</span>
                       <span class="portfolio-note-detail">(moyenne des ${nombreARetenir} retenus)</span></p>`
                    : ''}

                <p>
                    ${nbRetenus === nombreARetenir
                        ? `Les ${nombreARetenir} artefacts sélectionnés déterminent la note finale`
                        : `Sélectionne ${nombreARetenir - nbRetenus} artefact${nombreARetenir - nbRetenus > 1 ? 's' : ''} supplémentaire${nombreARetenir - nbRetenus > 1 ? 's' : ''} pour activer le mode FINAL`}
                </p>
            </div>
        `;

    } catch (error) {
        console.error('Erreur chargement portfolio:', error);
        document.getElementById('portfolioEleveDetail').innerHTML =
            '<p class="u-texte-danger">Erreur lors du chargement du portfolio.</p>';
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
        let selectionsPortfolios = db.getSync('portfoliosEleves', {});
        if (!selectionsPortfolios[da]) {
            selectionsPortfolios[da] = {};
        }

        selectionsPortfolios[da][portfolioId] = {
            artefactsRetenus: artefactsRetenus,
            dateSelection: new Date().toISOString()
        };

        db.setSync('portfoliosEleves', selectionsPortfolios);

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
 * SOURCE : db.getSync('modalitesEvaluation').pratique
 * - 'sommative' → retourne 'SOM'
 * - 'alternative' → retourne 'PAN'
 * - Par défaut (si non configuré) → retourne 'PAN' (rétrocompatibilité)
 */
function obtenirModePratique() {
    const config = db.getSync('modalitesEvaluation', {});
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
    const echelles = db.getSync('echellesPerformance', []);
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
   - Stocke dans db.setSync('indicesCP') avec historique
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
    console.log('🔄 Calcul DUAL des indices C et P (SOM + PAN) via registre de pratiques...');

    // IMPORTANT : Utiliser obtenirDonneesSelonMode pour respecter le mode actuel
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // Récupérer l'historique existant ou initialiser
    const indicesCP = obtenirDonneesSelonMode('indicesCP');

    // 🎯 OBTENIR LES PRATIQUES DEPUIS LE REGISTRE
    const pratiqueSommative = obtenirPratiqueParId('sommative');
    const pratiquePAN = obtenirPratiqueParId('pan-maitrise');

    if (!pratiqueSommative || !pratiquePAN) {
        console.error('❌ Pratiques non disponibles dans le registre');
        console.error('   Sommative:', !!pratiqueSommative);
        console.error('   PAN-Maîtrise:', !!pratiquePAN);
        return indicesCP;
    }

    // Préparer compteurs pour les logs
    const productionsSOM = productions.filter(p => comptesDansDepistage(p, 'SOM'));
    const nbProductionsSOMDonnees = productionsSOM.length;

    const productionsPAN = productions.filter(p => comptesDansDepistage(p, 'PAN'));
    const nbArtefactsPANDonnes = productionsPAN.length;

    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e =>
        e.statut !== 'décrochage' && e.statut !== 'abandon'
    );

    const dateCalcul = new Date().toISOString();

    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        const da = etudiant.da;

        // ========================================
        // CALCUL PRATIQUE SOM (via registre)
        // ========================================

        const C_som_decimal = pratiqueSommative.calculerCompletion(da);
        const P_som_decimal = pratiqueSommative.calculerPerformance(da);

        // Convertir 0-1 → 0-100
        const C_som = C_som_decimal !== null ? Math.round(C_som_decimal * 100) : 0;
        const P_som = P_som_decimal !== null ? Math.round(P_som_decimal * 100) : 0;

        // ========================================
        // CALCUL PRATIQUE PAN (via registre)
        // ========================================

        const C_pan_decimal = pratiquePAN.calculerCompletion(da);
        const P_pan_decimal = pratiquePAN.calculerPerformance(da);

        // Convertir 0-1 → 0-100
        const C_pan = C_pan_decimal !== null ? Math.round(C_pan_decimal * 100) : 0;
        const P_pan = P_pan_decimal !== null ? Math.round(P_pan_decimal * 100) : 0;

        // ========================================
        // CALCUL P_RECENT POUR LE RISQUE (si découplage activé)
        // ========================================

        // Lire la configuration PAN pour affichage explicite et découplage
        const modalites = db.getSync('modalitesEvaluation', {});
        const configPortfolio = modalites.configPAN?.portfolio || {};
        const decouplerPR = configPortfolio.decouplerPR || false;

        // Calculer P_recent si découplage activé ET que la pratique supporte cette méthode
        let P_recent = null;
        if (decouplerPR && typeof pratiquePAN.calculerPerformanceRecente === 'function') {
            const P_recent_decimal = pratiquePAN.calculerPerformanceRecente(da);
            P_recent = P_recent_decimal !== null ? Math.round(P_recent_decimal * 100) : null;
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
                    calculViaPratique: true,
                    pratique: 'sommative'
                }
            },
            PAN: {
                C: C_pan,
                P: P_pan,
                details: {
                    calculViaPratique: true,
                    pratique: 'pan-maitrise',
                    portfolioActif: configPortfolio.actif !== false,
                    methodeSelection: configPortfolio.methodeSelection || 'meilleurs',
                    nombreARetenir: configPortfolio.nombreARetenir || 5,
                    decouplerPR: decouplerPR,
                    P_recent: P_recent  // Performance récente pour le calcul de R (si découplage activé)
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