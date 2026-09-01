# Porte terrain — le matériel semé se dit-il utilisable ? (§3)

> **Mandat** : c'est la condition de fin du §3 du
> `PLAN-2026-09-01-materiel-seme-et-chemin-d-entree.md`, et elle ne peut pas être
> remplie par un banc.
>
> ⚠ **POURQUOI CETTE PORTE EXISTE, alors que Vitest et Playwright sont verts.**
> Un lot de libellés ne se prouve pas par un banc vert. Les suites lisent le
> texte livré et le trouvent conforme à ce qu'on leur a dit d'attendre : elles ne
> disent rien de ce qu'un enseignant COMPREND en le lisant. La seule question du
> §3 — « est-ce que je peux m'en servir tel quel ? » — n'a pas de témoin
> mécanique.
>
> **Règle de tête du skill `portes-terrain` appliquée** : aucune porte si une
> machine peut répondre. Tout ce qui est mécaniquement vérifiable a été retiré
> d'ici — les noms, l'exclusion d'export et le calcul de la note sont tenus par
> `sentinelle-materiel-seme-se-dit-utilisable`, `sentinelle-echelle-idme-de-depart`
> et `triptyque-seme-produit-une-note.spec.js`. **Il ne reste que du jugement.**
>
> **Postes** : Mac (Safari) **et** iPad. Le §3 vise le premier écran d'un nouvel
> enseignant, et la moitié d'entre eux arriveront par l'iPad.
>
> **Les écarts se NOTENT, rien ne se répare en cours de passe.**

---

## ⛔ SUSPENDUE — ET CE QU'ELLE A TROUVÉ EN ÉCHOUANT

*↻ 1er septembre 2026, en soirée. La première version de cette porte était
**inexécutable**. Elle a découvert mieux qu'elle ne cherchait.*

**1. ⚠ LE §3 N'ATTEINT PAS LES BASES DÉJÀ OUVERTES — c'est le vrai défaut.**
Le code porte « Échelle de départ (IDME) » ; l'écran de Grégoire affiche
« Échelle IDME (point de départ) », le nom d'avant. Mesuré sous WebKit sur deux
passages de la même base : **le semis est idempotent par identifiant**. Il vérifie
la présence de l'id et sort sans écrire — il ne recrée pas, donc **il ne renomme
jamais**. Un espace neuf reçoit le nom neuf ; une base déjà semée garde l'ancien,
indéfiniment.
⮕ Le §3 ne change donc rien pour qui a déjà ouvert l'application — ni pour
Grégoire, ni pour les utilisateurs déjà en place, dont on ignore le nombre.
**Un lot de libellés qui n'atteint que les espaces neufs n'est pas livré, il est
semé.** Inscrit en **#682**, non corrigé : renommer une copie en base, c'est
écrire dans les données de quelqu'un, et c'est une décision de Grégoire.

**2. Le chemin qu'elle donnait n'existait pas.** Elle envoyait dans un onglet
« Matériel » : **zéro occurrence** dans `index.html`. Elle recopiait le message
d'erreur de l'application, qui portait ce chemin faux depuis longtemps — et que
le §4-2 avait recopié à son tour. Les deux messages sont corrigés : le vrai
chemin est **Conception → Échelles de performance**, et un banc exige désormais
les DEUX moitiés.

**3. La grille et la cartouche de départ sont absentes chez Grégoire.** Une
absence n'est pas un bug : `scripts/sonde-682-materiel-seme-noms.js` regarde
`ressourcesSupprimees` avant de conclure. Un identifiant qui s'y trouve signifie
qu'il les a supprimées et que le tombstone tient — **c'est la durabilité qui
FONCTIONNE**. Vérifié au navigateur : tombstone posé, le semis ne repose rien.

⮕ **CETTE PORTE NE SE PASSE PAS TANT QUE #682 N'EST PAS TRANCHÉ.** Sur une base
existante, elle jugerait des libellés qui n'y sont pas encore arrivés — et
rendrait un « non » qui accuserait le mauvais coupable.

⮕ **LE GESTE 2 NE BOUGE PAS.** Il reste « éprouvé par Grégoire ».

---

## §0 — Préparation *(quand la porte sera rouverte)*

1. **LANCER LA SONDE D'ABORD**, et lire ce qu'elle rend. Au terminal :
   `pbcopy < ~/Documents/GitHub/Monitorage_v6/scripts/sonde-682-materiel-seme-noms.js`
   puis Cmd+V dans la console du navigateur, Entrée, puis `await sonde682()`.
   ⮕ Si elle rapporte des « ancien nom du code », **cette porte ne peut pas être
   passée sur cette base** : les libellés du §3 n'y sont pas.
2. **Recharger avec vidage de cache** (Cmd+Option+R sur Mac). Les jetons du jour
   vont jusqu'à `20260901f` ; sans ce geste, tu juges du code d'hier.
3. ⚠⚠ **DIRE DANS QUEL TRIMESTRE ON SE PLACE, ET LE VÉRIFIER.** « Un trimestre où
   le matériel n'a pas été modifié » ne suffit pas : **le matériel n'est pas le
   même d'un trimestre à l'autre.** Mesuré le 1er septembre — chez Grégoire,
   `GRILLE_GENERIQUE` vit dans h2026 seulement, `ECHELLE_IDME_DEPART` dans a2026
   seulement. Le triptyque est **incomplet dans le trimestre où il travaille**.
   ⮕ Le trimestre est donc une **variable de cette porte**, pas un décor.
   L'inscrire en tête de la grille de relevé, et refaire la passe pour chaque
   trimestre que la porte prétend couvrir.
   ⮕ Si la sonde rapporte une absence dans le trimestre choisi, **la porte 2 ne
   peut pas être passée là** : ce n'est pas le §3 qu'elle mesurerait, c'est
   **#683** — le semis ne tourne qu'au chargement de la page ou à l'ouverture de
   l'onglet, jamais à la bascule ; et une suppression faite dans un trimestre pose
   un tombstone GLOBAL qui interdit la pièce dans tous les autres.
4. Si les trois pièces ont déjà été renommées ou retouchées **par toi**, cette
   porte ne mesure plus rien — le dire et s'arrêter là.

---

## §1 — P1 · CE QUE LES TROIS PIÈCES DISENT D'ELLES-MÊMES *(jugement, Mac + iPad)*

Ouvrir **Conception**, et regarder les onglets « Grilles de critères »,
« Échelles de performance » et « Cartouches de rétroaction » sans rien faire
d'autre.

⚠ Il n'y a **pas** d'onglet « Matériel » — c'est ce que disait la première
version de cette porte, et c'est faux.

**Attendu** : « Grille de départ », « Cartouche de départ »,
« Échelle de départ (IDME) ».

| # | Question | Mac | iPad |
|---|---|---|---|
| 1.1 | En lisant ces trois noms, est-ce que tu comprends que tu peux **évaluer avec, telles quelles** ? | | |
| 1.2 | Est-ce qu'elles se reconnaissent comme **un ensemble** (le mot « départ » les relie) ? | | |
| 1.3 | Est-ce que l'une des trois te semble encore dire « ceci n'est qu'une illustration » ? | | |

⚠ **Si 1.1 est NON, le §3 n'est pas livré**, quels que soient les bancs. C'est la
seule question qui décide de ce lot.

---

## §2 — P2 · LE PARCOURS SANS RIEN CRÉER *(le geste 2 de la ligne d'arrivée)*

De l'espace de travail jusqu'à une première évaluation, **sans créer aucune
grille, aucune échelle, aucune cartouche**.

| # | Geste | Attendu | Mac | iPad |
|---|---|---|---|---|
| 2.1 | Ouvrir l'écran d'évaluation sans rien choisir | Le texte d'attente nomme **trois** pièces : grille, échelle de performance, cartouche | | |
| 2.2 | Choisir « Grille de départ » **sans** choisir d'échelle | L'écran DIT qu'il manque l'échelle, et dit quoi faire | | |
| 2.3 | Choisir « Échelle de départ (IDME) » | Les quatre critères apparaissent, chacun avec ses niveaux I/D/M/E | | |
| 2.4 | Cocher « Maîtrisé » sur les quatre | Une note s'affiche — **et ce n'est pas 0,0 %** | | |
| 2.5 | Enregistrer l'évaluation | Elle s'enregistre sans refus ni avertissement | | |

⚠ **2.5 est la marche qu'aucun banc n'a franchie.** Les specs appellent le calcul
directement ; ils ne passent pas la garde de sauvegarde. La lecture du code dit
qu'elle ne devrait pas se déclencher (`estItemDemo` ne teste que `isDemo` et
l'auteur, et aucune des trois pièces ne les porte) — **mais c'est une lecture,
pas une mesure.**

---

## §3 — P3 · LE MOT QUE L'ÉLÈVE LIT *(à faire une fois, Mac suffit)*

Exporter le **PDF de rétroaction** de l'évaluation faite en P2.

| # | Question | Verdict |
|---|---|---|
| 3.1 | Sous « Évaluation : … », quel nom est imprimé ? | |
| 3.2 | Ce nom est-il **digne du document d'un élève** ? | |

⚠ **C'est la trouvaille qui a motivé une bonne part de ce lot** : ce champ vient
de `evaluation.grilleNom`. Avant aujourd'hui, un élève lisait donc
« Évaluation : Grille générique (exemple) » sur son propre document.
⮕ **Si « Grille de départ » ne te convient pas là, c'est TA décision** — c'est un
mot que tes élèves lisent, et le nom se change en dix secondes.

---

## §4 — CE QUE CETTE PORTE NE COUVRE PAS

- **Les copies déjà modifiées** : un enseignant qui a renommé sa grille de départ
  n'est plus concerné par le §3, et son export change de comportement (voir #674
  et la note sur `estRessourceDemo`).
- **Le premier lancement à froid** : décision de Grégoire, hors de la ligne
  d'arrivée.
- **Les trois trouvailles du §5 du plan**, qui restent en attente et n'ont pas été
  touchées : le « niveau NEUF », la copie de la démo vers un vrai trimestre, et
  les trois gabarits de grilles + trois modèles de pratiques à auditer.
  **Ne rien retirer sans avoir mesuré.**

---

## §5 — GRILLE DE RELEVÉ

**Trimestre de la passe : `____________`** — à remplir AVANT de commencer. Le
matériel semé diffère d'un trimestre à l'autre (#683) : un relevé sans cette
mention n'est pas interprétable.

| Porte | Mac | iPad | Note (une ligne) |
|---|---|---|---|
| 1.1 · « je peux m'en servir tel quel » | | | |
| 1.2 · les trois font un ensemble | | | |
| 1.3 · plus rien ne dit « illustration » | | | |
| 2.1 · trois pièces nommées | | | |
| 2.2 · l'échelle manquante est dite | | | |
| 2.3 · les critères apparaissent | | | |
| 2.4 · une note, pas 0,0 % | | | |
| 2.5 · l'évaluation s'enregistre | | | |
| 3.1-3.2 · le nom sur le PDF de l'élève | | | |

⮕ **Si les neuf passent sur les deux postes**, le geste 2 de
`OBJECTIF-COHORTE-1.md` peut passer d'« éprouvé par Grégoire » à **« fait »** —
et la phrase qui dit *comment* il a été vérifié, c'est ce document.
