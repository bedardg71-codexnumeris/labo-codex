# Portes terrain — Importer les cartouches d'un autre trimestre

**Version à tester : 1.95.1**, build `0824-1716` · branche `claude/uniform-save-confirmations-qbb33o`
Jumeau interactif : `plans de travail/portes-terrain-2026-08-24-cartouches-inter-trimestre.html`

> Ce qui échoue ici devient un item de BACKLOG avec son numéro de porte, jamais une note mentale.

---

## Ce qui a changé, en une phrase

La bibliothèque de cartouches a maintenant sa section **« Importer depuis un
autre trimestre »**, comme les grilles, les échelles, les productions et les
pratiques. C'était la seule des cinq à ne pas l'avoir.

**Une cartouche arrive toujours avec sa grille.** Ce n'est pas un choix de
confort : une cartouche est rangée SOUS sa grille (clé `cartouches_<grille>`).
Sans grille d'accueil, elle n'a aucun endroit où exister. Donc : si la grille est
déjà dans ton trimestre courant, la cartouche s'y range ; sinon la grille est
copiée avec elle.

## Cette liste a été triée avant d'être écrite

**Sept comportements ont été prouvés en session**, dans un vrai navigateur contre
le vrai `index.html` — ils ne sont pas devenus des rangées. Le relevé de chaque
preuve est au §2 bis. **Il reste 16 rangées à cocher et 4 décisions.**

---

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | `git pull`, recharger l'app, lire le bas de page | **1.95.1, build `0824-1716`.** Plus bas = tu testes l'état d'avant — et en 1.95.0 la section n'apparaît PAS, c'est le bug corrigé. |
| 0.2 | Exporter un Codex de sauvegarde | Tout le §1 écrit dans ton corpus réel. |

---

## §1 · ⚠⚠ Données — sur ton corpus

> **La rangée 1.1 est celle qui a échoué sur ta capture du 24 août.** La cause est
> identifiée, reproduite et corrigée en 1.95.1 — le §2 bis la raconte. Si elle
> échoue encore, c'est un vrai résultat à me rapporter tel quel.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 1.1 | Conception › Cartouches de rétroaction › **Consulter la bibliothèque**. Faire défiler jusque sous les boutons d'export. | Un bloc **« Importer depuis un autre trimestre »** avec un menu déroulant. **C'est exactement ce qui manquait sur ta capture du 24 août 17 h** — voir le §2 bis pour la cause. | ⚠⚠ Données |
| 1.2 | Comparer la liste des trimestres du bloc **cartouches** avec celle du bloc **grilles** (bibliothèque des grilles). | Les mêmes trimestres, à ceci près qu'un trimestre dont aucune grille ne porte de cartouche n'apparaît que côté grilles. **Si un trimestre te manque côté cartouches alors que tu sais qu'il en a, note-le : c'est un vrai échec.** | ⚠⚠ Données |
| 1.3 | Choisir un trimestre, cliquer **« Voir les cartouches »**. | La liste apparaît, **groupée par grille**, et chaque grille annonce ce qui va se passer : « sa grille est déjà dans ce trimestre » ou « sa grille sera copiée avec elle ». | ⚠⚠ Données |
| 1.4 | Compter ce que la liste affiche, et comparer avec ce que tu te rappelles de ce trimestre. | **Mesure, pas un seuil.** Un écart n'est pas forcément un défaut (l'archivage ne copie que les cartouches des grilles *utilisées*), mais je veux le chiffre. | ⚠⚠ Données |
| 1.5 | Importer **une** cartouche dont la ligne dit « sa grille sera copiée avec elle ». | Bandeau vert « … importée dans ce trimestre » + « Sa grille … a été copiée avec elle ». La grille apparaît dans ta barre latérale des grilles, avec **cette seule cartouche**. | ⚠⚠ Données |
| 1.6 | Importer **une autre** cartouche de la **même** grille. | Bandeau vert disant « Rangée dans « … », déjà présente ». **Aucune SECONDE grille du même nom n'apparaît** — c'est le point le plus important du lot. | ⚠⚠ Données |
| 1.7 | Réimporter la cartouche du 1.5. | Bandeau **bleu** : « … est déjà dans ce trimestre. Pour en avoir un second exemplaire, utilise « Dupliquer ». » Rien n'est ajouté. | ⚠⚠ Données |
| 1.8 | Choisir un trimestre, cliquer **« Tout importer »**, accepter la confirmation. | Bandeau vert « Import terminé » + le compte de cartouches copiées, de grilles copiées, et de celles déjà présentes. | ⚠⚠ Données |
| 1.9 | Ouvrir la bibliothèque des **grilles** et vérifier qu'aucun doublon n'est apparu. | Autant de grilles qu'avant, plus celles réellement importées — jamais deux fois la même. | ⚠⚠ Données |

---

## §2 · Interface — Safari et iPad

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.1 | Sur **iPad**, ouvrir la bibliothèque de cartouches et regarder le nouveau bloc. | Le menu déroulant et les deux boutons tiennent sur la largeur, sans déborder ni se chevaucher. | iPad |
| 2.2 | Sur **iPad**, « Voir les cartouches » puis faire défiler la liste. | La liste défile dans son propre cadre, les boutons « Importer » restent atteignables au doigt. | iPad |
| 2.3 | Sur **Mac**, refaire le 1.3 en **mode sombre**, puis en **mode clair**. | Le bloc et la phrase d'explication sont lisibles dans les deux. | |

---

## §2 bis · Ce qui a été retiré, et la preuve qui le permet

> Ces cartes se lisent, elles ne se cochent pas. Chacune a été exécutée le 24 août
> dans Chromium contre le vrai `index.html`. Fichier :
> `tests/integration/cartouches-import-trimestre.spec.js` (7 cas).

| Retiré | Preuve mesurée |
|---|---|
| ⚠ **« Un trimestre VIVANT est proposé »** — le bug de ta capture | Deux trimestres, le second jamais archivé : ses grilles dans `h2026_grillesTemplates`, ses cartouches dans la clé partagée `cartouches_GR_H26`. **AVANT correction** : liste vide, section non rendue — reproduit à l'identique de ta capture. **APRÈS** : « Hiver 2026 (2 cartouches) », section rendue. Break-test : en revenant à la lecture archive-seule, ce cas rougit. |
| « Le bloc apparaît avec le bon compte » | Trimestre `a2025` semé avec 2 cartouches archivées. Le sélecteur est bien rendu dans le modal, et son option lit exactement **« Automne 2025 (2 cartouches) »**. |
| « L'aperçu groupe par grille et annonce le sort de la grille » | L'aperçu contient « Grille-5 FR-HOLIS A25 » et la mention **« sa grille sera copiée avec elle »**. Deux boutons « Importer », un par cartouche. |
| « Le dispatcher passe bien les TROIS paramètres » | Relevé des attributs du bouton : `{p1:'a2025', p2:'GRILLE_A25', p3:'CART_1'}`. Sans le troisième, la fonction aurait reçu `undefined` comme id de cartouche — aucun test de logique pure n'aurait vu ça. |
| « Un import copie la grille et UNE seule cartouche » | Après import : 1 grille dans le trimestre actif, `inspireDeTrimestre = 'a2025'`, **1** cartouche (« Stratégies de lecture »), et le trimestre source garde ses **2**. |
| « Réimporter ne crée pas de doublon » | Deux imports d'affilée de la même cartouche : 1 grille, 1 cartouche, bandeau « est déjà dans ce trimestre ». |
| « Tout importer range le lot sous UNE grille » | Les deux cartouches partagent la grille source : la première la fait copier, la seconde s'y rattache. Résultat mesuré : **1** grille, **2** cartouches, source intacte. |

⚠ **Ce que la preuve d'intégration a trouvé et que la sentinelle unitaire ratait.**
Mes tests unitaires éprouvaient chaque chemin isolément et passaient tous. En les
ENCHAÎNANT dans le navigateur — premier import qui copie la grille, second qui
devrait se rattacher — le second **créait un doublon**. La cartouche arrivée par
le premier chemin ne portait aucune trace de filiation, donc plus personne ne la
reconnaissait. Corrigé, et deux tests neufs verrouillent l'enchaînement.

⚠ **Et un test de moi qui ne prouvait rien.** Mon test « la source n'est jamais
mutée » passait quoi qu'il arrive : mon faux magasin clonait à la lecture. Le
break-test l'a démontré en mutant volontairement la source **sans faire rougir le
test**. Faux magasin corrigé, test réécrit, puis dédoublé — il ne visitait qu'un
des deux chemins.

---

## §3 · Décisions — ce qui attend ton verdict

> Ce ne sont pas des vérifications. Chacune attend une phrase écrite, pas une coche.

| | Question | Ce que j'ai fait, et pourquoi |
|---|---|---|
| 3.1 | **Seuls les trimestres ARCHIVÉS sont proposés.** | Un trimestre vivant partage le catalogue global : ses cartouches sont déjà visibles dans ta bibliothèque, il n'y a rien à en « importer ». C'est le même choix que pour les grilles et les échelles. Mais si tu t'attendais à voir tes trimestres courants dans la liste, dis-le. |
| 3.2 | **« Tout importer » prend TOUT le trimestre**, toutes grilles confondues. | Pas de filtre par grille : le geste est « je rapatrie ce trimestre-là ». Si tu te retrouves à importer beaucoup pour n'en garder que deux, il faut un filtre. |
| 3.3 | **Une cartouche importée arrive directement dans la barre latérale** (pas dans « disponibles à ajouter »). | Aligné sur l'import de grilles depuis un autre trimestre. Tu l'as demandée, elle est là — mais ça remplit la barre latérale plus vite. |
| 3.4 | **La phrase du bloc** : « Une cartouche arrive toujours avec sa grille : si la grille est déjà dans ce trimestre, la cartouche s'y range ; sinon la grille est copiée avec elle. » | J'ai préféré expliquer avant le clic plutôt qu'après. C'est deux lignes de plus dans un modal déjà chargé. |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et WebKit.** Le navigateur cible n'existe pas dans le conteneur : les
  six preuves du §2 bis viennent de **Chromium**. Un vert Chromium est un indice,
  pas un verdict Safari.
- **L'iPad.** Tout le §2, entièrement à ta charge.
- **Ton corpus réel.** Je ne connais pas la répartition de tes cartouches entre
  tes trimestres. Les rangées 1.2 et 1.3 sont là pour la mesurer.
- **Une erreur de conception de ma part, corrigée le jour même.** La 1.95.0 ne
  lisait que les copies d'archive `<trimestre>_cartouches_<grille>`, en croyant
  protéger d'un piège connu (#464/CT-26). Or depuis #358 les grilles sont
  namespacées pour TOUT trimestre, pas seulement les archivés : un trimestre
  vivant a ses grilles rangées à part et ses cartouches dans la clé partagée. Ma
  garde rendait donc la section invisible pour le cas le plus courant — le tien.
  Reproduit au navigateur AVANT correction, puis verrouillé par deux tests neufs
  (unit 5a + intégration 2). Le vrai risque du repli, lui, est bien gardé : une
  grille présente à l'identique dans les deux trimestres est exclue, parce que son
  magasin de cartouches est littéralement le même (unit 5b).
- **La suite Playwright existante.** Les rouges Chromium préexistants mesurés au
  cycle précédent n'ont pas été recontrôlés ici : mon diff ne touche que
  `cartouches.js`, `changelog-data.js` et les points de version.

---

## Ce qui a été mesuré en session

- **3022 tests unitaires verts** (298 fichiers), dont **10 assertions neuves**.
- **6 preuves d'intégration** Chromium, neuves.
- **Break-test de chaque assertion, une à une.** Deux ont changé le code : celle
  qui a révélé le test tautologique, et celle de la trace de filiation.
- 0 `console.log`, 0 `innerHTML` non échappé, 0 handler inline ajoutés.
