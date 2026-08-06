# Test d'onboarding à froid — persona Cowork (préparé le 6 août 2026)

> **But** : mesurer si un enseignant qui découvre Labo Codex peut configurer son
> trimestre **seul**, en se fiant UNIQUEMENT aux outils d'accompagnement intégrés
> à l'application. Le testeur est une session **Cowork vierge** qui pilote Chrome
> et joue un persona. Le livrable est un **journal de frictions** priorisé, qui
> deviendra le chantier onboarding au BACKLOG.
>
> **Idée directrice** : ce test attrape les impasses, les libellés ambigus et les
> trous d'accompagnement (les bloquants). Il ne remplace PAS un testeur humain —
> une session Claude est plus patiente et plus systématique qu'un enseignant
> pressé de fin août. C'est un filtre AVANT les humains. Rejoué avec la même
> consigne après chaque vague d'améliorations, il devient l'étalon d'onboarding.

---

## 1. Préparation (Grégoire, ~5 min)

1. ⚠ **JAMAIS sur ton profil Chrome habituel** : tes données réelles h2026 y
   vivent (l'app est 100 % locale). Utiliser un **profil Chrome neuf** (Chrome →
   Profils → Ajouter) ou pointer la session sur l'**app déployée publique** dans
   ce profil vierge. Vérifier que l'app s'ouvre à l'état « premier lancement ».
2. Ouvrir une session Cowork **neuve** (aucun contexte projet chargé — pas de
   skills Labo Codex, pas de SESSION.md). C'est essentiel : le test mesure ce
   que l'APP dit, pas ce que Claude sait déjà du projet.
3. Donner à la session le contrôle de Chrome (l'onglet du profil vierge).
4. Coller le bloc §2 ci-dessous TEL QUEL (remplacer seulement `[URL]`).
5. Pendant le test : **ne pas aider**. Si la session te pose une question,
   répondre « fais comme si j'étais absent — note la friction et continue ».

---

## 2. Le prompt à coller dans Cowork (verbatim)

```
Tu vas jouer un rôle, sérieusement et jusqu'au bout.

TON PERSONA — Catherine, 41 ans, enseignante de philosophie au cégep.
Tu donnes « Philosophie et rationalité » (340-101-MQ) à la session
d'automne 2026 : DEUX groupes, le groupe 01 (34 étudiants) et le
groupe 02 (31 étudiants). Chaque groupe a deux séances par semaine :
gr. 01 le lundi 10 h à 11 h 40 et le jeudi 13 h à 14 h 40 (local D-214) ;
gr. 02 le mardi 8 h 30 à 10 h 10 et le vendredi 10 h 30 à 12 h 10
(local D-216). Ta session : les cours commencent le lundi 24 août 2026
et finissent le vendredi 4 décembre 2026 ; le trimestre se termine le
18 décembre ; semaine de lecture du 12 au 16 octobre ; congés : lundi
7 septembre (fête du Travail) et vendredi 13 novembre (journée
pédagogique, reprise de l'horaire du vendredi le mercredi 25 novembre).
Tu es à l'aise avec un ordinateur sans être une experte. Tu n'as JAMAIS
vu cette application. Une collègue t'a seulement dit : « essaie ça, ça
m'aide à suivre mes étudiants ».

TA MISSION — Ouvre [URL] et configure ta session d'automne au complet :
le trimestre et son calendrier, ton cours, tes horaires, ton groupe 01
avec ces cinq premiers étudiants (tu saisiras les autres plus tard) :
Tremblay Léa, Gagnon Nassim, Roy Émile, Bouchard Maude, Sy Aminata.
Tu as RÉUSSI quand l'application affiche un calendrier de session que
tu juges conforme à tes dates (nombre de semaines et de jours de cours
plausibles, tes congés et ta reprise visibles) et que ton groupe est
prêt pour la prise de présences.

TES RÈGLES DE CONDUITE (strictes) :
1. Tu te fies UNIQUEMENT à ce que l'application t'offre à l'écran :
   textes, guides, info-bulles, assistants, messages. Aucune console de
   développement, aucun code source, aucune recherche web, aucune
   connaissance externe sur cette application.
2. Tu te comportes en enseignante réelle : tu lis ce qui est affiché,
   tu essaies, tu te trompes, tu recommences. Tu ne « devines » pas des
   conventions de développeur — si un terme t'échappe, tu cherches
   l'explication DANS l'app d'abord.
3. JOURNAL DE FRICTIONS obligatoire : à CHAQUE hésitation, détour ou
   blocage, tu notes une entrée AVANT de continuer :
   [n°] Écran/moment · Ce que je cherchais à faire · Ce que l'app
   disait (ou ne disait pas) · Ce que j'ai fait · Gravité :
   BLOQUANT (impossible de continuer sans deviner) / RALENTISSEUR
   (j'ai fini par trouver, mais j'ai cherché) / IRRITANT (détail,
   confusion passagère) · Ce que l'app aurait dû dire ou offrir.
4. Si tu es VRAIMENT bloquée plus de quelques minutes sur une étape :
   note la friction en BLOQUANT, décris ce qui te manque, puis et
   seulement alors, débrouille-toi au mieux pour continuer le test.
5. Tu notes aussi les BONS moments : ce qui t'a guidée efficacement
   (les autres frictions se corrigeront en préservant ces forces-là).

TON LIVRABLE FINAL, une fois la mission réussie (ou abandonnée) :
a) Verdict : mission réussie seule ? durée ressentie ? confiance dans
   le résultat (est-ce que Catherine FERAIT CONFIANCE à ce calendrier
   pour sa vraie session) ?
b) Le journal de frictions complet, numéroté.
c) Ton top 5 des améliorations d'accompagnement, par impact décroissant
   sur l'autonomie d'un nouvel utilisateur.
d) Les 3 moments où l'app t'a le mieux guidée.
Commence maintenant.
```

---

## 3. Interprétation des résultats (Grégoire, après le test)

- **Barème indicatif** : 0 bloquant = excellent signal ; 1-2 bloquants =
  chantier ciblé ; 3+ bloquants = l'onboarding passe devant tout le reste.
  Les « ralentisseurs » se traitent par lots ; les « irritants » nourrissent
  le microcopy au fil de l'eau.
- **Biais à garder en tête** : Claude lit TOUT ce qui est à l'écran — un humain
  pressé, non. Un « ralentisseur » pour Claude est souvent un « bloquant » pour
  un humain : durcir d'un cran au triage.
- Les dates du persona contiennent volontairement les cas qui ont fait l'objet
  de correctifs récents (congé avec reprise, semaine de lecture, deux horaires) :
  si le calendrier produit est incohérent, distinguer friction d'ACCOMPAGNEMENT
  (l'app n'a pas guidé) et défaut FONCTIONNEL (l'app a mal calculé) — les deux
  se versent séparément.

## 4. Après le test

1. Coller le livrable (verdict + journal) dans une session Claude Code →
   triage et versement au BACKLOG comme **chantier onboarding** (items
   numérotés, priorité 1 selon la décision du 6 août : autonomie et engagement
   des nouveaux utilisateurs = premier objectif majeur).
2. Archiver le livrable dans `Rapports/` (ex. `TEST-ONBOARDING-2026-08-XX.md`)
   pour servir de point de comparaison au prochain passage.
3. Rejouer ce MÊME document (persona et règles inchangés) après la vague
   d'améliorations — la comparaison des deux journaux mesure le progrès.
