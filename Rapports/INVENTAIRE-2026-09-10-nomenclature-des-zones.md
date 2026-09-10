# Inventaire — la nomenclature des zones de couleur (#821, temps 1 et 2)

> **Écrit le 10 septembre 2026 par Cowork**, sur le mandat de
> `plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`, repris à froid.
> Couvre les temps 1 (inventaire) et 2 (archéologie). Les temps 3 et 4 restent ouverts.
> Mesuré sur `5c29d3fd`, version 1.128.3.

---

## 1. ARCHÉOLOGIE — d'où viennent les quatre mots

**Résultat : aucune justification pédagogique. Ce sont les inverses arithmétiques
d'une échelle de risque abandonnée.**

| Date | Commit | Fait mesuré |
|---|---|---|
| automne 2025 | `eb07fe40`, `4ddb851c` | l'échelle est un **risque d'échec** (critique / élevé / modéré / faible), « selon les seuils du Guide » |
| 14 nov. 2025 | `8d46101c` | bascule vers « engagement ». Le message de commit : « Seuils inversés […] échelle positive, **inversée par rapport au risque** ». Cinq paliers : très favorable / favorable / modéré / fragile / **insuffisant**, adossés à `determinerNiveauEngagement()` et à E = ∛(A×C×P) |
| 16 avr. 2026 | `adc8f4b9` | « Chantier RLO 3.1 — Retrait des producteurs de l'indice E ». `determinerNiveauEngagement()` **supprimée**. La chose que les mots nommaient n'existe plus |
| aujourd'hui | — | les quatre libellés survivent **codés en dur** dans la légende (`tableau-bord-apercu.js:1789-1792`). « Insuffisant » a disparu en route. `grep -rn "niveauEngagement" js/` ne rend **aucun consommateur** |

⮕ **Conséquence pour l'arbitrage** : renommer ne renverse aucune décision documentée.
Il n'y a qu'un résidu, orphelin depuis cinq mois.

⮕ **« Modéré » est le seul mot jamais inversé** — un risque modéré et un engagement
modéré se disent pareil. C'est pourquoi il détonne : les trois autres qualifient une
situation, lui qualifie une intensité sur un axe supprimé.

### La décision qui existe, elle, et qui n'était pas citée

`docs/adr/007-vocabulaire-descriptif.md` — Grégoire Bédard, décision du printemps 2026,
formalisée le 14 mai. **« Le vocabulaire de Labo Codex est descriptif, non-prédictif et
non-pathologisant. »** Proscrit nommément « à risque », « risque d'échec », « critique »,
« élève faible », et **« tout vocable qui qualifie la personne plutôt qu'un état observé »**.

⚠ Statut « acté rétroactivement » : formalisé par une session à partir de la posture
publiée de Grégoire (*Pédagogie collégiale*, 2024). Il n'a pas nécessairement lu ce texte.

⚠ Confirmé par Grégoire le 10 septembre, sans que l'ADR lui soit soumis d'abord :
« dans mon esprit, ces bandes sont *un état du contexte d'apprentissage observé* ».
**Le temps 4 de la consigne est donc tranché sur l'intention** ; reste à choisir les mots.

---

## 2. LE DÉFAUT PRINCIPAL — un mot, trois définitions

C'est le constat le plus lourd de l'inventaire, et il n'était dans aucune fiche.

**« Favorable » porte trois seuils différents selon l'écran :**

| Où | Définition mesurée | Source |
|---|---|---|
| Tableau de bord › Aperçu | bande **65 – 82,5 %** de l'indice composite | `tableau-bord-apercu.js:1791` |
| Profil › contexte d'apprentissage | **A ≥ 75 % ET C ≥ 75 %** | `profil-etudiant-calculs.js:2026` |
| Profil › interprétation A-C | **A ≥ 90 % ET C ≥ 90 %** | `profil-etudiant-helpers.js:1049` |

**« Fragile » en porte trois également :**

| Où | Définition mesurée | Source |
|---|---|---|
| Tableau de bord › Aperçu | bande **30 – 47,5 %** | `tableau-bord-apercu.js:1789` |
| Profil › contexte | **A < 65 % OU C < 65 %** | `profil-etudiant-calculs.js:2050` |
| Seuils d'interprétation (réglable) | **< 70 %**, défaut | `interpretation-config.js:55` |

⮕ **Cas concret** : un étudiant à A = 80 %, C = 80 % est **« Favorable »** dans son
profil (≥ 75) et **« Acceptable »** dans l'interprétation A-C du même profil (pas ≥ 90).
Même élève, même écran, deux mots.

⮕ Et `profil-etudiant-sections-affichage.js:1553` traduit `niveau === 'Favorable'` par
la prose « **Excellent** engagement comportemental » — un quatrième mot pour la même chose.

---

## 3. LES MÉCANISMES — quatre, pas trois

La consigne en dénombrait trois. L'inventaire en trouve un quatrième.

| # | Mécanisme | Vocabulaire | Bornes | Classe-t-il ? | Réglable ? |
|---|---|---|---|---|---|
| 1 | Dégradé de l'Aperçu (`tableau-bord-apercu.js`) | Fragile · Modéré · Favorable · Très favorable | 30 / 47,5 / 65 / 82,5 | **NON — continu** | non |
| 2 | Seuils d'interprétation (`interpretation-config.js`) | Fragile · Acceptable · Bon · Excellent (+ « **Critique** » en commentaire l. 55) | 70 / 80 / 85 | oui, 4 paliers | **oui** |
| 3 | Contexte d'élève (`profil-etudiant-calculs.js:2010+`) | Très favorable · Favorable · Modéré · Fragile | A et C : 85 / 75 / 65 | oui, 4 paliers | non |
| 4 | **Interprétation A-C** (`profil-etudiant-helpers.js:1040+`) | Favorable · Acceptable · Complétion fragile · … | A et C : 90 / 80 | oui, ≥ 9 branches | non |

⚠ Le mécanisme 4 **n'était pas inventorié**. Il emploie les mêmes mots que le 3, sur le
même écran, avec des bornes différentes.

---

## 4. LE PÉRIMÈTRE RÉEL — 27 fichiers bruts, 13 dans le périmètre

`grep -rn "Fragile\|Modéré\|Très favorable\|Favorable\|Acceptable\|Excellent" js/ --include=*.js`
rend **27 fichiers**, pas dix. Le tri :

**Dans le périmètre (13)** — les quatre mécanismes et leur prose :
`tableau-bord-apercu.js` · `interpretation-config.js` · `preferences-v2.js` (le panneau de
réglage) · `profil-etudiant-calculs.js` · `profil-etudiant-helpers.js` ·
`profil-etudiant-sections-affichage.js` · `etudiants.js` (l. 260, lit les seuils) ·
`accompagnement-contenu-hover.js` · `accompagnement-contenu-popup.js` ·
`accompagnement-contenu-terme.js` · `pratiques/pratique-configurable.js` ·
`indices.js` · `changelog-data.js`

**Hors périmètre (14)** — homonymes, à ne pas toucher :
`pratiques/pratique-pan-specifications.js` (42 occ. de `seuilAcceptable`, une clé de config
PAN) · `pack-demo-20.js` (31 occ. dans des rétroactions de démo) · `echelles.js`
(« Excellent » comme niveau d'une échelle A/B/C/D/F) · `interventions.js` (prose libre
d'un placeholder) · `bilan-reflexif-rapport.js` (voir ci-dessous) · les autres, isolés.

### ⚠ Une affirmation de la consigne est fausse

La consigne garantissait « zéro occurrence dans […] `bilan*.js` ». **Faux** :
`bilan-reflexif-rapport.js` en porte **dix**, dont une dans un PDF (l. 711,
« Taux de réponses favorables : … % »).

**La conclusion tient malgré tout, mais pour une autre raison** : il s'agit du taux de
réponses favorables à un questionnaire Likert (`v >= 3`), et le PDF est le rapport
d'analyse **de l'enseignant**, pas une rétroaction d'élève. Sens différent, destinataire
enseignant. ⮕ **Hors périmètre — mais le mot est pris**, et une nomenclature candidate
qui réemploierait « favorable » ailleurs devra en tenir compte.

⮕ **La garantie « ces mots ne sortent pas vers les élèves » reste vraie** après
re-mesure, sur les 27 fichiers et non sur dix.

---

## 5. L'ANALYSE LEXICALE — trois axes pour une échelle

Contre l'intention retenue (« un état du contexte d'apprentissage observé ») :

| Mot | Ce qu'il qualifie réellement | Verdict |
|---|---|---|
| **Fragile** | la solidité d'une **personne** (« un élève fragile ») | contredit l'ADR-007 |
| **Modéré** | l'intensité de quelque chose qui n'est plus nommé | vide (résidu du risque) |
| **Favorable** | la favorabilité d'un **contexte** | sur l'axe |
| **Très favorable** | idem, gradué | sur l'axe |

⮕ **Les quatre mots ne sont pas sur le même axe.** C'est l'explication mesurée du
« je ne sais pas sur quoi ils s'appuient » : les deux mots du haut décrivent la
situation, celui du bas décrit l'élève, celui du milieu ne décrit rien.

⮕ **L'app énonce déjà le bon axe et se contredit à deux centimètres** :
`accompagnement-contenu-hover.js:446` dit « une échelle qui **décrit son contexte
d'apprentissage observé**, allant de Fragile à Très favorable ».

---

## 6. DISPOSITIONS

| Constat | Disposition |
|---|---|
| Les quatre mots sont un résidu sans justification (§1) | **inscrit** — `#821` |
| « Favorable » et « Fragile » ont trois définitions chacun (§2) | **à inscrire séparément** — c'est un défaut de cohérence, pas de nomenclature ; il survivrait à un renommage |
| Un quatrième mécanisme non inventorié (§3) | **inscrit** — à rattacher à `#821` |
| « Critique » en commentaire de `interpretation-config.js:55` | **inscrit** — mot proscrit par l'ADR-007 |
| « zéro occurrence dans `bilan*.js` » (consigne) | **périmé** — corrigé au §4, conclusion maintenue |
| « dix fichiers » (consigne) | **périmé** — 27 bruts, 13 dans le périmètre |
| `pratique-pan-specifications.js`, `pack-demo-20.js`, `echelles.js` | **refusé** — homonymes, hors périmètre |

---

## 6 bis. ARBITRAGE DE GRÉGOIRE — 10 SEPTEMBRE 2026

▣ **Décision prise, dans ses mots** : « Peu importe le chiffre, cette incohérence est à
corriger. Il faut unifier les définitions. »
⮕ Le coût n'a **pas** été chiffré, à sa demande explicite. L'unification est acquise.

▣ **Ce qu'il vise, dans ses mots** : « L'application nomme un contexte et on ne sait pas
comment elle fait pour le qualifier ainsi. »
⮕ Reformulation qui déplace la cible : le défaut n'est pas seulement que les définitions
divergent, c'est qu'**aucune n'est justifiée ni visible à l'écran**.

▣ **Dépendance nommée** : le travail d'automne avec l'orthopédagogue « devrait nous
éclairer là-dessus ». ⮕ **Les BORNES et les MOTS attendent ce travail. La SOURCE unique,
non** : elle ne demande aucun arbitrage pédagogique, et elle rend le choix ultérieur
bon marché.

---

## 7. CE QUI RESTE

- **Temps 3** — confrontation au cadre (ELLAC, SOLO, RàI) : non fait.
- **Temps 4** — les nomenclatures candidates chiffrées : non fait. L'intention est
  tranchée (§1), les mots ne le sont pas.
- ⛔ **Rien n'est renommé.** Aucun fichier de `js/` n'a été touché par cet inventaire.
