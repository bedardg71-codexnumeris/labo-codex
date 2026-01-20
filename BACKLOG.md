# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les taches a faire. Consulte-le en debut de session.
> **Derniere mise a jour** : 20 janvier 2026

---

## A faire

### Priorite haute - UX / Interface

- [ ] **#14** Audit champs texte -> dropdown
  - Identifier inputs texte libres qui gagneraient a etre des dropdowns
  - Ameliorer coherence et eviter erreurs de saisie

- [ ] **#20** Mettre a jour liste programmes d'etudes
  - Document programmes preuniversitaires
  - Document programmes techniques

### Documentation / Aide

- [ ] **#25** Analyse fonctionnalites pour Claude Cowork
  - Lister les principales fonctionnalites de l'application
  - Definir les plus-values et cas d'usage
  - Fournir un apercu synthetique pour presentation externe

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

- [ ] **#26** Audit versions Primo (legacy vs v2)
  - Verifier s'il existe deux versions differentes de Primo
  - Identifier les conflits potentiels entre wizard legacy et wizard-pratique-v2
  - Consolider ou deprecier la version obsolete

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

## Complete (Beta 95.7 - 20 janvier 2026)

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
