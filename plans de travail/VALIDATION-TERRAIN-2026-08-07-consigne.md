# Consigne — Validation TERRAIN de la vague de correctifs perf + logique (préparée le 6 août 2026)

> **Mandat** : valider en conditions réelles la vague #394-#402 (releases 1.31.14 → 1.31.22,
> **mergée main et déployée le 6 août** — commit `74ba81c`). Ce document est un protocole
> **pas à pas pour Grégoire** (Safari, Mac, codex réel h2026 réparé le 5 août ; passe iPad
> courte à la fin). Une session Claude Code peut l'accompagner : elle guide, consigne les
> résultats et NE répare rien à la main.
>
> **Règles pour limiter les erreurs** :
> 1. Suivre les étapes DANS L'ORDRE (les premières sont en lecture seule, les gestes
>    d'écriture arrivent après le backup et sont ceux du travail normal).
> 2. À chaque étape : noter le résultat dans la grille §10 (chiffre exact ou ✓/✗),
>    même quand c'est bon.
> 3. **En cas d'écart : ne RIEN réparer, ne rien re-saisir en boucle.** Noter l'étape,
>    la valeur, le message console s'il y en a un, et passer à l'étape suivante.
>    Le triage se fait en session Claude Code après la passe complète.
> 4. Les one-liners console se collent TELS QUELS (une seule ligne, Entrée).

---

## 0. Préparation (≈ 10 min, obligatoire)

1. **Backup Codex** : Données → Enregistrer le codex (fichier daté du jour). Ne pas sauter
   cette étape même si « rien ne sera modifié » — les étapes 3-5 écrivent (recalculs normaux).
2. Ouvrir Labo Codex dans Safari, **recharger dur** (⇧⌘R) pour vider le cache.
3. Vérifier la **version affichée** (À propos ou pied de page) : **1.31.22** / build `0805-…`.
   Si un numéro antérieur s'affiche → re-⇧⌘R ; si ça persiste, STOP et le noter (cache-busters).
4. Ouvrir la console Web (⌥⌘C). La laisser ouverte toute la session.
5. Contexte : trimestre **h2026** actif, cours **601-101**, groupe habituel.
   ⚠ Les warnings « Échelle non trouvée » / « Calcul à la volée » ne devraient PLUS
   flooder (données réparées le 5 août) — s'il y en a, les compter et les noter.

---

## 1. V1 — Re-sync du boot (#401) · lecture seule

**Avant le fix : 1057 / 962 / 729 ms** (tes mesures du 5 août soir, même protocole).

Coller ce one-liner, **3 fois de suite**, noter les 3 chiffres :

```js
db.flush().then(()=>db.keys()).then(k=>{var t0=performance.now(); return db.syncToLocalStorageCache().then(()=>console.log(Math.round(performance.now()-t0)+' ms'));});
```

**Attendu** : nettement sous les valeurs d'avant (l'ordre de grandeur visé est
« quelques dizaines à ~200 ms » — le gain exact dépend de la latence IDB de ton poste).
**Écart** : si ≥ 500 ms, noter les 3 chiffres et continuer.

## 2. V2 — Modal d'export (#401) · lecture seule

**Avant : 473 / 488 ms.** Coller, **2 fois** (fermer le modal entre les deux) :

```js
(function(){var t0=performance.now(); ouvrirModalExport().then(()=>console.log(Math.round(performance.now()-t0)+' ms'));})();
```

**Attendu** : ouverture nettement plus vive, ET la colonne des tailles affiche des
**Ko chiffrés** (pas de « ? Ko » en cascade — un « ? » isolé sur une clé exotique est toléré).
Fermer le modal sans exporter.

## 3. Pipeline présences (#397) · écrit (recalcul normal)

D'abord la mesure directe du recalcul, **2 fois** :

```js
(function(){var t0=performance.now(); calculerEtSauvegarderIndicesAssiduite(); console.log(Math.round(performance.now()-t0)+' ms');})();
```

**Avant (audit, échelle 75 étu) : ~460 ms. Attendu : < 100 ms.**

Puis le geste réel : ouvrir Saisie des présences, modifier/re-saisir la séance du jour
(ou la plus récente), Enregistrer. **Attendu** : plus de gel perceptible à l'enregistrement.

Contrôle de la purge d'historique (D3), lecture seule :

```js
(function(){var cp=db.getSync(cle('indicesCP'),{}); var n=Object.keys(cp).filter(k=>cp[k]&&cp[k].historique).length; console.log(n+' entrées portent encore un historique (attendu : 0 après le recalcul ci-dessus)');})();
```

## 4. Cohérence STD (#394) — LE cœur de la vague · lecture seule

Choisir **3 étudiants contrastés** : un fort, un faible, un incomplet (peu de remises).
Pour chacun, noter la note STD affichée à **trois endroits** :

1. **Profil étudiant** — note de session construite + sa décomposition (pool/terminale) ;
2. **Tableau de bord / Aperçu** — badge P du panneau de suivi et barre P ;
3. **Labo → Exploration des pratiques** — colonne de la pratique active.

**Attendu** : les trois racontent **la même note** (± l'arrondi d'affichage).
Cas « non constructible » (config incomplète, aucun artefact) : le profil dit « non
calculable », le tableau de bord affiche **« — »** (plus jamais un nombre fantôme genre 74),
l'Exploration dit « non constructible ».

Contre-vérification console pour UN étudiant (remplacer XXXXXXX par son DA) :

```js
(function(){var da='XXXXXXX'; calculerEtStockerIndicesCP(); var d=calculerDetailsNoteFinale(da); var s=simulerIndices(da, obtenirPratiqueActiveGroupeCours()); var cp=db.getSync(cle('indicesCP'),{})[da]; console.log('riche:', d&&d.noteFinale, '| simulé P:', s&&s.P, '| constructible:', s&&s.noteConstructible, '| stocké:', cp&&cp.actuel&&cp.actuel.P, cp&&cp.actuel&&cp.actuel.noteConstructible);})();
```

**Attendu** : riche ≈ simulé ≈ stocké (mêmes arrondis), `noteConstructible` identique
des deux côtés.

## 5. Zone « À vérifier » des Productions (#394, règles 3 et 5) · un geste réversible

1. Ouvrir **Conception → Productions**. Ta terminale étant typée et ton conteneur pondéré,
   **attendu : zone muette** (ou seulement des avertissements que tu juges légitimes —
   les lire, vérifier qu'aucun n'est absurde).
2. **Test volontaire du patron** : crée une production jetable « TEST-terminale », type
   « Travail écrit », pondération 15 %. **Attendu** : l'avertissement « …est pondérée mais
   son type est “Travail écrit”… » apparaît — **sans** bouton « Typer comme terminale »
   (cas ambigu impossible ici : ta vraie terminale est déjà typée, donc le message doit
   être celui de la **pondérée non participante**).
3. **Supprimer la production TEST** aussitôt. La zone doit redevenir muette.

## 6. Dates locales (#398) · si la passe se fait EN SOIRÉE (après 20 h) — sinon sauter

C'est l'heure qui déclenchait le bug. Vérifier :
- Saisie des présences : la **date du jour proposée est bien aujourd'hui** (pas demain) ;
- Aperçu présences / tableau de bord : aucun décompte d'absences « fantômes » pour la
  séance du jour non saisie.

Contrôle console (lecture seule) : `dateLocaleYMD()` → doit rendre la date d'aujourd'hui.

## 7. Calendrier (#399) · contrôle léger, lecture seule

- Cadre du trimestre : la sidebar affiche toujours **tes chiffres officiels** (semaines/jours
  inchangés — le golden #368 le garantit, ceci n'est qu'un coup d'œil).
- Si tu utilises un jour une reprise un samedi : elle apparaîtra désormais comme jour de
  cours (rien à tester aujourd'hui, juste à savoir).

## 8. Listeners spaghetti (#400) · SEULEMENT si des données de progression existent

Si le graphique « spaghetti » A-C-P s'affiche avec des courbes : armer le compteur, puis
basculer **10 fois** entre A/C/P, puis lire le net.

```js
(function(){var c=document.getElementById('graphique-groupe-moyennes'); if(!c){console.log('canvas absent — sauter l\'étape'); return;} c.__net=c.__net||0; var a=c.addEventListener.bind(c), r=c.removeEventListener.bind(c); c.addEventListener=function(){c.__net++; return a.apply(null,arguments);}; c.removeEventListener=function(){c.__net--; return r.apply(null,arguments);}; console.log('compteur armé — bascule 10× A/C/P puis colle la 2e commande');})();
```

```js
console.log('listeners nets :', document.getElementById('graphique-groupe-moyennes').__net, '(attendu : ≤ 3 ; avant le fix : ~30)');
```

## 9. Passe iPad (≈ 5 min)

Sur l'iPad Air : ouvrir l'app (⟳ complet), vérifier build **1.31.22**, puis :
- ressenti du **boot** (le gain #401 est le plus sensible ici) ;
- une **saisie de présences** (fluidité #397) ;
- un coup d'œil au profil d'un étudiant (cohérence #394, mode sombre ET clair si possible).

---

## 10. Grille de résultats (à remplir au fil de l'eau)

| # | Étape | Avant (référence) | Mesuré / constat | ✓/✗ |
|---|---|---|---|---|
| 1 | V1 boot ×3 | 1057/962/729 ms | ___ / ___ / ___ ms | |
| 2 | V2 modal ×2 | 473/488 ms | ___ / ___ ms | |
| 3a | Recalcul assiduité ×2 | ~460 ms (audit) | ___ / ___ ms | |
| 3b | Purge historique | — | ___ entrées (attendu 0) | |
| 4 | Cohérence STD ×3 étudiants | 82,67 vs 74,29 possible | riche/TdB/Exploration identiques ? | |
| 4b | Non constructible → « — » | affichait un nombre | | |
| 5 | Zone « À vérifier » | n'existait pas | muette + test volontaire OK ? | |
| 6 | Dates en soirée | bascule à 20 h | | |
| 7 | Sidebar calendrier | 15 sem · 75 j | | |
| 8 | Listeners nets | ~3×rendus | ___ (attendu ≤ 3) | |
| 9 | iPad | — | | |

**Console** : nombre de warnings inattendus pendant toute la passe : ___ (les copier).

---

## 11. Après la passe (session Claude Code suivante)

1. Verser la grille remplie (photo ou copie) → triage : chaque ✗ devient un correctif
   ciblé AVANT d'ouvrir autre chose (priorité retours terrain, CLAUDE.md).
2. Si tout est ✓ : cocher les portes terrain aux items #397/#400/#401 du BACKLOG,
   puis reprendre la file : **#402 L12/L13**, queue **#398** (4 sites toISOString restants),
   candidate ablation `calculerPerformanceParObjectif`, « 4ᵉ source de cours actif »
   (queue #394), et la discussion « filtre prioritaires vs non-constructibles ».
3. Rituel habituel : SKILL_Debut_de_session au démarrage, prémisse = main `74ba81c`+,
   version 1.31.22, Vitest 1415/1415, dernier ID BACKLOG #402.
