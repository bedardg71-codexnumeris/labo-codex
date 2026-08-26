# Portes terrain — les trois décisions livrées (#516, #517, #518)

**Date** : 26 août 2026 (fin d'après-midi) · **Version** : 1.99.2
**Origine** : verdicts D1, D2 et D4 de `plans de travail/ARBITRAGE-2026-08-26-suites-audit-conception.md`
**Artefact jumeau** (l'OPÉRATION — ce fichier est la TRACE) : <https://claude.ai/code/artifact/43cedd90-9323-4e6a-94f5-ce4a716402eb>

> **Ce qui échoue ici devient un item de BACKLOG, avec son numéro de porte.**

---

## Pourquoi elle est courte

Trois correctifs, **neuf rangées** — dont une de préalable. Les deux règles de tête ont été appliquées :

| Changement | Porte ? | Pourquoi |
|---|---|---|
| **#517** la cartouche s'enregistre seule | **oui** | change ce qui atteint tes données, et sur l'écran qui les perdait |
| **#516** un critère sans nom est refusé | **oui** | change ce que l'app accepte d'écrire ; et le refus ne doit pas te bloquer la frappe |
| **#518** l'avertissement du bloc sans nom | **oui, une rangée** | une fenêtre nouvelle sur un geste quotidien : si elle s'affiche à tort, tu la verras tout de suite |
| Les astérisques rouges | **une rangée** | c'est ta demande, et seul ton écran peut dire s'il en reste un d'une autre couleur |

Rien d'autre. Les tests couvrent le reste, y compris ce que je n'aurais pas su vérifier à la main.

---

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | `git pull`, recharge l'app, lis le bas de la page. | **1.99.2**. Si tu lis 1.99.1 ou moins, rien de ce qui suit ne vaut. |

⚠ Aucune de ces portes n'écrit dans tes données de façon irréversible — pas de backup exigé.
Elles créent ou modifient des gabarits ordinaires, que tu peux défaire à la main.

---

## §1 · Interface

### 1.1 · La cartouche s'enregistre pendant que tu écris — #517

> **Ce que tu vivais.** Dans une grille ou une échelle, ce que tu tapes est gardé au fil de la
> saisie. Dans une cartouche, rien n'était écrit tant que tu n'avais pas cliqué « Enregistrer »,
> tout en bas d'un long écran. Changer de cartouche, changer de sous-onglet ou fermer l'app perdait
> toute la matrice, sans un mot.

| | Geste | Attendu |
|---|---|---|
| 1.1a | Ouvre une cartouche **déjà enregistrée**. Écris un commentaire dans une cellule de la matrice, puis clique ailleurs. **Ne touche pas à « Enregistrer ».** Recharge la page (Cmd+R) et rouvre la même cartouche. | **Ton texte est là.** |
| 1.1b | Même chose avec le **Contexte** (le champ au-dessus de la matrice) : écris, clique ailleurs, recharge, rouvre. | Le contexte est là. |
| 1.1c | Renomme la cartouche, puis clique « Enregistrer ». | Le nom est pris. *(Le nom reste au bouton, délibérément : il vérifie les doublons, ce qui demande de te poser une question.)* |

`⚠⚠ Données`

### 1.2 · Un critère sans nom est refusé — #516

> **Ce que tu vivais.** La légende dit « Champ obligatoire — l'enregistrement est refusé sans lui ».
> Une grille dont un critère n'avait pas de nom s'enregistrait pourtant très bien.

| | Geste | Attendu |
|---|---|---|
| 1.2a | Ouvre une grille déjà enregistrée. **Vide** le nom d'un critère, puis clique ailleurs. | Le champ **devient rouge**, et un bandeau dit que le nom est obligatoire et que la modification n'a pas été enregistrée. |
| 1.2b | **Sans recharger**, reclique dans ce champ et tape un nom. | Tu peux taper normalement — le champ ne s'est pas re-rempli tout seul sous tes doigts, et le rouge part. Recharge : le nom est là. |

`⚠⚠ Données`

### 1.3 · Le bloc rempli sans nom te prévient — #518

> **Ce que tu vivais.** Un bloc de consignes rempli mais pas nommé était écarté à l'enregistrement,
> avec son texte, sans un mot.

| | Geste | Attendu |
|---|---|---|
| 1.3a | Dans une production, ajoute un bloc de consignes, écris dedans, **ne le nomme pas**, et clique « Enregistrer ». | Une **fenêtre** te prévient que le bloc ne sera pas conservé, et te demande si tu veux enregistrer quand même. |
| 1.3b | Refais un enregistrement ordinaire, sans bloc anonyme. | **Aucune fenêtre.** Elle ne doit apparaître que s'il y a vraiment quelque chose à perdre. |

### 1.4 · Les astérisques — ta demande du jour

| | Geste | Attendu |
|---|---|---|
| 1.4a | Promène-toi dans Conception (production, grille, échelle, cartouche) et regarde les astérisques des champs obligatoires. | Ils sont **rouges**, partout. Si tu en vois un d'une autre couleur, dis-moi lequel : c'est un vrai échec. |

`iPad` *(si tu passes sur l'iPad, c'est la rangée qui vaut le détour : la couleur est le seul point que le mode sombre pourrait changer.)*

---

## §2 · Ce que je n'ai pas pu vérifier

1. **Safari et l'iPad**, comme toujours : la session n'a pas WebKit pour l'application elle-même.
2. **#517 sur une cartouche NEUVE** : tant qu'elle n'a jamais été enregistrée, l'enregistrement au
   fil de la saisie ne peut rien écrire — c'est le modèle des grilles et des échelles, et c'est
   voulu. Si tu trouves ça déroutant en usage, dis-le : ce serait un vrai retour, pas un bug.
3. **Le compte des astérisques** : j'ai vérifié qu'aucun ne porte plus la classe sans couleur, et un
   test le tient. Je n'ai pas vérifié à l'œil qu'aucun champ obligatoire n'a été OUBLIÉ, faute
   d'astérisque — c'est un autre sujet, que #506 couvre en partie.
4. **Trois de mes tests se sont révélés complaisants aujourd'hui**, et c'est le break-test qui les a
   montrés, jamais la relecture. Je le dis parce que ça change la valeur des verts que je t'annonce :
   ils valent ce que valent les break-tests qui les accompagnent, et pas davantage.
