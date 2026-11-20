# Rapport, 20 nov. 2026 : les codex de départ, et l'aperçu d'essai des cinq parcours

**Dernier relais.** Branche `apercu/essai-parcours`, **ESSAI, ne jamais fusionner** (PR n° 42, brouillon). Partie de `origin/lot/nous-faisons-donnees` (`e259204e`), avec `origin/lot/je-regarde-cours` (`a28b133e`) fusionnée dedans : fusion triviale. Consigne : `plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md`. **Livré** : la fabrique des codex de départ (`tests/departs-de-parcours/`, commit durable `30a907a9`), trois fichiers de départ, `departs.html`, leur banc avec break-tests, la mesure des touchers. Rien sur `main` sauf l'entrée de `RELAIS.md`. Aucun commit sur les branches de lot. Ni release, ni retouche des textes des bulles.

---

## Pour toi, Grégoire : quoi ouvrir, quoi lancer

**L'aperçu d'essai** : https://deploy-preview-42--codexnumeris-051225.netlify.app (prêt, d'après Netlify ; je n'ai pas pu l'ouvrir d'ici, le réseau de la session le refuse). **La page des fichiers** : https://deploy-preview-42--codexnumeris-051225.netlify.app/departs.html

Chaque essai part d'**un espace vide** (voir plus bas comment le vider).

1. **« Mettre ta classe en place », « Nous faisons »** : pas de fichier. Ouvre l'aperçu dans un espace vide, menu ☰, « Assistance », « Nous faisons » sous « Mettre ta classe en place ».
2. **« Recevoir les productions », « Nous faisons »** : dans `departs.html`, touche « Télécharger le fichier » sous « Départ : Recevoir les productions », puis « Ouvrir l'application ». Dans l'application : « Codex », « Ouvrir un codex », le fichier, « Recharger ». Puis menu ☰, « Assistance », « Nous faisons » sous « Recevoir les productions » (il faut glisser un peu dans le panneau pour le voir).
3. **« Monter ton cours », « Nous faisons »** : les mêmes gestes avec « Départ : Monter ton cours », puis « Nous faisons » sous « Monter ton cours ».
4. **« Mettre tes données à l'abri », « Nous faisons »** : les mêmes gestes avec « Départ : Mettre tes données à l'abri », puis « Nous faisons » sous « Mettre tes données à l'abri ».
5. **« Je regarde » de « Monter ton cours »** : pas de fichier possible (aucun codex ne transporte la démo). Dans un espace vide : menu ☰, « Assistance », « Je regarde » sous « Mettre ta classe en place », jusqu'au bout ; « Voir le parcours suivant » ouvre « Je regarde » d'« Évaluer une première production », jusqu'au bout, « Terminer » ; puis « Je regarde » sous « Monter ton cours ». Compte environ 70 touchers avant sa première bulle.

**Remettre l'aperçu à vide entre deux essais.** Le plus court, si Safari le permet (inféré, à vérifier au premier essai) : faire chaque essai dans **un onglet de navigation privée**, et le fermer à la fin ; son espace s'efface avec lui. Sinon : Réglages de l'iPad, Apps, Safari, Avancé, Données de sites web, puis supprimer celles de `deploy-preview-42--codexnumeris-051225.netlify.app`. ⚠ Le bouton de l'application (Réglages, Données, Maintenance, « Réinitialiser toutes les données ») fait d'abord écrire un codex à part, puis pose deux questions et fait taper « EFFACER » : une quinzaine de touchers (lu dans le code, non joué). ⚠ Ouvrir un codex par-dessus un essai fini ne suffit pas : l'ouverture **n'efface pas** ce que le fichier ne contient pas (les copies importées pendant un essai de « Recevoir », par exemple, resteraient).

**L'ordre qui évite de tout refaire** : « Je regarde » de « Monter ton cours » dans un espace à lui (vider l'espace efface la démo, donc les deux modèles qu'il exige).

---

## 1. Ce que j'ai supposé

- **Les trois fichiers partent du même état** : « Mettre ta classe en place » et « Évaluer une première production » faits par leurs gestes, le départ des bancs du « Nous faisons » des parcours 4 et 5. Mesuré dans le code (§ 3.1), aucun des trois parcours n'exige davantage. « Recevoir » n'est pas joué avant « Monter ton cours » ni avant « Mettre tes données à l'abri » : leur code ne lit rien de ce qu'il laisse, et son préalable déclaré est « Évaluer » (pour « Monter ») ou « Mettre ta classe en place » (pour « Données »). Le panneau dira donc « À faire » sous « Recevoir » dans les trois fichiers.
- **Le rappel « Mets ton codex à jour » est répondu dans les fichiers** : « Plus tard », « Dans 30 jours » (le 10 déc., à l'horloge des bancs). Une vraie personne l'a devant elle à la fin de « Mettre ta classe en place » ; sans réponse, il couvrait le menu après chaque ouverture (§ 3.4). J'ai pris 30 jours plutôt que les 14 par défaut pour qu'il ne revienne pas pendant la semaine des essais.
- **Les noms** sont ceux des bancs, manifestement fictifs : Alix Alpaga, Basile Baobab, Cléo Cormoran ; Camille Fictive, `camille@exemple.org`, « Cégep imaginaire » ; le cours 601-101-MQ « Écriture et littérature ». Pas ceux de la démo : les aides des bancs les écrivent ainsi.
- **Un seul nom réel dans les fichiers** : la mention d'auteur du matériel sous licence CC que l'application écrit dans **tout** espace neuf au démarrage (la carte d'alignement « Écriture et littérature (démo) », `bibliothequeAlignements`). Mesuré dans un espace neuf sans aucun geste. Je l'ai laissée : ce n'est ni une donnée d'élève ni une donnée de tes classes.
- **Les dates** : le jeu est daté du mardi 10 nov. 2026 (l'horloge des bancs) ; le trimestre A2026 court du 24 août au 21 déc., il couvre les essais.
- **Les fichiers finissent en `.zip`, pas en `.codex.zip`**, et la fabrique vit dans `tests/departs-de-parcours/` : le `.gitignore` écarte `*.codex.zip` et les dossiers `codex-*/` (la garde contre les vraies données de classe). Je n'ai pas forcé la garde ; le précédent est la fixture `tests/fixtures/copies-de-secours-1.172.0/copie-de-secours-avec-travaux.zip`. L'application ouvre tout `.zip`.
- **La préférence « accompagnement » à `false` dans les fichiers** n'est pas un réglage de banc : mesuré, c'est la valeur d'un espace neuf. Celle de l'aide dans les pages (`modeClair`), que les bancs coupent, est remise à sa valeur par défaut avant l'écriture.
- Le manifeste dit « Chrome 148 / Windows » (le navigateur de la fabrique) : sans effet à l'ouverture.

## 2. Le contenu de chaque fichier

Une ligne par fichier (11 Ko chacun, sans copie d'élève) :

- **`departs/depart-recevoir-les-productions.zip`** : trimestre A2026, cours 601-101-MQ, ton profil, trois étudiant·es, l'horaire du mardi, le groupe-cours, la première saisie de présences verrouillée ; la production « Lire un roman et en rendre compte » avec sa grille par niveaux (« Journal de lecture »), son échelle, sa cartouche, et l'évaluation verrouillée d'Alix Alpaga ; « Mettre ta classe en place » et « Évaluer » faits ; le rappel répondu.
- **`departs/depart-monter-ton-cours.zip`** : le même état ; la production est dans ta bibliothèque, ce que « Monter ton cours » exige.
- **`departs/depart-mettre-tes-donnees-a-l-abri.zip`** : le même état ; un trimestre réel, ce que « Mettre tes données à l'abri » exige.
- **« Mettre ta classe en place »** : pas de fichier, il part d'un espace vide.
- **« Je regarde » de « Monter ton cours »** : pas de fichier, aucun ne peut porter son départ (§ 3.3).

Les fabriquer à nouveau, depuis `tests/` : `npm run departs` sur le Mac (WebKit), `PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium npm run departs` dans une session cloud. Ajouter un départ (parcours 7, 8, 9) : une entrée dans `tests/departs-de-parcours/departs.js`, et une préparation dans la fabrique si aucune ne convient.

## 3. Ce que j'ai mesuré

### 3.1 Ce que chaque parcours exige au départ (dans son code)

- **« Recevoir les productions »** (`js/parcours-recevoir.js`, `condition`) : un groupe-cours actif, et une production qui nomme sa grille, son échelle et sa cartouche. Première bulle : « Leurs productions », 1 sur 9.
- **« Monter ton cours »** (`js/parcours-cours.js`, `condition`) : une production dans la bibliothèque. Sa première bulle ouvre « Conception », « Alignement », et part de la carte active, quelle qu'elle soit. « Ta compétence », 1 sur 7.
- **« Mettre tes données à l'abri »** (`js/parcours-donnees.js`, `aUnTrimestreReel`) : un trimestre réel. « Pourquoi un codex », 1 sur 4. Ouvrir un fichier sans sélecteur de fichiers (Safari) ne laisse pas de fichier « tenu » : la bulle 3 prendra la même forme que dans un espace où l'on n'a jamais écrit de codex (inféré du code, `cheminDeLaProchaineEcriture`).
- Le préalable déclaré (`prealable`) ne verrouille rien : il dit seulement quel bouton pulse au refus.

### 3.2 Point 3 : les bulles de « Monter ton cours » prennent-elles la flèche et la parenthèse hors du gras ?

**Oui, dans les sept bulles du « Nous faisons »**, rendues par le moteur fusionné (Chromium, 1180 × 820, chaque bulle ouverte à son étape, ses gestes pas encore faits) :

- **Chaque ligne de geste porte la flèche** (→), aucune n'en manque : bulle 1, deux lignes ; 2, trois ; 3, quatre ; 4, deux ; 5, cinq ; 6, six ; 7, une. Aucune sous-ligne dans ce parcours.
- **Les gestes sont en poids normal** (400) ; **la consigne seule est en gras** (600), et c'est la dernière ligne de chaque liste.
- **La parenthèse qui termine une consigne sort du gras** dans les trois bulles qui en ont : 2 (« (le lien « se décline en » s'affiche) »), 3 (« (le lien « se concrétise dans » s'affiche) ») et 4 (« (l'invite « Sera en mesure de… » t'y aide) »), chacune en 400.
- Quatre **gestes** (pas des consignes) finissent aussi par une parenthèse (bulles 3, 4, 5 et 6, dont deux fois « (l'Inspecteur s'ouvre) ») : ils sont en poids normal en entier, la question du gras ne se pose pas.
- Au passage, la première bulle du **« Je regarde »** : sa consigne (« Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui) ») porte la flèche.
- Non mesuré : le crochet d'un geste fait (le banc de la session B le juge, `parcours-5-nous-faisons-2026-11-19.spec.js`).

### 3.3 Point 5 : lancer « Je regarde » de « Monter ton cours » dans l'aperçu

- **Son refus exige deux choses, toutes deux dans la démo** (`refusModele`) : le deuxième groupe (que crée « Je regarde » de « Mettre ta classe en place ») et la production du modèle d'« Évaluer » (que crée « Je regarde » d'« Évaluer »). Dans un espace vide, le refus paraît et la pulsation va sur « Je regarde » d'« Évaluer », lui-même refusé sans le modèle de « Mettre ta classe en place ».
- **Un codex ne peut pas porter cet état** : mesuré. Un fichier écrit après les deux modèles, ouvert dans un espace vide, laisse le refus tel quel. La démo n'entre pas dans un codex (T2, `_sansLeDemo`), et l'état des modèles vit dans l'appareil (`laboCodex.assistance`, hors des données).
- **Le chemin le plus court** : dans l'aperçu même, « Je regarde » de « Mettre ta classe en place », « Voir le parcours suivant », « Je regarde » d'« Évaluer », « Terminer », puis « Je regarde » de « Monter ton cours ». Compté au banc : 45 touchers de boutons, 7 de menus déroulants (deux touchers chacun sur l'iPad), 7 étiquettes posées et un mot écrit, soit **environ 70 touchers** (± 10 : le banc remplit certains champs autrement qu'un doigt). Sans porte dérobée, je n'en vois pas de plus court.
- **Une fois faits, les deux modèles survivent à l'ouverture d'un codex** : mesuré (ouvert « Départ : Monter ton cours » par-dessus, le refus reste levé). Mais **vider l'espace les efface**, et **« Refaire » « Je regarde » de « Monter ton cours » remet la démo à neuf** puis relance le premier modèle (`refaireModele`, lu dans le code) : rejouer ce « Je regarde » coûte de nouveau les 70 touchers.
- Après l'ouverture d'un codex, la première bulle de ce « Je regarde » demande de choisir le deuxième groupe dans l'en-tête : un toucher de plus.

### 3.4 Point 6 : de `departs.html` à la première bulle, en touchers

Chromium, écran tactile, publication construite servie en http, iPad Air en portrait (820 × 1180) et en paysage (1180 × 820) ; `tests/mesures/codex-de-depart-touchers.mjs`.

**11 touchers pour chacun des trois fichiers, aux deux orientations** : 10 joués, 1 inféré (la question « Télécharger » de Safari, que Chromium ne pose pas). Dans l'ordre : Télécharger le fichier ; (Télécharger, Safari) ; Ouvrir l'application ; Codex ; Ouvrir un codex ; le fichier dans la fenêtre de fichiers de l'iPad (un toucher s'il est dans « Récents », inféré) ; Recharger ; menu ☰ ; Assistance ; **glisser dans le panneau** ; Nous faisons.

**Où ça accrochait, et ce qui en reste :**

1. **Le rappel « Mets ton codex à jour » couvrait le menu** 1,5 s après le rechargement, aux six essais (un toucher de plus, « Plus tard »). Levé par le contenu des fichiers (§ 1), pas par le code.
2. **`departs.html`, en paysage** : le troisième fichier, puis « Ouvrir l'application », étaient sous le bas de l'écran (deux glissements). Levé : la page est resserrée, chaque fichier a son propre « Ouvrir l'application ».
3. **Reste : le bouton « Nous faisons » des parcours 4, 5 et 6 est sous le bas du panneau « Assistance »**, aux deux orientations : un glissement avant de le toucher.

⮕ **C'est plus de cinq ou six.** Plus court, sans le coder :
- **Aujourd'hui, sans code** : télécharger les trois fichiers une fois (ils restent dans tes téléchargements), puis ne plus partir de `departs.html` : chaque essai commence dans l'application, **8 touchers** (Codex, Ouvrir un codex, le fichier, Recharger, ☰, Assistance, glisser, Nous faisons).
- **Avec du code, à décider** : le panneau « Assistance » amené sur le premier parcours à faire dont le préalable est fait (un glissement de moins, et utile hors de l'essai) ; la fenêtre « Recharger » remplacée par un rechargement direct après une ouverture complète (un toucher de moins, mais elle porte aujourd'hui le conseil de garder le fichier). Les deux ensemble : 6.

### 3.5 Point 7 : les bancs

- **`tests/integration/codex-de-depart-2026-11-20.spec.js`**, un essai par fichier : un espace vide (témoin), le fichier ouvert par le geste de l'iPad (« Codex », « Ouvrir un codex », le champ de fichier, `showOpenFilePicker` retiré comme sur Safari, « Recharger »), le panneau, « Nous faisons », la première bulle (« 1 sur N », son titre) sans refus. Il juge les parcours **que la branche ouvre vraiment** (`parcoursFermes: true` : le harnais ne les rouvre pas en mémoire ici). **3 sur 3 verts** (Chromium).
- **Break-tests**, chacun rejoué puis défait :
  - les productions retirées des fichiers de « Recevoir » et de « Monter », le trimestre retiré de celui de « Données » : **3 rouges**, chacun nommant le refus (« Commence par « Évaluer une première production »… », « Commence par « Mettre ta classe en place »… ») ;
  - les trois fichiers coupés en deux : **3 rouges** (« l'ouverture propose de recharger » ne vient pas) ;
  - « monter » retiré de `PARCOURS_OUVERTS` : **rouge pour « Monter ton cours »**, verts pour les deux autres ; `js/assistance.js` rétabli à l'identique (`git diff` vide).
- **La fabrique** a ses témoins, lus dans le zip écrit : un trimestre réel, un groupe-cours actif, une production prête, le rappel répondu, aucune clé de la démo.
- **Vitest complet** (depuis `tests/`) : 933 fichiers, 11 892 essais. Un rouge au premier passage, **de mon fait** : le jeton de cache de la fusion (`20261120e`) ne portait pas le jour du build ; remplacé par `20261119z` (`3fab1728`), la sentinelle et celle de la liste blanche repassent. Le passage final est celui du hook de push.
- **Chromium sur ce qui est touché** : voir § 3.6.

### 3.6 Les bancs des parcours sur la branche fusionnée (Chromium)

Les bancs des cinq parcours à l'essai, sur la branche fusionnée, aux deux tailles de l'iPad : **18 verts sur 18**.

- `nous-faisons-classe-2026-11-19` : 5 sur 5 ;
- `nous-faisons-recevoir-2026-11-19` : 4 sur 4 ;
- `parcours-5-nous-faisons-2026-11-19` : 2 sur 2 (le moteur de la session A avec le parcours 5 de la session B) ;
- `nous-faisons-donnees-2026-11-19` : 5 sur 5 ;
- `je-regarde-cours-2026-11-19` : 2 sur 2.

Le banc du verrou (`parcours-verrou-2026-11-16`) n'existe plus sur cette branche (retiré côté `lot/je-regarde-cours`) ; le verrou est jugé par sa sentinelle Vitest, verte avec les six parcours ouverts.

**Les rouges laissés par les sessions A et B** (non rejoués ici, nommés par leurs rapports) : la bulle 3 de « Mettre tes données à l'abri », à droite de l'aperçu à partir de 1180 px (cinq essais du banc d'origine du parcours 6) ; la bulle 2 de « Recevoir » qui couvre « Importer » à 820 × 1180 (deux essais) ; la bulle de « Mettre ta classe en place » qui couvre deux champs. **Aucun ne gêne un codex de départ** : ils portent sur des bulles en cours de parcours, pas sur son départ, et le banc des départs est vert.

**Non jugé** : WebKit et Safari (aucun WebKit dans la session) ; l'iPad lui-même.

## 4. Trouvailles en chemin

- **Après l'ouverture d'un codex sans date de rappel, l'application dit « Mets ton codex à jour »** alors que le fichier vient d'être ouvert. Non inscrit : aucun symptôme vécu (règle du 24 août), et un vrai codex porte d'ordinaire la date de rappel de son auteur. Contourné dans les fichiers de départ (§ 1).
- **Ouvrir un codex n'efface pas les clés de l'espace d'avant** (le plan de purge de #336 reste en aperçu). Connu ; c'est la raison du « espace vide » entre deux essais.

## 5. Ce qui reste à décider

1. **L'ouverture en 11 touchers** : accepter le chemin « télécharger une fois, puis 8 touchers », ou demander l'une des deux retouches du § 3.4 (décision produit).
2. **« Je regarde » de « Monter ton cours » coûte environ 70 touchers de préalable** à chaque essai neuf : à accepter tel quel, ou à poser à Cowork (une Modélisation qui se lance seule dans la démo serait une porte que le mandat exclut).
3. **La fabrique est durable, mais vit sur une branche qui ne se fusionne jamais.** Pour qu'elle serve aux parcours 7, 8 et 9, son commit (`30a907a9`, trois fichiers sous `tests/` et une ligne de `tests/package.json`) devra être repris sur `main` par une session qui y a droit.
4. **La navigation privée** comme façon de vider l'aperçu : à vérifier au premier essai (que Safari y garde les données le temps de l'onglet).
