Pour Claude Code (session du cloud), à relayer : le lot « Je regarde » d'« Évaluer une première production ».

BRANCHE. Crée `lot/je-regarde-evaluer` depuis `origin/claude/ecstatic-brown-urn6v8` (= `76192ab` : le moteur des parcours et le modèle de « Recevoir », retouches du 18 nov. comprises). PR en brouillon, aperçu Netlify. Ne touche pas à `claude/ecstatic-brown-urn6v8` : sa porte attend Grégoire sur l'aperçu n° 28. Le commit `4c36db4` (parcours rouverts, branche seulement) vient avec : il reste à défaire avant toute fusion. Si une autre session travaille dans ton arbre, prends un arbre à part.

PREMIER COMMIT. Copie cette consigne telle quelle dans `plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md`, et les deux textes de la section E dans `plans de travail/materiel-evaluer/` sous leurs noms (`cartouche-strategies-de-lecture.txt`, `grille-autoevaluation-strategies-de-lecture.txt`). Ce sont des textes de Grégoire : aucune retouche.

A. LE MODÈLE CHANGE D'ORDRE (`js/parcours-evaluer.js`, la partie « Je regarde » : `ETAPES_MODELE`, `TEXTES_M`, `MOTS_M`). Dix étapes, dans l'ordre décidé par Grégoire le 15 nov. et revu avec lui le 18 nov. :
1. Ta pratique de notation : Conception › Pratiques, puis le premier écran de l'assistant (« Comment veux-tu créer ta pratique ? »).
2. Un modèle : « Choisis un modèle », puis le récapitulatif. La personne touche elle-même « N meilleures évaluations », « Suivant → », « Créer la pratique » (pas de « Remplir » dans l'assistant).
3. Une échelle de performance : la question de l'échelle à l'adoption ; « IDME et niv 0 », « Adopter ».
4. L'appliquer à ton cours : l'étape s'ouvre en haut de l'onglet « Pratiques », la personne choisit la pratique dans le menu, défile jusqu'au pied de la fiche et touche « Appliquer au cours actif ».
5. Ta grille : Mon matériel ; trois temps dans une même étape (étiqueter, lire, créer).
6. Ta cartouche : Conception › Cartouches ; « + Nouvelle cartouche », « Remplir », « Créer la cartouche ».
7. Ta production : Conception › Productions ; « + Nouvelle production », le menu « Type » ouvert par la personne, « Remplir », « Créer la production ».
8. Tes consignes : les blocs de consignes de la même fiche ; « Remplir », puis « Consignes transmises ».
9. Évaluer : Évaluation › Liste ; « Actions › Évaluer » sur la ligne de Yack Amical (DA 9900007) ; les quatre critères avant le verrou ; « Un mot pour ton étudiant·e » ; « Verrouiller ».
10. Le point qui s'allume : Suivi › Groupe, bande « Performance (P) » ; la fin, trois boutons de même poids : « Le refaire avec ma classe », « Voir le parcours suivant » (le « Je regarde » de « Recevoir »), « Terminer ».
Une bulle par écran : quand un geste change l'écran, la bulle devient la suivante (les « Une fois…, la bulle devient » de la section D). Chaque étape s'ouvre sur la section ou l'onglet qu'elle nomme, la page défilant jusqu'à elle. Disparaissent du modèle : le détour par « Holistique » (les quatre menus « Type ») ; les bulles « Pourquoi étiqueter », « Tu apprends aussi », « Ta grille est créée » ; le retour en arrière pour choisir la cartouche. « Nous faisons » (la Pratique guidée) ne change pas dans ce lot.

B. CE QUE LE MODÈLE PRODUIT NE CHANGE PAS, parce que le modèle de « Recevoir » en dépend : la production « Appliquer des stratégies de lecture variées (Deux-Rives) » avec sa grille, son échelle et sa cartouche ; l'évaluation de Yack Amical (M, D, D, D ; « Bon départ ! ») ; la pratique « N meilleures évaluations » appliquée au cours du deuxième groupe ; l'échelle « IDME et niv 0 ». Le refus du panneau sans deuxième groupe reste. Rejoue les bancs de « Recevoir » après tes changements.

C. LE MATÉRIEL DE L'EXEMPLE (`MATERIEL`) :
1. La grille s'appelle « Grille générale à 4 critères » (au lieu de « G4H Sans français ») ; sa description et ses quatre critères (définitions, pondérations 20, 30, 15 et 35 %) ne changent pas. Renomme partout où le matériel la nomme (autres modèles, bancs, sentinelles).
2. Elle n'a ni points ni niveaux : la lecture de « Mon matériel » doit la tenir pour jugée par niveaux, avec l'échelle choisie à l'étape 3, sans créer une deuxième échelle ni demander « Ce que vaut chaque niveau ». Mesure d'abord ce que fait la lecture aujourd'hui d'une grille sans points ni niveaux. Si le changer pour tous déborde le lot, borne-le au modèle et dis-le.
3. L'étiquetage, quatre étiquettes : Titre, Critère, Description, Pondération. La rangée de « Structure » guidée, une étiquette à la fois, chaque geste confirmé par la phrase donnée en D ; chaque ligne de la bulle se grise d'un crochet quand son geste est fait. Puis « Rigueur », seule : mêmes confirmations, adaptées (« C'est ça : « Rigueur » est un critère, un aspect de la production que tu regardes pour la juger. » ; sa pondération est 30 %). Puis le choix : finir « Plausibilité » et « Nuance », ou le bouton « Voir la suite de l'exemple » (décidé le 14 nov., absent de la branche : à coder), qui étiquette le reste. « Créer ma grille » n'arrive qu'une fois toutes les rangées étiquetées (le 15 nov., la grille se créait après un seul critère).
4. La cartouche : ses vingt commentaires deviennent ceux du fichier `cartouche-strategies-de-lecture.txt` (section E), tels quels (le niveau 0 dit maintenant « L'évaluation n'est pas possible. ») ; son nom est celui de la production.
5. Les consignes de la production : l'objectif, la tâche et le détail du matériel actuel ; plus un bloc libre (« + Nouveau champ ») intitulé « Grille d'autoévaluation », dont le contenu est le fichier `grille-autoevaluation-strategies-de-lecture.txt` (section E) sans sa première ligne (le titre). Le PDF des consignes porte déjà les blocs libres (#499, #500) : vérifie que celui-ci y entre. Sa mise en forme (une rangée par critère, des cases à cocher) n'est pas de ce lot : inscris-la.
6. La date d'échéance : mardi 9 septembre 2025.

D. LES TEXTES DES BULLES, MOT POUR MOT (validés par Grégoire le 18 nov., de 7 h 39 à 12 h 32). Le gras (**…**) marque la consigne du geste ; « → » introduit la phrase qui confirme le geste ; « (en petit, gris) » est une ligne en petit, grise. La fin (bulle 10) suit la forme de « Découvrir » : « Objectif atteint… » en gras entre deux filets.

### Bulle 1 · « Ta pratique de notation » · 1 sur 10

À la fin de ce parcours, tu seras en mesure d'expliquer comment une production s'évalue dans l'application, de la pratique de notation à la rétroaction.

Tu es dans « Conception », à l'onglet « Pratiques » : c'est là que tu dis comment se construit la note de ton cours.

Dans la démo, tu évalues une première production de ton deuxième groupe, avec le matériel de l'exemple. Rien ne touche à tes données.

– Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation sommative, qu'on appelle aussi cumulative
– Ici, le mot ne parle pas du moment de l'évaluation (en fin d'apprentissage, par opposition à formative) mais de la façon dont la note se construit : en faisant la « somme » des résultats aux productions antérieures, ou le « cumul » de leurs points
– Il en existe d'autres, dites alternatives. L'exemple en prend une : la note s'y construit à partir de niveaux de maîtrise plutôt que de points
– Ta pratique, c'est l'ensemble des règles que l'application suivra pour établir la note de l'étudiant·e
– **Touche « + Nouvelle pratique »**

(en petit, gris) Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.

Une fois l'assistant ouvert, la bulle devient :

C'est fait : l'assistant de configuration est ouvert.

– Un assistant te pose quelques questions (un écran à la fois) et construit ta pratique avec tes réponses
– « Partir d'un modèle » : tu adoptes une pratique toute prête, que tu pourras ajuster ensuite
– « Décrire ma pratique » : tu réponds à des questions sur ta façon de noter et l'assistant trouve la pratique qui te correspond
– **Touche « Partir d'un modèle », puis « Suivant → »**

### Bulle 2 · « Un modèle » · 2 sur 10

C'est fait : tu es à l'écran « Choisis un modèle ».

– Chaque carte est une pratique toute prête, décrite en une ligne
– Le code à côté du nom dit sa famille : SOM pour la sommative, STD pour les standards ; les autres codes désignent d'autres pratiques alternatives
– L'exemple prend « N meilleures évaluations », par standards : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10
– Avec ta classe, tu choisiras la tienne, qu'elle soit traditionnelle ou alternative
– **Touche « N meilleures évaluations », puis « Suivant → »**

Une fois le récapitulatif ouvert, la bulle devient :

– Le récapitulatif dit sa famille et ce qu'elle fait : « PAN – Standards » (PAN : pratique alternative de notation)
– Son nom reste modifiable ; l'exemple le garde tel quel
– **Touche « Créer la pratique »**

### Bulle 3 · « Une échelle de performance » · 3 sur 10

C'est fait : l'assistant te demande une échelle.

– Par standards, tu ne comptes pas de points : tu situes ce que l'étudiant·e a réussi à un niveau
– L'échelle de performance nomme ces niveaux. Celle de l'exemple, « IDME et niv 0 », en a cinq : 0 « Aucun », I « Incomplet ou insuffisant », D « En développement », M « Maîtrisé », E « Étendu »
– Pour établir la note, l'application convertit ensuite chaque niveau en pourcentage (un M vaut 75 %)
– Tu retrouveras ces niveaux à chaque étape de ce parcours, jusqu'à l'évaluation
– **Choisis « IDME et niv 0 », puis touche « Adopter »**

### Bulle 4 · « L'appliquer à ton cours » · 4 sur 10

C'est fait : la pratique « N meilleures évaluations » est créée.

Tu es en haut de l'onglet « Pratiques ». Le cours actif est celui de l'en-tête : celui de ton deuxième groupe.

– Une pratique créée ne s'applique encore à aucun cours. Tu la prépares une fois ; elle peut resservir et se partager avec tes collègues
– Sans pratique appliquée, l'application ne calcule aucune note
– **Choisis « N meilleures évaluations » dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche**
– **Touche « Appliquer au cours actif »**

### Bulle 5 · « Ta grille » · 5 sur 10

C'est fait : la pratique s'applique au cours de ton deuxième groupe.

Tu es dans « Conception », à l'onglet « Mon matériel » : c'est là que tu apportes la grille que tu utilises déjà.

– Une grille réunit tes critères (ce que tu regardes dans une production) et ce que vaut chacun. Celle de l'exemple se juge par niveaux : ceux de l'échelle que tu viens de choisir
– Ici, tu numérises une grille que tu as déjà, faite dans un traitement de texte. Une photo n'en garderait que l'apparence : l'application doit savoir ce que chaque partie veut dire. C'est toi qui le lui dis, en posant une étiquette sur chaque partie
– Ce passage du document à l'application ne se fait qu'une fois. Ensuite, tu crées et modifies tes grilles directement dans l'application
– **Regarde la grille de l'exemple arriver : touche « Remplir »**

Une fois la grille collée, la bulle avance d'une étiquette à la fois :

– La grille de l'exemple est là, telle qu'elle était écrite dans un traitement de texte. La palette compte plusieurs étiquettes ; quatre suffisent pour celle-ci
– **Prends « Titre », puis touche le nom de la grille** → « C'est ça : « Grille générale à 4 critères » est son titre, le nom sous lequel tu la retrouveras. Tu le choisis librement. »
– **Prends « Critère », puis touche « Structure »** → « C'est ça : « Structure » est un critère, un aspect de la production que tu regardes pour la juger. »
– **Prends « Description », puis touche la phrase à côté de « Structure »** → « C'est ça : la description définit le critère. Elle dit ce que tu attends, quelle que soit la production. »
– **Prends « Pondération », puis touche « 20 % »** → « C'est ça : la pondération dit ce que pèse le critère dans le résultat de la production. »

Une fois la rangée de « Structure » étiquetée, la bulle devient :

– La rangée de « Structure » est faite
– **À toi : étiquette seul·e la rangée de « Rigueur »** (critère, description, pondération)

Une fois « Rigueur » étiquetée, la bulle devient :

– Avec ta propre grille, tu étiquetteras tout : l'application ne devine rien
– Ici, termine « Plausibilité » et « Nuance » si tu veux t'exercer encore, ou **touche « Voir la suite de l'exemple »** : elle est déjà préparée

Une fois toute la grille étiquetée, la page défile jusqu'à la lecture et la bulle devient :

– C'est la grille de l'exemple, refaite d'après ses étiquettes : compare-la à l'originale, plus haut
– Ce résumé dit ce que l'application y a trouvé : 4 critères, des pondérations qui font 100 %
– Elle ne porte pas de niveaux : chaque critère se jugera avec ceux de ton échelle, de 0 à E
– **Touche « Créer ma grille »**

### Bulle 6 · « Ta cartouche » · 6 sur 10

C'est fait : la « Grille générale à 4 critères » est créée.

Tu es dans « Conception », à l'onglet « Cartouches » : c'est là que tu prépares tes rétroactions.

– Une cartouche, ce sont les commentaires que tu écrirais dans la marge, préparés d'avance : un par critère et par niveau
– Ta grille vaut pour toutes tes productions ; une cartouche est propre à une production : elle dit ce qu'on observe à chaque niveau dans cette tâche
– Tu l'écris une fois. Ensuite, elle t'aide à juger, et chaque évaluation compose la rétroaction de l'étudiant·e avec tes phrases
– **Touche « + Nouvelle cartouche »**

Une fois la fiche ouverte, la bulle devient :

– **Regarde l'exemple se remplir : touche « Remplir »**

Une fois la fiche remplie, la bulle devient :

– Son nom : celui de la production qu'elle servira à évaluer (tu la décriras tout à l'heure)
– Sa grille (« Grille générale à 4 critères ») et son échelle (« IDME et niv 0 ») : chaque commentaire a sa case, à la rencontre d'un critère et d'un niveau
– Vingt commentaires : quatre critères, cinq niveaux. Lis celui de « Structure » au niveau M : sa première phrase décrit ce que tu observes, la suite dit à l'étudiant·e comment aller plus loin
– **Touche « Créer la cartouche »**

### Bulle 7 · « Ta production » · 7 sur 10

C'est fait : la cartouche est créée.

Tu es dans « Conception », à l'onglet « Productions » : c'est là que tu décris ce que tu demandes à tes étudiant·es.

– Une production, c'est tout ce que tu demandes de faire, formatif ou certificatif : un plan de rédaction, un exposé oral, un laboratoire, une mesure sur le terrain
– De ton côté, ce sont les consignes que tu donnes, la tâche que tu demandes d'effectuer et l'objectif qu'elle cherche à atteindre
– **Touche « + Nouvelle production »**

Une fois la fiche ouverte, la bulle devient :

– **Ouvre le menu « Type » et parcours-le** → « C'est ça : de l'examen au stage, chaque type est une production. »
– **Puis regarde l'exemple se remplir : touche « Remplir »**

Une fois la fiche remplie, la bulle devient :

– Son nom dit ce qu'elle fait faire. Il est repris dans « Activité d'apprentissage », que tes étudiant·es liront en tête de leur rétroaction
– Son type, « Artefact » : une pièce d'un portfolio, une pratique courante en littérature. Dans d'autres disciplines, tu nommeras tes productions autrement (laboratoire, examen, entrevue) ; ta pratique retiendra alors ses évaluations parmi elles
– Plus bas, ce que tu viens de préparer s'y rattache d'un coup : sa grille, son échelle et sa cartouche
– Les champs à astérisque rouge suffisent pour la créer ; plus tu en remplis, plus ce que l'application te rend est précis
– **Touche « Créer la production »**

### Bulle 8 · « Tes consignes » · 8 sur 10

C'est fait : la production est créée.

Tu es plus bas dans sa fiche, aux consignes : ce que tes étudiant·es doivent savoir pour réussir.

– **Regarde l'exemple se remplir : touche « Remplir »**

Une fois les consignes remplies, la bulle devient :

– L'objectif : ce que la production cherche à développer
– La tâche, en une phrase : c'est la consigne du travail. Puis son détail, pas à pas
– Ta grille d'autoévaluation, dans un bloc à part : pour chaque critère, les deux seuils de cette tâche, la réussite (D) et la maîtrise (M). Ta grille dit ce que tu attends en général ; les seuils le précisent pour cette tâche
– Avec ta classe, « Préparer le PDF » en tire une feuille à remettre : tes étudiant·es savent d'avance ce que tu attends et peuvent vérifier leur travail avant de le remettre
– La date d'échéance : le mardi 9 septembre 2025, une séance du groupe
– **Coche « Consignes transmises »** (la production entre alors au calendrier du groupe)

### Bulle 9 · « Évaluer » · 9 sur 10

C'est fait : les consignes sont transmises.

Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois chaque production de ton groupe, une ligne par étudiant·e.

– La production de Yack Amical est sur papier : rien à importer. Pour un exposé ou une entrevue, c'est pareil : tu évalues depuis sa ligne
– **Sur la ligne de Yack Amical, touche « Actions › Évaluer »**

Une fois l'écran d'évaluation ouvert, la bulle devient :

– La grille, l'échelle et la cartouche sont déjà là : elles viennent de la production
– Pour chaque critère, choisis un niveau : son commentaire de la cartouche paraît aussitôt dans la rétroaction
– Compare-le à la copie. S'il ne lui ressemble pas, essaie le niveau voisin : c'est la cartouche qui t'aide à juger
– **Choisis un niveau pour chacun des quatre critères** (suggestion pour suivre l'exemple : M, D, D, D)

Une fois les quatre niveaux donnés, la bulle devient :

– La note de la copie se calcule à mesure, d'après les niveaux et les pondérations
– La rétroaction réunit tes quatre commentaires : c'est ce que Yack Amical lira
– **Dans « Un mot pour ton étudiant·e », écris « Bon départ ! »** (il s'imprime sur son PDF, après son niveau)
– **Touche le cadenas « Verrouiller »** : l'évaluation est terminée et ne bougera plus par mégarde ; tu pourras la rouvrir au besoin

### Bulle 10 · « Le point qui s'allume » · 10 sur 10

C'est fait : l'évaluation de Yack Amical est verrouillée.

Tu es dans « Suivi », à l'onglet « Groupe » : c'est là que tu vois ta classe d'un coup d'œil.

– Dans la bande « Performance (P) », Yack Amical a maintenant son point. Les autres apparaîtront à mesure que tu évalueras leur production
– Évaluation après évaluation, l'application garde ses niveaux, critère par critère : c'est ainsi qu'elle pourra nommer son défi
– (entre deux filets, en gras) **Objectif atteint : tu es en mesure d'expliquer comment une production s'évalue dans l'application, de la pratique de notation à la rétroaction.**
– Chaque parcours a son objectif. C'est toi qui choisis la suite
– Pour revoir une étape, touche « 10 sur 10 »

Trois boutons de même poids : « Le refaire avec ma classe », « Voir le parcours suivant », « Terminer ».

E. LE MATÉRIEL DE GRÉGOIRE, MOT POUR MOT (son dossier « Cartouches de rétroaction A26 11 (18 novembre) », refait le 18 nov.). Chaque fichier est entre ses deux lignes de tirets, qui n'en font pas partie.

Fichier `cartouche-strategies-de-lecture.txt` :
----- DÉBUT DU FICHIER -----
## STRUCTURE
**STRUCTURE (0)** : L'évaluation n'est pas possible.
**STRUCTURE (I)** : Il est possible que les stratégies appliquées ne soient pas nommées, ou que l'on ne puisse pas dire de quelle stratégie relèvent la plupart des annotations. Sans ce rattachement, les traces seront difficiles à réutiliser pour la carte mentale. Pour atteindre le seuil, écris le nom de chaque stratégie en haut de la page et choisis un moyen de distinguer ses annotations des autres (une couleur, un symbole, une marge). L'important est qu'on sache d'où vient chaque annotation.
**STRUCTURE (D)** : Les stratégies appliquées sont nommées, et pour la majorité des annotations, on peut dire de quelle stratégie elles relèvent. Le rattachement reste toutefois incomplet : certaines annotations ne renvoient à aucune stratégie ou à aucun passage précis, ou le moyen de les distinguer change d'une page à l'autre. Pour atteindre la maîtrise, reprends chaque annotation : de quelle stratégie vient-elle, sur quel passage porte-t-elle ? Garde le même moyen de les distinguer sur toutes les pages.
**STRUCTURE (M)** : Pour au moins quatre annotations sur cinq, on peut dire de quelle stratégie elles relèvent et sur quel passage elles portent. Le même moyen de les distinguer sert sur toutes les pages : on retrouve en quelques secondes ce qu'une stratégie a fait ressortir. Ces traces seront directement utilisables pour la carte mentale. Pour aller plus loin, regroupe tes annotations selon un principe qui t'appartient : par thème, par personnage, par question.
**STRUCTURE (E)** : Chaque annotation est rattachée à sa stratégie et à son passage, et les pages vont au-delà de ce qui était demandé. Elles proposent un principe d'organisation qui leur est propre : un index, une légende, un regroupement par thème ou par question que la consigne du travail ne prévoyait pas et qui fait voir le texte autrement. Ce choix personnel fait des pages annotées un outil de travail réutilisable pour l'analyse d'un autre texte.
## RIGUEUR
**RIGUEUR (0)** : L'évaluation n'est pas possible.
**RIGUEUR (I)** : Il est possible que moins de trois stratégies soient appliquées, ou que la plupart des annotations se limitent à un surlignement sans dire ce qui est repéré. Le matériau recueilli sera alors trop mince pour construire la carte mentale. Pour atteindre le seuil, applique au moins trois stratégies et, pour chaque élément relevé, écris quelques mots qui disent ce que tu as repéré. Un passage surligné sans annotation ne garde aucune trace de ta lecture.
**RIGUEUR (D)** : Au moins trois stratégies sont appliquées, et la majorité des annotations expriment une idée plutôt qu'un simple surlignement. L'application reste toutefois inégale : certaines parties du texte ne sont pas couvertes, ou certaines annotations restent vagues. Pour atteindre la maîtrise, mène chaque stratégie jusqu'au bout, du début à la fin du texte, et reprends les annotations vagues pour nommer avec précision ce qui est repéré. Une stratégie appliquée à moitié laissera des trous dans ta carte mentale.
**RIGUEUR (M)** : Chacune des stratégies est menée jusqu'au bout, sur l'ensemble du texte, et au moins quatre annotations sur cinq nomment avec précision ce qui est repéré. Le repérage est complet : il fournit une base solide pour la carte mentale. Pour aller plus loin, ne t'arrête pas à ce que la stratégie te fait chercher : note aussi ce qu'elle ne permet pas de saisir dans ce texte, ou essaie une stratégie que tu n'as pas encore pratiquée.
**RIGUEUR (E)** : Le repérage est complet et précis, et il dépasse l'application des stratégies telles qu'elles sont enseignées. Les pages montrent une stratégie adaptée au texte, combinée à une autre ou inventée pour saisir ce que les stratégies du manuel ne faisaient pas ressortir. Cet apport personnel montre que les stratégies sont assez maîtrisées pour être transformées, et qu'elles pourront servir devant un texte très différent.
## PLAUSIBILITÉ
**PLAUSIBILITÉ (0)** : L'évaluation n'est pas possible.
**PLAUSIBILITÉ (I)** : Il est possible que la HOC soit absente, qu'elle ne soit pas rédigée en une phrase complète, ou qu'elle ne se rattache à aucun thème que tes annotations font ressortir. L'interprétation ne repose alors pas encore sur ta lecture. Pour atteindre le seuil, relis tes annotations, dégage un thème qui revient, puis écris au bas de la page une HOC en une phrase complète qui s'appuie sur ce thème. À ce stade exploratoire, ajuster son hypothèse est normal.
**PLAUSIBILITÉ (D)** : Une HOC est écrite en une phrase complète et elle se rattache à un thème que les annotations font ressortir. Elle énonce toutefois un propos (ce que l'auteur ou l'autrice dit) plutôt qu'une intention d'écriture (ce qu'il ou elle cherche à faire), ou plusieurs annotations restent sans rapport avec elle. Pour atteindre la maîtrise, transforme ton propos en intention selon la structure du manuel (auteur ou autrice, verbe d'action, objet, angle) et vérifie que tes annotations mènent des passages aux thèmes, puis au propos, puis à la HOC.
**PLAUSIBILITÉ (M)** : La HOC est formulée comme une intention d'écriture, et l'on peut suivre dans les annotations le chemin qui y mène : des passages annotés aux thèmes, des thèmes au propos, du propos à la HOC. Les annotations sans rapport avec ce chemin restent l'exception. Cette hypothèse tient à ta lecture et servira de point de départ à la carte mentale. Pour aller plus loin, demande-toi jusqu'où ton hypothèse tient : y a-t-il un passage où elle cesse de tenir, ou d'autres passages de l'œuvre où elle vaudrait aussi ?
**PLAUSIBILITÉ (E)** : La HOC tient à la lecture. Les pages énoncent en outre la portée de l'hypothèse : elles nomment un passage où elle cesse de tenir, ou d'autres passages de l'œuvre où elle vaudrait aussi, et s'appuient sur le texte pour le montrer. Cette démarche dépasse ce que la consigne du travail demandait : elle traite l'hypothèse comme une idée dont on connaît les limites, ce qui se transfère à la lecture d'autres textes.
## NUANCE
**NUANCE (0)** : L'évaluation n'est pas possible.
**NUANCE (I)** : Il est possible que les annotations relèvent des éléments sans dire ce qu'ils révèlent : réactions spontanées, éléments évidents, repérages sans interprétation. La lecture reste alors à la surface du texte. Pour atteindre le seuil, choisis un élément que tu as repéré et écris ce qu'il révèle d'un thème ou du propos de l'auteur ou de l'autrice. Interpréter, c'est faire ce lien : un élément relevé ne dit rien tant qu'on n'a pas écrit ce qu'il laisse entendre.
**NUANCE (D)** : Au moins une annotation est interprétative : elle dit ce que l'élément repéré révèle d'un thème ou du propos, au lieu de seulement le relever. La lecture reste toutefois dans l'évidence, parce que les éléments repérés ne sont pas encore rapprochés les uns des autres. Pour atteindre la maîtrise, rapproche au moins deux fois deux éléments (deux passages, ou ce que deux stratégies ont fait ressortir) et écris dans la marge, au bout de ta flèche, ce que ce rapprochement révèle : une distinction, un point commun, une tension, une contradiction que tu expliques.
**NUANCE (M)** : Au moins deux annotations rapprochent deux éléments et disent ce que ce rapprochement révèle : une distinction entre deux éléments semblables, un point commun entre deux éléments différents, une tension ou une contradiction expliquée. La lecture dépasse l'évidence et fournit un matériau riche pour la carte mentale. Pour aller plus loin, demande-toi ce que cette lecture éclaire en dehors du texte : un autre texte, une autre situation.
**NUANCE (E)** : Les rapprochements entre les éléments repérés font voir les subtilités du texte, et les pages portent cette lecture au-delà de lui. Elles rapprochent ce qui a été dégagé d'un autre texte, d'une autre situation ou d'un autre contexte, et disent ce que ce rapprochement apporte à la compréhension de l'un et de l'autre. Cet apport original montre une lecture qui ne s'arrête pas au texte étudié et qui pourra nourrir d'autres analyses.
----- FIN DU FICHIER -----

Fichier `grille-autoevaluation-strategies-de-lecture.txt` :
----- DÉBUT DU FICHIER -----
Stratégies de lecture : grille d'autoévaluation

Étape 1 sur 4 : les idées naissent. Chaque stratégie te fait regarder le texte sous un angle précis ; tu notes ce que tu vois, et une première hypothèse apparaît.

Avant de remettre ton travail, coche ce que tu trouves dans ta copie. Le seuil de réussite correspond au niveau D de l'échelle ; le seuil de maîtrise, au niveau M. La question en italique t'aide à vérifier.

Structure

☐ Réussite : J'ai écrit le nom de chaque stratégie en haut de la page. Pour au moins trois annotations sur cinq, on peut dire de quelle stratégie elles relèvent.

☐ Maîtrise : Pour au moins quatre annotations sur cinq, on peut dire de quelle stratégie elles relèvent et sur quel passage elles portent. Mon moyen de les distinguer (couleur, symbole) reste le même sur toutes les pages.

Pour vérifier : pour chaque annotation, puis-je dire de quelle stratégie elle vient et sur quel passage elle porte ?

Rigueur

☐ Réussite : J'ai appliqué au moins trois stratégies. Au moins trois annotations sur cinq disent une idée, pas seulement un surlignement.

☐ Maîtrise : Chacune de mes stratégies est menée jusqu'au bout, du début à la fin du chapitre. Au moins quatre annotations sur cinq nomment avec précision ce que j'ai repéré.

Pour vérifier : chaque passage surligné porte-t-il quelques mots dans la marge ? Chaque stratégie couvre-t-elle tout le chapitre ?

Plausibilité

☐ Réussite : Ma HOC est écrite en une phrase complète et se rattache à un thème que mes annotations font ressortir.

☐ Maîtrise : Ma HOC est une intention d'écriture, et on peut suivre le chemin qui y mène : des passages annotés aux thèmes, des thèmes au propos, du propos à la HOC. Au moins quatre annotations sur cinq se rattachent à ce chemin.

Pour vérifier : ma HOC dit-elle ce que l'autrice cherche à faire, et pas seulement ce qu'elle dit ? Suit-elle la structure du manuel (l'autrice, un verbe d'action, un objet, un angle) ?

Nuance

☐ Réussite : Au moins une de mes annotations dit ce qu'un élément révèle d'un thème ou du propos, au lieu de seulement le relever.

☐ Maîtrise : Au moins deux de mes annotations rapprochent deux éléments (deux passages, ou ce que deux stratégies ont fait ressortir) et disent ce que ce rapprochement révèle : une distinction, un point commun, une tension ou une contradiction.

Pour vérifier : ai-je écrit ce que révèle chacun des liens que j'ai tracés ?
----- FIN DU FICHIER -----

F. BANCS ET PORTE. Un banc du modèle de bout en bout, portrait et paysage, avec son break-test ; la sentinelle des textes confrontée à la section D ; les bancs de « Recevoir » rejoués (il dépend de ce modèle) ; le confinement : après le modèle complet, aucune clé hors de la démo n'a changé. La porte en markdown dans `plans de travail/` (skill `portes-terrain`) ; Cowork publiera l'artefact. Aucun nom d'élève réel.

G. RAPPORT. `plans de travail/RAPPORT-2026-11-18-je-regarde-evaluer.md` : ce qui est fait, ce qui est mesuré, ce qui est supposé, ce qui n'est pas vérifié (Safari, l'iPad) ; pour chaque étape, l'écran, ce qui est pointé, le geste et ce qui fait avancer ; toute trouvaille avec l'une des trois issues. Pas de release.
