# Consigne du jour – le nouveau texte « À propos » de l'accueil

> Écrite par Cowork le 14 octobre 2026 à 10 h 24 (Toronto, mesurée par `date`). L'ancienne consigne est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-12-lots-20-a-24.md`. Tu peux commiter ce fichier et le déplacement.

## Où on en est

1.200.0 en ligne depuis le 12 oct. ; `main` à `c03969bb` au moment de l'écriture. **Remesure avant de toucher.**

## Le mandat : un seul lot, du texte

Grégoire a réécrit le texte de présentation de la page d'accueil (l'encadré repliable rendu par `genererBanniereBienvenue()` dans `js/accueil.js`). **Les mots ci-dessous sont arrêtés par lui le 14 oct. 2026 : tu les recopies tels quels**, sans retouche de style. Seules libertés : apostrophes typographiques (’) comme le reste du fichier, et les espaces devant ? ! : « » selon la convention déjà en usage dans ce fichier.

### Ce qui change

1. **Le titre de la barre repliable** (`.banniere-bienvenue-titre`, dans le `<button>`) devient : `À propos`
2. **Le corps** (`#banniere-bienvenue-corps`) est remplacé, de son début jusqu'à `${paragrapheCommunaute}` exclu, par ce qui suit, dans cet ordre. Le gras est indiqué par `**…**`.

- Ligne de tête, rendue comme « Par où commencer ? » (même classe) : **Bienvenue dans Labo Codex !**
- Paragraphe : Labo Codex est un outil de soutien à l’enseignement et au suivi des apprentissages.
- Paragraphe : L’application te propose de numériser ton travail et de traiter les micro-données que tu crées et recueilles dans ton enseignement et elle les rend visibles et interprétables. Elle te permet ainsi de mieux voir les conditions de ton écosystème-classe et de mieux planifier tes interventions.
- Paragraphe : Il n’y a aucune intelligence artificielle dans l’application. Aucune décision n’est prise à ta place. L’outil ne fait que t’éclairer et ton jugement professionnel est souverain.
- Paragraphe : Labo Codex n’offre pas la possibilité de scroller très longtemps et elle ne provoque pas de grandes bouffées de dopamine. Par contre, elle permet de réfléchir à ta pratique et de te libérer un peu de ta charge mentale.
- Paragraphe : Tu peux planifier, concevoir, évaluer et suivre la progression de tes étudiant·es. Les mêmes gestes que d’habitude, mais dans un seul outil numérique et portable ! Labo Codex est gratuit, ouvert et indépendant !
- Ligne de tête (inchangée) : **Par où commencer ?**
- Liste numérotée (même `<ol>` qu'aujourd'hui) :
  1. **Pose ton cadre.** Dans l’onglet Cadre, saisis ton trimestre, ton cours et ton groupe. Tu les crées une fois et l’application s’en sert par la suite.
  2. **Conçois tes productions et tes évaluations.** Tu peux les élaborer seul·e ou les partager avec tes collègues.
  3. **Apprends pas à pas.** Les tutoriels de Labo Codex, sur le blogue Codex Numeris, te montrent chaque étape en images.
- Paragraphe (inchangé, garde la constante `QUESTION_ORTHOPEDAGOGUE`) : **Tu es orthopédagogue ?** Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent là.
- Paragraphe (inchangé) : **Certains concepts sont nouveaux ?** Trois guides expliquent la taxonomie SOLO, les micro-données et le modèle RàI, accessibles en tout temps par les boutons « Guide ».
- Paragraphe, **sans** amorce en gras (l'ancienne « Ton courriel, une fois par mois. » disparaît) : Tu entres ton adresse de courriel, tu reçois un code et c’est tout ! Une fois entré·e, tu restes connecté·e un mois sans avoir à redemander de code. Tes données restent sur ton appareil. Il n’y a pas de commerce. Le seul échange souhaité est ton feedback et tes rapports de bugs (si tu en rencontres).

### Ce qui ne change pas

`paragrapheCommunaute` (l'encadré AQPC), les trois boutons, la mécanique de repli (`basculerBanniereBienvenue`, préférence `banniereAccueilRepliee`), l'`id` et les classes de la bannière, la carte de l'orthopédagogue en dessous.

### À tenir à jour dans le même lot

- Le JSDoc de `genererBanniereBienvenue()` : son titre cite « Bienvenue dans Labo Codex » ; ajoute une ligne d'historique datée du 14 oct. 2026 (texte réécrit par Grégoire, titre « À propos »).
- `tests/unit/sentinelle-accueil-porte-ortho-et-champ2-846.test.js` : `MOTS_BANDEAU` épingle l'ancien texte. Remplace-le par les mots ci-dessus (titre « À propos » compris), commentaire daté du 14 oct. Break-test : remets un mot de l'ancien texte dans le rendu, le test doit rougir.
- Le bloc de jetons d'`index.html` (changement dans `js/`).
- Si un document de `docs/` cite l'ancien texte : ne le touche pas, liste-le dans la demande de relecture sous « Documents à mettre à jour ».

### Source ou stock

Source seulement : du texte rendu, rien n'est écrit chez l'utilisateur. Une personne qui avait replié l'encadré le retrouve replié, sous son nouveau titre : c'est voulu.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-14-accueil-a-propos.md` avec la ligne de changelog que tu proposes (les mots de la ligne « Nouvelles » remontent à Grégoire). **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Rapport court à Grégoire en gestes d'utilisateur : ce qu'il verra en ouvrant l'accueil.

## Verdict de Cowork, 14 oct. 2026 à 10 h 37 (Toronto, mesuré par `date`)

**Relu sur `92f63708` : conforme, sans correction.** Les mots du rendu (`js/accueil.js`, l. 96 à 112) ont été comparés paragraphe par paragraphe à la consigne : identiques, apostrophes typographiques comprises ; « Bienvenue dans Labo Codex ! » porte la classe de « Par où commencer ? » (`banniere-bienvenue-titre-etapes`, définie dans `styles.css`) ; l'étape 2, l'orthopédagogue et les guides sont inchangés. Les deux suppositions de Claude Code (espace ordinaire devant ? et !, titre « À propos » vérifié à part) sont acceptées.

- Le rouge Vitest de la sentinelle anti-cache est attendu jusqu'à la release du soir ; il ne justifie aucune retouche.
- `docs/refonte-textes/textes-manquants-bloc4.md` : document de refonte validé le 19 avril, historique ; issue 3, on ne le touche pas.
- La ligne « Nouvelles » (§ 4 de la demande de relecture) sera soumise à Grégoire avec la release du soir, pas avant.

**Prochain mandat** : aucun pour l'instant. Grégoire ouvre ce matin les décisions du groupe 1 (sauvegarder, ouvrir et archiver ses données, #992) ; la consigne suivante en sortira.
