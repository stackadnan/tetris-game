# Chat Data Collection Troubleshooting Guide

## Issue Description
Chat input responses are not being properly recorded in Qualtrics survey data output (currently showing as blank columns).

**CRITICAL: Your current Qualtrics export shows NO chat data columns at all, which means the embedded data fields are missing from your Survey Flow setup.**

## Required Qualtrics Setup

### **STEP 1: Add Embedded Data Fields to Survey Flow**
**This is REQUIRED - your export shows these fields are missing:**

1. **In Qualtrics, go to Survey Flow tab**
2. **Click "Add New Element Here" at the top**
3. **Select "Embedded Data"**
4. **Add these 6 fields exactly:**
   - `ChatResponse1` (Player response to Round 1)
   - `ChatResponse2` (Player response to Round 2) 
   - `ChatResponse3` (Player response to Round 3)
   - `OpponentChat1` (CPU message in Round 1)
   - `OpponentChat2` (CPU message in Round 2)
   - `OpponentChat3` (CPU message in Round 3)

5. **Save Survey Flow**

### **Expected Data Export Columns**
After setup, your CSV export should include these columns:
| ChatResponse1 | ChatResponse2 | ChatResponse3 | OpponentChat1 | OpponentChat2 | OpponentChat3 |
|---------------|---------------|---------------|---------------|---------------|---------------|
| "Good game!"  | "That was fun"| "Thanks!"     | "Lol. I beat you."| "Thanks for playing."| "That was great."|

## Debugging Steps

### 1. Check Browser Console (Most Important)
When testing the survey:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Play through a round until chat appears
4. Send a message
5. Look for these debug messages:

**From Game (script.js):**
```
=== CPU CHAT DATA COLLECTION DEBUG ===
Sending CPU message with data: {type: 'opponentChat', round: 1, valence: 'Positive', text: 'Lol. I beat you.', sender: 'cpu'}
CPU message text: Lol. I beat you.
======================================

=== PLAYER CHAT DATA COLLECTION DEBUG ===
Sending postMessage with data: {type: 'chatResponse', round: 1, valence: 'Positive', text: 'Good game!', sender: 'player'}
Round: 1 Type: number
Valence: Positive
Text: Good game!
Parent window exists: true
=========================================
```

**From Qualtrics (round files):**
```
=== QUALTRICS MESSAGE LISTENER DEBUG (Round 1) ===
Processing OPPONENT chat message
Setting embedded data: OpponentChat1 = "Lol. I beat you."
Opponent chat embedded data saved successfully
Opponent message recorded, waiting for player response...

Processing PLAYER chat response
Setting embedded data: ChatResponse1 = "Good game!"
Player chat embedded data saved successfully
Clicking next button...
================================================
```

### 2. Potential Issues to Check

**A. Message Not Sent:**
- Look for "CHAT DATA COLLECTION DEBUG" in console
- If missing: Check if `sendMessage()` function is being called
- If round/valence are undefined: Check URL parameters

**B. Message Not Received:**
- Look for "QUALTRICS MESSAGE LISTENER DEBUG" in console
- If missing: Message is not reaching Qualtrics (iframe communication issue)
- Check if game is loaded in iframe vs direct access

**C. Data Type Mismatch:**
- Check if round numbers match exactly (both should be type 'number')
- Check if message type is exactly 'chatResponse'

**D. Embedded Data Not Saved:**
- Check if "Setting embedded data" message appears
- Verify embedded data field names: `ChatResponse1`, `ChatResponse2`, `ChatResponse3`

### 3. Common Solutions

**Solution 1: Iframe Communication Issue**
If messages aren't being received, check:
- Game must be loaded in iframe within Qualtrics
- Parent window must exist (`window.parent !== window`)
- No browser security restrictions blocking postMessage

**Solution 2: Round Number Mismatch**
If rounds don't match:
- Ensure URL parameter `round=1` is being passed correctly
- Check that Qualtrics round variable matches iframe URL round parameter

**Solution 3: Embedded Data Field Setup (MOST LIKELY ISSUE)**
In Qualtrics survey setup, ensure these embedded data fields exist in Survey Flow:
- `ChatResponse1`, `ChatResponse2`, `ChatResponse3` (Player responses)
- `OpponentChat1`, `OpponentChat2`, `OpponentChat3` (CPU messages)

**Your current export shows NONE of these fields exist - this is the main problem!**

**Solution 4: Timing Issues**
If data is sent but not saved:
- Ensure `setEmbeddedData` is called before `NextButton.click()`
- Add delay if needed: `setTimeout(() => jQuery("#NextButton").click(), 100);`

### 4. Manual Testing Steps

1. **Test Direct Game Access:**
   - Load game directly: `https://yourdomain.com/tetris-game/?round=1&competition=high`
   - Check if postMessage debug appears in console

2. **Test Within Qualtrics:**
   - Load game through Qualtrics survey
   - Check if both game and Qualtrics debug messages appear

3. **Test Data Export:**
   - Complete survey with chat responses
   - Export data and check for `ChatResponse1`, `ChatResponse2`, `ChatResponse3`, `OpponentChat1`, `OpponentChat2`, `OpponentChat3` columns

### 5. Advanced Debugging

**Check All PostMessages:**
Add to Qualtrics round files before existing listener:
```javascript
window.addEventListener("message", function(evt) {
  console.log('All messages received:', evt.data);
}, true);
```

**Check Embedded Data Values:**
Add after `setEmbeddedData` call:
```javascript
console.log('Verification - embedded data value:', 
  Qualtrics.SurveyEngine.getEmbeddedData("ChatResponse" + round));
```

## Current Status
- ✅ PostMessage system implemented for both player and opponent
- ✅ Qualtrics listeners implemented for both message types
- ✅ Debug logging added for both player and CPU chat
- ❌ **CRITICAL: Embedded data fields missing from Survey Flow**
- ❓ Need to add 6 embedded data fields to Qualtrics Survey Flow
- ❓ Need to test data collection end-to-end after setup

## Next Steps (PRIORITY ORDER)
1. **🚨 URGENT: Add embedded data fields to Qualtrics Survey Flow**
2. Test survey with debug console open
3. Verify both opponent and player messages are being sent and received
4. Test complete data export workflow with all 6 chat columns