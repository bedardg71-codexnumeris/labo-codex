import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #358 — Garde anti-resemage du global hérité par les exemples génériques.
//
// CE QU'ELLE VERROUILLE : `assurerGrilleDeDepart` ne doit JAMAIS écrire l'exemple
// générique dans la clé GLOBALE nue (⚠ #574, 29 août 2026 : sa jumelle
// `assurerEchelleGenerique` est RETIRÉE — plus aucune échelle n'est semée par le
// code ; ce banc ne garde que la moitié grille)
// (`grillesTemplates` / `echellesTemplates`) — la clé héritée que #358 retire.
//
// POURQUOI le bug existait : ces fonctions tournent au boot via
// initialiserModuleGrilles/Echelles (DOMContentLoaded, AVANT db-ready). Sous
// localStorage saturé (#353), `trimestreActif` n'est pas encore réhydraté →
// obtenirTrimestreId() est vide → cle('grillesTemplates') retombe sur la clé
// GLOBALE nue (trimestres.js:307). Semer alors recréait l'exemple dans le global
// hérité À CHAQUE boot → le vidage G4 (#358) ne pouvait jamais garder le global
// vide (constaté en migration live le 28 juin 2026).
//
// LA GARDE : ne semer que lorsque cle() résout vers une copie namespacée. La
// navigation vers la section ré-appelle ces modules une fois le trimestre actif
// établi (navigation.js:223), semant alors dans <trim>_*.
//
// BREAK-TEST (SKILL_verification_adverse) : retirer la ligne de garde
// `if (cle(...) === '...') return;` fait ÉCRIRE le global nu dans le cas A →
// les assertions « global nu intouché » ROUGISSENT. Prouvé ROUGE→VERT le 28 juin 2026.

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        // #522 lot 2c : le semis passe désormais par la file. Le stub la
        // reproduit fidèlement — y compris le refus : un mutateur qui rend
        // `undefined` n'écrit RIEN, donc la clé reste absente du store, ce qui
        // est exactement ce que ce fichier vérifie.
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        }
    };
}

// Charge trimestres.js (vrai cle()) + grilles.js + echelles.js sur le même store.
function setup(store) {
    const db = dbDepuisStore(store);
    const winT = chargerScript('js/trimestres.js', { db });
    const winG = chargerScript('js/grilles.js', { db, cle: winT.cle });
    const winE = chargerScript('js/echelles.js', { db, cle: winT.cle });
    // estRessourceSupprimee est fournie par un autre module en prod : la stubber
    // (rien de supprimé) pour que les assurer*Generique aillent jusqu'au semage.
    winG.estRessourceSupprimee = () => false;
    winE.estRessourceSupprimee = () => false;
    return { winT, winG, winE, db };
}

describe('#358 · garde anti-resemage du global par les exemples génériques', () => {

    it('CAS A (break-test) — sans trimestre actif, cle() est nu → AUCUNE écriture du global', async () => {
        // Aucun trimestre marqué actif → obtenirTrimestreId() = '' → cle() renvoie le nu.
        const store = { trimestres: [{ id: 'h2026', actif: false }] };
        const { winT, winG, winE } = setup(store);

        // Précondition du break-test : cle() résout BIEN vers la clé nue ici.
        expect(winT.cle('grillesTemplates')).toBe('grillesTemplates');
        expect(winT.cle('echellesTemplates')).toBe('echellesTemplates');

        await winG.assurerGrilleDeDepart();
        // #574 : plus de semis d'échelle du tout — la fonction n'existe plus.
        expect(winE.assurerEchelleGenerique).toBeUndefined();

        // La garde doit avoir court-circuité : le global hérité reste vierge.
        expect(store.grillesTemplates, 'global nu grillesTemplates ne doit PAS être semé').toBeUndefined();
        expect(store.echellesTemplates, 'global nu echellesTemplates ne doit PAS être semé').toBeUndefined();
    });

    it('CAS B — trimestre actif h2026, cle() namespacé → sème dans <trim>_*, pas dans le global', async () => {
        const store = { trimestres: [{ id: 'h2026', actif: true }] };
        const { winT, winG, winE } = setup(store);

        // Régime namespacé : cle() route vers la copie du trimestre actif.
        expect(winT.cle('grillesTemplates')).toBe('h2026_grillesTemplates');
        expect(winT.cle('echellesTemplates')).toBe('h2026_echellesTemplates');

        await winG.assurerGrilleDeDepart();

        // Semé dans la copie namespacée… (grille seulement : #574 a retiré l'échelle)
        expect((store.h2026_grillesTemplates || []).map(g => g.id)).toContain('GRILLE_GENERIQUE');
        expect(store.h2026_echellesTemplates, '#574 : aucune échelle semée').toBeUndefined();
        // …et JAMAIS dans le global hérité.
        expect(store.grillesTemplates, 'global nu intouché').toBeUndefined();
        expect(store.echellesTemplates, 'global nu intouché').toBeUndefined();
    });

    it('CAS B idempotent — un 2e passage ne duplique pas l\'exemple', async () => {
        const store = { trimestres: [{ id: 'h2026', actif: true }] };
        const { winG } = setup(store);

        await winG.assurerGrilleDeDepart();
        await winG.assurerGrilleDeDepart();

        const nb = (store.h2026_grillesTemplates || []).filter(g => g.id === 'GRILLE_GENERIQUE').length;
        expect(nb).toBe(1);
    });
});
