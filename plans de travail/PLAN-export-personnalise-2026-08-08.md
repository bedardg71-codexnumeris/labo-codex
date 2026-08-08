# PLAN — Niveau d'export « Personnalisé » (#431) + correctif TSV (#152)

> **Écrit le 8 août 2026, après discussion avec Grégoire** (capture Numbers à
> l'appui). Décisions actées en conversation — ne pas rouvrir :
>
> | Décision | Verdict |
> |---|---|
> | Un 4e niveau « Personnalisé » : cases à cocher + ordre + aperçu | ✅ Grégoire |
> | L'ordre porte sur les CONTENUS (sections/groupes de colonnes), JAMAIS sur la structure séquences→leçons — la structure EST la carte | ✅ recommandation acceptée |
> | UN seul réglage mémorisé (pas de gabarits nommés) — hypothèse consignée dans USAGE-FORMATS, le terrain tranchera | ✅ recommandation acceptée |
> | Point de départ : les cases d'un preset (« Partir de : En classe ») | ✅ recommandation acceptée |
> | Réglages + aperçu dans une **MODALE** — le panneau Actions (380 px) ne suffit pas pour cases + ordre + aperçu ; l'anti-pattern « pas de modale » vise les cas où un panneau suffit | ✅ décision Claude, idée suggérée par Grégoire |
> | Correctif #152 : UNE seule colonne « Semaine » au TSV (la ligne de séquence y met son étendue) | ✅ bug de conception du Lot C |
>
> État de départ : **1.57.0** (build 0808-1445), `main` = branche de session,
> Vitest 1914/1914. Dernier ID BACKLOG : #430 → ce chantier = **#431**.

## Modèle

- Le niveau `personnalise` est un 4e jeu de réglages posé sur le générateur
  unique (D5 inchangé) : **contenus** (cases) + **ordre** (sections).
- **Cases** : objectifs · activités · évaluations · durées · rétroactions ·
  connaissances · liens (et objectifs servis) · détail des productions
  (grille/échelle).
- **Ordre** : permutation des 4 blocs [Objectifs | Déroulement | Productions
  rattachées | Liens]. En texte/MD = ordre des sections d'une leçon ; en TSV =
  ordre des groupes de colonnes (préfixe fixe Séquence | Leçon | Semaine).
- **Persistance** : préférence `exportPlanPersonnalise` (js/preferences.js,
  DEFAUTS ; `null` = jamais réglé → on part du preset « En classe »).
- **Presets INTOUCHÉS** : leurs sorties restent celles de 1.57.0 (contrats du
  harnais) ; le personnalisé a son orchestrateur, qui réutilise les mêmes
  primitives de rendu.

## Lots

1. **#152** — fusion des colonnes Semaine (3 jeux de colonnes TSV), sentinelle
   + break-test.
2. **Moteur** — `genererExport('personnalise', format)` + config normalisée +
   préférence. Sentinelles : cases qui filtrent, ordre qui réordonne (texte ET
   TSV), config nulle → équivalent « En classe », break-tests.
3. **Modale** — réglages (cases + ordre ↑↓, pointer-friendly) + aperçu vivant
   (le générateur est pur : re-rendu à chaque changement) + « Partir de : … ».
   Radio « Personnalisé » + bouton « Régler… » dans le panneau Actions.
   Design system, deux modes, echapperHtml, focus (a11y modale).
4. **Clôture** — SUIVI-BUGS #152 corrigé, BACKLOG #431, SESSION/RELAIS,
   release minor, fusion `main`.

## Pièges

- ⚠ Les presets sont des CONTRATS : le harnais 424 doit rester vert sans
  retouche de ses assertions de niveau.
- ⚠ Nouveau listener UI = Pointer/click seulement (ratchet #148) ; listeners
  de la modale posés APRÈS la dernière écriture innerHTML (leçon Lot E).
- ⚠ `exportPlanPersonnalise` entre dans DEFAUTS de preferences.js — pas de
  clé sauvage (le module warn sur clé inconnue).
- ⚠ L'aperçu rend du contenu UTILISATEUR (titres) dans du HTML → `<pre>` +
  textContent, jamais innerHTML brut.
