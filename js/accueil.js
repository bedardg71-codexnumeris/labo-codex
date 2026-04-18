/* ===============================
   MODULE: PAGE D'ACCUEIL
   Chantier 3 — Page d'accueil permanente

   Page unique pour tous les utilisateurs :
   3 accordéons (Découvrir, Parcourir, Piloter) + utilitaires

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

    afficherAccueilContenu(conteneur);
}

/**
 * Contenu de la page d'accueil : 3 accordéons + utilitaires
 */
function afficherAccueilContenu(conteneur) {
    // A.14 — La checkbox reflète strictement l'état réel du mode démo.
    // Avant, pour un nouvel utilisateur sans cours réels, la case était
    // cochée par défaut alors que le mode démo n'était pas activé : l'état
    // visible ne correspondait pas au comportement de l'app.
    const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const demoChecked = enDemo;

    // Section toggle tooltips (miroir de Reglages > Preferences > Navigation)
    const tooltipsActifs = obtenirPreference('tooltips') !== false;
    const tourGuideActif = !!obtenirPreference('tourGuide');
    const aideContextuelleActive = obtenirPreference('aideContextuelle') !== false;

    const decouvrirHTML = `
        <div class="carte accordeon" id="accueil-decouvrir">
            <div class="accordeon-header">
                <h3 style="margin: 0; font-size: 1.1rem;">D\u00e9couvrir</h3>
                <span class="accordeon-chevron">\u25BC</span>
            </div>
            <div class="accordeon-contenu">
                <div class="accueil-cartes-decouvrir">

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x1F6B8;</span>
                            <input type="checkbox" id="checkbox-demo-accueil" ${demoChecked ? 'checked' : ''}
                                data-on-change="toggleDemoHandler">
                            <div>
                                <div class="decouvrir-titre">Donn\u00e9es de d\u00e9monstration</div>
                                <div class="decouvrir-desc">Explorer avec des donn\u00e9es fictives</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x1F5FA;&#xFE0F;</span>
                            <input type="checkbox" id="checkbox-tour-guide-accueil" ${tourGuideActif ? 'checked' : ''}
                                data-on-change="toggleTourGuideHandler">
                            <div>
                                <div class="decouvrir-titre">Tour guid\u00e9</div>
                                <div class="decouvrir-desc">Afficher les conseils contextuels</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">\uD83D\uDCAC</span>
                            <input type="checkbox" id="checkbox-tooltips-accueil" ${tooltipsActifs ? 'checked' : ''}
                                data-on-change="toggleTooltipsHandler">
                            <div>
                                <div class="decouvrir-titre">Info-bulles</div>
                                <div class="decouvrir-desc">D\u00e9crire l\u2019interface au survol</div>
                            </div>
                        </label>
                    </div>

                    <div class="accueil-carte-decouvrir">
                        <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                            <span style="font-size:1.5rem;">&#x2139;&#xFE0F;</span>
                            <input type="checkbox" id="checkbox-aide-contextuelle-accueil" ${aideContextuelleActive ? 'checked' : ''}
                                data-on-change="toggleAideContextuelleHandler">
                            <div>
                                <div class="decouvrir-titre">Aide contextuelle</div>
                                <div class="decouvrir-desc">Afficher les rep\u00e8res d\u2019aide</div>
                            </div>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    `;

    // Panneau de parcours d'apprentissage (toujours visible : CTA ou progression)
    const parcoursHTML = (window.parcours && window.parcours.genererPanneauParcours)
        ? window.parcours.genererPanneauParcours()
        : '';

    const heroTitre = 'Que souhaites-tu faire\u00a0?';

    conteneur.innerHTML = `
        <div class="accueil-hero">
            <h1>${heroTitre}</h1>
        </div>

        ${decouvrirHTML}

        ${parcoursHTML}

        <div class="carte accordeon" id="accueil-piloter">
            <div class="accordeon-header">
                <h3 style="margin: 0; font-size: 1.1rem;">Piloter</h3>
                <span class="accordeon-chevron">\u25BC</span>
            </div>
            <div class="accordeon-contenu" style="display: block;">
                <div class="accueil-cartes accueil-cartes--8">
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="planification|structure-carte">
                        <div class="accueil-carte-icone">\uD83E\uDDE9</div>
                        <div class="accueil-carte-titre">Planifier ton cours</div>
                        <div class="accueil-carte-desc">
                            Organise tes s\u00e9quences, le\u00e7ons et activit\u00e9s pour leur alignement p\u00e9dagogique.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerVersWizard">
                        <div class="accueil-carte-icone"><img src="icons/icon-paint-palette.svg" alt="" class="outil-svg-icon" style="width:32px;height:32px;"></div>
                        <div class="accueil-carte-titre">Configurer ta pratique de notation</div>
                        <div class="accueil-carte-desc">
                            D\u00e9finis ce que tu mesures et comment tu le fais pour cr\u00e9er ta pratique de notation.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="afficherSection" data-param="presences">
                        <div class="accueil-carte-icone">&#x1F4CB;</div>
                        <div class="accueil-carte-titre">Saisir les pr\u00e9sences</div>
                        <div class="accueil-carte-desc">
                            Saisis les pr\u00e9sences du jour pour ton groupe et ajoute des observations.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="afficherSection" data-param="tableau-bord">
                        <div class="accueil-carte-icone">&#x1F4C8;</div>
                        <div class="accueil-carte-titre">Voir l\u2019\u00e9tat des lieux</div>
                        <div class="accueil-carte-desc">
                            Suis la participation, les r\u00e9sultats et la progression de ton groupe.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-importer">
                        <div class="accueil-carte-icone">&#x1F4E5;</div>
                        <div class="accueil-carte-titre">Importer des travaux</div>
                        <div class="accueil-carte-desc">
                            Importe les travaux de tes \u00e9tudiants (PDF, images) et pr\u00e9pare les fichiers.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="evaluations|evaluations-annoter">
                        <div class="accueil-carte-icone">&#x1F4DD;</div>
                        <div class="accueil-carte-titre">Annoter et \u00e9valuer</div>
                        <div class="accueil-carte-desc">
                            Annote les travaux de tes \u00e9tudiants et \u00e9value-les selon la grille de crit\u00e8res.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="tableau-bord|suivi-profil">
                        <div class="accueil-carte-icone">\uD83D\uDC64</div>
                        <div class="accueil-carte-titre">Consulter un profil \u00e9tudiant</div>
                        <div class="accueil-carte-desc">
                            Consulte le portrait d\u2019un \u00e9l\u00e8ve\u00a0: pr\u00e9sences, r\u00e9sultats et progression.
                        </div>
                    </div>
                    <div class="accueil-carte" data-action="naviguerAccueilCarte" data-param="tableau-bord|suivi-interventions">
                        <div class="accueil-carte-icone">\uD83D\uDEDF</div>
                        <div class="accueil-carte-titre">Pr\u00e9parer des interventions</div>
                        <div class="accueil-carte-desc">
                            Identifie les \u00e9l\u00e8ves \u00e0 risque et planifie des interventions diff\u00e9renci\u00e9es selon leurs besoins.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="accueil-utilitaires">
            <button class="accueil-utilitaire" data-action="ouvrirModalBackup">
                \uD83D\uDCBE Sauvegarder
            </button>
            <button class="accueil-utilitaire" data-action="afficherModalNouveautes">
                \u2709\uFE0F<span class="pastille-nouveautes"></span> Nouvelles
            </button>
        </div>

        <div class="accueil-pied">
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                <img src="img/logo-codex-numeris.png" alt="Logo Labo Codex" class="accueil-pied-logo">
            </a>
            <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: var(--gris-moyen); text-decoration: none;">codexnumeris.org</a>
            <span style="font-size: 0.75rem; color: var(--gris-clair); font-style: italic;">R\u00e9fl\u00e9chir, exp\u00e9rimenter, partager.</span>
        </div>
    `;

    // Mettre a jour la pastille des nouveautes (elle est maintenant dans le DOM)
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
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Toggle mode démo depuis checkbox */
function toggleDemoHandler(el) {
    if (el.checked) {
        if (typeof entrerEnDemo === 'function') entrerEnDemo();
    } else {
        if (typeof quitterDemo === 'function') quitterDemo();
    }
}

/** Toggle tour guidé depuis checkbox */
function toggleTourGuideHandler(el) {
    if (typeof definirTourGuide === 'function') definirTourGuide(el.checked);
}

/** Toggle tooltips depuis checkbox */
function toggleTooltipsHandler(el) {
    if (typeof definirTooltips === 'function') definirTooltips(el.checked);
}

/** Toggle aide contextuelle depuis checkbox */
function toggleAideContextuelleHandler(el) {
    if (typeof definirAideContextuelle === 'function') definirAideContextuelle(el.checked);
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

/** Navigation vers structure avec wizard */
function naviguerVersWizard() {
    afficherSection('structure');
    setTimeout(function() { if (typeof ouvrirWizardV2 === 'function') ouvrirWizardV2(); }, 300);
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
window.toggleTourGuideHandler = toggleTourGuideHandler;
window.toggleTooltipsHandler = toggleTooltipsHandler;
window.toggleAideContextuelleHandler = toggleAideContextuelleHandler;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.naviguerVersWizard = naviguerVersWizard;
window.ouvrirModalBackup = ouvrirModalBackup;

})();
