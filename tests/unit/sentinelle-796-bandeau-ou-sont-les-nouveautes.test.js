/**
 * SENTINELLE #796 — LE BANDEAU DE VERSION ENVOIE OÙ LES NOUVEAUTÉS SONT VRAIMENT.
 *
 * Rapport testeur du 9 septembre 2026 : « Les nouveautés ne sont pas indiquées
 * dans Réglages - À propos, mais dans Nouveautés dans la page d'accueil. »
 * Mesuré : la section `#reglages-a-propos` d'`index.html` ne contient ni
 * changelog ni mention des nouveautés (identité, licences, contact) ; le
 * changelog vit dans `#changelog-contenu`, à l'intérieur de la modale
 * `#modalNouveautes`, ouverte par la carte `afficherModalNouveautes` du bas de
 * l'accueil. Le bandeau envoyait donc vers une page où il n'y a rien à lire.
 *
 * Break-test attendu : remettre « Réglages › À propos » dans le texte du
 * bandeau → l'essai 1 rougit ; déplacer `#changelog-contenu` hors de la modale
 * → l'essai 2 rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');

describe('#796 · où le bandeau dit-il de trouver les nouveautés', () => {
    const initInline = lire('js/init-inline.js');
    const index = lire('index.html');

    it('le bandeau MÈNE à la modale Nouveautés (#801), et ne nomme plus « Réglages › À propos »', () => {
        const m = /elTexte\.textContent = distant\s*\n\s*\?([^;]*);/.exec(initInline);
        expect(m, 'texte du bandeau introuvable').toBeTruthy();
        const textes = m[1];
        expect(textes.length, 'les deux textes du bandeau').toBeGreaterThan(40);
        expect(textes).not.toMatch(/À propos/);
        // #801 (13 sept.) : la phrase qui nommait la carte « Nouveautés » est
        // remplacée par un bouton qui ouvre la modale — l'endroit où elles sont.
        const bandeau = index.split('id="bandeau-mise-a-jour"')[1].split('<!-- MODAL NOUVEAUTÉS')[0];
        expect(bandeau).toContain('data-action="afficherModalNouveautes"');
    });

    it('le changelog est bien dans la modale Nouveautés, pas dans À propos', () => {
        const iModale = index.indexOf('id="modalNouveautes"');
        const iChangelog = index.indexOf('id="changelog-contenu"');
        expect(iModale).toBeGreaterThan(-1);
        expect(iChangelog).toBeGreaterThan(iModale);
        // Et la modale se referme avant la section Réglages › À propos.
        const iAPropos = index.indexOf('id="reglages-a-propos"');
        expect(iChangelog).toBeLessThan(iAPropos);
        const sectionAPropos = index.slice(iAPropos, index.indexOf('</div><!-- fin', iAPropos));
        expect(sectionAPropos).not.toContain('changelog');
    });

    it('la carte de l\'accueil ouvre bien cette modale', () => {
        const accueil = lire('js/accueil.js');
        expect(suitDansLaFonction(accueil, /data-action="afficherModalNouveautes"/, /Nouveaut/), "data-action=\"afficherModalNouveautes\"[\\s\\S]{0,400}Nouveaut").toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});
