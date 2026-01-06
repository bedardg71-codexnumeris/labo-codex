# Plan : Refonte Import/Export

**Date** : 6 janvier 2026
**Statut** : En reflexion - implementation future
**Contexte** : Discussion Gregoire + Claude Code

---

## Vision globale

L'import/export sert **3 usages distincts** qui doivent etre clairement separes dans l'interface :

| Usage | Bouton | Contenu | Securite |
|-------|--------|---------|----------|
| Backup personnel | Backup personnel | TOUT (ressources + donnees) | Crypte |
| Partage ressources | Partager ressources | 5 types de ressources | CC BY-NC-SA |
| Export recherche | Export recherche | Donnees anonymisees | Anonymise |

---

## 1. BACKUP PERSONNEL

### Objectif
Proteger et restaurer ses propres donnees. Fichier complet, prive, securise.

### Contenu
- Toutes les ressources (grilles, echelles, productions, cartouches, configs pratique)
- Toutes les donnees (etudiants, presences, notes, evaluations)
- Configuration complete (cours, trimestre, preferences)

### Securite : Cryptage

**Etat actuel** : Aucun cryptage. Export en JSON brut lisible.

**Options de cryptage a evaluer** :

#### Option A : Mot de passe utilisateur
- L'utilisateur choisit un mot de passe au moment de l'export
- Il doit le retenir pour reimporter
- Risque : mot de passe perdu = donnees perdues

#### Option B : Cle derivee du courriel
- Cle generee a partir du courriel de l'utilisateur
- Pas besoin de retenir un mot de passe
- Risque : si quelqu'un connait le courriel, peut-il decrypter ?

#### Option C : Cle stockee localement
- Cle generee automatiquement, stockee dans le navigateur
- Transparente pour l'utilisateur
- Risque : changement de navigateur/appareil = cle perdue

#### Option D : Code de confirmation par courriel
- Au moment de l'export, un code est envoye par courriel
- L'utilisateur doit entrer ce code pour confirmer
- Le code sert de cle de cryptage
- Avantage : valide que l'utilisateur controle vraiment ce courriel

**Algorithme recommande** : AES-256-GCM
- Standard moderne, securise
- Supporte nativement par les navigateurs (Web Crypto API)
- Exemple de code :
```javascript
// Cryptage
const key = await crypto.subtle.importKey(...);
const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
);

// Decryptage
const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
);
```

**Decision a prendre** : Quelle option choisir ?

### Information utilisateur
- Afficher clairement que le backup est crypte
- Expliquer comment restaurer
- Rappeler de conserver le fichier en lieu sur

---

## 2. PARTAGE DE RESSOURCES

### Objectif
Partager du materiel pedagogique entre collegues. Favoriser l'entraide professionnelle.

### Contenu (5 types)
1. Productions
2. Grilles de criteres
3. Echelles de performance
4. Cartouches de retroaction
5. Configurations de pratique

### Philosophie
> "C'est du support professionnel, pas de la propriete intellectuelle. On les partage librement."

Ce message devrait apparaitre dans l'interface d'export pour encourager le partage.

### Licence
- **Ressources (1-4)** : CC BY-NC-SA 4.0
- **Configs pratique (5)** : Libre, sans CC (support professionnel)

### Champs obligatoires avant export

| Champ | Validation | Stockage |
|-------|------------|----------|
| Prenom | Min 2 caracteres | infoCours.prenomEnseignant |
| Nom | Min 2 caracteres | infoCours.nomEnseignant |
| Courriel | Format email valide | infoCours.courriel |
| Cegep | Liste predefinies ? | infoCours.etablissement |
| Discipline | Texte libre | infoCours.discipline |

### Validation du courriel

**Question** : Comment s'assurer que le courriel est reel ?

#### Option A : Courriel Cloudflare Access
- Si l'app utilise Cloudflare Access, le courriel est deja verifie
- On pourrait forcer l'utilisation de ce courriel
- Avantage : pas de validation supplementaire
- Question : est-ce techniquement faisable ?

#### Option B : Code de confirmation
- Envoyer un code par courriel
- L'utilisateur doit entrer le code pour valider
- Avantage : confirme que l'utilisateur controle ce courriel
- Inconvenient : necessite un service d'envoi de courriel (Cloudflare Workers?)

#### Option C : Validation format seulement
- Verifier que c'est un format email valide
- Pas de verification que l'adresse existe
- Risque : adresses bidons possibles

**Decision a prendre** : Quelle option choisir ?

### Modes d'export
- A la piece (une ressource)
- En lot par categorie (toutes les grilles)
- En lot par auteur (tout mon materiel)

### Modes d'import
- Selectif avec checkboxes individuelles (deja implemente)
- Tout cocher/decocher par categorie (deja implemente)

---

## 3. EXPORT RECHERCHE

### Objectif
Agreger des donnees anonymisees pour la recherche pedagogique et l'analyse.

### Contenu
- Donnees de presence (sans noms)
- Notes et evaluations (sans noms)
- Indices A-C-P agrege
- Snapshots de progression

### Anonymisation
- Remplacer noms par identifiants generiques (Etudiant-001, Etudiant-002...)
- Retirer DA, courriel etudiant
- Conserver groupe, session, discipline

### Acces
- Grise par defaut (non disponible)
- Activer uniquement sur demande explicite
- Avertissement sur l'usage des donnees

---

## 4. AUTO-ANONYMISATION DES TRIMESTRES

### Objectif
Proteger automatiquement les donnees des trimestres termines.

### Delai
**Decision** : 1 an apres la fin du trimestre

### Comportement
- Notification a l'utilisateur avant anonymisation
- Option de reporter (1 fois ?)
- Anonymisation irreversible des donnees etudiantes
- Conservation des ressources (grilles, echelles, etc.)

### Questions ouvertes
- Conserver une copie non-anonymisee quelque part ?
- Permettre un export complet avant anonymisation ?
- Notification par courriel ou seulement dans l'app ?

---

## 5. INTERFACE UTILISATEUR

### Boutons principaux (3 distincts)

```
[Backup personnel]  [Partager ressources]  [Export recherche]
```

### Simplification actuelle
- Trop de boutons disperses dans l'interface
- Regrouper dans Reglages > Donnees
- Un seul point d'entree pour chaque usage

### Messages a afficher

**Partage ressources** :
> "Le partage de ressources pedagogiques est un acte de solidarite professionnelle.
> Votre materiel aide les collegues debutants et favorise l'integration de nouvelles
> pratiques pedagogiques. Merci de contribuer a cette communaute d'entraide."

**Backup personnel** :
> "Votre backup est crypte et ne peut etre lu que par vous.
> Conservez ce fichier en lieu sur (OneDrive, Google Drive, etc.)."

**Export recherche** :
> "Les donnees exportees sont completement anonymisees.
> Aucun nom d'etudiant n'apparait dans le fichier."

---

## 6. IMPLEMENTATION

### Priorite 1 : Cryptage du backup
- Choisir l'option de cryptage
- Implementer avec Web Crypto API
- Tester import/export crypte

### Priorite 2 : Validation des champs
- Rendre champs obligatoires
- Bloquer export si incomplet
- Choisir methode de validation courriel

### Priorite 3 : Interface 3 boutons
- Refactorer l'UI
- Separer clairement les 3 usages
- Ajouter les messages explicatifs

### Priorite 4 : Auto-anonymisation
- Implementer le delai de 1 an
- Systeme de notification
- Processus d'anonymisation

---

## 7. QUESTIONS EN SUSPENS

1. **Cryptage** : Quelle option choisir (A/B/C/D) ?
2. **Validation courriel** : Cloudflare, code de confirmation, ou format seulement ?
3. **Configs pratique** : Confirmer qu'elles sont sans CC ?
4. **Auto-anonymisation** : Irreversible ou avec backup ?
5. **Service courriel** : Utiliser Cloudflare Workers pour envoyer des codes ?

---

## 8. PROCHAINES ETAPES

- [ ] Repondre aux questions en suspens
- [ ] Valider le plan avec les testeurs (Bruno ?)
- [ ] Prioriser les implementations
- [ ] Coder par phases

---

**Derniere mise a jour** : 6 janvier 2026
