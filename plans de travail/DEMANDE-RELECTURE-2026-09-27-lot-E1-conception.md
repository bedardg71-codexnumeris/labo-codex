# Demande de relecture – lot E1 de l'enregistrement : créer ou modifier, zone Conception (D3)

> Écrite le 27 septembre 2026 par Claude Code, pour Cowork. Branche `lot-e1-conception`, partie de `df359bfe` (1.163.0 + dépôt de la carte d'alignement) ; commits du lot `d8f619c0`, `6c70db4e`, `ca9ab0c0`, puis le commit de cette demande. Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (ta consigne E1 du 27 sept., 11 h 53). Source : `DECISIONS-2026-09-26-enregistrement.md`, D0 et D3. **Pas de release ni de fusion avant ta relecture**, et pas de push avant que Grégoire ait accepté les mots du § 5.

## 1 · Ce que le lot change

| Pièce | Avant | Après |
|---|---|---|
| Témoin des écritures de la Conception | les éditeurs écrivaient par `db.modifier` direct (#510) : ni « Enregistré », ni échec dit | **`modifierEtAnnoncer`** (`modes.js`), pendant de `sauvegarderDonneesSelonMode` pour `db.modifier` : même file, « Enregistré » après une écriture qui a eu lieu, « Non enregistré – ‹geste› : ‹raison› » sur un échec (l'erreur est **relancée** : les appelants gardent leur comportement), rien quand le mutateur renonce. La garde #340 est consultée avant de rendre la valeur (sinon `db.set` refuse par un `return` nu, et on annoncerait un succès). **50 sites** de gestes d'usager convertis (grilles 19, échelles 13, cartouches 4, pratiques 14), plus l'écrivain du formulaire de grille. Geste : « Modifier la grille / l'échelle / la cartouche / la pratique » ; « Créer la … » pour les créations |
| Grille, échelle, cartouche **existantes** | « Annuler » (n'annulait rien) + « Enregistrer » (réécrivait ce qui l'était déjà) | **« Fermer »** seul. Le bouton de sauvegarde ne paraît qu'en création (`rendreModeFiche*`). L'ancienne branche « Enregistrer une échelle existante » est retirée avec son bouton |
| Grille, échelle, cartouche **en création** | « Enregistrer » ; quitter perdait la saisie en silence | **« Créer la grille / l'échelle / la cartouche »** ; rien en base avant (c'était déjà le cas : critères et niveaux temporaires en mémoire). Question **« Cette grille n'est pas encore créée. »** (Rester / Quitter sans créer, patron #945) à « Fermer », à l'ouverture d'une autre fiche depuis la liste, à « + Nouvelle … », et un `beforeunload` commun au rechargement |
| Cartouche : nom et contexte spécifique | au seul bouton | au **changement de champ** (`sauvegarderNomCartouche`, `sauvegarderContexteSpecifiqueCartouche`) ; la question du doublon est posée au `change` (une fois par nom changé, pas par frappe – la crainte de #517 tient) ; question annulée → le nom en base revient dans le champ |
| Pratique : jetons | au seul « Enregistrer la pratique » | au changement de champ (`data-on-change` sur les sept champs ; la case passe par `onJetonsActifChangeMat`, **séparée** de `toggleSystemeJetonsMat` que le chargement du formulaire appelle – sinon le chargement écrirait un formulaire à moitié rempli). **« Enregistrer la pratique » retiré**, avec sa fonction |
| Assistant de pratique | « ✓ Créer la pratique » même en modification ; « créée » même en modification ; « Créer une grille de base » écrivait la grille au clic | **« Créer la pratique » / « Appliquer à la pratique »** ; « Pratique « … » créée. » / « … mise à jour. » ; la grille de base attend dans `wizardState.grilleDeBase` et n'est écrite qu'avec la pratique, si celle-ci la retient ; fermer l'assistant l'oublie. `sauvegarderPratique` écrit par `sauvegarderDonneesSelonMode` (témoin, retour lu : sur un échec, l'assistant reste ouvert) |
| Champs vérifiés | panneau d'erreur à deux phrases (« … / La modification n'a pas été enregistrée. ») | **« Non enregistré : ‹raison› »** par le témoin (`marquerChampRefuse`, `marquerChampRefuseEchelle` ; `raisonPourTemoin` : minuscule initiale, point final). Nom vidé d'une grille, d'une échelle ou d'une cartouche existante : « Non enregistré – Modifier la … : le nom ne peut pas être vide. » (avant : refus muet) |
| Échelle, niveau ajouté | « … puis enregistre. » | « Niveau ajouté. … chaque champ s'enregistre tout seul. » |
| `notifications.avertissement` (`grilles.js`, collection disparue) | méthode inexistante, garde `if` : message muet | branché sur `notifications.warning`. **Le banc simulait la méthode inexistante** (`sentinelle-collections-gabarit`) : corrigé |
| 16 `alert` au vouvoiement | « Veuillez… » | tutoiement (§ 5) |

## 2 · Décisions techniques prises seul

- **Faire parler le témoin depuis l'écrivain** (ta question du § 2) : une enveloppe de `db.modifier` plutôt que `sauvegarderDonneesSelonMode`, qui est synchrone et romprait la file de #510. Ce n'est pas un second régime : même contrat de parole que le lot B.
- **Bibliothèque, imports, migrations, démarrage** : non convertis (classés B/S par l'inventaire des sites). La bibliothèque est un autre écran ; les migrations ne sont pas des gestes. À toi de dire si la bibliothèque doit suivre dans un lot E.
- **L'assistant garde une écriture synchrone** (`getSync` puis `setSync`, sans `await` entre les deux : pas de fenêtre de course de son propre fait). Mettre sa fusion dans la file aurait demandé de retoucher tous ses harnais pour un risque que je n'ai pas su mesurer.
- **La garde de sortie vit dans `ui-dialogues.js`** (registre de prédicats, un seul `beforeunload`) : un seul endroit pour les trois éditeurs. **Changer de section n'avertit pas** : c'est `navigation.js`, zone protégée. Je ne l'ai pas touché.
- **Une fiche en création sans saisie** (rien tapé) ne pose pas la question.
- **Harnais Vitest** : `completerEcrivainsParDefaut` (dans `charger-script.js`, utilisé aussi par `bac-suivi.js`) fournit `modifierEtAnnoncer` et `sauvegarderDonneesSelonMode` quand le harnais ne les donne pas. Il est paresseux : il prend le vrai `modes.js` s'il est chargé dans le même `window`, sinon il délègue au `db` du harnais. Même patron que `obtenirIdContexteActif` (#834).

## 3 · Bancs adaptés (le geste change, pas l'invariant)

Confirmations de la Conception et type de grille, WebKit (§ 9) ; #957 WebKit (le `change` du champ nom remplace le clic « Enregistrer » ; même écrivain, même invariant), #503 (Fermer), #516 et #524 (le refus par le témoin, vrai module), #522 lots 2b, 2c, 3a, 3b et pratiques, #647, #648 (la file se reconnaît aussi à `modifierEtAnnoncer(` ; 3b : quinze → seize écritures par la file, la seizième est le nom de cartouche), #573 (« pas encore créée »), confirmations de la Conception (seule la création a son panneau), #506 (tutoiement), #717 (« Enregistrer la pratique » retiré), collections (vraie API `warning`).

## 4 · Preuves

- **Vitest** : 645 fichiers, 7 502 essais verts, aucune ligne « Errors »/« Unhandled ». Nouvelle sentinelle `tests/unit/sentinelle-lot-e1-modifier-et-annoncer.test.js` (6 essais, vrai `modes.js`).
- **WebKit** : `tests/integration/lot-e1-conception-creer-ou-modifier.spec.js`, 8 essais verts : (a) cartouche existante, nom et contexte spécifique, puis changement de cartouche → en base, témoin « Enregistré » ; (a) jetons d'une pratique ; (b) grille neuve : rien avant le clic, Fermer → question, Rester garde tout, l'ouverture d'une autre grille pose la question, Quitter sans créer n'écrit rien, Créer écrit et passe en modification ; (b) échelle et cartouche, même question ; (c) assistant abandonné : aucune grille ; modification : « Appliquer à la pratique » ; (e) échec d'écriture : « Non enregistré – Modifier la grille : le navigateur a refusé l'écriture. », aucun succès ; (e bis) nom de critère vidé ; placement à 360, 768, 1024, 1180 px. (d) : #957, 6 essais verts.
- **Mutations, chacune rouge** : M1 un écrivain sans témoin (`modifierCritereGrille` revenu à `db.modifier`) ; M2 nom de cartouche redevenu manuel ; M3 jetons redevenus manuels ; M4 la grille de base écrite au clic de l'assistant ; M5 « Créer la grille » qui écrit avant le clic ; M6 l'avertissement retiré. Six sur six, restauration par copie vérifiée par empreinte. (Un premier passage de M1 a donné un faux rouge – motif `-g` invalide, aucun essai lancé – : rejoué, vrai rouge.)
- **Bancs WebKit voisins** : voir § 9 (résultat reporté en fin de passe).

## 5 · Les mots – à faire accepter par Grégoire avant le push

| Où | Texte |
|---|---|
| Boutons (décidés, D3) | « Créer la grille », « Créer l'échelle », « Créer la cartouche », « Créer la pratique », « Appliquer à la pratique », « Fermer » |
| Question de sortie (titre décidé, D3) | « Cette grille n'est pas encore créée. » (et échelle, cartouche) |
| Question de sortie, corps (ajouté par moi) | « Ce que tu as saisi n'est gardé qu'à l'écran. Si tu quittes, il sera perdu. » |
| Question de sortie, boutons (Cowork) | « Rester » (focus, Entrée le suit) / « Quitter sans créer » |
| Après la création (Cowork) | « Grille « … » créée. », « Échelle « … » créée. », « Cartouche « … » créée. », « Pratique « … » créée. » ; « Pratique « … » mise à jour. » |
| Échelle, niveau ajouté (Cowork, ajusté aux champs de l'écran) | « Niveau ajouté. » / « L'échelle contient maintenant N niveau(x). Ajuste son code, son nom, ses bornes et sa valeur : chaque champ s'enregistre tout seul. » |
| Cartouche pas encore créée (relu contre la règle) | « Cette cartouche n'est pas encore créée » / « Ce que tu tapes n'est gardé qu'à l'écran. Clique sur « Créer la cartouche » ; ensuite, chaque champ s'enregistrera tout seul. » |
| Témoin, champs vérifiés | « Non enregistré : le nom du critère est obligatoire. », « Non enregistré : le code du niveau est obligatoire. », « Non enregistré : donne un nom à la collection. », « Non enregistré – Modifier la grille : le nom ne peut pas être vide. » (et échelle, cartouche) |
| Témoin, échec | « Non enregistré – Modifier la grille : ‹raison› » (et l'échelle, la cartouche, la pratique ; « Créer la … » à la création) |
| Témoin, échec : le geste nommé (R2 de la relecture, tranché par Cowork) | « Non enregistré – Supprimer l'échelle : ‹raison› », « … – Remplacer l'échelle : … » (les écritures qui font suivre les évaluations, productions, pratiques, grilles et cartouches), « … – Dupliquer l'échelle : … » ; de même « Supprimer la grille » (le déplacement de ses cartouches compris), « Dupliquer la grille », « Supprimer la cartouche », « Dupliquer la cartouche », « Supprimer la pratique », « Dupliquer la pratique ». Lus seulement sur un échec. |
| Collection disparue (enfin visible) | « Cette collection n'existe plus. » / « Rien n'a été changé sur le critère. » |
| Nouvelles (à écrire à la release) | « Conception : une grille, une échelle, une cartouche ou une pratique existante s'enregistre toute seule, champ par champ, nom et jetons compris ; le témoin le dit. Pour en créer une nouvelle, un bouton nomme le geste (« Créer la grille »), et l'application te prévient si tu fermes la fiche ou recharges la page avant. « Annuler » devient « Fermer ». » (« si tu quittes » ramené à ce que le lot couvre : changer de section n'avertit pas) |

**Les 16 `alert` au tutoiement :**

| Fichier | Avant | Après |
|---|---|---|
| grilles.js | Veuillez d'abord donner un nom à la grille | Donne d'abord un nom à la grille. |
| grilles.js | Aucune grille sélectionnée. Veuillez d'abord sélectionner une grille à remplacer. | Aucune grille sélectionnée. Sélectionne d'abord la grille à remplacer. |
| grilles.js | Veuillez sélectionner au moins une grille à ajouter | Sélectionne au moins une grille à ajouter. |
| echelles.js | Aucune échelle sélectionnée. Veuillez d'abord sélectionner une échelle à remplacer. | Aucune échelle sélectionnée. Sélectionne d'abord l'échelle à remplacer. |
| echelles.js | Veuillez sélectionner au moins une échelle à ajouter | Sélectionne au moins une échelle à ajouter. |
| echelles.js | Veuillez d'abord sélectionner un trimestre. | Sélectionne d'abord un trimestre. |
| echelles.js | Veuillez entrer un nom pour l'échelle | Donne un nom à l'échelle. |
| echelles.js | Veuillez ajouter au moins un niveau de performance | Ajoute au moins un niveau de performance. |
| cartouches.js | Veuillez donner un nom à la cartouche | Donne un nom à la cartouche. |
| cartouches.js | Veuillez d'abord sélectionner une grille et créer/sélectionner une cartouche | Sélectionne d'abord une grille, puis crée ou choisis une cartouche. |
| cartouches.js | Aucune cartouche sélectionnée. Veuillez d'abord sélectionner une cartouche à remplacer. | Aucune cartouche sélectionnée. Sélectionne d'abord la cartouche à remplacer. |
| cartouches.js (×2) | Veuillez coller du texte Markdown dans la zone prévue | Colle du texte Markdown dans la zone prévue. |
| cartouches.js | Veuillez d'abord créer ou charger une cartouche | Crée ou ouvre d'abord une cartouche. |
| cartouches.js | Veuillez cocher au moins un critère à importer | Coche au moins un critère à importer. |
| cartouches.js | Veuillez d'abord importer la grille associée depuis la bibliothèque de grilles. | Importe d'abord la grille associée depuis la bibliothèque de grilles. |

(`pratiques-gestion.js` et `wizard-pratique-v2.js` n'en portaient aucun.)

## 6 · Fiches

Recherche dans `BACKLOG.md` et `SUIVI-BUGS.md` : cartouche (nom, contexte), jetons, assistant, « créée », Enregistrer / Annuler de la Conception, #938, #854, #618, #786. **Aucune fiche ouverte n'est réglée par ce lot.**
- **#938** (rouvrir une pratique par l'assistant perd les jetons du formulaire) : **non**. L'assistant reconstruit toujours l'objet et n'en recopie pas le bloc plat `jetons`. Le lot ne touche pas cette fusion.
- **#854** : **non**.
- **#618, #786** : closes ; le lot étend leur contrat aux écritures par `db.modifier` de la Conception.

## 7 · Stock

Rien n'est réécrit ni effacé. Une grille, une échelle, une cartouche ou une pratique existante le reste. Aucun effet à la lecture. Les jetons d'une pratique ne s'écrivent qu'au premier changement d'un de leurs champs, pas à l'ouverture.

## 8 · Trouvailles en chemin (issues)

1. **Échelle, « Créer » en écrasant un homonyme** (`sauvegarderEchelleComplete`, branche « écraser ») : l'homonyme est retiré **avant** les vérifications de création (au moins un niveau, repères). Si une vérification échoue, l'homonyme est supprimé et aucune échelle n'est créée. La grille fait ce retrait dans la file, avec l'écriture. Antérieur au lot, sans symptôme vécu connu. **Issue 2** proposée : ça touche une suppression de données. À toi et à Grégoire de dire si elle entre. ⮕ **Tranché par Grégoire (27 sept., 13 h 34) : (a) corrigé dans ce lot** (le retrait passe dans l'écriture de création, essai WebKit et mutation) ; **(b), les références orphelines d'« Écraser », inscrit : #967.**
2. **`sauvegarderCartouche` réécrit l'objet mémoire entier** (`liste[index] = cartoucheActuel`), famille #957. Il n'est plus atteignable qu'en création (où il n'y a rien à écraser). **Issue 3**, noté ici.
3. **À 360 px, la zone d'édition de la grille fait 758 px de large** (critères en colonnes fixes ; l'échelle, 400 px) : toute la fiche déborde, et sa barre avec elle. Antérieur au lot ; ni le Mac ni l'iPad ne sont concernés. **Issue 3**.
4. **Code sans appelant relevé par l'inventaire des sites** (non converti, laissé tel quel) : `afficherConfigurationCategoriesErreurs` (écrit à l'ouverture d'une modale que rien n'ouvre), `mettreAJourNomPratique` / `…Description…` / `…Discipline…` (sans `Mat`), `dupliquerEchelle`, `enregistrerCommeGrille`, `importerDans*Active`, `ajouter*ABibliotheque`. **Issue 3**.
5. **Liste des cartouches** : « Crée une nouvelle cartouche ou puisez dans la bibliothèque » mélange tu et vous. Mot du lot F. **Issue 3**.
6. **Le toast « Critère "…" ajouté et grille "…" sauvegardée ! »** (`grilles.js`, ancien formulaire de critère) garde « sauvegardée » : mot du lot F (D4).

## 9 · Bancs WebKit voisins

41 fichiers (grilles, échelles, cartouches, pratiques, assistant, témoin du lot B, #898, confirmations, type de grille, et ce lot) : **142 essais, 138 verts au premier passage, 4 rouges, tous dus au lot et attendus** : trois essais de `confirmations-conception-uniformes.spec.js` enregistraient une fiche EXISTANTE et attendaient « sauvegardée ! », et `type-grille-lot1.spec.js` appelait `creerNouvelleGrille` sans `await` (elle est devenue asynchrone). Adaptés : les deux preuves de forme du bandeau passent par la création (« … créée. ») ; le refus #466/CO-16 passe par `sauvegarderNomEchelle` (le `change` du nom). Relancés : 5 sur 5 verts.

## 10 · Porte terrain (Mac ou iPad, données réelles)

Renommer une cartouche, puis changer de cartouche, puis revenir ; commencer une nouvelle grille, puis « Fermer » ; ouvrir l'assistant et l'abandonner. Le markdown de la porte et l'artefact viendront après ta relecture (Cowork publie l'artefact).
