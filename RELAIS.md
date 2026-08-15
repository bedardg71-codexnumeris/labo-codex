# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | **`main`** |
| **Version** | **1.83.2** — build `0815-1255` |
| **Travail en avance sur `main`** | **aucun** |
| **Dernière mise à jour** | 15 août 2026 — recherche dans la Carte d'alignement (1.81.0), deux correctifs sur retour terrain (1.81.1 teinte du halo, 1.81.2 barre rognée sur iPad), **porte terrain rejouée et close à 45/46**, puis routage des liens + verbe « se réactive dans » (1.82.0) son réglage dans Actions (1.83.0) « Révision » passée à « se réactive dans » (1.83.1) et bascule des liens existants (1.83.2). Vitest 2448/2448 |

⚠⚠ **AVANT TOUTE FUSION EN CONTENEUR : `git fetch --unshallow origin`.** Le clone
du conteneur est **shallow**, et son `main` LOCAL peut pointer des semaines en
arrière (15 août : 89 commits de retard, greffe au 3 août). `git merge --ff-only`
répond alors **« refusing to merge unrelated histories »** — un message qui fait
croire à un dépôt corrompu alors qu'il ne dit que « l'historique est tronqué ».
Ensuite, vérifier que le `main` local est bien un **ancêtre** d'`origin/main`
(`git merge-base --is-ancestor main origin/main`) : c'est ce qui distingue « en
retard » de « divergent ». ⮕ Cette mise en garde avait été écrite le 9 août, puis
**perdue** dans une réécriture du fichier ; elle a mordu de nouveau le 15. Ne pas
la retirer.

⚠ **VÉRIFIE `origin/main` AVANT DE CROIRE CE TABLEAU.** Le 12 août au matin, ce
fichier disait « aucune dette de fusion, 0/0 » alors qu'`origin/main` avait un
commit d'avance, poussé la veille au soir depuis une session cloud. Le rituel de
début l'a attrapé ; il ne l'aurait pas fait sans `git fetch`.

⏳ **CE QUI RESTE DÛ** :
- ⚠ **ARTEFACT DE PORTE TERRAIN — un guillemet tronquait les MESURES.** Trouvé
  au rituel de clôture du 15 août, corrigé et republié : `esc()` n'échappait pas
  le guillemet droit, injecté dans `value="…"`. Le stockage était intact, mais
  rééditer un champ tronqué aurait écrasé la valeur complète. ⏳ **Si Grégoire a
  saisi une mesure contenant un guillemet avant la correction, elle est à
  revérifier sur la page.**
- ▣ **BASCULE DES LIENS EXISTANTS : LIVRÉE en 1.83.2.** Elle joue au chargement
  de chaque carte, une seule fois, et se DIT (console + toast). Elle ne touche
  ni la direction des liens ni aucun autre verbe. ⏳ **À observer sur sa vraie
  carte** : le compte annoncé au premier chargement doit correspondre à ce
  qu'il attend — c'est la seule vérification qui reste, et elle est de son côté.
- ⏳ **NON ÉPROUVÉ : la BEAUTÉ des tracés de liens sur sa vraie carte.** Le
  routage garantit qu'un lien ne traverse pas de bloc (mesuré : 58/60 libres sur
  carte dense) ; il ne garantit pas que le détour soit joli. Seul son œil peut
  le dire, et aucune porte terrain ne couvre encore ce point.
- ✅ **PORTE TERRAIN DE LA RECHERCHE : PASSAGE CLOS, 45/46, ZÉRO ÉCHEC.**
  Deux défauts trouvés par le terrain, corrigés et **revalidés sur son iPad**
  le 15 août : la **teinte du halo** (ocre désaturé emprunté au jeton d'alerte
  → jaune vif, 1.81.1) et la **barre d'outils rognée sur iPad en portrait**
  (débordement PRÉEXISTANT au champ, mesuré à 783 px pour 728 dès 1.80.0 →
  passage à la ligne, 1.81.2). ⏳ **Restent dues, mineures** : la rangée
  « taper `lecon` puis `expose` » de la **2.4**, et la mesure **2.2m**.
  ⮕ **Ses verdicts §3, tous rendus** : ⌘F non branché (3.1), seuil de 2
  caractères conservé (3.2, après correction de sa part), type de bloc gardé
  tel quel malgré 22 évaluations et 32 leçons remontées (3.3), largeur du champ
  bonne (3.4), épaisseur du halo bonne (3.5). **Aucune décision en suspens.**
- ~~Porte terrain neuve à traiter~~ (close, ci-dessus) —
  `plans de travail/PORTES-TERRAIN-2026-08-15-recherche-carte.md` (artefact :
  <https://claude.ai/code/artifact/508d3560-7111-4f1d-85c1-9a6b7c5323cc>).
  14 portes, **46 vérifications, 4 mesures, 5 décisions**. Elle porte la
  recherche de la Carte d'alignement (1.81.0). Trois points y sont bloquants
  pour la suite : la **2.6** (le halo se voit-il sur ses douze fonds de
  canevas — l'ambre seul en ratait la moitié, mesuré), la **2.12** (iPad, rien
  n'a jamais été vu), et les **deux mesures de la 2.4** dont dépend la
  décision **3.3** (chercher par type de bloc reste-t-il lisible sur sa vraie
  carte). ⮕ **ÉTAT AU RETOUR DU TERRAIN : 44 passées, 1 échec, 1 non traitée.**
  Restent dus : la **2.1c** (ÉCHEC — sur iPad en PORTRAIT, les boutons de droite
  de la barre ne sont pas tous là), la rangée « taper lecon puis expose » de la
  **2.4**, la mesure **2.2m**, et **la 2.6 ENTIÈRE À REFAIRE** — elle a été
  validée avec l'ancienne teinte du halo, remplacée depuis en 1.81.1.
  ⮕ **Les deux ont été REJOUÉES SUR SON IPAD le 15 août et passent.**
- **5 rangées de porte terrain non traitées** —
  `plans de travail/PORTES-TERRAIN-2026-08-12-416-lots-CGIHB.md` : 3.3 (supprimer
  un gabarit) en entier, la fin de 4.1 et de 4.3. **Plus les deux corrections du
  jour à revérifier** : la case « Travail hors classe » qui ne déclenchait rien,
  et le Markdown du Calendrier repassé en sections.
- **5 specs Playwright ROUGES** — versées au backlog en **#456**. Préexistantes,
  mesurées sur `main` AVANT le chantier, donc aucune régression. Elles ne
  tournaient nulle part : WebKit manque aux conteneurs, et personne ne les
  lançait en local.
- **Les trois info-bulles du gabarit des productions (1.80.0) n'ont jamais été VUES** —
  199 à 238 caractères dans une bulle de 320 px, et sur iPad elles s'ouvrent au
  long-press, pas au survol. À éprouver sur son matériel, dans les deux modes.
- **#455** — le cours est-il global ou par session ? Deux fichiers répondent
  l'inverse à trois jours d'écart. Aucune conséquence visible aujourd'hui, une
  collision certaine dès qu'un 601-101 d'automne sera créé.

⮕ **Où lire la suite** : le bloc **15 août (matin)** de `SESSION.md`, en tête de
fichier. Il porte les trois défauts que seule la MESURE a trouvés sur la
recherche — dont une normalisation d'accents que mon propre test déclarait
verte parce que ses exemples ne pouvaient pas la mettre en défaut, et une
première correction de contraste qui était insuffisante et que seule la
SECONDE mesure a démasquée. Puis le bloc **12 août**.
Il porte les deux défauts trouvés par la porte terrain — dont le troisième
retour d'une même classe de bug dans `planification-carte.js` — et les onze
tests qui n'observaient pas ce qu'ils annonçaient.

---

> ▣ **HISTORIQUE — état du 11 août, conservé pour la méthode.** L'état courant est
> le tableau en tête de fichier ; celui-ci ne vaut plus. (Son en-tête de tableau
> avait été mangé par une réécriture, ce qui le faisait passer pour la suite du
> bloc courant — réparé le 15 août.)

| | |
|---|---|
| **Branche à ouvrir** | **`main`** |
| **Version** | **1.75.0** — build `0811-1319` |
| **Travail en avance sur `main`** | **aucun** |
| **Prochaine session** | **jeudi prochain** (décision de Grégoire, 11 août) |
| **Dernière mise à jour** | 11 août 2026, clôture — fusion + déploiement |

✅ **Aucune dette de fusion.** Le cycle du 11 août (**17 commits, 1.71.1 → 1.75.0**)
est sur `main`. Suite rejouée sur l'arbre fusionné : Vitest **2226/2226**
(248 fichiers), arbre propre, `origin/main ↔ HEAD : 0 / 0`.
Dernier ID utilisé : **#451**.

⮕ **Où lire la suite** : le **§3 de `SESSION.md`** porte la consigne complète —
prémisse chiffrée, priorité 0 (ce qui touche sa rentrée), les dettes datées de
septembre, et la leçon de la journée sur l'écriture des tests.

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

1. ⚠️ **#368 — vérifier EN PREMIER que la carte 601-101 est bien passée en A26.**
   Le geste est outillé depuis 1.49.0. Il a travaillé toute la journée sur
   « Écriture et littérature (A26) », mais c'est le NOM de la carte, pas son
   trimestre — et ses grilles H26 vivent encore sous `h2026`.
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
