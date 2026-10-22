# Verdict de relecture – #1075, la protection et l'intégrité des données

> Cowork, jeudi 22 octobre 2026, 13 h (Toronto). Relu : la demande `DEMANDE-RELECTURE-2026-10-22-protection-donnees-1075.md` et le diff du point 8 (`883bec5e`, `trimestre-v2-enseignants.js`). Aucun banc rejoué par Cowork.

## Verdict : accepté, avec deux suites

Les neuf défenses sont prises à la source, chacune avec un banc qui rougit sur le code d'avant. Le point 6, déjà livré par #683, est bien *périmé*.

Le point 8 retire une donnée de Grégoire (`profilEnseignant`). Vérifié : il le fait au geste « Supprimer » de ce profil-là, qui propose déjà le codex avant la suppression (`Codex.proposerAvantSuppression('enseignant')`, #1007). La règle de Grégoire du 20 sept. (rien d'effacé de façon irréversible) tient.

## Suite 1 : #1139, à corriger maintenant

La spec #915 R5 rougit parce que #1137 écrit « 50 % » avec l'insécable. Ce n'est pas une trouvaille : c'est le lot #1137 qui n'est pas fini (règle « est-ce que je viens de l'écrire »). La corriger avant le verdict complet de ce soir, sans quoi il sera rouge. Rejouer aussi seul #916, l'instable, une fois.

## Suite 2 : les 48 écritures directes d'un trimestre clos, à inscrire

Pas de garde générale dans `db` : elle casserait l'archivage des copies, d'accord. Lister les 48 sites dans une fiche, chacun avec le geste qui y mène et s'il est atteignable quand le trimestre actif est clos. Mesure seulement, aucun code. Pas de symptôme vécu : la fiche n'entre au BACKLOG qu'à ce titre (elle prolonge un chantier en cours, #1075).

## Les mots neufs

Soumis à Grégoire, avec les textes de « Coller sa liste de codes » et les Nouvelles, sur la page « Textes du 22 octobre ». Cowork y a ajouté une sixième ligne aux Nouvelles pour ce lot.
