# Post-mortem — Tentative Phase 5 Autonomisation, 22 avril 2026

**Branche de sauvegarde** : `backup/phase5-tentative-22avril-2026`
(contient l'intégralité du travail tenté, 10 commits entre `7c8cc8e` et `253ce0d`)

**Dernier commit stable** retenu sur main : `602bacf` (Phase 4.C, b0422-1135)

**Auteur du post-mortem** : session Claude Code, 22 avril 2026.
**Statut** : revert effectué. Nouvelle tentative planifiée ultérieurement.

---

## 1. Ce qui était prévu (plan initial)

`plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md` §6 (phases 5-7).

Phase 5 — Retrait du mode démo legacy :
- Supprimer `js/donnees-demo.js` (1070 l.) : fonctions `entrerEnDemo`, `quitterDemo`, `nettoyerResiduDemo`, snapshot/décharge.
- Retirer le bandeau « Mode démonstration » et le bouton « Quitter la démo ».
- Retirer le bouton « Explorer avec des données démo » de la bannière de bienvenue.
- Refactorer `toggleDemoHandler` pour écrire simplement le flag `demo-actif` sans chargement en bloc.
- Migration silencieuse des résidus legacy au 1er démarrage.
- Sélecteurs à 2 sections (Phase 2, déjà livrée) deviennent l'unique accès à la démo, avec flow « Dupliquer » pour créer ses propres entités.

L'intention pédagogique (§2) : modèle de l'enseignement explicite (modélisation → pratique guidée → autonomie). La démo = matériel CC protégé à dupliquer.

## 2. Ce qui a été tenté (découpage effectif)

Six sous-phases livrées en chaîne, sans validation finale satisfaisante :

| Commit | Sous-phase | Livrable |
|---|---|---|
| `7c8cc8e` | 5.A | Retrait `donnees-demo.js` + bandeau + recâblage toggle + migration silencieuse `migration-phase5.js` |
| `d945d74` | 5.B | Retrait `estEnModeDemo` + `filtrerEtudiantsParMode` + 9 blocs `enDemoLegacy` dans trimestre-v2.js |
| `c66cbff` | Fix iPad | Listener direct change sur la checkbox « Données démo » (faux diagnostic — voir §3) |
| `7f6685d` | 5.B-bis | Flow « Dupliquer » étendu au GC démo (option `selectionnable` sur optgroup, détection préfixe `demo-`, mode lecture seule sur formulaire GC) |
| `c12e720`, `e57c992` | Fixes | Listeners directs select + bouton Enregistrer disabled + carte résumé lit `demo_*` |
| `fa85a97` | Bump caches | Bump des cache-busters `?v=` sur 11 fichiers touchés |
| `253ce0d` | 5.B-ter | Activation GC démo au toggle (virtualisation trimestre `demo` + pointeurs `groupeCoursActif`/`infoCours`) |

## 3. Pièges rencontrés — à éviter à la prochaine tentative

### 3.1 Cache-busters obsolètes (CAUSE RACINE SOUS-ESTIMÉE)

**Ce qui s'est passé** : les balises `<script src="js/X.js?v=YYYYMMDD">` dans `index.html` gardaient des `?v=` datant de semaines avant le chantier. Safari iPad servait les anciennes versions de `accueil.js`, `modes.js`, `trimestre-v2.js`, etc. Mes nouvelles fonctions n'étaient jamais exécutées.

**Symptôme observé** : la checkbox « Données démo » se cochait visuellement (comportement natif du `<label for="">`) mais le flag `demo-actif` n'était pas écrit en storage. Au retour à l'accueil, la case apparaissait décochée.

**Diagnostic erroné que j'ai posé** : « iOS Safari n'émet pas `change` sur les `<input type="checkbox">` enveloppés d'un `<label for="">` ». J'ai ajouté un listener JS direct comme workaround. Idem pour le `<select>` avec `optgroup` : j'ai ajouté `change` + `input` listeners directs croyant à un bug iOS.

**Ce qu'il fallait faire en premier** : grep des cache-busters de chaque fichier touché, les bumper systématiquement dans le même commit que la modif. Sinon Safari sert le cache.

**Règle à inscrire pour la prochaine tentative** :
> Toute modif à un `.js` déjà référencé par `index.html` exige un bump du `?v=` dans le même commit. Lister les fichiers touchés dans le commit, grep leurs cache-busters, bump. Sinon Safari (surtout iPad) sert la version cachée et masque le bug réel derrière de faux symptômes iOS.

### 3.2 Découpage en sous-phases trop serré

J'ai livré 5.A, 5.B, 5.B-bis, 5.B-ter en chaîne sans laisser Grégoire valider en production entre chaque. Grégoire a testé 5.A (« ça fonctionne ») mais n'a pas retesté après 5.B ni 5.B-bis avant que je pousse la suite. Résultat : les bugs se sont empilés, difficiles à isoler.

**Règle** :
> Après chaque sous-phase non triviale, pause explicite pour test terrain iPad + Mac avant de pousser la suite. Ne pas enchaîner plus de 1 commit majeur par cycle de test.

### 3.3 Mauvaise compréhension de l'expérience utilisateur attendue

Le plan dit « le toggle affiche les sections Démo dans les sélecteurs ». J'ai lu cela comme la totalité du comportement attendu, et j'ai écarté l'idée d'un aperçu peuplé comme « contredisant le plan ». Mais la philosophie §2 (enseignement explicite) REQUIERT la modélisation — donc un aperçu peuplé pour visualiser ce que l'outil produit. Grégoire l'a fait remarquer tardivement.

**Règle** :
> Avant de commencer un retrait, formaliser par écrit le parcours utilisateur complet de la démo post-livraison (clic par clic). Valider avec Grégoire que ce parcours atteint bien l'objectif pédagogique de modélisation. Ne pas se contenter des spécifications §5.x.

### 3.4 Le GC démo n'avait pas de « bibliothèque visuelle »

Phase 4.B avait livré le flow lecture seule + Dupliquer pour 5 formulaires (grille, échelle, cartouche, production, pratique matériel) via leurs cartes biblio respectives. Le groupe-cours a été oublié : il n'a qu'un dropdown, pas de bibliothèque visuelle séparée. Donc les options démo `disabled=true` (convention Phase 2) rendaient la démo GC inactionnable.

**Symptôme observé** : le dropdown montrait l'optgroup Démo mais taper sur l'option ne faisait rien (car disabled).

**Ce qu'il a fallu ajouter (5.B-bis)** : un paramètre `selectionnable` à `ajouterOptgroupDemo`, détection de préfixe `demo-` dans `changerGroupeCoursSelectionneV2`, appel à `appliquerModeLectureSeuleDemo` dans `editerGroupeCoursV2`, création de `dupliquerEtEditerGroupeCours`, préfixage `demo-` des refs pour matcher les optgroups, skip de `mettreAJourNomGroupeCoursV2` pour GC démo, désactivation du bouton Enregistrer.

**Règle** :
> Avant retrait legacy, cartographier toutes les entités qui avaient un flow démo dans l'ancien système. Pour chacune, confirmer qu'elle a bien un équivalent Phase 4.B (flow Dupliquer). Si pas, soit étendre Phase 4.B, soit accepter que la démo soit invisible pour cette entité. Décision à prendre AVANT le retrait, pas après.

### 3.5 Activation du GC démo complexe — et finalement non fonctionnelle

5.B-ter a tenté la virtualisation du trimestre `demo` dans `trimestres` global + pointeurs `groupeCoursActif` / `infoCours` → GC démo / cours démo. Objectif : faire en sorte que `cle('X')` route vers `demo_X` et que l'aperçu se peuple.

**Résultat terrain** : cocher la case ne remplit toujours pas l'aperçu. Cause probablement multiple (à investiguer) :
- Peut-être que la réconciliation au boot (`db-ready` listener) interfère avec d'autres modules qui refiltrent.
- Peut-être que migration-phase5 retire les items `isDemo` après l'activation.
- Peut-être qu'un autre module écrase `groupeCoursActif` au démarrage.
- Peut-être que les données démo dans `demo_*` ne contiennent pas tout ce qu'il faut pour alimenter l'aperçu (étudiants, productions, snapshots, indicesCP, etc.).

**Règle** :
> Pour l'activation d'un mode qui change le namespace lu par `cle()`, ne pas se contenter de muter 3 pointeurs. Valider de bout en bout qu'une lecture complète (obtenirEtudiantsCoursActif, obtenirDonneesSelonMode, genererCalendrierComplet, reconstruireSnapshotsHistoriques) retourne les données attendues. Écrire un test intégration au storage si possible.

## 4. Pourquoi on revient au legacy

Le mode démo legacy (`entrerEnDemo` / `quitterDemo`) fonctionnait correctement — Grégoire l'utilisait sans problème avant le chantier. Il charge les données démo en bloc dans les globaux, active le trimestre `demo`, l'aperçu se peuple naturellement. La modélisation pédagogique est servie.

Tout le chantier Phase 5 visait à retirer cette approche « en bloc » pour une approche plus propre (namespace `demo_*` séparé, pointeurs plutôt que copie). Mais la simplicité du legacy est difficile à remplacer sans casser la visualisation. Tant qu'on n'a pas trouvé une approche fonctionnelle et validée, le legacy reste en place.

## 5. Pistes pour la prochaine tentative

Dans l'ordre :

1. **Reprendre en petit** : ne pas empiler 10 commits, mais livrer une sous-phase à la fois, test terrain entre chaque.
2. **Cache-busters en premier réflexe** : automatiser un script `bump-cache-busters.sh` qui bumpe `?v=` automatiquement quand un `.js` est modifié, ou faire un hook pre-commit.
3. **Cartographier exhaustivement** les points de lecture qui dépendent du trimestre actif (`cle()`), du `groupeCoursActif`, du `infoCours`. Identifier les modules qui pré-calculent ou cachent des valeurs (ex. `calendrierComplet`, `snapshots`, `indicesCP`). Vérifier qu'ils se rafraîchissent au changement de pointeur.
4. **Décider du modèle** : soit on garde le legacy et on documente le mode démo comme définitif ; soit on fait une vraie refonte avec un mécanisme propre (flag `demo-actif` = redirection namespace dans `obtenirDonneesSelonMode` et `cle()` directement, sans toucher à `trimestres` global). La seconde option est plus ambitieuse mais plus propre.
5. **Tester iPad dès la première sous-phase**, pas seulement Mac. Les symptômes iOS révèlent souvent un problème (ici cache) qui masque la vraie cause.

## 6. Ce qui a été appris qu'on garde

- L'architecture Phase 1 (namespace `demo_*` permanent) est juste et utile. Elle peut rester même si on garde le legacy en parallèle (attention aux doublons).
- Phase 4.A (séparation identité CC utilisateur vs enseignant métier) est indépendante du legacy, acquise.
- Phase 4.B (flow Dupliquer pour 5 formulaires) est indépendante, acquise.
- Phase 4.C (interdiction références mixtes au save) est indépendante, acquise.

**Ces acquis ne sont PAS dans le revert**, ils sont dans le commit `602bacf` et antérieurs. Seules Phase 5.A à 5.B-ter (le retrait legacy) sont revert.

## 7. Références

- Branche backup : `git checkout backup/phase5-tentative-22avril-2026`
- Commits concernés : `git log 602bacf..253ce0d --oneline`
- Plan original : `plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md`
- Mémoire projet : `memory/project_autonomisation_utilisateur.md` (hors repo, mis à jour avec les leçons)
