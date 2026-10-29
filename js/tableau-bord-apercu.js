/* ===============================
   MODULE: TABLEAU DE BORD - APERÇU
   Calculs des indices A-C-P et affichage des métriques globales
   =============================== */

(function() {
'use strict';

/**
 * MODULE: apercu-contenu.js
 *
 * RÔLE:
 * Calcule et affiche les statistiques pédagogiques du tableau de bord
 * - Métriques globales du groupe (indices A-C-P)
 * - Distributions A, C et P
 *
 * FONDEMENTS THÉORIQUES:
 * Basé sur le Guide de monitorage - Section ROUGE (indices primaires)
 * - Assiduité (A) : proportion de présence
 * - Complétion (C) : proportion d'artefacts remis
 * - Performance (P) : performance moyenne (3 derniers artefacts)
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
// #749 (11 sept. 2026) — NOM de la famille, jamais une clé de stockage tel quel.
// La liste vit sous `cle('etudiantsSuivis') + '_gc_' + <groupeCoursId>` (voir
// cleEtudiantsSuivis) : une liste par trimestre ET par groupe-cours, comme
// `seancesCompletes_gc_<id>`. La clé NUE `etudiantsSuivis` n'est plus que LUE,
// une fois, pour le semis (voir obtenirEtudiantsSuivis) — jamais réécrite.
const CLE_SUIVI = 'etudiantsSuivis';
// Mots lus par les collègues (proposition Cowork du 11 sept., soumise à Grégoire).
const MESSAGE_SUIVI_COMPLET = 'Cinq étudiant·es suivi·es au maximum. Retires-en un·e pour en ajouter un·e autre.';

/* ===============================
   ÉCHELLE DES DISTRIBUTIONS A-C-P (#818, 10 sept. 2026)
   =============================== */

// ⚠ CES BORNES NE CLASSENT RIEN. Aucun `if (valeur >= 0.80)` n'existe dans ce
// module : la barre est un dégradé CONTINU et la couleur d'un point est
// INTERPOLÉE (obtenirCouleurGradient). Les repères de la légende situent des
// changements de teinte sur une échelle continue — ils ne découpent pas des
// catégories, et ne sont pas les seuils d'interprétation (70/80/85), qui sont
// une autre échelle, celle-là réglable.
//
// L'axe ne part pas de 0 : il montre 30 → 100 %. Les arrêts du dégradé sont
// posés en POSITION sur la barre (0, 25, 50, 75 %), donc en scores 30 / 47,5 /
// 65 / 82,5 %. La légende qui les affichait est retirée le 15 oct. 2026 (bloc 6b
// des textes relus) : ces repères ne fondaient rien de pédagogique.
const ECHELLE_DISTRIBUTION_MIN = 0.30;
const ECHELLE_DISTRIBUTION_MAX = 1.00;

// LA table du dégradé : position sur la barre + teinte. Elle sert aux trois
// endroits qui en portaient chacun une copie — la chaîne CSS, l'interpolation
// de couleur, et les libellés de la légende.
const ARRETS_DEGRADE = [
    { position: 0,  couleur: '#ff9800' }, // orange
    { position: 25, couleur: '#ffc107' }, // jaune
    { position: 50, couleur: '#28a745' }, // vert
    { position: 75, couleur: '#2196F3' }  // bleu
];

/** Position (0-100 sur la barre) d'un score 0-1. */
function positionSurEchelleDistribution(valeur) {
    const etendue = ECHELLE_DISTRIBUTION_MAX - ECHELLE_DISTRIBUTION_MIN;
    return Math.max(0, Math.min((valeur - ECHELLE_DISTRIBUTION_MIN) / etendue * 100, 100));
}

/** Réciproque : le score 0-1 qu'une position 0-100 sur la barre représente. */
function scoreALaPositionDistribution(position) {
    return ECHELLE_DISTRIBUTION_MIN + (position / 100) * (ECHELLE_DISTRIBUTION_MAX - ECHELLE_DISTRIBUTION_MIN);
}

// #821 lot A (10 sept. 2026) — `contexte-qualification.js` LIT la géométrie du
// dégradé (bandesLegendeApercu) pour la poser à côté des trois autres règles
// qui qualifient un contexte ; il ne la recopie pas. Exposée ici, à sa source.
window.ARRETS_DEGRADE = ARRETS_DEGRADE;
window.scoreALaPositionDistribution = scoreALaPositionDistribution;

let _etudiantsPrioritaires = [];
let _tousEtudiantsEnrichis = []; // Tous les étudiants avec indices calculés
let _filtresActifs = []; // Filtres toggle : 'P', 'M', 'suivi', 'rai'
// #828 (lot F, 16 sept. 2026) : l'identifiant 'M' est gardé tel quel — il n'est écrit nulle part
// (ni préférence, ni stockage : `_filtresActifs` vit en mémoire, `data-tri` est relu au clic).
// Il ne désigne plus la moyenne (A + C) / 2 : le filtre retient l'élève dont l'assiduité OU la
// complétion est sous la borne « critique » du profil (voir `borneCritiqueEngagement`).

/**
 * #749 — LA CLÉ DE LA LISTE SUIVIE : PAR TRIMESTRE ET PAR GROUPE-COURS.
 *
 * L'INCIDENT (audit du 6 sept., G-2, mesuré) : la liste vivait sous la clé nue
 * `etudiantsSuivis`, partagée entre trimestres et groupes, et `nettoyer…` la
 * RÉÉCRIVAIT filtrée par le groupe actif. Ouvrir « Détails » sous le groupe B
 * écrivait `[]` : les suivis du groupe A étaient perdus en base, à la simple
 * consultation. Grégoire a deux groupes cet automne.
 *
 * Patron suivi : `seancesCompletes_gc_<id>` (horaire.js), avec en plus le
 * préfixe de trimestre par `cle()` — la famille `etudiantsSuivis` est inscrite
 * à CLES_NAMESPACEES (trimestres.js), comme `snapshots` dont les clés réelles
 * portent aussi un suffixe d'id. Sans groupe-cours actif : la clé du trimestre.
 */
function cleEtudiantsSuivis() {
    const gc = db.getSync('groupeCoursActif', null);
    const gcId = gc && gc.id ? String(gc.id) : '';
    const base = cle(CLE_SUIVI);
    return gcId ? base + '_gc_' + gcId : base;
}

/** Les DA qu'on peut suivre : élèves du groupe actif, hors abandons (G-3). */
function dasSuivablesDuGroupe() {
    const etudiants = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif() : [];
    const exclu = typeof estEtudiantExclu === 'function' ? estEtudiantExclu : () => false;
    return new Set(etudiants.filter(e => e && !exclu(e)).map(e => e.da));
}

/**
 * La liste suivie du groupe-cours actif, telle qu'elle est en base.
 *
 * SEMIS — UNE LECTURE QUI ÉCRIT UNE FOIS (tranché par Cowork le 11 sept. 2026,
 * réversible). À la première lecture d'un groupe-cours dont la clé n'existe pas
 * encore, si la clé NUE `etudiantsSuivis` (le stock d'avant #749) existe, ses
 * entrées dont le DA appartient à ce groupe deviennent la liste du groupe. La
 * clé nue n'est NI effacée NI réécrite : rien n'est détruit chez personne, et si
 * le semis est faux, la valeur d'origine est encore là (elle devient une
 * orpheline, connue de scripts/diagnostic-353-cles-orphelines.js). Le semis
 * n'écrit que s'il a quelque chose à semer : une liste vide ne se stocke pas.
 *
 * Seconde source (relecture adverse du 11 sept.) : `migrerResidusClesNues`
 * (trimestres.js, au boot) copie toute clé nue du registre vers
 * `<actif>_<nom>` et la PURGE — chez qui n'avait pas encore ce flag, la nue
 * aura été déplacée en `<trim>_etudiantsSuivis` avant la première lecture.
 * Le semis lit donc aussi cette clé-là, sans l'écrire.
 */
function obtenirEtudiantsSuivis() {
    const k = cleEtudiantsSuivis();
    const liste = db.getSync(k, null);
    if (Array.isArray(liste)) return liste;

    let source = db.getSync(CLE_SUIVI, null);
    const kTrimestre = cle(CLE_SUIVI);
    if ((!Array.isArray(source) || source.length === 0) && kTrimestre !== k) {
        source = db.getSync(kTrimestre, null);
    }
    if (!Array.isArray(source) || source.length === 0) return [];
    const das = dasSuivablesDuGroupe();
    const semis = source.filter(s => s && das.has(s.da));
    if (semis.length > 0) db.setSync(k, semis);
    return semis;
}

function sauvegarderEtudiantsSuivis(liste) {
    db.setSync(cleEtudiantsSuivis(), liste);
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleEtudiantsSuivis());   // lot F : geste hors témoin (ajouter, retirer, vider)
}

/**
 * La liste suivie, restreinte à ce qui se montre : élèves du groupe actif, non
 * exclus. FILTRE À LA LECTURE, N'ÉCRIT JAMAIS (#749, G-2/G-3) — ce qui n'est
 * pas du groupe est ignoré, pas effacé ; un élève en abandon libère son siège
 * sans perdre son entrée. Une seule écriture subsiste : le geste explicite
 * (ajouter, retirer, réinitialiser).
 */
function nettoyerEtudiantsSuivis() {
    const das = dasSuivablesDuGroupe();
    return obtenirEtudiantsSuivis().filter(s => s && das.has(s.da));
}

function ajouterEtudiantSuivi(da) {
    // G-1 : un DA hors du groupe actif (ou exclu) est refusé À L'AJOUT — il était
    // accepté puis purgé par le nettoyage suivant.
    if (!dasSuivablesDuGroupe().has(da)) return false;
    // La liste EN BASE (entrées d'élèves en abandon comprises : elles ne sont pas
    // purgées par un ajout — relecture adverse du 11 sept.) ; le plafond et les
    // couleurs, eux, ne comptent que ce qui se montre.
    const liste = obtenirEtudiantsSuivis();
    const visibles = nettoyerEtudiantsSuivis();
    if (liste.some(s => s && s.da === da)) return false;
    if (visibles.length >= MAX_ETUDIANTS_SUIVIS) {
        // G-1 : le sixième refus était muet — « un sixième clic qui ne fait rien ».
        if (typeof notifications !== 'undefined' && notifications && typeof notifications.info === 'function') {
            notifications.info(MESSAGE_SUIVI_COMPLET);
        }
        return false;
    }
    // Trouver le premier index libre (0-4) parmi les couleurs affichées
    const indicesUtilises = new Set(visibles.map(s => s.couleurIndex));
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

    // #397 : rendu sur N étudiants — lire indicesAssiduite/indicesCP UNE fois et
    // les passer en caches (patron calculerIndicesEtudiant) ; cache de lecture de
    // pipeline pour les autres lecteurs de la boucle (RàI, suivi). Mesuré à
    // l'audit : 44 → 203 ms par rendu, croissant avec la taille d'indicesCP.
    var cacheIndicesA = db.getSync(cle('indicesAssiduite'), {});
    var cacheIndicesCP = (typeof obtenirDonneesSelonMode === 'function')
        ? (obtenirDonneesSelonMode('indicesCP') || {}) : {};
    if (typeof demarrerCacheLecture === 'function') demarrerCacheLecture();
    try {
    actifs.forEach(function(e) {
        var indices = calculerTousLesIndices(e.da, cacheIndicesA, cacheIndicesCP);
        var rai = typeof determinerNiveauRaiPedagogique === 'function'
            ? determinerNiveauRaiPedagogique(e.da) : { niveau: 0, pattern: '' };

        // Suivi de l'apprentissage (IPB × direction sur critères multistructurels)
        var suivi = null;
        var scoreMulti = null;
        if (typeof diagnostiquerSuiviApprentissage === 'function') {
            suivi = diagnostiquerSuiviApprentissage(e.da);
            if (suivi) scoreMulti = suivi.scoreActuel;
        }

        _tousEtudiantsEnrichis.push({
            da: e.da,
            nom: e.nom,
            prenom: e.prenom,
            pattern: rai.pattern,
            niveau: rai.niveau,
            A: indices.A,
            C: indices.C,
            P: indices.P,
            // #394 (règle 4) : P stocké « non constructible » → l'affichage montre « — »
            noteConstructible: indices.noteConstructible !== false,
            scoreMulti: scoreMulti,
            suivi: suivi
        });
    });
    } finally {
        if (typeof terminerCacheLecture === 'function') terminerCacheLecture();
    }

    appliquerFiltres();
    return _etudiantsPrioritaires;
}

/**
 * #828 (lot F du cadrage du 16 sept. 2026) : la borne du filtre « A ou C < N% » est la
 * borne « critique » de la carte Mobilisation du profil (`BORNES_MOBILISATION`,
 * `contexte-qualification.js`), lue à l'appel et jamais recopiée : si la borne change,
 * la règle et le libellé du bouton suivent. En pourcentage entier (0,7 → 70).
 */
function borneCritiqueEngagement() {
    return Math.round(window.BORNES_MOBILISATION.critique * 100);
}

/**
 * Un indice n'est « sous la borne » que s'il est un nombre montré (G-4, #749 : on filtre
 * sur ce qui est MONTRÉ). Un A ou un C absent — null, non constructible, barre vide
 * (#830) — s'affiche « — » et ne peut pas être « < 70 % » : en JavaScript, `null < 70`
 * est vrai, d'où cette garde.
 */
function indiceSousBorne(valeur, borne) {
    return typeof valeur === 'number' && Number.isFinite(valeur) && valeur < borne;
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

    // #828 : la borne n'est lue que si le filtre M est actif (les autres filtres n'en dépendent pas).
    var borneM = _filtresActifs.indexOf('M') >= 0 ? borneCritiqueEngagement() : null;

    // Intersection (AND) : chaque filtre doit matcher
    _etudiantsPrioritaires = _tousEtudiantsEnrichis.filter(function(e) {
        for (var i = 0; i < _filtresActifs.length; i++) {
            switch (_filtresActifs[i]) {
                case 'P':
                    // G-4 (#749) : filtrer sur ce qui est MONTRÉ — un P non
                    // constructible s'affiche « — », il ne peut pas être « < 65 % ».
                    if (e.noteConstructible === false || e.P >= 65) return false;
                    break;
                case 'M':
                    // #828 : assiduité OU complétion sous la borne critique du profil.
                    if (!indiceSousBorne(e.A, borneM) && !indiceSousBorne(e.C, borneM)) return false;
                    break;
                case 'suivi':
                    if (!e.suivi || e.suivi.ipb < 2) return false;
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
                    case 'P': if (e.noteConstructible !== false) score += Math.max(0, 65 - e.P); break;
                    case 'M': {
                        // #828 : l'urgence est celle du pire des deux indices montrés.
                        var montres = [e.A, e.C].filter(function(v) { return typeof v === 'number' && Number.isFinite(v); });
                        if (montres.length) score += Math.max(0, borneM - Math.min.apply(null, montres));
                        break;
                    }
                    case 'suivi': score += e.suivi ? e.suivi.ipb * 30 + (e.suivi.direction === '↘' ? 20 : e.suivi.direction === '→' ? 10 : 0) : 0; break;
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

// G-4 (#749) : les ids et classes `prioritaire-tri-*` sont des vestiges (« tri »)
// pour ce qui est des FILTRES (libellé « Filtrer : »). Ils restent : ils vivent
// dans styles.css (dark + mode-clair) et dans le HTML généré ici — les renommer
// n'est pas un renommage interne. Le nom `trierEtudiantsPrioritaires`, lui, n'avait
// plus d'appelant : retiré.

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

    // G-5 (#749) : le chemin vers le profil (les badges A/C/P) n'existe qu'en
    // mode Détails — le mot qui le dit ne s'affiche que là.
    const aideProfil = document.getElementById('suivi-aide-profil');
    if (aideProfil) aideProfil.hidden = !filtrePrio;

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
                { id: 'P', label: 'P < 65\u00a0%' },
                { id: 'M', label: 'A ou C < ' + formaterPourcentage(borneCritiqueEngagement()) },   // #828 : lu à la borne, jamais recopié
                { id: 'suivi', label: 'Suivi' },
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
                + _badgeIndiceSuivi('A', enrichi.A) + _badgeIndiceSuivi('C', enrichi.C)
                + _badgeIndiceSuivi('P', enrichi.noteConstructible === false ? null : enrichi.P,
                    // Lot N4 (#713) : la cause, quand la pratique en déclare une (source unique, portfolio.js).
                    (enrichi.noteConstructible === false && typeof causeNoteNonConstructible === 'function') ? causeNoteNonConstructible(e.da) : null)
                + '</span>';
        }

        var nomSafe = typeof echapperHtml === 'function' ? echapperHtml(nomAffiche) : nomAffiche;

        return '<div class="etudiant-suivi-item' + classeActif + classePrioritaire + '" data-da="' + e.da + '">'
            + pastille + '<span>' + nomSafe + '</span>'
            + badges
            + '</div>';
    }).join('');
}

/** Helper badge pour le panneau suivi unifié.
 *  #394 : valeur null = note non constructible → « — » (jamais un 0 trompeur).
 *  #743 (lot D) : un A inconnu passe aussi par ici — le tiret, SANS la bulle de P (elle parlerait
 *  d'une note). La bulle de A est de Grégoire (validée le 19 sept. 2026). C n'a pas de bulle.
 *  Lot N4 (#713) : `cause` — la phrase de la pratique, quand elle en déclare une — remplace la bulle générique de P. */
function _badgeIndiceSuivi(label, valeur, cause) {
    if (valeur === null || valeur === undefined) {
        var bulle = label === 'P' ? ' title="' + (cause ? echapperHtml(cause) : 'Note non constructible avec la configuration actuelle') + '"'
            : label === 'A' ? ' title="Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e."' : '';
        return '<span class="prioritaire-indice"' + bulle + '>' + label + ' —</span>';
    }
    var cls = 'prioritaire-indice';
    if (valeur < 65) cls += ' prioritaire-indice-critique';
    else if (valeur < 75) cls += ' prioritaire-indice-attention';
    return '<span class="' + cls + '">' + label + ' ' + formaterPourcentage(valeur) + '</span>';
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
    const afficherContexte = obtenirPreference('afficherContexteGraphiques') !== false;

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

    // #818 — LE mappage de l'échelle, plus une quatrième copie de (val-0.30)/0.70.
    const mapperPosition = positionSurEchelleDistribution;

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
            μ=${formaterPourcentage(Math.round(moyenne * 100))} | ±1σ: ${dans1Sigma}/${n} (${formaterPourcentage(pct1Sigma)})
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

    // #775 — même règle que la répartition IDME de la branche voisine : une note qui
    // ne se construit pas encore n'est pas une note « inférieure à 60 % ». Sans ce
    // filtre, le même défaut survivait derrière la préférence « descriptions SOLO ».
    etudiants = etudiants.filter(e => !e.sansEvaluation && !e.nonConstructible);
    if (etudiants.length === 0) {
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
        messages.push(`${enReussite} ${window.pluriel(enReussite, 'étudiant·e', 'étudiant·es')} (${formaterPourcentage(pctReussite)}) ont une performance égale ou supérieure à la note de passage (60\u00a0%)`);
    }

    if (enDifficulte > 0) {
        messages.push(`${enDifficulte} ${window.pluriel(enDifficulte, 'étudiant·e', 'étudiant·es')} (${formaterPourcentage(pctDifficulte)}) sont en difficulté avec une performance inférieure à 60\u00a0%`);
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

    // #775 — même population que la répartition : une note non constructible n'est
    // pas une note en difficulté (« Parmi les 28 étudiant·es en difficulté… » alors
    // que la barre des patterns en donnait 24 stables).
    etudiants = etudiants.filter(e => !e.sansEvaluation && !e.nonConstructible);
    if (etudiants.length === 0) {
        return '';
    }

    // Lire les patterns stockés
    const patterns = db.getSync(cle('indicesPatternsRaI'), null) || db.getSync('indicesPatternsRaI', {});

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
        messages.push(`${objectifAtteint} ${window.pluriel(objectifAtteint, 'étudiant·e', 'étudiant·es')} (${formaterPourcentage(pct)}) ont atteint ou dépassé le niveau de maîtrise`);
    }

    // 2. Parmi les D, combien en progression (pattern favorable)
    const niveauD = parNiveau['D'] || [];
    const dEnProgression = niveauD.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && (pattern.pattern === 'Stable' || pattern.niveauRai === 1);
    });

    if (dEnProgression.length > 0) {
        messages.push(`${dEnProgression.length} ${window.pluriel(dEnProgression.length, 'étudiant·e', 'étudiant·es')} en Développement montrent une progression favorable et pourraient atteindre la maîtrise prochainement`);
    }

    // 3. Parmi les PS et les I, combien montrent des progrès (pattern pas difficulté persistante)
    // #1152 (27 oct. 2026) : « PS – Préstructurel » est sous I ; avant lui, ces étudiant·es étaient comptés au niveau I.
    const niveauI = ['PS', 'I'].flatMap(code => parNiveau[code] || []);
    const iAvecProgres = niveauI.filter(etudiant => {
        const pattern = patterns[etudiant.da];
        return pattern && pattern.pattern !== 'Difficulté persistante';
    });

    if (niveauI.length > 0) {
        if (iAvecProgres.length > 0) {
            messages.push(`Parmi les ${niveauI.length} ${window.pluriel(niveauI.length, 'étudiant·e', 'étudiant·es')} en difficulté, ${iAvecProgres.length} montrent des signes de progrès`);
        } else {
            messages.push(`${niveauI.length} ${window.pluriel(niveauI.length, 'étudiant·e', 'étudiant·es')} en difficulté nécessitent un accompagnement intensif`);
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

    // #775 — UN P STOCKÉ À 0 « NON CONSTRUCTIBLE » N'EST PAS UNE PERFORMANCE NULLE.
    // `portfolio.js` écrit `P = 0` + `noteConstructible: false` tant que la note du
    // cours ne se construit pas (PAN-Standards qui attend ses N résultats, config
    // portfolio en erreur…). Les compter ici les rangeait tous dans le premier niveau
    // de l'échelle : « Incomplet ou insuffisant : 28 » au premier artefact d'un
    // trimestre (retour terrain du 7 septembre 2026). MÊME RÈGLE que la moyenne
    // affichée au-dessus de la même barre (`genererBarreDistribution`), pour que le
    // chiffre et la répartition portent sur la même population.
    etudiants = etudiants.filter(e => !e.sansEvaluation && !e.nonConstructible);
    if (etudiants.length === 0) {
        return null;
    }

    // Lire l'échelle de performance active depuis localStorage
    // #575 — la mention d'un repli sur `echellesPerformance` est retirée : cette clé
    // n'était écrite nulle part, et son dernier lecteur (`convertirNiveauEnPourcentage`,
    // `portfolio.js`) a été supprimé avec le repli IDME qu'elle servait.
    let echelles = db.getSync(cle('echellesTemplates'), []);
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

// G-7 (#749, 11 sept. 2026) — CONSTAT PÉRIMÉ. `genererBadgePratique` et
// `genererBadgeSourceDonnees` vivaient ici et rendaient « Alternative - Maîtrise
// (IDME) » / « Source : PAN » sans pratique configurée ; mesuré le 11 : ZÉRO
// appelant depuis #303 (`genererIndicateurPratiqueOuCheckboxes` rend ''), et
// l'en-tête de contexte (mettreAJourContextesSections) n'affiche aucun badge de
// pratique. Le badge global est `window.genererBadgePratique` (main.js). Retirées.

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module du tableau de bord - aperçu
 * Appelée par main.js au chargement
 */
/**
 * Injecte la note explicative A-C-P du Suivi du groupe (#note-indicateurs) — #310.
 * Source UNIQUE partagée avec la Liste des étudiant·es :
 * genererExplicationCalculIndices() (etudiants.js). Le terme production/artefact y
 * suit la pratique active (impossible depuis le HTML statique : CSP `script-src 'self'`).
 * Le complément propre à cette page (mini-courbes de Gauss) est passé en argument.
 */
function mettreAJourNoteIndicateurs() {
    const el = document.getElementById('note-indicateurs');
    if (!el) return;
    if (typeof genererExplicationCalculIndices !== 'function') {
        console.warn('⚠️ genererExplicationCalculIndices indisponible — note A-C-P non injectée');
        return;
    }
    // Microcopy interne (pas de donnée utilisateur) propre à la page Suivi du groupe.
    const complementGauss = '<em class="u-texte-09" style="color: var(--gris-moyen)">'
        + '💡 Les mini-courbes de Gauss montrent la distribution du groupe. '
        + 'La ligne blanche = moyenne (μ), les pointillés = ±1 écart-type (σ).</em>';
    el.innerHTML = genererExplicationCalculIndices(complementGauss);
}

// === SAISIR UNE BULLE AU DOIGT (7 septembre 2026, #540) ===
//
// Retour de Grégoire depuis l'iPad : « j'ai du mal à saisir les bulles blanches
// dans les barres de dégradés ». Mesuré au code : une bulle fait 10 px
// (`.barre-etudiant`), là où la règle du projet demande 44 px de cible tactile
// — et elle BOUGE, `float-vertical` la fait osciller sans arrêt. Son journal le
// montre : cinq touchers de suite atterrissent sur `.barre-indicateur`, le fond
// de la barre, et pas une seule fois sur une bulle.
//
// ⚠ POURQUOI PAS UNE ZONE SENSIBLE DE 44 px PAR BULLE, le réflexe habituel :
// vingt-huit élèves sur une barre d'environ 700 px se tiennent à 25 px les uns
// des autres en moyenne, et bien moins là où la distribution se resserre. Des
// zones de 44 px s'y recouvriraient de part en part, et le toucher irait à la
// bulle du dessus — celle que l'empilement désigne, pas celle qu'on vise. On
// résout donc par DISTANCE : la bulle dont le centre est le plus proche du
// doigt, dans un rayon de tolérance. Déterministe, et jamais arbitraire.
//
// Uniquement sous pointeur grossier : à la souris, viser 10 px est un geste
// ordinaire, et un clic à côté doit continuer de désélectionner.
const RAYON_TOUCHER_BULLE = 22;   // 22 px de rayon = 44 px de cible, la règle du projet.

/**
 * La bulle la plus proche d'un point, dans un rayon donné.
 * Pure : elle ne lit pas le DOM, on lui passe les centres déjà mesurés.
 * @param {Array<{x:number,y:number,element:*}>} centres
 * @param {number} x - abscisse du doigt
 * @param {number} y - ordonnée du doigt
 * @param {number} rayon - au-delà, on considère que rien n'était visé
 * @returns {*|null} l'`element` du plus proche, ou null si aucun n'est assez près
 */
function bulleLaPlusProche(centres, x, y, rayon) {
    let gagnante = null;
    let meilleure = rayon * rayon;   // comparaison au carré : pas de racine à tirer
    for (const c of centres) {
        const dx = c.x - x;
        const dy = c.y - y;
        const d2 = dx * dx + dy * dy;
        // `<` et non `<=` : à égalité stricte la première rencontrée gagne, donc
        // l'ordre du DOM tranche — un résultat stable d'un toucher à l'autre.
        if (d2 < meilleure) {
            meilleure = d2;
            gagnante = c.element;
        }
    }
    return gagnante;
}

/**
 * Le doigt a touché la barre sans toucher de bulle : laquelle visait-il ?
 * Rend null hors pointeur grossier, hors d'une barre, ou si rien n'est assez près.
 */
// Le gestionnaire de clic est délégué au DOCUMENT : il voit passer TOUS les
// clics de l'application. La requête média se garde donc d'un clic à l'autre —
// et un `MediaQueryList` reste vivant, son `.matches` suit l'appareil (une
// souris branchée sur l'iPad le fait basculer).
let _pointeurGrossier = null;
function pointeurEstGrossier() {
    if (!window.matchMedia) return false;
    if (!_pointeurGrossier) _pointeurGrossier = window.matchMedia('(pointer: coarse)');
    return _pointeurGrossier.matches;
}

function pointLePlusProcheDuToucher(e) {
    if (!pointeurEstGrossier()) return null;
    if (!e.target || !e.target.closest) return null;
    const barre = e.target.closest('.barre-indicateur');
    if (!barre) return null;

    // Les bulles de CETTE barre seulement : deux distributions voisines ne
    // doivent pas se voler un toucher.
    const centres = [];
    barre.querySelectorAll('.barre-etudiant').forEach(function(el) {
        // `getBoundingClientRect` donne la position ANIMÉE du moment, pas celle
        // du style au repos : c'est bien là que la bulle était sous le doigt.
        const r = el.getBoundingClientRect();
        centres.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, element: el });
    });
    return bulleLaPlusProche(centres, e.clientX, e.clientY, RAYON_TOUCHER_BULLE);
}

function initialiserModuleTableauBordApercu() {

    // Charger les statistiques si la sous-section aperçu est active
    const apercu = document.getElementById('apercu-contenu');
    if (apercu && apercu.classList.contains('active')) {
        chargerTableauBordApercu();
    }

    // Note #note-indicateurs : injectée par chargerTableauBordApercu() à chaque rendu (#310).

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
                // #754 : afficherProfilComplet active lui-même la sous-section Profil (un seul rendu).
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

            // Ouvrir/fermer le panneau suivi selon l'état du bouton
            var panneauSuivi = document.getElementById('panneau-suivi-etudiants');
            if (panneauSuivi && btn) {
                if (btn.classList.contains('actif')) {
                    panneauSuivi.classList.add('ouvert');
                } else {
                    panneauSuivi.classList.remove('ouvert');
                }
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
        const point = e.target.closest('.barre-etudiant')
            || pointLePlusProcheDuToucher(e);

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

    // Note explicative A-C-P (#note-indicateurs) — réinjectée à chaque rendu pour
    // que le terme production/artefact suive la pratique active courante (#310).
    mettreAJourNoteIndicateurs();

    // 🆕 FIX #220 (3 mars 2026) : Régénérer les séances complètes du groupe-cours actif
    // AVANT de calculer l'assiduité. Les seancesCompletes en cache peuvent être stale
    // (générées avec un horaire partagé au lieu de l'horaire spécifique au groupe-cours).
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes(null);
    }

    // 🔄 BETA 95.7: Calculer les indices A avant l'affichage.
    // G-8 (#749, 11 sept. 2026) : cet appel CHAÎNE déjà calculerEtStockerIndicesCP
    // (indices.js, fin de calculerEtSauvegarderIndicesAssiduite) — l'appel direct
    // qui suivait ici écrivait `<trim>_indicesCP` une seconde fois, pour le même
    // résultat. Retiré ; prouvé par la sentinelle #749 (2 écritures avant, 1 après).
    if (typeof calculerEtSauvegarderIndicesAssiduite === 'function') {
        calculerEtSauvegarderIndicesAssiduite();
    }

    // 🔄 BETA 95.7: Rafraîchir aussi la liste des étudiants pour synchronisation
    if (typeof afficherListeEtudiantsConsultation === 'function') {
        afficherListeEtudiantsConsultation();
    }

    // 🆕 BETA 91: Calculer et stocker les patterns + RàI pour tout le groupe (si RàI activé)
    const raiActive = obtenirPreference('activerRai') !== false;

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
        const titre = document.querySelector('#apercu-contenu h2');
        if (titre) {
            // Session C (#303) : mode comparatif retiré — plus de calcul de mode ici.
            titre.innerHTML = '';
            const conteneurTitre = document.createElement('div');

            // Layout uniforme : titre à gauche, badges à droite
            conteneurTitre.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
            conteneurTitre.innerHTML = `
                <span>Aperçu</span>
                ${genererIndicateurPratiqueOuCheckboxes()}
            `;

            titre.appendChild(conteneurTitre);
        }

        // Afficher tout (sans noms d'étudiants dans l'aperçu)
        afficherMetriquesGlobales(etudiantsAvecIndices);

        // Afficher RàI et Patterns uniquement si activé dans les réglages
        const activerRai = obtenirPreference('activerRai') !== false;

        // #906 (19 sept. 2026) : la liste enrichie (RàI, suivi des fondations) est rafraîchie AVANT
        // les barres qui la lisent — la phrase du bilan des fondamentaux et la ligne de fiabilité
        // (`_tousEtudiantsEnrichis`). Calculée après, elles décrivaient le groupe du rendu précédent.
        // Un seul calcul par rendu ; aucun accès au DOM ici, les couleurs se posent plus bas.
        calculerEtudiantsPrioritaires();

        if (activerRai) {
            afficherPatternsApprentissage(etudiantsAvecIndices);
            afficherNiveauxRaI(etudiantsAvecIndices);
        }

        // 🆕 BETA 98.9: Alerte nommée pour élèves en non-participation
        afficherAlerteNonParticipation(etudiantsAvecIndices);
        afficherSignalementsDepistage(etudiantsAvecIndices);   // #790

        // 🆕 BETA 96: Afficher le graphique spaghetti ACP (évolution temporelle par étudiant)
        // ✅ CORRECTIF (2 mars 2026): Lire la valeur actuelle du dropdown au lieu de hardcoder 'A'
        if (typeof creerGraphiqueGroupeSpaghettiACP === 'function') {
            const selecteurIndice = document.getElementById('selecteur-indice-acp');
            const indiceActif = selecteurIndice ? selecteurIndice.value : 'A';
            creerGraphiqueGroupeSpaghettiACP('graphique-groupe-moyennes', indiceActif);
        } else {
            console.warn('⚠️ creerGraphiqueGroupeSpaghettiACP non disponible - Module graphiques-progression.js non chargé ?');
        }

        // Trajectoires par production (note finale ou habiletés selon Mesure choisie)
        if (typeof initialiserCarteTrajectoiresProduction === 'function') {
            initialiserCarteTrajectoiresProduction();
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

        // Couleurs des étudiants prioritaires, sur la liste calculée plus haut (#906). Le compteur
        // `#compteur-prioritaire` vivait dans le panneau mort `#panneau-prioritaire`, retiré — G-5 #749.
        appliquerCouleursPrioritaires();

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
 * Génère une interprétation du suivi de l'apprentissage des fondamentaux.
 * S'appuie sur les diagnostics IPB × direction de _tousEtudiantsEnrichis.
 * @returns {string} Message d'interprétation HTML
 */
function genererInterpretationSuiviFondamentaux() {
    if (!_tousEtudiantsEnrichis || _tousEtudiantsEnrichis.length === 0) return '';

    // Grouper par diagnostic IPB
    var compteurs = {};
    var total = 0;
    _tousEtudiantsEnrichis.forEach(function(e) {
        if (!e.suivi || !e.suivi.diagnostic) return;
        var d = e.suivi.diagnostic;
        compteurs[d] = (compteurs[d] || 0) + 1;
        total++;
    });

    if (total === 0) return '';

    // Regrouper par niveau de préoccupation
    var maitrise = (compteurs['Maîtrise acquise'] || 0) + (compteurs['Difficulté résolue'] || 0);
    var progression = compteurs['Progression'] || 0;
    var plateau = compteurs['Plateau'] || 0;
    // #744 (lot C, 17 sept. 2026) : le suivi des fondations dit « Difficulté récente »
    // (IPB = 1, → ou ↘) ; « Difficulté émergente » est le pattern de la carte RàI, pas le sien.
    var recente = compteurs['Difficulté récente'] || 0;
    // ⚠ « Progression lente » (IPB ≥ 3, ↗) entre dans `total` et dans aucune phrase :
    // constat du 17 sept., laissé tel quel — la phrase à écrire est un mot de Grégoire.
    var constante = compteurs['Difficulté constante'] || 0;
    var persistante = compteurs['Difficulté persistante'] || 0;

    function pct(n) { return Math.round((n / total) * 100); }

    var messages = [];

    // Fondamentaux acquis (IPB 0-1, ↗). #1117, suite : observation SOLO désactivée,
    // le suivi lit tous les critères — « multistructurels » tombe (texte provisoire).
    if (maitrise > 0) {
        messages.push(maitrise + ' ' + window.pluriel(maitrise, 'étudiant·e', 'étudiant·es') + ' (' + formaterPourcentage(pct(maitrise)) + ') ' +
            (maitrise > 1 ? 'maîtrisent' : 'maîtrise') + ' les fondamentaux' +
            (etiquettesSOLOLuesParDepistage() ? ' multistructurels' : ''));
    }

    // En progression (IPB 2, ↗)
    if (progression > 0) {
        messages.push(progression + ' (' + formaterPourcentage(pct(progression)) + ') en progression vers la maîtrise');
    }

    // Plateau (IPB 2, →)
    if (plateau > 0) {
        messages.push(plateau + ' (' + formaterPourcentage(pct(plateau)) + ') en plateau — consolidation ou stagnation à surveiller');
    }

    // Difficultés actives (récente + constante + persistante)
    var diffActives = recente + constante + persistante;
    if (diffActives > 0) {
        var details = [];
        if (recente > 0) details.push(recente + ' récente' + (recente > 1 ? 's' : ''));
        if (constante > 0) details.push(constante + ' constante' + (constante > 1 ? 's' : ''));
        if (persistante > 0) details.push(persistante + ' persistante' + (persistante > 1 ? 's' : ''));
        messages.push(diffActives + ' (' + formaterPourcentage(pct(diffActives)) + ') en difficulté sur les fondamentaux (' + details.join(', ') + ')');
    }

    if (messages.length === 0) return '';

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
        interpretation = `La répartition RàI indique une efficacité satisfaisante de l'enseignement universel (${niveau1} étudiants, ${formaterPourcentage(pctNiveau1)} au Niveau 1). `;
    } else if (pctNiveau1 >= 60) {
        interpretation = `La répartition RàI indique une efficacité acceptable de l'enseignement universel (${niveau1} étudiants, ${formaterPourcentage(pctNiveau1)} au Niveau 1). `;
    } else {
        interpretation = `La répartition RàI suggère que l'enseignement universel pourrait être renforcé (${niveau1} étudiants, ${formaterPourcentage(pctNiveau1)} au Niveau 1). `;
    }

    // Compléter avec Niveau 2 et 3
    if (niveau2 > 0) {
        interpretation += `${niveau2} étudiants (${formaterPourcentage(pctNiveau2)}) nécessitent des interventions préventives ciblées. `;
    }

    if (niveau3 > 0) {
        interpretation += `${niveau3} étudiants (${formaterPourcentage(pctNiveau3)}) requièrent un accompagnement intensif individualisé.`;
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
    // Session C (#303) : mode comparatif retiré — plus de double badge SOM/PAN.
    // En mode simple, aucun badge ici : la pratique active est déjà dans l'en-tête.
    return '';
}


// calculerIndicesEtudiant, calculerEngagement, determinerNiveauEngagement → déplacés dans indices.js (#206)

/* ===============================
   AFFICHAGE DES MÉTRIQUES
   =============================== */

/**
 * Détermine la couche à afficher dans la section « Observation globale » du
 * tableau de bord. Point unique de vérité : on suit TOUJOURS la pratique de
 * notation ACTIVE du groupe (sommative → SOM, sinon → PAN). Le mode comparatif
 * (deux couches) a été retiré (Session C, #303) ; ce helper ne renvoie donc
 * jamais les deux à true.
 *
 * @param {object} config - objet modalitesEvaluation (pratique active)
 * @returns {{afficherSom: boolean, afficherPan: boolean}}
 */
function determinerModeAffichageTableauBord(config) {
    // Session C (#303) : mode comparatif RETIRÉ. Point unique de neutralisation —
    // on renvoie TOUJOURS une seule couche, celle de la pratique ACTIVE du groupe
    // (sommative → SOM, sinon → PAN). Les clés afficherSommatif/afficherAlternatif
    // (qui pouvaient être les deux à true = comparatif, ou poser un override) ne sont
    // plus honorées : ce seul point garantit qu'aucun rendu n'affiche deux couches.
    // #328 L2-b2 : type dérivé de la SSOT (le paramètre config reste pour les
    // autres champs des appelants, plus pour la pratique).
    // Lot N1b (21 sept. 2026) : plus de repli PRATIQUE_DEFAUT. Sans pratique assignée (null), la couche
    // reste « PAN » : c'est une COUCHE D'AFFICHAGE, elle ne calcule rien — C et P s'y lisent « — ».
    const pratiqueActive = (typeof obtenirTypePratiqueActive === 'function'
        ? obtenirTypePratiqueActive()
        : null);
    const estSommative = pratiqueActive === 'sommative';
    return { afficherSom: estSommative, afficherPan: !estSommative };
}

// #830 — phrase validée par Grégoire le 23 sept. 2026, mot pour mot.
const TEXTE_A_SANS_PERIODES = 'Assiduité non calculée : aucune séance de l\'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire.';

/**
 * #830 — vrai quand l'horaire a des séances et qu'AUCUNE ne porte un nombre de périodes.
 * Même lecture que le dénominateur de l'assiduité (`obtenirPeriodesPrevuesParHoraire`,
 * saisie-presences.js) : `parseInt(nombrePeriodes) > 0`. Un horaire vide rend faux : la
 * phrase parle de séances qui existent.
 * @param {Array} seances - séances de `obtenirSeancesHoraire()` (format déclaré déjà projeté)
 * @returns {boolean}
 */
function horaireSansAucunePeriode(seances) {
    if (!Array.isArray(seances) || seances.length === 0) return false;
    return !seances.some(s => s && parseInt(s.nombrePeriodes, 10) > 0);
}

/**
 * Combien d'évaluations le groupe doit avoir avant que P se calcule — la ligne
 * « N évaluations en attente » du tableau de bord.
 *
 * Ordre : la pratique active, sinon `config.portfolio` des modalités, sinon 3.
 *
 * ⮕ #634 (11 oct. 2026) — LA PRATIQUE ACTIVE SE LIT COMME LA LIT LA NOTE. Le moteur passe
 * par `obtenirConfigPratiqueActive()` (portfolio.js) : pointeur du groupe-cours, id brut
 * puis normalisé (#711), forme `.configuration` ou `.config` (#712), et 7 quand le
 * portfolio ne dit pas son minimum (profil-etudiant-actions.js). L'aperçu cherchait l'id
 * brut, en `.configuration`, `.portfolio` ou `.regles` : sur une pratique importée, ou
 * désignée par un id ancien, il annonçait un autre seuil que celui de la note.
 * ⚠ La clé `bibliothequePratiques` n'est toujours pas consultée :
 * le moteur ne la lit pas non plus (#626 avait retiré un repli qui ne trouvait rien).
 * G2-b (#436, 9 août 2026) : le miroir `configPAN.portfolio` est retiré du repli — il ne se
 * rafraîchit qu'à l'APPLICATION d'une pratique. `config.portfolio` (racine des modalités) reste.
 *
 * @param {Object} config - modalitesEvaluation
 * @returns {number}
 */
function seuilEvaluationsPourP(config) {
    const configPratique = (typeof obtenirConfigPratiqueActive === 'function') ? obtenirConfigPratiqueActive() : null;
    const portfolioPratique = configPratique && configPratique.portfolio;
    if (portfolioPratique) return portfolioPratique.minimumCompletion || 7;
    const configPortfolio = (config && config.portfolio) || {};
    if (configPortfolio.minimumCompletion !== undefined) return configPortfolio.minimumCompletion;
    return 3;
}

/**
 * Affiche les métriques globales du groupe avec barres de distribution
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {Array} etudiants - Étudiants avec indices calculés
 */
function afficherMetriquesGlobales(etudiants) {
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    let { afficherSom, afficherPan } = determinerModeAffichageTableauBord(config);

    // 🆕 BETA 95.7 (22 jan) : Calculer "en attente" au niveau du GROUPE
    // Compter les données disponibles pour le groupe entier :
    // - Séances = dates distinctes où des présences ont été saisies
    // - Évaluations = productions distinctes évaluées

    // Compter le nombre de séances du groupe (dates distinctes avec présences)
    // #1013 (décision de Grégoire, 4 oct. 2026) : les présences et les évaluations d'un élève
    // supprimé n'entrent plus dans les seuils du groupe.
    const supprimes = typeof window.dasElevesSupprimes === 'function' ? window.dasElevesSupprimes() : new Set();
    let presences = obtenirDonneesSelonMode('presences') || [];
    if (!Array.isArray(presences)) presences = [];
    presences = presences.filter(p => !p.da || !supprimes.has(String(p.da)));
    const datesSeances = [...new Set(presences.filter(p => !p.facultatif).map(p => p.date))];
    const nbSeancesGroupe = datesSeances.length;

    // Compter le nombre d'évaluations du groupe (productions distinctes évaluées)
    let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    if (!Array.isArray(evaluations)) evaluations = [];
    evaluations = evaluations.filter(e => !e.etudiantDA || !supprimes.has(String(e.etudiantDA)));
    // #1055 : le travail diagnostique ne compte pas parmi les productions évaluées du groupe.
    evaluations = window.ProductionDiagnostique.filtrerEvaluations(evaluations, obtenirDonneesSelonMode('productions'));
    const productionsDistinctes = [...new Set(evaluations.filter(function(e) { return !e.remplaceeParId; }).map(e => e.productionId || e.artefactId))];
    const nbEvaluationsGroupe = productionsDistinctes.length;

    // Seuils minimaux par indice
    // - A : 1 séance suffit
    // - C : 1 évaluation suffit
    // - P : configurable via "Nb minimal d'évaluations pour calculer P" (minimumCompletion)
    const seuilA = 1;
    const seuilC = 1;

    // Le seuil P : la pratique active (même résolution que la note, #634), sinon les modalités, sinon 3.
    const seuilP = seuilEvaluationsPourP(config);

    // Calculer ce qui manque (0 si le seuil est atteint)
    const seancesManquantesA = Math.max(0, seuilA - nbSeancesGroupe);
    const evalsManquantesC = Math.max(0, seuilC - nbEvaluationsGroupe);
    const evalsManquantesP = Math.max(0, seuilP - nbEvaluationsGroupe);

    // Générer les textes explicites "en attente"
    const texteAttenteA = seancesManquantesA > 0
        ? `${seancesManquantesA} séance${seancesManquantesA > 1 ? 's' : ''} en attente` : '';
    const texteAttenteC = evalsManquantesC > 0
        ? `${evalsManquantesC} évaluation${evalsManquantesC > 1 ? 's' : ''} en attente` : '';
    const texteAttenteP = evalsManquantesP > 0
        ? `${evalsManquantesP} évaluation${evalsManquantesP > 1 ? 's' : ''} en attente` : '';


    // Debug: Vérifier les indices A des étudiants
    const indicesADebug = obtenirDonneesSelonMode('indicesAssiduite') || {};
    if (Object.keys(indicesADebug.alternatif || {}).length > 0) {
        const premierDA = Object.keys(indicesADebug.alternatif)[0];
    }

    // 🆕 BETA 95.7 (22 jan): Filtrage spécifique pour A (présences saisies, même si A=0%)
    // Pour A : inclure TOUS les élèves dont l'assiduité est CONNUE (y compris les absents à 0 %).
    // #743 / #750 (lot D, 19 sept. 2026) : la question « connue ? » a UNE réponse, celle de l'indice
    // (`assiduite !== null`, rendue par `lireIndiceAssiduite`) — la même que la moyenne A de la Liste.
    // Avant : `nombreSeances > 0`, vrai aussi pour des séances sans période offerte (valeur absente).
    const assiduiteConnue = (bloc) => !!bloc && bloc.assiduite !== null && bloc.assiduite !== undefined;
    const etudiantsAvecPresencesSOM = etudiants.filter(e => assiduiteConnue(e.sommatif));
    const etudiantsAvecPresencesPAN = etudiants.filter(e => assiduiteConnue(e.alternatif));

    // #830 (23 sept. 2026) — la barre A dit POURQUOI elle est vide : un horaire dont aucune séance ne
    // porte son nombre de périodes — le dénominateur de A vaut 0 partout, aucun élève n'a d'assiduité
    // connue. Sans présence saisie, « N séance en attente » garde la priorité (cas inchangé). Mesuré :
    // le cache des séances suit l'horaire et le rendu recalcule A — aucun A connu ne survit à cet
    // horaire, d'où l'absence de garde côté élèves.
    const texteBarreA = texteAttenteA || (
        horaireSansAucunePeriode(typeof obtenirSeancesHoraire === 'function' ? obtenirSeancesHoraire() : [])
            ? TEXTE_A_SANS_PERIODES : '');

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
        assiduiteConnue(e.sommatif) && (ilYaDesEvalsSOM || e.sommatif.completion > 0 || e.sommatif.performance > 0)
    );
    const etudiantsAvecDonneesPAN = etudiants.filter(e =>
        assiduiteConnue(e.alternatif) && (ilYaDesEvalsPAN || e.alternatif.completion > 0 || e.alternatif.performance > 0)
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
        sansEvaluation: e.sommatif.completion === 0 && e.sommatif.performance === 0,
        // #394 (règle 4) : P stocké « non constructible » → point distinct, pas un 0
        nonConstructible: e.sommatif.noteConstructible === false
    }));

    const etudiantsPAN_P = etudiantsPourP_PAN.map(e => ({
        da: e.da,
        nom: e.nom,
        prenom: e.prenom,
        valeur: e.alternatif.performance,
        sansEvaluation: e.alternatif.completion === 0 && e.alternatif.performance === 0,
        nonConstructible: e.alternatif.noteConstructible === false
    }));

    // 🆕 BETA 91: Calculer les corrélations A-P et C-P pour interprétation
    // Utiliser la pratique active (SOM ou PAN) pour les corrélations
    const valeursA = afficherPan ? etudiantsPAN_A.map(e => e.valeur) : etudiantsSOM_A.map(e => e.valeur);
    const valeursC = afficherPan ? etudiantsPAN_C.map(e => e.valeur) : etudiantsSOM_C.map(e => e.valeur);
    const valeursP = afficherPan ? etudiantsPAN_P.map(e => e.valeur) : etudiantsSOM_P.map(e => e.valeur);

    const r_AP = calculerCorrelationPearson(valeursA, valeursP);
    const r_CP = calculerCorrelationPearson(valeursC, valeursP);

    // 🆕 BETA 96: Utiliser l'ID de la carte au lieu de chercher par texte
    const carteIndicateurs = document.getElementById('carte-indicateurs-acpe');

    if (!carteIndicateurs) return;

    // Conserver le header, les panneaux et la note toggle AVANT de vider
    const noteToggle = carteIndicateurs.querySelector('.carte-info-toggle');
    const header = carteIndicateurs.querySelector('h3');
    const panneauSuivi = carteIndicateurs.querySelector('#panneau-suivi-etudiants');
    // G-5 (#749) : `#panneau-prioritaire` n'existe plus — il n'était jamais ouvert.

    // Sauvegarder le HTML des éléments à préserver
    const headerHTML = header ? header.outerHTML : '';
    const panneauSuiviHTML = panneauSuivi ? panneauSuivi.outerHTML : '';
    const noteToggleHTML = noteToggle ? noteToggle.outerHTML : '';

    // Vider et reconstruire avec header, panneau et note
    const panneauEtaitOuvert = panneauSuivi && panneauSuivi.classList.contains('ouvert');
    carteIndicateurs.innerHTML = headerHTML + panneauSuiviHTML + noteToggleHTML;

    // Regénérer le contenu du panneau s'il était ouvert
    if (panneauEtaitOuvert) {
        genererPanneauSuiviEtudiants();
    }

    // Bloc 6b des textes relus (15 oct. 2026, Grégoire) : plus de légende chiffrée sous le dégradé.
    // Elle ne portait que quatre repères (30-47,5 % … ≥ 82,5 %), la barre coupée en quarts, que rien
    // de pédagogique ne fonde ; la bulle « Observer » dit ce que le point représente. Le dégradé et
    // la position des couleurs ne bougent pas (`ARRETS_DEGRADE`).

    // 🆕 BETA 95.7 (22 jan) : Passer le texte explicite "en attente" à chaque barre
    const nbTotal = etudiants.length;

    // Session C (#303) : mode comparatif retiré — libellés simples (la pratique
    // active est signalée par le badge d'en-tête).
    const labelA = 'Assiduité (A)';
    const labelC = 'Complétion (C)';
    const labelP = 'Performance (P)';

    // Générer les 4 barres de distribution avec interprétations
    const html = `
        <div class="tb-p-20">
            ${genererBarreDistribution(labelA, etudiantsSOM_A, etudiantsPAN_A, 'A', afficherSom, afficherPan, r_AP, texteBarreA, nbTotal)}
            ${genererBarreDistribution(labelC, etudiantsSOM_C, etudiantsPAN_C, 'C', afficherSom, afficherPan, r_CP, texteAttenteC, nbTotal)}
            ${genererBarreDistribution(labelP, etudiantsSOM_P, etudiantsPAN_P, 'P', afficherSom, afficherPan, null, texteAttenteP, nbTotal)}
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
 * Génère une barre de distribution visuelle pour A, C ou P
 * Chaque étudiant est représenté par une ligne verticale sur l'échelle
 *
 * @param {string} label - Nom de la métrique (ex: "Assiduité")
 * @param {Array} etudiantsSOM - [{da, nom, prenom, valeur}] pour SOM
 * @param {Array} etudiantsPAN - [{da, nom, prenom, valeur}] pour PAN
 * @param {string} type - Type de métrique ('A', 'C', 'P')
 * @param {boolean} afficherSom - Afficher la couche SOM
 * @param {boolean} afficherPan - Afficher la couche PAN
 * @returns {string} HTML de la barre de distribution
 */
function genererBarreDistribution(label, etudiantsSOM, etudiantsPAN, type, afficherSom, afficherPan, correlation = null, texteAttente = '', nbTotal = 0) {

    // Dégradé CONTINU, sans mot (#821, 15 oct. 2026) : orange,
    // jaune, vert, bleu, posés aux positions 0 / 25 / 50 / 75 % de la barre.
    // ⚠ Ce commentaire portait « 30-49% → 50-64% → 65-79% → ≥80% » : les mêmes
    // arrondis faits à la main que la légende, et faux comme elle. Les scores
    // réels des arrêts sont calculés par scoreALaPositionDistribution().
    // #818 — construite depuis ARRETS_DEGRADE : la chaîne CSS, l'interpolation
    // de couleur et les libellés de la légende ne peuvent plus diverger.
    const gradient = `linear-gradient(to right, ${ARRETS_DEGRADE.map(a => `${a.couleur} ${a.position}%`).join(', ')})`;

    // Calculer les moyennes pour affichage
    // 🆕 BETA 98.9: Exclure les élèves sansEvaluation du calcul de moyenne P
    let moyenneSOM = null;
    let moyennePAN = null;

    if (afficherSom && etudiantsSOM.length > 0) {
        const etudiantsAvecEvalSOM = etudiantsSOM.filter(e => !e.sansEvaluation && !e.nonConstructible);
        if (etudiantsAvecEvalSOM.length > 0) {
            const somme = etudiantsAvecEvalSOM.reduce((acc, e) => acc + e.valeur, 0);
            moyenneSOM = Math.round((somme / etudiantsAvecEvalSOM.length) * 100);
        }
    }

    if (afficherPan && etudiantsPAN.length > 0) {
        const etudiantsAvecEvalPAN = etudiantsPAN.filter(e => !e.sansEvaluation && !e.nonConstructible);
        if (etudiantsAvecEvalPAN.length > 0) {
            const somme = etudiantsAvecEvalPAN.reduce((acc, e) => acc + e.valeur, 0);
            moyennePAN = Math.round((somme / etudiantsAvecEvalPAN.length) * 100);
        }
    }

    // 🆕 BETA 91: Générer l'interprétation de la corrélation ou distribution P
    let interpretationHTML = '';

    // PRIORITÉ 1: Distribution P ou diagnostic note de passage
    if (type === 'P' && (etudiantsSOM.length > 0 || etudiantsPAN.length > 0)) {
        const etudiants = afficherPan ? etudiantsPAN : etudiantsSOM;
        const soloActive = obtenirPreference('afficherDescriptionsSOLO') !== false;
        const raiActive = obtenirPreference('activerRai') !== false;


        if (soloActive) {
            // 🆕 BETA 91: Distribution IDME + interprétation (si RàI activé)

            const distribution = calculerDistributionPerformance(etudiants);
            // #775 — combien restent hors de la répartition, et pourquoi : rien ne
            // disparaît en silence de la carte.
            const nbSansNote = etudiants.filter(e => e.sansEvaluation || e.nonConstructible).length;

            let interpretation = '';

            if (raiActive) {
                // Interprétation pédagogique avancée avec patterns
                const echelles = db.getSync(cle('echellesTemplates'), []);
                const echelleId = db.getSync('echellePerformanceActive', 'idme-5niv');
                let echelle = echelles.find(e => e.id === echelleId);
                if (!echelle) {
                    echelle = echelles.find(e => e.parDefaut === true) || echelles[0];
                }

                interpretation = echelle ? genererInterpretationPerformance(etudiants, echelle) : '';
            }

            if (distribution) {
                const mentionSansNote = nbSansNote > 0
                    ? `<div class="u-mt-6">${nbSansNote} ${window.pluriel(nbSansNote, 'étudiant·e', 'étudiant·es')} sans note constructible ${window.pluriel(nbSansNote, 'n\'est pas réparti·e', 'ne sont pas réparti·es')}.</div>`
                    : '';
                interpretationHTML = `
                    <div class="tb-texte-description">
                        <div><span class="u-texte-gras">Distribution : </span>${distribution}</div>
                        ${interpretation ? `<div class="u-mt-6">${interpretation}</div>` : ''}
                        ${mentionSansNote}
                    </div>
                `;
            } else if (nbSansNote > 0) {
                // #775 — personne n'a encore de note constructible : le dire, plutôt que
                // de laisser la barre muette ou, pire, de ranger tout le groupe dans le
                // premier niveau de l'échelle.
                interpretationHTML = `
                    <div class="tb-texte-description">
                        La note du cours ne se construit pas encore : il n'y a rien à répartir. Le dépistage, lui, s'appuie sur les ${echapperHtml(obtenirTermeProduction('pluriel'))} déjà ${accordTermeProduction('evalue', 2)}.
                    </div>
                `;
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
            explication = `Les étudiants assidus en classe ont une tendance ${forceAdjectif} à obtenir de meilleures performances. (r(${type}↔P) = ${formaterNombre(correlation, 3)})`;
        } else if (type === 'C') {
            explication = `Les étudiants qui remettent plus de travaux ont une tendance ${forceAdjectif} à avoir de meilleures notes. (r(${type}↔P) = ${formaterNombre(correlation, 3)})`;
        }

        interpretationHTML = `
            <div class="tb-texte-description">
                ${explication}
            </div>
        `;
    }
    // 🆕 BETA 96: Fonction pour interpoler la couleur du gradient selon la position
    // Gradient: orange (0%) → jaune (25%) → vert (50%) → bleu (75%+)
    function obtenirCouleurGradient(positionPourcent) {
        // Stops du gradient (position en % de la barre → couleur)
        // #818 — les MÊMES arrêts que la chaîne CSS et la légende, plus un
        // plateau jusqu'à 100 % : passé le dernier arrêt, la teinte ne bouge plus.
        const rvb = (hex) => ({
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        });
        const stops = ARRETS_DEGRADE.map((a) => ({ pos: a.position, ...rvb(a.couleur) }));
        stops.push({ pos: 100, ...rvb(ARRETS_DEGRADE[ARRETS_DEGRADE.length - 1].couleur) });

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
                const position = positionSurEchelleDistribution(e.valeur);
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
                const classesSansEval = (e.sansEvaluation || e.nonConstructible) ? ' barre-etudiant-sans-eval' : '';
                const tooltipValeur = e.nonConstructible ? 'note non constructible' : (e.sansEvaluation ? `${accordTermeProduction('aucun', 1)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}` : formaterPourcentage(Math.round(e.valeur * 100)));
                                lignesSOM += `<div class="barre-etudiant barre-etudiant-som${classesSansEval}"
                    style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${(e.sansEvaluation || e.nonConstructible) ? '' : formaterPourcentage(Math.round(e.valeur * 100))}"
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
                const position = positionSurEchelleDistribution(e.valeur);
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
                const classesSansEval = (e.sansEvaluation || e.nonConstructible) ? ' barre-etudiant-sans-eval' : '';
                const tooltipValeur = e.nonConstructible ? 'note non constructible' : (e.sansEvaluation ? `${accordTermeProduction('aucun', 1)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('evalue', 1)}` : formaterPourcentage(Math.round(e.valeur * 100)));
                                lignesPAN += `<div class="barre-etudiant barre-etudiant-std${classesSansEval}"
                    style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
                    data-da="${e.da}"
                    data-nom="${echapperHtml(nomAffiche)}"
                    data-valeur="${(e.sansEvaluation || e.nonConstructible) ? '' : formaterPourcentage(Math.round(e.valeur * 100))}"
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
        positionMoyenne = positionSurEchelleDistribution(moyenneDecimal);
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
            const nbAvecEval = etudiantsRef.filter(e => !e.sansEvaluation && !e.nonConstructible).length;
            const nbSans = etudiantsRef.length - nbAvecEval;
            titreInfo = ` title="Moyenne sur ${nbAvecEval} étudiant·e·s ayant au moins 1 évaluation (${nbSans} exclu·e·s). La liste des individus inclut tous les étudiant·e·s."`;
        }
        moyennePositionneeHTML = `<div${titreInfo} style="cursor: help; position: absolute; top: -20px; left: ${positionMoyenne}%; transform: translateX(-50%); z-index: 10; font-size: 0.9rem; font-weight: 700; color: ${couleurMoyenne};">${formaterPourcentage(moyenneAffichee)}</div>`;
    }

    return `
        <div class="distribution-container u-mb-20">
            <h4 class="tb-titre-simple" style="margin-bottom: 4px;" data-tooltip="${{A:'tdb-assiduite',C:'tdb-completion',P:'tdb-performance'}[type]}">${label}</h4>
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
 * Le sous-titre de la barre des patterns : les critères multistructurels que le
 * dépistage surveille. Lot 4, volet B (4 sept. 2026) : quand la grille a des critères
 * mais qu'aucun n'est multistructurel (tous « Aucun », ou tous relationnels ou
 * abstraits), l'écran le DIT au lieu de se taire — le suivi des fondations n'a rien à
 * lire, et ce silence se prenait pour un chargement raté. Sans grille, rien.
 *
 * #1117, suite (20 oct. 2026) : la liste vient de `criteresSuiviFondations`
 * (`profil-etudiant-helpers.js`), celle-là même que lit `calculerIPB` — ce que la
 * barre annonce est ce que le calcul lit. Observation SOLO désactivée, tous les
 * critères sont surveillés, et la phrase le dit (Grégoire, 6 h 48 : « l'application
 * doit le dire quelque part »). Texte provisoire.
 * @param {Object|null} grille - la grille de référence du dépistage
 * @returns {string} HTML échappé
 */
function libelleCriteresMultiSurveilles(grille) {
    if (!grille || !Array.isArray(grille.criteres) || grille.criteres.length === 0) return '';
    var noms = criteresSuiviFondations(grille).map(function(c) { return c.nom; });
    if (!etiquettesSOLOLuesParDepistage()) {
        return 'Observation SOLO désactivée : tous les critères sont surveillés (' + echapperHtml(noms.join(', ')) + ').';
    }
    if (noms.length > 0) return 'Critères multistructurels surveillés : ' + echapperHtml(noms.join(', '));
    return 'Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien.';
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
    // Lire les critères multistructurels pour le sous-titre contextuel
    var libelleMulti = libelleCriteresMultiSurveilles(
        typeof obtenirGrilleReferenceDepistage === 'function' ? obtenirGrilleReferenceDepistage() : null);
    // Sous-titre + 2 micro-actions (édition critères, choix grille dépistage).
    // Toujours rendu : si pas de critères, le libellé est vide mais les boutons restent accessibles.
    var barreActionsSolo = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; flex-wrap: wrap;">
            <div style="color: var(--texte-muted); font-size: 0.8rem; flex: 1; min-width: 0;">${libelleMulti}</div>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button type="button" class="btn btn-secondaire btn-tres-compact"
                        data-action="naviguerVers" data-param="conception" data-param2="grille-criteres"
                        title="Modifier les critères et leurs niveaux SOLO">
                    Critères
                </button>
                <button type="button" class="btn btn-secondaire btn-tres-compact"
                        data-action="ouvrirReferenceSoloAccompagnement"
                        title="Choisir la grille de critères pour le dépistage SOLO">
                    Paramètres d'accompagnement
                </button>
            </div>
        </div>
    `;
    // 🆕 BETA 95.6 : Gérer le cas où tous les étudiants sont sans données
    const nbAvecDonnees = (afficherPan ? etudiantsPAN.length : etudiantsSOM.length) || 0;
    const tousEnAttente = nbTotal > 0 && nbAvecDonnees === 0;

    if (tousEnAttente) {
        return `
            <div class="distribution-container u-mb-15">
                <h4 class="tb-titre-metrique" data-tooltip="tdb-patterns">Structure des apprentissages fondamentaux (SOLO)</h4>
                ${barreActionsSolo}
                <div class="tb-texte-description" style="color: var(--texte-muted); font-style: italic;">
                    En attente de données pour ${nbTotal} étudiant${nbTotal > 1 ? 's' : ''}.
                </div>
                <div class="barre-patterns tb-barre-simple" style="opacity: 0.5;">
                    <div class="barre-patterns-overlay"></div>
                </div>
                <div class="distribution-legende tb-barre-distribution">
                    <span style="position: absolute; left: 12.5%; transform: translateX(-50%); color: var(--badge-pattern-stable-texte); font-weight: 600; text-align: center;">Progression<br>stable<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
                    <span style="position: absolute; left: 37.5%; transform: translateX(-50%); color: var(--badge-pattern-defi-texte); font-weight: 600; text-align: center;">Défi<br>spécifique<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
                    <span style="position: absolute; left: 62.5%; transform: translateX(-50%); color: var(--badge-pattern-emergent-texte); font-weight: 600; text-align: center;">Difficulté<br>émergente<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
                    <span style="position: absolute; left: 87.5%; transform: translateX(-50%); color: var(--badge-pattern-critique-texte); font-weight: 600; text-align: center;">Difficulté<br>persistante<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
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
        'difficulte-emergente': 62.5,// Centre de 50-75%
        'difficulte-persistante': 87.5,// Centre de 75-100%
        'non-participation': 87.5 // 🆕 BETA 98.9: Même zone que difficulté persistante
    };

    // Calculer les compteurs par pattern pour SOM et PAN
    const compteursSOM = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'difficulte-emergente': 0, 'difficulte-persistante': 0, 'non-participation': 0 };
    const compteursPAN = { 'stable': 0, 'progression': 0, 'defi-specifique': 0, 'difficulte-emergente': 0, 'difficulte-persistante': 0, 'non-participation': 0 };

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
                style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
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
                style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
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

    const emergentSOM = compteursSOM['difficulte-emergente'] || 0;
    const emergentPAN = compteursPAN['difficulte-emergente'] || 0;
    const emergentPctSOM = Math.round((emergentSOM / totalSOM) * 100);
    const emergentPctPAN = Math.round((emergentPAN / totalPAN) * 100);

    // 🆕 BETA 98.9: Inclure les non-participants dans le compteur critique
    const critiqueSOM = (compteursSOM['difficulte-persistante'] || 0) + (compteursSOM['non-participation'] || 0);
    const critiquePAN = (compteursPAN['difficulte-persistante'] || 0) + (compteursPAN['non-participation'] || 0);
    const critiquePctSOM = Math.round((critiqueSOM / totalSOM) * 100);
    const critiquePctPAN = Math.round((critiquePAN / totalPAN) * 100);

    // Générer labels avec compteurs et pourcentages
    let labelStable = 'Progression<br>stable';
    let labelDefi = 'Défi<br>spécifique';
    let labelEmergent = 'Difficulté<br>émergente';
    let labelCritique = 'Difficulté<br>persistante';

    // Session C (#303) : mode comparatif retiré — une seule couche affichée.
    if (afficherSom) {
        labelStable += `<br><span class="tb-texte-mini-orange">${stableSOM} (${formaterPourcentage(stablePctSOM)})</span>`;
        labelDefi += `<br><span class="tb-texte-mini-orange">${defiSOM} (${formaterPourcentage(defiPctSOM)})</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-orange">${emergentSOM} (${formaterPourcentage(emergentPctSOM)})</span>`;
        labelCritique += `<br><span class="tb-texte-mini-orange">${critiqueSOM} (${formaterPourcentage(critiquePctSOM)})</span>`;
    } else if (afficherPan) {
        labelStable += `<br><span class="tb-texte-mini-bleu-std">${stablePAN} (${formaterPourcentage(stablePctPAN)})</span>`;
        labelDefi += `<br><span class="tb-texte-mini-bleu-std">${defiPAN} (${formaterPourcentage(defiPctPAN)})</span>`;
        labelEmergent += `<br><span class="tb-texte-mini-bleu-std">${emergentPAN} (${formaterPourcentage(emergentPctPAN)})</span>`;
        labelCritique += `<br><span class="tb-texte-mini-bleu-std">${critiquePAN} (${formaterPourcentage(critiquePctPAN)})</span>`;
    }

    // Interprétation basée sur les diagnostics IPB × direction (données multistructurelles)
    const interpretation = genererInterpretationSuiviFondamentaux();

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
            <h4 class="tb-titre-metrique" style="margin-bottom: 4px;" data-tooltip="tdb-patterns">Structure des apprentissages fondamentaux (SOLO)</h4>
            ${barreActionsSolo}
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
                    <span style="position: absolute; left: 16.5%; transform: translateX(-50%); color: var(--bleu-clair); font-weight: 600; text-align: center;">Niveau 1<br>Universel<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
                    <span style="position: absolute; left: 49.5%; transform: translateX(-50%); color: var(--jetons-reprise-titre); font-weight: 600; text-align: center;">Niveau 2<br>Préventif<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
                    <span style="position: absolute; left: 83%; transform: translateX(-50%); color: var(--den-violet); font-weight: 600; text-align: center;">Niveau 3<br>Intensif<br><span class="tb-texte-mini" style="color: var(--texte-muted);">0 (0\u00a0%)</span></span>
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
                style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
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
                style="left: ${positionFinale}%; animation-delay: ${animDelay}s; --amp: ${amplitude}px; --offsetX: ${offsetX}px; --jitterV: ${jitterV.toFixed(1)}px; --scaleUp: ${scaleUp}; --scaleDown: ${scaleDown}; --duration: ${duration}s;"
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

    // Session C (#303) : mode comparatif retiré — une seule couche affichée.
    if (afficherSom) {
        labelNiveau1 += `<br><span class="tb-texte-mini-orange">${niveau1SOM} (${formaterPourcentage(niveau1PctSOM)})</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-orange">${niveau2SOM} (${formaterPourcentage(niveau2PctSOM)})</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-orange">${niveau3SOM} (${formaterPourcentage(niveau3PctSOM)})</span>`;
    } else if (afficherPan) {
        labelNiveau1 += `<br><span class="tb-texte-mini-bleu-std">${niveau1PAN} (${formaterPourcentage(niveau1PctPAN)})</span>`;
        labelNiveau2 += `<br><span class="tb-texte-mini-bleu-std">${niveau2PAN} (${formaterPourcentage(niveau2PctPAN)})</span>`;
        labelNiveau3 += `<br><span class="tb-texte-mini-bleu-std">${niveau3PAN} (${formaterPourcentage(niveau3PctPAN)})</span>`;
    }

    // 🆕 BETA 91: Générer l'interprétation RàI
    let interpretation = '';
    const etudiants = afficherSom ? etudiantsSOM : etudiantsPAN;
    if (etudiants && etudiants.length > 0) {
        // Session C (#303) : mode comparatif retiré — une seule couche affichée.
        if (afficherSom) {
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
 * Affiche les patterns d'apprentissage (couche unique = pratique active du groupe)
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
        // #743 (lot D) : « a des présences » = son assiduité est connue (même lecture que les barres ci-dessus).
        const aDesPresences = (e.sommatif && e.sommatif.assiduite !== null && e.sommatif.assiduite !== undefined)
            || (e.alternatif && e.alternatif.assiduite !== null && e.alternatif.assiduite !== undefined);
        const aDesEvals = (e.sommatif && (e.sommatif.completion > 0 || e.sommatif.performance > 0)) ||
                          (e.alternatif && (e.alternatif.completion > 0 || e.alternatif.performance > 0));
        // Lot N1b (21 sept. 2026) — SANS PRATIQUE ASSIGNÉE, LA COMPLÉTION EST INCONNUE (`null`, indices.js) : on ne
        // sait pas ce que cet élève a remis AU SENS DE LA PRATIQUE, donc on ne peut pas dire « aucune production
        // remise ». Mesuré sur la vraie page (pack démo, pratique retirée) : les 10 élèves étaient nommés ici.
        const completionInconnue = (bloc) => !!bloc && bloc.completion === null;
        if (completionInconnue(e.sommatif) || completionInconnue(e.alternatif)) return false;
        return aDesPresences && !aDesEvals;
    });

    // Retirer l'alerte existante si présente
    const carteIndicateurs = document.getElementById('carte-indicateurs-acpe');
    if (!carteIndicateurs) return;

    const alerteExistante = carteIndicateurs.querySelector('.alerte-non-participation');
    if (alerteExistante) alerteExistante.remove();

    // #731 — l'alerte nommée suit la même garde que la carte RàI et la cible : sans travail dû ou sans
    // copie évaluée dans le groupe, personne n'est « sans aucun travail remis » — il n'y a rien à remettre.
    if (typeof depistagePeutJugerLaNonParticipation === 'function' && !depistagePeutJugerLaNonParticipation().possible) return;

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
        return `<li>${echapperHtml(nomAffiche)} — A\u00a0: ${formaterPourcentage(assiduite)}${detailProd}</li>`;
    }).join('');

    const nbEleves = nonParticipants.length;
    const html = `
        <div class="alerte-non-participation info-box info-box--attention" style="margin: 16px 20px 0;">
            <strong>&#9888;&#65039; ${nbEleves} étudiant·e${nbEleves > 1 ? '·s' : ''} présent·e${nbEleves > 1 ? '·s' : ''} sans ${accordTermeProduction('aucun', 1)} ${obtenirTermeProduction('singulier')} ${accordTermeProduction('remis', 1)}</strong>
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

/**
 * #790 — COMBIEN D'ÉLÈVES SONT SIGNALÉS, ET LESQUELS.
 *
 * Ses mots (7 sept. 2026) : « À ce moment du trimestre je les connais très peu, mais
 * je veux avoir une incidence sur leur parcours. » Il contacte les élèves lui-même,
 * par message, et ne veut pas valider une liste élève par élève — mais il doit voir
 * L'AMPLEUR avant d'écrire, parce que la capacité d'accueil d'un service d'aide est
 * limitée. Trois élèves et dix-sept ne se traitent pas de la même façon.
 *
 * ⚠ Recalculé à chaque rendu, jamais lu d'un stockage : décocher un palier du
 * gabarit vide cette liste au rafraîchissement suivant.
 * ⚠ Rien de disciplinaire : la phrase affichée vient du gabarit de la grille.
 */
function afficherSignalementsDepistage(etudiants) {
    const carteIndicateurs = document.getElementById('carte-indicateurs-acpe');
    if (!carteIndicateurs) return;

    const existante = carteIndicateurs.querySelector('.alerte-signalement-depistage');
    if (existante) existante.remove();

    if (typeof window.SignalementDepistage === 'undefined') return;

    const bilan = window.SignalementDepistage.pourGroupe(etudiants, {
        evaluations: obtenirDonneesSelonMode('evaluationsSauvegardees') || [],
        grilles: db.getSync(cle('grillesTemplates'), []) || []
    });
    if (bilan.total === 0) return;

    const modeActif = db.getSync('modeApplication', 'normal');
    const lignes = etudiants.filter(e => bilan.parEleve[e.da]).map(e => {
        let nomAffiche;
        if (modeActif === 'anonymisation') {
            nomAffiche = (e.prenom && e.prenom.startsWith('Élève')) ? e.prenom :
                (typeof anonymiserNom === 'function' && anonymiserNom(e.da)) || 'Étudiant Anonyme';
        } else {
            nomAffiche = `${e.nom}, ${e.prenom}`;
        }
        // Un élève peut porter plusieurs phrases (deux critères, deux copies) :
        // elles sont déjà dédoublonnées par libellé en amont.
        const phrases = bilan.parEleve[e.da].map(s => echapperHtml(s.libelle)).join(' · ');
        return `<li>${echapperHtml(nomAffiche)} — ${phrases}</li>`;
    }).join('');

    const n = bilan.total;
    const html = `
        <div class="alerte-signalement-depistage info-box" style="margin: 16px 20px 0;">
            <strong>${n} étudiant·e${n > 1 ? '·s' : ''} signalé·e${n > 1 ? '·s' : ''} par le dépistage</strong>
            <ul style="margin: 6px 0 0 16px; padding: 0; list-style: none;">
                ${lignes}
            </ul>
        </div>
    `;

    const conteneurIndicateurs = carteIndicateurs.querySelector('#conteneur-indicateurs-apprentissage');
    if (conteneurIndicateurs) {
        conteneurIndicateurs.insertAdjacentHTML('beforebegin', html);
    } else {
        carteIndicateurs.insertAdjacentHTML('beforeend', html);
    }
}

function afficherPatternsApprentissage(etudiants) {
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const { afficherSom, afficherPan } = determinerModeAffichageTableauBord(config);

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
                // #731 — « En attente » (niveau 0) n'est pas un pattern : l'élève n'entre pas dans la barre,
                // comme la barre RàI l'écarte déjà (`if (niveau)`).
                if (cibleInfo && cibleInfo.niveau === 0) return;
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

    // Calculer l'indicateur de fiabilité depuis les données IPB (suivi) déjà calculées
    const fenetreAnalyse = typeof obtenirNombreProductionsPourPatterns === 'function' ? obtenirNombreProductionsPourPatterns() : 3;
    const nbArtefactsParEtudiant = _tousEtudiantsEnrichis
        .filter(function(e) { return e.suivi && e.suivi.scoresParArtefact; })
        .map(function(e) { return e.suivi.scoresParArtefact.length; });
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
        valeurs.push(`<strong class="tb-valeur-grande-orange">${formaterPourcentage(valeurSomPct)}</strong>`);
    }

    if (afficherPan) {
        valeurs.push(`<strong class="tb-valeur-grande-bleu-std">${formaterPourcentage(valeurPanPct)}</strong>`);
    }

    // Générer le texte du nombre d'étudiants
    let texteEtudiants = '';
    // Session C (#303) : mode comparatif retiré — une seule couche affichée.
    if (afficherSom) {
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
    const config = db.getSync(cle('modalitesEvaluation'), null) || {};
    // Session C (#303) : mode comparatif retiré — couche unique (pratique active).
    const { afficherSom, afficherPan } = determinerModeAffichageTableauBord(config);

    // 🆕 BETA 98.9: Inclure TOUS les étudiants — les non-participants sont classés
    // Niveau 3 par determinerNiveauRaiPedagogique()
    const etudiantsAvecDonneesCP = etudiants;
    const nbSansDonneesCP = 0;
    const nbTotal = etudiants.length;


    // NOUVEAU Beta 90 : Récupérer les pratiques spécifiques
    const pratiqueSOM = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('sommative') : null;
    const pratiquePAN = typeof obtenirPratiqueParId === 'function' ? obtenirPratiqueParId('standards') : null;

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

    // Calculer l'indicateur de fiabilité depuis les données IPB (suivi) déjà calculées
    const fenetreAnalyse = typeof obtenirNombreProductionsPourPatterns === 'function' ? obtenirNombreProductionsPourPatterns() : 3;
    const nbArtefactsParEtudiant = _tousEtudiantsEnrichis
        .filter(function(e) { return e.suivi && e.suivi.scoresParArtefact; })
        .map(function(e) { return e.suivi.scoresParArtefact.length; });
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

    // Défi: au moins un indice sous 0.75 mais pas de difficulté persistante
    return 'défi';
}
*/


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
    return formaterPourcentage(Math.round(valeur * 100));
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
 * Wrapper de navigation : bascule l'onglet Suivi puis ouvre la sous-section
 * profil et charge le profil de l'élève.
 * Utilisé par data-action="tbNavigerVersProfil" data-param="<da>"
 * @param {string} da - Le DA de l'étudiant
 */
function tbNavigerVersProfil(da) {
    if (typeof afficherSection === 'function') {
        afficherSection('suivi');
    }
    // #754 : afficherProfilComplet active lui-même la sous-section Profil, sans réveiller
    // le crochet de navigation.js — un seul rendu.
    if (typeof afficherProfilComplet === 'function') {
        afficherProfilComplet(da);
    }
}

/* ===============================
   GRAPHIQUE GROUPE PAR HABILETÉS — CÂBLAGE UI
   =============================== */

/**
 * Sous-titres dynamiques selon la mesure choisie et la sélection d'élève.
 * - Habiletés sans élève → médiane du groupe par habileté
 * - Habiletés avec élève → habiletés de cet élève
 * - Note finale → libellé adapté à la pratique (« Note chiffrée » en PAN)
 */
function _sousTitreTrajectoires(mesure, termeSingulier) {
    if (mesure === 'habiletes') {
        const selecteur = document.getElementById('selecteur-etudiant-trajectoires');
        const val = selecteur ? selecteur.value : '';
        if (val === 'TOUS') {
            return 'Toutes les courbes du groupe par habileté, par ' + termeSingulier;
        }
        if (val !== '') {
            const opt = selecteur.options[selecteur.selectedIndex];
            const nom = opt ? opt.textContent.replace(/\s*\(inactif\)\s*$/, '') : 'l\'étudiant·e';
            return 'Habiletés de ' + nom + ', par ' + termeSingulier;
        }
        return 'Médiane du groupe par habileté, par ' + termeSingulier;
    }
    const labelNote = (typeof obtenirLabelNoteFinale === 'function')
        ? obtenirLabelNoteFinale()
        : 'Note chiffrée';
    return labelNote + ' par ' + termeSingulier + ', dans l\'ordre chronologique';
}

/**
 * Met à jour le sous-titre de la carte Trajectoires en lisant l'état des contrôles.
 * Appelé depuis graphiques-progression.js après un rebuild ou une sélection d'élève.
 */
function _majSousTitreTrajectoires() {
    const sousTitre = document.getElementById('trajectoires-sous-titre');
    if (!sousTitre) return;
    const selMesure = document.getElementById('selecteur-mesure-trajectoires');
    const mesure = (selMesure && selMesure.value === 'habiletes') ? 'habiletes' : 'noteFinale';
    const termeSing = (typeof obtenirTermeProduction === 'function')
        ? obtenirTermeProduction('singulier')
        : 'production';
    sousTitre.textContent = _sousTitreTrajectoires(mesure, termeSing);
}

/**
 * Initialise la carte « Trajectoires par {production} ».
 * - Respecte la préférence afficherDeveloppementHabiletes (cache la carte si désactivée)
 * - Injecte le terme dynamique (artefact / production / etc.) dans le titre et le sous-titre
 * - Peuple les checkboxes critères (visibles seulement en mode Habiletés)
 * - Lance le rendu initial en mode « Note finale »
 */
function initialiserCarteTrajectoiresProduction() {
    try {
        const carte = document.getElementById('carte-trajectoires-production');
        if (!carte) return;

        const visible = (typeof obtenirPreference === 'function')
            ? obtenirPreference('afficherDeveloppementHabiletes') !== false
            : true;
        if (!visible) {
            carte.style.display = 'none';
            return;
        }
        carte.style.display = '';

        // Injection du terme dynamique (titre + sous-titre)
        const termeSing = (typeof obtenirTermeProduction === 'function')
            ? obtenirTermeProduction('singulier')
            : 'production';
        const spanTerme = document.getElementById('trajectoires-titre-terme');
        if (spanTerme) spanTerme.textContent = termeSing;

        // Étiquette du sélecteur Mesure adaptée à la pratique
        const optNoteFinale = document.querySelector('#selecteur-mesure-trajectoires option[value="noteFinale"]');
        if (optNoteFinale && typeof obtenirLabelNoteFinale === 'function') {
            optNoteFinale.textContent = obtenirLabelNoteFinale();
        }

        // Lecture de l'état initial des contrôles
        const selMesure = document.getElementById('selecteur-mesure-trajectoires');
        const mesure = (selMesure && selMesure.value === 'habiletes') ? 'habiletes' : 'noteFinale';

        const sousTitre = document.getElementById('trajectoires-sous-titre');
        if (sousTitre) sousTitre.textContent = _sousTitreTrajectoires(mesure, termeSing);

        // Barre critères : visible seulement en mode Habiletés
        const barreCriteres = document.getElementById('trajectoires-controles-criteres');
        if (barreCriteres) barreCriteres.style.display = (mesure === 'habiletes') ? 'flex' : 'none';

        // Peuplement des pills critères (toujours, pour être prêt si l'utilisateur switche)
        const conteneur = document.getElementById('trajectoires-criteres-checkboxes');
        if (conteneur && typeof listerCriteresHabiletes === 'function') {
            const criteres = listerCriteresHabiletes();
            if (criteres.length === 0) {
                conteneur.innerHTML = '<span class="habiletes-criteres-attente">Aucun critère détaillé dans les évaluations enregistrées.</span>';
            } else {
                let html = '';
                criteres.forEach((c, idx) => {
                    const id = 'traj-cb-crit-' + idx;
                    const nomEsc = echapperHtml(c.nom);
                    const couleurEsc = echapperHtml(c.couleur);
                    html += '<label class="habiletes-critere-checkbox actif" for="' + id + '" style="--critere-couleur: ' + couleurEsc + ';">' +
                            '<input type="checkbox" id="' + id + '" data-on-change="togglerCritereTrajectoires" data-critere-nom="' + nomEsc + '" checked>' +
                            '<span class="habiletes-critere-pastille"></span>' +
                            '<span class="habiletes-critere-libelle">' + nomEsc + '</span>' +
                            '</label>';
                });
                conteneur.innerHTML = html;
            }
        }

        // Rendu initial du graphique
        if (typeof creerGraphiqueTrajectoiresProduction === 'function') {
            creerGraphiqueTrajectoiresProduction('graphique-trajectoires-production', {
                mesure: mesure,
                afficherMediane: false
            });
        }
    } catch (e) {
        console.error('[Trajectoires] initialiserCarteTrajectoiresProduction :', e);
    }
}

/**
 * Réagit au changement du sélecteur Mesure (Note finale ↔ Habiletés).
 * - Affiche/masque la barre critères (visible seulement en mode Habiletés)
 * - Affiche/masque le toggle Médiane (caché en mode Habiletés : la médiane
 *   est implicite — c'est déjà ce que représente chaque courbe)
 * - Met à jour le sous-titre
 * - Rafraîchit le graphique
 */
function changerMesureTrajectoires() {
    const selMesure = document.getElementById('selecteur-mesure-trajectoires');
    const mesure = (selMesure && selMesure.value === 'habiletes') ? 'habiletes' : 'noteFinale';

    const barreCriteres = document.getElementById('trajectoires-controles-criteres');
    if (barreCriteres) barreCriteres.style.display = (mesure === 'habiletes') ? 'flex' : 'none';

    // Toggle Médiane visible seulement en mode Note finale
    const toggleMedianeLabel = document.querySelector('.habiletes-toggle-mediane-label');
    if (toggleMedianeLabel) {
        toggleMedianeLabel.style.display = (mesure === 'habiletes') ? 'none' : 'flex';
    }
    if (mesure === 'habiletes') {
        // Forcer le toggle off pour cohérence avec la masquage
        const cb = document.getElementById('trajectoires-toggle-mediane');
        if (cb) cb.checked = false;
    }

    const termeSing = (typeof obtenirTermeProduction === 'function')
        ? obtenirTermeProduction('singulier')
        : 'production';
    const sousTitre = document.getElementById('trajectoires-sous-titre');
    if (sousTitre) sousTitre.textContent = _sousTitreTrajectoires(mesure, termeSing);

    if (typeof rafraichirGraphiqueTrajectoires === 'function') {
        rafraichirGraphiqueTrajectoires();
    }
}

/**
 * Bascule l'état d'un critère (coché/décoché) et rafraîchit le graphique.
 * Appelé via data-on-change depuis les checkboxes critères.
 */
function togglerCritereTrajectoires(el) {
    if (!el) return;
    const cb = (el.tagName === 'INPUT') ? el : el.querySelector('input[type="checkbox"]');
    if (!cb) return;
    const label = cb.closest('.habiletes-critere-checkbox');
    if (label) {
        if (cb.checked) label.classList.add('actif');
        else label.classList.remove('actif');
    }
    if (typeof rafraichirGraphiqueTrajectoires === 'function') {
        rafraichirGraphiqueTrajectoires();
    }
}

/**
 * Ouvre Labo › Outils d'observation et fait défiler jusqu'au sélecteur « Grille de
 * critères pour le dépistage ». Wrapper appelé depuis les boutons sous la barre des
 * patterns (genererBarrePatterns).
 * ↻ 11 sept. 2026 (#824, temps 5 du cadrage 10) : depuis 1.130.0 rien ne se replie sur
 * cet écran — le dépliage de l'accordéon SOLO que ce wrapper faisait est parti.
 */
function ouvrirReferenceSoloAccompagnement() {
    ouvrirOutilsObservation('v2-pref-grille-reference');
}

/**
 * Ouvre Labo › Outils d'observation — l'écran reste dans Labo, Suivi y mène par des liens
 * (décision de Grégoire, 11 sept. 2026, 10 h 48). Sans cible, la page s'ouvre en haut de
 * l'écran ; avec l'identifiant d'un contrôle, elle défile jusqu'à lui.
 * Appelé par les liens « Régler les outils d'observation » (Suivi du groupe, carte RàI du
 * profil) et par le wrapper ci-dessus.
 * @param {string} [cibleId] - id d'un contrôle de l'écran vers lequel défiler
 */
function ouvrirOutilsObservation(cibleId) {
    if (typeof naviguerVers === 'function') {
        naviguerVers('labo', 'accompagnement');
    }
    // Laisser le DOM se peindre (afficherSousSection) avant de défiler.
    setTimeout(function() {
        var cible = (typeof cibleId === 'string' && cibleId)
            ? document.getElementById(cibleId)
            : document.getElementById('labo-accompagnement');
        if (cible && typeof cible.scrollIntoView === 'function') {
            cible.scrollIntoView({ behavior: 'smooth', block: (cibleId ? 'center' : 'start') });
        }
    }, 80);
}

/* ===============================
   📤 EXPORTS GLOBAUX
   =============================== */

// Export pour permettre le rafraîchissement depuis d'autres modules
window.tbNavigerVersProfil = tbNavigerVersProfil;
window.ouvrirReferenceSoloAccompagnement = ouvrirReferenceSoloAccompagnement;
window.ouvrirOutilsObservation = ouvrirOutilsObservation;
window.chargerTableauBordApercu = chargerTableauBordApercu;
window.initialiserModuleTableauBordApercu = initialiserModuleTableauBordApercu;
window.appliquerCouleursEtudiantsSuivis = appliquerCouleursEtudiantsSuivis;
window.appliquerCouleursPrioritaires = appliquerCouleursPrioritaires;
window.calculerEtudiantsPrioritaires = calculerEtudiantsPrioritaires;
window.initialiserCarteTrajectoiresProduction = initialiserCarteTrajectoiresProduction;
window.togglerCritereTrajectoires = togglerCritereTrajectoires;
window.changerMesureTrajectoires = changerMesureTrajectoires;
window._majSousTitreTrajectoires = _majSousTitreTrajectoires;
window.determinerModeAffichageTableauBord = determinerModeAffichageTableauBord;
window.seuilEvaluationsPourP = seuilEvaluationsPourP;   // #634
window.horaireSansAucunePeriode = horaireSansAucunePeriode;
window.libelleCriteresMultiSurveilles = libelleCriteresMultiSurveilles;   // lot 4, volet B
// 7 sept. 2026 — exposée pour la sentinelle des bulles au doigt : le toucher
// ne se joue pas au banc (WebKit absent des conteneurs), son arbitrage si.
window._bulleLaPlusProche = bulleLaPlusProche;

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js : echapperHtml()
 * - 09-2-saisie-presences.js : calculerNombreSeances() (optionnel)
 * - styles.css : classes carte-metrique, tableau
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
 * Éléments avec IDs dans la sous-section apercu-contenu:
 * - tb-total-etudiants
 * - tb-assiduite-moyenne
 * - tb-completion-moyenne
 * - tb-performance-moyenne
 * - tb-interventions-requises
 *
 * FORMULES UTILISÉES (Guide de monitorage):
 * - Assiduité (A) : SOMME(heures présent) / TOTAL(heures cours)
 * - Complétion (C) : NOMBRE(remis) / NOMBRE(attendus)
 * - Performance (P) : MOYENNE(3 derniers IDME) / 4
 */

})();
