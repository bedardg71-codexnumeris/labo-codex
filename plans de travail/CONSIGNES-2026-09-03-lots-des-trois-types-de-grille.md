# Consignes des trois lots — les types de grille

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> **Ce fichier est fait pour être lu par Claude Code**, un lot à la fois. Il porte le texte
> exécutable de chaque lot ; le **plan** en porte la séquence
> (`PLAN-2026-09-03-les-trois-types-de-grille.md`) et la **séance à froid** les motifs et les
> mots de Grégoire (`SEANCE-A-FROID-2026-09-03-les-trois-types-de-grille.md`). **Les trois se
> lisent ensemble.**
>
> ⛔ **UN LOT PAR SÉANCE**, et Grégoire regarde entre chacun (`PROTOCOLE.md`, règle 6, forme 4).
> **Ne prends pas deux lots parce qu'ils sont dans le même fichier.**

---

## ⚠ COMMENT LIRE LES MESURES DE CE FICHIER

**Le lot 1 porte des mesures datées**, relevées quand il a été écrit. **Les lots 2 et 3 n'en
portent pas** : ils portent les **questions à mesurer** et les **lignes à retrouver**.

**C'est délibéré.** Une mesure vieillit ; le lot 2 sera exécuté après le lot 1, donc après que le
code aura bougé. Un chiffre écrit ici aujourd'hui et lu dans trois jours serait un **souvenir
présenté comme une mesure** — la classe d'erreur que le protocole nomme en premier.

⮕ **RÈGLE 1, sans exception : remesure tout avant d'écrire une ligne**, y compris les mesures du
lot 1 si tu l'exécutes plus tard que le 3 septembre. **Une mesure sans son témoin ne vaut rien**,
et un compte annoncé sans la commande qui le rend n'est pas un compte.

---

## Ce qui est ARRÊTÉ — et qu'aucun lot ne rouvre

1. **Le type monte à la GRILLE.** Il est le défaut de ses critères. **Un critère peut déroger** —
   la politique départementale de Grégoire impose 20 % pour le français, alors que sa pratique
   est ailleurs.
2. **« Mixte » est un CONSTAT, pas une case.** Une grille est mixte parce qu'elle l'est devenue.
3. **L'analytique** = des critères, des points, un total, un seuil. **Le maximum de points EST le
   poids du critère.**
4. **Ce que l'élève lit d'un critère analytique : la note chiffrée, rien d'autre.**
5. **La chaîne** : points → pourcentage → niveau (par les bornes de l'échelle **de la grille**) →
   cartouche. **Chaque maillon existe déjà.**
6. **L'écran** : la palette d'évaluation actuelle, avec **un champ chiffré** au lieu du menu de
   niveaux.
7. **Pas de champ de justification** pour un critère qui déroge. *Un champ que personne ne lira
   est un coût pur.*

## ⛔ HORS PÉRIMÈTRE DES TROIS LOTS — nommé pour que ça n'y entre pas

- **Le total libre** (25, 130…) ramené à 100 %. Décidé : bonne forme, **pas ce chantier** — ça
  touche le calcul de TOUTES les grilles, holistiques comprises, donc des notes déjà remises.
  **L'analytique naît en exigeant 100.**
- **Les sections** (Introduction · Développement · Conclusion).
- **Le critère répété par occurrence** (« Paragraphes 1 · 2 »).
- **Les seuils indicatifs en marge** (42 passable, 49 bien…).
- **Les éléments observables comme structure.** Retirés de la définition par Grégoire : *aide au
  jugement*, pas structure.
- **L'écran de la grille analytique dans le PDF de l'élève au-delà du chiffre.**

⚠ **Si un lot commence à toucher l'un de ces six points, il a débordé. Arrête et dis-le.**

---

# LOT 1 · Le type monte à la grille

**Ce que l'utilisateur y gagne** : il choisit sa manière d'évaluer **en créant sa grille**, au
lieu de la redire à chaque critère.

### Mesuré par Cowork le 3 septembre 2026 à 20 h 30, sur 1.114.1 (build `0903-1858`), en lecture seule
⚠ **REMESURE**, surtout si tu lis ceci un autre jour.

- `grep -rn "grille\.type" js/ tests/ | wc -l` rend **0**. Le champ n'existe nulle part.
- `grep -rn "critere\.type" js/ | wc -l` rend **17**. Le témoin dit que le motif trouve ce qui existe.
- Le formulaire de grille (nom, description) : **`index.html:4949-4961`**. Le menu neuf va là.
- **`creerNouvelleGrille()`**, `js/grilles.js:3196`, pose `type: 'holistique'` **en dur** sur le
  premier critère temporaire, vers la ligne **3224**.
- Trois autres sites posent `'holistique'` en dur sur le formulaire de critère (`#critereType`) :
  **`js/grilles.js:278`, `328`, `382`**.
- Le badge de composition : **`compositionGrille`** (`js/gabarits-utils.js:85`) et
  **`genererBadgeComposition`** (`:95`), affiché depuis **`js/grilles.js:2179`**.

### À faire
1. Un champ **`grille.type`** : `'holistique' | 'analytique' | 'algorithmique'`. Un menu dans le
   formulaire de grille, à côté du nom et de la description.
2. Ce type devient le **DÉFAUT** d'un critère neuf, aux quatre sites mesurés ci-dessus. **Le menu
   de type du critère RESTE** : c'est le chemin de la dérogation.
3. Le menu de la grille **n'offre PAS « mixte »**. C'est le badge qui le dit.
4. Sur une grille existante, sans `grille.type` : le menu montre le type **déduit** de ses
   critères quand il est unique, et **ne présélectionne rien** quand la composition est mixte.
   **Rien n'est écrit dans les données tant que l'utilisateur n'a pas choisi lui-même.**
   ↻ *Tranché par Cowork ; dis-le si tu vois mieux, mais ne l'écris pas sans le dire.*

### ⚠ LE PIÈGE, ET IL S'EST DÉJÀ REFERMÉ DEUX FOIS
Un champ neuf sur la grille **qui n'est pas déclaré dans les schémas de transport se perd EN
SILENCE** à l'export et au partage.

- Schéma d'import : **`js/import-export.js:610`** (`SCHEMAS_IMPORT.grille`)
- Schéma de partage : **`js/partage-schemas.js:217`**

Le commentaire de **`js/import-export.js:645-649`** raconte le même oubli sur la projection EUF :
*« Aucun des trois champs n'était déclaré ici : une grille importée projetait selon le modèle de
MIGRATION et ses paliers d'origine, quel que soit le réglage de son auteur·e. »*

⮕ **Déclare `type` dans les DEUX schémas, et rends le témoin d'un aller-retour export/import qui
le conserve.**

### ⛔ Ce qui ne doit pas bouger
- **Le badge de composition continue de se déduire des CRITÈRES.** Il ne lit **jamais**
  `grille.type` : **le badge dit ce qui EST, pas ce qui est déclaré.** Une grille déclarée
  « analytique » dont un critère est passé en algorithmique affiche **MIXTE**.
- **Aucune grille existante ne porte de type, et on n'écrit rien dans leurs données.** Une grille
  sans `grille.type` doit fonctionner **exactement** comme aujourd'hui. *Tarir n'est pas réparer.*
- **Rien du calcul des notes.** Le lot 1 ajoute un défaut ; il ne change aucune note.

### Fini quand
Grégoire crée une grille, choisit **« Analytique »**, ajoute trois critères : **les trois sont
analytiques sans qu'il ait rien coché**. Il en passe un en algorithmique : le badge devient
**MIXTE**. Il exporte la grille, la réimporte : **elle est toujours analytique**.

---

# LOT 2 · L'analytique se saisit en points

⛔ **N'ouvre pas ce lot avant que Grégoire ait vu le lot 1 à l'écran.**

**Ce que l'utilisateur y gagne** : il remplit sa grille comme sur papier — un chiffre par critère,
un total en bas.

### À MESURER AVANT D'ÉCRIRE — les questions, pas les réponses
- **Où la palette d'évaluation branche le rendu d'un critère.** Au 3 septembre, le cas standard
  passait par un `<select … data-on-change="niveauSelectionne">` dans
  `js/evaluation-chargement.js`, avec un bloc distinct plus haut pour l'algorithmique. **C'est le
  même endroit : une troisième branche.** ⚠ **Retrouve-le, ne fais pas confiance au numéro.**
- **`calculerNote()`, dans `js/evaluation-calcul.js`.** Il travaillait sur `valeurCalcul` et les
  bornes des niveaux ; **la branche analytique n'y passe pas.** Mesure ce qu'il fait
  aujourd'hui avant de l'ouvrir.
- **Le total et le pourcentage en bas de la palette existent déjà** (« Note chiffrée · 45 % ·
  Niveau »). ⮕ **Vérifie qu'ils se remplissent depuis les points, sans nouvel écran.**

### ↻ Ajouté par Cowork le 4 septembre 2026 au soir, après la clôture du lot 1 (1.115.0) — cartographie pour la relecture croisée
⚠ **Ce sont des lignes à retrouver, pas des mesures à croire. Remesure.**

- **La valeur d'un critère a DEUX lecteurs, et le lot doit servir les deux.** Le cas
  algorithmique est le modèle : à l'écran, `_valeurCritereEnCours` (`js/evaluation-calcul.js`)
  rend `donneesAlgorithmiques[critere.id].pourcentage` ; en base, `porteeDepuisEvaluation`
  (même fichier) relit exactement la même chose pour `synthese-retroaction-data.js`. Les deux
  passent par `calculerPortee`, la règle unique. **Une branche analytique ajoutée au premier
  lecteur et pas au second donne un bilan qui rend « -- » sur une copie que l'écran note à 80 %.**
  ⮕ **Témoin exigé** : une évaluation sauvegardée avec des points, relue par
  `porteeDepuisEvaluation`, rend le même pourcentage que l'écran.
- **`calculerNote()` n'a PAS à changer sa boucle.** Elle fait déjà une moyenne pondérée de
  valeurs en pourcentage (`valeur × pondération / 100`, divisé par la pondération totale) : un
  critère analytique y entre comme les autres si son lecteur rend `points / pondération × 100`.
  24 sur 30 → 80 %, c'est la boucle actuelle. **Si tu touches la boucle, tu as changé un
  comportement — arrête et dis-le.**
- **Où les points vivent sur l'évaluation : à trancher par toi, et à dire.** Le raccourci qui
  tente — loger le pourcentage analytique dans `donneesAlgorithmiques` pour que les deux lecteurs
  marchent sans une ligne — est un **mensonge de nomenclature** (l'erreur 5 de la session
  précédente). Recommandation de Cowork : une clé à son nom, qui garde **les points tels que
  saisis** (c'est la donnée vraie, celle que l'enseignant a tapée), le pourcentage étant dérivé ;
  et cette clé **déclarée dans les schémas de transport** si l'évaluation voyage (vérifie si
  `donneesAlgorithmiques` y est ; si oui, la clé neuve y va aussi — c'est le piège du lot 1).
- **`notesCriteres` collecte un CODE de niveau par critère** pour le copier-coller et l'export.
  Un critère analytique n'a pas de niveau avant le lot 3. **Décide ce qu'il y met d'ici là**
  (les points, une chaîne vide ?) et dis-le : c'est un texte que quelqu'un peut lire.

### À faire
- Un critère analytique rend **un champ numérique** (0 → sa pondération) au lieu du menu de
  niveaux.
- `calculerNote()` somme les points d'un critère analytique.

### ⛔ Ce qui ne doit pas bouger
**Un critère holistique et un critère algorithmique se calculent exactement comme avant.**
▣ **Témoin exigé** : les sentinelles existantes du calcul passent **sans être modifiées**. **Si
tu dois en toucher une, tu as changé un comportement — arrête et dis-le.**

### ⚠ RELECTURE CROISÉE DE COWORK, OBLIGATOIRE
Ce lot touche **`calculerNote()`, qui produit les notes des élèves de Grégoire**. Règle 2 du
protocole : *ce qui ne se reprend pas se relit à deux.* **Livre, puis attends la relecture avant
que Grégoire publie.**

### Fini quand
Grégoire ouvre une copie, saisit **24** sur un critère qui pèse **30**, et lit **80 %** en bas de
la palette. Un second critère holistique dans la même grille continue de se choisir au menu, et le
total tient compte des deux.

---

# LOT 3 · Le chiffre trouve son niveau, et le niveau ouvre la cartouche

⛔ **N'ouvre pas ce lot avant que Grégoire ait vu le lot 2 à l'écran.**

**Ce que l'utilisateur y gagne** : sa rétroaction préparée s'attache à une note chiffrée, comme
elle s'attache déjà à un niveau.

### À MESURER AVANT D'ÉCRIRE
- **Le passage d'un pourcentage à un niveau par les bornes de l'échelle.** Au 3 septembre, le
  motif `pourcentage >= n.min && pourcentage <= n.max` se trouvait à **cinq** sites de
  `js/evaluation-calcul.js`, et `js/echelles.js:3854` l'énonçait comme règle du système —
  *« note chiffrée → CODE »*. ⚠ **Recompte : cinq était vrai ce jour-là.**
- **La clé de la cartouche.** Elle est indexée par `critereId_niveau`, et la clé ne se forme pas
  sans niveau : `cleCart = critereId && niveau ? … : null`. ⮕ **Sans niveau, le commentaire reste
  vide EN SILENCE. Le niveau déduit referme cette porte** — vérifie que c'est bien le cas, ne le
  suppose pas.

### ⛔ Ce qui ne doit pas bouger
**L'élève ne voit que le chiffre.** Décision de Grégoire. ⮕ **Le niveau déduit sert à l'enseignant
et à la cartouche ; il ne s'ajoute pas au PDF de l'élève sans qu'il le demande.**

### Fini quand
Grégoire attache une rétroaction de cartouche à un niveau, saisit une note chiffrée qui tombe dans
ce niveau, et **la rétroaction apparaît** — sans qu'il ait choisi de niveau nulle part.

---

## Ce que ce fichier ne dit pas

⛔ **Aucun effort n'est estimé** — aucun n'a été mesuré.
⚠ **Le §B de la séance à froid reste entier** : les trois types ne sont toujours pas décrits sur
les mêmes axes dans la documentation de l'application. **Ces lots livrent le comportement ; ils
n'écrivent pas l'aide.**
▣ **Et la posture tient** : *ces lots reproduisent la pratique de Grégoire, bien documentée. Le
14 septembre dira où elle force un collègue de chimie ou de philosophie à plier la sienne.*
