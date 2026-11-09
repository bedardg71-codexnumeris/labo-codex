# Rapport de la session I : le neuvième parcours, « Mettre en place ta notation alternative »

**Nuit du 8 au 9 novembre 2026, session cloud I** (plan : `plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md`). Branche `lot/parcours-9-notation-alternative`, partie de `origin/lot/parcours-1-et-2` (a328bb9f). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md`, recopiée de `main` et commitée avec le lot. Rien sur `main`, pas de release, rien au changelog.

⚠ **Tout ce qui suit a été éprouvé sous Chromium** (WebKit n'existe pas ici). Le verdict WebKit et les captures WebKit se prennent sur le Mac.

> **Mis à jour le 9 nov. 2026, après les décisions de 9 h 50 à 9 h 58 (Cowork)** : les phrases validées sont posées, les
> placements et les décisions techniques sont faits (section suivante). Reste au Mac : le verdict WebKit et la fusion,
> **après le troisième parcours**, auquel celui-ci renvoie.

## Les corrections du 9 nov. (ce que tu verras)

- **Les phrases validées sont posées, mot pour mot** : étape 2 (le menu « à côté de « + Nouvelle pratique » »), étape 3
  des standards (« À côté, écris combien en retenir… », le minimum de fiabilité), étape 4 (« Note chiffrée » et la
  note provisoire), étape 5 (« Actions › Consulter », « Déverrouiller », « Verrouiller »), étape 6 (« Regarde ensuite
  la rétroaction : sous « Générale · Spécifique · Bilan »… »), étape 7 (« sans note chiffrée », deux fois), étape 8
  (l'export marqué « final », « Enregistrer le jugement », « deux ou trois pratiques »). La sentinelle Vitest part de
  la consigne du 8, y applique ces corrections, et exige chaque phrase neuve dans le code.
- **Étape 1 en deux temps** (question 12, validée par Grégoire) : avant que l'assistant s'ouvre, la bulle entière, près
  de « + Nouvelle pratique ». L'assistant ouvert, elle se réduit à sa ligne orange (« Touche « + Nouvelle pratique »,
  choisis ton modèle, puis « Créer la pratique ». »), posée sous l'assistant : ni ses deux cartes ni « Suivant » ne
  sont couverts. Aucun mot ne change. Sous 700 px, ce que j'avais fait reste (la bulle attend derrière l'assistant) :
  le lot « La bulle sur téléphone » s'en charge. Captures `p9-etape-1-1180-sombre.png` et
  `p9-etape-1-assistant-1180-sombre.png`.
- **Étape 3, standards** (Cowork) : la bulle se pose juste sous le champ du nombre à retenir (« Productions pour la
  note finale »), à droite, sa hauteur bornée à ce qui reste jusqu'au bas de l'écran (ce qui dépasse défile dans la
  bulle, « Continuer » compris). Ce champ, « Mode de sélection » et le minimum restent libres ; le champ du nombre est
  le plus protégé. À partir de 1180 px, la bulle est plus large, donc moins haute. Éprouvé à 1180 × 900, × 820 et
  × 770 (la fenêtre de Safari sur l'iPad à l'horizontale). Comme au huitième parcours, c'est la sonde de l'étape qui la
  place, après le moteur, sans le toucher (à unifier à la fusion). Capture `p9-etape-3-standards-1180-sombre.png`.
- **Les avis ne couvrent plus une bulle, et l'aide dans les pages se tait pendant tout parcours** (Cowork, comme au
  huitième parcours) : le même code que sur la branche du huitième, recopié tel quel (`js/utils-notifications.js` : la
  pile des avis prend le coin qui ne couvre pas la bulle ; `js/accompagnement.js` et `css/accompagnement.css` :
  survol, flèches et bulles de découverte se taisent). **À n'en garder qu'un à la fusion.** Sur la capture de
  l'étape 7, « Pratique appliquée au cours actif » et « Évaluation verrouillée » sont passés en bas à droite.
- **Question 11, la lecture** (Cowork) : hors de la démo, une pratique n'est jamais traitée comme une pratique de démo,
  même si son auteur dit « Demo Labo Codex ». Elle paraît au menu (le filtre « démo » des pratiques du trimestre est
  retiré : dans la démo, il ne masquait rien), sa fiche se modifie, et la garde des références du formulaire
  Cadre › Groupes-cours (`verifierReferencesPasDemo`) ne la refuse plus. Une seule règle, `BibliothequeUI.estPratiqueDeDemo`
  (la démo ouverte ET la marque), lue par la fiche et par cette garde. **Rien n'est réécrit** : le stock garde sa
  marque, et elle ne compte plus hors de la démo. Reste hors de la règle : l'export pour partager (inscrit, n° 25). Mon hypothèse, à corriger au besoin : la décision vise **tes** pratiques (celles
  du trimestre) ; la fenêtre « Bibliothèque » garde son filtre pour les modèles livrés (`toutesBibliotheque`), que je
  n'ai pas touché.
- **Étape 5, le verrou** (Cowork) : sur une évaluation verrouillée, « Note chiffrée » et « Niveau de performance »
  sont désactivés, comme le reste de la fiche (`desactiverFormulaireEvaluation`, `js/evaluation.js`). Avant, ils
  restaient cliquables sans rien enregistrer. Rouverte par « Actions › Consulter » puis déverrouillée, l'évaluation
  les rend (éprouvé).
- Captures Chromium à 1180 px, en sombre, remplacées : l'étape 1 dans ses deux temps, les étapes 3 et 5 à 8, et aussi
  les étapes 2 et 4, dont les phrases ont changé. Les autres (en clair, à 820 et 390 px) datent de la nuit : ni leurs
  phrases ni la place de l'étape 3 n'y sont à jour ; elles se refont toutes sur le Mac, sous WebKit.

### Les essais des corrections

- **Playwright (Chromium)**, le banc du parcours : **16 essais verts** hors captures, et **20 / 20** avec les captures
  (`CAPTURES_PARCOURS`, aux quatre largeurs). Neufs : la question 11 (menu, fiche, application, garde des références,
  rien de réécrit) ; l'étape 3 à 1180 × 900, × 820 et × 770 ; le verrou de l'étape 5 (désactivé, puis rendu par
  « Consulter » et « Déverrouiller ») ; l'aide muette. Les parcours entiers vérifient aussi l'étape 1 en deux temps et
  l'étape 3 (à partir de 1180 px). Un relevé tourne pendant chaque essai : un avis au-dessus de la bulle plus de trois
  passages le fait rougir.
- **Break-tests**, chacun rouge puis vert une fois rétabli : `bulleDeLEtape1` sans effet ; la place sous le nombre et
  sa priorité retirées (rouge à 770) ; les boutons d'affichage jamais désactivés, puis jamais réactivés ;
  `estPratiqueDeDemo` sans la condition « démo ouverte » ; la garde des références remise à `estItemDemo` ; la pile qui
  ne se déplace plus (les deux parcours entiers rougissent : « Pratique appliquée au cours actif » et « Évaluation
  verrouillée » sur les bulles des étapes 7 et 8) ; « deux ou trois pratiques » remis à « deux pratiques » (sentinelle).
- **Vitest** : la sentinelle des textes (79 essais avec les corrections) ; `sentinelle-note-provisoire-reservee` : la
  bulle 4 validée nomme « la note provisoire » en standards, exception nommée ajoutée (même motif que la bulle 7).
  Vitest complet (depuis `tests/`) : **10 944 / 10 944**, 893 fichiers.

### Les questions du rapport, tranchées (9 nov. 2026, 9 h 50 à 9 h 58)

- **1 à 8** (les phrases qui ne tenaient pas) : remplacées par celles que Grégoire a validées (ci-dessus).
- **9** (les trois correctifs hors du parcours) : gardés (Grégoire).
- **10** (le stock « N plus récentes ») : Grégoire n'a jamais adopté « N plus récentes » : rien à mesurer chez lui. Chez
  d'autres, **une pratique déjà réécrite en « meilleures » ne se distingue pas de façon sûre d'un choix délibéré** :
  aucun champ ne garde le mode d'origine ni la date du changement. Pas d'entrée au backlog (aucun symptôme vécu).
- **11** (le stock « Demo Labo Codex ») : la lecture corrigée, pas les données (ci-dessus).
- **12** (la bulle 1) : en deux temps (ci-dessus).
- **13 et 14** (« n sur N » qui change ; l'étape 5 d'une pratique déjà appliquée) : on garde (Cowork).

### À reporter

Le lot « Écarter une copie plagiée, ou lui mettre 0 » (branche `lot/copie-non-recevable-choix`, pas encore tranché par
Grégoire) donne à « Notes finalisées » un effet de plus en standards : une terminale non remise ou écartée vaut alors
0. **La phrase de l'étape 8 sera à revoir à sa fusion.**

### Ce qui attend encore Grégoire

Rien de nouveau. Aucun texte n'a été écrit en dehors des phrases validées.

### Seconde relecture, des corrections du 9 nov.

Un agent neuf, avec les décisions et le diff. Verdict, en une ligne : **pas encore fusionnable : l'étape 3 ne tenait
qu'à 900 px de haut, et les captures à 820 et 390 px échouaient ; textes, étape 1, avis et aide, verrou et démo
justes.** Il a vérifié les phrases au caractère près, la démo inchangée, le verrou par un essai à lui, et fait cinq
break-tests (quatre rouges ; un trou : la garde des références n'était pas éprouvée). Ce que j'en ai fait :
- l'étape 3 : la place préférée sous le champ du nombre, sa priorité, et trois hauteurs éprouvées (900, 820, 770) ;
- les captures à 820 et 390 px : les vérifications de place ne jouent qu'aux largeurs que les décisions visent
  (l'étape 1 à partir de 700 px, l'étape 3 à partir de 1180) ; les quatre largeurs passent ;
- la garde des références : nommée juste (le formulaire Cadre › Groupes-cours, pas « Appliquer », qui n'en consulte
  aucune), et éprouvée ;
- le verrou : éprouvé dans les deux sens, par le chemin que dit la bulle 5 ;
- deux commentaires faux corrigés, et le repli « au cas où » de la fiche retiré (règle zéro-dette).
Inscrits (n° 25 à 27) : l'export pour partager, la course de « Déverrouiller » juste après « Consulter », la fenêtre
« Bibliothèque ».

## En tête (premier dépôt, nuit du 8 au 9 nov.)

### Ce qui est fait

- Dans le panneau « Assistance », un neuvième parcours, « Mettre en place ta notation alternative », avec son titre et sa ligne. Il garde le rang 9 même si les parcours 3 à 8 ne sont pas encore là, et le menu compte « sur 9 ».
- Sans production avec sa grille dans le groupe-cours actif (ou sur la démo, ou dans un service d'orthopédagogie), « Commencer » ne lance rien et le panneau dit : « Commence par « Évaluer une première production » : il te faut une production et sa grille pour mettre en place ta notation alternative. »
- Les onze bulles validées sont posées mot pour mot. Le parcours lit la famille dans la pratique qu'on ouvre à l'étape 2 et prend le bon chemin : 8 étapes en standards et en dénotation, 9 en spécifications (3a puis 3b). L'étape 1 est sautée quand une pratique alternative est déjà appliquée, et ne compte alors pas dans « n sur N ».
- On l'a joué en entier, en faisant les gestes, en spécifications et en standards : « + Nouvelle pratique », un modèle, « Créer la pratique » (l'échelle demandée pour les standards), le menu de la pratique, la structure, « Niveau de performance », « Appliquer au cours actif », « Actions › Évaluer », le cadenas, « Actions › Dossier PDF » (le fichier téléchargé fait paraître « Continuer »), puis « Terminer » : le parcours passe à « Fait ».
- « Plus tard » sur chaque bulle sauf la dernière ; « Reprendre » revient à la même étape.
- Trois défauts de l'application cassaient ce parcours ; ils sont corrigés à la source (détail plus bas) : une pratique adoptée de « Modèle simple », « N meilleures évaluations » ou « N plus récentes » pouvait manquer au menu de Conception › Pratiques ; « N plus récentes » s'ouvrait sur un menu vide puis s'enregistrait en « meilleures » ; une évaluation faite sans copie importée ignorait le choix « Niveau de performance » de la pratique.
- Le commentaire de `TYPE_BADGES` est corrigé : la dénotation se crée.
- 53 captures Chromium : `plans de travail/captures-2026-11-09-parcours-9-chromium/`.

### Ce qui attend Grégoire (une question par ligne, ma recommandation entre parenthèses)

Les phrases ci-dessous sont validées mais ne tiennent pas devant le code. Je ne les ai pas retouchées : elles sont posées telles que validées, et je propose.

1. **Étape 2.** Le nom « Pratique ouverte » n'existe que pour le lecteur d'écran ; à l'écran, le menu affiche « Aucune pratique ouverte ». (Je propose : « choisis-la dans le menu « Aucune pratique ouverte », à côté de « + Nouvelle pratique ». »)
2. **Étape 3, standards.** Le nombre à retenir est à côté de « Mode de sélection », pas dessous ; et le minimum ne règle pas quand le Suivi montre la performance de la classe (elle paraît dès la première évaluation) : il règle la fiabilité de la performance de chaque étudiant·e (le « — » du profil, la colonne « ≥ Min. »). (Je propose : « À côté, écris combien en retenir. Dessous, le minimum de productions évaluées pour qu'une performance soit jugée fiable : sous ce nombre, le profil ne la donne pas, et Suivi › Étudiant·es le signale (« ≥ Min. »). »)
3. **Étape 4.** « « Note chiffrée » montre les niveaux et les chiffres » est vrai pour la rétroaction écrite, pas pour le PDF : la synthèse ne montre la note de la production dans aucun des deux modes. (Je propose : « « Note chiffrée » ajoute les chiffres à ta rétroaction écrite et, en standards, à la note provisoire ; « Niveau de performance » n'y laisse que les niveaux, les chiffres restant dans l'application. »)
4. **Étape 5.** « change-le au besoin dans leur palette « Rétroaction » » : sur une évaluation verrouillée, les deux boutons restent cliquables mais rien ne s'enregistre (`evaluation-chargement.js:2414`). (Je propose : « Pour en changer une, ouvre-la (« Actions › Consulter »), touche « Déverrouiller », choisis l'affichage dans sa palette « Rétroaction », puis « Verrouiller ». »)
5. **Étape 6.** « sa première ligne rappelle ton choix » : la première ligne de la palette est la bande « Générale · Spécifique · Bilan », la ligne « Options : … » vient dessous ; sans copie importée, le panneau n'a pas de titre « Rétroaction » visible. (Je propose : « Dans la palette « Rétroaction », sous « Générale · Spécifique · Bilan », la ligne « Options : … » rappelle ton choix. »)
6. **Étape 7.** « sans chiffre » et « elle ne porte aucun chiffre » : les critères gardent leur pondération en %, et la note provisoire garde des comptes et des échéances. Le PDF n'écrit pas non plus « Niveau de performance : … ». (Je propose « sans note chiffrée » aux deux endroits.)
7. **Étape 8.** « Notes finalisées » ne change le titre et ne retire « à venir » qu'en standards ; en spécifications et en dénotation, elle marque seulement l'export « final ». (Je propose : « … l'export les marque « final » ; en standards, la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir. »)
8. **Étape 8.** Labo › Exploration compare jusqu'à trois pratiques, pas deux ; et la section « Jugement » finit par « Enregistrer le jugement ». (Je propose « deux ou trois pratiques », et « puis écris la note et sa justification, et touche « Enregistrer le jugement » ».)
9. **Les trois correctifs faits hors du parcours** changent ce que l'application fait pour tout le monde, dont un pour ce que lisent les élèves (le PDF suit désormais « Niveau de performance » quand on évalue sans copie). Les garder ? (Je recommande oui : ils font ce que l'écran promettait.)
10. **Le stock « N plus récentes ».** Une pratique adoptée de « N plus récentes » puis touchée dans sa fiche a pu s'enregistrer en « meilleures », et calcule depuis sur les N meilleures. Rien ne la distingue d'un choix délibéré. (Je recommande de mesurer sur le Mac, puis de te les montrer une à une ; rien n'est réparé d'office.)
11. **Le stock « Demo Labo Codex ».** Une copie de ces trois modèles adoptée sans auteur au récapitulatif reste masquée du menu hors démo, et en lecture seule. (Même recommandation : mesurer, puis proposer.)
12. **La bulle 1 est longue.** À 1180 px, posée sur l'assistant, elle en couvre le milieu (le texte des deux cartes) ; sur un téléphone (390 px), elle couvrait l'écran et le bouton « + Nouvelle pratique », et sous 700 px je la laisse derrière l'assistant tant qu'il est ouvert. (Je recommande de juger les captures `p9-etape-1-assistant-*` avant de toucher au texte.)
13. **« n sur N » change en cours de route.** Avant qu'on ouvre la pratique, le parcours prévoit sa famille (la pratique créée, sinon celle du groupe-cours, sinon les standards) : « 1 sur 8 », puis « 2 sur 9 » si la pratique ouverte est par spécifications. (Je recommande de garder : la consigne compte le chemin de la famille, qu'on ne connaît qu'à l'étape 2.)
14. **Étape 5, pratique déjà appliquée.** Si la pratique ouverte est déjà celle du groupe-cours (adoptée au troisième parcours, par exemple), rien ne « devient » : c'est le toucher de « Appliquer au cours actif » qui fait avancer. (Je recommande de garder ; sinon l'étape passait seule et son texte n'était jamais lu.)

### Ce que je n'ai pas pu vérifier

- **WebKit et Safari** : rien n'a tourné sous WebKit. Le banc `tests/integration/parcours-9-notation-alternative-2026-11-09.spec.js` est à lancer sur le Mac, avec les captures (`CAPTURES_PARCOURS=<dossier>`).
- **Sur l'iPad, où va le PDF de l'étape 7** : jsPDF 2.5.1 clique un lien `<a download>`, sans feuille de partage. Sur Safari iPadOS, il devrait aller dans le gestionnaire de téléchargements (la flèche de la barre d'outils), puis dans Fichiers › Téléchargements (déduit, non éprouvé). La bulle dit « Ouvre-le » : si c'est confirmé, une phrase possible serait « Ouvre-le : sur l'iPad, touche la flèche des téléchargements de Safari, ou cherche-le dans Fichiers › Téléchargements. »
- **Les données réelles de Grégoire** : à mesurer sur le Mac (questions 10 et 11).
- **Le mode anonymisation** : à la lecture, l'étape 7 y devient fausse (le PDF porte « Élève N » sans DA, ce n'est pas ce que l'étudiant·e recevra), et l'export de l'étape 8 porterait des noms pseudonymisés avec le vrai DA (déduit). Non éprouvé.

## Le détail

### Les fichiers

| Fichier | Ce qui change | Pourquoi |
|---|---|---|
| `js/parcours-notation-alternative.js` (neuf) | Le parcours : onze bulles, chemin, conditions d'avance, refus, reprise | Le lot |
| `js/assistance.js` | Deux champs facultatifs d'une définition : `rang` (place dans la liste et compte du menu) et `refus()` (motif dit dans le panneau, sous le bouton) | « Garde l'ordre : celui-ci reste le neuvième » ; « Sinon, le panneau dit » |
| `css/parcours.css` | `.parcours-voile--aucun` ; `body.parcours-sur-modale` (contour et bulle au-dessus d'une fenêtre à 9999) ; `.assistance-parcours-refus` | « Bulle au centre, sans voile » ; l'étape 1 se joue dans l'assistant ; le refus |
| `js/preferences.js` | `parcoursNotationAlternative: {}` | Ce que le parcours retient pour « Reprendre » : son chemin et des identifiants, aucun nom ni DA |
| `js/travaux-export-pdf.js` | Un événement `dossierPdfLivre` après chacun des deux `doc.save` | « Continuer » paraît quand le PDF est téléchargé |
| `js/wizard-pratique-v2.js` | `auteurDeLaCopie` ; commentaire de `TYPE_BADGES` | Défaut 1 ; « COMMENTE DANS LE CODE » |
| `js/pratiques-gestion.js` | `modeSelectionDuMenu` | Défaut 2 |
| `js/evaluation.js` | `cocherOptionsParDefaut()` dans `_evaluerSansCopie` | Défaut 3 |
| `index.html` | Le script du parcours ; jetons anti-cache au jour du build (`20261108p`, `20261108q`) | |
| Tests | Une sentinelle Vitest, un banc Playwright, les retouches du banc des parcours 1 et 2 (« sur 9 », trois parcours au panneau), une exception nommée de la sentinelle « note provisoire », deux complexités figées abaissées | |

### Ce qu'il a fallu au moteur, sans le refondre

Pour la fusion avec les parcours 3 à 8, qui en auront probablement besoin aussi :

- **Le rang et le refus** : ajoutés au panneau (`rang`, `refus`). ⚠ Un parcours sans `rang`, chargé après celui-ci, recevrait le rang 4 : les lots 3 à 8 doivent déclarer le leur.
- **Des étapes qui dépendent de l'état** : le moteur relit `def.etapes` à chaque pas ; le parcours reconstruit la liste quand la famille est connue.
- **Un bouton qui paraît selon l'état** (« Continuer » des étapes 3a, 3b, 3 dénotation et 7) : le moteur rend la bulle une fois ; le parcours cache ou montre le bouton à chaque passage de la sonde (`montrerBouton`, appelé depuis `atteint`).
- **Un voile qui change dans une étape** (étape 6 : léger sur la liste, aucun dans l'évaluation, où critères, palette et cadenas sont loin les uns des autres) : `poserVoile`, même mécanisme.
- **La bulle au-dessus d'une fenêtre** : classe `parcours-sur-modale`, posée par le parcours tant que l'assistant est ouvert, au-dessus de 700 px.
- **Échap dans une fenêtre** : à l'étape 1, assistant ouvert, Échap le ferme au lieu de quitter le parcours (`sansSortie` en accesseur, `surEchap`).
- **Un toucher qui fait avancer quand l'état ne change pas** (étape 5, pratique déjà appliquée).

### Les vérifications de la consigne

Le relevé complet, point par point avec fichier et ligne, est en annexe : `RAPPORT-2026-11-09-parcours-9-notation-alternative-VERIFICATIONS.md`. Ce qui tient, en bref :

- **Étape 1** : l'ordre des modèles (N plus récentes, N meilleures évaluations, Modèle sommatif, Modèle simple, Modèle de base) ; le badge s'affiche « STD · Général » et non « STD » seul. Le message de l'échelle est mot pour mot, avec le bouton « Adopter ». Une dénotation se crée par « Décrire ma pratique ». **Le lot « Écarter une copie plagiée » n'est pas passé avant celui-ci** : aucune question de copie non recevable à la création d'une pratique sur cette base ; la bulle 1 n'a rien à en dire. À revoir à la fusion si le lot A en ajoute une.
- **Étape 2** : une pratique créée d'un modèle en porte le nom ; « Informations de base » existe. Après « Créer la pratique », la nouvelle n'est pas ouverte, mais une fiche ouverte avant l'assistant le restait : l'étape 2 la referme (rien ne s'écrit), pour que le geste soit bien celui de l'étape.
- **Étape 3, standards** : la condition de « Productions qui comptent dans la note » est exacte (le banc le vérifie à l'écran) ; chaque réglage s'enregistre au changement ; la terminale compte selon sa pondération. Voir la question 2 pour le reste.
- **Étapes 3a et 3b** : tous les libellés existent ; l'appariement par nom ignore casse, accents, espaces et tirets ; « Type N » ne s'apparie à rien ; « Modèle simple » a « Projet » et « Examen », sans plancher ; « Décrire ma pratique » n'écrit ni types ni forfaits ; un forfait sans exigence est le plancher.
- **Étape 3, dénotation** : la règle des 59 est vraie ; « + Ajouter une cible » existe.
- **Étape 4** : `cocherOptionsParDefaut` lit `affichageNote` à la racine, là où la fiche l'écrit. Mais le chemin sans copie ne l'appelait pas (défaut 3).
- **Étape 5** : la frise passe à « active », le menu à « (active) ». Voir la question 4.
- **Étape 6** : le pli des options est fermé à chaque ouverture ; le résumé « Options : tout inclus · niveau de performance » est exact ; « Verrouiller » est en haut de « Paramètres ».
- **Étape 7** : « Dossier PDF » n'est offert que pour une ligne évaluée ; il donne le dossier, ou la synthèse seule (#912). Le bloc « Note provisoire », avec « Productions à venir », paraît dès une évaluation verrouillée du pool ; aucun bloc de note en spécifications et en dénotation.
- **Étape 8** : « Jugement » (seulement avec une dénotation active), « Exporter la synthèse (CSV) » dans « Résultats finaux », « Système de jetons », Labo › Exploration existent.

### Les trois défauts corrigés (issue 1 : « corriger maintenant », ils cassaient le parcours)

1. **La copie d'un modèle marqué « Demo Labo Codex » manquait au menu.** Trois modèles (« Modèle simple », « N meilleures évaluations », « N plus récentes ») portent l'auteur « Demo Labo Codex », qui est aussi le marqueur d'un item de la démo (`BibliothequeUI.estItemDemo`, cf. #692, classé « périmé » le 3 nov.). Sans profil d'enseignant·e, le récapitulatif n'a pas d'auteur et la copie gardait ce marqueur : hors démo, elle était filtrée du menu, et l'étape 2 ne pouvait pas l'ouvrir. **Source** : `auteurDeLaCopie` (wizard-pratique-v2.js) retire le marqueur de la copie. **Stock** : non touché (question 11).
2. **« N plus récentes » devenait « meilleures ».** Le modèle écrit `recents`, que le menu « Mode de sélection » n'offre pas (il dit `derniers`, que le moteur lit comme `recents`, et l'assistant fait déjà cette relecture). Le menu s'affichait vide, et le premier réglage changé écrivait `meilleurs`. **Source** : `modeSelectionDuMenu` (pratiques-gestion.js), lecture seule. **Stock** : non touché, indiscernable d'un choix (question 10).
3. **Évaluer sans copie ignorait l'affichage de la pratique.** `_evaluerSansCopie` (evaluation.js) n'appelait pas `cocherOptionsParDefaut` : l'évaluation s'enregistrait en « Note chiffrée » (mesuré : `affichageNote: 'complet'` avec une pratique en « Niveau de performance »), et le PDF suivait. **Source** : l'appel ajouté, avant le chargement de l'élève ; une évaluation déjà enregistrée repose ensuite le sien. La relecture neuve confirme qu'il ne peut pas écraser l'affichage d'une évaluation enregistrée (son seul appelant est « Évaluer », offert pour une ligne sans évaluation). **Stock** : les évaluations déjà enregistrées gardent leur affichage.

Contournée sans corriger (issue 2, à inscrire) : la table des forfaits ne se redessine pas quand un type change ; le parcours la redessine en entrant dans l'étape 3b.

### Les tests

- **Vitest** : 10 933/10 933 (depuis `tests/`). Sentinelle neuve `tests/unit/sentinelle-parcours-notation-alternative-2026-11-09.test.js` : les onze bulles, le titre, la ligne et le refus confrontés à la consigne ; les phrases propres à une famille ; le chemin ; la lecture de la famille ; les correctifs 1 et 2. Six break-tests, tous rouges puis rétablis (en tête du fichier).
- **Playwright, Chromium seulement** : `parcours-9-notation-alternative-2026-11-09.spec.js`, 10/10 hors captures, 14/14 avec. Il échoue sans le code du lot (le parcours n'existe pas) : refus sans production avec sa grille ; une pratique de chaque famille ouverte à l'étape 2 mène à son étape 3 (3a puis 3b en spécifications) ; la bulle 1 sautée quand une pratique alternative est appliquée ; une sommative créée ne fait pas avancer ; « Reprendre » à l'étape 1 ; l'étape 5 qui ne passe pas seule ; les deux parcours entiers. Break-tests rouges : l'appel de `cocherOptionsParDefaut` retiré, la reprise remise à zéro, la garde de l'étape 5 retirée.
- **Parcours 1 et 2 sous Chromium** : 6/7. Le rouge (« panneau : titre… », géométrie du panneau mesurée pendant qu'il glisse) est **le même sur la base a328bb9f** sous Chromium (mesuré deux fois) : il ne vient pas de ce lot. Le commit de la partie 1 annonçait ce banc vert sous WebKit.
- Specs voisines rejouées sous Chromium, vertes : `evaluation-911`, `919`, `920`, `926`, `audit-pratiques-notation-parcours`, `cadre-763`, `chaines-etapes-1149-lot-3b`.

### Relecture par un agent neuf (règle 9)

Verdict : « à corriger : la reprise à l'étape 1 ne repart plus, l'étape 5 passe seule, le filtre de l'étape 6 par groupe-cours » ; les trois sont corrigés et testés dans 61ba6ddc ; ensuite « bon pour fusion après WebKit ». Ses mineurs sont traités (JSDoc déplacée, DA retiré de la préférence, test de `familleDe` renforcé), ou inscrits plus bas.

### Portes terrain

Aucune rangée (règles 1 et 2 du skill `portes-terrain`) : le verdict WebKit est une machine ; les stocks des questions 10 et 11 se mesurent par une lecture ; le reste est apparence ou comportement, sans écriture irréversible. Le seul geste humain utile, où va le PDF sur l'iPad, ne détruit rien.

### Trouvailles

- **Inscrire et continuer** : la liste ci-dessous.
- **Commenter et oublier** : le repli de `affichageNiveauxSeulement` lit `configuration` et non la racine (inerte) ; `chargerPratiques()` est appelée sans être définie (`wizard-pratique-v2.js`, garde `typeof`) ; `fermerFiche` du parcours recopie trois lignes d'`initialiserModulePratiquesMateriel`.
- **Hors mandat, déjà connu** : GitHub est rouge sur `main` (verdict Playwright Linux, quatre essais hors baseline, liste changeante d'un run à l'autre) ; à rattacher à #1246, qui couvre le même rouge sur la 1.236.0.

## À inscrire au BACKLOG

### Les onze de la consigne (sans les faire)

1. Créer une pratique depuis sa fiche, sans l'assistant (Grégoire, 8 nov., 21 h 06) : seules les étapes 1 et 2 du parcours changeraient.
2. En spécifications, la note du cours n'est lisible ni dans le profil ni dans la synthèse (seulement l'indice P du Suivi et l'export des résultats finaux) : contraire à la règle de transparence (8 nov., 16 h 10).
3. En spécifications, le lien entre un type de la pratique et le « Type » des productions se fait par le nom, et rien à l'écran ne le dit ; « + Ajouter un type » crée « Type N », qui ne s'apparie à rien.
4. Le « Modèle simple » n'a pas de forfait plancher ; et la cause dit « quelle note donner » (« donner » contraire à la règle du 8 nov.). Textes à soumettre.
5. En dénotation, la suggestion ne relie une production à une cible que si son « Objectif d'apprentissage » porte mot pour mot le nom de la cible ; la « Grille de critères (optionnelle) » n'est lue par aucune évaluation.
6. Le nom d'une pratique : « Nom de la configuration » (fiche) contre « Nom de la pratique » (assistant) ; l'exemple grisé nomme une discipline. Textes à soumettre.
7. La notification d'« Appliquer au cours actif » (« C'est elle qui calcule maintenant les notes et les indices… ») : inexacte et contraire au principe du jugement d'abord. Texte à soumettre. (Elle paraît sur les captures des étapes 6 et 7.)
8. L'aide de « Notes finalisées » dit qu'elle retire « Artefacts à venir », même sans « Artefact ».
9. Question pour Grégoire, plus tard : offrir la « Note provisoire » comme un choix dans toute pratique alternative ?
10. Question pour Grégoire, plus tard : « moyenne du portfolio », « moyenne des productions retenues » dans le récit des standards (profil, Comparateur, `formuleTexte`), contre le principe du 8 nov. ; relever aussi l'Aide.
11. À joindre au constat A-3 : l'étape « Forfaits de spécifications » de l'assistant offre quatre choix qui n'écrivent qu'une étiquette (`modeleBundle`) ; le parcours le contourne par l'étape 3b.

### Trouvés cette nuit

12. **La table des forfaits ne se redessine pas** quand un type est ajouté, renommé ou retiré (`pratiques-gestion.js`, `ajouterTypeTravailMat`, `modifierTypeTravailMat`, `supprimerTypeTravailMat`). Contourné par le parcours à l'étape 3b ; hors parcours, la colonne d'un type neuf manque jusqu'à la réouverture de la fiche.
13. **« Consulter » rouvre une évaluation avec l'affichage de la pratique, pas le sien** (`evaluation.js`, `_chargerOptionsEtRetroactionModif` appelle `cocherOptionsParDefaut`) ; déverrouiller puis verrouiller sans rien toucher enregistre alors celui de la pratique.
14. **Les flèches d'un·e étudiant·e à l'autre, sans copie** (`_naviguerEtudiant`), n'appliquent pas l'affichage de la pratique (déduit à la lecture par la relecture neuve, non mesuré) : même défaut que le 3, sur un autre chemin.
15. **Le PDF dit « Voici les N meilleures productions »** même avec « plus récentes » ou « toutes ». Mots que lisent les élèves : à soumettre à Grégoire.
16. **L'identifiant de « Type N »** (longueur + 1) peut doubler celui d'un type existant après une suppression.
17. **L'assistant garde le nom du premier modèle choisi** après un retour en arrière.
18. **En hybride, « Productions pour la note finale »** est sans effet.
19. **La carte « Note : » de Conception › Pratiques** décrit mal la dénotation (« comptage des réussites/échecs ») et les spécifications (« nombre de critères réussis »). Textes à soumettre.
20. **La fiche dit « Construction de la note »** au-dessus du menu « Mode de sélection ».
21. **Le mode anonymisation** rend l'étape 7 fausse (le PDF porte « Élève N ») : à décider si le parcours doit le dire, ou refuser de se lancer en anonymisation.
22. **Le moteur des parcours** : les besoins nommés plus haut (rang obligatoire pour les lots 3 à 8, bouton selon l'état, voile qui change, bulle sur une fenêtre, Échap dans une fenêtre, toucher sans changement d'état), à reprendre dans le moteur à la fusion plutôt que dans chaque parcours.
23. **Sur un téléphone, une bulle longue couvre l'écran** (la bulle 1 du neuvième parcours, et sans doute d'autres) : la bulle du moteur n'a pas de forme réduite.
24. ~~**Le stock des pratiques « N plus récentes » passées en « meilleures »** et **des copies masquées « Demo Labo Codex »** : à mesurer sur le Mac (questions 10 et 11).~~ **Tranché le 9 nov. : ne pas inscrire.** La question 10 n'a rien à mesurer chez Grégoire, et le stock d'autres n'est pas détectable de façon sûre ; la question 11 est réglée par la lecture.

25. **(Relecture du 9 nov.) L'export pour partager traite encore une pratique marquée « Demo Labo Codex » comme de la
    démo** (`js/partage-export.js`, `estItemDemo`) : « Exporter pour partager » répond « Le matériel de démonstration ne
    s'exporte pas… ». C'est ce qui voyage, et la validation à l'arrivée refuse cet auteur (`USURPATION_DEMO`) : il
    faudrait changer l'auteur à l'export, donc écrire. À voir à part.
26. **(Relecture du 9 nov., antérieur) « Déverrouiller », touché juste après « Actions › Consulter »** (environ 600 ms),
    reverrouille au lieu de déverrouiller : l'évaluation n'est pas encore connue du formulaire
    (`basculerVerrouillageEvaluationCourante`, `idModification`). La bulle 5 envoie justement sur ce chemin. Même chose
    juste après un premier verrou, sans rouvrir.
27. **(Relecture du 9 nov., antérieur) La fenêtre « Bibliothèque » masque, hors de la démo, trois modèles que
    l'assistant offre** (« Modèle simple », « N meilleures évaluations », « N plus récentes » : leur auteur est
    « Demo Labo Codex »). À inscrire si Grégoire l'a vécu.

## Les commits

- Corrections du 9 nov. : `3b952c3` (phrases, étapes 1 et 3, avis, aide, question 11, verrou), `5ba61ee` (l'exception
  « note provisoire »), puis les reprises de la seconde relecture.
- `00628a0e` : le parcours, le panneau, le banc (point d'étape).
- `50075de7` : le parcours entier vert ; les trois défauts corrigés ; la sentinelle.
- `61ba6ddc` : la relecture neuve (reprise, étape 5, Échap, filtre de l'étape 6, téléphone, DA retiré) ; les captures.
- Ce rapport et son annexe.
