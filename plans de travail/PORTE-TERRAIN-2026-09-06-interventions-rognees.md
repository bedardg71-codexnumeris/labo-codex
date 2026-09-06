# Porte terrain — les interventions de l'automne ont-elles été rognées avant #772 ?

> **Écrite le 6 septembre 2026, 11 h 20, par Claude Code, avec le lot #767-#772 (1.123.7).** Lecture seule sur les données de Grégoire : **rien n'est écrit**. Cowork publie l'artefact jumeau (bouton « Copier mes résultats ») ; ce fichier est la TRACE.
> **Pourquoi une porte** : le correctif #772 tarit la SOURCE (enregistrer une intervention ne retire plus les participants que le formulaire n'a pas montrés, ni leurs notes). Le STOCK — ce qui a déjà été retiré chez Grégoire — ne revient pas, et personne d'autre que lui ne peut le lire. Une machine ne peut pas répondre à sa place (données réelles) ; un raté n'est pas irréversible (lecture seule) : aucun préalable dû.

## La seule question

Sur le trimestre actif, y a-t-il des interventions dont la liste de participants ne correspond plus aux notes individuelles qu'elles portent (une note sans participant = un participant rogné), ou des interventions vides de participants mais avec des notes ?

## Le geste (2 minutes, dans l'application, sur son Mac)

1. Ouvrir l'application, trimestre A2026 actif, n'importe quel onglet.
2. Ouvrir la console du navigateur (Chrome : `⌥⌘J`).
3. Coller, puis Entrée — **lecture seule** (aucun `setSync`, aucun `set`) :

```js
(function () {
  const liste = db.getSync(cle('interventions'), []) || [];
  const rognees = liste.map(i => {
    const participants = new Set(i.etudiants || []);
    const notesSansParticipant = Object.keys(i.notesIndividuelles || {}).filter(da => !participants.has(da));
    return { id: i.id, titre: i.titre, date: i.date, statut: i.statut, participants: participants.size, notes: Object.keys(i.notesIndividuelles || {}).length, notesSansParticipant };
  }).filter(r => r.notesSansParticipant.length > 0 || (r.participants === 0 && r.notes > 0));
  console.log('Interventions du trimestre :', liste.length, '— suspectes :', rognees.length);
  console.table(rognees);
  return rognees.length;
})();
```

4. Noter le nombre affiché et, s'il est supérieur à 0, copier le tableau (les DA y figurent : ne pas le coller ailleurs que dans le relais privé).

## Ce que le résultat veut dire

| Résultat | Lecture | Suite |
|---|---|---|
| `suspectes : 0` | Aucune intervention ne porte de note sans son participant : le stock est sain, #772 suffit. | Cocher, fermer. |
| `suspectes : N` | N interventions ont perdu des participants avant #772 ; leurs notes sont encore là (le correctif ne touchait que la liste). | **Décision de Grégoire** : réinscrire les DA à la main dans chaque intervention (rouvrir, cocher, enregistrer), ou laisser. Aucun script ne le fera à sa place. |

- [ ] Fait le ____ à ____ — résultat : ____
