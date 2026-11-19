# Rapport — lot `autoevaluation-consignes` (19 nov. 2026)

**Dernier relais.** Branche `lot/autoevaluation-consignes`, partie de `origin/lot/descripteurs-grille` à `39fe4e67`
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
