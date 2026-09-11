# Portes terrain — 11 septembre 2026 (Suivi du groupe : la liste suivie par groupe-cours, lot 1 du cadrage 11, 1.131.0)

> **Version à l'écran attendue : `1.131.0`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : les élèves suivis (au plus cinq) gardés par groupe-cours (`#749`), le refus du sixième dit à voix haute, le filtre
> « P < 65 % » qui filtre sur ce qui est montré, le panneau mort retiré et la ligne qui dit où cliquer, la démo dont le
> dépistage n'est plus muet. Le reste du lot (G-6 commenté, G-7 périmé, G-8 une écriture au lieu de deux) n'a **aucune porte** :
> invisible, mesuré par la sentinelle #749 et la suite complète.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Cinq rangées, fixées par la consigne. Le cas réel de l'audit (deux élèves suivis sous A,
« Détails » ouvert sous B, retour sous A) est rejoué au banc, vingt essais, cinq fois cassés exprès. Reste ce que seul ton
écran tranche : **tes deux groupes-cours réels**, et les mots.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (pas un rechargement) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.131.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · ⚠⚠ Tes données — ce que ce lot écrit, une fois

> **Une seule écriture, nommée, réversible.** Si tu suivais déjà des élèves (la liste d'avant, partagée entre tes groupes),
> la **première ouverture** du Suivi du groupe sous un groupe-cours reprend, dans ce groupe, ceux de ces élèves qui en font
> partie. **La liste d'avant reste en place, intacte** : si le résultat te paraît faux, rien n'est perdu, dis-le. Aucune autre
> donnée n'est touchée (ni notes, ni présences, ni évaluations). **Pas de sauvegarde exigée** — mais si tu préfères, un export
> Codex avant la rangée 1 ne coûte rien.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · La liste suivie survit au changement de groupe-cours — le cas réel de l'audit

> **Pourquoi.** Jusqu'à `1.130.2`, ouvrir « Détails » sous ton deuxième groupe **effaçait en base** les élèves suivis du
> premier, sans un mot. Tu l'aurais découvert à la première bascule de l'automne.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Groupe-cours **A** actif, `Suivi › Suivi du groupe`, ouvre le panneau (bouton **Détails**) et **clique sur le nom de deux élèves** pour les suivre | Deux pilules colorées ; le compteur dit **(2/5)**. |
| **2.1b** | Bascule sur le groupe-cours **B** (Cadre › Trimestre, ou le sélecteur de groupe), reviens dans `Suivi › Suivi du groupe`, ouvre **Détails** | La liste de B est **vide** (ou la sienne, si tu y suivais déjà quelqu'un) ; compteur **(0/5)**. |
| **2.1c** | Reviens sur le groupe **A**, `Suivi › Suivi du groupe` | **Les deux élèves sont toujours suivis**, mêmes couleurs, **(2/5)**. Avant : la liste était vide. |

### 2.2 · Le sixième refus se dit

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Sur A, suis trois autres élèves (cinq au total), puis clique sur le nom d'un **sixième** | Une notification : **« Cinq élèves suivis au maximum. Retires-en un pour en ajouter un autre. »** ; le sixième n'est pas ajouté, **(5/5)**. Avant : un clic qui ne faisait rien. |

### 2.3 · « Filtrer » filtre sur ce qui est montré

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Sur A, panneau **Détails** ouvert, clique le filtre **« P < 65% »** | **Aucun élève dont le P affiche « — »** dans la liste filtrée ; ceux qui restent ont un P chiffré sous 65. |

### 2.4 · Le mot qui manque, et le chemin vers le profil

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Panneau **Détails** ouvert : lis la ligne en tête du panneau, à droite de « Cliquer un nom pour le suivre » | **« Pour ouvrir un profil : clique sur A, C ou P d'un élève. »** Ferme Détails : la ligne disparaît. |
| **2.4b** | Clique sur le **A** d'un élève de la liste (suivi ou non) | Le **profil** de cet élève s'ouvre, section **Engagement**. Et le bandeau rouge « Étudiant·es prioritaires » n'existe plus nulle part sur la page. |

### 2.5 · La démonstration exerce ce que la carte montre

| | Geste | Attendu |
|---|---|---|
| **2.5a** | `Labo › Démo`, active le mode démonstration ; `Suivi › Suivi du groupe` ; ouvre la console (**Cmd + Option + J**) | La famille **« Défi spécifique »** n'est plus à **0 (0 %)** ; **aucun** avertissement « Pas de grille de référence » dans la console. Désactive la démo : ta grille de référence (Labo › Outils d'observation) est **celle d'avant**, inchangée. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Les trois textes ont été **tranchés par Grégoire le 11 septembre vers 13 h**, avant la
> release ; ils sont repris ici pour la trace. Rien n'attend ici.

| | Question | Verdict |
|---|---|---|
| **3.1** ✅ | **Le refus du sixième** : « Cinq élèves suivis au maximum. Retires-en un pour en ajouter un autre. » | **OK tel quel.** |
| **3.2** ✅ | **Le chemin vers le profil** : Cowork proposait « … d'un élève suivi » ; mesuré, les lettres A/C/P sont sur **tous** les élèves de la liste en mode Détails. | **« Pour ouvrir un profil : clique sur A, C ou P d'un élève. »** |
| **3.3** ✅ | **Sans pratique de notation** : le texte n'a pas de site (fonctions de badge sans appelant depuis #303, retirées ; aucun badge de pratique dans l'en-tête du Suivi du groupe). | **Rien à écrire.** Constat périmé, noté dans #749 et le rapport du 6. |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Tes deux groupes-cours réels** : le banc rejoue le cas avec deux groupes de banc ; le semis de ta liste actuelle (si tu en
  as une) n'a pas été vu sur tes données.
- **Le filtre « A+C < 65% »** filtre sur une valeur (M) affichée nulle part : inscrit (`#828`), pas touché — position
  didactique, avec le lot 7.
- **L'iPad** : aucune mise en page n'a changé (une ligne de texte ajoutée, un bloc retiré) ; les cibles tactiles sous 44 px
  de ce sous-onglet restent celles d'avant, lot 7.
- **La démo** : la résolution de la grille est prouvée au banc (quatre cas) ; l'écran « Défi spécifique » n'a pas été rendu en
  navigateur.
- **Safari** : la sentinelle et la relecture tournent sous Node.
