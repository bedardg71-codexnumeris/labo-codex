# Portes terrain – « Apporter mon matériel », lot 1 (16 octobre 2026)

> Une seule porte, celle qu'aucune machine ne peut éprouver : coller une **vraie** grille depuis **Word** et depuis **Pages**, sur le Mac et sur l'iPad. Tout le reste (la lecture, les cases fusionnées, la pondération, l'inversion, la sécurité du collage) est mesuré par les bancs.
> Rien n'est écrit dans tes données à ce lot : l'aperçu se lit, rien n'est créé. Aucune sauvegarde préalable n'est nécessaire.
> Ce qui échoue devient un item de backlog, avec le numéro de la rangée.
> Cowork publie l'artefact jumeau (cases à cocher, champs de saisie, bouton « Copier mes résultats »).

## §0 · Préalable

⚠ **Cette porte attend le push.** Le lot est commité, pas poussé : aucun push avant ton signal du soir. Tant qu'il n'est pas en ligne, l'application que tu ouvres est celle d'avant, et la porte jugerait l'ancienne version.

| N° | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org`, recharge en vidant le cache (Mac : ⌘ ⇧ R). | La page se recharge. |
| 0.2 | Lis le numéro de version en bas de page. | Celui annoncé au message du soir, après le push. Sinon, arrête-toi ici. |
| 0.3 | Ouvre l'onglet Conception. | « Apporter mon matériel » est le premier bouton de la barre, et sa page s'affiche : un titre, trois étapes numérotées, une grande zone « Colle ta grille ici ». |

## §2 · Interface – coller une vraie grille

**Pourquoi.** Les bancs collent un HTML de Word reconstitué à la main. Ce que Word et Pages mettent vraiment dans le presse-papiers, et ce que l'iPad laisse passer quand on colle, seul ton matériel peut le dire. Lundi, les membres de la CoP colleront leurs propres grilles.

Pour chaque rangée, prends une grille réelle que tu utilises (critères en lignes, niveaux en colonnes). Sélectionne **le tableau en entier**, avec la ligne de titre au-dessus si tu en as une, puis copie.

| N° | Où | Geste | Attendu | À noter (champ) |
|---|---|---|---|---|
| 2.1 | Mac, Word | Clique dans la zone de collage, colle (⌘ V). | L'aperçu remplace l'accueil : « Aperçu de ta grille », un tableau avec tes critères en lignes et tes niveaux en colonnes. | Critères et niveaux affichés / dans ton document (ex. « 4 et 4 / 4 et 4 ») |
| 2.2 | Mac, Word | Regarde le texte des cases. | Chaque case porte le texte de ton document ; deux paragraphes d'une même case sont séparés, pas soudés. | Une case mal lue, s'il y en a (recopie-la) |
| 2.3 | Mac, Word | Regarde la section « À classer », sous le tableau. | Ce qui était hors du tableau (une note, une remarque sous la grille) y figure, avec sa raison. Rien de ton document n'a disparu. | Ce qui manque, s'il manque quelque chose |
| 2.4 | Mac, Pages | Mêmes gestes qu'en 2.1, avec une grille faite dans Pages. | Comme en 2.1. | Critères et niveaux affichés / dans ton document |
| 2.5 | iPad, Word | Mêmes gestes, sur l'iPad (toucher la zone, puis « Coller »). | Comme en 2.1. Le tableau défile de côté dans son cadre ; la page, elle, ne défile pas de côté. | Critères et niveaux affichés / dans ton document |
| 2.6 | iPad, Pages | Mêmes gestes, avec Pages sur l'iPad. | Comme en 2.5. | Critères et niveaux affichés / dans ton document |

Si un collage affiche « L'application n'a pas trouvé de tableau dans ce que tu as collé », note-le dans le champ de la rangée, avec l'application et l'appareil : c'est l'information la plus utile de toute la porte.

## §3 · Décisions

Aucune à ce lot.

## §4 · Ce que je n'ai pas pu vérifier

- **La suite Playwright complète n'a pas été lancée** (pas de verdict avant ton signal du soir). Les deux essais neufs de `materiel-lot1-onglet.spec.js` (l'onglet en tête et l'exemple affiché ; un collage piégé qui n'entre pas dans la page) ont tourné seuls dans WebKit : verts.
- **Le presse-papiers réel de Pages** : je n'en connais pas la forme. Si Pages ne fournit qu'un texte sans tabulations, la lecture échouera avec le message ci-dessus ; la rangée 2.4 le dira.
- **Le collage sur iPad** : Safari pour iPad peut ne transmettre que le texte brut. Le repli sur le texte à tabulations existe, mais je ne sais pas ce que Word pour iPad y met.
- **L'apparence en mode clair et en mode sombre** n'a pas été regardée à l'écran : les couleurs passent par les variables de l'application, sans valeur en dur.
- **L'info-bulle du bouton** « Apporter mon matériel » est posée (ta réponse A), texte provisoire relu au lot 3 ; je ne l'ai pas vue s'afficher au survol.
