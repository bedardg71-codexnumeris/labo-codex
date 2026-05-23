# Plan d'implémentation : refonte du chrome Labo Codex

**Date de rédaction** : 23 mai 2026
**Rédigé par** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Spec finalisée, à exécuter
**Version cible** : Beta à déterminer (probablement 99.63, 99.7 ou 100)

---

## 1. Contexte et objectif

Le chrome actuel de l'app (entête + nav primaire + sous-nav contextuelle) présente trois problèmes :

1. **Bugs visuels sur iPhone** : le titre et les boutons utilitaires se chevauchent, à cause de positionnements `position: absolute` non défaits dans les media queries mobile.
2. **Densité excessive sur tous formats** : le chrome occupe environ 230 pixels avant que le contenu utile commence, sans hiérarchie claire entre identité de l'app, contexte de travail et navigation.
3. **Découvrabilité dégradée sur tablette et mobile** : la nav primaire est sous-optimale en deçà de 1024px (wrap brutal, scroll horizontal non découvrable, perte de visibilité des sous-onglets).

Le chantier vise à **réorganiser le chrome en système cohérent** : explicite sur desktop (cas d'usage principal sur MacBook), condensé sur tablette et mobile (cas d'usage secondaires assumés moins découvrables).

### Décision de doctrine

Le chrome est désormais conçu **responsive par paliers fonctionnels** :
- À ≥1024px : tout est explicite, boutons visibles partout.
- À <1024px : nav primaire et sous-nav passent en dropdowns natifs, utilitaires regroupés dans un menu `⋯`.

### Hors-périmètre de ce chantier

- Migration globale des icônes du projet vers icons8 (chantier séparé, à planifier après).
- Modifications de `js/config.js` ou `js/navigation.js` (zones protégées – aucune autorisation accordée pour ce chantier).
- Modifications du menu Codex et de sa logique (le bouton et son menu sont déplacés mais leur contenu reste intact).
- Modifications du système de bandeaux conditionnels (`bandeau-archive`, `bandeau-demo`, `bandeau-mode`).

---

## 2. Spécification fonctionnelle finale

### 2.1 Desktop (≥1024px) – mode «explicite»

Structure verticale en quatre zones :

**Zone 1 – Identité (ligne 1 de l'entête)**

Disposition horizontale, gauche à droite :
- Bouton **Codex** (gauche) avec indicateur d'état coloré (point vert quand codex actif), label «Codex», ouvre son menu déroulant existant au clic.
- **Titre** «Labo Codex» (centre, en flux normal – ne plus utiliser `position: absolute`).
- **Métadonnées version + date** alignées en ligne avec ou sous le titre, format compact «Beta 99.62 (Build 0522-1115) · vendredi 22 mai 2026» en couleur secondaire discrète.
- **Cinq icônes utilitaires** à droite, regroupées en deux clusters séparés par une **ligne verticale** :
  - Cluster 1 (actions sur l'app) : Bug, Anonymisation, Thème
  - Séparateur visuel : `border-left: 1px solid rgba(255,255,255,0.18)` ou équivalent
  - Cluster 2 (sections alternatives) : Aide, Réglages

**Zone 2 – Contexte (bande sous l'entête)**

Bande pleine largeur sur fond légèrement contrasté (variation de la couleur d'accent existante du sélecteur de groupe-cours – `rgba(106, 172, 184, 0.10)` ou équivalent dans la palette `--variables`). Contient uniquement :
- Le **sélecteur de groupe-cours** centré, sans label «Groupe-cours actif :» (le contenu du dropdown «601-101-MQ gr.00002 — Grégoire B. (Lun-Jeu)» se suffit à lui-même).

**Zone 3 – Navigation primaire**

Sept boutons (un par section visible) :
- Accueil, Aperçu, Conception, Calendrier, Suivi, Évaluation, Labo
- Format inchangé : icône + label, glassmorphisme léger sur fond maritime
- Le bouton de la section active conserve son style `.actif`
- **Wrap accepté sur deux lignes** en largeur intermédiaire (1024-1200px)
- Hauteur de l'élément : préserver les cibles tactiles ≥44px

**Zone 4 – Sous-navigation contextuelle**

- Boutons des sous-sections (0 à 7 selon la section active, défini par `configurationsOnglets` dans `config.js`)
- **Masquage carré** quand la section n'a pas de sous-nav (Accueil, Aperçu) : la zone disparaît du flux et le contenu remonte. Le layout «danse» visiblement quand on change de section – c'est assumé.

### 2.2 Tablette et mobile (<1024px) – mode «condensé»

**Zone 1 – Identité (ligne 1 de l'entête)**

Disposition horizontale, gauche à droite :
- **Titre** «Labo Codex» (centre ou gauche, taille réduite à 1.3rem environ)
- **Métadonnées** «Beta 99.62 · 22 mai 2026» en sous-titre discret (sans build pour gagner de la place)
- Bouton **`⋯`** à droite qui ouvre un popover contenant six items dans cet ordre :
  1. Codex (avec son indicateur d'état) – ouvre le menu Codex
  2. Bug – signaler un bug
  3. Anonymisation – basculer mode normal/anonymisé
  4. Thème – basculer sombre/clair
  5. *(séparateur visuel)*
  6. Aide – navigue vers la section Aide
  7. Réglages – navigue vers la section Réglages

Le popover s'affiche sous le bouton `⋯`, fermeture sur clic hors zone, Escape ou tap sur un item.

**Zone 2 – Contexte**

- Sélecteur de groupe-cours en pleine largeur, ligne dédiée

**Zone 3 – Navigation primaire (dropdown)**

- Élément `<select>` natif (HTML standard) avec sept options (Accueil à Labo)
- Au tap, iOS ouvre un picker plein écran (confortable au pouce)
- Au `change`, déclencher `afficherSection(valeur)` (fonction existante de `navigation.js`)

**Zone 4 – Sous-navigation (dropdown)**

- Élément `<select>` natif généré dynamiquement à partir du contenu de `#sous-navigation` (qui est lui-même peuplé par `afficherSousNavigation()` de `navigation.js`)
- **Masqué dynamiquement** quand la section active n'a pas de sous-sections
- Au `change`, déclencher `afficherSousSection(valeur)` (fonction existante)

### 2.3 Comportements partagés

**Sticky au scroll**

- Desktop : seule la **nav primaire** (sept boutons) reste collée en haut au scroll. L'entête identité, le sélecteur de groupe-cours et la sous-nav scrollent avec le contenu.
- Mobile/tablette : les **deux dropdowns** (Section + Sous-section) restent collés en haut au scroll. L'entête identité et le sélecteur de groupe-cours scrollent.

Justification de l'asymétrie : sur petit écran, remonter pour changer de sous-section coûte plus cher, donc on garde l'accès permanent.

**Bulles parallaxe**

- Conservées telles quelles. Elles vivent dans `#bulles-container` à l'intérieur de `<header class="entete">`.
- Conséquence assumée : quand l'entête scrolle out, les bulles disparaissent. La nav sticky reste sobre, sans bulles.

**Modes sombre et clair**

- Tous les éléments doivent respecter les variables CSS existantes de `styles.css` et fonctionner dans les deux modes.
- L'entête garde son gradient maritime même en mode clair (selon `.mode-clair .entete` ligne 19634 existante).

**Bandeaux conditionnels**

- `bandeau-archive`, `bandeau-demo`, `bandeau-mode`, `bandeau-mise-a-jour` : positionnés entre l'entête et la nav primaire dans le HTML existant. Conservés à cette position dans le nouveau chrome. Ils scrollent avec le contenu (pas sticky).

---

## 3. Architecture technique

### 3.1 Fichiers à modifier

| Fichier | Zones | Type de modification |
|---|---|---|
| `index.html` | Lignes 3777-3886 (entête) | Restructuration complète du HTML |
| `index.html` | Lignes 3978-4003 (nav primaire) | Ajout d'un `<select>` pour mobile, conservation des boutons pour desktop |
| `index.html` | Ligne 4006 (sous-nav) | Inchangé (généré dynamiquement) |
| `index.html` | Lignes 3707-3713 (CSS inline `.navigation-principale`) | Déplacer dans `styles.css` |
| `index.html` | Ligne ~17166 (fallback `VERSION_MAJEURE` et `BUILD_ID`) | Mettre à jour avec nouveau build |
| `styles.css` | Lignes 844-1229 (entête + responsive) | Refonte complète |
| `styles.css` | Lignes 1364-1484 (nav primaire et sous-nav) | Ajustements + nouveaux styles |
| `styles.css` | Lignes 4715-4767 (media queries mobile) | Refonte complète des breakpoints |
| `styles.css` | Lignes 19634+ (mode clair) | Vérifier compatibilité |
| `js/main.js` | À identifier | Ajout logique popover, selects, sticky |
| `version.json` | Racine | Nouveau build |

### 3.2 Fichiers protégés à NE PAS modifier

- `js/config.js` (zone protégée selon CLAUDE.md)
- `js/navigation.js` (zone protégée selon CLAUDE.md)
- `noms_stables.json` (zone protégée)

### 3.3 API à préserver impérativement

Pour que `navigation.js` continue à fonctionner sans modification :

- **Classes CSS requises** : `.navigation-principale`, `.sous-navigation`, `.actif`, `.section`, `.sous-section`, `.sous-navigation.vide`
- **Attributs HTML requis** : `data-onglet="..."` sur chaque bouton de nav primaire, `data-sous-onglet="..."` sur chaque bouton de sous-nav
- **IDs requis** : `sous-navigation`, `section-{nomSection}` (un par section)
- **Sélecteurs utilisés par navigation.js** :
  - `document.querySelectorAll('.navigation-principale button')`
  - `document.querySelector(\`button[data-onglet="${nomSection}"]\`)`
  - `document.getElementById('sous-navigation')`
  - `document.querySelectorAll('.sous-navigation button')`

Conséquence : les boutons de la nav primaire desktop existent toujours dans le DOM en mode mobile, mais sont masqués visuellement avec `display: none`. Le `<select>` mobile pilote `afficherSection()` qui à son tour active la classe `.actif` sur les boutons cachés.

### 3.4 Fonctions globales à appeler

Pour piloter la navigation depuis les nouveaux selects, utiliser les fonctions globales définies dans `navigation.js` :
- `afficherSection(nomSection)` : change de section principale
- `afficherSousSection(idSousSection)` : change de sous-section
- `naviguerVers(section, sousSection)` : combinaison des deux (préférée pour la navigation programmatique)

Ces fonctions sont en zone protégée mais leurs noms sont stables (`noms_stables.json`), donc utilisables depuis `main.js` sans risque.

---

## 4. Plan d'implémentation étape par étape

### Étape 1 – Restructuration HTML de l'entête

**Cible** : `index.html` lignes 3777-3886

Remplacer le bloc `<header class="entete">...</header>` par une nouvelle structure :

```html
<header class="entete">
    <!-- Bulles flottantes — inchangées -->
    <div id="bulles-container" class="bulles-container"></div>

    <!-- LIGNE 1 — Identité de l'app -->
    <div class="entete-ligne1">
        <!-- Bouton Codex — conserver l'intégralité du bloc existant -->
        <div class="entete-codex">
            <div id="codex-controle" class="codex-controle">
                <!-- ... bouton Codex et son menu, intégralement préservé ... -->
            </div>
        </div>

        <!-- Titre et métadonnées -->
        <div class="titre-section">
            <h1>Labo Codex</h1>
            <p class="meta" data-tooltip="entete-version">
                <span class="meta-version">
                    <span id="version-entete"></span>
                    <span id="build-numero"></span>
                </span>
                <span class="meta-separateur">·</span>
                <span id="entete-date" class="meta-date"></span>
            </p>
        </div>

        <!-- Utilitaires desktop (5 icônes, séparées en 2 groupes) -->
        <div class="entete-utilitaires">
            <div class="utilitaires-groupe">
                <button data-action="ouvrirModalRapportBug" class="btn-action-header btn-icon-header"
                        data-tooltip="entete-signaler-bug" title="Signaler un bug">
                    <img src="icons/icon-bug.svg" alt="" class="header-icon">
                </button>
                <button id="btn-toggle-anonymisation-nav" class="btn-action-header btn-icon-header"
                        data-tooltip="entete-mode-affichage" title="Mode normal / anonymisé"
                        data-action="basculerModeAnonymisation">
                    <img src="icons/icons8-anonymous-mask.svg" alt="" class="header-icon">
                </button>
                <button id="btn-toggle-theme-nav" class="btn-action-header btn-icon-header"
                        title="Mode clair / sombre" data-action="basculerTheme">
                    <img src="icons/icon-black-and-white.svg" alt="" class="header-icon">
                </button>
            </div>
            <div class="utilitaires-separateur"></div>
            <div class="utilitaires-groupe">
                <button data-action="afficherSection" data-param="aide" class="btn-action-header btn-icon-header"
                        data-tooltip="nav-aide" title="Aide">
                    <img src="icons/icon-wordbook.svg" alt="" class="header-icon">
                </button>
                <button data-action="afficherSection" data-param="reglages" class="btn-action-header btn-icon-header"
                        data-tooltip="entete-reglages" title="Réglages">
                    <img src="icons/icon-tune.svg" alt="" class="header-icon">
                </button>
            </div>
        </div>

        <!-- Bouton "⋯" pour mobile (masqué desktop par CSS) -->
        <button id="btn-utilitaires-mobile" class="btn-utilitaires-mobile" data-action="ouvrirPopoverUtilitaires"
                aria-label="Plus d'options" aria-haspopup="menu" aria-expanded="false">
            <span aria-hidden="true">⋯</span>
        </button>
    </div>

    <!-- LIGNE 2 — Bande de contexte -->
    <div class="entete-ligne2 bandeau-contexte">
        <div id="bandeau-groupe-cours" class="bandeau-groupe-cours">
            <div class="bandeau-groupe-cours-contenu">
                <select id="selectGroupeCoursHeader" class="dropdown-groupe-cours-header"
                        data-on-change="changerGroupeCoursDepuisHeader"
                        data-tooltip="entete-groupe-cours"
                        aria-label="Groupe-cours actif">
                    <option value="">-- Aucun groupe-cours --</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Popover utilitaires mobile (caché par défaut, ouvert par le bouton "⋯") -->
    <div id="popover-utilitaires-mobile" class="popover-utilitaires u-hide" role="menu" aria-hidden="true">
        <button class="popover-item" data-action="Codex.toggleMenu" role="menuitem">
            <span id="popover-codex-indicateur" class="popover-codex-indicateur u-hide"></span>
            <span>Codex</span>
        </button>
        <button class="popover-item" data-action="ouvrirModalRapportBug" role="menuitem">
            <img src="icons/icon-bug.svg" alt="" class="popover-icon">
            <span>Signaler un bug</span>
        </button>
        <button class="popover-item" data-action="basculerModeAnonymisation" role="menuitem">
            <img src="icons/icons8-anonymous-mask.svg" alt="" class="popover-icon">
            <span>Anonymisation</span>
        </button>
        <button class="popover-item" data-action="basculerTheme" role="menuitem">
            <img src="icons/icon-black-and-white.svg" alt="" class="popover-icon">
            <span>Thème clair/sombre</span>
        </button>
        <div class="popover-separateur"></div>
        <button class="popover-item" data-action="afficherSection" data-param="aide" role="menuitem">
            <img src="icons/icon-wordbook.svg" alt="" class="popover-icon">
            <span>Aide</span>
        </button>
        <button class="popover-item" data-action="afficherSection" data-param="reglages" role="menuitem">
            <img src="icons/icon-tune.svg" alt="" class="popover-icon">
            <span>Réglages</span>
        </button>
    </div>
</header>
```

**Points de vigilance** :
- Conserver intégralement le HTML existant du bouton Codex et de son menu (lignes 3796-3855 actuelles). Ne pas casser ses `data-action`, ses `id`, ses classes.
- Préserver les `id` `version-entete`, `build-numero`, `entete-date` qui sont peuplés par du JS au chargement.
- Le bouton mobile `⋯` doit être hors du flux desktop : il sera positionné en absolu à droite via CSS ou en flex avec `display: none` en desktop.

### Étape 2 – Restructuration HTML de la nav primaire et ajout du select mobile

**Cible** : `index.html` lignes 3978-4006

Garder les sept boutons existants (avec leurs `data-onglet` intacts) ET ajouter un `<select>` qui sera visible uniquement sur mobile :

```html
<!-- NAVIGATION PRINCIPALE -->
<nav class="navigation-principale">
    <!-- Boutons desktop — inchangés -->
    <div class="navigation-boutons">
        <button data-onglet="accueil" data-tooltip="nav-accueil">
            <img src="icons/icon-home.svg" alt="" class="nav-icon">
            <span class="nav-label">Accueil</span>
        </button>
        <!-- ... 6 autres boutons identiques ... -->
    </div>

    <!-- Select mobile (caché desktop) -->
    <select id="select-nav-mobile" class="select-nav-mobile" aria-label="Section">
        <option value="accueil">Accueil</option>
        <option value="apercu">Aperçu</option>
        <option value="conception">Conception</option>
        <option value="calendrier">Calendrier</option>
        <option value="suivi">Suivi</option>
        <option value="evaluations">Évaluation</option>
        <option value="labo">Labo</option>
    </select>
</nav>

<!-- SOUS-NAVIGATION (générée dynamiquement) -->
<div id="sous-navigation" class="sous-navigation"></div>

<!-- Select mobile pour la sous-nav (caché par défaut, peuplé dynamiquement par main.js) -->
<select id="select-sous-nav-mobile" class="select-sous-nav-mobile u-hide" aria-label="Sous-section"></select>
```

**Points de vigilance** :
- Ne pas modifier les `data-onglet` des sept boutons existants.
- Le `<select>` mobile est *en plus* des boutons existants. Les deux coexistent dans le DOM, c'est le CSS qui montre l'un et masque l'autre selon le breakpoint.
- L'attribut `aria-label` sur les selects est essentiel pour l'accessibilité.

### Étape 3 – Refonte CSS

**Cible** : `styles.css` (toutes les sections concernant l'entête, la nav primaire, la sous-nav et les media queries)

Stratégie :
1. **Retirer** tous les `position: absolute` sur `.titre-section` et `.entete-ligne2-droite` (lignes 911-920 et 947-955 actuelles). Passer en flex pur.
2. **Refondre** `.entete-ligne1` en flex à trois zones : `.entete-codex` (gauche, `flex-shrink: 0`), `.titre-section` (centre, `flex: 1`), `.entete-utilitaires` (droite, `flex-shrink: 0`).
3. **Ajouter** `.entete-utilitaires` :
   ```css
   .entete-utilitaires {
       display: flex;
       align-items: center;
       gap: 6px;
       flex-shrink: 0;
   }
   .utilitaires-groupe {
       display: flex;
       gap: 5px;
   }
   .utilitaires-separateur {
       width: 1px;
       height: 20px;
       background: rgba(255, 255, 255, 0.18);
       margin: 0 4px;
   }
   ```
4. **Refondre** `.entete-ligne2` en une bande pleine largeur sans positionnement absolu :
   ```css
   .entete-ligne2 {
       background: rgba(106, 172, 184, 0.10);
       border-top: 1px solid rgba(106, 172, 184, 0.18);
       padding: 8px 18px;
       display: flex;
       justify-content: center;
   }
   ```
5. **Ajouter** les styles du bouton `⋯` mobile (caché desktop) :
   ```css
   .btn-utilitaires-mobile {
       display: none;
       width: 32px; height: 32px;
       /* etc */
   }
   ```
6. **Ajouter** les styles du popover :
   ```css
   .popover-utilitaires {
       position: absolute;
       top: 60px; right: 12px;
       z-index: 250;
       background: var(--surface-carte, #142a38);
       border: 1px solid rgba(255, 255, 255, 0.18);
       border-radius: var(--radius-grand);
       padding: 8px;
       display: flex;
       flex-direction: column;
       gap: 4px;
       box-shadow: var(--shadow-prononce);
       min-width: 200px;
   }
   .popover-item {
       display: flex;
       align-items: center;
       gap: 10px;
       padding: 8px 12px;
       background: transparent;
       border: none;
       color: white;
       cursor: pointer;
       border-radius: var(--radius-moyen);
       font-size: 0.9rem;
       width: 100%;
       text-align: left;
   }
   .popover-item:hover {
       background: rgba(255, 255, 255, 0.08);
   }
   .popover-separateur {
       height: 1px;
       background: rgba(255, 255, 255, 0.12);
       margin: 4px 0;
   }
   ```
7. **Ajouter** sticky sur la nav primaire :
   ```css
   .navigation-principale {
       position: sticky;
       top: 0;
       z-index: 100;
       background: rgba(10, 24, 32, 0.95); /* fond opaque pour ne pas révéler le contenu derrière */
       backdrop-filter: blur(10px);
   }
   ```
8. **Refondre les media queries** sur un breakpoint unique à 1024px :
   ```css
   @media (max-width: 1024px) {
       /* Cacher boutons utilitaires desktop, montrer "⋯" */
       .entete-utilitaires { display: none; }
       .btn-utilitaires-mobile { display: flex; }

       /* Cacher boutons nav desktop, montrer select */
       .navigation-boutons { display: none; }
       .select-nav-mobile { display: block; }

       /* Sous-nav : cacher les boutons, montrer le select */
       .sous-navigation { display: none; }
       .select-sous-nav-mobile:not(.u-hide) { display: block; }

       /* Réorganisation des dropdowns mobile */
       .entete-ligne2,
       .navigation-principale,
       .sous-nav-mobile-wrapper {
           padding: 6px 12px;
       }

       /* Sticky combiné nav primaire + sous-nav mobile */
       .navigation-principale,
       .select-sous-nav-mobile {
           position: sticky;
           top: 0;
       }
   }
   ```
9. **Masquer carré** la sous-nav vide sur desktop :
   ```css
   .sous-navigation.vide {
       display: none;
   }
   ```

**Points de vigilance** :
- Aucune nouvelle variable de couleur en dur : utiliser les `--variables` existantes de `styles.css`.
- Vérifier le contraste WCAG AA (4.5:1 texte, 3:1 graphiques) dans les deux modes.
- Cibles tactiles ≥44px (iPad).
- Le z-index de la nav sticky doit rester inférieur à celui des modales (~1000) et des bandeaux conditionnels (~150).

### Étape 4 – Logique JavaScript

**Cible** : `js/main.js` (fichier à identifier précisément lors de l'implémentation – probablement un module dédié à la navigation UI)

Fonctions à ajouter :

```javascript
// 1. Popover des utilitaires mobile
function ouvrirPopoverUtilitaires(event) {
    const popover = document.getElementById('popover-utilitaires-mobile');
    const bouton = document.getElementById('btn-utilitaires-mobile');
    if (!popover || !bouton) return;

    const estOuvert = !popover.classList.contains('u-hide');
    if (estOuvert) {
        fermerPopoverUtilitaires();
    } else {
        popover.classList.remove('u-hide');
        popover.setAttribute('aria-hidden', 'false');
        bouton.setAttribute('aria-expanded', 'true');
        // Focus sur le premier item pour accessibilité clavier
        const premier = popover.querySelector('.popover-item');
        if (premier) premier.focus();
        // Fermeture sur clic hors zone
        setTimeout(() => {
            document.addEventListener('click', fermerPopoverSiHorsZone, { once: true });
            document.addEventListener('keydown', fermerPopoverSurEscape);
        }, 0);
    }
}

function fermerPopoverUtilitaires() {
    const popover = document.getElementById('popover-utilitaires-mobile');
    const bouton = document.getElementById('btn-utilitaires-mobile');
    if (popover) {
        popover.classList.add('u-hide');
        popover.setAttribute('aria-hidden', 'true');
    }
    if (bouton) bouton.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', fermerPopoverSurEscape);
}

function fermerPopoverSiHorsZone(event) {
    const popover = document.getElementById('popover-utilitaires-mobile');
    const bouton = document.getElementById('btn-utilitaires-mobile');
    if (!popover.contains(event.target) && !bouton.contains(event.target)) {
        fermerPopoverUtilitaires();
    }
}

function fermerPopoverSurEscape(event) {
    if (event.key === 'Escape') {
        fermerPopoverUtilitaires();
        document.getElementById('btn-utilitaires-mobile').focus();
    }
}

// 2. Synchronisation du select nav primaire mobile avec la nav active
function synchroniserSelectNavMobile() {
    const select = document.getElementById('select-nav-mobile');
    if (select && typeof sectionActive !== 'undefined') {
        select.value = sectionActive;
    }
}

// 3. Régénération du select sous-nav mobile à partir de la sous-nav DOM
function regenererSelectSousNav() {
    const conteneur = document.getElementById('sous-navigation');
    const select = document.getElementById('select-sous-nav-mobile');
    if (!conteneur || !select) return;

    const boutons = conteneur.querySelectorAll('button');
    if (boutons.length === 0) {
        // Pas de sous-section : cacher le select
        select.classList.add('u-hide');
        select.innerHTML = '';
        return;
    }

    select.classList.remove('u-hide');
    select.innerHTML = '';
    boutons.forEach(btn => {
        const option = document.createElement('option');
        option.value = btn.getAttribute('data-sous-onglet');
        option.textContent = btn.textContent;
        if (btn.classList.contains('actif')) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// 4. Écouteurs au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Select nav primaire mobile → afficherSection
    const selectNav = document.getElementById('select-nav-mobile');
    if (selectNav) {
        selectNav.addEventListener('change', function() {
            if (typeof afficherSection === 'function') {
                afficherSection(this.value);
            }
        });
    }

    // Select sous-nav mobile → afficherSousSection
    const selectSousNav = document.getElementById('select-sous-nav-mobile');
    if (selectSousNav) {
        selectSousNav.addEventListener('change', function() {
            if (typeof afficherSousSection === 'function') {
                afficherSousSection(this.value);
            }
        });
    }

    // Re-synchroniser quand la section change (écouter l'événement custom existant)
    window.addEventListener('sectionAffichee', function() {
        synchroniserSelectNavMobile();
        regenererSelectSousNav();
    });

    // Initialisation
    synchroniserSelectNavMobile();
    regenererSelectSousNav();
});
```

**Points de vigilance** :
- **Aucun handler inline** (`onclick=`, `onchange=`). Utiliser `data-action` et le dispatcher existant de `main.js` (lignes 700-780 selon CLAUDE.md), ou des écouteurs `addEventListener`.
- `sectionAffichee` est un événement custom déjà existant émis par `afficherSousSection()` (vu lignes 610-612 de `navigation.js`). On s'appuie dessus sans modifier le fichier protégé.
- Pour le `data-on-change="changerGroupeCoursDepuisHeader"`, le dispatcher existant doit gérer le `change` event. Vérifier ce point.
- Aucun `console.log` de debug : utiliser `console.warn` / `console.error` si nécessaire (selon CLAUDE.md).

### Étape 5 – Migration des icônes du chrome vers icons8 filled

**Cible** : les ~13 icônes du chrome refactoré

Inventaire à remplacer :

| Fonction | Fichier actuel | Statut | Nouvelle icône icons8 attendue |
|---|---|---|---|
| Bug | `icon-bug.svg` | À remplacer | (Grégoire fournira) |
| Anonymisation | `icons8-anonymous-mask.svg` | Déjà icons8 | Probablement OK, à confirmer |
| Thème | `icon-black-and-white.svg` | À remplacer | (Grégoire fournira) |
| Aide | `icon-wordbook.svg` | À remplacer | (Grégoire fournira) |
| Réglages | `icon-tune.svg` | À remplacer | (Grégoire fournira) |
| Accueil | `icon-home.svg` | À remplacer | (Grégoire fournira) |
| Aperçu | `icon-combo-chart.svg` | À remplacer | (Grégoire fournira) |
| Conception | `icons8-mind-map.svg` | Déjà icons8 | Probablement OK |
| Calendrier | `icon-calendar.svg` | À remplacer | (Grégoire fournira) |
| Suivi | `icon-profile.svg` | À remplacer | (Grégoire fournira) |
| Évaluation | `icon-pulse.svg` | À remplacer | (Grégoire fournira) |
| Labo | `icon-juggler.svg` | À remplacer | (Grégoire fournira) |

**Procédure** :
1. Grégoire télécharge les nouvelles icônes icons8 (style filled, format SVG).
2. Les fichiers sont placés dans `icons/` avec des noms cohérents (préfixe `icons8-` pour le chantier de migration globale qui suivra).
3. Les références `src="icons/..."` dans `index.html` sont mises à jour.
4. Vérification : avec `filter: brightness(0) invert(1)` actuellement appliqué, les icônes filled doivent rester lisibles. Test sur fond foncé et fond clair.

**Note importante** : si le style filled crée des dissonances avec d'autres parties de l'app qui restent en outline, prévoir un chantier de migration globale séparé.

### Étape 6 – Tests fonctionnels

À effectuer dans cet ordre, en validant chaque palier avant de passer au suivant :

**Test 1 – Desktop sur MacBook**
- [ ] L'entête s'affiche correctement, titre centré, utilitaires à droite avec séparateur visible
- [ ] Le sélecteur de groupe-cours est centré dans sa bande
- [ ] La nav primaire affiche les 7 boutons (sur 1 ou 2 lignes selon largeur)
- [ ] La sous-nav apparaît pour Conception, Calendrier, Suivi, Évaluation, Labo
- [ ] La sous-nav est masquée pour Accueil et Aperçu
- [ ] Au scroll, l'entête et le sélecteur disparaissent, la nav primaire reste collée en haut
- [ ] Mode sombre + mode clair : pas de couleur cassée, contraste OK

**Test 2 – iPad portrait (820px)**
- [ ] Le breakpoint <1024px se déclenche, les selects apparaissent à la place des boutons
- [ ] Le bouton `⋯` est visible et fonctionnel
- [ ] Tap sur `⋯` ouvre le popover avec les 6 items
- [ ] Tap hors du popover le ferme
- [ ] Tap sur un item du popover déclenche l'action et ferme le popover
- [ ] Tap sur le select de nav ouvre le picker iOS plein écran
- [ ] Changement de section via le select met à jour la section affichée
- [ ] La sous-nav (select) s'adapte selon la section
- [ ] Au scroll, les deux selects restent collés en haut

**Test 3 – iPad paysage**
- [ ] Largeur ≈ 1180px : on est au-dessus de 1024px, donc mode desktop activé
- [ ] Vérifier que la nav primaire ne wrappe pas excessivement
- [ ] Vérifier que les cibles tactiles restent ≥44px

**Test 4 – iPhone simulé (Safari DevTools 390x844)**
- [ ] Identique à iPad portrait mais en plus étroit
- [ ] Aucun chevauchement, aucune coupure
- [ ] Le titre tient sur sa ligne ou wrappe proprement
- [ ] Le popover ne déborde pas de l'écran

**Test 5 – Modes spéciaux**
- [ ] Mode anonymisation activé : bandeau-mode visible, fonctionnement préservé
- [ ] Mode démo activé : bandeau-demo visible
- [ ] Trimestre archivé : bandeau-archive visible
- [ ] Tous ces bandeaux apparaissent entre l'entête et la nav primaire, ne cassent pas le sticky

**Test 6 – Accessibilité**
- [ ] Tab navigation fonctionnelle : Codex → Titre → Utilitaires → Sélecteur → Nav primaire → Sous-nav → Contenu
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Lecteur d'écran (VoiceOver Mac) : labels corrects sur tous les boutons et selects
- [ ] Espace + Entrée : activation des boutons
- [ ] Escape : fermeture du popover
- [ ] Le focus retourne au bouton `⋯` après fermeture du popover

**Test 7 – Bouton Codex**
- [ ] Sur desktop : bouton à gauche, ouverture du menu déroulant intacte
- [ ] Sur mobile : Codex dans le popover, tap ouvre le menu Codex (qui peut s'ouvrir par-dessus le popover ou le remplacer – à décider à l'implémentation)
- [ ] Indicateur d'état (point vert) visible dans les deux contextes

### Étape 7 – Finalisation

**Avant commit** :
1. Demander à Grégoire le numéro de beta exact (selon procédure CLAUDE.md).
2. Mettre à jour `version.json` à la racine :
   ```json
   { "build": "MMJJ-HHMM", "beta": "XX.X" }
   ```
3. Mettre à jour les fallback dans `index.html` ligne ~17166 :
   ```javascript
   let VERSION_MAJEURE = 'XX.X';
   let BUILD_ID = 'MMJJ-HHMM';
   ```
4. Audit de code mort : grep les références à `.titre-section { position: absolute }` ou `.entete-ligne2-droite { position: absolute }` pour s'assurer qu'aucun résidu ne traîne.
5. Mettre à jour le changelog (`js/changelog-data.js`) avec une entrée concise pour cette beta, par exemple :
   ```javascript
   {
     version: 'Beta XX',
     couleur: 'bleu',
     titre: 'Chrome unifié',
     items: [
       'Entête repensée : identité, contexte et navigation en zones distinctes',
       'Navigation simplifiée sur iPad et iPhone (dropdowns natifs)',
       'Nav primaire collée en haut au scroll',
       'Correction des chevauchements visuels sur iPhone',
       'Nouvelles icônes plus uniformes pour les utilitaires et la navigation'
     ]
   }
   ```
6. Tests Vitest/Playwright si des fonctions touchent à la sécurité (a priori non pour ce chantier, mais vérifier).

**Commit et push** : suivre la procédure CLAUDE.md, validation fonctionnelle complète avant push.

---

## 5. Points de vigilance et risques

### 5.1 Régressions à anticiper

**Risque 1 – Bouton Codex et son menu**
- Le menu Codex (ouverture/fermeture, sauvegarde, fusion, comparaison, etc.) est une logique complexe.
- Mitigation : préserver intégralement le HTML et le JS du bouton et de son menu. Ne changer que la position du conteneur `.codex-controle` dans le flux.

**Risque 2 – Sticky et z-index**
- Les modales (`modal-overlay` z-index ~1000) doivent rester au-dessus de la nav sticky.
- Les bandeaux conditionnels (z-index ~150) doivent rester visibles.
- La nav sticky doit être au-dessus du contenu (~50-100) mais en-dessous des bandeaux.
- Mitigation : tester explicitement les superpositions dans tous les modes.

**Risque 3 – Bandeaux conditionnels (archive, démo, anonymisation)**
- Ils sont positionnés entre `<header>` et `<nav>` dans le HTML actuel.
- Si la nav est sticky, ces bandeaux scrollent avec le contenu, mais la nav reste collée. Comportement attendu : bandeaux disparaissent au scroll, nav reste. À confirmer comme acceptable.

**Risque 4 – Régénération de la sous-nav et select mobile**
- `afficherSousNavigation()` régénère le HTML de `#sous-navigation` à chaque changement de section. Le select mobile doit se régénérer en synchronisation.
- Mitigation : écouter l'événement `sectionAffichee` déjà émis par `navigation.js` (ligne 610-612).

**Risque 5 – Mode anonymisation et bouton de bascule**
- Le bouton `btn-toggle-anonymisation-nav` a un `id` utilisé par le JS pour synchroniser son état. Ne pas changer l'id.
- Vérifier que le bouton dans le popover mobile (qui n'a pas cet id) déclenche bien la même action sans causer de désynchronisation.

### 5.2 Sécurité (rappels CLAUDE.md)

- Tout `innerHTML` avec données utilisateur doit passer par `echapperHtml()`.
- Pour ce chantier, aucune donnée utilisateur n'est injectée dans le chrome (sauf les libellés de groupe-cours et de sections, qui sont déjà gérés par le code existant).
- Pas de `onclick=` inline : `data-action` + dispatcher.
- Tests sécurité automatisés : ce chantier ne touche pas aux modules sensibles (`js/securite-*.js`, `js/import-export.js`, `js/cc-license.js`, CSP). Donc pas de nouveau test Vitest/Playwright requis a priori. Mais si la CSP est touchée d'une façon ou d'une autre, ajouter un test.

### 5.3 Accessibilité (rappels CLAUDE.md)

- WCAG 2.1 AA minimum : contraste 4.5:1 texte, 3:1 graphiques.
- Cibles tactiles ≥44×44px sur iPad.
- Focus visible partout.
- `<select>` natifs = accessibilité gratuite (VoiceOver, navigation clavier, picker iOS).
- Le popover utilise les attributs ARIA appropriés : `role="menu"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-hidden`, `role="menuitem"`.
- Le focus management : focus piégé dans le popover quand ouvert ? Ou simple focus initial + fermeture Escape ? L'option simple est suffisante pour ce cas.

### 5.4 Design system (rappels CLAUDE.md)

- Aucune nouvelle couleur en dur : utiliser les `--variables` CSS de `styles.css`.
- Aucun nouveau `--variable` sans raison documentée.
- Vérifier conformité mode sombre + mode clair.
- Cohérence avec `design-system.html` (source de vérité).

---

## 6. Notes pour Claude Code

### 6.1 Procédure de développement (CLAUDE.md)

1. Lire les fichiers concernés AVANT de modifier.
2. Implémenter UN fichier à la fois, dans l'ordre des étapes du plan.
3. Valider fonctionnellement après chaque fichier.
4. Debug avant de passer à l'étape suivante.
5. Anticiper les erreurs utilisateur sur Mac et iPad séparément.

### 6.2 Skills à charger pour ce chantier

- `SKILL_labo_codex.md` (architecture générale)
- `SKILL_Securite_donnees.md` si toucher à du code touchant aux données (a priori non ici)
- `SKILL_hygiene_donnees_partagees.md` si manipulant des données partagées (non applicable ici)
- Lecture obligatoire : `docs/00-START-HERE.md` + `BACKLOG.md` + `SESSION.md` + `design-system.html`

### 6.3 Zones protégées – NE PAS modifier

- `js/config.js` (autorisation refusée pour ce chantier)
- `js/navigation.js` (autorisation refusée pour ce chantier)
- `noms_stables.json`

### 6.4 Tests automatisés

Selon CLAUDE.md, avant un commit qui touche un module sensible, exécuter `cd tests && npm test`. Ce chantier ne touche pas a priori aux modules sensibles. Mais si la CSP est modifiée (ajout d'une nouvelle source par exemple), ajouter un test.

### 6.5 Itérativité du chantier

Ce chantier est important et touche au chrome de l'app. Procéder par sous-étapes :
1. D'abord le HTML + CSS de base (Étapes 1-3) pour avoir le rendu desktop correct.
2. Puis le JS pour les selects mobile et le popover (Étape 4).
3. Puis les icônes (Étape 5).
4. Puis les tests exhaustifs (Étape 6).
5. Finalisation (Étape 7).

Chaque sous-étape doit être validée par Grégoire avant de passer à la suivante.

### 6.6 Questions à poser à Grégoire pendant l'implémentation

Si des ambiguïtés surgissent, demander plutôt que supposer. Quelques questions probables :
- Le bouton Codex sur mobile : si l'utilisateur tape Codex dans le popover, le popover se ferme et le menu Codex s'ouvre ? Ou le menu Codex s'ouvre par-dessus le popover ?
- Le numéro de beta exact (selon procédure CLAUDE.md).
- Les nouveaux noms de fichiers icônes icons8 quand téléchargés.

---

## 7. Annexes

### A. Référence des décisions prises pendant la discussion

| Décision | Choix retenu | Tension/alternative |
|---|---|---|
| Piste d'organisation entête | Piste B (identité + contexte) | Piste A (1 ligne), Piste C (barre fine + opérationnelle) |
| Label «Groupe-cours actif :» | Retiré | Garder, garder discret |
| Version + date | Compactés sous le titre | Garder pleinement, masquer en tooltip |
| Codex sur iPhone | Dans le popover `⋯` | À gauche du titre |
| Sous-nav mobile | Dropdown/select | Identique desktop, masquée derrière un bouton |
| Sticky au scroll | Nav primaire seule (desktop), nav + sous-nav (mobile) | Rien, ou tout |
| Option nav iPhone | Dropdown (sélect natif) | Tabs scrollables, bottom bar, hamburger, wrap |
| Comportement iPad | Identique à iPhone (<1024px) | Identique desktop, breakpoint intermédiaire |
| Nombre de boutons nav primaire desktop | 7 | 9 (Aide+Réglages inclus) |
| Aide + Réglages | Restent dans les icônes utilitaires, regroupés à part avec séparateur | Dans la nav primaire desktop |
| Sous-nav vide | Masquée carré | Message discret, layout stable |
| Wrap nav primaire desktop | 2 lignes acceptées en largeur intermédiaire | Tabs scrollables, basculer en dropdown |
| Périmètre icônes icons8 | Tout le projet (chantier séparé) ; chantier entête migre les ~13 du chrome | Chrome seulement |
| Style icons8 | Filled (rempli) | Outline, color, mixte |
| Format icônes | SVG | PNG, mixte |

### B. Calcul des hauteurs de chrome

| État | Hauteur approximative | Note |
|---|---|---|
| Actuel desktop | ~230px | Entête 130 + nav 60 + sous-nav 40 |
| Nouveau desktop initial | ~165-180px | Entête 80 + contexte 35 + nav 60 + sous-nav 0-40 |
| Nouveau desktop au scroll | ~60px | Nav primaire sticky seule |
| Actuel iPhone | ~250px | Avec wrap mal géré et chevauchements |
| Nouveau iPhone initial | ~110-130px | Entête 50 + contexte 35 + selects 25-50 |
| Nouveau iPhone au scroll | ~50-75px | Selects nav + sous-nav sticky |

Gain net : environ 50-70px sur desktop, 120-140px sur iPhone.

### C. Mockups visuels

Les mockups visuels détaillés ont été produits pendant la discussion Cowork. Si Claude Code en a besoin, demander à Grégoire de les régénérer ou décrire visuellement chaque état (desktop initial, desktop scrollé, mobile fermé, mobile drawer ouvert, mobile popover ouvert).

---

**Fin du plan**

*Ce document est destiné à être lu par Claude Code avant de commencer l'implémentation. Toute ambiguïté ou contradiction interne doit être signalée à Grégoire avant d'écrire du code.*
