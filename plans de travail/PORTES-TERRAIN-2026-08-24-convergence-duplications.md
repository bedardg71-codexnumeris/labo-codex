# Portes terrain — convergence des duplications (#476 volet 2)

**Date** : 24 août 2026 · **Version à vérifier** : voir §0
**Branche** : `claude/fusion-24-fonctions-dupliquer-qrop3b`
**Artefact jumeau** : https://claude.ai/code/artifact/6a591ac7-8202-45fa-8d9f-d330bcaeef43
(24 portes ✓/✗, une mesure à saisir, deux décisions, bouton « Copier mes résultats »,
filtres « iPad seulement » et « à faire seulement ».)
**Origine** : les onze verdicts de
`plans de travail/ARBITRAGE-2026-08-24-476-volet2-duplications.md` (D0 =
convergence délibérée, avec porte terrain Mac + iPad).

> **Ce qui échoue ici devient un item de BACKLOG avec son numéro de porte.**
> Jamais une note mentale.

---

## §0 · Préalable — à faire AVANT tout le reste

0.1 **`git pull`**, puis **vérifier le numéro de version en bas de page**.
    ⚠ Ton app tourne en `file://` depuis ton clone : elle est à la version de ton
    dernier `git pull`, pas à celle de `main`. Deux des quatre échecs des 81
    portes du 10 août étaient des faux rouges venus de là — et ce type de faux
    rouge est **indétectable au récit**, parce qu'il décrit exactement l'état
    d'avant le correctif, qui est précisément ce que la porte teste.

0.2 **Sauvegarde du Codex.** Les portes du §1 créent de vraies copies dans tes
    bibliothèques. Rien n'est modifié ni supprimé — mais on sauvegarde quand même.

0.3 **Les deux appareils** (Mac *et* iPad) et **les deux modes** (clair *et*
    sombre). Le conteneur de session n'a ni Safari ni iPad : c'est toi, et toi
    seul, qui peux les trancher.

0.4 ⚠ **Ce que ces correctifs NE font PAS.** Ils changent ce que produisent les
    **nouvelles** duplications. Les copies que tu as **déjà** faites gardent leur
    ancienne forme : celles issues de la barre latérale restent marquées
    « exemple » et donc non modifiables. Une porte du §3 te demande si tu veux
    qu'on les répare.

---

## §1 · ⚠⚠ Données — ce que tu exécutes sur ton corpus

### 1.1 · Le correctif principal — dupliquer un exemple le rend enfin modifiable

> **Ce que tu vivais.** Tu voyais une grille d'exemple fournie avec Labo Codex,
> en lecture seule. L'app te disait d'en faire une copie pour l'utiliser. Tu
> cliquais « Dupliquer » dans la barre latérale — et **la copie s'ouvrait en
> lecture seule elle aussi**, champs grisés, bandeau « exemple » toujours là.

| | Geste | Attendu |
|---|---|---|
| 1.1a | Ouvre le module **Grilles**. Repère une grille d'**exemple** (bandeau « exemple fourni par Labo Codex »). | Elle est bien en lecture seule — c'est normal. |
| 1.1b | Dans la **barre latérale**, clique « Dupliquer » sur cette grille. | Une copie est créée et s'ouvre. |
| 1.1c | Regarde la copie. | **Les champs sont MODIFIABLES.** Plus de bandeau « exemple ». *(Avant : champs grisés.)* |
| 1.1d | Regarde l'auteur de la copie. | **C'est TON nom**, pas celui de la source. *(Avant : l'auteur d'origine.)* |
| 1.1e | Modifie le nom de la copie et enregistre. | L'enregistrement passe. |

### 1.2 · Le même correctif, côté échelles

| | Geste | Attendu |
|---|---|---|
| 1.2a | Module **Échelles**, une échelle d'**exemple**, « Dupliquer » depuis la **barre latérale**. | Une copie est créée. |
| 1.2b | Regarde la copie. | Champs **modifiables**, plus de bandeau « exemple », auteur = toi. |

### 1.3 · Aucune régression sur une duplication ordinaire

> Le correctif ne doit rien casser sur ce qui marchait déjà.

| | Geste | Attendu |
|---|---|---|
| 1.3a | Duplique une grille **à toi** (pas un exemple) depuis la barre latérale. | La copie se crée, s'ouvre, et reste modifiable comme avant. |
| 1.3b | Duplique une grille depuis la **modale de bibliothèque** (bouton « Dupliquer » de la carte). | Même résultat qu'avant : une copie à toi, dans ta bibliothèque. |

---

## §2 · Interface — ce que tu vérifies à l'écran

### 2.1 · Dupliquer une production renomme enfin la production

> **Ce que tu vivais.** La copie portait **exactement le même titre** que
> l'originale — rien ne les distinguait dans la liste. Et la description était
> silencieusement remplacée par le texte de l'activité d'apprentissage.

| | Geste | Attendu |
|---|---|---|
| 2.1a | Module **Productions**. Prends une production dont la **description** dit autre chose que l'activité. Note son texte. | *(mesure — écris-le dans l'artefact)* |
| 2.1b | Duplique-la. | La copie apparaît. |
| 2.1c | Lis le **titre** de la copie dans la liste. | Il finit par **« (copie) »** — on la distingue de l'originale. *(Avant : titre identique.)* |
| 2.1d | Ouvre la copie et lis sa **description**. | **Le texte noté en 2.1a est intact.** *(Avant : écrasé par l'activité.)* |
| 2.1e | Lis l'**activité d'apprentissage** de la copie. | Elle est intacte, sans « (copie) » ajouté. |

### 2.2 · « (copie) (copie) » ne revient plus — CO-24

> Le défaut que tu avais signalé, corrigé en août mais resté vivant sur les
> productions et les pratiques.

| | Geste | Attendu |
|---|---|---|
| 2.2a | Duplique une production, **puis duplique la copie**. | Le second titre est **« … (copie 2) »**. *(Avant : « (copie) (copie) ».)* |
| 2.2b | Duplique **encore** cette deuxième copie. | **« … (copie 3) »**. |
| 2.2c | Même chose sur une **pratique** : duplique, puis duplique la copie. | **« … (copie 2) »**. *(Avant : « (copie) (copie) ».)* |

### 2.3 · L'invite de duplication d'une pratique propose enfin un nom utile

| | Geste | Attendu |
|---|---|---|
| 2.3a | Module **Pratiques**. Clique « Dupliquer » sur une pratique. | Une invite s'ouvre. |
| 2.3b | Lis le nom **proposé** dans l'invite. | C'est **le nom de la pratique suivi de « (copie) »**. *(Avant : « Copie de pratique », qui ne disait pas de quoi.)* |

### 2.4 · La copie d'un gabarit n'est plus un gabarit

| | Geste | Attendu |
|---|---|---|
| 2.4a | Prends une pratique marquée **gabarit**. Utilise **« Dupliquer et éditer »**. | Une copie s'ouvre en édition. |
| 2.4b | Regarde si la copie est présentée comme un gabarit. | **Non** — c'est une pratique ordinaire. *(Avant : elle restait gabarit par ce bouton, mais pas par l'autre.)* |

### 2.5 · Les deux appareils, les deux modes

| | Geste | Attendu |
|---|---|---|
| 2.5a | Refais **1.1** sur **iPad**. | Même résultat qu'au Mac. |
| 2.5b | Refais **2.1** sur **iPad**. | Même résultat qu'au Mac. |
| 2.5c | Passe en **mode sombre** et regarde une carte de bibliothèque après duplication. | Rien d'illisible, rien qui déborde. |

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Ce sont des choix que je ne peux pas
trancher à ta place. **Écris un verdict, ne coche pas.**

### 3.1 · Faut-il réparer les copies déjà faites ?

Les correctifs valent pour les **nouvelles** duplications. Les copies que tu as
déjà faites depuis la barre latérale restent marquées « exemple » et donc non
modifiables — il faudrait une réparation ponctuelle pour les libérer.

- **Ne rien faire** : elles restent bloquées ; tu les redupliques au besoin.
- **Réparer** : on écrit un correctif ponctuel qui retire la marque « exemple »
  et réattribue les copies visiblement issues d'une duplication. ⚠ Touche tes
  données réelles ; demanderait sa propre porte terrain.

**VERDICT** : ________________________________________________

### 3.2 · Un point que tu n'as pas arbitré nommément

Ton verdict D3 nommait trois fonctions. Une **quatrième** portait exactement le
même défaut — le bouton « Dupliquer et éditer » d'une production concaténait lui
aussi « (copie) » à la main. Je l'ai corrigée avec les autres, au titre de
l'orientation « convergence » (D0), mais **tu ne l'as pas décidée nommément**.

**VERDICT** (garder la correction, ou la retirer ?) : ____________________

---

## §4 · Ce que je n'ai pas pu vérifier

**Non négociable — une liste qui ne déclare pas ses angles morts se fait croire
complète.**

1. **Ni Safari, ni iPad.** Le conteneur n'a que Chromium. Tout ce qui est
   au-dessus a été mesuré sur Chromium : 32 cas au banc de caractérisation, et
   la suite d'intégration complète en double passe. **La cible de production est
   WebKit** — c'est exactement pourquoi cette liste existe.

2. **D6 n'est pas corrigée, et ce n'est pas un oubli.** Ton verdict était « à
   instruire séparément » : selon le bouton, les critères d'une grille copiée
   sont neufs ou partagent leurs identifiants avec l'originale. Il faut d'abord
   mesurer ce que ça produit dans le module Évaluation. **Rien dans cette liste
   ne teste ce point.**

3. **Je n'ai pas vérifié sur tes VRAIES données.** Toutes mes mesures portent
   sur des jeux d'essai fabriqués. Les portes 1.1 à 2.4 sont précisément là pour
   passer sur ton corpus.

4. **Deux erreurs de méthode de cette session, à connaître.**
   - Mon banc écrivait d'abord ses données d'essai dans le stockage partagé sans
     nettoyer : suite complète verte une fois, **dix rouges** à l'exécution
     suivante, dans des tests sans rapport. **Une seule passe verte en
     intégration ne prouve rien.**
   - Un cliquet que j'avais posé la veille interdisait une ligne dans un
     **fichier entier** ; la correction légitime d'aujourd'hui l'a fait rougir à
     tort. Il porte désormais sur le **corps de la fonction** visée. Un cliquet
     trop large ne protège pas mieux — il interdit des correctifs justes.

5. **Les copies déjà faites ne sont pas réparées** (voir 3.1) — c'est un choix
   en attente, pas un défaut du correctif.
