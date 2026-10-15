# Décisions du 15 octobre 2026 – la fin du groupe 1 (sauvegarder, ouvrir et archiver ses données)

> Écrit par Cowork. Dernière écriture : 15 octobre 2026, 9 h 58 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 1 (resté sur `origin/claude/inspiring-mccarthy-99htj8`, absent de `main`).
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le prochain lot qui y écrit.

## L'état des huit questions du groupe 1

| Question | Fiche | Issue |
|---|---|---|
| 1. Le codex près de 2 Go | #992 | Faite le 14 oct. : l'hiver 2026 clos, archivé ; codex 254,7 Mo (Finder) |
| 2. Effacer seul l'ancien espace après une ouverture sur iPad | #336 | **Retirée par Cowork**, voir plus bas |
| 3. Une suppression qui reste malgré une ancienne sauvegarde | #463 | **Décidée par Grégoire à 9 h 57 : on ne change rien** |
| 4. Les 44 évaluations sans échelle | #544 | **Sortie** : décision de Grégoire du 1er sept. 2026 (notes d'H2026 non rouvertes, non signalées) |
| 5. La fenêtre du codex à part | #1020 | Faite le 15 oct. (lot « Ton codex dit vrai ») |
| 6. Le message d'échec du codex | #994 | Faite le 15 oct. |
| 7. Les tailles de fichier | #993 | Faite le 15 oct. |
| 8. Faire entrer l'hiver 2024 | #35 | Attend la question 5 du groupe 4 (la comparaison entre trimestres), qui est sa seule raison d'être |

## Question 3 (#463) – décidée par Grégoire à 9 h 57 : « On ne change rien »

**La prémisse du document du 11 oct. était fausse.** Il disait : « c'est déjà la règle des grilles, des échelles et des cartouches ; seules les productions reviennent en silence ». Mesuré au code le 15 oct. (sous-agent en lecture seule, `main` à `962f1214`, non vu à l'écran) : les cinq familles se comportent pareil.

| Chemin | Production, pratique, grille, échelle, cartouche supprimées |
|---|---|
| Ouvrir un codex plus ancien | Reviennent sans message : l'ouverture remplace chaque clé (`codex.js` ~830-845). Voulu : c'est ce qui rend utile le codex à part |
| Import par cases (sauvegarde) ou Réserve › ouvrir une archive | Proposées comme neuves, cases décochées, sans repère de suppression (`import-export.js` ~2253, `reserve-ouvrir.js` ~292-354, ~931). Dans la Réserve, cocher une production ou une cartouche coche la grille ou l'échelle qu'elle désigne (~977-1000) |
| Fichier de partage | N'entrent jamais dans ses collections : « Partagés » seulement (`partage-import.js` ~18-33) |

- Le registre `ressourcesSupprimees` n'a que quatre lecteurs, tous des semis de gabarits codés en dur ; aucun chemin d'import ne le lit.
- Aucune des cinq familles ne passe par une corbeille (la seule corbeille est celle des fichiers de copies).
- Écarté : un registre des suppressions sur le patron des élèves (#1012). Motifs : l'ouverture d'un codex doit continuer de tout ramener ; l'import par cases demande un geste ; l'identité des ressources est fragile (renommage des ids en conflit, dédoublonnage par le nom) ; risque non vécu ; complexité ajoutée.

**Ligne à poser sous #463 :** `**Décidé par Grégoire le 15 oct. 2026 à 9 h 57 : on ne change rien** pour les suppressions gardées. Mesuré au code le 15 oct. : une production, une pratique, une grille, une échelle ou une cartouche supprimée revient par « Ouvrir un codex » (voulu : remplacement complet) ; à l'import par cases, elle est proposée décochée ; un partage n'entre que dans « Partagés ». Détail : plans de travail/DECISIONS-2026-10-15-groupe-1-fin.md. Restent ouvertes les autres parties de la fiche (« écraser » par id gardé, sort des magasins de cartouches au retrait d'une grille).`

## Question 2 (#336) – retirée par Cowork

Elle proposait que l'application efface d'elle-même, après l'ouverture complète d'un codex sur l'iPad, ce qui reste de l'ancien espace. Lu au code (`codex.js`, § « 5 ter ») : ce « reste » comprend toute clé et tout fichier de copie absents du codex ouvert, donc aussi ce qui est né après lui et n'existe nulle part ailleurs. **La règle de Grégoire du 20 sept. 2026 l'exclut** (aucun lot dont le code supprime définitivement des données d'utilisateur). Le motif d'origine, le manque d'espace, n'est plus pressant depuis l'archivage de l'hiver 2026. L'aperçu de purge reste tel quel ; son sort dans le code est une question technique, à part.

**Ligne à poser sous #336 :** `**Retiré le 15 oct. 2026 (Cowork)** : l'effacement automatique de l'ancien espace après l'ouverture d'un codex ne se fera pas. Il emporterait aussi des données nées après le codex, qui n'existent nulle part ailleurs : exclu par la règle de Grégoire du 20 sept. 2026. L'aperçu reste tel quel. Détail : plans de travail/DECISIONS-2026-10-15-groupe-1-fin.md.`

## Question 4 (#544) – sortie

Exclue par la décision de Grégoire du 1er sept. 2026 inscrite dans `CLAUDE.md` (les notes d'A2025 et d'H2026 ne sont pas rouvertes). Rien à lui soumettre.

**Ligne à poser sous #544 :** `**Sortie le 15 oct. 2026** : hors champ par la décision de Grégoire du 1er sept. 2026 (notes d'A2025 et d'H2026 non rouvertes, CLAUDE.md, « Zones protégées »).`
