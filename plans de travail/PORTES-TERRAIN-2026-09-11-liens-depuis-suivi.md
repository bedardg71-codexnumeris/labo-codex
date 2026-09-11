# Portes terrain — 11 septembre 2026 (deux liens depuis Suivi vers les outils d'observation, 1.130.1)

> **Version à l'écran attendue : `1.130.1`, build `0911-1103`.**
> Couvre : deux liens « Régler les outils d'observation » posés dans Suivi (décision de 10 h 48 :
> l'écran reste dans Labo, Suivi y mène). Le lot B (#824, cinq chemins morts retirés) n'a **aucune
> porte** : invisible, mesuré par la sentinelle #824 et la suite complète.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.
>
> ⏳ **DUE.** Markdown écrit par Claude Code le 11 septembre vers 11 h 10 ; artefact jumeau (bouton
> « Copier mes résultats ») à publier par Cowork.

**Pourquoi cette liste est courte.** Une porte, deux rangées, fixées par la consigne. Sous WebKit, le
lien du Suivi du groupe a été cliqué : la sous-section « Outils d'observation » devient active, la page
défile jusqu'à elle, zéro erreur — dans les deux modes. Reste ce que seul ton écran tranche : que les
deux liens se voient là où ils sont, et mènent au bon endroit sur le site en ligne. Rien n'écrit chez toi.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org**, recharge en vidant le cache : **Cmd + Maj + R** | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.130.1`**, build **`0911-1103`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · ⚠⚠ Tes données

> **Aucune porte.** Ce lot n'écrit rien dans ton codex.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Les deux liens mènent à l'écran trié

> **Pourquoi.** Tu voulais « le réglage dans l'onglet où les paramètres ont une influence ». L'écran
> reste dans Labo (quatre de ses réglages agissent hors de Suivi), et Suivi y mène là où tu constates
> un effet.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Va dans **Suivi → Suivi du groupe** et clique, à droite du titre, sur **« Régler les outils d'observation »** | La page passe à **Labo › Outils d'observation**, l'écran trié d'hier (trois cartes ouvertes, sommaire en tête), sans message d'erreur. |
| **2.1b** | Va dans **Suivi → Profils individuels**, ouvre un élève, section **Accompagnement** ; sous le titre **« Modèle de la Réponse à l'intervention (RàI) »**, clique sur le même lien | Même arrivée : Labo › Outils d'observation, en haut de l'écran. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.**

| | Question | Ton verdict |
|---|---|---|
| **3.1** | **Les mots du lien.** « Régler les outils d'observation » est la proposition de Cowork, posée telle quelle. Le patron réutilisé (le bouton-lien de la note finale) dit, lui, « Réglages de la pratique » — un nom, pas un verbe. **Garder « Régler les outils d'observation », ou aligner sur le patron : « Réglages des outils d'observation » ?** | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Le lien de la carte RàI** n'a pas été cliqué sous WebKit : il faut un élève avec des données ; le
  code est le même que celui du Suivi du groupe (même `data-action`), et il est présent dans les deux
  branches de la carte (avec et sans données).
- **Le patron réutilisé fait 25 px de haut** (mesuré) — c'est celui de la note finale, inchangé. En
  dessous du minimum tactile de 44 px : sur Mac, ce lot ne vise que la souris ; sur l'iPad, il se
  touche mais se vise. Le grossir changerait aussi le bouton de la note finale — pas dans ce lot.
- **Safari** : la capture est WebKit sous Playwright.
- **Constat, pas une porte** : la porte **2.3b de ce matin** (« le diagnostic dit seuil force : 60 % »)
  visait un texte que l'application n'a **jamais affiché** — il n'était rendu que par une chaîne morte,
  retirée aujourd'hui (#824). Le seuil agit bel et bien (couleur des badges « Forces et défis », défi
  principal de la carte RàI), mais ce que tu as vu à 2.3b n'a pas pu être ce titre. Noté dans le
  markdown de cette porte.
