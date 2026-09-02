# Où en est-on ?

> **Ce fichier répond à une seule question : qu'est-ce qui marche, et qu'est-ce
> qui ne marche pas encore, pour quelqu'un qui utilise l'application ?**
>
> Il est écrit **sans numéros de fiche** et sans vocabulaire de chantier. Les
> numéros (`#612`, `#674`…) sont des étiquettes d'archivage, pas une échelle de
> progression : ils servent aux sessions, pas à Grégoire. Quand il en faut un
> pour retrouver le détail, il est entre parenthèses, en fin de ligne.
>
> **À lire au début de toute session, Cowork ou Claude Code**, avant `CLAUDE.md`
> et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, qui eux disent *comment*
> travailler. Celui-ci dit *où on en est*.
>
> **Mis à jour à la fin de chaque journée de travail.** Une ligne ne change
> d'état que si quelqu'un écrit **comment** il l'a vérifié.

**Dernière mise à jour : 1er septembre 2026, dans la nuit (huitième passe).**

---

## La règle de lecture

Quatre états. Le quatrième a été ajouté le 1er septembre au soir, parce que trois
mentaient dans les deux sens :

- **Fait** : vérifié, et la façon de le vérifier est écrite à côté. ↻ **Depuis le
  1er septembre, la phrase porte LA COMMANDE**, pas seulement la méthode (règle 1
  de `PROTOCOLE.md`) : « des tests » est invérifiable, une commande se rejoue.
- **Éprouvé par Grégoire** : il a parcouru l'écran lui-même, en écrivant ses
  chroniques Labo Codex, et ça marchait. C'est la meilleure preuve qui existe, et
  elle a une portée : c'est l'AUTEUR qui a mesuré, sur SES données et SES réglages.
  Ce qu'un débutant rencontre par un autre chemin reste à voir.
- **Pas fait** : on sait ce qui cloche, et c'est nommé.
- **Jamais vérifié** : personne n'a regardé. **Ce n'est pas « probablement
  correct ».** C'est la confusion qui a coûté le plus cher dans ce projet.

---

## Le compte du jour : 4 faits, 2 éprouvés par Grégoire, 3 pas faits, 0 jamais vérifié

---

## FAIT

### On sait par où les gens entrent — et il n'y a plus qu'une porte
L'application était servie à **deux** adresses `.netlify.app` en plus de la
sienne, complètes et sans aucune authentification. Netlify comptait ces
visiteurs, Cloudflare Access ne les voyait jamais : c'est tout l'écart entre
« 17 » et « 0 ». Les deux redirigent maintenant vers `app.codexnumeris.org`.
**Vérifié comment** : après déploiement, `curl -sI https://codexnumeris-051225.netlify.app/`
rend **301** et `location: https://app.codexnumeris.org/` ; idem sur
`main--codexnumeris-051225.netlify.app` ; `/index.html` conserve son chemin.
**Témoin** : `app.codexnumeris.org` rend toujours **403** (Cloudflare), donc la
porte principale n'a pas été cassée et il n'y a pas de boucle.
⚠ **Ce que ça ne règle pas** : on ne sait toujours pas COMBIEN ils sont, ni qui.
La redirection ferme la porte, elle ne compte pas rétroactivement.
⚠ **Et l'annonce n'atteint pas sa cible** : le changelog s'affiche dans
l'application, donc derrière la porte. Quelqu'un qui a un signet `.netlify.app`
verra l'écran de code AVANT de pouvoir le lire. Le doublage (courriel, blog)
reste à faire. *(geste de Grégoire)*

### Importer des productions, et savoir ce qui se passe quand ça rate
Un import lancé sans groupe-cours actif est refusé, et le refus est dit. Un
fichier dont le numéro d'élève n'existe pas dans le groupe apparaît maintenant
dans la liste au lieu de disparaître sans trace.
**Vérifié comment** : quatre tests automatiques qui rejouent les quatre cas, plus
une relecture du rendu à l'écran (les tests seuls ne voient pas les couleurs).
**Reste** : l'essai à la main de Grégoire, pour juger l'écran réel. *(#612)*

### Une grille partagée arrive complète chez le destinataire
Les sous-critères, leurs rétroactions et les réglages de projection voyagent
maintenant avec la grille. L'évaluation du destinataire ne bascule plus de mode
à son insu.
**Vérifié comment** : tests automatiques sur le transport —
`cd tests && npm run test:unit` (433 fichiers / 4638 tests, code 0). *(#669)*

### Le numéro de version affiché correspond au code qui tourne
Sans ça, aucun rapport de bug n'est interprétable, ni le sien ni celui d'un
utilisateur.
**Vérifié comment** : tests sur le bandeau de version, et les quatre points de
vérité mesurés PAR TÉMOIN à la release 1.107.0 —
`grep -rl 1.106.15 --include=*.js --include=*.json --include=*.html .` rend **0**,
comme `0901-1354` et `09011354`. ⚠ Le témoin dit aussi son périmètre : sur tout le
dépôt, `1.106.15` rend encore 3 fichiers de prose datée.
⚠ **Fragile** : ça se re-périme à chaque changement de version fait à la main.
⮕ Re-vérifié le 1er sept. au soir, après six commits `js/` livrés sans bump : la
ligne était re-périmée, la release 1.107.0 l'a remise à jour. *(#665)*

---

## PAS FAIT

### Une rétroaction ne parle que de la discipline de celui qui l'écrit
Un enseignant de chimie qui compte des erreurs voit encore « **Français écrit** »
imprimé dans le PDF remis à son élève. Le même mot est gravé dans les
identifiants de champs du volet confidentiel.
**C'est le prochain lot.** *(#581, #539)*

### Aucune note remise ne repose sur une pondération incomplète sans le dire
Un critère laissé sans niveau donne **0,0 %**, sans un mot, et ce zéro
s'enregistre comme une vraie note.
**Mesuré le 1er septembre en soirée**, avec un témoin qui isole la cause : ce
n'était plus un soupçon. *(#674)*

### Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve
Trois défauts ouverts sur les messages de suppression : ils annoncent des pertes
qui n'ont pas lieu, et taisent des survivances qui ont lieu.
**Attend une décision de Grégoire** : que doit emporter la suppression d'un
fichier ? *(#647, #648, #649)*

---

## ÉPROUVÉ PAR GRÉGOIRE

↻ **Corrigé le 1er septembre au soir.** Ces deux gestes étaient inscrits « jamais
vérifié ». C'était faux : Grégoire les a parcourus lui-même en écrivant les
chroniques Labo Codex, et il a vérifié à chaque fois que tout fonctionnait.
Le dépôt n'en portait aucune trace, et une session qui ne lit que le dépôt conclut
« personne n'a regardé ». **La trace manquait, pas la vérification.**

### Créer un trimestre, créer un groupe-cours, prendre les présences
**Éprouvé** par Grégoire, chronique 1.
**Ce qui reste sous cet écran** : des fenêtres d'alerte bloquantes sur ce parcours
exact. Il les a traversées sans être arrêté ; un débutant les lira autrement.
*(#678)*

### Créer une grille, une échelle, une cartouche
**Éprouvé** par Grégoire, chronique 2, avec SES grilles et SES échelles.
**Ce qui restait sous cet écran, et qu'il n'a pas pu rencontrer** : les huit
échelles « disciplinaires » de la bibliothèque (Chimie, Bio, Philo, Info, Géo…)
donnaient **zéro à la première évaluation, en silence**. Il ne s'en sert pas ; un
enseignant de chimie qui ouvrait la bibliothèque, lui, tombait dessus au premier
geste. *(mesuré le 1er septembre, plan du semis §1)*

↻ **Traité le 1er septembre en fin d'après-midi — et il faut lire ce que ça
couvre exactement.**
· ✅ **La source est tarie** : le versement des huit échelles est retiré, avec ses
  définitions et son appel. **Un nouvel enseignant ne les recevra jamais.**
· ✅ **L'échelle manquante est semée** : `ECHELLE_IDME_DEPART`, avec ses quatre
  `valeurCalcul`, modifiable et supprimable. Mesuré de bout en bout sous WebKit —
  espace vide, grille générique + échelle semée, « Maîtrisé » coché : **79,5 %,
  niveau M**. Le triptyque est complet et il calcule.
· ✅ **L'écran ne ment plus sur ce qu'il attend** : le texte d'attente nomme ses
  trois pièces, et choisir une grille sans échelle DIT ce qui manque.
· ✅ **L'autre source de matériel fictif est tarie aussi** : le module
  `js/spe-specifications.js` resemait **cinq** objets `[SPE]` signés « Labo Codex »
  à CHAQUE ouverture de la page — c'est pourquoi ils revenaient après chaque
  suppression. 1009 lignes retirées, zéro consommateur vivant, mesuré sur 24
  symboles. ⚠ **La pratique de notation par spécifications, elle, est intacte**, et
  une assertion la garde contre un futur retrait « de cohérence ». *(#681)*
  ⮕ **VÉRIFIÉ À L'ÉCRAN par Grégoire le 1er septembre** : les cinq gabarits
  supprimés depuis la bibliothèque, deux rechargements, **aucun retour**. Les
  sondes avaient d'abord mesuré zéro référence : rien de ce qui est parti ne
  portait la trace d'un jugement posé.
· ✅ **LES DEUX SONDES ONT TOURNÉ sur le corpus réel, le 1er septembre.**
  `_sonderEchellesDisciplinaires()` : **zéro partout** — bibliothèque, copies dans
  les trois trimestres, usages. Et le zéro porte son témoin : 3 trimestres et la
  bibliothèque partagée réellement lus. `nettoyage681()` : les cinq objets présents,
  **zéro référence, tous libres**, sur 15 clés ouvertes.
· ⏳ **CE QUI N'EST PAS RÉGLÉ, ET QUI A CHANGÉ DE NATURE CE SOIR.** Ce zéro ne
  couvre que le corpus de Grégoire. **Un enseignant qui a ouvert l'application
  avant aujourd'hui a pu ajouter l'échelle « Chimie » à sa sélection : sa copie
  reste muette et rend 0,0 % sans un mot.** Il n'est ni sondable, ni joignable, et
  **on ne sait pas combien ils sont** — le trafic n'est pas mesuré.
  ⮕ **#674 est le seul filet qui atteint ces gens-là.** Ce n'est plus une
  prévention pour la cohorte qui arrive : c'est une **réparation pour des
  utilisateurs déjà en place**, dont l'application ment aujourd'hui. Ça change son
  poids, pas seulement son rang.
↻ **1er septembre, tard — le §3 (« le matériel semé se dit utilisable ») est livré
dans le code et n'atteint personne.** Les trois pièces s'appellent maintenant
« Grille de départ », « Cartouche de départ », « Échelle de départ (IDME) »… **dans
un espace neuf seulement**. Sur une base qui porte déjà l'objet, le semis vérifie
l'identifiant et sort sans écrire : il ne recrée pas, donc **il ne renomme jamais**.
*(#682)*
⮕ ✅ **Réglé chez Grégoire le 1er septembre au soir** : il a tranché (b) — renommer
uniquement ce qui portait encore, au caractère près, un libellé écrit par le code.
**5 renommés, 0 nom personnel touché, 0 autre écriture**, vérifié par une relance de
la sonde. ⚠ **Mais chez les autres utilisateurs, rien n'a changé** : le renommage
est un script qu'il a lancé, pas une migration que l'application porte. Pour eux,
#682 est entier — et c'est encore « tarir n'est pas réparer ».
⮕ **La porte terrain du §3 est SUSPENDUE** : elle jugeait de libellés qui ne sont
pas arrivés, et elle envoyait dans un onglet « Matériel » qui n'existe pas. Le vrai
chemin est **Conception › Échelles de performance**.

↻ **Et la sonde a trouvé plus gros que le renommage** *(#683, ouvert)*. Deux
mécanismes, mesurés :
· **Changer de trimestre ne sème rien.** Le matériel de départ n'arrive qu'au
  chargement de la page. Un enseignant qui crée son second trimestre et va droit
  à l'évaluation n'y trouve rien, jusqu'à ce qu'il recharge — et rien ne le lui dit.
· **La suppression est par trimestre, l'interdiction est globale.** Supprimer la
  grille de départ dans un trimestre l'interdit dans TOUS, y compris ceux créés
  demain, pendant que les autres copies restent en place. ⮕ Ça touche aussi le
  geste 8 : la portée annoncée n'est pas la portée réelle. **Décision de Grégoire** :
  corriger changerait le sens de suppressions déjà faites.

⮕ Cette ligne reste donc « éprouvé par Grégoire » et ne devient pas « fait » :
ce qui a été mesuré, c'est la chaîne du NOUVEL utilisateur, pas le parcours
complet de l'énoncé 2.

---

## L'ÉVALUATION — ce que l'audit du 25 août a déjà réglé

C'est le morceau qui inquiète, et il est moins ouvert qu'il n'en a l'air.

Un audit de l'onglet Évaluations (les quatre sous-onglets, le PDF de rétroaction,
le design) a relevé **20 constats le 25 août**. Au 30 août : **19 réglés, 1 partiel,
0 ouvert**, plus la section « mineurs » livrée. Les 17 fiches qui les portent sont
**toutes cochées au backlog**, vérifié le 1er septembre.

**Le partiel est le seul qui reste, et il t'attend** : la portée des suppressions par
couple. Le garde a été livré le 29 août, la règle métier non. C'est le geste 8 de
cette page. *(#560)*

⚠ **Trois trous ont été découverts EN corrigeant**, et ils sont ouverts : neuf
fonctions définies deux fois sur `window`, 78 variables CSS fantômes, des clés de
session non préfixées. *(#587, #595, #596)*

⚠ **Ce que cet audit ne couvrait pas** : le calcul de la note lui-même. Il visait les
enregistrements, le PDF et le design. Le défaut mesuré le 1er septembre au soir (une
pondération incomplète qui affiche 0,0 %) n'est dans aucun des 20 constats. Un audit
propre ne dit rien de ce qu'il n'a pas regardé.

---

## CE QUI N'APPARTIENT QU'À GRÉGOIRE

Aucune session ne peut trancher ces points à sa place.

- **La règle de suppression d'un fichier** : que doit-elle emporter ?
- **Le facteur de normalisation 500 → 600** sur sa grille de première session.
  ⚠ Entre deux évaluations, jamais au milieu d'une correction.
- **Le nom du service d'aide** pendant la transition du CAF vers « Passerelle + ».
- **Les essais à la main** que les tests ne remplacent pas : l'écran réel sur Mac
  et sur iPad.

---

## CE QU'ON NE SAIT PAS, ET QUI COMPTE

⚠ **Des utilisateurs sont DÉJÀ dans l'application. Combien : inconnu.**
Le trafic n'est mesuré ni sur Netlify ni sur Cloudflare. On ne sait pas s'il y en
a un, vingt, ou aucun aujourd'hui.

↻ **1er septembre au soir — on sait maintenant POURQUOI on ne sait pas.** L'application
est servie à **deux adresses**, et une seule a une porte : `app.codexnumeris.org` passe
par Cloudflare Access, mais le domaine Netlify par défaut sert la même application,
complète, **sans aucune authentification**. Netlify compte les deux, Access une seule.
Ce n'est pas une fuite — l'application est locale d'abord, ce visiteur n'obtient qu'un
espace vide. Mais la porte ne compte pas ce qu'on croit. ⮕ **Redirection à l'ordre du
jour du 2 septembre.**

⮕ **Ce que ça change pour toute session** : on ne développe plus « avant les
utilisateurs ». Un défaut livré est un défaut que quelqu'un rencontre peut-être
déjà. Un enseignant de littérature, hors communauté de pratique, a signalé un
bug ; il a été corrigé. C'est la preuve que la porte est ouverte et qu'elle sert.

⮕ **La communauté de pratique Labo Codex se réunit le 14 septembre 2026.** Ce
n'est pas la date où les utilisateurs arrivent : c'est la date où ils se parlent.

---

## COMMENT CE FICHIER SE MET À JOUR

1. Une ligne passe à **Fait** seulement avec la phrase « vérifié comment ».
2. Une ligne ne quitte **Jamais vérifié** que par un passage réel dans l'écran,
   pas par une lecture de code.
3. Les huit gestes viennent d'`OBJECTIF-COHORTE-1.md`, arrêté par Grégoire. **Ce
   fichier-ci ne les amende pas** : il les traduit et les date.
4. Si un état change et que ce fichier ne bouge pas, c'est ce fichier qui a tort.
