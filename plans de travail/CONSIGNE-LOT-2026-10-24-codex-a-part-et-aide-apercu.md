# Consigne – les mots du codex à part, et l'aide de la fenêtre d'aperçu (samedi 24 octobre 2026)

> Écrite par Cowork le samedi 24 octobre 2026 à 9 h 01 (Toronto, mesuré par `date`).
> **À exécuter APRÈS le lot du verrou dans la palette Annotation** (`CONSIGNE-LOT-2026-10-24-verrou-dans-la-palette-annotation.md`) : une seule session écrit dans `js/` à la fois.
> Suite du verdict `VERDICT-RELECTURE-2026-10-24-apercu-codex-mots.md` (dispositions).

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Commit de docs seul, fichiers nommés : cette consigne et `VERDICT-RELECTURE-2026-10-24-verrou-palette-annotation.md` (relecture du lot du verrou, acceptée avec un complément : § 3 bis ci-dessous).

## 1. Le codex à part (mots validés par Grégoire à 9 h 01, mot pour mot)

Quand la fenêtre d'aperçu s'ouvre pour **le codex à part avant une suppression** (`ecrireCodexAPartAvantSuppression`, `codex.js`, l. ~3692) :

- Titre : **Écrire le codex à part**
- Bouton : **Écrire**

« Mettre à jour le codex » et « Enregistrer sous » gardent « Mettre à jour le codex » / « Mettre à jour ». L'archive, la configuration et les tampons gardent « Confirmer l'export … » / « Télécharger ».
Chemin : une option de `genererCodex` passée par `ecrireCodexAPartAvantSuppression` (proposé au § 3 de ta demande de relecture). Le banc `apercu-codex-mots-1024.spec.js` attend ces mots à l'étape 3 ; break-test.

## 2. L'aide du « i » et son nom lu par le lecteur d'écran (mots de Cowork)

Une seule aide pour tous les appelants de la fenêtre (codex, archive, configuration, tampons) : des mots vrais pour chacun, sans « export », sans « téléchargement », sans le jargon interne (« Défense K-β », « payload », « MODELE-MENACES.md ») qui s'affiche aujourd'hui à l'enseignant.

- `js/securite-export-preview.js` (l. ~89), `aria-label` du bouton d'aide : **« Aide : ce que contient le fichier »**
- `js/accompagnement-contenu-popup.js`, entrée `'modal-export-preview'` (l. ~1725), remplacée par :
  - titre : « Ce que contient le fichier »
  - texte : « Cette fenêtre te montre ce qui va entrer dans le fichier (la liste des fichiers et dossiers, ou celle des champs pour un fichier JSON), avant qu'il soit écrit. Tu peux encore annuler si quelque chose te paraît inattendu. »
  - liste « Ce que tu dois vérifier » :
    - « Les noms correspondent à ce que tu veux enregistrer : pas de chemin étrange, pas de fichier caché. »
    - « Pour un fichier JSON, les champs sont ceux que tu attends. »
    - « Le nombre de fichiers ou de champs correspond à ce que tu as préparé. »
  - alerte (attention) : « Si tu vois un nom que tu ne reconnais pas, clique « Annuler » et signale-le. »

Mesure d'abord qui lit le titre de cette entrée (les `voirAussi`, un index de l'aide, un banc qui le cite) : rien ne doit pointer vers l'ancien titre.

## 3. En passant

- `index.html` : le commentaire du `<script>` de `securite-export-preview.js` dit encore « Beta 99.41 : #256-bis … » (remarque 1 du verdict) ; le jeton change avec ce lot, la note suit.

## 3 bis. Le complément du lot du verrou (verdict de 9 h 33)

`basculerVerrouDepuisAnnotation` (`evaluation.js`) : quand le chargement de l'évaluation n'aboutit pas (`_attendreEvaluationChargee` rend faux), rien n'est écrit, et c'est juste ; mais rien n'est dit, et Grégoire se retrouve en « Évaluer » sans savoir pourquoi son clic n'a pas verrouillé. C'est le lot qui n'est pas fini, pas une trouvaille. Mots de Cowork, par le canal de notification d'échec déjà en usage dans `evaluation.js` :

- **« L'évaluation n'a pas été verrouillée : son chargement n'a pas abouti. »**

Un test du banc `verrou-palette-annotation-1024.spec.js` qui force l'échec du chargement et lit ce message ; break-test.

## 4. Clôture

- **Pas de release, ni verdict, ni push** : le lot rejoint ceux du jour.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-codex-a-part-et-aide-apercu.md`.
- Trouvailles en chemin : les trois issues de `CLAUDE.md`, nommées.
- Termine par le geste à vérifier à l'écran après la prochaine mise en ligne : supprimer un élément qui propose d'écrire le codex à part, choisir « Écrire le codex à part » ; la fenêtre d'aperçu titre « Écrire le codex à part » et son bouton dit « Écrire » ; son « i » ouvre « Ce que contient le fichier ».
- Le message du § 3 bis ne se voit pas à l'écran sans provoquer une panne : pas de geste à vérifier, le banc en répond.
