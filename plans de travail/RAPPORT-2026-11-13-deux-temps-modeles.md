# Rapport du lot `lot/deux-temps-modeles` — les deux temps, la première partie remise à jour et le modèle d'« Évaluer une première production » (13 nov. 2026)

**Relais.** Branche `lot/deux-temps-modeles`, partie de la tête de `lot/carte-aide-materiel` (`5c43a014e`). Consigne :
`plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md` (relais de la conversation du Projet, 12 nov.,
20 h 10), enchaînée par la relève du 13 nov., 5 h 05. **Fait** : A et B, sur la branche, PR d'aperçu n° 23, non
fusionnée (elle porte aussi la carte d'aide) ; la porte écrite (`PORTES-TERRAIN-2026-11-13-deux-temps-modeles.md`,
quatorze gestes, sans artefact). **Reste** : la porte, un geste par tour ; six décisions de Grégoire (§3 de la
porte) ; la fusion, par un relais à part. Ni release, ni Nouvelles.

## Livraison

- **Commits** : `c9d182f3c`, `7cf7477af`, `3f0a60a1a` (la première partie reprise de
  `claude/deux-temps-modelisation-da3icr`, `89d20ab` à `58966dd`, jetons `?v=` refaits) ; `3f7d07cb5` (partie A) ;
  `683ce5902` (partie B) ; ce rapport et la porte suivent dans un commit de documents.
- **Build** : 1113-0921 (version 1.244.0 inchangée). **PR** : n° 23, aperçu
  `https://deploy-preview-23--codexnumeris-051225.netlify.app`.

## A · La première partie, remise à jour

- **Les libellés** (`MOTS_MATERIEL`, `js/assistance.js`), mot pour mot : « Modélisation », dessous en plus petit
  « avec le matériel de la démo » ; « Pratique guidée », dessous « avec mon matériel ». « Refaire avec mon matériel »
  reste.
- **La phrase sans modèle** (`TEXTE_SANS_MODELE`, `creerAvisSansModele`, sa classe CSS) est retirée. État retenu,
  le plus simple : sous « Modélisation », la carte d'un parcours sans modèle garde son bouton, **inactif**
  (`aria-disabled`, pâle), sans phrase ; touché, il ne lance rien, ni dans la démo ni sur les vraies données.
- **La liste** passe à dix (Attentionné Caribou, Souriante Toucan) ; le texte de l'étape dit « dix », le geste
  « Importer 10 étudiant·es ».

## B · Le modèle d'« Évaluer une première production »

- **Où il se joue.** Dans la démo, sur le deuxième groupe. Préalable : la modélisation de « Mettre ta classe en
  place » ; sans le deuxième groupe, le panneau refuse, la nomme, et la pulsation va à sa carte (`refusModele`). Si
  le groupe actif n'est pas le deuxième, chaque bulle le dit et montre le menu de l'en-tête : c'est la personne qui
  le choisit.
- **Ses étapes.** Les neuf du parcours, reprises telles quelles (`pourLeModele`, `js/parcours-evaluer.js`) : ce
  qu'elles désignent et ce qui les fait avancer ne changent pas ; seuls le texte, le geste et les boutons de
  matériel sont propres au modèle. Rien ne se remplit ni ne se clique tout seul.
- **Où paraît le matériel** (celui de Grégoire, mot pour mot, verrouillé par une sentinelle contre la consigne) :

| Étape | Dans la bulle |
|---|---|
| Ta grille | « Copier la grille » : le tableau de « G4H Sans français » (titre, puis nom, description, pondération) |
| Ta production | « Copier le nom » ; le type « Artefact », la grille, l'échelle « IDME et niv 0 » nommés |
| Tes consignes | « Copier l'objectif », « Copier la tâche », « Copier les consignes » |
| Une première production | l'étudiant·e de la ligne pointée, nommé·e ; Structure M, Rigueur D, Plausibilité D, Nuance D |
| Ta pratique, L'appliquer | « N meilleures évaluations » ; l'échelle à la question de l'assistant |
| Ta cartouche | « Télécharger les commentaires » : le fichier des vingt commentaires |
| Ta rétroaction | « Bon départ ! » ; à la fin, « Explorer la démo » et « Refaire avec mon matériel » |

- **Ce qui manque à la consigne, mesuré** (les trois écarts, à trancher : §3 de la porte) :
  1. **La grille collée naît en points.** L'étiquetage lit une grille sans niveau nommé comme une grille en points
     (critères analytiques) ; les niveaux imposés seraient alors impossibles. Le modèle fait passer les quatre
     critères à « Holistique » par leur menu « Type » (un moment de plus dans « Ta grille », cinq gestes).
  2. **Le nom de la production.** La création bute sur le doublon de titre avec l'« Artefact 1 » du pack : le
     modèle prend la description pour nom (prévu par la consigne) et la donne aussi à « Activité d'apprentissage ».
  3. **Les commentaires par fichier.** Le collage « Importer les commentaires » n'a plus d'interface ; seul
     l'import d'un fichier texte existe. Le niveau 0 passe (vingt cases sur vingt, mesuré).

## Le confinement et ses break-tests

- Ce que le modèle retient reste en mémoire (`ctxModele`) : aucune préférence, aucune donnée écrite hors de la démo.
- Banc B : après le modèle complet, la sortie de la démo laisse **toutes** les clés hors de `demo_*` identiques à
  celles d'avant l'entrée (un trimestre réel peuplé au départ) ; « Remettre la démo à neuf » rend la démo du pack :
  plus de grille, de production, de pratique, de cartouche ni d'évaluation.
- **Break-test des cinq fuites**, en un passage : ce qui s'écrit sous `demo_grillesTemplates`, `demo_productions`,
  `demo_pratiquesConfigurables`, `demo_evaluationsSauvegardees` et `demo_cartouches_*` écrit aussi sous la clé sans
  préfixe → ROUGE, chacune nommée. Rétabli → vert.
- **Break-test du refus** : `refusModele` retiré → A rouge. Rétabli → vert.
- Deux écritures hors de la démo trouvées par l'oracle, corrigées : la préférence de la carte d'aide
  (`laboCodex.aideMateriel`, lot de ce matin) et le témoin de migration des vignettes (voir les trouvailles).

## Bancs (WebKit, Mac, passages ciblés, un à la fois ; pas de verdict complet)

- Vitest : 924 fichiers, 11 547 essais verts, au build 1113-0921.
- `deux-temps-modeles-2026-11-13.spec.js` : A et B à 1180 × 820 et à 820 × 1180, 4/4, quatre passages entiers.
- `deux-temps-modelisation-2026-11-12.spec.js` (la première partie) : 4/4 ; « Évaluer » sous « Pratique guidée »,
  sur les vraies données (`parcours-3-*`) : vert, inchangé.
- Rejoués verts : carte d'aide, bulles, flèches, parcours 1 à 9, présences, rentrée (125 essais passés, 19 sautés :
  captures sur demande).
- **Essais repris** : *B · 1180 × 820*, rouge trois fois sur six (la pulsation absente d'un menu « Type » resté sous
  le bandeau de la démo) ; corrigé (`typeAChanger` amène le menu entre l'en-tête et le bandeau) ; rejoué seul,
  **six sur six**. *« Remettre la démo à neuf »* (première partie) : un délai dépassé pendant une charge machine de
  99 ; rejoué, vert.

## Les mots proposés (ils partent tels quels, corrigeables), `js/parcours-evaluer.js`

- **Refus** (panneau) : « Commence par la modélisation de « Mettre ta classe en place » : ce modèle se joue sur le
  groupe que tu y montes. »
- **Avis** (bulle, hors du deuxième groupe) : « Ce modèle se joue sur le deuxième groupe de la démo : choisis-le
  dans l'en-tête. »
- **Boutons** : « Copier la grille », « Copier le nom », « Copier l'objectif », « Copier la tâche », « Copier les
  consignes », « Télécharger les commentaires » ; leurs confirmations (`MOTS_M`).
- **Textes des bulles** (`TEXTES_M`, `texteEvaluation`) : « Ta grille » (deux textes : le collage, puis les menus
  « Type »), « Ta production », « Tes consignes », « Une première production », « Ta pratique », « L'appliquer à ton
  cours », « Ta cartouche », « Ta rétroaction, avec tes mots » ; les lignes du geste de ces étapes.

## Suppositions

- Le modèle par standards est « N meilleures évaluations » (`STD-n-meilleurs`).
- La production prend sa description pour nom **et** pour activité d'apprentissage.
- La date de remise est libre (« celle d'aujourd'hui convient »).
- Le parcours suivant sans modèle : « Explorer la démo » dans la bulle, pas un bouton inactif.
- Le deuxième groupe se reconnaît dans la démo par un groupe-cours autre que `GC_DEMO` avec des étudiant·es hors du
  pack ; les pratiques du pack, par leur identifiant « demo-… ».
- Typographie : les quatre pourcentages de la grille portent l'insécable (règle #1137), seule différence d'octet
  avec la consigne.

## Trouvailles et issues

| Trouvaille | Issue |
|---|---|
| La grille collée sans niveau nommé naît en points (premier écart). | **Remonte à Grégoire** (§3.1 de la porte) ; le modèle passe par les menus « Type ». |
| `importerCommentaires`, `annulerImportCommentaires` (`js/cartouches.js`) visent des éléments de page qui n'existent plus (`#commentairesColles`, `#zoneImportCommentaires`). | **Inscrire et continuer** : code mort étranger au lot ; lié à §3.3. |
| La migration des vignettes (`_migrerThumbnailsVersIDB`) posait son témoin global depuis la démo : les fichiers du vrai trimestre n'auraient jamais été migrés. | **Corrigé maintenant** (elle cassait le confinement livré) : elle ne passe plus dans la démo. Source tarie ; stock : un espace où le témoin a déjà été posé depuis la démo reste marqué (aucun cas mesuré, le pack ne porte aucune vignette à migrer). |
| `laboCodex.aideMateriel` s'écrivait depuis la démo (une grille créée par un modèle fermait l'accueil de la carte d'aide). | **Corrigé maintenant** (mon lot du matin) ; registre des clés mis à jour. |
| `peuplerUnTrimestreReel` (harnais) : « Prévisualiser » touché trop tôt n'ouvrait parfois pas l'aperçu (sept minutes d'attente). | **Corrigé maintenant** (harnais du lot). |
| Les quatre menus « Type » d'une grille n'ont ni identifiant ni nom : le moteur ne voit pas qu'on passe de l'un à l'autre. | **Commenté dans le code** (`typeAChanger`) : le modèle amène lui-même le menu. |

## Le Mac, 13 nov.

- Une piste mesurée ce matin, sans lien établi avec la panique de 1 h 06 : à 6 h 06, un événement Jetsam nomme
  `virusbarriers` (Intego VirusBarrier) comme plus gros processus (880 Mo) ; à 5 h 13, il est signalé pour 2,1 Go
  d'écritures en dix-huit minutes. Pendant ces périodes, la charge moyenne monte (99 à 8 h 50) et des essais
  dépassent leur délai sans que le code y soit pour quelque chose.
- Les passages Playwright ont été tenus à un à la fois, mémoire relevée entre chacun (36 % à 85 % libres).
