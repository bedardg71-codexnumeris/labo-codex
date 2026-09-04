# Où en est-on ?

> **Ce fichier répond à une seule question : qu'est-ce qui marche, et qu'est-ce
> qui ne marche pas encore, pour quelqu'un qui utilise l'application ?**
>
> Il est écrit **sans numéros de fiche** et sans vocabulaire de chantier. Les
> numéros (`#612`, `#674`…) sont des étiquettes d'archivage, pas une échelle de
> progression : ils servent aux sessions, pas à Grégoire. Quand il en faut un
> pour retrouver le détail, il est entre parenthèses, en fin de ligne.
>
> **À lire au début de toute session, Cowork ou Claude Code**, avant `CLAUDE.md`
> et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, qui eux disent *comment*
> travailler. Celui-ci dit *où on en est*.
>
> **Mis à jour à la fin de chaque journée de travail.** Une ligne ne change
> d'état que si quelqu'un écrit **comment** il l'a vérifié.

**Dernière mise à jour : 4 septembre 2026, 10 h (dix-huitième passe, Cowork) — release **1.116.0**
(build `0904-0729`) commitée, push en cours. Avant : 1.113.0 (build `0903-0906`), 3 septembre 9 h 30. ▣ **LES HUIT ÉNONCÉS TIENNENT.** Le huitième — les suppressions disent
vrai — a fermé ce matin, en quatre volets et trois versions livrées en douze heures.**

⚠ **Ce que « tiennent » veut dire, et ce que ça ne veut pas dire.** Chaque volet a sa
commande et son témoin ci-dessous. **Les quatre écrans ont été lus par Grégoire
lui-même**, à l'écran. Le dernier — la suppression définitive d'une copie d'élève — le
3 septembre au matin, dans la corbeille.

---

## La règle de lecture

Quatre états. Le quatrième a été ajouté le 1er septembre au soir, parce que trois
mentaient dans les deux sens :

- **Fait** : vérifié, et la façon de le vérifier est écrite à côté. ↻ **Depuis le
  1er septembre, la phrase porte LA COMMANDE**, pas seulement la méthode (règle 1
  de `PROTOCOLE.md`) : « des tests » est invérifiable, une commande se rejoue.
- **Éprouvé par Grégoire** : il a parcouru l'écran lui-même, en écrivant ses
  chroniques Labo Codex, et ça marchait. C'est la meilleure preuve qui existe, et
  elle a une portée : c'est l'AUTEUR qui a mesuré, sur SES données et SES réglages.
  Ce qu'un débutant rencontre par un autre chemin reste à voir.
- **Pas fait** : on sait ce qui cloche, et c'est nommé.
- **Jamais vérifié** : personne n'a regardé. **Ce n'est pas « probablement
  correct ».** C'est la confusion qui a coûté le plus cher dans ce projet.

---

## Le compte du jour : 5 faits, 3 éprouvés par Grégoire, 0 pas fait, 0 jamais vérifié

---

## FAIT

### On sait par où les gens entrent — et il n'y a plus qu'une porte
L'application était servie à **deux** adresses `.netlify.app` en plus de la
sienne, complètes et sans aucune authentification. Netlify comptait ces
visiteurs, Cloudflare Access ne les voyait jamais : c'est tout l'écart entre
« 17 » et « 0 ». Les deux redirigent maintenant vers `app.codexnumeris.org`.
**Vérifié comment** : après déploiement, `curl -sI https://codexnumeris-051225.netlify.app/`
rend **301** et `location: https://app.codexnumeris.org/` ; idem sur
`main--codexnumeris-051225.netlify.app` ; `/index.html` conserve son chemin.
**Témoin** : `app.codexnumeris.org` rend toujours **403** (Cloudflare), donc la
porte principale n'a pas été cassée et il n'y a pas de boucle.
⚠ **Ce que ça ne règle pas** : on ne sait toujours pas COMBIEN ils sont, ni qui.
La redirection ferme la porte, elle ne compte pas rétroactivement.
⚠ **Et l'annonce n'atteint pas sa cible** : le changelog s'affiche dans
l'application, donc derrière la porte. Quelqu'un qui a un signet `.netlify.app`
verra l'écran de code AVANT de pouvoir le lire. Le doublage (courriel, blog)
reste à faire. *(geste de Grégoire)*

### Importer des productions, et savoir ce qui se passe quand ça rate
Un import lancé sans groupe-cours actif est refusé, et le refus est dit. Un
fichier dont le numéro d'élève n'existe pas dans le groupe apparaît maintenant
dans la liste au lieu de disparaître sans trace.
**Vérifié comment** : quatre tests automatiques qui rejouent les quatre cas, plus
une relecture du rendu à l'écran (les tests seuls ne voient pas les couleurs).
**Reste** : l'essai à la main de Grégoire, pour juger l'écran réel. *(#612)*

### Une grille partagée arrive complète chez le destinataire
Les sous-critères, leurs rétroactions et les réglages de projection voyagent
maintenant avec la grille. L'évaluation du destinataire ne bascule plus de mode
à son insu.
**Vérifié comment** : tests automatiques sur le transport —
`cd tests && npm run test:unit` (433 fichiers / 4638 tests, code 0). *(#669)*

### Une rétroaction ne parle que de la discipline de celui qui l'écrit
↻ **Descendue de FAIT à PAS FAIT le 2 septembre à 11 h.** Ce n'est pas une
régression : la ligne était classée « fait » sur la première moitié de l'énoncé
seulement, et la seconde n'a jamais été livrée. **C'est le classement qui mentait,
pas le code.**

**Ce qui est livré, et en ligne** — quatre versions le 2 septembre, un seul fil :

- Le mot « français » ne s'imprime plus dans le PDF d'un élève dont le critère
  s'appelle autrement ; les quatre phrases engendrées se règlent depuis le gabarit
  de la grille et voyagent avec elle quand on la partage. *(1.108.0, #581)*
- Les modèles de pratique nommés « Chimie », « Géographie », « Philosophie »,
  « Comptabilité » ne sont plus offerts, et les modes de calcul perdent leur
  parenthèse disciplinaire. *(1.109.0, #687)*
- Le modèle sommatif cesse de reproduire la pratique de son auteur : sa
  configuration était un cours de littérature. *(1.109.1)*
- Ses quatre évaluations passent à **parts égales, 25 % chacune** — une pondération
  est une position pédagogique, pas un point de départ. `20/20/30/30` mettait 60 %
  du poids sur les examens, servi comme départ à des programmes où les examens sont
  minoritaires ou absents. *(1.109.2)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **435 fichiers / 4701
tests, code 0** ; sentinelle #687 à **27 cas**, break-testée 4 fois, dont la
mutation `20/20/30/30`. Les quatre points de version mesurés PAR TÉMOIN :
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0** ; témoin du périmètre, `grep -rl '1\.109' .` rend **11** fichiers de prose
datée.
⮕ **Et Grégoire a regardé l'écran avant que ça parte** : Conception › Pratiques ›
« Partir d'un modèle » — cinq modèles fournis, aucun nommé par discipline.
⚠ **Une relecture croisée a rattrapé un trou avant l'envoi** : un critère nommé
« Maîtrise de la langue **française** » n'était pas reconnu et basculait en silence
sur le texte neutre. Le motif exigeait un non-alphabétique après « francais » ; la
forme fléchie échouait.

**La seconde phrase est livrée le 2 septembre à midi *(1.110.0)*, et elle attend
le regard de Grégoire :**

- **Plus aucune pratique offerte n'affiche de matière ni d'établissement.** Sept
  entrées de `js/pratiques/pratiques-predefines.js` déclaraient Chimie,
  Littérature, Mathématiques, Philosophie ou Biologie, et nommaient un cégep
  précis ; six identifiants et quatre constantes portaient un prénom de collègue.
  ⚠ **Mesure qui corrige la prémisse** : ce module n'est PAS celui que lit l'écran
  « Partir d'un modèle ». Ce dernier lit `MODELES_PRATIQUES_PREDEFINIS`
  (`js/pratiques-bibliotheque.js`), **déjà propre depuis #687**. Les sept entrées
  de `pratiques-predefines.js` n'ont pour lecteur vivant qu'un
  `Object.keys()` de `pratique-manager.js:159`, dans un test d'appartenance qui
  compare des NOMS DE CONSTANTES à des `id` — il ne matche jamais. Le renommage
  est donc sans effet observable, et c'est ce qui le rend gratuit. *(#690)*
  ⮕ ↻ **Contre-mesure de Cowork, 12 h 10 — il y a un SECOND lecteur mort, et il
  faut l'inscrire** : `pratique-manager.js:281`, `initialiserPratiquesPredefines()`,
  qui **écrirait ces sept pratiques dans la base d'un nouvel utilisateur**. Elle a
  **0 appelant** : `grep -rn "initialiserPratiquesPredefines" js/ index.html tests/`
  ne rend que sa définition. ▣ **Témoin** : sur le même objet,
  `migrerVersBibliotheque` en a 4, `obtenirPratiques` 9, `sauvegarderPratique` 26 —
  le zéro mesure donc quelque chose. **C'est un semis débranché, pas un semis
  absent** : il appartient au chantier « le matériel de départ cesse d'être semé ».
  *Inscrit, continué.*
  ⛔ **ET UNE ERREUR DE COWORK, À NE PAS REDÉCOUVRIR COMME UNE TROUVAILLE.** La
  passe de 11 h affirmait ici : *« six pratiques offertes à l'adoption… ce module
  est VIVANT, c'est ce que les gens peuvent prendre. »* **C'était faux.** Cowork
  avait conclu « vivant » d'un `grep` dont les résultats étaient des **commentaires
  JSDoc** (« Référence : PRATIQUE_… dans pratiques-predefines.js ») et une balise
  `<script>`. **Un fichier chargé n'est pas un fichier lu.** Troisième occurrence
  le 2 septembre de la même faute : *chercher un MOT là où il faut chercher une
  OFFRE.*
- **Les huit identifiants d'échelles disciplinaires sont retirés** de
  `IDS_GABARITS_HARDCODES` (`js/main.js`) et de la sonde
  (`js/echelles-bibliotheque.js`), et le commentaire périmé qui exigeait leur
  maintien est corrigé sur place. **Mesuré inerte** : le tombstone a quatre
  lecteurs, aucun ne les regarde, et le chemin d'import ne le consulte pas —
  `grep -rn "estRessourceSupprimee\|ressourcesSupprimees" js/import-export.js
  js/codex.js js/partage-section.js` rend **zéro** ; témoin du périmètre, la même
  commande sur `js/` rend **six**. *(#690)*
- **Le service d'aide cesse d'être servi à qui n'en a pas.** Six chaînes :
  les trois du plan de rattrapage (`pratique-sommative.js` l. 642/648/649) et les
  trois de `evaluation-projection.js` (l. 163 la phrase de l'élève, l. 211 le
  libellé du réglage, l. 213 le défaut). Mots arrêtés par Grégoire le 2 septembre
  à 11 h et 11 h 30 ; le tutoiement de la l. 163 reste, celui de l'élève, et les
  étiquettes de l'enseignant restent nominales. *(#539)*
- **Plus aucun nom de personne dans le code applicatif** : 86 occurrences avant,
  **5** après dans `js/` hors pack de démonstration, et aucune n'est un
  identifiant, une constante ni un libellé — quatre sont des commentaires, la
  cinquième est `js/config.js` (zone protégée, fiches fictives). *(#690)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **436 fichiers / 4710
tests, code 0** (contre 435 / 4701 avant : la sentinelle neuve `#690`). Quatre
gardes break-testées : réintroduire `pan-standards-bruno` → rouge, une
`discipline` → rouge, un `etablissement` → rouge, « en français » dans le libellé
ou le défaut → rouge. Cas D de la sentinelle #464 **réorienté, pas désarmé** :
retirer `ECHELLE_IDME_DEPART` rougit, retirer `ECHELLE_BRUNO_CHIMIE` ne change
plus rien — les deux break-tests joués. **Témoin du geste 2** :
`grep -rn "CAF\|(SA)\|en français"` sur les deux fichiers passe de **9** à **3**,
et les trois restants sont les commentaires qui expliquent la transition CAF →
Passerelle + — un zéro ici aurait voulu dire que l'explication est partie avec le
défaut.

⚠ **TARIR N'EST PAS RÉPARER, et le stock est nommé** : un enseignant qui a déjà
inscrit son `nomServiceAide` porte sa valeur en base ; le changement de défaut ne
la touche pas, **et c'est voulu**. Les copies des huit échelles et des pratiques
adoptées restent elles aussi telles quelles. Rien n'a été écrit dans les données
de personne. *(#674)*

⚠ **Ce qui reste dû, et que Grégoire seul peut trancher** : la formule
« l'algorithme propose, le jugement tranche — Voisard »
(`js/pratiques/pratique-pan-standards.js:35`, `js/pratiques/denotation-saisie-ui.js:8`)
vient d'une **source publiée** — il l'a dit le 2 septembre. **La référence exacte
(auteur, œuvre, année) reste à fournir** ; les deux lignes sont laissées intactes
d'ici là, parce qu'effacer une attribution n'est pas de la protection.

**Fini quand** : un enseignant qui n'enseigne pas le français, et dont
l'établissement n'a ni CAF ni services adaptés, ne rencontre aucun de ces quatre
mots dans son interface — sauf s'il les a écrits lui-même.
⮕ **Ce qui reste avant de cocher, et ce n'est pas du code** : Grégoire doit
regarder DEUX écrans. Conception › Pratiques › « Partir d'un modèle » — aucune
pratique offerte n'affiche de matière. Et l'écran de réglages de la pratique
sommative — le nom du service d'aide est un champ qu'il peut remplir, avec
« Centre d'aide du collège » comme valeur de départ ; c'est là qu'il écrira
« Passerelle + » lui-même. **Ce réglage lui appartient : personne ne l'écrit à sa
place, ni dans le code, ni dans ses données.**

⚠ **Ce que ça ne réglera pas** : les évaluations DÉJÀ enregistrées gardent leur
texte gelé, et c'est voulu. On tarit la source, on ne réécrit pas ce qui est chez
les gens. Le mot reste aussi gravé dans les identifiants de champs du volet
confidentiel. *(#440 résiduel)*

↻ **PASSE À « FAIT » LE 2 SEPTEMBRE À 12 h 45.** Le code est en ligne (1.110.0), la suite
COMPLÈTE est verte, **et Grégoire a parcouru les deux écrans lui-même.**

**Vérifié comment, au complet :**
· `cd tests && npm test` — **436 fichiers / 4710 tests** ET **239 essais Playwright, 0 échec,
  0 instable, en 8,0 min**, sur `672e3c5f`. ⚠ **C'est le premier verdict NAVIGATEUR pris sur
  ce lot** : 1.110.0 était partie sans, le garde pré-push ne jugeant que Vitest.
· Sentinelle neuve `#690`, quatre gardes break-testées.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, sur ses vraies données, le 2 septembre** : Conception ›
  Pratiques › « Partir d'un modèle » affiche ce qui a été décidé ; et le champ « Nom du
  service d'aide » (Conception › Grilles de critères › critère algorithmique › Modèle de
  projection) tient ce qu'il y écrit.
  ⮕ **Et c'est LUI qui a trouvé, en le faisant, que le jeton s'écrit `{service}` avec des
  ACCOLADES** : il avait tapé `[service]`, que le code ne remplace jamais — l'élève aurait lu
  le crochet. **Aucun test ne voyait ça.** C'est la démonstration de ce que vaut un passage à
  l'écran.

### ⚠ LE DERNIER MOT DE L'ÉNONCÉ, QUE PERSONNE N'AVAIT MESURÉ : le SRPNF

L'énoncé en nomme quatre — SRPNF, EUF, CAF, littérature. Les trois derniers ont été traités ;
**le SRPNF ne l'avait jamais été.** Mesuré depuis Cowork le 2 septembre à 12 h 50 :

```bash
grep -rn "SRPNF" js/ --include=*.js
grep -c "copierCriteresSRPNF" index.html
```

▣ Un seul endroit l'affichait encore à un enseignant : `js/evaluation.js:3087`,
`notifications.succes('Copié', 'SRPNF copiés dans le presse-papiers')`, dans
`copierCriteresSRPNF()`.
▣ **Cette fonction n'a aucun appelant** : `grep -c` sur `index.html` rend **0**.
**Témoin** : au même test, `sauvegarderEvaluation` rend **2** et `supprimerEvaluation` **1**.
Le zéro mesure donc quelque chose. L'élément `criteresCopier` qu'elle lit n'est pas non plus
dans `index.html`.
⮕ **Le bouton n'existe plus ; la fonction est restée.** Personne ne voit cette notification.
· Les autres occurrences de SRPNF sont des noms de fonctions, des commentaires, une entrée de
  changelog, et `pratiques-predefines.js` — **le fichier mort** (voir plus haut).
⮕ **Inscrit comme code mort, PAS corrigé** — issue 2 de `CLAUDE.md`. Ça n'empêche aucun des
huit énoncés.

### Aucune note remise ne repose sur une pondération incomplète sans le dire
↻ **CORRIGÉ DANS LE DÉPÔT le 2 septembre 2026 en soirée — commité, NON poussé : il
attend ton coup d'œil (règle 6).** Pour qui utilise l'application en ligne, rien n'a
encore changé ; c'est pourquoi la ligne reste ici.

Ce que le défaut faisait, mesuré : il ne baissait pas la note, il la **montait**.
Grille 50/30/20, les trois critères renseignés → **84,0 %** (M) ; le critère à 20 %
sans niveau → **95,0 %** (E), sans un mot. Et une échelle dont les niveaux n'ont pas
de valeur (la forme des huit échelles disciplinaires retirées le 1er septembre, dont
les copies restent chez qui les avait adoptées) donnait **0,0 %** comme un résultat.

Ce qui change, en gestes :
- **À l'écran** : un critère sans niveau → la note et le niveau affichent « -- », et
  une ligne sous la note nomme le critère et son poids (« Pas de note tant qu'un
  critère est sans niveau — Langue (20 %). Sans lui, la note ne porterait que sur
  80 % de la grille. »). Renseigné, la note revient et la ligne disparaît. Une échelle
  muette est nommée de la même façon, avec quoi faire.
- **À l'enregistrement** (bouton Enregistrer, création ou modification) : refus
  nommé, et **le brouillon est conservé** (écrit sur-le-champ, non verrouillé, la
  note AVEC sa portée `ponderationCouverte` à côté de `noteFinale`) : la copie passe
  « Évalué » et reste exportable, son PDF dira qu'il ne conclut pas. ↻ Trouvé par
  Grégoire le 2 septembre à 17 h 53 : la première version du refus n'écrivait rien,
  et comme Enregistrer annule l'auto-save en attente, la copie restait « Importé »
  et l'export Léa rendait « aucune évaluation trouvée ». ↻↻ Et à 18 h 04, capture à
  l'appui, le second correctif n'avait rien changé : dans « Annoter et évaluer »,
  `evaluationEnCours` désigne DEUX objets (constat #646), les niveaux vont dans l'un
  et l'auto-save lit l'autre — il rendait la main sans écrire. Corrigé en soirée par
  un instantané qui prend les critères là où ils sont ; **prouvé par un banc Playwright
  qui rejoue ta séquence exacte** (rouge avant, vert après).
  ⚠ Ce banc a mesuré au passage que **l'auto-save débouncé n'écrit AUCUN brouillon dans
  ce flux** — depuis avant ce lot. C'est #646, pas #674 ; inscrit, pas corrigé.
- ⚠⚠ **À 18 h 50, ta comparaison de trois captures a mené à la trouvaille la plus lourde
  de la journée** : quatre des cinq critères de « Grille-5 FR-ALGO A26 » n'ont **aucun
  identifiant** (sonde, lecture seule). L'éditeur de grille en lignes les créait ainsi
  (tari le soir même) ; l'écran d'évaluation, lui, les confond en UN seul : le niveau
  choisi sur Rigueur, Plausibilité ou Nuance était lu sur Structure, et **n'a jamais été
  enregistré**. ↻ Précisé par toi à 19 h 30 : l'évaluation de Daniel était un test et
  **aucune autre évaluation n'utilise encore cette grille** — rien n'est perdu. Avant les
  vraies évaluations : donner un identifiant à ses quatre critères. ↻ **Fait par toi à
  19 h 45** (critères supprimés et recréés dans l'éditeur : « tout fonctionne »). Pour
  les autres enseignants, dont l'éditeur a pu créer les mêmes grilles depuis octobre
  2025, une réparation automatique est **à décider à froid**. Détail dans la consigne.
- **Sur le PDF de l'élève** : pas de bandeau « Niveau général » ; à sa place, la
  phrase que tu as arrêtée le 2 septembre en soirée : « Cette copie n’a pas de niveau
  général : Langue (20 %) reste à évaluer. » L'export te le dit avant la remise.
- **Rétroactif** : les évaluations déjà en base sont relues depuis leurs critères,
  leur grille et leur échelle — les copies muettes d'avant sont vues.

**Vérifié comment** (depuis `tests/`) :
`npx vitest run unit/sentinelle-674-la-note-dit-sur-quoi-elle-porte.test.js` rejoue
le cas 50/30/20 sur la fonction réelle — 10 cas, dont B (« 95.0 % » attendu « -- »)
et C (« 0.0 % » attendu « -- ») **rouges avant le correctif**, verts après ;
`npx vitest run unit/sentinelle-674-les-portes-refusent-l-incomplet.test.js` — 15 cas
(les deux portes, l'auto-save, le PDF, l'échappement) ;
`npx vitest run unit/sentinelle-674-la-portee-accompagne-la-note.test.js` — périmètre
DÉDUIT de `js/` (4 chemins trouvés, aucun sans portée, break-test intégré) ;
`npx playwright test integration/triptyque-seme-produit-une-note.spec.js` — 4 essais
WebKit, dont le geste ci-dessous. Break-tests par mutation : portée retirée d'un
chemin → 1 rouge ; porte retirée → 5 ; règle forcée à « complète » → 12 ; rendu qui
conclut quand même → 3 ; restauration vérifiée par empreinte.
Suite complète (`cd tests && npm test`) : Vitest **440 f. / 4753 t.** ; Playwright
**240 passés, 0 échoué, 0 instable, 7,9 min** en local — le verdict au jeton se prend
après ton coup d'œil, avant le push.

⮕ **Ce que tu dois aller voir** : Travaux → ouvrir une copie → laisser un critère
sans niveau. La note doit afficher « -- » et la ligne sous elle nommer le critère.
Cliquer Enregistrer : refus nommé. Donner le niveau : la note revient, plus un mot.
*(#674)*

↻ **CLOS PAR GRÉGOIRE le 2 septembre 2026, tard.** Ses mots : *« L'item "Aucune note remise
ne repose sur une pondération incomplète sans le dire" est clos. »*

↻ **POUSSÉ le 2 septembre au soir — `9fe13749..1402a17c`, release 1.111.0.** Le hook a relancé
Vitest (vert) et lu le jeton (« verdict vert à jour pour ce commit »). ▣ **L'énoncé est donc vrai
pour les utilisateurs**, et non plus seulement dans le dépôt.
⏳ **Reste à confirmer, et ce n'est pas cet énoncé-ci** : que la version affichée dans
l'application passe bien à **1.111.0** après le déploiement Netlify. C'est l'énoncé 7, et il se
vérifie d'un coup d'œil au bandeau.

**Vérifié comment :**
· **Reproduit en ROUGE avant de toucher au code**, sur le vrai `calculerNote()` : le cas 50/30/20
  rendait **95,0 %** quand le critère à 20 % perdait son niveau (84,0 % avec les trois), et une
  échelle muette rendait **0,0 %** comme un résultat. **Puis vert après.** 10 cas.
· Portes, auto-save, PDF, échappement : 15 cas verts.
· **Sentinelle au périmètre DÉDUIT de tout `js/`** — quatre chemins d'écriture trouvés, aucun sans
  sa portée. ▣ C'est la leçon du lot #572 du même jour, appliquée : **pas une liste de fichiers
  tapée à la main.**
· **Quatre break-tests par mutation** : 1, 5, 12 et 3 cas rouges, restauration vérifiée par empreinte.
· `Vitest` **441 fichiers / 4760 tests** · `Playwright` local **240 passés, 0 échoué, 0 instable**.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran** : le refus nommé, le brouillon conservé, le PDF portant sa
  phrase, et sa propre grille réparée au passage.

**Ce que ça donne, en gestes :**
· **À l'écran** — un critère sans niveau (ou dont le niveau n'a pas de valeur dans l'échelle)
  **retient** la note et le niveau (« -- »), et une ligne dessous **nomme** le critère, son poids
  et quoi faire. Renseigné : la note revient, la ligne disparaît.
· **À l'enregistrement** — refus nommé, rien n'est écrit. ⚠ **L'auto-save continue d'écrire
  pendant la saisie**, la note avec sa portée : le brouillon n'est jamais perdu.
· **Sur le PDF de l'élève** — pas de bandeau « Niveau général », et une phrase nomme les critères
  en attente. ↻ **Les mots sont ceux de Grégoire**, choisis le 2 septembre parmi trois
  propositions (variante C, augmentée) : *« Cette copie n'a pas de note ni de niveau général :
  Langue (20 %) reste à évaluer. »* ▣ **Motif du choix** : « Évaluation incomplète » aurait pu se
  lire comme *le travail de l'élève* qui serait incomplet. **« Reste à évaluer » dit à qui revient
  le geste.**
· **Rétroactif** — les évaluations déjà en base sont relues depuis leurs critères, leur grille et
  leur échelle. ▣ **C'est la propriété qui avait écarté l'état « brouillon / conclue »** : elle
  seule répare l'existant.

⚠⚠ **LE TROU QUE CE LOT A NOMMÉ, ET C'EST LA LEÇON DE LA JOURNÉE.** La suite était **verte —
441 fichiers, 4760 tests — avec DEUX vrais défauts dedans** : le brouillon perdu au refus, et des
critères créés sans identifiant. ▣ **Aucun test ne les a vus. C'est le regard de Grégoire à
l'écran qui les a trouvés.**
⮕ **Quatrième occurrence du même motif le 2 septembre** : un vert qui ne prouve pas ce qu'on croit
(la CI rouge que personne ne lisait · la sentinelle #572 qui regardait deux fichiers sur trois ·
trois outils de poste plus permissifs que le serveur · et maintenant 4760 tests verts sur deux
défauts réels).
⮕ **C'est l'argument le plus fort en faveur de la règle 6** — *chaque lot se termine par un geste
à vérifier à l'écran, pas par un rapport.* Elle n'est pas une politesse : elle a attrapé
aujourd'hui ce que toute la machinerie a manqué.

⏳ **Trois trouvailles inscrites, PAS corrigées** : le portfolio et la liste des évaluations ne
lisent pas encore la portée ; l'export unitaire ignorait déjà la raison de #565 ; un repli mort
dans `calculerNote` contredit #527, sans effet en production.

⏳ **Et une décision qui reste à Grégoire** : la réparation automatique des grilles des AUTRES
enseignants — l'éditeur créait des critères sans identifiant depuis octobre 2025. **C'est une
écriture dans les données de quelqu'un.**

### Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve
↻ **CLOS le 3 septembre 2026 au matin.** Quatre volets, trois versions : **1.111.1**
(cartouches), **1.111.2** (copie d'élève + vocabulaire), **1.112.0** (échelle).

▣ **La règle, tranchée par Grégoire le 2 septembre** : supprimer définitivement la copie d'un
élève emporte **tout ce qui touche le couple** (cet élève, cette production) — originale,
reprises, évaluation d'un fichier réimporté. **Le code le faisait déjà ; l'écran ne le disait
pas.** Le constat B5 de l'audit du 25 août, qui décrivait cette portée comme « trop large », est
donc **REFUSÉ** : elle ne l'est pas.

**Ce que chaque écran dit maintenant, et comment on le sait :**

· **La copie d'un élève** — « Le fichier, ses annotations et toutes les évaluations de cet élève
pour cette production seront effacés. » ↻ **Les mots sont ceux de Grégoire**, choisis le
2 septembre à 21 h 45 parmi trois propositions. Un seul prédicat décide de ce qui est annoncé
et de ce qui est détruit — deux prédicats auraient pu diverger sans qu'aucun test ne le voie.
**Vérifié comment** : sentinelle #560, 8 essais. ▣ **ÉPROUVÉ PAR GRÉGOIRE le 3 septembre au
matin**, à l'écran, dans la corbeille — sa phrase s'affiche mot pour mot. ⮕ **Et le témoin
négatif tient** : le déplacement à la corbeille, qui ne détruit rien, continue de dire « le
fichier pourra être restauré pendant 30 jours » et rien de plus.

· **La cartouche** — les quatre chemins vivants disent leur portée, mesurée au moment où ils
parlent. Celui de la liste, que Grégoire avait sous les yeux, disait « Es-tu sûr ? » et rien
d'autre ; il nomme maintenant la grille, ce qui survit, et l'irréversibilité.
**Vérifié comment** : sentinelle #647, 21 essais ; et **Grégoire a lu l'écran** — c'est même sa
capture qui a montré qu'un des chemins ne nommait pas sa grille, ce que ni les essais ni la
relecture du code n'avaient vu.

· **L'échelle** — « Supprimer l'échelle «X», c'est la remplacer : N évaluations, N productions…
suivront. Par quelle échelle la remplacer ? » ↻ **Décision de Grégoire, 3 septembre** :
*« On supprime une échelle pour la remplacer par une autre. Une évaluation ne tient pas s'il n'y
a pas d'échelle. »* Un seul cœur pour les cinq chemins ; refus nommé si le trimestre est
archivé ; ne propose que les successeurs aux mêmes codes de niveaux.
**Vérifié comment** : sentinelle #648, 18 essais, vraie fonction chargée en bac à sable ;
`grep "^async function supprimerEchelle" js/` rend 6 chemins, dont 5 passent par
`supprimerOuRemplacerEchelle` et le 6e ne touche que la Bibliothèque. **Grégoire a lu l'écran**
sur son échelle « 0-IDME » (28 évaluations, 10 productions, 1 pratique, 6 cartouches).
▣ **Relecture croisée de Cowork (règle 2)** : l'ordre est sûr — compte, refus, question,
**puis** écriture. Rien n'est touché avant que l'utilisateur ait vu le chiffre.

· **Un aiguillage mort** dans la suppression d'une production — `typeof
retirerProductionDeLaBibliotheque === 'function'` gardait une fonction jamais déclarée.
**Vérifié comment** : `grep -rn` rendait **2** occurrences (le garde et son appel), contre **5**
pour la fonction sœur `retirerPratiqueDeLaBibliotheque` — témoin que le motif trouve ce qui
existe. Retiré ; sentinelle #649, 105 lignes.

⏳ **Inscrit, PAS corrigé** *(issue 2)* :
· Le compte « N évaluation(s) l'emploient » d'une cartouche ne regarde que **le trimestre
courant**, alors que la Bibliothèque est commune à tous. La phrase omet, elle n'invente pas.
· Le remplacement d'une échelle **n'est pas atomique** : six écritures indépendantes. En cas
d'échec partiel, l'ancienne échelle survit et relancer le geste termine la migration — **mais
l'écran ne le dit pas.**
· `verifierDependancesEchelle` ne connaissait pas de marqueur « terminé » : **le refus porte sur
l'archivage seul**, faute d'un critère mesurable.

⚠ **Ce que le lot n'a PAS fait, et c'est un chantier ouvert** : **corriger** une échelle sans la
supprimer, avec **recalcul proposé, jamais automatique**. Décision de Grégoire le 3 septembre :
*« Il permet d'informer l'utilisateur des conséquences de son geste. »* Cadré dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. *(#647, #648, #649, #560)*

---

### Le numéro de version affiché correspond au code qui tourne
Sans ça, aucun rapport de bug n'est interprétable, ni le sien ni celui d'un
utilisateur.
**Vérifié comment** : tests sur le bandeau de version, et les quatre points de
vérité mesurés PAR TÉMOIN à la release **1.109.2** (build `0902-1006`) —
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0**. ⚠ Le témoin dit aussi son périmètre : sur tout le dépôt, `1.109` rend encore
**11** fichiers de prose datée.
⚠ **Fragile** : ça se re-périme à chaque release. Le 2 septembre, **quatre versions
se sont succédé en une matinée** — cette ligne a cité un numéro périmé entre
chacune.
⮕ Le bump est passé par `scripts/release.mjs`, qui écrit les quatre points de
façon atomique **et** bumpe les jetons anti-cache d'`index.html` (11 ce matin,
qu'il liste). Le danger reste le bump fait à la main, et lui seul. *(#665)*

---

## PAS FAIT

▣ **Rien.** Pour la première fois depuis que ce fichier existe, aucun des huit énoncés n'est
ouvert. Le dernier est monté dans FAIT le 3 septembre 2026 au matin.

⚠ **Ça ne veut pas dire que l'application est finie.** Ça veut dire que **la liste fermée de
huit gestes que Grégoire s'était donnée pour la cohorte 1 est parcourue**. Ce qui reste vit
dans `BACKLOG.md` et dans `plans de travail/`, et ne se compte pas ici.

---

## ÉPROUVÉ PAR GRÉGOIRE

↻ **Corrigé le 1er septembre au soir.** Ces deux gestes étaient inscrits « jamais
vérifié ». C'était faux : Grégoire les a parcourus lui-même en écrivant les
chroniques Labo Codex, et il a vérifié à chaque fois que tout fonctionnait.
Le dépôt n'en portait aucune trace, et une session qui ne lit que le dépôt conclut
« personne n'a regardé ». **La trace manquait, pas la vérification.**

### Créer un trimestre, créer un groupe-cours, prendre les présences
**Éprouvé** par Grégoire, chronique 1.
**Ce qui reste sous cet écran** : des fenêtres d'alerte bloquantes sur ce parcours
exact. Il les a traversées sans être arrêté ; un débutant les lira autrement.
*(#678)*

### Créer une grille, une échelle, une cartouche
**Éprouvé** par Grégoire, chronique 2, avec SES grilles et SES échelles.
**Ce qui restait sous cet écran, et qu'il n'a pas pu rencontrer** : les huit
échelles « disciplinaires » de la bibliothèque (Chimie, Bio, Philo, Info, Géo…)
donnaient **zéro à la première évaluation, en silence**. Il ne s'en sert pas ; un
enseignant de chimie qui ouvrait la bibliothèque, lui, tombait dessus au premier
geste. *(mesuré le 1er septembre, plan du semis §1)*

↻ **Traité le 1er septembre en fin d'après-midi — et il faut lire ce que ça
couvre exactement.**
· ✅ **La source est tarie** : le versement des huit échelles est retiré, avec ses
  définitions et son appel. **Un nouvel enseignant ne les recevra jamais.**
· ✅ **L'échelle manquante est semée** : `ECHELLE_IDME_DEPART`, avec ses quatre
  `valeurCalcul`, modifiable et supprimable. Mesuré de bout en bout sous WebKit —
  espace vide, grille générique + échelle semée, « Maîtrisé » coché : **79,5 %,
  niveau M**. Le triptyque est complet et il calcule.
· ✅ **L'écran ne ment plus sur ce qu'il attend** : le texte d'attente nomme ses
  trois pièces, et choisir une grille sans échelle DIT ce qui manque.
· ✅ **L'autre source de matériel fictif est tarie aussi** : le module
  `js/spe-specifications.js` resemait **cinq** objets `[SPE]` signés « Labo Codex »
  à CHAQUE ouverture de la page — c'est pourquoi ils revenaient après chaque
  suppression. 1009 lignes retirées, zéro consommateur vivant, mesuré sur 24
  symboles. ⚠ **La pratique de notation par spécifications, elle, est intacte**, et
  une assertion la garde contre un futur retrait « de cohérence ». *(#681)*
  ⮕ **VÉRIFIÉ À L'ÉCRAN par Grégoire le 1er septembre** : les cinq gabarits
  supprimés depuis la bibliothèque, deux rechargements, **aucun retour**. Les
  sondes avaient d'abord mesuré zéro référence : rien de ce qui est parti ne
  portait la trace d'un jugement posé.
· ✅ **LES DEUX SONDES ONT TOURNÉ sur le corpus réel, le 1er septembre.**
  `_sonderEchellesDisciplinaires()` : **zéro partout** — bibliothèque, copies dans
  les trois trimestres, usages. Et le zéro porte son témoin : 3 trimestres et la
  bibliothèque partagée réellement lus. `nettoyage681()` : les cinq objets présents,
  **zéro référence, tous libres**, sur 15 clés ouvertes.
· ⏳ **CE QUI N'EST PAS RÉGLÉ, ET QUI A CHANGÉ DE NATURE CE SOIR.** Ce zéro ne
  couvre que le corpus de Grégoire. **Un enseignant qui a ouvert l'application
  avant aujourd'hui a pu ajouter l'échelle « Chimie » à sa sélection : sa copie
  reste muette et rend 0,0 % sans un mot.** Il n'est ni sondable, ni joignable, et
  **on ne sait pas combien ils sont** — le trafic n'est pas mesuré.
  ⮕ **#674 est le seul filet qui atteint ces gens-là.** Ce n'est plus une
  prévention pour la cohorte qui arrive : c'est une **réparation pour des
  utilisateurs déjà en place**, dont l'application ment aujourd'hui. Ça change son
  poids, pas seulement son rang.
↻ **1er septembre, tard — le §3 (« le matériel semé se dit utilisable ») est livré
dans le code et n'atteint personne.** Les trois pièces s'appellent maintenant
« Grille de départ », « Cartouche de départ », « Échelle de départ (IDME) »… **dans
un espace neuf seulement**. Sur une base qui porte déjà l'objet, le semis vérifie
l'identifiant et sort sans écrire : il ne recrée pas, donc **il ne renomme jamais**.
*(#682)*
⮕ ✅ **Réglé chez Grégoire le 1er septembre au soir** : il a tranché (b) — renommer
uniquement ce qui portait encore, au caractère près, un libellé écrit par le code.
**5 renommés, 0 nom personnel touché, 0 autre écriture**, vérifié par une relance de
la sonde. ⚠ **Mais chez les autres utilisateurs, rien n'a changé** : le renommage
est un script qu'il a lancé, pas une migration que l'application porte. Pour eux,
#682 est entier — et c'est encore « tarir n'est pas réparer ».
⮕ **La porte terrain du §3 est SUSPENDUE** : elle jugeait de libellés qui ne sont
pas arrivés, et elle envoyait dans un onglet « Matériel » qui n'existe pas. Le vrai
chemin est **Conception › Échelles de performance**.

↻ **Et la sonde a trouvé plus gros que le renommage** *(#683, ouvert)*. Deux
mécanismes, mesurés :
· **Changer de trimestre ne sème rien.** Le matériel de départ n'arrive qu'au
  chargement de la page. Un enseignant qui crée son second trimestre et va droit
  à l'évaluation n'y trouve rien, jusqu'à ce qu'il recharge — et rien ne le lui dit.
· **La suppression est par trimestre, l'interdiction est globale.** Supprimer la
  grille de départ dans un trimestre l'interdit dans TOUS, y compris ceux créés
  demain, pendant que les autres copies restent en place. ⮕ Ça touche aussi le
  geste 8 : la portée annoncée n'est pas la portée réelle. **Décision de Grégoire** :
  corriger changerait le sens de suppressions déjà faites.

⮕ Cette ligne reste donc « éprouvé par Grégoire » et ne devient pas « fait » :
ce qui a été mesuré, c'est la chaîne du NOUVEL utilisateur, pas le parcours
complet de l'énoncé 2.

---

↻ **Livré et éprouvé le 4 septembre 2026 — la grille déclare sa manière d'évaluer
(lot 1 des trois types de grille), en ligne dans 1.115.0, build `0903-2103`.**
· ✅ **Un menu « Type de la grille »** à côté du nom : holistique, analytique ou
  algorithmique. **Chaque critère neuf en hérite** sans rien cocher ; le menu de
  chaque critère reste là pour déroger. Le type voyage au partage et à l'import.
· ✅ **Le menu dit ce qui est ENREGISTRÉ, pas ce qui est déduit** (retouche décidée
  par Grégoire le 4 septembre) : « Non précisé » sur toute grille d'avant, et une
  ligne dessous dit ce que ses critères sont — « Tes critères sont tous
  holistiques. » Pas de couleur pour porter l'information : l'orange veut déjà dire
  « avertissement », et « déduit » est l'état normal de toutes les grilles d'avant.
· ✅ **Le badge de composition continue de dire ce qui EST**, depuis les critères,
  jamais depuis la déclaration.
· ⛔ **Rien n'est écrit dans les grilles existantes.** Rien du calcul des notes.
**Vérifié comment** : Grégoire, à l'écran, trois passages — une grille d'avant ouvre
sur « Non précisé » avec sa ligne, choisir un type tait la ligne et revenir la ramène ;
une grille neuve en « Analytique » reçoit trois critères analytiques sans rien cocher,
et un passé en algorithmique fait basculer le badge à MIXTE. Relecture croisée de
Cowork sur `fa5d34d2` : rien à corriger. Verdict au jeton vert sur `1228837a`.
*(commits `a6187760`, `fa5d34d2`, `1228837a`)*

↻ **Lots 2 et 3 livrés le 4 septembre 2026 au matin — release 1.116.0 commitée (`6309111e`,
build `0904-0729`) ; ⏳ le push et le verdict au jeton étaient en cours à 10 h : la prochaine
session confirme que `origin/main` = `main` et que le bandeau dit 1.116.0.**
· ✅ **L'analytique se saisit en points** : un champ « sur 30 » au lieu du menu, 24 sur 30 fait
  80 % ; le champ vide dit « – », un vrai zéro se tape (lot 2 + retouche).
· ✅ **Le chiffre trouve son niveau par les bornes de l'échelle, et ce niveau ouvre la cartouche** ;
  le critère analytique entre dans l'évaluation enregistrée avec ses points ET son niveau déduit,
  sous le même nom que les niveaux du menu — dix-huit lecteurs (dépistage, profil, archives,
  bilan, PDF) le voient sans changer (lot 3).
· ✅ **L'élève ne lit que le chiffre** : « 24 / 30 » sur le PDF, dans le texte copié vers LÉA, et
  dans les DEUX bilans (celui de l'app et celui du PDF — deux implémentations, retouches 1 et 2) ;
  la légende I·D·M·E disparaît du PDF d'une grille entièrement analytique. Le bandeau « Niveau
  général » de la copie reste : c'est le niveau de la copie, pas d'un critère.
· ✅ **Rouvrir une copie dont le premier critère est analytique charge l'évaluation et montre le
  cadenas** — régression du lot 3 trouvée par Grégoire à l'écran, corrigée avant publication
  (retouche 3).
**Vérifié comment** : relecture croisée de Cowork sur chacun des cinq commits (`b4039828`,
`5b8bc6b0`, `44559804`, `f485ea34`, et le lot 2 `37660b76`), cartographie faite à `37660b76`
avant de lire le patch ; Claude Code : Vitest **455 fichiers / 4989 tests, code 0**, sentinelle
lot 3 **43 cas** dont les cas rouges avant chaque retouche, break-tests par mutation à chaque
lot (14 + 4 + 5 + 3), WebKit complet **260 / 260** au lot 3 puis 15 / 15 sur les specs
d'évaluation à chaque retouche ; le verdict au jeton se prend par `scripts/pousser.sh` sur le
commit poussé. ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 4 septembre** : sa grille « Analyse
littéraire » (12 critères analytiques), une copie évaluée, le PDF produit — **et c'est son
regard qui a trouvé les trois retouches** (les niveaux encore nommés dans le PDF, le « 0 » qui se
lisait comme une valeur, la copie qui ne se rechargeait pas). Aucun test ne les avait vues.
⏳ **Inscrit, pas corrigé** : points sans niveau déductible (échelle à trous ou muette) — le
critère n'entre pas dans `criteres[]` alors que la note compte ses points ; assumé par un test,
à décider avec les paliers du lot 4.
⮕ **Ce que le coup d'œil a ouvert — huit retours, tous tranchés ou mesurés — est le lot 4** :
`plans de travail/CADRAGE-2026-09-04-lot-4-gabarit-algorithmique-et-paliers-analytiques.md`.
Consignes et relectures : `plans de travail/CONSIGNES-2026-09-03-lots-des-trois-types-de-grille.md`.

---

## L'ÉVALUATION — ce que l'audit du 25 août a déjà réglé

C'est le morceau qui inquiète, et il est moins ouvert qu'il n'en a l'air.

Un audit de l'onglet Évaluations (les quatre sous-onglets, le PDF de rétroaction,
le design) a relevé **20 constats le 25 août**. ↻ **Remesuré le 2 septembre, et
écrit DANS le rapport** (`Rapports/AUDIT-evaluation-onglet-2026-08-25.md`, temps 1) :
**15 inscrits et livrés, 4 partiels, 1 refusé avec motif** (les tailles du PDF, ta
décision), plus la section « mineurs » — partielle elle aussi. Les 17 fiches sont
cochées au backlog ; **coché ne veut pas dire couvert**, c'est ce que le rapport dit
maintenant constat par constat. ⚠ Et vingt constats LUS, **zéro écran parcouru** :
un audit fermé n'est pas une section vérifiée (temps 3, pas fait).

**Le quatrième site est corrigé — et il t'attend** *(temps 2, 2 septembre après-midi,
non poussé)*. #572 disait « la valeur calculée est la source » et avait corrigé
trois sites ; **rouvrir une copie déjà corrigée et la réenregistrer** passait par un
quatrième (`js/evaluation.js`, chemin de modification) qui relisait l'écran.
**Reproduit sur le chemin réel avant de corriger** : `79,46` calculé → **`79,5`
stocké** (l'arrondi de l'affichage) ; écran « -- » (rendu différé, #321) →
**`0` stocké** par-dessus la vraie note. Le second effet est réel, et c'est celui qui
départageait « arrondi bénin » et « zéro qui remplace une note ». Corrigé au même
patron que les trois sœurs ; la sentinelle #572 ne vérifie plus une liste tapée à la
main mais **tous les fichiers de `js/`, lus à chaque exécution** — c'est la leçon du
jour : elle était verte depuis le 29 août pendant que le défaut vivait.
**Vérifié comment** : test de reproduction en 3 cas (les 2 effets rouges avant, verts
après ; témoin que le chemin aboutit) ; break-tests : réintroduire la lecture d'écran
dans `evaluation.js` → rouge, l'introduire dans un fichier jamais listé → rouge ;
`grep -rn "parseFloat(.*noteProduction1" js/` rend **zéro**, et le témoin
`noteCalculeeCourante === 'number'` en rend **quatre**. Vitest 437 f. / 4715 t.
⮕ **Ce que tu dois aller voir** : ouvrir une copie que tu as déjà corrigée, ne rien
changer, réenregistrer, et vérifier que la note affichée est identique au centième.
⚠ **Ce que ça ne règle pas** : les quatre chemins écrivent toujours `0` quand la note
n'est pas calculable — c'est #674, l'énoncé 5, forme déjà tranchée (persister
`ponderationTotal`). Et les évaluations déjà enregistrées avec une note arrondie ou à
zéro gardent ce qu'elles portent : rien n'a été écrit dans tes données.
↻ **2 septembre en soirée** : les quatre chemins écrivent maintenant la portée à côté
de la note — voir le cinquième geste, plus bas.

**L'autre partiel qui t'attend** : la portée des suppressions par couple. Le garde a
été livré le 29 août, la règle métier non. C'est le geste 8 de cette page. *(#560)*

⚠ **Trois trous ont été découverts EN corrigeant**, et ils sont ouverts : neuf
fonctions définies deux fois sur `window`, 78 variables CSS fantômes, des clés de
session non préfixées. *(#587, #595, #596)*

⚠ **Ce que cet audit ne couvrait pas** : le calcul de la note lui-même. Il visait les
enregistrements, le PDF et le design. Le défaut mesuré le 1er septembre au soir (une
pondération incomplète qui affiche 0,0 %) n'est dans aucun des 20 constats. Un audit
propre ne dit rien de ce qu'il n'a pas regardé.

---

## CE QUI N'APPARTIENT QU'À GRÉGOIRE

Aucune session ne peut trancher ces points à sa place.

↻ **QUATRE POINTS RETIRÉS DE CETTE LISTE LE 3 SEPTEMBRE 2026, tranchés par lui.** La règle
de suppression d'un fichier (tout ce qui touche le couple élève-production), les mots des
messages de suppression, le facteur de normalisation 500 → 600, et le message à la communauté.
⮕ **Les décisions sur l'échelle sont écrites en entier dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`** — remplacement, correction,
recalcul proposé, refus dans un trimestre archivé, et le cas de l'échelle que personne
n'emploie. ⚠ **Ce fichier fait foi ; ne les redemande pas.**
↻ **Tranché le 2 septembre à 11 h 30, et retiré de cette liste : le nom du service
d'aide.** Trois décisions, dans ses mots :
  · Ce que lit un enseignant qui n'a rien réglé : un libellé générique —
    « Centre d'aide du collège », « Services adaptés du collège », et le nom reste
    un réglage qu'il peut remplir.
  · Ce que lit l'ÉLÈVE, dans la phrase du gabarit neuf : « au service d'aide de ton
    collège : … » — on retire « en français », et rien d'autre. Le deux-points reste,
    parce que la préposition voyage avec le nom (« t'inscrire au Passerelle + » ne se
    dit pas).
  · Chez lui : **« Passerelle + »**, qu'il écrira lui-même dans son réglage — le code
    n'écrit pas dans ses données.
- **Les essais à la main** que les tests ne remplacent pas : l'écran réel sur Mac
  et sur iPad.
- **Deux attributions d'idée** inscrites dans le code (« l'algorithme propose, le
  jugement tranche — Voisard »).
  ↻ **TRANCHÉ le 3 septembre 2026** : **la source EST publiée.** Ses mots : *« Le travail de
  Voisard est publié. Il tient un blogue sur Substack, et cette idée d'algorithme et de
  jugement personnel est dans l'une de ses chroniques. »*
  ⮕ **Donc elle se cite en règle — elle ne part pas.**
  ⏳ **Ce qui reste, et ce n'est pas urgent** : retrouver LAQUELLE des chroniques. *« Il faudra
  faire une recherche pour la retrouver, mais ce n'est pas le bon moment. »*
  ⚠ **Ne pas retirer les attributions en attendant** : une mention imprécise vaut mieux qu'une
  idée empruntée sans nom. Question d'honnêteté intellectuelle, pas de code.
↻ **Le message à la communauté de pratique** sur l'adresse unique : **fait**, le
3 septembre.

⮕ **Il ne reste donc qu'UN point sur cette liste : les essais à la main.** ▣ **Et c'est
celui qui a le plus payé** : le 2 et le 3 septembre, son coup d'œil à l'écran a trouvé
**trois** défauts que 4760 essais verts, deux relectures croisées et une suite de navigateur
complète avaient tous manqués — un brouillon perdu au refus, des critères créés sans
identifiant, et une fenêtre de suppression qui ne nommait pas sa grille.

↻ **Retiré de cette liste le 2 septembre** : les identifiants du code qui portent un
prénom de collègue. **Il a tranché — ils partent tous** — et la mesure a montré que
le retrait ne coûte rien : les huit identifiants d'échelles sont inertes, aucune
écriture dans les données de personne n'est nécessaire. *(#690)*

---

## CE QU'ON NE SAIT PAS, ET QUI COMPTE

⚠ **Des utilisateurs sont DÉJÀ dans l'application. Combien : inconnu.**
Le trafic n'est mesuré ni sur Netlify ni sur Cloudflare. On ne sait pas s'il y en
a un, vingt, ou aucun aujourd'hui.

↻ **1er septembre au soir — on sait maintenant POURQUOI on ne sait pas.** L'application
est servie à **deux adresses**, et une seule a une porte : `app.codexnumeris.org` passe
par Cloudflare Access, mais le domaine Netlify par défaut sert la même application,
complète, **sans aucune authentification**. Netlify compte les deux, Access une seule.
Ce n'est pas une fuite — l'application est locale d'abord, ce visiteur n'obtient qu'un
espace vide. Mais la porte ne compte pas ce qu'on croit. ⮕ **Redirection à l'ordre du
jour du 2 septembre.**

⮕ **Ce que ça change pour toute session** : on ne développe plus « avant les
utilisateurs ». Un défaut livré est un défaut que quelqu'un rencontre peut-être
déjà. Un enseignant de littérature, hors communauté de pratique, a signalé un
bug ; il a été corrigé. C'est la preuve que la porte est ouverte et qu'elle sert.

⮕ **La communauté de pratique Labo Codex se réunit le 14 septembre 2026.** Ce
n'est pas la date où les utilisateurs arrivent : c'est la date où ils se parlent.

---

## COMMENT CE FICHIER SE MET À JOUR

1. Une ligne passe à **Fait** seulement avec la phrase « vérifié comment ».
2. Une ligne ne quitte **Jamais vérifié** que par un passage réel dans l'écran,
   pas par une lecture de code.
3. Les huit gestes viennent d'`OBJECTIF-COHORTE-1.md`, arrêté par Grégoire. **Ce
   fichier-ci ne les amende pas** : il les traduit et les date.
4. Si un état change et que ce fichier ne bouge pas, c'est ce fichier qui a tort.
