# Consigne suivante — lot 7 du cadrage 11, transversal : la forme (cibles tactiles, contrastes) et les clés nues — EN CONSTRUCTION

> Ouvert par Cowork le 11 septembre 2026 à 17 h 35. Ce fichier accumule, à froid, ce qui revient au lot transversal ; il deviendra une
> consigne du jour quand les lots 3 à 6 seront livrés et vus. Matière de base : `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` § 7
> (58 contrôles sous 44 px à 1024 × 768 ; 12 clés nues), sur maquette validée par Grégoire pour la forme.

## Retours de Grégoire à y inclure (dans l'ordre d'arrivée)

**R-1 (11 sept., 17 h 35, capture) · Le bandeau « MODE ANONYMISATION » : « Afficher DA réels » est presque illisible.** Dans ses mots : *« le contraste de la police
de caractère ne fonctionne pas. C'est presque lisible. Pourrais-tu l'écrire en blanc comme le texte à côté ? »* Mesuré : le bandeau
(`index.html:3995-4004`) est blanc sur bleu foncé (`.bandeau-anonymisation { color: white }`, `index.html:499-511`), mais le
`<label class="bandeau-anonymisation-label">` (`:529-535`) ne fixe pas sa couleur, et quelque chose la lui prend — **cause à mesurer**
(aucune règle `label` générique dans `styles.css` au 11 à 17 h 30 : cherche dans `css/*.css`, dans les `<style>` d'`index.html`, et une
règle sur `input[type=checkbox]` ou `[data-on-change]` ; l'inspecteur WebKit sur l'élément dit d'où vient la couleur calculée). ⮕ Quelle
que soit la cause, le correctif est le même et il est local : `color: inherit` (ou `#fff`) sur `.bandeau-anonymisation-label`, là où
la classe est définie — et un mot sur la cause trouvée, dans le code. Vérifier aussi le mode clair (le bandeau y est-il le même bleu ? `styles.css:24586`
ne parle que de l'impression). Porte : une rangée, mode anonymisation activé, deux modes.


