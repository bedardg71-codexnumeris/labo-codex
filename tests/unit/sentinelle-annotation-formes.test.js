import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Consigne du 31 oct. 2026, partie H : LA fonction de la vague le long d'un contour fermé, partagée par l'écran et le PDF.
const { annotationFormes: f } = chargerScript('js/annotation-formes.js', {});
const CARRE = [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 300 }, { x: 0, y: 300 }];

describe('pointsVagueContour', () => {
    it('sur un polygone, la vague passe exactement par chaque sommet : les coins restent nets', () => {
        const pts = f.pointsVagueContour(f.contourPolygone(CARRE), 6, 30);
        for (const s of CARRE) {
            expect(pts.some((p) => Math.hypot(p.x - s.x, p.y - s.y) < 0.001)).toBe(true);
        }
    });

    it('elle se referme : le dernier point rejoint le premier, sur le polygone comme sur l’ellipse', () => {
        for (const contour of [f.contourPolygone(CARRE), f.contourEllipse(200, 200, 150, 90)]) {
            const pts = f.pointsVagueContour(contour, 6, 30);
            const a = pts[0], z = pts[pts.length - 1];
            expect(Math.hypot(a.x - z.x, a.y - z.y)).toBeLessThan(0.001);
        }
    });

    it('elle ondule de part et d’autre du contour, sans dépasser son amplitude', () => {
        const cote = f.pointsVagueContour([f.contourPolygone([{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 150, y: 200 }])[0]], 6, 30);
        expect(Math.max(...cote.map((p) => p.y))).toBeCloseTo(6, 0);
        expect(Math.min(...cote.map((p) => p.y))).toBeCloseTo(-6, 0);
        expect(Math.max(...cote.map((p) => Math.abs(p.y)))).toBeLessThanOrEqual(6.0001);
    });

    it('sur l’ellipse, elle reste à l’amplitude près de l’ellipse', () => {
        const pts = f.pointsVagueContour(f.contourEllipse(200, 200, 150, 150), 6, 30);
        expect(pts.length).toBeGreaterThan(100);
        const rayons = pts.map((p) => Math.hypot(p.x - 200, p.y - 200));
        expect(Math.max(...rayons)).toBeCloseTo(156, 0);
        expect(Math.min(...rayons)).toBeCloseTo(144, 0);
    });

    it('un contour sans longueur ne trace rien', () => {
        expect(f.pointsVagueContour(f.contourEllipse(10, 10, 0, 0), 6, 30)).toEqual([]);
    });
});

describe('les mesures du polygone', () => {
    it('distanceAuPolygone : le côté de fermeture compte', () => {
        expect(f.distanceAuPolygone(CARRE, 0, 150)).toBe(0);
        expect(f.distanceAuPolygone(CARRE, 150, 150)).toBe(150);
    });
    it('cadreDesSommets', () => {
        expect(f.cadreDesSommets([{ x: 0.5, y: 0.2 }, { x: 0.1, y: 0.9 }, { x: 0.3, y: 0.4 }])).toEqual({ x1: 0.1, y1: 0.2, x2: 0.5, y2: 0.9 });
    });
});
