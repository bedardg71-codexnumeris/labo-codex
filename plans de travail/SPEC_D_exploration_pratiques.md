# SPEC — Exploration des pratiques (Labo) : variantes, parenté et diff (axe D)

**Date** : 8 juin 2026
**Auteur** : Claude (Cowork) en réflexion avec Grégoire — conception **close** (voir `NOTE-CONCEPTION-D-comparateur-variantes-parente.md`, source des justifications)
**Destinataire** : Claude Code
**Statut** : ✅ **découpage en 6 lots validé par Grégoire le 8 juin 2026.** Prêt pour exécution par Claude Code, **après livraison des deux préalables #320 et #318** (§11). Démarrage possible de D-0/D-1 (moteur pur) en parallèle de DEN (§14).
**Succède à** : `SPEC_comparateur_pratiques.md` (phase 1, comparateur livré C0-C4). Le comparateur **reste un consommateur lecture seule** ; cette spec l'**élargit** en « Exploration des pratiques » (arbre + variantes + diff + matrice) et ajoute la **parenté**.
**Versionnage** : `minor` à la livraison (capacité visible nouvelle).
**Précaution** : les emplacements `fichier:ligne` datent du 8 juin 2026 — **revérifier au moment de coder**.

> **Note de nommage (8 juin)** : le terme de travail « Atelier » est **abandonné** — il créait une confusion avec la section « Labo ». L'espace d'exploration des variantes **est** une sous-section du Labo (§4). Le concept reste le même que dans la note de conception ; seul le mot de lieu change.

---

## 1. Vision

Permettre à l'enseignant de **décliner une pratique de notation en variantes d'essai**, de les **comparer pour comprendre ce que chaque réglage change**, puis de **promouvoir** celle qu'il retient — le tout dans **un seul lieu d'exploration au sein du Labo**, sans polluer ses pratiques abouties.

**Principe directeur (continuité SPEC phase 1 §1 bis)** : l'outil **fait comprendre, il ne recommande jamais**. Le **diff** — « ce que ce réglage change dans ce qu'on mesure » — est le cœur pédagogique ; l'écart de note reste discret. L'exploration débouche sur la décision de l'enseignant, jamais sur une recommandation codée.

**Anti-pattern nommé** (hérité) : le « palmarès de générosité ». Tourner les boutons jusqu'à la note la plus haute. Le diff existe pour l'empêcher : on lit d'abord *ce qui change dans la mesure*, ensuite seulement l'effet sur le chiffre.

---

## 2. Décisions actées (réflexion du 8 juin 2026)

| # | Décision | Réf. note |
|---|---|---|
| D-1 | Objet « les deux » : comparer des pratiques distinctes (livré) **et** décliner une pratique en variantes (neuf). | §2 |
| D-2 | Finalité : **comprendre les effets, jamais recommander**. « Faire des choix » = décider hors de l'outil. | §2 |
| D-3 | Une variante est une **pratique réelle** (même dépôt `pratiquesConfigurables`) ; l'exploration reste **lecture seule**. | §2, §13.1 |
| D-4 | **Geste de création réutilisé** (duplication + assistant), **pas de second éditeur**. | §2 |
| D-5 | **Parenté = filiation `inspireDe` existante** (permanente, CC BY) enrichie d'un `sourceId` ; **pas de `parentId` séparé**. | §15 |
| D-6 | **Statut « essai » = flag transitoire** (`estEssai`), basculé à la promotion ; `inspireDe` intact. | §15.2 |
| D-7 | **Diff de config = brique pédagogique centrale** (mapping « ce que ça change »). | §6, §13 |
| D-8 | **Trois lieux** : Conception › Pratiques (bibliothèque propre) · **Labo › Exploration des pratiques** (essais) · sidebar (sélection). | §17 |
| D-9 | **Pas d'application depuis l'exploration** ; usage via bibliothèque/sidebar (comme grilles/échelles/cartouches). | §12.7 Q8 |
| D-10 | **Édition = assistant condensé** invocable depuis le Labo (pas de moteur d'édition parallèle). | §16.1 |
| D-11 | **DEN : configurable et diffable, mais NON simulable** (jugement saisi) → pas de colonne note. | §15, `NOTE-COWORK-modele-DEN.md` §4 |
| D-12 | **L'exploration vit dans le Labo** : élargissement de la sous-section « Comparateur de pratiques » en « **Exploration des pratiques** » (arbre + variantes + diff + matrice). | §17 |

---

## 3. Modèle de données

### 3.1 Filiation (existante, à enrichir)

`inspireDe` est un **sous-schéma standardisé** (`import-export.js:326`, « filiation Plan §4.3 »), posé à chaque duplication par `BibliothequeUI.forgerInspireDe` (`bibliotheque-ui.js:134`), forme actuelle `{nom, auteur, date}`, affiché par `cc-license.js:1193`.

**Ajout D** : un champ `sourceId` (id de la pratique source) — `inspireDe = {nom, auteur, date, sourceId}`. Il sert **à la fois** l'attribution CC (permanente) et la **navigation de l'arbre** (souche → variantes). Modification **transversale** (le sous-schéma est partagé par grilles/échelles/cartouches/productions) → coordonner avec `import-export.js` ; `sourceId` **optionnel** (les filiations antérieures sans id restent valides, l'arbre les ignore).

> **Invariant CC** : `inspireDe` (et `sourceId`) ne sont **jamais effacés**, y compris à la promotion (§3.3). Couper l'attribution d'un dérivé violerait CC BY, surtout pour une souche tierce importée de la Réserve.

### 3.2 Statut d'exploration (neuf)

Un flag **`estEssai`** (booléen) sur l'enveloppe de pratique distingue **variante d'essai** (vit dans l'exploration, masquée de la sidebar et de la bibliothèque propre) de **pratique aboutie** (`estEssai` absent/false). Emplacement recommandé : à côté de `isDemo` (`pratiques.js:2128`).

> Nom choisi `estEssai` (et non `statut`) : `statut` est déjà utilisé sur les **étudiants** (`config.js:217`, valeur `'actif'`) — éviter la confusion sémantique.

| Champ | Rôle | Durée |
|---|---|---|
| `inspireDe.sourceId` | filiation / attribution + arête de l'arbre | **permanent** |
| `estEssai` | exploration vs bibliothèque propre | **transitoire** (basculé à la promotion) |

### 3.3 Cycle de vie

```
1. EXPLORATION         2. PROMOTION / REJET      3. (futur) EXPÉRIMENTATION   4. USAGE
   Labo · démo            geste MANUEL              données réelles             sidebar
──────────────────     ────────────────────      ──────────────────────       ──────────
 dériver une souche     « promouvoir » :          tester la pratique           pratique
 en variantes d'essai   estEssai → false,         promue (hors périmètre,      active du
 comparer (diff)        inspireDe INTACT          §13)                         groupe-cours
                        « jeter » : suppression
```

- **Promotion** = `estEssai` → false **uniquement** ; `inspireDe`/`sourceId` conservés. La pratique entre dans la bibliothèque propre, sort de l'exploration.
- **Rejet** = suppression franche (autorisée — §9 ; aucun enjeu CC en local).
- Aucune bascule automatique : c'est l'enseignant qui clôt l'exploration.

---

## 4. Les trois lieux

```
   SIDEBAR                CONCEPTION › Pratiques        LABO › Exploration des pratiques
 (sélection)            (bibliothèque « propre »)       (élargit l'ex-Comparateur)
─────────────          ────────────────────────        ────────────────────────────────
 pratique active       pratiques ABOUTIES              souches + variantes d'essai
 (comme grilles,       (estEssai ≠ true)               arbre · diff · matrice de comparaison
  échelles,            = ce que la sidebar             dérivation = assistant condensé
  cartouches)          propose                         les essais vivent ICI, pas ailleurs
```

- **Conception › Pratiques de notation** (existant) : la **bibliothèque propre**. Filtre `estEssai ≠ true`. Inchangée pour l'utilisateur courant ; cohérente avec ses sœurs (grilles, échelles, cartouches, toutes sous Conception).
- **Labo › Exploration des pratiques** (élargissement de `labo › comparateur`) : le lieu unique de l'exploration — l'**arbre** des souches/variantes, le **diff**, la **matrice de comparaison**, et le déclenchement de la **dérivation** (assistant condensé en surimpression). Montre les `estEssai === true`.
- **Sidebar** : sélection de la pratique active ; filtre `estEssai ≠ true` — jamais d'essai dans la sélection. *(Vérifier les call-sites de peuplement de la sidebar et de la bibliothèque pour appliquer le filtre.)*

> **Pourquoi le Labo, pas la bibliothèque** (D-12) : le Labo est déjà le lieu de l'exploration et de l'analyse (observation, modélisation, comparateur, études, bilan) et le Comparateur y vit déjà. Y regrouper l'exploration **supprime l'aller-retour Conception↔Labo**. La création reste un acte de conception (l'assistant), mais il est **invocable depuis le Labo** sans changer de section — d'où l'absence de parcours tordu.

### 4.1 Contact avec la navigation (zone protégée)

Élargir l'ex-Comparateur touche `config.js` / `navigation.js` (**zones protégées — aval Grégoire requis** ; précédent : C4 a déjà fait du Comparateur une sous-section du Labo). Périmètre minimal :

- `config.js:69` — **changer le `label`** `'Comparateur de pratiques'` → `'Exploration des pratiques'`. **Conserver l'`id` `'comparateur'`** pour ne pas casser l'initialiseur `'labo-comparateur'` de `navigation.js`.
- L'initialiseur de sous-section construit désormais : arbre + matrice + diff (le rendu actuel du comparateur en devient la vue « comparaison »).

---

## 5. L'arbre de filiation (dans le Labo › Exploration)

- **Reconstruction** : fonction **pure** parcourant les pratiques configurables, regroupant par `inspireDe.sourceId`. Une **souche** = pratique sans `sourceId` (ou dont la source n'est plus présente → racine de fait). Profondeur libre (une variante peut être dérivée).
- **Rendu** : souche → ses déclinaisons. `echapperHtml()` sur tout nom.
- **Sélection pour comparer** : depuis l'arbre, l'utilisateur envoie **2-3 nœuds** à la matrice (max 3, cf. SPEC phase 1 §3.5 / contrainte iPad).
- **Familles codées comme racines visibles** : hors périmètre (les 3 familles SOM/STD/SPE ne sont pas des entrées `pratiquesConfigurables`) ; `sourceId` typé **identifiant libre** pour ne pas fermer la porte. DEN incluse dès qu'elle est créable (#318).

---

## 6. Le diff de config (cœur pédagogique)

### 6.1 Moteur

**Fonction pure** `diffPratiques(idA, idB)` → liste structurée des différences entre les deux objets `config`. Lecture seule, sans effet de bord, **testable sans DOM**.

La config réelle comporte plusieurs blocs signifiants (constat `pratiques-predefines.js`) : `echelle` (niveaux, seuils %), `structure_evaluations` (pondération, terminaux), `calcul_note` (méthode, `conditions_speciales` comme plafonnement), `systeme_reprises` (illimitées/limitées, `niveau_retrogradable`), `seuils`, `gestion_criteres`. Le diff **balaie l'objet entier** ; le mapping (6.2) ne met en mots que les champs pédagogiquement parlants.

> **Propriété exploitée** : le diff est **statique** → il se calcule **même quand la note est « non calculable »** (variante inachevée, ou famille non simulable comme DEN). L'outil garde de la valeur sur un essai à moitié réglé.

### 6.2 Mapping « ce que ce réglage change » — livrable de contenu (Grégoire)

Le diff brut (`calcul_note.methode: A→B`) ne parle pas à un enseignant. Un **mapping paramètre → phrase d'effet** (écrit/validé par Grégoire, registre pédagogique, échappé) le traduit. Exemples de départ :

| Différence | Phrase d'effet (exemple à valider) |
|---|---|
| `systeme_reprises.type` limitées → illimitées | « Les reprises deviennent illimitées → la note suit la maîtrise quand elle finit par s'installer. » |
| `niveau_retrogradable` false → true | « Un niveau acquis peut redescendre → la note reflète la performance récente, pas le sommet atteint. » |
| `structure_evaluations.ponderation` égale → pondérée | « Certaines évaluations pèsent plus → la note se déplace vers les temps forts choisis. » |
| `conditions_speciales` (plafonnement ajouté) | « Un plancher de maîtrise est exigé sur les terminaux → réussir l'ensemble ne suffit plus sans eux. » |

**DEN** : ses réglages propres (mode réduite/éliminée, garde « cibles atteintes », suggestion holistique on/off) reçoivent **aussi** des phrases d'effet — c'est pourquoi DEN couche 2 doit exister avant le code de D (§11). Paramètre sans phrase → repli neutre (« réglage modifié »), **jamais** d'échec.

---

## 7. La matrice de comparaison (vue du Labo › Exploration)

Le rendu actuel du Comparateur **devient la vue « comparaison »** de l'Exploration. Inchangé dans sa forme (lecture seule, démo, 3 colonnes, sélecteurs en en-tête depuis la modif du 8 juin). Ajouts :

- **Le diff (6) s'affiche avant la matrice** quand les colonnes comparées partagent une souche (variantes d'une même base) — « ce qui change » d'abord, l'écart de note discret ensuite (continuité E1-E3).
- **Alimentation depuis l'arbre** : les colonnes peuvent être pré-remplies par la sélection faite dans l'arbre (chaque `<select>` d'en-tête est déjà un point d'injection autonome).
- **DEN non simulable** : une colonne DEN n'affiche **pas** un 4ᵉ nombre comparable mais le message « cette note est un jugement, pas un calcul sur les données » (mécanisme #128 de diagnostic par cellule, paramétré pour DEN). Le **diff** d'une config DEN, lui, reste affiché.
- **Aucune application** depuis cette vue (D-9).

---

## 8. Dérivation et édition (assistant condensé)

Dériver/modifier une variante **réutilise l'assistant** (`wizard-pratique-v2.js`) en **version raccourcie** — pas de second moteur d'édition (D-4/D-10, zéro-dette) — **invocable depuis le Labo** (bouton « dériver une variante » sur un nœud de l'arbre, ouverture en surimpression, **sans changer de section**). Le chemin est raccourci : duplication (`dupliquerPratique`, `js/pratiques.js:2109`, qui pose déjà `auteur` + `inspireDe`) + ouverture directe sur les paramètres + nom auto « *souche* · variante N » + `estEssai = true`. Objectif : créer un essai en ~2 gestes, pas 5.

> `dupliquerPratique` doit, en plus de l'existant : poser `inspireDe.sourceId = id source` et `estEssai = true`.

---

## 9. Hygiène de l'exploration

Le risque central (Grégoire) : l'accumulation de variantes semblables. Leviers :

- **Tri/filtre** des essais par **nom, famille, date** (axes Grégoire) ; souche affichée.
- **Suppression libre** des essais ratés (« supprimer ce qui ne marche pas ») — aucun enjeu CC en local (§10).
- **Péremption douce** : *signaler* (badge discret) les variantes d'essai dormantes depuis longtemps — **jamais destruction automatique** (préservation des données, CLAUDE.md).
- **Rangement** : assuré par **#320 (répertoires de classement)**, livré **avant** D (§11). D consomme #320, ne le réimplémente pas.

---

## 10. Licences CC et remix

- **Licence unique** CC BY-NC-SA 4.0 (`cc-license.js:17`) → **aucune matrice de compatibilité**, pas de cas « dérivés interdits » ; tout dérivé reste SA.
- **Remix déjà couvert** : dériver une variante pose `inspireDe(auteur, sourceId)` ; l'auteur courant via `obtenirAuteurActif` (`bibliotheque-ui.js:146`) ; la chaîne de `contributeurs` est maintenue (`pratiques-gestion.js:1264`) ; l'export rejoue BY-NC-SA. Le geste de dérivation **se branche** sur cette infra, n'invente rien.
- **Suppression** : libre en local (CC régit la distribution, pas l'usage privé). Une variante déjà partagée à la Réserve : sa suppression locale n'efface pas les copies diffusées (fonctionnement normal).

---

## 11. Dépendances et séquençage

```
PRÉALABLES (code, ordre mutuel libre)              PUIS
┌──────────────────────────────────────┐
│ #320  Répertoires de classement       │──┐
│       (transversal : pratiques,       │  │
│        grilles, échelles, cartouches) │  ├──►  CODE de D (cette spec)
├──────────────────────────────────────┤  │      sur 4 familles + #320
│ #318  DEN couche 2 (« DEN-proper »)   │──┘
│       famille créable + diffable      │
└──────────────────────────────────────┘
```

- **#320 = dépendance préalable** (décision Grégoire) : sans répertoires, les variantes promues retombent en liste plate. Chantier transversal, existe pour lui-même.
- **#318 DEN couche 2 = préalable** : le diff/mapping (6) doit décrire les réglages DEN ; les coder avant que DEN soit créable exposerait au rétrofit. Lire `NOTE-COWORK-modele-DEN.md`.
- La **conception de D (cette spec)** est faite **maintenant**, sans attendre les préalables (conception ≠ dette).

---

## 12. Invariants et sécurité

1. **Exploration strictement lecture seule** (matrice, arbre, diff) : lit `pratiquesConfigurables` et l'arbre (`sourceId`), calcule le diff ; **n'écrit ni pratique, ni note, ni `estEssai`**. Toute écriture (dériver, promouvoir, jeter) passe par la bibliothèque/l'assistant.
2. **Aucune écriture namespacée** (clés réelles **ni** `demo_*`) lors d'une session de comparaison ; pratique active inchangée ; snapshot avant/après égal (continuité SPEC phase 1 §6/§7).
3. **Fonctions pures** testables sans DOM : `diffPratiques`, lecteur d'arbre.
4. **Parité moteur** : la note simulée d'une variante = `simulerIndices(da, varianteId)` (`portfolio.js:714`) — **aucun second chemin de calcul** (anti-pattern « deux systèmes de calcul »).
5. **CC** : `inspireDe`/`sourceId` jamais effacés (§3.1).
6. **Zones protégées** : toute modif de `config.js`/`navigation.js` (§4.1) requiert l'aval de Grégoire.
7. **Sécurité** : `echapperHtml()` sur tout nom de pratique/variante (données utilisateur) ; `data-action` (zéro handler inline) ; **au moins 1 test ajouté par lot** (Défense I).

---

## 13. Hors périmètre (premier jet de D)

- **Expérimentation sur données réelles** (étape 3 du cycle, ex-« phase 2 ») : reportée, rangée après l'exploration ; la matrice reste démo.
- **Familles codées comme racines visibles de l'arbre** (§5).
- **Partage d'une variante non promue** : par défaut, seules les pratiques abouties sont partageables (à confirmer — Q10 note).
- **DEN simulable** (jugement saisi → jamais simulé sur démo).

---

## 14. Lots proposés (à valider avec Grégoire avant exécution)

| Lot | Contenu | Nature | Test ajouté |
|---|---|---|---|
| **D-0** | Modèle de données : `inspireDe.sourceId` (coordination `import-export.js`) ; flag `estEssai` ; `dupliquerPratique` pose `sourceId` + `estEssai=true` ; lecteur d'arbre (pur). | données + moteur (additif) | Vitest : arbre reconstruit ; `sourceId`/`estEssai` posés ; filiations sans id ignorées sans erreur |
| **D-1** | `diffPratiques(idA, idB)` (pur, balaie l'objet config) + mapping paramètre→phrase d'effet (**contenu Grégoire**, DEN inclus). | moteur + contenu | Vitest : diff symétrique, repli neutre, survit au non-calculable |
| **D-2** | **Labo › Exploration des pratiques** : élargir l'ex-Comparateur (renommage `label` `config.js` — **aval Grégoire**) ; arbre + actions dériver/comparer/promouvoir/jeter ; **bibliothèque + sidebar filtrent `estEssai ≠ true`**. | UI + nav (protégée) | rendu DOM + invariant non-destructif ; aucun essai dans sidebar/biblio |
| **D-3** | Dérivation via **assistant condensé** invocable du Labo + chemin raccourci (nom auto, ouverture paramètres). | UI | rendu DOM ; `inspireDe.sourceId` + `estEssai=true` à la création |
| **D-4** | Intégration **matrice** : diff avant matrice pour variantes d'une souche ; DEN = diagnostic non-simulable + diff visible ; alimentation depuis l'arbre. | UI | rendu DOM (4 familles) ; lecture seule (snapshot) |
| **D-5** | **Hygiène** : tri nom/famille/date, péremption douce signalétique, suppression d'essai ; consommation #320. | UI | rendu DOM ; suppression non-destructive ailleurs |
| **D-6** | Validation terrain (Mac + iPad, sombre + clair) + release `minor` + changelog (1 entrée utilisateur). | livraison | suite complète verte |

**Séquencement** : D-0 → D-1 → D-2 → D-3 → D-4 → (D-5 ∥ fin) → D-6. **Préalables** #320 et #318 livrés avant D-2 (UI/nav) au plus tard ; D-0/D-1 (modèle + diff) peuvent démarrer en parallèle de DEN si le modèle DEN écrit (`NOTE-COWORK-modele-DEN.md`) suffit au mapping.

---

## 15. Tests (continuité Défense I)

1. **Arbre** (Vitest pur) : reconstruction par `sourceId` ; souches/branches/sous-branches ; filiations legacy sans id ignorées proprement.
2. **Diff** (Vitest pur) : symétrie `diff(A,B)`/`diff(B,A)` ; couverture des blocs config ; repli neutre ; calcul même si note non calculable.
3. **Statut/sidebar** (Playwright) : un essai (`estEssai`) n'apparaît ni dans la sidebar ni dans la bibliothèque propre ; apparaît dans le Labo › Exploration.
4. **Dérivation** : `dupliquerPratique` pose `inspireDe.sourceId` + `estEssai=true` ; `auteur` = utilisateur courant ; `contributeurs` maintenus.
5. **Promotion** : `estEssai` → false ; `inspireDe`/`sourceId` **inchangés** (invariant CC).
6. **Exploration** : lecture seule (snapshot avant/après égal) ; DEN → diagnostic non-simulable, diff visible ; parité moteur réf.
7. `cd tests && npm test` + ≥ 1 test par lot ; Mac + iPad, sombre + clair ; validation terrain Grégoire avant push.

---

## 16. Précautions d'exécution

Rituel de début de session ; charger `SKILL_pratiques_notation.md` (moteur, `simulerIndices`), `SKILL_integrite_globaux.md` (écritures dans `pratiquesConfigurables`), `SKILL_Securite_donnees.md` (CC, export, Réserve) ; design system (`design-system.html`, variables, 2 modes) ; `echapperHtml()` sur tout nom ; `data-action` (zéro handler inline) ; **revérifier les `fichier:ligne`** (datés du 8 juin 2026). **Aval Grégoire pour `config.js`/`navigation.js`** (§4.1). Préalables #320 et #318 vérifiés livrés avant les lots UI. Pour `inspireDe.sourceId` : auditer les call-sites du sous-schéma partagé (`import-export.js:326`) — modification transversale.

**Documentation (obligatoire, avec le code)** : mettre à jour `SKILL_pratiques_notation.md` **au fil des lots** — D-0 : §3/§5 (champs `inspireDe.sourceId` + `estEssai` sur l'enveloppe configurable) ; D-1/D-4 : §12 (diff de config, exploration, DEN diffable-non-simulable). Le skill ne doit **jamais** décrire ces éléments avant leur livraison (il miroite le code réel). Incrémenter l'HISTORIQUE du skill à chaque lot.
