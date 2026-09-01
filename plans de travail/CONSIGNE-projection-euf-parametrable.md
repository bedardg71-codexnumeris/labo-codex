# Consigne — Rendre paramétrable la projection EUF de la grille algorithmique

> Préparé en **Cowork le 1er septembre 2026**, avec Grégoire, après lecture du code.
> Destinataire : **une session Claude Code**.
> ⚠ **MODIFIÉ LE 1ER SEPTEMBRE, APRÈS REMISE À LA SESSION Claude Code.**
> Ajout du **Lot 6 — la projection dans le PDF de rétroaction** (§3), de décisions
> en §6, et **réécriture du point « CAF » du Lot 2** (le service n'existe plus). Si tu as déjà lu ce document, relis §3 Lot 6, §5 et §6.
>
> Chantier **non ouvert** : rien n'a encore été écrit. Aucun identifiant de backlog
> n'est consommé — prendre le suivant après vérification de `BACKLOG.md`
> (dernier vu : **#667**).

---

## 0. Reprise de session (handoff)

Cette section suffit à reprendre sans la conversation d'origine. **Tout ce qui suit
a été lu dans le code, pas déduit.** Ne pas re-dériver.

### La demande, en une phrase

La rétroaction qui situe l'élève par rapport au seuil de l'épreuve uniforme de
français (EUF) **existe déjà et fonctionne** — mais elle est **codée en dur**.
Il faut la remonter vers le gabarit de la grille, exactement comme **#667** vient
de le faire pour la formule de note.

C'est le prolongement direct du chantier des derniers jours : retirer de
l'application ce qui est propre à la pratique de Grégoire, pour le rendre
paramétrable par d'autres enseignant·es.

### ⚠ Ce qu'il ne faut PAS faire

- **Ne pas reconstruire la projection EUF.** Elle est livrée. Voir l'inventaire §2.
- **Ne pas créer de cartouche supplémentaire.** Une évaluation n'applique qu'une
  cartouche (`evaluationEnCours.cartoucheId` est un scalaire) et le format
  matrice critères × niveaux ne convient pas à un verdict sur un ratio continu.
  La question a été posée et tranchée.
- **Ne pas toucher au vocabulaire disciplinaire** (« erreurs de français »,
  « rédaction »). C'est un chantier distinct — voir §5.

---

## 1. Le raisonnement pédagogique (à comprendre avant de coder)

**Deux normes cohabitent, et elles ne doivent pas être confondues.**

1. **La norme de notation du cours** — combien de points l'élève perd.
   Elle varie par cours, selon le département de Grégoire :
   601-101 Écriture et littérature → **600 mots** (était 500, à corriger)
   601-102 Littérature imaginaire → **700 mots**
   601-103 Littérature québécoise → **900 mots**
   C'est déjà le paramètre `facteurNormalisation` du modèle `penalite_normalisee`.
   Exigence croissante d'un cours à l'autre, vers la norme de l'EUF.

2. **La norme de l'EUF** — où l'élève se situe face à l'épreuve ministérielle.
   **30 erreurs maximum pour un texte de 900 mots**, soit 1 erreur / 30 mots.
   Fixe, indépendante du cours.

C'est **tout l'intérêt du dispositif** : en 101, l'élève est *noté* sur une base
de 600 mots, mais on lui dit où il se situe face à 900. En 103 les deux normes
coïncident. La projection ne doit donc **jamais** lire `facteurNormalisation`.

---

## 2. Inventaire vérifié — ce qui existe déjà

| Ce qui existe | Où | État |
|---|---|---|
| Registre des modèles de formule (#667) | `js/evaluation-formules.js` | commité `192b2a58` le 1er sept., **non poussé** |
| 3 modèles : `penalite_normalisee`, `ratio_cible`, `penalite_par_erreur` | idem | livrés |
| Rendu du gabarit (sélecteur + params + formule engendrée) | `js/grilles.js:3346` `rendreBlocFormuleAlgo` | livré |
| **La projection EUF elle-même** | `js/evaluation-calcul.js:178` `genererRetroactionEUF` | **livrée, en dur** |
| Sous-critères pondérés (11 catégories d'erreurs) | `js/grilles.js:3955` `sousCriteresParDefaut` | livrés |
| Somme pondérée tenant lieu d'erreurs | `js/evaluation-calcul.js:338` `_calculerScoreAlgoCategories` | livré |
| Transport du modèle de formule | `js/import-export.js:593`, `js/partage-schemas.js:217` | livré |

### `genererRetroactionEUF` — ce qu'elle fait aujourd'hui

```
erreurs === 0        → « En prévision de l'EUF, l'absence d'erreur est exceptionnelle. »
mots === 0           → '' (aucune projection)
motsParErreur = mots / erreurs
  ≥ 100  → « ce ratio est excellent. »
  ≥ 75   → « très bien. »
  ≥ 60   → « bien. »
  ≥ 30   → « risqué [...] près du seuil de l'échec. » + mention du CAF
  < 30   → « mènerait à un échec automatique. » + mention du CAF
```

**Deux appelants réels** : `evaluation-calcul.js:407` (mode catégories, via
`_construireRetroactionAlgoCategories`) et `:565` (mode simple).
⚠ L'en-tête du module (lignes 9 et 41) en annonce **trois**. La dérive est déjà
là : `calculerNoteAlgorithmique` (ligne 95) est du code mort et n'appelle pas
ce helper. Corriger le commentaire en passant.

⚠ **Une COPIE INTÉGRALE de la fonction vit dans `scripts/reparation-donnees-algorithmiques.js:60`**,
utilisée ligne 167. Deuxième source de vérité : à traiter dans le même chantier,
sinon le script réparera selon une règle que le gabarit ne pilote plus.

---

## 3. Le plan, lot par lot

### Lot 0 — Assainir le terrain (avant toute ligne de code neuf)

1. ~~**Committer #667.**~~ ✅ **FAIT** — `192b2a58`, 13 fichiers, rituel complet,
   Vitest et Playwright verts. Reste à POUSSER (geste de Grégoire).
   *Consigne d'origine, conservée pour mémoire :* `js/evaluation-formules.js` et
   `tests/unit/sentinelle-667-formule-livree-par-le-gabarit.test.js` sont
   untracked ; 11 fichiers sont modifiés, sur `main`. Rituel `/fin-de-session`,
   Vitest **depuis `tests/`**.
2. **Passer le facteur 500 → 600** sur la grille *Grille-1 FR-ALGO seul A26*.
   ⏳ **Geste de Grégoire, dans l'application** — pas une écriture de code.
3. **Constat à vérifier avant de bâtir dessus** : `js/partage-schemas.js` ne
   déclare **pas** `sousCriteres`. Les 11 rétroactions voyagent à
   l'import/export (#511, `import-export.js:618`) mais peut-être pas au partage.
   Lecture de schéma seulement, **non vérifiée en exécution**. Mesurer avant
   de conclure ; si le trou est réel, le dire à Grégoire — il décidera si ça
   entre au backlog ou reste un commentaire dans le code.

### Lot 1 — Le registre de projection

Nouveau fichier `js/evaluation-projection.js`, **même contrat que
`evaluation-formules.js`** : ni DOM, ni `db`, ni `evaluationEnCours` ; testable
en Node ; aucune expression interprétée (pas d'`eval`, pas de `new Function`).

**Modèle de données sur le critère** (SSOT) :
- `critere.modeleProjection` — identifiant du modèle
- `critere.paramsProjection` — paramètres du modèle
- `critere.paliersProjection` — tableau des paliers

**Modèle « norme externe »** (le cas EUF), paramètres :
- `motsReference` (défaut **900**)
- `erreursTolerees` (défaut **30**)

Calcul :
```
seuilMotsParErreur = motsReference / erreursTolerees          (= 30)
motsParErreur      = mots / erreurs
ratio              = seuilMotsParErreur / motsParErreur
                   = seuilMotsParErreur × erreurs / mots
```
`ratio = 1` → exactement au seuil. `ratio > 1` → sous le seuil.

**⚠ Décision de conception : les seuils de paliers sont stockés en ratio
normalisé, PAS en mots-par-erreur.** Motif : si l'utilisateur change la norme
de référence, des seuils écrits « 100 / 75 / 60 / 30 » perdent leur sens et
sont à réécrire un à un ; des ratios « 0,3 / 0,4 / 0,5 / 1,0 » gardent le leur.
Afficher les deux unités dans le gabarit, comme `libelleSymbolique` affiche
la formule.

**Migration à la lecture, aucune écriture de masse** (règle #667). Un critère
sans `paliersProjection` reçoit les paliers d'aujourd'hui :

| ratio ≤ | équivaut à | texte actuel à reprendre **mot pour mot** |
|---|---|---|
| (0 erreur) | — | « l'absence d'erreur est exceptionnelle » |
| 0,3 | 100 mots/erreur | « ce ratio est excellent » |
| 0,4 | 75 | « très bien » |
| 0,5 | 60 | « bien » |
| 1,0 | 30 | « risqué […] près du seuil de l'échec » + CAF |
| > 1,0 | — | « mènerait à un échec automatique » + CAF |

Comportement d'aujourd'hui reproduit **au bit près**. Le palier « zéro erreur »
est un palier à part entière, paramétrable lui aussi. `mots === 0` continue de
ne rien produire.

**API** : `calculer(critere, {erreurs, mots})` → `{applicable, raison, ratio,
motsParErreur, palier, texte}`. Comme `formulesAlgo.calculer`, ne **jamais**
deviner : `applicable: false` avec une `raison` nommée.

### Lot 2 — Un seul lieu de vérité pour le texte

> ⛔ **ORDRE MODIFIÉ LE 1ER SEPTEMBRE — la part « registre » du Lot 5 passe AVANT
> ce lot.** Ce n'est pas une préférence de méthode, c'est une contrainte : le Lot 2
> SUPPRIME `genererRetroactionEUF`, qui est **le seul oracle** contre lequel
> l'équivalence du registre peut être établie. Une fois la fonction partie, la
> mesure « reproduit au caractère près » n'est plus refaisable — elle devient une
> affirmation invérifiable. Le golden doit donc être **extrait de la fonction
> vivante et figé dans un fichier de test** avant qu'elle disparaisse.

- Les deux appelants (`evaluation-calcul.js:407` et `:565`) passent par le
  registre. `genererRetroactionEUF` **disparaît** (zéro-dette : pas d'alias).
- `scripts/reparation-donnees-algorithmiques.js` : retirer la copie ou la
  brancher sur le registre. Trancher explicitement, ne pas laisser en l'état.
- ⚠ **Le « CAF » codé en dur est devenu FAUX — et c'est l'exemple type du problème
  que ce chantier corrige.** Le Centre d'aide en français n'existe plus au collège
  de Grégoire : il est devenu **Passerelle +**, et la transition n'est pas finie.
  L'application dit donc aujourd'hui à des élèves de s'inscrire à un service
  disparu. Deux paramètres, pas un :
  · `nomServiceAide` — texte libre (« Passerelle + », « Centre d'aide en français »…)
  · `lienServiceAide` — **facultatif**, et vide pour l'instant.
  Le rendu doit être propre sans lien : une mention de service sans URL est le cas
  NORMAL pendant une transition, pas un cas dégradé. Aucun « [lien] » orphelin,
  aucun deux-points suspendu.
- Corriger l'en-tête du module (« les 3 fns » → deux appelants).

### Lot 3 — Le gabarit

`rendreBlocFormuleAlgo` (`grilles.js:3346`) rend déjà sélecteur de modèle,
champs de paramètres et formule engendrée, avec les handlers `data-on-change`
(`modifierModeleFormuleTempHandler` / `...GrilleHandler`). Le bloc projection
s'y ajoute **sous le même patron** — pas un second dispositif à côté.

L'édition des paliers reprend l'interface **déjà éprouvée des sous-critères**
(ajout, suppression, valeur numérique, texte long). Ne pas inventer une
troisième façon d'éditer une liste.

⚠ Zéro handler inline, `echapperHtml()` sur tout texte utilisateur injecté en
`innerHTML` — les textes de paliers sont du texte libre saisi par l'enseignant·e.

### Lot 3b — Replier les paliers dans le gabarit

*Ajouté le 1er septembre, après la livraison du Lot 3. Non bloquant, indépendant
des lots 4, 5 et 6 — il ne touche que `rendreBlocFormuleAlgo` et son voisinage.*

**Le problème constaté par Grégoire à l'usage** : le bloc de projection prend
beaucoup d'espace vertical dans le gabarit.

**Deux niveaux, et ils ne disent PAS la même chose** — c'est ce qui justifie
d'avoir les deux plutôt qu'un seul contrôle :

- le **sélecteur de modèle** décide si la projection existe → c'est une **donnée** ;
- un **repli** décide si on regarde les réglages → c'est de l'**affichage**.

Le sélecteur seul ne règle rien pour qui utilise la fonction : Grégoire choisira
toujours « norme externe », et le bloc se déploiera entier chez lui.

**Ce qui reste visible** : le modèle, la norme (mots de référence, erreurs
tolérées), le nom du service d'aide et son lien. Champs courts, ceux qu'on ajuste.

**Ce qui se replie** : les cinq paliers — seuils, textes rendus à l'élève,
phrase de recommandation. C'est là qu'est le volume.

⚠ **L'en-tête du repli doit RÉSUMER ce qu'il cache**, par exemple
« Cinq paliers · seuil d'échec à 1 erreur / 30 mots ». Sans résumé, on échange
de l'espace vertical contre de l'opacité, et une configuration fautive devient
invisible tant que personne n'ouvre le panneau. C'est ce qui distingue un repli
utile d'un repli qui cache.

⚠ **Réutiliser le patron d'accordéon déjà employé ailleurs dans l'app**, pas en
inventer un. Regarder au passage la sentinelle #573 (« la cartouche reste
ouverte ») : l'état d'un panneau a déjà causé un défaut ici.

#### Deux décisions prises, à ne pas rouvrir

- **Aucune case à cocher pour la projection.** Elle ferait doublon avec le modèle
  « Aucune projection » livré au Lot 3 — deux contrôles pour une seule décision,
  et deux contrôles qui peuvent se contredire. C'est la famille de défauts que ce
  chantier existe pour supprimer.
- **Les sous-critères restent exactement tels quels** : ni case, ni repli. Motif :
  `sousCriteres.length > 0` (`evaluation-calcul.js:869`) **EST** le mode de calcul.
  Une case à cocher devrait donc trancher entre supprimer les onze catégories et
  leurs longs textes, ou les masquer pendant que le calcul continue de les voir.
  Les deux réponses sont mauvaises. Grégoire ajoute que projection EUF et
  sous-critères sont complémentaires, pas concurrents.

⏳ **À valider auprès de la cohorte 1 de la communauté de pratique** (première
rencontre mi-septembre 2026) avant d'en faire une règle. Grégoire : « nous
verrons avec les utilisateurs si ça convient à leurs besoins. »

*Question laissée ouverte, non bloquante : l'état du repli doit-il être mémorisé
par utilisateur via `preferences.js` ?*

### Lot 4 — Le transport

`js/import-export.js` (~ligne 593) et `js/partage-schemas.js` (~ligne 217) :
déclarer `paramsProjection` et `paliersProjection` en **schéma FERMÉ**, jamais
`{ type: 'object' }` nu — un schéma ouvert laisse entrer un objet arbitraire
dans la base.

Sans ce lot, on reproduit exactement le défaut que #667 vient de corriger : la
grille arrive, calcule autre chose que ce que son auteur·e a réglé, et ne dit rien.

### Lot 5 — Sentinelles

> ⚠ **Ce lot se coupe en deux.** La part qui couvre le REGISTRE (les cinq
> verdicts, les frontières exactes, le palier zéro, l'équivalence avec
> `genererRetroactionEUF`) se fait **immédiatement après le Lot 1**, avant le
> Lot 2 — voir l'encadré du Lot 2. La part qui couvre le branchement, le gabarit
> et le transport reste à sa place, en fin de chantier.

**Vitest** (Node pur, sur le registre) :
- la migration à la lecture rend les cinq verdicts d'aujourd'hui, textes compris ;
- les frontières **exactes** : ratio = 0,3 · 0,4 · 0,5 · 1,0 (inclusives) ;
- 0 erreur → palier dédié ; 0 mot → non applicable ;
- somme pondérée décimale (0,5 par erreur de ponctuation) : le ratio suit.

**Playwright** : le texte affiché en évaluation suit le gabarit et non le code —
changer un palier dans la grille change la phrase rendue.

⚠ **Break-test §4 obligatoire** : faire **ROUGIR** chaque sentinelle avant de lui
faire confiance. C'est l'étape que le biais d'auteur saute.

### Lot 6 — La projection dans le PDF de rétroaction

> ⛔ **BLOQUÉ SUR UNE DÉCISION DE CONCEPTION (1er septembre, 22 h).**
> Ne pas ouvrir ce lot avant que Grégoire ait tranché la question du DOUBLON
> ci-dessous. Les lots 4 et 5 ne sont pas bloqués, eux.

#### ⛔ La question qui bloque : le doublon

Le bloc du Lot 6 se construit depuis les **nombres** (`erreurs`, `mots`), pas
depuis le texte stocké. Il apparaîtra donc aussi dans les PDF des copies **déjà
évaluées**. Or le Lot 2 continue d'écrire la phrase EUF dans le **commentaire**
du critère. Chaque PDF dirait donc la projection **deux fois** : la phrase dans
le commentaire, et le bloc à côté.

⚠ **Contrainte dure, qu'aucun choix ne lève** : les évaluations déjà faites
portent leur phrase **gelée** dans `donneesAlgorithmiques[id].retroaction`. Aucun
changement de code ne peut la retirer rétroactivement, et la régénérer
écraserait le paragraphe de catégorie dominante. Le bloc doit donc être conçu
pour **coexister proprement avec une phrase gelée qu'on ne peut pas retirer**.

Trois voies, à soumettre à Grégoire :

- **(a) Le bloc remplace la phrase.** Le commentaire cesse de porter la
  projection ; le bloc la porte seul. Une seule source pour les évaluations
  futures. ⚠ Ne règle rien pour l'archive : toute copie déjà évaluée garde sa
  phrase gelée et recevrait le bloc en plus.
- **(b) Répartition.** La phrase reste dans le commentaire (verdict), le bloc ne
  porte que ce que le commentaire ne peut pas porter : la mesure, la rangée de
  paliers, la phrase de cadrage, le service. Redondance réduite plutôt
  qu'éliminée, et l'archive reste cohérente.
- **(c) Statu quo, doublon assumé.** À écarter sauf argument.

#### ⚠ Deuxième constat : les copies SANS FAUTE ne reçoivent aucune projection

En mode catégories, `calculerNoteAlgorithmiqueAvecCategories` sort sur
`if (mots === 0 || totalErreurs === 0) return;` **avant** d'écrire la
rétroaction. Un élève à **zéro erreur** n'a donc rien de stocké, et la cartouche
prend la place. Les meilleures copies sont celles qui reçoivent le moins.

Le bloc du Lot 6, lui, se construisant depuis les nombres, **corrigerait ce trou
de lui-même** — à condition que le palier « zéro erreur » soit rendu. C'est un
argument en faveur du bloc, à verser dans la décision ci-dessus.


**À faire APRÈS les lots 1 à 5.** Le registre doit exister avant qu'on en rende
quoi que ce soit. Fichiers : `js/synthese-retroaction-data.js` (données) et
`js/synthese-retroaction-rendu.js` (rendu).

#### ⚠ Constat vérifié : la phrase EUF n'atteint pas le PDF

`synthese-retroaction-data.js:388` construit le texte d'un critère par cascade :

```
texte personnalisé  >  rétroaction générée (celle qui porte l'EUF)  >  commentaire de cartouche
```

Mesuré sur une copie réelle (601-101-MQ, H2026, artefact 10, une rédaction de
584 mots) : **la phrase EUF est absente du PDF remis**.

⚠ **Précision apportée par la session Claude Code, et elle a raison : la cartouche
n'écrase rien.** Elle est TROISIÈME dans la cascade — elle ne comble qu'un trou.
Il y a donc au moins **deux chemins de perte distincts**, que le PDF ne distingue
pas :

- un **texte personnalisé** évince la rétroaction engendrée ;
- `donneesAlgorithmiques[id].retroaction` était **vide à l'origine** (données
  restaurées, calcul jamais rejoué — c'est précisément ce que répare
  `scripts/reparation-donnees-algorithmiques.js`), et la cartouche prend alors
  la place laissée libre.

Peu importe lequel des deux : la conclusion de conception est la même, et elle
est renforcée. `critere.algo` (`data.js:406`) est construit depuis
`donneesAlgoCrit.erreurs` et `.mots` — les NOMBRES, testés indépendamment de
`.retroaction`. La ligne compacte survit donc là où la phrase disparaît.

⮕ **La projection ne doit donc PAS transiter par le champ commentaire.** Elle se
construit depuis `donneesAlgorithmiques`, qui alimente déjà la ligne compacte et
qui, elle, est toujours là.

#### A. Ligne compacte, page 1 (`rendu:352`)

La mesure seule, aucun verdict :

```
15 erreurs sur 584 mots → 7.16/20 (35,8 %) · 1 erreur / 39 mots
```

#### B. Bloc dédié, page 2, colonne de droite

Sous « Français écrit · 2 catégories les plus fréquentes » (`rendu:510`), avec le
helper `sectionHeader` existant. Contenu :

> **PROJECTION · ÉPREUVE UNIFORME DE FRANÇAIS**
>
> Tu fais en moyenne 1 erreur à chaque 39 mots.
>
> `[excellent] [très bien] [bien] [ risqué ] [échec]`  ← palier atteint encadré
>
> À l'épreuve uniforme, le seuil est de 1 erreur à chaque 30 mots (30 erreurs
> pour 900 mots). Ton ratio est risqué : il est près du seuil de l'échec.
> Il est recommandé de t'adresser au service d'aide en français de ton collège.

⚠ **La dernière ligne est ENGENDRÉE selon la règle du Lot 2**, jamais écrite en
dur : `nomServiceAide` s'il est rempli, et le lien **seulement** si
`lienServiceAide` est non vide. Une version antérieure de cet exemple nommait le
« CAF » et laissait un `[lien]` orphelin — elle datait d'avant la réécriture du
Lot 2. **La règle du Lot 2 l'emporte sur cet exemple.**
>
> *C'est une projection, pas une prédiction. Ton texte fait 584 mots, l'épreuve
> en demande 900. Elle donne une idée de ce que ton écriture d'aujourd'hui
> donnerait à l'épreuve, et les exigences augmenteront en 102 et en 103.*

#### Quatre décisions de conception (actées par Grégoire, ne pas rouvrir)

1. **La rangée de cinq paliers reprend le patron des pastilles 0-I-D-M-E**
   (`rendu:335`). Même grammaire visuelle que les critères : l'élève sait déjà la
   lire. Ne pas inventer un troisième langage graphique.
2. **Le ratio normalisé ne s'affiche JAMAIS.** Il sert au calcul. L'élève voit
   « 1 erreur / 39 mots » face à « 1 / 30 », qui se comprend sans glose.
3. **La phrase de cadrage se coupe en deux** : la première moitié est ENGENDRÉE
   (les deux nombres de mots viennent des données et de `motsReference`) ; la
   seconde est du **texte libre du gabarit**. La mention du 102 et du 103
   appartient au département de Grégoire, pas au code.
4. **Le mot juste est « projection », jamais « prédiction ».** Décision explicite
   de Grégoire : à 584 mots pour une norme calibrée sur 900, on présage, on ne
   prédit pas.

#### Deux pièges

- ⚠ **Anonymisation.** Le texte libre du gabarit et les textes de paliers sont
  saisis par l'enseignant·e et peuvent contenir un prénom. Ils doivent passer par
  `anonymiserTexteRetroaction`, comme les rétroactions depuis #566 — sinon un
  prénom sort dans un PDF anonymisé. Et `esc()` sur tout, comme le reste du rendu.
- ⚠ **Densité.** La colonne de droite porte déjà deux catégories d'erreurs à
  textes longs. **Mesurer au rendu** si le bloc y tient sans pousser le BILAN à la
  page suivante. Repli si ça déborde : verdict sur une seule ligne, phrase de
  cadrage descendue dans le bilan. Ne pas trancher sur papier.

---

---

## 4. Vérification de fin de chantier

1. `cd tests && npm test` — **jamais depuis la racine** (elle balaie
   `.claude/worktrees/` sans la config : 217 fichiers rouges).
2. Rituel `/fin-de-session`, §4 adverse compris.
3. Skill `release-et-changelog` : intention SemVer — **`minor`** attendu
   (fonctionnalité paramétrable neuve, aucune rupture). `node scripts/release.mjs minor`.
4. Fusion vers `main` en fin de session (règle de relais).

---

## 5. Hors de ce chantier — ne pas l'y glisser

> Le rendu PDF **n'est plus** hors chantier depuis le 1er septembre : il est
> devenu le **Lot 6**, à faire après les lots 1 à 5.

**L'élargissement à d'autres disciplines.** « Ta rédaction contient N erreurs de
français pour M mots » est en dur aux deux sites de construction de rétroaction,
et la source du compte vient des annotations `errfr_*` (`travauxOutils.CODES_ERREURS_FR`).
Généraliser demande des libellés d'unité portés par le modèle et une source de
quantité indépendante des annotations de français.

C'est l'objectif de Grégoire à terme, mais c'est un **second chantier**. Le
mélanger à celui-ci ferait grossir le scope sans que le premier soit fini.

---

## 6. Décisions déjà actées par Grégoire (ne pas rouvrir)

- Norme EUF : **30 erreurs / 900 mots**. Sa formulation antérieure « 30 fautes
  sur 500 mots » était une erreur de mémoire, corrigée par lui.
- Son compte d'erreurs est **brut** ; la pondération par catégorie doit rester
  possible (d'autres collèges comptent la ponctuation en demi-faute) — elle
  existe déjà via `sousCriteres[].ponderation`.
- **Tout doit être paramétrable, rien en dur**, avec un **gabarit « critères EUF »**
  fourni comme point de départ pour les nouveaux utilisateurs.
- Pas de multi-cartouche. Un registre paramétrable, sur le patron de #667.
- **Les grilles algorithmiques ne servent QUE sur les rédactions.** Ailleurs,
  Grégoire emploie une grille holistique et ne dit rien de l'EUF. Le critère
  algorithmique est donc à lui seul le bon déclencheur : **aucun réglage
  « afficher ou non » à ajouter**. Il suffit que le registre porte un modèle
  **« Aucune projection »** pour les autres usages, et que la migration à la
  lecture donne « norme externe » aux critères existants.
- **L'écart entre les deux verdicts doit être EXPLIQUÉ à l'élève**, pas laissé
  en silence. Sur la copie mesurée : note algorithmique 35,8 % (Insuffisant) et
  projection EUF « risqué, près du seuil » — deux normes différentes, deux
  verdicts vrais. ⚠ Le passage du facteur 500 → 600 élargit l'écart : le même
  travail tombe à 4,59/20 (23 %) pendant que la projection ne bouge pas.
- **Deux voies pour les textes par défaut, à ne pas confondre :**
  · la **migration à la lecture** reproduit les textes d'aujourd'hui *au mot près*,
    « CAF » compris — la fidélité au comportement existant prime, même quand ce
    comportement porte une erreur ;
  · le **gabarit « critères EUF » livré aux nouveaux utilisateurs** ne charrie
    aucune particularité d'établissement : il parle d'un « service d'aide en
    français » générique, sans nom ni lien.
  ⏳ Conséquence pour Grégoire : ses paliers migrés arriveront en disant « CAF ».
  Premier geste après la livraison — les corriger dans le gabarit.
- **La fenêtre est ouverte maintenant** : première évaluation de l'automne, texte
  diagnostique **formatif**, ne comptant pas dans la note, aucun résultat remis.

## 6bis. Décisions du 1er septembre (après le Lot 1)

- **Le jeton `{service}` va en APPOSITION dans le gabarit livré**, pas en
  complément. Motif : le nom du service peut rester vide longtemps (transition
  Passerelle +). Une phrase qui dégrade vers une phrase encore vraie et encore
  utile — l'élève est invité à chercher de l'aide — vaut mieux qu'une phrase qui
  doit disparaître entière. La contrainte porte sur le **texte par défaut livré** ;
  l'enseignant·e reste libre de son texte.
- ~~**Le cas (0 erreur, 0 mot) est reproduit tel quel**~~ ✅ **TRANCHÉ.** Mesuré
  atteignable, et c'est une **régression introduite par #667 le matin même** : la
  garde du mode simple est passée de `if (mots === 0)` à
  `if (motsRequisSimple && mots === 0)`, et le modèle neuf `penalite_par_erreur`
  porte `utiliseMots: false`. Un critère « la longueur ne compte pas ici », sans
  aucun mot saisi, annonce donc à l'élève que son absence d'erreur est
  exceptionnelle en prévision d'une épreuve calibrée sur un nombre de mots.
  ⮕ **Corrigé DANS le registre, en déviation nommée, avant le Lot 2.** Motif :
  `utiliseMots` est un attribut du modèle de **NOTE**. La projection a son propre
  besoin en mots, et il est **inconditionnel** — « 1 erreur / N mots » n'a aucun
  sens sans N, quelle que soit la formule qui calcule la note. Corriger au site
  d'appel (Lot 2) reconduirait le couplage que #667 a créé par accident : le
  registre porterait une règle que son appelant contredit.
  ⚠ **La ligne du golden qui bouge doit porter sa justification DANS le fichier
  de test.** Un golden qu'on ajuste sans dire pourquoi cesse d'être un oracle.
  Une seule ligne bouge ; toutes les autres restent gelées.
  ⚠ **Exposition réelle : quasi nulle.** Le seul modèle qui déclenche le cas est
  né ce matin et aucune grille existante ne l'emploie. C'est un défaut à corriger
  proprement, pas un incident à colmater.
  ⮕ Pas de nouvel identifiant : trouvaille de passage corrigée dans le même
  chantier avant livraison, tracée dans #668.

---

## 7. Ce qui reste à demander à Grégoire

1. Le verdict sur le constat `sousCriteres` absent de `partage-schemas.js`
   (Lot 0.3), une fois mesuré.
2. Le nom exact à afficher pendant la transition (« Passerelle + » ou autre) et,
   le jour où il existera, le lien d'inscription. **Ne pas bloquer le chantier
   là-dessus** : le champ reste vide, l'enseignant·e le remplira depuis le gabarit.
