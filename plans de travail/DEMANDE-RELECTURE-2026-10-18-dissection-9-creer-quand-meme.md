# Demande de relecture – la dissection, lot 9 : créer même s'il manque des points

> Claude Code, dimanche 18 octobre 2026, vers 18 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-9-creer-quand-meme.md` (17 h 47) ; cadrage : `CADRAGE-2026-10-18-creer-quand-meme.md`. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**, avec le verdict de la 1.206.0, le cadrage, la consigne du lot, la consigne du jour et son archive. **Pas de version, pas de push.**

## ⛔ Le point 4 n'est pas fait : la mesure du stock l'a arrêté (point 0)

La consigne dit : « Si un chemin autre que la dissection a pu écrire une absence dans des grilles existantes, arrête-toi avant le point 4 et rapporte-le. » **C'est le cas**, et j'ai vérifié moi-même les trois chemins dans le code.

| Chemin | Où | Ce qu'il écrit pour une pondération vide ou absente | Depuis |
|---|---|---|---|
| **Grilles de critères, saisie en ligne** (grille existante comme neuve) | `grilles.js:4846` (le champ porte `data-parse-int`), `grilles.js:5592` et `6162` (`parseInt(el.value)`, sans `\|\| 0`) | **NaN** quand le champ est vidé. `JSON.stringify` en fait `null` en localStorage ; IndexedDB le garde en NaN | La Beta 0.80.5 (`56ca77a8`), selon la mesure |
| **L'assistant de pratique, « Grille de base »** | `wizard-pratique-v2.js:1771-1774`, écrite en `2679` | **Pas de champ `ponderation`** : ses quatre critères portent `poids: 25` | `2b6d4e80` |
| **L'import « configuration complète »** (JSON, ZIP) | `import-export.js:3028-3050` | **La valeur du fichier, quelle qu'elle soit** : aucun assainissement des grilles avant `db.setSync` | Ancien |

Deux autres chemins propagent ces absences sans en créer :
- les duplications, le partage vers les grilles actives et la restauration d'un Codex recopient la valeur telle quelle ;
- l'import sélectif et le partage laissent passer un **champ manquant**, mais ramènent `null`, NaN et le texte à 0, ou rejettent le paquet.

Les chemins qui écrivent toujours un nombre :
- le critère neuf de l'éditeur (`ponderation: 0`) ;
- `GRILLE_GENERIQUE` et les gabarits (25 × 4) ;
- le pack démo ;
- les migrations : aucune n'écrit `critere.ponderation`.

Mesure faite par lecture du code, avec un sous-agent. Les trois chemins du tableau ont été relus par moi.

**Ce que cela veut dire.** Des grilles déjà en base, y compris d'A2025 et d'H2026, ont pu recevoir un critère sans pondération. La garde du point 4 rendrait alors « incomplète » une évaluation déjà remise, et sa note afficherait « -- ».

**Inférence** : la grille de base de l'assistant de pratique est le cas le plus probable. Elle n'a **aucune** `ponderation` sur ses quatre critères, et le point 4 la rendrait entièrement hors note. Je n'ai pas lu les données réelles et je ne les lirai pas : c'est à Grégoire de décider s'il faut les mesurer.

**Une conséquence à trancher avant la version.** Les points 1 à 3 sont livrés. La dissection crée donc maintenant des grilles avec des critères à `null`. Sans le point 4, une copie évaluée avec une telle grille aura sa note calculée **en silence sur les seuls autres critères** : `calculerPortee` ne range hors note qu'un critère de pondération strictement positive. C'est exactement ce que le cadrage voulait éviter.
- La confirmation ne promet donc **plus** « pas de note » : j'ai retiré la phrase, qui serait fausse.
- Je propose de **ne pas publier le lot 9 tant que le point 4 n'est pas tranché**. Une piste : une garde qui ne vise que les grilles marquées à leur création par la dissection. Ce n'est qu'une piste, pas une mesure ; la décision revient à Grégoire et à Cowork.

## Ce qui est fait (points 1, 2, 3 et 5, sans le point 4)

1. **La lecture** (`materiel-dissection-lecture.js`) :
   - Sans niveaux, la grille se lit en points dès qu'**un** critère a une pondération (`pondsLues`).
   - Les messages qui ne disent que des points ou des pondérations manquants (`estACompleter`) passent dans `aCompleter`, en points comme en niveaux. Sous le bouton, ils ont leur propre intitulé et ne le grisent pas.
   - Bloquent toujours : la logique nulle, un morceau sans place, des points hors de 0 à 100 ou non entiers, et toutes les autres raisons.
2. **La création** écrit `null` pour une pondération absente (`materiel-assistant.js`, `construireGrille`). Avant, elle écrivait NaN, qui devenait `null` dans localStorage et restait NaN dans IndexedDB.
   - La confirmation compte les critères à compléter (`resume.aCompleter`).
   - Le total n'additionne que les points présents.
   - Ni « NaN » ni « null » ne s'affichent (vérifié dans WebKit).
3. **Grilles de critères** (`grilles.js`) :
   - La règle de l'absence est une seule fonction, `ponderationAbsente` (`evaluation-calcul.js`, exportée). Elle vaut pour `null`, un champ manquant, `''`, NaN et le texte ; jamais pour 0.
   - Pour une grille en points, les cinq affichages du total ajoutent « (N critères sans points) », et le signal disparaît quand tous en ont. Les affichages par critère disent « sans points » ou « sans pondération » au lieu de « null point », « NaN% » ou « 0 point ».
   - **Le stock** : cela change l'**affichage** de grilles déjà en base dont un critère n'a pas de pondération. C'est l'affichage de Conception, jamais celui d'une note.
5. **Les bancs** :
   - Vitest complet : **777 fichiers, 9 240 essais, tous verts**. Le banc neuf, `materiel-dissection-9-creer-quand-meme.test.js`, compte 10 essais.
   - Trois essais anciens décrivaient le blocage et le décrivent maintenant non bloquant : W.b (lot 2b), P.b et N.a (lot 5).
   - Le cliquet #679 avait rougi sur la classe neuve `materiel-a-completer` ; elle a maintenant sa règle CSS.
   - WebKit : 29 vertes, dont `materiel-*` et la spec neuve `materiel-dissection-9.spec.js`. Celle-ci colle (d7) sans rattachement, crée la grille, voit le signal, saisit les points, puis voit le signal baisser et disparaître, avec les points en base. Les specs des grilles en points ou en niveaux, des gabarits et des codes sont vertes aussi.
   - La découpe de (d) est partagée dans les fixtures (`decouperD`), et le banc du lot 7 s'en sert.
- **Break-tests** :
  - la raison des points redevenue bloquante : L.a, L.b, L.e et L.f rougissent ;
  - la création qui écrit NaN : A.a et A.b rougissent.
  - Celui de `calculerPortee` n'est pas fait, puisque le point 4 ne l'est pas.
  - Mon premier essai du break-test « bloquant » était mal posé : `false && a || b` ne neutralise que la première condition. Je l'ai refait en neutralisant toute la fonction.
- **Au passage** (verdict de la 1.206.0) : le commentaire du refus « boucle » dit maintenant « proposé par Cowork et accepté par Grégoire ».

## Les textes neufs (provisoires)

| Où | Texte |
|---|---|
| Sous « Créer ma grille », intitulé non bloquant | « Tu pourras créer ta grille, puis compléter dans « Grilles de critères » : » |
| Ses lignes | Les messages existants, tels quels : « les points de 2 critères (« A » et « B ») », « la pondération d'un critère (« A ») », « les points de chaque critère : surligne… » |
| Confirmation, paragraphe | « Il te restera à donner des points à 2 critères, dans « Grilles de critères ». » (en niveaux : « une pondération ») |
| Confirmation, carte (en points) | « 3 critères, sur 24 points ; 2 critères sans points pour l'instant. » |
| Grilles de critères, total (en points) | « 24 points (2 critères sans points) » ; au singulier, « (1 critère sans points) » |
| Grilles de critères, un critère | « sans points » (en points) ; « sans pondération » (en pourcentages) |

## Ce qu'aucune machine n'a éprouvé

- Les grilles réelles de Grégoire, et son stock. Rien n'y a été lu ni écrit.
