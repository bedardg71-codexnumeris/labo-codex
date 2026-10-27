/* ============================================================
   GUIDES PÉDAGOGIQUES — Module unifié
   ------------------------------------------------------------
   Un seul moteur de rendu pour tous les guides pédagogiques de
   Labo Codex. Guides actuels : SOLO, ACP, RàI. Extensible :
   ajouter une entrée dans GUIDES_PEDAGOGIQUES suffit (guides
   PAN et Enseignement explicite prévus dans un chantier futur).

   Specs : Plan Accompagnement/PLAN_guides_pedagogiques.md (23 mai 2026)
   Contenu : Plan Accompagnement/REVISION_contenu_guides_SOLO-ACP-RAI.md
             (validé par Grégoire le 4 juin 2026)

   API publique (dispatcher data-action de main.js) :
   - ouvrirGuidePedagogique(idGuide)   data-param="solo" | "acp" | "rai" | "som" | "pan"
   - fermerGuidePedagogique()

   Panneau : #guide-pedagogique-panel (index.html), construit
   dynamiquement à l'ouverture, vidé à la fermeture.

   Sécurité : contenu 100 % statique défini dans ce fichier —
   aucune donnée utilisateur injectée, donc innerHTML est sûr
   ici (même statut que GUIDE_PAGES de planification-carte.js).
   ============================================================ */

(function() {

    var GUIDES_PEDAGOGIQUES = {

        /* ────────────────────────────────────────────────────
           Guide SOLO — 5 pages
           Référence : Biggs & Collis (1982)
           ──────────────────────────────────────────────────── */
        solo: {
            titre: 'Guide SOLO',
            cssPrefix: 'guide-solo',
            pages: [
                {
                    titre: 'Qu’est-ce que SOLO ?',
                    contenu: `
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
<p>Dans Labo Codex, SOLO sert de fondement à l'échelle de performance IDME (Incomplet, Développement, Maîtrise, Étendu) et à l'observation des productions étudiantes via les tampons de la catégorie Compréhension.</p>
<p class="guide-pedagogique-ref">Biggs, J. B., &amp; Collis, K. F. (1982). <em>Evaluating the Quality of Learning: The SOLO Taxonomy (Structure of the Observed Learning Outcome)</em>. Academic Press.</p>`
                },
                {
                    titre: 'Préstructurel et Unistructurel',
                    contenu: `
<p>Les deux niveaux les plus bas correspondent à un apprentissage fragmentaire ou absent.</p>
<h4>Préstructurel</h4>
<p>L'étudiant·e ne fournit aucune information pertinente, ou des informations sans lien avec la question posée. Code IDME : <strong>0</strong> (Non recevable).</p>
<h4>Unistructurel <img src="autocollants/solo/comprehension-uni.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e identifie un seul élément pertinent, sans le mettre en relation avec d'autres. La réponse est correcte mais incomplète ou superficielle. Code IDME : <strong>I</strong> (Incomplet).</p>
<p><em>Exemple : à la question « Quelles sont les causes de la Révolution française ? », l'étudiant·e mentionne seulement « la pauvreté » sans détailler ni relier à d'autres facteurs.</em></p>
<div class="guide-pedagogique-astuce">Pédagogiquement, ce niveau signale une compréhension de surface — un point de départ, pas une fin. L'intervention vise à enrichir les éléments identifiés et à inviter l'étudiant·e à en chercher d'autres.</div>`
                },
                {
                    titre: 'Multistructurel',
                    contenu: `
<h4>Multistructurel <img src="autocollants/solo/comprehension-multi.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e identifie plusieurs éléments pertinents, mais ils restent juxtaposés sans relation explicite entre eux. La réponse est riche mais fragmentée. Code IDME : <strong>D</strong> (Développement).</p>
<p><em>Exemple : pour la même question, l'étudiant·e énumère « la pauvreté, les inégalités sociales, les idées des Lumières et la crise financière » sans expliquer comment ces facteurs interagissent.</em></p>
<div class="guide-pedagogique-astuce">C'est la <strong>zone critique de consolidation</strong>. L'étudiant·e a les éléments mais pas encore la structure. L'intervention pédagogique vise à amener à <em>relier</em> : « Comment ces facteurs s'influencent-ils les uns les autres ? »</div>
<p>Dans l'évaluation IDME, ce niveau correspond à un seuil situé entre 64\u00a0% et 74\u00a0% : la performance est en développement, pas encore aboutie.</p>`
                },
                {
                    titre: 'Relationnel et Abstrait étendu',
                    contenu: `
<h4>Relationnel <img src="autocollants/solo/comprehension-relationnel.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e intègre les éléments en une structure cohérente. Il ou elle établit explicitement des relations entre les composantes. La réponse a une logique interne identifiable. Code IDME : <strong>M</strong> (Maîtrise).</p>
<p><em>Exemple : « Les idées des Lumières ont alimenté la conscience des inégalités, que la crise financière a rendues insupportables aux yeux d'une population déjà appauvrie. »</em></p>
<h4>Abstrait étendu <img src="autocollants/solo/comprehension-etendu.svg" alt="" class="guide-pedagogique-pictogramme"></h4>
<p>L'étudiant·e non seulement intègre la structure, mais l'extrapole : comparaisons avec d'autres contextes, formulation de principes généraux, application de la structure à des situations nouvelles. Code IDME : <strong>E</strong> (Étendu).</p>
<p><em>Exemple : « Les conditions qui ont conduit à la Révolution française se retrouvent partiellement dans d'autres révolutions, comme le Printemps arabe — une crise économique combinée à une conscience des inégalités amplifiée par la circulation des idées. »</em></p>
<div class="guide-pedagogique-astuce">L'écart entre Relationnel et Abstrait étendu marque un saut qualitatif : passer de comprendre <em>ce cas-ci</em> à comprendre <em>cette classe de cas</em>.</div>`
                },
                {
                    titre: 'SOLO en pratique',
                    contenu: `
<h4>Avec les tampons de la palette d'annotation</h4>
<p>Quatre tampons SOLO sont disponibles dans la catégorie « Compréhension » de la palette d'annotation (visible seulement quand la taxonomie SOLO est activée dans Labo → Outils d'observation) :</p>
<ul class="guide-pedagogique-tampons-liste">
    <li><img src="autocollants/solo/comprehension-uni.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Unistructurel</strong> — pour les passages où l'étudiant·e identifie un seul élément</li>
    <li><img src="autocollants/solo/comprehension-multi.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Multistructurel</strong> — pour les passages où plusieurs éléments sont juxtaposés</li>
    <li><img src="autocollants/solo/comprehension-relationnel.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Relationnel</strong> — pour les passages qui établissent des relations</li>
    <li><img src="autocollants/solo/comprehension-etendu.svg" alt="" class="guide-pedagogique-pictogramme"> <strong>Étendu</strong> — pour les passages qui transfèrent à d'autres contextes</li>
</ul>
<h4>Avec l'échelle de performance IDME</h4>
<p>L'échelle IDME de Labo Codex est construite sur SOLO : chaque code correspond à un niveau cognitif. <strong>PS</strong> ↔ Préstructurel, <strong>I</strong> ↔ Unistructurel, <strong>D</strong> ↔ Multistructurel, <strong>M</strong> ↔ Relationnel, <strong>E</strong> ↔ Abstrait étendu. Quand tu situes une production sur l'échelle, tu poses en fait un jugement sur la structure cognitive observable de la réponse.</p>
<h4>Pour la rétroaction étudiante</h4>
<p>Identifier le niveau SOLO d'une production aide à formuler une rétroaction <em>structurelle</em> plutôt que purement quantitative. Au lieu de « il manque des éléments », tu peux dire « tes éléments sont identifiés (Multistructurel), maintenant cherche à les relier (Relationnel) ». L'étudiant·e comprend ce qu'il faut faire pour progresser, pas seulement que ce n'est pas assez.</p>
<div class="guide-pedagogique-astuce">Conseil pratique : commence par identifier le niveau dominant de la production, puis cherche les passages qui s'écartent (en mieux ou en moins bien). Les tampons servent à signaler ces passages dans le texte étudiant.</div>`
                }
            ]
        },

        /* ────────────────────────────────────────────────────
           Guide ACP — 3 pages
           Cadre interne, sans référence académique externe
           ──────────────────────────────────────────────────── */
        acp: {
            titre: 'Guide ACP',
            cssPrefix: 'guide-acp',
            pages: [
                {
                    titre: 'Qu’est-ce qu’ACP ?',
                    contenu: `
<p><strong>ACP</strong> est l'acronyme de trois indices descriptifs qui mesurent l'engagement et la performance d'un·e étudiant·e dans le cours :</p>
<ul>
    <li><strong>A</strong> — <strong>Assiduité</strong> : la proportion des périodes offertes auxquelles l'étudiant·e a été présent·e, sur les seules séances saisies (une séance « non saisie » n'y entre pas ; tant qu'aucune ne compte, A est inconnue).</li>
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
<div class="guide-pedagogique-astuce">ACP est un cadre de lecture interne à Labo Codex, sans référence académique externe. C'est un outil de bord pour l'enseignant·e, pas un instrument de mesure standardisé.</div>`
                },
                {
                    titre: 'Les trois indices en détail',
                    contenu: `
<h4>A — Assiduité</h4>
<p>L'indice A se calcule à partir des présences enregistrées dans le module Suivi → Saisie des présences. Une présence enregistrée pour une période compte ; une absence (justifiée ou non) ne compte pas.</p>
<p>L'unité d'affichage peut être configurée dans Labo → Outils d'observation : périodes (par défaut), heures, ou les deux.</p>
<h4>C — Complétion</h4>
<p>L'indice C se calcule à partir des productions attendues dans le trimestre. Une production est « complétée » dès qu'elle est remise, indépendamment de la note obtenue. Les productions à venir ne pénalisent pas C tant que leur date d'échéance n'est pas passée.</p>
<p>Calcul : <code>C = productions remises / productions attendues échues</code></p>
<h4>P — Performance</h4>
<p>L'indice P est la note courante de l'étudiant·e, calculée selon la pratique de notation active (Standards, Spécifications, Dénotation ou Sommative). Il ne représente <em>pas</em> la note finale du trimestre, mais une projection courante basée sur les productions déjà évaluées.</p>
<div class="guide-pedagogique-astuce">Les trois indices sont indépendants. Un·e étudiant·e peut avoir A élevé (toujours présent·e) mais C faible (ne remet pas ses travaux), ou C élevé (remet tout) mais P faible (résultats faibles). Lire les trois ensemble donne un portrait riche que la seule note ne donne pas.</div>`
                },
                {
                    titre: 'Utiliser ACP en classe',
                    contenu: `
<p>ACP éclaire trois types de situations courantes :</p>
<h4>Repérer les étudiant·es qui décrochent</h4>
<p>Quand A et C baissent ensemble sur quelques semaines, c'est un signal de désengagement précoce, souvent avant que P ne se dégrade. Intervention recommandée : prise de contact, conversation sur les obstacles.</p>
<h4>Distinguer effort et résultat</h4>
<p>Un·e étudiant·e avec C élevé et P faible fait l'effort mais ne maîtrise pas. L'intervention vise les compétences (revoir la grille de dépistage, identifier les critères en défi).</p>
<p>Un·e étudiant·e avec C faible et P moyen ou élevé sur ce qui est remis a peut-être un problème de planification ou de motivation, pas de compréhension. L'intervention vise l'organisation et l'engagement.</p>
<h4>Identifier les patterns de classe</h4>
<p>Si A de la classe baisse sur une période, c'est probablement un signal contextuel (semaine de partiels ailleurs, météo, etc.) – pas un problème individuel à intensifier. Si C baisse sur une production particulière, c'est peut-être que sa consigne ou son échéance est mal calibrée.</p>
<div class="guide-pedagogique-astuce">ACP est un cadre simple, pas un diagnostic. Croisé avec les patterns RàI (si activés) et les niveaux SOLO (si activés), il devient un outil de jugement professionnel riche – à manier avec discernement.</div>`
                }
            ]
        },

        /* ────────────────────────────────────────────────────
           Guide RàI — 4 pages
           Référence : Desrochers (dir.) (2021)
           ──────────────────────────────────────────────────── */
        rai: {
            titre: 'Guide RàI',
            cssPrefix: 'guide-rai',
            pages: [
                {
                    titre: 'Qu’est-ce que la RàI ?',
                    contenu: `
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
<p class="guide-pedagogique-ref">Desrochers, A. (dir.) (2021). <em>L'approche de la réponse à l'intervention et l'enseignement de la lecture-écriture</em>. Presses de l'Université du Québec. ISBN 978-2-7605-5404-7.</p>`
                },
                {
                    titre: 'Dépistage et patterns d’apprentissage',
                    contenu: `
<p>Le dépistage de Labo Codex se construit automatiquement à partir des productions étudiantes que tu évalues. À chaque artefact, l'app calcule des indices et détecte des patterns.</p>
<h4>Quatre fonctions du dépistage</h4>
<ul>
    <li><strong>Suivre les progrès</strong> de chaque étudiant·e dans le temps.</li>
    <li><strong>Repérer les étudiant·es à risque</strong> qui ne réalisent pas les apprentissages attendus.</li>
    <li><strong>Guider le choix de l'intervention</strong> : quel palier, quels critères cibler.</li>
    <li><strong>Évaluer l'efficacité de ton enseignement</strong>. Si plus de 20\u00a0% des étudiant·es sont en difficulté, c'est peut-être ton palier universel qu'il faut renforcer, pas nécessairement l'étudiant·e qui est en cause.</li>
</ul>
<h4>Cinq patterns observables</h4>
<p>L'app classe automatiquement chaque étudiant·e dans des «patterns» multifactoriels. Ces patterns sont en réalité une combinaison d'observations faites à partir de ses productions récentes. Les plages de pourcentages sont basées sur des données empiriques recueillies avec Labo Codex par Grégoire Bédard à l'automne 2025. Étant donné les limites de l'échantillon, ce sont des hypothèses qui restent encore à valider empiriquement. Ces plages reposent sur SOLO et ACP :</p>
<ul class="guide-pedagogique-patterns-liste">
    <li><span class="badge-pattern-stable">Progression stable</span> — pas de défi identifié, performance suffisante.</li>
    <li><span class="badge-pattern-defi-specifique">Défi spécifique</span> — performance générale ≥ 75\u00a0%, mais un défi récurrent identifié sur un ou plusieurs critères.</li>
    <li><span class="badge-pattern-difficulte-emergente">Difficulté émergente</span> — performance entre 64\u00a0% et 74\u00a0% avec présence d'un défi. Zone de surveillance.</li>
    <li><span class="badge-pattern-difficulte-persistante">Difficulté persistante</span> — performance inférieure à 64\u00a0% sur les artefacts récents. Zone d'intervention prioritaire.</li>
    <li><span class="badge-pattern-difficulte-persistante">Non-participation</span> — présent·e en classe, mais aucune production évaluée, quand le groupe permet d'en juger (un travail dû et au moins une copie du groupe évaluée).</li>
</ul>
<p>Tant que rien n'est jugeable, l'app affiche «&nbsp;Données insuffisantes&nbsp;» plutôt qu'un pattern.</p>
<div class="guide-pedagogique-astuce">L'app surveille particulièrement les critères de <strong>niveau SOLO Multistructurel</strong> — ce sont les fondamentaux. Si les fondamentaux ne sont pas acquis, les compétences supérieures (Relationnel, Abstrait étendu) ne peuvent pas se développer.</div>`
                },
                {
                    titre: 'Les trois niveaux d’intervention',
                    contenu: `
<p>La RàI propose un <strong>continuum d'intensification</strong> de l'intervention pédagogique, organisé en trois paliers. Ces paliers ne sont pas des catégories où l'on enferme un·e étudiant·e — c'est un curseur que tu ajustes selon sa réponse.</p>
<h4>Palier 1 — Universel</h4>
<p>L'enseignement régulier offert à l'ensemble du groupe. C'est le palier le plus large et le plus important. Quand il fonctionne bien, 80\u00a0% ou plus des étudiant·es progressent correctement sans intervention supplémentaire.</p>
<h4>Palier 2 — Préventif</h4>
<p>Intervention ciblée pour les étudiant·es qui montrent des signes de difficulté émergente. Travail en sous-groupe sur des composantes précises (par exemple un critère récurrent en défi). Durée limitée, objectif clair, mesure de la réponse.</p>
<h4>Palier 3 — Intensif</h4>
<p>Intervention individualisée pour les étudiant·es dont la difficulté persiste malgré le palier 2. Plus de temps, plus de fréquence, plus de personnalisation. C'est rare et coûteux en ressources — à utiliser pour les cas où c'est nécessaire – et à répartir dans une équipe intégrée.</p>
<div class="guide-pedagogique-astuce"><strong>Principe contre-intuitif</strong> : si plus de 20\u00a0% de tes étudiant·es sont en difficulté, c'est ton <em>palier 1</em> qu'il faut renforcer en premier, pas multiplier les interventions de palier 2 ou 3. Quand l'enseignement universel échoue à grande échelle, intensifier individuellement masque le vrai problème.</div>
<p>Dans Labo Codex, l'app suggère un niveau d'intervention d'après la performance P, quand la note existe, et d'après le pattern des derniers artefacts (l'indice de persistance, lui, nomme la cible de l'intervention), mais c'est <strong>toi qui décides</strong>. L'app éclaire, tu juges.</p>`
                },
                {
                    titre: 'La RàI en pratique dans Labo Codex',
                    contenu: `
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
<div class="guide-pedagogique-astuce">La RàI n'est pas un système qui te dit quoi faire. C'est un système qui t'aide à voir ce qui se passe pour mieux décider. Si l'app te suggère un palier 3 pour un·e étudiant·e mais que ton jugement professionnel te dit autre chose, fais confiance à ton jugement — et utilise les données pour expliquer ta décision à toi-même et aux autres intervenants.</div>`
                }
            ]
        },
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
<p>Tu évalues par <strong>niveaux de maîtrise</strong> (par exemple l'échelle IDME : Incomplet, Développement, Maîtrise, Étendu). La note est construite à partir de la démonstration de compétence, pas d'une moyenne. C'est la transposition, au collégial, de ce que le Conseil supérieur de l'éducation décrit comme le <em>bulletin descriptif</em> : «&nbsp;l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères et correspond à des niveaux de maîtrise.&nbsp;» En anglais : <em>Standards-Based Grading</em>.</p>
<h4>PAN-Spécifications (code SPE)</h4>
<p>Chaque travail est jugé <strong>conforme ou non conforme</strong> à des spécifications définies d'avance ; la note finale dépend du nombre de spécifications réussies (les «&nbsp;forfaits&nbsp;»). Le Conseil note d'ailleurs que la communication d'une évaluation certificative «&nbsp;peut également prendre une forme dichotomique : succès ou échec&nbsp;». En anglais : <em>Specifications Grading</em>.</p>
<h4>Sommative (code SOM) – le point de contraste</h4>
<p>La sommative classique calcule une moyenne pondérée. <strong>Ce n'est pas une PAN</strong> : c'est la pratique traditionnelle, celle dont le cumul de points est interrogé par le Conseil. Labo Codex la conserve parce qu'elle reste la pratique officielle dans bien des contextes et qu'elle facilite la transition. (Le guide <strong>« Comprendre sa pratique sommative »</strong> lui est consacré.)</p>
<div class="guide-pedagogique-astuce">Le choix entre Standards et Spécifications n'a pas à être tranché tout de suite, ni de façon définitive : commence par une pratique, sur une partie de ton cours, et ajuste.</div>`
                },
                {
                    titre: 'La dénotation : une PRÉN',
                    contenu: `
<p>La troisième voie documentée par la recherche est la <strong>dénotation</strong> (ou <em>ungrading</em>) – une PRÉN. Plutôt que de noter chaque travail, l'enseignant·e mise sur la <strong>rétroaction qualitative</strong> et des <strong>cibles d'apprentissage</strong>, et n'établit une note certificative qu'à la fin. <strong>Ce n'est jamais «&nbsp;pas de note&nbsp;»</strong> : le règlement exige toujours une note finale ; c'est le rôle de <em>tri</em> de la note qui est abandonné, pas la certification.</p>
<div class="guide-pedagogique-astuce"><strong>Statut dans Labo Codex.</strong> La dénotation est disponible&nbsp;: l'assistant de création la propose, et le jugement sur chaque cible se saisit dans le profil de l'élève.</div>
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
        }
    };

    /* ── État interne ─────────────────────────────────────── */
    var _guideActuel = null;
    var _pageCourante = 0;
    var _focusAvantOuverture = null;

    /* ── Ouverture ────────────────────────────────────────── */
    function ouvrirGuidePedagogique(idGuide) {
        var guide = GUIDES_PEDAGOGIQUES[idGuide];
        if (!guide) {
            console.warn('[guides-pedagogiques] Guide inconnu : ' + idGuide);
            return;
        }
        var panel = document.getElementById('guide-pedagogique-panel');
        if (!panel) {
            console.error('[guides-pedagogiques] Panneau #guide-pedagogique-panel introuvable');
            return;
        }

        // Si un guide est déjà ouvert, le fermer proprement d'abord
        if (_guideActuel) fermerGuidePedagogique();

        // Découvrabilité (juin 2026) : un guide peut être déclenché depuis une
        // popup d'aide ou une fiche de glossaire, dont l'overlay est au-dessus
        // du panneau (z-index). Fermer ces surfaces d'aide d'abord pour que le
        // guide reste visible.
        if (window.accompagnement) {
            if (typeof window.accompagnement.fermerAide === 'function') window.accompagnement.fermerAide();
            if (typeof window.accompagnement.fermerPopupPrimo === 'function') window.accompagnement.fermerPopupPrimo();
            if (typeof window.accompagnement.fermerMicroPopup === 'function') window.accompagnement.fermerMicroPopup();
        }

        _guideActuel = idGuide;
        _pageCourante = 0;
        _focusAvantOuverture = document.activeElement;

        // Classe d'accent optionnelle par guide (guide-solo, guide-acp, guide-rai)
        panel.className = guide.cssPrefix;

        construirePanneau(panel, guide);
        panel.style.display = '';
        rendrePage(panel, guide);

        // Accessibilité SPA : déplacer le focus vers le titre
        var titre = panel.querySelector('.guide-pedagogique-titre');
        if (titre) titre.focus();

        document.addEventListener('keydown', _surClavier);
        // Différer pour ne pas capter le clic d'ouverture lui-même
        setTimeout(function() {
            document.addEventListener('mousedown', _surClicExterieur);
        }, 0);
    }

    /* ── Construction du panneau (une fois par ouverture) ─── */
    function construirePanneau(panel, guide) {
        panel.innerHTML =
            '<div class="guide-pedagogique-contenu" role="dialog" aria-labelledby="guide-pedagogique-titre-texte">' +
                '<div class="guide-pedagogique-header">' +
                    '<div>' +
                        '<div class="guide-pedagogique-surtitre"></div>' +
                        '<h3 class="guide-pedagogique-titre" id="guide-pedagogique-titre-texte" tabindex="-1" aria-live="polite"></h3>' +
                    '</div>' +
                    '<button class="guide-pedagogique-fermer" title="Fermer le guide" aria-label="Fermer le guide">' +
                        '<img src="icons/icon-close-window.svg" alt="" class="modal-close-icon">' +
                    '</button>' +
                '</div>' +
                '<div class="guide-pedagogique-corps"></div>' +
                '<div class="guide-pedagogique-nav">' +
                    '<button class="guide-pedagogique-prec" aria-label="Page précédente">&larr;</button>' +
                    '<div class="guide-pedagogique-dots" role="group" aria-label="Pages du guide"></div>' +
                    '<button class="guide-pedagogique-suiv" aria-label="Page suivante">&rarr;</button>' +
                '</div>' +
                '<div class="guide-pedagogique-page-num"></div>' +
            '</div>';

        panel.querySelector('.guide-pedagogique-surtitre').textContent = guide.titre;

        panel.querySelector('.guide-pedagogique-fermer').addEventListener('click', fermerGuidePedagogique);

        panel.querySelector('.guide-pedagogique-prec').addEventListener('click', function() {
            if (_pageCourante > 0) {
                _pageCourante--;
                rendrePage(panel, guide);
            }
        });

        panel.querySelector('.guide-pedagogique-suiv').addEventListener('click', function() {
            if (_pageCourante < guide.pages.length - 1) {
                _pageCourante++;
                rendrePage(panel, guide);
            } else {
                fermerGuidePedagogique();
            }
        });

        var dots = panel.querySelector('.guide-pedagogique-dots');
        for (var i = 0; i < guide.pages.length; i++) {
            var dot = document.createElement('button');
            dot.className = 'guide-pedagogique-dot';
            dot.dataset.page = i;
            dot.title = 'Page ' + (i + 1);
            dot.setAttribute('aria-label', 'Page ' + (i + 1) + ' : ' + guide.pages[i].titre);
            dot.addEventListener('click', function() {
                _pageCourante = parseInt(this.dataset.page, 10);
                rendrePage(panel, guide);
            });
            dots.appendChild(dot);
        }
    }

    /* ── Rendu d'une page ─────────────────────────────────── */
    function rendrePage(panel, guide) {
        var page = guide.pages[_pageCourante];
        if (!page) return;

        panel.querySelector('.guide-pedagogique-titre').textContent = page.titre;
        // Contenu statique défini dans ce fichier — innerHTML sûr (aucune donnée utilisateur)
        panel.querySelector('.guide-pedagogique-corps').innerHTML = page.contenu;
        panel.querySelector('.guide-pedagogique-corps').scrollTop = 0;
        panel.querySelector('.guide-pedagogique-page-num').textContent =
            'Page ' + (_pageCourante + 1) + ' / ' + guide.pages.length;

        var btnPrec = panel.querySelector('.guide-pedagogique-prec');
        var btnSuiv = panel.querySelector('.guide-pedagogique-suiv');
        btnPrec.disabled = _pageCourante === 0;
        if (_pageCourante === guide.pages.length - 1) {
            btnSuiv.textContent = 'Terminer';
            btnSuiv.setAttribute('aria-label', 'Terminer et fermer le guide');
        } else {
            btnSuiv.innerHTML = '&rarr;';
            btnSuiv.setAttribute('aria-label', 'Page suivante');
        }

        var dots = panel.querySelectorAll('.guide-pedagogique-dot');
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('actif', i === _pageCourante);
        }
    }

    /* ── Fermeture ────────────────────────────────────────── */
    function fermerGuidePedagogique() {
        var panel = document.getElementById('guide-pedagogique-panel');
        if (!panel) return;

        document.removeEventListener('keydown', _surClavier);
        document.removeEventListener('mousedown', _surClicExterieur);

        panel.innerHTML = '';
        panel.style.display = 'none';
        panel.className = '';
        _guideActuel = null;
        _pageCourante = 0;

        // Restaurer le focus sur l'élément déclencheur
        if (_focusAvantOuverture && typeof _focusAvantOuverture.focus === 'function'
            && document.contains(_focusAvantOuverture)) {
            _focusAvantOuverture.focus();
        }
        _focusAvantOuverture = null;
    }

    /* ── Écouteurs globaux (actifs seulement guide ouvert) ── */
    function _surClavier(e) {
        if (!_guideActuel) return;
        if (e.key === 'Escape') {
            fermerGuidePedagogique();
            return;
        }
        // Ne pas détourner les flèches dans les champs de saisie
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;

        var panel = document.getElementById('guide-pedagogique-panel');
        var guide = GUIDES_PEDAGOGIQUES[_guideActuel];
        if (!panel || !guide) return;

        if (e.key === 'ArrowLeft' && _pageCourante > 0) {
            _pageCourante--;
            rendrePage(panel, guide);
        } else if (e.key === 'ArrowRight' && _pageCourante < guide.pages.length - 1) {
            _pageCourante++;
            rendrePage(panel, guide);
        }
    }

    function _surClicExterieur(e) {
        var panel = document.getElementById('guide-pedagogique-panel');
        if (!panel || panel.contains(e.target)) return;
        // Laisser le dispatcher gérer un clic sur un autre bouton d'ouverture
        if (e.target.closest && e.target.closest('[data-action="ouvrirGuidePedagogique"]')) return;
        fermerGuidePedagogique();
    }

    /* ── API publique (dispatcher data-action de main.js) ─── */
    window.ouvrirGuidePedagogique = ouvrirGuidePedagogique;
    window.fermerGuidePedagogique = fermerGuidePedagogique;

})();
