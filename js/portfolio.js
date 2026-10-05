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
 * Sélectionne les artefacts selon la modalité configurée.
 *
 * #816 (10 sept. 2026) — CETTE FONCTION NE PARLAIT PAS LA LANGUE DE L'ÉCRAN.
 * Le `<select>` de la pratique écrit `meilleurs` / `derniers` / `tous` /
 * `hybride` ; le `switch` ne connaissait que `meilleurs` / `recents` /
 * `recents-meilleurs` / `tous`. Deux modalités sur quatre tombaient donc dans
 * le `default` — « les N meilleures » — sous un nom qui annonce autre chose.
 * Le tri par `dateRemise` était mort de son côté : l'appelant posait un
 * `new Date()` identique sur chaque artefact à la lecture, si bien que la
 * comparaison de dates ne départageait jamais rien.
 *
 * Ce que « Hybride » veut dire a été tranché par Grégoire : les N meilleures de
 * la SÉLECTION, plus TOUTES les OBLIGATOIRES — la même règle que le moteur de la
 * note (`calculerNoteAvecCategories`) et que `profil-etudiant-actions.js`.
 * Le N de la Sélection est celui des catégories, pas celui du portfolio : sur
 * sa pratique, 4 meilleures + 2 obligatoires = les 6 artefacts de la note.
 *
 * @param {Array} artefactsRemisAvecNote - {id, productionId, numero, note, categorie}, non triés
 * @param {number} nombreARetenir - Nombre d'artefacts à retenir (hors hybride)
 * @param {string} modalite - vocabulaire de l'écran (`meilleurs`|`derniers`|`tous`|
 *   `hybride`) OU du moteur (`recents`|`recents-meilleurs`) : les deux sont acceptés,
 *   des pratiques enregistrées avant #434 pouvant porter le second.
 * @param {Object} [options] - { productions, configCategories }
 * @returns {Array} Artefacts sélectionnés
 */
function selectionnerArtefactsSelonModalite(artefactsRemisAvecNote, nombreARetenir, modalite, options = {}) {
    if (artefactsRemisAvecNote.length === 0) {
        return [];
    }

    const { productions = [], configCategories = null } = options;

    // LE comparateur de récence du moteur STD (SSOT, pratique-registre.js) —
    // plus de tri local qui pourrait dériver de celui de la note.
    const parRecence = typeof window.creerComparateurRecenceStd === 'function'
        ? window.creerComparateurRecenceStd(productions)
        : (a, b) => (b.numero || 0) - (a.numero || 0);
    const parNote = (a, b) => b.note - a.note;

    const mode = modalite === 'derniers' ? 'recents' : (modalite || 'meilleurs');

    // HYBRIDE — piloté par la config des catégories, qui a priorité comme dans
    // `profil-etudiant-actions.js` et `pratiques-gestion.js`.
    if (mode === 'hybride' || (configCategories && configCategories.actif)) {
        const nSelection = (configCategories && configCategories.selection
            && configCategories.selection.nombreARetenir) || nombreARetenir;
        const obligatoires = artefactsRemisAvecNote.filter(a => a.categorie === 'obligatoire');
        const meilleuresSelection = artefactsRemisAvecNote
            .filter(a => a.categorie !== 'obligatoire')
            .slice()
            .sort(parNote)
            .slice(0, nSelection);
        return [...meilleuresSelection, ...obligatoires];
    }

    switch (mode) {
        case 'meilleurs':
            // N meilleurs artefacts (note décroissante).
            // Principe de maîtrise — évalue le plus haut niveau atteint.
            return artefactsRemisAvecNote.slice().sort(parNote).slice(0, nombreARetenir);

        case 'recents':
            // N plus récents — représentatif du niveau terminal/actuel.
            return artefactsRemisAvecNote.slice().sort(parRecence).slice(0, nombreARetenir);

        case 'recents-meilleurs':
            // Legacy : top 50 % par note, puis les N plus récents. Aucune option de
            // l'écran ne produit plus cette valeur depuis #434 ; conservée pour les
            // pratiques enregistrées avant. Trie désormais par récence RÉELLE.
            return artefactsRemisAvecNote
                .slice()
                .sort(parNote)
                .slice(0, Math.max(1, Math.ceil(artefactsRemisAvecNote.length * 0.5)))
                .sort(parRecence)
                .slice(0, nombreARetenir);

        case 'tous':
            // Toutes les évaluations comptent, sans sélection.
            return artefactsRemisAvecNote;

        default:
            console.warn(`Modalité inconnue: ${modalite}, utilisation de 'meilleurs' par défaut`);
            return artefactsRemisAvecNote.slice().sort(parNote).slice(0, nombreARetenir);
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

        // #394 (L10) : configuration depuis pratiquesConfigurables (source canonique
        // G2-a, la même que le calcul) — plus de lecture du snapshot configPAN qui
        // driftait ; fallback conservé sur portfolio.regles (ancien format productions).
        const configPratique = (typeof obtenirConfigPratiqueActive === 'function'
            ? obtenirConfigPratiqueActive() : null) || {};
        const configPortfolio = configPratique.portfolio || {};
        // #816 — la config Sélection/Obligatoires, LA MÊME SOURCE que le moteur de
        // la note (`profil-etudiant-actions.js`). Sans elle, le panneau cochait
        // « les N meilleures » là où la note comptait « N meilleures + obligatoires ».
        const configCategories = configPratique.categories
            || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);

        const nombreTotal = configPortfolio.nombreTotal || portfolio.regles?.nombreTotal || artefactsPortfolio.length;
        const minimumRequis = configPortfolio.minimumCompletion || portfolio.regles?.minimumCompletion || 7;
        const nombreARetenir = configPortfolio.nombreARetenir || portfolio.regles?.nombreARetenir || 3;
        const methodeSelection = configPortfolio.methodeSelection || 'meilleurs';

        // #816 — LE plafond de la sélection manuelle. En hybride, la note retient
        // N meilleures de la Sélection PLUS toutes les Obligatoires : plafonner à
        // `nombreARetenir` empêchait de reproduire à la main ce que le moteur
        // compte, dès que les deux nombres divergent.
        const estHybrideActif = !!(configCategories && configCategories.actif)
            || methodeSelection === 'hybride';
        const plafondSelection = estHybrideActif
            ? ((configCategories && configCategories.selection
                && configCategories.selection.nombreARetenir) || nombreARetenir)
              + artefactsPortfolio.filter(p => p.categorie === 'obligatoire').length
            : nombreARetenir;

        // Construire la liste des artefacts avec leur statut
        const artefacts = [];
        
        // Ajouter les artefacts existants
        artefactsPortfolio.forEach(art => {
            const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
            artefacts.push({
                id: art.id,
                // #816 — le comparateur de récence de la SSOT lit `productionId`.
                productionId: art.id,
                // #816 — 'selection' | 'obligatoire' | null : c'est elle qui range
                // un artefact dans son bloc en mode hybride.
                categorie: art.categorie || null,
                titre: art.titre,
                description: art.description || '',
                numero: art.numero || parseInt(art.id.match(/\d+/)?.[0]) || 0, // AJOUT (24 jan 2026)
                remis: !!evaluation,
                note: evaluation?.noteFinale || null,
                niveau: evaluation ? ((typeof niveauFinalAffichable === 'function') ? (niveauFinalAffichable(evaluation) || null) : (evaluation.niveauFinal || null)) : null,   // #941 lot S1
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
            // #816 — le `dateRemise: new Date()` posé ici valait le MÊME instant pour
            // tous les artefacts : le tri par date ne départageait rien. La récence
            // se lit sur le numéro de production, via le comparateur de la SSOT.
            const artefactsRemisAvecNote = artefacts.filter(a => a.remis && a.note !== null);

            // Sélectionner selon la modalité configurée
            const artefactsSelectionnes = selectionnerArtefactsSelonModalite(
                artefactsRemisAvecNote,
                nombreARetenir,
                methodeSelection,
                { productions: artefactsPortfolio, configCategories }
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
                    modalite: methodeSelection, // Tracer quelle modalité a été utilisée
                    // #816 — la modalité configurée ne suffit pas à relire ce qui a
                    // été fait : les catégories ont priorité sur elle. Tracer les deux
                    // permet de départager après coup une écriture d'une autre.
                    categoriesActives: !!(configCategories && configCategories.actif)
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
                                   data-da="${da}" data-portfolio-id="${portfolio.id}" data-nombre-a-retenir="${plafondSelection}">
                            <div class="portfolio-artefact-contenu">
                                <div class="portfolio-artefact-titre ${art.retenu ? 'portfolio-artefact-titre-retenu' : 'portfolio-artefact-titre-normal'}">
                                    ${echapperHtml(art.description || art.titre)}
                                </div>
                                <div class="portfolio-artefact-meta">
                                    ${art.remis
                                        ? `<span class="u-texte-succes"><span class="icone-inline icone-inline--check" aria-hidden="true"></span>Remis</span>
                                           <span>${(typeof noteDiffereeActive === 'function' && noteDiffereeActive()) ? badgeNoteDifferee() : `<strong>Note :</strong> ${art.note}/100`}</span>
                                           ${art.niveau ? `<span><strong>Niveau :</strong> ${echapperHtml(art.niveau)}</span>` : ''}`
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
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cle('portfoliosEleves'));   // lot F : geste hors témoin (cocher un artefact)

        // 🔄 Recalculer les indices C et P après modification de sélection
        if (typeof calculerEtStockerIndicesCP === 'function') {
            calculerEtStockerIndicesCP();
        }

        // Recharger TOUT le profil pour mettre à jour les indices A-C-P-M-R
        if (typeof afficherProfilComplet === 'function') {
            afficherProfilComplet(da);
            // Lot 4 du cadrage 11 (11 sept. 2026) : l'ancien « rouvrir le panneau Portfolio »
            // appelait `toggleDetailIndice`, privée d'une autre IIFE (jamais atteinte) et
            // sans conteneur dans la page ; la fonction est retirée avec cet appel.
        } else {
            // Fallback : recharger uniquement le portfolio
            chargerPortfolioEleveDetail(da);
        }

    } catch (error) {
        console.error('Erreur toggle artefact:', error);
        alert('Erreur lors de l\'enregistrement');
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

// ⮕ #575 (lot 4 du plan SOLO, B1+B2) — `convertirNiveauEnPourcentage` A ÉTÉ
// SUPPRIMÉE ICI, AVEC SON REPLI ET SA CLÉ MORTE.
//
// Elle convertissait un code de niveau en pourcentage et se repliait, quand
// elle ne trouvait rien, sur `{0:0, I:32, D:69.5, M:79.5, E:92.5}` — le
// QUATRIÈME repli IDME du dépôt, celui que #529 avait manqué. Son échelle, elle
// la cherchait sous `db.getSync('echellesPerformance')` : une clé que RIEN
// n'écrit dans tout `js/` (le stockage réel est `echellesTemplates`, namespacé
// par `cle()`). Le repli n'était donc pas un filet de sécurité, c'était le
// chemin NORMAL — patron `feedback-cle-db-lue-jamais-ecrite`. Chez Grégoire il
// rendait 32/69,5/79,5/92,5 au lieu de ses 40/65/75/100 ; ailleurs, `|| 0`
// rendait 0 % pour tout code hors I/D/M/E.
//
// Son unique appelant (le bloc « défis communs » de `interventions.js`) est
// supprimé au même geste. La conversion juste vit dans
// `profil-etudiant-calculs.js` : `obtenirTableConversionNiveaux(echelleId)` +
// `convertirNiveauEnScore` — elles lisent l'échelle de CHAQUE évaluation, y
// compris celle embarquée dans une pratique configurable, et rendent `null`
// plutôt qu'un chiffre inventé quand l'échelle ne se résout pas.

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
 * #871 (17 sept. 2026) — LA pratique dont les indices C et P sont calculés et stockés : celle du
 * groupe-cours actif. Un seul endroit la résout, pour le calcul de C et pour le détail que l'écran en montre.
 * @returns {{pratiqueId:string, pratique:?Object}}
 */
function _resoudrePratiqueDesIndicesCP() {
    // Lot N1a (#710, 21 sept. 2026) : LA résolution du registre, sans repli. Avant, le pointeur
    // vide devenait « sommative » ici, et « standards » chez le profil.
    const resolution = (typeof resoudrePratiqueActive === 'function')
        ? resoudrePratiqueActive()
        : { etat: 'registre-absent', id: null, pratique: null };   // le registre n'est pas chargé : on ne sait rien
    return { pratiqueId: resolution.id, pratique: resolution.pratique, etat: resolution.etat };
}

/**
 * #871, volet complétion (17 sept. 2026) — LE DÉTAIL DE LA COMPLÉTION D'UN ÉLÈVE, TEL QUE L'INDICE C LE COMPTE.
 *
 * Tranché par Grégoire : « le pourcentage doit suivre la fraction » (15 sept.) et « l'évaluation terminale est
 * une remise que la complétion suit » (17 sept.). Avant, le rapport et le profil refaisaient chacun leur
 * compte (les artefacts du portfolio seulement) à côté d'un indice qui comptait aussi la terminale :
 * « 80% » et « 7 / 9 ». Les sites d'affichage lisent maintenant CE détail, celui dont
 * `calculerCompletion` de la pratique active découle ; ils ne comptent plus rien eux-mêmes.
 * Les différences entre familles (travaux dus en standards, palier le plus haut en spécifications) suivent.
 *
 * @param {string} da - Numéro de DA
 * @returns {{remis:number,total:number}|null} null : aucune donnée (l'indice stocké vaut alors 0)
 */
function obtenirDetailsCompletion(da) {
    const { pratique } = _resoudrePratiqueDesIndicesCP();
    if (!pratique || typeof pratique.calculerDetailsCompletion !== 'function') return null;
    return pratique.calculerDetailsCompletion(da);
}

/**
 * L'ENTIER D'UN INDICE C OU P (0-1 → 0-100) : UNE NOTE EXACTEMENT EN ,5 MONTE.
 *
 * CE QUI EXISTAIT. `Math.round(decimal * 100)` aux deux sites (indice stocké, indice simulé).
 * L'aller-retour ÷ 100 × 100 perd quatre demies à la virgule flottante : 57,5 / 100 * 100 rend
 * 57,49999999999999, donc 57 ; de même 14,5 → 14, 28,5 → 28, 56,5 → 56 — alors que 74,5 → 75.
 * Pour C, 23 remis sur 40 attendus (57,5 %) tombait à 57 de la même façon.
 *
 * LA RÈGLE (décision de Grégoire, 21 sept. 2026) : celle du niveau imprimé (#701, 17 sept.) —
 * une note exactement en ,5 monte (57,5 → 58). Même expression que `niveauDuPourcentage`
 * (evaluation-calcul.js) : le premier arrondi, au millionième, retire le bruit de la virgule
 * flottante, d'où qu'il vienne (l'aller-retour, ou une moyenne pondérée qui VAUT 57,5 et sort
 * 57,49999999999999 du calcul) ; le second rend l'entier. Logée ici et non partagée avec
 * evaluation-calcul.js : les deux fichiers se chargent séparément, à l'écran comme dans les bancs.
 *
 * ⚠ Les DEUX sites passent par ici, et seulement par ici : `calculerEtStockerIndicesCP` et
 * `_simulerIndicesInterne` doivent rendre le même entier (parité, #307).
 *
 * @param {number} decimal - indice sur 0-1
 * @returns {number} entier sur 0-100, demi vers le haut
 */
function arrondirIndiceSurCent(decimal) {
    return Math.round(Math.round(decimal * 100 * 1e6) / 1e6);
}

/**
 * LA NOTE DU COURS D'UN ÉLÈVE, SUR 0-1, POUR LA PRATIQUE ACTIVE — ou null quand elle n'est pas constructible.
 *
 * Lot N2 (#716, 22 sept. 2026) : extraite de `calculerEtStockerIndicesCP` pour qu'il n'en existe qu'une
 * définition. L'indice P stocké et le P historique des snapshots (snapshots.js, `calculerIndicesHistoriques`)
 * passent par ici ; le snapshot la calcule sur les seules évaluations échues à sa date.
 *
 * P via calculerDetailsNoteFinale pour garantir la cohérence avec la note affichée dans le profil.
 * #394 (L3) : MÊME discrimination par famille que _simulerIndicesInterne (#326 T1) — une STD dont le
 * chemin riche échoue est NON CONSTRUCTIBLE ; le repli calculerPerformance ne masque plus l'échec par
 * un nombre. Le repli reste LÉGITIME pour les familles sans note portfolio riche (SOM/SPE/DEN →
 * calculerDetailsNoteFinale rend null).
 *
 * @param {string} da - Numéro de DA
 * @param {Object} pratique - l'instance de la pratique active (`resoudrePratiqueActive().pratique`)
 * @returns {number|null} la note sur 0-1, ou null (non constructible)
 */
function calculerNoteDuCours(da, pratique) {
    const estStd = !!(typeof pratique.obtenirCode === 'function' && pratique.obtenirCode() === 'STD');
    let P_decimal = null;
    let cheminRicheStdAEchoue = false;
    if (typeof calculerDetailsNoteFinale === 'function') {
        const detailsNote = calculerDetailsNoteFinale(da);
        if (detailsNote && detailsNote.noteFinale !== null && detailsNote.noteFinale !== undefined) {
            P_decimal = detailsNote.noteFinale / 100; // Convertir % → 0-1
        } else if (detailsNote && estStd) {
            cheminRicheStdAEchoue = true;
        }
    }

    if (P_decimal === null && !cheminRicheStdAEchoue) {
        P_decimal = pratique.calculerPerformance(da);
    }
    return (typeof P_decimal === 'number' && isFinite(P_decimal)) ? P_decimal : null;
}

/**
 * Lot N4 (#713, 23 sept. 2026) — POURQUOI LA NOTE DU COURS N'EXISTE PAS, dite par la pratique qui l'a calculée.
 *
 * Source unique de la cause : la pratique la déclare (`expliquerNoteNonConstructible`, aujourd'hui la famille
 * par spécifications — « Ta pratique ne dit pas quelle note donner quand aucun forfait n'est atteint. ») et
 * tous les écrans qui écrivent « — » la lisent ici : le profil, le rapport, le Suivi (pratique active) et
 * l'export (par `simulerIndices`, champ `causeNonConstructible`). Rien n'est rangé dans le stockage : la cause
 * se relit, comme la note se recalcule.
 *
 * @param {string} da
 * @param {Object} [pratique] - l'instance ; absente : la pratique active du groupe-cours
 * @returns {string|null} la phrase, ou null quand la pratique n'en déclare pas
 */
function causeNoteNonConstructible(da, pratique) {
    const inst = pratique || _resoudrePratiqueDesIndicesCP().pratique;
    if (!inst || typeof inst.expliquerNoteNonConstructible !== 'function') return null;
    return inst.expliquerNoteNonConstructible(da) || null;
}

/**
 * 🆕 BETA 95.5 : Calcule et stocke les indices C et P (async + pratique active)
 *
 * @returns {Promise<Object>} - Structure avec indices pour chaque étudiant
 */
function calculerEtStockerIndicesCP() {
    // #397 : pipeline sur N étudiants — cache de lecture pour la durée du lot
    // (calculerCompletion/calculerDetailsNoteFinale relisaient evaluations +
    // productions PAR étudiant : ~350 ms de parses répétés à 75 étu, mesuré).
    // Réentrant : la chaîne assiduité → C/P imbrique proprement (profondeur).
    if (typeof demarrerCacheLecture === 'function') demarrerCacheLecture();
    try {
        return _calculerEtStockerIndicesCPInterne();
    } finally {
        if (typeof terminerCacheLecture === 'function') terminerCacheLecture();
    }
}

function _calculerEtStockerIndicesCPInterne() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const productions = obtenirDonneesSelonMode('productions');

    // 🔧 FIX Beta 97.4 : Converti en synchrone pour éviter race condition
    // L'appelant (chargerTableauBordApercu) n'await pas cette fonction,
    // donc les indices doivent être disponibles immédiatement après l'appel
    const cleIndices = cle('indicesCP');
    let indicesCP = db.getSync(cleIndices, {});

    // 🆕 BETA 95.5 : la pratique active du groupe-cours, depuis le registre (#871 : résolution partagée
    // avec `obtenirDetailsCompletion` — la fraction affichée vient de la pratique qui a calculé C).
    const { pratiqueId, pratique, etat } = _resoudrePratiqueDesIndicesCP();
    const dateCalcul = new Date().toISOString();

    if (etat === 'registre-absent' || etat === 'illisible') {
        // Ne rien écrire sur une ignorance : « le registre n'a pas chargé » n'est pas « aucune pratique »,
        // et une pratique assignée dont l'instance ne se construit pas (stock de #898) non plus — comme avant ce lot.
        console.error(`❌ Pratique active ${etat === 'illisible' ? `"${pratiqueId}" illisible` : 'inconnue (registre non chargé)'} : indices C et P non recalculés`);
        return indicesCP;
    }

    if (!pratique) {
        // Lot N1a (#710, ajout D-1 du 17 sept.) — SANS PRATIQUE, « NON CONSTRUCTIBLE » S'ÉCRIT.
        // Avant, on sortait ici sans rien écrire : retirer la pratique laissait l'indice de
        // l'ANCIENNE (76, « constructible ») affiché pendant que le profil disait qu'aucune
        // pratique n'était assignée. Même encodage que #394 : P à 0, `noteConstructible` à false.
        // Rien n'est perdu : les évaluations ne bougent pas, l'indice se recalcule dès qu'une
        // pratique est assignée.
        // Lot N1b (21 sept. 2026) — ET C N'EST PAS UN ZÉRO NON PLUS. La complétion se calcule PAR la
        // pratique (la spécification compte autrement) : sans pratique, il n'y a pas de C. Champ
        // ADDITIF `completionConstructible: false`, comme `noteConstructible` (#394) : `C` reste le
        // nombre 0 pour les lecteurs du stock, et `calculerTousLesIndices` en fait un `null` —
        // l'écran écrit « — », et « un indice affiché « — » n'est jamais sous 70 » (lot 25).
        // ⚠ `noteConstructible: false` SEUL ne dit PAS cela : une Standards au portfolio incomplet
        // a un P non constructible et un C bien réel.
        (etudiants || []).forEach(etudiant => {
            indicesCP[etudiant.da] = {
                actuel: {
                    date: dateCalcul,
                    pratique: null,
                    C: 0,
                    P: 0,
                    noteConstructible: false,
                    completionConstructible: false,
                    details: { calculViaPratique: false, pratiqueActive: etat }
                }
            };
        });
        indicesCP.dateCalcul = dateCalcul;
        db.setSync(cleIndices, indicesCP);
        return indicesCP;
    }


    // Calculer pour chaque élève du groupe — EXCLU PAR STATUT COMPRIS (#745, lot E du cadrage du
    // dépistage, 17 sept. 2026 ; tranché par Grégoire le 16) : il se calcule avec la règle de sa
    // pratique, comme les autres. Avant, il était écarté ici : son entrée restait FIGÉE à la valeur
    // du jour de son exclusion, ou manquait et le profil tombait sur « les 3 meilleures notes ».
    // « Hors des moyennes du groupe » se tient à la lecture : voir indices.js,
    // calculerEtSauvegarderIndicesAssiduite.
    (etudiants || []).forEach(etudiant => {
        const da = etudiant.da;

        // ========================================
        // 🆕 BETA 96 : CALCUL P = NOTE FINALE DE SESSION
        // ========================================
        // FIX #37 : L'indice P doit refléter la vraie note finale de session
        // qui prend en compte la méthode de sélection, les pondérations, etc.

        // Calculer C via la pratique active
        const C_decimal = pratique.calculerCompletion(da);

        // P : LA note du cours (lot N2, #716 : extraite pour que le P historique des snapshots la partage).
        const P_decimal = calculerNoteDuCours(da, pratique);

        // #394 (D1 règle 4) : encodage STOCKÉ de « non constructible » — champ
        // ADDITIF, miroir exact de simulerIndices. Les lecteurs historiques de .P
        // continuent de lire un nombre (0) ; les affichages montrent « — ».
        const noteConstructible = P_decimal !== null;

        // Convertir 0-1 → 0-100, demi vers le haut (arrondirIndiceSurCent)
        const C = C_decimal !== null ? arrondirIndiceSurCent(C_decimal) : 0;
        const P = noteConstructible ? arrondirIndiceSurCent(P_decimal) : 0;

        const entreeActuelle = {
            date: dateCalcul,
            pratique: pratiqueId,
            C: C,
            P: P,
            noteConstructible: noteConstructible,
            details: {
                calculViaPratique: true
            }
        };

        // #397 (décision D3, 5 août 2026) : l'historique indicesCP est PURGÉ —
        // zéro lecteur au grep (les trajectoires lisent les snapshots hebdomadaires
        // de snapshots.js) et il croissait sans borne à chaque recalcul (la clé
        // grossissait toute la session, rendu prioritaires 44 → 203 ms mesuré).
        // L'entrée du DA est réécrite SANS le champ : purge progressive au recalcul,
        // aucune migration de données.
        indicesCP[da] = { actuel: entreeActuelle };
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
    // #326 T1 : seule l'STD a une note portfolio « riche » (calculerDetailsNoteFinale)
    // comme source AUTORITATIVE ; SOM/SPE/DEN tirent leur note de calculerPerformance.
    // Le discriminateur est donc la FAMILLE de la pratique, pas la forme du retour. Si
    // une pratique STD ne peut PAS bâtir sa note (config absente, pondérations manquantes,
    // aucun artefact retenu), elle est NON CONSTRUCTIBLE — on n'emploie pas le repli, qui
    // masquerait l'échec par un 0 trompeur (décision Grégoire, 28 juin).
    const estStd = !!(pratique && typeof pratique.obtenirCode === 'function' && pratique.obtenirCode() === 'STD');
    let P_decimal = null;
    let noteFinale = null;
    let details = null;
    let cheminRicheStdAEchoue = false;
    if (typeof calculerDetailsNoteFinale === 'function') {
        const d = calculerDetailsNoteFinale(da, pratiqueId);
        if (d && d.noteFinale !== null && d.noteFinale !== undefined) {
            noteFinale = d.noteFinale;
            P_decimal = d.noteFinale / 100;
            details = d;
        } else if (d && estStd) {
            // L'STD a tourné mais n'a pas pu bâtir la note. On garde `details` (il porte
            // d.erreur de config + d.recit) et on N'utilise PAS le repli → non constructible.
            details = d;
            cheminRicheStdAEchoue = true;
        }
    }
    // Repli calculerPerformance : LÉGITIME pour les familles SANS note portfolio riche
    // (SOM/SPE/DEN → calculerDetailsNoteFinale rend `null`). Écarté quand l'STD a
    // explicitement échoué, sinon il re-masquerait le « non constructible ».
    if (P_decimal === null && !cheminRicheStdAEchoue && typeof pratique.calculerPerformance === 'function') {
        P_decimal = pratique.calculerPerformance(da);
    }

    // Mêmes arrondis que calculerEtStockerIndicesCP (0-1 → 0-100) : la même fonction, demi vers le haut.
    const C = C_decimal !== null && C_decimal !== undefined ? arrondirIndiceSurCent(C_decimal) : 0;
    const P = P_decimal !== null && P_decimal !== undefined ? arrondirIndiceSurCent(P_decimal) : 0;

    // #326 (sous-item) — distinguer un « 0 » LÉGITIME (le moteur a calculé 0)
    // d'une note NON CONSTRUCTIBLE (P_decimal est resté null : soit le chemin riche STD
    // a échoué — config absente, pondérations manquantes, aucun artefact — et on a
    // écarté le repli (T1) ; soit calculerPerformance n'a pu produire de valeur → P
    // forcé à 0 ci-dessus, trompeur). Champ ADDITIF, lecture seule : les consommateurs
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

    // #706 — combien d'évaluations de l'élève sont écartées de la note (brouillons, portée
    // nulle) : l'export des résultats le dit, sur le modèle « 2 évaluations en brouillon, non
    // comptées ». Additif ; null si le registre n'est pas chargé.
    const ecartees = (typeof compterEvaluationsEcarteesDeLaNote === 'function')
        ? compterEvaluationsEcarteesDeLaNote(da) : null;

    // Lot N4 (#713) — la cause d'une note absente, pour l'export (additif ; null quand la note existe).
    const causeNonConstructible = noteConstructible ? null : causeNoteNonConstructible(da, pratique);

    return { pratique: pratiqueId, C, P, noteFinale, details, recit, noteConstructible, ecartees, causeNonConstructible };
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
        // #394 (L10) : nombre à retenir depuis la config de la pratique active
        // (pratiquesConfigurables, G2-a) — plus de lecture du snapshot configPAN.
        const nombreARetenir = (typeof obtenirConfigPratiqueActive === 'function'
            ? obtenirConfigPratiqueActive()?.portfolio?.nombreARetenir : null) || 3;

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

/* #402 (L11, audit 5 août 2026) : calculerNoteFinaleMultiObjectifs RETIRÉE —
   somme pondérée jamais normalisée par poidsTotal ET zéro appelant (grep js/ +
   index.html + tests). Ablation zéro-dette plutôt que correction d'un mort. */

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

    // 2. Filtrer les évaluations de cet étudiant — #706 : la règle unique du registre
    // (remplacées, sans note, brouillons non verrouillés, portée nulle : hors note).
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da && window.evaluationEntreDansLaNote(e)
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
    // Lot N1a (21 sept. 2026) — LA MÊME DÉSIGNATION QUE L'INSTANCE, LA MÊME FORME QUE `construireConfigComplete`.
    // Avant : l'id BRUT cherché dans la bibliothèque (#711 : l'instance, elle, se résolvait par
    // l'id normalisé — le calcul et sa configuration ne parlaient pas de la même pratique), et
    // `.configuration` seul (#712 : une pratique importée, rangée sous `.config`, résolvait
    // mais restait « configuration de portfolio absente »).
    // #307 (simulation) : une pratique explicitement demandée se lit sans changer l'état global.
    const donnees = pratiqueIdDemande
        ? (typeof trouverPratiqueEnBibliotheque === 'function' ? trouverPratiqueEnBibliotheque(pratiqueIdDemande) : null)
        : (typeof designerPratiqueActive === 'function' ? designerPratiqueActive().donnees : null);
    if (!donnees) {
        return null;
    }
    return donnees.configuration || donnees.config || null;
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

// 🆕 Beta 95.4 : Exporter les fonctions de catégories
// #816 — exposé pour être ÉPROUVÉ. Cette fonction décide ce qui s'écrit dans
// `portfoliosEleves`, c'est-à-dire dans les données de l'utilisateur : elle ne
// peut pas rester hors de portée des bancs.
window.selectionnerArtefactsSelonModalite = selectionnerArtefactsSelonModalite;
window.calculerNoteAvecCategories = calculerNoteAvecCategories;
window.obtenirConfigCategories = obtenirConfigCategories;
window.obtenirConfigPratiqueActive = obtenirConfigPratiqueActive;

// 🆕 Beta 95.5 : Exporter les fonctions d'indices C/P
window.calculerEtStockerIndicesCP = calculerEtStockerIndicesCP;
window.calculerNoteDuCours = calculerNoteDuCours;   // lot N2 (#716) — la note du cours, partagée avec le P historique des snapshots
window.arrondirIndiceSurCent = arrondirIndiceSurCent;   // lot N2 (#716) — le même entier pour le P historique
window.obtenirDetailsCompletion = obtenirDetailsCompletion;   // #871 — la fraction affichée à côté de C
window.causeNoteNonConstructible = causeNoteNonConstructible;   // lot N4 (#713) — la cause d'une note « — »
window.obtenirIndicesCPAsync = obtenirIndicesCPAsync;
window.simulerIndices = simulerIndices; // #307 Lot 5 — indices C/P en lecture seule pour une pratique simulée
// window.obtenirIndicesCP → indices.js (#206)


})();
