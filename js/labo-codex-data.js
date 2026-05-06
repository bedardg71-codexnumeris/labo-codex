/* ===============================
   MODULE : LABO CODEX DATA — Chargement et état dans le Labo
   Date : 6 mai 2026
   Backlog : #252
   Architecture : docs/architecture/ECOSYSTEME-DONNEES.md (Recherche)

   Vocation
     Permet au Labo de charger un fichier .codex-data.json en lecture seule
     (volatile, en mémoire) pour analyse longitudinale. Le trimestre actif
     de l'application reste intact — pas de namespace IDB temporaire.

     Le module expose un état (_codexDataCharge, _groupeSelectionne) que
     les sous-sections du Labo (#252 SP4) consultent via obtenirCodexData()
     et obtenirGroupeSelectionne().

   Sécurité
     - Validation stricte du format à la lecture (CodexData.chargerDepuisFichier).
     - Vérification du hash SHA-256 d'intégrité.
     - Lecture seule : aucun écrit IndexedDB ni localStorage.

   Dépendances
     - CodexData (window.CodexData) — chargerDepuisFichier, verifierIntegrite
     - echapperHtml (window.echapperHtml)
     - afficherNotificationSucces / afficherNotificationErreur
     - afficherSousSection (utilisé pour rafraîchir l'affichage du Labo)
*/

(function() {
'use strict';

/* ===============================
   ÉTAT INTERNE (volatile)
   =============================== */

// Document codex data chargé (null si rien)
var _codexDataCharge = null;

// Sélection courante : 'tous' (fusion) ou un identifiant de dossier (ex. 'h2026-601-101-gr00002')
var _groupeSelectionne = 'tous';

/* ===============================
   UTILITAIRES
   =============================== */

function _echapper(s) {
    if (typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function _formaterDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('fr-CA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return iso;
    }
}

function _notifSucces(titre, msg) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(titre, msg);
    }
}

function _notifErreur(titre, msg) {
    if (typeof window.afficherNotificationErreur === 'function') {
        window.afficherNotificationErreur(titre, msg);
    } else {
        console.error('[LaboCodexData]', titre, '—', msg);
    }
}

function _notifAvertissement(titre, msg) {
    if (typeof window.afficherNotification === 'function') {
        window.afficherNotification(titre + ' — ' + msg, 'warning');
    } else {
        console.warn('[LaboCodexData]', titre, '—', msg);
    }
}

/* ===============================
   ACTIONS PUBLIQUES
   =============================== */

/**
 * Clic sur le bouton « Charger un codex data » : déclenche l'input file.
 */
function actionOuvrirChargement() {
    var input = document.getElementById('labo-codex-data-input');
    if (input) {
        input.value = ''; // permettre de re-sélectionner le même fichier
        input.click();
    }
}

/**
 * data-on-change de l'input file : valide et charge le fichier.
 */
async function onFichierSelectionne(el) {
    if (!el || !el.files || el.files.length === 0) return;
    var file = el.files[0];

    if (!window.CodexData || typeof window.CodexData.chargerDepuisFichier !== 'function') {
        _notifErreur('Erreur', 'Module Codex Data non charg&eacute;.');
        return;
    }

    try {
        var codexData = await window.CodexData.chargerDepuisFichier(file);

        // Vérifier l'intégrité (non bloquant — averti si mauvais)
        var integrite = await window.CodexData.verifierIntegrite(codexData);
        if (integrite.hashAttendu && !integrite.valide) {
            _notifAvertissement(
                'Int&eacute;grit&eacute; non v&eacute;rifi&eacute;e',
                'Le hash du fichier ne correspond pas. Le fichier peut avoir &eacute;t&eacute; modifi&eacute; depuis son extraction. Le chargement continue.'
            );
        }

        _codexDataCharge = codexData;
        _groupeSelectionne = 'tous';

        _afficherBandeau();
        _peuplerSelectGroupe();
        _rafraichirSousSectionActive();

        var nbGroupes = _nbGroupes();
        _notifSucces(
            'Codex data charg&eacute;',
            nbGroupes + ' groupe(s)-cours disponible(s) dans le Labo.'
        );
    } catch (err) {
        console.error('[LaboCodexData] Chargement &eacute;chou&eacute; :', err);
        _notifErreur(
            'Chargement impossible',
            err && err.message ? err.message : String(err)
        );
    }
}

/**
 * Décharge le codex data : reset state, masque le bandeau, rafraîchit l'affichage.
 */
function actionDecharger() {
    _codexDataCharge = null;
    _groupeSelectionne = 'tous';
    _masquerBandeau();
    _rafraichirSousSectionActive();
    _notifSucces('Codex data d&eacute;charg&eacute;', 'Le Labo affiche &agrave; nouveau les donn&eacute;es du trimestre actif.');
}

/**
 * data-on-change du sélecteur de groupe.
 */
function onChangerGroupe(el) {
    if (!el || typeof el.value !== 'string') return;
    _groupeSelectionne = el.value;
    _rafraichirSousSectionActive();
}

/* ===============================
   AFFICHAGE DU BANDEAU
   =============================== */

function _afficherBandeau() {
    var bandeau = document.getElementById('bandeau-labo-codex-data');
    if (bandeau) bandeau.classList.remove('u-hide');

    var resume = document.getElementById('bandeau-labo-codex-data-resume');
    if (resume) resume.innerHTML = _genererResumeBandeau();
}

function _masquerBandeau() {
    var bandeau = document.getElementById('bandeau-labo-codex-data');
    if (bandeau) bandeau.classList.add('u-hide');
}

function _genererResumeBandeau() {
    if (!_codexDataCharge) return '';

    var meta = _codexDataCharge.metadata || {};
    var nbGroupes = _nbGroupes();
    var dateExt = _formaterDate(meta.date_extraction);
    var auteur = meta.auteur ? _echapper(meta.auteur) : '';

    var bouts = [];
    bouts.push('&middot; ' + nbGroupes + ' groupe(s)-cours');
    if (dateExt) bouts.push('&middot; extrait le ' + _echapper(dateExt));
    if (auteur) bouts.push('&middot; ' + auteur);

    return bouts.join(' ');
}

function _peuplerSelectGroupe() {
    var select = document.getElementById('select-codex-data-groupe');
    if (!select) return;

    // Vider toutes les options sauf 'tous'
    while (select.options.length > 0) select.remove(0);

    var optTous = document.createElement('option');
    optTous.value = 'tous';
    optTous.textContent = 'tous fusionnés';
    select.appendChild(optTous);

    if (!_codexDataCharge || !_codexDataCharge.groupes) return;

    var dossiers = Object.keys(_codexDataCharge.groupes);

    // Tri par date_archive desc, puis par dossier.
    // dA/dB plutôt que da/db pour ne pas masquer le module global `db`.
    dossiers.sort(function(a, b) {
        var ga = _codexDataCharge.groupes[a] || {};
        var gb = _codexDataCharge.groupes[b] || {};
        var dA = ga.date_archive || '';
        var dB = gb.date_archive || '';
        if (dA !== dB) return dB.localeCompare(dA);
        return a.localeCompare(b);
    });

    dossiers.forEach(function(dossier) {
        var g = _codexDataCharge.groupes[dossier] || {};
        var label = dossier;
        if (g.cours || g.groupe) {
            label = (g.trimestre ? g.trimestre.toUpperCase() + ' ' : '') +
                    (g.cours || '') + (g.groupe ? ' gr' + g.groupe : '');
        }
        var opt = document.createElement('option');
        opt.value = dossier;
        opt.textContent = label;
        select.appendChild(opt);
    });

    select.value = _groupeSelectionne;
}

/* ===============================
   RAFRAÎCHISSEMENT DES SOUS-SECTIONS DU LABO
   =============================== */

/**
 * Si une sous-section du Labo est active, la rafraîchir pour qu'elle prenne
 * en compte la nouvelle source de données. Délègue à navigation.js (afficherSousSection).
 */
function _sousSectionCourante() {
    // sousSectionActive est `let` au top-level de config.js — accessible sans window.
    // mais peut être ReferenceError si accédé avant que config.js soit parsé.
    try {
        if (typeof sousSectionActive === 'string') return sousSectionActive;
    } catch (e) { /* config.js pas encore parsé */ }
    return '';
}

function _rafraichirSousSectionActive() {
    var sousSection = _sousSectionCourante();
    if (!sousSection || sousSection.indexOf('labo-') !== 0) return;

    if (typeof window.afficherSousSection === 'function') {
        try { window.afficherSousSection(sousSection); }
        catch (e) { console.warn('[LaboCodexData] Rafraîchissement sous-section échoué', e.message || e); }
    }
}

/* ===============================
   API : CONSULTATION (utilisée par SP4 — labo-etudes)
   =============================== */

function estActif() {
    return _codexDataCharge !== null;
}

function obtenirCodexData() {
    return _codexDataCharge;
}

function obtenirGroupeSelectionne() {
    return _groupeSelectionne;
}

function obtenirGroupesDisponibles() {
    if (!_codexDataCharge || !_codexDataCharge.groupes) return [];
    return Object.keys(_codexDataCharge.groupes);
}

function _nbGroupes() {
    if (!_codexDataCharge || !_codexDataCharge.groupes) return 0;
    return Object.keys(_codexDataCharge.groupes).length;
}

/**
 * Renvoie les données d'une clé namespacée pour le groupe sélectionné.
 * Si 'tous fusionnés' est actif, concatène les tableaux de tous les groupes.
 *
 * @param {string} cleBase - Nom de clé sans namespace (ex. 'groupeEtudiants', 'evaluationsSauvegardees')
 * @returns {Array|Object|null} Données ou null si codex data non chargé / clé absente
 */
function obtenirDonneesParCle(cleBase) {
    if (!_codexDataCharge || !_codexDataCharge.groupes) return null;
    if (!cleBase) return null;

    var dossiers;
    if (_groupeSelectionne === 'tous') {
        dossiers = Object.keys(_codexDataCharge.groupes);
    } else if (_codexDataCharge.groupes[_groupeSelectionne]) {
        dossiers = [_groupeSelectionne];
    } else {
        return null;
    }

    var resultats = [];
    var trouve = false;
    var estTableau = true;

    for (var i = 0; i < dossiers.length; i++) {
        var dossier = dossiers[i];
        var g = _codexDataCharge.groupes[dossier];
        if (!g) continue;

        // Le groupe a la forme { uuid, trimestre, cours, groupe, date_archive,
        //   <trimestre>_<cleBase>: ... } — la clé est namespacée par trimestre.
        var trimestre = g.trimestre;
        if (!trimestre) continue;
        var cleNamespacee = trimestre + '_' + cleBase;
        var valeur = g[cleNamespacee];
        if (valeur === undefined || valeur === null) continue;

        if (!Array.isArray(valeur)) estTableau = false;

        if (Array.isArray(valeur)) {
            // Annoter chaque entrée avec _codexDataDossier + _codexDataUuid (traçabilité)
            for (var j = 0; j < valeur.length; j++) {
                var entree = valeur[j];
                if (entree && typeof entree === 'object') {
                    var copie = Object.assign({}, entree);
                    copie._codexDataDossier = dossier;
                    copie._codexDataUuid = g.uuid || null;
                    resultats.push(copie);
                } else {
                    resultats.push(entree);
                }
            }
            trouve = true;
        } else if (typeof valeur === 'object') {
            // Objet : on retourne tel quel pour le groupe sélectionné (un seul).
            // En mode 'tous fusionnés', on ne sait pas fusionner deux objets de
            // structure inconnue de manière sûre — on prend le premier non-null
            // (ce qui correspond à l'ordre des dossiers dans le codex data).
            return valeur;
        } else {
            // Primitive : retourner la première valeur trouvée. Les consommateurs
            // qui chargent une clé primitive depuis le codex data en mode 'tous'
            // récupèrent ainsi la valeur du premier groupe rencontré.
            return valeur;
        }
    }

    if (!trouve) return null;
    return resultats;
}

/**
 * Renvoie les bibliothèques globales (grilles, échelles, productions, cartouches)
 * du codex data chargé.
 *
 * @returns {{grilles, echelles, productions, cartouches} | null}
 */
function obtenirBibliotheques() {
    if (!_codexDataCharge) return null;
    return _codexDataCharge.bibliotheques || null;
}

/* ===============================
   API : SOURCE DE DONNÉES UNIFIÉE (utilisée par #252 SP4)
   ===============================
   Ces helpers wrappent les lectures du Labo (`obtenirDonneesSelonMode`,
   `db.getSync(cle('xxx'))`, `obtenirSnapshotsHebdomadaires`,
   `obtenirInterventions`, etc.) pour qu'elles soient redirigées vers le
   codex data chargé quand un groupe-cours spécifique est sélectionné.

   Modes de consultation possibles :
     - 'app'                : trimestre actif (codex data non chargé)
     - 'codex-data-tous'    : codex data chargé, fusion de tous les groupes
     - 'codex-data-groupe'  : codex data chargé, un seul groupe sélectionné

   Pour les vues longitudinales (corrélations, impact jetons), seuls les
   modes 'app' et 'codex-data-groupe' sont pertinents — la fusion
   multi-trimestres n'a pas de sens (calendriers différents).
*/

/**
 * Détermine si l'appelant est dans une sous-section du Labo.
 * Le codex data n'a d'effet QUE dans le Labo (Mode B — cf. ECOSYSTEME-DONNEES) ;
 * les autres sections (Aperçu, Suivi, Évaluation, etc.) restent sur le trimestre actif.
 */
function _estDansLabo() {
    var s = _sousSectionCourante();
    return !!s && s.indexOf('labo-') === 0;
}

function modeConsultation() {
    if (!_codexDataCharge) return 'app';
    if (!_estDansLabo()) return 'app';
    if (_groupeSelectionne === 'tous') return 'codex-data-tous';
    return 'codex-data-groupe';
}

/**
 * Lit une clé namespacée par trimestre (groupeEtudiants, evaluationsSauvegardees,
 * productions, presences, indicesAssiduite, indicesCP, etc.).
 *
 * @param {string} cleBase
 * @returns {Array|Object} Données ou tableau vide
 */
function lireDonneesNamespacees(cleBase) {
    if (modeConsultation() === 'app') {
        if (typeof window.obtenirDonneesSelonMode === 'function') {
            return window.obtenirDonneesSelonMode(cleBase) || [];
        }
        return [];
    }
    return obtenirDonneesParCle(cleBase) || [];
}

/**
 * Lit une clé de bibliothèque globale (grillesTemplates, echellesTemplates,
 * productionsTemplates) ou un cartouches_<grilleId>.
 *
 * @param {string} cleBase
 * @returns {Array|Object} Bibliothèque ou tableau/objet vide
 */
function lireBibliothequeGlobale(cleBase) {
    if (modeConsultation() === 'app') {
        if (window.db && typeof window.db.getSync === 'function') {
            return window.db.getSync(cleBase, []);
        }
        return [];
    }
    var biblio = (_codexDataCharge && _codexDataCharge.bibliotheques) || {};
    var mapping = {
        'grillesTemplates': 'grilles',
        'echellesTemplates': 'echelles',
        'productionsTemplates': 'productions',
        'pratiquesConfigurables': 'pratiques'
    };
    if (mapping[cleBase] && Array.isArray(biblio[mapping[cleBase]])) {
        return biblio[mapping[cleBase]];
    }
    if (cleBase && cleBase.indexOf('cartouches_') === 0) {
        var grilleId = cleBase.substring('cartouches_'.length);
        var cartouches = biblio.cartouches || {};
        return cartouches[grilleId] || [];
    }
    return [];
}

/**
 * Lit les snapshots hebdomadaires.
 *
 * @returns {Array} Liste des snapshots (vide en mode 'codex-data-tous'
 *                  car la fusion multi-trimestres n'est pas pertinente)
 */
function lireSnapshotsHebdomadaires() {
    var mode = modeConsultation();
    if (mode === 'app') {
        if (typeof window.obtenirSnapshotsHebdomadaires === 'function') {
            return window.obtenirSnapshotsHebdomadaires() || [];
        }
        return [];
    }
    if (mode === 'codex-data-tous') return [];

    // Mode 'codex-data-groupe' : trouver la clé <trimestre>_snapshots_<gcId> dans le groupe sélectionné
    var groupe = _codexDataCharge.groupes[_groupeSelectionne];
    if (!groupe) return [];
    var trimestre = groupe.trimestre;
    if (!trimestre) return [];
    var prefixe = trimestre + '_snapshots_';
    var cles = Object.keys(groupe);
    for (var i = 0; i < cles.length; i++) {
        if (cles[i].indexOf(prefixe) === 0) {
            var snap = groupe[cles[i]];
            if (snap && Array.isArray(snap.hebdomadaires)) return snap.hebdomadaires;
        }
    }
    // Fallback : clé legacy `snapshots` à plat
    if (Array.isArray(groupe.snapshots)) return groupe.snapshots;
    return [];
}

/**
 * Lit les interventions du groupe sélectionné.
 *
 * @returns {Array}
 */
function lireInterventions() {
    var mode = modeConsultation();
    if (mode === 'app') {
        if (typeof window.obtenirInterventions === 'function') {
            return window.obtenirInterventions() || [];
        }
        return [];
    }
    if (mode === 'codex-data-tous') return [];
    return obtenirDonneesParCle('interventions') || [];
}

/**
 * Renvoie un objet `infoCours` synthétique pour le groupe sélectionné en mode
 * codex data (utilisé par les filtres existants). En mode 'app', renvoie le
 * vrai infoCours du trimestre actif.
 *
 * @returns {Object|null}
 */
function lireInfoCours() {
    var mode = modeConsultation();
    if (mode === 'app') {
        if (window.db && typeof window.db.getSync === 'function') {
            return window.db.getSync('infoCours', null);
        }
        return null;
    }
    if (mode === 'codex-data-tous') return null;

    var groupe = _codexDataCharge.groupes[_groupeSelectionne];
    if (!groupe) return null;

    // Tenter de retrouver l'entité groupesCours archivée pour récupérer l'id réel
    var trimestre = groupe.trimestre || '';
    var cleGC = trimestre ? (trimestre + '_groupesCours') : null;
    var listeGC = cleGC ? groupe[cleGC] : null;
    var entiteGC = (Array.isArray(listeGC) && listeGC.length > 0) ? listeGC[0] : null;

    return {
        id: entiteGC ? entiteGC.id : null,
        _groupeCoursId: entiteGC ? entiteGC.id : null,
        codeCours: groupe.cours || (entiteGC && entiteGC.codeCours) || '',
        groupe: groupe.groupe || (entiteGC && entiteGC.groupe) || '',
        nomCours: (entiteGC && entiteGC.nomCours) || ''
    };
}

/* ===============================
   EXPORT — API publique
   =============================== */

window.LaboCodexData = {
    // Actions UI
    actionOuvrirChargement: actionOuvrirChargement,
    onFichierSelectionne: onFichierSelectionne,
    actionDecharger: actionDecharger,
    onChangerGroupe: onChangerGroupe,

    // État (consultation)
    estActif: estActif,
    modeConsultation: modeConsultation,
    obtenirCodexData: obtenirCodexData,
    obtenirGroupeSelectionne: obtenirGroupeSelectionne,
    obtenirGroupesDisponibles: obtenirGroupesDisponibles,
    obtenirDonneesParCle: obtenirDonneesParCle,
    obtenirBibliotheques: obtenirBibliotheques,

    // Source de données unifiée (utilisée par les sous-sections du Labo)
    lireDonneesNamespacees: lireDonneesNamespacees,
    lireBibliothequeGlobale: lireBibliothequeGlobale,
    lireSnapshotsHebdomadaires: lireSnapshotsHebdomadaires,
    lireInterventions: lireInterventions,
    lireInfoCours: lireInfoCours
};

})();
