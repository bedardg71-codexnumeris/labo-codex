# PORTES TERRAIN — 1.57 → 1.65 (état de `main` au 9 août 2026)

> **À quoi sert ce document.** Cinq versions ont été livrées entre le 8 et le
> 9 août sans qu'aucune ne soit validée au doigt ni sur les données réelles.
> WebKit n'existe pas dans les conteneurs de développement (Chromium seulement) :
> **tout ce qui touche Safari, l'iPad et le corpus de Grégoire est structurellement
> invérifiable en session.** Cette liste est le report de cette dette, pas un
> pense-bête de confort.
>
> Cocher au fur et à mesure. Ce qui échoue devient un item de BACKLOG, pas une
> note mentale.

---

## ⚠ CE QUE CE DOCUMENT NE COUVRE PAS

**Les versions 1.61.0 → 1.64.0 ne sont PAS sur `main`.** Elles vivent sur
`claude/incomplete-work-plans-h1nimp` (chantiers pratiques #434/#435/#436 et
renommage de l'onglet #426/#421), non fusionnée au moment d'écrire. Leurs portes
terrain — le champ legacy disparu des pratiques PAN-Standards, la description
sous le Mode de sélection, la pratique legacy « par objectifs », la suggestion
holistique DEN, le nouveau libellé d'onglet, la page 9 du guide — **ne sont pas
ouvrables depuis `main`** et sont volontairement absentes ci-dessous.

⮕ Elles restent dues. Elles reviendront quand cette branche fusionnera.

---

## 0. AVANT DE COMMENCER

- [ ] Ouvrir sur **`main`**, vérifier en bas de page : **1.65.0**, build `0809-0937`
- [ ] Faire un **backup Codex** avant de toucher aux données réelles
- [ ] Prévoir **les deux appareils** : MacBook (Chrome + Safari) et iPad Air
- [ ] Prévoir **les deux modes** (sombre et clair) — plusieurs portes en dépendent

---

## 1. LES DEUX VALEURS GELÉES DE #437 — décisions attendues de toi

Ces deux-là ne sont pas des vérifications : ce sont **deux valeurs posées faute
de pouvoir les éprouver**, qui attendent ton verdict. Elles se tranchent en
regardant, pas en raisonnant.

### 1.1 La densité de la ligne d'objectif au doigt — **28 px**

Chaque objectif de leçon porte maintenant **quatre** commandes (▲ ▼ + −) au lieu
de deux. Sur iPad elles font 28 px chacune, dans un bloc large de 240 px.

> **Le compromis, dit franchement** : la règle du projet demande 44 px au doigt.
> Les commandes d'objectif étaient déjà à 28 px avant ce chantier — les rétrécir
> pour loger les deux nouvelles aurait rendu les **quatre** moins sûres. J'ai
> donc gardé 28 px et laissé la ligne se densifier. C'est un choix qui se voit
> mieux qu'il ne se calcule.

- [ ] **iPad** — une leçon avec 3 objectifs, badge 🎯 déplié. Viser ▲ puis ▼ sur
      la ligne du milieu. Ça tombe juste, ou ça rate ?
- [ ] Le texte de l'objectif reste-t-il lisible à côté des quatre commandes ?

**Verdict attendu** : ☐ ça passe · ☐ trop dense → on repense le geste
(ex. : les flèches n'apparaissent que sur la ligne sélectionnée)

### 1.2 La sarcelle unique des cinq étapes — **`#0891b2`**

Les cinq étapes d'enseignement explicite (Ouverture, Modélisation, Pratique
guidée, Pratique autonome, Clôture) partagent désormais une seule teinte, choisie
au milieu de l'ancien dégradé.

> **Ce qui a été retiré** : le dégradé encodait le transfert de responsabilité
> (je fais → nous faisons → tu fais). Tu as tranché pour l'aplatir ; c'est
> consigné dans le CSS pour qui voudra le rétablir.

- [ ] **Mode sombre** — les cinq blocs se distinguent-ils du fond ? du vert de la
      famille « Déroulement » ?
- [ ] **Mode clair** — même question. C'est le mode le plus à risque.
- [ ] Les pastilles de la palette « Nœuds » sont-elles lisibles dans les deux modes ?

**Verdict attendu** : ☐ bon · ☐ trop clair · ☐ trop foncé
(un seul token à changer : `--planif-couleur-enseignement-explicite`)

---

## 2. VERSION 1.65 — carte d'alignement (#437, aujourd'hui)

### 2.1 La durée qui manquait — le motif du chantier

- [ ] Glisser un **Exposé** depuis la palette. Sa **durée doit être là
      immédiatement**, sans recharger la page. C'était le bug.
- [ ] Même chose pour les **cinq étapes d'enseignement explicite**
- [ ] Glisser une **Leçon** neuve : elle doit avoir d'emblée son compteur **Σ**,
      son sélecteur **S1**, son badge **🎯**, sa **poignée** et son **liseré mauve**
- [ ] **⌥+glisser** (clone) une feuille : la copie porte aussi son champ de durée
- [ ] Recharger la page : rien ne change d'aspect (c'est le test qui prouve que
      les deux chemins rendent enfin la même chose)

### 2.2 Réordonner les objectifs

- [ ] Une leçon, 3 objectifs. Les flèches ▲▼ changent l'ordre
- [ ] **Sur la première ligne, ▲ est inerte** ; sur la dernière, ▼ l'est aussi
- [ ] ⚠ **Le test qui compte** : relier une activité à un objectif (badge 🎯 →
      « objectifs servis »), puis **déplacer cet objectif**. L'activité doit
      toujours servir **le même** objectif, pas son voisin.
- [ ] **⌘Z** défait le déplacement
- [ ] Au clavier : Tab atteint les flèches, Entrée/Espace les active

### 2.3 Le collage

- [ ] Copier un titre depuis **Word, Pages ou une page web**, le coller dans le
      titre d'un bloc → il prend la typographie de la carte, pas la sienne
- [ ] Même essai dans un **objectif de leçon**
- [ ] Coller un texte **sur plusieurs lignes** → il arrive sur une seule
- [ ] **⌘Z** après un collage défait bien le collage seul

### 2.4 Le bandeau retiré

- [ ] L'en-tête du module n'affiche plus « 🔧 Présentement en développement actif »
      ni la phrase « Ce module se développe activement… »
- [ ] Le **titre de la section** est toujours là (il vivait dans le même `<h2>`)

---

## 3. VERSION 1.60 — la corbeille de la palette (#433)

- [ ] **iPad** — glisser un bloc sur la corbeille au bas de la palette « Nœuds » :
      il disparaît
- [ ] La corbeille **s'arme** dès qu'un déplacement commence, **rougit** quand le
      doigt la survole
- [ ] Le message de confirmation **nomme le bloc** et rappelle le bouton Annuler
- [ ] Annuler le ramène bien

⚠⚠ **LA QUESTION OUVERTE LA PLUS IMPORTANTE, toujours sans réponse depuis le
8 août — deux touchers suffisent** :

- [ ] **Le double-clic ouvre-t-il l'Inspecteur au doigt sur iPad ?**

> Si **non**, tout l'Inspecteur — durée, semaine, objectifs servis, **et la
> rétroaction formative de #424 Lot E** — n'est atteignable que par l'icône 🕵️
> de la palette, dont le libellé n'apparaît qu'au survol. Ça justifierait un
> geste plus direct (tap long ? bouton sur le bloc sélectionné ?) et devrait
> passer avant tout autre chantier Alignement.

---

## 4. VERSION 1.59 — les guides harmonisés (#432)

- [ ] Rouvrir le **guide de la Carte** (8 pages) dans **Chrome/Mac** — c'est là
      que les polices gonflaient
- [ ] Les tailles sont-elles homogènes d'une page à l'autre ?
- [ ] Les glyphes **✓ / ! / ⚠** sont-ils visibles ? (ils rendaient **vides** :
      des masques SVG remplacés par du texte)
- [ ] La **page 8** décrit-elle ce que tu fais vraiment (menu Actions → Exporter
      le plan…, les trois niveaux, le Personnalisé, les deux imports) ?
- [ ] Ouvrir ensuite un **guide pédagogique** (SOLO ou RàI) : les deux familles
      **se ressemblent**-elles ?
- [ ] Les deux modes

---

## 5. VERSION 1.58 — l'export personnalisé (#431)

- [ ] « Exporter le plan… » → « Régler le niveau personnalisé… » : cocher des
      contenus, **déplacer une section**, vérifier que l'**aperçu suit**
- [ ] Fermer puis rouvrir la modale : **le réglage a été retenu**
- [ ] « Partir de » un des trois presets fonctionne
- [ ] Recoller le **TSV « Plan de cours » dans Numbers** → **UNE seule** colonne
      « Semaine » (c'était le bug #152)
- [ ] **iPad** — la modale au doigt : flèches ↑↓ de réordonnancement, défilement
      de l'aperçu

---

## 6. VERSION 1.57 — le portage des exports (#424)

- [ ] Un export de **chacun des trois niveaux** ouvert sur **ta carte A26**
      réelle — dont le TSV collé dans Numbers
- [ ] **iPad** — poser une **rétroaction formative sur une activité** au doigt
- [ ] ⚠ **Au premier démarrage** : vérifier que tes **3 rétroactions** apparaissent
      bien sur les nœuds. Console : `[moisson #424]` silencieux = tout moissonné
- [ ] Constater que **« Plan de la leçon » a disparu sans manque**
- [ ] Les sélecteurs **Rétroaction** et **Production** d'un nœud Évaluation
      **écrivent** de nouveau (ils étaient muets — listeners détruits par un
      `innerHTML +=`)

---

## 7. DETTE TACTILE PLUS ANCIENNE, jamais validée

Ces portes traînent depuis 1.47–1.56. Elles ne coûtent que quelques gestes une
fois l'iPad en main — autant les fermer dans la même séance.

- [ ] **Poignée de redimensionnement d'un nœud** au doigt (28 px, sous les 44 reco)
- [ ] **Glisser un nœud** au tactile (converti en Pointer Events par #148)
- [ ] **Poignée de la palette** au doigt (44 px)
- [ ] **Saisie d'une durée** au doigt dans l'en-tête d'un bloc
- [ ] **Une grosse carte entièrement dépliée** reste-t-elle navigable ? (zoom, ⌘1,
      planificateur) — contrepartie assumée du retrait du filtrage, jamais mesurée
      sur tes données
- [ ] Lisibilité de l'**en-tête sur un nœud étroit** : il a reçu plusieurs
      contrôles depuis (durée, semaine, Σ, 🎯)

---

## 8. CE QUI N'A PAS BESOIN D'ÊTRE REVALIDÉ

Pour ne pas repayer ce qui est déjà prouvé — les sept contrats mesurés au banc du
6 août (V2 ×4,8, cohérence STD 20/20, 0 listener net, dates soirée…) sont au §7
du bloc SESSION.md correspondant. **Coup d'œil bienvenu, re-mesure inutile.**

Le reliquat réel de cette famille tient en trois choses : **V1 boot sur corpus
réel**, **l'iPad**, et **ton œil sur tes données**.
