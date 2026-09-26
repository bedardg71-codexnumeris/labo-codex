# Demande de relecture croisée, AVANT fusion – lot #960 « ouvrir une copie ne réécrit plus rien, et une rétroaction réécrite à la main reste la tienne »

> Écrite le 26 septembre 2026, en soirée (Toronto), par Claude Code. Branche `lot-960-retroaction-a-la-main` (arbre principal), base `99b022aa` (1.160.1, poussée, en ligne chez Netlify selon Cowork). Commits : le correctif (code, bancs, consignes, D6) et celui qui porte cette demande. **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-lot-960.md`. Un texte attend l'accord de Grégoire (§ 6), et une question lui revient (§ 5).
>
> Pour lire le code sans changer de branche : `git diff 99b022aa..lot-960-retroaction-a-la-main -- js/ tests/`.

## 1 · Ce qui écrivait à l'ouverture (mesuré par sonde, trajet `evaluerProduction`)

Sonde WebKit (jetable, retirée) : enveloppe de `db.setSync` et de `genererRetroaction`, piles d'appel relevées. Chargeurs dans l'ordre : copie (t = 1573 ms), copie (1723), « Modifier » (≈ 2120). **Deux sources, qui s'additionnaient :**

1. **L'auto-save armé par « Modifier »** : `_chargerValeursEtAlgoModif` restaure les niveaux par `change` à t ≈ 2236 ; la suspension de 500 ms posée par le chargeur de la copie (t = 1723) avait expiré à 2223. `niveauSelectionne` → `_debouncerAutoSave` → écriture à t = 3743.
2. **La régénération tardive du chargeur de la copie** : son rappel de 300 + 350 ms appelle `genererRetroaction(1)` sans condition, à t = 2379, **après** que « Modifier » a remis la rétroaction à la main (étape 12). La rétroaction régénérée est celle que l'auto-save a écrite.

Et, par les deux chemins, le commentaire enregistré vide : `_commentaireEnregistreDuCritere` rendait `''` aussi bien pour « enregistré vide » que pour « rien d'enregistré à ce niveau » ; la cartouche remplissait les deux.

## 2 · Le correctif (fermé à la source)

- **(1)** `_debouncerAutoSave` ne s'arme pas tant que `window._chargementsEvaluationEnCours > 0`. Le compteur est posé par `modifierEvaluation` juste avant son minuteur et rendu dans son `finally`. Un compteur, pas `_modifierEvaluationEnCours` : `ouvrirFichier` remet ce drapeau à faux en chemin.
- **(2)** Le rappel du chargeur de la copie ne régénère plus que si l'évaluation **n'a pas** de rétroaction enregistrée.
- **(3) D6** : `_commentaireEnregistreDuCritere` rend `null` quand rien n'est enregistré à ce niveau, le texte sinon (vide compris). `_afficherCommentaireCritere` garde le vide **littéral** ; une amorce ou « [Non défini] » en stock suit toujours #939 (la cartouche). Décision de ma part, à regarder : D6 dit « enregistré VIDE », je ne l'ai pas étendu au stock de junk que #939 et #672 traitent déjà.
- **Conséquence sur #944, à regarder** : choisir au menu une autre cartouche sur une copie **sans aucun** commentaire enregistré ne posait pas de question et appliquait la nouvelle cartouche (banc #944, cas « copie sans commentaire enregistré »). Avec D6, le vide aurait gagné. Ce geste pose maintenant `_remplacementConfirme`, comme un remplacement confirmé : la question reste épargnée, la nouvelle cartouche s'applique. Effet de bord : dans ce cas, l'auto-save écrit aussi `cartoucheId` avec les commentaires, comme après un remplacement confirmé (avant, il écrivait les commentaires de la nouvelle sous l'ancien `cartoucheId`, l'incohérence que #944 a réglée pour le cas confirmé).

Retiré avant commit : une re-suspension de l'auto-save au rappel de 300 ms du chargeur de la copie. Sa mutation restait verte (aucun banc ne la tient, elle ne joue que sur un appareil lent).

## 3 · Preuves

- **Les deux `test.fail` #960 deviennent des cas normaux, verts** (`evaluation-959-neutralite-chargeur.spec.js`) : ouverture par la copie → base identique à l'octet ; puis « Enregistrer » → rétroaction à la main gardée. Témoins par la Liste (P1(b), M1) verts.
- **D6, WebKit**, par la copie ET par la Liste : écran vide après l'ouverture, base vide après l'ouverture et après « Enregistrer ». Rouges avant.
- **D6, Vitest** (`sentinelle-939-commentaire-critere-meme-regle.test.js`, nouveau bloc) : réouverture, « Enregistrer », témoin niveau changé → cartouche au nouveau niveau, témoin amorce en stock → cartouche.
- **Mutations** (restauration par copie, `cmp` vérifié) :

| | Mutation | Résultat |
|---|---|---|
| M1 | garde du compteur retirée de `_debouncerAutoSave` | rouge (ouverture par la copie) |
| M1′ | compteur jamais posé par `modifierEvaluation` | rouge (même cas) |
| M2 | régénération inconditionnelle rétablie | rouge (« Enregistrer » par la copie) |
| M3 | D6 retiré | rouge : 2 Vitest, 2 WebKit |
| M4 | choix sans question sans `_remplacementConfirme` | rouge (banc #944, cas « sans commentaire enregistré ») |

- Texte d'une preuve ajusté : `sentinelle-lot3-analytique-niveau.test.js` F.b cite l'appel à `commentaireDuCritere`, qui a changé de forme.
- Vitest complet : 642 fichiers, **7 456 / 7 456**.
- Specs WebKit voisines (939, 944, 946, 947, 652, 699, 882, 959 × 2) : **40 / 40**.
- Verdict Playwright complet : **pas encore** – après ta relecture.

## 4 · Mesure seulement (point 4 de la consigne) : un niveau changé APRÈS une rétroaction réécrite à la main

`[exécuté]` WebKit, par la copie et par la Liste, même résultat : changer le niveau d'un critère **remplace toute la rétroaction finale** par le texte régénéré (écran, aussitôt), et l'auto-save l'écrit en base 1,5 s plus tard. Aucun avertissement. Le texte à la main est perdu. Rien changé ; à Grégoire si cela pose problème.

## 5 · Ce que D6 ne couvre pas encore : ce que l'élève LIT (question pour Grégoire)

`[exécuté]` Vitest : pour un commentaire enregistré vide, **le PDF de l'élève et le texte régénéré** (« Copier tout », la rétroaction générale) impriment **encore le commentaire de la cartouche d'aujourd'hui**. La règle partagée `commentaireDuCritere` (#939) retombe sur la cartouche quand l'enregistré est vide. Mon lot tient D6 dans la BASE et à l'écran du critère ; le motif de D6 (« il apparaîtrait dans son PDF sans décision de l'enseignant ») reste donc vrai par le PDF.

Je n'ai pas touché au PDF : ce sont des mots que l'élève lit, et la règle #939 couvre aussi le stock (amorces, « [Non défini] »). **Question fermée pour Grégoire** : D6 vaut-il aussi pour le PDF et le texte copié ?
- (a) oui : un commentaire enregistré vide s'imprime vide (l'en-tête du critère seul) ;
- (b) non : le PDF garde la cartouche comme repli, D6 ne vaut que pour la base.

## 6 · Le texte que Grégoire doit accepter avant le push

**Nouvelles** (proposition de Cowork) : « Évaluer : ouvrir une copie ne remplace plus ta rétroaction finale réécrite à la main, et un commentaire de critère laissé vide reste vide. » ⚠ Selon la réponse au § 5, la seconde moitié est vraie pour la base mais pas encore pour le PDF.

## 7 · Stock

Une rétroaction déjà remplacée ne revient pas ; un commentaire vide déjà rempli par la cartouche ne se revide pas. Rien n'est réécrit, rien n'est effacé ; non mesuré (demande de Grégoire).

## 8 · Ce que je te demande de regarder en particulier

1. Le compteur : une sortie de `modifierEvaluation` qui le laisserait armé (l'auto-save serait muet pour la session).
2. Le chemin sans copie (`_evaluerSansCopie`) et la flèche d'élève (#920) : non instrumentés par ce lot ; ils passent par le chargeur de la copie ou par « Modifier ».
3. L'extension de `_remplacementConfirme` au choix sans question (§ 2).
