# PORTES TERRAIN — 1.57 → 1.65 (état de `main` au 9 août 2026)

> **À quoi sert ce document.** Huit versions porteuses de changements visibles
> ont été livrées entre le 8 et le 9 août — 1.57, 1.58, 1.59, 1.60, 1.61, 1.63,
> 1.64, 1.65 — sans qu'aucune ne soit validée au doigt ni sur les données réelles.
> WebKit n'existe pas dans les conteneurs de développement (Chromium seulement) :
> **tout ce qui touche Safari, l'iPad et le corpus de Grégoire est structurellement
> invérifiable en session.** Cette liste est le report de cette dette, pas un
> pense-bête de confort.
>
> Cocher au fur et à mesure. Ce qui échoue devient un item de BACKLOG, pas une
> note mentale.

---

## ✅ PÉRIMÈTRE DÉSORMAIS COMPLET (mis à jour après la fusion)

> Ce document annonçait, à sa création, que **1.61.0 → 1.64.0 n'étaient pas sur
> `main`** : elles vivaient sur `claude/incomplete-work-plans-h1nimp`, non
> fusionnée. Leurs portes étaient donc volontairement absentes — *une checklist
> qui liste des vérifications impossibles depuis la branche ouverte se fait
> ignorer en entier.*
>
> **Cette branche est fusionnée** (`188213fc..529a5779`, fast-forward). Les
> portes de 1.61 à 1.64 sont **ajoutées ci-dessous** (§3, §4, §5) et le document
> couvre maintenant **1.57 → 1.65** sans trou.

⚠ **Ce qui change pour toi** : trois de ces portes touchent **le calcul de la
note ou des chiffres affichés**, pas seulement l'apparence. Elles sont marquées
⚠⚠ et méritent un backup Codex avant, pas après.

---

## 0. AVANT DE COMMENCER

- [ ] Ouvrir sur **`main`**, vérifier en bas de page : **1.65.2 ou plus récent**
      *(les patchs 1.65.2+ sont des correctifs sans changement visible — les portes
      ci-dessous restent celles de 1.65.1 ; seul un numéro ANTÉRIEUR est un échec)*
- [ ] ⚠ **Si l'app tourne en `file://` depuis le clone Git local** : faire
      `git pull` d'abord — l'app est à la version du dernier pull, pas du dépôt.
      (Constaté le 10 août : portes passées sur un build en retard.)
- [ ] Faire un **backup Codex** avant de toucher aux données réelles
- [ ] Prévoir **les deux appareils** : MacBook (Chrome + Safari) et iPad Air
- [ ] Prévoir **les deux modes** (sombre et clair) — plusieurs portes en dépendent

> ▣ **Si le style te paraît « en retard » sur une porte visuelle, recharge en
> forçant** (`Cmd+Option+R` sur Safari). Jusqu'à **1.65.1 (#438)**, le script de
> release ne renouvelait **pas** l'adresse de `styles.css` : un correctif CSS
> pouvait être servi depuis le cache dans sa version d'avant, sans erreur ni
> trace. C'est corrigé pour les prochaines releases, mais un cache déjà rempli
> avant aujourd'hui peut encore mentir une fois.

---

## 1. LES QUATRE VALEURS GELÉES — décisions attendues de toi

Ce ne sont pas des vérifications : ce sont **quatre valeurs posées faute de
pouvoir les éprouver**, qui attendent ton verdict.

⚠ **Elles viennent de DEUX chantiers différents**, et la confusion a déjà eu
lieu une fois entre les deux sessions du 9 août :

| # | Valeur | Chantier | Nature |
|---|---|---|---|
| 1.1 | cible tactile **28 px** de la ligne d'objectif | #437 (carte) | se tranche **en regardant** |
| 1.2 | sarcelle **`#0891b2`** des cinq étapes | #437 (carte) | se tranche **en regardant** |
| 1.3 | dénominateur de l'**indice C** = **3** | #436 (pratiques) | se tranche **en raisonnant** — c'est un chiffre affiché |
| 1.4 | **quota des jetons** = **2** | #436 (pratiques) | se tranche **en raisonnant** |

Les deux premières se voient ; les deux dernières se pensent.

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

### 1.3 Le dénominateur de l'indice C — **3**

La complétion « alternative » se calcule `nombre de meilleurs artefacts remis ÷ N`,
avec **N = 3**. Ce nombre alimente **l'indice C affiché au tableau de bord**.

> **Pourquoi il est gelé, et pourquoi c'est ta décision** : le code lisait un
> champ de configuration (`configPAN.nombreArtefacts`) qu'**aucun code n'a jamais
> écrit** — il rendait donc toujours son repli, 3, depuis toujours. En le
> branchant sur la vraie source, N deviendrait `nombreARetenir` (**4** chez toi)
> ou `nombreTotal` (**10**). Avec 10, ton indice C serait divisé par plus de
> trois. **Changer ça sans que tu l'aies demandé aurait été une modification
> silencieuse d'un chiffre que tu lis.**

- [ ] Regarde ton indice **C** actuel sur quelques étudiants. Est-il cohérent
      avec ce que tu observes ? (c'est un `min(remis/3, 1)`, donc il sature vite)
- [ ] **La vraie question** : « complet », pour toi, ça veut dire *3 artefacts*,
      *les 4 retenus de ta pratique*, ou *les 10 prévus* ?

**Verdict attendu** : ☐ garder 3 · ☐ passer à `nombreARetenir` (4) ·
☐ passer à `nombreTotal` (10) — un seul endroit à changer
(`NB_ARTEFACTS_COMPLETION_ALTERNATIVE`, `js/liste-evaluations.js`)

### 1.4 Le quota affiché des jetons — **2**

La barre « X / N jetons utilisés » du profil affiche **N = 2**.

> **Pourquoi il est gelé** : la valeur venait de `configPAN.jetons.nombreParEleve`,
> un champ que le module propriétaire **efface activement** depuis #328 L2-c — un
> module purgeait ce qu'un autre lisait. La barre affichait donc toujours 2.
> ⚠ **Et la vraie source ne donne pas de réponse évidente** : `obtenirConfigJetons()`
> expose des nombres **par usage** (`delai.nombre`, `reprise.nombre`), pas un
> quota global — alors que le numérateur, lui, **somme tous les types**. Il n'y a
> pas de bon dénominateur sans décider ce que la barre veut dire.

- [ ] Ouvre un profil d'étudiant qui a **utilisé au moins un jeton**. La barre
      dit-elle quelque chose de juste ?
- [ ] Si tu as configuré **plus de 2 jetons** dans ta pratique : la barre
      affiche-t-elle « 3 / 2 utilisés », donc plus de 100 % ?

**Verdict attendu** : ☐ garder 2 · ☐ somme des quotas par usage ·
☐ la barre n'a pas de sens et doit être repensée
(`QUOTA_JETONS_AFFICHE_DEFAUT`, `js/profil-etudiant-sections-affichage.js`)

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

## 3. VERSION 1.64 — les réglages de pratique s'appliquent partout (#436)

⚠⚠ **Porte de DONNÉES : fais un backup Codex avant.** Ce chantier a changé la
source de **neuf lectures**, réparties sur **cinq écrans** de suivi, qui consultent ta pratique.

> **Ce qui a été corrigé** : ces écrans lisaient une **copie figée** de ta
> configuration, réécrite seulement quand tu *appliquais* une pratique. Modifier
> le nombre d'artefacts à retenir changeait la note du profil, **mais pas** les
> autres écrans — qui restaient sur l'ancienne valeur sans rien signaler. Le
> défaut était invisible : aucun message, juste deux écrans qui se contredisent.

### 3.1 Le test qui prouve le correctif — en deux minutes

- [ ] Note ce qu'affichent, pour **un même étudiant** : le **profil**, l'**aperçu
      du groupe** et la **liste des étudiant·es**
- [ ] Va dans **Conception → Pratiques de notation**, change le **nombre
      d'artefacts à retenir** de ta pratique active, enregistre
- [ ] Reviens : **les trois écrans doivent avoir bougé ensemble.** Avant ce
      correctif, seul le profil suivait
- [ ] Remets la valeur d'origine

### 3.2 Ce qu'il ne faut PAS voir bouger

- [ ] Tes **notes finales** sont inchangées (le calcul de la note était déjà
      coupé de la copie figée depuis mai — G2-a)
- [ ] Les **seuils de complétion** affichés restent cohérents avec ta pratique

---

## 4. VERSION 1.63 — une seule question sur la construction de la note (#434 + #435)

### 4.1 Le champ en double a disparu

- [ ] **Conception → Pratiques de notation**, ouvre une pratique **PAN-Standards**
- [ ] Le champ **« Comment construis-tu la note finale ? »** n'existe plus. Il
      posait la même question que **« Mode de sélection »**, avec d'autres mots,
      et les deux pouvaient se contredire
- [ ] Sous « Mode de sélection », une **courte description** apparaît et change
      selon le mode choisi
- [ ] Les modes restants sont **quatre** : N meilleurs · N derniers · Tous ·
      Hybride. Plus de « Par objectifs »

### 4.2 ⚠⚠ Le mode « Par objectifs » a été RETIRÉ — la porte qui compte

> Il n'a jamais pu calculer une note : le lien production→objectif qu'il
> supposait n'a jamais existé dans le modèle de données, et son panneau de
> réglages ne s'était **jamais** affiché. Décision du 9 août, dans le
> prolongement de #396.

- [ ] **Si tu as une pratique enregistrée en « par objectifs »** : l'ouvrir. Elle
      doit s'afficher sur son **mode de sélection réel**, et la **console** doit
      dire `[Pratiques] Mode « par-objectifs » retiré (#435)…`
- [ ] ⚠ **Sa configuration ne doit pas être perdue** tant que tu ne sauvegardes
      pas toi-même. Vérifie avant de cliquer quoi que ce soit
- [ ] ⚠⚠ **Si une telle pratique était ACTIVE sur un groupe-cours** : son indice P
      passait de « non calculable » à un calcul portfolio réel. **Les notes de ce
      groupe changent.** C'est attendu — mais à constater, pas à découvrir
- [ ] Les **quatre gabarits** « Par objectifs (Pondéré) », « STD Chimie
      organique », « STD Interfaces et BD », « STD Anatomie » ont quitté la
      bibliothèque de pratiques

### 4.3 Ce qui devait SURVIVRE à ce retrait

- [ ] **La suggestion holistique DEN fonctionne toujours.** Ouvrir une pratique
      **Dénotation**, saisir un jugement : la suggestion de note s'affiche
      (elle réutilise deux helpers du moteur STD qui ont été volontairement
      épargnés par l'ablation)

---

## 5. VERSION 1.61 — « Carte d'alignement » et le manuel remis à jour (#426 + #421)

### 5.1 Le renommage de l'onglet

- [ ] **Conception** : l'onglet s'appelle **« Carte d'alignement »**, plus
      « Alignement pédagogique »
- [ ] Le **titre de la page** aussi
- [ ] La **visite guidée** (étape 5) le nomme pareil et ne promet plus de
      « plan de leçon »
- [ ] ⚠ **Ce qui NE devait PAS changer** : le **glossaire** garde le terme
      « Alignement pédagogique » — c'est le **concept**, pas l'onglet. Vérifie
      qu'il y est toujours

### 5.2 Le guide de la carte — 9 pages, une neuve

- [ ] Ouvrir le guide (bouton 📖 de la palette) : il annonce **9 pages** et
      **8 étapes**
- [ ] La **page 5** s'intitule **« Ce que la leçon vise »** — elle est neuve. Le
      guide faisait construire la carte de bout en bout sans jamais nommer
      l'objectif de leçon, celui-là même que tu ne trouvais pas le 6 août
- [ ] Elle décrit les trois gestes réels : le badge **🎯** qui déplie, le **+/−**
      qui ajoute et retire, et les **« objectifs servis »** à cocher dans
      l'Inspecteur d'une activité

### 5.3 Les chemins de navigation, corrigés

- [ ] Dans le **glossaire**, un terme de planification renvoie à
      **« Conception > Carte d'alignement »** — plus à « Planification >
      Organisateur » (page supprimée) ni à « Planification > Alignement »
      (section disparue **le 3 avril**)
- [ ] **Aide → Planifier les leçons** : la ligne « Navigation » pointe au bon
      endroit, et le texte ne promet plus de préréglages de zoom qui n'existent
      plus
- [ ] Survoler la zone **« Enseignement explicite »** de la palette : elle a
      maintenant une infobulle, comme ses cinq voisines

---

## 6. VERSION 1.60 — la corbeille de la palette (#433)

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

## 7. VERSION 1.59 — les guides harmonisés (#432)

- [ ] Rouvrir le **guide de la Carte** (⚠ **9 pages** depuis #421, cf. §5.2) dans **Chrome/Mac** — c'est là
      que les polices gonflaient
- [ ] Les tailles sont-elles homogènes d'une page à l'autre ?
- [ ] Les glyphes **✓ / ! / ⚠** sont-ils visibles ? (ils rendaient **vides** :
      des masques SVG remplacés par du texte)
- [ ] La **dernière page** (« Exporte ton plan », page **9** depuis #421 — elle
      était la 8ᵉ) décrit-elle ce que tu fais vraiment (menu Actions → Exporter
      le plan…, les trois niveaux, le Personnalisé, les deux imports) ?
- [ ] Ouvrir ensuite un **guide pédagogique** (SOLO ou RàI) : les deux familles
      **se ressemblent**-elles ?
- [ ] Les deux modes

---

## 8. VERSION 1.58 — l'export personnalisé (#431)

- [ ] « Exporter le plan… » → « Régler le niveau personnalisé… » : cocher des
      contenus, **déplacer une section**, vérifier que l'**aperçu suit**
- [ ] Fermer puis rouvrir la modale : **le réglage a été retenu**
- [ ] « Partir de » un des trois presets fonctionne
- [ ] Recoller le **TSV « Plan de cours » dans Numbers** → **UNE seule** colonne
      « Semaine » (c'était le bug #152)
- [ ] **iPad** — la modale au doigt : flèches ↑↓ de réordonnancement, défilement
      de l'aperçu

---

## 9. VERSION 1.57 — le portage des exports (#424)

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

## 10. DETTE TACTILE PLUS ANCIENNE, jamais validée

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

## 11. CE QUI N'A PAS BESOIN D'ÊTRE REVALIDÉ

Pour ne pas repayer ce qui est déjà prouvé — les sept contrats mesurés au banc du
6 août (V2 ×4,8, cohérence STD 20/20, 0 listener net, dates soirée…) sont au §7
du bloc SESSION.md correspondant. **Coup d'œil bienvenu, re-mesure inutile.**

Le reliquat réel de cette famille tient en trois choses : **V1 boot sur corpus
réel**, **l'iPad**, et **ton œil sur tes données**.
