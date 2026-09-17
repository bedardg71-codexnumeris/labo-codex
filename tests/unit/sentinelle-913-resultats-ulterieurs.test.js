/**
 * SENTINELLE #913 — SAISIR UN RÉSULTAT OBTENU APRÈS LE TRIMESTRE, ET LE SORTIR DANS L'EXPORT DE RECHERCHE (17 sept. 2026).
 *
 * Ce que le lot tient (consigne du 17 sept., §3 et §6) :
 *   1. la forme rangée : `<trim>_resultatsUlterieurs` = { [da]: [{ cours, trimestre, note }] }, trois champs, pas un de plus ;
 *   2. le namespacing : un résultat saisi dans un trimestre n'apparaît pas dans un autre ;
 *   3. la note est un nombre de 0 à 100, une décimale, virgule admise ; hors bornes ou non numérique : rien n'est écrit ;
 *   4. le retrait ;
 *   5. sur un trimestre archivé, RIEN ne s'écrit sans `body.mode-ecriture-temp` — la garde est dans l'écriture, pas dans le CSS ;
 *   6. « Cours » et « Trimestre », textes libres, sont échappés au rendu ;
 *   7. l'export : `observations.etudiants[].resultats_ulterieurs`, liste vide quand il n'y a rien, `version_format` 1.2,
 *      AUCUN DA dans le fichier produit (verrou structurel sur le JSON rendu).
 *
 * Les gestes de l'écran (Entrée, focus, « Retirer ») sont jugés par le banc WebKit resultats-ulterieurs-913.spec.js.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const DA = '2000001';
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** Monte le module sur un `cle()` qui SUIT le trimestre actif — celui du harnais préfixe toujours « test_ ». */
function banc(store, { archive = false } = {}) {
    const etat = { trimestre: 'a2024', archive };
    const b = monter(store || storeBase(), {
        modules: ['js/resultats-ulterieurs.js'],
        objetsExportes: ['resultatsUlterieurs'],
        globaux: { cle: (k) => etat.trimestre + '_' + k }
    });
    b.win.estTrimestreArchive = () => etat.archive;
    return Object.assign(b, { etat, api: b.win.resultatsUlterieurs, mots: b.win.MOTS_RESULTATS_ULTERIEURS });
}

describe('#913 — la forme rangée', () => {
    it('un objet par trimestre, rangé par DA, trois champs et pas un de plus', () => {
        const b = banc();
        expect(b.api.ajouter(DA, { cours: ' 601-102-MQ ', trimestre: 'H2026', note: '78,5' })).toEqual({ ok: true });
        expect(b.api.ajouter(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' })).toEqual({ ok: true });
        expect(b.store.a2024_resultatsUlterieurs).toEqual({ [DA]: [
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 },
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
        ] });
        expect(b.win.obtenirResultatsUlterieurs(DA)).toHaveLength(2);
        expect(b.win.obtenirResultatsUlterieurs('2000002')).toEqual([]);
    });

    it('la clé est préfixée, jamais nue ; un résultat saisi en A2024 n\'apparaît pas en H2026', () => {
        const b = banc();
        b.api.ajouter(DA, { cours: '601-102-MQ', trimestre: 'H2025', note: '80' });
        expect(Object.keys(b.store)).toContain('a2024_resultatsUlterieurs');
        expect(Object.keys(b.store)).not.toContain('resultatsUlterieurs');
        b.etat.trimestre = 'h2026';
        expect(b.win.obtenirResultatsUlterieurs(DA)).toEqual([]);
        b.api.ajouter(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '55' });
        b.etat.trimestre = 'a2024';
        expect(b.win.obtenirResultatsUlterieurs(DA)).toEqual([{ cours: '601-102-MQ', trimestre: 'H2025', note: 80 }]);
    });
});

describe('#913 — la note : un nombre de 0 à 100, une décimale', () => {
    it.each([['0', 0], ['100', 100], ['78,5', 78.5], ['78.5', 78.5], [' 60 ', 60], ['78.56', 78.6]])('« %s » est lue %s', (saisie, attendu) => {
        expect(banc().api.lireNote(saisie)).toBe(attendu);
    });

    it.each(['-1', '100,1', '101', '1000', 'abc', '', '7e1', '78,5,2', '1 000', null, undefined])('« %s » n\'est pas écrite, et l\'écran le dit', (saisie) => {
        const b = banc();
        const issue = b.api.ajouter(DA, { cours: '601-102-MQ', trimestre: 'H2026', note: saisie });
        expect(issue).toEqual({ ok: false, refus: 'La note doit être un nombre entre 0 et 100.' });
        expect(b.journal).toEqual([]);
        expect(b.store.a2024_resultatsUlterieurs).toBeUndefined();
    });

    it('sans cours ou sans trimestre, rien n\'est écrit', () => {
        const b = banc();
        expect(b.api.ajouter(DA, { cours: '  ', trimestre: 'H2026', note: '70' }).ok).toBe(false);
        expect(b.api.ajouter(DA, { cours: '601-102-MQ', trimestre: '', note: '70' }).ok).toBe(false);
        expect(b.api.ajouter('', { cours: '601-102-MQ', trimestre: 'H2026', note: '70' }).ok).toBe(false);
        expect(b.journal).toEqual([]);
    });
});

describe('#913 — retirer un résultat', () => {
    it('retire celui qu\'on vise et garde les autres ; le dernier retiré emporte l\'entrée de l\'élève', () => {
        const store = storeBase();
        store.a2024_resultatsUlterieurs = {
            [DA]: [{ cours: '601-102-MQ', trimestre: 'H2026', note: 78 }, { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }],
            '2000002': [{ cours: '601-102-MQ', trimestre: 'H2026', note: 51 }]
        };
        const b = banc(store);
        expect(b.api.retirer(DA, 0)).toEqual({ ok: true });
        expect(b.store.a2024_resultatsUlterieurs[DA]).toEqual([{ cours: '601-103-MQ', trimestre: 'A2026', note: 64 }]);
        expect(b.api.retirer(DA, 0)).toEqual({ ok: true });
        expect(b.store.a2024_resultatsUlterieurs).toEqual({ '2000002': [{ cours: '601-102-MQ', trimestre: 'H2026', note: 51 }] });
    });

    it('un rang qui n\'existe pas n\'écrit rien', () => {
        const b = banc();
        expect(b.api.retirer(DA, 0).ok).toBe(false);
        expect(b.api.retirer(DA, -1).ok).toBe(false);
        expect(b.journal).toEqual([]);
    });
});

describe('#913 — trimestre archivé : rien ne s\'écrit sans la permission d\'écriture', () => {
    const depart = () => Object.assign(storeBase(), { a2024_resultatsUlterieurs: { [DA]: [{ cours: '601-102-MQ', trimestre: 'H2026', note: 78 }] } });

    it('sans la case : ajout ET retrait refusés, le stock identique octet pour octet, et l\'écran dit quoi faire', () => {
        const b = banc(depart(), { archive: true });
        const avant = JSON.stringify(b.store);
        const ajout = b.api.ajouter(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' });
        const retrait = b.api.retirer(DA, 0);
        expect(ajout).toEqual({ ok: false, refus: b.mots.refusArchive });
        expect(retrait).toEqual({ ok: false, refus: b.mots.refusArchive });
        expect(JSON.stringify(b.store)).toBe(avant);
        expect(b.journal).toEqual([]);
        // La phrase nomme la case telle que le bandeau l'écrit (index.html).
        expect(b.mots.refusArchive).toContain('Permission d\'écriture');
        expect(lire('index.html')).toMatch(/id="checkbox-ecriture-temp"[\s\S]{0,200}Permission d'écriture/);
    });

    it('avec la case (body.mode-ecriture-temp) : l\'écriture passe', () => {
        const b = banc(depart(), { archive: true });
        b.document.body.classList.add('mode-ecriture-temp');
        expect(b.api.ajouter(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' })).toEqual({ ok: true });
        expect(b.store.a2024_resultatsUlterieurs[DA]).toHaveLength(2);
    });

    it('le rendu, lui, n\'écrit jamais rien', () => {
        const b = banc(depart(), { archive: true });
        b.win.afficherResultatsUlterieurs(b.store.test_groupeEtudiants);
        expect(b.journal).toEqual([]);
    });
});

describe('#913 — le rendu', () => {
    it('« Cours » et « Trimestre », textes libres, sont échappés', () => {
        const store = storeBase();
        store.a2024_resultatsUlterieurs = { [DA]: [{ cours: '<img src=x onerror=alert(1)>', trimestre: '"><script>x</script>', note: 70 }] };
        const b = banc(store);
        b.win.afficherResultatsUlterieurs(store.test_groupeEtudiants);
        const html = b.elements['resultats-ulterieurs-liste'].innerHTML;
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(html).not.toContain('<img');
        expect(html).not.toContain('<script');
    });

    it('une ligne par élève de la liste reçue, ses résultats dessous, la note à la virgule', () => {
        const store = storeBase();
        store.a2024_resultatsUlterieurs = { [DA]: [{ cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 }] };
        const b = banc(store);
        b.win.afficherResultatsUlterieurs(store.test_groupeEtudiants.slice(0, 3));
        const html = b.elements['resultats-ulterieurs-liste'].innerHTML;
        expect(html.match(/class="ru-eleve"/g)).toHaveLength(3);
        expect(html.match(/class="ru-resultat"/g)).toHaveLength(1);
        expect(html).toContain('601-102-MQ · H2026 · <strong>78,5</strong>');
        // Zéro handler inline : les gestes passent par le dispatcher de main.js.
        expect(html).not.toMatch(/\son[a-z]+=/);
        expect(html).toContain('data-action="ajouterResultatUlterieur"');
        expect(html).toContain('data-action="retirerResultatUlterieur"');
    });

    it('les champs de saisie ne portent pas un id « v2- » : ce préfixe les sortirait du verrou CSS du mode archive', () => {
        expect(lire('js/resultats-ulterieurs.js')).not.toMatch(/id="v2-/);
    });
});

/* ---------- L'export de recherche : le VRAI exporterFormatRecherche, et le fichier qu'il fabrique ---------- */

const ELEVES = [
    { da: '2000001', nom: 'Tremblay-Banc', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
    { da: '2000002', nom: 'Gagnon-Banc', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut: 'actif' }
];

async function exporter(resultats) {
    const store = storeBase();
    store.trimestres = [{ id: 'test', nom: 'Automne banc', session: 'A', annee: 2025, actif: true }];
    store.cours = [{ id: 'GC1', sigle: '601-101', titre: 'Cours banc', groupe: '01', actif: true }];
    store.test_groupeEtudiants = ELEVES;
    store.test_snapshots = { hebdomadaires: [], interventions: [] };
    if (resultats) store.test_resultatsUlterieurs = resultats;
    const blobs = [];
    function Blob(parts) { blobs.push(parts.join('')); }
    const b = monter(store, {
        modules: ['js/indices.js', 'js/trimestres.js'],
        globaux: { Blob, URL: { createObjectURL: () => 'blob:banc', revokeObjectURL() {} }, crypto: globalThis.crypto, TextEncoder }
    });
    try {
        const issue = await b.win.exporterFormatRecherche({ cleSecrete: 'CLE-DE-BANC-0123456789abcdefghij' });
        expect(issue, JSON.stringify(issue)).toMatchObject({ success: true });
        const fichier = JSON.parse(blobs[0]);
        const table = JSON.parse(blobs[1]);
        const parDA = Object.fromEntries(fichier.observations.etudiants.map((e) => [table.correspondances[e.id_anonyme], e]));
        return { texte: blobs[0], fichier, table, parDA };
    } finally {
        b.restaurerHorloge();
    }
}

describe('#913 — la sortie dans l\'export de recherche', () => {
    const RESULTATS = { '2000001': [
        { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5, intrus: 'ne voyage pas' },
        { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
    ] };

    it('les résultats sortent sous le BON élève anonymisé, trois champs recopiés, rien d\'autre', async () => {
        const { parDA } = await exporter(RESULTATS);
        expect(parDA['2000001'].resultats_ulterieurs).toEqual([
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 },
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
        ]);
    });

    it('un élève sans résultat sort avec une liste vide, jamais avec un champ absent', async () => {
        const { parDA, fichier } = await exporter(RESULTATS);
        expect(parDA['2000002'].resultats_ulterieurs).toEqual([]);
        const sans = await exporter(null);
        for (const e of sans.fichier.observations.etudiants) expect(e.resultats_ulterieurs).toEqual([]);
        for (const e of fichier.observations.etudiants) expect(Object.keys(e)).toContain('resultats_ulterieurs');
    });

    it('version_format passe à 1.2', async () => {
        expect((await exporter(RESULTATS)).fichier.meta.version_format).toBe('1.2');
    });

    it('VERROU STRUCTUREL : aucun DA, aucun nom dans le fichier produit', async () => {
        const { texte, table } = await exporter(RESULTATS);
        for (const e of ELEVES) {
            expect(texte, 'DA ' + e.da).not.toContain(e.da);
            expect(texte, 'nom ' + e.nom).not.toContain(e.nom);
            expect(texte, 'prénom ' + e.prenom).not.toContain(e.prenom);
        }
        // Aucune clé du fichier ne ressemble à un DA (la forme rangée est { [da]: … } : elle ne doit pas sortir telle quelle).
        expect(texte).not.toMatch(/"\d{7}"\s*:/);
        expect(Object.values(table.correspondances)).toContain('2000001');
    });
});

describe('#913 — registres et verrous de texte', () => {
    it('la clé est au registre de trimestres.js et à DATA-OWNERSHIP', () => {
        expect(lire('js/trimestres.js')).toMatch(/'resultatsUlterieurs',/);
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/`<trim>_resultatsUlterieurs`/);
    });

    it('un seul écrivain : seuls resultats-ulterieurs.js et trimestres.js nomment la clé dans le dossier js', () => {
        const nomment = [];
        const parcourir = (dossier) => {
            for (const f of readdirSync(path.join(RACINE, dossier), { withFileTypes: true })) {
                const chemin = dossier + '/' + f.name;
                if (f.isDirectory()) parcourir(chemin);
                else if (f.name.endsWith('.js') && /['"`]resultatsUlterieurs['"`]/.test(lire(chemin))) nomment.push(chemin);
            }
        };
        parcourir('js');
        expect(nomment.sort()).toEqual(['js/resultats-ulterieurs.js', 'js/trimestres.js']);
        // trimestres.js LIT (getSync) et inscrit au registre : il n'écrit pas.
        expect(lire('js/trimestres.js')).not.toMatch(/setSync\(cle\('resultatsUlterieurs'\)/);
    });

    it('les mots de l\'écran vivent en UN seul endroit', () => {
        const module = lire('js/resultats-ulterieurs.js');
        expect(module.match(/La note doit être un nombre entre 0 et 100\./g)).toHaveLength(1);
        expect(module.match(/'Résultats ultérieurs'/g)).toHaveLength(1);
        expect(lire('index.html')).not.toContain('La note doit être un nombre');
        expect(lire('js/trimestre-v2-etudiants.js')).not.toContain('Résultats ultérieurs');
    });

    it('aucun console.log, aucun lecteur de fichier dans le module', () => {
        const module = lire('js/resultats-ulterieurs.js');
        expect(module).not.toMatch(/console\.log/);
        expect(module).not.toMatch(/FileReader|type="file"/);
    });
});
