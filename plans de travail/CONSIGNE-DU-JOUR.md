# Consigne du jour

> **Réécrite le 2 septembre 2026 à 11 h 20 (heure de Drummondville), par Cowork.**
> Elle remplace la version de 10 h 54, dont le frein est LEVÉ (voir ci-dessous).
>
> ⚠ **Si tu lis ceci plus de quelques heures après cette heure-là, ou si `HEAD` a
> bougé, NE L'EXÉCUTE PAS telle quelle** : remesure d'abord, et dis à Grégoire ce
> qui a changé (règle 1 de `PROTOCOLE.md`).

## ✅ LE FREIN DE 10 H 54 EST LEVÉ — remesure du 2 septembre à 11 h

La version précédente disait « ce n'est PAS le mandat d'aujourd'hui, arrête ».
**Grégoire a choisi ce mandat à 11 h, en connaissance du compte de la matinée.**
La séance du matin est close ; celle-ci en est une nouvelle.

**État du dépôt, remesuré à 11 h (règle 1, chaque chiffre porte sa commande) :**

- `cat version.json` rend `{"build":"0902-1006","beta":"1.109.2"}`.
- `git rev-list --count origin/main..HEAD` rend **0** — **tout est poussé**, la
  release 1.109.2 comprise. La consigne de 10 h 54 annonçait « UN commit non
  poussé » : c'est périmé, il est parti.
- `HEAD` = `b2683bd3` (10 h 45), contre `5a5229a1` quand la consigne fut écrite.
  ⮕ **Les deux commits intercalaires sont `docs:` seulement** (`78864564`,
  `b2683bd3`). **Aucun fichier de `js/` n'a bougé** : toutes les mesures de
  lignes et de fichiers ci-dessous tiennent. Rejoue-les quand même — c'est la règle.

## Le mandat — FINIR L'ÉNONCÉ 4, en deux gestes

L'énoncé, dans les mots de Grégoire : *« Aucun élève ne reçoit un PDF où son
critère est rebaptisé "français". Aucun enseignant ne lit dans son interface le
SRPNF, l'EUF, le CAF ou la littérature s'il n'en fait pas. »*
**La première phrase est faite** (1.108.0). **La seconde tient dans les deux
gestes ci-dessous, et elle seule empêche l'énoncé 4 d'être vert.**

⮕ **Les deux gestes vont ensemble dans une seule livraison**, à la fin de la
séance, que Grégoire regarde avant que ça parte.

---

## GESTE 1 — plus aucun nom de personne dans le code

**Décision de Grégoire, 2 septembre 2026, en deux temps : « on retire absolument
tout nom de collègue », puis, après mesure : « on retire TOUS les noms. »**

Le motif est le sien et il tient en une phrase : ce code est servi au navigateur de
tout le monde. Un nom gravé dedans est un nom publié, par quelqu'un d'autre que son
porteur, sans qu'on le lui ait demandé.

⚠ **La mesure a trouvé plus large que la fiche #690** : ce n'est pas trois entrées,
c'est **trois familles de natures différentes**. ↻ **Corrigé le 2 septembre à 11 h :
les trois sont gratuites.** J'avais annoncé qu'une ne le serait pas ; je m'appuyais
sur un commentaire du code que je n'avais pas remesuré, et il était périmé. La
mesure est dans la famille 2. **Aucune écriture dans les données de personne n'est
nécessaire nulle part dans ce lot.**

---

### FAMILLE 1 — les pratiques offertes à l'adoption · À FAIRE

`js/pratiques/pratiques-predefines.js`. Mesuré le 2 septembre à 10 h 40, à rejouer :

```bash
grep -nE "id: 'pan-[a-z-]+'|^const PRATIQUE_|discipline: '" js/pratiques/pratiques-predefines.js
```

**Quatre identifiants et leurs constantes portent un prénom** :
`pan-standards-bruno` (l. 22-23), `pan-specifications-fah` (l. 264),
`pan-objectifs-ponderes-michel` (l. 474-475), `pan-jugement-global-isabelle`
(l. 701-702), plus leurs entrées dans le tableau d'export (l. 811-816).

**Et au moins six entrées déclarent une matière** dans un champ `discipline:` :
Chimie (l. 28, 269), Littérature (l. 163, 365), Mathématiques – Calcul différentiel
(l. 480), Philosophie 101 (l. 599), Biologie – Anatomie et physiologie 3 (l. 707).

⮕ **Traite les deux d'un coup : c'est le même fichier et la même décision.**
· Les identifiants et les noms de constantes : un nom qui décrit la PRATIQUE, pas la
  personne (`pan-standards-cinq-niveaux`, par exemple — tranche toi-même et dis-le).
· Le champ `discipline:` : la valeur devient `'Général'`, comme les cinq modèles
  neutralisés hier. Si l'origine informe vraiment, elle passe dans la `description`,
  sans nommer personne.

⚠⚠ **CE MODULE EST VIVANT** : chargé par `index.html`, lu par `js/bibliotheque-ui.js`
et `js/pratiques/pratique-configurable.js`. Ces pratiques sont **offertes à
l'adoption**, contrairement au matériel mort retiré hier.
⮕ **MESURE D'ABORD ce que devient la copie de quelqu'un qui en a adopté une.**
Si la fusion à la lecture saute le prédéfini quand l'utilisateur porte déjà son id
(le patron de `pratiques-bibliotheque.js`), renommer fait réapparaître le prédéfini
À CÔTÉ de sa copie. Ce n'est pas grave — mais **dis-le dans ton état mesuré**, et
n'écris rien dans sa base pour l'éviter.

---

### FAMILLE 2 — les huit identifiants d'échelles · À FAIRE, et c'est GRATUIT

`js/main.js:139-143` (`window.IDS_GABARITS_HARDCODES`) et
`js/echelles-bibliotheque.js:161` (la sonde `_sonderEchellesDisciplinaires`).

`ECHELLE_BRUNO_CHIMIE` · `ECHELLE_XAVIER_INFO` · `ECHELLE_ISABELLE_BIO` ·
`ECHELLE_HELENE_PHILO` · `ECHELLE_MARIEHELENE_LITT` · `ECHELLE_ETIENNE_ADMIN` ·
`ECHELLE_OLIVIER_GEO` · `ECHELLE_JORDAN_PHILO`

⚠⚠ **LE COMMENTAIRE DU CODE MENT, ET IL A FAILLI FAIRE RENONCER À CE LOT.**
`js/echelles-bibliotheque.js:136-140` affirme que ces identifiants doivent rester,
« sinon quelqu'un qui supprime son échelle "Chimie" la verrait revenir au prochain
import ». **C'est faux depuis le retrait du semis, le 1er septembre.** Ce
commentaire a survécu au changement qui l'a périmé.

**La mesure, faite depuis Cowork le 2 septembre à 11 h — rejoue-la :**

```bash
grep -rn "estRessourceSupprimee" js/ --include=*.js
grep -rn "estRessourceSupprimee\|ressourcesSupprimees" js/import-export.js js/codex.js js/partage-section.js
grep -rn "ECHELLE_BRUNO_CHIMIE\|ECHELLE_XAVIER_INFO\|ECHELLE_JORDAN_PHILO" js/ --include=*.js
```

▣ Le tombstone a **cinq lecteurs, et aucun ne concerne ces huit échelles** :
`echelles.js:581` ne regarde que `ECHELLE_IDME_DEPART` · `grilles.js:1497` que
`GRILLE_GENERIQUE` · `cartouches.js:170` que `CART_GENERIQUE` ·
`gabarits-utils.js:390` que les `GABARIT_*`.
▣ **Le chemin d'import ne consulte pas le tombstone du tout** — la deuxième
commande rend **zéro**. Témoin du périmètre : la première en rend cinq.
▣ **Plus aucun code ne sème ces échelles** — la troisième ne rend rien hors de la
liste et de la sonde.

⮕ **Conclusion : ces huit identifiants sont INERTES.** Leur seul effet aujourd'hui
est d'écrire, à la suppression, une marque que personne ne relit. **Les retirer ne
coûte rien : pas de migration, pas d'écriture dans les données de personne.**

**Ce que tu fais :**

1. Retire les huit de `IDS_GABARITS_HARDCODES` (`js/main.js`). ⚠ **Ne touche pas
   aux cinq autres entrées** — `ECHELLE_GENERIQUE`, `GRILLE_GENERIQUE`,
   `CART_GENERIQUE`, `ECHELLE_IDME_DEPART` et les `GABARIT_*` sont vivantes et
   gardées par des sentinelles.
2. Retire-les de la sonde `_sonderEchellesDisciplinaires`
   (`js/echelles-bibliotheque.js:161`). ⚠ **Mesure d'abord si la sonde sert encore
   à quelque chose sans eux** : c'était son sujet entier. Si elle devient vide de
   sens, propose de la retirer — ne la laisse pas en coquille.
3. **CORRIGE LE COMMENTAIRE PÉRIMÉ** de `js/echelles-bibliotheque.js:136-140`, dans
   le MÊME commit. C'est lui qui a failli faire renoncer au lot ; le laisser en
   place ferait renoncer la prochaine session.

⛔ **LA SENTINELLE VA ROUGIR, ET SA PRÉMISSE EST L'AFFIRMATION PÉRIMÉE.**
`tests/unit/sentinelle-464-cles-nues.test.js`, cas **D** : *« les identifiants
restent dans IDS_GABARITS_HARDCODES : une suppression doit rester durable »*.
⮕ **Réoriente-la, ne la désarme pas.** Ce qu'elle doit garder désormais : *les
identifiants dont un semis dépend encore restent dans la liste* — c'est-à-dire les
cinq vivantes, nommément. Break-teste : retirer `ECHELLE_IDME_DEPART` doit la faire
rougir, retirer `ECHELLE_BRUNO_CHIMIE` ne doit plus rien changer.
⚠ Vérifie aussi `sentinelle-468-boutons-qui-mentent` (l. 683) et
`sentinelle-echelle-idme-de-depart` (cas E), qui lisent la même liste.

⚠ **Ce que ça NE règle pas, et qu'il faut dire** : les copies de ces huit échelles
vivent toujours dans la base des utilisateurs qui les ont reçues avant le
1er septembre — c'est `bibliothequeEchelles`, ce sont **leurs** données, et elles
restent muettes. Ce n'est pas ce lot, c'est **#674**.

---

### FAMILLE 3 — les commentaires · À FAIRE, sauf un cas

Mesuré, à rejouer :

```bash
grep -rniE "bruno|michel|isabelle|xavier|helene|hélène|etienne|étienne|olivier|jordan|francois|françois|V." js/ tests/ scripts/ --include=*.js
```

**Ce qui part** : les mentions qui servent d'étiquette de circonstance —
« Bug Bruno » (`js/grilles.js:1032` et `:4577`), « cours François »
(`js/pratiques/pratique-pan-specifications.js:58`), « Ex: Bruno »
(`js/pratiques/pratique-configurable.js:569`), « (François) »
(`js/pratiques.js:1871`), « Ex: 'pan-standards-bruno' »
(`js/pratiques/pratique-manager.js:37`), et les crédits de retour terrain
(« FIX, retour Jean-François » — `js/main.js:222`, `js/saisie-presences.js:871`
et `:1866`). Remplace par ce que le commentaire dit vraiment : la date, le
symptôme, le numéro de fiche.

⚠ **LE CAS À NE PAS TRAITER SEUL.** Deux mentions ne sont pas des étiquettes, ce
sont des **attributions d'idée** : « l'algorithme propose, le jugement tranche —
Voisard » (`js/pratiques/pratique-pan-standards.js:35`,
`js/pratiques/denotation-saisie-ui.js:8`).

⮕ **Si cette formule vient d'une source PUBLIÉE** (un texte, une communication), la
bonne correction n'est pas de l'effacer : c'est de la citer en règle — auteur,
œuvre, année — ou de reformuler l'idée sans la citation. Effacer une attribution
n'est pas de la protection, c'est de l'effacement.
⮕ **Si elle vient d'une remarque de collègue jamais publiée**, elle part.

**Tu ne peux pas trancher ça : DEMANDE-LE À GRÉGOIRE**, en lui montrant les deux
lignes exactes. C'est une question d'honnêteté intellectuelle, pas de code.

---

---

## GESTE 2 — le service d'aide cesse d'être servi à qui n'en a pas *(#539)*

**Mesuré le 2 septembre à 11 h 15, à rejouer :**

```bash
grep -n "CAF\|Services adaptés\|Centre d'aide" js/pratiques/pratique-sommative.js
sed -n '600,700p' js/pratiques/pratique-sommative.js
```

Trois chaînes, dans le plan de rattrapage du niveau 3 de la RàI :

| l. | Aujourd'hui |
|---|---|
| 642 | `'Référence aux services de soutien (SA, CAF, etc.)'` |
| 648 | `'Services adaptés (SA)'` |
| 649 | `'Centre d\'aide (CAF)'` |

⚠ **Le CAF n'existe plus** : le Centre d'aide en français du collège de Grégoire
est devenu « Passerelle + ». Et surtout, **un enseignant dont l'établissement n'a
ni CAF ni services adaptés lit ces trois lignes quand même.**

### ↻ TRANCHÉ PAR GRÉGOIRE, le 2 septembre à 11 h — les mots exacts

Il a validé les trois remplacements, puis le registre après mesure. **Ne les
réinvente pas, ne les « améliore » pas :**

| Aujourd'hui | Devient |
|---|---|
| `Référence aux services de soutien (SA, CAF, etc.)` | `Référence aux services de soutien du collège` |
| `Services adaptés (SA)` | `Services adaptés du collège` |
| `Centre d'aide (CAF)` | `Centre d'aide du collège` |

⮕ **Pourquoi « du » et pas « de ton »** : la mesure de l'entourage a départagé.
Les vingt et quelques autres étiquettes de cette liste (`sed -n '600,700p'`)
**n'adressent personne** — « Rencontre individuelle pour identifier les
obstacles », « Mentorat par les pairs ». Ce sont des étiquettes nominales, pas des
phrases. `de ton collège` aurait été la seule ligne à parler à quelqu'un.
Grégoire avait d'abord validé `de ton`, puis tranché `du` **une fois la mesure
sous les yeux**. ⚠ **C'est le registre de la liste qui commande** : si tu
découvres que la liste tutoie ailleurs, ne tranche pas seul — dis-le.

### ⚠⚠ LE « PATRON PROPRE » PORTE LUI-MÊME LE DÉFAUT — mesuré à 11 h 30

**La consigne de 11 h 20 désignait `js/evaluation-projection.js` comme le patron
sain à réutiliser. C'est faux, et c'est une trouvaille de vérification.** Ce fichier
porte « en français » à **trois endroits vivants**. Mesure, à rejouer :

```bash
grep -rn "en français" js/evaluation-projection.js js/pratiques/pratique-sommative.js
```

⮕ **Témoin du périmètre** : la commande rend **cinq** lignes, dont **deux sont des
commentaires** (l. 67 et 588) qui décrivent la transition CAF → Passerelle +. Elles
restent — elles expliquent le pourquoi. **Trois sont du texte servi :**

| l. | Qui le lit | Aujourd'hui |
|---|---|---|
| **163** | **L'ÉLÈVE** | `'au service d\'aide en français de ton collège : ' + JETON_SERVICE + '.'` |
| 211 | L'enseignant, écran de réglages | `libelle: 'Nom du service d\'aide en français'` |
| 213 | Qui n'a rien réglé | `defaut: 'Centre d\'aide en français (CAF)'` |

### ↻ LES TROIS, TRANCHÉES PAR GRÉGOIRE le 2 septembre à 11 h 30

**l. 163 — la phrase de l'élève. Il l'a tranchée lui-même, c'est sa prose :**
⮕ **Retirer « en français », et rien d'autre.**
`'au service d'aide de ton collège : ' + JETON_SERVICE + '.'`
Sans nom réglé, elle se rend donc : *« … au service d'aide de ton collège. »*

⚠ **NE TOUCHE À RIEN D'AUTRE DANS CETTE PHRASE.** Le commentaire des l. **145-150**
porte une contrainte que le code ne peut pas deviner : **la préposition voyage avec
le nom.** « t'inscrire AU Centre d'aide » se dit ; « t'inscrire AU Passerelle + » ne
se dit pas. C'est pour ça que le gabarit neuf passe par un **deux-points**, qui
n'impose aucun genre. Le deux-points reste.

⚠ **Et le tutoiement de la l. 163 RESTE.** Ce n'est pas une incohérence avec le
« du collège » du geste 2 ci-dessus : cette phrase-là parle à l'ÉLÈVE, les
étiquettes de `pratique-sommative.js` parlent à l'ENSEIGNANT, dans une liste qui
n'adresse personne. **Deux registres, deux publics, mesurés séparément.** Si tu es
tenté d'« harmoniser » les deux, ne le fais pas : dis-le.

**l. 211 — le libellé du réglage** : perd « en français ».
⮕ `libelle: 'Nom du service d'aide'`

**l. 213 — le défaut servi à qui n'a rien réglé** :
⮕ `defaut: 'Centre d'aide du collège'`
· Son texte d'aide **garde** la phrase *« Laisser vide pour ne recommander aucun
  service »* — c'est elle qui couvre l'établissement qui n'a rien.

### ⚠ CE QUE LA MESURE A ENCORE TROUVÉ, ET QUI CHANGE LE COMPTE

`js/evaluation-projection.js:598` — `gabaritNeuf()` initialise déjà
`nomServiceAide: ''`, **vide**. Autrement dit : le `defaut` de la l. 213 n'est PAS
ce que reçoit un gabarit neuf ; c'est le repli du formulaire de réglages.
⮕ **MESURE QUI VOIT QUOI AVANT DE PLANIFIER** — quel chemin sert la l. 213 à un
utilisateur réel, et lequel sert la 598. Le commentaire de la l. 588 dit que le
gabarit de MIGRATION, lui, porte le CAF. **Ne suppose pas : `grep` les deux
appelants et dis ce que tu as trouvé.** C'est une mesure, pas une question.

### Les deux ressources de la pratique sommative deviennent réglables aussi

⮕ **Réutilise le patron `nomServiceAide` / `lienServiceAide`** pour les deux
ressources du geste 2 ci-dessus, avec les défauts que Grégoire a arrêtés :
`'Centre d'aide du collège'` et `'Services adaptés du collège'`.

⚠⚠ **TARIR N'EST PAS RÉPARER, et ici le stock existe.** Un enseignant qui a déjà
réglé son `nomServiceAide` porte sa valeur en base : **changer le défaut ne la
touche pas, et c'est voulu.** Ne va rien réécrire chez personne. ⮕ **Dis-le dans
ton état mesuré**, avec le compte de ce qui reste : source tarie, stock intact.

⚠ **Chez Grégoire, un geste à lui, pas à toi** : il écrira **`Passerelle +`**
(majuscule, espace, plus) dans son propre réglage. **Ne l'écris pas dans le code,
ne l'écris pas dans ses données.** C'est un réglage d'utilisateur, il le pose lui-même.

### Le reste du mot « français », et ce qui n'est PAS dans ce lot

⛔ **Les identifiants de champs du volet confidentiel** portent encore le mot, et
ils ne sont **pas** dans ce lot : ce sont des clés de données, pas des libellés
lus. C'est `#440` résiduel. **Inscris et continue** (issue 2 de `CLAUDE.md`).

## Les tests

`grep -rn` les mêmes noms dans `tests/` : au moins huit fichiers en portent, dont
`sentinelle-attribution-cc-defaut-342`, `sentinelle-inspirede-auteur-457` et
`seeds-demo-labo-codex-296`.

⚠ Certains **testent précisément le défaut d'attribution** (#342 : une pratique de
littérature de Grégoire s'affichait « par Bruno V. »). Un test qui vérifie
qu'un nom ne s'affiche PAS a besoin de ce nom pour le vérifier. **Ne les casse pas
par un remplacement aveugle** : distingue le test qui UTILISE le nom comme donnée
d'un test qui le porte par habitude.

⮕ **Ajoute une sentinelle neuve** : *aucun identifiant, aucune constante et aucun
libellé du code applicatif ne contient de prénom.* Break-teste-la en réintroduisant
un des noms retirés — elle doit rougir.

## Le pack de démonstration

⛔ **N'y touche pas.** `js/pack-demo-20.js` et `js/demo-namespace.js` portent des
noms d'élèves fictifs, choisis exprès (#351, figures historiques et culturelles).
Ce sont des données de démonstration assumées, pas des noms de personnes réelles.

## Fini quand — les deux gestes, avec leur témoin

**Geste 1** : la commande de la famille 3 ne rend plus, dans `js/` hors pack de
démonstration, que des mentions que Grégoire a explicitement décidé de garder.
Et `grep -n "discipline: '"` sur `pratiques-predefines.js` ne rend plus que
`'Général'`.

**Geste 2** : `grep -rn "CAF\|(SA)\|en français" js/pratiques/pratique-sommative.js
js/evaluation-projection.js` ne rend plus rien qu'un utilisateur ou un élève puisse
LIRE — ni libellé, ni valeur par défaut, ni texte d'aide, ni palier.
⮕ **Témoin obligatoire** : la commande ne doit PAS rendre zéro. Les deux
commentaires de `evaluation-projection.js` (l. 67 et 588) qui expliquent la
transition CAF → Passerelle + **restent**, et ce sont eux qui prouvent que la
commande mesure encore quelque chose. Un zéro ici voudrait dire que tu as effacé
l'explication avec le défaut.

**L'énoncé lui-même, qui est la vraie cible** : un enseignant qui n'enseigne pas le
français, et dont l'établissement n'a ni CAF ni services adaptés, ne rencontre
**aucun** de ces quatre mots dans son interface — sauf s'il les a écrits lui-même.

⚠ **Publie le compte AVANT et APRÈS, avec son témoin** — un motif qui rend zéro
partout ne mesure rien. Le pack de démonstration est un bon témoin : il doit rester
non-zéro. **Rappel de ce matin** : un « fini quand » qui cherche un MOT se trompe de
cible ; il faut chercher une OFFRE. Le mot « Chimie » est un défaut dans un libellé
et une donnée officielle dans un code de programme du ministère.

## L'ordre

Règle 6 : **tu committes, puis tu t'arrêtes.** Pas de verdict, pas de push. Tu dis
ce qui est prêt et ce que Grégoire doit aller voir. Il regarde, puis il décide.

⮕ **Ce qu'il devra aller voir, nomme-le en français, jamais par un numéro :**
· Conception › Pratiques › « Partir d'un modèle » — **aucune des pratiques offertes
  ne doit afficher une matière** (ni Chimie, ni Littérature, ni Maths, ni Philo,
  ni Bio). Seules SES propres pratiques peuvent en porter une.
· L'écran de réglages de la pratique sommative — **le nom du service d'aide doit
  être un champ qu'il peut remplir**, avec « Centre d'aide du collège » comme
  valeur de départ. C'est là qu'il écrira « Passerelle + » lui-même.
Bump du bloc de jetons d'`index.html`. `cd tests && npm run test:unit`, pas `npm test`.
Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 11 h 27 → midi · release **1.110.0**

**Toutes les mesures de la consigne ont été rejouées et confirmées** (HEAD
`b2683bd3`, `origin/main..HEAD` = 0, `version.json` = `0902-1006` / `1.109.2`).
La consigne avait 7 minutes ; rien n'avait bougé.

## Ce que la remesure a trouvé de PLUS, et qui change le compte

1. **`js/pratiques/pratiques-predefines.js` n'est PAS le catalogue que lit
   l'écran « Partir d'un modèle ».** Cet écran passe par
   `obtenirOptionsModeles()` (`wizard-pratique-v2.js:1062`) →
   `obtenirToutesLesPratiquesBibliothequeSync()` → **`MODELES_PRATIQUES_PREDEFINIS`**
   (`js/pratiques-bibliotheque.js:26`), qui est **déjà propre depuis #687** : cinq
   modèles, tous `discipline: 'Général'`, tous « Gabarit / Demo Labo Codex ».
   ⮕ `window.PRATIQUES_PREDEFINES` n'a que **deux** lecteurs, tous deux dans
   `pratique-manager.js` : `initialiserPratiquesPredefines()` (l. 281) — **aucun
   appelant dans tout le dépôt** — et un `Object.keys()` (l. 159) qui compare des
   **noms de constantes** à des `p.id` : **il ne matche jamais**.
   ⮕ **Réponse à la question posée par la consigne** (« que devient la copie de
   quelqu'un qui en a adopté une ») : **personne n'a pu en adopter une par ce
   chemin.** Le patron de fusion `if (!idsExistants.has(gabarit.id))` existe bien,
   mais il opère sur l'AUTRE catalogue. Renommer est donc sans effet observable —
   et c'est ce qui le rend gratuit. Le bug de `Object.keys` : **inscrit, continué**.
2. **Un cinquième identifiant à prénom, et un sixième en initiales**, non listés :
   `sommative-remplacement-jordan` (l. 594) et `sommative-traditionnelle-mhl`
   (l. 158). Traités avec les autres.
3. **Le champ `etablissement:`** nommait des collèges réels (Laurendeau,
   Valleyfield, Champlain Lennoxville, Drummond). Combiné à `discipline:` et à
   « jugement professionnel de l'enseignante requis », il **désigne une personne
   aussi sûrement qu'un prénom**. Neutralisé à `'Cégep'` — décidé, et dit ici.
4. **`gabaritNeuf()` n'a aucun appelant applicatif** (seulement son export et le
   test #668). Le `defaut` de la l. 213 est donc **le seul chemin qui serve un
   utilisateur réel** — via `normaliser()`, appelé par `grilles.js` (5 sites).
   C'était la mesure demandée. **Inscrit, continué.**
5. **Les trois chaînes de `pratique-sommative.js` ne sont lues par personne
   aujourd'hui** : leur unique consommateur, `genererCarteCibleIntervention`, est
   mort depuis #551. ⮕ **Les mots de Grégoire sont posés quand même** (gratuit,
   tarit la source si le câblage #307 reprend). ⛔ **Mais la machinerie de réglage
   n'a PAS été construite** pour ces deux ressources : `PratiqueSommative` n'a
   AUCUN système de paramètres (`grep -c parametres` rend **0**), il aurait fallu
   en inventer un pour une méthode qu'aucun écran n'atteint. **Inscrit, continué.**
6. **Le commentaire de `evaluation-projection.js:588` était périmé par mon propre
   changement** — il exigeait que le défaut reste « CAF ». Corrigé dans le même
   commit, comme le commentaire de `echelles-bibliotheque.js:136-140`.
7. **Le golden de la sentinelle #668 HÉRITAIT tacitement de ce défaut.** Il déclare
   désormais le nom d'alors ; **ses vingt chaînes n'ont pas bougé d'un caractère**.

## Le compte, avec ses témoins

| Mesure | Avant | Après |
|---|---|---|
| Noms de personnes, `js/` hors pack démo | **86** | **5** |
| …dont identifiant, constante ou libellé | plusieurs | **0** |
| `grep "CAF\|(SA)\|en français"` sur les 2 fichiers | **9** | **3** ⮕ *les trois commentaires qui expliquent la transition — le témoin exigé* |
| `discipline:` de `pratiques-predefines.js` | 7 valeurs, 6 matières | **`'Général'` seul** |
| `etablissement:` | 4 collèges réels | **`'Cégep'` seul** |
| Vitest | 435 f. / 4701 t. | **436 f. / 4710 t., code 0** |

⚠ **Le pack de démonstration n'est PAS un bon témoin pour ce motif-ci** : il rend
**zéro**, parce que ses vingt élèves fictifs sont des figures historiques (#351),
pas les collègues visés. La sentinelle neuve porte donc **deux témoins mesurés** à
la place : le balayage lit >100 fichiers et >1 Mo, et le motif reconnaît la ligne
de contrôle `id: 'pan-standards-bruno'` sans rougir sur sa version neuve.

**Les 5 restants dans `js/`, et pourquoi** : deux sont l'attribution « Voisard »
(en attente de la référence, voir ci-dessous) ; deux nomment un fichier SUPPRIMÉ
(`config-francois-chimie.js`, verrouillé par la sentinelle #687) ; la cinquième est
`js/config.js` (**zone protégée**, fiches d'élèves fictives).
Dans `tests/` et `scripts/`, ce qui reste porte le nom comme **donnée mesurée** :
#342 (le repli fautif EST « Bruno V. », et `scripts/audit-attribution-cc.mjs:52`
le porte en constante pour le détecter), #296, #687, #464 et la sentinelle #690
elle-même, qui doit nommer ce qu'elle empêche de revenir.

## Break-tests joués

· `pan-standards-bruno` réintroduit → **rouge** · une `discipline` → **rouge** ·
un `etablissement` → **rouge** · « en français » dans le libellé → **rouge** ·
dans le défaut → **rouge** · `ECHELLE_IDME_DEPART` retiré de la liste → **rouge** ·
`ECHELLE_BRUNO_CHIMIE` retiré (déjà parti) → **ne change rien**, résultat attendu ·
`ECHELLE_BRUNO_CHIMIE` réintroduit → **rouge**.

## ⚠ Ce qui reste dû, et qui n'appartient qu'à Grégoire

**La référence de l'attribution.** Il a répondu que « l'algorithme propose, le
jugement tranche — Voisard » vient d'une **source publiée**. **La référence exacte
(auteur, œuvre, année) n'a pas été donnée** : les deux lignes
(`pratique-pan-standards.js:35`, `denotation-saisie-ui.js:8`) sont **laissées
intactes** d'ici là. Effacer une attribution n'est pas de la protection.

## Ce qu'il doit aller voir, avant que ça parte

· **Conception › Pratiques › « Partir d'un modèle »** — aucune pratique offerte
  n'affiche de matière. ⚠ Mesuré : cet écran était **déjà** propre depuis #687 ;
  le travail d'aujourd'hui portait sur un catalogue que rien n'affiche.
· **L'écran de réglages de la pratique sommative** — « Nom du service d'aide » est
  un champ à remplir, valeur de départ « Centre d'aide du collège ». **C'est là
  qu'il écrira « Passerelle + » lui-même** ; ce n'est écrit ni dans le code, ni
  dans ses données.

⛔ **Rien n'a été écrit dans les données de personne.** Source tarie, stock intact :
un `nomServiceAide` déjà réglé garde sa valeur ; les copies des huit échelles et
des pratiques adoptées restent telles quelles. C'est **#674**.

**Non poussé** (règle 6). Committé, arrêté, en attente de son regard.

---

# ADDENDUM — tranché par Grégoire le 2 septembre à 12 h 30

> **À exécuter AVANT le push de 1.110.0.** C'est le dernier point ouvert du lot que tu
> viens de commiter, et il est minuscule : deux lignes de commentaire.

## Les deux attributions « — Voisard » : l'idée reste, le nom part

**La question posée à Grégoire était : source publiée ou remarque de collègue ?**
⮕ **Sa réponse, le 2 septembre à 12 h 30** : c'est une **paraphrase** tirée d'une chronique
Substack — *« mais je ne sais pas laquelle »*.

**Le raisonnement, pour qu'une session future ne le refasse pas :**
· Ce n'est **pas une citation** : un appareil de référence porte auteur, titre, date, et
  permet au lecteur d'aller voir. « — Voisard » ne permet rien.
· Et c'est une **paraphrase** : la formulation « l'algorithme propose, le jugement tranche »
  est vraisemblablement celle de Grégoire, pour l'idée d'un autre. Il n'y a pas de phrase
  empruntée à créditer.
· Une attribution que personne ne peut vérifier **publie un nom sans servir le lecteur** —
  exactement le motif du lot.
⮕ **Donc : le principe reste écrit en toutes lettres, le nom part.**

**Les deux lignes, et leur remplacement exact :**

`js/pratiques/denotation-saisie-ui.js` (l. 7-8) :
```
 *  - suggestion statistique en ANCRAGE (« l'algorithme propose, le jugement tranche »
 *    — Voisard), modifiable, jamais imposée ;
```
⮕ devient :
```
 *  - suggestion statistique en ANCRAGE (« l'algorithme propose, le jugement tranche »),
 *    modifiable, jamais imposée ;
```

`js/pratiques/pratique-pan-standards.js` (l. 35-36) :
```
 *    (« l'algorithme propose, le jugement tranche » — Voisard), jamais comme valeur
 *    finale du calcul.
```
⮕ devient :
```
 *    (« l'algorithme propose, le jugement tranche »), jamais comme valeur
 *    finale du calcul.
```

⛔ **NE TOUCHE À RIEN D'AUTRE DANS CES DEUX BLOCS.** Le principe qu'ils décrivent — la
suggestion statistique est un ANCRAGE modifiable, jamais la valeur finale — est une position
pédagogique de Grégoire, pas une tournure à améliorer.

## Ce que ça fait au compte, et le témoin

`grep -rniE "bruno|michel|isabelle|xavier|hélène|helene|etienne|étienne|olivier|jordan|françois|francois|V." js/ --include=*.js | grep -viE "pack-demo|demo-namespace"`

⮕ **Passe de 5 à 3.** Et les trois qui restent doivent rester — **c'est le témoin** :
· `js/profil-etudiant-sections-affichage.js:1764-1765` — deux lignes qui EXPLIQUENT un
  retrait (`testerPratiqueFrancois`, `config-francois-chimie.js`, partis avec #687). Les
  effacer effacerait la trace de ce qui a été fait.
· `js/config.js:250` — « Olivier Dubois », fiche fictive, **zone protégée**.
⚠ **Un zéro ici serait un défaut, pas un succès.**

## Une décision technique qui est à toi — tranche et dis-le

La sentinelle du lot garde les identifiants, les constantes, les libellés, `discipline:` et
`etablissement:`. **Elle ne garde pas les commentaires** — c'est pourquoi les deux lignes
Voisard ont survécu au lot sans la faire rougir, et c'était voulu : elles attendaient une
décision de Grégoire.
⮕ Maintenant qu'elle est prise : **faut-il étendre la sentinelle aux commentaires ?**
⚠ Le piège est nommé d'avance : les trois mentions qui RESTENT sont, elles aussi, dans des
commentaires. Une garde qui interdit les prénoms en commentaire ferait rougir la trace même
de ce qu'on vient de retirer. **Si tu l'étends, elle doit distinguer une étiquette de
circonstance d'une explication de retrait — et si tu ne vois pas comment le faire sans
fragilité, ne l'étends pas, et écris pourquoi.**

## L'ordre

Petit lot, même règle : **tu commites, puis tu t'arrêtes.** Bump du bloc de jetons
d'`index.html`, `cd tests && npm run test:unit`. Ce fichier se commite avec.
⮕ **Ce que Grégoire doit aller voir : rien à l'écran.** Ce sont deux commentaires ; aucun
utilisateur ne les rencontre. **Dis-le-lui plutôt que de lui inventer une vérification.**
⮕ Ensuite, le push de 1.110.0 (ou 1.110.1) lui revient.
