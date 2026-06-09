# Tests manuels d'accessibilité

**À exécuter par Grégoire.** Temps estimé : 2 h.

---

## Préparation

- Mac et iPad chargés et connectés au même réseau.
- Labo Codex servi localement (`npx http-server -p 8080`).
- Sur Mac : navigateur Safari ou Chrome ; activer VoiceOver (Cmd+F5).
- Sur iPad : Safari ; activer VoiceOver dans Réglages > Accessibilité.

---

## Parcours à tester

(À adapter selon les fonctionnalités réelles de Labo Codex — Grégoire complète.)

### Parcours 1 : Créer un nouvel élève

| Étape | Au clavier | Focus visible ? | VoiceOver lisible ? | Notes |
|---|---|---|---|---|
| Ouvrir le formulaire | Tab... | | | |
| Saisir nom | | | | |
| Saisir groupe | | | | |
| Valider | Entrée | | | |
| Retour au tableau | Échap | | | |

**Statut** : __

### Parcours 2 : Ajouter une évaluation d'artefact

| Étape | Au clavier | Focus visible ? | VoiceOver lisible ? | Notes |
|---|---|---|---|---|
| | | | | |

**Statut** : __

### Parcours 3 : Consulter le profil d'un élève

| Étape | Au clavier | Focus visible ? | VoiceOver lisible ? | Notes |
|---|---|---|---|---|
| | | | | |

**Statut** : __

### Parcours 4 : Déclencher une intervention RàI

| Étape | Au clavier | Focus visible ? | VoiceOver lisible ? | Notes |
|---|---|---|---|---|
| | | | | |

**Statut** : __

### Parcours 5 : Exporter les données

| Étape | Au clavier | Focus visible ? | VoiceOver lisible ? | Notes |
|---|---|---|---|---|
| | | | | |

**Statut** : __

---

## Vérifications globales

- [ ] Focus visible sur tous les éléments interactifs (jamais `outline: none` sans alternative).
- [ ] Ordre de tabulation logique (correspond à l'ordre visuel de la page).
- [ ] Échappement possible des modales / menus (Échap).
- [ ] Messages d'erreur annoncés par les lecteurs d'écran (utiliser `role="alert"` ou `aria-live`).
- [ ] Contraste de couleur suffisant (au moins 4.5:1 pour texte normal, 3:1 pour texte large).
- [ ] Pas d'information transmise uniquement par la couleur (toujours doubler par texte ou icône).
- [ ] Animations désactivables (`prefers-reduced-motion` respecté).
- [ ] Zoom à 200 % fonctionnel sans perte de contenu.

---

## Synthèse

Nombre de parcours en vert : __ / 5.
Nombre de vérifications globales en vert : __ / 8.

**Statut global** : __
