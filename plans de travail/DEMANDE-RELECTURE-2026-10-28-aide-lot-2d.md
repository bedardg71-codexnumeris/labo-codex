# Demande de relecture – L'Aide, lot 2d : le Labo, le codex et la Référence (#1152)

> Claude Code, mercredi 28 octobre 2026, après-midi, sur `main` = `4c071bca` (code) ; consigne `CONSIGNE-LOT-2026-10-28-aide-lot-2d-labo-codex-reference.md` (Cowork, 12 h 50). Rien de poussé, pas de release, pas de verdict.

## En bref

- **16 entrées deviennent 14** dans les trois parties (13 du lot, plus `glossaire-statique`, intacte) : `modelisation` absorbée par `labo`, `criteres` par `grille-depistage`.
- **5 067 mots → 2 518** (mon compte, texte visible, sans `glossaire-statique` ; Cowork en comptait 5 575, cible ~1 930). L'écart à la cible tient surtout à `ressources` (282 mots : j'ai gardé la bibliographie entière, voir « Pour Grégoire ») et à `faq` (347).
- **Aucun fichier `js/` touché.** `index.html` (l'Aide seule), trois sentinelles adaptées par décision, une sentinelle neuve, un essai Playwright neuf.
- **Un titre neuf** pour Grégoire : `glossaire`.
- **Cinq trouvailles d'écran inscrites au lot 5** (tableau « Trouvé hors de la section Aide » de l'audit).

## L'ordre retenu, et son motif

**Labo** : `labo`, `rai-solo`, `grille-depistage`, `pan`, `bilan-reflexif`.

La vue d'ensemble en tête (elle présente les sept sous-onglets et renvoie aux autres entrées), puis chaque entrée à côté de l'écran qui porte son réglage, dans l'ordre des sous-onglets de `js/config.js:85-93` : Outils d'observation (`rai-solo`, puis `grille-depistage`), Exploration des pratiques (`pan`), Bilan réflexif. Dans Outils d'observation, les options avant la grille, parce que la grille dit ce que l'option SOLO change au dépistage ; l'inverse se défendrait (à l'écran, la grille est entre les deux options).

**Codex et archives** et **Référence** : ordre inchangé.

## Entrée par entrée

| Entrée | Mots avant → après | Ce qui change |
|---|---|---|
| `labo` (+ `modelisation`) | 329 + 139 → 263 | Les sept sous-onglets, une phrase chacun ; la Modélisation en une phrase (« + Ouvrir » : PDF, JPG, PNG ou HEIC ; la palette sans les codes) ; Exploration des pratiques, Rythme de travail, Suivi longitudinal et « Charger un codex data… », absents jusqu'ici ; les Études réduites à ce que leurs notes « i » ne disent pas (pas de r sous 5 étudiant·es ; la carte des jetons masquée sans jeton) et « des pistes de réflexion, pas des preuves ». Parti : la lecture causale (« signal encourageant »), la redite des notes d'écran. Titre gardé. |
| `rai-solo` | 309 → 173 | Les deux libellés exacts, avec « active-la si / désactive-la si » ; la carte SOLO telle que #542 l'a faite (un bloc par niveau de l'échelle, sous son nom, sans forces ni défis), sans nommer de niveaux ; la catégorie « Compréhension » de la palette. Parti : « 4 niveaux IDME », l'encadré « Distinction », la note historique. Les deux intertitres « Option 1… » / « Option 2… » gardés (ils bornent la tranche de la sentinelle du 15 oct.). |
| `grille-depistage` (+ `criteres`) | 292 + 228 → 223 | Les sept corrections : le choix s'écrit au changement ; « + Nouvelle grille » puis « Créer la grille » ; le rapprochement par le nom (égal ou préfixe, sans accents, casse ni espaces) au lieu de « la même grille pour toutes tes évaluations » ; les points d'abord, le niveau sinon ; le « Seuil de défi spécifique » (70 % par défaut, de 60 à 80 %) ; la pondération ne départage que deux scores égaux ; le total de 100 % part avec l'étape 1, qui redisait `creer-grilles` (où la nuance des grilles en points est déjà dite). De `criteres` : la constance des critères, l'étiquette « Complexité SOLO du critère » et « Aucun » (selon la case SOLO, #1117 suite). |
| `pan` | 383 → 149 | Les familles partent (déjà dans `pratique`) ; une phrase de définition ; les six paramètres sous les libellés de l'écran (`construction-attributs.js:50-57`), rattachés à Labo → Exploration des pratiques ; la théorie renvoyée au guide « Modalités ». |
| `bilan-reflexif` | 322 → 139 | « Copier les questions », sans nommer de service ; l'anonymat dépend du formulaire ; les noms d'onglets de l'écran (« Questionnaire », « Parcours », « Auto-réflexion »). **#1054 mesurée ouverte** : l'import reste retiré (lot 1) ; **le rapport d'analyse part aussi** (décision, voir « Ce que j'ai supposé »). La correction « Cliquer pour sélectionner un fichier CSV » est sans objet : elle portait sur l'import retiré. |
| `codex` | 399 → 286 | La fenêtre d'aperçu de « Mettre à jour le codex » (titre, « Mettre à jour », son « i » vers « Ce que contient le fichier ») ; « Écrire le codex à part » avant une suppression ; « Archiver… » archive un groupe-cours, le trimestre clos s'archive par sa bibliothèque ; le menu tel qu'il est (les quatre items réservés à un codex ouvert, « Charger un codex data… »). Parti : « sans fenêtre », « Qu'est-ce qu'un Codex ? », le manifeste, le flux typique (dans la FAQ). |
| `export-import` | 309 → 186 | Entre trimestres : la bibliothèque et le repli « Importer depuis un autre trimestre ». Parti : les deux options (redite de l'écran), l'avertissement (redite de l'encadré), les captures (elles ont leur entrée). **Encadré Loi 25 inchangé, mot pour mot.** |
| `partage` | 194 → 106 | Ce qui rassure (cinq ressources, .lcz signé, licence, rien de confidentiel), le renvoi à `collaboration`, le repli par trimestre là où il est. Parti : le nom de fichier figé, l'échéance d'une production (retirée du paquet), les « communs éducatifs ». |
| `collaboration` | 842 → 225 | Cinq ressources ; « Exporter pour partager » dans le ⋮ d'une rangée de « Dans ce trimestre » ; l'import par « Importer ou exporter ▾ › Importer le partage d'une ou d'un collègue » dans les cinq fenêtres **et** par Réglages › Données ; « Partagés par des collègues », non modifiable, et « Dupliquer vers mes documents » ; l'identité de Cadre › Trimestre, Enseignant·e ; un seul maillon d'attribution ; aucun nom demandé ; l'import .txt sans casse, accents ni ponctuation, puis par inclusion ; une grille « à compléter » ne part pas. Gardé : « Ressources partageables (.lcz signé) ». |
| `glossaire` | 21 → 15 | Titre sans nombre ; phrase sans la liste des étapes. |
| `faq` | 813 → 347 | Partent : A-C-P, RàI, hors ligne, « Invalid Date » (aux problèmes), ordre de configuration. Corrigées : l'abandon (colonne « Remarque », « Inactivité » / « Décrochage », grisé·e, hors des statistiques, « Aucune » efface la remarque) ; la pondération (le total signalé sans bloquer, la sommative calcule sur les productions évaluées). Resserrée : l'enregistrement. Gardées telles quelles : plusieurs appareils (D8) et les seuils. |
| `problemes` | 126 → 124 | Le calendrier : plus de « Régénérer » ; les trois dates obligatoires de Cadre → Trimestre, et en changer une le reconstruit ; « Invalid Date » rejoint le calendrier vide, sans la cause « bug connu ». A : ne compte que les séances saisies, « Confirmer la séance ». « Données perdues » inchangé. Peu de mots gagnés : la solution réelle est plus longue que le bouton fictif. |
| `ressources` | 361 → 282 | La bibliographie seule, entière (14 références) ; les liens avec `rel="noopener noreferrer"`. Parti : le site et ses deux puces, le bloc des licences et « LICENSE.md » (la ligne « … sont dans Réglages › À propos » suit déjà la carte). |

## Preuves (fichier:ligne, au code de `4c071bca`)

- **Labo** : sous-onglets `js/config.js:85-93` ; « + Ouvrir » et ses formats `js/modelisation.js:81, 253` ; palette sans codes `:367` ; Exploration (source et colonnes) `js/comparateur-pratiques.js:1076-1090`, aide `comparateur-pratiques` `js/accompagnement-contenu-popup.js:1797-1806` ; Rythme `index.html` `#labo-rythme` ; r sous 5 `js/correlations-longitudinales.js:28, 156` ; carte des jetons masquée `js/impact-jetons.js:342-345` ; « pistes de réflexion » `js/accompagnement-contenu-popup.js:967` ; registre `js/registre-longitudinal.js:93-123` ; codex data `js/labo-codex-data.js:7-19`.
- **rai-solo** : libellés `index.html` `#v2-pref-rai`, `#v2-pref-solo` ; un bloc par niveau `js/profil-etudiant-sections-affichage.js:1333-1351` ; « Compréhension » dans l'aide de la case SOLO.
- **grille-depistage** : écriture au changement `index.html` `#v2-pref-grille-reference` (`data-on-change="sauvegarderPreferencesV2"`) ; rapprochement `js/profil-etudiant-calculs.js:842-874` ; points d'abord `:886-889` ; départage `:1331-1344` ; seuil `js/interpretation-config.js:50`, champ `#v2-seuil-defi` (60-80) ; « Aucun » `js/profil-etudiant-helpers.js:927-931` ; menu `js/grilles.js:3346-3351`.
- **pan** : `js/pratiques/construction-attributs.js:50-57` ; `js/comparateur-pratiques.js:367-393` ; guide « Modalités » `index.html` (Conception › Pratiques de notation, `data-param="pan"`).
- **bilan-reflexif** : onglets `js/bilan-reflexif.js:108-112` ; « Copier les questions » `js/bilan-reflexif-editeur.js:60`, anonymat `:73` ; #1054 : `js/bilan-reflexif-csv.js:30` (seul `etat` importé), `:98` et `:569` (`CLE_RESULTATS()` et `genId()` sans déclaration).
- **codex** : `js/codex.js:440, 634-648, 3195-3211, 3687-3715` ; aide `modal-export-preview` `js/accompagnement-contenu-popup.js:1769-1770` ; appelants de l'écriture à part `js/trimestre-v2-liste.js:313`, `js/trimestre-v2-groupes-cours.js:971`, `js/trimestre-v2-etudiants.js:1530`, `js/import-export.js:2093` ; trimestre clos `js/trimestre-v2-liste.js:213-224`, `js/reserve-trimestre.js:53`.
- **export-import, partage, collaboration** : « Exporter pour partager » `js/grilles.js:2343`, `js/echelles.js:1077`, `js/cartouches.js:3882`, `js/productions-bibliotheque-ui.js:154`, `js/pratiques-gestion.js:330` ; « Importer le partage… » `js/grilles.js:2419`, `js/echelles.js:1152`, `js/cartouches.js:3940`, `js/productions-bibliotheque-ui.js:278`, `js/pratiques-gestion.js:430` ; carte « Partage entre collègues » `index.html` `#partage-zone-depot` ; « Partagés par des collègues » `js/partage-section.js:648-670` ; attribution `js/partage-format.js:296-320`, `js/partage-export.js:275-279` ; .txt `js/cartouches.js:2135-2160`, bouton `index.html` « Importer depuis un fichier texte (.txt / .md) » ; « à compléter » `js/partage-export.js:362-372`.
- **faq** : `js/trimestre-v2-etudiants.js:403, 434-440` ; `js/etudiants.js:632-640` ; `js/productions.js:2826-2852` ; `js/pratiques/pratique-sommative.js:98-108`.
- **problemes** : `js/trimestre-v2-init.js:469-487` ; champs `#v2-debutTrimestre`, `#v2-finCours`, `#v2-finTrimestre` ; `js/saisie-presences.js:1161`.

## Les ids

`accordeon-aide-modelisation` et `accordeon-aide-criteres` disparaissent (fusions). Aucun lien de l'application ni aucun test hors de l'Aide ne les lisait, hormis `sentinelle-audit-aide-lot-D` (adaptée). Les autres ids ne changent pas.

## Tests

### Neufs
- `tests/unit/sentinelle-aide-2026-10-28-lot-2d.test.js` (18 essais) : l'ordre des trois parties, lu dans la page ; `modelisation` et `criteres` absentes ; `glossaire-statique` à l'empreinte de `0e8da317` ; les mots interdits de la consigne et ceux que le dossier a dits faux ; chaque libellé entre « » de `codex`, `export-import`, `partage`, `collaboration` trouvé hors de l'Aide (plus de 35 cités) ; chaque « voir « … » » nomme un titre ; puis, entrée par entrée, ce qu'elle affirme, lu dans le code. **Break-test** : cinq mutations (« Enregistrer les réglages » réintroduit ; `pan` déplacée ; un libellé altéré ; un caractère du glossaire statique ; le seuil de défi du code à 0,75), chacune rouge ; arbre restauré, vérifié par sha256. Le break-test a trouvé un défaut de mon banc : l'essai d'ordre lisait ma constante, pas la page ; corrigé, la mutation rougit deux essais.
- `tests/integration/aide-lot-2d-1152.spec.js` : la recherche trouve « Modélisation » dans `labo` (Labo), « Importer le partage » dans `collaboration` et « Archiver le trimestre » dans `codex` (Codex et archives) ; les deux entrées absorbées ne sortent plus. `CAPTURES_AIDE_2D=<dossier>` enregistre les captures.

### Modifiés, par décision (chacun cite l'audit, la remesure et cette consigne)
- `sentinelle-aide-2026-10-24-forme` : `ABSORBEES_2D`, l'ordre du Labo.
- `sentinelle-audit-aide-lot-A-chemins-et-libelles` : le compte de « Régénérer » passe de `{ faq: 1, problemes: 1 }` à `{}` ; le titre de l'essai dit maintenant ce qui est.
- `sentinelle-audit-aide-lot-D-ne-promet-pas-l-inexistant` : la garde « Modélisation pas en développement » lit `labo`, vérifie qu'elle nomme la Modélisation, et que l'ancien id n'existe plus.

### Gardés sans changement (mesurés)
- La phrase RàI de la sentinelle du 15 oct. : 4 occurrences avant (`rai`, `glossaire-statique` ×2, `faq`), 3 après (la FAQ RàI coupée) ; le seuil (≥ 3) tient. **Au lot 3**, la fusion du glossaire statique la fera tomber à 1 ou 2 : à prévoir dans sa consigne.
- `sentinelle-862` (Loi 25), la question des seuils, « Transférer le fichier codex », « Ressources partageables (.lcz signé) », « Appliquer une adaptation… », « Bédard » bibliographique (lot E) : tous verts.

### Deux pièges évités
- Mon commentaire HTML de `rai-solo` citait les deux intertitres « Option 1… » / « Option 2… » : la sentinelle du 15 oct. prenait sa tranche dans le commentaire. Reformulé.
- Mes commentaires citaient des chemins `js/…` : quatre sentinelles d'ordre de chargement (`499`, `581`, `795`, texte troué) lisent le premier `js/x.js` d'`index.html` comme la balise `<script>`. Préfixe retiré des commentaires du lot (33 occurrences, toutes de ce lot).

### Résultats
- Vitest, depuis `tests/` : **841 fichiers, 10 082 essais, tous verts**.
- Playwright, ciblé (`aide-lot-2d`, `aide-forme`, `aide-lot-2c-bis`, `aide-exporter-archiver-893`) : **4 sur 4 verts**. Suite complète non lancée (le verdict du soir s'en charge).

## Pour Grégoire

### Le titre neuf
- `glossaire` : « Glossaire du parcours » (au lieu de « Glossaire — 48 termes du parcours » ; le catalogue en compte 59, et le nombre bougera au lot 3). Repli : « Glossaire ».

### La bibliographie
La cible du verdict final (~120 mots) ne tient pas sans retirer des références : la bibliographie seule en fait 282. J'ai tout gardé. **Faut-il en retirer, et lesquelles ?** C'est ta décision (ce que l'application cite).

### Les phrases qui disent l'application
- `labo` : « Le premier ne calcule aucune corrélation sous 5 étudiant·es ; le second ne paraît que si un·e étudiant·e a utilisé un jeton. Ce sont des pistes de réflexion, pas des preuves. » ; « « Inscrire au registre » fige une copie datée du dossier d'un·e étudiant·e, cherché·e dans tous les trimestres, et accueille ensuite ses « Résultats ultérieurs ». Le registre voyage dans ton codex, pas dans l'archive d'un groupe-cours. » ; « « Charger un codex data… », au menu Codex, ouvre un codex data dans le Labo, en lecture seule ; le trimestre actif n'est pas touché. »
- `rai-solo` : « Active-la si tes évaluations reprennent les critères de la grille du dépistage ; désactive-la si elles n'ont pas de critères communs, ou si un système d'intervention ne s'applique pas à ton contexte. » ; « un bloc par niveau de l'échelle, sous le nom que tu lui donnes, avec les critères qui y tombent ».
- `grille-depistage` : le paragraphe « Ce que le dépistage lit » entier, et « D'une évaluation à l'autre, la comparaison n'a de sens que si les critères gardent leur nom au fil du trimestre. »
- `pan` : la phrase de définition, et « Deux pratiques de la même famille peuvent y répondre différemment : c'est là que se lit une pratique, plus que dans son étiquette. »
- `bilan-reflexif` : « L'anonymat des réponses dépend de ce formulaire : règle-le pour qu'il ne collecte ni le nom ni le courriel. »
- `codex` : « Supprimer un trimestre, un groupe-cours ou des étudiant·es, ou tout réinitialiser, commence par « Écrire le codex à part » : un autre fichier, sous un autre nom, que tes prochaines mises à jour ne touchent pas. Si tu annules, rien n'est supprimé. »
- `collaboration` : « Le fichier crédite une seule personne, l'autrice ou l'auteur d'origine » ; « Aucun nom ne t'est demandé : la fenêtre dit à qui la ressource est attribuée ».
- `faq` : la réponse sur l'abandon, et « En sommative, la note se calcule sur les productions évaluées, chacune au poids de sa pondération. »
- `problemes` : la solution du calendrier.

## Ce que j'ai supposé

- **Le rapport d'analyse du bilan part avec l'import.** Mesuré : il reste désactivé tant qu'aucun résultat n'existe, et les deux chemins qui en écrivent (l'import CSV et « Charger les données de démonstration ») passent par `CLE_RESULTATS`, non déclarée dans `bilan-reflexif-csv.js` (#1054). Décrire un onglet qu'on ne peut pas ouvrir serait promettre l'inexistant. La sentinelle du lot rougira le jour où #1054 sera corrigée, pour rendre l'import et le rapport à l'Aide.
- **« Invalid Date » rejoint le calendrier vide**, avec « recharge la page » d'abord. Je n'ai pas reproduit l'erreur ; aucune fiche ne la documente. Si sa cause n'est pas le calendrier, la solution des trois dates est à revoir.
- **« Dupliquer vers mes documents »** : la consigne disait « Duplique vers mes documents » ; l'écran dit « Dupliquer vers mes documents » (`partage-section.js:664`). J'ai recopié l'écran.
- **HEIC** : la consigne le nomme, je l'ai gardé ; le sélecteur l'accepte, mais une application ouverte par double-clic ne le décode pas (inscrit au lot 5).
- **L'ordre dans Outils d'observation** (`rai-solo` avant `grille-depistage`) : un choix, motivé plus haut.

## Trouvé en chemin

Cinq textes d'écran, **inscrits et laissés** (tableau « Trouvé hors de la section Aide » de l'audit, lot 5) :
- la note « i » de « Dynamique des corrélations » lit la courbe comme une cause (« celle-ci a eu un effet », `index.html:9118`) ;
- la même note dit « Points carrés ■ » ; le graphique trace des cercles (`js/correlations-longitudinales.js:409-420`) ; à voir à l'écran ;
- « Exploration des pratiques » (sous-onglet) contre « Comparateur de pratiques » (titre de l'écran, `js/comparateur-pratiques.js:720, 1048`) ;
- « élève » dans le Suivi longitudinal (`js/registre-longitudinal.js:93`) et dans l'étiquette « Liste des élèves » des Outils d'observation (`index.html:8876, 8930`) ;
- « + Ouvrir » de la Modélisation annonce le .heic sans dire qu'il peut échouer (`js/modelisation.js:249-253`).

**Commenté et laissé** (code de test étranger, sans conséquence observable aujourd'hui) : l'essai d'ordre de `sentinelle-aide-2026-10-28-lot-2c-bis` lit la constante `SUIVI` plutôt que la page ; l'essai voisin, qui lit la page, couvre l'ordre.

## Captures

À 1 440 et 820 px, `labo` et `collaboration` ouvertes (`CAPTURES_AIDE_2D=…`, essai Playwright du lot) : lisibles, aucun défilement de côté. Gardées hors du dépôt, dans le dossier de travail de la session ; à refaire au besoin par la même commande.

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Labo : « Labo » présente ses sept outils. Aide › Codex et archives : chercher « collègue » mène à l'import par la bibliothèque (« Importer le partage d'une ou d'un collègue », dans « Collaboration entre collègues »).
