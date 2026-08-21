# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | **`main`** |
| **Version** | **1.88.6** — build `0821-0312` (CO-01 corrigé ; avant : 1.88.5 CT-01, 1.88.3/1.88.4 PR #79) |
| **Travail en avance sur `main`** | **aucun** (fusions ff faites en session, permission explicite de Grégoire). Dernier ID : **#461** (CO-01, livré 1.88.6 ; #460 = CT-01, 1.88.5). **#449 LIVRÉ en 1.88.0** (suppression de fiche de cours dans la Bibliothèque, gardée par recensement — refus dès la moindre donnée ; le Cadre passe par le même garde ; changelog 1.88). **#458 corrigé en 1.88.1 et CONFIRMÉ terrain** (fiche neuve invisible de la Bibliothèque — trouvé par la porte, corrigé aux deux bouts, sentinelle 3 cas). ✅ **PORTE TERRAIN #449 CLOSE le 20 août : 11/11, zéro échec** (refus sur la vraie fiche depuis les deux surfaces, cycle complet sur fiche de test, iPad) — **rien de dû de ce cycle**. |
| **Dernière mise à jour (21 août 2026, matin)** | 21 août 2026 (session locale Mac) — TROIS gestes : **(1) FUSION de la session 2 dans `main`** (`afd208bf`, conflits réconciliés ; le RELAIS de la branche annonçait « ff possible » — faux, main avait 2 commits d'avance ; son « plan introuvable » était vrai de sa base seulement, le plan vit sur main depuis `42a8ab1c` et sa reconstitution du §6 est CONFORME). **(2) PASSE COMPLÉMENTAIRE du §6.3 réel** (`3fd83cee`, addendum au rapport) : #326-T3/T4 NON REPRODUITS (corrigés 21 juin) ; #343-T3/T4a/T4d TOUJOURS PRÉSENTS ; ⚠⚠ **CO-36 : la PR #63 (fixes #343) n'a JAMAIS été fusionnée** (OPEN ~2 mois) alors que BACKLOG-ARCHIVE:2465 la dit « RÉSOLUS » ; + CO-37..CO-40 (pondérations non bloquées mais auto-normalisées, cartouches orphelines à l'écrasement d'homonyme, imports JSON hors assainissement, fallback « || 1 » SOM). **(3) LE BLOQUANT CO-01 CORRIGÉ (1.88.6, #461)** : éditer une pratique à l'assistant détruisait l'enveloppe (inspireDe/estMaquette/metadata_cc/auteur — invariant CC SPEC D §3.1) ; fusion d'enveloppe dans `sauvegarderPratique` + rechargement auteur dans `chargerPratiqueExistante` ; sentinelle 2 cas écrite AVANT le fix (rouge sur 1.88.5 = reproduction, verte après). Vitest 2768/2768, Playwright complet. ⏳ **SUITE : TRI des constats des DEUX audits avec Grégoire** (28 CT + 39 CO restants ; 8 lots transverses, 3 décisions de fond, **CO-36/PR #63 à statuer en priorité**) · portes terrain iPad des deux rapports · 4 SVG non suivis `autocollants/solo/`. |
| **Plus tôt (20 août 2026, soir/nuit)** | 20 août 2026, soir/nuit (session cloud) — **AUDIT « CONCEPTION » LIVRÉ (session 2 de 2, constats seulement, AUCUN code touché, aucun bump)** : rapport `plans de travail/AUDIT-conception-2026-08-20.md`, **35 constats (1 Bloquant : éditer une pratique via l'assistant détruit l'enveloppe — inspireDe/estMaquette/auteur effacés ; 18 Majeurs)**. Verdicts des points transmis : hypothèse garde démo **CONFIRMÉE et ÉLARGIE** [NAV], orphelin `cartouches_{grilleId}` (§6.4) **CONFIRMÉ** [NAV], #453 §3 **fonctionnel** [NAV], perf CT-20 **confirmée** côté Conception [NAV]. ⚠ **Écart d'époque, résolu le 21 août** : le plan était invisible de sa base (156e3dc8) — il vit sur main depuis `42a8ab1c` ; le cadre §6 reconstitué est CONFORME (l'exclusion de la Carte d'alignement est dans le plan §3). ⏳ **SUITE : TRI des 29 + 35 constats AVEC Grégoire** (trois décisions de fond d'abord : régime des cartouches, échelles collègues codées en dur, politique de suppression façon #449) — rien au BACKLOG. |
| **Plus tôt (20 août 2026, soir — 2e cycle, CT-01)** | 20 août 2026, soir (session locale Mac) — **LE BLOQUANT CT-01 DE L'AUDIT EST CORRIGÉ (1.88.5, #460)** : en édition d'horaire, changer « Séances par semaine » ou « Périodes par séance » ÉCRASAIT les séances saisies par les défauts, « Enregistrer » les persistait en silence. Fix `changerFormatSeancesHoraireV2` (capture DOM avant régénération, restitution ; lignes ajoutées seules aux défauts), câblé sur les deux selects. Sentinelle Playwright 3 cas (vrais événements change — le câblage d'index.html est verrouillé aussi), **break-test : câblage réverti ⇒ 3 ROUGES**. Vitest **2768/2768**, Playwright **96/96**. ⚠ **Le plan d'audit ne vivait QUE dans stash@{0}** (GitHub Desktop 14h59) — restauré et committé sur main (`42a8ab1c`). ✅ ~~SESSION 2 « Conception » À LANCER~~ **FAITE en parallèle par une session cloud (fusionnée le 21 août)** · **TRI des constats CT-02..CT-29 AVEC Grégoire** (seul CT-01 est versé, #460) · porte terrain iPad du geste CT-01 à prévoir · 4 SVG non suivis dans `autocollants/solo/` (non touchés). |
| **Plus tôt (20 août 2026, soir)** | 20 août 2026, soir (session cloud) — **AUDIT « Calendrier › Trimestre » LIVRÉ** (session 1 du `PLAN-AUDIT-cadre-conception-2026-08-20.md`, constats seulement, AUCUN code touché, aucun bump) : rapport `plans de travail/AUDIT-cadre-trimestre-2026-08-20.md`, **29 constats (1 Bloquant : l'édition d'horaire écrase les séances saisies au changement de format ; 12 Majeurs)**, verdicts : #328-T1 durée NON reproduit / désync confirmée autre cause, #282-T1 fermé par #455, #449 confirmé. ✅ ~~SESSION 2 « Conception » À LANCER~~ **FAITE (ligne ci-dessus)**. Rappel des livraisons du cycle 19-20 août (détail au BACKLOG/SUIVI-BUGS) : **#449 LIVRÉ en 1.88.0** (suppression de fiche de cours gardée par recensement), **#458 corrigé en 1.88.1 et CONFIRMÉ terrain**, 1.88.2 = #459, 1.88.3+1.88.4 = PR #79 (police des champs + mise en page Productions) fusionnée par Grégoire. |
| **Plus tôt (19 août 2026)** | 19 août 2026 (session cloud, backlog + décisions) — **repassage de la table des bugs ouverts** (8 basculées vers Corrigés, restent #158 re-vérification / #121 confirmation / #114 config Cloudflare) ; **#455 TRANCHÉ « le cours est GLOBAL » et livré 1.87.8** (identité = code seul, `supprimerTrimestre` ne touche plus le magasin `cours`, garde anti-seconde-fiche au formulaire, sentinelle 7 cas + #361 réalignée, 5 break-tests ROUGE) ; **#306 décision UX livrée 1.87.9** (Enseignant·e alignée « état vide masqué », sentinelle 8 cas, 4 break-tests ROUGE) ; **#441 clos** (chantier 3 SOLO archivé), **#365 clos** (bilan réflexif déjà namespacé, re-vérifié) ; **rétroaction #424 REPORTÉE par Grégoire (attend la CoP — ne pas relancer)**. ⏳ **PORTE TERRAIN NEUVE, NON TRAITÉE** : `plans de travail/PORTES-TERRAIN-2026-08-19-etat-vide-et-cours-global.md` (12 rangées, dont 3 iPad). Détail : SESSION.md bloc 19 août. |
| **Plus tôt (8ᵉ cycle de la veille)** | 18 août 2026, fin de soirée (session cloud, design, suite) — **PORTE TERRAIN BRUME ARDOISE CLOSE À 8/8, ZÉRO ÉCHEC, LES DEUX APPAREILS** (relevé exporté par l'artefact ; D1 « oui, garde »). **1.87.7 livre le verdict D2** (« désaturer toute l'interface, même l'entête ? », option A tranchée en discussion) : l'en-tête, la nav principale et la sous-nav suivent la brume dans les DEUX thèmes ; les couleurs de section et les signaux pédagogiques restent vifs (repérage). Moyen : les marine codés en dur du chrome clair (`#032e5c`/`#0a4a7e`/`#0f1e3a`, 10 sites — en-tête, nav, sous-nav, en-têtes de cartes/accordéons) convertis vers `var(--bleu-principal)`/`var(--btn-principal-hover)`/`var(--bleu-fonce)` (valeurs identiques hors anonymisation — **vérifié au computed style : mode normal inchangé au pixel**) ; gradient océan sombre overridé en ardoise ; `--bg-bandeau-mediane` par thème pour les blends multiply des boutons de section. La simulation d'export PDF (`.apercu-pdf-page`) garde ses couleurs d'impression fixes, volontairement. Vitest **2738/2738**. Contexte : présentation aux collègues le 19 août. |
| **Plus tôt (7ᵉ cycle du jour)** | 18 août 2026, soir (session cloud, design — fusionné dans `main`) — **1.87.6 : LE MODE ANONYMISATION EST DÉSATURÉ DANS LES DEUX THÈMES (« brume ardoise »).** Le bug de la capture de Grégoire (sidebar quasi noire du profil étudiant en thème clair) venait d'une désaturation qui n'existait pas en clair : le bloc `[data-mode="anonymisation"]` était annulé par la cascade de `.mode-clair`, et il ne survivait qu'une règle sidebar forcée à `#0e1e28`. Correctif : deux palettes scopées par thème dans `styles.css` (même leçon que le mode démo), teinte ardoise commune, accent harmonisé, contrastes AA vérifiés (9,2:1 / 5,1:1). Retiré zéro-dette : la règle sidebar, les variables mortes `--sous-nav-bg-anonymisation`/`--sous-nav-bg-normal`, le bloc inline redondant d'`index.html`. Vitest **2738/2738**, validation visuelle Chromium (4 combinaisons thème × mode). Pas d'entrée changelog (correction CSS). ⏳ **PORTE TERRAIN NEUVE, NON TRAITÉE** : `plans de travail/PORTES-TERRAIN-2026-08-18-brume-ardoise.md` (artefact : <https://claude.ai/code/artifact/90023822-b8c8-4652-88b5-c0c95b1cc8e9>) — 8 portes (Safari/iPad/corpus réel) + **2 décisions de teinte (D1, D2)**. Contexte : Grégoire présente Labo Codex à ses collègues le 19 août. |
| **Plus tôt (6ᵉ cycle du jour)** | 18 août 2026 (session cloud, backlog — clôture) — **#456 EST CLOS : 9/9 EN WEBKIT, BASELINE À 0.** Relevé de la 4ᵉ passe : « 9 tests passés, 54,1 s, aucun échec » (alignement 3/3, toolbar 6/6). Les six rouges du 12 août sont éteintes en quatre passes terrain — TOUTES dérives de test ou défauts de harnais, **zéro bug d'app**. Baseline **→ 0** par transcription de deux mesures (le 9/9 de la 4ᵉ passe + la passe complète `--ecrire` de la 2ᵉ, diff vide, rien d'autre n'ayant changé entre les deux) ; ⚠ si le Mac pousse son propre `--ecrire` à 0, il sera identique. **Le garde-fou de push redevient strict sur toute rougeur.** Détail de la campagne : entrée #456 du BACKLOG et `plans de travail/PORTES-TERRAIN-2026-08-18-playwright-456.md` (CLOSE). Aucun bump — l'app n'a pas bougé de la journée sur ce chantier (1.87.5). ⏳ Restent du jour, côté Grégoire : les gestes navigateur du fil données (réparation A25 `reparer453`, réassignation H26, #450 — ✅ **#368 VÉRIFIÉ le 18 août** : la carte 601-101 est vraiment en A26) et la porte types-familles du 16 août. |
| **Plus tôt (5ᵉ cycle du jour)** | 18 août 2026 (session cloud, backlog — 3ᵉ retour de terrain #456) — **LES DEUX DERNIÈRES ROUGES SONT COMPRISES, LA DERNIÈRE EST RÉPARÉE.** · ✅ **Alt/⌥ VERTE en WebKit** (relevé 3ᵉ passe : 8/1, l'échec est l'aimantation — ⚠ la coche ✗ de la porte 2.10 contredisait la mesure jointe ; la mesure fait foi). La réécriture PointerEvent tient, dette d'outillage close. · 📏 **Le diagnostic embarqué a tranché l'aimantation : bug de HARNAIS** — 433 = 440 − un pas de ~6,7 px, zéro guide (aucun snap), drag vivant ⮕ **WebKit ne livre pas le dernier `pointermove` d'un trajet groupé** (`steps:`), l'app est hors de cause. Correctif : trajet pas à pas (patron CAS D), mouvement final DOUBLÉ, assertion recentrée sur l'invariant (zéro guide + position > 425 ; un snap rendrait 400), égalité stricte conservée sur la phase de snap. 3/3 Chromium. Baseline inchangée à 2 (pas de passe complète ce tour — règle respectée). Aucun bump (tests seuls). ⏳ **4ᵉ PASSE MAC DUE (~2 min), possiblement la DERNIÈRE : attendu 9/9, puis `--ecrire` → baseline 0 et #456 SE FERME.** Même porte, même artefact. |
| **Plus tôt (4ᵉ cycle du jour)** | 18 août 2026 (session cloud, backlog — 2ᵉ retour de terrain #456) — **LES DEUX RELEVÉS DE GRÉGOIRE ONT TRANCHÉ.** · **SONDE Alt/⌥ : PAS UN BUG D'APP** — en WebKit aussi le chemin applicatif duplique ; c'est le modificateur ⌥ de Playwright qui ne voyage pas avec la souris dans ce moteur. Spec **réécrite en PointerEvent purs** (pointerdown altKey sur la poignée, pointermove sur document, frame rAF entre chaque, mesure pendant le drag ; la vraie souris reste couverte par le CAS D, vert WebKit) — 9/9 Chromium, break-testée (sans `altKey` ⇒ rouge). · **Aimantation : 400 reçu = position de DÉPART** — « aimanté » (exigerait zoom ≈ 0,15) et « drag interrompu » (hypothèse de Grégoire, gardée vivante) indiscernables sans données ⮕ la spec **embarque son diagnostic** (`zoom`, `guidesVisibles`, `dragEnCours`, largeurs) dans son message d'échec. · Baseline **confirmée à 2** par la passe complète (aucune rougeur nouvelle ailleurs). Aucun bump (tests seuls). ⏳ **3ᵉ PASSE MAC DUE (~2 min)** : Alt/⌥ attendue verte, recopier le `diagnostic : {…}` si l'aimantation est rouge, baseline → 1 (ou 0). Même porte terrain, même artefact. |
| **Plus tôt (3ᵉ cycle du jour)** | 18 août 2026 (session cloud, backlog — retour de terrain #456) — **LA 1ʳᵉ PASSE WEBKIT EST RETOURNÉE ET TRAITÉE.** Relevé Grégoire : **91 passés / 2 échecs** ; 4 des 5 réparations tiennent, la baseline mesurée passe **6 → 2** (transcrite au dépôt — si la session Mac garde un diff de baseline non committé, LE JETER, il est identique). ⚠ **La 5ᵉ (Alt/⌥+glisser) ne tenait PAS en WebKit** (le « 5 des 6 » de `8511ad44` surestimait — attrapé par Grégoire) ⮕ spec **instrumentée d'une SONDE** qui, à l'échec, dit si c'est le modificateur ⌥ du harnais ou le chemin applicatif (éprouvée en Chromium). ✅ **L'aimantation réparée SUR MESURE** (426/440 = frame intermédiaire, même correctif que le CAS D — verdict 3.1 : voie 1). Aucun bump (correctifs de tests seuls, app inchangée en 1.87.5). ⏳ **2ᵉ PASSE MAC DUE, courte (~2 min)** : deux fichiers, juger l'aimantation, recopier la ligne `SONDE :`, baseline → 1. `plans de travail/PORTES-TERRAIN-2026-08-18-playwright-456.md` (artefact même URL). |
| **Plus tôt (2ᵉ cycle du jour)** | 18 août 2026 (session cloud, backlog, suite) — **#418 LIVRÉ et #456 RÉPARÉ AUX 5/6, en 1.87.5.** **#418** : en mode localStorage-seul (IDB indisponible), le boot n'émettait JAMAIS `db-ready` — aucune migration ne partait, en silence ; branche `else` au boot de `db.js` (drapeau puis événement, ordre #414), sentinelle comportementale 4 essais (vrai boot sans indexedDB), break-test 4 rouges. **#456** : les six rouges du Mac REPRODUITS en Chromium (le conteneur en a un — config `tests/playwright.chromium.config.js`, versionnée, ⚠ outil de reproduction CIBLÉE : la suite entière y rougit sur les motifs d'erreurs console rédigés pour WebKit) ; **cinq réparées, toutes des DÉRIVES DE TEST** (badge #366 retiré ; `mettreAJourSommaire`→`mettreAJourPlanificateur` ; fixture d'avant #367 → clé composite `carteId::leconId` ; prise de drag au centre de l'en-tête où vit le MENU DE TYPE 1.86 qui stoppe la propagation → prise par la POIGNÉE ⠿ + sémantique 1.87 ⌥=copie + mesure PENDANT le drag). La **6ᵉ** (`planif-alignement` › aimantation) **PASSE en Chromium** : rouge propre à WebKit, message d'erreur jamais vu — rien réparé au jugé. ⏳ **PORTE TERRAIN NEUVE : la passe WebKit Mac** — `plans de travail/PORTES-TERRAIN-2026-08-18-playwright-456.md` (artefact : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>) : relancer `npm run test:int`, recopier le bilan, la baseline ne rétrécit QUE là (`verifier-playwright.mjs --ecrire`), et recueillir le message WebKit de la 6ᵉ. Vitest **2738/2738** (273 fichiers). |
| **Plus tôt le même jour (1ᵉʳ cycle)** | 18 août 2026 (session cloud, backlog) — **LE FIL ROUGE DES DONNÉES H26/IMPORT EST FERMÉ CÔTÉ CODE.** **1.87.4** livre les trois correctifs rouges du backlog, dans l'ordre causal : **#454 VECTEUR FERMÉ** (`verifierUniciteIds` fusionne désormais par identité — un doublon interne au contenu IDENTIQUE est **écarté**, plus jamais renommé, donc plus de ressource fantôme à repointer ; le renommage ne subsiste que pour un vrai conflit de contenu ; les deux appelants héritent : `chargerCodex` et le filet de `fusionnerParIdentite`) · **#453 §3** (le formulaire de production **préserve et signale** une référence non résolue via une option « ⚠ introuvable » — grille, échelle, cartouche ET grille inline ; plus de blanchiment silencieux à l'enregistrement) · **#452 LIVRÉ** (la reprise d'une production de la bibliothèque naît avec `dateEcheance: null` et **sans** `echeancesParGroupe` — vider, pas deviner ; reproduit AVANT correction). **3 sentinelles neuves, 24 essais** (`sentinelle-454-doublon-identique-ecarte`, `sentinelle-453-reference-preservee`, `sentinelle-452-reprise-sans-dates`), **chacune éprouvée par break-test** (garde retirée ⇒ 5, 4 et 3 rouges). Vitest **2734/2734** (272 fichiers). ⏳ **Les gestes NAVIGATEUR restent dus côté Grégoire** (le code ferme les portes, il ne répare pas les dégâts passés) : réparation A25 `await reparer453({ executer: true })` après backup, puis Safari · réassignation H26 à la main (10 artefacts, fil = magasins `cartouches_{ancienId}`) · réassignation #454 (`reassignation-454-grilles-h26.js`) · #450 (renommer les deux « IDME et niv 0 ») · **#368 à vérifier EN PREMIER** (la carte 601-101 est-elle vraiment en A26 ?). |
| **Plus tôt le même jour (matin — skills)** | 18 août 2026 (session cloud, matin) — **CHANTIER SKILLS CLOS POUR DE BON**, et le cycle du jour fusionné dans `main` (`8d6f637e`). **Les 15 skills se chargent, se résolvent ET SE DÉCLENCHENT SEULS.** Les deux skills créés le 17 (`design-interface`, `release-et-changelog`) n'avaient jamais été testés au déclenchement — les 4 tests de `FICHE-RELECTURE.md` ne portaient que sur les 13 MIGRÉS. Ils sont verts, sur vraies invocations `Skill(...)`, en sessions neuves lancées **depuis le dépôt**. ⚠⚠ **Un premier repassage les donnait tous deux en ÉCHEC : il avait été lancé depuis `/Users/kuekatsheu`.** Les skills de projet ne se chargent QUE si le dépôt est le dossier de travail — et une session qui fait `cat .../SKILL.md` LIT le fichier, elle ne déclenche pas le skill. Protocole durci dans la consigne (§5). ⮕ **Livré aussi ce jour** : **1.87.3** = **#457** (la trace `inspireDe` affichait « par Inconnu » — `forgerInspireDe` ne lisait que `item.auteur`, or l'auteur vit dans `metadata_cc.auteur_original` ; **trouvé par une PORTE TERRAIN, sur une rangée cochée ✓ — c'est le champ de MESURE qui l'a attrapé**) · cherry-pick Brique C `ca7564bb` (relu, pas fusionné : la branche avait 417 commits de retard) · **92 pointeurs morts** vers `Skills pour Claude Code/` réparés · cadrage Briques C/D remis d'aplomb (son §2.5 envoyait vers une branche morte ; **le §3 Brique D est PÉRIMÉ et demande son propre audit**) · plugin `productivite-labo-codex` qui charge enfin (**l'enregistrement de la marketplace est MANUEL PAR MACHINE** — `extraKnownMarketplaces` vit dans les réglages utilisateur, non versionnés ; le chemin relatif versionné NE RÉSOUT PAS, testé). ⚠ **Piège coûteux, éprouvé deux fois** : `claude plugin marketplace remove` **vide `enabledPlugins` dans le `.claude/settings.json` DU PROJET** — fichier versionné — et déplace la clé en fin de fichier, si bien que le diff passe pour un réordonnancement anodin. Vérifier `git status .claude/settings.json` après TOUTE commande `claude plugin`. Vitest **2710/2710** (269 fichiers) |

⚠⚠ **AVANT TOUTE FUSION EN CONTENEUR : `git fetch --unshallow origin`.** Le clone
du conteneur est **shallow**, et son `main` LOCAL peut pointer des semaines en
arrière (15 août : 89 commits de retard, greffe au 3 août). `git merge --ff-only`
répond alors **« refusing to merge unrelated histories »** — un message qui fait
croire à un dépôt corrompu alors qu'il ne dit que « l'historique est tronqué ».
Ensuite, vérifier que le `main` local est bien un **ancêtre** d'`origin/main`
(`git merge-base --is-ancestor main origin/main`) : c'est ce qui distingue « en
retard » de « divergent ». ⮕ Cette mise en garde avait été écrite le 9 août, puis
**perdue** dans une réécriture du fichier ; elle a mordu de nouveau le 15. Ne pas
la retirer.

⚠ **VÉRIFIE `origin/main` AVANT DE CROIRE CE TABLEAU.** Le 12 août au matin, ce
fichier disait « aucune dette de fusion, 0/0 » alors qu'`origin/main` avait un
commit d'avance, poussé la veille au soir depuis une session cloud. Le rituel de
début l'a attrapé ; il ne l'aurait pas fait sans `git fetch`.

⏳ **CE QUI RESTE DÛ** :

- ✅ **PORTE TERRAIN DU 19 AOÛT : CLOSE À 12/12, ZÉRO ÉCHEC** (relevé exporté
  le jour même) — Enseignant·e en « état vide masqué » (#306, 1.87.9) validé
  Mac + iPad + deux modes, et le garde anti-seconde-fiche de cours (#455,
  1.87.8) éprouvé sur les données réelles. **Rien de dû de ce cycle.**
  `plans de travail/PORTES-TERRAIN-2026-08-19-etat-vide-et-cours-global.md`.

- ✅ **PORTE TERRAIN BRUME ARDOISE : CLOSE À 8/8, ZÉRO ÉCHEC** (19 août, les
  deux appareils) — `plans de travail/PORTES-TERRAIN-2026-08-18-brume-ardoise.md`.
  Verdicts rendus : D1 « garde », D2 livré en 1.87.7 (chrome en brume).
  ✅ **L'extension 1.87.7 aussi : revérifiée par Grégoire sur Safari ET iPad
  le 19 août (« tout est beau »). RIEN N'EST DÛ de ce chantier.**
- ⏳ **RIEN D'AUTRE N'EST DÛ DES CYCLES 1 À 6 DU 18 AOÛT.** Sa porte terrain
  (`plans de travail/PORTES-TERRAIN-2026-08-18-skills-et-briqueC.md`, artefact :
  <https://claude.ai/code/artifact/56915616-aaf6-489a-855a-59e4073d93e5>) est
  **retournée et traitée** : 3 verdicts rendus, l'échec réel corrigé (#457,
  livré en 1.87.3), les deux ménages faits (skill compte supprimé,
  `claude/wonderful-galileo-cb9785` supprimée). ⮕ **Une seule question y reste
  ouverte, et elle n'est PAS bloquante** : les deux cas de déclenchement passent
  AVEC les descriptions enrichies (`edda3f27`) ; on ne sait pas s'ils passaient
  déjà sans, faute d'un test valide avant enrichissement. C'est une attribution
  non prouvée, pas un défaut. Le break-test tient en deux commandes, écrites dans
  la porte. **Grégoire a choisi de passer au backlog** — ne pas rouvrir ça de soi-même.

- ✅ **PORTE TERRAIN TYPES-FAMILLES : CLOSE le 20 août — 43/43, ZÉRO ÉCHEC,
  LES CINQ VERDICTS RENDUS** (relevé exporté ; reprise sous 1.88.2 après mise
  à jour de la liste). Les trois points bloquants passent : 2.7 couleur
  unique par famille (mesure 2.7m = « aucune » paire confondue), 2.8 poignée
  ⠿ au doigt sur iPad, 2.6 exports intacts sans choix. **Verdicts §3 : 3.1 à
  3.4 « c'est bien » (tout est GARDÉ tel que livré) ; 3.5 « on ne retire
  pas » — Préalable RESTE, question close.** En chemin, la 1.2 a trouvé
  **#459** (⇧ avalé en silence sur les conteneurs, corrigé 1.88.2, revalidé).
  ✅ **2.8m renseignée dans la foulée : 0** bloc à en-tête sur deux lignes —
  **la porte est entièrement soldée, mesures comprises** (la 2.8m traînait
  depuis le cycle 1.85). `plans de travail/PORTES-TERRAIN-2026-08-16-types-familles.md`.
- ✅ **PORTE TERRAIN DU CYCLE 1.85 : CLOSE À 33/33, ZÉRO ÉCHEC** (16 août).
  Les deux rangées iPad les plus risquées — la poignée ⠿ au doigt et le TSV
  ouvert dans Numbers — passent. Son verdict **3.4 « signaler »** est livré dans
  1.86.0. ⏳ **Restent dues, mineures** : la mesure **2.6m** (ordre des séquences
  — sans objet, il n'avait pas créé de séquence) et la mesure **2.8m**, reprise
  dans la liste du 16 août parce qu'elle y compte davantage.
- ▣ **RÈGLE ANTI-BANCS-D'ESSAI : réparée.** `repro.html` et `undefined/` étaient
  ignorés dans `tests/.gitignore` alors que les scripts écrivent à la RACINE —
  donc nulle part. Motifs déplacés, sentinelle `git check-ignore` posée
  (5 cas, break-testée trois fois). ⚠ Sa contre-épreuve était d'abord INERTE :
  elle interrogeait un fichier SUIVI, or `git check-ignore` consulte l'index et
  répond « non ignoré » pour tout chemin suivi, quels que soient les motifs.
  Seul le 3ᵉ break-test l'a dit.
- ⚠ **ARTEFACT DE PORTE TERRAIN — un guillemet tronquait les MESURES.** Trouvé
  au rituel de clôture du 15 août, corrigé et republié : `esc()` n'échappait pas
  le guillemet droit, injecté dans `value="…"`. Le stockage était intact, mais
  rééditer un champ tronqué aurait écrasé la valeur complète. ⏳ **Si Grégoire a
  saisi une mesure contenant un guillemet avant la correction, elle est à
  revérifier sur la page.**
- ▣ **BASCULE DES LIENS EXISTANTS : LIVRÉE en 1.83.2.** Elle joue au chargement
  de chaque carte, une seule fois, et se DIT (console + toast). Elle ne touche
  ni la direction des liens ni aucun autre verbe. ⏳ **À observer sur sa vraie
  carte** : le compte annoncé au premier chargement doit correspondre à ce
  qu'il attend — c'est la seule vérification qui reste, et elle est de son côté.
- ⏳ **NON ÉPROUVÉ : la BEAUTÉ des tracés de liens sur sa vraie carte.** Le
  routage garantit qu'un lien ne traverse pas de bloc (mesuré : 58/60 libres sur
  carte dense) ; il ne garantit pas que le détour soit joli. Seul son œil peut
  le dire, et aucune porte terrain ne couvre encore ce point.
- ✅ **PORTE TERRAIN DE LA RECHERCHE : PASSAGE CLOS, 45/46, ZÉRO ÉCHEC.**
  Deux défauts trouvés par le terrain, corrigés et **revalidés sur son iPad**
  le 15 août : la **teinte du halo** (ocre désaturé emprunté au jeton d'alerte
  → jaune vif, 1.81.1) et la **barre d'outils rognée sur iPad en portrait**
  (débordement PRÉEXISTANT au champ, mesuré à 783 px pour 728 dès 1.80.0 →
  passage à la ligne, 1.81.2). ⏳ **Restent dues, mineures** : la rangée
  « taper `lecon` puis `expose` » de la **2.4**, et la mesure **2.2m**.
  ⮕ **Ses verdicts §3, tous rendus** : ⌘F non branché (3.1), seuil de 2
  caractères conservé (3.2, après correction de sa part), type de bloc gardé
  tel quel malgré 22 évaluations et 32 leçons remontées (3.3), largeur du champ
  bonne (3.4), épaisseur du halo bonne (3.5). **Aucune décision en suspens.**
- ~~Porte terrain neuve à traiter~~ (close, ci-dessus) —
  `plans de travail/PORTES-TERRAIN-2026-08-15-recherche-carte.md` (artefact :
  <https://claude.ai/code/artifact/508d3560-7111-4f1d-85c1-9a6b7c5323cc>).
  14 portes, **46 vérifications, 4 mesures, 5 décisions**. Elle porte la
  recherche de la Carte d'alignement (1.81.0). Trois points y sont bloquants
  pour la suite : la **2.6** (le halo se voit-il sur ses douze fonds de
  canevas — l'ambre seul en ratait la moitié, mesuré), la **2.12** (iPad, rien
  n'a jamais été vu), et les **deux mesures de la 2.4** dont dépend la
  décision **3.3** (chercher par type de bloc reste-t-il lisible sur sa vraie
  carte). ⮕ **ÉTAT AU RETOUR DU TERRAIN : 44 passées, 1 échec, 1 non traitée.**
  Restent dus : la **2.1c** (ÉCHEC — sur iPad en PORTRAIT, les boutons de droite
  de la barre ne sont pas tous là), la rangée « taper lecon puis expose » de la
  **2.4**, la mesure **2.2m**, et **la 2.6 ENTIÈRE À REFAIRE** — elle a été
  validée avec l'ancienne teinte du halo, remplacée depuis en 1.81.1.
  ⮕ **Les deux ont été REJOUÉES SUR SON IPAD le 15 août et passent.**
- **5 rangées de porte terrain non traitées** —
  `plans de travail/PORTES-TERRAIN-2026-08-12-416-lots-CGIHB.md` : 3.3 (supprimer
  un gabarit) en entier, la fin de 4.1 et de 4.3. **Plus les deux corrections du
  jour à revérifier** : la case « Travail hors classe » qui ne déclenchait rien,
  et le Markdown du Calendrier repassé en sections.
- ✅ ~~**6 specs Playwright ROUGES**~~ — **#456 CLOS le 18 août au soir : 9/9 en
  WebKit (relevé de la 4ᵉ passe terrain), baseline à 0.** Six rouges éteintes en
  quatre passes — toutes dérives de test ou défauts de harnais, zéro bug d'app.
  L'historique ci-dessous reste vrai pour la méthode. — versées au backlog en **#456**. ⚠ **Ce fichier
  a dit « 5 » du 12 au 18 août : le compte était faux d'une unité.** La suite
  complète a été lancée pour de vrai le **18 août sur le Mac** (WebKit, 3 min 42)
  et rend **87 passées / 6 échecs** ; `planif-drag-pointer-148.spec.js:70`
  manquait à la liste. C'est exactement le défaut que l'item décrit : elles ne
  tournaient nulle part — WebKit manque aux conteneurs, personne ne les lançait
  en local — donc le chiffre se recopiait sans jamais être reproduit.
  ⮕ **Ne pas réécrire ce compte sans relancer `npm run test:int` depuis `tests/`.**
  Préexistantes, oui : les 6 mêmes échouent sur `d27659e3` comme sur `1fafa5d5`
  (contre-épreuve en worktree, 18 août) — **la Brique C n'a rien cassé**, et ses
  deux specs passent.
- **Les trois info-bulles du gabarit des productions (1.80.0) n'ont jamais été VUES** —
  199 à 238 caractères dans une bulle de 320 px, et sur iPad elles s'ouvrent au
  long-press, pas au survol. À éprouver sur son matériel, dans les deux modes.
- ✅ ~~**#455** — le cours est-il global ou par session ?~~ **TRANCHÉ ET LIVRÉ
  le 19 août (1.87.8)** : le cours est GLOBAL (décision Grégoire — « le devis
  ministériel ne change pas d'un trimestre à l'autre »). Identité = code seul,
  la suppression d'un trimestre ne touche plus le magasin `cours`, garde
  anti-seconde-fiche au formulaire. Entrée #455 du BACKLOG pour le détail.

⮕ **Où lire la suite** : le bloc **15 août (matin)** de `SESSION.md`, en tête de
fichier. Il porte les trois défauts que seule la MESURE a trouvés sur la
recherche — dont une normalisation d'accents que mon propre test déclarait
verte parce que ses exemples ne pouvaient pas la mettre en défaut, et une
première correction de contraste qui était insuffisante et que seule la
SECONDE mesure a démasquée. Puis le bloc **12 août**.
Il porte les deux défauts trouvés par la porte terrain — dont le troisième
retour d'une même classe de bug dans `planification-carte.js` — et les onze
tests qui n'observaient pas ce qu'ils annonçaient.

---

> ▣ **HISTORIQUE — état du 11 août, conservé pour la méthode.** L'état courant est
> le tableau en tête de fichier ; celui-ci ne vaut plus. (Son en-tête de tableau
> avait été mangé par une réécriture, ce qui le faisait passer pour la suite du
> bloc courant — réparé le 15 août.)

| | |
|---|---|
| **Branche à ouvrir** | **`main`** |
| **Version** | **1.75.0** — build `0811-1319` |
| **Travail en avance sur `main`** | **aucun** |
| **Prochaine session** | **jeudi prochain** (décision de Grégoire, 11 août) |
| **Dernière mise à jour** | 11 août 2026, clôture — fusion + déploiement |

✅ **Aucune dette de fusion.** Le cycle du 11 août (**17 commits, 1.71.1 → 1.75.0**)
est sur `main`. Suite rejouée sur l'arbre fusionné : Vitest **2226/2226**
(248 fichiers), arbre propre, `origin/main ↔ HEAD : 0 / 0`.
Dernier ID utilisé : **#451**.

⮕ **Où lire la suite** : le **§3 de `SESSION.md`** porte la consigne complète —
prémisse chiffrée, priorité 0 (ce qui touche sa rentrée), les dettes datées de
septembre, et la leçon de la journée sur l'écriture des tests.

---

## Ce que le cycle a livré

**Cinq versions, toutes nées de son travail réel** — il préparait son 601-101 dans
la Carte d'alignement, et chaque friction est devenue une livraison le jour même :

| | |
|---|---|
| **1.72.0** | ⌘D duplique toute la multi-sélection (Supprimer la traitait déjà — c'était une asymétrie, pas un manque) |
| **1.73.0** | « Tout voir » + **loupe de navigation** (sa carte est illisible à 25 %, qui était le plancher du zoom) |
| **1.74.0** | Guides magnétiques + six commandes d'alignement |
| **1.74.1** | Le clic dans la carte atterrit · le pointeur devient la zone examinée |
| **1.75.0** | **#448** — une collision d'id à l'import n'est plus un accident à renommer |

Plus : **#451 clos** (a2026 porté dans Safari), **#450** et **#449** documentés
sur mesures, `SKILL_portes_terrain.md` amendé, et trois outils de console
(`diagnostic-448`, `reparation-448`, `inspecterOrphelins448`).

---

## ⚠ CE QUI RESTE DÛ, ET QUI N'EST PAS DU CODE

**Sa rentrée est dans trois semaines.**

1. ✅ ~~⚠️ **#368 — vérifier EN PREMIER que la carte 601-101 est bien passée en
   A26.**~~ **VÉRIFIÉ PAR GRÉGOIRE le 18 août** : « oui, la carte 601-101 est
   vraiment en A26. » Le préalable de la rentrée est levé ; l'entrée #368 est
   cochée au BACKLOG (restes optionnels : ménage des cartes, confirmation
   Safari — la carte y voyage par codex).
2. ⚠️ **#450** — renommer les deux échelles « IDME et niv 0 » d'a2025, **dans les
   deux navigateurs**. Citées 344 et 72 fois : renommer, jamais fusionner.
3. ⏳ **Safari** — les 5 copies muettes y sont encore. Chrome est nettoyé (83 → 78).
4. ⏳ **6 magasins orphelins** — décision humaine, pas de script.

---

## ⚠⚠ LA LEÇON DU CYCLE, ET ELLE COMMANDE LA SUIVANTE

**CINQ FOIS, C'EST MON PROPRE OUTIL QUI MENTAIT — et chaque fois c'est une MESURE
qui l'a dit, jamais une relecture.**

1. La barre d'alignement partait **hors écran** : offset du canevas oublié. **Le
   même oubli que la loupe deux heures plus tôt**, dans la même session.
2. « Tout voir » tombait au plancher **en silence** quand la zone n'avait pas de
   taille.
3. La loupe restait **vide** sous la grille du Planificateur — écouteur posé sur
   la zone au lieu du document. Symptôme « ça marche parfois ».
4. Mon inspecteur d'orphelins déclarait « CONTENU UNIQUE » huit fois dans un
   magasin de quatre paires : j'excluais le magasin courant de sa propre
   recherche. **Et son verdict conseillait de SUPPRIMER un contenu qui n'existait
   que là.**
5. Mon garde a refusé cinq retraits légitimes sur `dateImport` — le projet avait
   déjà une liste canonique de ces champs (`securite-hash.js:34`) ; je
   réinventais une règle à côté d'une règle existante.

⮕ **Sur les données et sur le DOM, un diagnostic lu au code est une HYPOTHÈSE.**
Le conteneur a Chromium ; reproduire coûte trois minutes, et ça a payé cinq fois.

**ET TROIS BREAK-TESTS SONT RESTÉS VERTS — trois tests trop lâches :**

- **piège `indexOf`** : rend `-1` quand le motif est absent, et `-1` est inférieur
  à tout index — une assertion d'ORDRE passe donc quand le code qu'elle protège
  DISPARAÎT. **Deux autres assertions du dépôt portaient le même piège** ;
- **valeurs non discriminantes** : 4 px et 40 px répondent pareil avec ou sans
  division par le zoom ;
- **assertion qui nomme l'invariant et en teste un plus faible** — démasquée par
  le rituel de fin, sur l'arbre final.

⮕ **Les trois ont en commun d'avoir été écrits en même temps que le code qu'ils
protègent.** Le break-test n'est pas une formalité de clôture : c'est la seule
chose qui distingue un test d'une décoration.

---

## ⚠ CE QUI N'EST PAS VALIDÉ

- **Safari et iPad** — WebKit n'existe pas dans le conteneur. Tout a été éprouvé
  dans Chromium, y compris les gestes tactiles, mais ce n'est pas son matériel.
- **Deux specs Playwright neuves n'ont JAMAIS été exécutées**
  (`planif-tout-voir-loupe.spec.js`, `planif-alignement.spec.js`) → CI.
- **Le parcours d'import COMPLET (vrai ZIP) n'a pas été rejoué.** Le correctif
  #448 est prouvé sur la ligne de fusion, en bac à sable et au navigateur — pas
  de bout en bout.

⚠ **Et un piège de harnais, noté pour la prochaine fois** : des ids de test
courts (`f1`, `v1`) apparaissent par hasard dans d'autres données. Le comptage de
citations par sous-chaîne les déclare « cités », aucun orphelin n'est détecté, et
les scénarios passent **sans rien exercer**. Utiliser des ids réalistes.

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.
