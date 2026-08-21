import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// GRILLE IMPRIMABLE DES PRÉSENCES (#485)
// =======================================================================
//
// Cible : construireModeleRapportPresences (js/presences-rapport.js),
// fonction PURE qui transforme (étudiants, séances, présences) en modèle
// de grille « élèves × séances » pour le PDF paysage lettre.
//
// Convention des cases, décidée par Grégoire le 21 août 2026 :
//   present  → ✓ (toutes les périodes de la séance)
//   absent   → ✗ (0 période, saisie faite)
//   partiel  → chiffre (périodes présentes)
//   vide     → aucune saisie : case à remplir au crayon en classe
// =======================================================================

let construire;

const OPTS = { coursId: 'C1', dureePeriode: 55 };

const SEANCES = {
    '2026-01-22': [{ numeroSemaine: 1, nombrePeriodes: 2 }],
    '2026-01-26': [{ numeroSemaine: 1, nombrePeriodes: 2 }],
    '2026-01-29': [{ numeroSemaine: 2, nombrePeriodes: 2 }]
};

const ETUDIANTS = [
    { da: '2222222', nom: 'Bédard', prenom: 'Zoé', coursId: 'C1' },
    { da: '1111111', nom: 'Arseneault', prenom: 'Léo', coursId: 'C1' }
];

beforeAll(() => {
    const fenetre = chargerScript('js/presences-rapport.js');
    construire = fenetre.construireModeleRapportPresences;
});

describe('Colonnes — codes de séances et périodes attendues', () => {
    it('produit un code semaine+rang (1a, 1b, 2a) et la date jj/mm, en ordre chronologique', () => {
        const modele = construire([], SEANCES, [], OPTS);
        expect(modele.colonnes.map(c => c.code)).toEqual(['1a', '1b', '2a']);
        expect(modele.colonnes.map(c => c.jourMois)).toEqual(['22/01', '26/01', '29/01']);
    });

    it('agrège les périodes attendues de toutes les séances du jour (parité obtenirNombrePeriodesSeance)', () => {
        const seances = {
            '2026-02-02': [{ numeroSemaine: 3, nombrePeriodes: 2 }, { numeroSemaine: 3, nombrePeriodes: 2 }],
            '2026-02-05': [{ numeroSemaine: 3, duree: 2 }],   // 2 h × 60 / 55 ≈ 2 périodes
            '2026-02-09': [{ numeroSemaine: 4 }]              // rien de déclaré → défaut 2
        };
        const modele = construire([], seances, [], OPTS);
        expect(modele.colonnes.map(c => c.periodesAttendues)).toEqual([4, 2, 2]);
    });

    it('exclut les dates sans séances et tolère une séance sans numeroSemaine (code vide, date seule)', () => {
        const seances = {
            '2026-01-22': [],
            '2026-01-26': [{ nombrePeriodes: 2 }]
        };
        const modele = construire([], seances, [], OPTS);
        expect(modele.colonnes).toHaveLength(1);
        expect(modele.colonnes[0].code).toBe('');
        expect(modele.colonnes[0].jourMois).toBe('26/01');
    });
});

describe('Cases — les quatre états', () => {
    it('present quand toutes les périodes y sont, absent à 0, partiel sinon, vide sans saisie', () => {
        const presences = [
            { date: '2026-01-22', da: '1111111', periodesPresentes: 2, coursId: 'C1' },
            { date: '2026-01-26', da: '1111111', periodesPresentes: 0, coursId: 'C1' },
            { date: '2026-01-29', da: '1111111', periodesPresentes: 1, coursId: 'C1' }
            // 2222222 : aucune saisie nulle part → trois cases vides
        ];
        const modele = construire(ETUDIANTS, SEANCES, presences, OPTS);

        const ligneLeo = modele.lignes.find(l => l.etudiant.da === '1111111');
        expect(ligneLeo.cellules.map(c => c.etat)).toEqual(['present', 'absent', 'partiel']);
        expect(ligneLeo.cellules[2].texte).toBe('1');
        // Le champ periodes alimente la notation « chiffre » (2 / 1 / 0)
        expect(ligneLeo.cellules.map(c => c.periodes)).toEqual([2, 0, 1]);

        const ligneZoe = modele.lignes.find(l => l.etudiant.da === '2222222');
        expect(ligneZoe.cellules.map(c => c.etat)).toEqual(['vide', 'vide', 'vide']);
    });

    it('reconvertit les saisies legacy en heures seules (avant Beta 95.1)', () => {
        // 1.8333 h × 60 / 55 = 2 périodes → présence complète
        const presences = [
            { date: '2026-01-22', da: '1111111', heures: 1.8333, coursId: 'C1' }
        ];
        const modele = construire(ETUDIANTS, SEANCES, presences, OPTS);
        const ligne = modele.lignes.find(l => l.etudiant.da === '1111111');
        expect(ligne.cellules[0].etat).toBe('present');
    });

    it('ignore les présences facultatives (rattrapages RàI) : la case reste vide', () => {
        const presences = [
            { date: '2026-01-22', da: '1111111', periodesPresentes: 2, coursId: 'C1', facultatif: true }
        ];
        const modele = construire(ETUDIANTS, SEANCES, presences, OPTS);
        const ligne = modele.lignes.find(l => l.etudiant.da === '1111111');
        expect(ligne.cellules[0].etat).toBe('vide');
    });

    it('écarte une présence d’un autre cours, mais apparie quand un des deux coursId manque', () => {
        const presences = [
            { date: '2026-01-22', da: '1111111', periodesPresentes: 2, coursId: 'AUTRE' },
            { date: '2026-01-26', da: '1111111', periodesPresentes: 2 } // sans coursId : legacy, appariée
        ];
        const modele = construire(ETUDIANTS, SEANCES, presences, OPTS);
        const ligne = modele.lignes.find(l => l.etudiant.da === '1111111');
        expect(ligne.cellules[0].etat).toBe('vide');
        expect(ligne.cellules[1].etat).toBe('present');
    });
});

describe('Lignes — tri et intégrité', () => {
    it('trie les étudiants par nom puis prénom, sans modifier le tableau reçu', () => {
        const copie = ETUDIANTS.slice();
        const modele = construire(ETUDIANTS, SEANCES, [], OPTS);
        expect(modele.lignes.map(l => l.etudiant.nom)).toEqual(['Arseneault', 'Bédard']);
        expect(ETUDIANTS).toEqual(copie);
    });

    it('chaque ligne porte exactement une case par colonne', () => {
        const modele = construire(ETUDIANTS, SEANCES, [], OPTS);
        modele.lignes.forEach(l => expect(l.cellules).toHaveLength(modele.colonnes.length));
    });
});
