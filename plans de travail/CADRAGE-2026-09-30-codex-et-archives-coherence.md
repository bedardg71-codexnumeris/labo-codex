# Cadrage – le codex d'aujourd'hui et l'architecture des archives : sont-ils cohérents ?

> Écrit le 30 septembre 2026 à 10 h 49 (Toronto) par Cowork, à la demande de Grégoire : « m'assurer que ce que nous faisons est compatible avec ce qui a été créé et que nous allons développer encore davantage ». Lecture seule du dépôt. Chaque constat dit s'il est **lu** (dans un document ou dans le code), **mesuré** ou **inféré**. Rien ici n'a été exécuté dans l'application.

## 1 · Le verdict, en quatre lignes

1. **Le travail d'aujourd'hui (lots J0, J0 bis, J0 ter) est compatible avec l'architecture des archives.** Il change la façon de fabriquer et d'enregistrer le fichier, pas ce qu'il contient ni son format.
2. **Il la prépare même** : « Archiver… » fabrique encore son fichier à l'ancienne sous Safari ; la pièce écrite ce matin est exactement celle qui lui manque.
3. **Mon idée d'un codex « en deux morceaux » doublonne en partie ce que l'architecture prévoit déjà.** Elle passe au second rang (§ 5).
4. **La pièce qui manque à ton plan n'est pas bâtie** : retirer de l'application les copies d'un trimestre déposé aux archives. Elle touche ta règle du 20 septembre sur l'effacement (§ 4).

## 2 · Ce que l'architecture prévoit (lu : `docs/architecture/ECOSYSTEME-DONNEES.md`, document fondateur du 26 avril 2026)

Quatre objets, chacun son rôle :

| Objet | Rôle | Contenu |
|---|---|---|
| **Codex** | l'espace de travail du trimestre courant, portable | données et copies d'**un** trimestre |
| **Archives** | le coffre local ; rien n'y est détruit | par **groupe-cours** : `donnees.json`, `travaux/`, `meta.json` (identifiant unique) ; un dossier sur disque, pas un ZIP |
| **Codex data** | extrait léger pour la recherche | données sans copies, plusieurs trimestres |
| **Voûte** | partage entre enseignants | à venir |

Cycle prévu en fin de trimestre : archiver le groupe-cours, puis « le codex peut être purgé des données du trimestre terminé : les originaux sont dans les archives ».

## 3 · Ce qui est bâti (lu dans le code)

- **« Archiver… »** (menu Codex, `Reserve.verserGroupeCours`, `js/reserve.js`) : dépose un groupe-cours, données et copies, avec identifiant unique, empreinte des données, et `meta.json` écrit en dernier comme preuve de complétude. Deux modes : écriture directe dans un dossier (Chrome et Edge), ou un ZIP à décompresser soi-même (Safari, donc ton Mac et ton iPad).
- **« Ouvrir une archive… »** (`js/reserve-ouvrir.js`) : relit une archive et en réimporte des ressources (grilles, échelles, productions, cartouches).
- **« Charger un codex data… »** : livré le 6 mai 2026 (#251).
- **Une copie peut déjà exister « sans son fichier »** : l'état `blobStatut: 'exporte'` est connu du codex (il n'attend pas ce fichier dans le ZIP), de l'import, et de l'écran des copies (badge). Tes évaluations d'A2025, sans fichier, vivent déjà ainsi.
- **Non bâti** : le retrait des copies après archivage. La spécification le dit en toutes lettres : « Purge post-versement : non. Le versement est une copie, pas un déplacement. »

## 4 · Les écarts entre le document et la réalité

| Le document dit | La réalité | Conséquence |
|---|---|---|
| Un codex porte **un** trimestre, 400 à 800 Mo | Le tien porte trois trimestres (A26, A25, H26), 1,33 Go (mesuré le 29 sept.) | C'est l'écart qui te mène vers la borne de 2 Go |
| Le codex est compressé (DEFLATE) | Depuis ce matin, les copies y sont rangées telles quelles | Aucun conflit : le document note lui-même que compresser des copies ne rapporte rien |
| Le codex « peut être purgé » après archivage | Rien ne retire les copies de l'application | **La pièce manquante** |
| Les archives sont un dossier | Sous Safari, c'est un ZIP à décompresser à la main | Sur ton Mac et ton iPad, l'archive est un fichier, pas un dossier navigable |
| Quota de l'iPad : environ 1 Go | Ton codex de 1,33 Go vit sur l'iPad | Chiffre périmé |

**Un risque lu au code, non mesuré** : sous Safari, « Archiver… » confie encore toutes les copies à JSZip (`new JSZip()`, `dossierTravaux.file(id, blob)`, `generateAsync`), comme le codex d'avant ce matin. Pour un groupe-cours lourd, j'infère le même mur de mémoire sur l'iPad, et le même refus du partage après une préparation longue. Le jour où tu archives H26 depuis l'iPad, tu risques de revivre ce matin.

**La tension avec ta règle du 20 septembre** (« je ne veux pas qu'on efface des données de façon irréversible ») : ton plan, garder les données d'un trimestre antérieur sans ses copies, demande de retirer des copies de l'application. C'est à toi de dire à quelle condition ce retrait cesse d'être « irréversible ». Proposition de Cowork : une copie ne quitte l'application que si l'archive qui la contient a été **relue et vérifiée** par l'application (chaque fichier présent, intact), et si l'archive sait la **rendre**.

## 5 · L'option « en deux morceaux », développée, et pourquoi elle recule

**Ce que c'était** : à chaque mise à jour, un petit fichier de données (environ 10 Mo, complet) ; les copies enregistrées à part, seulement quand il y en a de nouvelles.

**Ce qu'elle changerait à l'écran** : « Mettre à jour le codex » deviendrait presque instantané la plupart du temps ; de temps à autre, l'application dirait « tu as N nouvelles copies à enregistrer » et produirait un second fichier. Pour rouvrir un codex sur un autre appareil, il faudrait les deux.

**Ce qu'elle coûte** : deux fichiers à garder ensemble au lieu d'un ; un troisième objet à expliquer à la cohorte, à côté du codex et des archives ; un format de plus à relire pendant des années.

**Pourquoi elle recule** : l'architecture a déjà sa réponse au poids. Ce ne sont pas les copies du trimestre courant qui te mènent à 2 Go, ce sont celles des trimestres passés qui voyagent encore dans le codex. Les déposer aux archives règle le poids sans inventer d'objet. Les deux morceaux restent une option pour plus tard, si le trimestre courant à lui seul devient trop lourd.

**Non mesuré** : ce que pèse chaque trimestre dans ton codex. C'est la première mesure à faire ; elle dit combien l'archivage te rend.

## 6 · Ce que le chantier des archives devrait contenir, dans l'ordre (proposition)

1. **Mesurer** le poids de chaque trimestre dans ton codex, et ce que « Archiver… » produit aujourd'hui pour H26 sur ton Mac.
2. **Fabriquer l'archive comme le codex de ce matin** (sans charger les copies en mémoire, avec la fenêtre du toucher frais). Réemploi direct du lot J0 ; « Exporter une sélection » (#991) suit la même voie.
3. **Relire et vérifier une archive** : l'application ouvre l'archive et confirme que chaque copie y est, intacte.
4. **Rendre une copie** depuis une archive (la voie de retour pour les copies ; aujourd'hui elle existe pour les grilles et les échelles, pas pour les copies, à confirmer par la mesure).
5. **Alléger** : retirer de l'application les copies d'un groupe-cours archivé et vérifié. Les données restent, les évaluations restent lisibles, comme pour A2025.
6. **Lever ou déplacer la borne de 2 Go** à l'ouverture (#992), si elle gêne encore après l'étape 5.

Les étapes 3 à 5 touchent tes données réelles : chacune passe par toi.

## 7 · Ce que je n'ai pas vérifié

- Rien n'a été exécuté : tout vient de la lecture du document fondateur, de la spécification et du code.
- Si « Ouvrir une archive… » sait ou non remettre des copies dans un trimestre (lu : elle les compte ; pas lu qu'elle les restaure).
- Ce qui pose aujourd'hui l'état « exporté » sur une copie, et si ce geste est encore atteignable à l'écran.
- Le poids par trimestre, et le comportement réel d'« Archiver… » sur un groupe lourd.
- Si tu as déjà des archives quelque part, et dans quel état.

## 8 · Décisions de Grégoire, 30 septembre 2026 (vers 10 h 56)

1. **La condition du retrait des copies, acceptée** (« la condition que tu poses est bonne ») : *une copie ne quitte l'application que si l'archive qui la contient a été relue et vérifiée par l'application, et si cette archive sait la rendre.* C'est ce qui rend le retrait compatible avec sa règle du 20 septembre.
2. **Deux notions, deux mots** (constat de Grégoire, confirmé au code) :
   - **Trimestre clos** : terminé, notes remises, en lecture seule dans le navigateur ; on le « clôt », on peut le « rouvrir ». C'est l'état que le code nomme aujourd'hui « archivé » (`archiverTrimestre` dans `js/trimestres.js`, le bandeau du bas et sa case, le badge du trimestre). Mot accepté : « Oui, c'est le bon terme. »
   - **Trimestre archivé** : déposé dans les archives, hors du navigateur, et vérifié (`Reserve.verserGroupeCours`, « Archiver… » du menu Codex).
3. **L'ordre de vie d'un trimestre** : en cours → clos → archivé → allégé de ses copies (seulement s'il est archivé et vérifié).
4. **Constat de Grégoire sur ses données** : son automne 2025 est clos, pas archivé ; il ne vit que dans son navigateur. Les archives sur un média externe « n'existent pas encore tout à fait » chez lui.

À reporter dans `docs/architecture/ECOSYSTEME-DONNEES.md` (vocabulaire de référence) quand le chantier s'ouvre.
