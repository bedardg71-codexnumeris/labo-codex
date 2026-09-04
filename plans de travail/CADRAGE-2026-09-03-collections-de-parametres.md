# Cadrage — les collections de paramètres

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> **Sa formulation** : *« Je crois qu'il faudrait qu'il y ait dans le drop down "modèle de
> formule" un choix "EUF" qui serait par exemple un ensemble de paramètres configurés pour
> l'épreuve. On pourrait de la sorte créer des "collections de paramètres" qui seraient
> configurables par l'utilisateur. »*
>
> ⛔ **CE N'EST PAS UNE CONSIGNE.** Un point reste à trancher par Grégoire — il est nommé plus
> bas, et il est didactique, pas technique.
> ⚠ **REMESURE TOUT** (règle 1). Les lignes citées ont été relevées en lecture seule le
> 3 septembre au soir, application **1.114.0**, build `0903-1748`.

---

## ▣ CE QUE LA MESURE CORRIGE DANS LA DEMANDE

### Il y a DEUX menus sur un critère algorithmique, et l'EUF n'est pas dans celui qui est nommé

| Menu | Ce qu'il règle | Ses entrées | Où |
|---|---|---|---|
| **Modèle de formule** | **Combien** l'élève perd | pénalité normalisée · ratio mots par erreur · pénalité fixe par erreur | `js/evaluation-formules.js`, lignes 88, 114, 147 |
| **Modèle de projection** | **Où** l'élève se situe | **Norme externe (épreuve uniforme)** · Aucune projection | `js/evaluation-projection.js`, lignes 226, 231 |

⛔ **NE PAS METTRE « EUF » DANS LE MENU DES FORMULES.** Le module dit pourquoi, en toutes
lettres (`evaluation-projection.js`, lignes 17-26) : en 601-101 l'élève est **noté** sur une base
de **600 mots** et **situé** face à **900**. Deux normes, deux menus. Les fondre, c'est refaire
le défaut que le chantier de septembre vient de défaire.
⮕ **Le choix « EUF » demandé EXISTE DÉJÀ** — il s'appelle « Norme externe (épreuve uniforme) »,
et c'est lui que Grégoire voyait à l'écran sur sa capture.

### Les paliers ne sont plus écrits en dur

▣ **Mesuré** : `critere.paliersProjection` est un champ des données ; le nom du service d'aide est
un **paramètre** (`nomServiceAide`, ligne 209), posé dans le texte par un jeton `{service}`.
C'est pourquoi « Ce que l'élève lit » et « Phrase de recommandation » sont **éditables** sur sa
capture. Les valeurs de l'EUF sont les **défauts du modèle**, pas du code figé.
⚠ **Le motif d'origine est le sien** : l'application disait à des élèves de s'inscrire à un
service disparu (« CAF » devenu « Passerelle + »).

---

## ⏳ CE QUI MANQUE VRAIMENT — et c'est bien un mécanisme neuf

**Le registre des modèles est une liste FERMÉE, écrite dans le code** (`MODELES`, puis
`listerModeles`, `evaluation-projection.js` ligne 242). Un enseignant peut régler ses paliers sur
un critère — il ne peut **ni les nommer, ni les enregistrer, ni les retrouver** sur la grille
suivante. Chaque grille repart des défauts, et son réglage meurt avec le critère.

⮕ **Une collection de paramètres = un modèle défini par l'utilisateur, à côté des modèles
livrés.**

---

## ▣ LE PRÉCÉDENT — l'objet existe déjà quatre fois

`BibliothequeUI.repertoires.enregistrer(...)` est appelé pour **quatre** familles d'objets
nommés, rangeables en dossiers, partageables :

- `'grilles'` — `js/grilles.js:2285`
- `'echelles'` — `js/echelles.js:2486`
- `'pratiques'` — `js/pratiques-gestion.js:314`
- `'productions'` — `js/productions-bibliotheque-ui.js:166`

⮕ **Une collection de paramètres est une cinquième famille**, et elle n'invente aucun mécanisme :
l'échelle est **déjà** exactement cela — un jeu de valeurs nommé, rangé dans la bibliothèque,
appliqué à une grille.
▣ **C'est la quatrième fois en deux jours** que la chose demandée existe ailleurs sous un autre
nom (l'écran de personnalisation des codes, les bornes d'échelle, le seuil de réussite, ceci).

---

## ⚠ LE POINT À TRANCHER PAR GRÉGOIRE — copie ou lien

Son propre code porte les **deux** patrons, et ils s'opposent :

- **L'échelle est POINTÉE** : `ev.echelleId` — la corriger change ce qui est déjà évalué. C'est
  pourquoi la décision du 3 septembre au matin lui adjoint un **recalcul proposé** et un **refus
  si le trimestre est archivé**.
- **La cartouche est COPIÉE** : elle prend les critères de sa grille et vit sa vie
  (`js/grilles.js:2741-2745`).

**Ce que la projection produit n'est pas un niveau : c'est une PHRASE que l'élève a lue**, déjà
rendue dans un PDF.

↻ **Recommandation de Cowork : la COPIE à l'application.** Choisir une collection **verse ses
valeurs** dans le critère ; le critère reste la source unique du calcul et du texte. Motif : un
niveau se recalcule, et le recalcul se **voit** ; une phrase, elle, se **réécrit en silence**.
Corriger le nom du service en octobre ne doit pas changer ce qu'un élève a lu en septembre.

⛔ **Cowork ne tranche pas ceci** : ce sont les mots que ses élèves lisent.

↻ **TRANCHÉ PAR GRÉGOIRE le 4 septembre 2026 au matin — LA COPIE.** Ses mots : *« la copie — un
niveau se recalcule et le recalcul se voit »*. Une collection corrigée ne change pas ce qu'un élève
a déjà lu ; le critère reste la source unique du calcul et du texte. **Ce point est fermé ; ne le
redemande pas.**

---

## ⛔ HORS PÉRIMÈTRE — nommé pour que ça n'y entre pas

- **Toucher au menu des formules.** Le chantier est sur la **projection**.
- **Une collection qui porterait à la fois formule ET projection.** Un objet qui règle les deux
  normes d'un coup les refond — c'est le défaut d'origine, déguisé.
- **Migrer quoi que ce soit.** Un critère sans collection lit ses défauts, comme aujourd'hui.
  *Tarir n'est pas réparer.*
- **Le partage entre enseignants.** Il viendra du mécanisme de bibliothèque, pas de ce lot.

---

## Fini quand

Grégoire règle les paliers d'un critère pour l'EUF, **enregistre le jeu sous le nom « EUF »**,
crée une grille neuve, et **retrouve « EUF » dans le menu de projection**. Il le choisit : les
quatre paliers et le nom du service arrivent réglés. Il change ensuite un mot dans la
collection — **ce que l'élève a déjà lu ne bouge pas.**

---

## Ce que ce cadrage ne dit pas

⛔ **Aucun effort n'est estimé** — rien n'a été mesuré de ce côté.
⚠ **L'ordre est nommé ailleurs** : ce chantier vient **après** les trois lots des types de
grille (`PLAN-2026-09-03-les-trois-types-de-grille.md`). Une évaluation formative s'en vient, et
la communauté de pratique se réunit le **14 septembre**.
