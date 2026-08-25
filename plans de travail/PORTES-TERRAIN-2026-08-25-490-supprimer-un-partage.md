# PORTES TERRAIN — #490 · supprimer un document partagé par un collègue

**Version à éprouver** : **1.96.0** · build `0824-2123`
**Date d'émission** : 25 août 2026
**Branche** : **fusionnée dans `main`** le 25 août (avance rapide)
**Artefact interactif** : https://claude.ai/code/artifact/46caad82-bbb2-4337-9014-c850a3415da6
**Jumeau HTML versionné** : `plans de travail/portes-terrain-2026-08-25-490-supprimer-un-partage.html`
**Volume** : **2 préalables · 6 vérifications · 2 décisions** — environ cinq minutes
**État** : ✅ **CLOSE le 25 août — 8/8, zéro échec, zéro reliquat** · décisions 3.1 et 3.2 rendues

> **RELEVÉ DE GRÉGOIRE — 8 passées, 0 échec, 0 non traitée.** Dont la **2.3**,
> la seule vraiment obligatoire : sur son iPad, la question de confirmation
> s'affiche bien PAR-DESSUS la fenêtre de bibliothèque. C'est le défaut de
> 1.92.1 qui ne s'est pas rejoué, et c'est le verdict que la session ne pouvait
> pas rendre.
>
> **Décision 3.1 — « garder la cascade ».** Aucun code à écrire : le
> comportement livré est confirmé. Supprimer une grille partagée continue
> d'emporter ses cartouches partagées, après une confirmation qui les nomme.
>
> **Décision 3.2 — « oui ».** Elle, elle demandait du code, et **trois
> obstacles ont été MESURÉS au navigateur avant d'écrire une ligne** :
> `resoudreEntite` ne trouvait pas un partagé ; `rassemblerDependances`
> rendait **0 cartouche là où 2 étaient liées** (package amputé en silence) ;
> et la chaîne d'attribution sortait **vide**, avec le seul nom de qui
> exporte — ré-émettre le travail d'un collègue sans maillon aurait été une
> faute de licence, pas un détail d'affichage. Les trois sont refermés en
> **1.97.0**.

> **Cette porte est courte exprès.** Tu as écrit le 24 août : « je suis
> complètement découragé par les portes terrain nombreuses ». Le tri du même
> jour s'applique ici : **tout ce qui était prouvable en session l'a été**, et
> chaque retrait est documenté plus bas par sa preuve. Ce qui reste, c'est ce
> qu'un conteneur sans Safari ne peut pas trancher.

---

## Ce que le cycle a livré

Tu m'as écrit, deux captures à l'appui : *« Je voudrais pouvoir supprimer les
cartouches partagées. Il n'y a pas de menu pour le faire, comme dans les autres
cartes. […] Cette option devrait être présente dans toutes les bibliothèques. »*

1. **Le menu ⋮ existe maintenant sur les cartes « Partagés par des collègues »**,
   avec « Supprimer ». Dans les **cinq** bibliothèques : grilles, échelles,
   cartouches, productions, pratiques.
2. **Supprimer ne touche que la copie importée.** Tes propres documents — y
   compris ce que tu avais déjà dupliqué dans tes affaires — ne bougent pas, et
   le `.lcz` reste réimportable.
3. **Supprimer une grille partagée emporte SES cartouches partagées**, et la
   confirmation les nomme avant de le faire. Sans sa grille, une cartouche
   partagée ne peut plus être dupliquée : la laisser derrière, ce serait laisser
   une carte dont le seul bouton échoue.
4. **Réglages › Données suit.** La colonne « Contenu » du tableau « Packages
   importés » annonce ce qui reste, pas ce qui est entré un jour.

---

## §0 · Préalable — ce qui invalide tout le reste s'il est sauté

| | Geste | Attendu |
|---|---|---|
| **0.1** | `git pull` sur **`main`**, puis recharger l'app. | Le bas de page affiche **1.96.0 · build 0824-2123**. **Si tu vois autre chose, arrête ici** : tu éprouverais l'état d'avant en croyant éprouver l'après. ⚠ **Ce n'est pas théorique** : le 25 août au matin, la capture qui disait « il n'y a pas de menu » montrait en réalité un build 1.95.4. |
| **0.2** | ⚠ **Garde tes fichiers `.lcz` sous la main.** Cette porte te fait supprimer de vraies choses importées. | Tout est réimportable **à condition d'avoir le fichier**. Si tu n'as plus le `.lcz` d'un package, ne le supprime pas — importe-en un autre pour l'essai, ou fais un export Codex d'abord. |

---

## §2 · Interface — ce que tu vérifies à l'écran

### 2.1 Le menu ⋮ apparaît sur une carte partagée `iPad`

> **POURQUOI.** C'est exactement ta capture : la carte de gauche (ta barre
> latérale) a ses trois points, la carte de droite (« Partagés par des
> collègues ») n'avait que « Dupliquer ». Il n'y avait aucun geste pour retirer
> un partagé.

- [ ] Ouvre une bibliothèque qui contient des partagés (Cartouches, par exemple), descends jusqu'à **« Partagés par des collègues »**.
      ⮕ **Attendu** : chaque carte porte maintenant un **⋮** à droite de « Dupliquer ».

### 2.2 Le ⋮ s'ouvre au doigt `iPad`

> **POURQUOI.** Le ⋮ est le même composant que celui de tes cartes ordinaires,
> mais il n'a jamais été touché au doigt à cet endroit-là de la fenêtre.

- [ ] Touche le ⋮ d'une carte partagée, avec le doigt, pas un stylet.
      ⮕ **Attendu** : le menu s'ouvre du premier coup et affiche **« Supprimer »** en rouge.

### 2.3 La confirmation est lisible PAR-DESSUS la fenêtre de bibliothèque `iPad`

> **POURQUOI.** C'est le défaut réel de 1.92.1 : une confirmation qui se cachait
> sous sa propre modale. La question que je pose s'affiche depuis l'intérieur de
> la fenêtre de bibliothèque — exactement la configuration qui avait cassé.

- [ ] Touche « Supprimer » et **regarde sans répondre**.
      ⮕ **Attendu** : la question s'affiche en entier, par-dessus, avec ses deux boutons atteignables. Tu peux répondre **Annuler** : rien ne doit être supprimé.

### 2.4 Supprimer une cartouche partagée

- [ ] Refais le geste et accepte cette fois.
      ⮕ **Attendu** : la carte disparaît de la liste, un message vert confirme, et **les autres partagés ne bougent pas**.

### 2.5 Supprimer une grille partagée qui porte des cartouches

> **POURQUOI.** C'est la seule décision de portée de ce cycle, et elle est
> l'inverse de celle d'hier : pour **tes** grilles, supprimer est REFUSÉ quand
> il y a des cartouches. Pour une grille **partagée**, j'ai choisi d'emporter
> ses cartouches — parce que tout est réimportable et qu'une cartouche partagée
> sans sa grille est inutilisable. La confirmation doit te le dire AVANT.

- [ ] Dans la bibliothèque de grilles, ⋮ → Supprimer sur une grille partagée qui a des cartouches.
      ⮕ **Attendu** : la question **nomme les cartouches** qui partiront avec elle. Si tu acceptes, elles ont disparu de la bibliothèque de cartouches aussi.

### 2.6 Réglages › Données dit la vérité

- [ ] Va dans **Réglages › Données**, carte « Packages importés », colonne **Contenu**.
      ⮕ **Attendu** : le décompte a **baissé** de ce que tu viens de supprimer. Un package dont tu aurais tout supprimé n'apparaît plus du tout dans la liste.

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont deux choix que j'ai posés faute
> de pouvoir les trancher à ta place. **Écris ta réponse**, ne coche pas.

### 3.1 La cascade grille → cartouches : bon comportement ?

J'ai choisi d'emporter les cartouches partagées avec leur grille partagée,
après une confirmation qui les nomme. L'autre option était de **refuser**, comme
pour tes propres grilles — mais il faudrait alors supprimer les cartouches une
à une avant de pouvoir atteindre la grille.

**Ton verdict** : `_______________________________________________`

### 3.2 Faut-il aussi pouvoir « Exporter pour partager » un item partagé ?

Le menu ⋮ de tes propres cartes offre « Exporter pour partager ». Sur une carte
partagée, il n'offre que « Supprimer ». Techniquement, la chaîne d'attribution
permettrait de retransmettre le travail d'un collègue en conservant son nom —
mais c'est une question de convenance entre collègues, pas de code, et je ne
l'ai pas tranchée.

**Ton verdict** : `_______________________________________________`

---

## §4 · Ce que je n'ai PAS pu vérifier

1. **Safari et l'iPad, structurellement.** WebKit n'existe pas dans le conteneur
   (« Executable doesn't exist at `/opt/pw-browsers/webkit-2287` ») et la suite
   Playwright du projet est **webkit-seule**. Elle n'a donc pas pu être jouée du
   tout — ni en vert, ni en rouge. C'est **#456 / #487**, antérieur à ce
   chantier. C'est toute la raison d'être des six rangées ci-dessus.

2. ~~**Un vrai `.lcz` n'a pas fait l'aller-retour complet.**~~ **RETIRÉ le
   25 août** — joué de bout en bout au navigateur en préparant la décision 3.2 :
   export réel → `.lcz` → import (1 grille + 3 cartouches) → **suppression d'une
   cartouche du vrai package** (le registre passe de 3 à 2) → **réimport du même
   fichier** (`remplace: true`, contenu restauré, **une seule entrée de registre**,
   pas de doublon). L'enchaînement complet est désormais observé, pas déduit.
   ⮕ **Ce qui reste hors observation** : la règle « pas de maillon pour mon
   propre matériel » est verrouillée par un test unitaire ET son break-test,
   mais n'a pas été vue au navigateur avec un profil d'auteur configuré.

3. **Erreur de la session, rattrapée par une sentinelle.** J'ai édité le
   changelog **après** avoir lancé la release : l'URL anti-cache de ce fichier
   n'a donc pas changé, et ton navigateur t'aurait servi l'ancienne version des
   « Nouvelles » sous un numéro de version neuf. C'est l'incident du 23 août,
   rejoué. La sentinelle `anticache-fichiers-modifies` l'a attrapé **au push**,
   pas au commit ; corrigé par un `--build-only` relancé sur l'arbre complet.
   Rien de tout cela n'a été poussé dans cet état.

4. ~~**La fusion vers `main` n'est pas faite.**~~ **RÉGLÉ le 25 août au matin** —
   et le coût de l'avoir laissé dehors est mesuré : tu es revenu quelques heures
   plus tard avec une capture montrant l'absence du menu. Ton build était en
   retard, pas le correctif absent. Le paragraphe d'introduction de la section
   « Partagés » a servi de marqueur : il disait « en lecture seule », texte de
   1.95.4, là où 1.96.0 dit « non modifiables ici […] Le menu ⋮ supprime la copie
   importée ». Fusionné en avance rapide sur ta décision.

---

## Ce qui a été RETIRÉ de cette porte, et sa preuve

Une rangée retirée n'est pas une rangée sautée.

| Ce que je n'ai pas mis dans la liste | Pourquoi c'est déjà prouvé |
|---|---|
| « Le ⋮ est-il présent dans les cinq bibliothèques ? » | Vérifié au navigateur (Chromium), les cinq modales ouvertes une à une : `[data-action="partageSection.supprimer"]` présent dans chacune. |
| « Le menu s'ouvre-t-il ? » (sur Mac/Chrome) | Vérifié au navigateur : clic sur le ⋮ → le popover porte la classe `actif`, l'item lit « Supprimer » et porte la classe rouge. Seul le **doigt sur iPad** reste à éprouver (rangée 2.2). |
| « La suppression fonctionne-t-elle ? » | 29 tests unitaires sur la suppression seule, dont **12 break-tests joués et 12 rouges** : cascade coupée, cascade non filtrée, `confirm` ignoré, registre non synchronisé, documents de l'utilisateur touchés, id fantôme accepté… Chaque sentinelle a été mise en échec avant qu'on lui fasse confiance. |
| « Les productions partagées survivent-elles ? » | Test dédié + break-test (mutation « les productions sont emportées » → ROUGE). |
| « Le registre est-il à jour ? » | Trois tests + vérification au navigateur sur le tableau réel de Réglages › Données. La rangée 2.6 ne reste que parce que le RENDU du tableau sur ton corpus n'a pas été vu. |
| « Mes propres documents sont-ils protégés ? » | Test dédié (`h2026_grillesTemplates` et `cartouches_*` intacts après cascade) + break-test ROUGE. |

**Total : 3044 tests verts avant ce cycle, 3046 après. 14 break-tests, 14 rouges.**

---

## Au retour du terrain

- Chaque échec réel devient un **item de backlog** avec son numéro de porte, pas une note mentale.
- Un échec peut être un **faux rouge** : d'abord vérifier §0.1 (le numéro de version en bas de page).
- Mettre à jour ce fichier : état, date, ce qui reste.
