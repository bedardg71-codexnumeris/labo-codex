# Verdict de relecture – #1014, le codex emporte aussi la corbeille et la Modélisation ; la fenêtre des rapports archivés échappée

> Rendu le 2 octobre 2026 à 18 h 52 (Toronto, mesuré par `date`) par Cowork, sur le commit `b9f98e27` (branche locale `claude/1014-codex-complet`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-02-1014-codex-complet.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Lu** (`git diff e1bb1df6 b9f98e27 -- js/`) :
- `_clesDesListesDeFichiers` : les copies de travail gardent leur règle (`includes`) ; corbeille et Modélisation par nom exact, nu ou préfixé `[aeh]AAAA_` ou `demo_`. Les identifiants de trimestre sont bien `session.toLowerCase() + année` (`trimestres.js`, l. 513), sessions A, H, E : le motif les couvre. La sauvegarde de migration (`corbeilleFichiers_backup_v1`) est écartée, à juste titre.
- L'avertissement de 1.174.0 ne compte que les copies de travail (`estUneCopie`), à l'écriture comme à l'export de sélection : conforme à la consigne.
- L'ouverture ne cherche les deux nouvelles listes que si le manifeste les déclare : un codex d'avant s'ouvre comme avant, sans faux manque. Ta supposition est retenue.
- La Modélisation n'accepte que `.pdf,.jpg,.jpeg,.png,.heic` (`modelisation.js`, l. 253) : tous passent `validerMagicBytes`. Un fichier de Modélisation ne sera donc pas refusé à l'ouverture pour son type.
- `_extensionDansLeCodex` : une extension hors liste devient `bin` ; l'ouverture retrouve le fichier par son id, quelle que soit l'extension. Juste.
- `rapport-bug.js` : prénom, date, description et id (texte et `data-param`) passent par `echapperHtml`. Je ne vois plus rien de la donnée injecté brut dans cette fonction.
- La sentinelle #614 réancrée : elle lit la constante, qui nomme les trois listes. Retenue.

**Exécuté** (extraction de `b9f98e27` par `git archive`, dépendances Linux) : Vitest complet, **7 931 verts sur 7 938** ; les 7 rouges sont les sentinelles qui interrogent git.

**Une mutation de mon cru**, restaurée (empreinte identique, `4f98726390c05b97`) : la corbeille retirée de `LISTES_DE_FICHIERS` : 3 rouges sur la sentinelle #614. Le reste du lot n'est jugé que par tes bancs Playwright, que je n'ai pas rejoués.

## Tes trouvailles

Les quatre (Modélisation non rangée par trimestre ; « copie » dans le bilan pour un fichier de Modélisation ; l'archive d'un groupe qui laisse les fichiers de la corbeille ; la fusion de codex qui ne regarde qu'un trimestre) : **à inscrire, issue 2**, avec le texte de ton § 10.

## Tes trois gestes pour Grégoire (§ 12)

- **Les fichiers de Cowork et le push des documents** : la consigne de mise en ligne les porte, avec l'accord de Grégoire.
- **La taille chez lui : pas de lecture** (décision de Cowork, technique). Une copie à la corbeille est purgée après 30 jours, la Modélisation n'accepte que des PDF et des images : le surplus est borné, et la taille du fichier de sa prochaine mise à jour le montrera (inféré : je n'ai pas vérifié qu'un écran l'affiche). Rien à faire de son côté.

## La suite

La release, quand Grégoire aura accepté la ligne des Nouvelles.
