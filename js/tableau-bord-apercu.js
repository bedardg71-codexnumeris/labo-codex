/* ===============================
   MODULE: TABLEAU DE BORD - APERÇU
   Calculs des indices A-C-P et affichage des métriques globales
   =============================== */

(function() {
'use strict';

/**
 * MODULE: tableau-bord-apercu.js
 *
 * RÔLE:
 * Calcule et affiche les statistiques pédagogiques du tableau de bord
 * - Métriques globales du groupe (indices A-C-P)
 * - Distribution des niveaux d'engagement
 * - Alertes prioritaires (étudiants à engagement insuffisant)
 *
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique pour compenser décroissance multiplicative)
 *
 * DÉPENDANCES:
 * - LocalStorage: groupeEtudiants, presences, evaluationsSauvegardees
 * - Modules: 09-2-saisie-presences.js (pour calculs assiduité)
 */

/* ===============================
   🎯 SUIVI D'ÉTUDIANTS (tracking)
   =============================== */

const COULEURS_SUIVI = ['#5e9fd0', '#8b6cc4', '#4db89a', '#4ab8d4', '#6a8fc0'];
const MAX_ETUDIANTS_SUIVIS = 5;
const CLE_SUIVI = 'etudiantsSuivis';

let _etudiantsPrioritaires = [];
let _tousEtudiantsEnrichis = []; // Tous les étudiants avec indices calculés
let _filtresActifs = []; // Filtres toggle : 'P', 'M', 'blocage', 'rai'

function obtenirEtudiantsSuivis() {
    return db.getSync(CLE_SUIVI, []);
}

function sauvegarderEtudiantsSuivis(liste) {
    db.setSync(CLE_SUIVI, liste);
}

/** Nettoie la liste en retirant les DAs absents du groupe actif */
function nettoyerEtudiantsSuivis() {
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif() : [];
    const dasActifs = new Set(etudiants.map(e => e.da));
    const liste = obtenirEtudiantsSuivis();
    const filtre = liste.filter(s => dasActifs.has(s.da));
    if (filtre.length !== liste.length) {
        sauvegarderEtudiantsSuivis(filtre);
    }
    return filtre;
}

function ajouterEtudiantSuivi(da) {
    const liste = nettoyerEtudiantsSuivis();
    if (liste.length >= MAX_ETUDIANTS_SUIVIS) return false;
    if (liste.some(s => s.da === da)) return false;
    // Trouver le premier index libre (0-4)
    const indicesUtilises = new Set(liste.map(s => s.couleurIndex));
    let couleurIndex = 0;
    for (let i = 0; i < MAX_ETUDIANTS_SUIVIS; i++) {
        if (!indicesUtilises.has(i)) { couleurIndex = i; break; }
    }
    liste.push({ da, couleurIndex });
    sauvegarderEtudiantsSuivis(liste);
    return true;
}

function retirerEtudiantSuivi(da) {
    const liste = obtenirEtudiantsSuivis().filter(s => s.da !== da);
    sauvegarderEtudiantsSuivis(liste);
}

function appliquerCouleursEtudiantsSuivis() {
    // Retirer toutes les classes tracked existantes
    for (let i = 0; i < MAX_ETUDIANTS_SUIVIS; i++) {
        document.querySelectorAll('.barre-etudiant.tracked-' + i).forEach(el => {
            el.classList.remove('tracked-' + i);
        });
    }
    // Appliquer les couleurs pour chaque étudiant suivi
    const suivis = obtenirEtudiantsSuivis();
    suivis.forEach(s => {
        document.querySelectorAll('.barre-etudiant[data-da="' + s.da + '"]').forEach(el => {
            el.classList.add('tracked-' + s.couleurIndex);
        });
    });
}

/* ===============================
   🚨 ÉTUDIANTS PRIORITAIRES (automatique)
   =============================== */

/**
 * Calcule les indices enrichis pour TOUS les étudiants actifs.
 * Stocke dans _tousEtudiantsEnrichis (données brutes) et
 * applique les filtres actifs pour produire _etudiantsPrioritaires.
 */
function calculerEtudiantsPrioritaires() {
    _tousEtudiantsEnrichis = [];
    _etudiantsPrioritaires = [];
    if (typeof obtenirEtudiantsCoursActif !== 'function') return _etudiantsPrioritaires;
    if (typeof calculerTousLesIndices !== 'function') return _etudiantsPrioritaires;

    var etudiants = obtenirEtudiantsCoursActif();
    var actifs = etudiants.filter(function(e) { return !estEtudiantExclu(e); });

    actifs.forEach(function(e) {
        var indices = calculerTousLesIndices(e.da);
        var rai = typeof determinerNiveauRaiPedagogique === 'function'
            ? determinerNiveauRaiPedagogique(e.da) : { niveau: 0, pattern: '' };

        // Indice de blocage (SRPNF)
        var blocageScore = null;
        if (typeof calculerMoyennesCriteres === 'function' && typeof calculerIndiceBlocage === 'function') {
            var moyennes = calculerMoyennesCriteres(e.da);
            var blocage = calculerIndiceBlocage(moyennes);
            if (blocage) blocageScore = blocage.score;
        }

        var M = Math.round((indices.A + indices.C) / 2);
        _tousEtudiantsEnrichis.push({
            da: e.da,
            nom: e.nom,
            prenom: e.prenom,
            pattern: rai.pattern,
            niveau: rai.niveau,
            A: indices.A,
            C: indices.C,
            P: indices.P,
            M: M,
            blocageScore: blocageScore
        });
    });

    appliquerFiltres();
    return _etudiantsPrioritaires;
}

/**
 * Applique les filtres actifs (_filtresActifs) sur _tousEtudiantsEnrichis
 * et stocke le résultat filtré+trié dans _etudiantsPrioritaires.
 */
function appliquerFiltres() {
    if (_filtresActifs.length === 0) {
        // Pas de filtre → tous les étudiants, tri alphabétique
        _etudiantsPrioritaires = _tousEtudiantsEnrichis.slice();
        _etudiantsPrioritaires.sort(function(a, b) {
            return (a.nom || '').localeCompare(b.nom || '');
        });
        return;
    }

    // Intersection (AND) : chaque filtre doit matcher
    _etudiantsPrioritaires = _tousEtudiantsEnrichis.filter(function(e) {
        for (var i = 0; i < _filtresActifs.length; i++) {
            switch (_filtresActifs[i]) {
                case 'P':
                    if (e.P >= 65) return false;
                    break;
                case 'M':
                    if (e.M >= 65) return false;
                    break;
                case 'blocage':
                    if (e.blocageScore === null || e.blocageScore >= 0.60) return false;
                    break;
                case 'rai':
                    if (e.niveau < 2) return false;
                    break;
            }
        }
        return true;
    });

    // Tri par pire métrique parmi les filtres actifs
    _etudiantsPrioritaires.sort(function(a, b) {
        // Calculer un score d'urgence (plus élevé = plus urgent)
        function urgence(e) {
            var score = 0;
            for (var i = 0; i < _filtresActifs.length; i++) {
                switch (_filtresActifs[i]) {
                    case 'P': score += Math.max(0, 65 - e.P); break;
                    case 'M': score += Math.max(0, 65 - e.M); break;
                    case 'blocage': score += e.blocageScore !== null ? Math.max(0, (0.60 - e.blocageScore) * 100) : 0; break;
                    case 'rai': score += e.niveau * 20; break;
                }
            }
            return score;
        }
        var diff = urgence(b) - urgence(a);
        if (diff !== 0) return diff;
        return (a.nom || '').localeCompare(b.nom || '');
    });
}

/** Compat : ancien nom utilisé par appliquerCouleursPrioritaires */
function trierEtudiantsPrioritaires() {
    appliquerFiltres();
}

function appliquerCouleursPrioritaires() {
    // Retirer toutes les classes prioritaire existantes
    document.querySelectorAll('.barre-etudiant.prioritaire').forEach(function(el) {
        el.classList.remove('prioritaire');
    });

    var btn = document.getElementById('btn-toggle-panneau-prioritaire');
    if (!btn || !btn.classList.contains('actif')) return;
    // Pas de filtre actif → pas de points corail sur les barres
    if (_filtresActifs.length === 0) return;

    _etudiantsPrioritaires.forEach(function(ep) {
        document.querySelectorAll('.barre-etudiant[data-da="' + ep.da + '"]').forEach(function(el) {
            el.classList.add('prioritaire');
        });
    });
}

/** Legacy — le panneau prioritaire séparé est remplacé par le panneau suivi unifié */
function genererPanneauPrioritaire() {
    genererPanneauSuiviEtudiants();
}

function genererPanneauSuiviEtudiants() {
    const conteneur = document.getElementById('liste-etudiants-suivi');
    const compteur = document.getElementById('compteur-suivi');
    const panneau = document.getElementById('panneau-suivi-etudiants');
    if (!conteneur) return;

    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif() : [];
    const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));
    const suivis = nettoyerEtudiantsSuivis();
    const modeActif = db.getSync('modeApplication', 'normal');

    // Mode Détails actif ?
    const btnPrio = document.getElementById('btn-toggle-panneau-prioritaire');
    const filtrePrio = btnPrio && btnPrio.classList.contains('actif');

    if (panneau) panneau.classList.toggle('filtre-prioritaire', filtrePrio);

    // S'assurer que les données enrichies sont calculées
    if (filtrePrio && _tousEtudiantsEnrichis.length === 0) {
        calculerEtudiantsPrioritaires();
    }

    // Map pour lookup rapide (tous les enrichis, pas seulement filtrés)
    var mapEnrichi = {};
    _tousEtudiantsEnrichis.forEach(function(ep) { mapEnrichi[ep.da] = ep; });

    // Map des filtrés (résultat après filtres actifs)
    var mapFiltre = {};
    _etudiantsPrioritaires.forEach(function(ep) { mapFiltre[ep.da] = ep; });

    if (compteur) compteur.textContent = '(' + suivis.length + '/' + MAX_ETUDIANTS_SUIVIS + ')';

    // Zone de filtres (visible uniquement en mode Détails)
    var zoneTri = document.getElementById('suivi-tri-boutons');
    if (zoneTri) {
        if (filtrePrio) {
            var filtres = [
                { id: 'alpha', label: 'A→Z' },
                { id: 'P', label: 'P < 65%' },
                { id: 'M', label: 'A+C < 65%' },
                { id: 'blocage', label: 'Blocage' },
                { id: 'rai', label: 'RàI 2-3' }
            ];
            var nbFiltres = _etudiantsPrioritaires.length;
            var nbTotal = _tousEtudiantsEnrichis.length;
            zoneTri.innerHTML = '<span class="u-texte-petit" style="color: var(--gris-moyen); margin-right: 4px;">Filtrer :</span>'
                + filtres.map(function(f) {
                    var estActif = f.id === 'alpha'
                        ? _filtresActifs.length === 0
                        : _filtresActifs.indexOf(f.id) >= 0;
                    var cls = 'prioritaire-tri-btn' + (estActif ? ' prioritaire-tri-actif' : '');
                    return '<button class="' + cls + '" data-tri="' + f.id + '">' + f.label + '</button>';
                }).join('')
                + (_filtresActifs.length > 0
                    ? '<span class="u-texte-petit" style="color: var(--gris-moyen); margin-left: 8px;">' + nbFiltres + '/' + nbTotal + '</span>'
                    : '');
            zoneTri.style.display = '';
        } else {
            zoneTri.innerHTML = '';
            zoneTri.style.display = 'none';
        }
    }

    // Construire la liste
    var liste = [...etudiantsActifs];

    if (filtrePrio) {
        // Utiliser l'ordre de _etudiantsPrioritaires (déjà trié par appliquerFiltres)
        var ordrePrio = {};
        _etudiantsPrioritaires.forEach(function(ep, i) { ordrePrio[ep.da] = i; });

        liste.sort(function(a, b) {
            var aFiltre = ordrePrio[a.da] !== undefined;
            var bFiltre = ordrePrio[b.da] !== undefined;

            // Filtrés (visibles avec badges) en premier
            if (aFiltre && !bFiltre) return -1;
            if (!aFiltre && bFiltre) return 1;

            // Parmi les filtrés, garder l'ordre de _etudiantsPrioritaires
            if (aFiltre && bFiltre) return ordrePrio[a.da] - ordrePrio[b.da];

            // Parmi les non-filtrés, alphabétique
            return (a.nom || '').localeCompare(b.nom || '');
        });
    } else {
        liste.sort(function(a, b) {
            var aSuivi = suivis.some(function(s) { return s.da === a.da; });
            var bSuivi = suivis.some(function(s) { return s.da === b.da; });
            if (aSuivi && !bSuivi) return -1;
            if (!aSuivi && bSuivi) return 1;
            return (a.nom || '').localeCompare(b.nom || '');
        });
    }

    conteneur.innerHTML = liste.map(function(e) {
        var suivi = suivis.find(function(s) { return s.da === e.da; });
        var estSuivi = !!suivi;
        var enrichi = mapEnrichi[e.da];
        var estFiltre = !!mapFiltre[e.da];

        var nomAffiche;
        if (modeActif === 'anonymisation') {
            if (e.prenom && e.prenom.startsWith('Élève')) {
                nomAffiche = e.prenom;
            } else {
                nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
            }
        } else {
            nomAffiche = e.nom + ', ' + e.prenom;
        }

        var classeActif = estSuivi ? ' actif-' + suivi.couleurIndex : '';
        var classePrioritaire = (estFiltre && _filtresActifs.length > 0) ? ' suivi-est-prioritaire' : '';

        // Pastille : couleur tracked OU corail (filtré) OU rien
        var pastille = '';
        if (estSuivi) {
            pastille = '<span class="pastille-couleur-suivi" style="background: ' + COULEURS_SUIVI[suivi.couleurIndex] + ';"></span>';
        } else if (estFiltre && filtrePrio && _filtresActifs.length > 0) {
            pastille = '<span class="pastille-prioritaire"></span>';
        }

        // Badges A/C/P pour tous les étudiants en mode détails
        var badges = '';
        if (filtrePrio && enrichi) {
            badges = '<span class="etudiant-prioritaire-indices">'
                + _badgeIndiceSuivi('A', enrichi.A) + _badgeIndiceSuivi('C', enrichi.C) + _badgeIndiceSuivi('P', enrichi.P)
                + '</span>';
        }

        var nomSafe = typeof echapperHtml === 'function' ? echapperHtml(nomAffiche) : nomAffiche;

        return '<div class="etudiant-suivi-item' + classeActif + classePrioritaire + '" data-da="' + e.da + '">'
            + pastille + '<span>' + nomSafe + '</span>'
            + badges
            + '</div>';
    }).join('');
}

/** Helper badge pour le panneau suivi unifié */
function _badgeIndiceSuivi(label, valeur) {
    var cls = 'prioritaire-indice';
    if (valeur < 65) cls += ' prioritaire-indice-critique';
    else if (valeur < 75) cls += ' prioritaire-indice-attention';
    return '<span class="' + cls + '">' + label + ' ' + valeur + '%</span>';
}

/* ===============================
   🔧 FONCTIONS HELPERS
   =============================== */

// calculerCorrelationPearson → déplacé dans indices.js (#206)

/**
 * 🆕 BETA 96: Met à jour les lignes de contexte dans les en-têtes des sections
 * Affiche: Trimestre | Cours | Badge nombre de personnes (aligné à droite)
 * @param {number} nbEtudiants - Nombre d'étudiants actifs
 */
function mettreAJourContextesSections(nbEtudiants) {
    // Récupérer le trimestre actif via la fonction globale
    let nomTrimestre = '';
    if (typeof obtenirTrimestreActif === 'function') {
        const trimestre = obtenirTrimestreActif();
        if (trimestre) {
            const sessionLower = trimestre.session?.toLowerCase();
            if (sessionLower === 'd') {
                nomTrimestre = 'Données de démonstration';
            } else {
                const sessionNom = {
                    'hiver': 'Hiver',
                    'automne': 'Automne',
                    'ete': 'Été',
                    'h': 'Hiver',
                    'a': 'Automne',
                    'e': 'Été'
                }[sessionLower] || trimestre.session || '';
                nomTrimestre = `${sessionNom} ${trimestre.annee || ''}`.trim();
            }
        }
    }
    // Fallback sur window.trimestreActif si fonction non disponible
    if (!nomTrimestre && window.trimestreActif) {
        const id = window.trimestreActif;
        const session = id.charAt(0).toLowerCase();
        const annee = id.substring(1);
        const sessionNom = { 'h': 'Hiver', 'a': 'Automne', 'e': 'Été' }[session] || '';
        nomTrimestre = `${sessionNom} ${annee}`.trim();
    }

    // Récupérer le cours actif depuis infoCours (source fiable avec sigle/codeCours)
    const infoCours = db.getSync('infoCours', null);
    let nomCours = '';

    if (infoCours) {
        // infoCours contient directement sigle/codeCours et groupe
        // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
        const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
        const groupe = infoCours.groupe || '';

        if (sigle && groupe) {
            // 🆕 BETA 96.1: Anonymiser le groupe en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            const groupeAffiche = (modeActif === 'anonymisation' && typeof anonymiserGroupe === 'function')
                ? anonymiserGroupe(groupe)
                : `gr. ${groupe}`;
            nomCours = `${sigle} ${groupeAffiche}`;
        } else if (sigle) {
            nomCours = sigle;
        }
    }

    // Formater le badge
    const badgeTexte = nbEtudiants + ' personne' + (nbEtudiants > 1 ? 's' : '');

    // Générer le HTML du contexte (aligné à droite via margin-left: auto)
    const contexteHTML = `
        <span class="contexte-trimestre">${nomTrimestre || '—'}</span>
        <span class="contexte-separateur">|</span>
        <span class="contexte-cours">${nomCours || '—'}</span>
        <span class="contexte-separateur">|</span>
        <span class="contexte-badge">${badgeTexte}</span>
    `;

    // Mettre à jour les 6 sections
    const idsContexte = [
        'contexte-indicateurs-acpe',
        'contexte-indicateurs-apprentissage',
        'contexte-evolution-temporelle',
        'contexte-trajectoire-apprentissage',
        'contexte-correlations',
        'contexte-impact-jetons'
    ];

    // Vérifier la préférence d'affichage
    let afficherContexte = true;
    try {
        const prefs = db.getSync('preferencesAffichage') || {};
        afficherContexte = prefs.afficherContexteGraphiques !== false;
    } catch (e) { console.warn('[TDB-Apercu] preferencesAffichage read fallback (default: true):', e.message || e); }

    idsContexte.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.innerHTML = afficherContexte ? contexteHTML : '';
        }
    });

}

/**
 * 🆕 BETA 96: Génère un SVG de courbe de Gauss pour superposer sur une barre de progression
 * La barre affiche 30-100%, donc on mappe les valeurs sur cet intervalle
 * @param {Array<number>} valeurs - Valeurs des étudiants (0-1 décimal)
 * @param {number} hauteur - Hauteur du SVG en pixels
 * @returns {string} - Code SVG de la courbe ou chaîne vide si données insuffisantes
 */
function genererSvgGauss(valeurs, hauteur = 55) {
    if (!valeurs || valeurs.length < 3) {
        return ''; // Pas assez de données pour une distribution
    }

    // Calculer moyenne et écart-type
    const n = valeurs.length;
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / n;
    const variance = valeurs.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / n;
    const ecartType = Math.sqrt(variance);

    // Si écart-type trop petit, pas de courbe visible
    if (ecartType < 0.01) {
        return '';
    }

    // Mapper 30-100% sur 0-100% de la barre (comme dans genererBarreDistribution)
    // position = (valeur - 0.30) / 0.70 * 100
    const mapperPosition = (val) => Math.max(0, Math.min((val - 0.30) / 0.70 * 100, 100));

    const muPos = mapperPosition(moyenne);
    const sigma1MoinsPos = mapperPosition(moyenne - ecartType);
    const sigma1PlusPos = mapperPosition(moyenne + ecartType);

    // Générer les points de la courbe de Gauss
    // On génère de 0 à 100% de la barre
    const points = [];
    const nbPoints = 50;

    for (let i = 0; i <= nbPoints; i++) {
        const xPct = (i / nbPoints) * 100; // 0-100%
        // Reconvertir en valeur 0-1 pour calculer y
        const valeur = 0.30 + (xPct / 100) * 0.70; // 0.30 à 1.0

        // Calculer y selon la formule de Gauss (normalisée)
        const exposant = -0.5 * Math.pow((valeur - moyenne) / ecartType, 2);
        const yNorm = Math.exp(exposant);

        // Mapper y sur la hauteur (inversé car SVG y=0 est en haut)
        const yPx = hauteur - (yNorm * hauteur * 0.85); // 85% de la hauteur max

        points.push(`${xPct},${yPx}`);
    }

    // Créer le path SVG (courbe + fermeture en bas)
    const pathD = `M ${points[0]} L ${points.join(' L ')} L 100,${hauteur} L 0,${hauteur} Z`;

    // Statistiques pour affichage
    const dans1Sigma = valeurs.filter(v => v >= moyenne - ecartType && v <= moyenne + ecartType).length;
    const pct1Sigma = Math.round((dans1Sigma / n) * 100);

    return `
        <svg class="barre-gauss-svg" viewBox="0 0 100 ${hauteur}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="gaussGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.6)"/>
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0.1)"/>
                </linearGradient>
            </defs>
            <!-- Courbe de Gauss -->
            <path d="${pathD}" fill="url(#gaussGradient)" stroke="rgba(255,255,255,0.7)" stroke-width="0.5"/>
            <!-- Ligne μ (moyenne) -->
            <line class="ligne-mu" x1="${muPos}" y1="0" x2="${muPos}" y2="${hauteur}" />
            <!-- Lignes ±σ -->
            ${sigma1MoinsPos > 0 ? `<line class="ligne-sigma" x1="${sigma1MoinsPos}" y1="0" x2="${sigma1MoinsPos}" y2="${hauteur}" />` : ''}
            ${sigma1PlusPos < 100 ? `<line class="ligne-sigma" x1="${sigma1PlusPos}" y1="0" x2="${sigma1PlusPos}" y2="${hauteur}" />` : ''}
        </svg>
        <div style="position: absolute; bottom: -18px; left: ${muPos}%; transform: translateX(-50%); font-size: 0.7rem; color: var(--gris-moyen); white-space: nowrap;">
            μ=${Math.round(moyenne * 100)}% | ±1σ: ${dans1Sigma}/${n} (${pct1Sigma}%)
        </div>
    `;
}

/**
 * 🆕 BETA 91: Génère un diagnostic basique basé sur la note de passage (60%)
 * Utilisé quand SOLO et RàI sont désactivés
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] étudiants avec leur performance
 * @returns {string} - Message de diagnostic basique
 */
function genererDiagnosticNotePassage(etudiants) {
    if (!etudiants || etudiants.length === 0) {
        return '';
    }

    const notePassage = 0.60; // 60%
    const total = etudiants.length;

    const enReussite = etudiants.filter(e => e.valeur >= notePassage).length;
    const enDifficulte = total - enReussite;

    const pctReussite = Math.round((enReussite / total) * 100);
    const pctDifficulte = Math.round((enDifficulte / total) * 100);

    const messages = [];

    if (enReussite > 0) {
        messages.push(`${enReussite} étudiants (${pctReussite}%) ont une performance égale ou supérieure à la note de passage (60%)`);
    }

    if (enDifficulte > 0) {
        messages.push(`${enDifficulte} étudiants (${pctDifficulte}%) sont en difficulté avec une performance inférieure à 60%`);
    }

    return messages.length > 0 ? messages.join('. ') + '.' : '';
}

/**
 * 🆕 BETA 91: Génère une interprétation pédagogique de la performance du groupe
 * Analyse les niveaux IDME et les patterns pour identifier progression et difficultés
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] étudiants avec leur performance
 * @param {Object} echelle - Échelle IDME active
 * @returns {string} - Message d'interprétation pédagogique
 */
function genererInterpretationPerformance(etudiants, echelle) {
    if (!etudiants || etudiants.length === 0 || !echelle) {
        return '';
    }

    // Lire les patterns stockés
    const patterns = db.getSync('indicesPatternsRaI', {});

    // Classifier les étudiants par niveau IDME
    const niveaux = echelle.niveaux.filter(n => n.code !== '0' && n.code !== 0);
    const parNiveau = {};

    niveaux.forEach(niveau => {
        parNiveau[niveau.code] = [];
    });

    etudiants.forEach(etudiant => {
        const valeurPct = etudiant.valeur * 100;
        for (let i = niveaux.length - 1; i >= 0; i--) {
            const niveau = niveaux[i];
            const min = niveau.min || 0;
            const max = niveau.max || 100;
            if (valeurPct >= min && valeurPct <= max) {
                parNiveau[niveau.code].push(etudiant);
                break;
            }
        }
    });

    // Analyser selon les objectifs pédagogiques
    const messages = [];
    const total = etudiants.length;

    // 1. Combien ont atteint M ou E (objectif atteint)
    const niveauM = parNiveau['M'] || [];
    const niveauE = parNiveau['E'] || [];
    const objectifAtteint = niveauM.length + niveauE.length;

    if (objectifAtteint > 0) {
        const pct = Math.round((objectifAtteint / total) * 100);
        messages.push(`${objectifAtteint} étudiants (${pct}%) ont atteint ou dépassé le niveau de maîtrise`);
    }

    // 2. Parmi les D, combien en progression (pattern favorable)
    const niveauD = parNiveau['D'] || [];
    const dEnProgression = niveauD.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && (pattern.pattern === 'Stable' || pattern.niveauRai === 1);
    });

    if (dEnProgression.length > 0) {
        messages.push(`${dEnProgression.length} étudiants en Développement montrent une progression favorable et pourraient atteindre la maîtrise prochainement`);
    }

    // 3. Parmi les I, combien montrent des progrès (pattern pas blocage critique)
    const niveauI = parNiveau['I'] || [];
    const iAvecProgres = niveauI.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && pattern.pattern !== 'Blocage critique';
    });

    if (niveauI.length > 0) {
        if (iAvecProgres.length > 0) {
            messages.push(`Parmi les ${niveauI.length} étudiants en difficulté, ${iAvecProgres.length} montrent des signes de progrès`);
        } else {
            messages.push(`${niveauI.length} étudiants en difficulté nécessitent un accompagnement intensif`);
        }
    }

    // Générer le message final
    if (messages.length === 0) {
        return '';
    }

    return messages.join('. ') + '.';
}

/**
 * Calcule la distribution des étudiants selon les niveaux de l'échelle de performance
 * Lit l'échelle active depuis localStorage et compte les étudiants dans chaque plage
 * Exclut le niveau "0" (Aucun/plagiat)
 * @param {Array} etudiants - [{da, valeur: 0-1}, ...] valeurs de performance avec DA
 * @returns {string|null} - HTML compact "I : 5 • D : 8 • M : 12 • E : 3" ou null si erreur
 */
function calculerDistributionPerformance(etudiants) {
    if (!etudiants || etudiants.length === 0) {
        console.warn('📊 Distribution P : Aucun étudiant');
        return null;
    }

    // Lire l'échelle de performance active depuis localStorage
    // Essayer d'abord echellesTemplates (utilisé par echelles.js), puis echellesPerformance (fallback)
    let echelles = db.getSync('echellesTemplates', []);
    let echelleId = db.getSync('echellePerformanceActive', 'idme-5niv');


    // Trouver l'échelle active (par ID ou par défaut)
    let echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        // Fallback : chercher l'échelle par défaut
        echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
    }


    if (!echelle || !echelle.niveaux) {
        console.warn('📊 Distribution P : Échelle ou niveaux introuvables');
        return null;
    }

    // Trier les niveaux par valeur min croissante et exclure le niveau "0"
    const niveaux = echelle.niveaux
        .filter(n => n.code !== '0' && n.code !== 0) // Exclure niveau 0 (plagiat)
        .sort((a, b) => (a.min || 0) - (b.min || 0));


    if (niveaux.length === 0) {
        console.warn('📊 Distribution P : Aucun niveau après filtrage');
        return null;
    }

    // Compter les étudiants dans chaque plage
    const compteurs = {};
    niveaux.forEach(niveau => {
        compteurs[niveau.code] = 0;
    });

    etudiants.forEach(etudiant => {
        const valeurPct = etudiant.valeur * 100; // Convertir 0-1 en 0-100%

        // Trouver le niveau correspondant
        for (let i = niveaux.length - 1; i >= 0; i--) {
            const niveau = niveaux[i];
            const min = niveau.min || 0;
            const max = niveau.max || 100;

            if (valeurPct >= min && valeurPct <= max) {
                compteurs[niveau.code]++;
                break;
            }
        }
    });


    // Générer le HTML compact avec noms complets : "Incomplet : 5 • en Développement : 11 • etc."
    const parts = niveaux.map(niveau => {
        const count = compteurs[niveau.code] || 0;
        // Utiliser le nom complet du niveau au lieu du code
        return `${niveau.nom} : ${count}`;
    });

    const result = parts.join(' <span class="tb-m-horizontal-6">•</span> ');

    return result;
}

/**
 * Génère un badge HTML indiquant la pratique de notation active
 * @returns {string} - HTML du badge avec icône et texte
 */
function genererBadgePratique() {
    const config = db.getSync('modalitesEvaluation', {});
    const pratique = config.pratique || 'alternative';
    const typePAN = config.typePAN || 'maitrise';
    const affichage = config.affichageTableauBord || {};

    let texte = '';
    let couleur = '';
    let description = '';

    if (affichage.afficherSommatif && affichage.afficherAlternatif) {
        // Mode hybride
        texte = 'Mode Hybride (SOM + PAN)';
        couleur = '#9c27b0'; // Violet
        description = 'Comparaison expérimentale des deux pratiques';
    } else if (pratique === 'sommative') {
        texte = 'Sommative traditionnelle (SOM)';
        couleur = '#ff6f00'; // Orange
        description = 'Moyenne pondérée provisoire';
    } else {
        // PAN
        const typesPAN = {
            'maitrise': 'Maîtrise (IDME)',
            'specifications': 'Spécifications',
            'denotation': 'Dénotation'
        };
        texte = `Alternative - ${typesPAN[typePAN] || 'PAN'}`;
        couleur = '#0277bd'; // Bleu
        description = 'N meilleurs artefacts';
    }

    return `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
                     background: ${couleur}15; border: 1.5px solid ${couleur}; border-radius: 20px;
                     font-size: 0.85rem; font-weight: 600; color: ${couleur}; margin-left: 12px;"
              title="${description}">
            ${texte}
        </span>
    `;
}

/**
 * Génère un badge compact indiquant la source des données (SOM, PAN, ou Hybride)
 * Pour les sections du tableau de bord
 * @returns {string} - HTML du badge
 */
function genererBadgeSourceDonnees() {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSommatif = affichage.afficherSommatif === true;
    const afficherAlternatif = affichage.afficherAlternatif === true;

    let texte = '';
    let couleur = '';
    let titre = '';

    if (afficherSommatif && afficherAlternatif) {
        // Mode hybride - les cartes montrent déjà (SOM) et (PAN)
        texte = 'Hybride';
        couleur = '#9c27b0';
        titre = 'Affichage des deux pratiques';
    } else if (afficherSommatif) {
        texte = 'Source : SOM';
        couleur = '#ff6f00';
        titre = 'Données calculées selon pratique sommative';
    } else {
        texte = 'Source : PAN';
        couleur = '#0277bd';
        titre = 'Données calculées selon pratique alternative';
    }

    return `
        <span style="display: inline-block; padding: 3px 10px; background: ${couleur}15;
                     border: 1px solid ${couleur}; border-radius: 12px;
                     font-size: 0.75rem; font-weight: 700; color: ${couleur};
                     margin-left: 8px; vertical-align: middle;"
              title="${titre}">
            ${texte}
        </span>
    `;
}

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module du tableau de bord - aperçu
 * Appelée par main.js au chargement
 */
function initialiserModuleTableauBordApercu() {

    // Charger les statistiques si la sous-section aperçu est active
    const apercu = document.getElementById('tableau-bord-apercu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }

    // Événements du panneau de suivi d'étudiants (délégation pour survivre aux rebuilds innerHTML)
    document.addEventListener('click', function(ev) {
        // Toggle du panneau
        if (ev.target.closest('#btn-toggle-panneau-suivi')) {
            const panneau = document.getElementById('panneau-suivi-etudiants');
            if (panneau) {
                panneau.classList.toggle('ouvert');
                if (panneau.classList.contains('ouvert')) {
                    genererPanneauSuiviEtudiants();
                }
            }
            return;
        }
        // Clic sur les badges A/C/P → profil étudiant, section Engagement
        const badgeClic = ev.target.closest('.panneau-suivi-etudiants .etudiant-prioritaire-indices');
        if (badgeClic) {
            const itemParent = badgeClic.closest('.etudiant-suivi-item');
            if (itemParent && itemParent.dataset.da) {
                if (typeof afficherSousSection === 'function') afficherSousSection('tableau-bord-profil');
                if (typeof afficherProfilComplet === 'function') afficherProfilComplet(itemParent.dataset.da);
                // Naviguer vers la section Engagement (mobilisation) du profil
                setTimeout(function() {
                    if (typeof changerSectionProfil === 'function') changerSectionProfil('mobilisation');
                }, 100);
            }
            return;
        }
        // Clic sur un étudiant dans le panneau
        const item = ev.target.closest('.etudiant-suivi-item');
        if (item) {
            const da = item.dataset.da;
            if (!da) return;
            const suivis = obtenirEtudiantsSuivis();
            if (suivis.some(s => s.da === da)) {
                retirerEtudiantSuivi(da);
            } else {
                if (!ajouterEtudiantSuivi(da)) return;
            }
            genererPanneauSuiviEtudiants();
            appliquerCouleursEtudiantsSuivis();
            return;
        }
        // Réinitialiser
        if (ev.target.closest('#btn-reinitialiser-suivi')) {
            sauvegarderEtudiantsSuivis([]);
            genererPanneauSuiviEtudiants();
            appliquerCouleursEtudiantsSuivis();
            return;
        }
    });

    // Événements du filtre Prioritaire (unifié dans le panneau suivi)
    document.addEventListener('click', function(ev) {
        // Toggle du filtre prioritaire → ouvre/filtre le panneau suivi
        if (ev.target.closest('#btn-toggle-panneau-prioritaire')) {
            var btn = document.getElementById('btn-toggle-panneau-prioritaire');
            if (btn) btn.classList.toggle('actif');

            // Calculer les prioritaires si activé
            if (btn && btn.classList.contains('actif')) {
                calculerEtudiantsPrioritaires();
            }

            // Ouvrir le panneau suivi si pas déjà ouvert
            var panneauSuivi = document.getElementById('panneau-suivi-etudiants');
            if (panneauSuivi && btn && btn.classList.contains('actif') && !panneauSuivi.classList.contains('ouvert')) {
                panneauSuivi.classList.add('ouvert');
            }

            // Rafraîchir le panneau suivi (avec ou sans filtre)
            genererPanneauSuiviEtudiants();
            appliquerCouleursPrioritaires();
            return;
        }
        // Clic sur un bouton de filtre (toggle multi-sélection)
        var btnTri = ev.target.closest('.prioritaire-tri-btn');
        if (btnTri) {
            var filtre = btnTri.dataset.tri;
            if (filtre === 'alpha') {
                // A→Z = réinitialiser tous les filtres
                _filtresActifs = [];
            } else {
                var idx = _filtresActifs.indexOf(filtre);
                if (idx >= 0) {
                    _filtresActifs.splice(idx, 1);
                } else {
                    _filtresActifs.push(filtre);
                }
            }
            appliquerFiltres();
            genererPanneauSuiviEtudiants();
            appliquerCouleursPrioritaires();
            return;
        }
    });

    // 🆕 BETA 96.1: Gestionnaire de clic sur les points (délégation d'événement)
    document.addEventListener('click', function(e) {
        const point = e.target.closest('.barre-etudiant');

        // Supprimer l'ancienne infobulle
        const ancienneInfo = document.querySelector('.barre-etudiant-info');
        if (ancienneInfo) ancienneInfo.remove();

        if (point) {
            // Retirer la sélection précédente
            const ancienSelection = document.querySelector('.barre-etudiant.selected');
            if (ancienSelection && ancienSelection !== point) {
                ancienSelection.classList.remove('selected');
            }

            // Toggle la sélection sur le point cliqué
            if (point.classList.contains('selected')) {
                point.classList.remove('selected');
            } else {
                point.classList.add('selected');

                // Créer l'infobulle persistante
                const nom = point.dataset.nom || 'Étudiant';
                const valeur = point.dataset.valeur || '';
                const info = document.createElement('div');
                info.className = 'barre-etudiant-info';
                info.innerHTML = `<strong>${nom}</strong>${valeur ? ' : ' + valeur : ''}`;

                // Positionner au-dessus du point (position fixe)
                const rect = point.getBoundingClientRect();
                info.style.left = (rect.left + rect.width / 2) + 'px';
                info.style.top = (rect.top - 30) + 'px';
                info.style.transform = 'translateX(-50%)';
                document.body.appendChild(info);
            }

            // Surligner la badge correspondante dans le panneau
            document.querySelectorAll('.etudiant-suivi-item.surligne').forEach(el => el.classList.remove('surligne'));
            if (point.classList.contains('selected') && point.dataset.da) {
                const badge = document.querySelector('.etudiant-suivi-item[data-da="' + point.dataset.da + '"]');
                if (badge) {
                    badge.classList.add('surligne');
                    badge.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        } else {
            // Clic ailleurs : désélectionner tout
            const selection = document.querySelector('.barre-etudiant.selected');
            if (selection) {
                selection.classList.remove('selected');
            }
            document.querySelectorAll('.etudiant-suivi-item.surligne').forEach(el => el.classList.remove('surligne'));
        }
    });
}

/* ===============================
   📈 FONCTION PRINCIPALE
   =============================== */

function chargerTableauBordApercu() {

    // 🆕 FIX #220 (3 mars 2026) : Régénérer les séances complètes du groupe-cours actif
    // AVANT de calculer l'assiduité. Les seancesCompletes en cache peuvent être stale
    // (générées avec un horaire partagé au lieu de l'horaire spécifique au groupe-cours).
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes(null);
    }

    // 🔄 BETA 95.7: Calculer les indices A avant l'affichage
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    }

    // 🔄 Calculer les indices C et P (SOM + PAN) avant l'affichage
    if (typeof calculerEtStockerIndicesCP === 'function') {
        calculerEtStockerIndicesCP();
    } else {
        console.warn('⚠️ calculerEtStockerIndicesCP non disponible - Module portfolio.js non chargé ?');
    }

    // 🔄 BETA 95.7: Rafraîchir aussi la liste des étudiants pour synchronisation
    if (typeof afficherListeEtudiantsConsultation === 'function') {
        afficherListeEtudiantsConsultation();
    }

    // 🆕 BETA 91: Calculer et stocker les patterns + RàI pour tout le groupe (si RàI activé)
    const config = db.getSync('modalitesEvaluation', {});
    const raiActive = config.activerRai !== false; // Par défaut true

    if (raiActive && typeof calculerEtStockerPatternsGroupe === 'function') {
        calculerEtStockerPatternsGroupe();
    } else if (!raiActive) {
    } else {
        console.warn('⚠️ calculerEtStockerPatternsGroupe non disponible - Module profil-etudiant.js non chargé ?');
    }

    try {
        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);

        const etudiantsActifs = etudiants.filter(e => !estEtudiantExclu(e));

        // 🆕 BETA 96 : Mettre à jour les lignes de contexte dans les 4 sections
        const nbEtudiants = etudiantsActifs.length;
        mettreAJourContextesSections(nbEtudiants);

        // Ajouter les indices (structure : {sommatif: {...}, alternatif: {...}})
        const _cacheIndicesA = obtenirDonneesSelonMode('indicesAssiduite') || {};
        const _cacheIndicesCP = obtenirDonneesSelonMode('indicesCP') || {};
        const etudiantsAvecIndices = etudiantsActifs.map(etudiant => {
            const indices = calculerIndicesEtudiant(etudiant.da, _cacheIndicesA, _cacheIndicesCP);
            return {
                ...etudiant,
                ...indices  // Ajoute sommatif et alternatif
            };
        });

        // Ajouter l'indicateur de pratique ou les checkboxes selon le mode
        const titre = document.querySelector('#tableau-bord-apercu h2');
        if (titre) {
            const config = db.getSync('modalitesEvaluation', {});
            const affichage = config.affichageTableauBord || {};

            // NOUVEAU Beta 90 : Détection automatique du mode comparatif
            // Si les deux pratiques sont affichées (OU si le flag explicite est true), c'est comparatif
            const afficherSom = affichage.afficherSommatif === true;
            const afficherPan = affichage.afficherAlternatif === true;
            const modeComparatif = (afficherSom && afficherPan) || affichage.modeComparatif === true;

            titre.innerHTML = '';
            const conteneurTitre = document.createElement('div');

            // Layout uniforme : titre à gauche, badges à droite
            conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
            conteneurTitre.innerHTML = `
                <span>État des lieux</span>
                ${genererIndicateurPratiqueOuCheckboxes()}
            `;

            titre.appendChild(conteneurTitre);
        }

        // Afficher tout (sans noms d'étudiants dans l'aperçu)
        afficherMetriquesGlobales(etudiantsAvecIndices);
        afficherAlertesPrioritairesCompteurs(etudiantsAvecIndices);

        // Afficher RàI et Patterns uniquement si activé dans les réglages
        const config = db.getSync('modalitesEvaluation', {});
        const activerRai = config.activerRai !== false; // Par défaut true (rétrocompatibilité)

        if (activerRai) {
            afficherPatternsApprentissage(etudiantsAvecIndices);
            afficherNiveauxRaI(etudiantsAvecIndices);
        }

        // 🆕 BETA 98.9: Alerte nommée pour élèves en non-participation
        afficherAlerteNonParticipation(etudiantsAvecIndices);

        // 🆕 BETA 96: Afficher le graphique spaghetti ACP (évolution temporelle par étudiant)
        // ✅ CORRECTIF (2 mars 2026): Lire la valeur actuelle du dropdown au lieu de hardcoder 'A'
        if (typeof creerGraphiqueGroupeSpaghettiACP === 'function') {
            const selecteurIndice = document.getElementById('selecteur-indice-acp');
            const indiceActif = selecteurIndice ? selecteurIndice.value : 'A';
            creerGraphiqueGroupeSpaghettiACP('graphique-groupe-moyennes', indiceActif);
        } else {
            console.warn('⚠️ creerGraphiqueGroupeSpaghettiACP non disponible - Module graphiques-progression.js non chargé ?');
        }

        // 🆕 BETA 96: Afficher le graphique spaghetti (trajectoires par artefact)
        if (typeof creerGraphiqueGroupeSpaghetti === 'function') {
            creerGraphiqueGroupeSpaghetti('graphique-groupe-spaghetti');
        } else {
            console.warn('⚠️ creerGraphiqueGroupeSpaghetti non disponible - Module graphiques-progression.js non chargé ?');
        }

        // 🆕 Graphique corrélations longitudinales (dynamique des corrélations semaine par semaine)
        if (typeof creerGraphiqueCorrelationsLongitudinales === 'function') {
            creerGraphiqueCorrelationsLongitudinales('graphique-correlations-longitudinales');
        }

        // 🆕 Graphique impact des jetons sur P
        if (typeof creerGraphiqueImpactJetons === 'function') {
            creerGraphiqueImpactJetons('graphique-impact-jetons');
        }

        // 🆕 BETA 96: Distribution ACPE maintenant intégrée dans les barres de progression
        // (graphique séparé supprimé - mini-courbes Gauss dans chaque barre)


        // 🆕 BETA 91: Initialiser les événements toggle après génération du HTML
        initialiserEvenementsToggle();

        // Appliquer les couleurs des étudiants suivis après génération du HTML
        appliquerCouleursEtudiantsSuivis();

        // Calculer les étudiants prioritaires et mettre à jour le compteur
        calculerEtudiantsPrioritaires();
        appliquerCouleursPrioritaires();
        var compteurPrio = document.getElementById('compteur-prioritaire');
        if (compteurPrio) compteurPrio.textContent = '(' + _etudiantsPrioritaires.length + ')';

        // Horodatage discret en bas du tableau de bord
        const horodatage = document.getElementById('tdb-horodatage');
        if (horodatage) {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            horodatage.textContent = `Indices calculés à ${h}:${m}:${s}`;
        }

    } catch (error) {
        console.error('❌ Erreur chargement tableau de bord:', error);
    }
}

/**
 * 🆕 BETA 91: Génère une interprétation des patterns d'apprentissage du groupe
 * Ton réaliste équilibré : présente forces et défis sans jugement
 * Format : nombres absolus ET pourcentages (ex: "17 étudiants, 68%")
 * @param {Array} patterns - Distribution des patterns [{pattern, count}, ...]
 * @param {number} totalEtudiants - Nombre total d'étudiants
 * @returns {string} Message d'interprétation HTML
 */
function genererInterpretationPatterns(patterns, totalEtudiants) {
    if (!patterns || totalEtudiants === 0) return '';

    // Classifier les patterns par catégories
    const favorables = ['Progression', 'Stable', 'Excellence émergente'];
    const difficultesEmergentes = ['Blocage émergent', 'Défi spécifique'];
    const critiques = ['Blocage critique'];

    let nbFavorables = 0;
    let nbDifficultesEmergentes = 0;
    let nbCritiques = 0;

    patterns.forEach(p => {
        if (favorables.includes(p.pattern)) {
            nbFavorables += p.count;
        } else if (difficultesEmergentes.includes(p.pattern)) {
            nbDifficultesEmergentes += p.count;
        } else if (critiques.includes(p.pattern)) {
            nbCritiques += p.count;
        }
    });

    const pctFavorables = Math.round((nbFavorables / totalEtudiants) * 100);
    const pctDifficultesEmergentes = Math.round((nbDifficultesEmergentes / totalEtudiants) * 100);
    const pctCritiques = Math.round((nbCritiques / totalEtudiants) * 100);

    // Construction du message équilibré
    const messages = [];

    // 1. Trajectoires favorables
    if (nbFavorables > 0) {
        messages.push(`${nbFavorables} étudiants (${pctFavorables}%) montrent une trajectoire d'apprentissage favorable (Progression, Stable, Excellence émergente)`);
    }

    // 2. Difficultés émergentes
    if (nbDifficultesEmergentes > 0) {
        messages.push(`${nbDifficultesEmergentes} étudiants (${pctDifficultesEmergentes}%) rencontrent des difficultés émergentes et nécessitent un soutien préventif`);
    }

    // 3. Blocages critiques
    if (nbCritiques > 0) {
        messages.push(`${nbCritiques} étudiants (${pctCritiques}%) sont en blocage critique et nécessitent un accompagnement différencié immédiat`);
    }

    if (messages.length === 0) {
        return '';
    }

    return messages.join('. ') + '.';
}

/**
 * 🆕 BETA 91: Génère une interprétation du modèle RàI du groupe
 * Focus : efficacité pédagogique (taux Niveau 1 indique si enseignement universel fonctionne)
 * Format : nombres absolus ET pourcentages (ex: "17 étudiants, 68%")
 * @param {Array} rai - Distribution RàI [{niveau, count}, ...]
 * @param {number} totalEtudiants - Nombre total d'étudiants
 * @returns {string} Message d'interprétation HTML
 */
function genererInterpretationRai(rai, totalEtudiants) {
    if (!rai || totalEtudiants === 0) return '';

    let niveau1 = 0;
    let niveau2 = 0;
    let niveau3 = 0;

    rai.forEach(r => {
        if (r.niveau === 1) niveau1 = r.count;
        if (r.niveau === 2) niveau2 = r.count;
        if (r.niveau === 3) niveau3 = r.count;
    });

    const pctNiveau1 = Math.round((niveau1 / totalEtudiants) * 100);
    const pctNiveau2 = Math.round((niveau2 / totalEtudiants) * 100);
    const pctNiveau3 = Math.round((niveau3 / totalEtudiants) * 100);

    // Analyse de l'efficacité pédagogique (seuils recommandés : 70-80% N1, 15-20% N2, 5-10% N3)
    let interpretation = '';

    if (pctNiveau1 >= 70) {
        interpretation = `La répartition RàI indique une efficacité satisfaisante de l'enseignement universel (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    } else if (pctNiveau1 >= 60) {
        interpretation = `La répartition RàI indique une efficacité acceptable de l'enseignement universel (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    } else {
        interpretation = `La répartition RàI suggère que l'enseignement universel pourrait être renforcé (${niveau1} étudiants, ${pctNiveau1}% au Niveau 1). `;
    }

    // Compléter avec Niveau 2 et 3
    if (niveau2 > 0) {
        interpretation += `${niveau2} étudiants (${pctNiveau2}%) nécessitent des interventions préventives ciblées. `;
    }

    if (niveau3 > 0) {
        interpretation += `${niveau3} étudiants (${pctNiveau3}%) requièrent un accompagnement intensif individualisé.`;
    }

    return interpretation;
}

/**
 * 🆕 BETA 91: Attache les événements de toggle pour les notes explicatives
 * Gère le clic sur les emojis 📐 pour afficher/masquer les cartes d'information
 * Utilise la classe CSS .ouvert pour l'animation de rotation (180deg)
 */
function initialiserEvenementsToggle() {
    document.querySelectorAll('.emoji-toggle').forEach(toggle => {
        // Retirer les anciens événements pour éviter les doublons
        const nouveauToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(nouveauToggle, toggle);

        // Attacher le nouvel événement
        nouveauToggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const isVisible = !targetElement.classList.contains('u-hide');
                toggleDisplay(targetElement, !isVisible);

                // 🎨 Animation de rotation via classe CSS (transition gérée par styles.css)
                if (isVisible) {
                    this.classList.remove('ouvert');
                } else {
                    this.classList.add('ouvert');
                }
            } else {
                console.warn('⚠️ Élément cible introuvable:', targetId);
            }
        });
    });

}

/**
 * Génère soit un badge de pratique simple, soit les checkboxes selon le mode
 * @returns {string} HTML du badge ou des checkboxes
 */
function genererIndicateurPratiqueOuCheckboxes() {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // NOUVEAU Beta 90 : Détection automatique du mode comparatif
    // Si les deux pratiques sont affichées, c'est le mode comparatif
    const modeComparatif = afficherSom && afficherPan;

    // MODE COMPARATIF: Afficher deux badges informatifs côte à côte
    // (similaires aux badges utilisés dans le profil étudiant)
    if (modeComparatif) {
        return `
            <div style="display: flex; gap: 10px; align-items: center;">
                ${genererBadgePratique('SOM', true)}
                ${genererBadgePratique('PAN', true)}
            </div>
        `;
    }

    // MODE NORMAL: Pas de badge (info déjà dans l'en-tête)
    return '';
}


// calculerIndicesEtudiant, calculerEngagement, determinerNiveauEngagement → déplacés dans indices.js (#206)

/* ===============================
   AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Affiche les métriques globales du groupe avec barres de distribution
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};

    // 🆕 BETA 95.7: Valeurs par défaut si aucun mode n'est configuré
    // Par défaut, afficher PAN (pratique alternative/standards)
    let afficherSom = affichage.afficherSommatif === true;
    let afficherPan = affichage.afficherAlternatif === true;

    // Si aucun mode n'est configuré, activer PAN par défaut
    if (!afficherSom && !afficherPan) {
        afficherPan = true;
    }

    // 🆕 BETA 95.7 (22 jan) : Calculer "en attente" au niveau du GROUPE
    // Compter les données disponibles pour le groupe entier :
    // - Séances = dates distinctes où des présences ont été saisies
    // - Évaluations = productions distinctes évaluées

    // Compter le nombre de séances du groupe (dates distinctes avec présences)
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];
    const datesSeances = [...new Set(presences.filter(p => !p.facultatif).map(p => p.date))];
    const nbSeancesGroupe = datesSeances.length;

    // Compter le nombre d'évaluations du groupe (productions distinctes évaluées)
    let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    if (!Array.isArray(evaluations)) evaluations = [];
    const productionsDistinctes = [...new Set(evaluations.map(e => e.productionId || e.artefactId))];
    const nbEvaluationsGroupe = productionsDistinctes.length;

    // Seuils minimaux par indice
    // - A : 1 séance suffit
    // - C : 1 évaluation suffit
    // - P et E : configurable via "Nb minimal d'évaluations pour calculer P et E" (minimumCompletion)
    const seuilA = 1;
    const seuilC = 1;

    // Lire le seuil P depuis la configuration de la pratique active
    // Ordre de priorité : pratique active > modalitesEvaluation > défaut (3)
    let seuilP = 3; // Défaut
    let seuilTrouve = false;
    const groupesCours = obtenirDonneesSelonMode('groupesCours') || [];
    const groupeActif = groupesCours.find(gc => gc.actif);


    // 1. Chercher dans la configuration de la pratique active
    if (groupeActif && groupeActif.pratiqueId) {
        // 1a. Chercher dans pratiquesConfigurables
        const pratiquesConfig = db.getSync('pratiquesConfigurables', []);
        let pratiqueActive = pratiquesConfig.find(p => p.id === groupeActif.pratiqueId);

        // 1b. Si pas trouvée, chercher dans la bibliothèque partagée
        if (!pratiqueActive) {
            const bibliotheque = db.getSync('bibliotheque-pratiques', []);
            pratiqueActive = bibliotheque.find(p => p.id === groupeActif.pratiqueId);
            if (pratiqueActive) {
            }
        }

        if (pratiqueActive) {
            // Chercher minimumCompletion dans différents chemins possibles
            const minComp = pratiqueActive.configuration?.portfolio?.minimumCompletion
                || pratiqueActive.portfolio?.minimumCompletion
                || pratiqueActive.regles?.minimumCompletion;

            if (minComp !== undefined) {
                seuilP = minComp;
                seuilTrouve = true;
            } else {
            }
        } else {
        }
    }

    // 2. Sinon, chercher dans modalitesEvaluation (ancienne config ou fallback)
    if (!seuilTrouve) {
        const configPortfolio = config.configPAN?.portfolio || config.portfolio || {};
        if (configPortfolio.minimumCompletion !== undefined) {
            seuilP = configPortfolio.minimumCompletion;
            seuilTrouve = true;
        }
    }


    // Calculer ce qui manque (0 si le seuil est atteint)
    const seancesManquantesA = Math.max(0, seuilA - nbSeancesGroupe);
    const evalsManquantesC = Math.max(0, seuilC - nbEvaluationsGroupe);
    const evalsManquantesP = Math.max(0, seuilP - nbEvaluationsGroupe);

    // Pour E : besoin des deux (séances ET évaluations pour P)
    const seancesManquantesE = seancesManquantesA;
    const evalsManquantesE = evalsManquantesP;

    // Générer les textes explicites "en attente"
    const texteAttenteA = seancesManquantesA > 0
        ? `${seancesManquantesA} séance${seancesManquantesA > 1 ? 's' : ''} en attente` : '';
    const texteAttenteC = evalsManquantesC > 0
        ? `${evalsManquantesC} évaluation${evalsManquantesC > 1 ? 's' : ''} en attente` : '';
    const texteAttenteP = evalsManquantesP > 0
        ? `${evalsManquantesP} évaluation${evalsManquantesP > 1 ? 's' : ''} en attente` : '';

    // Pour E : combiner les deux manques si nécessaire
    let texteAttenteE = '';
    if (seancesManquantesE > 0 && evalsManquantesE > 0) {
        texteAttenteE = `${seancesManquantesE} séance${seancesManquantesE > 1 ? 's' : ''} + ${evalsManquantesE} éval. en attente`;
    } else if (seancesManquantesE > 0) {
        texteAttenteE = `${seancesManquantesE} séance${seancesManquantesE > 1 ? 's' : ''} en attente`;
    } else if (evalsManquantesE > 0) {
        texteAttenteE = `${evalsManquantesE} évaluation${evalsManquantesE > 1 ? 's' : ''} en attente`;
    }


    // Debug: Vérifier les indices A des étudiants
    const indicesADebug = obtenirDonneesSelonMode('indicesAssiduite') || {};
    if (Object.keys(indicesADebug.alternatif || {}).length > 0) {
        const premierDA = Object.keys(indicesADebug.alternatif)[0];
    }

    // 🆕 BETA 95.7 (22 jan): Filtrage spécifique pour A (présences saisies, même si A=0%)
    // Pour A: inclure TOUS les étudiants avec nombreSeances > 0 (y compris les absents à 0%)
    const etudiantsAvecPresencesSOM = etudiants.filter(e => e.sommatif && e.sommatif.nombreSeances > 0);
    const etudiantsAvecPresencesPAN = etudiants.filter(e => e.alternatif && e.alternatif.nombreSeances > 0);

    // 🆕 BETA 96.1: Pour P, exiger des évaluations réelles (pas seulement des présences)
    const etudiantsAvecEvalsSOM = etudiants.filter(e =>
        e.sommatif.completion > 0 || e.sommatif.performance > 0
    );
    const etudiantsAvecEvalsPAN = etudiants.filter(e =>
        e.alternatif.completion > 0 || e.alternatif.performance > 0
    );

    // 🔧 FIX (23 fév 2026) : Pour C, inclure TOUS les étudiants dès qu'il y a des productions évaluées
    // Un étudiant à C=0% (n'a pas remis) est une information utile, pas une absence de données.
    // Ex: 23 évalués sur 25 → moyenne doit être 92%, pas 100%
    const ilYaDesEvalsSOM = etudiantsAvecEvalsSOM.length > 0;
    const ilYaDesEvalsPAN = etudiantsAvecEvalsPAN.length > 0;
    const etudiantsPourC_SOM = ilYaDesEvalsSOM ? etudiants : [];
    const etudiantsPourC_PAN = ilYaDesEvalsPAN ? etudiants : [];

    // Pour E: nécessite A ET (C ou P) pour être significatif
    // 🔧 FIX (23 fév 2026) : Inclure aussi les étudiants à C=0 quand des évals existent
    const etudiantsAvecDonneesSOM = etudiants.filter(e =>
        e.sommatif.nombreSeances > 0 && (ilYaDesEvalsSOM || e.sommatif.completion > 0 || e.sommatif.performance > 0)
    );
    const etudiantsAvecDonneesPAN = etudiants.filter(e =>
        e.alternatif.nombreSeances > 0 && (ilYaDesEvalsPAN || e.alternatif.completion > 0 || e.alternatif.performance > 0)
    );


    // 🆕 BETA 95.7: Préparer les données A avec TOUS les étudiants ayant des présences (y compris 0%)
    // IMPORTANT: Pour A (assiduité), toujours utiliser le calcul SOMMATIF (fait observable)
    // car A est indépendant de la pratique de notation (SOM ou PAN)
    const etudiantsSOM_A = etudiantsAvecPresencesSOM.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.assiduite
    }));

    // Pour PAN, utiliser aussi le calcul sommatif pour A (cohérence avec liste étudiants)
    const etudiantsPAN_A = etudiantsAvecPresencesPAN.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.assiduite  // Utiliser sommatif, pas alternatif
    }));

    // 🔧 FIX (23 fév 2026) : Pour C, inclure tous les étudiants (les 0% comptent dans la moyenne)
    const etudiantsSOM_C = etudiantsPourC_SOM.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.completion
    }));

    const etudiantsPAN_C = etudiantsPourC_PAN.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.completion
    }));

    // 🆕 BETA 98.9: Pour P, inclure TOUS les étudiants (comme C) dès qu'il y a des évals
    // Les élèves sans production apparaissent avec un traitement visuel distinct
    const etudiantsPourP_SOM = ilYaDesEvalsSOM ? etudiants : [];
    const etudiantsPourP_PAN = ilYaDesEvalsPAN ? etudiants : [];

    const etudiantsSOM_P = etudiantsPourP_SOM.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.performance,
        sansEvaluation: e.sommatif.completion === 0 && e.sommatif.performance === 0
    }));

    const etudiantsPAN_P = etudiantsPourP_PAN.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.performance,
        sansEvaluation: e.alternatif.completion === 0 && e.alternatif.performance === 0
    }));

    const etudiantsSOM_E = etudiantsAvecDonneesSOM.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.sommatif.engagement
    }));

    const etudiantsPAN_E = etudiantsAvecDonneesPAN.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.engagement
    }));

    // 🆕 BETA 91: Calculer les corrélations A-P et C-P pour interprétation
    // Utiliser la pratique active (SOM ou PAN) pour les corrélations
    const valeursA = afficherPan ? etudiantsPAN_A.map(e => e.valeur) : etudiantsSOM_A.map(e => e.valeur);
    const valeursC = afficherPan ? etudiantsPAN_C.map(e => e.valeur) : etudiantsSOM_C.map(e => e.valeur);
    const valeursP = afficherPan ? etudiantsPAN_P.map(e => e.valeur) : etudiantsSOM_P.map(e => e.valeur);
    const valeursE = afficherPan ? etudiantsPAN_E.map(e => e.valeur) : etudiantsSOM_E.map(e => e.valeur);

    const r_AP = calculerCorrelationPearson(valeursA, valeursP);
    const r_CP = calculerCorrelationPearson(valeursC, valeursP);

    // Calculer la moyenne de E pour le groupe
    const moyenneE = valeursE.length > 0 ? valeursE.reduce((sum, val) => sum + val, 0) / valeursE.length : null;

    // 🆕 BETA 96: Utiliser l'ID de la carte au lieu de chercher par texte
    const carteIndicateurs = document.getElementById('carte-indicateurs-acpe');

    if (!carteIndicateurs) return;

    // Conserver le header, les panneaux et la note toggle AVANT de vider
    const noteToggle = carteIndicateurs.querySelector('.carte-info-toggle');
    const header = carteIndicateurs.querySelector('h3');
    const panneauSuivi = carteIndicateurs.querySelector('#panneau-suivi-etudiants');
    const panneauPrioritaire = carteIndicateurs.querySelector('#panneau-prioritaire');

    // Sauvegarder le HTML des éléments à préserver
    const headerHTML = header ? header.outerHTML : '';
    const panneauSuiviHTML = panneauSuivi ? panneauSuivi.outerHTML : '';
    const panneauPrioritaireHTML = panneauPrioritaire ? panneauPrioritaire.outerHTML : '';
    const noteToggleHTML = noteToggle ? noteToggle.outerHTML : '';

    // Vider et reconstruire avec header, panneaux et note
    const panneauEtaitOuvert = panneauSuivi && panneauSuivi.classList.contains('ouvert');
    const prioEtaitOuvert = panneauPrioritaire && panneauPrioritaire.classList.contains('ouvert');
    carteIndicateurs.innerHTML = headerHTML + panneauSuiviHTML + panneauPrioritaireHTML + noteToggleHTML;

    // Regénérer le contenu des panneaux si ouverts
    if (panneauEtaitOuvert) {
        genererPanneauSuiviEtudiants();
    }
    if (prioEtaitOuvert) {
        calculerEtudiantsPrioritaires();
        genererPanneauSuiviEtudiants();
    }

    // Générer la légende unique en haut
    const legendeUnique = `
        <div class="distribution-legende-commune tb-barre-rai" data-tooltip="tdb-zones-couleur">
            <div class="tb-flex-center-around">
                <span style="color: #ff9800; text-align: center; font-weight: 600;">Fragile<br><span class="tb-texte-mini">30-49%</span></span>
                <span style="color: var(--btn-annuler); text-align: center; font-weight: 600;">Modéré<br><span class="tb-texte-mini">50-64%</span></span>
                <span style="color: var(--vert-succes); text-align: center; font-weight: 600;">Favorable<br><span class="tb-texte-mini">65-79%</span></span>
                <span style="color: var(--bleu-clair); text-align: center; font-weight: 600;">Très favorable<br><span class="tb-texte-mini">≥ 80%</span></span>
            </div>
        </div>
    `;

    // 🆕 BETA 95.7 (22 jan) : Passer le texte explicite "en attente" à chaque barre
    const nbTotal = etudiants.length;

    // Générer les 4 barres de distribution avec interprétations
    const html = `
        <div class="tb-p-20">
            ${legendeUnique}
            ${genererBarreDistribution('Assiduité (A)', etudiantsSOM_A, etudiantsPAN_A, 'A', afficherSom, afficherPan, r_AP, null, texteAttenteA, nbTotal)}
            ${genererBarreDistribution('Complétion (C)', etudiantsSOM_C, etudiantsPAN_C, 'C', afficherSom, afficherPan, r_CP, null, texteAttenteC, nbTotal)}
            ${genererBarreDistribution('Engagement (E)', etudiantsSOM_E, etudiantsPAN_E, 'E', afficherSom, afficherPan, null, moyenneE, texteAttenteE, nbTotal)}
            ${genererBarreDistribution('Performance (P)', etudiantsSOM_P, etudiantsPAN_P, 'P', afficherSom, afficherPan, null, null, texteAttenteP, nbTotal)}
        </div>
    `;

    carteIndicateurs.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte de métrique avec les valeurs SOM et PAN
 * Format standard: fond blanc avec fine bordure
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 * @param {string} label - Nom de la métrique
 * @param {number} valeurSom - Valeur SOM
 * @param {number} valeurPan - Valeur PAN
 * @param {boolean} afficherSom - Afficher SOM
 * @param {boolean} afficherPan - Afficher PAN
 * @returns {string} HTML de la carte
 */
function genererCarteMetrique(label, valeurSom, valeurPan, afficherSom, afficherPan, description = '') {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-tres-grande-orange">${formatPourcentage(valeurSom)}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-tres-grande-bleu-std">${formatPourcentage(valeurPan)}</strong>`);
    }

    // Intégrer la description dans le label si présente
    const labelComplet = description ? `${label} <span class="tb-texte-petit-gris">(${description})</span>` : label;

    return `
        <div class="carte-metrique">
            <span class="label">${labelComplet}</span>
            <div class="tb-flex-gap15-baseline">
                ${valeurs.join('')}
            </div>
        </div>
    `;
}

/* ===============================
   NOUVELLES FONCTIONS : BARRES DE DISTRIBUTION
   =============================== */

/**
 * Génère une barre de distribution visuelle pour A, C, P ou E
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {string} label - Nom de la métrique (ex: "Assiduité")
 * @param {Array} etudiantsSOM - [{da, nom, prenom, valeur}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, valeur}] pour PAN
 * @param {string} type - Type de métrique ('A', 'C', 'P', 'E')
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre de distribution
 */
function genererBarreDistribution(label, etudiantsSOM, etudiantsPAN, type, afficherSom, afficherPan, correlation = null, moyenneEngagement = null, texteAttente = '', nbTotal = 0) {

    // Gradient de couleurs selon les seuils d'engagement (4 zones, sans Insuffisant)
    // Orange (30-49%) → Jaune (50-64%) → Vert (65-79%) → Bleu (≥80%)
    // Transitions douces entre les couleurs
    const gradient = `linear-gradient(to right,
        #ff9800 0%,
        #ffc107 25%,
        #28a745 50%,
        #2196F3 75%)`;

    // Calculer les moyennes pour affichage
    // 🆕 BETA 98.9: Exclure les élèves sansEvaluation du calcul de moyenne P
    let moyenneSOM = null;
    let moyennePAN = null;

    if (afficherSom && etudiantsSOM.length > 0) {
        const etudiantsAvecEvalSOM = etudiantsSOM.filter(e => !e.sansEvaluation);
        if (etudiantsAvecEvalSOM.length > 0) {
            const somme = etudiantsAvecEvalSOM.reduce((acc, e) => acc + e.valeur, 0);
            moyenneSOM = Math.round((somme / etudiantsAvecEvalSOM.length) * 100);
        }
    }

    if (afficherPan && etudiantsPAN.length > 0) {
        const etudiantsAvecEvalPAN = etudiantsPAN.filter(e => !e.sansEvaluation);
        if (etudiantsAvecEvalPAN.length > 0) {
            const somme = etudiantsAvecEvalPAN.reduce((acc, e) => acc + e.valeur, 0);
            moyennePAN = Math.round((somme / etudiantsAvecEvalPAN.length) * 100);
        }
    }

    // 🆕 BETA 91: Générer l'interprétation de la corrélation ou de la moyenne E ou distribution P
    let interpretationHTML = '';

    // PRIORITÉ 1: Distribution P ou diagnostic note de passage
    if (type === 'P' && (etudiantsSOM.length > 0 || etudiantsPAN.length > 0)) {
        const etudiants = afficherPan ? etudiantsPAN : etudiantsSOM;
        const config = db.getSync('modalitesEvaluation', {});
        const soloActive = config.afficherDescriptionsSOLO !== false; // Par défaut true
        const raiActive = config.activerRai !== false; // Par défaut true


        if (soloActive) {
            // 🆕 BETA 91: Distribution IDME + interprétation (si RàI activé)

            const distribution = calculerDistributionPerformance(etudiants);

            let interpretation = '';

            if (raiActive) {
                // Interprétation pédagogique avancée avec patterns
                const echelles = db.getSync('echellesTemplates', []);
                const echelleId = db.getSync('echellePerformanceActive', 'idme-5niv');
                let echelle = echelles.find(e => e.id === echelleId);
                if (!echelle) {
                    echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
                }

                interpretation = echelle ? genererInterpretationPerformance(etudiants, echelle) : '';
            }

            if (distribution) {
                interpretationHTML = `
                    <div class="tb-texte-description">
                        <div><span class="u-texte-gras">Distribution : </span>${distribution}</div>
                        ${interpretation ? `<div class="u-mt-6">${interpretation}</div>` : ''}
                    </div>
                `;
            } else {
            }
        } else {
            // 🆕 BETA 91: Diagnostic basique note de passage (SOLO désactivé)
            const diagnostic = genererDiagnosticNotePassage(etudiants);

            if (diagnostic) {
                interpretationHTML = `
                    <div class="tb-texte-description">
                        ${diagnostic}
                    </div>
                `;
            }
        }
    }
    // PRIORITÉ 2: Corrélations A-P et C-P (seulement si significative r ≥ 0.5)
    else if (correlation !== null && !isNaN(correlation) && Math.abs(correlation) >= 0.5) {
        // Interprétation des corrélations A-P ou C-P avec force intégrée dans la phrase
        const absR = Math.abs(correlation);
        let forceAdjectif = '';
        let explication = '';

        // Déterminer la force de la corrélation (adjectif) - seulement modérée et plus
        if (absR >= 0.9) {
            forceAdjectif = 'très forte';
        } else if (absR >= 0.7) {
            forceAdjectif = 'forte';
        } else {
            forceAdjectif = 'modérée';
        }

        // Explication pédagogique avec force intégrée et corrélation à la fin
        if (type === 'A') {
            explication = `Les étudiants assidus en classe ont une tendance ${forceAdjectif} à obtenir de meilleures performances. (r(${type}↔P) = ${correlation.toFixed(3)})`;
        } else if (type === 'C') {
            explication = `Les étudiants qui remettent plus de travaux ont une tendance ${forceAdjectif} à avoir de meilleures notes. (r(${type}↔P) = ${correlation.toFixed(3)})`;
        }

        interpretationHTML = `
            <div class="tb-texte-description">
                ${explication}
            </div>
        `;
    }
    // PRIORITÉ 3: Moyenne E
    else if (type === 'E' && moyenneEngagement !== null && !isNaN(moyenneEngagement)) {
        // Interprétation de la moyenne E avec qualification du niveau et impact sur contexte
        const moyE = moyenneEngagement * 100; // Convertir en pourcentage
        let niveauAdjectif = '';
        let impactContexte = '';

        if (moyE >= 70) {
            niveauAdjectif = 'bon';
            impactContexte = 'rend favorable le contexte d\'apprentissage';
        } else if (moyE >= 55) {
            niveauAdjectif = 'modéré';
            impactContexte = 'offre un contexte d\'apprentissage acceptable, mais améliorable';
        } else {
            niveauAdjectif = 'faible';
            impactContexte = 'fragilise le contexte d\'apprentissage et nécessite des interventions';
        }

        interpretationHTML = `
            <div class="tb-texte-description">
                Le ${niveauAdjectif} niveau d'engagement global du groupe (moy. ${Math.round(moyE)}%) ${impactContexte}.
            </div>
        `;
    }

    // 🆕 BETA 96: Fonction pour interpoler la couleur du gradient selon la position
    // Gradient: orange (0%) → jaune (25%) → vert (50%) → bleu (75%+)
    function obtenirCouleurGradient(positionPourcent) {
        // Stops du gradient (position en % de la barre → couleur)
        const stops = [
            { pos: 0, r: 255, g: 152, b: 0 },    // #ff9800 orange
            { pos: 25, r: 255, g: 193, b: 7 },   // #ffc107 jaune
            { pos: 50, r: 40, g: 167, b: 69 },   // #28a745 vert
            { pos: 75, r: 33, g: 150, b: 243 },  // #2196F3 bleu
            { pos: 100, r: 33, g: 150, b: 243 }  // #2196F3 bleu (plateau)
        ];

        // Trouver les deux stops entre lesquels interpoler
        let stopInf = stops[0];
        let stopSup = stops[stops.length - 1];
        for (let i = 0; i < stops.length - 1; i++) {
            if (positionPourcent >= stops[i].pos && positionPourcent <= stops[i + 1].pos) {
                stopInf = stops[i];
                stopSup = stops[i + 1];
                break;
            }
        }

        // Interpolation linéaire
        const range = stopSup.pos - stopInf.pos;
        const t = range > 0 ? (positionPourcent - stopInf.pos) / range : 0;
        const r = Math.round(stopInf.r + t * (stopSup.r - stopInf.r));
        const g = Math.round(stopInf.g + t * (stopSup.g - stopInf.g));
        const b = Math.round(stopInf.b + t * (stopSup.b - stopInf.b));

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Note: valeursHTML sera généré plus tard avec la couleur dynamique

    // Générer les points pour SOM avec jitter aléatoire
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesSOM = {};
        etudiantsSOM.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesSOM[scoreArrondi]) {
                groupesSOM[scoreArrondi] = [];
            }
            groupesSOM[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesSOM).forEach(score => {
            const etudiants = groupesSOM[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter pour dilater les agglomérations : ±1.5% horizontal, ±12px vertical
                const jitterH = (Math.random() - 0.5) * 6.0; // ±3% pour ACPE
                const jitterV = (Math.random() - 0.5) * 24; // -12px à +12px
                // Contraindre la position finale pour ne pas dépasser les bords
                const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
                // Anonymiser le nom si en mode anonymisation
                const modeActif = db.getSync('modeApplication', 'normal');
                let nomAffiche;
                if (modeActif === 'anonymisation') {
                    // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                    if (e.prenom && e.prenom.startsWith('Élève')) {
                        nomAffiche = e.prenom;
                    } else {
                        // Sinon, utiliser la fonction d'anonymisation
                        nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                    }
                } else {
                    nomAffiche = `${e.nom}, ${e.prenom}`;
                }
                const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
                const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
                const amplitude = ampNum.toFixed(1);
                const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
                const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
                const scaleUp = (1 + scaleVar).toFixed(2);
                const scaleDown = (1 - scaleVar).toFixed(2);
                const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
                // 🆕 BETA 98.9: Traitement visuel distinct pour élèves sans évaluation
                const classesSansEval = e.sansEvaluation ? ' barre-etudiant-sans-eval' : '';
                const tooltipValeur = e.sansEvaluation ? 'aucune production évaluée' : `${Math.round(e.valeur * 100)}%`;
                                lignesSOM += `<div class="barre-etudiant barre-etudiant-som${classesSansEval}"
                    style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${e.sansEvaluation ? '' : Math.round(e.valeur * 100) + '%'}"
                    title="${echapperHtml(nomAffiche)} : ${tooltipValeur}"></div>`;
            });
        });
    }

    // Générer les points pour PAN avec jitter aléatoire
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        // Grouper par score pour appliquer un jitter aux étudiants au même score
        const groupesPAN = {};
        etudiantsPAN.forEach(e => {
            const scoreArrondi = Math.round(e.valeur * 100);
            if (!groupesPAN[scoreArrondi]) {
                groupesPAN[scoreArrondi] = [];
            }
            groupesPAN[scoreArrondi].push(e);
        });

        // Générer les points avec jitter aléatoire pour éviter superposition parfaite
        Object.keys(groupesPAN).forEach(score => {
            const etudiants = groupesPAN[score];
            etudiants.forEach((e, index) => {
                // Mapper 30-100% sur 0-100% de la barre
                const position = Math.max(0, Math.min((e.valeur - 0.30) / 0.70 * 100, 100));
                // Jitter pour dilater les agglomérations : ±1.5% horizontal, ±12px vertical
                const jitterH = (Math.random() - 0.5) * 6.0; // ±3% pour ACPE
                const jitterV = (Math.random() - 0.5) * 24; // -12px à +12px
                // Contraindre la position finale pour ne pas dépasser les bords
                const positionFinale = Math.max(0, Math.min(position + jitterH, 100));
                // Anonymiser le nom si en mode anonymisation
                const modeActif = db.getSync('modeApplication', 'normal');
                let nomAffiche;
                if (modeActif === 'anonymisation') {
                    // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                    if (e.prenom && e.prenom.startsWith('Élève')) {
                        nomAffiche = e.prenom;
                    } else {
                        // Sinon, utiliser la fonction d'anonymisation
                        nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                    }
                } else {
                    nomAffiche = `${e.nom}, ${e.prenom}`;
                }
                const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
                const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
                const amplitude = ampNum.toFixed(1);
                const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
                const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
                const scaleUp = (1 + scaleVar).toFixed(2);
                const scaleDown = (1 - scaleVar).toFixed(2);
                const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
                // 🆕 BETA 98.9: Traitement visuel distinct pour élèves sans évaluation
                const classesSansEval = e.sansEvaluation ? ' barre-etudiant-sans-eval' : '';
                const tooltipValeur = e.sansEvaluation ? 'aucune production évaluée' : `${Math.round(e.valeur * 100)}%`;
                                lignesPAN += `<div class="barre-etudiant barre-etudiant-std${classesSansEval}"
                    style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${e.sansEvaluation ? '' : Math.round(e.valeur * 100) + '%'}"
                    title="${echapperHtml(nomAffiche)} : ${tooltipValeur}"></div>`;
            });
        });
    }

    // 🆕 BETA 95.7 : Gérer le cas où des données sont en attente
    const nbAvecDonnees = (afficherPan ? etudiantsPAN.length : etudiantsSOM.length) || 0;
    const tousEnAttente = nbTotal > 0 && nbAvecDonnees === 0 && texteAttente;
    const donneesEnAttente = texteAttente && texteAttente.length > 0;

    // Message quand tous sont en attente
    let messageAttenteHTML = '';
    if (tousEnAttente) {
        messageAttenteHTML = `
            <div class="tb-texte-description" style="color: var(--texte-muted); font-style: italic;">
                ${texteAttente}
            </div>
        `;
    }

    // Indicateur "en attente" explicite (si données présentes mais seuil non atteint)
    // 🆕 FIX (24 jan 2026): Ne pas afficher "en attente" si une moyenne significative (> 0%) existe
    // Cas des trimestres archivés où les moyennes sont calculées mais le comptage des évaluations est incorrect
    // Une moyenne de 0% indique qu'il n'y a pas de données significatives → afficher "en attente"
    let indicateurAttenteHTML = '';
    const moyenneSignificative = (afficherSom && moyenneSOM > 0) || (afficherPan && moyennePAN > 0);
    if (donneesEnAttente && !tousEnAttente && !moyenneSignificative) {
        indicateurAttenteHTML = `<span style="color: var(--texte-muted); font-size: 0.8rem; margin-left: 8px;">(${texteAttente})</span>`;
    }

    // Si tous en attente, remplacer l'interprétation par le message d'attente
    const interpretationFinale = tousEnAttente ? messageAttenteHTML : interpretationHTML;

    // 🆕 BETA 96: Générer la courbe de Gauss SVG
    // Collecter toutes les valeurs pour calculer la distribution
    const toutesValeurs = [];
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => toutesValeurs.push(e.valeur));
    }
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => toutesValeurs.push(e.valeur));
    }
    const svgGauss = genererSvgGauss(toutesValeurs, 55);

    // 🆕 BETA 96: Calculer la position et la couleur de la moyenne
    // Mapper la moyenne de 30-100% vers 0-100% de la barre
    let positionMoyenne = 50; // Par défaut au centre
    const moyenneAffichee = afficherPan && moyennePAN !== null ? moyennePAN : moyenneSOM;
    if (moyenneAffichee !== null && !tousEnAttente) {
        // Convertir pourcentage en décimal puis mapper sur la barre
        const moyenneDecimal = moyenneAffichee / 100;
        positionMoyenne = Math.max(0, Math.min((moyenneDecimal - 0.30) / 0.70 * 100, 100));
    }

    // Obtenir la couleur dynamique correspondant à la position dans le gradient
    const couleurMoyenne = obtenirCouleurGradient(positionMoyenne);

    // HTML de la moyenne positionnée au-dessus de la barre avec couleur dynamique
    let moyennePositionneeHTML = '';
    if (!tousEnAttente && moyenneAffichee !== null) {
        // Info-bulle contextuelle pour P : expliquer le filtre
        let titreInfo = '';
        if (type === 'P') {
            const etudiantsRef = afficherPan ? etudiantsPAN : etudiantsSOM;
            const nbAvecEval = etudiantsRef.filter(e => !e.sansEvaluation).length;
            const nbSans = etudiantsRef.length - nbAvecEval;
            titreInfo = ` title="Moyenne sur ${nbAvecEval} élèves ayant au moins 1 évaluation (${nbSans} exclus). La liste des individus inclut tous les élèves."`;
        }
        moyennePositionneeHTML = `<div${titreInfo} style="cursor: help; position: absolute; top: -20px; left: ${positionMoyenne}%; transform: translateX(-50%); z-index: 10; font-size: 0.9rem; font-weight: 700; color: ${couleurMoyenne};">${moyenneAffichee}%</div>`;
    }

    return `
        <div class="distribution-container u-mb-20">
            <h4 class="tb-titre-simple" style="margin-bottom: 4px;" data-tooltip="${{A:'tdb-assiduite',C:'tdb-completion',E:'tdb-engagement',P:'tdb-performance'}[type]}">${label}</h4>
            <div style="position: relative; margin-top: 20px; margin-bottom: ${interpretationFinale ? '8px' : '0'};">
                ${moyennePositionneeHTML}
                <div class="barre-indicateur">
                    <div class="barre-indicateur-overlay"></div>
                    ${svgGauss}
                    ${lignesSOM}
                    ${lignesPAN}
                </div>
            </div>
            ${interpretationFinale}
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les patterns d'apprentissage
 * 4 zones : Stable (vert) | Défi (bleu) | Émergent (jaune) | Critique (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, pattern}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, pattern}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan, nbSansDonnees = 0, nbTotal = 0, infoFiabilite = null) {
    // 🆕 BETA 95.6 : Gérer le cas où tous les étudiants sont sans données
    const nbAvecDonnees = (afficherPan ? etudiantsPAN.length : etudiantsSOM.length) || 0;
    const tousEnAttente = nbTotal > 0 && nbAvecDonnees === 0;

    if (tousEnAttente) {
        return `
            <div class="distribution-container u-mb-15">
                <h4 class="tb-titre-metrique" data-tooltip="tdb-patterns">Répartition des patterns d'apprentissage</h4>
                <div class="tb-texte-description" style="color: var(--texte-muted); font-style: italic;">
                    En attente de données pour ${nbTotal} étudiant${nbTotal > 1 ? 's' : ''}.
                </div>
                <div class="barre-patterns tb-barre-simple" style="opacity: 0.5;">
                    <div class="barre-patterns-overlay"></div>
                </div>
                <div class="distribution-legende tb-barre-distribution">
                    <span style="position: absolute; left: 12.5%; transform: translateX(-50%); color: var(--badge-pattern-stable-texte); font-weight: 600; text-align: center;">Progression<br>stable<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                    <span style="position: absolute; left: 37.5%; transform: translateX(-50%); color: var(--badge-pattern-defi-texte); font-weight: 600; text-align: center;">Défi<br>spécifique<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                    <span style="position: absolute; left: 62.5%; transform: translateX(-50%); color: var(--badge-pattern-emergent-texte); font-weight: 600; text-align: center;">Blocage<br>émergent<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                    <span style="position: absolute; left: 87.5%; transform: translateX(-50%); color: var(--badge-pattern-critique-texte); font-weight: 600; text-align: center;">Blocage<br>critique<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                </div>
            </div>
        `;
    }

    // 4 zones du spectre lumineux avec transitions douces
    // Vert → Cyan → Bleu → Indigo (bon → critique)
    // Gradient maintenant défini dans styles.css (.barre-patterns)

    // Mapper les patterns aux positions (centre de chaque zone)
    const positionPattern = {
        'stable': 12.5,          // Centre de 0-25%
        'progression': 12.5,
        'defi-specifique': 37.5, // Centre de 25-50%
        'blocage-emergent': 62.5,// Centre de 50-75%
        'blocage-critique': 87.5,// Centre de 75-100%
        'non-participation': 87.5 // 🆕 BETA 98.9: Même zone que blocage critique
    };

    // Calculer les compteurs par pattern pour SOM et PAN
    const compteursSOM = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'blocage-emergent': 0, 'blocage-critique': 0, 'non-participation': 0 };
    const compteursPAN = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'blocage-emergent': 0, 'blocage-critique': 0, 'non-participation': 0 };

    // Générer les points pour SOM avec jitter (nuage de points)
    // SOM = GAUCHE de chaque zone (position - 2%)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const pattern = e.pattern || 'stable';
            compteursSOM[pattern] = (compteursSOM[pattern] || 0) + 1;

            const position = positionPattern[pattern] || 50;
            const decalageH = -2; // SOM à gauche
            const jitterH = (Math.random() - 0.5) * 20.0; // ±10% pour Patterns/RàI
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
            const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
            const amplitude = ampNum.toFixed(1);
            const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
            const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
            const scaleUp = (1 + scaleVar).toFixed(2);
            const scaleDown = (1 - scaleVar).toFixed(2);
            const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-pattern="${pattern}"
                title="${echapperHtml(nomAffiche)} : ${pattern}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    // PAN = DROITE de chaque zone (position + 2%)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const pattern = e.pattern || 'stable';
            compteursPAN[pattern] = (compteursPAN[pattern] || 0) + 1;

            const position = positionPattern[pattern] || 50;
            const decalageH = 2; // PAN à droite
            const jitterH = (Math.random() - 0.5) * 20.0; // ±10% pour Patterns/RàI
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
            const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
            const amplitude = ampNum.toFixed(1);
            const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
            const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
            const scaleUp = (1 + scaleVar).toFixed(2);
            const scaleDown = (1 - scaleVar).toFixed(2);
            const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
            lignesPAN += `<div class="barre-etudiant barre-etudiant-std"
                style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-pattern="${pattern}"
                title="${echapperHtml(nomAffiche)} : ${pattern}"></div>`;
        });
    }

    // Calculer les pourcentages pour chaque zone
    const totalSOM = etudiantsSOM.length || 1;
    const totalPAN = etudiantsPAN.length || 1;

    // Regrouper stable + progression
    const stableSOM = (compteursSOM['stable'] || 0) + (compteursSOM['progression'] || 0);
    const stablePAN = (compteursPAN['stable'] || 0) + (compteursPAN['progression'] || 0);
    const stablePctSOM = Math.round((stableSOM / totalSOM) * 100);
    const stablePctPAN = Math.round((stablePAN / totalPAN) * 100);

    const defiSOM = compteursSOM['defi-specifique'] || 0;
    const defiPAN = compteursPAN['defi-specifique'] || 0;
    const defiPctSOM = Math.round((defiSOM / totalSOM) * 100);
    const defiPctPAN = Math.round((defiPAN / totalPAN) * 100);

    const emergentSOM = compteursSOM['blocage-emergent'] || 0;
    const emergentPAN = compteursPAN['blocage-emergent'] || 0;
    const emergentPctSOM = Math.round((emergentSOM / totalSOM) * 100);
    const emergentPctPAN = Math.round((emergentPAN / totalPAN) * 100);

    // 🆕 BETA 98.9: Inclure les non-participants dans le compteur critique
    const critiqueSOM = (compteursSOM['blocage-critique'] || 0) + (compteursSOM['non-participation'] || 0);
    const critiquePAN = (compteursPAN['blocage-critique'] || 0) + (compteursPAN['non-participation'] || 0);
    const critiquePctSOM = Math.round((critiqueSOM / totalSOM) * 100);
    const critiquePctPAN = Math.round((critiquePAN / totalPAN) * 100);

    // Générer labels avec compteurs et pourcentages
    let labelStable = 'Progression<br>stable';
    let labelDefi = 'Défi<br>spécifique';
    let labelEmergent = 'Blocage<br>émergent';
    let labelCritique = 'Blocage<br>critique';

    if (afficherSom && afficherPan) {
        labelStable += `<br><span class="tb-texte-mini-orange">${stableSOM} (${stablePctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${stablePAN} (${stablePctPAN}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-orange">${defiSOM} (${defiPctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${defiPAN} (${defiPctPAN}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-orange">${emergentSOM} (${emergentPctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${emergentPAN} (${emergentPctPAN}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-orange">${critiqueSOM} (${critiquePctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${critiquePAN} (${critiquePctPAN}%)</span>`;
    } else if (afficherSom) {
        labelStable += `<br><span class="tb-texte-mini-orange">${stableSOM} (${stablePctSOM}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-orange">${defiSOM} (${defiPctSOM}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-orange">${emergentSOM} (${emergentPctSOM}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-orange">${critiqueSOM} (${critiquePctSOM}%)</span>`;
    } else if (afficherPan) {
        labelStable += `<br><span class="tb-texte-mini-bleu-std">${stablePAN} (${stablePctPAN}%)</span>`;
        labelDefi += `<br><span class="tb-texte-mini-bleu-std">${defiPAN} (${defiPctPAN}%)</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-bleu-std">${emergentPAN} (${emergentPctPAN}%)</span>`;
        labelCritique += `<br><span class="tb-texte-mini-bleu-std">${critiquePAN} (${critiquePctPAN}%)</span>`;
    }

    // 🆕 BETA 91: Générer l'interprétation des patterns
    let interpretation = '';
    const etudiants = afficherSom ? etudiantsSOM : etudiantsPAN;
    if (etudiants && etudiants.length > 0) {
        // Note: stableSOM inclut déjà stable + progression (ligne 1337)
        // Si mode comparatif, utiliser les données de la pratique affichée
        if (afficherSom && afficherPan) {
            // Mode comparatif : utiliser les données de SOM uniquement (car les deux sont affichés)
            const patternsDistributionSOM = [
                { pattern: 'Progression', count: stableSOM },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiSOM },
                { pattern: 'Blocage émergent', count: emergentSOM },
                { pattern: 'Blocage critique', count: critiqueSOM }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionSOM, etudiantsSOM.length);
        } else if (afficherSom) {
            const patternsDistributionSOM = [
                { pattern: 'Progression', count: stableSOM },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiSOM },
                { pattern: 'Blocage émergent', count: emergentSOM },
                { pattern: 'Blocage critique', count: critiqueSOM }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionSOM, etudiantsSOM.length);
        } else if (afficherPan) {
            const patternsDistributionPAN = [
                { pattern: 'Progression', count: stablePAN },  // stable + progression regroupés
                { pattern: 'Stable', count: 0 },
                { pattern: 'Excellence émergente', count: 0 },
                { pattern: 'Défi spécifique', count: defiPAN },
                { pattern: 'Blocage émergent', count: emergentPAN },
                { pattern: 'Blocage critique', count: critiquePAN }
            ];
            interpretation = genererInterpretationPatterns(patternsDistributionPAN, etudiantsPAN.length);
        }
    }

    // 🆕 Indicateur de fiabilité
    let messageFiabilite = '';
    if (infoFiabilite) {
        const { minArtefacts, maxArtefacts, fenetre } = infoFiabilite;
        if (maxArtefacts < fenetre) {
            // Aucun étudiant n'a assez de données
            const n = maxArtefacts;
            messageFiabilite = `<div style="color: var(--texte-muted); font-style: italic; font-size: 0.8rem; margin-bottom: 4px;">Analyse préliminaire — basé sur ${n} production${n > 1 ? 's' : ''} sur ${fenetre} configurées</div>`;
        } else if (minArtefacts < fenetre) {
            // Données mixtes
            messageFiabilite = `<div style="color: var(--texte-muted); font-style: italic; font-size: 0.8rem; margin-bottom: 4px;">Certains étudiants ont moins de ${fenetre} productions évaluées</div>`;
        }
    }

    return `
        <div class="distribution-container u-mb-15">
            <h4 class="tb-titre-metrique" style="margin-bottom: 4px;" data-tooltip="tdb-patterns">Répartition des patterns d'apprentissage</h4>
            ${messageFiabilite}
            <div class="barre-patterns tb-barre-simple">
                <div class="barre-patterns-overlay"></div>
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende tb-barre-distribution">
                <span style="position: absolute; left: 12.5%; transform: translateX(-50%); color: #1bbd7e; font-weight: 600; text-align: center;">${labelStable}</span>
                <span style="position: absolute; left: 37.5%; transform: translateX(-50%); color: #11aec5; font-weight: 600; text-align: center;">${labelDefi}</span>
                <span style="position: absolute; left: 62.5%; transform: translateX(-50%); color: #2994ee; font-weight: 600; text-align: center;">${labelEmergent}</span>
                <span style="position: absolute; left: 87.5%; transform: translateX(-50%); color: #4f74f3; font-weight: 600; text-align: center;">${labelCritique}</span>
            </div>
            ${interpretation ? `<div class="interpretation-barre" style="margin-top: 8px;">${interpretation}</div>` : ''}
        </div>
    `;
}

/**
 * Génère une barre de distribution pour les niveaux RàI
 * 3 zones : Niveau 1 (vert) | Niveau 2 (jaune) | Niveau 3 (orange)
 *
 * @param {Array} etudiantsSOM - [{da, nom, prenom, niveau}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, niveau}] pour PAN
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre
 */
function genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan, nbSansDonnees = 0, nbTotal = 0, infoFiabilite = null) {
    // 🆕 BETA 95.6 : Gérer le cas où tous les étudiants sont sans données
    const nbAvecDonnees = (afficherPan ? etudiantsPAN.length : etudiantsSOM.length) || 0;
    const tousEnAttente = nbTotal > 0 && nbAvecDonnees === 0;

    if (tousEnAttente) {
        return `
            <div class="distribution-container u-mb-15">
                <h4 class="tb-titre-metrique" data-tooltip="tdb-rai">Modèle de la Réponse à l'intervention (RàI)</h4>
                <div class="tb-texte-description" style="color: var(--texte-muted); font-style: italic;">
                    En attente de données pour ${nbTotal} étudiant${nbTotal > 1 ? 's' : ''}.
                </div>
                <div class="barre-rai tb-barre-simple" style="opacity: 0.5;">
                    <div class="barre-rai-overlay"></div>
                </div>
                <div class="distribution-legende tb-barre-distribution">
                    <span style="position: absolute; left: 16.5%; transform: translateX(-50%); color: var(--bleu-clair); font-weight: 600; text-align: center;">Niveau 1<br>Universel<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                    <span style="position: absolute; left: 49.5%; transform: translateX(-50%); color: var(--jetons-reprise-titre); font-weight: 600; text-align: center;">Niveau 2<br>Préventif<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                    <span style="position: absolute; left: 83%; transform: translateX(-50%); color: var(--den-violet); font-weight: 600; text-align: center;">Niveau 3<br>Intensif<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0%)</span></span>
                </div>
            </div>
        `;
    }

    // 3 zones du spectre lumineux avec transitions douces
    // Bleu → Mauve → Violet (niveau 1 → niveau 3)
    // Gradient maintenant défini dans styles.css (.barre-rai)

    // Mapper les niveaux aux positions (centre de chaque zone)
    const positionNiveau = {
        1: 16.5,  // Centre de 0-33%
        2: 49.5,  // Centre de 33-66%
        3: 83     // Centre de 66-100%
    };

    // Calculer les compteurs par niveau pour SOM et PAN
    const compteursSOM = { 1: 0, 2: 0, 3: 0 };
    const compteursPAN = { 1: 0, 2: 0, 3: 0 };

    // Générer les points pour SOM avec jitter (nuage de points)
    // SOM = GAUCHE de chaque zone (position - 2%)
    let lignesSOM = '';
    if (afficherSom && etudiantsSOM.length > 0) {
        etudiantsSOM.forEach(e => {
            const niveau = e.niveau || 1;
            compteursSOM[niveau] = (compteursSOM[niveau] || 0) + 1;

            const position = positionNiveau[niveau] || 50;
            const decalageH = -2; // SOM à gauche
            const jitterH = (Math.random() - 0.5) * 20.0; // ±10% pour Patterns/RàI
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
            const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
            const amplitude = ampNum.toFixed(1);
            const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
            const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
            const scaleUp = (1 + scaleVar).toFixed(2);
            const scaleDown = (1 - scaleVar).toFixed(2);
            const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
            lignesSOM += `<div class="barre-etudiant barre-etudiant-som"
                style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-niveau="${niveau}"
                title="${echapperHtml(nomAffiche)} : Niveau ${niveau}"></div>`;
        });
    }

    // Générer les points pour PAN avec jitter (nuage de points)
    // PAN = DROITE de chaque zone (position + 2%)
    let lignesPAN = '';
    if (afficherPan && etudiantsPAN.length > 0) {
        etudiantsPAN.forEach(e => {
            const niveau = e.niveau || 1;
            compteursPAN[niveau] = (compteursPAN[niveau] || 0) + 1;

            const position = positionNiveau[niveau] || 50;
            const decalageH = 2; // PAN à droite
            const jitterH = (Math.random() - 0.5) * 20.0; // ±10% pour Patterns/RàI
            const jitterV = (Math.random() - 0.5) * 24; // ±12px pour dilater agglomérations
            // Contraindre la position finale pour ne pas dépasser les bords
            const positionFinale = Math.max(0, Math.min(position + decalageH + jitterH, 100));
            // Anonymiser le nom si en mode anonymisation
            const modeActif = db.getSync('modeApplication', 'normal');
            let nomAffiche;
            if (modeActif === 'anonymisation') {
                // Si les données sont déjà anonymisées (e.prenom commence par "Élève")
                if (e.prenom && e.prenom.startsWith('Élève')) {
                    nomAffiche = e.prenom;
                } else {
                    // Sinon, utiliser la fonction d'anonymisation
                    nomAffiche = (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
                }
            } else {
                nomAffiche = `${e.nom}, ${e.prenom}`;
            }
            const animDelay = (Math.random() * 6).toFixed(2); // Délai aléatoire 0-6s (élargi pour réduire sync)
            const ampNum = 8 + Math.random() * 10; // Amplitude 8-18px
            const amplitude = ampNum.toFixed(1);
            const offsetX = ((Math.random() - 0.5) * 10).toFixed(1); // Décalage X aléatoire -5 à +5px
            const scaleVar = 0.02 + (ampNum - 8) / 10 * 0.10; // 2% à 12% selon amplitude
            const scaleUp = (1 + scaleVar).toFixed(2);
            const scaleDown = (1 - scaleVar).toFixed(2);
            const duration = (8 - (ampNum - 8) * 0.4).toFixed(1); // 8s à 4s selon amplitude
            lignesPAN += `<div class="barre-etudiant barre-etudiant-std"
                style="left: ${positionFinale}%; top: 50%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                data-da="${e.da}"
                data-nom="${echapperHtml(nomAffiche)}"
                data-niveau="${niveau}"
                title="${echapperHtml(nomAffiche)} : Niveau ${niveau}"></div>`;
        });
    }

    // Calculer les pourcentages pour chaque niveau
    const totalSOM = etudiantsSOM.length || 1;
    const totalPAN = etudiantsPAN.length || 1;

    const niveau1SOM = compteursSOM[1] || 0;
    const niveau1PAN = compteursPAN[1] || 0;
    const niveau1PctSOM = Math.round((niveau1SOM / totalSOM) * 100);
    const niveau1PctPAN = Math.round((niveau1PAN / totalPAN) * 100);

    const niveau2SOM = compteursSOM[2] || 0;
    const niveau2PAN = compteursPAN[2] || 0;
    const niveau2PctSOM = Math.round((niveau2SOM / totalSOM) * 100);
    const niveau2PctPAN = Math.round((niveau2PAN / totalPAN) * 100);

    const niveau3SOM = compteursSOM[3] || 0;
    const niveau3PAN = compteursPAN[3] || 0;
    const niveau3PctSOM = Math.round((niveau3SOM / totalSOM) * 100);
    const niveau3PctPAN = Math.round((niveau3PAN / totalPAN) * 100);

    // Générer labels avec compteurs et pourcentages
    let labelNiveau1 = 'Niveau 1<br>Universel';
    let labelNiveau2 = 'Niveau 2<br>Préventif';
    let labelNiveau3 = 'Niveau 3<br>Intensif';

    if (afficherSom && afficherPan) {
        labelNiveau1 += `<br><span class="tb-texte-mini-orange">${niveau1SOM} (${niveau1PctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${niveau1PAN} (${niveau1PctPAN}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-orange">${niveau2SOM} (${niveau2PctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${niveau2PAN} (${niveau2PctPAN}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-orange">${niveau3SOM} (${niveau3PctSOM}%)</span> <span class="tb-texte-mini-bleu-std">${niveau3PAN} (${niveau3PctPAN}%)</span>`;
    } else if (afficherSom) {
        labelNiveau1 += `<br><span class="tb-texte-mini-orange">${niveau1SOM} (${niveau1PctSOM}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-orange">${niveau2SOM} (${niveau2PctSOM}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-orange">${niveau3SOM} (${niveau3PctSOM}%)</span>`;
    } else if (afficherPan) {
        labelNiveau1 += `<br><span class="tb-texte-mini-bleu-std">${niveau1PAN} (${niveau1PctPAN}%)</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-bleu-std">${niveau2PAN} (${niveau2PctPAN}%)</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-bleu-std">${niveau3PAN} (${niveau3PctPAN}%)</span>`;
    }

    // 🆕 BETA 91: Générer l'interprétation RàI
    let interpretation = '';
    const etudiants = afficherSom ? etudiantsSOM : etudiantsPAN;
    if (etudiants && etudiants.length > 0) {
        // Si mode comparatif, utiliser les données de la pratique affichée
        if (afficherSom && afficherPan) {
            // Mode comparatif : utiliser les données combinées
            const raiDistribution = [
                { niveau: 1, count: niveau1SOM + niveau1PAN },
                { niveau: 2, count: niveau2SOM + niveau2PAN },
                { niveau: 3, count: niveau3SOM + niveau3PAN }
            ];
            interpretation = genererInterpretationRai(raiDistribution, etudiantsSOM.length);
        } else if (afficherSom) {
            const raiDistributionSOM = [
                { niveau: 1, count: niveau1SOM },
                { niveau: 2, count: niveau2SOM },
                { niveau: 3, count: niveau3SOM }
            ];
            interpretation = genererInterpretationRai(raiDistributionSOM, etudiantsSOM.length);
        } else if (afficherPan) {
            const raiDistributionPAN = [
                { niveau: 1, count: niveau1PAN },
                { niveau: 2, count: niveau2PAN },
                { niveau: 3, count: niveau3PAN }
            ];
            interpretation = genererInterpretationRai(raiDistributionPAN, etudiantsPAN.length);
        }
    }

    // 🆕 Indicateur de fiabilité
    let messageFiabilite = '';
    if (infoFiabilite) {
        const { minArtefacts, maxArtefacts, fenetre } = infoFiabilite;
        if (maxArtefacts < fenetre) {
            // Aucun étudiant n'a assez de données
            const n = maxArtefacts;
            messageFiabilite = `<div style="color: var(--texte-muted); font-style: italic; font-size: 0.8rem; margin-bottom: 4px;">Analyse préliminaire — basé sur ${n} production${n > 1 ? 's' : ''} sur ${fenetre} configurées</div>`;
        } else if (minArtefacts < fenetre) {
            // Données mixtes
            messageFiabilite = `<div style="color: var(--texte-muted); font-style: italic; font-size: 0.8rem; margin-bottom: 4px;">Certains étudiants ont moins de ${fenetre} productions évaluées</div>`;
        }
    }

    return `
        <div class="distribution-container u-mb-15">
            <h4 class="tb-titre-metrique" style="margin-bottom: 4px;" data-tooltip="tdb-rai">Modèle de la Réponse à l'intervention (RàI)</h4>
            ${messageFiabilite}
            <div class="barre-rai tb-barre-simple">
                <div class="barre-rai-overlay"></div>
                ${lignesSOM}
                ${lignesPAN}
            </div>
            <div class="distribution-legende tb-barre-distribution">
                <span style="position: absolute; left: 16.5%; transform: translateX(-50%); color: var(--bleu-clair); font-weight: 600; text-align: center;">${labelNiveau1}</span>
                <span style="position: absolute; left: 49.5%; transform: translateX(-50%); color: #6366f1; font-weight: 600; text-align: center;">${labelNiveau2}</span>
                <span style="position: absolute; left: 83%; transform: translateX(-50%); color: #7c3aed; font-weight: 600; text-align: center;">${labelNiveau3}</span>
            </div>
            ${interpretation ? `<div class="interpretation-barre" style="margin-top: 8px;">${interpretation}</div>` : ''}
        </div>
    `;
}

/**
 * Affiche les compteurs de niveaux d'engagement
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritairesCompteurs(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;
    const nbTotal = etudiants.length;

    // Calculer les statistiques pour SOM
    let somTresFavorable = 0, somFavorable = 0, somModere = 0, somFragile = 0, somInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.sommatif.niveauEngagement;
        if (niveau === 'très favorable') somTresFavorable++;
        else if (niveau === 'favorable') somFavorable++;
        else if (niveau === 'modéré') somModere++;
        else if (niveau === 'fragile') somFragile++;
        else if (niveau === 'insuffisant') somInsuffisant++;
    });

    // Calculer les statistiques pour PAN
    let panTresFavorable = 0, panFavorable = 0, panModere = 0, panFragile = 0, panInsuffisant = 0;
    etudiants.forEach(e => {
        const niveau = e.alternatif.niveauEngagement;
        if (niveau === 'très favorable') panTresFavorable++;
        else if (niveau === 'favorable') panFavorable++;
        else if (niveau === 'modéré') panModere++;
        else if (niveau === 'fragile') panFragile++;
        else if (niveau === 'insuffisant') panInsuffisant++;
    });

    // Trouver la carte Niveau d'engagement
    const cartes = document.querySelectorAll('#tableau-bord-apercu .carte');
    let carteEngagement = null;
    cartes.forEach(carte => {
        const h3 = carte.querySelector('h3 span');
        if (h3 && h3.textContent.includes("Niveau d'engagement")) {
            carteEngagement = carte;
        }
    });

    if (!carteEngagement) return;

    // Conserver le header et la note toggle
    const noteToggle = carteEngagement.querySelector('.carte-info-toggle');
    const header = carteEngagement.querySelector('h3');

    carteEngagement.innerHTML = '';
    carteEngagement.appendChild(header);
    if (noteToggle) carteEngagement.appendChild(noteToggle);

    // Générer les cartes (ordre inversé : favorable en haut, insuffisant en bas)
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${genererCarteEngagement('Engagement favorable', somTresFavorable + somFavorable, panTresFavorable + panFavorable, nbTotal, afficherSom, afficherPan, 'var(--alerte-fond-succes)', 'var(--btn-confirmer)')}
            ${genererCarteEngagement('Engagement modéré', somModere, panModere, nbTotal, afficherSom, afficherPan, 'rgba(200,160,96,0.1)', '#c8a060')}
            ${genererCarteEngagement('Engagement fragile', somFragile, panFragile, nbTotal, afficherSom, afficherPan, 'rgba(232,64,87,0.08)', 'var(--risque-tres-eleve)')}
            ${genererCarteEngagement('Engagement insuffisant', somInsuffisant, panInsuffisant, nbTotal, afficherSom, afficherPan, 'rgba(160,32,48,0.1)', 'var(--risque-critique)')}
        </div>
    `;

    carteEngagement.insertAdjacentHTML('beforeend', html);
}

/**
 * Génère une carte d'engagement avec les valeurs SOM et PAN colorées
 */
function genererCarteEngagement(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-std">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche la liste des étudiants à engagement insuffisant
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 * @param {boolean} afficherSommatif - Utiliser les indices sommatifs
 */
function afficherListeEtudiantsCritiques(etudiants, afficherSommatif) {
    const container = document.getElementById('tb-etudiants-critique');
    if (!container) return;

    const etudiantsCritiques = etudiants
        .filter(e => {
            const niveau = afficherSommatif ? e.sommatif.niveauEngagement : e.alternatif.niveauEngagement;
            return niveau === 'insuffisant';
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        });

    container.innerHTML = etudiantsCritiques.map(e => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center;
                        padding: 12px; background: #162c36; border-radius: 6px;
                        border-left: 4px solid var(--risque-critique);">
                <div>
                    <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                    <span style="color: var(--gris-moyen); margin-left: 10px;">(${echapperHtml(e.groupe || '—')})</span>
                    <div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 4px;">
                        A: ${formatPourcentage(indices.assiduite)} |
                        C: ${formatPourcentage(indices.completion)} |
                        P: ${formatPourcentage(indices.performance)}
                    </div>
                </div>
                <button class="btn btn-principal"
                        data-action="tbNavigerVersProfil" data-param="${e.da}"
                        class="tb-padding-compact">
                    Voir profil
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Génère une carte de pattern avec valeurs SOM et PAN colorées
 */
function genererCartePattern(label, valeurSom, valeurPan, total, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSom}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-std">${valeurPan}</strong>`);
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Affiche les patterns d'apprentissage
 * En mode hybride, affiche SOM et PAN côte à côte
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */

/**
 * 🆕 BETA 98.9: Affiche une alerte nommée pour les élèves en non-participation
 * (présents en classe mais 0 production remise)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlerteNonParticipation(etudiants) {
    // Détecter les élèves présents mais sans aucune production
    const nonParticipants = etudiants.filter(e => {
        const aDesPresences = (e.sommatif && e.sommatif.nombreSeances > 0) || (e.alternatif && e.alternatif.nombreSeances > 0);
        const aDesEvals = (e.sommatif && (e.sommatif.completion > 0 || e.sommatif.performance > 0)) ||
                          (e.alternatif && (e.alternatif.completion > 0 || e.alternatif.performance > 0));
        return aDesPresences && !aDesEvals;
    });

    // Retirer l'alerte existante si présente
    const carteIndicateurs = document.getElementById('carte-indicateurs-acpe');
    if (!carteIndicateurs) return;

    const alerteExistante = carteIndicateurs.querySelector('.alerte-non-participation');
    if (alerteExistante) alerteExistante.remove();

    if (nonParticipants.length === 0) return;

    // Construire la liste nommée
    const modeActif = db.getSync('modeApplication', 'normal');
    const lignes = nonParticipants.map(e => {
        let nomAffiche;
        if (modeActif === 'anonymisation') {
            nomAffiche = (e.prenom && e.prenom.startsWith('Élève')) ? e.prenom :
                (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
        } else {
            nomAffiche = `${e.nom}, ${e.prenom}`;
        }
        const assiduite = Math.round((e.sommatif ? e.sommatif.assiduite : e.alternatif.assiduite) * 100);
        // Nombre de productions attendues (évaluations du groupe)
        const nbProductions = e.sommatif ? e.sommatif.nbEvaluations || 0 : (e.alternatif ? e.alternatif.nbEvaluations || 0 : 0);
        const detailProd = nbProductions > 0 ? ` — 0/${nbProductions} productions` : '';
        return `<li>${echapperHtml(nomAffiche)} — A\u00a0: ${assiduite}%${detailProd}</li>`;
    }).join('');

    const nbEleves = nonParticipants.length;
    const html = `
        <div class="alerte-non-participation info-box info-box--attention" style="margin: 16px 20px 0;">
            <strong>&#9888;&#65039; ${nbEleves} élève${nbEleves > 1 ? 's' : ''} présent${nbEleves > 1 ? 's' : ''} sans aucune production remise</strong>
            <ul style="margin: 6px 0 0 16px; padding: 0; list-style: none;">
                ${lignes}
            </ul>
        </div>
    `;

    // Insérer après les barres ACPE (avant le conteneur indicateurs apprentissage ou avant le fold)
    const conteneurIndicateurs = carteIndicateurs.querySelector('#conteneur-indicateurs-apprentissage');
    if (conteneurIndicateurs) {
        conteneurIndicateurs.insertAdjacentHTML('beforebegin', html);
    } else {
        carteIndicateurs.insertAdjacentHTML('beforeend', html);
    }
}

function afficherPatternsApprentissage(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // 🆕 BETA 98.9: Inclure TOUS les étudiants — les non-participants sont classés
    // 'Non-participation' par determinerCibleIntervention() et apparaissent dans la zone critique
    const etudiantsAvecDonneesCP = etudiants;
    const nbSansDonneesCP = 0;
    const nbTotal = etudiants.length;

    // Vérifier si au moins un étudiant a des données C ou P significatives
    const aucuneDonneeCP = etudiants.every(e => {
        const cpSOM = e.sommatif.completion === 0 && e.sommatif.performance === 0;
        const cpPAN = e.alternatif.completion === 0 && e.alternatif.performance === 0;
        return cpSOM && cpPAN;
    });

    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    // IMPORTANT : Utiliser determinerCibleIntervention() pour garantir la cohérence
    // avec le tableau de liste des étudiants. Les patterns doivent être identiques
    // partout car ils sont basés sur la même logique (N derniers artefacts).

    // 🆕 BETA 98.9: Préparer les données pour SOM et PAN (tous les étudiants)
    // Note : determinerCibleIntervention() retourne le pattern basé sur les N derniers artefacts
    // ce qui garantit la cohérence méthodologique nécessaire pour détecter les patterns
    const etudiantsSOM = [];
    const etudiantsPAN = [];

    etudiantsAvecDonneesCP.forEach(e => {
        try {
            if (typeof determinerCibleIntervention === 'function') {
                const cibleInfo = determinerCibleIntervention(e.da);
                const pattern = cibleInfo ? cibleInfo.pattern : null;

                // Normaliser le pattern
                const patternNormalise = pattern ? pattern.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') : null;

                if (patternNormalise) {
                    const etudiantData = {
                        da: e.da,
                        nom: e.nom,
                        prenom: e.prenom,
                        pattern: patternNormalise
                    };

                    // Ajouter à SOM et PAN (même pattern pour les deux car basé sur les mêmes données)
                    etudiantsSOM.push(etudiantData);
                    etudiantsPAN.push({...etudiantData});
                }
            }
        } catch (error) {
            console.warn('⚠️ [Patterns] Erreur pour DA', e.da, ':', error.message);
            // 🔧 FIX Beta 97.4 : Fallback sur le pattern stocké par calculerEtStockerPatternsGroupe
            const patternStocke = typeof obtenirPatternEtudiant === 'function' ? obtenirPatternEtudiant(e.da) : null;
            if (patternStocke && patternStocke.pattern) {
                const patternNormalise = patternStocke.pattern.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                if (patternNormalise && patternNormalise !== 'inconnu') {
                    etudiantsSOM.push({ da: e.da, nom: e.nom, prenom: e.prenom, pattern: patternNormalise });
                    etudiantsPAN.push({ da: e.da, nom: e.nom, prenom: e.prenom, pattern: patternNormalise });
                }
            }
        }
    });

    // 🆕 BETA 96: Injecter dans la nouvelle section "Indicateurs d'apprentissage"
    const conteneur = document.getElementById('conteneur-indicateurs-apprentissage');

    if (!conteneur) {
        console.warn('⚠️ [Patterns] Conteneur indicateurs apprentissage non trouvé dans le DOM');
        return;
    }

    // Vérifier si la barre Patterns existe déjà pour éviter les doublons
    const barreExistante = conteneur.querySelector('.barre-patterns-container');
    if (barreExistante) {
        barreExistante.remove();
    }

    // 🆕 Calculer l'indicateur de fiabilité pour le groupe
    const fenetreAnalyse = typeof obtenirNombreProductionsPourPatterns === 'function' ? obtenirNombreProductionsPourPatterns() : 3;
    const nbArtefactsParEtudiant = etudiantsAvecDonneesCP.map(e => {
        try {
            return calculerIndicesNDerniersArtefacts(e.da, true).nbArtefacts || 0;
        } catch (err) { return 0; }
    });
    let infoFiabilite = null;
    if (nbArtefactsParEtudiant.length > 0) {
        const minArtefacts = Math.min(...nbArtefactsParEtudiant);
        const maxArtefacts = Math.max(...nbArtefactsParEtudiant);
        infoFiabilite = { minArtefacts, maxArtefacts, fenetre: fenetreAnalyse };
    }

    // Générer la barre de distribution et l'ajouter au conteneur
    // 🆕 FIX (24 jan 2026) : Passer le nombre d'étudiants sans données CP pour affichage approprié
    // Note: Patterns doit être AVANT RàI dans l'ordre d'affichage
    const html = `
        <div class="barre-patterns-container">
            ${genererBarrePatterns(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan, nbSansDonneesCP, nbTotal, infoFiabilite)}
        </div>
    `;

    // Insérer au début du conteneur (avant RàI)
    conteneur.insertAdjacentHTML('afterbegin', html);
}

/**
 * Génère une carte RàI avec valeurs SOM et PAN colorées
 */
function genererCarteRaI(label, description, valeurSomPct, valeurPanPct, valeurSomCount, valeurPanCount, afficherSom, afficherPan, bgColor, borderColor) {
    const valeurs = [];

    if (afficherSom) {
        valeurs.push(`<strong class="tb-valeur-grande-orange">${valeurSomPct}%</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-std">${valeurPanPct}%</strong>`);
    }

    // Générer le texte du nombre d'étudiants
    let texteEtudiants = '';
    if (afficherSom && afficherPan) {
        texteEtudiants = `${valeurSomCount} / ${valeurPanCount} étudiants – ${description}`;
    } else if (afficherSom) {
        texteEtudiants = `${valeurSomCount} étudiants – ${description}`;
    } else if (afficherPan) {
        texteEtudiants = `${valeurPanCount} étudiants – ${description}`;
    }

    return `
        <div style="background: ${bgColor}; padding: 12px; border-radius: 6px; border: 2px solid ${borderColor};">
            <div class="u-flex-between">
                <span class="tb-texte-moyen-gris">${label}</span>
                <div class="tb-flex-gap15-baseline">
                    ${valeurs.join('')}
                </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--gris-clair); margin-top: 4px;">${texteEtudiants}</div>
        </div>
    `;
}

/**
 * Affiche les niveaux RàI (Réponse à l'intervention)
 * Valeurs colorées selon la pratique (orange=SOM, bleu=PAN)
 *
 * NOUVEAU Beta 90 : Utilise l'interface de pratiques au lieu du calcul hardcodé
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherNiveauxRaI(etudiants) {
    const config = db.getSync('modalitesEvaluation', {});
    const affichage = config.affichageTableauBord || {};
    const afficherSom = affichage.afficherSommatif === true;
    const afficherPan = affichage.afficherAlternatif === true;

    // 🆕 BETA 98.9: Inclure TOUS les étudiants — les non-participants sont classés
    // Niveau 3 par determinerNiveauRaiPedagogique()
    const etudiantsAvecDonneesCP = etudiants;
    const nbSansDonneesCP = 0;
    const nbTotal = etudiants.length;


    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    const pratiqueSOM = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('sommative') : null;
    const pratiquePAN = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('pan-standards') : null;

    // 🆕 NOUVEAU Beta 90+ : Utiliser determinerNiveauRaiPedagogique() pour cohérence
    // Cette fonction calcule le niveau RàI basé UNIQUEMENT sur P + SRPNF (sans A-C)
    // Garantit la cohérence avec la section Accompagnement (Single Source of Truth)

    const etudiantsSOM = [];
    const etudiantsPAN = [];

    // Utiliser la même fonction pour SOM et PAN (niveau RàI pédagogique identique)
    // 🆕 BETA 98.9: Inclut tous les étudiants — non-participants classés Niveau 3
    if (typeof determinerNiveauRaiPedagogique === 'function') {
        etudiantsAvecDonneesCP.forEach(e => {
            const niveauInfo = determinerNiveauRaiPedagogique(e.da);
            const niveau = niveauInfo ? niveauInfo.niveau : null;

            if (niveau) {
                const etudiantData = {
                    da: e.da,
                    nom: e.nom,
                    prenom: e.prenom,
                    niveau: niveau
                };

                // Ajouter aux deux listes (même niveau pour SOM et PAN car basé sur les mêmes critères pédagogiques)
                etudiantsSOM.push({...etudiantData});
                etudiantsPAN.push({...etudiantData});
            }
        });
    } else {
        console.warn('⚠️ [RàI] Fonction determinerNiveauRaiPedagogique non disponible');
    }

    // 🆕 BETA 96: Injecter dans la nouvelle section "Indicateurs d'apprentissage"
    const conteneur = document.getElementById('conteneur-indicateurs-apprentissage');

    if (!conteneur) {
        console.warn('⚠️ [RàI] Conteneur indicateurs apprentissage non trouvé dans le DOM');
        return;
    }

    // Vérifier si la barre RàI existe déjà pour éviter les doublons
    const barreExistante = conteneur.querySelector('.barre-rai-container');
    if (barreExistante) {
        barreExistante.remove();
    }

    // 🆕 Calculer l'indicateur de fiabilité pour le groupe
    const fenetreAnalyse = typeof obtenirNombreProductionsPourPatterns === 'function' ? obtenirNombreProductionsPourPatterns() : 3;
    const nbArtefactsParEtudiant = etudiantsAvecDonneesCP.map(e => {
        try {
            return calculerIndicesNDerniersArtefacts(e.da, true).nbArtefacts || 0;
        } catch (err) { return 0; }
    });
    let infoFiabilite = null;
    if (nbArtefactsParEtudiant.length > 0) {
        const minArtefacts = Math.min(...nbArtefactsParEtudiant);
        const maxArtefacts = Math.max(...nbArtefactsParEtudiant);
        infoFiabilite = { minArtefacts, maxArtefacts, fenetre: fenetreAnalyse };
    }

    // Générer la barre de distribution et l'ajouter au conteneur
    // 🆕 FIX (24 jan 2026) : Passer le nombre d'étudiants sans données CP pour affichage approprié
    const html = `
        <div class="barre-rai-container">
            ${genererBarreRaI(etudiantsSOM, etudiantsPAN, afficherSom, afficherPan, nbSansDonneesCP, nbTotal, infoFiabilite)}
        </div>
    `;

    conteneur.insertAdjacentHTML('beforeend', html);
}

/**
 * ANCIENNE FONCTION (Beta 89 et antérieur) - OBSOLÈTE depuis Beta 90
 *
 * Cette fonction calculait les patterns directement selon les indices A-C-P.
 * Elle est désormais remplacée par l'appel à pratique.identifierPattern(da)
 * qui délègue la détection de pattern à la pratique active.
 *
 * Conservée en commentaire pour référence et compréhension de l'ancienne logique.
 *
 * @deprecated Utiliser pratique.identifierPattern(da) à la place
 */
/*
function determinerPattern(indices) {
    const {assiduite, completion, performance, niveauRisque} = indices;

    // Stable: tous les indices > 0.75, risque faible/minimal
    if (assiduite >= 0.75 && completion >= 0.75 && performance >= 0.75) {
        return 'stable';
    }

    // Critique: niveau de risque critique
    if (niveauRisque === 'critique') {
        return 'critique';
    }

    // Émergent: assiduité OK mais complétion ou performance en baisse
    if (assiduite >= 0.75 && (completion < 0.65 || performance < 0.65)) {
        return 'émergent';
    }

    // Défi: au moins un indice sous 0.75 mais pas de blocage critique
    return 'défi';
}
*/

/**
 * Affiche les actions recommandées (Top 5)
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherActionsRecommandees(etudiants) {
    const container = document.getElementById('tb-liste-actions');
    const messageVide = document.getElementById('tb-aucune-action');

    if (!container) return;

    const config = db.getSync('modalitesEvaluation', {});
    const afficherSommatif = config.affichageTableauBord?.afficherSommatif === true;

    // Filtrer étudiants à engagement faible et trier par priorité (engagement croissant)
    const etudiantsAEngagementFaible = etudiants
        .filter(e => {
            const engagement = afficherSommatif ? e.sommatif.engagement : e.alternatif.engagement;
            return engagement < 0.50; // Seuil: modéré ou moins
        })
        .sort((a, b) => {
            const engagementA = afficherSommatif ? a.sommatif.engagement : a.alternatif.engagement;
            const engagementB = afficherSommatif ? b.sommatif.engagement : b.alternatif.engagement;
            return engagementA - engagementB; // Tri croissant (engagement le plus faible en premier)
        })
        .slice(0, 5); // Top 5

    if (etudiantsAEngagementFaible.length === 0) {
        container.classList.add('u-hide');
        if (messageVide) messageVide.classList.remove('u-hide');
        return;
    }

    container.classList.remove('u-hide');
    if (messageVide) messageVide.classList.add('u-hide');

    container.innerHTML = etudiantsAEngagementFaible.map((e, index) => {
        const indices = afficherSommatif ? e.sommatif : e.alternatif;
        const recommendation = genererRecommandation(indices);

        return `
            <div style="padding: 15px; background: #162c36; border-radius: 8px;
                        border-left: 4px solid ${getCouleurEngagement(indices.niveauEngagement)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span style="display: inline-block; width: 24px; height: 24px;
                                     background: ${getCouleurEngagement(indices.niveauEngagement)};
                                     color: white; border-radius: 50%; text-align: center;
                                     line-height: 24px; font-weight: bold; margin-right: 10px;">
                            ${index + 1}
                        </span>
                        <strong>${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</strong>
                        <span style="color: var(--gris-moyen); margin-left: 8px;">(${echapperHtml(e.groupe || '—')})</span>
                    </div>
                    <span class="badge-engagement engagement-${indices.niveauEngagement.replace(' ', '-')}"
                          class="tb-texte-capitalize">
                        ${indices.niveauEngagement}
                    </span>
                </div>
                <div class="tb-texte-gris-mb10">
                    ${recommendation}
                </div>
                <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                    <span>A: ${formatPourcentage(indices.assiduite)}</span> |
                    <span>C: ${formatPourcentage(indices.completion)}</span> |
                    <span>P: ${formatPourcentage(indices.performance)}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Génère une recommandation d'action selon les indices
 *
 * @param {Object} indices - Indices A-C-P
 * @returns {string} Recommandation pédagogique
 */
function genererRecommandation(indices) {
    const {assiduite, completion, performance} = indices;

    // Identifier le défi principal
    if (assiduite < 0.65) {
        return "<strong>Priorité: Assiduité</strong> - Contacter l'étudiant pour comprendre les absences et proposer un soutien";
    }
    if (completion < 0.65) {
        return "📝 <strong>Priorité: Complétion</strong> - Rencontre pour identifier les obstacles et établir un échéancier réaliste";
    }
    if (performance < 0.65) {
        return "🎯 <strong>Priorité: Performance</strong> - Offrir du soutien pédagogique et des stratégies d'apprentissage";
    }
    if (assiduite < 0.75) {
        return "⚠️ <strong>Suivi: Assiduité</strong> - Surveiller l'évolution et encourager la régularité";
    }
    if (completion < 0.75) {
        return "⚠️ <strong>Suivi: Complétion</strong> - Rappeler les échéances et vérifier la charge de travail";
    }
    if (performance < 0.75) {
        return "⚠️ <strong>Suivi: Performance</strong> - Proposer des ressources complémentaires";
    }

    return "✓ Situation sous contrôle - Maintenir le suivi régulier";
}

/**
 * Retourne la couleur CSS selon le niveau d'engagement
 *
 * @param {string} niveau - Niveau d'engagement
 * @returns {string} Couleur CSS
 */
function getCouleurEngagement(niveau) {
    const couleurs = {
        'très favorable': '#2196F3',  // Bleu - Très bon
        'favorable': '#388e3c',        // Vert - Bon
        'modéré': '#fbc02d',           // Jaune - Attention
        'fragile': '#f57c00',          // Orange - Préoccupant
        'insuffisant': '#d32f2f'       // Rouge - Critique
    };
    return couleurs[niveau] || '#999';
}

/**
 * Affiche la distribution des niveaux de risque
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherDistributionRisques(etudiants) {
    const container = document.getElementById('tb-distribution-risques');
    if (!container) return;
    
    // Compter par niveau de risque
    const distribution = {
        'minimal': 0,
        'faible': 0,
        'modéré': 0,
        'élevé': 0,
        'très élevé': 0,
        'critique': 0
    };
    
    etudiants.forEach(e => {
        distribution[e.niveauRisque]++;
    });
    
    // Couleurs selon le niveau
    const couleurs = {
        'minimal': 'var(--risque-nul)',
        'faible': 'var(--risque-minimal)',
        'modéré': 'var(--risque-modere)',
        'élevé': 'var(--risque-eleve)',
        'très élevé': '#c0392b',
        'critique': '#7f0000'
    };
    
    // Générer le HTML
    container.innerHTML = Object.entries(distribution).map(([niveau, nombre]) => `
        <div style="padding: 15px; background: #162c36; border-left: 4px solid ${couleurs[niveau]}; 
                    border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 1.5rem; font-weight: bold; color: ${couleurs[niveau]};">
                ${nombre}
            </div>
            <div style="font-size: 0.85rem; color: var(--gris-moyen); text-transform: capitalize;">
                ${niveau}
            </div>
        </div>
    `).join('');
}

/**
 * Affiche les alertes prioritaires (étudiants à risque)
 * 
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherAlertesPrioritaires(etudiants) {
    const container = document.getElementById('tb-alertes-prioritaires');
    if (!container) return;
    
    // Filtrer les étudiants avec risque ≥ élevé (seuil 0.4)
    const etudiantsARisque = etudiants
        .filter(e => e.risque >= 0.4)
        .sort((a, b) => b.risque - a.risque);  // Tri décroissant
    
    if (etudiantsARisque.length === 0) {
        container.innerHTML = `
            <p class="tb-zone-succes">
                ✅ Aucune intervention urgente requise
            </p>
        `;
        return;
    }
    
    // Générer le tableau
    container.innerHTML = `
        <table class="tableau u-mt-15">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Groupe</th>
                    <th>Assiduité</th>
                    <th>Complétion</th>
                    <th>Performance</th>
                    <th>Niveau de risque</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${etudiantsARisque.map(e => `
                    <tr>
                        <td><strong>${echapperHtml(e.nom)}</strong></td>
                        <td>${echapperHtml(e.prenom)}</td>
                        <td>${echapperHtml(e.groupe || '—')}</td>
                        <td>${formatPourcentage(e.assiduite)}</td>
                        <td>${formatPourcentage(e.completion)}</td>
                        <td>${formatPourcentage(e.performance)}</td>
                        <td>
                            <span class="badge-risque risque-${e.niveauRisque.replace(' ', '-')}" 
                                  class="tb-texte-capitalize">
                                ${e.niveauRisque}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-principal"
                                    data-action="tbNavigerVersProfil" data-param="${e.da}"
                                    class="tb-padding-compact">
                                Voir profil
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

/**
 * Met à jour le texte d'un élément HTML
 * 
 * @param {string} id - ID de l'élément
 * @param {string|number} valeur - Valeur à afficher
 */
function setStatText(id, valeur) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = valeur;
    } else {
        console.warn(`⚠️ Élément ${id} non trouvé`);
    }
}

/**
 * Formate un nombre en pourcentage
 *
 * @param {number} valeur - Valeur entre 0 et 1
 * @returns {string} Pourcentage formaté (ex: "87%")
 */
function formatPourcentage(valeur) {
    if (valeur === null || valeur === undefined || isNaN(valeur)) {
        return '—';
    }
    return Math.round(valeur * 100) + '%';
}

/**
 * Met à jour la largeur d'une barre de progression
 *
 * @param {string} id - ID de l'élément barre
 * @param {number} pourcentage - Pourcentage de largeur (0-100)
 */
function setBarre(id, pourcentage) {
    const element = document.getElementById(id);
    if (element) {
        element.style.width = Math.round(pourcentage) + '%';
    }
}

/**
 * Wrapper de navigation : ouvre la sous-section profil et charge le profil.
 * Utilisé par data-action="tbNavigerVersProfil" data-param="<da>"
 * @param {string} da - Le DA de l'étudiant
 */
function tbNavigerVersProfil(da) {
    if (typeof afficherSousSection === 'function') {
        afficherSousSection('tableau-bord-profil');
    }
    if (typeof afficherProfilComplet === 'function') {
        afficherProfilComplet(da);
    }
}

/* ===============================
   📤 EXPORTS GLOBAUX
   =============================== */

// Export pour permettre le rafraîchissement depuis d'autres modules
window.tbNavigerVersProfil = tbNavigerVersProfil;
window.chargerTableauBordApercu = chargerTableauBordApercu;
window.initialiserModuleTableauBordApercu = initialiserModuleTableauBordApercu;
window.appliquerCouleursEtudiantsSuivis = appliquerCouleursEtudiantsSuivis;
window.appliquerCouleursPrioritaires = appliquerCouleursPrioritaires;
window.calculerEtudiantsPrioritaires = calculerEtudiantsPrioritaires;

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js : echapperHtml()
 * - 09-2-saisie-presences.js : calculerNombreSeances() (optionnel)
 * - styles.css : classes badge-risque, carte-metrique, tableau
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module doit être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ (lecture seule):
 * - 'groupeEtudiants' : Array des étudiants
 * - 'presences' : Array des présences
 * - 'evaluationsSauvegardees' : Array des évaluations
 * - 'productions' : Array des productions
 * 
 * HTML REQUIS:
 * Éléments avec IDs dans la sous-section tableau-bord-apercu:
 * - tb-total-etudiants
 * - tb-assiduite-moyenne
 * - tb-completion-moyenne
 * - tb-performance-moyenne
 * - tb-interventions-requises
 * - tb-distribution-risques
 * - tb-alertes-prioritaires
 * 
 * FORMULES UTILISÉES (Guide de monitorage):
 * - Assiduité (A) : SOMME(heures présent) / TOTAL(heures cours)
 * - Complétion (C) : NOMBRE(remis) / NOMBRE(attendus)
 * - Performance (P) : MOYENNE(3 derniers IDME) / 4
 * - Engagement : E = (A × C × P)^(1/3) (racine cubique)
 *
 * SEUILS D'ENGAGEMENT:
 * - Très favorable: ≥ 0.80
 * - Favorable: 0.65 - 0.79
 * - Modéré: 0.50 - 0.64
 * - Fragile: 0.30 - 0.49
 * - Insuffisant: < 0.30
 */

})();
