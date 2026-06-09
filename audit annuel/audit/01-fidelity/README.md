# Axe 1 — Conformité pédagogique (fidelity of implementation)

**Priorité 1.** **Temps total estimé : 8 h 30.** **À segmenter en demi-journées.**

---

## Pourquoi cet axe en premier (après la santé du code)

Labo Codex n'est pas un logiciel générique. C'est l'implémentation d'un cadre pédagogique spécifique (taxonomie SOLO, système IDME, indices A-C-P, modèle RàI, pratiques alternatives de notation). La **fidelity of implementation** (Penuel & Means 2004, O'Donnell 2008) est ce qui sépare un outil pédagogique légitime d'un outil qui *prétend* implémenter un cadre théorique sans le faire.

Pour la présentation à l'AQPC et pour les institutions garantes, c'est le seul axe qui dit : « Le code fait ce qu'il dit qu'il fait. » Tout le reste (sécurité, architecture, accessibilité) est nécessaire mais secondaire.

---

## Concepts pédagogiques à tracer

Liste de référence (à compléter par Grégoire si manque) :

| Concept | Définition canonique | Référence théorique |
|---|---|---|
| **IDME** | Échelle à 4 niveaux : Incomplet (< 0,65), Développement (0,65-0,74), Maîtrisé (0,75-0,84), Étendu (≥ 0,85). Seuil de maîtrise = 0,75. | Alignement SOLO (Biggs & Collis 1982). |
| **A-C-P** | Trois indices comportementaux : Assiduité (présence), Complétion (remise des artefacts), Performance (moyenne normalisée des 3 derniers artefacts). Fenêtre glissante = 3 artefacts. | Approche RàI + monitorage pédagogique. |
| **RàI** | Modèle Réponse à l'Intervention à 3 niveaux. Déclenché par l'indice de persistance (IPB). | Vaughn & Fuchs (2003), bibliographie RàI. |
| **Indice de blocage** | Indice composite : 0,35 × Structure + 0,35 × Français + 0,30 × Rigueur. Seuil critique = 0,60. | Cadre interne Labo Codex. |
| **Pratiques de notation** | 4 familles : Sommative, PAN-Standards (la pratique de Grégoire), PAN-Spécifications, PAN-Dénotation (non implémentée). | Pratiques alternatives de notation (Talbert, Voisard). |
| **Vocabulaire descriptif** | Trois termes pour la trajectoire S-R-F : « difficulté émergente », « plateau », « difficulté persistante ». Vocabulaire descriptif, non-alarmiste, non-prédictif. | Choix de conception pédagogique. |
| **SOLO** | Cinq niveaux : Préstructurel (0,00), Unistructurel (0,01-0,64), Multistructurel (0,65-0,74), Relationnel (0,75-0,84), Abstrait étendu (0,85-1,00). | Biggs & Collis (1982). |

---

## Trois sous-audits

### 1.1 — Traçabilité concept → implémentation (3 h)

**Fichier de travail** : `traceability-template.csv`.

**Méthode** :
1. Claude Code exécute :
   ```bash
   grep -rEn "0\.75|0\.65|0\.85|0\.60|0\.35|0\.30|IDME|RaI|RàI|SOLO|A-C-P|blocage|seuil" js/ > audit/01-fidelity/grep-raw.txt
   ```
2. Claude Code lit `grep-raw.txt` et tente de pré-remplir la colonne « Fichier:fonction » de la matrice pour chaque concept.
3. Grégoire revoit ligne par ligne et valide / corrige.
4. Pour chaque concept, Grégoire détermine le statut :
   - **Vert** : exactement une fonction implémente le concept, conforme à sa définition canonique.
   - **Jaune** : le concept est implémenté correctement mais à plusieurs endroits (duplication de vérité — à consolider).
   - **Rouge** : le concept est implémenté de manière non conforme à sa définition, ou n'existe pas dans le code.

**Critère d'arrêt** : si ≥ 2 concepts sont en rouge, **suspendre l'audit et corriger** avant de continuer. Un rapport AQPC sur un code non conforme à son propre cadre théorique serait à la fois inutile et contre-productif.

**Livrable** : `audit/reports/01-1-traceability.md` + matrice CSV complétée.

---

### 1.2 — Validation numérique des calculs (4 h)

**Fichier de travail** : `calculations-tests.md`.

**Méthode** : pour chaque formule revendiquée, construire 5-10 cas-tests numériques (cas standards + cas limites), prédire la sortie selon la définition théorique, exécuter le code, comparer.

**Pas besoin de framework de test.** Approche minimale :

1. Créer `audit/01-fidelity/run-tests.html` :
   ```html
   <!DOCTYPE html>
   <html>
   <head><meta charset="utf-8"><title>Tests de fidélité Labo Codex</title></head>
   <body>
   <pre id="results">Exécution...</pre>
   <script type="module">
   // Importer les modules à tester
   import { calculerIDME, calculerBlocage, /* etc. */ } from '../../js/<module>.js';

   const results = [];
   function test(name, expected, actual, tolerance = 0.001) {
     const pass = Math.abs(expected - actual) <= tolerance;
     results.push(`${pass ? '✓' : '✗'} ${name}: attendu=${expected}, obtenu=${actual}`);
   }

   // Cas-tests à remplir
   test('IDME seuil maîtrise', 0.75, /* appel à la fonction */);
   // ...

   document.getElementById('results').textContent = results.join('\n');
   </script>
   </body>
   </html>
   ```

2. Ouvrir le fichier dans un navigateur via un serveur local (`npx http-server` ou similaire), regarder la sortie.

3. **Pour chaque écart entre prédit et observé** : documenter dans le livrable.

**Cas-tests minimaux à remplir** (Grégoire complète) :

#### Indice de blocage = 0,35 × S + 0,35 × F + 0,30 × R

| Cas | S | F | R | Attendu | Observé | Écart | Conclusion |
|---|---|---|---|---|---|---|---|
| Standard haut | 0,80 | 0,80 | 0,80 | 0,80 | ? | ? | ? |
| Standard bas | 0,50 | 0,50 | 0,50 | 0,50 | ? | ? | ? |
| Seuil critique (= 0,60) | 0,60 | 0,60 | 0,60 | 0,60 | ? | ? | ? |
| Asymétrique S élevé | 1,00 | 0,40 | 0,40 | 0,62 | ? | ? | ? |
| Asymétrique F élevé | 0,40 | 1,00 | 0,40 | 0,62 | ? | ? | ? |
| Asymétrique R élevé | 0,40 | 0,40 | 1,00 | 0,60 | ? | ? | ? |
| Limite basse | 0,00 | 0,00 | 0,00 | 0,00 | ? | ? | ? |
| Limite haute | 1,00 | 1,00 | 1,00 | 1,00 | ? | ? | ? |

#### Seuils IDME

| Cas | Valeur normalisée | Niveau attendu | Niveau observé |
|---|---|---|---|
| Limite inférieure I | 0,00 | Incomplet | ? |
| Limite supérieure I | 0,64 | Incomplet | ? |
| Limite inférieure D | 0,65 | Développement | ? |
| Seuil maîtrise (limite D/M) | 0,749 | Développement | ? |
| Seuil maîtrise atteint | 0,75 | Maîtrisé | ? |
| Limite inférieure E | 0,85 | Étendu | ? |
| Limite haute | 1,00 | Étendu | ? |

#### Indices A-C-P (fenêtre glissante 3 artefacts)

À définir selon l'implémentation. Cas-tests à ajouter par Grégoire.

#### Niveaux SOLO

Mêmes cas-tests que IDME, vérifier que la conversion IDME ↔ SOLO est correcte.

**Livrable** : `audit/reports/01-2-calculations.md` avec tous les tableaux remplis et conclusion globale.

---

### 1.3 — Cohérence terminologique (1 h 30)

**Fichier de travail** : `lexicon-check.md`.

**Méthode** :

1. Claude Code exécute :
   ```bash
   # Recherche du vocabulaire descriptif revendiqué
   grep -rEni "difficulté émergente|plateau|difficulté persistante" --include="*.js" --include="*.html" --include="*.css" .

   # Recherche du vocabulaire alarmiste à éviter
   grep -rEni "échec|fail|faible|insuffisant|weak|bad|alerte|alarme|danger|warning|critique" --include="*.js" --include="*.html" .

   # Recherche du vocabulaire prédictif à éviter (sauf justification documentée)
   grep -rEni "prédire|prediction|risque|sera|aura|future|projection" --include="*.js" --include="*.html" .
   ```

2. Classer les occurrences trouvées par contexte :
   - **UI affichée** à l'élève ou à l'enseignant (rouge si vocabulaire alarmiste/prédictif).
   - **Commentaire de code** uniquement (acceptable, signaler sans pénaliser).
   - **Nom de variable** ou de fonction (jaune, à reformuler à terme).

3. Pour chaque occurrence dans l'UI, vérifier le contexte d'affichage et juger si le vocabulaire est conforme au cadre pédagogique non-alarmiste.

**Seuils** :
- Vert : aucune occurrence de vocabulaire alarmiste dans l'UI affichée.
- Jaune : ≤ 3 occurrences dans l'UI, contextuellement justifiables (ex. : message d'erreur technique).
- Rouge : ≥ 1 occurrence non justifiée dans un affichage destiné à l'élève.

**Livrable** : `audit/reports/01-3-lexicon.md`.

---

## Critère d'arrêt global (axe 1)

Si l'un des sous-audits passe au rouge :
1. Suspendre l'audit en cours.
2. Documenter le problème dans `audit/reports/CRITICAL-<date>.md`.
3. Discussion avec Grégoire : corriger d'abord, ou repenser la communication AQPC.
4. Ne pas continuer les axes 2-6 avant résolution.

C'est exigeant. C'est délibéré.
