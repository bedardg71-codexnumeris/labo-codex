# Plan — Autonomisation de l'utilisateur par la démo CC

**Date** : 21 avril 2026
**Statut** : Cadrage complet, implémentation non démarrée
**Philosophie-clé** : utiliser les données de démonstration non pas pour illustrer l'application, mais comme **matériel pédagogique** qui accompagne l'enseignant vers l'autonomie selon le modèle de l'enseignement explicite, dans une continuité conceptuelle avec la licence CC BY-NC-SA déjà en place.

**Séquence prévue** :
- **Plan 1 (ce document)** : matériel démo protégé par CC et parcours d'autonomisation
- **Plan 2 (à venir)** : bibliothèques de partage sécurisé entre utilisateurs (email d'abord, communauté plus tard)

Les deux plans s'inscrivent dans la même philosophie : l'écosystème Labo Codex est un tissu de matériel pédagogique CC qui circule, se réplique et inspire sans jamais être corrompu.

---

## 1. Contexte

### 1.1 Observations terrain (LOG UX 20 avril)

L'audit iPad du 20 avril révèle que plusieurs frictions de l'onboarding actuel viennent d'un **paradigme mal calibré** : la démo charge des données fictives en bloc, le parcours pousse l'utilisateur à saisir ses vraies données dès l'étape 1, et la modale de bienvenue (retirée commit `e8f8159`) posait des questions redondantes avec la page d'accueil V3.

### 1.2 Reformulation fondamentale proposée par l'utilisateur

> « Il s'agit d'utiliser du matériel que nous avons créé pour ne pas seulement *illustrer* l'application, mais bien s'en servir à des fins pédagogiques d'autonomisation de l'utilisateur. »

La démo n'est pas une vitrine — c'est un **exemple vivant** que l'utilisateur observe, reproduit, s'approprie, et éventuellement partage à son tour. Le cycle calque celui de la licence CC BY-NC-SA.

### 1.3 Modèle pédagogique adopté : l'enseignement explicite

| Phase pédagogique | Mode utilisateur | Systèmes actifs |
|---|---|---|
| **Modélisation** | Observation pure | Démo visible, accompagnement désactivé |
| **Pratique guidée complète** | Création avec filet | Démo visible + accompagnement actif |
| **Pratique guidée allégée** | Création avec rappels | Démo masquée, accompagnement actif |
| **Pratique autonome** | Création libre | Démo masquée, accompagnement désactivé |

Deux toggles indépendants sur l'accueil V3 (déjà en place) pilotent cette progression :
- **« Données démo »** : expose ou cache la section « Démo » dans chaque sélecteur d'entité
- **« Accompagnement »** : active le tour guidé, les tooltips, les popups ✴️ et les flèches didactiques

La section **Aide** reste toujours disponible (référence statique, non dynamique) — c'est le manuel de référence pour l'utilisateur autonome qui veut consulter ponctuellement.

### 1.4 Parallèle conceptuel avec Creative Commons BY-NC-SA

Le mécanisme proposé reproduit exactement le cycle d'une œuvre sous licence CC BY-NC-SA 4.0 (licence déjà choisie par le projet pour les exports de configuration pédagogique) :

| CC BY-NC-SA | Équivalent dans le plan |
|---|---|
| Œuvre originale protégée | Items démo immuables (modifiables seulement par les devs via code) |
| Attribution (BY) | Champ auteur visible sur chaque entité + métadonnée « Inspiré de » préservée au fork |
| Non commercial (NC) | Aligné sur la mission de Labo Codex |
| Partage à l'identique (SA) | Les forks utilisateurs pourront à leur tour être partagés (Plan 2) |

---

## 2. Vision d'ensemble

### 2.1 Principe fondateur

Chaque sélecteur d'entité de l'application (Trimestre, Cours, Enseignant, Groupe d'étudiants, Horaire, Groupe-cours, Grille, Échelle, Cartouche, Production, Pratique) affiche deux sections distinctes :

- **« Mes documents »** — les entités réelles de l'utilisateur
- **« Démo »** — les exemples, visibles si toggle « Données démo » activé, masqués sinon

L'utilisateur peut naviguer librement dans la section Démo pour **observer** la structure du matériel pédagogique. Pour utiliser un item démo comme point de départ, il clique sur le bouton **« Dupliquer »** qui débloque l'édition en créant un fork. À la première modification, l'item se **détache** de la démo : c'est désormais un nouveau document dans « Mes documents », portant une attribution d'origine visible.

**Vocabulaire UI (décision 22 avril 2026)** : « Dupliquer » partout. L'ancien wording « Prendre comme modèle » du plan initial a été abandonné — il cohabite mal avec « Dupliquer » déjà en place sur les items utilisateur, et ajoute un concept UI sans gain clair. « Dupliquer » sert autant pour les items démo (déclenche le fork CC avec `inspireDe` et retire le flag démo) que pour les items utilisateur (copie d'un travail personnel).

### 2.2 Ce que ça remplace dans l'architecture actuelle

- **Mode démo actuel** (`js/donnees-demo.js` avec flag `demo-actif`, snapshot, décharge au refresh) : obsolète, à remplacer
- **Modale de bienvenue 3 approches** (déjà retirée commit `e8f8159`)
- **Bouton « Remplir avec des données par défaut »** (idée intermédiaire, abandonnée au profit de l'observation pure)

---

## 3. Design du flow utilisateur

### 3.1 Sélecteurs avec section Démo

Dans chaque bibliothèque ou dropdown (ex. bibliothèque des grilles) :

```
┌─────────────────────────────────────┐
│  Mes documents                      │
│  ───────────────                    │
│  • [+ Nouveau]                      │
│  • Ma grille de dissertation        │
│  • Ma grille d'exposé oral          │
│                                     │
│  Démo (par Demo Labo Codex)         │
│  ───────────────                    │
│  • Grille d'analyse littéraire      │
│  • Grille d'argumentation           │
│  • Grille de lecture critique       │
└─────────────────────────────────────┘
```

Clic sur un item « Mes documents » → formulaire normal, édition, enregistrement direct.
Clic sur un item « Démo » → formulaire en **mode lecture** (champs désactivés visuellement) avec un bouton proéminent en haut :

```
┌──────────────────────────────────────────────────┐
│  Grille d'analyse littéraire                     │
│  par Demo Labo Codex · Exemple                   │
├──────────────────────────────────────────────────┤
│  [ Dupliquer pour créer ma propre grille ]       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Critère 1 : Compréhension des thèmes            │
│  ─ unistructurel : …                             │
│  ─ multistructurel : …                           │
│  (lecture seule)                                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 3.2 « Dupliquer » (fork démo)

Clic sur le bouton → transition visible et explicite :
- Le titre du formulaire change : `Nouveau document inspiré de « Grille d'analyse littéraire » par Demo Labo Codex`
- Un champ **Nom** obligatoire apparaît en tête du formulaire, focus automatique
- Tous les champs deviennent éditables (basculent du style lecture au style édition)
- Le bouton **Enregistrer** reste désactivé tant que le nom n'est pas saisi
- Un bouton **Annuler** en retrait permet de revenir au mode lecture de l'item démo d'origine

**Point clé** : rien n'est enregistré tant que l'utilisateur n'a pas cliqué Enregistrer. S'il ferme sans sauvegarder, aucune entité n'est créée dans « Mes documents ». Pas d'orphelins.

Au save :
- Nouvelle entité créée dans « Mes documents », avec son nouveau nom
- Auteur = identité de l'utilisateur (rubrique Enseignant de ses Réglages)
- Métadonnée préservée : `inspireDe: { nom: "Grille d'analyse littéraire", auteur: "Demo Labo Codex", date: "2026-04-21" }`
- Badge affiché sur la carte/liste : **« Inspiré de Grille d'analyse littéraire (par Demo Labo Codex) »**

### 3.3 Visualisation de l'attribution en tout temps

Sur toutes les cartes, listes et formulaires :
- Une ligne discrète mais **toujours visible** affiche l'auteur
- Pour items démo : `par Demo Labo Codex · Exemple` (style différent pour signaler la nature démo)
- Pour items utilisateur : `par [nom de l'enseignant]`
- Pour items utilisateur inspirés d'un autre : ajout d'une seconde ligne `Inspiré de X par Y`

Transparence = confiance. L'utilisateur sait en permanence qui a produit ce qu'il consulte.

### 3.4 Interdiction des références mixtes (option A)

Une entité réelle ne peut **jamais** référencer un item démo.

Exemple : au moment d'assembler un groupe-cours réel, si l'utilisateur tente d'y inclure un cours démo (non forké), le système refuse avec un message clair :

> « Le cours que tu as sélectionné est un exemple (Demo Labo Codex). Pour l'utiliser dans ton groupe-cours, clique sur « Dupliquer » d'abord et donne-lui ton propre nom. »

Cohérent pédagogiquement : l'utilisateur doit reproduire chaque étape consciemment pour s'approprier la méthode.

---

## 4. Architecture technique

### 4.1 Namespace `demo_*` parallèle

Les données démo vivent dans un namespace dédié, parallèle aux namespaces de trimestre réels :

- `h2026_groupesCours`, `a2025_groupesCours` (utilisateur)
- `demo_groupesCours` (démo, lecture seule côté UI)

Le helper `window.cle('groupesCours')` retourne déjà la clé namespacée selon le trimestre actif. On ajoutera un helper `window.cleDemo('groupesCours')` qui retourne `demo_groupesCours`.

Chaque module de sélecteur interroge les deux sources et les affiche dans des sections distinctes.

### 4.2 Chargement initial (option A : permanent)

Au tout premier démarrage de l'application (ou après un reset complet), le namespace `demo_*` est peuplé automatiquement avec le jeu démo inclus dans le code. Les données vivent en permanence dans le storage. Le toggle « Données démo » ne fait qu'afficher ou masquer la section Démo dans les sélecteurs — il n'ajoute ni ne supprime jamais de données.

Impact storage : le jeu démo doit rester **léger** (quelques kilo-octets, pas des méga-octets). Priorité à la clarté pédagogique, pas à l'exhaustivité.

### 4.3 Mise à jour de la démo entre versions (A + B + C)

Quand les développeurs publient une version qui modifie ou enrichit le jeu démo :

- **Les forks utilisateur ne sont jamais touchés** (ils sont devenus sa propriété)
- **Les items démo dans `demo_*` sont rafraîchis** (écrasés par la nouvelle version — légitime, puisque c'est le rôle du dev)
- **Le champ `inspireDe` des forks existants garde un snapshot du nom au moment du fork**, pas une référence vivante. Si l'item démo d'origine est renommé ou supprimé, le badge « Inspiré de X » continue d'afficher l'ancien nom — c'est une trace d'origine, pas un pointeur live.

Mécanisme : flag `demo-version-installee` (ex. `demo-v1.2`) en localStorage. Au démarrage, si version du code > version installée, on rafraîchit le namespace `demo_*` et on met à jour le flag.

### 4.4 Champ auteur séparé du champ enseignant

Deux concepts distincts :

- **Auteur** (métadonnée CC) : qui a créé ce document
  - Pour démo : `"Demo Labo Codex"` (chaîne réservée, forcée par le code)
  - Pour utilisateur : le nom saisi dans Réglages › Enseignant
- **Enseignant** (champ métier) : qui donne le cours représenté par le groupe-cours
  - Peut être fictif pour démo
  - Indépendant de l'attribution

### 4.5 Attribution « Demo Labo Codex » réservée (préparation Plan 2)

Même si Plan 2 n'est pas encore en place, on pose dès Plan 1 le garde-fou :
- La chaîne d'attribution `"Demo Labo Codex"` ne peut être produite que par le code qui initialise le namespace `demo_*`
- Toute validation d'import de package (future feature) devra rejeter/réécrire cette valeur si elle apparaît dans une source externe
- Évite l'usurpation d'identité officielle dans le Plan 2

### 4.6 Identité de l'utilisateur

Pas de nouvelle pref à créer. L'identité d'auteur est tirée de la rubrique **Enseignant** déjà existante dans Réglages › Enseignant (nom + discipline + institution + courriel institutionnel).

Si l'utilisateur n'a pas encore configuré son enseignant → la valeur auteur par défaut est `"Utilisateur de Labo Codex"`. Il est invité à compléter son identité à la première fork.

Aucun contrôle d'authenticité — l'utilisateur peut mettre un pseudonyme, des infos erronées, peu importe. La responsabilité des métadonnées reste du côté de l'utilisateur, comme dans toute licence CC du monde.

---

## 5. Migration depuis le mode démo actuel

### 5.1 Retrait du mécanisme actuel

- `js/donnees-demo.js` : retiré ou vidé de sa logique de snapshot/décharge. Les fonctions exposées (`entrerEnDemo`, `quitterDemo`, `nettoyerResiduDemo`, etc.) sont supprimées ou redirigées.
- Flag `demo-actif` en localStorage : devient obsolète. Migration : au premier démarrage post-livraison, si détecté, nettoyer silencieusement.
- Bandeau « Mode démonstration » au bas de l'écran : retiré. Remplacé par la simple présence de la section Démo dans les sélecteurs.
- Bouton « Quitter la démo » dans le bandeau : retiré. L'utilisateur désactive simplement le toggle « Données démo » dans l'accueil.
- Snapshot `demo-etat-precedent` : plus de snapshot, plus de restauration. Les données utilisateur restent en permanence dans leur namespace réel. Migration propre de toute donnée snapshot orpheline.

### 5.2 Conservation du toggle accueil

Le toggle **« Données démo »** sur l'accueil V3 reste visible avec la même étiquette, mais change de comportement :
- Avant : checkbox on → charge les données démo en bloc, affiche le bandeau
- Après : checkbox on → affiche la section Démo dans les sélecteurs

---

## 6. Phases de livraison proposées

### Phase 1 — Namespace `demo_*` et chargement permanent
- Création du jeu démo dans le code (source unique pour les données initiales)
- Initialisation du namespace `demo_*` au premier run
- Flag `demo-version-installee` pour le rafraîchissement entre versions
- Helper `window.cleDemo('nomCollection')`
- Tests : données présentes dans le storage, isolées des namespaces trimestre

### Phase 2 — Sélecteurs à deux sections
- Adaptation de chaque sélecteur d'entité (11 sélecteurs au total) pour afficher deux sections « Mes documents » et « Démo »
- Comportement lecture seule sur les items démo sélectionnés
- Bouton « Dupliquer » visible et fonctionnel

### Phase 3 — Fork et attribution
- Mécanisme de fork au clic sur « Dupliquer »
- Génération de la métadonnée `inspireDe`
- Affichage de la ligne d'attribution sur les cartes et formulaires
- Champ auteur séparé du champ enseignant

### Phase 4 — Interdiction des références mixtes + lecture seule démo + identité CC utilisateur
- Validation à la sauvegarde des entités assemblées (groupe-cours, pratiques, évaluations)
- Message clair avec redirection vers « Dupliquer »
- **Formulaire d'édition lecture seule sur items démo** (Plan §3.1) : tout item dont `auteur_original === "Labo Codex"` ouvre les champs en disabled, avec bouton proéminent « Dupliquer » pour débloquer via fork. Interdit la modification directe du matériel CC livré.
- **Identité CC utilisateur** (Plan §4.6) : introduire un helper `obtenirIdentiteCCUtilisateur()` qui lit Réglages › Enseignant (profil de l'utilisateur lui-même, pas le prof démo). Fallback `"Utilisateur de Labo Codex"` si non configuré. Distinct de `obtenirNomEnseignantActif()` (qui lit l'enseignant du groupe-cours actif — champ métier).
- **Fix `ajouterContributeurSiNecessaire`** (cc-license.js:354) : utiliser `obtenirIdentiteCCUtilisateur()` au lieu de `obtenirNomEnseignantActif()`. Sinon la contribution n'est jamais tracée en contexte démo (observé test terrain 22 avril 2026 : grille démo modifiée sans groupe-cours actif → aucun contributeur ajouté). Ne pas risquer de créditer le prof démo (« Primo Primavera ») comme contributeur — ce serait exactement l'attribution muddle que le plan veut éviter.

### Phase 5 — Retrait du mode démo actuel
- Suppression/vidage de `donnees-demo.js`
- Retrait du bandeau « Mode démonstration »
- Rebranchement du toggle « Données démo » sur le nouveau comportement
- Migration silencieuse des flags obsolètes au 1er démarrage post-livraison

### Phase 6 — Documentation
- Mise à jour de SESSION.md, mémoire projet, docs/modules/
- Capture d'écran des sélecteurs à 2 sections
- Guide dans Aide expliquant le parcours d'autonomisation et le cycle CC

### Phase 7 — Préparation Plan 2 (sans livraison)
- Documentation des hooks nécessaires pour le futur partage email (points d'extension dans les sélecteurs, format d'export déjà calé sur la Configuration pédagogique Beta 91)
- Garde-fous anti-usurpation « Demo Labo Codex » bétonnés

---

## 7. Critères d'acceptation

Sur iPad Safari et Mac Safari, mode clair et sombre :

1. Au premier démarrage, le namespace `demo_*` est peuplé ; le toggle « Données démo » de l'accueil est coché par défaut.
2. Chaque sélecteur d'entité affiche les deux sections « Mes documents » et « Démo » avec une séparation visuelle claire.
3. Toggle « Données démo » décoché → section Démo disparaît partout, les données sont conservées dans le storage.
4. Clic sur un item démo → formulaire s'ouvre en lecture seule, titre et auteur clairement identifiés.
5. Clic sur « Dupliquer » → formulaire bascule en édition, champ Nom en focus, bouton Enregistrer désactivé tant que nom vide.
6. Clic sur « Annuler » après « Dupliquer » → retour au mode lecture de l'item démo, pas d'entité créée.
7. Save d'un nouveau document → entité dans « Mes documents » avec attribution `par [nom enseignant]` + ligne `Inspiré de [nom démo] par Demo Labo Codex`.
8. Tentative d'assembler une entité réelle avec un composant démo non forké → erreur claire, redirection vers « Dupliquer ».
9. Mise à jour de la version de l'app avec un nouveau jeu démo → forks utilisateurs intacts, items démo rafraîchis.
10. Au démarrage post-migration, aucun résidu du mode démo actuel ne subsiste (flag, bandeau, snapshot).

---

## 8. Risques et points d'attention

- **Complexité de 11 sélecteurs à adapter** : répartir par lot en Phase 2, tester chacun avant le suivant. Risque de régression sur la bibliothèque actuelle qui fonctionne bien — préserver le pattern existant, l'étendre plutôt que le récrire.
- **Qualité du jeu démo** : si les données démo sont trop limitées ou peu représentatives, le dispositif pédagogique échoue. Prévoir une relecture par un pair enseignant avant livraison.
- **Migration silencieuse** : les utilisateurs actuels qui ont déjà activé le mode démo à l'ancienne auront potentiellement des flags `demo-actif`, des snapshots, etc. Prévoir un nettoyage idempotent au 1er démarrage post-livraison. Flag `autonomisation-migration-v1` pour ne pas re-exécuter.
- **Contamination de l'attribution** : garantir que `"Demo Labo Codex"` ne puisse être produite que par le code (pas via un champ saisi par l'utilisateur). Blocage au niveau de la rubrique Enseignant des Réglages (la liste des noms valides exclut cette chaîne) et du formulaire en général.
- **Snapshot d'attribution au fork** : les références `inspireDe` doivent être stockées comme valeurs figées, pas comme pointeurs. Une migration future qui change l'ID d'un item démo ne doit pas casser les attributions.
- **Perception utilisateur** : un enseignant pourrait prendre la démo pour une fonctionnalité marginale. Le parcours d'onboarding doit communiquer clairement le modèle pédagogique (modélisation → pratique guidée → autonomie).

---

## 9. Hors périmètre de ce plan

- **Plan 2 : partage sécurisé entre utilisateurs** (export/import de packages CC, validation stricte, signature ou vérification d'origine, bibliothèque communautaire). Prévu en continuité, après livraison de Plan 1.
- **Multi-jeu démo** (plusieurs trimestres démo représentant plusieurs disciplines ou méthodes) : un seul jeu pour l'instant, extension viendra à l'usage.
- **Bibliothèque communautaire persistante** (items partagés par d'autres enseignants accessibles dans les sélecteurs aux côtés des démo) : concept qui émergera naturellement de Plan 2, non détaillé ici.
- **Mécanismes d'authentification** (vérifier que « Grégoire Bédard » est bien Grégoire Bédard) : hors périmètre, licence CC n'impose pas de vérification d'identité.

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Namespace demo_* | Terminée | (à valider test iPad) | b0421-0730. js/demo-namespace.js + helper cleDemo + flag demo-version-installee. Invisible en Phase 1. |
| Phase 2 — Sélecteurs à 2 sections | Terminée (2.0–2.5) | b0422-0738 | Reste trimestre legacy → Phase 5 |
| Phase 3 — Fork et attribution | Livrée code | b0422-0832 | Test terrain iPad 22 avril : `inspireDe` sur cartes + panneau OK. Audit auteur/enseignant fait. |
| Phase 4.A — Identité CC utilisateur | Livrée | b0422-1000 | Helper `obtenirIdentiteCCUtilisateur()` avec fallback « Utilisateur de Labo Codex ». `obtenirProfilAuteurActifSync` refactoré (filtre isDemo, priorise Réglages). 9 call-sites de création migrés. |
| Phase 4.B — Formulaires démo en lecture seule | Livrée | b0422-1105 | 5 formulaires (grille, échelle, cartouche, production, pratique matériel) + helpers `appliquerModeLectureSeuleDemo` + `forkerItem` dans BibliothequeUI. Vocabulaire « Dupliquer » harmonisé dans doc. Test terrain OK. |
| Phase 4.C — Interdiction références mixtes | Livrée | b0422-1135 | Helper `verifierReferencesPasDemo` + gardes aux 3 points de save : groupe-cours (trimestre-v2), évaluation (evaluation.js × 2), pratique (pratiques-materiel). |
| Phase 5 — Retrait mode démo actuel | À faire | — | |
| Phase 6 — Documentation | À faire | — | |
| Phase 7 — Préparation Plan 2 | À faire | — | |

Mise à jour : au fil des commits.
