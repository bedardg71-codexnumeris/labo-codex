# Cahier des charges — Guides des pratiques de notation (révision du 6 juin 2026)

**Date** : 6 juin 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code (implémentation ultérieure) + Grégoire (validation de contenu)
**Statut** : cahier des charges – **révise** `PLAN_guide_PAN_pedagogique_CSE.md` (29 mai 2026)
**Ne touche aucun code.** Document de conception.

---

## 0. Pourquoi cette révision

Le plan du 29 mai (`PLAN_guide_PAN_pedagogique_CSE.md`) était marqué «spec finalisée» et
contenait déjà les 4 pages rédigées d'un guide pédagogique unique. Trois apports de la
session du 6 juin le périment partiellement et justifient une révision avant toute
rédaction définitive :

1. **Girouard-Gagné et al. (2024)** – revue systématique «Évaluer sans noter» (CRIRES) –
   recadre la taxonomie : **PRÉN ≠ PAN** (voir §3). Le plan du 29 mai employait «PAN»
   comme terme générique, y compris pour la dénotation.
2. **La conception du modèle DEN s'est close le 6 juin** (`plans de travail/NOTE-COWORK-modele-DEN.md`).
   Le plan du 29 mai ne traitait la dénotation qu'en une phrase («horizon non implémenté») ;
   on en sait désormais beaucoup plus.
3. **Trois décisions de Grégoire (6 juin)** orientent le livrable vers une version plus
   ambitieuse que le plan initial (voir §1).

> **Caveat de méthode (rigueur).** Ce document distingue partout : **fait** (ce qu'une
> source affirme, citable) ; **inférence** (lien que Labo Codex établit, défendable mais
> non affirmé par la source) ; **décision** (choix de Grégoire, traçable). La même frontière
> doit survivre dans le contenu rédigé des guides.

---

## 1. Décisions actées (Grégoire, 6 juin) et leurs conséquences

| # | Décision | Conséquence directe |
|---|---|---|
| D-A | **Développer la dénotation comme 3e voie** (au même niveau de traitement que Standards et Spécifications), et non plus en une phrase. | Le guide pédagogique présente trois pratiques, pas deux. **Tension à porter** : DEN n'est pas implémentée dans l'app (voir §6.1). |
| D-B | **Guide SOM (sommative) distinct, en porte d'entrée** vers les pratiques alternatives. | Passage de **2 à 3 guides** (voir §2). Confirme l'exigence n°10 de l'audit (`Rapports/AUDIT-assistant-configuration-2026-06-05.md` §5b). |
| D-C | **Terminologie PRÉN/PAN selon la rigueur académique** (Girouard-Gagné) dans le contenu des guides. | Le guide nomme deux familles distinctes (voir §3). **Tension à porter** : l'interface garde le badge «PAN» (voir §6.2). |

Ces trois décisions sont mutuellement cohérentes avec la note DEN du 6 juin (sa Q1 bis
tranchait déjà : «badge PAN dans l'UI, mais nommer clairement PRÉN vs PAN dans le guide
pédagogique»). La seule tension résiduelle réelle est l'écart **guide/produit** créé par D-A
(§6.1) – pas une contradiction interne entre D-A, D-B et D-C.

---

## 2. Architecture : trois guides distincts

Décision du 29 mai (deux guides distincts, pas de guide fusionné de 8 pages) **maintenue et
étendue à trois**. Chacun a son identifiant, son `cssPrefix`, son bouton dans
**Conception → Pratiques de notation**.

| Guide | Identifiant | Rôle | Statut |
|---|---|---|---|
| **Comprendre sa sommative** | `som` *(à confirmer)* | Gateway : ce que mesure une moyenne pondérée, ses règles, ses irritants reconnaissables. Parle au prof de ce qu'il fait **déjà**. | **Nouveau** (D-B) |
| **Modalités d'évaluation** | `pan` | Pédagogique : pourquoi s'éloigner du cumul (CSÉ 2018), les deux familles PAN/PRÉN, les trois pratiques (STD, SPE, DEN). | **Révisé** (ce CDC) |
| **Cadre réglementaire** | `pan-rrec` | Légal : seuil de 60 %, PIEA, responsabilité partagée. | Existant – `PLAN_guide_PAN_refonte_RREC.md` |

**Parcours visé** : `som` (le prof part de sa pratique actuelle) → `pan` (pourquoi et comment
en sortir) → `pan-rrec` (à quelles conditions légales). Le gateway n'impose pas le parcours :
il offre une marche d'entrée à qui n'est pas prêt à lire le guide PAN directement.

> **Décision (Grégoire, 6 juin).** Le gateway `som` est un **guide autonome court** (≤ 3
> pages), un bouton distinct dans le module – pas la page 1 du guide Modalités. Justification :
> son public, le prof qui n'envisage pas encore de changer, n'ouvrira pas un guide intitulé
> «PAN» ; il faut une porte qui parle de ce qu'il fait déjà.

---

## 3. Cadre terminologique (Girouard-Gagné 2024) — le cœur de la révision

**Fait (Girouard-Gagné et al., 2024).** La littérature distingue deux familles :

- **PAN — pratiques alternatives de notation** : elles *renouvellent* la notation sans
  l'abandonner (standards / maîtrise, spécifications, contrat). On note encore, mais
  autrement : on certifie l'atteinte plutôt qu'on additionne des points.
- **PRÉN — pratiques de réduction ou d'élimination de la notation** : elles critiquent la
  notation *en tant que telle* et séparent l'apprentissage et la rétroaction de la note.
  La **dénotation / *ungrading*** appartient à cette famille.

**Fait (Girouard-Gagné, distinction décisive).** *Noter ≠ évaluer.* La notation a deux
fonctions propres : **standardiser** (situer par rapport à un étalon) et **trier** (classer).
Les PRÉN abandonnent **le tri**, conservent **la certification**. Conséquence pour le guide :
la dénotation n'est pas «pas de note» — c'est «une note de certification (le RREC l'exige),
jamais une note de classement».

**Inférence (Labo Codex).** L'app range pour l'instant les trois pratiques alternatives
(codes actuels `STD`, `SPE`, `DEN`) sous un même badge «PAN», par commodité d'interface et
par fidélité au billet de vulgarisation du CoP (qui présente la dénotation comme une «3e
famille PAN»). **Le guide doit dire que cette commodité est une approximation** :
académiquement, Standards et Spécifications sont des PAN ; la dénotation est une PRÉN. C'est exactement la note terminologique exigée par
la décision Q1 bis de la note DEN, à poser à trois endroits (registre, SKILL, **et ce
guide**).

**Conséquence rédactionnelle.** Le guide Modalités présente le paysage en **deux familles** :

> Les **PAN** gardent la note mais changent sa logique : elles certifient ce que tu sais
> faire à la fin (Standards, Spécifications). Les **PRÉN** vont plus loin : elles réduisent
> ou éliminent la note pour que la rétroaction agisse seule (Dénotation). Les trois sont
> des alternatives au cumul de points ; elles ne sont pas au même endroit du continuum.

Ainsi, «3e voie» (D-A) ne signifie **pas** «3e PAN» : DEN est la **troisième pratique
présentée**, mais elle relève d'une **autre famille** (PRÉN). Le guide doit rendre cette
nuance visible plutôt que la lisser — c'est le sens même de la décision D-C.

---

## 4. L'échelle de gradation (ossature de la partie PRÉN/DEN)

**Fait (Girouard-Gagné, Figure 1 ; Normann et al.).** Les PRÉN se déploient sur un
continuum de rupture, du plus prudent au plus radical :

1. **Dissimuler / différer** la note — la rétroaction passe d'abord (notes masquées,
   différées). *L'entrée la plus prudente.*
2. **Réduire** l'intervention de la note — fréquence moindre, mention réussi/échoué sur
   certaines épreuves, différenciation par d'autres modalités.
3. **Éliminer** la note sur certaines épreuves (ou tout le cours) — évaluation narrative,
   jugement global certificatif en fin de parcours.

**Fait (Pulfrey ; Butler ; Black & Wiliam, via Girouard-Gagné).** Bonifier la rétroaction
n'a presque **aucun effet si une note l'accompagne**. C'est la *dissociation* note/rétroaction
qui fait travailler la rétroaction. → Le guide doit présenter le niveau (1) «note différée»
non comme un demi-pas timide mais comme **le levier empirique central** des PRÉN.

**Correspondance avec le modèle DEN à deux couches** (note DEN, callout §5) — à refléter
dans le guide **avec exactitude sur le statut d'implémentation** :

- **Couche 1 — «note différée»** (gradation niveau 1) : option d'affichage transversale,
  applicable au-dessus de n'importe quelle famille, **ne change pas la valeur finale**.
  Chantier distinct → **BACKLOG #321**, non implémenté.
- **Couche 2 — DEN-proper** (badge DEN) : note finale **saisie** (jugement), **gardée** par
  une confirmation «cibles atteintes», avec **suggestion holistique optionnelle** (ancrage
  anti-biais, Dyer). Modes **réduite** / **éliminée**. → **#318**, non implémenté.

---

## 5. Plan de contenu des trois guides

### 5.1 Guide «Comprendre sa sommative» (`som`, gateway — nouveau)

Court (≤ 3 pages). Registre : **descriptif et non militant** — jamais de dénigrement du
sommatif (cf. exigence audit n°3 : «partir des irritants reconnaissables, jamais du
dénigrement»). Sources : CSÉ 2018 (le défaut du cumul, sans le présenter comme un procès) ;
audit §5b a11.

- **Page 1 — Ce que mesure une moyenne pondérée.** La somme pondérée, ce qu'elle dit et ce
  qu'elle tait ; «sommatif» au sens de Scallon = *bilan*, pas *addition* (CSÉ, citant
  Scallon). Distinction *compter* / *prendre en compte* posée ici, en germe.
- **Page 2 — Tes règles spéciales.** Remplacement automatique = **une forme de reprise sans
  pénalité** (nommer le pilier déjà pratiqué — audit a11) ; pondérations ; note de passage.
- **Page 3 — Quand la moyenne te gêne.** Les irritants reconnaissables (négociation de
  points, premières erreurs qui pèsent au bulletin, rétroaction ignorée parce qu'une note
  l'accompagne). **Pont explicite** vers le guide Modalités : «si ces irritants te parlent,
  il existe d'autres manières de noter».

### 5.2 Guide «Modalités d'évaluation» (`pan`, révisé)

Reprend l'ossature du 29 mai en l'élargissant à la partie PRÉN/DEN et en corrigeant la
terminologie. **Référence de page 1** (inchangée du 29 mai) : CSÉ 2018 (chap. 2-3) +
Talbert & Clark (2023), à compléter par Girouard-Gagné et al. (2024) pour la partie
familles/PRÉN.

- **Page 1 — Pourquoi sortir du cumul de points.** (Quasi inchangée du 29 mai — déjà solide.)
  Les deux finalités de l'évaluation (CSÉ) ; le défaut du cumul («on garde aussi la trace
  des premières erreurs…») ; *compter ≠ prendre en compte*. Si le gateway `som` existe en
  guide autonome, cette page peut s'alléger (le «défaut du cumul» y est déjà amorcé).
- **Page 2 — Deux familles d'alternatives.** **Nouveau, cœur de la révision (D-C).** Pose
  PAN (renouveler la note) vs PRÉN (réduire/éliminer la note), la distinction *noter ≠
  évaluer* (abandonner le tri, garder la certification), l'échelle de gradation (§4). Note
  terminologique sur le badge «PAN» de l'interface (§6.2).
- **Page 3 — Les pratiques disponibles : Standards et Spécifications (PAN).** Reprend le
  29 mai. **Code : `STD`** (canonique – voir §6.3). Standards = niveaux de maîtrise (IDME),
  transposition du *bulletin descriptif* du CSÉ ; Spécifications = conforme/non conforme +
  forfaits, la forme «succès ou échec» notée par le CSÉ.
- **Page 4 — La dénotation : une PRÉN à l'horizon.** **Décision Grégoire (6 juin) : page
  d'horizon courte jusqu'à l'implémentation de #318** (pas la page développée). Le concept
  est posé en page 2 (PRÉN = réduire/éliminer la note) ; cette page reste brève : ce qu'est
  la dénotation en deux ou trois phrases (rétroaction dissociée de la note ; note finale
  jugée et non «pas de note» – le RREC certifie toujours), les deux garde-fous essentiels
  (équité/Dyer : traces + critères explicites ; santé mentale/Girouard-Gagné : pas un bien
  universel), et un énoncé de statut sans détour : **la dénotation n'est pas encore activable
  dans Labo Codex ; elle est mentionnée pour situer le paysage**. La page développée
  (modes, échelle de gradation détaillée, mécanique) attendra #318/#321 – on retirera alors
  l'énoncé d'horizon et on enrichira. Voir §6.1.
- **Page 5 — Choisir en conscience.** Reprend la page 4 du 29 mai : une pratique n'est pas
  une fin en soi (rétroaction + dispositif RàI) ; le jugement professionnel prime
  («l'algorithme propose, le jugement tranche» — fil rouge, audit n°9) ; note vs dépistage ;
  renvoi au guide Cadre réglementaire.

### 5.3 Guide «Cadre réglementaire» (`pan-rrec`, existant)

Hors périmètre de ce CDC. Renvoi seul. Veiller à la cohérence des renvois croisés entre les
trois guides (le guide Modalités renvoie à `pan-rrec` en page 5 ; le gateway renvoie à
`pan`).

---

## 6. Tensions et risques explicités (à ne pas lisser)

### 6.1 Écart guide/produit — DEN décrite mais non implémentée *(risque principal)*

D-A demande de développer la dénotation comme 3e voie. Or DEN n'est **pas implémentée**
(couche 1 = #321, couche 2 = #318 ; aucun code). Le plan du 29 mai évitait précisément ce
risque — son test fonctionnel exigeait : «dénotation mentionnée comme non implémentée».

**Le risque est réel** : un guide qui décrit en détail une pratique inaccessible crée une
attente que l'app déçoit, et brouille la frontière entre «ce que l'app fait» et «ce que la
littérature propose». C'est le type d'écart que la règle zéro-dette du projet cherche à
éviter côté code, transposé au contenu.

**Résolution (Grégoire, 6 juin) : page d'horizon courte jusqu'à #318.** Le concept des
PRÉN est posé en page 2 (la dénotation existe donc comme catégorie dans le paysage – D-A
satisfaite au plan conceptuel), mais la **page 4 reste brève** tant que la pratique n'est
pas livrée : énoncé de statut sans ambiguïté («pas encore activable»), deux garde-fous,
pas de mécanique détaillée. C'est le principe zéro-dette appliqué au contenu : le guide ne
décrit pas finement une fonction que l'app n'offre pas. À l'implémentation de #318/#321,
on enrichira la page 4 (modes, gradation, mécanique) et on retirera l'énoncé d'horizon.
Avantage : aucune attente déçue, aucune frontière brouillée entre «ce que l'app fait» et
«ce que la littérature propose».

### 6.2 Écart guide/interface — terminologie PRÉN vs badge «PAN»

D-C fait adopter au guide la terminologie académique (DEN = PRÉN), alors que l'interface
affiche un badge famille «PAN» pour les trois pratiques alternatives (registre
`pratique-registre.js` l. 73 : `denotation: { famille: 'PAN' }`). Un lecteur attentif verra
«PRÉN» dans le guide et «PAN» sur le badge.

**Résolution (déjà actée, note DEN Q1 bis).** Assumer l'écart par une **note terminologique
explicite** dans le guide : «Dans l'application, la dénotation porte par commodité le badge
"PAN" ; la recherche la classe plus précisément parmi les PRÉN.» L'écart devient pédagogique
(il enseigne la nuance) plutôt que confusant. Le commentaire jumeau côté registre reste à
poser par Claude Code (reste-à-faire du relais §0).

### 6.3 Code de la pratique Standard — STD (canonique)

**Fait + décision (Grégoire, 6 juin).** Le code canonique est **`STD`** : registre
`pratique-registre.js` l. 71 (source unique du triplet depuis la Session B du 4 juin) et
`gabarits-utils.js` l. 25. La mention «SDT» du plan du 29 mai était une **erreur** (ou un
projet abandonné) ; **on ne renomme pas**. Tout le contenu rédigé doit dire **`STD`**, ce
qui colle exactement à ce que l'utilisateur voit dans l'app : aucun écart guide/interface,
aucun chantier de renommage.

> Le badge legacy `'PAN'` du wizard pour `pan-standards` reste un vestige distinct, à
> unifier hors de ce chantier le jour venu — sans impact sur le code canonique `STD`.

---

## 7. Exigences de contenu transversales (audit §5b)

Les guides doivent répondre, répartis entre `som`, `pan` et `pan-rrec`, aux dix exigences de
l'audit de l'assistant. Ossature centrale du guide Modalités = **les cinq questions du
débutant** (formulation Grégoire) :

1. Par quoi commencer ?
2. Qu'est-ce qui guide mes choix ?
3. Dois-je trancher tout de suite (standards ou spécifications) ?
4. Comment choisir un système de jetons ?
5. Est-ce que je me crée une montagne d'évaluations ?

Autres exigences : intention avant la mécanique (n°2) ; transition SOM→PAN comme passage,
pas conversion (n°3) ; reprises raisonnables (n°4) ; jetons – usages, expiration, dérives
(n°5) ; erreurs classiques – avalanche, tour de standards (n°6) ; transparence envers les
étudiants (n°7) ; contraintes cégep – PIEA, note chiffrée (n°8, → `pan-rrec`) ; posture
«l'algorithme propose, le jugement tranche» (n°9, fil rouge). L'exigence n°10 (guide SOM)
est satisfaite par la décision D-B.

> **Mécanique de renvoi** (audit §5b) : les guides sont appelés depuis le moteur
> d'assistance/popups aux moments chauds du wizard (Q1, config-jetons, config-portfolio,
> récapitulatif). Coordination avec le plan découvrabilité et #319 — hors périmètre de ce
> CDC, à garder en vue.

---

## 8. Tests fonctionnels

- **Exactitude des citations CSÉ** : vérifier mot pour mot les extraits (chap. 2-3) :
  «la note finale ne serait pas un cumul…», «on garde aussi la trace des premières
  erreurs…», la forme «succès ou échec», *compter* / *prendre en compte*.
- **Exactitude des apports Girouard-Gagné** : distinction PAN/PRÉN ; *noter ≠ évaluer*
  (standardiser/trier) ; effet rétroaction+note (Pulfrey/Butler/Black & Wiliam) ; échelle
  de gradation. Aucune de ces affirmations ne doit être attribuée au CSÉ.
- **Frontière faits / lecture** : aucune phrase n'attribue les PAN ni les PRÉN au CSÉ. Le
  rapport justifie l'exploration ; il ne prescrit pas ces pratiques.
- **Exactitude produit** : STD et SPE décrites comme disponibles ; SOM comme non-PAN, point
  de contraste ; **DEN en page d'horizon courte, marquée non activable** (§6.1) ; note
  terminologique PAN/PRÉN présente (§6.2) ; code **STD** partout (canonique, §6.3).
- **Cohérence des renvois croisés** entre les trois guides.
- **Modes clair/sombre + accessibilité** : comme les autres guides (contraste ≥ 4.5:1,
  navigation clavier, focus visible, cibles tactiles ≥ 44 px sur iPad).

---

## 9. Décisions (Grégoire, 6 juin) et points résiduels

**Tranché :**

1. **Statut du gateway `som`** : ✅ **guide autonome court** (≤ 3 pages), bouton distinct (§2, §5.1).
2. **Profondeur DEN** : ✅ **page d'horizon courte jusqu'à #318** ; concept posé en page 2,
   page 4 brève + énoncé de statut (§5.2, §6.1).
3. **Code de la pratique Standard** : ✅ **`STD`** (canonique) ; le guide écrit `STD`, pas de
   renommage. La mention «SDT» du plan du 29 mai était une erreur (§6.3).

**Résiduel :**

4. **Identifiant du gateway** : `som` proposé – à confirmer (cohérence avec `pan` / `pan-rrec`).
5. **Numéro de beta** et entrée de changelog – au moment du commit, par le script de release.

---

## 10. Étapes suivantes

1. Grégoire tranche les points du §9.
2. Rédaction des pages (HTML, format `GUIDES_PEDAGOGIQUES.*.pages`) — Cowork peut produire
   le contenu ; Claude Code l'intègre.
3. Vérification des citations sur sources primaires (CSÉ 2018 intégral + Girouard-Gagné PDF,
   dossier Cowork).
4. Intégration + tests fonctionnels (§8) + validation terrain Mac/iPad, deux modes.
5. Commit (`som`/`pan` pédagogiques ; `pan-rrec` couvert par son propre plan).

---

**Paire avec** : `PLAN_guide_PAN_pedagogique_CSE.md` (29 mai, **révisé par ce document**) ·
`PLAN_guide_PAN_refonte_RREC.md` (cadre légal) · `plans de travail/NOTE-COWORK-modele-DEN.md`
(modèle DEN, conception close) · `Rapports/AUDIT-assistant-configuration-2026-06-05.md` §5b
(ébauche d'exigences).
**Sources de contenu** : CSÉ 2018, *Évaluer pour que ça compte vraiment* (chap. 2-3) ·
Girouard-Gagné et al. 2024, *Évaluer sans noter* (CRIRES) · Talbert & Clark 2023,
*Grading for Growth* · corpus `description des pratiques de notation/` (dossier Cowork).

**Fin du cahier des charges.**
