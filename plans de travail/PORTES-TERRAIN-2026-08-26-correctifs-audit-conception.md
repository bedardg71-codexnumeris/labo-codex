# Portes terrain — correctifs de l'audit Conception, et convergence des duplications

**Date** : 26 août 2026 · **Version de référence** : 1.99.0
**Branches** : `correctifs-conception-1.99` (#509→#515) et `integration-476` (convergence + réparation)
**Artefact jumeau** (l'OPÉRATION — ce fichier est la TRACE) : <https://claude.ai/code/artifact/226b0244-01bf-4820-8b07-1fc40c5ba60d>
Bouton « Copier mes résultats » obligatoire : l'avancement vit dans ton navigateur, seule la copie du relevé le ramène ici.
**Origine** : `Rapports/AUDIT-conception-gabarits-2026-08-25.md` et
`plans de travail/ARBITRAGE-2026-08-24-476-volet2-duplications.md`.

## ✅ RELEVÉ RENDU LE 26 AOÛT 2026 — 21/21, ZÉRO ÉCHEC. 2/2 décisions tranchées.

| | Résultat |
|---|---|
| §0 préalable | 2/2 — build du 26 vérifié, Codex sauvegardé |
| §1 données | 4/4 — **rien à réparer** : dry-run à 0 copie, aucune écriture due |
| §2 interface | 15/15 — les quatre correctifs tiennent sur le corpus réel, sous Safari |
| §3 décisions | **3.1 tel quel · 3.2 tel quel** |

**Mesure rapportée** : la description d'une production dupliquée — « Transformer ta carte mentale
en plan de rédaction… » — est **intacte** après duplication (2.5d), et le titre a bien reçu
« (copie) ». C'était le défaut nommé par le verdict D3 de #476.

⏳ **Une mesure d'entrée non renseignée** : 2.3a (les premiers mots de l'objectif, à noter AVANT le
partage). Sans conséquence sur le verdict — 2.3b a passé, les consignes étaient bien là après le
partage —, mais la comparaison avant/après n'est pas tracée. Notée pour ne pas la croire faite.

⚠ **1.1d est cochée alors qu'elle était SANS OBJET** : le dry-run rendait 0 copie à libérer, et il
n'y avait donc rien à exécuter. Sans conséquence ici (une exécution sur 0 item n'écrit rien), mais
la rangée aurait dû rester non traitée plutôt que passée.

---

> **Ce qui échoue ici devient un item de BACKLOG, avec son numéro de porte.**
> Pas une note mentale.

---

## Pourquoi cette liste est courte

Sept correctifs ont été livrés, et **trois seulement donnent une porte**. Les deux
règles de tête du modèle ont été appliquées, pas récitées :

| Correctif | Porte ? | Pourquoi |
|---|---|---|
| **#510** saisie qui ne restait pas | **oui** | perte de saisie ; et la course réelle vit dans IndexedDB, que la session ne peut pas éprouver |
| **#509** fiche neuve qui héritait | **oui** | écrivait de fausses données dans une production neuve |
| **#511** partage qui vidait les consignes | **oui** | contenu pédagogique perdu au transport, sur ton corpus |
| **#513/#514** le document distribué | **oui** | une feuille remise à 34 personnes ; le PDF réel n'existe pas en session |
| #512 cran par défaut de l'aperçu | non | comportement, réversible d'un clic — tu le signaleras si ça cloche |
| #515 couleur de l'avis de débordement | non | apparence |
| #476 convergence des duplications | **oui** | 3 portes déjà écrites le 24 août, reprises ici pour un seul relevé |

Les trois portes de #476 sont **reprises telles quelles** dans cette liste : tu ne
vas pas ouvrir Safari deux fois. La fiche du 24 août reste la trace de leur
origine.

---

## §0 · Préalable

**1. Le code doit être dans ton clone.** Ces portes vérifient deux branches qui ne
sont pas encore dans `main`. Tant qu'elles n'y sont pas, ton app affiche l'état
d'AVANT les correctifs — et un faux rouge de ce genre est indétectable au récit,
parce qu'il décrit exactement ce que la porte teste.

⮕ **Ne commence pas avant que je t'aie dit « c'est dans `main`, fais `git pull` ».**

**2. Vérifie le numéro de version en bas de page** après le `git pull`. Il doit
afficher un build du **26 août** (`0826-…`). S'il affiche `0825-…` ou plus ancien,
le `git pull` n'a pas pris : recommence avant toute autre chose.

**3. Backup Codex avant le §1.** Une seule porte touche tes données (la
réparation), mais elle les touche pour de bon.

**4. `allow pasting`** dans la console avant d'y coller quoi que ce soit (Chrome
et Safari le demandent au premier collage).

---

## §1 · ⚠⚠ Données — le seul geste irréversible de cette liste

### 1.1 · Libérer les copies restées marquées « exemple »

> **Ce que tu vivais.** Tu dupliquais une grille d'exemple pour t'en servir, et la
> copie s'ouvrait en lecture seule elle aussi : champs grisés, bandeau « exemple »
> toujours là. Les copies que tu as faites AVANT le correctif sont encore dans cet
> état — le correctif ne vaut que pour les nouvelles.

**Charger le script — une seule fenêtre, pas de Terminal :**
Finder → dossier `scripts` du projet → glisser
`reparation-476-copies-marquees-exemple.js` dans un **nouvel onglet du
navigateur** (il s'affiche en texte) → Cmd+A, Cmd+C → revenir sur l'onglet de
l'app → Cmd+V dans la console, Entrée.

⚠ **Le script se colle EN ENTIER, la commande s'appelle APRÈS.** Si la console dit
`reparer476 is not defined`, c'est que le fichier n'est pas passé — recolle-le.

| | Geste | Attendu |
|---|---|---|
| 1.1a | Coller le script. | La console affiche **`Réparation #476 chargée. Lancer : await reparer476()   (dry-run)`**. Si tu ne vois pas cette ligne exacte, le fichier n'est pas chargé. |
| 1.1b | Taper `await reparer476()` — **c'est le dry-run, il n'écrit rien**. | Un rapport qui commence par **`RÉPARATION #476 — copies restées marquées « exemple »`** puis **`👁 DRY-RUN — aucune écriture`**. |
| 1.1c | **Copie le rapport entier et colle-le-moi AVANT d'exécuter.** | *(mesure — écris ici le total annoncé : combien de copies à libérer)* |
> **RELEVÉ DU 26 AOÛT — RIEN À RÉPARER, la porte 1.1d est SANS OBJET.**
> Dry-run sur les données réelles : **13 collections scannées, 0 copie à libérer.**
> Les 16 items du namespace `demo_` (2 échelles, 3 grilles, 11 productions) sont tous reconnus
> comme exemples fournis et laissés intacts — le critère « marque démo ET id absent du pack »
> a fait exactement son travail. Le défaut D1 existait, Grégoire ne l'a pas subi : aucune copie
> bloquée dans son corpus. **Aucune écriture n'a eu lieu, et aucune n'est due.**
>
> ⚠ **Ce que le rapport a révélé, en revanche** : « Auteur actif : **Inconnu** ». C'est le libellé
> que rend `obtenirAuteurActif` faute de profil résolu, pas une identité. S'il y avait eu quelque
> chose à réparer, le script aurait écrit « Inconnu » dans `auteur` — remplaçant une attribution
> juste par une fausse, durablement. **Corrigé le jour même** : un auteur non identifié n'est plus
> écrit ; la marque « exemple » part quand même, puisque c'est elle qui bloque l'édition.
> Verrouillé par deux cas de plus dans la sentinelle (9 cas, break-test ROUGE).

| 1.1d | Après mon feu vert seulement : `await reparer476({executer: true})`, puis recharge la page. | Chaque collection dit « n copie(s) libérée(s) ». Tes copies s'ouvrent désormais **modifiables**. |

`⚠⚠ Données` `Console`

> **Si le script refuse** en disant `REFUS : le pack de démarrage n'est pas chargé`,
> ce n'est pas une panne : c'est une garde. Recharge la page et recommence.
> Sans le pack, le script ne saurait plus distinguer tes copies des exemples
> fournis, et il les libérerait tous.

---

## §2 · Interface — ce que seuls ton Safari et ton corpus peuvent dire

### 2.1 · La saisie qui ne restait pas — #510

> **Ce que tu vivais.** « Les boutons d'enregistrement des paramètres semblent
> avoir causé des soucis à quelques moments : on dirait que les données n'étaient
> pas toujours enregistrées. » Tu remplissais un champ, il n'était plus là ensuite.
> C'est le geste de passer d'un champ au suivant qui le déclenchait.


> ⚠ **N'utilise pas le bouton « Enregistrer » dans cette porte, et pars d'une grille QUI EXISTE
> DÉJÀ.** Les noms de critères ne passent pas par ce bouton : ils s'enregistrent seuls quand tu
> quittes le champ, et c'est ce mécanisme-là qui perdait ta saisie. Cliquer « Enregistrer »
> réécrirait tout d'un coup et rendrait le défaut invisible — la porte dirait « ça marche » sans
> avoir rien vérifié. Sur une grille neuve non encore enregistrée, il n'y a d'ailleurs pas de
> critère à nommer : le code cherche la grille en base et abandonne s'il ne l'y trouve pas.

| | Geste | Attendu |
|---|---|---|
| 2.1a | Ouvre une grille **déjà enregistrée**. Nomme le **critère 1**, puis clique **directement** dans le nom du **critère 2** et nomme-le. Ne clique nulle part entre les deux, et **ne touche pas à « Enregistrer »**. | Les deux champs portent ce que tu viens d'écrire. |
| 2.1b | Recharge la page (Cmd+R) et rouvre **la même grille**. | **Les deux noms sont là.** Avant : le premier des deux pouvait être vide, sans un mot d'erreur. |
| 2.1c | Même chose sur une **échelle déjà enregistrée** : renomme deux niveaux d'affilée, recharge, rouvre. | Les deux noms sont là. |

`⚠⚠ Données`

### 2.2 · La fiche neuve qui portait les consignes de la précédente — #509

> **Ce que tu vivais.** Deux choses, en fait. Au tout premier « + Nouvelle
> production » d'une session, la fiche n'affichait AUCUN bloc de consignes — ni
> objectif, ni description, ni détail : rien à remplir. Et après avoir édité une
> production, la fiche « neuve » gardait ses blocs personnalisés et ses titres
> réécrits, qui s'enregistraient alors dans la nouvelle production.

| | Geste | Attendu |
|---|---|---|
| 2.2a | **Au tout premier geste** après avoir ouvert l'app : va dans Productions et clique « + Nouvelle production ». | Les trois blocs — objectif, description de la tâche, détail — sont **affichés et vides**. Avant : aucun bloc. |
| 2.2b | Annule. Ouvre une production qui a des **blocs personnalisés** (« Remise du travail », par exemple) ou un titre de bloc réécrit. Puis clique « + Nouvelle production ». | La fiche neuve n'a **que les trois blocs d'origine, vides**, avec leurs titres par défaut. Aucun bloc de la production précédente. |

`⚠⚠ Données`

### 2.3 · Partager une production sans la vider — #511

> **Ce que tu vivais.** Tu ajoutais une production à ta bibliothèque pour la
> partager ou la réutiliser, et elle y arrivait sans ses consignes : ni objectif,
> ni tâche, ni détail, ni pondération. Une coquille, et rien ne le disait.

| | Geste | Attendu |
|---|---|---|
| 2.3a | Prends une production dont **l'objectif, la tâche et le détail** sont remplis. Note son objectif. | *(mesure — écris ici les premiers mots de son objectif)* |
| 2.3b | Ajoute-la à la bibliothèque, puis rouvre-la **depuis la bibliothèque**. | **Ses consignes sont là**, l'objectif que tu viens de noter en tête. |

`⚠⚠ Données`

### 2.4 · Le document que tu distribues — #513 et #514

> **Ce que tu vivais.** Une production sans grille ne pouvait pas produire son
> document de consignes : le bouton te renvoyait au formulaire de préparation, qui
> réclamait justement la grille qui manquait. Et un détail de tâche long était
> dessiné sous le bas de la feuille — donc absent du papier, alors que l'aperçu
> annonçait « le PDF le poursuivra sur une page de plus ».

| | Geste | Attendu |
|---|---|---|
| 2.4a | Prends une production **sans grille** et demande son PDF. | L'aperçu **s'ouvre** sur ses consignes. Avant : retour au formulaire de préparation. |
| 2.4b | Prends une production **avec grille, échelle et cartouche** et demande son PDF. | L'aperçu s'ouvre sur le **document complet**, pas sur la seule page de consignes. |
| 2.4c | Écris (ou prends) un **détail de tâche long** — des consignes numérotées qui dépassent une page. Télécharge le PDF et ouvre-le. | Le texte **se poursuit sur la page suivante**. Rien n'est coupé, aucune ligne ne manque à la fin. |
| 2.4d | **Imprime cette page-là**, ou regarde-la en aperçu avant impression. | Ce que tu vois à l'écran est ce qui sort sur le papier. |

`iPad` *(2.4d seulement si tu imprimes depuis l'iPad)*

### 2.5 · Les duplications — #476 (reprise des portes du 24 août)

> **Ce que tu vivais.** Tu voyais une grille d'exemple en lecture seule, l'app te
> disait d'en faire une copie pour l'utiliser — et la copie s'ouvrait en lecture
> seule elle aussi. Et la copie d'une production portait exactement le même titre
> que l'originale, avec une description silencieusement remplacée.

| | Geste | Attendu |
|---|---|---|
| 2.5a | Module Grilles. Duplique une **vraie grille d'exemple** depuis la **barre latérale**. | Une copie est créée et s'ouvre. |
| 2.5b | Regarde la copie. | Les champs sont **modifiables**, plus de bandeau « exemple », et l'auteur c'est **toi**. |
| 2.5c | Module Productions. Prends une production dont la **description** dit autre chose que l'activité — note son texte. | *(mesure — écris ici les premiers mots de sa description)* |
| 2.5d | Duplique-la, puis ouvre la copie. | Le **titre** finit par « (copie) », et **la description notée est intacte**. |
| 2.5e | Fais une duplication de ton usage courant, quel que soit le bouton. | Rien de cassé, rien de surprenant. *(Pas d'attendu précis : cette rangée sert à ce que ton œil attrape ce à quoi je n'ai pas pensé.)* |

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Il n'y a rien à cocher, seulement à écrire.
Les deux gagnent à être tranchées APRÈS avoir vu les écrans du §2.

### 3.1 · Le formulaire de préparation, lui, exige toujours une grille

Le bouton PDF de la **fiche de production** s'ouvre maintenant sans grille (2.4a).
Mais si tu passes par le **formulaire de préparation** — l'écran qui te demande
grille, échelle et cartouche — son bouton « Aperçu » reste grisé tant que la
grille et l'échelle manquent. Je ne l'ai pas touché : ce chemin n'a pas de
production d'où déduire les consignes.

**VERDICT** (le laisser tel quel, ou l'ouvrir aussi ?) : ______________________

### 3.2 · Le cours d'une production qui voyage — #521

Quand une production est partagée ou restaurée depuis une archive, son
rattachement à un cours n'est **pas** transporté : elle arrive sans cours, et tu
la rattaches à l'arrivée. C'est le comportement d'aujourd'hui, inchangé depuis
toujours. Le transporter ferait apparaître une production reçue sous un cours
homonyme du destinataire — ou sous un cours qui n'existe pas chez lui.

**VERDICT** (garder tel quel, ou transporter le cours ?) : ____________________

---

## §4 · Ce que je n'ai pas pu vérifier

1. **Safari et l'iPad.** La session n'a que Chromium, et encore : la plupart des
   vérifications ont été faites en Node, pas dans un navigateur. Tout ce qui suit
   est donc éprouvé par la logique, pas par l'œil.

2. **#510 — la course n'a pas été reproduite dans les vraies conditions.** Ma
   sentinelle monte la vraie base, mais Node n'a pas IndexedDB : elle tourne en
   mode localStorage-seul. La course existe dans les deux modes, et le remède est
   le même — mais le timing réel de Safari avec IndexedDB n'a jamais été rejoué.
   C'est pour ça que 2.1 est en tête du §2.

3. **#514 — aucun PDF réel n'a été produit.** Ma sentinelle mesure les
   coordonnées de ce qui est dessiné, avec un faux jsPDF qui note la page et
   l'ordonnée de chaque tracé. C'est solide sur la géométrie, et muet sur le
   reste : polices, césures, rendu d'Aperçu, imprimante. D'où 2.4c et 2.4d.

4. **#511 — seul le partage est dans les portes, pas l'import d'archive.** Les
   deux chemins passent par le même filtre, et c'est lui qui est corrigé et testé.
   Réimporter une archive complète est un geste lourd que je ne te demande pas
   pour ça.

5. **#512 et #515 ne sont pas dans cette liste**, et c'est délibéré : un cran
   d'aperçu qui s'ouvre au mauvais niveau et une couleur d'avis illisible sont
   réversibles d'un clic. Tu les verras en usage normal, et tu me le diras.

6. **Une erreur de la session, rattrapée de justesse.** La sentinelle de #514
   était d'abord **complaisante** : elle comptait les titres de bandeaux, qui sont
   posés centrés, et restait donc verte alors même que le défaut qu'elle devait
   attraper était présent. C'est le break-test qui l'a montrée, pas la relecture.
   Sans lui, j'aurais livré un garde-fou qui ne gardait rien — et je te l'aurais
   annoncé comme une preuve.

7. **La réparation 1.1 n'a jamais tourné sur tes données.** Son critère est
   verrouillé par sept cas de test et deux break-tests, mais tes copies réelles
   peuvent porter des combinaisons que je n'ai pas imaginées. C'est pour ça que le
   dry-run vient avant, et que je te demande le rapport avant d'exécuter.
