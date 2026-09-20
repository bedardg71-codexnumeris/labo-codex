# Consigne en attente – l'Aide dit comment nommer les pages d'une remise en plusieurs fichiers (#878)

> Écrite le 20 septembre 2026, 16 h 29 (Toronto), par Cowork.

> **En attente** : elle part APRÈS le lot « une fois par jour » (`CONSIGNE-EN-ATTENTE-ci-une-fois-par-jour.md`), lui-même après le plafond, dont le run doit être LU avant qu'un autre push l'annule. Au départ : archive `CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-20-plafond-github.md`, puis renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte le push du lot précédent. Aucune autre session n'écrit dans `index.html`.
> **Texte DÉJÀ validé par Grégoire le 17 sept. 2026, 13 h 34** (`plans de travail/DECISIONS-2026-09-17-apres-midi.md`) : rien ne remonte jusqu'à lui dans ce lot.
> ⛔ Rien dans `js/` ne change : aucun comportement d'import, aucune donnée touchée.

---

## 1 · Ce que Grégoire verra

Dans Aide › « Préparer et importer les travaux », sous « 1. Déposer les fichiers », un paragraphe dit comment nommer les pages d'une remise en plusieurs fichiers pour qu'elles s'assemblent en un seul document. C'est son cas vécu du 15 septembre : trois fichiers `1a`, `1b`, `1c` avaient donné trois productions et des doublons ; renommés `-p1`, `-p2`, `-p3`, ils se sont assemblés.

## 2 · Le texte à poser, tel quel

> **Une remise en plusieurs fichiers** : pour que les pages s'assemblent en un seul document, numérote-les à la fin du nom — `-p1`, `-p2`… (ou `_p 2`, `page 2`, `partie 2`, `part2`, `(2)`). Une lettre — `Artefact_1a`, `1b` — crée une AUTRE production : tu obtiens plusieurs documents et des doublons à la confirmation.

Écartés par Grégoire, ne pas les ajouter : une phrase de plus sous la zone de dépôt ; une version courte sans les formes acceptées.

## 3 · Mesuré par Cowork (lecture de `main` à 1.151.4) – à remesurer

- `SUFFIXE_PAGE` (`js/travaux-import.js`, ≈ l. 103) : `/[\s\-_]*(?:\((\d{1,3})\)|(?:p(?:age)?|part(?:ie)?)\s*(\d{1,3}))$/i` — en FIN de nom seulement. Les six formes du texte validé correspondent à cette expression, vérifié forme par forme ; une lettre finale n'est pas reconnue.
- Point d'insertion : `index.html`, accordéon « Préparer et importer les travaux », sous `<p><strong>1. Déposer les fichiers :</strong></p>` (≈ l. 11626 ; renumérotée par le lot #893, à retrouver par la chaîne, pas par le numéro).

## 4 · Arrêts

- Si une forme du texte n'est PAS reconnue par l'expression mesurée à l'exécution (essaie les six, plus une lettre finale) : arrête-toi et dis-le à Grégoire — son texte promettrait quelque chose de faux. Ne corrige pas le texte toi-même, il est validé.
- Ne pas toucher à l'assemblage lui-même : reconnaître une lettre finale est REPORTÉ par Grégoire (« je verrai à l'usage »).

## 5 · Preuve

- Sentinelle : le paragraphe existe sous « 1. Déposer les fichiers » et cite les six formes ; mutation (retirer une forme, ou déplacer le paragraphe sous un autre titre) → rouge.
- Un essai qui joue les six formes CONTRE `SUFFIXE_PAGE` à l'exécution, plus `Artefact_1a` qui ne doit pas s'assembler : c'est la preuve que l'Aide ne ment pas.
- Patch par `scripts/release.mjs`. Entrée de « Nouvelles » : une ligne, PROPOSÉE.
