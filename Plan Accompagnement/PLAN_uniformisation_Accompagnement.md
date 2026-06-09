# Plan d'uniformisation de la page Réglages > Accompagnement

**Date** : 23 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Spec finalisée
**Version cible** : Beta à déterminer

---

## 1. Vision et contexte

La page Réglages > Accompagnement (sous-section `reglages-depistage` dans le code, accessible via Réglages → onglet « Observation et dépistage ») souffre de plusieurs incohérences accumulées au fil des ajouts de fonctionnalités :

- Trois conventions visuelles pour les blocs d'options
- Hiérarchie sémantique non respectée (paramètres RàI au même niveau que leur activateur)
- Profondeur conceptuelle inégale traitée uniformément (SOLO et RàI = cadres riches ; RLO = catégorie ciblée ; ACP = métriques ; Graphiques et Habiletés = modes d'affichage)
- Asymétrie d'aide à venir avec les boutons « Guide » pour SOLO et RàI

Ce chantier introduit un **patron uniforme** pour les options d'observation et de dépistage, restructure la hiérarchie pour qu'elle reflète la sémantique fonctionnelle, rend repliables les paramètres avancés RàI, et ajoute un guide pédagogique ACP.

### Décisions cadres prises

- *Niveau d'uniformisation* : cosmétique + réorganisation hiérarchique (les paramètres RàI deviennent sous-options conditionnelles)
- *Guides à créer* : ACP en plus de SOLO et RàI. RLO reste sans guide (jugé « trop expérimental pour l'instant »)
- *Paramètres avancés RàI* : tout repliable dans un pliable unique

### Hors-périmètre

- Pas de modification des autres pages des Réglages (Préférences, Données, À propos)
- Pas de changement de la logique métier (calcul IPB, patterns, ACP, etc.)
- Pas de modification des zones protégées (`config.js`, `navigation.js`, `noms_stables.json`)
- Pas de modification de la structure du système de préférences (juste utilisation des préférences existantes)

---

## 2. Patron de composant uniforme

### 2.1 Structure HTML cible

Chaque option d'observation suit cette structure exacte :

```html
<div class="option-accompagnement" data-option="solo">
    <div class="option-accompagnement-tete">
        <label class="option-accompagnement-checkbox">
            <input type="checkbox" id="v2-pref-solo" data-on-change="sauvegarderPreferencesV2">
            <span class="option-accompagnement-titre">Taxonomie SOLO</span>
        </label>
        <button class="option-accompagnement-guide-btn" data-action="ouvrirGuideSolo" title="Guide SOLO">
            <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
        </button>
    </div>
    <p class="option-accompagnement-description">
        Active la taxonomie SOLO dans Labo Codex : descriptions des niveaux dans l'Accompagnement, tampons Compréhension dans la palette d'annotation, guide pédagogique, et affichage des niveaux SOLO dans l'éditeur d'échelle de performance.
    </p>
    <div class="option-accompagnement-sous-options" data-condition="solo-active">
        <!-- Sous-options (vide pour SOLO, présent pour ACP et RàI) -->
    </div>
</div>
```

Quatre éléments composent le patron :
- *Tête* : checkbox + titre + (optionnel) bouton Guide
- *Description* : 1-3 phrases sur ce que l'option active
- *Sous-options* : zone conditionnelle, visible seulement quand la checkbox est cochée
- *Bouton Guide* : présent ou absent selon que l'option a un guide pédagogique défini

### 2.2 Styles CSS à ajouter dans `styles.css`

```css
/* ============================================
   PATRON OPTION ACCOMPAGNEMENT (uniformisé)
   ============================================ */

.option-accompagnement {
    background: var(--bleu-tres-pale);
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 12px;
    transition: opacity 0.2s ease;
}

.option-accompagnement-tete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
}

.option-accompagnement-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex: 1;
}

.option-accompagnement-titre {
    font-weight: 600;
    color: var(--texte-principal);
}

.option-accompagnement-guide-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: var(--texte-principal);
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
}
.option-accompagnement-guide-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.28);
}

.option-accompagnement-description {
    font-size: 0.85rem;
    color: var(--gris-moyen);
    margin: 4px 0 0 28px;
    line-height: 1.5;
}

.option-accompagnement-sous-options {
    margin: 10px 0 0 28px;
    padding-top: 10px;
    border-top: 1px dashed rgba(255, 255, 255, 0.10);
}

/* État désactivé : sous-options masquées, opacité réduite sur le bloc entier */
.option-accompagnement:has(input[type="checkbox"]:not(:checked)) .option-accompagnement-sous-options {
    display: none;
}
.option-accompagnement:has(input[type="checkbox"]:not(:checked)) {
    opacity: 0.75;
}

/* ============================================
   PARAMÈTRES AVANCÉS REPLIABLES (RàI)
   ============================================ */

.parametres-avances-pliable {
    margin-top: 12px;
}
.parametres-avances-pliable summary {
    cursor: pointer;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--texte-principal);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
}
.parametres-avances-pliable summary::before {
    content: '▶';
    transition: transform 0.2s ease;
    font-size: 0.75rem;
    color: var(--gris-moyen);
}
.parametres-avances-pliable[open] summary::before {
    transform: rotate(90deg);
}
.parametres-avances-pliable summary:hover {
    background: rgba(255, 255, 255, 0.08);
}
.parametres-avances-pliable-contenu {
    padding: 14px 16px;
    margin-top: 4px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 4px;
}
```

**Note technique sur `:has()`** : le sélecteur CSS `:has()` est supporté dans Safari 15.4+, Chrome 105+, Firefox 121+. Sur les versions cibles de l'app (MacBook M3 macOS Sequoia 26.3.1 et iPad iPadOS 26.5), c'est large support. Si fallback nécessaire, on peut basculer en JavaScript qui ajoute/retire une classe `option-accompagnement--desactive` selon l'état de la checkbox.

---

## 3. Refonte de la page Accompagnement

### 3.1 Carte 1 : Outils d'observation

Cinq options uniformisées. **Ordre conservé** mais structure HTML refondue selon le patron.

| Option | ID checkbox | Préférence | Guide |
|---|---|---|---|
| Taxonomie SOLO | `v2-pref-solo` | `afficherDescriptionsSOLO` | Oui (chantier SOLO) |
| Observation des actions | `v2-pref-actions-rlo` | `activerActionsRLO` | Non |
| Micro données ACP | `v2-pref-depistage-acp` | `depistageAcp` | Oui (nouveau, voir §5) |
| Graphiques d'évolution | `v2-pref-graphiques` | `afficherGraphiques` | Non |
| Développement des habiletés | `v2-pref-developpement-habiletes` | `afficherDeveloppementHabiletes` | Non |

**Sous-options actuelles à conserver dans la nouvelle structure** :
- *ACP* : sélecteur « Unité d'affichage de l'assiduité » va dans `.option-accompagnement-sous-options`
- *Autres options* : pas de sous-options actuellement

### 3.2 Carte 2 : Dépistage (RàI)

Une seule option principale (Système RàI), avec toutes les autres configurations en **sous-options conditionnelles**.

**Restructuration** :

```html
<div class="carte">
    <h3 class="carte-titre-bleu">Dépistage (RàI)</h3>
    <p class="text-muted u-mb-15 u-texte-09">
        Paramètres pour le suivi des fondamentaux et les niveaux d'intervention.
        Le dépistage nécessite d'utiliser <strong>la même grille et la même échelle</strong> pour tous les artefacts évalués durant le trimestre.
    </p>

    <div class="option-accompagnement" data-option="rai">
        <div class="option-accompagnement-tete">
            <label class="option-accompagnement-checkbox">
                <input type="checkbox" id="v2-pref-rai" checked data-on-change="sauvegarderPreferencesV2">
                <span class="option-accompagnement-titre">Activer le système RàI</span>
            </label>
            <button class="option-accompagnement-guide-btn" data-action="ouvrirGuideRai" title="Guide RàI">
                <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
            </button>
        </div>
        <p class="option-accompagnement-description">
            Active les deux barres de dépistage dans la sous-section Intervenir : <strong>Suivi des fondamentaux</strong> (progression stable, défi spécifique, difficulté émergente, difficulté persistante) et <strong>Niveaux d'intervention</strong> (universel, préventif, intensif).
        </p>
        <div class="option-accompagnement-sous-options">
            <!-- Grille de critères pour le dépistage -->
            <div class="groupe-form u-mb-15">
                <label for="v2-pref-grille-reference" class="u-texte-gras" style="display: block; margin-bottom: 6px" data-tooltip="depist-grille">
                    Grille de critères pour le dépistage
                </label>
                <select id="v2-pref-grille-reference" class="controle-form" data-on-change="sauvegarderPreferencesV2">
                    <option value="">-- Sélectionner une grille --</option>
                </select>
                <small class="u-mt-6 u-texte-petit" style="display: block; color: var(--gris-moyen)">
                    Cette grille définit les critères utilisés pour identifier les forces et défis des étudiants.
                </small>
            </div>

            <!-- Paramètres avancés repliables -->
            <details class="parametres-avances-pliable">
                <summary>Paramètres avancés</summary>
                <div class="parametres-avances-pliable-contenu">

                    <!-- Découpler P et N -->
                    <div class="groupe-form u-mb-15">
                        <label class="u-align-center" style="cursor: pointer; display: flex" data-tooltip="depist-decoupler-pn">
                            <input type="checkbox" id="v2-pref-decoupler-pn" data-on-change="sauvegarderPreferencesV2">
                            <strong style="margin-left: 8px;">Découpler Performance (P) et Niveau d'attention (N)</strong>
                        </label>
                        <small class="u-texte-petit" style="display: block; color: var(--gris-moyen); margin-top: 8px; margin-left: 28px; line-height: 1.5">
                            <strong>P (notation)</strong> : Utilise la méthode de la pratique pour calculer la note finale.<br>
                            <strong>N (dépistage)</strong> : Toujours basé sur les N dernières productions pour détecter les tendances.<br>
                            <em>Recommandé avec « N meilleurs » pour valoriser le progrès tout en identifiant les besoins d'intervention.</em>
                        </small>
                    </div>

                    <!-- Fenêtre d'analyse -->
                    <div class="groupe-form u-mb-15">
                        <label for="v2-pref-fenetre-patterns" class="u-mb-8 u-texte-gras" style="display: block" data-tooltip="depist-fenetre">
                            Fenêtre d'analyse des patterns
                        </label>
                        <div class="u-flex-gap-10 u-align-center">
                            <input type="number" id="v2-pref-fenetre-patterns" class="controle-form" value="3" min="3" max="12" style="width: 80px;" data-on-change="sauvegarderPreferencesV2">
                            <span class="u-texte-09">dernières productions</span>
                        </div>
                        <small class="u-texte-petit" style="display: block; color: var(--gris-moyen); margin-top: 8px">
                            Valeur basse = détection précoce | Valeur élevée = détection plus fiable
                        </small>
                    </div>

                    <!-- Seuils de détection avancés -->
                    <h4 class="u-texte-moyen u-texte-bleu" style="margin: 15px 0 12px 0">Seuils de détection</h4>

                    <!-- Seuil progression (HTML existant à conserver) -->
                    <!-- ... -->

                    <!-- Direction du risque (HTML existant à conserver) -->
                    <!-- ... -->

                </div>
            </details>
        </div>
    </div>
</div>
```

### 3.3 Conséquence : tous les paramètres RàI dans le `<details>`

Le `<details>/<summary>` HTML5 natif gère l'état ouvert/fermé sans JavaScript. Comportement par défaut : fermé. L'enseignant clique pour déplier les paramètres avancés.

Avantage : l'utilisateur qui ne s'intéresse qu'à activer/désactiver la RàI voit une page très propre. Celui qui veut configurer en profondeur déplie une fois et garde l'état pendant sa session.

---

## 4. Conséquences sur les plans SOLO et RàI

Les plans `PLAN_taxonomie_SOLO.md` et `PLAN_guide_RaI.md` décrivaient les boutons Guide avec une structure ad-hoc. Ils doivent maintenant utiliser le patron uniforme défini ici.

### Modification à apporter au plan SOLO

Dans le chantier 2 du plan SOLO (Guide), section « Wiring des boutons » :
- Remplacer l'exemple HTML du bouton dans l'Accompagnement par le patron `.option-accompagnement-guide-btn` défini ici
- Le bouton est désormais dans la tête de l'option SOLO, à droite de la checkbox

### Modification à apporter au plan RàI

Idem dans la section « Points d'accès » : le bouton « Guide RàI » dans l'Accompagnement utilise le patron `.option-accompagnement-guide-btn`. Pour le bouton dans le module Interventions, le patron peut être différent (autre contexte d'usage) – à laisser à Claude Code.

### Pas de conflit d'ordre d'exécution

Si l'uniformisation est exécutée AVANT les chantiers SOLO et RàI, le patron est en place et les chantiers s'y intègrent naturellement. Si elle est exécutée APRÈS, il faut adapter le HTML déjà ajouté pour SOLO et RàI. **Recommandation** : exécuter l'uniformisation en premier.

---

## 5. Nouveau guide ACP (3 pages)

### 5.1 Architecture

Nouveau fichier `js/guide-acp.js`, sur le même modèle que `js/guide-solo.js` et `js/guide-rai.js`. Panneau HTML `#guide-acp-panel` dans `index.html`. Styles CSS avec préfixe `guide-acp-*`.

Bouton d'accès uniquement depuis la page Réglages > Accompagnement (l'option ACP dans la carte « Outils d'observation »). Pas de point d'accès secondaire pour l'instant.

### 5.2 Contenu des 3 pages

#### Page 1 — Qu'est-ce qu'ACP ?

```html
<p><strong>ACP</strong> est l'acronyme de trois indices descriptifs qui mesurent l'engagement et la performance d'un étudiant dans le cours :</p>

<ul>
    <li><strong>A</strong> — <strong>Assiduité</strong> : la proportion des périodes du trimestre auxquelles l'étudiant a été présent.</li>
    <li><strong>C</strong> — <strong>Complétion</strong> : la proportion des productions attendues qui ont été remises.</li>
    <li><strong>P</strong> — <strong>Performance</strong> : la note pondérée obtenue selon la pratique de notation choisie.</li>
</ul>

<p>Ces trois indices, pris ensemble, fournissent un portrait rapide de la situation de chaque étudiant. Ils sont calculés automatiquement à partir des présences saisies et des productions évaluées – aucune saisie supplémentaire requise.</p>

<p>Dans Labo Codex, ACP est utilisé dans plusieurs zones :</p>
<ul>
    <li>Section « Engagement ACP » du profil individuel</li>
    <li>Section « Progression temporelle ACP » du profil (si Graphiques d'évolution activé)</li>
    <li>Vue d'ensemble du tableau de bord (Aperçu)</li>
</ul>

<div class="guide-acp-astuce">ACP est un cadre de lecture interne à Labo Codex, sans référence académique externe. C'est un outil de bord pour l'enseignant, pas un instrument de mesure standardisé.</div>
```

#### Page 2 — Les trois indices en détail

```html
<h4>A — Assiduité</h4>
<p>L'indice A se calcule à partir des présences enregistrées dans le module Suivi → Saisie des présences. Une présence enregistrée pour une période compte ; une absence (justifiée ou non) ne compte pas.</p>
<p>L'unité d'affichage peut être configurée dans les réglages : périodes (par défaut), heures, ou les deux.</p>

<h4>C — Complétion</h4>
<p>L'indice C se calcule à partir des productions attendues dans le trimestre. Une production est « complétée » dès qu'elle est remise, indépendamment de la note obtenue. Les productions à venir ne pénalisent pas C tant que leur date d'échéance n'est pas passée.</p>
<p>Calcul : <code>C = productions remises / productions attendues échues</code></p>

<h4>P — Performance</h4>
<p>L'indice P est la note pondérée de l'étudiant selon la pratique de notation active (PAN-Maîtrise, sommative classique, autre). Il ne représente <em>pas</em> la note finale du trimestre, mais une projection courante basée sur les productions déjà évaluées.</p>

<div class="guide-acp-astuce">Les trois indices sont indépendants. Un étudiant peut avoir A élevé (toujours présent) mais C faible (ne remet pas ses travaux), ou C élevé (remet tout) mais P faible (résultats faibles). Lire les trois ensemble donne un portrait riche que la seule note ne donne pas.</div>
```

#### Page 3 — Utiliser ACP en classe

```html
<p>ACP éclaire trois types de situations courantes :</p>

<h4>Repérer les étudiants qui décrochent</h4>
<p>Quand A et C baissent ensemble sur quelques semaines, c'est un signal de désengagement précoce, souvent avant que P ne se dégrade. Intervention recommandée : prise de contact, conversation sur les obstacles.</p>

<h4>Distinguer effort et résultat</h4>
<p>Un étudiant avec C élevé et P faible fait l'effort mais ne maîtrise pas. L'intervention vise les compétences (revoir la grille de dépistage, identifier les critères en défi).</p>
<p>Un étudiant avec C faible et P moyen ou élevé sur ce qu'il remet a peut-être un problème de planification ou de motivation, pas de compréhension. L'intervention vise l'organisation et l'engagement.</p>

<h4>Identifier les patterns de classe</h4>
<p>Si A de la classe baisse sur une période, c'est probablement un signal contextuel (semaine de partiels ailleurs, météo, etc.) – pas un problème individuel à intensifier. Si C baisse sur une production particulière, c'est peut-être que sa consigne ou son échéance est mal calibrée.</p>

<div class="guide-acp-astuce">ACP est un cadre simple, pas un diagnostic. Croisé avec les patterns RàI (si activés) et les niveaux SOLO (si activés), il devient un outil de jugement professionnel riche – à manier avec discernement.</div>
```

### 5.3 Bouton d'accès

Dans la carte « Outils d'observation », l'option ACP utilise le patron uniforme avec un bouton Guide :

```html
<div class="option-accompagnement" data-option="acp">
    <div class="option-accompagnement-tete">
        <label class="option-accompagnement-checkbox">
            <input type="checkbox" id="v2-pref-depistage-acp" checked data-on-change="sauvegarderPreferencesV2">
            <span class="option-accompagnement-titre">Micro données ACP</span>
        </label>
        <button class="option-accompagnement-guide-btn" data-action="ouvrirGuideAcp" title="Guide ACP">
            <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Guide
        </button>
    </div>
    <p class="option-accompagnement-description">
        Indices descriptifs Assiduité, Complétion et Performance. Affichés dans la section « Engagement ACP » du profil individuel.
    </p>
    <div class="option-accompagnement-sous-options">
        <div class="groupe-form">
            <label for="v2-pref-unite-affichage" class="u-texte-petit" style="display: block; margin-bottom: 4px" data-tooltip="pref-affichage-assiduite">
                Unité d'affichage de l'assiduité (A)
            </label>
            <select id="v2-pref-unite-affichage" class="controle-form u-texte-petit" data-on-change="sauvegarderPreferencesV2" style="max-width: 250px;">
                <option value="periodes">Périodes (ex: 12/14 périodes)</option>
                <option value="heures">Heures (ex: 11.0h/12.8h)</option>
                <option value="les-deux">Les deux (périodes et heures)</option>
            </select>
        </div>
    </div>
</div>
```

---

## 6. Tests fonctionnels

### Test 1 — Uniformité visuelle
- Ouvrir Réglages > Accompagnement. Vérifier que les cinq options de « Outils d'observation » ont une apparence visuelle identique (même fond, mêmes marges, même typographie).
- Vérifier que la carte « Dépistage (RàI) » a la même option principale visuelle que les cinq précédentes.

### Test 2 — Sous-options conditionnelles
- Décocher la checkbox « Activer le système RàI ». Vérifier que la sous-option « Grille de critères pour le dépistage » disparaît et que le pliable « Paramètres avancés » disparaît.
- Recocher. Vérifier qu'ils réapparaissent.
- Idem pour ACP : décocher « Micro données ACP », vérifier que « Unité d'affichage de l'assiduité » disparaît.

### Test 3 — Pliable des paramètres avancés
- Activer RàI. Vérifier que le pliable « Paramètres avancés » est fermé par défaut.
- Cliquer sur le pliable. Vérifier qu'il s'ouvre, affichant Découpler P/N, Fenêtre d'analyse, Seuils.
- Recliquer. Vérifier qu'il se ferme.

### Test 4 — Boutons Guide
- Cliquer sur le bouton « Guide » à côté de SOLO. Vérifier que le guide SOLO s'ouvre (après que le chantier SOLO soit exécuté).
- Idem pour RàI et ACP.
- Vérifier que les options sans guide (RLO, Graphiques, Habiletés) n'ont pas de bouton Guide.

### Test 5 — Sauvegarde des préférences
- Modifier une sous-option (ex. changer l'unité d'affichage ACP). Vérifier que la préférence est sauvegardée (déclencher `sauvegarderPreferencesV2`).
- Recharger la page. Vérifier que les valeurs sont conservées.

### Test 6 — Mode clair et mode sombre
- Vérifier la lisibilité du patron uniforme dans les deux modes.
- Vérifier les contrastes des boutons Guide, des pliables.

### Test 7 — Accessibilité
- Tab pour atteindre chaque checkbox, bouton Guide, sélecteur, pliable.
- Espace/Entrée pour activer.
- Vérifier que le pliable est annoncé correctement par un lecteur d'écran (le HTML5 `<details>` est nativement accessible).

---

## 7. Points de vigilance

### 7.1 Migration sans casse

La refonte change le HTML mais **conserve tous les `id` des checkboxes et inputs** existants. Les fonctions de lecture/écriture des préférences (`preferences-v2.js`) ne sont pas modifiées. Le seul risque : un sélecteur CSS quelque part dans le projet qui ciblait l'ancien HTML structurel (par exemple `.carte > .form-group:nth-child(...)`). À vérifier en exécution.

### 7.2 Préfixe `.option-accompagnement` vs `.form-group`

Le code existant utilise `.form-group` pour les blocs d'options. Le nouveau patron utilise `.option-accompagnement`. Pour éviter de casser d'autres pages qui utilisent `.form-group`, **on ne renomme pas la classe partout** – on remplace seulement les usages dans cette page. Les autres pages restent en `.form-group`.

### 7.3 Compatibilité `:has()`

Comme noté en 2.2, le sélecteur CSS `:has()` est utilisé pour masquer les sous-options quand la checkbox est décochée. Support large mais pas universel. Si Grégoire teste sur un navigateur ancien, fallback JavaScript :

```javascript
function mettreAJourEtatOptions() {
    document.querySelectorAll('.option-accompagnement').forEach(function(option) {
        var checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
            option.classList.add('option-accompagnement--desactive');
        } else {
            option.classList.remove('option-accompagnement--desactive');
        }
    });
}
// Appeler au chargement et à chaque changement de checkbox
```

Et CSS de fallback :
```css
.option-accompagnement--desactive .option-accompagnement-sous-options { display: none; }
.option-accompagnement--desactive { opacity: 0.75; }
```

### 7.4 Ordre d'exécution recommandé entre les trois chantiers

1. **Cette uniformisation** en premier (introduit le patron)
2. **Chantier SOLO** (utilise le patron pour le bouton Guide SOLO)
3. **Chantier RàI** (utilise le patron pour le bouton Guide RàI)

Cet ordre évite à Claude Code de coder un bouton SOLO ou RàI dans l'ancien patron, puis de devoir le réécrire.

### 7.5 Conservation des `data-tooltip`

Tous les attributs `data-tooltip` existants doivent être conservés dans la nouvelle structure HTML. Ils alimentent le système d'infobulles contextuelles de l'app.

### 7.6 Aucune zone protégée touchée

Ce chantier ne touche pas à `js/config.js`, `js/navigation.js`, ni à `noms_stables.json`. Modifications uniquement dans `index.html`, `styles.css`, et création de `js/guide-acp.js`.

---

## 8. Finalisation

### Numéro de beta
À demander à Grégoire avant le commit.

### Mise à jour du changelog

```javascript
{
    version: 'Beta XX',
    couleur: 'bleu',
    titre: 'Page Accompagnement uniformisée',
    items: [
        'Toutes les options de la page Réglages > Accompagnement adoptent un patron visuel uniforme',
        'Les paramètres RàI deviennent sous-options conditionnelles de l\'activateur principal',
        'Les paramètres avancés RàI sont désormais repliables (fermés par défaut)',
        'Nouveau guide pédagogique ACP en 3 pages, accessible depuis la page Accompagnement',
        'Boutons « Guide » uniformisés à côté des options qui en disposent (SOLO, ACP, RàI)'
    ]
}
```

### Mise à jour de version
- `version.json` à la racine
- Fallback dans `index.html` ligne ~17166

---

**Fin du plan**

*Ce plan doit être exécuté avant les chantiers SOLO (PLAN_taxonomie_SOLO.md) et RàI (PLAN_guide_RaI.md). Il introduit le patron uniforme que ces deux chantiers utiliseront pour leurs boutons Guide. Le guide ACP est créé dans ce chantier-ci, parallèlement à l'uniformisation.*
