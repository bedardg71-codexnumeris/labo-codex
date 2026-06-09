# Plan : refonte du guide PAN — pédagogie + cadre réglementaire (RREC)

**Date** : 29 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Spec finalisée
**Version cible** : Beta à déterminer

---

## 1. Vision et contexte

Le guide PAN spécifié dans `PLAN_guides_pedagogiques.md` §5 expose **pourquoi** une
pratique alternative de notation est pédagogiquement défendable (certifier la maîtrise
plutôt que moyenner le parcours, droit à l'erreur, jetons). Ce qui manque, c'est le
**cadre légal** : un enseignant du réseau collégial qui adopte une PAN doit savoir qu'il
reste dans les limites du *Règlement sur le régime des études collégiales* (RREC, C-29,
r. 4), et comprendre où l'application le cadre — et où sa propre responsabilité (et celle
de sa PIEA) prend le relais.

Cette refonte **réécrit les 4 pages** du guide PAN pour tisser le cadre réglementaire dans
le contenu pédagogique, plutôt que de l'ajouter en annexe. Le fil conducteur : *une PAN
n'est pas une entorse au règlement — elle en est une lecture exigeante, à condition de
respecter le point que le RREC verrouille (le seuil de 60 %) et la PIEA de ton collège.*

### Registre retenu — « cadre + responsabilité partagée »

Décision prise avec Grégoire le 29 mai 2026. Le guide **n'affirme jamais** que l'app
garantit la conformité. Il dit, avec exactitude :

- l'app **aligne par défaut** sur le seuil réglementaire (60 %) et **convertit** les
  niveaux en pourcentage, de sorte qu'une PAN produit toujours une note interprétable au
  regard de l'art. 27 ;
- la **conformité finale** relève de ta *Politique institutionnelle d'évaluation des
  apprentissages* (PIEA) et de la **note réellement transmise** au système de référence
  (Léa/Omnivox), pas du logiciel ;
- l'app **cadre et aide** ; elle ne **décide pas** à ta place et ne **certifie pas** ta
  conformité.

> **Pourquoi ce registre.** Le paramètre `seuilReussite` est configurable
> (`js/echelles.js:1138`). Un guide qui promettrait une conformité automatique serait
> factuellement faux et exposerait l'enseignant qui s'y fierait. Voir l'audit complet :
> `Rapports/AUDIT-CONFORMITE-RREC-C29r4.md`.

### Ce que cette refonte remplace

Cette spec **supersède** le contenu des 4 pages PAN de `PLAN_guides_pedagogiques.md` §5.2.
Conformément au principe de stabilité zéro-dette, le contenu de §5.2 doit être retiré (ou
remplacé par un renvoi vers ce fichier) au moment de l'intégration, pour éviter deux
sources de vérité divergentes. L'architecture (§2 du plan maître), la référence
académique (§5.1) et les points d'accès (§6.2) restent valides.

### Hors-périmètre

- Pas de modification de la logique de notation (pratiques, jetons, conversion en %).
- Pas de modification du seuil de 60 % ni du caractère configurable de `seuilReussite`.
- Pas de modification des zones protégées (`config.js`, `navigation.js`, `noms_stables.json`).
- Le guide **n'est pas** un avis juridique : il oriente vers la PIEA et la conseillère
  pédagogique pour les cas particuliers.

---

## 2. Références (page 1 du guide)

Deux sources, l'une pédagogique, l'autre réglementaire :

```html
<p class="guide-pedagogique-ref">
Talbert, R., &amp; Clark, D. (2023). <em>Grading for Growth: A Guide to Alternative
Grading Practices That Promote Authentic Learning and Student Engagement</em>. Routledge.
— Québec, <em>Règlement sur le régime des études collégiales</em> (RLRQ, chapitre C-29,
r. 4), art. 25 et 27.
</p>
```

> Note pour Claude Code : la citation Talbert/Clark a été complétée d'après la note de
> `PLAN_guides_pedagogiques.md` §5.1 (livre Stylus/Routledge 2023). Si Grégoire préfère la
> formulation d'origine (« Grand Valley State University »), la conserver.

---

## 3. Contenu des 4 pages (refonte)

À copier dans `GUIDES_PEDAGOGIQUES['pan-rrec'].pages` du module unifié.
`cssPrefix: 'guide-pan-rrec'`, `titre: 'Guide — Cadre réglementaire (RREC)'`.

> **Décision du 29 mai 2026** : ce guide et le guide des modalités
> (`PLAN_guide_PAN_pedagogique_CSE.md`) sont **deux guides distincts**, avec deux
> identifiants (`pan-rrec` ici, `pan` pour les modalités) et deux boutons « Guide » dans
> Conception → Pratiques de notation. Pas de fusion en un seul guide.

### Page 1 — Une PAN, et pourquoi le cadre légal compte d'emblée

```html
<p>Une <strong>pratique alternative de notation (PAN)</strong> s'interroge sur ce que la note finale d'un cours devrait représenter : la <em>moyenne du parcours</em> de l'étudiant, ou le <em>niveau de maîtrise qu'il a atteint à la fin</em> ?</p>

<p>La notation sommative traditionnelle additionne et moyenne toutes les notes depuis le début du trimestre. Une note faible obtenue au premier essai pèse autant qu'une note solide obtenue à la fin — même si l'étudiant a appris entre les deux. Une PAN propose plutôt de <strong>certifier la maîtrise démontrée</strong> : on retient les meilleures preuves de compétence, on autorise des reprises, on traite les premières évaluations comme formatives.</p>

<p>Au cégep, cette liberté pédagogique s'exerce <strong>à l'intérieur d'un cadre</strong> : le <em>Règlement sur le régime des études collégiales</em> (RREC). Bonne nouvelle — et c'est le fil de ce guide — ce cadre ne t'oblige pas à moyenner. Il verrouille un seul point qui te concerne directement : la note qui traduit l'<strong>atteinte minimale des objectifs d'un cours est de 60 %</strong> (art. 27). Tout le reste — comment tu y arrives, avec quelle échelle, avec ou sans reprises — relève de ton jugement et de la politique de ton collège.</p>

<p>Autrement dit : <strong>une PAN n'est pas une entorse au règlement, c'en est une lecture exigeante.</strong> Les pages suivantes précisent ce que le RREC exige (et n'exige pas), comment Labo Codex te cadre, et où ta responsabilité prend le relais.</p>

<p class="guide-pedagogique-ref">
Talbert, R., &amp; Clark, D. (2023). <em>Grading for Growth: A Guide to Alternative Grading Practices That Promote Authentic Learning and Student Engagement</em>. Routledge. — Québec, <em>Règlement sur le régime des études collégiales</em> (RLRQ, chapitre C-29, r. 4), art. 25 et 27.
</p>
```

### Page 2 — Ce que le RREC exige (et ce qu'il n'exige pas)

```html
<p>Le RREC s'adresse aux <strong>collèges et au ministre</strong>, pas aux logiciels ni directement aux pratiques individuelles. Pour un enseignant qui évalue, trois éléments seulement ont une portée concrète.</p>

<h4>Ce que le RREC exige</h4>
<ul>
    <li><strong>Un seuil de réussite à 60 %</strong> — « La note traduisant l'atteinte minimale des objectifs d'un cours est de 60 % » (art. 27). Peu importe ta pratique, la note finale versée au dossier doit faire de 60 % le seuil de réussite.</li>
    <li><strong>Une évaluation par cours</strong> — l'apprentissage est évalué pour chaque cours (art. 27). L'évaluation « pour l'ensemble du programme » (épreuve synthèse) est une responsabilité de ton collège, pas de ton cours individuel.</li>
    <li><strong>Le respect de la PIEA de ton collège</strong> — chaque collège adopte une <em>Politique institutionnelle d'évaluation des apprentissages</em> (art. 25). C'est <strong>elle</strong>, et non le RREC seul, qui encadre les détails : reprises permises ou non, pondérations planchers, modalités de l'incomplet, etc.</li>
</ul>

<h4>Ce que le RREC n'exige pas</h4>
<ul>
    <li>Il n'impose <strong>aucune méthode de calcul</strong> : ni moyenne pondérée, ni somme de points. Une note de portfolio ou de maîtrise est aussi recevable qu'une moyenne, tant que 60 % reste le seuil d'atteinte des objectifs.</li>
    <li>Il n'interdit <strong>ni les reprises, ni les portfolios, ni la sélection des meilleures preuves</strong>. Le règlement parle d'<em>atteinte des objectifs et des standards</em> — pas du chemin pour y arriver.</li>
</ul>

<div class="guide-pedagogique-astuce">C'est précisément parce que le RREC raisonne en <em>atteinte d'objectifs et de standards</em> — et non en méthode de calcul — qu'une PAN est compatible avec lui. Une PAN bien conçue mesure mieux l'atteinte réelle des objectifs qu'une moyenne tirée vers le bas par les premiers essais.</div>
```

### Page 3 — Comment Labo Codex te cadre (et où s'arrête son rôle)

```html
<p>Labo Codex t'aide à rester dans le cadre, par deux mécanismes — mais il ne se substitue ni à ton jugement ni à ta PIEA.</p>

<h4>Ce que l'app fait pour toi</h4>
<ul>
    <li><strong>Seuil de réussite à 60 % par défaut</strong> — la configuration d'échelle propose 60 % comme seuil de réussite, et le tableau de bord situe les étudiants par rapport à cette note de passage. L'app est donc alignée d'emblée sur l'art. 27.</li>
    <li><strong>Conversion des niveaux en pourcentage</strong> — quelle que soit l'échelle (IDME, spécifications, niveaux de maîtrise), l'app convertit le profil de l'étudiant en une note en pourcentage. Une PAN produit ainsi toujours une note interprétable au regard du seuil de 60 %, et transmissible au système de référence.</li>
</ul>

<h4>Où ta responsabilité prend le relais</h4>
<ul>
    <li><strong>Le seuil est configurable.</strong> Tu peux modifier le seuil de réussite dans la configuration d'échelle. L'app te laisse cette liberté — mais la <strong>note finale que tu transmets à Léa</strong> doit respecter le seuil de 60 % prévu par ta PIEA. L'app ne le vérifie pas à ta place.</li>
    <li><strong>L'app cadre, elle ne certifie pas.</strong> Elle calcule une note cohérente avec ta pratique ; elle ne déclare pas ta pratique « conforme ». La conformité se joue dans ta PIEA et dans la note versée au dossier officiel, pas dans le logiciel.</li>
</ul>

<div class="guide-pedagogique-astuce">En cas de doute sur ce que ta PIEA permet (reprises, pondérations, seuils), valide auprès de ta conseillère ou ton conseiller pédagogique avant d'arrêter ta pratique. Labo Codex est un outil de jugement professionnel <em>en amont</em> du dossier officiel — pas le dossier lui-même.</div>
```

### Page 4 — Choisir et appliquer une PAN conforme dans Labo Codex

```html
<h4>Choisir ta pratique</h4>
<p>Va dans <strong>Conception → Pratiques de notation</strong>. Tu peux y choisir ou configurer :</p>
<ul>
    <li><strong>PAN-Standards</strong> — niveaux de maîtrise (p. ex. IDME) convertis en note, selon plusieurs modes (comptage, moyenne pondérée, seuils critiques, holistique).</li>
    <li><strong>PAN-Spécifications</strong> — chaque travail est jugé conforme ou non ; la note suit le forfait atteint (p. ex. C = 60 %, B = 80 %, A = 100 %).</li>
    <li><strong>Sommative classique</strong> — moyenne pondérée, pour les contextes où c'est la pratique officielle ou pour faciliter la transition.</li>
</ul>

<h4>Reprises et jetons</h4>
<p>Le RREC <strong>n'interdit pas</strong> les reprises ; il ne les mentionne même pas. Leur encadrement relève de ta PIEA. Dans l'app, le système de jetons structure le droit à l'erreur (nombre fini de reprises, niveau non rétrogradable). Vérifie simplement que tes règles de reprise sont compatibles avec celles de ton collège.</p>

<h4>Le seuil de 60 %, toujours</h4>
<p>Quelle que soit la pratique retenue, garde en tête le point verrouillé par l'art. 27 : dans la note finale, <strong>60 % est le seuil d'atteinte minimale des objectifs</strong>. L'app t'y aide par défaut ; à toi de t'assurer que la note transmise le respecte.</p>

<h4>Évaluation par cours, pas par programme</h4>
<p>Labo Codex évalue au niveau du cours — ce que demande l'art. 27. L'évaluation « pour l'ensemble du programme » (épreuve synthèse, sanction, octroi des unités) appartient à ton collège et au ministère ; ce n'est pas le rôle de l'app, et c'est normal.</p>

<div class="guide-pedagogique-astuce">Retiens la répartition des rôles : <strong>l'app</strong> t'aide à produire une note cohérente avec ta pratique et alignée par défaut sur 60 % ; <strong>ta PIEA</strong> fixe ce qui est permis dans ton collège ; <strong>toi</strong> tu transmets la note finale en t'assurant qu'elle respecte ce cadre. Une PAN bien tenue n'enfreint pas le règlement — elle l'honore en certifiant la maîtrise réellement atteinte.</div>
```

---

## 4. Points d'accès

Depuis **Conception → Pratiques de notation** : un bouton « Cadre réglementaire », à côté
du bouton « Modalités » du guide compagnon. Optionnel : depuis **Réglages**, à côté d'une
préférence relative aux pratiques de notation.

Pattern HTML (identique aux autres guides) :

```html
<button class="ee-guide-btn" data-action="ouvrirGuidePedagogique" data-param="pan-rrec" title="Guide — Cadre réglementaire (RREC)">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Cadre réglementaire
</button>
```

---

## 5. Tests fonctionnels spécifiques

En plus des tests génériques du module unifié (`PLAN_guides_pedagogiques.md` §9) :

- **Exactitude réglementaire** : vérifier que la formulation de l'art. 27 citée dans le
  guide (« La note traduisant l'atteinte minimale des objectifs d'un cours est de 60 % »)
  correspond mot pour mot au texte officiel.
- **Registre** : relire les 4 pages pour confirmer qu'aucune phrase n'affirme que l'app
  « garantit » la conformité. Le verbe attendu est *aider*, *cadrer*, *aligner* — jamais
  *garantir* ni *certifier*.
- **Cohérence** : vérifier que le vocabulaire des pratiques (PAN-Standards,
  PAN-Spécifications, jetons) correspond à ce qui est réellement offert dans
  Conception → Pratiques de notation au moment de l'intégration.
- **Modes clair/sombre + accessibilité** : comme pour les autres guides.

---

## 6. Finalisation

- Retirer ou rediriger le contenu de `PLAN_guides_pedagogiques.md` §5.2 (zéro-dette).
- Numéro de beta : à demander avant le commit.
- Changelog (`js/changelog-data.js`) : si le module unifié est livré dans la même version,
  mentionner « Guide Pratiques de notation : intègre le cadre réglementaire (RREC) ».

---

**Fin du plan**

*Compagnon de l'audit `Rapports/AUDIT-CONFORMITE-RREC-C29r4.md` (29 mai 2026) et du plan
maître `Plan Accompagnement/PLAN_guides_pedagogiques.md`. Ce fichier remplace le contenu
des pages PAN de §5.2 du plan maître ; l'infrastructure (§2), la référence (§5.1) et les
points d'accès (§6.2) restent en vigueur.*
