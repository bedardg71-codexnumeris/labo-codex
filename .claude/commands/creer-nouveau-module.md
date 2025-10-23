Pour créer un nouveau module JavaScript en respectant l'architecture :

**Template de base** :
````javascript
/* ===============================
   MODULE XX: [NOM DU MODULE]
   Index: [VERSION]
   Auteur: [TON NOM]
   Date: [DATE]
   
   Rôle: [SOURCE ou LECTEUR]
   
   Source de données:
   - [Si SOURCE] Génère et stocke dans localStorage.[nomDonnees]
   - [Si LECTEUR] Lit depuis localStorage.[nomDonnees]
   
   API publique:
   - fonction1(): Description
   - fonction2(): Description
   =============================== */

/* ===============================
   CONFIGURATION
   =============================== */

// Variables privées du module
let variablePrivee = null;

/* ===============================
   FONCTIONS PRIVÉES
   =============================== */

/**
 * Description de la fonction
 * @param {type} parametre - Description
 * @returns {type} Description retour
 */
function fonctionPrivee(parametre) {
    // Implémentation
}

/* ===============================
   API PUBLIQUE
   =============================== */

/**
 * Fonction publique accessible aux autres modules
 * @param {type} parametre - Description
 * @returns {type} Description retour
 */
function fonctionPublique(parametre) {
    // Implémentation
}

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise le module au chargement
 * Appelé depuis navigation.js ou main.js
 */
function initialiserModuleNom() {
    console.log('Initialisation module [NOM]');
    // Logique d'initialisation
}

/* ===============================
   GESTION DES ÉVÉNEMENTS
   =============================== */

// Event listeners si nécessaire
````

**Checklist création module** :
- [ ] En-tête documenté (rôle SOURCE ou LECTEUR)
- [ ] API publique claire et documentée
- [ ] Nommage cohérent (préfixes descriptifs)
- [ ] Fonction initialisation
- [ ] Ajout dans index.html (bon ordre de chargement)
- [ ] Ajout dans navigation.js si besoin d'init
- [ ] Test dans console : `typeof nomFonction`

**Instructions d'intégration** :
1. Crée le fichier dans `js/[nom-module].js`
2. Ajoute dans `index.html` à la bonne position (voir ordre de chargement)
3. Si besoin d'initialisation, ajoute dans `navigation.js`
4. Teste dans la console du navigateur