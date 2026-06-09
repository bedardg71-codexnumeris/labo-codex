# Plan : guide pédagogique RàI dans Labo Codex

**Date** : 23 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Spec finalisée
**Version cible** : Beta à déterminer

---

## 1. Vision et contexte

La Réponse à l'Intervention (RàI) est déjà conceptuellement intégrée à Labo Codex : la préférence `activerRai` (défaut `true`) conditionne déjà l'affichage de plusieurs zones du profil étudiant, du tableau de bord et du module Interventions. Ce qui manque, c'est un **guide pédagogique pour l'enseignant utilisateur** qui explique la RàI telle qu'implémentée dans Labo Codex.

Ce chantier suit le même patron que le guide SOLO (voir `PLAN_taxonomie_SOLO.md` chantier 2) : un panneau de quelques pages navigable, référence académique en première page, accessible depuis des endroits stratégiques quand la préférence est activée.

### Architecture cible

- *Préférence existante* : `activerRai` (déjà en place, aucune modification requise)
- *Guide* : 4 pages dans un nouveau module `js/guide-rai.js`
- *Points d'accès* : bouton dans l'Accompagnement + bouton dans le module Interventions
- *Conditionnement* : tout est masqué quand `activerRai === false`

### Hors-périmètre

- Pas de modification de la logique de la RàI (IPB, diagnostic croisé, patterns, etc.)
- Pas de nouveaux badges (ceux existants sont réutilisés dans le guide)
- Pas de modification de la grille de dépistage
- Aucune modification de `js/config.js`, `js/navigation.js`, `noms_stables.json`

---

## 2. Contenu des 4 pages

### Page 1 — Qu'est-ce que la RàI ?

```html
<p>La <strong>Réponse à l'Intervention (RàI)</strong> est un modèle d'organisation pédagogique qui combine dépistage continu, interventions ajustées et données pour soutenir l'apprentissage de tous les élèves.</p>

<p>Dans Labo Codex, la RàI est <strong>une inspiration, pas un cadre normatif</strong>. Le modèle original (Fuchs, Fuchs & Malone, 2017 ; Desrochers 2021) a été développé pour le primaire et le secondaire, dans des contextes où des équipes d'intervenants travaillent ensemble. L'app adapte ce modèle au cégep, où l'enseignant est souvent seul intervenant et où les compétences visées sont d'un autre ordre (analyse, argumentation, transfert, plutôt que décodage ou fluence).</p>

<p>Quatre principes directeurs guident l'implémentation :</p>
<ul>
    <li><strong>Le dépistage est un portrait</strong>, pas un diagnostic. Il sert à mieux intervenir, non à catégoriser.</li>
    <li><strong>L'intensification est un continuum</strong> ajustable, pas une suite de cases.</li>
    <li><strong>Les données servent les décisions</strong>, pas l'inverse.</li>
    <li><strong>L'individualisation se fonde sur les données</strong> – le cycle <em>enseigner, évaluer, ajuster, réévaluer</em>.</li>
</ul>

<p>L'app fournit les données et les éclairages. Tu prends les décisions. Labo Codex ne prescrit jamais une intervention — il éclaire ton jugement professionnel.</p>

<p class="guide-rai-ref">
Desrochers, A. (dir.) (2021). <em>L'approche de la réponse à l'intervention et l'enseignement de la lecture-écriture</em>. Presses de l'Université du Québec. ISBN 978-2-7605-5404-7.
</p>
```

### Page 2 — Dépistage et patterns d'apprentissage

```html
<p>Le dépistage de Labo Codex se construit automatiquement à partir des productions étudiantes que tu évalues. À chaque artefact, l'app calcule des indices et détecte des patterns.</p>

<h4>Quatre fonctions du dépistage</h4>
<ul>
    <li><strong>Suivre les progrès</strong> de chaque élève dans le temps.</li>
    <li><strong>Repérer les élèves à risque</strong> qui ne réalisent pas les apprentissages attendus.</li>
    <li><strong>Guider le choix de l'intervention</strong> : quel palier, quels critères cibler.</li>
    <li><strong>Évaluer l'efficacité de ton enseignement</strong>. Si plus de 20 % des élèves sont en difficulté, c'est ton palier universel qu'il faut renforcer, pas l'élève qui est en cause.</li>
</ul>

<h4>Quatre patterns observables</h4>
<p>L'app classe automatiquement chaque élève dans l'un des patterns suivants à partir de ses productions récentes :</p>

<ul class="guide-rai-patterns-liste">
    <li><span class="badge-pattern-stable"></span> <strong>Progression stable</strong> — pas de défi identifié, performance suffisante.</li>
    <li><span class="badge-pattern-defi-specifique"></span> <strong>Défi spécifique</strong> — performance générale ≥ 75 %, mais un défi récurrent identifié sur un ou plusieurs critères.</li>
    <li><span class="badge-pattern-difficulte-emergente"></span> <strong>Difficulté émergente</strong> — performance entre 64 et 75 % avec présence d'un défi. Zone de surveillance.</li>
    <li><span class="badge-pattern-difficulte-persistante"></span> <strong>Difficulté persistante</strong> — performance inférieure à 64 % sur les artefacts récents. Zone d'intervention prioritaire.</li>
</ul>

<div class="guide-rai-astuce">L'app surveille particulièrement les critères de <strong>niveau SOLO Multistructurel</strong> — ce sont les fondamentaux. Si les fondamentaux ne sont pas acquis, les compétences supérieures (Relationnel, Abstrait étendu) ne peuvent pas se développer.</div>
```

### Page 3 — Les trois niveaux d'intervention

```html
<p>La RàI propose un <strong>continuum d'intensification</strong> de l'intervention pédagogique, organisé en trois paliers. Ces paliers ne sont pas des catégories où l'on enferme un élève — c'est un curseur que tu ajustes selon sa réponse.</p>

<h4>Palier 1 — Universel</h4>
<p>L'enseignement régulier offert à tous les élèves. C'est le palier le plus large et le plus important. Quand il fonctionne bien, 80 % ou plus des élèves progressent correctement sans intervention supplémentaire.</p>

<h4>Palier 2 — Préventif</h4>
<p>Intervention ciblée pour les élèves qui montrent des signes de difficulté émergente. Travail en sous-groupe sur des composantes précises (par exemple un critère récurrent en défi). Durée limitée, objectif clair, mesure de la réponse.</p>

<h4>Palier 3 — Intensif</h4>
<p>Intervention individualisée pour les élèves dont la difficulté persiste malgré le palier 2. Plus de temps, plus de fréquence, plus de personnalisation. C'est rare et coûteux en ressources — à utiliser pour les cas où c'est nécessaire.</p>

<div class="guide-rai-astuce"><strong>Principe contre-intuitif</strong> : si plus de 20 % de tes élèves sont en difficulté, c'est ton <em>palier 1</em> qu'il faut renforcer en premier, pas multiplier les interventions de palier 2 ou 3. Quand l'enseignement universel échoue à grande échelle, intensifier individuellement masque le vrai problème.</div>

<p>Dans Labo Codex, l'app suggère un niveau d'intervention basé sur le diagnostic croisé (IPB × direction), mais c'est <strong>toi qui décides</strong>. L'app éclaire, tu juges.</p>
```

### Page 4 — La RàI en pratique dans Labo Codex

```html
<p>Voici comment utiliser concrètement la RàI dans l'app :</p>

<h4>1. Configure ta grille de dépistage</h4>
<p>Va dans <strong>Conception → Grilles de critères</strong>. Ta grille contient les critères que tu utilises pour évaluer les productions. Chaque critère porte un attribut <strong>niveau SOLO</strong> (Multistructurel, Relationnel, ou Abstrait étendu). Le dépistage surveille particulièrement les critères Multistructurels.</p>

<h4>2. Évalue les productions normalement</h4>
<p>À chaque artefact évalué (production étudiante annotée et notée), l'app met à jour automatiquement les indices et patterns pour chaque élève. Aucune saisie supplémentaire requise.</p>

<h4>3. Consulte les patterns dans le profil étudiant</h4>
<p>Va dans <strong>Suivi → Profils individuels</strong>. Le profil affiche le pattern actuel de l'élève avec son badge, les critères en défi classés par niveau SOLO, et la trajectoire récente.</p>

<h4>4. Documente tes interventions</h4>
<p>Le module <strong>Suivi → Interventions</strong> te permet de planifier une intervention, de documenter ce que tu as fait, et de revenir mesurer la réponse de l'élève à travers les artefacts suivants. C'est le cycle <em>teach-test-revise-test</em> de Fuchs.</p>

<h4>5. Suis les sous-groupes</h4>
<p>Quand plusieurs élèves partagent un défi commun, l'app peut suggérer des sous-groupes pour des interventions ciblées de palier 2. Le formulaire d'intervention propose les critères en défi communs — tu n'as qu'à valider ou ajuster.</p>

<div class="guide-rai-astuce">La RàI n'est pas un système qui te dit quoi faire. C'est un système qui t'aide à voir ce qui se passe pour mieux décider. Si l'app te suggère un palier 3 pour un élève mais que ton jugement professionnel te dit autre chose, fais confiance à ton jugement — et utilise les données pour expliquer ta décision à toi-même et aux autres intervenants.</div>
```

---

## 3. Architecture technique

### 3.1 Nouveau fichier `js/guide-rai.js`

Reproduire la structure de `js/guide-solo.js` (à créer dans le chantier précédent) ou directement le pattern de `js/planification-carte.js` lignes 185-380. Contenu :

```javascript
var GUIDE_RAI_PAGES = [
    { titre: 'Qu\'est-ce que la RàI ?',                    contenu: '<p>...' /* page 1 */ },
    { titre: 'Dépistage et patterns d\'apprentissage',     contenu: '<p>...' /* page 2 */ },
    { titre: 'Les trois niveaux d\'intervention',          contenu: '<p>...' /* page 3 */ },
    { titre: 'La RàI en pratique dans Labo Codex',         contenu: '<p>...' /* page 4 */ }
];

var _guideRaiPageCourante = 0;
var _guideRaiOuvert = false;

function ouvrirGuideRai() { /* ... */ }
function rendrePageGuideRai(guide) { /* ... */ }
function fermerGuideRai() { /* ... */ }
```

### 3.2 Structure HTML dans `index.html`

Ajouter un panneau dédié similaire à celui du guide SOLO :

```html
<div id="guide-rai-panel" style="display: none;">
    <div class="guide-rai-panel-contenu">
        <!-- contenu généré dynamiquement -->
    </div>
</div>
```

### 3.3 Styles CSS dans `styles.css`

Dupliquer le pattern des classes `guide-solo-*` en remplaçant le préfixe par `guide-rai-`. Pour les badges des patterns sur la page 2, utiliser les classes CSS déjà existantes du projet (`badge-pattern-stable`, `badge-pattern-defi-specifique`, `badge-pattern-difficulte-emergente`, `badge-pattern-difficulte-persistante`). Vérifier qu'elles fonctionnent visuellement à l'échelle utilisée dans le guide.

Si les badges existants ne sont pas auto-suffisants visuellement (sans contexte parent), ajouter dans `styles.css` :

```css
.guide-rai-patterns-liste {
    list-style: none;
    padding-left: 0;
    margin: 12px 0;
}
.guide-rai-patterns-liste li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}
.guide-rai-patterns-liste li:last-child { border-bottom: none; }
.guide-rai-patterns-liste [class^="badge-pattern-"] {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    /* Styles supplémentaires si nécessaire pour rendre visible le badge isolé */
}
```

À ajuster en fonction du rendu réel des badges dans le projet.

---

## 4. Points d'accès au guide

### 4.1 Depuis l'Accompagnement

Localisation à identifier dans l'arborescence Réglages > Accompagnement. Ajouter un bouton « Guide RàI » à côté ou en dessous de la checkbox « Activer le système RàI ». Visible uniquement quand `obtenirPreference('activerRai') !== false`.

```html
<button data-action="ouvrirGuideRai" class="btn-secondaire" data-tooltip="guide-rai">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide RàI
</button>
```

### 4.2 Depuis le module Interventions

Localisation dans `Suivi > Interventions`. Identifier où placer un bouton « Guide RàI » – probablement en haut du module, à côté du titre ou d'un éventuel bouton d'aide existant.

Mêmes attributs HTML que ci-dessus. Le bouton doit lui aussi être conditionné à `obtenirPreference('activerRai') !== false` (cohérence d'expérience : si la RàI est désactivée globalement, le module Interventions est probablement caché ou marqué non disponible).

### 4.3 Comportement à la fermeture

Le guide se ferme à : clic sur la croix, clic en dehors du panneau, ou touche Escape. Cohérent avec le guide Alignement existant.

---

## 5. Tests fonctionnels

### Test 1 — Activation/désactivation
- Cocher la checkbox « Activer le système RàI » dans les réglages. Vérifier : le bouton « Guide RàI » apparaît dans l'Accompagnement et dans le module Interventions.
- Décocher. Vérifier que les deux boutons disparaissent.

### Test 2 — Navigation du guide
- Ouvrir le guide depuis l'Accompagnement. Vérifier les 4 pages, la navigation (boutons précédent/suivant, dots), la fermeture.
- Ouvrir le guide depuis le module Interventions. Vérifier que c'est le même guide, sur la même page 1.
- Vérifier que les patterns sur la page 2 affichent bien les badges visuellement.

### Test 3 — Référence académique
- Vérifier que la référence Desrochers (2021) apparaît en bas de la page 1, avec ISBN.

### Test 4 — Modes spéciaux
- Mode anonymisation : guide accessible et lisible.
- Trimestre archivé : guide accessible.
- Mode démo : guide accessible.

### Test 5 — Mode clair et mode sombre
- Vérifier la lisibilité du guide dans les deux modes.
- Vérifier que les badges des patterns gardent leur lisibilité dans les deux modes.

### Test 6 — Accessibilité clavier
- Tab pour atteindre les boutons précédent/suivant et les dots de navigation.
- Flèches gauche/droite pour naviguer entre pages.
- Escape pour fermer.

---

## 6. Points de vigilance

### 6.1 Cohérence avec le guide SOLO

Si le chantier SOLO (PLAN_taxonomie_SOLO.md) est exécuté en premier, le guide RàI bénéficie d'un patron déjà éprouvé dans le projet. Réutiliser la même structure CSS (avec préfixe différent), le même comportement de navigation, les mêmes raccourcis clavier.

### 6.2 Pas de chevauchement RàI / SOLO

Le guide RàI fait référence à SOLO (« critères Multistructurels », « niveau SOLO »), mais sans répéter l'explication détaillée de SOLO. Si l'utilisateur veut comprendre SOLO en profondeur, il consulte le guide SOLO. Garder cette frontière nette pour éviter la redondance.

### 6.3 Quotes Desrochers

Le skill `SKILL_RaI.md` cite plusieurs passages directs de Desrochers (2021) avec pages. Pour le guide utilisateur, j'ai paraphrasé ces idées plutôt que de citer mot à mot, pour éviter les questions de droits d'auteur sur un livre récent encore protégé. Si tu veux des citations directes, ajoute-les explicitement en mentionnant la page.

### 6.4 Sécurité

Ce chantier crée du HTML statique généré par JavaScript (aucune donnée utilisateur injectée). Pas de `innerHTML` avec contenu dynamique – donc pas de besoin de `echapperHtml()`. Pas de modification du système de préférences, juste lecture d'une préférence existante.

### 6.5 Tests automatisés

Aucun module sensible touché (sécurité, import/export, CSP). Pas de nouveau test Vitest/Playwright requis.

---

## 7. Finalisation

### Numéro de beta
À demander à Grégoire avant le commit.

### Mise à jour du changelog (`js/changelog-data.js`)

```javascript
{
    version: 'Beta XX',
    couleur: 'vert',
    titre: 'Guide RàI intégré',
    items: [
        'Nouveau guide pédagogique RàI en 4 pages, référence Desrochers (2021)',
        'Accessible depuis l\'Accompagnement et le module Interventions',
        'Visible uniquement quand le système RàI est activé dans les réglages'
    ]
}
```

### Mise à jour de version
- `version.json` à la racine
- Fallback dans `index.html` ligne ~17166

---

**Fin du plan**

*Ce plan est indépendant de `PLAN_taxonomie_SOLO.md` et peut être exécuté avant, après ou en parallèle. Si les deux chantiers sont faits ensemble, factoriser les styles CSS communs entre `guide-solo-*` et `guide-rai-*` (couleurs, navigation, mise en page de base).*
