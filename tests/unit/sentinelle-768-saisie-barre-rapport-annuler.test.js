/**
 * SENTINELLE #768 / #782 — LA BARRE D'ACTIONS DE LA SAISIE N'A QU'UNE SEULE DÉFINITION,
 * ET LE RENDU NE PEUT PLUS LA DÉTRUIRE.
 *
 * HISTOIRE, parce qu'elle explique pourquoi cette sentinelle a dû être réécrite.
 *
 * #768 (6 sept. 2026) : `restaurerCompteurPresences` reconstruisait toute la barre en
 * `innerHTML`, à partir d'une SECONDE copie du gabarit vivant dans saisie-presences.js.
 * Elle avait déjà perdu « Rapport » et son « Annuler » visait une sous-section absente
 * de config.js. Corrigé — et gardé par une sentinelle qui vérifiait TROIS boutons NOMMÉS.
 *
 * #782 (7 sept. 2026) : le lot 1.124.0 ajoute un bouton « Reporter dans Léa » au seul
 * index.html. Le gabarit JS l'écrase au premier rendu d'une séance valide : le bouton
 * est invisible sur Mac ET sur iPad, relevé en porte terrain le jour même.
 * ⚠ LA SENTINELLE #768 EST RESTÉE VERTE PENDANT CE TEMPS, parce qu'elle nommait trois
 * boutons et que ces trois-là survivaient. Elle gardait des exemples, pas l'invariant.
 *
 * ⮕ D'où cette réécriture. L'invariant gardé n'est plus « ces boutons existent » mais
 * « la barre n'est définie qu'à UN endroit, et le rendu n'y touche pas ». Un bouton
 * ajouté demain est couvert sans que personne ait à modifier ce fichier.
 *
 * BREAK-TESTS attendus :
 *   · remettre un `compteur.innerHTML = ...` dans restaurerCompteurPresences → cas 1 rougit
 *   · faire écraser #actions-presences-bar par le rendu → cas 3 rougit
 *   · retirer un bouton d'index.html sans toucher au JS → cas 2 rougit
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** Les boutons de la barre, LUS dans index.html — jamais une liste écrite ici. */
function barreStatique() {
    const html = lire('index.html');
    const debut = html.indexOf('id="actions-presences-bar"');
    expect(debut).toBeGreaterThan(-1);
    // La barre se ferme au </span> qui suit le dernier bouton : on borne large,
    // puis on découpe sur la balise fermante de la section de boutons.
    const extrait = html.slice(debut, debut + 4000);
    const fin = extrait.indexOf('</div>');
    const bloc = extrait.slice(0, fin > 0 ? fin : extrait.length);
    return {
        bloc,
        actions: [...bloc.matchAll(/data-action="([^"]+)"/g)].map(m => m[1]),
        ids: [...bloc.matchAll(/id="([^"]+)"/g)].map(m => m[1])
    };
}

describe('#768/#782 · la barre d\'actions de la saisie', () => {
    it('1. le JS ne porte AUCUN gabarit de la barre : il n\'écrit plus dans #compteur-presences par innerHTML', () => {
        const js = lire('js/saisie-presences.js');

        // La forme exacte du défaut : une assignation d'innerHTML sur l'élément
        // récupéré par getElementById('compteur-presences').
        const lignes = js.split('\n');
        const fautives = lignes
            .map((l, i) => ({ n: i + 1, l }))
            .filter(({ l }) => /^\s*compteur\.innerHTML\s*=/.test(l));
        expect(fautives.map(f => `l.${f.n}: ${f.l.trim()}`)).toEqual([]);

        // Et le JS ne doit fabriquer aucun BOUTON DE LA BARRE : une balise
        // `<button` suivie de près par une action de la barre est la signature
        // d'un gabarit recopié. On borne à la barre ; l'en-tête de la colonne
        // « Présence » a sa propre sentinelle depuis #783 (11 oct. 2026), qui lui
        // retire aussi son second gabarit (sentinelle-783-en-tete-presence-un-gabarit).
        // (Chercher les libellés eux-mêmes serait faux — les commentaires du
        // module les citent, et cette sentinelle a rougi là-dessus au premier jet.)
        const { actions } = barreStatique();
        const gabarits = [];
        let i = js.indexOf('<button');
        while (i !== -1) {
            const fenetre = js.slice(i, i + 400);
            for (const a of actions) {
                if (fenetre.includes('data-action="' + a + '"')) {
                    gabarits.push(a + ' à l\'offset ' + i);
                }
            }
            i = js.indexOf('<button', i + 1);
        }
        expect(gabarits).toEqual([]);
    });

    it('2. index.html porte la barre en entier, verrouillage compris', () => {
        const { actions, ids } = barreStatique();
        // Au moins les trois boutons connus au 7 sept., sans figer la liste :
        // la vérification qui compte est la 3, qui les prend TOUS tels qu'ils sont.
        expect(actions).toContain('ouvrirModaleRapportPresences');
        // Lot D (27 sept. 2026) : « Enregistrer » → « Confirmer la séance », « Annuler » → « Fermer ».
        expect(actions).toContain('confirmerSeancePresences');
        expect(actions).toContain('fermerSaisiePresences');
        // #782 : ce contrôle n'existait QUE dans le gabarit JS, d'où sa disparition
        // quand le gabarit est parti. Il vit désormais dans index.html.
        expect(ids).toContain('controle-verrouillage-presences');
        expect(ids).toContain('checkbox-verrouillage-presences');
    });

    it('3. le cycle message → restauration laisse la barre INTACTE, quels que soient ses boutons', () => {
        const { actions } = barreStatique();

        // Faux DOM minimal : les deux blocs qui s'excluent, plus la barre dont on
        // marque le contenu pour voir si quelque chose y touche.
        const MARQUEUR = '<!--barre-intacte-' + actions.join('|') + '-->';
        const faire = () => ({ classes: new Set(), textContent: '', innerHTML: '', style: {},
            classList: {
                add(c) { this.__.classes.add(c); }, remove(c) { this.__.classes.delete(c); },
                contains(c) { return this.__.classes.has(c); }
            } });
        const lier = (o) => { o.classList.__ = o; return o; };
        const els = {
            'compteur-presences': lier(faire()),
            'message-etat-presences': lier(faire()),
            'bloc-normal-presences': lier(faire()),
            'actions-presences-bar': lier(Object.assign(faire(), { innerHTML: MARQUEUR }))
        };
        const doc = {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            addEventListener() {}, createElement: () => lier(faire()),
            body: { addEventListener() {}, appendChild() {}, classList: { add() {}, remove() {}, contains: () => false }, style: {} },
            documentElement: { addEventListener() {} }
        };

        const f = chargerScript('js/saisie-presences.js', { document: doc });
        const message = f.afficherMessageCompteurPresences;
        const restaurer = f.restaurerCompteurPresences;

        // ⚠ EXIGÉ, jamais sauté. Au premier jet, ce cas enveloppait la suite dans
        // un `if (typeof … === 'function')` : les fonctions n'étant pas exportées,
        // le bloc était sauté et le test passait sans rien appeler. Son break-test
        // « le rendu vide la barre » restait vert. C'est ce qui a révélé la faute.
        expect(typeof message).toBe('function');
        expect(typeof restaurer).toBe('function');

        message('Congé férié — aucune séance');
        expect(els['message-etat-presences'].textContent).toBe('Congé férié — aucune séance');
        expect(els['bloc-normal-presences'].classList.contains('u-hide')).toBe(true);
        expect(els['actions-presences-bar'].innerHTML).toBe(MARQUEUR);

        restaurer();
        expect(els['message-etat-presences'].classList.contains('u-hide')).toBe(true);
        expect(els['bloc-normal-presences'].classList.contains('u-hide')).toBe(false);

        // Le cœur : après le cycle complet, rien n'a touché à la barre.
        expect(els['actions-presences-bar'].innerHTML).toBe(MARQUEUR);
    });

    it('4. « Fermer » (ex-« Annuler ») vise une sous-section que config.js déclare', () => {
        // Lot D : le bouton passe par `fermerSaisiePresences`, qui vide l'écriture en attente
        // avant d'aller à la liste ; la cible se lit dans la fonction.
        const js = lire('js/saisie-presences.js');
        const cible = (js.split('function fermerSaisiePresences')[1].split('\n}')[0]
            .match(/afficherSousSection\('([^']+)'\)/) || [])[1];
        const config = lire('js/config.js');
        const declare = config.match(/'suivi':\s*\[([\s\S]*?)\]/)[1];
        const valides = [...declare.matchAll(/id:\s*'([^']+)'/g)].map(m => 'suivi-' + m[1]);

        // #834 lot C (cadrage « Rencontres », 12 sept. 2026, autorisation de Grégoire pour config.js) : « Rencontres » après « Interventions ».
        expect(valides).toEqual(['suivi-groupe', 'suivi-liste', 'suivi-saisie', 'suivi-profil', 'suivi-interventions', 'suivi-rencontres', 'suivi-animation']);
        expect(cible).toBe('suivi-liste');
        expect(valides).toContain(cible);
    });
});
