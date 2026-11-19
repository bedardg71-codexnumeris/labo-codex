# Porte terrain iPad : dessiner au doigt

Lot `lot/dessiner-au-doigt`, 19 nov. 2026 (#1288). Relais du Projet, 18 nov., 18 h 50.
PR d'aperçu n° 32 (non fusionnée).

**État : poussée le 19 nov., à passer.** L'artefact jumeau (cases, « Copier mes résultats ») est publié par Cowork.
**Quatre gestes**, l'iPad couché, le crayon à portée, cinq minutes. Aucune décision à prendre ici.

Pourquoi une porte : le banc juge la décision (quel outil, quel doigt, quel délai, quel mode) et rejoue de vrais gestes
tactiles sous Chromium ; il n'a ni Safari tactile ni crayon. Le doigt, la paume et le crayon réels, seulement ici.

Rien n'écrit dans tes trimestres : l'aperçu a son propre espace. Ouvre une copie d'essai de la démo.

---

## §0 · Préalable

- [ ] **0.1** Dans Safari, ouvre `https://deploy-preview-32--codexnumeris-051225.netlify.app`, recharge, et lis le
  numéro au pied de l'accueil.
  ⮕ Attendu : 1.249.0, build 1117-0611 ou plus récent. Un autre numéro : arrête-toi là.
  `iPad`
- [ ] **0.2** Ouvre une copie en Annoter. Dans la palette Annotation, sous « Épaisseur », regarde l'interrupteur
  « Dessiner au doigt ».
  ⮕ Attendu : il est là, éteint. Absent : arrête-toi là (l'aperçu n'est pas le bon).
  `iPad`

---

## §1 · Données

Rien.

---

## §2 · Interface — un geste par ligne (iPad couché)

- [ ] **2.1** Interrupteur éteint, choisis le Surligneur et glisse un doigt sur la copie.
  ⮕ Attendu : rien ne se trace, comme avant. (Sur la copie, un doigt seul ne défile pas non plus : c'est le
  comportement d'avant ce lot, mesuré au banc ; hors de la copie, il défile.)
  `iPad`
- [ ] **2.2** Allume « Dessiner au doigt » et glisse un doigt sur la copie, Surligneur choisi.
  ⮕ Attendu : le surligneur trace sous le doigt et le trait reste au relâcher. Avant : rien ne se traçait sans crayon.
  `iPad`
- [ ] **2.3** Toujours allumé, glisse deux doigts sur la copie, puis pince.
  ⮕ Attendu : la page défile, puis zoome ; aucun trait ne reste.
  `iPad`
- [ ] **2.4** Toujours allumé, écris au crayon une ligne, la paume posée sur l'écran comme d'habitude.
  ⮕ Attendu : le crayon trace ; la paume ne laisse aucune marque.
  `iPad`

---

## §3 · Décisions

Rien à trancher ici. Les mots (« Dessiner au doigt », et sous l'interrupteur, dans la version étendue : « Deux doigts
déplacent toujours la page. ») partent tels quels et restent corrigeables.

---

## §4 · Ce que je n'ai pas pu vérifier

- Le banc WebKit : ce conteneur n'a pas WebKit. La spec `annotation-dessiner-au-doigt.spec.js` y passe au Mac, avec
  des événements fabriqués (sans CDP) ; non jugée ici.
- Le geste réel sous Safari tactile (pointercancel, pincement natif), et le crayon réel : les gestes 2.2 à 2.4.
