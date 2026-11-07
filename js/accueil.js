/* ===============================
   MODULE: PAGE D'ACCUEIL
   « L'accueil épuré » (7 nov. 2026, consigne de Grégoire, esquisse 64) :
     - « À propos », repliable, qui porte aussi « Par où commencer ? » (les trois portes) ;
     - « Tâches » : neuf cartes, chacune dit où elle mène ;
     - pied de page à deux moitiés (l'application | Codex Numeris).
   Retirés : « Utilitaires » (Ton codex, Nouveautés) et « Aide » (Assistance, Données démo).
   Historique : V3 du 19 avril 2026 (ebauches-accueil.html), au journal git.

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
 * Génère la bannière de bienvenue, titrée « À propos » (ouverte par « Bienvenue dans Labo Codex ! »).
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
 * 2026, porte ouverte (`Include → Everyone`) + OTP, session d'un mois — GESTE
 * POSÉ le 31 août 2026 à 08 h 36, la veille, pour être en place avant un cours
 * de 8 h. Le paragraphe ci-dessous est passé au présent le même jour ; il dit
 * le renouvellement du mois, parce que « valable un mois » se lisait comme une
 * date de péremption. La phrase d'avis (4e des 5 blocs du corps, avant
 * l'invitation à la CoP) a été doublée, du 27 au 31 août, d'un bandeau daté
 * (js/transitions.js, entrée `avis-identification-2026-09-01`), parce qu'un avis
 * vivant dans un accordéon repliable n'est pas lu.
 *
 * 31 août 2026 (#639) : le bandeau est RETIRÉ. Sa condition l'éteignait seule à
 * minuit, mais « s'éteint seul » est vrai pour l'écran et faux pour le dépôt —
 * l'entrée serait restée en place, invisible, sous un titre (« À partir du
 * 1ᵉʳ septembre ») qui annonçait au futur un geste déjà posé. Le paragraphe
 * ci-dessous, lui, PORTE SEUL l'information désormais : c'est le seul endroit
 * où le lecteur apprend comment l'accès fonctionne. Textes de référence au §8 de
 * `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`.
 * Cf. ADR-008 (révision 27 août 2026), DEPLOY.md (révision v1.6).
 * Source texte d'origine : docs/refonte-textes/textes-manquants-bloc4.md
 * (validé 19 avril 2026).
 *
 * 14 octobre 2026 : texte réécrit par Grégoire (mots arrêtés par lui, recopiés tels
 * quels) ; la barre repliable s'intitule « À propos ». L'amorce « Ton courriel, une
 * fois par mois. » disparaît : le paragraphe d'accès est désormais sans amorce.
 *
 * 28 octobre 2026 : texte remplacé en entier par Grégoire (mots recopiés tels quels ; « 100 % » prend l'insécable (#1137) et les
 * « — » d'incise deviennent « – »). « Par où commencer ? » et la ligne de l'orthopédagogue
 * partent : les trois portes de l'encadré qui suit portent désormais ces entrées.
 */
// La question de l'orthopédagogue, que dit la porte du milieu : écrite une fois (sentinelle #846, B3).
const QUESTION_ORTHOPEDAGOGUE = 'Tu es orthopédagogue ?';

/**
 * « L'accueil épuré » (consigne du 7 nov. 2026, esquisse 64) : « À propos » s'ouvre tant
 * qu'aucun trimestre n'existe ; ensuite, il garde le choix de la personne (préférence
 * `banniereAccueilRepliee`, ouverte par défaut). Le trimestre de la démo ne compte pas.
 */
function aproposReplie() {
    const trimestres = typeof window.obtenirTrimestres === 'function' ? window.obtenirTrimestres() : [];
    const aUnTrimestre = trimestres.some((t) => t && t.id !== 'demo');
    if (!aUnTrimestre) return false;
    return (typeof obtenirPreference === 'function') && obtenirPreference('banniereAccueilRepliee') === true;
}

function genererBanniereBienvenue() {
    const replie = aproposReplie();

    // L'encadré de la CoP : inchangé (consigne du 7 nov.).
    const paragrapheCommunaute = `
            <div class="banniere-bienvenue-acces">
                <p><strong>Tu as besoin de support humain ?</strong> L’Association québécoise de pédagogie collégiale (AQPC) héberge une Communauté de pratique (CoP) Labo Codex. C’est le lieu tout désigné pour obtenir du soutien et échanger entre pairs. Des enseignant·es comme toi y explorent d’autres pratiques pédagogiques et co-construisent des ressources libres.</p>
            </div>`;

    return `
        <div class="banniere-bienvenue carte ${replie ? 'est-replie' : ''}" id="banniere-bienvenue">
            <button type="button" class="banniere-bienvenue-toggle" data-action="basculerBanniereBienvenue" aria-expanded="${replie ? 'false' : 'true'}" aria-controls="banniere-bienvenue-corps">
                <span class="banniere-bienvenue-titre">À propos</span>
                <span class="banniere-chevron" aria-hidden="true"></span>
            </button>
            <div id="banniere-bienvenue-corps" class="banniere-bienvenue-corps">
            <h2 class="apropos-devise">Suivre l’apprentissage. Soutenir l’enseignement.</h2>
            <div class="apropos-colonnes">
                <section>
                    <h3 class="apropos-intertitre">Ce que fait l’application</h3>
                    <p>Labo Codex est une application qui te propose de numériser ton travail et de rendre visibles et interprétables les micro-données que tu crées et recueilles dans ton environnement. Elle te permet ainsi de mieux voir les conditions de ton écosystème-classe et de mieux planifier tes interventions.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Ton jugement d’abord</h3>
                    <p>Une de ses particularités est qu’il n’y a aucune intelligence artificielle dans l’application. Ton jugement professionnel est souverain et l’outil ne fait que l’éclairer. Labo Codex n’impose aucune pratique, est entièrement configurable et aucune décision n’est prise à ta place. L’application n’offre pas la possibilité de scroller très longtemps et elle ne provoque pas de grandes bouffées de dopamine. Par contre, elle permet de réfléchir à ta pratique et de te libérer un peu de ta charge mentale.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Un commun éducatif</h3>
                    <p>Tu peux faire les mêmes gestes que d’habitude – planifier, concevoir, évaluer et suivre la progression de tes étudiant·es – mais dans un seul outil numérique intégré. Labo Codex t’offre un espace autonome, indépendant, confidentiel, gratuit, ouvert, portable et sobre en carbone ! L’objectif est d’inventer et d’organiser avec cette ressource un commun éducatif, pérenne et ouvert, en marge des grosses plateformes.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Tes données chez toi</h3>
                    <p>Tu entres ton adresse de courriel, tu reçois un code de sécurité et c’est tout ! Une fois entré·e, tu restes connecté·e un mois sans avoir à renouveler ton accès. Tes données restent 100 % sur ton appareil. Il n’y a pas de commerce, pas de frais, pas d’abonnement, pas de publicité. Le seul échange souhaité est ton feedback et tes rapports de bugs (si tu en rencontres).</p>
                </section>
            </div>
            <div class="apropos-deux apropos-avec-filet">
                <div class="apropos-concepts">
                    <p><strong>Certains concepts sont nouveaux ?</strong> Trois guides t’expliquent le concept des micro-données, la taxonomie SOLO et le modèle RàI qui servent au dépistage des difficultés et à la planification des interventions. L’aide et les guides sont accessibles en tout temps.</p>
                    <ul class="apropos-liens banniere-bienvenue-actions">
                        <li><button type="button" class="apropos-lien" data-action="demarrerTourGuide">Visite guidée</button></li>
                        <li><button type="button" class="apropos-lien" data-action="naviguerAccueilCarte" data-param="labo|labo-accompagnement">Guides pédagogiques</button></li>
                        <li><a class="apropos-lien" href="https://codexnumeris.org/tutoriels" target="_blank" rel="noopener noreferrer">Tutoriels <span aria-hidden="true">↗</span><span class="u-lecteur-ecran"> (s’ouvre dans un nouvel onglet)</span></a></li>
                    </ul>
                </div>
                ${paragrapheCommunaute}
            </div>
            <div class="apropos-avec-filet">
                <div class="accueil-section-label">Par où commencer ?</div>
                <div class="accueil-portes" id="accueil-portes">
                    <div class="accueil-porte">
                        <div class="accueil-porte-titre">Tu enseignes ?</div>
                        <div class="accueil-porte-desc">Crée ton trimestre, ton cours et ton groupe, puis apporte ta grille d’évaluation.</div>
                        <button type="button" class="btn btn-principal accueil-porte-bouton" data-action="commencerParLeTrimestre">Commencer</button>
                    </div>
                    <div class="accueil-porte">
                        <div class="accueil-porte-titre">${QUESTION_ORTHOPEDAGOGUE}</div>
                        <div class="accueil-porte-desc">Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre.</div>
                        <button type="button" class="btn btn-principal accueil-porte-bouton" data-action="naviguerAccueilCarte" data-param="suivi|suivi-rencontres">Commencer</button>
                    </div>
                    <div class="accueil-porte">
                        <div class="accueil-porte-titre">Tu es conseiller·ère pédagogique ?</div>
                        <div class="accueil-porte-desc">Explore un cours de démonstration déjà configuré, aux données fictives mais réalistes.</div>
                        <button type="button" class="btn btn-principal accueil-porte-bouton" data-action="explorerDonneesDemo">Explorer</button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;
}

/**
 * Replie ou déplie « À propos ». L'état (préférence UI globale, non namespacée par
 * trimestre) est mémorisé via le système de préférences. Le <button> natif gère
 * Entrée/Espace et le focus ; seul le corps se masque, la barre de titre reste visible.
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
 * Les neuf tâches (consigne du 7 nov. 2026) : où chacune mène est écrit en bas de sa carte.
 * Toutes naviguent ; « Adopter ta pratique » ouvre en plus l'assistant de pratique, sur sa page.
 */
const TACHES = [
    // Mène à Conception › Pratiques et y ouvre l'assistant (décision de Cowork, 7 nov. 2026).
    { action: 'ouvrirWizardPratique', icone: 'ico-acc-data-sheet', titre: 'Adopter ta pratique', desc: 'Construction de la note du cours, sommative ou alternative.', chemin: 'Conception › Pratiques' },
    { param: 'conception|conception-carte', icone: 'ico-acc-puzzle', titre: 'Planifier ton cours', desc: 'Alignement constructif des objectifs, leçons et évaluations.', chemin: 'Conception › Alignement' },
    { param: 'suivi|suivi-saisie', icone: 'ico-acc-people', titre: 'Saisir les présences', desc: 'Absences, retards et notes de séance.', chemin: 'Suivi › Présences' },
    { param: 'evaluations|evaluations-importer', icone: 'ico-acc-downloading', titre: 'Importer des copies', desc: 'Fichiers PDF ou images des travaux d’étudiant·es.', chemin: 'Évaluation › Préparer' },
    { param: 'evaluations|evaluations-annoter', icone: 'ico-acc-edit', titre: 'Annoter et évaluer', desc: 'Annotation, niveaux ou note par critère, rétroaction automatisée.', chemin: 'Évaluation › Annoter' },
    { param: 'suivi|suivi-groupe', icone: 'ico-acc-line-chart', titre: 'Observer le groupe', desc: 'Assiduité, complétion, performance et dépistage des difficultés d’apprentissage.', chemin: 'Suivi › Groupe' },
    { param: 'suivi|suivi-profil', icone: 'ico-acc-profile', titre: 'Consulter un profil', desc: 'Engagement, travaux, progression et accompagnement.', chemin: 'Suivi › Profils' },
    { param: 'suivi|suivi-interventions', icone: 'ico-acc-pause-button', titre: 'Différencier les interventions', desc: 'Niveaux de besoin, rencontres et bilans.', chemin: 'Suivi › Interventions' },
    { param: 'suivi|suivi-rencontres', icone: 'ico-acc-rencontres', titre: 'Organiser tes rencontres', desc: 'Service d’orthopédagogie : suivi en petit groupe ou en individuel.', chemin: 'Suivi › Rencontres' }
];

function genererTache(t) {
    const action = t.action
        ? `data-action="${t.action}"`
        : `data-action="naviguerAccueilCarte" data-param="${t.param}"`;
    return `
            <div class="accueil-action" role="button" tabindex="0" ${action}>
                <div class="accueil-action-icone"><span class="accueil-icone-mask ${t.icone}"></span></div>
                <div class="accueil-action-titre">${t.titre}</div>
                <div class="accueil-action-desc">${t.desc}</div>
                <div class="accueil-action-chemin">${t.chemin}</div>
            </div>`;
}

/**
 * Contenu de la page d'accueil — « L'accueil épuré » (7 nov. 2026).
 *
 *   - « À propos », repliable : la devise, les quatre paragraphes sous leurs intertitres,
 *     les concepts (trois liens) et la CoP, puis « Par où commencer ? » et les trois portes
 *     (28 oct. 2026 ; la porte de l'orthopédagogie, consigne du 12 sept. — Grégoire : « Je veux
 *     que l'orthopédagogue sente qu'elle entre par la porte principale. »).
 *   - Tâches : neuf cartes.
 *   - Pied de page : l'application et sa version, Nouveautés ; Codex Numeris et le blogue.
 * Retirés le 7 nov. : « Utilitaires » (Ton codex, Nouveautés) et « Aide » (Assistance, Données
 * démo). Ton codex et Assistance sont dans l'en-tête et son menu ; Nouveautés, au pied de page ;
 * la démo s'ouvre par « Explorer » et se quitte par le bandeau vert.
 *
 * Aucun style= inline — tout passe par les classes CSS de index.html.
 */
function afficherAccueilContenu(conteneur) {
    const version = window.VERSION_MAJEURE || '';

    conteneur.innerHTML = `
        ${genererBanniereBienvenue()}

        <div class="accueil-section-label">Tâches</div>
        <div class="accueil-grille-actions">
            ${TACHES.map(genererTache).join('')}
        </div>

        <footer class="accueil-pied">
            <div class="accueil-pied-moitie accueil-pied-application">
                <div class="accueil-pied-texte">
                    <span class="accueil-pied-version">Bêta publique ${version}</span>
                    <button type="button" class="accueil-pied-lien" data-action="afficherModalNouveautes">Nouveautés</button>
                </div>
                <img src="img/labo-codex-logo-blanc.svg" alt="Labo Codex" class="accueil-pied-logo">
            </div>
            <div class="accueil-pied-moitie accueil-pied-codex-numeris">
                <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-logo-link">
                    <img src="img/logo-codex-numeris.svg" alt="Codex Numeris" class="accueil-pied-logo">
                </a>
                <div class="accueil-pied-texte">
                    <a href="https://codexnumeris.org" target="_blank" rel="noopener noreferrer" class="accueil-pied-lien">Le blog : codexnumeris.org<span class="u-lecteur-ecran"> (s’ouvre dans un nouvel onglet)</span></a>
                    <span class="accueil-pied-tagline">Réfléchir, expérimenter, partager.</span>
                </div>
            </div>
        </footer>
    `;

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

/**
 * Porte « Tu enseignes ? » : Cadre › Trimestre, puis la première étape de la barre de
 * convergence (l'accordéon Trimestre) — le geste d'un clic sur cette étape, pas un second.
 * Le délai suit celui de naviguerAccueilCarte : la sous-section doit être affichée.
 */
function commencerParLeTrimestre() {
    naviguerAccueilCarte('calendrier|calendrier-trimestre');
    setTimeout(function() {
        if (typeof window.ouvrirAccordeonDeLEtape === 'function') window.ouvrirAccordeonDeLEtape('trimestre');
    }, 200);
}

/**
 * Porte « Tu es conseiller·ère pédagogique ? » : entre dans la démo. `activerModeDemo` porte
 * la garde de l'import (T7) ; si la démo est déjà active, rien n'est réactivé. On en sort par
 * « Quitter la démo », dans le bandeau vert (la case « Données démo » est retirée le 7 nov.).
 */
function explorerDonneesDemo() {
    if (typeof estEnModeDemo === 'function' && estEnModeDemo()) return;
    if (typeof activerModeDemo === 'function') activerModeDemo();
}

/**
 * « Adopter ta pratique » (décision de Cowork, 7 nov. 2026) : mène à Conception › Pratiques, puis y ouvre
 * l'assistant en fenêtre — en le fermant, on est sur la page que la carte annonce. Le délai suit celui de
 * commencerParLeTrimestre : la sous-section doit être affichée avant l'ouverture.
 */
function ouvrirWizardPratique() {
    naviguerAccueilCarte('conception|conception-pratiques-notation');
    setTimeout(function() {
        if (typeof ouvrirWizardV2 === 'function') ouvrirWizardV2();
    }, 200);
}

// === EXPORTS ===
window.afficherAccueil = afficherAccueil;
window.initialiserAccueil = initialiserAccueil;
window.definirModeExpert = definirModeExpert;
window.naviguerAccueilCarte = naviguerAccueilCarte;
window.basculerBanniereBienvenue = basculerBanniereBienvenue;
window.ouvrirWizardPratique = ouvrirWizardPratique;
window.commencerParLeTrimestre = commencerParLeTrimestre;
window.explorerDonneesDemo = explorerDonneesDemo;

})();
