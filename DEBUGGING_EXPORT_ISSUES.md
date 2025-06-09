# Chat Data Debugging Guide - Survey Export Issues

## 🚨 **Issue**: Game rounds (Q33, Q38, Q40) showing no data in PDF export

## 🔍 **Debugging Steps**

### **Step 1: Check Browser Console During Testing**

1. **Open your Qualtrics survey preview**
2. **Open browser Developer Tools (F12)**
3. **Go to Console tab**
4. **Play through one round and look for these messages:**

#### **Expected Debug Output:**

**On Round Load:**
```
=== INITIALIZING CHAT DATA FIELDS ===
Created player chat field: ChatResponse1
Created player chat field: ChatResponse2
Created player chat field: ChatResponse3
Created opponent chat field: OpponentChat1
Created opponent chat field: OpponentChat2
Created opponent chat field: OpponentChat3
=== CHAT DATA FIELDS INITIALIZATION COMPLETE ===
```

**When CPU sends message:**
```
=== CPU CHAT DATA COLLECTION DEBUG ===
Sending CPU message with data: {type: 'opponentChat', round: 1, valence: 'Positive', text: 'Boom! You're on fire 🔥', sender: 'cpu'}
```

**When you type a response:**
```
=== PLAYER CHAT DATA COLLECTION DEBUG ===
Sending postMessage with data: {type: 'chatResponse', round: 1, valence: 'Positive', text: 'Good game!', sender: 'player'}
```

**When Qualtrics receives messages:**
```
=== QUALTRICS MESSAGE LISTENER DEBUG ===
Processing OPPONENT chat message
Setting embedded data: OpponentChat1 = "Boom! You're on fire 🔥"
Opponent chat embedded data saved successfully

Processing PLAYER chat response
Setting embedded data: ChatResponse1 = "Good game!"
Player chat embedded data saved successfully
Clicking next button...
```

### **Step 2: Check for Common Issues**

#### **Issue A: JavaScript Errors**
- Look for red error messages in console
- Common error: "initializeChatDataFields is not defined"
- **Solution**: Function needs to be defined before it's called

#### **Issue B: Message Not Sent**
- If you don't see "CPU CHAT DATA COLLECTION DEBUG" or "PLAYER CHAT DATA COLLECTION DEBUG"
- **Problem**: Game is not sending postMessage
- **Solution**: Check game URL parameters

#### **Issue C: Message Not Received**
- If you see game debug but not "QUALTRICS MESSAGE LISTENER DEBUG"
- **Problem**: Qualtrics not receiving postMessage
- **Solution**: Check iframe communication

#### **Issue D: Data Not Saved**
- If you see "WARNING: embedded data save failed!"
- **Problem**: Qualtrics can't save to embedded data
- **Solution**: Check field initialization

### **Step 3: Manual Testing**

#### **Test 1: Check Embedded Data Values**
Add this to your round files to verify data exists:
```javascript
// Add this after the message listener
console.log('=== EMBEDDED DATA VERIFICATION ===');
for (var i = 1; i <= 3; i++) {
  console.log('ChatResponse' + i + ':', Qualtrics.SurveyEngine.getEmbeddedData('ChatResponse' + i));
  console.log('OpponentChat' + i + ':', Qualtrics.SurveyEngine.getEmbeddedData('OpponentChat' + i));
}
console.log('=== END VERIFICATION ===');
```

#### **Test 2: Force Field Creation**
Add this at the very beginning of each round file:
```javascript
// Force create fields immediately
Qualtrics.SurveyEngine.setEmbeddedData("ChatResponse1", "TEST_PLAYER_1");
Qualtrics.SurveyEngine.setEmbeddedData("ChatResponse2", "TEST_PLAYER_2");
Qualtrics.SurveyEngine.setEmbeddedData("ChatResponse3", "TEST_PLAYER_3");
Qualtrics.SurveyEngine.setEmbeddedData("OpponentChat1", "TEST_CPU_1");
Qualtrics.SurveyEngine.setEmbeddedData("OpponentChat2", "TEST_CPU_2");
Qualtrics.SurveyEngine.setEmbeddedData("OpponentChat3", "TEST_CPU_3");
console.log('FORCED TEST DATA CREATED');
```

### **Step 4: Check Qualtrics Survey Flow**

Even with auto-initialization, verify:
1. **Go to Survey Flow in Qualtrics**
2. **Look for Embedded Data element**
3. **If it exists, check that these fields are listed:**
   - ChatResponse1, ChatResponse2, ChatResponse3
   - OpponentChat1, OpponentChat2, OpponentChat3
4. **If fields are missing, manually add them**

### **Step 5: Check Data Export Settings**

1. **In Qualtrics Data & Analysis**
2. **Click Export & Import → Export Data**
3. **Choose CSV format (easier to read than PDF)**
4. **In export options, ensure "Include embedded data" is checked**
5. **Look for the 6 chat columns in the CSV**

## 🚀 **Quick Fix - Force Test Data**

If nothing above works, try this immediate test:

1. **Add this line at the TOP of each round file (after line 1):**
```javascript
Qualtrics.SurveyEngine.setEmbeddedData("TestField", "Round" + fileRound + "_Working");
```

2. **Preview survey and complete one round**
3. **Export data and check if "TestField" column appears**
4. **If TestField works but chat fields don't, the issue is in the chat collection logic**

## 📊 **Expected CSV Export Structure**

Your export should show these columns:
```
Q33 | ChatResponse1 | OpponentChat1 | Q38 | ChatResponse2 | OpponentChat2 | Q40 | ChatResponse3 | OpponentChat3
```

If you only see Q33, Q38, Q40 without the chat columns, then the embedded data fields are not being created or exported.

## 🔧 **Next Steps**

1. **Try the browser console debugging first**
2. **Share the console output here**
3. **Try the force test data approach**
4. **Let me know what you find - I can create a more targeted fix**

The fact that Q33, Q38, Q40 show up means your round files are loading, but the chat data collection isn't working as expected. The console debugging will tell us exactly where the issue is.
