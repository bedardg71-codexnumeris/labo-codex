# Audit de completude — Anonymisation (Tier 0.4)

**Date** : 1er avril 2026
**Beta** : 99.01
**Auteur** : Claude Code (plan de consolidation avril 2026)

---

## Types de donnees couverts par anonymiserDonnees()

| Type | Traitement | Champs anonymises |
|------|-----------|-------------------|
| `groupeEtudiants` | case dans anonymiserDonnees() | nom, prenom, da (affichage), groupe |
| `evaluationsSauvegardees` | case dans anonymiserDonnees() | etudiantNom, groupe |
| `presences` | case dans anonymiserDonnees() | nom, prenom, da (affichage) |

## Types traites a l'affichage (Tier 0.1-0.3)

| Type | Traitement | Details |
|------|-----------|---------|
| `fichiersTravaux` (nomFichier) | anonymiserNomFichier() a l'affichage | 13 points dans 5 fichiers |
| Retroactions (c.retroaction) | anonymiserTexteRetroaction() a l'affichage | exports PDF + modales UI |

## Types evalues — PAS DE DONNEES ETUDIANTES

| Type | Justification |
|------|--------------|
| `productions` | Titres et descriptions pedagogiques. Aucun DA ni nom d'etudiant. |
| `grillesTemplates` | Noms de criteres et niveaux. Aucune donnee etudiante. |
| `echellesTemplates` | Niveaux de performance. Aucune donnee etudiante. |
| `cartouches` | Contextes de retroaction generiques. Aucune donnee etudiante. |
| `pratiquesConfigurables` | Configuration des pratiques. Aucune donnee etudiante. |
| `annotationsTravaux` | Coordonnees de dessin (traits, formes, autocollants). Aucun texte libre. |
| `portfoliosEleves` | DA comme cle objet (non affiche). Contenu = IDs de productions. |
| `indicesCP` | DA comme cle objet. Contenu = indices numeriques calcules. |
| `indicesAssiduite` | DA comme cle objet. Contenu = metriques de presence. |
| `indicesPatternsRaI` | DA comme cle objet. Contenu = niveaux RaI calcules. |
| `snapshots` | DA dans tableaux internes. Noms resolus a l'affichage via obtenirDonneesSelonMode. |
| `calendrierComplet` | Donnees d'horaire. Aucune donnee etudiante. |
| `groupesCours` | Configuration cours/groupes. Aucune donnee etudiante directe. |

## Types avec risque residuel — traites en Tier 0.4

| Type | Risque | Traitement applique |
|------|--------|-------------------|
| `interventions` | ELEVE — texte libre dans notesIndividuelles, description, observations. Noms d'etudiants possibles. | anonymiserTexteRetroaction() + echapperHtml() sur 4 points d'affichage dans interventions.js |
| `corbeilleFichiers` | FAIBLE — nomFichier peut contenir un nom. Mais la corbeille n'a pas d'interface d'affichage visible. | Pas de correction necessaire. Si une UI est ajoutee, utiliser anonymiserNomFichier(). |

## Points d'affichage ou les noms resolvent via obtenirDonneesSelonMode

Les modules suivants obtiennent les etudiants via obtenirDonneesSelonMode('groupeEtudiants'),
qui retourne deja des noms anonymises en mode anonymisation. Pas de correction necessaire :

- profil-etudiant.js
- tableau-bord-apercu.js
- etudiants.js
- interventions.js (lignes 573, 1024-1030)
- snapshots.js (lookup au moment de l'affichage)

## Exclusions documentees

| Type | Raison de l'exclusion |
|------|----------------------|
| `objectifs` | Pas de donnees etudiantes. Objectifs pedagogiques uniquement. |
| `indicesEvaluation` | Cle declaree mais non utilisee dans le code. |
| `archivesBundles` | Bundles d'archivage. Pas d'interface d'affichage. |

## Critere de reussite

Liste exhaustive documentee de ce qui est anonymise et ce qui ne l'est pas,
avec justification pour chaque exclusion. ✅
