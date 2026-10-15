/* ===============================
   profil-etudiant-sections-affichage.js
   Sous-module renommé depuis profil-etudiant.js (session D refactor, 18 mai 2026).

   Périmètre : zone HIGH partie 2 — sections d'affichage du profil étudiant.
   Contient l'orchestrateur central `afficherProfilComplet` (cyc 58, à éclater
   étape 4) + ~30 fonctions `genererSection*` + handlers UI + 3 variables
   module-scope encapsulées dans l'IIFE :
   - `profilActuelDA` dual-write atomique (état pivot, lu 24× hors module via window.X)
   - `sectionProfilActive` (section profil active par défaut « productions »)

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
   - #etudiants-profil : Sous-section (gérée par 02-navigation.js)
   
   LocalStorage utilisé:
   - 'groupeEtudiants' : Array des étudiants
   - 'productions' : Array des productions (dont artefacts)
   - 'evaluationsSauvegardees' : Array des évaluations
   (#714 : 'portfoliosEleves' n'est plus lu ni écrit ici — le panneau « Développement des
    habiletés » lit la note par calculerDetailsNoteFinale.)
   
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
        niveau: _niveauVuProfil(evaluation),   // #941 lot S1 — aucun pour une copie en points
        // #575 — l'échelle de CETTE évaluation, pour que la vue n'ait pas à la
        // deviner. Sans elle, le badge choisissait « l'échelle active, sinon la
        // première » et pouvait colorer un code avec la couleur d'un autre.
        echelleId: evaluation?.echelleId ?? null,
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

// G2-b (#436) : dénominateur de la barre « jetons utilisés ». Valeur historique
// EFFECTIVE — gelée jusqu'à décision, parce qu'elle sort à l'écran.
const QUOTA_JETONS_AFFICHE_DEFAUT = 2;

function _genererBlocGestionJetons(statutJetons, evaluations, productions, da) {
    if (typeof obtenirStatutJetonsEtudiant !== 'function') return '';
    const totalJetonsUtilisesTousTypes = Object.values(statutJetons).reduce((sum, info) => sum + info.utilises, 0);
    // G2-b (#436, 9 août 2026) — LECTURE MORTE RETIRÉE, VALEUR PRÉSERVÉE.
    // Ce quota lisait `configPAN.jetons.nombreParEleve`. Or #328 L2-c a fait de
    // ce sous-champ un miroir mort : `modalites-evaluation.js` le SUPPRIME
    // activement au nettoyage. Le module purgeait donc un champ qu'un autre
    // continuait de lire — la lecture rendait toujours le défaut, 2.
    //
    // ⚠ On ne la branche PAS sur `obtenirConfigJetons()` : sa SSOT n'expose
    // AUCUN quota global, mais des nombres par usage (`delai.nombre`,
    // `reprise.nombre`). Or le numérateur ici somme TOUS les types. Choisir un
    // dénominateur est une décision de sens — et elle change une barre de
    // progression affichée. Question ouverte consignée au BACKLOG (#436).
    const quotaGlobal = QUOTA_JETONS_AFFICHE_DEFAUT;
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
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    // #328 L2-b2 : type dérivé de la SSOT groupesCours[].pratiqueId (helper D2).
    const { indicesSOM, indicesPAN } = _calculerIndicesMobilisation(
        da,
        (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null)
    );

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
    // #1055 : une production diagnostique ne compte ni dans les artefacts remis ni dans les retenus.
    const productions = window.ProductionDiagnostique.filtrerProductions(obtenirDonneesSelonMode('productions') || []);
    const portfolio = productions.find(p => p.type === 'portfolio');
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Construction de la liste des artefacts avec leur évaluation active
    const { artefacts, evaluationsEleve, artefactsPortfolio } = _construireListeArtefactsMobilisation(da, productions, evaluations);

    // 🆕 LIRE LA CONFIGURATION DE LA PRATIQUE DE NOTATION
    // Source unique : `pratiquesConfigurables` via obtenirConfigPratiqueActive.
    // G2-b (#436, 9 août 2026) : les deux replis sur le miroir
    // `modalites.configPAN.portfolio` sont retirés. Ce miroir ne se rafraîchit
    // qu'à l'APPLICATION d'une pratique : sur cet écran, il pouvait contredire
    // le calcul de la note juste au-dessus, coupé du miroir par G2-a en mai.
    const configPratiqueActive = typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null;
    const configPortfolio = configPratiqueActive?.portfolio || {};
    const portfolioActif = configPortfolio.actif !== false;
    let nombreARetenir = configPortfolio.nombreARetenir || portfolio?.regles?.nombreARetenir || 3;
    const minimumCompletion = configPortfolio.minimumCompletion || 3;
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
    // #871, volet complétion (17 sept. 2026) — LA FRACTION ÉCRITE À CÔTÉ DE L'INDICE C vient du détail dont il
    // découle (`obtenirDetailsCompletion`, portfolio.js), pas de la liste des artefacts ci-dessus : l'indice
    // compte aussi l'évaluation terminale (« 80% » à côté de « 7/9 » ; tranché par Grégoire le 17 sept.).
    // `nbRemis` et `nbTotal` restent le compte des ARTEFACTS LISTÉS dans la carte (pastilles, minimum requis).
    const detailsC = (typeof obtenirDetailsCompletion === 'function' ? obtenirDetailsCompletion(da) : null) || { remis: 0, total: 0 };
    const interpC = interpreterCompletion(indices.C);
    // Lot 30 (17 sept. 2026) — LES DEUX LISTES DE LA CARTE LISENT LA MÊME SOURCE QUE LA FRACTION. Mesuré sur le
    // pack démo : « 9/10 » à côté de « 0 artefact non remis… tous les artefacts remis ! » (DEMO006 : la terminale
    // manquante n'était dans aucune liste) ; un BROUILLON listé parmi les remis alors que l'indice ne le compte
    // pas (DEMO004, Artefact 7 — « un brouillon ne compte nulle part », 16 sept.). Quand la pratique dit QUELLES
    // productions elle compte (`detailsC.productions`), les non-remises en sont le complément — toutes
    // productions confondues, terminale comprise — et les pastilles des remis sont les ARTEFACTS que ce détail
    // tient pour remis (la liste ne montre que des artefacts : leur terme personnalisé y reste juste).
    // Sans ce détail (spécifications : des travaux acceptables par type, aucune production ne manque nommément),
    // la carte garde ses artefacts, comme avant.
    const productionsC = Array.isArray(detailsC.productions) ? detailsC.productions : null;
    const idsRemisC = productionsC ? new Set(productionsC.filter(p => p.remis).map(p => p.id)) : null;
    // #922 (18 sept. 2026) — « ne montrer que des artefacts » tient au MOT du titre : seule une pratique Standards
    // écrit « N artefacts remis ». Partout ailleurs le titre dit « production », et la liste d'artefacts est vide
    // (une sommative n'a aucune production de type « artefact de portfolio ») : « 2/2 » au-dessus de « 0 production
    // remise — Aucune production remise ». Hors Standards, les pastilles sont donc TOUTES les productions que le
    // détail tient pour remises, comme le sont déjà les non-remises.
    // (lot N1b : sans pratique assignée, null — aucun repli : toutes les productions remises, comme hors Standards.)
    const pastillesArtefactsSeulement = (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null) === 'standards';
    const construirePastilleC = p => {
        const production = productions.find(x => x.id === p.id);
        if (!production) return null;
        const copies = evaluationsEleve.filter(e => e.productionId === p.id);
        return _construireArtefactMobilisation(production, _trouverEvaluationActiveMobilisation(copies));
    };
    const remisesCarte = !productionsC ? artefactsRemis
        : pastillesArtefactsSeulement ? artefacts.filter(a => idsRemisC.has(a.id))
        : productionsC.filter(p => p.remis).map(construirePastilleC).filter(Boolean);
    const nonRemisesCarte = productionsC
        ? productionsC.filter(p => !p.remis).map(construirePastilleC).filter(Boolean)
        : artefacts.filter(a => !a.remis);
    // « En attente de données » suit la fraction, elle aussi : c'est quand la pratique ne compte ENCORE aucune
    // production (« 0/0 » — rien d'évalué, ou seulement des brouillons). Dès qu'elle en compte une, une liste
    // vide veut dire que tout est remis.
    const completionEnAttente = detailsC.total === 0;

    // 🆕 BETA 95.6 : Détecter si aucune donnée de complétion/performance
    // #922 — quand la pratique dit ce qu'elle compte, la grande valeur de C suit la fraction, pas la liste des artefacts
    // (« — » à côté de « 2/2 » sous une sommative).
    const aucuneDonneeCompletion = productionsC ? completionEnAttente : nbTotal === 0;
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
    // #922 (18 sept. 2026) — SOUS UNE SOMMATIVE, LA CARTE PERFORMANCE REDIT LE MOTEUR. Elle parlait portfolio (« 3
    // meilleures, maîtrise de standards »), listait « 0 meilleure production » et taisait P (« — ») : tout y lisait
    // la liste des artefacts, vide. Les copies comptées, leur poids et P viennent du récit — JAMAIS de `moyenneP`
    // ci-dessus, qui est une moyenne SIMPLE (Grégoire, 18 sept. : « la pondération affectée à chaque travail, pas 50-50 »).
    const recitSOM = _lireRecitSommative(da).recit;
    const compteesSOM = recitSOM ? (recitSOM.resultats || []).filter(r => r.sort === 'compte') : [];
    // Lot N4 (#713) — pourquoi la note n'existe pas, quand la pratique le déclare (source unique, portfolio.js).
    const causeNoteAbsente = (indices.noteConstructible === false && typeof causeNoteNonConstructible === 'function')
        ? causeNoteNonConstructible(da) : null;
    // `const interpP = interpreterPerformance(moyenneP);` retiré au pas 3c-3 de
    // #542 : le résultat n'était lu nulle part, et la fonction n'existe plus.

    return `
        <!-- Détails des calculs (masqué par défaut) -->
        <div id="details-calculs-mobilisation-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Assiduité (A) :</strong> Indice A = ${indices.A === null ? '—' : indices.A + '%'} — ${formaterNombrePeriodes(periodesPresentes)} périodes présentes / ${formaterNombrePeriodes(periodesOffertes)} périodes offertes
            <br><br>
            <strong>Complétion (C) :</strong> Indice C = ${indices.C === null ? '—' : indices.C + '%'} — ${detailsC.remis} ${detailsC.remis > 1 ? 'productions remises' : 'production remise'} / ${detailsC.total} ${detailsC.total > 1 ? 'productions' : 'production'} au total
            <br><br>
            <strong>Performance (P) :</strong> ${recitSOM
                ? `Indice P = ${indicesSOM.P}% — Moyenne pondérée des ${compteesSOM.length} ${obtenirTermeProduction(compteesSOM.length > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('evalue', compteesSOM.length)}, chacune à son poids`
                : `Indice P = ${moyenneP}% — Moyenne des ${nbRetenus} ${accordTermeProduction('meilleur', nbRetenus)} ${obtenirTermeProduction('pluriel')}`}
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
                    <li><strong>• Périodes présentes :</strong> ${formaterNombrePeriodes(periodesPresentes)} / ${formaterNombrePeriodes(periodesOffertes)}</li>
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
                                            ? `${formaterNombrePeriodes(abs.periodesManquees)} pér.`
                                            : `${formaterNombrePeriodes(abs.periodesPresence)} pér.`
                                        }
                                    </span>
                                    ${(abs.lecons || []).map(t => `<span class="badge-absence-lecon">${echapperHtml(t)}</span>`).join('')}
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
                    <li><strong>• Productions remises :</strong> ${detailsC.remis}/${detailsC.total}</li>
                </ul>

                <hr class="profil-separateur">

                <!-- Artefacts remis (format badge comme Assiduité) -->
                <h4 class="profil-section-titre">
                    ${remisesCarte.length} ${obtenirTermeProduction(remisesCarte.length > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('remis', remisesCarte.length)}
                </h4>
                ${remisesCarte.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${remisesCarte
                            .map(art => {
                                // Numéro d'artefact depuis le titre (pas la position)
                                const indexOriginal = _rangProduction(productions.find(p => p.id === art.id));
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
                    ${nonRemisesCarte.length} ${nonRemisesCarte.length > 1 ? 'productions non remises ou non recevables' : 'production non remise ou non recevable'}
                </h4>
                ${nonRemisesCarte.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${nonRemisesCarte
                            .map(art => {
                                // Numéro d'artefact depuis le titre (pas la position)
                                const indexOriginal = _rangProduction(productions.find(p => p.id === art.id));
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
                    <div class="${completionEnAttente ? 'profil-message-vide' : 'profil-message-tous-remis'}">
                        ${completionEnAttente ? 'En attente de données' : 'Toutes les productions sont remises !'}
                    </div>
                `}
            </div>

            <!-- FICHE PERFORMANCE -->
            <div class="profil-carte">
                <div class="u-flex-between-mb15">
                    <h3 class="profil-section-titre-seul">Performance</h3>
                    ${indices.noteConstructible === false
                        // Lot N4 (#713) : une note absente est un tiret, jamais le 0 du stockage ; la cause en bulle.
                        ? `<span class="profil-valeur-grande" style="color: var(--gris-moyen);"${causeNoteAbsente ? ` title="${echapperHtml(causeNoteAbsente)}"` : ''}>—</span>`
                        : performanceInsuffisante
                        ? '<span class="profil-valeur-grande" style="color: var(--gris-moyen);">—</span>'
                        : genererValeursComparatives(indicesSOM.P, indicesPAN.P, recitSOM ? compteesSOM.length === 0 : aucuneDonneePerformance)}
                </div>

                <!-- Statistiques -->
                <ul class="profil-liste-simple">
                    <li><strong>• ${recitSOM
                        ? `Moyenne pondérée des ${obtenirTermeProduction('pluriel')} ${accordTermeProduction('evalue', 2)}`
                        : _genererTexteMethodePerformanceMobilisation(performanceInsuffisante, portfolioActif, methodeSelection, nombreARetenir, configCategories, nbRemis, minimumCompletion)}</strong></li>
                </ul>

                <hr class="profil-separateur">

                <!-- Gestion des jetons (prédéfinis + personnalisés). #922 : sous une sommative, seulement si l'élève en a un d'appliqué. -->
                ${(recitSOM && totalJetonsUtilises === 0) ? '' : _genererBlocGestionJetons(statutJetons, evaluations, productions, da)}

                <!-- Artefacts sélectionnés avec notes (badges colorés avec checkboxes) -->
                <h4 class="profil-section-titre">
                    ${recitSOM
                        ? `${compteesSOM.length} ${obtenirTermeProduction(compteesSOM.length > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('evalue', compteesSOM.length)}`
                        : _genererTitreArtefactsRetenusMobilisation(portfolioActif, methodeSelection, nbRetenus, nombreARetenir)}
                </h4>
                ${recitSOM ? (compteesSOM.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${compteesSOM.map(r => {
                            const couleurBadge = (typeof couleurDuNiveau === 'function') ? couleurDuNiveau(r.niveau, r.echelleId) : '#999999';
                            const poidsTxt = (typeof r.poids === 'number') ? `poids ${r.poids.toFixed(0)} %` : '';
                            return `
                                <div class="badge-artefact hover-opaque"
                                     style="background: ${couleurBadge}22; border-color: ${couleurBadge}; border-width: 3px; cursor: pointer;"
                                     data-action="evaluerProduction" data-param="${da}" data-param2="${echapperHtml(r.productionId)}"
                                     title="${echapperHtml(r.label)}">
                                    <span class="badge-artefact-titre" style="color: ${couleurBadge};">
                                        P${_rangProduction(productions.find(p => p.id === r.productionId))}
                                    </span>
                                    <span class="badge-artefact-note" style="background: ${couleurBadge};">
                                        ${echapperHtml(r.niveau || '—')}
                                    </span>
                                    <span class="u-texte-petit u-texte-gris" style="font-weight: 500;">
                                        ${(typeof noteDiffereeActive === 'function' && noteDiffereeActive()) ? badgeNoteDifferee() : `(${typeof r.note === 'number' ? r.note.toFixed(1) : '—'}) · ${poidsTxt}`}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="profil-message-vide u-mb-15">
                        ${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}
                    </div>
                `) : artefactsRetenus.length > 0 ? `
                    <div class="badges-centres u-mb-20">
                        ${artefactsRetenus.map(art => {
                            // Numéro d'artefact depuis le titre (pas la position)
                            const indexOriginal = _rangProduction(artefactsPortfolio.find(p => p.id === art.id));

                            // ⮕ #575 (lot 4 du plan SOLO, rapport §3 n° 4) — TROIS
                            // DÉFAUTS RETIRÉS EN UN GESTE.
                            //
                            //   1. L'échelle était DEVINÉE : `echelles.find(e => e.active)
                            //      || echelles[0]`. Chaque évaluation porte pourtant la
                            //      sienne (`echelleId`), désormais transmise par
                            //      `_construireArtefactMobilisation`.
                            //   2. La couleur était choisie en SITUANT la note dans les
                            //      plages de cette échelle devinée — elle pouvait donc
                            //      CONTREDIRE le code affiché dans le même badge.
                            //   3. Sans échelle, quatre couleurs IDME derrière
                            //      `note >= 85 / 75 / 65` : les bornes de Grégoire, pour
                            //      tout le monde.
                            //
                            // On lit la couleur du CODE déjà enregistré, dans SON échelle,
                            // filtrée pour l'attribut `style` (§5.5 de l'audit : ici, la
                            // couleur utilisateur partait BRUTE dans le HTML).
                            const couleurBadge = (typeof couleurDuNiveau === 'function')
                                ? couleurDuNiveau(art.niveau, art.echelleId)
                                : '#999999';

                            const opacite = art.retenu ? '1' : '0.6';
                            const bordure = art.retenu ? '3px' : '2px';

                            return `
                                <div class="badge-artefact hover-opaque"
                                     style="background: ${couleurBadge}22; border-color: ${couleurBadge}; opacity: ${opacite}; border-width: ${bordure}; cursor: pointer;"
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
                                        ${(typeof noteDiffereeActive === 'function' && noteDiffereeActive()) ? badgeNoteDifferee() : `(${art.note})`}
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
 * La phrase colorée sous le badge du contexte. #821 (15 oct. 2026) : les quatre paliers
 * n'en portent plus (elle répétait le mot qui jugeait) ; seuls les états sans palier
 * (« En attente ») en ont une. Rien quand elle est vide.
 */
function _ligneDescriptionContexte(alerte) {
    if (!alerte.description) return '';
    const couleur = alerte.niveau === 'tres-favorable' || alerte.niveau === 'favorable' ? '#16a34a'
        : alerte.niveau === 'modere' ? '#ca8a04' : '#ea580c';
    return `<p style="font-size: 0.9rem; color: ${couleur}; font-weight: 600; margin-bottom: 8px;">
                    ${alerte.description}
                </p>`;
}
/**
 * Génère le HTML de la section Accompagnement (interventions RàI)
 * Inclut: badge RàI, risque, pattern, progression, services, échelle, historique
 * @param {string} da - Numéro de DA
 * @returns {string} - HTML de la section
 */
// Relecture croisée R2 (lot A de l'enregistrement, 26 sept. 2026) — la pastille dit qu'un élève a
// des informations confidentielles (un parcours, un diagnostic) : dans une capture ou une démo,
// c'est une information sur l'élève. En anonymisation, le bouton reste, neutre.
function _pastilleConfidentielVisible(da) {
    if (typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation()) return false;
    return aDesInfosConfidentielles(da);
}

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
    // #743 (lot D) : une assiduité inconnue (`null`) est, elle aussi, « aucune donnée ».
    // Lot N1b (21 sept. 2026) : une complétion INCONNUE (`null`, sans pratique assignée) ne dit rien des copies —
    // forces, défis et paliers se lisent sur les copies, pas sur la pratique. « Aucune donnée » s'y juge donc sur
    // les copies elles-mêmes. (Première écriture du lot : `null` compté comme 0 ; un élève SANS présence saisie et
    // AVEC des copies voyait « En attente de données » à la place de ses forces — rattrapé par les specs #542.)
    const completionVide = (indices.C === null)
        ? calculerIndicesNDerniersArtefacts(da, true).nbArtefacts === 0
        : indices.C === 0;
    const aucuneDonnee = (indices.A === null || indices.A === 0) && completionVide && indices.P === 0;

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
                    <p class="u-mb-8"><button type="button" class="lien-reglages" data-action="ouvrirOutilsObservation" title="Ouvrir Labo › Outils d'observation, où se règlent le dépistage et ses seuils">Régler les outils d'observation</button></p>
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
    // #542 A3 — ce que le dépistage n'a PAS pu calculer doit se voir. `null`
    // dans le cas normal : aucun encadré n'apparaît quand tout est convertible.
    const conversionAveugle = (typeof diagnostiquerConversionNiveaux === 'function')
        ? diagnostiquerConversionNiveaux(da) : null;
    const alerteContexte = determinerAlerteContextuelle(da);
    // #790 — LE SIGNALEMENT, RECALCULÉ ICI ET JAMAIS LU D'UN STOCKAGE. Il ne touche
    // pas au palier RàI : celui-ci se construit sur les artefacts complets du
    // trimestre, le signalement dit une autre chose, à côté. Décocher un palier du
    // gabarit le fait disparaître au rechargement suivant, sans migration.
    const signalements = (typeof window.SignalementDepistage !== 'undefined')
        ? window.SignalementDepistage.pourEleve(da, {
            evaluations: obtenirDonneesSelonMode('evaluationsSauvegardees') || [],
            grilles: db.getSync(cle('grillesTemplates'), []) || []
        })
        : [];
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true); // true = dépistage (3 artefacts)
    const progression = calculerProgressionEleve(da);
    // #824 (11 sept. 2026) — l'appel à `identifierDefiSpecifique(da)` qui vivait ici
    // rangeait son résultat dans une variable que rien ne lisait ; retiré. La fonction
    // reste (`profil-etudiant-calculs.js`) : trois sentinelles l'exécutent (#529, #730,
    // audit Suivi du 5 sept.), et le seuil qu'elle lit agit ailleurs par `calculerIPB`.
    const directionsCriteres = calculerDirectionsCriteres(da);

    // Compter le nombre total d'artefacts évalués (pour afficher la fiabilité des données)
    // #360 — exclure les évals remplacées (reprises archivées ET doublons réconciliés) :
    // le « (sur N) » doit refléter le pool réellement compté par le moteur, pas les exclues.
    // Lot A (16 sept. 2026) — le « (sur N) » compte les copies qui comptent, comme les moyennes qu'il qualifie.
    // #1055 (entrée 6.65 de #1083) : sans le travail diagnostique, que les moyennes qualifiées ne lisent pas.
    const copiesSansDiagnostique = window.ProductionDiagnostique.filtrerEvaluations(
        obtenirDonneesSelonMode('evaluationsSauvegardees') || [], obtenirDonneesSelonMode('productions'));
    const evaluationsDA = copiesSansDiagnostique.filter(e => e.etudiantDA === da && window.evaluationEntreDansLaNote(e));
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

    // ✅ Utiliser la fonction dynamique au lieu du tableau SRPNF codé en dur
    const criteres = obtenirCriteresAvecValeurs(da);

    // ⮕ #550 — POURQUOI IL N'Y A PAS DE CRITÈRES, quand il n'y en a pas.
    //
    // `obtenirCriteresAvecValeurs` rend un tableau VIDE dès qu'aucune grille de
    // référence n'est utilisable, et l'écran n'avait aucun moyen de savoir
    // laquelle des trois causes s'appliquait. Il affichait donc « Aucune force
    // ni défi identifié selon la taxonomie SOLO » — une phrase qui se lit comme
    // un verdict rassurant SUR L'ÉLÈVE. Symptôme vécu par Grégoire le 27 août au
    // matin : sa carte était rassurante et sa liste de critères vide, alors que
    // rien n'avait pu être comparé.
    //
    // ⮕ UN SEUL DIAGNOSTIC POUR LES DEUX BLOCS qui en dépendent — la liste
    // « Progression par critère » et la carte « Observation de la structure ».
    // Le refaire dans chacun coûterait deux lectures de la base pour un résultat
    // identique, et surtout ferait diverger les deux messages le jour où l'un
    // des deux serait retouché.
    const lectureGrille = (typeof diagnostiquerGrilleReferenceDepistage === 'function')
        ? diagnostiquerGrilleReferenceDepistage()
        : { grille: null, raison: null, message: '' };

    // ⚠⚠ #542 lot 3, pas 3c-3 — LE PARTAGE forces/défis A DISPARU AVEC LES SEUILS
    // QUI LE FAISAIENT.
    //
    // Ce qui vivait ici :
    //     const seuilMaitrise    = obtenirSeuil('idme.maitrise');      // 0,85
    //     const seuilDeveloppement = obtenirSeuil('idme.developpement'); // 0,75
    //     const forces = criteres.filter(c => c.valeur >= seuilMaitrise);
    //     const defis  = criteres.filter(c => c.valeur > 0 && c.valeur < seuilMaitrise);
    //
    // Ces deux tableaux n'avaient qu'UN consommateur — la carte « Observation de
    // la structure » — et elle regroupe désormais les critères par NIVEAU DE
    // L'ÉCHELLE. La frontière « à partir d'ici c'est une force » n'était pas une
    // observation, c'était le seuil de Grégoire écrit dans le code.
    //
    // ⮕ CE QUI EST PRÉSERVÉ DE LEUR DÉFINITION, et déplacé dans la carte :
    // l'exclusion des critères à valeur 0 (`c.valeur > 0`). Voir le commentaire
    // sur `criteresSOLO` — le « 0 » est un jugement suspendu.


    // ⚠⚠ #552 — `cibleInfo`, `badgeClasse` ET `badgeLabel` ONT ÉTÉ RETIRÉS :
    // ILS ÉTAIENT ASSIGNÉS ET JAMAIS LUS.
    //
    // Ce qui vivait ici : un appel à `determinerCibleIntervention(da)` marqué
    // « Conservé pour compatibilité (sera retiré plus tard) », dont le seul usage
    // était de remplir deux variables locales à partir de `cibleInfo.niveau`.
    //
    // ⮕ CE QUE LA VÉRIFICATION A MONTRÉ. Grep sur tout le fichier : quatre
    // écritures de `badgeClasse`, quatre de `badgeLabel`, AUCUNE lecture. Le
    // badge RàI réellement rendu plus bas lit `niveauRai.badgeClasse` — une
    // autre source, `determinerNiveauRaiPedagogique`, que le skill `depistage-rai`
    // désigne comme la source unique du niveau RàI. Même patron que
    // `patternTexte` et `interpP`, retirés au lot 3 de #542.
    //
    // ⮕ Conséquence : l'écran d'accompagnement n'appelle plus
    // `determinerCibleIntervention`. Son seul appelant vivant est
    // `tableau-bord-apercu.js`, qui n'en lit que `.pattern`.

    // ⚠⚠ #542 lot 3, pas 3c-3 — `interpreterScoreIDME` A ÉTÉ SUPPRIMÉE, ET
    // ELLE N'A PAS ÉTÉ REMPLACÉE : ELLE NE S'AFFICHAIT NULLE PART.
    //
    // Ce qui vivait ici : une fonction locale qui comparait un score aux trois
    // seuils `idme.*` (0,64 / 0,75 / 0,85 — les bornes de l'échelle de Grégoire
    // recopiées dans le code) pour choisir l'une de QUATRE descriptions SOLO
    // courtes, puis un `patternTexte` qui les assemblait :
    //     `Défi spécifique (Structure - Plusieurs aspects sans vision d'ensemble)`
    //
    // ⮕ CE QUE LA VÉRIFICATION A MONTRÉ, ET QUI CHANGE LE GESTE. `patternTexte`
    // était ASSIGNÉ et jamais LU : deux occurrences dans tout le fichier, la
    // déclaration et la réassignation. Le badge de pattern affiché à l'écran est
    // `niveauRai.pattern` (`determinerNiveauRaiPedagogique`), qui ne passe pas
    // par ici. Ces quatre descriptions n'ont donc jamais atteint un écran.
    //
    // ⮕ Les brancher sur l'échelle de l'utilisateur aurait été rendre vivant du
    // code mort. La consigne du lot demandait de retirer les seuils en dur ; ici
    // le retrait est complet, sans substitut, et c'est la règle zéro-dette du
    // projet : un chantier RETIRE ce qu'il remplace.
    //
    // ⮕ Leur texte n'est pas perdu pour autant : les quatre descriptions ont été
    // rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`) au pas 2 — puis
    // remplacées par les formulations longues, décision D4 de Grégoire du
    // 27 août. C'est là qu'elles vivent désormais, attachées à l'étiquette SOLO
    // du niveau et non à un seuil écrit dans le code.
    //
    // Verrouillé par `tests/unit/sentinelle-542-3c3-depistage-sans-seuils.test.js`.

    let html = `
        <!-- Détails de la section (masqué par défaut) -->
        <div id="details-calculs-accompagnement-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>À propos de cette section</strong>
            <br><br>
            <strong>Objectif :</strong> Cette section centralise les indicateurs de suivi et l'historique complet des interventions RàI (Réponse à l'Intervention). Elle permet d'orienter les décisions d'accompagnement pédagogique et de documenter les observations spécifiques.
            <br><br>
            <strong>Contenu :</strong> Niveau d'intervention RàI recommandé (1, 2 ou 3) • Indicateurs de risque, pattern d'apprentissage et progression • Services adaptés (SA, mesure d'aide) pour contextualiser l'accompagnement • Échelle visuelle de positionnement du risque • Liste chronologique des interventions documentées
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
                <p class="u-mb-8"><button type="button" class="lien-reglages" data-action="ouvrirOutilsObservation" title="Ouvrir Labo › Outils d'observation, où se règlent le dépistage et ses seuils">Régler les outils d'observation</button></p>

                <div class="badge-sys ${niveauRai.badgeClasse}">
                    ${niveauRai.label}
                </div>

                <!-- #542 A3 — le dépistage s'avoue aveugle plutôt que de rendre
                     un verdict rassurant. Placé JUSTE SOUS le badge de niveau,
                     donc avant tout chiffre : il faut le lire avant de lire ce
                     qu'il disqualifie, pas après. -->
                ${conversionAveugle ? `
                <div style="margin: 12px 0; padding: 10px 12px; background: var(--alerte-fond-attention, rgba(232,168,56,0.10)); border-left: 3px solid var(--orange-attention, #e8a838); border-radius: 0 4px 4px 0; font-size: 0.85rem; color: var(--gris-fonce);">
                    <strong style="color: var(--orange-attention, #e8a838);">Dépistage incomplet</strong><br>
                    ${echapperHtml(conversionAveugle.message)}
                </div>` : ''}

                <!-- #790 — LE SIGNALEMENT : sous le badge, donc À CÔTÉ du palier et
                     jamais dedans. Sa phrase vient du gabarit de la grille, pas du
                     code : un enseignant de chimie y lit la sienne. -->
                ${signalements.length ? `
                <div class="profil-signalement">
                    ${signalements.map((sig) => `
                    <div class="profil-signalement-ligne">
                        <span class="profil-signalement-libelle">${echapperHtml(sig.libelle)}</span>
                        <span class="profil-signalement-source">Palier « ${echapperHtml(sig.palier)} »${sig.critereNom ? ' — ' + echapperHtml(sig.critereNom) : ''}</span>
                    </div>`).join('')}
                    <button class="btn btn-secondaire profil-signalement-btn" data-action="naviguerVersNouvelleIntervention" data-param="${echapperHtml(da)}">Ouvrir une intervention</button>
                </div>` : ''}

                <p class="profil-texte-paragraphe">
                    <strong>Performance globale (P) :</strong> ${(() => {
                        const pct = indices.P;

                        // Lot N4 (#713) — UNE NOTE ABSENTE S'ÉCRIT « — », AVEC SA CAUSE. `indices.P` vaut alors le 0
                        // du stockage (#394) : l'écrire ici donnait « 0% » sous une note qui n'existe pas.
                        if (indices.noteConstructible === false) {
                            const cause = (typeof causeNoteNonConstructible === 'function') ? causeNoteNonConstructible(da) : null;
                            return '—' + (cause ? `<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">${echapperHtml(cause)}</span>` : '');
                        }

                        // ⚠⚠ #542 lot 3, pas 3c — LE NIVEAU VIENT DE LA PRATIQUE,
                        // PLUS D'UN TERNAIRE.
                        //
                        // Ce qui vivait ici, en clair :
                        //     pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I'
                        // Les bornes de l'échelle de Grégoire écrites dans le code,
                        // sans même passer par `obtenirSeuil` — donc invisibles à
                        // une recherche sur `idme.`. Elles affichaient un niveau
                        // IDME pour TOUT LE MONDE, y compris sous une pratique
                        // sommative dont la note globale est un pourcentage
                        // pondéré et n'a jamais prétendu être un niveau atteint.
                        //
                        // ⮕ DÉCISION DE GRÉGOIRE, 27 août 2026 : « c'est la
                        // pratique de notation qui établit la note globale de
                        // l'élève ». C'est donc elle qui dit dans quoi cette note
                        // se lit — et la sommative répond « aucune échelle »,
                        // ce qui est la bonne réponse, pas un manque.
                        //
                        // ⮕ #575 — LE CORPS DE CE RAISONNEMENT A ÉMIGRÉ dans
                        // `lireNiveauNoteGlobale` (`profil-etudiant-helpers.js`).
                        // Il était juste ici ; il était FAUX vingt écrans plus bas,
                        // où le bloc « Développement des habiletés » gardait un
                        // ternaire IDME en dur. Une règle à deux endroits finit
                        // toujours par diverger — celle-ci l'avait déjà fait.
                        const lectureNiveau = (typeof lireNiveauNoteGlobale === 'function')
                            ? lireNiveauNoteGlobale(da, pct)
                            : { niveau: null, survol: '', raison: 'helper-absent' };
                        const niveauGlobal = lectureNiveau.niveau;
                        const survolNiveau = lectureNiveau.survol;
                        const prefixeNiveau = niveauGlobal
                            ? `<span title="${echapperHtml(survolNiveau)}">${echapperHtml(String(niveauGlobal.code))}</span> `
                            : '';
                        // Sans niveau, le pourcentage porte lui-même l'explication.
                        // Elle n'est PAS affichée en permanence : une pratique
                        // sommative qui n'a pas de niveau n'est pas en panne, et un
                        // avertissement permanent le laisserait croire.
                        const survolPourcentage = niveauGlobal ? '' : ` title="${echapperHtml(survolNiveau)}"`;

                        // Obtenir la configuration pour afficher le nombre d'artefacts retenus
                        const config = db.getSync(cle('modalitesEvaluation'), null) || {};
                        // #328 L2-b2 : type dérivé de la SSOT (helper D2). Lot N1b : plus de défaut — null sans pratique.
                        const pratique = (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null);

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
                        // #706 — ce que la note n'a pas compté, dit à côté du chiffre.
                        const phraseEcartees = _phraseEvaluationsEcartees(
                            (typeof compterEvaluationsEcarteesDeLaNote === 'function') ? compterEvaluationsEcarteesDeLaNote(da) : null);
                        return `${prefixeNiveau}<span${survolPourcentage}>${pct.toFixed(0)}%</span> <span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal;">(sur ${nbTotalArtefacts} ${termeArtefact})</span>${noteExplicative}${phraseEcartees}`;
                    })()}
                </p>

                <p class="profil-texte-paragraphe" style="margin-top: 12px;"><strong>Progression par critère :</strong> <span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal;">(moyennes sur ${accordTermeProduction('tous', 2)} les ${obtenirTermeProduction('pluriel')})</span></p>
                <ul style="margin-left: 20px; color: var(--gris-fonce); font-size: 0.9rem;">
                    ${(() => {
                        // ⚠⚠ #542 lot 3, pas 3c-2 — LE NIVEAU D'UN CRITÈRE VIENT DE
                        // L'ÉCHELLE, PLUS D'UN TERNAIRE.
                        //
                        // Ce qui vivait ici, en clair :
                        //     pct >= 85 ? 'E' : pct >= 75 ? 'M' : pct >= 65 ? 'D' : 'I'
                        // Le jumeau exact de celui que le pas 3c-1 a retiré de la
                        // performance globale, dans le même fichier, à soixante lignes
                        // d'écart.
                        //
                        // ⮕ MAIS LA SOURCE DE L'ÉCHELLE N'EST PAS LA MÊME, et c'est le
                        // point de ce pas. Grégoire a tranché le 27 août : « c'est la
                        // pratique de notation qui établit la note GLOBALE de l'élève ».
                        // La note globale, donc — pas les critères. Un critère est évalué
                        // PAR l'échelle de la grille, quelle que soit la pratique : même
                        // en sommative, chaque critère reçoit un niveau avant d'être
                        // converti en note. On demande donc l'échelle aux ÉVALUATIONS,
                        // pas à la pratique.
                        //
                        // ⮕ UNE SEULE RÉSOLUTION POUR TOUTE LA LISTE, hors de la boucle :
                        // la refaire par critère coûterait N lectures de la base pour un
                        // résultat identique.
                        const lectureCriteres = (typeof obtenirEchelleCommuneDesEvaluations === 'function')
                            ? obtenirEchelleCommuneDesEvaluations(da)
                            : { echelle: null, raison: 'helper-absent', message: '' };

                        // ⮕ #550 — UNE LISTE VIDE NE DIT RIEN, ET C'EST CE QUI A
                        // ÉTÉ VÉCU. Le 27 août au matin, ce bloc était vide chez
                        // Grégoire : aucune ligne, aucun message, aucune cause.
                        // Une liste vide se lit comme « rien à signaler » alors
                        // qu'elle voulait dire « je n'ai aucun critère ».
                        if (criteres.length === 0) {
                            return '<li class="u-texte-gris" style="list-style: none; margin-left: -20px; font-style: italic;">'
                                + echapperHtml(lectureGrille.message
                                    || 'Aucun critère à afficher pour l\'instant.')
                                + '</li>';
                        }

                        return criteres.map(c => {
                            const pct = c.valeur * 100;
                            const niveauCritere = lectureCriteres.echelle
                                ? situerPourcentageDansEchelle(pct, lectureCriteres.echelle)
                                : null;
                            const lectureSOLOCritere = interpreterNiveauAtteint(niveauCritere);

                            // Même règle qu'au pas 3c-1 : le niveau se lit, SOLO explique
                            // au survol. Sans niveau, le pourcentage porte la raison —
                            // et elle est la même pour toute la liste, d'où un seul
                            // message plutôt qu'un par ligne.
                            const survolCritere = niveauCritere
                                ? (lectureSOLOCritere.interpretee
                                    ? lectureSOLOCritere.libelleSOLO + ' — ' + lectureSOLOCritere.texte
                                    : (lectureSOLOCritere.texte || '') + (lectureSOLOCritere.message ? ' · ' + lectureSOLOCritere.message : ''))
                                : (lectureCriteres.message || '');
                            const codeCritere = niveauCritere
                                ? `<span title="${echapperHtml(survolCritere)}">${echapperHtml(String(niveauCritere.code))}</span> `
                                : '';
                            const survolPct = niveauCritere ? '' : ` title="${echapperHtml(survolCritere)}"`;

                            // #553 — `calculerDirectionsCriteres` indexe par le nom normalisé ENTIER :
                            // le rabotage vers « francais » qui vivait ici ne trouvait jamais la
                            // direction d'un critère « Français… ».
                            const dir = directionsCriteres ? directionsCriteres[c.cleNormalisee] : null;
                            const symbDir = dir && dir.symbole ? ' ' + dir.symbole : '';
                            return `<li>${echapperHtml(c.nom)} : ${codeCritere}<span${survolPct}>${pct.toFixed(0)}%</span>${symbDir}</li>`;
                        }).join('');
                    })()}
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

                ${_ligneDescriptionContexte(alerteContexte)}

                <p class="u-texte-09 u-texte-gris" style="line-height: 1.5;">
                    ${alerteContexte.recommandation}
                </p>

                <div class="profil-separateur-section"></div>

                <p class="profil-texte-detail-compact">
                    <strong>Services adaptés :</strong> ${etudiant.caf === 'Oui' ? 'Mesure d\'aide' : ''}${etudiant.caf === 'Oui' && etudiant.sa === 'Oui' ? ', ' : ''}${etudiant.sa === 'Oui' ? 'SA' : ''} ${etudiant.caf !== 'Oui' && etudiant.sa !== 'Oui' ? 'Aucun' : ''}
                </p>

                <button data-action="ouvrirModalConfidentiel" data-param="${da}" class="btn btn-secondaire" style="margin-top: 12px; font-size: 0.85rem;" data-tooltip="profil-confidentiel">
                    <img src="icons/icon-lock.svg" alt="" class="btn-inline-icon"> Confidentiel ${_pastilleConfidentielVisible(da) ? '<span style="color: var(--vert-principal);">\u25CF</span>' : ''}
                </button>
            </div>

            <!-- Carte 3 : Observation de la structure des résultats d'apprentissage (SOLO) - Optionnelle -->
            ${(() => {
                const afficherSOLO = obtenirPreference('afficherDescriptionsSOLO') !== false;

                if (!afficherSOLO) {
                    return ''; // Ne rien afficher si désactivé
                }

                // ⚠⚠ #542 lot 3, pas 3c-3 — UN BLOC PAR NIVEAU DE L'ÉCHELLE, PLUS
                // QUATRE BLOCS FIGÉS.
                //
                // CE QUI VIVAIT ICI. Quatre blocs écrits dans le code — « Forces
                // exceptionnelles », « Forces identifiées », « Défis en
                // développement », « Défis critiques » — choisis par quatre
                // comparaisons en dur : `>= 0.85`, `>= seuilMaitrise && < 0.85`,
                // `>= idme.insuffisant && < seuilDeveloppement`, `< idme.insuffisant`.
                // Chacun portait EN CLAIR un code IDME (« Maîtrisé et étendu (E) »)
                // et une description SOLO. C'était le plus gros des six sites du
                // lot, et le seul qui ne se réduisait pas à un remplacement de
                // texte : les seuils ne décidaient pas d'un libellé, ils décidaient
                // de QUELS BLOCS EXISTENT.
                //
                // ⮕ DÉCISION DE GRÉGOIRE, 27 août 2026 : « un bloc par niveau ».
                // Les quatre en-têtes Forces/Défis disparaissent. Chaque bloc porte
                // le NOM que l'utilisateur a donné à SON niveau, sa couleur, et les
                // critères qui y tombent. Une échelle de trois niveaux rend trois
                // blocs ; une de sept en rend sept.
                //
                // ⮕ DEUX OPTIONS ÉCARTÉES CE JOUR-LÀ, et il faut savoir pourquoi
                // avant de les rouvrir :
                //   · dériver Forces/Défis de l'étiquette SOLO (relationnel et
                //     au-dessus = force). Écartée : la règle « relationnel = force »
                //     serait une valeur métier de retour dans le code — ce que le
                //     lot entier s'emploie à retirer — et elle resterait muette tant
                //     qu'aucune échelle n'est étiquetée, ce qui est le cas
                //     aujourd'hui de toutes les échelles réelles.
                //   · ajouter à l'échelle un champ « ce niveau marque la maîtrise ».
                //     Pas écartée sur le fond (elle servirait aussi à #549), mais
                //     elle ajoute un champ, un écran d'édition et une migration :
                //     c'est un chantier, pas un pas.
                //
                // ⮕ CE QUI SITUE, ET POURQUOI CETTE ÉCHELLE-LÀ. Un critère est
                // évalué PAR l'échelle de la grille, quelle que soit la pratique —
                // même raisonnement qu'au pas 3c-2, et même source :
                // `obtenirEchelleCommuneDesEvaluations`. La note GLOBALE, elle,
                // demande son échelle à la PRATIQUE (pas 3c-1). Les deux sources
                // sont différentes, et c'est délibéré.
                const lectureStructure = (typeof obtenirEchelleCommuneDesEvaluations === 'function')
                    ? obtenirEchelleCommuneDesEvaluations(da)
                    : { echelle: null, raison: 'helper-absent', message: '' };

                // ⚠⚠ #537 (27 août 2026) — L'EXCLUSION DU CRITÈRE « Français » A ÉTÉ
                // RETIRÉE, ET C'EST UNE DÉCISION DE GRÉGOIRE, PAS UNE CONSÉQUENCE
                // TECHNIQUE.
                //
                // Ce qui vivait ici : `c.nom !== 'Français'`. Le commentaire qui
                // l'accompagnait disait pourquoi #529 puis le lot 3 de #542 l'avaient
                // laissé — « c'est un jugement pédagogique de Grégoire : un critère
                // linguistique n'a rien à dire sur la structure cognitive », donc pas
                // à un refactor de le trancher.
                //
                // ⮕ IL L'A TRANCHÉ LE 27 AOÛT 2026 : « le critère de langue est un
                // critère comme un autre », sans statut propre. ⮕ CONSÉQUENCE ASSUMÉE,
                // confirmée explicitement le même jour : SON critère Français apparaît
                // désormais dans cette carte, dont il était exclu. C'était le dernier
                // nom de critère écrit en dur du chantier #552 · #535 · #537.
                //
                // ⮕ `valeur > 0` est préservé aussi, et pour une raison plus
                // profonde : le « 0 » est un JUGEMENT SUSPENDU, pas une performance
                // nulle. Un travail non recevable ne dit rien de la structure des
                // apprentissages, et l'ancien code l'écartait déjà (`defis` le
                // filtrait, `forces` ne pouvait pas le contenir). Le regroupement
                // par niveau le ferait tomber dans le niveau « 0 » de l'échelle de
                // Grégoire, qui couvre 0-0 : il serait affiché comme un résultat.
                const criteresSOLO = criteres.filter(c => c.valeur > 0);

                const enteteCarte = `
            <!-- Carte SOLO : positionnée au centre via order (26 mai PM2) -->
            <div class="profil-carte" style="order: 2">
                <h2 class="profil-section-titre-sous" data-tooltip="profil-accomp-solo">Observation de la structure des résultats d'apprentissage</h2>`;
                const piedCarte = `
                <div class="profil-separateur-section"></div>
                <p class="profil-texte-mini-gris">
                    Basé sur les travaux de Biggs &amp; Collis (taxonomie SOLO)
                </p>
            </div>`;

                // ⮕ SANS ÉCHELLE, LA CARTE DIT LAQUELLE MANQUE. L'ancien message
                // — « Aucune force ni défi identifié selon la taxonomie SOLO » —
                // était le défaut A2/A3 que le lot 1 a refermé ailleurs : un verdict
                // rassurant là où le dépistage n'avait rien pu comparer.
                // `obtenirEchelleCommuneDesEvaluations` NOMME la cause (aucune
                // évaluation, échelle introuvable, échelles divergentes), et c'est
                // elle qu'on affiche.
                if (!lectureStructure.echelle) {
                    return enteteCarte + `
                <p class="profil-texte-italique-gris">
                    ${echapperHtml(lectureStructure.message || 'La structure des résultats ne peut pas être observée : aucune échelle commune n\'a pu être établie pour cet élève.')}
                </p>` + piedCarte;
                }

                if (criteresSOLO.length === 0) {
                    // ⮕ #550 — LA CAUSE D'ABORD, ET DANS CET ORDRE. Sans grille
                    // de référence utilisable, il n'y a pas de critères du tout :
                    // c'est plus fondamental que « aucun n'est situable », et le
                    // dire en second reviendrait à décrire la conséquence en
                    // laissant la cause muette.
                    return enteteCarte + `
                <p class="profil-texte-italique-gris">
                    ${echapperHtml(lectureGrille.message
                        || 'Aucun critère évalué à situer dans l\'échelle pour l\'instant.')}
                </p>` + piedCarte;
                }

                // Un bloc par niveau ATTEINT. Les niveaux où aucun critère ne tombe
                // n'apparaissent pas : la carte montre la structure observée, pas
                // l'échelle en entier.
                //
                // ⮕ REGROUPEMENT PAR IDENTITÉ D'OBJET. `situerPourcentageDansEchelle`
                // rend le niveau lui-même, pris dans le tableau `niveaux` de
                // l'échelle : deux critères au même niveau rendent la MÊME
                // référence. La `Map` s'en sert comme clé — aucune clé fabriquée à
                // partir du code ou du nom, qui peuvent être vides tous les deux
                // (`echelles.js` en produit : `{ code: '', nom: '', min: 90, ... }`).
                const parNiveau = new Map();
                const horsEchelle = [];
                criteresSOLO.forEach(c => {
                    const niveau = situerPourcentageDansEchelle(c.valeur * 100, lectureStructure.echelle);
                    if (!niveau) { horsEchelle.push(c); return; }
                    if (!parNiveau.has(niveau)) parNiveau.set(niveau, []);
                    parNiveau.get(niveau).push(c);
                });

                // Du plus haut au plus bas, par borne inférieure décroissante.
                // ⮕ L'ORDRE DU TABLEAU `niveaux` N'EST PAS UTILISÉ : rien n'oblige
                // l'utilisateur à saisir ses niveaux dans l'ordre, et un ordre de
                // saisie n'est pas un ordre de mérite. `min` est numérique et
                // garanti présent — sans lui, `situerPourcentageDansEchelle` n'aurait
                // rien rendu pour ce niveau.
                const blocs = Array.from(parNiveau.entries())
                    .sort((a, b) => Number(b[0].min) - Number(a[0].min));

                // Une couleur d'échelle est une donnée UTILISATEUR, et elle part dans
                // un attribut `style`. `echapperHtml` ne suffirait pas ici : elle
                // neutralise l'évasion d'attribut, pas l'injection de CSS. On
                // n'accepte donc qu'un code hexadécimal, et rien d'autre.
                // #575 — cette fermeture locale est devenue `couleurCssSure`
                // (`profil-etudiant-helpers.js`) : elle était juste, mais
                // inaccessible aux autres sites qui injectent une couleur
                // d'échelle. Les badges d'artefacts, eux, n'avaient aucun filtre.
                const couleurSure = couleurCssSure;

                let corps = '';
                let uneEtiquetteManque = false;

                blocs.forEach(([niveau, criteresDuNiveau], index) => {
                    const lecture = interpreterNiveauAtteint(niveau);
                    if (!lecture.interpretee) uneEtiquetteManque = true;

                    const couleur = couleurSure(niveau.couleur);
                    const nom = String(niveau.nom == null ? '' : niveau.nom).trim();
                    const code = String(niveau.code == null ? '' : niveau.code).trim();
                    // Sans nom ni code, la PLAGE est ce que ce niveau porte de plus
                    // identifiant. Ce n'est pas un repli inventé : c'est la seule
                    // chose que l'utilisateur ait saisie pour lui.
                    const titre = nom
                        ? (code ? nom + ' (' + code + ')' : nom)
                        : (code || (niveau.min + ' – ' + niveau.max + ' %'));

                    corps += `
                <div style="margin-bottom: ${index === blocs.length - 1 && horsEchelle.length === 0 ? '0' : '12px'};">
                    <h4 style="color: ${couleur}; font-size: 0.9rem; margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
                        ${echapperHtml(titre)}
                    </h4>
                    <div style="background: ${couleur}22; border-left: 4px solid ${couleur}; padding: 10px 12px;">
                        <div style="font-weight: bold; color: ${couleur};">
                            ${criteresDuNiveau.map(c => echapperHtml(c.nom)).join(', ')}
                        </div>
                        ${lecture.interpretee ? `<div class="profil-texte-explicatif">${echapperHtml(lecture.texte)}</div>` : ''}
                    </div>
                </div>`;
                });

                // Les critères qu'AUCUNE plage ne contient. `situerPourcentageDansEchelle`
                // rend `null` sans repli « niveau le plus proche » — décision du pas 1,
                // et son motif : un repli fabrique une réponse que l'échelle ne donne
                // pas. C'est donc ici que l'absence se dit, plutôt que dans un bloc
                // qui aurait l'apparence d'un niveau.
                if (horsEchelle.length > 0) {
                    corps += `
                <p class="profil-texte-mini-gris" style="margin-top: 12px;">
                    ${echapperHtml(horsEchelle.map(c => c.nom).join(', '))} : aucun niveau de l'échelle ne couvre cette moyenne.
                </p>`;
                }

                // ⮕ L'ABSENCE D'ÉTIQUETTE SOLO EST DITE UNE FOIS, PAS UNE FOIS PAR
                // BLOC. C'est l'option B tranchée par Grégoire le 27 août : le niveau
                // atteint s'affiche tel qu'il l'a nommé, et ce qui manque est nommé
                // aussi. Répéter le même avis sous chaque bloc le rendrait illisible
                // — c'est le patron « un seul message plutôt qu'un par ligne » déjà
                // retenu au pas 3c-2 pour la liste des critères.
                //
                // ⚠ AUJOURD'HUI, AUCUNE ÉCHELLE RÉELLE NE PORTE D'ÉTIQUETTE : cet
                // avis est donc le SEUL comportement du pas 3c-3 observable sur les
                // données de Grégoire, et c'est lui qu'une porte terrain doit
                // regarder. Le reste se prouve sur une échelle fabriquée en test.
                const avisEtiquette = uneEtiquetteManque ? `
                <p class="profil-texte-mini-gris" style="margin-top: 12px;">
                    Les niveaux sont affichés tels que tu les as nommés. Pour obtenir une
                    interprétation en termes de taxonomie SOLO, associe une étiquette SOLO
                    à chaque niveau de ton échelle, dans l'éditeur d'échelles.
                </p>` : '';

                return enteteCarte + corps + avisEtiquette + piedCarte;
            })()}
        </div>

        <!-- Historique compact -->
        <div class="u-mt-15">
            <div class="u-flex-between u-mb-10">
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
        // Lot A de l'enregistrement (#751) : la note individuelle, texte libre, est masquée en
        // anonymisation ; la note et le titre passent par echapperHtml (règle 1, ils ne l'étaient pas).
        const modeAnonymisation = typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation();
        const noteIndividuelle = intervention.notesIndividuelles?.[da] || '';
        const niveauRai = intervention.niveauRai || 3;

        // Déterminer le texte du badge (titre ou niveau)
        let badgeTexte = '';
        if (intervention.titre) {
            badgeTexte = typeof window.titreInterventionAffiche === 'function'
                ? window.titreInterventionAffiche(intervention) : intervention.titre;   // Lot A, R4
        } else {
            badgeTexte = niveauRai === 1 ? 'Rattrapage (1)' : niveauRai === 2 ? 'Rattrapage (2)' : 'Intervention niveau 3';
        }

        html += `
            <div class="intervention-timeline-item">
                <div class="u-flex-gap-12 u-align-center" style="flex: 1;">
                    <span class="badge-intervention-vert">
                        ${typeLibelle} · ${echapperHtml(badgeTexte)}
                    </span>
                    <span class="u-texte-bleu" style="font-weight: 600; font-size: 0.9rem;">
                        ${dateFormatee}
                    </span>
                    ${noteIndividuelle ? `
                        <span class="u-texte-gris u-texte-09" style="flex: 1;">
                            ${modeAnonymisation
                                ? '<em>' + echapperHtml(window.MENTION_MASQUE_ANONYMISATION) + '</em>'
                                : echapperHtml(noteIndividuelle)}
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
 * ⚠ SANS APPELANT (mesuré le 19 sept. 2026) : seule la sentinelle #821a l'exécute. Si elle revit :
 * un A inconnu (`null`, #743) s'y écrirait « null% » et « Assiduité critique ».
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

    // #821 lot A (10 sept. 2026) — les bornes de l'interprétation A-C ont UNE
    // source, `BORNES_MOBILISATION` (contexte-qualification.js). Les blocs de
    // recommandation les lisent, et la prose écrit les mêmes chiffres qu'elles.
    const B = BORNES_MOBILISATION;
    const pctCritique = Math.round(B.critique * 100);
    const pctFragile = Math.round(B.fragile * 100);
    const pctFavorable = Math.round(B.favorable * 100);

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
                ${interpM.code === 'decrochage' ?
                    "L'étudiant ne se présente plus au cours. Les interventions pédagogiques ne sont plus possibles. Référer aux services d'aide et à l'API." :
                  interpM.code === 'critiques' ?
                    `Situation critique : présence ET remise des travaux sous ${pctCritique}%. Intervention RàI niveau 3 immédiate requise.` :
                  interpM.code === 'assiduite-critique' ?
                    `Assiduité critique (< ${pctCritique}%). La présence irrégulière compromet l'apprentissage. Intervention prioritaire sur l'engagement comportemental.` :
                  interpM.code === 'completion-critique' ?
                    `Complétion critique (< ${pctCritique}%). Les travaux ne sont pas remis. Investigation des obstacles organisationnels ou motivationnels nécessaire.` :
                  interpM.code === 'fragile' ?
                    `Les deux composantes (A et C) sont entre ${pctCritique}-${pctFragile}%. Soutien proactif recommandé pour stabiliser l'engagement.` :
                  interpM.code === 'assiduite-fragile' ?
                    `L'assiduité est entre ${pctCritique}-${pctFragile}% alors que la complétion est satisfaisante. Renforcer la présence en classe.` :
                  interpM.code === 'completion-fragile' ?
                    `La complétion est entre ${pctCritique}-${pctFragile}% alors que l'assiduité est satisfaisante. Soutenir l'organisation et la planification.` :
                  interpM.code === 'favorable' ?
                    `Excellent engagement comportemental. Assiduité et complétion ≥ ${pctFavorable}%. Maintenir cette dynamique positive.` :
                    `Engagement comportemental satisfaisant. Assiduité et complétion ≥ ${pctFragile}%. Continuer la surveillance de niveau 1.`}
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
        ${interpM.code === 'decrochage' ? `
            <div style="background: var(--gris-tres-pale); border-left: 4px solid var(--gris-clair); padding: 15px;">
                <h4 style="color: var(--gris-fonce); margin-bottom: 10px;">Actions requises</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--gris-fonce); line-height: 1.6;">
                    <li>Contact immédiat avec l'aide pédagogique individuelle (API)</li>
                    <li>Tentative de contact direct (téléphone, courriel)</li>
                    <li>Référence aux services d'aide psychosociale si pertinent</li>
                    <li>Documentation du dossier étudiant</li>
                </ul>
            </div>
        ` : (A < B.critique || C < B.critique) ? `
            <div style="background: ${A < B.critique && C < B.critique ? 'rgba(232,64,87,0.12)' : 'rgba(200,160,96,0.12)'};
                        border-left: 4px solid ${A < B.critique && C < B.critique ? '#e84057' : '#c8a060'};
                        padding: 15px; border-radius: 6px;">
                <h4 style="color: ${A < B.critique && C < B.critique ? '#f06878' : '#d4b878'}; margin-bottom: 10px;">
                    Recommandations d'intervention (niveau critique)
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: ${A < B.critique && C < B.critique ? '#f06878' : '#d4b878'}; line-height: 1.6;">
                    ${A < B.critique && C < B.critique ?
                        '<li><strong>Intervention RàI niveau 3 immédiate</strong> - Les deux composantes sont critiques</li>' : ''}
                    ${A < B.critique ?
                        '<li><strong>Assiduité critique :</strong> Rencontre immédiate pour identifier les causes d\'absence</li>' : ''}
                    ${C < B.critique ?
                        '<li><strong>Complétion critique :</strong> Investigation des obstacles à la remise des travaux</li>' : ''}
                    <li>Établir un plan d'intervention personnalisé (PIP) avec objectifs mesurables</li>
                    <li>Suivi hebdomadaire jusqu'à amélioration significative</li>
                    <li>Mobiliser les ressources d'aide (tutorat, aide technologique, etc.)</li>
                </ul>
            </div>
        ` : (A < B.fragile || C < B.fragile) ? `
            <div class="info-box info-box--attention">
                <h4 style="color: var(--alerte-texte-attention); margin-bottom: 10px;">Recommandations préventives (niveau fragile)</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--alerte-texte-attention); line-height: 1.6;">
                    ${A < B.fragile && C < B.fragile ?
                        '<li><strong>Mobilisation fragile :</strong> Soutien sur les deux composantes (présence ET remise)</li>' :
                      A < B.fragile ?
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


/**
 * #942 — Le lecteur « date → titres des leçons » du groupe de cet élève. Le groupe se
 * résout comme au PDF (`groupeCoursIdDeLEleve`), le calcul est l'inverse de celui de
 * l'Inspecteur (`lecteurLeconsDuGroupe`, planification-export.js). Tout maillon absent
 * (module non chargé, élève sans groupe, groupe sans horaire) → un lecteur qui rend [].
 */
function _lecteurLeconsManquees(da) {
    const rien = () => [];
    const synth = window.syntheseRetroactionData;
    const exporteur = window.planificationExport;
    if (!synth || typeof synth.groupeCoursIdDeLEleve !== 'function'
        || !exporteur || typeof exporteur.lecteurLeconsDuGroupe !== 'function') return rien;
    const gcId = synth.groupeCoursIdDeLEleve(da);
    if (!gcId) return rien;
    const gc = (obtenirDonneesSelonMode('groupesCours') || []).find(g => g && g.id === gcId);
    return exporteur.lecteurLeconsDuGroupe(gcId, gc ? gc.coursId : null);
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

    // #871 (17 sept. 2026) — LES PÉRIODES TELLES QUE CALCULÉES, SANS ARRONDI. L'indice A est calculé sur ces
    // valeurs (indices.js, calculerAssiduiteSommative) et la saisie accepte les demi-périodes : arrondies ici,
    // elles donnaient « 90% (23 / 25 périodes) » pour 22,5 / 25. Le pourcentage suit la fraction (Grégoire,
    // 15 sept.) ; la mise en forme (« 22,5 ») appartient à `formaterNombrePeriodes`, aux sites d'affichage.
    const periodesPresentes = Number(detailsSommatif.periodesPresentes) || 0;
    const periodesOffertes = Number(detailsSommatif.periodesOffertes) || 0;
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
    const dureePeriodeMin = typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : (window.DUREE_PERIODE_DEFAUT || 50);

    // Détecter les absences (totales ET partielles)
    const absences = [];

    // Itérer les dates du calendrier filtrées par datesSaisies et <= aujourd'hui
    // #735 (lot D, 19 sept. 2026) : une séance d'AVANT la date d'arrivée n'est pas une absence — même
    // lecteur que le calcul de l'indice (`obtenirDateArrivee`, indices.js).
    const dateArrivee = typeof obtenirDateArrivee === 'function' ? obtenirDateArrivee(da) : null;
    const datesCalendrier = Object.keys(seancesCompletes)
        .filter(d => d <= aujourdhui && datesSaisies.has(d) && !(dateArrivee && d < dateArrivee)).sort();

    datesCalendrier.forEach(dateCours => {
        // Chercher le record NON-facultatif de l'étudiant
        const presenceEleve = presences.find(p => p.da === da && p.date === dateCours && !p.facultatif);

        // Nombre de périodes de la séance
        const periodesSeance = typeof obtenirNombrePeriodesSeance === 'function'
            ? obtenirNombrePeriodesSeance(dateCours) : 0;   // #540 lot C

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

    // #942 — la leçon manquée : ce que la carte d'alignement place à cette date POUR LE GROUPE
    // DE L'ÉLÈVE. Un retard porte aussi le titre (la matière a été en partie manquée) ; aucune
    // leçon ce jour-là → `lecons: []`, rien d'inventé. Lecture seule.
    const leconsA = _lecteurLeconsManquees(da);
    absences.forEach(abs => { abs.lecons = leconsA(abs.date); });

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

// #551 (27 aout 2026) — `genererCarteCibleIntervention` est RETIREE : elle etait
// MORTE. Une seule occurrence dans tout le depot, sa definition ; aucun export
// `window`, aucun appel, aucun dispatch dynamique (`data-action`, table de nom).
//
// ⮕ CE QU'ELLE ETAIT, ET POURQUOI SON RETRAIT COMPTE. Elle rendait la carte
// « Cible d'intervention » et etait LE SEUL consommateur, dans toute
// l'application, de `pratique.identifierPattern(da)` et de
// `pratique.genererCibleIntervention(da)`. Sa mort rend donc muettes les CINQ
// implementations de `identifierPattern` des pratiques (PAN-Standards,
// Sommative, PAN-Specifications, Configurable, et Test jusqu'au 11 oct. 2026) : elles ne sont plus
// atteintes que par `testerPratiqueTest`, une fonction de console jamais
// appelee. (`testerPratiqueFrancois` en etait la seconde : son fichier,
// `js/pratiques/config-francois-chimie.js`, est parti avec #687 — zero lecteur
// mesure, et un prenom de collegue dans une URL servie aux utilisateurs.)
//
// ⚠ LES CINQ IMPLEMENTATIONS RESTENT EN PLACE, et c'est delibere. Contrairement
// aux vestiges du lot 3 de #542, `identifierPattern` et `genererCibleIntervention`
// sont deux des huit methodes OBLIGATOIRES du contrat IPratique, verifiees a
// l'enregistrement (`pratique-registre.js`, `throw` si absentes). Elles sont
// peut-etre sans consommateur parce que le cablage du systeme de pratiques
// n'est pas fini (#307), pas parce qu'elles sont perimees. Les retirer serait
// trancher une direction d'architecture — cf. #551 au backlog.
//
// ⮕ CE QU'ELLE MONTRAIT, et qui n'atteignait personne : un badge « RaI 1/2/3 »,
// la cible d'intervention, le pattern actuel et le nombre de productions
// retenues. Le chemin VIVANT du meme besoin passe par `determinerCibleIntervention`
// (procedural), appele plus haut dans ce fichier par `genererSectionAccompagnement`
// et par `tableau-bord-apercu.js`. Son CSS `.carte-cible-*` est parti avec elle.

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
        // #824 — le `case 'cible'` (« Suivi de l'apprentissage ») appelait
        // `genererContenuCibleIntervention`, définie nulle part : erreur d'exécution si un
        // bouton y avait mené. Inatteignable depuis #551 ; retiré avec sa branche d'aide.
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
    if (section === 'performance') {
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

    // Les copies qui COMPTENT (#737, lot A du 16 sept. 2026 : la règle unique #706 — un brouillon ne
    // compte nulle part ; #730 — sans les remplacées) et qui portent des critères structurés.
    // #1055 : sans le travail diagnostique — il ne trace pas la progression de l'élève.
    const evaluationsEleve = window.ProductionDiagnostique.filtrerEvaluations(evaluations, obtenirDonneesSelonMode('productions') || []).filter(e =>
        e.etudiantDA === da &&
        window.evaluationEntreDansLaNote(e) &&
        e.criteres && Array.isArray(e.criteres) && e.criteres.length > 0
    );

    // Résultat par défaut si données insuffisantes
    const resultatParDefaut = {
        symbole: '',
        interpretation: 'Données insuffisantes'
    };

    // Pas assez de données pour calculer la direction (besoin de N+1 minimum).
    // #529 — l'objet rendu se calque sur la GRILLE de l'utilisateur, plus sur
    // les cinq critères de Grégoire. Les consommateurs lisent ces clés par
    // `directions[cle]` : une clé absente rend `undefined`, ce qu'ils traitent
    // déjà comme « pas de direction ».
    if (evaluationsEleve.length < N + 1) {
        const parDefaut = {};
        const grilleRef = (typeof obtenirGrilleReferenceDepistage === 'function')
            ? obtenirGrilleReferenceDepistage() : null;
        (grilleRef && Array.isArray(grilleRef.criteres) ? grilleRef.criteres : []).forEach(c => {
            if (c && c.nom) parDefaut[cleCritere(c.nom)] = resultatParDefaut;
        });
        return parDefaut;
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // #529 — une table par ÉVALUATION (chacune porte son `echelleId`), et des
    // accumulateurs dérivés des critères RÉELLEMENT rencontrés.
    //
    // CE QUI A DISPARU : cinq accumulateurs littéraux (`structure`, `rigueur`,
    // `plausibilite`, `nuance`, `francais`) alimentés par une cascade de
    // `if / else if` nominale. Un critère « Méthode » tombait dans aucune
    // branche : aucune flèche de direction ne s'affichait pour lui, jamais.
    const cacheTables = new Map();

    const extraireScoresCriteres = (evals) => {
        const scoresCriteres = {};

        evals.forEach(evaluation => {
            if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) return;
            const table = (typeof tableConversionPourEvaluation === 'function')
                ? tableConversionPourEvaluation(evaluation, cacheTables)
                : obtenirTableConversionNiveaux(evaluation.echelleId || null);

            evaluation.criteres.forEach(c => {
                if (!c) return;
                // #739 — la même lecture que les barres : les points d'abord, le niveau sinon.
                const score = scoreCritereEvaluation(c, table);
                if (score === null) return;
                const cle = cleCritere(c.critereNom);
                if (!cle) return;
                if (!scoresCriteres[cle]) scoresCriteres[cle] = [];
                scoresCriteres[cle].push(score);
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

    // Le seuil du curseur « Sensibilité des flèches par critère » (Labo ›
    // Outils d'observation). #823 : la clé garde son nom historique
    // `directionRisque` — c'est une clé de données, pas un mot lu à l'écran ;
    // `calculerDirectionRisque`, qui la lisait aussi sans que son résultat soit
    // jamais lu, est retirée.
    const seuilDirection = obtenirSeuil('directionRisque');

    // Calculer la direction pour chaque critère RENCONTRÉ dans les évaluations,
    // et non pour une liste écrite à l'avance.
    const directions = {};
    const criteres = Array.from(new Set([
        ...Object.keys(scoresRecents),
        ...Object.keys(scoresSuivants)
    ]));

    criteres.forEach(critere => {
        const scoresRec = scoresRecents[critere] || [];
        const scoresSui = scoresSuivants[critere] || [];

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
    // #328 L2-b2 : type dérivé de la SSOT (helper D2). Lot N1b : sans pratique assignée, « — » — aucune
    // des deux valeurs n'est celle d'une pratique (avant : le repli « sommative » montrait valeurSOM).
    const pratique = (typeof obtenirTypePratiqueActive === 'function' ? obtenirTypePratiqueActive() : null);
    if (!pratique) {
        return `<span style="color: var(--gris-clair); font-weight: 600;">—</span>`;
    }
    const valeur = pratique === 'sommative' ? valeurSOM : valeurPAN;
    return `<strong class="profil-valeur-grande-bleu">${valeur}%</strong>`;
}

// === HELPERS PRIVÉS pour afficherProfilComplet (étape 4 éclatement cyc 58 → < 30) ===

/**
 * HELPER : résolution étudiant + état pivot atomique
 * Phase 5 : accepte un élément (depuis data-on-change) ou une chaîne.
 * Retourne { da, etudiants, eleve } — eleve = null si introuvable.
 *
 * #745 (lot E du cadrage du dépistage, 17 sept. 2026) — LE PROFIL D'UN ÉLÈVE EXCLU PAR STATUT
 * S'OUVRE. Mesuré avant le lot : depuis le 16 mars, l'élève était cherché parmi les ACTIFS
 * seulement ; un clic sur sa ligne grisée de la Liste répondait « Étudiant·e introuvable ». La règle
 * tranchée le 16 sept. (« son profil se calcule avec sa pratique, affiche son statut ») n'avait
 * donc aucun écran. L'élève est maintenant cherché dans tout le groupe-cours ; `etudiants` (le
 * sélecteur, Préc. / Suiv.) reste la liste des actifs, plus l'exclu AFFICHÉ, à sa place
 * alphabétique — sinon le sélecteur montrerait le nom d'un autre. Un DA absent du groupe reste
 * introuvable : aucun profil, aucun calcul.
 */
function _resoudreEtudiantProfil(daOuEl) {
    var da = (typeof daOuEl === 'object' && daOuEl !== null) ? daOuEl.value : daOuEl;
    if (da !== null && da !== undefined) da = String(da);

    // 🆕 BETA 95.6 : obtenirEtudiantsCoursActif() pour filtrer par groupe-cours actif
    const tousEtudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : (typeof filtrerEtudiantsParMode === 'function'
            ? filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants'))
            : obtenirDonneesSelonMode('groupeEtudiants').filter(e => e.groupe !== '9999'));
    const eleve = tousEtudiants.find(e => e.da === da);
    const etudiants = tousEtudiants.filter(e => !estEtudiantExclu(e) || e === eleve);
    etudiants.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    window.etudiantsListeCache = etudiants;

    // État pivot dual-write atomique (Écart #6 MODULES-MAP §2.3) — couple non séparé.
    // #867 (15 sept. 2026) : écrit SEULEMENT si l'élève existe. Avant, il l'était en
    // entrée de fonction, donc un DA refusé posait `null` juste avant que l'appelant ne
    // renonce : `changerSectionProfil` sortait ensuite sur « Aucun profil actuel » et la
    // barre latérale du profil affiché ne répondait plus. Un appel qui échoue ne doit pas
    // emporter le profil ouvert.
    if (eleve) {
        profilActuelDA = da;
        window.profilActuelDA = da;
    }

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
 * Active la sous-section « suivi-profil » SANS déclencher un second rendu.
 *
 * ⮕ #754. Le crochet de `navigation.js` (zone protégée, non touchée) reprogramme
 * `afficherProfilComplet(profilActuelDA)` à T+100 ms à chaque
 * `afficherSousSection('suivi-profil')`, sauf si `window._profilAutoChargement`
 * est levé — c'est le drapeau qu'il déclare lui-même « garde anti-réentrance :
 * afficherProfilComplet() appelle afficherSousSection() ». On le lève donc le
 * temps de l'appel : l'ouverture directe (Liste, sélecteur, Suivi du groupe)
 * rend une fois ; l'arrivée par l'onglet Profil (le crochet seul) rend une fois
 * aussi, parce que la sous-section est alors déjà active et qu'on ne rappelle rien.
 * Le MutationObserver qui rechargeait « quand la sous-section devient active »
 * est retiré : ce rôle est celui du crochet, et il le tient.
 */
function _activerSousSectionProfil() {
    if (typeof afficherSousSection !== 'function') return;
    const sousSection = document.getElementById('suivi-profil');
    if (sousSection && sousSection.classList.contains('active')) return;
    const drapeauAvant = window._profilAutoChargement;
    window._profilAutoChargement = true;
    try {
        afficherSousSection('suivi-profil');
    } finally {
        window._profilAutoChargement = drapeauAvant;
    }
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

    // #754 (lot 4 du cadrage 11, 11 sept. 2026) — UN SEUL RENDU À L'OUVERTURE.
    // Avant : cet appel inconditionnel réveillait le crochet de navigation.js (un
    // afficherProfilComplet reprogrammé à T+100 ms), et un MutationObserver de ce
    // fichier en ajoutait un troisième — quatre insertions mesurées, et le texte
    // tapé dans le rapport effacé. Voir `_activerSousSectionProfil`.
    _activerSousSectionProfil();

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
                        ${estEtudiantExclu(eleve) ? `<div data-statut-exclu="${echapperHtml(eleve.statut)}">${echapperHtml(libelleStatutEtudiant(eleve.statut))} · hors des moyennes du groupe</div>` : ''}
                        ${modeAnonymisation ? '' : `<div><strong>DA:</strong> ${echapperHtml(eleve.da)}</div>`}
                        ${eleve.groupe ? `<div><strong>Groupe:</strong> ${echapperHtml(eleve.groupe)}</div>` : ''}
                        ${eleve.programme ? `<div><strong>Programme:</strong> ${typeof obtenirNomProgramme === 'function' ? echapperHtml(obtenirNomProgramme(eleve.programme)) : echapperHtml(eleve.programme)}</div>` : ''}
                        ${eleve.sa === 'Oui' ? '<div class="u-texte-bleu">Services adaptés</div>' : ''}
                        ${eleve.caf === 'Oui' ? '<div class="u-texte-bleu">Mesure d\'aide</div>' : ''}
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

/* #722 (11 oct. 2026) : l'ancien panneau de détail du portfolio (portfolio.js) est retiré. */

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
                    <strong class="profil-valeur-grande-bleu">${formaterNombrePeriodes(details.periodesPresentes)}</strong>
                </div>
            </div>
            <div class="profil-carte-importante">
                <div class="carte-metrique-header">
                    <span class="profil-texte-detail">Périodes offertes</span>
                    <strong class="profil-valeur-grande-bleu">${formaterNombrePeriodes(details.periodesOffertes)}</strong>
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
    const gcId = obtenirIdContexteActif(infoCours);
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

/**
 * #941 lot S1 (décision A, 24 sept. 2026) — le niveau qu'une vue du profil peut montrer : aucun
 * pour une copie en points (`niveauFinalAffichable`, gabarits-utils.js), ni « -- » ; sinon le code.
 */
function _niveauVuProfil(evaluation) {
    if (!evaluation) return null;
    if (typeof niveauFinalAffichable === 'function') return niveauFinalAffichable(evaluation) || null;
    return evaluation.niveauFinal ?? null;
}

/** #941 lot S1 — « D » + espace devant une note, ou rien quand il n'y a pas de niveau à montrer. */
function _prefixeNiveau(evaluation) {
    const niv = _niveauVuProfil(evaluation);
    return niv ? niv + ' ' : '';
}

function _construireLigneProductionEvaluee(production, evaluation, indexArtefact) {
    const statutRemise = evaluation.statutRemise || 'evalue';
    const statutIntegrite = evaluation.statutIntegrite || 'recevable';
    const estNonRemis = statutRemise === 'non-remis' || statutRemise === 'retard';
    const estNonRecevable = statutIntegrite === 'plagiat' || statutIntegrite === 'ia';
    return {
        production: production.titre,
        marque: window.ProductionDiagnostique.marqueHTML(production),   // #1055
        description: production.activiteApprentissage || production.description || production.titre,
        // #941 lot S1 — sans niveau affichable (copie en points), la note seule.
        note: (typeof noteDiffereeActive === 'function' && noteDiffereeActive())
            ? `${_prefixeNiveau(evaluation)}${badgeNoteDifferee()}`   // #321 : niveau IDME gardé, % masqué
            : `${_prefixeNiveau(evaluation)}${evaluation.noteFinale}%`,
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
        marque: window.ProductionDiagnostique.marqueHTML(production),   // #1055
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
                ${detailsNoteFinale.pratiqueId ? `<button type="button" class="lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Ouvrir les réglages de cette pratique pour corriger ses paramètres">Réglages de la pratique</button>` : ''}
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
                enPoints:  !!art.enPoints,   // #941 lot S1
                note:      art.note,
                categorie: prod?.categorie || null
            };
        };
        const retenusDecrits = portfolio.artefactsRetenus
            .map(decrireRetenu)
            .sort((a, b) => (b.note || 0) - (a.note || 0));

        const differee = (typeof noteDiffereeActive === 'function' && noteDiffereeActive());  // #321
        const renderLigneRetenu = (r) => {
            const noteTxt = differee ? badgeNoteDifferee()
                : ((typeof r.note === 'number') ? `${r.note.toFixed(1)}%` : '—');
            // #941 lot S1 — une copie en points n'a pas de niveau : pas de « ? » devant sa note.
            const marqueur = r.enPoints ? noteTxt : `${echapperHtml(r.niveau || '?')} ${noteTxt}`;
            const activite = r.activite ? ` : ${echapperHtml(r.activite)}` : '';
            return `<li>${echapperHtml(r.titreProd)} <strong>(${marqueur})</strong>${activite}</li>`;
        };
        const renderLigneObligatoire = (o) => {
            const aNote = (typeof o.note === 'number');
            const noteTxt = aNote ? (differee ? badgeNoteDifferee() : `${o.note.toFixed(1)}%`) : null;
            // #941 lot S1 — une obligatoire en points est notée sans niveau : sa note, jamais « non remis ».
            const marqueur = (o.niveau && noteTxt) ? `${echapperHtml(o.niveau)} ${noteTxt}`
                : (o.enPoints && noteTxt) ? noteTxt
                : (o.brouillon ? 'évaluation non verrouillée, non comptée' : 'non remis');
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
            // #896 (18 sept. 2026) — LA COLONNE LIT LA MÊME RÈGLE QUE LA NOTE (`evaluationEntreDansLaNote`, #706). Elle lisait
            // `noteFinale != null` sans le verrou : un brouillon d'obligatoire entrait dans l'addition de la colonne, et la
            // carte écrivait « Note finale = … = 71.0 % » au-dessus du total du moteur, « 79.8% » (mesuré en WebKit).
            // Le brouillon reste NOMMÉ sur sa ligne, avec les mots que la carte emploie déjà ; il n'est plus compté.
            const evaluationsEleveValides = evaluationsEleve.filter(e => window.evaluationEntreDansLaNote(e));
            const obligatoiresTous = productionsObligatoires.map(prod => {
                const evalObl = evaluationsEleveValides.find(e => e.productionId === prod.id);
                const brouillon = !evalObl && evaluationsEleve.some(e => e.productionId === prod.id && !e.remplaceeParId && e.verrouillee === false);
                return {
                    titreProd: prod.titre || obtenirTermeProduction('singulier', true),
                    activite:  prod.activiteApprentissage || prod.description || '',
                    niveau:    evalObl ? _niveauVuProfil(evalObl) : null,   // #941 lot S1
                    enPoints:  !!evalObl && typeof evaluationEnPoints === 'function' && evaluationEnPoints(evalObl),
                    note:      evalObl && typeof evalObl.noteFinale === 'number' ? evalObl.noteFinale : null,
                    brouillon: brouillon
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
                    ${detailsNoteFinale.pratiqueId ? `<button type="button" class="lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Modifier le statut (provisoire / finale) et les pondérations dans les réglages de la pratique">Réglages de la pratique</button>` : ''}
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
                    ${_phraseEvaluationsEcartees(detailsNoteFinale.ecartees, 'note-finale-message-provisoire')}
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
                        ${terminal.niveau ? `Niveau atteint : <strong>${echapperHtml(terminal.niveau)}</strong>` : (terminal.enPoints ? '' : '<span class="note-finale-non-evalue">Non évaluée</span>')}
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
                    ${detailsNoteFinale.pratiqueId ? `<button type="button" class="lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(detailsNoteFinale.pratiqueId)}" title="Modifier le statut (provisoire / finale) et les pondérations dans les réglages de la pratique">Réglages de la pratique</button>` : ''}
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
                    ${_phraseEvaluationsEcartees(detailsNoteFinale.ecartees, 'note-finale-message-provisoire')}
                    ${detailsNoteFinale.estProvisoire && terminal.present ? '<div class="note-finale-message-provisoire">Basée uniquement sur le portfolio (évaluation terminale non complétée)</div>' : ''}
                </div>
            </div>
            `;
        }
    }

    // #921 — hors Standards, `calculerDetailsNoteFinale` rend null (il ne décompose qu'un portfolio). Une SOMMATIVE a
    // pourtant son récit du calcul : le même que lit le Comparateur, par la même porte (`simulerIndices`, lecture seule).
    if (!detailsNoteFinale) htmlNoteFinale = _genererNoteSessionSommative(da);

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
                                    ${echapperHtml(ligne.production)}${ligne.marque}
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
            niveau: _niveauVuProfil(evaluation),   // #941 lot S1
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
                                ${(typeof noteDiffereeActive === 'function' && noteDiffereeActive()) ? badgeNoteDifferee() : `<strong>${art.note}</strong>`}${art.niveau ? ` · ${art.niveau}` : ''}
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


// ⮕ #575 (lot 4 du plan SOLO) — `_obtenirNiveauxEtGradientSRPNF` A ÉTÉ REMPLACÉE
// par `niveauxEtGradientDesEvaluations(da)` (`profil-etudiant-helpers.js`).
//
// Elle devinait l'échelle (`echelles.find(e => e.active) || echelles[0]`) et,
// à défaut, repliait sur une table `I 0-64 / D 65-74 / M 75-84 / E 85-100`
// complète — la SIXIÈME du dépôt, et la seule que l'audit du 27 août n'avait pas
// vue : elle peint le dégradé et la légende du bloc « Forces et défis », que ce
// même audit cite en exemple de code proprement configurable (ses CRITÈRES le
// sont ; ses repères de couleur ne l'étaient pas).
//
// Sa jumelle presque mot pour mot vivait dans `profil-etudiant-diagnostics.js`.
// Les deux consomment désormais le même helper — et lisent l'échelle des
// ÉVALUATIONS de l'élève, pas une échelle « active » devinée.

function _calculerMoyennesComparativesSRPNF(da) {
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    return {
        moyennes: calculerMoyennesCriteres(da),
        directionsPAN: calculerDirectionsCriteres(da)
    };
}

// #529 — `cleCritere` et `criteresDeLaGrillePourAffichage` vivent dans
// `profil-etudiant-helpers.js` (chargé avant ce module) : une seule règle de
// normalisation pour le calcul ET l'affichage.

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

function _genererBarreCritereSRPNF(critere, contexte) {
    const { moyennes, directionsPAN, gradientCSS, messageEchelle } = contexte;
    const cle = critere.cle;
    const score = moyennes?.[cle];
    // Pas de donnée => PAS DE BARRE. Surtout pas une barre à 0 % : « aucune
    // évaluation sur ce critère » et « zéro sur ce critère » sont deux choses
    // opposées, et l'élève lirait la seconde.
    if (typeof score !== 'number' || isNaN(score)) return '';

    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const parties = _genererPointsBarreSRPNFNormal(cle, score, directionsPAN);
    if (!parties) return '';
    const { pointsHTML, valeursHTML, symbolesHTML } = parties;
    return `
        <div class="critere-container">
            <div class="critere-header">
                <span class="critere-nom" style="min-width: 120px;">${echapperHtml(critere.nom)}</span>
                <span class="critere-valeur" style="margin-left: auto; font-weight: 600;">
                    ${valeursHTML}
                </span>
            </div>
            <div class="critere-barre-gradient" style="background: ${gradientCSS};"${
                // #575 — sans échelle, le fond est neutre et la cause se lit au
                // survol. Pas d'avertissement permanent : une barre sans repères
                // n'est pas une panne.
                messageEchelle ? ` title="${echapperHtml(messageEchelle)}"` : ''}>
                ${symbolesHTML}
                ${pointsHTML}
            </div>
        </div>
    `;
}

function _genererBlocForcesDefisSRPNF(da) {
    const { niveaux, gradientCSS, message: messageEchelle } = (typeof niveauxEtGradientDesEvaluations === 'function')
        ? niveauxEtGradientDesEvaluations(da)
        : { niveaux: [], gradientCSS: 'var(--gris-pale, #e9e9e9)', message: '' };
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const moyennesCtx = _calculerMoyennesComparativesSRPNF(da);
    const contexte = { ...moyennesCtx, gradientCSS, messageEchelle };

    const barresHTML = criteresDeLaGrillePourAffichage()
        .map(critere => _genererBarreCritereSRPNF(critere, contexte))
        .join('');

    const legendePositions = niveaux.map(n => ({ ...n, position: (n.min + n.max) / 2 }));
    const legendeHTML = `
        <div class="legende-idme-container">
            ${legendePositions.map(item => `
                <div class="legende-idme-item" style="left: ${item.position}%; color: ${echapperHtml(item.couleur)};">
                    <span class="legende-idme-code">${echapperHtml(item.code)}</span>
                    <span class="legende-idme-nom">${echapperHtml(item.nom)}</span>
                </div>
            `).join('')}
        </div>
    `;

    if (!barresHTML || barresHTML.trim() === '') {
        // ⚠ #806 — LE CHEMIN ÉTAIT FAUX, ET C'EST PIRE QU'UN MESSAGE ABSENT.
        // « Conception → Pratiques de notation → Grille de référence pour le
        // dépistage » était écrit ici en dur ; le réglage vit dans « Labo → Outils
        // d'observation », section « Grille de critères pour le dépistage ».
        // Rapporté par Grégoire le 9 septembre 2026 : il a cherché.
        //
        // ⫦ LA PHRASE N'EST PLUS ÉCRITE ICI. `diagnostiquerGrilleReferenceDepistage`
        // (#550) la compose déjà, avec le bon chemin ET la cause exacte — trois
        // causes distinctes qui ne demandent pas le même geste. Une phrase
        // recopiée dans un deuxième fichier est une phrase qui divergera.
        const lectureGrille = (typeof diagnostiquerGrilleReferenceDepistage === 'function')
            ? diagnostiquerGrilleReferenceDepistage()
            : { grille: null, raison: null, message: '' };
        if (!lectureGrille.grille || lectureGrille.raison) {
            return `
                <div class="info-box info-box--attention" style="margin: 15px 0;">
                    <div style="display: flex; gap: 10px; align-items: start;">
                        <div style="flex: 1;">
                            <strong style="color: var(--alerte-texte-attention); display: block; margin-bottom: 5px;">Configuration requise</strong>
                            <p style="margin: 0; color: var(--alerte-texte-attention); font-size: 0.9rem; line-height: 1.5;">
                                ${echapperHtml(lectureGrille.message || '')}
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
    // #1055 : sans le travail diagnostique — il ne trace pas la progression de l'élève.
    const evaluations = window.ProductionDiagnostique.filtrerEvaluations(
        obtenirDonneesSelonMode('evaluationsSauvegardees') || [], obtenirDonneesSelonMode('productions') || []);
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
            <!-- #752 : rempli par creerGraphiqueCriteres quand une valeur ne se convertit pas dans l'échelle de son évaluation -->
            <p id="graphique-criteres-note-${da}" class="u-texte-mini u-texte-gris" style="margin: 0 0 8px;" hidden></p>

            <!-- Canvas pour le graphique Chart.js -->
            <div style="background: var(--surface-conteneur, #142428); padding: 20px; border-radius: 6px; height: 450px;">
                <canvas id="${canvasIdCriteres}"></canvas>
            </div>
        </div>
    `;
}

function _genererTexteRegleSelectionPortfolio(methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport) {
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
    const grilles = db.getSync(cle('grillesTemplates'), []);
    const grilleActive = grilles.find(g => g.active) || grilles[0];
    if (grilleActive && grilleActive.criteres) {
        const ponderations = grilleActive.criteres
            .map(c => `${echapperHtml(c.nom)}: ${c.ponderation || 0}%`)
            .join(', ');
        return `Pondération des critères configurés dans la grille «${echapperHtml(grilleActive.nom)}» (${ponderations})`;
    }
    return 'Pondération des critères déterminée dans les réglages';
}

function _genererTextePerformanceMethodeBloc(methodeSelectionRapport, nombreARetenirConfig, configCategoriesRapport) {
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

function _calculerIndicesPerformance(da) {
    // Session C (#303) : mode comparatif retiré — indices de la pratique active.
    return { indices: calculerTousLesIndices(da) };
}

/**
 * #706 — la phrase qui dit combien d'évaluations ont été écartées de la note du cours
 * (règle arrêtée par Grégoire le 5 septembre 2026 : un brouillon non verrouillé, ou une
 * portée nulle, n'entre pas dans la note). Vide quand rien n'est écarté : une note qui
 * compte tout n'a pas d'avertissement à porter.
 *
 * Les MOTS sont ceux d'un enseignant qui les lit : « 2 évaluations en brouillon, non
 * comptées » · « 1 évaluation sans critère évalué, non comptée » (mot arrêté par Grégoire le
 * 5 septembre 2026 : sans « aucun », qui doublait la négation).
 *
 * @param {{brouillons:number, sansPortee:number, total:number}|null} ecartees
 * @param {string} [classeBloc] - rendu en <div class="…"> ; sans elle, en <span> discret
 * @returns {string} HTML sûr (aucune donnée utilisateur)
 */
/**
 * #922 — LE récit du moteur pour une pratique sommative, lu une seule fois pour les deux écrans qui le redisent (la
 * carte de note #921, la carte Performance de la section Engagement). Aucun des deux ne recalcule une moyenne.
 * @returns {{idActif: ?string, recit: ?Object}} recit = null hors sommative, ou sans rien à compter
 */
function _lireRecitSommative(da) {
    // `simulerIndices` exige l'id : sans lui il rend null. Le même repère que `calculerDetailsNoteFinale` — la pratique du
    // groupe-cours actif, par LA désignation (lot N1b : sans pratique assignée, null — aucun récit, aucune carte).
    const idActif = (typeof obtenirIdPratiqueActive === 'function') ? obtenirIdPratiqueActive() : null;
    const indices = (idActif && typeof simulerIndices === 'function') ? simulerIndices(da, idActif) : null;
    const recit = indices ? indices.recit : null;
    return { idActif, recit: (recit && recit.famille === 'SOM' && recit.synthese) ? recit : null };
}

/**
 * #921 (rapport de Grégoire, 18 sept. 2026) — la note de session d'une pratique SOMMATIVE, sous la liste des
 * productions : chaque copie comptée avec sa note et son poids, la ligne de calcul, le total. Forme choisie par
 * Grégoire (« calquée sur la PAN »). AUCUN calcul de note ici : le total est `recit.synthese.noteFinale`, celui de
 * `calculerPerformance` ; la ligne de calcul n'est écrite que si elle REDONNE ce total au dixième — sinon on ne
 * montre pas une arithmétique qui contredirait la note.
 * @param {string} da
 * @returns {string} HTML, ou '' si la pratique active n'est pas une sommative ou n'a encore rien à compter
 */
function _genererNoteSessionSommative(da) {
    const { idActif, recit } = _lireRecitSommative(da);
    if (!recit) return '';

    const differee = (typeof noteDiffereeActive === 'function' && noteDiffereeActive());  // #321
    const note = recit.synthese.noteFinale;
    const comptees = (recit.resultats || []).filter(r => r.sort === 'compte');
    const autres = (recit.resultats || []).filter(r => r.sort !== 'compte');
    const pratiqueId = idActif;
    const cfg = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive(idActif) : null;
    const estFinale = !!(cfg && cfg.notesFinales);
    const terme = (n) => obtenirTermeProduction(n > 1 ? 'pluriel' : 'singulier') + ' ' + accordTermeProduction('evalue', n);

    const ligne = (r, grise) => {
        const noteTxt = differee ? badgeNoteDifferee() : ((typeof r.note === 'number') ? `${r.note.toFixed(1)}%` : '—');
        // #941 lot S1 — une copie en points n'a pas de niveau : pas de « ? » devant sa note.
        const marqueur = r.enPoints ? noteTxt : `${echapperHtml(r.niveau || '?')} ${noteTxt}`;
        // En texte, pas en pastille : `.note-finale-ponderation` est une pastille sombre, trop lourde dans une liste.
        const suite = grise
            ? ` <span class="note-finale-non-evalue">· ${echapperHtml(r.detail || '')}</span>`
            : ` · poids ${(typeof r.poids === 'number') ? r.poids.toFixed(0) : '—'} %`;
        return `<li>${echapperHtml(r.label)}${suite} <strong>(${marqueur})</strong></li>`;
    };

    // La ligne de calcul, sur les pondérations telles que saisies. Écrite seulement si elle redonne la moyenne.
    const moyenneAffichee = recit.synthese.plafonnement ? recit.synthese.plafonnement.moyenneOriginale : note;
    let calculHtml = '';
    if (!differee && comptees.length && comptees.every(r => typeof r.note === 'number' && typeof r.ponderation === 'number')) {
        const total = comptees.reduce((t, r) => t + r.ponderation, 0);
        const somme = comptees.reduce((t, r) => t + r.note * r.ponderation, 0);
        if (total > 0 && typeof moyenneAffichee === 'number' && Math.abs(somme / total - moyenneAffichee) < 0.05) {
            const termes = comptees.map(r => `${r.note.toFixed(1)} × ${r.ponderation}`).join(' + ');
            calculHtml = `(${termes}) ÷ ${total} = <strong>${moyenneAffichee.toFixed(1)}%</strong>`;
        }
    }

    const plafond = recit.synthese.plafonnement
        ? `<div class="note-finale-message-provisoire">Moyenne de ${recit.synthese.plafonnement.moyenneOriginale.toFixed(1)}% ramenée à ${note.toFixed(1)}% par une règle de la pratique.</div>`
        : '';
    const totalTxt = differee ? badgeNoteDifferee() : ((typeof note === 'number') ? note.toFixed(1) + '%' : '—');

    return `
            <!-- Note de session (sommative) — #921 -->
            <div class="note-finale-section">
                <h3 class="note-finale-titre">
                    ${estFinale ? 'Note finale de session' : 'Note provisoire de session'}
                    ${recit.pratiqueNom ? `<span class="note-finale-pratique-nom" title="Pratique de notation appliquée pour ce calcul">${echapperHtml(recit.pratiqueNom)}</span>` : ''}
                    ${pratiqueId ? `<button type="button" class="lien-reglages" data-action="ouvrirReglagesPratique" data-param="${echapperHtml(pratiqueId)}" title="Ouvrir les réglages de cette pratique">Réglages de la pratique</button>` : ''}
                </h3>
                <div class="note-finale-grid note-finale-grid-single">
                    <div class="note-finale-composante">
                        <div class="note-finale-composante-titre">Moyenne pondérée (${comptees.length} ${terme(comptees.length)})</div>
                        <div class="note-finale-artefacts">
                            <ul class="note-finale-liste-artefacts">${comptees.map(r => ligne(r, false)).join('')}${autres.map(r => ligne(r, true)).join('')}</ul>
                        </div>
                        ${calculHtml ? `<div class="note-finale-calcul-categorie">${calculHtml}</div>` : ''}
                    </div>
                </div>
                <div class="note-finale-resultat">
                    <div class="note-finale-formule">Note ${estFinale ? 'finale' : 'provisoire'} = ${echapperHtml(recit.synthese.formuleTexte || 'moyenne pondérée')}</div>
                    <div class="note-finale-total ${typeof note === 'number' ? '' : 'note-finale-tiret'}">${totalTxt}</div>
                    ${plafond}
                </div>
            </div>
            `;
}

function _phraseEvaluationsEcartees(ecartees, classeBloc) {
    if (!ecartees || !ecartees.total) return '';
    const morceaux = [];
    if (ecartees.brouillons) {
        const n = ecartees.brouillons;
        morceaux.push(n + ' évaluation' + (n > 1 ? 's' : '') + ' non verrouillée' + (n > 1 ? 's' : '') + ', non comptée' + (n > 1 ? 's' : ''));
    }
    if (ecartees.sansPortee) {
        const m = ecartees.sansPortee;
        morceaux.push(m + ' évaluation' + (m > 1 ? 's' : '') + ' sans critère évalué, non comptée' + (m > 1 ? 's' : ''));
    }
    const texte = morceaux.join(' · ');
    if (classeBloc) return '<div class="' + classeBloc + '">' + texte + '</div>';
    return '<span class="u-texte-petit u-texte-gris-clair" style="font-weight: normal; display: block; margin-top: 2px;">' + texte + '</span>';
}

/**
 * #714 (22 sept. 2026) — CE QUE LE PANNEAU « Développement des habiletés » DIT DE LA NOTE, lu dans
 * `calculerDetailsNoteFinale` et nulle part ailleurs : combien d'évaluations sont retenues, lesquelles,
 * sur combien, par quelle méthode, et leur moyenne.
 *
 * Avant : le nombre à retenir venait des `regles` de la PRODUCTION Portfolio (« 3 » sous une pratique
 * « 4 meilleurs ») ; la liste venait de `indicesCP.details`, que plus rien n'écrit (« Calcul impossible »
 * sous un P juste) ; et le rendu ÉCRIVAIT une sélection « meilleurs » dans `portfoliosEleves`, puis
 * relançait les indices, à chaque affichage. Le panneau n'écrit plus rien. Les sélections déjà écrites
 * restent où elles sont (limite de Grégoire du 20 sept.) : rien ne les lit pour calculer une note.
 *
 * Les MOTS du compte sont ceux de la carte de la note (`genererSectionProductions` du même fichier),
 * pour que les deux disent la même chose.
 *
 * @param {string} da
 * @param {Array} productions - celles du trimestre, pour nommer les évaluations retenues
 * @returns {Object|null} null hors Standards ou sans note calculable : le panneau ne dit alors
 *   AUCUNE phrase sur des évaluations retenues.
 */
function _lireNotePourPanneauHabiletes(da, productions) {
    const details = (typeof calculerDetailsNoteFinale === 'function') ? calculerDetailsNoteFinale(da) : null;
    if (!details || details.erreur || !details.portfolio) return null;
    const portfolio = details.portfolio;
    const hybride = portfolio.methodeSelectionCle === 'hybride';
    const cats = (hybride && typeof obtenirConfigCategories === 'function') ? obtenirConfigCategories() : null;
    const nombreARetenir = hybride
        ? ((cats && cats.selection && cats.selection.nombreARetenir) || 4)   // le défaut de _selectionnerArtefactsHybride
        : portfolio.nombreARetenir;

    const parId = {};
    (productions || []).forEach(p => { parId[p.id] = p; });
    const retenues = (portfolio.artefactsRetenus || [])
        .map(a => ({ titre: (parId[a.productionId] && parId[a.productionId].titre) || obtenirTermeProduction('singulier', true),
            note: a.note, obligatoire: !!(parId[a.productionId] && parId[a.productionId].categorie === 'obligatoire') }))
        .sort((a, b) => (b.note || 0) - (a.note || 0));   // l'ordre de la carte

    // Sans aucune évaluation, pas de compte : « (0 … sur 0 évalué) » redirait ce que la liste dit déjà
    // (« Aucun … évalué ») — décidé par Cowork à la relecture du 22 sept.
    let compte = '';
    if (portfolio.nombreEvalues && hybride) {
        const obligatoires = retenues.filter(r => r.obligatoire).length;
        const evaluesSelection = Math.max(0, portfolio.nombreEvalues - obligatoires);
        compte = `les ${nombreARetenir} meilleures sur ${evaluesSelection} évaluées`
            + (obligatoires ? `, et ${obligatoires} obligatoire${obligatoires > 1 ? 's' : ''}` : '');
    } else if (portfolio.nombreEvalues) {
        compte = `${portfolio.nombreRetenus} ${echapperHtml(portfolio.methodeSelection)} ${obtenirTermeProduction('pluriel')} sur ${portfolio.nombreEvalues} ${accordTermeProduction('evalue', portfolio.nombreEvalues)}`;
    }

    return {
        methodeCle: hybride ? 'hybride-categories' : (portfolio.methodeSelectionCle || 'meilleurs'),
        nombreARetenir,
        configCategories: cats,
        compte,
        retenues,
        moyenne: portfolio.moyenne,
        terminalePresente: !!(details.terminal && details.terminal.present),
        formule: (details.recit && details.recit.synthese) ? details.recit.synthese.formuleTexte : null
    };
}

/**
 * #714 — la ligne « Calcul de l'indice P », écrite SEULEMENT si l'addition qu'elle montre redonne la
 * moyenne du moteur (même principe que #921) : c'est cette règle, et elle seule, qui l'écarte sous
 * l'hybride (moyenne pondérée) ou un plafonnement — la carte de la note les détaille. Jamais
 * « Calcul impossible » sous une note.
 * @returns {string} HTML, ou '' si rien d'exact ne peut être écrit
 */
function _ligneCalculIndicePPanneau(note, differee) {
    if (!note || differee || !note.retenues.length) return '';
    if (typeof note.moyenne !== 'number' || !note.retenues.every(r => typeof r.note === 'number')) return '';
    const n = note.retenues.length;
    const somme = note.retenues.reduce((t, r) => t + r.note, 0);
    if (Math.abs(somme / n - note.moyenne) >= 0.05) return '';
    const addition = `(${note.retenues.map(r => r.note.toFixed(1)).join(' + ')}) / ${n} = <strong>${note.moyenne.toFixed(1)}%</strong>`;
    const quoi = `Moyenne des ${n} ${obtenirTermeProduction(n > 1 ? 'pluriel' : 'singulier')} ${accordTermeProduction('retenu', n)}`;
    if (!note.terminalePresente) return `${quoi} — P = ${addition}`;
    return `${quoi} = ${addition}` + (note.formule ? ` ; P = ${echapperHtml(note.formule)}` : '');
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
            forcesDefis: barresSRPNF,
            gestesCognitifs: genererConteneurGestesCognitifs(da)
        });
    }

    // Récupérer TOUS les artefacts créés
    const tousLesArtefactsPortfolio = productions.filter(p => p.type === 'artefact-portfolio');

    if (tousLesArtefactsPortfolio.length === 0) {
        return genererOngletsDeveloppement(da, {
            criteres: graphiqueCriteres,
            forcesDefis: barresSRPNF,
            gestesCognitifs: genererConteneurGestesCognitifs(da)
        });
    }

    // Session C (#303) : mode comparatif retiré — indices de la pratique active.
    const { indices } = _calculerIndicesPerformance(da);

    // #714 — ce que le panneau dit de la note vient de `calculerDetailsNoteFinale`, seul ; null hors
    // Standards. Plus de sélection écrite au rendu ; le nombre et la liste ne viennent plus du conteneur ni du cache d'indices.
    const noteLue = _lireNotePourPanneauHabiletes(da, productions);
    const differee = (typeof noteDiffereeActive === 'function' && noteDiffereeActive());  // #321, comme la carte
    const ligneCalculP = _ligneCalculIndicePPanneau(noteLue, differee);
    const listeRetenues = noteLue ? (noteLue.retenues.length
        ? noteLue.retenues.map((r, idx) => `${idx + 1}. ${echapperHtml(r.titre)} → ${differee ? badgeNoteDifferee() : (typeof r.note === 'number' ? r.note.toFixed(1) + '/100' : '—')}`).join(' • ')
        : `${accordTermeProduction('aucun', 1, true)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}`) : '';

    // `const interpP = interpreterPerformance(indices.P);` retiré au pas 3c-3 de
    // #542 : second appel dont le résultat n'était lu nulle part.

    // ⮕ #575 (lot 4 du plan SOLO) — LE TERNAIRE IDME A ÉTÉ RETIRÉ D'ICI.
    //
    // Ce qui vivait là, en clair :
    //     const determinerLettreIDME = (P) =>
    //         P >= 85 ? 'E' : P >= 75 ? 'M' : P >= 65 ? 'D' : 'I';
    // Les bornes de l'échelle de Grégoire écrites dans le code — invisibles à une
    // recherche sur `idme.`, puisqu'elles ne passaient même pas par `obtenirSeuil`.
    // La lettre était RENDUE plus bas (« E 87 % »), quelle que soit l'échelle de
    // l'utilisateur : une cotation W/X/Y/Z affichait un « M ».
    //
    // ⚠ ET ELLE CONTREDISAIT L'AUTRE MOITIÉ DU MÊME ÉCRAN. Le pas 3c-1 de #542
    // avait retiré exactement ce ternaire de `genererSectionPerformance`, la
    // veille — mais pas cette copie-ci. Le même élève pouvait donc lire deux
    // niveaux différents pour la même note, sur la même page.
    //
    // ⮕ On converge sur `lireNiveauNoteGlobale` (`profil-etudiant-helpers.js`),
    // où cette règle vit désormais SEULE : c'est la pratique de notation qui
    // établit la note globale, donc c'est elle qui dit dans quoi la note se lit.
    // Sans échelle (une sommative, par exemple), il n'y a pas de code — et c'est
    // la bonne réponse, pas un manque.
    const lectureNiveauGlobal = (typeof lireNiveauNoteGlobale === 'function')
        ? lireNiveauNoteGlobale(da, indices.P)
        : { niveau: null, survol: '', raison: 'helper-absent' };
    const prefixeNiveauGlobal = lectureNiveauGlobal.niveau
        ? `<span title="${echapperHtml(lectureNiveauGlobal.survol)}">${echapperHtml(String(lectureNiveauGlobal.niveau.code))}</span> `
        : '';
    // Sans niveau, c'est le pourcentage qui porte l'explication — au survol
    // seulement : une pratique sans échelle n'est pas en panne, et un
    // avertissement permanent le laisserait croire.
    const survolPourcentageGlobal = lectureNiveauGlobal.niveau
        ? ''
        : ` title="${echapperHtml(lectureNiveauGlobal.survol)}"`;

    // Calculer moyennes des critères pour badges
    const moyennes = calculerMoyennesCriteres(da);
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    // #817 — même seuil force/défi que le diagnostic par critère, lu dans la
    // SSOT (`defiSpecifique`). Il valait 0.7125 en dur, comme dans
    // profil-etudiant-diagnostics.js : deux copies d'un résidu, pas un réglage.
    const seuilForce = obtenirSeuil('defiSpecifique');

    // Fonction helper pour couleur du badge
    const obtenirCouleurBadge = (score) => {
        if (score >= seuilForce) return 'var(--vert-succes)'; // Vert - Force
        if (score >= 0.60) return 'var(--btn-annuler)'; // Jaune - Défi modéré
        if (score >= 0.50) return 'var(--orange-accent)'; // Orange - Défi important
        return 'var(--rouge-erreur)'; // Rouge - Défi critique
    };

    return `
        <!-- Détails des calculs (masqué par défaut) - AFFICHÉ EN HAUT -->
        <div id="details-calculs-performance-${da}" class="carte-info-toggle carte-info-note u-hide">
            <strong>Méthodologie de calcul</strong>
            <br><br>
            <strong>Pratique de notation active :</strong> ${indices.pratique === 'PAN' ? 'PAN-Standards' : 'Sommative'}
            <br><br>
${noteLue ? `
            <strong>Règle de sélection :</strong> ${_genererTexteRegleSelectionPortfolio(noteLue.methodeCle, noteLue.nombreARetenir, noteLue.configCategories)}
            <br><br>
            <strong>${obtenirTermeProduction('pluriel', true)} ${accordTermeProduction('retenu', 2)}${noteLue.compte ? ` (${noteLue.compte})` : ''} :</strong> ${listeRetenues}
            <br><br>
            ${ligneCalculP ? `<strong>Calcul de l'indice P :</strong> ${ligneCalculP}
            <br><br>` : ''}` : ''}
            <strong>Calcul de la note de chaque ${obtenirTermeProduction('singulier')} :</strong> ${_genererTextePonderationCriteresActifs()}
        </div>

        <!-- ENCADRÉ UNIQUE: DÉVELOPPEMENT DES HABILETÉS ET COMPÉTENCES -->
        <div class="profil-carte-bordure-blanche">

            <!-- En-tête avec indice P -->
            <div class="u-flex-between-mb15">
                <!-- Session C (#303) : mode comparatif retiré — indice P unique (pratique active). -->
                <strong class="profil-valeur-grande-bleu" style="margin-left: auto;"${survolPourcentageGlobal}>${prefixeNiveauGlobal}${indices.P}%</strong>
            </div>

            <!-- 🆕 MÉTHODE DE CALCUL EXPLICITE -->
            ${noteLue ? `<ul class="profil-liste-simple" style="margin-bottom: 15px;">
                <li><strong>• ${_genererTextePerformanceMethodeBloc(noteLue.methodeCle, noteLue.nombreARetenir, noteLue.configCategories)}</strong></li>
            </ul>` : ''}

            <hr class="profil-separateur">

            <!-- Onglets Critères / Forces et défis / Gestes cognitifs (avril 2026) -->
            ${genererOngletsDeveloppement(da, {
                criteres: graphiqueCriteres,
                forcesDefis: `
                <div class="section-titre">Forces et défis parmi les critères</div>
                <div style="margin: 20px 0;">
                ${_genererBlocForcesDefisSRPNF(da)}
                </div>
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
                <li><strong>• Périodes présentes :</strong> ${formaterNombrePeriodes(details.periodesPresentes)} / ${formaterNombrePeriodes(details.periodesOffertes)}</li>
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

// #754 — l'observateur qui rechargeait le profil quand la sous-section devenait
// active vivait ici ; retiré le 11 sept. 2026 (voir `_activerSousSectionProfil`).




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
        const nomProd = production ? echapperHtml(production.titre || production.nom || '') + window.ProductionDiagnostique.marqueHTML(production) : '';   // #1055 : la marque
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
                    <div class="travaux-grille-etudiant">${window.TailleFichier.dire(f.tailleFichier, { decimales: 1 })}</div>
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
// window.calculerDetailsNoteFinale → profil-etudiant-actions.js (session C refactor 18 mai 2026, FIX #37 préservé)
window.calculerDirectionsCriteres = calculerDirectionsCriteres; // session C refactor : reste dans le résidu (zone Sections affichage L2003), export migré depuis zone actions
// #732 — `profil-etudiant-rapport.js` (une autre IIFE) l'appelle par son nom nu : sans cet export, le bouton
// « Rapport » écrivait « Erreur lors de la génération du rapport : obtenirDetailsAssiduite is not defined »
// depuis le refactor du 18 mai 2026 (audit de l'onglet Suivi, 5 sept. 2026, B-5 ; vu dans WebKit par la spec 732).
window.obtenirDetailsAssiduite = obtenirDetailsAssiduite;

// ✅ CORRECTIF (17 déc 2025): Exporter les fonctions utilisées dans les data-action du profil
window.changerSectionProfil = changerSectionProfil;
window.toggleSectionCollapsible = toggleSectionCollapsible;
window.naviguerVersPresenceAvecDate = naviguerVersPresenceAvecDate;
// window.genererEtAfficherRapport → profil-etudiant-rapport.js
// window.copierRapport → profil-etudiant-rapport.js
// window.consulterEvaluation → profil-etudiant-actions.js (session C refactor 18 mai 2026)
// window.evaluerProduction → evaluation.js (définition unique depuis #868, 15 sept. 2026)

// Phase 5 : Wrappers delegation
window.togglePSansReprisesIndivHandler = togglePSansReprisesIndivHandler;
window.toggleIndiceIndivHandler = toggleIndiceIndivHandler;
window.toggleCritereIndivHandler = toggleCritereIndivHandler;
window.lancerExportEtudiantAnnotes = lancerExportEtudiantAnnotes;
// window.obtenirTermeProduction → profil-etudiant-helpers.js

})();
