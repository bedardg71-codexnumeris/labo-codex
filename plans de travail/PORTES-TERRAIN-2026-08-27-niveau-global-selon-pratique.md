# PORTES TERRAIN — le niveau global vient de ta pratique (27 août 2026, 1.102.0)

> Jumeau interactif : `portes-terrain-2026-08-27-niveau-global-selon-pratique.html`
> (même dossier), publié comme artefact.
>
> **3 vérifications, 3 décisions.** La liste est courte parce que les deux règles
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

## ⚠ UNE INCOHÉRENCE TEMPORAIRE, ET IL FAUT LA CONNAÎTRE AVANT DE REGARDER

Dans la même carte, **deux lignes ne suivent pas encore la même règle** :

- **« Performance globale (P) »** — corrigée aujourd'hui, lit ton échelle ;
- **« Progression par critère »**, juste en dessous — **pas encore corrigée**,
  calcule toujours ses niveaux avec la formule en dur.

⮕ Si ton échelle n'est pas IDME, tu peux donc voir **deux codes différents pour
le même élève** : le global venu de ton échelle, les critères venus du code. Ce
n'est pas un bug à signaler, c'est le travail à moitié fait — le reste est le pas
3c, et il est inscrit.

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

> **Pourquoi.** Le dépistage a déjà été muet sans le dire : jusqu'au 26 août, il
> affichait « Stable » pour un élève en difficulté sur tous ses critères quand il
> n'arrivait pas à convertir ses évaluations. Le changement d'aujourd'hui touche
> exactement cette ligne. S'il ne trouve rien dans tes données, le niveau
> disparaîtra — et il faut le savoir tout de suite.

**Le geste** : ouvre le profil d'un élève qui a au moins une évaluation →
section **Accompagnement** → première ligne, « Performance globale (P) ».

⮕ **Attendu** : le pourcentage s'affiche, et devant lui un code de niveau **si**
ta pratique travaille par niveaux.

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

## §4 · Ce que je n'ai pas pu vérifier

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
