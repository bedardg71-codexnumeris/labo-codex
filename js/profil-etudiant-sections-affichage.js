/* ===============================
   profil-etudiant-sections-affichage.js
   Sous-module renommé depuis profil-etudiant.js (session D refactor, 18 mai 2026).

   Périmètre : zone HIGH partie 2 — sections d'affichage du profil étudiant.
   Contient l'orchestrateur central `afficherProfilComplet` (cyc 58, à éclater
   étape 4) + ~30 fonctions `genererSection*` + handlers UI + 3 variables
   module-scope encapsulées dans l'IIFE :
   - `profilActuelDA` dual-write atomique (état pivot, lu 24× hors module via window.X)
   - `sectionProfilActive` (section profil active par défaut « productions »)
   - `indiceActif` (indice A/C/P actuellement déployé en détail)

   Index historique : MODULE 15 PROFIL DÉTAILLÉ D'UN ÉTUDIANT (modularisation 10 oct 2025).

   Sous-modules complémentaires (refactor sessions A+B+C 18 mai 2026) :
   - profil-etudiant-helpers.js (16 fonctions : helpers + badges + interprétations indices)
   - profil-etudiant-calculs.js (14 fonctions : moyennes + IPB + RàI + cibles)
   - profil-etudiant-rapport.js (7 fonctions : rapport API + préférences)
   - profil-etudiant-diagnostics.js (11 fonctions : diagnostics SRPNF + blocs RLO + onglets)
   - profil-etudiant-confidentiel.js (8 fonctions : modal PII + services adaptés)
   - profil-etudiant-actions.js (8 fonctions : cascade consulterEvaluation + jetons + patterns)

   État pivot critique préservé (Écart #6 MODULES-MAP §2.3) :
   - L52 `let profilActuelDA = null;` (module-scope, après en-tête)
   - L53 `window.profilActuelDA = null;` (global, lu 24× hors module)
   - Couple `profilActuelDA = X; window.profilActuelDA = X;` doit rester atomique
     dans afficherProfilComplet (dual-write atomique L2219-2220 originale).

   @see SESSION.md — Récap session D
   @see audit/refactoring-prep/MODULES-MAP.md §2.3
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : echapperHtml()
   - 02-navigation.js : afficherSousSection()
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   - afficherSousSection() (depuis 02-navigation.js)
   
   Éléments HTML requis:
   - #contenuProfilEtudiant : Conteneur principal du profil
   - #portfolioEleveDetail : Conteneur du portfolio
   - #etudiants-profil : Sous-section (gérée par 02-navigation.js)
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'productions' : Array des productions (dont artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations
   - 'portfoliosEleves' : Object avec sélections d'artefacts
   
   COMPATIBILITÉ:
   - ES6+ requis
   - Navigateurs modernes
   - Pas de dépendances externes
   =============================== */

/**
 * Génère le HTML de la section Engagement (E = A × C × P)
 * Structure en 3 colonnes: Assiduité, Complétion, Performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function _calculerIndicesMobilisation(da, pratiqueConfig) {
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const indicesActifs = calculerTousLesIndices(da);
    if (pratiqueConfig === 'sommative') {
        return { indicesSOM: indicesActifs, indicesPAN: { A: indicesActifs.A, C: 0, P: 0, M: 0 } };
    }
    return { indicesPAN: indicesActifs, indicesSOM: { A: indicesActifs.A, C: 0, P: 0, M: 0 } };
}

function _trouverEvaluationActiveMobilisation(evaluationsProduction) {
    if (evaluationsProduction.length === 0) return null;
    // PRIORITÉ 1 : reprise active (repriseDeId + non remplacée)
    const reprise = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);
    if (reprise) return reprise;
    // PRIORITÉ 2 : évaluation avec jeton de délai actif
    const avecDelai = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
    if (avecDelai) return avecDelai;
    // PRIORITÉ 3 : toute évaluation active (non remplacée)
    const active = evaluationsProduction.find(e => !e.remplaceeParId);
    if (active) return active;
    // PRIORITÉ 4 : si toutes remplacées, première (cas rare)
    return evaluationsProduction[0];
}

function _construireArtefactMobilisation(art, evaluation) {
    const statutRemise = evaluation?.statutRemise || 'non-remis';
    const statutIntegrite = evaluation?.statutIntegrite || 'recevable';
    const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';
    const estRemis = evaluation &&
        (statutRemise !== 'non-remis' && statutRemise !== 'retard') &&
        !estNonRecevable;
    return {
        id: art.id,
        titre: art.titre,
        description: art.description || art.titre,
        remis: estRemis,
        note: evaluation?.noteFinale ?? null,
        niveau: evaluation?.niveauFinal ?? null,
        statutRemise: statutRemise,
        statutIntegrite: statutIntegrite,
        estNonRecevable: estNonRecevable,
        jetonReprise: evaluation?.repriseDeId ? true : false,
        jetonDelai: evaluation?.jetonDelaiApplique ? true : false,
        retenu: false
    };
}

function _construireListeArtefactsMobilisation(da, productions, evaluations) {
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = [];
    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            if (!artefactsDonnes.find(a => a.id === evaluation.productionId)) {
                const production = artefactsPortfolio.find(p => p.id === evaluation.productionId);
                if (production) artefactsDonnes.push(production);
            }
        }
    });
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const artefacts = artefactsDonnes.map(art => {
        const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === art.id);
        const evaluation = _trouverEvaluationActiveMobilisation(evaluationsProduction);
        return _construireArtefactMobilisation(art, evaluation);
    });
    return { artefacts, evaluationsEleve, artefactsPortfolio };
}

function _selectionnerArtefactsMobilisation(artefactsRemis, productions, configCategories, methodeSelection, nombreARetenir, modeHybride, portfolioActif) {
    if (!portfolioActif) {
        return { artefactsSelectionnes: [], nombreARetenir, methodeSelection };
    }
    if (modeHybride) {
        // MODE HYBRIDE : N meilleures Sélection + toutes les Obligatoires
        const { nombreARetenir: nSelection } = configCategories.selection || { nombreARetenir: 4, ponderation: 65 };
        const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');
        const artefactsSelection = artefactsRemis.filter(a => {
            const prod = productionsNonPortfolio.find(p => p.id === a.id);
            return prod && prod.categorie === 'selection';
        });
        const artefactsObligatoires = artefactsRemis.filter(a => {
            const prod = productionsNonPortfolio.find(p => p.id === a.id);
            return prod && prod.categorie === 'obligatoire';
        });
        const meilleuresSelection = [...artefactsSelection]
            .sort((a, b) => (b.note || 0) - (a.note || 0))
            .slice(0, nSelection);
        return {
            artefactsSelectionnes: [...meilleuresSelection, ...artefactsObligatoires],
            nombreARetenir: nSelection,
            methodeSelection: 'hybride-categories'
        };
    }
    // Legacy switch sur la méthode de sélection
    switch (methodeSelection) {
        case 'meilleurs':
            return {
                artefactsSelectionnes: [...artefactsRemis]
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreARetenir),
                nombreARetenir, methodeSelection
            };
        case 'recents':
            return {
                artefactsSelectionnes: [...artefactsRemis]
                    .sort((a, b) => new Date(b.dateRemise || b.dateEvaluation || 0) - new Date(a.dateRemise || a.dateEvaluation || 0))
                    .slice(0, nombreARetenir),
                nombreARetenir, methodeSelection
            };
        case 'recents-meilleurs': {
            const nombreMeilleurs = Math.max(1, Math.ceil(artefactsRemis.length * 0.5));
            const topMeilleurs = [...artefactsRemis]
                .sort((a, b) => (b.note || 0) - (a.note || 0))
                .slice(0, nombreMeilleurs);
            return {
                artefactsSelectionnes: [...topMeilleurs]
                    .sort((a, b) => new Date(b.dateRemise || b.dateEvaluation || 0) - new Date(a.dateRemise || a.dateEvaluation || 0))
                    .slice(0, nombreARetenir),
                nombreARetenir, methodeSelection
            };
        }
        case 'tous':
            return { artefactsSelectionnes: artefactsRemis, nombreARetenir, methodeSelection };
        default:
            // Fallback meilleurs
            return {
                artefactsSelectionnes: [...artefactsRemis]
                    .sort((a, b) => (b.note || 0) - (a.note || 0))
                    .slice(0, nombreARetenir),
                nombreARetenir, methodeSelection
            };
    }
}

function _genererTexteMethodePerformanceMobilisation(performanceInsuffisante, portfolioActif, methodeSelection, nombreARetenir, configCategories, nbRemis, minimumCompletion) {
    if (performanceInsuffisante) {
        return `Minimum ${minimumCompletion} évaluations requises (${nbRemis}/${minimumCompletion} complétées)`;
    }
    if (!portfolioActif) {
        return 'Performance des productions indépendantes';
    }
    if (methodeSelection === 'hybride-categories') {
        const pondSel = configCategories?.selection?.ponderation || 65;
        const pondObl = configCategories?.obligatoires?.ponderation || 35;
        return `Performance du portfolio actuel (${nombreARetenir} meilleure${nombreARetenir > 1 ? 's' : ''} Sélection ${pondSel}% + Obligatoires ${pondObl}%)`;
    }
    const textesPerformance = {
        'meilleurs': `Performance du portfolio actuel (${nombreARetenir} ${accordTermeProduction('meilleur', nombreARetenir)}, maîtrise de standards)`,
        'recents': `Performance du portfolio actuel (${nombreARetenir} plus ${accordTermeProduction('recent', nombreARetenir)}, niveau terminal)`,
        'recents-meilleurs': `Performance du portfolio actuel (${nombreARetenir} ${accordTermeProduction('recent', nombreARetenir)} parmi les ${accordTermeProduction('meilleur', 2)}, hybride)`,
        'tous': `Performance du portfolio actuel (${accordTermeProduction('tous', 2)} les ${obtenirTermeProduction('pluriel')}, moyenne complète)`
    };
    return textesPerformance[methodeSelection] || textesPerformance['meilleurs'];
}

function _genererTitreArtefactsRetenusMobilisation(portfolioActif, methodeSelection, nbRetenus, nombreARetenir) {
    if (!portfolioActif) return 'Productions indépendantes';
    if (methodeSelection === 'hybride-categories') {
        return `${nbRetenus} ${obtenirTermeProduction(nbRetenus > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('retenu', nbRetenus)} (${nombreARetenir} meilleures Sélection + Obligatoires)`;
    }
    const textesTitres = {
        'meilleurs': `${nbRetenus} ${accordTermeProduction('meilleur', nbRetenus)} ${obtenirTermeProduction(nbRetenus > 1 ? 'pluriel' : 'singulier')}`,
        'recents': `${nbRetenus} plus ${accordTermeProduction('recent', nbRetenus)} ${obtenirTermeProduction(nbRetenus > 1 ? 'pluriel' : 'singulier')}`,
        'recents-meilleurs': `${nbRetenus} ${accordTermeProduction('recent', nbRetenus)} parmi les ${accordTermeProduction('meilleur', 2)}`,
        'tous': `${accordTermeProduction('tous', 2, true)} les ${obtenirTermeProduction('pluriel')} (${nbRetenus})`
    };
    return textesTitres[methodeSelection] || textesTitres['meilleurs'];
}

function _collecterBadgesJetonsMobilisation(evaluations, productions, da) {
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const productionsNonPortfolio = productions.filter(p => p.type !== 'portfolio');
    const badgesJetons = [];
    evaluationsEleve.forEach(evaluation => {
        let typeJeton = null;
        let badgeClass = '';
        let badgeNumeroClass = '';
        if (evaluation.jetonRepriseCibleeApplique === true) {
            typeJeton = 'Reprise ciblée';
            badgeClass = 'badge-jeton-reprise-ciblee-wrapper';
            badgeNumeroClass = 'badge-jeton-numero-reprise-ciblee';
        } else if (evaluation.jetonRepriseApplique === true) {
            typeJeton = 'Reprise';
            badgeClass = 'badge-jeton-reprise-wrapper';
            badgeNumeroClass = 'badge-jeton-numero-reprise';
        } else if (evaluation.jetonDelaiApplique === true) {
            typeJeton = 'Délai';
            badgeClass = 'badge-jeton-delai-wrapper';
            badgeNumeroClass = 'badge-jeton-numero-delai';
        }
        if (typeJeton) {
            const indexProduction = productionsNonPortfolio.findIndex(p => p.id === evaluation.productionId);
            if (indexProduction !== -1) {
                badgesJetons.push({
                    type: typeJeton,
                    badge: 'A' + (indexProduction + 1),
                    class: badgeClass,
                    numeroClass: badgeNumeroClass
                });
            }
        }
    });
    return badgesJetons;
}

function _genererBadgesJetonsHTML(evaluations, productions, da) {
    const badgesJetons = _collecterBadgesJetonsMobilisation(evaluations, productions, da);
    if (badgesJetons.length === 0) return '';
    const badgesHTML = badgesJetons.map(jeton =>
        '<span class="' + jeton.class + '">' +
            '<span class="badge-jeton-titre">' + jeton.type + '</span>' +
            '<span class="badge-jeton-numero ' + jeton.numeroClass + '">' + jeton.badge + '</span>' +
        '</span>'
    ).join('');
    return '<div class="u-flex-gap-8 u-mt-10">' + badgesHTML + '</div>';
}

function _genererBlocGestionJetons(statutJetons, evaluations, productions, da) {
    if (typeof obtenirStatutJetonsEtudiant !== 'function') return '';
    const totalJetonsUtilisesTousTypes = Object.values(statutJetons).reduce((sum, info) => sum + info.utilises, 0);
    const configBeta = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    const quotaGlobal = configBeta.configPAN?.jetons?.nombreParEleve || 2;  // Beta 95.7 : défaut 2
    return `
        <!-- Encadré pour le titre et la barre de progression globale -->
        <div class="profil-encadre-jetons">
            <div class="profil-encadre-jetons-header">
                <strong class="profil-encadre-jetons-titre">
                    Gestion des jetons
                </strong>
                <span class="profil-encadre-jetons-compteur">
                    ${totalJetonsUtilisesTousTypes} / ${quotaGlobal} utilisés
                </span>
            </div>
            <div class="profil-encadre-jetons-barre">
                <div class="profil-encadre-jetons-progression" style="width: ${(totalJetonsUtilisesTousTypes / quotaGlobal * 100)}%;"></div>
            </div>
        </div>

        <!-- Badges des jetons utilisés -->
        ${_genererBadgesJetonsHTML(evaluations, productions, da)}

        <hr class="profil-separateur">
    `;
}

function _genererBlocInterventionsRaIMobilisation(da) {
    if (typeof obtenirInterventionsEtudiant !== 'function') return '';
    const interventions = obtenirInterventionsEtudiant(da);
    const interventionsParticipees = interventions.filter(intervention => {
        return intervention.statut === 'completee' &&
               intervention.etudiants &&
               intervention.etudiants.includes(da);
    });
    if (interventionsParticipees.length === 0) return '';
    interventionsParticipees.sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
        <hr class="profil-separateur">
        <h4 class="profil-section-titre">
            ${interventionsParticipees.length} intervention${interventionsParticipees.length > 1 ? 's' : ''} RàI
        </h4>
        <div class="badges-centres u-mb-20">
            ${interventionsParticipees.map(intervention => {
                const date = new Date(intervention.date + 'T12:00:00');
                const options = { weekday: 'short', day: 'numeric', month: 'short' };
                const dateFormatee = date.toLocaleDateString('fr-CA', options);
                const duree = intervention.duree || 2;
                const typeLibelle = intervention.type === 'individuel' ? 'Individuel' : intervention.type === 'mio' ? 'MIO' : 'Groupe';
                return `
                    <span class="badge-intervention-vert" data-action="naviguerVersIntervention" data-param="${intervention.id}">
                        ${typeLibelle} ${dateFormatee}
                        <span class="badge-analyse-count">
                            ${duree} pér.
                        </span>
                    </span>
                `;
            }).join('')}
        </div>
    `;
}

function genererSectionMobilisationEngagement(da) {
    if (typeof obtenirPreference === 'function' && obtenirPreference('depistageAcp') === false) {
        return '';
    }
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100;
    const C = indices.C / 100;

    // Calcul dual pour mode comparatif (Beta 90 + correctif 7 déc 2025 :
    // vérifier === true pour éviter le mode comparatif par défaut)
    const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const { indicesSOM, indicesPAN } = _calculerIndicesMobilisation(da, config.pratique);

    // Récupérer les données pour les trois sections
    const detailsA = obtenirDetailsAssiduite(da);

    // 🆕 BETA 96.1: Utiliser directement les périodes (plus simple)
    const periodesPresentes = detailsA.periodesPresentes;
    const periodesOffertes = detailsA.periodesOffertes;

    const tauxA = periodesOffertes > 0
        ? (periodesPresentes / periodesOffertes * 100).toFixed(1)
        : 0;
    const interpA = interpreterAssiduite(parseFloat(tauxA));

    // Détecter si aucune donnée n'est saisie pour cet étudiant
    const aucuneDonneeAssiduite = periodesOffertes === 0;

    // Sources de données (respectent le mode actuel via obtenirDonneesSelonMode)
    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Construction de la liste des artefacts avec leur évaluation active
    const { artefacts, evaluationsEleve, artefactsPortfolio } = _construireListeArtefactsMobilisation(da, productions, evaluations);

    // 🆕 LIRE LA CONFIGURATION DE LA PRATIQUE DE NOTATION
    // Source de vérité : pratiquesConfigurables (Material Settings), fallback sur modalitesEvaluation
    const configPratiqueActive = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const modalites = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    const configPortfolio = configPratiqueActive?.portfolio || modalites.configPAN?.portfolio || {};
    const portfolioActif = configPortfolio.actif !== false;
    let nombreARetenir = configPortfolio.nombreARetenir || portfolio?.regles?.nombreARetenir || 3;
    const minimumCompletion = configPortfolio.minimumCompletion || modalites.configPAN?.portfolio?.minimumCompletion || 3;
    let methodeSelection = configPortfolio.methodeSelection || 'meilleurs';
    // Mapper les noms Material Settings → legacy : 'derniers' → 'recents'
    if (methodeSelection === 'derniers') methodeSelection = 'recents';

    // Détecter le mode Hybride (catégories Sélection/Obligatoires)
    const configCategories = configPratiqueActive?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybride = !!(configCategories && configCategories.actif);

    // Sélection des artefacts selon la modalité configurée (Hybride ou Legacy)
    const artefactsRemis = artefacts.filter(a => a.remis);
    const resultatSelection = _selectionnerArtefactsMobilisation(artefactsRemis, productions, configCategories, methodeSelection, nombreARetenir, modeHybride, portfolioActif);
    const artefactsSelectionnes = resultatSelection.artefactsSelectionnes;
    nombreARetenir = resultatSelection.nombreARetenir;
    methodeSelection = resultatSelection.methodeSelection;

    // Marquer les artefacts sélectionnés comme retenus
    const idsRetenus = new Set(artefactsSelectionnes.map(a => a.id));
    artefacts.forEach(art => {
        art.retenu = idsRetenus.has(art.id);
    });

    // Trier tous les artefacts : retenus d'abord, puis par note, puis remis/non remis
    artefacts.sort((a, b) => {
        // Critère 1: Retenus d'abord
        if (a.retenu && !b.retenu) return -1;
        if (!a.retenu && b.retenu) return 1;

        // Critère 2: Remis avant non remis
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;

        // Critère 3: Note décroissante pour les remis
        if (a.remis && b.remis) {
            return (b.note || 0) - (a.note || 0);
        }

        // Critère 4: Alphabétique pour les non remis
        return a.titre.localeCompare(b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const nbRetenus = artefacts.filter(a => a.retenu).length;
    const interpC = interpreterCompletion(indices.C);
    // artefactsRemis déjà déclaré à la ligne 710
    const artefactsNonRemis = artefacts.filter(a => !a.remis);

    // 🆕 BETA 95.6 : Détecter si aucune donnée de complétion/performance
    const aucuneDonneeCompletion = nbTotal === 0;
    const aucuneDonneePerformance = nbRetenus === 0;
    // P insuffisant : pas assez d'évaluations pour calculer une note fiable
    const performanceInsuffisante = portfolioActif && nbRemis < minimumCompletion && nbRemis > 0;

    // Détection globale "aucune donnée" pour section Engagement
    const aucuneDonnee = aucuneDonneeAssiduite && aucuneDonneeCompletion;

    // Comptabiliser les jetons utilisés et récupérer les informations des artefacts
    const evaluationsAvecJetonReprise = evaluationsEleve.filter(e => e.repriseDeId);
    const evaluationsAvecJetonDelai = evaluationsEleve.filter(e => e.jetonDelaiApplique && !e.remplaceeParId);

    const jetonsRepriseUtilises = evaluationsAvecJetonReprise.length;
    const jetonsDelaiUtilises = evaluationsAvecJetonDelai.length;
    const totalJetonsUtilises = jetonsRepriseUtilises + jetonsDelaiUtilises;

    // Récupérer le statut de tous les jetons (prédéfinis + personnalisés)
    const statutJetons = typeof obtenirStatutJetonsEtudiant === 'function'
        ? obtenirStatutJetonsEtudiant(da)
        : {};

    // Rang chronologique des productions (P1, P2...) basé sur la date d'échéance
    // Universel : indépendant de la pratique et du nommage des productions
    var _rangsProductions = {};
    (function() {
        var toutes = productions.filter(function(p) { return p.type !== 'portfolio'; });
        toutes.sort(function(a, b) { return (a.dateEcheance || '9999').localeCompare(b.dateEcheance || '9999'); });
        for (var i = 0; i < toutes.length; i++) {
            _rangsProductions[toutes[i].id] = i + 1;
        }
    })();

    function _rangProduction(production) {
        if (!production) return 0;
        return _rangsProductions[production.id] || 0;
    }

    // Créer les objets avec index pour les badges
    const jetonsDelaiAvecIndex = evaluationsAvecJetonDelai.map(e => {
        var prod = artefactsPortfolio.find(p => p.id === e.productionId);
        const indexOriginal = _rangProduction(prod);
        return {
            nom: e.productionNom || 'Artefact inconnu',
            index: indexOriginal > 0 ? `P${indexOriginal}` : '?'
        };
    });

    const jetonsRepriseAvecIndex = evaluationsAvecJetonReprise.map(e => {
        var prod = artefactsPortfolio.find(p => p.id === e.productionId);
        const indexOriginal = _rangProduction(prod);
        return {
            nom: e.productionNom || 'Artefact inconnu',
            index: indexOriginal > 0 ? `P${indexOriginal}` : '?'
        };
    });

    // Calculer la moyenne des 3 meilleurs pour affichage en P
    const artefactsRetenus = artefacts.filter(a => a.retenu);
    const moyenneP = artefactsRetenus.length > 0
        ? Math.round(artefactsRetenus.reduce((sum, a) => sum + (a.note || 0), 0) / artefactsRetenus.length)
        : 0;
    const interpP = interpreterPerformance(moyenneP);

    return `
        <!-- Détails des calculs (masqué par défaut) -->
        <div id="details-calculs-mobilisation-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Assiduité (A) :</strong> Indice A = ${indices.A}% — ${periodesPresentes} périodes présentes / ${periodesOffertes} périodes offertes
            <br><br>
            <strong>Complétion (C) :</strong> Indice C = ${indices.C}% — ${nbRemis} ${obtenirTermeProduction('pluriel')} ${accordTermeProduction('remis', nbRemis)} / ${nbTotal} ${obtenirTermeProduction('pluriel')} ${accordTermeProduction('total', nbTotal)}
            <br><br>
            <strong>Performance (P) :</strong> Indice P = ${moyenneP}% — Moyenne des ${nbRetenus} ${accordTermeProduction('meilleur', nbRetenus)} ${obtenirTermeProduction('pluriel')}
        </div>

        <!-- GRILLE 3 COLONNES : ASSIDUITÉ, COMPLÉTION ET PERFORMANCE -->
        <div class="profil-grid-3col">

            <!-- FICHE ASSIDUITÉ -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Assiduité</h3>
                    ${genererValeursComparatives(indicesSOM.A, indicesPAN.A, aucuneDonneeAssiduite)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• Périodes présentes :</strong> ${periodesPresentes} / ${periodesOffertes}</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Liste des absences et retards -->
                <h4 class="profil-section-titre">
                    ${detailsA.absences.length} absence${detailsA.absences.length > 1 ? 's' : ''} ou retard${detailsA.absences.length > 1 ? 's' : ''}
                </h4>
                ${detailsA.absences.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${detailsA.absences.map(abs => {
                            const date = new Date(abs.date + 'T12:00:00');
                            const options = { weekday: 'short', day: 'numeric', month: 'short' };
                            const dateFormatee = date.toLocaleDateString('fr-CA', options);
                            const estAbsenceComplete = abs.periodesPresence === 0;
                            const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                            return `
                                <div class="badge-absence ${classeBadge}"
                                     data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
                                    <span class="badge-absence-date">
                                        ${dateFormatee}
                                    </span>
                                    <span class="badge-absence-heures">
                                        ${estAbsenceComplete
                                            ? `${abs.periodesManquees} pér.`
                                            : `${abs.periodesPresence} pér.`
                                        }
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="${aucuneDonneeAssiduite ? 'profil-message-vide' : 'profil-message-tous-remis'}">
                        ${aucuneDonneeAssiduite ? 'En attente de données' : 'Assiduité parfaite !'}
                    </div>
                `}

                <!-- Interventions RàI -->
                ${_genererBlocInterventionsRaIMobilisation(da)}
            </div>

            <!-- FICHE COMPLÉTION -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Complétion</h3>
                    ${genererValeursComparatives(indicesSOM.C, indicesPAN.C, aucuneDonneeCompletion)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• ${obtenirTermeProduction('pluriel', true)} ${accordTermeProduction('remis', 2)} :</strong> ${nbRemis}/${nbTotal}</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Artefacts remis (format badge comme Assiduité) -->
                <h4 class="profil-section-titre">
                    ${artefactsRemis.length} ${obtenirTermeProduction(artefactsRemis.length > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('remis', artefactsRemis.length)}
                </h4>
                ${artefactsRemis.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsRemis
                            .map(art => {
                                // Numéro d'artefact depuis le titre (pas la position)
                                const indexOriginal = _rangProduction(artefactsPortfolio.find(p => p.id === art.id));
                                return { ...art, indexOriginal };
                            })
                            .sort((a, b) => a.indexOriginal - b.indexOriginal) // Trier par numéro croissant
                            .map(art => `
                                <span class="badge-completion-remis"
                                      data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}">
                                    <span class="badge-completion-titre">
                                        ${echapperHtml(art.description)}
                                    </span>
                                    <span class="badge-completion-numero">
                                        P${art.indexOriginal}
                                    </span>
                                </span>
                            `).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide u-mb-15">
                        ${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('remis', 1)}
                    </div>
                `}

                <!-- Artefacts non remis ou non recevables (format badge comme Assiduité) -->
                <h4 class="profil-section-titre">
                    ${artefactsNonRemis.length} ${obtenirTermeProduction(artefactsNonRemis.length > 1 ? 'pluriel' : 'singulier')} non ${accordTermeProduction('remis', artefactsNonRemis.length)} ou non ${accordTermeProduction('recevable', artefactsNonRemis.length)}
                </h4>
                ${artefactsNonRemis.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsNonRemis
                            .map(art => {
                                // Numéro d'artefact depuis le titre (pas la position)
                                const indexOriginal = _rangProduction(artefactsPortfolio.find(p => p.id === art.id));
                                return { ...art, indexOriginal };
                            })
                            .sort((a, b) => a.indexOriginal - b.indexOriginal) // Trier par numéro croissant
                            .map(art => `
                                <span class="${art.estNonRecevable ? 'badge-completion-non-recevable' : 'badge-completion-non-remis'}"
                                      data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}"
                                      title="${art.estNonRecevable ? (art.statutIntegrite === 'plagiat' ? 'Plagiat détecté' : 'Utilisation IA non autorisée') : 'Non remis'}">
                                    <span class="badge-completion-titre">
                                        ${echapperHtml(art.description)}
                                    </span>
                                    <span class="badge-completion-numero">
                                        ${art.estNonRecevable ? '<img src="icons/icons8-high-priority.svg" alt="" class="alerte-icone">' : ''}P${art.indexOriginal}
                                    </span>
                                </span>
                            `).join('')}
                    </div>
                ` : `
                    <div class="${aucuneDonneeCompletion ? 'profil-message-vide' : 'profil-message-tous-remis'}">
                        ${aucuneDonneeCompletion ? 'En attente de données' : `${accordTermeProduction('tous', 2, true)} les ${obtenirTermeProduction('pluriel')} ${accordTermeProduction('remis', 2)} !`}
                    </div>
                `}
            </div>

            <!-- FICHE PERFORMANCE -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Performance</h3>
                    ${performanceInsuffisante
                        ? '<span class="profil-valeur-grande" style="color: var(--gris-moyen);">—</span>'
                        : genererValeursComparatives(indicesSOM.P, indicesPAN.P, aucuneDonneePerformance)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• ${_genererTexteMethodePerformanceMobilisation(performanceInsuffisante, portfolioActif, methodeSelection, nombreARetenir, configCategories, nbRemis, minimumCompletion)}</strong></li>
                </ul>

                <hr class="profil-separateur">

                <!-- Gestion des jetons (prédéfinis + personnalisés) -->
                ${_genererBlocGestionJetons(statutJetons, evaluations, productions, da)}

                <!-- Artefacts sélectionnés avec notes (badges colorés avec checkboxes) -->
                <h4 class="profil-section-titre">
                    ${_genererTitreArtefactsRetenusMobilisation(portfolioActif, methodeSelection, nbRetenus, nombreARetenir)}
                </h4>
                ${artefactsRetenus.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsRetenus.map(art => {
                            // Numéro d'artefact depuis le titre (pas la position)
                            const indexOriginal = _rangProduction(artefactsPortfolio.find(p => p.id === art.id));

                            // Récupérer les couleurs depuis l'échelle configurée
                            const echelles = db.getSync('echellesTemplates', []);
                            const echelleActive = echelles.find(e => e.active) || echelles[0];

                            // Déterminer la couleur selon la note
                            let couleurBadge = '#999'; // Gris par défaut
                            if (art.note !== null && echelleActive?.niveaux) {
                                const niveau = echelleActive.niveaux.find(n => art.note >= n.min && art.note <= n.max);
                                couleurBadge = niveau?.couleur || '#999';
                            } else if (art.note !== null) {
                                // Couleurs par défaut IDME
                                if (art.note >= 85) couleurBadge = '#2196F3'; // Bleu
                                else if (art.note >= 75) couleurBadge = '#28a745'; // Vert
                                else if (art.note >= 65) couleurBadge = '#ffc107'; // Jaune
                                else couleurBadge = '#ff9800'; // Orange
                            }

                            const opacite = art.retenu ? '1' : '0.6';
                            const bordure = art.retenu ? '3px' : '2px';

                            return `
                                <div class="badge-artefact"
                                     style="background: ${couleurBadge}22; border-color: ${couleurBadge}; opacity: ${opacite}; border-width: ${bordure}; cursor: pointer;"
                                     class="hover-opaque"
                                     data-action="evaluerProduction" data-param="${da}" data-param2="${art.id}"
                                     title="${echapperHtml(art.description)}">
                                    <span class="badge-artefact-titre" style="color: ${couleurBadge};">
                                        P${indexOriginal}
                                    </span>
                                    ${art.jetonReprise ? '<span class="profil-texte-petit" title="Jeton de reprise appliqué">⭐</span>' : ''}
                                    ${art.jetonDelai ? '<span class="profil-texte-petit" title="Jeton de délai appliqué">⭐</span>' : ''}
                                    <span class="badge-artefact-note" style="background: ${couleurBadge};">
                                        ${art.niveau || '—'}
                                    </span>
                                    <span class="u-texte-petit u-texte-gris" style="font-weight: 500;">
                                        (${art.note})
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide u-mb-15">
                        ${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}
                    </div>
                `}
            </div>
        </div>

    `;
}

/**
 * Génère le HTML de la section Accompagnement (interventions RàI)
 * Inclut: badge RàI, risque, pattern, progression, services, échelle, historique
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionAccompagnement(da) {
    // Récupérer toutes les interventions où cet étudiant était présent
    const interventions = obtenirInterventionsEtudiant(da);

    // Récupérer les infos de l'étudiant pour affichage
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === da);
    const nomComplet = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `DA ${da}`;

    // Récupérer les données pour le suivi (conservé pour forces/défis)
    const indices = calculerTousLesIndices(da);

    // 🆕 BETA 95.6 : Détecter si aucune donnée n'est saisie pour cet étudiant
    const aucuneDonnee = indices.A === 0 && indices.C === 0 && indices.P === 0;

    if (aucuneDonnee) {
        // Retourner un HTML simplifié pour l'état "en attente de données"
        return `
            <!-- Détails de la section (masqué par défaut) -->
            <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle carte-info-note u-hide">
                <strong>À propos de cette section</strong>
                <br><br>
                <strong>Objectif :</strong> Cette section centralise les indicateurs de suivi et l'historique complet des interventions RàI (Réponse à l'Intervention). Elle permet d'orienter les décisions d'accompagnement pédagogique et de documenter les observations spécifiques.
            </div>

            <div class="profil-grid-3col">
                <!-- Carte 1 : Contexte d'apprentissage (gauche) -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-contexte">Contexte d'apprentissage</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Le contexte sera analysé après la saisie des premières données.</p>
                </div>

                <!-- Carte 2 : Observation SOLO (centre) -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">L'analyse SOLO sera disponible après les premières évaluations.</p>
                </div>

                <!-- Carte 3 : Modèle de la Réponse à l'intervention (RàI) (droite) -->
                <div class="profil-carte">
                    <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-rai">Modèle de la Réponse à l'intervention (RàI)</h2>
                    <div class="profil-message-vide" style="margin: 20px 0;">
                        En attente de données
                    </div>
                    <p class="profil-texte-petit-gris">Les indicateurs RàI seront disponibles après la saisie des premières données.</p>
                </div>
            </div>
        `;
    }

    // 🆕 NOUVEAU : Utiliser les fonctions séparées pour RàI pédagogique et contexte
    const niveauRai = determinerNiveauRaiPedagogique(da);
    const alerteContexte = determinerAlerteContextuelle(da);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true); // true = dépistage (3 artefacts)
    const cibleInfo = determinerCibleIntervention(da); // Conservé pour compatibilité (sera retiré plus tard)
    const progression = calculerProgressionEleve(da);
    const defiSpecifique = identifierDefiSpecifique(da);
    const directionRisque = calculerDirectionRisque(da);
    const directionsCriteres = calculerDirectionsCriteres(da);

    // Compter le nombre total d'artefacts évalués (pour afficher la fiabilité des données)
    const evaluationsDA = (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).filter(e => e.etudiantDA === da && e.noteFinale != null);
    const nbTotalArtefacts = evaluationsDA.length;

    // Construire le texte de progression au format du rapport (basé sur les critères)
    let texteProgression = '';
    if (progression.direction === '↗') {
        texteProgression = `Apprentissage : présentement en amélioration (${progression.nbAmelioration}/${progression.nbCriteres} critères en progression)`;
    } else if (progression.direction === '↘') {
        texteProgression = `Apprentissage : présentement en baisse (${progression.nbBaisse}/${progression.nbCriteres} critères en régression)`;
    } else if (progression.direction === '—') {
        texteProgression = `Apprentissage : présentement en plateau (évolution stable sur ${progression.nbCriteres} critères)`;
    } else {
        texteProgression = `Apprentissage : ${progression.interpretation}`;
    }

    // Analyser les forces et défis (critères de la grille de référence)
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');

    // ✅ Utiliser la fonction dynamique au lieu du tableau SRPNF codé en dur
    const criteres = obtenirCriteresAvecValeurs(da);

    // CORRECTION: Inclure TOUS les niveaux IDME (I, D, M, E)
    // Forces: M (>=75%) et E (>=85%)
    const forces = criteres.filter(c => c.valeur >= seuilMaitrise);
    // Défis: I (<65%) ET D (65-75%)
    const defis = criteres.filter(c => c.valeur > 0 && c.valeur < seuilMaitrise);


    // Badge RàI avec classes CSS
    let badgeClasse = '';
    let badgeLabel = '';
    if (cibleInfo.niveau === 3) {
        badgeClasse = 'badge-sys badge-rai-3';
        badgeLabel = 'Niveau 3';
    } else if (cibleInfo.niveau === 2) {
        badgeClasse = 'badge-sys badge-rai-2';
        badgeLabel = 'Niveau 2';
    } else {
        badgeClasse = 'badge-sys badge-rai-1';
        badgeLabel = 'Niveau 1';
    }

    // Construire le texte du pattern avec le défi intégré si applicable
    const interpreterScoreIDME = (score) => {
        const seuilInsuffisant = obtenirSeuil('idme.insuffisant');
        const seuilDeveloppement = obtenirSeuil('idme.developpement');
        const seuilMaitrise = obtenirSeuil('idme.maitrise');
        if (score < seuilInsuffisant) return 'Un seul aspect traité, compréhension superficielle';
        if (score < seuilDeveloppement) return 'Plusieurs aspects sans vision d\'ensemble';
        if (score < seuilMaitrise) return 'Vision globale avec liens entre les aspects';
        return 'Transfert à d\'autres contextes';
    };

    let patternTexte = cibleInfo.pattern;
    if (cibleInfo.pattern === 'Défi spécifique' && defiSpecifique.defi !== 'Aucun') {
        const niveauIDME = interpreterScoreIDME(defiSpecifique.score);
        patternTexte = `${cibleInfo.pattern} (${defiSpecifique.defi} - ${niveauIDME})`;
    }

    let html = `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>À propos de cette section</strong>
            <br><br>
            <strong>Objectif :</strong> Cette section centralise les indicateurs de suivi et l'historique complet des interventions RàI (Réponse à l'Intervention). Elle permet d'orienter les décisions d'accompagnement pédagogique et de documenter les observations spécifiques.
            <br><br>
            <strong>Contenu :</strong> Niveau d'intervention RàI recommandé (1, 2 ou 3) • Indicateurs de risque, pattern d'apprentissage et progression • Services adaptés (SA, CAF) pour contextualiser l'accompagnement • Échelle visuelle de positionnement du risque • Liste chronologique des interventions documentées
            <br><br>
            <strong>Utilisation :</strong> Planifier intervention (base-toi sur le niveau RàI et les indicateurs affichés) • Nouvelle intervention (clique sur «Nouvelle intervention») • Consulter historique (clique sur «Consulter» pour voir les détails complets) • Notes individuelles (visibles directement sous chaque intervention)
        </div>

        <!-- 🆕 NOUVEAU : Trois cartes côte à côte (RàI pédagogique + Contexte + Observation SOLO) -->
        <div class="${(() => {
            const afficherSOLO = obtenirPreference('afficherDescriptionsSOLO') !== false;
            return afficherSOLO ? 'profil-grid-3col' : 'profil-grid-2col';
        })()}">
            <!-- Carte RàI : positionnée à droite via order (26 mai PM2) -->
            <div class="profil-carte" style="order: 3">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-rai">Modèle de la Réponse à l'intervention (RàI)</h2>

                <div class="badge-sys ${niveauRai.badgeClasse}">
                    ${niveauRai.label}
                </div>

                <p class="profil-texte-paragraphe">
                    <strong>Performance globale (P) :</strong> ${(() => {
                        const pct = indices.P;
                        const niveau = pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I';

                        // Obtenir la configuration pour afficher le nombre d'artefacts retenus
                        const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
                        // Session A-2 : id canonique normalisé à la lecture, défaut = PRATIQUE_DEFAUT ('standards').
                        const pratique = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(config.pratique) : config.pratique) || (window.PRATIQUE_DEFAUT || 'standards');

                        let noteExplicative = '';
                        if (pratique === 'standards') {
                            const nombreARetenir = config.nombreARetenir || 3;
                            const methodeSelection = config.methodeSelectionArtefacts || 'meilleurs';
                            const methodeTexte = methodeSelection === 'meilleurs' ? 'meilleurs' :
                                               methodeSelection === 'recents' ? 'plus récents' :
                                               methodeSelection === 'recents-meilleurs' ? 'meilleurs récents' : 'tous';
                            noteExplicative = `<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">Calculée sur les ${nombreARetenir} ${methodeTexte} artefacts</span>`;
                        } else {
                            noteExplicative = `<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">Calculée sur toutes les évaluations</span>`;
                        }

                        const termeArtefact = nbTotalArtefacts > 1 ? obtenirTermeProduction('pluriel') : obtenirTermeProduction('singulier');
                        return `${niveau} ${pct.toFixed(0)}% <span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal;">(sur ${nbTotalArtefacts} ${termeArtefact})</span>${noteExplicative}`;
                    })()}
                </p>

                <p class="profil-texte-paragraphe" style="margin-top: 12px;"><strong>Progression par critère :</strong> <span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal;">(moyennes sur ${accordTermeProduction('tous', 2)} les ${obtenirTermeProduction('pluriel')})</span></p>
                <ul style="margin-left: 20px; color: var(--gris-fonce); font-size: 0.9rem;">
                    ${criteres.map(c => {
                        const pct = c.valeur * 100;
                        const niveau = pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I';
                        let cleDir = c.cleNormalisee;
                        if (cleDir.startsWith('francais')) cleDir = 'francais';
                        const dir = directionsCriteres ? directionsCriteres[cleDir] : null;
                        const symbDir = dir && dir.symbole ? ' ' + dir.symbole : '';
                        return `<li>${echapperHtml(c.nom)} : ${niveau} ${pct.toFixed(0)}%${symbDir}</li>`;
                    }).join('')}
                </ul>

                <div class="profil-separateur-section"></div>

                <div class="badge-sys ${niveauRai.patternBadge}">
                    ${niveauRai.pattern}
                </div>

                <p class="profil-texte-detail">${niveauRai.description}</p>
                ${niveauRai.defi !== 'Aucun' ? `<p class="u-texte-09 u-texte-gris" style="margin-top: 8px;"><strong>Défi principal :</strong> ${niveauRai.defi}</p>` : ''}

                ${(() => {
                    // Indicateur de mobilisation dans la carte RàI
                    // Visible quand A ou C est sous le seuil de mobilisation favorable (75%)
                    if (alerteContexte.niveau === 'attente') return '';
                    const alertes = [];
                    const aVal = parseFloat(alerteContexte.A);
                    const cVal = parseFloat(alerteContexte.C);
                    if (!isNaN(aVal) && aVal < 75) alertes.push('Assiduité ' + alerteContexte.A);
                    if (!isNaN(cVal) && cVal < 75) alertes.push('Complétion ' + alerteContexte.C);
                    if (alertes.length === 0) return '';
                    return '<div style="margin-top: 12px; padding: 8px 12px; background: var(--alerte-fond-attention, rgba(232,168,56,0.08)); border-left: 3px solid var(--orange-attention, #e8a838); border-radius: 0 4px 4px 0; font-size: 0.85rem; color: var(--orange-attention, #e8a838);">' +
                        '<strong>Mobilisation :</strong> ' + alertes.join(' · ') +
                        '</div>';
                })()}
            </div>

            <!-- Carte Contexte d'apprentissage : positionnée à gauche via order (26 mai PM2) -->
            <div class="profil-carte" style="order: 1">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-contexte">Contexte d'apprentissage</h2>

                <div class="badge-sys ${alerteContexte.badgeClasse}">
                    ${alerteContexte.label}
                </div>

                <p class="profil-texte-paragraphe">
                    <strong>Assiduité (A) :</strong> ${alerteContexte.A}
                </p>

                <p class="profil-texte-paragraphe">
                    <strong>Complétion (C) :</strong> ${alerteContexte.C}
                </p>

                <div class="profil-separateur-section"></div>

                <p style="font-size: 0.9rem; color: ${alerteContexte.niveau === 'tres-favorable' || alerteContexte.niveau === 'favorable' ? '#16a34a' : alerteContexte.niveau === 'modere' ? '#ca8a04' : '#ea580c'}; font-weight: 600; margin-bottom: 8px;">
                    ${alerteContexte.description}
                </p>

                <p class="u-texte-09 u-texte-gris" style="line-height: 1.5;">
                    ${alerteContexte.recommandation}
                </p>

                <div class="profil-separateur-section"></div>

                <p class="profil-texte-detail-compact">
                    <strong>Services adaptés :</strong> ${etudiant.caf === 'Oui' ? 'CAF' : ''}${etudiant.caf === 'Oui' && etudiant.sa === 'Oui' ? ', ' : ''}${etudiant.sa === 'Oui' ? 'SA' : ''} ${etudiant.caf !== 'Oui' && etudiant.sa !== 'Oui' ? 'Aucun' : ''}
                </p>

                <button data-action="ouvrirModalConfidentiel" data-param="${da}" class="btn btn-secondaire" style="margin-top: 12px; font-size: 0.85rem;" data-tooltip="profil-confidentiel">
                    <img src="icons/icon-lock.svg" alt="" class="btn-inline-icon"> Confidentiel ${aDesInfosConfidentielles(da) ? '<span style="color: var(--vert-principal);">\u25CF</span>' : ''}
                </button>
            </div>

            <!-- Carte 3 : Observation de la structure des résultats d'apprentissage (SOLO) - Optionnelle -->
            ${(() => {
                const afficherSOLO = obtenirPreference('afficherDescriptionsSOLO') !== false;

                if (!afficherSOLO) {
                    return ''; // Ne rien afficher si désactivé
                }

                // Filtrer "Français" des forces et défis (critère linguistique, pas cognitif SOLO)
                const forcesSolo = forces.filter(f => f.nom !== 'Français');
                const defisSolo = defis.filter(d => d.nom !== 'Français');

                // Vérifier s'il y a des forces ou défis à afficher (hors Français)
                if (forcesSolo.length === 0 && defisSolo.length === 0) {
                    return `
            <!-- Carte SOLO : positionnée au centre via order (26 mai PM2) -->
            <div class="profil-carte" style="order: 2">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>
                <p class="profil-texte-italique-gris">
                    Aucune force ni défi identifié selon la taxonomie SOLO.
                </p>
                <div class="profil-separateur-section"></div>
                <p class="profil-texte-mini-gris">
                    Basé sur les travaux de Biggs & Collis (taxonomie SOLO)
                </p>
            </div>
                    `;
                }

                return `
            <!-- Carte SOLO : positionnée au centre via order (26 mai PM2) -->
            <div class="profil-carte" style="order: 2">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>

                ${(() => {
                    // Obtenir les couleurs IDME depuis l'échelle configurée
                    const couleurE = obtenirCouleurNiveauIDME('E');
                    const couleurM = obtenirCouleurNiveauIDME('M');
                    const couleurD = obtenirCouleurNiveauIDME('D');
                    const couleurI = obtenirCouleurNiveauIDME('I');

                    let html = '';

                    // FORCES E (Étendu) - Bleu
                    if (forcesSolo.some(f => f.valeur >= 0.85)) {
                        html += `
                <div style="margin-bottom: 12px;">
                    <h4 style="color: ${couleurE}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Forces exceptionnelles
                    </h4>
                    <div style="background: ${couleurE}22; border-left: 4px solid ${couleurE}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurE};">
                            ${forcesSolo.filter(f => f.valeur >= 0.85).map(f => f.nom).join(', ')} : Maîtrisé et étendu (E)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau abstrait étendu, l'étudiant·e a la capacité de généraliser la structure au-delà de l'information donnée. Il/elle comprend et il/elle est capable de transférer ses apprentissages à des contextes proches.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // FORCES M (Maîtrisé) - Vert
                    if (forcesSolo.some(f => f.valeur >= seuilMaitrise && f.valeur < 0.85)) {
                        html += `
                <div style="margin-bottom: ${defisSolo.length > 0 ? '20px' : '0'};">
                    <h4 style="color: ${couleurM}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Forces identifiées
                    </h4>
                    <div style="background: ${couleurM}22; border-left: 4px solid ${couleurM}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurM};">
                            ${forcesSolo.filter(f => f.valeur >= seuilMaitrise && f.valeur < 0.85).map(f => f.nom).join(', ')} : Maîtrisé (M)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau relationnel, l'étudiant·e peut comprendre, lier et intégrer plusieurs aspects d'une réponse dans un tout cohérent. Il/elle voit plusieurs aspects d'une situation et sait l'aborder de différentes façons.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // DÉFIS D (Développement) - Orange
                    if (defisSolo.some(d => d.valeur >= obtenirSeuil('idme.insuffisant') && d.valeur < seuilDeveloppement)) {
                        html += `
                <div style="margin-bottom: 12px;">
                    <h4 style="color: ${couleurD}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Défis en développement
                    </h4>
                    <div style="background: ${couleurD}22; border-left: 4px solid ${couleurD}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurD};">
                            ${defisSolo.filter(d => d.valeur >= obtenirSeuil('idme.insuffisant') && d.valeur < seuilDeveloppement).map(d => d.nom).join(', ')} : En développement (D)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau multistructurel, l'étudiant·e peut se concentrer sur plusieurs points pertinents à la fois. Cependant, il/elle les considère indépendamment.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    // DÉFIS I (Incomplet) - Rouge
                    if (defisSolo.some(d => d.valeur < obtenirSeuil('idme.insuffisant'))) {
                        html += `
                <div>
                    <h4 style="color: ${couleurI}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        Défis critiques
                    </h4>
                    <div style="background: ${couleurI}22; border-left: 4px solid ${couleurI}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleurI};">
                            ${defisSolo.filter(d => d.valeur < obtenirSeuil('idme.insuffisant')).map(d => d.nom).join(', ')} : Incomplet (I)
                        </div>
                        <div class="profil-texte-explicatif">
                            À ce niveau unistructurel, l'étudiant·e ne traite que d'un seul aspect du savoir ou d'un savoir-faire à la fois. L'étudiant·e n'a pas encore de réelle compréhension.
                        </div>
                    </div>
                </div>
                        `;
                    }

                    return html;
                })()}

                <div class="profil-separateur-section"></div>
                <p class="profil-texte-mini-gris">
                    Basé sur les travaux de Biggs & Collis (taxonomie SOLO)
                </p>
            </div>
                `;
            })()}
        </div>

        <!-- Bloc Consolidation déplacé vers l'onglet « Forces et défis » de « Développement des habiletés » (17 avril 2026) -->

        <!-- Historique compact -->
        <div class="u-mt-15">
            <div class="u-flex-between-mb10">
                <h4 style="color: var(--accent-primaire); font-size: 0.95rem; margin: 0; font-weight: 600;" data-tooltip="profil-historique">
                    HISTORIQUE ${interventions && interventions.length > 0 ? `(${interventions.length} intervention${interventions.length > 1 ? 's' : ''})` : ''}
                </h4>
                <button class="btn btn-principal" data-action="naviguerVersNouvelleIntervention" data-param="${da}">+ Nouvelle intervention</button>
            </div>
        </div>
    `;

    if (!interventions || interventions.length === 0) {
        html += `
            <div class="carte profil-zone-centre-fond-bleu">
                <div class="u-texte-gris" style="font-size: 0.95rem; font-style: italic;">
                    Aucune intervention documentée. Les interventions RàI apparaîtront ici.
                </div>
            </div>
        `;
        return html;
    }

    // Trier les interventions par date (plus récente en premier)
    const interventionsTriees = [...interventions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // Conteneur timeline
    html += `<div class="carte u-mb-20" style="padding: 0;">`;

    // Afficher chaque intervention en format timeline compact (une seule ligne)
    interventionsTriees.forEach(intervention => {
        const date = new Date(intervention.date + 'T12:00:00');
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateFormatee = date.toLocaleDateString('fr-CA', options);
        const duree = intervention.duree || 2;
        const typeLibelle = intervention.type === 'individuel' ? 'Individuel' : intervention.type === 'mio' ? 'MIO' : 'Groupe';
        const noteIndividuelle = intervention.notesIndividuelles?.[da] || '';
        const niveauRai = intervention.niveauRai || 3;

        // Déterminer le texte du badge (titre ou niveau)
        let badgeTexte = '';
        if (intervention.titre) {
            badgeTexte = intervention.titre;
        } else {
            badgeTexte = niveauRai === 1 ? 'Rattrapage (1)' : niveauRai === 2 ? 'Rattrapage (2)' : 'Intervention niveau 3';
        }

        html += `
            <div class="intervention-timeline-item">
                <div class="u-flex-gap-12 u-align-center" style="flex: 1;">
                    <span class="badge-intervention-vert">
                        ${typeLibelle} · ${badgeTexte}
                    </span>
                    <span class="u-texte-bleu" style="font-weight: 600; font-size: 0.9rem;">
                        ${dateFormatee}
                    </span>
                    ${noteIndividuelle ? `
                        <span class="u-texte-gris u-texte-09" style="flex: 1;">
                            ${noteIndividuelle}
                        </span>
                    ` : ''}
                </div>
                <div class="intervention-timeline-actions">
                    <button class="btn btn-secondaire" data-action="naviguerVersIntervention" data-param="${intervention.id}">
                        Consulter
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    return html;
}

/**
 * Génère le HTML de la section Mobilisation (M) détaillée
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionMobilisation(da) {
    const indices = calculerTousLesIndices(da);

    // Récupérer A et C séparément (en proportions 0-1)
    const A = indices.A / 100;
    const C = indices.C / 100;

    // Interpréter selon A et C (pas la moyenne M)
    const interpM = interpreterMobilisation(A, C);

    return `
        <!-- STATISTIQUES -->
        <div class="profil-grid-indicateurs">
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Assiduité (A)</span>
                    <strong class="profil-indicateur-valeur">${indices.A}%</strong>
                </div>
            </div>
            <div class="profil-indicateur">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Complétion (C)</span>
                    <strong class="profil-indicateur-valeur">${indices.C}%</strong>
                </div>
            </div>
            <div class="profil-indicateur profil-indicateur-accent-gauche" style="color: ${interpM.couleur};">
                <div class="profil-indicateur-contenu">
                    <span class="profil-indicateur-label">Mobilisation (M)</span>
                    <strong class="profil-indicateur-valeur">${indices.M}</strong>
                </div>
            </div>
        </div>

        <!-- INTERPRÉTATION QUALITATIVE -->
        <div class="profil-interpretation" style="background: linear-gradient(to right, ${interpM.couleur}22, ${interpM.couleur}11); border-left-color: ${interpM.couleur};">
            <div class="profil-interpretation-titre" style="color: ${interpM.couleur};">
                <span class="pastille-rai" style="background:${interpM.couleur}"></span> ${interpM.niveau}
            </div>
            <div class="profil-interpretation-texte">
                ${interpM.niveau === 'Décrochage' ?
                    "L'étudiant ne se présente plus au cours. Les interventions pédagogiques ne sont plus possibles. Référer aux services d'aide et à l'API." :
                  interpM.niveau === 'Assiduité ET complétion critiques' ?
                    "Situation critique : présence ET remise des travaux sous 70%. Intervention RàI niveau 3 immédiate requise." :
                  interpM.niveau === 'Assiduité critique' ?
                    "Assiduité critique (< 70%). La présence irrégulière compromet l'apprentissage. Intervention prioritaire sur l'engagement comportemental." :
                  interpM.niveau === 'Complétion critique' ?
                    "Complétion critique (< 70%). Les travaux ne sont pas remis. Investigation des obstacles organisationnels ou motivationnels nécessaire." :
                  interpM.niveau === 'Mobilisation fragile' ?
                    "Les deux composantes (A et C) sont entre 70-80%. Soutien proactif recommandé pour stabiliser l'engagement." :
                  interpM.niveau === 'Assiduité fragile' ?
                    "L'assiduité est entre 70-80% alors que la complétion est satisfaisante. Renforcer la présence en classe." :
                  interpM.niveau === 'Complétion fragile' ?
                    "La complétion est entre 70-80% alors que l'assiduité est satisfaisante. Soutenir l'organisation et la planification." :
                  interpM.niveau === 'Favorable' ?
                    "Excellent engagement comportemental. Assiduité et complétion ≥ 90%. Maintenir cette dynamique positive." :
                    "Engagement comportemental satisfaisant. Assiduité et complétion ≥ 80%. Continuer la surveillance de niveau 1."}
            </div>
        </div>

        <!-- DÉCOMPOSITION VISUELLE -->
        <h4 class="profil-titre-bleu-compact">
            Décomposition de l'indice M
        </h4>
        <div class="profil-carte-simple">
            <div class="profil-texte-mono-centre-bleu" style="font-size: 1.1rem;">
                M = (A + C) / 2 = (${indices.A}% + ${indices.C}%) / 2 = ${indices.M}
            </div>
        </div>

        <!-- RECOMMANDATIONS SELON LE NIVEAU -->
        ${interpM.niveau === 'Décrochage' ? `
            <div style="background: var(--gris-tres-pale); border-left: 4px solid var(--gris-clair); padding: 15px;">
                <h4 style="color: var(--gris-fonce); margin-bottom: 10px;">Actions requises</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--gris-fonce); line-height: 1.6;">
                    <li>Contact immédiat avec l'aide pédagogique individuelle (API)</li>
                    <li>Tentative de contact direct (téléphone, courriel)</li>
                    <li>Référence aux services d'aide psychosociale si pertinent</li>
                    <li>Documentation du dossier étudiant</li>
                </ul>
            </div>
        ` : (A < 0.7 || C < 0.7) ? `
            <div style="background: ${A < 0.7 && C < 0.7 ? 'rgba(232,64,87,0.12)' : 'rgba(200,160,96,0.12)'};
                        border-left: 4px solid ${A < 0.7 && C < 0.7 ? '#e84057' : '#c8a060'};
                        padding: 15px; border-radius: 6px;">
                <h4 style="color: ${A < 0.7 && C < 0.7 ? '#f06878' : '#d4b878'}; margin-bottom: 10px;">
                    Recommandations d'intervention (niveau critique)
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${A < 0.7 && C < 0.7 ? '#f06878' : '#d4b878'}; line-height: 1.6;">
                    ${A < 0.7 && C < 0.7 ?
                        '<li><strong>Intervention RàI niveau 3 immédiate</strong> - Les deux composantes sont critiques</li>' : ''}
                    ${A < 0.7 ?
                        '<li><strong>Assiduité critique :</strong> Rencontre immédiate pour identifier les causes d\'absence</li>' : ''}
                    ${C < 0.7 ?
                        '<li><strong>Complétion critique :</strong> Investigation des obstacles à la remise des travaux</li>' : ''}
                    <li>Établir un plan d'intervention personnalisé (PIP) avec objectifs mesurables</li>
                    <li>Suivi hebdomadaire jusqu'à amélioration significative</li>
                    <li>Mobiliser les ressources d'aide (tutorat, aide technologique, etc.)</li>
                </ul>
            </div>
        ` : (A < 0.8 || C < 0.8) ? `
            <div class="info-box info-box--attention">
                <h4 style="color: var(--alerte-texte-attention); margin-bottom: 10px;">Recommandations préventives (niveau fragile)</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--alerte-texte-attention); line-height: 1.6;">
                    ${A < 0.8 && C < 0.8 ?
                        '<li><strong>Mobilisation fragile :</strong> Soutien sur les deux composantes (présence ET remise)</li>' :
                      A < 0.8 ?
                        '<li><strong>Assiduité fragile :</strong> Renforcer la motivation à assister aux séances</li>' :
                        '<li><strong>Complétion fragile :</strong> Soutenir l\'organisation et la gestion du temps</li>'}
                    <li>Discussion informelle pour identifier les obstacles émergents</li>
                    <li>Offrir stratégies d'autorégulation et de planification</li>
                    <li>Réévaluation dans 2 semaines</li>
                </ul>
            </div>
        ` : ''}
    `;
}

// calculerPerformancePAN → déplacé dans indices.js (#206)

/**
 * Obtient la couleur selon le taux (en pourcentage)
 * @param {number} taux - Taux en pourcentage (0-100)
 * @returns {string} - Code couleur
 */
function obtenirCouleurIndice(taux) {
    if (taux >= 85) return 'var(--niveau-attention-minimal)'; // Vert
    if (taux >= 70) return 'var(--niveau-attention-modere)';  // Jaune
    return 'var(--niveau-attention-tres-eleve)';              // Rouge
}

/**
 * Obtient les détails d'assiduité pour un étudiant
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
/**
 * Obtient les détails d'assiduité pour un étudiant
 * MODIFIÉ : Tri chronologique (plus ancien en premier)
 * 
 * @param {string} da - Numéro de DA
 * @returns {Object} - Détails d'assiduité
 */
function obtenirDetailsAssiduite(da) {
    // ========================================
    // SINGLE SOURCE OF TRUTH
    // Lire depuis db.getSync('indicesAssiduite') calculé par saisie-presences.js
    // ========================================
    const indices = db.getSync(cle('indicesAssiduite'), {});
    const detailsSommatif = indices.sommatif && indices.sommatif[da];

    // Si les données n'existent pas, retourner des valeurs par défaut
    if (!detailsSommatif || typeof detailsSommatif !== 'object') {
        console.warn(`⚠️ Aucune donnée d'assiduité pour ${da}, valeurs par défaut`);
        return {
            periodesPresentes: 0,
            periodesOffertes: 0,
            nombreSeances: 0,
            absences: []
        };
    }

    // 🆕 BETA 96.1: Utiliser directement les périodes (plus simple que les heures)
    const periodesPresentes = Math.round(detailsSommatif.periodesPresentes || 0);
    const periodesOffertes = Math.round(detailsSommatif.periodesOffertes || 0);
    const nombreSeances = detailsSommatif.nombreSeances || 0;

    // #224 : Récupérer les présences et construire datesSaisies depuis le GROUPE (pas juste l'étudiant)
    const presences = obtenirDonneesSelonMode('presences') || [];
    const etudiantsGroupe = obtenirDonneesSelonMode('groupeEtudiants') || [];
    const dasGroupe = new Set();
    if (Array.isArray(etudiantsGroupe)) {
        etudiantsGroupe.forEach(e => { if (e.da) dasGroupe.add(String(e.da)); });
    }
    const datesSaisies = new Set();
    presences.forEach(p => {
        if (p.date && dasGroupe.has(String(p.da))) datesSaisies.add(p.date);
    });

    // Source de vérité : calendrier des séances
    const seancesCompletes = typeof obtenirSeancesCompletes === 'function'
        ? obtenirSeancesCompletes() : {};
    const aujourdhui = new Date().toISOString().split('T')[0];

    const seances = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('seancesHoraire'), []);
    const dureePeriodeMin = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : 55;

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Itérer les dates du calendrier filtrées par datesSaisies et <= aujourd'hui
    const datesCalendrier = Object.keys(seancesCompletes).filter(d => d <= aujourdhui && datesSaisies.has(d)).sort();

    datesCalendrier.forEach(dateCours => {
        // Chercher le record NON-facultatif de l'étudiant
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours && !p.facultatif);

        // Nombre de périodes de la séance
        const periodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(dateCours) : 2;

        // Nombre de périodes de présence de l'étudiant
        let periodesPresenceEleve = 0;
        if (presenceEleve) {
            if (presenceEleve.periodesPresentes !== undefined && presenceEleve.periodesPresentes !== null) {
                periodesPresenceEleve = presenceEleve.periodesPresentes;
            } else if (presenceEleve.heures !== undefined && presenceEleve.heures !== null) {
                periodesPresenceEleve = Math.round(presenceEleve.heures * 60 / dureePeriodeMin);
            }
        } else {
            // Pas de record régulier — vérifier si c'est une séance uniquement facultative
            const presencesFacultatives = presences.filter(p => p.date === dateCours && p.facultatif === true);
            const aRecordGroupe = presences.some(p => p.date === dateCours && !p.facultatif);
            if (!aRecordGroupe && presencesFacultatives.length > 0) {
                // Séance uniquement facultative → ignorer
                return;
            }
        }

        // Détecter absence totale ou partielle
        if (periodesPresenceEleve === 0) {
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                periodesPresence: 0,
                periodesManquees: periodesSeance,
                seance: seance
            });
        } else if (periodesPresenceEleve < periodesSeance) {
            const seance = seances.find(s => s.date === dateCours);
            absences.push({
                date: dateCours,
                periodesPresence: periodesPresenceEleve,
                periodesManquees: periodesSeance - periodesPresenceEleve,
                seance: seance
            });
        }
    });

    // Trier par date CROISSANTE (plus ancien en premier)
    absences.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        periodesPresentes,
        periodesOffertes,
        nombreSeances,
        absences
    };
}


// formaterDate() — supprimée, canonique dans main.js (Beta 97.1 #68)

/* ===============================
   AFFICHAGE DU PROFIL COMPLET
   =============================== */

/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 4 - Fusion Performance + Portfolio
 * 
 * MODIFIÉ : Suppression de la carte Portfolio séparée
 */
/**
 * Affiche le profil complet d'un étudiant avec dashboard simplifié
 * VERSION 5 - Option 3 : Carte Portfolio unique
 * 
 * MODIFIÉ : 
 * - Suppression de la carte C (Complétion)
 * - Carte P renommée "Portfolio" affiche la Performance
 * - Détails du portfolio incluent C et P
 * - Grille de 5 colonnes au lieu de 6
 */
/* ===============================
   🎨 FONCTIONS HELPER - REDESIGN UI
   =============================== */

/**
 * Génère la carte premium de cible d'intervention
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la carte
 */
function genererCarteCibleIntervention(da) {
    // NOUVEAU Beta 90 : Utiliser la pratique active
    const pratique = typeof obtenirPratiqueActive === 'function' ? obtenirPratiqueActive() : null;

    if (!pratique) {
        console.error('[ProfilEtudiant] Aucune pratique active trouvée');
        return `
            <div class="info-box info-box--attention">
                <strong><img src="icons/icons8-high-priority.svg" alt="" class="alerte-icone">Configuration requise</strong><br>
                Configure une pratique de notation dans Conception › Pratiques de notation.
            </div>
        `;
    }

    // Utiliser la pratique active
    const cibleInfo = pratique.genererCibleIntervention(da);
    const patternInfo = pratique.identifierPattern(da);

    // Ne pas afficher si pas de cible
    if (!cibleInfo) {
        return '';
    }

    // Obtenir nombre d'artefacts/évaluations pour affichage (si disponible)
    const nbArtefacts = patternInfo.indices?.nbArtefacts || 0;

    // Badge cohérent avec Liste et Aperçu
    const niveauTexte = cibleInfo.niveau === 3 ? 'RàI 3' :
                       cibleInfo.niveau === 2 ? 'RàI 2' :
                       'RàI 1';

    const descriptionNiveau = cibleInfo.niveau === 3
        ? '<strong>Action immédiate requise</strong> - Intervention intensive pour prévenir un échec. Mobiliser les ressources d\'aide (CAF, aide à l\'apprentissage).'
        : cibleInfo.niveau === 2
        ? '<strong>Intervention ciblée recommandée</strong> - Soutien spécifique pour consolider les apprentissages et prévenir l\'aggravation des difficultés.'
        : cibleInfo.cible.includes('Pratique autonome')
        ? '<strong>Enrichissement</strong> - L\'étudiant maîtrise les bases. Encourager l\'exploration, la créativité et le développement de l\'autonomie.'
        : '<strong>Maintien</strong> - Performance satisfaisante. Continuer le suivi régulier et encourager la constance.';

    return `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-risque-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>À propos de cette section</strong>
            <br><br>
            <strong>Objectif :</strong> Cette section présente le niveau d'intervention RàI (Réponse à l'Intervention) recommandé pour l'étudiant, basé sur une analyse combinée de son engagement, de ses patterns d'apprentissage et de sa performance récente.
            <br><br>
            <strong>Niveaux RàI :</strong> Niveau 1 (Universel) : suivi régulier en classe • Niveau 2 (Préventif) : interventions préventives ciblées • Niveau 3 (Intensif) : interventions intensives individuelles hors classe
            <br><br>
            <strong>Méthodologie :</strong> Le système analyse l'engagement (E = A × C × P), le pattern d'apprentissage actuel (basé sur les ${nbArtefacts} ${accordTermeProduction('dernier', nbArtefacts)} ${obtenirTermeProduction(nbArtefacts > 1 ? 'pluriel' : 'singulier')}), et les défis identifiés sur les critères de la grille de référence. La logique de décision priorise les situations de décrochage, puis les difficultés persistantes et émergentes, avant de recommander des cibles d'enrichissement ou de maintien.
            <br><br>
            <strong>Utilisation :</strong> Cette section te guide dans le choix d'interventions appropriées. Les recommandations sont contextualisées selon les besoins spécifiques de l'étudiant. Consulte la section Accompagnement pour planifier et documenter tes interventions.
        </div>

        <!-- CARTE CIBLE D'INTERVENTION PREMIUM -->
        <div class="carte-cible-intervention" style="border-color: ${cibleInfo.couleur};">
            <div class="carte-cible-header">
                <div class="carte-cible-titre" style="color: ${cibleInfo.couleur};">
                    <span class="pastille-rai" style="background:${cibleInfo.couleur}"></span> Cible d'intervention recommandée
                </div>
                <div class="carte-cible-badge-niveau" style="background: ${cibleInfo.couleur};">
                    ${niveauTexte}
                </div>
            </div>

            <div class="carte-cible-texte-principal" style="color: ${cibleInfo.couleur};">
                ${cibleInfo.cible}
            </div>

            <div class="carte-cible-meta">
                <strong>Pattern actuel :</strong> ${patternInfo.type} ·
                <strong>Basé sur :</strong> ${nbArtefacts} ${accordTermeProduction('dernier', nbArtefacts)} ${obtenirTermeProduction(nbArtefacts > 1 ? 'pluriel' : 'singulier')}
            </div>

            <div class="carte-cible-description">
                ${descriptionNiveau}
            </div>
        </div>
    `;
}

/**
 * Génère une section collapsible avec header cliquable
 * @param {string} id - ID unique de la section (sans préfixe 'section-')
 * @param {string} titre - Titre affiché dans le header
 * @param {string} contenu - HTML du contenu de la section
 * @param {boolean} ouvert - Si true, section ouverte par défaut
 * @returns {string} - HTML de la section collapsible
 */
function genererSectionCollapsible(id, titre, contenu, ouvert = false) {
    const sectionId = `section-${id}`;
    const contentId = `content-${id}`;
    const chevronId = `chevron-${id}`;

    return `
        <div class="section-collapsible" id="${sectionId}">
            <div class="section-collapsible-header" data-action="toggleSectionCollapsible" data-param="${sectionId}">
                <div class="section-collapsible-titre">
                    ${titre}
                </div>
                <div class="section-collapsible-toggle">
                    <span>Voir</span>
                    <span class="chevron${ouvert ? ' expanded' : ''}" id="${chevronId}">▼</span>
                </div>
            </div>
            <div class="section-collapsible-content${ouvert ? ' expanded' : ''}" id="${contentId}">
                ${contenu}
            </div>
        </div>
    `;
}

/**
 * Toggle une section collapsible
 * @param {string} sectionId - ID de la section (avec préfixe 'section-')
 */
function toggleSectionCollapsible(sectionId) {
    const contentId = sectionId.replace('section-', 'content-');
    const chevronId = sectionId.replace('section-', 'chevron-');

    const content = document.getElementById(contentId);
    const chevron = document.getElementById(chevronId);

    if (!content || !chevron) {
        console.warn(`Éléments de section non trouvés: ${sectionId}`);
        return;
    }

    content.classList.toggle('expanded');
    chevron.classList.toggle('expanded');
}

/**
 * Toggle l'affichage des détails techniques (formules, calculs)
 * @param {string} detailsId - ID de l'élément détails
 */
function toggleDetailsTechniques(detailsId) {
    const details = document.getElementById(detailsId);
    if (!details) {
        console.warn(`Élément détails non trouvé: ${detailsId}`);
        return;
    }
    details.classList.toggle('visible');
}

/**
 * Variable globale pour stocker le DA actuel (utilisée pour navigation)
 */
let profilActuelDA = null;
window.profilActuelDA = null;

/**
 * Variable globale pour mémoriser la section active du profil (Beta 90)
 * Permet de conserver la même section lors de la navigation entre étudiants
 */
let sectionProfilActive = 'productions'; // Par défaut: Productions

/**
 * Change la section affichée dans la colonne droite du profil
 * @param {string} section - Nom de la section (cible, performance, assiduite, etc.)
 */
function changerSectionProfil(section) {
    if (!profilActuelDA) {
        console.error('❌ Aucun profil actuel');
        return;
    }

    const da = profilActuelDA;

    // NOUVEAU (Beta 85): Mémoriser la section active pour navigation entre étudiants
    sectionProfilActive = section;

    // Mettre à jour la navigation active (utilise les classes CSS matériel)
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // NOUVEAU (Beta 85): Trouver l'élément correspondant à la section
    // Supporte à la fois les clics directs (avec event) et les appels programmatiques
    let itemToActivate = null;

    if (typeof event !== 'undefined' && event.target) {
        // Appel depuis un clic : utiliser event.target
        itemToActivate = event.target.closest('.sidebar-item');
    } else {
        // Appel programmatique : trouver l'item par onclick
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${section}'`)) {
                itemToActivate = item;
            }
        });
    }

    if (itemToActivate) {
        itemToActivate.classList.add('active');
    }

    // Générer le contenu selon la section
    const contenuContainer = document.getElementById('profil-contenu-dynamique');
    if (!contenuContainer) {
        console.error('❌ Conteneur de contenu introuvable');
        return;
    }

    let contenu = '';
    let titre = '';

    switch (section) {
        case 'productions':
            titre = 'Productions et évaluations';
            contenu = genererSectionProductions(da);
            break;
        case 'jugement':
            // DEN couche 2 (#318) : panneau de saisie du jugement.
            titre = 'Jugement (dénotation)';
            contenu = (window.denotationSaisie && typeof window.denotationSaisie.panneau === 'function')
                ? window.denotationSaisie.panneau(da)
                : '<div class="alerte alerte-information">Module de dénotation indisponible.</div>';
            break;
        case 'cible':
            titre = 'Suivi de l\'apprentissage';
            contenu = genererContenuCibleIntervention(da);
            break;
        case 'progression':
            titre = 'Progression temporelle ACP';
            contenu = genererSectionProgression(da);
            break;
        case 'performance':
            titre = 'Développement des habiletés';
            contenu = genererSectionPerformance(da);
            break;
        case 'mobilisation':
            titre = 'Engagement ACP';
            contenu = genererSectionMobilisationEngagement(da);
            break;
        case 'rapport':
            titre = 'Rapport';
            contenu = genererSectionRapport(da);
            break;
        case 'accompagnement':
            titre = 'Accompagnement';
            contenu = genererSectionAccompagnement(da);
            break;
        case 'travaux':
            titre = 'Travaux soumis';
            contenu = genererSectionTravaux(da);
            break;
        default:
            titre = 'Section inconnue';
            contenu = '<p>Section non trouvée</p>';
    }

    // Récupérer les indices (pour autres usages, badge retiré - info déjà dans l'en-tête)
    const indices = calculerTousLesIndices(da);

    // Générer l'aide Primo selon la section (popup au clic)
    let toggleInfo = '';
    if (section === 'cible') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-risque-${da}"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>`;
    } else if (section === 'performance') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-performance-${da}"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>`;
    } else if (section === 'mobilisation') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-mobilisation-${da}"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>`;
    } else if (section === 'accompagnement') {
        toggleInfo = `<span class="primo-aide" data-target="details-calculs-accompagnement-${da}"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>`;
    }

    contenuContainer.innerHTML = `
        <div class="profil-contenu-header">
            <h2 class="u-flex-between-mb20">
                <span data-tooltip="${{'productions':'profil-productions','mobilisation':'profil-mobilisation','progression':'profil-progression','performance':'profil-habiletes','accompagnement':'profil-accompagnement','travaux':'profil-travaux','rapport':'profil-rapport'}[section] || ''}">${titre}</span>
                ${toggleInfo}
            </h2>
        </div>
        <div class="profil-contenu-body">
            ${contenu}
        </div>
    `;

    // Charger les thumbnails async (section travaux)
    if (section === 'travaux' && typeof travauxStockage !== 'undefined') {
        travauxStockage.chargerThumbnailsConteneur(contenuContainer);
    }

    // Réattacher les événements des toggles et Primo après changement de section
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') {
            reattacherEvenementsToggles();
        }

        // Réinitialiser la visibilité des icônes info dynamiques après re-render DOM
        if (window.accompagnement && typeof window.accompagnement.initialiserPopup === 'function') {
            window.accompagnement.initialiserPopup();
        }

        // Restaurer les préférences du rapport si on vient de charger cette section
        if (section === 'rapport') {
            restaurerPreferencesRapport(da);
        }
    }, 100);

}

/**
 * Calcule la direction du risque (évolution temporelle)
 * Compare le risque sur les N artefacts récents vs les N suivants (fenêtre glissante configurable)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { symbole: '→'|'←'|'—', interpretation: string }
 */
function calculerDirectionRisque(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    // Pas assez de données pour calculer la direction du risque (besoin de N+1 minimum)
    if (evaluationsEleve.length < N + 1) {
        return {
            symbole: '',
            interpretation: 'Données insuffisantes'
        };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Calculer risque récent (N plus récents)
    const artefactsRecents = evaluationsEleve.slice(0, N);
    const performanceRecente = artefactsRecents.reduce((sum, e) => sum + e.noteFinale, 0) / artefactsRecents.length / 100;
    const risqueRecent = 1 - performanceRecente;

    // Calculer risque précédent (N suivants avec chevauchement)
    const artefactsSuivants = evaluationsEleve.slice(1, N + 1);
    const performancePrecedente = artefactsSuivants.reduce((sum, e) => sum + e.noteFinale, 0) / artefactsSuivants.length / 100;
    const risquePrecedent = 1 - performancePrecedente;

    const difference = risqueRecent - risquePrecedent;

    // Déterminer la direction selon le seuil configurable
    const seuilDirection = obtenirSeuil('directionRisque');
    let symbole, interpretation;
    if (difference > seuilDirection) {
        symbole = '→';
        interpretation = 'Le risque augmente';
    } else if (difference < -seuilDirection) {
        symbole = '←';
        interpretation = 'Le risque diminue';
    } else {
        symbole = '—';
        interpretation = 'Risque plateau';
    }

    return {
        symbole,
        interpretation,
        risqueRecent: (risqueRecent * 100).toFixed(1),
        risquePrecedent: (risquePrecedent * 100).toFixed(1),
        difference: (difference * 100).toFixed(1)
    };
}

/**
 * Calcule la direction de chaque critère SRPNF (évolution temporelle)
 * Compare les scores sur les N artefacts récents vs les N suivants (fenêtre glissante configurable)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure: {symbole, interpretation}, rigueur: {...}, ... }
 */
function calculerDirectionsCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Toutes les évaluations de l'étudiant avec critères structurés
    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        e.criteres && Array.isArray(e.criteres) && e.criteres.length > 0
    );

    // Résultat par défaut si données insuffisantes
    const resultatParDefaut = {
        symbole: '',
        interpretation: 'Données insuffisantes'
    };

    // Pas assez de données pour calculer la direction (besoin de N+1 minimum)
    if (evaluationsEleve.length < N + 1) {
        return {
            structure: resultatParDefaut,
            rigueur: resultatParDefaut,
            plausibilite: resultatParDefaut,
            nuance: resultatParDefaut,
            francais: resultatParDefaut
        };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Fonction helper pour extraire les scores d'une liste d'évaluations
    // Utilise evaluation.criteres[] (fiable) au lieu du parsing regex de retroactionFinale
    const extraireScoresCriteres = (evals) => {
        const scoresCriteres = {
            structure: [],
            rigueur: [],
            plausibilite: [],
            nuance: [],
            francais: []
        };

        evals.forEach(evaluation => {
            if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) return;

            evaluation.criteres.forEach(c => {
                const niveauIDME = c.niveauSelectionne;
                const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);
                if (score === null) return;

                const nom = (c.critereNom || '').toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

                if (nom === 'structure') scoresCriteres.structure.push(score);
                else if (nom === 'rigueur') scoresCriteres.rigueur.push(score);
                else if (nom.startsWith('plausibilit')) scoresCriteres.plausibilite.push(score);
                else if (nom === 'nuance') scoresCriteres.nuance.push(score);
                else if (nom.startsWith('francais') || nom.startsWith('franc')) scoresCriteres.francais.push(score);
            });
        });

        return scoresCriteres;
    };

    // Extraire les scores pour les N plus récents
    const artefactsRecents = evaluationsEleve.slice(0, N);
    const scoresRecents = extraireScoresCriteres(artefactsRecents);

    // Extraire les scores pour les N suivants avec chevauchement
    const artefactsSuivants = evaluationsEleve.slice(1, N + 1);
    const scoresSuivants = extraireScoresCriteres(artefactsSuivants);

    // Déterminer le seuil de direction (même seuil que pour le risque)
    const seuilDirection = obtenirSeuil('directionRisque');

    // Calculer la direction pour chaque critère
    const directions = {};
    const criteres = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais'];

    criteres.forEach(critere => {
        const scoresRec = scoresRecents[critere];
        const scoresSui = scoresSuivants[critere];

        // Vérifier si nous avons assez de données pour ce critère
        if (scoresRec.length === 0 || scoresSui.length === 0) {
            directions[critere] = resultatParDefaut;
            return;
        }

        // Calculer les moyennes
        const moyenneRecente = scoresRec.reduce((sum, s) => sum + s, 0) / scoresRec.length;
        const moyenneSuivante = scoresSui.reduce((sum, s) => sum + s, 0) / scoresSui.length;

        // Calculer la différence (positif = amélioration, négatif = détérioration)
        const difference = moyenneRecente - moyenneSuivante;

        // Déterminer le symbole et l'interprétation
        let symbole, interpretation;
        if (difference > seuilDirection) {
            symbole = '→';
            interpretation = 'En amélioration';
        } else if (difference < -seuilDirection) {
            symbole = '←';
            interpretation = 'En détérioration';
        } else {
            symbole = '—';
            interpretation = 'Plateau';
        }

        directions[critere] = {
            symbole,
            interpretation,
            moyenneRecente: (moyenneRecente * 100).toFixed(1),
            moyenneSuivante: (moyenneSuivante * 100).toFixed(1),
            difference: (difference * 100).toFixed(1)
        };
    });

    return directions;
}

/**
 * Génère l'historique des interventions pour le profil étudiant (Beta 85)
 * @param {string} da - DA de l'étudiant
 * @returns {string} - HTML de l'historique
 */
function genererHistoriqueInterventionsProfil(da) {
    // Vérifier si la fonction obtenirInterventionsEtudiant existe
    if (typeof obtenirInterventionsEtudiant !== 'function') {
        return '';
    }

    const interventions = obtenirInterventionsEtudiant(da);

    if (interventions.length === 0) {
        return '';
    }

    // Trier par date décroissante
    interventions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Compter par niveau
    const parNiveau = {
        2: interventions.filter(i => i.niveauRai === 2).length,
        3: interventions.filter(i => i.niveauRai === 3).length
    };

    let detail = [];
    if (parNiveau[2] > 0) detail.push(`${parNiveau[2]} niveau 2`);
    if (parNiveau[3] > 0) detail.push(`${parNiveau[3]} niveau 3`);

    const totalText = interventions.length === 1 ? '1 intervention' : `${interventions.length} interventions`;
    const detailText = detail.length > 0 ? ` (${detail.join(', ')})` : '';

    // Dernière intervention
    const derniere = interventions[0];
    const dateDerniere = new Date(derniere.date).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });

    return `
        <li><strong>Interventions reçues :</strong> ${totalText}${detailText}
            <span class="u-texte-mini u-texte-gris" style="display: block; margin-top: 3px;">
                Dernière : ${derniere.titre} (${dateDerniere})
            </span>
        </li>
    `;
}

/**
 * Affiche la valeur de la pratique active (SOM ou PAN selon la config).
 * @param {number} valeurSOM - Valeur si pratique sommative
 * @param {number} valeurPAN - Valeur si pratique PAN
 * @param {boolean} afficherTiret - Afficher « — » si aucune donnée
 * @returns {string} HTML de la valeur colorée
 */
function genererValeursComparatives(valeurSOM, valeurPAN, afficherTiret = false) {
    // 🆕 BETA 95.6 : Afficher tiret si aucune donnée
    if (afficherTiret) {
        return `<span style="color: var(--gris-clair); font-weight: 600;">—</span>`;
    }

    // Session C (#303) : mode comparatif retiré — toujours la valeur de la pratique active.
    const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'sommative';
    const valeur = pratique === 'sommative' ? valeurSOM : valeurPAN;
    return `<strong class="profil-valeur-grande-bleu">${valeur}%</strong>`;
}

// === HELPERS PRIVÉS pour afficherProfilComplet (étape 4 éclatement cyc 58 → < 30) ===

/**
 * HELPER : résolution étudiant + état pivot atomique
 * Phase 5 : accepte un élément (depuis data-on-change) ou une chaîne.
 * Retourne { da, etudiants, eleve } — eleve = null si introuvable.
 */
function _resoudreEtudiantProfil(daOuEl) {
    var da = (typeof daOuEl === 'object' && daOuEl !== null) ? daOuEl.value : daOuEl;
    if (da !== null && da !== undefined) da = String(da);

    // État pivot dual-write atomique (Écart #6 MODULES-MAP §2.3) — couple non séparé
    profilActuelDA = da;
    window.profilActuelDA = da;

    // 🆕 BETA 95.6 : obtenirEtudiantsCoursActif() pour filtrer par groupe-cours actif
    const tousEtudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : (typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants'))
            : obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.groupe !== '9999'));
    const etudiants = tousEtudiants.filter(e => !estEtudiantExclu(e));
    etudiants.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    window.etudiantsListeCache = etudiants;

    const eleve = etudiants.find(e => e.da === da);
    return { da, etudiants, eleve };
}

/**
 * HELPER : recalcul indices A+C+P si fonctions disponibles (FIX #220).
 */
function _recalculerIndicesACPSiPossible() {
    if (typeof genererSeancesCompletes === 'function') genererSeancesCompletes(null);
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') calculerEtSauvegarderIndicesAssiduite();
    if (typeof calculerEtStockerIndicesCP === 'function') calculerEtStockerIndicesCP();
}

function _resoudreSectionContenu(sectionAffichee, da, prefs) {
    const fallback = { titreSection: 'Productions et évaluations', contenuSection: genererSectionProductions(da) };

    if (sectionAffichee === 'productions') return fallback;
    if (sectionAffichee === 'jugement') {
        return (prefs.jugementDenActif && window.denotationSaisie)
            ? { titreSection: 'Jugement (dénotation)', contenuSection: window.denotationSaisie.panneau(da) }
            : fallback;
    }
    if (sectionAffichee === 'performance') {
        return prefs.developpementVisible
            ? { titreSection: 'Développement des habiletés', contenuSection: genererSectionPerformance(da) }
            : fallback;
    }
    if (sectionAffichee === 'mobilisation') {
        return prefs.engagementVisible
            ? { titreSection: 'Engagement ACP', contenuSection: genererSectionMobilisationEngagement(da) }
            : fallback;
    }
    if (sectionAffichee === 'progression') {
        return prefs.progressionVisible
            ? { titreSection: 'Progression', contenuSection: genererSectionProgression(da) }
            : fallback;
    }
    if (sectionAffichee === 'rapport') return { titreSection: 'Rapport', contenuSection: genererSectionRapport(da) };
    if (sectionAffichee === 'accompagnement') {
        return prefs.activerRai
            ? { titreSection: 'Accompagnement', contenuSection: genererSectionAccompagnement(da) }
            : fallback;
    }
    if (sectionAffichee === 'travaux') return { titreSection: 'Travaux soumis', contenuSection: genererSectionTravaux(da) };
    return { titreSection: '', contenuSection: '' };
}

/**
 * HELPER : post-rendu setTimeout T+100ms (réattaches + initialisations différées).
 */
function _postRendreProfilSection(sectionAffichee, da, container) {
    setTimeout(() => {
        if (typeof reattacherEvenementsToggles === 'function') reattacherEvenementsToggles();
        if (window.accompagnement && typeof window.accompagnement.initialiserPopup === 'function') {
            window.accompagnement.initialiserPopup();
        }
        if (sectionAffichee === 'rapport') restaurerPreferencesRapport(da);
        if (sectionAffichee === 'travaux' && typeof travauxStockage !== 'undefined') {
            travauxStockage.chargerThumbnailsConteneur(container);
        }
    }, 100);
}

/**
 * Affiche le profil complet avec layout 2 colonnes
 * Inspiré de la page d'évaluation
 *
 * Orchestrateur slim post-éclatement (étape 4, 18 mai 2026) — délègue à 5 helpers
 * privés `_X` ci-dessus. Cyc cible ≤ 30. Signature externe arité 1 préservée.
 */
function afficherProfilComplet(daOuEl) {
    // 1. Résolution étudiant + état pivot atomique
    const { da, etudiants, eleve } = _resoudreEtudiantProfil(daOuEl);
    if (!eleve) {
        alert('Étudiant·e introuvable');
        return;
    }

    // ✅ NOUVEAU (29 déc 2025): mode anonymisation pour masquer les DA
    const modeAnonymisation = typeof estModeeLectureSeule === 'function' && estModeeLectureSeule();

    if (typeof afficherSousSection === 'function') afficherSousSection('suivi-profil');

    const container = document.getElementById('contenuProfilEtudiant');
    if (!container) {
        console.error('❌ Élément #contenuProfilEtudiant introuvable');
        return;
    }

    // 2. Recalcul indices A+C+P + indices principal
    _recalculerIndicesACPSiPossible();
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100;
    const C = indices.C / 100;
    const interpM = interpreterMobilisation(A, C);

    // Session C (#303) : mode comparatif retiré — le calcul dual SOM/PAN (mort) a été retiré.

    // 4. Préférences UI (pour résolution section + sidebar)
    const prefs = {
        activerRai:           obtenirPreference('activerRai') !== false,
        engagementVisible:    obtenirPreference('depistageAcp') !== false,
        progressionVisible:   obtenirPreference('afficherGraphiques') !== false,
        developpementVisible: obtenirPreference('afficherDeveloppementHabiletes') !== false,
        // DEN couche 2 (#318) : section « Jugement » visible seulement quand la
        // pratique active du groupe-cours est une dénotation (note saisie).
        jugementDenActif:     !!(window.denotationSaisie
                                  && typeof window.denotationSaisie.estActive === 'function'
                                  && window.denotationSaisie.estActive())
    };

    // 5. Navigation Précédent/Suivant
    const indexActuel = etudiants.findIndex(e => e.da === da);
    const etudiantPrecedent = indexActuel > 0 ? etudiants[indexActuel - 1] : null;
    const etudiantSuivant = indexActuel < etudiants.length - 1 ? etudiants[indexActuel + 1] : null;

    // 6. Section + contenu (Beta 90 : section mémorisée ou 'productions' par défaut)
    const sectionAffichee = sectionProfilActive || 'productions';
    const { titreSection, contenuSection } = _resoudreSectionContenu(sectionAffichee, da, prefs);
    const { activerRai, engagementVisible, progressionVisible, developpementVisible, jugementDenActif } = prefs;

    // Générer le HTML avec layout sidebar matériel
    container.innerHTML = `
        <div class="layout-sidebar-2col">
            <!-- SIDEBAR GAUCHE (navigation) -->
            <div class="sidebar-navigation">
                <!-- Sélecteur d'étudiant -->
                <div class="sidebar-filtre">
                    <label class="u-texte-mini u-texte-gris" style="margin-bottom: 5px; display: block;" data-tooltip="profil-selecteur">Étudiant·e :</label>
                    <select id="selecteurEtudiantProfil" class="controle-form" data-on-change="afficherProfilComplet">
                        ${etudiants.map(e => {
                            // ✅ CORRIGÉ (29 déc 2025): Ne pas afficher DA en mode anonymisation
                            const daTexte = modeAnonymisation ? '' : ` (${echapperHtml(e.da)})`;
                            return `
                            <option value="${echapperHtml(e.da)}" ${e.da === da ? 'selected' : ''}>
                                ${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}${daTexte}
                            </option>
                            `;
                        }).join('')}
                    </select>
                </div>

                <!-- Navigation Précédent/Suivant -->
                <div class="sidebar-nav-buttons">
                    <button class="btn btn-principal"
                            data-action="afficherProfilComplet" data-param="${etudiantPrecedent?.da}"
                            ${!etudiantPrecedent ? 'disabled' : ''}
                            title="Étudiant·e précédent·e">
                        ← Préc.
                    </button>
                    <button class="btn btn-principal"
                            data-action="afficherProfilComplet" data-param="${etudiantSuivant?.da}"
                            ${!etudiantSuivant ? 'disabled' : ''}
                            title="Étudiant·e suivant·e">
                        Suiv. →
                    </button>
                </div>

                <!-- Informations étudiant -->
                <div class="sidebar-info-card">
                    <div class="sidebar-info-card-nom">
                        ${echapperHtml(eleve.prenom)} ${echapperHtml(eleve.nom)}
                    </div>
                    <div class="sidebar-info-card-details">
                        ${modeAnonymisation ? '' : `<div><strong>DA:</strong> ${echapperHtml(eleve.da)}</div>`}
                        ${eleve.groupe ? `<div><strong>Groupe:</strong> ${echapperHtml(eleve.groupe)}</div>` : ''}
                        ${eleve.programme ? `<div><strong>Programme:</strong> ${typeof obtenirNomProgramme === 'function' ? echapperHtml(obtenirNomProgramme(eleve.programme)) : echapperHtml(eleve.programme)}</div>` : ''}
                        ${eleve.sa === 'Oui' ? '<div class="u-texte-bleu">Services adaptés</div>' : ''}
                        ${eleve.caf === 'Oui' ? '<div class="u-texte-bleu">CAF</div>' : ''}
                    </div>
                </div>

                <!-- Navigation sections (utilise les classes matériel) -->
                <div class="sidebar-liste">
                    <div class="sidebar-section-titre" data-tooltip="profil-nav-observations">OBSERVATIONS</div>

                    <!-- 1. Productions -->
                    <div class="sidebar-item ${sectionAffichee === 'productions' ? 'active' : ''}" data-action="changerSectionProfil" data-param="productions">
                        <div class="sidebar-item-titre">Productions</div>
                    </div>

                    <!-- 1b. Jugement (Dénotation #318) — visible seulement si la pratique active est une DEN -->
                    ${jugementDenActif ? `
                    <div class="sidebar-item ${sectionAffichee === 'jugement' ? 'active' : ''}" data-action="changerSectionProfil" data-param="jugement">
                        <div class="sidebar-item-titre">Jugement</div>
                    </div>
                    ` : ''}

                    <!-- 2. Engagement ACP (affiché uniquement si Micro données ACP activé) -->
                    ${engagementVisible ? `
                    <div class="sidebar-item ${sectionAffichee === 'mobilisation' ? 'active' : ''}" data-action="changerSectionProfil" data-param="mobilisation">
                        <div class="sidebar-item-titre">Engagement ACP</div>
                    </div>
                    ` : ''}

                    <!-- 2b. Progression temporelle ACP (affiché uniquement si Graphiques d'évolution activé) -->
                    ${progressionVisible ? `
                    <div class="sidebar-item ${sectionAffichee === 'progression' ? 'active' : ''}" data-action="changerSectionProfil" data-param="progression">
                        <div class="sidebar-item-titre">Progression temporelle ACP</div>
                    </div>
                    ` : ''}

                    <!-- 3. Développement des habiletés (affiché uniquement si préférence activée) -->
                    ${developpementVisible ? `
                    <div class="sidebar-item ${sectionAffichee === 'performance' ? 'active' : ''}" data-action="changerSectionProfil" data-param="performance">
                        <div class="sidebar-item-titre">Développement des habiletés</div>
                    </div>
                    ` : ''}

                    <!-- 4. Accompagnement (affiché uniquement si RàI activé) -->
                    ${activerRai ? `
                    <div class="sidebar-item ${sectionAffichee === 'accompagnement' ? 'active' : ''}" data-action="changerSectionProfil" data-param="accompagnement">
                        <div class="sidebar-item-titre">Accompagnement</div>
                    </div>
                    ` : ''}

                    <!-- 5. Travaux soumis (Beta 96.3) -->
                    <div class="sidebar-item ${sectionAffichee === 'travaux' ? 'active' : ''}" data-action="changerSectionProfil" data-param="travaux">
                        <div class="sidebar-item-titre">Travaux soumis</div>
                    </div>

                    <!-- 6. Rapport -->
                    <div class="sidebar-item ${sectionAffichee === 'rapport' ? 'active' : ''}" data-action="changerSectionProfil" data-param="rapport">
                        <div class="sidebar-item-titre">Rapport</div>
                    </div>
                </div>
            </div>

            <!-- ZONE PRINCIPALE (centrale, scroll) -->
            <div class="zone-principale" id="profil-contenu-dynamique">
                <!-- Contenu dynamique chargé par changerSectionProfil() -->
                <div class="profil-contenu-header">
                    <h2 class="u-flex-between-mb20">
                        <span data-tooltip="${{'productions':'profil-productions','mobilisation':'profil-mobilisation','progression':'profil-progression','performance':'profil-habiletes','accompagnement':'profil-accompagnement','travaux':'profil-travaux','rapport':'profil-rapport'}[sectionAffichee] || ''}">${titreSection}</span>
                        <span class="primo-aide" data-target="details-calculs-risque-${da}"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </h2>
                </div>
                <div class="profil-contenu-body">
                    ${contenuSection}
                </div>
            </div>
        </div>
    `;

    // 7. Post-rendu T+100ms (réattaches + initialisations différées)
    _postRendreProfilSection(sectionAffichee, da, container);
}

/* ===============================
   📁 GESTION DU PORTFOLIO
   =============================== */

/* ⚠️ CODE SUPPRIMÉ - 23 octobre 2025
 *
 * Les fonctions chargerPortfolioDetail() et toggleArtefactPortfolio()
 * étaient dupliquées dans ce fichier.
 *
 * UTILISER DÉSORMAIS les fonctions de portfolio.js:
 * - chargerPortfolioEleveDetail(da)
 * - toggleArtefactPortfolio(da, portfolioId, nombreARetenir)
 *
 * Ces fonctions sont globalement accessibles et gèrent le portfolio étudiant.
 * Les appels HTML (onchange) utilisent automatiquement les fonctions de portfolio.js.
 */

/**
* Génère le HTML de la section assiduité
    * @param { string } da - Numéro de DA
        * @returns { string } - HTML de la section
            */
/**
 * Génère le HTML de la section assiduité avec dates cliquables
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
/**
 * Génère le HTML de la section assiduité avec layout horizontal
 * VERSION SIMPLIFIÉE : absences affichées côte à côte
 * 
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionAssiduite(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.periodesOffertes > 0
        ? (details.periodesPresentes / details.periodesOffertes * 100).toFixed(1)
        : 0;

    return `
        <!-- STATISTIQUES avec classes CSS natives -->
        <div class="profil-grid-auto-200">
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Périodes présentes</span>
                    <strong class="profil-valeur-grande-bleu">${details.periodesPresentes}</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Périodes offertes</span>
                    <strong class="profil-valeur-grande-bleu">${details.periodesOffertes}</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Taux d'assiduité</span>
                    <strong class="profil-valeur-grande-bleu">${taux}%</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Séances</span>
                    <strong class="profil-valeur-grande-bleu">${details.nombreSeances}</strong>
                </div>
            </div>
        </div>
        
        <!-- LISTE DES ABSENCES -->
        ${details.absences.length > 0 ? `
            <h4 class="profil-titre-bleu-compact">
                Absences et retards
            </h4>
            <div class="u-flex-gap-10">
                ${details.absences.map(abs => {
                    const date = new Date(abs.date + 'T12:00:00');
                    const options = { weekday: 'short', day: 'numeric', month: 'short' };
                    const dateFormatee = date.toLocaleDateString('fr-CA', options);
                    const estAbsenceComplete = abs.heuresPresence === 0;
                    const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                    return `
                        <div class="badge-absence ${classeBadge}"
                             data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
                            <span class="badge-absence-date">
                                ${dateFormatee}
                            </span>
                            <span class="badge-absence-heures">
                                ${estAbsenceComplete
                                    ? `${abs.heuresManquees}/${abs.heuresPresence + abs.heuresManquees}`
                                    : `${abs.heuresPresence}/${abs.heuresPresence + abs.heuresManquees}`
                                }
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : `
            <div class="profil-message-tous-remis">
                Assiduité parfaite !
            </div>
        `}
    `;
}


/**
 * Génère le HTML de la section performance
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function _trouverEvaluationActive(evaluationsEleve, productionId) {
    const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === productionId);
    if (evaluationsProduction.length === 0) return null;
    // PRIORITÉ 1 : reprise ciblée active (jetonRepriseCibleeApplique + non remplacée)
    const repriseCiblee = evaluationsProduction.find(e => e.jetonRepriseCibleeApplique === true && !e.remplaceeParId);
    if (repriseCiblee) return repriseCiblee;
    // PRIORITÉ 2 : reprise active (repriseDeId + non remplacée)
    const repriseActive = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);
    if (repriseActive) return repriseActive;
    // PRIORITÉ 3 : évaluation normale non remplacée
    return evaluationsProduction.find(e => !e.remplaceeParId) || null;
}

function _calculerEcheanceFormateeProduction(production) {
    // 🆕 Beta 98.3 : Résoudre via obtenirEcheanceEffective (multi-groupe)
    const infoCours = db.getSync('infoCours', null);
    const gcId = infoCours ? (infoCours._groupeCoursId || infoCours.id || null) : null;
    const echeance = (typeof obtenirEcheanceEffective === 'function')
        ? obtenirEcheanceEffective(production, gcId).date
        : production.dateEcheance;
    if (!echeance) return '—';
    // Note: +T12:00:00 évite le décalage de fuseau horaire (UTC vs local)
    return new Date(echeance + 'T12:00:00').toLocaleDateString('fr-CA');
}

function _determinerBadgeTypeEvaluation(evaluation) {
    if (evaluation.remplaceeParId) return 'remplacee';
    if (evaluation.jetonRepriseCibleeApplique === true) return 'reprise-ciblee';
    if (evaluation.repriseDeId || evaluation.id.startsWith('EVAL_REPRISE_')) return 'nouvelle-reprise';
    if (evaluation.jetonDelaiApplique && !evaluation.repriseDeId && !evaluation.jetonRepriseCibleeApplique) return 'delai';
    return null;
}

function _construireLigneProductionEvaluee(production, evaluation, indexArtefact) {
    const statutRemise = evaluation.statutRemise || 'evalue';
    const statutIntegrite = evaluation.statutIntegrite || 'recevable';
    const estNonRemis = statutRemise === 'non-remis' || statutRemise === 'retard';
    const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';
    return {
        production: production.titre,
        description: production.activiteApprentissage || production.description || production.titre,
        note: `${evaluation.niveauFinal} ${evaluation.noteFinale}%`,
        date: _calculerEcheanceFormateeProduction(production),
        statut: estNonRemis ? 'non-remis' : 'evalue',
        statutRemise: statutRemise,
        statutIntegrite: statutIntegrite,
        estNonRecevable: estNonRecevable,
        verrouille: evaluation.verrouillee || false,
        evaluationId: evaluation.id,
        productionId: production.id,
        badgeType: _determinerBadgeTypeEvaluation(evaluation),
        indexArtefact: `P${indexArtefact}`
    };
}

function _construireLigneProductionNonRemise(production, indexArtefact) {
    return {
        production: production.titre,
        description: production.activiteApprentissage || production.description || production.titre,
        note: null,
        date: _calculerEcheanceFormateeProduction(production),
        statut: 'non-evalue',
        statutRemise: 'non-remis',
        statutIntegrite: 'recevable',
        estNonRecevable: false,
        verrouille: false,
        evaluationId: null,
        productionId: production.id,
        badgeType: null,
        indexArtefact: `P${indexArtefact}`
    };
}

/**
 * Génère la section Productions et évaluations pour un élève
 * Affiche un tableau similaire à celui de la liste des évaluations
 */
function genererSectionProductions(da) {
    // IMPORTANT: Utiliser obtenirDonneesSelonMode pour respecter le mode actif (normal, anonymisation)
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
    const productions = obtenirDonneesSelonMode('productions');
    const groupeEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = groupeEtudiants.find(e => e.da === da);

    if (!etudiant) {
        return '<p class="u-text-center-gris">Étudiant non trouvé</p>';
    }

    // Rang chronologique des productions (P1, P2...) basé sur la date d'échéance
    var _rangsProductions = {};
    var _toutesProds = productions.filter(function(p) { return p.type !== 'portfolio'; });
    _toutesProds.sort(function(a, b) { return (a.dateEcheance || '9999').localeCompare(b.dateEcheance || '9999'); });
    for (var ri = 0; ri < _toutesProds.length; ri++) {
        _rangsProductions[_toutesProds[ri].id] = ri + 1;
    }

    // Productions à évaluer (exclure portfolio lui-même), triées par date d'échéance
    const productionsAEvaluer = productions.filter(p => p.type !== 'portfolio')
        .sort((a, b) => (a.dateEcheance || '9999').localeCompare(b.dateEcheance || '9999'));

    if (productionsAEvaluer.length === 0) {
        return `
            <div class="profil-zone-grande-bleu">
                <p class="u-texte-gris" style="font-size: 1.1rem;">Aucune production configurée</p>
                <p class="u-texte-gris-clair u-mt-10">Crée des productions dans la section Matériel → Productions</p>
            </div>
        `;
    }

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire les lignes du tableau
    const lignes = productionsAEvaluer.map((production, index) => {
        const evaluation = _trouverEvaluationActive(evaluationsEleve, production.id);
        const indexArtefact = _rangsProductions[production.id] || (index + 1);
        return evaluation
            ? _construireLigneProductionEvaluee(production, evaluation, indexArtefact)
            : _construireLigneProductionNonRemise(production, indexArtefact);
    });

    // Calculer les détails de la note finale de session
    const detailsNoteFinale = calculerDetailsNoteFinale(da);

    // Générer le HTML de la section Note finale
    let htmlNoteFinale = '';
    if (detailsNoteFinale && detailsNoteFinale.erreur) {
        htmlNoteFinale = `
        <div class="note-finale-section">
            <h3 class="note-finale-titre">
                Note finale de session
                ${(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique) ? `<span class="note-finale-pratique-nom" title="Pratique de notation active (note non calculable — vérifier ses paramètres)">${echapperHtml(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique)}</span>` : ''}
                ${detailsNoteFinale.pratiqueId ? `<button type="button" class="note-finale-lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Ouvrir les réglages de cette pratique pour corriger ses paramètres">Réglages de la pratique</button>` : ''}
            </h3>
            <div class="alerte alerte-attention" style="margin-top: 12px;">
                <strong>Note finale non calculable.</strong> ${echapperHtml(detailsNoteFinale.erreur)}
            </div>
        </div>
        `;
    } else if (detailsNoteFinale) {
        const portfolio = detailsNoteFinale.portfolio;
        const terminal = detailsNoteFinale.terminal;
        const estHybride = String(portfolio.methodeSelection || '').toLowerCase().indexOf('hybride') !== -1;

        const productionsMap = {};
        productions.forEach(p => { productionsMap[p.id] = p; });

        // Format aligné sur le PDF rétroaction : « Artefact N (M 75.0%) : Activité ».
        // Le « Artefact N » vient du titre de la production (`prod.titre`) ; l'activité
        // est lue depuis `prod.activiteApprentissage`. La note finale est une vue
        // synoptique, donc niveau ET note chiffrée sont affichés en parallèle.
        const decrireRetenu = (art, i) => {
            const prod = productionsMap[art.productionId];
            return {
                titreProd: prod?.titre || `Artefact ${i + 1}`,
                activite:  prod?.activiteApprentissage || prod?.description || '',
                niveau:    art.niveau,
                note:      art.note,
                categorie: prod?.categorie || null
            };
        };
        const retenusDecrits = portfolio.artefactsRetenus
            .map(decrireRetenu)
            .sort((a, b) => (b.note || 0) - (a.note || 0));

        const renderLigneRetenu = (r) => {
            const noteTxt = (typeof r.note === 'number') ? `${r.note.toFixed(1)}%` : '—';
            const marqueur = `${echapperHtml(r.niveau || '?')} ${noteTxt}`;
            const activite = r.activite ? ` : ${echapperHtml(r.activite)}` : '';
            return `<li>${echapperHtml(r.titreProd)} <strong>(${marqueur})</strong>${activite}</li>`;
        };
        const renderLigneObligatoire = (o) => {
            const noteTxt = (typeof o.note === 'number') ? `${o.note.toFixed(1)}%` : null;
            const marqueur = (o.niveau && noteTxt) ? `${echapperHtml(o.niveau)} ${noteTxt}` : 'non remis';
            const activite = o.activite ? ` : ${echapperHtml(o.activite)}` : '';
            return `<li>${echapperHtml(o.titreProd)} <strong>(${marqueur})</strong>${activite}</li>`;
        };

        const enteteBandeauPlafonnement = portfolio.plafonnement ? `
            <div class="alerte alerte-attention" style="margin-bottom: 15px;">
                ${portfolio.plafonnement.echec
                    ? `<strong>Échec automatique :</strong> L'étudiant·e n'a remis que ${portfolio.nombreEvalues} production${portfolio.nombreEvalues > 1 ? 's' : ''} sur les ${portfolio.minimumRequis} requises. Selon les règles de conformité, un déficit de ${portfolio.plafonnement.deficit} production${portfolio.plafonnement.deficit > 1 ? 's' : ''} ou plus entraîne un échec automatique.`
                    : `<strong>Note plafonnée :</strong> L'étudiant·e n'a remis que ${portfolio.nombreEvalues} production${portfolio.nombreEvalues > 1 ? 's' : ''} sur les ${portfolio.minimumRequis} requises. Selon les règles de conformité, un déficit de ${portfolio.plafonnement.deficit} production${portfolio.plafonnement.deficit > 1 ? 's' : ''} plafonne la note du portfolio au niveau ${portfolio.plafonnement.niveauCode} (maximum ${portfolio.plafonnement.seuilMax}%).`
                }
            </div>
        ` : '';

        // ----- Mode HYBRIDE sans terminale : Sélection (gauche) / Obligatoires (droite) -----
        // Lit les pondérations Sélection/Obligatoires depuis la config catégories
        // de la pratique active. Pas de fallback arbitraire — si la config est
        // incomplète, message d'erreur explicite.
        if (estHybride && !terminal.present) {
            const selection = retenusDecrits.filter(r => r.categorie !== 'obligatoire');
            const productionsObligatoires = productions.filter(p => p.categorie === 'obligatoire' && p.type !== 'portfolio');
            const evaluationsEleveValides = evaluationsEleve.filter(e => !e.remplaceeParId && e.noteFinale != null);
            const obligatoiresTous = productionsObligatoires.map(prod => {
                const evalObl = evaluationsEleveValides.find(e => e.productionId === prod.id);
                return {
                    titreProd: prod.titre || obtenirTermeProduction('singulier', true),
                    activite:  prod.activiteApprentissage || prod.description || '',
                    niveau:    evalObl ? (evalObl.niveauFinal || null) : null,
                    note:      evalObl && typeof evalObl.noteFinale === 'number' ? evalObl.noteFinale : null
                };
            });

            const cats = (typeof obtenirConfigCategories === 'function') ? obtenirConfigCategories() : null;
            const pondSel = cats?.selection?.ponderation;
            const pondObl = cats?.obligatoires?.ponderation;
            const nbSelARetenir = cats?.selection?.nombreARetenir;
            const erreurPond = (pondSel == null || pondObl == null);

            const listeSelection = selection.length
                ? '<ul class="note-finale-liste-artefacts">' + selection.map(renderLigneRetenu).join('') + '</ul>'
                : '<span class="note-finale-non-evalue">' + accordTermeProduction('aucun', 1, true) + ' ' + obtenirTermeProduction('singulier') + ' ' + accordTermeProduction('retenu', 1) + '</span>';
            const listeObligatoires = obligatoiresTous.length
                ? '<ul class="note-finale-liste-artefacts">' + obligatoiresTous.map(renderLigneObligatoire).join('') + '</ul>'
                : '<span class="note-finale-non-evalue">Aucune production obligatoire configurée</span>';

            const badgePondSel = (pondSel != null) ? ` (${pondSel}%)` : '';
            const badgePondObl = (pondObl != null) ? ` (${pondObl}%)` : '';
            // Nombre d'obligatoires réellement évaluées (pas seulement définies),
            // sinon les non-remises sous-estimeraient à tort le pool de sélection.
            const obligatoiresEvaluees = obligatoiresTous.filter(o => typeof o.note === 'number').length;
            const evaluesSelection = Math.max(0, portfolio.nombreEvalues - obligatoiresEvaluees);
            const titreSelection = (nbSelARetenir != null
                ? `Sélection (les ${nbSelARetenir} meilleures sur ${evaluesSelection} évaluées)`
                : `Sélection (${selection.length} meilleures)`) + badgePondSel;
            const titreObligatoires = `Obligatoires (${obligatoiresTous.length} production${obligatoiresTous.length > 1 ? 's' : ''})` + badgePondObl;

            // Calcul de la moyenne de chaque catégorie + contribution pondérée.
            // Pour les obligatoires, les non-remises comptent comme 0 (règle UI
            // explicite : « Note = 0 si production non remise »), cohérent avec
            // _selectionnerArtefactsHybride. Pour la sélection, les non évalués
            // sont simplement ignorés (seules les meilleures comptent).
            // La contribution = moyenne × pondération / 100, exprimée en « points ».
            const calculCategorie = (items, ponderation, comptenonRemisCommeZero = false) => {
                const notes = items.map(i => {
                    if (typeof i.note === 'number') return i.note;
                    return comptenonRemisCommeZero ? 0 : null;
                }).filter(n => n !== null);
                if (notes.length === 0 || ponderation == null) return null;
                const somme = notes.reduce((s, n) => s + n, 0);
                const moyenne = somme / notes.length;
                return { notes, somme, moyenne, contribution: moyenne * ponderation / 100 };
            };
            const formaterCalcul = (calc, ponderation) => {
                if (!calc) return '';
                const addition = calc.notes.map(n => `${n.toFixed(1)}%`).join(' + ');
                return `(${addition}) ÷ ${calc.notes.length} = <strong>${calc.moyenne.toFixed(1)}%</strong>`
                     + ` × ${ponderation}% = <strong>${calc.contribution.toFixed(1)} pts</strong>`;
            };
            const calcSel = calculCategorie(selection, pondSel, false);
            const calcObl = calculCategorie(obligatoiresTous, pondObl, detailsNoteFinale.estFinale === true);
            const calculSelHtml = calcSel ? formaterCalcul(calcSel, pondSel) : `<span class="note-finale-ponderation">× ${pondSel != null ? pondSel + '%' : '—'}</span>`;
            const calculOblHtml = calcObl ? formaterCalcul(calcObl, pondObl) : `<span class="note-finale-ponderation">× ${pondObl != null ? pondObl + '%' : '—'}</span>`;

            const formule = erreurPond
                ? `<span class="note-finale-tiret">Pondérations Sélection/Obligatoires manquantes dans la configuration de la pratique.</span>`
                : (calcSel && calcObl
                    ? `Note finale = ${calcSel.contribution.toFixed(1)} pts + ${calcObl.contribution.toFixed(1)} pts = ${(calcSel.contribution + calcObl.contribution).toFixed(1)} %`
                    : `Note finale pondérée (Sélection ${pondSel}% + Obligatoires ${pondObl}% = ${pondSel + pondObl}%)`);

            htmlNoteFinale = `
            <!-- Note finale de session (hybride sans terminale) -->
            <div class="note-finale-section">
                <h3 class="note-finale-titre">
                    ${detailsNoteFinale.estFinale ? 'Note finale de session' : 'Note provisoire de session'}
                    ${(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique) ? `<span class="note-finale-pratique-nom" title="Pratique de notation appliquée pour ce calcul">${echapperHtml(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique)}</span>` : ''}
                    ${detailsNoteFinale.pratiqueId ? `<button type="button" class="note-finale-lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Modifier le statut (provisoire / finale) et les pondérations dans les réglages de la pratique">Réglages de la pratique</button>` : ''}
                </h3>

                ${enteteBandeauPlafonnement}

                <div class="note-finale-grid">
                    <div class="note-finale-composante ${portfolio.plafonnement ? 'note-finale-composante-plafonnee' : ''}">
                        <div class="note-finale-composante-titre">${titreSelection}</div>
                        <div class="note-finale-artefacts">${listeSelection}</div>
                        <div class="note-finale-calcul-categorie">${calculSelHtml}</div>
                    </div>

                    <div class="note-finale-composante">
                        <div class="note-finale-composante-titre">${titreObligatoires}</div>
                        <div class="note-finale-artefacts">${listeObligatoires}</div>
                        <div class="note-finale-calcul-categorie">${calculOblHtml}</div>
                    </div>
                </div>

                <div class="note-finale-resultat">
                    <div class="note-finale-formule">${formule}</div>
                    <div class="note-finale-total ${detailsNoteFinale.noteFinale === null ? 'note-finale-tiret' : ''}">
                        ${detailsNoteFinale.noteFinale !== null ? detailsNoteFinale.noteFinale.toFixed(1) + '%' : '—'}
                    </div>
                </div>
            </div>
            `;
        } else {
            // ----- Mode classique : Portfolio (gauche) / Terminale (droite si présente) -----
            const listeArtefacts = retenusDecrits.length
                ? '<ul class="note-finale-liste-artefacts">' + retenusDecrits.map(renderLigneRetenu).join('') + '</ul>'
                : '<span class="note-finale-non-evalue">' + accordTermeProduction('aucun', 1, true) + ' ' + obtenirTermeProduction('singulier') + ' ' + accordTermeProduction('retenu', 1) + '</span>';

            const carteTerminale = terminal.present ? `
                <div class="note-finale-composante">
                    <div class="note-finale-composante-titre">${echapperHtml(terminal.nom)}</div>
                    <div class="note-finale-artefacts">
                        ${terminal.niveau ? `Niveau atteint : <strong>${echapperHtml(terminal.niveau)}</strong>` : '<span class="note-finale-non-evalue">Non évaluée</span>'}
                    </div>
                    <div class="note-finale-valeur-ligne">
                        <span class="note-finale-valeur ${terminal.note === null ? 'note-finale-tiret' : ''}">
                            ${terminal.note !== null ? terminal.note.toFixed(1) + '%' : '—'}
                        </span>
                        <span class="note-finale-ponderation">× ${terminal.ponderationNormalisee}%</span>
                    </div>
                </div>` : '';

            const formuleClassique = terminal.present
                ? `Note finale pondérée (${portfolio.ponderationNormalisee}% + ${terminal.ponderationNormalisee}% = 100%)`
                : `Note finale (portfolio à 100%)`;

            htmlNoteFinale = `
            <!-- Note finale de session (classique) -->
            <div class="note-finale-section">
                <h3 class="note-finale-titre">
                    ${detailsNoteFinale.estFinale ? 'Note finale de session' : 'Note provisoire de session'}
                    ${(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique) ? `<span class="note-finale-pratique-nom" title="Pratique de notation appliquée pour ce calcul">${echapperHtml(detailsNoteFinale.pratiqueNom || detailsNoteFinale.pratique)}</span>` : ''}
                    ${detailsNoteFinale.pratiqueId ? `<button type="button" class="note-finale-lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Modifier le statut (provisoire / finale) et les pondérations dans les réglages de la pratique">Réglages de la pratique</button>` : ''}
                </h3>

                ${enteteBandeauPlafonnement}

                <div class="note-finale-grid${terminal.present ? '' : ' note-finale-grid-single'}">
                    <div class="note-finale-composante ${portfolio.plafonnement ? 'note-finale-composante-plafonnee' : ''}">
                        <div class="note-finale-composante-titre">
                            Portfolio (${portfolio.nombreRetenus} ${portfolio.methodeSelection} ${obtenirTermeProduction('pluriel')} sur ${portfolio.nombreEvalues} ${accordTermeProduction('evalue', portfolio.nombreEvalues)})
                        </div>
                        <div class="note-finale-artefacts">${listeArtefacts}</div>
                        ${portfolio.plafonnement ? `
                            <div class="note-finale-valeur-ligne">
                                <span class="note-finale-valeur">
                                    <span class="note-finale-valeur-originale">${portfolio.plafonnement.moyenneOriginale.toFixed(1)}%</span>
                                    → ${portfolio.moyenne !== null ? portfolio.moyenne.toFixed(1) + '%' : '0%'}
                                </span>
                                <span class="note-finale-ponderation">× ${portfolio.ponderationNormalisee}%</span>
                            </div>
                        ` : `
                            <div class="note-finale-valeur-ligne">
                                <span class="note-finale-valeur">
                                    ${portfolio.moyenne !== null ? portfolio.moyenne.toFixed(1) + '%' : '<span class="note-finale-tiret">—</span>'}
                                </span>
                                <span class="note-finale-ponderation">× ${portfolio.ponderationNormalisee}%</span>
                            </div>
                        `}
                    </div>
                    ${carteTerminale}
                </div>

                <div class="note-finale-resultat">
                    <div class="note-finale-formule">${formuleClassique}</div>
                    <div class="note-finale-total ${detailsNoteFinale.noteFinale === null ? 'note-finale-tiret' : ''}">
                        ${detailsNoteFinale.noteFinale !== null ? detailsNoteFinale.noteFinale.toFixed(1) + '%' : '—'}
                    </div>
                    ${detailsNoteFinale.estProvisoire && terminal.present ? '<div class="note-finale-message-provisoire">Basée uniquement sur le portfolio (évaluation terminale non complétée)</div>' : ''}
                </div>
            </div>
            `;
        }
    }

    // Générer le HTML (productions d'abord, puis note finale)
    return `
        <!-- Tableau des productions -->
        <div class="profil-carte">
            <h3 style="color: var(--accent-primaire); margin: 0 0 15px 0;">Liste des productions</h3>
            <div style="overflow-x: auto;">
                <table class="tableau">
                    <thead>
                        <tr>
                            <th>Production</th>
                            <th>Description</th>
                            <th data-tooltip="profil-col-jeton">Jeton</th>
                            <th style="text-align: center;">Note</th>
                            <th style="text-align: center;">Date</th>
                            <th style="text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lignes.map(ligne => {
                            // Générer le badge jeton si applicable
                            let badgeJeton = '';
                            if (ligne.badgeType === 'remplacee') {
                                badgeJeton = '<span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Remplacée</span><span class="badge-jeton-numero badge-jeton-numero-reprise">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'reprise-ciblee') {
                                badgeJeton = '<span class="badge-jeton-reprise-ciblee-wrapper"><span class="badge-jeton-titre">Reprise ciblée</span><span class="badge-jeton-numero badge-jeton-numero-reprise-ciblee">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'nouvelle-reprise') {
                                badgeJeton = '<span class="badge-jeton-reprise-wrapper"><span class="badge-jeton-titre">Reprise</span><span class="badge-jeton-numero badge-jeton-numero-reprise">' + ligne.indexArtefact + '</span></span>';
                            } else if (ligne.badgeType === 'delai') {
                                badgeJeton = '<span class="badge-jeton-delai-wrapper"><span class="badge-jeton-titre">Délai</span><span class="badge-jeton-numero badge-jeton-numero-delai">' + ligne.indexArtefact + '</span></span>';
                            }

                            return `
                            <tr style="border-bottom: 1px solid var(--bordure-claire);">
                                <td class="profil-tableau-cellule-p12">
                                    ${echapperHtml(ligne.production)}
                                </td>
                                <td style="padding: 12px; color: var(--gris-moyen);">${echapperHtml(ligne.description)}</td>
                                <td class="profil-tableau-cellule-p12">
                                    ${badgeJeton}
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    ${(ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard')
                                        ? '<span class="badge-non-remis-wrapper"><span class="badge-jeton-titre">Non remis</span></span>'
                                        : (ligne.estNonRecevable
                                            ? `<span class="badge-non-recevable-wrapper" title="${ligne.statutIntegrite === 'plagiat' ? 'Plagiat détecté' : 'Utilisation IA non autorisée'}"><span class="badge-jeton-titre">Non recevable</span></span>`
                                            : (ligne.statut === 'evalue'
                                                ? `<strong>${ligne.note}</strong>`
                                                : '<span class="badge-non-remis-wrapper"><span class="badge-jeton-titre">Non remis</span></span>'))
                                    }
                                </td>
                                <td style="padding: 12px; text-align: center; color: var(--gris-moyen);">${ligne.date}</td>
                                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                    ${(ligne.statutRemise === 'non-remis' || ligne.statutRemise === 'retard')
                                        ? `
                                        <button class="btn btn-principal btn-compact"
                                                data-action="evaluerProduction" data-param="${da}" data-param2="${ligne.productionId}">
                                            Évaluer
                                        </button>
                                        `
                                        : (ligne.statut === 'evalue'
                                            ? `
                                            <button class="btn btn-secondaire btn-compact"
                                                    data-action="consulterEvaluation" data-param="${da}" data-param2="${ligne.productionId}">
                                                Consulter
                                            </button>
                                            `
                                            : `
                                            <button class="btn btn-principal btn-compact"
                                                    data-action="evaluerProduction" data-param="${da}" data-param2="${ligne.productionId}">
                                                Évaluer
                                            </button>
                                            `)
                                    }
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ${htmlNoteFinale}
    `;
}

/**
 * Génère le tableau des objectifs d'apprentissage avec leurs performances
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {string} ensembleId - ID de l'ensemble d'objectifs
 * @param {Object} noteFinaleMultiObjectifs - Résultats du calcul par pratique multi-objectifs
 * @returns {string} - HTML du tableau
 */
function genererTableauObjectifs(da, ensembleId, noteFinaleMultiObjectifs) {
    // Charger l'ensemble d'objectifs
    const ensembles = chargerEnsemblesObjectifs();
    const ensemble = ensembles.find(e => e.id === ensembleId);

    if (!ensemble) {
        return '<p style="color: var(--gris-clair);">Ensemble d\'objectifs introuvable</p>';
    }

    const performances = noteFinaleMultiObjectifs.performances || {};
    const noteFinale = noteFinaleMultiObjectifs.noteFinale || 0;

    // Calculer forces et défis
    const seuil = obtenirSeuil('defiSpecifique') || 0.75;
    let forces = [];
    let defis = [];

    ensemble.objectifs.forEach(obj => {
        const perf = performances[obj.id];
        if (perf && perf.P !== null && perf.P >= seuil * 100) {
            forces.push({ ...obj, P: perf.P });
        } else if (perf && perf.P !== null && perf.P < seuil * 100) {
            defis.push({ ...obj, P: perf.P });
        }
    });

    // Couleurs par type
    const couleurType = {
        'fondamental': 'var(--bleu-clair)',      // Bleu
        'integrateur': 'var(--orange-accent)',      // Orange
        'transversal': '#9C27B0'       // Violet (pas de variable définie)
    };

    return `
        <!-- Note finale pratique multi-objectifs -->
        <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <div class="u-texte-09 u-texte-gris" style="margin-bottom: 5px;">
                Note finale pondérée (${noteFinaleMultiObjectifs.nbObjectifsEvalues}/${ensemble.objectifs.length} objectifs évalués)
            </div>
            <div style="font-size: 3rem; font-weight: bold; color: ${obtenirCouleurIndice(noteFinale)};">
                ${noteFinale.toFixed(1)}/100
            </div>
            <div class="u-texte-mini u-texte-gris-clair" style="margin-top: 5px;">
                Σ(P_objectif × poids) / 100
            </div>
        </div>

        <!-- Résumé forces et défis -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: var(--vert-pale, #e8f5e9); padding: 15px; border-radius: 6px; border-left: 4px solid var(--vert-succes);">
                <div style="font-weight: bold; color: var(--vert-succes); margin-bottom: 5px;">Forces (≥ ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--vert-succes);">${forces.length}</div>
                ${forces.length > 0 ? `<div class="u-texte-mini u-texte-gris" style="margin-top: 5px;">${forces.map(f => f.nom).join(', ')}</div>` : ''}
            </div>
            <div style="background: var(--orange-pale, #fff3e0); padding: 15px; border-radius: 6px; border-left: 4px solid var(--orange-accent);">
                <div style="font-weight: bold; color: var(--orange-accent); margin-bottom: 5px;">Défis (< ${(seuil * 100).toFixed(0)}%)</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--orange-accent);">${defis.length}</div>
                ${defis.length > 0 ? `<div class="u-texte-mini u-texte-gris" style="margin-top: 5px;">${defis.map(d => d.nom).join(', ')}</div>` : ''}
            </div>
        </div>

        <!-- Tableau détaillé des objectifs -->
        <h4 class="profil-section-titre-large" style="margin-bottom: 15px;">
            Détail des ${ensemble.objectifs.length} objectifs d'apprentissage
        </h4>

        <div style="background: var(--surface-conteneur, #142428); border-radius: 6px; overflow: hidden;">
            <table class="tableau-objectifs-profil">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 40%;">Objectif</th>
                        <th style="text-align: center; width: 15%;">Type</th>
                        <th style="text-align: center; width: 10%;">Poids</th>
                        <th style="text-align: center; width: 15%;">Performance</th>
                        <th style="text-align: center; width: 10%;">Niveau</th>
                        <th style="text-align: center; width: 10%;">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${ensemble.objectifs.map(obj => {
                        const perf = performances[obj.id];
                        const P = perf?.P ?? null;
                        const nbArtefacts = perf?.nbArtefacts ?? 0;

                        let niveau = '—';
                        let couleurNiveau = 'var(--gris-clair)';
                        let couleurStatut = 'var(--gris-clair)';
                        let labelStatut = 'Non évalué';

                        if (P !== null) {
                            // Convertir en niveau IDME
                            niveau = obtenirNiveauIDMEDepuisPourcentage(P);
                            couleurNiveau = obtenirCouleurNiveauIDME(niveau);

                            // Déterminer statut
                            if (P >= seuil * 100) {
                                couleurStatut = 'var(--vert-succes)';
                                labelStatut = 'Force';
                            } else {
                                couleurStatut = 'var(--orange-accent)';
                                labelStatut = 'Défi';
                            }
                        }

                        const couleurBordure = couleurType[obj.type] || '#999';

                        return `
                            <tr style="border-left: 4px solid ${couleurBordure};">
                                <td style="padding: 12px;">
                                    <div style="font-weight: bold; margin-bottom: 3px;">${echapperHtml(obj.nom)}</div>
                                    ${nbArtefacts > 0 ? `<div class="u-texte-mini u-texte-gris">${nbArtefacts} ${obtenirTermeProduction(nbArtefacts > 1 ? 'pluriel' : 'singulier')}</div>` : ''}
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <span style="
                                        display: inline-block;
                                        padding: 4px 10px;
                                        border-radius: 4px;
                                        font-size: 0.85rem;
                                        font-weight: bold;
                                        background: ${couleurBordure}22;
                                        color: ${couleurBordure};
                                        border: 1px solid ${couleurBordure}66;
                                    ">
                                        ${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                                    </span>
                                </td>
                                <td style="text-align: center; padding: 12px; font-weight: bold; font-size: 1.1rem;">
                                    ${obj.poids}%
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    ${P !== null ? `
                                        <div style="font-size: 1.3rem; font-weight: bold; color: ${obtenirCouleurIndice(P)};">
                                            ${P.toFixed(1)}%
                                        </div>
                                    ` : `<span style="color: var(--gris-clair);">--</span>`}
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <!-- BETA 96.1: Bulle avec effet 3D -->
                                    <span class="bulle-niveau-tableau">
                                        ${niveau}
                                    </span>
                                </td>
                                <td style="text-align: center; padding: 12px;">
                                    <span class="pastille-rai" style="background:${couleurStatut}"></span>
                                    <div style="font-size: 0.75rem; color: ${couleurStatut}; font-weight: bold;">
                                        ${labelStatut}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Légende -->
        <div style="background: var(--surface-conteneur, #142428); padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 0.85rem; color: var(--gris-moyen);">
            <div style="margin-bottom: 10px;"><strong>Légende types :</strong></div>
            <div class="u-flex-gap-15">
                <div><span style="color: ${couleurType.fondamental}; font-weight: bold;">●</span> Fondamental : Concepts de base</div>
                <div><span style="color: ${couleurType.integrateur}; font-weight: bold;">●</span> Intégrateur : Compétences complexes</div>
                <div><span style="color: ${couleurType.transversal}; font-weight: bold;">●</span> Transversal : Habiletés générales</div>
            </div>
            <div style="margin-top: 10px;">
                <strong>Formule :</strong> Note finale = Σ(Performance_objectif × Poids) / 100
            </div>
        </div>
    `;
}

/**
 * Génère la section Progression temporelle avec graphiques Chart.js
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {string} HTML de la section
 */
/**
 * Génère le HTML du bandeau contextuel (trimestre | cours) pour les graphiques profil
 * Note : pas d'effectif ici — c'est un profil individuel, pas un groupe
 * @returns {string} HTML du bandeau ou chaîne vide si préférence désactivée
 */
function genererBandeauContexteProfil() {
    // Vérifier la préférence
    const afficher = obtenirPreference('afficherContexteGraphiques') !== false;
    if (!afficher) return '';

    // Trimestre
    let nomTrimestre = '';
    if (typeof obtenirTrimestreActif === 'function') {
        const trimestre = obtenirTrimestreActif();
        if (trimestre) {
            const sessionLower = trimestre.session?.toLowerCase();
            if (sessionLower === 'd') {
                nomTrimestre = 'Démo';
            } else {
                const sessionNom = { 'hiver': 'Hiver', 'automne': 'Automne', 'ete': 'Été', 'h': 'Hiver', 'a': 'Automne', 'e': 'Été' }[sessionLower] || trimestre.session || '';
                nomTrimestre = `${sessionNom} ${trimestre.annee || ''}`.trim();
            }
        }
    }

    // Cours
    const infoCours = db.getSync('infoCours', null);
    let nomCours = '';
    if (infoCours) {
        const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
        const groupe = infoCours.groupe || '';
        if (sigle && groupe) {
            const modeActif = db.getSync('modeApplication', 'normal');
            const groupeAffiche = (modeActif === 'anonymisation' && typeof anonymiserGroupe === 'function')
                ? anonymiserGroupe(groupe)
                : `gr. ${groupe}`;
            nomCours = `${sigle} ${groupeAffiche}`;
        } else if (sigle) {
            nomCours = sigle;
        }
    }

    return `<span style="margin-left: auto; display: flex; gap: 8px; align-items: center; font-size: 0.78rem; color: var(--texte-muted);">
        <span>${nomTrimestre || '—'}</span>
        <span>|</span>
        <span>${nomCours || '—'}</span>
    </span>`;
}

function genererSectionProgression(da) {
    if (typeof obtenirPreference === 'function' && obtenirPreference('afficherGraphiques') === false) {
        return '';
    }
    // Vérifier si le module de captures existe
    if (typeof obtenirSnapshotsEtudiant !== 'function') {
        return `
            <div class="profil-zone-moyenne-bleu">
                <p class="u-texte-gris" style="font-size: 0.95rem;">
                    Le module de captures n'est pas encore initialisé.
                </p>
                <p class="u-texte-gris-clair u-mt-10" style="font-size: 0.85rem;">
                    Les graphiques de progression seront disponibles une fois que des données auront été collectées.
                </p>
            </div>
        `;
    }

    // Récupérer les captures de l'étudiant
    const snapshots = obtenirSnapshotsEtudiant(da);

    // Vérifier s'il y a des données
    if (!snapshots || snapshots.length === 0) {
        return `
            <div class="profil-zone-moyenne-bleu">
                <h4 class="profil-section-titre-large" style="margin-bottom: 15px;">
                    Aucune donnée de progression disponible
                </h4>
                <p class="u-texte-gris u-mb-10" style="font-size: 0.95rem;">
                    Les graphiques de progression afficheront l'évolution temporelle des indices A-C-P-E une fois que des données auront été collectées.
                </p>
                <p class="u-texte-gris-clair" style="font-size: 0.85rem;">
                    Les captures sont enregistrées automatiquement chaque semaine et lors d'interventions RàI complétées.
                </p>
            </div>
        `;
    }

    // Générer un ID unique pour le canvas
    const canvasId = `graphique-progression-${da}`;

    // ✨ AMÉLIORATION (8 déc 2025) : Lire dynamiquement l'échelle de performance configurée
    const echelles = db.getSync('echellesTemplates', []);
    const echelleActive = echelles.find(e => e.active) || echelles[0];

    let texteZones = 'Zones colorées basées sur l\'échelle IDME par défaut';
    if (echelleActive && echelleActive.niveaux && echelleActive.niveaux.length > 0) {
        texteZones = echelleActive.niveaux.map(niveau => {
            const nom = niveau.nom;
            const min = niveau.min;
            const max = niveau.max;

            if (min === 0) {
                return `${nom} < ${max}%`;
            } else if (max === 100) {
                return `${nom} ≥ ${min}%`;
            } else {
                return `${nom} ${min}-${max}%`;
            }
        }).join(', ');
    }

    // Vérifier si l'étudiant a des jetons de reprise (pour afficher la checkbox)
    let aDesJetonsReprise = false;
    try {
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        aDesJetonsReprise = evaluations.some(e =>
            e.etudiantDA === da && !e.remplaceeParId &&
            (e.jetonRepriseApplique || e.repriseDeId ||
             e.jetonRepriseCibleeApplique || e.repriseDeIdCiblee)
        );
    } catch (e) { console.warn('[Profil] jetons reprise detection skipped:', e.message || e); }

    // Créer le HTML avec le canvas
    const checkboxSansReprises = aDesJetonsReprise ? `
                <label style="display: inline-flex; align-items: center; gap: 5px; cursor: pointer; color: var(--vert-succes); font-size: 0.85rem; margin-left: 8px;">
                    <input type="checkbox" checked data-on-change="togglePSansReprisesIndivHandler" data-da="${da}">
                    <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="var(--vert-succes)" stroke-width="1.5" stroke-dasharray="4 2"/></svg>
                    P sans reprises
                </label>` : '';

    const html = `
        <div class="profil-zone-moyenne-bleu">
            <!-- Légende des indices -->
            <div style="background: var(--surface-conteneur, #142428); padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="font-weight: 600; color: var(--gris-fonce);">Indices :</span>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #1976D2; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Assiduité (A)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #1976D2; border-radius: 50%; display: inline-block;"></span>
                    Assiduité (A)
                </label>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #FF6B35; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Complétion (C)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #FF6B35; border-radius: 50%; display: inline-block;"></span>
                    Complétion (C)
                </label>
                <label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: #4CAF50; font-size: 0.78rem;">
                    <input type="checkbox" checked data-on-change="toggleIndiceIndivHandler" data-label="Performance (P)" data-da="${da}">
                    <span style="width: 10px; height: 10px; background: #4CAF50; border-radius: 50%; display: inline-block;"></span>
                    Performance (P)
                </label>
                ${checkboxSansReprises}
                ${genererBandeauContexteProfil()}
            </div>

            <!-- Canvas pour le graphique Chart.js -->
            <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
                <canvas id="${canvasId}"></canvas>
            </div>
        </div>
    `;

    // Utiliser setTimeout pour créer le graphique après l'insertion du DOM
    setTimeout(() => {
        if (typeof creerGraphiqueIndividuel === 'function') {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                creerGraphiqueIndividuel(canvasId, da);
            }
        }
    }, 100);

    return html;
}

/**
 * Variable globale pour suivre quel indice est actuellement affiché
 */
let indiceActif = null;

/**
 * Toggle l'affichage des détails d'un indice avec lien visuel + grisage des autres cartes
 * MODIFIÉ : Le case 'P' affiche maintenant le portfolio complet
 */
/**
 * Toggle l'affichage des détails d'un indice
 * MODIFIÉ : Case 'C' supprimé, case 'P' affiche portfolio avec stats C et P
 */
function toggleDetailIndice(indice, da) {
    const panneau = document.getElementById('panneau-details-indice');
    const contenu = document.getElementById('contenu-detail-indice');

    if (!panneau || !contenu) {
        console.error('❌ Éléments du panneau de détails introuvables');
        return;
    }

    // Si on clique sur le même indice, fermer
    if (indiceActif === indice && !panneau.classList.contains('u-hide')) {
        fermerDetailIndice();
        return;
    }

    // Mettre à jour l'indice actif
    indiceActif = indice;

    // GRISER toutes les cartes sauf celle active
    const toutesLesCartes = ['A', 'C', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            if (ind === indice) {
                carte.style.opacity = '1';
                carte.style.filter = 'none';
            } else {
                carte.style.opacity = '0.4';
                carte.style.filter = 'grayscale(50%)';
            }
        }
    });

    // Récupérer la couleur de la carte cliquée
    const carteCliquee = document.getElementById(`carte-indice-${indice}`);
    let couleurBordure = 'var(--accent-primaire)';
    if (carteCliquee) {
        const style = window.getComputedStyle(carteCliquee);
        couleurBordure = style.borderColor;
    }

    // Appliquer la couleur de bordure au panneau
    panneau.style.borderTopColor = couleurBordure;
    panneau.style.borderTopWidth = '4px';

    // Générer le contenu selon l'indice
    let html = '';
    switch (indice) {
        case 'A':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    Assiduité détaillée
                </h3>
                ${genererSectionAssiduite(da)}
            `;
            break;
        case 'C':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    Complétion détaillée
                </h3>
                ${genererSectionCompletion(da)}
            `;
            break;
        case 'P':
            html = `
                ${genererSectionPerformance(da)}
            `;
            break;
        case 'M':
            html = `
                <h3 class="profil-titre-bleu-large-pr40">
                    Mobilisation détaillée
                </h3>
                ${genererSectionMobilisation(da)}
            `;
            break;
    }

    contenu.innerHTML = html;
    panneau.classList.remove('u-hide');

    // Scroll smooth vers le panneau
    setTimeout(() => {
        panneau.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Ferme le panneau de détails
 * MODIFIÉ : Liste des cartes mise à jour sans C
 */
function fermerDetailIndice() {
    const panneau = document.getElementById('panneau-details-indice');
    if (panneau) {
        panneau.classList.add('u-hide');
        indiceActif = null;
    }

    // RETIRER le grisage de toutes les cartes (liste mise à jour)
    const toutesLesCartes = ['A', 'P', 'M', 'E', 'R'];
    toutesLesCartes.forEach(ind => {
        const carte = document.getElementById(`carte-indice-${ind}`);
        if (carte) {
            carte.style.opacity = '1';
            carte.style.filter = 'none';
        }
    });
}


/**
 * Génère le HTML de la section Complétion détaillée
 *
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
function genererSectionCompletion(da) {
    const productions = obtenirDonneesSelonMode('productions') || [];
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const artefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    // Identifier les artefacts-portfolio réellement donnés
    const artefactsPortfolioIds = new Set(artefactsPortfolio.map(a => a.id));
    const artefactsDonnes = [];

    evaluations.forEach(evaluation => {
        if (artefactsPortfolioIds.has(evaluation.productionId)) {
            if (!artefactsDonnes.find(a => a.id === evaluation.productionId)) {
                const production = artefactsPortfolio.find(p => p.id === evaluation.productionId);
                if (production) {
                    artefactsDonnes.push(production);
                }
            }
        }
    });

    // Récupérer les évaluations de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

    // Construire la liste des artefacts avec leur statut
    const artefacts = artefactsDonnes.map(art => {
        // Trouver l'évaluation ACTIVE (non remplacée) pour cette production
        const evaluationsProduction = evaluationsEleve.filter(e => e.productionId === art.id);
        let evaluation = null;
        if (evaluationsProduction.length > 0) {
            // PRIORITÉ 1 : Chercher une reprise active (repriseDeId ET non remplacée)
            evaluation = evaluationsProduction.find(e => e.repriseDeId && !e.remplaceeParId);

            // PRIORITÉ 2 : Si pas de reprise, chercher une évaluation avec jeton de délai actif
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => e.jetonDelaiApplique && !e.remplaceeParId);
            }

            // PRIORITÉ 3 : Si pas de jeton, chercher toute évaluation active (non remplacée)
            if (!evaluation) {
                evaluation = evaluationsProduction.find(e => !e.remplaceeParId);
            }

            // PRIORITÉ 4 : Si toutes sont remplacées, prendre la première (cas rare)
            if (!evaluation) {
                evaluation = evaluationsProduction[0];
            }
        }

        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: !!evaluation,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            jetonReprise: evaluation?.repriseDeId ? true : false,
            jetonDelai: evaluation?.jetonDelaiApplique ? true : false
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return (a.description || a.titre).localeCompare(b.description || b.titre);
    });

    const nbTotal = artefacts.length;
    const nbRemis = artefacts.filter(a => a.remis).length;
    const indices = calculerTousLesIndices(da);

    // Interprétation de la complétion
    const interpC = interpreterCompletion(indices.C);

    // Séparer artefacts remis et non remis
    const artefactsRemis = artefacts.filter(a => a.remis);
    const artefactsNonRemis = artefacts.filter(a => !a.remis);

    return `
        <!-- ENCADRÉ UNIQUE: COMPLÉTION -->
        <div class="profil-carte-bordure-blanche">

            <h3 class="profil-titre-section-majeur">
                COMPLÉTION
            </h3>

            <!-- Badge avec interprétation -->
            <div class="u-mb-15">
                <span class="pastille-rai" style="background:${interpC.couleur}"></span>
                <strong style="font-size: 1.1rem; color: ${interpC.couleur};">${interpC.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpC.couleur}; margin-left: 10px;">(${indices.C}%)</span>
            </div>

            <!-- Statistiques -->
            <ul class="profil-liste-simple">
                <li><strong>• Artefacts remis :</strong> ${nbRemis}/${nbTotal}</li>
                <li><strong>• Indice C :</strong> ${indices.C}%</li>
            </ul>

            <hr class="profil-separateur">

            <!-- Gestion des jetons (placeholder) -->
            <h4 class="profil-titre-sous-section">
                GESTION DES JETONS
            </h4>
            <div style="background: var(--alerte-fond-attention); border: 2px dashed var(--btn-annuler); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 1.2rem; color: var(--alerte-texte-attention); margin-bottom: 10px;">
                    <strong>Jetons disponibles :</strong> 2 / 2
                </div>
                <div class="profil-texte-italique-gris">
                    Système de jetons (reprise/délai) à implémenter
                </div>
            </div>

            <hr class="profil-separateur">

            <!-- Artefacts remis -->
            <h4 class="profil-titre-sous-section">
                ${obtenirTermeProduction('pluriel', true).toUpperCase()} ${accordTermeProduction('remis', artefactsRemis.length).toUpperCase()} (${artefactsRemis.length})
            </h4>
            ${artefactsRemis.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${artefactsRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: var(--vert-pale, #d4edda); border-left: 3px solid var(--vert-succes);">
                            <div style="color: var(--alerte-texte-succes); font-weight: 500; margin-bottom: 5px;">
                                ${echapperHtml(art.description)}
                                ${art.jetonReprise ? '<span style="color: #9c27b0; margin-left: 6px;" title="Jeton de reprise appliqué">★</span>' : ''}
                                ${art.jetonDelai ? '<span style="color: #ff6f00; margin-left: 6px;" title="Jeton de délai appliqué">★</span>' : ''}
                            </div>
                            <div class="profil-texte-detail">
                                <strong>${art.note}</strong>${art.niveau ? ` · ${art.niveau}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="profil-zone-centre-grise">
                    ${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('remis', 1)}
                </div>
            `}

            <!-- Artefacts non remis -->
            <h4 class="profil-titre-sous-section">
                ${obtenirTermeProduction('pluriel', true).toUpperCase()} NON ${accordTermeProduction('remis', artefactsNonRemis.length).toUpperCase()} (${artefactsNonRemis.length})
            </h4>
            ${artefactsNonRemis.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${artefactsNonRemis.map(art => `
                        <div style="flex: 0 0 auto; min-width: 200px; max-width: 250px; padding: 12px;
                                    background: var(--gris-tres-pale); border-left: 3px solid var(--bordure-claire); opacity: 0.6;">
                            <div style="color: var(--gris-moyen); font-weight: 500; margin-bottom: 5px;">
                                ${echapperHtml(art.description)}
                            </div>
                            <div class="text-muted" style="font-size: 0.9rem;">Non remis</div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="profil-zone-centre-verte">
                    ${accordTermeProduction('tous', 2, true)} les ${obtenirTermeProduction('pluriel')} ont été ${accordTermeProduction('remis', 2)}.
                </div>
            `}

            <hr class="profil-separateur">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--texte-secondaire); font-style: italic;">
                Évolution temporelle de la complétion (à venir)
            </div>

        </div>
    `;
}


function _obtenirNiveauxEtGradientSRPNF() {
    const echelles = db.getSync('echellesTemplates', []);
    const echelleActive = echelles.find(e => e.active) || echelles[0];
    let niveaux = [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64, couleur: 'var(--orange-accent)' },
        { code: 'D', nom: 'Développement', min: 65, max: 74, couleur: 'var(--btn-annuler)' },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, couleur: 'var(--vert-succes)' },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, couleur: 'var(--bleu-clair)' }
    ];
    if (echelleActive && echelleActive.niveaux) {
        niveaux = echelleActive.niveaux.map(n => ({
            code: n.code, nom: n.nom, min: n.min, max: n.max, couleur: n.couleur
        }));
    }
    const gradientStops = [];
    niveaux.forEach((niveau, i) => {
        if (i === 0) {
            gradientStops.push(`${niveau.couleur} ${niveau.min}%`);
            if (i < niveaux.length - 1) {
                gradientStops.push(`${niveau.couleur} ${niveaux[i + 1].min - 2}%`);
            } else {
                gradientStops.push(`${niveau.couleur} ${niveau.max}%`);
            }
        } else if (i === niveaux.length - 1) {
            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
            gradientStops.push(`${niveau.couleur} ${niveau.max}%`);
        } else {
            gradientStops.push(`${niveau.couleur} ${niveau.min + 2}%`);
            gradientStops.push(`${niveau.couleur} ${niveaux[i + 1].min - 2}%`);
        }
    });
    return { niveaux, gradientCSS: `linear-gradient(to right, ${gradientStops.join(', ')})` };
}

function _calculerMoyennesComparativesSRPNF(da) {
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    return {
        moyennes: calculerMoyennesCriteres(da),
        directionsPAN: calculerDirectionsCriteres(da)
    };
}

function _nomCritereSRPNF(cle) {
    const noms = { structure: 'Structure', rigueur: 'Rigueur', plausibilite: 'Plausibilité', nuance: 'Nuance', francais: 'Français' };
    return noms[cle] || cle;
}

function _genererPointsBarreSRPNFNormal(cle, score, directionsPAN) {
    const pourcentage = Math.round(score * 100);
    const direction = directionsPAN ? directionsPAN[cle] : null;
    const symboleDirection = direction && direction.symbole ? direction.symbole : '';
    return {
        pointsHTML: `<div class="critere-point" style="left: ${Math.min(pourcentage, 100)}%;"></div>`,
        valeursHTML: `${pourcentage}%`,
        symbolesHTML: symboleDirection ? `<div style="position: absolute; left: ${Math.min(pourcentage, 100)}%; transform: translateX(-50%); top: -32px; font-size: 1.2rem; font-weight: bold; color: var(--gris-fonce);" title="${direction.interpretation}">${symboleDirection}</div>` : ''
    };
}

function _genererBarreCritereSRPNF(cle, contexte) {
    const { moyennes, directionsPAN, gradientCSS } = contexte;
    const score = moyennes?.[cle];
    if (typeof score !== 'number' || isNaN(score)) return '';

    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const parties = _genererPointsBarreSRPNFNormal(cle, score, directionsPAN);
    if (!parties) return '';
    const { pointsHTML, valeursHTML, symbolesHTML } = parties;
    return `
        <div class="critere-container">
            <div class="critere-header">
                <span class="critere-nom" style="min-width: 120px;">${_nomCritereSRPNF(cle)}</span>
                <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">
                    ${valeursHTML}
                </span>
            </div>
            <div class="critere-barre-gradient" style="background: ${gradientCSS};">
                ${symbolesHTML}
                ${pointsHTML}
            </div>
        </div>
    `;
}

function _genererBlocForcesDefisSRPNF(da) {
    const { niveaux, gradientCSS } = _obtenirNiveauxEtGradientSRPNF();
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const moyennesCtx = _calculerMoyennesComparativesSRPNF(da);
    const contexte = { ...moyennesCtx, gradientCSS };

    const barresHTML = ['structure', 'rigueur', 'plausibilite', 'nuance', 'francais']
        .map(cle => _genererBarreCritereSRPNF(cle, contexte))
        .join('');

    const legendePositions = niveaux.map(n => ({ ...n, position: (n.min + n.max) / 2 }));
    const legendeHTML = `
        <div class="legende-idme-container">
            ${legendePositions.map(item => `
                <div class="legende-idme-item" style="left: ${item.position}%; color: ${item.couleur};">
                    <span class="legende-idme-code">${item.code}</span>
                    <span class="legende-idme-nom">${item.nom}</span>
                </div>
            `).join('')}
        </div>
    `;

    if (!barresHTML || barresHTML.trim() === '') {
        const grilleRef = obtenirGrilleReferenceDepistage();
        if (!grilleRef) {
            return `
                <div class="info-box info-box--attention" style="margin: 15px 0;">
                    <div style="display: flex; gap: 10px; align-items: start;">
                        <div style="flex: 1;">
                            <strong style="color: var(--alerte-texte-attention); display: block; margin-bottom: 5px;">Configuration requise</strong>
                            <p style="margin: 0; color: var(--alerte-texte-attention); font-size: 0.9rem; line-height: 1.5;">
                                Pour afficher les forces et défis par critère, tu dois configurer une grille de référence dans
                                <strong>Réglages → Pratique de notation → Grille de référence pour le dépistage</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
        return `
            <div class="info-box info-box--info" style="margin: 15px 0;">
                <div style="display: flex; gap: 10px; align-items: start;">
                    <div style="flex: 1;">
                        <strong style="color: var(--alerte-texte-information); display: block; margin-bottom: 5px;">Aucune donnée disponible</strong>
                        <p style="margin: 0; color: var(--alerte-texte-information); font-size: 0.9rem; line-height: 1.5;">
                            Cet·te étudiant·e n'a pas encore d'évaluations complétées avec des critères correspondant à la grille de référence.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    return barresHTML + legendeHTML;
}

function _genererGraphiqueCriteresHTML(da) {
    if (typeof creerGraphiqueCriteres !== 'function') {
        console.error(`[DEBUG Graphique Critères] Fonction creerGraphiqueCriteres non disponible`);
        return '';
    }
    const canvasIdCriteres = `graphique-criteres-${da}`;
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evaluationsAvecCriteres = evaluations.filter(e =>
        e.etudiantDA === da &&
        !e.remplaceeParId &&
        e.criteres &&
        Array.isArray(e.criteres) &&
        e.criteres.length > 0
    );
    if (evaluationsAvecCriteres.length === 0) return '';

    // Critères uniques pour la légende
    const criteresSet = new Set();
    evaluationsAvecCriteres.forEach(e => {
        e.criteres.forEach(c => {
            if (c.critereNom) criteresSet.add(c.critereNom);
        });
    });
    const criteresUniques = Array.from(criteresSet).sort();
    const COULEURS_CRITERES = [
        '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4',
        '#4CAF50', '#FF9800', '#795548', '#607D8B'
    ];
    const legendeHTML = criteresUniques.map((critere, index) => {
        const couleur = COULEURS_CRITERES[index % COULEURS_CRITERES.length];
        const critereEscaped = critere.replace(/'/g, "\\'");
        return `<label style="display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: ${couleur}; font-size: 0.78rem;">
            <input type="checkbox" checked data-on-change="toggleCritereIndivHandler" data-critere="${critereEscaped}" data-da="${da}">
            <span style="width: 10px; height: 10px; background: ${couleur}; border-radius: 50%; display: inline-block;"></span>
            ${critere}
        </label>`;
    }).join('');

    // setTimeout pour créer le graphique après insertion DOM
    setTimeout(() => {
        const canvas = document.getElementById(canvasIdCriteres);
        if (canvas) {
            creerGraphiqueCriteres(canvasIdCriteres, da);
        } else {
            console.error(`[DEBUG Graphique Critères] Canvas #${canvasIdCriteres} introuvable dans le DOM`);
        }
    }, 100);

    return `
        <div class="profil-zone-moyenne-bleu" style="margin-bottom: 20px;">
            <!-- Légende des critères -->
            <div style="background: var(--surface-conteneur, #142428); padding: 12px 20px; border-radius: 6px; margin-bottom: 10px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <span style="font-weight: 600; color: var(--gris-fonce);">Critères :</span>
                ${legendeHTML}
                ${genererBandeauContexteProfil()}
            </div>

            <!-- Canvas pour le graphique Chart.js -->
            <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
                <canvas id="${canvasIdCriteres}"></canvas>
            </div>
        </div>
    `;
}

function _genererTexteRegleSelectionPortfolio(portfolioActifRapport, methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport) {
    if (!portfolioActifRapport) {
        return 'Portfolio désactivé — Les productions sont évaluées de manière indépendante';
    }
    if (methodeSelectionRapport === 'hybride-categories') {
        const pondSel = configCategoriesRapport?.selection?.ponderation || 65;
        const pondObl = configCategoriesRapport?.obligatoires?.ponderation || 35;
        return `Mode <strong>Hybride</strong> : les <strong>${nombreARetenirConfig} meilleures</strong> du pool Sélection (${pondSel}%) + toutes les Obligatoires (${pondObl}%)`;
    }
    const textes = {
        'meilleurs': `Les <strong>${nombreARetenirConfig} meilleures productions</strong> sont retenues pour le calcul de l'indice P (note maximale atteinte)`,
        'recents': `Les <strong>${nombreARetenirConfig} plus récentes productions</strong> sont retenues pour le calcul de l'indice P (niveau terminal actuel)`,
        'recents-meilleurs': `Les <strong>${nombreARetenirConfig} plus récentes productions parmi les 50% meilleures</strong> sont retenues pour le calcul de l'indice P (approche hybride)`,
        'tous': `<strong>Toutes les productions</strong> sont retenues pour le calcul de l'indice P (calcul de type sommative)`
    };
    return textes[methodeSelectionRapport] || textes['meilleurs'];
}

function _genererTextePonderationCriteresActifs() {
    const grilles = db.getSync('grillesTemplates', []);
    const grilleActive = grilles.find(g => g.active) || grilles[0];
    if (grilleActive && grilleActive.criteres) {
        const ponderations = grilleActive.criteres
            .map(c => `${echapperHtml(c.nom)}: ${c.ponderation || 0}%`)
            .join(', ');
        return `Pondération des critères configurés dans la grille «${echapperHtml(grilleActive.nom)}» (${ponderations})`;
    }
    return 'Pondération des critères déterminée dans les réglages';
}

function _genererTextePerformanceMethodeBloc(portfolioActifRapport, methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport) {
    if (!portfolioActifRapport) {
        return 'Performance des productions indépendantes';
    }
    if (methodeSelectionRapport === 'hybride-categories') {
        const pondSel = configCategoriesRapport?.selection?.ponderation || 65;
        const pondObl = configCategoriesRapport?.obligatoires?.ponderation || 35;
        return `Performance du portfolio actuel (${nombreARetenirConfig} meilleures Sélection ${pondSel}% + Obligatoires ${pondObl}%)`;
    }
    // Textes selon la modalité de sélection (format uniforme avec section Engagement)
    const textesPerformance = {
        'meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} meilleur${nombreARetenirConfig > 1 ? 's' : ''}, maîtrise de standards)`,
        'recents': `Performance du portfolio actuel (${nombreARetenirConfig} plus récent${nombreARetenirConfig > 1 ? 's' : ''}, niveau terminal)`,
        'recents-meilleurs': `Performance du portfolio actuel (${nombreARetenirConfig} récent${nombreARetenirConfig > 1 ? 's' : ''} parmi les meilleurs, hybride)`,
        'tous': `Performance du portfolio actuel (${accordTermeProduction('tous', 2)} les ${obtenirTermeProduction('pluriel')}, moyenne complète)`
    };
    return textesPerformance[methodeSelectionRapport] || textesPerformance['meilleurs'];
}

function _appliquerSelectionAutoArtefacts(da, portfolio, artefacts, selectionEleve, selectionsPortfolios, nombreARetenir) {
    if (selectionEleve.artefactsRetenus.length !== 0) return;
    const artefactsRemisAvecNote = artefacts
        .filter(a => a.remis && a.note !== null)
        .sort((a, b) => b.note - a.note);
    const meilleurs = artefactsRemisAvecNote.slice(0, nombreARetenir);
    if (meilleurs.length === 0) return;

    selectionEleve.artefactsRetenus = meilleurs.map(a => a.id);
    if (!selectionsPortfolios[da]) selectionsPortfolios[da] = {};
    selectionsPortfolios[da][portfolio.id] = {
        artefactsRetenus: selectionEleve.artefactsRetenus,
        dateSelection: new Date().toISOString(),
        auto: true
    };
    db.setSync(cle('portfoliosEleves'), selectionsPortfolios);

    // Recalculer les indices C et P après sélection automatique
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    }
    // Mettre à jour le flag retenu
    artefacts.forEach(art => {
        art.retenu = selectionEleve.artefactsRetenus.includes(art.id);
    });
}

function _calculerIndicesPerformance(da) {
    // Session C (#303) : mode comparatif retiré — indices de la pratique active.
    return { indices: calculerTousLesIndices(da) };
}

function _lireDetailsRapportPerformance(da, nombreARetenir, artefacts) {
    let methodeSelectionRapport = 'meilleurs';
    let portfolioActifRapport = true;
    let nombreARetenirConfig = nombreARetenir;

    // Détecter mode Hybride (source : pratiquesConfigurables)
    const configPratiqueRapport = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configCategoriesRapport = configPratiqueRapport?.categories
        || (typeof obtenirConfigCategories === 'function' ? obtenirConfigCategories() : null);
    const modeHybrideRapport = !!(configCategoriesRapport && configCategoriesRapport.actif);

    if (modeHybrideRapport) {
        methodeSelectionRapport = 'hybride-categories';
        nombreARetenirConfig = configCategoriesRapport.selection?.nombreARetenir || 4;
    } else if (configPratiqueRapport?.portfolio?.methodeSelection) {
        methodeSelectionRapport = configPratiqueRapport.portfolio.methodeSelection;
        if (methodeSelectionRapport === 'derniers') methodeSelectionRapport = 'recents';
        nombreARetenirConfig = configPratiqueRapport.portfolio.nombreARetenir || nombreARetenir;
    }

    let artefactsRetenus = [];
    let notesRetenues = [];
    let noteTop3 = null;

    if (typeof obtenirIndicesCP === 'function') {
        const indicesCP = obtenirIndicesCP(da);
        if (indicesCP && indicesCP.details) {
            const idsRetenus = indicesCP.details.artefactsRetenus || [];
            notesRetenues = indicesCP.details.notes || [];

            // Lire la config depuis indicesCP si disponible (fallback si pas hybride)
            if (!modeHybrideRapport) {
                methodeSelectionRapport = indicesCP.details.methodeSelection || 'meilleurs';
                portfolioActifRapport = indicesCP.details.portfolioActif !== false;
                nombreARetenirConfig = indicesCP.details.nombreARetenir || nombreARetenir;
            }

            // Récupérer les titres des artefacts retenus
            artefactsRetenus = idsRetenus.map(id => {
                const artefact = artefacts.find(a => a.id === id);
                const idx = idsRetenus.indexOf(id);
                return {
                    titre: artefact ? artefact.titre : 'Artefact inconnu',
                    note: notesRetenues[idx] || 0
                };
            });

            if (notesRetenues.length > 0) {
                const somme = notesRetenues.reduce((sum, note) => sum + note, 0);
                noteTop3 = (somme / notesRetenues.length).toFixed(1);
            }
        }
    }
    return {
        methodeSelectionRapport,
        portfolioActifRapport,
        nombreARetenirConfig,
        modeHybrideRapport,
        configCategoriesRapport,
        artefactsRetenus,
        notesRetenues,
        noteTop3
    };
}

function genererSectionPerformance(da) {
    if (typeof obtenirPreference === 'function' && obtenirPreference('afficherDeveloppementHabiletes') === false) {
        return '';
    }
    const graphiqueCriteres = _genererGraphiqueCriteresHTML(da);

    const productions = obtenirDonneesSelonMode('productions') || [];
    const portfolio = productions.find(p => p.type === 'portfolio');

    // Générer les barres SRPNF (indépendant du portfolio)
    const barresSRPNF = _genererBarresSRPNF(da);

    if (!portfolio) {
        return genererOngletsDeveloppement(da, {
            criteres: graphiqueCriteres,
            forcesDefis: barresSRPNF + genererBlocConsolidation(da),
            gestesCognitifs: genererConteneurGestesCognitifs(da)
        });
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    if (tousLesArtefactsPortfolio.length === 0) {
        return genererOngletsDeveloppement(da, {
            criteres: graphiqueCriteres,
            forcesDefis: barresSRPNF + genererBlocConsolidation(da),
            gestesCognitifs: genererConteneurGestesCognitifs(da)
        });
    }

    // ✅ CORRECTION : Identifier les artefacts RÉELLEMENT ÉVALUÉS
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productionsEvaluees = new Set();
    evaluations.forEach(evaluation => {
        productionsEvaluees.add(evaluation.productionId);
    });

    // ✅ Ne considérer QUE les artefacts qui ont été évalués (au moins 1 élève)
    const artefactsPortfolio = tousLesArtefactsPortfolio.filter(art => 
        productionsEvaluees.has(art.id)
    );

    // Récupérer les évaluations et sélections de l'élève
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);
    const selectionsPortfolios = obtenirDonneesSelonMode('portfoliosEleves') || {};
    const selectionEleve = selectionsPortfolios[da]?.[portfolio.id] || { artefactsRetenus: [] };

    // Construire la liste des artefacts (seulement ceux évalués)
    const artefacts = artefactsPortfolio.map(art => {
        const evaluation = evaluationsEleve.find(e => e.productionId === art.id);
        return {
            id: art.id,
            titre: art.titre,
            description: art.description || art.titre, // Utiliser description ou fallback sur titre
            remis: !!evaluation,
            note: evaluation?.noteFinale ?? null,  // Utiliser ?? pour supporter la note 0
            niveau: evaluation?.niveauFinal ?? null,
            retenu: selectionEleve.artefactsRetenus.includes(art.id)
        };
    }).sort((a, b) => {
        if (a.remis && !b.remis) return -1;
        if (!a.remis && b.remis) return 1;
        return a.description.localeCompare(b.description);
    });

    // Sélection auto des meilleurs artefacts si aucune sélection manuelle
    const nombreARetenir = portfolio.regles.nombreARetenir || 3;
    _appliquerSelectionAutoArtefacts(da, portfolio, artefacts, selectionEleve, selectionsPortfolios, nombreARetenir);

    const nbTotal = artefacts.length;  // ✅ Maintenant basé sur les artefacts ÉVALUÉS
    const nbRemis = artefacts.filter(a => a.remis).length;
    const nbRetenus = selectionEleve.artefactsRetenus.length;

    // Calcul dual pour mode comparatif (Beta 90 + correctif 7 déc 2025 :
    // vérifier === true pour éviter le mode comparatif par défaut)
    const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    // Session C (#303) : mode comparatif retiré — indices de la pratique active.
    const { indices } = _calculerIndicesPerformance(da);

    // Détails du rapport portfolio (méthode sélection, artefacts retenus, etc.)
    const detailsRapport = _lireDetailsRapportPerformance(da, nombreARetenir, artefacts);
    const {
        methodeSelectionRapport, portfolioActifRapport, nombreARetenirConfig,
        configCategoriesRapport, artefactsRetenus, notesRetenues
    } = detailsRapport;

    const selectionComplete = nbRetenus === portfolio.regles.nombreARetenir;

    // Interprétation Performance uniquement (C va dans Mobilisation)
    const interpP = interpreterPerformance(indices.P);

    // Déterminer les lettres IDME pour SOM et PAN
    const determinerLettreIDME = (P) => {
        if (P >= 85) return 'E';
        if (P >= 75) return 'M';
        if (P >= 65) return 'D';
        return 'I';
    };

    // Session C (#303) : mode comparatif retiré — lettre IDME de la pratique active.
    const lettreIDME = determinerLettreIDME(indices.P);

    // Calculer moyennes des critères pour badges
    const moyennes = calculerMoyennesCriteres(da);
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    // Fonction helper pour couleur du badge
    const obtenirCouleurBadge = (score) => {
        if (score >= 0.7125) return 'var(--vert-succes)'; // Vert - Force
        if (score >= 0.60) return 'var(--btn-annuler)'; // Jaune - Défi modéré
        if (score >= 0.50) return 'var(--orange-accent)'; // Orange - Défi important
        return 'var(--rouge-erreur)'; // Rouge - Défi critique
    };

    return `
        <!-- Détails des calculs (masqué par défaut) - AFFICHÉ EN HAUT -->
        <div id="details-calculs-performance-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Pratique de notation active :</strong> ${indices.pratique === 'PAN' ? 'PAN (Portfolio à nombre limité)' : 'SOM (Sommative provisoire)'}
            <br><br>
            <strong>Règle de sélection :</strong> ${_genererTexteRegleSelectionPortfolio(portfolioActifRapport, methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport)}
            <br><br>
            <strong>${obtenirTermeProduction('pluriel', true)} ${accordTermeProduction('retenu', 2)} :</strong> ${artefactsRetenus.length > 0 ? artefactsRetenus.map((art, idx) =>
                `${idx + 1}. ${art.description} → ${art.note.toFixed(1)}/100`
            ).join(' • ') : `${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}`}
            <br><br>
            <strong>Calcul de l'indice P :</strong> ${artefactsRetenus.length > 0 ? `
                Moyenne des ${artefactsRetenus.length} ${obtenirTermeProduction(artefactsRetenus.length > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('retenu', artefactsRetenus.length)} — P = (${notesRetenues.map(n => n.toFixed(1)).join(' + ')}) / ${artefactsRetenus.length} = <strong>${indices.P}%</strong>
            ` : 'Calcul impossible : aucune évaluation disponible'}
            <br><br>
            <strong>Calcul de la note de chaque ${obtenirTermeProduction('singulier')} :</strong> ${_genererTextePonderationCriteresActifs()}${selectionEleve.auto ? '<br><br><strong>Note :</strong> Sélection automatique basée sur les meilleures notes' : ''}
        </div>

        <!-- ENCADRÉ UNIQUE: DÉVELOPPEMENT DES HABILETÉS ET COMPÉTENCES -->
        <div class="profil-carte-bordure-blanche">

            <!-- En-tête avec indice P -->
            <div class="u-flex-between-mb15">
                <!-- Session C (#303) : mode comparatif retiré — indice P unique (pratique active). -->
                <strong class="profil-valeur-grande-bleu" style="margin-left: auto;">${lettreIDME} ${indices.P}%</strong>
            </div>

            <!-- 🆕 MÉTHODE DE CALCUL EXPLICITE -->
            <ul class="profil-liste-simple" style="margin-bottom: 15px;">
                <li><strong>• ${_genererTextePerformanceMethodeBloc(portfolioActifRapport, methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport)}</strong></li>
            </ul>

            <hr class="profil-separateur">

            <!-- Onglets Critères / Forces et défis / Gestes cognitifs (avril 2026) -->
            ${genererOngletsDeveloppement(da, {
                criteres: graphiqueCriteres,
                forcesDefis: `
                <div class="section-titre">Forces et défis parmi les critères</div>
                <div style="margin: 20px 0;">
                ${_genererBlocForcesDefisSRPNF(da)}
                </div>
                ${genererBlocConsolidation(da)}
                `,
                gestesCognitifs: genererConteneurGestesCognitifs(da)
            })}

    </div>
    `;
}

/**
 * Génère le HTML de la section assiduité - VERSION CSS NATIVE
 */
function genererSectionAssiduiteLegacy(da) {
    const details = obtenirDetailsAssiduite(da);
    const taux = details.periodesOffertes > 0
        ? (details.periodesPresentes / details.periodesOffertes * 100).toFixed(1)
        : 0;

    // Interprétation de l'assiduité
    const interpA = interpreterAssiduite(parseFloat(taux));
    const indices = calculerTousLesIndices(da);

    return `
        <!-- ENCADRÉ UNIQUE: ASSIDUITÉ -->
        <div class="profil-carte-bordure-blanche">

            <h3 class="profil-titre-section-majeur">
                ASSIDUITÉ
            </h3>

            <!-- Badge avec interprétation -->
            <div class="u-mb-15">
                <span class="pastille-rai" style="background:${interpA.couleur}"></span>
                <strong style="font-size: 1.1rem; color: ${interpA.couleur};">${interpA.niveau}</strong>
                <span style="font-size: 1.3rem; font-weight: bold; color: ${interpA.couleur}; margin-left: 10px;">(${taux}%)</span>
            </div>

            <!-- Statistiques -->
            <ul class="profil-liste-simple">
                <li><strong>• Périodes présentes :</strong> ${details.periodesPresentes} / ${details.periodesOffertes}</li>
            </ul>

            <hr class="profil-separateur">

            <!-- Liste des absences et retards -->
            <h4 class="profil-titre-sous-section">
                ${details.absences.length} ABSENCE${details.absences.length > 1 ? 'S' : ''} OU RETARD${details.absences.length > 1 ? 'S' : ''}
            </h4>
            ${details.absences.length > 0 ? `
                <div class="badges-centres u-mb-20">
                    ${details.absences.map(abs => {
                        const date = new Date(abs.date + 'T12:00:00');
                        const options = { weekday: 'short', day: 'numeric', month: 'short' };
                        const dateFormatee = date.toLocaleDateString('fr-CA', options);
                        const estAbsenceComplete = abs.heuresPresence === 0;
                        const classeBadge = estAbsenceComplete ? 'badge-absence-complete' : 'badge-absence-partielle';

                        return `
                            <div class="badge-absence ${classeBadge}"
                                 data-action="naviguerVersPresenceAvecDate" data-param="${abs.date}">
                                <span class="badge-absence-date">
                                    ${dateFormatee}
                                </span>
                                <span class="badge-absence-heures">
                                    ${estAbsenceComplete
                                        ? `${abs.heuresManquees}/${abs.heuresPresence + abs.heuresManquees}`
                                        : `${abs.heuresPresence}/${abs.heuresPresence + abs.heuresManquees}`
                                    }
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="profil-message-tous-remis u-mb-20">
                    Assiduité parfaite !
                </div>
            `}

            <hr class="profil-separateur">

            <!-- Placeholder graphique (en conclusion) -->
            <div style="background: var(--bleu-tres-pale); border: 2px dashed var(--bleu-pale); border-radius: 8px;
                        padding: 30px 20px; text-align: center; color: var(--texte-secondaire); font-style: italic;">
                Évolution temporelle de l'assiduité (à venir)
            </div>

        </div>
    `;
}

/**
 * Navigue vers la section Présences › Saisie avec une date pré-sélectionnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 */
function naviguerVersPresenceAvecDate(dateStr) {

    // 1. Afficher la section Suivi (saisie des présences)
    if (typeof afficherSection === 'function') {
        afficherSection('suivi');
    }

    // 2. Afficher la sous-section Saisie
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('suivi-saisie');
    }

    // 3. Attendre que le DOM soit mis à jour, puis pré-sélectionner la date
    setTimeout(() => {
        const inputDate = document.getElementById('date-cours');
        if (inputDate) {
            inputDate.value = dateStr;

            // Déclencher l'événement change pour charger le tableau de cette date
            const event = new Event('change', { bubbles: true });
            inputDate.dispatchEvent(event);


            // Scroll vers le haut pour voir le formulaire
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Input #date-cours introuvable');
        }
    }, 300);
}

/**
 * Formate une date ISO en format compact (ex: "Lun 21 oct. 2024")
 * Format unique à ce module — distinct de formaterDateCourte() canonique ("6 fév.")
 * @param {string} dateISO - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée
 */
function formaterDateCompacte(dateISO) {
    if (!dateISO) return 'N/A';
    const date = new Date(dateISO + 'T12:00:00');
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    };
    return date.toLocaleDateString('fr-CA', options);
}

/**
 * Réattache les événements des toggles emoji après chargement dynamique
 * NÉCESSAIRE car le contenu est inséré via innerHTML
 */
function reattacherEvenementsToggles() {
    const emojiToggles = document.querySelectorAll('.emoji-toggle');

    emojiToggles.forEach(emoji => {
        // Retirer les anciens événements (éviter les doublons)
        const newEmoji = emoji.cloneNode(true);
        emoji.parentNode.replaceChild(newEmoji, emoji);

        // Ajouter le nouvel événement
        newEmoji.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Récupérer l'ID de la cible depuis l'attribut data-target
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Toggle la visibilité
                targetElement.classList.toggle('u-hide');
            }
        });
    });

}

/* ===============================
   📌 SECTIONS À DÉVELOPPER
   =============================== */

/**
 * Toggle l'affichage d'une section détaillée
 * @param {string} sectionId - ID de la section à afficher/cacher
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = !section.classList.contains('u-hide');
        section.classList.toggle('u-hide');

        // Changer l'icône du titre
        const titre = section.previousElementSibling;
        if (titre) {
            titre.textContent = titre.textContent.replace(
                isVisible ? '▼' : '▶',
                isVisible ? '▶' : '▼'
            );
        }
    }
}

/**
 * Naviguer vers une nouvelle intervention depuis le profil étudiant
 * @param {string} [daPreselectionne] - DA de l'étudiant à pré-cocher
 */
function naviguerVersNouvelleIntervention(daPreselectionne) {
    // Naviguer vers la section
    afficherSection('suivi');
    afficherSousSection('suivi-interventions');

    // Attendre que le conteneur soit prêt
    const checkConteneur = setInterval(() => {
        const conteneur = document.getElementById('conteneurPrincipal');
        if (conteneur && conteneur.innerHTML.trim() !== '') {
            clearInterval(checkConteneur);
            afficherFormulaireIntervention(daPreselectionne);
        }
    }, 50); // Vérifier toutes les 50ms

    // Timeout de sécurité (2 secondes max)
    setTimeout(() => clearInterval(checkConteneur), 2000);
}

/**
 * Naviguer vers une intervention existante depuis le profil étudiant
 * @param {string} interventionId - ID de l'intervention à ouvrir
 */
function naviguerVersIntervention(interventionId) {
    // Naviguer vers la section
    afficherSection('suivi');
    afficherSousSection('suivi-interventions');

    // Attendre que le conteneur soit prêt
    const checkConteneur = setInterval(() => {
        const conteneur = document.getElementById('conteneurPrincipal');
        if (conteneur && conteneur.innerHTML.trim() !== '') {
            clearInterval(checkConteneur);
            ouvrirIntervention(interventionId);
        }
    }, 50); // Vérifier toutes les 50ms

    // Timeout de sécurité (2 secondes max)
    setTimeout(() => clearInterval(checkConteneur), 2000);
}

/* ===============================
   📌 EXPORTS (accessibles globalement)
   =============================== */

// Les fonctions sont automatiquement disponibles globalement
// car non encapsulées dans un module ES6
window.naviguerVersNouvelleIntervention = naviguerVersNouvelleIntervention;
window.naviguerVersIntervention = naviguerVersIntervention;

/* ===============================
   🔄 RECHARGEMENT AUTOMATIQUE
   =============================== */

/**
 * Surveille l'activation de la sous-section 'suivi-profil'
 * et recharge automatiquement le profil pour refléter les changements
 * faits depuis d'autres sections (ex: modifications d'interventions RàI)
 */
document.addEventListener('DOMContentLoaded', function() {
    const sectionProfil = document.getElementById('suivi-profil');
    if (!sectionProfil) return;

    let dernierDARecharge = null;
    let timeoutRechargement = null;

    // Observer les changements de la classe 'active' sur la sous-section
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const estActif = sectionProfil.classList.contains('active');
                const daActuel = window.profilActuelDA;

                // Si la sous-section vient de devenir active ET qu'un profil est affiché
                if (estActif && daActuel) {
                    // Éviter les rechargements en cascade pour le même étudiant
                    if (dernierDARecharge === daActuel) {
                        return;
                    }

                    // Annuler tout rechargement en attente
                    if (timeoutRechargement) {
                        clearTimeout(timeoutRechargement);
                    }

                    // Recharger avec un court délai (debounce)
                    timeoutRechargement = setTimeout(function() {
                        dernierDARecharge = daActuel;

                        // Vérifier que la fonction existe avant de l'appeler
                        if (typeof afficherProfilComplet === 'function') {
                            afficherProfilComplet(daActuel);
                        }

                        timeoutRechargement = null;
                    }, 100); // Délai de 100ms
                }

                // Réinitialiser le flag quand la section devient inactive
                if (!estActif) {
                    dernierDARecharge = null;
                }
            }
        });
    });

    // Commencer à observer
    observer.observe(sectionProfil, {
        attributes: true,
        attributeFilter: ['class']
    });

});




/**
 * Genere la section "Travaux soumis" pour le profil etudiant
 * Affiche une grille de miniatures des fichiers importes
 * 🆕 BETA 96.3 : Module Travaux
 * @param {string} da - DA de l'etudiant
 * @returns {string} HTML de la section
 */
function genererSectionTravaux(da) {
    if (typeof travauxStockage === 'undefined') {
        return '<p class="texte-muted">Module Travaux non disponible</p>';
    }

    const fichiersAll = travauxStockage.obtenirFichiersEtudiant(da);
    const productions = obtenirDonneesSelonMode('productions');

    // Filtrer les originaux remplacés par une reprise : ne montrer que la reprise active.
    // Sans ce filtre, l'enseignant voit 2 vignettes par production reprise (original + reprise),
    // ce qui crée de la confusion et complique le clic vers « Annoter et évaluer ».
    // Bug rapporté 21 mai 2026 (BUG_grégoire_2026-05-21_13-15-45).
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const evalParId = {};
    evaluations.forEach(function(e) { evalParId[e.id] = e; });
    const fichiers = fichiersAll.filter(function(f) {
        if (!f.evaluationId) return true;
        const e = evalParId[f.evaluationId];
        if (!e) return true;
        return !e.remplaceeParId;
    });

    if (fichiers.length === 0) {
        return `
            <div class="profil-zone-grande-bleu">
                <p style="color: var(--gris-moyen); font-size: 1.1rem;">Aucun travail soumis</p>
                <p style="color: var(--gris-clair); margin-top: 10px;">Importe des travaux depuis l'onglet Travaux &gt; Import</p>
            </div>
        `;
    }

    let html = '<div class="travaux-grille">';

    fichiers.forEach(f => {
        const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
        const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
        const production = productions.find(p => p.id === f.productionId);
        const nomProd = production ? echapperHtml(production.titre || production.nom || '') : '';
        const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        const aAnnotations = annotation && travauxUI.annotationContientDuContenu(annotation);

        html += `
            <div class="travaux-grille-item" data-action="travauxUI.ouvrirFichier" data-param="${f.id}" title="${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}">
                <div class="travaux-grille-thumb">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span class="travaux-grille-icone">${icone}</span>`}
                    ${aAnnotations ? '<span class="travaux-badge-annote" title="Annote">&#x270F;</span>' : ''}
                </div>
                <div class="travaux-grille-info">
                    <div class="travaux-grille-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}</div>
                    ${nomProd ? `<div class="travaux-grille-etudiant">${nomProd}</div>` : ''}
                    <div class="travaux-grille-etudiant">${travauxStockage.formaterTaille(f.tailleFichier)}</div>
                </div>
            </div>`;
    });

    html += '</div>';

    // Bouton export
    html += `
        <div style="margin-top: 16px;">
            <button class="btn btn-secondaire" data-action="lancerExportEtudiantAnnotes" data-param="${da}">
                Telecharger ZIP des travaux
            </button>
        </div>
    `;

    return html;
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler pour togglePSansReprisesIndiv(da, checked) depuis checkbox */
function togglePSansReprisesIndivHandler(el) {
    togglePSansReprisesIndiv(el.dataset.da, el.checked);
}

/** Handler pour toggleIndiceIndiv(label, checked, da) depuis checkbox */
function toggleIndiceIndivHandler(el) {
    toggleIndiceIndiv(el.dataset.label, el.checked, el.dataset.da);
}

/** Handler pour toggleCritereIndiv(critere, checked, da) depuis checkbox */
function toggleCritereIndivHandler(el) {
    toggleCritereIndiv(el.dataset.critere, el.checked, el.dataset.da);
}

/** Handler pour travauxArchivage.lancerExportEtudiant avec {inclureAnnotes: true} */
function lancerExportEtudiantAnnotes(da) {
    travauxArchivage.lancerExportEtudiant(da, {inclureAnnotes: true});
}

// 🆕 BETA 93: Exporter afficherProfilComplet pour accès depuis autres modules
window.afficherProfilComplet = afficherProfilComplet;
// window.calculerTousLesIndices → indices.js (#206)
// window.obtenirPratiqueActuelle → profil-etudiant-helpers.js (Utilisé par snapshots.js pour calcul historique P, Beta 93.5)
// window.calculerDetailsNoteFinale → profil-etudiant-actions.js (session C refactor 18 mai 2026, FIX #37 préservé)
window.calculerDirectionsCriteres = calculerDirectionsCriteres; // session C refactor : reste dans le résidu (zone Sections affichage L2003), export migré depuis zone actions

// ✅ CORRECTIF (17 déc 2025): Exporter les fonctions utilisées dans les data-action du profil
window.changerSectionProfil = changerSectionProfil;
window.toggleSectionCollapsible = toggleSectionCollapsible;
window.naviguerVersPresenceAvecDate = naviguerVersPresenceAvecDate;
// window.genererEtAfficherRapport → profil-etudiant-rapport.js
// window.copierRapport → profil-etudiant-rapport.js
// window.consulterEvaluation → profil-etudiant-actions.js (session C refactor 18 mai 2026)
// window.evaluerProduction → profil-etudiant-actions.js (session C refactor 18 mai 2026)

// Phase 5 : Wrappers delegation
window.togglePSansReprisesIndivHandler = togglePSansReprisesIndivHandler;
window.toggleIndiceIndivHandler = toggleIndiceIndivHandler;
window.toggleCritereIndivHandler = toggleCritereIndivHandler;
window.lancerExportEtudiantAnnotes = lancerExportEtudiantAnnotes;
// window.obtenirTermeProduction → profil-etudiant-helpers.js

})();
