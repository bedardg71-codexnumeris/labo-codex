# Rapport – « + Ajouter des pages » garde une photo de téléphone droite (#1230, 5 novembre 2026)

> Claude Code, pour Cowork. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-05-ajouter-des-pages-photo-droite.md`. Parti de `main` = `2310fb4f` (1.233.0). Commits : `6bcdf5bb` (docs du § 0 : consigne, audit, fiche #1230), `e9426695` (correctif, bancs, fiche cochée). Rien n'est poussé.

## 1. La cause, mesurée

Une photo de téléphone stocke ses pixels couchés et dit, dans son EXIF (balise Orientation), comment les redresser. Le navigateur applique cette balise en décodant l'image : l'aperçu et les dimensions lues par `new Image()` sont donc droits. jsPDF, lui, colle les octets JPEG tels quels, et un PDF ne connaît pas l'EXIF. Résultat : des pixels couchés (300 × 200) étirés dans un cadre droit (200 × 300). C'est la piste de Cowork pour le cas sans réglage, et le banc la confirme.

**Le cas « avec Balance des blancs » n'est pas celui qu'on croyait.** Quand le réglage est réellement empilé sur une photo, `renduFinal` la redessine par un canevas et le PDF enregistré est **droit** (mesuré sous WebKit et sous Chrome, sans correctif). Le défaut vécu tient à la photo qui part **sans** opération. Au banc, avec deux photos ajoutées ensemble et le réglage sur la première seulement, sans correctif : la page 2 (avec réglage) sort droite, la page 3 (sans réglage) sort couchée et étirée.

⚠ Ce qui suit est une inférence, pas une mesure. Pour la reprise de Grégoire, je ne sais pas laquelle de ses photos portait le réglage. Ce peut être une seule des deux, ou un clic sur « Balance des blancs » sans clic ensuite sur l'image (aucune opération n'est alors empilée, et l'aperçu reste droit de toute façon). Ce peut aussi être le second ajout, après l'enregistrement perdu de 5 h 58 (constat 10). Le correctif couvre ces trois cas sans avoir à trancher.

## 2. Le correctif : une source commune

`imagePourPDF(blob)` (`js/travaux-import.js`) renvoie l'image telle que le navigateur l'affiche, avec **ses** dimensions. Quand l'orientation EXIF n'est pas 1, l'image est redessinée par un canevas, qui la redresse. Sinon, les octets partent intacts, sans recompression. La balise est lue par `lireOrientationExif`, fonction pure. Deux appelants collaient une image brute dans jsPDF, et les deux y passent maintenant :

| Appelant | Geste | Avant |
|---|---|---|
| `reassemblerPages` | Éditeur de pages : « Ajouter des pages », fusion, pivot | Le cadre prenait `page.largeur/hauteur` (vus droits), la photo y était collée couchée |
| `pagesImagesDuFichier` | Import groupé de photos en un PDF | Même défaut pour une photo de moins de 1400 px (plus grande, elle est recompressée par canevas, donc droite) |

C'est cette recompression qui fait sortir droites les photos de « Préparer et importer ». Les deux appelants lisaient le même décodage ; je n'en ai pas écrit un troisième.

## 3. La preuve

- `tests/integration/ajouter-pages-photo-droite.spec.js` fabrique un JPEG fictif de 300 × 200 pixels stockés, à EXIF « orientation 6 », avec un repère rouge et un repère bleu. Le banc vérifie d'abord que le navigateur le voit en 200 × 300. Ensuite, il prend le vrai bouton, la vraie palette et le vrai `reassemblerPages`. **Il relit le PDF écrit par « Enregistrer »** et le rend avec pdf.js : il juge le rapport de la page et la place des deux repères, jamais l'aperçu. Trois essais :
  - sans réglage ;
  - deux photos, « Balance des blancs » sur la première ;
  - l'import groupé.

  Seul le stockage est une mémoire du banc, parce que WebKit refuse les blobs en IndexedDB sous `file://`.
- Résultats : 3/3 verts sous WebKit (le projet de la suite) et 3/3 sous Chrome (lancé à part avec une config temporaire, retirée ensuite).
- Contre-épreuve sans le correctif (`git stash` du seul fichier JS) : les 3 sont rouges, chacun sur la page attendue.
- `tests/unit/lire-orientation-exif.test.js` : 6 tests (gros et petit-boutiste, derrière un segment JFIF, valeurs hors bornes, PNG, en-tête tronqué, rien lu après SOS). Le break-test (« rend toujours 1 ») fait rougir 3 tests.
- Suites : Vitest entier, lancé depuis `tests/`, donne 10 697/10 697. Le cliquet de complexité a refusé une première version de ma fonction (440 au lieu de 439), que j'ai découpée. Specs voisines (`1007-propose-codex-2a2`, `1028-archiver-copies`, le banc neuf) : 10/10.
- Le verdict Playwright complet du Mac **n'est pas lancé** : il demande Cowork, Chrome et Safari fermés.

## 4. Le stock

Tarir n'est pas réparer. Les pages déjà enregistrées couchées, dont les deux de la reprise, restent telles : le correctif agit à l'enregistrement, il ne relit pas le stock. **Rien n'a été écrit dans les données de Grégoire.** Il refera les deux pages à la main une fois la version en ligne : supprimer les pages couchées dans « Modifier », les ajouter de nouveau, enregistrer. C'est aussi la seule porte terrain du lot, sur une vraie photo de téléphone, une machine ayant répondu pour la photo fictive.

## 5. Trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| GitHub rouge sur `HEAD` (run 41941988028) : 14 essais neufs contre la baseline Linux, dont `temoin-enregistrement-lot-b`, les deux palettes compactes et `materiel-dissection-11/12` ; aucun ne touche ce lot. Rouge depuis plusieurs pushs (audit de début de session). | Décision de Grégoire (5 nov.) : pas d'item au BACKLOG pour l'instant. Le verdict du Mac tranche : un rouge qu'il voit aussi est inscrit et dit ici ; s'il n'en voit aucun, c'est la référence de GitHub qui a dérivé, et c'est noté au journal. |
| Constat 10 (l'enregistrement de 5 h 58 non pris) | **Pas la même cause** : la reproduction enregistre à chaque fois. Hors lot, reste à mesurer. |
| `pivoterPageEditeur` produit un PNG que `reassemblerPages` déclare « JPEG » à jsPDF | **Oublier**, noté ici seulement : aucun effet observé (jsPDF reconnaît le format aux octets), comportement inchangé. |
| Sous Chrome, Playwright ne voit pas le sélecteur de fichiers, et la section Importer se redessine un moment après son affichage | Outillage du banc : contourné et commenté dans le spec. |

## 6. La mise en ligne

1. **Nouvelles** : l'item est ajouté à l'entrée 1.233, validé par Grégoire mot pour mot le 5 nov. au matin. Il a fait deux retouches à la proposition : « avec ou sans réglage » sort (une nuance que l'utilisateur ne voit pas) et « retire-la » entre (sans ce geste, la page couchée reste à côté de la bonne).
   > Modifier › « + Ajouter des pages » : une photo prise au téléphone s'enregistre droite et à ses proportions. Une page déjà enregistrée couchée le reste : retire-la, puis ajoute-la de nouveau.
2. **Release** : 1.233.1 (build 1105-0648), commit `8e9b316f`. Vitest : 10 697/10 697.
3. **Complexité** par rapport à la 1.233.0 :
   - +44 lignes de code (`travaux-import.js`) ;
   - fonctions au-dessus de 15 : 439 → 439 ;
   - au-dessus de 30 : 81 → 81 ;
   - somme des complexités au-dessus de 15 : 11 028 → 11 028.
4. **Verdict du Mac** : en attente du signal de Grégoire (Cowork, Chrome et Safari fermés). À sa demande, je regarderai si le Mac voit l'un des 14 rouges de GitHub, surtout les deux palettes compactes.
5. **Push** : à la demande de Grégoire.
