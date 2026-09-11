# Portes terrain — 11 septembre 2026 (les mots de l'écran de réglage du dépistage, 1.129.1)

> **Version à l'écran attendue : `1.129.1`, build `0911-0644`.**
> Couvre une livraison de mots, seulement des mots : l'échelle IDME dite avec les mêmes
> quatre mots partout, le bloc « Seuils d'interprétation » qui dit ce que ses champs font,
> deux aides corrigées, « cueillette » devenu « collecte ». **Aucun calcul, aucune couleur,
> aucune borne ne bouge** (mesuré : le multi-ensemble des nombres du diff est identique avant
> et après).
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une
> note mentale.
>
> ⏳ **DUE.** Markdown écrit par Claude Code le 11 septembre à 6 h 50 ; artefact jumeau
> (bouton « Copier mes résultats ») à publier par Cowork.

**Pourquoi cette liste est courte.** Une porte, trois rangées, et c'est la consigne du jour
qui les a fixées. Ce lot ne change que des libellés que tes collègues lisent ; la seule
question à laquelle aucune machine ne répond est « les mots à l'écran sont-ils ceux que tu
as arrêtés ce matin ». Aucune porte ne touche tes données : ce lot n'écrit rien chez toi.
Pas de porte sur les graphiques : ils ne changent pas.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** (pas un fichier local), puis recharge en vidant le cache : **Cmd + Maj + R** | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.129.1`**, build **`0911-0644`**. Si tu lis autre chose, **arrête-toi** : la liste jugerait la version d'avant, et les rouges seraient faux. |

---

## §1 · ⚠⚠ Tes données

> **Aucune porte.** Ce lot n'écrit rien dans ton codex. Les noms des niveaux de tes échelles
> restent exactement ce que tu y as mis.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Les mots de `Labo › Outils d'observation`

> **Pourquoi.** Le même écran écrivait l'échelle IDME de trois façons (« Insuffisant »,
> « Insuffisant ou incomplet », « Excellent »), annonçait des étiquettes IDME au-dessus de
> champs nommés Fragile / Acceptable / Bon, et promettait sur les graphiques des étiquettes que
> le code ne trace pas. Tu as arrêté les mots ce matin ; cette porte vérifie qu'ils sont
> arrivés.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Va dans **Labo → Outils d'observation**, déplie **Paramètres avancés** et lis les quatre lettres de l'échelle IDME là où elles sont écrites en toutes lettres (aide et infobulle 📍 du bloc Taxonomie SOLO) | **Incomplet / Développement / Maîtrise / Étendu**, dans cet ordre. Plus aucun « Insuffisant », « Insuffisant ou incomplet », « Excellent » ni « Excellence » ; ni « en Développement » ni « Maîtrisé ». |
| **2.1b** | Descends au bloc **Micro-données ACP**, déplie **Seuils d'interprétation** et lis le texte sous le titre | Mot pour mot : *« Ces trois seuils colorent les colonnes Assiduité, Complétion, Performance et Mobilisation de la liste des élèves, et qualifient l'engagement dans le profil. Ils ne touchent ni la note ni l'échelle IDME. »* Rien d'autre dans ce bloc ne parle d'IDME ; les trois champs disent toujours Fragile / Acceptable / Bon. |
| **2.1c** | Dans le même écran, lis l'introduction en haut (« Configure les trois piliers… »), la case en tête du bloc Micro-données ACP, et l'aide sous **Indicateurs visuels des seuils** | « **collecte** des micro-données » et « Activer la **collecte** des données… » (plus de « cueillette ») ; l'aide dit *« Lignes pointillées et étiquettes des niveaux de ton échelle sur les graphiques de progression du profil individuel. »* |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des libellés que la consigne m'a dit de ne
> pas renommer dans le doute, et de te lister. Chacun attend un mot de toi, pas une case.

| | Question | Ton verdict |
|---|---|---|
| **3.1** | **L'échelle de départ (IDME) semée chez chaque nouvel utilisateur** (`js/echelles.js`, gabarit) nomme ses niveaux **Incomplet / en Développement / Maîtrisé / Étendu**, et sa description dit « Insuffisant, en Développement, Maîtrisé, Étendu » — elle contredit son propre I. La consigne la laisse (un gabarit renommé n'est plus le même gabarit, et il voyage). Conséquence visible : tout ce qui lit l'échelle (badges, bilan, zones des graphiques) dira « en Développement » / « Maîtrisé » là où la prose de l'application dit « Développement » / « Maîtrise ». **Renommer la SOURCE (le gabarit, pour les prochains espaces) ? Le stock chez toi et chez les testeurs resterait tel quel.** | _______ |
| **3.2** | **Le bilan que l'élève reçoit** (`js/evaluation-retroaction.js:884`) écrit encore « …, Insuffisant) » en dur pour un critère algorithmique effondré à 0 — seul reste des tables IDME retirées en #575 ; tout le reste du bilan lit les noms de TON échelle. **Le remplacer par le nom du niveau I de ton échelle (comme le reste du bilan), ou par « Incomplet » ?** Ce sont des mots que tes élèves lisent. | _______ |
| **3.3** | Trois textes d'aide décrivent le gabarit ou un exemple d'échelle avec ses mots actuels : `accompagnement-contenu-popup.js:182` (« 4 niveaux : Incomplet, en Développement, Maîtrisé, Étendu »), `popup.js:1070-1089` (« Maîtrisé, de 75 % à 89 % », exemple de plage), `index.html:5327` (« Titre du niveau (ex: Maîtrisé) »). Laissés parce qu'ils suivent le gabarit. **Ils suivront ta décision 3.1.** | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **L'écran lui-même.** Aucun navigateur n'a été ouvert sur ce lot : la vérification est
  celle du diff (47 substitutions, chacune adressée par numéro de ligne et contrôlée unique)
  et de Vitest. La porte 2.1 est la seule preuve à l'écran.
- **Le verdict Playwright** est produit par `scripts/pousser.sh` au moment du push, après
  l'écriture de ce fichier ; s'il rougit, le push n'a pas lieu et cette porte ne s'ouvre pas.
- **Le modèle de cartouches** (`js/cartouches.js:191`, niveaux « en Développement » /
  « Maîtrisé ») et **le pack démo** (`js/pack-demo-20.js`, 31 occurrences) suivent la même
  règle que le gabarit : laissés, non vérifiés à l'écran.
- **Erreur de la session, rattrapée** : la phrase du bloc « Seuils d'interprétation » a
  d'abord été visée à la mauvaise ligne (8943 puis 8944, elle est à 8937) ; deux tentatives
  ont échoué sans écrire, la troisième a pris, et le diff relu le confirme.
