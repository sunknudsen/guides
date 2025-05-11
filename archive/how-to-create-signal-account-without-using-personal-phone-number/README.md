<!--
Title: How to create Signal account without using personal phone number
Description: Learn how to create Signal account without using personal phone number.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-06-04T00:00:00.000Z
Listed: true
Pinned:
-->

# How to create Signal account without using personal phone number

[![How to create Signal account without using personal phone number](how-to-create-signal-account-without-using-personal-phone-number.jpg)](https://www.youtube.com/watch?v=b9aMJZjZ4pw "How to create Signal account without using personal phone number")

## Guide

### Step 1: create [Twilio](https://www.twilio.com/) account

Go to https://www.twilio.com/ and sign up (please consider using my [referral link](https://www.twilio.com/referral/EwWmgH) so we both get a 10 USD credit on account upgrade).

### Step 2: create “Forward voice” bin (used for phone call verification)

> Heads-up: don’t forget to replace `+12345678901` with your mobile phone number.

Go to https://www.twilio.com/console/twiml-bins, click +, set friendly name to `Forward voice` and paste snippet below in TwiML text area.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<Response>
  <Dial>
    +12345678901
  </Dial>
</Response>
```

### Step 3: create “Forward messaging” bin (used for SMS verification)

> Heads-up: don’t forget to replace `+12345678901` with your mobile phone number.

Go to https://www.twilio.com/console/twiml-bins, click +, set friendly name to `Forward messaging` and paste snippet below in TwiML text area.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<Response>
  <Message to="+12345678901">
    {{From}}: {{Body}}
  </Message>
</Response>
```

### Step 4: buy phone number

Go to https://www.twilio.com/console/phone-numbers/search and buy phone number.

### Step 5: configure phone number

Go to https://www.twilio.com/console/phone-numbers/incoming, click phone number, set “A Call Comes In” to “TwiML Bin” / “Forward voice”, set “A Message Comes In” to “TwiML Bin” / “Forward messaging” and click “Save”.

👍
