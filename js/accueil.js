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
   (visite guidée, info-bulles, aide contextuelle, flèches didactiques).

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
 * Génère la bannière de bienvenue « Bienvenue dans Labo Codex ».
 *
 * Affichée à TOUS les utilisateurs, en permanence (accueil public par
 * défaut). Elle présente l'application, oriente vers l'onglet Cadre et
 * invite à rejoindre la Communauté de pratique Labo Codex hébergée par
 * l'AQPC.
 *
 * Historique : un encadré d'accès cadré 3-30 juin 2026 (refermage prévu
 * au 1er juillet) y avait été ajouté le 1er juin 2026. Le refermage a été
 * abandonné le 2 juin 2026 (Cloudflare Access désactivé sans date de
 * réactivation) ; l'encadré temporaire — avec sa logique de dates et sa
 * variante d'urgence J-7 — est remplacé par l'invitation permanente à la
 * CoP. Cf. DEPLOY.md v1.4 §3, ADR-008 (révision 2 juin 2026), BACKLOG.md #298.
 *
 * 27 août 2026 (#427/#508) : Cloudflare Access est réactivé le 1er septembre
 * 2026, porte ouverte (`Include → Everyone`) + OTP, session d'un mois. La
 * phrase d'avis (4e des 5 blocs du corps, avant l'invitation à la CoP) est
 * doublée d'un bandeau daté (js/transitions.js, entrée
 * `avis-identification-2026-09-01`), parce qu'un avis vivant dans un accordéon
 * repliable n'est pas lu. Le bandeau s'éteint seul le 1er septembre ; c'est
 * alors ce paragraphe-ci qu'il faut réécrire au présent, ou retirer si le
 * geste n'a pas eu lieu — les deux textes sont au §8 de
 * `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
 * Cf. ADR-008 (révision 27 août 2026), DEPLOY.md (révision v1.6).
 * Source texte d'origine : docs/refonte-textes/textes-manquants-bloc4.md
 * (validé 19 avril 2026).
 */
function genererBanniereBienvenue() {
    const replie = (typeof obtenirPreference === 'function') && obtenirPreference('banniereAccueilRepliee') === true;

    const paragrapheCommunaute = `
            <div class="banniere-bienvenue-acces">
                <p>L’Association québécoise de pédagogie collégiale (AQPC) héberge une Communauté de pratique (CoP) Labo Codex : le lieu idéal pour obtenir du soutien et échanger entre pairs. Des enseignant·es comme toi y explorent d’autres pratiques pédagogiques et co-construisent des ressources libres. Une belle occasion de développement professionnel !</p>
            </div>`;

    return `
        <div class="banniere-bienvenue carte ${replie ? 'est-replie' : ''}" id="banniere-bienvenue">
            <button type="button" class="banniere-bienvenue-toggle" data-action="basculerBanniereBienvenue" aria-expanded="${replie ? 'false' : 'true'}" aria-controls="banniere-bienvenue-corps">
                <span class="banniere-bienvenue-titre">Bienvenue dans Labo Codex !</span>
                <span class="banniere-chevron" aria-hidden="true"></span>
            </button>
            <div id="banniere-bienvenue-corps" class="banniere-bienvenue-corps">
            <p>Labo Codex est un outil de soutien à l’enseignement et de suivi des apprentissages. L’application te propose de numériser ton travail. Tu peux planifier, concevoir, évaluer et suivre la progression de tes étudiant·es. Les mêmes gestes que sur papier, mais dans un seul outil numérique et portable ! Labo Codex est gratuit, ouvert et indépendant !</p>
            <p><strong>Par où commencer ?</strong> Configure ton trimestre, ton cours et ton groupe dans l’onglet Cadre : tu saisis tout une fois, l’app s’en sert partout. Ensuite, crée tes productions et tes évaluations. Tu peux les élaborer et les partager facilement avec tes collègues.</p>
            <p><strong>Certains concepts sont nouveaux pour toi ?</strong> Trois guides pédagogiques t’expliquent en quelques pages la taxonomie SOLO, les micro-données et le modèle RàI — accessibles en tout temps par les boutons « Guide » des Outils d’observation.</p>
            <p>À partir du 1<sup>er</sup> septembre, l’identification sera obligatoire pour utiliser l’application.</p>
            ${paragrapheCommunaute}
            <div class="banniere-bienvenue-actions">
                <button class="btn btn-primaire" data-action="demarrerTourGuide">
                    Commencer la visite guid\u00e9e
                </button>
                <button class="btn btn-secondaire" data-action="naviguerAccueilCarte" data-param="labo|labo-accompagnement">
                    Voir les guides p\u00e9dagogiques
                </button>
            </div>
            </div>
        </div>
    `;
}

/**
 * Replie ou déplie la bannière de bienvenue. L'état (préférence UI globale,
 * non namespacée par trimestre) est mémorisé via le système de préférences.
 * Le <button> natif gère Entrée/Espace et le focus ; seul le corps se masque,
 * la barre de titre — et donc l'affordance de réouverture — reste visible.
 */
function basculerBanniereBienvenue() {
    const banniere = document.getElementById('banniere-bienvenue');
    if (!banniere) return;
    const replie = !banniere.classList.contains('est-replie');
    banniere.classList.toggle('est-replie', replie);
    const toggle = banniere.querySelector('.banniere-bienvenue-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', replie ? 'false' : 'true');
    if (typeof definirPreference === 'function') {
        definirPreference('banniereAccueilRepliee', replie);
    }
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

        <div class="accueil-section-label">Tâches</div>
        <div class="accueil-grille-actions">

            <div class="accueil-action" role="button" tabindex="0" data-section="conception" data-action="ouvrirWizardPratique">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-data-sheet"></span></div>
                <div class="accueil-action-titre">Adopter ta pratique</div>
                <div class="accueil-action-desc">Notation sommative, par standards, par sp\u00e9cifications.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="conception" data-action="naviguerAccueilCarte" data-param="conception|conception-carte">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-puzzle"></span></div>
                <div class="accueil-action-titre">Planifier ton cours</div>
                <div class="accueil-action-desc">Carte mentale alignant s\u00e9quences, le\u00e7ons et \u00e9valuations.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-saisie">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-people"></span></div>
                <div class="accueil-action-titre">Saisir les pr\u00e9sences</div>
                <div class="accueil-action-desc">Pr\u00e9sences, retards et observations de s\u00e9ance.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-downloading"></span></div>
                <div class="accueil-action-titre">Importer des productions</div>
                <div class="accueil-action-desc">PDF, images et numérisations, prêts à annoter.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="evaluations" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-edit"></span></div>
                <div class="accueil-action-titre">Annoter et \u00e9valuer</div>
                <div class="accueil-action-desc">Annotation au stylet, grille d\u2019\u00e9valuation, bilan automatique.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-groupe">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-line-chart"></span></div>
                <div class="accueil-action-titre">Observer le groupe</div>
                <div class="accueil-action-desc">Engagement, structure des r\u00e9sultats, signaux \u00e0 surveiller.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-profil">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-profile"></span></div>
                <div class="accueil-action-titre">Consulter un profil</div>
                <div class="accueil-action-desc">Productions, progression et difficultés récurrentes.</div>
            </div>

            <div class="accueil-action" role="button" tabindex="0" data-section="suivi" data-action="naviguerAccueilCarte" data-param="suivi|suivi-interventions">
                <div class="accueil-action-icone"><span class="accueil-icone-mask ico-acc-pause-button"></span></div>
                <div class="accueil-action-titre">Diff\u00e9rencier les interventions</div>
                <div class="accueil-action-desc">Mod\u00e8le R\u00e0I, niveaux 2 et 3, interventions selon le besoin.</div>
            </div>

        </div>

        <div class="accueil-grille-labels">
            <div class="accueil-section-label">Utilitaires</div>
            <div class="accueil-section-label">Aide</div>
        </div>

        <div class="accueil-grille-bas">

            <div class="accueil-utilitaire-demi" role="button" tabindex="0" data-action="ouvrirModalBackup">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-usb-memory"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Sauvegarder</div>
                    <div class="accueil-utilitaire-desc">Export, restauration, stockage 100 % local.</div>
                </div>
            </div>

            <div class="accueil-utilitaire-demi" role="button" tabindex="0" data-action="afficherModalNouveautes">
                <div class="accueil-utilitaire-icone"><span class="accueil-icone-mask ico-acc-megaphone"></span><span class="pastille-nouveautes"></span></div>
                <div>
                    <div class="accueil-utilitaire-titre">Nouveaut\u00e9s</div>
                    <div class="accueil-utilitaire-desc">Bêta publique ${window.VERSION_MAJEURE || ''} (Build ${window.BUILD_ID || ''})</div>
                </div>
            </div>

            <label for="checkbox-accompagnement-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-info-popup.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Assistance</div>
                    <div class="accueil-aide-desc">Info-bulles et aide contextuelle.</div>
                </div>
                <input type="checkbox" id="checkbox-accompagnement-accueil"
                    class="accueil-aide-checkbox" ${accChecked ? 'checked' : ''}
                    data-on-change="toggleAccompagnementHandler">
            </label>

            <label for="checkbox-demo-accueil" class="accueil-aide-demi">
                <div class="accueil-aide-icone"><img src="icons/icons8-binary-code.svg" alt=""></div>
                <div>
                    <div class="accueil-aide-titre">Donn\u00e9es d\u00e9mo <button class="btn-aide-contextuelle" data-aide="accueil-donnees-demo" aria-label="Aide : mode d\u00e9monstration"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></div>
                    <div class="accueil-aide-desc">Cours fictif d\u00e9j\u00e0 configur\u00e9, \u00e0 explorer librement.</div>
                </div>
                <input type="checkbox" id="checkbox-demo-accueil"
                    class="accueil-aide-checkbox" ${demoChecked ? 'checked' : ''}
                    data-on-change="toggleDemoHandler">
            </label>

        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                <img src="img/logo-codex-numeris.svg" alt="Logo Codex Numeris" class="accueil-pied-logo">
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
    //
    // #414 (8 août 2026) : `initialiserAccueil()` est appelée par `main.js` sous
    // `DOMContentLoaded`, donc cet écouteur se posait au même instant que celui
    // de #413 — et se manquait de la même façon. Quand `db-ready` était déjà
    // passé, la resynchronisation n'avait jamais lieu et le bug du 22 avril
    // revenait tel quel : la case « Données démo » se décochait au refresh
    // alors que le mode démo était bien actif. Le rattrapage du portillon ferme
    // la seule brèche qui restait à ce correctif.
    //
    // `once: false` : rejoué à chaque `db-ready` — après un import, le mode
    // démo peut avoir changé et les cases doivent le refléter.
    window.auDbPret(function() {
        const cbDemo = document.getElementById('checkbox-demo-accueil');
        if (cbDemo) {
            cbDemo.checked = typeof estEnModeDemo === 'function' && estEnModeDemo();
        }
        const cbAcc = document.getElementById('checkbox-accompagnement-accueil');
        if (cbAcc) {
            cbAcc.checked = accompagnementEstActif();
        }
    }, { once: false });
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

/**
 * Toggle « Accompagnement » : pilote en bloc les 4 sous-systèmes d'aide
 * (visite guidée, info-bulles, aide contextuelle, flèches didactiques).
 * Un seul état visible côté utilisateur — case cochée = les 4 actifs.
 */
function toggleAccompagnementHandler(el) {
    if (window.accompagnement && typeof window.accompagnement.definirActif === 'function') {
        window.accompagnement.definirActif(!!el.checked);
    }
    // La case de l'accueil et le bouton de l'en-tête sont le même interrupteur :
    // refléter le nouvel état sur le bouton d'en-tête (title/aria-pressed).
    if (typeof window.synchroniserControlesAssistance === 'function') {
        window.synchroniserControlesAssistance();
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
    // Règle SPA (CLAUDE.md) : après le changement de vue, déplacer le focus vers
    // le conteneur de la nouvelle section (utile aux utilisateurs clavier).
    setTimeout(function() { deplacerFocusVersSection(section); }, sousSection ? 150 : 60);
}

/**
 * Déplace le focus clavier vers le conteneur de la section affichée (règle SPA).
 * Échec gracieux si la section est absente. tabindex=-1 rend le conteneur
 * focusable par script sans l'ajouter à l'ordre de tabulation.
 */
function deplacerFocusVersSection(section) {
    var cible = document.getElementById('section-' + section);
    if (!cible) return;
    if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
    cible.focus();
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
window.toggleAccompagnementHandler = toggleAccompagnementHandler;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.basculerBanniereBienvenue = basculerBanniereBienvenue;
window.ouvrirWizardPratique = ouvrirWizardPratique;
window.ouvrirModalBackup = ouvrirModalBackup;

})();
