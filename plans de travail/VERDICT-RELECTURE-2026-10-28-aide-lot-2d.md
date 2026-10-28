# Verdict de relecture – L'Aide, lot 2d : le Labo, le codex et la Référence (#1152)

> Cowork, mercredi 28 octobre 2026, 13 h 13 (Toronto, mesuré par `date`), sur `main` = `e365a49f`. Lu : la demande de relecture, le texte visible des quatorze entrées au HEAD ; vingt-trois libellés cités cherchés dans `index.html` hors de l'Aide et dans `js/` (tous trouvés) ; « Inactivité » et « Décrochage » (`js/main.js:119-126`, `js/contexte-qualification.js:310-312`). Playwright non rejoué.

## Verdict

**Accepté, avec une retouche courte.** Les corrections du dossier et de la remesure sont faites (le codex et sa fenêtre d'aperçu, l'archive d'un trimestre par la bibliothèque, l'import d'un partage dans les cinq fenêtres et dans Réglages › Données, une attribution à un seul maillon) ; `glossaire-statique` est intacte ; les décisions prises seul par Claude Code sont retenues (l'ordre du Labo ; l'import du bilan retiré tant que #1054 est ouvert, et le rapport d'analyse avec lui ; « Invalid Date » aux problèmes ; « Dupliquer vers mes documents », le libellé de l'écran).

## La retouche (Claude Code)

1. **La FAQ, « Puis-je modifier les seuils des indices A, C, M ? »** : il n'y a pas d'indice M (le « M » est le nom interne du filtre « A ou C », `js/tableau-bord-apercu.js:445`), et la réponse ne parle que de A et C. La question devient « Puis-je modifier les seuils des indices A et C ? » ; la sentinelle du 15 oct. (`:206`) prend la nouvelle ancre, en citant ce verdict.
2. **Les mots de Grégoire** (§ ci-dessous), une fois rendus.

## Décisions de Cowork

- **La bibliographie reste entière** (282 mots) : c'est la seule partie de « Ressources » qui n'existe nulle part ailleurs, et la cible de ~120 mots était une estimation du dossier, pas une décision. Rien n'est retiré.
- Les phrases de la section « Pour Grégoire » qui disent un comportement mesuré (`labo`, `rai-solo`, `grille-depistage`, `bilan-reflexif`, `codex`, `collaboration`, `faq`, `problemes`) restent, sauf objection de Grégoire. Ne lui vont que le titre neuf et les deux phrases de `pan`, qui disent ce qu'est une pratique alternative : sa didactique.

## Les mots de Grégoire

**Validés par Grégoire le 28 oct. 2026 à 13 h 14** (« on garde »), mot pour mot, tels que la demande de relecture les donne : le titre « Glossaire du parcours » et les deux phrases de `pan` (« Une pratique alternative de notation laisse le droit à l'erreur sans pénalité sur la note finale, par des occasions multiples de démontrer sa compétence, et compose cette note à partir des traces les plus récentes ou les plus représentatives. » ; « Deux pratiques de la même famille peuvent y répondre différemment : c'est là que se lit une pratique, plus que dans son étiquette. »). Rien à changer dans ces textes ; note la validation dans le commentaire HTML des deux entrées.

Un commit pour la retouche, un pour les docs ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-2d-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.
