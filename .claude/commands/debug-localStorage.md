Affiche l'état actuel du localStorage et diagnostique les problèmes :
```javascript
// Exécute ce code dans la console et rapporte les résultats
console.log('=== DIAGNOSTIC localStorage ===');

const cles = [
  'calendrierComplet',
  'indicesAssiduiteDetailles', 
  'indicesCP',
  'seancesCompletes',
  'listeEtudiants',
  'modalitesEvaluation'
];

cles.forEach(cle => {
  const existe = !!localStorage.getItem(cle);
  console.log(`${cle}: ${existe ? '✅ Existe' : '❌ Absent'}`);
  
  if (existe) {
    try {
      const data = JSON.parse(localStorage.getItem(cle));
      console.log(`  → Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      console.log(`  → Taille: ${JSON.stringify(data).length} caractères`);
      if (Array.isArray(data)) {
        console.log(`  → Éléments: ${data.length}`);
      } else if (typeof data === 'object') {
        console.log(`  → Clés: ${Object.keys(data).length}`);
      }
    } catch(e) {
      console.log(`  → ⚠️ Erreur parsing: ${e.message}`);
    }
  }
});

console.log('=== FIN DIAGNOSTIC ===');
```

Ensuite, analyse les résultats et suggère les corrections nécessaires.

**Problèmes courants à détecter** :
- Données manquantes (clé absente)
- Données corrompues (erreur de parsing)
- Format inattendu (Array au lieu d'Object, etc.)
- Taille anormale (trop petit = incomplet, trop gros = possiblement corrompu)