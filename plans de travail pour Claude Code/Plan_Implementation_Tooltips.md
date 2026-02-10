# Plan d'implémentation — Tooltips (En-tête + Réglages)

**Destinataire** : Claude Code (accès direct au dépôt Monitorage_v6)
**Mécanisme** : Survol (hover) — tooltips légers
**Contraintes** : Vanilla JS ES6+, zéro dépendance, client-side uniquement
**Scope** : En-tête (sauf titre de l'application) + Onglet Réglages (sous-onglet Trimestre)

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
    // RÉGLAGES — Champs spécifiques (Gestion des trimestres)
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
        'Bibliothèque d\'entités réutilisables. Sélectionne une entité existante ou crée-en une nouvelle. Permet de réutiliser des configurations d\'un trimestre à l\'autre.'
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
    let position = 'bas'; // position de la bulle par rapport à la cible

    // Essayer en bas
    top = rect.bottom + MARGE;
    left = rect.left + (rect.width / 2) - (bulleRect.width / 2);

    if (top + bulleRect.height > vh) {
        // Pas assez de place en bas → essayer en haut
        top = rect.top - bulleRect.height - MARGE;
        position = 'haut';
    }

    if (top < 0) {
        // Pas assez de place en haut non plus → à droite
        top = rect.top + (rect.height / 2) - (bulleRect.height / 2);
        left = rect.right + MARGE;
        position = 'droite';

        if (left + bulleRect.width > vw) {
            // Pas de place à droite → à gauche
            left = rect.left - bulleRect.width - MARGE;
            position = 'gauche';
        }
    }

    // Contraindre horizontalement dans le viewport
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

    // Rendre visible pour calculer les dimensions (mais pas encore animé)
    bulle.classList.add('tooltip-mesure');
    bulle.classList.remove('tooltip-visible');

    // Positionner puis animer
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

// Masquer si scroll ou redimensionnement
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

/* Flèche — positionnée dynamiquement via data-position */
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

/* Éléments avec tooltip : curseur d'aide */
[data-tooltip] {
    cursor: help;
}
```

---

## 5. Intégration HTML

### Chargement des scripts

Ajouter dans `index.html`, **avant** la fermeture de `</body>` :

```html
<!-- Tooltips -->
<link rel="stylesheet" href="css/tooltips.css">
<script src="js/tooltips-contenu.js"></script>
<script src="js/tooltips.js"></script>
```

### Marquage des éléments cibles

Le travail principal consiste à ajouter `data-tooltip="cle"` sur les éléments HTML existants. Voici la cartographie complète :

#### En-tête (sauf titre de l'application)

| Clé | Sélecteur CSS probable | Élément |
|-----|------------------------|---------|
| `entete-logo` | `.header-logo` ou `a[href*="codexnumeris"]` | Logo + nom codexnumeris.org |
| `entete-version` | Élément contenant « Béta XX.X » | Numéro de version et build |
| `entete-mode-affichage` | `select` ou `.dropdown` contenant « Normal » | Sélecteur Normal/Anonymisation |
| `entete-signaler-bug` | `a` ou `button` contenant « Signaler un bug » | Lien de signalement |
| `entete-pratique` | Élément contenant « PAN-SDT-Litt » | Ligne de la pratique active |
| `entete-semaine` | Élément contenant « Semaine X » | Repère temporel |
| `entete-groupe-cours` | `select` ou `.dropdown` du groupe-cours | Sélecteur du groupe-cours actif |
| `entete-nav-principale` | Conteneur `<nav>` ou `.tabs` principal | Barre d'onglets principaux |
| `entete-sous-nav` | Conteneur de la sous-navigation | Barre d'onglets secondaires |
| `entete-reglages` | Bouton/lien de l'icône engrenage | Icône ⚙ Réglages |

#### Réglages — Sous-navigation et panneaux

| Clé | Sélecteur CSS probable | Élément |
|-----|------------------------|---------|
| `reglages-sous-nav` | Conteneur des onglets Trimestre/Préférences/Données/À propos | Sous-navigation Réglages |
| `reglages-gestion-trimestres` | Titre/bandeau du panneau « Gestion des trimestres » | En-tête du panneau dépliable |
| `reglages-cours` | Titre/bandeau du panneau « Cours » | En-tête du panneau dépliable |
| `reglages-enseignant` | Titre/bandeau du panneau « Enseignant-e » | En-tête du panneau dépliable |
| `reglages-groupe-etudiants` | Titre/bandeau du panneau « Groupe d'étudiants » | En-tête du panneau dépliable |
| `reglages-horaire` | Titre/bandeau du panneau « Horaire » | En-tête du panneau dépliable |
| `reglages-groupe-cours` | Titre/bandeau du panneau « Groupe-cours » | En-tête du panneau dépliable |

#### Réglages — Champs spécifiques

| Clé | Sélecteur CSS probable | Élément |
|-----|------------------------|---------|
| `reglages-trim-identification` | Zone « Identification du trimestre » | Titre de la zone |
| `reglages-trim-bornes` | Zone « Bornes du trimestre » | Titre de la zone |
| `reglages-trim-semaines-speciales` | Zone « Semaines spéciales » | Titre de la zone |
| `reglages-trim-conges` | Zone « Congés fériés et activités institutionnelles » | Titre de la zone |
| `reglages-trim-imprevus` | Zone « Événements imprévus » | Titre de la zone |
| `reglages-cours-competence` | Champs « N° de la compétence » et « Compétence » | Labels des champs |
| `reglages-cours-elements` | Champ « Éléments de compétence » | Label du champ |
| `reglages-etudiants-sa` | Colonne ou champ « SA » | En-tête de colonne SA |
| `reglages-etudiants-import` | Zone « Importer des étudiants » | Titre de la zone |
| `reglages-horaire-periodes` | Champs « Séances par semaine » et « Périodes par séance » | Labels des champs |
| `reglages-gc-nom-genere` | Zone affichant le nom généré (bandeau bleu) | Nom structuré du groupe-cours |
| `reglages-gc-pratique` | Champ « Pratique de notation » | Label du champ |
| `reglages-bibliotheque` | Boutons « Bibliothèque » dans les barres latérales | Bouton Bibliothèque |

---

## 6. Instructions pour Claude Code

### Étape 1 — Créer les fichiers

Créer les trois fichiers (`tooltips.js`, `tooltips-contenu.js`, `tooltips.css`) dans les répertoires `js/` et `css/` du projet Monitorage_v6 à partir du code fourni aux sections 2, 3 et 4.

### Étape 2 — Charger les scripts

Dans `index.html`, ajouter les balises `<link>` et `<script>` selon la section 5.

### Étape 3 — Identifier les sélecteurs réels

La colonne « Sélecteur CSS probable » de la section 5 est indicative. Claude Code doit :
1. Ouvrir `index.html` et les fichiers de template/modules pertinents.
2. Identifier les sélecteurs réels pour chaque élément listé.
3. Ajouter `data-tooltip="cle"` sur chaque élément cible.

**Règle** : placer l'attribut sur l'élément le plus spécifique possible (le titre du panneau, pas le panneau entier ; le label du champ, pas le conteneur du formulaire).

### Étape 4 — Adapter les couleurs

Le CSS proposé utilise `background: #1a1a2e` (fond sombre). Si le thème de l'application est différent, ajuster :
- `background` de `.tooltip-bulle` et `.tooltip-fleche`
- `color` de `.tooltip-bulle`
- `box-shadow` pour la cohérence visuelle

### Étape 5 — Tester

Vérifier que :
- [ ] Chaque tooltip apparaît au survol après un léger délai (~400ms).
- [ ] Le tooltip disparaît quand le curseur quitte l'élément.
- [ ] Le positionnement est correct (pas de débordement hors viewport).
- [ ] L'en-tête fonctionne (10 tooltips).
- [ ] Les panneaux Réglages fonctionnent (6 tooltips de panneaux + champs spécifiques).
- [ ] Le tooltip ne bloque pas l'interaction avec les sélecteurs (dropdowns).
- [ ] Le curseur `help` s'affiche sur les éléments marqués.
- [ ] Aucun conflit avec les styles ou scripts existants.

---

## 7. Extensibilité

Ce système est conçu pour être étendu à tous les modules de l'application. Pour documenter un nouveau module :

1. Ajouter les clés et textes dans `tooltips-contenu.js`.
2. Ajouter `data-tooltip="cle"` dans le HTML du module.
3. Aucune modification du moteur (`tooltips.js`) ou du CSS n'est requise.

Les prochains modules à documenter dans l'ordre du workflow :
- Planification
- Présences
- Évaluations
- Construction de la note
- Tableau de bord
- Boîte à outils
- Aide
