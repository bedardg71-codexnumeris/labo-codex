# Demande de relecture – #1028, archiver les copies d'un trimestre clos en gardant ses données

> Écrite par Claude Code le 5 octobre 2026 à 9 h 30 (Toronto, mesurée par `date`), sur la consigne de Cowork de 9 h 02. Branche `claude/1028-archiver-copies`, **non poussée**, aucune release. Geste qui **retire des données** (les fichiers des copies) : relecture croisée obligatoire (règle 2) ; la première fois sur les données de Grégoire lui revient.

## 1 · Ce que fait le geste, ce qu'il refuse

Au menu ⋮ d'un trimestre **clos**, « Archiver les copies… » retire de l'application les **fichiers** des copies (travail et corbeille) et leurs vignettes, quand l'archive du trimestre (E1), listée et vérifiée, les garde à l'identique. Les données restent : fiches des copies, évaluations, grilles, rétroactions, annotations. « Faire revenir », sur la ligne de l'archive, les ramène.

Il refuse ce qu'E3 refuse (actif, pas clos, sans archive listée, archive non vérifiée, archive changée ou une copie illisible). Il refuse aussi toute copie que l'application a et que l'archive n'a pas, ou qu'elle a différente : **rien n'est retiré**, et la fenêtre propose d'archiver de nouveau.

## 2 · Ce que j'ai mesuré avant de coder

**Les annotations** (*mesuré*) vivent dans les données (`<trimestre>_annotationsTravaux`), pas dans le fichier. Elles survivent donc au geste. Mais elles ne se **dessinent** que sur la page rendue de la copie : sans fichier, on ne les voit nulle part. Les comptes qui en dérivent (synthèse de rétroaction, codes) restent. Les mots disent donc « restent dans l'application », jamais « consultables ».

**Les lecteurs du fichier d'une copie** (*mesuré*, inventaire complet par un agent de recherche, puis vérifié aux sites que j'ai modifiés) :

| Lecteur | Avant, fichier absent | Avec #1028 |
|---|---|---|
| Visionneuse (Annoter, Évaluer, Consulter, côte à côte) | rien affiché, `return false` ignoré : **la copie précédente reste à l'écran** et « Évaluer » s'enchaîne sur elle | la copie s'ouvre, la page dit « Aux archives » et son message ; l'ancienne copie et ses annotations quittent l'écran ; badge « Aux archives » |
| Miniatures | icône d'attente | badge « ARC », icône d'absence |
| Exporter le PDF annoté | `alert` « Erreur lors de l'export PDF. Voir la console. » | `alert` du message « aux archives » |
| Aperçu du PDF (vue Archivage) | « Erreur de génération. » | « Cette copie est aux archives. » |
| « Dossier PDF » | `alert` « Impossible de récupérer le fichier. » | la synthèse seule (#912), et une notification le dit |
| Export des travaux, export pour Léa | bilan « … — Blob introuvable » | bilan « … — aux archives » |
| Éditeur de pages, « Fusionner », ajout à une fusion | erreur ; **la fusion efface en silence une copie image sans fichier** | refusés : « fais-la revenir avant de modifier ses pages » |
| Aperçu en ligne | rien (`console.warn`) | notification « aux archives » |
| Codex, à l'écriture | copie comptée « manquante », fenêtre de danger | ni attendue ni manquante : pas de fenêtre pour elle |
| Codex, à l'ouverture ; import d'un ZIP | marquée `manquant` | ni attendue ni marquée (la marque voyage dans le codex) |
| Archive d'un groupe (`reserve.js`) | archive sans la copie, sans le dire | **refusée** tant que des copies sont aux archives |
| Modélisation, doublons, « Vérifier » | ne lisent pas ce magasin, ou lisent l'archive | inchangés |

**« Faire revenir » (#1000)** (*mesuré*) savait déjà lire l'archive d'un trimestre (même source, `entree.trimestre`), mais seulement `fichiersTravaux`. Je l'ai **étendu** (pas de second chemin) : il lit aussi la corbeille pour une archive de trimestre, et lève la marque des copies revenues.

**E1 et E3** (*mesuré*) : E1 range ce qu'il trouve ; une copie absente est comptée dans `nombre_fichiers_manquants`, sans un mot. Il écrit dans le **même dossier** (`<trim>-trimestre`) et remplace donc l'archive qui garde les copies. E3 ne compare que les clés `<trimestre>_*` et les séances ; pour lui, une copie absente de l'application ne fait pas de différence.

## 3 · Les décisions techniques, et ce que j'ai supposé

**Où vit la marque : `_copiesAuxArchives`**, une clé globale `{ <trimestre>: { dossier, uuid, date, ids } }`. *Pourquoi* : hors des clés `<trimestre>_*`, E3 ne la compare pas, ce qui satisfait (a) : le trimestre reste « identique » à son archive, et E3 le renvoie. E1 ne l'archive pas. Elle voyage dans le codex, ce qui satisfait (c). La marquer dans `blobStatut` aurait changé `<trimestre>_fichiersTravaux`, et E3 aurait jugé le trimestre « changé » à jamais.

**« Aux archives » = marquée ET fichier absent.** Une copie marquée dont le fichier est encore là (geste interrompu) se montre normalement. Côté synchrone (miniatures), la vignette sert de témoin : elle part avec le fichier.

**Point 4 b : je refuse, je ne reprends pas de l'archive précédente.** Les reprendre voudrait dire relire l'archive pendant qu'E1 écrit par-dessus, dans le même dossier ; en mode fichier, il faudrait en plus la redemander. Le refus propose de faire revenir les copies d'abord. Une marque dont les fichiers sont revenus par un autre chemin (codex, import) est levée au passage et ne bloque pas.

**L'ordre** : la marque d'abord (une écriture, relue), puis chaque fichier (relu absent) et sa vignette. L'arrêt se produit au premier refus ; la reprise se fait depuis le même menu, par la même comparaison sur ce qui reste.

**Supposé — à juger** :
- La copie d'un·e étudiant·e **supprimé·e reste** dans l'application. « Faire revenir » ne la ramènerait pas (règle du 2 oct.), elle ne part donc pas, et la fenêtre le dit. *Alternative* : la faire partir comme E3 le fait. C'est une question de pédagogie et de données : elle revient à Grégoire si la règle lui semble mauvaise.
- E3 **lève toute la marque** du trimestre qu'il renvoie : son archive garde tout.
- Les vignettes ne reviennent pas avec les copies (#1026, comme E2).
- L'archive d'un groupe refuse dès qu'une copie **du trimestre** est aux archives, pas seulement une copie du groupe. Le geste porte sur le trimestre entier ; le cas mixte n'existe pas sans reprise interrompue.

**Ce que j'ai touché à E3** : la relecture de l'archive (meta.json, donnees.json, le contenu de chaque copie) est sortie de `comparer` vers `ReserveRenvoyer.relireArchive`, partagée avec #1028 (zéro-dette : pas de copie). Le témoin d'E3 qui la neutralise vise la nouvelle ligne, avec la même mutation et le même sens. E3 reste à 37/37.

## 4 · Les tests

**Vitest** `sentinelle-1028-archiver-copies` (23 essais) : l'aller-retour (archiver, vérifier, archiver les copies, faire évoluer les données, faire revenir : chaque fichier égal, la marque levée, rien d'autre changé), l'ordre, la marque, les mots, la relance « rien à archiver » ; E3 après le geste, puis E2 ; le refus d'E1 (et ses mots), celui de l'archive d'un groupe, la marque levée quand les fichiers sont revenus ; une copie différente, une ajoutée, une copie de l'archive altérée après « Vérifier » (rien retiré), des données changées (sans effet) ; l'arrêt et la reprise, la marque refusée ; la copie d'un·e étudiant·e supprimé·e.

**Témoins rouges** (mutation du code, le banc doit la voir) : une copie retirée que l'archive n'a pas ; la relecture du contenu neutralisée ; une clé `<trimestre>_*` retirée ; E1 qui archive sans les copies parties. **Break-test** du vrai code, fichiers restaurés par copie et empreintes vérifiées : la corbeille retirée du retour (3 rouges) ; E3 qui ne lève plus la marque (1 rouge).

**WebKit** `1028-archiver-copies.spec.js` (2 essais, largeur iPad portrait) : le vrai menu ⋮ (dans la largeur), le vrai sélecteur, la fenêtre et le bilan ; les fichiers partis, rien d'autre ; le refus d'E1 ; puis, h2032 activé : visionneuse, export PDF, aperçu, « Dossier PDF », éditeur de pages et codex, **sans plantage** (aucune `pageerror` ni `console.error`) ; « Faire revenir » par le vrai bouton de la ligne ; l'arrêt et la reprise. **Break-test** : la visionneuse sans sa branche (rouge), le codex qui compte les copies aux archives (rouge).

**Vitest complet** : 681 fichiers, 8 201 essais verts, ni « Errors » ni « Unhandled ». Une preuve textuelle de #614 a été élargie à la nouvelle forme de la garde (`exporte` reste exigé). **Bancs WebKit** d'E1, E2, E3, A3 et du lot : 9 sur 9.

**Pas testé** : Safari et l'iPad réels ; le mode dossier en vrai (Chrome) ; l'ouverture d'un **codex** et l'import d'un ZIP qui portent la marque (code écrit, pas éprouvé) ; l'export des travaux et l'export pour Léa (même chemin d'erreur que le PDF, non rejoué).

## 5 · La mémoire et la durée, à taille réelle

*Mesuré* : WebKit, profil persistant, un navigateur neuf par passe, `footprint`. Trimestre fictif : 130 étudiant·es, 1 500 évaluations, 394 copies dont 4 de 22 Mo, archive de 1 092 Mo.

| | Durée | Pic de la page (WebContent) |
|---|---|---|
| Au démarrage | – | 168 Mo |
| Comparaison (394 copies de l'archive relues et empreintées, puis 394 de l'application) | **2,4 s** | 192 Mo |
| Retrait (marque + 394 fichiers + 394 vignettes) | **0,6 s** | 192 Mo |
| « Faire revenir » (394 copies, depuis un navigateur neuf) | **2,1 s** | 209 Mo |

Réseau 37 à 55 Mo, GPU 119 Mo. Le bilan dit « 394 copies retirées, environ 1,07 Go libérés » ; au retour, 394 revenues, 0 abîmée, la marque levée.

## 6 · Trouvailles en chemin (code étranger)

1. **La visionneuse laisse la copie précédente à l'écran** quand un fichier manque (copies « manquantes » de #997) : « Évaluer » s'enchaîne alors sur la mauvaise copie. *Déduit du code, non reproduit.* Corrigé pour les copies aux archives seulement. Disposition proposée : **inscrire**, mais la règle du 24 août l'écarte du BACKLOG (aucun symptôme vécu). À trancher.
2. **« Fusionner » efface en silence une copie image sans fichier** (`travaux-ui.js`, `editionFichiersASupprimer` posé avant le chargement). C'est une perte de données. Gardé ici pour les copies aux archives ; pour une copie « manquante », le défaut reste. Même disposition à trancher.
3. `notifications.avertissement` est appelé (`travaux-ui.js` ~l. 2314) mais n'existe pas dans l'API (`succes`, `erreur`, `warning`, `info`). Non vérifié à l'exécution. Disposition : **commenter et oublier**, ou inscrire, au choix de Cowork.
4. La CI au navigateur n'a rien jugé depuis le 27 sept. : 8 runs planifiés annulés, les deux derniers aboutis en échec (constat de l'audit d'ouverture). Disposition : **inscrire**, si Cowork le juge vécu.

## 7 · Les mots, pour Grégoire (tous provisoires, dans `ReserveCopies.MOTS`)

> **Menu ⋮** : « Archiver les copies… » — infobulle « Retirer de l'application les copies de ce trimestre : son archive vérifiée les garde, ses données restent »
>
> **Fenêtre** : « Archiver les copies de Hiver 2026 ? » — « 394 copies quitteront l'application, environ 1,07 Go.
> Son archive, vérifiée le 5 octobre 2026, les garde telles quelles : « Faire revenir » les ramènera.
> Les notes, les grilles, les rétroactions et les annotations restent dans l'application.
> Garde bien cette archive : c'est elle qui conserve les copies. »
> (+ s'il y a lieu : « 1 copie d'un·e étudiant·e supprimé·e reste dans l'application. ») — bouton « Archiver les copies »
>
> **Différent** : « Des copies de Hiver 2026 ont changé depuis son archive » — « Rien n'a été retiré.
> Depuis son archive du 5 octobre 2026 : 2 copies ajoutées, 1 copie modifiée.
> Pour archiver ses copies : archive le trimestre de nouveau, vérifie la nouvelle archive, puis recommence. » — bouton « Archiver de nouveau »
>
> **Bilan** : « Les copies de Hiver 2026 sont aux archives » — « 394 copies retirées, environ 1,07 Go libérés. Ses données restent dans l'application.
> Pour les faire revenir : Réglages › Données › Archives, ligne de Hiver 2026, « Faire revenir ». »
>
> **Interrompu** : « Archivage des copies inachevé » — « L'archivage des copies de Hiver 2026 s'est arrêté en cours de route. Rien n'est perdu : son archive les garde toutes.
> Pour finir : relance « Archiver les copies… » depuis le même menu.
> Pour annuler : « Faire revenir », Réglages › Données › Archives. »
>
> **Refus** : titre « Copies non archivées » ; « Ce trimestre n'a plus de copie dans l'application : il n'y a rien à archiver. » ; « Ce trimestre n'est pas dans l'application. » ; les refus de l'archive sont ceux d'E3, tranchés le 5 oct.
>
> **Une copie aux archives** : étiquette « Aux archives » (badge des miniatures « ARC ») ; dans la visionneuse et à l'export du PDF : « Cette copie est aux archives. Sa note, sa grille, sa rétroaction et ses annotations restent dans l'application.
> Pour la revoir : Réglages › Données › Archives, ligne de Hiver 2026, « Faire revenir ». » ; « Dossier PDF » : « Cette copie est aux archives : le dossier ne contient que la synthèse (note, grille, rétroaction). » ; aperçu : « Cette copie est aux archives. » ; bilan d'export : « … — aux archives » ; éditeur et fusion : « Cette copie est aux archives : fais-la revenir avant de modifier ses pages. »
>
> **Archiver le trimestre, refusé** : « Archive non écrite » — « 394 copies de Hiver 2026 sont aux archives : une nouvelle archive ne les contiendrait pas.
> Fais-les revenir d'abord (Réglages › Données › Archives, « Faire revenir »), puis archive de nouveau. »
>
> **Le retour** : le bouton « Faire revenir » de la ligne de l'archive du trimestre (il remplace « Faire revenir » d'E2 tant que le trimestre est là et que des copies sont aux archives) ; la fenêtre et le bilan sont ceux de #1000, acceptés le 4 oct. : « Faire revenir les copies » … « Copies revenues » — « 394 copies revenues ».

## 8 · Ce qui reste à Grégoire

La première fois sur l'hiver 2026 : archiver le trimestre (E1), vérifier, puis « Archiver les copies… ». C'est une porte terrain, qui revient à Cowork.
