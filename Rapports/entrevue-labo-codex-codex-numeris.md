# Bâtir avec l'IA un outil qui doit lui survivre

### Entretien avec Grégoire Bédard sur Labo Codex, le tableur devenu instrument de suivi des apprentissages

*Professeur de littérature au Cégep de Drummondville, Grégoire Bédard n'a aucune formation
en programmation. En deux ans, il a pourtant transformé un tableur de classe en une
application de 137 000 lignes, codée en dialoguant en français avec une intelligence
artificielle. Mais l'histoire n'est pas celle qu'on croit : ce n'est pas le récit d'une
conversion à l'IA. C'est celui d'un enseignant qui s'est servi de l'IA pour bâtir un outil
où il n'y en a aucune – parce qu'il doute qu'elle dure. Conversation sur l'apprentissage qui
ne tient pas en ligne droite, sur le « sol invisible » qu'un cours de première session
travaille, et sur ce que ça veut dire, aujourd'hui, de se servir d'une machine sans en
dépendre.*

---

> **Note de travail (à retirer avant publication).** Cette version est un *montage fidèle à
> l'oral* : transcription nettoyée, répétitions retirées, corrections de noms appliquées
> (Gemini, Sonnet 3.5, VS Code, Claude Code, ELLAC, SOLO, RàI, audit, niveau M…), mais la
> voix et les formulations restent les tiennes. Quatre passages – signalés par un encadré
> ⚠️ – n'ont **pas** été dits à l'oral : je les ai reconstitués à partir de l'ensemble de
> l'entretien pour que la pièce soit complète. Ce sont ceux à relire en priorité et à
> réécrire dans ta voix. Deux points mineurs restent à confirmer : tes élèves « de 101 »
> (et non 201) pour la boucle longitudinale, et « crise de la mémoire » = pénurie de puces.

---

## I. Avant le code : un cours, des élèves, et une question sur la note

**Reprenons au commencement. Labo Codex naît d'un tableur. Mais le tableur, lui, naît de
quoi ?**

D'un cours que je n'avais pas donné depuis plus de dix ans. À l'hiver 2024, j'apprends, un
mois et demi avant le début de la session, que je vais redonner *Écriture et littérature* –
le 101, le premier cours de la séquence de littérature au cégep. Normalement il se donne à
l'automne. Là, je l'avais à l'hiver, donc à des étudiants hors séquence : ceux qui le
suivent à l'hiver, c'est souvent parce qu'ils ont connu un accident de parcours – un échec,
un cours de renforcement en français, un abandon, un décrochage, quelque chose dans leur vie
qui a fait qu'ils ne sont pas dans le rythme normal. Des élèves qui, en général, ont plus de
difficultés, sont moins engagés.

J'ai regardé mon plan de cours d'il y a dix ans, mes lectures, ma façon de faire travailler
les élèves, et je me suis dit : ça ne marchera pas. Si j'enseigne comme en 2014, je vais les
perdre. Il faut absolument que j'actualise mon approche.

**Tu actualises comment ?**

Je me suis formé rapidement à un cadre disciplinaire qui s'appelle ELLAC – l'enseignement de
la lecture littéraire au collégial –, le fruit d'une recherche récente sur justement les
cours de la séquence. Et je voulais garder ce que j'avais déjà expérimenté en enseignement
explicite dans le cours de littérature québécoise, le 103 : modélisation, pratique guidée,
pratique autonome. La pratique guidée, surtout, je voyais qu'elle avait un potentiel énorme
pour l'apprentissage.

Mais ce qui m'occupait vraiment, c'était la note. Qu'est-ce qu'une note ? Qu'est-ce que ça
représente ? Qu'est-ce que ça signifie, un point, quand on évalue par points ? Et surtout :
est-ce qu'il y a moyen de *voir* où s'en va un élève avant que la note soit produite ? Cet
hiver-là, je lis une chronique sur les pratiques alternatives de notation – Bruno Voisard,
Caroline Cormier, François-Hubert Arsenault [*noms à confirmer*]. Ça ouvre des fenêtres dans
ma tête. Au colloque de l'AQPC, j'assiste à la conférence de Robert Talbert, coauteur de
*Grading for Growth*. Et là je décide de faire le saut.

**Concrètement, qu'est-ce qui change dans ta façon de noter ?**

Je me suis dit : il y a sûrement des choses, en classe, que je peux observer de façon assez
objective. La présence. La complétion des travaux. En même temps, je change ma manière
d'évaluer les textes : au lieu d'une grille analytique – introduction, sujet amené, sujet
posé, sujet divisé… –, je passe à une grille plus holistique, et j'applique la taxonomie
SOLO. C'est une échelle qui décrit la *structure* de ce qu'un élève comprend : est-ce qu'on
est devant un élément isolé (unistructurel), plusieurs éléments juxtaposés (multistructurel),
des éléments mis en relation (relationnel), ou une compréhension qu'il est capable d'étendre
à un autre contexte (l'abstraction étendue) ? Mes critères ont changé, mon échelle de
performance a changé.

Et là je constate quelque chose. Entre l'assiduité, la complétion et la performance, il y a
des corrélations fortes. Un élève qui manque des cours, qui ne fait pas ses travaux, ça se
voit dans sa performance. Alors je commence à m'en servir comme de leviers : je permets de
reprendre un cours manqué dans une autre de mes classes, de remettre un travail en retard
pour faire remonter la complétion. Et je vois, en cours de session, la performance augmenter
et le risque d'échec, élevé au départ, redescendre. Tout ça, je le garde dans un tableur
Numbers, avec des formules simples – j'additionne, je compare, je soustrais – pour
interpréter qualitativement des chiffres.

**Et ces chiffres, ils deviennent quoi ?**

Je découvre un peu plus tard que ce que je manipule, ce sont des micro-données : des
informations attachées à des individus, qui me permettent de suivre un parcours, de voir
apparaître des patterns. Je m'éloigne de la note sommative en ajoutant de la souplesse – je
prends les meilleurs résultats plutôt que tous, je mets de côté les maladresses du début, je
tiens compte de l'apprentissage dans la construction de la note. Et dans mon tableur, je
compare les deux systèmes, sommatif et alternatif. Je vois déjà que le sommatif crée une
sorte d'inertie : la note ne représente pas vraiment l'apprentissage, qui est beaucoup plus
dynamique, beaucoup moins linéaire qu'on le croit.

Pour empêcher les élèves d'additionner des points, j'ai fini par ne plus leur donner de
chiffres du tout : un code de 0 à 4, correspondant à un niveau cognitif de SOLO, puis des
lettres – IDME – pour nommer les niveaux. Ce n'est pas une somme de points, c'est une
codification de la complexification du raisonnement que je vois chez l'élève. Ça a changé la
donne : ils se sont mis à viser la maîtrise des critères plutôt qu'un nombre de points
minimal. Mon tableur, lui, est devenu une console, un tableau de bord.

---

## II. La rencontre avec l'IA : d'abord lire, ensuite bâtir

**On en arrive à l'intelligence artificielle. Quand entre-t-elle dans l'histoire ?**

Plus tôt qu'on ne le pense. Dès l'hiver 2024, j'utilise Gemini pour m'aider à créer des
formules dans le tableur et à traduire mes données quantitatives en quelque chose de
lisible, de qualitatif. Ce n'est pas l'IA qui construit un outil : c'est l'IA qui m'aide à
*lire*. Puis Claude arrive, à l'été. Et quand j'analyse mes données avec lui, je vois des
choses que je ne voyais pas à l'œil nu : des blocages sur certains critères, des critères
dont la maîtrise est préalable à d'autres. Je réalise qu'à l'intérieur même de mes critères
il y a une hiérarchie SOLO – pas seulement dans l'échelle de performance, mais dans la
structure des critères eux-mêmes.

L'objectif, ce n'est jamais de prédire qui va réussir ou échouer. C'est d'infléchir des
parcours par mes interventions. L'IA me donne à voir une situation présente, des tendances ;
elle ne me donne pas un oracle.

**Et le passage à l'application ?**

C'est août 2025. J'avais pris congé l'hiver, je travaillais sur mon blogue, sur Codex
Numeris. Et là je reprends le tableur et je commence à le transposer. Je travaille avec
Sonnet 3.5 ; Claude me transmet du code JavaScript, que je colle dans VS Code, patch par
patch. Ce que je monte d'abord, c'est la structure de navigation. J'avais en tête la logique
de mon tableur : une donnée n'est entrée qu'à un seul endroit, puis copiée, transformée
ailleurs, mais il y a toujours une source unique. Cette structure-là, je l'ai apprise comme
une façon de travailler – ça s'appelle le *Single Source of Truth*, la source unique de
vérité. Je ne connaissais pas le nom, mais c'était déjà ma pratique dans le tableur : on
n'entre jamais la même donnée à deux endroits, pour ne pas créer de conflit, pour qu'il n'y
ait pas de contradiction dans le traitement de l'information.

Très vite, j'atteins des limites. La fenêtre de contexte de l'IA n'arrivait plus à lire tout
mon fichier, devenu trop gros. Claude me propose alors de découper l'application en modules
– des fichiers JavaScript responsables chacun d'une tâche. On crée 14 modules : les
présences, les étudiants, le calcul des indices… En octobre, je passe à Claude Code, avec
GitHub. Là, l'outil a accès à l'ensemble de l'application, il peut lire ce dont il a besoin,
on s'ajuste. C'est comme ça que j'ai appris à bâtir une architecture modulaire sur une base
SSOT – en construisant l'application sur mes besoins réels, avec les vraies notes de mes
élèves.

**« Programmer en langage naturel » : qu'est-ce que tu as réellement dû apprendre ?**

Pas à coder. Je ne suis pas un codeur ; je ne peux pas écrire une ligne et te dire à quoi
elle sert. J'ai appris à *nommer* très précisément ma façon de fonctionner, à nommer des
concepts importants, la relation entre eux, et à décrire tout ça dans des textes qui
serviraient de référence à Claude. Je n'ai pas vraiment développé le « prompting » – sauf
pour des cartouches de rétroaction. Ce que j'ai développé, c'est une banque de connaissances :
des documents de référence qui sont devenus le contexte dans lequel l'IA travaille. Quand
Cowork est arrivé en janvier, tous ces documents montés à l'automne me permettaient de dire
à l'IA précisément dans quel contexte elle travaillait, pourquoi, comment. Et l'écriture de
ces textes me servait à moi aussi : ça clarifiait ma propre pensée.

Sont apparues ensuite des fonctionnalités – la mémoire, puis les skills, un protocole de
lecture en début de session. Un skill, c'est un comportement spécialisé que l'IA adopte dans
un contexte précis. J'y ai expliqué mon approche pédagogique, la pratique de notation, la
taxonomie SOLO, le cadre ELLAC ; j'ai fini par regrouper ça dans un document, « écosystème
classe ». J'ai aussi développé une façon de faire auto-vérifier le code. Claude apportait ses
connaissances de codeur ; moi, mon expérience métier. On a combiné nos façons de travailler.

**Alors, qui code ?**

C'est un travail de complémentarité, et la question ne me dérange pas. Je suis un concepteur,
un architecte. J'explique explicitement ce que je veux ; Claude le code ; je l'essaie ; on
modifie. Toujours pierre par pierre. Une fois que ça fonctionne, on bâtit dessus. Plus tard,
il a fallu refactoriser : les modules devenus trop gros, on les a redécoupés en
sous-modules. Mes 14 modules de départ sont devenus 140, toujours sur la même base SSOT.

Mais il faut être clair : la mémoire à long terme du projet, c'est moi. Claude, en janvier,
n'a aucun souvenir de ce qu'on a fait en novembre ; il ne sait pas où on s'en va en mars. La
vision de l'application, c'est moi qui l'apporte. Je suis le capitaine, j'oriente la
direction. Je crois que Claude n'aurait pas pu coder cette application tout seul. Je suis
toujours un peu surpris quand je lis Ethan Mollick raconter qu'avec un prompt de quelques
lignes, la machine travaille des heures et produit quelque chose de fonctionnel. Ce n'est
pas ma façon de faire. J'ai des besoins très précis, je sais ce que je veux, j'avance par
étapes : on bâtit, on vérifie, ça donne des idées, je revois l'interface parce que les idées
se transforment. Le visuel et la structure sont intimement liés.

**Il y a une difficulté que tu mentionnes, qui est presque philosophique : Claude « ne voit
rien ».**

Exactement. Quand je décris quelque chose, il faut toujours que je tienne compte qu'il n'a
pas de vision – je dois lui donner des repères intrinsèques à l'information. Lui est capable
de coder ce que je dis ; moi, de voir les résultats, de les interpréter, de me mettre dans la
peau d'un utilisateur qui découvre ces concepts. Et comme Claude est un peu néophyte, sa
façon de présenter les choses m'oriente parfois. Il y a là une corrélation créative
intéressante, avec une part d'aléatoire. C'est fâchant quand il ne respecte pas ce que je
demande – son petit côté créateur –, mais de ses erreurs surgissent parfois de belles
surprises.

**Et il y a une tension de fond, que tu as nommée presque en passant : tu construis une
pédagogie à contre-courant avec une machine entraînée sur le courant dominant.**

Oui, et c'est central. Claude est un grand modèle de langage : sa vision par défaut de la
note, de la performance, c'est la vision traditionnelle, sommative. Il faut constamment que
je le ramène. « Non, ce n'est pas une note chiffrée, c'est un code ; ce qui nous intéresse,
c'est ce qu'il y a derrière – la relation entre les niveaux SOLO, les sous-critères, les
échelles de performance. » J'ai toujours dû découper l'apprentissage et la note, parce que
Claude avait tendance à les coller ensemble, comme le fait notre culture en général. Quand il
faisait des implémentations, il penchait vers la courbe normale, la pratique moyenne. Il
fallait être vigilant, le ramener vers l'intention alternative. Je me suis rendu compte, au
fond, que je numérisais tout mon métier – la notation, la rétroaction, les bilans, le suivi –
qui était jusque-là éparpillé entre mon tableur, GoodNotes, Léa. J'apportais une expérience
que Claude n'avait pas. Lui rendait opérationnel, en code, ce que je formulais en français.

---

## III. L'objet et sa vision : travailler le sol invisible

**Venons-en à ce que l'outil donne à voir. Tu as une image pour ça.**

Quand je superpose toutes les courbes d'apprentissage de mes élèves, ce que je vois, c'est
beaucoup de bruit. Des parcours fragmentés, qui montent, descendent, remontent, redescendent.
La courbe ascendante régulière, elle, est exceptionnelle – c'est très rare qu'un élève passe
d'unistructurel à multistructurel, à relationnel, à l'abstraction étendue en quinze semaines.
Ce qui donne l'*illusion* d'un apprentissage linéaire, c'est la note sommative : les points
s'additionnent et dessinent une jolie courbe qui monte. Quand les notes ne s'additionnent pas,
quand chaque évaluation est prise pour ce qu'elle est, on voit la vérité : des crêtes, des
plateaux, des creux, et des trous là où les travaux n'ont pas été faits.

Ça me fait penser à un réseau mycorhizien. Sous le sol, il y a des filaments en trois
dimensions qui relient les champignons, comme une toile d'araignée souterraine. Ce que je
travaille en 101, je crois que c'est ce réseau-là : des montées, des descentes, des plateaux,
en profondeur, dans quelque chose d'invisible. Les fruits – les champignons à la surface, la
pensée critique, l'abstraction étendue – vont peut-être « pousser » dans mon cours, mais
souvent c'est plus tard, dans les cours suivants de la séquence. Ici, on travaille les
fondations, le réseau de connexions. Et l'application me permet de voir ce réseau – par les
couleurs, les courbes, les niveaux. Elle me permet d'intervenir dans ce qui était invisible.

**Du coup, les fameux indices – Apprentissage, Compétence, Progrès –, ils mesurent quoi ?**

C'est là qu'il y a eu un retournement. Au départ, c'étaient des intuitions autour de la note.
Puis je me suis rendu compte que l'assiduité et la complétion ne parlent pas de la
performance : elles parlent du *contexte* d'apprentissage. Elles me disent si ce contexte est
favorable ou défavorable. Et un contexte, je peux le favoriser – en facilitant la reprise des
travaux, la reprise des cours. La performance et les critères, eux, me disent où la maîtrise
est plus difficile. En croisant les deux – le contexte (les indices) et le développement des
habiletés (la structure SOLO) –, j'obtiens un dépistage. Ce dépistage débouche sur trois
niveaux d'intervention, ce qu'on appelle la réponse à l'intervention, la RàI.

**Décris ces trois niveaux.**

Le niveau 1, c'est la classe elle-même : mon enseignement explicite, la modélisation, la
pratique guidée – beaucoup, beaucoup de pratique guidée –, la pratique autonome. Le niveau 2,
c'est encore de la pratique guidée, mais plus individuelle, ou avec des sous-groupes qui
rencontrent des problèmes semblables. Le niveau 3, ce sont les interventions intensives, hors
classe, en tête-à-tête : là, comme expert de ma discipline, j'interviens plus précisément.
Parfois l'expert, c'est quelqu'un d'un centre d'aide en français, ou des services adaptés ;
l'idéal, c'est qu'on se concerte. Ce que l'application me permet, c'est de garder des traces
de ce que j'observe, évaluation après évaluation – des évaluations régulières, sous des formes
variées –, de les interpréter et d'agir. Je vois où sont les difficultés, les blocages, les
patterns. Et je ne les vois pas que dans la machine : je les vois aussi de mes yeux, sur la
copie de l'élève, dans la vraie classe.

**Il y a une fonction encore en exploration : les tampons que tu poses sur les copies.**

Oui, ce que j'appelle Repérage, Liaison, Ouverture – RLO. Quand j'évalue, je pose un tampon
pour me rappeler l'opération cognitive de l'élève. Quand il repère, identifie des idées, on
est à l'unistructurel ou au multistructurel. Quand il relie deux idées – qu'il compare, voit
ressemblances et différences –, on est au relationnel : c'est la liaison. Et l'ouverture,
c'est quand il devient capable d'appliquer à un autre contexte, une autre œuvre, d'étendre
dans l'abstraction les liens qu'il fait. Pour l'instant, je collecte ces observations
visuellement sur les documents. Je ne sais pas encore exactement comment je vais les traiter
– ça pourrait déboucher sur des rétroactions plus précises. C'est une fonction vivante, pas
aboutie.

**Question difficile, alors : si les fruits ne poussent que dans les cours suivants – que tu
ne donnes pas toujours –, comment sais-tu que tu as réussi ?**

C'est la vraie question, et j'ai voulu y répondre autrement que par la foi. J'ai demandé à
mes élèves la permission d'accéder à leurs résultats dans les cours suivants – le 102, le 103.
J'ai eu l'idée tard, à l'automne 2024, et je l'ai fait plus systématiquement à l'automne 2025.
Pour la première cohorte, une quinzaine d'élèves sur une quarantaine ont accepté – environ
25 %. Après l'avoir analysé avec Claude, j'ai conclu que l'échantillon était représentatif :
pas par programme ou par genre, mais par diversité de parcours, d'implication, d'engagement.
Et ce que j'ai vu, c'est que tous les élèves sortis du 101 au niveau M – le niveau Maîtrise,
qui une fois transposé en chiffre donne autour de 75 – ont réussi le 102.

Pour moi, c'est une indication de la solidité du travail fait avant : l'apprentissage maîtrisé
en 101 dure en 102. Mais je reste prudent. L'échantillon est petit. Je devrais avoir les
résultats de l'hiver 2026 dans quelques jours, sur un échantillon un peu plus large. Dans les
corridors, quand des étudiants passent au département, on me dit qu'ils ont eu une base solide
en 101, avec la méthode explicite, le dépistage, une rétroaction actionnable. Les résultats
semblent au rendez-vous. Mais ça reste à démontrer.

---

## IV. La discipline du bâtisseur : généraliser, auditer, lancer

**Pour que d'autres que toi l'utilisent, il fallait que l'outil cesse d'être « le tien ».**

C'est le nœud. Ce que j'expérimente dans ma discipline doit être transposable à d'autres
disciplines, avec d'autres approches que la mienne. Ce qui était codé en dur *pour moi* doit
devenir une simple option pour l'utilisateur, pas un parcours obligé. Il y a donc une double
vigilance : non seulement Claude doit sortir des sentiers battus dans sa vision de la note,
mais moi je dois vérifier, par en arrière, que je n'ai pas figé mes propres critères, ma
propre échelle, ma propre pratique. C'est là que je m'appuie sur de la documentation externe,
pour mettre en place des pratiques que je n'utilise pas moi-même. Et c'est là que les retours
d'utilisateurs seraient utiles – sauf que je n'en ai pratiquement pas eu, à part quelques
signalements de bugs ou d'interface confuse. Tout a été fait sur ma pratique, puis généralisé,
rendu abstrait avec Claude pour inclure d'autres pratiques.

**Et ça mène à l'audit.**

Généraliser, ça demande des tests dans le code, éliminer le code mort, vérifier la validité
des fonctions, des variables, s'assurer que les modules tiennent. Ça impliquait un audit très
complexe, que je n'avais jamais fait de ma vie. J'ai fait confiance à Claude : « Comment fait-
on un audit professionnel ? Quelles sont les conditions ? Je veux voir si mon code est
solide, si l'application est pérenne, si d'autres pourraient la reprendre. » On l'a construit
ensemble, mené intensivement en mai. Puis il a fallu corriger : refactoriser, revoir la
logique de certaines parties, éliminer les conflits, les bugs.

**Pourquoi cette intensité en mai précisément ?**

À cause du 3 juin. La présentation publique, en soi, je pouvais la faire avec des captures
d'écran – je n'avais pas besoin que l'application tourne sous les yeux des participants.
J'expliquais mes observations, ce que j'avais appris. Mais le 3 juin, c'était aussi le
lancement de la bêta publique. Et là, des utilisateurs allaient pouvoir entrer leurs vraies
données dans la machine. Il fallait que ça fonctionne – pas une question d'apparence, une
question de structure. C'est pour ça que mai a été trois semaines très, très intenses.
Certaines choses, comme l'assistant de configuration des pratiques de notation, je n'ai pas
eu le temps de les livrer avant ; je les ai livrées après. Ce n'est pas grave. Lentement,
l'application est sortie, et quelques utilisateurs commencent à l'explorer.

**Il faut être honnête sur un point : jusqu'ici, le seul vrai utilisateur, c'est toi.**

C'est vrai. Pendant longtemps, ce que je proposais aux collègues, ce n'était pas une bêta,
c'était une alpha : ça fonctionnait pour moi, c'était codé pour moi, et les autres ne
pouvaient pas vraiment s'en servir. Une cinquantaine de personnes ont eu un accès à un moment
ou un autre ; personne n'est revenu. C'est une fragilité que je n'essaie pas de cacher : je
suis à la fois l'unique constructeur et l'unique personne qui détecte les bugs. L'audit me
l'a renvoyé en pleine figure – c'est dur, recevoir un diagnostic sévère sur une chose qu'on a
bâtie seul. Mais c'est précisément pour ça que j'ai fait le travail de maintenabilité : pour
qu'un autre puisse, un jour, reprendre l'outil. Seul, oui. Mais documenté au point d'être
reprenable.

---

## V. Le pari : se servir de l'IA sans en dépendre

**On arrive au paradoxe central. Tu as construit cet outil avec l'IA. Et il n'y a aucune IA
dedans. Pourquoi ?**

Parce que je ne suis pas certain de la pérennité de l'intelligence artificielle. Il y a
quelque chose de non durable là-dedans, et ça tient à deux ordres de raisons. D'abord le
financier : on voit des investissements massifs, des milliards. Pour qu'ils rapportent, il
faut une puissance que les entreprises ne sont pas en mesure de fournir pour l'instant ; une
crise de la mémoire – la pénurie de puces – vient ralentir le développement des outils. Rien
ne garantit que les rendements seront là dans un ou deux ans. Ça nous met dans une situation
précaire.

Ensuite le physique. Les centres de données produisent énormément de chaleur, qu'il faut
refroidir à l'eau, dans un environnement qui se réchauffe lui-même. Les matériaux pour
fabriquer ces machines sont de plus en plus rares. On n'est pas loin d'une crise énergétique :
si on s'appuie sur le fossile, on n'arrivera pas à combler les besoins ; si on se tourne vers
le solaire, il faut des surfaces énormes et une efficacité qu'on n'a pas encore. À mon avis,
ces signaux annoncent un plateau dans le développement de l'IA, peut-être des
dysfonctionnements, des systèmes plus fragiles.

Alors il faut être résilient. Il faut que nos outils continuent de fonctionner même si le
nuage lâche. C'est pour ça que l'application est locale, hors ligne, sans IA. L'intelligence
artificielle a été la sage-femme de l'outil ; elle n'en est pas la béquille. L'outil doit
pouvoir lui survivre.

> ⚠️ **Passage reconstitué – à valider et réécrire dans ta voix.** *Les questions de l'Acte V
> ci-dessous (le parallèle outil/jugement, la licence, le message aux collègues, l'horizon de
> dix ans) n'ont pas été abordées à l'oral. Je les ai reconstituées à partir de l'ensemble de
> l'entretien. À relire en priorité.*

**Il y a un écho troublant dans ton histoire. L'IA t'a outillé sans décider à ta place – tu
gardais le jugement. Et l'outil que tu as bâti fait exactement ça pour l'enseignant : il
signale, il rend visible, mais c'est l'humain qui juge. Hasard ?**

Je ne crois pas que ce soit un hasard, mais je me méfie d'un parallèle trop propre. C'est
vrai que je suis resté le capitaine avec l'IA, et que l'outil, lui aussi, ne fait que
signaler : il ne diagnostique pas, il n'additionne pas un verdict. Dans les deux cas, la
décision reste humaine. Mais il faut ajouter une chose, sinon on raconte une histoire trop
lisse : l'IA n'était pas un outil neutre. Elle avait une pente – vers la note chiffrée, vers
la moyenne – contre laquelle j'ai dû lutter en permanence. Le rapport entre l'outil et le
jugement, ce n'est pas seulement déléguer une exécution ; c'est aussi résister à ce que
l'outil voudrait te faire faire. Et c'est exactement ce que je demande à un enseignant devant
Labo Codex : ne pas se laisser conduire par le tableau de bord. Le tableau de bord informe ;
il ne pilote pas.

**Tu mets l'outil sous licence libre. Qu'espères-tu qu'on en fasse – et qu'est-ce qui
t'inquiéterait ?**

J'espère qu'un autre enseignant se l'approprie, l'adapte à sa discipline, à sa pratique –
même si elle n'est pas la mienne. Qu'il devienne un bien commun, reprenable, modifiable. Ce
qui m'inquiéterait, c'est qu'on retourne l'outil contre son intention. Un instrument qui
repère les difficultés peut très vite devenir un instrument de surveillance ou de tri – pour
classer les élèves, les pénaliser, plutôt que pour les accompagner plus tôt. Le dépistage
n'a de sens que comme un signal qui appelle une intervention. Le jour où il sert à produire
un verdict, on a trahi ce que l'outil est censé porter.

**Beaucoup d'enseignants regardent l'IA avec méfiance. Que dirais-tu à un collègue qui hésite
à s'en approcher ?**

Que je partage sa méfiance – c'est précisément pour ça que j'ai bâti un outil sans IA,
hors ligne, qui ne dépend de personne. Le but n'est pas d'adopter l'IA comme un maître, mais
de s'en servir lucidement, et de façon bornée. Pars d'un vrai problème pédagogique, pas de la
technologie. Garde ton jugement : l'IA exécute, c'est toi qui décides. Et accepte qu'elle te
résiste, qu'elle te ramène vers la norme – ta vigilance fait partie du travail. On peut se
servir d'une machine sans lui confier les clés.

**Dans dix ans, qu'est-ce qui te rendrait fier – et qu'est-ce qui te ferait dire que tu
t'étais trompé ?**

Fier, si l'outil a survécu à l'engouement pour l'IA – s'il fonctionne encore, localement,
quand le reste se sera peut-être fragilisé. Fier si le pari longitudinal tient : que
l'apprentissage maîtrisé dure vraiment, plus loin dans la séquence, et pas seulement dans mon
petit échantillon. Fier si d'autres enseignants se le sont approprié, l'ont transformé pour
des pratiques que je n'avais pas imaginées.

Trompé, si l'outil n'a jamais réussi à sortir de ma propre pratique – si, malgré ma vigilance,
j'avais codé en dur ma façon de faire et que personne d'autre n'a pu l'habiter. Trompé si le
dépistage a glissé vers la surveillance. Et trompé, aussi, si mon pari sur la fragilité de
l'IA était naïf – si elle a tenu, duré, et que mon obsession du hors-ligne n'aura été qu'une
friction inutile. Je préfère cette dernière erreur aux autres. Mais aucune ne me semble
impossible, et c'est très bien de les garder en vue.

---

*Labo Codex est développé par Grégoire Bédard, professeur de littérature au Cégep de
Drummondville. Application 100 % hors ligne, sans compte, sans serveur, sur MacBook et iPad.
Codée avec Claude (Anthropic). Bêta publique depuis le 3 juin 2026.*

---

### Notes de montage (à retirer avant publication)

- **Épine dorsale (durabilité, trois échelles)** assumée par la structure : l'apprentissage
  qui dure (III, le réseau mycorhizien + la preuve longitudinale), le code qui dure (IV,
  audit / zéro-dette), l'outil qui survit à l'IA (V). Le titre et le chapeau l'annoncent.
- **Quatre réponses reconstituées** (encadré ⚠️ en V) : à réécrire en priorité. Le reste
  est tiré mot à mot de tes transcriptions, nettoyé.
- **À confirmer** : noms Voisard / Cormier / Arsenault ; « élèves de 101 » (vs 201) ; « crise
  de la mémoire » = pénurie de puces.
- **Vulgarisation** : SOLO, ELLAC, A-C-P, RàI, RLO, SSOT, niveau M, micro-données sont tous
  glosés à leur première occurrence. Vérifier que ça reste fluide à la relecture à voix haute.
- **Cadrage épistémique (partie V)** : la thèse sur la fragilité de l'IA est présentée comme
  ton pari raisonné. Si tu veux des chiffres à jour (eau / énergie / minéraux / mémoire), je
  peux les vérifier et ajouter 2-3 données sourcées sans alourdir.
- **Longueur** : version intégrale fidèle à l'oral. Une version resserrée (~2000 mots) pour
  publication directe est faisable en un passage si tu la veux.
- **Titres alternatifs** : « Travailler le sol » · « La sage-femme et la béquille » · « Un
  outil qui doit survivre à l'IA qui l'a fait naître » · « Le tableau de bord ne pilote pas ».
