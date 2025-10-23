Tu dois fournir UNIQUEMENT un patch minimal avec :

1. Les lignes exactes à modifier (avec numéros de ligne si possible)
2. Aucun renommage d'éléments existants
3. Respect strict du style de code existant  
4. Commentaires expliquant les changements critiques

**Format de réponse attendu** :
```diff
Fichier : js/nom-module.js
@@ ligne_debut,nb_lignes @@
- code à remplacer
+ nouveau code
```

**Contraintes critiques** :
- ❌ Ne jamais modifier config.js ou navigation.js (sauf commentaires)
- ❌ Ne jamais renommer les éléments dans noms_stables.json
- ❌ Ne jamais modifier hors des zones `<!-- LLM:OK_TO_EDIT -->`
- ✅ Toujours préfixer les fonctions par leur contexte (éviter conflits)
- ✅ Utiliser les classes CSS existantes (.item-carte, .statut-badge, etc.)