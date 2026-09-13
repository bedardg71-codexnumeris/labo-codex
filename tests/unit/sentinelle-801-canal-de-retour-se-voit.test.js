import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #801 — le canal de retour EXISTE et il est bon (`js/rapport-bug.js`, deux
// modes : `bug` et `commentaire`). Le défaut n'est pas d'outillage, il est de
// DÉCOUVRABILITÉ : la porte annonçait « Signaler un bug », donc un collègue sans
// bug à signaler n'avait aucune raison de l'ouvrir.
//
// ⚠ Cette fiche corrige aussi une affirmation fausse faite en séance le 9 sept.
// (« aucun canal de signalement n'existe ») : un grep trop étroit, pas un
// constat. Les cas ci-dessous gardent l'existant autant que le renommage.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

const indexHtml = lire('index.html');
const rapportBugJs = lire('js/rapport-bug.js');
const infobullesJs = lire('js/accompagnement-contenu-hover.js');

const LIBELLE = 'Signaler un bug ou donner ton avis';

describe('#801 · la porte annonce ce qu\'il y a derrière', () => {
    it('le bouton de l\'en-tête et l\'entrée du menu annoncent les DEUX modes', () => {
        // Deux portes vers la même modale : l'icône coccinelle (desktop) et
        // l'entrée du popover (écrans étroits). Les deux, ou la moitié des
        // utilisateurs continue de lire « bug ».
        expect(indexHtml).toContain(`title="${LIBELLE}"`);
        expect(indexHtml).toContain(`<span>${LIBELLE}</span>`);
    });

    it('plus aucune de ces deux portes ne promet le seul mode « bug »', () => {
        expect(indexHtml).not.toContain('title="Signaler un bug"');
        expect(indexHtml).not.toContain('<span>Signaler un bug</span>');
    });

    it('l\'infobulle nomme le commentaire, pas seulement le problème technique', () => {
        const bloc = infobullesJs.split("'entete-signaler-bug':")[1] || '';
        const texte = bloc.split('\n').slice(0, 3).join(' ');
        expect(texte).toMatch(/commentaire/i);
    });

    it('la modale porte toujours ses DEUX modes — rien n\'a été construit, tout existait', () => {
        expect(rapportBugJs).toContain("data-param=\"commentaire\"");
        expect(rapportBugJs).toContain('Ton commentaire ou suggestion :');
        expect(rapportBugJs).toContain(`<h3 class="modal-titre">${LIBELLE}</h3>`);
    });

    it('L\'INVITATION VIT DANS LES NOUVEAUTÉS, PAS DANS LE BANDEAU — le bandeau disparaît', () => {
        // Geste 3 de la fiche : une invitation vue une seule fois, au moment où
        // l'utilisateur veut lire autre chose, se referme avant d'avoir servi.
        // La modale des nouveautés, elle, reste atteignable depuis l'accueil.
        const modale = indexHtml.split('id="modalNouveautes"')[1].split('</div>\n        </div>')[0];
        expect(modale).toContain('data-action="ouvrirModalRapportBug"');
        expect(modale).toContain('Donner ton avis');
    });

    it('le bandeau de version ne gagne PAS un troisième bouton', () => {
        // ⚠ Avec « Recharger », « Voir les nouveautés » et « Donner ton avis »,
        // une fenêtre transitoire porterait trois boutons. Si l'un doit sauter,
        // c'est celui-là : le geste 3 le couvre mieux et durablement.
        // L'ancre est mesurée, pas supposée : `#bandeau-mise-a-jour` est
        // l'identifiant que `bandeau-maj-chargement.spec.js` pilote déjà. Un
        // premier jet visait `#bandeau-maj`, qui n'existe nulle part — ce cas
        // passait alors QUOI QU'IL ARRIVE, ce que le break-test a révélé.
        expect(indexHtml).toContain('id="bandeau-mise-a-jour"');
        // Borné au bandeau lui-même : la modale des nouveautés le suit
        // immédiatement dans le fichier, et c'est ELLE qui porte l'invitation.
        const bandeau = indexHtml.split('id="bandeau-mise-a-jour"')[1].split('<!-- MODAL NOUVEAUTÉS')[0];
        expect(bandeau).toContain('data-action="rechargerPage"'); // témoin : on lit bien le bandeau
        expect(bandeau).not.toContain('ouvrirModalRapportBug');
    });

    it('LE DÉFAUT D\'ORIGINE : le bandeau « au chargement » MÈNE aux nouveautés, jamais à côté de « Recharger »', () => {
        // Le bandeau disait OÙ étaient les nouveautés (« la carte Nouveautés, en bas
        // de l'accueil ») au lieu d'y mener. Il porte maintenant le bouton qui ouvre
        // la modale — c'est ce cas qui rougit si le bouton disparaît.
        const bandeau = indexHtml.split('id="bandeau-mise-a-jour"')[1].split('<!-- MODAL NOUVEAUTÉS')[0];
        expect(bandeau).toContain('data-action="rechargerPage"'); // témoin : on lit bien le bandeau
        expect(bandeau).toMatch(/data-action="afficherModalNouveautes"[^>]*>\s*Voir les nouveautés\s*</);
        // Règle inverse de « Recharger » : le pied n'en montre qu'un dans les deux cas.
        const initInlineJs = lire('js/init-inline.js');
        expect(initInlineJs).toContain('btnRecharger.hidden = !distant;');
        expect(initInlineJs).toContain('btnNouveautes.hidden = distant;');
        // Et la phrase qui décrivait le chemin est partie.
        expect(initInlineJs.length).toBeGreaterThan(10000);
        // Toutes les formes d'apostrophe, toutes les casses : une phrase remise en
        // « En bas de l'accueil » ne doit pas passer (le premier garde, trop étroit,
        // l'a laissée passer au break-test).
        expect(initInlineJs).not.toMatch(/en bas de l(\\u2019|’|')accueil/i);
    });
});
