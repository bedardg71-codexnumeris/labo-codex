# La nuit du 8 au 9 novembre 2026 : neuf sessions dans le cloud

**Écrit par Cowork le 8 nov. 2026 vers 22 h (heure de Montréal), troisième version** (le parcours 9 et la deuxième partie des parcours ajoutés, à la demande de Grégoire). En ligne : 1.237.2. Sur le Mac, la première partie du lot « Les deux parcours » (le panneau « Assistance », le moteur des parcours, « Découvrir ») est commitée sur `lot/parcours-1-et-2` ; Claude Code la pousse, avec ce fichier et les consignes, après son verdict. **Grégoire n'a pas encore jugé ses captures** : il les juge demain matin.

Grégoire a lancé les neuf sessions avant d'aller dormir : **personne ne répond avant le matin.** Chaque session lit d'abord ce fichier en entier (règles communes), puis seulement sa section.

## Règles communes, pour les neuf sessions

1. **Pars de la branche que ta section nomme, à jour** (`origin/main`, `origin/lot/parcours-1-et-2`, ou celle d'une autre session). Une branche à toi, au nom donné dans ta section. Jamais `main` : pas de fusion, pas de push sur `main`, pas de release, pas de `scripts/release.mjs`, rien au changelog.
2. **Ta consigne et ce fichier sont sur `main`.** Si ta section part d'une autre branche, lis-les avant d'en changer, ou par `git show origin/main:"plans de travail/<fichier>"`, et recopie ta consigne dans ta branche : elle se commite avec ton lot.
3. **N'écris que dans tes propres fichiers** : le code de ton lot et ton rapport. **Ne touche pas** `BACKLOG.md`, `FILE-DES-CORRECTIFS.md`, `OU-EN-EST-ON.md`, `RELAIS.md`, `SESSION.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : neuf branches qui les écrivent la même nuit se marchent dessus, et plusieurs prendraient le même numéro de fiche. Ce qu'une consigne te fait inscrire au backlog va dans la section « À inscrire au BACKLOG » de ton rapport ; la session du Mac l'inscrira à la fusion, sous le prochain numéro.
4. **WebKit n'existe pas ici.** Les specs et les captures Playwright se font sous Chromium ; dis-le dans ton rapport. Le verdict WebKit et les captures WebKit se prendront sur le Mac, branche par branche, au retour.
5. **Les données réelles de Grégoire ne sont pas ici.** Tout ce qu'une consigne demande « sur son groupe » ou « sur ses données » attend le Mac : écris-le dans ton rapport comme « à mesurer sur le Mac ».
6. **Aucun texte lu par l'utilisateur ne change sans son accord.** Les textes qu'une consigne dit validés se posent mot pour mot. Tout autre texte : tu le proposes dans ton rapport, à corriger ; tu ne le poses que là où ta section le permet, marqué comme proposé. Une phrase validée qui ne tient pas devant le code : tu ne la retouches pas, tu proposes.
7. **Personne ne répond cette nuit.** Une question qui te bloque s'écrit dans ton rapport, en français d'utilisateur, avec ta recommandation ; tu continues ce qui n'en dépend pas. Si plus rien ne peut avancer sans réponse, tu t'arrêtes proprement.
8. `CLAUDE.md` s'applique en entier : sécurité, zones protégées, aucun nom d'élève réel (des noms manifestement fictifs), Vitest depuis `tests/`, les trois issues d'une trouvaille.
9. **Une relecture par un agent neuf** pour toute session qui code (`BOUCLE-SANS-RELAIS.md`, § 4, point 4) ; son verdict en une ligne dans ton rapport.
10. **Ton rapport** : `plans de travail/RAPPORT-2026-11-09-<ta section>.md`, commité sur ta branche. En tête, en gestes d'utilisateur : ce qui est fait, ce qui attend Grégoire (une question par ligne, avec ta recommandation), ce que tu n'as pas pu vérifier. Puis le détail. **Pousse ta branche** à la fin, et à chaque étape importante.

## Sessions parties de `origin/main` : indépendantes des parcours

### Session A : écarter une copie plagiée, ou lui mettre 0

**Branche** : `lot/copie-non-recevable-choix`, partie de `origin/main`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-copie-non-recevable-choix.md`.
- Fais le lot en entier : la règle de la pratique, le choix sur la copie, les calculs de chaque famille, la terminale, le dépistage, les essais et leurs break-tests.
- Ses trois textes (la ligne sur la copie, la question à la création de la pratique, le paragraphe de l'Aide) : pose ta proposition dans le code pour que l'écran fonctionne, et liste-les en tête de ton rapport comme **proposés, en attente de Grégoire**.
- Dans la complétion, une copie non recevable reste non remise : ne change rien à ce qui compte comme remis. La session D y touche cette nuit.
- La relecture croisée de Cowork (règle 2 de `PROTOCOLE.md`) viendra au matin.
- Rapport : `RAPPORT-2026-11-09-copie-non-recevable-choix.md`.

### Session B : « production » plutôt que « copie », le relevé

**Branche** : `mesure/production-plutot-que-copie`, partie de `origin/main`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-production-plutot-que-copie.md`.
- Le premier temps seulement : le relevé complet, rangé (a, b, c), et ta proposition pour chaque occurrence de (a). Aucun autre texte posé.
- Exception prévue par la consigne : le texte déjà validé du rappel « Mets ton codex à jour » se pose mot pour mot.
- Rapport : `RAPPORT-2026-11-09-production-plutot-que-copie.md`.

### Session C : les deux liens vers la carte d'alignement, la mesure

**Branche** : `mesure/deux-liens-vers-la-carte`, partie de `origin/main`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-deux-liens-vers-la-carte.md`.
- La mesure et la proposition que demande la consigne, **sans code**.
- Rapport : `RAPPORT-2026-11-09-deux-liens-vers-la-carte.md`.

### Session D : la complétion suit la remise

**Branche** : `lot/completion-suit-la-remise`, partie de `origin/main`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-completion-suit-la-remise.md`.
- **D'abord la mesure** que demande la consigne, écrite dans ton rapport et poussée.
- **Puis le code, à une condition** : ta mesure montre que le dénominateur peut rester tel qu'il est, que la règle n'a pas à s'étendre aux autres familles pour être juste en sommative, et que la complétion n'entre dans aucune note. Si l'un des trois points demande une décision de Grégoire, **n'écris pas de code** : rapport seulement, avec ta recommandation. La session H attend ta réponse pour savoir si elle peut faire le troisième parcours : **la première ligne de ton rapport dit « Codé » ou « Pas codé »**.
- Décision de Grégoire du 8 nov. : une copie importée puis marquée non recevable n'est pas remise, qu'elle soit écartée ou mise à 0.
- Rapport : `RAPPORT-2026-11-09-completion-suit-la-remise.md`.

## Sessions parties de `origin/lot/parcours-1-et-2` : la suite des parcours

Ces lots s'appuient sur le panneau « Assistance » et le moteur des parcours, faits dans la première partie. **Ce code n'est pas encore jugé par Grégoire** : s'il demande des changements demain, vos branches se remettront sur la nouvelle base. D'où trois règles en plus :
- **Ne modifie pas ce que la première partie a posé** (le panneau, le moteur, « Découvrir ») au-delà de ce qu'il faut pour ajouter ton parcours : une entrée dans la liste du panneau, ses étapes, sa condition d'entrée. Si le moteur te manque, écris dans ton rapport ce qu'il faudrait, et contourne sans le refondre.
- Garde l'ordre des parcours que dit ta consigne, même si les autres ne sont pas là. Plusieurs branches toucheront la même liste du panneau : c'est attendu, la fusion sur le Mac s'en charge.
- Captures Chromium aux largeurs que demande ta consigne ; les WebKit se refont sur le Mac.

### Session E : le sixième parcours, « Mettre tes données à l'abri »

**Branche** : `lot/parcours-6-donnees-a-l-abri`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md`. Le lot en entier, selon sa consigne. ⚠ Ce parcours ne fait jamais ouvrir un codex : ouvrir un codex remplace l'espace de travail. Rapport : `RAPPORT-2026-11-09-parcours-6-donnees-a-l-abri.md`.

### Session F : le septième parcours, « Lire ta classe et intervenir »

**Branche** : `lot/parcours-7-lire-ta-classe`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md`. Le lot en entier ; ses entrées « INSCRIS AU BACKLOG » vont dans « À inscrire » de ton rapport. Rapport : `RAPPORT-2026-11-09-parcours-7-lire-ta-classe.md`.

### Session G : le huitième parcours, « Automatiser tes commentaires »

**Branche** : `lot/parcours-8-automatiser-tes-commentaires`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-8-automatiser-tes-commentaires.md`. Le lot en entier ; ses entrées « INSCRIS AU BACKLOG » vont dans « À inscrire » de ton rapport. Rapport : `RAPPORT-2026-11-09-parcours-8-automatiser-tes-commentaires.md`.

### Session I : le neuvième parcours, « Mettre en place ta notation alternative »

**Branche** : `lot/parcours-9-notation-alternative`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md`. Le lot en entier ; ses entrées « INSCRIS AU BACKLOG » vont dans « À inscrire » de ton rapport. Rapport : `RAPPORT-2026-11-09-parcours-9-notation-alternative.md`.

### Session H : la deuxième partie, puis, si possible, les parcours 3, 4 et 5

Cette session avance en chaîne : chaque lot part du précédent, sur sa propre branche, et se pousse avant le suivant.

1. **La deuxième partie de « Les deux parcours »** (« Mettre ta classe en place »). Branche `lot/parcours-2-ma-classe`, partie de `origin/lot/parcours-1-et-2`. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md`, partie 2. ⚠ La consigne veut que Grégoire juge les captures de la partie 1 avant la partie 2 : **il a choisi, le 8 nov. à 21 h 46, de la faire faire cette nuit quand même.** Si son jugement de demain change la partie 1, ta branche se remettra dessus. Rapport : `RAPPORT-2026-11-09-parcours-2-ma-classe.md`.
2. **Le troisième parcours, seulement si la session D a codé.** Regarde la première ligne de `plans de travail/RAPPORT-2026-11-09-completion-suit-la-remise.md` sur `origin/lot/completion-suit-la-remise` (`git fetch`, puis `git show`). Si elle dit « Codé » : branche `lot/parcours-3-evaluer`, partie de ta branche de l'étape 1, dans laquelle tu fusionnes `origin/lot/completion-suit-la-remise` ; consigne `…-parcours-3-evaluer.md`. Si elle dit « Pas codé », ou si le rapport n'y est pas encore, passe à l'étape 4.
3. **Puis le quatrième et le cinquième parcours**, chacun parti du précédent (`lot/parcours-4-recevoir-et-rendre`, `lot/parcours-5-monter-ton-cours`), selon leurs consignes. Un rapport par lot.
4. **Si tu ne peux pas coder le troisième** : sur une branche `mesure/verifications-parcours-3-a-5`, partie de ta branche de l'étape 1, vérifie contre le code toutes les sections « À VÉRIFIER AVANT DE POSER LES TEXTES » des consignes des parcours 3, 4 et 5 : « tient », « ne tient pas » ou « non vérifiable ici », avec le fichier et la ligne, et la phrase corrigée proposée quand une phrase validée ne tient pas. Aucun code. Rapport : `RAPPORT-2026-11-09-verifications-parcours-3-a-5.md`.

## Au matin, sur le Mac

Grégoire juge d'abord les captures de « Découvrir » et du panneau. Cowork lit les rapports et les lui ramène une question à la fois. Les branches se vérifient sous WebKit et se fusionnent une à une, après son accord : `lot/parcours-1-et-2`, puis `lot/parcours-2-ma-classe`, puis celles qui en partent ; la session du Mac inscrit alors au BACKLOG ce que chaque rapport range sous « À inscrire ».
