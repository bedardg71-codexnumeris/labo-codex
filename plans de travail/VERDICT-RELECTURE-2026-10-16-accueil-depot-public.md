# Verdict de relecture – l'accueil du dépôt public (5cb01273, becfc977)

> Cowork, 16 octobre 2026, 11 h 35 (Toronto). Demande : `DEMANDE-RELECTURE-2026-10-16-accueil-depot-public.md`.

## Ce qui est vérifié

- `LICENSE` : 661 lignes, 34 523 octets, SHA-256 `0d96a4ff…abcb0` ; commence par « GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007 » et finit sur le renvoi à gnu.org : le texte de la FSF, tel quel.
- `README.md` : les liens mènent à `labo-codex` ; la branche d'audit est dite non publiée ; les tests renvoient à Vitest, puis à la suite complète.
- `LICENSE.md` : le titre de la section 2 dit BY-NC-SA ; l'historique garde « BY-SA » aux dates où c'était vrai (accord) ; `libs/` sous ses propres licences.
- PDF de l'arbre : 3 (le calendrier scolaire du collège, la fiche projet et le résumé d'une page) ; aucun article de tiers.

## À corriger avant le poussé

1. **Les icônes d'Icons8 ne peuvent pas prendre nos licences.** L'arbre porte 87 fichiers `icons8-*` : 68 dans `icons/` (rangé sous AGPL v3 par le tableau) et 19 dans `autocollants/` (rangé sous CC BY-NC-SA). Ils restent sous la licence d'Icons8. Ajoute-les à la phrase sur les documents de tiers, ou en ligne propre du tableau. Issue : corriger maintenant, puisque c'est le tableau de ce lot.
2. **Le dossier `Logo/`** : décision de Grégoire (identité visuelle, engagement public). Recommandation de Cowork : « tous droits réservés » pour les logos et les noms Labo Codex et Codex Numeris, où qu'ils se trouvent ; `autocollants/` (hors Icons8) reste sous CC BY-NC-SA. Réponse de Grégoire, 11 h 37 : **oui**, « tous droits réservés » pour les logos et les noms Labo Codex et Codex Numeris, où qu'ils se trouvent ; `autocollants/` (hors Icons8) reste sous CC BY-NC-SA. Écris-le dans `LICENSE.md` (tableau et section concernée) et dans le README s'il parle de la licence des images.

## Trouvaille hors du lot – inscrire et continuer

- La licence gratuite d'Icons8 demande, à ma connaissance, un lien d'attribution vers icons8.com là où les icônes sont montrées ; je n'en trouve pas dans `index.html` (inférence, non vérifiée dans l'aide ni le pied de page). À inscrire au backlog avec cette réserve ; ne bloque pas le passage en public, puisque l'application les montre déjà.

## Verdict

Accord pour le poussé une fois les points 1 et 2 faits, avec un commit de correction relu d'un coup d'œil par Cowork.

## Coup d'œil sur la correction 4ca2ac67 (11 h 41)

Accord pour le poussé. Les deux points sont faits comme demandé ; le tableau et les trois règles de tête se lisent sans contradiction. Correction de Cowork, à son propre verdict : le lien d'attribution vers icons8.com existe bien dans l'À propos ; la trouvaille (#1089) porte désormais sur sa suffisance, pas sur son absence. La phrase retirée par Claude Code (obligation de changer de nom et de logo pour une version modifiée) reste dehors : elle irait au-delà de la décision de Grégoire.
