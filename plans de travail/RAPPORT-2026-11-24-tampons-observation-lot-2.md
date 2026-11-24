# Rapport : « Tampons d'observation », lot 2 — observer (24 novembre 2026)

> Claude Code, sur le Mac, branche `lot/tampons-observation-2-observer`, partie de `lot/tampons-observation-1-regler`
> (`cf7d461ef`), arbre `../labo-codex-tampons-observer`. Consigne : Cowork, « Gestion des pratiques de notation 5 »,
> 24 nov., 16 h 30 ; décisions de Grégoire du 24 nov. (12 h 40, 16 h 22). **Rien n'est en ligne** : aucun bump, aucune
> ligne de Nouvelles, rien dans `main`. **Aperçu** : https://deploy-preview-60--codexnumeris-051225.netlify.app
> (demande n° 60, en brouillon, « APERÇU, ne pas fusionner » ; elle porte les lots 1 et 2).

**Fait.** Sur « Observer », les tampons des catégories d'observation se touchent pour l'étudiant·e affiché·e ; « Inscrire et passer au suivant » range leur copie dans l'inscription, sous la cible choisie, en « Observation » comme en « Conversation ». L'historique d'une case et le profil les montrent, datés, avec leur origine. « Régler mes tampons » ouvre les réglages depuis « Observer », sans copie (#1307). Vert sous WebKit et Chromium (14 essais sur 14 chacun), Vitest complet vert (12 392), 19 break-tests rouges sur 19.
**Ce qui contredit la consigne** (détail au § 3) : 1. la cible de forme est atteinte pour douze tampons, **pas pour vingt** (à 1180 × 700, le dernier passe de 32 px sous la bande d'actions) ; 2. les tampons d'« Observer » montrent leur **image sans leur nom** : le nom se lit sur la ligne de l'étiquette une fois le tampon retenu ; 3. au **tableau**, trois textes existants disent encore « remarque » pour une trace de tampons seuls (l'infobulle de la case, la légende, la question avant de retirer une cible) : la décision de 16 h 22 vise l'historique et le profil, je n'y ai pas touché.
**Ce qui reste** : l'essai de Grégoire sur l'iPad (cinq étudiant·es de suite, portrait et paysage) et la page de textes `TEXTES-2026-11-24-tampons-observation-lot-2.md` (six questions). Pas de verdict WebKit complet : rien ne part en ligne.

---

## 1. Le champ neuf

Une inscription de `inscriptionsCibles` gagne **un** champ, `tampons`, toujours présent sur une inscription neuve (`[]` quand il n'y en a pas) :

```
tampons: [ { id, nom, categorieId, categorieNom, critere, emoji } ]
```

| Champ | Ce qu'il porte | Borne |
|---|---|---|
| `id` | l'identifiant du tampon | requis ; le même n'entre qu'une fois |
| `nom` | son nom au moment du geste | 100 caractères |
| `categorieId` | l'identifiant de sa catégorie | |
| `categorieNom` | le nom de sa catégorie au moment du geste | 100 caractères |
| `critere` | le critère qu'il déclare, ou `''` | 200 caractères |
| `emoji` | son emoji s'il en a un, ou `''` | 16 caractères |

- **Jamais l'image**, ni aucun autre champ (un champ inconnu reçu est écarté). Quarante tampons au plus par inscription.
- Les inscriptions d'avant n'ont pas le champ et **ne sont pas réécrites** : `lireTampons` les lit sans tampon.
- **Rien n'est écrit sur le rapprochement** : à l'affichage, `rapprocherTampons` compare le critère déclaré aux textes des critères copiés dans la même inscription (rogné, espaces resserrées, sans égard à la casse ; le premier qui correspond).
- **Source ou stock** : seule la source change. Aucune donnée déjà écrite n'est touchée, rien n'est à réparer.

## 2. Tout ce qui lit et écrit le champ

| Qui | Quoi |
|---|---|
| **Écrit** : `InscriptionsCibles.inscrire` → `construireInscription` → `construireTampons` (`js/pratiques/inscriptions-cibles.js`) | Le seul écrivain, inchangé. Seul l'écran « Observer » lui passe des tampons (`saisieObservation`) ; la fenêtre d'une case et « Inscrire pour une production » n'en passent pas : `tampons: []` |
| **Lit pour accepter** : `motifsRefus` (même fichier) et `motifsObservation` (`js/observation-cibles.js`) | Un tampon suffit, aux deux endroits |
| **Lit pour montrer** : `_entreeHTML` → `tamponsLusHTML` (`js/tableau-cibles.js`) | L'historique d'une case, et le profil qui appelle le même `historiqueHTML` (`js/profil-cibles.js`, non modifié) |
| **Lit pour nommer** : `estDeTamponsSeuls` (`inscriptions-cibles.js`) | Une trace de tampons seuls ne se lit pas « Remarque, sans niveau » |
| **Offre les tampons** : `travauxOutils.tamponsDObservation` et `imageDuTampon` (`js/travaux-outils.js`) | Lus par « Observer » et par `tamponsLusHTML` ; ils ne lisent pas les inscriptions |
| **Emportent l'entrée entière, sans la lire** : le codex, la fusion de deux codex, la Réserve, la correction d'un DA, la suppression d'un trimestre, la vue simple | Aucun changement de code ; essais au § 4 |
| **Ne le lisent pas** : `NoteCibles` (niveau retenu, note), le dépistage, le Comparateur, l'export des résultats | Vérifié par un essai (`note-cibles.js` ne nomme pas les tampons ; trois fichiers seulement lisent le champ) |

**Ce que lit un·e étudiant·e.** LU : les inscriptions ne s'affichent que par `historiqueHTML`, appelé par le tableau des cibles et le profil, tous deux côté enseignant·e ; l'export des résultats (CSV) porte des notes, pas des inscriptions. Aucun relevé remis à l'étudiant·e ne montre d'inscription : je n'ai donc rien eu à en retirer.

**La simulation** (`lot/pratique-en-simulation`, lue au rapport de mesure, non touchée) : un tampon posé depuis « Observer » en simulation s'écrit, comme toute observation, dans la clé réelle du trimestre, sous l'ensemble de la pratique simulée, avec ses tampons. Rien ne le distingue d'une observation faite hors simulation ; si la pratique simulée devient l'officielle, ces traces et leurs tampons se lisent aussitôt.

## 3. Ce que j'ai tranché, et ce que j'ai supposé

| N° | Décision | Ce que j'ai supposé |
|---|---|---|
| 1 | **La forme.** Un tampon qui déclare un critère de la cible est sur la rangée de ce critère, entre son texte et ses coches ; les autres en une rangée au-dessus des critères (la piste de Cowork). Quand des tampons sont offerts, la fenêtre se resserre (marge du haut, écarts entre sections, rangées de critères de 67 à 55 px) | Que resserrer la fenêtre est acceptable **seulement** quand des tampons sont offerts : sans eux, pas un pixel ne bouge |
| 2 | **Image sans nom.** Un tampon de 48 × 48 px montre son image. Son nom est lu (lecteur d'écran, infobulle) et, une fois retenu, écrit sur la ligne de l'étiquette (« Tampons d'observation : X, Y ») | Qu'un nom sous chaque image ne tient pas : douze tuiles avec nom demandent deux rangées et repassent sous la bande à 1180 × 700. **À voir sur l'iPad** : reconnaît-on ses tampons à l'image ? |
| 3 | **Vingt tampons.** Deux rangées en tête : à 1180 × 700, le tampon du dernier critère passe de 32 px sous la bande (capture `observer-20-tampons-1180x700-*.png`) ; à 1180 × 820 et 820 × 1180, tout se voit | Que la cible de la consigne est douze. La forme la plus proche pour vingt : faire défiler la rangée du haut à l'horizontale (une seule rangée) ; non codé |
| 4 | **Une trace de tampons seuls** : aucun niveau, aucun texte, aucun critère renseigné, au moins un tampon | Qu'une trace qui porte des tampons et une coche, sans texte, reste « Remarque, sans niveau » comme une coche seule depuis le 22 nov. (question Q4 de la page de textes) |
| 5 | **Les textes du tableau** qui disent « remarque » pour toute trace sans niveau (infobulle et nom lu de la case, légende du ✎, question avant de retirer une cible) ne changent pas | Que la décision de 16 h 22 vise l'historique et le profil (question Q5) |
| 6 | **La porte** est sur l'écran d'observation, à gauche de « Changer de cible », avec ou sans catégorie d'observation ; pas sur l'écran du choix de la cible | Qu'une seule porte suffit, là où on observe |
| 7 | **Après les réglages**, l'écran relit ses tampons ; les coches, le texte en cours et les tampons retenus encore offerts sont gardés | |
| 8 | **Une catégorie fournie cochée « d'observation »** est offerte même si sa préférence (actions RLO, taxonomie SOLO) la retire de la palette d'Annoter | Que cocher est un choix explicite. Une catégorie ou un tampon **masqués** ne sont pas offerts |
| 9 | **Le refus d'une observation vide** nomme le tampon seulement quand l'écran en offre ; sinon le mot d'avant | |
| 10 | **Échap** ne ferme plus « Observer » quand la fenêtre des réglages est ouverte par-dessus | |

**La porte, mesurée avant de coder** (VU, WebKit) : depuis « Observer », sans aucune copie dans le groupe, `ouvrirEditionRetroObservations` ouvre la fenêtre, ses 23 images se chargent, « Enregistrer » range et referme, aucune erreur. Elle ne dépend de rien qu'Annoter charge. Seul défaut trouvé : Échap fermait l'écran dessous (corrigé, décision 10).

## 4. Le geste et la preuve

**Le temps du geste : deux touches par étudiant·e** (un tampon, puis « Inscrire et passer au suivant »), mesuré sur cinq étudiant·es de suite : dix touches, cinq inscriptions. Chaque tampon de plus coûte une touche. C'est le même compte qu'une coche.

| Suite | Moteur | Résultat |
|---|---|---|
| `tests/integration/tampons-observation-lot-2-observer.spec.js` | WebKit (Playwright 2287) | **14 sur 14** |
| Le même | Chromium (1223, config jetable, non commitée) | **14 sur 14** |
| `tests/unit/sentinelle-tampons-observation-lot-2-observer.test.js` | Vitest | **32 sur 32** |
| Vitest complet | | **12 392 sur 12 392** (960 fichiers) |
| Bancs voisins : le parcours « Suivre ton groupe par cibles », la démo « Par standards », l'inscription, les lots 3 et 4, « à l'essai » | WebKit | **23 sur 23** |
| Le banc du lot 1 (`tampons-observation-lot-1-regler.spec.js`) | WebKit | **23 sur 23** |

**Un banc mis à jour, comme annoncé par la consigne** : `sentinelle-par-standards-lot-2-inscrire.test.js` figeait treize champs ; il en attend quatorze, avec `tampons: []`.
**Un rouge de mon fait, trouvé par Vitest complet et fini** : trois classes neuves sans règle CSS (cliquet #679) ; elles ont leur règle.

### Les sentinelles attendues, et leur break-test

| Sentinelle de la consigne | Essai | Mutation → rouge |
|---|---|---|
| Un tampon seul suffit à inscrire | Vitest B (trois essais) ; « un tampon seul suffit à inscrire : deux touches… » | B1, B2, B16, B18 |
| Aucune inscription ne coche un critère du fait d'un tampon | Vitest C ; « un tampon seul… », « plusieurs tampons, un texte, une coche… », « …sur la rangée de ce critère ; le toucher ne coche rien » | B3 |
| Renommer puis supprimer un tampon ne change pas la trace | Vitest F ; « renommer puis supprimer… » (par la vraie fenêtre des réglages) | B6 |
| Une trace de tampons seuls ne s'appelle « remarque » ni à l'historique ni au profil ; sa case montre ✎ | Vitest E ; « une trace de tampons seuls : sa case montre ✎… », « au profil… » | B5, B17 |
| Sans catégorie d'observation, l'écran est celui d'aujourd'hui | « sans catégorie d'observation… », Vitest F, et la comparaison au pixel ci-dessous | B10 |
| Le champ passe le codex, la fusion, la Réserve, la correction d'un DA | Vitest G (quatre essais) | B4 (la copie), B18 (le champ) |
| (en plus) Toucher retient, relâche, repart à vide ; l'état pressé | « toucher retient, toucher encore relâche… » | B9, B14 |
| (en plus) La forme à 1180 × 700 ; 44 px | « chaque tampon est une cible de 44 px… » | B12 |
| (en plus) La porte, Échap, ce qui est en cours | « depuis « Observer », sans aucune copie… », « décochée dans les réglages… » | B11, B15, B19 |
| (en plus) Le rapprochement, la classe des critères, l'échappement | Vitest D, H, E ; « le nom d'un tampon… sont du texte » | B7, B8, B13 |

**19 mutations, 19 rouges** (12 jugées par Vitest, 13 par WebKit ; six par les deux). Chaque fichier est remis après sa mutation, arbre propre vérifié.

### La comparaison au pixel, sans catégorie d'observation

VU (WebKit) : la fenêtre « Observer » capturée sur le lot 1 (`cf7d461ef`) et sur le lot 2, même espace, à 1180 × 820, 1180 × 700 et 820 × 1180, en clair et en sombre, sans aucun tampon créé puis avec six tampons dans une catégorie non cochée.
- Hors de la rangée de la porte et hors d'une lisière de 12 px : **12 captures sur 12 identiques**. La rangée de la porte garde sa hauteur (48 px) : rien ne bouge dessous.
- Jusqu'au bord : 11 sur 12 ; la douzième diffère de 61 pixels dans le bord haut. Inférence, non mesurée : le fond animé derrière le bord, comme au lot 1.

### Ce que j'ai VU

- L'écran, le geste, l'historique, le profil, la porte : au navigateur, sous WebKit et Chromium, sur un groupe fictif.
- Les mesures de forme (WebKit, quatre critères) :

| Tampons | 1180 × 700 | 1180 × 820 | 820 × 1180 |
|---|---|---|---|
| 6 (2 sur des critères) | dernier tampon à 510, bande à 644 | 510, bande à 736 | 504, bande à 730 |
| 12 (4 sur des critères) | **620, bande à 644** : tout se voit | 620, bande à 736 | 614, bande à 730 |
| 20 (4 sur des critères) | **676, bande à 644 : 32 px dessous** | 676, bande à 764 | 670, bande à 786 |

« Inscrire et passer au suivant » se voit en entier dans les neuf cas.
- Le parcours « Suivre ton groupe par cibles » et la démo : leurs bancs sont verts, sans changement ; la démo n'a aucune catégorie cochée.

### Ce que j'ai LU seulement

- La Réserve : son filtre par DA (`_filtrerParDA`) joué sur une liste, **pas un versement réel**. La fusion : `_analyserFusion`, pas la fenêtre de fusion. Le codex : vrai module et vrai ZIP, en Vitest, pas au navigateur.
- La simulation et ce que lit un·e étudiant·e (§ 2).
- Le contraste des tampons et de leur état pressé : ce sont les variables déjà employées par l'écran (`--accent-primaire`, `--bordure-moyenne`) ; je n'ai pas mesuré le rapport.

### Ce qu'aucun banc ne joue

- L'iPad et Safari réels : le toucher, la hauteur utile en paysage (plus petite que 820 ; j'ai visé 700), la fenêtre des réglages ouverte par-dessus « Observer ». C'est l'essai de Grégoire.
- Le lecteur d'écran lui-même : les annonces sont écrites dans la zone `aria-live`, leur texte est vérifié, pas leur lecture.

## 5. Les captures

Dans `plans de travail/captures-2026-11-24-tampons-observation-lot-2/` (WebKit, 1 px d'image pour 1 px CSS) :
- `observer-{6,12,20}-tampons-{1180x820,1180x700,820x1180}-{clair,sombre}.png` : dix-huit captures, deux tampons retenus (un en tête, un sur un critère) ;
- `historique-d-une-case-1180x820-{clair,sombre}.png` : une trace de tampons seuls (l'un à côté de son critère, l'autre sous la cible) et une trace avec un texte et un tampon ;
- `tableau-case-crayon-1180x820-{clair,sombre}.png` : la case et son ✎ ;
- `profil-cibles-1180x820-{clair,sombre}.png` : les mêmes traces au profil.

## 6. Sécurité

- Le nom d'un tampon, celui de sa catégorie, son critère et son emoji passent par `echapperHtml` à l'écran, à l'historique et au profil ; l'adresse de l'image aussi (essais « sont du texte », break-test B13).
- Aucun gestionnaire inline : les tampons et la porte sont des `data-oc`, suivis par l'écoute déjà posée sur la fenêtre.
- Aucun `console.log`. Aucun nom réel : tout est fictif, et aucun tampon, catégorie ou critère fourni n'est nommé dans le code neuf ni dans les essais (Vitest H ; le harnais crée tout).

## 7. Trouvailles (trois issues)

| N° | Trouvaille | Issue |
|---|---|---|
| T1 | #1307 (sans copie, aucun chemin vers les réglages) : la porte d'« Observer » y répond pour un groupe en pratique par cibles | **Noté au BACKLOG**, sous #1307 : traité sur la branche, ouvert tant que le lot n'est pas en ligne |
| T2 | La fenêtre des réglages des tampons ne se ferme pas à Échap. LU et VU | **Commenter et oublier** : antérieur, sans conséquence ici (Échap ne ferme plus l'écran dessous) |
| T3 | La fenêtre des réglages et « Observer » ont le même `z-index` (9999) ; la première passe dessus parce qu'elle est ajoutée après. VU | **Commenter et oublier** : mesuré, tient |
| T4 | Trois textes du tableau disent « remarque » pour une trace de tampons seuls | **Remonte par la page de textes** (Q5) : ce sont des mots |

## 8. Ce qui remonte à Grégoire, par Cowork

1. **L'essai sur l'iPad** : charger la démo n'y suffit pas (elle n'a aucune catégorie cochée). Sur l'aperçu, dans un groupe en pratique par cibles : « Observer », choisir une cible, « Régler mes tampons », cocher « D'observation » pour une catégorie, « Enregistrer » ; puis cinq étudiant·es de suite, en portrait et en paysage.
2. **La page de textes** : `plans de travail/TEXTES-2026-11-24-tampons-observation-lot-2.md`, six questions.

## Journal des break-tests (24 nov. 2026 ; V : Vitest, P : WebKit)

| N° | Mutation | Rouge |
|---|---|---|
| B1 | `motifsRefus` ne compte plus le tampon | V : B (2) |
| B2 | `motifsObservation` ne compte plus le tampon | V : B ; P : « un tampon seul suffit… » |
| B3 | un tampon qui déclare un critère le coche | V : C (2) ; P : « un tampon seul… », « plusieurs tampons… » |
| B4 | la copie emporte l'image | V : A |
| B5 | une trace de tampons seuls garde « Remarque, sans niveau » | V : E (2) ; P : « sa case montre ✎… », « au profil… » |
| B6 | le nom affiché est celui des réglages, pas celui de la copie | V : E, F (7) ; P : « renommer puis supprimer… » |
| B7 | le rapprochement tient compte de la casse | V : D |
| B8 | un tampon porte la classe des critères | V : H ; P : « …sur la rangée de ce critère… » |
| B9 | passer au suivant garde les tampons retenus | P : « toucher retient… » |
| B10 | les tampons sont offerts sans catégorie d'observation | V : F (3) ; P : « sans catégorie… » et deux autres |
| B11 | Échap ferme « Observer » sous les réglages | P : « depuis « Observer »… » |
| B12 | les rangées de critères ne se resserrent plus | P : « chaque tampon est une cible de 44 px… » |
| B13 | le nom d'un tampon n'est plus échappé à l'historique | V : E |
| B14 | l'état pressé n'a plus son ✓ | P : « toucher retient… » |
| B15 | le texte en cours n'est pas rendu après les réglages | P : « depuis « Observer »… » |
| B16 | l'écran n'offre aucun tampon | P : « un tampon seul suffit… » |
| B17 | l'historique ne montre plus les tampons rangés sous la cible | V : E, F (7) |
| B18 | l'inscription ne range pas le champ | V : A, B, F (3) |
| B19 | l'écran ne relit pas ses tampons après les réglages | P : « depuis « Observer »… », « décochée dans les réglages… » |
