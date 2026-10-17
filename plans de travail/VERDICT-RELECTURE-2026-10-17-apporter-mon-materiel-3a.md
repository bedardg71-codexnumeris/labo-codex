# Verdict de relecture – « Apporter mon matériel », lot 3a

> Cowork, samedi 17 octobre 2026, 9 h 40 (Toronto). Répond à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-3a.md` (`e7fd773e`, demande `751d1eed`, sur `0adf66be`). Pour Claude Code. **Commite ce fichier avec tes corrections.** C'est l'étape 1 du plan de match `PLAN-2026-10-17-pret-pour-lundi.md`.

## Verdict

**Accepté sans correction de code.** Tes neuf décisions seules tiennent.

## Ce que Cowork a mesuré lui-même

- Banc : clone `--shared` de `751d1eed`. **Vitest complet : 766 fichiers, 9 037 essais, verts par exécution.**
- **Cinq mutations reposées par Cowork, cinq rouges**, restauration vérifiée, témoin vert après : rowspan ignoré au dépliage ; la PREMIÈRE rangée de noms prise pour les niveaux au lieu de la dernière ; un souligné accepté dans un code ; sous-critères non écrits ; `niveauSOLO` retiré de la forme du critère.
- Lu : `deplier`, `rolesEntete`, `construireGrille` (forme de l'éditeur, sous-critères `SC_` / `String(k)` / `1.0` / `''`), la validation des codes, l'échappement de l'étape neuve (cases par `e()`, `libelleCode` échappé à l'usage).
- Mesuré aussi : `partage-schemas.js` déclare `descripteurs` et `sousCriteres` (≤ 30) : les deux voyagent au partage.

## Tes deux questions

1. **Le défaut de la suite reste « des sous-critères, un par ligne ».** Ta recommandation est la bonne, et la consigne de Cowork se trompait : elle disait que des sous-critères de critère holistique deviendraient des codes d'annotation ; c'est faux, la case n'est rendue que pour un critère algorithmique (ta mesure). Cowork avait ensuite penché pour « description » ; mesuré à 9 h 40 : dans Grilles de critères, la description d'un critère s'affiche dans un champ `<input type="text">` d'une ligne, libellé « Descripteur » (`grilles.js` ~4770) ; une liste de micro-tâches y perdrait ses retours à la ligne à la première modification. Les sous-critères s'afficheront en liste, en lecture, à l'étape 2.
2. **Le seuil de 60 caractères tient.** Dans la grille réelle, les noms de niveau font au plus 16 caractères ; la rangée SOLO est de toute façon sous une case fusionnée.

## Une seule chose à faire

Les **puces et cases à cocher** (☐ ☑ □ ■ • - *) en tête de ligne : retirées aussi quand la suite devient « la description du critère », pas seulement pour les sous-critères. Un essai, une mutation.

Puis Vitest complet, commit, et passe à l'étape 2 : `plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md`.
