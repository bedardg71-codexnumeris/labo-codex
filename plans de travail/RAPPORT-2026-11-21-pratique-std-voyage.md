# Rapport — lot pratique-std-voyage (21 nov. 2026)

Une pratique « Par standards » voyage avec ses cibles : par la bibliothèque des pratiques, et par l'import d'un trimestre à l'autre. Fiche #1164, cochée.

## En tête

**Aperçu** : https://deploy-preview-48--codexnumeris-051225.netlify.app (vérifié : il sert le code du lot, version 1.253.0).
**PR en brouillon, « NE PAS FUSIONNER »** : https://github.com/bedardg71-codexnumeris/labo-codex/pull/48
**Branche** : `lot/pratique-std-voyage`, partie de `main` à `16360f43c` (1.253.0), poussée. Ni fusion ni release. Arbre de travail : `../labo-codex-pratique-std-voyage` (l'arbre principal était occupé par `lot/gel-etape-7`).

### Ce que j'ai mesuré avant de construire

Mesuré sur `main`, dans le navigateur (Chrome), avec un trimestre fictif d'automne et un d'hiver.

| Chemin | Ensemble de cibles | Échelle | Niveau « sans donnée » |
|---|---|---|---|
| Garder dans la bibliothèque | Le geste n'existait pour aucune pratique. L'écriture sans appelant gardait le nom de l'ensemble, pas l'ensemble | Le nom seulement | Gardé (un code dans la pratique) |
| Utiliser depuis la bibliothèque | Rien n'arrivait : la pratique nommait un ensemble absent | Rien n'arrivait | Gardé |
| Importer depuis un autre trimestre | Resté dans le trimestre source | Restée dans la source ; l'avis « échelle à re-sélectionner » s'affichait | Gardé |
| Exporter pour partager, exporter JSON | Absents du fichier (lu sur la projection du partage et sur l'objet exporté) | Absente | Gardé |

Ce qu'affichait le tableau des cibles après l'import : « Les cibles de cette pratique sont introuvables dans ce trimestre. Rouvre la pratique dans l'assistant pour les dire. »

Autre mesure, non prévue au mandat : la liste blanche par laquelle toute pratique entre dans la bibliothèque retirait le réglage des jetons (mesuré sur les cinq modèles livrés). Une pratique qui refuse les jetons les aurait offerts à son retour.

### Mesuré, lu, non vu

**Mesuré** (une machine a répondu) :
- Vitest complet : 945 fichiers, 12 198 essais verts. Garde du lot 0 : 16 sur 16.
- Sentinelle du lot : 23 essais ; 17 mutations jouées une à une, toutes rouges (journal en fin de fichier). Trois essais étaient d'abord trop faibles (verts sous mutation) : durcis, puis rejoués.
- Banc dans le navigateur : 5 essais, verts sous Chrome et sous WebKit. Le trimestre source est comparé octet pour octet avant et après chaque geste.
- Bancs voisins sous WebKit, en trois passages : 54 + 34 + 52 essais verts. Un ancien essai affirmait « aucune rangée du trimestre ne porte de passage » : c'est ce que le lot remplace, il est réécrit.
- L'aperçu Netlify sert les fichiers du lot.

**Lu, pas joué** :
- La réception d'un partage par une ou un collègue : la projection à l'envoi est jugée, l'arrivée chez quelqu'un d'autre ne l'est pas.
- « Exporter les pratiques de ce trimestre » (le fichier groupé) : même fonction que l'export d'une pratique, pas de banc propre.

**Non vu** :
- Safari sur le Mac et sur l'iPad. WebKit de Playwright n'est pas Safari.
- Le verdict Playwright complet (environ 1 h 45) n'a pas été joué. Il est dû avant toute fusion.

### Ce que j'ai supposé

1. **Identité de l'ensemble copié** : à l'arrivée dans un trimestre, l'ensemble reçoit toujours une identité neuve ; les cibles et les critères gardent la leur. Deux pratiques ne partagent donc jamais un ensemble.
2. **Collision** : un ensemble déjà présent n'est jamais réécrit, même s'il porte l'identité de la source.
3. **Cours** : il reste nommé s'il existe encore dans la liste des cours ; sinon, aucun cours.
4. **Échelle** : absente du trimestre d'arrivée, elle est recréée sous son identité, sans son verrou. Présente, elle sert telle quelle et rien n'y est écrit, même si elle a été retouchée entre-temps.
5. **Où vit la copie** : dans la pratique elle-même, le temps du voyage ; elle est retirée à l'arrivée. Dans un trimestre, la seule source des cibles reste l'ensemble.
6. **Jetons** : le réglage des jetons d'une pratique gardée par son auteur·e la suit. C'est une décision que j'ai prise seul ; elle touche ce que la pratique fait à son retour.
7. **Instantané** : l'exemplaire de la bibliothèque est l'état des cibles au moment du geste. Les modifier ensuite dans le trimestre ne change pas l'exemplaire (même règle que les grilles).
8. **Pas de « Tout garder »** : un seul geste, par rangée, comme le dit le mandat.

### Où je m'écarte du mandat

- **Chrome, pas Chromium** : le Chromium de Playwright n'est pas installé sur ce Mac. J'ai utilisé Chrome installé (même moteur), par une configuration temporaire non versionnée.
- **Exports** : le mandat disait « mesure seulement, sauf si la correction tient en quelques lignes ». Elle tenait en une ligne par export : les trois (JSON d'une pratique, JSON groupé, partage) font partir les cibles.
- **Trouvailles non portées au BACKLOG** : aucune n'a été vécue par Grégoire, et la règle du 24 août les en écarte. Elles sont inscrites ci-dessous, avec leur disposition ; à Cowork de dire si l'une monte.
- **Rituel de fin de session** : non lancé (ni release ni fusion). L'audit du diff contre les règles de sécurité est fait par la sentinelle et par relecture.

## Complément du 21 nov., 22 h — l'arrivée par fichier (mandat de Cowork de 21 h, option A de Grégoire)

Le mandat de 21 h, écrit sur `main`, ne voyait pas cette branche. Comparé à elle, il laissait quatre écarts. Trois sont traités ici ; le quatrième (une fiche à un nouveau numéro) tombe : la fiche reste #1164.

### Mesuré avant de construire (WebKit, trimestres fictifs)

| Porte | Avant le complément |
|---|---|
| « Exporter les pratiques de ce trimestre », puis « Importer des pratiques » et « ← Utiliser dans ce trimestre » | La pratique arrivait avec ses cibles et son échelle. Aucun banc ne le gardait |
| « Exporter (JSON) » d'une pratique, puis « Importer des pratiques » | **Refusé : « Format invalide: pratiques ou configurations non trouvées ».** Ce fichier n'avait aucun lecteur. C'est la forme du fichier « PAN-STD H27 essai » de Grégoire |
| « Exporter pour partager » (.lcz), puis « Importer le partage d'une ou d'un collègue » et « Dupliquer » | **La pratique était écrite dans le trimestre sans que ses cibles soient déposées** : elle gardait son bagage, nommait un ensemble absent et une échelle à l'identité préfixée ; le tableau disait « cibles introuvables » |
| Un fichier d'avant le lot, sans cibles embarquées | Aucun mot à l'import |

La porte .lcz est celle que des collègues emploieront pour partager.

### Ce qui change

1. **Le partage .lcz dépose.** « Dupliquer » une pratique « Par standards » reçue passe par le propriétaire des cibles : l'ensemble est recréé sous une identité neuve, l'échelle est déposée, puis la pratique est écrite sans bagage.
2. **« Exporter (JSON) » a un lecteur** : « Importer des pratiques » accepte ce fichier d'une seule pratique.
3. **Un ancien fichier le dit** : à l'import, puis à « ← Utiliser dans ce trimestre », un avis nomme la pratique et dit qu'elle arrive sans ses cibles (texte V7). Rien n'est inventé : ni ensemble, ni échelle.
4. **L'échelle, tranchée** : une échelle identique déjà présente est réutilisée (même identité ou même nom, et les mêmes niveaux : codes, noms, valeurs ponctuelles, bornes). Si une échelle différente porte la même identité, elle n'est ni réécrite ni employée : l'échelle reçue arrive en copie, « (importée) », et la pratique la nomme. Avant, une échelle de même identité servait telle quelle, même retouchée : la note pouvait changer sans un mot. La supposition 4 ci-dessus est remplacée par cette règle.

Le geste du mandat, joué au banc : exporter, importer dans un autre trimestre, les cibles, leurs critères et l'échelle sont là, et la note se calcule (66,67 % pour deux niveaux inscrits sur des cibles de poids 1 et 2).

### Mesuré, lu, non vu (complément)

**Mesuré** : Vitest complet, 945 fichiers, 12 211 essais verts. Sentinelle du lot : 36 essais (13 neufs). Six mutations (BT16 à BT21), toutes rouges, journal en fin de sentinelle. Banc du lot sous WebKit : 10 essais (5 neufs). Bancs voisins sous WebKit, en trois passages : 20, 28 et 11 essais verts (partage, bibliothèque des pratiques, « Par standards », import entre trimestres, adoption de l'échelle).

**Lu, pas joué** : la fenêtre de confiance et de prévisualisation d'un .lcz (le banc intègre le paquet après validation, sans elle ; elle a son propre banc). `exporterConfigurationPratique` (bibliothèque) : même forme de fichier que « Exporter (JSON) », pas de banc propre.

**Non vu** : Safari (Mac, iPad) ; le verdict Playwright complet, dû avant fusion (`import-export.js` n'est pas touché ; `partage-section.js` l'est).

### Supposé (complément)

- L'avis V7 paraît aux deux moments (import, puis utilisation) : le second est celui où la pratique entre dans le trimestre.
- Le stock : une pratique déjà dupliquée d'un .lcz avant ce complément reste sans cibles et le dit au tableau ; rien n'est réparé d'office.
- Deux fonctions découpées pour tenir le cliquet de complexité (`pratiquesDuFichier`, `direArriveeSansCibles`, `deposerEchelle`).

### Fichiers du complément

`js/pratiques/ensembles-cibles.js` (l'échelle, l'avis), `js/pratiques-gestion.js` (le lecteur, l'avis), `js/partage-section.js` (« Dupliquer »), `index.html` (trois versions de cache), la sentinelle et le banc du lot, le fichier des textes (V7 à V9).

## Voir le voyage sur l'aperçu

Il faut un trimestre qui contient une pratique « Par standards », et un second trimestre.

1. Dans le premier trimestre, ouvre Conception, puis les pratiques de notation, puis « Consulter la bibliothèque ».
2. Dans la colonne « Dans ce trimestre », chaque pratique porte maintenant « Garder dans ma bibliothèque → ». Touche celui de ta pratique « Par standards ».
3. La rangée dit « ✓ Aussi dans ta bibliothèque ». La pratique paraît dans « Dans ta bibliothèque ».
4. Touche son nom dans « Dans ta bibliothèque » : l'aperçu montre son échelle et la ligne « Cibles », avec les étiquettes.
5. Change de trimestre, puis rouvre la bibliothèque des pratiques.
6. Dans « Dans ta bibliothèque », touche « ← Utiliser dans ce trimestre » sur ta pratique. Elle passe dans « Dans ce trimestre ».
7. Ouvre la pratique : sa fiche montre les cibles, leurs critères, leurs poids, l'échelle et le niveau « sans donnée ».
8. Désigne-la pour un groupe : le tableau des cibles montre une colonne par cible, toutes sans donnée. Aucun niveau inscrit de l'automne n'a suivi.

L'autre chemin, sans la bibliothèque : dans le second trimestre, au pied de « Dans ce trimestre », « Importer depuis un autre trimestre », choisis le premier, « Voir les pratiques », « Importer ». La pratique arrive avec ses cibles, sous le nom suivi de « (importée) ».

## Ce qui ne voyage jamais

Les niveaux inscrits, les annulations, les remarques, tout ce qui porte un·e étudiant·e. Seules les définitions passent : étiquettes, énoncés, critères et « essentiel », poids, « terminale », et l'échelle. Garder dans la bibliothèque n'enlève rien au trimestre ; importer n'écrit rien dans le trimestre source. La sentinelle le garde de trois façons : le contenu de la copie, les clés écrites à l'arrivée, et le texte du code du voyage.

## Tarir ou réparer

Le lot tarit la source : à partir de maintenant, une pratique arrive avec ses cibles. Il ne touche pas le stock : une pratique « Par standards » déjà importée dans un autre trimestre avant ce lot reste sans cibles, et le dit à l'écran. Rien n'est réparé d'office. Le réglage se fait par l'assistant, ou en l'important de nouveau.

## Trouvailles

| Trouvaille | Statut | Disposition |
|---|---|---|
| « Dupliquer » une pratique « Par standards » : la copie nomme le même ensemble que l'original. Modifier les cibles de l'une modifie l'autre | Lu dans le code, pas joué | Inscrire (issue 2). Hors du lot ; pratique à l'essai |
| Un fichier de pratiques importé, et un partage reçu, perdent le réglage des jetons | Mesuré pour la liste blanche des imports ; lu pour le partage | Inscrire (issue 2). Le corriger touche `import-export.js`, donc le verdict complet |
| Une pratique supprimée définitivement laisse son ensemble de cibles et ses niveaux inscrits dans le trimestre. La reprendre depuis la bibliothèque crée un ensemble neuf, sans ces niveaux | Lu | Commenté dans le code (issue 3). Aucune donnée n'est effacée ; c'est voulu |
| L'avis d'import dit « à re-sélectionner à l'édition » pour des cibles, qui se disent dans l'assistant | Vu en écrivant | Au fichier des textes (V4) |
| L'en-tête du BACKLOG dit « dernier ID : #1301 » ; #1302 existe | Lu | Rien d'écrit ; à corriger par qui tient le BACKLOG |

## Ce que le Mac devra passer sous Safari

Sur l'iPad d'abord (c'est là que le besoin a été vécu), puis sur Safari du Mac.

1. Le toucher sur « Garder dans ma bibliothèque » : un seul toucher suffit, la rangée passe à « ✓ Aussi dans ta bibliothèque ».
2. À 820 de large, les deux panneaux l'un sous l'autre, les flèches ↓ et ↑, des cibles tactiles assez grandes.
3. Après le geste, la fenêtre reste ouverte au même endroit du défilement.
4. « ← Utiliser dans ce trimestre » dans un autre trimestre, puis le tableau des cibles.
5. « Exporter (JSON) » d'une pratique « Par standards » : le fichier se télécharge sur l'iPad.
6. Clair et sombre.

Captures (Chrome, 1180 × 820 et 820 × 1180, clair et sombre) : `plans de travail/captures-2026-11-21-pratique-std-voyage/`.

## Fichiers

- `js/pratiques/ensembles-cibles.js` : emporter, déposer.
- `js/pratiques-gestion.js` : le bouton, le geste, les deux imports, les exports, l'aperçu.
- `js/pratiques-bibliotheque.js` : le réglage des jetons en source locale.
- `js/partage-format.js` : une ligne, la projection du partage.
- `tests/unit/sentinelle-pratique-std-voyage.test.js`, `tests/integration/pratique-std-voyage.spec.js`.
- `tests/integration/bibliotheque-deux-colonnes-1156.spec.js` : l'essai remplacé.
- `plans de travail/TEXTES-2026-11-21-pratique-std-voyage.md` : six mots proposés.
