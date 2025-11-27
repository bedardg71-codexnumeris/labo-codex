# Guide d'ajout d'une nouvelle pratique de notation

**Guide opérationnel - Version 1.0 (9 novembre 2025)**

---

## 📌 Introduction

Ce guide explique **étape par étape** comment ajouter votre propre pratique de notation au système de monitorage pédagogique.

**Prérequis** :
- Avoir lu `ARCHITECTURE_PRATIQUES.md`
- Connaissance de base en JavaScript
- Compréhension de votre pratique pédagogique

**Durée estimée** : 2-4 heures pour une implémentation basique

---

## 🎯 Étape 1 : Définir votre pratique

### Questions à répondre

Avant d'écrire du code, clarifiez votre pratique :

1. **Nom et identifiant**
   - Nom complet : _______________________
   - Identifiant (kebab-case) : _______________________
   - Description courte : _______________________

2. **Échelle de performance**
   - Quelle échelle utilisez-vous ? (pourcentage, lettres, IDME, pass/fail, autre)
   - Quels sont vos seuils de réussite/échec ?

3. **Critères d'évaluation**
   - Avez-vous des critères fixes pour toutes les productions ?
   - Quels sont-ils ?
   - Varient-ils selon les productions ?

4. **Fenêtre temporelle**
   - Regardez-vous toutes les évaluations ou seulement les récentes ?
   - Si récentes : combien ?

5. **Défis et patterns**
   - Comment identifiez-vous un "défi" chez un étudiant ?
   - À partir de quelle performance considérez-vous un blocage ?

### Exemple : PAN-Spécifications

```
Nom : PAN-Spécifications
ID : pan-specifications
Description : Notation par spécifications (pass/fail sur objectifs)

Échelle : Pass/Fail (2 niveaux)
Seuils : Pass = toutes les spécifications satisfaites, Fail = au moins une non satisfaite

Critères : Spécifications définies par production (variables)
Fenêtre : Toutes les productions (cumulative)

Défis : Spécifications récurremment non satisfaites
Blocage : > 50% des spécifications échouées
```

---

## 🔧 Étape 2 : Créer le fichier de votre pratique

### Template de départ

Créez `/js/pratiques/pratique-[votre-id].js` :

```javascript
/**
 * PRATIQUE : [Votre nom]
 * Description : [Votre description]
 * Auteur : [Votre nom]
 * Date : [Date]
 */

/**
 * Classe représentant la pratique [Votre nom]
 * Implémente l'interface IPratique
 */
class Pratique[VotreNom] {

    constructor() {
        this.nom = '[Votre nom complet]';
        this.id = '[votre-id]';
        this.description = '[Votre description]';
    }

    /* ===============================
       MÉTHODES D'IDENTITÉ
       =============================== */

    obtenirNom() {
        return this.nom;
    }

    obtenirId() {
        return this.id;
    }

    obtenirDescription() {
        return this.description;
    }

    /* ===============================
       CALCULS DE PERFORMANCE
       =============================== */

    /**
     * Calcule l'indice de performance (P)
     * @param {string} da - Numéro DA
     * @returns {number} - Indice entre 0 et 1
     */
    calculerPerformance(da) {
        // VOTRE CODE ICI
        // Exemple : lire les évaluations, calculer la moyenne, retourner 0-1

        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        if (evaluationsEleve.length === 0) {
            return 0;
        }

        // Votre logique de calcul...

        return 0; // À implémenter
    }

    /**
     * Calcule l'indice de complétion (C)
     * @param {string} da - Numéro DA
     * @returns {number} - Indice entre 0 et 1
     */
    calculerCompletion(da) {
        // VOTRE CODE ICI
        // Exemple : nombre de productions remises / nombre attendu

        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        const productions = JSON.parse(localStorage.getItem('productions') || '[]');

        const evaluationsEleve = evaluations.filter(e => e.etudiantDA === da);

        if (productions.length === 0) {
            return 1;
        }

        return evaluationsEleve.length / productions.length;
    }

    /* ===============================
       DÉTECTION DES DÉFIS
       =============================== */

    /**
     * Détecte les défis spécifiques selon votre pratique
     * @param {string} da - Numéro DA
     * @returns {Object} - { defis, principalDefi, nombreDefis }
     */
    detecterDefis(da) {
        // VOTRE CODE ICI
        // Retourner un objet avec la structure suivante :

        return {
            defis: [
                // { nom: 'Nom du défi', score: 0.65, description: 'Explication' }
            ],
            principalDefi: null, // ou { nom: 'Nom', score: 0.65 }
            nombreDefis: 0
        };
    }

    /* ===============================
       IDENTIFICATION DES PATTERNS
       =============================== */

    /**
     * Identifie le pattern d'apprentissage
     * @param {string} da - Numéro DA
     * @returns {Object} - { pattern, raison, details }
     */
    identifierPattern(da) {
        const performance = this.calculerPerformance(da);
        const defis = this.detecterDefis(da);

        // VOTRE LOGIQUE ICI
        // Utilisez vos seuils pour déterminer le pattern

        if (performance < 0.50) {
            return {
                pattern: 'Blocage critique',
                raison: 'Performance inférieure à 50%',
                details: { performance }
            };
        }

        if (performance < 0.60 && defis.nombreDefis > 0) {
            return {
                pattern: 'Blocage émergent',
                raison: 'Performance faible avec défis',
                details: { performance, defis: defis.nombreDefis }
            };
        }

        if (defis.nombreDefis > 0) {
            return {
                pattern: 'Défi spécifique',
                raison: 'Un ou plusieurs défis identifiés',
                details: { defis: defis.nombreDefis }
            };
        }

        return {
            pattern: 'Stable',
            raison: 'Aucun défi, performance acceptable',
            details: { performance }
        };
    }

    /* ===============================
       CIBLES D'INTERVENTION
       =============================== */

    /**
     * Génère la cible d'intervention RàI
     * @param {string} da - Numéro DA
     * @param {string} pattern - Pattern détecté
     * @param {Object} defis - Défis détectés
     * @returns {Object} - { cible, description, niveau, couleur, emoji }
     */
    genererCibleIntervention(da, pattern, defis) {
        // VOTRE LOGIQUE ICI
        // Retourner des recommandations selon le pattern et les défis

        if (pattern === 'Blocage critique') {
            return {
                cible: 'Intervention urgente requise',
                description: 'Rencontre individuelle | Révision complète',
                niveau: 3,
                couleur: '#dc3545',
                emoji: '🔴'
            };
        }

        if (pattern === 'Blocage émergent') {
            return {
                cible: 'Soutien renforcé nécessaire',
                description: 'Tutorat | Révision ciblée',
                niveau: 2,
                couleur: '#ff9800',
                emoji: '🟠'
            };
        }

        if (pattern === 'Défi spécifique') {
            const defiPrincipal = defis.principalDefi;
            if (defiPrincipal) {
                return {
                    cible: `Soutien en ${defiPrincipal.nom}`,
                    description: `Remédiation ciblée sur ${defiPrincipal.nom}`,
                    niveau: 2,
                    couleur: '#ffc107',
                    emoji: '🟡'
                };
            }
        }

        return {
            cible: 'Suivi régulier',
            description: 'Maintenir la progression',
            niveau: 1,
            couleur: '#28a745',
            emoji: '🟢'
        };
    }

    /* ===============================
       CONFIGURATION
       =============================== */

    /**
     * Retourne les paramètres de configuration
     * @returns {Object} - Paramètres spécifiques
     */
    obtenirParametres() {
        return {
            // Vos paramètres configurables
            // Ex: seuils, nombre d'artefacts, etc.
        };
    }

    /**
     * Valide la configuration actuelle
     * @returns {Object} - { valide, erreurs, avertissements }
     */
    validerConfiguration() {
        const erreurs = [];
        const avertissements = [];

        // Vérifier que les données nécessaires existent
        const productions = JSON.parse(localStorage.getItem('productions') || '[]');
        if (productions.length === 0) {
            avertissements.push('Aucune production définie');
        }

        const evaluations = JSON.parse(localStorage.getItem('evaluationsSauvegardees') || '[]');
        if (evaluations.length === 0) {
            avertissements.push('Aucune évaluation saisie');
        }

        return {
            valide: erreurs.length === 0,
            erreurs: erreurs,
            avertissements: avertissements
        };
    }
}

// Export de la classe
if (typeof window !== 'undefined') {
    window.Pratique[VotreNom] = Pratique[VotreNom];
}
```

---

## 📝 Étape 3 : Enregistrer votre pratique

### Modifier le registre

Éditez `/js/pratiques/pratique-registre.js` et ajoutez votre pratique :

```javascript
// Importer votre classe
// (Assurez-vous que le fichier est chargé dans index.html)

const PRATIQUES_DISPONIBLES = {
    'pan-maitrise': new PratiquePANMaitrise(),
    'sommative': new PratiqueSommative(),
    '[votre-id]': new Pratique[VotreNom](),  // ← AJOUTER ICI
};
```

### Ajouter le script dans index.html

Dans la section `<head>` ou avant `</body>` :

```html
<!-- Pratiques de notation -->
<script src="js/pratiques/pratique-interface.js"></script>
<script src="js/pratiques/pratique-pan-maitrise.js"></script>
<script src="js/pratiques/pratique-sommative.js"></script>
<script src="js/pratiques/pratique-[votre-id].js"></script>  <!-- ← AJOUTER ICI -->
<script src="js/pratiques/pratique-registre.js"></script>
```

---

## 🧪 Étape 4 : Tester votre pratique

### Test manuel

1. **Ouvrir la console du navigateur** (F12)

2. **Sélectionner votre pratique** :
   ```javascript
   const config = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
   config.pratique = '[votre-id]';
   localStorage.setItem('modalitesEvaluation', JSON.stringify(config));
   ```

3. **Tester les méthodes** :
   ```javascript
   const pratique = obtenirPratiqueActive();
   console.log('Pratique active:', pratique.obtenirNom());

   // Tester avec un DA d'étudiant
   const da = '1234567';
   console.log('Performance:', pratique.calculerPerformance(da));
   console.log('Complétion:', pratique.calculerCompletion(da));
   console.log('Défis:', pratique.detecterDefis(da));
   console.log('Pattern:', pratique.identifierPattern(da));
   ```

4. **Vérifier dans l'interface** :
   - Aller dans Tableau de bord → Liste des étudiants
   - Vérifier que les patterns s'affichent correctement
   - Vérifier qu'il n'y a pas d'erreurs dans la console

### Tests à valider

✅ Les indices A-C-P-R se calculent correctement
✅ Les patterns s'affichent dans le tableau
✅ Le profil étudiant fonctionne
✅ Les niveaux RàI sont cohérents
✅ Pas d'erreurs JavaScript dans la console

---

## 📚 Étape 5 : Documenter votre pratique

### Ajouter une section dans l'Aide

Dans `index.html`, section Aide, ajouter :

```html
<h4>[Votre pratique]</h4>
<p><strong>Description :</strong> [Votre description détaillée]</p>

<p><strong>Calcul de la performance :</strong> [Expliquer comment P est calculé]</p>

<p><strong>Détection des défis :</strong> [Expliquer votre logique]</p>

<p><strong>Patterns d'apprentissage :</strong></p>
<ul>
    <li><strong>Stable :</strong> [Quand ?]</li>
    <li><strong>Défi spécifique :</strong> [Quand ?]</li>
    <li><strong>Blocage émergent :</strong> [Quand ?]</li>
    <li><strong>Blocage critique :</strong> [Quand ?]</li>
</ul>
```

---

## 💡 Conseils et bonnes pratiques

### 1. Commencez simple

Ne cherchez pas à tout implémenter d'un coup :
1. D'abord : `calculerPerformance()` et `calculerCompletion()`
2. Ensuite : `identifierPattern()` avec logique basique
3. Puis : `detecterDefis()` si applicable
4. Enfin : `genererCibleIntervention()` avec recommandations

### 2. Réutilisez le code existant

Inspirez-vous de `pratique-pan-maitrise.js` et `pratique-sommative.js` :
- Comment lire les évaluations
- Comment filtrer les données
- Comment structurer les retours

### 3. Gérez les cas limites

- Étudiant sans évaluation → retourner valeurs par défaut (0 ou 1 selon le cas)
- Données manquantes → avertissements dans `validerConfiguration()`
- Erreurs de calcul → try/catch et valeurs de secours

### 4. Testez avec données réelles

Avant de partager, testez avec :
- Plusieurs étudiants
- Différents niveaux de performance
- Cas limites (0 évaluation, toutes les évaluations, etc.)

---

## 🆘 Problèmes courants

### "Pratique non trouvée"

**Cause** : ID incorrect ou non enregistré dans `pratique-registre.js`

**Solution** : Vérifier l'ID dans le registre et le localStorage

### "Méthode non implémentée"

**Cause** : Une méthode obligatoire manque dans votre classe

**Solution** : Implémenter toutes les méthodes de l'interface

### "Données nulles / NaN"

**Cause** : Division par zéro ou données manquantes

**Solution** : Ajouter des vérifications (if/else) avant les calculs

### "Affichage incorrect"

**Cause** : Retour dans un format différent de celui attendu

**Solution** : Respecter exactement la structure de retour documentée

---

## 📞 Support et contribution

Si vous rencontrez des difficultés ou avez des questions :

1. Consultez `ARCHITECTURE_PRATIQUES.md`
2. Regardez les implémentations de référence
3. Ouvrez une issue sur GitHub
4. Contactez : labo@codexnumeris.org

**Partagez votre pratique !** Une fois testée, vous pouvez contribuer en :
- Créant une pull request
- Partageant votre fichier avec la communauté
- Documentant votre expérience

---

## ✅ Checklist finale

Avant de considérer votre pratique terminée :

- [ ] Toutes les méthodes de l'interface sont implémentées
- [ ] Les tests manuels passent sans erreur
- [ ] La documentation est ajoutée dans l'Aide
- [ ] Un exemple de configuration est fourni
- [ ] Le code est commenté et lisible
- [ ] Les cas limites sont gérés
- [ ] Validation avec au moins 10 étudiants différents

---

**Version** : 1.0 (9 novembre 2025)
**Dernière mise à jour** : 2025-11-09
**Auteur** : Grégoire Bédard / Labo Codex Numeris
