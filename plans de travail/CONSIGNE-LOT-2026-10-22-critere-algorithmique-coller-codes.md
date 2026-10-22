# Consigne — étape 5 du critère algorithmique : coller sa liste de codes

> Écrite par Claude Code le jeudi 22 octobre 2026, sur mandat de Cowork, à partir de l'étape 5 de
> `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` et de la piste 1 de
> `MESURE-2026-10-21-critere-algorithmique.md`.
>
> **Décision (Cowork, 22 oct. 2026, relayée par Grégoire) : option A.** C'est un choix d'interface, qui ne
> touche pas la notation. Dans « Apporter mon matériel », la liste collée (code, nom, poids, commentaire) va
> dans un critère algorithmique existant qui n'a pas encore de codes ; il garde sa formule et sa
> pondération ; un critère qui a déjà des codes est refusé avec son motif ; rien n'est remplacé ni effacé.
> Le commentaire de chaque code est le texte que l'enseignant colle : il passe tel quel, sans réécriture,
> et il est échappé partout où il s'affiche.

## Ce que dit le plan

« Une liste (code, nom, poids, commentaire) collée d'un tableau et étiquetée comme une grille dans
« Apporter mon matériel ». »

## Mesuré dans le code (22 oct.)

- Un code est un **sous-critère** du critère algorithmique : `{ code, nom, ponderation, retroaction }`
  (`codes-annotation.js`, `_depuisSousCriteres`). `ponderation` est le poids d'un code posé (#1134) ;
  0 n'est pas un code. `retroaction`, le commentaire, est **lu par l'élève** dans son PDF.
- Un code doit tenir dans `[A-Za-z0-9_-]{1,20}` (`CODE_VALIDE`) ; un code en double : le premier gagne.
- Un critère algorithmique neuf naît par `avecProjectionNeuve` (`grilles.js:3206`) : projection neuve et
  marque `codesSousCriteresSeulement`.
- « Apporter mon matériel » n'écrit que des objets **neufs** (`materielCreation.ajouter` refuse un
  identifiant déjà pris) ; il ne sait pas aujourd'hui créer un critère algorithmique.

## Les trois options soumises (A retenue)

| Option | Ce que ça fait | Ce que ça engage |
|---|---|---|
| **A. Dans un critère algorithmique existant qui n'a pas encore de codes** (recommandée) | Après l'étiquetage, l'enseignant choisit le critère ; ses codes deviennent ses sous-critères. Un critère qui a déjà des codes est refusé, avec le motif. | Écrit dans une grille existante, sans rien remplacer. La formule et la pondération sont celles que l'enseignant a déjà réglées : aucun choix de notation. |
| B. Dans une grille neuve, avec un critère algorithmique neuf | Crée une grille d'un seul critère, ses codes dedans. | Il faut fixer la pondération et la formule de ce critère : c'est une question de notation, et les noms par défaut attendent l'étape 2. |
| C. Dans Grilles de critères, et non dans « Apporter mon matériel » | Un bouton « Coller ma liste de codes » près des sous-critères du critère. | S'écarte du plan approuvé. |

## Ce qui sera tranché sans Grégoire (une fois l'option choisie)

- Les quatre étiquettes de la palette (« Code », « Nom du code », « Poids », « Commentaire ») et leurs
  aides : textes provisoires de Claude Code, à valider comme ceux du 18 oct.
- Un poids absent vaut 1 (le poids d'un code du repli, « comme hier »). Un commentaire absent reste vide,
  rien n'est inventé.
- Les refus nomment la ligne : code illisible, code en double, poids négatif ou nul, plus de 30 codes (la borne des sous-critères au partage, `partage-schemas.js:349`).
- Le garde-fou du plan : un banc en rédaction et un banc sans texte (des calculs de chimie fictifs).

## Ce que « n'a pas encore de codes » veut dire (mesuré, tranché par Claude Code)

Un critère peut recevoir la liste s'il est **le premier critère algorithmique de sa grille** (seul celui-là
reçoit des codes, #1132), s'il porte **la marque d'un critère né depuis le 21 oct.** (`codesSousCriteresSeulement` :
ses codes sont ses sous-critères, et seulement eux) et s'il n'a **aucun sous-critère**. Sans la marque, un
critère sans sous-critère reçoit les dix codes du français écrit (`codes-annotation.js`, `listeCodes`) : il a
déjà des codes, il est refusé. Une liste se colle seule : mêlée à des étiquettes de grille, elle est refusée.
