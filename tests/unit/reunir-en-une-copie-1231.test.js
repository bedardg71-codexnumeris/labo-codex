import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1231 (5 nov. 2026) — RÉUNIR PLUSIEURS FICHIERS EN UNE COPIE AVANT L'IMPORT.
// Vécu par Grégoire : trois photos d'une reprise, sans DA dans leur nom, l'élève et le
// jeton choisis dans l'inspecteur → trois copies séparées, une seule rattachée à
// l'évaluation de reprise. Le regroupement ne se décidait qu'au dépôt, par le nom.
// Ce banc verrouille le geste qui pose la clé (`reunirEnUneCopie`) et ce qui doit lui
// survivre : le rechargement de la file, l'ordre réglé aux flèches, la détection des
// doublons, les flèches elles-mêmes. Noms fictifs (règle 6).
//
// Break-tests faits avant de lui faire confiance :
//   1. restauration : remettre `(d.groupeDocumentId && cleDocumentLea(d.parseLea)) || …`
//      sans la branche `estCopieReunie` → « survit au rechargement » rougit.
//   2. `regrouperParDocument` : retirer le `return` des copies réunies → « l'ordre des
//      flèches » rougit (le tri par numéro de page Léa reprend la main). ↻ Lot « d'un seul
//      tenant » (10 nov. 2026) : ce tri est parti de `regrouperParDocument` (la liste fait
//      foi, pour toutes les productions) ; le break-test équivalent est dans
//      import-productions-d-un-tenant.test.js.
//   3. `detecterDoublonsStockage` : retirer le saut des fichiers suivants d'une copie →
//      « une copie, un doublon » rougit (3 au lieu de 1).

const ETUDIANTS = [
    { da: '9000058', nom: 'Exemple', prenom: 'Alma' },
    { da: '9000582', nom: 'Essai', prenom: 'Aria' }
];
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

function faireFichier(nom) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 10, 5, 10, 0, 0);
    return blob;
}

/** Un sessionStorage partagé entre deux chargements : c'est le rechargement de la page. */
function stockageDeSession() {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => { m.set(k, String(v)); },
        removeItem: (k) => { m.delete(k); },
        clear: () => m.clear(),
        key: (i) => Array.from(m.keys())[i] ?? null,
        get length() { return m.size; }
    };
}

let magasin;

function monter(sessionStorage) {
    const travauxStockage = {
        obtenirFichiersGroupeActif: () => magasin,
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {}
    };
    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        travauxStockage,
        sessionStorage,
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
}

let session, win, ti;

beforeEach(() => {
    magasin = [];
    session = stockageDeSession();
    win = monter(session);
    ti = win.travauxImport;
});

describe('#1231 — « Réunir en une copie » pose une clé et une identité sur toute la copie', () => {
    it('trois photos dispersées deviennent une copie contiguë, à la place de la première, dans leur ordre', () => {
        ti.ajouterFichiersEnAttente(['IMG_8848.pdf', 'Exemple_9000058_autre.pdf', 'IMG_8849.pdf', 'IMG_8850.pdf'].map(faireFichier));
        const file = ti.obtenirFileDAttente();
        expect(file.map((f) => f.groupeDocumentId)).toEqual(['', '9000058_auto', '', '']);

        const r = ti.reunirEnUneCopie([0, 2, 3]);
        expect(r).toMatchObject({ debut: 0, nombre: 3 });
        expect(file.map((f) => f.nomFichier)).toEqual(['IMG_8848.pdf', 'IMG_8849.pdf', 'IMG_8850.pdf', 'Exemple_9000058_autre.pdf']);
        const cles = new Set(file.slice(0, 3).map((f) => f.groupeDocumentId));
        expect(cles.size).toBe(1);
        expect(ti.estCopieReunie([...cles][0])).toBe(true);
        expect(file[3].groupeDocumentId).toBe('9000058_auto');
    });

    it('l\'élève et le jeton posés sur un seul fichier passent à toute la copie', () => {
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf', 'IMG_3.pdf'].map(faireFichier));
        const file = ti.obtenirFileDAttente();
        Object.assign(file[1], { etudiantDA: '9000582', etudiantAssocie: ETUDIANTS[1] });
        Object.assign(file[2], { estReprise: true, productionId: 'prod_a6' });

        ti.reunirEnUneCopie([0, 1, 2]);
        file.forEach((f) => {
            expect(f.etudiantDA).toBe('9000582');
            expect(f.estReprise).toBe(true);
            expect(f.productionId).toBe('prod_a6');
        });
    });

    it('écrire sur un fichier d\'une copie écrit sur toute la copie (un groupe = un élève, jamais deux)', () => {
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf', 'IMG_seul.pdf'].map(faireFichier));
        ti.reunirEnUneCopie([0, 1]);
        const indices = ti.ecrireSurLaCopie(1, { etudiantDA: '9000058' });
        expect(indices).toEqual([0, 1]);
        const file = ti.obtenirFileDAttente();
        expect(file.map((f) => f.etudiantDA || '')).toEqual(['9000058', '9000058', '']);
    });

    // ↻ Lot « d'un seul tenant » (10 nov. 2026, règle B acceptée par Grégoire) : cet essai
    // verrouillait l'ancienne règle, « cocher un fichier d'une copie Léa l'emmène entière ».
    // C'est elle qui rendait « Réunir » sans effet quand on cochait deux pages d'une
    // production pour les en séparer. « Réunir » prend maintenant exactement les cochées.
    it('cocher une page d\'une production Léa la détache : seules les pages cochées sont réunies', () => {
        ti.ajouterFichiersEnAttente([
            'Exemple_9000058_Artefact-6-p1_Remis_le_2026-11-05_09h00m00s.pdf',
            'Exemple_9000058_Artefact-6-p2_Remis_le_2026-11-05_09h00m05s.pdf',
            'IMG_photo.pdf'
        ].map(faireFichier));
        ti.reunirEnUneCopie([1, 2]);
        const file = ti.obtenirFileDAttente();
        expect(file[0].groupeDocumentId).toBe('9000058_Artefact-6');
        expect(file[1].groupeDocumentId).toBe(file[2].groupeDocumentId);
        expect(ti.estCopieReunie(file[1].groupeDocumentId)).toBe(true);
    });

    it('moins de deux fichiers : rien ne se passe', () => {
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf'].map(faireFichier));
        expect(ti.reunirEnUneCopie([1])).toBeNull();
        expect(ti.obtenirFileDAttente().every((f) => !f.groupeDocumentId)).toBe(true);
    });
});

describe('#1231 — la copie réunie survit au rechargement de la file', () => {
    it('même quand un de ses fichiers porte un nom Léa complet (travaux-import.js, restauration)', () => {
        ti.ajouterFichiersEnAttente([
            'IMG_8848.pdf',
            'Exemple_9000058_Artefact-6_Remis_le_2026-11-05_09h00m00s.pdf',
            'IMG_8850.pdf'
        ].map(faireFichier));
        ti.reunirEnUneCopie([0, 1, 2]);
        ti.ecrireSurLaCopie(0, { estReprise: true, productionId: 'prod_a6' });
        const cle = ti.obtenirFileDAttente()[0].groupeDocumentId;

        const apres = monter(session).travauxImport.obtenirFileDAttente();
        expect(apres.map((f) => f.nomFichier)).toEqual([
            'IMG_8848.pdf', 'Exemple_9000058_Artefact-6_Remis_le_2026-11-05_09h00m00s.pdf', 'IMG_8850.pdf'
        ]);
        expect(apres.map((f) => f.groupeDocumentId)).toEqual([cle, cle, cle]);
        expect(apres.every((f) => f.estReprise && f.productionId === 'prod_a6')).toBe(true);
        expect(apres.every((f) => f.etudiantDA === '9000058')).toBe(true);
    });

    it('« Défaire le regroupement » d\'un groupe Léa reste défait… et une clé Léa se recalcule toujours (#876)', () => {
        ti.ajouterFichiersEnAttente([
            'Exemple_9000058_Artefact-6-p1_Remis_le_2026-11-05_09h00m00s.pdf',
            'Exemple_9000058_Artefact-6-p2_Remis_le_2026-11-05_09h00m05s.pdf'
        ].map(faireFichier));
        const apres = monter(session).travauxImport.obtenirFileDAttente();
        expect(apres[0].groupeDocumentId).toBe(apres[1].groupeDocumentId);
        expect(apres[0].groupeDocumentId).toBe('9000058_Artefact-6');
    });
});

describe('#1231 — l\'ordre des pages est celui des flèches', () => {
    // ↻ Lot « d'un seul tenant » (10 nov. 2026) : l'essai réunissait les deux pages d'une
    // production Léa ; elles forment déjà une production entière, et la règle B laisse alors
    // tout en place. Il réunit maintenant ces deux pages et une photo.
    it('une copie réunie garde l\'ordre de la file, même contre les numéros de page Léa', () => {
        ti.ajouterFichiersEnAttente([
            'Exemple_9000058_Artefact-6-p2_Remis_le_2026-11-05_09h00m05s.pdf',
            'Exemple_9000058_Artefact-6-p1_Remis_le_2026-11-05_09h00m00s.pdf',
            'IMG_photo.pdf'
        ].map(faireFichier));
        // Au dépôt, la production Léa se range par page : p1, p2.
        const lea = [...ti.regrouperParDocument().values()][0].map((f) => f.nomFichier);
        expect(lea[0]).toContain('-p1_');

        ti.reunirEnUneCopie([0, 1, 2]);
        ti.monterFichier(1);   // p2 passe devant p1, dans la copie
        const copie = [...ti.regrouperParDocument().values()][0].map((f) => f.nomFichier);
        expect(copie[0]).toContain('-p2_');
        expect(copie[1]).toContain('-p1_');
        expect(copie[2]).toBe('IMG_photo.pdf');
    });

    it('une page ne sort pas de sa copie par les flèches ; un fichier seul saute la copie entière', () => {
        ti.ajouterFichiersEnAttente(['A.pdf', 'B.pdf', 'C.pdf', 'seul.pdf'].map(faireFichier));
        ti.reunirEnUneCopie([0, 1, 2]);
        const file = ti.obtenirFileDAttente();
        const noms = () => file.map((f) => f.nomFichier);

        expect(ti.descendreFichier(2)).toBeUndefined();           // C au bas de sa copie
        expect(noms()).toEqual(['A.pdf', 'B.pdf', 'C.pdf', 'seul.pdf']);
        expect(ti.monterFichier(2)).toBe(1);                       // C monte DANS sa copie
        expect(noms()).toEqual(['A.pdf', 'C.pdf', 'B.pdf', 'seul.pdf']);
        expect(ti.monterFichier(3)).toBe(0);                       // « seul » saute la copie
        expect(noms()).toEqual(['seul.pdf', 'A.pdf', 'C.pdf', 'B.pdf']);
        expect(ti.descendreFichier(0)).toBe(3);                    // et redescend d'un bond
        expect(noms()).toEqual(['A.pdf', 'C.pdf', 'B.pdf', 'seul.pdf']);
    });
});

describe('#1231 — à la confirmation, une copie réunie n\'est jamais annoncée en doublons', () => {
    it('une reprise en trois fichiers : aucun doublon (ni contre l\'original, ni entre ses pages)', () => {
        magasin.push({ id: 'ft_orig', etudiantDA: '9000058', productionId: 'prod_a6', nomFichier: 'original.pdf' });
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf', 'IMG_3.pdf'].map(faireFichier));
        ti.reunirEnUneCopie([0, 1, 2]);
        ti.ecrireSurLaCopie(0, { etudiantDA: '9000058', estReprise: true, productionId: 'prod_a6' });
        expect(ti.detecterDoublonsStockage()).toEqual([]);
    });

    it('une copie habituelle déjà importée : UN doublon pour la copie, pas un par page', () => {
        magasin.push({ id: 'ft_orig', etudiantDA: '9000058', productionId: 'prod_a6', nomFichier: 'original.pdf' });
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf', 'IMG_3.pdf'].map(faireFichier));
        ti.reunirEnUneCopie([0, 1, 2]);
        ti.ecrireSurLaCopie(0, { etudiantDA: '9000058', productionId: 'prod_a6' });
        const d = ti.detecterDoublonsStockage();
        expect(d).toHaveLength(1);
        expect(d[0].idxNouveau).toBe(0);
    });

    it('trois photos SANS réunion, même élève et même production : toujours annoncées (le défaut vécu)', () => {
        ti.ajouterFichiersEnAttente(['IMG_1.pdf', 'IMG_2.pdf', 'IMG_3.pdf'].map(faireFichier));
        ti.obtenirFileDAttente().forEach((f) => Object.assign(f, { etudiantDA: '9000058', productionId: 'prod_a6' }));
        expect(ti.detecterDoublonsStockage()).toHaveLength(2);
    });
});
