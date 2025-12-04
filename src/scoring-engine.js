/**
 * Balatro Scoring Engine
 * Implements the core scoring calculations for Balatro poker hands
 */

// Card rank values (for chip calculation)
const RANK_CHIPS = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Base poker hand scores at level 1
const BASE_HANDS = {
  'High Card': { chips: 5, mult: 1, chipsPerLevel: 10, multPerLevel: 1 },
  'Pair': { chips: 10, mult: 2, chipsPerLevel: 15, multPerLevel: 1 },
  'Two Pair': { chips: 20, mult: 2, chipsPerLevel: 20, multPerLevel: 1 },
  'Three of a Kind': { chips: 30, mult: 3, chipsPerLevel: 20, multPerLevel: 2 },
  'Straight': { chips: 30, mult: 4, chipsPerLevel: 30, multPerLevel: 3 },
  'Flush': { chips: 35, mult: 4, chipsPerLevel: 15, multPerLevel: 2 },
  'Full House': { chips: 40, mult: 4, chipsPerLevel: 25, multPerLevel: 2 },
  'Four of a Kind': { chips: 60, mult: 7, chipsPerLevel: 30, multPerLevel: 3 },
  'Straight Flush': { chips: 100, mult: 8, chipsPerLevel: 40, multPerLevel: 3 },
  'Five of a Kind': { chips: 120, mult: 12, chipsPerLevel: 35, multPerLevel: 3 },
  'Flush House': { chips: 140, mult: 14, chipsPerLevel: 40, multPerLevel: 3 },
  'Flush Five': { chips: 160, mult: 16, chipsPerLevel: 40, multPerLevel: 3 }
};

class Card {
  constructor(rank, suit, enhancement = null, seal = null, edition = null) {
    this.rank = rank;
    this.suit = suit;
    this.enhancement = enhancement; // 'Bonus', 'Mult', 'Wild', 'Glass', 'Steel', 'Stone', 'Gold', 'Lucky'
    this.seal = seal; // 'Red', 'Gold', 'Blue', 'Purple'
    this.edition = edition; // 'Foil', 'Holographic', 'Polychrome'
  }

  getChips() {
    let chips = RANK_CHIPS[this.rank];
    
    if (this.enhancement === 'Bonus') chips += 30;
    if (this.enhancement === 'Stone') chips += 50;
    if (this.edition === 'Foil') chips += 50;
    
    return chips;
  }

  getMult() {
    let mult = 0;
    
    if (this.enhancement === 'Mult') mult += 4;
    if (this.edition === 'Holographic') mult += 10;
    
    return mult;
  }

  getXMult() {
    let xMult = 1.0;
    
    if (this.enhancement === 'Glass') xMult *= 2.0;
    if (this.enhancement === 'Steel') xMult *= 1.5;
    if (this.edition === 'Polychrome') xMult *= 1.5;
    
    return xMult;
  }

  toString() {
    let str = `${this.rank}${this.suit}`;
    if (this.enhancement) str += ` [${this.enhancement}]`;
    if (this.edition) str += ` <${this.edition}>`;
    return str;
  }
}

class ScoringEngine {
  constructor() {
    this.handLevels = {
      'High Card': 1,
      'Pair': 1,
      'Two Pair': 1,
      'Three of a Kind': 1,
      'Straight': 1,
      'Flush': 1,
      'Full House': 1,
      'Four of a Kind': 1,
      'Straight Flush': 1,
      'Five of a Kind': 1,
      'Flush House': 1,
      'Flush Five': 1
    };
  }

  setHandLevel(handType, level) {
    this.handLevels[handType] = level;
  }

  identifyHandType(cards) {
    if (cards.length === 0) return 'High Card';
    if (cards.length > 5) cards = cards.slice(0, 5);

    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);
    
    // Count rank frequencies
    const rankCounts = {};
    ranks.forEach(rank => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const uniqueRanks = Object.keys(rankCounts).length;
    
    // Count suit frequencies
    const suitCounts = {};
    suits.forEach(suit => {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    });
    
    const isFlush = Object.values(suitCounts).some(count => count >= 5);
    const isStraight = this.checkStraight(ranks);
    
    // Check for special hands (need more than 5 cards in deck)
    if (counts[0] === 5 && isFlush) return 'Flush Five';
    if (counts[0] === 5) return 'Five of a Kind';
    if (counts[0] === 3 && counts[1] === 2 && isFlush) return 'Flush House';
    
    // Standard poker hands
    if (isStraight && isFlush) return 'Straight Flush';
    if (counts[0] === 4) return 'Four of a Kind';
    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    if (counts[0] === 2) return 'Pair';
    
    return 'High Card';
  }

  checkStraight(ranks) {
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => 
      rankOrder.indexOf(a) - rankOrder.indexOf(b)
    );
    
    if (uniqueRanks.length < 5) return false;
    
    // Check for consecutive ranks
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      let consecutive = true;
      for (let j = 0; j < 4; j++) {
        const currentIndex = rankOrder.indexOf(uniqueRanks[i + j]);
        const nextIndex = rankOrder.indexOf(uniqueRanks[i + j + 1]);
        if (nextIndex - currentIndex !== 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
    
    return false;
  }

  calculateScore(cards, jokers = []) {
    if (cards.length === 0) return { score: 0, handType: 'High Card', breakdown: {} };

    // Step 1: Identify hand type
    const handType = this.identifyHandType(cards);
    const level = this.handLevels[handType];
    
    // Step 2: Calculate base chips and mult
    const handData = BASE_HANDS[handType];
    let baseChips = handData.chips + handData.chipsPerLevel * (level - 1);
    let baseMult = handData.mult + handData.multPerLevel * (level - 1);
    
    // Step 3: Add chips from cards
    let totalChips = baseChips;
    for (const card of cards) {
      totalChips += card.getChips();
    }
    
    // Step 4: Add mult from cards
    let totalMult = baseMult;
    for (const card of cards) {
      totalMult += card.getMult();
    }
    
    // Step 5: Calculate XMult (multiplicative)
    let xMult = 1.0;
    for (const card of cards) {
      xMult *= card.getXMult();
    }
    
    // TODO: Add joker effects in Phase 2
    
    // Final calculation: Score = Chips × Mult × XMult
    const finalScore = Math.floor(totalChips * totalMult * xMult);
    
    return {
      score: finalScore,
      handType: handType,
      level: level,
      breakdown: {
        baseChips,
        baseMult,
        totalChips,
        totalMult,
        xMult,
        calculation: `${totalChips} × ${totalMult} × ${xMult.toFixed(2)} = ${finalScore}`
      }
    };
  }

  // Helper method to find best 5-card combination from 8-card hand
  findBestPlay(hand) {
    if (hand.length <= 5) {
      return this.calculateScore(hand);
    }

    let bestScore = 0;
    let bestCombination = [];
    let bestResult = null;

    // Generate all 5-card combinations from 8-card hand
    const combinations = this.getCombinations(hand, 5);
    
    for (const combo of combinations) {
      const result = this.calculateScore(combo);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestCombination = combo;
        bestResult = result;
      }
    }

    return {
      ...bestResult,
      recommendedCards: bestCombination,
      cardsToDiscard: hand.filter(c => !bestCombination.includes(c))
    };
  }

  getCombinations(arr, k) {
    const combinations = [];
    
    function backtrack(start, current) {
      if (current.length === k) {
        combinations.push([...current]);
        return;
      }
      
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    }
    
    backtrack(0, []);
    return combinations;
  }
}

// Export for use in other modules
module.exports = { Card, ScoringEngine, RANK_CHIPS, BASE_HANDS };

// Example usage for testing
if (require.main === module) {
  console.log('🃏 Balatro Scoring Engine - Test Suite\n');
  
  const engine = new ScoringEngine();
  
  // Test 1: Simple Pair
  console.log('Test 1: Pair of Kings');
  const hand1 = [
    new Card('K', '♠'),
    new Card('K', '♥'),
    new Card('7', '♦'),
    new Card('3', '♣'),
    new Card('2', '♠')
  ];
  const result1 = engine.calculateScore(hand1);
  console.log(`Hand: ${hand1.map(c => c.toString()).join(', ')}`);
  console.log(`Result: ${result1.handType} - ${result1.score} points`);
  console.log(`Breakdown: ${result1.breakdown.calculation}\n`);
  
  // Test 2: Flush
  console.log('Test 2: Heart Flush');
  const hand2 = [
    new Card('A', '♥'),
    new Card('10', '♥'),
    new Card('7', '♥'),
    new Card('5', '♥'),
    new Card('2', '♥')
  ];
  const result2 = engine.calculateScore(hand2);
  console.log(`Hand: ${hand2.map(c => c.toString()).join(', ')}`);
  console.log(`Result: ${result2.handType} - ${result2.score} points`);
  console.log(`Breakdown: ${result2.breakdown.calculation}\n`);
  
  // Test 3: Enhanced cards
  console.log('Test 3: Pair with Glass card');
  const hand3 = [
    new Card('A', '♠', 'Glass'), // Glass card gives X2 mult
    new Card('A', '♥', 'Mult'),  // Mult card gives +4 mult
    new Card('K', '♦'),
    new Card('Q', '♣'),
    new Card('J', '♠')
  ];
  const result3 = engine.calculateScore(hand3);
  console.log(`Hand: ${hand3.map(c => c.toString()).join(', ')}`);
  console.log(`Result: ${result3.handType} - ${result3.score} points`);
  console.log(`Breakdown: ${result3.breakdown.calculation}\n`);
  
  // Test 4: Find best play from 8-card hand
  console.log('Test 4: Best play from 8-card hand');
  const hand4 = [
    new Card('A', '♠'),
    new Card('A', '♥'),
    new Card('K', '♠'),
    new Card('Q', '♠'),
    new Card('J', '♠'),
    new Card('10', '♠'),
    new Card('3', '♦'),
    new Card('2', '♣')
  ];
  const result4 = engine.findBestPlay(hand4);
  console.log(`Full hand: ${hand4.map(c => c.toString()).join(', ')}`);
  console.log(`Best play: ${result4.recommendedCards.map(c => c.toString()).join(', ')}`);
  console.log(`Result: ${result4.handType} - ${result4.score} points`);
  console.log(`Cards to discard: ${result4.cardsToDiscard.map(c => c.toString()).join(', ')}\n`);
}
