# Rapport : le quatrième parcours, « Recevoir les productions, rendre tes rétroactions » (9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md` (sur `main`, présente sur la
branche). Décisions de Grégoire du 9 nov., 10 h 01 à 10 h 04, en Cowork (corrections des étapes 5 et 7, questions 6, 7
et 9), relayées à une session dans le nuage : ni WebKit ni tes données ici. Branche `lot/parcours-4-recevoir-et-rendre`,
partie de `lot/parcours-3-evaluer` (qui porte les parcours 1 à 3, la complétion dans les quatre familles et la 1.238.0).
Non fusionnée, non publiée, rien au changelog. Préalable de la consigne vérifié : le lot « Les emojis comme tampons, et
les synthèses PDF des copies sur papier » est sur `main` (1.237.0).

## En tête

### Ce qui est fait (en gestes d'utilisateur)

- Le panneau « Assistance » compte quatre parcours. « Recevoir les productions, rendre tes rétroactions » y est
  quatrième, avec sa ligne validée, son état et son bouton.
- **La condition d'entrée** (ta question 7) : une production du groupe-cours actif qui nomme sa grille, son échelle et
  sa cartouche. Sans elle, « Commencer » ne lance rien et le panneau dit la phrase validée (« Commence par « Évaluer une
  première production » : il te faut décrire ta production, avec sa grille, pour recevoir celles de tes étudiant·es. »).
  La démo ouverte se referme d'abord ; le parcours se joue sur tes vraies données.
- **La voie des fichiers, neuf étapes** : tu déposes les fichiers (« Rien à importer » est offert à la première bulle) ;
  tu vérifies la production, les étudiant·es trouvé·es et les pages à réunir (trois contours), puis tu importes ; la
  Liste les montre « Importé » ; « Actions › Annoter » ouvre la production ; l'engrenage de la palette « Tampons », puis
  « Enregistrer » ; tu annotes, puis « Annoter ▾ › Évaluer » ; un niveau par critère (grille, échelle et cartouche déjà
  choisies) ; le cadenas « Verrouiller » ; « Exporter pour Léa » (un ZIP téléchargé) ; la bulle finale, au centre,
  « Terminer ».
- **La voie sans fichier, quatre étapes** (« n sur 4 », bulles et panneau) : « Actions › Évaluer » sur la ligne, le
  verrou, l'export, la fin. La voie choisie est retenue pour « Reprendre » comme pour « Refaire ».
- « Plus tard » sur chaque bulle sauf la dernière ; « Reprendre » relit la voie et l'étape, même après un rechargement.
- Le rappel « Mets ton codex à jour » ne s'ouvre pas en plein parcours (le code du troisième, qui est celui du sixième) ;
  il s'ouvre après, comme prévu.
- Tes corrections du 9 nov. sont posées mot pour mot (étape 5 : « Annoter ▾ », puis « Évaluer » ; étape 7 : « Un mot
  pour ton étudiant·e » et la cartouche précise). Une sentinelle Vitest les exige.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **Le troisième parcours ne mène pas au quatrième** (mesuré). À la sortie du troisième, la production ne nomme que sa
   grille : ni échelle ni cartouche. Le quatrième refuse alors, et sa phrase renvoie… au troisième, déjà « Fait »
   (capture `panneau-…-sans-production-prete`). *Recommandation :* que le troisième parcours fasse nommer à la production
   son échelle (étape 2) et sa cartouche (étape 8), ce qui demande deux phrases à valider (proposées au rapport du
   troisième, question 2, et ici : à l'étape 8 du troisième, « Puis, dans la fiche de ta production, choisis cette
   cartouche : elle s'y appliquera à chaque évaluation. »). *À défaut,* revenir à la condition de la consigne (la grille
   seule) avec les phrases de la session H à l'étape 6 (« … déjà choisies si ta production les nomme ; sinon,
   choisis-les. »). Le banc, lui, donne à la production son échelle et sa cartouche dans sa fiche avant de commencer.
2. **Étape 2, « À droite… s'il manque un nom, choisis-le »** : tient en partie. La colonne de droite s'intitule
   « Aperçu » ; elle montre l'étudiant·e trouvé·e, mais un nom manquant se choisit **au centre**, dans l'inspecteur,
   après avoir touché le fichier (mesuré : c'est là que le banc choisit l'étudiante des deux photos). *Proposée :*
   « … s'il manque un nom, touche le fichier et choisis-le au centre. »
3. **Étape 4, les emojis** (la consigne demande la phrase qui les nommerait, sans toucher le texte) : *proposée :*
   « … réécris les autres, change leur image ou tape un emoji à sa place, ou crée tes propres tampons, … » (le champ de la
   fenêtre s'appelle « ou un emoji », d'après les Nouvelles de la 1.237.0).
4. **Étape 2, la bulle et l'inspecteur, à juger sur la capture `p4-2-…`** : sur cette page pleine largeur, sans voile, la
   bulle s'accroche au menu « Production » et couvre une partie de l'inspecteur, là où l'on choisit l'étudiant·e.
   *Recommandation :* garder ainsi pour l'instant ; une bulle repliable serait un lot du moteur.

### Ce que je n'ai pas pu vérifier

- **WebKit, l'iPad** : absents du nuage ; essais et captures sous **Chromium**. Sous WebKit (`file://`), l'import refuse
  les Blob en IndexedDB (`reunir-en-une-copie-1231.spec.js`, en-tête) : le banc de ce parcours, qui importe pour de vrai,
  devra peut-être y doubler le stockage, comme ce banc-là. À mesurer au Mac.
- **Les captures à 390 px** (étapes 1, 2, 7 et 8, le panneau) : non faites (le relais demandait 1180 px).
- **Ta question 6** (« Exporter pour Léa » ne filtre pas le verrou) : décidée, lot à part sur le Mac
  (`lot/export-lea-verrouillees`). La phrase de l'étape 8 (« Quand tes évaluations sont faites et verrouillées… ») tient
  aujourd'hui comme consigne ; une fois ce lot sur `main`, elle tiendra aussi comme fait. Aucune correction proposée.

## 1. Le parcours (`js/parcours-recevoir.js`, neuf)

| Étape | Où | Ce qui la fait avancer | Contour |
|---|---|---|---|
| 1 Leurs productions | Évaluation › Préparer | des fichiers dans la file | la zone de dépôt ; bouton « Rien à importer » |
| 2 Vérifie avant d'importer | la même page, « Optimisation » | un fichier neuf en stock pour le groupe actif | le menu « Production », et deux contours en plus : la colonne de droite (« Aperçu »), « Originaux » |
| 3 La liste | Évaluation › Liste | la page d'annotation ouverte, avec un fichier | « Actions… » d'une ligne « Importé », amené dans la vue |
| 4 Tes tampons | la page d'annotation | « Enregistrer » touché dans « Rétroactions — Observations », la fenêtre fermée | l'engrenage de la palette « Tampons », puis « Enregistrer » (la bulle passe au-dessus de la fenêtre) |
| 5 Annoter | la production ouverte | le mode Évaluer | « Annoter ▾ » |
| 6 Évaluer | le mode Évaluer (sans fichier : la Liste, puis l'évaluation) | chaque critère de l'évaluation ouverte avec son niveau ou ses points, trois passages de sonde de suite | le premier critère sans niveau |
| 7 Ta rétroaction | la même page | une évaluation verrouillée qui ne l'était pas à « Commencer » | le cadenas « Verrouiller » |
| 8 Rends tes rétroactions | Évaluation › Exporter, la carte « Export Léa » | « Exporter pour Léa » touché et sa progression à son terme | « Exporter pour Léa » |
| 9 Remets-les | la même page, bulle au centre | « Terminer » | — |

- **La voie et le repère** (`parcoursRecevoir`, une préférence) : la voie, les fichiers et les évaluations verrouillées
  qui existaient à « Commencer ». Des identifiants seulement.
- **Les écrans pleine largeur** (l'import, l'annotation, l'évaluation) sont sans voile, comme au troisième parcours : la
  production entière s'annote ; la bulle s'accroche à ce qu'il faut toucher.
- **La confirmation de l'import** (« Oui, importer ») reste au-dessus de la bulle et des contours (mesuré : par-dessus,
  la bulle couvrait ses boutons).
- **L'étape 6** lit l'évaluation ouverte, rapportée au fichier ouvert, et à l'écran, trois passages de suite : au passage
  en mode Évaluer, les niveaux de la copie précédente restent un instant (mesuré : l'étape avançait sans aucun niveau).
- Le panneau, le moteur, le rappel : rien de plus que ce que le troisième parcours a posé.

## 2. Les vérifications de la consigne (« À vérifier avant de poser les textes »)

Faites par la session H sous Chromium (`RAPPORT-2026-11-09-verifications-parcours-3-a-5.md`) ; tes décisions du 9 nov.
y répondent. Ce que ce lot y ajoute, mesuré par son banc :
- **Étape 1, le ZIP** : refusé sans un mot (seule une trace en console) ; la bulle, qui dit de décompresser, est le seul
  endroit où on l'apprend (session H). **Tient.**
- **Étape 3, « Importé »** : **tient** ; les deux copies importées s'affichent « Importé » (en capitales par la CSS).
- **Étape 4, la palette « Tampons » visible à l'ouverture** : **tient** ; l'engrenage ouvre « Rétroactions —
  Observations », « Enregistrer » la ferme.
- **Étape 6, grille, échelle et cartouche déjà choisies** : **tient** quand la production nomme les trois (ta question
  7) ; vérifié dans le banc sur les deux voies.
- **Étape 7** : tes corrections remplacent la retouche dans le cadre (qui n'arrive pas au PDF) et les descripteurs (vus
  nulle part pendant l'évaluation). Le cadenas tient.
- **Étape 8, l'export et le verrou** : constat de la session H ; ta question 6 l'a tranché (lot à part).
- **L'import de bout en bout** : **tient sous Chromium**, mesuré : trois fichiers déposés, deux copies créées
  (« Basile Baobab – Journal de lecture 1 – 1 page », « Cléo Cormoran – Journal de lecture 1 – 2 pages »), en stock pour
  le groupe, « Importé » dans la Liste.
- **Ta question 9** : l'essai des pages à réunir part de deux photos **sans DA** dans leur nom (`IMG_0001.png`,
  `IMG_0002.png`), cochées, « Réunir en une copie », puis l'étudiante choisie dans l'inspecteur. Les pages au format de
  Léa d'un même élève arrivent déjà réunies (session H).
- **À reporter** (ton relais) : le lot « production plutôt que copie » pourrait renommer « Réunir en une copie » ; la bulle
  2 le cite tel qu'il s'affiche aujourd'hui.

## 3. Les essais

- **Vitest** : `tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js`, 15 essais. Les textes lus à l'exécution,
  comparés à ceux de la consigne avec tes corrections ; chaque correction doit trouver sa phrase dans la consigne ; les
  deux variantes de l'étape 6, la variante sans fichier de l'étape 7 ; les deux voies (9 et 4) ; « Rien à importer »,
  « Terminer », la bulle au centre ; le titre, la ligne et la phrase du refus. Break-test : « choisis « Évaluer » »
  changé en « touche « Évaluer » » → rouge, rétabli. ⚠ Comme celles des parcours 1 à 3, elle lit sa consigne, rangée
  dans `plans de travail/` : la CI ignore ce dossier ; un commit qui ne changerait que la consigne ne la relancerait pas
  (tout changement du code, si).
- **Playwright, Chromium** : `tests/integration/parcours-4-recevoir-et-rendre-2026-11-09.spec.js`, deux essais, chacun
  depuis un espace où le troisième parcours est fait (le banc du troisième, rejoué : `harness/parcours-3-de-banc.js`).
  - La voie des fichiers : le refus mesuré, la production complétée dans sa fiche, les neuf étapes, chaque contour,
    l'étape qui n'avance pas avant la donnée (rien d'importé avant « Importer », trois critères sur quatre), « Plus tard »
    puis un rechargement et « Reprendre » à l'étape 8, le ZIP `Lea_Journal-de-lecture-1_2026-11-10.zip`, le panneau
    « Fait ».
  - La voie sans fichier : « Rien à importer », « 1 sur 4 » à « 4 sur 4 », la deuxième phrase de l'étape 7, « Étape 3 sur
    4 » au panneau, « Refaire » qui repart de la voie retenue.
  - **2 sur 2 verts.** Break-test : la garde des trois passages retirée de l'étape 6 → **rouge** (l'étape avançait sans
    niveau), rétablie.
- Le banc reporte le rappel « Mets ton codex à jour » comme le fait une mise à jour du codex : il s'ouvrait entre le
  troisième et le quatrième parcours (voulu), à un moment variable.

## 4. Hypothèses que j'ai prises seul (à corriger en dix secondes si elles sont fausses)

- La production de la condition se cherche parmi celles du cours du groupe-cours actif (`obtenirDonneesSelonMode`) ; un
  service d'orthopédagogie ne compte pas.
- « Commencer » ouvre toujours la bulle 1 (avec ses deux voies) ; « Reprendre » et « Refaire », la voie retenue.
- L'étape 8 avance quand l'export touché arrive au bout de sa progression (« n/n fichiers traités ») ; le téléchargement
  suit dans la même seconde.
- Sur la voie sans fichier, « Plus tard » de la bulle 3 (l'export) dit « Étape 3 sur 4 ».

## 5. À inscrire au BACKLOG

Rien de neuf qui soit un symptôme vécu. Les trouvailles de la session H sur ce parcours (le nom du PDF sans DA en
anonymisation, le menu « Étudiant·e » de l'export Léa qui ne liste que les élèves avec un fichier, le bandeau de la démo
qui dit « Actions ▾ ») sont dans son rapport ; je ne les répète pas.

## 6. Captures (Chromium, 1180 px, sombre)

`plans de travail/captures-2026-11-09-parcours-4-recevoir-et-rendre/`, prises par le banc :
- le panneau : `panneau-1180-sombre-sans-production-prete` (le refus, question 1), `-a-faire`, `-en-cours` (« Étape 8
  sur 9 »), `-fait` ; et pour la voie sans fichier, `…-sans-fichier-en-cours` (« Étape 3 sur 4 ») ;
- chaque étape : `p4-1` (la zone), `p4-2` (les trois contours), `p4-2-reunies`, `p4-2-confirmation`, `p4-3` (la Liste),
  `p4-4` (l'engrenage) et `p4-4-fenetre`, `p4-5`, `p4-6`, `p4-7`, `p4-8`, `p4-9` (au centre) ; la voie sans fichier :
  `p4-6-…-sans-fichier`, `p4-7-…-sans-fichier`.

## 7. Relecture par un agent neuf

Voir la section 8 (ajoutée après la relecture).
