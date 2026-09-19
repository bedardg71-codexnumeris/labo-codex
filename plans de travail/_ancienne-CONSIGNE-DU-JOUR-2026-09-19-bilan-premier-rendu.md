# Consigne suivante — la phrase du bilan des fondamentaux a un rendu de retard (#906)

> Écrite le 19 septembre 2026 à 10 h 17 (Toronto), par Cowork. **Proposée**, relayée par Grégoire quand il l'aura dit.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `41a69c8a` ou plus récent ; `main` local porte `8e1c2d0a` (relais, docs) d'avance, il partira avec ce lot. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-choix-echelle-assistant.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : à l'écriture, quatre fichiers modifiés appartiennent à un autre travail (`js/interpretation-config.js`, `.claude/skills/ecosysteme-classe/SKILL.md`, le CADRAGE du 17 au soir, la RELECTURE du 17). N'y touche pas, ne les commite pas, garde leur jeton anti-cache tel quel (comme en 1.146.9) ; indexe par chemins nommés.
> **Identifiant** : aucune fiche neuve attendue ; sinon relis « Dernier ID utilisé » (#922 à l'écriture) et `grep` les deux registres.
> **Ce lot ne demande rien à Grégoire** : aucun mot neuf à l'écran, aucun arbitrage, aucun écran à vérifier chez lui. Seule la phrase de « Nouvelles » lui remonte, par Cowork, avant le push.

---

## 1 · Ce que Grégoire verra

Dans Suivi › tableau de bord du groupe, la phrase du bilan des fondamentaux décrit le groupe affiché dès le premier rendu. Aujourd'hui, après tout changement du groupe (un élève ajouté, retiré, passé en décrochage), elle décrit l'état d'avant jusqu'au rendu suivant – alors que la barre des patterns, juste au-dessus, est déjà à jour.

## 2 · Ce que Cowork a mesuré (19 sept., 10 h 20, lecture de `main` à `8e1c2d0a`) – à remesurer avant de coder

- `js/tableau-bord-apercu.js`, `chargerTableauBordApercu` : `afficherPatternsApprentissage(etudiantsAvecIndices)` (≈ l. 1347) écrit la phrase par `genererInterpretationSuiviFondamentaux`, qui lit la variable de module `_tousEtudiantsEnrichis` ; cette variable n'est remplie que par `calculerEtudiantsPrioritaires()` (≈ l. 248), appelée ≈ 45 lignes plus bas (≈ l. 1392). D'où le retard d'un rendu.
- La phrase n'est écrite que si le réglage `activerRai` n'est pas à `false`.
- `calculerEtudiantsPrioritaires` a d'autres appelants (≈ l. 438, ≈ l. 1162) : le déplacer change aussi ce qu'ils voient.
- Le banc `tests/integration/profil-745-*.spec.js` rend le tableau de bord **deux fois** exprès (commentaire ≈ l. 53-56) pour ne pas juger #906.

## 3 · Ce qui est attendu

Que la phrase lise, au premier rendu, le même groupe que la barre des patterns. **Le choix du correctif est à toi** et se dit en une ligne : faire lire à la phrase la liste que le rendu lui passe déjà (`etudiantsAvecIndices`, une seule source), ou rafraîchir `_tousEtudiantsEnrichis` avant `afficherPatternsApprentissage`. Critère : une seule source pour la barre et la phrase, aucun calcul fait deux fois par rendu, aucun effet sur les autres appelants de `calculerEtudiantsPrioritaires` (à mesurer). Aucun mot de la phrase ne change.

## 4 · Arrêt

Si le correctif change ce que dit la phrase au-delà du retard (un autre compte, une autre catégorie, les exclus comptés autrement) : arrête-toi et dis-le avec les deux phrases, avant et après.

## 5 · Preuve

- **Le banc `profil-745` passe à UN seul rendu** du tableau de bord, et son commentaire sur #906 part : il juge alors la phrase au premier rendu. Il doit rougir sur le code d'avant.
- Un essai de comportement au premier rendu après un changement du groupe qui n'est PAS un décrochage (un élève ajouté ou retiré) – la fiche dit que le défaut n'est pas propre aux exclus.
- **Mutations** : remettre l'ordre d'avant ; faire lire à la phrase la liste d'un rendu précédent en gardant le texte de l'appel. Les deux doivent rougir.
- Pas de porte terrain : une machine répond, rien n'est irréversible.

## 6 · Livraison

- Stock : aucun, rien n'est écrit dans les données (la phrase est recalculée à chaque rendu).
- Patch (`1.146.10` attendu). **Phrase de « Nouvelles »** : propose-la à Grégoire par Cowork avant le push.
- Coche **#906** dans le même commit que le code.
- Fichiers de Cowork à commiter avec le lot : cette consigne renommée et l'archive de la précédente.
- Verdict par `scripts/pousser.sh` (garde de charge), push sur demande de Grégoire. Donne le SHA commité avant le verdict : Cowork relit pendant qu'il tourne, en lecture seule.
