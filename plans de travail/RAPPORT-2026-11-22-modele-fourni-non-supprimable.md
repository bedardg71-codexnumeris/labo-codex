# Rapport – Un modèle fourni avec l'application ne s'offre plus à la suppression (bibliothèque des pratiques)

> **Relais (22 nov. 2026).** Branche `lot/modele-fourni-non-supprimable`, partie de `main` à `78e95229` (1.254.0),
> poussée ; **aucune fusion**, rien en ligne, version et Nouvelles intouchées (consigne : elles se régleront à la mise
> en ligne). **Session** : Claude Code dans un conteneur cloud Linux. **WebKit n'y existe pas** : le geste est rejoué
> et le banc lancé sous Chromium ; le verdict WebKit complet reste dû au Mac.
> **Fait** : la mesure (lecture de Cowork confirmée, copies qui peuvent différer, les quatre autres bibliothèques) ; le
> correctif pour un modèle fourni intact (rangée, ⋮, bloc des doublons, garde de la fonction) ; un banc d'intégration
> (6 essais) et une sentinelle unitaire (4 essais), break-tests faits.
> **Reste** : le feu vert de Grégoire sur les mots « fourni avec l'application » (§ 3.1) ; sa décision sur la copie qui
> diffère (§ 3.2, proposition non posée) ; le verdict WebKit sur le Mac.

## 1. Ce qu'on voit maintenant, en gestes

Conception › Pratiques › bibliothèque, colonne « Dans ta bibliothèque », ligne « Modèle sommatif » :

- La ligne dit **« Sommative · fourni avec l'application »** (avant : « Sommative · par Gabarit Labo Codex », suivie
  de la puce #rature). Le bouton « ← Utiliser dans ce trimestre » reste.
- **Plus de ⋮** sur cette ligne : il ne contenait que « Supprimer de ma bibliothèque ». S'il existe des dossiers, le ⋮
  revient avec ses seuls « Classer dans : … », sans « Supprimer ».
- **Le bloc « Homonymes » ne met plus en regard** la pratique « Modèle sommatif » du trimestre et le modèle fourni.
  Si c'était le seul groupe, le bandeau entier disparaît, et la puce #rature avec lui.
- Les quatre autres modèles fournis (Modèle de base, Modèle simple, N meilleures évaluations, N plus récentes) suivent
  la même règle.

Ce qui ne change pas : une pratique qui t'appartient garde « Supprimer de ma bibliothèque » et sa suppression ; deux
pratiques de même nom dans ce trimestre forment toujours un groupe, avec leurs gestes ; une copie du modèle qui
**diffère** de lui garde le comportement d'avant (§ 2.2 et 3.2).

## 2. Ce que la mesure a montré

### 2.1 La lecture de Cowork, rejouée (Chromium, pas WebKit)

**Confirmée.** Décor : la démonstration, une copie de « Modèle sommatif » dans `bibliothequePratiques` (même id que le
modèle, `SOM-litterature`), une pratique « Modèle sommatif » sans parenté dans le trimestre. Par le ⋮ comme par
« Homonymes » : la fenêtre du codex, puis « Supprimer définitivement… Cette action est irréversible. » ; après
confirmation, `bibliothequePratiques` est vide, et la ligne est toujours là — le modèle reprend sa place à la lecture
(`obtenirToutesLesPratiquesBibliotheque`). Le bandeau ne perd que « modifié le 2026-10-01 ».

- **Fait établi** : les deux avertissements prouvent qu'une copie portant l'id du modèle existe dans ta bibliothèque.
  Sans copie, le geste n'affiche qu'une notification (« Gabarit prédéfini… »), sans question.
- **Écart avec le récit, non résolu** : dans le rejeu, un SECOND geste sur la même ligne ne repose plus les deux
  questions (la copie est partie) ; il affiche cette notification. Si tu as vu les deux questions à chaque geste,
  quelque chose a recréé la copie entre deux gestes. Je ne peux pas le mesurer sans tes données.

### 2.2 La copie peut-elle différer du modèle ? Oui, de deux façons

1. **Le modèle a changé depuis la copie**, sans que tu touches à rien. « Modèle sommatif » a changé au moins trois
   fois : la configuration de littérature retirée (#691), la pondération 20/20/30/30 devenue quatre parts égales
   (2 sept. 2026), le réglage des jetons ajouté (29 oct. 2026). Une copie d'avant l'une de ces dates diffère.
2. **Une copie modifiée.** « Utiliser dans ce trimestre » garde l'id du modèle ; modifiée dans le trimestre, exportée
   (« Exporter les pratiques de ce trimestre »), puis importée dans la bibliothèque, elle y entre sous le même id avec
   ses modifications (`confirmerImportPratiques` garde l'id). Une restauration du codex peut aussi ramener une copie
   ancienne. *(Lecture du code, pas rejouée.)*

Dans les deux cas, « Supprimer » a un effet réel : la copie part, et c'est le modèle actuel qui la remplace. Tu perds
ta version (tes modifications, ou l'ancienne version du modèle). **C'est le seul cas où le geste a un sens, et il est
laissé tel quel** (proposition au § 3.2).

⚠ **Conséquence à connaître** : je ne sais pas si ta copie est identique au modèle. Si elle date d'avant le 29 oct.,
elle n'a pas le réglage des jetons et elle diffère : ta ligne gardera alors « par Gabarit Labo Codex » et son
« Supprimer » après ce correctif. Ce sera visible au premier coup d'œil, et c'est le cas que règle le § 3.2.

**Règle retenue pour « identique »** (décision technique) : tous les champs comptent, sauf ceux de tenue (dates d'ajout
et de modification, auteur, licence, drapeau de gabarit). Un champ ajouté, retiré ou modifié fait une copie
différente. Dans le doute : « différente », donc le comportement d'avant.

### 2.3 Les autres bibliothèques — pas le même comportement (lecture du code, pas rejouée)

Seule la bibliothèque des pratiques fusionne ses modèles fournis **à la lecture**. Ailleurs :

- **Grilles** : les modèles fournis (`GABARIT_GRILLE_*`) sont semés en base dans la bibliothèque ; leur suppression pose
  une marque (`IDS_GABARITS_HARDCODES`, `marquerRessourceSupprimee`) qui empêche le retour. La suppression tient.
- **Échelles, cartouches** : même marque ; leurs modèles de départ (`ECHELLE_IDME_DEPART`, `CART_GENERIQUE`) sont semés
  dans le trimestre, pas dans la bibliothèque. Rien n'est réinjecté à la lecture. La suppression tient.
- **Tampons** : les tampons intégrés vivent dans la palette ; la bibliothèque ne contient que ce que tu y as gardé, et
  la suppression tient.

Aucune n'est corrigée dans ce mandat ; aucune ne montre le symptôme.

## 3. Les mots proposés

### 3.1 Posés sur la branche, en attente de ton feu vert

- La ligne d'un modèle fourni intact : **« Sommative · fourni avec l'application »** (la famille, puis la mention, à la
  place de « par Gabarit Labo Codex » ou « par Demo Labo Codex »). Une seule constante à changer
  (`MENTION_MODELE_FOURNI`, js/pratiques-gestion.js) ; le banc suit.

Supposition nommée : la mention REMPLACE l'auteur plutôt que de s'y ajouter, pour ne pas allonger la ligne sur l'iPad.

### 3.2 Proposés seulement — la copie qui diffère du modèle (rien de posé)

- Dans le ⋮, à la place de « Supprimer de ma bibliothèque » : **« Revenir au modèle d'origine »**.
- La question : **« Remplacer ta version de « Modèle sommatif » par celle fournie avec l'application ? Ta version sera
  perdue. »**
- La ligne : **« Sommative · ta version du modèle fourni »**.
- Dans « Homonymes », le même « Revenir au modèle d'origine », sans bouton rouge.

Nuance : « tes modifications » serait faux quand l'écart vient d'un changement du modèle par l'application (§ 2.2,
cas 1) ; « ta version » couvre les deux cas.

## 4. Source et stock

Le correctif tarit le geste, il ne touche aucune donnée. **Le stock reste et c'est assumé** : les copies identiques
déjà écrites chez les gens restent dans leur bibliothèque, inoffensives (elles s'affichent à la place du modèle, avec le
même contenu). Elles redeviendront « différentes » le jour où le modèle changera encore : « Supprimer » reviendrait
alors sur elles, ce qui est cohérent avec le § 3.2.

## 5. Tests

**Lancé ici :**

- **Vitest, suite entière** (depuis `tests/`) : verte au hook pre-push du commit `a4a0f627`. Deux sentinelles avaient
  d'abord rougi et ont dicté la forme du code, sans qu'on les touche : `sentinelle-291-detecteurs-retires` (l'appel
  `reunirSources(…), 'nom')` sans parenthèse interne : la liste filtrée passe par une variable) et
  `sentinelle-contenir-complexite` (`supprimerPratiqueDeBibliothequePartagee` montait de 14 à 16 : la garde passe par
  `estFourniIntact`, elle reste à 15).
- **Neuf** : `tests/unit/sentinelle-modele-fourni-intact.test.js` (4 essais) ;
  `tests/integration/modele-fourni-non-supprimable.spec.js` (6 essais, verts sous **Chromium**).
- **Mis à jour** : `bibliotheque-deux-colonnes-1156.spec.js`, deux essais qui supposaient l'ancien comportement
  (« Sommative · par … » sur un modèle fourni ; le ⋮ de la bibliothèque éprouvé sur « Modèle simple », un modèle fourni,
  désormais sur une pratique fictive à soi). Les six essais « pratiques » du fichier passent sous Chromium.
- **Bancs voisins** (16 fichiers qui touchent la bibliothèque des pratiques ou ses modèles, Chromium) : 121 passés,
  9 échoués, 7 sautés. Les 2 de #1156 sont ceux mis à jour ci-dessus. Les 7 autres (`pratique-std-voyage`,
  `vue-simple-modeles-actuels-epingles`) **rougissent aussi sur `main` à `78e95229`**, rejoués dans une copie à part :
  5 échecs, et `pratique-std-voyage` change d'essais rouges d'une passe à l'autre (le 203 dans les trois passes). Ils ne
  touchent ni la ligne des modèles fournis ni le bloc des doublons. Le verdict WebKit de la 1.254.0 était vert : je les
  tiens pour une instabilité de Chromium, sans l'avoir prouvé.

**Break-tests** (chaque mutation posée, l'essai rougit, l'original remis) :

| Mutation | Rougit |
|---|---|
| « Supprimer » toujours offert dans le ⋮ | intégration 1, 2, 3 |
| filtre des doublons retiré | intégration 1, 2, 4 |
| la fonction accepte la copie identique | intégration 1 |
| filtre des doublons posé aussi côté trimestre | intégration 6 |
| la ligne garde l'auteur | intégration 1, 2, 4 |
| `configuration` comptée parmi la tenue | unitaire 3 |
| seules les clés du modèle comparées (un champ ajouté passe) | unitaire 3 |
| clés non triées avant comparaison | unitaire 2 |
| `jetons` compté parmi la tenue | unitaire 3 |
| l'auteur et la licence comptent | unitaire 2 |

**Pas lancé ici, et pas prétendu :**

- **WebKit** : absent du conteneur. Le verdict complet sous WebKit se prend sur le Mac.
- Le banc d'intégration n'a jamais tourné sous WebKit : à inclure dans ce verdict.
- **Tes données réelles** : je ne sais pas si ta copie de « Modèle sommatif » est identique au modèle (§ 2.2). Ce
  correctif n'écrit rien : pas de porte terrain (règle 2 du skill `portes-terrain`), mais c'est ce que tu verras en
  ouvrant la bibliothèque.

## 6. Ce qui reste hors du lot

- **Numéro de suivi** : aucun numéro pris dans `SUIVI-BUGS.md` ni `BACKLOG.md`. Décision : il se prendra à la fusion,
  comme la version et les Nouvelles, pour éviter qu'une autre branche prenne le même (incident du 8 août).
- **Trouvaille, issue 3 (commentée et oubliée)** : si deux copies portent le même id que le modèle (une collision), la
  garde de la fonction ne lit que la première. Le bandeau des doublons signale déjà une collision d'identifiant.
