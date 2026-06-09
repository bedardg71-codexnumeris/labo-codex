# Révision du contenu — Guides SOLO, ACP et RàI

**Date** : 4 juin 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Statut** : Contenu révisé soumis à validation
**Base** : `PLAN_taxonomie_SOLO.md` §4.4, `PLAN_guide_RaI.md` §2, `PLAN_uniformisation_Accompagnement.md` §5.2 (tous du 23 mai 2026)

---

## Décisions de périmètre (4 juin 2026)

- **3 guides seulement** dans ce chantier : SOLO, ACP, RàI. Les guides PAN (specs du 29 mai : `pan-rrec` + `pan`) et Enseignement explicite suivront dans un chantier ultérieur, dans le même module unifié.
- **Page 5 du guide SOLO réécrite** : le chantier 3 (association `niveauSOLO` dans l'éditeur d'échelle) n'a pas été implémenté ; le guide décrit l'app telle qu'elle est.
- Architecture technique : inchangée par rapport à `PLAN_guides_pedagogiques.md` §2 (module `js/guides-pedagogiques.js`, panneau unique, styles `guide-pedagogique-*`).

## Corrections apportées au contenu du 23 mai

| # | Correction | Guides touchés | Justification (vérifiée dans le code) |
|---|---|---|---|
| 1 | « élève » → « étudiant·e / étudiant·es » | RàI surtout, SOLO, ACP | Convention de la refonte des textes (159 occurrences de « étudiant·e » dans `index.html`) |
| 2 | Seuil « entre 65 % et 74 % » → « entre 64 % et 74 % » | SOLO p.3, RàI p.2 | `interpretation-config.js:38-40` : <64 / 64-74 / 75-84 / ≥85 |
| 3 | Chemins pictogrammes → `autocollants/solo/comprehension-*.svg` | SOLO p.2-5 | `travaux-outils.js:304-307` |
| 4 | Page 5 SOLO réécrite sans mention de l'éditeur d'échelle | SOLO p.5 | Fonctionnalité absente de `echelles.js` |
| 5 | « PAN-Maîtrise, sommative classique » → « PAN – Standards, Sommative, ou pratique personnalisée » | ACP p.2 | Décision du 29 mai (code canonique `STD`) ; libellés réels dans `donnees-v2.js:1232-1236` |
| 6 | « 0 (Non recevable) » confirmé comme libellé canonique | SOLO p.2 | `evaluation-calcul.js:127` |
| 7 | Libellés de navigation vérifiés : « Profils individuels », « Saisie des présences », « Grilles de critères », « Pratiques de notation » | RàI p.4, ACP p.2 | `config.js` |

Le reste du contenu du 23 mai est conservé tel quel (les classes `badge-pattern-*` du guide RàI existent dans `styles.css`, la description de l'indice P correspond au calcul réel de `indices.js`).

---

# Guide SOLO (5 pages)

## Page 1 — Qu'est-ce que SOLO ?

```html
<p>La <strong>taxonomie SOLO</strong> (Structure of Observed Learning Outcomes) est un cadre développé par Biggs et Collis en 1982 pour décrire la qualité de l'apprentissage observable dans les productions étudiantes.</p>

<p>Plutôt que de mesurer la quantité d'informations restituées, SOLO décrit la <strong>structure cognitive</strong> d'une réponse : à quel point l'étudiant·e relie les éléments entre eux et les intègre dans une compréhension cohérente.</p>

<p>Cinq niveaux progressifs sont distingués :</p>
<ul>
    <li><strong>Préstructurel</strong> — aucune information pertinente</li>
    <li><strong>Unistructurel</strong> — un seul élément identifié</li>
    <li><strong>Multistructurel</strong> — plusieurs éléments juxtaposés mais non reliés</li>
    <li><strong>Relationnel</strong> — éléments intégrés en une structure cohérente</li>
    <li><strong>Abstrait étendu</strong> — la structure est transférée à d'autres contextes</li>
</ul>

<p>Dans Labo Codex, SOLO sert de fondement à l'échelle de performance IDME (Insuffisant, Développement, Maîtrisé, Étendu) et à l'observation des productions étudiantes via les tampons de la catégorie Compréhension.</p>

<p class="guide-pedagogique-ref">
Biggs, J. B., &amp; Collis, K. F. (1982). <em>Evaluating the Quality of Learning: The SOLO Taxonomy (Structure of the Observed Learning Outcome)</em>. Academic Press.
</p>
```

## Page 2 — Préstructurel et Unistructurel

```html
<p>Les deux niveaux les plus bas correspondent à un apprentissage fragmentaire ou absent.</p>

<h4>Préstructurel</h4>
<p>L'étudiant·e ne fournit aucune information pertinente, ou des informations sans lien avec la question posée. Code IDME : <strong>0</strong> (Non recevable).</p>

<h4>Unistructurel <img src="autocollants/solo/comprehension-uni.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e identifie un seul élément pertinent, sans le mettre en relation avec d'autres. La réponse est correcte mais incomplète ou superficielle. Code IDME : <strong>I</strong> (Insuffisant).</p>

<p><em>Exemple : à la question « Quelles sont les causes de la Révolution française ? », l'étudiant·e mentionne seulement « la pauvreté » sans détailler ni relier à d'autres facteurs.</em></p>

<div class="guide-pedagogique-astuce">Pédagogiquement, ce niveau signale une compréhension de surface — un point de départ, pas une fin. L'intervention vise à enrichir les éléments identifiés et à inviter l'étudiant·e à en chercher d'autres.</div>
```

## Page 3 — Multistructurel

```html
<h4>Multistructurel <img src="autocollants/solo/comprehension-multi.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e identifie plusieurs éléments pertinents, mais ils restent juxtaposés sans relation explicite entre eux. La réponse est riche mais fragmentée. Code IDME : <strong>D</strong> (En Développement).</p>

<p><em>Exemple : pour la même question, l'étudiant·e énumère « la pauvreté, les inégalités sociales, les idées des Lumières et la crise financière » sans expliquer comment ces facteurs interagissent.</em></p>

<div class="guide-pedagogique-astuce">C'est la <strong>zone critique de consolidation</strong>. L'étudiant·e a les éléments mais pas encore la structure. L'intervention pédagogique vise à amener à <em>relier</em> : « Comment ces facteurs s'influencent-ils les uns les autres ? »</div>

<p>Dans l'évaluation IDME, ce niveau correspond à un seuil situé entre 64 % et 74 % : la performance est en développement, pas encore aboutie.</p>
```

## Page 4 — Relationnel et Abstrait étendu

```html
<h4>Relationnel <img src="autocollants/solo/comprehension-relationnel.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e intègre les éléments en une structure cohérente. Il ou elle établit explicitement des relations entre les composantes. La réponse a une logique interne identifiable. Code IDME : <strong>M</strong> (Maîtrisé).</p>

<p><em>Exemple : « Les idées des Lumières ont alimenté la conscience des inégalités, que la crise financière a rendues insupportables aux yeux d'une population déjà appauvrie. »</em></p>

<h4>Abstrait étendu <img src="autocollants/solo/comprehension-etendu.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e non seulement intègre la structure, mais l'extrapole : comparaisons avec d'autres contextes, formulation de principes généraux, application de la structure à des situations nouvelles. Code IDME : <strong>E</strong> (Étendu).</p>

<p><em>Exemple : « Les conditions qui ont conduit à la Révolution française se retrouvent partiellement dans d'autres révolutions, comme le Printemps arabe — une crise économique combinée à une conscience des inégalités amplifiée par la circulation des idées. »</em></p>

<div class="guide-pedagogique-astuce">L'écart entre Relationnel et Abstrait étendu marque un saut qualitatif : passer de comprendre <em>ce cas-ci</em> à comprendre <em>cette classe de cas</em>.</div>
```

## Page 5 — SOLO en pratique *(réécrite)*

```html
<h4>Avec les tampons de la palette d'annotation</h4>
<p>Quatre tampons SOLO sont disponibles dans la catégorie « Compréhension » de la palette (visible seulement quand la taxonomie SOLO est activée dans les réglages) :</p>
<ul class="guide-pedagogique-tampons-liste">
    <li><img src="autocollants/solo/comprehension-uni.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Unistructurel</strong> — pour les passages où l'étudiant·e identifie un seul élément</li>
    <li><img src="autocollants/solo/comprehension-multi.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Multistructurel</strong> — pour les passages où plusieurs éléments sont juxtaposés</li>
    <li><img src="autocollants/solo/comprehension-relationnel.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Relationnel</strong> — pour les passages qui établissent des relations</li>
    <li><img src="autocollants/solo/comprehension-etendu.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Étendu</strong> — pour les passages qui transfèrent à d'autres contextes</li>
</ul>

<h4>Avec l'échelle de performance IDME</h4>
<p>L'échelle IDME de Labo Codex est construite sur SOLO : chaque code correspond à un niveau cognitif. <strong>0</strong> (Non recevable) ↔ Préstructurel, <strong>I</strong> ↔ Unistructurel, <strong>D</strong> ↔ Multistructurel, <strong>M</strong> ↔ Relationnel, <strong>E</strong> ↔ Abstrait étendu. Quand tu situes une production sur l'échelle, tu poses en fait un jugement sur la structure cognitive observable de la réponse.</p>

<h4>Pour la rétroaction étudiante</h4>
<p>Identifier le niveau SOLO d'une production aide à formuler une rétroaction <em>structurelle</em> plutôt que purement quantitative. Au lieu de « il manque des éléments », tu peux dire « tes éléments sont identifiés (Multistructurel), maintenant cherche à les relier (Relationnel) ». L'étudiant·e comprend ce qu'il faut faire pour progresser, pas seulement que ce n'est pas assez.</p>

<div class="guide-pedagogique-astuce">Conseil pratique : commence par identifier le niveau dominant de la production, puis cherche les passages qui s'écartent (en mieux ou en moins bien). Les tampons servent à signaler ces passages dans le texte étudiant.</div>
```

---

# Guide ACP (3 pages)

## Page 1 — Qu'est-ce qu'ACP ?

```html
<p><strong>ACP</strong> est l'acronyme de trois indices descriptifs qui mesurent l'engagement et la performance d'un·e étudiant·e dans le cours :</p>

<ul>
    <li><strong>A</strong> — <strong>Assiduité</strong> : la proportion des périodes du trimestre auxquelles l'étudiant·e a été présent·e.</li>
    <li><strong>C</strong> — <strong>Complétion</strong> : la proportion des productions attendues qui ont été remises.</li>
    <li><strong>P</strong> — <strong>Performance</strong> : la note pondérée obtenue selon la pratique de notation choisie.</li>
</ul>

<p>Ces trois indices, pris ensemble, fournissent un portrait rapide de la situation de chaque étudiant·e. Ils sont calculés automatiquement à partir des présences saisies et des productions évaluées – aucune saisie supplémentaire requise.</p>

<p>Dans Labo Codex, ACP est utilisé dans plusieurs zones :</p>
<ul>
    <li>Section « Engagement ACP » du profil individuel</li>
    <li>Section « Progression temporelle ACP » du profil (si Graphiques d'évolution activé)</li>
    <li>Vue d'ensemble du tableau de bord (Aperçu)</li>
</ul>

<div class="guide-pedagogique-astuce">ACP est un cadre de lecture interne à Labo Codex, sans référence académique externe. C'est un outil de bord pour l'enseignant·e, pas un instrument de mesure standardisé.</div>
```

## Page 2 — Les trois indices en détail

```html
<h4>A — Assiduité</h4>
<p>L'indice A se calcule à partir des présences enregistrées dans le module Suivi → Saisie des présences. Une présence enregistrée pour une période compte ; une absence (justifiée ou non) ne compte pas.</p>
<p>L'unité d'affichage peut être configurée dans les réglages : périodes (par défaut), heures, ou les deux.</p>

<h4>C — Complétion</h4>
<p>L'indice C se calcule à partir des productions attendues dans le trimestre. Une production est « complétée » dès qu'elle est remise, indépendamment de la note obtenue. Les productions à venir ne pénalisent pas C tant que leur date d'échéance n'est pas passée.</p>
<p>Calcul : <code>C = productions remises / productions attendues échues</code></p>

<h4>P — Performance</h4>
<p>L'indice P est la note pondérée de l'étudiant·e selon la pratique de notation active (PAN – Standards, Sommative, ou une pratique personnalisée). Il ne représente <em>pas</em> la note finale du trimestre, mais une projection courante basée sur les productions déjà évaluées.</p>

<div class="guide-pedagogique-astuce">Les trois indices sont indépendants. Un·e étudiant·e peut avoir A élevé (toujours présent·e) mais C faible (ne remet pas ses travaux), ou C élevé (remet tout) mais P faible (résultats faibles). Lire les trois ensemble donne un portrait riche que la seule note ne donne pas.</div>
```

## Page 3 — Utiliser ACP en classe

```html
<p>ACP éclaire trois types de situations courantes :</p>

<h4>Repérer les étudiant·es qui décrochent</h4>
<p>Quand A et C baissent ensemble sur quelques semaines, c'est un signal de désengagement précoce, souvent avant que P ne se dégrade. Intervention recommandée : prise de contact, conversation sur les obstacles.</p>

<h4>Distinguer effort et résultat</h4>
<p>Un·e étudiant·e avec C élevé et P faible fait l'effort mais ne maîtrise pas. L'intervention vise les compétences (revoir la grille de dépistage, identifier les critères en défi).</p>
<p>Un·e étudiant·e avec C faible et P moyen ou élevé sur ce qui est remis a peut-être un problème de planification ou de motivation, pas de compréhension. L'intervention vise l'organisation et l'engagement.</p>

<h4>Identifier les patterns de classe</h4>
<p>Si A de la classe baisse sur une période, c'est probablement un signal contextuel (semaine de partiels ailleurs, météo, etc.) – pas un problème individuel à intensifier. Si C baisse sur une production particulière, c'est peut-être que sa consigne ou son échéance est mal calibrée.</p>

<div class="guide-pedagogique-astuce">ACP est un cadre simple, pas un diagnostic. Croisé avec les patterns RàI (si activés) et les niveaux SOLO (si activés), il devient un outil de jugement professionnel riche – à manier avec discernement.</div>
```

---

# Guide RàI (4 pages)

## Page 1 — Qu'est-ce que la RàI ?

```html
<p>La <strong>Réponse à l'Intervention (RàI)</strong> est un modèle d'organisation pédagogique qui combine dépistage continu, interventions ajustées et données pour soutenir l'apprentissage de l'ensemble des étudiant·es.</p>

<p>Dans Labo Codex, la RàI est <strong>une inspiration, pas un cadre normatif</strong>. Le modèle original (Fuchs, Fuchs &amp; Malone, 2017 ; Desrochers 2021) a été développé pour le primaire et le secondaire, dans des contextes où des équipes d'intervenants travaillent ensemble. L'app adapte ce modèle au cégep, où l'enseignant·e est souvent seul·e intervenant·e et où les compétences visées sont d'un autre ordre (analyse, argumentation, transfert, plutôt que décodage ou fluence).</p>

<p>Quatre principes directeurs guident l'implémentation :</p>
<ul>
    <li><strong>Le dépistage est un portrait</strong>, pas un diagnostic. Il sert à mieux intervenir, non à catégoriser.</li>
    <li><strong>L'intensification est un continuum</strong> ajustable, pas une suite de cases.</li>
    <li><strong>Les données servent les décisions</strong>, pas l'inverse.</li>
    <li><strong>L'individualisation se fonde sur les données</strong> – le cycle <em>enseigner, évaluer, ajuster, réévaluer</em>.</li>
</ul>

<p>L'app fournit les données et les éclairages. Tu prends les décisions. Labo Codex ne prescrit jamais une intervention — il éclaire ton jugement professionnel.</p>

<p class="guide-pedagogique-ref">
Desrochers, A. (dir.) (2021). <em>L'approche de la réponse à l'intervention et l'enseignement de la lecture-écriture</em>. Presses de l'Université du Québec. ISBN 978-2-7605-5404-7.
</p>
```

## Page 2 — Dépistage et patterns d'apprentissage

```html
<p>Le dépistage de Labo Codex se construit automatiquement à partir des productions étudiantes que tu évalues. À chaque artefact, l'app calcule des indices et détecte des patterns.</p>

<h4>Quatre fonctions du dépistage</h4>
<ul>
    <li><strong>Suivre les progrès</strong> de chaque étudiant·e dans le temps.</li>
    <li><strong>Repérer les étudiant·es à risque</strong> qui ne réalisent pas les apprentissages attendus.</li>
    <li><strong>Guider le choix de l'intervention</strong> : quel palier, quels critères cibler.</li>
    <li><strong>Évaluer l'efficacité de ton enseignement</strong>. Si plus de 20 % des étudiant·es sont en difficulté, c'est peut-être ton palier universel qu'il faut renforcer, pas nécessairement l'étudiant·e qui est en cause.</li>
</ul>

<h4>Quatre patterns observables</h4>
<p>L'app classe automatiquement chaque étudiant·e dans des «patterns» multifactoriels. Ces patterns sont en réalité une combinaison d'observations faites à partir de ses productions récentes. Les plages de pourcentages sont basées sur des données empiriques recueillies avec Labo Codex par Grégoire Bédard à l'automne 2025. Étant donné les limites de l'échantillon, ce sont des hypothèses qui restent encore à valider empiriquement. Ces plages reposent sur SOLO et ACP :</p>

<ul class="guide-pedagogique-patterns-liste">
    <li><span class="badge-pattern-stable"></span> <strong>Progression stable</strong> — pas de défi identifié, performance suffisante.</li>
    <li><span class="badge-pattern-defi-specifique"></span> <strong>Défi spécifique</strong> — performance générale ≥ 75 %, mais un défi récurrent identifié sur un ou plusieurs critères.</li>
    <li><span class="badge-pattern-difficulte-emergente"></span> <strong>Difficulté émergente</strong> — performance entre 64 % et 74 % avec présence d'un défi. Zone de surveillance.</li>
    <li><span class="badge-pattern-difficulte-persistante"></span> <strong>Difficulté persistante</strong> — performance inférieure à 64 % sur les artefacts récents. Zone d'intervention prioritaire.</li>
</ul>

<div class="guide-pedagogique-astuce">L'app surveille particulièrement les critères de <strong>niveau SOLO Multistructurel</strong> — ce sont les fondamentaux. Si les fondamentaux ne sont pas acquis, les compétences supérieures (Relationnel, Abstrait étendu) ne peuvent pas se développer.</div>
```

## Page 3 — Les trois niveaux d'intervention

```html
<p>La RàI propose un <strong>continuum d'intensification</strong> de l'intervention pédagogique, organisé en trois paliers. Ces paliers ne sont pas des catégories où l'on enferme un·e étudiant·e — c'est un curseur que tu ajustes selon sa réponse.</p>

<h4>Palier 1 — Universel</h4>
<p>L'enseignement régulier offert à l'ensemble du groupe. C'est le palier le plus large et le plus important. Quand il fonctionne bien, 80 % ou plus des étudiant·es progressent correctement sans intervention supplémentaire.</p>

<h4>Palier 2 — Préventif</h4>
<p>Intervention ciblée pour les étudiant·es qui montrent des signes de difficulté émergente. Travail en sous-groupe sur des composantes précises (par exemple un critère récurrent en défi). Durée limitée, objectif clair, mesure de la réponse.</p>

<h4>Palier 3 — Intensif</h4>
<p>Intervention individualisée pour les étudiant·es dont la difficulté persiste malgré le palier 2. Plus de temps, plus de fréquence, plus de personnalisation. C'est rare et coûteux en ressources — à utiliser pour les cas où c'est nécessaire – et à répartir dans une équipe intégrée.</p>

<div class="guide-pedagogique-astuce"><strong>Principe contre-intuitif</strong> : si plus de 20 % de tes étudiant·es sont en difficulté, c'est ton <em>palier 1</em> qu'il faut renforcer en premier, pas multiplier les interventions de palier 2 ou 3. Quand l'enseignement universel échoue à grande échelle, intensifier individuellement masque le vrai problème.</div>

<p>Dans Labo Codex, l'app suggère un niveau d'intervention basé sur le diagnostic croisé (IPB × direction), mais c'est <strong>toi qui décides</strong>. L'app éclaire, tu juges.</p>
```

## Page 4 — La RàI en pratique dans Labo Codex

```html
<p>Voici comment utiliser concrètement la RàI dans l'app :</p>

<h4>1. Configure ta grille de dépistage</h4>
<p>Va dans <strong>Conception → Grilles de critères</strong>. Ta grille contient les critères que tu utilises pour évaluer les productions. Chaque critère porte un attribut <strong>niveau SOLO</strong> (Multistructurel, Relationnel, ou Abstrait étendu). Le dépistage surveille particulièrement les critères Multistructurels.</p>

<h4>2. Évalue les productions normalement</h4>
<p>À chaque production évaluée (annotée et notée), l'app met à jour automatiquement les indices et patterns pour chaque étudiant·e. Aucune saisie supplémentaire requise.</p>

<h4>3. Consulte les patterns dans le profil étudiant</h4>
<p>Va dans <strong>Suivi → Profils individuels</strong>. Le profil affiche le pattern actuel de l'étudiant·e avec son badge, les critères en défi classés par niveau SOLO, et la trajectoire récente.</p>

<h4>4. Documente tes interventions</h4>
<p>Le module <strong>Suivi → Interventions</strong> te permet de planifier une intervention, de documenter ce que tu as fait, et de revenir mesurer la réponse de l'étudiant·e à travers les artefacts suivants. C'est le cycle <em>teach-test-revise-test</em> de Fuchs.</p>

<h4>5. Suis les sous-groupes</h4>
<p>Quand plusieurs étudiant·es partagent un défi commun, l'app peut suggérer des sous-groupes pour des interventions ciblées de palier 2. Le formulaire d'intervention propose les critères en défi communs — tu n'as qu'à valider ou ajuster.</p>

<div class="guide-pedagogique-astuce">La RàI n'est pas un système qui te dit quoi faire. C'est un système qui t'aide à voir ce qui se passe pour mieux décider. Si l'app te suggère un palier 3 pour un·e étudiant·e mais que ton jugement professionnel te dit autre chose, fais confiance à ton jugement — et utilise les données pour expliquer ta décision à toi-même et aux autres intervenants.</div>
```

---

## Points soumis à validation

1. **Écriture inclusive** : j'ai appliqué « étudiant·e / étudiant·es » partout (convention `·es` de la refonte des textes). Pour « l'enseignant·e » et « présent·e / seul·e », j'ai aussi appliqué la forme inclusive — à confirmer, car les textes de l'app tutoient l'utilisateur et contournent souvent le problème.
2. **SOLO p.4** : « Il ou elle établit explicitement des relations » — alternative possible : reformuler pour éviter le pronom (« La réponse établit explicitement des relations entre les composantes »).
3. **SOLO p.5, section échelle IDME** : la réécriture pose la correspondance 0↔Préstructurel, I↔Uni, D↔Multi, M↔Relationnel, E↔Étendu comme structurelle. C'est conforme au glossaire mémoire, mais à valider : c'est la seule section entièrement nouvelle.
4. **RàI p.2** : noms exacts des classes de badges à confirmer à l'implémentation (`badge-pattern-stable` vérifié présent ; rendu visuel hors contexte parent à tester, cf. §3.3 du plan RàI).
5. **ACP p.2, indice A** : « une absence (justifiée ou non) ne compte pas » — à confirmer que la saisie des présences 1.0.0 n'a pas introduit de statut intermédiaire (retard, départ) qui nuancerait la phrase.
6. **Tutoiement** conservé partout, conforme à la convention de l'app.
