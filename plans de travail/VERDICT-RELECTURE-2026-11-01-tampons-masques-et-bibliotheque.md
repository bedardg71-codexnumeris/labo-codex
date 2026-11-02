# Verdict de relecture – Les tampons par défaut reviennent, et la bibliothèque perd les images SVG (#1216)

> Cowork, dimanche 1er novembre 2026, 20 h 33 (Toronto, mesuré par `date`). Relu : `a87f472c` (diff de `js/travaux-outils.js` et `js/tampons-bibliotheque.js`), `RAPPORT-2026-11-01-tampons-masques-et-bibliotheque.md` (le tableau du cycle d'abord), `PORTES-TERRAIN-2026-11-01-tampons-masques-et-bibliotheque.md`.

## Verdict : accepté, sans retouche

- **La mesure avant correction** est faite et tranche : WebKit applique les personnalisations avant que la base soit lue, et « Enregistrer » écrit ensuite les noms par défaut en base. Chrome gagne la course, ce qui explique qu'on ne l'ait pas vu sur le Mac. C'est la piste 3 de Cowork, confirmée.
- **Le seuil de la piste 1 était faux**, et le rapport le corrige : 17 ids sont écrits dans `elementsMasques` sans rien retirer ; un tampon créé et un enregistrement suffisent. Le bloc est retiré.
- **La réapplication** à chaque `db-ready` (`once: false`) : juste, un import réémet l'événement. `rechargerTamponsPersonnalises` n'écrit rien.
- **Les catégories non rendues** : leurs tampons créés sont repris de la base. Une catégorie supprimée dans la fenêtre était rendue à l'ouverture : ses tampons partent, comme il se doit.
- **La capture** attend l'image, reste une PNG (Défense O) ; un SVG est dessiné à 256 px au moins. Décision de Claude Code retenue : une vignette de 16 px serait illisible.
- **L'aperçu** : `sourceImageApercu` refuse le SVG, voulu ; la rangée montre sa PNG, jamais l'image par défaut.
- **Aucune suppression de données** : rien n'efface ce que l'usager a écrit.
- **Non reproduit** : ses tampons créés absents des deux colonnes. Au banc, ils sont au bas d'une longue liste, sans aperçu jusqu'ici. La porte terrain le dira.

## Ce qui en découle

- Les Nouvelles de la 1.230 reçoivent un sixième point, soumis à Grégoire.
- **Le tampon gardé avant d'être personnalisé** (cas c) : la bibliothèque garde l'ancien nom et l'ancienne image. Le contournement existe (« Supprimer de ma bibliothèque », puis « Garder »). Le choix d'un chemin de mise à jour est à soumettre à Grégoire, après la mise en ligne.
