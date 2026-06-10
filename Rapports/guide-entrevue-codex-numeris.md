# Guide d'entrevue — Apprendre à bâtir avec l'IA

### Le développement de Labo Codex, raconté de l'intérieur

> **Format** : guide de questions. Les réponses sont les tiennes — ce document ne les
> contient pas, il les appelle.
> **Intervieweur** : journaliste pédagogique (curieux, informé, mais extérieur au projet).
> **Lectorat visé** : large — gens intéressés par l'IA et par l'éducation, sans expertise
> en programmation ni en évaluation. Le vocabulaire spécialisé (dépistage SOLO, indices
> A-C-P, RàI) doit être explicité en cours de route, jamais présupposé.
> **Destination** : future chronique de Codex Numeris.

---

## Comment utiliser ce guide

Cinq actes, du plus personnel au plus prospectif. Chaque question est suivie, en
italique, d'une *note d'intention* — ce que la question cherche à faire émerger — et,
souvent, d'une ou deux *relances* à dégainer si la réponse ouvre une piste.

Tu n'es pas obligé de répondre à tout, ni dans l'ordre. Le fil narratif compte plus que
l'exhaustivité : l'apprentissage personnel sert de colonne vertébrale, l'outil et la
vision pédagogique s'y greffent. Trois questions « pivots » (signalées par ✦) portent le
poids de la chronique ; si le temps manque, ce sont elles qu'il faut protéger.

Un avertissement épistémique, pour toi comme pour l'intervieweur : la tentation, dans ce
genre d'exercice, est de lisser le récit en une trajectoire héroïque (« j'ai osé, j'ai
appris, j'ai réussi »). Plusieurs questions sont écrites au contraire pour faire affleurer
les paradoxes — une pédagogie de l'attention humaine bâtie avec une machine, un outil
solitaire déployé publiquement, un signal qui pourrait virer en surveillance. Les garder
vivants vaut mieux qu'une synthèse propre.

---

## Acte I — Avant le code : un enseignant et un problème

*Objectif de l'acte : établir que Labo Codex ne naît pas d'un intérêt pour la technologie,
mais d'un problème pédagogique précis. Poser le « pourquoi » avant le « comment ».*

**1.** Avant d'être une application, Labo Codex était un tableur Numbers que tu tenais en
classe. Qu'est-ce que les outils habituels — le cahier de notes, le système institutionnel
— ne te permettaient pas de voir, et que tu voulais voir ?

> *Intention : ancrer le projet dans un manque concret. On veut la frustration originelle,
> pas la fonctionnalité.*
> *Relance : peux-tu donner un exemple d'un·e étudiant·e dont la progression t'aurait
> échappé avec les outils ordinaires ?*

**2.** Tu enseignes la littérature. Comment en arrive-t-on, depuis cette discipline, à
construire des « indices » de suivi et une taxonomie des apprentissages ? Qu'est-ce qui,
dans ta pratique d'enseignant de français, appelait cette formalisation ?

> *Intention : désamorcer l'idée que mesurer trahit forcément les humanités. Faire dire le
> lien entre lire/écrire et observer une progression.*

**3.** Tu as écrit deux articles dans *Pédagogie collégiale* avant l'application —
« L'enseignement explicite de la littératie », puis « Observer pour mieux accompagner ».
En quoi l'outil est-il le prolongement de ces textes plutôt qu'un projet à part ?

> *Intention : montrer une continuité intellectuelle. L'app comme thèse mise en code.*

**4.** Dans le tableur, il y avait déjà des choses qui sont devenues le cœur de Labo
Codex : une pratique alternative de notation, des jetons de reprise, la taxonomie SOLO
glissée dans l'échelle de performance. Pour quelqu'un qui n'a jamais vu ta classe :
qu'est-ce que ça change, concrètement, de noter ainsi plutôt que de mettre des notes sur
100 ?

> *Intention : première vulgarisation d'un concept-clé (la PAN). À garder très concret —
> le lecteur large décroche si on entre dans le jargon trop vite.*
> *Relance : un jeton de reprise, pour un parent ou un collègue sceptique, ça sert à quoi ?*

**5.** À quel moment as-tu senti que le tableur avait atteint ses limites — qu'il fallait
en sortir ?

> *Intention : la bascule motivationnelle vers le développement. Le seuil.*

---

## Acte II — La rencontre : deux manières de travailler avec l'IA ✦

*Objectif de l'acte : le cœur du récit d'apprentissage. Révisé après l'Acte I : la relation
avec l'IA ne commence pas en août 2025 avec l'application, mais dès 2024 avec la *lecture*
des données du tableur. Deux mouvements distincts, à ne pas confondre — l'IA qui aide à
voir (analyste), puis l'IA qui aide à bâtir (constructeur). Le récit doit faire sentir le
passage de l'un à l'autre, et ce qu'un enseignant sans formation en programmation a dû
apprendre pour en arriver à diriger la construction d'un logiciel de 137 000 lignes.*

**6.** Premier mouvement, 2024. Bien avant l'application, tu confies les données de ton
tableur à l'IA pour qu'elle les *analyse*. Qu'est-ce que tu lui demandais, au juste — et
qu'est-ce qu'elle t'a fait voir que tes propres colonnes de chiffres te cachaient ? Un
pattern concret, si tu en as un en tête.

> *Intention : établir que l'IA entre dans ta pratique comme lectrice de données avant
> d'être bâtisseuse d'outil. C'est la première brique du récit IA, et elle précède d'un an
> l'application. (Absorbe l'ancienne relance 3 de l'Acte I.)*

**7.** Deuxième mouvement, août 2025. La relation change de nature : tu cesses de demander à
l'IA de *lire* tes données pour lui demander de *construire* l'outil. Qu'est-ce qui t'a fait
franchir ce pas — toi qui n'avais jamais programmé ? Décris la toute première séance : à
quoi t'attendais-tu, qu'est-ce qui s'est passé ?

> *Intention : scène d'ouverture concrète du volet « construction ». On veut du sensoriel,
> et surtout le basculement d'un usage à l'autre — pas une abstraction sur « l'IA ».*

**8.** ✦ « Programmer en langage naturel » : la formule est séduisante, mais qu'est-ce que
ça veut dire dans les faits ? Qu'as-tu réellement dû apprendre — non pas la syntaxe d'un
langage, mais quoi ?

> *Intention : LA question pivot du récit d'apprentissage. On cherche le déplacement : on
> n'apprend pas à coder, on apprend à spécifier, à décomposer, à juger un résultat, à dire
> précisément ce qu'on veut. Le savoir-faire s'est déplacé, il n'a pas disparu.*
> *Relance : une compétence d'enseignant — décomposer une consigne, anticiper un
> malentendu — s'est-elle révélée transférable à ce dialogue avec la machine ?*

**9.** Qui « code », dans cette histoire ? Quand tu regardes les 137 000 lignes de Labo
Codex, à qui les attribues-tu – à toi, à l'IA, à un entre-deux ? Et est-ce que cette
question te dérange ou te paraît mal posée ?

> *Intention : faire nommer la nature de la coécriture, sans fausse modestie ni
> surévaluation. Inviter la nuance plutôt qu'une réponse tranchée.*

**10.** Deux scènes, si tu les as : une où l'IA t'a surpris en bien, en proposant ce que tu
n'aurais pas su demander ; une où ça a déraillé – du code faux, fragile, ou une direction
qu'il a fallu corriger. Et dans le second cas : comment as-tu su que c'était mauvais, sans
être programmeur ?

> *Intention : tenir les deux bords (partenaire / faillible) dans une même question. Le
> vrai gisement est la seconde scène : comment se forge un jugement technique chez un
> non-technicien — un acquis sous-estimé du parcours.*
> *Relance : à quoi reconnais-tu aujourd'hui un terrain glissant, un endroit où il ne faut
> pas faire confiance ?*

**11.** Tu as accordé ta confiance à l'IA de deux façons très différentes : lui confier les
*données* de tes étudiants pour qu'elle les lise, et lui confier le *code* qui fait tenir
l'outil. Est-ce que tu as fait confiance de la même manière dans les deux cas ? Les enjeux,
les risques, ta vigilance étaient-ils les mêmes ?

> *Intention : exploiter la structure à deux mouvements (analyste / constructeur) pour faire
> émerger une réflexion sur la confiance différenciée. Touche à l'éthique des données (élèves
> réels) autant qu'à la fiabilité technique. Question neuve, propre à ton parcours.*

**12.** Sur huit mois, l'application seule représente entre 500 et 660 heures de travail
réel, presque tous les jours, souvent avant l'aube. Qu'est-ce qui t'a tenu — fabriquais-tu
encore un outil, ou apprendre était-il devenu une fin en soi ? Et ta façon de te servir de
l'IA a-t-elle changé depuis août 2025 : plus exigeant, plus méfiant, plus ambitieux ?

> *Intention : clore l'acte sur la trajectoire (la dimension existentielle de
> l'apprentissage + la maturation de la relation). Ne pas romantiser la surcharge — laisser
> place à l'ambivalence. L'IA n'a pas tant changé que l'usage que tu en fais.*

---

## Acte III — L'objet : anatomie de Labo Codex

*Objectif de l'acte : faire comprendre ce qu'est l'outil et ce qu'il fait. C'est le volet
le plus « explicatif » — il faut vulgariser sans appauvrir. L'intervieweur joue ici le
candide qui demande « montre-moi ».*

**13.** Décris Labo Codex à quelqu'un qui ne l'a jamais vu, en une minute. Qu'est-ce que
l'enseignant y fait, du début à la fin d'un trimestre ?

> *Intention : vue d'ensemble accessible. Tout le reste de l'acte zoome ensuite.*

**14.** Au cœur de l'outil, il y a trois indices — Apprentissage, Compétence, Progrès. En
français simple : que mesurent-ils, et pourquoi trois plutôt qu'une seule note ?

> *Intention : vulgariser les indices A-C-P, fondation conceptuelle de l'app. Insister sur
> le « pourquoi trois » — c'est là qu'est la thèse pédagogique.*
> *Relance : un même étudiant peut-il être fort sur un indice et fragile sur un autre ?
> Qu'est-ce que ça t'apprend que la moyenne cachait ?*

**15.** Il y a une fonction qui « repère » automatiquement les étudiants en difficulté — le
dépistage SOLO. Comment ça marche, et surtout : où places-tu la frontière entre un outil
qui *signale* et un outil qui *diagnostique* ?

> *Intention : amener « un signal, pas un diagnostic ». Frontière éthique centrale. Prépare
> le terrain de la question 24 sur la surveillance.*

**16.** Tu as ajouté un module pour documenter les interventions — la « réponse à
l'intervention ». À quoi ça sert pour un enseignant : prouver quelque chose ? se souvenir ?
mieux aider ?

> *Intention : montrer la RàI comme outil professionnel. Laisser le triple usage coexister
> plutôt que choisir.*

**17.** Certaines fonctions portent des noms presque poétiques — les actions « Repérage,
Liaison, Ouverture », la « Dénotation », les « tampons cognitifs » qu'on pose sur une copie.
Choisis-en une et explique le geste pédagogique réel qu'elle outille.

> *Intention : rendre tangible une fonction par le geste de classe qu'elle prolonge. Le
> lecteur retient une image concrète.*

**18.** Labo Codex fonctionne entièrement hors-ligne, sans compte, sans serveur, et – c'est
le plus paradoxal – sans la moindre IA dedans, alors qu'il a été entièrement bâti avec
l'IA. Tu l'expliques par un doute sur la durabilité même de l'IA (précarité financière,
limites physiques d'énergie et de matériaux, plateau probable). Développe : pourquoi
l'outil doit-il pouvoir survivre à l'IA qui l'a fait naître ?

> *Intention : largement répondu à l'Acte V oral. L'architecture n'est pas qu'un geste de
> souveraineté des données (Loi 25, confiance) — c'est un pari de résilience. L'IA est la
> sage-femme de l'outil, pas sa béquille. Cadrer les raisons comme un pari raisonné, pas une
> prédiction acquise (distinguer faits / inférences / extrapolations). Pilier « durabilité »,
> échelle infrastructure.*

**19.** Tu répètes un principe : chaque donnée n'existe qu'à un seul endroit, « une seule
source de vérité ». Pour un non-informaticien, pourquoi est-ce que ça compte — qu'est-ce
que ça empêche d'arriver ?

> *Intention : vulgariser un principe d'architecture en montrant son enjeu concret (la
> cohérence, la confiance dans ce qu'on voit). À garder léger.*

---

## Acte IV — La discipline du bâtisseur

*Objectif de l'acte : le parcours d'apprentissage ne s'arrête pas à « faire marcher ». Il y
a eu une maturation vers le métier — qualité, dette technique, tests, audit. Montrer qu'un
enseignant a intériorisé une éthique d'ingénieur. Cet acte peut être condensé pour un
lectorat très large, mais il porte une part importante du « comment j'ai grandi ».*

**20.** Tu as adopté une règle que tu appelles « stabilité zéro-dette » : tout nouveau
chantier retire ce qu'il remplace, on n'empile pas. D'où t'est venue cette discipline —
d'une mauvaise expérience ? d'une intuition ? Et qu'est-ce qu'elle t'a coûté ?

> *Intention : montrer l'acquisition d'une valeur d'ingénierie. Le « qu'est-ce que ça
> coûte » évite l'autosatisfaction.*

**21.** En mai, tu as fait auditer l'application selon des standards professionnels
(sécurité, qualité du code, accessibilité). Le verdict était sévère par endroits — la santé
du code au rouge. Qu'est-ce que ça fait de recevoir un diagnostic dur sur une chose qu'on a
bâtie seul, et qu'as-tu fait de ce verdict ?

> *Intention : l'audit comme « diagnostic → thérapie ». Parallèle implicite avec le
> dépistage qu'il fait subir à ses étudiants — il s'applique à lui-même ce qu'il leur
> applique. À ne pas souligner trop lourdement ; laisser le lecteur le voir.*
> *Relance : y a-t-il un écho entre auditer son code et évaluer un apprentissage ?*

**22.** Aujourd'hui, près de 400 tests automatiques surveillent l'application : à chaque bug
corrigé, tu ajoutes une « sentinelle » qui empêche le problème de revenir. C'est une habitude
de programmeur chevronné. Comment un enseignant en est-il venu à penser comme ça ?

> *Intention : preuve concrète de la maturation. Le réflexe de la sentinelle est un acquis
> non trivial.*

**23.** ✦ Le 3 juin 2026, tu as lancé publiquement l'application au congrès de l'AQPC.
Mais les rapports sont francs : à ce jour, tu en es encore le seul véritable utilisateur —
tu es à la fois l'unique constructeur et l'unique personne qui détecte les bugs. Comment
vis-tu cette solitude, et est-ce une force, une fragilité, ou les deux ?

> *Intention : question pivot sur la lucidité. Les rapports insistent : « fork-friendly
> mais pas turn-key », le risque n'est plus la dette technique mais la bande passante d'une
> seule personne. On veut une réponse qui tient les deux bouts, pas un slogan rassurant.*
> *Relance : qu'est-ce qui se passerait pour Labo Codex si, demain, tu t'arrêtais ?*

---

## Acte V — La vision : quel futur de la pédagogie ?

*Objectif de l'acte : élever le propos. L'outil n'est pas une fin — il est porteur d'une
idée de ce que l'enseignement et l'évaluation pourraient devenir. C'est la raison d'être de
la chronique. Les questions invitent à formuler la thèse, et à en nommer aussi les limites.*

**24.** Tu as abandonné l'image de la « station météo », mais ce qu'elle voulait dire tient
encore : un outil qui *informe* le jugement sans le remplacer, qui *signale* sans *prédire*.
Tu l'as redit autrement à l'Acte II – « l'objectif, ce n'est pas de prédire qui va réussir
ou échouer, c'est d'infléchir des parcours par mes interventions ». Aujourd'hui, avec
quels mots à toi nommes-tu ce que l'outil doit faire – et, surtout, ce qu'il doit refuser
de faire ?

> *Intention : la métaphore est morte, l'éthos reste. S'appuyer sur ton vocabulaire vivant
> (les indices comme « signaux » auxquels on répond par des interventions ; le tableur
> devenu « console » / « tableau de bord » ; la classe comme « écosystème »). La frontière
> signaler / prédire est l'équivalent, côté développeur, du « signal, pas diagnostic » du
> dépistage SOLO (Q15) : c'est le même refus, à deux étages.*

**25.** ✦ Il y a un parallèle troublant dans ton histoire. L'IA t'a outillé sans décider à
ta place — tu gardais le jugement, elle exécutait. Et l'outil que tu as construit fait
exactement ça pour l'enseignant : il signale, il rend visible, mais c'est l'humain qui
juge. Est-ce un hasard, ou as-tu construit avec l'IA un outil qui *incarne* ta façon de
t'être servi de l'IA ?

> *Intention : LA question qui pourrait être le cœur de la chronique. Le rapport
> outil-jugement est le même à deux étages — développeur/IA et enseignant/outil. Si une
> seule idée doit rester au lecteur, c'est celle-là. Laisser Grégoire la valider, la nuancer
> ou la contester — surtout ne pas la lui imposer.*
> *Nuance apparue à l'Acte II : le parallèle n'est pas une symétrie propre. L'IA n'a pas
> neutralement outillé Grégoire — sa pente par défaut ramenait vers la pédagogie moyenne
> (note chiffrée, courbe normale) et il a dû résister. Le rapport outil/jugement comporte
> donc une lutte, pas seulement une délégation. À intégrer plutôt qu'à gommer — ça rend le
> fil rouge plus vrai. Prolongée en Q30.*

**26.** Le système actuel – la note sur 100, le bulletin – donne l'illusion d'un
apprentissage linéaire : les points s'additionnent, la courbe monte. Toi, quand les notes
ne s'additionnent pas, tu vois tout autre chose : des courbes pleines de creux, de
plateaux, de rechutes – « beaucoup de bruit ». Et tu en tires une image forte, le réseau
mycorhizien : tu travailles le sol invisible, et les fruits (la pensée critique,
l'abstraction étendue) ne « poussent » souvent que dans les cours suivants de la séquence.
Développe cette image pour un lecteur qui n'a jamais pensé l'apprentissage ainsi. Qu'est-ce
que Labo Codex rend visible que la note sur 100 efface ?

> *Intention : la thèse pédagogique frontale, désormais portée par TON image. Le réseau
> mycorhizien est la métaphore centrale de la chronique (il remplace définitivement la
> station météo). La non-linéarité de l'apprentissage est le cœur. Préserver le paradoxe :
> l'outil rend visible un travail dont le fruit est différé et, en partie, invisible — ne
> pas le résoudre, le tenir. Prolongé par la relance « succès différé » (voir notes).*

**27.** Tu mets l'outil sous licence libre, gratuit, réappropriable. Qu'espères-tu vraiment
qu'un autre enseignant en fasse ? Et qu'est-ce qui t'inquiéterait qu'on en fasse ?

> *Intention : ouverture + garde-fou. La crainte est aussi importante que l'espoir — un
> outil qui repère les difficultés peut devenir un outil de surveillance ou de tri. Inviter
> à nommer ce risque plutôt qu'à le taire.*

**28.** Beaucoup d'enseignants regardent l'IA avec méfiance — peur de la triche, de la
déqualification, du remplacement. Toi, tu t'en es servi pour fabriquer un instrument
profondément artisanal et humain. Qu'aurais-tu envie de dire à un collègue qui hésite à
s'en approcher ?

> *Intention : adresse directe au lectorat enseignant. Sans prosélytisme — fidèle à la
> nuance, reconnaître les craintes légitimes avant d'y répondre.*

**29.** Dans dix ans, qu'est-ce qui te rendrait fier d'avoir fait ça — et qu'est-ce qui te
ferait dire que tu t'étais trompé ?

> *Intention : question de clôture, ouverte sur le doute autant que sur l'espoir. Refuser
> la note finale triomphale.*

**30.** ✦ Tu construis une pédagogie à contre-courant – par standards, par codes, non
chiffrée – avec un outil entraîné sur le courant dominant, dont la pente naturelle ramène
toujours vers la note sur 100 et la courbe normale. Qu'est-ce que ça dit du futur de la
pédagogie à l'ère de l'IA, si les instruments qu'on nous met entre les mains portent en eux,
par défaut, l'orthodoxie qu'on cherche précisément à dépasser ? Comment un enseignant
garde-t-il sa ligne quand la machine, elle, « vote » pour la moyenne ?

> *Intention : second pilier candidat de la chronique, surgi de l'Acte II. Enjeu de fond :
> les LLM encodent une norme pédagogique ; innover suppose de résister à leur gravité. Tu
> l'as fait — donc c'est possible — mais la question est : à quel prix de vigilance, et
> qu'arrive-t-il à l'enseignant qui ne voit pas cette pente et la suit ? À tenir sans
> catastrophisme ni naïveté. Complète Q25 : le rapport outil/jugement inclut une lutte.*

**31.** ✦ Tu as bâti cet outil avec l'IA, et tu as délibérément refusé d'en mettre dedans –
parce que tu doutes de sa durabilité. C'est le geste qui résume peut-être toute ta posture :
te servir de l'IA sans en dépendre. Qu'est-ce que ça dit de la façon dont un enseignant – ou
n'importe qui – devrait se tenir face à l'IA aujourd'hui ?

> *Intention : pivot de clôture possible. Articule les trois piliers : l'IA outille sans
> décider (Q25), on résiste à sa pente (Q30), et au bout du compte on construit pour s'en
> passer (ici). C'est la maturité de la relation : ni rejet, ni dépendance — un usage lucide
> et borné. Pair naturel de Q18 (côté architecture) et Q28 (côté collègues méfiants).*

- **Colonne vertébrale proposée (à valider par Grégoire) — la DURABILITÉ, à trois échelles
  qui riment** : *l'apprentissage qui dure* (le niveau M tient en 102, contre l'illusion
  linéaire de la note — réseau mycorhizien) ; *le code qui dure* (zéro-dette, refactoring,
  audit, ~400 sentinelles) ; *l'outil qui survit à l'IA* (hors-ligne, sans serveur, sans IA,
  résilient à l'effondrement du cloud). C'est le candidat le plus profond pour la thèse.
- **Trois piliers, emboîtés dans la durabilité** :
  (1) *outil / jugement* — l'IA outille le développeur sans décider, l'outil outille
  l'enseignant sans diagnostiquer (Q8, Q15, Q24, Q25) ;
  (2) *résistance à la gravité de la norme* — pédagogie hétérodoxe avec un outil entraîné
  sur l'orthodoxe (Q30) ;
  (3) *se servir de l'IA sans en dépendre* — bâtir avec l'IA un outil sans IA (Q18, Q31).
  Les trois disent la même maturité : un usage lucide et borné, jamais une délégation.
- **Pivots à protéger** si l'entrevue doit être écourtée : Q8 (qu'apprend-on vraiment),
  Q23 (la solitude lucide), Q25 (le parallèle outil/jugement), Q30 (la résistance à la
  norme), Q31 (se servir de l'IA sans en dépendre).
- **Boucle de preuve longitudinale** (fin Acte III / Acte V) : consentement des élèves pour
  accéder à leurs notes en 102/103 ; 1re cohorte ≈25 % (15/40), jugée représentative par
  diversité de parcours ; tous les sortis au niveau M ont réussi le 102. À présenter au
  conditionnel — petit échantillon, données H2026 à venir, « reste à démontrer ». C'est la
  réponse rigoureuse et honnête au paradoxe du succès différé.
- **Couverture Acte IV** : largement répondu — la *généralisation* (sortir du « codé en dur
  pour moi » vers une option pour tout utilisateur, avec double vigilance : que Claude sorte
  de sa vision traditionnelle ET que Grégoire ne fige pas sa propre pratique) est le moteur
  qui a déclenché l'audit ; audit « jamais fait de ma vie », construit avec Claude, mené
  intensivement en mai ; pression réelle du 3 juin = non la présentation (captures d'écran
  suffisaient) mais la bêta publique (vraies données de tiers → ça devait tenir).
- **Garde-fou épistémique sur la thèse anti-IA (Acte V)** : les raisons du doute mêlent
  faits établis (eau/énergie des centres de données, capex), inférences (précarité
  financière, plateau) et extrapolations contestables (« crise énergétique certaine »,
  inefficacité du solaire, pénurie mémoire). À cadrer comme *pari raisonné*, pas prédiction.
  Substrat factuel vérifiable au montage si chiffres à jour souhaités.
- **Équilibre des actes** : I et II portent le récit personnel ; III est explicatif (à
  doser pour ne pas alourdir) ; IV est le plus technique (condensable) ; V porte la vision.
  Pour un lectorat large, viser ~20 % origine, ~30 % apprentissage/IA, ~20 % l'outil,
  ~10 % la discipline, ~20 % la vision.
- **Garde-fou épistémique** : plusieurs questions (10, 11, 20, 23, 27, 29) sont écrites pour
  empêcher le récit héroïque lisse. À conserver au montage — les aspérités sont ce qui rend
  un témoignage crédible.
- **Vulgarisation** : chaque terme spécialisé (PAN, SOLO, A-C-P, RàI, RLO, Dénotation, SSOT)
  devrait être expliqué à sa première occurrence dans le texte final. Le guide les introduit
  déjà une par une, jamais en bloc.
- **Ossature chronologique à confirmer** (Acte II) : Gemini d'abord (formules, hiver 2024),
  puis Claude (analyse, été 2024), tableur enrichi (automne 2024), pause (hiver 2025),
  transposition en application (août 2025, Sonnet 3.5 + VS Code), Claude Code + GitHub
  (octobre 2025, 14 modules → 140). Le « premier contact IA » de l'histoire est Gemini, pas
  Claude : à nommer correctement au montage.
- **Honnêteté du statut** (Acte II) : la version proposée aux collègues fin 2025 était
  *alpha*, pas bêta — « codée pour moi », inutilisable par d'autres. Cohérent avec l'audit
  (~50 accès, aucun retour). À garder : c'est une aspérité, pas un aveu gênant.
- **Image centrale de la chronique** (Acte III) : le *réseau mycorhizien*. L'enseignant
  travaille le sol invisible — montées, descentes, plateaux du réseau souterrain — et les
  fruits (pensée critique, abstraction étendue) n'émergent souvent qu'en aval de la
  séquence, dans des cours qu'il ne donne pas toujours. Remplace définitivement la station
  météo. Vivante, accessible, non jargonneuse : idéale pour le lectorat élargi. Porte un
  paradoxe à préserver — l'outil rend visible un travail dont le succès est différé et
  partiellement invisible (lien direct avec Q23 « seul à savoir si ça marche » et Q29).
- **Relance ouverte « succès différé »** (à placer en Acte V, près de Q26/Q29) : si les
  fruits n'apparaissent qu'en aval, comment Grégoire sait-il qu'il a réussi ? Position
  inconfortable, presque un acte de foi — à ne pas résoudre, à tenir comme tension féconde.
- **Couverture Acte III** : l'anatomie est largement répondue à travers le récit — indices
  A-C-P comme signaux de *contexte* (et non de performance), dépistage SOLO + RàI niveaux
  1-2-3, tampons RLO mappés sur SOLO (Repérage = uni/multistructurel, Liaison = relationnel,
  Ouverture = abstraction étendue). Restent à recueillir dans ta voix : Q13 (un résumé d'une
  minute, en clair, pour le lecteur néophyte — il manque encore une porte d'entrée simple),
  Q18 (hors-ligne / souveraineté des données — pourquoi), Q19 (SSOT en langage simple,
  partiellement fait à l'Acte II). RLO est encore en exploration assumée (« je verrai plus
  tard comment je traite ça ») — à présenter comme fonction vivante, pas aboutie.
