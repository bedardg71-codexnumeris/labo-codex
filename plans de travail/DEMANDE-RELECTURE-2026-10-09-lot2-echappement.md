# Demande de relecture – file sans Grégoire, lot 2 : ce qui entre de l'extérieur est échappé (#467, #585)

> Claude Code, 9 octobre 2026, soir (Toronto). Sur `main`, en local, commits séparés, **ni poussés ni publiés** (consigne de Cowork de 19 h 10). Étape 0 faite à part : relais de 1.194.0 commité et poussé (`0902890f`, documents seuls).

Commits, dans l'ordre : `30033ad6` (#585), `2be60b00` (#467, imports JSON), `880e391c` (#467, affichage), puis celui-ci (BACKLOG et la présente demande). Chacun porte ses jetons anti-cache dans `index.html`, posés à la demande du hook.

## 1 · Ce qui change pour l'usager

Rien de visible pour un nom ordinaire. Un nom ou un texte reçu d'un collègue (fichier JSON, partage `.lcz`, archive) qui contiendrait du balisage s'affiche désormais **comme du texte**, partout où le relevé l'a trouvé : barres latérales (pratiques, échelles, objectifs), cartes des six Bibliothèques, fenêtres « Importer depuis un autre trimestre », éditeurs des pratiques, palette et éditeurs des tampons, récapitulatif de l'assistant de pratique, légende du profil. Il n'entre plus non plus brut dans le stockage par les imports JSON.

**Aucun mot d'écran ajouté ni changé.** Aucune fenêtre ajoutée (voir § 4).

## 2 · #585 – assainir puis tronquer (`30033ad6`)

Le geste arbitré par Grégoire le 28 août (option B). La « passe de vérification sur tous les types » demandée par la fiche : Vitest complet (tous les schémas d'import passent par cette fonction) ; une chaîne sans balise est tronquée au même endroit qu'avant (essais C du banc). Le cas symétrique de la fiche (une entité `&amp;` coupée en `&am`) n'est pas changé par l'inversion : la troncature d'une chaîne sans balise est identique.

Ce qui reste hors de portée de la fonction, écrit dans son commentaire : un `<` sans `>` qui le ferme (« note < 60 ») traverse, comme avant. C'est l'échappement à l'affichage qui le couvre.

## 3 · #467, les imports JSON (`2be60b00`)

**La mesure d'abord, demandée par la fiche** (ce que `assainirObjet` fait d'un nom reçu en `.lcz`) : rien, le `.lcz` n'y passe pas. Il a son propre filtre (`partage-validation.js`, niveau 5) : un motif dangereux (`onerror=`, `<script`…) fait refuser le fichier entier, toute autre balise est échappée au stockage. Mesure figée au volet E du banc (deux mutations, deux rouges).

**Les imports JSON, eux, étaient bruts** : cinq imports de Bibliothèque (grilles, échelles, cartouches, productions, pratiques ; la consigne en nommait trois) et celui des tampons. Productions et tampons n'étaient pas couverts : `productions-bibliotheque.js:79` et `tampons-bibliotheque.js:36` assainissent l'ajout depuis l'éditeur, pas l'import du fichier.

**Supposition nommée, à relire** – je n'ai pas branché `assainirObjet` seul. Mesuré sur le codex de banc 1.172.0 : la liste blanche aurait fait perdre des champs qui voyagent aujourd'hui par le fichier JSON (grille : `pratiques`, `pratiquesCompatibles`, `criteres[].estStandard`, `metadata_cc.date_creation` ; production : `regles`, `code` ; cartouche : `description`), et ramené à 0 un `niveaux[].valeurCalcul` stocké en chaîne (« 40 »). J'ai donc écrit `assainirImportJson` : balises retirées de toute chaîne, longueurs du schéma sur les chaînes qu'il nomme, **rien de jeté, aucun type coercé**. Les tampons, sans schéma, passent par `retirerBalisesProfond`. Le banc vérifie que chaque objet réel du codex de banc ressort identique.

**Retirés, sans déclencheur** (l'inventaire du lot F, 29 sept., les notait déjà « code mort ») : `importerDansEchelleActive`, `importerDansGrilleActive`, `importerDansCartoucheActive`, `importerCartoucheJSON`, `importerDansProductionActive`, `importerObjectifs` et `traiterImportObjectifs` (son champ `#importObjectifsInput` n'existe pas). Il ne reste donc aucun import d'objectifs à assainir.

## 4 · La « confirmation avant remplacement par id »

**Aucune fenêtre ajoutée.** Les cinq imports de Bibliothèque demandent déjà « Veux-tu importer ces … ? » avant toute écriture, et les deux chemins qui remplaçaient l'élément actif sont retirés (morts). Le refus de #967 (1.190.0) ne couvre pas ce cas : il porte sur un homonyme à l'enregistrement. Ce qui reste vrai, et que je n'ai pas changé : un élément de la Bibliothèque dont l'id est celui d'un élément reçu est remplacé par la version reçue, et le message final le compte (« N mise(s) à jour »). Si tu veux une question avant ce remplacement, c'est une fenêtre et des mots : à décider, pas fait.

## 5 · #467, l'affichage (`880e391c`)

Relevé complet fait le 9 oct. (la fiche d'août n'en nommait que quelques-uns) : 5 points de chute dans `bibliotheque-ui.js`, 29 appels de cartes, 72 interpolations directes, dont 9 dans des fonctions mortes. Les numéros de ligne de la consigne étaient en partie décalés (`echelles.js:921`/`:1039`, `grilles.js:1920`, `objectifs.js:775` étaient les imports JSON du § 3, pas des affichages ; `travaux-outils.js:3396` est la fenêtre d'import des tampons, sûre, mais sa confirmation était brute, traitée au § 3).

- **Points de chute** : l'auteur et la discipline de la ligne de métadonnées, et l'identifiant de contexte du menu d'actions, sont échappés une fois, dans `bibliotheque-ui.js`. Le titre d'une carte s'échappe chez l'appelant, parce que `nom` porte aussi des badges HTML voulus.
- **Piège évité, à connaître** : le select des dossiers relisait le `nom` des cartes comme texte et l'échappait. Une fois le nom échappé à la source, « Grille d'analyse » y serait devenue « Grille d&#39;analyse ». Les cartes portent maintenant un `libelle` en texte brut, que ce select lit. Un essai du banc l'interdit de revenir.
- **Retirés, morts** : l'îlot de la fenêtre des catégories d'erreurs (trois fonctions, `grilles.js`) et `afficherDetailsCoursV2` (son essai dans la sentinelle des étiquettes de nature est retiré avec elle). Le repli sur `item.auteur` de `formaterMetadonnees`, inatteignable (trouvé par une mutation restée verte). `chargerArtefactsDisponibles`, morte mais inscrite à `noms_stables.json` (zone protégée), est échappée, pas retirée.

**Stock** : ce qui a déjà été importé brut chez quelqu'un n'est pas réécrit. L'échappement à l'affichage le couvre, sur tous les sites du relevé. Les données de Grégoire ne sont pas touchées.

**Limite assumée** : un nom reçu par `.lcz` qui contenait une balise bénigne (`<b>`) a été stocké échappé par le filtre du `.lcz`. Il s'affichera désormais avec ses entités visibles (« &lt;b&gt;Grille ») au lieu de la balise en texte. Cas improbable, non réparé.

## 6 · Ce qui est vérifié, et comment

| Banc | Essais | Mutations |
|---|---|---|
| `sentinelle-585-assainir-avant-de-tronquer` | 8 | ancien ordre : 5 rouges sur les 5 visés |
| `sentinelle-467-imports-json-assainis` | 18 (helper ; objets réels identiques ; cinq imports et les tampons au chemin réel ; `.lcz`) | 13, toutes rouges (une 14e, verte au premier passage, a renforcé le banc) |
| `sentinelle-467-affichage-echappe` | 24 (points de chute ; trois barres rendues avec un nom hostile ; cliquet statique sur 15 fichiers, exceptions nommées ; titres de cartes ; compte des interpolations nues) | 17, toutes rouges (deux vertes au premier passage ont corrigé le banc) |

Compteurs ajustés, motif écrit à côté : #522 (échelles 19 → 18, grilles 28 → 25, cartouches 16 → 14 : écritures des fonctions retirées) ; lint `audit-innerhtml.sh` 106 → 102, seuil ramené à la mesure. Vitest complet : 704 fichiers, 8 454 essais, vert. Suite Playwright complète : **NON JUGÉE** (lancée sur `880e391c` à 19 h 50, arrêtée par la garde mémoire du script à 20 h 27 : échange 12,6 Go, seuil 12 Go ; aucun échec relevé avant l'arrêt, le seul résultat écrit, `import-grilles-conduit-a-la-carte`, est un « Channel closed » de l'arrêt). La machine avait 12,8 Go d'échange sur 13,3 : à relancer après avoir fermé Chrome, Safari et Cowork, avant toute release. ⚠ La consigne demandait `npm test` avant le commit : les commits sont faits, la suite n'a pas pu juger. **Relance après la correction de relecture : VERTE** — suite complète sur `7c6954bf`, Chrome, Safari et Cowork fermés, lancée à 20 h 45, rendue à 21 h 51 : code 0, aucune rougeur nouvelle, 0 échec connu, 0 instable ; garde : éveil tenu, 0 veille, échange au plus haut 3,8 Go (`scripts/.verdict-playwright.json`).

**Pas vérifié** : un vrai fichier reçu d'un collègue ; l'affichage à l'œil sous Safari et sur l'iPad (aucun mot ni gabarit visuel ne change ; aucune porte terrain proposée : une machine répond).

## 6 bis · Après ta relecture (9 oct., soir) : le défaut bloquant, et la même recherche partout

**Corrigé** : `js/travaux-outils.js`, palette d'annotation, sections « Outils » et « Formes » : `outil.icone` y repart tel quel (balise `<img>` écrite par l'application dans `OUTILS`). Vérifié que rien ne la réécrit : `appliquerPersonnalisations` ne touche l'icône que des trois symboles intégrés, l'import des tampons aussi. L'échappement reste sur les symboles (intégrés et personnels) et dans le champ `value` de leur éditeur. Le nom de l'outil reste échappé dans le `title` (texte).

**Banc** : volet D de `sentinelle-467-affichage-echappe` — rend la vraie palette (`genererHTMLPalette`), exige au moins onze boutons d'outil, aucun « &lt;img », et une vraie balise `<img src="`. Break-test : l'échappement remis sur les outils, rouge ; sur les formes, rouge. Les deux icônes constantes sont inscrites aux exceptions nommées du cliquet, avec leur raison.

**Même motif, vérifié dans tout le lot** (chaque `echapperHtml(…)` ajouté, source remontée) :

| Valeur échappée | Source | Verdict |
|---|---|---|
| `outil.icone`, outils et formes | `OUTILS`, balise `<img>` | **était fautif, corrigé** |
| `outil.icone`, symboles intégrés | caractères Unicode, personnalisables par import | juste |
| `outil.icone`, symboles personnels et champ `value` de l'éditeur | saisie de l'usager | juste |
| `outil.nom`, `outil.couleurBouton` | constantes en texte, ou personnalisation | juste (texte, attribut) |
| `c`, badges de caractéristiques de pratique | textes construits (« 3 meilleures », « notes finalisées », code d'échelle) | juste, aucun balisage |
| `nomGrille` (productions) | nom de grille, ou « Aucune grille » | juste |
| `disc`, auteur (métadonnées de carte) | `item.discipline`, `metadata_cc` ; aucun appelant ne passe de chaîne HTML | juste |
| titres de cartes | nom reçu ; les badges voulus (`gabaritBadge`, `badgesPratiques`, `badgeSource`, `quantite`) restent hors de l'échappement | juste |
| `menuId`, `catId`, ids, `key` | ids en texte | juste (attribut) |
| `prod.type`, `prod.ponderation`, `t.nom` (trimestre), `horaire.nom` | texte ou nombre | juste |
| imports : `retirerBalisesProfond` / `assainirImportJson` | champs longs (`detailTache`, `contenu`, rétroactions) : champs texte (textarea), pas de texte riche ; `imageBase64` sans chevron | juste |

Vitest complet après la correction : 704 fichiers, 8 455 essais, vert.

## 7 · Trouvaille hors lot – pour le lot 3

Les listes blanches de `SCHEMAS_IMPORT` perdent aujourd'hui, à l'import sélectif et à l'ajout en Bibliothèque, les champs nommés au § 3 ; et le type `number` du schéma d'échelle ramène à 0 un `valeurCalcul` stocké en chaîne (vu dans le codex de banc : « 40 »). Ce sont deux chemins de « ce qui voyage », le lot 3. Disposition de Cowork (relecture du 9 oct.) : non inscrite ; elle entre dans la consigne du lot 3.

## 8 · Proposition pour la release

- **Version** : minor (1.195.0) ; aucun mot d'écran, mais des imports retirés et un comportement de sécurité neuf.
- **Titre** : « Ce qui vient d'un collègue s'affiche, sans agir »
- **Ligne des Nouvelles** : « Un nom de grille, d'échelle, de cartouche, de pratique ou de tampon reçu d'un collègue s'affiche désormais comme du texte, même s'il a été importé avant cette version. »
