# Consigne – lot court : « Par où commencer ? » en trois étapes, et les tutoriels du blogue

> Écrite le 26 septembre 2026, à 20 h 33 (Toronto), par Cowork. **Ne commence qu'une fois le lot #961 (rétroaction réécrite à la main) poussé et vert** (`git log origin/main`). Au début du lot : archive l'actuelle `CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-961.md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`. À remesurer avant tout code. Des mots seulement, et un lien : aucune donnée, aucune règle ne change.

## 1 · La demande de Grégoire (26 sept., au soir)

Ajouter à l'encadré « Bienvenue dans Labo Codex ! » de l'accueil l'accès aux tutoriels qu'il a créés sur son blogue : https://codexnumeris.org/tutoriels ; et reformuler « Par où commencer ? ». Texte proposé par Cowork, **accepté par Grégoire** ; il a tranché de **garder** la ligne de l'orthopédagogue (sa décision du 12 sept. : « Je veux que l'orthopédagogue sente qu'elle entre par la porte principale »).

## 2 · Les mots, exacts (`js/accueil.js`, `genererBanniereBienvenue`)

Remplace le paragraphe « Par où commencer ? » par :

> **Par où commencer ?**
> 1. **Pose ton cadre.** Dans l'onglet Cadre, saisis ton trimestre, ton cours et ton groupe. Tu les saisis une fois : l'application s'en sert partout.
> 2. **Conçois tes productions et tes évaluations.** Tu peux les élaborer seul·e ou les partager avec tes collègues.
> 3. **Apprends geste par geste.** Les tutoriels de Labo Codex, sur le blogue Codex Numeris, montrent chaque étape en images.
>
> **Tu es orthopédagogue ?** Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent là.

- Une vraie liste numérotée (`<ol>`), pas des `<br>` ; « Tu es orthopédagogue ? » en paragraphe à part, après la liste.
- **Plus aucun tiret cadratin (—) dans l'encadré** : Grégoire le réserve aux dialogues.
- Apostrophes typographiques (’) comme le reste du bandeau.
- Ne touche ni au premier paragraphe, ni à « Certains concepts sont nouveaux ? », ni au courriel, ni à l'encadré de l'AQPC, ni à la carte « Tu es orthopédagogue ? » sous le bandeau.

## 3 · Le troisième bouton

Après « Voir les guides pédagogiques » : **« Voir les tutoriels ↗ »**, un lien `<a class="btn btn-secondaire" href="https://codexnumeris.org/tutoriels" target="_blank" rel="noopener noreferrer">`, avec un texte masqué pour les lecteurs d'écran (« s'ouvre dans un nouvel onglet ») et la flèche en `aria-hidden`. Charge le skill `design-interface` avant : même hauteur et même style que les deux autres boutons, cible tactile iPad, et les trois boutons passent à la ligne proprement sur un écran étroit (`flex-wrap`, à mesurer à 360, 768 et 1024 px). ⚠ Vérifie que la politique d'en-têtes (`_headers`, CSP) ne bloque pas la navigation vers ce domaine.

## 4 · Preuves

- La sentinelle `sentinelle-accueil-porte-ortho-et-champ2-846.test.js` verrouille les mots du bandeau (`MOTS_BANDEAU`) : **mets-y les nouveaux mots**, dans l'ordre rendu ; B1 à B4 inchangés (la carte reste, les huit tâches restent). Ajoute : le lien a la bonne adresse, `target="_blank"` et `rel` avec `noopener` ; aucun « — » dans le rendu du bandeau.
- `sentinelle-640-accueil-porte-entree.test.js` : vert, inchangé.
- Mutations : adresse du lien changée ; `rel` retiré ; ligne de l'orthopédagogue retirée. Chacune rouge.

## 5 · Livraison

Pas de relecture croisée exigée (des mots, un lien, rien qui ne se reprenne) : fusion, release, verdict, push. **Nouvelles**, proposées par Cowork, à faire accepter par Grégoire avant le push : « Accueil : « Par où commencer ? » se lit en trois étapes, et un bouton ouvre les tutoriels de Labo Codex sur le blogue Codex Numeris. »
