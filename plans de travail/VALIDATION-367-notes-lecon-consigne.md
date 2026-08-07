# Validation terrain — #367, migration des notes de leçon

> **7 août 2026.** À faire sur le Mac, sur les données réelles de Grégoire,
> AVANT de pousser `main`. C'est le seul chantier de la journée qui migre des
> données existantes.
>
> **La migration se déclenche au PREMIER démarrage** de la version 1.50.0+.
> L'étape 1 doit donc se faire avant de charger la nouvelle version.

---

## Ce que la migration fait

La clé `planification_seances` (Objectif et Notes des vues leçon) n'avait
jamais été namespacée : les notes étaient partagées entre **tous** les
trimestres, et la démo y écrivait aussi. Son dictionnaire était en plus **plat**
par id de leçon, alors que ces ids sont uniques *par carte* seulement.

Au premier démarrage, l'application :

1. **archive** la clé nue dans `planification_seances_archive_pre367` ;
2. **répartit** chaque note dans la carte qui possède cette leçon, sous une clé
   `<carteId>::<leconId>`, et ce dans **tous** les trimestres ;
3. **purge** la clé nue ;
4. pose un drapeau pour ne jamais rejouer.

**Promesse à vérifier** : *chaque carte garde exactement ce qu'elle affichait.*
La migration fige l'état visible — elle ne propage rien de neuf, ne retire rien.

---

## 1. AVANT de charger la nouvelle version (~5 min)

- [ ] **Backup Codex** (Données → Enregistrer le codex). Non négociable.
- [ ] Sur la version **actuelle**, console, noter le chiffre :

```js
(function(){var n=db.getSync('planification_seances',{})||{};var k=Object.keys(n);
console.log('AVANT — '+k.length+' notes dans la clé nue');console.log(k.slice(0,15));})();
```

Note ce nombre : `________`

- [ ] Repérer **2 ou 3 leçons dont tu SAIS qu'elles ont des notes ou des étapes
      remplies** (Conception → Organisateur). Écris leurs titres — ce sont tes
      témoins.
- [ ] Repérer **1 leçon dont tu sais qu'elle n'a RIEN**. Témoin inverse.

---

## 2. Charger la nouvelle version

- [ ] Pull de la branche `claude/pedagogical-alignment-planner-y7eppc`.
- [ ] Recharge dure (⇧⌘R). Version affichée : **1.51.0**.

---

## 3. Contrôles console (~5 min, lecture seule)

### 3.1 La migration a bien eu lieu

```js
console.log('drapeau :', db.getSync('migration_planification_seances_done', false),
  '| archive :', Object.keys(db.getSync('planification_seances_archive_pre367', {})).length, 'notes',
  '| clé nue restante :', Object.keys(db.getSync('planification_seances', {})).length, '(attendu 0)');
```

**Attendu** : drapeau `true`, archive = le chiffre noté à l'étape 1, clé nue à 0.

### 3.2 Répartition par trimestre

```js
(function(){(db.getSync('trimestres',[])||[]).forEach(function(t){
var n=db.getSync(t.id+'_planification_seances',{})||{};
console.log(t.id+' : '+Object.keys(n).length+' notes');});})();
```

**Attendu** : des chiffres non nuls sur les trimestres qui ont des cartes.

### 3.3 ⭐ LE contrôle : aucune note perdue

```js
(function(){
  var arch = db.getSync('planification_seances_archive_pre367', {}) || {};
  var replacees = {};
  (db.getSync('trimestres', []) || []).forEach(function(t){
    var n = db.getSync(t.id + '_planification_seances', {}) || {};
    Object.keys(n).forEach(function(k){ var lid = k.split('::')[1]; if (lid) replacees[lid] = true; });
  });
  var orphelines = Object.keys(arch).filter(function(lid){ return !replacees[lid]; });
  console.log('archivées : ' + Object.keys(arch).length);
  console.log('replacées  : ' + (Object.keys(arch).length - orphelines.length));
  console.log('orphelines : ' + orphelines.length + ' (leçon absente de TOUTE carte)', orphelines);
})();
```

**Attendu** : `archivées = replacées + orphelines`, et les orphelines
correspondent à des leçons réellement supprimées par le passé. Si une orpheline
te surprend, **ne répare rien** — note son id et signale-le.

---

## 4. Contrôle visuel — le seul qui prouve (~10 min)

- [ ] **Tes témoins « avec notes »** : Conception → Organisateur, ouvre chacun.
      Ses notes et ses étapes doivent être là, **identiques**.
- [ ] **Ton témoin « sans notes »** : il ne doit **rien** avoir hérité.
- [ ] Refaire dans **H2026 ET A2026** — c'est justement le mélange entre
      trimestres qu'on retire.

⚠ Un témoin vide qui affiche soudain des notes, ou un témoin plein qui les perd,
est un **✗ bloquant**. Note-le, ne répare pas, signale.

---

## 5. Le comportement NEUF (~5 min)

### 5.1 Deux cartes ne se mélangent plus

*Si un trimestre a au moins deux cartes* :

- [ ] Carte A : écris une note sur une leçon (Organisateur).
- [ ] Carte B : ouvre une leçon. **La note ne doit PAS y apparaître.**

C'est le cœur du correctif. Avant, elle pouvait apparaître.

### 5.2 La démo n'écrit plus chez toi

- [ ] Active le mode démo, écris une note sur une leçon de démo.
- [ ] Reviens en réel : **tes notes n'ont pas bougé.**

### 5.3 Supprimer une leçon efface ses notes

- [ ] Crée une leçon jetable « TEST-note », écris-lui une note.
- [ ] Supprime-la. Crée une nouvelle leçon.
- [ ] **Elle ne doit hériter d'aucune note.** Supprime-la aussi.

---

## 6. Si quelque chose cloche

**Rien n'est perdu** : l'archive contient l'intégralité de la clé nue d'origine,
et ton backup Codex est le filet complet.

Pour **rejouer** la migration depuis l'archive (idempotent — n'écrase aucune
note déjà en place) :

```js
db.setSync('planification_seances', db.getSync('planification_seances_archive_pre367', {}));
db.setSync('migration_planification_seances_done', false);
// puis ⇧⌘R
```

Pour **tout annuler** : réimporte ton backup Codex.

---

## 7. Grille de résultats

| Contrôle | ✓ / ✗ | Note |
|---|---|---|
| 3.1 drapeau + archive + nue à 0 | | |
| 3.2 répartition par trimestre | | |
| 3.3 aucune note perdue | | |
| 4 témoins « avec notes » (H2026) | | |
| 4 témoins « avec notes » (A2026) | | |
| 4 témoin « sans notes » | | |
| 5.1 deux cartes ne se mélangent plus | | |
| 5.2 démo isolée | | |
| 5.3 suppression purge la note | | |

---

## 8. Après la passe

- **Tout ✓** → je pousse `main` (1.50.0 + 1.51.0) et je ferme **#409** en
  retirant l'archive `planification_seances_archive_pre367` du stockage et le
  code d'archivage de `main.js`.
- **Un ✗** → on corrige avant tout déploiement. L'archive reste en place tant
  que la validation n'est pas franche.
