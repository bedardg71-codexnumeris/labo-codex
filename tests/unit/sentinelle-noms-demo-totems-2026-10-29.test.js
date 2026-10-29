/**
 * #1180 · LES ÉLÈVES DE LA DÉMO PORTENT DES TOTEMS SCOUTS (29 oct. 2026)
 *
 * Décision de Grégoire (29 oct., 8 h 07) : les dix élèves du pack démo portaient des
 * noms de personnalités réelles (Aimé Césaire, Nelson Mandela, Lionel Messi…), dont
 * certaines vivantes, et ces noms recevaient des notes et des profils de risque. Ils
 * deviennent des totems scouts : le prénom est l'animal, le nom est une qualité de
 * caractère qui ne touche pas au travail scolaire. Liste validée à 8 h 14 ; consigne
 * `plans de travail/CONSIGNE-LOT-2026-10-29-noms-demo-totems.md`.
 *
 * Ce qu'elle garde :
 *   A. les dix couples sont dans `groupeEtudiants`, sous leur DA ;
 *   B. chaque copie dit le nom de SON élève : `etudiantNom` = « prénom nom » du même
 *      `etudiantDA`, et chaque « Bonjour X ! » d'une rétroaction salue ce prénom
 *      (trois copies EV2 saluaient « Toni » dans la copie d'un autre élève : corrigé
 *      avec ce lot) ;
 *   C. aucun des vingt anciens noms ne reste dans le fichier du pack, commentaires
 *      compris — aucune exception ;
 *   D. LE STOCK : la version du pack a monté. `initialiserDemoNamespace` ne réécrit
 *      `demo_*` que si cette version diffère de celle installée ; sans la montée, qui a
 *      déjà ouvert la démo garde les anciens noms. Le témoin le montre : le même pack
 *      sous l'ancienne version laisse le stock intact.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const SOURCE_PACK = readFileSync(path.join(racine, 'js/pack-demo-10.js'), 'utf8');
const PACK = chargerScript('js/pack-demo-10.js').PACK_DEMARRAGE;

const TOTEMS = {
    DEMO004: ['Castor', 'Jovial'],
    DEMO006: ['Mésange', 'Joyeuse'],
    DEMO007: ['Hérisson', 'Chaleureux'],
    DEMO010: ['Bernache', 'Fidèle'],
    DEMO011: ['Vigogne', 'Fière'],
    DEMO015: ['Suricate', 'Loyal'],
    DEMO016: ['Condor', 'Courageux'],
    DEMO017: ['Grue', 'Gracieuse'],
    DEMO019: ['Gazelle', 'Intrépide'],
    DEMO020: ['Panda', 'Serein']
};

const ANCIENS = ['Aimé', 'Césaire', 'Marie', 'Curie', 'Félix', 'Leclerc', 'Gabrielle', 'Roy',
    'Frida', 'Kahlo', 'Nelson', 'Mandela', 'Lionel', 'Messi', 'Toni', 'Morrison',
    'Oumou', 'Sangaré', 'Ravi', 'Shankar'];

const VERSION_D_AVANT = '21.1';

/** Un mot entier : « Roy » ne doit pas rougir sur « Royaume », ni « Toni » sur « Tonique ». */
const motEntier = (mot) => new RegExp(`(?<!\\p{L})${mot}(?!\\p{L})`, 'u');

describe('#1180 · A. les dix totems, sous leur DA', () => {
    it('groupeEtudiants porte exactement les dix couples du tableau', () => {
        const couples = Object.fromEntries(PACK.groupeEtudiants.map((e) => [e.da, [e.prenom, e.nom]]));
        expect(couples).toEqual(TOTEMS);
    });
});

describe('#1180 · B. chaque copie dit le nom de son élève', () => {
    const parDA = Object.fromEntries(PACK.groupeEtudiants.map((e) => [e.da, e]));

    it('etudiantNom = « prénom nom » de l\'élève du même etudiantDA (101 copies)', () => {
        expect(PACK.evaluationsSauvegardees.length).toBe(101);
        const ecarts = PACK.evaluationsSauvegardees
            .filter((ev) => ev.etudiantNom !== `${parDA[ev.etudiantDA].prenom} ${parDA[ev.etudiantDA].nom}`)
            .map((ev) => `${ev.id} ${ev.etudiantDA} ${ev.etudiantNom}`);
        expect(ecarts).toEqual([]);
    });

    it('chaque « Bonjour X ! » salue le prénom de l\'élève de la copie', () => {
        let saluts = 0;
        const ecarts = [];
        for (const ev of PACK.evaluationsSauvegardees) {
            for (const m of String(ev.retroactionFinale || '').matchAll(/Bonjour ([^ !\n]+) !/g)) {
                saluts++;
                if (m[1] !== parDA[ev.etudiantDA].prenom) ecarts.push(`${ev.id} ${ev.etudiantDA} « ${m[0]} »`);
            }
        }
        expect(saluts).toBe(98);   // mesuré le 29 oct. : 101 copies, 98 saluent leur élève, 3 sans salut
        expect(ecarts).toEqual([]);
    });
});

describe('#1180 · C. aucun ancien nom dans le pack', () => {
    it('les vingt anciens noms sont absents du fichier, commentaires compris', () => {
        expect(ANCIENS.filter((n) => motEntier(n).test(SOURCE_PACK))).toEqual([]);
    });

    it('témoin : la recherche par mot entier trouve un nom quand il est là, et pas dans un mot plus long', () => {
        expect(motEntier('Roy').test('Bonjour Roy !')).toBe(true);
        expect(motEntier('Roy').test('le Royaume')).toBe(false);
        expect(motEntier('Aimé').test('« Aimé »')).toBe(true);
        expect(motEntier('Castor').test(SOURCE_PACK)).toBe(true);
    });
});

describe('#1180 · D. le stock : un namespace démo déjà installé reçoit les totems', () => {
    /** Un espace démo tel qu'il est chez qui a ouvert la démo avant ce lot. */
    function stockD_avant() {
        const donnees = {
            demo_groupeEtudiants: [{ da: 'DEMO004', groupe: 'demo', nom: 'Césaire', prenom: 'Aimé', coursId: 'demo-cours' }],
            demo_evaluationsSauvegardees: [{ id: 'EV_ANCIEN', etudiantDA: 'DEMO004', etudiantNom: 'Aimé Césaire', retroactionFinale: 'Bonjour Aimé !' }]
        };
        const db = {
            getSync: (k, defaut) => (k in donnees ? donnees[k] : defaut),
            setSync: (k, v) => { donnees[k] = v; return true; }
        };
        const stockage = { [`demo-version-installee`]: VERSION_D_AVANT };
        const localStorage = {
            getItem: (k) => (k in stockage ? stockage[k] : null),
            setItem: (k, v) => { stockage[k] = String(v); }
        };
        return { donnees, db, localStorage, stockage };
    }

    async function initialiser(pack) {
        const s = stockD_avant();
        const win = chargerScript('js/demo-namespace.js', { db: s.db, localStorage: s.localStorage, PACK_DEMARRAGE: pack });
        await win.initialiserDemoNamespace();
        return s;
    }

    it('la version du pack n\'est plus celle d\'avant les totems', () => {
        expect(PACK._metadata.version).not.toBe(VERSION_D_AVANT);
    });

    it('relancer l\'initialisation remplace les anciens noms par les totems', async () => {
        const s = await initialiser(PACK);
        expect(s.stockage['demo-version-installee']).toBe(PACK._metadata.version);
        const castor = s.donnees.demo_groupeEtudiants.find((e) => e.da === 'DEMO004');
        expect([castor.prenom, castor.nom]).toEqual(['Castor', 'Jovial']);
        expect(s.donnees.demo_groupeEtudiants.map((e) => e.da).sort()).toEqual(Object.keys(TOTEMS));
        const texte = JSON.stringify([s.donnees.demo_groupeEtudiants, s.donnees.demo_evaluationsSauvegardees]);
        expect(ANCIENS.filter((n) => motEntier(n).test(texte))).toEqual([]);
        expect(texte).toContain('Bonjour Castor !');
    });

    it('témoin : le même pack sous la version d\'avant laisse le stock intact', async () => {
        const memePackAncienneVersion = Object.assign({}, PACK, { _metadata: Object.assign({}, PACK._metadata, { version: VERSION_D_AVANT }) });
        const s = await initialiser(memePackAncienneVersion);
        expect(s.donnees.demo_groupeEtudiants).toEqual([{ da: 'DEMO004', groupe: 'demo', nom: 'Césaire', prenom: 'Aimé', coursId: 'demo-cours' }]);
    });
});
