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
 *
 * 15 novembre 2026 : les quatre blocs et les deux paragraphes du bas sont remplacés (mots arrêtés avec Grégoire,
 * relayés par Cowork, recopiés tels quels ; insécables devant « : », « ? » et « ! »). Le lien « Tutoriels » part.
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

    // Le paragraphe de droite : texte du 15 nov. 2026 (la boîte et ses styles ne changent pas).
    const paragrapheCommunaute = `
            <div class="banniere-bienvenue-acces">
                <p><strong>Envie d’en parler avec des collègues ?</strong> L’Association québécoise de pédagogie collégiale (AQPC) héberge une communauté de pratique Labo Codex. Des enseignant·es comme toi y échangent entre pairs et partagent des ressources libres.</p>
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
                    <p>Accompagner chacun·e avec bienveillance est exigeant. C’est pourquoi Labo Codex retient pour toi qui a besoin de soutien, et sur quoi : tu vois où en est ton groupe et tu planifies tes interventions. L’application réunit dans un seul outil des gestes qui te sont familiers : préparer ton cours, prendre les présences, évaluer les travaux et gérer les notes. Et si tu pratiques une notation alternative, elle convertit tes résultats en note chiffrée finale, sans tableur.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Le jugement humain</h3>
                    <p>Il n’y a aucune intelligence artificielle dans l’application et aucune décision n’est prise à ta place. L’outil éclaire ton jugement professionnel, il ne le remplace pas. Labo Codex n’impose aucune pratique et est entièrement configurable. Tu n’y trouveras ni défilement sans fin ni bouffées de dopamine, mais de quoi réfléchir à ta pratique et alléger un peu ta charge mentale.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Un espace autonome</h3>
                    <p>Labo Codex vit en marge des grosses plateformes. Son code est ouvert et l’application fonctionne sur ton ordinateur, ta tablette et même ton téléphone. Pour passer de l’un à l’autre, tu enregistres ton codex, un fichier que tu transportes sur une clé USB ou que tu déposes dans ton nuage personnel. Sans IA, l’application reste sobre en carbone.</p>
                </section>
                <section>
                    <h3 class="apropos-intertitre">Un accès gratuit et sécuritaire</h3>
                    <p>Tes données restent entre tes mains. Aucune donnée d’élève ne transite par des serveurs. Pour entrer, tu donnes ton adresse de courriel, tu reçois un code et c’est tout ! Tu restes ensuite connecté·e un mois sans avoir à renouveler ton accès. Il n’y a pas de commerce, pas de frais, pas d’abonnement, pas de publicité. Le seul échange souhaité est ton feedback et tes rapports de bugs (si tu en rencontres).</p>
                </section>
            </div>
            <div class="apropos-deux apropos-avec-filet">
                <div class="apropos-concepts">
                    <p><strong>Besoin d’un coup de main ?</strong> L’aide est accessible en tout temps dans l’application. Des parcours assistés, qui t’accompagneront pas à pas, sont en préparation. Des guides sont aussi là si tu veux aller plus loin.</p>
                    <ul class="apropos-liens banniere-bienvenue-actions">
                        <li><button type="button" class="apropos-lien" data-action="ouvrirPanneauAssistance">Assistance</button></li>
                        <li><button type="button" class="apropos-lien" data-action="naviguerAccueilCarte" data-param="labo|labo-accompagnement">Guides pédagogiques</button></li>
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
 *   - Pied de page : l'application et sa version, Nouveautés (et sa pastille, 11 nov.) ; Codex Numeris et le blogue.
 * Retirés le 7 nov. : « Utilitaires » (Ton codex, Nouveautés) et « Aide » (Assistance, Données
 * démo). Ton codex et Assistance sont dans l'en-tête et son menu ; Nouveautés, au pied de page ;
 * la démo s'ouvre par « Explorer » et se quitte par le bandeau vert.
 *
 * Aucun style= inline — tout passe par les classes CSS de index.html.
 */
function afficherAccueilContenu(conteneur) {
    const version = window.VERSION_MAJEURE || '';
    // Le build à côté de la version (Grégoire, 11 nov. 2026 : « c'est le lieu le plus rapide pour l'identifier »), lu de
    // version.js (window.BUILD_ID, établi par init-inline.js) : celui du code chargé. Insécable : il ne se coupe pas.
    // « · 1111-1040 », le mot « build » pour le lecteur d'écran seulement : « (build …) » ne tenait pas sur la ligne de
    // « Nouveautés » à 820 et à 390 px (mesuré sous WebKit : 36 px de trop), que Grégoire veut sur une même ligne (10 nov.).
    const build = window.BUILD_ID || '';

    conteneur.innerHTML = `
        ${genererBanniereBienvenue()}

        <div class="accueil-section-label">Tâches</div>
        <div class="accueil-grille-actions">
            ${TACHES.map(genererTache).join('')}
        </div>

        <footer class="accueil-pied">
            <div class="accueil-pied-moitie accueil-pied-application">
                <div class="accueil-pied-texte">
                    <div class="accueil-pied-ligne">
                        <span class="accueil-pied-version">Bêta publique ${version}${build ? ` <span class="accueil-pied-build">· <span class="u-lecteur-ecran">build </span>${build}</span>` : ''}</span>
                        <button type="button" class="accueil-pied-lien" data-action="afficherModalNouveautes">Nouveautés<span class="pastille-nouveautes" data-annonce=" (disponibles)"></span></button>
                    </div>
                    <span class="accueil-pied-tagline">Suivre l’apprentissage, soutenir l’enseignement.</span>
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

    // 11 nov. 2026 (Grégoire, 7 h 25) : la pastille d'« Accueil » se répète à côté de « Nouveautés »,
    // qui dit pourquoi elle est là. Le pied vient d'être redessiné : l'allumer selon l'état courant.
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
 * Porte « Tu enseignes ? » : le parcours « Mettre ta classe en place » (js/parcours-classe.js,
 * lot « Les deux parcours », partie 2, 9 nov. 2026). Il ouvre Cadre › Trimestre et ses blocs
 * lui-même, à la première étape non faite ; avant lui, cette porte ouvrait l'accordéon Trimestre.
 */
function commencerParLeTrimestre() {
    const classe = window.Assistance.parcours().find(function(p) { return p.id === 'classe'; });
    if (classe) { classe.lancer(); return; }
    // Parcours fermés (15 nov. 2026, js/assistance.js) : la porte ne reste pas muette, elle mène à
    // Cadre › Trimestre, là où le parcours commençait.
    naviguerAccueilCarte('calendrier|calendrier-trimestre');
}

/**
 * Porte « Tu es conseiller·ère pédagogique ? » : entre dans la démo. `activerModeDemo` porte
 * la garde de l'import (T7) ; si la démo est déjà active, rien n'est réactivé. On en sort par
 * « Quitter la démo », dans le bandeau vert (la case « Données démo » est retirée le 7 nov.).
 */
async function explorerDonneesDemo() {
    if (typeof estEnModeDemo === 'function' && estEnModeDemo()) return;
    if (typeof activerModeDemo === 'function') await activerModeDemo();
    // Lot 3 (7 nov. 2026, décision de Cowork) : à la première entrée seulement, la fenêtre d'aide « Données
    // démo » s'ouvre — son déclencheur, la case de l'accueil, est parti avec elle. Rien si la démo n'est pas
    // entrée (un import en cours l'empêche).
    if (!(typeof estEnModeDemo === 'function' && estEnModeDemo())) return;
    if (typeof obtenirPreference !== 'function' || obtenirPreference('aideDemoVue') === true) return;
    if (typeof definirPreference === 'function') definirPreference('aideDemoVue', true);
    if (typeof window !== 'undefined' && window.accompagnement && typeof window.accompagnement.afficherAide === 'function') {
        window.accompagnement.afficherAide('accueil-donnees-demo');
    }
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
