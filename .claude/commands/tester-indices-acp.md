Teste le calcul et l'affichage des indices A-C-P :

**Test Assiduité (A)** :
1. Ouvre Présences → Saisie
2. Vérifie que des présences sont saisies
3. Retourne à Tableau de bord → Aperçu
4. Confirme que les indices A s'affichent correctement
5. Vérifie dans localStorage : `indicesAssiduiteDetailles`

**Test Complétion (C)** :
1. Vérifie que module portfolio.js existe et est chargé
2. Vérifie localStorage : `indicesCP`
3. Confirme format : `{ "DA12345": { indiceCGlobal: 0.85, ... } }`

**Test Performance (P)** :
1. Même vérifications que pour C
2. Confirme que les notes SRPNF sont converties en scores IDME

**Formules à vérifier** (selon Guide de monitorage) :
- Assiduité : `présences / total_séances_période`
- Complétion : `travaux_remis / total_travaux_période`  
- Performance : moyenne pondérée selon SRPNF puis convertie IDME

**Code de test console** :
````javascript
// Test existence des données
console.log('Indices A:', !!localStorage.getItem('indicesAssiduiteDetailles'));
console.log('Indices CP:', !!localStorage.getItem('indicesCP'));

// Afficher les données
const indicesA = JSON.parse(localStorage.getItem('indicesAssiduiteDetailles') || '{}');
const indicesCP = JSON.parse(localStorage.getItem('indicesCP') || '{}');

console.log('Nombre d\'étudiants avec indices A:', Object.keys(indicesA).length);
console.log('Nombre d\'étudiants avec indices CP:', Object.keys(indicesCP).length);

// Exemple pour un étudiant
const premierDA = Object.keys(indicesA)[0];
if (premierDA) {
  console.log(`Étudiant ${premierDA}:`, indicesA[premierDA]);
}
````

Si un indice ne fonctionne pas, identifie le module source défaillant.