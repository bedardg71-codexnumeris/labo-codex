/* ===============================
   INIT-INLINE.JS — Scripts extraits d'index.html pour CSP
   Phase 6 — Assainissement sécurité
   =============================== */

// ===============================
// SECTION: Toggle Sections + Clonage (ex-ligne 8611)
// ===============================

// Fonction pour plier/déplier une section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const icone = document.getElementById('icone-' + sectionId);

    if (section.style.display === 'none') {
        section.style.display = 'block';
        icone.textContent = '▼';
    } else {
        section.style.display = 'none';
        icone.textContent = '▶';
    }
}

// Initialisation statistiques clonage
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        if (typeof obtenirEtudiantsGroupe1 === 'function') {
            mettreAJourStatistiquesClonage();
        }
    }, 500);
});

document.addEventListener('click', function (e) {
    if (e.target.matches('[data-sous-onglet="reglages-groupe"]')) {
        setTimeout(function () {
            // Note: initialiserModuleGroupe() est maintenant appelé automatiquement par navigation.js

            // Clonage anonymisé (section avancée)
            if (typeof obtenirEtudiantsGroupe1 === 'function') {
                mettreAJourStatistiquesClonage();
                afficherTableauMapping();
            }
        }, 100);
    }
});

function mettreAJourStatistiquesClonage() {
    const groupe1 = obtenirEtudiantsGroupe1();
    const groupe2 = obtenirEtudiantsGroupe2();
    const mapping = chargerMapping();

    document.getElementById('stat-groupe1').textContent = groupe1.length;
    document.getElementById('stat-groupe2').textContent = groupe2.length;
    document.getElementById('stat-mappings').textContent = Object.keys(mapping).length;
}

// ===============================
// SECTION: Wrappers Phase 5b — Délégation (ex-ligne 16983)
// ===============================

function _wrapDateCoursChange() {
    initialiserSaisiePresences();
    mettreAJourBoutonsNavigation();
}

// --- Wrappers Phase 5b : lignes 9000-13000 ---

// File inputs : dispatcher passe l'élément, on fabrique un faux event
function traiterImportPratiqueFromEl(el) {
    traiterImportPratique({ target: el });
}
function importerFichierEtudiantsV2FromEl(el) {
    importerFichierEtudiantsV2({ target: el });
}

// Thème : radios sombre/clair, inline avait definirTheme(false) / definirTheme(true)
function definirThemeFromRadio(el) {
    definirTheme(el.value === 'clair');
}

// Checkboxes qui passaient this.checked
function definirModeExpertFromEl(el) {
    definirModeExpert(el.checked);
}

// ===============================
// SECTION: Gestion des versions et initialisation (ex-ligne 17040)
// ===============================

/**
 * SYSTÈME DE NOTIFICATION À DEUX NIVEAUX
 *
 * 1. VERSION_MAJEURE : Nouvelle version (95.2, 96...) → Modal Bienvenue
 * 2. BUILD_DATE : Corrections de bugs → Lien vers Réglages > À propos
 *
 * La pastille 🔴 apparaît si l'un ou l'autre est nouveau.
 * Le clic adapte son comportement selon ce qui est nouveau.
 */

// === CONFIGURATION ===
// VERSION_MAJEURE et BUILD_ID sont lus depuis version.json au chargement (source unique)
// Les valeurs ici servent de fallback si version.json n'est pas disponible
let VERSION_MAJEURE = '99.69';
let BUILD_ID = '0526-1423';
// Snapshot du build contenu dans CE fichier script (pour détecter les scripts périmés)
const _SCRIPT_BUILD = BUILD_ID;

// === CLÉS LOCALSTORAGE ===
const CLE_VERSION_VUE = 'monitorage-version-vue';
const CLE_BUILD_VU = 'monitorage-build-vu';

/**
 * Vérifie s'il y a des nouveautés non vues
 */
function verifierNouveautes() {
    const versionVue = localStorage.getItem(CLE_VERSION_VUE);
    const buildVu = localStorage.getItem(CLE_BUILD_VU);

    const nouvelleVersionMajeure = versionVue !== VERSION_MAJEURE;
    const nouveauBuild = buildVu !== BUILD_ID;

    return {
        nouvelleVersionMajeure,
        nouveauBuild,
        aDesNouveautes: nouvelleVersionMajeure || nouveauBuild
    };
}

/**
 * Met à jour l'affichage de la pastille selon l'état
 */
function mettreAJourPastille() {
    const pastille = document.querySelector('.pastille-nouveautes');
    if (!pastille) return;

    const { aDesNouveautes } = verifierNouveautes();
    pastille.textContent = aDesNouveautes ? '\uD83D\uDD34' : '';
    pastille.parentElement.title = aDesNouveautes ? 'Nouveautés disponibles' : 'Nouveautés';
}

/**
 * Gère le clic sur la pastille
 * - Nouvelle version majeure → Modal Bienvenue
 * - Nouveau build seulement → Réglages > À propos
 */
function afficherModalNouveautes() {
    const { nouvelleVersionMajeure } = verifierNouveautes();

    if (nouvelleVersionMajeure) {
        // Nouvelle version majeure → ouvrir le modal Bienvenue
        const modal = document.getElementById('modalNouveautes');
        if (modal) {
            modal.classList.add('actif');
        }
        // Marquer version ET build comme vus
        localStorage.setItem(CLE_VERSION_VUE, VERSION_MAJEURE);
        localStorage.setItem(CLE_BUILD_VU, BUILD_ID);
    } else {
        // Juste un nouveau build → ouvrir aussi le modal (avec section testeurs)
        const modal = document.getElementById('modalNouveautes');
        if (modal) {
            modal.classList.add('actif');
        }
        // Marquer le build comme vu
        localStorage.setItem(CLE_BUILD_VU, BUILD_ID);
    }

    mettreAJourPastille();
}

/**
 * Navigue vers Réglages > À propos
 */
function allerVersNotesDeVersion() {
    if (typeof afficherSection === 'function') {
        afficherSection('reglages');
        setTimeout(function() {
            if (typeof afficherSousSection === 'function') {
                afficherSousSection('reglages-a-propos');
            }
        }, 100);
    }
}

/**
 * Ferme le modal des nouveautés
 */
function fermerModalNouveautes() {
    const modal = document.getElementById('modalNouveautes');
    if (modal) {
        modal.classList.remove('actif');
    }
}

/**
 * Affiche le numéro de build dans l'entête
 */
function afficherBuildNumero() {
    const spanVersion = document.getElementById('version-entete');
    if (spanVersion) {
        spanVersion.textContent = `Beta ${VERSION_MAJEURE} - Consolidation`;
    }
    const span = document.getElementById('build-numero');
    if (span) {
        span.textContent = `(Build ${BUILD_ID})`;
    }
}

/**
 * Charge version.json pour synchroniser VERSION_MAJEURE et BUILD_ID
 * puis rafraîchit l'en-tête. Source unique de vérité.
 *
 * Sur file:// : utilise XMLHttpRequest (fetch est bloqué par CORS dans Chrome,
 * mais XHR fonctionne sur Safari). Détecte les scripts périmés et tente
 * un rechargement automatique.
 */
async function chargerVersionJSON() {
    if (window.location.protocol === 'file:') {
        // Lire version.json via XHR synchrone (fonctionne sur Safari file://)
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'version.json', false);
            xhr.send();
            if (xhr.status === 0 || xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.beta) VERSION_MAJEURE = data.beta;
                if (data.build) BUILD_ID = data.build;
            }
        } catch (e) {
            // XHR échoué — garder les valeurs fallback
        }

        window.VERSION_MAJEURE = VERSION_MAJEURE;
        window.BUILD_ID = BUILD_ID;

        // BACKLOG #285 — Détecter les scripts périmés en cache Safari file://.
        // Chaque script critique inscrit dans cet objet doit embarquer un snapshot
        // du build. Comparer chaque snapshot au BUILD_ID lu depuis version.json :
        // - snapshot != BUILD_ID → périmé
        // - snapshot absent (undefined) → AUSSI considéré périmé, car le script
        //   est attendu dans la liste mais n'a pas exposé son snapshot. C'est
        //   exactement le cas d'une version cachée AVANT introduction de #285.
        // Pour retirer un script de la surveillance, retirer son entrée de l'objet.
        var snapshotsAVerifier = {
            'init-inline.js': _SCRIPT_BUILD,
            'main.js': window._SCRIPT_BUILD_main
        };
        var scriptsPerimes = [];
        for (var nomScript in snapshotsAVerifier) {
            var snap = snapshotsAVerifier[nomScript];
            if (snap !== BUILD_ID) {
                scriptsPerimes.push(nomScript + ' (' + (snap || 'snapshot manquant') + ')');
            }
        }

        if (scriptsPerimes.length > 0) {
            var cleReload = '_monitorage_reload_' + BUILD_ID;
            if (!sessionStorage.getItem(cleReload)) {
                // Première tentative : recharger la page pour forcer la relecture des fichiers
                sessionStorage.setItem(cleReload, '1');
                location.reload();
                return;
            }
            // Le rechargement n'a pas suffi — avertir l'utilisateur
            console.warn('[init] Scripts p\u00e9rim\u00e9s. Build attendu : ' + BUILD_ID + '. P\u00e9rim\u00e9s : ' + scriptsPerimes.join(', '));
            setTimeout(function() {
                var bandeau = document.createElement('div');
                bandeau.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px 16px;background:#e84057;color:#fff;text-align:center;z-index:99999;font-size:14px;font-family:system-ui,sans-serif';
                bandeau.innerHTML = 'Scripts p\u00e9rim\u00e9s : ' + scriptsPerimes.join(', ') + ' au lieu de build ' + BUILD_ID + '. <strong>Quitter Safari (Cmd+Q) et le relancer.</strong>';
                document.body.prepend(bandeau);
            }, 300);
        } else {
            // Scripts à jour — nettoyer les anciens flags de reload
            try {
                for (var i = sessionStorage.length - 1; i >= 0; i--) {
                    var k = sessionStorage.key(i);
                    if (k && k.indexOf('_monitorage_reload_') === 0) {
                        sessionStorage.removeItem(k);
                    }
                }
            } catch (e) { /* ignore */ }
        }

        afficherBuildNumero();
        var spanBeta = document.getElementById('apropos-version-beta');
        var spanBuild = document.getElementById('apropos-version-build');
        if (spanBeta) spanBeta.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuild) spanBuild.textContent = BUILD_ID;
        var spanBetaAide = document.getElementById('aide-apropos-version-beta');
        var spanBuildAide = document.getElementById('aide-apropos-version-build');
        if (spanBetaAide) spanBetaAide.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuildAide) spanBuildAide.textContent = BUILD_ID;
        return;
    }

    // === Protocole HTTP/HTTPS — fetch normal ===
    try {
        const r = await fetch('version.json', { cache: 'no-store' });
        if (!r.ok) return;
        const data = await r.json();
        if (data.beta) VERSION_MAJEURE = data.beta;
        if (data.build) BUILD_ID = data.build;
        window.VERSION_MAJEURE = VERSION_MAJEURE;
        window.BUILD_ID = BUILD_ID;
        afficherBuildNumero();
        var spanBeta = document.getElementById('apropos-version-beta');
        var spanBuild = document.getElementById('apropos-version-build');
        if (spanBeta) spanBeta.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuild) spanBuild.textContent = BUILD_ID;
        var spanBetaAide = document.getElementById('aide-apropos-version-beta');
        var spanBuildAide = document.getElementById('aide-apropos-version-build');
        if (spanBetaAide) spanBetaAide.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuildAide) spanBuildAide.textContent = BUILD_ID;
    } catch (e) {
        // Hors-ligne : on garde les valeurs fallback
        var spanBeta = document.getElementById('apropos-version-beta');
        var spanBuild = document.getElementById('apropos-version-build');
        if (spanBeta) spanBeta.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuild) spanBuild.textContent = BUILD_ID;
        var spanBetaAide = document.getElementById('aide-apropos-version-beta');
        var spanBuildAide = document.getElementById('aide-apropos-version-build');
        if (spanBetaAide) spanBetaAide.textContent = 'Beta ' + VERSION_MAJEURE;
        if (spanBuildAide) spanBuildAide.textContent = BUILD_ID;
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Fermer le modal News si on clique sur l'overlay
    const modalNews = document.getElementById('modalNouveautes');
    if (modalNews) {
        modalNews.addEventListener('click', function(e) {
            if (e.target === modalNews) {
                fermerModalNouveautes();
            }
        });
    }

    // Générer le contenu du changelog dynamiquement
    var conteneur = document.getElementById('changelog-contenu');
    if (conteneur && typeof genererChangelogHTML === 'function') {
        conteneur.innerHTML = genererChangelogHTML();
    }

    // Afficher le numéro de build dans l'entête (fallback immédiat)
    afficherBuildNumero();

    // Puis synchroniser depuis version.json (source de vérité)
    chargerVersionJSON();

    // Mettre à jour l'affichage de la pastille (no-op si accueil pas encore rendu)
    mettreAJourPastille();
});

/**
 * BANDEAU VERSION — Affiché à chaque nouveau build (local + distant)
 * Persistant jusqu'à ce que l'utilisateur clique sur X.
 * Mémorise le build "vu" dans localStorage pour ne pas réafficher.
 */
const CLE_BANDEAU_VU = 'monitorage-bandeau-vu';
let miseAJourDejaSignalee = false;

function afficherBandeauVersion(beta, build, distant) {
    const bandeau = document.getElementById('bandeau-mise-a-jour');
    const elBuild = document.getElementById('bandeau-mise-a-jour-build');
    const elTexte = document.getElementById('bandeau-mise-a-jour-texte');
    const elDate = document.getElementById('bandeau-mise-a-jour-date');
    if (!bandeau || !elBuild || !elTexte || !elDate) return;

    const maintenant = new Date();
    const dateStr = maintenant.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
    const heureStr = maintenant.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

    elBuild.textContent = `BETA ${beta} (BUILD ${build})`;
    elTexte.textContent = `Une mise à jour a été déployée en arrière-plan pendant que tu travailles. Rafraîchis la page pour l\u2019activer. Tes données persistent.`;
    elDate.textContent = `${dateStr} à ${heureStr}`;

    bandeau.classList.add('visible');
}

function fermerBandeauMiseAJour() {
    const bandeau = document.getElementById('bandeau-mise-a-jour');
    if (bandeau) {
        bandeau.classList.remove('visible');
    }
    localStorage.setItem(CLE_BANDEAU_VU, BUILD_ID);
}

/**
 * POLLING — Vérification de mise à jour distante (version.json)
 */
async function verifierMiseAJourDistante() {
    if (miseAJourDejaSignalee) return;
    if (window.location.protocol === 'file:') return; // fetch impossible en file://
    try {
        const reponse = await fetch('version.json', { cache: 'no-store' });
        if (!reponse.ok) return;
        const data = await reponse.json();
        if (data.build && data.build !== BUILD_ID) {
            miseAJourDejaSignalee = true;
            afficherBandeauVersion(data.beta || VERSION_MAJEURE, data.build, true);
        }
    } catch (e) {
        // Silencieux si hors-ligne ou erreur réseau
    }
}

// Au chargement : afficher le bandeau si ce build n'a pas été vu
document.addEventListener('DOMContentLoaded', function() {
    const bandeauVu = localStorage.getItem(CLE_BANDEAU_VU);
    if (bandeauVu !== BUILD_ID) {
        afficherBandeauVersion(VERSION_MAJEURE, BUILD_ID, false);
    }

    // Polling distant : première vérif après 30s, puis toutes les 5 min
    setTimeout(verifierMiseAJourDistante, 30000);
    setInterval(verifierMiseAJourDistante, 5 * 60 * 1000);
});

// Export des fonctions pour usage global
window.afficherModalNouveautes = afficherModalNouveautes;
window.fermerModalNouveautes = fermerModalNouveautes;
window.allerVersNotesDeVersion = allerVersNotesDeVersion;
window.fermerBandeauMiseAJour = fermerBandeauMiseAJour;
window.BUILD_ID = BUILD_ID;
window.VERSION_MAJEURE = VERSION_MAJEURE;

// ===============================
// SECTION: Débogage visuel (ex-ligne 17288)
// ===============================

// Mise à jour de la zone de débogage visuelle
setInterval(() => {
    const debugSection = document.getElementById('debug-section');
    const debugSousSection = document.getElementById('debug-sous-section');

    if (debugSection && typeof sectionActive !== 'undefined') {
        debugSection.textContent = sectionActive || '--';
    }

    if (debugSousSection && typeof sousSectionActive !== 'undefined') {
        debugSousSection.textContent = sousSectionActive || '--';
    }
}, 500);

// ===============================
// SECTION: Emoji toggle listeners (ex-ligne 17305)
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les emojis avec la classe emoji-toggle
    const emojiToggles = document.querySelectorAll('.emoji-toggle');

    emojiToggles.forEach(emoji => {
        emoji.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Récupérer l'ID de la cible depuis l'attribut data-target
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Toggle la visibilité
                if (targetElement.style.display === 'none' || targetElement.style.display === '') {
                    targetElement.style.display = 'block';
                } else {
                    targetElement.style.display = 'none';
                }
            }
        });
    });
});

// ===============================
// SECTION: Moteur de recherche Aide (ex-ligne 17437)
// ===============================

/**
 * Groupes de termes similaires pour suggestions de recherche.
 * Chercher un terme d'un groupe propose les autres comme alternatives.
 */
var SYNONYMES_AIDE = [
    ['rai', 'réponse à l\'intervention', 'niveau 1', 'niveau 2', 'niveau 3', 'interventions', 'dépistage'],
    ['difficulté', 'difficulté persistante', 'difficulté émergente', 'défi spécifique', 'score multistructurel', 'pattern', 'suivi', 'ipb', 'fondamentaux', 'plateau'],
    ['performance', 'indice p', 'note', 'artefact', 'portfolio', 'meilleurs artefacts'],
    ['assiduité', 'indice a', 'présence', 'absence', 'taux de présence'],
    ['complétion', 'indice c', 'remise', 'taux de remise'],
    ['mobilisation', 'assiduité et complétion'],
    ['idme', 'insuffisant', 'en développement', 'maîtrise', 'étendu', 'échelle de performance'],
    ['srpnf', 'structure', 'rigueur', 'plausibilité', 'nuance', 'français écrit', 'critères'],
    ['cartouche', 'rétroaction', 'commentaire', 'feedback'],
    ['production', 'artefact', 'travail', 'devoir', 'évaluation'],
    ['pratique', 'notation', 'pan', 'sommative', 'standards', 'spécifications'],
    ['codex', 'usb', 'clé', 'sauvegarde portable', 'zip'],
    ['solo', 'unistructurel', 'multistructurel', 'relationnel', 'abstrait étendu', 'taxonomie']
];

/**
 * Trouve les termes similaires pour une recherche donnée.
 * @param {string} recherche - Terme recherché (lowercase)
 * @returns {Array} Termes similaires (sans le terme lui-même)
 */
function trouverSynonymes(recherche) {
    var resultats = [];
    SYNONYMES_AIDE.forEach(function(groupe) {
        var match = groupe.some(function(terme) {
            return terme.indexOf(recherche) !== -1 || recherche.indexOf(terme) !== -1;
        });
        if (match) {
            groupe.forEach(function(terme) {
                if (terme !== recherche && resultats.indexOf(terme) === -1) {
                    resultats.push(terme);
                }
            });
        }
    });
    return resultats;
}

/**
 * Recherche dans la section Aide en temps réel
 */
function rechercherDansAide() {
    const input = document.getElementById('aide-recherche-input');
    const clearBtn = document.getElementById('aide-recherche-clear');
    const resultatsDiv = document.getElementById('aide-recherche-resultats');
    const recherche = input.value.trim().toLowerCase();

    // Afficher/masquer le bouton X
    clearBtn.style.display = recherche ? 'block' : 'none';

    // Si recherche vide, tout réafficher
    if (!recherche) {
        reafficherToutesLesCartes();
        resultatsDiv.style.display = 'none';
        return;
    }

    // Rechercher dans toutes les cartes
    const cartes = document.querySelectorAll('#section-aide .carte');
    let nbResultats = 0;
    let cartesAvecResultats = [];

    cartes.forEach(carte => {
        // Retirer les surlignages précédents
        retirerSurlignage(carte);

        // Chercher dans le texte de la carte
        const texte = carte.textContent.toLowerCase();

        if (texte.includes(recherche)) {
            carte.style.display = 'block';

            // Extraire le titre de la carte
            var titreCarte = carte.querySelector('.carte-titre-bleu');
            var titreTexte = titreCarte ? titreCarte.textContent.trim().replace(/^[▶▼]\s*/, '').trim() : '';
            cartesAvecResultats.push({ element: carte, titre: titreTexte });

            // Surligner les occurrences
            nbResultats += surlignerTexte(carte, recherche);
        } else {
            carte.style.display = 'none';
        }
    });

    // Afficher les sous-sections contenant des résultats, masquer les autres
    const sousSections = document.querySelectorAll('#section-aide .sous-section');
    sousSections.forEach(section => {
        var aDesResultats = section.querySelectorAll('.carte[style*="display: block"]').length > 0;
        if (aDesResultats) {
            section.classList.add('active');
            var titre = section.querySelector('h2');
            if (titre) titre.style.display = '';
        } else {
            section.classList.remove('active');
        }
    });

    // Construire le HTML des résultats
    resultatsDiv.style.display = 'block';
    var html = '';

    if (cartesAvecResultats.length === 0) {
        html = '<span style="color:#dc3545;">❌ Aucun résultat trouvé pour « ' + recherche + ' »</span>';
    } else {
        html = '<span style="color:#28a745;">' + nbResultats + ' occurrence(s) dans ' + cartesAvecResultats.length + ' carte(s) :</span>';
        html += '<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">';
        cartesAvecResultats.forEach(function(item) {
            var id = item.element.id || '';
            html += '<button class="btn btn-secondaire btn-mini" data-action="allerVersCarte" data-param="' + id + '">' + item.titre + '</button>';
        });
        html += '</div>';
    }

    // Suggestions de synonymes
    var synonymes = trouverSynonymes(recherche);
    if (synonymes.length > 0) {
        html += '<div style="margin-top:8px; font-size:0.8rem; color:var(--texte-secondaire, #8aa);">';
        html += 'Recherches similaires : ';
        html += synonymes.map(function(s) {
            var sEchappe = s.replace(/'/g, "\\'");
            return '<a href="#" data-prevent data-action="lancerRechercheSynonyme" data-param="' + sEchappe + '" style="color:var(--accent-primaire, #6aacb8); text-decoration:underline; cursor:pointer;">' + s + '</a>';
        }).join(' · ');
        html += '</div>';
    }

    resultatsDiv.innerHTML = html;
    resultatsDiv.style.color = '';
}

/**
 * Surligne le texte recherché dans un élément
 */
function surlignerTexte(element, recherche) {
    let nbOccurrences = 0;
    const regex = new RegExp('(' + recherche.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');

    // Parcourir tous les nœuds de texte
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesATraiter = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(recherche)) {
            nodesATraiter.push(node);
        }
    }

    nodesATraiter.forEach(node => {
        const parent = node.parentNode;

        // Ne pas surligner dans les scripts ou styles
        if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') {
            return;
        }

        const texte = node.textContent;
        const fragments = texte.split(regex);

        if (fragments.length > 1) {
            const span = document.createElement('span');

            fragments.forEach((fragment, index) => {
                if (fragment.toLowerCase() === recherche.toLowerCase()) {
                    const mark = document.createElement('mark');
                    mark.textContent = fragment;
                    mark.style.backgroundColor = '#ffeb3b';
                    mark.style.padding = '2px 4px';
                    mark.style.borderRadius = '3px';
                    mark.style.fontWeight = 'bold';
                    mark.className = 'aide-surlignage';
                    span.appendChild(mark);
                    nbOccurrences++;
                } else if (fragment) {
                    span.appendChild(document.createTextNode(fragment));
                }
            });

            parent.replaceChild(span, node);
        }
    });

    return nbOccurrences;
}

/**
 * Retire tous les surlignages
 */
function retirerSurlignage(element) {
    const marks = element.querySelectorAll('mark.aide-surlignage');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize(); // Fusionner les nœuds de texte adjacents
    });
}

/**
 * Réaffiche toutes les cartes et sous-sections
 */
function reafficherToutesLesCartes() {
    // Réafficher toutes les cartes
    const cartes = document.querySelectorAll('#section-aide .carte');
    cartes.forEach(carte => {
        carte.style.display = '';
        retirerSurlignage(carte);
    });

    // Réafficher tous les titres de sous-sections
    const titres = document.querySelectorAll('#section-aide .sous-section h2');
    titres.forEach(titre => {
        titre.style.display = '';
    });

    // Restaurer la sous-section active originale
    const sousSections = document.querySelectorAll('#section-aide .sous-section');
    sousSections.forEach(ss => ss.classList.remove('active'));
    var idActive = (typeof sousSectionActive === 'string' && sousSectionActive.startsWith('aide-')) ? sousSectionActive : 'aide-introduction';
    var ssActive = document.getElementById(idActive);
    if (ssActive) ssActive.classList.add('active');
}

/**
 * Efface la recherche et réinitialise l'affichage
 */
function effacerRechercheAide() {
    const input = document.getElementById('aide-recherche-input');
    const clearBtn = document.getElementById('aide-recherche-clear');
    const resultatsDiv = document.getElementById('aide-recherche-resultats');

    input.value = '';
    clearBtn.style.display = 'none';
    resultatsDiv.style.display = 'none';
    reafficherToutesLesCartes();

    // Remettre le focus sur le champ
    input.focus();
}

/**
 * Scrolle vers une carte et l'ouvre si fermée
 * @param {string} carteId - ID de la carte (accordeon)
 */
function allerVersCarte(carteId) {
    var carte = document.getElementById(carteId);
    if (!carte) return;

    // Activer la sous-section parente si nécessaire
    var sousSection = carte.closest('.sous-section');
    if (sousSection && !sousSection.classList.contains('active')) {
        sousSection.classList.add('active');
    }

    // Ouvrir l'accordeon si fermé
    if (carte.classList.contains('ferme')) {
        var header = carte.querySelector('.accordeon-header');
        if (header && typeof toggleAccordeonV2 === 'function') {
            toggleAccordeonV2(header);
        }
    }

    // Scroller vers la carte
    carte.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Lance une recherche a partir d'un synonyme cliqué
 * @param {string} terme - Terme a rechercher
 */
function lancerRechercheSynonyme(terme) {
    var input = document.getElementById('aide-recherche-input');
    if (!input) return;
    input.value = terme;
    rechercherDansAide();
    input.focus();
}

// Amélioration UX : Focus sur le champ de recherche avec Ctrl+F ou Cmd+F
document.addEventListener('keydown', function(e) {
    // Vérifier si on est dans la section Aide
    const sectionAide = document.getElementById('section-aide');
    if (!sectionAide || !sectionAide.classList.contains('active')) {
        return;
    }

    // Ctrl+F ou Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const input = document.getElementById('aide-recherche-input');
        if (input) {
            input.focus();
            input.select();
        }
    }

    // ESC pour effacer
    if (e.key === 'Escape') {
        const input = document.getElementById('aide-recherche-input');
        if (input && document.activeElement === input) {
            effacerRechercheAide();
        }
    }
});

// ===============================
// SECTION: Wrappers Phase 5b — mat-echelle (ex-ligne 17752)
// ===============================

// Wrapper: mat-echelle-id change (afficherPreviewEchelleMat + peuplerDropdownNoteMaximaleMat)
function onMatEchelleIdChange() {
    afficherPreviewEchelleMat();
    peuplerDropdownNoteMaximaleMat();
}

// Wrapper: mat-selection-nombre change (recalculer + sauvegarder)
function onMatSelectionNombreChange() {
    recalculerPonderationsUnitaires();
    sauvegarderConfigPratiqueMat();
}

// Wrapper: mat-selection-ponderation change (valider + recalculer + sauvegarder)
function onMatSelectionPonderationChange() {
    validerPonderationsCategoriesMat();
    recalculerPonderationsUnitaires();
    sauvegarderConfigPratiqueMat();
}

// Wrapper: mat-obligatoires-ponderation change (valider + recalculer + sauvegarder)
function onMatObligatoiresPonderationChange() {
    validerPonderationsCategoriesMat();
    recalculerPonderationsUnitaires();
    sauvegarderConfigPratiqueMat();
}

// Wrapper: questions-filtre-categorie change (this.value -> el.value)
function changerFiltreCategorieFromEl(el) {
    if (typeof changerFiltreCategorie === 'function') {
        changerFiltreCategorie(el.value);
    }
}

// ===============================
// SECTION: Debug + stubs obsolètes (ex-ligne 17788)
// ===============================

// ========================================
// DEBUG: AFFICHER LE CONTENU DU LOCALSTORAGE
// ========================================
function debugLocalStorage() {
    console.clear();

    // Lister toutes les clés
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
    }

    // Vérifier productions (clé: productions)
    const productions = localStorage.getItem('productions');
    if (productions) {
        try {
            const parsed = JSON.parse(productions);
        } catch (e) {
        }
    } else {
    }

    // Vérifier grillesTemplates
    const grilles = localStorage.getItem('grillesTemplates');
    if (grilles) {
        try {
            const parsed = JSON.parse(grilles);
            if (Array.isArray(parsed)) {
            } else {
            }
        } catch (e) {
        }
    } else {
    }

    // Vérifier échelles
    const echellesTemplates = localStorage.getItem('echellesTemplates');
    const niveauxEchelle = localStorage.getItem('niveauxEchelle');
    const configEchelle = localStorage.getItem('configEchelle');

    if (echellesTemplates || niveauxEchelle || configEchelle) {
        if (echellesTemplates) {
        }
        if (niveauxEchelle) {
        }
        if (configEchelle) {
        }
    } else {
    }

    alert('Informations affichées dans la console du navigateur.\n\nAppuie sur F12 pour voir les détails.');
}

// ========================================
// EXPORT DES GRILLES D'ÉVALUATION
// ========================================
// SUPPRIMÉ : La fonction exporterGrilles() est maintenant dans js/grilles.js avec support CC

// ========================================
// EXPORT DES ÉCHELLES DE PERFORMANCE
// ========================================
// Les fonctions exporterEchelles() et exporterEchelleActive() sont définies dans js/echelles.js
// Elles exportent les échelles avec métadonnées CC BY-NC-SA 4.0

// ========================================
// EXPORT DES PRODUCTIONS
// ========================================
// La fonction exporterProductions() est définie dans js/productions.js
// Elle exporte toutes les productions avec métadonnées CC BY-NC-SA 4.0

// ========================================
// IMPORT DES GRILLES D'ÉVALUATION
// ========================================
// OBSOLÈTE : Cette fonction a été déplacée vers grilles.js (supporte nouveau format CC)
// La fonction importerGrilles() est maintenant chargée depuis grilles.js

// ========================================
// IMPORT DES ÉCHELLES DE PERFORMANCE
// ========================================
// OBSOLÈTE : Cette fonction a été déplacée vers echelles.js (supporte nouveau format CC)
// La fonction importerEchelles() est maintenant chargée depuis echelles.js

// ========================================
// IMPORT DES PRODUCTIONS
// ========================================
// OBSOLÈTE (8 jan 2026) : Cette fonction a été déplacée vers productions.js (supporte nouveau format CC)
// La fonction importerProductions() est maintenant chargée depuis productions.js
