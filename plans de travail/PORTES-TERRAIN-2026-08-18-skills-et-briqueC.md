# Portes terrain — cycle du 18 août 2026

> **État** : ⮕ **RETOUR REÇU le 18 août** · 7 passées · 2 échecs · 3 non traitées · **12 rangées à cocher** · 4 mesures · 3 décisions
> **MàJ 18 août, en cours de rédaction** : la porte 2.1 est tombée d'elle-même — la suite Playwright a tourné sur le Mac (`4db3e76b`) et les deux specs de la Brique C passent.
> **Artefact interactif** : <https://claude.ai/code/artifact/56915616-aaf6-489a-855a-59e4073d93e5>
> **Ce qui échoue devient un item de BACKLOG avec son numéro de porte, pas une note mentale.**

Ce cycle a livré un correctif applicatif (`ca7564bb` — Brique C) et clos le chantier
skills à deux tests près. Le filet automatisé du correctif est vert depuis ce matin. Ce qui reste demande
soit ton corpus, soit ton compte claude.ai, soit une session Claude Code non
contaminée — trois choses qu'aucune session cloud ne peut atteindre.

---

## ⮕ RETOUR DU TERRAIN — 18 août 2026

**Relevé : 7 passées · 2 échecs · 3 non traitées.** Tri fait selon le §5 du skill
`portes-terrain` : défaut réel, ou build en retard ?

### Le §0 n'a pas été coché — et pourtant le build était à jour

Les trois rangées du préalable sont revenues vides. Le risque nommé en tête de
cette liste était précisément là : tester l'app d'avant en croyant tester celle
d'après. **Ce n'est pas arrivé** — et c'est la mesure 1.1m qui le prouve, pas une
coche : le NOM de la grille source s'affiche correctement, ce qui est
**impossible** avant `ca7564bb` (l'ancien code posait une chaîne brute, donc les
deux moitiés seraient « Inconnu »). Build confirmé à jour par la donnée.

### ⚠ La porte 1.1 est cochée ✓ mais n'est passée qu'à MOITIÉ

Mesure 1.1m, texte exact relevé sur le corpus réel :

> Inspiré de · **Grille-5 FR-HOLIS-30 A25** par **Inconnu** (17 août 2026)

Le nom est réparé. **L'auteur ne l'est pas.** Cause trouvée au code :
`forgerInspireDe` lit `itemSource.auteur`, mais une grille créée par le chemin
normal n'a pas ce champ — son auteur vit dans `metadata_cc.auteur_original`.
Transversal aux 11 appelants (grilles, échelles, cartouches, pratiques), et c'est
la trace CC BY qui perd son attribution.

⮕ **Versé au BACKLOG puis CLOS le jour même : ✅ #457, livré en 1.87.3.**

⮕ **C'est le champ de mesure qui a attrapé ce défaut.** À l'écran le correctif
semble marcher, et la porte a été cochée ✓ de bonne foi. Sans l'obligation de
recopier le texte exact, il passait inaperçu. C'est exactement la leçon du
11 août : une case cochée ne porte pas un contenu.

### Ce qui est réellement passé

| | Résultat |
|---|---|
| **1.3a/b/c** | ✅ La copie profonde tient : modifier la copie ne touche pas la source. Le vecteur est éprouvé sur le corpus réel |
| **1.2m** | **0/3** — aucune grille déjà importée n'affiche « Inconnu ». Rien à réparer |
| **2.4** | ✅ Skill compte `design-interface` supprimé sur claude.ai |
| **2.5** | ✅ Branche `claude/wonderful-galileo-cb9785` supprimée |

### ❌ Les deux cas de déclenchement ÉCHOUENT — le diagnostic était le bon

| | Phrase | Résultat |
|---|---|---|
| **2.2** | « le tableau de bord est laid, ça déborde à droite » | **aucun skill chargé** |
| **2.3** | « je veux publier ce qu'on a fait cette semaine aux testeurs » | **aucun skill** — la session a ouvert `PORTES-TERRAIN-2026-08-18-…md` |

C'est le défaut prévu au cas 1, et il touche **aussi** le cas 2 : les deux
descriptions décrivent leur *contenu*, pas la façon dont Grégoire *parle*.

⮕ **Verdict 3.2 = « oui » appliqué le jour même.** Les deux `description` sont
enrichies de ses tournures réelles : « c'est laid », « ça déborde », « on ne voit
pas », « ça ne rentre pas sur iPad » pour `design-interface` ; « publier ce qu'on
a fait », « envoyer ça aux testeurs », « mettre ça en ligne » pour
`release-et-changelog`.

⚠ **LES DEUX CAS SONT À REPASSER** — en sessions neuves, non contaminées. Une
description corrigée n'est pas une description qui déclenche : tant que 2.2 et
2.3 ne sont pas verts, **le chantier skills n'est pas clos**.

⚠ **Et le cas 2.3 signale un second risque** : la session est allée lire le
markdown de cette porte terrain. Un fichier de ce nom, dans le dépôt, est
trouvable par une session neuve — donc la contamination ne vient pas seulement de
ce qu'on lui donne. Pour le repassage, formuler la phrase et rien d'autre, et ne
pas laisser la session explorer avant de répondre.

### Verdicts rendus

| | Décision | Verdict de Grégoire |
|---|---|---|
| **3.1** | Bumper en 1.87.3 | **oui** |
| **3.2** | Réinjecter ses tournures | **oui** — ✅ fait |
| **3.3** | Réparer les anciennes grilles « Inconnu » | **laisser** — cohérent avec 1.2m = 0/3 |

✅ **BUMP FAIT — 1.87.3, build `0818-0918`.** Décision retenue : corriger #457
d'abord, puis bumper une seule fois. Une version qui annonce « la trace de
provenance est réparée » alors que l'auteur reste « Inconnu » aurait annoncé la
moitié du correctif. Le changelog utilisateur porte l'entrée consolidée dans
`1.87`, et l'anti-cache de `bibliotheque-ui.js` est bumpé avec — sans quoi le
build `file://` de Grégoire aurait gardé l'ancien script.

---

## §0 · Préalable — à faire en premier, sinon tout le reste est faux

⚠ **Une seule section de cette liste utilise le Terminal de macOS : celle-ci, et
le §2.** Les rangées du §1 se font entièrement dans l'app, à la souris.

| | Geste | Attendu |
|---|---|---|
| **0.1** | `Terminal` · Dans le dossier du dépôt : `git pull` | Le pull passe sans conflit |
| **0.2** | `Terminal` · `git log --oneline -1 -- js/grilles.js` | Affiche **`ca7564bb`** · « Brique C — inspireDe structuré + copie profonde ». Autre chose = le pull n'a pas pris, **ne pas continuer**. On interroge le dernier commit touchant `js/grilles.js` — c'est le correctif lui-même, donc ce repère ne périme pas |
| **0.3** | Faire une **sauvegarde Codex** | Le §1 écrit dans ton corpus réel |

> ⚠⚠ **LE NUMÉRO DE VERSION NE CHANGERA PAS.** Il reste **1.87.2**, build
> `0816-0846`. Ce cycle n'a pas été bumpé (c'est la décision 3.1). **Ne t'en sers
> donc PAS comme preuve que tu as le correctif** — le repère, c'est la ligne de
> commit du 0.2. Sans ça, tu testerais l'app d'avant en croyant tester celle
> d'après, et tu cocherais ✗ sur un correctif qui marche.

---

## §1 · ⚠⚠ Données — ce que tu exécutes sur ton corpus

### 1.1 · La grille importée dit enfin de qui elle vient

> **POURQUOI** — Quand tu importais une grille depuis un ancien trimestre, sa
> carte affichait « **Inspiré de Inconnu par Inconnu** ». Le nom et l'auteur de
> la grille d'origine étaient perdus à la copie. C'est corrigé.

| | Geste | Attendu |
|---|---|---|
| **1.1a** | `Données` · Bibliothèque de grilles → importer une grille depuis un **autre trimestre** | La copie apparaît dans le trimestre actif |
| **1.1b** | Lire la ligne « Inspiré de… » sur la carte de la **copie neuve** | Le **vrai nom** de la grille source et le **vrai auteur**. Plus jamais « Inconnu par Inconnu » |
| **1.1m** | **MESURE** — recopier le texte exact affiché | *(champ libre — aucun texte n'est un échec ici, c'est une mesure)* |

> ⚠ **Tes grilles importées AVANT aujourd'hui gardent leur ancienne trace** et
> continueront d'afficher « Inconnu ». **Ce n'est pas un échec** : le correctif
> agit à la copie, il ne répare pas les copies déjà faites. Regarde une copie
> **neuve**.

| | Geste | Attendu |
|---|---|---|
| **1.2m** | **MESURE** — combien de tes grilles déjà importées affichent encore « Inconnu » ? | *(champ libre — sert à décider 3.3, aucun chiffre n'est un échec)* |

### 1.3 · Dupliquer une pratique ne touche plus à l'originale

> **POURQUOI** — Une pratique dupliquée partageait discrètement des morceaux
> avec l'originale tant que la page n'était pas rechargée. Modifier la copie
> pouvait donc modifier la source sous tes yeux. C'est structurellement
> impossible désormais.
>
> Cette porte rejoue le **vecteur**, pas seulement l'état : c'est la
> modification de la copie qui prouve que la source tient.

| | Geste | Attendu |
|---|---|---|
| **1.3a** | `Données` · Bibliothèque de pratiques → **dupliquer** une pratique | Une copie « (copie) » apparaît |
| **1.3b** | Ouvrir la **copie**, changer son échelle (ou un réglage visible), enregistrer | Le changement est pris sur la copie |
| **1.3c** | **Sans recharger la page**, rouvrir la **pratique d'origine** | Elle est **inchangée**. Son échelle est celle d'avant |

---

## §2 · Vérifications hors de l'app

⚠ Ces rangées se tapent dans le **Terminal**, pas dans l'app.

| | Geste | Attendu |
|---|---|---|
| **2.1** | ~~Lancer les deux specs Brique C~~ · **FAIT le 18 août au matin, sur le Mac** (`4db3e76b`) | ✅ **Les deux specs de la Brique C passent.** Suite complète WebKit, 3 min 42 : 87 passées / 6 échecs, et la contre-épreuve en worktree montre **les 6 mêmes échecs avant et après** le correctif (`d27659e3` comme `1fafa5d5`) — la Brique C n'a rien cassé. **Rien à refaire ici.** |
| **2.4** | `claude.ai` · Réglages → Skills → supprimer le skill personnalisé **`design-interface`** (source *custom*, modifié 2026-08-17 18:05) | Il disparaît de la liste. Rien n'est perdu : son contenu est dans le dépôt |
| **2.5** | `Terminal` · `git push origin --delete claude/wonderful-galileo-cb9785` | La branche disparaît. Son apport est déjà sur `main` |

### 2.2 / 2.3 · Les deux skills qui n'ont jamais été testés au déclenchement

> **POURQUOI** — `design-interface` et `release-et-changelog` ont été **créés**
> le 17 août ; les 4 tests de déclenchement de ce jour-là ne portaient que sur
> les 13 skills **migrés**. On sait qu'ils se chargent quand on les appelle. On
> ne sait pas qu'ils **partent seuls**.

⚠⚠ **PROTOCOLE — sinon le test ne vaut rien.** Ouvrir une session Claude Code
**neuve**, dans un autre terminal, à la racine du dépôt. **Ne rien lui donner
d'autre** — surtout pas cette liste ni la consigne : elle y lirait la réponse
attendue. **Une session neuve par cas.**

| | Geste | Attendu |
|---|---|---|
| **2.2** | `Terminal` · Session neuve → taper exactement : **« le tableau de bord est laid, ça déborde à droite »** | **`design-interface`** se charge **seul**, sans qu'on le nomme |
| **2.2m** | **MESURE** — quel(s) skill(s) se sont chargés ? | *(champ libre)* |
| **2.3** | `Terminal` · **Autre** session neuve → taper exactement : **« je veux publier ce qu'on a fait cette semaine aux testeurs »** | **`release-et-changelog`** se charge **seul** |
| **2.3m** | **MESURE** — quel(s) skill(s) se sont chargés ? | *(champ libre)* |

> Si l'un ne part pas, **ce n'est pas le principe qui est en cause** : c'est un
> frontmatter à enrichir. Le correctif est local et connu — voir décision 3.2.

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Ce sont des choix que je ne peux pas
trancher à ta place. Chacun demande un **verdict écrit** : une case cochée ne
dit pas *laquelle*.

| | Décision | Ce qui est en jeu |
|---|---|---|
| **3.1** | **Bumper en 1.87.3 ?** ⮕ **le blocage est levé** | `ca7564bb` corrige deux bugs → la doctrine dit `patch`. J'avais recommandé d'attendre que 2.1 soit vert : **c'est fait, les deux specs passent** (`4db3e76b`). Le cadrage de juin disait « bump au merge, après validation terrain » — la validation automatisée est acquise ; reste la validation *terrain* du §1. *Mon avis révisé : bumper une fois le §1 coché.* |
| **3.2** | **Si 2.2 échoue : réinjecte-t-on tes tournures dans `design-interface` ?** | La description retenue (celle du dépôt) est technique. La copie compte qu'on a écartée listait tes mots — « c'est laid », « ça déborde », « on ne voit pas », « ça ne rentre pas sur iPad ». |
| **3.3** | **Les anciennes grilles qui affichent « Inconnu » : réparer ou laisser ?** | Dépend de la mesure 1.2m. Réparer = une migration ponctuelle sur ton corpus, donc un chantier `⚠⚠ Données` à part entière. |

---

## §4 · Ce que je n'ai pas pu vérifier

- ~~**WebKit n'existe pas dans le conteneur**, donc les deux specs de `ca7564bb`
  n'ont jamais tourné.~~ ✅ **LEVÉ le 18 août au matin** (`4db3e76b`) : la suite
  complète a tourné sur le Mac et **les deux specs passent**. L'angle mort
  principal de ce cycle est fermé — mais il l'a été *après* que j'aie écrit cette
  liste, pas par moi. La limite reste vraie pour tout futur cycle : **je ne peux
  pas éprouver du WebKit ici.**
- ⚠ **Six specs Playwright échouent sur `main`**, sans lien avec ce cycle : les
  mêmes six avant et après le correctif. Voir BACKLOG #456 — dont un piège nommé,
  `planif-drag-pointer-148.spec.js:323`, qui échoue sur l'import inter-trimestre,
  le domaine exact de la Brique C : **il ressemble à une régression sans en être
  une.**
- **Je ne peux pas lire ton `localStorage`.** L'avancement de cette liste vit
  dans ton navigateur : il ne me revient que par le bouton **« Copier mes
  résultats »** de l'artefact.
- **Je ne peux pas juger la tâche C** (2.2 / 2.3) : je connais les réponses
  attendues, donc mon verdict ne vaudrait rien.
- **La suppression de la branche est bloquée ici.** Quatre tentatives, toujours
  `send-pack: unexpected disconnect`, alors qu'un `git push` normal passe dans la
  même seconde. C'est la suppression de référence que le proxy n'honore pas —
  d'où la porte 2.5.
- **Le fait que le correctif ne répare pas les copies existantes** est déduit du
  code, pas observé sur ton corpus. C'est ce que la mesure 1.2m va établir.

### Mes erreurs de la journée

- **J'ai affirmé que `main` n'avait pas le chantier skills.** C'était le clone
  tronqué du conteneur. `RELAIS.md` disait vrai, et sa mise en garde en gras
  existe précisément pour ça — je ne l'avais pas appliquée avant de conclure.
  Rattrapé au `git fetch --unshallow`.
- **Mes deux premières phrases de tâche C recopiaient des mots des
  descriptions** (« carte », « prépare »). Elles n'auraient testé qu'une
  correspondance littérale. Corrigé avant livraison, contre-épreuve mot par mot.

---

## HISTORIQUE

| Date | État |
|---|---|
| 2026-08-18 | Création. 12 rangées à cocher, 4 mesures, 3 décisions. La porte 2.1 (specs Playwright) est arrivée déjà close : la suite a tourné sur le Mac pendant la rédaction (`4db3e76b`). Cycle : chantier skills + cherry-pick Brique C (`ca7564bb`). Aucune porte iPad ce cycle — rien de livré ne touche le tactile, et une porte sans objet fait ignorer la liste entière. |
