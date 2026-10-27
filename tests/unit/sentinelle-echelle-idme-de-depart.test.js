import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle L'ÉCHELLE IDME DE DÉPART (1er septembre 2026, §2 du PLAN-2026-09-01).
//
// LE TROU QU'ELLE COMBLE. `GRILLE_GENERIQUE` et `CART_GENERIQUE` sont semées et
// fonctionnent ; aucune échelle ne l'était depuis #574. Sans échelle,
// `calculerNote` sort en silence et aucun critère ne se rend : le nouvel
// utilisateur avait deux tiers d'un triptyque, et un écran qui ne réagissait pas.
//
// ⚠⚠ CE BANC EXISTE AUSSI POUR EMPÊCHER QU'ON LE DÉFASSE PAR ERREUR. Une session
// qui lit « le SOLO codé en dur a été retiré cet été » peut croire que semer une
// échelle SOLO est une incohérence. Ce n'en est pas une : le dépistage ne doit
// plus EXIGER SOLO, l'échelle semée le PROPOSE. Et #574 n'interdisait pas de
// semer une échelle — il interdisait d'en semer une SANS valeurs exploitables,
// ce qui est exactement l'assertion B ci-dessous.
//
// Break-test du 1er septembre, sur la source EN MÉMOIRE : retirer un
// `valeurCalcul` d'un seul niveau → B rougit ; réutiliser `ECHELLE_GENERIQUE`
// comme id → C rougit ; retirer la garde `estRessourceSupprimee` → D rougit ;
// retirer l'id de `IDS_GABARITS_HARDCODES` → E rougit.
// Break-test du 11 septembre (renommage du gabarit à la source) : remplacer la
// garde par identifiant par une réécriture de la copie existante → I rougit
// (« le stock garde ses mots »), fichier restauré par empreinte.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

/** Charge echelles.js avec un trimestre actif, donc une clé NAMESPACÉE. */
function charger(store, { supprimees = [] } = {}) {
    const win = {
        cle: (k) => 'a2026_' + k,
        estRessourceSupprimee: (id) => supprimees.includes(id)
    };
    return chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: win.cle }, win);
}

const CLE = 'a2026_echellesTemplates';

describe('§2 · l\'échelle IDME de départ complète le triptyque', () => {

    it('A · elle est semée une fois, et un second passage n\'écrit rien', async () => {
        const store = {};
        const win = charger(store);
        await win.assurerEchelleIdmeDeDepart();
        expect(store[CLE].map(e => e.id)).toEqual(['ECHELLE_IDME_DEPART']);
        await win.assurerEchelleIdmeDeDepart();
        expect(store[CLE].length, 'second passage : no-op').toBe(1);
    });

    it('I · un espace qui porte DÉJÀ sa copie la garde telle quelle — le renommage à la source (11 sept. 2026) ne réécrit pas le stock', async () => {
        // Le gabarit dit désormais « Développement » / « Maîtrise » ; une copie
        // semée avant ce jour dit « en Développement » / « Maîtrisé ». Décision de
        // Grégoire (3.1, 11 sept.) : la source change, le stock ne bouge pas —
        // « tarir n'est pas réparer ». Ce cas verrouille les deux moitiés.
        const store = {
            [CLE]: [{
                id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)',
                description: 'Quatre niveaux — Insuffisant, en Développement, Maîtrisé, Étendu.',
                niveaux: [
                    { code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 32 },
                    { code: 'D', nom: 'en Développement', min: 65, max: 74.99, valeurCalcul: 69.5 },
                    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, valeurCalcul: 79.5 },
                    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92.5 }
                ]
            }]
        };
        const win = charger(store);
        await win.assurerEchelleIdmeDeDepart();
        const copie = store[CLE].find(e => e.id === 'ECHELLE_IDME_DEPART');
        expect(store[CLE].length, 'aucune seconde copie').toBe(1);
        expect(copie.niveaux.map(n => n.nom), 'le stock garde ses mots').toEqual(['Incomplet', 'en Développement', 'Maîtrisé', 'Étendu']);
        expect(copie.description).toMatch(/Insuffisant, en Développement, Maîtrisé/);
        // Et la SOURCE, elle, dit bien les quatre mots arrêtés : un espace neuf les reçoit.
        const neuf = {};
        await charger(neuf).assurerEchelleIdmeDeDepart();
        expect(neuf[CLE][0].niveaux.map(n => n.nom)).toEqual(['Incomplet', 'Développement', 'Maîtrise', 'Étendu']);
        expect(neuf[CLE][0].description).toMatch(/Incomplet, Développement, Maîtrise, Étendu/);
    });

    it('B · TOUS ses niveaux portent une `valeurCalcul` exploitable — c\'est LA condition de #574', async () => {
        const store = {};
        const win = charger(store);
        await win.assurerEchelleIdmeDeDepart();
        const niveaux = store[CLE][0].niveaux;
        expect(niveaux.length, 'IDME = quatre niveaux').toBe(4);
        expect(niveaux.map(n => n.code)).toEqual(['I', 'D', 'M', 'E']);
        // La règle du dépôt, pas une seconde règle écrite ici : un niveau sans
        // `valeurCalcul` exploitable rend `null` et sort son critère du total.
        const muets = niveaux.filter(n => n.valeurCalcul == null
            || String(n.valeurCalcul).trim() === '' || isNaN(Number(n.valeurCalcul)));
        expect(muets.map(n => n.code), 'un niveau muet ramène le défaut de #574').toEqual([]);
    });

    it('C · son identifiant est NEUF — jamais celui de l\'échelle cassée de #574', async () => {
        const store = {};
        const win = charger(store);
        await win.assurerEchelleIdmeDeDepart();
        // Réutiliser `ECHELLE_GENERIQUE` ferait se confondre cette échelle avec
        // les copies CASSÉES encore présentes chez qui l'a connue (collision #524).
        expect(store[CLE][0].id).not.toBe('ECHELLE_GENERIQUE');
        expect(store[CLE][0].id).toBe('ECHELLE_IDME_DEPART');
    });

    it('D · supprimée volontairement, elle ne revient pas', async () => {
        const store = {};
        const win = charger(store, { supprimees: ['ECHELLE_IDME_DEPART'] });
        await win.assurerEchelleIdmeDeDepart();
        expect(store[CLE], 'le semis a ignoré le tombstone').toBeUndefined();
    });

    it('E · son id est dans IDS_GABARITS_HARDCODES — sans quoi la suppression ne TIENT pas', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');
        const debut = source.indexOf('window.IDS_GABARITS_HARDCODES = [');
        expect(debut, 'la liste des tombstones a changé de forme').toBeGreaterThan(-1);
        expect(source.slice(debut, source.indexOf('];', debut))).toContain('ECHELLE_IDME_DEPART');
    });

    it('F · elle ne modifie pas `niveauxDefaut` — la constante partagée reste intacte', async () => {
        const store = {};
        const win = charger(store);
        await win.assurerEchelleIdmeDeDepart();
        store[CLE][0].niveaux[0].valeurCalcul = 999;
        store[CLE][0].niveaux[0].nom = 'Saccagé';
        const store2 = {};
        const win2 = charger(store2);
        await win2.assurerEchelleIdmeDeDepart();
        // Une copie de surface aurait propagé la mutation à la douzaine de
        // lecteurs de `niveauxDefaut`.
        // ↻ 27 oct. 2026 : la valeur ponctuelle semée de « I » passe de 32 à 40 (décision de Grégoire, 27 oct., 17 h 48-17 h 49 ;
        // VERDICT-RELECTURE-2026-10-27-aide-lot-2b.md, § 4.1). Le stock : sentinelle-echelle-idme-de-depart-valeurs-1152.test.js.
        expect(store2[CLE][0].niveaux[0].valeurCalcul).toBe(40);
        expect(store2[CLE][0].niveaux[0].nom).toBe('Incomplet');
    });

    it('G · rien n\'est semé tant que la clé n\'est pas namespacée (garde #358)', async () => {
        const store = {};
        const win = { cle: (k) => k, estRessourceSupprimee: () => false };
        const w = chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: win.cle }, win);
        await w.assurerEchelleIdmeDeDepart();
        // Semer sur la clé GLOBALE nue recréerait l'exemple dans le global hérité
        // que #358 retire — et le rendrait invidable.
        expect(store.echellesTemplates, 'semé sur la clé nue').toBeUndefined();
    });

    it('H · le motif du semis est écrit DANS le code, pas seulement dans un plan', () => {
        // Le §2 du plan l'exige explicitement : sans ce paragraphe, une session
        // suivante défait le semis en croyant corriger une incohérence.
        const src = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8');
        const bloc = src.slice(src.indexOf('LA CONTRADICTION APPARENTE'),
                               src.indexOf('async function assurerEchelleIdmeDeDepart'));
        expect(bloc.length, 'le paragraphe de garde a disparu').toBeGreaterThan(500);
        expect(bloc).toMatch(/imposé par le code/i);
        expect(bloc).toMatch(/SEEDER est permis/);
    });
});
