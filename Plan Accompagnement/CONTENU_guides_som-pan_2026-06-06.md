# Contenu rédigé — guides « som » et « pan » (6 juin 2026)

**Destinataire** : Claude Code (intégration) + Grégoire (validation de contenu)
**Applique** : `CDC_guides_pratiques_notation_2026-06-06.md` (décisions Grégoire du 6 juin)
**Format** : entrées prêtes à coller dans `GUIDES_PEDAGOGIQUES` (`js/guides-pedagogiques.js`).
**Statut citations** : toutes vérifiées sur sources primaires (voir annexe §C).

> **Conventions de forme** (préférence Grégoire) : guillemets français «…», tiret
> demi-cadratin (–) pour les incises, parenthèses pour les incises courtes. Les guides
> existants (SOLO/ACP/RàI) utilisent le tiret cadratin (—) comme séparateur de liste ;
> j'ai suivi la convention de Grégoire (–). À uniformiser dans un sens ou l'autre si tu
> préfères la cohérence avec les guides existants.

---

## A. Guide « som » — Comprendre sa pratique sommative (gateway, 3 pages)

Registre **descriptif, non militant** : on décrit ce que fait la moyenne pondérée et on
nomme les irritants reconnaissables, **sans dénigrer le sommatif**. Public : le prof qui
n'envisage pas encore de changer.

```javascript
        /* ────────────────────────────────────────────────────
           Guide SOM (gateway) — 3 pages
           Référence : CSÉ (2018), Évaluer pour que ça compte vraiment
           ──────────────────────────────────────────────────── */
        som: {
            titre: 'Comprendre sa pratique sommative',
            cssPrefix: 'guide-som',
            pages: [
                {
                    titre: 'Ce que mesure une moyenne pondérée',
                    contenu: `
<p>La pratique <strong>sommative</strong> classique calcule une <strong>moyenne pondérée</strong> : chaque évaluation reçoit une note, chaque note pèse selon sa pondération, et la somme donne le résultat final. C'est la pratique la plus répandue dans le réseau collégial, et celle que Labo Codex propose par défaut.</p>
<p>Cette mécanique est claire et défendable. Mais il vaut la peine de regarder ce qu'elle mesure exactement – et ce qu'elle laisse de côté.</p>
<h4>« Sommatif » ne veut pas dire « addition »</h4>
<p>Le mot prête à confusion. Selon Scallon, cité par le Conseil supérieur de l'éducation, «&nbsp;[i]l ne s'agit pas […] d'additionner des résultats partiels pour établir une somme. Il s'agit plutôt de s'appuyer sur des accomplissements observés en cours de route pour éclairer le jugement qui devra être porté sur une performance terminale.&nbsp;» Autrement dit, le sommatif est censé être un <em>bilan</em>, pas une simple addition.</p>
<p>Dans les faits, la moyenne pondérée fait quand même une addition : elle agrège tout ce qui a été noté pendant le trimestre, y compris les premiers essais.</p>
<p class="guide-pedagogique-ref">Conseil supérieur de l'éducation (2018). <em>Évaluer pour que ça compte vraiment. Rapport sur l'état et les besoins de l'éducation 2016-2018</em>, Québec, chapitres 2 et 3.</p>`
                },
                {
                    titre: 'Tes règles spéciales',
                    contenu: `
<p>Une pratique sommative n'est pas qu'une moyenne brute. Labo Codex te laisse régler plusieurs leviers qui changent ce que la note illustre.</p>
<h4>Le remplacement automatique = une reprise sans pénalité</h4>
<p>Quand tu actives le <strong>remplacement automatique</strong>, une nouvelle production qui porte sur les mêmes apprentissages peut <em>remplacer</em> un résultat antérieur plus faible. C'est, concrètement, une <strong>forme de reprise sans pénalité</strong> : l'étudiant·e n'est plus figé·e dans sa première tentative. Beaucoup d'enseignant·es pratiquent déjà ce pilier des pratiques alternatives sans le nommer ainsi.</p>
<h4>Les pondérations</h4>
<p>En donnant plus de poids aux évaluations de fin de parcours qu'aux premières, tu rapproches déjà ta moyenne d'un <em>bilan</em> : tu fais compter davantage ce que l'étudiant·e finit par maîtriser que ses débuts.</p>
<h4>La note de passage</h4>
<p>Le seuil de réussite (60&nbsp;% dans le réseau collégial) s'applique à la note finale, quelle que soit la pratique. Il est traité dans le guide <strong>« Cadre réglementaire »</strong>.</p>
<div class="guide-pedagogique-astuce">Si tu utilises déjà le remplacement automatique et des pondérations croissantes, tu es plus proche de l'esprit des pratiques alternatives que tu ne le crois.</div>`
                },
                {
                    titre: 'Quand la moyenne te gêne',
                    contenu: `
<p>La moyenne pondérée a une limite que le Conseil supérieur de l'éducation a documentée : elle <strong>garde la trace des premières erreurs</strong> dans le résultat final.</p>
<p>Le Conseil l'énonce sans détour : «&nbsp;en cumulant les étapes au bulletin […], on garde aussi la trace des premières erreurs dans le résultat final […], ce qui fait en sorte que cette note ne témoigne pas toujours adéquatement des acquis réels de l'élève ou de l'étudiant. Ceux qui connaissent des débuts difficiles se retrouvent particulièrement pénalisés par le cumul de points.&nbsp;»</p>
<p>Cela se reconnaît à quelques irritants concrets :</p>
<ul>
    <li>l'étudiant·e qui a fini par tout comprendre, mais que sa moyenne tire vers le bas à cause de ses premiers travaux&nbsp;;</li>
    <li>la rétroaction soigneusement écrite, mais ignorée parce qu'une note l'accompagnait&nbsp;;</li>
    <li>la négociation de points en fin de trimestre, déconnectée de l'apprentissage réel.</li>
</ul>
<p>Aucun de ces irritants n'est une faute de l'enseignant·e&nbsp;: ce sont des effets de la mécanique du cumul.</p>
<div class="guide-pedagogique-astuce">Si ces situations te parlent, il existe d'autres manières de noter – qui certifient ce que l'étudiant·e sait faire <em>à la fin</em> plutôt que de moyenner tout le parcours. C'est l'objet du guide <strong>« Modalités d'évaluation »</strong>.</div>`
                }
            ]
        },
```

---

## B. Guide « pan » — Modalités d'évaluation (5 pages)

Reprend l'ossature validée du 29 mai, **élargie** : page 2 (deux familles PAN/PRÉN,
Girouard-Gagné), page 4 (dénotation en **horizon court, non activable**). Code **STD**.

```javascript
        /* ────────────────────────────────────────────────────
           Guide PAN (Modalités) — 5 pages
           Réf. : CSÉ (2018) ; Girouard-Gagné et al. (2024) ;
                  Talbert & Clark (2023)
           ──────────────────────────────────────────────────── */
        pan: {
            titre: 'Modalités d’évaluation (PAN et sommative)',
            cssPrefix: 'guide-pan',
            pages: [
                {
                    titre: 'Pourquoi sortir du cumul de points ?',
                    contenu: `
<p>Avant de présenter d'autres manières de noter, il faut comprendre <strong>à quel problème elles répondent</strong>. Ce problème, le Conseil supérieur de l'éducation l'a documenté dans <em>Évaluer pour que ça compte vraiment</em> (2018). Le Conseil n'y parle pas de pratiques alternatives – mais il remet en cause la notation sommative fondée sur le cumul de points.</p>
<p>L'évaluation poursuit <strong>deux finalités</strong> : <em>soutenir l'apprentissage</em> (la fonction formative, continue) et <em>témoigner des acquis</em> (la fonction certificative, en fin de parcours). Le cumul de points mêle les deux : en additionnant toutes les notes du trimestre, il transforme chaque évaluation formative en verdict qui pèse dans le résultat final.</p>
<h4>Le défaut du cumul</h4>
<p>Le Conseil l'énonce ainsi : «&nbsp;on garde aussi la trace des premières erreurs dans le résultat final […], ce qui fait en sorte que cette note ne témoigne pas toujours adéquatement des acquis réels de l'élève ou de l'étudiant. Ceux qui connaissent des débuts difficiles se retrouvent particulièrement pénalisés par le cumul de points.&nbsp;» Une moyenne punit l'apprentissage initial, alors que c'est précisément le moment où l'erreur est attendue.</p>
<p>L'erreur, justement, n'est pas une faute à pénaliser. Le Conseil rappelle, citant Astolfi, que «&nbsp;l'erreur est un témoin qui permet de repérer les difficultés&nbsp;» dans le travail d'apprentissage.</p>
<p class="guide-pedagogique-ref">Conseil supérieur de l'éducation (2018). <em>Évaluer pour que ça compte vraiment. Rapport sur l'état et les besoins de l'éducation 2016-2018</em>, Québec, chapitres 2 et 3. — Talbert, R., &amp; Clark, D. (2023). <em>Grading for Growth: A Guide to Alternative Grading Practices</em>. Routledge.</p>`
                },
                {
                    titre: 'Deux familles d’alternatives',
                    contenu: `
<p>Les alternatives au cumul de points ne sont pas toutes au même endroit. La recherche québécoise récente (Girouard-Gagné et coll., 2024) distingue <strong>deux familles</strong>, et la nuance compte.</p>
<h4>Les PAN – renouveler la note</h4>
<p>Les <strong>pratiques alternatives de notation</strong> (PAN) gardent la note, mais en changent la logique : au lieu d'additionner des points, elles <strong>certifient l'atteinte</strong> de standards ou d'objectifs à la fin du parcours. On note encore, autrement. C'est le cas des pratiques Standards et Spécifications (page suivante).</p>
<h4>Les PRÉN – réduire ou éliminer la note</h4>
<p>Les <strong>pratiques de réduction ou d'élimination de la notation</strong> (PRÉN) vont plus loin : elles cherchent à <em>séparer</em> l'apprentissage et la rétroaction de la note elle-même. La <strong>dénotation</strong> (souvent appelée <em>ungrading</em>) appartient à cette famille.</p>
<div class="guide-pedagogique-astuce">Dans Labo Codex, ces pratiques portent toutes, par commodité, le badge «&nbsp;PAN&nbsp;». La recherche est plus précise : Standards et Spécifications sont des PAN&nbsp;; la dénotation est une PRÉN. Le badge est un raccourci d'interface, pas une affirmation théorique.</div>
<h4>Noter n'est pas évaluer</h4>
<p>Cette distinction repose sur une idée simple : la <strong>notation</strong> a deux fonctions propres – <em>standardiser</em> (situer par rapport à un étalon) et <em>trier</em> (classer les personnes). Les PRÉN abandonnent le <strong>tri</strong> tout en conservant la <strong>certification</strong> : on peut, selon les mots de Girouard-Gagné et coll., soutenir et certifier des apprentissages «&nbsp;sans être notés&nbsp;», par la rétroaction et le jugement qualitatif. La note demeure quand le règlement l'exige, jamais pour classer.</p>
<h4>Pourquoi dissocier la note de la rétroaction</h4>
<p>Un résultat empirique éclaire toute la démarche : bonifier la rétroaction n'a presque <strong>aucun effet si une note l'accompagne</strong>. C'est la <em>séparation</em> de la note et de la rétroaction qui fait travailler la rétroaction. C'est pourquoi la première marche, la plus prudente, consiste souvent à <strong>différer ou masquer la note</strong> pour que la rétroaction passe d'abord.</p>`
                },
                {
                    titre: 'Les pratiques disponibles : Standards et Spécifications',
                    contenu: `
<p>Labo Codex implémente actuellement <strong>deux PAN</strong> – deux manières concrètes de certifier l'atteinte plutôt que d'additionner. La pratique sommative reste offerte comme point de comparaison.</p>
<h4>PAN-Standards (code STD, aussi appelée Maîtrise)</h4>
<p>Tu évalues par <strong>niveaux de maîtrise</strong> (par exemple l'échelle IDME : Insuffisant, en Développement, Maîtrisé, Étendu). La note est construite à partir de la démonstration de compétence, pas d'une moyenne. C'est la transposition, au collégial, de ce que le Conseil supérieur de l'éducation décrit comme le <em>bulletin descriptif</em> : «&nbsp;l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères et correspond à des niveaux de maîtrise.&nbsp;» En anglais : <em>Standards-Based Grading</em>.</p>
<h4>PAN-Spécifications (code SPE)</h4>
<p>Chaque travail est jugé <strong>conforme ou non conforme</strong> à des spécifications définies d'avance ; la note finale dépend du nombre de spécifications réussies (les «&nbsp;forfaits&nbsp;»). Le Conseil note d'ailleurs que la communication d'une évaluation certificative «&nbsp;peut également prendre une forme dichotomique : succès ou échec&nbsp;». En anglais : <em>Specifications Grading</em>.</p>
<h4>Sommative (code SOM) – le point de contraste</h4>
<p>La sommative classique calcule une moyenne pondérée. <strong>Ce n'est pas une PAN</strong> : c'est la pratique traditionnelle, celle dont le cumul de points est interrogé par le Conseil. Labo Codex la conserve parce qu'elle reste la pratique officielle dans bien des contextes et qu'elle facilite la transition. (Le guide <strong>« Comprendre sa pratique sommative »</strong> lui est consacré.)</p>
<div class="guide-pedagogique-astuce">Le choix entre Standards et Spécifications n'a pas à être tranché tout de suite, ni de façon définitive : commence par une pratique, sur une partie de ton cours, et ajuste.</div>`
                },
                {
                    titre: 'La dénotation : une PRÉN à l’horizon',
                    contenu: `
<p>La troisième voie documentée par la recherche est la <strong>dénotation</strong> (ou <em>ungrading</em>) – une PRÉN. Plutôt que de noter chaque travail, l'enseignant·e mise sur la <strong>rétroaction qualitative</strong> et des <strong>cibles d'apprentissage</strong>, et n'établit une note certificative qu'à la fin. <strong>Ce n'est jamais «&nbsp;pas de note&nbsp;»</strong> : le règlement exige toujours une note finale ; c'est le rôle de <em>tri</em> de la note qui est abandonné, pas la certification.</p>
<div class="guide-pedagogique-astuce"><strong>Statut dans Labo Codex.</strong> La dénotation est <strong>conçue mais pas encore activable</strong> dans l'application. Cette page situe le paysage&nbsp;; elle ne décrit pas une fonction disponible aujourd'hui. Elle s'enrichira quand la pratique sera implémentée.</div>
<h4>Deux garde-fous à connaître</h4>
<p><strong>Équité.</strong> Une note finale fondée sur un jugement global est la plus exposée aux biais implicites. C'est pourquoi une dénotation responsable s'appuie toujours sur des <strong>traces et des critères explicites</strong> (cibles nommées, atteinte consignée), jamais sur une impression d'ensemble.</p>
<p><strong>Santé mentale.</strong> La dénotation n'est pas un bien universel : la recherche note que <strong>certain·es étudiant·es sont déstabilisé·es par l'absence de repères</strong> habituels comme les notes. La transition demande de l'accompagnement et de la transparence.</p>`
                },
                {
                    titre: 'Choisir en conscience',
                    contenu: `
<p>Le choix d'une pratique se fait dans <strong>Conception → Pratiques de notation</strong>. Quelques repères pour décider.</p>
<h4>Une pratique n'est pas une fin en soi</h4>
<p>Le Conseil supérieur de l'éducation rappelle que la valeur informative d'une note, seule, est pauvre : elle «&nbsp;ne dit rien des forces et des faiblesses de la personne&nbsp;». Une PAN ne corrige cela que si elle est <strong>accompagnée de rétroaction</strong> et intégrée à un dispositif d'apprentissage (enseignement explicite, dépistage RàI). Seule, elle peut donner l'impression d'une notation laxiste ; intégrée, elle devient un système défendable.</p>
<h4>Le jugement professionnel prime</h4>
<p>Dans toutes ces pratiques, l'algorithme propose, mais c'est ton <strong>jugement professionnel</strong> qui tranche. Le Conseil le définit comme «&nbsp;un processus qui mène à une prise de décision&nbsp;» exigeant «&nbsp;rigueur, cohérence et transparence&nbsp;». Labo Codex calcule une suggestion ; il ne décide pas à ta place.</p>
<h4>Performance et dépistage : deux regards</h4>
<p>Tu peux découpler la note (Performance) du dépistage (Niveau d'attention). La note suit la pratique choisie ; le dépistage, lui, regarde les productions les plus récentes – ce qui rejoint l'idée, citée par le Conseil d'après l'Ontario, de porter «&nbsp;une attention toute particulière aux preuves d'apprentissage les plus récentes&nbsp;».</p>
<h4>Et le cadre légal ?</h4>
<p>Choisir une PAN ne te place pas hors du règlement : le seuil de réussite de 60&nbsp;% et les règles de ta PIEA continuent de s'appliquer. Ce volet est traité dans le guide compagnon <strong>« Cadre réglementaire »</strong>.</p>
<div class="guide-pedagogique-astuce">En résumé : le Conseil fournit le <em>pourquoi</em> (le cumul ne témoigne pas fidèlement des acquis), les PAN et les PRÉN fournissent le <em>comment</em> (certifier l'atteinte, ou dissocier la rétroaction de la note), et le guide réglementaire fournit le <em>cadre</em> (60&nbsp;%, PIEA).</div>`
                }
            ]
        },
```

---

## C. Annexe — vérification des citations (sources primaires)

Toutes les citations ci-dessus ont été vérifiées **mot pour mot** dans les PDF du dossier
Cowork `Simulation de pratiques/`.

**CSÉ (2018), chapitres 2-3** (`50-0508-RF-evaluer-compte-vraiment (chapitres 2-3).pdf`,
et rapport intégral `50-0508-RF-…-REBE-16-18.pdf`) :

- «&nbsp;on garde aussi la trace des premières erreurs dans le résultat final […] particulièrement pénalisés par le cumul de points.&nbsp;» ✔ (chap. 2)
- Scallon : «&nbsp;[I]l ne s'agit pas […] d'additionner des résultats partiels pour établir une somme…&nbsp;» ✔
- «&nbsp;ne serait pas un cumul des notes précédentes : elle refléterait l'atteinte de la compétence ou des objectifs à la fin du processus.&nbsp;» ✔ *(non citée dans les guides, mais sous-jacente à la page 2)*
- *compter* (faire la somme) / *prendre en compte* (considérer) ✔
- «&nbsp;une forme dichotomique : succès ou échec.&nbsp;» ✔
- «&nbsp;La sélection n'est pas une finalité de l'évaluation et devrait avoir un caractère exceptionnel.&nbsp;» ✔
- «&nbsp;l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères et correspond à des niveaux de maîtrise.&nbsp;» ✔
- «&nbsp;ne dit rien des forces et des faiblesses de la personne&nbsp;» ✔
- jugement professionnel : «&nbsp;rigueur, cohérence et transparence&nbsp;» ✔
- Astolfi : l'erreur «&nbsp;est un témoin qui permet de repérer les difficultés&nbsp;» ✔
- Ontario (cité CSÉ) : «&nbsp;portera une attention toute particulière aux preuves d'apprentissage les plus récentes&nbsp;» ✔ (rapport intégral, p. 50 du Min. Éduc. Ontario 2010)

**Girouard-Gagné et coll. (2024)** (`Girouard-Gagné_cégeps.pdf`) :

- fonctions de la notation : «&nbsp;quantifier des connaissances, standardiser et trier&nbsp;» ✔
- PRÉN = «&nbsp;pratiques évaluatives réduisant ou éliminant la notation&nbsp;» ; intention de
  «&nbsp;séparer […] les apprentissages et l'évaluation […] et la notation&nbsp;» ✔
- contraste explicite : «&nbsp;les PAN ne cherchent pas nécessairement à séparer l'évaluation
  et les apprentissages de la notation, mais à renouveler la pratique de la notation&nbsp;» ✔
- «&nbsp;soutenus et certifiés sans être notés&nbsp;» (rétroaction + jugement qualitatif) ✔
- effet rétroaction neutralisée «&nbsp;si elle reste accompagnée d'une note&nbsp;» ✔
- santé mentale : «&nbsp;stress lié à l'absence de repères traditionnels comme les notes&nbsp;» ✔

> **Frontière faits / lecture (à re-vérifier en relecture)** : aucune phrase n'attribue
> les PAN ni les PRÉN au CSÉ. Le rapport justifie l'exploration ; il ne prescrit pas ces
> pratiques. Les apports de typologie (PAN/PRÉN, noter≠évaluer) sont attribués à
> Girouard-Gagné et coll., pas au CSÉ.

---

## D. Points d'accès (boutons)

Dans **Conception → Pratiques de notation** (`index.html`, section
`#conception-pratiques-notation`, l. ~5577), deux boutons « Guide » (le 3e,
« Cadre réglementaire » `data-param="pan-rrec"`, relève du plan compagnon).

Utiliser la **classe existante `option-accompagnement-guide-btn`** (styles.css l. 2208,
avec variantes mode-clair et `img.btn-inline-icon`) – c'est la classe des boutons « Guide »
des sections d'accompagnement (index.html l. 8794/8963/9077). **Ne pas inventer `ee-guide-btn`**
(la classe du plan du 29 mai n'existe pas). Icône disponible : `icons/icon-book.svg`.

```html
<button class="option-accompagnement-guide-btn" data-action="ouvrirGuidePedagogique" data-param="som" title="Guide — Comprendre sa pratique sommative">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Comprendre sa sommative
</button>
<button class="option-accompagnement-guide-btn" data-action="ouvrirGuidePedagogique" data-param="pan" title="Guide — Modalités d’évaluation (PAN et sommative)">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Modalités
</button>
```

**Note d'intégration (Claude Code)** : **aucun CSS nouveau requis.** `cssPrefix` ne sert que
de `className` du panneau (`guides-pedagogiques.js` l. 272) ; le style vient des classes
partagées `guide-pedagogique-*` (les guides existants `guide-solo/-acp/-rai` n'ont aucun CSS
dédié). Les valeurs `'guide-som'`/`'guide-pan'` fonctionneront à l'identique. Le dispatcher
`data-action="ouvrirGuidePedagogique"` (main.js) gère déjà le `data-param`. Tester
clair/sombre + clavier (flèches/Échap) + iPad, comme les autres guides.

## E. Points restants pour Grégoire

1. **Identifiant du gateway** : `som` retenu – confirmer (cohérence `som`/`pan`/`pan-rrec`).
2. **Page 1 du guide `pan`** : elle recoupe le gateway `som` (le «&nbsp;défaut du cumul&nbsp;»).
   Si le gateway est lu en amont, on peut l'alléger ; laissée complète ici pour qu'elle
   tienne seule. À toi de voir.
3. **Tirets** : convention demi-cadratin (–) appliquée ; bascule possible vers le tiret
   cadratin (—) des guides existants si tu préfères l'homogénéité.
4. **Numéro de beta + changelog** : au commit, via `scripts/release.mjs`.
