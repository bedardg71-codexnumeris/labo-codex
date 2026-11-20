# Rapport — lot `autoevaluation-consignes` (19 nov. 2026)

**Dernier relais (20 nov.).** Les quatre retouches de Cowork sont faites, sur la même branche (PR n° 33) : la case
garde le dernier choix ; l'aperçu dit où poser les repères manquants ; un banc « Deux colonnes » ; #1296 inscrit (d'abord #1289 ; #1300 depuis l'assemblage de la release du 19 nov., #1296 étant pris par `lot/glisser-alignement`). Porte
terrain close par Cowork. `main` n'est pas repris (la mise en ligne de midi y fusionne le lot 1 : on rapprochera
après). Ni fusion, ni release. Détail : « Suite du 20 nov. », en fin de rapport.

**Relais du 19 nov.** Branche `lot/autoevaluation-consignes`, partie de `origin/lot/descripteurs-grille` à `39fe4e67`
(le lot 1). Fait : la case « Pour vérifier » dans l'éditeur de grilles, et la grille d'autoévaluation, une feuille à
part dans le PDF des consignes. Réalise la fiche #1287 (inscrite sur `lot/je-regarde-evaluer`, non renumérotée).
APERÇU seulement (PR « APERÇU, ne pas fusionner ») : ni fusion, ni release, ni Nouvelles. `origin/main` ne contenait
pas encore le lot 1 au moment du push (`03dc7d2f`) : rien à fusionner. Reste : le regard de Grégoire sur l'aperçu et
sur les mots ; la porte terrain iPad (`PORTES-TERRAIN-2026-11-19-autoevaluation-consignes.md`). Aperçu :
<https://deploy-preview-33--codexnumeris-051225.netlify.app> (PR n° 33).

## Ce qui est fait

- **A. Éditeur de grilles.** Sous les cases de niveaux de tout critère par niveaux (holistique, algorithmique), une
  case facultative « Pour vérifier ». Rangée dans `critere.descripteurs.pourVerifier` (≤ 5 000 caractères, la borne des
  descripteurs), par la file commune du lot 1, en création comme en modification. Une case vidée retire sa clé, rien
  d'autre. Déclarée dans `js/partage-schemas.js` ET dans le schéma d'import de `js/import-export.js` (fermé lui aussi :
  sans la ligne, elle disparaissait à l'import d'une configuration). Un critère en points n'a pas la case.
- **B. PDF des consignes.** Une feuille à part, après celle des consignes et avant l'évaluation : la grille
  d'autoévaluation. Le contenu est décidé une fois dans le modèle (`construireModeleDocument` → `pageAutoevaluation`),
  posé par les deux rendeurs (`autoevaluationHTML`, `poserAutoevaluationPDF`). L'évaluation ouvre désormais sa page
  selon `feuillesDuDocument`, la fonction même de l'aperçu. Case « Grille d'autoévaluation » dans la bande Production
  de l'aperçu, visible seulement si la page existe, cochée à chaque ouverture ; lue au même endroit par l'aperçu et
  par l'export.
- **Les cases sont tracées** (`doc.rect`). Mesuré d'abord (jsPDF 2.5.1, rendu relu par PDF.js) : avec les polices
  intégrées, « ☐ » s'imprime « & » et la ligne entière devient illisible au copier ; « □ » de même.
- **Un texte long** se poursuit à la page suivante, ligne à ligne, en retrait ; le nom d'un critère ne reste pas seul
  en bas de page ; rien n'est dessiné sous la marge (éprouvé à 2 × 5 000 caractères).
- **Échelle sans ses deux repères : pas de page** (ni la case). ⚠ L'échelle de départ (IDME) que l'application sème
  n'a PAS de repères d'origine (mesuré : `assurerEchelleIdmeDeDepart` n'en pose aucun). Avec elle, la page ne paraît
  qu'une fois posés « Suffisant à partir de » et « Maîtrisé à partir de » dans Conception › Échelles. L'aperçu ne dit
  pas pourquoi la page manque : la case est simplement absente.

## Mots proposés (mots d'enseignant, partis tels quels, corrigeables)

- Éditeur (`TEXTES_DESCRIPTEURS`, `js/grilles.js`) : titre de la case « Pour vérifier » (le mot du mandat) ; dans la
  case vide « Facultatif : une question que l’élève se pose devant sa copie » ; étiquette d'accessibilité « Pour
  vérifier : la question que l’élève se pose devant sa copie » ; refus « Une question fait 5 000 caractères au plus ».
- Aperçu (`index.html`) : la case « Grille d'autoévaluation ».
- Mots de l'élève (`TEXTES_AUTOEVALUATION`, `js/export-pdf.js`) : ceux que Grégoire a validés, mot pour mot. Seule
  retouche : l'espace avant « : » et « ; » est insécable, pour qu'un signe ne commence jamais une ligne.

## Suppositions nommées

1. **Le champ** s'appelle `pourVerifier` ; écrire la question ne pose pas d'échelle (elle n'en dépend pas). Vidée
   seule sur un critère sans autre texte, elle laisse `descripteurs: {}` (rien d'autre n'est retiré).
2. **Quels critères** : ceux qui se notent par niveaux (règle de l'éditeur). Un critère en points n'entre jamais dans
   la page, même s'il porte des textes liés à une échelle (assistant d'avant #1125).
3. **Les textes se lisent par le CODE** du niveau, quelle que soit l'échelle pour laquelle ils ont été écrits : une
   échelle du PDF qui partage les codes D et M les retrouve (règle de l'éditeur, lot 1). Un repère se compare sans
   casse ni espaces ; le code imprimé est celui du niveau dans l'échelle.
4. **Le titre** : l'activité d'apprentissage (`activiteApprentissage`, sinon l'ancien `description` qui en tient lieu
   dans la fiche), sinon le nom de la production. **Sans production, pas de page** : c'est le PDF des consignes, et le
   titre n'aurait rien à nommer.
5. **À tout cran** (Consignes, + Évaluation, + Rétroaction), la page paraît quand la case est cochée.
6. **La case revient cochée à chaque ouverture** de l'aperçu ; elle n'est pas mémorisée dans les réglages du PDF.
7. **Mise en page** : tailles des consignes (8,5 pt) ; nom du critère en gras, couleur des titres de blocs ; case de
   2,8 mm, texte en retrait suspendu ; une page de suite ne répète pas l'en-tête (règle des consignes, #514).
8. **Le stock** (tarir n'est pas réparer) : rien à réparer, le lot ajoute un champ. Mais une grille DÉJÀ décrite aux
   deux repères (assistant « Apporter mon matériel », ou lot 1) fera paraître la page dans son PDF, cochée par défaut,
   dès que l'échelle choisie porte ses repères. C'est ce que demande le mandat ; dit pour qu'il ne surprenne pas.

## Bancs

- **Vitest** `tests/unit/autoevaluation-consignes.test.js` : 25 essais (Q éditeur, V voyage, P page, M modèle,
  H aperçu, D PDF dessiné). **12 break-tests**, code restauré à l'octet après chacun, chacun rouge sur son essai :
  repères codés en dur → P.c ; ordre changé → P.b ; ligne sans texte imprimée → 6 rouges ; échelle sans repères avec
  page → P.d, M.c ; critère sans texte admis → 5 ; case écrite « ☐ » → D.a, D.b ; vider emporte l'objet → Q.b, Q.e ;
  champ non déclaré au partage → V.a, V.b ; sans pagination → D.b ; aperçu non échappé → H.c ; case de l'aperçu
  ignorée → M.a ; case donnée au critère en points → Q.f.
- **Suite Vitest complète** : 933 fichiers, 11 936 essais, verts.
- **Playwright Chromium** `tests/integration/autoevaluation-consignes.spec.js`, iPad 1 180 × 820 et 820 × 1 180 :
  2/2 verts. Grille composée à la main (deux critères, D et M décrits, une question), rechargée ; production liée ;
  « Préparer le PDF » : trois feuilles, la deuxième est la grille ; « Exporter en PDF » relu par PDF.js : trois pages,
  la page 2 porte les mêmes textes ; la case décochée retire la feuille ET la page (deux pages) ; rouverte, cochée.
- **Specs liées** (Chromium, 15 fichiers : PDF, grilles, barème, dissection, partage) : 49/49 après ajustement.
  **Import et partage** (13 fichiers, pour `js/import-export.js`) : 34 verts, 9 rouges, **les mêmes 9 sur la base sans
  le lot** (worktree de `39fe4e67`, mesuré) : `codex-1012-ancien-zip-par-la-case` (6), `import-cartouche-renommee-654`
  (2), `lot-j0-bis-partage-apres-preparation` (1) ; erreurs propres à Chromium (`net::ERR_FAILED` en console, une API
  absente). Préexistants, hors lot, non inscrits (aucun symptôme vécu ; Chromium n'est pas la cible).
- **Bancs ajustés au comportement neuf** (↻ 19 nov., chaque ligne marquée) : la case « Pour vérifier » prend la boîte
  visuelle des niveaux, et sept bancs comptaient toutes les boîtes — `bareme-1-editeur`, `materiel-lot3b1-visible`,
  `sentinelle-composeur-branchement`, `bareme-1.spec`, `materiel-dissection-2b.spec` (comptent les niveaux seuls) ;
  `sentinelle-497` W2.f (la coupure de l'évaluation suit `feuillesDuDocument`) ; `bareme-1-editeur` I.b et
  `sentinelle-555-d` (`export-pdf.js` LIT désormais les descripteurs et le repère de maîtrise, pour imprimer).
- ⚠ Chromium n'est pas Safari : aucun verdict WebKit ici, ni la suite `npm test` complète que demande une
  modification de `js/import-export.js` (WebKit absent du conteneur). Complexité : deux fonctions passaient 30
  (`genererApercuCombine` 33, `genererPDFCombine` 31) ; ramenées sous le seuil par extraction.

## Trouvailles hors du lot

Aucune inscrite (aucun numéro pris). La démo d'« Évaluer » (`lot/je-regarde-evaluer`) n'est pas touchée.

## Captures

`plans de travail/captures-2026-11-19-autoevaluation-consignes/` (Chromium) : l'éditeur en création et rechargé,
1 180 × 820 et 820 × 1 180, sombre et clair ; la feuille de l'aperçu ; la page du PDF rendue par PDF.js.

## Adresse de l'aperçu

PR n° 33 (« APERÇU, ne pas fusionner : la grille d'autoévaluation dans le PDF des consignes »), base `main`.
Aperçu Netlify : <https://deploy-preview-33--codexnumeris-051225.netlify.app> — « Deploy Preview ready! » sur
`c61e87fb`, lu au statut GitHub de la PR (le réseau du conteneur n'atteint pas `*.netlify.app` : non ouvert d'ici).
Tant que le lot 1 n'est pas dans `main`, la PR le contient aussi.

## Suite du 20 nov. — les retouches de Cowork (relais du 20 nov. sur `80d561d`)

Grégoire a approuvé la page sur la capture (19 nov., 9 h 11) ; les choix et les mots d'enseignant du lot sont acceptés
tels quels. Quatre retouches, rien d'autre.

1. **La case garde le dernier choix** (décision de Grégoire, 9 h 14). Rangée dans `exportPDF_derniersReglages`
   (`autoevaluation`), relue à l'ouverture par les deux chemins de l'aperçu (`poserCaseAutoevaluation`) ; cochée sans
   réglage gardé (premier usage, réglages d'avant ce lot). `recocherAutoevaluation` retiré. **Un seul écrivain** : le
   geste de la case (`changerAutoevaluationPDF`), qui garde le choix aussitôt ; fermer l'aperçu sans exporter ne le
   perd pas. `sauvegarderReglagesPDF` ne relit PAS la case du DOM : après un rechargement, elle est cochée par le HTML,
   et le chemin du formulaire sauvegarde avant d'ouvrir l'aperçu ; la relire écraserait le choix (essai C.c).
2. **L'aperçu dit pourquoi la page manque.** Grille portant au moins un descripteur de niveau (critère par niveaux,
   un texte écrit à n'importe quel niveau) et échelle sans `seuilSuffisance` ou sans `seuilMaitrise` : à la place de la
   case, le texte de Cowork, tel quel (espaces insécables dans les guillemets et avant « : »). Sans aucun descripteur,
   rien. Supposition nommée : une échelle dont un repère désigne un niveau disparu n'a pas de page et ne reçoit pas le
   texte (le mandat dit « n'a pas » ; l'éditeur d'échelles refuse ce cas).
3. **Banc « Deux colonnes »** : ordre des feuilles (consignes, autoévaluation, évaluation), consignes en deux colonnes,
   grille pleine largeur, à l'aperçu (largeurs mesurées) et dans le fichier (positions lues par PDF.js : une colonne de
   droite en page 1, une ligne d'introduction qui passe le milieu en page 2). La grille est la même en continu et en
   deux colonnes (aperçu et PDF identiques, essais L.b et L.c).
4. **#1296 inscrit, aujourd'hui #1300** (sans correction ; d'abord #1289, renuméroté le 19 nov. au soir à la fusion de `main`, qui avait pris #1289 à #1295 entre-temps ; renuméroté #1300 à l'assemblage de la release, `lot/glisser-alignement` ayant pris #1296 lui aussi) : les neuf rouges d'import sous Chromium. Premier numéro libre mesuré sur toutes
   les branches distantes ; #1279, libre aussi, est laissé aux lots du Mac (en-tête du BACKLOG).

**Trouvaille, non inscrite** (aucun symptôme vécu, règle du 24 août) : les voisines de la case (« Enseignant »,
« Licence CC », le trimestre) ont le piège que la retouche 1 évite. Par le chemin du formulaire, `sauvegarderReglagesPDF`
les relit du DOM avant d'ouvrir l'aperçu ; après un rechargement, le HTML les a recochées, et un « Enseignant » décoché
reviendrait coché. Lu au code, non reproduit. À Cowork de dire s'il entre.

**Bancs, en nombres**
- Vitest `autoevaluation-consignes` : 37 essais (25 + 12 : C, R, L). Break-tests neufs, code restauré à l'octet après
  chacun : l'ouverture recoche toujours → C.b ; sauvegarder relit la case → C.c ; le geste ne garde rien → C.a ; le
  texte sans regarder les descripteurs → R.c ; le texte seulement si les deux repères manquent → R.a, R.c ; la grille
  après l'évaluation → L.a, M.b ; la grille en deux colonnes → L.b.
- Playwright Chromium `autoevaluation-consignes.spec.js` : 4/4 (le scénario complet et « Deux colonnes », 1 180 × 820
  et 820 × 1 180). Break-tests : l'ouverture recoche toujours → rouge (fermée puis rouverte, l. 303) ; le texte des
  repères jamais dit → rouge (l. 231) ; la grille après l'évaluation → rouge (l. 386) ; « Deux colonnes » ignorée →
  rouge (l. 382).
- Suite Vitest complète : 933 fichiers, 11 948 essais ; un rouge au premier passage, le cliquet `sentinelle-555-d`
  (`export-pdf.js` lit désormais `seuilMaitrise` deux fois : compte porté à 2, ↻ 20 nov.), vert relancé ; le hook de
  push a rejoué la suite entière.
- Specs liées (Chromium : PDF, fiche de production, éditeur du lot 1, barème, dissection) : 13/13.
- Anti-cache : `export-pdf.js` à `?v=20261117c` (jeton du build, `version.json` intact).
- Captures neuves : `apercu-reperes-manquants-*` (le texte à la place de la case), `deux-colonnes-apercu-*`.

