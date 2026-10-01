# Consigne du jour – lot I bis, fin : la vérification de la nuit n'a rien rendu ; comprendre, refaire, envoyer

> Écrite le 1er octobre 2026 à 7 h 33 (Toronto) par Cowork. Remplace la consigne de 2 h 12, archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-10-01-lot-I-bis-corrections.md`.
> **Condition de départ** : branche `lot-i-bis-un-seul-terme` à `d7f5efb4`, `version.json` à 1.173.0, `origin/main` à `3736e044`. En ligne : 1.172.0 (Netlify, `commit_ref` `3736e044`, constaté par Cowork le 1er à 7 h 10). Si l'un de ces points est faux chez toi, arrête-toi et dis lequel.

## Ce que Cowork a mesuré, en lecture seule, le 1er à 7 h 10

- `scripts/.verdict-playwright.json` porte toujours `95ed3124` (1.172.0), rendu le 30 à 17 h 49 : aucun verdict sur 1.173.0.
- `tests/test-results/` : 52 `error-context.md`, écrits de 3 h 12 à 6 h 32 (20 dans l'heure de 3 h, 13 à 4 h, 15 à 5 h, 4 à 6 h). Premier message de chacun : 23 fois `TimeoutError: browserType.launch: Timeout 180000ms exceeded`, 28 fois `Test timeout of 30000ms / 90000ms exceeded` (dont 8 pendant la mise en place de la page, du contexte ou d'un `beforeEach`), 1 fois une vraie comparaison.
- La vraie comparaison : `cours-actif-hors-bibliothe…-se-remplit-rien-ne-boucle-webkit`, à 3 h 16, `Expected: "COURS1766455789356"`, `Received: "a2026-601-101-MQ"`.
- 23 dossiers `-retry1` : des essais ont échoué deux fois. Si cette passe tourne encore, elle ne peut plus rendre vert.
- ⚠ Inféré, pas mesuré : une machine qui ne répondait plus (veille, couvercle, mémoire). Cowork ne voit ni les processus du Mac ni son journal de veille. C'est à toi de l'établir.

## Ce que tu fais, dans cet ordre

1. **Dis d'abord si la vérification de la nuit tourne encore** (processus Playwright, WebKit, `verifier-playwright.mjs`, `pousser.sh`). Si oui, arrête-la proprement : ses échecs répétés la condamnent déjà. Ne lance rien d'autre avant.
2. **Établis ce qui s'est passé entre 3 h 10 et 6 h 32**, par mesure : le journal de veille du Mac (`pmset -g log`, lignes Sleep, Wake, DarkWake de la plage), l'état du garde-éveil posé au lot H (#987) pendant cette passe, la sortie de la passe si elle est gardée quelque part, et qui l'a lancée (toi à 3 h 10, ou un autre outil). Rends une cause mesurée, ou dis « pas établie » et ce qui manque. ⛔ Ne corrige rien dans les scripts de vérification à cette étape : si le garde-éveil a un trou, inscris une fiche.
3. **Juge la seule vraie comparaison avant la passe complète** : rejoue cette spec seule, trois fois, sur l'arbre actuel. Verte trois fois : note-la instable dans ton rapport et continue. Rouge de façon stable : arrête-toi, pas de passe complète, pas de push ; dis si le défaut vient du lot I bis (`820fe58e`, `b9998ffd`) ou s'il existait à 1.172.0 (rejoue-la sur `95ed3124` pour le savoir).
4. **Commite les cinq fichiers de Cowork tels quels**, sur la branche : `CONSIGNE-DEMARRAGE-COWORK.md`, `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-30-lot-I-bis.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-10-01-lot-I-bis-corrections.md`, `plans de travail/VERDICT-RELECTURE-2026-10-01-lot-I-bis-un-seul-terme.md`. Ton garde de permissions a refusé ce commit cette nuit ; Grégoire l'autorise en te relayant cette consigne. Si le garde refuse encore, demande-lui un oui explicite et continue sans eux en attendant.
5. **La passe complète au navigateur**, par le chemin habituel (`scripts/pousser.sh`), sur le commit que tu pousseras. Avant de la lancer, demande à Grégoire de confirmer deux choses : Cowork est fermé ; le MacBook est ouvert et branché. Ne la lance pas sans sa réponse.
6. **Verte** : push, fusion vers `main`, mesure chez Netlify (numéro servi, `commit_ref`, heure). **Rouge** : pas de push ; rends la liste des échecs en séparant les délais dépassés des comparaisons fausses, et arrête-toi.

## Ce que tu rends

À Grégoire, trois lignes : ce qui s'est passé cette nuit (cause mesurée ou pas établie) ; le verdict et le numéro en ligne, mesuré chez Netlify ; la porte à faire (`plans de travail/PORTES-TERRAIN-2026-09-30-lot-I-bis.md`, où il ne supprime aucun trimestre ; l'artefact de la porte est à Cowork).
`RELAIS.md` et `OU-EN-EST-ON.md` à jour. Rappel de la règle 11 : le chantier du codex se dit « clos » quand ce lot est en ligne et sa porte passée ; la suite, arrêtée par Grégoire, est le retour aux archives (lot A3).
