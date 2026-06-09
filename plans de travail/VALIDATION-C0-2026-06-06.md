# Validation terrain — Lot C0 Comparateur (6 juin 2026)

Branche `claude/comparateur-c0` (non poussée). À valider **avant push/merge**.

## Ce qu'on valide / ce qu'on NE valide PAS

- **On valide** : les effets du *seed démo v20.7* sur l'app existante, en **mode démo** —
  données démo correctes, calcul STD désormais actif par défaut, profil DEMO011 cohérent.
- **On ne valide PAS** le Comparateur lui-même : **la vue n'existe pas encore** (lot C1).
  Ne cherche pas d'écran « comparaison de pratiques ».
- **Aucune donnée réelle touchée** : le seed n'écrit que dans `demo_*`. Tes cours réels
  (601-101 H2026 / A2025) sont intacts — on le vérifie à l'étape 6.

## ⚠️ Deux choses ATTENDUES — ne pas les signaler comme bugs

1. **Les notes de TOUS les élèves démo ont changé** : avant, l'affichage démo était en
   *fallback* (pratique non configurée) ; maintenant la pratique active est PAN-Standards
   configurée (`demo-std-litt`). C'est voulu.
2. **DEMO011 (Mamadou Diallo) — rétroactions incohérentes en consultation détaillée** :
   ses notes ont été reconstruites (trajectoire I→E), mais les **rétroactions rédigées et
   les niveaux par critère** des anciennes évaluations n'ont **pas** encore été réalignés
   (chantier D4b-2). Ex. : Artefact 3 affichera **60 / I** mais une rétroaction qui parle
   d'un excellent travail. **C'est connu et attendu**, sans impact sur le calcul.

---

## Mac (Safari) — checklist

**1. Re-seed**
- `Cmd+Option+R` (rechargement dur). Ouvre la console (`Cmd+Option+C`).
- *Attendu* : un log `[DEMO-INIT] Namespace demo_* initialisé (version 20.7, …)`.
  Aucune erreur rouge bloquante. (Le warning « grille de référence » et le warning
  « quota localStorage » sont normaux, déjà présents avant.)

**2. Mode démo → liste des productions**
- Active la démo (bandeau vert). Ouvre un profil élève, onglet **Productions**.
- *Attendu* :
  - Les productions sont en **ordre de date logique** (A1 sept. → terminale déc.),
    plus d'Artefact 2 au 29 décembre.
  - **Plus de ligne « [SPE] Gabarit - Prise de position »** (le résidu a été effacé).
  - L'« Évaluation terminale » est présente avec une date (10 déc.).

**3. Profil DEMO011 (Diallo, Mamadou) — le cas reconstruit**
- *Attendu, liste des productions (trajectoire ascendante)* :

  | Production | Note | Niveau |
  |---|---|---|
  | Artefact 1 | ~50 | I |
  | Artefact 2 | ~54 | I |
  | Artefact 3 | ~60 | I |
  | Artefact 4 | ~66 | D |
  | Artefact 5 | ~74 | D |
  | Artefact 6 | ~80 | M |
  | Artefact 7 | ~83 | M |
  | Artefact 8 | ~86 | E |
  | Artefact 9 | ~88 | E |
  | Évaluation terminale | ~84 | M |

  - *Note finale de session* : pratique **PAN-Standards (démo)**, autour de **81** (la
    sélection retient les meilleurs artefacts + la terminale). La note reflète la maîtrise
    de fin de parcours, pas la moyenne des débuts.

**4. Tableau de bord / Aperçu (mode démo)**
- *Attendu* : les indices **P se calculent** pour les élèves démo (plus de « 0 % » ni de
  case vide due au fallback). Le badge de pratique affiché = **STD** (bleu).

**5. Balayage anti-régression**
- Navigue 2-3 autres profils démo + le tableau de bord. *Attendu* : tout s'affiche, pas
  d'erreur console bloquante, pas d'écran vide.

**6. Données réelles intactes**
- Quitte la démo. Ouvre ton trimestre **H2026 / 601-101**. *Attendu* : tes groupes, élèves,
  notes et pratique réelle (PAN-SDT-Litt H26) **inchangés**.

---

## iPad (Safari) — points clés

Refaire **étapes 1, 2, 3, 6** (re-seed, productions, DEMO011, données réelles).
Vérifier surtout l'affichage (pas de débordement, tableaux lisibles).

## Modes sombre / clair

Aucun composant visuel nouveau dans ce lot — un coup d'œil au profil DEMO011 dans les
**deux modes** suffit à confirmer qu'il n'y a pas de régression de contraste.

---

## Verdict

- **Tout conforme** → dis-moi « validé, pousse » : je pousse `claude/comparateur-c0`
  (et on discute merge sur `main`).
- **Un écart** (hors les 2 points attendus ci-dessus) → note : appareil, mode, écran,
  ce que tu voyais vs attendu. On corrige avant de pousser.
