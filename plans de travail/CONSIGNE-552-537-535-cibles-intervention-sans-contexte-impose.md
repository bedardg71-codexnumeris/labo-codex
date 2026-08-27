# CONSIGNE — #552 · #537 · #535 : les cibles d'intervention, sans le contexte de Grégoire

> **Écrite le 27 août 2026, fin d'après-midi, pour une session fraîche.**
> Le chantier n'est pas commencé. Ce qui est fait, c'est la MESURE — et elle
> a déplacé le sujet.

---

## 0. LA RÈGLE, ET ELLE COMMANDE TOUT LE RESTE

> **Grégoire, 27 août 2026** : « Ce qui est important, ici, c'est surtout de ne
> rien coder en dur. Les utilisateurs auront tous des besoins et des conditions
> différentes et je ne veux pas imposer mon contexte. »

Ce n'est pas une préférence de style. C'est le critère qui tranche chacune des
questions ouvertes de ce chantier — et il **élimine des options avant qu'on en
discute** (§4).

⚠ **Distinguer conséquence logique et valeur arbitraire.** Dériver « la cible
porte le nom du critère » depuis une donnée que l'utilisateur a saisie est une
conséquence. Écrire « au-dessus de 75 %, l'élève est en maîtrise » est un
arbitraire, même si le nombre est configurable. La règle vise le second.

---

## 1. LE SUJET, EN TROIS LIGNES

`determinerCibleIntervention` (`js/profil-etudiant-calculs.js`) décide quelle
intervention est recommandée pour un élève. Elle est **vivante** : elle alimente
l'écran d'accompagnement du profil et la zone critique du tableau de bord.
Elle est écrite **entièrement** sur le contexte de Grégoire — ses cinq critères,
ses seuils, sa pondération d'il y a deux ans, son établissement.

---

## 2. CE QUI EST ÉTABLI — mesuré et prouvé le 27 août

### 2.1 Le défaut principal : un bon français masque une difficulté ailleurs (#552)

`const I = indices3Derniers.francaisMoyen` est passé aux **quatre** résolveurs
de cibles (`_resoudreCibleDifficultePersistante`, `_resoudreCibleDifficulteEmergente`,
`_resoudreCibleDefiSpecifique`, `_resoudreCibleStable`), où il conditionne les
branches de **tous** les critères — pas seulement celles du français :

```js
if (N === 'Structure' && I <= 17) { … }        // I = la moyenne en FRANÇAIS
if (N === 'Rigueur' && I >= 18 && I <= 27) { … }
```

**Prouvé** par `tests/unit/constat-552-cible-rai-pilotee-par-le-francais.test.js`
(RÉÉCRIT et renommé le 27 août en
`tests/unit/sentinelle-552-cible-independante-du-critere-de-langue.test.js`)
(4 tests, 2 break-tests rouges, restauration `diff -q`). Trois élèves identiques
en tout — mêmes `noteFinale`, donc même performance, donc même pattern ; même
Structure au plus bas, donc même défi principal :

| Moyenne en langue | `I` | Cible reçue | RàI |
|---|---|---|---|
| 15 % | 15 | « Remédiation en Structure \| Exercice supplémentaire \| CAF » | **3** |
| 60 % | 60 | « À clarifier en rencontre individuelle » | **1** |
| 90 % | 90 | « À clarifier en rencontre individuelle » | **1** |

⮕ La difficulté en Structure du deuxième et du troisième **n'est même plus
nommée** dans leur cible.

### 2.2 Le défaut d'unité, qui se superpose au premier

`francaisMoyen` est un **pourcentage 0-100** (`scoresFrancais.push(score * 100)`).
Les seuils comparés sont `17, 18, 20, 21, 25, 27`.

⮕ **Grégoire, 27 août** : « La pondération a déjà été sur 30, ensuite elle a été
sur 20 à l'H26. » Ce sont donc des **notes brutes sur 30** : 17/30 = 57 % (seuil
d'échec), 20/30 = 67 %, 27/30 = 90 %. La progression des cibles y est cohérente
— CAF et dépistage sous 17, révision ciblée de 18 à 20, révision simple de 21
à 27.

⚠ **Deux fois périmées** : mauvaise unité (comparées à un pourcentage), et
calibrées sur une pondération abandonnée. **Sur 20, la bande `I >= 21 && I <= 27`
ne peut plus jamais correspondre à une note réelle.**

⚠ **C'est le patron exact de la correction 1.102** — « un pourcentage comparé à
un seuil exprimé dans une autre unité, si bien que tout le monde ressortait au
niveau le plus élevé ». Le même défaut vit ici, dans une autre fonction, non
corrigé. **Le chercher ailleurs fait partie du chantier.**

### 2.3 Le reste du contexte imposé, site par site

| Site | Ce qui y est écrit | Item |
|---|---|---|
| `calculs.js:1107` · `pratique-pan-standards.js:1131` | `NOM_CRITERE_LANGUE = 'francais'` — le critère de langue reconnu par son NOM | **#537** |
| `calculs.js:1612` → `1673` | `N === 'Structure'`, `'Rigueur'`, `'Plausibilité'`, `'Nuance'`, `'Français'` dans les quatre résolveurs | **#535** |
| idem | Les libellés « CAF », « Dépistage SA », « Pratique guidée en X », « Remédiation en X » | **#535** |
| idem | Les seuils `17 / 18 / 20 / 21 / 25 / 27` | **#552** |
| `sections-affichage.js:1236` | `criteres.filter(c => c.nom !== 'Français' …)` — l'exclusion de la carte de structure | **#537** |
| 8 sites (voir §5) | `startsWith('francais') → 'francais'` — rabotage de clé | **à ouvrir** |

### 2.4 Ce que la décision de Grégoire a déjà tranché (27 août)

- **Le critère de langue est un critère comme un autre.** Pas de statut propre,
  pas de désignation par l'utilisateur d'un « critère de langue ». Le
  `francaisMoyen` disparaît comme notion.
- **Son critère Français apparaîtra dans la carte « Observation de la
  structure »**, dont il est exclu aujourd'hui. Conséquence assumée, confirmée
  explicitement.

---

## 3. ⚠ LES TROIS ITEMS NE SONT PAS SÉPARABLES

C'est la trouvaille qui a fait écrire cette consigne. `I` **est**
`francaisMoyen`. Retirer `francaisMoyen` (le geste de #537) fait tomber `I`,
donc **les quatre résolveurs en entier** — pas seulement leurs branches
Français. Il n'y a pas de « petit pas #537 » qui laisserait #535 pour plus tard.

⮕ **Ordre imposé par le code, pas par le plan** : #552 (qu'est-ce qui décide de
l'intensité ?) → #535 (d'où vient une cible ?) → #537 (le nom du critère de
langue disparaît avec le reste).

---

## 4. CE QUE LA RÈGLE DE GRÉGOIRE ÉLIMINE — à ne pas rediscuter

| Option | Verdict |
|---|---|
| Garder les seuils en les corrigeant (`17/30` → `57 %`) | **Éliminée.** Ce sont ses paliers de correction du français. Justes pour lui, arbitraires pour tout autre |
| Rendre les seuils configurables avec ses valeurs par défaut | **Éliminée.** Un défaut arbitraire reste un arbitraire : il devient la norme de qui n'y touche pas. Cf. #551, même famille |
| Désigner « le critère de langue » par un réglage | **Éliminée par sa décision du 27 août** (§2.4) : un critère comme un autre |
| Écrire les cibles génériques en dur (« Pratique guidée en X ») | **À examiner, pas acquise.** « Pratique guidée », « Remédiation », « CAF » sont un vocabulaire d'intervention — le sien. Un enseignant d'un autre réseau n'a pas de CAF |

---

## 5. LE RABOTAGE DE CLÉ — un défaut distinct, à sortir en item propre

Huit sites font `startsWith('francais') → 'francais'` :
`calculs.js` (526, 675, 696) · `helpers.js` (670) · `sections-affichage.js` (1101) ·
`interventions.js` (995, 1173, 1221).

⚠ **Ce n'est pas de la didactique**, contrairement aux apparences. C'est un
pansement sur un appariement de clés qui échoue : deux endroits normalisent le
nom d'un critère et n'obtiennent pas la même clé, et on a raboté « francais »
spécifiquement parce que c'est là qu'on avait vu le symptôme.

⮕ **Tout critère dont le nom varie entre deux écritures a le même bug, en
silence, avec des 0 %.** Un indice mesuré au passage : dans
`diagnostiquerForcesChallenges`, un critère nommé « Français écrit » produit la
clé `francaisecrit`, que `moyennes` ne contient pas (elle contient `francais`) —
le critère est donc **filtré du diagnostic**, sans un mot.

⮕ Ne pas le mélanger au chantier des cibles. **Lui donner son propre ID** au
moment de l'ouvrir (dernier ID pris : **#552**).

---

## 6. LE POINT DE CONVERGENCE — et c'est probablement la vraie décision

Cinq items butent aujourd'hui sur **la même chose manquante** :

- **#552** — sans les seuils de Grégoire, qu'est-ce qui décide qu'un élève a
  besoin d'une intervention intensive plutôt que d'un suivi ?
- **#551** — même question pour le dépistage du risque.
- **#535** — quelle intensité pour quelle cible ?
- **#549** — les consignes de cartouche cherchent le « seuil de maîtrise ».
- **Pas 3c-3 de #542** — l'option « un champ *ce niveau marque la maîtrise* sur
  l'échelle » y a été écartée, **pas sur le fond** : « elle ajoute un champ, un
  écran d'édition et une migration. C'est un chantier, pas un pas. »

⮕ **Ce chantier est peut-être ce chantier-là.** Un niveau de l'échelle porte
déjà `code`, `nom`, `min`, `max`, `valeurCalcul`, `couleur`, et depuis 1.103 une
étiquette SOLO facultative. Ce qui manque est **la marque de seuil** : quel
niveau, dans l'échelle de CET utilisateur, marque le passage à la maîtrise.

⚠ **À poser à Grégoire avant d'écrire une ligne** — c'est une décision
d'architecture, pas un pas de refactor. Voir §8.

---

## 7. LES PIÈGES DE CE CHANTIER

1. **`determinerCibleIntervention` est vivante, mais toute la famille
   `identifierPattern` des pratiques est MORTE.** Établi le 27 août : leur seul
   consommateur, `genererCarteCibleIntervention`, a été retiré (#551, `a78d8b67`).
   ⮕ **Ne pas « corriger » les cinq `identifierPattern` des pratiques** : elles
   n'atteignent aucun écran. Elles restent en place parce qu'elles font partie
   du contrat obligatoire `IPratique` (`pratique-registre.js`, `throw` si
   absentes), et que le câblage du système de pratiques n'est pas fini (#307).

2. **Vérifier les consommateurs AVANT de brancher ou de corriger.** Cinq
   fonctions ont été mesurées MORTES en deux jours sur ce périmètre. La liste
   des seuils trouvés au `grep` est plus longue que celle des seuils qui
   AGISSENT, et les deux ne demandent pas le même geste. Un site mort branché
   sur l'échelle de l'utilisateur, c'est du code mort rendu vivant.

3. **Le chantier ne peut pas être validé sur les données de Grégoire.** Ses
   bornes sont celles du code : l'ancien et le nouveau chemin donneront le même
   résultat chez lui. Toute preuve passe par une échelle fabriquée en test —
   **et jamais A/B/C/D**, dont le « D » collisionne avec IDME. Utiliser W/X/Y/Z.

4. **Le fichier de constat #552 doit être RÉÉCRIT, pas supprimé.** Ses attentes
   décrivent le comportement fautif actuel. Les deux cas qu'il monte restent
   exactement ceux qu'une correction doit départager : à la fin du chantier,
   l'élève à 60 % en français doit recevoir la même intensité que celui à 15 %,
   parce que leur difficulté en Structure est la même.

5. **Vitest se lance depuis `tests/`**, jamais de la racine.

---

## 8. CE QUI ATTEND UN VERDICT DE GRÉGOIRE

Une seule décision, et tout le chantier en découle.

> **D'où vient une cible d'intervention, si rien ne vient du code ?**

| | Option | Ce que ça suppose |
|---|---|---|
| **A** | **Dérivée du critère** — la cible reprend le nom du critère en défi, avec une forme neutre | Il faut une forme neutre qui ne soit pas un vocabulaire d'intervention. « Pratique guidée en X » n'en est pas une |
| **B** | **Saisie par l'enseignant** — un champ « intervention » par critère, ou par critère × niveau, dans la grille | Le plus fidèle à la règle. Un champ, un écran d'édition, une migration. Et un état vide au départ, qu'il faut savoir afficher |
| **C** | **Aucune cible — nommer la cause** — l'application dit ce qu'elle observe (« difficulté persistante en Structure, sous le niveau *nom du niveau* ») et s'arrête là | Cohérent avec tout ce que le lot 1 et le lot 3 de #542 ont fait : nommer plutôt que deviner. Retire une fonctionnalité que Grégoire utilise peut-être |

⮕ **Et la question qui la précède, si l'intensité RàI 1/2/3 doit survivre** :
qu'est-ce qui la décide, sans seuil en dur ? ⮕ C'est le §6 — **la marque de
seuil sur l'échelle**. Sans elle, aucune des trois options ne peut produire une
intensité ; elles ne produisent qu'un libellé.

---

## 9. ÉTAT AU MOMENT D'ÉCRIRE

| | |
|---|---|
| Branche | `main`, arbre propre, tout poussé (`f8582611`) |
| Version | **1.104.0**, build `0827-1245` — **aucun bump dû** : rien de code applicatif n'a changé depuis |
| Vitest | **3715/3715**, 350 fichiers |
| Playwright | **193/193**, baseline à zéro, verdict vert enregistré au SHA `588debf1` |
| Fait aujourd'hui | Lot 3 de #542 refermé (8 pas) · #550 · #551 pas 1 (retrait de la carte morte) · 1.104.0 · #552 créé et prouvé |

---

## 10. CE QUE LE CHANTIER A DONNÉ — 27 août 2026, fin de journée

**Décision de Grégoire** : rebrancher sur le niveau SOLO configuré du critère et sur l'IPB ×
direction. Les options A / B / C du §8 sont devenues sans objet — voir pourquoi ci-dessous.

### 10.1 Deux mesures faites avant d'écrire, qui ont déplacé le §8

1. **`determinerCibleIntervention` n'alimentait PAS l'écran d'accompagnement.** Le §2.1 de cette
   consigne l'affirmait ; l'appel existait bien, mais son résultat n'y servait qu'à remplir
   `badgeClasse` et `badgeLabel` — **assignés quatre fois, jamais lus**. Le badge RàI rendu vient de
   `niveauRai`, donc de `determinerNiveauRaiPedagogique`.
2. **Le seul appelant vivant, `tableau-bord-apercu.js`, n'en lit que `.pattern`** — et tous les
   chemins de retour rendaient `pattern: M`, calculé AVANT les résolveurs.

⮕ **Aucun libellé de cible n'atteignait un écran.** La question « d'où vient une cible » portait donc
sur une chaîne que personne n'affichait. Ce qu'il fallait refonder, c'était le **calcul de
l'intensité** — et sa source non arbitraire existait déjà, à côté, vivante :
`diagnostiquerSuiviApprentissage` (IPB × direction, la table du skill `depistage-rai`).

### 10.2 Ce qui a été livré

Les quatre résolveurs, `I`, les six seuils et le vocabulaire d'intervention sont retirés.
L'intensité vient de l'IPB × direction ; la cause est **nommée** — « Difficulté persistante —
Structure (multistructurel) » —, le nom venant de la grille de l'utilisateur et le niveau SOLO du
champ qu'il a configuré. `diagnostiquerForcesChallenges` fait désormais remonter `niveauSOLO`, qu'elle
jetait. `francaisMoyen` et `NOM_CRITERE_LANGUE` sont retirés de `profil-etudiant-calculs.js`.
La table SOLO est dédupliquée dans `libelleNiveauSOLO`, consommée aussi par `interventions.js`.

L'exclusion `c.nom !== 'Français'` de la carte « Observation de la structure » est retirée
(§2.3, dernier site #537) : **c'est le seul changement visible à l'écran de tout le chantier**,
et c'est celui que Grégoire avait assumé au §2.4.

### 10.3 Ce qui en sort, et qui n'était pas dans cette consigne

| Item | Sujet |
|---|---|
| **#553** | Le rabotage de clé `startsWith('francais')`, 8 sites (§5 — ID pris) |
| **#554** | La branche « Décrochage » n'est jamais atteinte : `statutDecrochage` n'est pas passé |
| **#555** | Le seuil de défi (0,70 par défaut, replis divergents 0,70/0,75) et la marque de maîtrise (§6) |

⚠ Le §6 se resserre : il ne manque pas une marque de maîtrise pour **produire** une intensité —
l'IPB × direction en produit une — il en manque une pour **fonder le seuil de défi**.
