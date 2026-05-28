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
 * Génère la bannière de bienvenue.
 *
 * Comportement initial : affichée uniquement pour les nouveaux utilisateurs
 * (aucun groupe-cours configuré ET mode démo inactif).
 * Source texte : docs/refonte-textes/textes-manquants-bloc4.md (validé 19 avril 2026)
 *
 * Fenêtre d'accès public 3-30 juin 2026 (consigne Cowork 28 mai PM) :
 * pendant cette fenêtre, la bannière est affichée à TOUS les utilisateurs
 * (y compris ceux ayant un groupe-cours configuré ou étant en mode démo)
 * et contient en plus un encadré « Accès libre jusqu'au 30 juin 2026 »
 * inséré entre « Par où commencer ? » et la rangée de boutons. À partir
 * du 23 juin 2026 00h00 EDT (J-7 avant le refermage), l'encadré bascule
 * sur une formulation d'urgence (« Plus que quelques jours »). Au
 * refermage le 1er juillet 2026 00h00 EDT, la bannière revient à son
 * comportement d'origine et l'encadré disparaît, sans intervention
 * manuelle requise — aligné avec le principe « stabilité zero-dette »
 * du CLAUDE.md. Cf. DEPLOY.md v1.3 §3 + §3.6 et ADR-008 révisé du
 * 28 mai 2026.
 */
function genererBanniereBienvenue() {
    // Fenêtre d'accès public 3-30 juin 2026 : refermage 1er juillet 00:00 EDT
    // (heure de Toronto, EDT UTC-4). Transition J-7 : à partir du 23 juin
    // 00:00 EDT, le paragraphe bascule sur une formulation d'urgence.
    const LIMITE_FENETRE_PUBLIC = new Date('2026-07-01T00:00:00-04:00').getTime();
    const DEBUT_TRANSITION_URGENCE = new Date('2026-06-23T00:00:00-04:00').getTime();
    const maintenant = Date.now();
    const dansFenetrePublic = maintenant < LIMITE_FENETRE_PUBLIC;
    const enTransitionUrgence = dansFenetrePublic && maintenant >= DEBUT_TRANSITION_URGENCE;

    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    if (!dansFenetrePublic && enDemo) return '';

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

    if (!dansFenetrePublic && aGroupeCours) return '';

    let paragrapheAccesCadre = '';
    if (enTransitionUrgence) {
        paragrapheAccesCadre = `
            <div class="banniere-bienvenue-acces banniere-bienvenue-acces--urgent">
                <p><strong>Plus que quelques jours.</strong> L’accès libre se termine le 30 juin 2026. Écris à <code>labo@codexnumeris.org</code> avant cette date pour conserver l’accès web — il sera maintenu pour les membres de la Cohorte 1 pilote et de la CoP qui en font la demande.</p>
            </div>`;
    } else if (dansFenetrePublic) {
        paragrapheAccesCadre = `
            <div class="banniere-bienvenue-acces">
                <p><strong>Accès libre jusqu’au 30 juin 2026.</strong> L’application est librement accessible jusqu’au 30 juin 2026, en marge du lancement de la Communauté de pratique Labo Codex au colloque AQPC. Pour conserver l’accès web après cette date, écris à <code>labo@codexnumeris.org</code> avant le 30 juin — il sera alors maintenu pour les membres de la Cohorte 1 pilote et les membres de la CoP qui en font la demande.</p>
            </div>`;
    }

    return `
        <div class="banniere-bienvenue carte" id="banniere-bienvenue">
            <h2 class="banniere-bienvenue-titre">Bienvenue dans Labo Codex</h2>
            <p>Labo Codex num\u00e9rise le travail que tu fais d\u00e9j\u00e0\u00a0: planifier ton cours, concevoir tes activit\u00e9s d\u2019apprentissage, \u00e9valuer les travaux, suivre la progression de tes \u00e9tudiant\u00b7es. Tu y poses les m\u00eames gestes que sur papier avec calculette ou tableur, mais dans un seul outil portable.</p>
            <p><strong>Par o\u00f9 commencer\u00a0?</strong> Configure ton trimestre, ton cours et ton groupe dans R\u00e9glages. C\u2019est la m\u00eame information que dans ton plan de cours. Tu la saisis une fois, l\u2019application s\u2019en sert partout.</p>
            ${paragrapheAccesCadre}
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

    // Hero h1 retiré le 27 mai 2026 : la phrase a été déplacée dans le bandeau global
    // (entête .titre-section, à côté de la date).
    const banniereBienvenueHTML = genererBanniereBienvenue();

    conteneur.innerHTML = `
        ${banniereBienvenueHTML}

        <div class="accueil-section-label">Raccourcis</div>
        <div class="accueil-grille-actions">

            <div class="accueil-action" data-section="conception" data-action="ouvrirWizardPratique">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-data-sheet"></span></div>
                <div class="accueil-action-titre">Adopter ta pratique</div>
                <div class="accueil-action-desc">L\u2019app s\u2019adapte \u00e0 ta notation : sommative, standards, sp\u00e9cifications, jetons.</div>
            </div>

            <div class="accueil-action" data-section="conception" data-action="naviguerAccueilCarte" data-param="conception|conception-carte">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-puzzle"></span></div>
                <div class="accueil-action-titre">Planifier ton cours</div>
                <div class="accueil-action-desc">Carte mentale, s\u00e9quences et le\u00e7ons align\u00e9es avec tes \u00e9valuations.</div>
            </div>

            <div class="accueil-action" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-saisie">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-people"></span></div>
                <div class="accueil-action-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-action-desc">Pr\u00e9sences et observations \u2014 premiers signaux des difficult\u00e9s.</div>
            </div>

            <div class="accueil-action" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-downloading"></span></div>
                <div class="accueil-action-titre">Importer des productions \u00e9tudiantes</div>
                <div class="accueil-action-desc">PDF et images, prêts à être annotés au stylet ou à la souris.</div>
            </div>

            <div class="accueil-action" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-edit"></span></div>
                <div class="accueil-action-titre">Annoter et \u00e9valuer</div>
                <div class="accueil-action-desc">Annote au stylet, \u00e9value selon ta grille \u2014 le bilan s\u2019\u00e9crit tout seul.</div>
            </div>

            <div class="accueil-action" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-groupe">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-line-chart"></span></div>
                <div class="accueil-action-titre">Avoir un aper\u00e7u du groupe</div>
                <div class="accueil-action-desc">Engagement, structure des r\u00e9sultats d\u2019apprentissage, signaux \u00e0 surveiller.</div>
            </div>

            <div class="accueil-action" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-profil">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-profile"></span></div>
                <div class="accueil-action-titre">Consulter le profil d\u2019un\u00B7e \u00e9tudiant\u00B7e</div>
                <div class="accueil-action-desc">Productions, progression et difficultés récurrentes pour ajuster ton soutien.</div>
            </div>

            <div class="accueil-action" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-interventions">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-pause-button"></span></div>
                <div class="accueil-action-titre">Interventions</div>
                <div class="accueil-action-desc">Mod\u00e8le R\u00e9ponse \u00e0 l\u2019intervention (R\u00e0I) : interventions diff\u00e9renci\u00e9es selon le besoin.</div>
            </div>

        </div>

        <div class="accueil-grille-labels">
            <div class="accueil-section-label">Utilitaires</div>
            <div class="accueil-section-label">Aide</div>
        </div>

        <div class="accueil-grille-bas">

            <div class="accueil-utilitaire-demi" data-action="ouvrirModalBackup">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-usb-memory"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Sauvegarder</div>
                    <div class="accueil-utilitaire-desc">Exporte ou restaure tes donn\u00e9es. Tout reste local.</div>
                </div>
            </div>

            <div class="accueil-utilitaire-demi" data-action="afficherModalNouveautes">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-megaphone"></span><span class="pastille-nouveautes"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Nouveaut\u00e9s</div>
                    <div class="accueil-utilitaire-desc">Beta ${window.VERSION_MAJEURE || ''} (Build ${window.BUILD_ID || ''})</div>
                </div>
            </div>

            <label for="checkbox-accompagnement-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-info.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Assistance</div>
                    <div class="accueil-aide-desc">Tour guid\u00e9, info-bulles, aide contextuelle.</div>
                </div>
                <input type="checkbox" id="checkbox-accompagnement-accueil"
                    class="accueil-aide-checkbox" ${accChecked ? 'checked' : ''}
                    data-on-change="toggleAccompagnementHandler">
            </label>

            <label for="checkbox-demo-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-binary-code.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Donn\u00e9es d\u00e9mo</div>
                    <div class="accueil-aide-desc">Explore l\u2019app avec un cours fictif d\u00e9j\u00e0 configur\u00e9.</div>
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
