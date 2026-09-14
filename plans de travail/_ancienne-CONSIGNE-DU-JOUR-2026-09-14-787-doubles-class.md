# Consigne du jour — #787 : les treize balises d'`index.html` qui portent deux attributs `class`

> Écrite le 14 septembre 2026, 16 h 40 (Toronto), sur `e5d5ccc7` (un commit d'avance sur `origin/main` = `8d782387` = 1.140.9).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-575-zones-graphique.md`.
> ⚠ Grégoire a choisi « terminer la grappe autour d'`index.html` ». **La mesure a réduit la grappe à une seule fiche livrable aujourd'hui** : voir § 5.

---

## 1 · L'OBJET, EN UNE PHRASE

Treize balises d'`index.html` portent **deux attributs `class`**. HTML ne retient que le premier : la seconde valeur est ignorée par le navigateur, en silence. Les fusionner en un seul attribut.

## 2 · CE QUE J'AI MESURÉ, ET COMMENT

- **Treize balises, pas vingt-deux ni dix-neuf.** Compté en parsant `index.html` avec `html.parser` (Python), donc **par le DOM et non ligne à ligne** — la fiche annonçait 22 le 7 sept., 19 le 11, 13 après #520. **La fiche a raison à treize.**
- **Le cliquet existe déjà** et sa liste concorde, à l'unité près, avec ma mesure : `tests/unit/sentinelle-779-un-seul-attribut-class.test.js`, constante `DETTE_CONNUE`, treize signatures. ⮕ **Deux méthodes, pas deux lectures** : son motif est une expression régulière sur les balises, le mien un parseur. Les deux rendent la même liste.
- ⚠⚠ **LES HUIT CLASSES PERDUES EXISTENT TOUTES DANS LE CSS** (mesuré : `.mt-10`, `.mt-15`, `.mt-20`, `.mb-15`, `.text-09-mt10`, `.u-texte-09`, `.u-w-100`, `.whitespace-nowrap` — chacune définie 1 à 3 fois entre le bloc `<style>` d'`index.html` et `styles.css`). **Ce lot n'est donc PAS un nettoyage invisible : il fait apparaître des marges, met un bouton en pleine largeur et en 0,9 rem, et empêche un autre de se couper.**

## 3 · OÙ ELLES VIVENT — et c'est ce qui rend la porte courte

| Où | Combien | Ce qui change à l'écran |
|---|---|---|
| **Aide** (`section-aide`) | **10** | des marges de 10 à 20 px entre des tableaux et des encadrés |
| **Conception** (`section-conception`) | **2** | un bouton passe en pleine largeur et en 0,9 rem ; un autre cesse de se couper en deux lignes |
| **Évaluations** (`section-evaluations`) | **1** | une marge de 15 px sous un groupe de boutons |

⮕ **Trois endroits se regardent vraiment, pas treize.** Les dix de l'Aide sont des marges entre blocs de texte.

## 4 · LE GESTE

**Fusionner** les deux valeurs en un seul attribut `class`, dans l'ordre : la valeur du premier attribut, puis celle du second. Ne rien retirer.

⚠ **Décision tranchée par Cowork, et voici la supposition qu'elle porte** : le second attribut a été écrit par quelqu'un qui voulait cet effet ; l'état actuel est un accident silencieux, pas un choix de design. On rétablit donc l'intention d'origine, et la porte terrain permet à Grégoire d'en retirer un s'il le juge moins bon. **L'autre option — supprimer le second `class` pour entériner ce qu'on voit depuis toujours — a été écartée** : elle éteindrait la dette sans jamais dire ce qu'on perdait.

**Le cas le plus visible, à nommer dans ton rapport** : `button|btn btn-principal|u-texte-09 u-w-100` (Conception, `data-action="afficherBibliothequeProductions"`). Ce bouton devient pleine largeur.

### Les treize, par signature — `balise|classes gardées|classes perdues`

Elles sont **déjà écrites** dans `DETTE_CONNUE` de la sentinelle #779. Prends-les là, pas ici, et ne travaille pas par numéro de ligne : elles bougent au premier ajout ailleurs dans le fichier.

## 5 · CE QUI N'EST PAS DANS CE LOT

La grappe `index.html` porte deux autres fiches ouvertes, et **elles ne s'ouvrent pas aujourd'hui** :

- **#766** — le bloc `<style>` d'`index.html` (3 828 lignes, **614 règles** commentaires retirés) est chargé **APRÈS** `styles.css` et redéclare `.controle-form`, qu'il bat à spécificité égale. ⚠ **Le tri affichait cette fiche « douteuse » ; la mesure la confirme réelle** — le bloc est bien après, et la redéclaration est bien là.
- **#297** — les mêmes 614 règles vivent en double entre le bloc inline et `styles.css`.

⮕ Ces deux-là sont **le même chantier** : l'ablation du bloc inline. Un chantier, pas un lot.

## 6 · LA PREUVE EXIGÉE

1. **`DETTE_CONNUE` passe à `[]`**, et l'en-tête du fichier de sentinelle est mis à jour (la dette est éteinte, le cliquet devient un interdit : plus aucun double `class` dans `index.html`, jamais).
2. **Break-test** : remets un second `class` sur n'importe quelle balise → le bloc B rougit **en nommant la signature de trop**. Montre la sortie rouge.
3. Le bloc A (#779, le champ `#date-cours`) reste vert, inchangé.
4. Vitest complet depuis `tests/`, jamais depuis la racine.

## 7 · APRÈS

- Release **patch**, et l'entrée « Nouvelles » **n'ouvre pas de bloc** — convention du fichier : une entrée par version mineure.
- **Porte terrain : quatre rangées** — le bouton de la bibliothèque des productions (pleine largeur), le bouton « Déverrouiller cartouche » (ne se coupe plus), le groupe de boutons des Évaluations (marge), et **une seule rangée pour les dix marges de l'Aide**, regardées d'un défilement. Markdown par toi dans `plans de travail/`, artefact par Cowork.
- ⚠ Il reste **un commit non poussé** avant celui-ci : `e5d5ccc7`, la page publique « où vivent les données ».
