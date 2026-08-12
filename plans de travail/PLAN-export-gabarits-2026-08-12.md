# PLAN — Exports configurables : gabarits nommés, colonnes libres, granularité au choix

> **Chantier** : #416, dernier volet — plus la levée du report « colonnes de
> séance » de #410/#411.
> **Origine** : demande de Grégoire, 12 août 2026, session Cowork.
> **État de départ** : `main`, 1.75.0, build `0811-1319`, Vitest **2226/2226**
> (248 fichiers) — mesuré, pas supposé.
> **Remplace** : `PLAN-export-calendrier-2026-08-12.md` (même journée, écrit
> avant lecture des plans de travail — sa décision D5 est renversée ci-dessous).
> **Statut** : PLAN. Lot 0 fait. Rien d'autre n'est codé.

---

## 1. Ce que le terrain a tranché

Le 8 août, au journal `USAGE-FORMATS.md`, une hypothèse est consignée :

> « Un seul réglage personnalisé suffit-il, ou faudra-t-il des **gabarits
> nommés** (« plan département », « contrat étudiant ») ? »

Le 12 août, Grégoire répond depuis son usage réel : il doit composer avec des
**exigences départementales** et des **habitudes de présentation** qui ne sont
pas les siennes, et réutiliser la matière dans ses **propres** outils. Un seul
réglage mémorisé ne couvre pas ça — il en faut plusieurs, nommés, et dont les
colonnes se renomment.

⮕ L'hypothèse est levée par le terrain, exactement comme le journal le prévoyait.
C'est le mécanisme qui a fonctionné, pas une improvisation.

---

## 2. Renversement de D5, et pourquoi ce n'en est pas un

Le plan de ce matin proposait « Calendrier » comme **quatrième préréglage à six
colonnes figées**. C'était faux, pour deux raisons que l'audit du 8 août énonce
lui-même.

**D4 le déconseille explicitement** : « au-delà de trois, le choix devient
lui-même une friction, et les niveaux intermédiaires se ressemblent ». Le
« Personnalisé » de #431 n'a jamais été un quatrième *niveau* — c'est
l'échappatoire des trois. Un « Calendrier » aurait été un cinquième, contre
l'argument.

**D5, en revanche, est confirmée — et étendue.** Sa motivation n'est pas « deux
axes » mais « **des paramètres, pas des générateurs** » : six générateurs qui se
recopient deviennent un, et les croiser naïvement en donnerait neuf. Ajouter la
granularité comme **troisième paramètre** du générateur unique sert exactement
cette règle. Ce qui la trahirait, ce serait un rendeur de plus à côté.

### Les trois axes

| Axe | Valeurs | État |
|---|---|---|
| **Granularité** | une ligne par **nœud** · une ligne par **séance** | à créer |
| **Colonnes** | lesquelles · dans quel ordre · sous quel nom | à moitié (#431) |
| **Format** | texte · TSV · Markdown | livré (#424) |

Et « Calendrier » devient ce qu'il aurait dû être dès le départ : **un gabarit
d'usine**, pas un niveau. Six colonnes proposées, que l'utilisateur ampute,
réordonne et renomme.

---

## 3. Zéro-dette : les préréglages FONDENT dans les gabarits

C'est la conséquence que ce plan doit assumer, sinon il empile.

Si les gabarits nommés arrivent et que `NIVEAUX` / `INCLUSIONS` / `personnalise`
restent à côté, l'application porte **deux mécanismes de configuration
d'export** — précisément l'empilement que D5 refuse. La règle du projet est
nette : « tout nouveau chantier RETIRE ce qu'il remplace ».

⮕ **Sommaire, En classe et Preuve d'alignement deviennent des gabarits
d'usine.** Non modifiables sur place, duplicables en un geste. Le « Personnalisé »
disparaît en tant que niveau : il n'était que le gabarit qu'on n'avait pas.

### Ce qui rend ce refactor sûr

Le plan #431 pose que « les presets sont des CONTRATS : le harnais 424 doit
rester vert sans retouche de ses assertions ». Cette contrainte devient ici la
**preuve du refactor** : si les quatre gabarits d'usine produisent une sortie
**bit-à-bit identique** à celle de 1.75.0, la fonte n'a rien changé pour
l'utilisateur. Le harnais existant fait le travail — je ne touche pas une seule
de ses assertions.

⚠ Si une assertion doit bouger, c'est que j'ai changé un comportement sans le
décider. Le signal est là pour ça.

---

## 4. Ce qui manque au modèle de données

Deux des colonnes demandées n'ont aucun logement, et le backlog le dit déjà :

> « la séance n'a pas de logement dans le modèle (colonnes reportées) » — #411

> « le nettoyage des titres, à moitié bloqué tant que les colonnes de séance
> sont reportées » — #410

**Séance.** « A » ou « B » ne vit que dans le titre (`3A`, `3B`) — la béquille
que `analyserRepereTitre` détecte et refuse de retirer faute d'ailleurs où
poser l'information.

**Travail hors classe.** Aucun type, aucune métadonnée. Patron le plus proche :
`metadata.prealable` sur les nœuds factuels.

**Date.** Elle existe, complète, vérifiée au lot 0 : 30 séances du 21 août au
11 décembre 2026, chacune portant `date`, `jour` et `numeroSemaine`. Il ne
manque que le chaînon leçon → séance datée, qui a besoin de la colonne Séance.

### Décisions acquises (12 août)

| # | Décision | Verdict |
|---|---|---|
| D1 | Rang **entier** (`metadata.rangSeance` = 1, 2, 3…), affiché A/B/C | ✅ Grégoire |
| D2 | Le rang se pose **dans le bloc du planificateur**, à côté de la semaine (patron #410) | ✅ recommandation |
| D3 | Un nœud hors classe **ne porte aucune durée** (comme les connaissances) | ✅ Grégoire |
| D4 | Hors classe applicable aux **évaluations et aux frères d'Activité** | ✅ recommandation |
| D5 | **Renversée** : granularité = 3e axe ; « Calendrier » = gabarit d'usine | ✅ Grégoire, 12 août |
| D6 | Formats du gabarit Calendrier : **TSV et Markdown**, pas Texte | ✅ recommandation |
| D7 | Plusieurs **gabarits nommés**, dès maintenant | ✅ Grégoire, 12 août |
| D8 | **Toutes les colonnes égales** — le préfixe fixe `Séquence \| Leçon \| Semaine` est libéré | ✅ Grégoire, 12 août |
| D9 | Cours à **plusieurs groupes** → colonne Date **vide**, jamais de devinette | hypothèse, à confirmer |

⚠ **D8 rouvre une décision du 8 août** (« la structure EST la carte »). Son
motif reste valable pour un export de *conception* ; il ne l'est pas pour un
tableau que le département impose. Les deux besoins coexistent — d'où les
gabarits.

---

## 5. Les lots

Ordre choisi pour que le calendrier arrive **avant** le gestionnaire de
gabarits : Grégoire est en retard sur sa préparation de cours.

### ✅ Lot 0 — Vérification (fait, 12 août)

Vitest 2226/2226. Dates A26 présentes et complètes. ⚠ Découverte : les séances
sont indexées par **groupe-cours** (`seancesCompletes_gc_<id>`), alors que la
carte se rattache à un **cours** (#407) — d'où D9. Contradiction du modèle du
cours versée au backlog en **#455**, hors de ce chantier.

### Lot A — Le rang de séance entre dans le modèle

`metadata.rangSeance`, porte d'écriture unique `definirRangSeance()` sur le
patron de `definirSemaineLecon()`. Sélecteur dans le bloc, rendu paresseux
(`reconstruireDOM` passe souvent). Sentinelle comportementale + break-tests.

### Lot C — La date, dérivée et jamais stockée

`dateDeLecon(lecon)` pure : cours de la carte → groupe-cours → séances →
filtre `numeroSemaine` → tri par date → rang. Trois états dégradés silencieux
et non bloquants (pas de cours rattaché · pas de rang posé · pas de séance à ce
rang), plus le cas D9. Une carte reste utilisable sans horaire.

### Lot G — Le générateur à trois axes

Granularité en paramètre. Colonnes en **liste ordonnée d'objets**
`{id, libelle}` — cochables, ordonnables, renommables, préfixe compris (D8).
Semaine, Séance et Date y entrent comme colonnes ordinaires. Les quatre
gabarits d'usine sortent **bit-à-bit** comme 1.75.0 : le harnais 424 est la
preuve, sans retouche d'assertion.

⮕ **Dette à fondre au passage** (§1.4 de l'audit) : les exports disent encore
« SÉANCE » là où ils désignent une **leçon**. Le mot devient ambigu au moment
précis où la séance existe pour de vrai — à corriger ici, pas plus tard.

### Lot I — Le gabarit d'usine « Calendrier »

Six colonnes : Semaine · Séance · Date · Contenu · Évaluations · Travail
personnel. Une ligne par séance. Contenu = frères d'Activité non hors classe ;
Évaluations = nœuds d'évaluation non hors classe ; Travail personnel = tout ce
qui est hors classe. TSV et Markdown.

⚠ Sans le lot B, la sixième colonne sort **vide** — c'est le compromis accepté
le 12 août pour livrer plus tôt.

### Lot H — Les gabarits nommés

Collection de configs `{id, nom, granularite, colonnes, format}`. Créer,
dupliquer, renommer, supprimer, choisir. Les quatre d'usine sont dupliquables,
pas modifiables sur place. Le réglage unique `exportPlanPersonnalise` de #431
**migre** en un gabarit nommé — pas d'alias, pas de cohabitation.

### Lot B — Le travail hors classe

`metadata.horsClasse`, case dans l'Inspecteur, patron `metadata.prealable`. Le
champ Durée disparaît quand la case est cochée, et le nœud sort de
`dureeRollupNoeud`. Le break-test qui compte : **le Σ d'une leçon ne bouge pas**
quand on marque un de ses nœuds hors classe.

### Lot E — Les repères de séance quittent les titres

La séance ayant un logement, `analyserRepereTitre` peut enfin proposer le
retrait de « séance 2 » comme il propose celui de « Sem. 11 ». Le report de
#410/#411 est levé, pas contourné.

⚠ **Réciproque de la règle du 6 août** : on ne LIT jamais le rang depuis le
titre pour le poser d'office. Proposé, confirmé, jamais appliqué seul.

### Lot F — Clôture

`release.mjs minor`, changelog, BACKLOG (#416 avance ; #410/#411 se ferment sur
leur moitié restante), SESSION.md, `USAGE-FORMATS.md` (l'hypothèse du 8 août
est levée — le noter là où elle a été posée), porte terrain selon
`SKILL_portes_terrain.md`.

---

## 6. Risques

**Le plus sérieux — la fonte des préréglages (lot G).** Elle touche le seul
générateur d'export de l'application. Le filet est le harnais 424 : identité
bit-à-bit des quatre gabarits d'usine, sans retouche d'assertion. Si une
assertion doit bouger, on s'arrête et on regarde pourquoi.

**Le second — le Σ des leçons (lot B).** `dureeRollupNoeud` alimente l'en-tête
de chaque bloc et le compteur du planificateur. Une erreur s'y voit partout et
ne ressemble pas à un bug d'export.

**Le sournois — le vert et inerte.** Trois occurrences en deux jours début
août : des sentinelles qui vérifiaient le balisage ou une chaîne dans la source,
pas le comportement. Les lots A et H posent de l'interface, donc des glyphes,
donc le terrain exact de 1.53.1. Sentinelles **comportementales**, chacune
break-testée avant qu'on lui fasse confiance.

**L'ambigu — le rattachement de la carte v3.** Elle vient d'un fichier ; son
cours est à refaire à la main (Actions ▸ Cours rattaché…). Si le lot C sort des
dates vides au premier essai, c'est probablement ça, et non le code.

**Le calendaire.** Sept lots avec sentinelles et break-tests. Si l'échéance
serre, A + C + G + I donnent les colonnes 1 à 5 ; H, B et E suivent.

---

## 7. Ce que je ne ferai pas sans le redemander

Fusionner vers `main`. Pousser. Lancer `release.mjs`. Toucher aux zones
protégées (`js/config.js`, `js/navigation.js`, `noms_stables.json`). Modifier
les données réelles A26.
