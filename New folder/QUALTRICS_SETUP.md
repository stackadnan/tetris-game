# Qualtrics Survey Flow Setup for Tetris Competition Study

## Competition Assignment Files

### Available Round 1 Versions:

1. **`round1`** - Primary version (Survey Flow only)
   - Trusts Qualtrics Survey Flow to assign competition levels
   - No fallback randomization
   - Recommended for production use

2. **`round1_with_fallback`** - Backup version (Survey Flow + fallback)
   - Uses Survey Flow assignment when available
   - Falls back to JavaScript randomization if Survey Flow fails
   - Good for testing or as safety net

3. **`round1_alternative`** - Original clean version (Survey Flow only)
   - Identical to current `round1`
   - Kept for reference

## Required Qualtrics Survey Flow Setup

To ensure participants are properly sorted into High or Low Competition groups and remain consistent across all 3 rounds:

### Step 1: Create Embedded Data Field
- In Survey Flow, add an Embedded Data element at the top
- Set field name: `Competition`
- Leave value blank (will be set by randomizer)

### Step 2: Add Randomizer
- Add a Randomizer element after the Embedded Data
- Set it to "Evenly Present Elements"
- Create two branches:
  - Branch 1: Set Embedded Data `Competition` = `High`
  - Branch 2: Set Embedded Data `Competition` = `Low`

### Step 3: Question Setup
- Round 1: Uses the `Competition` field set by Survey Flow
- Round 2: Automatically uses same `Competition` value from Round 1
- Round 3: Automatically uses same `Competition` value from Round 1

## Survey Flow Example Structure:
```
Survey Flow:
├── Embedded Data: Competition = (leave blank)
├── Randomizer: Evenly Present Elements
│   ├── Branch 1: Set Embedded Data Competition = High
│   └── Branch 2: Set Embedded Data Competition = Low
├── Round 1 Question Block
├── Round 2 Question Block
└── Round 3 Question Block
```

## Competition Mechanics

### High Competition:
- Bot response time: 25-75ms (very fast)
- Expert-level AI behavior
- Aggressive garbage line sending
- Optimized piece placement

### Low Competition:
- Bot response time: 2000-3500ms (very slow)  
- Deliberately poor AI with 30% random moves
- Less frequent garbage line sending
- Suboptimal piece placement

## Testing

To test the setup:
1. Preview the survey
2. Check browser console logs for competition assignment messages
3. Verify same competition level appears across all 3 rounds
4. Test both High and Low competition paths

## Troubleshooting

If competition assignment isn't working:
1. Check Survey Flow order (Embedded Data must come before Randomizer)
2. Verify field name is exactly `Competition` (case-sensitive)
3. Use `round1_with_fallback` as temporary solution
4. Check browser console for error messages

## File Usage Recommendations

- **Production**: Use `round1` 
- **Testing**: Use `round1_with_fallback`
- **Reference**: Keep `round1_alternative`
