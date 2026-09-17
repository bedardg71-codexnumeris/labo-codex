# Indice A (Assiduite) — Architecture

> **Refacto #224** — 3 mars 2026, Beta 98.4

## Vue d'ensemble

L'indice A mesure l'assiduite d'un etudiant sur un trimestre. C'est un ratio
**periodes presentes / periodes offertes**, calcule de facon sommative depuis
le debut du trimestre.

**Fichier unique** : `js/indices.js`

---

## Fonctions

### `calculerAssiduite(da, dateLimite)`

Fonction canonique unique. Retourne l'assiduite cumulee d'un etudiant.

| Parametre    | Type           | Description                                    |
|-------------|----------------|------------------------------------------------|
| `da`        | string         | Numero DA de l'etudiant                        |
| `dateLimite`| string \| null | Date max incluse (YYYY-MM-DD), null = aujourd'hui |

**Retour** :
```javascript
{
  indice: 0.92,           // ratio 0-1
  periodesPresentes: 22,
  periodesOffertes: 24,
  nombreSeances: 12
}
```

**Algorithme** :

1. Charger `presences` via `obtenirDonneesSelonMode('presences')`
2. Charger `seancesCompletes` (calendrier du groupe-cours)
3. Construire `datesSaisies` depuis le **GROUPE** (pas juste l'etudiant) — evite que les dates d'un autre groupe du meme coursId inflent le denominateur
4. Filtrer les dates du calendrier : `<= dateLimite` ET dans `datesSaisies`
5. Pour chaque date :
   - Record regulier present → offertes += periodesSeance, presentes += min(periodes, periodesSeance)
   - Record facultatif (RaI) present → compte aux deux
   - Record facultatif absent → ne compte ni l'un ni l'autre
   - Aucun record mais seance saisie → absence (offertes += periodesSeance)
6. Retourner `presentes / offertes` (plafonne a 1)

### `calculerEtSauvegarderIndicesAssiduite()`

Orchestrateur. Calcule A pour chaque eleve du groupe et sauvegarde.

> **#745 (17 sept. 2026)** : un eleve exclu par statut (inactif, decrochage, abandon) est calcule comme les
> autres — son profil lit la regle de sa pratique et affiche son statut. « Hors des moyennes du groupe » se tient
> a la LECTURE : chaque moyenne, statistique ou courbe part d'une liste filtree par `estEtudiantExclu` et lit ce
> magasin DA par DA ; aucun lecteur ne le parcourt par ses cles (verrou : `sentinelle-lot-E-745-eleve-exclu`).
> Meme regle pour `calculerEtStockerIndicesCP()` (portfolio.js). Un DA qui n'est plus dans le groupe n'est pas
> calcule : `calculerTousLesIndices` rend `{ A, C, P, M : null, horsGroupe: true }`. Le repli « 3 meilleures
> notes » (`calculerPerformancePAN`) est retire.


```javascript
// Cle : cle('indicesAssiduite')
{
  sommatif: {
    "[DA-retiré]": { indice, periodesPresentes, periodesOffertes, nombreSeances }
  },
  dateCalcul: "2026-03-03T..."
}
```

Chaine `calculerEtStockerIndicesCP()` pour recalculer E = (A x C x P)^(1/3).

**Appelee par** : `saisie-presences.js` (4 endroits), `etudiants.js`, `tableau-bord-apercu.js`, `profil-etudiant.js`, `interventions.js`.

### `calculerAssiduitePourAffichage(da, dateStr, periodesSeanceActuelle)`

Preview temps reel pour le tableau de saisie. Identique a `calculerAssiduite` mais
ajoute la seance en cours (pas encore enregistree) au calcul.

**Retour** : `{ taux: 92, totalPeriodesPresentes: 23 }`

---

## Regles metier

| Regle | Detail |
|-------|--------|
| Source de verite | `seancesCompletes` du groupe-cours |
| Seance tenue | Au moins 1 saisie dans le groupe pour cette date |
| Formule | `A = Σ periodesPresentes / Σ periodesOffertes` |
| Periodes par seance | `obtenirNombrePeriodesSeance(date)` (generalement 2) |
| Seance facultative (RaI) | Present → compte ; absent → invisible |
| Indice alternatif | **Supprime** (#224) |
| Independance groupe-cours | Chaque groupe a son propre calendrier et denominateur |

---

## Lecteurs

- `calculerTousLesIndices(da)` — lit depuis `indicesAssiduite.sommatif[da]` pour calculer A, C, P, M, E
- `calculerIndicesEtudiant(da)` — lit sommatif + alias alternatif pour retrocompat
- `obtenirDetailsAssiduite(da)` dans `profil-etudiant.js` — lit le sommatif + detecte les absences par date (depuis le GROUPE)

---

## Historique

| Version | Changement |
|---------|-----------|
| Beta 93 | 6 fonctions : sommative, alternative, ponctuelle, jusquADate, tauxAssiduite, totalPeriodes |
| Beta 95.1 | Passage heures → periodes |
| Beta 95.7 | FIX #220 : datesSaisies construit depuis le groupe |
| Beta 98.02 | Module `indices.js` cree (lecteurs centralises) |
| **Beta 98.4** | **#224 : 1 fonction canonique unique, suppression alternatif, producteurs dans indices.js** |
