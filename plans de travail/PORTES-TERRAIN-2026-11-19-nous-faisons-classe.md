# PORTES TERRAIN — « Mettre ta classe en place », « Nous faisons » (lot `lot/nous-faisons-classe`, 19 au 20 nov. 2026)

> Markdown seul (la trace). **Cowork la relit avant d'en publier l'artefact** (bouton « Copier mes résultats »).
> Règle 1 du skill `portes-terrain` : une porte n'existe que si aucune machine ne peut répondre. Les mots, la
> confirmation présente ou absente, le genre de chaque ligne (flèche, crochet, rien), les deux mesures du relais : un
> banc les juge sous Chromium, aux deux tailles de l'iPad (`tests/integration/nous-faisons-classe-2026-11-19.spec.js`,
> `tests/unit/sentinelle-parcours-classe-2026-11-09.test.js`). Restent Safari sur l'iPad, et l'œil.
> Règle 2 : rien ici n'écrit dans tes vraies données. L'aperçu est une adresse à part, avec ses propres données.
> Ce qui échoue devient un item de backlog, pas une note mentale.

## §0 · Préalable

- [ ] **0.1** Sur l'iPad, ouvre l'adresse de l'aperçu (PR « APERÇU, ne pas fusionner », lien dans le rapport du lot,
      § 7). Recharge. ⮕ Attendu : le numéro en bas de page est **1.250.0** (l'aperçu ne change pas de version : seuls ses
      fichiers changent).
- [ ] **0.2** Regarde l'accueil de l'aperçu (une adresse neuve : ses données sont vides, sans rapport avec les
      tiennes). ⮕ Attendu : aucun trimestre ; le parcours partira de sa bulle 1.

## §2 · Interface (iPad, Safari)

### 2.1 Les flèches devant les gestes

┌ POURQUOI ─────────────────────────────────────────────────────────────
│ Avant ce lot, dans « Nous faisons », seule la dernière ligne (en gras) avait une flèche ; les autres gestes
│ (« Choisis la session et l'année », « Le code du cours »…) n'avaient aucune marque avant d'être faits. Le banc voit
│ la flèche sous Chromium ; Safari dessine ses propres caractères.
└──────────────────────────────────────────────────────────────────────

- [ ] Menu ☰ › Assistance › « Mettre ta classe en place », « Nous faisons ». Regarde la bulle 1.
      ⮕ Attendu : une flèche orange devant « Choisis la session et l'année… » et devant « Donne trois dates… », sans
      gras ; une flèche orange et du texte en gras devant « Touche « Créer le trimestre » » ; rien devant « Cette fois… »,
      « Aie sous la main… », « Le reste du formulaire… ».
      `iPad`

### 2.2 La bulle 1 tient à côté du formulaire

┌ POURQUOI ─────────────────────────────────────────────────────────────
│ La bulle 1 a grandi (l'objectif, deux phrases, la poignée). Sous Chromium, à 1180 × 820, elle ne trouve plus de place
│ libre : elle couvre « Année » et « La fin des cours réguliers » (rapport, § 8, décision 1). Safari sur l'iPad couché
│ a une barre d'adresse : l'écran est plus court encore. Cette porte dit seulement ce que tu vois ; la décision est au §3.
└──────────────────────────────────────────────────────────────────────

- [ ] Couché, regarde la bulle 1 sans rien toucher. Note quels champs elle cache.
      ⮕ Attendu sous Chromium : « Année » et « La fin des cours réguliers » cachés. Ce que tu vois : ______________
      `iPad`
- [ ] Debout (Plus tard, tourne l'iPad, puis Assistance › « Nous faisons » › Reprendre).
      ⮕ Attendu : la bulle à côté du formulaire, aucun champ caché.
      `iPad`

## §3 · Décisions (ce ne sont pas des vérifications : écris ta réponse)

- **3.0** La bulle 1, couchée, cache deux champs à remplir parce qu'elle n'a pas le droit de cacher « Nom du trimestre »
  (règle du 16 nov.). (a) Elle peut cacher « Nom du trimestre » à cette étape ; (b) une bulle plus courte (tes mots) ;
  (c) on garde. Réponse : ______________________

- **3.1** Une personne dont le trimestre existe déjà commence à la bulle 2 : elle ne voit ni l'objectif, ni la phrase
  de la poignée, et la bulle 2 dit « Tu es dans la section « Cours et services » » (sans « Cadre »). À garder ? Sinon :
  la première bulle de chaque passage dit l'objectif et le lieu complet (règle du moteur, tous les parcours).
  Réponse : ______________________
- **3.2** Quatre gestes que l'application ne peut pas voir faits gardent leur flèche sans jamais passer au crochet :
  « Choisis le nombre de séances par semaine », « Pour chaque séance : le jour, le début et la fin » (bulle 5),
  « Choisis une séance déjà donnée… », « Note seulement les absences et les retards » (bulle 7). À garder ?
  Réponse : ______________________
- **3.3** #1296 : la zone de collage de la liste dit « Depuis Excel ou Omnivox... ». Par quoi la remplacer ?
  Réponse : ______________________

## §4 · Ce que je n'ai pas pu vérifier

- **Safari (WebKit)** : rien de ce lot n'a tourné sous WebKit dans le conteneur ; GitHub le juge au push (WebKit Linux,
  qui n'est pas Safari macOS ni iPadOS).
- **Les trois rouges connus de `main`** (Chromium) le sont encore sur `main` ; leur état sur la branche est au rapport
  (§ 4). Le test 1 de `parcours-2-ma-classe` porte sur la place de la bulle 1 : d'où la porte 2.2.
- **Un passage repris** (« Plus tard », puis « Reprendre ») ne confirme pas l'étape faite avant la pause : choisi
  (décision de Cowork, « pendant ce passage »), jugé au banc ; à l'œil, on peut le trouver abrupt.
