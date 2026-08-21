import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// CT-04 (audit Cadre du trimestre, 20 août 2026) — la fusion des entités
// horaire vers `horaireHebdo` dédupliquait par JOUR seul. Cas reproduit à
// l'écran dans a2026 : « Mar-Jeu » (groupe 00001, Mardi 10:00 + Jeudi 14:00) et
// « Mar-soir » (groupe 00002, Mardi 18:00) produisaient [Mardi 10:00,
// Jeudi 14:00]. La séance du mardi soir n'atteignait ni le calendrier ni la
// saisie des présences, qui sont les deux lecteurs de horaireHebdo.
//
// Le calcul vivait en TROIS copies (trimestre-v2-horaires.js sauvegarde +
// suppression, trimestre.js genererCalendrierComplet) ; il vit désormais dans
// js/horaire-fusion.js. Ces cas gardent la fonction unique.

const win = chargerScript('js/horaire-fusion.js');
const { fusionnerSeancesHoraires } = win;

const creneaux = (seances) => seances.map(s => `${s.jour} ${s.heureDebut || s.debut || ''}`.trim());

describe('CT-04 · fusionnerSeancesHoraires · deux séances le même jour', () => {
    it('LE CAS DE L\'AUDIT : deux groupes le mardi à des heures différentes → les DEUX séances', () => {
        const horaires = [
            { id: 'HOR_1', nom: 'Mar-Jeu', seances: [
                { jour: 'Mardi', heureDebut: '10:00' },
                { jour: 'Jeudi', heureDebut: '14:00' }
            ] },
            { id: 'HOR_2', nom: 'Mar-soir', seances: [
                { jour: 'Mardi', heureDebut: '18:00' }
            ] }
        ];

        expect(creneaux(fusionnerSeancesHoraires(horaires)))
            .toEqual(['Mardi 10:00', 'Jeudi 14:00', 'Mardi 18:00']);
    });

    it('même jour ET même heure → une seule entrée (le calendrier n\'affiche qu\'un créneau)', () => {
        const horaires = [
            { seances: [{ jour: 'Mardi', heureDebut: '10:00', local: 'A-101' }] },
            { seances: [{ jour: 'Mardi', heureDebut: '10:00', local: 'B-202' }] }
        ];

        const resultat = fusionnerSeancesHoraires(horaires);
        expect(resultat).toHaveLength(1);
        // premier arrivé, premier gardé
        expect(resultat[0].local).toBe('A-101');
    });

    it('la casse et les espaces du jour ne créent pas de doublon', () => {
        const horaires = [
            { seances: [{ jour: 'Mardi', heureDebut: '10:00' }] },
            { seances: [{ jour: '  MARDI ', heureDebut: '10:00' }] }
        ];

        expect(fusionnerSeancesHoraires(horaires)).toHaveLength(1);
    });
});

describe('CT-04 · fusionnerSeancesHoraires · robustesse', () => {
    it('une séance sans jour est écartée au lieu de faire planter la fusion', () => {
        // L'ancien code appelait s.jour.toLowerCase() sans garde : une séance
        // incomplète (import, saisie interrompue) emportait tout le calendrier.
        const horaires = [
            { seances: [
                { heureDebut: '08:00' },
                { jour: null, heureDebut: '09:00' },
                { jour: '', heureDebut: '09:30' },
                { jour: 'Lundi', heureDebut: '10:00' }
            ] }
        ];

        expect(creneaux(fusionnerSeancesHoraires(horaires))).toEqual(['Lundi 10:00']);
    });

    it('accepte le champ ancien `debut` comme heure', () => {
        const horaires = [
            { seances: [
                { jour: 'Lundi', debut: '08:00' },
                { jour: 'Lundi', debut: '13:00' }
            ] }
        ];

        expect(fusionnerSeancesHoraires(horaires)).toHaveLength(2);
    });

    it('horaire sans séances, séances non-tableau, entrées nulles : rien ne plante', () => {
        const horaires = [
            null,
            {},
            { seances: null },
            { seances: 'Mardi' },
            { seances: [null, { jour: 'Vendredi', heureDebut: '09:00' }] }
        ];

        expect(creneaux(fusionnerSeancesHoraires(horaires))).toEqual(['Vendredi 09:00']);
    });

    it('entrée non-tableau → tableau vide, jamais d\'exception', () => {
        expect(fusionnerSeancesHoraires(undefined)).toEqual([]);
        expect(fusionnerSeancesHoraires(null)).toEqual([]);
        expect(fusionnerSeancesHoraires('horaires')).toEqual([]);
        expect(fusionnerSeancesHoraires([])).toEqual([]);
    });

    it('la fonction est PURE : les objets séance sont rendus tels quels, les entrées intactes', () => {
        const seance = { jour: 'Mardi', heureDebut: '10:00' };
        const horaires = [{ seances: [seance] }];

        const resultat = fusionnerSeancesHoraires(horaires);
        expect(resultat[0]).toBe(seance);
        expect(horaires[0].seances).toHaveLength(1);
    });
});

describe('CT-04 · les trois copies du calcul sont retirées', () => {
    it('aucun site ne déduplique plus par jour seul', async () => {
        // Sentinelle zéro-dette : le motif `joursDejaVus` était le calcul
        // dupliqué dans trimestre-v2-horaires.js (×2) et trimestre.js (×1).
        // S'il réapparaît, la correction CT-04 a été contournée quelque part.
        const { execFileSync } = await import('node:child_process');
        const path = await import('node:path');
        const { fileURLToPath } = await import('node:url');
        const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

        const sortie = execFileSync('bash', ['-c',
            'grep -rn "joursDejaVus" js/ --include="*.js" | grep -v "_archives" || true'
        ], { encoding: 'utf8', cwd: racineProjet }).trim();

        expect(
            sortie,
            `Dédup par jour seul réintroduite (CT-04) :\n${sortie}\n` +
            `Fix : passer par fusionnerSeancesHoraires() (js/horaire-fusion.js).`
        ).toBe('');
    });
});
