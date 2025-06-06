# Chat Data Collection Troubleshooting Guide

## Issue Description
Chat input responses are not being properly recorded in Qualtrics survey data output (currently showing as blank columns).

## Technical Setup
- **Game**: Sends `postMessage` to parent window with chat response data
- **Qualtrics**: Listens for messages and saves data using `setEmbeddedData`
- **Data Flow**: Game iframe → Qualtrics parent window → Embedded data → Survey export

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
=== CHAT DATA COLLECTION DEBUG ===
Sending postMessage with data: {type: 'chatResponse', round: 1, valence: 'Positive', text: 'Hello'}
Round: 1 Type: number
Valence: Positive
Text: Hello
Parent window exists: true
==================================
```

**From Qualtrics (round files):**
```
=== QUALTRICS MESSAGE LISTENER DEBUG (Round 1) ===
Received message event: MessageEvent {...}
Message data: {type: 'chatResponse', round: 1, valence: 'Positive', text: 'Hello'}
Data type: chatResponse
Data round: 1 Type: number
Expected round: 1 Type: number
Data text: Hello
Setting embedded data: ChatResponse1 = "Hello"
Embedded data set successfully
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

**Solution 3: Embedded Data Field Setup**
In Qualtrics survey setup, ensure these embedded data fields exist:
- `ChatResponse1`
- `ChatResponse2` 
- `ChatResponse3`

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
   - Export data and check for `ChatResponse1`, `ChatResponse2`, `ChatResponse3` columns

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
- ✅ PostMessage system implemented
- ✅ Qualtrics listeners implemented  
- ✅ Debug logging added
- ❓ Need to test data collection end-to-end
- ❓ Need to verify data appears in survey export

## Next Steps
1. Test survey with debug console open
2. Verify messages are being sent and received
3. Check if embedded data fields are properly configured in Qualtrics
4. Test complete data export workflow