# Plan d'architecture des guides pédagogiques de Labo Codex

**Date** : 23 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Plan d'architecture maître + nouveaux contenus
**Version cible** : Beta à déterminer

---

## 1. Vision

Labo Codex implémente plusieurs cadres pédagogiques. Au lieu de coder un module séparé pour chaque guide, on factorise tout en un **module unifié** qui sert d'infrastructure commune. Tous les guides actuels et futurs utilisent la même mécanique : structure de données identique, navigation cohérente, panneau HTML réutilisable, styles partagés.

### Inventaire des guides

| Guide | Catégorie | Référence académique | Statut |
|---|---|---|---|
| Alignement pédagogique | Planification | Anderson (2026) | **Déjà implémenté** dans `planification-carte.js` (à migrer ou laisser) |
| SOLO | Observation | Biggs & Collis (1982) | Contenu spec dans `PLAN_taxonomie_SOLO.md` |
| RàI | Observation | Desrochers (2021) | Contenu spec dans `PLAN_guide_RaI.md` |
| ACP | Observation | — (interne) | Contenu spec dans `PLAN_uniformisation_Accompagnement.md` |
| **Enseignement explicite** | Planification | Gauthier, Bissonnette, Richard (2013) | **Nouveau, contenu spécifié ici (§4)** |
| **PAN** | Évaluation | — (interne, à confirmer) | **Nouveau, contenu spécifié ici (§5)** |

### Décisions architecturales prises

- *Architecture* : module unique `js/guides-pedagogiques.js` qui contient tous les guides en structure de données + mécanique de rendu commune
- *Cadres exclus du chantier* : ELLAC, SRPNF, RLO restent personnels/expérimentaux et n'auront pas de guide
- *Préférence par défaut pour l'Enseignement explicite* : une préférence globale dans Réglages définit le défaut pour les nouvelles leçons, la checkbox actuelle dans le Plan de la leçon reste comme override local

### Hors-périmètre

- Pas de refactoring du guide Alignement existant (il fonctionne, on le laisse en place ou on le migre dans une étape ultérieure)
- Pas de généralisation de SRPNF (signalée mais pas traitée ici – voir §7)
- Pas de modification des zones protégées (`config.js`, `navigation.js`, `noms_stables.json`)

---

## 2. Architecture du module unifié

### 2.1 Structure de données

Dans `js/guides-pedagogiques.js`, définir un seul objet qui contient tous les guides :

```javascript
var GUIDES_PEDAGOGIQUES = {
    'solo': {
        titre: 'Guide SOLO',
        cssPrefix: 'guide-solo',
        pages: [
            { titre: 'Qu\'est-ce que SOLO ?',                     contenu: '<p>...</p>' /* page 1 */ },
            { titre: 'Préstructurel et Unistructurel',            contenu: '<p>...</p>' /* page 2 */ },
            { titre: 'Multistructurel',                           contenu: '<p>...</p>' /* page 3 */ },
            { titre: 'Relationnel et Abstrait étendu',            contenu: '<p>...</p>' /* page 4 */ },
            { titre: 'SOLO en pratique',                          contenu: '<p>...</p>' /* page 5 */ }
        ]
    },
    'rai': {
        titre: 'Guide RàI',
        cssPrefix: 'guide-rai',
        pages: [ /* 4 pages — contenu défini dans PLAN_guide_RaI.md */ ]
    },
    'acp': {
        titre: 'Guide ACP',
        cssPrefix: 'guide-acp',
        pages: [ /* 3 pages — contenu défini dans PLAN_uniformisation_Accompagnement.md §5 */ ]
    },
    'enseignement-explicite': {
        titre: 'Guide Enseignement explicite',
        cssPrefix: 'guide-ee',
        pages: [ /* 4 pages — contenu défini en §4 du présent plan */ ]
    },
    'pan': {
        titre: 'Guide Pratique Alternative de Notation',
        cssPrefix: 'guide-pan',
        pages: [ /* 4 pages — contenu défini en §5 du présent plan */ ]
    }
};
```

Le contenu HTML des pages SOLO, RàI, ACP est défini dans leurs plans respectifs. Claude Code copie ces contenus dans la structure unifiée lors de l'exécution.

### 2.2 Mécanique commune

Une seule famille de fonctions, génériques sur l'identifiant du guide :

```javascript
var _guidePageCourante = 0;
var _guideActuel = null;

function ouvrirGuidePedagogique(idGuide) {
    var guide = GUIDES_PEDAGOGIQUES[idGuide];
    if (!guide) {
        console.error('[guides-pedagogiques] Guide inconnu : ' + idGuide);
        return;
    }
    _guideActuel = idGuide;
    _guidePageCourante = 0;
    afficherPanneauGuide(guide);
    rendrePageGuide();
}

function rendrePageGuide() {
    var guide = GUIDES_PEDAGOGIQUES[_guideActuel];
    var page = guide.pages[_guidePageCourante];
    // Met à jour le titre, le corps, les boutons précédent/suivant, les dots
}

function fermerGuidePedagogique() { /* ... */ }
function pagePrecedente() { /* ... */ }
function pageSuivante() { /* ... */ }
```

### 2.3 Panneau HTML générique

Un seul `<div>` dans `index.html` sert pour tous les guides :

```html
<div id="guide-pedagogique-panel" style="display: none;">
    <div class="guide-pedagogique-panel-contenu">
        <button class="guide-pedagogique-fermer" data-action="fermerGuidePedagogique" aria-label="Fermer">×</button>
        <h3 class="guide-pedagogique-titre"></h3>
        <div class="guide-pedagogique-corps"></div>
        <div class="guide-pedagogique-nav">
            <button class="guide-pedagogique-prec" data-action="pagePrecedente" aria-label="Précédent">←</button>
            <div class="guide-pedagogique-dots"></div>
            <button class="guide-pedagogique-suiv" data-action="pageSuivante" aria-label="Suivant">→</button>
        </div>
        <div class="guide-pedagogique-page-num"></div>
    </div>
</div>
```

Le panneau peut hériter d'une classe CSS supplémentaire correspondant au `cssPrefix` du guide en cours, pour permettre des couleurs d'accent différentes par cadre si désiré (par exemple, l'orange pour SOLO/Compréhension, le bleu pour RàI, etc.). Optionnel.

### 2.4 Styles CSS unifiés

Une seule famille de classes `guide-pedagogique-*` dans `styles.css`. Plus de duplication entre `guide-solo-*`, `guide-rai-*`, etc.

```css
#guide-pedagogique-panel {
    position: fixed;
    z-index: 250;
    right: 24px;
    top: 80px;
    width: 420px;
    max-height: 80vh;
    overflow-y: auto;
    background: var(--surface-carte, #142a38);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    box-shadow: var(--shadow-prononce);
    color: var(--texte-principal);
    padding: 18px 22px;
}
.guide-pedagogique-titre {
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--bleu-meta);
}
.guide-pedagogique-corps {
    font-size: 0.9rem;
    line-height: 1.6;
}
.guide-pedagogique-corps p { margin: 0 0 12px; }
.guide-pedagogique-corps ul, .guide-pedagogique-corps ol { margin: 0 0 12px; padding-left: 20px; }
.guide-pedagogique-corps h4 {
    margin: 16px 0 6px;
    font-size: 0.95rem;
    font-weight: 600;
}
.guide-pedagogique-ref {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
    font-size: 0.78rem;
    color: var(--gris-moyen);
    font-style: italic;
}
.guide-pedagogique-astuce {
    background: rgba(106, 172, 184, 0.08);
    border-left: 3px solid var(--accent-couleur, #6aacb8);
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 0.85rem;
}
.guide-pedagogique-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.10);
}
.guide-pedagogique-dots {
    display: flex;
    gap: 6px;
    flex: 1;
    justify-content: center;
}
.guide-pedagogique-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    border: none;
    cursor: pointer;
    padding: 0;
}
.guide-pedagogique-dot.actif {
    background: var(--bleu-meta);
}
.guide-pedagogique-page-num {
    text-align: center;
    font-size: 0.75rem;
    color: var(--gris-moyen);
    margin-top: 6px;
}
```

### 2.5 Avantages de cette architecture

- *Un seul fichier JS à maintenir* pour tous les guides
- *Un seul ensemble de styles CSS*
- *Cohérence garantie* dans le comportement et l'apparence
- *Ajout d'un nouveau guide* = ajouter une entrée dans `GUIDES_PEDAGOGIQUES`, rien d'autre
- *Tests* : on teste la mécanique une fois, elle marche pour tous les guides

---

## 3. Migration des plans existants

### 3.1 Pour SOLO (`PLAN_taxonomie_SOLO.md`)

Garder le contenu pédagogique des 5 pages (intact). Au moment de l'exécution :
- Le contenu des 5 pages est copié dans `GUIDES_PEDAGOGIQUES.solo.pages` du module unifié
- La fonction `ouvrirGuideSOLO()` mentionnée dans le plan SOLO devient `ouvrirGuidePedagogique('solo')`
- Les boutons d'accès (Accompagnement + palette de tampons) utilisent `data-action="ouvrirGuidePedagogique" data-param="solo"`

Le reste du plan SOLO (tampons, échelle de performance, etc.) reste inchangé.

### 3.2 Pour RàI (`PLAN_guide_RaI.md`)

Idem : contenu des 4 pages copié dans `GUIDES_PEDAGOGIQUES.rai.pages`. Boutons utilisent `data-param="rai"`.

### 3.3 Pour ACP (intégré dans `PLAN_uniformisation_Accompagnement.md` §5)

Idem : contenu des 3 pages copié dans `GUIDES_PEDAGOGIQUES.acp.pages`. Bouton utilise `data-param="acp"`.

### 3.4 Pour Alignement pédagogique (existant)

Deux options :
- *Option A — Laisser tel quel* : le guide Alignement reste dans `planification-carte.js` avec sa propre mécanique. Plus de duplication mais zéro risque de régression.
- *Option B — Migrer dans le module unifié* : copier `GUIDE_PAGES` de `planification-carte.js` dans `GUIDES_PEDAGOGIQUES.alignement.pages`, retirer les fonctions `ouvrirGuide()` / `rendrePageGuide()` / `fermerGuide()` de `planification-carte.js`, repointer les boutons d'accès.

Recommandation : *Option A* pour ce chantier, *Option B* dans un chantier ultérieur de cleanup quand le module unifié sera éprouvé.

---

## 4. Nouveau guide : Enseignement explicite (4 pages)

### 4.1 Préférence par défaut + override local

Nouvelle préférence dans `js/preferences.js` (ou équivalent) :

```javascript
enseignementExpliciteDefaut: true,  // défaut : nouvelles leçons en mode enseignement explicite
```

Dans la page Réglages > Préférences (ou un onglet pertinent), ajouter une option utilisant le patron uniforme `.option-accompagnement` :

```html
<div class="option-accompagnement" data-option="ee-defaut">
    <div class="option-accompagnement-tete">
        <label class="option-accompagnement-checkbox">
            <input type="checkbox" id="v2-pref-ee-defaut" checked data-on-change="sauvegarderPreferencesV2">
            <span class="option-accompagnement-titre">Enseignement explicite par défaut</span>
        </label>
        <button class="option-accompagnement-guide-btn"
                data-action="ouvrirGuidePedagogique" data-param="enseignement-explicite"
                title="Guide Enseignement explicite">
            <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
        </button>
    </div>
    <p class="option-accompagnement-description">
        Quand cette option est activée, chaque nouvelle leçon adopte la structure en 5 étapes
        de l'enseignement explicite (Ouverture, Modelage, Pratique guidée, Pratique autonome, Clôture).
        Tu peux toujours basculer une leçon individuelle vers ou hors de l'enseignement explicite
        depuis le Plan de la leçon.
    </p>
</div>
```

Quand l'utilisateur crée une nouvelle leçon, la valeur de `enseignementExplicite` de la leçon est initialisée à partir de cette préférence. La checkbox actuelle dans le Plan de la leçon reste : c'est l'override local.

### 4.2 Mise à jour de la checkbox dans le Plan de la leçon

La checkbox actuelle « Ens. explicite » est trop abrégée. La remplacer par :

```html
<div class="ee-toggle-zone">
    <label class="ee-toggle-label">
        <input type="checkbox" id="org-ee-checkbox" data-on-change="basculerEnseignementExplicite">
        <span>Enseignement explicite</span>
    </label>
    <button class="ee-guide-btn"
            data-action="ouvrirGuidePedagogique" data-param="enseignement-explicite"
            title="Guide Enseignement explicite">
        <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
    </button>
</div>
```

Position : à côté du sélecteur de leçon, comme aujourd'hui. Le bouton Guide doit être visible quel que soit l'état de la checkbox (l'utilisateur peut vouloir consulter le guide pour décider d'activer ou non).

### 4.3 Contenu des 4 pages

#### Page 1 — Qu'est-ce que l'enseignement explicite ?

```html
<p>L'<strong>enseignement explicite</strong> est une approche pédagogique structurée qui rend chaque étape de l'apprentissage visible pour l'élève. Plutôt que de laisser l'élève deviner ou construire seul, l'enseignant <em>montre, modèle, accompagne, vérifie</em>.</p>

<p>Trois principes fondateurs :</p>
<ul>
    <li><strong>Rendre les processus cognitifs visibles</strong> — l'enseignant pense à voix haute, montre ses choix.</li>
    <li><strong>Soutenir progressivement l'autonomie</strong> — du modelage à la pratique autonome, le soutien diminue par étapes.</li>
    <li><strong>Vérifier la compréhension fréquemment</strong> — pas seulement à la fin, mais à chaque étape.</li>
</ul>

<p>Dans Labo Codex, l'activation de l'enseignement explicite restructure ta leçon en <strong>cinq étapes</strong> (voir page suivante). L'option peut être appliquée par défaut à toutes les nouvelles leçons (préférence dans les Réglages) ou activée/désactivée leçon par leçon dans le Plan de la leçon.</p>

<p class="guide-pedagogique-ref">
Gauthier, C., Bissonnette, S., &amp; Richard, M. (avec la collaboration de Castonguay, M.) (2013). <em>Enseignement explicite et réussite des élèves : la gestion des apprentissages</em>. ERPI, Collection Éducation, 344 p.
</p>
```

#### Page 2 — Les cinq étapes structurantes

```html
<p>Quand l'enseignement explicite est activé pour une leçon, son contenu se réorganise en cinq étapes :</p>

<h4>1. Ouverture</h4>
<p>Établir le contexte. Rappeler les apprentissages antérieurs. Annoncer l'objectif de la leçon, les prérequis. Dans Labo Codex, l'Objectif et les Prérequis migrent automatiquement dans cette section quand l'option est activée.</p>

<h4>2. Modelage</h4>
<p>L'enseignant montre comment faire. Il verbalise ses choix, explicite son raisonnement. L'élève observe – il ne fait pas encore. C'est la phase où le « comment penser » devient visible.</p>

<h4>3. Pratique guidée</h4>
<p>L'élève commence à faire, mais avec un soutien soutenu : l'enseignant accompagne, corrige, fait des allers-retours fréquents. C'est la phase de transition la plus délicate – c'est ici que les malentendus se forment ou se résolvent.</p>

<h4>4. Pratique autonome</h4>
<p>L'élève fait seul, sur des tâches calibrées pour son niveau actuel. L'enseignant supervise, mais intervient le moins possible. C'est ici que se consolide ce qui a été enseigné.</p>

<h4>5. Clôture</h4>
<p>Synthèse, retour sur l'objectif, vérification finale, lien avec la leçon suivante. Dans Labo Codex, un rappel automatique des compétences travaillées s'ajoute dans cette section.</p>
```

#### Page 3 — Quand l'utiliser (et quand ne pas l'utiliser)

```html
<p>L'enseignement explicite est particulièrement <strong>indiqué</strong> pour :</p>
<ul>
    <li>L'enseignement de procédures, méthodes, stratégies (par exemple : structurer un paragraphe, résoudre un type de problème)</li>
    <li>Les concepts complexes qui nécessitent une décomposition fine</li>
    <li>Les élèves qui débutent dans un domaine (peu de connaissances préalables)</li>
    <li>Les situations où une compréhension précise est essentielle avant le transfert</li>
</ul>

<p>Il est <strong>moins indiqué</strong> ou demande adaptation pour :</p>
<ul>
    <li>L'exploration créative, la résolution de problèmes ouverts</li>
    <li>Les apprentissages qui dépendent fortement de la discussion entre pairs</li>
    <li>Les élèves très avancés qui ont déjà l'autonomie cognitive nécessaire</li>
    <li>Les apprentissages de longue durée et émergents (apprendre à interpréter un texte littéraire, par exemple)</li>
</ul>

<div class="guide-pedagogique-astuce">L'enseignement explicite n'est pas <em>la</em> méthode universelle, mais c'est <em>une</em> méthode robuste, particulièrement quand on veut éviter que des élèves se construisent des malentendus que l'on devra défaire plus tard. Tu peux l'activer pour certaines leçons et le désactiver pour d'autres selon ce que tu enseignes.</div>
```

#### Page 4 — Enseignement explicite en pratique dans Labo Codex

```html
<p>Voici comment utiliser concrètement cette structure dans l'app :</p>

<h4>Activer l'enseignement explicite pour une leçon</h4>
<p>Va dans <strong>Conception → Plan de la leçon</strong>, sélectionne la leçon, et coche la case <em>Enseignement explicite</em>. Le contenu se réorganise automatiquement en 5 étapes.</p>

<h4>Définir l'option par défaut</h4>
<p>Dans <strong>Réglages → Préférences</strong>, l'option « Enseignement explicite par défaut » détermine si les nouvelles leçons que tu crées sont en mode enseignement explicite ou pas. Tu peux toujours basculer leçon par leçon ensuite.</p>

<h4>Combiner avec d'autres cadres</h4>
<p>L'enseignement explicite est compatible avec SOLO, RàI et l'alignement pédagogique. Concrètement :</p>
<ul>
    <li>Les <strong>niveaux SOLO</strong> servent à calibrer la difficulté de chaque étape (le Modelage cible Unistructurel, la Pratique autonome peut viser Relationnel).</li>
    <li>Le <strong>dépistage RàI</strong> aide à repérer les élèves pour qui la Pratique guidée doit s'étendre.</li>
    <li>L'<strong>alignement pédagogique</strong> garantit que chaque étape de l'enseignement explicite est connectée à une compétence et à une évaluation.</li>
</ul>

<h4>Documenter le cycle</h4>
<p>Si tu adoptes le cycle <em>teach-test-revise-test</em> du modèle RàI, les étapes 3 et 4 (Pratique guidée et autonome) sont les moments où tu observes la réponse de l'élève. Les artefacts produits durant ces étapes alimentent le dépistage automatique.</p>

<div class="guide-pedagogique-astuce">L'enseignement explicite t'oblige à clarifier ta démarche pédagogique avant de l'enseigner. Cet effort de structuration en amont est lui-même formateur : il aide à voir ce qui dans ta pratique habituelle reste implicite et pourrait gagner à être rendu visible.</div>
```

---

## 5. Nouveau guide : Pratique Alternative de Notation (PAN) (4 pages)

### 5.1 Référence académique

Référence retenue (fournie par Grégoire) :

**Talbert, R.** (Grand Valley State University). *Grading for Growth: Toward More Humane, Authentic, and Trustworthy Ways to Evaluate Student Work*.

Note pour Claude Code : Robert Talbert co-publie en 2023 un livre intitulé *Grading for Growth: A Guide to Alternative Grading Practices* avec David Clark (Stylus Publishing). Si la référence ci-dessus correspond à ce livre, compléter la citation en conséquence. Sinon, conserver la formulation telle que fournie par Grégoire. Le blog *Grading for Growth* de Talbert (Substack) est aussi une source associée.

Cette référence apparaît en bas de la page 1 du guide PAN :

```html
<p class="guide-pedagogique-ref">
Talbert, R. <em>Grading for Growth: Toward More Humane, Authentic, and Trustworthy Ways to Evaluate Student Work</em>. Grand Valley State University.
</p>
```

### 5.2 Contenu des 4 pages

#### Page 1 — Qu'est-ce que la Pratique Alternative de Notation ?

```html
<p>La <strong>Pratique Alternative de Notation (PAN)</strong> est une approche d'évaluation qui s'interroge sur ce que la note finale d'un trimestre devrait représenter : la <em>moyenne du parcours</em> de l'élève, ou son <em>niveau de maîtrise atteint à la fin</em> ?</p>

<p>La pratique sommative traditionnelle additionne et moyenne toutes les notes obtenues depuis le début du trimestre. Une note faible obtenue au début pèse autant qu'une note solide obtenue à la fin, même si l'élève a appris entre les deux. Cette logique pénalise l'apprentissage initial – ce qui est paradoxal, puisque c'est précisément le moment où l'erreur est attendue et formative.</p>

<p>Le PAN propose une alternative : <strong>sélectionner les meilleures preuves de compétence</strong> plutôt que d'additionner toutes les tentatives. La note finale devient une <em>certification du niveau atteint</em>, pas une <em>moyenne du parcours</em>.</p>

<p>Dans Labo Codex, plusieurs variantes de PAN sont disponibles :</p>
<ul>
    <li><strong>PAN-Maîtrise</strong> : sélection des N meilleurs artefacts (la note représente la maîtrise démontrée)</li>
    <li><strong>PAN-Portfolio</strong> : structure mixte avec un portfolio de meilleurs artefacts (par exemple 65 %) et des artefacts terminaux obligatoires (35 %)</li>
    <li><strong>Sommative classique</strong> : moyenne traditionnelle, offerte pour les contextes où c'est la pratique officielle</li>
</ul>

<p>Le PAN s'accompagne en général d'un <strong>système de jetons</strong> qui permet la reprise d'artefacts, soutenant le droit à l'erreur et l'engagement de maîtrise.</p>
```

#### Page 2 — Validité certificative et inertie négative

```html
<h4>L'inertie négative de la moyenne traditionnelle</h4>
<p>Imagine une élève qui obtient 40 % au premier travail (premier essai sur une compétence nouvelle), puis progresse régulièrement pour finir le trimestre à 85 % de maîtrise. Quelle note représente le mieux ce qu'elle <em>sait faire</em> à la fin ?</p>
<p>La moyenne pondérée des tentatives donne une note tirée vers le bas par les premiers essais. La sélection des meilleures preuves donne une note proche de ce qu'elle maîtrise effectivement.</p>

<h4>Validité certificative</h4>
<p>Une note doit <em>certifier un niveau de compétence</em>. Si à la fin du trimestre l'élève fonctionne au niveau de la compétence visée, la certification doit le refléter, indépendamment du parcours pour y arriver.</p>

<h4>Implications pédagogiques</h4>
<p>Le PAN change la nature des évaluations initiales : elles deviennent formatives par défaut – des occasions d'apprendre sans le coût d'une note qui restera dans la moyenne. Les évaluations terminales restent certificatives.</p>

<div class="guide-pedagogique-astuce">Cette logique s'aligne avec ce que la recherche en évaluation appelle l'évaluation pour l'apprentissage (assessment for learning) : on évalue pour faire progresser, pas seulement pour sanctionner.</div>
```

#### Page 3 — Le système de jetons et le droit à la reprise

```html
<p>Le <strong>système de jetons</strong> de Labo Codex permet à l'élève de reprendre certains artefacts. Chaque élève dispose d'un nombre fini de jetons par trimestre – tu en configures les règles dans le module de notation.</p>

<h4>Pourquoi des jetons ?</h4>
<ul>
    <li><strong>Droit à l'erreur structuré</strong> — l'élève peut reprendre, mais pas indéfiniment. La contrainte préserve l'effort initial.</li>
    <li><strong>Motivation de maîtrise</strong> — l'élève qui obtient une note insatisfaisante peut décider de la travailler plutôt que de s'y résigner. Cela favorise l'engagement.</li>
    <li><strong>Distinction entre soupçon et difficulté</strong> — un jeton peut signaler un soupçon de plagiat (l'élève reprend pour démontrer sa compétence) ou une simple difficulté d'apprentissage. Les badges du module évaluation distinguent ces cas.</li>
</ul>

<h4>Types de jetons</h4>
<p>Plusieurs types peuvent être configurés selon ton contexte :</p>
<ul>
    <li><strong>Jeton de reprise</strong> — pour reprendre un artefact qui n'a pas atteint le seuil de maîtrise</li>
    <li><strong>Jeton de délai</strong> — pour remettre un artefact en retard sans pénalité</li>
    <li><strong>Jeton de plagiat / soupçon</strong> — flag pédagogique sur un artefact à clarifier</li>
</ul>

<p>Le module <strong>Conception → Pratiques de notation</strong> permet de configurer le nombre de jetons par trimestre, les règles de reprise, et les types disponibles.</p>
```

#### Page 4 — PAN en pratique dans Labo Codex

```html
<h4>Choisir une pratique de notation</h4>
<p>Va dans <strong>Conception → Pratiques de notation</strong>. Tu peux y créer ou choisir une pratique parmi les modèles fournis :</p>
<ul>
    <li>PAN-Maîtrise (N meilleurs)</li>
    <li>PAN-Portfolio (structure mixte)</li>
    <li>Sommative classique (moyenne pondérée)</li>
    <li>Tes pratiques personnalisées</li>
</ul>

<h4>Conséquences sur l'évaluation</h4>
<p>La pratique choisie détermine comment Labo Codex calcule la note finale du trimestre à partir des artefacts évalués. Tu peux changer de pratique à tout moment – la note se recalcule automatiquement, sans modifier les évaluations individuelles.</p>

<h4>Découplage Performance / Niveau d'attention</h4>
<p>Dans Réglages → Accompagnement, l'option <strong>Découpler Performance (P) et Niveau d'attention (N)</strong> permet une nuance importante : la note officielle (P) suit la pratique que tu as choisie, mais le système de dépistage (N) regarde toujours les N dernières productions, indépendamment de la note. Tu peux ainsi avoir une note PAN-Maîtrise valorisant le progrès, tout en gardant un dépistage fiable basé sur la tendance récente.</p>

<h4>Compatibilité avec les autres cadres</h4>
<p>Le PAN s'articule bien avec :</p>
<ul>
    <li><strong>L'échelle IDME</strong> (Insuffisant, Développement, Maîtrisé, Étendu) qui décrit qualitativement les niveaux de maîtrise</li>
    <li><strong>La RàI</strong> qui guide le moment et l'intensité de l'intervention</li>
    <li><strong>L'enseignement explicite</strong> qui structure les leçons pour maximiser la chance d'atteindre la maîtrise</li>
</ul>

<div class="guide-pedagogique-astuce">Le PAN est une pratique d'évaluation, pas une magie. Il fonctionne mieux quand il est articulé à des dispositifs d'apprentissage solides (enseignement explicite, dépistage, rétroaction). Seul, il peut donner l'impression d'une notation laxiste ; intégré, il devient un système d'évaluation pédagogiquement défendable.</div>
```

---

## 6. Points d'accès aux nouveaux guides

### 6.1 Guide Enseignement explicite

- *Depuis le Plan de la leçon* : bouton « Guide » à côté de la checkbox d'activation
- *Depuis les Réglages > Préférences* : bouton « Guide » à côté de la nouvelle préférence « Enseignement explicite par défaut »

### 6.2 Guide PAN

- *Depuis Conception → Pratiques de notation* : bouton « Guide PAN » dans l'en-tête du module
- *Optionnel* : aussi depuis Réglages, à côté d'une éventuelle préférence relative aux pratiques de notation (à confirmer si pertinent)

Tous les boutons utilisent le même pattern HTML :

```html
<button class="ee-guide-btn" data-action="ouvrirGuidePedagogique" data-param="<id-du-guide>" title="<Titre du guide>">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
</button>
```

---

## 7. Audit signalé : SRPNF codé en dur

L'audit éclair réalisé pendant la planification a révélé que les critères SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français) sont **codés en dur** dans deux fichiers :

- `js/profil-etudiant-diagnostics.js` (lignes ~45, 57, 86-89, 437-440)
- `js/profil-etudiant-calculs.js` (lignes ~620, 861, 950-952)

Cela contredit l'aspiration d'universalité de Labo Codex (citée dans `SKILL_RaI.md` : « Rien dans l'architecture ne doit être codé en dur pour une pratique personnelle »). Un autre enseignant adoptant Labo Codex avec une grille différente verra des références au vocabulaire SRPNF dans les diagnostics.

**Recommandation** : prévoir un chantier ultérieur de généralisation. Le diagnostic doit être paramétré sur la grille active de l'utilisateur, pas sur SRPNF en dur. Cela ne fait pas partie du présent chantier, mais c'est signalé pour le backlog.

**Bonne nouvelle** : ELLAC n'apparaît dans aucun fichier `.js` du projet. C'est purement conceptuel dans les skills, sans dépendance dans le code.

---

## 8. Ordre d'exécution recommandé

1. **Chantier chrome** (en cours, plan séparé)
2. **Uniformisation Accompagnement** (introduit le patron `.option-accompagnement`)
3. **Module guides pédagogiques unifié** (présent plan, §2) : créer `js/guides-pedagogiques.js`, le panneau HTML, les styles
4. **Contenus des guides existants** : copier dans `GUIDES_PEDAGOGIQUES` les contenus de SOLO, RàI, ACP (depuis leurs plans respectifs)
5. **Nouveau guide Enseignement explicite** (§4 du présent plan) + préférence + bouton dans Plan de la leçon
6. **Nouveau guide PAN** (§5 du présent plan) + boutons d'accès
7. **Chantier SOLO** : tampons + intégration éditeur d'échelle (le guide est déjà dans le module unifié)
8. **Chantier RàI** : juste s'assurer que les boutons d'accès sont en place (le guide est déjà dans le module unifié)
9. **Tests fonctionnels** complets
10. **Finalisation** : version, changelog, commit

---

## 9. Tests fonctionnels

### Test 1 — Mécanique commune
- Ouvrir chaque guide tour à tour : SOLO, RàI, ACP, Enseignement explicite, PAN. Vérifier que le panneau s'affiche correctement, que la navigation entre pages fonctionne, que la fermeture marche.

### Test 2 — Points d'accès
- Vérifier que chaque bouton « Guide » dans l'app ouvre bien le guide attendu.
- SOLO : depuis Accompagnement et palette de tampons
- RàI : depuis Accompagnement et module Interventions
- ACP : depuis Accompagnement
- Enseignement explicite : depuis Plan de la leçon et Réglages > Préférences
- PAN : depuis Conception → Pratiques de notation

### Test 3 — Préférence par défaut Enseignement explicite
- Activer la préférence. Créer une nouvelle leçon. Vérifier qu'elle est en mode enseignement explicite par défaut.
- Désactiver la préférence. Créer une nouvelle leçon. Vérifier qu'elle n'est pas en mode enseignement explicite par défaut.
- Override local : basculer une leçon individuelle. Vérifier que le changement local n'affecte pas les autres leçons ni la préférence.

### Test 4 — Modes spéciaux
- Mode anonymisation : tous les guides accessibles.
- Mode démo : tous les guides accessibles.
- Trimestre archivé : tous les guides accessibles.

### Test 5 — Mode clair et mode sombre
- Vérifier la lisibilité de tous les guides dans les deux modes.

### Test 6 — Accessibilité
- Tab pour atteindre les boutons, dots, prev/next.
- Flèches gauche/droite pour naviguer.
- Escape pour fermer.
- Lecteur d'écran : titre de page annoncé à chaque changement.

---

## 10. Finalisation

### Numéro de beta
À demander avant le commit.

### Mise à jour du changelog (`js/changelog-data.js`)

```javascript
{
    version: 'Beta XX',
    couleur: 'vert',
    titre: 'Module Guides pédagogiques',
    items: [
        'Nouveau module unifié pour tous les guides pédagogiques de Labo Codex',
        'Cinq guides accessibles : SOLO, RàI, ACP, Enseignement explicite, PAN',
        'Préférence « Enseignement explicite par défaut » dans Réglages, avec override leçon par leçon',
        'Navigation cohérente entre tous les guides : mêmes touches, même comportement',
        'Architecture qui permet l\'ajout de futurs guides en quelques lignes de code'
    ]
}
```

### Mise à jour de version
- `version.json` à la racine
- Fallback dans `index.html`

---

**Fin du plan**

*Ce plan d'architecture maître coexiste avec les plans de contenu existants (`PLAN_taxonomie_SOLO.md`, `PLAN_guide_RaI.md`) et le plan d'uniformisation (`PLAN_uniformisation_Accompagnement.md`). Les contenus des guides SOLO/RàI/ACP restent définis dans leurs plans respectifs ; ce plan-ci ajoute l'infrastructure technique commune et le contenu des deux nouveaux guides (Enseignement explicite et PAN).*
