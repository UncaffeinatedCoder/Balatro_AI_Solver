/**
 * Balatro Recommendation Engine
 * Provides tactical guidance for play decisions and shop purchases
 */

const { ScoringEngine } = require('./scoring-engine');

class RecommendationEngine {
  constructor() {
    this.scoringEngine = new ScoringEngine();
  }

  // Set the current hand levels (usually upgraded via Planet cards)
  setHandLevels(levels) {
    Object.keys(levels).forEach(handType => {
      this.scoringEngine.setHandLevel(handType, levels[handType]);
    });
  }

  // Main recommendation method for playing a hand
  recommendPlay(hand, targetScore, handsRemaining, discardsRemaining) {
    const bestPlay = this.scoringEngine.findBestPlay(hand);
    
    const recommendation = {
      action: 'PLAY',
      confidence: 'HIGH',
      cards: bestPlay.recommendedCards,
      handType: bestPlay.handType,
      expectedScore: bestPlay.score,
      meetsTarget: bestPlay.score >= targetScore,
      cardsToDiscard: bestPlay.cardsToDiscard,
      reasoning: []
    };

    // Add reasoning
    if (bestPlay.score >= targetScore) {
      recommendation.reasoning.push(`✓ This play scores ${bestPlay.score}, exceeding target of ${targetScore}`);
      recommendation.reasoning.push(`→ Play immediately to conserve hands for next blind`);
    } else {
      const deficit = targetScore - bestPlay.score;
      recommendation.reasoning.push(`⚠ This play scores ${bestPlay.score}, ${deficit} short of target ${targetScore}`);
      
      if (discardsRemaining > 0) {
        recommendation.action = 'DISCARD';
        recommendation.confidence = 'MEDIUM';
        recommendation.reasoning.push(`→ Consider discarding ${bestPlay.cardsToDiscard.length} cards to fish for better hand`);
        recommendation.reasoning.push(`   Discards remaining: ${discardsRemaining}`);
      } else if (handsRemaining > 1) {
        recommendation.reasoning.push(`→ Play now, you have ${handsRemaining - 1} more hands to reach target`);
      } else {
        recommendation.reasoning.push(`→ Last hand - play best available`);
        recommendation.confidence = 'LOW';
      }
    }

    return recommendation;
  }

  // Analyze multiple play options
  analyzeAllPlays(hand) {
    const scoringEngine = this.scoringEngine;
    const results = [];

    // Get all 5-card combinations
    if (hand.length > 5) {
      const combinations = scoringEngine.getCombinations(hand, 5);
      
      for (const combo of combinations) {
        const result = scoringEngine.calculateScore(combo);
        results.push({
          cards: combo,
          handType: result.handType,
          score: result.score,
          breakdown: result.breakdown
        });
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
    } else {
      const result = scoringEngine.calculateScore(hand);
      results.push({
        cards: hand,
        handType: result.handType,
        score: result.score,
        breakdown: result.breakdown
      });
    }

    return results;
  }

  // Recommend which cards to discard
  recommendDiscard(hand, targetHandType = null) {
    // Strategy: Keep cards that contribute to strong hands
    const scoringEngine = this.scoringEngine;
    
    // Calculate current best play
    const bestPlay = scoringEngine.findBestPlay(hand);
    
    // If we have a strong hand already, suggest discarding weakest cards
    if (bestPlay.score > 100) {
      return {
        cardsToDiscard: bestPlay.cardsToDiscard,
        reasoning: `Current hand is ${bestPlay.handType} (${bestPlay.score} points). Discard these cards to improve.`,
        keepCards: bestPlay.recommendedCards
      };
    }

    // Otherwise, analyze card patterns
    const ranks = {};
    const suits = {};
    
    hand.forEach(card => {
      ranks[card.rank] = (ranks[card.rank] || 0) + 1;
      suits[card.suit] = (suits[card.suit] || 0) + 1;
    });

    // Find cards to keep based on potential
    const keepCards = [];
    const discardCards = [];

    // Strategy 1: Keep pairs and potential pairs
    hand.forEach(card => {
      if (ranks[card.rank] >= 2) {
        keepCards.push(card);
      } else if (suits[card.suit] >= 3) {
        // Keep cards that contribute to flush
        keepCards.push(card);
      } else {
        discardCards.push(card);
      }
    });

    // Ensure we keep at least 3 cards
    while (keepCards.length < 3 && discardCards.length > 0) {
      const card = discardCards.pop();
      keepCards.push(card);
    }

    return {
      cardsToDiscard: discardCards,
      reasoning: `Looking for pairs or flushes. Discarding ${discardCards.length} low-value cards.`,
      keepCards: keepCards
    };
  }

  // Shop recommendation (simplified for Phase 1)
  recommendShopPurchase(availableJokers, currentMoney, currentJokers = []) {
    // Simple heuristic for Phase 1: prioritize economy and scaling
    const priorities = {
      // Economy jokers
      'Bull': 9,
      'Egg': 8,
      'Business Card': 8,
      
      // Early scaling
      'Joker': 7,
      'Greedy Joker': 7,
      'Lusty Joker': 7,
      'Wrathful Joker': 7,
      'Gluttonous Joker': 7,
      
      // Strong mult sources
      'Scary Face': 8,
      'Smiley Face': 8,
      'Ride the Bus': 7,
      
      // Powerful rare jokers
      'Blueprint': 10,
      'Brainstorm': 10,
      'Baron': 9
    };

    const recommendations = availableJokers.map(joker => {
      const priority = priorities[joker.name] || 5;
      const affordable = joker.cost <= currentMoney;
      
      return {
        joker,
        priority,
        affordable,
        recommendation: affordable ? 'BUY' : 'SKIP',
        reasoning: this.getJokerReasoning(joker.name, currentJokers)
      };
    }).sort((a, b) => b.priority - a.priority);

    return recommendations[0] || {
      recommendation: 'SKIP',
      reasoning: 'No good options available. Consider rerolling shop.'
    };
  }

  getJokerReasoning(jokerName, currentJokers) {
    const reasons = {
      'Blueprint': 'Copies ability of Joker to the right - extremely powerful with the right setup',
      'Baron': 'Gives XMult for each King in hand - scales multiplicatively',
      'Bull': 'Earn $2 for each hand remaining - excellent economy',
      'Egg': 'Increases sell value - helps with economy',
      'Joker': 'Simple +4 Mult - reliable early game',
      'Scary Face': '+30 Chips per face card scored - strong with face-heavy decks',
      'Smiley Face': '+4 Mult per face card scored - synergizes with Scary Face'
    };
    
    return reasons[jokerName] || 'Solid joker for your build';
  }

  // Generate a comprehensive game state report
  generateReport(gameState) {
    const { hand, targetScore, handsRemaining, discardsRemaining, money, ante } = gameState;
    
    const playRecommendation = this.recommendPlay(hand, targetScore, handsRemaining, discardsRemaining);
    const allPlays = this.analyzeAllPlays(hand);
    
    const report = {
      timestamp: new Date().toISOString(),
      ante: ante,
      money: money,
      currentSituation: {
        targetScore,
        handsRemaining,
        discardsRemaining,
        handSize: hand.length
      },
      primaryRecommendation: playRecommendation,
      alternativePlays: allPlays.slice(0, 3), // Top 3 alternatives
      urgency: this.calculateUrgency(playRecommendation, handsRemaining, targetScore)
    };

    return report;
  }

  calculateUrgency(recommendation, handsRemaining, targetScore) {
    if (recommendation.meetsTarget) return 'LOW';
    if (handsRemaining <= 1) return 'CRITICAL';
    if (recommendation.expectedScore < targetScore * 0.5) return 'HIGH';
    return 'MEDIUM';
  }

  // Pretty print a recommendation
  formatRecommendation(recommendation) {
    const lines = [];
    lines.push('\n╔═══════════════════════════════════════════╗');
    lines.push('║       BALATRO AI RECOMMENDATION           ║');
    lines.push('╠═══════════════════════════════════════════╣');
    lines.push(`║ Action: ${recommendation.action.padEnd(34)} ║`);
    lines.push(`║ Confidence: ${recommendation.confidence.padEnd(30)} ║`);
    lines.push(`║ Hand Type: ${recommendation.handType.padEnd(31)} ║`);
    lines.push(`║ Expected Score: ${String(recommendation.expectedScore).padEnd(26)} ║`);
    lines.push(`║ Meets Target: ${(recommendation.meetsTarget ? 'YES' : 'NO').padEnd(28)} ║`);
    lines.push('╠═══════════════════════════════════════════╣');
    lines.push('║ RECOMMENDED CARDS:                        ║');
    recommendation.cards.forEach((card, i) => {
      lines.push(`║  ${(i + 1)}. ${card.toString().padEnd(40)} ║`);
    });
    lines.push('╠═══════════════════════════════════════════╣');
    lines.push('║ REASONING:                                ║');
    recommendation.reasoning.forEach(reason => {
      // Word wrap long reasons
      const words = reason.split(' ');
      let line = '║ ';
      words.forEach(word => {
        if ((line + word).length > 43) {
          lines.push(line.padEnd(46) + '║');
          line = '║ ' + word + ' ';
        } else {
          line += word + ' ';
        }
      });
      if (line.length > 2) {
        lines.push(line.padEnd(46) + '║');
      }
    });
    lines.push('╚═══════════════════════════════════════════╝\n');
    
    return lines.join('\n');
  }
}

module.exports = { RecommendationEngine };

// Example usage for testing
if (require.main === module) {
  const { Card } = require('./scoring-engine');
  
  console.log('🎯 Balatro Recommendation Engine - Test Suite\n');
  
  const engine = new RecommendationEngine();
  
  // Test scenario: Early game, need to beat Small Blind
  console.log('═══════════════════════════════════════════════════');
  console.log('SCENARIO: Ante 1, Small Blind - Target: 300 points');
  console.log('═══════════════════════════════════════════════════\n');
  
  const testHand = [
    new Card('K', '♠'),
    new Card('K', '♥'),
    new Card('Q', '♠'),
    new Card('J', '♠'),
    new Card('10', '♠'),
    new Card('7', '♦'),
    new Card('3', '♣'),
    new Card('2', '♠')
  ];
  
  console.log('Your hand:');
  testHand.forEach((card, i) => console.log(`  ${i + 1}. ${card.toString()}`));
  console.log('');
  
  const recommendation = engine.recommendPlay(testHand, 300, 3, 3);
  console.log(engine.formatRecommendation(recommendation));
  
  // Show alternative plays
  console.log('\n📊 Alternative Plays:\n');
  const alternatives = engine.analyzeAllPlays(testHand);
  alternatives.slice(0, 5).forEach((play, i) => {
    console.log(`${i + 1}. ${play.handType}: ${play.score} points`);
    console.log(`   Cards: ${play.cards.map(c => c.toString()).join(', ')}`);
    console.log('');
  });
}
