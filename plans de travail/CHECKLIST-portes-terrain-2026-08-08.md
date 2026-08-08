# Checklist — portes terrain accumulées (5-8 août 2026)

> **Mandat** : validation au doigt et à l'œil par Grégoire des cinq chantiers
> livrés entre le 5 et le 8 août. Condensée pour NE PAS revalider ce que la
> passe autonome du 6 août a déjà prouvé sur banc
> (`Rapports/VALIDATION-AUTONOME-BLOC-A-2026-08-06.md`, rapatriée sur `main`
> le 8 août au soir).
>
> **Règle** : les écarts se NOTENT, rien ne se répare en cours de passe.
> Consigner dans la grille §9 (date + ✓/✗ + une ligne), puis triage en session.
>
> **Postes** : Mac (Safari) + iPad Air (Safari). **Les portes visuelles (P3 à
> P6) se vérifient dans les DEUX modes** (sombre et clair).

---

## §0 — Préparation (5 min, obligatoire)

1. **Backup Codex d'abord** (export complet) — la porte P1 touche aux
   préférences réelles.
2. Vérifier le build servi : À propos → **1.56.0 / build 0808-0839**.
   Si un autre build s'affiche : recharger avec vidage de cache
   (Cmd+Option+R) avant toute mesure — c'est le mécanisme de #367.
3. Console ouverte (Mac seulement) pendant toute la passe : noter tout
   warning inattendu, sans le corriger.

---

## §1 — P1 · Migration des préférences (DONNÉES — à faire en premier, Mac)

**Contexte** : la migration V3, morte-née depuis le 16 avril, tourne pour la
première fois au premier démarrage de 1.55+. Des réglages d'avant le 16 avril
peuvent **réapparaître** (`modeClair`, `modeExpert`, `activerRai`,
`grilleReferenceDepistage`…). **Ce n'est pas un bug** — c'est la migration qui
fait enfin son travail. Mais ça se voit, donc ça se vérifie.

Après un premier boot de 1.56.0, coller ces trois contrôles en console :

```js
db.getSync('migrationPrefs_v3_done')
```
**Attendu** : `true`.

```js
db.getSync('preferencesUtilisateur')
```
**Attendu** : tes valeurs réelles (pas les défauts) — en particulier
`grilleReferenceDepistage` non vide si tu en avais une.

```js
['a2024','a2025','h2026'].map(t => t + ': ' + JSON.stringify(db.getSync(t + '_modalitesEvaluation')))
```
**Attendu** : les clés namespacées **intactes** (le correctif #419 ne purge
que ce qui est déjà à l'abri dans V3).

Puis un tour d'œil dans Préférences : mode sombre/clair, mode expert, RàI —
conformes à tes choix ? Si un vieux réglage a resurgi, le noter (attendu),
mais **une valeur perdue = écart à consigner immédiatement**.

---

## §2 — P2 · Saisie de durée au doigt (iPad, #423)

Le champ `min` vit dans l'**en-tête d'un nœud qui se glisse** — le risque est
que la pression soit interceptée par le drag.

- [ ] Toucher le champ de durée d'une Activité : le champ prend le **focus**
      (le nœud ne part pas en glissement).
- [ ] Le clavier **numérique** s'ouvre ; saisir une valeur ; elle persiste
      après fermeture du clavier et rechargement.
- [ ] Le compteur **Σ** de la leçon parente se rafraîchit **en direct**, puis
      celui de la séquence (remontée sur deux niveaux).
- [ ] Refaire une fois sur un nœud **Évaluation** (type ajouté à
      `TYPES_AVEC_DUREE`, chemin distinct des activités).
- [ ] Contre-épreuve : glisser le nœud EN SAISISSANT l'en-tête hors du champ —
      le drag fonctionne toujours.

---

## §3 — P3 · Lisibilité de l'en-tête sur un nœud étroit (Mac + iPad, 2 modes)

L'en-tête a reçu **deux contrôles** et le lot « largeur » (lot F) n'est pas
fait — la contrainte n'a jamais été vue sur un nœud réellement étroit.

- [ ] Trouver (ou créer) un nœud au **titre long** dans une zone dense :
      titre, champ de durée et unité `min` restent lisibles, sans
      chevauchement ni débordement.
- [ ] Vérifier dans les **deux modes** (contraste du champ sur les deux fonds).
- [ ] Noter la largeur ressentie « limite » — ça alimentera le lot F
      (« mesurée et non devinée »).

---

## §4 — P4 · Les deux boutons de palette (iPad surtout, 2 modes)

Cible 32 px + `@media (hover:none)` — jamais vérifiés au doigt.

- [ ] Les deux boutons répondent au **premier toucher** (pas de double-tap,
      pas de zone morte), doigts ordinaires, sans précision chirurgicale.
- [ ] La palette montre « **Exposé** » en tête de la famille
      « **Déroulement** » (ex-« Mise en action », qui ne doit plus apparaître).
- [ ] Relier une **connaissance → Modélisation** (ou autre nœud
      d'enseignement explicite) : le lien se crée, un verbe s'affiche —
      c'était le bug #415/#422 (« Ce lien n'est pas possible »).

---

## §5 — P5 · La carte entièrement dépliée (Mac + iPad, TES données)

Le filtrage et la compaction ont été **retirés** (#420) : plus rien n'est
masqué. La contrepartie assumée n'a pas été mesurée sur une grosse carte
réelle.

- [ ] Ouvrir ta plus grosse carte réelle : navigable ? (fluidité du zoom,
      du panoramique, repérage visuel)
- [ ] **⌘1** (cadrage) donne une vue exploitable.
- [ ] Le **planificateur** cadre la carte correctement (#418→#420 : il cadre,
      il ne redouble plus).
- [ ] Cliquer des éléments du planificateur : plus de fiche redondante
      derrière (supprimée par #420).

---

## §6 — P6 · Vague perf 1.31.14→1.31.22 — LE reliquat réel (Mac, corpus réel)

Le banc du 6 août a tout validé **sauf V1** (non concluant sur corpus démo)
et le ressenti Safari/iPad. Il reste :

**V1 — boot/synchro sur corpus réel** (75 étu, ~5,2 Mo). Coller **3 fois**,
noter les 3 chiffres :

```js
db.flush().then(()=>db.keys()).then(k=>{var t0=performance.now(); return db.syncToLocalStorageCache().then(()=>console.log(Math.round(performance.now()-t0)+' ms'));});
```

**Référence avant** : 1057/962/729 ms. **Attendu** : nettement dessous.
⚠ Caveat **O2** du rapport : les itérations 2+ déclenchent des recalculs
dépistage en cascade — **la 1ʳᵉ itération est la plus propre**, la comparer
en priorité à la référence.

- [ ] **Sidebar calendrier** : « 15 semaines • 75 jours » (chiffres officiels
      — le banc n'avait que la démo).
- [ ] **Zone « À vérifier »** sur tes données réelles : muette, ou seulement
      des avertissements légitimes ? (le bruit observé au banc — O4 — venait
      du seed démo, pas du moteur).
- [ ] **Ressenti général Safari/iPad** : boot, bascules A/C/P, profil élève —
      rien de plus lent qu'avant.

---

## §7 — Ce qu'on NE revalide PAS (déjà prouvé au banc du 6 août)

| Contrat | Preuve banc |
|---|---|
| V2 modal export | 96/97 ms vs 457 ms (×4,8), 0 « ? Ko » |
| V3 recalcul assiduité + purge historique | 33/45 ms ; 0/21 entrées `historique` |
| V4 cohérence STD riche ≈ simulé = stocké | 20/20 étudiants |
| V4b non constructible → « P — » | garanti + sentinelles #394 |
| V5 zone « À vérifier », patron des messages | conforme, échappé |
| V6 dates locales en soirée (fuseau Toronto) | 21h30 EDT simulé, bon jour |
| V8 fuite de listeners | 0 net après 10 bascules A/C/P |

Un coup d'œil de confirmation est bienvenu, une re-mesure est inutile.

---

## §8 — Hors passe (rappel, à ne pas confondre avec un écart)

- Les observations **O1-O5** du rapport du 6 août sont **connues et non
  réparées** (décision de triage à prendre en session) — ne pas les re-noter.
- Les portes terrain de **juillet** (vagues 1-2-3 : #313/#344/#361, #355,
  #305, #121…) restent dues mais sont **hors de cette passe** — checklist
  séparée si tu veux les grouper.

---

## §9 — Grille de consignation

| Porte | Poste / mode | ✓/✗ | Observation (1 ligne) |
|---|---|---|---|
| P1 migration prefs — 3 contrôles console | Mac | | |
| P1 tour d'œil Préférences | Mac | | |
| P2 durée au doigt (Activité + Évaluation) | iPad | | |
| P2 contre-épreuve drag | iPad | | |
| P3 en-tête nœud étroit | Mac+iPad · 2 modes | | |
| P4 boutons de palette au doigt | iPad · 2 modes | | |
| P4 lien connaissance → EE | Mac ou iPad | | |
| P5 grosse carte dépliée + ⌘1 + planificateur | Mac+iPad | | |
| P6 V1 ×3 (noter les 3 chiffres) | Mac | | |
| P6 sidebar 15 sem · 75 j | Mac | | |
| P6 zone « À vérifier » données réelles | Mac | | |
| P6 ressenti général | Mac+iPad | | |

**Fin de passe** : rapporter la grille en session (ou la coller dans
`Retours des testeurs/SUIVI-BUGS.md` si un écart est un bug franc). Le triage
des écarts et des O1-O5 décide de la suite (lot F largeur, D1-D6, #418…).
