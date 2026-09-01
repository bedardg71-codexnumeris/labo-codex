# Consigne — rendre l'application présentable aux nouveaux utilisateurs

> Écrite le **1er septembre 2026** depuis Cowork, avec Grégoire.
> **↻ RÉORDONNÉE le 1er septembre en après-midi** : le Lot A est fait, l'import
> passe en tête, et **#674 a changé de nature** — voir §3.
>
> **Lis d'abord `plans de travail/CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md`.**
> Il porte les mesures, et il porte aussi cinq marques ↻ où le code a corrigé le
> cadrage. Ne re-dérive pas ce qui y est mesuré ; ne fais pas confiance à ce qui
> ne l'est pas.

**Le critère de Grégoire, dans ses mots** : « je veux que l'application
fonctionne, qu'il n'y ait pas d'erreurs, et que rien ne soit codé en dur ».
*Codé en dur* = sa pratique d'enseignant de littérature gravée dans le code que
d'autres disciplines utiliseront.

**L'échéance, dans ses mots** : ses chroniques Labo sont publiées, de nouveaux
enseignants arrivent, et **« bientôt mes utilisateurs seront en mesure
d'importer du matériel pour l'évaluer »**. C'est cette phrase qui fixe l'ordre
ci-dessous.

⮕ **Une seule décision principale par session.**

---

## LA SÉQUENCE

| | Lot | Pourquoi ici |
|---|---|---|
| ✅ | **A — réconcilier le backlog** | FAIT le 1er sept. (`190473ad`) |
| **1** | **#612 — importer** | en amont de tout le reste |
| **2** | **Lot B — le mot « français »** | le critère de Grégoire à l'état pur |
| **3** | **#674 — le niveau manquant** | a changé de nature, voir §3 |
| **4** | **#651 — annoter sans palette** | son geste le plus fréquent |
| ⛔ | **#560 — portée des suppressions** | bloqué sur une décision de Grégoire |
| | **#668 lots 5b, 6, 3b** | 6 bloqué sur une décision ; 3b sans échéance |

---

## ✅ LOT A — FAIT

Commit `190473ad`. 16 cases retournées (pas 17 : **#599 n'est pas livré**, la
session l'a mesuré et a refusé de cocher sur la foi du cadrage — bon réflexe).
#427 dédoublonné, #675 / #676 alloués, **#440 fermé** (réglé par #529),
**#677 ouvert** pour son résidu réel, **#581 réécrit**, **#678 ouvert** pour les
`alert()`.

⚠ **Leçon inscrite ici pour qu'elle serve** : les cinq `alert()` que #540 nommait
sont **tous inatteignables** — deux fonctions sans déclencheur d'interface, et
une garde qui ne parle jamais. Le parcours réel en porte **51**, dans sept
fichiers. Un item écrit sur les cinq aurait annoncé cinq gênes inexistantes et
ignoré les quarante-six autres. **Mesurer l'atteignabilité avant d'annoncer un
périmètre** — un compte de littéraux n'est pas un compte de gênes.

---

## 1. #612 — IMPORTER, avant tout le reste

C'est le geste qui précède l'évaluation, et il est ouvert.

**Importer sans groupe-cours actif rend les fichiers invisibles.** Un DA inconnu
est stocké sans ligne dans la liste. T6.1, T6.3 et T6.6 sont livrées ; **T6.2,
T6.4, T6.5, T6.7 et T6.8 sont dues** — dont le refus explicite et le bandeau de
rattrapage.

⮕ C'est exactement l'erreur qu'un débutant fera en suivant la **chronique 3**
(importer des productions). Il en conclura que l'importation ne marche pas, et
il n'aura pas tort de le croire : rien ne lui dit ce qui s'est passé.

Détail au même endroit : **#598 volet B** — l'aperçu d'import ne montre jamais le
traitement appliqué ; ce qu'on regarde n'est pas ce qui est archivé. ⏳ Le réglage
de la balance des blancs attend que Grégoire ait regardé ses images.

**Fini quand** : importer sans groupe actif produit un refus qui DIT ce qui
manque et comment le corriger, et un DA inconnu laisse une trace visible.

---

## 2. LOT B — Le mot « français » imprimé dans le PDF d'un élève de chimie

Le défaut qui illustre le mieux le critère de Grégoire, et il n'était décrit
nulle part avant le 1er septembre.

**Sept littéraux, deux natures — ne pas les traiter pareil.**

**(1) Des en-têtes et libellés**, qui devraient porter le **nom du critère tel
qu'il est dans la grille** :
- `synthese-retroaction-rendu.js:510` — « **Français écrit** · 2 catégories les
  plus fréquentes » ⚠ **imprimé dans le PDF remis à l'élève** ;
- `evaluation-retroaction.js:478` — « Erreurs de français (N) » ;
- `synthese-retroaction-data.js:837` — « Français : N erreurs ».

⮕ Mécanique : le nom du critère est déjà dans la grille. Aucun registre à créer.

**(2) Des phrases engendrées**, qui demandent le **même geste que #667 et #668** —
un modèle de texte réglable depuis le gabarit, pas une chaîne dans le moteur :
- `evaluation-calcul.js:502` et `:680` — « **Ta rédaction contient N erreurs de
  français pour M mots.** » Sort pour TOUT critère algorithmique. ⚠ « rédaction »
  est aussi faux que « français » pour qui compte autre chose.
- `evaluation-retroaction.js:785` — « la qualité du français écrit est à
  travailler en priorité » ;
- `evaluation-retroaction.js:854` et `synthese-retroaction-data.js:728` —
  « Concentre-toi sur la qualité du français ».

⮕ Réutilise le patron de `js/evaluation-projection.js` : registre pur, testable
en Node, migration à la lecture reproduisant le texte d'aujourd'hui **au
caractère près**, schémas FERMÉS pour le transport. Ne réinvente rien.

⚠ **Leçon du 31 août** : changer une phrase engendrée ne change QUE les
évaluations à venir. Les anciennes portent leur texte gelé dans
`donneesAlgorithmiques[id].retroaction`. **Ne propose aucune régénération de
masse** : elle écraserait le paragraphe de catégorie dominante.

**Hors périmètre, même famille** : `js/pratiques/pratique-sommative.js:642-649`
sert « Services adaptés (SA) » et « Centre d'aide (CAF) » à tout le monde.

**Fini quand** : un critère algorithmique nommé autrement que « Français écrit »
produit un PDF où le mot « français » n'apparaît nulle part, sauf si
l'utilisateur l'a écrit lui-même.

---

## 3. #674 — REQUALIFIÉ : ce n'est plus de la prévention

**Ce qui a changé, et ce n'est pas le code.** Le 1er septembre, la sonde `diag674`
a rendu **zéro écart et zéro indécidable** sur le corpus d'a2026 de Grégoire.
D'où le classement « prévention ».

⮕ **Mais un défaut ne se mesure pas seulement au code : il se mesure à qui
l'utilise.** Un enseignant qui découvre l'interface oubliera de poser un niveau
bien plus souvent que Grégoire, qui corrige avec cette grille depuis un an.

Et la conséquence est mauvaise dans le pire sens. `_collecterCriteresSauv` ne
pousse un critère que `if (niveau)` : le critère oublié **disparaît de
`criteres[]`**, donc du PDF, et `calculerNote()` renormalise sur
`ponderationTotal` que rien ne compare à 100 %. **La note monte, en silence.**
L'enseignant remet le PDF sans rien voir.

Pour Grégoire, c'était improbable. Pour la cohorte, c'est probable.

**La forme à instruire — décision de Grégoire, déjà prise :**
persister **`ponderationTotal` à côté de `noteFinale`**, et non un état
« brouillon / conclue ». Motif : « brouillon vs conclue » ajoute un état de flux
de travail — un geste, un champ, une intention à deviner — pour une question qui
n'en demande pas. Ce qui manque, c'est que `noteFinale` circule **sans dire sur
quoi elle porte**. `ponderationTotal` est déjà calculée à chaque fois, puis
jetée. La persister laisse chaque consommateur décider : le PDF refuse, le
portfolio avertit. Aucun geste nouveau, valable rétroactivement.

**Et une réponse déjà donnée, à ne pas rouvrir** : un critère ne peut pas rester
délibérément non noté. « Un critère dont on ne tient pas compte est un critère
qu'on n'utilise pas — c'est une grille différente qu'il faut concevoir. » Une
couverture sous 100 % est donc **toujours** un défaut.

**Où poser le refus** : pas pendant la saisie — une évaluation en cours est
forcément incomplète et bloquer serait insupportable. La ligne passe entre
l'**état de travail** et le **livrable** : au moment de produire le PDF ou
d'arrêter la note finale, l'application refuse de conclure en **nommant** les
critères sans niveau. Les deux portes existent déjà et l'une a son patron de
refus (`_validerReferencesSauv`).

---

## 4. #651 — « annoter » ouvre sans palette

Retour terrain de Grégoire, avec capture. Cause lue, **jamais mesurée**, aucun
commit correctif. Depuis la Liste, en venant du mode Évaluer, la page
d'annotation s'ouvre sans aucune palette.

**Mesure avant de corriger.** C'est le geste le plus fréquent de son travail réel.

---

## ⛔ #560 résiduel — BLOQUÉ sur une décision de Grégoire

Le garde des modes est posé ; la **portée** des suppressions ne l'est pas.
Supprimer un fichier ou vider la corbeille emporte **toutes** les évaluations du
couple (DA, production) : les originales, les reprises, et l'évaluation active
d'un fichier réimporté.

**Ne code rien ici.** Pose-lui la question : que doit emporter la suppression
d'un fichier ? Règle métier d'évaluation, pas choix technique.

---

## #668 — ce qu'il en reste

Lots 0 à 4 livrés, #669 compris. Restent **5b** (sentinelles du branchement) et
**6** (le bloc dans le PDF), ce dernier ⛔ **bloqué** sur la décision du doublon —
§3 Lot 6 de `plans de travail/CONSIGNE-projection-euf-parametrable.md`. Le
**Lot 3b** (repli des paliers) est du confort, sans échéance.

---

## CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

- La **règle métier de #560**.
- Les **portes terrain** jamais relevées : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- Le **nom du service d'aide** pendant la transition CAF → Passerelle +.
- Le facteur de normalisation **500 → 600** sur *Grille-1 FR-ALGO seul A26*,
  ⚠ entre deux évaluations, jamais au milieu d'une correction.

---

## CE QUI N'EST PAS DANS CE CHANTIER

- **Le premier lancement à froid** (compte neuf, écrans vides). Grégoire juge ce
  volet couvert par les chroniques Labo, le système d'aide, l'accompagnement et
  les données de démonstration. **C'est sa décision** — pas un oubli.
- **Les notes d'A2025 et d'H2026.** Décision pédagogique définitive : on n'y
  revient pas. N'inscris aucun item qui y invite.
- **#678 au-delà de son périmètre utile.** Le parcours réel porte 51 `alert()`,
  mais la question n'est pas « lesquelles sont atteignables » — c'est
  **« lesquelles se déclenchent sur les trois parcours des chroniques Labo »** :
  (1) trimestre, groupe-cours, présences · (2) grilles, échelles, cartouches ·
  (3) importer des productions. Le reste attend.
- **La dette invisible à l'usage** — #522/#599, #520, #596, #585 à #592, #616 à
  #618, #624, #627 à #629, #656 à #664. Réelle, sans échéance, et aucun nouvel
  utilisateur ne la rencontrera.
