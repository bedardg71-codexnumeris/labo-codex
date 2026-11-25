# Rapport : le jeu de tampons « Opérations » et le « Je regarde » du parcours 9 (25 novembre 2026)

> Claude Code, **session du nuage** (pas le Mac). Branche `lot/parcours-9-tampons`, partie de
> `lot/tampons-observation-3-production` à `677a8a1f`. Consigne : Cowork, relais du 25 nov., 18 h 05 (conversation du
> parcours 9) ; décisions de Grégoire du 25 nov., 17 h 07 à 17 h 56. **Rien n'est en ligne** : aucune fusion, aucun
> bump, aucune ligne de Nouvelles, rien dans `main`. Les pièces d'essai du lot 3 ne sont pas touchées.
> **Commit** : @@COMMIT@@. **Aperçu** : @@APERCU@@.

**Fait.** La catégorie fournie `action` s'appelle « Opérations » et porte six tampons, avec les dessins et les phrases de Grégoire : Identification, Relation, Déduction (identifiants gardés), Interprétation, Comparaison, Induction (neufs). Incertain, Incomplet et Inexact passent sous « Observations », inchangés. Dans la démo seulement, « Opérations » est une catégorie d'observation : l'écran « Observer » y montre les six tampons. Au parcours 9, « Je regarde », « Remplir » touche « Identification » à la bulle 5 ; les bulles 5 et 6 portent les mots acceptés à 17 h 55 et 17 h 56.

**Mesuré.** @@SUITES@@ Les six dessins se dessinent dans la fenêtre « Tampons et rétroactions », la palette d'Annoter, l'écran « Observer », sur une copie et par la fonction qui dessine le PDF exporté (pixels comptés, § 4). Aucun rendu n'est sorti vide : je n'ai corrigé aucun rendu. La note de Marmotte Pétillante ne bouge pas (69 % au tableau, 68,8 % au profil : le banc du parcours les lit toujours).

**⚠ Trois choses que la mesure a fait paraître et que la consigne ne tranchait pas** (§ 2, toutes inscrites) :
1. **#1315 : l'espace qui a déjà enregistré la fenêtre des tampons ne reçoit PAS « Opérations ».** « Enregistrer » range tous les noms et toutes les phrases affichés, renommés ou non. Un tel espace garde « Action », « Repérage », « Liaison », « Ouverture » et ses anciennes phrases, sur les dessins neufs. C'est probablement le cas de l'espace de Grégoire (inférence : je n'ai pas son fichier). **Tranché par Grégoire le 25 nov. à 18 h 45 : laisser tel quel pour la version de ce soir.**
2. **#1316 : dans la palette d'Annoter, « Opérations » ne paraît que si la préférence « Observation des actions » est allumée** ; elle est éteinte par défaut. Le jeu est fourni à tout le monde dans la fenêtre des tampons et sur « Observer », pas dans la palette.
3. **#1317 : le profil « Gestes cognitifs », son graphique, le glossaire et l'export de recherche reposent sur Repérage / Liaison / Ouverture.** Non touchés : c'est une réécriture, et de la pédagogie.

**Supposé.** § 3. **Pas vérifié.** WebKit (absent du conteneur), Safari, l'iPad ; les données réelles de Grégoire ; un PDF exporté ouvert dans un lecteur (j'ai compté les pixels de la fonction qui y dessine, je n'ai pas ouvert de fichier PDF) ; le mode sombre de la fenêtre des tampons et de la palette (captures en clair seulement).

---

## 1. Ce qui change, fichier par fichier

| Fichier | Changement |
|---|---|
| `js/travaux-outils.js` | `AUTOCOLLANTS` : les trois tampons renommés (nom, image), les trois neufs (`action-interpretation`, `action-comparaison`, `action-induction`), les trois manques déplacés sous `observations`, à la suite. `RETROACTIONS_OBSERVATIONS_DEFAUT` : les six phrases. `NOMS_CATEGORIES_DEFAUT.action` : « Opérations ». `obtenirCategoriesObservation` : la lecture de la démo (§ 3, B). `_enregistrerCategoriesObservation` : sortie d'`enregistrerRetroObservations`, avec la garde de la démo. `ouvrirEditionRetroObservations` : une phrase jamais rangée se lit dans le jeu fourni (§ 3, A4). |
| `autocollants/operations/` | Les six SVG, tels que fournis, et `LICENCE.txt` (Grégoire Bédard, CC BY-NC-SA 4.0). |
| `js/parcours-cibles.js` | Bulle 5 : trois paragraphes après « Remplir », qui touche le tampon de la saisie (a). `SAISIE_A` : le texte raccourci de (a) et son tampon, posés par-dessus l'histoire du pack (§ 3, C). Bulle 6 : « une trace à lire ». |
| `js/pack-demo-10.js` | **Non touché** (§ 3, C). |
| `index.html` | Jetons anti-cache : `travaux-outils.js` `20261123w` → `x` ; `parcours-cibles.js` `20261122c` → `20261123b`. |
| `plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md` | Bulles 5 et 6 : les mots acceptés le 25 nov. (la sentinelle du parcours confronte le code à ce fichier). |
| `BACKLOG.md` | #1315, #1316, #1317. |
| Bancs | § 4. |

Les anciens fichiers d'image `icons8-check-mark.svg`, `icons8-verified-account.svg` et `icons8-approval.svg` ne sont plus cités par aucun code (`grep -rn "icons8-check-mark\|icons8-verified-account\|icons8-approval.svg" js index.html` : rien ; témoin : `icons8-help.svg` rend une ligne). **Je les ai laissés dans `autocollants/`** : un jeu de tampons exporté avant le lot peut-il les citer par nom de fichier ? Je ne l'ai pas mesuré.

## 2. Les trois trouvailles, et ce que chacune change pour Grégoire

### #1315 : le stock : l'espace qui a déjà enregistré la fenêtre des tampons

La consigne disait (lu par Cowork, pas essayé) : le jeu fourni est une base, les réglages de chacun se posent par-dessus par identifiant. **C'est exact, et c'est ce qui produit le problème.** `enregistrerRetroObservations` range, à chaque « Enregistrer » :
- `personnalisationObservations[id].nom` pour CHAQUE tampon affiché ;
- `nomsCategoriesTampons[cat]` pour CHAQUE catégorie affichée ;
- `retroactionsObservations[id]` pour CHAQUE phrase affichée.

Un espace qui a enregistré une seule fois, pour quoi que ce soit, porte donc « Repérage », « Action » et l'ancienne phrase comme des choix. Mesuré (sentinelle neuve, cas (f)) : après le lot, il garde ces noms et ces phrases, reçoit le dessin neuf sous l'ancien nom (l'image fournie n'est jamais rangée) et reçoit les trois tampons neufs avec leur phrase.

Ce que cela veut dire pour le cas (b) de la consigne : « garde SON nom, SON image et SA phrase » est vrai pour le nom et la phrase, et pour l'image **seulement s'il avait importé la sienne**. Celui qui a renommé « Repérage » en gardant l'image fournie verra son nom sur le dessin d'« Identification ».

**Décision de Grégoire (25 nov., 18 h 45, relayée par Cowork) : laisser tel quel pour la version de ce soir.** Ne rien réparer, ne rien écrire dans le stock, ne pas changer la lecture des noms rangés. Pour lui, Repérage, Liaison et Ouverture sont les mêmes gestes qu'Identification, Relation et Déduction, mieux nommés : ce que j'appelle plus bas un glissement de sens n'en est pas un à ses yeux. Ce qui suit est ce que j'avais écrit avant sa réponse.

Je n'ai rien réparé : rien ne distingue un nom rangé d'office d'un nom choisi, et écrire chez quelqu'un remonte à Grégoire. Trois voies sont écrites à #1315. **Celle qui tente le plus a un coût qu'il faut voir** : lire comme « non choisi » un nom rangé identique à l'ancien nom fourni donnerait « Opérations » à tout le monde sans rien écrire, mais ses copies déjà tamponnées « Ouverture » (transférer, généraliser) se liraient « Déduction » (appliquer une idée générale à un cas), y compris dans ce que ses étudiant·es relisent. Les identifiants gardés font que ce glissement de sens existe déjà pour tout espace qui n'a jamais enregistré la fenêtre.

### #1316 : la palette d'Annoter

Mesuré dans un espace neuf (banc au navigateur, essai de la palette) : aucune tuile d'« Opérations » tant que la préférence « Observation des actions » (Labo) n'est pas allumée. Les trois manques, eux, sont maintenant visibles sans elle, sous « Observations ». La capture `palette-annoter-*` est prise préférence allumée.

### #1317 : le profil « Gestes cognitifs » et ce qui l'entoure

Inventaire au § 5. Les comptes ne changent pas. Ce qui devient incohérent : les libellés, les trois tampons neufs comptés nulle part, les deux familles (« gestes cognitifs », « gestes en difficulté ») qui ne sont plus les catégories.

## 3. Ce que j'ai tranché, et ce que j'ai supposé

**A. Le jeu fourni**
1. Identifiants neufs : ceux que la consigne suggérait.
2. Les trois manques sont placés À LA SUITE des treize tampons d'« Observations » (un espace qui a rangé son ordre les reçoit aussi à la suite : cas (g)).
3. Les dessins vivent dans `autocollants/operations/`, sous des noms sans accent.
4. **Au-delà de la consigne, dans mon lot** : la fenêtre des tampons lisait `phrases rangées[id] || ''`. Pour un espace qui avait déjà rangé ses phrases, les trois tampons neufs auraient montré un champ vide, et « Enregistrer » aurait rangé ce vide : l'étudiant·e n'aurait rien lu. La fenêtre lit maintenant la phrase fournie quand la clé n'a jamais été rangée, comme le faisait déjà ce que l'étudiant·e lit (`observationsDesTampons`). Une phrase vidée exprès reste vide. Cela vaut pour tout tampon fourni, pas seulement les six.
5. Supposé : la catégorie d'un tampon fourni ne se change pas chez l'utilisateur (lu : l'ordre rangé d'une catégorie écarte un identifiant qui n'en est pas ; aucun réglage ne range une catégorie pour un tampon fourni). Le déplacement des trois manques vaut donc pour tout le monde, espace existant compris.
6. Conséquence lue, non mesurée à l'écran : la couleur. Un tampon posé sans teinte enregistrée prend la couleur de sa catégorie ; le PDF de synthèse donne aux familles `action` et `observations` deux couleurs par défaut différentes (`js/synthese-retroaction-data.js`, `FAMILY_COLOR`). Incertain, Incomplet, Inexact changent donc de couleur là où l'utilisateur n'a pas choisi de couleur.

**B. La démo**
1. « Opérations » y est d'observation **par lecture** : `obtenirCategoriesObservation` ajoute `action` quand la démo est ouverte. Rien n'est rangé, donc rien à défaire à la sortie et rien qui puisse fuir. J'ai écarté l'autre voie (ranger la clé à l'entrée, la remettre à la sortie) : `categoriesObservation` est une clé de l'utilisateur, commune à la démo et à son espace, et une remise qui rate écrirait chez lui.
2. Ce que cela coûte : dans la démo, la case « D'observation » d'« Opérations » se montre cochée et la décocher n'a pas d'effet. L'enregistrement de la fenêtre laisse cette entrée comme elle était rangée. Aucun mot n'est ajouté pour le dire.
3. Le jeu de tampons EXPORTÉ depuis la démo lit la liste rangée, pas cette lecture.
4. Supposé : « dans la démo » veut dire `demo-actif` à `'true'`. La démo qui survit à l'ouverture d'un codex (#1312) garde donc aussi cette lecture.
5. Une catégorie `action` que la personne a retirée de sa palette n'est pas offerte sur « Observer », même dans la démo : « Remplir » passe alors le tampon sans se bloquer, et la bulle 5 nomme un tampon qui n'est pas à l'écran. De même, dans un espace du cas #1315, le tampon s'appelle « Repérage » et la bulle dit « Identification ». Les réglages des tampons sont les mêmes dans la démo et hors d'elle : c'est antérieur au lot.

**C. Le parcours**
1. **Le pack de la démo n'est pas touché, contre mon premier jet.** J'avais écrit le texte raccourci et le tampon dans la saisie (a) du pack ; le crochet de push l'a refusé (sentinelle #825) : le pack est chargé sous le jeton du build et ne change qu'avec une release, que ce lot n'a pas le droit de faire. Les deux vivent donc dans `js/parcours-cibles.js` (`SAISIE_A`), que `histoire()` pose par-dessus la saisie (a) du pack. Conséquence : le pack garde l'ancien texte de (a) (« Relève bien les procédés ; … »), que plus rien ne pose. **À reporter dans le pack à la release de l'assemblage, puis retirer `SAISIE_A`** ; je ne peux pas le faire d'ici.
2. « Remplir » touche le bouton du tampon ; c'est l'application qui range sa copie dans l'inscription. Le banc lit cette copie dans la démo.

**D. La sentinelle du lot 1 des tampons** exigeait que le code des tampons d'observation ne nomme aucune catégorie fournie. La décision B la contredit à la lettre. Je l'ai modifiée pour admettre UNE constante, nommée une fois, dont chaque usage est sous la garde de la démo ; le reste de la règle tient.

## 4. Les preuves

@@PREUVES@@

### Les cas (a) à (e) de la consigne

`tests/unit/sentinelle-jeu-fourni-operations-2026-11-25.test.js` (28 essais), le vrai module sur un stock en mémoire ; chaque cas vérifie aussi que rien n'est écrit et que le stock est le même après qu'avant.

| Cas | Résultat |
|---|---|
| (a) espace neuf | « Opérations », six tampons dans l'ordre, nom, image, phrase ; les six SVG égaux à ceux de la consigne ; les trois manques sous « Observations » |
| (b) `action-reperage` renommé, avec son image et sa phrase | les trois sont gardés |
| (c) catégorie `action` renommée | son nom est gardé |
| (d) `action-incertain` déjà posé | existe, a son image, se lit sous « Observations » avec la même phrase ; au navigateur, il se dessine sur la copie et dans le PDF |
| (e) un « Interprétation » créé à la main sous `action` | **doublon** : deux tampons du même nom, deux identifiants. Rien n'est supprimé ni fusionné |
| (f) l'espace qui a enregistré la fenêtre | #1315 : anciens noms, anciennes phrases, dessins neufs |
| (g) un ordre rangé | les trois neufs à la suite ; les manques à la suite d'« Observations » |

### Au navigateur

`tests/integration/jeu-fourni-operations-2026-11-25.spec.js` (5 essais), l'application servie par HTTP sur un port local : en `file://`, un canevas où une image de tampon est dessinée ne se lit pas.
- La fenêtre d'un espace neuf : « Opérations », six rangées, noms, phrases, six images chargées ; ouvrir la fenêtre ne range rien.
- La palette : rien sans la préférence (#1316) ; avec elle, six tuiles, images chargées, 20 px au moins.
- Sur une copie : chacun des six tampons puis un manque ajoute des pixels au canevas d'annotation.
- Le PDF : par `dessinerAnnotationsSurCtx`, chacun des six dessins couvre plus de 1 900 pixels dans 100 × 100 (le cercle commun en couvre autant à lui seul), les six empreintes diffèrent, un tampon inconnu ne dessine rien (témoin).

### Le parcours 9 et la démo

`tests/integration/je-regarde-cibles-2026-11-23.spec.js`, aux deux formats : avant « Remplir », six tampons, aucun retenu, images chargées, chacun de 44 px au moins et dans l'écran, « Inscrire et passer au suivant » dans l'écran, aucun tampon sur le bouton, `categoriesObservation` absente des réglages. Après : « Identification » seul retenu ; la bulle ne recouvre ni le tampon touché ni le bouton, et se lit sans défiler. L'inscription (a) rangée porte la copie du tampon et le texte raccourci. Après l'inscription : le ✕ est dans l'écran et la bulle ne le cache pas.

**La bulle 5, à dire :** à 1180 × 820 comme à 820 × 1180, dans sa forme la plus haute, elle recouvre la colonne de droite des critères, dont le « Non respecté » de Plausibilité que son premier paragraphe décrit (`bulle-5-apres-remplir-*`). Elle ne cache ni le tampon touché ni le bouton désigné, et sa consigne se lit sans défiler. Je n'ai pas raccourci le texte. Autre effet du tampon en paysage : la rangée des tampons ajoute sa hauteur, et dès qu'un tampon est touché la ligne d'annonce pousse la fenêtre au-delà de 820 px : son titre « Observer » et le ✕ sortent par le haut (même capture). Ils reviennent après l'inscription (`bulle-5-apres-inscription-1180x820`).

### Mutations

@@MUTATIONS@@

### Ce qui était rouge avant moi

`tests/integration/tampons-observation-lot-1-regler.spec.js:451` (« cocher, écrire un critère, décocher, exporter, réimporter… ») dépasse 30 s sous Chromium dans ce conteneur, **au commit de départ `677a8a1f` aussi** (deux passages sur un arbre à part). Le rapport du lot 1 le dit vert sous WebKit et Chromium sur le Mac : c'est la lenteur du conteneur, pas le lot. Non touché.

## 5. Les autres endroits qui nomment « Action », « Repérage », « Liaison », « Ouverture »

Inventaire fait par un agent de lecture, sur `js/`, `index.html`, `design-system.html`, les bancs, `departs/` ; je n'ai pas relu chaque ligne moi-même. **Je n'ai aligné aucun nom hors de `js/travaux-outils.js`** : chaque mention trouvée appartient au même ensemble, dont le sens repose sur trois gestes et trois difficultés. Renommer trois libellés y laisserait « trois gestes » là où il y a six opérations.

| Où | Ce que c'est | Qui le lit |
|---|---|---|
| `index.html`, carte « Observation des actions » (vers 8757) | « Repérage, Liaison et Ouverture… Active la catégorie « Action » dans la palette », étiquette « palette « action » » | enseignant·e |
| `js/accompagnement-contenu-hover.js:133`, `:719` | infobulle de la préférence : « trois tampons (Repérage, Liaison, Ouverture) » | enseignant·e |
| `js/accompagnement-contenu-terme.js:371-403` | glossaire : ACO, RLO, Profil ACO, Engagement cognitif | enseignant·e |
| `js/profil-etudiant-diagnostics.js:159-458` | le bloc « Profil ACO », l'onglet « Gestes cognitifs », son tableau | enseignant·e |
| `js/graphiques-progression.js:3203-3394` | le graphique d'évolution, trois séries | enseignant·e |
| `js/actions-rlo.js` | le compte, par identifiant, en deux familles | personne |
| `js/trimestres.js:2332-2339`, `2514-2570` | l'export de recherche anonymisé : `gestes_cognitifs`, `gestes_en_difficulte`, `ratios_cognitifs` | chercheur·es |
| `js/synthese-retroaction-data.js:63-67` | la couleur par défaut d'une famille (§ 3, A6) | étudiant·e (PDF de synthèse) |
| `design-system.html:840`, `:864` | la même carte, en référence | personne |

Rien dans l'aide du guide (`docs/guide/03-glossaire.md`), ni dans les fichiers de `departs/`, ni dans la démo (le pack ne pose aucun tampon `action-*`). Ce que l'étudiant·e lit des tampons posés (rétroaction, PDF de synthèse) passe par `observationsDesTampons` et suit donc les noms et les phrases neufs sans autre changement.

## 6. La ligne de Nouvelles PROPOSÉE (à relire par Grégoire ; rien n'est écrit dans `js/changelog-data.js`)

> **Tampons : la catégorie « Action » devient « Opérations ».** Elle compte maintenant six tampons : Identification, Relation et Déduction remplacent Repérage, Liaison et Ouverture, et Interprétation, Comparaison et Induction s'ajoutent. Incertain, Incomplet et Inexact passent sous « Observations ». Rien n'est effacé : un nom ou une phrase que tu as donnés restent les tiens.

⚠ La dernière phrase est vraie. Mais, #1315 étant laissé tel quel ce soir, la première ne l'est pas pour qui a déjà enregistré la fenêtre des tampons : il garde « Action », « Repérage », « Liaison », « Ouverture ». Et tant que #1316 ne l'est pas, « Opérations » ne paraît dans la palette d'Annoter qu'avec la préférence « Observation des actions ».

## 7. Les gestes pour Grégoire, sur l'iPad

1. Dans Safari, dans un onglet ordinaire (pas de navigation privée), ouvre l'aperçu : @@APERCU@@
2. Touche « Explorer la démo ».
3. Ouvre le panneau des parcours, puis « Suivre ton groupe par cibles », « Je regarde ».
4. Avance jusqu'à la bulle 5, « Ce que tu vois ». **Tu dois voir**, sur l'écran « Observer », la rangée « Tampons d'observation » et six tampons.
5. Touche « Remplir ». **Tu dois voir** le premier tampon retenu (une coche) et, à côté de « Tampons d'observation », « Identification » ; la bulle, en trois paragraphes.
6. Touche « Inscrire et passer au suivant », puis ✕. À la bulle 6, **tu dois voir** ✎ dans la case de Marmotte Pétillante, et « une trace à lire » dans la bulle.
7. Hors de la démo (« Quitter la démo »), ouvre une copie dans Évaluation › Annoter, puis la roue de la palette « Tampons » : la fenêtre « Tampons et rétroactions ». Regarde « Opérations ».

⚠ Au geste 7, sur un espace où tu as déjà enregistré cette fenêtre, tu verras « Action », « Repérage », « Liaison », « Ouverture » sur les dessins neufs (#1315). Au geste 5, dans ce même espace, le tampon retenu s'appellera « Repérage » alors que la bulle dit « Identification ». Pour voir le jeu neuf tel quel : un espace où la fenêtre n'a jamais été enregistrée.

## 8. Ce que la session d'assemblage doit savoir

- **Fichiers de code touchés** : `js/travaux-outils.js`, `js/parcours-cibles.js`, `index.html` (deux jetons), `autocollants/operations/` (neuf).
- **Jetons anti-cache avancés dans `index.html`** : `js/travaux-outils.js?v=20261123x`, `js/parcours-cibles.js?v=20261123b`. `js/pack-demo-10.js` n'est pas modifié (§ 3, C) : aucun risque de pack périmé en cache. **À faire à la release** : reporter `SAISIE_A` dans la saisie (a) du pack et la retirer de `js/parcours-cibles.js`.
- **Conflits prévisibles** : `index.html` (les lignes des jetons, si une autre branche les avance aussi) ; `BACKLOG.md` (tête de « A faire » : #1315 à #1317 ici, à la suite de #1311 à #1314 de la branche des tampons) ; `js/travaux-outils.js` si le correctif de la copie exportée y touche (je ne connais pas ce correctif). La branche contient tout `lot/tampons-observation-3-production` jusqu'à `677a8a1f`, pièces d'essai comprises : elle doit venir APRÈS les tampons, et après le retrait des pièces d'essai par l'autre session (conflit possible sur `departs.html` et les fichiers d'essai, que je n'ai pas modifiés).
- **`tests/integration/harness/banc-copie-annotation.js`** : `ouvrirCopie(page, url)` accepte une adresse servie ; sans elle, rien ne change pour les autres bancs.
- **Verdict WebKit** : aucun. À prendre sur le Mac.
- **Tranché** : #1315, laisser tel quel ce soir (Grégoire, 18 h 45). **À relire par Grégoire** : la ligne de Nouvelles. **#1316 et #1317** : Cowork les lui soumet ; je n'y touche pas.

## 9. Trouvailles (trois issues)

| Trouvaille | Issue |
|---|---|
| L'espace qui a enregistré la fenêtre garde les anciens noms sur les dessins neufs | **Inscrit : #1315** |
| « Opérations » absente de la palette d'Annoter sans la préférence | **Inscrit : #1316** |
| Le profil « Gestes cognitifs » et ce qui l'entoure reposent sur l'ancien modèle | **Inscrit : #1317** |
| La fenêtre des tampons montrait vide la phrase d'un tampon fourni jamais rangée | **Corrigé** : c'est mon lot (les trois tampons neufs en dépendaient) |
| Le pack de la démo garde l'ancien texte de la saisie (a), que plus rien ne pose | **Dit ici** (§ 3, C) : à reporter à la release ; pas d'entrée au BACKLOG, c'est un geste de l'assemblage de ce soir |
| La bulle 5 recouvre la colonne « Non respecté » ; en paysage, le haut de l'écran « Observer » sort quand un tampon est touché | **Dit ici, avec capture** : la consigne demandait de le dire sans raccourcir |
| Les trois anciens fichiers d'image ne sont plus cités | **Laissés** (§ 1) : dit ici |
| L'essai `:451` du lot 1 dépasse 30 s sous Chromium dans le conteneur, avant le lot | **Commenté ici** : sans conséquence pour l'utilisateur |
| Les trois dessins Identification, Relation et Interprétation se ressemblent à 25 px (une flèche et un ou deux points dans un cercle) | **Dit ici** : ce sont les dessins de Grégoire, je n'y touche pas ; visible sur `palette-annoter-*` |

## 10. Les captures

Dans `plans de travail/captures-2026-11-25-parcours-9-tampons/` (Chromium, 1 px d'image pour 1 px CSS), à 1180 × 820 et 820 × 1180 :
- `bulle-5-avant-remplir-*-sombre.png` : la bulle 5 et l'écran « Observer » avec les six tampons ;
- `bulle-5-apres-remplir-*-sombre.png` : « Identification » retenu, la bulle en trois paragraphes ;
- `bulle-5-apres-inscription-*-sombre.png` : la personne suivante, le ✕ désigné ;
- `bulle-6-*-sombre.png` ;
- `fenetre-tampons-espace-neuf-*-clair.png` : « Tampons et rétroactions » d'un espace neuf ;
- `palette-annoter-*-clair.png` : la palette, préférence « Observation des actions » allumée ;
- `copie-six-tampons-et-un-manque-*-clair.png` : les six tampons et « Incertain » posés sur une copie.

Le parcours est pris dans le mode d'ouverture de l'application (sombre) ; la fenêtre, la palette et la copie en clair.
