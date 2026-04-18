# Plan — Refonte du premier contact (onboarding nouvel utilisateur)

**Date de création** : 18 avril 2026
**Build au moment de l'audit** : 0418-0923 · Beta 99.18
**Plateforme d'observation** : Safari iPad (Air M1)
**Mot d'ordre** : Pas de dette technique. Tout se règle en profondeur, se documente, se commit.

---

## 1. Contexte et constat

### 1.1 Pourquoi ce chantier

Labo Codex est fonctionnellement riche et architecturalement stable. Tous les outils métiers sont développés (évaluation, planification, suivi, RaI, jetons de reprise, codex USB). L'application passe néanmoins un filtre décisif avant d'être utile : **le premier contact**. Si un nouvel utilisateur décroche dans les 5 premières minutes, aucune fonctionnalité ne sauvera l'outil.

L'audit du 18 avril 2026 (journal intégral en annexe A) montre qu'un utilisateur néophyte, partant de zéro sur iPad, traverse une succession d'obstacles qui rendent l'application intimidante, jargonneuse et peu accueillante. L'utilisateur-testeur (Grégoire, concepteur de l'outil) a lui-même ressenti qu'il était « seul devant le guichet ».

### 1.2 Nature du chantier

- **Modulaire** — découpé en phases indépendantes, chacune livrable séparément.
- **Non-destructif** — aucune suppression d'outil existant. On reorganise, on guide, on désamorce.
- **Ciblé sur l'entrée** — ne touche pas aux modules métiers, uniquement à ce qui entoure le premier contact.
- **Plateforme prioritaire** : iPad Safari (cas d'usage terrain de l'enseignant). Les comportements Mac seront vérifiés mais ne dictent pas les arbitrages.

### 1.3 État de départ

- 7 problèmes initialement identifiés (a, d, e, f, g1, g3, h) — **tous confirmés** lors de l'audit terrain.
- **13 problèmes supplémentaires** découverts pendant le parcours néophyte.
- Total : **~20 points à adresser**, dont une partie est une correction technique pure (bugs), l'autre relève d'une refonte d'expérience.

---

## 2. Principes directeurs

Avant tout correctif ou refonte, ces principes serviront d'aune :

1. **Un seul point d'attention à la fois.** L'utilisateur ne doit jamais voir plus d'une modale active ou plus d'une sollicitation primaire. Les piles de modales sont interdites.
2. **Pas de page vide sans guidance.** Tout état vide doit indiquer quoi faire ensuite, avec un bouton ou un lien qui amorce l'action.
3. **Pas de vocabulaire spécialisé sans exemple concret.** SRPNF, cartouche, rubrique, holistique/analytique/algorithmique — chaque terme métier doit être présenté avec un exemple avant d'être employé comme étiquette.
4. **L'utilisateur découvre en manipulant, pas en lisant.** Le texte explicatif est un filet de sécurité, pas le mode d'emploi.
5. **Le premier parcours est linéaire.** Pas d'arborescence à explorer. L'utilisateur suit un fil, et ne bifurque que lorsqu'il est prêt.
6. **Les modales servent l'action, jamais l'information brute.** Une modale qui ne demande rien à l'utilisateur n'a pas à être une modale.
7. **Respect de la plateforme iPad.** Cibles tactiles ≥ 44 px, aucun bouton en dehors du cadre visible, modales dimensionnées pour la hauteur utile.

---

## 3. Phase A — Correctifs techniques (effort faible, impact immédiat)

Objectif : éliminer tous les bugs purs qui dégradent le premier contact, sans refonte conceptuelle.

**Priorité intra-phase** (à traiter dans cet ordre si le temps manque) :
- 🔴 **Bloquants** (rendent l'app inutilisable ou obligent l'utilisateur à deviner) : A.2, A.5, A.3
- 🟠 **Importants** (dégradent la confiance, créent de la confusion) : A.4, A.7, A.6
- 🟡 **Cosmétiques** (visibles mais sans impact fonctionnel) : A.1

### A.1 Métadonnées HTML obsolètes

**Problème** : au moment de taper l'adresse, Safari affiche « Système de suivi Beta 96.2 - Hiver 2026 » (IMG_6019). Le nom du projet est « Labo Codex » et la beta courante est 99.18.

**Action** :
- Vérifier `index.html` `<title>` et `<meta name="description">`.
- Synchroniser avec le nom et la beta courants.
- Envisager un titre stable (« Labo Codex ») sans beta dans le `<title>`, la beta étant déjà dans l'en-tête de l'app.

**Validation** : rechargement iPad, vérifier l'onglet Safari.

### A.2 Modale migration : boutons hors cadre iPad

**Problème** : la modale « Mise à jour de tes données » a ses boutons tronqués sur iPad (log point 5). L'utilisateur clique au hasard.

**Action** :
- Identifier la modale (probablement `js/migration-*.js` ou équivalent).
- Vérifier les règles CSS `max-height`, `overflow`, positionnement des boutons.
- Garantir que les boutons restent visibles même avec contenu long : zone scrollable pour le contenu, footer d'actions fixe en bas.

**Validation** : reproduire la modale sur iPad, vérifier que tous les boutons sont toujours atteignables.

### A.3 Groupe démo absent des sélecteurs Contexte

**Problème** (log point 11) : l'utilisateur cherche le groupe démo dans les sélecteurs de Contexte (horaire, groupe-cours) et ne le trouve pas. Bug de conception : les données démo n'alimentent pas tous les endroits attendus.

**Action** :
- Cartographier les sélecteurs concernés (Contexte → Horaire, Groupe-cours, Enseignants, Cours).
- Vérifier que le mode démo injecte bien toutes les entités liées au groupe-cours « 601-101 gr. demo ».
- Corriger les trous.

**Validation** : en mode démo, tous les sélecteurs de Contexte doivent présenter au moins une entrée cohérente.

### A.4 Tour guidé / info-bulles / aide contextuelle non branchés

**Problème** (log point 6) : l'utilisateur coche ces trois options et rien ne se passe. Fonctionnalités annoncées mais non livrées.

**Action** :
- Vérifier dans le code si ces préférences sont lues quelque part.
- Si elles ne sont pas branchées : soit les implémenter, soit les retirer de l'UI (pas de promesse non tenue).
- Décision à prendre en Phase B (refonte flux) sur leur rôle exact.

**Validation** : cocher une option → effet immédiat observable.

### A.5 Info-bulles intermittentes

**Problème** (log points 7 et parcours Structure) : les info-bulles fonctionnent un moment puis cessent de répondre. Bug comportemental.

**Action** :
- Reproduire la séquence : Aperçu → Structure → plus aucune info-bulle.
- Investiguer la gestion des event listeners (possiblement supprimés lors d'un re-render sans réattachement).
- Corriger à la racine (pas de rustine type polling).

**Validation** : parcours de navigation complet, info-bulles doivent fonctionner partout en permanence.

### A.6 « ? » de Structure pris pour des images cassées

**Problème** (IMG_6030) : les boutons d'aide ronds avec un « ? » sont visuellement ambigus. L'utilisateur a cru à des images qui n'avaient pas chargé.

**Action** :
- Revoir le style : fond plein, icône clairement en typographie ou SVG, tooltip au hover/tap court.
- Aligner sur le design system (`design-system.html`).

**Validation** : un utilisateur qui voit le bouton doit comprendre au premier coup d'œil que c'est une aide cliquable.

### A.7 Import étudiants : boutons annoncés mais non visibles

**Problème** (log point 12, IMG_6031) : le message « Utilise l'import à gauche » ne correspond à aucun bouton visible dans la zone annoncée.

**Action** :
- Vérifier le placement réel du bouton d'import.
- Soit repositionner le bouton pour qu'il corresponde au texte, soit mettre à jour le texte pour désigner l'emplacement réel.
- Cohérence texte ↔ UI.

**Validation** : l'utilisateur qui lit le message doit trouver le bouton en 2 secondes.

---

## 4. Phase B — Refonte du flux premier contact

Objectif : transformer la séquence « arrivée → mode démo activé → tableau de bord riche » en un parcours guidé cohérent, sans pile de modales.

**Priorité intra-phase** :
- 🔴 **Bloquants** : B.3 (accueil humain), B.4 (états vides)
- 🟠 **Structurels** : B.1 (file de modales), B.6 (transition démo→réel)
- 🟡 **Améliorations** : B.2 (clarification choix), B.5 (toast mise à jour)

### B.0 Mini-audit technique des modales (préalable à B.1)

**Pourquoi** : B.1 propose une file centralisée, mais c'est un changement architectural qui touche plusieurs modules qui s'ignorent aujourd'hui (démarrage `main.js`, migrations, backup, bienvenue, mise à jour déployée). Avant de concevoir la file, il faut cartographier l'existant.

**Livrable** : un document `docs/audit-modales-demarrage.md` qui recense :
- Chaque modale potentiellement affichée au premier lancement
- Le fichier et la fonction qui la déclenche
- La condition de déclenchement (première fois, version changée, données à migrer, etc.)
- La relation avec les autres modales (exclusive ? empilée ? indifférente ?)

**Sans ce mini-audit, B.1 est une estimation aveugle.** À faire avant de chiffrer ou d'entamer B.1.

### B.1 Séquence d'arrivée : une seule modale à la fois

**Problèmes adressés** : log points 2, 3, log « pile de modales ».

**État actuel** : à l'arrivée, l'utilisateur voit potentiellement en cascade :
- Modale de bienvenue (choix « Étape par étape » vs « Par exploration »)
- Panneau orange « mise à jour déployée »
- Notification discrète (invisible car derrière le panneau orange)
- Modale migration de données (selon état)
- Modale rappel backup

**Action** :
- Définir une **file de sollicitations** centralisée : une seule modale affichée à la fois, les suivantes s'affichent à la fermeture de la précédente.
- Priorité d'affichage (à discuter) : bloquants d'abord (migration), puis rappels (backup), puis découverte (bienvenue), puis notifications secondaires (mise à jour déployée en bas de pile).
- Le panneau « mise à jour déployée » est reclassifié en **toast non-bloquant en bas d'écran**, pas en modale flottante.

**Validation** : premier lancement → une seule modale visible, les autres s'enchaînent proprement.

### B.2 Choix « Étape par étape » vs « Par exploration » : effet réel

**Problème** : « Par exploration » bascule en mode démo sans explication (log point 3). L'utilisateur ne sait pas ce qui vient de se passer.

**Action** :
- Clarifier le texte des deux options : que fait réellement chacune ?
- Si « Par exploration » active le mode démo, le dire explicitement dans le bouton ou la description (« Avec données de démonstration »).
- À la fermeture de la modale, afficher un toast confirmant le choix (« Mode démonstration activé — tu peux le quitter à tout moment »).

**Validation** : l'utilisateur comprend sans ambiguïté ce qui est activé.

### B.3 Accueil humain : « Qui m'accueille ? »

**Problème** (log point 5, verbatim) : « Je me sens tout seul devant le guichet. »

**Action** :
- Sur la page d'accueil, en haut, ajouter un **bandeau d'accueil actif** qui :
  - Salue l'utilisateur
  - Résume en 1 phrase ce qu'est Labo Codex (destinataire : enseignant du collégial qui suit ses étudiants)
  - Propose **1 action amorce claire** (« Commencer par explorer les données démo » ou « Configurer mon premier groupe-cours »)
- Ce bandeau disparaît dès que l'utilisateur a créé son premier groupe-cours ou activé une démo.
- Pas de tutoriel long, pas de vidéo, pas de chat bot — juste un point d'ancrage humain.

**Validation** : un nouvel utilisateur arrive et sait immédiatement quoi faire ensuite.

### B.4 États vides de la navigation : guidance par page

**Problèmes adressés** : log point (h), « tout est vide, inerte, pas invitant », parcours complet de la navigation avant activation démo.

**Action** :
- Pour chaque onglet principal (Aperçu, Structure, Contexte, Suivi, Évaluation, Outils), définir un **état vide actionnable** :
  - Titre court expliquant ce qu'on fera ici
  - 1 ou 2 actions amorces (bouton ou lien)
  - Un lien « Voir avec les données démo » si pertinent
- Cohérent avec le design system (`design-system.html`).

**Validation** : même sans données, chaque page donne envie d'agir et indique comment.

### B.5 Repositionnement du panneau « mise à jour déployée »

**Problème** : la modale orange apparaît en haut à droite par-dessus le contenu, bloquant la lecture d'autres notifications (log point 3).

**Action** :
- Transformer en toast discret en bas d'écran avec bouton « Recharger ».
- Ne pas interrompre l'utilisateur pendant qu'il travaille.
- Persistance du toast (réapparaît à chaque changement de page) jusqu'au rechargement.

**Validation** : la notification est visible sans masquer le contenu principal.

### B.6 Transition démo → données réelles

**Problème** : si le premier contact repose sur le mode démo, la sortie du mode démo vers les vraies données est critique. Aujourd'hui, le bouton « Quitter la démo » existe, mais rien ne guide l'utilisateur sur ce qu'il faut faire ensuite (créer un groupe-cours, importer des étudiants, configurer un horaire).

**Action** :
- Après `Quitter la démo`, afficher un **écran de transition** qui propose :
  - 1 amorce claire « Commencer avec mon vrai groupe-cours » → redirection Contexte avec le toggle Cours ouvert
  - 1 amorce secondaire « Importer depuis un codex existant »
  - 1 lien « Revenir en mode démo » (en cas de hésitation)
- Documenter explicitement ce que le `Quitter la démo` fait : supprime-t-il les données démo ? Les conserve-t-il en arrière-plan ? L'utilisateur doit le savoir.

**Validation** : un utilisateur qui quitte la démo ne se retrouve pas devant une app vide sans savoir quoi faire.

---

## 5. Phase C — Désamorçage du jargon

Objectif : rendre le vocabulaire spécialisé progressif. L'utilisateur rencontre un terme métier seulement quand il est prêt à le comprendre.

### C.1 Inventaire du jargon au premier contact

**Termes identifiés dans l'audit** (log) :
- Indices ACP (A, C, P)
- SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français)
- Holistique / Analytique / Algorithmique
- Cartouche de rétroaction
- Rubrique
- Grille de critères
- Échelle de performance
- Pratique de notation
- IDME
- RaI (niveaux 1, 2, 3)
- Complétion, Construction de P

**Action** :
- Liste exhaustive dressée dans un tableau (`docs/glossaire-premier-contact.md`) : terme → définition courte → premier endroit où l'utilisateur le rencontre.
- Pour chaque terme, décider :
  - Doit-il apparaître au premier contact ? Si non, le masquer ou le remplacer.
  - S'il doit apparaître, est-il introduit avec un exemple ?

### C.2 Tooltip enrichi (v1) — Glossaire latéral différé (v2)

**Décision de cadrage** : démarrer minimaliste. Un panneau latéral glossaire est un composant UI nouveau, coûteux à créer/maintenir/brancher sur des dizaines de termes. Avant d'investir ce coût, valider qu'un tooltip enrichi suffit.

**v1 — Tooltip enrichi** (livrable du chantier) :
- Tout terme spécialisé affiché dans l'UI est soulignable en pointillé.
- Au tap, un tooltip apparaît (composant existant, réutilisé) avec :
  - Définition courte (1-2 lignes)
  - Exemple concret (1 ligne)
- Fermeture au tap ailleurs.
- Ne touche pas l'action en cours.

**v2 — Panneau latéral glossaire** (à envisager si v1 insuffisant) :
- Seulement si les tooltips enrichis s'avèrent trop petits pour les termes complexes (SRPNF, holistique/analytique/algorithmique).
- Décision différée à un plan ultérieur, avec justification empirique.

**Validation v1** : tap sur « SRPNF » → tooltip lisible avec exemple concret apparaît, disparaît proprement.

### C.3 Simplification du changelog « Nouvelles »

**Problème** : la section Nouvelles présente des changements techniques incompréhensibles pour un néophyte (log point g1).

**Action** :
- Filtrer le changelog affiché aux nouveaux utilisateurs : n'afficher que les **entrées orientées utilisateur** (features visibles, corrections de bugs visibles).
- Pour un utilisateur néophyte (0 évaluation enregistrée), masquer la section Nouvelles ou la reléguer en bas de page.
- Alternative : renommer « Nouvelles » en « Dernières améliorations » et présenter sous forme narrative courte.

### C.4 États vides vocabulaire

**Action** :
- Toute page vide qui mentionne un terme spécialisé doit le contextualiser :
  - ❌ « Aucune cartouche de rétroaction »
  - ✅ « Les cartouches décrivent comment chaque niveau de performance se manifeste dans les travaux. Tu peux en créer à partir de zéro ou importer un modèle. »

---

## 6. Phase D — Révision des hubs Parcourir / Piloter

Objectif : revoir la hiérarchie des points d'entrée de l'accueil pour qu'aucun hub ne soit perçu comme une « barrière » ou « pas pour moi ».

### D.1 Diagnostic actuel

- **Parcourir/Configurer** (log point e) : perçu comme complexe, l'utilisateur « n'est pas prêt à configurer ».
- **Piloter** (log point f) : perçu comme « pour plus tard, pas pour moi », trop ambitieux.
- **Découvrir** : le seul hub qui parle à un néophyte, mais il se vide rapidement.

### D.2 Hypothèses de refonte (à discuter avant implémentation)

Trois directions possibles, **classées par effort et conséquences** :

- **Hypothèse 1 — Renommage et indicateur de progression** (effort faible)
  - Renommer les hubs pour signaler une progression (Découvrir → Configurer → Piloter).
  - Ajouter un indicateur visuel « tu en es là » basé sur le contenu existant (présence de groupe-cours, d'évaluations).
  - Pas de nouveau système d'état utilisateur. On lit ce qui existe déjà en storage.

- **Hypothèse 2 — Désactivation conditionnelle** (effort moyen à élevé)
  - Désactiver visuellement (pas masquer) les hubs prématurés tant que certaines conditions ne sont pas remplies.
  - ⚠️ **Introduit un système d'états utilisateur qui n'existe pas aujourd'hui** — c'est un chantier dans le chantier.
  - À n'envisager que si H1 s'avère insuffisant empiriquement.

- **Hypothèse 3 — Fusion Parcourir + Piloter** (effort moyen)
  - Fusionner les deux hubs en un seul hub « Avancé ».
  - Changement de navigation notable, impact sur la documentation et les habitudes d'utilisateurs existants.

**Recommandation de cadrage** : démarrer par H1 (faible effort, réversible), mesurer l'effet sur un nouveau test terrain, puis escalader vers H2 ou H3 seulement si nécessaire.

**Décision à prendre** : quel modèle mental Grégoire veut-il pour les hubs ? Progression linéaire, choix libre, ou adaptatif ?

Cette décision doit être validée avant implémentation.

### D.3 Action conditionnelle

Une fois la direction choisie :
- Mettre à jour l'accueil (`index.html` + CSS).
- Ajuster les textes des hubs selon la décision.
- Vérifier que le mode démo bascule la perception (après activation démo, Parcourir/Piloter devient plus accessible ?).

---

## 7. Ordonnancement et livraison

### 7.1 Ordre recommandé

1. **Phase A** (correctifs) — d'abord, parce qu'elle débloque l'observation propre des phases suivantes.
2. **Phase B** (flux premier contact) — colonne vertébrale de la refonte.
3. **Phase C** (jargon) — peut commencer en parallèle de B à partir de C.1 (inventaire).
4. **Phase D** (hubs) — en dernier, après que les bases (accueil humain, états vides) soient en place.

### 7.2 Livraison par petits commits

- Chaque sous-point (A.1, A.2, etc.) est un commit séparé.
- Chaque commit documente ce qui change et pourquoi dans le message.
- Mise à jour de `version.json` à chaque commit significatif (beta 99.18 → 99.19 → ...).
- Mise à jour de `SESSION.md` au fil de l'eau.

### 7.3 Validation par plateforme

- **Chaque changement est testé d'abord sur iPad Safari** (plateforme prioritaire).
- Un test Mac est fait ensuite pour vérifier qu'on ne régresse pas.
- Si un comportement diffère entre plateformes, on arbitre explicitement dans le commit.

### 7.4 Critère de complétion du chantier

Le chantier est terminé quand un nouvel utilisateur, partant de zéro sur iPad, peut :
1. Comprendre en moins d'1 minute ce qu'est Labo Codex.
2. Atteindre une première action productive (voir une évaluation démo, créer un groupe-cours) sans lire la documentation.
3. Naviguer dans les sections vides sans se sentir perdu.
4. Rencontrer le vocabulaire spécialisé progressivement, toujours avec un exemple.

Un nouveau test terrain (comme celui du 18 avril) valide ou non l'atteinte.

---

## 8. Risques et points d'attention

- **Régression fonctionnelle** : toucher à l'accueil et aux modales peut casser des parcours existants. Tester l'ensemble des modules après chaque phase.
- **Étendue créée par découverte** : l'audit a déjà fait grossir le périmètre de 7 à 20 points. D'autres découvertes surviendront pendant l'implémentation. Principe : on les traite, on les documente, on ne les repousse pas — mais on les isole dans des commits dédiés pour garder la traçabilité.
- **Compatibilité Mac** : observations faites sur iPad. Certains correctifs peuvent avoir un comportement différent sur Mac (ex : modales, info-bulles). Vérification systématique.
- **Coût de test** : chaque itération demande un rechargement + cache clear + re-test néophyte. Mitigé par le fichier `_headers` désormais en place.

---

## 9. Hors périmètre

Pour garder le chantier cadré, sont **exclus** de ce plan :

- Refonte des modules métiers (évaluation, planification, RaI, suivi).
- Refonte du design system au-delà des composants d'accueil et d'états vides.
- Nouveaux outils ou fonctionnalités.
- Changements de noms de modules (sauf micro-copy d'accueil).

Ces éléments peuvent apparaître dans des plans séparés si besoin.

---

## Annexes

### Annexe A — Journal UX 18 avril 2026

Fichier source : `Audit UX/LOG UX 18 avril.txt`

Journal intégral d'une session d'exploration néophyte sur iPad. 99 lignes de verbatim horodaté, qui trace le parcours réel depuis le taper de l'adresse jusqu'à la création tentée d'un groupe-cours.

### Annexe B — Captures d'écran

Dossier : `Audit UX/`

- `IMG_6019.PNG` (09:42) — titre Safari obsolète : « Système de suivi Beta 96.2 - Hiver 2026 »
- `IMG_6020.PNG` (09:43) — modale de bienvenue + panneau orange update simultanés
- `IMG_6027.PNG` (10:22) — modale Conseil sur grilles de critères (jargon SRPNF)
- `IMG_6028.PNG` (10:22) — modale Conseil pratique (formule algorithmique)
- `IMG_6029.PNG` (10:24) — modale « Comment fonctionne la bibliothèque » (empilement)
- `IMG_6030.PNG` (10:24) — bibliothèque de grilles (découverte progressive)
- `IMG_6031.PNG` (10:43) — formulaire étudiants avec import peu lisible
- `IMG_6032.PNG` (10:45) — « + Nouveau groupe-cours » révélant les selects cachés

### Annexe C — Audit technique existant

Fichier : `docs/audit-premier-contact.md`

Inventaire technique des 11 artefacts UI (bulles, modales, toasts, bandeaux) au premier contact. Sert de référence pour localiser les fichiers et fonctions à modifier.

### Annexe D — Liens vers les skills métier

À consulter pendant l'implémentation pour éviter les régressions sur le vocabulaire métier :
- `Skills pour Claude Code/SKILL_labo_codex.md`
- `Skills pour Claude Code/SKILL_Ecosysteme_classe.md`
- `Skills pour Claude Code/SKILL_Alignement.md`
- `Skills pour Claude Code/SKILL_RaI.md`

---

## Suivi du chantier

| Phase | État | Commits | Notes |
|---|---|---|---|
| A.1 Métadonnées HTML | À faire | — | — |
| A.2 Modale migration iPad | À faire | — | — |
| A.3 Groupe démo Contexte | À faire | — | — |
| A.4 Tour guidé branché | À faire | — | Peut dépendre de B |
| A.5 Info-bulles intermittentes | À faire | — | — |
| A.6 « ? » boutons aide | À faire | — | — |
| A.7 Import étudiants | À faire | — | — |
| B.0 Mini-audit modales | À faire | — | Préalable à B.1 |
| B.1 File de modales | À faire | — | Dépend de B.0 |
| B.2 Choix exploration clarifié | À faire | — | — |
| B.3 Accueil humain | À faire | — | — |
| B.4 États vides actionnables | À faire | — | — |
| B.5 Toast mise à jour | À faire | — | — |
| B.6 Transition démo → réel | À faire | — | — |
| C.1 Inventaire jargon | À faire | — | Produire `docs/glossaire-premier-contact.md` |
| C.2 Tooltip enrichi (v1) | À faire | — | Dépend de C.1. v2 panneau latéral différé |
| C.3 Simplification Nouvelles | À faire | — | — |
| C.4 États vides vocabulaire | À faire | — | Dépend de B.4 |
| D.1 Diagnostic hubs | À faire | — | — |
| D.2 Décision direction hubs | À faire | — | Validation Grégoire requise |
| D.3 Implémentation hubs | À faire | — | Dépend de D.2 |

Ce tableau est mis à jour au fil du chantier.
