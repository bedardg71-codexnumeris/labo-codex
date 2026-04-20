# Plan — Mode exercice : la démo comme matériel pédagogique d'autonomisation

**Date** : 20 avril 2026 (brainstorming session post-audit terrain iPad)
**Statut** : Cadrage à valider — pas encore d'implémentation planifiée
**Philosophie-clé** : ne plus traiter les données de démonstration comme une simple *illustration* de l'application, mais comme du **matériel pédagogique** qui aide l'enseignant à s'approprier l'outil en construisant progressivement son propre groupe-cours.

---

## 1. Contexte et motivation

### 1.1 Observation terrain (LOG UX 20 avril)

L'audit iPad du 20 avril révèle plusieurs frictions récurrentes pour un nouvel utilisateur :
- Le tour guidé propose de « configurer son vrai trimestre » dès l'étape 1, mais l'utilisateur en mode découverte ne veut pas encore saisir ses vraies dates.
- Le mode démo actuel charge des données fictives en bloc, l'utilisateur explore, puis **tout est détruit au refresh** — effet déceptif.
- L'utilisateur demande explicitement une « option remplir par défaut » pour tester sans repartir à zéro à chaque fois.
- Les 3 approches offertes (Découvrir / Parcourir / Piloter) sont conceptuelles et peu actionnables.

### 1.2 Insight utilisateur (20 avril, post-chantier accompagnement unifié)

> « En réalité, il s'agit d'utiliser du matériel que nous avons créé pour ne pas seulement "illustrer" l'application, mais bien s'en servir à des fins pédagogiques d'autonomisation de l'utilisateur. »

**Changement de paradigme** : la démo n'est plus une vitrine — c'est un **gabarit** que l'enseignant transforme en son propre groupe-cours. Il apprend l'outil en manipulant du matériel réaliste mais éditable, une étape à la fois.

### 1.3 Limite du mode démo actuel

- Bascule tout-ou-rien (mode démo actif ou pas) avec snapshot et décharge au refresh
- Pas de ponts entre l'exploration et la création de vraies données
- Confusion possible : l'utilisateur pense avoir sauvegardé, mais tout disparaît
- Contradictions observées entre bandeau démo et checkbox (bug corrigé commit `e8f8159`)

---

## 2. Vision d'ensemble

### 2.1 Principe

Chaque formulaire de création du parcours (Trimestre, Cours, Enseignant, Groupe d'étudiants, Horaire, Groupe-cours) expose un bouton **« Remplir avec les données par défaut »**. Au clic, les champs sont pré-remplis avec des valeurs réalistes issues du jeu démo. L'utilisateur édite librement avant de sauvegarder. Les entités sont écrites dans le stockage réel dès la première étape.

### 2.2 Deux intentions possibles — à déclarer explicitement

Au **démarrage du parcours**, une modale demande à l'utilisateur :

1. **« Je configure mon vrai trimestre »** — parcours classique, scaffolding disponible à chaque étape, entités sauvegardées comme données réelles, aucun traitement spécial.
2. **« Je m'exerce »** — même scaffolding, mais chaque entité créée porte le **tag `estExercice: true`**. Bandeau visible pendant toute la session. À la sortie, prompt de réconciliation :
   - **« Garder comme vraies données »** → retrait du tag `estExercice` sur toutes les entités créées.
   - **« Tout effacer »** → suppression propre des entités taguées exercice.

### 2.3 Ce que ça remplace

- **Mode démo actuel** (chargement en bloc + snapshot + décharge) : devient obsolète pour l'usage onboarding. Conservé éventuellement comme « bac à sable » d'exploration pure (sans création) — à trancher.
- **Modale de bienvenue 3 approches** (retirée commit `e8f8159`) : la bannière accueil V3 + la modale d'intention du parcours suffisent.

### 2.4 Consolidation avec l'idée « double tour guidé »

Ce plan unifie l'idée précédente du 20 avril (`project_double_tour_guide.md`). Les deux tours proposés deviennent :
- **Tour exploration** → intention « Je m'exerce » (même moteur, variante du scaffolding).
- **Tour création** → intention « Je configure mon vrai trimestre ».

---

## 3. Design du flow utilisateur

### 3.1 Entrée : déclaration d'intention

Déclencheur : clic sur « Commencer la visite guidée » (accueil V3 CTA) ou « Aller aux Réglages » si vide.

Modale :

```
┌──────────────────────────────────────────────────────┐
│  Prêt à configurer ton premier groupe-cours ?        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ○ Je configure mon vrai trimestre                   │
│     Tu pourras partir de zéro ou te servir de nos    │
│     valeurs par défaut comme gabarit de départ.      │
│                                                      │
│  ○ Je m'exerce pour comprendre l'outil               │
│     Tu pourras créer un groupe-cours fictif, puis    │
│     décider à la fin si tu le gardes ou l'effaces.   │
│                                                      │
│                                        [ Continuer ] │
└──────────────────────────────────────────────────────┘
```

### 3.2 Pendant le parcours : scaffolding par formulaire

Chaque formulaire de création (6 étapes du parcours : Trimestre, Cours, Enseignant, Étudiants, Horaire, Groupe-cours) porte :

- Un **bouton primaire secondaire « Remplir avec les données par défaut »** en tête du formulaire
- Au clic : tous les champs sont pré-remplis avec les valeurs correspondantes du jeu démo (ex. trimestre « Hiver 2026 », cours « 604-101-MQ Français », enseignant « Claude Exemple », 25 étudiants fictifs, horaire Lundi/Mercredi 8h-10h)
- L'utilisateur peut **écraser, ajuster ou vider** tout champ
- **Règle d'écrasement** à trancher (§4 question ouverte)

Si mode « Je m'exerce », un **bandeau persistant** en haut de l'écran :

```
🧪 Mode exercice — tu t'exerces avec des données fictives. [Transformer en vraies données] [Tout effacer]
```

### 3.3 Sortie : réconciliation (mode exercice seulement)

Déclencheurs :
- Clic sur « Tout effacer » ou « Transformer en vraies données » dans le bandeau
- Clic sur « Quitter l'exercice » dans un menu dédié
- Au prochain démarrage d'application si des entités taguées exercice subsistent (rappel proactif)

Modale de réconciliation :

```
┌──────────────────────────────────────────────────────┐
│  Tu as créé un trimestre, un cours et 25 étudiants   │
│  en mode exercice.                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Que veux-tu en faire ?                              │
│                                                      │
│  [ Garder comme vraies données ]                     │
│     Retire le tag « exercice ». Ces données          │
│     deviennent ton vrai trimestre.                   │
│                                                      │
│  [ Tout effacer ]                                    │
│     Supprime propre des entités créées. Confirmation │
│     requise.                                         │
│                                                      │
│  [ Continuer l'exercice ]                            │
│     Reprendre plus tard.                             │
└──────────────────────────────────────────────────────┘
```

### 3.4 Signalisation visuelle

Pendant la session exercice, chaque carte/liste affichant une entité taguée exercice porte un marqueur subtil (icône 🧪 ou bandeau orange discret). Évite la confusion même si l'utilisateur a d'autres entités réelles dans son stockage.

---

## 4. Questions ouvertes

### 4.1 Schéma de donnée pour le tag « exercice »

Trois options :
- **A. Flag sur chaque entité** : `{ ...entite, estExercice: true }`. Simple, peu intrusif. Besoin de filtrer partout où on liste/compte.
- **B. Collection séparée** : `trimestres_exercice`, `cours_exercice`, etc. Claire séparation, mais duplique la logique de lecture/écriture dans chaque module.
- **C. Trimestre dédié** : exercice = nouveau trimestre dont l'ID débute par `exo_`, toutes ses entités sont filles. Réutilise le namespacing existant (`h2026_groupeEtudiants` → `exo_XXXX_groupeEtudiants`).

**Recommandation : option C** — s'appuie sur le namespacing existant, minimise les changements de code, isolation naturelle. Seule exigence : le sélecteur de trimestre doit masquer les trimestres `exo_*` sauf en mode exercice actif.

### 4.2 Contraintes d'intégrité

Peut-on référencer entre exercice et réel ?
- Non par défaut — un cours exercice ne peut pas référencer une grille réelle, et vice versa.
- Conversion exercice → réel : promeut tout le trimestre d'un coup, tous les références internes restent valides.
- Conversion partielle (un seul cours du trimestre exercice en réel) : non supportée — complexité trop élevée pour un bénéfice douteux.

### 4.3 Règle d'écrasement du bouton « Remplir par défaut »

- Toujours écraser tous les champs, même remplis (comme un « reset to defaults »).
- OU ne remplir que les champs vides (préserve les ajustements déjà faits).

**Recommandation** : écraser tous les champs, avec confirmation si certains sont déjà remplis. Simple et prévisible.

### 4.4 Périmètre des formulaires scaffoldés

- **Minimum** : les 6 étapes de création du groupe-cours (Trimestre, Cours, Enseignant, Étudiants, Horaire, Groupe-cours).
- **Étendu** : aussi les entités de Structure (grilles, échelles, cartouches, productions, pratiques).

**Recommandation** : démarrer avec le minimum (6 étapes), étendre à Structure plus tard en mesurant l'usage réel.

### 4.5 Mode démo actuel

Deux scénarios :
- **Le déprécier** dès que le mode exercice est livré. Retirer `js/donnees-demo.js` dans une phase de nettoyage.
- **Le garder en parallèle** pour l'exploration pure (lire sans modifier).

**Recommandation** : le garder en parallèle en Phase 1 de livraison, puis trancher selon l'usage terrain. Le mode démo a un avantage — il offre un aperçu complet (graphiques, profil étudiant avec historique) que le scaffolding progressif ne peut pas donner immédiatement.

### 4.6 Migration des utilisateurs existants

Personne n'a encore de tag `estExercice` ni de trimestre `exo_*`. Pas de migration nécessaire — le mode exercice est opt-in à partir de son activation.

---

## 5. Architecture technique (esquisse)

### 5.1 Nouveau module `js/mode-exercice.js`

API publique :
```javascript
window.modeExercice = {
    demarrer(intention),        // 'reel' | 'exercice'
    estActif(),                 // true si mode exercice en cours
    transformerEnReel(),        // retire tag sur toutes les entités
    toutEffacer(),              // supprime toutes les entités exercice
    reconcilier(),              // ouvre modale de sortie
    remplirFormulaire(idFormulaire),  // scaffolding d'un formulaire donné
    gabaritPour(nomEntite)      // lecture du gabarit démo pour un type donné
};
```

État interne :
- `modeExerciceActif: boolean` (préférence utilisateur)
- Trimestre `exo_*` actuellement en cours de création

### 5.2 Gabarits de scaffolding

Extraction depuis `js/donnees-demo.js` (déjà existants). Les valeurs par défaut des 6 formulaires y sont définies comme un jeu cohérent. Exposer chaque entité individuellement via `gabaritPour('trimestre')`, `gabaritPour('cours')`, etc.

### 5.3 Intégration avec accompagnement.js

Le tour guidé (6 étapes, `ETAPES_TOUR`) reste intact. Le scaffolding est orthogonal — il opère au niveau des formulaires, pas du tour. L'intention (réel/exercice) est lue par les formulaires pour afficher ou masquer le bandeau exercice.

### 5.4 UI

- Nouvelle modale de déclaration d'intention (à câbler au CTA accueil « Commencer la visite guidée »)
- Bouton « Remplir avec les données par défaut » ajouté à chaque formulaire (template partagé)
- Bandeau persistant mode exercice (variante visuelle du bandeau démo actuel pour ne pas confondre)
- Modale de réconciliation
- Marqueur 🧪 sur les cartes/listes des entités exercice

---

## 6. Phases de livraison proposées

1. **Phase 1 — Schéma et API** : trimestre `exo_*`, namespacing, module `mode-exercice.js` avec API interne. Tests sans UI. Pas d'impact utilisateur.
2. **Phase 2 — Scaffolding par formulaire** : bouton « Remplir » ajouté aux 6 formulaires, extraction des gabarits depuis donnees-demo.js.
3. **Phase 3 — Déclaration d'intention** : modale au démarrage du parcours, branchement sur les 6 formulaires.
4. **Phase 4 — Bandeau exercice et marqueurs** : UI visible pendant la session.
5. **Phase 5 — Réconciliation** : modale de sortie, conversion exercice → réel, effacement propre.
6. **Phase 6 — Rappel proactif** : au démarrage d'application, si trimestre `exo_*` subsiste, rappel.
7. **Phase 7 — Mesure et décision** sur mode démo : garder ou déprécier.

---

## 7. Risques et points d'attention

- **Complexité de la double intention** : maintenir la cohérence entre « je suis en mode exercice » et « je crée dans ce formulaire » demande un état global bien géré. Un bug y serait visible et perturbant.
- **Confusion visuelle** possible si bandeau démo et bandeau exercice coexistent. Choisir visuellement distincts (couleur, pictogramme).
- **Point de bascule oublié** : si l'utilisateur ferme son navigateur en plein exercice, il retrouve des trimestres `exo_*` à la prochaine ouverture. Le rappel proactif doit être visible mais pas bloquant.
- **Qualité des gabarits** : si les données démo sont peu réalistes ou confuses, le scaffolding nuit au lieu d'aider. Relire le jeu démo avec cet œil avant de livrer la Phase 2.

---

## 8. Hors périmètre

- Création d'un **2e** jeu de données démo plus pédagogique (les gabarits actuels suffisent a priori).
- Multi-exercices simultanés (un seul exercice actif à la fois).
- Import/export d'exercices entre utilisateurs.
- Sauvegarde des exercices dans le snapshot backup (ils y sont déjà via le namespacing standard).

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Schéma et API | À faire | — | |
| Phase 2 — Scaffolding formulaires | À faire | — | |
| Phase 3 — Déclaration d'intention | À faire | — | |
| Phase 4 — Bandeau et marqueurs | À faire | — | |
| Phase 5 — Réconciliation | À faire | — | |
| Phase 6 — Rappel proactif | À faire | — | |
| Phase 7 — Décision mode démo | À faire | — | |

Mise à jour : au fil des commits.
