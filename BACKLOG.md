# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les taches a faire. Consulte-le en debut de session.
> **Derniere mise a jour** : 21 janvier 2026

---

## A faire

### Priorite haute - UX / Interface

- [ ] **#30** Export PDF des elements pedagogiques (EN COURS)
  - [x] Grilles descriptives (grille + echelle + cartouche) avec jsPDF
  - [x] Formulaire preparation 2 etapes (selection contenu → apercu mise en page)
  - [x] Nouvelle disposition : cours/trimestre en haut a droite, enseignant en bas a gauche
  - [x] Options simplifiees : orientation, checkbox trimestre, pied de page (enseignant, licence CC)
  - [x] Marges reduites (0.5 inch)
  - [x] Fonctions SST : obtenirInfosCoursPDF(), obtenirNomEnseignantPDF()
  - [ ] **Bug a corriger** :
    - Infos cours/enseignant non affichees dans le PDF (seulement "Hiver 2026" visible)
    - Fonctions corrigees selon SST de trimestre-v2.js mais ne retournent pas les donnees
    - **Prochaines etapes de debogage** :
      1. Ajouter `console.log` dans `obtenirInfosCoursPDF()` pour voir `groupeActif.coursId`
      2. Verifier si `listeCours` ou `cours` contient les donnees attendues
      3. Ajouter `console.log` dans `obtenirNomEnseignantPDF()` pour voir `groupeActif.enseignantId`
      4. Verifier si `enseignants` ou `profilEnseignant` contient les donnees
    - **SST de reference** : `js/trimestre-v2.js` lignes 4117-4140
  - [ ] **Ajustements restants** :
    - Tester sans cartouche (grille seule)
    - Productions : liste des travaux (a venir)
    - Echelles seules (a venir)

### Documentation / Aide

- [ ] **#2** Documentation complete
  - Section Aide complete dans l'application
  - Guide rapide (10-15 pages PDF)

- [ ] **#10** Mettre a jour section AIDE
  - Contenu a jour avec les fonctionnalites actuelles
  - Notes de version dans la section AIDE

- [ ] **#11** Message "Nouveautes de la beta" automatise
  - Mise a jour automatique apres chaque correctif fonctionnel
  - Synchronise avec le numero de build

- [ ] **#18** Etendre aide contextuelle 😎
  - Ajouter aides pour cas d'erreur frequents
  - Pas seulement les sections, aussi les messages d'erreur

### Fiabilite / Maintenance

- [ ] **#12** Audit db.get() vs db.getSync()
  - Verifier tous les modules pour desynchronisation IndexedDB/localStorage
  - Meme probleme que pratiques pourrait exister ailleurs

- [ ] **#13** Outil verification integrite donnees
  - Comparer IndexedDB et localStorage
  - Detecter et signaler les incoherences

- [ ] **#15** Consolidation wizard vs pratiques-materiel
  - Code duplique pour creation de pratiques
  - Factoriser logique commune

- [ ] **#16** Systeme changelog automatise
  - Generer notes de version depuis commits ou SESSION.md
  - Reduire maintenance manuelle

- [ ] **#17** Checklist tests de regression
  - Documenter verifications manuelles apres chaque build
  - Creer pratique, evaluer, sauvegarder, recharger, etc.

- [ ] **#27** Documenter conventions nommage champs
  - nArtefactsPAN vs nbArtefactsSoumis vs nombreTotal
  - Creer reference dans docs/ pour coherence future

- [ ] **#28** Ajouter mode edition a Wizard V2
  - Permettre d'editer une pratique existante via wizard-pratique-v2
  - Actuellement l'edition utilise le wizard legacy

- [ ] **#29** Retirer wizard legacy (post #28)
  - Supprimer modalWizardPratique (~600 lignes HTML)
  - Supprimer fonctions legacy dans pratiques.js
  - Prerequis : #28 complete

### Bibliotheques

- [ ] **#7-a** Bouton Supprimer dans bibliotheques
  - Pratiques et autres bibliotheques

- [ ] **#7-b** Bouton Dupliquer dans bibliotheques
  - Pratiques et autres bibliotheques

### Configuration

- [ ] **#22** Mettre a jour fichier noms_stables.json
  - Verifier que tous les identifiants critiques sont documentes
  - Ajouter les nouveaux noms proteges

---

## Complete (Beta 95.7 - 21 janvier 2026)

- [x] **Bug critique** Trimestres A2025/Demo inaccessibles
  - `changerTrimestreActif()` ne mettait pas a jour `window.trimestreActif`
  - `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
  - Donnees demo sans groupe-cours (maintenant cree automatiquement)
  - Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` dans trimestres.js
  - **Fichiers modifies** : `js/trimestres.js`, `js/donnees-demo.js`
  - **Resultat** : A2025 affiche 30 etudiants, Demo cree auto groupe-cours

## Complete (Beta 95.7 - 20 janvier 2026)

- [x] **#20** Datalist programmes d'etudes (~130 programmes preuniversitaires + techniques)
- [x] **#25** Analyse fonctionnalites pour Claude Cowork (docs/ANALYSE-FONCTIONNALITES.md)
- [x] **#14** Dropdowns discipline : liste complete (~120 disciplines, 6 optgroups)
- [x] **#26** Audit versions Primo : pas de conflit, 3 recommandations ajoutees (#27-29)
- [x] **#24** Option hybride construction note portfolio (Primo + Expert)
- [x] **#23** Uniformiser boutons tous modals (Design System v7)
- [x] **#4** Persistance donnees Wizard -> Mode Expert (flag enChargementFormulaire)
- [x] **#5** Valeurs par defaut jetons : 2 jetons/eleve, 2 jours delai
- [x] **#6** Dropdown note maximale (reprise ciblee) : echelle dynamique
- [x] **#8** Message aide bibliotheque pratiques
- [x] **#9** Document backlog independant (BACKLOG.md)
- [x] **#19** Ordre disciplines dropdown (100->600, groupe 400 corrige)
- [x] **#21** Menage fichiers repertoire principal (fusion archive/, reorganisation)
- [x] **#3** Clarifier nombre total d'artefacts (meilleurs vs obligatoires)

---

## Complete (Beta 95.6 - 19 janvier 2026)

- [x] Dropdown discipline (champ texte -> dropdown 6 categories)
- [x] Correction sauvegarde pratiques (desync IndexedDB/localStorage)
- [x] Boutons 😎 aide contextuelle (14 themes)
- [x] Design System v7 (harmonisation styles)

---

## Reporte (Post-AQPC ou V1.1)

- [ ] PAN-Objectifs ponderes (Michel B.)
- [ ] Remplacement progression (Jordan R.)
- [ ] PAN-Jugement global (config JSON)

---

## Notes

### Priorites
- **Retours testeurs** passent TOUJOURS AVANT ce backlog
- Items classes par importance et facilite d'implementation

### Pour ajouter un item
```markdown
- [ ] **#XX** Description courte
  - Detail 1
  - Detail 2
```

### Pour marquer comme complete
Deplacer dans la section "Complete" avec [x]
