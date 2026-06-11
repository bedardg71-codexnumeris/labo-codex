# Enquête #332 constat 1 — no-op UI au réassemblage horaire ↔ groupe-cours

> **Date** : 11 juin 2026 (Claude Code, session autonome — enquête de code SEULE,
> aucun fix appliqué : la repro avec Grégoire est requise avant de corriger).
> **Constat terrain** : le réassemblage d'horaire du GC 00008 fait dans l'UI
> n'a rien persisté — ni `groupesCours[].horaireId` (SSOT) ni la copie
> `groupeCoursActif.horaireId`. Le constat 2 (copie prioritaire sur SSOT dans
> `obtenirSeancesHoraire`) est LIVRÉ depuis le 11 juin (commit `5d1caaf7`).

## Verdict de l'enquête

Deux mécanismes de no-op silencieux sont CONFIRMÉS à la lecture du code (pas
des hypothèses d'agent — chemins vérifiés ligne par ligne). L'un ou l'autre —
ou les deux en chaîne — explique le constat terrain. Un protocole de repro
console est fourni pour trancher.

## Mécanisme A — la sélection manuelle d'horaire est écrasée par l'auto-association

**Chemin** : `index.html:7610` → le `<select id="v2-gc-horaire">` porte
`data-on-change="mettreAJourNomGroupeCoursV2"`. Or
`mettreAJourNomGroupeCoursV2()` (`js/trimestre-v2-groupes-cours.js:262-297`)
ne lit JAMAIS la valeur du select horaire : si un groupe est sélectionné,
elle RÉÉCRIT le select avec l'horaire auto-associé au groupe :

```js
const horaireAssocie = horaires.find(h => h.groupeAssocie === groupeNum);  // :272
if (horaireAssocie) {
    if (horaireHidden) horaireHidden.value = horaireAssocie.id;            // :276 ← écrase le choix
```

**Conséquence** : changer l'horaire dans le formulaire GC est IMPOSSIBLE dès
que le groupe a un horaire associé (`groupeAssocie`) : la sélection saute en
arrière à l'instant même du changement (handler déclenché PAR le select qu'il
écrase), puis « Enregistrer » persiste l'ancien horaire avec un toast de
succès. No-op parfait, zéro feedback.

**Aggravant** : si PLUSIEURS horaires portent `groupeAssocie === '00008'`
(plausible après le réassemblage manuel du #330), `find` prend le PREMIER de
la liste — pas celui que l'utilisateur veut.

**Protocole de repro (2 min, Mac, données réelles)** :
1. Cadre → Groupes-cours → sélectionner le GC 00008.
2. Ouvrir le select « Horaire » et choisir un AUTRE horaire.
3. Observer le select immédiatement après le choix : revient-il tout seul à
   l'ancien horaire ? (C'est le mécanisme A.)
4. Console, avant/après « Enregistrer » :
   ```js
   db.getSync(cle('groupesCours'), []).map(g => ({id: g.id, horaireId: g.horaireId}))
   db.getSync(cle('horaires'), []).map(h => ({id: h.id, nom: h.nom, groupeAssocie: h.groupeAssocie}))
   ```
   Si plusieurs horaires partagent le même `groupeAssocie`, l'aggravant est en jeu.

## Mécanisme B — sauvegarde « réussie » qui ne modifie rien (id d'édition périmé)

**Chemin** : `sauvegarderGroupeCoursV2()` (`js/trimestre-v2-groupes-cours.js:607-623`) :

```js
if (groupeCoursEnEditionId) {
    const index = groupesCours.findIndex(g => g.id === groupeCoursEnEditionId);
    if (index >= 0) { /* modifie */ }          // ← AUCUN else
}
notifications.succes('Groupe-cours modifié');   // ← toast de succès QUAND MÊME
db.setSync(cleGC, groupesCours);                // ← réécrit l'array inchangé
```

`findIndex` raté → rien n'est modifié, mais le toast dit « Groupe-cours
modifié ». Et `groupeCoursEnEditionId` (module-scope, `:39`) n'est PAS
réinitialisé par `changerTrimestreActifV2` (`js/trimestre-v2-liste.js:352-402`
— elle rafraîchit l'horaire et le dropdown d'en-tête, jamais le formulaire
GC). Après un changement de trimestre, l'id d'édition pointe un GC de
l'ANCIEN trimestre, absent du nouveau namespace → no-op garanti avec succès
affiché.

**Protocole de repro (3 min)** :
1. Sélectionner un GC en H2026 (le formulaire d'édition se remplit).
2. Changer le trimestre actif (ex. → A2025), revenir à la page Groupes-cours
   SANS resélectionner de GC dans le dropdown.
3. Modifier n'importe quoi dans le formulaire → « Enregistrer ».
4. Toast « Groupe-cours modifié » attendu, mais en console :
   ```js
   db.getSync(cle('groupesCours'), []).find(g => g.id === '<id du GC>')
   ```
   → aucune trace de la modification.

## Piste secondaire (à vérifier en passant)

`h.groupeAssocie === groupeNum` (`:272`) compare en strict la valeur du
select (toujours une CHAÎNE) au champ stocké : si `groupeAssocie` est un
nombre dans les données (saisie ancienne), l'association rate silencieusement
→ « Aucun horaire pour ce groupe » + horaire vidé. Le dump console du
protocole A le montre directement.

## Options de fix (à trancher avec Grégoire APRÈS repro — rien d'appliqué)

1. **A** : le handler du select horaire ne doit pas re-dériver l'horaire du
   groupe quand l'événement vient du select horaire lui-même (passer
   l'élément déclencheur, ou séparer deux handlers). L'auto-association reste
   au changement de GROUPE seulement.
2. **B** : `else { notifications.erreur('Groupe-cours introuvable — resélectionne-le'); return; }`
   au findIndex raté + réinitialiser `groupeCoursEnEditionId` (et le
   formulaire GC) dans `changerTrimestreActifV2` — même patron que le fix
   horaire du 29 mai.
3. Au passage (si repro A confirme) : synchroniser la copie
   `groupeCoursActif.horaireId` quand le GC actif est modifié — même geste
   que `changerPratiqueActive` (#328 L2-b2).
