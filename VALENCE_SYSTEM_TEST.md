# Valence Message System - Testing Guide

## System Overview
The dynamic sequencing system now passes fixed valence messages based on sequence position (not file round) to ensure consistent emotional progression regardless of randomization order.

## Testing URLs
Use these URLs to test each sequence round directly:

### Sequence Round 1 (Positive Valence)
```
https://stackadnan.github.io/tetris-game/?competition=high&mode=vs&round=1&winMsg=Boom!%20You're%20on%20fire%20🔥&lossMsg=Hey,%20not%20bad.%20You'll%20bounce%20back!&tieMsg=Nice%20clash!%20This%20is%20gonna%20be%20fun.
```

### Sequence Round 2 (Negative Valence)
```
https://stackadnan.github.io/tetris-game/?competition=high&mode=vs&round=2&winMsg=You%20won…%20barely.%20Don't%20get%20cocky.&lossMsg=Yikes.%20That%20one%20hurt,%20huh?&tieMsg=Still%20stuck?%20Maybe%20you're%20slipping...
```

### Sequence Round 3 (Neutral Valence)
```
https://stackadnan.github.io/tetris-game/?competition=high&mode=vs&round=3&winMsg=That's%20done.%20Let's%20tally%20things%20up.&lossMsg=Well...%20that's%20over.&tieMsg=Okay.%20That%20happened.
```

## Testing Steps

### 1. Console Verification
Open browser Developer Tools (F12) → Console tab and verify:

**URL Parameter Extraction:**
```
Game initialized: Competition=high, Round=1, Mode=vs
Valence Messages - Win: "Boom! You're on fire 🔥", Loss: "Hey, not bad. You'll bounce back!", Tie: "Nice clash! This is gonna be fun."
```

**Message Selection Logic:**
```
=== CHAT DEBUGGING ===
Game winner determined as: player
Available valence messages - Win: Boom! You're on fire 🔥, Loss: Hey, not bad. You'll bounce back!, Tie: Nice clash! This is gonna be fun.
====================
```

### 2. Game Outcome Testing
For each sequence round URL:

1. **Test Player Victory** - Let player win the match
   - Should display `winMsg` (CPU acknowledges player's victory)
   - Round 1: "Boom! You're on fire 🔥"
   - Round 2: "You won… barely. Don't get cocky."
   - Round 3: "That's done. Let's tally things up."

2. **Test Player Defeat** - Let CPU win the match  
   - Should display `lossMsg` (CPU comments on player's defeat)
   - Round 1: "Hey, not bad. You'll bounce back!"
   - Round 2: "Yikes. That one hurt, huh?"
   - Round 3: "Well... that's over."

3. **Test Tie Game** - End with same scores
   - Should display `tieMsg`
   - Round 1: "Nice clash! This is gonna be fun."
   - Round 2: "Still stuck? Maybe you're slipping..."
   - Round 3: "Okay. That happened."

### 3. Qualtrics Integration Testing
Test the complete workflow through Qualtrics round files:

1. Load round files in any order (randomization)
2. Verify sequence tracking in embedded data: `CurrentSequence`
3. Check that messages match sequence position (not file position)
4. Confirm data collection includes correct messages

## Expected Results

### Message Perspective
- **Player Wins**: CPU acknowledges player's victory with `winMsg`
- **Player Loses**: CPU comments on player's defeat with `lossMsg` 
- **Tie**: CPU gives neutral response with `tieMsg`

### Emotional Progression
Regardless of file execution order:
1. **First game played**: Always positive/encouraging
2. **Second game played**: Always negative/tense
3. **Third game played**: Always neutral/flat

### Data Collection
Messages should be stored in Qualtrics embedded data:
- `OpponentChat1`, `OpponentChat2`, `OpponentChat3`
- Content should reflect sequence position, not file round

## Troubleshooting

### Common Issues
1. **Wrong messages displayed**: Check URL encoding of parameters
2. **Fallback messages used**: Verify parameters are being passed correctly
3. **Sequence tracking broken**: Check `CurrentSequence` embedded data field

### Debug Commands
```javascript
// Check URL parameters
console.log(new URLSearchParams(location.search).get('winMsg'));

// Check winner determination
console.log('Game winner:', window.gameWinner);

// Check message selection
console.log('Selected message:', text);
```

## Success Criteria
✅ URL parameters extracted correctly  
✅ Messages match sequence position (not file)  
✅ Winner determination works for all outcomes  
✅ Messages display in chat interface  
✅ Data collection includes sequence-based messages  
✅ Emotional progression maintained across randomization
