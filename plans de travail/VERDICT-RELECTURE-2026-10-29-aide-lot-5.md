# Verdict de relecture – L'Aide, lot 5 : les textes d'écran (#1152)

> Cowork, jeudi 29 octobre 2026, 6 h 46 (Toronto, mesuré par `date`), sur `main` = `0558dce5`. Lu : la demande de relecture ; la liste des 55 fichiers de `6f65ecbf` et le diff des fichiers qui pourraient être lus par des étudiant·es (`synthese-retroaction-rendu.js`, `profil-etudiant-rapport.js`, `bilan-reflexif-*`, `registre-longitudinal.js`) ; la branche retirée de `materiel-*` au commit d'avant (`a314c1c1`) ; l'autorisation sur `noms_stables.json` dans TEXTES ; `interventions.js` (« Séance concernée ») ; les textes restants (« Reprise ciblée », « le comparateur », la cartouche verrouillée, le HEIC). Vitest et Playwright non rejoués.

## Verdict

**Accepté, avec une retouche de mots (décisions de Cowork, ci-dessous).** Ce que la relecture a vérifié :

- **`noms_stables.json`** : l'entrée retirée est celle que Grégoire a autorisée (28 oct., 14 h 42, notée dans TEXTES) ; rien d'autre dans ce fichier.
- **La branche des rétroactions de l'ancien assistant était bien morte** : au commit d'avant, seul `'descripteurs'` est jamais posé (`materiel-dissection-lecture.js:914`) ; `estRetro` ne pouvait pas être vrai, la carte « Tes rétroactions » ne pouvait pas s'afficher.
- **« élève » → « étudiant·e »** : les fichiers qui pourraient sembler lus par les étudiant·es ne changent que des phrases lues par l'enseignant·e (la « Vue recalculée », l'introduction du bilan réflexif, le registre). **Le registre longitudinal suit la règle de Grégoire** (« étudiant·e » dans les textes affichés) : c'est un écran d'enseignant ; décision de Cowork, dite à Grégoire.
- L'exemple du n° 4, corrigé comme TEXTES le prévoyait ; « n/5 configurés » et « Reprise ciblée » masquée : justes (techniques, aucune donnée ne bouge).
- L'incident des sabotages (trois fichiers mal restaurés, puis restaurés depuis git) : les trois commits portent ce que la demande décrit, la sentinelle neuve et Vitest le tiennent.

## La retouche (Claude Code)

Mots lus par l'enseignant·e seulement : décisions de Cowork, conséquences de décisions déjà prises.

1. **« le comparateur »** devient « l'Exploration des pratiques », le nom de l'écran : `comparateur-pratiques.js:59, 69, 722` (accords suivis : « L'Exploration des pratiques est un outil expérimental… », « …est en construction… », « …s'appuie sur… ») ; le bouton de l'assistant (`wizard-pratique-v2.js:2062`) : « Ouvrir l'Exploration des pratiques ». Toute autre occurrence affichée que tu trouves suit ; les commentaires et les noms de code, non.
2. **« Reprise ciblée » comme jeton qu'on accorde aujourd'hui** : retire-la des textes qui la proposent : la bulle `cn-pratique-jetons` (`accompagnement-contenu-hover.js:322`, la liste devient « Délai (prolonger l'échéance) ou Reprise (refaire la production) »), l'aide de l'assistant (`accompagnement-contenu-popup.js:1647`, « délai, reprise (optionnel) »), et l'exemple « (ex. : reprise ciblée) » de `accompagnement-contenu-hover.js:360` et d'`evaluation-chargement.js:1189, 1224` (la parenthèse part ; « Modifiez » y devient « Modifie », l'application tutoie). **Garde-la** là où elle nomme une reprise ciblée déjà faite : badges, profil, journal, filtre de la Liste des évaluations, bulles `:381` et `:383`, synthèse.
3. **La cartouche verrouillée** : le conseil « Les cartouches peuvent être verrouillées une fois finalisées… » (`accompagnement-contenu-popup.js:236-239`) part, comme celui des grilles au n° 2 (`verrouille: false`, champ inerte).
4. **Le HEIC** : la bulle n° 9 `nav-labo-modelisation` dit « (PDF, JPG, PNG ; HEIC selon le navigateur) », comme le bouton ; TEXTES est à jour (ligne ↻ du n° 9), la sentinelle du lot 5 le lira. L'entrée `labo` de l'Aide (`index.html`, « (PDF, JPG, PNG ou HEIC) ») suit, mêmes mots.
5. Sentinelles suivies par décision, en citant ce fichier ; un break-test sur le n° 9 ; Vitest depuis `tests/`.

## Ce qui attend Grégoire (rien à coder avant sa réponse)

- ~~**« Séance concernée »**~~ **tranchée : A, par Grégoire le 29 oct. à 6 h 46** (« oui » ; voir « Retouche 2 »). Recommandation de Cowork **A** (retirer le champ et la phrase de l'Aide) : le report des présences écrit tout à la date de l'intervention, présent·es comme absences motivées (`interventions.js:1838-1845`) ; le congé n'a de sens que si le rattrapage prend la place d'une séance du cours, à sa date : le champ redit cette date. B changerait où s'écrivent les absences motivées des prochains reports, et celles déjà reportées resteraient à la date de l'intervention (tarir n'est pas réparer) : deux conventions côte à côte.
- **Les jetons actifs par défaut** (le moteur retombe sur « actif » quand la case s'affiche décochée) : à mesurer par Cowork, puis à Grégoire. ↻ **Tranchée par Grégoire le 29 oct. à 7 h 51** : consigne `CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md`, après le lot 2 des standards.
- **Les bulles de la démo** (`TEXTES-2026-10-28-guidage-demo.md`) : Cowork les relit en entier d'abord, puis les soumet à Grégoire par groupes de trois ou quatre.

Un commit pour la retouche, un pour les docs (ce fichier, `TEXTES-2026-10-28-textes-d-ecran.md`) ; demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-29-aide-lot-5-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.

## Retouche 2 – Retirer « Séance concernée » (décision de Grégoire, 29 oct. 2026, 6 h 46)

Si la retouche 1 est déjà faite, celle-ci se fait à part, dans son propre commit ; sinon, avec elle, en commits séparés.

1. **Le champ part du formulaire** : le bloc « Séance concernée : » et son \`input\` (\`js/interventions.js:1085-1088\`), son écriture à l'enregistrement (\`:1554\`, et le \`null\` de \`:1557\`), et ce qui le cache sur un service (\`:805\`). Le bloc « Gestion des absences » garde sa phrase (« Les étudiant·es non sélectionné·es pour cette séance de rattrapage bénéficieront d'un congé (absence motivée). ») et \`marquerNonParticipantsMotives\` ne change pas.
2. **Le code sans appelant part avec lui** : \`obtenirAbsencesMotiveesParDate\` et son export (\`:1907-1986\`), après \`grep\` sur \`js/\` et \`tests/\` ; les commentaires qui le citent (\`:100\`, \`:786\`) disent ce qui reste.
3. **Aucune donnée réécrite** : une intervention déjà enregistrée garde sa clé \`seanceConcernee\`, sans lecteur (sentinelle #772 : l'enregistrement conserve ce que le formulaire ne montre pas). Une intervention neuve ne l'écrit plus (\`:269\`). Le report des présences ne change pas : tout reste à la date de l'intervention.
4. **L'Aide** : la phrase de \`planifier-rai\` (\`index.html:11070\`) qui dit que la fiche « porte la séance concernée » perd ce morceau, et rien d'autre ; dis dans la demande la phrase avant et après.
5. Les bancs qui posent \`interventionSeance\` (\`sentinelle-lot-5-interventions-cadrage-11\`, \`sentinelle-rencontre-sans-criteres-cibles-lot-c\`, \`audit-onglet-suivi-2026-09-05\`) suivent par décision, en citant ce fichier ; un essai neuf : le formulaire d'un rattrapage n'a plus de « Séance concernée », et une intervention qui portait la clé la garde après enregistrement. Break-test. Vitest depuis \`tests/\`.

La demande de relecture de la retouche couvre les deux.


## Relecture des deux retouches (Cowork, 29 oct., 7 h 47)

**Acceptées sans retouche. Le lot 5 est clos côté relecture.** `f6a3827f` et `809c7d04` lus. Les trois écarts sont justes : la ligne ↻ de TEXTES commitée avec le code que la sentinelle lit ; la phrase entière de l'Aide retirée (« porte la séance concernée » ôté, il ne restait rien : c'est ce que Grégoire a accepté, « avec la phrase de l'Aide qui en parle ») ; `js/config.js:123`, un commentaire en zone protégée, laissé. Le « Labo → Comparateur » de la bibliothèque des pratiques, trouvé en plus : juste. Une intervention qui porte `seanceConcernee` la garde (essai neuf de #772, `sauvegarderPresencesIntervention`) ; `_construireIntervention` ne sert qu'aux interventions neuves.

Restent, hors de ce lot : les jetons actifs par défaut et les bulles de la démo (Cowork, puis Grégoire).
