# Inventaire des données stockées par Labo Codex

**Référence** : OWASP Web Security Testing Guide v4.2, §4.11.12 « Testing Browser Storage ».

---

## Méthode

1. Ouvrir Labo Codex en local avec des données de test (jamais avec données réelles d'élèves).
2. DevTools du navigateur > Application > Storage.
3. Pour chaque entrée localStorage et chaque objectStore IndexedDB, remplir le tableau ci-dessous.

---

## localStorage

| Clé | Type de donnée | Exemple de contenu | Sensibilité | Justification | Politique de rétention |
|---|---|---|---|---|---|
| ex: `currentTrimestre` | identifiant | `"H2026"` | Publique | Navigation | Permanente |
| ... | | | | | |

### Niveaux de sensibilité

- **Publique** : information non sensible (réglages UI, identifiant de session).
- **Pseudonyme** : identifiant interne sans lien direct avec une identité.
- **Nominative** : permet d'identifier directement une personne (nom complet, courriel).
- **Sensible** : santé, origine ethnique, situation familiale, performance scolaire.

---

## IndexedDB

### Base : `<nom de la BD>`

#### ObjectStore : `<nom>`

| Champ | Type | Exemple | Sensibilité | Justification | Rétention |
|---|---|---|---|---|---|
| | | | | | |

(Répéter pour chaque objectStore.)

---

## Données dérivées et calculs

Données qui ne sont pas stockées directement mais calculées à la volée à partir d'autres données :

| Donnée dérivée | Source | Localisation du calcul | Sensibilité |
|---|---|---|---|
| ex: indice de blocage | S, F, R par artefact | `js/<module>.js:calculerBlocage()` | Pseudonyme |
| | | | |

---

## Évaluation globale

### Données nominatives en clair

Réponse : Oui / Non.
Si oui, lister les champs concernés et justifier (ou planifier le chiffrement / pseudonymisation).

### Données sensibles

Réponse : Oui / Non.
Si oui, justifier la nécessité de les stocker et le mode de protection.

### Chiffrement applicatif

Champs chiffrés via Web Crypto API : <liste ou « aucun ».

### Pseudonymisation

Stratégie utilisée : <description ou « aucune ».

---

## Risques identifiés

1. **Lecture par XSS** : si une vulnérabilité XSS existe, toutes les données IndexedDB et localStorage sont exfiltrables.
   - Mitigation : audit A03 OWASP (sous-audit 5.1).
2. **Accès partagé** : si l'iPad/Mac est partagé entre utilisateurs sans session OS séparée, l'accès aux données est inter-utilisateurs.
   - Mitigation : documenter dans `USAGE.md` (un appareil = un utilisateur).
3. **Perte de données** : pas de sauvegarde cloud par conception.
   - Mitigation : encourager export ZIP manuel régulier.

---

## Recommandations

À remplir après audit :

- Données à chiffrer en priorité : ...
- Données à pseudonymiser : ...
- Données à supprimer du stockage local : ...
- Politique de rétention à formaliser : ...
