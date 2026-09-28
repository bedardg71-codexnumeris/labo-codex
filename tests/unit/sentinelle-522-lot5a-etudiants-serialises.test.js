import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #522 lot 5a (30 août 2026) — LA LISTE DES ÉTUDIANTS.
//
// Sept sites de `js/trimestre-v2-etudiants.js` lisaient `cle('groupeEtudiants')`,
// y changeaient une entrée, puis réécrivaient la liste ENTIÈRE. Tous sont des
// GESTES UTILISATEUR : enregistrer une fiche, supprimer, changer un statut,
// importer une liste, vider un groupe, corriger les numéros de groupe.
//
// ⮕ ET LE REFUS DE #382 PORTAIT SUR UN INSTANTANÉ. `soumettreEtudiantV2` refuse
// d'écrire quand « la liste a changé depuis l'ouverture du formulaire » — mais ce
// contrôle lisait la liste HORS file. Il attrapait donc les changements
// antérieurs à SA lecture, pas ceux survenus entre sa lecture et son écriture,
// c'est-à-dire exactement la fenêtre qu'il prétendait couvrir. Il vit désormais
// dans le mutateur.
//
// ⚠ UN SITE N'EST PAS CONVERTI, ET LE SCRIPT DE MESURE LE SIGNALE À TORT :
// `reinitialiserEtudiantsV2` lit la liste pour CHIFFRER sa question, puis écrit
// une CONSTANTE (`[]`). La valeur écrite ne dérive pas de la lecture : il n'y a
// pas de course. Le cas C.c le nomme, pour que personne ne « corrige » ce
// faux positif au prochain passage.
//
// ⚠⚠ LE BANC : chemin IndexedDB rétabli ET clone structuré.
//
// ⚠⚠ DEUX MUTATIONS DU BREAK-TEST ONT REFUSÉ DE ROUGIR, ET LEUR LEÇON EST
// INSCRITE ICI PLUTÔT QUE TAIRE. Retirer le `return undefined;` du refus dans
// `changerStatutEtudiantV2`, puis dans `soumettreEtudiantV2`, ne change RIEN
// d'observable : sans lui, le mutateur réécrit une liste qu'il n'a pas modifiée,
// et dans la file cela équivaut à ne rien écrire. ⮕ CES DEUX REFUS SONT
// DÉFENSIFS, PAS PORTANTS — et une sentinelle ne peut pas prétendre les garder.
// Ce que ce fichier garde vraiment, ce sont les DEUX RECALCULS : l'index de
// suppression et le filtre de groupe, tous deux refaits DANS le mutateur. Les
// mutations qui les défont, elles, rougissent.
// ⮕ Corollaire de méthode : une mutation doit viser ce que la conversion a
// CHANGÉ, pas ce qu'elle a ajouté par prudence. Une mutation neutre ne prouve
// rien, ni dans un sens ni dans l'autre.

/* ------------------------------------------------------------------ harnais */

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
            const store = {
                get(key) {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined;
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                },
                put(record) {
                    const req = {};
                    const fige = cloner(record.value);
                    Promise.resolve().then(() => {
                        if (req.onsuccess) req.onsuccess();
                        setTimeout(() => {
                            disque.set(record.key, fige);
                            if (tx.oncomplete) tx.oncomplete();
                        }, 0);
                    });
                    return req;
                },
                getAll() {
                    const req = {};
                    Promise.resolve().then(() => {
                        req.result = [...disque].map(([key, value]) => ({ key, value: cloner(value) }));
                        if (req.onsuccess) req.onsuccess();
                    });
                    return req;
                }
            };
            const tx = { objectStore: () => store };
            return tx;
        }
    };
}

async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

async function monterEtudiants() {
    const db = await monterDb();
    const elements = {};
    ['v2-etudiantDA', 'v2-etudiantNom', 'v2-etudiantPrenom', 'v2-etudiantGroupe',
     'v2-etudiantProgramme', 'v2-etudiantSA', 'v2-formEtudiantTitre', 'v2-selectGroupe'].forEach((id) => {
        elements[id] = { value: '', textContent: '', classList: { add() {}, remove() {} } };
    });
    const win = chargerScript('js/trimestre-v2-etudiants.js', {
        db,
        cle: (k) => k,
        // #749 lot 2 : la normalisation du numéro de groupe vit dans modes.js (non chargé ici)
        normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0'),
        document: {
            addEventListener() {}, getElementById: (id) => elements[id] || null,
            querySelectorAll: () => [], querySelector: () => null
        },
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        estEnModeDemo: () => false,
        genererIdUnique: (p) => (p || 'X') + Math.random().toString(36).slice(2, 8),
        alert: () => {}, confirm: () => true,
        chargerListeEtudiantsV2: () => {},
        echapperHtml: (t) => String(t == null ? '' : t)
    });
    for (const f of ['soumettreEtudiantV2', 'supprimerEtudiantV2', 'changerStatutEtudiantV2']) {
        if (typeof win[f] !== 'function') throw new Error(f + ' absent du sandbox');
    }
    return { db, win, elements };
}

const CLE = 'groupeEtudiants';

const ETUDIANTS = () => ([
    { da: '111', nom: 'Un', prenom: 'A', groupe: '00001', statut: 'actif', coursId: 'C1' },
    { da: '222', nom: 'Deux', prenom: 'B', groupe: '00001', statut: 'actif', coursId: 'C1' },
    { da: '333', nom: 'Trois', prenom: 'C', groupe: '00002', statut: 'actif', coursId: 'C1' }
]);

const parDA = (liste, da) => liste.find((e) => e.da === da);

/* --------------------------------------- A — la course, sur le chemin réel */

describe('#522 lot 5a · A — deux gestes en rafale gardent LEURS DEUX effets', () => {

    it('A.a deux changements de statut concurrents tiennent tous les deux', async () => {
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.changerStatutEtudiantV2('111', 'inactif'),
            win.changerStatutEtudiantV2('333', 'décrochage')
        ]);

        const liste = await db.get(CLE);
        expect(parDA(liste, '111').statut, 'le premier statut tient').toBe('inactif');
        expect(parDA(liste, '333').statut, 'le second statut tient').toBe('décrochage');
    });

    it('A.b une suppression et un changement de statut concurrents s\'appliquent tous les deux', async () => {
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.supprimerEtudiantV2('222'),
            win.changerStatutEtudiantV2('333', 'inactif')
        ]);

        const liste = await db.get(CLE);
        expect(liste, 'la suppression tient').toHaveLength(2);
        expect(parDA(liste, '333').statut, 'le statut tient').toBe('inactif');
    });

    it('A.c deux suppressions concurrentes retirent les DEUX étudiants', async () => {
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([win.supprimerEtudiantV2('111'), win.supprimerEtudiantV2('333')]);

        expect((await db.get(CLE)).map((e) => e.da), 'seul 222 reste').toEqual(['222']);
    });

    it('A.d une suppression de groupe et un changement de statut concurrents s\'appliquent tous les deux', async () => {
        // ⚠ `confirmerImportV2` N'A PAS de cas de comportement, et c'est dit
        // plutôt que sous-entendu : sa source, `donneesImportEnAttenteV2`, est
        // une variable de l'IIFE remplie uniquement par le flux de
        // prévisualisation. La poser sur le sandbox ne la remplace pas, et
        // aucun point d'entrée exporté ne l'alimente. Elle est gardée par le
        // cliquet C.a seulement.
        const { db, win, elements } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe
        // #872 B : la valeur du menu est le couple (cours, numéro) — ici le groupe de l'étudiant 333.
        elements['v2-selectGroupe'].value = 'C1|00002';

        // ⚠ L'ORDRE COMPTE, et le break-test l'a montré. Mis en file en premier,
        // le retrait de groupe écrit AVANT que le changement de statut n'existe :
        // sa liste périmée ne perd alors rien, et une version qui filtrerait la
        // liste lue AVANT la confirmation passerait au vert. Le changement de
        // statut doit entrer dans la file en PREMIER pour que le retrait ait
        // quelque chose à écraser.
        await Promise.all([
            win.changerStatutEtudiantV2('111', 'inactif'),
            win.supprimerGroupeSelectionneV2()
        ]);

        const liste = await db.get(CLE);
        expect(liste.map((e) => e.da), 'le groupe 00002 est parti').toEqual(['111', '222']);
        expect(parDA(liste, '111').statut, 'le statut tient').toBe('inactif');
    });
});

/* ------------------------------------------------------------ B — les refus */

describe('#522 lot 5a · B — le geste impossible REFUSE l\'écriture', () => {

    it('B.a un changement de statut sur un DA absent ne touche à rien', async () => {
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await win.changerStatutEtudiantV2('999', 'inactif');

        expect(JSON.stringify(await db.get(CLE))).toBe(JSON.stringify(ETUDIANTS()));
    });

    it('B.c un changement de statut sur un étudiant supprimé ENTRE-TEMPS ne le ressuscite pas', async () => {
        // ⚠ CE CAS EXISTE PARCE QUE LE BREAK-TEST A MONTRÉ QUE B.a NE PROUVAIT
        // RIEN. `changerStatutEtudiantV2` refuse déjà un DA absent AVANT
        // d'entrer dans la file, sur sa lecture d'affichage : le refus posé
        // DANS le mutateur n'était donc jamais atteint par B.a, et le retirer
        // ne faisait pas rougir. Ici, l'étudiant existe à la lecture et
        // disparaît avant l'écriture — c'est la seule façon d'atteindre ce
        // refus, et c'est exactement la fenêtre que la file rend observable.
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await Promise.all([
            win.changerStatutEtudiantV2('333', 'inactif'),
            win.supprimerEtudiantV2('333')
        ]);

        const liste = await db.get(CLE);
        expect(liste.map((e) => e.da), 'l\'étudiant reste supprimé').toEqual(['111', '222']);
        expect(liste.length, 'aucune entrée `undefined` n\'a été créée').toBe(2);
    });

    it('B.b une suppression sur un DA absent ne retire rien', async () => {
        const { db, win } = await monterEtudiants();
        await db.set(CLE, ETUDIANTS());   // security-ok: littéral de banc, aucune source externe

        await win.supprimerEtudiantV2('999');

        expect(await db.get(CLE), 'aucun étudiant retiré').toHaveLength(3);
    });
});

/* ------------------------------------------------- C — le cliquet du lot 5a */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

function corpsDeLaFonction(src, nom) {
    const debut = src.indexOf('function ' + nom + '(');
    if (debut === -1) return null;
    const ouvrante = src.indexOf('{', debut);
    let profondeur = 0;
    for (let i = ouvrante; i < src.length; i++) {
        if (src[i] === '{') profondeur++;
        else if (src[i] === '}') {
            profondeur--;
            if (profondeur === 0) return src.slice(debut, i + 1);
        }
    }
    return null;
}

describe('#522 lot 5a · C — la course ne peut pas se rouvrir en silence', () => {

    const src = lire('js/trimestre-v2-etudiants.js');

    it('C.a les sept gestes utilisateur écrivent par la file', () => {
        for (const nom of ['soumettreEtudiantV2', 'supprimerEtudiantV2', 'changerStatutEtudiantV2',
                           'confirmerImportV2', 'supprimerGroupeSelectionneV2',
                           'sauvegarderGroupeEtudiantsV2']) {
            const corps = corpsDeLaFonction(src, nom);
            expect(corps, `${nom} : introuvable`).toBeTruthy();
            // ↻ Lot E2 (28 sept. 2026) : `modifierEtAnnoncer` (modes.js) EST la file (`db.modifier`) plus
            // le témoin commun ; `sauvegarderGroupeEtudiantsV2`, sans appelant, garde `db.modifier`.
            expect(corps, `${nom} : n'écrit pas par la file`).toMatch(/(db\.modifier|modifierEtAnnoncer)\(\s*cleEtud/);
            expect(corps, `${nom} : garde une écriture directe`).not.toMatch(/db\.set\(\s*cleEtud\s*,\s*(etudiants|liste|tousLesEtudiants|etudiantsRestants)/);
        }
    });

    it('C.b le refus de #382 vit DANS le mutateur, pas avant', () => {
        // Vérifié hors file, ce contrôle attrape les changements antérieurs à SA
        // lecture — pas ceux de la fenêtre qu'il prétend couvrir.
        const corps = corpsDeLaFonction(src, 'soumettreEtudiantV2');
        const posFile = corps.indexOf('modifierEtAnnoncer(');   // lot E2 : la file, avec le témoin
        const posRefus = corps.indexOf('indexReel === -1');
        expect(posFile, 'la file est absente').toBeGreaterThan(-1);
        expect(posRefus, 'le refus précède la file').toBeGreaterThan(posFile);
    });

    it('C.c plus aucune écriture directe : « vider la liste » passe par la file (lot E2)', () => {
        // `reinitialiserEtudiantsV2` lit la liste pour CHIFFRER sa question, puis
        // écrit une CONSTANTE. La valeur écrite ne dérive pas de la lecture :
        // `scripts/mesurer-522.py` la signale à tort. Ne pas la « corriger ».
        // ⚠ LE CLIQUET COMPTE TOUTE ÉCRITURE DE LA CLÉ, quelle que soit son
        // expression. La première version ne cherchait que la variable
        // `cleEtud` : une mutation qui réécrivait par `db.set(cle('groupeEtudiants'), …)`
        // passait au vert. La clé s'écrit de deux façons, comme celle des
        // productions — c'est le piège du lot 3, sur une autre clé.
        // ↻ Lot E2 (28 sept. 2026) : « vider la liste » passe aussi par la file et le témoin
        // (`modifierEtAnnoncer(cleEtud, () => [], …)`) — il ne reste AUCUNE écriture directe.
        const directes = [...src.matchAll(/db\.set(Sync)?\(\s*(cleEtud|cle\('groupeEtudiants'\))\s*,/g)];
        expect(directes.length, 'aucune écriture directe').toBe(0);

        const corps = corpsDeLaFonction(src, 'reinitialiserEtudiantsV2');
        expect(corps, 'reinitialiserEtudiantsV2 : introuvable').toBeTruthy();
        expect(corps, 'vider la liste passe par la file et le témoin')
            .toMatch(/modifierEtAnnoncer\(\s*cleEtud\s*,\s*\(\)\s*=>\s*\[\]/);
    });

    it('C.d l\'outil de mesure est DANS le dépôt, pas dans un scratchpad', () => {
        // Trois lots ont été sous-comptés par le rapport d'audit (+38 %, +48 %,
        // +93 %). L'outil qui les a mesurés doit survivre à la session qui l'a
        // écrit, sinon la suivante repart du chiffre faux.
        const outil = readFileSync(path.join(racine, 'scripts/mesurer-522.py'), 'utf8');
        expect(outil).toMatch(/ALIAS/);
        expect(outil, 'les faux positifs doivent être documentés').toMatch(/FAUX POSITIFS/);
    });
});
