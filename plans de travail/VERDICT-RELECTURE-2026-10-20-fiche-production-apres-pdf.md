# Verdict de relecture – la fiche de production après « Préparer le PDF » (#1127)

> Cowork, mardi 20 octobre 2026, 17 h 34 (Toronto, mesuré par `date`). Commit relu : `9882d2d5` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-20-fiche-production-apres-pdf.md`.

## Verdict : accepté, sans correction

Le correctif tarit la source : la zone n'est plus sérialisée puis remise, ses nœuds, leurs valeurs et leurs écouteurs restent intacts. L'ancien chemin est retiré, pas doublé (`git grep "_zonePrincipalePDF\|_contenuPrecedentPDF"` sur `9882d2d5` : rien dans `js/` ni `tests/`). Le banc relit la base après rechargement, pas l'écran seulement ; il couvre les deux fermetures (« Annuler », l'aperçu puis « ← Modifier », qui ne fait que fermer la modale : `fermerModalApercuPDF`, l. 3198).

## Les deux questions de la demande

1. **Une classe à part plutôt que `u-hide`** : retenu. Le motif est juste : la fiche gère ses propres `u-hide` (accueil, formulaire) et la fermeture ne doit retirer que ce qu'elle a posé.
2. **Naviguer ailleurs pendant que le formulaire est ouvert** : retenu tel quel. Le formulaire reste, la fiche reste cachée mais vivante ; avant, elle était en plus détruite. Aucun symptôme vécu : **commenter et oublier**, rien à inscrire.

## Ce que la relecture a trouvé

- **Une affirmation du rapport est inexacte** : « les deux autres boutons qui ouvrent ce formulaire (Échelles, Cartouches) sont couverts ». Ces boutons n'existent plus (#496). Mesuré : `afficherFormulairePDFDepuisEchelle` et `afficherFormulairePDFDepuisCartouche` n'ont aucun appelant dans `js/`, `index.html` ni `tests/` ; seule leur exposition sur `window` (l. 3741-3742) les tient. Sans effet sur le correctif.
  ⮕ **Inscrire** (code mort, zéro-dette) : à faire par Claude Code dans le prochain commit, avec son numéro ici.
  ✅ **Inscrit : #1128** (Claude Code, 20 oct., 18 h 15, avec le lot de la grille du PDF). Mesuré au passage : le mort s'étend à la modale `exportPDF-*` (aucun élément dans `index.html`) et au formulaire `#formulairePreparationPDF` (jamais ouvert) ; la fiche les nomme.
- **L'instabilité du banc neuf** (1 échec sur 40, un blocage d'environ 2 minutes) : c'est le banc de ce lot, pas du code étranger. Accepté pour ce soir ; **s'il retombe au verdict complet, il revient à ce lot**.
- **La CI de GitHub rouge sur `c8b2af98`** (27 specs hors de la liste des échecs connus) : hors de ce lot. À rattacher à #1114 par Claude Code dans le prochain commit (constat et nombre, sans correctif).
  ✅ **Rattaché à #1114** (Claude Code, 20 oct., 18 h 15) : run 39489490231, 27 specs hors baseline sur 830 essais, familles nommées, sans correctif.

## Suite

Le lot suivant : `CONSIGNE-LOT-2026-10-20-pdf-grille-bareme.md`. Il porte aussi les deux lignes de `PLAN-2026-10-19-bareme.md` laissées hors de ce commit (elles sont de Cowork : la décision de Grégoire du 20 oct., 16 h 58).
