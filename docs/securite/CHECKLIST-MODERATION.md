# Checklist de modération manuelle — partage de ressources

> **Procédure opérationnelle** — 10 juin 2026 (décision D4 : modération
> humaine, Grégoire seul au démarrage). Compagnon de
> `MODELE-CONFIANCE.md` (critères §5.2, gouvernance §5).
>
> **Portée — phase fichiers (pilote)** : il n'y a ni serveur ni dépôt
> central. « Modérer » signifie ici : réagir à un signalement concernant
> un fichier `.lcz` en circulation, et auditer ce qu'on me transmet avant
> de le rediffuser. Le panneau de modération outillé (`js/moderation.js`,
> D4 §5.5) n'existe pas encore — il viendra avec une Voûte centralisée.

---

## A. Auditer un package AVANT de le rediffuser

Quand quelqu'un m'envoie un `.lcz` pour que je le fasse circuler (pilote,
communauté de pratique), je ne le retransmets JAMAIS sans cette passe :

- [ ] **Import dans un profil de test** (pas mon Codex de travail) : le
      package passe la validation, la signature et le TOFU sans alerte.
- [ ] **Statut TOFU cohérent** : si « clé changée », STOP — confirmer avec
      la personne par un autre canal avant toute chose.
- [ ] **Contenu inspecté** (prévisualisation + duplication de test) :
      les 4 critères de `MODELE-CONFIANCE.md` §5.2 —
      pédagogique / légal / technique / éthique.
- [ ] **Aucune donnée personnelle** : pas de nom d'étudiant·e, de DA, de
      groupe réel dans les textes libres (descriptions, commentaires de
      cartouches, contextes).
- [ ] **Attribution saine** : l'auteur du manifeste est plausible, la
      chaîne d'attribution ne réclame pas le travail d'autrui.
- [ ] Décision notée au journal (§D).

## B. Traiter un signalement

Quelqu'un me signale un package problématique (courriel
labo@codexnumeris.org) :

- [ ] **Accuser réception** sous 48 h ; demander le fichier `.lcz` exact
      et la description du problème.
- [ ] **Reproduire** : importer dans un profil de test, constater le
      problème (technique ? contenu ? attribution ?).
- [ ] **Qualifier** selon les 4 critères (§5.2) :
      - défaut technique → bug Labo Codex ? ouvrir SUIVI-BUGS, pas de
        modération ;
      - contenu inapproprié / plagiat / données personnelles → continuer ;
      - désaccord pédagogique légitime → PAS un cas de modération
        (pluralisme des pratiques — répondre et clore).
- [ ] **Entendre l'auteur** avant décision (sauf urgence : données
      personnelles d'étudiant·es exposées → agir d'abord, expliquer
      ensuite).
- [ ] **Décider et notifier** les deux parties, avec motifs.

## C. Révoquer une ressource problématique (actions possibles sans serveur)

Dans l'ordre, selon la gravité :

- [ ] **Demander à l'auteur** de cesser la diffusion et de corriger
      (cas de bonne foi — le plus fréquent).
- [ ] **Aviser les personnes connues** l'ayant reçue (liste du pilote) :
      retirer le package (Réglages › Données › Retirer) et supprimer les
      copies dupliquées le cas échéant.
- [ ] **Retirer ma confiance TOFU** envers la clé fautive
      (`trustTofu.oublierAuteur('<nom>')` en console) et recommander aux
      personnes touchées d'en faire autant — tout nouvel envoi de cette
      personne redeviendra « premier contact », à vérifier hors bande.
- [ ] **Exclure du pilote** (cas grave ou récidive) : la personne ne
      reçoit plus les fichiers du groupe. Sans serveur, il n'existe AUCUN
      moyen technique d'empêcher deux tiers de s'échanger des fichiers —
      le dire honnêtement aux personnes touchées.
- [ ] **Données personnelles exposées** : exiger la destruction des
      copies, documenter l'incident (date, étendue, personnes avisées) —
      réflexe registre d'incidents, utile si un cadre institutionnel
      (Loi 25) s'applique un jour au projet.

## D. Journal de modération

Tenir une trace de CHAQUE décision (audit trail demandé par D4 §5.5) dans
`Retours des testeurs/JOURNAL-MODERATION.md` (à créer au premier cas) :

```
## AAAA-MM-JJ — <résumé en une ligne>
- Package : <nom de fichier / item principal / auteur déclaré>
- Source : <audit préventif §A | signalement §B (par qui)>
- Constat : <faits observés, pas d'interprétation>
- Décision : <accepté / corrigé / révoqué / hors modération> + motifs (critères §5.2)
- Actions : <qui a été avisé, ce qui a été retiré>
- Appel : <oui/non, issue>
```

## E. Garde-fous personnels

- Une décision de modération par séance — pas de traitement en lot sous
  fatigue ; en cas de doute, dormir dessus (rien n'est urgent sauf §C
  données personnelles).
- Je ne modère pas mes propres packages : si un de MES fichiers est
  signalé, je le traite comme auteur (corriger/retirer), pas comme
  modérateur, et je le note au journal.
- Si le volume dépasse ~5 cas/mois, déclencher la délégation
  (`MODELE-CONFIANCE.md` §5.5) au lieu d'absorber.

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-06-10 | Création (D4, action « checklist de modération manuelle » du jalon pilote). Version phase fichiers — à réviser avec l'éventuelle Voûte centralisée (panneau outillé, procédure formelle). |
