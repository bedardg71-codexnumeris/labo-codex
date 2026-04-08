/**
 * consolidation.js — Moteur de calcul du module « Consolidation des apprentissages »
 *
 * Mesure si les productions évaluées consolident durablement les critères
 * de la grille d'évaluation configurée par l'enseignant.
 * Lecture seule : ne modifie aucune donnée.
 *
 * Tous les paramètres (critères, seuils, échelle) sont lus dynamiquement
 * depuis les grilles, échelles et productions configurées — aucune pratique
 * de notation n'est codée en dur.
 *
 * API publique :
 *   calculerMatriceConsolidation()    → matrice groupe (N productions × M critères)
 *   calculerConsolidationIndividuelle(da) → données individuelles
 *   calculerComparaisonPrerequis()    → segmentation A/B (pratique délibérée)
 *   afficherMatriceConsolidation()    → rendu HTML dans Suivi > Labo
 *   ajouterMarqueursConsolidation(da) → losanges Chart.js sur profil étudiant
 *
 * Dépendances : db.js (cle, obtenirDonneesSelonMode, db.getSync)
 */

// ─── Constantes de l'algorithme ──────────────────────────────────────────────
// Seuls les seuils de l'ALGORITHME sont ici. Les seuils pédagogiques
// (maîtrise, niveaux) viennent de l'échelle configurée.

var CONSOL_SEUIL_RETENTION_ARTEFACTS = 0.75; // maintenir la maîtrise sur ≥ 75 % des suivants
var CONSOL_SEUIL_DURABLE = 0.75;             // taux de rétention groupe ≥ 75 % = durable
var CONSOL_SEUIL_FRAGILE = 0.65;             // taux de rétention groupe ≥ 65 % = fragile

// ─── État dynamique (alimenté par _chargerContexte) ──────────────────────────

var _ctx = null; // cache du contexte chargé

// ─── Chargement du contexte ──────────────────────────────────────────────────

/**
 * Charge et met en cache toutes les données nécessaires au calcul.
 * Retourne un objet contexte avec :
 *   productions[]  — productions évaluées, dans l'ordre du tableau
 *   criteres[]     — noms de critères uniques trouvés dans les évaluations
 *   seuilMaitrise  — score numérique (0-1) au-dessus duquel un niveau = maîtrise
 *   convertir(code) — fonction qui convertit un code de niveau en score (0-1)
 *   criteresParProd — Map<prodIndex, Set<critereNom>> — critères évalués par production
 *   parEtudiant    — Map<da, [{artefactIndex, criteres:{nom:score}}]>
 *   grilles        — Map<da, grille[]> — grille par étudiant
 */
function _chargerContexte() {
    // Invalider le cache à chaque appel pour refléter les données actuelles
    var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    var productions = obtenirDonneesSelonMode('productions') || [];

    // Filtrer par groupe actif (cohérent avec le bandeau contextuel)
    var infoCours = db.getSync('infoCours', null);
    if (infoCours && !infoCours._modeCours && infoCours.groupe) {
        var groupeNorm = String(infoCours.groupe).padStart(5, '0');
        evaluations = evaluations.filter(function(ev) {
            return String(ev.groupe || '').padStart(5, '0') === groupeNorm;
        });
    }

    // ── Échelle ──────────────────────────────────────────────────────────
    var echelle = _detecterEchelle(productions);
    var conversion = _construireConversion(echelle);
    var seuilMaitrise = _detecterSeuilMaitrise(echelle);

    // ── Productions (toutes celles qui ont au moins une évaluation) ──────
    var prodsEvaluees = new Set();
    evaluations.forEach(function(ev) {
        if (!ev.remplaceeParId && ev.productionId) prodsEvaluees.add(ev.productionId);
    });

    // Garder l'ordre du tableau, filtrer les non-évaluées
    var prodsOrdonnees = productions.filter(function(p) {
        return prodsEvaluees.has(p.id) && p.type !== 'portfolio'; // exclure le conteneur portfolio
    });

    var nomsProductions = prodsOrdonnees.map(function(p) {
        return p.activiteApprentissage || p.description || p.titre || p.nom || '';
    });

    // Index productionId → position 0-based
    var prodIndex = {};
    prodsOrdonnees.forEach(function(p, i) { prodIndex[p.id] = i; });
    var nombreProds = prodsOrdonnees.length;

    // ── Évaluations → grille par étudiant ────────────────────────────────
    var criteresSet = {};         // critereNom → true (ensemble unique)
    var criteresParProd = {};     // prodIndex → Set<critereNom>
    var parEtudiant = {};         // da → [{artefactIndex, criteres:{nom:score}}]

    evaluations.forEach(function(ev) {
        if (ev.remplaceeParId) return;
        if (!ev.criteres || !Array.isArray(ev.criteres)) return;
        if (!ev.etudiantDA || !ev.productionId) return;

        var idx = prodIndex[ev.productionId];
        if (idx == null) return;

        var scores = {};
        ev.criteres.forEach(function(c) {
            var nom = (c.critereNom || c.critereId || '').trim();
            if (!nom) return;
            var score = conversion(c.niveauSelectionne);
            if (score != null) {
                scores[nom] = score;
                criteresSet[nom] = true;
                if (!criteresParProd[idx]) criteresParProd[idx] = {};
                criteresParProd[idx][nom] = true;
            }
        });

        if (Object.keys(scores).length === 0) return;

        if (!parEtudiant[ev.etudiantDA]) parEtudiant[ev.etudiantDA] = [];
        parEtudiant[ev.etudiantDA].push({ artefactIndex: idx, criteres: scores });
    });

    // Liste ordonnée des critères (ordre d'apparition dans les évaluations)
    var criteresListe = Object.keys(criteresSet);

    // Construire les grilles individuelles
    var grilles = {};
    Object.keys(parEtudiant).forEach(function(da) {
        var grille = new Array(nombreProds).fill(null);
        parEtudiant[da].forEach(function(ev) {
            grille[ev.artefactIndex] = ev.criteres;
        });
        grilles[da] = grille;
    });

    _ctx = {
        productions: prodsOrdonnees,
        nomsProductions: nomsProductions,
        nombreProds: nombreProds,
        criteres: criteresListe,
        criteresParProd: criteresParProd,
        seuilMaitrise: seuilMaitrise,
        conversion: conversion,
        parEtudiant: parEtudiant,
        grilles: grilles
    };

    return _ctx;
}

// ─── Détection de l'échelle ──────────────────────────────────────────────────

/**
 * Trouve l'échelle la plus utilisée parmi les productions.
 * Retourne l'objet échelle ou null.
 */
function _detecterEchelle(productions) {
    // Compter les échelleId
    var compteur = {};
    var meilleurId = null;
    var meilleurCount = 0;
    productions.forEach(function(p) {
        if (!p.echelleId) return;
        compteur[p.echelleId] = (compteur[p.echelleId] || 0) + 1;
        if (compteur[p.echelleId] > meilleurCount) {
            meilleurCount = compteur[p.echelleId];
            meilleurId = p.echelleId;
        }
    });

    if (!meilleurId) return null;

    // Charger depuis echellesTemplates (non namespacé)
    var echelles = db.getSync('echellesTemplates', []);
    return echelles.find(function(e) { return e.id === meilleurId; }) || null;
}

/**
 * Construit une fonction de conversion code → score (0-1) depuis l'échelle.
 * Si pas d'échelle : fallback IDME.
 */
function _construireConversion(echelle) {
    var map = {};

    if (echelle && echelle.niveaux && echelle.niveaux.length > 0) {
        echelle.niveaux.forEach(function(n) {
            if (n.code) {
                // Utiliser valeurCalcul si disponible, sinon milieu de la plage
                var val = n.valeurCalcul != null ? n.valeurCalcul : ((n.min + n.max) / 2);
                map[String(n.code).toUpperCase()] = val / 100;
            }
        });
    }

    // Fallback IDME si map vide
    if (Object.keys(map).length === 0) {
        map = { '0': 0.00, 'I': 0.40, 'D': 0.65, 'M': 0.75, 'E': 1.00 };
    }

    return function(niveau) {
        if (niveau == null || niveau === '') return null;
        if (typeof niveau === 'number') {
            // Échelle numérique : on ne sait pas le maximum, essayer le map
            var s = String(niveau);
            if (map[s] != null) return map[s];
            // Heuristique : si 0-4, normaliser sur 4; si 0-100, normaliser sur 100
            if (niveau >= 0 && niveau <= 4) return niveau / 4;
            if (niveau > 4 && niveau <= 100) return niveau / 100;
            return null;
        }
        var code = String(niveau).toUpperCase();
        if (map[code] != null) return map[code];
        // Dernier recours : numérique en string
        var num = parseFloat(code);
        if (!isNaN(num) && num >= 0 && num <= 100) return num / 100;
        return null;
    };
}

/**
 * Détecte le seuil de maîtrise depuis l'échelle.
 * Convention : avant-dernier niveau = maîtrise. Son `min / 100` = seuil.
 * Fallback : 0.75 (M dans IDME).
 */
function _detecterSeuilMaitrise(echelle) {
    if (!echelle || !echelle.niveaux || echelle.niveaux.length < 2) return 0.75;

    // Trier par min croissant
    var niveauxTries = echelle.niveaux.slice().sort(function(a, b) {
        return (a.min || 0) - (b.min || 0);
    });

    // Avant-dernier = maîtrise
    var niveauMaitrise = niveauxTries[niveauxTries.length - 2];
    return (niveauMaitrise.min || 75) / 100;
}

// ─── Utilitaires de calcul ───────────────────────────────────────────────────

/**
 * Vérifie si un critère est évalué sur une production donnée.
 */
function _critereEvalue(ctx, critere, prodIndex) {
    return ctx.criteresParProd[prodIndex] && ctx.criteresParProd[prodIndex][critere];
}

/**
 * Indices des productions suivantes où un critère est évalué.
 */
function _prodsSuivantes(ctx, critere, depuisIndex) {
    var suivants = [];
    for (var i = depuisIndex + 1; i < ctx.nombreProds; i++) {
        if (_critereEvalue(ctx, critere, i)) suivants.push(i);
    }
    return suivants;
}

/**
 * Calcule la rétention individuelle pour un élève sur un critère à partir d'une production.
 */
function _retentionIndividuelle(ctx, grille, critere, prodIdx) {
    var suivants = _prodsSuivantes(ctx, critere, prodIdx);
    if (suivants.length === 0) return null;

    var maintenus = 0, total = 0;
    suivants.forEach(function(idx) {
        if (grille[idx] && grille[idx][critere] != null) {
            total++;
            if (grille[idx][critere] >= ctx.seuilMaitrise) maintenus++;
        }
    });

    if (total === 0) return null;
    return {
        retenu: (maintenus / total) >= CONSOL_SEUIL_RETENTION_ARTEFACTS,
        maintenusSur: maintenus,
        totalSuivants: total
    };
}

/**
 * Calcule une cellule de la matrice (production × critère) pour le groupe.
 */
function _calculerCellule(ctx, critere, prodIdx) {
    if (!_critereEvalue(ctx, critere, prodIdx)) {
        return { nonApplicable: true };
    }

    var nMaitrise = 0, nRetenu = 0, scores = [], retentionNonMesurable = false;

    Object.keys(ctx.grilles).forEach(function(da) {
        var grille = ctx.grilles[da];
        if (!grille[prodIdx] || grille[prodIdx][critere] == null) return;

        var score = grille[prodIdx][critere];
        scores.push(score);

        if (score >= ctx.seuilMaitrise) {
            nMaitrise++;
            var ret = _retentionIndividuelle(ctx, grille, critere, prodIdx);
            if (ret === null) {
                retentionNonMesurable = true;
            } else if (ret.retenu) {
                nRetenu++;
            }
        }
    });

    if (retentionNonMesurable && nRetenu === 0) {
        var somme = scores.reduce(function(a, b) { return a + b; }, 0);
        return {
            retentionNonMesurable: true,
            scoreMoyen: scores.length > 0 ? somme / scores.length : 0,
            nTotal: scores.length,
            nMaitrise: nMaitrise,
            scores: scores
        };
    }

    return {
        tauxRetention: nMaitrise > 0 ? nRetenu / nMaitrise : 0,
        nMaitrise: nMaitrise,
        nRetenu: nRetenu,
        nTotal: scores.length,
        retentionNonMesurable: false,
        nonApplicable: false,
        scores: scores
    };
}

/**
 * Cellule de rétention pour un sous-groupe (prérequis A ou B).
 */
function _celluleSegment(ctx, grillesSeg, critere, prodIdx) {
    var n = Object.keys(grillesSeg).length;
    if (n === 0) return { tauxRetention: null, n: 0, nRetenu: 0 };

    var nRetenu = 0;
    Object.keys(grillesSeg).forEach(function(da) {
        var ret = _retentionIndividuelle(ctx, grillesSeg[da], critere, prodIdx);
        if (ret && ret.retenu) nRetenu++;
    });

    return { tauxRetention: nRetenu / n, n: n, nRetenu: nRetenu };
}

/**
 * Catégorise un taux de rétention.
 */
function categoriserRetention(taux) {
    if (taux >= CONSOL_SEUIL_DURABLE) return 'durable';
    if (taux >= CONSOL_SEUIL_FRAGILE) return 'fragile';
    return 'non-consolide';
}

// ─── API publique — Calculs ──────────────────────────────────────────────────

/**
 * Calcule la matrice complète de consolidation pour le groupe actif.
 */
function calculerMatriceConsolidation() {
    var ctx = _chargerContexte();
    if (ctx.nombreProds === 0 || ctx.criteres.length === 0) return null;

    var matrice = [];
    for (var a = 0; a < ctx.nombreProds; a++) {
        var ligne = [];
        for (var c = 0; c < ctx.criteres.length; c++) {
            ligne.push(_calculerCellule(ctx, ctx.criteres[c], a));
        }
        matrice.push(ligne);
    }

    var pointsConsolidation = {};
    ctx.criteres.forEach(function(critere, c) {
        pointsConsolidation[critere] = null;
        for (var a = 0; a < ctx.nombreProds; a++) {
            var cell = matrice[a][c];
            if (cell.nonApplicable || cell.retentionNonMesurable) continue;
            if (cell.nMaitrise > 0 && cell.tauxRetention >= CONSOL_SEUIL_DURABLE) {
                pointsConsolidation[critere] = a;
                break;
            }
        }
    });

    return {
        matrice: matrice,
        pointsConsolidation: pointsConsolidation,
        criteres: ctx.criteres,
        nomsProductions: ctx.nomsProductions,
        nombreProds: ctx.nombreProds,
        seuilMaitrise: ctx.seuilMaitrise
    };
}

/**
 * Calcule les données de consolidation pour un étudiant individuel.
 */
function calculerConsolidationIndividuelle(da) {
    var ctx = _chargerContexte();
    if (!ctx.grilles[da]) return null;

    var grille = ctx.grilles[da];
    var pointsConsolidation = {};
    var resume = {};

    ctx.criteres.forEach(function(critere) {
        var pointTrouve = false;
        var tentativesM = 0;

        for (var a = 0; a < ctx.nombreProds; a++) {
            if (!_critereEvalue(ctx, critere, a)) continue;
            if (!grille[a] || grille[a][critere] == null) continue;

            if (grille[a][critere] >= ctx.seuilMaitrise) {
                tentativesM++;
                var ret = _retentionIndividuelle(ctx, grille, critere, a);
                if (ret && ret.retenu) {
                    pointsConsolidation[critere] = {
                        artefact: a,
                        maintenusSur: ret.maintenusSur,
                        totalSuivants: ret.totalSuivants
                    };
                    resume[critere] = {
                        type: 'consolide',
                        artefact: a,
                        artefactNom: ctx.nomsProductions[a] || ('P' + (a + 1)),
                        maintenusSur: ret.maintenusSur,
                        totalSuivants: ret.totalSuivants
                    };
                    pointTrouve = true;
                    break;
                }
            }
        }

        if (!pointTrouve) {
            pointsConsolidation[critere] = null;
            resume[critere] = tentativesM > 0
                ? { type: 'non-consolide-avec-tentatives', tentativesM: tentativesM }
                : { type: 'jamais-atteint-m' };
        }
    });

    return {
        pointsConsolidation: pointsConsolidation,
        resume: resume,
        grille: grille,
        criteres: ctx.criteres,
        nomsProductions: ctx.nomsProductions
    };
}

/**
 * Segmentation prérequis (pratique délibérée).
 * Groupe A = tous artefacts précédents complétés ; Groupe B = au moins un sauté.
 */
function calculerComparaisonPrerequis() {
    var ctx = _chargerContexte();
    var resultat = [];

    for (var a = 0; a < ctx.nombreProds; a++) {
        var ligne = [];
        for (var c = 0; c < ctx.criteres.length; c++) {
            var critere = ctx.criteres[c];

            if (!_critereEvalue(ctx, critere, a)) {
                ligne.push({ nonApplicable: true });
                continue;
            }

            var gA = {}, gB = {};
            Object.keys(ctx.grilles).forEach(function(da) {
                var gr = ctx.grilles[da];
                if (!gr[a] || gr[a][critere] == null) return;
                if (gr[a][critere] < ctx.seuilMaitrise) return;

                var tousCompletes = true;
                for (var prev = 0; prev < a; prev++) {
                    if (gr[prev] === null) { tousCompletes = false; break; }
                }
                if (tousCompletes) gA[da] = gr; else gB[da] = gr;
            });

            var cellA = _celluleSegment(ctx, gA, critere, a);
            var cellB = _celluleSegment(ctx, gB, critere, a);
            var delta = (cellA.tauxRetention != null && cellB.tauxRetention != null)
                ? cellA.tauxRetention - cellB.tauxRetention : null;

            ligne.push({
                groupeA: cellA,
                groupeB: cellB,
                delta: delta,
                avertissementPetitN: cellA.n < 5 || cellB.n < 5,
                nonApplicable: false
            });
        }
        resultat.push(ligne);
    }
    return resultat;
}

// ─── Rendu UI — Vue groupe (matrice dans Suivi > Labo) ───────────────────────

function afficherMatriceConsolidation() {
    var conteneur = document.getElementById('conteneur-matrice-consolidation');
    var synthese = document.getElementById('consolidation-synthese');
    if (!conteneur) return;

    var donnees = calculerMatriceConsolidation();
    if (!donnees || !donnees.matrice || donnees.matrice.length === 0) {
        conteneur.innerHTML = '<p class="text-muted">Aucune donn\u00e9e d\u2019\u00e9valuation disponible pour calculer la consolidation.</p>';
        if (synthese) synthese.innerHTML = '';
        return;
    }

    conteneur.innerHTML = _genererTableauMatrice(donnees, false);
    if (synthese) synthese.innerHTML = _genererLigneSynthese(donnees);
}

function togglePrerequisConsolidation() {
    var checkbox = document.getElementById('toggle-prerequis-consolidation');
    var conteneur = document.getElementById('conteneur-matrice-consolidation');
    if (!conteneur || !checkbox) return;

    if (checkbox.checked) {
        var donnees = calculerMatriceConsolidation();
        var prerequis = calculerComparaisonPrerequis();
        conteneur.innerHTML = _genererTableauMatrice(donnees, true, prerequis);
    } else {
        afficherMatriceConsolidation();
    }
}

function _genererTableauMatrice(donnees, avecPrerequis, prerequis) {
    var html = '<table class="tableau-consolidation">';

    html += '<thead><tr><th class="consol-th-artefact">Production</th>';
    donnees.criteres.forEach(function(c) {
        html += '<th class="consol-th-critere">' + echapperHtml(c) + '</th>';
    });
    html += '</tr></thead><tbody>';

    for (var a = 0; a < donnees.nombreProds; a++) {
        html += '<tr>';
        html += '<td class="consol-td-artefact"><strong>P' + (a + 1) + '</strong>';
        html += '<span class="consol-artefact-nom">' + echapperHtml(donnees.nomsProductions[a] || '') + '</span></td>';

        for (var c = 0; c < donnees.criteres.length; c++) {
            var cell = donnees.matrice[a][c];

            if (cell.nonApplicable) {
                html += '<td class="consol-cell consol-na">n/a</td>';
                continue;
            }

            if (cell.retentionNonMesurable) {
                var scorePct = Math.round((cell.scoreMoyen || 0) * 100);
                html += '<td class="consol-cell consol-non-mesurable" title="R\u00e9tention non mesurable. Score moyen du groupe affich\u00e9.">';
                html += '<span class="consol-taux">' + scorePct + ' %</span>';
                html += '<span class="consol-n">(n=' + (cell.nTotal || 0) + ')</span>';
                html += '<span class="consol-avertissement">non mesurable</span></td>';
                continue;
            }

            var taux = cell.tauxRetention || 0;
            var tauxPct = Math.round(taux * 100);
            var cat = categoriserRetention(taux);
            var titre = 'Taux de r\u00e9tention : ' + tauxPct + ' %\n' +
                (cell.nRetenu || 0) + '/' + (cell.nMaitrise || 0) +
                ' \u00e9l\u00e8ves ont retenu la ma\u00eetrise.';

            if (avecPrerequis && prerequis && prerequis[a] && !prerequis[a][c].nonApplicable) {
                var pre = prerequis[a][c];
                html += '<td class="consol-cell consol-' + cat + ' consol-split" title="' + echapperHtml(titre) + '">';
                html += '<div class="consol-split-main"><span class="consol-taux">' + tauxPct + ' %</span>';
                html += '<span class="consol-n">(n=' + cell.nMaitrise + ')</span></div>';
                html += '<div class="consol-split-detail">';
                html += _segmentHTML('A', pre.groupeA, pre.avertissementPetitN);
                html += _segmentHTML('B', pre.groupeB, pre.avertissementPetitN);
                if (pre.delta != null) {
                    var dp = Math.round(pre.delta * 100);
                    html += '<span class="consol-delta">\u0394 ' + (dp > 0 ? '+' : '') + dp + ' %</span>';
                }
                html += '</div></td>';
            } else {
                html += '<td class="consol-cell consol-' + cat + '" title="' + echapperHtml(titre) + '">';
                html += '<span class="consol-taux">' + tauxPct + ' %</span>';
                html += '<span class="consol-n">(n=' + cell.nMaitrise + ')</span></td>';
            }
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
}

function _segmentHTML(label, segment, petitN) {
    if (!segment || segment.n === 0) {
        return '<span class="consol-segment consol-segment-vide">' + echapperHtml(label) + ' : \u2014</span>';
    }
    var pct = Math.round((segment.tauxRetention || 0) * 100);
    var cls = petitN ? ' consol-petit-n' : '';
    var warn = (petitN && segment.n < 5) ? ' \u26A0' : '';
    return '<span class="consol-segment' + cls + '">' + echapperHtml(label) + ' : ' + pct + ' % (n=' + segment.n + ')' + warn + '</span>';
}

function _genererLigneSynthese(donnees) {
    var html = '<div class="consol-synthese"><strong>Point de consolidation :</strong> ';
    var parties = [];
    donnees.criteres.forEach(function(c) {
        var pt = donnees.pointsConsolidation[c];
        if (pt != null) {
            parties.push('<span class="consol-synthese-item consol-synthese-ok"><strong>' +
                echapperHtml(c) + '</strong> : P' + (pt + 1) +
                ' (' + echapperHtml(donnees.nomsProductions[pt] || '') + ')</span>');
        } else {
            parties.push('<span class="consol-synthese-item consol-synthese-nc"><strong>' +
                echapperHtml(c) + '</strong> : non consolid\u00e9</span>');
        }
    });
    html += parties.join('<span class="consol-synthese-sep"> \u00b7 </span>');
    html += '</div>';
    return html;
}

