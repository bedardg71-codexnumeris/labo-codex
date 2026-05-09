# Audit post-implémentation — Système d'accompagnement

**Statut** : En préparation (19 avril 2026)  
**À exécuter** : Quand Claude Code aura terminé l'implémentation  
**Fichiers de référence** : `docs/refonte-textes/` (blocs 1 à 6)  
**Palette de référence** : `docs/refonte-textes/palette-accompagnement.md`  
**Ébauche visuelle** : `ebauches-accompagnement.html`

---

## Principe

Chaque texte visible par l'utilisateur dans le système d'accompagnement doit correspondre exactement à un texte validé dans `docs/refonte-textes/`, et rien de plus. Tout le reste est suspect.

---

## Axe 1 — Conformité des textes

### 1.1 Info-bulles (`tooltips-contenu.js`)

Pour chaque entrée dans `TOOLTIPS` :

- [ ] La clé existe dans un des fichiers `infobulles-T1-*.md` à `infobulles-T11-*.md`
- [ ] Le texte correspond **exactement** au fichier de référence (pas de reformulation, pas d'ajout)
- [ ] Les clés orphelines (présentes dans le JS mais absentes des fichiers de référence) sont identifiées et marquées `// LEGACY`
- [ ] Aucune clé des fichiers de référence n'est manquante dans le JS

### 1.2 Popups contextuelles (`aide-contextuelle-contenu.js`)

Pour chaque entrée dans `AIDE_CONTEXTUELLE` :

- [ ] Si c'est une entrée `conseil-*`, elle correspond à `popups-aide-contextuelle.md`
- [ ] Les 4 nouvelles entrées sont présentes : `conseil-evaluations`, `conseil-apercu`, `conseil-alignement`, `conseil-pratiques`
- [ ] **Les entrées qui ne sont PAS dans les fichiers de référence** sont inventoriées — elles existaient avant la refonte et n'ont pas été validées. Décision requise : les garder telles quelles, les réécrire, ou les supprimer.

**Problème connu** : L'audit initial a recensé 12 popups (8 réécrites + 4 nouvelles), mais `aide-contextuelle-contenu.js` contient ~38 entrées. Les ~26 entrées non couvertes par la refonte contiennent potentiellement du texte non validé (ex. : la modale «Planifier et documenter les interventions RàI» avec le cycle «teach-test-revise-test»).

### 1.3 Tour guidé (`guidage.js`)

- [ ] Les 6 étapes correspondent exactement à `tour-guide-bloc5.md`
- [ ] Aucune étape supplémentaire n'a été ajoutée
- [ ] Les textes des boutons d'action correspondent

### 1.4 États vides (`etats-vides.js`)

- [ ] Les 15 textes correspondent à `textes-manquants-bloc4.md`
- [ ] Aucun texte d'état vide supplémentaire n'a été inventé

### 1.5 Bannière et transitions

- [ ] Le texte de la bannière d'accueil correspond à `textes-manquants-bloc4.md`
- [ ] Les 3 textes de transition correspondent

### 1.6 Glossaire

- [ ] Si implémenté : les termes et définitions correspondent à `glossaire-bloc6.md`

---

## Axe 2 — Logique des états vides (faux positifs)

**Problème constaté** : Le système affiche «Clique ici pour créer ta première échelle de performance» alors que des échelles existent déjà dans la sidebar. Même problème observé avec les grilles (fix local appliqué par Claude Code).

### Vérifications

Pour chaque état vide / message de guidage contextuel :

- [ ] **La condition de détection est correcte** — elle vérifie la présence réelle de données, pas un flag booléen ou une préférence
- [ ] **La condition couvre tous les cas** : données réelles, données démo, données importées
- [ ] **Pas de fix locaux** — si le problème est systémique (mauvaise condition de détection), la correction doit être systémique, pas un patch par section

### Sections à vérifier explicitement

| Section | Condition attendue | Vérifier |
|---------|-------------------|----------|
| Structure — Productions | `productions.length > 0` | Données réelles ET démo |
| Structure — Grilles | `grilles.length > 0` | Données réelles ET démo |
| Structure — Échelles | `echelles.length > 0` | Données réelles ET démo |
| Structure — Cartouches | `cartouches.length > 0` | Données réelles ET démo |
| Structure — Pratiques | `pratiques.length > 0` | Données réelles ET démo |
| Évaluations — Liste | évaluations enregistrées | Données réelles ET démo |
| Travaux — Import | fichiers importés | Données réelles ET démo |
| Tableau de bord — Aperçu | données A-C-P calculées | Données réelles ET démo |
| Tableau de bord — Interventions | interventions planifiées | Données réelles ET démo |
| Planification — Alignement | nœuds dans la carte | Données réelles ET démo |
| Planification — Organisateur | séquences définies | Données réelles ET démo |

### Critère de réussite

Activer les données démo → aucun message «crée ta première X» ne doit apparaître.
Créer un seul élément dans une section → le message d'état vide de cette section doit disparaître.

---

## Axe 3 — Palette visuelle

### 3.1 Variables CSS

- [ ] Les variables `--acc-*` sont définies dans `:root` de `styles.css`
- [ ] Elles ne sont PAS redéfinies dans `.mode-clair`
- [ ] Les valeurs correspondent à `palette-accompagnement.md`

### 3.2 Application aux composants

Pour chaque composant d'accompagnement :

- [ ] Le fond utilise `var(--acc-fond)` (orange `#e8923a`)
- [ ] Le texte utilise `var(--acc-texte)` (brun foncé `#2a1404`)
- [ ] Les bordures utilisent `var(--acc-bordure)`
- [ ] Les boutons utilisent `var(--acc-btn-prim)` / `var(--acc-btn-sec-*)`
- [ ] L'apparence est **identique** en mode sombre et mode clair

### 3.3 Zéro style inline

- [ ] Aucun attribut `style=` dans les fichiers d'accompagnement : `guidage.js`, `etats-vides.js`, `transitions.js`, `glossaire.js`, `glossaire-data.js`, `aide-contextuelle-contenu.js`, `aide-contextuelle.js`, `tooltips-contenu.js`, `accueil.js`
- [ ] Aucun `element.style.xxx = ...` dans le JS des composants d'accompagnement
- [ ] Les couleurs en dur (hex, rgb, rgba) dans le CSS des composants d'accompagnement utilisent les variables `--acc-*`, pas des valeurs littérales

---

## Axe 4 — Textes non approuvés

### Inventaire des modales hors périmètre

Les entrées suivantes dans `aide-contextuelle-contenu.js` n'ont PAS été couvertes par la refonte. Elles doivent être auditées individuellement :

- [ ] `construction-objectifs-reflexion` — contenu validé ?
- [ ] `structure-apercu-legacy` — contenu validé ?
- [ ] `evaluations-proceder` — contenu validé ?
- [ ] `evaluations-annoter` — contenu validé ?
- [ ] `evaluations-liste` — contenu validé ?
- [ ] `bibliotheque-fonctionnement` — contenu validé ? (contient 3 styles inline connus)
- [ ] `profil-etudiant-indicateurs` — contenu validé ?
- [ ] `profil-etudiant-accompagnement` — contenu validé ?
- [ ] `interventions-planification` — **contenu suspect** (cycle teach-test-revise-test, mentions API/conseiller pédagogique)
- [ ] `suivi-apprentissage-fondamentaux` — contenu validé ?
- [ ] `tableau-bord-apercu` — doublon avec `conseil-apercu` ?
- [ ] `contexte-trimestre` — doublon avec `conseil-*` ?
- [ ] `contexte-cours` — doublon avec `conseil-cours` ?
- [ ] `contexte-horaire` — doublon avec `conseil-horaire` ?
- [ ] `contexte-groupe-etudiants` — doublon avec `conseil-groupe` ?
- [ ] `depistage-interpretation` — doublon avec `conseil-interpretation` ?
- [ ] `planification-alignement` — doublon avec `conseil-alignement` ?
- [ ] `suivi-liste` — contenu validé ?
- [ ] `contexte-calendrier` — contenu validé ?
- [ ] `apercu-contenu` — contenu validé ?
- [ ] `tableau-bord-rai` — contenu validé ?
- [ ] `suivi-saisie` — contenu validé ?
- [ ] `apc-activite`, `apc-grille-individuel` — contenu validé ?
- [ ] `objectif-verbes-actifs` — contenu validé ?
- [ ] `echeance-indices`, `echeances-multigroupes` — contenu validé ?
- [ ] `retroaction-grille-descriptive` — contenu validé ?
- [ ] `categories-selection-obligatoires` — contenu validé ?
- [ ] `echelle-plage-notes`, `echelle-valeur-ponctuelle` — contenu validé ?
- [ ] `grille-type-critere-detail` — contenu validé ?
- [ ] `grille-niveau-solo` — contenu validé ?

**Attention aux doublons** : Certaines entrées semblent couvrir le même sujet qu'un `conseil-*` validé. Il faut décider : fusionner, remplacer, ou garder les deux.

---

## Axe 5 — Cohérence transversale

### 5.1 Jetons

Dans tous les fichiers JS, vérifier que les jetons sont décrits comme :
- «une nouvelle occasion de démontrer sa compétence ou son habileté»
- PAS «améliorer sa note» ou «démontrer sa progression»

### 5.2 Productions

- Dans Structure / Construction de la note : vocabulaire évaluatif OK (pondérations, grilles, note)
- Dans Planification : «mises en pratique, exercices d'application» — PAS «travaux évaluatifs»

### 5.3 Indices A-C-P

- A = exposition aux situations d'apprentissage (pas «qualité de la participation»)
- C = régularité de la mise en pratique (pas «qualité du travail»)
- P = compétence au moment T (pas «pronostic»)
- Lecture subjective mentionnée quand pertinent

### 5.4 IPB → ACO

- Aucune mention de «IPB» ou «Indice de Persistance du Blocage» dans le code
- Remplacé par ACO (Actions Cognitives Observées)
- RLO → profil ACO (pas «profil RLO»)

### 5.5 Cartouche

- Toujours «commentaires généraux automatiques» — pas juste «commentaires automatiques»

---

## Axe 6 — Intégrité technique

- [ ] Aucun handler inline (`onclick=`, `onchange=`, etc.) dans le HTML généré par les composants d'accompagnement
- [ ] Tout `innerHTML` avec données utilisateur passe par `echapperHtml()`
- [ ] Aucun `console.log` — seulement `console.warn` / `console.error`
- [ ] Les nouveaux fichiers JS sont chargés dans `index.html` dans le bon ordre de dépendance
- [ ] Les préférences du tour guidé (`tourGuide_etape`, `tourGuide_complete`, `tourGuide_etapes_vues`) ne sont PAS préfixées par trimestre

---

## Procédure d'exécution

1. **Lire ce document en entier** avant de commencer
2. **Axe 1** en premier — c'est le plus critique (textes non conformes)
3. **Axe 2** ensuite — les faux positifs d'états vides cassent l'expérience
4. **Axe 4** — inventorier les modales non couvertes, signaler à Grégoire pour décision
5. **Axe 3** — appliquer la palette orange
6. **Axe 5** — vérification transversale des termes
7. **Axe 6** — vérification technique
8. **Tester** les 4 scénarios du plan d'implémentation (néophyte complet, néophyte + démo, utilisateur existant, iPad)
