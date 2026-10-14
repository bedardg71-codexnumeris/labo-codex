# Porte terrain – clore l'hiver 2026 et en alléger les copies

> Claude Code, 14 octobre 2026. Consigne de Cowork de 10 h 41 ; décision de Grégoire de 10 h 39 (clore l'hiver 2026 pour en archiver les copies, en gardant toutes ses données — moratoire #622 levé pour ce trimestre seulement).
> **Une seule porte, parce que ce sont tes données réelles** : le chemin entier est éprouvé au banc sur un trimestre fictif (`tests/integration/clore-et-alleger-un-trimestre.spec.js`), mais seul ton espace peut dire comment il se comporte avec 394 copies et 1,1 Go.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.

**Où** : sur le **Mac**, dans **Chrome**, à `https://app.codexnumeris.org` — là où vit ton espace réel (tes codex des 1er au 8 oct. viennent tous de « Mac — Chrome »). Pas sur l'iPad.

**Quand** : **après la mise en ligne de ce soir**. Ce lot n'est pas encore poussé : avant, « Clore » parle encore par les fenêtres grises du navigateur, et la porte jugerait l'ancienne version.

**Durée** : non mesurée sur ton volume. Trois gestes lisent ou écrivent 1,1 Go (archiver, vérifier, archiver les copies), plus deux codex. Prévois une heure devant le Mac, sans cours juste après.

**Ce que ça te donne** (mesuré sur ton codex du 8 oct., en lecture seule) : 1 378 Mo décompressés, dont **1 101 Mo de copies de l'hiver 2026**. Après, le codex pèsera **environ 280 Mo**, pour une borne de 2 048 Mo. Au rythme mesuré (≈ 64 Mo par semaine, sur sept codex du 24 sept. au 8 oct.), la borne est à plus de six mois, au lieu de douze semaines sans ce geste.

---

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page | le numéro annoncé avec la release du soir (pas 1.200.0) |
| 0.2 | **Mets ton codex à jour** (bouton du codex, comme d'habitude), avant de toucher à quoi que ce soit | le codex s'écrit, sans message d'erreur ; c'est ton filet si la suite tourne mal |
| 0.3 | Vérifie que **l'automne 2026 est le trimestre actif** (bandeau du Cadre) | « Automne 2026 » ; on ne peut pas clore le trimestre actif |

---

## §1 · ⚠⚠ Données — sur ton espace réel, dans l'ordre

### 1.1 Clore l'hiver 2026

**Pourquoi** : un trimestre clos passe en lecture seule. Le menu « Archiver les copies… » n'apparaît que sur un trimestre clos.

| | Geste | Attendu |
|---|---|---|
| a | Cadre › bibliothèque des trimestres, menu ⋮ de la carte « Hiver 2026 », **Clore** | une fenêtre de l'application (pas une boîte grise) : « Clore le trimestre "Hiver 2026" ? », bouton **Clore** |
| b | Clique **Clore** | la notification « Trimestre "Hiver 2026" clos. » ; la carte passe dans « Trimestres clos », avec **Rouvrir** |

**Ce qui t'arrête** : une notification rouge « Clôture refusée : les cartouches de N grille(s) … n'ont pas encore été migrées ». Rien n'est écrit dans ce cas. Ne recharge pas en boucle : **note le message et arrête-toi là**. Recharger ne relance pas la migration chez toi (elle a déjà eu lieu), donc ce refus serait un défaut à corriger. Au 8 oct., aucune des six grilles de l'hiver 2026 n'était dans ce cas.

### 1.2 Archiver le trimestre

| | Geste | Attendu |
|---|---|---|
| a | Menu ⋮ de la carte close « Hiver 2026 », **Archiver le trimestre…**, confirme | l'archive s'écrit dans ton dossier des archives ; à la fin, « Trimestre archivé » avec le nombre d'étudiant·es et de copies |
| b | Note le nombre de copies annoncé | ______ copies (au 8 oct., le codex en portait 394 pour l'hiver 2026) |

### 1.3 Vérifier l'archive

| | Geste | Attendu |
|---|---|---|
| a | Réglages › Données › Archives, ligne de l'hiver 2026, **Vérifier** | « Archive vérifiée » : « Les N copies et les données du trimestre sont présentes et intactes. » |

**Ce qui t'arrête** : « Archive incomplète ». N'archive pas les copies. Relance 1.2, puis 1.3.

### 1.4 Archiver les copies

| | Geste | Attendu |
|---|---|---|
| a | Bibliothèque, menu ⋮ de « Hiver 2026 », **Archiver les copies…** | une fenêtre « Archiver les copies de Hiver 2026 ? » qui annonce le nombre de copies et leur poids (environ 1,1 Go) |
| b | Clique **Archiver les copies** | le bilan « Les copies de Hiver 2026 sont aux archives » : « N copies retirées. Ton prochain codex sera plus léger d'environ … » |
| c | Note le poids annoncé dans le bilan | ______ |

**Ce qui t'arrête** : « Copies non archivées » avec « Son archive n'est pas vérifiée dans ce navigateur » → refais 1.3. Si le message dit qu'une copie a changé depuis l'archive → « Archiver de nouveau », puis 1.3 et 1.4.

### 1.5 Le codex plus léger

| | Geste | Attendu |
|---|---|---|
| a | Mets ton codex à jour | aucun avertissement de copies manquantes |
| b | Note la taille du nouveau fichier dans le Finder | ______ (attendu : de l'ordre de 0,3 Go, contre 1,36 Go le 8 oct.) |
| c | Ouvre une évaluation de l'hiver 2026 | la note et la rétroaction sont là ; la copie elle-même est marquée « Aux archives » |

---

## §2 · Interface

Rien d'autre à vérifier : « Rouvrir », puis « Clore » de nouveau, sont éprouvés au banc. **Ne rouvre pas l'hiver 2026 pour essayer.**

## §3 · Décisions

Aucune.

## §4 · Ce que je n'ai pas pu vérifier

- **Les durées et la mémoire** sur 1,1 Go : le banc travaille sur trois copies de quelques Ko.
- **Le dossier des archives sous Chrome** : au banc, l'archive est un fichier ZIP choisi à la main (WebKit n'a pas de sélecteur de dossier). Chez toi, Chrome écrit dans ton dossier des archives et « Vérifier » y lit ; les fenêtres peuvent donc différer légèrement de celles décrites ici.
- **Ton espace d'aujourd'hui** : toutes les mesures viennent du codex du 8 oct. Ce que tu as déposé depuis n'est pas compté.
- **L'archive de groupe déjà présente** pour l'hiver 2026 (une ligne dans tes archives depuis le 1er oct.) : je ne sais pas si ce groupe est encore dans l'application. Si « Archiver le trimestre » le signale, note le message.
