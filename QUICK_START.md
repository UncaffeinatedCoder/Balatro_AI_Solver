# 🚀 Quick Start Guide - Balatro AI Assistant

## ⚡ 3-Minute Setup

### Step 1: Extract the Project
```bash
tar -xzf balatro-ai-assistant.tar.gz
cd balatro-ai-assistant
```

### Step 2: Install Dependencies
```bash
npm install
```
*Takes ~30 seconds*

### Step 3: Run the Demo
```bash
npm run demo
```

**That's it!** You're now running the Balatro AI Assistant.

---

## 🎮 First Time User Guide

### What You'll See

```
╔════════════════════════════════════════════════════════╗
║         🃏 BALATRO AI ASSISTANT - PHASE 1 POC 🃏      ║
╚════════════════════════════════════════════════════════╝

MAIN MENU
═══════════════════════════════════════════════════
1. Quick Test - Random Hand
2. Scenario 1: Easy Win (Flush available)
3. Scenario 2: Tough Decision (Multiple options)
4. Scenario 3: Critical Situation (Last hand)
5. Scenario 4: Enhanced Cards (Glass, Mult, etc.)
6. Custom Hand Entry
7. View Scoring Reference
8. Exit
```

### Try This First

1. **Type `2` and press Enter** - Loads Scenario 1 (Easy Win)
2. **Review the game state** - 8-card hand with a Spade flush
3. **Read the AI recommendation** - It will suggest playing the Flush
4. **Check alternatives** - See what else you could play
5. **Press Enter** to return to menu
6. **Type `5` and press Enter** - See XMult stacking in action
7. **Type `7` and press Enter** - Learn the scoring formulas

---

## 🎯 Understanding the Output

### Game State Section
```
╔════════════════════════════════════════════════════════╗
║                    GAME STATE                          ║
╠════════════════════════════════════════════════════════╣
║ Ante: 1                                                ║
║ Money: $4                                              ║
║ Target Score: 300                                      ║
║ Hands Remaining: 3                                     ║
║ Discards Remaining: 3                                  ║
╚════════════════════════════════════════════════════════╝

YOUR HAND:
  1. K♠
  2. Q♠
  3. J♠
  4. 10♠
  5. 9♠
  6. 7♦
  7. 3♣
  8. 2♥
```
- Shows your current situation
- Target = score needed to beat the blind
- Hands remaining = how many more plays you have
- Your 8-card hand is listed

### AI Recommendation
```
╔═══════════════════════════════════════════╗
║       BALATRO AI RECOMMENDATION           ║
╠═══════════════════════════════════════════╣
║ Action: PLAY                               ║
║ Confidence: HIGH                           ║
║ Hand Type: Flush                           ║
║ Expected Score: 308                        ║
║ Meets Target: YES                          ║
╠═══════════════════════════════════════════╣
║ RECOMMENDED CARDS:                        ║
║  1. K♠                                       ║
║  2. Q♠                                       ║
║  3. J♠                                       ║
║  4. 10♠                                      ║
║  5. 9♠                                       ║
╠═══════════════════════════════════════════╣
║ REASONING:                                ║
║ ✓ This play scores 308, exceeding target    ║
║ of 300                                      ║
║ → Play immediately to conserve hands for    ║
║ next blind                                  ║
╚═══════════════════════════════════════════╝
```
- **Action:** What to do (PLAY or DISCARD)
- **Confidence:** How certain the AI is (LOW/MEDIUM/HIGH)
- **Hand Type:** Which poker hand you'll score (Flush, Pair, etc.)
- **Expected Score:** Points you'll get
- **Meets Target:** Whether this beats the blind
- **Recommended Cards:** The 5 cards to play
- **Reasoning:** Why this is the best move

### Alternative Plays
```
📊 TOP 5 ALTERNATIVE PLAYS:

★ 1. Flush: 308 points
     K♠, Q♠, J♠, 10♠, 9♠

  2. Flush: 303 points
     K♠, Q♠, J♠, 10♠, 2♥
```
- Shows other options ranked by score
- Star (★) marks the recommended play
- Compare to see trade-offs

---

## 🧮 Quick Scoring Guide

### The Formula
```
Score = Chips × Mult × XMult
```

### Key Concepts

**Chips (Additive):**
- Base from hand type (5-160)
- Card values (2-11 per card)
- Bonus from enhancements

**Mult (Additive):**
- Base from hand type (1-16)
- +4 from Mult cards
- +10 from Holographic edition

**XMult (Multiplicative):**
- ×2 from Glass cards
- ×1.5 from Steel cards
- ×1.5 from Polychrome edition
- *These multiply together!*

### Example

**Pair of Kings:**
```
Base: 10 chips × 2 mult
Cards: 10 + 10 = 20 chips
Total: (10 + 20) × 2 = 30 × 2 = 60 points
```

**Pair of Kings (Glass + Mult):**
```
Base: 10 chips × 2 mult
Cards: 10 + 10 = 20 chips
Mult card: +4 mult
Glass card: ×2 XMult
Total: (10 + 20) × (2 + 4) × 2 = 30 × 6 × 2 = 360 points
```

*6× higher score with enhancements!*

---

## 📚 Available Commands

### From the Project Directory

```bash
# Run interactive demo
npm run demo

# Test scoring engine
npm run test:scoring

# Test recommendation engine
npm run test:recommendations

# Run all tests
npm test

# Start screen capture service (Phase 2)
npm run capture
```

---

## 🔍 Scenarios Explained

### Scenario 1: Easy Win
- **Situation:** Strong Flush available, low target
- **Learn:** How AI prioritizes high-scoring hands
- **Outcome:** Should easily beat the blind

### Scenario 2: Tough Decision
- **Situation:** Pair of Aces vs Spade Flush
- **Learn:** How AI weighs competing options
- **Outcome:** See which scores higher

### Scenario 3: Critical
- **Situation:** Last hand, no discards, high target
- **Learn:** How AI handles desperate situations
- **Outcome:** May not meet target (realistic)

### Scenario 4: Enhanced Cards
- **Situation:** Glass, Mult, and Polychrome cards
- **Learn:** XMult stacking creates massive scores
- **Outcome:** See 1000+ point hands

---

## 💡 Pro Tips

### For Learning
1. Start with **Scenario 1** - easiest to understand
2. Check the **Scoring Reference** (option 7) - has all formulas
3. Try **Scenario 4** - see advanced mechanics

### For Testing
1. Use **Random Hand** (option 1) - infinite variations
2. Compare **Alternative Plays** - learn trade-offs
3. Check **Confidence levels** - understand certainty

### For Understanding
- **Green checkmark (✓)** means target is met
- **Warning (⚠)** means target is not met
- **Arrow (→)** gives tactical advice

---

## 🐛 Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org
- Requires Node.js 18 or higher

### "Cannot find module 'sharp'"
**Solution:** Run `npm install` in the project directory

### Demo won't start
**Solution:** 
1. Check you're in the `balatro-ai-assistant` directory
2. Run `npm install` first
3. Try `node src/demo.js` directly

### Wrong calculations?
**Solution:** This is unlikely but:
1. Run `npm test` to verify all tests pass
2. Check if you modified the code
3. Compare against Balatro Wiki

---

## 📖 Next Steps

### After Trying the Demo

1. **Read PHASE_1_COMPLETE.md** - Comprehensive overview
2. **Review README.md** - Full documentation
3. **Check the code** - Clean and well-commented
4. **Think about Phase 2** - What features do you want?

### If You Want to Extend It

The code is structured for easy extension:

- `scoring-engine.js` - Add more hand types or enhancements
- `recommendation-engine.js` - Improve decision logic
- `demo.js` - Add more scenarios
- `main.js` - Integrate with CV in Phase 2

---

## ⚡ Most Important Commands

```bash
# Start here
npm run demo

# See how it works
npm run test

# That's all you need!
```

---

## 🎯 What to Expect

### Phase 1 (Now)
✅ Scoring calculations (100% accurate)
✅ Tactical recommendations
✅ Interactive testing
✅ Learning tool

### Phase 2 (Next)
🔮 Auto-detect cards from screenshots
🔮 Real-time game tracking
🔮 Joker database (150+)
🔮 Shop recommendations

---

## 🎉 Have Fun!

This AI assistant will help you:
- **Learn** optimal Balatro strategies
- **Test** different hand combinations
- **Understand** scoring mechanics
- **Improve** your gameplay

```bash
npm run demo
```

**Good luck in the blinds! 🃏**

---

*Questions? Check README.md for detailed documentation*
*Phase 1 completed December 2024*
