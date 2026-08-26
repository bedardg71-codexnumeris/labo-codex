# Fiche d'arbitrage — #476 volet 2 · les divergences entre les boutons « Dupliquer »

**Date** : 24 août 2026 · **Version de référence** : 1.93.0
**Branche** : `claude/fusion-24-fonctions-dupliquer-qrop3b` (commits `74fafdd7` → `ab30ade3`)
**Artefact jumeau** : https://claude.ai/code/artifact/64c50829-440e-4ad5-8cf8-7b4bdfc06b05
**✅ RELEVÉ RENDU LE 24 AOÛT 2026 — 11 / 11 tranchées.** Les verdicts sont inscrits ci-dessous.
**Orientation retenue (D0) : CONVERGENCE DÉLIBÉRÉE**, avec porte terrain Mac + iPad.
(11 décisions, chacune avec un champ de verdict et un bouton « Copier mes résultats ».)

---

## Ce que ce document est, et ce qu'il n'est pas

**Ce n'est pas une porte terrain.** Il n'y a rien à vérifier sur l'iPad, rien à
exécuter sur le corpus. Tout ce qui suit a déjà été **mesuré** par le banc de
caractérisation (`tests/integration/carac-476-volet2-duplication.spec.js`,
32 cas, exécuté en navigateur contre l'application réelle).

**C'est un document de décision.** Le projet compte plusieurs boutons
« Dupliquer », et ils ne font pas la même chose. Ces différences n'ont jamais
été décidées : elles se sont installées au fil des ajouts. Avant d'aller plus
loin dans la fusion du volet 2, il faut savoir, pour chacune : **est-ce un
défaut à corriger, ou est-ce voulu ?**

⚠ **Aucune de ces lignes ne se coche.** Chacune attend un **verdict écrit**.
Une case cochée dirait « j'ai tranché » sans dire *quoi* — c'est exactement
l'erreur relevée le 11 août, où cinq décisions sont revenues « prises » et
introuvables.

**Ce que les verdicts ont décidé** : neuf écarts sur dix sont déclarés **défauts
à corriger ou à uniformiser**, et D6 part en instruction séparée. Le chantier
suivant n'est donc plus un refactor — c'est une **correction de comportement**
sur les données réelles, qui exige sa porte terrain Mac + iPad.

⮕ **Et la convergence DÉBLOQUE la fusion.** Les deux moteurs livrés aux Lots C
et D portent des rappels (`nommerLaCopie`, `forgerProvenance`) qui n'existent
que pour reconduire ces écarts. Une fois les écarts résorbés, ces rappels
s'effondrent et les 12 voies restantes deviennent fusionnables sans rien
paramétrer. L'ordre décidé est donc le bon : converger d'abord, fusionner
ensuite.

---

## §0 · Préalable

- Rien à installer, rien à sauvegarder : **ce document ne demande aucun geste
  sur tes données.**
- Si tu veux voir les comportements décrits de tes propres yeux, ils sont tous
  reproductibles dans l'app — chaque ligne dit quel bouton presser.
- ⚠ Ton app tourne à la version de ton dernier `git pull`. Les quatre lots de
  cette branche **ne changent rien à ce que tu vois** : les comportements
  décrits ci-dessous sont ceux d'aujourd'hui comme ceux d'avant.

*(Les sections « Données » et « Interface » du modèle de portes terrain sont
sans objet ici : aucune vérification n'est demandée. On passe directement aux
décisions.)*

---

## §3 · Décisions

### Groupe A — ce qui te coûte quelque chose aujourd'hui

---

#### **D1 · Dupliquer un exemple depuis la barre latérale donne une copie que tu ne peux toujours pas modifier**

**Concerne** : grilles et échelles, bouton « Dupliquer » de la **barre latérale**.

> **Ce qui se passe.** Tu vois une grille d'exemple fournie avec Labo Codex.
> Elle est en lecture seule — c'est normal, et l'app te dit d'en faire une copie
> pour l'utiliser. Tu cliques « Dupliquer » dans la barre latérale. **La copie
> s'ouvre en lecture seule elle aussi** : les champs sont grisés, le bandeau
> « exemple fourni par Labo Codex » est toujours là.
>
> La copie a gardé la marque « exemple » **et** le nom de l'auteur d'origine.
> L'app la reconnaît donc encore comme un exemple, pas comme ta grille.
>
> Le même bouton dans la **modale de bibliothèque**, lui, fait une vraie copie
> à toi. Deux boutons portant le même mot, deux résultats différents.

**Ce que ça coûte** : le geste censé débloquer l'édition ne la débloque pas. Et
la copie reste attribuée à quelqu'un d'autre, alors que c'est devenu ton
document — ce qui touche au respect de CC BY que le projet tient par ailleurs.

**Question** : défaut à corriger, ou comportement voulu ?

**VERDICT (24 août 2026)** : **Défaut à corriger.**

---

#### **D2 · Dupliquer une production ne renomme pas la production**

**Concerne** : productions, bouton « Dupliquer » de la liste.

> **Ce qui se passe.** Tu dupliques une production. Dans ta liste, la copie
> porte **exactement le même titre** que l'originale — rien ne les distingue à
> l'œil.
>
> Ce qui a été renommé, c'est la *description*. Et au passage, elle a été
> **remplacée** par le texte de l'activité d'apprentissage : si ta description
> disait autre chose que l'activité, ce texte est perdu dans la copie.

**Ce que ça coûte** : deux productions indistinguables dans la liste, et une
description écrasée sans avertissement.

**Question** : défaut à corriger, ou comportement voulu ?

**VERDICT (24 août 2026)** : **Défaut à corriger.**

---

#### **D3 · « (copie) (copie) (copie) » — CO-24 est encore vivant sur trois boutons**

**Concerne** : `dupliquerProductionBibliotheque`, `dupliquerPratiqueBibliotheque`,
`dupliquerPratiqueMateriel`.

> **Ce qui se passe.** C'est le défaut que tu as signalé sous CO-24, et qui a
> été corrigé en août — mais pas partout. Dupliquer la copie d'une production
> ou d'une pratique donne encore « X (copie) (copie) ». Ailleurs (grilles,
> échelles, cartouches) le nom se normalise proprement en « X (copie 2) ».
>
> La raison est bête : la sentinelle qui garde cette règle ne regarde que
> quatre fichiers, et ceux des productions et des pratiques n'en font pas
> partie.

**Ce que ça coûte** : le défaut CO-24 est réputé clos alors qu'il subsiste sur
deux familles.

**Question** : corriger maintenant (petit correctif isolé, indépendant de la
fusion), ou laisser avec le reste ?

**VERDICT (24 août 2026)** : **Corriger maintenant.**

---

### Groupe B — ce qui te coûtera un jour

---

#### **D4 · Cinq boutons laissent la licence de partage de l'original sur la copie**

**Concerne** : `dupliquerCartouche`, `dupliquerProduction`,
`dupliquerPratiqueMateriel`, et les deux « barre latérale » de D1.

> **Ce qui se passe.** Quand tu importes un document partagé par un collègue, il
> arrive avec ses informations de licence. Si tu le dupliques par un de ces cinq
> boutons, **la copie garde ces informations** — elle se présente encore comme
> le document du collègue. Les autres boutons les retirent, parce que la copie
> est devenue ton document à toi.

**Ce que ça coûte** : rien de visible aujourd'hui, mais c'est de l'attribution
fausse qui se propage, et elle ressortira au prochain partage.

**Question** : défaut à corriger, ou comportement voulu ?

**VERDICT (24 août 2026)** : **Défaut à corriger.**

---

#### **D5 · Pour les grilles et les productions, on ne sait pas de quel document exact vient une copie**

> **Ce qui se passe.** Quand tu dupliques une échelle, une cartouche ou une
> pratique, la copie retient **l'identifiant précis** de l'original : on peut
> remonter la filiation sans ambiguïté. Pour les grilles et les productions,
> elle ne retient que le **nom**.
>
> Si tu as deux grilles portant le même nom — ce qui t'arrive déjà, c'est le cas
> de tes deux échelles « IDME et niv 0 » — on ne peut plus dire laquelle a servi
> de source.

**Ce que ça coûte** : l'arbre de filiation est troué là où il devrait être
complet. Ça pèsera quand tu voudras t'y fier.

**Question** : uniformiser, ou laisser ?

**VERDICT (24 août 2026)** : **Uniformiser sur les trois autres familles.**

---

#### **D6 · Selon le bouton, les critères d'une grille copiée sont neufs ou partagés avec l'originale**

> **Ce qui se passe.** Un seul bouton (« Dupliquer » depuis la modale des
> grilles) fabrique de **nouveaux critères** pour la copie. Les quatre autres
> donnent à la copie des critères portant **les mêmes identifiants** que ceux de
> l'originale.
>
> Deux grilles se retrouvent alors avec des critères qui, pour l'app, sont les
> mêmes objets.

**Ce que ça coûte** : tout ce qui pointe vers un critère — une évaluation, une
annotation — peut devenir ambigu entre l'originale et sa copie.

⚠ **Celle-ci mérite un examen à part** : je n'ai pas mesuré si une évaluation
existante se laisse effectivement confondre. Je sais que les identifiants sont
partagés ; je ne sais pas encore ce que ça produit dans le module Évaluation.

**Question** : à instruire séparément, ou trancher tout de suite ?

**VERDICT (24 août 2026)** : **À instruire séparément** — mesurer l'effet dans Évaluation d'abord.

---

#### **D7 · Dupliquer une pratique-gabarit : selon le bouton, la copie est encore un gabarit ou non**

> **Ce qui se passe.** Depuis la bibliothèque, la copie **cesse** d'être un
> gabarit — « ce n'est plus un gabarit », dit le code. Depuis « Dupliquer et
> éditer », elle **reste** marquée gabarit.

**Ce que ça coûte** : deux copies de la même pratique n'ont pas la même nature
selon le bouton pressé.

**Question** : laquelle est la bonne ?

**VERDICT (24 août 2026)** : **La copie cesse d'être un gabarit** (comportement bibliothèque).

---

### Groupe C — cosmétique ou purement technique

---

#### **D8 · L'invite de duplication d'une pratique ne propose pas le nom de la pratique**

> **Ce qui se passe.** Quand tu dupliques une grille ou une échelle, l'app te
> propose déjà un nom : « Ma grille (copie) ». Quand tu dupliques une
> **pratique**, elle propose « **Copie de pratique** » — un texte générique, qui
> ne dit pas de quoi c'est la copie. C'est la seule des voies à faire ça.

**Question** : aligner sur les autres, ou laisser ?

**VERDICT (24 août 2026)** : **Aligner** : proposer le nom de la source.

---

#### **D9 · Dupliquer une production par « Dupliquer et éditer » lui ajoute un champ de nom qu'elle n'avait pas**

> **Ce qui se passe.** Les productions se nomment par leur *titre*. Ce bouton
> ajoute en plus à la copie un champ *nom* que l'originale n'a pas. La copie
> porte donc deux noms, l'originale un seul.

**Ce que ça coûte** : rien de visible. C'est de la pollution de données qui
compliquera les exports et les comparaisons.

**Question** : nettoyer, ou laisser ?

**VERDICT (24 août 2026)** : **Nettoyer.**

---

#### **D10 · Le bouton « Dupliquer » de l'éditeur de grille rend la main avant d'avoir fini**

> **Ce qui se passe.** Rien que tu puisses voir. Techniquement, ce bouton
> n'attend pas la fin de l'écriture, contrairement à son équivalent pour les
> échelles. Tout ce qui s'enchaînerait juste après travaillerait sur l'état
> d'avant la copie.

**Ce que ça coûte** : aujourd'hui rien. C'est un piège pour le prochain qui
branchera quelque chose derrière ce bouton.

**Question** : aligner sur les échelles, ou laisser ?

**VERDICT (24 août 2026)** : **Aligner sur les échelles.**

---

### **D0 · Et pour les 12 voies restantes, on fait quoi ?**

Trois orientations possibles. **Elle dépend des verdicts ci-dessus** — d'où sa
place à la fin.

| Orientation | Ce que ça donne |
|---|---|
| **Rien pour l'instant** | Le socle sûr (10 fonctions → 2 moteurs) est livré. On s'arrête là et on passe à #454 / #453, qui sont des bugs terrain visibles. Les divergences restent documentées. |
| **Fusion totale à comportement préservé** | Les 12 rejoignent un moteur, avec un réglage par différence. ⚠ Ça revient à inscrire les défauts ci-dessus dans le code comme des règles voulues. Déconseillé si tu réponds « défaut » à D1 ou D4. |
| **Convergence délibérée** | On applique partout le comportement que tu auras tranché. Le résultat le plus propre, et il corrige de vrais défauts — mais ce n'est plus un refactor : ça touche tes données et exige une porte terrain Mac + iPad. |

**VERDICT (24 août 2026)** : **Convergence délibérée**, avec porte terrain Mac + iPad.

---

## §4 · Ce que je n'ai pas pu vérifier

**Non négociable — une liste qui ne déclare pas ses angles morts se fait croire
complète.**

1. **D6 est incomplète, et je le dis plutôt que de la faire passer pour tranchée.**
   J'ai mesuré que les identifiants de critères sont partagés entre une grille
   et sa copie. Je **n'ai pas** mesuré ce que ça produit concrètement dans le
   module Évaluation. Le verdict de D6 devrait donc être « à instruire » plutôt
   qu'un choix, à moins que tu ne saches déjà.

2. **Tout a été mesuré sur Chromium, pas sur Safari ni sur iPad.** Le conteneur
   de session n'a pas WebKit. Les comportements décrits sont ceux de la
   logique de duplication, qui ne dépend pas du navigateur — mais je ne peux
   pas l'affirmer par mesure.

3. **Je n'ai pas mesuré les 9 fonctions `dupliquer*` hors bibliothèques**
   (carte de planification, annotation, gabarits d'export, objectifs, cours,
   partage). Elles sont hors périmètre depuis le plan du 23 août. Rien ne dit
   qu'elles sont saines — seulement qu'on ne les a pas regardées.

4. **Une erreur de cette session, à connaître.** Mon banc de caractérisation, en
   première version, écrivait ses données d'essai dans le stockage partagé par
   tous les tests sans nettoyer derrière lui. Résultat : la suite complète est
   passée verte une fois, puis a rendu dix rouges à l'exécution suivante, dans
   des tests sans rapport. Corrigé, et vérifié par deux exécutions identiques —
   mais j'avais d'abord conclu d'une seule exécution verte. **Une seule passe
   verte en intégration ne prouve rien.**

5. **Les numéros de ligne cités dans le BACKLOG vieillissent vite.** Ceux de
   l'annexe du plan du 23 août étaient déjà faux d'une dizaine de lignes le
   lendemain. Se fier aux **noms**, pas aux positions.

---

## Au retour

Chaque verdict « défaut » devient un item de BACKLOG avec son numéro de
décision (D1…D10). Aucun ne reste une note mentale.
