# Rapport, session A de la nuit du 8 au 9 novembre 2026 : écarter une copie plagiée, ou lui mettre 0

**Écrit par Claude Code (session cloud A), le 9 nov. 2026 entre 3 h et 6 h (heure de Montréal).** Branche
`lot/copie-non-recevable-choix`, partie de `origin/main` (`98c04bfc`, 1.237.2), poussée aussi sous
`claude/modest-cannon-krvuf1` (même contenu ; c'est la branche que l'environnement cloud m'assignait). Consigne :
`plans de travail/CONSIGNE-LOT-2026-11-08-copie-non-recevable-choix.md` (déjà sur `main`, donc dans la branche). Fiche #1176,
#1226 liée. Aucun fichier de coordination touché (règle 3 du plan de la nuit), aucune release, rien au changelog.

## En tête : ce que Grégoire verra

### Ce qui est fait

- **Marquer une copie « Non recevable (Plagiat) » ou « Non recevable (IA non autorisée) »** fait apparaître, juste sous le menu
  « Intégrité académique », la ligne « Dans la note du cours : » et deux choix, « l'écarter » et « lui mettre 0 », chacun avec ce
  qu'il fera à la note pour la famille de la pratique et la place de la production (portfolio, obligatoire, terminale). La règle de
  la pratique est **déjà cochée** ; dessous, « Règle de ta pratique : … Ton choix ne vaut que pour cette copie. » Un clic change le
  choix pour cette copie seulement ; il s'enregistre tout seul avec elle (comme le statut) et revient quand on la rouvre, même
  après un rechargement. Repasser à « Recevable » efface le choix. En dénotation, rien ne s'affiche.
- **Conception → Pratiques, les réglages de la pratique** portent une nouvelle ligne : « Une copie non recevable (plagiat, IA non
  autorisée), dans la note », avec « L'écarter, comme une copie non remise » et « Lui mettre 0 ». Elle montre la règle telle que
  le calcul la lit. **Changer un autre réglage ne l'écrit pas** ; seul un clic sur elle l'écrit.
- **L'assistant de création** pose une question neuve après la configuration de la famille : « Une copie non recevable — Quand tu
  marques une copie non recevable (plagiat, IA non autorisée), que devient-elle dans la note ? », **sans réponse cochée d'avance**
  (on ne passe pas sans choisir). Un modèle adopté passe par la même question. Sautée en dénotation. Rouvrir une pratique dans
  l'assistant montre sa règle ; ré-enregistrer sans y toucher n'écrit rien de plus.
- **Les notes** suivent la règle, dans toutes les familles et partout où la note se calcule (profil, indice P, Comparateur,
  captures, export) :
  - « l'écarter » : la copie est traitée **exactement comme une copie non remise** (prouvé cas par cas contre la même copie retirée) ;
  - « lui mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards (portfolio et terminale).
    Retenue au portfolio, la copie montre partout son libellé et le 0 compté, **jamais sa note ni ses niveaux d'origine** (profil,
    bilan et PDF de l'élève) ;
  - une pratique sans règle écrite se lit comme avant (sommative 0, spécifications non satisfaisant, standards « l'écarter ») :
    **aucune donnée n'est réécrite**, ni pratique ni copie ;
  - **terminale des standards** : non remise ou écartée, la note reste provisoire pendant le trimestre ; une fois « Notes
    finalisées » cochée, elle vaut 0. Un brouillon de terminale, un « Incomplet » : provisoires, comme avant (question 3).
- **Le dépistage et les trajectoires** suivent la règle : écartée, la copie sort comme une non remise ; à 0, elle compte 0
  (avant, le dépistage lisait sa note calculée brute).
- **L'Aide**, carte « Copies non remises, non recevables… », paragraphe « Travail NON RECEVABLE » : réécrit (proposé, plus bas).
- **La complétion (C) n'a pas bougé** : une copie non recevable y reste non remise dans les deux cas (la session D y touche).

Captures Chromium (pas WebKit) : `plans de travail/captures-2026-11-09-copie-non-recevable-choix/` — la copie marquée,
les réglages, l'étape de l'assistant, à 1440 px et à la largeur de l'iPad (820 px).

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **Les textes proposés** (section suivante) : à corriger. La consigne voulait les mots validés avant l'écran ; le plan de la
   nuit m'a demandé de les poser pour que l'écran fonctionne, marqués « PROPOSÉS » dans le code. Chacun vit à un seul endroit.
   *Recommandation : les lire sur les captures, d'abord la ligne de la copie ; ne rien publier avant ton accord.*
2. **Ton exemple des standards ne correspond pas à « l'écarter »** (piège du minimum, mesuré, § « Le minimum »). Avec
   4 productions retenues, 3 faites (80, 75, 70) et la 4e plagiée : « l'écarter » donne **75** (la moyenne des trois, comme une
   copie non remise ; 70 ou 0 si la pratique plafonne sous le minimum) ; « lui mettre 0 » donne **56,25**, c'est-à-dire ton exemple
   « la 4e, plagiée, vaut 0 ». En « N meilleures », une copie à 0 n'entre que s'il manque des productions : c'est mot pour mot ta
   phrase du 8 nov. (« elle vaut 0 seulement si elle est nécessaire pour atteindre le nombre minimal »). *Recommandation : ne rien
   coder ; garder « l'écarter = une copie non remise » (ta décision 2), et choisir « lui mettre 0 » pour ta pratique standards si
   c'est cet effet que tu veux. Si le mot « lui mettre 0 » ne te va pas pour ce cas, c'est le texte à revoir, pas le calcul.*
3. **Une terminale en brouillon (ou « Incomplet ; travail en cours ») aux notes finales : 0, ou provisoire ?** Ta décision 4 dit
   « non remise OU écartée ». Je m'en suis tenu là : un brouillon, un incomplet ou une copie de portée nulle laissent la note
   provisoire, comme avant. Les obligatoires hybrides, elles, comptent déjà 0 en brouillon aux notes finales (#896). Le pack démo
   en porte deux cas (DEMO006 et DEMO020, terminales en brouillon). *Recommandation : provisoire (ce qui est codé) : un brouillon
   est une copie remise, pas encore jugée ; la mettre à 0 punirait le retard de l'enseignant·e.*
4. **Pack démo : un élève bouge sans geste.** **DEMO004** : note inchangée (64,92), mais RàI 2 → **1** : sa copie plagiée
   (Artefact 9, note 0) sort du dépistage (standards sans règle écrite = « l'écarter »), sa performance récente passe de 0,452 à
   0,697. *Recommandation : garder ; c'est l'effet voulu (le plagiat se lit dans la complétion, pas comme une performance de 0).
   Si tu préfères qu'un plagiat pèse au dépistage, c'est « lui mettre 0 » qu'il faut choisir pour la pratique démo.*
5. **Tes données réelles** (à mesurer sur le Mac) : combien de copies sont marquées non recevables en A2026, dans quelles
   pratiques ; si une pratique standards a « Notes finalisées » cochée avec une terminale non remise (elle passerait à 0) ; et si
   une terminale non recevable est déjà marquée (elle passerait de 0 à provisoire). *Recommandation : mesurer avant la fusion ;
   aucune note de sommative ou de spécifications ne peut bouger sans geste, seules les standards le peuvent, par la terminale.*
6. **Deux textes que ta décision 4 rend incomplets, non posés** :
   - l'Aide, carte « Travail NON REMIS » : ajouter « ; une terminale non remise aussi » à l'exemple « en standards hybride, une
     fois les notes finales cochées, une obligatoire non remise vaut 0 » ;
   - l'aide de « Notes finalisées » (réglages de la pratique) dit seulement qu'elle change le titre du PDF ; en standards, cocher
     la case met maintenant à 0 une terminale non remise ou écartée. *Proposition : « En standards, une terminale non remise ou
     écartée vaut alors 0. »*
7. **Le choix fait sur une copie vaut pour toutes les pratiques que le Comparateur simule** (supposition nommée : c'est une
   décision sur la copie, pas sur la pratique). *Recommandation : garder.*
8. **Dans le récit de calcul** (profil, Comparateur), une copie écartée n'apparaît plus, comme une copie non remise ; une terminale
   manquante aux notes finales s'y inscrit « comptée · poids 40 % » à 0. *Recommandation : garder pour la cohorte ; un mot neuf
   (« manquante, 0 ») si tu veux la nommer.*
9. **« Ajouter » depuis la bibliothèque, « Dupliquer » et l'import ne posent pas la question** : la pratique garde la règle de sa
   source, ou, sans règle, la lecture de sa famille. *Recommandation : suffisant ; la question se pose à la création.*

### Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : rien. Les specs et les captures sont sous Chromium (le cloud n'a pas WebKit). Le verdict WebKit et
  les captures WebKit se prennent sur le Mac. À rejouer en particulier : `copie-non-recevable-choix-1176.spec.js` et les trois
  specs de l'assistant retouchées (`audit-parcours-sommatif-2026-09-24`, `pratiques-898-…`, `pratiques-909-903-…`).
- **Les données réelles de Grégoire** : question 5.
- **La relecture croisée de Cowork** (règle 2 de `PROTOCOLE.md` : un format qui voyage, le champ `sortCopieNonRecevable` sur la
  copie et dans la pratique) : due au matin, avant le verdict.

## Les textes proposés, en attente de Grégoire

**1. La ligne sur la copie** (`TEXTES_SORT_COPIE_NON_RECEVABLE`, `js/evaluation-sauvegarde.js`). Titre : « Dans la note du cours : ».
Les deux choix, selon la famille et la place de la copie :

| Où | « l'écarter » | « lui mettre 0 » |
|---|---|---|
| Sommative | l'écarter, comme une copie non remise : elle n'entre pas dans la moyenne | lui mettre 0 : elle compte pour 0 dans la moyenne |
| Spécifications | l'écarter, comme un travail non remis | lui mettre 0 : elle compte comme un travail non satisfaisant |
| Standards, portfolio | l'écarter, comme une copie non remise : elle manque au portfolio | lui mettre 0 : elle entre au portfolio avec 0 |
| Standards sans « Artefact » | … elle manque aux productions retenues | … elle entre aux productions retenues avec 0 |
| Standards, obligatoire (hybride) | l'écarter, comme une obligatoire non remise : elle vaut 0 une fois les notes finales cochées | lui mettre 0 : elle compte pour 0 tout de suite |
| Standards, terminale | l'écarter, comme une terminale non remise : la note reste provisoire, puis la terminale vaut 0 une fois les notes finales cochées | lui mettre 0 : la terminale vaut 0 tout de suite |
| Sans pratique | l'écarter, comme une copie non remise | lui mettre 0 |

Dessous : « Règle de ta pratique : l'écarter. Ton choix ne vaut que pour cette copie. » (ou « lui mettre 0 »).

**L'avis « Travail non recevable »** du formulaire (validé le 28 oct.) : je propose d'en **retirer** la phrase « Dans la note du
cours, elle vaut ce que dit ta pratique : 0 en sommative, un travail non satisfaisant en spécifications, hors du portfolio en
standards. » Elle ne tient plus devant le choix affiché juste dessous. Le reste est mot pour mot. *Retrait posé, à confirmer.*

**2. La question à la création** (`js/wizard-pratique-v2.js`, étape `copie-non-recevable`) :
- titre « Une copie non recevable » ; sous-titre « Quand tu marques une copie non recevable (plagiat, IA non autorisée), que
  devient-elle dans la note ? » ;
- « L'écarter » — sommative : « Elle n'entre pas dans la moyenne, comme une copie non remise. » ; spécifications : « Elle compte
  comme un travail non remis. » ; standards : « Elle manque au portfolio, comme une copie non remise. Une terminale écartée laisse
  la note provisoire, puis vaut 0 une fois les notes finales cochées. » ;
- « Lui mettre 0 » — sommative : « Elle compte pour 0 dans la moyenne. » ; spécifications : « Elle compte comme un travail non
  satisfaisant. » ; standards : « Elle entre au portfolio avec 0 ; une terminale vaut 0. » ;
- l'encadré : « C'est ta règle. Quand tu marqueras une copie non recevable, elle apparaîtra déjà cochée, et tu pourras la changer
  pour cette copie-là. La règle elle-même se change dans les réglages de ta pratique. »

**Les réglages de la pratique** (`index.html`, carte des informations de la pratique) reprennent les mêmes mots : « Une copie non
recevable (plagiat, IA non autorisée), dans la note » ; « L'écarter, comme une copie non remise » ; « Lui mettre 0 » ; « Ta règle.
Quand tu marques une copie non recevable, elle apparaît déjà cochée ; tu peux la changer pour cette copie-là. »

**3. Le paragraphe « Travail NON RECEVABLE » de l'Aide** (`index.html`, `accordeon-aide-irrecevables` ; les quatre lignes par
famille du 15 oct. sont remplacées) :

> Une copie non recevable compte comme non remise dans la complétion (C) ; elle reste dans le total attendu. Dans la note, c'est
> toi qui choisis son sort. Ta pratique de notation porte ta règle ; quand tu marques une copie non recevable, ta règle apparaît
> déjà cochée sous le menu, et tu peux la changer pour cette copie-là.
> - « L'écarter » : elle est traitée comme une copie non remise. En sommative, elle n'entre pas dans la moyenne ; en
>   spécifications, elle compte comme un travail non remis ; en standards, elle manque au portfolio, avec ce que ta pratique fait
>   d'une copie manquante. Une terminale écartée laisse la note provisoire, puis vaut 0 une fois les notes finales cochées, comme
>   une terminale non remise ; en mode hybride, une obligatoire écartée aussi.
> - « Lui mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards, au portfolio comme à la
>   terminale.
> - En dénotation, ta note est ton jugement : la copie n'y entre pas par calcul.
>
> Une pratique créée avant ce choix, tant que tu ne choisis pas sa règle, lit : 0 en sommative, un travail non satisfaisant en
> spécifications, « L'écarter » en standards. Tu changes sa règle dans Conception → Pratiques. Une reprise remplace la copie non
> recevable, quel que soit son sort.

L'infobulle `eval-integrite` (« dans la note, son sort dépend de ta pratique ») tient encore : non touchée.

## Le détail

### Commits

```
git log --oneline 98c04bfc..lot/copie-non-recevable-choix
```
- `9ebe8763` feat(#1176) : le calcul, l'écran, l'Aide, les essais (et les jetons anti-cache de 15 fichiers) ;
- `c13ee690` test(#1176) : le verrou sommatif juge une copie écartée sous le seuil (mutant « note brute ») ;
- `ae2a9b0a` fix(#1176) : le choix de la copie vit sur l'écran, pas dans « l'évaluation en cours » ; la spec ; l'assistant ;
- `c28b97b5` docs(#1176) : premier jet de ce rapport, captures, les « Flux E » répondent à la question neuve ;
- `cedef6fb` fix(#1176) : ce que la relecture neuve a trouvé (§ Relecture) ;
- (le dernier : ce rapport complété.)

### Où vit la règle (choix techniques de Cowork, gardés)

- **Un seul lecteur, le registre** (`js/pratiques/pratique-registre.js`) : `sortCopieNonRecevableDeLaPratique(configuration,
  famille)` (la règle écrite, sinon la lecture de la famille), `valeurCopieNonRecevable(copie, règle)` (le choix de la copie, sinon
  la règle), `copieNonRecevableEcartee`, `noteRetenueParLeCalcul`, et `terminaleManquante` (décision 4). Aucune famille ne relit
  `statutIntegrite` (sentinelle).
- **Chaque famille nomme la règle de LA pratique qu'elle calcule** : la sommative et les spécifications configurables la passent
  à leur délégué ; les standards la lisent sur la configuration demandée (`calculerDetailsNoteFinale(da, pratiqueId)`) — le
  Comparateur simule d'autres pratiques que l'active (gardé par trois essais). Le dépistage, les trajectoires et le PDF lisent la
  pratique active.
- **Lecture au calcul, sans migration** : rien n'est écrit dans `pratiquesConfigurables` ni dans les copies tant que
  l'utilisateur ne choisit pas (essai « Le stock »). Le champ `sortCopieNonRecevable` voyage avec la copie et la pratique
  (codex, export, import : objets entiers) ; une reprise naît sans lui (`evaluation-jetons.js`).
- **Sur l'écran, le choix de la copie vit sur le bloc** (`data-choix-copie`), comme le statut dans son menu : l'application a deux
  « évaluation en cours » qui ne sont pas toujours le même objet (#699) ; la spec l'a montré.
- **Les niveaux d'une copie non recevable** restent hors des lectures dans les deux cas (#1228) ; gardée à 0 et retenue, elle
  montre son libellé et le 0 compté.

### Le minimum des standards (piège 1 de la consigne)

Mesuré avec un banc jetable (le banc de `copie-non-recevable-choix-1176`, N = 4, minimum 4, A1 80, A2 75, A3 70, A4 plagiée) :

| Plafonnement de la pratique | « l'écarter » | non remise (témoin) | « lui mettre 0 » |
|---|---|---|---|
| aucun | 75 | 75 | 56,25 |
| un manquant → 70 au plus | 70 | 70 | 56,25 |
| un manquant → échec | 0 | 0 | 56,25 |

Ce que fait le code d'une copie manquante sous le minimum : il fait la moyenne de ce qui est là, puis applique le plafonnement de
conformité si la pratique en porte un (`_appliquerPlafonnementConformite`). Il ne compte jamais la manquante pour 0. **Non
tranché** : c'est la question 2.

### La terminale des standards pendant le trimestre (piège 2)

Une terminale non recevable **écartée** (lecture des standards existantes) ne vaut plus 0 tout de suite : la note reste
provisoire jusqu'aux notes finales. C'est la seule note qui peut bouger sans geste dans une pratique existante. **Au pack démo :
aucun cas** (aucune terminale non recevable).

### Mesure du pack démo

Script jetable (`node`, Chromium, `activerModeDemo()` sur `origin/main` puis sur la branche à `cedef6fb` ; pour chaque élève :
note du profil, provisoire, terminale, P stocké, niveau RàI et son motif, performance du dépistage). Pratique active :
`demo-std-litt`, standards, « Notes finalisées » cochée, des deux côtés. Dix élèves ; **un seul change** :

```
DEMO004 profil 64,92 = ; P 65 = ; RàI 2 (persistante) → 1 (au-dessus-de-la-ligne) ; dépistage 0,452 → 0,697
```
Témoin : les neuf autres sortent identiques, champ par champ. Avant la relecture (`ae2a9b0a`), DEMO006 (77,43 → 46,46) et DEMO020
(84,53 → 50,72) bougeaient aussi : leurs terminales sont en brouillon, et le code les mettait à 0 aux notes finales. C'est la
trouvaille 2 de la relecture ; resserré à la décision 4 (question 3).

### Essais

- **Vitest** (depuis `tests/`) : 893 fichiers, 10 875 essais verts (§ Verdict).
- **`tests/unit/copie-non-recevable-choix-1176.test.js`** (43 cas) : chaque famille × chaque choix × chaque place, sur les
  modules réels (P stocké, Comparateur, captures, profil) ; chaque « l'écarter » comparé à la même copie retirée ; le minimum ; la
  terminale provisoire puis finale, le brouillon qui ne manque pas, et l'instance de repli ; l'obligatoire hybride ; la
  dénotation ; le Comparateur sur une pratique non active (SOM, STD, SPE) ; ce que les vues lisent (liste des retenues, bloc Note
  du PDF) ; le registre ; le dépistage ; les trajectoires ; le stock (aucune écriture).
- **Break-tests** (une mutation à la fois, fichier restauré) : 15 mutants du calcul, 15 rouges, plus un équivalent nommé (retirer
  le filtre du verrou sommatif ne change rien : `appliquerDoubleVerrou` ignore déjà une note absente ; l'essai a été durci pour la
  note brute). Après la relecture : 6 mutants de plus, 6 rouges (règle de l'active au Comparateur ×2, fuite de la note d'origine,
  brouillon de terminale à 0 ×2, obligatoire du PDF sans son 0).
- **`tests/unit/sentinelle-wizard-golden-creation-319.test.js`** (+5) : l'étape, rien de coché d'avance (lu au rendu réel), la
  réponse écrite à la création et au modèle adopté, rouvrir sans changer n'écrit rien, famille changée, dénotation rien. Cinq
  mutants, cinq rouges.
- **`tests/integration/copie-non-recevable-choix-1176.spec.js`** (3, **Chromium**) : le choix au marquage, coché selon la règle ;
  le geste enregistré, revenu après un rechargement ; sans geste rien d'écrit ; « Recevable » le retire ; les réglages de la
  pratique (un autre champ n'écrit pas la règle, le geste l'écrit, la copie la suit). Break-tests : sans le chargeur, rouge ; sans
  la garde « au geste seulement », rouge. Aucune pause fixe (cliquet des pauses).
- **Sentinelles mises à jour là où la décision change la valeur**, chaque fois avec la date et le motif dans l'essai :
  `sentinelle-copie-non-recevable-vaut-la-regle-28-oct` (terminale provisoire, puis 52 aux notes finales ; le « réglage simulé »
  devient le vrai), `sentinelle-construction-de-la-note-2026-10-28` (STD-6, STD-C3) et `…-correctifs-2026-10-28` (E7-b),
  `sentinelle-audit-aide-15-oct-…` (le code et l'Aide), `sentinelle-copie-non-recevable-affichage-28-oct` (l'avis),
  `sentinelle-note-provisoire-reservee` (deux exceptions « pratique alternative »), `sentinelle-wizard-golden-creation-319` (la
  porte « modèle » passe par la question : 4 étapes au lieu de 3), deux harnais (`…-935-…`, `…-spe-configurable-delegation-…`) ;
  quatre specs qui parcourent l'assistant répondent à la question neuve (« Flux E », audit sommatif, 898, 909).
- **Complexité** : aucune fonction figée ne monte, le compte au-dessus de 15 reste 437.

### Relecture par un agent neuf

Un sous-agent sans mon raisonnement, avec la consigne et le diff `98c04bfc..ae2a9b0a`, skill `verification-adverse`. **Verdict :
« à corriger »**. Ses neuf trouvailles, et leur sort :

1. *Sous « lui mettre 0 » en standards, la note et le niveau d'origine d'une copie plagiée sortaient jusqu'au bilan et au PDF de
   l'élève et au profil* (une couture que le lot ouvrait : avant, aucune copie non recevable n'entrait au pool). **Corrigé**
   (`cedef6fb`) : libellé et 0 compté, à la source (`_artefactRetenuVu`), au PDF (obligatoires), à la carte du profil. Essais.
2. *Le rapport disait « pas de terminale » pour DEMO006 et DEMO020 ; ce sont des brouillons, que le code mettait à 0 aux notes
   finales, au-delà de la décision 4.* **Corrigé** : resserré à « non remise ou écartée » (`terminaleManquante`) ; question 3.
3. *Trois specs de l'assistant rougissaient (étape neuve).* **Corrigé** : elles répondent à la question.
4. *L'essai « rien de coché d'avance » ne pouvait pas échouer* (`defaut` au lieu de `default`). **Corrigé**, mutant rouge.
5. *Aucun essai ne gardait le Comparateur sur une pratique non active.* **Corrigé** : trois essais, deux mutants rouges.
6. *Des textes non validés à l'écran ; une phrase de l'Aide fausse pour la terminale ; l'aide de « Notes finalisées » muette.*
   **Remonté** (questions 1 et 6) ; la phrase de l'Aide est corrigée.
7. *Forme `.config` (#712) : la configurable ne relisait que `.configuration`.* **Corrigé** (mon code : « le lot n'était pas fini »).
8. *Assistant rouvert, famille changée : la réponse montrée pouvait céder à la lecture de l'autre famille.* **Corrigé**, essai.
9. *Le récit écrit « comptée » pour une terminale manquante à 0 ; un commentaire périmé.* **Commenté** (question 8).

### Les specs Playwright des fichiers touchés, sous Chromium

Les 71 specs qui touchent la surface du lot (`grep -lE "statutIntegrite|wizard|Wizard|ouvrirReglagesPratique|chargerPratiquePourModif|
mat-notes-finales|calculerDetailsNoteFinale|determinerNiveauRai|trajectoire|non-recevable|plagiat" tests/integration/*.spec.js`),
plus la spec neuve, sous Chromium (configuration jetable hors dépôt ; WebKit absent). Les 40 fichiers où un premier passage avait
rougi ont été rejoués **à l'identique sur `main` (`98c04bfc`) et sur la branche (`cedef6fb`)** :

| | rouges | instables | verts |
|---|---|---|---|
| `main` | 5 | 2 | 232 |
| branche | 6 | 2 | 234 |

- **Rouges des deux côtés** (Chromium n'est pas la cible ; mise en page) : `barre-outils-compacte` ×2, `palette-retroaction-compacte`
  ×2.
- **`comptes-erreurs-stock-1142`** : instable des deux côtés (rejoué seul, deux fois : branche 24/24 avec la suivante ; `main`, un
  rouge sur 24). **`critere-algorithmique-calculs-4a`** : rouge sur `main`, vert sur la branche (instable).
- **`lot-a-anonymisation-enregistre`** : rouge au passage complet de la branche (la rétroaction sans « Bonjour Élève N ! »), vert
  rejoué seul deux fois. Instable ; rien dans le lot ne touche la génération de la rétroaction.
- **Ce que le lot avait cassé, et qui ne l'est plus** : les « Flux E » (3), l'audit sommatif, les adoptions 898 et 909, tous
  parcourant l'assistant sans répondre à la question neuve (premier passage). Verts au second.

Un premier passage a été faussé par ma faute : j'ai retiré du dépôt la configuration jetable pendant qu'il tournait, et chaque
essai relancé ensuite est tombé sur « Cannot find module ». Écarté ; c'est le second passage qui compte.

### Verdict

- **Vitest** (depuis `tests/`, à `791f08b5`, le code de `cedef6fb`) : **893 fichiers, 10 875 essais, tous verts**. Au départ
  (`98c04bfc`) : 892 fichiers, 10 825 essais.
- **Playwright** : sous Chromium seulement (ci-dessus). **Le verdict WebKit reste à prendre sur le Mac.**

### Trouvailles, et leur issue

1. **Deux « évaluation en cours »** (le nom nu de `config.js` et `window.evaluationEnCours`) : trouvé par la spec, sur mon
   propre code. Corrigé dans le lot (`ae2a9b0a`). Pas une trouvaille au sens des trois issues : c'était le lot qui n'était pas fini.
2. **Les cinq sites du dépistage que #1176 nomme dans les instances** (`_calculerIndicesTroisDerniersArtefacts`, `detecterDefis`,
   `identifierPattern`, `obtenirDonneesProfil` des familles) lisent encore la note brute, mais n'ont **aucun appelant vivant**
   (`git grep -n "\.detecterDefis(\|\.identifierPattern(\|\.obtenirDonneesProfil("` ne rend que des appels internes à ces mêmes
   instances ; la relecture le confirme). Issue 3 : sans conséquence observable.
3. **`_estActiveMoteur`** (`js/entites/reconciliation-evaluations.js`) tient une copie non recevable hors de la réconciliation des
   doublons, même gardée à 0. Issue 3 : commenté dans le code, sans effet sur la note.
4. **Le cliquet anti-cache** a refusé deux commits (jetons `?v=` à relever) : fait. À la fusion, les autres branches de la nuit
   auront relevé les mêmes jetons : conflits attendus dans `index.html`, à résoudre en prenant la lettre la plus haute.
5. **Sous Chromium, sur `main` comme sur la branche**, des specs de mise en page rougissent (§ specs) : Chromium n'est pas la
   cible. Issue 3 pour ce lot.

## À inscrire au BACKLOG

- **#1176 devient ce lot** (consigne du 8 nov.) ; #1226 y est lié (les trajectoires suivent la règle). **La terminale non remise à
  0 une fois les notes finales cochées s'inscrit dans #1176** (mon choix, la consigne me le laissait) : même décision, même code.
  Y noter que les cinq sites du dépistage des instances n'ont pas d'appelant (trouvaille 2).
- **Si Grégoire répond « 0 » à la question 3** (brouillon de terminale aux notes finales) : une ligne dans #1176, pas une fiche.
- Du rituel d'ouverture (audit de début de session, à `98c04bfc`) : sur GitHub, le verdict Playwright du push de la 1.237.2 est
  rouge par quatre specs ; deux sont déjà dans #1246 (`annotation-formes-fermees-polygone`, `palette-evaluation-compacte`), **deux
  n'apparaissent ni dans le BACKLOG ni dans le RELAIS** : `aide-cp-suit-la-case-1086.spec.js` et
  `tampons-masques-bibliotheque-1216.spec.js` (vertes sur le Mac). À inscrire dans #1246 ou à part, à la décision de la session du
  Mac. Hors de ce lot.
