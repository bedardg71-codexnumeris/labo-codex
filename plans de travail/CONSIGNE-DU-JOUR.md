# Consigne du jour

> **Écrite le 2 septembre 2026 à 9 h 55 (heure de Drummondville), par Cowork.**
> **État du dépôt à ce moment-là : version `1.109.1`, build `0902-0929`, `HEAD` = `a4b58eda`, zéro commit non poussé.**
>
> ⚠ **Si tu lis ceci plus de quelques heures après cette heure-là, ou si `HEAD`
> a bougé, NE L'EXÉCUTE PAS telle quelle** : remesure d'abord, et dis à Grégoire
> ce qui a changé. Une consigne est une intention datée, pas un état du code
> (règle 1 de `PROTOCOLE.md`).
>
> Ce fichier remplace les blocs à copier-coller. Il se commite **avec le lot**,
> parce qu'il en est la spécification (règle 6 de `PROTOCOLE.md`).

---

## Le mandat — une seule ligne de données à changer

**Décision de Grégoire, 2 septembre 2026 : les quatre évaluations du modèle
sommatif passent à parts égales, 25 % chacune.**

Elles sont aujourd'hui à `20 / 20 / 30 / 30`, dans
`js/pratiques-bibliotheque.js`, lignes **115 à 118** (mesuré ce matin, à
rejouer avant de toucher) :

```js
{ id: 1, nom: 'Travail 1',            type: 'travail', ponderation: 20 },
{ id: 2, nom: 'Travail 2',            type: 'travail', ponderation: 20 },
{ id: 3, nom: 'Examen de mi-session', type: 'examen',  ponderation: 30 },
{ id: 4, nom: 'Examen final',         type: 'examen',  ponderation: 30 }
```

⮕ Les quatre passent à `25`. **Rien d'autre ne bouge** : ni les noms, ni les
types, ni les critères, ni les seuils, ni l'identifiant.

## Pourquoi — à comprendre avant d'écrire, et à inscrire en commentaire

Les NOMS des quatre évaluations sont neutres : « Examen de mi-session » et
« Examen final » sont du vocabulaire commun à tous les programmes de cégep.

**La PONDÉRATION, elle, ne l'était pas.** `20/20/30/30` met **60 % du poids sur
les examens** : c'est une position pédagogique, pas un point de départ. En arts,
en techniques, en éducation physique, les examens sont minoritaires ou absents —
un enseignant de ces programmes aurait lu, dans un gabarit fourni par
l'application, une opinion sur la bonne façon d'évaluer.

**Des parts égales ne disent rien**, et surtout : quatre nombres identiques **se
voient** comme un réglage à modifier, ce qui invite l'enseignant à poser le sien.
C'est la suite directe du lot d'aujourd'hui — on vient de retirer du matériel
qui reproduisait la pratique de quelqu'un ; une pondération qui ressemble à une
vraie pratique est la même chose, en plus discret.

⮕ **Pose ce raisonnement en commentaire au-dessus du bloc**, pour qu'une session
future ne « corrige » pas ces 25 % en les trouvant trop plats.

## La sentinelle

`tests/unit/sentinelle-687-materiel-sans-discipline.test.js` garde ce modèle à
plusieurs endroits. **Vérifie si un cas affirme les pondérations actuelles** — je
ne l'ai pas mesuré, je n'ai regardé que les identifiants.

- Si oui : réoriente-le, ne le désarme pas.
- Si non : **ajoute un cas** qui garde l'invariant réel — *aucune évaluation d'un
  modèle fourni ne pèse plus qu'une autre*. Break-teste-le : la mutation qui doit
  le tuer est celle qui remet une pondération inégale.

## Livraison

`patch`. Convention du dépôt : **une entrée de changelog par version mineure**, donc
ce patch n'en demande pas une nouvelle. Si l'entrée `1.109` dit quelque chose des
pondérations du modèle sommatif, corrige-la ; sinon, ne touche pas au changelog.

Bump du bloc de jetons d'`index.html` (le hook l'exige dès qu'un `js/` bouge).
`cd tests && npm run test:unit` — **pas** `npm test`.

## ⛔ ET VOICI CE QUI CHANGE DANS L'ORDRE, LIS-LE

La **règle 6** de `PROTOCOLE.md` a été arrêtée ce matin, après une matinée où
**trois versions sont parties avant huit heures sans que Grégoire ait rien vu**.
Elle dit : *une seule livraison par séance, à la fin, et il regarde avant.*

⮕ **Tu committes, puis tu T'ARRÊTES.** Tu ne prends pas le verdict, tu ne pousses
pas. Tu dis à Grégoire que c'est prêt et **ce qu'il doit aller voir**.

**Il pousse — ou te dit de pousser — seulement après avoir regardé l'écran.**

C'est la première fois qu'on applique cette règle. Ne la contourne pas parce
qu'elle coûte une attente : l'attente est la fonctionnalité.

## Ce qu'il doit voir, et la question à lui poser

Conception › Pratiques › « Partir d'un modèle » › **Modèle sommatif**.
Ses quatre évaluations doivent afficher **25 % chacune**.

La question : *est-ce que ça se lit comme un point de départ à ajuster, ou comme
un réglage déjà décidé ?*
