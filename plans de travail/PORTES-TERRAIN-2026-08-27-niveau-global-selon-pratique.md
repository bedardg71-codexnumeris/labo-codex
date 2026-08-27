# PORTES TERRAIN — le niveau global vient de ta pratique (27 août 2026, 1.102.0)

> Jumeau interactif : `portes-terrain-2026-08-27-niveau-global-selon-pratique.html`
> (même dossier), publié comme artefact.
>
> **3 vérifications, 4 décisions.** La liste est courte parce que les deux règles
> de tête du skill l'exigent : aucune porte si une machine peut répondre, et pas
> de préalable si un raté n'est pas irréversible. **Rien de ce qui a été livré
> aujourd'hui n'écrit dans tes données** — d'où l'absence de §1.

---

## Ce qui a changé, en une phrase

La ligne **« Performance globale (P) »** du profil d'un élève affichait un niveau
IDME calculé par une formule écrite dans le code : `85 → E`, `75 → M`, `65 → D`,
sinon `I`. Ce sont **tes bornes**, recopiées il y a des mois. Elles s'appliquaient
à tout le monde, y compris sous une pratique sommative.

Désormais c'est **ta pratique de notation** qui dit dans quoi sa note se lit :

| Ta pratique | Ce que la ligne affiche |
|---|---|
| par niveaux (PAN-Standards, configurable) | le code du niveau atteint, tiré de **ton** échelle, puis le pourcentage |
| sommative | le pourcentage seul — une note pondérée n'est pas un niveau atteint |

---

## ⚠ LE TRAVAIL EST À MOITIÉ FAIT — MAIS CHEZ TOI, ÇA NE SE VOIT PAS

Dans la même carte, **deux lignes ne suivent pas encore la même règle** :

- **« Performance globale (P) »** — corrigée le 27 août, lit ton échelle ;
- **« Progression par critère »**, juste en dessous — **pas encore corrigée**,
  calcule toujours ses niveaux avec la formule écrite dans le code.

⮕ **Vérifié le 27 août sur Benjamin A. : les deux coïncident.** C'est normal —
les bornes recopiées dans le code sont exactement les tiennes (`D` 65-74, `I` sous
65). Les deux chemins rendent donc le même verdict.

⮕ C'est la meilleure justification du chantier, et aussi son piège : **on ne peut
pas valider ce correctif sur tes données**, puisque l'ancien et le nouveau y
donnent la même chose. L'écart n'apparaîtrait que chez quelqu'un qui note en
A/B/C/D.

---

## §0 · Préalable

**P.1 — `git pull`, puis vérifier le numéro en bas de page.**

⮕ Attendu : **1.102.0 · build 0827-0556**.

> **Pourquoi c'est en tête.** Tu lances l'application depuis ton clone, en
> `file://` : elle est à la version de ton dernier `git pull`, pas à celle de
> `main`. Sans ce geste, tout ce qui suit décrit l'état d'AVANT — et un faux
> rouge de ce type est indétectable au récit, parce qu'il ressemble exactement à
> ce que la porte cherche.

---

## §2 · Ce que tu vérifies à l'écran

### 2.1 — La ligne « Performance globale » d'un élève réel — **avec mesure**

> ✅ **CETTE PORTE A DÉJÀ SERVI, le 27 août à 07 h 48.** Elle a attrapé un défaut
> qu'aucun test ne pouvait voir : le niveau ne s'affichait PAS. Un élève avait dix
> évaluations dont une désignant une échelle disparue du trimestre ; le code
> comptait cette absence comme *une deuxième échelle*, concluait « je ne choisis
> pas », et n'affichait plus rien. Or cette évaluation est déjà écartée du calcul —
> le pourcentage est calculé sur les neuf autres, et le bandeau au-dessus le dit.
> **Corrigé et poussé le matin même** (`35ca5d72`). La rangée sert maintenant à
> confirmer sur d'autres élèves.

**Le geste** : ouvre le profil d'un élève qui a au moins une évaluation →
section **Accompagnement** → première ligne, « Performance globale (P) ».

⮕ **Attendu** : le pourcentage s'affiche, et devant lui un code de niveau **si**
ta pratique travaille par niveaux. Relevé le 27 août sur Benjamin A. :
**`D 72 %`**. Un élève dont TOUTES les évaluations pointent vers une échelle
disparue n'aura toujours pas de code — c'est voulu, et le bandeau « Dépistage
incomplet » l'explique.

📋 **À noter** : le texte exact de la ligne (par ex. `M 78 %` ou `78 %`).

`[ ]` passé · `[ ]` échec

---

### 2.2 — Le survol du code de niveau — **avec mesure**

> **Pourquoi.** L'interprétation SOLO est volontairement au survol et non en
> vedette : tu ne mets pas une taxonomie devant un enseignant qui ne l'emploie
> pas. Reste à vérifier qu'elle est bien là, et qu'elle dit quelque chose
> d'utile.

**Le geste** : passe la souris sur le code de niveau (Mac, pas iPad).

⮕ **Attendu** : une infobulle. Si tu as étiqueté ton échelle en SOLO, elle donne
le nom du niveau SOLO et sa description. Sinon, elle donne **le nom du niveau que
tu as écrit toi-même**, et dit que l'interprétation SOLO n'est pas configurée.

📋 **À noter** : ce que dit l'infobulle.

`[ ]` passé · `[ ]` échec

---

### 2.3 — Sous ta pratique sommative — **si tu en as un groupe**

> **Pourquoi.** C'est le changement le plus visible : le niveau disparaît. Tu dois
> le voir avant de décider si c'est ce que tu veux (décision D2).

**Le geste** : bascule sur un groupe-cours en pratique **sommative**, rouvre le
profil d'un élève, regarde la même ligne. Survole le pourcentage.

⮕ **Attendu** : le pourcentage seul, sans code de niveau. Au survol du
pourcentage, une phrase qui explique que la sommative n'établit pas de niveau.

`[ ]` passé · `[ ]` échec · `[ ]` sans objet (aucun groupe en sommative)

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Ce sont des choix posés faute de pouvoir les
trancher à ta place. Une décision sans verdict écrit est une décision perdue.

### D1 — Sur iPad, le survol n'existe pas

L'interprétation SOLO vit dans une infobulle au survol. **Sur ton iPad, il n'y a
pas de survol** : elle y est donc inaccessible. Trois voies possibles — l'afficher
en permanence sous le niveau (au prix de charger l'écran), la mettre derrière un
appui long, ou l'accepter comme un confort réservé au Mac.

**Ton verdict :** `________________________________`

### D2 — Le niveau disparaît sous sommative : est-ce ce que tu veux voir ?

La décision de ce matin dit qu'une note pondérée n'est pas un niveau atteint, donc
la sommative n'en affiche plus. C'est cohérent — mais c'est toi qui regardes cet
écran tous les jours.

**Ton verdict :** `________________________________`

### D3 — Étiqueter ton échelle en SOLO, maintenant ou pas ?

Aucune de tes échelles ne porte d'étiquette SOLO : le champ existe depuis hier,
il naît vide. Tant qu'il l'est, le dépistage affiche **le nom de tes niveaux**, ce
qui fonctionne. L'étiqueter (cinq menus dans l'éditeur d'échelles, deux minutes)
lui donnerait en plus l'interprétation.

**Ton verdict :** `________________________________`

---

### D4 — Trois formulations SOLO se disputent le même niveau : laquelle garder ?

Ta capture du 27 août a révélé un jeu de descriptions que **trois relectures du
code avaient manqué**. La carte « Observation de la structure » dit *« À ce niveau
multistructurel, l'étudiant·e peut se concentrer sur plusieurs points pertinents à
la fois. Cependant, il/elle les considère indépendamment. »* Ailleurs, le même
niveau est décrit par *« Plusieurs aspects sans vision d'ensemble »*, et ailleurs
encore par *« Points pertinents identifiés, liens à consolider »*. Le chantier doit
n'en garder **qu'une**. Les longues sont plus riches, les courtes tiennent dans une
infobulle.

**Ton verdict :** `________________________________`

---

## §4 · Ce que je n'ai pas pu vérifier

### Ce que cette porte a déjà attrapé — 27 août, matin

- **Le niveau ne s'affichait pas du tout** (voir 2.1). Reproduit, corrigé, poussé.
  **Aucun test n'aurait pu le trouver** — il fallait tes données.
- **Un sixième site de descriptions SOLO écrites dans le code**, dans la carte
  « Observation de la structure ». Trois balayages l'avaient manqué : ces textes ne
  contiennent aucun des motifs cherchés. C'est l'écran qui l'a montré. ⮕ Devenu **D4**.
- **Sans grille de référence, le dépistage disait « aucune force ni défi
  identifié »** — un verdict rassurant, alors qu'il voulait dire « je n'ai aucun
  critère à quoi comparer ». Inscrit en **#550**.

- **Ton corpus réel.** Tout a été éprouvé sur une échelle fabriquée (W/X/Y/Z) et
  un élève fictif. L'échelle orpheline découverte hier soir rappelle que tes
  données réservent des surprises que les fixtures n'ont pas.
- **L'iPad.** Les specs tournent en WebKit, donc proches de Safari — mais le
  **tactile** n'est pas éprouvé, et c'est précisément ce que D1 met en jeu.
- **Le pas 3c est à moitié fait**, et ça se voit à l'écran (voir l'encadré en
  tête). Restent : le niveau par critère, `interpreterScoreIDME` et ses quatre
  descriptions, les bornes `0.85` de « Maîtrisé et étendu », et
  `interpreterPerformance` avec ses quatre seuils.

### Mes erreurs de cette session, y compris rattrapées

- **Ma première spec était décorative.** Elle croyait tester la pratique
  sommative ; son montage écrivait dans `modalitesEvaluation` alors que la source
  de vérité est `groupesCours[].pratiqueId`. Les deux cas rendaient donc la même
  chose : le test « sommative » exerçait le chemin « standards » sous un autre
  nom. Il était vert. Une garde a été ajoutée — chaque test vérifie désormais
  qu'il a bien établi la configuration qu'il croit exercer.
- **Mon échelle de test collisionnait avec IDME.** A/B/C/D : son « D » est aussi
  le « D » d'IDME, et le test rougissait sur son propre fixture en croyant
  attraper un défaut. Remplacée par W/X/Y/Z.
- **J'ai posé la question de l'échelle à l'envers.** Je la cherchais du côté des
  évaluations ; c'est la pratique qui établit la note globale. Ta correction a
  déplacé tout le pas.
- **Un message de commit est parti amputé** (`f5a8e020`) : j'avais omis la
  protection qui empêche le terminal d'interpréter les accents graves, et deux
  précisions ont sauté. Le dépôt ne réécrit pas un commit poussé — il reste tel
  quel.
- **Mon script d'anti-cache a échoué en silence**, et j'ai commité en croyant
  l'URL du fichier corrigé mise à jour. Ton navigateur t'aurait rendu l'ANCIEN
  fichier : tu aurais testé un correctif que tu n'avais pas. Rattrapé avant que tu
  recharges, et versé à #547 — la sentinelle ne vérifie le `?v=` qu'une fois par
  cycle de release, donc elle est aveugle au deuxième changement d'un même fichier.
- **En mettant CET artefact à jour, j'ai cassé son tableau de décisions** (une
  virgule manquante) : la page s'ouvrait vide. Attrapé par la vérification au
  navigateur que le modèle impose avant publication — sans elle, je te livrais une
  page morte.
