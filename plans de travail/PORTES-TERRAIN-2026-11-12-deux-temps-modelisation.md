# Porte terrain iPad : « Les parcours en deux temps », première partie

Lot du 12 nov. 2026 (mandat du Projet, 8 h 20). Branche `claude/deux-temps-modelisation-da3icr`, partie de `main`
à `271dc9177` (1.243.0). Rapport : `plans de travail/RAPPORT-2026-11-12-deux-temps-modelisation.md`.

**État : EN ATTENTE du premier essai de Grégoire, sur l'aperçu Netlify de la branche (pas de fusion avant).**
Cowork publie l'artefact jumeau, avec son bouton « Copier mes résultats » et un champ de saisie pour chaque rangée du §3.

Pourquoi une porte, alors que la règle est de ne pas en faire pour l'apparence : le post-mortem d'avril (§3.3) demande
que tu juges, clic par clic, si la modélisation atteint son but. Aucune machine ne peut répondre à cela. Le reste
(le confinement, la remise à neuf, le choix qui se souvient) est mesuré par les bancs : il n'est pas dans cette liste.

⚠ **L'aperçu est une autre adresse que `app.codexnumeris.org` : tes vraies données n'y sont pas.** Tu y arrives dans
un espace vide. Rien de ce que tu y fais ne touche ton application.

---

## §0 · Préalable

- **0.1** Ouvre l'adresse de l'aperçu (donnée dans le rapport), sur l'iPad, en paysage. Recharge la page.
  ⮕ Attendu : en bas de l'accueil, la version **1.243.0 · build 1112-0943** (ce lot ne change pas le numéro de
  version, seulement le build ; il partira avec la release du jour). Un autre build : c'est une autre version que
  celle de cette porte.
- **0.2** Ouvre le menu à trois traits, puis « Assistance ».
  ⮕ Attendu : le panneau commence par « **Apprendre l'application, en quatre temps.** ». Si tu lis encore « Des
  parcours où tu fais les gestes toi-même… », c'est l'ancienne version : recharge en vidant le cache.

## §2 · Interface : le panneau, puis la modélisation clic par clic

### 2.1 Le panneau « Assistance »

Pourquoi : c'est ici que les deux temps se choisissent. Avant, « Commencer » partait toujours sur tes données.

- **a.** Lis les quatre lignes sous le titre.
  ⮕ Attendu : ton texte, mot pour mot ; le début de chaque ligne en gras ; pas de numéros.
- **b.** Regarde sous « Tes parcours ».
  ⮕ Attendu : deux options côte à côte, « Matériel de la démo » (choisie, en orange) et « Mon matériel » ; dessous,
  le bouton « Remettre la démo à neuf ».
- **c.** Regarde les cartes 3 à 9.
  ⮕ Attendu : chacune dit « Ce parcours n'a pas encore son modèle dans la démo. Pour le faire dès maintenant,
  choisis « Mon matériel ». » ; son « Commencer » est pâle et ne part pas.
- **d.** Touche « Mon matériel ».
  ⮕ Attendu : les phrases disparaissent, tous les « Commencer » redeviennent orange, « Remettre la démo à neuf »
  disparaît. Touche « Matériel de la démo » pour revenir.

### 2.2 La modélisation de « Mettre ta classe en place » (huit bulles)

Pourquoi : avant, ce parcours refermait la démo et ne se jouait que sur tes vraies données. Maintenant, sous
« Matériel de la démo », il ouvre la démo et te fait monter un second groupe, avec du matériel fourni. C'est toi qui
fais chaque geste ; rien ne se remplit seul. À chaque bulle, juge deux choses : **sais-tu quoi toucher ?** (une
flèche et la pulsation orange) et **la bulle te laisse-t-elle voir ce que tu touches ?**

- **a.** Sous « Matériel de la démo », touche « Commencer » sur « Mettre ta classe en place ».
  ⮕ Attendu : le bandeau vert de la démo, Cadre › Trimestre, le formulaire d'un nouveau cours, la bulle « Un cours »,
  « 1 sur 8 ».
- **b.** « Un cours » : remplis avec le matériel que donne la bulle (601-999-DM, « Littérature et imaginaire »,
  601 Français, 3-1-3), puis touche « Créer le cours ».
  ⮕ Attendu : une flèche par champ obligatoire encore vide ; la bulle passe à « Une liste d'étudiant·es ».
- **c.** « Une liste d'étudiant·es » : touche « Copier la liste » dans la bulle, puis colle dans le champ
  (toucher long, « Coller »), puis touche « Prévisualiser ».
  ⮕ Attendu : huit lignes dans le champ (Koala Câlin, Loutre Enjouée…). **C'est le geste le moins sûr sur l'iPad :
  si la copie ou le collage ne marche pas, note ce que tu vois.**
- **d.** « Le cours de la liste » : dans l'aperçu, le menu « Ces étudiant·es seront rattaché·es à » propose le cours
  de la démo. Choisis 601-999-DM, puis touche « Importer 8 étudiant·es ».
  ⮕ Attendu : la pulsation est sur le menu, puis sur le bouton ; la bulle passe à « Un horaire ».
- **e.** « Un horaire » : groupe 00002, « Mardi matin », une séance, le mardi de 8 h à 12 h, quatre périodes ;
  touche « Créer l'horaire ».
  ⮕ Attendu : la bulle passe à « Un groupe-cours ».
- **f.** « Un groupe-cours » : choisis les cinq morceaux que nomme la bulle, puis « Créer le groupe-cours ».
  ⮕ Attendu : la bulle passe à « D'un groupe à l'autre », et pointe le menu du groupe dans l'en-tête.
- **g.** « D'un groupe à l'autre » : dans l'en-tête, choisis le groupe 601-999-DM.
  ⮕ Attendu : la saisie des présences s'ouvre, huit noms, la bulle « Un premier cours ».
- **h.** « Un premier cours » : la date affichée est celle de l'autre groupe (un mercredi) ; la bulle le dit et
  pointe « Précédent ». Touche-le, note une absence, puis « Verrouiller la saisie ».
  ⮕ Attendu : après « Précédent », le mardi 9 décembre 2025 ; après le verrou, la bande d'assiduité.
- **i.** « Le groupe d'un coup d'œil » : regarde la bande.
  ⮕ Attendu : huit points, dont celui de l'absence à gauche ; deux boutons, « Explorer la démo » et « Refaire avec
  mon matériel ».
- **j.** Touche « Refaire avec mon matériel ».
  ⮕ Attendu : le bandeau vert disparaît ; le parcours repart sur tes données (dans l'aperçu, un espace vide :
  « Ton trimestre », « 1 sur 8 »). Dans le panneau, « Mon matériel » est maintenant choisi.

### 2.3 « Remettre la démo à neuf »

Pourquoi : pour refaire la modélisation depuis le début, ou effacer ce qu'on a essayé dans la démo.

- **a.** Panneau, « Matériel de la démo », touche « Remettre la démo à neuf ».
  ⮕ Attendu : une confirmation qui dit ce qui s'efface (ce que tu as fait dans la démo) et ce qui ne bouge pas
  (tes données). « Annuler » est le bouton par défaut.
- **b.** Confirme, puis relance la modélisation.
  ⮕ Attendu : « La démo est remise à neuf. » ; la carte redit « À faire » ; la modélisation repart à « Un cours ».

## §3 · Décisions : ce qui attend ton verdict (ce ne sont pas des vérifications)

Chaque rangée attend des mots, pas une coche.

- **3.1** La phrase de la carte sans modèle : « Ce parcours n'a pas encore son modèle dans la démo. Pour le faire
  dès maintenant, choisis « Mon matériel ». »
- **3.2** La confirmation : « Tout ce que tu as fait dans la démo s'efface : ce que tu y as créé, modifié, évalué ou
  importé. La démo revient telle qu'elle était au départ. Tes données, elles, ne bougent pas. » ; bouton « Remettre
  à neuf » ; après coup, « La démo est remise à neuf. ».
- **3.3** Les deux boutons de la dernière bulle : « Explorer la démo » (à la place du parcours suivant, tant que sa
  modélisation n'existe pas ; il portera ensuite son titre, « Évaluer une première production ») et « Refaire avec
  mon matériel ».
- **3.4** Les huit bulles de la modélisation (titres, textes, gestes) : toutes proposées, listées dans le rapport.
  Lesquelles changer ?
- **3.5** Le matériel fourni : le cours « 601-999-DM, Littérature et imaginaire », l'horaire « Mardi matin », et la
  liste de huit totems (rapport). Un nom à changer ?
- **3.6** Les étapes laissées de côté dans la démo : le trimestre et le profil. D'accord, ou une bulle doit-elle
  le dire ?
- **3.7** « Refaire », sur une modélisation déjà faite, reprend où la démo en est (ce qui est créé y reste) ; pour
  repartir de zéro, il faut « Remettre la démo à neuf ». Est-ce ce que tu attends ?

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : tout a tourné sous Chromium, dans le cloud. Le verdict WebKit vient à la fusion.
- **« Copier la liste » sur l'iPad** : sous Chromium, la copie puis le collage au clavier marchent. Le presse-papiers
  de Safari sur iPad n'a pas été éprouvé ; un repli existe (copie d'une sélection), non éprouvé non plus sur iPad.
- **Le mode clair** : les couleurs neuves viennent des variables existantes ; aucune capture en mode clair n'a été
  regardée.
- **Le téléphone** : la modélisation n'a pas été jouée sous 500 px de large.
- **Tes vraies données** : le confinement est mesuré sur un trimestre réel bâti par le banc (un cours, un profil,
  trois étudiant·es, un horaire, un groupe-cours, une séance verrouillée), pas sur ton corpus.
- **Le stock chez toi** : la sortie de la démo retire désormais la clé `seancesCompletes_gc_GC_DEMO` (les séances du
  groupe de la démo, rangées hors de la démo depuis toujours). C'est un cache que la démo refait à l'entrée ; il sera
  retiré chez toi à ta prochaine sortie de démo. Nommé ici parce que c'est un effacement que tu n'as pas demandé.
