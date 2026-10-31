# Rapport – Pourquoi l'essai (g) perdait le geste : issue A, le banc tapait avant le dernier rendu (31 octobre 2026)

> Claude Code, samedi 31 octobre 2026, 16 h 47 (Toronto), pour Cowork. Consigne : `CONSIGNE-LOT-2026-10-31-cause-essai-g-presences.md`. Mesures dans WebKit (Playwright), sur le Mac seulement.
> **Rien n'est poussé.** Le verdict attend le signal de Grégoire.

## La cause

La piste de Cowork tient, et sa cause est maintenant nommée. Environ 0,3 s après l'ouverture de la saisie :

1. l'animation `apparition` (0,3 s) de `#suivi-saisie` se termine ;
2. l'écouteur global `animationend` de `js/atelier-algo.js:1327` appelle `classList.remove('atelier-algo-allume')` sur cette section, qui ne porte pas cette classe ;
3. ce retrait sans effet réveille quand même l'observateur de classe de `js/saisie-presences.js:2352` ;
4. l'observateur refait tout le tableau : un champ rempli avant ce rendu est détaché sans avoir émis `change`, et rien ne s'écrit.

L'écouteur date de `9b70e1b1` (24 oct., #1150, lot 4), d'après `git log -S`. Inférence : la course existe depuis cette date, ce qui concorde avec le défaut mesuré sur la 1.228.

## Les mesures

Chaque ligne : (g), 20 répétitions, sans reprise.

| Banc | Rouges | Ce qu'on observe |
|---|---|---|
| Sonde, sans correctif | **16** | Les 16 rouges : aucun `change`, nœud détaché après le `blur`. Dernier rendu de 298 à 363 ms après la navigation |
| Sonde, `animationend` de la section neutralisé | **0** | Ce dernier rendu disparaît |
| Sonde, avec le correctif | **0** | Aucun rendu après le `fill`, nœud connecté dans les 20 essais |
| Spec réelle, avec le correctif | **0** | Avant correctif : 3 rouges sur 20 (`RAPPORT-2026-10-31-verdict-rouge-1229.md`) |

- **Pourquoi 16 et non 3** : inférence, les allers-retours de la sonde rapprochent le geste du rendu. Elle aggrave la course, elle ne l'invente pas : sans cet événement, plus aucun rouge.
- **Limite de la sonde** : mes enveloppes de `_armerEnregistrementPresences` et `ecrirePresencesSeance` n'ont rien vu, ces fonctions vivant dans une fonction anonyme. La preuve repose donc sur le `change` et le `setSync` refusé : 0 des deux dans chaque rouge, sauf `change` à 1 et un `setSync` refusé dans chaque vert. L'appel à `_armer…` n'est pas observé directement.

## Le correctif : le banc seul

`attendreTableauStable` dans `ouvrirSaisieDemo` (`presences-lot-d-enregistrement.spec.js`) attend la fin de l'animation, puis deux images. Les quatre `expect` de (g) sont inchangés.

- **Contre-épreuve** : `_armerEnregistrementPresences` neutralisée, (g) rouge 3 fois sur 3, témoin vide ; code restauré, `git diff -- js/` vide.
- **La spec entière**, une passe : 13 sur 13.
- **La copie jetable** est retirée.

## L'exposition d'un vrai utilisateur

Mesure sur 3 essais, en navigation puis au clic sur les sous-onglets, dans le Mac :

- **Moment** : dernier rendu de 314 à 358 ms après la navigation, de 344 à 363 ms après le clic.
- **Après** : aucun rendu en 20 s sans geste.
- **Déclencheur** : seule l'ouverture de la saisie lance cette animation. Lu dans le code et sondé, pas démontré pour tous les parcours.

**Décision : les deux conditions de la consigne ne sont pas réunies, aucune inscription.** Pour perdre une saisie, il faudrait toucher le champ et taper dans les 0,36 s qui suivent l'ouverture. La valeur retomberait alors à l'écran sur celle de la base.

**Non mesuré : l'iPad.** Inférence : la durée de l'animation y est la même, et un fil principal chargé retarde aussi la frappe. Grégoire peut corriger ce jugement s'il a déjà vu une valeur revenir toute seule à l'ouverture d'une séance.

Source ou stock : aucune donnée n'est en cause, le correctif ne touche que le banc.

## Trouvailles et leur issue

- **Le rendu parasite** (l'écouteur global d'`atelier-algo.js`, l'observateur qui réagit à toute écriture de classe) : commenter et oublier, c'est fait au-dessus de `attendreTableauStable`. Sans conséquence observable hors du banc.
- **Le double rendu à l'ouverture** (6 et 18 ms, une fois par mutation de classe) : commenter et oublier.
- **#1212** : sa disposition « fait » au BACKLOG après le push, comme le demande le § 4.
