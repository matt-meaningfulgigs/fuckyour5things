# FuckYour5Things

## Overview

**FuckYour5Things** is a protest tool built to cripple the bureaucratic machine that’s trying to fire hardworking federal workers. As Musk, Trump, DOGE, and the Russians conspire to dismantle America’s institutions and undermine the workforce that keeps our country running, this tool floods their systems with relentless, AI-generated protest emails. Its mission is simple: waste their time, muddle the data they’re stealing, and bog down their cronies with a ceaseless barrage of dissent.

*Use this tool to slow down the oppressive machinery and defend the workers.*

## Why We Fuck Your 5 Things

- **Disrupt the Machine:** Flood the channels used to fire federal workers, forcing the enforcers to waste valuable time and resources.
- **Muddle Stolen Data:** Overwhelm the data operations of Musk and his goon squad with chaotic, protest-driven content.
- **Waste Resources:** Make DOGE and its minions choke on an endless stream of furious emails.
- **Defend the Workforce:** Stand up for those who keep America running by turning their own tools against them.

## Features

- **Local AI-Generated Content:** Uses a local LLM (Ollama with the "mistral" model) to produce unique, protest-oriented email subjects and bodies.
- **Multi-Account Dispatch:** Supports multiple Gmail accounts, with each account sending 500 emails per cycle.
- **Plain Text Configuration:** Easily manage sender credentials, recipient lists, and protest templates through simple text files.
- **Timed Delivery:** Emails are spread over 20 hours (~144 seconds between emails) with a 4-hour rest period to maximize disruption while dodging spam filters.
- **Protest Template References:** Built-in incendiary templates—examples like “Fuck Elon Musk”, “Bash Fascists”, and “Punch Nazi Scum”—serve as the creative foundation for AI-generated content.

## Installation

### Prerequisites

- **Node.js:** Ensure Node.js is installed on your system.

### Clone the Repository

```bash
git clone https://github.com/whateveraccountforkitplease/fuckyour5things.git
cd fuckyour5things
```

### Install Dependencies

```bash
npm install
```

### Configuration

Create or update these plain text files in the **/data** folder:

- **senders.txt**  
  Each line should be formatted as:  
  ```
  sender-email@gmail.com,app-password
  ```
  **Important:** For Gmail, you must generate an App Password.  
  1. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and sign in.
  2. Under "Select app," choose **Mail**; under "Select device," choose **Other (Custom name)** and enter a descriptive name.
  3. Generate the password—a 16-digit code will be displayed in four groups of four characters (e.g., "abcd efgh ijkl mnop").  
  4. Use this 16-digit app password in your **senders.txt**.  
  This password is stored only on your computer in this file. However, always keep your passwords and app passwords secure.

- **recipients.txt**  
  List one recipient email per line. If this file is missing, it defaults to `hr@opm.gov`.

- **templates.txt**  
  Enter protest template examples separated by blank lines. The first non‑empty line is used as the subject, and the subsequent lines form the body.  
  **Example:**
  ```
    Cut Off Elon's Leftover Dick
    Dear HR,
    Here's what I did last week:
    1. Cut off the rest of Elon’s penis that was left over from his botched dick job.
    2. Crushed his corporate cockiness with a savage round of insults.
    3. Drained his delusional bank account with one epic meme.
    4. Left his cronies reeling from the brutal truth.
    5. Made sure every tweet of his became a punchline.
    Regards,

    Trump's Total Transformation Fiasco
    Dear HR,
    Last week, I went to war with the clown:
    1. Transitioned Trump into a woman—but refused to use his new pronouns.
    2. Shattered his empty promises with unfiltered mockery.
    3. Reduced his tantrums to a series of hysterical fails.
    4. Turned his boardroom bluster into a joke of epic proportions.
    5. Left his cronies scrambling for a comeback.
    Regards,

    Savage Weekly Scorecard
    Dear HR,
    Here are the five savage moves I pulled off last week:
    1. Sliced off the remnants of Elon’s botched masculinity.
    2. Transformed Trump into a walking punchline without mercy.
    3. Roasted their every feeble attempt at power with raw humor.
    4. Exposed their hypocrisy in a barrage of vulgar wit.
    5. Sparked a revolution of laughter that left them stunned.
    Regards,
  ```

## Usage

Run the tool with:

```bash
npm start
```

The tool will:
- Load sender credentials, recipient addresses, and protest template examples from the text files.
- Use the local LLM (Ollama) to generate a unique, AI-crafted protest email for each dispatch.
- Send 500 emails per Gmail account over a 20-hour period (approximately 144 seconds between emails) and then rest for 4 hours before restarting the cycle.

## Contributing

Fork the repo and make it your own. I don't care. Steal it.
