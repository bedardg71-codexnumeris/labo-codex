# Cadrage — les CODES cessent d'être une liste de français, longue de dix

> ⚠⚠ **CE FICHIER S'APPELAIT « tampons-par-grille » ET C'ÉTAIT FAUX.** Renommé le 3 septembre
> au soir, sur correction de Grégoire. **Lire la nomenclature ci-dessous avant tout le reste.**

> **Écrit le 3 septembre 2026 en après-midi, par Cowork, avec Grégoire.**
> **Ce n'est PAS une consigne — rien n'est à coder.** C'est une demande de Grégoire, mise au
> net pendant qu'elle est fraîche, avec l'inventaire mesuré de l'existant.
> Application au moment de l'écriture : **1.113.0**, build `0903-0906`.
>
> ⚠ **REMESURE TOUT avant d'en tirer une consigne** (règle 1). Les lignes citées ont été
> relevées en lecture seule.

---

## ⛔ NOMENCLATURE — un CODE n'est pas un TAMPON, et ce cadrage a d'abord confondu les deux

▣ **La distinction, dans les mots de Grégoire (3 septembre, au soir) :**
> *« Les CODES sont des numéros auxquels on associe un type d'erreur ou un commentaire ; les
> TAMPONS servent à la rétroaction. **Le tampon commente le travail, tandis que le code
> identifie des éléments de ce travail, associés aux critères d'évaluation.** »*

**Ce sont deux palettes distinctes à l'écran, et deux chemins distincts dans le code :**

| | ce que c'est | où ça va |
|---|---|---|
| **CODES** | ① Syntaxe · ② Accord GV · ③ Accord PP… numérotés | **comptés**, rattachés aux critères, alimentent le calcul et la note |
| **TAMPONS** | Action · SOLO · Observations (Repérage, Rupture, Relation…) | **restitués** dans la synthèse, par famille — ne touchent ni la grille ni la note |

⮕ **CE CADRAGE NE PARLE QUE DES CODES.** ⛔ **Les tampons sont hors du chantier.**
⚠ **Une palette « tampons » existe déjà** (`#travaux-palette-tampons`,
`js/travaux-outils.js:470`) : employer le mot pour les codes ferait porter le même nom à deux
choses différentes.

### ↻ ET LA DESTINATION DES TAMPONS — tranchée le 3 septembre

▣ **Mesuré** : la synthèse PDF assemble les deux séparément. `construireStamps()`
(`js/synthese-retroaction-data.js`, §H) lit les annotations, les groupe par famille, va
chercher leur texte dans `obtenirRetroactionsObservations()` — **et ne touche jamais la
grille.** Le module l'annonce en tête : *« ne rien produire de nouveau »*.

↻ **DÉCISION** : *« Pour l'instant, tenons-nous à une première phase où les tampons ne sont que
RESTITUÉS dans le PDF de synthèse. »*
⛔ **La synthèse assemble, elle n'interprète pas.** Elle compte les occurrences par famille et
affiche leur texte ; elle ne conclut pas *« sept ruptures et deux relations, donc l'organisation
des idées est le problème »*.
⏳ **Porte laissée ouverte, et il a nommé qui la franchirait** : *« S'ils avaient à être
interprétés, ce serait peut-être la grille qui pourrait faire ce travail. »* ⚠ **Pas dans cette
phase, et pas sans lui.**

▣ **Son cadre général, à retenir** : *« La grille algorithmique se situe quelque part entre la
cartouche de rétroaction et une grille standard habituelle. »* — un hybride entre la grille
descriptive et la cartouche.

---

## La demande, dans ses mots

> **« Les tampons sont codés en dur dans la grille. J'aimerais qu'on puisse généraliser cet
> emploi. »** ⮕ Précisé, et arrêté : **« La liste des tampons devient une propriété de la
> grille — chaque enseignant définit ses codes, ses noms et leurs rétroactions, comme il
> définit déjà ses critères. »**

▣ **L'origine** : sa grille de français porte onze sous-critères dont les codes 0 à 10
reprennent, un par un, les dix codes d'erreurs de l'application. Un enseignant de philosophie
qui voudrait tamponner « thèse non dégagée » n'a aucun chemin.

---

## ⚠⚠ CE QUE LA MESURE A CORRIGÉ — le manque est BEAUCOUP plus petit qu'il n'en avait l'air

**La première lecture était fausse, et c'est Grégoire qui l'a corrigée avec une capture.**
Cowork avait conclu « rien n'est personnalisable ». ⮕ **Un écran de personnalisation existe
déjà**, dans **Annoter › palette des codes** : il permet de **renommer** chaque code, de
**changer sa couleur**, de **le réordonner par glissé**, et d'**écrire sa rétroaction**.
▣ **Ces textes sont déjà ceux de Grégoire, pas ceux du code.**

⮕ **C'est le même motif que le bouton « Décloner » cherché dans l'Inspecteur** : *quelque
chose existe, et personne ne va le chercher là où il est.* ⚠ **Troisième occurrence en deux
jours. Ça mérite d'être vu comme un motif, pas comme trois accidents.**

---

## L'inventaire mesuré — ce qui est fixe, et ce qui ne l'est pas

```bash
grep -n "Erreurs de français (codes 1-10)" js/travaux-outils.js     # → 275
grep -n "CODES_ERREURS_FR = \[" js/travaux-outils.js                # → 557
grep -roE "db\.(get|set)Sync\('errfr|'personnalisationErreursFr'|'ordreErreursFr'" js/
grep -rn "CODES_ERREURS_FR" js/ | wc -l                             # → 15
```

| ce qui existe | où | fixe ? |
|---|---|---|
| les dix tampons posables (icône ①–⑩, couleur) | `js/travaux-outils.js:276-286` | ⛔ **oui, en dur** |
| les dix noms pour la rétroaction | `js/travaux-outils.js:557` (`CODES_ERREURS_FR`) | ⛔ **oui, en dur** |
| **noms, couleurs, textes personnalisés** | clé `personnalisationErreursFr` | ✅ **non** |
| **l'ordre** | clé `ordreErreursFr` | ✅ **non** |
| le mode de synthèse PDF | clé `errfrModeSynthese` | ✅ non |
| **ajouter un onzième code** | — | ⛔ **impossible** — `grep` sur « ajouter un code » rend **0** |
| **retirer un code** | — | ⛔ **impossible** |

▣ **Quinze sites lisent `CODES_ERREURS_FR`**, dans trois fichiers : `travaux-outils.js` (10),
`synthese-retroaction-data.js` (3), `evaluation-retroaction.js` (2).

⚠ **Les trois clés de personnalisation ne passent PAS par `cle()`** : elles sont **globales à
tous les trimestres**, pas namespacées. ⮕ **C'est un fait à peser avant de choisir où la liste
doit vivre**, et non un défaut à corriger au passage.

---

## Donc ce qui manque vraiment — trois choses, pas une refonte

1. **Le nombre dix.** La liste ne peut ni grandir ni rétrécir.
2. **Le mot « français ».** Le titre de l'écran dit « Rétroactions — Erreurs de français », et
   les identifiants sont `errfr_1`…`errfr_10`. ⚠ **C'est l'énoncé 4 qui revient** : *une
   rétroaction ne parle que de la discipline de celui qui l'écrit.*
3. **Le rattachement.** La personnalisation est **globale à l'utilisateur** ; Grégoire la veut
   **par grille**. Un enseignant qui donne deux cours différents a aujourd'hui une seule liste.

---

## ⛔ LE POINT QUI DÉCIDE DE LA FORME — les tampons déjà posés

**Les copies corrigées portent des tampons `errfr_1`, `errfr_2`…** — mesuré :
`js/evaluation-retroaction.js:442` teste `f.type.indexOf('errfr_') === 0`, et l'export PDF les
nomme un par un (`js/travaux-export-pdf.js:581`).

⛔ **Si la liste devient une propriété de la grille, ces références doivent continuer de se
lire**, sinon une correction faite hier perd le nom de ses erreurs.

↻ **REMÈDE PROPOSÉ PAR COWORK, retenu par Grégoire le 3 septembre :**
> La grille porte sa liste. **Quand elle n'en porte pas, on retombe sur les dix codes
> actuels.** Les quinze sites ne lisent plus la constante directement mais *« la liste de
> cette grille »* ; la constante devient **le repli**, et un **modèle fourni** qu'une nouvelle
> grille adopte d'un clic.

▣ **Conséquence, et c'est elle qui rend le chantier acceptable** : une grille écrite avant ce
chantier ne déclare pas de liste, donc elle obtient les dix codes — **exactement comme
aujourd'hui**. ⮕ *On tarit la source sans toucher au stock.* **Rien à réparer dans ses données.**

---

## Ce qui reste ouvert — à trancher avec Grégoire, PAS à décider seul

### ↻ TRANCHÉ LE 3 SEPTEMBRE, après l'écriture de ce cadrage

**« Les tampons SONT les sous-critères. »** — décision de Grégoire, en réponse à une question
de Claude Code.

▣ **Ce que ça résout, et c'était le point 1 des questions ouvertes ci-dessous** : les éléments
observables ne sont pas une nouvelle structure. La grille portait **déjà** une liste par code —
les **sous-critères** de son critère algorithmique, `{code, nom, pondération, rétroaction}`,
que l'évaluation lit par le code (`js/evaluation-calcul.js`, mode « catégories »).
⮕ **Il y avait donc DEUX listes alignées à la main par leur numéro** : les dix tampons du code,
et les onze sous-critères de sa grille. **C'est cet alignement manuel qui disparaît.**

⚠ **Le risque nommé plus bas reste à surveiller** : les sous-critères ont maintenant deux
emplois — catégorie de code d'erreur ET tampon posable. **Un seul sens de lecture, une seule
source.** Si les deux divergent un jour, c'est ici qu'il faudra revenir.

▣ **L'identifiant `errfr_<code>` NE CHANGE PAS**, et c'est dit plutôt que renommé : il vit dans
les annotations déjà posées sur les copies. *Un identifiant n'est pas un libellé, et personne
ne le lit.*

---

## Ce qui reste à trancher — avec lui, PAS seul

1. **Par grille, ou par pratique ?** La demande dit « la grille ». Mais les tampons se posent
   dans **Annoter**, sur une copie, et une copie est liée à une **production**. ⚠ **Le chemin
   copie → production → grille est-il toujours vrai et unique ?** À mesurer avant de choisir.
2. **Que devient la personnalisation globale déjà faite ?** Les clés `personnalisationErreursFr`
   et `ordreErreursFr` portent le travail réel de Grégoire — noms courts, couleurs, textes.
   ⛔ **Y écrire ou les déplacer, c'est toucher ses données réelles.** Le plus sûr : les laisser
   comme repli global, et ne lire la liste de la grille que lorsqu'elle existe.
3. **L'icône au-delà de dix.** Les tampons portent ⓵–⓾, des caractères Unicode. ⚠ **La série
   s'arrête à ⑳** ; au-delà, il faut autre chose. **Combien de codes un enseignant peut-il
   déclarer ?** Une limite non dite se découvre au pire moment.
4. **Le nom des identifiants.** `errfr_1` dit « erreur de français » dans la donnée elle-même.
   ⛔ **Le renommer toucherait le stock.** ⮕ **Ne pas le renommer** : un identifiant n'est pas
   un libellé, et personne ne le lit. **Mais alors ne pas prétendre non plus que la discipline
   a disparu** — elle reste dans la donnée, et c'est acceptable si c'est dit.
5. **Le titre de l'écran.** « Rétroactions — Erreurs de français » → les mots sont à Grégoire.

---

## Ce que ce cadrage ne dit pas

⛔ **Aucune décision de faire ce chantier n'est prise**, et aucun effort n'a été mesuré.
⚠ **Il n'empêche aucun des huit énoncés** — ils sont tous parcourus depuis ce matin. Il traite
l'**adoption** : un enseignant hors français ne peut pas annoter avec ses propres codes.
⮕ **Sa place dans l'ordre appartient à Grégoire**, et le 14 septembre est un élément de son
jugement : c'est le premier écran qu'un collègue d'une autre discipline rencontrera s'il annote.
