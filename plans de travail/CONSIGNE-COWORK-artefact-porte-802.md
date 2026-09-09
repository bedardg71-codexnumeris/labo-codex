# Consigne à Cowork — publier l'artefact de la porte terrain #802

> **Ce document est auto-portant.** Il contient tout ce qu'il faut savoir : les
> règles du modèle de portes terrain vivent dans `.claude/skills/portes-terrain/`,
> que Cowork ne lit pas. Rien à aller chercher ailleurs.

## Le mandat

**Le markdown est écrit** — `plans de travail/PORTES-TERRAIN-2026-09-09.md`, 169
lignes, versionné. C'est la TRACE.
**Il manque son jumeau : l'artefact interactif**, qui est l'OPÉRATION. Sans lui,
l'avancement reste dans un fichier que personne ne coche, et le relevé n'existe
pas.

⮕ **Publie l'artefact à partir du markdown, sans en changer le contenu**, et
donne le lien à Grégoire.

## Ce que l'artefact doit faire — les quatre points non négociables

### 1. Un bouton « Copier mes résultats », éprouvé avant publication

L'avancement vit dans le `localStorage` du navigateur de Grégoire : **aucune
session ne peut le lire**. Sans ce bouton, « j'ai fait les tests » arrive sans
aucune donnée, et il faut lui faire retaper les rangées — ce que personne ne fait
en entier. On perd alors les ✓ (quelles portes sont réellement closes) et surtout
les mesures.

Le bouton construit un texte à partir de l'état coché :
- un compte en tête : `passées / échec / non traitées` ;
- puis les rangées, groupées par section et par porte, préfixées `[v]` `[X]` `[ ]` ;
- **et le contenu des champs de saisie du §3**, verbatim.

⚠ Le presse-papiers peut être refusé dans un cadre : **double toujours d'un
`<textarea>` visible et présélectionné**. Le bouton ne doit jamais échouer en
silence — c'est exactement le défaut qu'il est censé corriger.

⚠ **Éprouve-le au navigateur avant de publier** : coche quelques rangées, clique,
relis le texte produit, vérifie qu'il n'y a aucune erreur de page. Un bouton
d'export non éprouvé est le genre d'affichage muet que ce projet a déjà trouvé
trois fois en un cycle.

### 2. Les trois décisions du §3 portent un CHAMP DE SAISIE, jamais une bascule

**C'est la leçon la plus chère du modèle**, constatée sur pièces : un relevé est
déjà revenu « 28 passées, 0 échec » avec **cinq décisions cochées ✓ et aucun
verdict nulle part**. Cocher « quel mot retenir ? » ne dit pas lequel.

Les trois rangées du §3 (`3.1` la prose de l'Aide, `3.2` le mot « Verrou sur une
évaluation », `3.3` cibles ou instruments en PAN – Standards) **ne sont pas des
vérifications**. Elles attendent une réponse écrite.
⮕ **Un champ de texte pour chacune**, repris tel quel dans l'export. Aucune
bascule ✓/✗ sur ces trois-là — *la forme contredirait le texte, et c'est la forme
qui gagne.*

### 3. Un filtre par tag, pour qu'il puisse travailler là où il est

Les rangées portent trois tags : `⚠⚠ Données`, `iPad`, et rien pour le reste.
Grégoire doit pouvoir n'afficher que **ce qu'il peut faire là où il est** — sur
l'iPad dans le train, ou devant le Mac.

### 4. Le §0 en tête, impossible à sauter

Les trois gestes du §0 conditionnent tout le reste : s'il juge la mauvaise
version, **tous les rouges sont faux**. Mets-les en tête, visuellement séparés,
avec l'avertissement « si le numéro ne dit pas `1.127.1` / build `0909-1745`,
arrête-toi ».

## Ce qu'il ne faut PAS faire

- ❌ **Ne rallonge pas la liste.** Elle fait 14 rangées et 3 décisions pour SEPT
  versions livrées, et c'est délibéré : une porte n'existe que si aucune machine
  ne peut répondre à sa place, et une vérification n'est due avant usage que si un
  raté serait irréversible. Grégoire a déjà dit son découragement devant des
  listes de 24 et 35 portes — « ma préparation de cours n'avance pas pendant ce
  temps ». **Ajouter des rangées « par sécurité » est le défaut à éviter.**
- ❌ **Ne remplace pas les symptômes par des mécanismes.** Les encadrés
  « Pourquoi » racontent ce que Grégoire a vécu, jamais comment le code marche.
  Il n'est pas développeur, il l'a rappelé lui-même.
- ❌ **Ne publie pas l'artefact sans le markdown** : les deux sont jumeaux. Le
  markdown est déjà commité, rien à faire de ce côté.
- ❌ N'invente aucun attendu chiffré. Il n'y en a aucun dans cette liste, c'est
  volontaire : un attendu faux fait cocher ✗ sur un correctif qui a marché.

## Le préalable à vérifier avant d'envoyer quoi que ce soit

**La porte juge `https://app.codexnumeris.org`, pas le clone local.** Un lot
seulement commité n'est pas encore chez lui : il doit être poussé sur `main`, et
Netlify met 30 à 60 secondes à reconstruire.

⮕ **Avant d'envoyer le lien à Grégoire**, ouvre l'adresse et vérifie que le bas de
page dit bien **`1.127.1`, build `0909-1745`**. Si ce n'est pas le cas, le déploiement
n'est pas passé : attends, ou dis-le-lui — mais n'envoie pas une porte qui
jugerait la version d'avant.

## Au retour du terrain

1. **Trier les échecs** : défaut réel, ou version en retard ? (Sur 81 portes d'un
   cycle précédent, deux des quatre échecs étaient des faux rouges de ce type.)
2. **Verser chaque échec réel au BACKLOG**, avec son numéro de porte. Le dernier
   identifiant utilisé est **#809**.
3. **Reporter les trois réponses du §3 dans le markdown**, à la place des
   « _Ta réponse :_ » — ce sont des décisions de Grégoire, elles doivent survivre
   à la conversation.
4. **Ne jamais laisser une porte « probablement passée »** : soit elle est cochée,
   soit elle est due.
