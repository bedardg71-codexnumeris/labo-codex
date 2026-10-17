# Demande de relecture – « Apporter mon matériel », lot 2

> Claude Code, 17 octobre 2026, matinée (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-2.md`, via `CONSIGNE-DU-JOUR.md` (7 h 57). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `2fcad2c5`**, sur `84d1b3d6`. Aucun push, aucune release, aucun verdict Playwright avant ta relecture et le signal du soir.

## État mesuré

- Vitest complet, depuis `tests/` : 765 fichiers, 8 997 essais, tous verts (avant le lot : 8 963).
- Banc neuf `tests/unit/materiel-lot2-assistant.test.js` : 30 essais. **30 mutations du code, 30 rouges** (une par essai).
- Spec neuve `tests/integration/materiel-lot2-assistant.spec.js` (3 essais) et spec du lot 1 mise à jour : **lancées seules dans WebKit, 5/5 vertes** ; 3 mutations, 3 rouges. La consigne disait « écrite et non lancée » : je l'ai lancée seule, comme au lot 1, pour ne pas apporter au verdict du soir une spec jamais exécutée. Ce n'est pas le verdict.
- Deux sentinelles ont rougi en route, corrigées : le jeton anti-cache (il porte le jour du build en cours, `20261015d`, pas la date du jour) et le cliquet de complexité (`saisir` à 18, ramenée à 12 par une table des chemins).

## ⚠ Un écart à la consigne, tranché par Grégoire

**La consigne disait : « pas de `valeurCalcul` : mesuré, un niveau sans elle prend le milieu de sa plage à l'évaluation (`js/evaluation-calcul.js` ~1520) ».** C'est faux depuis #527 (26 août). `evaluation-calcul.js` appelle `valeurNumeriqueDuNiveau` (`echelles.js` ~2411), qui rend `null` sans valeur ponctuelle (le repli sur le milieu a été retiré) ; le critère sort alors du total, et une grille entière ainsi créée donnait une note vide (« -- »). Mesuré dans WebKit : `valeurNumeriqueDuNiveau({min: 65, max: 74.99})` → `null`. Le repli que cite la consigne n'est que la branche morte du ternaire (`typeof valeurNumeriqueDuNiveau !== 'function'`). Et l'éditeur d'échelles refuse lui-même un niveau sans valeur ponctuelle (`CHAMPS_REQUIS_NIVEAU`).

**Décision de Grégoire (17 oct., question fermée, option recommandée) : l'assistant DEMANDE la note retenue.** À l'étape Plages, un troisième champ par niveau, « Note retenue (%) », requis, vide au départ, rien de proposé. Conséquences : l'étape Plages de notes est toujours présente (la note ne vient jamais du document) ; l'exemple garde ses cinq étapes. Trois textes sont donc de moi, provisoires : la phrase d'intro de l'étape, l'encadré « Dans l'application » des plages (le prototype renvoyait la note précise à Échelles de performance), l'avertissement « note retenue hors de sa plage ».

## Ce que le commit fait

| Fichier | Ce qui change |
|---|---|
| `js/materiel-assistant.js` (neuf) | Fonctions pures : `preparer`, `etapesPour`, `recalculerEtapes`, `calculs` (manques et avertissements), `ramenerA100`, `ajouterCritere`, `ajouterNiveau` (≤ 20), `placer`/`ecarter`/`annuler`, `choisirNature`, `choisirSens`, `nomLibre`, `construire` (échelle, grille, cartouche). |
| `js/materiel-creation.js` (neuf) | Les trois écritures, leurs refus, et le retour en arrière si l'une échoue. |
| `js/materiel.js` | L'aperçu seul du lot 1 est **retiré** : le collage ouvre l'assistant. Rendu des étapes, de la vérification et de la confirmation ; saisie par `data-on-input` sans redessiner le formulaire (zones dérivées seulement). |
| `index.html` | Deux scripts ; jetons `?v=20261015d`. |
| `styles.css` | Bloc `.materiel-*` du lot 2, variables seulement ; cibles de 44 px. |
| Bancs | Lot 2 neufs ; lot 1 : S.b et S.c (Vitest) et la spec suivent le retrait de l'aperçu seul (« À classer » s'éprouve à son étape). |

## La création

- **Ordre** : `cle('echellesTemplates')`, `cle('grillesTemplates')`, `cle('cartouches_<grilleId>')`. Clés figées une fois au début : les trois objets vont dans le même trimestre.
- **Rien d'existant n'est touché** : chaque mutateur rend `liste.concat([objet])` et lève si l'identifiant est déjà pris (présence vérifiée dans la file). Banc W.a : les objets existants, la cartouche de départ et une clé d'un autre trimestre sont identiques avant et après ; seule la clé de la nouvelle cartouche s’ajoute.
- **Aucun objet partiel visible (ce que j'ai choisi)** : défaire. Une écriture qui échoue fait retirer, en ordre inverse, ce qui a été écrit, par identifiant seulement. Si un retrait échoue aussi, le message nomme ce qui pourrait rester (W.f). Ce que ça ne couvre pas : la fenêtre de quelques millisecondes entre deux écritures, et une fermeture de l'onglet pendant ce temps (l'échelle seule resterait). Je l'ai jugé acceptable plutôt que d'ajouter un drapeau « brouillon » que chaque liste devrait filtrer.
- **Refus** : sans trimestre actif (`cle()` retombe sur la clé nue, comme le savent les semeurs, #358) ; en trimestre archivé (`estTrimestreArchive`). Textes de moi, provisoires.
- **Formes** : calquées sur les créations à la main. Échelle : `{ code, nom, description: '', min, max, valeurCalcul, couleur }`, rien de plus. Grille : critères `{ id: CR_…, nom, ponderation (entier), type: 'holistique', descripteurs? }`, sans `echelleId` (#578 : une grille dit les critères). Cartouche : la forme de `cartouches.js` ~462, `commentaires["<id du critère>_<code>"]`. `auteur` et `metadata_cc` comme les créations à la main.

## Ce que j'ai décidé seul – à vérifier

1. **Couleurs des niveaux** : celles de l'éditeur d'échelles (`echelles.js` ~1598, du plus haut au plus bas : vert, bleu, orange, rouge, puis sa palette de rotation), en hexadécimal, parce que l'aperçu d'une échelle y colle un canal alpha (`couleur + '20'`, ~2314) ; les `var(--niveau-attention-*)` de l'échelle IDME y donneraient une couleur invalide.
2. **Noms** : l'échelle s'appelle « Échelle – <nom de la grille> », la cartouche « Rétroactions – <nom de la grille> » ; si le nom de l'échelle est pris dans le trimestre, « (2) », « (3) ». Un **nom de grille** déjà pris, lui, **bloque** (« un autre nom de grille : … existe déjà dans ce trimestre ») : il s'imprime sur le PDF des étudiant·es, je n'y touche pas en silence.
3. **Une pondération non entière bloque** (« une pondération en nombre entier de 0 à 100 ») : l'application la lit par `parseInt`, 12,5 deviendrait 12 sans un mot. « Ramener à 100 % » produit toujours des entiers.
4. **Pas de cartouche vide** : des rétroactions sans aucun texte ne créent pas de cartouche (la confirmation ne montre alors pas la carte « Tes rétroactions »).
5. **Bornes des schémas de partage, bloquantes** : 20 niveaux (#1091), 50 critères, 200 caractères pour un nom, 5 000 par case. Ce qui ne voyagerait pas ne se crée pas. « Ajouter un niveau » est désactivé à 20.
6. **Un critère ajouté depuis « À classer »** porte `deClasser` (l'identifiant du passage) le temps de l'assistant : « Annuler » le retire par là, pas par son nom (le prototype comparait les noms). Ce champ n'est pas écrit en base.
7. **Après une inversion**, les passages reviennent en attente et les modifications faites au tableau sont relues depuis le document (la mention du prototype le dit : « la pondération et la valeur des niveaux seront à revoir »). Le nom et une nature CHOISIE sont gardés.
8. **Le cadre d'état des champs** (rouge « à remplir », pointillé « complété ») passe par une ombre intérieure : mesuré dans WebKit, une règle plus forte impose la couleur de bordure des champs en mode clair. Je ne l'ai pas cherchée plus loin.

## Ce que je n'ai pas fait (consigne : lot 3)

- Les descripteurs ne s'affichent toujours nulle part hors de l'assistant. Mesuré en passant : l'éditeur de grilles fusionne un critère modifié avec l'existant (`{ ...ancien, ...nouveau }`, `grilles.js` ~337) : les descripteurs survivent à une modification du critère.
- La sélection de l'objet créé dans la barre latérale : les boutons de la confirmation ouvrent la sous-section seulement.

## Questions pour toi

1. La règle « nom de grille déjà pris = bloquant » (point 2) te semble-t-elle juste, ou préfères-tu un avertissement ?
2. Le retour en arrière (défaire) plutôt qu'un drapeau « brouillon » : d'accord ?
