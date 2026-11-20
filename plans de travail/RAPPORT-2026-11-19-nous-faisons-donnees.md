# RAPPORT — `lot/nous-faisons-donnees` : « Mettre tes données à l'abri », « Nous faisons » (session de nuit A, 19 au 20 nov. 2026)

> **Dernier relais.** Branche `lot/nous-faisons-donnees`, partie de la tête de `origin/lot/nous-faisons-recevoir`
> (`60dd7b1d`, la branche « Nous faisons » la plus récente ; sa session avait poussé son rapport), puis `git merge --no-ff
> origin/main` : déjà à jour (`ade09e93`, la 1.250.0). **LIVRÉ** : les quatre bulles, mot pour mot, la bulle 3 dans ses
> cinq formes ; le parcours quitte la démo avant sa bulle 1 ; #1300 inscrit. **UNE DÉCISION ATTEND** (§ 8, 1) : la bulle 3,
> plus haute, ne tient plus dans la fenêtre à droite de l'aperçu ; cinq essais du banc d'origine le mesurent et restent
> rouges. Ni fusion, ni release, ni bump, ni changelog. **À annuler avant toute fusion** : `b6eac399` (« BRANCHE
> SEULEMENT » : ouvre ce parcours) et `4c36db45` (hérité). Les trois « Nous faisons » voyagent ensemble sur cette branche.
> Consigne : `plans de travail/CONSIGNE-2026-11-19-nous-faisons-donnees.md`. Aperçu : voir § 7.

## 0. La base et les commits

- Tête de `origin/lot/nous-faisons-recevoir` : `60dd7b1d`, rapport poussé (`plans de travail/RAPPORT-2026-11-19-nous-faisons-recevoir.md`).
- `git merge --no-ff origin/main` : « Already up to date » (`ade09e93`). Aucun conflit.
- `48ef3bb2` : la consigne, d'abord.
- **`b6eac399` : « BRANCHE SEULEMENT — ouvre « Mettre tes données à l'abri » »**, un commit à part : `PARCOURS_OUVERTS`
  devient `['decouvrir', 'classe', 'evaluer', 'recevoir', 'donnees']`. **À défaire par `git revert` avant toute fusion**,
  comme `4c36db45`.

## 1. Les trois mesures, avant tout code

Mesurées sous Chromium (un banc temporaire, non versionné ; (b) et (c) sont gardées dans le banc neuf, § 4).

**(a) Un parcours peut-il partir en vue simple ?** **Pas par l'application.** En vue simple, l'entrée « Assistance » du
menu et le lien « Assistance » de la carte « À propos » sont masqués (mesuré : 0 × 0, `display: none`) : aucune porte
visible ne lance un parcours. Par le code (`Assistance.lancerParcours('donnees')`), il part ; et les bulles 1, 2 et 4 y
seraient fausses (le bouton s'appelle « Sauvegarder », le menu n'offre que « Enregistrer dans un fichier » et « Ouvrir un
fichier… », mesuré). Non mesuré : basculer en vue simple pendant un parcours déjà lancé. Rien n'est inventé ; dit ici pour
que Cowork tranche s'il le faut.

**(b) Lancé pendant que la démo est active, avec un trimestre réel.** `lancer()` ne quittait pas la démo : la bulle 1
paraissait démo ouverte, et le codex écrit au bout du parcours **portait la démo**. Mesuré (le fichier lu) : `donnees.json`
contient `cours`, `enseignants`, `groupeCoursActif`, `infoCours`, `listeCours`, `trimestreActif`, `trimestres`,
`demo-actif`, `demo-etat-precedent`, `seancesCompletes_gc_GC_DEMO` avec les valeurs de la démo (`GC_DEMO`, `HOR_DEMO`,
l'enseignant de la démo ; 56 marques), le manifeste aussi. `_sansLeDemo` écarte les clés de la démo, pas les clés globales
qu'elle occupe tant qu'elle est ouverte. **Donc, décision de Cowork appliquée : `lancer()` quitte la démo avant la bulle 1**
(le mécanisme des parcours 2 et 4 : `desactiverModeDemo`, rien ne part si la démo reste ; `verifier` : rentrer dans la
démo en route ferme le parcours). Le défaut du codex lui-même, hors du parcours, est inscrit : **#1300** (issue 2).

**(c) Les boutons de la fin quand le parcours suivant (7, « Lire ta classe et intervenir ») est fermé.** Dans l'aperçu
(cette branche), rien d'ouvert ne suit « Mettre tes données à l'abri » : **la bulle 4 n'offre que « Terminer », et sa
consigne dit « Touche « Terminer » »**. Tous les parcours ouverts (les bancs), elle offre « Parcours suivant » et
« Terminer », de même poids. Effet de bord sur cette branche : « Recevoir » est maintenant suivi d'un parcours ouvert ; sa
bulle 9 y offre « Parcours suivant » (qui lance celui-ci).

## 2. Ce qui est livré

**`js/parcours-donnees.js`** : `texte` et `geste` remplacés par des lignes, avec les mécanismes du moteur et des deux lots
précédents :
- la confirmation (`confirmation(texte)`), seulement si l'étape d'avant a été faite pendant ce passage (le passage retient
  l'étape d'où il part, `depuisDuPassage`) ; après « Reprendre », rien à la bulle où l'on reprend ;
- aucune phrase du lieu (le relais) ;
- l'objectif et l'objectif atteint sur la définition ; la phrase de la poignée (le moteur) ;
- les explications en `note`, les gestes fléchés, la consigne en gras. Se grisent : « Touche « Codex »… » (le menu
  ouvert) ; « Touche « Mettre à jour » » (l'aperçu refermé sur une écriture en cours : **lu**, `tentativeEnCours()`) ; la
  consigne de chaque chemin (le codex écrit) ;
- la bulle 3 dans ses cinq formes (`lignesEtape3(chemin, copiesManquent)`), le chemin choisi à l'entrée de l'étape comme
  avant ; « Quand le menu affiche « Ton codex est à jour »… » (`TEXTE_3_FIN`) retiré, devenu la confirmation de la bulle 4 ;
- à la bulle 4, la fin du moteur à la place du seul « Terminer » primaire (le moteur ajoute « Parcours suivant » quand un
  parcours ouvert suit) ; `terminer()`, `sansSortie`, `surEchap` gardés ;
- `lancer()` quitte la démo (§ 1 b).
Titres, `avant`, `zones`, `contour`, `nommeLeContour`, `atteint`, la place de la bulle 3 : inchangés. Les anciens textes
(`TEXTE_1` à `TEXTE_4`, `FENETRE_1`, `FENETRE_2`, `PARTAGE`, `TELECHARGEMENT`, `texteEtape3`) sont retirés.

**Jetons `?v=`** : `js/parcours-donnees.js`, `js/assistance.js` → `20261119w` (une lettre que les deux lots précédents
n'emploient pas).

**#1300 inscrit** (§ 9).

## 3. Ce qui ne tient pas tout à fait (signalé, mots NON changés)

1. **La bulle 3 à 1180 × 820 (mesure demandée par le relais)** : elle ne tient pas. À droite de l'aperçu, l'étape la tient
   à 255 px de large ; avec la confirmation, quatre explications, deux gestes et l'explication finale, elle fait 804 px de
   haut dans une fenêtre de 820. Ce que fait le moteur, mesuré : il la marque « élargie » (sa forme de 520 px), mais la
   largeur posée par l'étape l'emporte ; ses lignes défilent (613 px de contenu pour 580 visibles) ; et son bas, la
   dernière ligne et « Quitter le parcours », passe sous le bas de l'écran (jusqu'à 896 px). Même chose à 1180 × 900 ; à
   1179 px, la bulle, à sa largeur ordinaire, ne tient plus au-dessus de « Mettre à jour ». Capture prise.
2. **L'ordre de la fin** (bulle 4) : comme aux parcours 2 et 4, le moteur pose « Pour revoir une étape… » d'abord.

## 4. Les bancs

**Vitest** (depuis `tests/`, suite complète) : 932 fichiers, 11 861 essais ; un rouge au premier passage,
`sentinelle-858-decoupe-qui-refuse` (ma sentinelle neuve découpait la consigne par `indexOf`) : passée par `tranche()`, et
ses break-tests rejoués (rouges). Vert ensuite ; le passage final est celui du hook de push.

**Sentinelles touchées.**
- `tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js` : le bloc des mots relit maintenant le RELAIS de la consigne
  du 19 nov. (chaque ligne dans son genre ; la bulle 3 chemin par chemin, la table des formes relue dans les phrases du
  relais qui la disent) ; la ligne du panneau, le refus, le haut du menu et le rappel restent confrontés à la consigne du
  8 nov. ; « aucun produit nommé » couvre les mots neufs.
- `tests/unit/_helpers/gestes-proposes-2026-11-11.js` : les quatre anciennes lignes du parcours 6 retirées.

**Bancs Playwright touchés.** `parcours-6-donnees-a-l-abri` : la bulle lue en lignes (ce qu'elle dit, à plat ; les
lignes et consignes de chaque chemin lues dans le code) ; « ta copie est faite » ne se dit plus à la bulle 3.

**Banc neuf** : `tests/integration/nous-faisons-donnees-2026-11-19.spec.js`, à 1180 × 820 et 820 × 1180 : chaque bulle
dans son genre ; la confirmation présente puis absente après « Quitter le parcours » et « Reprendre » ; la bulle 3 dans
ses cinq formes (fenêtre, fichier tenu, partage, téléchargement où « Touche « Mettre à jour » » se grise, copies
manquantes) ; la fin et la mesure (c) ; la mesure (b). **5 sur 5** (Chromium). La place de la bulle 3 n'y est pas jugée
(§ 3, 1 ; le banc d'origine la mesure).

**Playwright Chromium, fichiers liés** (7 fichiers : le parcours 6, le banc neuf, le registre, le refus du panneau, la vue
simple, les flèches, le moteur) : 88 essais, **77 verts, 7 rouges, 4 sautés** :
- `parcours-6-donnees-a-l-abri` ×5 (« de bout en bout » sombre et clair, « feuille de partage… », « 1180 × 820 »,
  « 1179 px ») : **causés par le lot, laissés rouges** : la bulle 3, plus haute, ne tient plus dans la fenêtre à droite de
  l'aperçu ni au-dessus de « Mettre à jour » (§ 3, 1 ; § 8, 1).
- `parcours-fleches` « la poignée » : intermittent (vert rejoué seul ; déjà intermittent au lot du parcours 2).
- `parcours-fleches` « sous le zoom au pincement » : rouge aussi sur la tête du lot du parcours 4, et une fois sur deux
  sur celle du lot du parcours 2 : intermittent, antérieur à ce lot.

## 5. Les break-tests

| Rupture | Banc | Résultat |
|---|---|---|
| la confirmation dite sans regarder le passage | banc neuf, de bout en bout | ROUGE (« repris : le menu avait été ouvert… ») |
| « Touche « Mettre à jour » » ne se grise plus | banc neuf, chemin par chemin | ROUGE |
| `lancer()` ne quitte plus la démo | banc neuf, mesure (b) | ROUGE |
| l'explication de la réécriture malgré des copies manquantes | banc neuf, chemin par chemin | ROUGE |
| « ou au rythme que tu choisis » → « ou à ton rythme » | sentinelle | ROUGE (1) |
| fichier tenu : la consigne devenue explication | sentinelle | ROUGE (1) |

## 6. Ce que j'ai supposé

1. **La confirmation suit le passage par son rang** (comme au parcours 4) : l'étape 3 avance sur un événement (le codex
   écrit) qu'aucun état ne retient d'un passage à l'autre.
2. **« Touche « Mettre à jour » » se grise** quand l'aperçu s'est refermé et qu'une écriture est en cours (la fenêtre du
   système ouverte, « Téléchargement lancé ») : le relais le permettait « si tu peux le lire » ; je le lis.
3. **La consigne de chaque chemin se grise quand le codex est écrit**, l'état qui fait avancer l'étape : elle ne se voit
   grisée qu'un instant.

## 7. L'aperçu

PR d'aperçu n° 39 (brouillon), « APERÇU, ne pas fusionner — « Mettre tes données à l'abri », Nous faisons : les quatre
bulles du 19 nov. » : https://github.com/bedardg71-codexnumeris/labo-codex/pull/39. Aperçu Netlify :
https://deploy-preview-39--codexnumeris-051225.netlify.app (l'adresse que Netlify donne aux PR de ce dépôt). Commit de tête
du lot : `1e1785c6`, puis ce rapport.

## 8. Ce qui attend une décision

1. **La bulle 3 ne tient plus dans la fenêtre** (§ 3, 1) : à droite de l'aperçu à partir de 1180 px (question 8, Cowork,
   9 nov.), elle dépasse le bas de l'écran ; au-dessous de 1180 px, elle ne tient plus au-dessus de « Mettre à jour ».
   Issues, aucune n'est à moi : (a) la laisser plus large (sa forme « élargie », au risque de couvrir l'aperçu) ; (b) une
   bulle plus courte (les mots de Grégoire) ; (c) une autre place.
2. **#1300** : le menu Codex écrit la démo dans le codex quand elle est ouverte (hors du parcours).
3. **La vue simple** (§ 1 a) : aucune porte n'y lance un parcours ; faut-il garder un parcours lancé quand on bascule en
   vue simple ? (Non mesuré.)
4. Les décisions des parcours 2 et 4 (leurs rapports, § 8) voyagent avec ce lot.

## 9. Trouvailles

- **#1300** (issue 2) : un codex mis à jour pendant la démo porte des clés globales de la démo (§ 1 b).
