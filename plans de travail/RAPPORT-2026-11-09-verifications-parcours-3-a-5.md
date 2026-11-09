# Rapport : vérifications des parcours 3, 4 et 5, avant de poser leurs textes (session H, nuit du 8 au 9 nov. 2026)

Plan de la nuit (`plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md`), section H, **étape 4** : la session D
n'a pas dit « Codé » (première ligne de son rapport sur `origin/lot/completion-suit-la-remise` : « En cours : la mesure
est faite et poussée, le code suit », inchangée de 23 h 06 à 2 h 29 au moins), donc pas de troisième parcours cette
nuit, et pas de quatrième ni de cinquième. À la place, chaque affirmation des sections « À VÉRIFIER AVANT DE POSER LES
TEXTES » des consignes 3, 4 et 5, confrontée au code : « tient », « ne tient pas », « tient en partie » ou « non
vérifiable ici », avec le fichier et la ligne, et la phrase corrigée proposée quand une phrase validée ne tient pas.
**Aucun code.** Branche `mesure/verifications-parcours-3-a-5`, partie de `lot/parcours-2-ma-classe`.

Mesuré sous **Chromium** (Playwright, horloge au 10 nov. 2026) par trois sous-agents, un par consigne, sur des espaces
vierges ou la démo ; rien n'a été écrit dans le dépôt par eux. J'ai recontrôlé moi-même, dans le code, les quatre
constats qui font revoir une phrase validée de poids (la « somme » de l'étape 5 et le « trois » de l'étape 6 du
parcours 3 ; la retouche qui n'arrive pas au PDF et l'export qui ne filtre pas le verrou, au parcours 4) : ils
tiennent. WebKit, l'iPad et tes données : non vérifiables ici.

## En tête, en gestes

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

**Parcours 3 — « Évaluer une première production »**
1. Étape 4 : « une rétroaction s'écrit sous tes yeux, tirée de ta grille » ne tient que pour une grille en points ;
   pour une grille à niveaux, la rétroaction ne porte que le code du niveau (« — S »). *Recommandation : « …et une
   rétroaction s'écrit sous tes yeux : chaque critère de ta grille, avec ce que tu lui attribues. »*
2. Étape 5 : le « Modèle sommatif » fait la **moyenne** pondérée des travaux évalués, pas leur somme (le Récapitulatif
   dit lui-même « moyenne pondérée »). *Recommandation : « …si la note du cours est la moyenne de tes travaux selon leur
   pondération. »* Et le geste d'entrée manque : « + Nouvelle pratique », puis « Partir d'un modèle ».
3. Étape 6 : « elle attend trois productions évaluées, le minimum pour dire si un·e étudiant·e progresse » ne tient
   pas : sans pratique appliquée, **aucune** note ne se calcule ; le « trois » est le seuil d'attente de la bande du
   groupe. *Recommandation : « Sans pratique appliquée, l'application ne sait pas comment tu construis ta note : elle
   n'en calcule aucune. »*
4. Étape 9 : il faut **déverrouiller** avant de choisir la cartouche ; une évaluation verrouillée ne se met pas à jour
   d'elle-même. *Recommandation : « Reviens à ta première évaluation : touche « Actions › Consulter », puis
   « Déverrouiller ». Choisis ta cartouche : … »*

**Parcours 4 — « Recevoir les productions, rendre tes rétroactions »**
5. Étape 7 : **une retouche faite dans le cadre de la rétroaction n'arrive pas au PDF** de l'étudiant·e (la synthèse
   l'écarte exprès) ; et les descripteurs par niveau de la grille ne sont visibles nulle part pendant l'évaluation.
   Deux voies : changer la phrase (« pour changer une phrase, change-la dans ta cartouche ou dans tes tampons »), ou
   faire arriver la retouche au PDF (un changement de comportement). *Recommandation : décider du comportement d'abord ;
   la phrase suivra. La phrase sur les descripteurs devient « Plus ta cartouche est précise, plus ton étudiant·e
   comprend ce que tu as constaté dans sa production. »*
6. Étape 8 : **« Exporter pour Léa » envoie aussi une évaluation non verrouillée** (mesuré : son PDF est dans le ZIP).
   Constat seulement, rien changé : c'est ce qui part chez les étudiant·es. *Recommandation : n'exporter que les
   évaluations verrouillées, et dire au compteur combien sont laissées de côté.*
7. Étape 6 : grille, échelle et cartouche ne sont « déjà choisies » que si la production les nomme toutes les trois ;
   la condition d'entrée du panneau (« une production avec sa grille ») laisse passer une production sans échelle ni
   cartouche. *Recommandation : exiger les trois dans la condition du panneau, et garder la phrase validée.*
8. Étape 5 : le bouton au-dessus de la production s'appelle « Annoter ▾ » (puis « Évaluer ▾ »), jamais « Actions ».
   *Recommandation : « Quand tu as fini, touche le menu « Annoter », au-dessus de la production, puis « Évaluer ». »*
9. Étape 2 et la livraison : des pages au format Léa d'un même élève arrivent **déjà réunies** ; « Réunir en une
   copie » ne sert qu'aux fichiers sans DA dans le nom. La phrase tient pour ce cas ; le test prévu (« une production en
   deux pages à réunir ») devra partir de noms sans DA.

**Parcours 5 — « Monter ton cours »**
10. Étapes 2 et 3 : **les cercles d'attache font 12 px**, sans agrandissement au toucher (le seul est au survol) ; en
    Chromium tactile, la zone utile est de ±6 px, quand le projet exige 44 px. Sur l'iPad, tirer un lien au doigt
    risque d'être pénible. *Recommandation : sous `pointer: coarse`, une zone sensible de 44 px tournée vers
    l'extérieur du bloc (le dessin ne change pas), et de même pour la poignée ⠿ ; à éprouver sur l'iPad avant de poser
    les bulles.*
11. Étapes 2 et 3 : les mots du lien s'affichent en minuscules sur le trait. *Recommandation : « « se décline en »
    s'affiche » et « « se concrétise dans » apparaît ».*
12. Étapes 5 et 6 : un bloc se glisse **par sa poignée ⠿**, pas par son titre (le titre s'édite) ; le double toucher
    aussi part de la poignée. *Recommandation : « …puis glisse le bloc dans ta leçon par sa poignée ⠿. Touche deux fois
    cette poignée : dans l'Inspecteur, coche… »*
13. Étape 4 : **la pastille « ! » n'apparaît pas** quand on quitte le champ après avoir écrit le premier objectif ;
    elle vient avec Entrée ou à la reconstruction suivante. *Recommandation : corriger le code (reconstruire quand la
    ligne d'accueil devient un objectif) plutôt que la phrase ; à défaut, « …t'y aide ; termine par Entrée. »*
14. Étape 6 : la phrase tient, mais l'affirmation de la consigne « le bloc affiche la pondération de la production »
    ne tient pas : le poids n'est que dans l'option du menu « Production ». *Recommandation : rien à changer dans la
    bulle.*
15. Étape 7 : « Recentrer la carte » et « Tout voir » sont dans « Vue ▾ », pas dans « Actions » ; les autres libellés
    tiennent. La bulle ne les nomme pas : rien à changer.
16. **À 390 px, la carte n'est pas utilisable** (barre qui se chevauche, frise rognée, palettes qui couvrent le
    canevas, bloc créé sous la palette). *Recommandation : ne pas proposer ce parcours sur un téléphone, ou le dire dans
    le panneau ; le texte serait à valider.*
17. Le lot « Deux liens vers la carte d'alignement » n'est pas fait (sa branche ne porte que la mesure) : les étapes 1
    et 4 tiennent aujourd'hui ; s'il est accepté, leurs deux phrases seront à revoir.

### Ce que je n'ai pas pu vérifier ici
- WebKit, l'iPad au doigt (les cercles d'attache, le double toucher, le glisser d'un bloc, le clavier qui s'ouvre ou non
  sur le titre d'un bloc créé) : à mesurer sur le Mac.
- Tes données réelles (les cas de stock du parcours 4, étape 6) : à mesurer sur le Mac.

## 1. Parcours 3 — Évaluer une première production

Mesuré le 9 nov. 2026 dans **Chromium** (Playwright, horloge au 10 nov.), sur un espace vierge : le Cadre fait à l'interface (trois étudiant·es fictifs), la grille créée dans Mon matériel depuis « Essayer l'exemple » (« Journal de lecture », 4 critères, sur 30), une fois « des points » et une fois « des niveaux », puis une production à 20 %. Les scripts de mesure sont restés dans le nuage (non gardés, BOUCLE-SANS-RELAIS § 4 point 3). WebKit et données réelles : à mesurer sur le Mac.

### Étape 4 : la rétroaction sans cartouche, « Actions › Évaluer », « Verrouiller »
- **« Actions › Évaluer » sans import : tient.** Chaque ligne d'Évaluation › Liste a un menu « Actions... » qui offre « Évaluer » (`js/liste-evaluations.js:1753`). Le formulaire s'ouvre sans copie, avec l'étudiant·e et la production déjà choisis et le statut « Reçu » (`js/evaluation.js:238-280`).
- **« Verrouiller » : tient.** Le bouton du panneau Paramètres dit « Verrouiller ». Il enregistre l'évaluation (`verrouillee: true`) et devient « Déverrouiller ». Pour la rouvrir, la ligne n'offre plus « Évaluer » : elle offre « Consulter », et l'évaluation s'y déverrouille.
- **« une rétroaction s'écrit sous tes yeux, tirée de ta grille » : tient en partie.** Mesuré sans cartouche :
  - **Grille en points : tient.** Sous chaque critère, on lit « Critère 1 (Partie A : compréhension – L'étudiant·e résume l'œuvre avec justesse) — 4 / 5 », puis le texte de la tranche atteinte, tiré de la grille (« Résume l'essentiel »). Le texte finit par « Note finale : 76,7 % ».
  - **Grille à niveaux : ne tient pas.** On lit seulement « Critère 1 (…) — I », « — P », « — S », « — R », soit le nom du critère et le **code** du niveau. Les descripteurs que la grille enregistre (`descripteurs.parNiveau`) n'y entrent pas : seul un commentaire enregistré ou une cartouche fournit un texte (`js/evaluation-retroaction.js:158-204`). Le texte finit par « Note finale : 73,8 % | Niveau : S ».
  - **Phrase proposée** : « …la note se calcule à mesure, et une rétroaction s'écrit sous tes yeux : chaque critère de ta grille, avec ce que tu lui attribues. Tu y mettras bientôt tes propres mots. »

### Étape 5 : « Partir d'un modèle », les modèles, « Décrire ma pratique »
- **« Partir d'un modèle » : tient, mais un geste manque.** C'est le premier écran de l'assistant, et l'assistant s'ouvre par « + Nouvelle pratique » (`js/pratiques.js:863-870` ; `js/wizard-pratique-v2.js:151-176`). Les gestes mesurés : « + Nouvelle pratique », « Partir d'un modèle », « Suivant → », le modèle, « Suivant → », le Récapitulatif, puis « Créer la pratique ».
- **Les modèles, noms exacts à l'écran : tient.** L'écran montre « N plus récentes » (STD · Général), « N meilleures évaluations » (STD · Général), « Modèle sommatif » (SOM · Général), « Modèle simple » (SPE · Général) et « Modèle de base » (DEN · Général) (`js/pratiques-bibliotheque.js:41-200`). Les deux modèles nommés sont bien de type standards. Les spécifications et la dénotation ont chacune un modèle. L'écran ne montre que les codes STD, SPE et DEN, jamais les mots « standards », « spécifications », « dénotation ».
- **« la somme de tes travaux selon leur pondération » : ne tient pas.** Mesuré : après une seule évaluation à 76,7 % d'une production à 20 %, P vaut 77 %. Ce n'est pas une somme (une somme donnerait 15,3) : c'est la moyenne pondérée des travaux évalués (`js/pratiques/pratique-sommative.js:96-115`). Le Récapitulatif dit lui aussi « moyenne pondérée ». Les deux ne coïncident qu'en fin de trimestre, si les pondérations font 100.
- **« Décrire ma pratique » : tient.** Sa carte dit « Réponds à quelques questions sur ta façon de noter. L'assistant identifie le type qui te correspond. » Il ouvre sur « Comment calcules-tu la note finale ? » (quatre choix), et le Récapitulatif conclut « identifiée comme SOM ».
- **« La note que tu viens d'attribuer ne changera pas » : tient.** La note vaut 76,67 avant la création de la pratique, après la création et après l'application. Le Récapitulatif le dit aussi : « Ta pratique active n'est pas modifiée ».
- **Phrases proposées** : « Touche « + Nouvelle pratique », puis « Partir d'un modèle », et choisis le tien : « Modèle sommatif » si la note du cours est la **moyenne** de tes travaux selon leur pondération. »

### Étape 6 : l'appliquer, plusieurs cours, le partage, le « trois »
- **« Aucune pratique ouverte » après « Créer la pratique » : tient.** Le menu montre cette option grisée, choisie, et l'accueil dit « Choisis une pratique dans le menu ou crée une nouvelle pratique ». Le groupe-cours reste sans pratique (`pratiqueId: null`).
- **Les gestes : tiennent.** Le menu est dans la rangée en haut de la page. Y choisir « Modèle sommatif » ouvre sa fiche. « Appliquer au cours actif » est **au pied** de la fiche : à y ≈ 1 867 px pour une fenêtre de 900 px à 1180 px de large, il faut donc défiler. Toucher l'étape « Groupe-cours » de la chaîne y descend (`js/pratiques-gestion.js:1161`). Après le geste, une notification dit « Pratique appliquée au cours actif » et le menu affiche « Modèle sommatif (active) ».
- **Plusieurs cours : tient.** Mesuré avec un second cours (601-102-MQ) et son groupe-cours : on bascule de groupe-cours par le menu de l'en-tête, la même pratique est dans le menu, et « Appliquer » donne la même pratique aux deux groupes-cours. Cela vaut pour les groupes-cours d'un même trimestre (`cle('pratiquesConfigurables')`). Pour un autre trimestre, la pratique se copie par l'import depuis un trimestre (`js/pratiques-gestion.js:686-720`) : c'est une inférence, non mesurée.
- **« Partage entre collègues » : tient.** La carte « Partage entre collègues (fichiers .lcz signés) » de Réglages › Données nomme la « pratique de notation » (`index.html:9378`). L'aller-retour est mesuré : Bibliothèque, menu ⋮, « Exporter pour partager », « Exporter (.lcz) » produit le fichier. Dans un autre espace vierge, cette carte demande « Importer ce package ? », « Importer » le fait entrer, et la pratique paraît sous « Partagés par des collègues ».
- **« elle attend trois productions évaluées, le minimum pour dire si un·e étudiant·e progresse » : ne tient pas.**
  - Mesuré sans pratique : la bande P dit « 2 évaluations en attente » après une évaluation, puis « 1 évaluation en attente » après deux. Après trois, elle n'affiche **rien** : ni point, ni message. Les indices restent `noteConstructible: false`, `pratiqueActive: "aucune"`. Sans pratique, aucune note ne se calcule (`js/pratiques/pratique-registre.js:419-420`).
  - Le « trois » est le seuil d'attente du **groupe** dans la bande (`js/tableau-bord-apercu.js:1823-1828`) : le `minimumCompletion` de la pratique, sinon celui des modalités, sinon 3. Il n'a rien à voir avec la progression.
  - Avec « Modèle sommatif » appliqué, le point s'allume à 77 % dès la première évaluation.
  - Le seul « 3 » lié à la progression est la tendance d'une sommative (`js/pratiques/pratique-sommative.js:781-789`), qui n'existe qu'avec une pratique appliquée (inférence, non mesurée).
- **Phrase proposée** : « Sans pratique appliquée, l'application ne sait pas comment tu construis ta note : elle n'en calcule aucune. »

### Étape 9 : la cartouche sur une évaluation verrouillée
- **L'évaluation verrouillée ne se met pas à jour d'elle-même.** Après la création d'une cartouche de 16 commentaires, la rétroaction enregistrée est identique à l'octet et `cartoucheId` reste vide ; « Consulter » montre l'ancien texte. La synthèse lit la cartouche de l'évaluation, et non celle de la grille (`js/synthese-retroaction-data.js:92`, `1760-1761`).
- **Il faut déverrouiller.** Tant que l'évaluation est verrouillée, le menu « Cartouche de rétroaction : » du panneau Paramètres (`index.html:8282-8288`) et la rétroaction sont grisés (`js/evaluation.js:2261-2318`).
- **Les gestes mesurés (grille à niveaux)** :
  - « Actions... », « Consulter », puis « Déverrouiller ».
  - Dans « Cartouche de rétroaction : », choisir la cartouche : la rétroaction se réécrit aussitôt (« — I », suivi du commentaire). Aucune question ici, parce que l'évaluation n'avait aucun commentaire enregistré. Avec des commentaires, une fenêtre « Changer de cartouche » propose « Remplacer » ou « Garder les commentaires actuels » (`js/evaluation-chargement.js:1621-1628`).
  - « Verrouiller » : l'évaluation est enregistrée avec la cartouche et ses commentaires.
  - Entre « Déverrouiller » et « Verrouiller », l'évaluation sort de la note (`js/evaluation.js:2121-2122`).
- **Grille en points** : les mêmes gestes ne réécrivent rien. C'est le défaut de la consigne, reproduit ici.
- **« Désormais, chaque production que tu évalueras recevra la sienne » : tient pour la même production.** Mesuré : pour l'étudiant·e suivant·e, la cartouche est déjà choisie (`js/evaluation-chargement.js:667-686`). Elle ne l'est pas, par inférence, pour une autre production si sa fiche ne la porte pas, ni quand les évaluations déjà faites n'ont pas toutes la même cartouche.
- **Phrase proposée** : « Reviens à ta première évaluation : touche « Actions › Consulter », puis « Déverrouiller ». Choisis ta cartouche : la rétroaction se réécrit avec tes phrases. … »

**Trouvailles hors de ces quatre** (issue proposée pour chacune) :
1. **À inscrire.** Sur un espace vierge, ni l'« Échelle de départ (IDME) » ni la grille de départ n'existent avant un rechargement. Mesuré : aucune échelle après le Cadre, `ECHELLE_IDME_DEPART` après rechargement. La cause : la création du **premier** trimestre ne sème pas le matériel de départ (`js/trimestre-v2-init.js:387-391`) ; seule la bascule le sème (`js/trimestre-v2-liste.js:353-359`, `492`). Conséquence sur l'étape 8 d'une grille en points, dans la même séance que le deuxième parcours : la cartouche n'a aucune échelle à offrir.
2. **À inscrire.** Le Récapitulatif dit « celle-ci s'ajoute à ta bibliothèque » (`js/wizard-pratique-v2.js:2033`). Or la pratique va dans « Dans ce trimestre », et la bibliothèque « pour tous tes trimestres » reste vide (`bibliothequePratiques: []`).
3. **Complète l'item déjà prévu.** La bande C dit « tendance très forte… (r(C↔P) = 1,000) » dès **une** évaluation (trois étudiant·es) : cela complète l'item r = 0,996 que la consigne inscrit au backlog.
4. **À commenter et oublier.** `console.error("❌ Aucune échelle de performance configurée")` apparaît à chaque évaluation en points dans un espace sans échelle (`js/evaluation-chargement.js:296`). Rien n'en est visible à l'écran.

## 2. Parcours 4 — Recevoir les productions, rendre tes rétroactions

Mesures faites le 9 nov. 2026 dans Playwright **Chromium** (1180 × 900, horloge au 10 nov.), dans l'espace de démonstration, **sans doublure du stockage** (vraie IndexedDB), sur l'arbre de `mesure/verifications-parcours-3-a-5` (5310c3b1). Dans le navigateur du banc seulement, j'ai ajouté des productions de test : « Analyse 1 », avec grille, échelle et cartouche, sans évaluation, et les variantes nommées plus bas. Les élèves sont ceux de la démo. Les scripts de mesure sont restés dans le nuage (non gardés, BOUCLE-SANS-RELAIS § 4 point 3). Safari et iPad : non vérifiables ici.

### Étape 1 : la zone de dépôt et le ZIP — **tient** (mais le refus est muet)
- Mesuré : un ZIP déposé n'entre pas dans la file (0 fichier), qu'il passe par le sélecteur ou par un vrai `drop` sur `#travaux-drop-zone`. **L'écran ne change pas d'un caractère : aucun message, aucune fenêtre.** La seule trace est un `console.warn « Type refuse »` (`js/travaux-import.js:745`). Témoin : le PDF contenu dans ce ZIP, déposé seul, entre bien (1 fichier).
- Les types acceptés : PDF, JPEG, PNG, HEIC, HEIF, WebP (`travaux-import.js:20-29`, contrôle `estTypeAccepte` l. 519). Le sélecteur porte `accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp"`. Inférence : dans un vrai dialogue, un .zip est grisé (Playwright, lui, ignore `accept`).
- Le libellé lu sous la zone dans Chromium est « PDF, JPEG, PNG — ou clique pour parcourir ». HEIC ne s'y ajoute que si `HeicDecodeur.decodagePossible()` est vrai (`travaux-ui.js:884-888`), ce qui n'est pas le cas dans Chromium.
- La bulle (« décompresse-les si elles arrivent en ZIP ») tient : aucune retouche proposée. C'est le seul endroit où l'utilisateur l'apprendra, puisqu'un ZIP déposé ne produit rien à l'écran.

### Étape 3 : « Importé », « Non reçu », Réassigner, Annoter — **tient**
- Mesuré dans la Liste après l'import : DEMO004 et DEMO006 × Analyse 1 sont « IMPORTÉ » ; un élève sans fichier est « NON REÇU ». Les libellés sont `Importé` et `Non reçu` (`js/liste-evaluations.js:140-142`), mis en capitales par la CSS.
- Mesuré, menu « Actions… » d'une ligne Importé : Évaluer, Annoter, Modifier, Renommer, Transférer, Réassigner, Supprimer. Sur une ligne Non reçu : Évaluer seulement (`liste-evaluations.js:1740-1823`). Lu dans le code : « Réassigner » ouvre « Propriétés », où l'on choisit l'élève et la production (l. 1882-1883).
- Limite sans effet sur la bulle : « Importé » ne dure que jusqu'à la première annotation (le statut devient « Annoté », l. 79-84) ou la première évaluation (« Non verrouillée »).

### Étape 4 : la palette « Tampons » et son engrenage — **tient**
- Mesuré à l'ouverture par « Actions › Annoter » : `#travaux-palette-tampons` est affichée, ouverte d'office (`js/travaux-ui.js:636-643`), en bas à droite (x 958, y 748, 200 × 386 à 1180 × 900). L'en-tête et l'engrenage sont dans l'écran ; le bas de la palette est sous le pli.
- L'engrenage a `title="Personnaliser"` (`travaux-outils.js:523`) et ouvre la fenêtre « Rétroactions — Observations » (l. 2918). Ses boutons : « + Ajouter une catégorie », « + Ajouter », « Exporter mes tampons », « Importer des tampons », « Réinitialiser », « Annuler », « Enregistrer » (l. 3064). Mesuré : « Enregistrer » ferme la fenêtre.

### Étape 6 : grille, échelle et cartouche déjà choisies — **tient en partie**
- **Tient**, mesuré sur les deux voies, pour une production qui nomme ses trois pièces. Avec fichier (DEMO004, mode Évaluer) comme sans fichier (DEMO007, et DEMO010 sur une production neuve sans aucune évaluation), « Paramètres » affiche Grille-4 / « IDME et niv 0 (5 niveaux) » / « Stratégies de lecture », et les critères sont rendus.
- **Ne tient pas** dans deux cas mesurés :
  1. **La production n'a que sa grille**, ce qui est justement la condition d'entrée du parcours. Sur les deux voies, l'échelle reste à « — Choisir une échelle — » et la cartouche à « — Choisir une cartouche — ».
  2. **Ses évaluations existantes divergent.** `_modeleProductionPourEval` (`js/evaluation-chargement.js:667-689`) lit d'abord les évaluations de la production. Si elles portent deux échelles, il rend une échelle vide, sans se replier sur la production (démo, Artefact 3 : « — Choisir une échelle — »). C'est un cas de stock, à mesurer sur le Mac.
- Phrases proposées (la plus petite retouche) :
  - Avec fichier : « Dans « Paramètres », ta grille, ton échelle et ta cartouche sont déjà choisies si ta production les nomme ; sinon, choisis-les. »
  - Sans fichier : « Ta grille, ton échelle et ta cartouche sont déjà choisies si ta production les nomme ; sinon, choisis-les dans « Paramètres ». »
  - Autre voie, qui change le comportement et revient donc à Grégoire : garder les textes et exiger les trois pièces dans la condition du panneau.

### Étape 7 : la retouche, les descripteurs, le cadenas — **ne tient pas** (sauf le cadenas)
- **La retouche n'arrive pas au PDF.** Mesuré : j'ai tapé une sentinelle au clavier dans le cadre « Générale » (`#retroactionFinale1`), puis touché Verrouiller. Elle est enregistrée (`retroactionFinale`, `retroactionReecrite: true`), mais **absente du HTML rasterisé des trois PDF de l'export Léa** (capturé dans `rendreSyntheseHTML`). Témoin : le commentaire de cartouche du critère 1 y est bien.
  - Cause : la synthèse écarte `retroactionFinale` exprès (`js/synthese-retroaction-data.js:669-672`). Elle prend le commentaire de chaque critère dans un `div comm_…` caché, rempli par la cartouche (`evaluation-chargement.js:1252`, collecte l. 2222-2227).
  - La retouche ne part que par « Copier » / « Copier tout » et dans les archives (`travaux-archivage.js:142`). La vue « Spécifique » n'est pas modifiable : c'est un `div` (`index.html:8425`).
- **Les descripteurs par niveau ne sont visibles nulle part pendant l'évaluation.** Mesuré avec des sentinelles dans `descripteurs.parNiveau` des quatre critères holistiques de la grille : 0 occurrence dans tout le DOM en mode Évaluer (palettes masquées comprises), 0 dans la synthèse. Le menu de niveau affiche seulement « code - nom » (`evaluation-chargement.js:1074-1079`). On ne les lit que dans Conception › Grilles (`js/grilles.js:5109`). Le barème d'un critère analytique, lui, s'affiche (l. 1760-1782), mais c'est autre chose.
- **Le cadenas tient.** « Verrouiller » est le premier bouton du corps de « Paramètres » (`index.html:8227`), mesuré sur les deux voies.
- Phrases proposées :
  - « Relis-les comme ton étudiant·e les lira et retouche-les au besoin, directement dans le cadre. » devient « Relis-les comme ton étudiant·e les lira : pour changer une phrase, change-la dans ta cartouche ou dans tes tampons. » Attention, une phrase de cartouche vaut pour tout le groupe : c'est à Grégoire. L'autre voie est que la retouche gagne le PDF, ce qui change le comportement.
  - « Plus tes descripteurs et ta cartouche sont précis… » devient « Plus ta cartouche est précise, plus ton étudiant·e comprend ce que tu as constaté dans sa production. »

### Étape 8 : l'export Léa et le verrou — **constat : l'export ne filtre pas sur le verrou**
- Mesuré sur Analyse 1 avec trois évaluations : DEMO004 verrouillée (avec fichier), DEMO006 **non verrouillée** (avec fichier, « Non verrouillée » dans la Liste), DEMO007 verrouillée (sans fichier).
  - Le compteur dit « 3 PDF pour 3 étudiant·es, dont 1 sur papier (synthèse seule) », sans rien sur le verrou.
  - Le ZIP téléchargé contient `Jovial_DEMO004_Analyse-1_Evalue.pdf`, `Joyeuse_DEMO006_Analyse-1_Evalue.pdf` et `Chaleureux_DEMO007_Analyse-1_Evalue.pdf` : **l'évaluation non verrouillée part chez l'étudiant·e.**
- Dans le code, `selectionnerEvaluationsLea` (`js/travaux-archivage.js:398-439`) ne filtre que sur la production, l'évaluation non remplacée, le groupe actif, l'élève et les reprises. Il ne regarde pas `verrouillee`. Inférence non mesurée : une évaluation vide ou « Incomplet » partirait aussi. Aucun changement proposé.
- Le nom du ZIP, `Lea_Analyse-1_2026-11-10.zip`, suit bien le format annoncé.
  - `<production>` est le titre, où chaque caractère non alphanumérique devient « - » (l. 458-459).
  - `<date>` est la date **UTC** (l. 859). Mesuré : à 21 h 30 le 9 nov. heure de Montréal, le ZIP s'appelle `…_2026-11-10.zip`.
  - Avec un seul PDF, il n'y a pas de ZIP : le PDF part seul (l. 877-879).

### L'import de bout en bout — **tient dans Chromium**
- Mesuré sans doublure : j'ai déposé trois fichiers au format Léa (`Nom_Prénom_DA_Production__Remis_le_AAAA-MM-JJ_HHhMMmSSs.ext`, parseur `travaux-import.js:128`) par un clic sur la zone (`filechooser`).
  - Les DA sont trouvés (DEMO004, DEMO006), la production « Analyse 1 » est trouvée par son nom, et les deux pages p1/p2 sont regroupées d'office.
  - « Importer » affiche « 2 copie(s) seront créées… » ; après « Oui, importer », 2 fichiers sont en IndexedDB. Blobs relus : 5 291 et 58 665 octets, le second étant un PDF de 2 pages.
  - Dans la Liste, la ligne passe à **Importé**. Aucune erreur console.
- Un DA à sept chiffres se lit aussi : le parseur sort `9000058` du nom. Je n'ai pas refait l'import complet en mode normal.
- L'échec vu chez Cowork n'est pas reproduit. Deux pistes, toutes deux des inférences :
  - WebKit refuse les Blob en IndexedDB sous `file://` (c'est écrit dans `tests/integration/reunir-en-une-copie-1231.spec.js:26`) ;
  - le DA du nom ne correspond à aucun élève du groupe actif (motif `DEMO###` en démo, sept chiffres sinon).

### Trouvailles hors de ces sept
- **Étape 5.** Le bouton au-dessus de la production s'affiche « Annoter ▾ » (puis « Évaluer ▾ »), jamais « Actions » (`js/travaux-ui.js:597-600`). C'est son menu qui porte « Évaluer » : « Actions › Évaluer » ne se trouve donc pas tel quel. Phrase proposée : « Quand tu as fini, touche le menu « Annoter », au-dessus de la production, puis « Évaluer ». » Le bandeau de la démo dit lui aussi « Actions ▾ » (`js/guidage-demo.js:55`) : à inscrire.
- **Étape 2.** Les pages au format Léa d'un même élève pour une même production arrivent **déjà réunies** (clé DA + production, `travaux-import.js:195-197`, #873). Mesuré : un seul cadre, et « 2 pages » à la confirmation. « Réunir en une copie » ne sert qu'aux fichiers sans DA dans le nom. Le test prévu à la LIVRAISON (« une production en deux pages à réunir ») n'aura donc rien à réunir avec des noms Léa.
- **Étape 8.** En anonymisation, le PDF s'appelle `<libellé anonyme>_<production>_Evalue.pdf`, sans DA (`travaux-archivage.js:489-491`, lu mais non mesuré). « Le nom du fichier porte son DA » ne vaut donc pas dans ce mode. À inscrire.
- **Export Léa, menu « Étudiant·e ».** Il ne liste que les élèves qui ont un fichier en stock (`travaux-ui.js:1377`). Un élève évalué sans fichier ne peut pas être choisi seul, même si « Tous » l'emporte bien. À inscrire.
- **Formats de la zone.** Elle annonce « PDF, JPEG, PNG » mais accepte aussi WebP et HEIF (`travaux-import.js:20-29`). Sans conséquence observée : commenter et oublier.

## 3. Parcours 5 — Monter ton cours

Mesures du 9 nov. 2026 sur l'arbre de `mesure/verifications-parcours-3-a-5`. Ses `js/planification-*.js` sont identiques à `origin/main` (98c04bfc ; `cafc89ff2` est introuvable dans ce clone). Outil : Chromium à 1440, 1180, 820 et 390 px, à la souris puis en tactile (`hasTouch`, gestes CDP `Input.dispatchTouchEvent`). WebKit est absent : tout ce qui est dit de l'« iPad » est un indice Chromium. Pour l'iPad, j'ai mesuré le geste ; je n'ai pas mesuré le doigt. Les scripts de mesure sont restés dans le nuage (non gardés, BOUCLE-SANS-RELAIS § 4 point 3).

### 1. Étape 1 : un toucher sur la palette crée le bloc au centre et ouvre son titre — **tient** (le clavier de l'iPad n'est pas vérifiable ici)
- `planification-carte.js:8911-8918` : `click` avec `detail === 1`, puis `creerNoeud` au centre de la zone, à ±50 px près (tirage aléatoire). Le titre prend le focus à `:3161` (`setTimeout` de 50 ms).
- Mesuré pour les cinq types, à la souris et au toucher : le bloc est créé à 74 px au plus du centre de la zone, et son titre est l'élément actif.
- *Inférence, à éprouver sur l'iPad :* Safari iOS n'ouvre pas d'ordinaire le clavier virtuel sur un `focus()` différé hors du geste. Si c'est le cas, « puis écris son énoncé » demande un toucher de plus sur le titre.

### 2. Étapes 2 et 3 : les cercles d'attache, et tirer un lien au doigt — **12 px, sans agrandissement : tient. « Sans peine » : ne tient pas**
- `styles.css:24686-24707` : 12 × 12 en `border-box`. Le seul agrandissement est `:hover { transform: scale(1.4) }` (`:24698`). Aucune règle `pointer: coarse` ou `hover: none` ne vise `.planif-noeud-port` (grep). Mesuré : 12 × 12 à 100 %. *Inférence :* le cercle suit le zoom, donc 6 px à 50 %.
- Le code : `pointerdown` sur le port (`:7852-7858`), puis `demarrerLien` (`:4462-4504`), en Pointer Events. Le relâché est lu par `elementFromPoint`. `touch-action: none` vient du bloc (`styles.css:23190`).
- Chromium tactile, depuis le centre exact du cercle : le lien est créé (compétence → idée maîtresse, puis idée maîtresse → leçon). Avec le doigt à 8 px au-dessus, il ne se passe rien : c'est le titre, en `contenteditable`, donc ni lien ni déplacement. À 7 px vers l'extérieur, c'est le fond, qui défile. La zone utile est de ±6 px, quand le projet exige 44 px.
- Non vérifiable ici : la précision d'un vrai doigt dans WebKit.
- **Proposition :** sous `@media (pointer: coarse)`, une zone sensible de 44 px (`::before` transparent sur `.planif-noeud-port`), tournée vers l'**extérieur** du bloc pour ne couvrir ni le titre ni les sélecteurs de l'en-tête. Même traitement pour la poignée ⠿ (13 × 13 mesurés). Le dessin ne change pas.
- Les mots du lien s'affichent en minuscules sur le trait (`:1306-1307`, mesuré : « se décline en », « se concrétise dans »). Retouches : **« « se décline en » s'affiche »** et **« « se concrétise dans » apparaît »**.

### 3. Étapes 2 à 6 : une étape de la frise ouvre sa page du guide — **tient**
- `rendreChaineCarte` (`:2234-2241`) appelle `ouvrirGuide(idEtape)`. Les identifiants des étapes sont ceux de `GUIDE_PAGES`.
- Mesuré au clic puis au toucher : Idées maîtresses ouvre « Ce que l'étudiant doit retenir » (page 3/9), Leçons « Organise dans le temps » (4/9), Objectifs « Ce que la leçon vise » (5/9), Activités « Comment l'étudiant va apprendre » (7/9), Évaluations « Vérifie que c'est acquis » (8/9). Une étape fait 44 px de haut.
- Deux réserves :
  - la frise déborde (voir les trouvailles) : à 1180 et à 820 px, « Évaluations » n'est entière qu'après un défilement ;
  - la case `#v2-pref-chaines-etapes` (`index.html:9145`) la masque : la bulle n'y trouverait alors rien.

### 4. Étape 3 : l'Inspecteur, la date, l'absence (#942), semaine et séance — **tient, à deux conditions**
- Le double clic passe par `dblclick` (`:7591-7601`). Le double toucher est fait à la main : `pointerdown` en capture (`:7623-7641`, 300 ms, 30 px), ignoré sur le titre. En Chromium tactile, deux touchers sur la zone de la leçon ouvrent l'Inspecteur ; sur le titre, rien ne se passe.
- La date (`:3779-3818`, `planification-export.js:397-427`). Mesuré en démo, cours rattaché, un groupe, S5 A : **« Lundi 22 septembre · séance A »**, la forme de l'exemple.
  - Première condition : la carte est rattachée à un cours. Sinon, l'Inspecteur affiche « Carte rattachée à aucun cours : pas de date ».
  - Seconde condition : l'horaire est saisi. Sinon, « Aucun horaire saisi pour ce cours ».
  - Avec deux groupes ou plus, la forme change : « Séance A », puis une ligne « Gr. N : lundi 22 septembre » par groupe.
- #942, mesuré : une leçon posée en S10 A, la date d'une absence du pack démo (2025-11-03). La pastille de cette absence porte « La figure de style », dans l'onglet **« Engagement ACP »** (`profil-etudiant-sections-affichage.js:599`, `:1848-1852`).
- Les sélecteurs de l'en-tête existent (`:909-951`) : semaine (S1 à S15 en démo) et séance (—, A, B, C, D). Tous deux affichent « — » au départ. L'Inspecteur de la leçon a « Semaine », pas la séance.

### 5. Étape 5 : le bloc glissé au doigt, une case par objectif — **tient en partie**
- Mesuré à la souris et en Chromium tactile : l'activité **glissée par sa poignée ⠿** se rattache à la leçon. **Glissée par son titre, elle ne bouge pas** : `:7141` ignore un `pointerdown` sur un `contenteditable`. Le double toucher fait pareil : il ouvre l'Inspecteur depuis la poignée, et rien depuis le titre.
- Sur une Activité neuve (217 × 74 px) : 39 % de la surface se saisit (bords, en-tête vide, poignée de 13 px), le titre en prend 38 % et les contrôles 22 %.
- L'Inspecteur a « Objectifs servis », une case par objectif de **sa** leçon (`:3374-3395`) : mesuré, une case. Une fois cochée, la pastille passe à ⚠, « Servi par 1 activité, mais aucune évaluation ne le vérifie ».
- Retouche proposée (étapes 5 et 6) : **« …puis glisse le bloc dans ta leçon par sa poignée ⠿. Touche deux fois cette poignée : dans l'Inspecteur, coche… »**

### 6. Étape 6 : évaluation sous l'activité ou au-dessus, pondération, ⚠ de la compétence — **tient, sauf « le bloc affiche la pondération »**
- Mesuré en démo. L'évaluation déposée sous l'activité donne l'ordre `[activité, évaluation]`, avec la pastille « ! ». Je coche l'objectif (« Objectifs vérifiés », groupe « Cette leçon ») et je choisis la production « Portfolio (60 %) ». Résultat :
  - l'évaluation passe à **✓** (« Chaque objectif vérifié a été enseigné avant cette évaluation. ») ;
  - l'objectif passe à **✓** ;
  - les **⚠ de la compétence et de l'idée maîtresse disparaissent aussitôt** (`:2685-2699`, `:2514-2532`, `:307-310`, rafraîchis par `sauvegarder` à `:6505`).
- Remontée au-dessus de l'activité, l'évaluation donne l'ordre `[évaluation, activité]` et la pastille **⚠** (« Un objectif vérifié n'est servi qu'après cette évaluation. », `:1757-1798`). La variante tient. Le ⚠ de la compétence ne revient pas : il ne dépend pas de l'ordre.
- **Le bloc n'affiche ni la production ni son poids** (texte du bloc relevé). Le poids n'apparaît que dans l'option du menu, « Portfolio (60 %) » (`:8602-8611`), et jamais pour un artefact de portfolio. La phrase de la bulle tient (« ta carte sait… ce qu'elle pèse ») ; c'est l'affirmation de la consigne qui ne tient pas.
- Le menu « Production » existe (`:3473-3479`). Une évaluation **hors leçon** n'a aucune case d'objectif (mesuré) : l'ordre de la bulle (glisser d'abord) est nécessaire.

### 7. Étape 7 : les libellés — **tient**
- Lus à l'écran : « Actions ▾ » donne « Exporter le plan… » et « Télécharger un modèle… » (`index.html:4116`, `:4118`). « Consulter la bibliothèque » est à `:4101`.
- Dans la fenêtre de la bibliothèque : « Garder dans ma bibliothèque → » (la flèche est `aria-hidden`). Le menu ⋮ propose « Dupliquer », « Exporter » et « Supprimer définitivement ». « Importer ou exporter ▾ » donne « Importer une carte ».
- « Planificateur » est à la fois le bouton de la barre et le titre de la palette. « Recentrer la carte » (suivi de la touche R) et « Tout voir » sont dans « **Vue ▾** », pas dans « Actions ».

### 8. Le lot « Deux liens vers la carte d'alignement » — **pas fait**
- La branche `origin/mesure/deux-liens-vers-la-carte` porte deux commits de mesure (bd33c9ca, 7a323249) et aucun code. Son rapport attend l'accord de Grégoire. Le code n'a pas bougé, donc les étapes 1 et 4 tiennent aujourd'hui.
- S'il est accepté, il réécrit les deux phrases (libellés proposés, non validés) :
  - étape 1 (§ 4) : « touche « Compétence »… : le bloc reprend la compétence de la fiche de ton cours (Cadre › Trimestre). Si ta fiche ne la porte pas encore, écris-y son énoncé et ses éléments… » ; la condition d'avance doit alors compter l'énoncé de la fiche ;
  - étape 4 (§ 2) : « …touche « Reprendre l'objectif d'une production » et choisis-la. La ligne suivra toujours le texte de ta production. »

### Les autres affirmations des bulles
- Le badge 🎯 : tient. Il est dans l'en-tête de la leçon (24 × 24, `:6309`) ; le toucher déplie la zone et y pose le curseur (`:7669-7686`).
- L'invite « Sera en mesure de… » : tient (`:6081`, `:6100`, `::before` mesuré).
- La pastille « ! » de l'étape 4 : **ne tient pas telle quelle**. Mesuré en espace neuf : j'écris le premier objectif, je quitte le champ, et aucune pastille n'apparaît. Elle vient avec Entrée, ou à la reconstruction suivante de la carte. En cause, `blur` (`:7770-7781`) ne reconstruit la carte que si le nombre d'objectifs change ; or la frappe l'a déjà compté. Je recommande de corriger le code (reconstruire quand la ligne d'accueil devient un objectif). À défaut, la retouche : « …t'y aide ; termine par Entrée. »
- Les pastilles « ⚠ » (étape 5) et « ✓ » (étape 6) : tiennent, mesurées.
- La frise : tient. Ses libellés sont Compétence, Idées maîtresses, Leçons, Objectifs, Connaissances, Activités, Évaluations (`:2197-2231`), et elle est « au-dessus de la carte » (`index.html:4223`). La palette s'appelle bien « Nœuds » (`:4229`).

### À 390 px (téléphone)
Captures : `plans de travail/captures-2026-11-09-verifications-parcours-3-a-5/k-390-alignement.png` et `k-390-alignement-canevas.png`.
- La page ne défile pas en largeur. La barre se chevauche : « Actions ▾ » couvre « Consulter la bibliothèque » et le menu de la carte, et « Inspecteur » et « Guide » sont coupés à droite.
- Dans la frise, seule « Objectifs » est entière. « Compétence » et « Idées maîtresses » sont hors d'atteinte.
- La palette « Nœuds » prend 175 des 350 px du canevas. La palette « Planificateur », large de 360 px, recouvre son haut et son titre.
- Un bloc créé au toucher naît à moitié sous la palette : on n'y lit que « …extes littéraires ».
- *Inférence :* aucune bulle n'y trouve sa cible ; il faut ne pas proposer ce parcours sur un téléphone, ou le dire.

### Trouvailles hors de ces huit
1. **La frise rogne son début et le rend inatteignable** (`styles.css:6403`, `justify-content: center`, avec `overflow-x: auto` à `:6411`). À 1180, « Compétence » est rogné à gauche et ne s'atteint pas en défilant ; à 820, il disparaît presque ; à 390, deux étapes sont perdues. Toutes les `.barre-convergence` sont concernées. ⮕ Inscrire.
2. **La palette « Planificateur » recouvre l'Inspecteur à 1180 px.** Mesuré sur la carte démo, 15 semaines : la palette occupe 749-1109 × 67-675, l'Inspecteur 821-1121. La case « Objectifs servis » est dessous (`elementFromPoint` rend `#planif-palette-nav`). Elle masquerait le contour des étapes 5 et 6. ⮕ Inscrire.
3. **La garde du double toucher vise des classes qui n'existent pas** (`planification-carte.js:7629` : `.planif-port`, `.planif-poignee`). Mesuré : deux touchers sur un port, ou sur la poignée de redimensionnement, ouvrent l'Inspecteur. ⮕ Inscrire (faible).
4. **Un défilement parasite casse la détection de la leçon au dépôt** (cause à isoler ; non reproduit en espace neuf). Sur une carte démo semée par script, toucher 🎯 (`focus()` de la ligne d'objectif) fait défiler `#planif-espace-wrapper` (`overflow: hidden`) de 355 px. `clientVersData` (`:2952`) ne lit que le défilement de la zone : le survol des leçons ne s'allume plus, et le dépôt ne tient plus qu'au recouvrement de plus de 50 %. ⮕ Inscrire.

## À inscrire au BACKLOG

Les éléments « INSCRIS AU BACKLOG » des trois consignes ne sont pas repris ici : ils s'inscriront avec leurs lots.
Ce que ces vérifications ont trouvé en plus :

Parcours 3
- Sur un espace vierge, ni l'« Échelle de départ (IDME) » ni la grille de départ n'existent avant un rechargement : la
  création du **premier** trimestre ne sème pas le matériel de départ (`js/trimestre-v2-init.js:387-391` ; seule la
  bascule le sème, `js/trimestre-v2-liste.js:353-359`). Conséquence directe sur l'étape 8 d'une grille en points, dans
  la même séance que le deuxième parcours.
- Le Récapitulatif de l'assistant dit « celle-ci s'ajoute à ta bibliothèque » (`js/wizard-pratique-v2.js:2033`) ; la
  pratique va dans « Dans ce trimestre », la bibliothèque « pour tous tes trimestres » reste vide.
- La bande C dit « tendance très forte… (r(C↔P) = 1,000) » dès une évaluation (trois étudiant·es) : complète l'item
  r = 0,996 que la consigne inscrit.

Parcours 4
- Un ZIP déposé dans la zone de dépôt est refusé **en silence** (`js/travaux-import.js:745`, un `console.warn`).
- L'export Léa envoie les évaluations non verrouillées (question 6).
- En anonymisation, le PDF exporté ne porte pas le DA (`js/travaux-archivage.js:489-491`, lu, non mesuré).
- Export Léa, menu « Étudiant·e » : il ne liste que les élèves qui ont un fichier (`js/travaux-ui.js:1377`).
- Le bandeau de la démo dit « Actions ▾ » pour le bouton « Annoter ▾ » (`js/guidage-demo.js:55`).

Parcours 5
- La frise des étapes rogne son début (`styles.css:6403`, `justify-content: center` avec défilement) : « Compétence »
  inatteignable à 1180 px ; toutes les `.barre-convergence` sont concernées.
- La palette « Planificateur » recouvre l'Inspecteur à 1180 px.
- La garde du double toucher vise `.planif-port` et `.planif-poignee`, des classes qui n'existent pas
  (`js/planification-carte.js:7629` ; les cercles sont `.planif-noeud-port`) : deux touchers sur un cercle ouvrent
  l'Inspecteur.
- Un défilement parasite de `#planif-espace-wrapper` (toucher 🎯 sur une carte semée) casse la détection de la leçon au
  dépôt (cause à isoler).
- La pastille « ! » qui n'apparaît pas au premier objectif (question 13).
- La cible de 12 px des cercles d'attache (question 10).
