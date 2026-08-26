# Portes terrain — convergence des duplications (#476 volet 2)

**Date** : 24 août 2026 · **Branche** : `claude/fusion-24-fonctions-dupliquer-qrop3b`
**Artefact jumeau** : https://claude.ai/code/artifact/6a591ac7-8202-45fa-8d9f-d330bcaeef43
**Origine** : les onze verdicts de
`plans de travail/ARBITRAGE-2026-08-24-476-volet2-duplications.md` (D0 = convergence).

> ⚠ **CETTE LISTE A ÉTÉ RAMENÉE DE 24 PORTES À 3, le 24 août, et c'est une
> correction d'erreur — pas un relâchement.**
>
> La première version demandait à Grégoire de vérifier à la main 24 choses. Le
> banc de caractérisation (`tests/integration/carac-476-volet2-duplication.spec.js`)
> en mesurait déjà **19**, dans un vrai navigateur, contre le vrai `index.html`.
> Le modèle des portes terrain dit pourtant, noir sur blanc, de ne pas lister de
> portes sans objet : le gabarit a été appliqué mécaniquement.
>
> La 20ᵉ — « la copie s'ouvre-t-elle vraiment MODIFIABLE à l'écran ? » — était un
> vrai trou : le banc vérifiait la donnée (`isDemo`, l'auteur), pas le rendu du
> formulaire. **Elle est désormais automatisée** (bloc « le formulaire de la copie
> est réellement éditable », break-test fait).
>
> Et les 3 portes iPad avaient été posées par réflexe : **ce chantier n'a touché
> aucun CSS ni aucune mise en page.** Il n'y avait rien de spécifique à l'iPad à
> y voir.
>
> ⮕ **Règle retenue pour la suite : une porte n'existe que si aucune machine ne
> peut répondre.** Quand une vérification est automatisable, elle coûte une heure
> une fois, au lieu de dix minutes à Grégoire à chaque cycle.

---

## §0 · Préalable

**`git pull`**, puis **vérifier le numéro de version en bas de page**. Ton app
tourne en `file://` depuis ton clone : elle est à la version de ton dernier
`git pull`. Un build en retard décrit exactement l'état d'avant le correctif —
soit ce que la porte teste — et le faux rouge est alors indétectable au récit.

*(Pas de sauvegarde exigée : ces portes créent des copies, elles ne modifient ni
ne suppriment rien. Et rien dans ce chantier ne touche tes données existantes.)*

---

## §1 · Les trois portes — ce que seule ta machine et ton corpus peuvent dire

### 1.1 · Le correctif principal, sur une VRAIE grille d'exemple

> **Ce que tu vivais.** Tu voyais une grille d'exemple en lecture seule, l'app te
> disait d'en faire une copie pour l'utiliser — et la copie s'ouvrait en lecture
> seule elle aussi.

| | Geste | Attendu |
|---|---|---|
| 1.1a | Module **Grilles**. Prends une grille d'**exemple** de ta bibliothèque et duplique-la depuis la **barre latérale**. | Une copie est créée et s'ouvre. |
| 1.1b | Regarde la copie. | **Les champs sont modifiables**, plus de bandeau « exemple », et l'auteur c'est **toi**. |

*Ce que ça ajoute à la machine : tes vraies grilles, avec leurs vrais champs — et
le rendu sous **Safari**, que le conteneur de session ne peut pas produire.*

### 1.2 · La production, sur un vrai cas à toi

> **Ce que tu vivais.** La copie portait exactement le même titre que
> l'originale, et sa description était silencieusement remplacée par le texte de
> l'activité d'apprentissage.

| | Geste | Attendu |
|---|---|---|
| 1.2a | Module **Productions**. Prends une production dont la **description** dit autre chose que l'activité — note son texte. | *(mesure : écris-le dans l'artefact)* |
| 1.2b | Duplique-la, puis ouvre la copie. | Le **titre** finit par « (copie) », et **la description notée est intacte**. |

### 1.3 · Rien n'a empiré sur ce que tu fais tous les jours

| | Geste | Attendu |
|---|---|---|
| 1.3a | Fais une duplication que tu fais d'habitude — celle de ton usage courant, quel que soit le bouton. | Rien de cassé, rien de surprenant. |

*Cette porte-là n'a pas d'attendu précis, et c'est voulu : elle sert à ce que ton
œil attrape ce à quoi je n'ai pas pensé.*

---

## §2 · Deux décisions qui attendent ton verdict

**Ce ne sont pas des vérifications** — il n'y a rien à cocher, seulement à écrire.

### 2.1 · Faut-il réparer les copies déjà faites ?

Les correctifs valent pour les **nouvelles** duplications. Les copies que tu as
déjà faites depuis la barre latérale restent marquées « exemple », donc non
modifiables. Les libérer demanderait un correctif ponctuel sur tes données.

**VERDICT (26 août 2026)** : **OUI — un correctif ponctuel.**

⮕ Livré : `scripts/reparation-476-copies-marquees-exemple.js`.
`await reparer476()` en dry-run d'abord (il n'écrit rien et imprime le plan),
puis `await reparer476({executer: true})` après un backup Codex.
`annuler476()` revient en arrière dans la même session.

⚠ Le critère : marque démo **ET** id absent de `PACK_DEMARRAGE`. Le drapeau seul
ne suffit pas — les exemples fournis le portent aussi, et les libérer casserait
la démo. Si le pack n'est pas chargé, le script **refuse** : « id absent du pack »
deviendrait vrai pour tout. Verrouillé par
`tests/unit/sentinelle-476-reparation-copies-demo.test.js` (7 cas, 2 break-tests
ROUGE, dont celui-là).

### 2.2 · Une correction que tu n'as pas arbitrée nommément

Ton verdict D3 nommait trois fonctions ; une **quatrième** portait le même défaut
(le « Dupliquer et éditer » d'une production concaténait aussi « (copie) » à la
main). Je l'ai corrigée au titre de la convergence, sans que tu l'aies décidée.

**VERDICT (26 août 2026)** : **GARDER.** Même défaut, même remède : la quatrième
voie rejoint les trois autres. C'est la convergence retenue en D0, appliquée sans
exception.

---

## §3 · Ce que je n'ai pas pu vérifier

1. **Safari et iPad.** Le conteneur n'a que Chromium. Le risque est faible ici —
   aucun CSS ni aucune mise en page n'a bougé — mais il n'est pas nul, et c'est
   la porte 1.1 qui le couvre incidemment.
2. **D6 n'est pas corrigée**, et ce n'est pas un oubli : ton verdict était « à
   instruire séparément » (identifiants de critères partagés entre une grille et
   sa copie ; il faut d'abord mesurer l'effet dans le module Évaluation).
3. **Ton corpus réel.** Toutes mes mesures portent sur des jeux d'essai. C'est
   exactement ce que les trois portes ci-dessus vont chercher.
4. **Les copies déjà faites ne sont pas réparées** (décision 2.1).
