# Note de conception — Comparateur de pratiques, axe D (variantes et parenté arborescente)

> **Statut** : **conception en cours** — décisions de cadrage actées avec Grégoire le **8 juin 2026** (Cowork). **Aucun code.** La présente note précède toute SPEC ; elle fixe l'intention et isole les questions à trancher.
> **Cadre** : `SPEC_comparateur_pratiques.md` (phase 1, close) ; finalité §1 bis (« sortir du paradigme du cumul ») ; skill `SKILL_pratiques_notation.md`.
> **Position dans la série** : l'**axe D** est un *nouvel objet de comparaison* (décliner une pratique en variantes + tracer leur parenté). Il est **orthogonal** à la « phase 2 » de la SPEC (vue sur **données réelles**, §6) : ici, on reste sur **données démo** (hypothèse de travail §3). Les lots **C0–C4** (matrice, fiche, export, portes d'entrée) sont **livrés** ; D s'y greffe.
> **Précaution** : les emplacements `fichier:ligne` datent du 8 juin 2026 — **revérifier au moment de coder**.

---

## 1. Origine et intention

Demande de Grégoire (8 juin) : pouvoir **comparer des pratiques de sa bibliothèque** et **différentes configurations** qui lui permettraient de **simuler, puis de faire des choix**.

Confrontée à l'existant, la demande se scinde en deux moitiés de statut très différent :

- **Comparer des pratiques distinctes** : **déjà livré** (lot C4). `_pratiquesDisponibles()` (`comparateur-pratiques.js:224`) peuple les sélecteurs avec les trois familles codées (SOM/STD/SPE) **et toutes les pratiques configurables enregistrées** (`pratiquesConfigurables`, lues par `_configsPratiques()` `:193`). « Comparer ce que j'ai dans ma bibliothèque » fonctionne.
- **Décliner une pratique en configurations à simuler** : **neuf**. Le code note d'ailleurs explicitement que synthétiser « une config à la volée » est *hors C1, à revoir* (`comparateur-pratiques.js:222`).

L'axe D ne reconstruit donc rien de la moitié déjà faite ; il ajoute la **capacité de variantes** et la **structure qui les relie**.

---

## 2. Décisions actées (8 juin 2026)

| # | Décision | Motif |
|---|---|---|
| D-1 | **Objet « les deux »** : comparer des pratiques distinctes (existe) *et* décliner une pratique en variantes (neuf). | Demande explicite. |
| D-2 | **Finalité inchangée** : *comprendre les effets*, **jamais recommander**, débouche sur l'assistant. « Faire des choix » = décider en connaissance de cause, **hors de l'outil**. | Continuité SPEC §1/§1 bis ; anti-pattern « palmarès de générosité » réaffirmé. |
| D-3 | **Une variante est une pratique réelle enregistrée** dans la bibliothèque (pas un objet éphémère). | Continuité SPEC §2 (« les essais vivent dans la bibliothèque ») ; le Comparateur reste **lecture seule**. |
| D-4 | **Geste de création réutilisé, pas réinventé** : la duplication existante + l'assistant. **Pas de second éditeur de pratique.** | Zéro-dette (CLAUDE.md) ; « le Comparateur débouche sur l'assistant, pas l'inverse » (SPEC §1). |
| D-5 | **Parenté tracée, modèle ARBRE** (tronc → branches → sous-branches). | Réponse de Grégoire : « on trace une parenté », sur le principe Git. |
| D-6 | **Périmètre = arbre + diff. Pas de merge. Pas d'historique temporel.** | Le merge de pratiques n'a pas de sémantique pédagogique fiable et ferait passer d'un arbre à un graphe ; l'historique est un chantier de versioning hors besoin. |
| D-7 | **Le diff de config est la brique pédagogique centrale** : montrer *ce que le réglage change dans ce qu'on mesure*, pas le chiffre qui bouge. | C'est l'**anti-palmarès** appliqué aux variantes (équivalent des engagements E1-E3 pour les pratiques distinctes). |
| D-8 | **Structure Git en interne, vocabulaire d'enseignant en surface.** | Public cible = utilisateur SOM novice (SPEC §2), pas développeur. « Pratique de base » / « déclinaison » / « ce qui change » plutôt que tronc / branche / diff. |

---

## 3. Hypothèses de travail (retenues par défaut, non formellement tranchées)

1. **Données démo** : l'axe D reste sur les profils-types démo, comme le Comparateur actuel. « Comprendre les effets » n'exige pas les données réelles ; la bascule réelle reste la phase 2 de la SPEC (orthogonale, hors D).
2. **Invariant lecture seule préservé** : le Comparateur **lit** l'arbre et calcule le diff ; il **n'écrit jamais**. La seule écriture (créer une variante, poser le lien de parenté) passe par **l'assistant / la duplication** — le lieu d'écriture qui existe déjà.

> Ces deux hypothèses sont à confirmer par Grégoire ; elles ne sont pas neutres (cf. §9, questions 1 et 7).

---

## 4. Constat technique (vérifié le 8 juin 2026)

| Élément | État | Conséquence pour D |
|---|---|---|
| **Geste « dupliquer »** | `dupliquerPratique(id)` existe (`js/pratiques.js:2109`) : crée une copie nommée, l'ajoute à la bibliothèque (`PratiqueManager.sauvegarderPratique`). Bouton « Dupliquer » dans la liste (`:1715`). | La brique « créer une variante » **existe** — ne pas la rebâtir. À **enrichir** d'un champ de parenté (D-5). |
| **Assistant** | `wizard-pratique-v2.js` a un mode « adopter un modèle » qui **copie une config dans une nouvelle pratique** (`:125`). | Voie d'édition d'une variante ; **réutiliser**, ne pas dupliquer la logique. |
| **Parenté** | **Absente.** La duplication produit une pratique **autonome**, sans lien vers son origine. Le mot « variante » présent dans le code désigne autre chose (variante de *calcul* « par-objectifs », variante d'*affichage* « attention »). | **Brique neuve nº 1** : le lien de parenté (§5). |
| **Forme d'une pratique configurable** | Trois blocs : `echelle` + `structure_evaluations` + `calcul_note` (cf. `pratiques-predefines.js`). | Le **diff** porte sur ces blocs (§6). |
| **Lecture par le Comparateur** | `_configsPratiques()` lit `pratiquesConfigurables` ; `_pratiquesDisponibles()` peuple les sélecteurs ; `simulerIndices(da, pratiqueId)` (`portfolio.js:714`, lecture seule) calcule la note simulée. | Le Comparateur reste un **consommateur** ; D ajoute un lecteur d'arbre + un calcul de diff, tous deux en lecture seule. |

---

## 5. Brique neuve nº 1 — le lien de parenté (l'arbre)

**Modèle minimal.** Ajouter à la config d'une pratique un champ `parentId` : l'`id` de la **pratique de base** dont elle dérive ; `null` pour une pratique « tronc » (racine).

- **Pose du lien** : `dupliquerPratique(id)` renseigne `parentId = id` de la source au moment de la copie. Une variante connaît sa mère dès sa naissance ; aucune saisie supplémentaire.
- **Reconstruction de l'arbre** : parcours des `pratiquesConfigurables` en regroupant par `parentId`. Fonction de lecture pure ; aucune nouvelle source de vérité (la bibliothèque reste la SSOT, le `parentId` n'est qu'une arête).
- **Profondeur** : une déclinaison peut elle-même être déclinée (sous-branche). L'arbre n'est pas limité à un niveau.
- **Racines possibles** : une variante peut brancher depuis une autre configurable **ou** depuis une famille codée (SOM/STD/SPE). → cf. question ouverte §9.3 (le `parentId` peut-il pointer une famille codée, qui n'est pas une entrée de `pratiquesConfigurables` ?).

**Ce que l'arbre apporte concrètement** : le Comparateur (et la bibliothèque) peut afficher « ma PAN-Standards » avec ses déclinaisons rangées dessous, au lieu de trois entrées plates sans lien apparent — le problème d'encombrement identifié quand on a choisi « variantes enregistrées » (D-3).

---

## 6. Brique neuve nº 2 — le diff de config (le cœur pédagogique)

**Fonction pure** `diffPratiques(idA, idB)` → liste structurée des différences sur `echelle` / `structure_evaluations` / `calcul_note`. Lecture seule, sans effet de bord.

**Rendu = livrable de contenu, pas une sortie technique.** Le diff brut (`calcul_note.methodeSelection: "toutes" → "n-meilleures"`) ne dit rien à un enseignant. Il faut un **mapping paramètre → phrase d'effet** — exactement le statut des « phrases de contexte » du lot C2 (contenu écrit à la main, validé par Grégoire) :

| Différence de config | Phrase d'effet (à rédiger / valider — exemples) |
|---|---|
| `n-meilleures` (7) au lieu de `toutes` | « Retient les 7 meilleures performances → efface les premiers essais ratés ; la note reflète la fin de parcours. » |
| poids terminale 40 % → 60 % | « La démonstration finale pèse plus → la trajectoire récente domine la moyenne. » |
| reprise illimitée vs reprise unique | « Une production peut être reprise sans plafond → la note suit la maîtrise quand elle finit par s'installer. » |

C'est **l'anti-palmarès des variantes** (D-7) : à chaque déclinaison, on lit d'abord *ce qui change dans ce qu'on mesure*, et seulement ensuite l'effet sur le chiffre (discret, jamais en vedette — continuité E3).

> Le mapping est **borné** : il ne couvre que les paramètres réellement variables des familles de phase 1. Un paramètre sans phrase associée → repli neutre (« réglage modifié »), **jamais** d'échec.

---

## 7. Brique neuve nº 3 — le Comparateur élargi (lecture de l'arbre)

Aujourd'hui : référence + 1-2 candidates = **3 colonnes** (contrainte iPad assumée, SPEC §3.5). Décliner une pratique en N variantes met cette contrainte sous tension.

**Piste de séparation des rôles** (à valider) :

- **L'arbre est le navigateur** : une vue « pratique de base → ses déclinaisons » (dans la bibliothèque de pratiques, et/ou en tête du Comparateur). C'est là qu'on choisit *quoi* comparer.
- **La matrice + le diff sont le comparateur** : on y amène **2 nœuds** de l'arbre (la base et une déclinaison, ou deux déclinaisons), et le **diff §6** explique leur écart de sens avant la matrice des profils.

Ainsi on ne fait pas exploser la matrice : on compare **par paires** au sein d'un arbre, pas N colonnes simultanées. La richesse vient de la **navigation dans l'arbre**, pas de la largeur du tableau.

> À trancher (§9.4) : nombre de nœuds comparables à la fois ; où vit la vue « arbre » (bibliothèque, Comparateur, ou les deux).

---

## 8. Invariants et garde-fous (continuité SPEC §5/§6)

1. **Comparateur strictement lecture seule** : il lit `pratiquesConfigurables`, l'arbre (`parentId`) et calcule le diff ; il **n'écrit ni `parentId`, ni pratique, ni note**. Toute écriture passe par la duplication/l'assistant.
2. **Aucune écriture namespacée** (clés réelles **ni** `demo_*`) lors d'une session de comparaison ; pratique active inchangée ; snapshot avant/après égal.
3. **`diffPratiques` et le lecteur d'arbre sont des fonctions pures** — testables en Vitest, sans DOM.
4. **Parité moteur** : la note simulée d'une variante = `simulerIndices(da, varianteId)` (mêmes appels que le panneau profil) ; D n'introduit **aucun second chemin de calcul** (anti-pattern « deux systèmes de calcul »).
5. **Sécurité** : `echapperHtml()` sur tout nom de pratique/variante injecté (noms libres = données utilisateur) ; `data-action` (zéro handler inline) ; un test ajouté par lot livré (règle Défense I).

---

## 9. Questions ouvertes (à trancher avant SPEC)

1. **Données** : rester démo (hypothèse §3.1) ou ouvrir aux données réelles ? Décision orthogonale mais elle change la portée (« comprendre » vs « décider pour mon vrai groupe »).
2. **Suppression d'une pratique de base** : que deviennent ses déclinaisons orphelines ? (Re-parenter au grand-parent ? Devenir des troncs ? Refuser la suppression si descendance ?)
3. **Racine = famille codée ?** Le `parentId` peut-il pointer SOM/STD/SPE (qui ne sont pas des entrées de `pratiquesConfigurables`), ou la parenté ne vit-elle qu'entre configurables ?
4. **Largeur de comparaison** : combien de nœuds comparés simultanément (contrainte iPad 3 colonnes) ? Où vit la vue « arbre » (bibliothèque / Comparateur / les deux) ?
5. **Vocabulaire de surface définitif** : « pratique de base » / « déclinaison » (ou « variante » ?) / « ce qui change » (ou « différences » ?). À figer avec Grégoire (D-8).
6. **Mapping diff → phrases d'effet** (§6) : **livrable de contenu Grégoire**, à rédiger paramètre par paramètre pour les familles de phase 1.
7. **Lieu d'écriture du `parentId`** : confirmer que `dupliquerPratique` est le seul point qui le pose (et l'assistant en mode « adopter un modèle » — doit-il aussi poser le lien, ou ses créations restent-elles des troncs ?).

---

## 10. Découpage proposé (indicatif, à valider après tranche des §9)

| Lot | Contenu | Nature | Préalable |
|---|---|---|---|
| **D-0** | Modèle de parenté : champ `parentId` ; pose à la duplication ; lecteur d'arbre (fonction pure) ; tests Vitest. | données + moteur (additif) | tranche §9.2, §9.3, §9.7 |
| **D-1** | `diffPratiques(idA, idB)` (pur) + mapping paramètre → phrase d'effet (**contenu Grégoire**, §9.6). | moteur + contenu | §9.6 |
| **D-2** | Vue « arbre » (base → déclinaisons) dans la bibliothèque et/ou le Comparateur ; sélection des 2 nœuds à comparer. | UI | §9.4 |
| **D-3** | Intégration au Comparateur : diff §6 affiché avant la matrice ; continuité E1-E3 / ligne de garde ; deux modes, iPad. | UI | D-0, D-1, D-2 |
| **D-4** | Validation terrain (Mac + iPad, sombre + clair) + release `minor` + changelog (1 entrée utilisateur). | livraison | D-3 |

**Versionnage** : `minor` à la livraison (capacité visible nouvelle), confirmé par le jugement courant (CLAUDE.md « Avant chaque commit »).

---

## 11. Ce que cette note ne tranche pas (et l'assume)

La note **cadre l'intention** et **isole les inconnues** ; elle ne fige ni le modèle de données détaillé, ni l'UI, ni le mapping de contenu. Le prochain pas n'est **pas** du code mais : (a) trancher les questions §9 et §12 avec Grégoire, puis (b) une SPEC dans la lignée de `SPEC_comparateur_pratiques.md`. La séquence du projet (discussion → SPEC → lots validés → code) reste la garde contre l'empilement de dette.

---

## 12. Addendum 8 juin 2026 — réponses de Grégoire, affinements et tensions ouvertes

> Réflexion en cours, **rien n'est figé** (Grégoire : « continuons à réfléchir avant de tout fixer »). Cette section enregistre les réponses aux questions §9 et les tensions qu'elles soulèvent.

### 12.1 Non-régression de la modif comparateur (vérifiée le 8 juin)

Modif Claude Code (non commitée au moment de l'audit) : les `<select>` de candidates passent de la bannière « Comparer avec » à **l'en-tête de chaque colonne de simulation** ; câblage refait par **délégation** sur l'hôte persistant `#comparateur-matrice` ; test d'intégration mis à jour en miroir. **284/284 Vitest verts** ; invariant lecture seule préservé. *Test d'intégration WebKit non rejouable en sandbox Linux — à valider sur Mac.* **Effet positif pour D** : chaque colonne devient un point d'injection autonome, prêt à être pré-rempli depuis la vue arbre (D-2).

### 12.2 Réponses qui se rangent

- **§9.4 — tranché** : vue arbre **dans la bibliothèque** (`js/pratiques.js`), pas dans le Comparateur ; **max 3** pratiques comparées (statu quo). Séparation des rôles : la bibliothèque navigue l'arbre, le Comparateur compare par paires/triplets.
- **§9.6 — confirmé** : mapping diff → phrases d'effet = livrable de contenu Grégoire.
- **§9.3 — confirmé avec précaution** : parenté **entre configurables seulement** pour l'instant. Limite faible (toute déclinaison via « adopter un modèle » est déjà configurable ; la famille codée n'est qu'une racine conceptuelle). *Précaution* : typer `parentId` comme **identifiant libre** (pouvant un jour valoir `'sommative'`/`'standards'`/`'specifications'`), pas comme clé étrangère stricte → évite de bloquer un futur affichage de la famille codée comme racine visible.
- **§9.7 — confirmé** : tout vit dans la bibliothèque (archivage **et partage**). Règle proposée pour la pose du lien : *dériver* (duplication / « adopter un modèle ») → `parentId = source` ; *créer de zéro* → tronc (`parentId = null`).

### 12.3 Tension A — le bouton « Appliquer cette pratique » (§9 nouveau)

Demandé par Grégoire (rép. 1). **Légitime et ce n'est pas « recommander »** (l'enseignant choisit, l'outil exécute). Mais il heurte deux invariants :

1. **Écriture vs lecture seule (§8.1)** : appliquer = écrire la pratique active du groupe-cours. Sortie propre : « Appliquer » **délègue** au geste d'assignation existant (hors moteur lecture-seule du Comparateur) — il déclenche, il n'écrit pas (« débouche sur l'assistant »).
2. **Démo vs réel (§3.1)** : le Comparateur tourne en démo, « Appliquer » agirait sur le **vrai** groupe-cours → deux espaces qui se touchent. À décider : soit « Appliquer » **n'apparaît qu'hors démo**, soit il **assume le passage démo→réel** avec un palier de confirmation qui rappelle *ce que la pratique mesure* (anti-palmarès), pas un simple « confirmer ».

### 12.4 Tension B — parenté permanente OU transitoire ? (le nœud central)

Les réponses 2 et 5 tirent en sens opposés :

- **Rép. 2 (transitoire)** : une fois une pratique appliquée, ses variantes **deviennent des troncs autonomes**, émancipés et rangés en répertoires. → l'arbre est un **espace de travail temporaire** (modèle « branches de feature » Git) ; `parentId` est posé pendant l'exploration puis **remis à `null` à l'application**.
- **Rép. 5 (permanente)** : vocabulaire **généalogique/génétique**, qui suppose une filiation *durable* (lignée, ascendance, descendance).

**Les deux ne tiennent pas ensemble.** Si le cordon est coupé à l'application, « lignée » devient trompeur. **À trancher** : après application, garder la **trace documentaire** « née comme variante de X » (lien permanent mais inerte) ou **couper net** (troncs sans mémoire d'origine) ? Décision qui commande **le modèle de données ET le vocabulaire**.

### 12.5 Vocabulaire (§9.5) — dépend de 12.4

Candidat le plus solide : **« souche »** (base dont on tire des variations), commun aux deux métaphores. Mariage proposé : **« souche » / « variante » / « ce qui change »** (registre *expérimentation*, cohérent avec rép. 7). Éviter **« mutation »** (hasard/défaut, alors que la variation est intentionnelle) et **« mère/descendance »** *si* le lien est transitoire (12.4). Si Grégoire choisit la parenté **permanente**, le lexique de filiation (« mère / lignée ») redevient honnête.

### 12.6 Tension C — dépendance à #320 (répertoires)

« Rangées dans des répertoires clairs » (rép. 2) + « lieu d'archivage et de partage » (rép. 7) font reposer le rangement post-application sur les **répertoires de bibliothèques (#320)** — au backlog, non livrés. **L'axe D n'est donc plus autonome** : sans #320, les variantes émancipées retombent dans une liste plate (l'encombrement qu'on voulait résoudre). À acter comme **dépendance**, ou à séquencer #320 dans D.

### 12.7 Nouvelles questions ouvertes (s'ajoutent à §9)

- **Q8 — TRANCHÉE (8 juin)** : **pas d'application depuis le comparateur.** Le comparateur reste purement contemplatif (lecture seule, §8.1 sauf). L'application/usage d'une pratique se fait dans la **bibliothèque et la sidebar**, comme pour les grilles, échelles et cartouches. La tension A (12.3) tombe.
- **Q9 — TRANCHÉE (8 juin)** : **parenté transitoire**, vocabulaire **« souche / variante d'essai »** (registre exploration, pas filiation permanente). Conséquences : `parentId` n'est pas un attribut durable ; pas de lexique « mère / lignée / descendance ».
- **Q10** : le partage d'une variante (rép. 7) emporte-t-il sa souche, ou la variante part-elle seule ? *Recoupé par T2 (12.9) : sans doute seules les variantes promues sont partageables.*
- **Q11** : #320 — dépendance déclarée de D, ou intégré dans le périmètre de D ? (12.6, renforcé par T2)

---

## 13. Deuxième passe de tensions (8 juin 2026, après tranche Q8/Q9)

> Trancher Q8/Q9 a résolu deux tensions et en a révélé d'autres. Hiérarchisées par gravité ; les mineures sont signalées comme telles (pas de critique performative).

### 13.1 T1 (forte) — le déclencheur d'émancipation est devenu orphelin

La parenté transitoire (Q9) reposait, en rép. 2, sur *« une fois la pratique appliquée »* comme moment de bascille variante → souche autonome. Or Q8 **retire l'application du comparateur**, et « appliquer » se dilue (une grille/échelle s'assigne, ne s'« applique » pas). **Le cycle de vie n'a plus de moment de bascule défini.** Sortie proposée (à valider) : remplacer le déclencheur automatique par un **geste manuel** dans la bibliothèque — *« promouvoir cette variante »* (devient une pratique à part entière, `parentId → null`) ou *« jeter »*. Sans ce geste, « transitoire » n'a plus de mécanisme. **→ Q12.**

### 13.2 T2 (forte) — « essai » contredit « archivage / partage »

*Essai* = jetable, provisoire ; or la variante vit dans la bibliothèque, lieu d'**archivage et de partage** (rép. 7). Deux frictions : (a) **partage de brouillons** — il faut sans doute que seules les variantes **promues** (T1) soient partageables ; (b) **pollution de la sidebar** — si les variantes d'essai apparaissent dans la sidebar de sélection « comme les grilles/échelles/cartouches », l'utilisateur choisit sa pratique active dans une liste encombrée de brouillons. Implication : un **statut « essai »** distinct, *visible dans la bibliothèque (atelier) mais masqué de la sidebar (sélection)* → renforce la dépendance #320 (Q11). **→ Q13.**

### 13.3 T3 (forte, UX) — concept léger, geste lourd

« Variante d'essai » évoque un bac à sable (tourner un bouton, voir l'effet). Le geste réel, vu le code : dupliquer → renommer → ouvrir l'assistant → changer un paramètre → sauver (5 étapes pour un poids). **Si explorer coûte cher, l'outil sera inerte.** L'éditeur inline a été écarté à raison (zéro-dette, ne pas doubler l'assistant, D-4) ; la contrepartie est cette lourdeur. Piste : un chemin **« dériver une variante » raccourci** depuis la souche (duplication + ouverture directe sur les paramètres + nom auto « *souche* · variante N »), pour que créer un essai coûte ~2 clics. **→ Q14.**

### 13.4 T4 (mineure, assumable) — asymétrie d'interaction

Le modèle « bibliothèque + sidebar » est importé des grilles/échelles/cartouches (plats), mais on ajoute aux **pratiques** une arborescence souche → variantes que ces objets n'ont pas. L'utilisateur apprend donc deux modèles (plat / arbre). Probablement justifié (une pratique a bien plus de leviers qu'une échelle), mais **à assumer consciemment**, pas par accident.

### 13.5 Non-tension à exploiter — le diff survit au « non calculable »

Le **diff de config est statique** (comparaison des blocs `echelle`/`structure_evaluations`/`calcul_note`) : il se calcule même quand `simulerIndices` renvoie « non calculable » (variante inachevée). L'outil garde donc de la valeur sur un essai à moitié réglé — la colonne note affiche le diagnostic #128, le diff reste lisible.

### 13.6 Questions ouvertes ajoutées

- **Q12** : geste de bascule variante → souche — manuel (« promouvoir » / « jeter »), automatique à un autre événement, ou statut purement déclaratif que l'utilisateur retire ? (T1)
- **Q13** : statut « essai » — comment distinguer atelier (visible) et sidebar (masqué) ? Lien avec #320. (T2)
- **Q14** : chemin « dériver une variante » raccourci depuis la souche — dans le périmètre de D ou prérequis UX ? (T3)

---

## 14. SYNTHÈSE CONSOLIDÉE — état de référence au 8 juin 2026

> Cette section est l'**état courant du design** : un lecteur (humain ou Claude Code) lit §14 pour savoir où on en est ; §1–13 conservent l'historique et les justifications. Toujours **pré-SPEC**, mais le modèle s'est stabilisé.

### 14.1 Vision (inchangée)

Aider l'enseignant à **comprendre ce que chaque pratique fait à la note**, en déclinant une **souche** en **variantes d'essai** comparées sur des profils-types, pour décider en connaissance de cause. **L'outil ne recommande jamais** (continuité SPEC §1 bis).

### 14.2 Modèle en trois lieux (révisé 8 juin — voir §17)

> ⚠️ **Révisé** : le « mode Atelier dans la bibliothèque » décrit initialement ici a été **déplacé dans le Labo** (§17). Schéma à jour :

```
   SIDEBAR              CONCEPTION › Pratiques     LABO › Exploration des pratiques
 (sélection)          (bibliothèque « propre »)    (élargit l'ex-Comparateur)
─────────────         ──────────────────────       ────────────────────────────────
 pratique active      pratiques ABOUTIES           souches + variantes d'essai
 (comme grilles,      (estEssai ≠ true)            arbre · diff · matrice
  échelles,           seules visibles ici          dérivation = assistant condensé
  cartouches)         = ce que la sidebar          les essais vivent ICI
```

**Règle d'or** : la bibliothèque (Conception) ne montre que des pratiques abouties ; tout ce qui est provisoire vit dans le **Labo › Exploration des pratiques**. C'est ce qui résout la pollution de la sidebar (T2) **et** l'aller-retour Conception↔Labo (§17).

### 14.3 Objets et vocabulaire (tranché Q9)

- **Souche** : pratique de référence dont on tire des variations.
- **Variante d'essai** : dérivée d'une souche (`parentId = souche`), **provisoire**, vit dans l'Atelier. Registre *exploration*, pas filiation.
- **Promotion** : geste **manuel** qui fait d'une variante d'essai convaincante une pratique complète (entre dans la bibliothèque « propre », devient applicable/sélectionnable). **Rejet** : on jette.

### 14.4 Cycle de vie (tranché 8 juin, rép. T1)

```
1. EXPLORATION        2. DÉCISION           3. EXPÉRIMENTATION     4. USAGE
   (Atelier, démo)       (geste manuel)        (réel, plus tard)     (sidebar)
─────────────────     ───────────────       ──────────────────     ──────────
 décliner · comparer  « promouvoir » /      tester la pratique     pratique
 comprendre (diff)    « jeter » ; l'usager  promue sur données     active du
                      clôt l'exploration    réelles (éventuel)     groupe-cours
                                            ← ex-« phase 2 »
```

L'**expérimentation réelle est une étape distincte, postérieure à l'Atelier** : le comparateur, lui, **reste démo**. L'invariant « comparateur = démo » tient ; la phase 2 (données réelles) est rangée dans le cycle, pas dans le comparateur.

### 14.5 Décisions actées (récap)

D-1…D-8 (§2) · Q8 : **pas d'application depuis le comparateur** · Q9 : **transitoire + « souche / variante d'essai »** · T2 : **bibliothèque propre vs mode Atelier** · T4 : **asymétrie arbre/plat assumée** (la complexité d'une pratique, vs une grille, justifie l'Atelier) · T1 : **fin d'exploration = geste manuel promouvoir/jeter**.

### 14.6 Briques techniques (consolidées)

- **Filiation = `inspireDe` (existant, permanent, CC BY)** enrichi d'un `sourceId` pour rendre l'arbre navigable (§15). **Pas de `parentId` séparé** — abandonné au profit de la filiation existante.
- **Statut « essai » = flag transitoire** (basculé à la promotion ; `inspireDe` intact). C'est lui qui porte la transitoirité de Q9, pas le lien d'origine (§15.2).
- `diffPratiques` **pur et statique** → survit au « non calculable » (§13.5) ; mapping → phrases d'effet = **contenu Grégoire**.
- Comparateur : **lecture seule, démo, 3 colonnes**, sélecteurs en en-tête (modif 8 juin), diff avant la matrice.
- **Vue arbre dans l'Atelier** (reconstruite via `inspireDe`/`sourceId`), pas dans le comparateur.
- **Aucune écriture/application** depuis le comparateur.

### 14.7 Problème central restant : l'HYGIÈNE (T1 reformulé par Grégoire)

Le risque n'est plus le mécanisme mais **l'accumulation de variantes semblables** (rejetées ou « gardées au cas où »). Le mode Atelier isole le bruit ; il ne l'élimine pas. Leviers :

- **Tri/filtre par nom, famille, date** (axes proposés par Grégoire) + souche d'origine tant que non promue.
- **Répertoires #320** : passent de luxe à **prérequis de confort** (dépendance D, Q11).
- **Péremption douce** (à discuter) : *signaler* les variantes d'essai dormantes — **jamais détruire automatiquement** (préservation des données, CLAUDE.md).

### 14.8 Questions encore ouvertes (resserrées)

- **Q14/Q15 (hygiène)** : dispositif concret de rangement des essais (tri nom/famille/date, #320, péremption douce signalétique).
- **Q16 (édition en Atelier)** : repasser par l'assistant, ou **mode expert** à édition directe ? Garde zéro-dette : ne pas créer un *second* moteur d'édition — viser l'assistant condensé. (rép. T2/T3)
- **Q17 — TRANCHÉE PAR LE DROIT (8 juin, §15)** : on **ne coupe jamais** la filiation. L'attribution (`inspireDe`) est **permanente** (CC BY) ; seul le **statut « essai »** est transitoire. Le `parentId` transitoire envisagé est abandonné au profit de `inspireDe` (permanent) + flag de statut.
- **Q18 (expérimentation réelle)** : cadrer l'étape 3 du cycle (ex-phase 2) — quand, comment, sans toucher l'invariant démo du comparateur.

---

## 15. Licences CC et remix (constat 8 juin 2026, vérifié dans le code)

> Sujet ouvert par Grégoire (« comment gérer les licences CC et les remix ? »). **Le gros est déjà construit** ; le droit CC **reconfigure** notre modèle de parenté (corrige Q9/Q17).

### 15.1 Faits établis (lus dans le code)

- **Licence unique** : tout le matériel est **CC BY-NC-SA 4.0** (`cc-license.js:17`), figée. Pas de ND, pas de multi-licence → **aucune matrice de compatibilité**, aucun cas « dérivés interdits ». Tout est remixable ; tout dérivé reste **SA** (même licence).
- **Filiation `inspireDe`** : sous-schéma standardisé (`import-export.js:326`, « filiation Plan §4.3, réutilisé sur tous les types »), forme `{nom, auteur, date}`, posé à chaque duplication « respect CC BY » (`pratiques.js:2122`, idem grilles/échelles/cartouches/productions via `BibliothequeUI.forgerInspireDe`), **affiché** par `cc-license.js:1193`.
- **Pratiques couvertes** : chaque copie est attribuée à l'auteur courant (`obtenirAuteurActif`) ; la **chaîne de contributeurs est maintenue** (`pratiques-gestion.js:1264`, champ `contributeurs`). *(Soupçon initial d'une lacune côté pratiques : infirmé.)*
- **Démo** : items `disabled` dans les sélecteurs, « à dupliquer pour utiliser » (`bibliotheque-ui.js:169`).

### 15.2 Conséquence — deux liens distincts, pas un seul `parentId`

Le droit CC impose de séparer ce que notre `parentId` (transitoire) confondait :

| Lien | Nature | Sert à | Durée |
|---|---|---|---|
| **Filiation / attribution** (`inspireDe`) | déjà existante | créditer l'origine (CC BY), surtout pour une souche **tierce** (Réserve) | **permanente** — jamais coupée |
| **Statut d'exploration** (flag « essai » / « aboutie ») | à créer | distinguer Atelier vs bibliothèque propre | **transitoire** — basculé à la promotion |

→ **Q9 « transitoire » s'applique au statut, pas à la filiation.** **Q17 tranchée** : la promotion bascule le flag, **sans toucher `inspireDe`**. Le `parentId` transitoire envisagé (§5, §12.2) est **abandonné**.

### 15.3 Ajustement technique — un `sourceId` sur la filiation

`inspireDe` = instantané `{nom, auteur, date}` **sans id** → trace l'attribution mais **ne permet pas de reconstruire un arbre navigable**. Pour la vue arbre de l'Atelier : **enrichir `inspireDe` d'un `sourceId`**. Un seul concept (l'origine) sert *l'attribution CC* **et** *la navigation de l'arbre* — pas de champ de parenté redondant. Modification légère et transversale (tous les matériels en profitent).

### 15.4 Remix d'une souche tierce — déjà couvert

Dériver une variante d'une pratique **importée** pose `inspireDe(auteur tiers)` ; l'export rejoue **BY-NC-SA + contributeurs**. Le geste de dérivation de l'Atelier **se branche sur l'infra existante**, il n'invente rien.

### 15.5 Suppression (rép. Grégoire)

**Libre en local** : CC régit la *distribution*, pas l'usage privé. Supprimer un essai raté = aucun enjeu de licence. *Réserve* : la suppression locale d'une variante déjà partagée n'efface pas les copies diffusées (fonctionnement normal de CC, pas un défaut).

### 15.6 Questions ouvertes ajoutées

- **Q19** : enrichir `inspireDe` d'un `sourceId` (reco) ou champ d'arbre séparé ? Impact transversal (sous-schéma partagé) — à coordonner avec `import-export.js`.
- **Q20** : nom et emplacement du **flag « essai »** sur la config de pratique ; règle de bascule à la promotion (flag essai→aboutie, `inspireDe` intact, entrée dans la bibliothèque propre / sortie de l'Atelier).

---

## 16. Séquençage acté (8 juin 2026)

**Décision Grégoire** : *SPEC de D maintenant → code DEN couche 2 (#318) → code D.*

1. **Conception de D maintenant** (sans code) : trancher le reliquat Q12-Q20, puis écrire la **SPEC de D** dans la lignée de `SPEC_comparateur_pratiques.md`. La SPEC **lit `NOTE-COWORK-modele-DEN.md`** (modèle DEN acté 6 juin) pour que le **diff** et le **mapping « ce que ce réglage change »** (D-1) intègrent DEN dès la conception.
2. **Code DEN couche 2** (#318 — « DEN-proper » : garde « cibles atteintes », note finale saisie, suggestion holistique, modes réduite/éliminée). Stabilise la **4ᵉ famille** avant les mécanismes transversaux de D.
3. **Code D** sur quatre familles stables.

**Motif** : conception ≠ dette (seul le code en consomme — d'où la SPEC maintenant) ; D bâtit des mécanismes **transversaux** (diff, mapping) qui doivent traiter les 4 familles **uniformément** → coder le diff/mapping avant que DEN soit créable exposerait au **rétrofit** (la dette que la règle zéro-dette réprouve).

**État de DEN au moment de la décision** : couche 1 livrée (#319 Lot 5 — reconnaissance, badge, carte « à venir ») ; **couche 2 non faite** (badge sans moteur) ; modèle de conception acté (`NOTE-COWORK-modele-DEN.md`).

### 16.1 Reliquat — décisions du 8 juin

**Tranché (Grégoire) :**

- **#320 = dépendance préalable** [Q11, Q13]. Claude Code livre les **répertoires de classement AVANT le code de D**. Motif : #320 sert *aussi* grilles/échelles/cartouches — chantier transversal qui existe pour lui-même, pas un sous-produit de D. *(Indépendant de DEN ; les deux sont préalables au code de D, leur ordre mutuel est libre.)*
- **Édition en Atelier = assistant condensé** [Q16]. Pas de second moteur d'édition (zéro-dette) ; l'assistant existant en version raccourcie. La lourdeur résiduelle (T3) est assumée, compensée par le chemin « dériver » raccourci (Q14).
- **Expérimentation réelle (étape 3) hors du premier jet** [Q18].

**Reste à trancher dans la SPEC (recommandation posée, validation en bloc) :** `sourceId` sur `inspireDe` [Q19] ; nom/emplacement du flag « essai » + règle de bascule [Q20] ; dispositif d'hygiène (tri nom/famille/date + péremption douce **signalétique**, jamais destructive) [Q12, Q14-15].

### 16.2 Ordre de réalisation consolidé

```
PRÉALABLES (code, ordre mutuel libre)        PUIS
┌─────────────────────────────┐
│ #320  répertoires de         │
│       classement (transversal)│──┐
├─────────────────────────────┤  ├──►  CODE de D (Atelier, variantes,
│ #318  DEN couche 2           │──┘      diff, arbre) sur 4 familles
│       (« DEN-proper »)       │         + #320 disponible
└─────────────────────────────┘
        ▲
        │ CONCEPTION (maintenant, sans code) :
        │ SPEC de D — tranche le reliquat 16.1, lit NOTE-COWORK-modele-DEN.md
        │ pour intégrer DEN au diff/mapping dès la conception.
```

**Conception close** : toutes les questions structurantes sont tranchées. La **SPEC est écrite** → `SPEC_D_exploration_pratiques.md` (8 juin 2026).

---

## 17. Architecture d'information — l'exploration vit dans le Labo (8 juin 2026)

> **Document canonique pour l'implémentation** : `SPEC_D_exploration_pratiques.md`. Cette note (§1-16) reste l'**historique de la réflexion** ; en cas de divergence, la SPEC et §14-17 priment.

**Problème soulevé (Grégoire)** : « Atelier » entrait en **confusion avec « Labo »**, et faire vivre l'exploration dans la bibliothèque imposait un **aller-retour Conception↔Labo** (les pratiques se gèrent sous *Conception › Pratiques de notation*, mais le Comparateur vit sous *Labo › Comparateur de pratiques* — vérifié dans `config.js`).

**Décisions (8 juin)** :

- **D-12 — l'exploration vit dans le Labo** : on **élargit la sous-section `Labo › Comparateur de pratiques` en « Exploration des pratiques »** (arbre souches/variantes + diff + matrice). Choix Grégoire : élargir le Comparateur plutôt qu'ajouter une sous-section. Le Labo est déjà le lieu de l'analyse/exploration (observation, modélisation, études, bilan) ; le Comparateur y est déjà.
- **Terme « Atelier » abandonné** (UI et SPEC) : remplacé par « Exploration des pratiques ». La confusion disparaît par hiérarchie (l'exploration est une *pièce du Labo*, pas un concept parallèle).
- **Distinction préservée** : *créer/éditer* une variante reste un acte de **conception** (l'assistant condensé), mais **invocable depuis le Labo** en surimpression, sans changer de section → pas de parcours tordu.
- **Stockage unique** : les variantes restent dans `pratiquesConfigurables`, filtrées par `estEssai` selon la vue (Labo montre les essais ; Conception et sidebar ne montrent que les abouties). Ce n'est pas un second dépôt.
- **Flag `estEssai`** (et non `statut`) : `statut` est déjà pris sur les étudiants (`config.js:217`, `'actif'`).
- **Contact `config.js`/`navigation.js`** (zones protégées) : renommer le `label` (`config.js:69`), **conserver l'`id` `'comparateur'`** (initialiseur `'labo-comparateur'`). **Aval Grégoire requis** ; précédent C4 (le Comparateur est déjà devenu une sous-section du Labo).

**Prochain pas** : validation du **découpage en lots** (SPEC §14) par Grégoire, puis livraison des **préalables #320 et #318** avant le code de D.
