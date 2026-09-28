# Demande de relecture – #964, carte d'alignement lot 2 : « Mes badges suivent mes objectifs »

> Écrite le 27 septembre 2026 par Claude Code (session infonuagique), pour Cowork. Branche `claude/carte-alignement-964-badges-objectifs`, partie de `df359bf` (`main`, 1.163.0), **indépendante de la branche #963** (les deux touchent `js/planification-carte.js` dans des régions distinctes ; les jetons `?v=` diffèrent (`20260927a` pour #963, `20260927b` ici, exigé par le hook anti-cache) : à la fusion, garder `20260927b` ou plus récent). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-2-mes-badges-suivent-mes-objectifs.md`. **Pas de release ni de fusion avant ta relecture** ; pas de version publique sans l'accord de Grégoire.

## 0 · Le point 5, signalé avant de coder

**Mesuré** : l'Inspecteur d'une évaluation ne proposait que les objectifs de SA leçon (`planification-carte.js`, section « Objectifs servis ») ; le glisser sur un objectif refusait toute autre leçon ; `objectifsServisPar` écartait à la lecture tout objectif d'une autre leçon. Le guide validé promet « ceux de cette leçon ou d'une leçon précédente ».

**Signalé à Grégoire avant de coder. Ses deux décisions (27 sept.)** : élargir dans ce lot ; « précédente » = **placée avant elle** (semaine antérieure, ou même semaine et séance antérieure ; une leçon sans semaine n'est jamais « avant » ; une évaluation dans une leçon sans semaine ne voit que sa leçon).

## 1 · Ce qui change à l'écran

| Où | Avant | Après |
|---|---|---|
| Tracer un lien vers (ou depuis) une évaluation | verbe « se vérifie par » posé d'office | **refusé**, message : « Une évaluation se relie à ses objectifs : ouvre son Inspecteur et coche ceux qu'elle vérifie. » |
| Inspecteur d'une évaluation | « Objectifs servis » : les objectifs de sa leçon | **« Objectifs vérifiés »** : « Cette leçon », puis une rubrique par leçon placée avant elle, de la plus proche à la plus ancienne (« Leçon « X » (semaine N, séance B) »). Un objectif déjà coché dont la leçon n'est plus « avant » reste affiché dans sa rubrique, pour pouvoir le décocher |
| Glisser une évaluation sur un objectif | sa leçon seulement | sa leçon ou une leçon placée avant ; sinon : « Une évaluation coche les objectifs de sa leçon ou d'une leçon placée avant elle. » |
| Badge amont d'une évaluation | ✓ si reliée à une idée maîtresse, une connaissance ou une activité | ✓ si elle vérifie au moins un objectif (« Vérifie N objectif(s) ») **ou** si un lien hérité la relie comme avant ; sinon « ! » avec « Aucun objectif coché : coche dans l'Inspecteur les objectifs qu'elle vérifie » |
| ⚠ d'une idée maîtresse (et donc de la compétence) | levé par un chemin de liens jusqu'à une évaluation | levé **aussi** quand une leçon reliée (ou une leçon enfant directe d'une séquence reliée) a un objectif vérifié par une évaluation, où qu'elle soit |
| Pastille d'un objectif | vérifié par une évaluation de SA leçon, ou par transitivité | vérifié dès qu'une évaluation, **dans n'importe quelle leçon**, le coche ; sans bloc servant, reste « ! » (inchangé) ; la semaine n'est pas lue |
| Exposé | ✓/✓ sans condition (cas par défaut) | calculé comme une activité : ✓ si relié à une connaissance, sinon « ! » |
| Export du plan, évaluation | « Objectifs servis » : ceux de sa leçon | aussi ceux d'une leçon précédente qu'elle vérifie (texte seul) |

## 2 · Compatibilité (point 2, non négociable)

- **`TYPES_LIENS` garde `se_verifie_par` ; `VERBES_COMPAT` et `MIGRATION_VERBES` sont intacts.** Seules les seize paires `…>evaluation` de `VERBES_AUTO` sont retirées (le repli sur la famille n'en retrouve donc aucune).
- **Rien n'est écrit ni supprimé** : aucun chemin du lot ne réécrit de lien ni d'objectif. `signalerVerbesDevenusInexacts` ne signale pas les liens hérités (ils étaient « non suggérés » avant ET après un changement de type : il ne compte que la bascule).
- **Essai (a)** : une carte fictive qui n'a que des liens « se vérifie par » (et un ancien verbe `evalue_par`) garde exactement ses badges, ⚠ et pastilles, **Exposé mis à part**. L'état attendu a été **mesuré en exécutant le code de `main`** (`df359bf`) sur la même carte, puis figé dans le banc.

## 3 · Ce que j'ai décidé seul

1. **Lecture large, proposition bornée.** L'Inspecteur ne *propose* que sa leçon et les leçons placées avant ; la *lecture* compte tout objectif coché qui existe encore, quelle que soit sa leçon (`objectifsVerifiesPar`). Motifs : déplacer une leçon après l'évaluation ne doit rien effacer en silence ; et le lot 3 (#965) affiche justement « servi qu'après cette évaluation » : il a besoin que ce cas reste lisible.
2. **La séquence reliée compte** pour le ⚠ de l'idée maîtresse (leçons enfants directes), à la même profondeur que la règle des liens existante. La consigne ne nommait que la leçon.
3. **Ordre des rubriques** : sa leçon, puis les précédentes de la plus proche à la plus ancienne (la plus proche est la plus probable).
4. **Dupliquer une leçon** garde, sur l'évaluation copiée, l'objectif d'une leçon précédente (sinon il était perdu à la copie) ; ceux de sa propre leçon suivent la copie, comme avant.
5. **Les liens hérités continuent de compter** pour le badge amont de l'évaluation et pour la vérification transitive des pastilles (consigne : « comptés comme aujourd'hui »).

## 4 · Preuves

- **Vitest complet** : 645 fichiers, 7 515 essais verts.
- **Nouvelle sentinelle** `tests/unit/sentinelle-badges-objectifs-964.test.js`, 19 essais (cours fictif « Jardinage lunaire ») : (a) carte héritée ; (b) objectifs cochés (badge, ⚠ de l'IM et de la compétence, pastille, séquence reliée, « ! » sans bloc servant) ; (c) objectif d'une autre leçon (compte ; rubriques proposées et leur ordre ; leçon sans semaine ; hors leçon ; leçon déplacée après : reste compté ; objectif retiré : ne compte plus ; glisser avant/après ; duplication) ; retrait du geste (aucun verbe, dans les deux sens, pour 17 types ; message ; autre lien impossible : message d'origine) ; export du plan.
- **Mutations Vitest, treize sur treize rouges** : une paire rétablie ; Exposé dans le défaut ; badge sourd aux objectifs ; ⚠ sourd à la leçon reliée ; ⚠ sourd à la séquence reliée ; pastille limitée à sa leçon ; lecture filtrée aux leçons proposées ; leçon sans semaine comptée avant ; glisser accepté de toute leçon ; duplication qui perd l'objectif ; export limité à la leçon parente ; ancien message ; liens hérités ignorés.
- **Bancs réancrés délibérément** (le geste retiré, motif écrit dans chaque essai) : `sentinelle-graphe-enseignement` (étape de méthode → évaluation ; Exposé → évaluation ; deux paires retirées de la liste des paires brutes), `sentinelle-liens-routage` (révision ↔ évaluation). Aucun autre banc touché.
- **Navigateur** : `tests/integration/planif-badges-objectifs-964.spec.js` (carte démo complétée) : Inspecteur « Objectifs vérifiés », rubriques « Cette leçon » puis la leçon de semaine 1 ; cocher l'objectif de la leçon précédente fait passer le badge amont de « ! » à ✓ et la pastille de l'autre leçon à « vérifié ». Trois mutations rouges (Inspecteur sans leçons précédentes ; badge sourd ; pastille limitée). **Vert sous Chromium seulement ; les 22 essais `planif-*` aussi.** WebKit n'existe pas dans ce conteneur : **verdict WebKit à prendre sur le Mac de Grégoire.**

## 5 · Les mots – à faire accepter par Grégoire

| Où | Texte |
|---|---|
| Tracer vers une évaluation (point 3) | « Une évaluation se relie à ses objectifs : ouvre son Inspecteur et coche ceux qu'elle vérifie. » |
| Inspecteur | « Objectifs vérifiés » ; « Cette leçon » ; « Leçon « X » (semaine N, séance B) » |
| Badge amont de l'évaluation (infobulle) | « Vérifie 1 objectif » / « Vérifie N objectifs » ; « Aucun objectif coché : coche dans l'Inspecteur les objectifs qu'elle vérifie » |
| Glisser une évaluation sur un objectif | « Objectif coché : cette évaluation le vérifie désormais. » ; « Déjà coché : cette évaluation vérifie cet objectif. » ; refus : « Une évaluation coche les objectifs de sa leçon ou d'une leçon placée avant elle. » |

## 6 · Stock (tarir n'est pas réparer)

Rien n'est écrit. **Ce qui change à la lecture, sur des cartes existantes** : (1) une évaluation qui cochait déjà un objectif de sa leçon (possible depuis #403) gagne son ✓ amont, et le ⚠ de son idée maîtresse ou de sa compétence peut se lever ; (2) tout Exposé non relié à une connaissance passe de ✓/✓ à « ! » ; (3) une évaluation **clonée** dans une autre leçon porte les objectifs cochés de son original (métadonnées partagées) : ils comptent désormais pour les pastilles de la leçon d'origine. Ce sont les deux effets voulus par la consigne, plus ce troisième, qui en découle ; je le nomme pour que Grégoire le sache.

**(4) Tranché par Cowork (relecture du 28 sept.), sans code** : rien ne nettoie `objectifsServis` quand un bloc change de leçon. Une évaluation **déplacée, copiée, hors leçon ou posée dans une séquence** compte désormais l'objectif qu'elle cochait (sur `main`, il était écarté à la lecture par `objectifsServisPar`). C'est cohérent avec le modèle retenu (lecture large, proposition bornée), et l'objectif reste visible et décochable dans sa rubrique de l'Inspecteur (R3 a).

## 7 · Trouvailles en chemin

- **La page 8 du guide** (`GUIDE_PAGES`, l. ~1811) dit encore « Relie-la aux éléments qu'elle évalue : idées maîtresses, connaissances ou activités. Le verbe « se vérifie par »… ». **Fausse depuis ce lot.** Hors lot par consigne (« Ne touche pas au guide ») : le lot 4 (#966) la réécrit, et part dans la même version. Issue 2, déjà couverte par #966.
- **#967** (objectif servi d'une autre leçon, tu dans l'export) : réglé ici **pour les évaluations seulement** ; reste ouvert pour les autres blocs.
- Dans le viewport de l'essai navigateur, une palette flottante recouvre l'Inspecteur et intercepte le clic (Chromium sans interface). Pas de symptôme vécu : issue 3, noté ici.
