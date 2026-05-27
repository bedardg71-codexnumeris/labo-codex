/* ===============================
   MODULE: PAGE D'ACCUEIL
   19 avril 2026 — Refonte V3 (ebauches-accueil.html) :
     - hero « Que souhaites-tu faire ? »
     - bannière de bienvenue (si nouvel utilisateur sans groupe-cours)
     - section « Raccourcis » : grille 4×2 de 8 cartes d'action
     - section « Utilitaires » | « Aide » : rangée de 4 demi-cartes
         · 2 utilitaires neutres (Sauvegarder, Nouveautés)
         · 2 cartes orange palette accompagnement avec case à cocher
           (Accompagnement, Données démo)
     - pied de page

   La case « Accompagnement » pilote en bloc les 4 sous-systèmes d'aide
   (tour guidé, info-bulles, aide contextuelle, flèches didactiques).

   Exports: afficherAccueil, initialiserAccueil, definirModeExpert
   =============================== */

(function() {
'use strict';

/**
 * Génère et affiche le contenu de la page d'accueil
 */
function afficherAccueil() {
    const conteneur = document.getElementById('accueil-contenu');
    if (!conteneur) return;

    // L'accueil n'émet pas `sectionAffichee` (pas de sous-section) : une flèche
    // didactique d'une autre section pourrait persister à l'écran. On la masque.
    if (window.accompagnement && typeof window.accompagnement.masquerFleche === 'function') {
        window.accompagnement.masquerFleche();
    }

    afficherAccueilContenu(conteneur);
}

/**
 * Génère la bannière de bienvenue (nouvel utilisateur).
 * Affichée si aucun groupe-cours n'est configuré ET mode démo inactif.
 * Source texte : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 */
function genererBanniereBienvenue() {
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    if (enDemo) return '';

    // Détection : au moins un groupe-cours configuré.
    // `groupeCoursActif` est une clé GLOBALE (pas préfixée par trimestre) qui
    // stocke l'ID du GC actif. `cle('groupesCours')` contient le tableau des GC
    // du trimestre actuel.
    let aGroupeCours = false;
    try {
        if (typeof db !== 'undefined') {
            const gcActif = db.getSync('groupeCoursActif', null);
            if (gcActif) {
                aGroupeCours = true;
            } else if (typeof window.cle === 'function') {
                const gcList = db.getSync(window.cle('groupesCours'), []);
                aGroupeCours = Array.isArray(gcList) && gcList.length > 0;
            }
        }
    } catch (e) { /* ignore */ }

    if (aGroupeCours) return '';

    return `
        <div class="banniere-bienvenue carte" id="banniere-bienvenue">
            <h2 class="banniere-bienvenue-titre">Bienvenue dans Labo Codex</h2>
            <p>Labo Codex num\u00e9rise le travail que tu fais d\u00e9j\u00e0\u00a0: planifier ton cours, concevoir tes activit\u00e9s d\u2019apprentissage, \u00e9valuer les travaux, suivre la progression de tes \u00e9tudiant\u00b7es. Tu y poses les m\u00eames gestes que sur papier avec calculette ou tableur, mais dans un seul outil portable.</p>
            <p><strong>Par o\u00f9 commencer\u00a0?</strong> Configure ton trimestre, ton cours et ton groupe dans R\u00e9glages. C\u2019est la m\u00eame information que dans ton plan de cours. Tu la saisis une fois, l\u2019application s\u2019en sert partout.</p>
            <div class="banniere-bienvenue-actions">
                <button class="btn btn-primaire" data-action="demarrerTourGuide">
                    Commencer la visite guid\u00e9e
                </button>
                <button class="btn btn-secondaire" data-action="afficherSection" data-param="calendrier">
                    Aller aux R\u00e9glages
                </button>
                <button class="btn btn-secondaire" data-action="entrerEnDemoHandler">
                    Explorer avec des donn\u00e9es d\u00e9mo
                </button>
            </div>
        </div>
    `;
}

/**
 * Contenu de la page d'accueil — V3 (19 avril 2026).
 *
 *   - Hero « Que souhaites-tu faire ? »
 *   - bannière de bienvenue (nouvel utilisateur)
 *   - Raccourcis : grille 4×2 de 8 cartes d'action
 *   - Utilitaires (gauche) | Aide (droite) : rangée de 4 demi-cartes
 *       · 2 utilitaires neutres (Sauvegarder, Nouveautés)
 *       · 2 cartes orange palette accompagnement avec case
 *         (Accompagnement, Données démo)
 *   - pied de page
 *
 * Aucun style= inline — tout passe par les classes CSS de index.html.
 */
function afficherAccueilContenu(conteneur) {
    // A.14 — La case « Données de démonstration » reflète strictement l'état réel.
    const demoChecked = typeof estEnModeDemo === 'function' && estEnModeDemo();
    // « Accompagnement » = ON uniquement si les 4 sous-systèmes sont actifs.
    const accChecked = accompagnementEstActif();

    const heroTitre = 'Un espace de travail pour la pratique enseignante.';
    const banniereBienvenueHTML = genererBanniereBienvenue();

    conteneur.innerHTML = `
        <div class="accueil-hero">
            <h1>${heroTitre}</h1>
        </div>

        ${banniereBienvenueHTML}

        <div class="accueil-section-label">Raccourcis</div>
        <div class="accueil-grille-actions">

            <div class="accueil-action" data-action="ouvrirWizardPratique">
                <div class="accueil-action-icone">\u2699\uFE0F</div>
                <div class="accueil-action-titre">Configurer ta pratique</div>
                <div class="accueil-action-desc">D\u00e9finis ce que tu mesures et comment tu le fais.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="conception|conception-carte">
                <div class="accueil-action-icone">\uD83D\uDDFA\uFE0F</div>
                <div class="accueil-action-titre">Planifier ton cours</div>
                <div class="accueil-action-desc">S\u00e9quences, le\u00e7ons et alignement p\u00e9dagogique.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="suivi|suivi-saisie">
                <div class="accueil-action-icone">\uD83D\uDCCB</div>
                <div class="accueil-action-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-action-desc">Pr\u00e9sences du jour et observations.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                <div class="accueil-action-icone">\uD83D\uDCE5</div>
                <div class="accueil-action-titre">Importer des travaux</div>
                <div class="accueil-action-desc">PDF et images de tes \u00e9tudiants.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                <div class="accueil-action-icone">\u270F\uFE0F</div>
                <div class="accueil-action-titre">Annoter et \u00e9valuer</div>
                <div class="accueil-action-desc">Annote les travaux selon ta grille.</div>
            </div>

            <div class="accueil-action" data-action="afficherSection" data-param="apercu">
                <div class="accueil-action-icone">\uD83D\uDCCA</div>
                <div class="accueil-action-titre">Avoir un aper\u00e7u</div>
                <div class="accueil-action-desc">Participation, r\u00e9sultats et progression.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="suivi|suivi-profil">
                <div class="accueil-action-icone">\uD83D\uDC64</div>
                <div class="accueil-action-titre">Consulter un profil</div>
                <div class="accueil-action-desc">Portrait d\u2019un \u00e9l\u00e8ve.</div>
            </div>

            <div class="accueil-action" data-action="naviguerAccueilCarte" data-param="suivi|suivi-interventions">
                <div class="accueil-action-icone">\uD83C\uDFAF</div>
                <div class="accueil-action-titre">Interventions R\u00e0I</div>
                <div class="accueil-action-desc">\u00c9l\u00e8ves \u00e0 risque, interventions diff\u00e9renci\u00e9es.</div>
            </div>

        </div>

        <div class="accueil-grille-labels">
            <div class="accueil-section-label">Utilitaires</div>
            <div class="accueil-section-label">Aide</div>
        </div>

        <div class="accueil-grille-bas">

            <div class="accueil-utilitaire-demi" data-action="ouvrirModalBackup">
                <div class="accueil-utilitaire-icone">\uD83D\uDCBE</div>
                <div>
                    <div class="accueil-utilitaire-titre">Sauvegarder</div>
                    <div class="accueil-utilitaire-desc">Exporter ou restaurer tes donn\u00e9es.</div>
                </div>
            </div>

            <div class="accueil-utilitaire-demi" data-action="afficherModalNouveautes">
                <div class="accueil-utilitaire-icone">\uD83D\uDCF0<span class="pastille-nouveautes"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Nouveaut\u00e9s</div>
                    <div class="accueil-utilitaire-desc">Derni\u00e8res mises \u00e0 jour.</div>
                </div>
            </div>

            <label for="checkbox-accompagnement-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone">\uD83E\uDDED</div>
                <div>
                    <div class="accueil-aide-titre">Assistance</div>
                    <div class="accueil-aide-desc">Tour guid\u00e9, info-bulles, aide contextuelle.</div>
                </div>
                <input type="checkbox" id="checkbox-accompagnement-accueil"
                    class="accueil-aide-checkbox" ${accChecked ? 'checked' : ''}
                    data-on-change="toggleAccompagnementHandler">
            </label>

            <label for="checkbox-demo-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone">\uD83D\uDD2C</div>
                <div>
                    <div class="accueil-aide-titre">Donn\u00e9es d\u00e9mo</div>
                    <div class="accueil-aide-desc">Explore avec des donn\u00e9es fictives.</div>
                </div>
                <input type="checkbox" id="checkbox-demo-accueil"
                    class="accueil-aide-checkbox" ${demoChecked ? 'checked' : ''}
                    data-on-change="toggleDemoHandler">
            </label>

        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                <img src="img/logo-codex-numeris.png" alt="Logo Labo Codex" class="accueil-pied-logo">
            </a>
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-lien-site">codexnumeris.org</a>
            <span class="accueil-pied-tagline">R\u00e9fl\u00e9chir, exp\u00e9rimenter, partager.</span>
        </div>
    `;

    // Mettre à jour la pastille des nouveautés (elle est maintenant dans le DOM)
    if (typeof mettreAJourPastille === 'function') mettreAJourPastille();
}

/**
 * Active ou désactive le mode expert (ouvrir direct sur tableau de bord)
 */
function definirModeExpert(actif) {
    definirPreference('modeExpert', !!actif);
}

/**
 * Initialise le module accueil
 * Appelé par main.js au démarrage
 */
function initialiserAccueil() {
    // Charger l'état du checkbox mode expert si la section réglages est présente
    const checkbox = document.getElementById('checkbox-mode-expert');
    if (checkbox) {
        checkbox.checked = !!obtenirPreference('modeExpert');
    }

    // Checkbox « Données démo » : re-synchroniser avec l'état réel après
    // db-ready (l'état peut venir d'IDB qui n'est pas dispo au premier rendu).
    // Bugfix 22 avril : la case se décochait au refresh malgré mode démo actif.
    window.addEventListener('db-ready', function() {
        const cbDemo = document.getElementById('checkbox-demo-accueil');
        if (cbDemo) {
            cbDemo.checked = typeof estEnModeDemo === 'function' && estEnModeDemo();
        }
        const cbAcc = document.getElementById('checkbox-accompagnement-accueil');
        if (cbAcc) {
            cbAcc.checked = accompagnementEstActif();
        }
    });
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Toggle mode démo depuis checkbox — routage vers activerModeDemo
 * (cochage) et desactiverModeDemo (décochage) dans js/demo-activation.js.
 * Le legacy donnees-demo.js a été retiré en Phase 5.D. */
function toggleDemoHandler(el) {
    if (el.checked) {
        if (typeof activerModeDemo === 'function') activerModeDemo();
    } else {
        if (typeof desactiverModeDemo === 'function') desactiverModeDemo();
    }
}

/** Entrer en mode démo (bouton de la bannière de bienvenue) */
function entrerEnDemoHandler() {
    if (typeof activerModeDemo === 'function') activerModeDemo();
}

/**
 * Toggle « Accompagnement » : pilote en bloc les 4 sous-systèmes d'aide
 * (tour guidé, info-bulles, aide contextuelle, flèches didactiques).
 * Un seul état visible côté utilisateur — case cochée = les 4 actifs.
 */
function toggleAccompagnementHandler(el) {
    if (window.accompagnement && typeof window.accompagnement.definirActif === 'function') {
        window.accompagnement.definirActif(!!el.checked);
    }
}

/**
 * Lit l'état agrégé : true uniquement si les 4 sous-systèmes sont actifs.
 * Sert à initialiser la case « Accompagnement » sur la page d'accueil.
 */
function accompagnementEstActif() {
    return !!(window.accompagnement && window.accompagnement.estActif());
}

/** Navigation accueil : section + sous-section avec délai */
function naviguerAccueilCarte(sectionEtSousSection) {
    var parts = sectionEtSousSection.split('|');
    var section = parts[0];
    var sousSection = parts[1];
    afficherSection(section);
    if (sousSection) {
        setTimeout(function() { afficherSousSection(sousSection); }, 100);
    }
}

/** Ouvre le wizard de pratique de notation par-dessus l'accueil (modale, pas de navigation). */
function ouvrirWizardPratique() {
    if (typeof ouvrirWizardV2 === 'function') ouvrirWizardV2();
}

/** Ouvrir modal backup */
function ouvrirModalBackup() {
    if (window.backupReminder) window.backupReminder.afficherModal();
}

// === EXPORTS ===
window.afficherAccueil = afficherAccueil;
window.initialiserAccueil = initialiserAccueil;
window.definirModeExpert = definirModeExpert;
window.toggleDemoHandler = toggleDemoHandler;
window.entrerEnDemoHandler = entrerEnDemoHandler;
window.toggleAccompagnementHandler = toggleAccompagnementHandler;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.ouvrirWizardPratique = ouvrirWizardPratique;
window.ouvrirModalBackup = ouvrirModalBackup;

})();
