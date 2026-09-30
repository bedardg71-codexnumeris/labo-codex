/* ===============================
   MODULE: RAPPORT DE BUG POUR TESTEURS
   Beta 98.9 - 27 mars 2026

   Permet aux testeurs d'envoyer facilement des rapports de bug
   avec les informations techniques necessaires au debogage.

   FONCTIONNALITES :
   - Stack trace complet pour les erreurs
   - Historique des 10 dernieres actions (clics, navigation)
   - Contexte de donnees selon la section active
   - Etat stockage pertinent (localStorage, memoryCache, IDB)
   - Selecteur de gravite (bloquant/genant/mineur)
   - Protection troncature mailto: (copie presse-papiers si trop long)
   - Persistance du prenom testeur
   - Mode commentaire/feedback
   - Archivage local des rapports
   =============================== */

(function() {
'use strict';

// ===============================
// VERSION DE L'APPLICATION
// ===============================

/**
 * Version actuelle de l'application (lue dynamiquement)
 */
function getVersionApp() {
    return 'Bêta publique ' + (window.VERSION_MAJEURE || '??');
}

// ===============================
// ARCHIVAGE LOCAL DES RAPPORTS
// ===============================

const CLE_RAPPORTS_ARCHIVES = 'rapportsBugArchives';
// Phase 6.2 PLAN-AQPC (22 mai 2026) : seuil réduit 50 → 20 pour réduire
// l'empreinte de PII potentielle (descriptions libres pouvant contenir
// indirectement des noms d'étudiants saisis par les testeurs).
const MAX_RAPPORTS_ARCHIVES = 20;

const CLE_PRENOM_TESTEUR = 'prenomTesteurBug';

// Mode actif du modal (bug ou commentaire)
let modeRapport = 'bug';
// Gravité du rapport (bloquant, normal, mineur)
let graviteRapport = 'normal';

/**
 * Normalise un prénom pour comparaison (minuscules, sans accents, sans espaces superflus)
 */
function normaliserPrenom(prenom) {
    return (prenom || '').trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


// mettreAJourBadgeBug : stub vide (suivi tickets retiré, conservé car exporté)
function mettreAJourBadgeBug() {}

/**
 * Archive un rapport de bug localement
 */
function archiverRapportBug(rapport, description, prenom, type) {
    try {
        const archives = db.getSync(CLE_RAPPORTS_ARCHIVES, []);

        const nouveauRapport = {
            id: genererIdUnique('BUG_'),
            date: new Date().toISOString(),
            prenom: prenom || 'Anonyme',
            description: description || 'Aucune description',
            rapport: rapport,
            envoye: true,
            type: type || 'bug'
        };

        archives.unshift(nouveauRapport);

        // Garder seulement les derniers rapports
        if (archives.length > MAX_RAPPORTS_ARCHIVES) {
            archives.length = MAX_RAPPORTS_ARCHIVES;
        }

        db.setSync(CLE_RAPPORTS_ARCHIVES, archives);
    } catch (e) {
        console.error('[Rapport Bug] Erreur archivage:', e);
    }
}

/**
 * Récupère les rapports archivés
 */
function obtenirRapportsArchives() {
    try {
        return db.getSync(CLE_RAPPORTS_ARCHIVES, []);
    } catch (e) {
        return [];
    }
}

/**
 * Supprime un rapport archivé
 */
function supprimerRapportArchive(id) {
    try {
        let archives = obtenirRapportsArchives();
        archives = archives.filter(r => r.id !== id);
        db.setSync(CLE_RAPPORTS_ARCHIVES, archives);
        return true;
    } catch (e) {
        console.error('[Rapport Bug] Erreur suppression:', e);
        return false;
    }
}

/**
 * Supprime tous les rapports archivés
 */
function viderRapportsArchives() {
    db.setSync(CLE_RAPPORTS_ARCHIVES, []);
}

// Couleur de bordure des archives (suivi tickets retiré — couleur neutre)
function obtenirCouleurArchive() {
    return 'var(--accent-primaire)';
}

// Opacité des archives (suivi tickets retiré — jamais confirmé)
function estArchiveConfirme() {
    return false;
}

/**
 * Affiche le modal de gestion des rapports archivés
 */
function ouvrirModalRapportsArchives() {
    const archives = obtenirRapportsArchives();

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('fr-CA') + ' ' + d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    };

    const listeHTML = archives.length === 0
        ? '<p style="text-align: center; color: var(--gris-moyen); padding: 30px;">Aucun rapport archivé</p>'
        : archives.map(r => {
            const couleurBordure = obtenirCouleurArchive(r);
            const opacite = estArchiveConfirme(r) ? '0.6' : '1';
            const typeBadge = r.type === 'commentaire'
                ? '<span style="font-size: 0.75rem; background: var(--accent-primaire); color: white; padding: 1px 6px; border-radius: 4px; margin-left: 8px;">💬</span>'
                : '';
            return `
            <div style="background: var(--gris-tres-pale); border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 3px solid ${couleurBordure}; opacity: ${opacite};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: var(--accent-primaire);">${r.prenom}</strong>${typeBadge}
                        <span style="color: var(--gris-moyen); font-size: 0.85rem; margin-left: 10px;">${formatDate(r.date)}</span>
                    </div>
                    <button data-action="supprimerEtRafraichirArchive" data-param="${r.id}" style="
                        background: none; border: none; cursor: pointer; font-size: 1.2rem;
                        padding: 0;" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 0.9rem; color: var(--gris-fonce);">
                    ${(r.description || 'Aucune description').substring(0, 100)}${r.description?.length > 100 ? '…' : ''}
                </p>
                <button data-action="afficherRapportComplet" data-param="${r.id}" class="btn btn-secondaire" style="font-size: 0.8rem; padding: 4px 10px;">
                    Voir le rapport complet
                </button>
            </div>
        `}).join('');

    const modalHTML = `
        <div id="modalRapportsArchives" class="modal-overlay actif" style="z-index: 10001;">
            <div class="modal-contenu modal-compact">
                <button class="modal-fermer" data-action="fermerModalRapportsArchives"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                <h3 class="modal-titre">Rapports archivés (${archives.length})</h3>
                <div class="modal-section" id="listeRapportsArchives" style="max-height: 55vh; overflow-y: auto;">
                    ${listeHTML}
                </div>
                ${archives.length > 0 ? `
                <div class="modal-actions">
                    <button data-action="viderEtRafraichirArchives"
                            class="btn btn-secondaire" style="color: var(--rouge-erreur);">
                        Tout supprimer
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
}

function fermerModalRapportsArchives() {
    const modal = document.getElementById('modalRapportsArchives');
    if (modal?.parentElement) modal.parentElement.remove();
}

function supprimerEtRafraichirArchive(id) {
    supprimerRapportArchive(id);
    rafraichirListeArchives();
}

function rafraichirListeArchives() {
    fermerModalRapportsArchives();
    ouvrirModalRapportsArchives();
}

function viderEtRafraichirArchives() {
    if (confirm('Supprimer tous les rapports archivés ?')) {
        viderRapportsArchives();
        rafraichirListeArchives();
    }
}

function afficherRapportComplet(id) {
    const archives = obtenirRapportsArchives();
    const rapport = archives.find(r => r.id === id);
    if (!rapport) return;

    alert(rapport.rapport);
}

// ===============================
// CAPTURE DES ERREURS CONSOLE
// ===============================

// Stocker les dernières erreurs console (max 20)
const dernieresErreurs = [];
const MAX_ERREURS = 20;

// Intercepter console.error pour capturer les erreurs avec stack trace complet
const originalConsoleError = console.error;
console.error = function(...args) {
    // Appeler l'original
    originalConsoleError.apply(console, args);

    // Stocker l'erreur avec stack trace complet
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    let message = '';
    let stackTrace = '';

    args.forEach(arg => {
        if (arg instanceof Error) {
            message += arg.message + ' ';
            // ✅ Stack trace complet
            if (arg.stack) {
                stackTrace = arg.stack;
            }
        } else {
            message += String(arg) + ' ';
        }
    });

    // Si pas de stack trace, en générer un
    if (!stackTrace) {
        try {
            throw new Error('Stack trace');
        } catch (e) {
            // Retirer les 2 premières lignes (Error et cette fonction)
            stackTrace = e.stack?.split('\n').slice(3).join('\n') || '';
        }
    }

    dernieresErreurs.push({
        timestamp,
        message: message.trim(),
        stack: stackTrace
    });

    // Garder seulement les dernières erreurs
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
};

// Capturer aussi les erreurs non gérées avec stack trace
window.addEventListener('error', (event) => {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    dernieresErreurs.push({
        timestamp,
        message: `[UNCAUGHT] ${event.message}`,
        stack: event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`
    });
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
});

// Capturer les rejets de promesses non gérés
window.addEventListener('unhandledrejection', (event) => {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    const reason = event.reason;
    dernieresErreurs.push({
        timestamp,
        message: `[PROMISE REJECTED] ${reason?.message || reason}`,
        stack: reason?.stack || 'No stack trace'
    });
    if (dernieresErreurs.length > MAX_ERREURS) {
        dernieresErreurs.shift();
    }
});

// Lot G (#988) : les avertissements du CODEX seulement (préfixe « [Codex] » ou « 📂 »),
// pour lire la cause d'une mise à jour qui échoue. Les autres modules avertissent beaucoup,
// et ce rapport se lit à la main. Message tronqué, sans pile.
const derniersAvertissementsCodex = [];
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    const premier = typeof args[0] === 'string' ? args[0] : '';
    if (premier.indexOf('[Codex]') !== 0 && premier.indexOf('📂') !== 0) return;
    const message = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ').slice(0, 300);
    derniersAvertissementsCodex.push({ timestamp: new Date().toLocaleTimeString('fr-CA'), message });
    if (derniersAvertissementsCodex.length > MAX_ERREURS) derniersAvertissementsCodex.shift();
};

/**
 * Lot G (#988) : la section « DERNIÈRE MISE À JOUR DU CODEX ». Ce que `Codex.derniereTentative`
 * garde : heure, étape atteinte, tailles, stratégie, toucher frais, erreur, issue. Ni nom de fichier ni contenu.
 */
function sectionDerniereMiseAJourCodex() {
    let t = null;
    try {
        t = (window.Codex && typeof window.Codex.derniereTentative === 'function') ? window.Codex.derniereTentative() : null;
    } catch (e) { t = null; }
    let texte = `--- DERNIÈRE MISE À JOUR DU CODEX ---\n`;
    if (!t) return texte + `Aucune tentative dans cet onglet\n\n`;
    const heure = (iso) => (iso ? new Date(iso).toLocaleString('fr-CA') : '—');
    const octets = (n) => (typeof n === 'number' ? `${n} octets` : '—');
    texte += `Geste: ${t.geste || '—'}\n`;
    texte += `Début: ${heure(t.debut)}\n`;
    texte += `Étape atteinte: ${t.etape || '—'}\n`;
    texte += `Taille estimée: ${octets(t.tailleEstimeeOctets)}\n`;
    texte += `Taille du fichier: ${octets(t.tailleOctets)}\n`;
    texte += `Essais d'écriture: ${t.essais || 0}\n`;
    texte += `Stratégie: ${t.strategie || '—'}\n`;
    // Lot J0 bis (#988) : la fenêtre « Ton codex est prêt » a-t-elle été ouverte, et son issue.
    texte += `Toucher frais: ${t.toucherFrais || 'non demandé'}\n`;
    texte += `Erreur: ${t.erreur ? `${t.erreur.nom} – ${t.erreur.message}` : '—'}\n`;
    texte += `Issue: ${t.issue || '—'}\n`;
    texte += `Fin: ${heure(t.fin)}\n\n`;
    return texte;
}

// ===============================
// HISTORIQUE DES ACTIONS
// ===============================

const dernieresActions = [];
const MAX_ACTIONS = 20;

/**
 * Enregistre une action utilisateur
 */
function enregistrerAction(type, details) {
    const timestamp = new Date().toLocaleTimeString('fr-CA');
    dernieresActions.push({ timestamp, type, details });
    if (dernieresActions.length > MAX_ACTIONS) {
        dernieresActions.shift();
    }
}

// Intercepter les clics
document.addEventListener('click', (event) => {
    const target = event.target;
    let description = '';

    // Identifier l'élément cliqué
    if (target.id) {
        description = `#${target.id}`;
    } else if (target.className && typeof target.className === 'string') {
        description = `.${target.className.split(' ')[0]}`;
    } else {
        description = target.tagName.toLowerCase();
    }

    // Ajouter le texte si disponible
    const texte = target.textContent?.substring(0, 30).trim();
    if (texte && texte.length > 0) {
        description += ` "${texte}${texte.length >= 30 ? '…' : ''}"`;
    }

    enregistrerAction('clic', description);
}, true);

// Intercepter les changements de navigation (si la fonction existe)
const originalAfficherSection = window.afficherSection;
if (typeof originalAfficherSection === 'function') {
    window.afficherSection = function(section, sousSection) {
        enregistrerAction('navigation', `${section} > ${sousSection || 'défaut'}`);
        return originalAfficherSection.apply(this, arguments);
    };
}

// ===============================
// COLLECTE D'INFORMATIONS
// ===============================

/**
 * Obtient les informations sur le navigateur et le système
 */
function obtenirInfosSysteme() {
    const ua = navigator.userAgent;
    let navigateur = 'Inconnu';
    let os = 'Inconnu';
    let appareil = '';

    // Détecter le navigateur
    if (ua.includes('Safari') && !ua.includes('Chrome')) {
        const match = ua.match(/Version\/(\d+\.\d+)/);
        navigateur = `Safari ${match ? match[1] : ''}`;
    } else if (ua.includes('Chrome')) {
        const match = ua.match(/Chrome\/(\d+)/);
        navigateur = `Chrome ${match ? match[1] : ''}`;
    } else if (ua.includes('Firefox')) {
        const match = ua.match(/Firefox\/(\d+)/);
        navigateur = `Firefox ${match ? match[1] : ''}`;
    } else if (ua.includes('Edge')) {
        navigateur = 'Edge';
    }

    // Détecter l'OS et l'appareil
    // Depuis iPadOS 13, l'iPad se fait passer pour macOS dans le user agent.
    // On le detecte via maxTouchPoints (iPad=5, Mac=0).
    const estIPad = (ua.includes('Mac OS X') && navigator.maxTouchPoints > 1) || ua.includes('iPad');
    const estIPhone = ua.includes('iPhone');

    if (estIPad) {
        os = 'iPadOS';
        appareil = 'iPad';
    } else if (estIPhone) {
        os = 'iOS';
        appareil = 'iPhone';
    } else if (ua.includes('Mac OS X')) {
        const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
        os = `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        appareil = 'Mac';
    } else if (ua.includes('Windows')) {
        os = 'Windows';
        appareil = 'PC';
    } else if (ua.includes('Linux')) {
        os = 'Linux';
        appareil = 'PC';
    }

    return { navigateur, os, appareil };
}

/**
 * Obtient l'état actuel de l'application
 */
function obtenirEtatApplication() {
    const etat = {
        version: getVersionApp(),
        build: window.BUILD_ID || 'inconnu',
        dateHeure: new Date().toLocaleString('fr-CA'),
        sectionActive: typeof sectionActive !== 'undefined' ? sectionActive : 'inconnue',
        sousSectionActive: typeof sousSectionActive !== 'undefined' ? sousSectionActive : 'inconnue'
    };

    // Pratique de notation
    try {
        const pratiqueDefaut = db.getSync('pratiqueParDefaut', 'non définie');
        etat.pratiqueParDefaut = pratiqueDefaut;

        // Lot N1b (21 sept. 2026) : le pointeur TEL QU'IL EST ÉCRIT et l'état que rend LA désignation
        // (aucune / introuvable / ok) — ce qu'il faut pour lire un rapport « aucune note ».
        const designation = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive() : null;
        etat.pratiqueActive = designation
            ? ((designation.idBrut || 'non définie') + ' (' + designation.etat + ')')
            : 'non définie';
    } catch (e) {
        etat.pratiqueParDefaut = 'erreur lecture';
    }

    // Nombre d'étudiants
    try {
        const etudiants = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('groupeEtudiants')
            : db.getSync('groupeEtudiants', []);
        etat.nbEtudiants = Array.isArray(etudiants) ? etudiants.length : 0;
    } catch (e) {
        etat.nbEtudiants = 'erreur';
    }

    // Nombre de cours et cours actif
    try {
        const cours = db.getSync('cours', []);
        etat.nbCours = Array.isArray(cours) ? cours.length : 0;
        // Utiliser infoCours (source de vérité) plutôt que chercher dans listeCours
        const infoCours = db.getSync('infoCours', null);
        if (infoCours && infoCours.id) {
            etat.coursActif = `${infoCours.codeCours || infoCours.sigle || infoCours.id} (${infoCours.session || '?'}${infoCours.annee || ''})`;
        } else {
            etat.coursActif = 'aucun';
        }
    } catch (e) {
        etat.nbCours = 'erreur';
    }

    // Nombre de productions
    try {
        const productions = db.getSync(cle('productions'), []);
        etat.nbProductions = Array.isArray(productions) ? productions.length : 0;
    } catch (e) {
        etat.nbProductions = 'erreur';
    }

    // Mode démo
    try {
        etat.modeDemo = db.getSync('modeApplication', 'normal');
    } catch (e) {
        etat.modeDemo = 'erreur';
    }

    return etat;
}

/**
 * ✅ NOUVEAU : Obtient le contexte spécifique à la section active
 */
function obtenirContexteSection() {
    const section = typeof sectionActive !== 'undefined' ? sectionActive : '';
    const sousSection = typeof sousSectionActive !== 'undefined' ? sousSectionActive : '';
    const contexte = {};

    try {
        // Contexte selon la section
        switch (section) {
            case 'reglages':
                if (sousSection === 'trimestre' || sousSection === 'calendrier-trimestre') {
                    contexte.trimestreActif = db.getSync('trimestreActif', 'non défini');
                    contexte.infoCours = db.getSync('infoCours', {});
                }
                if (sousSection === 'groupe' || sousSection === 'reglages-groupe') {
                    contexte.dernierImport = sessionStorage.getItem('dernierImportType') || 'aucun';
                }
                if (sousSection === 'donnees' || sousSection === 'reglages-donnees') {
                    contexte.infoCours = db.getSync('infoCours', {});
                    // Vérifier le type de infoCours.enseignant
                    const info = db.getSync('infoCours', {});
                    contexte.typeEnseignant = typeof info?.enseignant;
                }
                break;

            case 'evaluations':
                contexte.nbEvaluations = (db.getSync(cle('evaluationsSauvegardees'), []) || []).length;
                // NB : corrige aussi un bug de précédence (l'objet entier était
                // affecté quand la clé namespacée existait, au lieu de .pratique)
                contexte.pratiqueActive = (db.getSync(cle('modalitesEvaluation'), null) || {}).pratique || 'non définie';
                break;

            case 'presences':
                // ✅ CORRIGÉ (22 janvier 2026) : Utiliser la clé namespacée
                const clePresences = cle('presences');
                contexte.nbPresences = (db.getSync(clePresences, []) || []).length;
                contexte.horaireActif = db.getSync('horaireActif', 'non défini');
                break;

            case 'conception':
                if (sousSection === 'productions') {
                    contexte.nbProductions = (db.getSync(cle('productions'), []) || []).length;
                }
                if (sousSection === 'grille-criteres') {
                    contexte.nbGrilles = (db.getSync(cle('grillesTemplates'), []) || []).length;
                }
                if (sousSection === 'echelle-performance') {
                    contexte.nbEchelles = (db.getSync(cle('echellesTemplates'), []) || []).length;
                }
                break;
        }
    } catch (e) {
        contexte.erreur = e.message;
    }

    return contexte;
}

/**
 * ✅ NOUVEAU : Obtient l'état des clés localStorage pertinentes
 */
function obtenirEtatStockage() {
    const clesImportantes = [
        'trimestreActif',
        'coursActifId',
        'groupeActifId',
        'modeApplication',
        'pratiqueParDefaut'
    ];

    const etat = {};
    clesImportantes.forEach(cle => {
        try {
            const valeur = db.getSync(cle, null);
            if (valeur !== null) {
                // Tronquer si trop long
                const valeurStr = typeof valeur === 'string' ? valeur : JSON.stringify(valeur);
                etat[cle] = valeurStr.length > 50 ? valeurStr.substring(0, 50) + '…' : valeurStr;
            }
        } catch (e) {
            etat[cle] = 'erreur lecture';
        }
    });

    // Ajouter les clés namespacées si trimestre actif
    try {
        const trimestre = db.getSync('trimestreActif', null);
        if (trimestre) {
            const cleNamespace = `${trimestre}_groupeEtudiants`;
            const valeur = db.getSync(cleNamespace, null);
            if (valeur) {
                etat[cleNamespace] = `${Array.isArray(valeur) ? valeur.length : '?'} étudiants`;
            }
        }
    } catch (e) {
        // Ignorer
    }

    // Stats de stockage (diagnostic quota)
    if (window._storageStats) {
        var stats = window._storageStats;
        etat['localStorage'] = stats.localStorage.nbCles + ' clés, ' + stats.localStorage.tailleFormatee;
        etat['memoryCache'] = stats.memoryCache.nbCles + ' clés';
        etat['IDB'] = stats.idb.nbCles + ' clés (' + stats.idb.syncLocalStorage + ' sync LS, ' + stats.idb.dansMemoryCache + ' en mémoire)';
    }

    return etat;
}

/**
 * Génère le rapport de bug en texte lisible
 * @param {string} descriptionUtilisateur - Description du problème
 * @param {string} prenomTesteur - Prénom du testeur (optionnel)
 */
function genererRapportBug(descriptionUtilisateur = '', prenomTesteur = '') {
    const infosSysteme = obtenirInfosSysteme();
    const etatApp = obtenirEtatApplication();
    const contexteSection = obtenirContexteSection();
    const etatStockage = obtenirEtatStockage();

    // Générer l'identifiant du rapport
    const maintenant = new Date();
    const dateId = maintenant.toISOString().slice(0, 10); // 2026-01-30
    const heureId = maintenant.toTimeString().slice(0, 8).replace(/:/g, '-'); // 18-42-23
    const prenomNormalise = prenomTesteur.trim().toLowerCase().replace(/\s+/g, '-') || 'anonyme';

    const prefixe = modeRapport === 'commentaire' ? 'FEEDBACK' : 'BUG';
    const idRapport = `${prefixe}_${prenomNormalise}_${dateId}_${heureId}`;

    let rapport = modeRapport === 'commentaire'
        ? `=== COMMENTAIRE / FEEDBACK ===\n`
        : `=== RAPPORT DE BUG ===\n`;
    rapport += `${idRapport}.txt\n`;
    rapport += `Testeur: ${prenomTesteur.trim() || 'Non spécifié'}\n`;
    rapport += `Date: ${etatApp.dateHeure}\n`;
    rapport += `Version: ${etatApp.version} (Build ${etatApp.build})\n`;

    // Gravité (uniquement en mode bug)
    if (modeRapport !== 'commentaire') {
        var labelsGravite = { bloquant: 'BLOQUANT', normal: 'GÊNANT', mineur: 'MINEUR' };
        rapport += `Gravité: ${labelsGravite[graviteRapport] || 'GÊNANT'}\n`;
    }
    rapport += `\n`;

    rapport += `--- SYSTÈME ---\n`;
    rapport += `Appareil: ${infosSysteme.appareil || 'Inconnu'}\n`;
    rapport += `Navigateur: ${infosSysteme.navigateur}\n`;
    rapport += `Système: ${infosSysteme.os}\n`;
    rapport += `Écran: ${window.screen.width}x${window.screen.height} (${window.devicePixelRatio || 1}x)\n`;
    rapport += `Touch: ${navigator.maxTouchPoints || 0} points\n\n`;

    rapport += `--- APPLICATION ---\n`;
    rapport += `Section active: ${etatApp.sectionActive} > ${etatApp.sousSectionActive}\n`;
    rapport += `Pratique par défaut: ${etatApp.pratiqueParDefaut}\n`;
    rapport += `Pratique active: ${etatApp.pratiqueActive}\n`;
    rapport += `Cours actif: ${etatApp.coursActif}\n`;
    rapport += `Nb cours: ${etatApp.nbCours}\n`;
    rapport += `Nb étudiants: ${etatApp.nbEtudiants}\n`;
    rapport += `Nb productions: ${etatApp.nbProductions}\n`;
    rapport += `Mode: ${etatApp.modeDemo}\n\n`;

    // ✅ NOUVEAU : Contexte section
    if (Object.keys(contexteSection).length > 0) {
        rapport += `--- CONTEXTE SECTION ---\n`;
        for (const [cle, valeur] of Object.entries(contexteSection)) {
            const valeurAffichee = typeof valeur === 'object' ? JSON.stringify(valeur) : valeur;
            rapport += `${cle}: ${valeurAffichee}\n`;
        }
        rapport += `\n`;
    }

    // ✅ NOUVEAU : État stockage
    if (Object.keys(etatStockage).length > 0) {
        rapport += `--- ÉTAT STOCKAGE ---\n`;
        for (const [cle, valeur] of Object.entries(etatStockage)) {
            rapport += `${cle}: ${valeur}\n`;
        }
        rapport += `\n`;
    }

    // ✅ NOUVEAU : Historique des actions
    if (dernieresActions.length > 0) {
        rapport += `--- DERNIÈRES ACTIONS (${dernieresActions.length}) ---\n`;
        dernieresActions.forEach(action => {
            rapport += `[${action.timestamp}] ${action.type}: ${action.details}\n`;
        });
        rapport += `\n`;
    }

    rapport += sectionDerniereMiseAJourCodex();
    if (derniersAvertissementsCodex.length > 0) {
        rapport += `--- AVERTISSEMENTS DU CODEX (${derniersAvertissementsCodex.length}) ---\n`;
        derniersAvertissementsCodex.forEach(a => { rapport += `[${a.timestamp}] ${a.message}\n`; });
        rapport += `\n`;
    }

    // Erreurs avec stack trace
    if (dernieresErreurs.length > 0) {
        rapport += `--- ERREURS CONSOLE (${dernieresErreurs.length}) ---\n`;
        dernieresErreurs.forEach(err => {
            rapport += `[${err.timestamp}] ${err.message}\n`;
            // ✅ Stack trace complet (limité à 5 lignes)
            if (err.stack) {
                const stackLines = err.stack.split('\n').slice(0, 5);
                stackLines.forEach(line => {
                    if (line.trim()) {
                        rapport += `    ${line.trim()}\n`;
                    }
                });
            }
        });
        rapport += `\n`;
    } else {
        rapport += `--- ERREURS CONSOLE ---\n`;
        rapport += `Aucune erreur détectée\n\n`;
    }

    if (descriptionUtilisateur) {
        const labelDescription = modeRapport === 'commentaire'
            ? `--- COMMENTAIRE ---`
            : `--- DESCRIPTION DU PROBLÈME ---`;
        rapport += `${labelDescription}\n`;
        rapport += `${descriptionUtilisateur}\n\n`;
    }

    rapport += modeRapport === 'commentaire'
        ? `=== FIN DU COMMENTAIRE ===`
        : `=== FIN DU RAPPORT ===`;

    return rapport;
}

// ===============================
// CAPTURE D'ÉCRAN
// ===============================

/**
 * ✅ NOUVEAU : Capture une capture d'écran de la page
 * Utilise html2canvas si disponible, sinon indique comment faire manuellement
 */
async function capturerEcran() {
    // Vérifier si html2canvas est disponible
    if (typeof html2canvas === 'function') {
        try {
            const canvas = await html2canvas(document.body, {
                scale: 0.5, // Réduire la taille
                logging: false,
                useCORS: true
            });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error('Erreur capture écran:', e);
            return null;
        }
    }
    return null;
}

// ===============================
// INTERFACE UTILISATEUR
// ===============================

/**
 * Met à jour l'affichage du mode (bug vs commentaire)
 */
function mettreAJourModeRapport() {
    const btnBug = document.getElementById('btnModeBug');
    const btnComment = document.getElementById('btnModeCommentaire');
    const labelDescription = document.getElementById('labelDescriptionBug');
    const textarea = document.getElementById('descriptionBug');

    if (btnBug && btnComment) {
        if (modeRapport === 'bug') {
            btnBug.style.background = 'var(--accent-primaire)';
            btnBug.style.color = 'white';
            btnComment.style.background = 'transparent';
            btnComment.style.color = 'var(--gris-fonce)';
        } else {
            btnComment.style.background = 'var(--accent-primaire)';
            btnComment.style.color = 'white';
            btnBug.style.background = 'transparent';
            btnBug.style.color = 'var(--gris-fonce)';
        }
    }

    if (labelDescription) {
        labelDescription.textContent = modeRapport === 'commentaire'
            ? 'Ton commentaire ou suggestion :'
            : 'Décris le problème rencontré :';
    }

    // #143 — le bloc d'instructions suit aussi le mode (il restait « Comment
    // signaler un bug » sous l'onglet Commentaire).
    const titreInstructions = document.getElementById('instructionsRapportTitre');
    if (titreInstructions) {
        titreInstructions.textContent = modeRapport === 'commentaire'
            ? 'Comment partager un commentaire :'
            : 'Comment signaler un bug :';
    }
    const etape1Instructions = document.getElementById('instructionsRapportEtape1');
    if (etape1Instructions) {
        etape1Instructions.textContent = modeRapport === 'commentaire'
            ? 'Écris ton commentaire ou ta suggestion ci-dessous'
            : 'Décris le problème ci-dessous';
    }

    if (textarea && !textarea.value) {
        textarea.placeholder = modeRapport === 'commentaire'
            ? "Dis-nous ce que tu penses de l'app.\n- Ce qui fonctionne bien\n- Ce qui pourrait être amélioré\n- Tes suggestions"
            : "Exemple :\n- J'étais dans la section Cadre > Trimestre\n- J'ai cliqué sur le bouton «Ajouter un cours»\n- Rien ne s'est passé (ou message d'erreur...)\n- Je m'attendais à voir le formulaire de création";
    }

    // Masquer/afficher le sélecteur de gravité selon le mode
    var selecteurGravite = document.getElementById('selecteurGravite');
    if (selecteurGravite) {
        selecteurGravite.style.display = modeRapport === 'bug' ? 'flex' : 'none';
    }

    // Mettre à jour le rapport
    mettreAJourRapport();
}

/**
 * Change la gravité du rapport et met à jour le style du bouton actif
 */
function changerGravite(el) {
    var param = el.getAttribute ? el.getAttribute('data-param') : el;
    if (param) graviteRapport = param;

    // Mettre à jour le style des boutons
    var conteneur = document.getElementById('selecteurGravite');
    if (conteneur) {
        var boutons = conteneur.querySelectorAll('button');
        for (var i = 0; i < boutons.length; i++) {
            var btnParam = boutons[i].getAttribute('data-param');
            if (btnParam === graviteRapport) {
                boutons[i].style.background = 'var(--accent-primaire)';
                boutons[i].style.color = 'white';
            } else {
                boutons[i].style.background = 'transparent';
                boutons[i].style.color = 'var(--gris-fonce)';
            }
        }
    }

    // Mettre à jour le rapport
    mettreAJourRapport();
}

/**
 * Change le mode du rapport
 */
function changerModeRapport(mode) {
    modeRapport = mode;
    mettreAJourModeRapport();
}

/**
 * Ouvre le modal de rapport de bug
 */
function ouvrirModalRapportBug() {
    // Réinitialiser le mode
    modeRapport = 'bug';

    // Récupérer le prénom sauvegardé
    const prenomSauvegarde = localStorage.getItem(CLE_PRENOM_TESTEUR) || '';

    // Générer le rapport initial (sans description, avec prénom sauvegardé)
    const rapportInitial = genererRapportBug('', prenomSauvegarde);

    const modalHTML = `
        <div id="modalRapportBug" class="modal-overlay actif" style="z-index: 10000;">
            <div class="modal-contenu" style="max-width: 700px;">
                <button class="modal-fermer" data-action="fermerModalRapportBug"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                <h3 class="modal-titre">Signaler un bug ou donner ton avis</h3>

                <div class="modal-section">
                    <!-- Sélecteur de mode -->
                    <div style="display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--bordure-claire); border-radius: var(--radius-moyen); overflow: hidden;">
                        <button id="btnModeBug" data-action="changerModeRapport" data-param="bug" style="
                            flex: 1; padding: 10px; border: none; cursor: pointer;
                            font-family: inherit; font-size: 0.9rem; font-weight: 600;
                            background: var(--accent-primaire); color: white;
                            transition: all 0.2s;">
                            Signaler un bug
                        </button>
                        <button id="btnModeCommentaire" data-action="changerModeRapport" data-param="commentaire" style="
                            flex: 1; padding: 10px; border: none; cursor: pointer;
                            font-family: inherit; font-size: 0.9rem; font-weight: 600;
                            background: transparent; color: var(--gris-fonce);
                            transition: all 0.2s;">
                            Partager un commentaire
                        </button>
                    </div>

                    <!-- Sélecteur de gravité (visible uniquement en mode bug) -->
                    <div id="selecteurGravite" style="display: flex; gap: 8px; margin-bottom: 15px;">
                        <button data-action="changerGravite" data-param="bloquant"
                            class="btn btn-secondaire" style="flex:1; font-size: 0.85rem;">
                            Bloquant
                        </button>
                        <button data-action="changerGravite" data-param="normal"
                            class="btn btn-secondaire" id="btnGraviteNormal" style="flex:1; font-size: 0.85rem;">
                            Gênant
                        </button>
                        <button data-action="changerGravite" data-param="mineur"
                            class="btn btn-secondaire" style="flex:1; font-size: 0.85rem;">
                            Mineur
                        </button>
                    </div>

                    <!-- Instructions (titre + 1re étape adaptés au mode — #143) -->
                    <div class="alerte alerte-attention">
                        <strong id="instructionsRapportTitre">Comment signaler un bug :</strong>
                        <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                            <li id="instructionsRapportEtape1">Décris le problème ci-dessous</li>
                            <li>Clique sur « Copier le rapport »</li>
                            <li>Envoie-le par courriel avec tes captures d'écran</li>
                        </ol>
                    </div>

                    <!-- Prénom du testeur -->
                    <div style="margin-bottom: 20px;">
                        <label for="prenomTesteur" style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--accent-primaire);">
                            Ton prénom :
                        </label>
                        <input type="text" id="prenomTesteur" placeholder="Ex: Grégoire" value="${typeof echapperHtml === 'function' ? echapperHtml(prenomSauvegarde) : ''}" style="
                            width: 100%; max-width: 250px; padding: 10px 12px;
                            border: 1px solid var(--gris-clair); border-radius: var(--radius-moyen);
                            font-family: inherit; font-size: 0.95rem; box-sizing: border-box;
                        " data-on-input="sauvegarderPrenomEtMettreAJour">
                    </div>

                    <!-- Description du problème -->
                    <div id="sectionFormulaireBug" style="margin-bottom: 20px;">
                        <label id="labelDescriptionBug" for="descriptionBug" style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--accent-primaire);">
                            Décris le problème rencontré :
                        </label>
                        <textarea id="descriptionBug" placeholder="Exemple :
- J'étais dans la section Cadre > Trimestre
- J'ai cliqué sur le bouton «Ajouter un cours»
- Rien ne s'est passé (ou message d'erreur...)
- Je m'attendais à voir le formulaire de création

Évite de nommer un·e étudiant·e par son nom dans la description (utilise « l'étudiant·e A » ou « un·e étudiant·e » à la place)." style="
                            width: 100%; height: 100px; padding: 12px;
                            border: 1px solid var(--gris-clair); border-radius: var(--radius-moyen);
                            font-family: inherit; font-size: 0.95rem; resize: vertical; box-sizing: border-box;
                        " data-on-input="mettreAJourRapport"></textarea>
                        <small style="display: block; margin-top: 6px; color: var(--gris-moyen); font-size: 0.85rem; line-height: 1.4;">
                            🔒 Pour la confidentialité étudiante (Loi 25) : évite de nommer des étudiant·es nominalement dans la description. Utilise plutôt « l'étudiant·e A » ou « un·e étudiant·e du groupe X ». Les rapports sont conservés localement (max 20, rotation automatique).
                        </small>
                    </div>

                    <!-- Rapport généré -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--accent-primaire);">
                            Rapport technique (généré automatiquement) :
                        </label>
                        <pre id="rapportBugTexte" style="
                            background: var(--gris-tres-pale); padding: 15px;
                            border-radius: var(--radius-moyen); font-size: 0.75rem;
                            overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;
                            max-height: 300px; overflow-y: auto;
                            border: 1px solid var(--gris-clair); margin: 0;
                        "></pre>
                    </div>
                </div>

                <!-- Boutons d'action -->
                <div class="modal-actions" style="flex-wrap: wrap;">
                    <button id="btnCopierRapport" data-action="copierRapportBug" class="btn btn-principal" style="flex: 1; min-width: 120px;">
                        Copier le rapport
                    </button>
                    <button id="btnTelechargerTxt" data-action="telechargerRapportTxt" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                        Enregistrer en TXT
                    </button>
                    <button id="btnEnvoyerCourriel" data-action="envoyerRapportParCourriel" class="btn btn-secondaire" style="flex: 1; min-width: 120px;">
                        Envoyer par courriel
                    </button>
                </div>

                <!-- Note captures d'écran -->
                <div class="alerte alerte-information" style="margin-top: 15px;">
                    <strong>Captures d'écran :</strong>
                    Mac: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Cmd+Shift+4</code> |
                    Windows: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Win+Shift+S</code> |
                    iPad: <code style="background: var(--bordure-claire); padding: 2px 6px; border-radius: 4px;">Power+Vol.haut</code>
                </div>

                <div style="text-align: center; font-size: 0.85rem; color: var(--texte-secondaire); margin-top: 15px;">
                    Consulte les <strong>Nouvelles</strong> sur la page d'accueil pour voir les corrections récentes.
                </div>

                <!-- Lien vers archives -->
                <div style="text-align: center; margin-top: 10px;">
                    <button data-action="ouvrirModalRapportsArchives" style="
                        background: none; border: none; color: var(--accent-primaire);
                        cursor: pointer; font-size: 0.85rem; text-decoration: underline;">
                        Voir mes rapports archivés
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    // Injecter le rapport via textContent (pas innerHTML) pour éviter tout risque XSS
    var preRapport = document.getElementById('rapportBugTexte');
    if (preRapport) preRapport.textContent = rapportInitial;

    // Initialiser le sélecteur de gravité (Gênant actif par défaut)
    graviteRapport = 'normal';
    var btnGraviteNormal = document.getElementById('btnGraviteNormal');
    if (btnGraviteNormal) changerGravite(btnGraviteNormal);
}

/**
 * Ferme le modal de rapport de bug
 */
function fermerModalRapportBug() {
    const modal = document.getElementById('modalRapportBug');
    if (modal && modal.parentElement) {
        modal.parentElement.remove();
    }
}

/**
 * Sauvegarde le prénom et met à jour le rapport + la section suivi
 */
function sauvegarderPrenomEtMettreAJour() {
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    localStorage.setItem(CLE_PRENOM_TESTEUR, prenom);

    // Mettre à jour le rapport technique
    mettreAJourRapport();
}

/**
 * Met à jour le rapport avec la description de l'utilisateur
 */
function mettreAJourRapport() {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);
    const pre = document.getElementById('rapportBugTexte');
    if (pre) {
        pre.textContent = rapport;
    }
}

/**
 * Copie le rapport dans le presse-papiers
 */
async function copierRapportBug(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    try {
        await navigator.clipboard.writeText(rapport);

        // Archiver le rapport localement
        archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

        // Feedback visuel
        if (btn) {
            const texteOriginal = btn.textContent;
            btn.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Copié !';
            btn.style.background = 'var(--vert-positif)';

            setTimeout(() => {
                btn.textContent = texteOriginal;
                btn.style.background = '';
            }, 2000);
        }
    } catch (err) {
        alert('Erreur lors de la copie. Sélectionne manuellement le texte du rapport.');
    }
}

/**
 * Enregistre le rapport en fichier TXT avec choix de l'emplacement
 * Utilise File System Access API si disponible (Chrome/Edge), sinon fallback
 */
async function telechargerRapportTxt(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    // Générer le nom du fichier avec date et prénom
    const maintenant = new Date();
    const dateStr = maintenant.toISOString().slice(0, 10); // 2026-02-01
    const heureStr = maintenant.toTimeString().slice(0, 8).replace(/:/g, '-'); // 21-45-00
    const prenomNormalise = prenom.trim().toLowerCase().replace(/\s+/g, '-') || 'anonyme';
    const prefixe = modeRapport === 'commentaire' ? 'FEEDBACK' : 'BUG';
    const nomFichier = `${prefixe}_${prenomNormalise}_${dateStr}_${heureStr}.txt`;

    let succes = false;

    // Essayer File System Access API (Chrome/Edge) pour choix de l'emplacement
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: nomFichier,
                types: [{
                    description: 'Fichier texte',
                    accept: { 'text/plain': ['.txt'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(rapport);
            await writable.close();
            succes = true;
        } catch (e) {
            // L'utilisateur a annulé ou erreur — fallback
            if (e.name !== 'AbortError') {
                console.warn('File System Access API non disponible, fallback téléchargement classique');
            } else {
                // Annulé par l'utilisateur, ne pas faire de fallback
                return;
            }
        }
    }

    // Fallback : téléchargement classique (Safari, Firefox, ou si erreur)
    if (!succes) {
        const blob = new Blob([rapport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
        succes = true;
    }

    // Archiver le rapport localement
    archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

    // Feedback visuel
    if (btn && succes) {
        const texteOriginal = btn.textContent;
        btn.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Enregistré !';
        btn.style.background = 'var(--vert-positif)';
        setTimeout(() => {
            btn.textContent = texteOriginal;
            btn.style.background = '';
        }, 2000);
    }
}

/**
 * Ouvre le client courriel avec le rapport pré-rempli
 */
function envoyerRapportParCourriel(btn) {
    const description = document.getElementById('descriptionBug')?.value || '';
    const prenom = document.getElementById('prenomTesteur')?.value || '';
    const rapport = genererRapportBug(description, prenom);

    // Nettoyer les caractères UTF-16 invalides (surrogates isolés)
    // Compatible Safari/iOS (pas de lookbehind)
    const nettoyerUTF16 = (str) => {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            // High surrogate (0xD800-0xDBFF)
            if (code >= 0xD800 && code <= 0xDBFF) {
                const nextCode = str.charCodeAt(i + 1);
                // Vérifie si suivi d'un low surrogate valide
                if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                    result += str[i] + str[i + 1];
                    i++; // Sauter le low surrogate
                } else {
                    result += '\uFFFD'; // Surrogate isolé → remplacement
                }
            }
            // Low surrogate isolé (pas précédé d'un high surrogate)
            else if (code >= 0xDC00 && code <= 0xDFFF) {
                result += '\uFFFD';
            }
            else {
                result += str[i];
            }
        }
        return result;
    };

    try {
        // Construire le mailto
        var typeLabel = modeRapport === 'commentaire' ? 'Feedback' : 'Bug';
        var graviteLabel = graviteRapport === 'bloquant' ? ' BLOQUANT' : (graviteRapport === 'mineur' ? ' mineur' : '');
        var sujet = encodeURIComponent('[' + typeLabel + graviteLabel + ' Monitorage ' + getVersionApp() + '] ' + (description.substring(0, 50) || 'Rapport de bug') + '…');
        var corpsNettoye = nettoyerUTF16(rapport + '\n\n--- JOINS TES CAPTURES D\'ÉCRAN À CE COURRIEL ---');
        var corps = encodeURIComponent(corpsNettoye);
        var mailtoUrl = 'mailto:labo@codexnumeris.org?subject=' + sujet + '&body=' + corps;

        // Archiver le rapport localement
        archiverRapportBug(rapport, description, prenom, modeRapport === 'commentaire' ? 'commentaire' : 'bug');

        // Protection troncature : si l'URL est trop longue, copier dans le presse-papiers
        if (mailtoUrl.length > 1800 && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(rapport).then(function() {
                // Corps court avec instruction de coller
                var corpsCourt = encodeURIComponent('[Le rapport complet a été copié dans ton presse-papiers — colle-le ici (Cmd+V)]');
                window.location.href = 'mailto:labo@codexnumeris.org?subject=' + sujet + '&body=' + corpsCourt;
            });
            // Feedback visuel adapté
            if (btn) {
                var texteOrig = btn.textContent;
                btn.textContent = 'Rapport copié — colle-le dans le courriel';
                btn.style.background = 'var(--vert-positif)';
                setTimeout(function() { btn.textContent = texteOrig; btn.style.background = ''; }, 3000);
            }
            return;
        }

        // Feedback visuel
        if (btn) {
            var texteOriginal = btn.textContent;
            btn.innerHTML = '<span class="icone-inline icone-inline--check" aria-hidden="true"></span>Envoyé !';
            btn.style.background = 'var(--vert-positif)';
            setTimeout(function() { btn.textContent = texteOriginal; btn.style.background = ''; }, 2000);
        }

        // Ouvrir le client courriel
        window.location.href = mailtoUrl;
    } catch (e) {
        console.error('Erreur lors de l\'envoi par courriel:', e);
        notifications.erreur('Erreur courriel', 'Utilise le bouton Copier pour copier le rapport manuellement.');
    }
}

// ===============================
// INITIALISATION AU CHARGEMENT
// ===============================

// Charger les résolutions et mettre à jour le badge au démarrage

// ===============================
// EXPORTS GLOBAUX
// ===============================

window.ouvrirModalRapportBug = ouvrirModalRapportBug;
window.fermerModalRapportBug = fermerModalRapportBug;
window.mettreAJourRapport = mettreAJourRapport;
window.sauvegarderPrenomEtMettreAJour = sauvegarderPrenomEtMettreAJour;
window.copierRapportBug = copierRapportBug;
window.telechargerRapportTxt = telechargerRapportTxt;
window.envoyerRapportParCourriel = envoyerRapportParCourriel;
window.enregistrerAction = enregistrerAction;
// Gestion des rapports archivés
window.ouvrirModalRapportsArchives = ouvrirModalRapportsArchives;
window.fermerModalRapportsArchives = fermerModalRapportsArchives;
window.supprimerEtRafraichirArchive = supprimerEtRafraichirArchive;
window.rafraichirListeArchives = rafraichirListeArchives;
window.afficherRapportComplet = afficherRapportComplet;
window.viderRapportsArchives = viderRapportsArchives;
window.viderEtRafraichirArchives = viderEtRafraichirArchives;
window.mettreAJourBadgeBug = mettreAJourBadgeBug; // stub vide, conservé pour compatibilité
// Mode rapport
window.changerModeRapport = changerModeRapport;
window.changerGravite = changerGravite;



})();
