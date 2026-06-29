# RELAIS #326 — Réactivation du comparateur de pratiques : état vérifié et reste à faire

**Date** : 28 juin 2026
**Nature** : dossier de contexte autoportant, produit en session Cowork par analyse des trackers **et vérification du code** (lecture seule, aucune modification).
**Destinataire** : la session Claude Code qui reprendra #326 **après** le chantier intertrimestre #358.
**Branche au moment de la rédaction** : `claude/358-bloc1-fondations-modeles` (HEAD `95f6cb62`, 28 juin 13:55).

> **Avertissement de rigueur.** Les constats marqués **FAIT** sont vérifiés au code, aux fichiers/lignes cités (HEAD ci-dessus). Les constats **À TRACER** sont des inférences fortes, non encore confirmées par lecture exhaustive – ne pas les traiter comme acquis : les confirmer est le premier travail. Ce relais corrige l'image donnée par `SUIVI-BUGS.md`, dont les lignes #326-T1 à T5 datent du 21 juin et **n'ont pas été mises à jour** depuis les correctifs des 19 et 22 juin (voir §7).

---

## 0. TL;DR

Le comparateur de pratiques (#326) est **codé et complet**, puis **volontairement masqué** de l'interface depuis le 22 juin (#345, flag `COMPARATEUR_VISIBLE = false` dans `js/config.js`). Sa réactivation est conditionnée au traitement des 5 constats terrain #326-T1 à T5 (passe Mac du 21 juin).

La vérification de code du 28 juin redistribue les cartes :

- **T1 (affichage)** : déjà réglé. Le rendu du banc et l'export CSV lisent `noteConstructible` depuis le 19 juin (PR #53). Le « 0 » résiduel de PAN-Standards n'est PAS un défaut du banc.
- **T2** : quasi non-bug – la bannière est conditionnelle à « ≥ 1 maquette » et, depuis #345, gatée par le flag. Elle reviendra à la réactivation.
- **T5** : trivial (une couleur de bandeau).
- **T3 et T4** : le **vrai reste**. T3 = préremplissage du formulaire en mode édition. T4 = la dérivation ouvre le wizard complet (9 étapes) au lieu de l'« assistant condensé » que prévoit la SPEC §8.

Le « STD = 0 » (T1 et bugs connexes) est une **question de moteur**, pas d'UI : `simulerIndices` rend un 0 **fini** pour PAN-Standards, donc marqué « constructible ». Décision à prendre : ce 0 est-il légitime, ou le moteur devrait-il rendre `null` (→ « non constructible ») quand il ne peut pas bâtir la note ? (§5)

---

## 1. Généalogie : #307 → #326 → banc de décision (pour lire la suite sans l'amont)

- **#307 (31 mai)** – idée d'origine : « simuler / comparer des pratiques de notation sur les mêmes données (profil élève) ». Débloqué le 5 juin par #303 Session C, qui rend `calculerDetailsNoteFinale(da, pratiqueId)` paramétrable.
- **#326 (8 juin, SPEC validée)** – élargissement en **« Exploration des pratiques »** dans le Labo : arbre de filiation (variantes, parenté), diff de config, matrice de comparaison. Document canonique : `plans de travail/SPEC_D_exploration_pratiques.md`. Principe des **trois lieux** : le Labo héberge l'exploration ; la Bibliothèque (Conception › Pratiques) et la sidebar ne montrent que les pratiques **abouties** ; les maquettes vivent dans le Labo (filtre D-2).
- **Recadrage terrain (16 juin)** – `plans de travail/RELAIS-326-refonte-banc-decision.md`. La passe terrain de Grégoire constate que « le mécanisme est livré mais le workflow rate sa cible ». Cas d'usage de référence : **« entre deux de MES pratiques, laquelle choisir ? »**. Décisions actées :
  - le comparateur devient un **banc de décision** ; la dérivation passe au rang de **support** ;
  - tableau en **lecture seule** : « Construction de la note » (attributs par famille, alignés par axe) + « Résultat » sur N **profils-types**, avec un **lien par colonne** vers le formulaire d'édition (#319) – **pas** d'éditeur embarqué ;
  - **données fictives par défaut** (réelles en fin de trimestre, en lecture seule) ;
  - vocabulaire **« Comparateur » / « maquette »** (`estEssai` → `estMaquette`, conservé) ;
  - garde-fou **« max 1 dérivé »** (une maquette se dérive d'une souche aboutie, jamais d'une autre maquette) ;
  - **profils-types dérivés de l'échelle** de l'utilisateur (N niveaux → N profils, trajectoires ancrées + 1 irrégulier ; fixes en v1, réels plus tard).
- **Livraison du banc (17 juin, release 1.19.0)** – lots R4a (banc sur profils fictifs générés, sans mode démo), R4b (colonnes paires + section Construction R3 + lien formulaire), R5 (retrait zéro-dette du code mort), R6 (changelog).
- **Durcissement (19 juin, release 1.20.0, PR #53 = commit `b18b34fb`)** – champ `noteConstructible` **lu par le rendu et par le CSV**, a11y, prévention CC.
- **Masquage (22 juin, #345)** – flag `COMPARATEUR_VISIBLE = false`, réversible et conditionné (voir §3).

> Note de vocabulaire : la SPEC parlait d'`estEssai` ; le recadrage R1 l'a renommé `estMaquette`. Le code utilise `estMaquette`. « Essai » et « maquette » désignent la même chose selon l'âge du document.

---

## 2. Ce qui est dans le code aujourd'hui (vérifié au HEAD du 28 juin)

| Rôle | Fichier : symbole / ligne |
| --- | --- |
| Banc complet (rendu matrice, arbre d'exploration, export CSV, bandeau dev) | `js/comparateur-pratiques.js` |
| Moteur de note unifié (retourne `{C, P, noteFinale, details, recit, noteConstructible}`) | `js/portfolio.js` → `simulerIndices` (714), `_simulerIndicesInterne` (733) |
| Dérivation / duplication / édition | `js/pratiques.js` → `deriverMaquette` (1097), `dupliquerPratique` (1013), `editerPratique` (989) |
| Bannière « Gérer mes maquettes » | `js/pratiques-gestion.js` (≈ 388-410) |
| Flag de masquage #345 | `js/config.js:106` → `const COMPARATEUR_VISIBLE = false;` |
| Gating nav Labo | `js/navigation.js:374-377` |
| Gating lien « comparateur » au récap du wizard | `js/wizard-pratique-v2.js:2217-2218` |
| Tests | `tests/integration/comparateur-pratiques-rendu.spec.js` (dont un cas « notes > 0 » en **`test.fixme`**), `tests/integration/maquettes-decouvrabilite-326.spec.js` |

**Contrat `noteConstructible` (FAIT, `portfolio.js:767`)** :
```js
const noteConstructible = (typeof P_decimal === 'number' && isFinite(P_decimal));
```
`P_decimal` provient (745-755) d'abord de `calculerDetailsNoteFinale(da, pratiqueId).noteFinale / 100`, sinon d'un repli sur `pratique.calculerPerformance(da)`. S'il reste `null`, `P` est forcé à 0 (759) **mais** `noteConstructible` vaut `false`. Donc : `noteConstructible === false` **uniquement** quand aucun chemin n'a produit de valeur finie. Un 0 **fini** est, par construction, « constructible ».

---

## 3. Le masquage #345 et le critère de réactivation

- **Mécanisme (FAIT)** : un seul drapeau, `COMPARATEUR_VISIBLE` (`js/config.js:106`), sémantique *fail-open* (masque seulement si explicitement `false`). Trois points d'entrée gatés : sous-nav Labo (`navigation.js`), lien récap du wizard (`wizard-pratique-v2.js`), bannière « Gérer mes maquettes » (`pratiques-gestion.js`).
- **Conforme zéro-dette** : c'est un **masquage**, pas un retrait de code, avec une règle de réactivation **explicite**.
- **Critère de réactivation littéral (décision Grégoire, 21-22 juin)** : *repasser le flag à `true` quand #326-T1 à T5 sont traités.* Le présent dossier ré-évalue ce que « traiter » veut dire, T par T (§4).
- **Compromis acté** : comparateur masqué ⇒ les maquettes existantes deviennent temporairement non gérables (sans impact pour un membre CoP « frais », qui ne peut pas créer de maquette sans le comparateur).

---

## 4. Les 5 constats terrain, re-qualifiés au code

| # | Constat terrain (21 juin) | Gravité d'origine | État vérifié (28 juin) | Reste à faire |
| --- | --- | --- | --- | --- |
| **T1** | STD affiche « 0 » au lieu de « — non constructible » ; pas de tooltip ; CSV exporte « 0 ». | Haute | **Volet affichage = FAIT** depuis le 19 juin (`b18b34fb`). Rendu : `comparateur-pratiques.js:425-431` affiche « — non constructible » + `title`/`aria-label` « ce n'est pas un zéro ». CSV : `:1088` écrit `non constructible`. **Le « 0 » résiduel = question de moteur, pas de banc** (§5). | Trancher §5 (le 0 de STD est-il légitime ou doit-il devenir `null` ?). |
| **T2** | Bannière « Gérer mes maquettes » absente malgré une maquette vivante. | Moyenne | **Quasi non-bug.** La bannière est conditionnelle à `nbMaquettes > 0` (`pratiques-gestion.js`). Selon #345, le constat A.11 venait de **0 maquette** chez Grégoire à ce moment *(attestation BACKLOG #345, non re-vérifiée ici)*. Depuis #345, elle est **aussi** gatée par `COMPARATEUR_VISIBLE`. | Rien de spécifique : revient automatiquement à la réactivation (flag `true` + ≥ 1 maquette). Vérifier sur le terrain après réactivation. |
| **T3** | « Éditer la pratique » (lien d'une colonne) ouvre l'assistant **non prérempli** (champs obligatoires vides). | Moyenne | **OUVERT, locus identifié.** Chaîne : `comparateur-pratiques.js:804` → `editerPratique(id)` (`pratiques.js:989`) → `ouvrirWizardV2(true, id)` (`:1002`). Le préremplissage du mode édition vit dans `ouvrirWizardV2` (`wizard-pratique-v2.js`). **À TRACER** : pourquoi le mode édition ne restaure pas les valeurs (ex. « Nombre d'évaluations prévues »). Énigme à élucider : le terrain dit que l'édition via la **sidebar** préremplit – or elle passe par le même `editerPratique` ; chercher la divergence (id de maquette vs aboutie ? correctif intervenu depuis le 21 juin ?). | Reproduire, puis corriger le préremplissage **ou** trancher que le libellé est trompeur. |
| **T4** | « Dériver une maquette » déroule le wizard complet (9 étapes) ; il faut Annuler ; la maquette est créée **quand même**. | Moyenne | **PAS un bug : un écart SPEC/implémentation.** `deriverMaquette` (`pratiques.js:1097`) **duplique d'abord** (`:1115`) **puis** appelle `editerPratique` (`:1124-1125`), qui ouvre le **wizard complet**. Or la SPEC §8 prévoit un **« assistant condensé »** (« créer un essai en ~2 gestes, pas 5 ») – **jamais construit** : la dérivation réutilise le wizard intégral. La création-avant-édition explique « créée quand même » à l'Annuler. | **Décision de conception** : bâtir l'assistant condensé (SPEC §8), **ou** changer le flux (créer + atterrir sur l'arbre sans wizard). Décider aussi du sort de la maquette si l'utilisateur annule. |
| **T5** | Bandeau « Outil en développement » sur fond **bleu** → à passer en **orange** (cohérence aide). | Basse | **Trivial.** Bandeau = `comparateur-pratiques.js:68-69` (`NOTE_DEV_*`) + `:1012`. Style : `styles.css:19651` `.comparateur-note-dev` (variables bleues). | Basculer les variables CSS du bandeau vers la palette orange « aide » (design-system, 2 modes). |

---

## 5. Le nœud « STD = 0 » (T1 résiduel + bugs connexes)

**Faits.** Le rendu n'affiche « — non constructible » que si `noteConstructible === false` (`comparateur-pratiques.js:425`), c'est-à-dire si `P_decimal` est resté `null` (`portfolio.js:767`). Le terrain montre PAN-Standards à **« 0 »**, donc `noteConstructible === true`, donc `P_decimal` est un **0 fini**. Pourtant la fiche détail affiche « Récit indisponible pour cette pratique » côté STD (`recit = null`). Il y a donc **incohérence interne** : le chemin **note** produit un 0 fini, le chemin **récit** ne produit rien.

**Inférence (forte, à confirmer).** Le 0 vient de l'un des deux chemins de `_simulerIndicesInterne` (`portfolio.js:745-755`) : soit `calculerDetailsNoteFinale` rend `noteFinale = 0`, soit le repli `calculerPerformance` rend 0. **À TRACER** : lequel, et pour quelle configuration STD.

**Décision à prendre (Grégoire).** Deux lectures, déjà entrevues le 17 juin :
1. le 0 est **légitime** (la pratique note réellement ces profils à 0, faute d'alignement corpus ↔ config) – alors rien à corriger côté moteur, et le bandeau « en développement » suffit ;
2. le 0 est **trompeur** : quand STD ne peut pas bâtir la note (récit nul), `calculerDetailsNoteFinale` devrait rendre `noteFinale = null` (et non 0), pour que `noteConstructible` bascule à `false` et que le banc affiche « — non constructible ».

Le bandeau actuel (`NOTE_DEV_TEXTE`, `comparateur-pratiques.js:69`) **gère déjà l'ambiguïté** pour l'utilisateur (« une note peut s'afficher à 0… cela veut dire le plus souvent que la note ne peut pas être construite »). C'est un palliatif honnête, pas une résolution. Bugs liés : « STD = 0 fictif ET réel » (recadré 17 juin, **ne pas relancer sans décision**) et « notes à 0 sur le jeu DÉMO » (test `comparateur-pratiques-rendu.spec.js` « notes > 0 » en `test.fixme`). **Hypothèse de travail** : ces trois symptômes sont le **même nœud**. À confirmer avant tout correctif.

---

## 6. Ordre d'effort proposé pour la réactivation

Du moins coûteux au plus structurant – à valider avec Grégoire :

1. **T5** (minutes) – couleur du bandeau, 2 modes.
2. **T2** (vérification) – confirmer qu'avec le flag à `true` et ≥ 1 maquette, la bannière s'affiche. Pas de code attendu.
3. **T1 / STD = 0** (cœur) – tracer le chemin du 0 (§5), puis **décision Grégoire** entre « 0 légitime » et « doit rendre `null` ». Réactiver le test `test.fixme` si le correctif rend la note constructible.
4. **T3** (préremplissage édition) – reproduire, isoler la divergence sidebar vs banc, corriger ou requalifier le libellé.
5. **T4** (dérivation) – **décision de conception** : assistant condensé (SPEC §8) vs flux raccourci sans wizard. Le plus structurant ; ne pas le bâcler en patch.

Quand 1-5 sont traités (ou explicitement écartés par décision) : **repasser `COMPARATEUR_VISIBLE` à `true`** (`js/config.js:106`) + bump `?v=` des trois points d'entrée + ré-ajuster `noms_stables.json` si besoin + `cd tests && npm test`. Conformément à CLAUDE.md, **valider sur Mac ET iPad (2 modes)** : le rendu UI du banc n'est pas vérifiable hors navigateur.

---

## 7. Désynchronisation des trackers à corriger

`Retours des testeurs/SUIVI-BUGS.md` (lignes #326-T1 à T5, datées du 21 juin) n'a **pas** été mis à jour après :
- le **19 juin** (`b18b34fb`, PR #53) qui règle le **volet affichage de T1** (rendu + CSV lisent `noteConstructible`) ;
- le **22 juin** (#345) qui **explique et gère T2** (bannière conditionnelle, puis gatée par le flag).

Conséquence : lus seuls, les trackers font croire que T1 et T2 sont entièrement ouverts. **Action de propreté** (priorité testeurs, cf. CLAUDE.md) : annoter ces deux lignes dans `SUIVI-BUGS.md` avec l'état réel et la date, pour ne pas re-diagnostiquer du déjà-fait.

---

## 8. Pointeurs

- **Code** : `js/comparateur-pratiques.js`, `js/portfolio.js` (`simulerIndices` 714), `js/pratiques.js` (989/1013/1097), `js/pratiques-gestion.js` (≈ 393), `js/config.js:106`, `js/navigation.js:374`, `js/wizard-pratique-v2.js:2217`, `styles.css:19651`.
- **Tests** : `tests/integration/comparateur-pratiques-rendu.spec.js` (cas « notes > 0 » en `test.fixme`), `tests/integration/maquettes-decouvrabilite-326.spec.js`.
- **Conception** : `plans de travail/SPEC_D_exploration_pratiques.md` (canonique ; §8 = assistant condensé), `plans de travail/RELAIS-326-refonte-banc-decision.md` (recadrage 16 juin).
- **Suivi** : `BACKLOG.md` (#326, #345, #307), `Retours des testeurs/SUIVI-BUGS.md` (#326-T1 à T5).
- **Commit clé** : `b18b34fb` (19 juin, PR #53) – `noteConstructible` lu par rendu + CSV.

> Rappel séquençage (cap Grégoire) : ce chantier est **parallèle** à l'intertrimestre (#358 → #352/#353 → #36), non dépendant. Les deux partagent l'échéance « app stable pour la CoP, mi-août 2026 ». Le comparateur est le **candidat n°1 du paquet « bloqueurs CoP »**.
