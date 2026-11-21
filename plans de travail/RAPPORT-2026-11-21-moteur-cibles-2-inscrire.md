# Rapport – « Par standards », lot 2 : inscrire un niveau pour un·e étudiant·e sur une cible

> **Relais (21 nov. 2026).** Branche `lot/moteur-cibles-2-inscrire`, partie de `lot/moteur-cibles-1-cibles` (`947ea9d5`),
> poussée ; **aucune fusion dans `main`** (consigne : rien n'y entre avant que les quatre gestes existent et que Grégoire
> les ait essayés). La branche du lot 1 n'a pas bougé pendant le travail (`947ea9d5`, `main` à `e31a8556`) : rien à réunir.
> **Session** : Claude Code dans un conteneur cloud Linux, pas sur le Mac. **WebKit n'y existe pas** : les écrans neufs
> sont vérifiés et capturés sous Chromium ; Safari et l'iPad au doigt restent à voir (§ 5).
> **Fait** : le lot 2 entier (le tableau des cibles, l'inscription avec ses critères, l'historique, l'annulation, le geste
> « inscrire pour une production », la liste des cibles d'une production, la question de l'assistant avant de retirer une
> cible inscrite, la phrase de la note absente) ; la clé `inscriptionsCibles` à tous les registres nominatifs ; la page des
> textes proposés ; le plan révisé (décisions du 21 nov. en tête, lot 2 avec l'origine de chaque règle).
> **Reste** : les textes à faire corriger par Grégoire (`TEXTES-2026-11-21-par-standards-lot-2.md`, 73 textes et
> 4 questions) ; ses essais sur l'aperçu ; le passage WebKit du Mac ; le lot 3 (le niveau retenu).
> **PR d'aperçu** : https://github.com/bedardg71-codexnumeris/labo-codex/pull/45 (brouillon, « ne pas fusionner ») ;
> **aperçu** : https://deploy-preview-45--codexnumeris-051225.netlify.app. `RELAIS.md` (sur `main`) n'est pas touché : ce relais-ci tient
> lieu de relais de la branche.

## 1. Ce qui a été livré

- **Le tableau des cibles** (Évaluation › Tableau de notation, quand la pratique du groupe-cours est « Par standards ») :
  les étudiant·es en rangées, les cibles en colonnes (« terminale » sous l'étiquette d'une cible terminale) ; la ligne de
  l'échelle, son niveau « sans donnée » marqué ; la phrase de la note absente, une fois ; « Inscrire pour une production ».
  **Une case montre le DERNIER niveau inscrit** (la plus récente des inscriptions non annulées : la date de la trace
  d'abord, puis le moment de l'écriture), un point de la couleur du niveau, son code, et en petit le nombre
  d'inscriptions. **Choix d'affichage** : une surface neutre, ni le remplissage (« compte dans la note ») ni le contour
  (« ne compte pas ») du tableau des productions ; la légende dit « pas le niveau retenu ». Rien n'y préjuge du lot 3.
  Clavier : les flèches, Entrée ouvre. Le tableau des productions (SEL, SPE) ne change pas ; la vue simple non plus.
- **L'inscription** (toucher une case) : la cible, son énoncé ; ses critères, les essentiels marqués, chacun avec
  « Respecté » et « Non respecté » (aucun pressé d'office ; toucher encore le bouton pressé ramène à « non renseigné ») ;
  le niveau, une tuile par niveau de l'échelle, le « sans donnée » compris ; la « Rétroaction » (600 caractères au plus) ;
  « D'où vient ce niveau ? » (une production du groupe, ou « — Aucune production — ») ; la date, d'office aujourd'hui.
  **Aucun niveau n'est proposé, refusé ni signalé à partir des coches** : seuls « pas de niveau » et « date illisible »
  refusent. Puis l'historique de la case : chaque inscription, datée, son niveau, son origine, sa rétroaction, ses
  critères (✓ respecté, ✗ non respecté, – non renseigné), et « Annuler cette inscription ».
- **Annuler** : une fenêtre demande une raison facultative ; l'inscription reste, **barrée**, avec « Annulée le <date> : <raison> ».
  La case ne la compte plus ; rien n'est effacé.
- **Inscrire pour une production** : l'étudiant·e, la production, la date ; puis les cibles que la production renseigne
  (sa liste ; sans liste, toutes), chacune sur « Rien ce jour-là ». Choisir un niveau fait paraître ses critères et sa
  rétroaction. Seules les cibles qui reçoivent un niveau s'inscrivent ; elles partagent la production, la date et le
  moment de l'écriture.
- **La fiche d'une production** (Conception › Productions, groupe-cours « Par standards » seulement) : « Cibles que cette
  production renseigne », une case par cible, facultatif. Enregistré au changement, comme les autres champs. Quand le bloc
  n'est pas affiché (une autre pratique), rien n'est réécrit ; les ids d'un autre ensemble sont gardés.
- **L'assistant** : retirer une cible qui porte des niveaux inscrits (non annulés) pose la question avant d'écrire ;
  « Retirer quand même » réécrit l'ensemble sans elle, ses inscriptions restent ; refuser n'écrit rien. Retirer ou réécrire
  un **critère** ne pose pas de question (§ 4, décidé).
- **La note absente** (N1') : « … La note viendra des niveaux inscrits pour chaque cible. » (la fin « et l'inscription des
  niveaux n'est pas encore offerte » est retirée). Aucune note ne se calcule.

## 2. La forme d'une inscription (et pourquoi)

`<trimestre>_inscriptionsCibles` : **une liste où l'on ajoute**. Deux sortes d'entrées :

```js
{ id, type: 'inscription', da, ensembleId, cibleId, niveau /* code de l'échelle */, echelleId,
  date /* 'AAAA-MM-JJ', la trace */, horodatage /* l'écriture */, productionId /* ou null */, noteBreve,
  criteres: [ { id, texte, essentiel, respecte: true | false | null } ] }
{ id, type: 'annulation', inscriptionId, da, ensembleId, cibleId, date, horodatage, raison }
```

- **« Non renseigné » ≠ « renseigné, non respecté »** : `respecte: null` (l'état d'office) contre `false`. La liste porte
  TOUS les critères de la cible au moment du jugement, avec leur texte et leur marque « essentiel » : réécrire ou retirer
  un critère plus tard ne change pas ce qu'une inscription dit avoir jugé. Une cible sans critère : `criteres: []`.
- **L'annulation est un ajout**, pas une réécriture : l'inscription ne change jamais. Ce qu'il faut pour annuler : son `id`.
  L'annulation porte le DA, l'ensemble et la cible : la Réserve (par DA) et la correction d'un DA la traitent comme une
  inscription. Bénéfice mesuré : la fusion de deux codex fait l'union des deux listes **sans conflit** (sentinelle F).
- **Un seul écrivain** : `js/pratiques/inscriptions-cibles.js` (`inscrire`, `annuler`), par `modifierEtAnnoncer` (file
  d'écriture par clé, trimestre clos refusé, témoin « Enregistré »), qui ajoute au bout de ce qui est lu DANS la file.

## 3. Ce qui a été mesuré

- **La sentinelle du lot** : `tests/unit/sentinelle-par-standards-lot-2-inscrire.test.js`, 32 essais, sur les modules
  réels : A deux inscriptions, deux entrées ; B aucune écriture ne réduit la liste, une annulation ne retire rien (elle
  s'ajoute, l'inscription reste à l'identique), refus sans écriture ; C les coches à trois états du formulaire au
  stockage, une inscription sans coche complète, aucun niveau refusé ni alerte, la fenêtre ne propose aucun niveau ;
  D la correction d'un DA déplace inscriptions et annulations, sans ajout ni retrait ; E la note brève, la raison, les
  textes de la cible et le nom échappés ; F un codex enregistré (vrai ZIP) puis rouvert rend la liste à l'identique, et la
  fusion en fait l'union sans conflit ; G la case montre le dernier, pas le meilleur ; H les registres ; I la question de
  l'assistant ; J les cibles offertes ; K trois niveaux comme six. **Treize break-tests**, un par sentinelle, chacun ROUGE
  puis retiré (journal en fin de fichier).
- **La garde du lot 0 rejouée** : 16 sur 16 (mêmes chiffres nu et habité ; aucune lecture des clés neuves par les moteurs
  existants ; le cliquet des six moteurs ne nomme ni la clé ni la méthode).
- **Vitest, un seul worker, suite complète** : 941 fichiers, **12 092 verts, 0 rouge**. Les **24 erreurs non gérées** sont héritées : mesurées
  aussi sur la base du lot 1 (`947ea9d5`, arbre à part) : 12 055 verts, 0 rouge, 24 erreurs ; les fichiers où elles
  tombent, lancés seuls, n'en lèvent aucune (une minuterie du harnais).
- **Six cliquets rougis en cours de lot, finis** (le lot n'était pas fini) : #511 (`ciblesRenseignees` déclarée non
  transportée à l'export d'une production, avec sa raison, dans `import-export.js`) ; #679 (règles CSS pour les classes
  qui portent du style ; huit crochets lus par le JS inscrits à l'inventaire) ; #858 (ma sentinelle passe par `tranche()`) ;
  complexité (`construireProductionData` reste à 15, `_contexteDeBase` 12 → 13 ; `creerPratiqueV2` 75 → 76, hausse
  écrite dans `HAUSSES_ASSUMEES` sur le modèle de #1038 : un `if` d'une ligne qui délègue la question) ; sigles (« CIB »
  n'est pas écrit : le tableau reconnaît la famille par son type, `cibles`).
- **Playwright sous Chromium** : `tests/integration/par-standards-lot-2-inscrire.spec.js`, 5 sur 5 (le tableau et ses
  cases de 44 px au moins ; inscrire avec des coches, rouvrir, annuler, barré et daté ; inscrire pour une production ;
  une échelle à trois niveaux ; la fiche d'une production) ; `tableau-de-notation-1.spec.js` et
  `sentinelle-717-editeur-cibles.spec.js` rejouées : 24 sur 24, aucune régression du tableau des productions.
- **Captures** : `plans de travail/captures-2026-11-21-par-standards-lot-2/` (1180 × 820 et 820 × 1180, clair et
  sombre, à l'échelle 2 ; trois écrans : le tableau, l'inscription ouverte avec des critères cochés, l'historique d'une
  case avec une inscription annulée ; noms fictifs). Vues : à 820 px, les noms de niveau se coupaient au milieu des mots
  et le bouton d'annulation se lisait comme du texte ; corrigés avant les captures finales.
- **Non mesuré** : WebKit, Safari, l'iPad au doigt (§ 5) ; le passage complet `npm test` (Vitest puis Playwright sous
  WebKit) que la règle demande pour un commit qui touche `import-export.js` : Vitest complet fait ici, Playwright WebKit dû
  au Mac ; la démo et l'archivage d'un trimestre devant la clé neuve (rien à copier, *lu*) ; le Comparateur, l'export et le
  Suivi devant une pratique par standards avec des inscriptions (aucune note n'en sort, *lu*).

## 4. Ce que j'ai décidé seul (technique), et supposé

- **La forme des coches** : `respecte: true | false | null` sur une copie de chaque critère (§ 2).
- **Deux boutons par critère** : sans « Non respecté », « renseigné, non respecté » ne pourrait pas s'écrire (Q2).
- **« Dernier »** = la date de la trace, puis le moment de l'écriture : une inscription datée d'hier, écrite aujourd'hui,
  passe derrière celle d'aujourd'hui. **Supposé** : c'est le sens de « dernier » pour Grégoire.
- **Le compte de la case** : les inscriptions non annulées ; les annulées se lisent à l'historique et au lecteur d'écran.
- **Une fenêtre** (la modale du design system) plutôt qu'un panneau : le formulaire et l'historique sont longs, et sur
  l'iPad debout un panneau latéral prendrait de toute façon toute la largeur.
- **Les productions offertes** comme origine : celles du groupe-cours, hors diagnostiques et hors portfolio conteneur.
- **La liste des cibles d'une production** est dans la fiche de la production, comme Cowork l'avait décidé ; mesuré :
  elle entre dans le formulaire sans toucher à ses autres champs (patron #790), et n'entre pas dans le gabarit de la
  bibliothèque ni dans l'export d'une production (des ids du trimestre).
- **Un critère retiré ou réécrit** : pas de question (l'inscription garde le texte jugé ; aucun calcul ne lit les coches).
  **Une cible retirée** : la question, sans proposition de codex (la phrase du codex pour « cibles » dit « les efface pour
  de bon », ce qui serait faux ici).
- **La rétroaction est facultative** (« peut porter une note brève », décision du 20 nov.).
- **Les écritures disent « Enregistré »** (non discrètes) : le codex sait alors qu'il y a du neuf.

## 5. Ce que je n'ai pas pu voir

- **Safari (WebKit) et l'iPad au doigt** : les tuiles de niveau, les deux boutons d'un critère, le défilement de la fenêtre
  (iPad debout), le sélecteur de date de Safari, la fenêtre de la raison par-dessus la fenêtre d'inscription. Cibles de 44 px
  mesurées sous Chromium.
- **Aucune porte terrain** : l'aperçu ne touche aucune donnée réelle (règle 2 du skill `portes-terrain`), et les gestes
  à essayer sont ceux que Grégoire fera sur l'aperçu (§ 7). Le passage WebKit est une mesure de machine, due au Mac.

## 6. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| En « Par standards », le formulaire des productions exige encore une pondération (la règle ne connaît que la famille `standards`) : une production qui ne pèse sur aucune note doit en porter une | **inscrire et continuer** : plan, § 11, pour le lot 4 |
| Les 24 erreurs non gérées de la suite Vitest (une minuterie du harnais) | **héritées**, mesurées sur la base ; hors du lot |
| Le cliquet #679 compte comme « neuve » toute classe de crochet : il faut l'inscrire à l'inventaire à la main | **commenter et oublier** : le mécanisme le veut, il l'a fait |

## 7. Ce qui remonte à Grégoire

1. **Les textes** : `TEXTES-2026-11-21-par-standards-lot-2.md`, 73 textes et 4 questions (le mot du champ de la note
   brève, Q1 : « Rétroaction », second choix « Note brève » ; les deux boutons d'un critère, Q2 ; ce que montre une case, Q3 ;
   « Rien ce jour-là » d'office, Q4).
2. **Ses essais sur l'aperçu**, en mots d'utilisateur : ouvrir Évaluation › Tableau de notation d'un groupe « Par
   standards » ; toucher une case, dire deux critères, choisir un niveau, écrire une rétroaction, inscrire ; rouvrir la
   case et lire l'historique ; annuler une inscription avec une raison et la voir barrée ; « Inscrire pour une
   production » et ne remplir qu'une cible ; dans la fiche d'une production, cocher les cibles qu'elle renseigne ; dans
   l'assistant, retirer une cible qui porte des niveaux et lire la question.
3. **« Dernier niveau inscrit »** au sens de la date de la trace (§ 4) : à confirmer.
