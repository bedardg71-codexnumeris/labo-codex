# AUDIT — les astérisques d'obligation dans Grilles et Échelles

**Date** : 26 août 2026 · **Base** : `main` 1.99.2 (build 0826-1008)
**Déclencheur** : Grégoire prépare un tutoriel — « indiquer dans les grilles et échelles les champs
obligatoires par des astérisques rouges ».
**Méthode** : celle de #506 — un champ n'est *obligatoire* que si le code **refuse** l'enregistrement
quand il est vide. Tout le reste est une préférence, et la marquer serait promettre un refus qui
n'existe pas (le défaut que #516 vient de corriger).

---

## Synthèse

**Les astérisques qui existent sont justes.** Les trois champs marqués dans Grilles et Échelles sont
bien refusés par le code, et depuis ce matin le nom de critère l'est réellement (#516). Rien à
retirer.

**Mais il manque deux choses, et l'une est un vrai trou de données** :

| | Constat | Gravité |
|---|---|---|
| **A1** | Le **code d'un niveau** est une CLÉ lue à 23 endroits — aucune marque, aucun refus sur le chemin vivant | **majeur** |
| **A2** | La **légende** des astérisques n'existe que sur l'écran Production | moyen — et c'est celui qui te bloque pour le tutoriel |
| **A3** | `.champ-requis` est défini **deux fois**, dont une couleur en dur qui écrase la palette | mineur |

---

## 1 · Ce qui est déjà correct

| Écran | Champ | Astérisque | Le code refuse-t-il ? | Verdict |
|---|---|---|---|---|
| Grille | Nom de la grille | ✔ | ✔ `sauvegarderGrilleTemplate` — « Le nom de la grille est obligatoire » | cohérent |
| Grille | Nom du critère | ✔ | ✔ `REFUS_NOM_CRITERE` (#516, ce matin) | cohérent |
| Échelle | Nom de l'échelle | ✔ (×2 écrans) | ✔ deux chemins : `enregistrerCommeEchelle` et `sauvegarderEchelleComplete` | cohérent |

Les autres champs d'un critère — description, pondération, type, niveau SOLO, facteur de
normalisation — n'ont ni marque ni refus. **C'est cohérent** : ils sont réellement facultatifs.

---

## 2 · A1 — le code d'un niveau : obligatoire de fait, libre en droit

C'est le constat qui compte.

**Ce que c'est.** Dans le tableau des niveaux d'une échelle (colonnes *Ordre, Code, Nom, Description,
Min, Max, Valeur ponctuelle*), la colonne **Code** ne porte aucun astérisque et n'est refusée nulle
part sur le chemin vivant.

**Pourquoi c'est un problème de données, pas d'affichage.** Le code sert de **clé d'indexation** des
commentaires de cartouche et des rendus PDF :

```js
const key = `${critere.id}_${niveau.code}`;   // cartouches.js:600 et :1098
const cle = `${c.id}_${n.code}`;              // export-pdf.js:642, :1038, :2421
```

**23 sites** indexent par cette valeur. Deux conséquences si un code est vide ou dupliqué :
- **vide** → la clé devient `CR_1_`, et **tous** les niveaux sans code se retrouvent sur la même
  case : le dernier commentaire écrase les autres ;
- **dupliqué** (deux niveaux « M », par exemple) → même collision, sans le moindre signalement.

**Et il existe une validation… sur du code mort.** `sauvegarderNiveaux()` contient bien
« Niveau N : Code et nom obligatoires » (echelles.js:1390). Mais son bouton vit dans le bloc
`<div class="u-hide">` marqué **« ANCIEN SYSTÈME (Caché par défaut, gardé pour compatibilité) »**, et
il écrit dans `#tableauNiveaux` — alors que l'éditeur vivant est `#tableauNiveauxEchelle`.

⚠ **C'est exactement le motif AP-2 que #516 vient de corriger ailleurs** : une garde ancrée sur un
chemin que personne n'emprunte, qui donne l'illusion d'une protection. Deux occurrences en un jour,
sur deux écrans voisins — ce n'est plus un accident, c'est un pli à surveiller.

**Asymétrie créée ce matin** : le nom d'un *critère* est désormais refusé s'il est vide ; le code et
le nom d'un *niveau* ne le sont pas. Les deux écrans se ressemblent, leurs règles non.

---

## 3 · A2 — la légende n'existe que sur l'écran Production

La légende des deux marques vit aux lignes 4603-4605 d'`index.html`, dans le formulaire de
production **uniquement** :

> `*` Champ obligatoire — l'enregistrement est refusé sans lui.
> `*` Recommandé — l'application fonctionne sans, mais une information disparaît ailleurs.

Grilles, Échelles et Cartouches portent leurs astérisques **sans légende**. Le commentaire CSS de
`.champ-recommande` dit pourtant lui-même « ne jamais poser l'une sans l'autre ».

⮕ **C'est le point qui bloque le tutoriel** : un astérisque sans légende est une énigme, et un
tutoriel ne peut pas expliquer une marque que l'écran n'explique pas.

*(Constat C2 de l'audit du 25 août, resté ouvert parce qu'il dépendait du verdict D1 — lequel est
tranché depuis ce matin.)*

---

## 4 · A3 — `.champ-requis` est défini deux fois

```css
styles.css:3543   .champ-requis { color: var(--rouge-erreur); font-weight: 700; margin: 0 2px; }
index.html:2534   .champ-requis { color: #e74c3c; }
```

Le `<style>` inline d'`index.html` (ligne 1520) vient **après** le `<link>` de `styles.css`
(ligne 14) : à spécificité égale, **c'est lui qui gagne**. Les astérisques sont donc `#e74c3c`, une
couleur en dur hors palette, et non `--rouge-erreur`.

Sans conséquence visible aujourd'hui — les deux sont rouges — mais : la palette ne pilote pas ce que
l'écran affiche, et `font-weight: 700` de `styles.css` est **perdu** au passage (la règle inline ne
le reprend pas). C'est le même motif que le doublon de règle du bandeau, trouvé le 24 août : *une
copie dans index.html qui écrase silencieusement styles.css*.

---

## 5 · Ce que je n'ai pas vérifié

1. **Min et Max des niveaux.** Une validation existe (`min > max` refusé), mais elle vit dans le même
   `sauvegarderNiveaux()` mort. L'éditeur vivant accepte-t-il des bornes incohérentes ? Non mesuré.
2. **Les cartouches et les pratiques** : hors du périmètre demandé (grilles et échelles).
3. **Rien n'a été essayé au navigateur.** Tout ce rapport est lu dans le code, sauf le comptage des
   23 sites d'indexation, qui est mécanique.
4. **Je n'ai pas vérifié tes données réelles** : y a-t-il, dans tes échelles, un niveau au code vide
   ou dupliqué ? C'est une sonde à écrire, pas une lecture de code.
