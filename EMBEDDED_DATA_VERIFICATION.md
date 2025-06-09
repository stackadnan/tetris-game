# Embedded Data Verification Script

## Add this verification code to each round file to check embedded data creation

Add this code block right after the `initializeChatDataFields()` function call in each round file:

```javascript
// VERIFICATION: Check all embedded data fields
console.log('=== EMBEDDED DATA VERIFICATION ===');
console.log('TestField_Round' + fileRound + ':', Qualtrics.SurveyEngine.getEmbeddedData('TestField_Round' + fileRound));
console.log('CurrentSequence:', Qualtrics.SurveyEngine.getEmbeddedData('CurrentSequence'));
console.log('Competition:', Qualtrics.SurveyEngine.getEmbeddedData('Competition'));
console.log('GameMode:', Qualtrics.SurveyEngine.getEmbeddedData('GameMode'));

for (var i = 1; i <= 3; i++) {
  var playerField = 'ChatResponse' + i;
  var opponentField = 'OpponentChat' + i;
  var playerValue = Qualtrics.SurveyEngine.getEmbeddedData(playerField);
  var opponentValue = Qualtrics.SurveyEngine.getEmbeddedData(opponentField);
  
  console.log(playerField + ':', playerValue);
  console.log(opponentField + ':', opponentValue);
}
console.log('=== END VERIFICATION ===');
```

## Expected Console Output

When you add this code and run the survey, you should see:

```
FORCE TEST: Created TestField_Round1
=== INITIALIZING CHAT DATA FIELDS ===
Created player chat field: ChatResponse1
Created player chat field: ChatResponse2
Created player chat field: ChatResponse3
Created opponent chat field: OpponentChat1
Created opponent chat field: OpponentChat2
Created opponent chat field: OpponentChat3
=== CHAT DATA FIELDS INITIALIZATION COMPLETE ===
=== EMBEDDED DATA VERIFICATION ===
TestField_Round1: WORKING_1733123456789
CurrentSequence: 1
Competition: High
GameMode: vs
ChatResponse1: 
ChatResponse2: 
ChatResponse3: 
OpponentChat1: 
OpponentChat2: 
OpponentChat3: 
=== END VERIFICATION ===
```

## What to Check in Your Data Export

After running the survey with these test fields, your CSV export should include these columns:

**Test Fields (should appear):**
- TestField_Round1
- TestField_Round2  
- TestField_Round3

**System Fields (should appear):**
- CurrentSequence
- Competition
- GameMode

**Chat Fields (these are the missing ones):**
- ChatResponse1, ChatResponse2, ChatResponse3
- OpponentChat1, OpponentChat2, OpponentChat3

If the Test Fields appear but the Chat Fields don't, then we know the issue is specifically with the chat data collection process.

## Next Steps

1. **Add the verification code to one round file**
2. **Preview the survey and check browser console**
3. **Complete the survey and export as CSV**
4. **Share which columns appear vs. which are missing**
