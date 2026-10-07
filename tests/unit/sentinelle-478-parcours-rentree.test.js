import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #478 — le parcours de rentrée (CT-28 b et c), 13 sept. 2026
// =======================================================================
//
// Le comportement est tenu dans un vrai navigateur par
// tests/integration/parcours-rentree-478.spec.js. Cette sentinelle-ci tient les
// trois ancrages au niveau du texte, parce que le hook pre-push ne lance QUE
// Vitest : une régression y rougit avant de partir, pas au verdict suivant.
//
//   A. le rafraîchisseur de « Groupe associé » est EXPORTÉ sur window. Le module
//      des étudiant·es l'appelait déjà, par son nom nu, derrière un typeof ; sans
//      export, ce nom n'existait pas hors de l'IIFE des horaires et l'appel n'a
//      jamais tourné. Exporté, le nom nu se résout sur window (break-test du
//      13 sept. : réécrire l'appel en `window.` ne change rien au navigateur) —
//      c'est donc l'EXPORT qui est verrouillé, et la présence de l'appel ;
//   B. le refus d'un menu VIDE porte les mots approuvés par Grégoire, mot pour
//      mot, et nomme l'accordéon tel qu'index.html l'affiche ;
//   C. la question « Veux-tu l'activer immédiatement ? » n'est posée que s'il
//      existe un trimestre actif à désactiver.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (rel) => fs.readFileSync(path.join(racine, rel), 'utf8');

const horaires = lire('js/trimestre-v2-horaires.js');
const etudiants = lire('js/trimestre-v2-etudiants.js');
const liste = lire('js/trimestre-v2-liste.js');
const index = lire('index.html');

function corpsDe(source, nomFonction) {
    const debut = source.indexOf(`function ${nomFonction}(`);
    expect(debut, `fonction ${nomFonction} introuvable`).toBeGreaterThan(-1);
    const suite = source.indexOf('\nfunction ', debut + 10);
    return source.slice(debut, suite === -1 ? undefined : suite);
}

describe('#478 A — « Groupe associé » se rafraîchit après un ajout d\'étudiant·e', () => {
    it('le rafraîchisseur est exporté sur window par le module des horaires', () => {
        expect(horaires).toMatch(/^window\.populerDropdownGroupesHoraireV2\s*=\s*populerDropdownGroupesHoraireV2;/m);
    });

    it('le module des étudiant·es l\'appelle à chaque rechargement de la liste', () => {
        const corps = corpsDe(etudiants, 'chargerListeEtudiantsV2');
        expect(corps).toMatch(/populerDropdownGroupesHoraireV2\(tousLesEtudiants\);/);
    });
});

describe('#478 B — le refus d\'un menu vide dit où naît un groupe', () => {
    const corps = corpsDe(horaires, 'sauvegarderHoraireV2');

    it('porte les mots approuvés, titre et détail — LE GESTE D\'ABORD', () => {
        // ↻ Lot E2 (28 sept. 2026) : les mêmes phrases, dans le même ordre, par le témoin commun
        // (« Non enregistré – Créer l'horaire : … », qui reste affiché) — le titre suivi d'un point.
        expect(corps).toContain('\'Aucun groupe d\\\'étudiant·es pour l\\\'instant. \'');
        const geste = '\'Ajoute ou importe ta liste dans l\\\'accordéon « Groupe d\\\'étudiant·es », juste au-dessus. \'';
        const explication = '\'Un groupe apparaît dans ce menu dès qu\\\'un·e étudiant·e y est inscrit·e.\'';
        expect(corps).toContain(geste);
        expect(corps).toContain(explication);
        // Porte 2.3b (13 sept. 2026) : la bulle disparaît après la PREMIÈRE phrase ; dans l'ordre
        // inverse, l'accordéon — la seule information ajoutée — n'était jamais lu.
        expect(corps.indexOf(geste), 'le geste doit précéder l\'explication').toBeLessThan(corps.indexOf(explication));
    });

    it('le message se choisit sur ce que le menu OFFRE : vide ⇒ les mots neufs', () => {
        expect(corps).toContain('const aucunGroupe = !selectGroupe || !Array.from(selectGroupe.options).some(o => o.value);');
        expect(corps).toMatch(/if \(aucunGroupe\) \{\s*return _refuserHoraireV2\(\s*'Aucun groupe d\\'étudiant·es/);
    });

    it('l\'accordéon nommé existe à l\'écran sous ce libellé exact', () => {
        expect(index).toMatch(/id="accordeon-groupe-etudiants"[\s\S]{0,400}<\/span> Groupe d'étudiant·es\s*<\/h3>/);
    });

    it('menu garni sans choix : le refus d\'avant est conservé (lot E2 : par le témoin, au tutoiement)', () => {
        expect(corps).toContain('_refuserHoraireV2(\'Choisis le groupe associé.\', geste)');
        expect(corps).not.toContain('Veuillez');
    });
});

describe('#478 C — le premier trimestre d\'un poste est actif', () => {
    // ↻ #975 (7 oct. 2026) : l'ancien chemin (prompt, confirm « l'activer ? ») est retiré ; la
    // création passe par « Créer le trimestre » (lot E2), qui active toujours ce qu'il crée.
    it('« Créer le trimestre » active ce qu\'il crée ; plus aucune question d\'activation', () => {
        const init = lire('js/trimestre-v2-init.js');
        const corps = corpsDe(init, 'creerTrimestreV2');
        expect(corps).toMatch(/trimestres\.forEach\(t => t\.actif = false\);\s*trimestres\.push\(\{[\s\S]*?actif: true\s*\}\);/);
        expect(corps).not.toContain('confirm(');
        expect(liste).not.toContain('function ouvrirModalNouveauTrimestre');
    });
});
