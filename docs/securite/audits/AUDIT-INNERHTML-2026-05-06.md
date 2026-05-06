# Audit innerHTML — 2026-05-06

> Rapport généré automatiquement par `scripts/audit-innerhtml.sh`. Implémente l'étape 1 de la Défense E (cf. `MODELE-MENACES.md` §I-01, §8.2).

## Méthodologie

Pour chaque fichier `js/*.js`, recense les `.innerHTML = ` et `.innerHTML += `. Classifie chaque ligne en :

- **secure** : contient `echapperHtml` sur la même ligne.
- **static** : pas de pattern d'interpolation détecté (`${...}`, `' +`, `" +`, `+ '`, `+ "`).
- **suspect** : interpolation détectée SANS `echapperHtml` — à auditer manuellement.

**Limite** : heuristique sur une seule ligne. Un `innerHTML` construit via une variable intermédiaire passe en « static » à tort. Un `innerHTML` qui interpole une variable déjà sûre par construction est marqué « suspect » (faux positif).

## Synthèse globale

| Métrique | Valeur |
|---|---|
| Fichiers audités | 112 |
| Fichiers contenant au moins un innerHTML | 67 |
| Total `.innerHTML =`/`+= ` | 699 |
| Sécurisé (echapperHtml) | 5 |
| Statique (sans interpolation) | 636 |
| **Suspect (interpolation sans echapperHtml)** | **58** |

## Détail par fichier (modules avec innerHTML)

| Fichier | Total | Sécurisé | Statique | **Suspect** |
|---|---:|---:|---:|---:|
| export-pdf.js | 23 | 0 | 11 | **12** |
| travaux-ui.js | 47 | 0 | 40 | **7** |
| pratiques-materiel.js | 29 | 0 | 22 | **7** |
| evaluation.js | 51 | 0 | 46 | **5** |
| trimestre-v2.js | 57 | 0 | 54 | **3** |
| grilles.js | 20 | 0 | 17 | **3** |
| cartouches.js | 18 | 0 | 15 | **3** |
| reserve.js | 9 | 0 | 7 | **2** |
| productions.js | 38 | 0 | 36 | **2** |
| donnees-v2.js | 29 | 0 | 27 | **2** |
| codex-data-ui.js | 13 | 0 | 11 | **2** |
| tableau-bord-apercu.js | 13 | 0 | 12 | **1** |
| saisie-presences.js | 13 | 0 | 12 | **1** |
| profil-etudiant.js | 7 | 0 | 6 | **1** |
| planification-carte.js | 40 | 0 | 39 | **1** |
| liste-evaluations.js | 14 | 0 | 13 | **1** |
| init-inline.js | 3 | 0 | 2 | **1** |
| guidage-demo.js | 1 | 0 | 0 | **1** |
| echelles.js | 27 | 0 | 26 | **1** |
| consolidation.js | 7 | 0 | 6 | **1** |
| accompagnement.js | 6 | 0 | 5 | **1** |
| wizard-pratique-v2.js | 2 | 0 | 2 | 0 |
| trimestres.js | 4 | 1 | 3 | 0 |
| trimestre.js | 5 | 0 | 5 | 0 |
| travaux-preparation.js | 3 | 0 | 3 | 0 |
| travaux-outils.js | 16 | 0 | 16 | 0 |
| travaux-export-pdf.js | 4 | 0 | 4 | 0 |
| travaux-doublons-ui.js | 1 | 0 | 1 | 0 |
| travaux-annotation.js | 1 | 0 | 1 | 0 |
| spe-specifications.js | 1 | 0 | 1 | 0 |
| snapshots.js | 2 | 0 | 2 | 0 |
| rythme.js | 6 | 0 | 6 | 0 |
| reserve-reglages.js | 7 | 0 | 7 | 0 |
| reserve-ouvrir.js | 8 | 0 | 8 | 0 |
| rapport-bug.js | 2 | 0 | 2 | 0 |
| progression.js | 1 | 0 | 1 | 0 |
| preferences-v2.js | 1 | 0 | 1 | 0 |
| pratiques.js | 45 | 0 | 45 | 0 |
| pratiques-bibliotheque.js | 1 | 0 | 1 | 0 |
| pratique-notation-v2.js | 13 | 0 | 13 | 0 |
| portfolio.js | 3 | 0 | 3 | 0 |
| planification-bibliotheque.js | 3 | 0 | 3 | 0 |
| organisateur.js | 20 | 0 | 20 | 0 |
| objectifs.js | 3 | 0 | 3 | 0 |
| navigation.js | 2 | 0 | 2 | 0 |
| modelisation.js | 3 | 0 | 3 | 0 |
| modal-doublon.js | 1 | 0 | 1 | 0 |
| modal-backup-reminder.js | 1 | 0 | 1 | 0 |
| migrations.js | 1 | 0 | 1 | 0 |
| main.js | 2 | 0 | 2 | 0 |
| labo-codex-data.js | 1 | 0 | 1 | 0 |
| journal.js | 1 | 0 | 1 | 0 |
| interventions.js | 7 | 0 | 7 | 0 |
| import-export.js | 3 | 0 | 3 | 0 |
| horaire.js | 3 | 0 | 3 | 0 |
| groupe.js | 9 | 0 | 9 | 0 |
| graphiques-progression.js | 2 | 0 | 2 | 0 |
| etudiants.js | 9 | 0 | 9 | 0 |
| cours.js | 5 | 0 | 5 | 0 |
| correlations-longitudinales.js | 1 | 0 | 1 | 0 |
| codex.js | 2 | 0 | 2 | 0 |
| cc-license.js | 3 | 0 | 3 | 0 |
| calendrier-vue.js | 1 | 0 | 1 | 0 |
| boite-outils.js | 12 | 4 | 8 | 0 |
| bilan-reflexif.js | 11 | 0 | 11 | 0 |
| bibliotheque-ui.js | 1 | 0 | 1 | 0 |
| accueil.js | 1 | 0 | 1 | 0 |

## Modules prioritaires

Selon `MODELE-MENACES.md` §8.2 défense E, ces modules sont les plus exposés (rendent du contenu utilisateur partagé) :

- ⚠ **grilles.js** : 3 suspect / 20 total (sécurisé 0, statique 17)
- ⚠ **echelles.js** : 1 suspect / 27 total (sécurisé 0, statique 26)
- ⚠ **cartouches.js** : 3 suspect / 18 total (sécurisé 0, statique 15)
- ✓ **pratiques.js** : 45 total (sécurisé 0, statique 45, suspect 0)
- ⚠ **productions.js** : 2 suspect / 38 total (sécurisé 0, statique 36)
- — **tampons-bibliotheque.js** : aucun innerHTML
- ⚠ **evaluation.js** : 5 suspect / 51 total (sécurisé 0, statique 46)
- — **evaluations-apercu.js** : aucun innerHTML
- ✓ **wizard-pratique-v2.js** : 2 total (sécurisé 0, statique 2, suspect 0)
- ✓ **pratique-notation-v2.js** : 13 total (sécurisé 0, statique 13, suspect 0)
- ✓ **bibliotheque-ui.js** : 1 total (sécurisé 0, statique 1, suspect 0)

## Cas suspects à inspecter manuellement


### export-pdf.js (12 cas)

- `export-pdf.js:1543`  — `        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +`
- `export-pdf.js:1550`  — `        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:1557`  — `        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:1591`  — `            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +`
- `export-pdf.js:2270`  — `        selectProduction.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +`
- `export-pdf.js:2278`  — `        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2286`  — `        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2318`  — `            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +`
- `export-pdf.js:2794`  — `        selectProd.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +`
- `export-pdf.js:2802`  — `        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2810`  — `        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2840`  — `            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +`

### travaux-ui.js (7 cas)

- `travaux-ui.js:1346`  — `                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;`
- `travaux-ui.js:1359`  — `            conteneur.innerHTML = `<img src="${f._previewCache[cacheKey]}" alt="">`;`
- `travaux-ui.js:1504`  — `            conteneur.innerHTML = `<img src="${f._cachedOriginalThumb}" alt="">`;`
- `travaux-ui.js:1515`  — `                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;`
- `travaux-ui.js:1529`  — `                conteneur.innerHTML = `<img src="${origFallback}" alt="">`;`
- `travaux-ui.js:1566`  — `                conteneur.innerHTML = `<img src="${origCatchFallback}" alt="">`;`
- `travaux-ui.js:2088`  — `                conteneur.innerHTML = `<img src="${centreThumbPdf}" alt="" style="max-width:100%;max-height:500px;object`

### pratiques-materiel.js (7 cas)

- `pratiques-materiel.js:2196`  — `            validation.innerHTML = `<span style="color: var(--vert-principal);">✓ Total : ${total}%</span>`;`
- `pratiques-materiel.js:2198`  — `            validation.innerHTML = `<span style="color: var(--orange-principal);">⚠ Total : ${total}% (il manque ${100 -`
- `pratiques-materiel.js:2200`  — `            validation.innerHTML = `<span style="color: var(--rouge-principal);">⚠ Total : ${total}% (dépasse de ${total`
- `pratiques-materiel.js:2312`  — `        divSelection.innerHTML = `Pondération unitaire : <strong>${unitaireSelection}%</strong> par production retenue${`
- `pratiques-materiel.js:2316`  — `        divObligatoires.innerHTML = `Pondération unitaire : <strong>${unitaireObligatoires}%</strong> par production${in`
- `pratiques-materiel.js:2430`  — `        descriptionDiv.innerHTML = `<strong>${modeInfo.nom} (${modeInfo.auteur})</strong> : ${modeInfo.description}`;`
- `pratiques-materiel.js:2463`  — `        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun objectif défini. Clique su`

### evaluation.js (5 cas)

- `evaluation.js:375`  — `        select.innerHTML += `<option value="${echellePratique.id}" style="background: var(--bleu-pale); font-weight: 600`
- `evaluation.js:4147`  — `        selectGroupe.innerHTML = '<option value="">Tous les groupes</option>' +`
- `evaluation.js:4157`  — `        selectProduction.innerHTML = '<option value="">Toutes les productions</option>' +`
- `evaluation.js:4170`  — `        selectProduction.innerHTML = '<option value="">Toutes les productions</option>' +`
- `evaluation.js:4376`  — `        statMoyenne.innerHTML = `<strong>C:</strong> ${Math.round(moyenneC * 100)}%`;`

### trimestre-v2.js (3 cas)

- `trimestre-v2.js:1944`  — `            elemProgrammes.innerHTML = '<strong style="font-size: 0.75rem;">Programmes :</strong><br>' +`
- `trimestre-v2.js:2325`  — `        conteneur.innerHTML = `<p class="etat-vide-liste">${message}</p>`;`
- `trimestre-v2.js:2423`  — `            elemGroupes.innerHTML = `<div class="resume-details-ligne"><span>Groupe ${groupesTries[0][0]}</span></div>`;`

### grilles.js (3 cas)

- `grilles.js:133`  — `    select.innerHTML = '<option value="">-- Nouvelle grille --</option>' +`
- `grilles.js:1230`  — `        statutSpan.innerHTML = `<span class="grille-texte-modere">${100 - total}% manquant</span>`;`
- `grilles.js:1233`  — `        statutSpan.innerHTML = `<span class="grille-texte-critique">${total - 100}% en trop</span>`;`

### cartouches.js (3 cas)

- `cartouches.js:288`  — `    select.innerHTML = '<option value="">-- Choisir une grille --</option>' +`
- `cartouches.js:328`  — `    selectCartouche.innerHTML = '<option value="">-- Nouvelle cartouche --</option>' +`
- `cartouches.js:2825`  — `        container.innerHTML = html + '<p class="sidebar-vide">Crée une nouvelle cartouche ou puisez dans la bibliothèque`

### reserve.js (2 cas)

- `reserve.js:1425`  — `            apercu.innerHTML = '<span style="color: var(--rouge);">' + _echapper(est.erreur) + '</span>';`
- `reserve.js:1437`  — `        apercu.innerHTML = '<span style="color: var(--rouge);">Erreur : ' + _echapper(e.message `
 — ` e) + '</span>';`

### productions.js (2 cas)

- `productions.js:635`  — `        selectEchelle.innerHTML = '<option value="">Aucune</option>' +`
- `productions.js:648`  — `        selectCartouche.innerHTML = '<option value="">Aucune</option>' +`

### donnees-v2.js (2 cas)

- `donnees-v2.js:1417`  — `            listeDependances.innerHTML = dependances.map(d => `<li>${escapeHtml(d)}</li>`).join('');`
- `donnees-v2.js:1427`  — `            listeAvertissements.innerHTML = avertissements.map(a => `<li>${escapeHtml(a)}</li>`).join('');`

### codex-data-ui.js (2 cas)

- `codex-data-ui.js:347`  — `            resume.innerHTML = 'Aucune archive trouv&eacute;e dans ce dossier. ' +`
- `codex-data-ui.js:362`  — `        resume.innerHTML = '<strong>' + _archivesDuDossier.length + ' archive(s) d&eacute;tect&eacute;e(s)</strong> ' +`

### tableau-bord-apercu.js (1 cas)

- `tableau-bord-apercu.js:984`  — `                info.innerHTML = `<strong>${nom}</strong>${valeur ? ' : ' + valeur : ''}`;`

### saisie-presences.js (1 cas)

- `saisie-presences.js:795`  — `                tbody.innerHTML = `<tr><td colspan="8" class="u-text-center-erreur">${messageTableau}</td></tr>`;`

### profil-etudiant.js (1 cas)

- `profil-etudiant.js:8676`  — `    selectSousCategorie.innerHTML = '<option value="">-- Sélectionner --</option>' +`

### planification-carte.js (1 cas)

- `planification-carte.js:1226`  — `            cloneInfo.innerHTML = '<span class="planif-clone-compteur">\uD83E\uDDEC ' + nb + ' instance' + (nb > 1 ? 's'`

### liste-evaluations.js (1 cas)

- `liste-evaluations.js:1578`  — `                div.innerHTML = '<label style="font-size: 0.85em; color: var(--texte-secondaire);">Pour quelle productio`

### init-inline.js (1 cas)

- `init-inline.js:268`  — `                bandeau.innerHTML = 'Scripts p\u00e9rim\u00e9s (build ' + _SCRIPT_BUILD + ' au lieu de ' + BUILD_ID + ')`

### guidage-demo.js (1 cas)

- `guidage-demo.js:120`  — `    encart.innerHTML = '<strong>' + config.titre + '</strong> \u2014 ' + config.texte;`

### echelles.js (1 cas)

- `echelles.js:1772`  — `    selectEchelle.innerHTML = '<option value="">-- Choisir une échelle --</option>' +`

### consolidation.js (1 cas)

- `consolidation.js:519`  — `        conteneur.innerHTML = '<p class="text-muted">' +`

### accompagnement.js (1 cas)

- `accompagnement.js:1524`  — `        voir.innerHTML = '<strong>Voir\u00a0:</strong> ' + echapper(t.voir);`

## Recommandations

1. **Si Suspect global > 0** : auditer chaque cas listé ci-dessus. Distinguer les vrais XSS potentiels (interpolation de données utilisateur externes) des faux positifs (interpolation de constantes ou d'IDs internes).
2. **Pour chaque vrai cas** : convertir en `textContent` (si texte simple) ou en construction DOM (`createElement + appendChild`, si structure). `echapperHtml()` reste un pansement acceptable en transition.
3. **Modules prioritaires** : traiter en premier ceux qui rendent du contenu de bibliothèque partagée (grilles, échelles, cartouches, pratiques, productions, tampons-bibliotheque, bibliotheque-ui).
4. **Re-exécuter ce script** après chaque vague de migration pour mesurer la progression.

## Référence

Modèle de menaces : `docs/securite/MODELE-MENACES.md` §I-01 (mécanique XSS), §8.2 défense E (plan de migration).
