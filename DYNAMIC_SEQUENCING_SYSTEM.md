# Dynamic Round Sequencing System ✅ COMPLETED

## Problem Solved

The original issue was that when Qualtrics randomizes the order of questions, the competition assignment logic was tied to specific round files (round1, round2, round3) rather than the actual sequence position. This meant:

- If Round 1 appeared last, it would try to set competition mode but participants had already played 2 rounds
- Competition settings would be inconsistent across rounds
- The logical flow of "Round 1 → Round 2 → Round 3" was broken

## Solution: Dynamic Sequencing ✅

Each round script now dynamically determines its position in the sequence regardless of which file it is:

### Key Features ✅

1. **Sequence Tracking**: Uses `CurrentSequence` embedded data field to track which round is appearing in order
2. **Competition Assignment**: Only the FIRST round to appear (sequence position 1) assigns competition mode
3. **Consistent Display**: Rounds display as "Round 1", "Round 2", "Round 3" based on appearance order, not file names
4. **Proper Data Storage**: Chat responses are stored using sequence-based round numbers
5. **Fixed Valence Messages**: Each sequence position has predefined messages regardless of file execution order

### How It Works ✅

```javascript
// Each script determines its sequence position
var sequenceRound = getOrSetSequenceRound();

// Only first round in sequence sets competition
if (sequenceRound === 1) {
  // Assign High/Low competition for entire session
  // Set Competition and GameMode embedded data
} else {
  // Use existing competition settings
}

// Display and logic use sequence-based round number
var displayRound = sequenceRound;
```

### Example Scenarios

**Scenario A: Normal Order (round1, round2, round3)**
- round1 file → Sequence Round 1 → Sets competition → Displays "Round 1"
- round2 file → Sequence Round 2 → Uses existing competition → Displays "Round 2"  
- round3 file → Sequence Round 3 → Uses existing competition → Displays "Round 3"

**Scenario B: Random Order (round3, round1, round2)**
- round3 file → Sequence Round 1 → Sets competition → Displays "Round 1"
- round1 file → Sequence Round 2 → Uses existing competition → Displays "Round 2"
- round2 file → Sequence Round 3 → Uses existing competition → Displays "Round 3"

### Required Qualtrics Setup

Add these embedded data fields to your Survey Flow:

```
Embedded Data Fields:
├── Competition = (blank - set by first round)
├── GameMode = (blank - set by first round)  
├── CurrentSequence = (blank - auto-incremented)
├── ChatResponse1 = (blank - set by sequence round 1)
├── ChatResponse2 = (blank - set by sequence round 2)
├── ChatResponse3 = (blank - set by sequence round 3)
├── OpponentChat1 = (blank - set by sequence round 1)
├── OpponentChat2 = (blank - set by sequence round 2)
└── OpponentChat3 = (blank - set by sequence round 3)
```

### Benefits

✅ **Consistent Competition Flow**: Competition mode is always set by the first round to appear
✅ **Logical Sequencing**: Rounds always display as 1→2→3 regardless of file order
✅ **Proper Data Collection**: Chat data is stored in correct sequence-based slots
✅ **No Setup Changes**: Works with existing Qualtrics randomization
✅ **Future-Proof**: Easy to extend to more rounds if needed

### Console Debugging

Each round now shows enhanced debug information:
```
File round: 3 | Sequence round: 1 | Display round: 1
FIRST ROUND - Randomly assigned: High competition, vs mode
```

This makes it easy to verify the sequencing is working correctly during testing.

## Fixed Valence Message System

### Overview
Each sequence round now has fixed, predefined chat messages based on game outcomes:

- **Round 1 (Sequence)**: Positive Valence (Upbeat & Encouraging)
- **Round 2 (Sequence)**: Negative Valence (Snarky, Tense, or Gritty) 
- **Round 3 (Sequence)**: Neutral Valence (Flat, Reflective, or Unemotional)

### Message Logic
The messages are from the CPU's perspective about the **player's performance**:
- `win`: CPU's response when **player wins** the match
- `loss`: CPU's response when **player loses** the match  
- `tie`: CPU's response when the match ends in a **tie**

### Message Configuration
```javascript
var valenceMessages = {
  1: { // Round 1 - Positive Valence
    win: "Boom! You're on fire 🔥",
    loss: "Hey, not bad. You'll bounce back!",
    tie: "Nice clash! This is gonna be fun."
  },
  2: { // Round 2 - Negative Valence
    win: "You won… barely. Don't get cocky.",
    loss: "Yikes. That one hurt, huh?",
    tie: "Still stuck? Maybe you're slipping..."
  },
  3: { // Round 3 - Neutral Valence
    win: "That's done. Let's tally things up.",
    loss: "Well... that's over.",
    tie: "Okay. That happened."
  }
};
```

### Message Delivery
Messages are passed to the game via URL parameters:
- `&winMsg=` - Message for player victory
- `&lossMsg=` - Message for player defeat  
- `&tieMsg=` - Message for tie/draw

The game automatically selects and displays the appropriate message based on match outcome.

### Valence Progression
**Consistent emotional arc regardless of file randomization:**
- First game (any file) → Positive messages → "Boom! You're on fire 🔥"
- Second game (any file) → Negative messages → "You won… barely. Don't get cocky."
- Third game (any file) → Neutral messages → "That's done. Let's tally things up."

## 🎉 Implementation Status

### ✅ COMPLETED COMPONENTS

1. **Dynamic Sequencing Logic**
   - ✅ `getOrSetSequenceRound()` function implemented in all round files
   - ✅ `CurrentSequence` embedded data tracking working
   - ✅ Competition assignment only on sequence position 1

2. **Fixed Valence Message System**
   - ✅ Predefined messages for each sequence round in Qualtrics files
   - ✅ URL parameter passing (`&winMsg=`, `&lossMsg=`, `&tieMsg=`) implemented
   - ✅ JavaScript game file updated to use passed valence messages

3. **Game Integration**
   - ✅ URL parameter extraction working in `script.js`
   - ✅ Message selection logic updated based on game outcome
   - ✅ Chat interface displays sequence-appropriate messages

4. **Data Collection**
   - ✅ Embedded data storage using sequence-based round numbers
   - ✅ Both player and opponent messages tracked properly
   - ✅ Round display shows sequence position, not file name

### 🧪 TESTING

- **Manual Testing Guide**: See `VALENCE_SYSTEM_TEST.md`
- **Direct URL Testing**: Available for each sequence round
- **Console Debugging**: Comprehensive logging implemented
- **Qualtrics Integration**: Full workflow verified

### 🎯 RESULT

**The system now ensures consistent valence progression regardless of Qualtrics randomization:**

| Sequence Position | File That Runs | Valence | Example Message |
|------------------|----------------|---------|-----------------|
| Round 1 (First) | Any file | Positive | "Boom! You're on fire 🔥" |
| Round 2 (Second) | Any file | Negative | "You won… barely. Don't get cocky." |
| Round 3 (Third) | Any file | Neutral | "That's done. Let's tally things up." |

**Problem Solved**: Competition assignment is now effective and valence messages maintain logical emotional progression regardless of which round file appears first in Qualtrics randomization.
