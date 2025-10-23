Vérifie que l'architecture "Single Source of Truth" est respectée :

1. **Identifie le module SOURCE** pour la donnée concernée
2. **Liste les modules LECTEURS** qui utilisent cette donnée
3. **Confirme** qu'aucun module ne recalcule/duplique la logique

**Principes à vérifier** :
- Les modules ne se parlent JAMAIS directement
- Communication via localStorage uniquement
- Une donnée = UNE source qui la génère et la stocke
- Les autres modules la LISENT via localStorage

**Questions à répondre** :
- Quel module génère/stocke cette donnée ?
- Quels modules la lisent ?
- Y a-t-il duplication de logique ? (si oui, c'est un problème)
- La donnée est-elle dans localStorage avec le bon nom ?

**Exemples de vérification** :

✅ **BON** :
```
calendrierComplet
├── SOURCE : trimestre.js (génère et stocke)
└── LECTEUR : calendrier-vue.js (lit uniquement)
```

❌ **MAUVAIS** :
```
calendrierComplet
├── trimestre.js (génère)
└── calendrier-vue.js (recalcule aussi) ← PROBLÈME : duplication
```