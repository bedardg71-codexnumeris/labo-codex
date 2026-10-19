# Verdict de relecture – la dissection, lot 13 : modifier les réponses d'un critère

> Cowork, lundi 19 octobre 2026, 13 h 39 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-19-lot-13-modifier-les-reponses.md` (`4d029ac1`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, sans correction.**

Relu sur le diff de `4d029ac1` :
- **Point 0, remesuré** : seuls `grilles.js`, `import-export.js`, `materiel-assistant.js` et `materiel-creation.js` lisent `descripteurs` comme propriété ; `export-pdf.js` n'en porte qu'un commentaire (l. 1725), `partage-schemas.js` qu'une déclaration de schéma. Une copie notée garde `pointsAnalytiques[critere.id]` (Z.b) ou son niveau. Aucune note ne peut bouger.
- **Les bornes** rejoignent celles du partage (`partage-schemas.js` : 20 clés, 5 000 caractères ; clé en « _ » refusée par `partage-validation.js`) : une grille modifiée reste partageable.
- **Le rendu** : la clé échappée dans `value`, `data-reponse-cle` et `aria-label`, le nom d'échelle aussi ; `data-on-change` et `data-action` seulement.
- **Le retrait** : relu après la fenêtre (`_memeCritere`, `_reponseVisee`) ; même confirmation que `supprimerCritereGrille` (l. 5470), comme le voulait la consigne.
- **Une seule écriture**, par la file ; la dernière réponse retirée enlève `descripteurs`, comme un critère créé sans.
- **Les bancs ajustés** ne relâchent que la lecture seule que le lot retire.

## Tes suppositions

Acceptées, les sept. Pour la borne de 0 à 100, voir R1.

## Remarques – issue 3, consignées ici, rien à faire

- **R1** – La borne de 0 à 100 ne vaut que pour un nombre seul : « 150 » est refusé, « 150 points » passe. Sans effet sur une note (point 0).
- **R2** – Z.a ne voit ni la déstructuration (`const { descripteurs } = c`) ni `c['descripteurs']`. À garder en tête si ce banc doit un jour trancher seul.
- **R3** – Course théorique : un texte modifié pendant que le renommage des points de la même réponse s'écrit encore porte l'ancienne clé, et il est écarté sans un mot (`refuse: null`). Il faudrait quitter le champ en quelques millisecondes.

## Les textes

Ils restent PROVISOIRES : ils passent à Grégoire avec la version, comme ceux des lots 12 et 11. Une observation pour ce moment-là : le champ s'appelle « Points », mais il porte aussi des clés qui n'en sont pas (« Débutant » dans les grilles de l'ancien assistant, cf. `materiel-etape5b-reconnaissance.spec.js` ; « Réponse 3 » pour une réponse qu'on vient d'ajouter).

## Les sous-critères

Ta précaution est la bonne (la garde de `supprimerSousCritere`, puisqu'un sous-critère peut porter des notes). Rien à inscrire tant que Grégoire n'en a pas vécu le manque (règle du 24 août).
