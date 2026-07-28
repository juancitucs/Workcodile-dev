const { calculateLevel } = require('../services/xpService')

describe('XP Service', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1)
    })

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2)
    })

    it('should return level 3 for 300 XP (100+200)', () => {
      expect(calculateLevel(300)).toBe(3)
    })

    it('should return level 4 for 700 XP (100+200+400)', () => {
      expect(calculateLevel(700)).toBe(4)
    })

    it('should cap at level 20', () => {
      expect(calculateLevel(99999999)).toBe(20)
    })

    it('should handle level transitions correctly', () => {
      expect(calculateLevel(99)).toBe(1)
      expect(calculateLevel(100)).toBe(2)
      expect(calculateLevel(299)).toBe(2)
      expect(calculateLevel(300)).toBe(3)
    })
  })
})