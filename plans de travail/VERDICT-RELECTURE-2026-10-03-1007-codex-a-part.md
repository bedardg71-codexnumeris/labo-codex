# Verdict de relecture – #1007, premier lot : un codex à part avant une grosse suppression

> Rendu le 3 octobre 2026 à 3 h 24 (Toronto, mesuré par `date`) par Cowork, sur le commit `3a55b547` (branche locale `claude/1007-codex-a-part`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-02-1007-codex-a-part.md`.

## Verdict : **vert, le lot part**, une fois les mots acceptés par Grégoire. Aucune correction de code demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Lu** (`git diff` de la branche, `js/`) :
- Les six portes appellent `Codex.ecrireAPartAvantSuppression` **après** leurs gardes et **avant** leurs confirmations ; toutes rendent la main sur `false`, et toutes refusent si le module du codex manque (dans le doute, rien n'est supprimé).
- `supprimerGroupeCoursV2` relit la liste après l'écriture (qui a pris du temps) au lieu de filtrer celle d'avant : juste, sinon un changement fait entretemps aurait été écrasé.
- La fenêtre passe ses mots par `confirmerAction`, qui pose le message en texte (`ui-dialogues.js`, `_creer('p', { texte })`) : les noms de trimestre, de groupe-cours et de groupe ne sont pas injectés comme du HTML. Règle n° 1 tenue.
- `genererCodex` passe par l'avertissement de 1.174.0 (`_avertissementDesCopies`), l'écriture est sans adoption et la destination toujours demandée ; `_marquerCodexAJour` n'est pas appelé : le codex habituel reste tel quel.
- Le refus « codex pas à jour » et ses deux fonctions sont retirés sans autre appelant ; le banc du lot I bis qui le verrouillait est retiré et remplacé. Conforme à la décision de Grégoire.

**Exécuté** (extraction de `3a55b547` par `git archive`) : Vitest complet, **7 930 verts sur 7 937** ; les 7 rouges sont les sentinelles qui interrogent git.

**Une mutation de mon cru**, restaurée (empreinte identique, `230b106e08a2e44e`) : la suppression du trimestre qui continue quand le codex à part n'est pas écrit : 1 rouge sur la sentinelle #361.

## Ce que je tranche (technique)

- **Le bouton rouge** : retenu. C'est la variante où « Annuler » a le focus, comme « Écrire sans ces copies » (1.174.0).
- **Le nom du fichier** (`codex-‹nom›-avant-suppression-AAAA-MM-JJ-HHhMM.zip`) : retenu.
- **La release** : **minor**, comme tu le proposes (un comportement neuf sur cinq gestes).
- **X2, le groupe-cours** : la forme courte « l'efface pour de bon » est retenue comme proposition à Grégoire ; elle ne ment pas. Que ses élèves, évaluations et présences restent sans accès par l'écran est un défaut voisin de #1013 : **inscris-le sous #1007, issue 2**.
- **Tes trouvailles** : la question « As-tu exporté tes données ? » de X5, devenue redondante, **inscrite** (issue 2, pour un passage sur les mots) ; les deux noms différents d'un groupe-cours selon la porte, **issue 3** (non vécu) ; l'avertissement qui dit « donne un autre nom », **issue 3**.

## Ce qui remonte à Grégoire

Les quatre variantes de la première phrase, les trois phrases neuves (échec d'écriture, échec de préparation, réussite) et la ligne des Nouvelles. Cowork les lui présente d'un bloc.
