/* ===============================
   MODULE 15b: PROFIL ÉTUDIANT — CALCULS PÉDAGOGIQUES
   Extrait de profil-etudiant.js (zone L3597-5098 résidu post-helpers,
   correspond à L4185-5686 du fichier original) — refactor 18 mai 2026

   Contenu de ce sous-module (14 fonctions, ~1500 LOC) :
   - Conversion IDME : obtenirTableConversionIDME, convertirNiveauIDMEEnScore
   - Moyennes critères : calculerMoyennesCriteres, calculerMoyennesCriteresRecents
   - IPB : calculerIPB (cyc <30, éclaté en helpers privés Cat-B Track 3 phase 2 — 21 mai 2026)
   - Diagnostic apprentissage : diagnostiquerSuiviApprentissage, diagnostiquerForcesChallenges
   - Indices N derniers : calculerIndicesNDerniersArtefacts
   - Progression : calculerProgressionEleve
   - Défi/Pattern : identifierDefiSpecifique, identifierPatternActuel
   - RàI : determinerNiveauRaiPedagogique, determinerAlerteContextuelle,
     determinerCibleIntervention (cyc 58 — éclatement reporté étape 4)

   Tous les calculs sont promus window.X (décision étape 1 b — convention
   systématique cross-zones). Logique pure, faible risque.

   Chargé AVANT profil-etudiant.js (zone résidu) dans index.html, APRÈS
   profil-etudiant-helpers.js (calculerMoyennesCriteres appelle des helpers
   du module précédent).
   =============================== */

(function() {
'use strict';

/**
 * Récupère la table de conversion IDME depuis l'échelle configurée
 * @param {string} echelleId - ID de l'échelle (optionnel, prend la première IDME si non spécifié)
 * @returns {Object} - { I: 0.40, D: 0.65, M: 0.75, E: 1.00 }
 */
function obtenirTableConversionIDME(echelleId = null) {
    // PRIORITÉ 1 : Charger l'échelle active depuis niveauxEchelle
    let niveaux = db.getSync('niveauxEchelle', []);

    // Si on a des niveaux IDME actifs, les utiliser
    if (niveaux.length > 0 && niveaux.some(n => ['0', 'I', 'D', 'M', 'E'].includes(n.code))) {
        const table = {};
        niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['0', 'I', 'D', 'M', 'E'].includes(code)) {
                // valeurCalcul peut être string ou number, on convertit en 0-1
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // PRIORITÉ 2 : Charger depuis echellesTemplates si niveauxEchelle est vide
    let echelles = db.getSync('echellesTemplates', []);
    let echelle;

    if (echelleId) {
        echelle = echelles.find(e => e.id === echelleId);
    } else {
        // Chercher une échelle avec les codes I, D, M, E (ou 0)
        echelle = echelles.find(e =>
            e.niveaux &&
            e.niveaux.some(n => ['0', 'I', 'D', 'M', 'E'].includes(n.code))
        );
    }

    if (echelle && echelle.niveaux) {
        const table = {};
        echelle.niveaux.forEach(niveau => {
            const code = niveau.code.toUpperCase();
            if (['0', 'I', 'D', 'M', 'E'].includes(code)) {
                const valeur = parseFloat(niveau.valeurCalcul || niveau.valeurPonctuelle || 0) / 100;
                table[code] = valeur;
            }
        });
        return table;
    }

    // FALLBACK : Valeurs par défaut si aucune échelle trouvée (avec niveau 0)
    return { '0': 0.00, I: 0.40, D: 0.65, M: 0.75, E: 1.00 };
}

/**
 * Convertit un niveau IDME en score numérique 0-1 selon l'échelle configurée
 * @param {string} niveau - I, D, M ou E
 * @param {Object} tableConversion - Table de conversion IDME
 * @returns {number} - Score 0-1
 */
function convertirNiveauIDMEEnScore(niveau, tableConversion) {
    niveau = niveau.trim().toUpperCase();
    return tableConversion[niveau] || null;
}

/**
 * Calcule les moyennes par critère SRPNF pour un étudiant
 * Parse les rétroactions finales pour extraire les niveaux IDME
 * @param {string} da - Numéro de DA
 * @returns {Object} - { structure, rigueur, plausibilite, nuance, francais } (scores 0-1)
 */
/**
 * Calcule les moyennes des critères SRPNF sur TOUTES les évaluations de l'étudiant
 * Utilisé pour la pratique sommative (SOM) qui considère toutes les évaluations
 * @param {string} da - Numéro DA de l'étudiant
 * @returns {Object|null} - Moyennes par critère ou null
 */
function calculerMoyennesCriteres(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

    // Filtrer toutes les évaluations de l'étudiant avec rétroaction finale
    const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da && e.retroactionFinale);


    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        if (!window._avertiGrilleMoyennes) {
            console.warn('⚠️ Pas de grille de référence - calcul moyennes impossible');
            window._avertiGrilleMoyennes = true;
        }
        return null;
    }

    // Obtenir la table de conversion IDME depuis l'échelle configurée
    const tableConversion = obtenirTableConversionIDME();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)

    evaluationsEleve.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });


    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé pour compatibilité avec l'interface
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        if (scores.length > 0) {
            moyennes[cleStandard] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleStandard] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

/**
 * Calcule les moyennes des critères sur les N derniers artefacts
 * Spécifique à la PAN-maîtrise (regarde les artefacts récents, pas toutes les évaluations)
 * Utilise la grille de référence configurée pour les critères.
 *
 * @param {string} da - Numéro DA de l'étudiant
 * @param {number} nombreArtefacts - Nombre d'artefacts récents à considérer (défaut: lire config.configPAN.nombreCours)
 * @returns {Object|null} - Moyennes par critère (clés normalisées) ou null
 */
function calculerMoyennesCriteresRecents(da, nombreArtefacts = null) {
    // Lire le nombre d'artefacts depuis la config si non fourni
    if (nombreArtefacts === null) {
        const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
        nombreArtefacts = config.configPAN?.nombreCours || 3; // Par défaut 3 cours = 6 artefacts
        nombreArtefacts = nombreArtefacts * 2; // 3 cours = 6 artefacts (2 par cours)
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return null;
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (ou moins si pas assez)
    const derniersArtefacts = evaluationsEleve.slice(0, nombreArtefacts);


    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - calcul moyennes critères récents impossible');
        return null;
    }

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Initialiser accumulateurs dynamiquement selon critères de la grille
    const scoresCriteres = {};
    grille.criteres.forEach(c => {
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
        scoresCriteres[cleNormalisee] = [];
    });

    // NOUVELLE APPROCHE: Lire directement depuis evaluation.criteres[]
    // Plus fiable que de parser la rétroaction (qui peut avoir des formats variables)

    derniersArtefacts.forEach(evaluation => {
        // Vérifier si cette évaluation a un tableau criteres[]
        if (!evaluation.criteres || !Array.isArray(evaluation.criteres)) {
            console.warn(`  ⚠️ ${evaluation.productionNom}: pas de tableau criteres[], ignorée`);
            return;
        }

        // Pour chaque critère de l'évaluation
        evaluation.criteres.forEach(critereSauvegarde => {
            const niveauIDME = critereSauvegarde.niveauSelectionne;
            const nomCritere = critereSauvegarde.critereNom;

            // Convertir le niveau IDME en score numérique
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                // Trouver le critère correspondant dans la grille de référence
                const critereReference = grille.criteres.find(c => {
                    // Normaliser les deux noms pour comparaison insensible aux accents/espaces
                    const nomRef = c.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    const nomEval = nomCritere.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');

                    // Correspondance exacte OU l'un commence par l'autre
                    // Ex: "francais" match "francaisecrit" OU "francaisecrit" match "francais"
                    return nomRef === nomEval ||
                           nomRef.startsWith(nomEval) ||
                           nomEval.startsWith(nomRef);
                });

                if (critereReference) {
                    const cleNormalisee = critereReference.nom.toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/\s+/g, '');
                    scoresCriteres[cleNormalisee].push(score);
                } else {
                    console.warn(`  ⚠️ Critère "${nomCritere}" non trouvé dans grille de référence`);
                }
            }
        });
    });


    // Calculer les moyennes avec clés standardisées
    const moyennes = {};
    let aucuneDonnee = true;

    Object.keys(scoresCriteres).forEach(cle => {
        const scores = scoresCriteres[cle];

        // Standardiser la clé en minuscules (cohérent avec calculerMoyennesCriteres)
        // "francaisecrit" → "francais" (pour éviter NaN)
        let cleStandard = cle;
        if (cle.startsWith('francais')) {
            cleStandard = 'francais';
        }

        if (scores.length > 0) {
            moyennes[cleStandard] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            aucuneDonnee = false;
        } else {
            moyennes[cleStandard] = null;
        }
    });

    return aucuneDonnee ? null : moyennes;
}

// [Phase 6] calculerIndiceBlocage() supprimé — remplacé par calculerIPB() + diagnostiquerSuiviApprentissage()

// [Phase 6] calculerProgressionBlocage() supprimé — utilisait calculerIndiceBlocage() retiré ci-dessus

function _normaliserNomCritereIPB(nom) {
    var n = (nom || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
    return n.startsWith('francais') ? 'francais' : n;
}

function _filtrerEtTrierEvaluationsIPB(evaluations, da, productionsIds) {
    var filtrees = evaluations.filter(function (e) {
        return e.etudiantDA === da &&
            productionsIds.indexOf(e.productionId) >= 0 &&
            e.retroactionFinale &&
            e.criteres && Array.isArray(e.criteres);
    });
    // Trier chronologiquement (plus récent d'abord)
    filtrees.sort(function (a, b) {
        var dateA = a.dateEvaluation || a.dateCreation || '';
        var dateB = b.dateEvaluation || b.dateCreation || '';
        return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
    });
    return filtrees;
}

function _calculerScoreMultiArtefactIPB(ev, nomsMulti, tableConversion) {
    var scores = {};
    ev.criteres.forEach(function (cs) {
        var score = convertirNiveauIDMEEnScore(cs.niveauSelectionne, tableConversion);
        if (score === null) return;
        var nomEval = _normaliserNomCritereIPB(cs.critereNom);
        nomsMulti.forEach(function (cm) {
            if (cm.nom === nomEval || cm.nom.startsWith(nomEval) || nomEval.startsWith(cm.nom)) {
                scores[cm.nom] = score;
            }
        });
    });
    // Moyenne pondérée adaptative (ignorer les critères absents)
    var totalPond = 0;
    var totalScore = 0;
    nomsMulti.forEach(function (cm) {
        if (scores[cm.nom] !== undefined) {
            var pond = cm.ponderation || 1;
            totalPond += pond;
            totalScore += scores[cm.nom] * pond;
        }
    });
    if (totalPond === 0) return null;
    return { score: totalScore / totalPond, details: scores };
}

function _construireHistoriqueIPB(evaluationsEleve, productions, nomsMulti, tableConversion) {
    var prodMap = {};
    productions.forEach(function (p) { prodMap[p.id] = p; });
    var historiqueRecentsVersAnciens = [];
    for (var h = 0; h < evaluationsEleve.length; h++) {
        var ev = evaluationsEleve[h];
        var res = _calculerScoreMultiArtefactIPB(ev, nomsMulti, tableConversion);
        var prod = prodMap[ev.productionId];
        var nomActivite = '';
        if (prod) {
            nomActivite = prod.activiteApprentissage || prod.description || prod.titre || prod.nom || '';
        }
        historiqueRecentsVersAnciens.push({
            score: res ? res.score : null,
            productionId: ev.productionId,
            productionTitre: nomActivite,
            date: (ev.dateEvaluation || ev.dateCreation || '').substring(0, 10),
            estJeton: !!(ev.repriseDeId || ev.jetonRepriseApplique || ev.jetonRepriseCibleeApplique),
            evaluationId: ev.id || ev.evaluationId || ''
        });
    }
    return historiqueRecentsVersAnciens.slice().reverse(); // ancien → récent
}

function _determinerDirectionScoreIPB(actuel, precedent, seuilProgression) {
    if (actuel === null || precedent === null) return '→'; // →
    var delta = actuel - precedent;
    if (delta > seuilProgression) return '↗'; // ↗
    if (delta < -seuilProgression) return '↘'; // ↘
    return '→'; // →
}

function _identifierCriteresEnDefiIPB(dernierEvaluation, nomsMulti, tableConversion, seuilDefi) {
    if (!dernierEvaluation) return [];
    var dernierResult = _calculerScoreMultiArtefactIPB(dernierEvaluation, nomsMulti, tableConversion);
    if (!dernierResult) return [];
    var criteresEnDefi = [];
    nomsMulti.forEach(function (cm) {
        if (dernierResult.details[cm.nom] !== undefined && dernierResult.details[cm.nom] < seuilDefi) {
            criteresEnDefi.push(cm.nom);
        }
    });
    return criteresEnDefi;
}

/**
 * Calcule l'Indice de Persistance du Blocage (IPB) sur les critères multistructurels.
 * Compte les artefacts consécutifs récents dont le score pondéré des critères
 * multistructurels est sous le seuil de défi configurable.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { ipb, scoreActuel, scorePrecedent, direction, criteresMulti, criteresEnDefi }
 */
function calculerIPB(da) {
    var grille = obtenirGrilleReferenceDepistage();
    if (!grille || !grille.criteres) return null;

    // Filtrer les critères multistructurels (défaut si pas de tag)
    var criteresMulti = grille.criteres.filter(function (c) {
        return (c.niveauSOLO || 'multistructurel') === 'multistructurel';
    });
    if (criteresMulti.length === 0) return null;

    var seuilDefi = obtenirSeuil('defiSpecifique') || 0.70;
    var seuilProgression = (obtenirSeuil('progressionArtefacts') || 0.10);
    var fenetreN = obtenirNombreProductionsPourPatterns() || 3;

    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    var productions = obtenirDonneesSelonMode('productions') || [];
    var productionsIds = obtenirIdsProductionsEvaluables(productions);
    var tableConversion = obtenirTableConversionIDME();

    var evaluationsEleve = _filtrerEtTrierEvaluationsIPB(evaluations, da, productionsIds);
    if (evaluationsEleve.length === 0) return null;

    // Normaliser les noms des critères multistructurels
    var nomsMulti = criteresMulti.map(function (c) {
        return { nom: _normaliserNomCritereIPB(c.nom), ponderation: c.ponderation || 0 };
    });

    // Scores pour les artefacts récents (dans la fenêtre IPB)
    var limite = Math.min(evaluationsEleve.length, fenetreN);
    var scoresRecents = [];
    for (var i = 0; i < limite; i++) {
        var result = _calculerScoreMultiArtefactIPB(evaluationsEleve[i], nomsMulti, tableConversion);
        scoresRecents.push(result ? result.score : null);
    }

    // IPB : compter les consécutifs sous le seuil (depuis le plus récent)
    var ipb = 0;
    for (var j = 0; j < scoresRecents.length; j++) {
        if (scoresRecents[j] !== null && scoresRecents[j] < seuilDefi) {
            ipb++;
        } else {
            break;
        }
    }

    var scoreActuel = scoresRecents.length > 0 ? scoresRecents[0] : null;
    var scorePrecedent = scoresRecents.length > 1 ? scoresRecents[1] : null;
    var direction = _determinerDirectionScoreIPB(scoreActuel, scorePrecedent, seuilProgression);

    return {
        ipb: ipb,
        scoreActuel: scoreActuel,
        scorePrecedent: scorePrecedent,
        direction: direction,
        criteresMulti: nomsMulti.map(function (c) { return c.nom; }),
        criteresEnDefi: _identifierCriteresEnDefiIPB(evaluationsEleve[0], nomsMulti, tableConversion, seuilDefi),
        fenetre: limite,
        seuil: seuilDefi,
        scoresParArtefact: scoresRecents.slice().reverse(), // ancien → récent
        historiqueComplet: _construireHistoriqueIPB(evaluationsEleve, productions, nomsMulti, tableConversion)
    };
}

/**
 * Diagnostique le portrait de suivi de l'apprentissage.
 * Croise l'IPB (persistance) avec la direction pour produire un diagnostic en langage clair.
 * @param {string} da - Numéro de DA
 * @returns {Object|null} - { diagnostic, ipb, direction, scoreActuel, niveauRaI, criteresEnDefi, couleur }
 */
function diagnostiquerSuiviApprentissage(da) {
    var ipbData = calculerIPB(da);
    if (!ipbData) return null;

    var ipb = ipbData.ipb;
    var dir = ipbData.direction;
    var diagnostic, couleur, niveauRaI;

    if (ipb === 0) {
        diagnostic = 'Maîtrise acquise';
        couleur = '#28a745';
        niveauRaI = 1;
    } else if (ipb === 1 && dir === '↗') {
        diagnostic = 'Difficulté résolue';
        couleur = '#28a745';
        niveauRaI = 1;
    } else if (ipb === 1) {
        diagnostic = 'Difficulté émergente';
        couleur = '#ff9800';
        niveauRaI = 1;
    } else if (ipb === 2 && dir === '↗') {
        diagnostic = 'Progression';
        couleur = '#2196f3';
        niveauRaI = 2;
    } else if (ipb === 2 && dir === '→') {
        diagnostic = 'Plateau';
        couleur = '#ff9800';
        niveauRaI = 2;
    } else if (ipb === 2) {
        diagnostic = 'Difficulté constante';
        couleur = '#dc3545';
        niveauRaI = 2;
    } else {
        // ipb >= 3
        if (dir === '↗') {
            diagnostic = 'Progression lente';
            couleur = '#2196f3';
            niveauRaI = 2;
        } else {
            diagnostic = 'Difficulté persistante';
            couleur = '#dc3545';
            niveauRaI = 3;
        }
    }

    return {
        diagnostic: diagnostic,
        ipb: ipb,
        direction: dir,
        scoreActuel: ipbData.scoreActuel,
        niveauRaI: niveauRaI,
        criteresEnDefi: ipbData.criteresEnDefi,
        criteresMulti: ipbData.criteresMulti,
        couleur: couleur,
        fenetre: ipbData.fenetre,
        seuil: ipbData.seuil,
        scoresParArtefact: ipbData.scoresParArtefact,
        historiqueComplet: ipbData.historiqueComplet
    };
}

// [Phase 6] interpreterIndiceBlocage() supprimé — remplacé par diagnostiquerSuiviApprentissage()

/**
 * Diagnostique les forces et défis selon le seuil pédagogique
 * @param {Object} moyennes - Moyennes par critère
 * @param {number} seuil - Seuil pour identifier une force (défaut: valeur configurable via interpretation-config.js)
 * @returns {Object} - { forces: [], defis: [], principaleForce: '', principalDefi: '' }
 */
function diagnostiquerForcesChallenges(moyennes, seuil = null) {
    // Utiliser le seuil configurable si aucun seuil n'est fourni
    if (seuil === null) {
        seuil = obtenirSeuil('defiSpecifique');
    }
    if (!moyennes) {
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Lire la grille de référence configurée
    const grille = obtenirGrilleReferenceDepistage();

    if (!grille || !grille.criteres || grille.criteres.length === 0) {
        console.warn('⚠️ Pas de grille de référence - diagnostic forces/défis impossible');
        console.warn('   → Grille:', grille);
        console.warn('   → Allez dans Réglages → Pratique de notation pour configurer une grille de référence');
        return { forces: [], defis: [], principaleForce: null, principalDefi: null };
    }

    // Construire dynamiquement le tableau des critères depuis la grille
    const criteres = grille.criteres.map(c => {
        // Normaliser le nom du critère pour trouver sa clé dans moyennes
        // Ex: "Structure" → "structure", "Plausibilité" → "plausibilite"
        const cleNormalisee = c.nom.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever accents
            .replace(/\s+/g, '');  // Enlever espaces

        return {
            nom: c.nom,
            cle: cleNormalisee,
            score: moyennes[cleNormalisee] ?? null,
            ponderation: c.ponderation || 0
        };
    }).filter(c => c.score !== null); // Garder seulement critères avec score

    // Trier forces et défis (considérer pondération pour importance)
    const forces = criteres.filter(c => c.score >= seuil).sort((a, b) => {
        // Tri primaire : par score descendant
        if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
        // Tri secondaire : par pondération (critères importants en premier)
        return b.ponderation - a.ponderation;
    });

    const defis = criteres.filter(c => c.score < seuil).sort((a, b) => {
        // Tri primaire : par score ascendant (pire défi en premier)
        if (Math.abs(a.score - b.score) > 0.01) return a.score - b.score;
        // Tri secondaire : par pondération (défis importants en premier)
        return b.ponderation - a.ponderation;
    });

    return {
        forces: forces,
        defis: defis,
        principaleForce: forces.length > 0 ? forces[0] : null,
        principalDefi: defis.length > 0 ? defis[0] : null,
        moyennesCriteres: moyennes // Inclure les moyennes pour affichage par niveau IDME
    };
}

/* ===============================
   🎯 SYSTÈME DE CIBLES D'INTERVENTION
   Calcul du Pattern actuel et détermination des cibles d'intervention
   basé sur les indices A-C-P et les critères SRPNF
   =============================== */

/**
 * Calcule les indices sur les N DERNIERS artefacts (chronologiquement)
 *
 * DISTINCTION IMPORTANTE :
 * - Dépistage (pourDepistage=true) : Utilise nombreProductionsAnalyse (défaut 3)
 *   → Détection précoce des patterns pour intervenir à temps
 * - Performance finale (pourDepistage=false) : Utilise nombreARetenir (défaut 4)
 *   → Calcul de la note finale du portfolio
 *
 * @param {string} da - Numéro de DA
 * @param {boolean} pourDepistage - Si true, utilise fenêtre de dépistage (3). Si false, utilise N pour note finale (4)
 * @returns {Object} - { performance, idmeMoyen, francaisMoyen, nbArtefacts }
 */
function calculerIndicesNDerniersArtefacts(da, pourDepistage = false) {
    // Déterminer le nombre d'artefacts selon l'usage
    let nombreArtefacts;
    if (pourDepistage) {
        // Pour dépistage : fenêtre glissante configurable (Réglages › Interprétation)
        nombreArtefacts = obtenirNombreProductionsPourPatterns(); // Défaut 3
    } else {
        // Pour performance finale : N meilleurs artefacts (Réglages › Portfolio)
        const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
        nombreArtefacts = config.configPAN?.portfolio?.nombreARetenir || 4; // Défaut 4
    }

    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    // ✅ CORRECTION (29 déc 2025): Utiliser obtenirDonneesSelonMode() au lieu de db.getSync()
    // pour respecter le namespace du trimestre archivé et le filtrage par coursId
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.noteFinale !== null &&
        e.noteFinale !== undefined
    );

    if (evaluationsEleve.length === 0) {
        return { performance: 0, idmeMoyen: 0, francaisMoyen: 0, nbArtefacts: 0 };
    }

    // Trier par date de création (la plus récente d'abord)
    // Si pas de date, utiliser l'ordre inverse d'ajout (derniers ajoutés = plus récents)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N derniers (selon config PAN, ou moins si pas assez d'artefacts)
    const troisDerniers = evaluationsEleve.slice(0, nombreArtefacts);

    // Calculer la performance moyenne (notes)
    const performance = troisDerniers.reduce((sum, e) => sum + e.noteFinale, 0) / troisDerniers.length / 100;

    // Calculer IDME moyen (si disponible)
    const tableConversion = obtenirTableConversionIDME();
    const niveauxIDME = troisDerniers
        .map(e => e.niveauFinal)
        .filter(n => n && ['I', 'D', 'M', 'E'].includes(n))
        .map(n => convertirNiveauIDMEEnScore(n, tableConversion))
        .filter(s => s !== null);

    const idmeMoyen = niveauxIDME.length > 0
        ? niveauxIDME.reduce((sum, s) => sum + s, 0) / niveauxIDME.length
        : 0;

    // Calculer moyenne du critère Français (si disponible)
    const scoresFrancais = [];
    const regexFrancais = /FRAN[ÇC]AIS\s+[ÉE]CRIT\s*\(([IDME])\)/gi;

    troisDerniers.forEach(evaluation => {
        const retroaction = evaluation.retroactionFinale || '';
        let match;
        while ((match = regexFrancais.exec(retroaction)) !== null) {
            const niveauIDME = match[1].toUpperCase();
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);
            if (score !== null) {
                scoresFrancais.push(score * 100); // Convertir en pourcentage
            }
        }
    });

    const francaisMoyen = scoresFrancais.length > 0
        ? scoresFrancais.reduce((sum, s) => sum + s, 0) / scoresFrancais.length
        : 0;


    return {
        performance: performance,
        idmeMoyen: idmeMoyen,
        francaisMoyen: francaisMoyen,
        nbArtefacts: troisDerniers.length
    };
}

/**
 * Calcule la progression (direction) selon le Guide de monitorage
 * Compare la performance des N artefacts les plus récents (AM) vs les N suivants avec chevauchement (AL)
 * Le nombre N est configurable via Réglages → Interprétation des données
 *
 * Fenêtre glissante: Si artefacts = A, B, C, ..., N, N+1 (du plus récent au plus ancien)
 * - AM = moyenne(A, B, ..., N)
 * - AL = moyenne(B, C, ..., N+1)
 *
 * Formule: SI(AM > AL + seuil; "↗"; SI(AM < AL - seuil; "↘"; "→"))
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { direction: '↗'|'→'|'↘', interpretation, AM, AL, difference }
 */
function calculerProgressionEleve(da) {
    // 🆕 NOUVELLE LOGIQUE : Basée sur les critères individuels plutôt que sur la note globale
    // Obtenir les directions pour chaque critère
    const pratique = obtenirPratiqueActuelle();
    const directionsCriteres = calculerDirectionsCriteres(da);

    // Vérifier si nous avons suffisamment de données
    const criteres = Object.keys(directionsCriteres);
    const criteresAvecDonnees = criteres.filter(c => directionsCriteres[c].symbole !== '');

    if (criteresAvecDonnees.length === 0) {
        return {
            direction: null,
            interpretation: 'Données insuffisantes',
            AM: null,
            AL: null,
            difference: null,
            nbCriteres: 0,
            criteresDetail: directionsCriteres
        };
    }

    // Compter les critères en amélioration, en baisse, et en plateau
    let nbAmelioration = 0;
    let nbBaisse = 0;
    let nbPlateau = 0;

    criteresAvecDonnees.forEach(critere => {
        const symbole = directionsCriteres[critere].symbole;
        if (symbole === '→') {
            nbAmelioration++;
        } else if (symbole === '←') {
            nbBaisse++;
        } else if (symbole === '—') {
            nbPlateau++;
        }
    });

    // Déterminer la direction globale selon la majorité
    let direction, interpretation;
    if (nbAmelioration > nbBaisse && nbAmelioration > nbPlateau) {
        direction = '↗';
        interpretation = 'Progression';
    } else if (nbBaisse > nbAmelioration && nbBaisse > nbPlateau) {
        direction = '↘';
        interpretation = 'Régression';
    } else {
        direction = '—';
        interpretation = 'Plateau';
    }

    // Calculer une moyenne pondérée des différences pour information
    let sommeDifferences = 0;
    let nbDifferences = 0;
    criteresAvecDonnees.forEach(critere => {
        const diff = parseFloat(directionsCriteres[critere].difference);
        if (!isNaN(diff)) {
            sommeDifferences += diff;
            nbDifferences++;
        }
    });
    const differenceGlobale = nbDifferences > 0 ? (sommeDifferences / nbDifferences).toFixed(1) : '0.0';


    return {
        direction,
        interpretation,
        AM: null, // Non utilisé dans la nouvelle logique
        AL: null, // Non utilisé dans la nouvelle logique
        difference: differenceGlobale,
        nbCriteres: criteresAvecDonnees.length,
        nbAmelioration,
        nbBaisse,
        nbPlateau,
        criteresDetail: directionsCriteres
    };
}

/**
 * Identifie le défi spécifique (critère SRPNF le plus faible) sur les N derniers artefacts
 * Le nombre N est configurable via Réglages → Interprétation des données
 * Seuil: Valeur configurable (défaut: 71.25%, ajustable via interpretation-config.js)
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { defi: 'Structure'|'Rigueur'|'Plausibilité'|'Nuance'|'Français'|'Aucun', score (0-1) }
 */
function identifierDefiSpecifique(da) {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];

    // Obtenir le nombre de productions configuré pour l'analyse des patterns
    const N = obtenirNombreProductionsPourPatterns() || 3;

    // Filtrer les productions évaluables selon la pratique active
    const productionsIds = obtenirIdsProductionsEvaluables(productions);

    const evaluationsEleve = evaluations.filter(e =>
        e.etudiantDA === da &&
        productionsIds.includes(e.productionId) &&
        e.retroactionFinale
    );

    if (evaluationsEleve.length === 0) {
        return { defi: 'Aucun', score: null };
    }

    // Trier par date (plus récent d'abord)
    evaluationsEleve.sort((a, b) => {
        const dateA = a.dateEvaluation || a.dateCreation || 0;
        const dateB = b.dateEvaluation || b.dateCreation || 0;
        return new Date(dateB) - new Date(dateA);
    });

    // Prendre les N plus récents
    const derniers = evaluationsEleve.slice(0, N);

    // Obtenir la table de conversion IDME
    const tableConversion = obtenirTableConversionIDME();

    // Accumuler les scores par critère
    const scoresCriteres = {
        structure: [],
        rigueur: [],
        plausibilite: [],
        nuance: [],
        francais: []
    };

    // Regex pour extraire: NOM_CRITERE (NIVEAU)
    const regexCritere = /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi;

    derniers.forEach(evaluation => {
        const retroaction = evaluation.retroactionFinale || '';
        let match;
        while ((match = regexCritere.exec(retroaction)) !== null) {
            const nomCritere = match[1].toUpperCase();
            const niveauIDME = match[2].toUpperCase();
            const score = convertirNiveauIDMEEnScore(niveauIDME, tableConversion);

            if (score !== null) {
                if (nomCritere === 'STRUCTURE') {
                    scoresCriteres.structure.push(score);
                } else if (nomCritere === 'RIGUEUR') {
                    scoresCriteres.rigueur.push(score);
                } else if (nomCritere.startsWith('PLAUSIBILIT')) {
                    scoresCriteres.plausibilite.push(score);
                } else if (nomCritere === 'NUANCE') {
                    scoresCriteres.nuance.push(score);
                } else if (nomCritere.startsWith('FRAN')) {
                    scoresCriteres.francais.push(score);
                }
            }
        }
    });

    // Calculer les moyennes
    const moyennes = {};
    const seuil = obtenirSeuil('defiSpecifique'); // Seuil configurable (défaut: 71.25%)

    for (const critere in scoresCriteres) {
        const scores = scoresCriteres[critere];
        if (scores.length > 0) {
            moyennes[critere] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        } else {
            moyennes[critere] = null;
        }
    }

    // Identifier le critère le plus faible (< seuil)
    let defiMinimum = null;
    let scoreMinimum = 1.0;

    const nomsCriteres = {
        structure: 'Structure',
        rigueur: 'Rigueur',
        plausibilite: 'Plausibilité',
        nuance: 'Nuance',
        francais: 'Français'
    };

    for (const critere in moyennes) {
        const score = moyennes[critere];
        if (score !== null && score < seuil && score < scoreMinimum) {
            scoreMinimum = score;
            defiMinimum = nomsCriteres[critere];
        }
    }


    return {
        defi: defiMinimum || 'Aucun',
        score: defiMinimum ? scoreMinimum : null
    };
}

/**
 * Identifie le Pattern actuel selon la formule pédagogique
 *
 * Formule: SI(AH≤0,4;"Difficulté persistante";
 *             SI(ET(AH≤0,5;N≠"Aucun");"Difficulté émergente";
 *                SI(ET(AH≤0,75;N≠"Aucun");"Défi spécifique";"Stable")))
 *
 * @param {number} performancePAN3 - Performance sur 3 derniers artefacts (0-1)
 * @param {boolean} aUnDefi - True si un défi est identifié
 * @returns {string} - Pattern: 'Difficulté persistante', 'Difficulté émergente', 'Défi spécifique', 'Stable'
 */
function identifierPatternActuel(performancePAN3, aUnDefi) {
    // Utiliser les seuils configurables IDME
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');      // Par défaut 0.64 (64%)
    const seuilDeveloppement = obtenirSeuil('idme.developpement');  // Par défaut 0.75 (75%)


    // Difficulté persistante : Performance < 64% (Incomplet - unistructurel)
    if (performancePAN3 < seuilInsuffisant) {
        return 'Difficulté persistante';
    }

    // Difficulté émergente : Performance < 75% (En développement - multistructurel) ET a un défi
    if (performancePAN3 < seuilDeveloppement && aUnDefi) {
        return 'Difficulté émergente';
    }

    // Défi spécifique : Performance acceptable mais a un défi récurrent
    if (aUnDefi) {
        return 'Défi spécifique';
    }

    // Stable : Pas de défi ou performance maîtrisée
    return 'Stable';
}

/**
 * Détermine la cible d'intervention selon la formule pédagogique complète
 *
 * @param {string} da - Numéro de DA
 * @returns {Object} - { cible, pattern, niveau, couleur, emoji }
 */
/**
 * Détermine le Modèle de la Réponse à l'intervention (RàI) basé UNIQUEMENT sur P et SRPNF
 * (sans tenir compte de la mobilisation A-C)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Modèle de la Réponse à l'intervention (RàI) avec pattern et descriptif
 */
function determinerNiveauRaiPedagogique(da) {
    // Récupérer les indices de performance
    const indices = calculerTousLesIndices(da);
    const P = indices.P / 100; // Convertir en décimal 0-1

    // Déterminer quelle fonction utiliser selon la pratique
    const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    // Session A-2 : id canonique normalisé à la lecture, défaut = PRATIQUE_DEFAUT ('standards').
    const pratique = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(config.pratique) : config.pratique) || (window.PRATIQUE_DEFAUT || 'standards');

    // Calculer moyennes SRPNF
    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);


    // Détecter les défis
    const diagnostic = diagnostiquerForcesChallenges(moyennes);

    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    // 🆕 BETA 98.9: Vérifier si données suffisantes avant interprétation
    if (indices3Derniers.nbArtefacts === 0) {
        // Élève présent mais aucune production → Non-participation (signal prioritaire)
        if (indices.A > 0) {
            return {
                niveau: 3,
                label: 'Non-participation',
                pattern: 'Non-participation',
                defi: 'Aucun',
                description: 'Étudiant·e présent·e en classe mais aucune production remise. Profil prioritaire nécessitant une intervention immédiate.',
                badgeClasse: 'badge-rai-3',
                patternBadge: 'badge-pattern-difficulte-persistante',
                donneesSuffisantes: false,
                nbArtefacts: 0,
                fenetreAnalyse: obtenirNombreProductionsPourPatterns()
            };
        }
        // Aucune présence et aucune production → En attente
        return {
            niveau: 0,
            label: 'En attente',
            pattern: 'Données insuffisantes',
            defi: 'Aucun',
            description: 'Aucune production évaluée. L\'interprétation sera disponible après la première évaluation.',
            badgeClasse: 'badge-attente',
            patternBadge: 'badge-attente',
            donneesSuffisantes: false,
            nbArtefacts: 0,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Déterminer le pattern basé uniquement sur la performance
    const pattern = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);

    // Seuils configurables
    const seuilMaitrise = obtenirSeuil('idme.maitrise');
    const seuilDeveloppement = obtenirSeuil('idme.developpement');
    const seuilInsuffisant = obtenirSeuil('idme.insuffisant');


    // LOGIQUE PÉDAGOGIQUE (basée uniquement sur P et SRPNF)

    // Niveau 3 - Intensif : Difficulté persistante (P < insuffisant OU plusieurs critères < développement)
    if (pattern === 'Difficulté persistante' || P < seuilInsuffisant) {
        return {
            niveau: 3,
            label: 'Niveau 3 - Intensif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: 'Difficultés pédagogiques majeures nécessitant un soutien intensif.',
            badgeClasse: 'badge-rai-3',
            patternBadge: 'badge-pattern-difficulte-persistante',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Niveau 2 - Préventif : Performance en développement (<75%) OU Difficulté émergente OU Défi spécifique
    // Un élève avec P en zone "Développement" (65-74%) nécessite un accompagnement préventif,
    // même si son pattern est "Stable" (pas de défi identifié).
    if (P < seuilDeveloppement || pattern === 'Difficulté émergente' || pattern === 'Défi spécifique') {
        // Déterminer la description selon le contexte
        let description;
        if (P < seuilDeveloppement && pattern === 'Stable') {
            description = 'Performance en développement nécessitant un accompagnement préventif.';
        } else if (pattern === 'Difficulté émergente') {
            description = 'Difficultés émergentes nécessitant une intervention préventive ciblée.';
        } else {
            description = 'Défi spécifique identifié nécessitant un accompagnement ciblé.';
        }

        return {
            niveau: 2,
            label: 'Niveau 2 - Préventif',
            pattern: pattern,
            defi: diagnostic.principalDefi?.nom || 'Aucun',
            description: description,
            badgeClasse: 'badge-rai-2',
            patternBadge: pattern === 'Difficulté émergente'
                ? 'badge-pattern-difficulte-emergente'
                : pattern === 'Défi spécifique'
                    ? 'badge-pattern-defi-specifique'
                    : 'badge-pattern-stable',
            nbArtefacts: indices3Derniers.nbArtefacts,
            fenetreAnalyse: obtenirNombreProductionsPourPatterns()
        };
    }

    // Niveau 1 - Universel : Performance maîtrisée (≥75%) et stable
    return {
        niveau: 1,
        label: 'Niveau 1 - Universel',
        pattern: pattern,
        defi: diagnostic.principalDefi?.nom || 'Aucun',
        description: 'Performance stable. Suivi régulier en classe.',
        badgeClasse: 'badge-rai-1',
        patternBadge: 'badge-pattern-stable',
        nbArtefacts: indices3Derniers.nbArtefacts,
        fenetreAnalyse: obtenirNombreProductionsPourPatterns()
    };
}

/**
 * Détermine l'alerte contextuelle basée UNIQUEMENT sur A et C
 * (sans tenir compte de la performance P)
 * @param {string} da - Numéro de DA
 * @returns {Object} - Alerte contextuelle avec niveau d'engagement
 */
function determinerAlerteContextuelle(da) {
    // Récupérer les indices de mobilisation
    const indices = calculerTousLesIndices(da);
    const A = indices.A / 100; // Convertir en décimal 0-1
    const C = indices.C / 100; // Convertir en décimal 0-1

    // 🆕 BETA 96.1: Vérifier si données suffisantes pour C
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);
    const cEstCalculable = indices3Derniers.nbArtefacts > 0 || C > 0;

    // Interpréter la mobilisation
    const interpMobilisation = interpreterMobilisation(A, C);


    // 🆕 BETA 96.1: Si C n'est pas calculable, retourner un état "en attente"
    if (!cEstCalculable) {
        return {
            niveau: 'attente',
            label: 'En attente',
            description: 'Données insuffisantes pour évaluer le contexte. En attente des premières remises.',
            badgeClasse: 'badge-attente',
            A: (A * 100).toFixed(0) + '%',
            C: 'En attente',
            recommandation: 'L\'interprétation du contexte d\'apprentissage sera disponible après les premières remises.',
            donneesSuffisantes: false
        };
    }

    // LOGIQUE CONTEXTUELLE (basée uniquement sur A et C)

    // Contexte très favorable : A ≥ 85% ET C ≥ 85%
    if (A >= 0.85 && C >= 0.85) {
        return {
            niveau: 'tres-favorable',
            label: 'Très favorable',
            description: 'Contexte très favorable. L\'étudiant·e est assidu·e et mobilisé·e.',
            badgeClasse: 'badge-engagement-tres-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte favorable : A ≥ 75% ET C ≥ 75%
    if (A >= 0.75 && C >= 0.75) {
        return {
            niveau: 'favorable',
            label: 'Favorable',
            description: 'Contexte favorable. L\'étudiant·e est présent·e et mobilisé·e.',
            badgeClasse: 'badge-engagement-favorable',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Les interventions peuvent se concentrer sur le développement des habiletés et compétences.'
        };
    }

    // Contexte modéré : A ≥ 65% ET C ≥ 65%
    if (A >= 0.65 && C >= 0.65) {
        return {
            niveau: 'modere',
            label: 'Modéré',
            description: 'Contexte modéré. Performance adéquate mais mobilisation pourrait être améliorée.',
            badgeClasse: 'badge-engagement-modere',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Suivi régulier recommandé pour maintenir l\'engagement et éviter une baisse de performance.'
        };
    }

    // Contexte fragile : A < 65% OU C < 65%
    if (A < 0.65 || C < 0.65) {
        return {
            niveau: 'fragile',
            label: 'Fragile',
            description: 'Contexte fragile. La tendance actuelle invite à un suivi rapproché.',
            badgeClasse: 'badge-engagement-fragile',
            A: (A * 100).toFixed(0) + '%',
            C: (C * 100).toFixed(0) + '%',
            recommandation: 'Interventions recommandées : Rencontrer l\'étudiant·e pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s\'il y a des obstacles (emploi, santé, etc.).'
        };
    }

    // Contexte insuffisant : A < 50% OU C < 50%
    return {
        niveau: 'insuffisant',
        label: 'Insuffisant',
        description: 'Contexte insuffisant. Une rencontre individuelle est recommandée.',
        badgeClasse: 'badge-engagement-insuffisant',
        A: (A * 100).toFixed(0) + '%',
        C: (C * 100).toFixed(0) + '%',
        recommandation: 'Intervention urgente requise : Rencontre individuelle, contact avec aide pédagogique, vérifier situation personnelle.'
    };
}

function _resoudreCibleDifficultePersistante(M, N, I) {
    if (N === 'Français' && I <= 17) {
        return { cible: 'Rencontre individuelle | CAF | Dépistage', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Structure' && I <= 17) {
        return { cible: 'Remédiation en Structure | Exercice supplémentaire | CAF', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Rigueur' && I <= 17) {
        return { cible: 'Remédiation en Rigueur | CAF', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    if (N === 'Aucun') {
        return { cible: 'Rencontre individuelle | CAF | Dépistage', pattern: M, niveau: 3, couleur: '#dc3545' };
    }
    return null;
}

function _resoudreCibleDifficulteEmergente(M, N, I) {
    if (N === 'Français' && I >= 18 && I <= 20) {
        return { cible: 'Remédiation en stratégie de révision ciblée | CAF recommandé', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Structure' && I >= 18 && I <= 27) {
        return { cible: 'Remédiation en Structure', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Rigueur' && I >= 18 && I <= 27) {
        return { cible: 'Remédiation en Rigueur', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    if (N === 'Aucun') {
        return { cible: 'Remédiation en rigueur', pattern: M, niveau: 2, couleur: '#ff9800' };
    }
    return null;
}

function _resoudreCibleDefiSpecifique(M, N, I) {
    if (N === 'Français') {
        if (I <= 17) return { cible: 'Rencontre individuelle | CAF | Dépistage SA', pattern: M, niveau: 2, couleur: '#ffc107' };
        if (I >= 18 && I <= 20) return { cible: 'Remédiation en révision linguistique | CAF recommandé', pattern: M, niveau: 2, couleur: '#ffc107' };
        if (I >= 21 && I <= 27) return { cible: 'Remédiation en révision linguistique', pattern: M, niveau: 2, couleur: '#ffc107' };
    }
    if (N === 'Structure' && I >= 18) return { cible: 'Pratique guidée en Structure', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Rigueur' && I >= 18) return { cible: 'Pratique guidée en Rigueur', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Plausibilité' && I >= 18) return { cible: 'Pratique guidée en Plausibilité', pattern: M, niveau: 2, couleur: '#ffc107' };
    if (N === 'Nuance' && I >= 18) return { cible: 'Pratique guidée en Nuance', pattern: M, niveau: 2, couleur: '#ffc107' };
    return null;
}

function _resoudreCibleStable(M, N, I) {
    if (N === 'Aucun') {
        return I >= 25
            ? { cible: 'Pratique autonome → Explorer jumelage', pattern: M, niveau: 1, couleur: '#28a745' }
            : { cible: 'Suivi régulier | Performance stable', pattern: M, niveau: 1, couleur: '#28a745' };
    }
    if (I < 21) return null;
    const ciblesParDefi = {
        'Structure': 'Pratique autonome → Explorer structures originales',
        'Rigueur': 'Pratique autonome → Explorer pistes originales',
        'Plausibilité': 'Pratique autonome → Explorer hypothèses originales',
        'Nuance': 'Pratique autonome → Explorer interprétations originales',
        'Français': 'Pratique autonome → Explorer style'
    };
    if (ciblesParDefi[N]) {
        return { cible: ciblesParDefi[N], pattern: M, niveau: 1, couleur: '#28a745' };
    }
    return null;
}

function determinerCibleIntervention(da) {
    const indices = calculerTousLesIndices(da);
    const config = db.getSync(cle('modalitesEvaluation'), null) || db.getSync('modalitesEvaluation', {});
    // Session A-2 : id canonique normalisé à la lecture, défaut = PRATIQUE_DEFAUT ('standards').
    const pratique = (typeof normaliserIdPratique === 'function' ? normaliserIdPratique(config.pratique) : config.pratique) || (window.PRATIQUE_DEFAUT || 'standards');

    const moyennes = (pratique === 'standards')
        ? calculerMoyennesCriteresRecents(da)
        : calculerMoyennesCriteres(da);

    const diagnostic = diagnostiquerForcesChallenges(moyennes);
    const indices3Derniers = calculerIndicesNDerniersArtefacts(da, true);

    if (indices3Derniers.nbArtefacts === 0 && indices.A > 0) {
        return { cible: 'Non-participation', pattern: 'Non-participation', niveau: 3, couleur: '#dc3545' };
    }

    const interpMobilisation = interpreterMobilisation(indices.A / 100, indices.C / 100);
    const E = interpMobilisation.niveau;
    const I = indices3Derniers.francaisMoyen;
    const M = identifierPatternActuel(indices3Derniers.performance, diagnostic.principalDefi !== null);
    const N = diagnostic.principalDefi ? diagnostic.principalDefi.nom : 'Aucun';

    if (E === 'Décrochage') {
        return { cible: 'Décrochage', pattern: M, niveau: 3, couleur: '#9e9e9e' };
    }

    if (M === 'Difficulté persistante') {
        const cible = _resoudreCibleDifficultePersistante(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Difficulté émergente') {
        const cible = _resoudreCibleDifficulteEmergente(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Défi spécifique') {
        const cible = _resoudreCibleDefiSpecifique(M, N, I);
        if (cible) return cible;
    }

    if (M === 'Stable') {
        const cible = _resoudreCibleStable(M, N, I);
        if (cible) return cible;
    }

    if (E.includes('fragile') || E.includes('critique')) {
        return { cible: 'Risque de démotivation', pattern: M, niveau: 2, couleur: '#ff9800' };
    }

    return { cible: 'À clarifier en rencontre individuelle', pattern: M, niveau: 1, couleur: '#8aa4b0' };
}

// Exporter les 14 fonctions vers window (décision étape 1 b — convention systématique)
window.obtenirTableConversionIDME = obtenirTableConversionIDME;
window.convertirNiveauIDMEEnScore = convertirNiveauIDMEEnScore;
window.calculerMoyennesCriteres = calculerMoyennesCriteres;
window.calculerMoyennesCriteresRecents = calculerMoyennesCriteresRecents;
window.calculerIPB = calculerIPB;
window.diagnostiquerSuiviApprentissage = diagnostiquerSuiviApprentissage;
window.diagnostiquerForcesChallenges = diagnostiquerForcesChallenges;
window.calculerIndicesNDerniersArtefacts = calculerIndicesNDerniersArtefacts;
window.calculerProgressionEleve = calculerProgressionEleve;
window.identifierDefiSpecifique = identifierDefiSpecifique;
window.identifierPatternActuel = identifierPatternActuel;
window.determinerNiveauRaiPedagogique = determinerNiveauRaiPedagogique;
window.determinerAlerteContextuelle = determinerAlerteContextuelle;
window.determinerCibleIntervention = determinerCibleIntervention;

})();
