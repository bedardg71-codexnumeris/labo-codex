# Demande de relecture – Des standards sans portfolio, lot 4 : choisir à l'écran les productions qui comptent (29 octobre 2026)

> Claude Code, jeudi 29 oct. 2026. Consigne : `CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-4.md` ; mots : `TEXTES-2026-10-29-standards-lot-4.md`, posés mot pour mot. Code : `1a9aa135`. Non poussé, pas de release.

## 1. Ce que l'utilisateur voit

Dans une pratique Standards **sans aucun « Artefact » et hors hybride**, sous le bloc du mode de sélection (« Construction de la note »), le titre « Productions qui comptent dans la note » et sa ligne d'aide, puis une case par production du pool (hors conteneur, terminale et diagnostiques), toutes cochées par défaut. Décocher une production l'écarte de la note et de tous les lecteurs du lot 2. **Avec un « Artefact » (la pratique de Grégoire), la liste ne paraît pas** ; en hybride non plus, et l'hybride garde ses deux listes telles quelles.

## 2. Où vit la liste

Dans la pratique, `configuration.productionsExclues` : des ids de productions (`configuration`, sinon `config`, là où le calcul lit la pratique, #712). C'est une liste d'**exclusions**, pas une catégorie : une production créée plus tard compte d'office, et un id qui ne mène à aucune production n'exclut rien. Une pratique sans liste ne change pas. La liste ne s'écrit qu'au geste (`basculerProductionQuiCompte`, `pratiques-gestion.js`, par `modifierEtAnnoncer`). L'ouverture du formulaire n'écrit rien (épinglé). Quand la dernière exclusion est recochée, la clé est retirée.

## 3. Comment le pool la reçoit

`obtenirArtefactsIdsPoolStd(productions, terminalId, configPratique)` (`pratique-registre.js`) prend un troisième argument. Les exclusions ne s'appliquent que dans la seconde branche (sans « Artefact »), et seulement hors hybride (`categories.actif`, la même règle que `modeHybride` du profil). Leur lecture passe par `productionsExcluesDuPoolStd`.

- **Argument absent, la pratique active** : les appels d'avant le lot 4 gardent leur sens. C'est le cas de l'instance `PratiquePANStandards` et de `obtenirIdsPoolStdDuCorpus`, donc des six lecteurs du lot 2, qui suivent sans recopier la règle.
- **Le profil** (`calculerDetailsNoteFinale`) passe **la pratique demandée** (`cfg.configPratique`) : le Comparateur lit les exclusions de la pratique qu'il simule, pas celles de l'active (épinglé, break-test D3).
- **L'écran** passe `{}` pour lister le pool entier, cases décochées comprises.

## 4. Avant → après

| Cas | Avant | Après |
|---|---|---|
| CHIM-1, « Tous », L1 exclue | 77 (P 77) | 78,75 (P 79, Comparateur 79, export 79) ; le profil affiche « 78,8 % » |
| CHIM-1, lecteurs du lot 2, L1 exclue | dépistage, export, remises, retenues : L1 à X2 ; « ≥ Min. » 5 | L2 à X2 ; « ≥ Min. » 4 ; L1 sans numéro RLO |
| CHIM, « 3 meilleurs », X2 exclue | 85 | 80 |
| CHIM, L1 exclue, L4 créée ensuite (100) | — | 83 : L4 compte |
| CHIM, id inconnu exclu | 77 | 77 |
| CHIM, L1 « sélection » restée (R1), X1 exclue | 77 | 81,25 : la catégorie ne restreint toujours rien |
| CHIM-3 hybride, L2 et X1 dans la liste | 80,63 | 80,63 |
| GREG, A4 et T1 dans la liste | 84,8 | 84,8 ; lecteurs inchangés ; la liste ne paraît pas |

## 5. Le partage

J'ai mesuré : `configuration` est un `objet-libre` (`partage-schemas.js`), donc la liste partait avec la pratique. Les ids de production sont uniques (`genererIdUnique('PROD_')`), si bien que chez quelqu'un d'autre elle n'aurait rien exclu, sauf si cette personne avait aussi importé les mêmes productions sous les mêmes ids. **J'ai décidé qu'elle ne part pas** : `projeterEntite` la retire pour une pratique (partage `.lcz`, break-test D6). L'export JSON « Exporter mes pratiques » (`exporterPratiquesUtilisateur`) la retire aussi : il sert au même geste, partager avec des collègues. La pratique de l'auteur garde sa liste.

## 6. La dernière case

Elle est désactivée. Aucun mot neuf : ce n'était pas nécessaire. Le geste qui arriverait quand même est refusé (break-tests D4 et D5).

## 7. Tests

- Sentinelle `sentinelle-standards-sans-portfolio`, section H : 11 essais. Les deux textes sont lus dans le fichier TEXTES (la forme `lire(f)` du lot 3).
- Sept mutations, chacune rougit, arbre restauré par sha256 (journal en fin de fichier).
  - D1, le pool sans exclusions : CHIM rougit, GREG reste vert.
  - D2, la liste réécrite en `categorie` : le cas R1 rougit.
- Playwright `standards-sans-portfolio-lot-4.spec.js` (WebKit, 3 passages sur 3) : la liste paraît, décocher L1 par un vrai clic fait passer le profil de 77 à « 78,8 % » ; elle ne paraît pas pour GREG. On attend des éléments, jamais `waitForTimeout`. Sous D1 : CHIM rouge, GREG vert. Les specs des lots 1 à 3 et les deux specs du formulaire de pratique sont vertes, 18 au total.
- Vitest complet : 850 fichiers, 10 311 verts sur 10 312. Le seul rouge est #825 (jeton de build de `pack-demo-10.js`, #1180), attendu jusqu'à la release. **Un push reste bloqué tant qu'il n'y a pas de release.**

## 8. Ce que j'ai supposé

- **L'emplacement** : la consigne disait « sous la Construction de la note ». J'ai placé la liste sous le bloc du mode de sélection, avant les catégories (`#mat-productions-comptees`).
- **Les productions listées** : la liste lit `cle('productions')`, comme les cases de l'hybride (`chargerProductionsPourCategories`), alors que le calcul lit `obtenirDonneesSelonMode('productions')`. C'est identique hors démo et hors simulation.

## 9. Trouvailles

- **Inscrit, hors lot.** L'Aide (`index.html`, PAN – Standards) dit « Sans aucun artefact, elle se calcule à partir de toutes tes productions évaluées ». C'est désormais vrai seulement par défaut. Ce sont des mots lus par l'enseignant·e : ils vont à Grégoire, avec le lot 5 ou le lot de l'Aide qui suit (#1152).
- **Inscrit, hors lot.** Le cas où l'on supprime la seule production qui compte encore : le pool devient vide, et la phrase « Aucune production retenue pour la note n'est encore évaluée. » le dit. La case désactivée ne couvre pas ce geste, qui se fait ailleurs (Conception › Productions).
- **Inscrit, hors lot.** La copie d'une pratique entre trimestres (`copierPratiqueDepuisTrimestre`) emporte la liste telle quelle. Ce sont les données de la même personne, mais je n'ai pas mesuré si les productions copiées gardent leurs ids. Si oui, les exclusions suivent ; sinon, elles n'excluent rien.
- **Commenté, sans suite.** Un paquet `.lcz` fabriqué à la main qui porterait la liste entre tel quel (objet-libre) ; ses ids ne mènent à rien chez qui le reçoit.
