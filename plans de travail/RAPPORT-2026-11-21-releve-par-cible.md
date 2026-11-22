# Rapport – Le relevé par cible que l'étudiant·e reçoit (« Par standards », lot 5)

21 nov. 2026, session cloud (Chromium, pas de WebKit). Branche `lot/moteur-cibles-5-releve`, partie de `main` à 1.253.0
(`16360f43` ; la branche des lots 3 et 4 y est déjà). Conception : `CONCEPTION-2026-11-21-releve-par-cible.md`. Textes :
`TEXTES-2026-11-21-releve-par-cible.md`. Captures : `captures-2026-11-21-releve-par-cible/`.

## 0. En tête

**L'adresse de l'aperçu :** <https://deploy-preview-47--codexnumeris-051225.netlify.app> ; **la PR en brouillon :**
<https://github.com/bedardg71-codexnumeris/labo-codex/pull/47>. La branche a été poussée et la PR ouverte par le Mac, le
21 novembre 2026 ; la suite de ce paragraphe dit l'état à la remise du paquet. La session cloud n'a pas reçu le droit de pousser sur le dépôt
(l'ajout du dépôt en écriture a été refusé par le garde-fou de la session). Le lot est entier dans un commit local sur
`lot/moteur-cibles-5-releve` ; **la PR en brouillon « ne pas fusionner » reste à ouvrir**, par une session qui peut
pousser (le Mac), à partir du paquet remis à Grégoire. C'est le seul point du mandat non tenu.

**Ce que j'ai mesuré avant de concevoir** (§ A) : hors « Par standards », l'étudiant·e reçoit un PDF par copie (la
synthèse de rétroaction), jamais un document par cours ; en « Par standards », **rien ne lui est remis** : la synthèse
exige une évaluation de grille et n'a aucune note pour cette pratique, et la section « Productions » du profil affiche
« Non remis » devant des productions qui portent pourtant un niveau inscrit.

**Mesuré, lu, non vu.**
- *Mesuré* (exécuté) : la sentinelle du lot (24 essais, 15 break-tests, 15 rouges) ; la garde du lot 0 à **16 sur 16** ;
  toute la suite Vitest, **945 fichiers, 12 208 essais, verts** ; sous Chromium, le parcours du relevé (2 essais) et les
  parcours « Par standards » existants (16 essais), verts ; le PDF produit (2 pages Lettre pour trois cibles) ; le ZIP
  du groupe (3 PDF) ; aucune écriture au stockage ; la section « Productions » en « Par standards », lue à l'écran.
- *Lu* (dans le code, non exécuté) : le chemin du PDF de synthèse et de « Exporter pour Léa » ; la section « Rapport » du
  profil ; où vivent les niveaux par critère d'une évaluation (§ C).
- *Non vu* : Safari et l'iPad (§ 6) ; l'impression papier ; un groupe réel (30 étudiant·es, 10 cibles) : la durée du ZIP
  n'est pas mesurée ; l'anonymisation (lue, non exécutée) ; la vue simple (le bouton y est branché, non capturé).

**Ce que j'ai supposé** (technique, tranché seul) :
- le groupe reçoit **un ZIP d'un PDF par étudiant·e**, pas un seul PDF (le relevé se remet à une personne) ;
- la préférence « note différée » vaut pour le relevé ; une note « non calculable » s'écrit « Pas de note pour
  l'instant », le motif reste chez l'enseignant·e ;
- les couleurs des niveaux ne passent au papier que si elles sont écrites en hexadécimal ; sinon une pastille grise (le
  niveau se lit par son nom) ;
- le nom de l'enseignant·e n'est pas imprimé (aucune lecture sûre trouvée hors du module des PDF de consignes).

**Où je m'écarte du mandat.**
1. Pas de PR ni d'adresse d'aperçu (ci-dessus).
2. Le PDF n'est pas tout à fait « dans le moule de la synthèse » : mêmes outils, mais **des pages Lettre** au lieu d'une
   page aussi haute que le contenu (CONCEPTION, § 2).
3. Le mot n'est pas « rendu réglable » durablement : il se choisit dans la fenêtre, le temps d'un relevé, parce que le
   relevé n'écrit rien. L'enregistrer est un petit lot à part, une fois le mot tranché.
4. Deux fichiers existants sont retouchés pour brancher les boutons (`profil-cibles.js`, `tableau-cibles.js`) : une
   ligne chacun, sans effet quand le module du relevé n'est pas chargé.

## A. Ce que l'application remet déjà à un·e étudiant·e

| Sortie | Par où | Ce qu'elle montre de la note | En « Par standards », aujourd'hui |
|---|---|---|---|
| **PDF de la copie annotée + page de synthèse** | Travaux : exporter une copie ; « Exporter pour Léa » (ZIP, un PDF par étudiant·e) | Un bloc « Note provisoire / finale » pour la sélection de productions, « Note actuelle du cours » en sommative | *Lu* : la page exige **une évaluation de grille** pour la copie ; sans elle, pas de page. Avec elle, la rétroaction par critère paraît mais **aucune note du cours** (les deux constructeurs rendent `null` hors de leurs familles). Aucun « 0 » |
| **Synthèse seule** (« Dossier PDF », copie sur papier) | Même page, sans la copie | Idem | Idem |
| **Section « Rapport » du profil** | Texte à copier (pas un fichier) | « Performance : … (note du cours) », ou une phrase quand la note n'est pas constructible | *Lu* : la phrase « non constructible » ; aucun niveau par cible |
| **Export des résultats finaux** | CSV du groupe | La note, ou « non constructible » et la cause | Pour l'enseignant·e et le registraire, pas pour l'étudiant·e |
| **Rapports de présences, bilan réflexif** | PDF | Rien de la note | Sans changement |

**La section « Productions » du profil en « Par standards »** (*mesuré à l'écran*, banc fictif) : elle s'affiche encore,
en premier, et c'est la section ouverte d'office. Elle liste chaque production avec les colonnes « Jeton », « Note »,
« Date », « Actions », et écrit **« Non remis »** et un bouton « Évaluer » devant des productions pour lesquelles un
niveau est inscrit sur une cible (« Analyse 2 », d'où vient un « Avancé »). Rien n'y dit les cibles. *Issue : inscrit*
(§ E) ; ni corrigé ni retiré dans ce lot, comme demandé.

**Conclusion de la mesure** : rien à adapter, tout à ajouter. Le relevé est un document par cours et par étudiant·e,
ce que l'application n'avait dans aucune pratique.

## B. Les questions de didactique, dans l'ordre où les trancher

Le détail (raison, origine) est dans `CONCEPTION-2026-11-21-releve-par-cible.md`, § 3. Chacune est appliquée et se
renverse par une valeur.

1. **Le mot** : « objectif » d'office, « cible » au choix dans la fenêtre. *À toi.*
2. **Les remarques sans niveau** : montrées (« Commentaire »), avec une case pour les retirer et une phrase qui demande
   de relire. *À toi : c'est la seule question où un mauvais choix a un coût (une note écrite pour soi, lue par
   l'étudiant·e).*
3. **La note pendant la session** : « Pas encore de note », la règle, les objectifs sans niveau nommés, et la phrase du
   0 % à la fin du cours.
4. **L'historique** : tout ce qui est actif, le niveau actuel en tête et marqué.
5. **Les critères cochés** : seulement ceux que tu as renseignés.
6. **Les annulées** : absentes.
7. **L'origine** : le titre de la production, ou rien.
8. **Le poids et le calcul** : la part de chaque cible toujours ; le calcul quand la note existe.
9. **Les critères de chaque cible**, essentiels marqués : montrés.
10. **L'échelle** : en fin de relevé, noms et descriptions, sans plages ni valeurs.
11. **Une cible sans donnée** : « aucun pour l'instant » et le nom du niveau « sans donnée ».
12. **La date** : le jour du relevé, « État au … ».
13. **« Niveau actuel »** plutôt que « niveau retenu ».
14. **Ni « tu » ni « vous »** tant que tu n'as pas choisi.
15. **Un dernier niveau plus bas** : dans la liste, sans phrase à part.

## C. Le pont, mesuré sans construire : les évaluations par critère sous une cible

**Où sont les données** (*lu*). Une évaluation complète (`evaluationsSauvegardees`) porte `criteres[]` :
`{ critereId, critereNom, niveauSelectionne, ponderation, retroaction }`, son `grilleId`, son `echelleId`, son
`productionId`, sa date. La grille porte ses critères (`id`, `nom`, `description`, `ponderation`, `type`). C'est ce
que la synthèse de rétroaction lit déjà (`construireCriteres`).

**Ce qui manque pour dire quel critère nourrit quelle cible.** Rien ne relie les deux mondes :
- un critère de grille n'a aucun champ qui désigne une cible ; un critère de cible (`ensemblesCibles[].cibles[].criteres`)
  a sa propre identité, sans lien avec une grille ;
- `production.objectif` est un texte libre ; `objectifsServis` appartient à la carte d'Alignement (plan, § 1.2) ;
- les deux échelles peuvent différer (celle de la grille, celle de la pratique) : un « niveau par critère » ne se lit
  pas forcément dans l'échelle des cibles.

**Ce qu'il faudrait** : (1) un lien écrit par l'enseignant·e, « ce critère de cette grille nourrit cette cible » :
un champ sur le critère de grille, ou une table à part dans l'ensemble de cibles (préférable : la grille voyage et se
partage, le lien est propre au cours) ; (2) un écran pour le poser ; (3) une lecture, pour un·e étudiant·e et une cible,
des évaluations dont un critère y mène ; (4) l'affichage sous la cible, **dans l'échelle de la grille, sans conversion**.
Le relevé est prêt à le recevoir : une ligne de plus dans « Ce qui a été observé », d'un troisième type.

**Ce que ça coûterait** : deux lots. Le lien et son écran (une clé neuve ou un champ qui voyage avec les grilles
partagées, donc l'import et l'export à couvrir) ; puis l'affichage au profil et au relevé. La garde du lot 0 devra être
relue : pour la première fois, le monde des cibles lira une évaluation (plan, § 10, question 4). **Aucun calcul** n'en
dépend tant que l'évaluation ne *propose* pas un niveau : c'est la frontière à tenir. Deux avertissements des sources
restent à porter avant de concevoir (fiche, § 9.3) : des critères propres à chaque cible valent mieux que des critères
constants ; un auteur a abandonné un lien de ce genre, jugé trop compliqué.

## D. Ce qui est construit

- `js/releve-cibles-data.js` : le relevé d'un·e étudiant·e, assemblé depuis ce que la section « Cibles » lit déjà ; les
  choix de didactique en une table (`CHOIX`). Aucun calcul, aucune écriture.
- `js/releve-cibles-rendu.js` : la mise en page et **tous les mots de l'étudiant·e**.
- `js/releve-cibles.js` : la fenêtre d'aperçu, le PDF, le ZIP du groupe.
- Branchements : un bouton dans la carte « Les cibles » du profil ; un bouton au tableau des cibles (deux vues) ; trois
  balises dans `index.html` ; des styles dans `css/tableau-cibles.css` (variables du thème ; le papier reste blanc).
- Essais : `tests/unit/sentinelle-par-standards-lot-5-releve.test.js` ; `tests/integration/par-standards-lot-5-releve.spec.js`.

**Les autres pratiques.** Le relevé n'est appelé que par la section « Cibles » et le tableau des cibles, qui n'existent
qu'en « Par standards ». La sentinelle le garde de trois façons : pour quatre autres familles, rien ne s'ouvre et rien
n'est offert ; la liste des fichiers qui nomment le relevé est épinglée (cinq) ; ses modules ne lisent ni évaluations,
ni indices, ni la synthèse. Break-tests BT7, BT7b : rouges. La synthèse de rétroaction et ses PDF ne sont pas touchés
(aucun de leurs fichiers n'est modifié).

**Break-tests** : 15 mutations dans le code réel, 15 rouges ; le journal est en fin de sentinelle.

**Sécurité** : tout texte des données passe par `echapperHtml` (essai avec une étiquette, un énoncé, un critère et une
rétroaction hostiles) ; aucun handler en ligne ; aucun `console.log` ; « CIB » nulle part.

**Trouvailles et leur issue.**
- « Productions » dit « Non remis » en « Par standards » : *inscrit* (§ E).
- Le PDF en image n'est pas lisible par un lecteur d'écran (comme la synthèse) : *inscrit*.
- Sous `file://`, Chromium ignore le nom demandé pour un téléchargement : propre au banc, *commenté dans la spec*.
- Deux cliquets ont rougi en chemin et sont réglés dans le lot (une fonction trop complexe, découpée ; une classe sans
  règle, définie) : c'était mon propre code.

## E. L'idée de la page unique au profil (remplacer « Productions » en « Par standards »)

**Ce qui existe déjà dans la section « Cibles »** : la note et son récit ; une ligne par cible avec le niveau retenu,
sa date, son origine, sa rétroaction ; toutes les inscriptions datées, remarques et annulées comprises, avec les
critères cochés. C'est déjà une page rangée par cible : l'essentiel de ce que Grégoire décrit.

**Ce qui lui manque** pour être « la » page : (1) être la section ouverte d'office (c'est « Productions » qui l'est) ;
(2) les critères de la cible eux-mêmes, visibles sans ouvrir une inscription ; (3) le geste d'inscrire depuis la page
(on inscrit au tableau) : c'est là qu'on veut tout voir « au moment de poser un niveau » ; (4) ce que les évaluations
complètes ont laissé, par critère : le pont (§ C) ; (5) le relevé à portée de main : fait dans ce lot.

**Ce que je recommande**, en trois pas, le premier sans attendre le pont :
1. En « Par standards », **ouvrir le profil sur « Cibles »** et la placer en premier ; garder « Productions » derrière,
   mais lui faire dire la vérité (pas « Non remis » devant une production d'où vient un niveau). Petit lot, aucun
   retrait.
2. **Inscrire depuis la section « Cibles »** (la fenêtre du tableau, ouverte d'ici) et y montrer les critères de chaque
   cible : la page devient l'endroit où l'on juge, avec tout sous les yeux.
3. Après le pont : les évaluations par critère sous chaque cible ; alors seulement, décider si « Productions » se
   retire dans cette pratique. La retirer avant ôterait le seul endroit d'où l'on ouvre l'évaluation d'une production.

## 6. Ce que le Mac devra passer sous Safari (et sur l'iPad)

1. La fenêtre d'aperçu : le papier se met-il à l'échelle de la fenêtre (propriété `zoom`) en 1180 × 820 et 820 × 1180 ?
2. Le PDF d'un·e étudiant·e : le fichier porte-t-il son nom (accents compris) ; les pages sont-elles nettes ?
3. Le ZIP du groupe : se télécharge-t-il sur l'iPad ; combien de temps pour un groupe réel ?
4. Le défilement de l'aperçu au doigt, sans faire défiler la page derrière.
5. Thème sombre : la fenêtre lisible, le papier blanc.
6. Les parcours « Par standards » existants, inchangés (tableau, profil).

### Verdicts du Mac, sous Safari (21 novembre 2026, en soirée)

Safari 27.2 sur macOS 27.2.1, piloté par `safaridriver`, **sur l'aperçu en ligne** (`deploy-preview-47`, commit
`9843ccb4e`), clics réels, écran déverrouillé. Session d'automatisation de Safari : stockage à part, vide, fictif.
Captures : `captures-2026-11-21-releve-par-cible/safari/`.

| Point | Verdict | Sur quoi il repose |
|---|---|---|
| 1. Échelle du papier | **Passé** | 1180 × 820 : le papier (816 px) tient dans l'aperçu (864 px), `zoom` reste à 1. 820 × 1180 : `zoom` = 0,849, papier de 693 px dans un aperçu de 732 px. Aucun débordement horizontal, ni de l'aperçu ni de la page. Captures `1-apercu-*` relues. |
| 2. PDF au nom de l'étudiant·e, pages nettes | **Passé**, un doute visuel | Safari a écrit dans Téléchargements `Releve_Fictive_Zoé_2100001.pdf` (le « é » intact) et le ZIP `Releves_FRA101-Cours-fictif_2026-11-21.zip`, qui contient `…Zoé…`, `…Léa…`, `…Inventé…`. Deux pages, une image de 1632 × 2112 px chacune (192 ppp sur une feuille Lettre). Pages relues (`4-pdf-page-1.png`, `-2.png`) : accents, apostrophes, « · », ✓ et ✕ justes, texte net. **Doute laissé à Grégoire** : l'espace entre certains mots est irrégulier dans le PDF (« monter d'ici », « s'enchaînent bien », « Acquis, depuis ») ; lisible, mais visible à l'œil. |
| 3. ZIP sur l'iPad, groupe réel | Non jugé | À Grégoire. |
| 4. Défilement au doigt | Non jugé | À Grégoire. |
| 5. Thème sombre | **Passé** | Captures `1-apercu-*-sombre` relues dans les deux formats : fenêtre, libellés, menus et boutons lisibles ; le papier reste blanc, texte noir. |
| 6. Parcours existants | **Passé** | Les 16 essais (`par-standards-a-l-essai`, `-lot-2-inscrire`, `-lots-3-4`) verts, 16 sur 16. |

**Comment les bancs ont été rejoués.** Playwright ne pilote pas Safari : un adaptateur de session (hors dépôt) rend
la même API au-dessus de `safaridriver`, et les bancs sont joués tels quels, l'adresse de l'aperçu à la place de
`file://`. Trois écarts avec Playwright, à connaître pour peser ces verts :
- l'amorce qui éteint `navigator.webdriver` (essai de la vue simple) ne peut pas précéder le chargement ; le choix de
  la vue est rejoué juste après (`VueSimple.demarrer()`) ;
- les erreurs de page ne sont captées qu'après le chargement, pas pendant ;
- `fill` et `selectOption` posent la valeur et émettent `input` et `change` (comme Playwright) ; les clics et la
  touche Échap sont ceux de Safari.

**Le banc du lot 5 lui-même, sous Safari** : PDF et ZIP verts, captures faites ; **le premier essai est rouge tel
qu'écrit** (« aucune écriture, dans aucune clé du stockage »). La clé qui apparaît est `a2026_indicesPatternsRaI` :
le recalcul des indices que lance l'ouverture du profil, et qui finit ici après la photo du stockage. En attendant
cette clé avant la photo, l'essai est vert trois fois sur trois : le relevé n'écrit rien, c'est le banc qui photographie
trop tôt.

**Trouvailles, inscrites sans y toucher** (hors de ce mandat) :
1. *Le banc du lot 5 photographie le stockage avant la fin du recalcul des indices* (ci-dessus) : vert sous Chromium
   et WebKit en `file://`, rouge sous Safari en ligne. À corriger dans le banc avant qu'il serve de sentinelle.
2. *Les pages du PDF ne sont pas au format Lettre, seulement à ses proportions* : `MediaBox` de 2176 × 2816 points
   (30 × 39 pouces) au lieu de 612 × 792. Identique dans le PDF produit sous Chromium (`releve-zoe-fictive.pdf`) : ce
   n'est pas Safari. Une impression « ajuster à la page » le masque ; une impression à 100 % non.
3. *L'aperçu Netlify porte sa propre barre* (un cadre de 780 × 48 px au bas de la fenêtre, `app.netlify.com/cdp`) :
   elle a couvert une tuile de niveau au bas de la fenêtre « par production » en 1280 × 728 (clic repris après
   défilement). Elle n'existe pas en production ; Grégoire la verra sur l'iPad en passant les points 3 et 4.

## 7. Les gestes pour voir le relevé

Avec un groupe dont la pratique est « Par standards » et quelques niveaux inscrits :

1. Ouvre le profil d'un·e étudiant·e, puis la section « Cibles ».
2. Dans la carte « Les cibles », appuie sur « Relevé de l'étudiant·e ».
3. Lis l'aperçu : c'est ce que l'étudiant·e recevra. Change « Le mot que lit l'étudiant·e », décoche « Montrer les
   remarques sans niveau », passe à un·e autre étudiant·e : l'aperçu suit.
4. « Télécharger ce relevé (PDF) » : un fichier au nom de l'étudiant·e.
5. Pour tout le groupe : au tableau de notation (le tableau des cibles), « Relevés des étudiant·es », puis
   « Télécharger les relevés du groupe (ZIP) ».

Sans attendre l'aperçu en ligne : `captures-2026-11-21-releve-par-cible/` montre la fenêtre (deux formats, clair et
sombre), le bouton au profil et au tableau, et les deux pages d'un PDF (`releve-zoe-fictive.pdf`).
