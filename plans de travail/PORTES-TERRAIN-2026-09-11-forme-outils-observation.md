# Portes terrain — 11 septembre 2026 (la forme de « Outils d'observation », 1.130.0)

> **Version à l'écran attendue : `1.130.0`, build `0911-1022`.**
> Couvre une livraison de forme : `Labo › Outils d'observation` rangé selon la maquette que tu as
> validée à 10 h 05. **Mêmes réglages, mêmes valeurs, mêmes textes d'aide** ; seule la disposition
> change, et trois curseurs sont devenus des champs chiffrés.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note
> mentale.
>
> ✅ **RELEVÉE le 11 septembre 2026 à 10 h 46 (Toronto) — 13 sur 13, zéro échec, Mac et iPad (deux
> modes)**, version `1.130.0` lue en bas de page. Markdown écrit par Claude Code vers 10 h 30 ; artefact
> « Portes terrain de la forme » publié par Cowork à 10 h 40 ; relevé collé par Grégoire dans la
> conversation Cowork. **Décisions du § 3 : 3.1 « Garder les textes longs » · 3.2 « oui »** — rien à
> coder, l'écran reste tel que livré.

**Pourquoi cette liste est courte.** Quatre portes, fixées par la consigne. Tout ce qu'une machine
pouvait mesurer l'a été : sous WebKit, à 1280 et à 820 px de large, dans les deux modes, l'écran ne
déborde pas, ne lève aucune erreur, et les champs affichent 10 · 5 · 70 ; cinq essais exécutent le vrai
panneau et prouvent que « 60 » tapé s'écrit 0,60 pour les calculs (et rougissent si la conversion
manque). Restent ce que seuls tes yeux et ton iPad tranchent — et une conversion à voir en vrai.
Aucune porte ne touche tes données : ce lot n'écrit rien chez toi.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** (pas un fichier local), puis recharge en vidant le cache : **Cmd + Maj + R** (sur l'iPad : ferme l'onglet et rouvre l'adresse) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.130.0`**, build **`0911-1022`**. Si tu lis autre chose, **arrête-toi** : la liste jugerait la version d'avant, et les rouges seraient faux. |

---

## §1 · ⚠⚠ Tes données

> **Aucune porte.** Ce lot n'écrit rien dans ton codex. Tes réglages sont relus tels quels ; la porte
> 2.3 en écrit un (le seuil de défi) et te fait le remettre à 70.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Sur Mac : tout visible, sans rien déplier

> **Pourquoi.** L'écran te paraissait « cacophonique » : deux sections repliées cachaient sept
> réglages, les options s'empilaient sur quatre écrans, et un seuil se réglait de trois façons.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Va dans **Labo → Outils d'observation** et parcours la page sans cliquer sur rien | Les trois cartes (SOLO, ACP, RàI) sont ouvertes ; **« Paramètres d'analyse »** et **« Seuils d'interprétation »** sont des blocs visibles avec leurs champs — plus rien à déplier. Les options vont deux par rangée. |
| **2.1b** | En haut, sous le texte d'introduction, clique sur **« Micro-données ACP »** dans « Sur cette page », puis sur **« Intervention (RàI) »** | La page défile jusqu'à la carte nommée. |
| **2.1c** | Regarde la largeur de la page | Rien ne dépasse à droite ; pas de barre de défilement horizontale. |

### 2.2 · Sur l'iPad en portrait, dans les deux modes

> **Pourquoi.** Sous 900 px de large, les grilles de l'application passent à deux colonnes. La maquette
> n'a été vue qu'en mode clair sur Mac.

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Sur l'iPad tenu en portrait, ouvre Labo → Outils d'observation, en **mode clair** | Les quatre champs de « Paramètres d'analyse » tiennent sur **deux rangées** de deux ; les blocs d'option s'empilent un par rangée, sans se chevaucher ; les petites étiquettes sous chaque option se lisent (les ambre aussi). |
| **2.2b** | Passe en **mode sombre** (Réglages) et reviens sur l'écran | Même chose : blocs lisibles, étiquettes lisibles, aucun texte sombre sur fond sombre. |
| **2.2c** | Touche la case **« Observation des actions »** puis retouche-la | Elle se coche et se décoche du doigt sans viser (cible assez grande). |

### 2.3 · La conversion — un seuil tapé arrive juste dans le profil

> **Pourquoi.** Les curseurs portaient des fractions (0,70) ; les champs affichent des points (70).
> Sans conversion, taper 70 aurait écrit 70 là où le calcul attend 0,70 — tous les défis faux.
> Les essais le prouvent sur le vrai panneau ; cette porte le voit en vrai.

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Dans « Paramètres d'analyse », mets **60** dans **« Seuil de défi spécifique »** et clique ailleurs | Rien ne s'affiche de spécial : le réglage s'enregistre dès qu'on quitte le champ. |
| **2.3b** | Va dans Suivi → Profils individuels, ouvre un élève, section **Développement des habiletés**, ligne « Diagnostic par critère » | Le titre dit **« seuil force : 60 % »** — pas 6000 %, ni 0,6 %. |
| | ⚠ **Constat du 11 sept., 11 h (#824)** : le titre « Diagnostic par critère (seuil force : N %) » n'était rendu que par `genererDiagnosticSRPNF`, une chaîne **sans aucun appelant** — il n'a jamais été affiché. Cette rangée visait un texte absent ; relevée verte, elle ne prouve pas la conversion par ce titre. La conversion est prouvée par les essais 10-14 de la sentinelle #823 et par la couleur des badges « Forces et défis » (même seuil). | — |
| **2.3c** | Reviens dans Outils d'observation et remets **70** | Le profil dit de nouveau « seuil force : 70 % ». |

### 2.4 · Les deux « Remettre… » remettent chacun leur jeu, et rien d'autre

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Dans « Paramètres d'analyse », change **Progression des artefacts** à 15, puis clique **« Remettre les valeurs par défaut (3 · 10 · 5 · 70) »** | Les quatre champs affichent 3, 10, 5, 70 ; les trois champs de « Seuils d'interprétation » n'ont pas bougé. |
| **2.4b** | Dans « Seuils d'interprétation », change **Fragile** à 65, puis clique **« Remettre les valeurs par défaut (70 · 80 · 85) »** | Les trois champs affichent 70, 80, 85 ; les quatre champs de « Paramètres d'analyse » n'ont pas bougé. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.**

| | Question | Ton verdict |
|---|---|---|
| **3.1** ✅ « Garder les textes longs » (Grégoire, 10 h 46) | La maquette abrégeait certains libellés (« Observation de la structure des résultats », « Collecte des données de contexte et de performance ») et certaines aides (« Basse : détection précoce. Élevée : plus fiable. »). La consigne disait « mêmes textes que 1.129.2 » et « n'abrège pas » : **j'ai gardé les textes longs**. Sur Mac, les blocs sont donc un peu plus hauts que sur la maquette. **Garder les textes longs, ou prendre les courts de la maquette ?** | _______ |
| **3.2** ✅ « oui » (Grégoire, 10 h 46) | Sous chaque champ chiffré, j'ai ajouté la plage permise en mots (« De 5 (sensible) à 20 (moins sensible) »), parce que les bornes des anciens curseurs (les deux extrémités affichées) disparaissaient avec eux et qu'un champ refuse en silence hors bornes. **Garder ?** | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari sur Mac et sur l'iPad** : les captures sont WebKit sous Playwright (même moteur), pas
  Safari — le rendu des `<select>` et des champs numériques natifs peut différer (leçon du 6 sept.).
- **Le mode sombre n'a été vu que par capture** ; la maquette elle-même n'existait qu'en clair. Les
  variables sont celles des deux modes, et la capture sombre est propre — mais c'est une capture.
- **Le défilement du sommaire** (« Sur cette page ») a été vérifié par lecture (aucun routeur de hash
  dans l'application), pas cliqué.
- **Le verdict Playwright** est produit par `scripts/pousser.sh` au push, après ce fichier.
- **Erreur de la session, rattrapée avant tout commit** : mes deux premiers scripts de greffe ont vidé
  `styles.css` et `index.html` (0 octet chacun) — lecture complète puis écriture sur la sortie
  standard au lieu du fichier. Mesuré aussitôt, restauré depuis HEAD à l'octet près, greffe rejouée
  avec écriture explicite et relecture. Rien de ce vidage n'a atteint un commit.
