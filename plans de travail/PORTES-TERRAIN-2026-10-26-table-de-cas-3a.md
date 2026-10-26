# Portes terrain – La table de cas, lot 3a (26 oct. 2026)

> Écrites par Claude Code le 26 oct. 2026, sur le lot commité sur `main` (non poussé). **Cowork publie l'artefact jumeau** (bouton « Copier mes résultats »). Ce qui échoue devient un item du BACKLOG, pas une note mentale.
> **Deux règles de tête appliquées** : tout ce qu'une machine peut dire est dans les bancs (Vitest : 28 cas neufs et le relevé du stock ; WebKit : 8 essais neufs, 4 largeurs). Aucune porte n'est due pour des données : le lot n'écrit dans un critère qu'au geste de l'enseignant·e, et « Retirer la limite » ne perd plus rien. Restent **trois portes**, toutes sur l'iPad réel, et **six décisions**.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | ⚠ **Attendre le push.** Le lot est commité, pas en ligne : ces portes jugeraient la version d'avant. | La consigne interdit le push sans ton signal. |
| 0.2 | Ouvrir `https://app.codexnumeris.org`, recharger, lire le numéro en bas de page. | Le numéro de la release qui portera ce lot (pas 1.219.1). |
| 0.3 | Sur l'iPad, si un onglet de l'application était ouvert : le fermer et le rouvrir. | — |

## §2 · Interface — sur l'iPad (Safari réel)

### 2.1 La palette compacte ne fait plus sauter la zone qu'on touche `iPad`

**Pourquoi** : sur l'iPad, en touchant le verdict d'un palier, la palette des blocs vient se placer juste au-dessus. Pendant ce lot, la zone touchée glissait de plusieurs centimètres vers le bas (mesuré dans WebKit, portrait : 420 px) ; c'est corrigé et mesuré dans WebKit, pas dans Safari sur l'iPad.

| | Geste (iPad portrait) | Attendu |
|---|---|---|
| a | Conception › Grilles de critères, une grille avec un critère algorithmique dont la limite est fixée ; ouvrir « Cas d'interprétation ». | La table des paliers : une rangée par palier, empilées. |
| b | Toucher le verdict du palier « Bien ». | La palette paraît juste au-dessus de sa rangée ; le verdict reste sous ton doigt, le curseur dedans. |
| c | Toucher un bloc de la palette. | Il se pose au curseur, dans le verdict. |

### 2.2 Le seuil en pourcentage, au clavier de l'iPad `iPad`

**Pourquoi** : le seuil se tape maintenant en pourcentage de la limite (« 7,5 »). Le clavier décimal de l'iPad n'a été éprouvé que simulé.

| | Geste | Attendu |
|---|---|---|
| a | Toucher le seuil d'« Excellent » (30). | Un clavier numérique avec la virgule. |
| b | Taper `7,5`, puis toucher ailleurs. | Le champ garde « 7,5 » ; la ligne dessous dit « soit au plus 1 … à chaque … ». |

### 2.3 « Voir ce que l'étudiant·e lirait à ce palier », simulation en tiroir `iPad`

**Pourquoi** : sous 760 px de large (iPhone, fenêtre étroite), la simulation est un tiroir collé en bas ; le bouton doit l'ouvrir s'il est réduit.

| | Geste (iPad, Safari en partage d'écran étroit) | Attendu |
|---|---|---|
| a | Réduire le tiroir (« Réduire »), puis toucher « Voir ce que l'étudiant·e lirait à ce palier » sur « Risqué ». | Le tiroir s'ouvre ; la ligne « Copie réglée sur le palier « Risqué » : … » ; la rangée « Risqué » est marquée en ambre. |

## §3 · Décisions — ce ne sont pas des vérifications

Des choix faits faute de pouvoir les trancher à ta place ; chacun se défait en une ligne.

| | Ce que j'ai décidé | Ce qui te revient |
|---|---|---|
| 3.1 | **La marque d'un critère neuf est celle des noms** (`nomsAttendus`, posée depuis le 22 oct.), pas celle des codes que la consigne nommait. La relecture de Cowork du 22 oct. l'avait écartée pour tout ce que lit l'étudiant·e : les critères créés en 1.213 et 1.214 auraient changé sans geste. | Garder, ou étendre aux critères du 21 et du 22 oct. (leur « Quand tout est maîtrisé » et leur règle d'égalité changeraient). |
| 3.2 | Le résumé de « Ce que tu relèves et comptes » garde « « X » par rapport aux « Y » » : celui de l'ébauche (« « X », rapportées aux « Y » ») accorde au féminin un nom dont on ne connaît pas le genre. | Garder, ou reprendre l'ébauche. |
| 3.3 | Dans « Ce que l'application choisit sans toi », la phrase « Pour lui écrire un texte par code, ajoute une table… » est retirée : le bouton qu'elle désigne vient au lot 3b. | Elle revient avec 3b. |
| 3.4 | Sur la palette compacte (iPad), un bloc reste réduit à son nom, sans sa valeur (la règle du 22 oct.) ; la valeur paraît sur la palette à côté (Mac, iPad paysage). | Garder, ou montrer la valeur aussi en compact. |
| 3.5 | Le bloc « Erreurs projetées », absent de l'ébauche, devient « Compte projeté » (sans « erreurs »). | Le nom. |
| 3.6 | La zone du décompte garde son nom de l'étape 2b (« Décompte des unités manquantes ») ; l'ébauche disait « Décompte ». | Garder, ou « Décompte ». |

## §4 · Ce que je n'ai pas pu vérifier

- Safari et l'iPad réels (les trois portes) : tout a tourné dans WebKit sous Playwright, à 1 440, 1 180, 820 et 700 px.
- Le corpus réel : le stock est prouvé sur six critères existants fictifs (relevé de `c07270a6`, à l'octet), pas sur tes grilles.
- La suite complète (Playwright entier, en dix morceaux) n'a pas tourné : la consigne réserve le verdict à ton signal. Ont tourné : Vitest entier (9 724 verts) et les 20 specs touchées (61 essais verts).
- **Une erreur de la session** : un `git checkout styles.css`, lancé pour défaire une seule règle, a défait tout le CSS du lot ; il a été réécrit à l'identique depuis les mêmes étapes, puis revérifié par les cliquets, les specs et les captures.
