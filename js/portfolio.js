/* ===============================
   MODULE PORTFOLIO: GESTION DES PORTFOLIOS ÉTUDIANTS

   Contenu:
   - Affichage du portfolio d'un étudiant
   - Liste des artefacts (remis/non remis)
   - Sélection des artefacts retenus pour note finale
   - Calcul notes provisoires et finales
   - Sauvegarde des sélections
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES

   LocalStorage lu:
   - 'productions' : Array des productions (inclut portfolio + artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations par étudiant
   - 'portfoliosEleves' : Object {da: {portfolioId: {artefactsRetenus: [...]}}}
   =============================== */

/* ===============================
   FIX SPARSE ARRAY (Beta 97.9)
   Si portfoliosEleves est un Array (bug: DA utilisé comme index numérique
   crée un tableau sparse de millions de slots null → 36 Mo),
   le convertir en Object indexé par DA en string.
   =============================== */

(function repararPortfoliosEleves() {
    try {
        const donnees = db.getSync(cle('portfoliosEleves'), null);
        if (Array.isArray(donnees)) {
            const repare = {};
            for (let i = 0; i < donnees.length; i++) {
                if (donnees[i] != null) {
                    repare[String(i)] = donnees[i];
                }
            }
            db.setSync(cle('portfoliosEleves'), repare);
        }
    } catch (e) {
        console.warn('[Fix sparse] Erreur réparation portfoliosEleves:', e);
    }
})();

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
            // MODALITÉ 2: N récents artefacts (numéro décroissant)
            // Représentatif du niveau terminal/actuel
            // CORRECTION (24 jan 2026): Trier par numéro de production, pas par date
            return artefactsRemisAvecNote
                .sort((a, b) => (b.numero || 0) - (a.numero || 0))
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
        const productions = obtenirDonneesSelonMode('productions');
        const portfolio = productions.find(p => p.type === 'portfolio');

        if (!portfolio) {
            document.getElementById('portfolioEleveDetail').innerHTML =
                '<p class="text-muted">Aucun portfolio configuré dans Conception › Productions.</p>';
            return;
        }

        // Récupérer tous les artefacts-portfolio créés
        const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

        // Récupérer les évaluations de cet élève
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        // Récupérer les sélections de portfolio
        const selectionsPortfolios = db.getSync(cle('portfoliosEleves'), {});
        const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

        // ✅ Configuration depuis modalitesEvaluation (avec fallback sur portfolio.regles)
        const modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
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
                numero: art.numero || parseInt(art.id.match(/\d+/)?.[0]) || 0, // AJOUT (24 jan 2026)
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
                db.setSync(cle('portfoliosEleves'), selectionsPortfolios);

                // 🔄 Recalculer les indices C et P après sélection automatique
                if (typeof calculerEtStockerIndicesCP === 'function') {
                    calculerEtStockerIndicesCP();
                }

                // Mettre à jour le flag retenu dans les artefacts
                artefacts.forEach(art => {
                    art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
                });

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
                        ${nbRemis >= minimumRequis ? '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Minimum atteint' : 'Minimum requis'}
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
                                   value="${echapperHtml(art.id)}"
                                   ${art.retenu ? 'checked' : ''}
                                   ${!art.remis ? 'disabled' : ''}
                                   data-on-change="toggleArtefactPortfolioFromEl"
                                   data-da="${da}" data-portfolio-id="${portfolio.id}" data-nombre-a-retenir="${nombreARetenir}">
                            <div class="portfolio-artefact-contenu">
                                <div class="portfolio-artefact-titre ${art.retenu ? 'portfolio-artefact-titre-retenu' : 'portfolio-artefact-titre-normal'}">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div class="portfolio-artefact-meta">
                                    ${art.remis
                                        ? `<span class="u-texte-succes"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>Remis</span>
                                           <span>${(typeof noteDiffereeActive === 'function' && noteDiffereeActive()) ? badgeNoteDifferee() : `<strong>Note :</strong> ${art.note}/100`}</span>
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
                                    Artefact à venir (non encore créé dans Conception › Productions)
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
                    ${nbRetenus === nombreARetenir ? '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Mode FINAL actif' : '<span class="icone-inline icone-inline--warning" aria-hidden="true"></span>Mode PROVISOIRE'}
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
function toggleArtefactPortfolio(event, da, portfolioId, nombreARetenir) {
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
        let selectionsPortfolios = db.getSync(cle('portfoliosEleves'), {});
        if (!selectionsPortfolios[da]) {
            selectionsPortfolios[da] = {};
        }

        selectionsPortfolios[da][portfolioId] = {
            artefactsRetenus: artefactsRetenus,
            dateSelection: new Date().toISOString()
        };

        db.setSync(cle('portfoliosEleves'), selectionsPortfolios);

        // 🔄 Recalculer les indices C et P après modification de sélection
        if (typeof calculerEtStockerIndicesCP === 'function') {
            calculerEtStockerIndicesCP();
        }

        // Recharger TOUT le profil pour mettre à jour les indices A-C-P-M-R
        if (typeof afficherProfilComplet === 'function') {
            afficherProfilComplet(da);

            // Rouvrir automatiquement le panneau Portfolio après rechargement
            if (typeof toggleDetailIndice === 'function') {
                toggleDetailIndice('P', da);
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
 * Détermine le mode de pratique pédagogique du cours actif
 *
 * NOUVEAU (Beta 91) : Utilise la pratique associée au cours actif
 * au lieu d'une configuration globale.
 *
 * @returns {string} - 'SOM' (sommative) ou 'PAN' (pan-maitrise)
 *
 * SOURCE : getPratiqueCours(getCoursActifId())
 * - 'sommative' → retourne 'SOM'
 * - 'pan-maitrise' → retourne 'PAN'
 * - Par défaut (si non configuré) → retourne 'PAN' (rétrocompatibilité)
 */
function obtenirModePratique() {
    // NOUVEAU : Utiliser la pratique du cours actif
    const coursActifId = getCoursActifId();

    if (!coursActifId) {
        console.warn('[obtenirModePratique] Aucun cours actif, utilisation PAN par défaut');
        return 'PAN';
    }

    const pratiqueId = getPratiqueCours(coursActifId);

    return pratiqueId === 'sommative' ? 'SOM' : 'PAN';
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

   🆕 BETA 95.5 : Refonte complète
   - Async pour stockage IndexedDB (plus de limite localStorage)
   - Calcule UNIQUEMENT la pratique active du groupe-cours
   - Structure simplifiée (plus de branches SOM/PAN)

   NOUVELLE STRUCTURE :
   indicesCP[da] = {
     historique: [{ date, pratique, C, P, details }, ...],
     actuel: { date, pratique, C, P, details }
   }
   =============================== */

/**
 * 🆕 BETA 95.5 : Calcule et stocke les indices C et P (async + pratique active)
 *
 * @returns {Promise<Object>} - Structure avec indices pour chaque étudiant
 */
function calculerEtStockerIndicesCP() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // 🔧 FIX Beta 97.4 : Converti en synchrone pour éviter race condition
    // L'appelant (chargerTableauBordApercu) n'await pas cette fonction,
    // donc les indices doivent être disponibles immédiatement après l'appel
    const cleIndices = cle('indicesCP');
    let indicesCP = db.getSync(cleIndices, {});

    // 🆕 BETA 95.5 : Obtenir la pratique active du groupe-cours
    const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
        ? obtenirPratiqueActiveGroupeCours()
        : 'sommative';


    // Obtenir la pratique depuis le registre
    const pratique = obtenirPratiqueParId(pratiqueId);
    if (!pratique) {
        console.error(`❌ Pratique "${pratiqueId}" non disponible dans le registre`);
        return indicesCP;
    }

    // Filtrer les étudiants actifs
    const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

    const dateCalcul = new Date().toISOString();

    // Calculer pour chaque étudiant
    etudiantsActifs.forEach(etudiant => {
        const da = etudiant.da;

        // ========================================
        // 🆕 BETA 96 : CALCUL P = NOTE FINALE DE SESSION
        // ========================================
        // FIX #37 : L'indice P doit refléter la vraie note finale de session
        // qui prend en compte la méthode de sélection, les pondérations, etc.

        // Calculer C via la pratique active
        const C_decimal = pratique.calculerCompletion(da);

        // Calculer P via calculerDetailsNoteFinale (si disponible)
        // pour garantir la cohérence avec la note affichée dans le profil
        let P_decimal = null;
        if (typeof calculerDetailsNoteFinale === 'function') {
            const detailsNote = calculerDetailsNoteFinale(da);
            if (detailsNote && detailsNote.noteFinale !== null) {
                P_decimal = detailsNote.noteFinale / 100; // Convertir % → 0-1
            }
        }

        // Fallback : utiliser la pratique si calculerDetailsNoteFinale n'est pas disponible
        if (P_decimal === null) {
            P_decimal = pratique.calculerPerformance(da);
        }

        // Convertir 0-1 → 0-100
        const C = C_decimal !== null ? Math.round(C_decimal * 100) : 0;
        const P = P_decimal !== null ? Math.round(P_decimal * 100) : 0;

        const entreeActuelle = {
            date: dateCalcul,
            pratique: pratiqueId,
            C: C,
            P: P,
            details: {
                calculViaPratique: true
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
            dernierHistorique.pratique !== pratiqueId ||
            dernierHistorique.C !== C ||
            dernierHistorique.P !== P;

        if (aDiffere) {
            indicesCP[da].historique.push(entreeActuelle);
        }

        // Mettre à jour l'actuel
        indicesCP[da].actuel = entreeActuelle;
    });

    // Ajouter la date de calcul globale
    indicesCP.dateCalcul = dateCalcul;

    // 🔧 FIX Beta 97.4 : Sauvegarde synchrone (localStorage + IndexedDB en arrière-plan)
    db.setSync(cleIndices, indicesCP);


    return indicesCP;
}

/**
 * #307 (Session C Lot 5) — Simule les indices C et P d'un·e étudiant·e pour UNE
 * pratique donnée, en LECTURE SEULE.
 *
 * Miroir, pour un seul étudiant et une seule pratique, de la boucle de
 * calculerEtStockerIndicesCP() — MAIS sans aucun effet de bord : ne lit ni n'écrit
 * le store `indicesCP`, ne change pas la pratique active du groupe-cours. Permet
 * d'afficher côte à côte « voici ce que donnerait la pratique X sur les mêmes
 * artefacts » sans toucher aux données du trimestre (spec #307 §2 : éphémère).
 *
 * Parité : appelée avec la pratique active, rend exactement les mêmes C et P que
 * calculerEtStockerIndicesCP() pour cet étudiant (même chaîne de calcul).
 *
 * @param {string} da - Numéro DA de l'étudiant·e
 * @param {string} pratiqueId - Pratique à simuler (id bibliothèque ou canonique)
 * @returns {{pratique:string, C:number, P:number, noteFinale:?number, details:?object}|null}
 *          null si da/pratiqueId manquant ou pratique introuvable dans le registre.
 */
function simulerIndices(da, pratiqueId, donnees = null) {
    if (!da || !pratiqueId) return null;

    // #326 R2/Étape 2 — injection mémoire (banc de décision) : si un corpus fictif
    // { evaluationsSauvegardees, productions } est fourni, le moteur calcule SUR CE
    // corpus (profils-types générés) sans toucher au stockage ni au contexte. Posé
    // puis effacé en try/finally → lecture seule absolue, aucun effet de bord global.
    // Param absent ⇒ comportement historique strictement inchangé (parité moteur).
    if (donnees && typeof definirContexteSimulation === 'function') {
        try {
            definirContexteSimulation(donnees);
            return _simulerIndicesInterne(da, pratiqueId);
        } finally {
            if (typeof effacerContexteSimulation === 'function') effacerContexteSimulation();
        }
    }
    return _simulerIndicesInterne(da, pratiqueId);
}

function _simulerIndicesInterne(da, pratiqueId) {
    const pratique = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(pratiqueId) : null;
    if (!pratique) return null;

    // C = complétion selon la config propre de la pratique simulée.
    const C_decimal = (typeof pratique.calculerCompletion === 'function') ? pratique.calculerCompletion(da) : null;

    // P = note finale de session de la pratique simulée (chemin portfolio paramétré,
    // Lot 2). Fallback sur calculerPerformance pour les familles sans note portfolio.
    let P_decimal = null;
    let noteFinale = null;
    let details = null;
    if (typeof calculerDetailsNoteFinale === 'function') {
        const d = calculerDetailsNoteFinale(da, pratiqueId);
        if (d && d.noteFinale !== null && d.noteFinale !== undefined) {
            noteFinale = d.noteFinale;
            P_decimal = d.noteFinale / 100;
            details = d;
        }
    }
    if (P_decimal === null && typeof pratique.calculerPerformance === 'function') {
        P_decimal = pratique.calculerPerformance(da);
    }

    // Mêmes arrondis que calculerEtStockerIndicesCP (0-1 → 0-100).
    const C = C_decimal !== null && C_decimal !== undefined ? Math.round(C_decimal * 100) : 0;
    const P = P_decimal !== null && P_decimal !== undefined ? Math.round(P_decimal * 100) : 0;

    // #326 (sous-item) — distinguer un « 0 » LÉGITIME (le moteur a calculé 0)
    // d'une note NON CONSTRUCTIBLE (P_decimal est resté null : ni portfolio
    // paramétré ni calculerPerformance n'ont pu produire de valeur → P forcé à 0
    // ci-dessus, trompeur). Champ ADDITIF, lecture seule : les consommateurs
    // historiques (golden masters, fiche profil) lisent C/P/noteFinale/details/
    // recit inchangés ; le banc s'en sert pour afficher « — non constructible ».
    const noteConstructible = (typeof P_decimal === 'number' && isFinite(P_decimal));

    // C2-d.0 — récit de calcul UNIFIÉ (contrat NOTE-CONCEPTION-C2 §4). Même
    // aiguillage que la note ci-dessus : STD via calculerDetailsNoteFinale.recit
    // (C2-a) ; SOM/SPE via instance.decrireCalcul (C2-b/C2-c). Additif, lecture
    // seule — la fiche de profil (C2-d) lit simulerIndices(da, id).recit sans
    // ré-aiguiller (SSOT, évite un 3ᵉ chemin de résolution). null si indisponible.
    let recit = null;
    if (details && details.recit) {
        recit = details.recit;
    } else if (typeof pratique.decrireCalcul === 'function') {
        recit = pratique.decrireCalcul(da);
    }

    return { pratique: pratiqueId, C, P, noteFinale, details, recit, noteConstructible };
}

/**
 * 🆕 BETA 95.5 : Récupère les indices C et P depuis IndexedDB (async)
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Promise<Object>} - { date, pratique, C, P, details } ou null
 */
async function obtenirIndicesCPAsync(da) {
    const cleIndices = cle('indicesCP');
    const indicesCP = await db.get(cleIndices, {});
    return indicesCP[da]?.actuel || null;
}

// obtenirIndicesCP → déplacé dans indices.js (#206)

/* ===============================
   🎯 CALCULS MULTI-OBJECTIFS

   Support pour le système d'évaluation multi-objectifs
   - Groupement des évaluations par objectif
   - Calcul de la performance par objectif (moyenne N meilleurs)
   - Calcul de la note finale pondérée

   DATE : 26 novembre 2025
   AUTEUR : Grégoire Bédard (Labo Codex)
   =============================== */

/**
 * Calcule la performance par objectif pour un étudiant
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} ensembleId - ID de l'ensemble d'objectifs
 * @returns {Object} - { obj1: {P: 85, nbArtefacts: 5, artefacts: [...]}, obj2: {...}, ... }
 *
 * EXEMPLES :
 * calculerPerformanceParObjectif('1234567', '<ensembleObjectifsId>')
 * → {
 *     obj1: { P: 85, nbArtefacts: 5, artefacts: [{id, note}, ...] },
 *     obj2: { P: 72, nbArtefacts: 3, artefacts: [{id, note}, ...] },
 *     ...
 *   }
 */
function calculerPerformanceParObjectif(da, ensembleId) {
    if (!da || !ensembleId) {
        console.warn('[Multi-Objectifs] DA ou ensembleId manquant');
        return null;
    }

    // 1. Charger l'ensemble d'objectifs
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble || !ensemble.objectifs) {
        console.warn('[Multi-Objectifs] Ensemble introuvable:', ensembleId);
        return null;
    }

    // 2. Charger les productions et évaluations
    const productions = obtenirDonneesSelonMode('productions');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // 3. Filtrer les évaluations de cet étudiant
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined &&
        !e.remplaceeParId
    );

    // 4. Grouper par objectif
    const performancesParObjectif = {};

    ensemble.objectifs.forEach(objectif => {
        // Trouver toutes les évaluations liées à cet objectif
        const evaluationsObjectif = evaluationsEleve.filter(ev => {
            const prod = productions.find(p => p.id === ev.productionId);
            return prod && prod.objectif === objectif.id;
        });

        if (evaluationsObjectif.length === 0) {
            performancesParObjectif[objectif.id] = {
                P: null,
                nbArtefacts: 0,
                artefacts: []
            };
            return;
        }

        // Trier par note décroissante et prendre les N meilleurs
        // Utiliser la configuration PAN pour le nombre à retenir
        const config = obtenirDonneesSelonMode('modalitesEvaluation') || {};
        const nombreARetenir = config.configPAN?.portfolio?.nombreARetenir || 3;

        evaluationsObjectif.sort((a, b) => b.noteFinale - a.noteFinale);
        const meilleurs = evaluationsObjectif.slice(0, nombreARetenir);

        // Calculer la moyenne
        const somme = meilleurs.reduce((acc, e) => acc + e.noteFinale, 0);
        const moyenne = somme / meilleurs.length;

        performancesParObjectif[objectif.id] = {
            P: moyenne,
            nbArtefacts: evaluationsObjectif.length,
            artefacts: meilleurs.map(e => ({
                id: e.productionId,
                note: e.noteFinale,
                date: e.dateEvaluation
            }))
        };
    });


    return performancesParObjectif;
}

/**
 * Calcule la note finale pondérée multi-objectifs
 *
 * Formule : Note_finale = Σ(P_obji × poids_i) / 100
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} ensembleId - ID de l'ensemble d'objectifs
 * @returns {Object} - { noteFinale: 78.5, details: {...} }
 *
 * EXEMPLES :
 * calculerNoteFinaleMultiObjectifs('1234567', '<ensembleObjectifsId>')
 * → {
 *     noteFinale: 78.5,
 *     nbObjectifsEvalues: 13,
 *     nbObjectifsSansNote: 0,
 *     performances: { obj1: {P: 85, poids: 8}, ... }
 *   }
 */
function calculerNoteFinaleMultiObjectifs(da, ensembleId) {
    if (!da || !ensembleId) {
        console.warn('[Multi-Objectifs] DA ou ensembleId manquant');
        return null;
    }

    // 1. Charger l'ensemble d'objectifs
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble || !ensemble.objectifs) {
        console.warn('[Multi-Objectifs] Ensemble introuvable:', ensembleId);
        return null;
    }

    // 2. Calculer performance par objectif
    const performances = calculerPerformanceParObjectif(da, ensembleId);

    if (!performances) {
        return null;
    }

    // 3. Calculer la note finale pondérée
    let noteFinale = 0;
    let poidsTotal = 0;
    let nbObjectifsEvalues = 0;
    let nbObjectifsSansNote = 0;

    const detailsPerformances = {};

    ensemble.objectifs.forEach(objectif => {
        const perf = performances[objectif.id];

        if (perf && perf.P !== null) {
            // Contribution de cet objectif = P × poids
            noteFinale += (perf.P * objectif.poids) / 100;
            poidsTotal += objectif.poids;
            nbObjectifsEvalues++;

            detailsPerformances[objectif.id] = {
                nom: objectif.nom,
                P: perf.P,
                poids: objectif.poids,
                contribution: (perf.P * objectif.poids) / 100,
                nbArtefacts: perf.nbArtefacts
            };
        } else {
            nbObjectifsSansNote++;
            detailsPerformances[objectif.id] = {
                nom: objectif.nom,
                P: null,
                poids: objectif.poids,
                contribution: 0,
                nbArtefacts: 0
            };
        }
    });


    return {
        noteFinale: noteFinale,
        nbObjectifsEvalues: nbObjectifsEvalues,
        nbObjectifsSansNote: nbObjectifsSansNote,
        poidsTotal: poidsTotal,
        performances: detailsPerformances
    };
}

/* ===============================
   🆕 CALCUL AVEC CATÉGORIES SÉLECTION/OBLIGATOIRES

   Support pour le système de catégories (Beta 95.4) :
   - Sélection : Pool de N meilleures productions retenues
   - Obligatoires : Productions toujours comptées (0 si manquante)

   DATE : Janvier 2026
   =============================== */

/**
 * Calcule la note finale avec catégories Sélection/Obligatoires
 *
 * Formule : Note = (Moyenne N meilleures Sélection × %sel) + (Moyenne Obligatoires × %obl)
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {object} configCategories - Configuration des catégories depuis pratiquesConfigurables
 * @returns {object} - { noteFinale, valide, details }
 *
 * EXEMPLE DE CONFIGURATION :
 * configCategories = {
 *   actif: true,
 *   selection: { nombreARetenir: 4, ponderation: 65 },
 *   obligatoires: { ponderation: 35 }
 * }
 *
 * EXEMPLE DE RÉSULTAT :
 * {
 *   noteFinale: 78.5,
 *   valide: true,
 *   details: {
 *     selection: { moyenne: 82, retenues: 4, total: 8, ponderation: 65, notes: [88, 85, 80, 75] },
 *     obligatoires: { moyenne: 72, completees: 2, total: 2, ponderation: 35, notes: [75, 69] }
 *   }
 * }
 */
function calculerNoteAvecCategories(da, configCategories) {
    if (!da || !configCategories || !configCategories.actif) {
        return { noteFinale: null, valide: false, details: null };
    }

    // 1. Charger les données
    const productions = obtenirDonneesSelonMode('productions') || [];
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // 2. Filtrer les évaluations de cet étudiant (non remplacées)
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined &&
        !e.remplaceeParId
    );

    // 3. Séparer les productions par catégorie
    const prodsSelection = productions.filter(p => p.categorie === 'selection');
    const prodsObligatoires = productions.filter(p => p.categorie === 'obligatoire');


    // 4. Configuration
    const { nombreARetenir, ponderation: pondSelection } = configCategories.selection || { nombreARetenir: 4, ponderation: 65 };
    const { ponderation: pondOblig } = configCategories.obligatoires || { ponderation: 35 };

    // 5. SÉLECTION : Récupérer les évaluations et prendre les N meilleures
    const evalsSelection = [];
    prodsSelection.forEach(prod => {
        const ev = evaluationsEleve.find(e => e.productionId === prod.id);
        if (ev) {
            evalsSelection.push({
                productionId: prod.id,
                titre: prod.titre || prod.activiteApprentissage || prod.description,
                note: ev.noteFinale
            });
        }
    });

    // Trier par note décroissante et prendre les N meilleures
    evalsSelection.sort((a, b) => b.note - a.note);
    const meilleures = evalsSelection.slice(0, nombreARetenir);

    const moyenneSelection = meilleures.length > 0
        ? meilleures.reduce((sum, e) => sum + e.note, 0) / meilleures.length
        : 0;

    // 6. OBLIGATOIRES : Toutes comptent (0 si manquante)
    const notesObligatoires = [];
    prodsObligatoires.forEach(prod => {
        const ev = evaluationsEleve.find(e => e.productionId === prod.id);
        notesObligatoires.push({
            productionId: prod.id,
            titre: prod.titre || prod.activiteApprentissage || prod.description,
            note: ev ? ev.noteFinale : 0,  // 0 si non remise
            manquante: !ev
        });
    });

    const moyenneObligatoires = notesObligatoires.length > 0
        ? notesObligatoires.reduce((sum, e) => sum + e.note, 0) / notesObligatoires.length
        : 0;

    // 7. NOTE FINALE PONDÉRÉE
    const noteFinale = (moyenneSelection * pondSelection / 100) + (moyenneObligatoires * pondOblig / 100);

    // 8. Déterminer si le calcul est valide (au moins une note dans chaque catégorie active)
    const valide = (prodsSelection.length === 0 || meilleures.length > 0) &&
                   (prodsObligatoires.length === 0 || notesObligatoires.length > 0);

    const resultat = {
        noteFinale: parseFloat(noteFinale.toFixed(2)),
        valide: valide,
        details: {
            selection: {
                moyenne: parseFloat(moyenneSelection.toFixed(2)),
                retenues: meilleures.length,
                total: prodsSelection.length,
                disponibles: evalsSelection.length,
                ponderation: pondSelection,
                notes: meilleures.map(e => e.note),
                productions: meilleures.map(e => ({ id: e.productionId, titre: e.titre, note: e.note }))
            },
            obligatoires: {
                moyenne: parseFloat(moyenneObligatoires.toFixed(2)),
                completees: notesObligatoires.filter(e => !e.manquante).length,
                total: prodsObligatoires.length,
                ponderation: pondOblig,
                notes: notesObligatoires.map(e => e.note),
                productions: notesObligatoires.map(e => ({ id: e.productionId, titre: e.titre, note: e.note, manquante: e.manquante }))
            }
        }
    };


    return resultat;
}

/**
 * Retourne la configuration complète de la pratique active depuis pratiquesConfigurables.
 * C'est la source de vérité pour portfolio, catégories, etc.
 *
 * @returns {object|null} - Objet configuration { portfolio, categories, ... } ou null
 */
function obtenirConfigPratiqueActive(pratiqueIdDemande = null) {
    const pratiquesConfig = db.getSync(cle('pratiquesConfigurables'), null) || db.getSync('pratiquesConfigurables', []);

    // #307 (simulation) : si une pratique est explicitement demandée, on résout SA
    // config sans changer l'état global. Sinon, repli sur la pratique active du
    // groupe-cours via obtenirPratiqueActiveGroupeCours() qui gère tous les fallbacks
    // (groupeCoursActif → infoCours → groupesCours → modalitesEvaluation).
    // Param absent ⇒ comportement historique strictement inchangé.
    const pratiqueId = pratiqueIdDemande
        || (typeof obtenirPratiqueActiveGroupeCours === 'function'
            ? obtenirPratiqueActiveGroupeCours() : null);

    if (!pratiqueId) {
        return null;
    }

    const configPratique = pratiquesConfig.find(p => p.id === pratiqueId);
    return configPratique?.configuration || null;
}

/**
 * Vérifie si une configuration de catégories est active pour une pratique.
 *
 * @param {string|null} pratiqueIdDemande - Pratique à inspecter (#307 simulation) ;
 *        absent ⇒ pratique active du groupe-cours (comportement historique).
 * @returns {object|null} - Configuration des catégories ou null si non active
 */
function obtenirConfigCategories(pratiqueIdDemande = null) {
    const config = obtenirConfigPratiqueActive(pratiqueIdDemande);
    if (!config?.categories?.actif) return null;
    return config.categories;
}

/**
 * Wrapper pour data-on-change : lit les params depuis les data-attributes de l'élément.
 * @param {HTMLElement} el - L'élément checkbox
 */
function toggleArtefactPortfolioFromEl(el) {
    var da = el.getAttribute('data-da');
    var portfolioId = el.getAttribute('data-portfolio-id');
    var nombreARetenir = parseInt(el.getAttribute('data-nombre-a-retenir'), 10);
    // Créer un pseudo-event avec target pour compatibilité
    var pseudoEvent = { target: el };
    toggleArtefactPortfolio(pseudoEvent, da, portfolioId, nombreARetenir);
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.toggleArtefactPortfolioFromEl = toggleArtefactPortfolioFromEl;

// Exporter les fonctions multi-objectifs pour utilisation par d'autres modules
window.calculerPerformanceParObjectif = calculerPerformanceParObjectif;
window.calculerNoteFinaleMultiObjectifs = calculerNoteFinaleMultiObjectifs;

// 🆕 Beta 95.4 : Exporter les fonctions de catégories
window.calculerNoteAvecCategories = calculerNoteAvecCategories;
window.obtenirConfigCategories = obtenirConfigCategories;
window.obtenirConfigPratiqueActive = obtenirConfigPratiqueActive;

// 🆕 Beta 95.5 : Exporter les fonctions d'indices C/P
window.calculerEtStockerIndicesCP = calculerEtStockerIndicesCP;
window.obtenirIndicesCPAsync = obtenirIndicesCPAsync;
window.simulerIndices = simulerIndices; // #307 Lot 5 — indices C/P en lecture seule pour une pratique simulée
// window.obtenirIndicesCP → indices.js (#206)


})();
