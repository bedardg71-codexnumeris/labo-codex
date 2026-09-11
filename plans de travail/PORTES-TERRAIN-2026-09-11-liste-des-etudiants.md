# Portes terrain — 11 septembre 2026 (Liste des étudiant·es : abandons visibles, tris, recherche, DA en double — lot 2 du cadrage 11, 1.132.0)

> **Version à l'écran attendue : `1.132.0`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : les abandons visibles grisés (L-2, ta décision de 14 h 17), les tris « # » et « DA » (L-1), la recherche sans
> accents (L-3), le filtre des profils (L-5), « ≥ Min. » qui tient (L-6), le DA en double refusé (L-8), le bouton d'aide du
> titre (L-11). Le reste du lot (une écriture par rendu, saisie différée, groupe padé, six patterns réciproques) n'a
> **aucune porte** : invisible, mesuré par la sentinelle du lot et la suite complète.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Sept rangées, fixées par la consigne. Le piège du lot (un abandon rendu sans que les
moyennes ne bougent) est prouvé au banc, six fois cassé exprès. Reste ce que seul ton écran tranche : tes groupes réels,
un vrai abandon, et les mots.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.132.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · ⚠⚠ Tes données

> **Aucune écriture par ce lot.** La rangée 5 ajoute puis annule un élève : si le refus fonctionne, rien n'est écrit ; s'il
> ne fonctionnait pas, une fiche en double serait créée — supprime-la alors dans Cadre › Trimestre et note l'échec ici.
> Le stock des groupes écrits « 1 » reste tel quel (normalisé à la lecture).

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Les tris trient

> **Pourquoi.** Le clic sur « # » changeait la flèche, pas l'ordre ; le tri par DA mettait 1000123 avant 999999.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | `Suivi › Liste des étudiant·es`, clique l'en-tête **« # »** deux fois | l'ordre des lignes **change à chaque clic** (le second renverse le premier) |
| **2.1b** | Clique l'en-tête **« DA »** deux fois | les DA en **ordre numérique**, croissant puis décroissant |

### 2.2 · La recherche sans accents

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Dans **Recherche**, tape le prénom accentué d'un élève réel de ton groupe **sans l'accent** (« aime » pour Aimé, « cesaire » pour Césaire…) | la ligne est **trouvée** ; la liste se rafraîchit quand tu cesses d'écrire |

### 2.3 · Le filtre des profils

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Ouvre la liste **Profils d'apprentissage** | « En progression » **n'y est plus** ; « Non-participation » et « Données insuffisantes » **y sont** |

### 2.4 · « ≥ Min. » tient

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Coche **« ≥ Min. »**, puis clique un en-tête de tri | les lignes sous le minimum **restent grisées** après le tri ; `moy=` de C et P restent celles des qualifié·es |

### 2.5 · Un DA en double est refusé

> **Pourquoi.** Deux fiches sous le même DA, c'était accepté sans un mot — et tout le reste de l'application identifie un
> élève par son DA.

| | Geste | Attendu |
|---|---|---|
| **2.5a** | `Cadre › Trimestre`, ajoute un élève avec **le DA d'un élève existant** du groupe | **refusé** : « Ce DA est déjà dans le groupe : [prénom nom]. » ; **aucune fiche en plus** dans la liste |

### 2.6 · Le bouton d'aide survit

| | Geste | Attendu |
|---|---|---|
| **2.6a** | Titre de la Liste : après un changement de filtre, le bouton d'aide **« i »** du titre | **présent, cliquable** (il ouvre l'aide de la Liste) |

### 2.7 · Les abandons visibles, grisés — seulement sur un cas réel

> ⚠ **Pas de données fictives** (ta règle du 6). Le pack de démonstration ne porte **aucun** élève en abandon
> (`grep -c "abandon" js/pack-demo-20.js` = 0). Cette rangée ne se fait que si l'un de tes groupes a un élève en abandon,
> inactif ou en décrochage ; sinon, elle attend un cas réel — ne pas en créer.

| | Geste | Attendu |
|---|---|---|
| **2.7a** | Groupe avec un élève en abandon / inactif / décrochage : `Suivi › Liste des étudiant·es` | sa ligne **est là, grisée**, avec son statut entre parenthèses après le nom (« Inactivité », « Décrochage » ou « Abandon ») ; les `moy=` de l'en-tête sont **inchangées** par rapport à avant |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Deux textes que tes collègues liront, proposés par Cowork dans la conversation ;
> ton silence vaut « tel quel » (ta règle du 11). Ils sont posés tels quels dans 1.132.0.

| | Question | Ton verdict |
|---|---|---|
| **3.1** | **Le refus d'un DA en double, à l'ajout** : « Ce DA est déjà dans le groupe : [prénom nom]. » | _______ |
| **3.2** | **Le compte à l'import** : « N étudiant·es ajouté·es, M déjà présent·es (ignoré·es) — T au total dans le groupe. » | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Un abandon réel** : le pack de démonstration n'en porte pas ; le banc rejoue le cas avec un groupe de banc.
- **Le compteur « N personnes »** de l'en-tête compte maintenant les lignes affichées, abandons compris — c'est un compte de
  lignes, pas une statistique ; les `moy=` et `r=` n'en tiennent pas compte.
- **En mode anonymisé**, le nom devient « Élève n » mais le statut « (Décrochage) » reste après lui : un statut n'est
  pas un identifiant, mais sur un petit groupe c'est une information. Assumé ; dis-le si tu veux qu'il s'efface aussi.
- **À l'import, un DA répété DANS le fichier** compte parmi les « déjà présent·es » (il l'est, après sa première ligne).
- **L'iPad et les cibles tactiles** (20 contrôles sous 44 px dans cette sous-section) : lot 7.
- **Les deux « moyenne A »** (#750) : cité, pas rejugé.
- **Safari** : la sentinelle tourne sous Node.
