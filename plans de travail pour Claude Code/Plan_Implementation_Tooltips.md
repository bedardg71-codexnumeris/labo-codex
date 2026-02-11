# Plan d'implémentation — Tooltips (En-tête + Réglages complet)

**Destinataire** : Claude Code (accès direct au dépôt Monitorage_v6)
**Mécanisme** : Survol (hover) — tooltips légers
**Contraintes** : Vanilla JS ES6+, zéro dépendance, client-side uniquement
**Scope** : En-tête (sauf titre) + Réglages (Trimestre, Préférences, Dépistage)

---

## 1. Architecture

### Trois fichiers à créer

```
js/
  tooltips.js              ← Moteur (positionnement, affichage, cycle de vie)
  tooltips-contenu.js      ← Base de contenu centralisée (clés → textes)
css/
  tooltips.css             ← Styles (bulle, flèche, animation)
```

### Principe

Chaque élément cible reçoit un attribut `data-tooltip="cle-unique"`. Le moteur JS écoute les événements `mouseenter` / `mouseleave` sur tout élément portant cet attribut, cherche le texte dans la base de contenu, et positionne une bulle flottante.

Aucun HTML n'est dupliqué : le contenu vit dans `tooltips-contenu.js`, les cibles sont marquées par un simple attribut dans le HTML existant.

---

## 2. Fichier tooltips-contenu.js

Objet global `TOOLTIPS` avec toutes les clés. Regroupé par zone.

```javascript
/**
 * tooltips-contenu.js
 * Base de contenu des tooltips — En-tête + Réglages
 * Convention : tutoiement, guillemets français « »
 */
(function() {
'use strict';

const TOOLTIPS = {

    // =================================================================
    // EN-TÊTE — Zone 1 : Bandeau d'identification
    // =================================================================

    'entete-logo':
        'codexnumeris.org — Blog dans lequel est décrite l\'exploration du Système de suivi des apprentissages. « Réfléchir, expérimenter, partager. »',

    'entete-version':
        'Version actuelle du système. Le numéro de build permet d\'identifier précisément la version lors d\'un signalement de bogue.',

    'entete-mode-affichage':
        'Bascule entre l\'affichage des noms réels (Normal) et des noms fictifs ou numéros (Anonymisation) pour protéger l\'identité des étudiants lors de présentations publiques.',

    'entete-signaler-bug':
        'Signaler un problème technique. Pense à noter le numéro de build affiché dans le bandeau pour faciliter le diagnostic.',

    // =================================================================
    // EN-TÊTE — Zone 2 : Contexte de travail
    // =================================================================

    'entete-pratique':
        'Pratique de notation active pour ce cours et cette session. Le code identifie le modèle d\'évaluation (PAN-SDT), le cours (Litt) et la session (H26).',

    'entete-semaine':
        'Semaine courante du trimestre et date du jour. Situe l\'enseignant dans la progression de la session.',

    // =================================================================
    // EN-TÊTE — Zone 3 : Groupe-cours
    // =================================================================

    'entete-groupe-cours':
        'Sélectionner le groupe-cours sur lequel travailler. Toutes les données affichées (présences, évaluations, tableau de bord) s\'ajustent au groupe choisi.',

    // =================================================================
    // EN-TÊTE — Zone 4 : Navigation
    // =================================================================

    'entete-nav-principale':
        'Modules principaux du système. Chaque onglet ouvre une section dédiée avec sa propre sous-navigation.',

    'entete-sous-nav':
        'Sous-sections du module actif. Ce menu change selon l\'onglet principal sélectionné.',

    'entete-reglages':
        'Réglages de base : configuration du trimestre actif, du cours, du groupe-cours, de l\'horaire et des préférences.',

    // =================================================================
    // RÉGLAGES — Sous-navigation
    // =================================================================

    'reglages-sous-nav':
        'Configuration de base de l\'application. Commence par Trimestre pour définir le cadre organisationnel.',

    // =================================================================
    // RÉGLAGES — Panneaux du sous-onglet Trimestre
    // =================================================================

    'reglages-gestion-trimestres':
        'Configurer le trimestre actif : dates, bornes, semaines spéciales, congés et événements imprévus. Ces informations définissent le calendrier de tout le système.',

    'reglages-cours':
        'Définir le cours enseigné : code, compétence ministérielle et éléments de compétence. Ces informations sont le point d\'ancrage de l\'alignement pédagogique.',

    'reglages-enseignant':
        'Profil de l\'enseignant. Ces informations servent de métadonnées pour les ressources partagées et s\'affichent dans le sélecteur de groupe-cours.',

    'reglages-groupe-etudiants':
        'Gérer la liste des étudiants : ajout manuel, import en lot (CSV/Excel/Omnivox). Le marqueur SA identifie les étudiants en situation d\'aide pour le suivi RàI.',

    'reglages-horaire':
        'Configurer l\'horaire d\'un groupe : jours, heures, locaux, nombre de périodes. L\'horaire et le calendrier du trimestre génèrent automatiquement la grille des séances.',

    'reglages-groupe-cours':
        'Assembler un groupe-cours en réunissant trimestre, cours, groupe, horaire, enseignant et pratique de notation. Le groupe-cours actif détermine les données affichées dans toute l\'application.',

    // =================================================================
    // RÉGLAGES — Champs spécifiques (Trimestre)
    // =================================================================

    'reglages-trim-identification':
        'Ces informations identifient le trimestre et préfixent les données stockées.',

    'reglages-trim-bornes':
        'Les dates de début, de fin, de fin des cours réguliers et de remise des notes définissent le calendrier sur lequel s\'appuient les semaines et les séances.',

    'reglages-trim-semaines-speciales':
        'Semaine de planification et semaine d\'examens. Ces semaines sont traitées différemment dans le calcul des séances et la planification.',

    'reglages-trim-conges':
        'Congés fériés avec dates et reprises associées. Ajuste automatiquement le calendrier des séances.',

    'reglages-trim-imprevus':
        'Événements non planifiés (annulations, fermetures) qui ajustent le calendrier des séances.',

    // =================================================================
    // RÉGLAGES — Champs spécifiques (Cours)
    // =================================================================

    'reglages-cours-competence':
        'Code et énoncé de la compétence ministérielle visée par le cours. Point d\'ancrage de l\'alignement pédagogique.',

    'reglages-cours-elements':
        'Sous-compétences à développer durant le cours. Servent de référence pour la planification et les évaluations.',

    // =================================================================
    // RÉGLAGES — Champs spécifiques (Groupe d'étudiants)
    // =================================================================

    'reglages-etudiants-sa':
        'Situation d\'aide — Marqueur pour les étudiants identifiés dans le modèle de Réponse à l\'Intervention (RàI). Alimente le module d\'interventions du Tableau de bord.',

    'reglages-etudiants-import':
        'Importer des étudiants en lot : coller depuis Excel/Omnivox ou charger un fichier CSV/TSV. Format : DA, Groupe, Nom, Prénom, Programme, (vide), SA.',

    // =================================================================
    // RÉGLAGES — Champs spécifiques (Horaire)
    // =================================================================

    'reglages-horaire-periodes':
        'Le nombre de séances × périodes par séance détermine le volume hebdomadaire. La durée d\'une période s\'applique à tous les horaires.',

    // =================================================================
    // RÉGLAGES — Champs spécifiques (Groupe-cours)
    // =================================================================

    'reglages-gc-nom-genere':
        'Nom généré automatiquement à partir des 5 éléments assemblés. C\'est ce nom qui apparaît dans le sélecteur de groupe-cours en en-tête.',

    'reglages-gc-pratique':
        'Pratique de notation associée à ce groupe-cours. Détermine les règles de construction de la note (sommative traditionnelle ou PAN basée sur des standards).',

    // =================================================================
    // RÉGLAGES — Patron Bibliothèque
    // =================================================================

    'reglages-bibliotheque':
        'Bibliothèque d\'entités réutilisables. Sélectionne une entité existante ou crée-en une nouvelle. Permet de réutiliser des configurations d\'un trimestre à l\'autre.',

    // =================================================================
    // RÉGLAGES — Préférences
    // =================================================================

    'pref-sous-nav':
        'Personnaliser l\'expérience : outils actifs, ressources affichées, effets visuels et comportement de navigation.',

    'pref-outils':
        'Activer ou désactiver les fonctionnalités avancées (indices ACP, système RàI). Les outils désactivés sont masqués de l\'interface.',

    'pref-outils-acp':
        'Indices prédictifs Assiduité, Complétion, Performance. Calculés sur une fenêtre glissante, ils alimentent le tableau de bord et la détection précoce des difficultés.',

    'pref-outils-rai':
        'Niveaux d\'intervention et recommandations personnalisées. Structure le soutien aux étudiants en trois niveaux d\'intensité (universel, ciblé, intensif).',

    'pref-affichage':
        'Choisir les ressources visibles dans l\'interface : cartes SOLO, snapshots, graphiques, détails techniques, mode comparatif. Adapte la densité d\'information affichée.',

    'pref-affichage-solo':
        'Affiche une carte avec les descriptions détaillées basées sur la taxonomie SOLO. Utile pour interpréter le niveau cognitif des apprentissages.',

    'pref-affichage-snapshots':
        'Historique hebdomadaire des indices A-C-P. Permet de suivre l\'évolution dans le temps.',

    'pref-affichage-graphiques':
        'Visualisation de la progression dans le temps via Chart.js.',

    'pref-affichage-details':
        'Affiche les formules de calcul et les données brutes. Destiné aux utilisateurs souhaitant vérifier les calculs sous-jacents.',

    'pref-affichage-assiduité':
        'Choisir comment afficher les totaux de présence et d\'assiduité (ex. : en périodes).',

    'pref-affichage-comparatif':
        'Mode expérimental. Affiche les deux pratiques de notation (SOM et PAN) côte à côte pour comparer les approches.',

    'pref-visuel':
        'Effets visuels de l\'interface. L\'animation des points du tableau de bord peut être désactivée pour réduire les distractions.',

    'pref-navigation':
        'Court-circuiter la page d\'accueil pour ouvrir directement sur le tableau de bord au démarrage.',

    // =================================================================
    // RÉGLAGES — Dépistage
    // =================================================================

    'depist-sous-nav':
        'Configuration de la détection des patterns et de l\'identification des forces et défis. Influence la sensibilité des alertes du tableau de bord.',

    'depist-activer-patterns':
        'Activer ou désactiver l\'identification des tendances récurrentes (progression, stagnation, régression) dans les résultats.',

    'depist-grille':
        'Grille utilisée pour identifier les forces et défis. Doit être la même pour tous les artefacts du trimestre.',

    'depist-decoupler-pr':
        'Séparer le calcul de la note (P, selon la pratique) du calcul de risque (R, basé sur les N dernières productions). Recommandé avec « N meilleurs ».',

    'depist-fenetre':
        'Nombre de dernières productions analysées pour détecter les tendances. Valeur basse = détection précoce. Valeur élevée = détection plus fiable.',

    'depist-seuil-progression':
        'Différence minimale (%) pour signaler une progression ou régression entre deux artefacts. Bas = sensible, élevé = moins sensible.',

    'depist-seuil-direction':
        'Variation minimale (%) pour afficher une tendance du risque. Contrôle la sensibilité de l\'indicateur directionnel.',

    'depist-seuil-defi':
        'Score (%) sous lequel un critère est identifié comme un défi nécessitant attention. Bas = plus exigeant, élevé = moins exigeant.',

    'depist-restaurer':
        'Réinitialiser tous les seuils de détection à leurs valeurs par défaut.',

    // =================================================================
    // RÉGLAGES — Seuils d'interprétation
    // =================================================================

    'depist-seuils-interpretation':
        'Seuils de couleur pour les indices A-C-P. Fragile (rouge), Acceptable (jaune), Bon (vert). Détermine les alertes du tableau de bord.',

    'depist-seuils-visuels':
        'Activer ou désactiver l\'affichage des couleurs Fragile / Acceptable / Bon dans les tableaux et indicateurs.',

    'depist-seuil-fragile':
        'Indice sous lequel la situation est considérée préoccupante (rouge). Nécessite une intervention.',

    'depist-seuil-acceptable':
        'Indice sous lequel la situation est en zone de vigilance (jaune). À surveiller.',

    'depist-seuil-bon':
        'Indice au-dessus duquel la situation est satisfaisante (vert).',

    'depist-seuils-restaurer':
        'Réinitialiser les seuils d\'interprétation à leurs valeurs par défaut (70/80/85%).'
};

// Export global
window.TOOLTIPS = TOOLTIPS;

})();
```

---

## 3. Fichier tooltips.js

Moteur léger : écoute les hover, crée/positionne/détruit la bulle.

```javascript
/**
 * tooltips.js
 * Moteur de tooltips au survol — Monitorage Pédagogique
 *
 * Usage HTML : <element data-tooltip="cle-unique">
 * Le texte est lu depuis window.TOOLTIPS[cle]
 */
(function() {
'use strict';

// --- Configuration ---
const DELAI_AFFICHAGE = 400;    // ms avant apparition
const DELAI_DISPARITION = 200;  // ms avant disparition
const MARGE = 8;                // px entre la bulle et l'élément
const LARGEUR_MAX = 320;        // px largeur max de la bulle

// --- État ---
let timerAffichage = null;
let timerDisparition = null;
let bulleActive = null;
let cibleActive = null;

/**
 * Crée l'élément bulle s'il n'existe pas
 * @returns {HTMLElement}
 */
function obtenirBulle() {
    let bulle = document.getElementById('tooltip-bulle');
    if (!bulle) {
        bulle = document.createElement('div');
        bulle.id = 'tooltip-bulle';
        bulle.className = 'tooltip-bulle';
        bulle.setAttribute('role', 'tooltip');

        const fleche = document.createElement('div');
        fleche.className = 'tooltip-fleche';
        bulle.appendChild(fleche);

        const contenu = document.createElement('div');
        contenu.className = 'tooltip-contenu';
        bulle.appendChild(contenu);

        document.body.appendChild(bulle);
    }
    return bulle;
}

/**
 * Calcule la position optimale de la bulle
 * Essaie : bas, haut, droite, gauche (dans cet ordre)
 * @param {HTMLElement} cible
 * @param {HTMLElement} bulle
 */
function positionnerBulle(cible, bulle) {
    const rect = cible.getBoundingClientRect();
    const bulleRect = bulle.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left;
    let position = 'bas';

    // Essayer en bas
    top = rect.bottom + MARGE;
    left = rect.left + (rect.width / 2) - (bulleRect.width / 2);

    if (top + bulleRect.height > vh) {
        top = rect.top - bulleRect.height - MARGE;
        position = 'haut';
    }

    if (top < 0) {
        top = rect.top + (rect.height / 2) - (bulleRect.height / 2);
        left = rect.right + MARGE;
        position = 'droite';

        if (left + bulleRect.width > vw) {
            left = rect.left - bulleRect.width - MARGE;
            position = 'gauche';
        }
    }

    // Contraindre dans le viewport
    left = Math.max(MARGE, Math.min(left, vw - bulleRect.width - MARGE));
    top = Math.max(MARGE, top);

    bulle.style.top = `${top + window.scrollY}px`;
    bulle.style.left = `${left + window.scrollX}px`;
    bulle.dataset.position = position;
}

/**
 * Affiche le tooltip pour une cible donnée
 * @param {HTMLElement} cible
 */
function afficher(cible) {
    const cle = cible.dataset.tooltip;
    if (!cle || !window.TOOLTIPS || !window.TOOLTIPS[cle]) return;

    const texte = window.TOOLTIPS[cle];
    const bulle = obtenirBulle();
    const contenu = bulle.querySelector('.tooltip-contenu');

    contenu.textContent = texte;
    bulle.style.maxWidth = `${LARGEUR_MAX}px`;

    bulle.classList.add('tooltip-mesure');
    bulle.classList.remove('tooltip-visible');

    requestAnimationFrame(() => {
        positionnerBulle(cible, bulle);
        bulle.classList.remove('tooltip-mesure');
        bulle.classList.add('tooltip-visible');
    });

    bulleActive = bulle;
    cibleActive = cible;
}

/**
 * Masque le tooltip actif
 */
function masquer() {
    if (bulleActive) {
        bulleActive.classList.remove('tooltip-visible');
        bulleActive = null;
        cibleActive = null;
    }
}

// --- Délégation d'événements ---

document.addEventListener('mouseenter', function(e) {
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerDisparition);
    timerAffichage = setTimeout(() => afficher(cible), DELAI_AFFICHAGE);
}, true);

document.addEventListener('mouseleave', function(e) {
    const cible = e.target.closest('[data-tooltip]');
    if (!cible) return;

    clearTimeout(timerAffichage);
    timerDisparition = setTimeout(masquer, DELAI_DISPARITION);
}, true);

window.addEventListener('scroll', masquer, { passive: true });
window.addEventListener('resize', masquer);

// Export
window.tooltips = { afficher, masquer };

})();
```

---

## 4. Fichier tooltips.css

```css
/* =================================================================
   tooltips.css — Tooltips au survol — Monitorage Pédagogique
   ================================================================= */

.tooltip-bulle {
    position: absolute;
    z-index: 10000;
    padding: 10px 14px;
    border-radius: 6px;
    background: #1a1a2e;
    color: #e0e0e0;
    font-size: 0.85rem;
    line-height: 1.45;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-bulle.tooltip-visible {
    opacity: 1;
    transform: translateY(0);
}

.tooltip-bulle.tooltip-mesure {
    opacity: 0;
    visibility: hidden;
    display: block;
}

.tooltip-fleche {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #1a1a2e;
    transform: rotate(45deg);
}

.tooltip-bulle[data-position="bas"] .tooltip-fleche {
    top: -4px;
    left: 50%;
    margin-left: -4px;
}

.tooltip-bulle[data-position="haut"] .tooltip-fleche {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
}

.tooltip-bulle[data-position="droite"] .tooltip-fleche {
    left: -4px;
    top: 50%;
    margin-top: -4px;
}

.tooltip-bulle[data-position="gauche"] .tooltip-fleche {
    right: -4px;
    top: 50%;
    margin-top: -4px;
}

.tooltip-contenu {
    position: relative;
    z-index: 1;
}

[data-tooltip] {
    cursor: help;
}
```

---

## 5. Cartographie HTML — Éléments cibles

Le travail principal consiste à ajouter `data-tooltip="cle"` sur les éléments HTML existants.

### En-tête (sauf titre)

| Clé | Élément |
|-----|---------|
| `entete-logo` | Logo + nom codexnumeris.org |
| `entete-version` | Numéro de version et build |
| `entete-mode-affichage` | Sélecteur Normal/Anonymisation |
| `entete-signaler-bug` | Lien « Signaler un bug » |
| `entete-pratique` | Ligne de la pratique active |
| `entete-semaine` | Repère temporel (Semaine X) |
| `entete-groupe-cours` | Sélecteur du groupe-cours actif |
| `entete-nav-principale` | Barre d'onglets principaux |
| `entete-sous-nav` | Barre d'onglets secondaires |
| `entete-reglages` | Icône ⚙ Réglages |

### Réglages — Trimestre (panneaux)

| Clé | Élément |
|-----|---------|
| `reglages-gestion-trimestres` | En-tête du panneau Gestion des trimestres |
| `reglages-cours` | En-tête du panneau Cours |
| `reglages-enseignant` | En-tête du panneau Enseignant-e |
| `reglages-groupe-etudiants` | En-tête du panneau Groupe d'étudiants |
| `reglages-horaire` | En-tête du panneau Horaire |
| `reglages-groupe-cours` | En-tête du panneau Groupe-cours |

### Réglages — Trimestre (champs spécifiques)

| Clé | Élément |
|-----|---------|
| `reglages-trim-identification` | Titre zone Identification |
| `reglages-trim-bornes` | Titre zone Bornes |
| `reglages-trim-semaines-speciales` | Titre zone Semaines spéciales |
| `reglages-trim-conges` | Titre zone Congés fériés |
| `reglages-trim-imprevus` | Titre zone Événements imprévus |
| `reglages-cours-competence` | Labels Compétence |
| `reglages-cours-elements` | Label Éléments de compétence |
| `reglages-etudiants-sa` | En-tête colonne SA |
| `reglages-etudiants-import` | Titre zone Import |
| `reglages-horaire-periodes` | Labels Séances/Périodes |
| `reglages-gc-nom-genere` | Nom structuré généré |
| `reglages-gc-pratique` | Label Pratique de notation |
| `reglages-bibliotheque` | Boutons Bibliothèque |

### Réglages — Préférences

| Clé | Élément |
|-----|---------|
| `pref-sous-nav` | Sous-onglet Préférences |
| `pref-outils` | Titre section Outils à exploiter |
| `pref-outils-acp` | Checkbox Micro données ACP |
| `pref-outils-rai` | Checkbox Système RàI |
| `pref-affichage` | Titre section Affichage des ressources |
| `pref-affichage-solo` | Checkbox SOLO |
| `pref-affichage-snapshots` | Checkbox Snapshots |
| `pref-affichage-graphiques` | Checkbox Graphiques d'évolution |
| `pref-affichage-details` | Checkbox Détails techniques |
| `pref-affichage-assiduité` | Sélecteur Unité d'affichage |
| `pref-affichage-comparatif` | Checkbox Mode comparatif SOM/PAN |
| `pref-visuel` | Titre section Expérience visuelle |
| `pref-navigation` | Checkbox Ouvrir sur le tableau de bord |

### Réglages — Dépistage

| Clé | Élément |
|-----|---------|
| `depist-sous-nav` | Sous-onglet Dépistage |
| `depist-activer-patterns` | Checkbox Activer la détection |
| `depist-grille` | Sélecteur Grille de critères |
| `depist-decoupler-pr` | Checkbox Découpler P et R |
| `depist-fenetre` | Champ Fenêtre d'analyse |
| `depist-seuil-progression` | Curseur Progression des artefacts |
| `depist-seuil-direction` | Curseur Direction du risque |
| `depist-seuil-defi` | Curseur Seuil de défi spécifique |
| `depist-restaurer` | Bouton Restaurer (dépistage) |
| `depist-seuils-interpretation` | Titre section Seuils d'interprétation |
| `depist-seuils-visuels` | Checkbox Indicateurs visuels |
| `depist-seuil-fragile` | Carte Fragile (rouge) |
| `depist-seuil-acceptable` | Carte Acceptable (jaune) |
| `depist-seuil-bon` | Carte Bon (vert) |
| `depist-seuils-restaurer` | Bouton Restaurer (seuils) |

---

## 6. Instructions pour Claude Code

### Étape 1 — Créer les fichiers

Créer les trois fichiers (`tooltips.js`, `tooltips-contenu.js`, `tooltips.css`) dans les répertoires `js/` et `css/` du projet Monitorage_v6 à partir du code fourni aux sections 2, 3 et 4.

### Étape 2 — Charger les scripts

Dans `index.html`, ajouter avant `</body>` :

```html
<link rel="stylesheet" href="css/tooltips.css">
<script src="js/tooltips-contenu.js"></script>
<script src="js/tooltips.js"></script>
```

### Étape 3 — Identifier les sélecteurs réels

Ouvrir `index.html` et les modules JS qui génèrent l'interface. Identifier les sélecteurs réels pour chaque élément listé dans la section 5. Ajouter `data-tooltip="cle"` sur chaque élément cible.

**Règle** : placer l'attribut sur l'élément le plus spécifique possible (le titre du panneau, pas le panneau entier ; le label du champ, pas le conteneur).

### Étape 4 — Adapter les couleurs

Ajuster le CSS si nécessaire pour s'harmoniser avec le thème existant de l'application.

### Étape 5 — Tester

- [ ] Chaque tooltip apparaît au survol après ~400ms
- [ ] Le tooltip disparaît quand le curseur quitte l'élément
- [ ] Le positionnement est correct (pas de débordement)
- [ ] En-tête : 10 tooltips fonctionnels
- [ ] Réglages Trimestre : 6 panneaux + champs spécifiques
- [ ] Réglages Préférences : 13 tooltips fonctionnels
- [ ] Réglages Dépistage : 15 tooltips fonctionnels
- [ ] Le tooltip ne bloque pas les sélecteurs (dropdowns)
- [ ] Le curseur `help` s'affiche sur les éléments marqués
- [ ] Aucun conflit avec les styles ou scripts existants

---

## 7. Inventaire des clés

| Zone | Nombre de clés |
|------|---------------|
| En-tête | 10 |
| Réglages — Trimestre (panneaux) | 6 |
| Réglages — Trimestre (champs) | 13 |
| Réglages — Préférences | 13 |
| Réglages — Dépistage | 15 |
| **Total** | **57** |

---

## 8. Extensibilité

Pour documenter un nouveau module :
1. Ajouter les clés et textes dans `tooltips-contenu.js`.
2. Ajouter `data-tooltip="cle"` dans le HTML du module.
3. Aucune modification du moteur ou du CSS n'est requise.

Prochains modules dans l'ordre du workflow :
- Planification
- Présences
- Évaluations
- Construction de la note
- Tableau de bord
- Boîte à outils
- Aide
