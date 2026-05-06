# Audit innerHTML — 2026-05-06

> Rapport généré automatiquement par `scripts/audit-innerhtml.sh`. Implémente l'étape 1 de la Défense E (cf. `MODELE-MENACES.md` §I-01, §8.2).

## Méthodologie

Pour chaque fichier `js/*.js`, recense les `.innerHTML = ` et `.innerHTML += `. Classifie chaque ligne en :

- **secure** : contient `echapperHtml` ou `escapeHtml` sur la ligne courante OU dans les 4 lignes suivantes (template literal multi-ligne). Deux fonctions équivalentes coexistent dans le code, créées via `createElement+textContent`.
- **static** : pas de pattern d'interpolation détecté (`${...}`, `' +`, `" +`, `+ '`, `+ "`).
- **suspect** : interpolation détectée SANS échappement (ni `echapperHtml` ni `escapeHtml`) — à auditer manuellement.

**Limites** : (1) heuristique sur 5 lignes (la ligne courante + 4 suivantes) — un `innerHTML` dont le payload est construit via une variable assainie BIEN AVANT est marqué « suspect » à tort. (2) Un `innerHTML` qui interpole une variable sûre par construction (URL blob, ID interne, nombre calculé) est aussi marqué « suspect » — faux positif.

## Synthèse globale

| Métrique | Valeur |
|---|---|
| Fichiers audités | 112 |
| Fichiers contenant au moins un innerHTML | 67 |
| Total `.innerHTML =`/`+= ` | 699 |
| Sécurisé (echapperHtml) | 57 |
| Statique (sans interpolation) | 517 |
| **Suspect (interpolation sans echapperHtml)** | **125** |

## Détail par fichier (modules avec innerHTML)

| Fichier | Total | Sécurisé | Statique | **Suspect** |
|---|---:|---:|---:|---:|
| travaux-ui.js | 47 | 4 | 29 | **14** |
| planification-carte.js | 40 | 1 | 26 | **13** |
| pratiques-materiel.js | 29 | 0 | 21 | **8** |
| trimestre-v2.js | 57 | 4 | 46 | **7** |
| evaluation.js | 51 | 9 | 36 | **6** |
| travaux-outils.js | 16 | 0 | 11 | **5** |
| reserve-reglages.js | 7 | 0 | 2 | **5** |
| codex-data-ui.js | 13 | 0 | 8 | **5** |
| accompagnement.js | 6 | 0 | 1 | **5** |
| tableau-bord-apercu.js | 13 | 0 | 9 | **4** |
| productions.js | 38 | 1 | 33 | **4** |
| pratiques.js | 45 | 3 | 38 | **4** |
| liste-evaluations.js | 14 | 0 | 10 | **4** |
| grilles.js | 20 | 2 | 14 | **4** |
| export-pdf.js | 23 | 8 | 11 | **4** |
| reserve.js | 9 | 0 | 6 | **3** |
| reserve-ouvrir.js | 8 | 0 | 6 | **2** |
| organisateur.js | 20 | 0 | 18 | **2** |
| cartouches.js | 18 | 3 | 13 | **2** |
| boite-outils.js | 12 | 8 | 2 | **2** |
| trimestres.js | 4 | 1 | 2 | **1** |
| trimestre.js | 5 | 0 | 4 | **1** |
| travaux-export-pdf.js | 4 | 0 | 3 | **1** |
| spe-specifications.js | 1 | 0 | 0 | **1** |
| snapshots.js | 2 | 0 | 1 | **1** |
| saisie-presences.js | 13 | 2 | 10 | **1** |
| rythme.js | 6 | 0 | 5 | **1** |
| progression.js | 1 | 0 | 0 | **1** |
| profil-etudiant.js | 7 | 1 | 5 | **1** |
| portfolio.js | 3 | 0 | 2 | **1** |
| modelisation.js | 3 | 0 | 2 | **1** |
| journal.js | 1 | 0 | 0 | **1** |
| init-inline.js | 3 | 0 | 2 | **1** |
| horaire.js | 3 | 0 | 2 | **1** |
| guidage-demo.js | 1 | 0 | 0 | **1** |
| graphiques-progression.js | 2 | 0 | 1 | **1** |
| etudiants.js | 9 | 1 | 7 | **1** |
| echelles.js | 27 | 2 | 24 | **1** |
| consolidation.js | 7 | 0 | 6 | **1** |
| codex.js | 2 | 0 | 1 | **1** |
| bilan-reflexif.js | 11 | 0 | 10 | **1** |
| accueil.js | 1 | 0 | 0 | **1** |
| wizard-pratique-v2.js | 2 | 0 | 2 | 0 |
| travaux-preparation.js | 3 | 0 | 3 | 0 |
| travaux-doublons-ui.js | 1 | 0 | 1 | 0 |
| travaux-annotation.js | 1 | 0 | 1 | 0 |
| rapport-bug.js | 2 | 0 | 2 | 0 |
| preferences-v2.js | 1 | 0 | 1 | 0 |
| pratiques-bibliotheque.js | 1 | 0 | 1 | 0 |
| pratique-notation-v2.js | 13 | 0 | 13 | 0 |
| planification-bibliotheque.js | 3 | 0 | 3 | 0 |
| objectifs.js | 3 | 0 | 3 | 0 |
| navigation.js | 2 | 0 | 2 | 0 |
| modal-doublon.js | 1 | 0 | 1 | 0 |
| modal-backup-reminder.js | 1 | 0 | 1 | 0 |
| migrations.js | 1 | 0 | 1 | 0 |
| main.js | 2 | 0 | 2 | 0 |
| labo-codex-data.js | 1 | 0 | 1 | 0 |
| interventions.js | 7 | 1 | 6 | 0 |
| import-export.js | 3 | 0 | 3 | 0 |
| groupe.js | 9 | 3 | 6 | 0 |
| donnees-v2.js | 29 | 3 | 26 | 0 |
| cours.js | 5 | 0 | 5 | 0 |
| correlations-longitudinales.js | 1 | 0 | 1 | 0 |
| cc-license.js | 3 | 0 | 3 | 0 |
| calendrier-vue.js | 1 | 0 | 1 | 0 |
| bibliotheque-ui.js | 1 | 0 | 1 | 0 |

## Modules prioritaires

Selon `MODELE-MENACES.md` §8.2 défense E, ces modules sont les plus exposés (rendent du contenu utilisateur partagé) :

- ⚠ **grilles.js** : 4 suspect / 20 total (sécurisé 2, statique 14)
- ⚠ **echelles.js** : 1 suspect / 27 total (sécurisé 2, statique 24)
- ⚠ **cartouches.js** : 2 suspect / 18 total (sécurisé 3, statique 13)
- ⚠ **pratiques.js** : 4 suspect / 45 total (sécurisé 3, statique 38)
- ⚠ **productions.js** : 4 suspect / 38 total (sécurisé 1, statique 33)
- — **tampons-bibliotheque.js** : aucun innerHTML
- ⚠ **evaluation.js** : 6 suspect / 51 total (sécurisé 9, statique 36)
- — **evaluations-apercu.js** : aucun innerHTML
- ✓ **wizard-pratique-v2.js** : 2 total (sécurisé 0, statique 2, suspect 0)
- ✓ **pratique-notation-v2.js** : 13 total (sécurisé 0, statique 13, suspect 0)
- ✓ **bibliotheque-ui.js** : 1 total (sécurisé 0, statique 1, suspect 0)

## Cas suspects à inspecter manuellement


### travaux-ui.js (14 cas)

- `travaux-ui.js:669`  — `                            badgeStrip.innerHTML = _htmlBadgesGrille;`
- `travaux-ui.js:1160`  — `        conteneur.innerHTML = ``
- `travaux-ui.js:1346`  — `                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;`
- `travaux-ui.js:1359`  — `            conteneur.innerHTML = `<img src="${f._previewCache[cacheKey]}" alt="">`;`
- `travaux-ui.js:1504`  — `            conteneur.innerHTML = `<img src="${f._cachedOriginalThumb}" alt="">`;`
- `travaux-ui.js:1515`  — `                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;`
- `travaux-ui.js:1529`  — `                conteneur.innerHTML = `<img src="${origFallback}" alt="">`;`
- `travaux-ui.js:1566`  — `                conteneur.innerHTML = `<img src="${origCatchFallback}" alt="">`;`
- `travaux-ui.js:2088`  — `                conteneur.innerHTML = `<img src="${centreThumbPdf}" alt="" style="max-width:100%;max-height:500px;object`
- `travaux-ui.js:3408`  — `        info.innerHTML = ``
- `travaux-ui.js:5229`  — `            overlay.innerHTML = ``
- `travaux-ui.js:5530`  — `        conteneur.innerHTML = ``
- `travaux-ui.js:5631`  — `        conteneur.innerHTML = ``
- `travaux-ui.js:6228`  — `        conteneur.innerHTML = ``

### planification-carte.js (13 cas)

- `planification-carte.js:313`  — `    guide.innerHTML =`
- `planification-carte.js:368`  — `    guide.querySelector('.planif-guide-corps').innerHTML = page.contenu;`
- `planification-carte.js:889`  — `        el.innerHTML =`
- `planification-carte.js:900`  — `        el.innerHTML =`
- `planification-carte.js:1002`  — `        extra.innerHTML +=`
- `planification-carte.js:1042`  — `        extra.innerHTML +=`
- `planification-carte.js:1065`  — `        extra.innerHTML +=`
- `planification-carte.js:1226`  — `            cloneInfo.innerHTML = '<span class="planif-clone-compteur">\uD83E\uDDEC ' + nb + ' instance' + (nb > 1 ? 's'`
- `planification-carte.js:1495`  — `    el.innerHTML =`
- `planification-carte.js:2402`  — `            el.innerHTML =`
- `planification-carte.js:2415`  — `            el.innerHTML =`
- `planification-carte.js:3448`  — `    orgSelectSequence.innerHTML = '<option value="">— Séquence —</option>';`
- `planification-carte.js:3481`  — `    orgSelectLecon.innerHTML = '<option value="">— Leçon —</option>';`

### pratiques-materiel.js (8 cas)

- `pratiques-materiel.js:2031`  — `            modal.innerHTML = ``
- `pratiques-materiel.js:2196`  — `            validation.innerHTML = `<span style="color: var(--vert-principal);">✓ Total : ${total}%</span>`;`
- `pratiques-materiel.js:2198`  — `            validation.innerHTML = `<span style="color: var(--orange-principal);">⚠ Total : ${total}% (il manque ${100 -`
- `pratiques-materiel.js:2200`  — `            validation.innerHTML = `<span style="color: var(--rouge-principal);">⚠ Total : ${total}% (dépasse de ${total`
- `pratiques-materiel.js:2312`  — `        divSelection.innerHTML = `Pondération unitaire : <strong>${unitaireSelection}%</strong> par production retenue${`
- `pratiques-materiel.js:2316`  — `        divObligatoires.innerHTML = `Pondération unitaire : <strong>${unitaireObligatoires}%</strong> par production${in`
- `pratiques-materiel.js:2430`  — `        descriptionDiv.innerHTML = `<strong>${modeInfo.nom} (${modeInfo.auteur})</strong> : ${modeInfo.description}`;`
- `pratiques-materiel.js:2463`  — `        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun objectif défini. Clique su`

### trimestre-v2.js (7 cas)

- `trimestre-v2.js:1642`  — `    conteneur.innerHTML = ``
- `trimestre-v2.js:1944`  — `            elemProgrammes.innerHTML = '<strong style="font-size: 0.75rem;">Programmes :</strong><br>' +`
- `trimestre-v2.js:1989`  — `    sidebar.innerHTML = ``
- `trimestre-v2.js:2325`  — `        conteneur.innerHTML = `<p class="etat-vide-liste">${message}</p>`;`
- `trimestre-v2.js:2421`  — `            elemGroupes.innerHTML = '';`
- `trimestre-v2.js:2423`  — `            elemGroupes.innerHTML = `<div class="resume-details-ligne"><span>Groupe ${groupesTries[0][0]}</span></div>`;`
- `trimestre-v2.js:3599`  — `    carte.innerHTML = ``

### evaluation.js (6 cas)

- `evaluation.js:174`  — `    select.innerHTML = '<option value="">Tous les groupes</option>';`
- `evaluation.js:375`  — `        select.innerHTML += `<option value="${echellePratique.id}" style="background: var(--bleu-pale); font-weight: 600`
- `evaluation.js:2549`  — `            message.innerHTML = ``
- `evaluation.js:4376`  — `        statMoyenne.innerHTML = `<strong>C:</strong> ${Math.round(moyenneC * 100)}%`;`
- `evaluation.js:5320`  — `    conteneur.innerHTML = ``
- `evaluation.js:7183`  — `    conteneur.innerHTML = jetonsPersonnalises.map(jeton => ``

### travaux-outils.js (5 cas)

- `travaux-outils.js:1340`  — `        apercu.innerHTML = '';`
- `travaux-outils.js:2586`  — `        div.innerHTML =`
- `travaux-outils.js:2650`  — `        div.innerHTML =`
- `travaux-outils.js:2707`  — `        rowDiv.innerHTML =`
- `travaux-outils.js:2933`  — `                modal.innerHTML =`

### reserve-reglages.js (5 cas)

- `reserve-reglages.js:80`  — `        conteneur.innerHTML =`
- `reserve-reglages.js:100`  — `        conteneur.innerHTML =`
- `reserve-reglages.js:125`  — `    conteneur.innerHTML =`
- `reserve-reglages.js:179`  — `        conteneur.innerHTML =`
- `reserve-reglages.js:226`  — `    conteneur.innerHTML =`

### codex-data-ui.js (5 cas)

- `codex-data-ui.js:116`  — `        el.innerHTML = '<em>Aucune archive disponible. Archive d\'abord un groupe-cours via le menu Codex &gt; Archiver.`
- `codex-data-ui.js:201`  — `            elMode.innerHTML =`
- `codex-data-ui.js:246`  — `        conteneur.innerHTML =`
- `codex-data-ui.js:347`  — `            resume.innerHTML = 'Aucune archive trouv&eacute;e dans ce dossier. ' +`
- `codex-data-ui.js:362`  — `        resume.innerHTML = '<strong>' + _archivesDuDossier.length + ' archive(s) d&eacute;tect&eacute;e(s)</strong> ' +`

### accompagnement.js (5 cas)

- `accompagnement.js:597`  — `    autoHote.innerHTML =`
- `accompagnement.js:844`  — `    modal.innerHTML = ``
- `accompagnement.js:1021`  — `    bulle.innerHTML =`
- `accompagnement.js:1442`  — `    conteneur.innerHTML = '';`
- `accompagnement.js:1524`  — `        voir.innerHTML = '<strong>Voir\u00a0:</strong> ' + echapper(t.voir);`

### tableau-bord-apercu.js (4 cas)

- `tableau-bord-apercu.js:984`  — `                info.innerHTML = `<strong>${nom}</strong>${valeur ? ' : ' + valeur : ''}`;`
- `tableau-bord-apercu.js:1094`  — `            conteneurTitre.innerHTML = ``
- `tableau-bord-apercu.js:2904`  — `    container.innerHTML = Object.entries(distribution).map(([niveau, nombre]) => ``
- `tableau-bord-apercu.js:3142`  — `                conteneur.innerHTML = '<span class="habiletes-criteres-attente">Aucun critère détaillé dans les évaluati`

### productions.js (4 cas)

- `productions.js:635`  — `        selectEchelle.innerHTML = '<option value="">Aucune</option>' +`
- `productions.js:644`  — `            selectCartouche.innerHTML = '<option value="">Aucune</option>';`
- `productions.js:1499`  — `    container.innerHTML = artefacts.map(art => ``
- `productions.js:2974`  — `            modal.innerHTML = ``

### pratiques.js (4 cas)

- `pratiques.js:1522`  — `        statutDiv.innerHTML = ``
- `pratiques.js:4787`  — `    div.innerHTML = ``
- `pratiques.js:4836`  — `    div.innerHTML = ``
- `pratiques.js:4888`  — `        div.innerHTML = ``

### liste-evaluations.js (4 cas)

- `liste-evaluations.js:264`  — `            conteneur.innerHTML = ``
- `liste-evaluations.js:1442`  — `    overlay.innerHTML =`
- `liste-evaluations.js:1549`  — `    overlay.innerHTML = ``
- `liste-evaluations.js:1578`  — `                div.innerHTML = '<label style="font-size: 0.85em; color: var(--texte-secondaire);">Pour quelle productio`

### grilles.js (4 cas)

- `grilles.js:1227`  — `        statutSpan.innerHTML = '<span class="grille-texte-minimal">✓ Pondération complète</span>';`
- `grilles.js:1230`  — `        statutSpan.innerHTML = `<span class="grille-texte-modere">${100 - total}% manquant</span>`;`
- `grilles.js:1233`  — `        statutSpan.innerHTML = `<span class="grille-texte-critique">${total - 100}% en trop</span>`;`
- `grilles.js:1965`  — `            modal.innerHTML = ``

### export-pdf.js (4 cas)

- `export-pdf.js:2794`  — `        selectProd.innerHTML = '<option value="">-- Aucune (grille générique) --</option>' +`
- `export-pdf.js:2802`  — `        selectGrille.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2810`  — `        selectEchelle.innerHTML = '<option value="">-- Sélectionner --</option>' +`
- `export-pdf.js:2840`  — `            selectCartouche.innerHTML = '<option value="">-- Sans rétroaction --</option>' +`

### reserve.js (3 cas)

- `reserve.js:1425`  — `            apercu.innerHTML = '<span style="color: var(--rouge);">' + _echapper(est.erreur) + '</span>';`
- `reserve.js:1429`  — `        apercu.innerHTML =`
- `reserve.js:1437`  — `        apercu.innerHTML = '<span style="color: var(--rouge);">Erreur : ' + _echapper(e.message `
 — ` e) + '</span>';`

### reserve-ouvrir.js (2 cas)

- `reserve-ouvrir.js:511`  — `    elEtape.innerHTML =`
- `reserve-ouvrir.js:528`  — `    elEtape.innerHTML =`

### organisateur.js (2 cas)

- `organisateur.js:298`  — `    selectSequence.innerHTML = '<option value="">— Séquence —</option>';`
- `organisateur.js:334`  — `    selectLecon.innerHTML = '<option value="">— Leçon —</option>';`

### cartouches.js (2 cas)

- `cartouches.js:1794`  — `            modal.innerHTML = ``
- `cartouches.js:2825`  — `        container.innerHTML = html + '<p class="sidebar-vide">Crée une nouvelle cartouche ou puisez dans la bibliothèque`

### boite-outils.js (2 cas)

- `boite-outils.js:293`  — `        affichage.innerHTML = ``
- `boite-outils.js:575`  — `    select.innerHTML = html;`

### trimestres.js (1 cas)

- `trimestres.js:1792`  — `            container.innerHTML = ``

### trimestre.js (1 cas)

- `trimestre.js:1023`  — `    notification.innerHTML = ``

### travaux-export-pdf.js (1 cas)

- `travaux-export-pdf.js:1055`  — `            overlay.innerHTML = ``

### spe-specifications.js (1 cas)

- `spe-specifications.js:681`  — `            resultatDiv.innerHTML = ``

### snapshots.js (1 cas)

- `snapshots.js:1119`  — `            elemStatus.innerHTML = ``

### saisie-presences.js (1 cas)

- `saisie-presences.js:795`  — `                tbody.innerHTML = `<tr><td colspan="8" class="u-text-center-erreur">${messageTableau}</td></tr>`;`

### rythme.js (1 cas)

- `rythme.js:301`  — `            conteneur.innerHTML =`

### progression.js (1 cas)

- `progression.js:32`  — `    boite.innerHTML =`

### profil-etudiant.js (1 cas)

- `profil-etudiant.js:2474`  — `    contenuContainer.innerHTML = ``

### portfolio.js (1 cas)

- `portfolio.js:250`  — `        container.innerHTML = ``

### modelisation.js (1 cas)

- `modelisation.js:72`  — `        conteneur.innerHTML =`

### journal.js (1 cas)

- `journal.js:290`  — `    overlay.innerHTML =`

### init-inline.js (1 cas)

- `init-inline.js:268`  — `                bandeau.innerHTML = 'Scripts p\u00e9rim\u00e9s (build ' + _SCRIPT_BUILD + ' au lieu de ' + BUILD_ID + ')`

### horaire.js (1 cas)

- `horaire.js:909`  — `    container.innerHTML = html;`

### guidage-demo.js (1 cas)

- `guidage-demo.js:120`  — `    encart.innerHTML = '<strong>' + config.titre + '</strong> \u2014 ' + config.texte;`

### graphiques-progression.js (1 cas)

- `graphiques-progression.js:2039`  — `            selecteurEtudiant.innerHTML = '<option value="">-- Sélectionner --</option>';`

### etudiants.js (1 cas)

- `etudiants.js:160`  — `        filtreGroupe.innerHTML = '<option value="">Tous les groupes</option>';`

### echelles.js (1 cas)

- `echelles.js:2173`  — `            modal.innerHTML = ``

### consolidation.js (1 cas)

- `consolidation.js:519`  — `        conteneur.innerHTML = '<p class="text-muted">' +`

### codex.js (1 cas)

- `codex.js:1926`  — `            statutHaut.innerHTML =`

### bilan-reflexif.js (1 cas)

- `bilan-reflexif.js:1841`  — `        aide.innerHTML = rendreAideHTML('import-format',`

### accueil.js (1 cas)

- `accueil.js:109`  — `    conteneur.innerHTML = ``

## Recommandations

1. **Si Suspect global > 0** : auditer chaque cas listé ci-dessus. Distinguer les vrais XSS potentiels (interpolation de données utilisateur externes) des faux positifs (interpolation de constantes ou d'IDs internes).
2. **Pour chaque vrai cas** : convertir en `textContent` (si texte simple) ou en construction DOM (`createElement + appendChild`, si structure). `echapperHtml()` reste un pansement acceptable en transition.
3. **Modules prioritaires** : traiter en premier ceux qui rendent du contenu de bibliothèque partagée (grilles, échelles, cartouches, pratiques, productions, tampons-bibliotheque, bibliotheque-ui).
4. **Re-exécuter ce script** après chaque vague de migration pour mesurer la progression.

## Référence

Modèle de menaces : `docs/securite/MODELE-MENACES.md` §I-01 (mécanique XSS), §8.2 défense E (plan de migration).
