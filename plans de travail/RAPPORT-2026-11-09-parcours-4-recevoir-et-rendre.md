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
- « Plus tard » sur chaque bulle sauf la dernière ; « Reprendre » relit la voie et l'étape, même après un rechargement :
  aux étapes 4 à 7, la production ouverte à l'étape 3 se rouvre (en mode Évaluer aux étapes 6 et 7), et la palette
  « Tampons » revient si tu l'avais masquée (corrigé après la relecture neuve, section 8).
- Le rappel « Mets ton codex à jour » ne s'ouvre pas en plein parcours (le code du troisième, qui est celui du sixième) ;
  il s'ouvre après, comme prévu.
- Tes corrections du 9 nov. sont posées mot pour mot (étape 5 : « Annoter ▾ », puis « Évaluer » ; étape 7 : « Un mot
  pour ton étudiant·e » et la cartouche précise). Une sentinelle Vitest les exige.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

**Les quatre sont tranchées** (Grégoire, 9 nov., 13 h 37 pour l'échelle, puis 15 h 55 à 16 h 00 pour le reste, en
Cowork) ; chaque question garde son texte, suivi de la décision et de ce qui en est fait.

1. **Le troisième parcours ne mène pas au quatrième** (mesuré). À la sortie du troisième, la production ne nomme que sa
   grille : ni échelle ni cartouche. Le quatrième refuse alors, et sa phrase renvoie… au troisième, déjà « Fait »
   (capture `panneau-…-sans-production-prete`). *Recommandation :* que le troisième parcours fasse nommer à la production
   son échelle (étape 2) et sa cartouche (étape 8), ce qui demande deux phrases à valider (proposées au rapport du
   troisième, question 2, et ici : à l'étape 8 du troisième, « Puis, dans la fiche de ta production, choisis cette
   cartouche : elle s'y appliquera à chaque évaluation. »). *À défaut,* revenir à la condition de la consigne (la grille
   seule) avec les phrases de la session H à l'étape 6 (« … déjà choisies si ta production les nomme ; sinon,
   choisis-les. »). Le banc, lui, donne à la production son échelle et sa cartouche dans sa fiche avant de commencer.
   → **À moitié tranché** (Grégoire, 9 nov., 13 h 37, sur la question 2 du troisième) : la production du troisième
   parcours porte maintenant son **échelle** (étape 2). Mesuré par le banc, remis sur le troisième : à sa sortie, la
   production nomme sa grille et son échelle, pas sa cartouche ; le quatrième refuse encore, pour la cartouche seule.
   **Reste à trancher : la cartouche** (la phrase proposée ci-dessus pour l'étape 8 du troisième, ou la condition
   allégée). → **Tranché à 15 h 55** : la phrase proposée est posée à la fin de l'étape 8 du troisième, mot pour mot ;
   son étape avance quand la cartouche est enregistrée **et** nommée par la production. À la sortie du troisième, la
   production nomme sa grille, son échelle et sa cartouche : **le quatrième démarre**. Essayé de bout en bout : le banc
   joue le troisième, puis le quatrième, sans rien préparer à la main. Le refus (une production qui ne nomme que sa
   grille) a son propre essai, avec une production posée pour l'essai, et la sentinelle le tient champ par champ.
2. **Étape 2, « À droite… s'il manque un nom, choisis-le »** : tient en partie. La colonne de droite s'intitule
   « Aperçu » ; elle montre l'étudiant·e trouvé·e, mais un nom manquant se choisit **au centre**, dans l'inspecteur,
   après avoir touché le fichier (mesuré : c'est là que le banc choisit l'étudiante des deux photos). *Proposée :*
   « … s'il manque un nom, touche le fichier et choisis-le au centre. » → **Validé, posé** ; la sentinelle l'exige.
3. **Étape 4, les emojis** (la consigne demande la phrase qui les nommerait, sans toucher le texte) : *proposée :*
   « … réécris les autres, change leur image ou tape un emoji à sa place, ou crée tes propres tampons, … » (le champ de la
   fenêtre s'appelle « ou un emoji », d'après les Nouvelles de la 1.237.0). → **Validé dans une autre forme, posé** :
   « … réécris les autres, change leur image (ou mets un emoji à sa place), ou crée tes propres tampons… » ; la
   sentinelle l'exige.
4. **Étape 2, la bulle et l'inspecteur, à juger sur la capture `p4-2-…`** : sur cette page pleine largeur, sans voile, la
   bulle s'accroche au menu « Production » et couvre une partie de l'inspecteur, là où l'on choisit l'étudiant·e.
   *Recommandation :* garder ainsi pour l'instant ; une bulle repliable serait un lot du moteur. → **Tranché autrement**
   : la bulle ne couvre ni l'Inspecteur, ni les Originaux, ni l'Aperçu ; elle se pose **sous les trois colonnes**, sans
   refondre le moteur. Le moyen, comme à l'étape 3 du sixième parcours : l'étape donne au moteur pour zones les colonnes
   et « Importer », élargit la bulle à leur largeur (elle en devient basse : 235 px au lieu de 409), et laisse à la page
   la place de défiler sous elles (elle était au bout de sa course, mesuré). Le moteur cadre l'ensemble à l'entrée de
   l'étape. Mesuré et essayé à **1180 × 900** (colonnes côte à côte, la bulle sous « Importer », à leur largeur) et à
   **820 × 1180** (colonnes empilées : la bulle sous « Importer », après l'Aperçu ; le haut des Originaux défile
   au-dessus de l'écran, sans être couvert). Captures `p4-2-1180-sombre` et `p4-2-820-sombre`. *À savoir :* la bulle
   couvre maintenant le message placé sous « Importer » (« 2 fichiers ne sont associés à aucune production… ») ;
   j'infère de son texte, sans l'avoir mesuré, qu'il s'en va une fois la production choisie en haut de l'Inspecteur.

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
  Observations », « Enregistrer » la ferme. Masquée par son bouton, elle n'existe plus et ne revenait pas : l'étape la
  réaffiche maintenant (« affiche-la si elle est masquée », section 8).
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
- **À reporter** (ton relais, rappelé le 9 nov. à 15 h 55) : « Réunir en une copie » deviendra « Réunir en une
  production » à la fusion avec `lot/production-plutot-que-copie` ; la bulle 2 le cite tel qu'il s'affiche aujourd'hui,
  et sa sentinelle le lit dans la consigne : les deux changeront ensemble.

## 3. Les essais

- **Vitest** : `tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js`, 21 essais (15, puis 6 après la relecture :
  la condition de la question 7 champ par champ, la garde de l'étape 6 qui repart de zéro, section 8). Après 15 h 55,
  les phrases des étapes 2 et 4 entrent dans ses corrections ; break-test, l'étape 2 remise à l'ancienne → rouge.
- **Playwright, après 15 h 55** : quatre essais. Le bout en bout part du troisième parcours joué entier, sans rien
  préparer : la production nomme sa grille, son échelle et sa cartouche, et « Commencer » lance le quatrième. À l'étape
  2, la bulle ne couvre ni les Originaux, ni l'Inspecteur, ni l'Aperçu, ni « Importer », et son haut est sous eux : à
  1180 × 900 (l'essai des fichiers) et à 820 × 1180 (un essai à part). Le refus a son essai (une production posée pour
  lui, qui ne nomme que sa grille). **4 sur 4 verts.** Break-tests : les zones remises au seul menu « Production » →
  rouge (l'Originaux couvert) ; la place sous les colonnes retirée → rouge (la bulle remonte sur elles) ; la bulle
  remise à 380 px → rouge (l'Inspecteur couvert) ; rétablis. Un cas pour les colonnes empilées, que j'avais écrit, est
  retiré : les essais ne le départageaient pas (le moteur cadre déjà l'ensemble à 820 px). Les textes lus à l'exécution,
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
    puis un rechargement et « Reprendre » à l'étape 4 (palette masquée) et à l'étape 8, le ZIP `Lea_Journal-de-lecture-1_2026-11-10.zip`, le panneau
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
- L'étape 8 avance quand l'export Léa a **téléchargé** au moins un PDF : l'export le dit maintenant par un événement
  (`travaux-export-lea-telecharge`, `js/travaux-archivage.js`), émis après le téléchargement. Si tous les PDF échouent,
  la bulle reste à l'étape 8 (section 8, réserve 4).
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
  `p4-4` (l'engrenage), `p4-4-reprise` (après « Plus tard », rechargement et « Reprendre ») et `p4-4-fenetre`, `p4-5`, `p4-6`, `p4-7`, `p4-8`, `p4-9` (au centre) ; la voie sans fichier :
  `p4-6-…-sans-fichier`, `p4-7-…-sans-fichier`.

## 7. Relecture par un agent neuf

Voir la section 8 (ajoutée après la relecture).

## 8. Relecture par un agent neuf (9 nov.), et ce que j'en ai fait

Verdict de l'agent : **« À reprendre »**. Il a rejoué la sentinelle (15/15) et le banc (2/2), et confirmé le break-test
de la garde des trois passages. Ses propres break-tests ont trouvé deux trous dans les bancs (réserve 5). Chaque
réserve, et ce qu'elle est devenue :

1. **L'étape 4 bloquait à la reprise** (mesuré par lui) : « Plus tard » à l'étape 4, rechargement, « Reprendre », et
   l'on arrivait sur l'Accueil sous un voile plein, sans rien à toucher sauf « Plus tard ». Les étapes 5 à 7 n'avaient
   pas non plus de quoi replacer la page. La palette « Tampons » masquée ne revenait pas (« affiche-la si elle est
   masquée », la consigne). → **Corrigé** : l'étape 3 retient le fichier ouvert (`fichierId`) ; les étapes 4 à 7 le
   rouvrent comme « Actions › Annoter » (`ouvrirAnnotationDepuisListe`), puis passent en mode Évaluer aux étapes 6 et 7.
   L'étape 4 réaffiche la palette masquée par son propre bouton (`togglePaletteAutocollants`). Sans palette à éclairer,
   elle ne pose plus de voile. Le banc le joue : palette masquée, « Plus tard », rechargement, « Reprendre », puis la
   bulle 4, la page d'annotation, la palette et le contour sur l'engrenage. Break-test : la réouverture retirée →
   **rouge**, rétablie.
2. **La garde des trois passages ne repartait pas de zéro** (son compte vivait le temps de la page : « Refaire » sans
   recharger laissait avancer l'étape 6 dès la première sonde). → **Corrigé** : la garde se remet à zéro à l'entrée de
   chacune des deux étapes 6. Un essai Vitest le tient sur les deux voies (trois sondes à la première entrée, trois à
   la suivante). Break-test : la remise à zéro retirée → **rouge** (les deux voies), rétablie.
3. **La voie sans fichier n'a pas de retour** : une fois « Rien à importer » touché, « Reprendre » et « Refaire »
   relancent les quatre étapes. → **Refusé, motif** : c'est la lettre de la consigne (« Le parcours retient la voie
   choisie, pour « Reprendre » comme pour « Refaire » »). L'observation reste juste : qui a touché « Rien à importer »
   par erreur ne retrouve plus les neuf étapes depuis le panneau. *À trancher par toi ou Cowork*, si ça compte : que
   « Refaire » rouvre la bulle 1 (avec ses deux voies), « Reprendre » gardant la voie.
4. **L'étape 8 pouvait avancer sans téléchargement** : la barre « n/n fichiers traités » se remplit aussi quand tous les
   PDF échouent. → **Corrigé** : l'export Léa émet `travaux-export-lea-telecharge` après le téléchargement (une ligne,
   `js/travaux-archivage.js`) ; l'étape 8 n'avance que sur lui, avec au moins un fichier. Break-test : l'événement retiré
   → **rouge** (la bulle reste à l'étape 8 après le ZIP), rétabli.
5. **Les bancs ne tenaient pas la question 7, ni le compte « quatre »** : retirer l'exigence de cartouche ou d'échelle
   laissait tout vert ; le compte du panneau se comparait au registre. → **Corrigé** : la condition est essayée champ
   par champ en Vitest (sans grille, sans échelle, sans cartouche : le refus ; les trois : le lancement). Le banc lit
   l'ordre du panneau rendu : « Découvrir », « Mettre ta classe en place », « Évaluer une première production »,
   « Recevoir… » en quatrième. « Reprendre » est maintenant essayé aux étapes 4 et 8. *Non repris :* la garde « le fichier
   ouvert est celui de l'évaluation » (`evaluationDuFichierOuvert`) reste sans essai qui la départage : le banc n'ouvre
   qu'une production avant l'étape 6. Inscrit ici, pas au BACKLOG (aucun symptôme vécu).
6. **`productionId` écrit, jamais lu** → **corrigé** (mon lot) : il est maintenant lu, avec `fichierId`, par la reprise
   des étapes 4 à 7, et n'est plus écrit à l'import.

**Les affirmations du rapport que le code ne soutenait pas** ont été réécrites : la reprise « même après un
rechargement » (vraie maintenant aux étapes 4 à 8, essayée aux étapes 4 et 8), « palette visible à l'ouverture » (elle
revient aussi si on l'a masquée) et l'export (« téléchargé », plus « dans la même seconde »).

