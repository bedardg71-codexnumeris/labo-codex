# Plan – Tous les tampons dans la bibliothèque, aucun perdu sur une copie (2 novembre 2026)

> Claude Code, lundi 2 novembre 2026, matin, sur `main` = `2acef748`. Consigne : `CONSIGNE-LOT-2026-11-02-tampons-tous-dans-la-bibliotheque-mesure-et-plan.md`. Mesure : `RAPPORT-2026-11-02-tampons-mesure.md`. **Aucun code dans ce lot.** Cowork relit avant le premier lot ; ce qui remonte à Grégoire est au § 8.

## 0. En une phrase

Un tampon n'est plus jamais effacé : « retirer » le cache de la palette, la bibliothèque montre tout ce qui existe, et le verrouillage fige dans l'évaluation ce que la copie montrait.

## 1. Ce que la mesure impose (détail au rapport)

| Fait mesuré (WebKit et Chrome, identiques) | Conséquence pour le plan |
|---|---|
| Un intégré retiré reste peint sur la copie, son nom aussi ; **son texte revient au texte fourni** | L'enregistrement de la fenêtre doit garder les textes des tampons qu'elle ne montre pas |
| Un tampon créé supprimé reste peint **jusqu'au rechargement**, puis **disparaît de l'écran et du PDF** ; la rétroaction le range sous « Autres tampons », sans texte | Retirer un tampon créé ne doit plus effacer sa définition |
| Il reste de lui en base : nom et image ; **plus** sa catégorie ni son texte | Le stock se reconstruit en partie seulement (§ 5) |
| « Utiliser dans ma palette » sur un intégré gardé puis retiré : **il ne revient pas** (il reste masqué), et son `id` s'écrit dans `tamponsPersonnalises` | « Utiliser » doit démasquer |
| Une entrée de la bibliothèque ne garde pas le texte | La bibliothèque lit le catalogue au lieu de recopier |
| Une copie **verrouillée** suit le nouveau nom, la nouvelle image, le nouveau texte d'un tampon, et le nouveau nom d'un code ; l'évaluation n'enregistre aucune annotation | Le verrouillage doit figer (§ 4) |

## 2. Le modèle des données retenu

**Aucune clé nouvelle pour les tampons eux-mêmes.** Chaque donnée garde sa source unique (skill `integrite-globaux`) :

| Donnée | Source unique (inchangée) |
|---|---|
| Définition d'un intégré | le code (`AUTOCOLLANTS`, `js/travaux-outils.js`) |
| Définition d'un tampon créé (id, nom, catégorie) | `tamponsPersonnalises` |
| Nom repris, image | `personnalisationObservations[id]` |
| Texte | `retroactionsObservations[id]` |
| Tampon importé, pas encore utilisé | `bibliothequeTampons` |
| **Retiré de la palette** | `elementsMasques` — aujourd'hui pour les intégrés seuls, **étendu aux tampons créés** |

**Le catalogue** = les intégrés (sans les anciens `legacy` ni les jetons) + tous les tampons créés.
**La palette** = le catalogue moins `elementsMasques`.
**La bibliothèque** = le catalogue entier + les entrées de `bibliothequeTampons` dont l'`id` n'est pas au catalogue (les imports). Une entrée de `bibliothequeTampons` qui porte l'`id` d'un tampon du catalogue (un « Garder » d'avant) n'est plus lue : le catalogue fait foi. **Rien n'est réécrit** pour cela.

Les règles qui en découlent :
- **Retirer** un tampon de la palette (intégré ou créé) = ajouter son `id` à `elementsMasques`. Sa définition, son nom, son image, son texte et sa catégorie restent.
- **Utiliser dans ma palette** = retirer l'`id` de `elementsMasques` pour un tampon du catalogue ; pour un import, l'écrire dans `tamponsPersonnalises` (définition), `personnalisationObservations` (image, à la place de `tamponsImages`, que rien ne lit) et `retroactionsObservations` (texte, s'il en porte un).
- **Supprimer** n'existe plus pour un tampon du catalogue. Il reste pour un import jamais utilisé, qu'aucune copie ne porte (une fois utilisé, il entre au catalogue).
- **Les textes** des tampons que la fenêtre ne montre pas sont gardés à l'enregistrement (aujourd'hui l'objet est reconstruit à partir des seuls champs affichés).
- **Réinitialiser** et **importer des tampons** ne retirent plus aucune définition de tampon créé (aujourd'hui, les deux effacent ou remplacent `tamponsPersonnalises`, d'après lecture ; à mesurer au lot 1).

**Supposé** : les anciens tampons (`legacy`) et les jetons restent hors de la bibliothèque. Ils sont dans le code, ils se peignent sur les anciennes copies, la palette ne les offre pas : rien ne change pour eux.

## 3. Nouvel utilisateur, utilisateur existant (décision de Cowork)

Utilisateur existant : `elementsMasques` et `tamponsPersonnalises` sont lus tels quels. Sa palette ne change pas ; sa bibliothèque montre en plus tous les intégrés et tous ses tampons créés. Ses tampons d'hier y entrent sans écriture. Nouvel utilisateur : comme aujourd'hui, les intégrés dans sa palette, et aussi dans la bibliothèque.

## 4. Le verrouillage fige

**Où.** Dans l'objet évaluation (`evaluationsSauvegardees`), un champ `figeAuVerrouillage` :

```
{ date, tampons: { <id>: { nom, texte, categorie, nomCategorie, image } },
  codes:   { <type>: { numero, nom, couleur, texte } } }
```

Seulement pour les `id` et les codes présents sur la copie au moment du verrouillage. `image` : le nom du fichier pour un intégré non repris, la donnée de l'image sinon. Ordre de grandeur, mesuré sur la forme de l'export modèle : une image fait de 490 à 2 650 caractères (médiane 654) ; une copie à dix tampons distincts ajoute quelques Ko. L'évaluation voyage déjà par le codex et la Réserve : le figé voyage avec elle. C'est ce qui manque aujourd'hui à la Réserve, qui ne porte aucune clé de tampons.

**Quand.** À la porte unique du verrouillage (lot C, `verrouiller`), et seulement là. Une copie non verrouillée n'a pas de figé et suit les réglages actuels (décision du 24 sept.).

**Qui le lit.** Un seul résolveur dans `travaux-outils.js` : la définition d'un tampon ou d'un code = le figé de l'évaluation de la copie affichée si elle est verrouillée, sinon les réglages actuels. Les trois rendus y passent : l'écran (`getImageAutocollant`, nom, teinte), le PDF de l'élève (même chemin, et la page de synthèse) et la rétroaction (`observationsDesTampons`, codes). Le texte déjà enregistré dans `retroactionFinale` est figé de fait ; une régénération sur une copie verrouillée lit le figé.

**Les commentaires** vivent sur l'annotation, pas dans les réglages : ils ne bougent pas quand on change un tampon. Annoter une copie verrouillée passe par « Déverrouiller l'évaluation » (bouton du 24 oct.). Au lot 3, je mesure ce qui se passe au re-verrouillage (question 2, § 8).

## 5. Le stock (ce qui est déjà écrit chez les gens)

**Tarir n'est pas réparer** : les lots 1 à 3 tarissent la source ; ce qui suit touche le stock. Écrire dans les données de quelqu'un remonte à Grégoire : ici, on propose.

**a. Ses tampons d'hier, et ceux de tout le monde** (définitions présentes) : aucune écriture. La bibliothèque les lit (§ 2).

**b. Tampons créés supprimés avant la nouvelle version.** Il reste, pour chacun, son nom et son image (`personnalisationObservations`) ; plus sa catégorie ni son texte. Une réparation au premier chargement pourrait, pour chaque `id` posé sur une copie du poste, absent du catalogue mais présent dans `personnalisationObservations` : recréer sa définition dans `tamponsPersonnalises` (nom, catégorie « Retrouvés », proposée), retirée de la palette, sans texte. **Sans perte** : elle ajoute, n'efface rien, ne touche à aucune copie. **Si la définition manque entièrement** (ni nom ni image) : rien n'est écrit, la copie garde son tampon invisible comme aujourd'hui, le rapport de chargement le compte. Limite : elle ne voit que les trimestres présents sur le poste, pas ceux d'une Réserve fermée.

**c. Copies déjà verrouillées** : aucune n'a de figé, et elles montrent aujourd'hui les réglages actuels. Pour ses intégrés repris sous un autre sens (relevés dans l'export modèle, cité par la consigne), une copie annotée avant la reprise montre **déjà** le nouveau sens (mesuré sur le même schéma : nom, image et texte suivent). **Fait utile** : l'`id` d'un tampon posé porte l'instant de sa pose (`STK_` + l'heure en millisecondes, `js/travaux-annotation.js:1280`). On peut donc dater chaque tampon posé, sans rien deviner. Les options sont à la question 1 (§ 8).

## 6. Écrans touchés et leurs mots (à soumettre, pas à figer)

| Écran | Aujourd'hui | Proposé |
|---|---|---|
| Fenêtre des tampons, menu d'un tampon | « Supprimer » | « Retirer de ma palette » ; sous la liste : « Un tampon retiré reste dans ta bibliothèque et sur les copies où tu l'as posé. » |
| Bibliothèque, colonne de droite, phrase | « Les tampons que tu gardes pour les retrouver ou les partager. » | « Tous tes tampons : ceux fournis, ceux que tu as créés, ceux que tu as importés. » |
| Bibliothèque, passage | « Garder dans ma bibliothèque » | disparaît : tout y est déjà |
| Bibliothèque, tampon du catalogue | « Supprimer de ma bibliothèque » | retiré du menu ; reste pour un import non utilisé |
| Bibliothèque, ligne d'un tampon | « Intégré » | « Fourni » (ou « Intégré », si on garde le mot) ; « Retiré de ta palette » quand il l'est |
| Copie verrouillée (palette Évaluation, sous le verrou) | — | « Tampons et codes tels qu'au verrouillage, le 2 nov. » |
| Réinitialiser (confirmation) | « … Cette action est irréversible … » | à réécrire selon la question 4 |

## 7. Les lots

| Lot | Contenu | Touche le stock ? | Tests |
|---|---|---|---|
| **1. Tarir** | Les textes non affichés gardés à l'enregistrement ; retirer un tampon créé = le masquer ; réinitialiser et importer ne retirent plus de définition | Non | L'intégré retiré garde son texte ; le créé retiré reste peint après rechargement, avec son texte, à l'écran, au PDF (résolveur) et dans la rétroaction. Contre-épreuve : chaque essai rougit sur `main` d'aujourd'hui (mesuré au § 1) |
| **2. La bibliothèque lit le catalogue** | Catalogue + imports ; « Utiliser » démasque ; import utilisé écrit son image et son texte là où la palette les lit ; les mots du § 6 | Non (les anciennes entrées « gardées » ne sont plus lues, pas réécrites) | Les quatre gestes de la consigne ; un intégré gardé puis retiré revient par « Utiliser » ; un import utilisé garde son image après rechargement (#1166) |
| **3. Le verrouillage fige** | `figeAuVerrouillage` à la porte unique ; un résolveur, trois rendus | Non (n'écrit qu'au verrouillage) | Copie verrouillée : renommer, changer l'image et le texte d'un tampon, le nom et la couleur d'un code : rien ne bouge à l'écran, au PDF ni dans la rétroaction ; non verrouillée : tout suit. Codex aller-retour : le figé voyage |
| **4. Le stock** | Selon les réponses aux questions 1 et 3 | **Oui** | Banc construit sur la forme de l'export modèle (noms fictifs), avant et après ; un second chargement n'écrit rien de plus |

Ordre : le lot 1 d'abord, il arrête la perte dès la prochaine version. Les lots 1 à 3 peuvent partir sans réponse de Grégoire ; le lot 4, non.

## 8. Les questions pour Grégoire

1. **Tes copies déjà verrouillées, au premier chargement :**
   - A. Les figer avec ce qu'elles montrent aujourd'hui (les réglages actuels). Plus rien ne bouge ensuite ; le sens d'avant tes reprises n'est pas rendu.
   - B. Comme A, mais pour les tampons posés **avant une date que tu donnes**, figer le nom, l'image et le texte fournis (les valeurs d'origine sont dans le code). Rend le sens d'avant tes reprises d'intégrés. Ne rend pas une personnalisation d'avant cette date qui ne serait pas la valeur fournie.
   - C. Ne rien figer d'office : elles suivent les réglages jusqu'à ce que tu les déverrouilles puis reverrouilles.
   - Recommandation : **B**, si tu connais la date de tes reprises (« le 1er nov. sur l'iPad ») ; sinon A.
2. **Au re-verrouillage d'une copie** (après l'avoir déverrouillée pour ajouter un tampon) :
   - A. Garder ce qui était figé, et figer seulement ce qui est nouveau sur la copie. Ce que l'élève a reçu ne change pas.
   - B. Tout refiger avec les réglages du moment.
   - Recommandation : **A**.
3. **Les tampons créés que tu as supprimés avant cette version**, qui restent sur des copies sans définition : les remettre d'eux-mêmes dans ta bibliothèque, retirés de la palette, avec leur nom et leur image mais sans leur texte (perdu) ?
   - A. Oui, dans une catégorie « Retrouvés ».
   - B. Non, ils restent invisibles sur ces copies.
   - Recommandation : **A**.
4. **« Réinitialiser » les tampons**, maintenant qu'aucun tampon ne s'efface :
   - A. Remettre les intégrés dans la palette avec leurs noms et textes fournis, et retirer tes tampons créés de la palette (ils restent dans ta bibliothèque).
   - B. Retirer ce bouton.
   - Recommandation : **A**. Les copies non verrouillées qui portent un intégré repris reprendraient le sens fourni : c'est la règle des copies non verrouillées.
