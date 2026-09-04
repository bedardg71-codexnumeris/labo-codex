# Préparation d'une séance à froid — les trois types de grille, décrits dans les mêmes termes

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> ⛔ **CE N'EST NI UNE CONSIGNE NI UN CADRAGE.** C'est le matériel d'**une séance de décision**.
> Application au moment de l'écriture : **1.113.0**, build `0903-0906`.
>
> ▣ **Sa question, qui ouvre ce document** : *« Notre redéfinition des trois grilles — holistique,
> analytique, algorithmique — est-elle complète, actionnable, codable ? »*
> ⮕ **Réponse mesurée : non.** Cinq trous, dont un que ni lui ni Cowork n'avaient vu.
>
> ⚠ **REMESURE** avant d'en tirer quoi que ce soit (règle 1).
> ⛔ **Une seule décision principale par séance** (`PROTOCOLE.md`, règle 6, forme 5). **Ce
> document en contient cinq. Il se prend en plusieurs fois, à froid.**

---

## ⚠⚠ LE TROU PRINCIPAL — personne ne l'avait vu, et il commande les quatre autres

**Le type n'est pas une propriété de la GRILLE. C'est une propriété de CHAQUE CRITÈRE.**

```bash
grep -rn "grille\.type" js/  | wc -l    # → 0
grep -rn "critere\.type" js/ | wc -l    # → 17   (témoin : le motif trouve ce qui existe)
```

▣ **Et les grilles mélangent déjà les types.** Le pack de démonstration porte **13 critères
holistiques et 1 algorithmique** dans le même ensemble.

⮕ **Or on vient de définir trois modes qui produisent TROIS UNITÉS DIFFÉRENTES** — un niveau,
des points, une note calculée. **Personne n'a dit comment elles s'additionnent dans une seule
grille.**

⚠ **Aujourd'hui la question ne se pose pas** : holistique et analytique sont identiques (0 test
de comportement pour chacun), donc il n'y a que deux unités réelles, et l'algorithmique rend
déjà un pourcentage.
⛔ **Dès que l'analytique produira des points, elle se posera PARTOUT.**

⮕ **Ce document ne peut pas être tranché dans le désordre : la question A commande les quatre
suivantes.**

---

## ↻ CE QUE GRÉGOIRE A TRANCHÉ LE 3 SEPTEMBRE AU SOIR — et qui rétrécit tout le chantier

### La définition, dans ses mots
> **« La grille analytique est la plus traditionnelle de toutes. Il y a des critères, et
> l'enseignant associe des points à ces critères. Ensuite la grille fait le total, et c'est le
> total qui détermine s'il y a réussite ou non, avec le seuil de soixante pour cent. »**
>
> **« J'ai toujours trouvé que la grille analytique ressemblait à une facture : elle a ses
> items, une valeur pour chacun, et un total. »**

⮕ **CE QUE ÇA RETIRE DU CHANTIER, ET C'EST BEAUCOUP** : les **éléments observables ne sont plus
la définition du type**. Ils sont une **aide au jugement**, pas une structure. Les sections, les
occurrences répétées et les seuils indicatifs de sa grille de 2013 deviennent de l'agrément.
⛔ **L'analytique, c'est : des critères, des points, un total, un seuil. Rien d'autre.**

### ▣ DEUX MESURES QUI CONFORTENT CETTE DÉFINITION — rien n'est à inventer

- **Le seuil de réussite existe déjà** : `seuilReussite`, **32 occurrences**, réglable dans
  l'échelle (`js/echelles.js:864`). ⮕ **Paramétrable plutôt que figé à 60 %** — ce qui vaut
  mieux pour un établissement qui en aurait un autre.
- **La note se rend déjà en pourcentage** : `pctFinal`, borné, avec le niveau retrouvé par
  intervalle (`js/evaluation-calcul.js:137` — `pctFinal >= n.min && pctFinal <= n.max`).

⮕ **CONSÉQUENCE, confirmée par Grégoire** : **l'analytique n'est pas un nouveau moteur. C'est
une troisième façon d'arriver au même pourcentage.**
▣ L'algorithmique en produit déjà un · l'analytique en produit un naturellement (points ÷ total)
· l'holistique en produit un dès que son niveau porte une valeur — **et les échelles en portent
une, `valeurCalcul`.**

### ▣ POURQUOI LE POURCENTAGE EST LE DÉNOMINATEUR COMMUN — ce n'est pas un choix technique

▣ **Ses mots** : *« Le RREC — le Règlement sur le régime des études collégiales — contraint tous
les enseignants à remettre une note en pourcentage à la fin du trimestre. Mais comment cette
note est construite est libre à chacun. C'est ici que les différentes grilles ont leur rôle à
jouer. »*

⮕ **La contrainte est réglementaire, la liberté est pédagogique.** Les trois types ne sont pas
trois calculs concurrents : ce sont **trois chemins vers une obligation commune**. ⛔ **Aucun
texte d'interface ne doit en hiérarchiser un** (cf. skill `pratiques-notation` §2 bis : posture
pluraliste).

### ⚠⚠ UN ÉCART DE VOCABULAIRE AVEC LA LITTÉRATURE — DÉLIBÉRÉ, À NE PAS « CORRIGER »

▣ **Ses mots** : *« Bruno V. appelle ce type de grille "algorithmique", parce que c'est un
calcul qui établit la maîtrise ou non, et non le jugement de l'enseignant. Ici, nous apportons
une nuance importante : dans Labo Codex, la grille algorithmique est plutôt un moyen de décrire
le travail de l'élève par des processus automatisés. »*

| | ce que **V.** appelle « algorithmique » | ce que **Labo Codex** appelle « algorithmique » |
|---|---|---|
| **ce que c'est** | une grille où **le calcul établit la maîtrise**, à la place du jugement | un moyen de **décrire le travail** par des processus automatisés |
| **équivalent Labo Codex** | ⮕ **la grille ANALYTIQUE** | ⮕ le décompte d'erreurs, la projection, les énoncés engendrés |

⛔ **LES DEUX MOTS NE DÉSIGNENT PAS LA MÊME CHOSE, ET C'EST ASSUMÉ.** ⚠ **Une session future qui
lira V. "corrigera" ce vocabulaire en croyant réparer une erreur. C'est pour l'empêcher que
ce paragraphe existe.**
⮕ **Et ça éclaire un point resté ouvert** : les deux attributions « — Voisard » inscrites dans le
code (cf. `OU-EN-EST-ON.md`, « ce qui n'appartient qu'à Grégoire »). **L'idée vient bien d'un
auteur nommé** ; reste à savoir si elle est publiée, auquel cas elle se cite en règle.

---

## ↻ RÉPONSE À LA QUESTION A — 3 septembre, en fin d'après-midi

*Cette section répond à la question A posée plus bas. Elle a été écrite APRÈS, et elle la
remplace. Le §A est conservé pour son inventaire des coûts.*

### Ce que Grégoire a d'abord constaté

> **« Ça ne fait pas tellement de sens que ce soient les critères qui soient analytiques,
> holistiques ou algorithmiques. Je crois que c'est l'ensemble de la grille. Mais je ne vois pas
> comment une grille pourrait être mixte — si ce sont les critères, toutes les grilles sont
> mixtes. »**

⮕ **Son intuition est juste sur l'INTENTION** : un enseignant choisit **une** manière
d'évaluer, pas une par critère.

### ⚠ MAIS LE MIXTE EST SA PROPRE PRATIQUE — mesuré, pas supposé

▣ **Sa grille papier de 2013 le fait déjà** : **CONTENU /70** jugé d'une manière, **QUALITÉ DE
LA LANGUE /30** d'une autre, avec sa propre règle de conversion en marge.
▣ **Ses noms de grilles le disent** : il a nommé une grille **« G1 FR-ALGO *seul* A26 »**. ⮕ **Ce
mot n'a de sens que si, ailleurs, l'algorithmique n'est PAS seul.**
▣ **Le pack de démonstration aussi** : **13 critères holistiques + 1 algorithmique** dans le
même ensemble.

### ⛔⛔ ET LA CAUSE, QU'IL A NOMMÉE ENSUITE — ELLE CHANGE LE STATUT DU MIXTE

> **« Ma pratique alternative de notation est soumise à la politique de mon département. Tous
> les membres utilisent la pratique sommative traditionnelle, et la PDEA est claire là-dessus :
> je n'ai pas le choix de compter le français pour 20 % de la note. C'est analytique de ce
> côté. »**

▣ **L'hybridité n'est pas une hésitation. C'est la trace d'une CONTRAINTE INSTITUTIONNELLE dans
un outil pédagogique.** Sa pratique personnelle est ailleurs ; sa **politique départementale
d'évaluation des apprentissages** impose un pourcentage pour la langue.

⮕ **CONSÉQUENCE, ET ELLE EST DÉCISIVE POUR LA CONCEPTION** : au collégial, une PDEA qui impose
un pourcentage pour la langue est **courante**. ⛔ **Le mixte ne peut donc PAS être un quatrième
mode expérimental.** Pour une bonne part de ses collègues, **ce sera le cas courant dès leur
première grille.**

### ↻ LA FORME RETENUE

**La grille déclare son type — celui de la pratique de l'enseignant. Ce type est le DÉFAUT de
ses critères. Un critère peut DÉROGER quand une politique l'exige. La grille se dit alors
« mixte » — non pas parce qu'on l'a cochée, mais parce qu'elle l'est devenue.**

▣ **Ce que ça donne :**
- on choisit **un** type en créant la grille ⮕ l'intention de Grégoire est respectée ;
- l'écran n'oblige plus à redire le type critère par critère ⮕ la simplification qu'il cherchait ;
- **« mixte » devient un CONSTAT, pas une case à cocher** ⮕ c'est la règle tenue toute la
  journée : *l'écran annonce ce qui EST, pas ce qu'on a déclaré* ;
- **la dérogation a un nom et une cause** — « imposé par la politique départementale » — au lieu
  d'être un mélange qu'on subit sans savoir pourquoi.

⏳ **CE QUI RESTE OUVERT, et n'est PAS tranché :**
1. ↻ **TRANCHÉ, 3 septembre : PAS DE CHAMP DE JUSTIFICATION.** La dérogation est muette.
   ▣ **Ses mots** : *« Ma préoccupation première, c'est que l'utilisateur n'ait pas trop de
   formulaires à remplir quand il veut adopter Labo Codex. Il est seul face à sa pratique,
   personne ne lit sa configuration, les élèves reçoivent le résultat. Je ne crois pas qu'il soit
   nécessaire de motiver quoi que ce soit ici sur le plan pédagogique. »*

   ⮕ **ET LE PRINCIPE QUE ÇA ÉTABLIT, PLUS LARGE QUE CE CAS** : *numériser une pratique demande
   déjà beaucoup de réglages.* **Chaque champ ajouté est un coût d'adoption**, et un champ que
   personne ne lira jamais est un coût pur.
   ▣ **Le test à appliquer avant d'ajouter un champ, désormais** : *qui le lira ?* ⛔ **Si la
   réponse est « personne », il ne se fait pas.**
   ⚠ **À distinguer de ce qui a été livré aujourd'hui** : les fenêtres de suppression et la
   portée d'une note **s'adressent à quelqu'un** — l'enseignant au moment d'agir, l'élève sur son
   PDF. **Une justification de configuration ne s'adresse à personne.**
2. **Les grilles existantes.** ⛔ **Aucune ne porte de type de grille** — le champ n'existe pas
   (`grille.type` rend **0**). ⮕ **Que devient une grille d'aujourd'hui ?** Elle se déduit de ses
   critères, ou elle attend qu'on la classe ? ⚠ **À mesurer chez lui avant toute consigne.**
3. **Le §B ci-dessous reste entier** : les trois types ne sont toujours pas décrits sur les mêmes
   axes, et la colonne « ce que l'élève lit » est toujours vide.

---

## A · Le type appartient-il au critère, ou à la grille ?

▣ **Ce qui est mesuré** : au critère, et les grilles sont hétérogènes de fait.

**Trois issues, et leurs coûts :**

| issue | ce que ça donne | ce que ça coûte |
|---|---|---|
| **A1 — le type reste au critère** | un critère à points voisine un critère à niveaux dans la même grille | il faut **une règle de conversion** pour additionner. C'est le nœud. |
| **A2 — le type monte à la grille** | une grille est *tout* analytique, ou *tout* holistique | ⛔ **les grilles existantes de Grégoire seraient à reclasser** — ses données |
| **A3 — le type reste au critère, mais l'unité est imposée par la grille** | chaque critère garde sa méthode de jugement ; la grille dit en quoi ça se convertit | plus subtil à expliquer, mais **rien à reclasser** |

⮕ **Recommandation de Cowork : A3.** ▣ **Motif** : c'est la seule qui n'écrit rien dans ses
données et qui garde le mélange déjà présent dans le pack de démonstration. Et elle décrit ce
qui se passe réellement — *un enseignant juge un critère à sa manière, mais une copie n'a qu'une
note*. ⚠ **C'est une recommandation, pas une mesure.**

---

## ↻ RÉPONSE À LA QUESTION B — 3 septembre, en fin d'après-midi

*La colonne « ce que l'élève lit » était vide. Elle est remplie.*

### ▣ CE QUE LA SYNTHÈSE FAIT AUJOURD'HUI — mesuré

`js/synthese-retroaction-data.js`, section **F. CRITÈRES** : la synthèse ne connaît **qu'une**
distinction — `estAlgorithmique = def.type === 'algorithmique'` (l. 444). **Rien pour
holistique, rien pour analytique.**

| type | ce que l'élève lit |
|---|---|
| **holistique** | le nom du critère, son **niveau** dans l'échelle (avec sa couleur), sa pondération, et un **commentaire** — celui de la cartouche pour le couple critère/niveau, ou celui écrit à la main |
| **algorithmique** | la même chose, **plus** les données chiffrées (erreurs, mots, projection) et la phrase engendrée |
| **analytique** ↻ | ⮕ **LA NOTE CHIFFRÉE, ET RIEN D'AUTRE** |

▣ **Décision de Grégoire** : *« Dans la grille analytique, la seule chose que l'élève voit, c'est
la note chiffrée. L'enseignant pourrait éventuellement préparer une rétroaction personnalisée ou
activer une cartouche, mais dans la pratique générale, l'élève ne voit que la note chiffrée. »*

### ⚠ L'OBSTACLE QUI SEMBLAIT FERMER LA CARTOUCHE — et comment il tombe

▣ **Mesuré** : la cartouche est indexée par le couple **critère + NIVEAU** —
`cleCart = critereId && niveau ? critereId_niveau : null`. ⮕ **Un critère sans niveau ne forme
pas la clé, et le commentaire reste vide EN SILENCE.**

↻ **RÉSOLU PAR GRÉGOIRE, et le mécanisme existe déjà.** Ses mots :
> *« L'enseignant pourrait décider de plages de notes qui correspondent ni plus ni moins qu'à
> des niveaux auxquels sont associées des rétroactions précises. »* puis, sur la forme :
> **« Une pondération associée aux plages, et non des valeurs précises. 90 à 100 % =
> excellent, 80 à 90 % = très bon… Le pourcentage appliqué ensuite sur la note pondérée. Du
> moins, c'est déjà comme ça que fonctionnent les échelles. »**

▣ **Il a raison, et c'est mesuré** : un niveau d'échelle porte `min` et `max`, et le code
retrouve le niveau depuis un chiffre par intervalle — `pourcentage >= n.min && pourcentage <=
n.max` (cinq sites dans `js/evaluation-calcul.js`). ▣ **`js/echelles.js:3854` l'énonce comme une
règle du système** : *« note chiffrée → CODE »*.

### ▣▣ SA GRILLE DE 2013 LE DÉMONTRE — la mesure qui clôt la question

*Elle portait deux séries de seuils, pour deux maximums différents. Converties en pourcentage :*

| | passable | bien | très bien | excellent |
|---|---|---|---|---|
| **Contenu /70** | 42 → **60 %** | 49 → **70 %** | 56 → **80 %** | 63 → **90 %** |
| **Langue /30** | 18 → **60 %** | 22 → **73 %** | 25 → **83 %** | 27 → **90 %** |

⮕ **Deux séries de points qui n'ont rien à voir — et en pourcentage, PRATIQUEMENT LES MÊMES
BORNES.** Identiques aux extrémités, à trois points près au milieu.

▣ **Il ne fabriquait donc pas deux échelles.** Il appliquait **une seule échelle** à deux totaux
différents, et faisait la conversion à la main dans la marge.

⮕ **CONSÉQUENCE, ET ELLE FERME LA QUESTION DE L'ÉCHELLE PAR CRITÈRE** : **l'échelle reste celle
de la GRILLE.** Elle n'a pas besoin d'être propre au critère, **puisque le pourcentage rend tous
les critères comparables quel que soit leur maximum.**

### La chaîne complète de l'analytique

**Le critère produit des points → les points font un pourcentage → le pourcentage trouve son
niveau dans l'échelle de la grille → le niveau ouvre la cartouche.**

⮕ **L'élève voit le chiffre. La rétroaction précise s'attache derrière, si l'enseignant en veut
une.** ⛔ **Rien de tout cela n'est un nouveau moteur : chaque maillon existe.**

### ⛔ CE QUI EST RETIRÉ DE CE DOCUMENT

**Le §D — « combien de grilles portent déjà analytique » — est SANS OBJET.**
▣ **Mesuré par Grégoire dans son application, le 3 septembre** : *« Je n'ai aucune grille
analytique utilisée. »*
⮕ **Aucune donnée à protéger, aucun changement de comportement à annoncer.** ⚠ **Sa mesure vaut
pour LUI.** Des utilisateurs déjà en place pourraient en avoir : **le nombre n'est pas mesuré, et
il ne l'est jamais** (le trafic n'est pas compté).

---

## ↻ RÉPONSE À LA QUESTION C — la structure et l'écran, 3 septembre au soir

### ▣ L'ÉCRAN : c'est la palette d'évaluation existante, avec un champ chiffré

▣ **Grégoire l'a montré par une capture de l'écran actuel** — la palette **ÉVALUATION** qui
flotte à droite de la copie : un contrôle par critère (Structure, Rigueur, Plausibilité,
Nuance), puis en bas **« Note chiffrée · 45 % »** et **« Niveau · I »**.

> **Ses mots** : *« Quand on parle de grille analytique, on devrait avoir une palette semblable
> où se trouvent les critères et où l'enseignant indique un chiffre pour chacun. Le total est
> fait en bas de la palette. Il s'agit ni plus ni moins de reproduire la grille d'évaluation que
> l'enseignant remplit, et dont l'application applique le calcul final. »*

⮕ **RIEN À INVENTER DANS LA DISPOSITION.** Même palette, même place du total. **Seul le
contrôle de saisie change : un champ chiffré au lieu d'un menu de niveaux.**
▣ **Et le bas de la palette rend déjà les deux choses dont l'analytique a besoin** — la note
chiffrée ET le niveau déduit. **La chaîne points → pourcentage → niveau y est déjà affichée.**

### ▣ LA STRUCTURE : le maximum de points, c'est le POIDS

↻ **Tranché** : *« Oui, le maximum, c'est le poids. »*
⮕ **Il n'y a PAS deux champs à créer.** Un critère qui pèse 30 vaut 30 points, et sa saisie va
de 0 à 30. ▣ Sa grille de 2013 le faisait ainsi : Contenu **/70** + Langue **/30** = 100.

### ⏳ MAIS LE TOTAL N'EST PAS TOUJOURS 100 — inscrit, PAS dans le premier lot

▣ **Ses mots** : *« Dans mon cas, le total donne cent points, mais j'ai déjà vu des pratiques
dans lesquelles le total peut arriver à vingt-cinq ou cent trente, et le tout est ramené à cent
pour cent en bout de ligne. »*

⚠ **L'application impose déjà 100, et le dit par une couleur** :
`calculerTotalPonderationCriteres` (`js/grilles.js:1151`) rend le total **vert à 100, orange en
dessous, ROUGE au-dessus**. Le champ s'appelle **« Pond. (%) »**.
⮕ **Pour ces pratiques-là, un total de 130 n'est pas une erreur — et l'écran dit que c'en est
une.**

**Deux formes possibles :**

| | ce que ça donne | ce que ça coûte |
|---|---|---|
| **A — la pondération reste un pourcentage** | l'enseignant convertit ses poids avant de les saisir | c'est l'état actuel ; **ça n'a gêné personne, car personne n'a de grille analytique** |
| **B — la pondération devient un poids brut** | 24 sur un total de 130 vaut 18,5 % ; le rouge disparaît, le libellé « (%) » devient faux | ⛔ **touche le calcul de TOUTES les grilles, holistiques comprises — donc les notes existantes** |

↻ **DÉCISION** : **B est la bonne forme, mais PAS dans ce lot.**
⮕ **L'analytique naît en exigeant 100, comme le reste de l'application.** Libérer le total est
un chantier propre, à cadrer séparément. ▣ *Tarir n'est pas réparer* : il touche des notes déjà
remises.

---

## ⛔ LA POSTURE — ce document décrit UNE pratique, pas la norme

▣ **Ses mots, 3 septembre au soir** : *« Ce que je décris ici, c'est ma pratique. Dans les
dernières années et dans l'année courante, comment je suis passé du sommatif traditionnel à PAN.
Ce sera un point de départ. Dans la communauté de pratique du 14 septembre, il y aura des
enseignants de différentes disciplines, notamment en chimie et en philosophie. Probablement
qu'ils ont des grilles différentes des miennes. Nous verrons à partir de ce moment s'il est
possible de rendre les paramètres plus souples encore. »*

⛔ **CE QUE ÇA INTERDIT À TOUTE SESSION FUTURE** : traiter la grille de 2013, la chaîne
points → pourcentage → niveau → cartouche, ou les bornes 60/70/80/90 comme **la** manière de
faire. **C'est la sienne, et elle est bien documentée — ce qui la rend commode, pas normative.**

⮕ **Le 14 septembre devient une DATE DE MESURE, pas seulement une échéance.** Ce qui doit en
sortir : *où les paramètres actuels forcent un collègue de chimie ou de philosophie à plier sa
pratique.* ▣ **Chaque endroit trouvé est un assouplissement à cadrer, pas un défaut à corriger.**

⚠ **C'est la posture du skill `pratiques-notation` (§2 bis) appliquée aux grilles** : *aucune
famille n'est « la bonne », et aucun texte d'interface ne les hiérarchise.*

---

## B · Les trois types, décrits dans les mêmes termes

⛔ **Le cadrage de la grille analytique NE REDÉFINIT NI L'HOLISTIQUE NI L'ALGORITHMIQUE.** Il
définit l'analytique **par contraste**. Tant que les trois ne sont pas décrits sur les mêmes
axes, la définition tient dans une conversation, pas dans une spécification.

**La grille à remplir — quatre colonnes, trois lignes, et aucune case vide :**

| | l'échelle | ce que l'enseignant fait | ce que le critère produit | ce que l'élève lit |
|---|---|---|---|---|
| **Holistique** | une, globale à la grille | attribue **un niveau** au critère | un **niveau** | ? |
| **Analytique** | une **par critère**, en mots (les éléments observables) | accorde **des points**, informé par les observables | des **points** sur un maximum | ? |
| **Algorithmique** | aucune | **règle** un calcul, puis annote | une **note** calculée | ? |

⚠ **La quatrième colonne est vide, et ce n'est pas un oubli** : personne n'a dit ce que chaque
type produit dans le PDF de l'élève. ⮕ **C'est de la didactique. Elle appartient à Grégoire.**

---

## C · La structure de données d'un critère analytique

▣ **Ce qui existe, mesuré** (`js/grilles.js:4314`) — un sous-critère est :
```js
{ id, code, nom, ponderation: 1.0, retroaction }
```

⚠ **`ponderation` est un POIDS RELATIF, pas un maximum de points.** Sa grille de 2013 dit
« Sujet amené **/3** » et « Explication **/30** » : ce sont des **maximums**, et leur somme doit
tomber juste (70 + 30 = 100).

**Trois questions liées, à trancher ensemble :**
1. **Les éléments observables SONT-ils les sous-critères ?** ⚠ Les sous-critères servent déjà de
   **catégories de codes** au chemin algorithmique (`js/evaluation-calcul.js:438`). **Leur donner
   un second sens est une collision possible.** ▣ Grégoire a déjà tranché la même question pour
   les codes — *« les codes sont les sous-critères »*. **La réponse symétrique serait cohérente,
   mais elle n'est pas acquise.**
2. **Le poids EST-il le maximum**, ou un critère analytique porte-t-il les deux ?
3. **Les observables sont-ils cochés, ou seulement lus ?** ▣ Ses mots : *« Ce ne sont pas tant
   des éléments à cocher. C'est surtout d'avoir une ligne d'éléments observables. »* ⮕ **Lus.
   Mais alors qui saisit les points — l'enseignant, à la main ?**

---

## D · Ce que deviennent les grilles déjà marquées « analytique »

⛔ **CE POINT N'A PAS ÉTÉ MESURÉ, ET IL DOIT L'ÊTRE AVANT TOUTE CONSIGNE.**

▣ **Le fait** : le type `analytique` existe dans le menu depuis toujours et **ne fait rien**.
Une grille qui le porte se comporte comme une holistique. ⮕ **Lui donner le nouveau comportement
CHANGERAIT son écran d'évaluation, sans que personne l'ait demandé.**

⮕ **La mesure à faire, et Grégoire seul peut la faire** — ses grilles vivent dans son
navigateur, pas dans le dépôt : **combien de ses grilles réelles portent `type: 'analytique'` ?**

▣ *Tarir n'est pas réparer* : si des grilles en portent, **le changement doit être annoncé, ou
choisi.** ⛔ **Écrire dans ses données est exclu.**

---

## E · Ce qui n'est pas dans le périmètre, et qu'il faut nommer pour ne pas l'y laisser entrer

Sa grille de 2013 porte trois choses qu'**aucun** des trois types ne sait faire :

- **des sections** — INTRODUCTION · DÉVELOPPEMENT · CONCLUSION : un niveau **au-dessus** des
  critères. ⚠ Ajoute un étage à la structure de données.
- **le même critère répété par occurrence** — « Paragraphes 1 · 2 ». ⚠ Change le modèle de la
  saisie, pas seulement l'affichage.
- **des seuils indicatifs** — *42 passable, 49 bien, 56 très bien, 63 excellent*.

⮕ **Recommandation de Cowork : les trois HORS du premier lot.** ▣ **Motif** : chacun est un
chantier à lui seul, et l'analytique se tient debout sans eux — sa grille de 2013 resterait
lisible sans ses en-têtes de section. ⚠ **Mais les seuils sont peut-être les moins coûteux des
trois, et les plus proches du jugement. À peser.**

---

## Ce que cette séance doit produire

1. **Une réponse à A**, écrite. Elle commande tout le reste.
2. **La grille du §B remplie**, quatrième colonne comprise.
3. **Le compte du §D**, mesuré par Grégoire dans son application.
4. **Un « fini quand »** — en gestes d'utilisateur, pas en structure de données.

⛔ **Tant que ces quatre-là ne sont pas là, aucune consigne ne peut être écrite sans que la
session qui l'exécute tranche à la place de Grégoire.**

⚠ **Et une question qui n'est à personne d'autre que lui** : ce chantier vaut-il d'être fait
avant le 14 septembre ? ▣ **L'analytique est la pratique majoritaire de la profession** — dans
ses mots. C'est **le premier écran qu'un collègue d'une autre discipline rencontrera.** ⮕ Mais
il n'empêche aucun des huit énoncés, et ceux-là sont finis.
