# Demande de relecture – Le critère algorithmique, lot de mots

> Claude Code, 21 octobre 2026, 10 h 20. Consigne : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-mots.md` ; textes : `TEXTES-2026-10-21-critere-algorithmique.md`. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

**La liste du français écrit est celle de Grégoire.** « Partir de la liste du français écrit (codes 1 à 10) » crée les sous-critères 1 à 10 du critère « Français écrit » de la grille démo « Grille-5 FR-ALGO-20 H26 » : ids, codes, noms, pondérations et observations à l'identique, sans le code 0. Les onze sous-critères d'hier sont partis. La liste vit dans une seule constante, `LISTE_FRANCAIS_ECRIT` (`grilles.js`), figée ; chaque pression en pose une copie neuve. Je l'ai générée depuis le pack, pour qu'elle soit identique au caractère près.

**Le pack démo ne lit pas cette définition.** Il garde sa propre copie, pour deux raisons. D'abord, le pack est un littéral JSON chargé à la demande par `demo-namespace.js`. Le faire lire la constante changerait sa source, et lierait la donnée au code : une retouche future de la liste changerait en silence la grille démo, alors que la consigne la traite comme la grille d'un utilisateur. Ensuite, le pack porte aussi le code 0, que la liste n'a pas. L'égalité d'aujourd'hui est verrouillée par le banc (L.a, en Vitest et en WebKit).

**Les textes A1 à F1 sont posés mot pour mot.** Les apostrophes suivent la convention de chaque site :
- typographiques pour A1, A2 et A3, comme leurs entrées ;
- ASCII pour B1, B2 et B3, comme les autres bulles de l'évaluation ;
- ASCII dans la section 5c, comme le reste de l'onglet Aide.

C1 et C2 n'en ont pas. Pour D2, la section a une ligne par modèle, et une puce par ligne.

## Ce que j'ai supposé (section 5c)

- **J'ai gardé trois intertitres.** « Qu'est-ce qu'un critère algorithmique ? » et « Pourquoi des sous-critères ? » sont nommés par les textes. J'ai gardé aussi « Comment utiliser lors de l'évaluation » au-dessus de D6 et D7. D5 suit l'exemple de D4, sans intertitre.
- **D4 (l'exemple) et D8 (le conseil) sont dans des encadrés.** L'exemple est dans l'encadré bleu de l'ancien « Exemple concret ». Le conseil est dans un encadré « attention », avec sa première phrase en gras.
- **J'ai coupé l'exemple de l'« Astuce professionnelle ».** Il disait « 1=Syntaxe, 2=Subord., … 5=Hom., … 10=Autre », c'est-à-dire les codes de l'ancienne liste, qui serait devenue fausse. Il reste « Imprime une feuille de codes plastifiée pour référence rapide pendant la correction. » C'est un texte lu par l'enseignant, à trancher par Cowork : on peut le retirer en entier ou le garder ainsi.
- **Le mot « Navigation » reste en tête**, comme dans les autres sections.

## Le grep de ce qui part (avant → après)

| Chaîne | Avant | Après |
|---|---|---|
| « Méthodes quantitatives » | `grilles.js` | 0 |
| « Annexe de grammaire de ton manuel » | `grilles.js` (4 fois) | 0 |
| « Activer la catégorisation des erreurs » | `index.html` (5c) | 0 |
| « 3;3;1 » | `index.html` (5c) | 0 |
| « depuis l'origine pour le français écrit » | `evaluation-formules.js` | 0 |
| « nombre d'erreurs / nombre de mots × 100 » | `accompagnement-contenu-terme.js` | 0 |
| « Avantages pédagogiques » | `index.html` (5c) | 0 |

Les deux chaînes de `index.html` n'étaient pas dans `js/`. Le banc les cherche dans `js/` et dans la section 5c.

## Le stock

Une grille qui porte déjà des sous-critères les garde, textes compris : seul ce que crée le bouton change. **Rien ne change dans ce que lisent les élèves de Grégoire** : ses grilles portent déjà sa liste. La grille démo ne change pas à l'octet près.

## Ce que j'ai mesuré en chemin

- **Le lexique de l'onglet Aide** (`index.html`, l. 13974 environ) définit les sous-critères par une « pondération différenciée », avec un exemple. Ce texte est hors de la section 5c et de la consigne. C'est un texte lu par l'enseignant, à trancher par Cowork. *Inscrire et continuer* : je le signale ici, sans l'inscrire au BACKLOG (aucun symptôme vécu).
- **Le gabarit du critère** (capture `dix-sous-criteres-crees.png`) dit encore deux choses :
  - « Les sous-critères permettent de catégoriser les erreurs avec des pondérations différentes (ex: ponctuation = 0.5 point) » ;
  - « Lors de l'évaluation, tu saisiras le nombre d'erreurs et le nombre de mots de la rédaction ».

  La seconde nomme les données : c'est l'étape 2, exclue ici. *Inscrire et continuer*, au plan de l'étape 2.
- **La limite nommée de l'étape 0 est levée.** Le banc retirait la phrase « depuis l'origine » avant de chercher « français » dans le gabarit d'un critère de chimie. F1 l'ayant retirée, il lit maintenant le gabarit tel quel, et reste vert.

## Bancs

**Vitest**, `tests/unit/critere-algorithmique-mots.test.js`, 11 essais :
- T : chaque texte à son site, par sa chaîne exacte, et chaque chaîne du banc retrouvée dans le fichier réglé ;
- L : le bouton crée dix sous-critères, codes 1 à 10, égaux à ceux de la grille démo hors code 0. Chaque pression donne une copie neuve, et une seule définition de la liste existe dans `js/` hors du pack ;
- X : aucune des chaînes parties dans `js/` ni dans la section 5c.

**Break-tests** (code restauré, vérifié par `cmp`) :
- l'ancienne liste remise (`grilles.js` de HEAD) → 4 rouges ;
- B2 remis à l'ancien → 1 rouge ;
- « Avantages pédagogiques » remis dans la 5c → 1 rouge.

**WebKit**, `tests/integration/critere-algorithmique-mots.spec.js` :
- dans une grille neuve, le bouton donne les dix sous-critères de la démo, et Annoter les offre comme codes, avec leurs noms ;
- la section 5c s'affiche sans « Avantages pédagogiques », et sans défilement de côté à 820 px.

**Bancs mis à jour** :
- trois specs et l'étape 0, pour le compte (10 et non 11) et le libellé (« codes 1 à 10 ») ;
- le banc du barème, dont la parenthèse « algorithmique » des 20 oct. (A4, C1, C2) est désormais réglée par ce lot. Il vérifie encore le reste de ces textes mot pour mot.

**Ensemble** : Vitest complet vert, 794 fichiers et 9 352 essais. Les 29 specs WebKit d'aide, de Grilles, d'Annoter et des codes sont vertes : 85 essais.

**Anti-cache** : six jetons `?v=` changent, tous datés `20261020` avec une lettre neuve, jamais servie dans l'historique. La sentinelle anti-cache veut la date du build en cours (1020-1905), tant que la release n'est pas faite. Un premier essai en `20261021a` l'a fait rougir.

**`/fin-de-session`** a été lancé avant le commit, sans le verdict complet. L'audit statique du diff ne relève aucun motif, et aucune zone protégée n'est touchée. Le seul `waitForTimeout` des specs touchées est antérieur au lot (spec #957, l. 31).

## Captures

Dans `captures-2026-10-21-critere-algorithmique-mots/` :
- `aide-section-5c.png` : la section 5c ouverte, à 820 px ;
- `dix-sous-criteres-crees.png` : les dix sous-critères créés par le bouton.

## Ce que je demande à la relecture

1. Le pack, qui ne lit pas la définition (la raison est plus haut).
2. L'exemple coupé de l'« Astuce professionnelle ».
3. Les intertitres gardés dans la 5c.
