# Demande de relecture – E2, emprunter un trimestre (#1023)

> Écrite par Claude Code le 4 octobre 2026 vers 19 h 35 (Toronto, mesurée par `date`), sur la branche `claude/e2-emprunter-trimestre`, partie de `main` à `1847b3d3`. Consigne de Cowork de 19 h 06, points 1 à 6. **Ni push du lot, ni release, ni verdict complet.** Rien n'a été écrit dans les données de Grégoire : tout est mesuré sur des jeux fictifs. Marques : *mesuré* (banc ou sonde, avec son témoin), *lu* (code), *inféré*.

## Pour Grégoire, en deux lignes

- **« Emprunter »** ramène dans l'application un trimestre archivé, tel qu'il a été archivé et clos : ses élèves, ses évaluations, ses copies, les séances de ses groupes.
- **Il ne touche jamais** aux autres trimestres, aux cours, au profil ni aux réglages ; s'il s'arrête en route, il retire ce qu'il avait écrit.

## 1 · Le geste et ses témoins

**Où** : Réglages › Données › Archives, sur la ligne « Trimestre entier » d'une archive **vérifiée dans ce navigateur**. Une archive non vérifiée n'offre pas le bouton. Les gardes sont aussi dans la fonction.

**Le trajet** : le clic demande d'abord le fichier (geste actif, #995, même ordre que « Faire revenir »), puis la fenêtre, puis le bilan. Le refus « déjà là » se dit **avant** le sélecteur de fichier, sans rien lire de l'archive.

| Décision de Cowork | Ce qui est fait | Témoin |
|---|---|---|
| 2 · refus d'abord | Registre → « déjà là » ; une clé `<trimestre>_*` sans entrée au registre → « débris » ; une séance ou une copie déjà là et **différente** → « ne concorde pas ». Rien d'écrit. | Vitest (b) : chaque refus compare tout l'espace (clés et fichiers) avant et après, et le journal des écritures est vide |
| 3 · tout recomparé au geste | `meta.json` à l'empreinte retenue par « Vérifier » ; `donnees.json` à la sienne ; chaque clé à la sienne ; chaque copie à la sienne, au moment de l'écrire ; puis chaque clé **relue** après l'écriture | Vitest (b) et (d) ; mutations ci-dessous |
| 4 · ordre | Fichiers, puis clés et séances, puis **en dernier** l'entrée du registre (depuis `pour_memoire`), ajoutée, `archive: true`, sans `actif` | Vitest (a) : journal des écritures ; WebKit : le registre d'après = celui d'avant + une entrée |
| 5 · aucune autre clé globale | Une clé de l'archive doit être `<trimestre>_*` ou la séance d'un de ses groupes. Une clé globale **glissée dans une archive pourtant vérifiée** : refus entier | Vitest (c) : profil glissé (déjà là) et bibliothèque glissée (absente) |
| 6 · échec en route | Ce que ce geste a écrit est retiré, dans l'ordre inverse ; rien d'autre | Vitest (d) : refus de la 3ᵉ clé, du registre, d'une copie ; copie altérée ; copie absente → l'espace est identique à avant |

**Le banc WebKit** (`tests/integration/e2-emprunter-trimestre.spec.js`, 13 s) fait le trajet de la consigne dans la vraie page, à 820 px : archiver h2032 (E1), le vérifier par le vrai bouton, le supprimer par la vraie `supprimerTrimestre` (deux fichiers de copies retirés à la main, un laissé), faire évoluer l'espace (une élève ajoutée à a2032, le profil changé), puis « Emprunter » par le vrai bouton, la vraie fenêtre et le vrai sélecteur. Témoins :

- les clés du trimestre égales à celles d'avant la suppression ; les copies identiques octet pour octet ;
- **une seule clé hors du trimestre a changé : `trimestres`** ;
- la carte close dans la bibliothèque ;
- un second emprunt refusé « déjà là », sans sélecteur, rien écrit.

**Mutations démontrées rouges sur le disque** (fichier restauré par copie, empreinte identique avant et après) :

- **une clé globale réécrite** (la règle « à sa place » retirée) : 4 essais rouges ;
- **le registre écrit avant les clés** : 3 essais rouges ;
- **une empreinte non recomparée** (celle d'une copie) : 2 essais rouges.

Dans le banc lui-même, sept témoins de plus. Les données ont **trois verrous** : l'empreinte de `donnees.json`, celle de chaque clé, et la relecture après écriture. Un seul retiré ne laisse rien passer ; les trois retirés, la note changée entre (mesuré). C'est pour cela que la mutation « empreinte non recomparée » vise la copie, qui n'a qu'un verrou.

## 2 · Deux mesures qui démentent une décision

**(a) Décision 2, les séances.** *Mesuré* : `supprimerTrimestre` laisse les séances vivantes `seancesCompletes_gc_<id>`, dont le nom ne porte pas le trimestre. Il laisse aussi les fichiers des copies (E0, #1019). Refuser dès qu'une séance existe refuserait donc **tout** emprunt après une suppression. **J'ai tranché** : déjà là et identique à l'archive, la séance (ou la copie) est laissée telle quelle. Elle n'est ni réécrite ni retirée en cas d'échec. Différente : refus entier.

**(b) La garde #340 bloquait l'emprunt.** *Mesuré* (WebKit, vraie `db`) : `h2032_productions` a été bloquée (« productions du trimestre a2032 écrites sous h2032 »). La table de la garde ne lit que les trimestres du registre ; or le registre est écrit en dernier (décision 4), et le cours est partagé avec le trimestre en cours. Ma relecture après écriture l'a vu, et tout a été retiré. **Sans correction, l'hiver 2026 ne pourrait jamais être emprunté** : son cours 601-101 est celui d'A2026. **Corrigé dans le lot** : un trimestre absent du registre n'est pas jugé. Le cas #340 (deux trimestres du registre) reste bloqué ; deux essais l'établissent dans la sentinelle #340, dont un démontré rouge sans la correction.

## 3 · Les mesures demandées

**Point 1, une archive venue d'ailleurs** (*mesuré*, navigateur WebKit neuf, espace vide) :

- « Ouvrir une archive… » fait entrer l'archive d'un trimestre dans la liste, avec son type, par le `manifeste-archives.json` du ZIP ;
- « Vérifier » la dit vérifiée (la couverture n'est pas mesurée, le trimestre n'étant pas là), puis « Emprunter » est offert et réussit.

⚠ Ce chemin a deux défauts :

- il **charge l'archive entière** : pic de la page à **1 242 Mo** pour une archive de 1,15 Go, contre 160 Mo au démarrage ;
- il ouvre l'écran de réimport des bibliothèques, sans rapport avec un trimestre.

Sur iPad, c'est le risque d'un arrêt de la page (*inféré*). **Inscrit : #1025.**

**Point 5, le cours absent** (*mesuré*, même navigateur neuf : ni `cours` ni autre trimestre). L'emprunt réussit et ne crée aucun `cours`. Une fois le trimestre activé, le menu des cours montre l'identifiant brut (« C1 (2 groupes) »), et la section « Travaux soumis » d'une élève ne s'est pas affichée, sans erreur dans la console (non élucidé). Dans l'espace d'origine, où le cours existe, tout se lit.

**Point 7, les vignettes** (*lu*, puis *mesuré* sur l'écran). Les vignettes ne se refont **qu'à l'import** (`travaux-import.js` l. 745, 753, 1254, 1271, 1622). Les lignes 1008 et 1094 citées par le verdict d'E1 concernent la **file d'import**, pas les copies rangées. Mesuré : copie revenue, vignette absente, « Travaux soumis » d'une élève → l'image reste cachée, l'icône du type s'affiche, aucune `thumbnail_<id>` n'est écrite. Autre mesure : `supprimerTrimestre` **laisse** les vignettes. Dans le même navigateur, elles sont donc encore là au retour. ⮕ **À trancher par Cowork** : régénérer à l'emprunt (E2 a chaque fichier en main), c'est écrire une clé globale (`thumbnail_<id>`), ce que la décision 5 exclut.

**Point 8, activer le trimestre emprunté** (*mesuré*, rien corrigé) :

- **à l'activation** (`changerTrimestreActifV2`) :
  - clés du trimestre changées : `h2032_groupesCours`, `seancesCompletes_gc_GC_H1` ;
  - clés du trimestre créées : `h2032_calendrierComplet`, `h2032_indicesAssiduite`, `h2032_indicesCP`, `h2032_indicesPatternsRaI` ;
  - hors du trimestre : `groupeCoursActif`, `infoCours`, `trimestreActif`, `trimestres` changées, et `seancesCompletes_C1` créée ;
- **au démarrage suivant** :
  - les trois clés d'indices et `h2032_productions` changent ;
  - `h2032_interventions` et `h2032_snapshots_GC_H1` naissent ;
- le bandeau dit « LECTURE SEULE — Hiver 2032 », avec « Permission d'écriture ».

⮕ Pour E3 : **le livre rendu n'est pas celui qu'on a emprunté si on l'a activé.** E3 doit comparer à l'archive, ou la consultation ne doit pas activer. Écrit à la fiche #1024.

**Point 9, la mémoire** (*mesuré*, WebKit, profil persistant, archive fabriquée au format d'E1 : 394 copies, 1,15 Go, dont 4 de 22 Mo) :

| Processus | Après le démarrage (pic) | Après l'emprunt (pic) |
|---|---|---|
| Page (WebContent) | 162 Mo | **210 Mo** |
| Réseau (Networking) | 27 Mo | 55 Mo |
| GPU | 124 Mo | 124 Mo |

394 copies revenues, 7 clés, registre écrit ; **2,3 s**. Une copie à la fois : la hausse est de l'ordre de deux fois la plus grosse copie. *Pas mesuré* : l'iPad ; le mode dossier (Chrome) en vrai.

## 4 · Les mots, pour Grégoire (tous provisoires, dans `ReserveEmprunter.MOTS`)

> **Bouton** : « Emprunter » (infobulle : « Ramener ce trimestre dans l'application, clos, pour le consulter »)
>
> **Fenêtre** : « Emprunter Hiver 2026 ? » — « Hiver 2026 revient dans l'application tel qu'il a été archivé, clos : 130 étudiant·es, 394 copies.
> Rien d'autre n'est touché : les autres trimestres, les cours et les réglages restent tels quels. » — boutons « Annuler » / « Emprunter »
>
> **Bilan** : « Trimestre emprunté » — « Hiver 2026 est revenu, clos. Tu le trouves dans la bibliothèque des trimestres. » puis, selon le cas : « 394 copies revenues » ; « 2 copies déjà là » ; « 1 copie d'un·e étudiant·e supprimé·e, laissée dans l'archive » ; « 1 fiche sans copie dans l'archive »
>
> **Refus — déjà là** : « Trimestre non emprunté » — « Hiver 2026 est déjà dans l'application. Rien n'a été écrit. »
>
> **Refus — débris** : « Des données de Hiver 2026 sont déjà dans l'application, sans qu'il soit dans la bibliothèque des trimestres. Rien n'a été écrit. »
>
> **Refus — ne concorde pas** : « Une séance ou une copie de Hiver 2026 est déjà dans l'application et ne concorde pas avec l'archive. Rien n'a été écrit. »
>
> **Refus — archive** : « Cette archive n'est pas vérifiée dans ce navigateur. Vérifie-la d'abord. » ; « Cette archive ne concorde plus avec sa vérification. Rien n'a été écrit. Vérifie-la de nouveau. »
>
> **Échec en route** : « L'emprunt s'est arrêté en cours de route (une copie de l'archive ne concorde pas avec son empreinte | l'espace du navigateur a refusé une écriture). Ce qu'il avait écrit a été retiré : l'application est comme avant. »

**Le cas « déjà là », ma recommandation** : garder le **refus**, sans option « remplacer ». Le trimestre présent peut différer de l'archive, puisque l'activer réécrit ses clés (point 8). Le remplacer écraserait ce qui a été fait depuis, et ce serait le défaut du codex à part (mesure du 4 oct., § 2). Retouche proposée, pour dire quoi faire : « Hiver 2026 est déjà dans l'application : ouvre-le depuis la bibliothèque des trimestres. Rien n'a été écrit. »

⚠ Le bouton fait **28 px** de haut, comme « Vérifier » et « Faire revenir » sur la même ligne (*mesuré*). C'est sous les 32 px tenus par l'entrée du menu d'E1. Je l'ai laissé au style de ses voisins ; à juger par Cowork.

## 5 · Ce que j'ai supposé

- Une séance ou une copie déjà là et identique est laissée (§ 2 a).
- Une copie qui ne concorde pas est un **échec avec retrait**, pas un refus préalable : l'archive n'est lue qu'une fois (1,1 Go). Le résultat est le même, rien ne reste.
- Les copies d'un·e étudiant·e supprimé·e ne reviennent pas (la règle de « Faire revenir ») ; leurs fiches, si.
- Le nom du trimestre dans la fenêtre vient de son identifiant (« h2026 » → « Hiver 2026 ») : la liste des archives ne porte pas le nom.

## Trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| La garde #340 bloquait l'emprunt (*mesuré*) | **Corrigée** : elle cassait le parcours livré (§ 2 b) |
| « Ouvrir une archive… » charge l'archive entière : 1 242 Mo pour 1,15 Go (*mesuré*) | **Inscrite : #1025** (bloque l'emprunt d'une archive venue d'ailleurs sur iPad) |
| Activer un trimestre clos écrit dans ses clés (*mesuré*) | **Inscrite à #1024** (E3) |
| Les vignettes ne se refont pas à l'affichage (*mesuré*) | **Inscrite à #1023**, à trancher par Cowork |
| Cours absent : identifiant brut au menu (*mesuré*) | **Inscrite à #1023** ; non vécue |
| Une archive sans `manifeste-archives*.json` entre dans la liste sans son type (*mesuré* sur une archive fabriquée) : elle passerait pour celle d'un groupe | **Commenter et oublier** : toute archive d'E1 porte les deux fichiers |
| Le snapshot de clôture `snapshot_<trimestre>_<horodatage>` n'est pas emporté par E1 (*lu*) | **Commenter et oublier** : aucun lecteur dans `js/` |

## Méthode

- **Vitest complet** depuis `tests/` : 679 fichiers, 8 131 essais verts, aucune ligne « Errors » ni « Unhandled ». Neufs : `sentinelle-e2-emprunter-trimestre.test.js` (30 essais) et deux essais dans `sentinelle-namespace-productions-340.test.js`.
- **WebKit ciblé** : 10 essais verts en 1,3 min (E2, E1, A2, A3, #622, garde #340). La suite complète n'a pas été lancée.
- **Sondes jetables** (posées sous `tests/`, retirées dans la même commande) : points 1, 5, 7, 8 ; mémoire de l'emprunt ; mémoire d'« Ouvrir une archive… ». L'archive de 1,15 Go a été fabriquée par Python dans le bloc-notes de la session, au format d'E1.
- **Sécurité** : aucun `console.log`, aucun `innerHTML` neuf, aucun gestionnaire inline ; le bouton passe par `echapperHtml`. Le ZIP est lu par les sources de « Vérifier » (bornes par entrée, noms suspects refusés), comme au lot A2 ; `validerZipSecurite` ne s'y applique pas, par le même choix que A2 (le ZIP n'est jamais chargé en entier). Les valeurs sont écrites **telles quelles**, sans `assainirObjet` : c'est le niveau de confiance de la réouverture d'un codex (les données de l'usager, pas une bibliothèque reçue d'autrui, que `assainirObjet` filtre par schéma fermé) ; la défense à l'affichage reste `echapperHtml`. **À juger par Cowork.**
- **Format** documenté dans `docs/architecture/SPEC-RESERVE-V1.md`, § 16.
- **Pas vérifié** : l'iPad ; Safari ; le mode dossier (Chrome) en vrai ; une vraie archive de l'hiver 2026.
