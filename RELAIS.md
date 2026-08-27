# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | **`main`** — tout y est. Aucun travail en avance ailleurs. |
| **Version** | **1.101.1** — build `0826-1658`. ⏳ **BUMP DÛ** : Grégoire a eu l'application ouverte en `file://` toute la soirée du 26, et la règle du projet interdit de bumper le build pendant une session ouverte. Les `?v=` ont donc été bumpés **à la main, fichier par fichier, à chaque lot** — la sentinelle anti-cache est verte. Le bump de version reste à faire au prochain démarrage. |
| **Version précédente** | **1.100.0** — la session du 25-26 a livré 16 items depuis 1.99.0 |
| **Travail en avance sur `main`** | **NON — tout est poussé** (vérifié le 27 août à 5 h 20 : `git log origin/main..HEAD` vide). La ligne d'hier annonçait le contraire ; elle avait été écrite avant le push de 22 h 25. **Rien sur aucune branche.** |
| **Suite Playwright** | baseline à **1 seul échec connu** (contre 8 avant #495) : `productions-ajout-refus-garde-340` = **#530**, un vrai bug, pas du bruit. |
| ⚠ **AVANT TOUTE SUITE PLAYWRIGHT** | **fermer GitHub Desktop.** Les specs lisent l'arbre de travail en direct ; une commande git lancée pendant la suite change les fichiers sous leurs pieds et fait rougir des specs au hasard. Trouvé le 26 août (#523), règle versée au skill `portes-terrain`. |
| ⚠ **LE CLONE DE GRÉGOIRE EST L'ARBRE DE TRAVAIL** | `/Users/kuekatsheu/Documents/GitHub/Monitorage_v6` sert à la fois de dépôt de travail et de source `file://` pour son app. Il voit les modifications dès qu'il recharge, **avant tout push** — et peut donc tomber sur un état intermédiaire. Le `git pull` des portes terrain lui est inutile. |
| 📐 **CHANTIER MAJEUR EN ATTENTE** | **#529 — sortir SRPNF et IDME du code.** Session DÉDIÉE (décision Grégoire, 26 août). Sa règle : « rien ne doit être codé en dur, mais l'échelle IDME peut être seedée ». Audit : `Rapports/AUDIT-srpnf-code-en-dur-2026-08-26.md`. |
| ⏳ **ÉCHÉANCE DATÉE — 1er SEPTEMBRE** | **#427** (refermer l'accès public) et **#508** (l'avis d'accueil qui l'annonce). Fiche opératoire prête : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. **Dû par Grégoire** : la liste nominale des personnes à inviter et les trois noms Cloudflare — personne ne peut les préparer à sa place. |
| ⚠ **DEUX SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT** | Et elles ne se voyaient pas. Un `git add -A` de la session « audit Conception » a emporté le `js/saisie-presences.js` de l'autre dans son commit de relais ; sorti et rendu avant le push. ⮕ **La consigne du projet vaut : ajouter par chemins EXPLICITES**, jamais `-A`, sur ce dépôt. ⮕ Et le hook pré-push teste l'ARBRE DE TRAVAIL, pas les commits envoyés : tant qu'une autre session y travaille, il rend un verdict sur un mélange des deux — le rouge qu'il annonce peut n'avoir aucun rapport avec ce qu'on pousse. ⮕ **ET C'EST ARRIVÉ UNE SECONDE FOIS LE MÊME JOUR, dans l'autre sens.** Le commit `38c6b574` (« #529 lots 3-4 », profil étudiant) a emporté les `BACKLOG.md` et `SESSION.md` de la session « présences » — l'inscription de l'item **#538** et la renumérotation **#534 → #537** vivent donc dans un commit qui parle d'autre chose. Rien n'est perdu, la trace est fausse ; poussé, donc non réécrit. **Deux avertissements en un jour : sur ce dépôt, `git add` par chemins explicites n'est pas une préférence, c'est la seule méthode qui tienne.** |
| ⚠ **TROIS SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT AU SOIR** | Et une **quatrième journée de collisions d'index** s'y est ajoutée : un `git add` suivi d'un `git commit` a emporté le travail d'une autre session entre les deux gestes. Défait et rendu avant tout push. ⮕ **La méthode qui tient : `git add -N <fichiers neufs>` puis `git commit -- <chemins explicites>` DANS LA MÊME COMMANDE.** `--only` seul refuse un fichier neuf (« did not match any file(s) known to git ») ; `git add` puis `commit` rouvre la fenêtre. ⮕ **Et le même oubli d'anti-cache s'est produit QUATRE fois en deux jours, sur trois sessions et trois chantiers sans rapport** : un fichier modifié dont le `?v=` ne suit pas. Ce n'est plus une étourderie — **c'est une lacune du filet**, inscrite en **#547** : la sentinelle compare des COMMITS, elle ne peut donc rien voir tant que le travail est dans l'arbre, et le hook `pre-push` la lit trop tard. Le geste correcteur est connu de tous et appliqué correctement à chaque fois ; ce qui manque, c'est le RAPPEL AU BON MOMENT. |
| **Dernière mise à jour** | **27 août 2026, matin** — #542 lot 3 : pas 1 et 2 livrés. Le bump de version reste dû. |

## Ce que la matinée du 27 août a livré

**#542 lot 3, pas 1 et 2** — `4d04dd21`, `750e7c3f`. Le nombre de pas était plafonné à deux
par la consigne ; deux ont été faits.

**La décision qui commandait tout, prise avant la première ligne de code — OPTION B** :
l'étiquette SOLO est facultative, et son absence est DITE. Sans étiquette, le dépistage
rend le **nom du niveau atteint** et nomme ce qui manque. Il ne se tait pas (A), il
n'invente pas (C). ⮕ **Conséquence pour le pas 5 : les seuils `idme.*` n'ont plus aucun
rôle de repli possible.**

- **Pas 1** — `situerPourcentageDansEchelle` : la moyenne se situe dans les plages de
  l'échelle de l'UTILISATEUR. Hors plage rend `null`, **sans repli « plus proche »** — un
  repli par distance fabrique une réponse que l'échelle ne donne pas.
- **Pas 2** — `interpreterNiveauAtteint` : l'interprétation vient de l'étiquette SOLO. Les
  quatre descriptions rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`), leur source
  unique.

⚠ **RIEN N'EST BRANCHÉ À L'ÉCRAN** — les deux fonctions n'ont aucun appelant, et
l'application se comporte exactement comme avant. C'est délibéré : le branchement est le
pas 3. **Playwright n'a rien de neuf à observer ; il en aura au pas 3.**

⏳ **DÛ PAR GRÉGOIRE avant le pas 3** : valider **« Aucun aspect pertinent n'est traité »**
(description de « préstructurel »). Seul texte écrit à neuf du lot — l'ancien code n'en
produisait que quatre pour cinq niveaux SOLO.

⮕ **Une donnée neuve versée à #547** : la sentinelle anti-cache exige un `?v=` du **jour du
build**, pas du jour de la modification. Poser `20260827a` sous un build `0826-1658` la fait
rougir. Les deux règles du projet se contredisent dès qu'on travaille le lendemain d'un
build — ce qui **écarte la piste (b)** de #547 et laisse la piste (a), un contrôle qui
SIGNALE au pre-commit.

**Vitest 3635/3635 (340 fichiers)**, lu après le dernier changement. 20 tests neufs,
**8 break-tests rouges vérifiés**, restauration confirmée par `diff -q`.

---

## Ce que la soirée du 26 août a livré (21e cycle)

**Trois chantiers, trois sessions, tout sur `main`.**

### #540 — CLOS. L'assiduité comptait des périodes qui n'existaient pas.

Parti d'une capture de Grégoire : « le nombre d'heures de cours par semaine n'est pas
dans les formulaires ». L'audit a montré l'inverse — il y était, dérivé et jamais
vérifié — puis a découvert bien pire en chemin.

| Lot | Ce qu'il a fait |
|---|---|
| **A** | La pondération devient obligatoire (astérisque, refus dit), normalisation vers « 2-2-3 ». **Un export orphelin trouvé** : `proposerHeuresEnseignementDepuisPonderation` n'a JAMAIS fonctionné — jamais exportée sur `window`, le dispatcher ne la trouvait pas. |
| **B** | Le `× 15 semaines` en dur retiré : les semaines se comptent au calendrier. Un 2-2-3 sur onze semaines vaut 44 h, pas 60. |
| **C** | L'écran Horaire cesse d'afficher `nbSeances × periodesParSeance` et affiche ce qu'il compte. Les replis à `2` taris. |
| **E1** | **Chaque séance porte SON nombre de périodes**, saisi et jamais déduit. Le champ global disparaît. |
| **E2** | **Plus aucune division** ne convertit une durée en périodes. Les deux migrations cessent de deviner. |
| **E3** | Le réglage « Durée d'une période » disparaît. La saisie n'écrit plus le champ `heures`. |
| **D** | L'horaire est confronté au devis du cours, et le dit. Jamais bloquant. |

⮕ **CE QUE GRÉGOIRE A APPORTÉ, ET QUI N'ÉTAIT NULLE PART DANS LE CODE** : « une heure
qui dure 60 minutes, c'est une période de 50 minutes plus 10 minutes de pause. Dans
d'autres collèges, 55 plus 5. » Tout le dépôt divisait un temps d'horloge par la seule
durée d'enseignement : `08:00 → 11:00` rendait **4 périodes au lieu de 3**, et un bloc
de quatre heures — cas courant en littérature — en comptait **5 pour 4**. L'erreur
croissait avec la durée, et ce nombre EST le dénominateur de l'assiduité : **un élève
pouvait être compté absent d'une période qui n'existe pas.**

⮕ Puis sa question a tranché le chantier : « je me demande si la durée de la période est
pertinente et si elle ne crée pas davantage de confusion. » L'audit lui a donné raison —
ce champ n'existait que comme **pont entre deux unités**, et un ratio est invariant par
unité. Il ne servait pas à calculer l'assiduité, seulement à réconcilier deux modes de
saisie.

⮕ **EN UNE PHRASE** : l'application ne convertit plus jamais une durée en périodes, parce
qu'elle ne le peut pas. Elle demande les deux, et les confronte.

### ⚠ CE QUE #540 LAISSE, ET QUI DEMANDE UNE DÉCISION

- **Les `nombrePeriodes` déjà écrits en base par les migrations** peuvent être gonflés.
  Elles ont tourné à chaque démarrage pendant des mois. Irréparables sans savoir ce que
  `duree` signifiait — personne ne peut le dire après coup.
- **Les horaires existants de Grégoire** ont des séances sans `nombrePeriodes`. Le
  chargement pré-remplit avec `periodesParSeance` (sa propre déclaration, pas une
  déduction), mais il doit **ouvrir chaque horaire et enregistrer** pour que ce soit
  écrit sur les séances.
- **Cinq `alert()`** subsistent dans `trimestre-v2-cours.js`, sur d'autres gestes
  qu'« Enregistrer ». Et `mettreAJourLigne` (`saisie-presences.js`) est **du code mort** :
  elle lit un champ `heures_${da}` que plus personne ne génère.

### #541 — le dépistage classait TOUT LE MONDE en « Étendu »

Livré et poussé (`69ce1483`) par la session « audit dépistage ».
`obtenirNiveauIDMEDepuisPourcentage` recevait un pourcentage 0-100 et le comparait à des
seuils 0-1 : **tout critère au-dessus de 1 % ressortait « Étendu »**, y compris à 12 %.
Le bloc « Forces et défis » ne pouvait afficher que des forces exceptionnelles, pour tout
le monde. Défaut antérieur à #529, au moins depuis le 17 mai. Aucun test ne l'exerçait.

Plan versé : `plans de travail/PLAN-SOLO-echelle-et-depistage.md` (`43cc4faa`), six lots.

### #542 — EN COURS, session encore active au moment d'écrire

Lots 0 et 1 livrés, oracle écrit. **Lots 2-3 en cours.** Ses fichiers :
`js/interventions.js`, `js/profil-etudiant-calculs.js`,
`js/profil-etudiant-sections-affichage.js`, `js/echelles.js`.

⮕ **LA DÉCOUVERTE QUI DÉPASSE LES TROIS CHANTIERS, et qui n'est de personne :**

> **383 évaluations sur 670 — 57 % des niveaux — désignent une échelle introuvable**,
> dont 339 sous le seul id `1767389426695` en H2026. Les valeurs survivent sous deux
> autres ids. Même patron que les grilles désappariées du 5 août.

**Le dépistage de Grégoire tourne aujourd'hui sur moins de la moitié de ses données, sans
le dire.** Antérieur à tous les chantiers de la soirée. Aucune réparation engagée : c'est
une décision sur ses données réelles, avec sauvegarde et dry-run. L'oracle du 26 sert à
identifier laquelle avant d'y toucher.

⮕ **Prochain ID libre : #548.** ⚠ Ce chiffre a bougé QUATRE FOIS pendant la rédaction de ce
relais — il annonçait #543, déjà pris, puis #547 l'a été à son tour. Les collisions ont été
évitées en inscrivant chaque item au backlog AVANT de l'employer ; **vérifier le dernier ID
au moment d'écrire, jamais celui qu'un document annonce.**

### ⚠ Une leçon qui vaut pour ce fichier lui-même

**Les documents de coordination se périment plus vite que le travail qu'ils décrivent.**
Constat de la session #541 sur son propre cadrage d'audit : quatre de ses affirmations
étaient fausses deux heures après l'avoir écrit, dont « aucune réparation n'a été engagée »
alors qu'elle venait de l'être sur les données réelles. Son périmètre avait doublé — 11
commits devenus 22. Elle a inscrit les corrections DANS le document plutôt que de les
effacer, et c'est le bon geste : dans un dépôt à trois sessions, la vitesse de péremption
d'un cadrage est une donnée en soi.

⮕ **Ce relais-ci ne fait pas exception.** Le lire au début d'une session, oui ; le croire
sur les chiffres, non — vérifier `git log`, `BACKLOG.md` et l'arbre.

### L'audit externe des 26-27 août

`Rapports/CADRAGE-AUDIT-FABLE5-2026-08-27.md` (commits `9ac3c86c` puis `8269e8de`).
Grégoire le donnera à **Fable 5** pour auditer le travail des deux chantiers : vérification
adverse et intégrité des données. **La conception est HORS PÉRIMÈTRE**, sur sa décision
explicite.

### Défauts trouvés et NON corrigés (inscrits, pas oubliés)

- `interventions.js:221` — `seuils.acceptable` est `undefined` (la clé vit sous
  `interpretation.acceptable`) : `score < undefined` est toujours faux, donc **la liste
  des défis communs d'un sous-groupe est toujours vide**.
- `portfolio.js:543` et `:554` — un quatrième repli IDME en dur, dont la clé de lecture
  `echellesPerformance` n'est **jamais écrite** nulle part : le repli est toujours actif.

---

## Ce que le cycle a livré

**Cinq versions, toutes nées de son travail réel** — il préparait son 601-101 dans
la Carte d'alignement, et chaque friction est devenue une livraison le jour même :

| | |
|---|---|
| **1.72.0** | ⌘D duplique toute la multi-sélection (Supprimer la traitait déjà — c'était une asymétrie, pas un manque) |
| **1.73.0** | « Tout voir » + **loupe de navigation** (sa carte est illisible à 25 %, qui était le plancher du zoom) |
| **1.74.0** | Guides magnétiques + six commandes d'alignement |
| **1.74.1** | Le clic dans la carte atterrit · le pointeur devient la zone examinée |
| **1.75.0** | **#448** — une collision d'id à l'import n'est plus un accident à renommer |

Plus : **#451 clos** (a2026 porté dans Safari), **#450** et **#449** documentés
sur mesures, `SKILL_portes_terrain.md` amendé, et trois outils de console
(`diagnostic-448`, `reparation-448`, `inspecterOrphelins448`).

---

## ⚠ CE QUI RESTE DÛ, ET QUI N'EST PAS DU CODE

**Sa rentrée est dans trois semaines.**

0. ✅ ~~**SES CARTOUCHES ORPHELINES — à récupérer.**~~ **FAIT le 24 août au
   soir, par Grégoire lui-même.** Les 6 cartouches A26 de sa soirée (lots 16 et
   5 du dry-run) sont rattachées à « Grille-5 FR-HOLIS A26 » via
   `scripts/reparation-cartouches-orphelines.js`. Les lots d'origine sont
   CONSERVÉS — filet volontaire, à retirer seulement après vérification à
   l'écran.

   ⏳ **Ce qui reste de son côté, et qui n'est pas du code :**
   · **trois paires à départager** sur cette grille — « Description d'un
     personnage » / « … A26 », « Carte mentale » / « … A26 », « Plan de
     rédaction » / « … A26 ». La garde d'identité conserve les deux exemplaires
     par construction ; c'est à lui de comparer et de retirer la périmée ;
   · « Stratégies de lecture A26 » a suivi son lot vers A, alors que
     « Stratégies de lecture » vit sur B (Grille-4 A26). S'il veut l'y déplacer,
     il faut un rattachement À LA PIÈCE — le script ne sait déplacer qu'un lot
     entier.

   ⏳ **16 lots orphelins restants, laissés À DESSEIN** : matériel démo
   (générique, Démo, les deux « rapport de laboratoire » chimie/bio), trimestres
   passés, et trois piles de doublons (le lot 12 contient « Description d'un
   personnage » DEUX fois, le 13 a « Carte mentale » en triple). Les rattacher
   inonderait ses trois grilles et recréerait les doublons fermés en 1.92. Le
   ménage est une décision séparée, avec un dry-run par lot.

0 bis. ⏳ **PORTES TERRAIN 1.95.2 — 20 rangées + 4 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-cartouches-inter-trimestre.md`
   (jumeau interactif : le `.html` de même nom). La rangée 1.1 confirme que la
   section apparaît bien chez lui après le correctif de la 1.95.1 — c'est elle
   qui avait échoué sur sa capture. Les rangées 2.0.x couvrent la persistance de
   la section pour les TROIS bibliothèques dont le rendu n'a pas été joué au
   navigateur (échelles, pratiques, productions). 10 comportements retirés de la
   liste sur preuve mesurée (`cartouches-import-trimestre.spec.js` +
   `bibliotheques-import-persistance.spec.js`).

   ⚠ **La leçon du lot, et elle vaut au-delà.** La porte 1.1 que j'avais écrite
   prévoyait l'échec et l'attribuait à SES données (« ses archives n'ont
   peut-être pas de copies »). C'était faux, et c'était mon bug. Une porte
   terrain qui pré-explique un échec par les données de l'utilisateur est une
   porte qui invite la session suivante à ne pas chercher. **Reproduire avant de
   conclure**, même — surtout — quand on a soi-même écrit l'explication qui
   arrange.

0 bis. ⏳ **PORTES TERRAIN 1.94.1 — 18 rangées + 5 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-confirmations-conception.md`
   (jumeau interactif : le `.html` de même nom). Le tri a déjà été fait —
   12 rangées ont été retirées **sur preuve mesurée** (§2 bis, harnais Chromium
   dans `tests/integration/confirmations-conception-uniformes.spec.js`). Ce qui
   reste est **structurellement invérifiable en conteneur** : Safari, l'iPad, le
   corpus réel, et les trois éditeurs (production, cartouche, pratique) dont le
   formulaire est trop lié à l'état de l'app pour être piloté. **Les 5 décisions
   du §3 attendent un verdict ÉCRIT de Grégoire**, pas une coche — deux touchent
   au libellé (guillemets droits ou français ; « sauvegardée » ou « créée » pour
   un objet neuf), une au périmètre (≈165 `alert()` de validation et d'erreur
   laissés en fenêtres natives, à migrer ou non).

1. ✅ ~~⚠️ **#368 — vérifier EN PREMIER que la carte 601-101 est bien passée en
   A26.**~~ **VÉRIFIÉ PAR GRÉGOIRE le 18 août** : « oui, la carte 601-101 est
   vraiment en A26. » Le préalable de la rentrée est levé ; l'entrée #368 est
   cochée au BACKLOG (restes optionnels : ménage des cartes, confirmation
   Safari — la carte y voyage par codex).
2. ⚠️ **#450** — renommer les deux échelles « IDME et niv 0 » d'a2025, **dans les
   deux navigateurs**. Citées 344 et 72 fois : renommer, jamais fusionner.
3. ⏳ **Safari** — les 5 copies muettes y sont encore. Chrome est nettoyé (83 → 78).
4. ⏳ **6 magasins orphelins** — décision humaine, pas de script.

---

## ⚠⚠ LA LEÇON DU CYCLE, ET ELLE COMMANDE LA SUIVANTE

**CINQ FOIS, C'EST MON PROPRE OUTIL QUI MENTAIT — et chaque fois c'est une MESURE
qui l'a dit, jamais une relecture.**

1. La barre d'alignement partait **hors écran** : offset du canevas oublié. **Le
   même oubli que la loupe deux heures plus tôt**, dans la même session.
2. « Tout voir » tombait au plancher **en silence** quand la zone n'avait pas de
   taille.
3. La loupe restait **vide** sous la grille du Planificateur — écouteur posé sur
   la zone au lieu du document. Symptôme « ça marche parfois ».
4. Mon inspecteur d'orphelins déclarait « CONTENU UNIQUE » huit fois dans un
   magasin de quatre paires : j'excluais le magasin courant de sa propre
   recherche. **Et son verdict conseillait de SUPPRIMER un contenu qui n'existait
   que là.**
5. Mon garde a refusé cinq retraits légitimes sur `dateImport` — le projet avait
   déjà une liste canonique de ces champs (`securite-hash.js:34`) ; je
   réinventais une règle à côté d'une règle existante.

⮕ **Sur les données et sur le DOM, un diagnostic lu au code est une HYPOTHÈSE.**
Le conteneur a Chromium ; reproduire coûte trois minutes, et ça a payé cinq fois.

**ET TROIS BREAK-TESTS SONT RESTÉS VERTS — trois tests trop lâches :**

- **piège `indexOf`** : rend `-1` quand le motif est absent, et `-1` est inférieur
  à tout index — une assertion d'ORDRE passe donc quand le code qu'elle protège
  DISPARAÎT. **Deux autres assertions du dépôt portaient le même piège** ;
- **valeurs non discriminantes** : 4 px et 40 px répondent pareil avec ou sans
  division par le zoom ;
- **assertion qui nomme l'invariant et en teste un plus faible** — démasquée par
  le rituel de fin, sur l'arbre final.

⮕ **Les trois ont en commun d'avoir été écrits en même temps que le code qu'ils
protègent.** Le break-test n'est pas une formalité de clôture : c'est la seule
chose qui distingue un test d'une décoration.

---

## ⚠ CE QUI N'EST PAS VALIDÉ

- **Safari et iPad** — WebKit n'existe pas dans le conteneur. Tout a été éprouvé
  dans Chromium, y compris les gestes tactiles, mais ce n'est pas son matériel.
- **Deux specs Playwright neuves n'ont JAMAIS été exécutées**
  (`planif-tout-voir-loupe.spec.js`, `planif-alignement.spec.js`) → CI.
- **Le parcours d'import COMPLET (vrai ZIP) n'a pas été rejoué.** Le correctif
  #448 est prouvé sur la ligne de fusion, en bac à sable et au navigateur — pas
  de bout en bout.

⚠ **Et un piège de harnais, noté pour la prochaine fois** : des ids de test
courts (`f1`, `v1`) apparaissent par hasard dans d'autres données. Le comptage de
citations par sous-chaîne les déclare « cités », aucun orphelin n'est détecté, et
les scénarios passent **sans rien exercer**. Utiliser des ids réalistes.

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.
