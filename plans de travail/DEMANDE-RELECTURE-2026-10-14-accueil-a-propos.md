# Demande de relecture – le nouveau texte « À propos » de l'accueil

> Claude Code, 14 octobre 2026, 10 h 32 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md` de Cowork, 10 h 24.
> Sur `main` (tiré à `95f857e0`, 14 commits de documentation des sessions du nuage, avance rapide), **non poussé, pas de release, pas de verdict Playwright**.

## 1 · Ce que Grégoire verra en ouvrant l'accueil

La barre repliable du haut s'intitule « À propos » au lieu de « Bienvenue dans Labo Codex ! ». Déplié, l'encadré s'ouvre sur « **Bienvenue dans Labo Codex !** » en ligne de tête (même style que « Par où commencer ? »), puis cinq paragraphes de présentation, la liste des trois étapes, les lignes de l'orthopédagogue et des guides, et le paragraphe d'accès, qui n'a plus d'amorce en gras. L'invitation AQPC, les trois boutons et la carte de l'orthopédagogue sont inchangés. Une personne qui avait replié l'encadré le retrouve replié, sous son nouveau titre.

## 2 · Ce qui est livré

| Pièce | Détail |
|---|---|
| `js/accueil.js` | titre « À propos » ; le corps remplacé jusqu'à `${paragrapheCommunaute}` exclu, avec les mots de la consigne recopiés tels quels ; `QUESTION_ORTHOPEDAGOGUE` est gardée ; JSDoc : titre mis à jour et ligne d'historique du 14 oct. |
| Sentinelle #846 | `MOTS_BANDEAU` reprend les mots neufs, dans l'ordre du rendu. Le titre est épinglé à part (`TITRE_BANDEAU`, essai neuf) parce que « À propos » s'écrit aussi ailleurs dans `js/` (Réglages › À propos) et que l'essai « un seul lieu d'écriture » l'aurait refusé. Le même essai vérifie que cinq fragments de l'ancien texte sont absents |
| `index.html` | `js/accueil.js?v=20261012a` → `?v=20261014a` (le jeton n'avait jamais servi, vérifié par `git log --all -p`) |

**Deux suppositions, à corriger au besoin.**
- **Espaces devant ? et !** : j'ai mis des espaces ordinaires, comme partout dans le corps existant. L'ancien titre était la seule ligne du fichier à porter une espace insécable (« Codex !») ; elle disparaît avec lui.
- **« Bienvenue dans Labo Codex ! »** reprend la classe `banniere-bienvenue-titre-etapes` de « Par où commencer ? », comme le demande la consigne.

**Break-tests** (copie de référence, une mutation à la fois, empreinte `f1db7e07…` identique après chacune) :

| Mutation dans `js/accueil.js` | Résultat |
|---|---|
| « Apprends pas à pas. » redevient « Apprends geste par geste. » | 3 rouges |
| la barre redevient « Bienvenue dans Labo Codex ! » | 2 rouges |
| l'amorce « Ton courriel, une fois par mois. » est remise | 1 rouge |

Les trois sont consignés dans le journal en bas de la sentinelle.

## 3 · Tests

Vitest complet depuis `tests/` : **751 fichiers ; 8 755 verts, 1 rouge, et ce rouge est attendu.** Il vient de `sentinelle-anticache-fichiers-modifies` : `js/accueil.js : ?v=20261014a (build 1012-1211)`. Cette sentinelle exige un jeton du jour du *build*, et le build reste celui de 1.200.0 tant qu'il n'y a pas de release. Les lots 20 à 24 étaient dans le même état : leurs commits ne changeaient que le jeton, et c'est la release (`df8f386f`) qui a réaligné le tout. Je n'ai pas lancé `release.mjs --build-only`, puisque la consigne interdit toute release avant le signal de Grégoire. **La release le remettra au vert.** Le hook pré-push lance Vitest, donc ce rouge bloquera aussi un push fait avant la release.

## 4 · Ligne de changelog proposée (les mots de la section « Nouvelles » reviennent à Grégoire)

> **L'accueil se présente autrement.** L'encadré du haut s'intitule maintenant « À propos ». Il dit ce que Labo Codex fait (rendre visibles les micro-données de ton enseignement) et ce qu'il ne fait pas : aucune intelligence artificielle, aucune décision prise à ta place.

Type proposé : `patch` (du texte, aucun comportement).

## 5 · Documents à mettre à jour

- `docs/refonte-textes/textes-manquants-bloc4.md`, l. 13-15 : il cite l'ancien titre « Bienvenue dans Labo Codex » et l'ancien paragraphe de présentation. Je ne l'ai pas modifié. Le JSDoc d'`accueil.js` le nomme encore comme « source texte d'origine (validé 19 avril 2026) », ce qui reste vrai historiquement.

## 6 · Source ou stock

Source seulement : c'est du texte rendu à l'écran, et rien n'est écrit chez l'utilisateur. La préférence `banniereAccueilRepliee` n'est pas touchée.
