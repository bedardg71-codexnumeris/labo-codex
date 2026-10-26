# Portes terrain – La table de cas, lot 3b (26 oct. 2026)

> Écrites par Claude Code le 26 oct. 2026, sur le lot commité sur `main` (non poussé). **Cowork publie l'artefact jumeau** (bouton « Copier mes résultats »). Ce qui échoue devient un item du BACKLOG, pas une note mentale.
> **Deux règles de tête appliquées** : tout ce qu'une machine peut dire est dans les bancs (Vitest : 30 cas neufs ; WebKit : 7 essais neufs, dont une vraie copie évaluée et son PDF, 4 largeurs). Aucun préalable n'est dû pour des données : une table n'est écrite qu'au geste, et « Retirer cette table » demande avant d'effacer un texte. Restent **trois portes**, toutes sur l'iPad réel, et **sept décisions** (celles de la demande de relecture, § « Écarts et décisions »).

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | ⚠ **Attendre le push.** Les lots 3a et 3b sont commités, pas en ligne : ces portes jugeraient la version d'avant. | La consigne interdit le push sans ton signal. |
| 0.2 | Ouvrir `https://app.codexnumeris.org`, recharger, lire le numéro en bas de page. | Le numéro de la release qui portera ces lots (pas 1.219.1). |

## §2 · Interface — sur l'iPad (Safari réel)

### 2.1 Un bloc posé au doigt dans le texte d'un cas `iPad`

**Pourquoi** : le texte d'un cas est une zone violette comme celle d'un palier ; la pose d'un bloc au curseur n'a été éprouvée que dans WebKit sous Playwright.

| | Geste (iPad portrait) | Attendu |
|---|---|---|
| a | Conception › Grilles de critères, une grille avec un critère algorithmique ; « Cas d'interprétation » ; « + Ajouter une table de cas ». | Une « Table de cas » selon « Le compte des … », trois rangées vides (« 0 », « Jusqu'à 2 », « Au-delà de 2 »). |
| b | Toucher le texte du cas « Jusqu'à 2 », taper « Peu : », toucher le bloc « Compte des … ». | La palette paraît juste au-dessus de la rangée et dit « Zone choisie : Table selon le compte des …, cas jusqu'à 2 » ; le bloc se pose au curseur, la zone reste sous ton doigt. |

### 2.2 Le menu « Selon » `iPad`

**Pourquoi** : ce menu a perdu l'apparence du système (pour faire 40 px de haut, comme ceux de la bibliothèque) ; la roue de sélection de Safari n'a pas été vue.

| | Geste | Attendu |
|---|---|---|
| a | Toucher « Selon ». | La liste des six valeurs, nommées avec les noms du critère ; « La part de la limite (aucune limite) » grisée si aucune limite n'est fixée. |
| b | Choisir « Le code le plus fréquent ». | Une rangée par code de ta liste, puis « Aucun code » ; dessous, la règle d'égalité. |

### 2.3 Retirer une table écrite `iPad`

**Pourquoi** : la confirmation vit dans la carte (jamais une fenêtre du navigateur) ; elle doit se voir sans défiler.

| | Geste | Attendu |
|---|---|---|
| a | Écrire un texte dans un cas, puis toucher « Retirer cette table ». | Dans la carte : « Retirer cette table et ses textes ? », « Retirer », « Annuler » ; rien n'est encore effacé. |
| b | Toucher « Annuler ». | La table et son texte sont là. |

## §3 · Décisions — ce ne sont pas des vérifications

Les sept écarts et décisions de `DEMANDE-RELECTURE-2026-10-26-table-de-cas-3b.md` (D1 à D7) : la confirmation au changement de valeur d'une table écrite, la table du code qui suit la liste, la règle d'égalité d'un critère existant, le message d'une copie sans étendue, l'apparence du menu, le refus d'une borne, le mode Catégories. Chacun se défait en une ligne.

## §4 · Ce que je n'ai pas pu vérifier

- Safari et l'iPad réels (les trois portes).
- Ce qui arrive à une copie déjà évaluée quand sa grille reçoit une table, puis qu'on la rouvre (piège 2) : lu dans le code (la phrase se recalcule ; l'enregistrement sans geste dépend des gardes de l'enregistrement automatique), pas mesuré.
- Le corpus réel : aucune de tes grilles n'a de table ; rien n'y change tant que tu n'en ajoutes pas.
