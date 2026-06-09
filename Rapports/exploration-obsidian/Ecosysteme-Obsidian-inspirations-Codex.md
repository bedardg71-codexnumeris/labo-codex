# Écosystème Obsidian — inspirations pour Labo Codex

> **Date** : 9 mai 2026
> **Objet** : exploration descriptive de l'écosystème Obsidian et identification de ce qui pourrait inspirer la construction de l'écosystème Labo Codex
> **Posture** : exploration, pas prescription. Ce document n'est pas un plan d'action.

---

## Avertissement préliminaire

Ma compréhension d'Obsidian est celle d'un utilisateur informé, pas d'un membre de l'équipe. Mes connaissances datent de mai 2025 et l'écosystème évolue rapidement. Je signale au fil du texte ce qui est observable factuellement (« Obsidian propose X ») de ce qui est inférence ou jugement (« cela produit comme effet… »).

L'écosystème Codex est *à inventer*, pas à copier. Obsidian est un repère, pas un modèle.

---

## L'écosystème Obsidian — onze composantes

### 1. Le format ouvert comme socle (Markdown)

**Ce que c'est** : tout coffre Obsidian est un répertoire de fichiers `.md` plats. Aucun fichier propriétaire, aucune base de données chiffrée. Tu peux ouvrir un coffre dans VS Code, dans Sublime, dans GitHub, dans n'importe quel éditeur Markdown.

**L'effet écosystémique** : le format ouvert n'est pas qu'une commodité utilisateur — c'est ce qui *permet à un écosystème de tiers de naître*. Des outils comme Logseq, Foam, Dendron ou Quartz peuvent lire des coffres Obsidian. Des scripts Python ou Ruby peuvent les traiter. Des sites statiques peuvent les publier. L'écosystème prospère parce que la donnée n'appartient pas à l'app.

**Inspiration pour Codex** : tu fais déjà ça partiellement (JSON + ZIP, fonctionnement hors-ligne, propriété de la donnée). Ce qui manquerait pour atteindre le même effet : une **spec publique du format** (`.codex.zip` et `.codex-data.json` documentés formellement, versionnés, stables). Sans cette spec écrite, tes formats restent « définis par le code », ce qui décourage les tiers d'écrire des outils compatibles. C'est probablement le levier le plus structurant.

---

### 2. La philosophie « Local-first »

**Ce que c'est** : Obsidian fonctionne entièrement hors-ligne. Le serveur (Sync, Publish) est *additionnel*, jamais central. Si Obsidian disparaît demain, ton coffre reste utilisable.

**L'effet écosystémique** : confiance utilisateur durable. Pas de risque de captation, pas de pivot business qui détruit ton outil. Cette confiance est ce qui permet à Obsidian d'avoir des power-users qui investissent des années dans leur coffre.

**Inspiration pour Codex** : alignement déjà parfait. Codex fonctionne hors-ligne, ne dépend d'aucun serveur. À préserver comme un actif, à mettre en avant explicitement dans la communication.

---

### 3. Plugins communautaires (extensibilité par les utilisateurs)

**Ce que c'est** : Obsidian a un store de plugins (~2000+, observable dans l'app). Les plugins sont écrits en JavaScript/TypeScript, hébergés sur GitHub, validés par l'équipe Obsidian avant publication dans le store officiel. Exemples emblématiques : Dataview (requêtes sur les notes), Templater (templates dynamiques), Excalidraw (dessin), Kanban (tableau).

**L'effet écosystémique** : croissance organique sans coût de développement pour Obsidian. Un utilisateur qui a un besoin niche le code lui-même, et son plugin sert à 10 000 autres. La diversité des plugins est ce qui rend l'app utilisable pour des cas d'usage qu'Obsidian n'a pas pensés (recherche académique, GTD, fiction, etc.).

**Inspiration pour Codex** : ton CSP `script-src 'self'` rend les plugins JS dangereux à autoriser (et casser le CSP serait un recul majeur). Mais l'idée — *laisser les utilisateurs étendre l'app* — peut prendre une autre forme. Pour Codex, ce serait une **marketplace de configurations pédagogiques** plutôt que de code : grilles, échelles, productions, cartouches, séquences, gabarits, partagés sous CC BY-NC-SA. La Voûte décrite dans `ECOSYSTEME-DONNEES.md` est exactement ce concept. La nouveauté serait de la penser explicitement comme un *marché de matériel*, pas seulement comme un dépôt.

---

### 4. Thèmes et personnalisation visuelle

**Ce que c'est** : Obsidian propose un store de thèmes communautaires. Personnalisation purement esthétique, plus simple que les plugins (CSS).

**L'effet écosystémique** : appropriation. Les utilisateurs façonnent leur outil à leur image. Côté business, c'est anecdotique. Côté communauté, c'est un signal fort de respect de l'utilisateur.

**Inspiration pour Codex** : ton design system est unifié et cohérent — c'est un atout, pas un manque. Une marketplace de thèmes n'a pas grand sens pour un outil pédagogique d'enseignant en action (vs un outil de notes personnelles). À garder en réserve pour plus tard, voire jamais.

---

### 5. Templates et coffres partagés

**Ce que c'est** : ce n'est *pas* une fonctionnalité officielle d'Obsidian, mais un phénomène communautaire. Des sites comme Obsidian Hub, Awesome Obsidian, ou des dépôts GitHub partagent des templates de coffres : « coffre étudiant », « coffre GTD », « coffre recherche académique », etc. Souvent avec des dossiers types, des templates de notes, des plugins recommandés.

**L'effet écosystémique** : courbe d'apprentissage adoucie. Un nouvel utilisateur n'a pas à concevoir son coffre depuis zéro — il télécharge un template qui correspond à son cas d'usage et l'adapte. Cela démultiplie les cas d'adoption.

**Inspiration pour Codex** : très transposable. Tu pourrais imaginer des « configurations pédagogiques de démarrage » par discipline ou par approche : « configuration philosophie 101 », « configuration mathématiques cégep », « configuration littérature avec ELLAC », etc. Soit officielles (toi + partenaire), soit communautaires (déposées par d'autres enseignants). C'est un usage très naturel de la Voûte.

---

### 6. Sync E2EE (service payant facultatif)

**Ce que c'est** : Obsidian Sync (4 USD/mois en formule de base, 8 USD/mois en formule chiffrée bout-à-bout) synchronise un coffre entre appareils. La version E2EE chiffre la donnée avec une clé dérivée du mot de passe utilisateur, le serveur ne voit que des blobs chiffrés.

**L'effet écosystémique** : finance le développement de l'app sans compromettre la philosophie « own your data ». L'utilisateur peut quitter Sync à tout moment et continuer à utiliser Obsidian gratuitement.

**Inspiration pour Codex** : c'est probablement la composante la plus directement transposable. Pour des données étudiantes (Loi 25), l'E2EE n'est pas un nice-to-have — c'est ce qui rend le service défendable juridiquement. Le modèle économique « app gratuite, sync payante » est aligné avec ta préoccupation initiale (couvrir les coûts serveurs).

---

### 7. Publish (publier un coffre au public)

**Ce que c'est** : Obsidian Publish (8 USD/mois) permet de publier tout ou partie d'un coffre comme un site web public. Liens préservés, navigation par graphe possible. Cas d'usage typique : « digital gardens » (jardins de pensée), documentation publique, sites personnels.

**L'effet écosystémique** : transforme un coffre privé en bien commun. Beaucoup de chercheurs et d'auteurs publient des « gardens » qui sont à la fois leur outil de pensée et leur publication. La frontière privé/public devient un curseur.

**Inspiration pour Codex** : peu pertinent dans le cœur — un trimestre de données étudiantes n'a pas vocation à être public. *Mais*, l'idée d'**exposer publiquement une partie de son corpus pédagogique** (les configurations, les grilles, les séquences, sous CC BY-NC-SA) est exactement ce qu'est la Voûte publique. La nouveauté serait de penser cela non comme un dépôt passif, mais comme une *publication* avec son propre URL, ses métadonnées, sa navigabilité. Un cégep ou un département pourrait avoir son « jardin pédagogique » public.

---

### 8. Communauté (forum, Discord, Reddit)

**Ce que c'est** : Obsidian a un forum officiel très actif, un Discord avec dizaines de milliers de membres, un subreddit r/ObsidianMD avec des centaines de milliers d'abonnés. L'équipe Obsidian y participe, mais ne le contrôle pas. Beaucoup d'entraide entre utilisateurs.

**L'effet écosystémique** : support distribué (les utilisateurs s'aident entre eux), marketing organique (chaque tutoriel, chaque post, chaque vidéo est de l'acquisition gratuite), retour terrain (l'équipe voit ce qui marche et ce qui frustre).

**Inspiration pour Codex** : à long terme, oui — mais avec une nuance québécoise. Le bon équivalent pour des enseignants de cégep n'est probablement pas un Discord ouvert, mais quelque chose de plus structuré : groupe AQPC, communauté Profweb/Eductive, forum CCDMD, ou simplement liste de diffusion départementale. La culture professionnelle enseignante est moins informelle que la culture knowledge worker globale d'Obsidian. Le contenant doit être adapté.

---

### 9. Documentation comme « dogfooding »

**Ce que c'est** : Obsidian Help (la documentation officielle) est elle-même un coffre Obsidian publié via Obsidian Publish. Tu peux la cloner, l'ouvrir dans ton propre Obsidian, voir comment elle est structurée. C'est une démonstration vivante de l'outil.

**L'effet écosystémique** : cohérence pédagogique. Les utilisateurs apprennent l'outil en utilisant l'outil. La documentation devient un exemple de ce qui est possible.

**Inspiration pour Codex** : très transposable. Tes 167 fichiers `.md` de documentation sont déjà là. Une « Voûte de documentation Codex » que les utilisateurs peuvent ouvrir dans leur app (lecture seule, en namespace temporaire, comme une archive consultable) serait à la fois un onboarding et une démonstration. Le mécanisme « ouvrir une archive en lecture seule » de l'écosystème Codex (cf. `ECOSYSTEME-DONNEES.md`) est exactement la primitive nécessaire.

---

### 10. API publique pour plugins

**Ce que c'est** : Obsidian expose une API JavaScript documentée que les plugins peuvent appeler. Cela permet d'intégrer l'app à d'autres outils (Zapier, Make, Raycast, Alfred, scripts personnels).

**L'effet écosystémique** : Obsidian devient une *plateforme*, pas juste une app. Des intégrations apparaissent que l'équipe n'avait pas imaginées.

**Inspiration pour Codex** : ton CSP rend une API JS classique incompatible. Mais une **API par fichiers** est totalement viable et probablement plus alignée avec ta philosophie : un dossier de surveillance que d'autres outils peuvent peupler ou lire (`.codex-import/`, `.codex-export/`), un format CLI standardisé pour l'export-import, une convention pour qu'un script externe génère un fichier que Codex importe. C'est l'approche « Unix » : faire des outils qui se composent par les fichiers, pas par les API. C'est moins flashy que des plugins, mais ça respecte tes contraintes de sécurité.

---

### 11. Modèle économique aligné avec la philosophie

**Ce que c'est** : Obsidian est gratuit pour usage personnel, paie pour licence commerciale (50 USD/an, peu appliqué), Sync à 4-8 USD/mois, Publish à 8 USD/mois. L'équipe est de ~5-10 personnes, sans investisseurs externes, profitable. Pas de publicité, pas de revente de données, pas de freemium agressif.

**L'effet écosystémique** : l'utilisateur sait que le développeur travaille pour lui, pas pour des actionnaires. Cette confiance économique soutient la confiance technique (« local-first »). Les deux se renforcent.

**Inspiration pour Codex** : compatible avec ton positionnement. La taille modeste de l'équipe Obsidian montre qu'un outil profitable et durable n'a pas besoin de scaler à des millions d'utilisateurs — il a besoin de servir bien quelques milliers d'utilisateurs prêts à payer pour la valeur reçue. Pour le marché québécois, c'est plus rassurant que les modèles SaaS scaling-or-die.

---

## Synthèse — quatre idées-fortes que Codex peut faire siennes

Si je devais réduire ces onze composantes à ce qui me paraît le plus structurant pour Codex, je retiendrais quatre idées :

**A. Le format est un acte politique.** Le choix d'Obsidian d'utiliser du Markdown plat n'est pas qu'une décision technique — c'est ce qui rend tout le reste possible. Pour Codex, formaliser publiquement le format `.codex.zip` et `.codex-data.json` (spec écrite, versionnée, JSON Schema) est probablement le geste fondateur de l'écosystème. C'est ce qui permet à des tiers d'écrire des outils, à des cégeps de vérifier la conformité, à toi-même de garantir la rétro-compatibilité.

**B. La sync E2EE est un produit éthique, pas qu'un service technique.** Pour Codex avec données étudiantes et Loi 25, l'E2EE est à la fois la solution juridique et le signal commercial. C'est ce que les enseignants québécois veulent voir avant de payer.

**C. La Voûte comme marketplace pédagogique vivante.** L'innovation d'Obsidian n'est pas seulement le store de plugins — c'est *la culture du partage de templates et de coffres entiers*. La Voûte de Codex peut adopter cette posture : pas juste un dépôt passif de fichiers, mais un lieu où des configurations pédagogiques complètes circulent, sont remixées, font école.

**D. La documentation comme premier coffre public.** Une « Voûte Codex » ouvrable et explorable dans l'app, qui contient la documentation et des configurations exemples par discipline, serait à la fois un onboarding, une démonstration et un acte de communauté. C'est probablement le premier livrable « écosystème » concret à viser.

---

## Ce que Codex a et qu'Obsidian n'a pas — à préserver

Inversement, certains atouts de Codex ne sont pas dans Obsidian et constituent ton terrain propre :

- **Schémas formels** des entités pédagogiques (Obsidian n'en a aucun — c'est texte libre).
- **Calculs pédagogiques** (indices A-C-P, taux de complétion, etc.) qu'Obsidian ne pourrait pas faire sans plugins ad hoc instables.
- **Spécialisation métier** : Codex parle ELLAC, SOLO, IDME, RàI, PAN. Obsidian est volontairement générique.
- **Sécurité par défaut** (CSP strict, pas d'eval, validation des imports). Obsidian autorise des plugins JS quelconques — ça lui a déjà valu des incidents de sécurité communautaires.
- **Cible utilisateur définie** : enseignants québécois en cégep. Obsidian s'adresse à tout knowledge worker, donc ne peut pas faire de choix éditoriaux forts.

L'écosystème Codex à inventer ne devrait pas chercher à reproduire l'écosystème Obsidian — il devrait *combiner* ses atouts spécialisés avec les leçons écosystémiques d'Obsidian.

---

## Limites de cette analyse

- Mes connaissances Obsidian datent de mai 2025 et peuvent être imprécises sur les chiffres exacts (taille des stores, prix, nombres d'utilisateurs).
- Je n'ai pas la pratique quotidienne d'Obsidian — un power-user pourrait nuancer plusieurs des effets que je décris.
- Je n'ai pas analysé les concurrents directs d'Obsidian (Logseq, Roam, Notion) ni les écosystèmes adjacents (Standard Notes, Joplin, Anytype) qui auraient pu enrichir le repère.
- L'analyse reste descriptive et inspirationnelle. Elle ne dit pas *comment* construire concrètement chacune des composantes pour Codex — c'est un travail de design ultérieur.

---

## Pour continuer l'exploration

Si tu veux qu'on creuse un de ces volets en particulier, voici ceux qui me paraissent les plus riches à explorer :

- **Le format public versionné** comme acte fondateur (volet A)
- **La Voûte comme marketplace pédagogique vivante** (volet C, qui rejoint ce qui est déjà dans `ECOSYSTEME-DONNEES.md` mais avec une dimension culturelle/communautaire)
- **L'API par fichiers** plutôt que par JS (volet 10), comme alternative aux plugins, alignée avec ton CSP
- **La documentation comme premier coffre public** (volet D), parce que c'est concret et atteignable rapidement

Aucun de ces volets n'est prescriptif. Ce sont des terrains où ton écosystème pourrait s'inspirer d'Obsidian sans le copier.

---

# Annotations — culture du partage et logique des communs (10 mai 2026)

> Cette section a été ajoutée après une exploration plus poussée de la culture du partage Obsidian, et après la lecture du manifeste existant dans la section À propos / Aide de Labo Codex. Elle remplace en partie la section §8 « Communauté » du document principal qui survolait trop vite ce terrain.

## Le manifeste existant — point de départ déjà solide

Avant tout, constat : Labo Codex a *déjà* un manifeste, écrit dans l'application elle-même, à deux endroits.

**Section Aide → Introduction → « Qu'est-ce que Labo Codex ? »** énonce :

> *« Labo Codex est un commun à construire. Il est gratuit, son code est ouvert et il fonctionne hors ligne. Tes données restent en sécurité chez toi. En retour, tu peux apporter ton expérience : ce qui fonctionne, ce qui manque, ce que tu découvres. Chaque contexte disciplinaire apporte quelque chose de nouveau. En expérimentant ensemble, on peut faire avancer la réflexion, l'évaluation et l'accompagnement au collégial. »*

**Section Réglages → À propos → « Un commun éducatif »** complète :

> *« Cette application est gratuite, fonctionne entièrement hors-ligne et son code source est ouvert. Tu peux l'utiliser librement dans ton établissement, la partager avec tes collègues, l'adapter à tes besoins. Aucune donnée ne quitte ton appareil — tes données d'étudiants t'appartiennent et ne sont couvertes par aucune licence. »*

Ce manifeste pose déjà :
- **La nature de la ressource** : application gratuite + modèles pédagogiques + documentation, en commun éducatif.
- **La logique de réciprocité** : pas un don unilatéral mais un échange (« en retour, tu peux apporter ton expérience »).
- **La frontière de la propriété** : les données d'étudiants restent strictement personnelles, pas mises en commun.
- **Le principe de l'expérimentation collective** : « En expérimentant ensemble, on peut faire avancer la réflexion. »
- **Le double régime de licence** : AGPL v3.0 pour le code, CC BY-NC-SA 4.0 pour le contenu pédagogique. Ce double régime est cohérent et clair.

Ce qui suit ne propose donc pas un manifeste, mais identifie ce qui pourrait être *développé* à partir de cette base — notamment la dimension explicite de gouvernance d'un commun.

## Cinq couches de partage chez Obsidian

L'écosystème Obsidian repose en fait sur cinq couches de partage qui coexistent et se renforcent. Toutes ne sont pas transposables à Codex, mais les distinguer aide à voir lesquelles méritent l'attention.

**1. Partage de code (plugins, ~2 750).** Couche peu transposable à Codex : le CSP `script-src 'self'` est précieux et ne devrait pas être cassé pour permettre des plugins JavaScript tiers. Pas un manque, c'est un choix de conception cohérent.

**2. Partage de méthodes intellectuelles.** Couche très transposable. Obsidian s'est greffé sur des méthodes préexistantes (Zettelkasten, PARA, Linking Your Thinking, Building a Second Brain) et leur a donné un véhicule. Codex porte déjà ses méthodes (ELLAC, SOLO, IDME, RàI, PAN, SRPNF) — l'app peut être le véhicule qui les rend praticables et partageables. Différence : Obsidian a intercepté des méthodes globales déjà célèbres ; Codex porte des méthodes plus régionales et plus spécialisées. C'est à la fois un atout (proximité avec les sources) et une contrainte (bassin d'évangélistes plus restreint).

**3. Partage de templates / coffres de démarrage.** Couche directement transposable. Awesome Obsidian, Obsidian Hub, des dépôts GitHub par centaines proposent des coffres prêts à l'emploi (« étudiant en médecine », « écrivain de fiction »). Pour Codex, ce serait des « configurations pédagogiques de démarrage par discipline » — une enseignante débutant en philosophie 101 télécharge un coffre Codex avec grilles, échelles, productions et cartouches déjà calibrés pour ELLAC + SOLO, qu'elle adapte. Massif gain de temps et démonstration vivante des méthodes.

**4. Partage public de connaissance personnelle (digital gardens).** Couche probablement la moins transposable. Maggie Appleton, Andy Matuschak et milliers d'autres publient leurs notes en train de mûrir, pas seulement les essais finis. Culture du « learning in public ». Mais les enseignants partagent volontiers leurs *produits finis* (séquences, examens corrigés), beaucoup moins leurs *réflexions en cours*. Reste comme référence à long terme — une « Voûte de réflexions ouvertes » de profs qui acceptent de penser en public serait précieuse mais culturellement plus rare.

**5. Partage d'éthique.** Couche invisible mais fondamentale. *Local-first, own your data, anti-vendor lock-in* — phrases devenues slogans communautaires, presque cris de ralliement. Quand un nouveau service Cloud-only arrive, la communauté Obsidian le démolit collectivement. Cette éthique partagée transforme une base d'utilisateurs en *communauté* — les gens ne sont pas seulement clients, ils sont alliés autour d'un principe. **Pour Codex, c'est la couche la plus importante à cultiver dès maintenant**, et le manifeste existant est déjà aligné.

## Trois observations distinctives sur cette culture

Trois traits qui distinguent l'écosystème Obsidian d'autres communautés logicielles.

**Le format ouvert comme catalyseur silencieux.** Personne ne célèbre Markdown comme un héros culturel, mais sans lui rien n'existerait. Le format ouvert permet de *quitter* sans coût — paradoxalement, c'est cette possibilité de sortie qui crée la confiance et rend les utilisateurs prêts à *investir*. Codex fait déjà ça partiellement (JSON, ZIP, hors-ligne). Le levier serait de l'expliciter plus encore comme argument fondateur.

**La gouvernance discrète mais accessible.** Erica Xu et Shida Li (fondateurs Obsidian) sont présents sans être bruyants. Ils participent au forum, répondent occasionnellement, publient une roadmap. Pas de hype tour, pas de keynotes spectaculaires. Cette discrétion crée un ton communautaire — les gens sentent que l'app est faite par des humains accessibles plutôt que par une marque. Mode probablement adapté à Codex : présence humaine fiable plutôt qu'évangélisation bruyante.

**La croisée disciplinaire.** Les utilisateurs Obsidian forment un groupe hétérogène (chercheurs, développeurs, écrivains, médecine, juristes, journalistes). Cette diversité enrichit l'écosystème : les plugins développés pour un usage trouvent une seconde vie ailleurs. Pour Codex, le bassin est plus homogène (enseignants québécois) — donc moins d'effet de croisement, mais des conversations plus profondes possibles parce que tous parlent le même métier.

## La logique des communs (Ostrom) appliquée à Codex

Le manifeste existant utilise déjà le mot « commun ». La théorie des communs développée par Elinor Ostrom (Prix Nobel d'économie 2009) propose un cadre qui peut éclairer la suite. Ostrom a identifié huit principes de gouvernance des biens communs durables, à partir d'études empiriques (pâturages, forêts, irrigation, pêches).

Appliqués à Codex, voici ce que ces principes suggèrent comme questions à clarifier (les règles « à venir » que tu mentionnes) :

**1. Frontières claires.** Qui est usager du commun ? Tout enseignant qui télécharge l'app ? Seulement ceux qui contribuent à la Voûte ? Y a-t-il un statut différent pour qui dépose vs qui emprunte ?

**2. Règles adaptées au contexte local.** Les règles d'usage doivent être faisables dans le contexte des cégeps québécois, pas calquées sur un modèle global abstrait. Ex. : critères d'acceptation dans la Voûte adaptés aux disciplines réelles, pas à un schéma théorique.

**3. Décisions collectives.** Les usagers participent aux règles qui les concernent. Pour Codex : qui décide de l'évolution des formats, de la modération des dépôts, de la roadmap ? Une option : un comité consultatif d'enseignants utilisateurs — léger, pas un conseil d'administration.

**4. Surveillance.** Auto-surveillance des usages. Pour la Voûte : qui s'assure que les dépôts respectent l'attribution, les licences, l'anonymisation ? Probablement les usagers eux-mêmes (mécanismes de signalement) plutôt qu'une instance centrale.

**5. Sanctions graduées.** Que faire si un usager viole les règles (dépôt non anonymisé, usage commercial non autorisé, plagiat) ? Avertissement, retrait du dépôt, exclusion. À documenter.

**6. Mécanismes de résolution des conflits.** Si deux enseignants ont des grilles très similaires sur le même cours, qui arbitre l'attribution ? Mécanisme léger à concevoir.

**7. Reconnaissance des droits par les autorités externes.** Les institutions (cégeps, ministère) reconnaissent-elles le commun comme un objet légitime ? Le partenariat avec un cégep ou l'AQPC va dans ce sens. Sans cette reconnaissance, le commun reste informel et fragile.

**8. Organisation en niveaux emboîtés.** Pour de grands communs, plusieurs niveaux (départemental, institutionnel, inter-institutions) avec des règles propres à chaque niveau. La structure de la Voûte évoquée dans `ECOSYSTEME-DONNEES.md` (Voûte privée département, publique institution, etc.) prépare cette logique sans nécessairement l'expliciter en termes ostromiens.

## Quatre pistes concrètes alignées avec la posture « commun à construire »

À garder en tête pendant l'année d'observation, sans engagement immédiat.

**A. Étoffer la page « commun éducatif » dans À propos** avec les cinq couches du partage et la logique de réciprocité. La carte existante est juste mais courte — elle gagnerait à expliciter le contrat entre l'app et l'enseignant.

**B. Capturer dans `USAGE-FORMATS.md` les signaux qui touchent les règles à venir** — pas juste les frictions techniques, mais les questions de gouvernance qui émergent (qui peut déposer ? qui modère ? qui décide ?). Ces signaux orienteront les règles à formaliser à terme.

**C. Préparer une trame de « configuration pédagogique de démarrage par discipline »** — un format léger qui permettrait à des testeurs de partager non pas leur trimestre complet, mais une sélection : quelques grilles, échelles, productions, cartouches assemblés pour un cours type. C'est l'équivalent direct des « vault templates » d'Obsidian.

**D. Rédiger un « préambule de gouvernance »** — pas une charte rigide, mais un texte court (1-2 pages) qui pose les principes ouverts (transparence des décisions, primauté de l'enseignant, anonymisation systématique des codex data partagés, double licence AGPL + CC). Document évolutif. Peut être placé dans `docs/manifeste/` ou directement dans la doc en ligne.

## Ce qui mérite d'être préservé tel quel

Plusieurs aspects du manifeste existant sont déjà à leur place et n'ont pas besoin d'être touchés :

- **La phrase « Labo Codex est un commun à construire »** — elle dit l'essentiel et donne le ton.
- **La distinction propriété personnelle / commun** : « tes données d'étudiants t'appartiennent et ne sont couvertes par aucune licence » est juridiquement et éthiquement précis. À ne pas diluer.
- **Le double régime de licence (AGPL + CC BY-NC-SA)** est techniquement et éthiquement solide. La CC-BY-NC-SA pour le contenu pédagogique protège contre la captation par les éditeurs scolaires privés tout en autorisant le partage entre enseignants. À conserver.
- **Le tableau « ce que tu peux faire / ne pas faire »** dans la carte « En pratique » a un grand mérite : il rend les règles concrètes pour quelqu'un qui ne lit pas les licences. Modèle à reproduire si on développe le manifeste.

## Question ouverte

Le manifeste existant fonctionne bien comme texte de présentation, mais il ne dit pas encore comment les usagers participent à la construction du commun. C'est cohérent avec ta posture actuelle (« les règles sont à venir »), mais il viendra un moment, probablement après le colloque AQPC ou après les premiers dépôts dans la Voûte, où il faudra commencer à formuler les premières règles. Le tracker `USAGE-FORMATS.md` est l'outil pour collecter les signaux qui rendront cette formulation possible.

Le commun se construit en marchant. Le manifeste actuel pose le départ ; les bilans périodiques tracent le chemin.
