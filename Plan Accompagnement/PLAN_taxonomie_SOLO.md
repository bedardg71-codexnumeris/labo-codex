# Plan d'intégration globale de la taxonomie SOLO dans Labo Codex

**Date** : 23 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Plan d'ensemble pour trois chantiers coordonnés
**Version cible** : Beta à déterminer

---

## 1. Vision d'ensemble

La taxonomie SOLO (Structure of Observed Learning Outcomes, Biggs & Collis 1982) est déjà présente dans Labo Codex sous forme de référence textuelle dans l'Accompagnement et de structure conceptuelle de l'échelle IDME. Ce plan rend SOLO **visible et utilisable de bout en bout** dans l'app, en activant simultanément trois fonctionnalités quand la checkbox « Taxonomie SOLO » des réglages est cochée :

1. Quatre tampons SVG Compréhension dans la palette d'annotation (Uni, Multi, Relationnel, Étendu)
2. Un guide pédagogique de 5 pages accessible depuis l'Accompagnement et la palette
3. Dans l'éditeur d'échelle de performance, **chaque niveau peut être explicitement associé à un niveau cognitif SOLO** par l'enseignant via un sélecteur dédié ; le pictogramme et le nom SOLO de l'association choisie s'affichent ensuite à côté du niveau

L'association est **déclarée par l'enseignant**, pas inférée par le système. Une suggestion par défaut est proposée pour l'échelle IDME standard (codes 0, I, D, M, E), mais l'enseignant reste libre de modifier ou de laisser vide. Cela rend le système compatible avec toutes les échelles, pas seulement celles à cinq niveaux IDME.

L'architecture pivote autour d'**une seule préférence existante** : `afficherDescriptionsSOLO`. Son rôle est étendu pour régir ces trois fonctionnalités, en plus de son rôle actuel (descriptions textuelles dans l'Accompagnement).

### Cohérence visuelle garantie

Les couleurs IDME existantes (`#f08c3a`, `#f0c83a`, `#5fb84a`, `#27b9e0`) sont utilisées partout : dans les tampons SVG, dans les pictogrammes de l'éditeur d'échelle, dans les références au sein du guide. Ce sont aussi les couleurs déjà affectées aux niveaux IDME dans `synthese-retroaction-data.js`.

### Décision de doctrine

La préférence `afficherDescriptionsSOLO` devient l'interrupteur central de l'ensemble SOLO. Son texte descriptif dans la checkbox des réglages doit refléter ce rôle élargi.

---

## 2. Préférence pivot : `afficherDescriptionsSOLO`

### Comportement étendu

| État | Effet |
|---|---|
| Cochée (défaut) | Descriptions SOLO dans Accompagnement + Tampons Compréhension visibles + Bouton Guide SOLO visible + Pictogrammes SOLO dans l'éditeur d'échelle |
| Décochée | Aucun de ces éléments ne s'affiche |

### Texte de la checkbox mis à jour

**Avant** (`index.html` ligne 9117) :
> Affiche les descriptions détaillées des niveaux SOLO (unistructurel, multistructurel, relationnel, abstrait étendu) dans l'Accompagnement.

**Après** :
> Active la taxonomie SOLO dans Labo Codex : descriptions des niveaux dans l'Accompagnement, tampons Compréhension dans la palette d'annotation, guide pédagogique, et affichage des niveaux SOLO dans l'éditeur d'échelle de performance.

### Code à utiliser pour vérifier l'état

```javascript
var soloActif = (typeof obtenirPreference === 'function')
    && obtenirPreference('afficherDescriptionsSOLO') !== false;
```

Cette variable doit être lue dans chacun des modules concernés (palette, accompagnement, éditeur d'échelle).

---

## 3. Chantier 1 — Tampons SOLO dans la palette

**Statut** : Spec déjà produite dans le document `PLAN_integration_tampons_SOLO.md`. Ce chantier reste tel que documenté. Les SVG sont prêts dans `svg-solo/comprehension-*.svg`.

**À exécuter en premier** parmi les trois chantiers, parce qu'il est le plus simple et que les SVG produits seront réutilisés dans le chantier 3 (pictogrammes dans l'éditeur d'échelle).

**Récapitulatif des modifications** (voir le document détaillé pour les diffs exacts) :
- Copier les 4 SVG dans `autocollants/`
- Changer `.png` en `.svg` dans `travaux-outils.js` lignes 207-210
- Ajouter le filtre `soloActif` dans `genererContenuTampons()` lignes ~1089 et ~1117
- Mettre à jour le texte de la checkbox dans `index.html` ligne 9117 (utiliser le nouveau texte de la section 2 ci-dessus, qui couvre les trois fonctionnalités d'un coup)
- Supprimer les anciens PNG

---

## 4. Chantier 2 — Guide pédagogique SOLO

### 4.1 Architecture

Reproduire le pattern du guide Alignement (voir `js/planification-carte.js` lignes 185-294 pour la structure de référence). Le guide SOLO sera défini dans un nouveau fichier ou dans un module existant lié à l'Accompagnement.

**Recommandation d'emplacement du code** : créer un nouveau fichier `js/guide-solo.js` qui contiendra :

- La constante `GUIDE_SOLO_PAGES` (tableau de 5 pages avec `titre` et `contenu`)
- Les fonctions `ouvrirGuideSOLO()`, `rendrePageGuideSOLO()`, `fermerGuideSOLO()`
- L'enregistrement des actions `data-action` pour les boutons

### 4.2 Structure HTML à ajouter dans `index.html`

Un panneau modal/popover dans le DOM, similaire à `#planif-guide-panel` :

```html
<div id="guide-solo-panel" style="display: none;">
    <div class="guide-solo-panel-contenu">
        <button class="guide-solo-panel-replier" data-action="fermerGuideSOLO">×</button>
        <!-- contenu généré dynamiquement -->
    </div>
</div>
```

### 4.3 Points d'accès au guide

**Depuis l'Accompagnement** : ajouter un bouton « Guide SOLO » dans le panneau qui affiche actuellement les descriptions SOLO. Le bouton est masqué quand `soloActif === false`.

**Depuis la palette de tampons** : ajouter un bouton/icône « ? » à côté du label de la catégorie « Compréhension ». Visible seulement quand `soloActif === true` (ce qui est automatique puisque la catégorie elle-même est conditionnelle à `soloActif`).

### 4.4 Contenu des 5 pages

#### Page 1 — Qu'est-ce que SOLO ?

```html
<p>La <strong>taxonomie SOLO</strong> (Structure of Observed Learning Outcomes) est un cadre développé par Biggs et Collis en 1982 pour décrire la qualité de l'apprentissage observable dans les productions étudiantes.</p>

<p>Plutôt que de mesurer la quantité d'informations restituées, SOLO décrit la <strong>structure cognitive</strong> d'une réponse : à quel point l'étudiant relie les éléments entre eux et les intègre dans une compréhension cohérente.</p>

<p>Cinq niveaux progressifs sont distingués :</p>
<ul>
    <li><strong>Préstructurel</strong> — aucune information pertinente</li>
    <li><strong>Unistructurel</strong> — un seul élément identifié</li>
    <li><strong>Multistructurel</strong> — plusieurs éléments juxtaposés mais non reliés</li>
    <li><strong>Relationnel</strong> — éléments intégrés en une structure cohérente</li>
    <li><strong>Abstrait étendu</strong> — la structure est transférée à d'autres contextes</li>
</ul>

<p>Dans Labo Codex, SOLO sert de fondement à l'échelle de performance IDME (Insuffisant, Développement, Maîtrisé, Étendu) et à l'observation des productions étudiantes via les tampons de la catégorie Compréhension.</p>

<p class="guide-solo-ref">
Biggs, J. B., &amp; Collis, K. F. (1982). <em>Evaluating the Quality of Learning: The SOLO Taxonomy (Structure of the Observed Learning Outcome)</em>. Academic Press.
</p>
```

#### Page 2 — Préstructurel et Unistructurel

```html
<p>Les deux niveaux les plus bas correspondent à un apprentissage fragmentaire ou absent.</p>

<h4>Préstructurel</h4>
<p>L'étudiant ne fournit aucune information pertinente, ou des informations sans lien avec la question posée. Code IDME : <strong>0</strong> (Non recevable).</p>

<h4>Unistructurel <img src="autocollants/comprehension-uni.svg" alt="" class="guide-solo-pictogramme"></h4>
<p>L'étudiant identifie un seul élément pertinent, sans le mettre en relation avec d'autres. La réponse est correcte mais incomplète ou superficielle. Code IDME : <strong>I</strong> (Insuffisant).</p>

<p><em>Exemple : à la question « Quelles sont les causes de la Révolution française ? », l'étudiant mentionne seulement « la pauvreté » sans détailler ni relier à d'autres facteurs.</em></p>

<div class="guide-solo-astuce">Pédagogiquement, ce niveau signale une compréhension de surface — un point de départ, pas une fin. L'intervention vise à enrichir les éléments identifiés et à inviter l'étudiant à en chercher d'autres.</div>
```

#### Page 3 — Multistructurel

```html
<h4>Multistructurel <img src="autocollants/comprehension-multi.svg" alt="" class="guide-solo-pictogramme"></h4>
<p>L'étudiant identifie plusieurs éléments pertinents, mais ils restent juxtaposés sans relation explicite entre eux. La réponse est riche mais fragmentée. Code IDME : <strong>D</strong> (En Développement).</p>

<p><em>Exemple : pour la même question, l'étudiant énumère « la pauvreté, les inégalités sociales, les idées des Lumières et la crise financière » sans expliquer comment ces facteurs interagissent.</em></p>

<div class="guide-solo-astuce">C'est la <strong>zone critique de consolidation</strong>. L'étudiant a les éléments mais pas encore la structure. L'intervention pédagogique vise à amener à <em>relier</em> : « Comment ces facteurs s'influencent-ils les uns les autres ? »</div>

<p>Dans l'évaluation IDME, ce niveau correspond à un seuil situé entre 65 % et 74 % : la performance est en développement, pas encore aboutie.</p>
```

#### Page 4 — Relationnel et Abstrait étendu

```html
<h4>Relationnel <img src="autocollants/comprehension-relationnel.svg" alt="" class="guide-solo-pictogramme"></h4>
<p>L'étudiant intègre les éléments en une structure cohérente. Il établit explicitement des relations entre les composantes. La réponse a une logique interne identifiable. Code IDME : <strong>M</strong> (Maîtrisé).</p>

<p><em>Exemple : « Les idées des Lumières ont alimenté la conscience des inégalités, que la crise financière a rendues insupportables aux yeux d'une population déjà appauvrie. »</em></p>

<h4>Abstrait étendu <img src="autocollants/comprehension-etendu.svg" alt="" class="guide-solo-pictogramme"></h4>
<p>L'étudiant non seulement intègre la structure, mais l'extrapole : il fait des comparaisons avec d'autres contextes, formule des principes généraux, ou applique la structure à des situations nouvelles. Code IDME : <strong>E</strong> (Étendu).</p>

<p><em>Exemple : « Les conditions qui ont conduit à la Révolution française se retrouvent partiellement dans d'autres révolutions, comme le Printemps arabe — une crise économique combinée à une conscience des inégalités amplifiée par la circulation des idées. »</em></p>

<div class="guide-solo-astuce">L'écart entre Relationnel et Abstrait étendu marque un saut qualitatif : passer de comprendre <em>ce cas-ci</em> à comprendre <em>cette classe de cas</em>.</div>
```

#### Page 5 — SOLO en pratique

```html
<h4>Avec les tampons de la palette d'annotation</h4>
<p>Quatre tampons SOLO sont disponibles dans la catégorie « Compréhension » de la palette (visible seulement quand la taxonomie SOLO est activée dans les réglages) :</p>
<ul class="guide-solo-tampons-liste">
    <li><img src="autocollants/comprehension-uni.svg" alt="" class="guide-solo-pictogramme"> <strong>Uni</strong> — pour les passages où l'étudiant identifie un seul élément</li>
    <li><img src="autocollants/comprehension-multi.svg" alt="" class="guide-solo-pictogramme"> <strong>Multi</strong> — pour les passages où plusieurs éléments sont juxtaposés</li>
    <li><img src="autocollants/comprehension-relationnel.svg" alt="" class="guide-solo-pictogramme"> <strong>Relationnel</strong> — pour les passages qui établissent des relations</li>
    <li><img src="autocollants/comprehension-etendu.svg" alt="" class="guide-solo-pictogramme"> <strong>Étendu</strong> — pour les passages qui transfèrent à d'autres contextes</li>
</ul>

<h4>Avec l'échelle de performance IDME</h4>
<p>L'échelle IDME utilisée dans Labo Codex correspond aux niveaux SOLO. Quand tu crées ou modifies une échelle dans Conception → Échelles de performance, le pictogramme et le nom SOLO de chaque niveau s'affichent à côté du code IDME (toujours conditionnel à l'activation de SOLO).</p>

<h4>Pour la rétroaction étudiante</h4>
<p>Identifier le niveau SOLO d'une production aide à formuler une rétroaction <em>structurelle</em> plutôt que purement quantitative. Au lieu de « il manque des éléments », tu peux dire « tes éléments sont identifiés (Multistructurel), maintenant cherche à les relier (Relationnel) ». L'étudiant comprend ce qu'il doit faire pour progresser, pas seulement que ce n'est pas assez.</p>

<div class="guide-solo-astuce">Conseil pratique : commence par identifier le niveau dominant de la production, puis cherche les passages qui s'écartent (en mieux ou en moins bien). Les tampons servent à signaler ces passages dans le texte étudiant.</div>
```

### 4.5 Styles CSS à ajouter dans `styles.css`

Dupliquer le pattern des classes `planif-guide-*` en remplaçant le préfixe par `guide-solo-`. Au minimum :

```css
#guide-solo-panel { /* mêmes propriétés que #planif-guide-panel */ }
.guide-solo-panel-contenu { /* idem */ }
.guide-solo-titre { /* idem .planif-guide-titre */ }
.guide-solo-corps { /* idem .planif-guide-corps */ }
.guide-solo-nav { /* idem */ }
.guide-solo-dots { /* idem */ }
.guide-solo-dot { /* idem */ }
.guide-solo-ref { /* idem .planif-guide-ref */ }
.guide-solo-astuce { /* idem .planif-guide-astuce */ }
.guide-solo-pictogramme {
    height: 28px;
    vertical-align: middle;
    margin-left: 6px;
}
.guide-solo-tampons-liste { list-style: none; padding-left: 0; }
.guide-solo-tampons-liste li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
}
```

### 4.6 Wiring des boutons

**Bouton « Guide SOLO » dans l'Accompagnement** : à placer dans le panneau qui affiche les descriptions SOLO. Identifier le bon emplacement HTML dans `index.html` (chercher autour de la ligne 14145 où SOLO est défini dans le glossaire). Style suggéré : bouton secondaire avec icône `?` et texte « Guide SOLO ».

```html
<button data-action="ouvrirGuideSOLO" class="btn-secondaire" data-tooltip="guide-solo">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide SOLO
</button>
```

**Bouton dans la palette de tampons** : à placer à côté du label de la catégorie « Compréhension ». Modifier `genererContenuTampons()` dans `travaux-outils.js` pour ajouter ce bouton uniquement quand `catId === 'comprehension'` :

```javascript
if (catId === 'comprehension' && soloActif) {
    html += '<button class="travaux-categorie-guide-btn" data-action="ouvrirGuideSOLO" title="Guide SOLO">?</button>';
}
```

---

## 5. Chantier 3 — Association explicite SOLO dans l'éditeur d'échelle

### 5.1 Principe directeur

Chaque niveau d'une échelle de performance peut être **explicitement associé** par l'enseignant à un niveau cognitif SOLO. L'association est stockée dans un nouveau champ `niveauSOLO` sur chaque niveau d'échelle. Quand SOLO est activé dans les réglages, un sélecteur déroulant apparaît à côté de chaque niveau dans l'éditeur, et le pictogramme + nom SOLO de l'association choisie s'affichent en sous-texte.

Le système n'impose rien : l'enseignant peut laisser vide, choisir un niveau SOLO, ou en changer à tout moment. Pour l'échelle IDME standard, une suggestion par défaut est proposée à la création (basée sur le code du niveau), mais elle est modifiable.

### 5.2 Modification du modèle de données

**Champ ajouté à chaque niveau d'échelle** : `niveauSOLO`, une chaîne parmi `'prestructurel'`, `'unistructurel'`, `'multistructurel'`, `'relationnel'`, `'abstrait-etendu'`, ou `null`/`''` si l'enseignant n'a pas choisi.

Conséquence sur la structure existante : les échelles déjà créées (codex existants) n'ont pas ce champ. Le code doit traiter `undefined` comme « pas d'association » et ne rien afficher dans ce cas. Aucune migration destructive nécessaire.

À noter : un précédent existe dans le projet — `js/grilles.js` lignes 2723-2724 et 3019-3020 utilisent déjà un champ `niveauSOLO` sur les critères de grille (valeurs `'multistructurel'`, `'relationnel'`, etc.). Reprendre **exactement le même vocabulaire** pour les valeurs :

```javascript
var VALEURS_NIVEAU_SOLO = ['prestructurel', 'unistructurel', 'multistructurel', 'relationnel', 'abstrait-etendu'];
```

### 5.3 Constante de référence SOLO

Définir une table de correspondance entre les valeurs internes et les libellés/pictogrammes. À placer dans un module partagé (par exemple en haut de `js/echelles.js`, ou dans `js/synthese-retroaction-data.js`) :

```javascript
var NIVEAUX_SOLO = {
    'prestructurel':   { libelle: 'Préstructurel',     pictogramme: null },
    'unistructurel':   { libelle: 'Unistructurel',     pictogramme: 'autocollants/comprehension-uni.svg' },
    'multistructurel': { libelle: 'Multistructurel',   pictogramme: 'autocollants/comprehension-multi.svg' },
    'relationnel':     { libelle: 'Relationnel',       pictogramme: 'autocollants/comprehension-relationnel.svg' },
    'abstrait-etendu': { libelle: 'Abstrait étendu',   pictogramme: 'autocollants/comprehension-etendu.svg' }
};
```

### 5.4 Suggestion par défaut à la création

Quand l'utilisateur crée une nouvelle échelle de cinq niveaux avec les codes IDME standards (0, I, D, M, E), proposer automatiquement les associations suivantes (mais l'utilisateur peut les modifier) :

| Code niveau | `niveauSOLO` suggéré par défaut |
|---|---|
| `0` (Non recevable) | `'prestructurel'` |
| `I` (Insuffisant) | `'unistructurel'` |
| `D` (En Développement) | `'multistructurel'` |
| `M` (Maîtrisé) | `'relationnel'` |
| `E` (Étendu) | `'abstrait-etendu'` |

Pour les échelles non standard (autres codes ou nombre de niveaux), aucune suggestion par défaut : le champ reste vide jusqu'à ce que l'enseignant choisisse.

### 5.5 UI à ajouter dans l'éditeur de niveau

Dans la fonction qui génère le HTML d'un niveau d'échelle (à identifier dans `echelles.js`), ajouter, conditionné à `soloActif`, un sélecteur déroulant et l'affichage du pictogramme. Position suggérée : juste après le champ « Nom du niveau », avant ou après la ligne de Min/Max selon la place disponible.

Structure HTML à générer pour chaque niveau (pseudo-code) :

```javascript
if (soloActif) {
    htmlNiveau += '<div class="echelle-niveau-solo-zone">';
    htmlNiveau += '  <label for="solo-' + niveauId + '">Niveau cognitif SOLO :</label>';
    htmlNiveau += '  <select id="solo-' + niveauId + '" data-on-change="echelles.changerNiveauSOLO" data-niveau="' + niveauId + '">';
    htmlNiveau += '    <option value="">— Aucun —</option>';
    Object.keys(NIVEAUX_SOLO).forEach(function(valeur) {
        var selected = niveau.niveauSOLO === valeur ? ' selected' : '';
        htmlNiveau += '    <option value="' + valeur + '"' + selected + '>' + NIVEAUX_SOLO[valeur].libelle + '</option>';
    });
    htmlNiveau += '  </select>';

    // Affichage du pictogramme à côté du sélecteur (si association choisie et pictogramme disponible)
    if (niveau.niveauSOLO && NIVEAUX_SOLO[niveau.niveauSOLO] && NIVEAUX_SOLO[niveau.niveauSOLO].pictogramme) {
        htmlNiveau += '<img src="' + NIVEAUX_SOLO[niveau.niveauSOLO].pictogramme + '" alt="" class="echelle-solo-pictogramme">';
    }
    htmlNiveau += '</div>';
}
```

### 5.6 Persistance du choix

Quand l'utilisateur change la valeur du sélecteur, déclencher une fonction (`echelles.changerNiveauSOLO` ou équivalent) qui :
1. Met à jour le champ `niveauSOLO` du niveau correspondant dans la structure de l'échelle en édition
2. Rafraîchit l'affichage du pictogramme à côté du sélecteur
3. Marque l'échelle comme modifiée (pour activer le bouton « Enregistrer »)

### 5.7 Affichage en lecture seule

L'éditeur d'échelle a un mode lecture seule (visualisation d'une échelle existante). Dans ce mode, ne pas afficher le sélecteur mais juste le pictogramme et le nom SOLO si une association existe :

```javascript
if (soloActif && niveau.niveauSOLO) {
    var solo = NIVEAUX_SOLO[niveau.niveauSOLO];
    htmlNiveau += '<div class="echelle-niveau-solo-lecture">';
    if (solo.pictogramme) {
        htmlNiveau += '<img src="' + solo.pictogramme + '" alt="" class="echelle-solo-pictogramme">';
    }
    htmlNiveau += '<span class="echelle-solo-nom">' + solo.libelle + '</span>';
    htmlNiveau += '</div>';
}
```

### 5.8 Styles CSS à ajouter

```css
.echelle-niveau-solo-zone {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
    padding: 6px 10px;
    background: rgba(106, 172, 184, 0.06);
    border-left: 2px solid rgba(106, 172, 184, 0.3);
    border-radius: 4px;
    font-size: 0.85rem;
}
.echelle-niveau-solo-zone label {
    color: var(--bleu-meta);
    font-weight: 500;
    white-space: nowrap;
}
.echelle-niveau-solo-zone select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: var(--texte-principal);
    padding: 3px 8px;
    border-radius: 3px;
    flex: 1;
    max-width: 220px;
}
.echelle-niveau-solo-lecture {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    font-size: 0.85rem;
}
.echelle-solo-pictogramme {
    height: 24px;
    width: auto;
    flex-shrink: 0;
}
.echelle-solo-nom {
    color: var(--bleu-meta);
    font-style: italic;
}
```

### 5.9 Rafraîchissement à la sauvegarde de préférence

Quand l'utilisateur coche ou décoche la checkbox SOLO dans les réglages, l'éditeur d'échelle doit aussi se rafraîchir. Dans `js/preferences-v2.js`, après l'appel existant à `rafraichirPalettesApresPersonnalisation()`, ajouter (si la fonction existe) un appel à un rafraîchissement des échelles ouvertes.

Vérification à faire dans `echelles.js` : existe-t-il une fonction de rafraîchissement d'UI similaire à `travauxOutils.rafraichirPalettesApresPersonnalisation` ? Si oui, l'appeler. Sinon, c'est acceptable que les changements ne soient visibles qu'à la prochaine ouverture de l'éditeur.

---

## 6. Ordre d'exécution recommandé

1. **Tampons** (chantier 1) — déjà spécifié, exécuter en premier. C'est le moins risqué et il fournit les SVG nécessaires aux chantiers 2 et 3.
2. **Guide SOLO** (chantier 2) — créer le nouveau fichier `js/guide-solo.js`, le panneau HTML, les styles, et les deux points d'accès.
3. **Intégration éditeur d'échelle** (chantier 3) — modifier `js/echelles.js` pour afficher les pictogrammes et noms SOLO conditionnellement.
4. **Tests fonctionnels** (voir section 7) — vérifier l'ensemble.
5. **Finalisation** — version, changelog, commit, push.

Cet ordre est dicté par les dépendances : les SVG des tampons sont réutilisés dans le guide (pages 2, 3, 4, 5) et dans l'éditeur d'échelle (pictogrammes par niveau). Donc tampons en place avant de coder les deux autres.

---

## 7. Tests fonctionnels

### Test 1 — Activation/désactivation globale
- Activer la checkbox SOLO. Vérifier : tampons visibles, bouton Guide SOLO dans Accompagnement, pictogrammes dans l'éditeur d'échelle.
- Désactiver. Vérifier : tampons cachés, bouton Guide SOLO caché, pictogrammes cachés.

### Test 2 — Navigation du guide
- Ouvrir le guide depuis l'Accompagnement. Vérifier les 5 pages, la navigation (boutons précédent/suivant, dots), la fermeture.
- Ouvrir le guide depuis la palette de tampons. Vérifier que c'est le même guide, sur la même page 1.

### Test 3 — Cohérence visuelle des pictogrammes
- Vérifier que les pictogrammes affichés dans le guide (pages 2-5) sont identiques aux tampons de la palette.
- Vérifier que les pictogrammes dans l'éditeur d'échelle sont identiques aussi.

### Test 4 — Échelle de performance, association explicite
- Ouvrir l'éditeur d'échelle, créer une nouvelle échelle IDME standard à 5 niveaux. Vérifier que les associations SOLO par défaut sont proposées (Préstructurel pour 0, Unistructurel pour I, etc.).
- Changer manuellement l'association d'un niveau via le sélecteur (par exemple mettre Multistructurel sur le niveau « M » au lieu de Relationnel). Vérifier que le pictogramme à côté change.
- Enregistrer l'échelle, la fermer, la rouvrir. Vérifier que les associations modifiées sont persistées.
- Créer une échelle non-standard (3 niveaux, codes différents). Vérifier qu'aucune association par défaut n'est proposée et que les sélecteurs sont vides par défaut.
- Vérifier que désactiver la checkbox SOLO masque tous les sélecteurs et pictogrammes dans l'éditeur (peut nécessiter de fermer/rouvrir si pas de rafraîchissement automatique).
- Vérifier que les échelles existantes (créées avant cette beta, donc sans champ `niveauSOLO`) s'ouvrent sans erreur et présentent simplement des sélecteurs vides.

### Test 5 — Modes spéciaux
- Mode anonymisation : guide accessible et lisible.
- Trimestre archivé : pictogrammes affichés correctement.
- Mode démo : tout fonctionne.

### Test 6 — Mode clair et mode sombre
- Vérifier la lisibilité du guide dans les deux modes.
- Vérifier les pictogrammes (les couleurs IDME doivent s'afficher correctement, sans filtre `brightness(0) invert(1)` qui les écraserait).

---

## 8. Points de vigilance

### 8.1 Disponibilité des SVG
Les pictogrammes utilisés dans le guide et l'éditeur d'échelle font référence à `autocollants/comprehension-*.svg`. Ces fichiers doivent exister, donc le chantier 1 doit être complet avant les autres.

### 8.2 Conditionnement uniforme
Toutes les nouveautés SOLO sont conditionnées à la même variable `soloActif`. Pas de double régime (par exemple SOLO partiellement actif). Si on doit dissocier un jour, ce sera une décision explicite.

### 8.3 Référence Biggs & Collis 1982
Pas de lien web obligatoire dans la référence académique (contrairement au guide Alignement qui pointe vers UNESCO). Grégoire a le PDF original, donc on peut citer sans hyperlien. Si on veut un lien, citer la fiche bibliographique d'une bibliothèque universitaire.

### 8.4 Internationalisation
Le guide est rédigé en français québécois. Vouvoiement évité, vocabulaire pédagogique précis (Préstructurel, Unistructurel, etc.) Pas de raccourcis ni d'anglicismes.

### 8.5 Accessibilité
- Cibles tactiles ≥44px sur les boutons de navigation du guide
- Contraste WCAG AA dans les deux modes
- Navigation clavier : flèches gauche/droite pour pages, Escape pour fermer
- Lecteurs d'écran : titre de page lu à chaque changement

### 8.6 Zones protégées
Aucune modification à `js/config.js`, `js/navigation.js`, `noms_stables.json`. Le guide SOLO est un nouveau module qui s'ajoute sans toucher à l'existant.

---

## 9. Finalisation

### Numéro de beta
À demander à Grégoire avant le commit. Vu l'ampleur (trois chantiers liés), probablement saut mineur ou majeur (ex. 99.7 ou 100.0).

### Mise à jour du changelog (`js/changelog-data.js`)

```javascript
{
    version: 'Beta XX',
    couleur: 'vert',
    titre: 'Taxonomie SOLO intégrée',
    items: [
        'Nouveaux tampons SOLO (Compréhension) en SVG : Uni, Multi, Relationnel, Étendu',
        'Guide pédagogique SOLO en 5 pages accessible depuis l\'Accompagnement et la palette',
        'Chaque niveau d\'une échelle de performance peut être explicitement associé à un niveau cognitif SOLO',
        'Une seule checkbox « Taxonomie SOLO » active désormais l\'ensemble des fonctionnalités SOLO',
        'Couleurs IDME unifiées entre tampons, pictogrammes et échelle (orange/jaune/vert/bleu)'
    ]
}
```

### Mise à jour de version
- `version.json` à la racine
- Fallback dans `index.html` ligne ~17166

---

**Fin du plan**

*Ce document est le plan maître unique pour intégrer la taxonomie SOLO dans Labo Codex. Il couvre les trois chantiers coordonnés (tampons, guide, échelle) et la spec complète pour chacun.*
