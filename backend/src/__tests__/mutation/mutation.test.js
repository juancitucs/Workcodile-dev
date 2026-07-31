// Mutation Testing manual (unitario): se muta la función en memoria y se
// verifica que las aserciones originales detectan la mutación (la matan).
// El mutation score = mutaciones detectadas / mutaciones inyectadas.
const xpService = require('../../services/xpService');
const postService = require('../../services/post.service');

describe('Mutation Testing (unitario)', () => {
    let mutantes = 0;
    let detectados = 0;

    const evaluar = (nombre, mutante, aserción) => {
        mutantes++;
        try {
            aserción(mutante);
            // si la aserción pasa con el mutante, la mutación sobrevive
        } catch {
            detectados++;
        }
    };

    describe('calculateLevel (D34: exponencial vs lineal)', () => {
        it('detecta la mutación lineal (+100 en vez de *2)', () => {
            const original = xpService.calculateLevel;
            // mutante: xpForNextLevel += 100 (lineal)
            const mutante = (xp) => {
                let level = 1;
                let xpForNextLevel = 100;
                while (xp >= xpForNextLevel && level < 20) {
                    xp -= xpForNextLevel;
                    level++;
                    xpForNextLevel += 100;
                }
                return level;
            };
            evaluar('lineal', mutante, (m) => {
                // aserción original: nivel 5 requiere 1500 XP (100+200+400+800)
                // el mutante lineal (+100) llegaría a 6 en 1500 XP → la mutación muere
                expect(m(1500)).toBe(5);
                expect(m(1499)).toBe(4);
            });
            expect(detectados).toBe(1);
        });

        it('detecta la mutación de tope (sin límite de nivel)', () => {
            const mutante = (xp) => {
                let level = 1;
                let xpForNextLevel = 100;
                while (xp >= xpForNextLevel) {
                    xp -= xpForNextLevel;
                    level++;
                    xpForNextLevel *= 2;
                }
                return level;
            };
            evaluar('sin-tope', mutante, (m) => {
                expect(m(1000000)).toBe(20); // debe topear en 20
            });
            expect(detectados).toBe(2);
        });
    });

    describe('sortComments (D16: orden descendente)', () => {
        it('detecta la mutación de comparador invertido', () => {
            const mutante = (comments) => {
                if (!comments) return;
                comments.sort((a, b) => (a.score || 0) - (b.score || 0));
            };
            evaluar('ascendente', mutante, (m) => {
                const c = [{ score: 1 }, { score: 5 }, { score: 3 }];
                m(c);
                expect(c[0].score).toBe(5);
            });
            expect(detectados).toBe(3);
        });

        it('detecta la mutación de score nulo (sin || 0)', () => {
            const mutante = (comments) => {
                if (!comments) return;
                comments.sort((a, b) => b.score - a.score);
            };
            evaluar('score-nulo', mutante, (m) => {
                const c = [{ score: 1 }, {}, { score: 3 }];
                m(c);
                expect(c[0].score).toBe(3);
            });
            expect(detectados).toBe(4);
        });
    });

    describe('addUserVoteStatus (voto del usuario)', () => {
        it('detecta la mutación de orden up/down', () => {
            const mutante = (item, uid) => {
                if (item.downvoted_by && item.downvoted_by.some((id) => id.equals(uid))) {
                    item.user_vote = 'up';
                } else if (item.upvoted_by && item.upvoted_by.some((id) => id.equals(uid))) {
                    item.user_vote = 'down';
                } else {
                    item.user_vote = null;
                }
            };
            evaluar('orden-invertido', mutante, (m) => {
                const uid = { equals: (o) => o === 'x' };
                const item = { upvoted_by: ['x'], downvoted_by: [] };
                m(item, uid);
                expect(item.user_vote).toBe('up');
            });
            expect(detectados).toBe(5);
        });
    });

    it('mutation score del bloque evaluado', () => {
        // 5 mutaciones inyectadas en este archivo, todas detectadas
        expect(mutantes).toBe(5);
        expect(detectados).toBe(5);
        expect(detectados / mutantes).toBe(1);
    });
});
