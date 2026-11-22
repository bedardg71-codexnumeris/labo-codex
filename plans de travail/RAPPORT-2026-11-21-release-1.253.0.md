# Rapport – release 1.253.0 : « Par standards » en ligne, à l'essai, vue simple comprise

> **Relais (21 nov. 2026, 18 h 30, Claude Code sur le Mac).** Mandat de Cowork du 21 nov. (décisions de Grégoire : 13 h 53,
> 14 h 17, 14 h 19). **1.253.0, build `1121-1619`, en ligne à 18 h 15 min 56 s** (heure de l'Est), commit `ca76685c2`,
> déploiement Netlify `6b022617`. `main` = la branche `lot/moteur-cibles-3-4-retenu-note`, en avance rapide. Travail fait
> dans `../labo-codex-par-standards-release` ; verdict pris dans `../labo-codex-fusion`.
> **Reste** : l'essai de Grégoire sur la version en ligne, puis celui des trois enseignant·es ; la relecture des textes
> (trois fichiers `TEXTES-2026-11-21-par-standards-*`) ; Safari à la main et l'iPad au doigt ; les trois mesures du § 4,
> chacune avec sa disposition.

## 1. Mesuré, lu, non vu

**Mesuré** (une commande l'a rendu, sur le Mac, sous WebKit quand c'est un écran) :

- **Verdict WebKit complet sur le commit de release `ca76685c2`** : 40 demi-morceaux un par un, de 16 h 21 à 18 h 13, sur
  secteur, sous les gardes de l'outil (charge ≤ 6, mémoire libre ≥ 60 %, aucun reste), sans les abaisser. Safari, Chrome
  et l'app Claude étaient fermés (0 processus chacun, mesuré avant le lancement). **Jeton code 0 : 1 804 essais, 1 781
  verts, 23 au second essai, 0 rouge, 68 sautés.** Mémoire libre 69 à 79 %, passage le plus long 356 s. Aucun des 23
  n'est un banc de « Par standards » ni de la vue simple.
- **Vitest complet** : 944 fichiers, 12 175 verts. **La garde du lot 0 : 16 sur 16** (aucune note d'une autre pratique
  ne bouge).
- **Les écrans neufs, vus pour la première fois sous WebKit** : `vue-simple.spec.js` 52 sur 52 ; lots 2, 3 et 4 et le
  tableau de notation, 35 verts (10 sautés : des captures à la demande).
- **Les bancs du module avant le verdict** : 38 specs, 230 essais, verts ; 2 au second essai (en-tête, #868), hors du lot.
- **L'étiquette « À l'essai »** aux trois endroits, constante allumée puis éteinte en mémoire ; contraste du texte sur son
  fond, clair et sombre : 7,30 et 5,20 (carte de la vue simple, cartes de l'assistant), 5,71 et 6,76 (en-tête de la
  fiche). Break-tests S1 à S5, tous rouges comme attendu (journal dans la sentinelle).
- **Les écrans des deux modèles actuels de la vue simple** : identiques à ceux de la 1.252.0 (référence prise sur
  `0aee769a7` sous WebKit), cinq écrans par modèle, deux passages ; break-test rouge sur un mot changé.
- **Le déploiement** : `version.json` du permalien = `1.253.0` / `1121-1619` ; `index.html`, `styles.css`,
  `js/changelog-data.js`, `js/vue-simple.js`, `js/pratiques/ensembles-cibles.js` servis identiques au commit.
- Les trois mesures du § 4.

**Lu, pas joué** : le code de la vue simple que Cowork n'avait pas relu (`js/vue-simple.js`, `js/vue-simple-donnees.js`,
`js/tableau-cibles.js` depuis `4d653e9f`, 684 lignes de diff), en entier. Trois remarques, **inscrites, non corrigées**
(aucune ne casse le parcours livré) :

1. « Créer ma pratique » écrit l'échelle, puis les cibles, puis la pratique, en trois écritures. Si la deuxième ou la
   troisième échoue, une échelle (ou une échelle et un ensemble de cibles) reste au trimestre sans pratique. L'écran dit
   l'échec ; rien ne nettoie.
2. « Changer de modèle » est offert, en « Par standards », tant qu'aucun niveau n'est inscrit — même si le cours a déjà
   des productions (créées en vue étendue). Pour les deux autres modèles, la garde est « aucune production ».
3. La reprise d'une pratique laissée par « Changer de modèle » (`_choisirParStandards`) n'a pas le `try` des deux autres
   modèles : un échec d'écriture y serait muet.

**Non vu** : Safari à la main (le verdict est WebKit sans écran) ; l'iPad au doigt ; l'adresse `app.codexnumeris.org`
elle-même (derrière Cloudflare Access, non contournée : le permalien Netlify fait foi) ; aucune capture relue par
Cowork (huit captures de l'étiquette existent, dans le dossier temporaire de la session, non versionnées). Pas de
relecture croisée de cette session. **GitHub (WebKit Linux)** : le run du push, `44960901387`, tournait encore à
l'écriture de ce rapport ; les six push précédents de `main` y sont rouges (9 specs hors baseline sur la 1.252.0, dont
`parcours-9-notation-alternative` et `tableau-de-notation-1`, **vertes sur le Mac**). Non instruit ici.

## 2. Ce que j'ai supposé

- **Les trois endroits de l'étiquette en vue étendue sont en fait quatre cartes** : le mandat dit « là où l'on choisit la
  pratique (l'assistant de création) ». L'assistant l'offre à deux endroits (« Décrire ma pratique », puis « Je sais déjà
  ce que je veux ») : les deux portent la mention.
- **La constante vit dans `js/pratiques/ensembles-cibles.js`** (`A_L_ESSAI`), avec le mot. Pour retirer la mention :
  `true` devient `false`, et la sentinelle E1 ainsi que le banc `par-standards-a-l-essai.spec.js` se retirent avec elle.
- **Le style de l'étiquette en vue étendue** : texte et cadre à la couleur du texte secondaire du thème, jamais une
  couleur d'alerte ; la carte de la vue simple garde le sien, tel que capturé par le lot.
- **L'entrée de Nouvelles est verte** (une nouveauté) ; le titre et le texte sont ceux du mandat, typographie du fichier.
- **Les deux chemins de la troisième phrase sont ceux de l'écran** (« parmi les modèles » : l'écran « Ta pratique » dit
  « Choisis un modèle » ; « Conception › Pratiques » : l'onglet s'appelle « Pratiques »). Rien corrigé.
- **« Relecture »**, dans « commit, relecture, verdict, push » : la mienne, Cowork devant être fermé pour le verdict.
- **Fermer les trois applications** : je n'ai pas demandé, j'ai mesuré qu'elles l'étaient.

## 3. Où je m'écarte du mandat

- **Point 5, rien à retirer** : la sentinelle de `main` « rien de Par standards n'est en ligne » avait déjà été remplacée
  sur la branche (partie C de `sentinelle-sigles-sel-std-2026-11-21` : « CIB » n'est écrit qu'aux places internes ; A et
  B : SEL et STD lisent le registre). Vérifié, pas refait.
- **Deux builds pour une release** : `release.mjs minor` (1121-1617) a laissé deux jetons d'anti-cache à leur valeur de
  la 1.252 (`js/etats-vides.js`, `js/pratiques/pratique-registre.js` : la branche les portait un cran derrière `main`).
  La sentinelle anti-cache a rougi ; `release.mjs --build-only` (1121-1619) les a remontés, comme elle le prescrit.
- **Une commande du verdict est partie en arrière-plan** (deux appels enchaînés, plus de dix minutes), ce que la règle du
  13 nov. interdit. Rien d'autre n'a été lancé avant sa fin ; mémoire à 77 % au retour. Les 33 autres appels : un à la fois.
- **Une fonction sortie** : l'ajout dans l'en-tête de la fiche faisait monter une fonction figée
  (`remplirFormulairePratique`) ; il vit dans `afficherEssaiPratiqueMat`.
- **Un banc de plus que demandé** au point 1 : la sentinelle Vitest et un banc WebKit (la constante ne se prouve
  « une seule » que si on l'éteint à l'écran).

## 4. Les trois mesures, sans rien construire

### a. Source et stock : la clé `inscriptionsCibles`

Mesuré par un script jetable (non versionné) qui fait passer un codex entre le code de la 1.252.0 et celui de la 1.253.0,
sous WebKit, données fictives.

| Geste | Ce qui arrive |
|---|---|
| Codex de la 1.253 ouvert en 1.252 | **Rien n'est perdu** : les inscriptions, l'ensemble de cibles et la pratique sont en base, intacts. **Mais l'ancienne version ne sait pas les lire** : le tableau de notation montre la pratique sous le badge « SEL », avec « La note retient les 0 meilleures productions » et le tableau des productions ; la note dit « en attente de résultats » ; la fiche s'ouvre sans badge, avec « cibles » pour description et un menu de type vide. Aucune erreur en console. |
| Ce codex, réenregistré par la 1.252, rouvert en 1.253 | **Identique à la source** : les deux inscriptions, l'ensemble, la note (75 %), le tableau des cibles. |
| Codex de la 1.252 ouvert en 1.253 | Aucune clé de cibles n'apparaît ; les pratiques et les notes du groupe par sélection sont **identiques** avant et après. |

*Inféré, non mesuré* : en 1.252, enregistrer la fiche d'une pratique « Par standards » (menu de type vide) pourrait
réécrire son type. *Qui est exposé* : quelqu'un qui garde une ancienne version (copie hors ligne, cache) et y ouvre un
codex neuf.
**Disposition : inscrit et continuer.** Le stock n'est pas touché ; la source est neuve. Une garde « ce fichier vient
d'une version plus récente » serait le remède général ; à décider par Grégoire, hors de ce lot.

### b. Deux pratiques nommées « Par standards » dans un même trimestre

Mesuré : une ancienne (famille par sélection, née du modèle de la vue simple entre le 10 et le 21 nov.) sur un groupe,
une neuve (famille des cibles) sur un autre ; chaque écran balayé, dans les deux vues. Rien renommé.

| Écran | Ce qu'il montre | Les distingue ? |
|---|---|---|
| Vue simple, « Ta pratique » | ancienne : « Modèle Par sélection de productions · Par standards » ; neuve : « Modèle Par standards » | oui |
| Vue simple, tableau | « SEL Par standards » ; « STD Par standards » | oui, par le sigle |
| Vue simple, accueil | ancienne : « Par sélection de productions » sous la carte ; neuve : « Par standards » | oui |
| Vue étendue, tableau de notation | « SEL Par standards » ; « STD Par standards » | oui, par le sigle |
| Vue étendue, fiche | « SEL Par standards – Par sélection de productions… » ; « STD Par standards À l'essai – Par standards… » | oui |
| Labo › Comparateur (menus) | « SEL · Par standards » ; « STD · Par standards » | oui, par le sigle |
| Labo › Exploration (arbre) | « Par standards SEL » ; « Par standards STD » | oui, par le sigle |
| **Conception › Pratiques, le menu** | « Par standards (active) » et « Par standards » | **non** |
| **Cadre › Trimestre, le menu de la pratique du groupe** | « Par standards » deux fois | **non** |
| **Suivi › Profil, « Note provisoire de session »** | « Par standards », sans sigle | **non** |

**Disposition : remonte à Grégoire** (renommer le stock lui revient ; ajouter le sigle aux trois menus qui ne
distinguent pas est du code, à inscrire s'il le veut).

### c. Où « STD » s'affiche encore avec son ancien sens

Relevé par lecture (un sous-agent en lecture seule ; rien exécuté), liste exacte, sans correction :

| Fichier : ligne | Où on le voit | La phrase |
|---|---|---|
| `js/accompagnement-contenu-terme.js:214` | Glossaire, « Pratique de notation » | « …sommative (SOM), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). » |
| `js/accompagnement-contenu-terme.js:471` | Glossaire, le terme lui-même | « STD — PAN par standards », défini comme la sélection de productions |
| `js/accompagnement-contenu-terme.js:501` | Glossaire, « PAN » | « …les pratiques Standards (STD) et Spécifications (SPE). » |
| `js/accompagnement-contenu-popup.js:252` | Conception › Pratiques, fenêtre d'aide (i) | « PAN par standards (STD) — retient les meilleures démonstrations de compétence… » |
| `js/guides-pedagogiques.js:320` | Conception › Pratiques, guide « Modalités » | « PAN-Standards (code STD, aussi appelée Maîtrise) » |
| `js/gabarits-utils.js:201` | Réglages › Données › Maintenance, « Gestion avancée des ressources » | « [STD] Grille par objectifs » (dans la bibliothèque des grilles, le préfixe est retiré) |
| `docs/guide/03-glossaire.md:265, 281, 285` et `02-principes-et-politique.md:108` | Guide de relève, non relié à l'application | « STD : standards » |

À trancher, non classés : le gabarit une fois copié dans un trimestre (son nom brut paraîtrait dans les menus de
grilles : non vérifié) ; `design-system.html` (badges « SOM STD SPE DEN », page de référence sans lien depuis
l'application). Les Nouvelles ne contiennent aucun « STD ». Sens neuf correct : 7 lignes.
**Disposition : déjà inscrit** au relais de la 1.252.0 (cinq endroits) ; ce relevé y ajoute le gabarit et le guide de
relève. Ce sont des définitions à réécrire, des mots que les enseignant·es liront : à Grégoire.

## 5. Hors du mandat, laissé inscrit

L'Exploration qui décrit mal la pratique ; l'Aperçu et ses deux corrélations ; l'aide « Méthodes de calcul des indices »
qui dit « Sommative » ; la correction générale du « 0 % » de la liste des étudiant·es ; le geste « Renommer » en vue
simple ; la question Q6 des textes de la vue simple (les cartes de l'accueil, laissées telles quelles).

## 6. Les gestes de Grégoire, dans la version en ligne

**D'abord, la version** : au bas de la page, « 1.253.0 » ; dans les Nouvelles de l'accueil, « Une nouvelle pratique à
l'essai : « Par standards » ». Si le numéro est l'ancien, recharger une fois.

### En vue simple

| Geste | Ce que tu dois voir |
|---|---|
| Colle une liste de classe (ou prends un groupe sans pratique), puis ouvre « Ta pratique » | Trois cartes. La troisième, « Par standards », porte « À l'essai » sous son titre ; les deux autres sont celles d'hier |
| « Choisir ce modèle » sur « Par standards » | Un champ « Tes cibles, une par ligne » |
| Écris trois cibles, puis « Créer ma pratique » | La pratique : tes trois cibles, les cinq niveaux de départ, « La note » et comment elle se fait |
| Essaie sans cible, puis avec deux fois la même | Un refus qui dit pourquoi ; rien n'est créé |
| « Ouvrir le tableau » | Une rangée par étudiant·e, une colonne par cible, une colonne « Note » |
| Touche une case, choisis un niveau, « Inscrire » | La case montre le niveau. La note dit « En attente » et nomme les cibles qui n'ont encore rien |
| Inscris un niveau sur chaque cible d'un·e étudiant·e | Sa note paraît : la moyenne des niveaux retenus |
| Inscris un niveau plus bas sur une case déjà remplie | La case garde le meilleur niveau ; la note ne baisse pas |
| Rouvre cette case, « Annuler cette inscription », donne une raison | La dernière inscription part ; l'écran dit que rien ne s'efface |
| « Régler » sur les cibles : renomme-en une, ajoutes-en une, retires-en une qui porte un niveau | Une question avant le retrait, qui compte les inscriptions ; refusée, rien ne change |
| Ouvre « Note » | Une ligne par étudiant·e : la note, ou « En attente » et les cibles nommées |
| Sur un groupe qui avait déjà une pratique par sélection ou par spécifications | Ses écrans sont ceux d'hier, au mot près |

### En vue étendue

| Geste | Ce que tu dois voir |
|---|---|
| Conception › Pratiques, « + Nouvelle pratique », « Décrire ma pratique », « Suivant » | La carte « Un niveau pour chaque cible d'apprentissage (Par standards) » porte « À l'essai » ; aucune autre carte |
| Reviens, et prends « Je sais déjà ce que je veux » | La carte « Par standards » porte « À l'essai » ; « Par sélection de productions » et « PAN – Spécifications » sont là, sans mention |
| Choisis « Par standards » et va au bout : les cibles (étiquette, énoncé, critères, poids, « terminale »), l'échelle et son niveau « sans donnée », le récapitulatif, « Créer la pratique » | La pratique dans le menu ; sa fiche s'ouvre |
| Regarde l'en-tête de la fiche | Le badge « STD », le nom, puis « À l'essai », lisible sans survol, en clair comme en sombre |
| Ouvre la fiche d'une pratique par sélection | Badge « SEL », aucune mention « À l'essai » |
| Évaluation › Tableau, avec un groupe qui a cette pratique | Les cibles en colonnes ; « Inscrire pour une production » ; la colonne « Note » |
| Touche une case : un niveau ou « Aucun niveau » avec une remarque, des critères cochés, une date, « Inscrire » | La case montre le niveau retenu et le nombre d'inscriptions ; l'historique liste tout, les annulées barrées |
| Dans la fiche, allume le second seuil (il faut une cible « terminale ») | La note est plafonnée quand la moyenne des cibles terminales est sous le seuil, et le tableau le dit |
| Suivi › Profil d'un·e étudiant·e | Une section « Cibles » : la note et son récit, le niveau retenu de chaque cible |
| Bascule en vue simple sur ce groupe, puis reviens | Les poids, les énoncés, la cible terminale et le second seuil sont toujours là |
| Un groupe d'une autre pratique : compare ses notes à celles d'hier | Aucune ne bouge |

## 7. Complexité (par rapport à la 1.252.0)

Fonctions au-dessus de 15 : 434 → 434 ; somme 10 959 → 10 971 (Δ + 12) ; au-dessus de 30 : 77 → 76 ; fichiers de plus
de 1 000 lignes : 44 → 44 ; lignes de code 172 527 → 174 399.
