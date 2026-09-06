/**
 * SENTINELLE #768 — LA BARRE DU COMPTEUR DE LA SAISIE GARDE « RAPPORT », ET « ANNULER » MÈNE QUELQUE PART.
 *
 * Audit des sous-onglets de Suivi, 6 septembre 2026, CM-2. `restaurerCompteurPresences` (js/saisie-presences.js:2007)
 * reconstruit toute la barre au premier rendu d'une grille : sans le bouton « Rapport » de index.html:8003 (la modale
 * du PDF devenait inatteignable), et avec un « Annuler » qui visait `suivi-apercu-legacy` — une sous-section absente
 * de config.js → `afficherSousSection` désactivait tout et ne réactivait rien : Suivi vide (sonde WebKit, sonde 3).
 *
 * Mesure : la barre reconstruite par la fonction réelle porte les trois boutons de la barre statique d'index.html,
 * et la cible d'« Annuler » est un id que config.js déclare pour `suivi`. Cible retenue : `suivi-liste`, la même que
 * la barre statique (index.html:8005) — une seule destination pour le même mot.
 *
 * Break-test attendu : remettre `suivi-apercu-legacy` → le cas 2 rougit ; retirer le bouton Rapport → le cas 1 rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

function barre() {
    const b = monter(storeBase(), { modules: [{ chemin: 'js/saisie-presences.js', internes: ['restaurerCompteurPresences'] }] });
    b.interne['saisie-presences.js'].restaurerCompteurPresences();
    return b.document.getElementById('compteur-presences').innerHTML;
}
const sousSectionsSuivi = () => {
    const config = readFileSync(path.join(RACINE, 'js/config.js'), 'utf8');
    const bloc = config.match(/'suivi':\s*\[([\s\S]*?)\]/)[1];
    return [...bloc.matchAll(/id:\s*'([^']+)'/g)].map(m => 'suivi-' + m[1]);
};

describe('#768 · barre du compteur de la saisie', () => {
    it('la barre reconstruite porte « Rapport », « Enregistrer » et « Annuler », comme la barre statique', () => {
        const html = barre();
        const index = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        for (const action of ['ouvrirModaleRapportPresences', 'enregistrerPresences', 'afficherSousSection']) {
            expect(html).toContain('data-action="' + action + '"');
            expect(index).toContain('data-action="' + action + '"');
        }
    });

    it('« Annuler » vise une sous-section que config.js déclare (suivi-liste)', () => {
        const html = barre();
        const cible = (html.match(/data-action="afficherSousSection" data-param="([^"]+)"/) || [])[1];
        const valides = sousSectionsSuivi();
        expect(valides).toEqual(['suivi-groupe', 'suivi-liste', 'suivi-saisie', 'suivi-profil', 'suivi-interventions', 'suivi-animation']);
        expect(cible).toBe('suivi-liste');
        expect(valides).toContain(cible);
    });
});
