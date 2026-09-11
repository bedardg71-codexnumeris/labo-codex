# Portes terrain — 10 septembre 2026 (#823, 1.129.0)

> **Version à l'écran attendue : `1.129.0`, build `0910-1645`.**
> Couvre une livraison : deux réglages retirés de `Labo › Outils d'observation`, la
> fenêtre d'analyse rebranchée, un curseur renommé.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.**
> Jamais une note mentale.
>
> ✅ **RELEVÉE le 10 septembre 2026 à 18 h 00 (Toronto) — 12 sur 12, zéro échec**, sur
> `app.codexnumeris.org`, version `1.129.0` lue en bas de page. Markdown écrit par Claude Code ;
> artefact « Portes terrain #823 » publié par Cowork à 17 h 50, relevé collé par Grégoire dans la
> conversation Cowork. Rien ne part au backlog.

**Pourquoi cette liste est courte.** Quatre portes, pas plus, et Grégoire les a
nommées lui-même. Ce lot change l'écran, et « est-ce que ça a l'air bien » est la
seule question à laquelle aucune machine ne répond. Tout le reste est mesuré :
neuf essais exécutent le vrai panneau et prouvent que la valeur tapée arrive
jusqu'aux calculs ; neuf ablations les ont fait rougir avant qu'on leur fasse
confiance. Aucune porte ne touche tes données : ce lot n'écrit rien chez toi.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** (pas un fichier local), puis recharge en vidant le cache : **Cmd + Maj + R** | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.129.0`**, build **`0910-1645`**. Si tu lis autre chose, **arrête-toi** : la liste jugerait la version d'avant, et les rouges seraient faux. |

---

## §1 · ⚠⚠ Tes données

> **Aucune porte.** Ce lot n'écrit rien dans ton codex. Les préférences retirées
> restent chez toi, muettes, comme elles l'étaient déjà ; on ne les efface pas.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Les blocs disparus, sans trou ni titre orphelin — et le nouveau nom

> **Pourquoi.** Un cinquième de l'écran promettait ce que l'application ne faisait
> pas. Deux réglages sont partis ; un troisième change de nom et d'aide, parce
> qu'il agit, mais pas sur ce que son nom disait.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Va dans **Labo → Outils d'observation** et déplie **Paramètres avancés** (bloc Taxonomie SOLO) | Le premier réglage du bloc est **« Fenêtre d'analyse des patterns »**. La case « Découpler Performance (P) et Niveau d'attention (N) » et ses trois lignes n'y sont plus, sans espace vide à leur place. |
| **2.1b** | Dans le même bloc, sous « Seuils de détection », lis le deuxième curseur | Il s'appelle **« Sensibilité des flèches par critère »**, et son aide dit : *« Variation minimale de la moyenne d'un critère, d'une fenêtre d'analyse à la précédente (la même, décalée d'une production), pour afficher une flèche (→ ou ←) après ce critère. »* Plus aucun « risque » dans ce bloc. |
| **2.1c** | Descends au bloc **Micro-données ACP** | Entre la case « Activer la cueillette… » et le pliable « Seuils d'interprétation », le menu **« Unité d'affichage de l'assiduité (A) » n'est plus là**, et rien ne semble manquer (pas de titre seul, pas de trou). |

### 2.2 · « Paramètres avancés » se replie et se déplie encore

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Clique sur **Paramètres avancés** pour le replier, puis une seconde fois pour le déplier | Il se ferme et se rouvre ; à l'ouverture, on voit d'abord la fenêtre d'analyse, puis les trois curseurs. |

### 2.3 · Une valeur tapée dans la fenêtre survit à un rechargement

> **Pourquoi.** Avant, le champ gardait ta valeur mais aucun calcul ne la lisait.
> Maintenant il l'enregistre au bon endroit — celui que les calculs lisent.

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Dans « Fenêtre d'analyse des patterns », tape **5**, puis clique ailleurs (le champ enregistre au changement) | — |
| **2.3b** | **Recharge la page** (Cmd + R) et reviens au même écran | ⮕ **Le champ affiche 5.** |
| **2.3c** | Clique **« Restaurer les valeurs par défaut »** du bloc SOLO, puis recharge | ⮕ **Le champ affiche 3.** |

### 2.4 · La fenêtre atteint vraiment un profil

> **Pourquoi.** C'est ce qui change pour toi : la valeur du champ s'applique. À 3,
> c'est l'état d'aujourd'hui ; à 12, tout ce qui compte les productions le dit.

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Tape **12** dans la fenêtre, puis va dans **Suivi → Suivi du groupe**, carte **Observation globale des besoins d'intervention** | Une ligne en italique nomme la fenêtre : *« … sur 12 configurées »* ou *« Certains étudiants ont moins de 12 productions évaluées »*. Avant ce lot, elle aurait dit **3** quoi que tu tapes. |
| **2.4b** | Ouvre le **profil d'un·e élève**, section **Accompagnement**, carte RàI, liste des critères | Avec 12, **aucune flèche (→ / ←) n'apparaît après les critères** : il faut plus de 12 productions évaluées pour en calculer une, et aucun·e élève n'en a autant. |
| **2.4c** | Remets **3** dans la fenêtre, rouvre le même profil | ⮕ **Les flèches reviennent** pour les élèves qui ont au moins 4 productions évaluées. La ligne italique du Suivi du groupe, si elle s'affiche encore, dit **3**. |

---

## §3 · Décisions

> Aucune. Le partage (deux retraits, une fenêtre rebranchée, un renommage) est
> arrêté par Grégoire le 10 septembre au soir.

---

## §4 · Ce que je n'ai pas pu vérifier

- **Aucun navigateur ouvert par la session.** Les neuf essais exécutent le panneau
  sur un faux document ; la disposition réelle (trous, titres orphelins, iPad) n'a
  été vue par personne — c'est l'objet des portes 2.1 et 2.2.
- **Le verdict Safari / iPad** n'existe pas localement ; le CI WebKit tranche à
  l'arrivée sur `main`.
- **Le message italique de 2.4a n'apparaît que si au moins un·e élève a moins de
  productions évaluées que la fenêtre.** À 12, c'est certain ; à 3, il peut ne
  pas s'afficher du tout — ce n'est pas un échec.
- **L'erreur de la session, rattrapée avant d'écrire** : la carte des effets
  disait « Direction du risque : lu, jamais affiché ». Faux — le seuil a un second
  lecteur, vivant. Sans la mesure préalable, ce curseur aurait été retiré, et les
  flèches par critère auraient été figées à 0,05 sans que personne le sache.
  Corrigé au § 4.4 du cadrage ; le curseur reste, renommé.

---

## Pour Cowork — l'artefact jumeau

Publier l'artefact interactif de cette liste (skill `portes-terrain`, § 1) :
quatre portes (2.1 à 2.4, neuf rangées), §0 à deux rangées, §1 et §3 vides et
dits vides, §4 en texte. **Bouton « Copier mes résultats » obligatoire**, doublé
d'un `<textarea>` présélectionné ; aucune rangée ne produit de chiffre, aucune
décision n'attend — donc des bascules ✓/✗ seulement. Version et build à afficher
en tête : `1.129.0` / `0910-1645`.
