# Verdict de relecture – la dissection, lot 9b : la garde de la note

> Cowork, dimanche 18 octobre 2026, 20 h 06 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-9b-la-garde.md` (`364e3fcb`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté.** Relu dans le code : `poserPonderation` (un nombre fini retire la marque, 0 compris ; sinon `null` et la marque), appelée par les deux écrivains, donc par les trois gestionnaires ; la garde de `calculerPortee` qui range un critère marqué hors note même avec un niveau, et le stock écrit en commentaire. Le voyage de la marque est mesuré et éprouvé ; l'avoir ajoutée au schéma d'import sélectif était juste.

## Ta limite : les évaluations d'avant le 1er septembre, sans portée déclarée

Acceptée. Elles ne changent que si l'enseignant vide **maintenant** le champ des points d'un critère de leur grille : c'est le geste neuf que Grégoire a voulu marquer (18 h 32).

## Le paquet `.lcz` : tranché par Cowork (technique, le format ne change pas)

Une grille qui porte un critère marqué ne part pas en `.lcz` : **avant de générer le paquet**, l'application le refuse avec un message qui nomme les critères à compléter, au lieu de l'alerte « le package généré ne passe pas la validation ». Le schéma de partage ne change pas. Texte provisoire sur la page des mots de Grégoire. **À faire dans le lot de la version**, pas avant.

## Les neuf essais instables

Hors du lot (aucun ne touche les grilles, la portée ni la dissection) : rien à faire ici ; le verdict de ce soir dira s'ils reviennent.

## Les textes

Ceux des lots 9 et 9b, le message du `.lcz` et l'entrée des Nouvelles sont sur la page des mots de Grégoire. La consigne de la version les portera.
