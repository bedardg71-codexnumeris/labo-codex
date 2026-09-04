# Cadrage — replier le gabarit du critère algorithmique

> **Écrit le 3 septembre 2026 au soir, par Cowork, à la demande de Grégoire.**
> **Sa formulation** : *« Il est vraiment très long avec ses critères, ses sous-critères, ses
> modèles de formule […] différentes sections qui pourraient être fermées par des accordéons pour
> limiter l'espace vertical et faciliter le repérage. Ces accordéons sont déjà utilisés dans
> l'écran Cadre, sont utilisés également dans la section d'aide. Ce sont des bandes bleues qui se
> plient et se déplient avec un triangle. »*
>
> ⛔ **CE N'EST PAS UNE CONSIGNE.** C'est le cadrage d'un chantier ; une consigne s'en écrit.
> ⚠ **REMESURE TOUT** (règle 1). Lignes relevées en lecture seule le 3 septembre au soir,
> application **1.114.0**, build `0903-1748`.

---

## ▣ CE QUI EXISTE DÉJÀ — rien à inventer

Le composant est là, et il est employé partout :

- **La bascule unique** : `toggleAccordeonV2`, `js/pratiques.js:2113`. Elle ajoute ou retire la
  classe `ferme` sur la carte ; **le CSS fait le reste** (`max-height`, `opacity`).
- **La délégation des clics** : `js/main.js:1253`. Son commentaire dit ce qu'elle a coûté et ce
  qu'elle a rapporté : *« remplace 78+ onclick inline »*. ⮕ **Aucun gestionnaire à écrire.**
- **Le balisage de référence**, relevé dans `index.html:6275` :

```html
<div class="carte accordeon" id="accordeon-gestion-trimestres">
    <div class="accordeon-header">
        <h3 class="carte-titre-bleu">
            <span class="accordeon-chevron">▶</span> Trimestre
        </h3>
    </div>
    <div class="accordeon-contenu">…</div>
</div>
```

▣ **Un accordéon fermé à l'ouverture porte `class="carte accordeon ferme"`** — `index.html:6491`,
`6766`, `7011` en donnent trois exemples en place.

---

## ⚠ DEUX OBSTACLES MESURÉS — le second est le vrai

### 1 · La bascule exige une CARTE

`toggleAccordeonV2` fait `headerElement.closest('.carte.accordeon')` (`pratiques.js:2114`). Le
gabarit de critère est rendu dans un `item-liste` (`grilles.js:3260`), **pas dans une carte**.
⮕ Posé tel quel, l'accordéon **ne s'ouvrirait pas** — et il échouerait **en silence** pour
l'utilisateur : la fonction n'écrit qu'une trace en console (`pratiques.js:2116`).

▣ **Remède** : chaque section repliable est une vraie `div.carte.accordeon`.
⛔ **NE PAS assouplir le sélecteur** pour accepter autre chose qu'une carte : il sert les
78 accordéons déjà en place. *Un correctif qui touche tout le monde pour servir un écran est un
mauvais échange.*

### 2 · Le gabarit se redessine ENTIÈREMENT à chaque frappe

Chaque handler de champ se termine par un redessin complet du bloc :

- `afficherCriteresTemp()` — fin de `modifierPalierProjectionTempHandler`, `grilles.js:5025`
- `afficherCriteresGrille(await obtenirGrilleParId(grilleId))` — fin de
  `modifierModeleProjectionGrilleHandler`, `grilles.js:5039`, et de
  `modifierParamProjectionGrilleHandler`, `grilles.js:5051`

⮕ **Un accordéon dont l'état vit dans le DOM se refermerait à chaque frappe.** L'enseignant
réglerait un palier et verrait sa section se replier sous ses doigts — pire que l'écran long
d'aujourd'hui, parce qu'il perdrait sa place.

▣ **Remède** : l'état ouvert/fermé vit **hors du DOM**, dans un objet en mémoire indexé par
critère et par section, relu à chaque redessin pour poser ou retirer `ferme`.
⛔ **PAS dans les données de la grille.** Un pli d'écran n'est pas une propriété de la grille : il
n'a rien à faire dans un fichier exporté, ni dans une grille partagée. **Il meurt avec la page,
et c'est bien.**

⚠ **Si ce point n'est pas dans la consigne, le défaut arrivera.** Il ne se verra ni aux tests ni
à la relecture : il ne se voit qu'en tapant dans un champ.

---

## ▣ CE QUI EST OUVERT, CE QUI EST FERMÉ — tranché par Grégoire le 3 septembre

**La règle, dans ses mots** : *« ouvert ce qui porte la note (le modèle de formule et ses
paramètres), fermé ce qui porte les mots (les énoncés, les paliers de projection, les codes) ».*
**Motif** : les mots se règlent une fois, la note se revérifie souvent.

| Section du gabarit | Où | À l'ouverture |
|---|---|---|
| **Le modèle de formule** et ses paramètres | `rendreBlocFormuleAlgo`, `grilles.js:3355` | **ouvert** — porte la note |
| **Les sous-critères** et leurs pondérations | dans le gabarit du critère | **ouvert** — portent la note |
| **Les énoncés de rétroaction** | `rendreBlocEnoncesAlgo`, `grilles.js:3451` | **fermé** — les mots |
| **La projection** : modèle, paramètres, paliers | `rendreBlocProjectionAlgo`, `grilles.js:3612` | **fermé** — les mots |
| **Les codes** : case d'activation, couleurs, rétroactions | `rendreActivationCodes`, `grilles.js:3542` et `rendreCouleurSousCritere`, `grilles.js:3577` | **fermé** — les mots |

### ⚠ UNE FRICTION À NOMMER — la ligne de partage traverse les sous-critères

Les sous-critères portent **à la fois** la note (leur pondération) **et** les mots (leur couleur,
leur rétroaction, leur rôle de code). La règle de Grégoire les coupe donc en deux au lieu de les
contourner.

↻ **Recommandation de Cowork** : au premier lot, **le bloc des sous-critères ne se replie pas**.
Seules les **couleurs et les rétroactions** entrent dans l'accordéon des codes ; la ligne
nom + pondération reste à plat. Motif : c'est la partie que l'enseignant relit quand il vérifie
que son total fait 100.

---

## ⛔ HORS PÉRIMÈTRE — nommé pour que ça n'y entre pas

- **Les critères holistiques et analytiques.** Ce chantier ne touche que l'**algorithmique**,
  seul type dont le gabarit soit long.
- **Toucher au CSS du composant** ou à la bascule. On **emploie** l'accordéon ; on ne le refait pas.
- **Replier la liste des critères elle-même** (un accordéon par critère). Autre geste, autre
  mesure — et il touche aussi les grilles courtes.
- **Mémoriser les plis d'une séance à l'autre.** Un pli meurt avec la page.
- **Un bouton « tout replier / tout déplier ».** À revoir seulement si l'écran reste long
  une fois les trois sections fermées.

---

## Fini quand

Grégoire ouvre un critère algorithmique dans Conception : il voit **le modèle de formule, ses
paramètres et ses sous-critères**, puis **trois bandes bleues fermées** — les énoncés, la
projection, les codes. Il en ouvre une, **tape dans un champ** : la bande **reste ouverte**. Il
change de critère et revient : les plis sont ceux qu'il a laissés, tant qu'il n'a pas quitté
l'écran.

▣ **Le test qui compte est le second** : taper dans un champ. C'est celui que l'obstacle 2 ferait
échouer.

---

## Ce que ce cadrage ne dit pas

⛔ **Aucun effort n'est estimé** — rien n'a été mesuré de ce côté.
⚠ **L'écran de Grégoire n'a pas été vu par Cowork.** La longueur du gabarit est **son constat**,
pas une mesure ; les sections listées viennent du code, pas de l'écran. **Il vérifie que la liste
correspond à ce qu'il voit avant qu'une consigne s'en écrive.**
⏳ **L'ordre** : ce chantier vient après les trois lots des types de grille
(`PLAN-2026-09-03-les-trois-types-de-grille.md`). Il ne touche aucune note remise — c'est un
chantier d'écran, donc **reportable sans dette**.


---

## ↻ Ajouté le 4 septembre 2026 vers 8 h 50 — l'ORDRE des sections, décidé par Grégoire

À l'écran, le gabarit d'un critère algorithmique enchaîne : la rangée du critère → **Modèle de
formule** (`grilles.js:3482`) → Modèle de rétroaction (`:3594`, à renommer « Modèle de
commentaire », voir la consigne des lots, retour 7) → Modèle de projection (`:3725`) → seuil et
paliers (`:3806`) → **Sous-critères**, tout en bas. Ses mots : *« le bouton d'insertion des
sous-critères n'est pas au bon endroit. Il devrait apparaître immédiatement après le critère »* —
il se retrouve sous la pénalité et l'EUF, *« qu'on ne voit pas et qu'on n'utilise pas »*.

⮕ **Décision** : les **sous-critères viennent en premier**, tout de suite sous la rangée du
critère ; la formule, le commentaire et la projection suivent. Cohérent avec la ligne de partage
de ce cadrage : les sous-critères portent la note (ouverts, en tête), le reste porte les mots
(repliable, en dessous). ⚠ À vérifier au moment d'écrire : la friction nommée plus haut (le bloc
des sous-critères ne se replie pas au premier lot) tient toujours — un bloc en tête qui ne se
replie pas est exactement ce qu'il demande. **Avec le lot 4.**

## ↻ Ajouté le 4 septembre 2026 vers 9 h — deux retours de plus sur le même gabarit

**a) « Il manque d'espace entre le modèle de formule et le modèle de projection : on dirait un
seul formulaire, alors que ce sont deux choses différentes. »** ⮕ C'est exactement ce que les
accordéons règlent : chaque section devient une carte (`div.carte.accordeon`, remède du §
« Remède » plus haut), avec son titre, sa bande et son espace. Aucun réglage d'espacement à
ajouter à part : ce serait corriger le symptôme avant le remède. **Avec le lot 4.**

**b) Renommer l'option « Norme externe (épreuve uniforme) » en « Projection à l'EUF ».**
Demande de Grégoire. ⚠ **Cowork y oppose une réserve, et la lui a remontée** : le modèle est
paramétrable (longueur de référence, erreurs tolérées : 900 / 30 sont des champs, pas des
constantes — `evaluation-projection.js:186-231`), donc il sert toute norme externe, pas seulement
l'EUF ; et le 2 septembre, il a retiré des noms de discipline et d'épreuve de ce qui est offert
(#687, #690). Un collègue qui règle 500 mots / 20 erreurs pour une autre épreuve lirait
« Projection à l'EUF » sur un modèle qui ne l'est plus. **Recommandation : garder le nom
générique et rendre l'EUF visible comme réglage de départ** — « Norme externe (par défaut :
l'EUF, 900 mots / 30 erreurs) », ou la description sous le menu qui le dit. ↻ **TRANCHÉ PAR GRÉGOIRE le 4 septembre vers 9 h, contre la recommandation** : *« Pour l'instant,
indiquons "Projection à l'EUF". »* L'option s'appelle **« Projection à l'EUF »**. La réserve de
Cowork reste écrite ci-dessus pour le jour où un collègue règle une autre norme sous ce nom — ce
sera alors une mesure, pas une supposition. Le libellé seul change (`evaluation-projection.js:186`,
`nom`) ; l'`id` `norme_externe` ne bouge pas : il voyage avec les grilles partagées. **Avec le
lot 4.**
