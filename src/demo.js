#!/usr/bin/env node
/**
 * Balatro AI Assistant - Interactive Demo (Phase 1 POC)
 * Command-line interface for testing recommendations
 */

const readline = require('readline');
const { Card, ScoringEngine } = require('./scoring-engine');
const { RecommendationEngine } = require('./recommendation-engine');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BalatroDemoApp {
  constructor() {
    this.recommendationEngine = new RecommendationEngine();
    this.currentHand = [];
    this.targetScore = 300;
    this.handsRemaining = 3;
    this.discardsRemaining = 3;
    this.money = 4;
    this.ante = 1;
  }

  displayWelcome() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║         🃏 BALATRO AI ASSISTANT - PHASE 1 POC 🃏      ║');
    console.log('║                                                        ║');
    console.log('║              Interactive Demo Version 1.0              ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('This demo showcases the core recommendation engine.');
    console.log('Choose from preset scenarios or create your own hands.\n');
  }

  displayMenu() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('MAIN MENU');
    console.log('═══════════════════════════════════════════════════');
    console.log('1. Quick Test - Random Hand');
    console.log('2. Scenario 1: Easy Win (Flush available)');
    console.log('3. Scenario 2: Tough Decision (Multiple options)');
    console.log('4. Scenario 3: Critical Situation (Last hand)');
    console.log('5. Scenario 4: Enhanced Cards (Glass, Mult, etc.)');
    console.log('6. Custom Hand Entry');
    console.log('7. View Scoring Reference');
    console.log('8. Exit');
    console.log('═══════════════════════════════════════════════════\n');
  }

  async promptUser(question) {
    return new Promise(resolve => {
      rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }

  generateRandomHand(size = 8) {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♥', '♦', '♣'];
    const hand = [];
    
    for (let i = 0; i < size; i++) {
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      hand.push(new Card(rank, suit));
    }
    
    return hand;
  }

  loadScenario1() {
    // Easy scenario: Flush is available
    this.currentHand = [
      new Card('K', '♠'),
      new Card('Q', '♠'),
      new Card('J', '♠'),
      new Card('10', '♠'),
      new Card('9', '♠'),
      new Card('7', '♦'),
      new Card('3', '♣'),
      new Card('2', '♥')
    ];
    this.targetScore = 250;
    this.handsRemaining = 3;
    this.discardsRemaining = 3;
    this.ante = 1;
  }

  loadScenario2() {
    // Tough decision: Multiple good options
    this.currentHand = [
      new Card('A', '♠'),
      new Card('A', '♥'),
      new Card('K', '♠'),
      new Card('Q', '♠'),
      new Card('J', '♠'),
      new Card('10', '♠'),
      new Card('9', '♦'),
      new Card('8', '♣')
    ];
    this.targetScore = 400;
    this.handsRemaining = 2;
    this.discardsRemaining = 2;
    this.ante = 2;
  }

  loadScenario3() {
    // Critical: Last hand, tough target
    this.currentHand = [
      new Card('K', '♠'),
      new Card('K', '♥'),
      new Card('7', '♦'),
      new Card('5', '♣'),
      new Card('3', '♠'),
      new Card('2', '♥'),
      new Card('2', '♦'),
      new Card('2', '♣')
    ];
    this.targetScore = 500;
    this.handsRemaining = 1;
    this.discardsRemaining = 0;
    this.ante = 3;
  }

  loadScenario4() {
    // Enhanced cards showcase
    this.currentHand = [
      new Card('A', '♠', 'Glass'),
      new Card('A', '♥', 'Mult'),
      new Card('K', '♦', null, null, 'Polychrome'),
      new Card('Q', '♣', 'Bonus'),
      new Card('J', '♠', 'Steel'),
      new Card('10', '♥'),
      new Card('5', '♦'),
      new Card('3', '♣')
    ];
    this.targetScore = 800;
    this.handsRemaining = 2;
    this.discardsRemaining = 3;
    this.ante = 4;
  }

  displayGameState() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    GAME STATE                          ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║ Ante: ${String(this.ante).padEnd(48)} ║`);
    console.log(`║ Money: $${String(this.money).padEnd(46)} ║`);
    console.log(`║ Target Score: ${String(this.targetScore).padEnd(40)} ║`);
    console.log(`║ Hands Remaining: ${String(this.handsRemaining).padEnd(37)} ║`);
    console.log(`║ Discards Remaining: ${String(this.discardsRemaining).padEnd(34)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('YOUR HAND:');
    this.currentHand.forEach((card, i) => {
      console.log(`  ${i + 1}. ${card.toString()}`);
    });
    console.log('');
  }

  analyzeCurrentHand() {
    const recommendation = this.recommendationEngine.recommendPlay(
      this.currentHand,
      this.targetScore,
      this.handsRemaining,
      this.discardsRemaining
    );
    
    console.log(this.recommendationEngine.formatRecommendation(recommendation));
    
    // Show alternatives
    console.log('\n📊 TOP 5 ALTERNATIVE PLAYS:\n');
    const alternatives = this.recommendationEngine.analyzeAllPlays(this.currentHand);
    alternatives.slice(0, 5).forEach((play, i) => {
      const marker = i === 0 ? '★' : ' ';
      console.log(`${marker} ${i + 1}. ${play.handType}: ${play.score} points`);
      console.log(`      ${play.cards.map(c => c.toString()).join(', ')}`);
      console.log('');
    });
  }

  displayScoringReference() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              BALATRO SCORING REFERENCE                 ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║                                                        ║');
    console.log('║  FORMULA: Score = Chips × Mult × XMult                ║');
    console.log('║                                                        ║');
    console.log('║  BASE POKER HANDS (Level 1):                          ║');
    console.log('║  ─────────────────────────────────────────────────    ║');
    console.log('║  High Card:       5 chips  × 1 mult                   ║');
    console.log('║  Pair:           10 chips  × 2 mult                   ║');
    console.log('║  Two Pair:       20 chips  × 2 mult                   ║');
    console.log('║  Three of Kind:  30 chips  × 3 mult                   ║');
    console.log('║  Straight:       30 chips  × 4 mult                   ║');
    console.log('║  Flush:          35 chips  × 4 mult                   ║');
    console.log('║  Full House:     40 chips  × 4 mult                   ║');
    console.log('║  Four of Kind:   60 chips  × 7 mult                   ║');
    console.log('║  Straight Flush: 100 chips × 8 mult                   ║');
    console.log('║                                                        ║');
    console.log('║  CARD ENHANCEMENTS:                                   ║');
    console.log('║  ─────────────────────────────────────────────────    ║');
    console.log('║  Bonus:  +30 chips                                    ║');
    console.log('║  Mult:   +4 mult                                      ║');
    console.log('║  Glass:  ×2 XMult (but 1/4 chance to destroy)         ║');
    console.log('║  Steel:  ×1.5 XMult while in hand                     ║');
    console.log('║  Stone:  +50 chips (no rank)                          ║');
    console.log('║                                                        ║');
    console.log('║  EDITIONS:                                            ║');
    console.log('║  ─────────────────────────────────────────────────    ║');
    console.log('║  Foil:        +50 chips                               ║');
    console.log('║  Holographic: +10 mult                                ║');
    console.log('║  Polychrome:  ×1.5 XMult                              ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  }

  async run() {
    this.displayWelcome();
    
    let running = true;
    
    while (running) {
      this.displayMenu();
      const choice = await this.promptUser('Select option (1-8): ');
      
      console.clear();
      
      switch (choice) {
        case '1':
          console.log('🎲 Generating random hand...\n');
          this.currentHand = this.generateRandomHand(8);
          this.targetScore = 300;
          this.handsRemaining = 3;
          this.discardsRemaining = 3;
          this.ante = 1;
          this.displayGameState();
          this.analyzeCurrentHand();
          await this.promptUser('\nPress Enter to continue...');
          console.clear();
          break;
          
        case '2':
          this.loadScenario1();
          console.log('📖 SCENARIO 1: Easy Win\n');
          console.log('You have a strong Spade flush available. The AI should');
          console.log('recommend playing it immediately.\n');
          this.displayGameState();
          this.analyzeCurrentHand();
          await this.promptUser('\nPress Enter to continue...');
          console.clear();
          break;
          
        case '3':
          this.loadScenario2();
          console.log('📖 SCENARIO 2: Tough Decision\n');
          console.log('You have both a Pair of Aces and a potential Flush.');
          console.log('Which should you play?\n');
          this.displayGameState();
          this.analyzeCurrentHand();
          await this.promptUser('\nPress Enter to continue...');
          console.clear();
          break;
          
        case '4':
          this.loadScenario3();
          console.log('📖 SCENARIO 3: Critical Situation\n');
          console.log('Last hand with no discards. You need 500 points but only');
          console.log('have weak pairs. Can the AI salvage this?\n');
          this.displayGameState();
          this.analyzeCurrentHand();
          await this.promptUser('\nPress Enter to continue...');
          console.clear();
          break;
          
        case '5':
          this.loadScenario4();
          console.log('📖 SCENARIO 4: Enhanced Cards\n');
          console.log('Your hand has Glass, Mult, and Polychrome enhancements.');
          console.log('Watch how multiplicative effects stack!\n');
          this.displayGameState();
          this.analyzeCurrentHand();
          await this.promptUser('\nPress Enter to continue...');
          console.clear();
          break;
          
        case '6':
          console.log('🛠️ CUSTOM HAND ENTRY\n');
          console.log('This feature will be available in Phase 2.');
          console.log('For now, try the preset scenarios!\n');
          await this.promptUser('Press Enter to continue...');
          console.clear();
          break;
          
        case '7':
          this.displayScoringReference();
          await this.promptUser('Press Enter to continue...');
          console.clear();
          break;
          
        case '8':
          console.log('\n👋 Thanks for trying Balatro AI Assistant!');
          console.log('Phase 1 POC complete. Stay tuned for Phase 2!\n');
          running = false;
          break;
          
        default:
          console.log('❌ Invalid option. Please select 1-8.\n');
          await this.promptUser('Press Enter to continue...');
          console.clear();
      }
    }
    
    rl.close();
  }
}

// Run the demo
const demo = new BalatroDemoApp();
demo.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
