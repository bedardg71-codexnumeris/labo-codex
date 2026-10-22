# Consigne – #1075, la protection et l'intégrité des données

> Claude Code, jeudi 22 octobre 2026, sur `main` après `5bb7ff6d`. Demandée par Cowork (réponse sur l'étape 5) : « écris ta consigne à partir de la fiche et code le lot ». Chantier de sécurité : au moins un banc par défense livrée (règle 5 de `CLAUDE.md`). Commits sur `main`, non poussés ; Vitest complet et specs WebKit ciblées ; une demande de relecture ; ni verdict complet ni push.

## Le compte : dix points dans la fiche, neuf à coder

Cowork annonce « huit défauts » ; la fiche en porte dix, remesurés un à un sur `5bb7ff6d`. **Le point 6 (grille et cartouche de départ) est déjà fait** : #683, décision de Grégoire du 15 oct. à 11 h 04, marque par trimestre (`ressourcesSupprimeesTrimestre`), ancienne marque globale lue et intouchée (le stock assumé). Disposition : *périmé*. Les neuf autres se codent ici. Supposition nommée : le point 10 (rapport de bogue) en fait partie ; son « pas de code d'ici là » valait pour le lot de l'Aide du 15 oct., pas pour #1075.

## Les neuf défenses

| # | Défaut mesuré | Défense | Fichiers |
|---|---|---|---|
| 1 | En anonymisation, le vrai DA s'affiche dans le menu Étudiant·e de « Propriétés du fichier », la liste d'association de l'import et le Comparateur, et part dans le CSV du Comparateur. | Ces trois écrans lisent le DA par `obtenirDAAffichage`. L'import l'échappe aussi (il ne l'était pas). | `liste-evaluations.js`, `travaux-import.js`, `comparateur-pratiques.js` |
| 2 | Trimestre clos : aucune écriture refusée ; la règle CSS vise des `onclick` qui n'existent plus. | `sauvegarderDonneesSelonMode` et `modifierEtAnnoncer` refusent une clé du trimestre actif archivé, hors « mode écriture temporaire » ; le témoin le dit, sauf pour une écriture discrète. Les sélecteurs `onclick` morts sont retirés. | `modes.js`, `index.html` |
| 3 | Une production employée (évaluations, copies) se supprime et s'écrase ; Réglages › Données ne compte pas les copies. | Une seule mesure, `compterEmploisProduction` ; les deux suppressions de la Conception refusent, « Remplacer l'existante » refuse comme pour une grille (#967), Données compte aussi les copies. | `productions.js`, `productions-liste.js`, `modal-doublon.js`, `echelles.js` (`decrirePorteursEchelle` : les copies), `donnees-v2.js` |
| 4 | « Remplacer l'existant » (doublon de copie à l'import) ne propose pas le codex. | Le codex est proposé avant le remplacement ; « Annuler » vaut « Garder l'existant ». | `travaux-ui.js`, `codex.js` (un geste neuf) |
| 5 | Une production de démonstration : déplacer, retirer un bloc, « + Nouveau champ » écrivent dans la démo. | L'écriture refuse une production de démonstration (dans la file) ; la lecture seule désactive aussi les boutons, hors bandeau. | `productions.js`, `bibliotheque-ui.js` |
| 7 | Une page retirée laisse ses annotations, rangées par numéro de page. | Chaque page de l'éditeur garde son rang d'origine ; à l'enregistrement, les annotations du fichier suivent leur page, celles d'une page retirée partent. | `travaux-ui.js`, `travaux-stockage.js` |
| 8 | « Mon profil » supprimé revient au chargement suivant (la copie `profilEnseignant` survit). | La suppression retire aussi la copie quand elle porte le même courriel. | `trimestre-v2-enseignants.js` |
| 9 | Un `.lcz` de pratique n'emporte pas son échelle. | `rassemblerDependances` ajoute l'échelle référencée par la pratique ; l'import la rebranche déjà (`rebrancherReferences`, #627). | `partage-format.js`, `partage-section.js` |
| 10 | L'historique du rapport de bogue garde 30 caractères du texte cliqué (un nom d'élève). | L'historique ne garde que l'élément (id, classe, `data-action`), les suites de chiffres masquées. | `rapport-bug.js` |

## Le stock (« tarir n'est pas réparer »)

- **7** : des annotations déjà décalées par une page retirée avant ce lot restent décalées. Rien ne permet de savoir quelle page a été retirée. Assumé.
- **8** : une copie `profilEnseignant` déjà orpheline revient encore une fois, puis disparaît à la suppression suivante. Assumé.
- **2, 3, 5** : rien d'écrit chez quiconque ; les refus valent à partir de maintenant.
- **9** : les paquets déjà émis restent sans échelle.

## Mes suppositions (à relire)

1. **Trimestre clos** : le refus vaut pour les écritures qui passent par `cle()` vers le trimestre actif archivé. Les clés globales, l'archivage lui-même et la réouverture d'archive, qui écrivent ailleurs, ne passent pas par ces deux fonctions. Une écriture discrète refusée (recalcul, migration) ne s'annonce pas.
2. **Les mots neufs** (enseignant·e seulement, aucun élève) : la raison du témoin pour un trimestre clos, celle d'un exemple de démonstration, la phrase de refus d'une production employée, le geste du codex pour une copie remplacée. Provisoires, listés dans la demande de relecture.
3. **Pivoter une page** ne déplace pas ses annotations (défaut voisin, non vécu) : commentaire dans le code.

## Critère de fin

Chaque défense a son banc, et chaque banc a rougi sur le code d'avant (break-test). Vitest complet vert depuis `tests/`. Specs WebKit ciblées des écrans touchés vertes. La demande de relecture nomme la disposition de chaque point dans `BACKLOG.md`.
