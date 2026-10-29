/* ===============================
   MODULE: GUIDAGE CONTEXTUEL DÉMO
   Chantier 4 — MVP AQPC

   Encarts explicatifs statiques affichés dans chaque sous-section
   quand le mode démo est actif. Utilise le pattern .info-box--info.

   Exports: afficherGuidageDemo, retirerGuidageDemo
   =============================== */

(function() {
'use strict';

// Textes validés par Grégoire le 29 oct. 2026, de 7 h 53 à 7 h 57, groupe par groupe, posés mot pour mot
// (plans de travail/TEXTES-2026-10-28-guidage-demo.md ; consigne CONSIGNE-LOT-2026-10-29-guidage-demo.md). La clé est
// l'identifiant de la sous-section (navigation.js, afficherGuidageDemo) : la bulle de l'ancien Tableau de bord passe
// d'« apercu-contenu », qui ne s'affichait jamais, à « suivi-groupe » ; « suivi-apercu-legacy » (un écran retiré) part.
const GUIDAGE_TEXTES = {
    'suivi-groupe': {
        titre: "Suivi du groupe",
        texte: "Voici les indices A, C et P (assiduité, complétion, performance) des 10 étudiant·es de la démo. «\u00a0Détails\u00a0» les montre sur chaque étudiant·e, et un clic sur l'un d'eux ouvre son profil."
    },
    'suivi-liste': {
        titre: "Liste des étudiant·es",
        texte: "Une rangée par étudiant·e\u00a0: A, C et P, son profil d'apprentissage, son niveau RàI et ses interventions. Les filtres et la recherche resserrent la liste\u00a0; un clic sur une rangée ouvre le profil."
    },
    'suivi-profil': {
        titre: "Profils individuels",
        texte: "Le profil d'un·e étudiant·e, en sections\u00a0: «\u00a0Productions\u00a0», «\u00a0Engagement ACP\u00a0», «\u00a0Progression temporelle ACP\u00a0», «\u00a0Développement des habiletés\u00a0»… Le menu du haut passe d'un·e étudiant·e à l'autre. Si la RàI est activée, «\u00a0Accompagnement\u00a0» offre «\u00a0+ Nouvelle intervention\u00a0»."
    },
    'suivi-interventions': {
        titre: "Interventions",
        texte: "Tu y planifies et documentes tes interventions des niveaux RàI 2 et 3. «\u00a0Planifier une intervention\u00a0» ouvre une fiche\u00a0; les critères ciblés s'y pré-cochent d'après les défis communs des étudiant·es que tu coches. La démo n'en contient aucune."
    },
    'calendrier-vue': {
        titre: "Calendrier scolaire",
        texte: "Tous les mois du trimestre d'un coup. Les couleurs disent le type de journée et les échéances, pas les présences. Un clic sur un jour de cours ouvre la saisie des présences à cette date."
    },
    'suivi-saisie': {
        titre: "Saisie des présences",
        texte: "Choisis la «\u00a0Date du cours\u00a0». Par défaut, tous les étudiant·es sont présent·es\u00a0: saisis seulement les absences et les retards, en périodes. Si personne n'est absent, «\u00a0Confirmer la séance\u00a0» l'enregistre. La démo porte déjà 32 dates de présences, du 25 août au 10 décembre."
    },
    'evaluations-liste': {
        titre: "Liste des évaluations",
        texte: "Une rangée par copie attendue, avec son statut, sa note et ses jetons. Les filtres «\u00a0Production\u00a0» et «\u00a0Statut\u00a0» et la recherche resserrent la liste\u00a0; le menu «\u00a0Actions\u00a0» d'une rangée n'offre que ce que la copie permet. La démo porte 101 évaluations."
    },
    'evaluations-importer': {
        titre: "Préparer et importer",
        texte: "Importe les fichiers de tes étudiant·es (PDF ou images), prépare-les (rotation, assemblage des pages) et associe chacun à une production. La démo ne livre aucune copie\u00a0; ce que tu importes ici, «\u00a0Retirer les copies\u00a0» (bandeau vert) l'efface."
    },
    'evaluations-annoter': {
        titre: "Annoter et évaluer",
        texte: "Annote les copies à l'écran, appose des tampons, puis évalue-les selon la grille\u00a0: «\u00a0Actions ▾\u00a0» passe d'«\u00a0Annoter\u00a0» à «\u00a0Évaluer\u00a0». Pour annoter dans la démo, importe d'abord une copie\u00a0: le pack n'en livre aucune."
    },
    'evaluations-exporter': {
        titre: "Exporter les travaux",
        texte: "Sors tes copies et tes évaluations de l'application\u00a0: un ZIP pour tout le groupe, une production ou un·e étudiant·e, ou l'«\u00a0Export Léa\u00a0», un PDF à téléverser dans Léa."
    },
    'conception-grille-criteres': {
        titre: "Grilles de critères",
        texte: "Une grille porte tes critères, leur pondération et leur type. La démo en a 3\u00a0: deux toutes holistiques, une avec un critère algorithmique («\u00a0Français écrit\u00a0»). Ouvertes, elles sont en lecture seule\u00a0; «\u00a0Dupliquer pour créer ma grille\u00a0» t'en fait une copie."
    },
    'conception-echelle-performance': {
        titre: "Échelles de performance",
        texte: "Une échelle sert les critères holistiques\u00a0: tu choisis un niveau, l'échelle en donne la note. La démo en a 2, sur les niveaux I, D, M et E\u00a0; l'une ajoute un niveau 0, «\u00a0Aucun\u00a0». «\u00a0Dupliquer pour créer mon échelle\u00a0» t'en fait une copie."
    },
    'conception-retroactions': {
        titre: "Cartouches de rétroaction",
        texte: "Une cartouche porte un commentaire par critère et par niveau\u00a0; à l'évaluation, la rétroaction se compose des commentaires des niveaux atteints. La démo en a 9, liées à ses 3 grilles."
    },
    'conception-productions': {
        titre: "Productions étudiantes",
        texte: "Les productions sont les travaux que tes étudiant·es remettent. La démo en a 11\u00a0: un portfolio, les 9 artefacts qu'il rassemble et une évaluation terminale. Toutes, sauf le portfolio, sont liées à une grille."
    },
    'suivi-animation': {
        titre: "Animation",
        texte: "Trois outils pour animer la classe\u00a0: «\u00a0Questions flash\u00a0» tire une question de ta banque, «\u00a0Tirage au sort\u00a0» tire des étudiant·es, «\u00a0Équipes\u00a0» forme des équipes de 2, 3 ou 4 avec les présent·es du jour."
    },
    'conception-carte': {
        titre: "Carte d'alignement",
        texte: "La carte relie ce que tu vises, ce que tu enseignes et ce que tu évalues. Celle de la démo, «\u00a0Écriture et littérature (démo)\u00a0», compte 17 nœuds et 12 liens\u00a0: une compétence, trois idées maîtresses, puis une séquence de deux leçons, chacune avec ses connaissances, son activité et son évaluation formative. Le bouton «\u00a0Guide\u00a0» l'explique page par page."
    },
    'labo-modelisation': {
        titre: "Modélisation",
        texte: "«\u00a0+ Ouvrir\u00a0» charge un document de ton appareil (PDF, JPG, PNG\u00a0; HEIC selon le navigateur), que tu projettes et annotes devant le groupe. Les annotations restent d'une séance à l'autre."
    }
};


/**
 * Injecte l'encart de guidage dans la sous-section active
 * Appelé par afficherSousSection() dans navigation.js
 */
function afficherGuidageDemo(idSousSection) {
    retirerGuidageDemo();

    if (typeof estEnModeDemo !== 'function' || !estEnModeDemo()) return;

    const config = GUIDAGE_TEXTES[idSousSection];
    if (!config) return;

    const conteneur = document.getElementById(idSousSection);
    if (!conteneur) return;

    const encart = document.createElement('div');
    encart.id = 'guidage-demo-encart';
    encart.className = 'info-box info-box--info';
    encart.style.marginTop = '10px';
    encart.innerHTML = '<strong>' + config.titre + '</strong> \u2014 ' + config.texte;

    conteneur.insertBefore(encart, conteneur.firstChild);
}

/**
 * Retire l'encart de guidage (changement de sous-section ou sortie de démo)
 */
function retirerGuidageDemo() {
    const existant = document.getElementById('guidage-demo-encart');
    if (existant) existant.remove();
}

// === EXPORTS ===
window.afficherGuidageDemo = afficherGuidageDemo;
window.retirerGuidageDemo = retirerGuidageDemo;


})();
