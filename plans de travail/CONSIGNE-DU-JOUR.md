# Consigne de la prochaine séance — un mot sous la note du cours, puis l'audit de l'onglet Suivi

> **Écrite le 5 septembre 2026 en soirée, par Cowork, à froid, avec Grégoire.**
> **Application au moment de l'écriture : 1.122.0 en ligne (build `0905-1722`) ; `main` = `origin/main` = `12df341a`,
> run GitHub 33994473211 vert (Vitest et Playwright WebKit), premier run complet vert depuis 1.120.0.**
> ⚠ **Nom sans date, exprès.** Au démarrage, Claude Code le promeut : archive `CONSIGNE-DU-JOUR.md` (celle du 5, la carte
> « Bilan ») sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-05-carte-bilan-1.120.md`, renomme celui-ci en `CONSIGNE-DU-JOUR.md`,
> et **remesure avant d'exécuter** (`git --no-optional-locks log --oneline -5`, `cat version.json`, `TZ=America/Toronto date`) :
> si 1.122.0 n'est plus la version en ligne, dis-le en tête de ton rapport. Les deux fichiers partent avec le premier commit.

## Ce que cette séance produit à l'écran, pour Grégoire

Deux choses, dans cet ordre, et la première est courte.

**1. Un mot sous la note du cours** (patch, une livraison). Grégoire a arrêté les deux phrases qu'un enseignant lit
sous « Performance globale (P) » et « Note finale de session » quand des évaluations sont écartées par #706 :
« N évaluations en brouillon, non comptées » (inchangée) et **« N évaluation(s) sans critère évalué, non comptée(s) »** —
retirer « aucun » de la formulation livrée en 1.122.0, le reste tient. Accord en nombre, sentinelle mise à jour,
release `patch` par `scripts/release.mjs`, rituel de fin de session, **verdict du run GitHub lu avant tout autre push**
(règle 7 : le vert local n'a rien prouvé tant que le serveur n'a pas jugé).

**2. Le troisième audit cadré : l'onglet Suivi.** Prompt : `Rapports/prompts-audit/PROMPT-AUDIT-onglet-suivi-2026-09-05.md`.
Le lire en entier, puis les flux H des deux premiers rapports (`Rapports/AUDIT-moteur-evaluation-2026-09-05.md`,
`Rapports/AUDIT-pratique-de-notation-2026-09-05.md`), dont il repart sans les remesurer. Lecture seule sur `js/`,
exécution en bac à sable Vitest, branche `audit/onglet-suivi-<date>` partie de `origin/main`, jamais sur `main`.
Quatre élèves de banc dont **un sans aucune évaluation** ; palier et indices attendus calculés à la main avant le code.
Dépose `Rapports/AUDIT-onglet-suivi-<date>.md` au format des deux premiers (en-tête mesuré, flux A à H, verdict
`[exécuté]` ou `[lecture]`, disposition PROPOSÉE par constat, ce qui fonctionne avec sa preuve, « ce que je n'ai pas
regardé »), et **la seconde moitié de la question ne se saute pas** : la sortie du volet confidentiel a été cherchée
dans chaque flux de G et le résultat est écrit, même quand il est « rien ». Transcription : dispositions dans
`Rapports/ultrareview-lot-6-travaux-saisie.md` (N1-N6) et dans les §5.3, §8, §9 de
`Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`. N'applique aucun correctif : Grégoire arbitre.
Une fois déposé : statut du prompt à « exécuté » avec `rapport_produit`, une ligne dans `OU-EN-EST-ON.md` sous
« L'ÉVALUATION » (ou une section « LE SUIVI » si tu juges que l'audit la mérite — dis-le), sans numéro de fiche en
tête de ligne. La branche d'audit se fusionne (documents et banc seulement) ; **le lot de correction attend l'arbitrage.**

## À inscrire au passage, avec les fiches #710 à #721

`plans de travail/CADRAGE-2026-09-05-non-remis-par-famille.md` (dans l'arbre, non commis, contenu de Cowork) : ce que
vaut un travail non remis dans la note du cours, **famille par famille**, règle de Grégoire du 5 septembre (zéro en
sommative ; ignoré en « meilleures notes » si le minimum est atteint ; « propre à l'utilisateur »). Première mesure due :
ce que chaque famille fait aujourd'hui de `statutRemise: 'non-remis'`. **Après le 14.** Sa ligne d'index est déjà dans
`00-CADRAGES-OUVERTS.md` (modifié, non commis). Commets les fichiers de Cowork tels quels.

## Ce qui ne se fait PAS dans cette séance

- Aucun correctif né de l'audit du Suivi : arbitrage de Grégoire d'abord.
- Aucun des constats moyens #710-#721 ni #700-#705 : après le 14.
- Ne pas rouvrir la règle #706 ni la traduction #708 : livrées, jugées par la CI, à éprouver par Grégoire à l'écran.

## Ce qui est dû par Grégoire, et que cette séance ne code pas à sa place

- **Deux gestes à l'écran sur 1.122.0** : le profil d'un élève avec une copie en brouillon (la note du cours sans elle,
  la ligne dessous) ; une pratique créée depuis « Partir d'un modèle » › « Modèle simple » (deux projets et un examen
  au-dessus de 75 % → 90 ; un projet et un examen → 70 ; avant 1.122.0, toute la classe à 0).
- **L'arbitrage des fiches #700-#705 et #710-#721**, après le 14.
- **Le renommage de la page « Les huit gestes »** en « Ce qu'il reste à faire » : proposé par Cowork, pas encore tranché.
