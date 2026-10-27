import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — #1152, lot 2a de la refonte de l'Aide (27 oct. 2026) : Commencer et Cadre disent l'écran
// d'aujourd'hui, en moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md ; remesure du 27 oct.
// (REMESURE-2026-10-27.md) ; consigne CONSIGNE-LOT-2026-10-27-aide-lot-2a-commencer-cadre.md (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les quatre listes de l'entrée « La bibliothèque » ⟷ la popup 'bibliotheque-fonctionnement', texte validé
//     par Grégoire le 25 oct. (16 h 53), LUE DANS LE MODULE (js/accompagnement-contenu-popup.js exécuté), pas
//     recopiée ici ;
//   · le texte visible de Commencer et du Cadre ⟷ les mots de l'ancien écran ou du jargon (barre latérale,
//     dropdown, Workflow, modal) ;
//   · les entrées des deux parties ⟷ la décision (§2 de la consigne), dans l'ordre ; les quatre absorbées absentes.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

const DEB = html.indexOf('<section id="section-aide"');
const FIN = html.indexOf('fin section-aide');
if (DEB === -1 || FIN === -1) throw new Error('bornes de la section Aide introuvables');
const AIDE = html.slice(DEB, FIN).replace(/<!--[\s\S]*?-->/g, '');

const decoder = (s) => s.replace(/&nbsp;/g, ' ').replace(/&eacute;/g, 'é').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');
const texte = (s) => decoder(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function blocDiv(source, debut) {
    const re = /<div\b|<\/div>/g;
    re.lastIndex = debut;
    let profondeur = 0;
    let m;
    while ((m = re.exec(source))) {
        profondeur += m[0] === '</div>' ? -1 : 1;
        if (profondeur === 0) return source.slice(debut, re.lastIndex);
    }
    throw new Error('div non fermé');
}
function blocParId(id) {
    const i = AIDE.indexOf(`id="${id}"`);
    if (i === -1) return null;
    return blocDiv(AIDE, AIDE.lastIndexOf('<div', i));
}
const entreesDe = (bloc) => [...bloc.matchAll(/id="accordeon-aide-([a-z0-9-]+)"/g)].map((m) => m[1]);

// Côté module : le module des popups exécuté, ses entrées captées à `ajouterEntrees`.
function entreesPopup() {
    let captees = null;
    const window = { accompagnement: { ajouterEntrees: (e) => { captees = e; } } };
    vm.runInNewContext(readFileSync(path.join(racine, 'js/accompagnement-contenu-popup.js'), 'utf8'), { window, console });
    if (!captees) throw new Error('accompagnement-contenu-popup.js n\'a rien passé à ajouterEntrees');
    return captees;
}

const COMMENCER = ['presentation', 'prise-en-main', 'demo', 'modes', 'bibliotheque', 'chaines-etapes', 'preferences'];
const CADRE = ['etapes-config', 'cours', 'horaire', 'etudiants', 'presences-calendrier', 'archivage'];
const ABSORBEES = ['modes-formation', 'trimestre', 'groupe-cours', 'groupe'];

describe('#1152 lot 2a · Commencer et Cadre', () => {
    const commencer = blocParId('aide-commencer');
    const cadre = blocParId('aide-cadre');

    it('les deux parties se découpent', () => {
        expect(commencer).toBeTruthy();
        expect(cadre).toBeTruthy();
        expect(texte(commencer).length).toBeGreaterThan(2000);
        expect(texte(cadre).length).toBeGreaterThan(2000);
    });

    it('Commencer et le Cadre ont les entrées de la décision (§2), dans cet ordre', () => {
        expect(entreesDe(commencer)).toEqual(COMMENCER);
        expect(entreesDe(cadre)).toEqual(CADRE);
    });

    it('les quatre entrées absorbées n\'existent plus nulle part dans la page', () => {
        expect(ABSORBEES.filter((id) => html.includes(`id="accordeon-aide-${id}"`))).toEqual([]);
    });

    it('aucune entrée de Commencer ni du Cadre ne parle de l\'ancien écran ni en jargon', () => {
        const interdits = /sidebar|barre latérale|colonne de gauche|dropdown|workflow|\bmodal(e|es|s)?\b/i;
        const fautives = [...COMMENCER, ...CADRE]
            .map((id) => [id, texte(blocParId(`accordeon-aide-${id}`) || '')])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });
});

describe('#1152 lot 2a · « La bibliothèque » dit le texte validé de la popup, mot pour mot', () => {
    it('les quatre listes de l\'entrée égalent celles de \'bibliotheque-fonctionnement\'', () => {
        const fiche = entreesPopup()['bibliotheque-fonctionnement'].popup;   // `ajouterEntrees` reçoit { cle: { popup } }
        expect(fiche.titre).toBe('Comment fonctionne la bibliothèque');
        const attendu = fiche.sections.filter((s) => s.type === 'liste').map((s) => ({ titre: s.titre, items: s.items }));
        expect(attendu).toHaveLength(4);

        const listes = blocParId('aide-bibliotheque-listes');
        expect(listes).toBeTruthy();
        expect(blocParId('accordeon-aide-bibliotheque')).toContain(listes);
        const lu = [...listes.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<ul>([\s\S]*?)<\/ul>/g)].map((m) => ({
            titre: texte(m[1]),
            items: [...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => texte(li[1])),
        }));
        expect(lu).toEqual(attendu);
    });
});
