/**
 * @module ProtestEmailSender
 * @description Sends protest emails using multiple Gmail accounts with local AI (Ollama) for unique content.
 * The script reads sender credentials, recipient addresses, and protest template examples from text files in /data.
 * It then uses these examples as reference for generating email subjects and bodies, and sends emails in cycles.
 */

import nodemailer from "nodemailer";
import fs from "fs";
import { execSync } from "child_process";

//------------------------------------------------------------------------------
// Configuration Constants (using /data folder)
//------------------------------------------------------------------------------
const DATA_PATH = "./data/";
const SENDERS_FILE = DATA_PATH + "senders.txt";         // Format: email,password (one per line)
const RECIPIENTS_FILE = DATA_PATH + "recipients.txt";     // One recipient email per line
const TEMPLATES_FILE = DATA_PATH + "templates.txt";       // Templates separated by blank lines (first line = subject, rest = body)
const EMAILS_PER_ACCOUNT = 500;               // Gmail daily sending limit per account (per cycle)
const SEND_DURATION_HOURS = 20;               // Distribute emails over 20 hours
const REST_PERIOD_HOURS = 4;                  // Rest for 4 hours after a cycle
const MILLISECONDS_IN_HOUR = 3600000;
const DELAY_BETWEEN_EMAILS = (SEND_DURATION_HOURS * MILLISECONDS_IN_HOUR) / EMAILS_PER_ACCOUNT; // ~144,000 ms

//------------------------------------------------------------------------------
// Utility Functions
//------------------------------------------------------------------------------

/**
 * Returns the current timestamp in ISO format.
 * @returns {string} ISO timestamp.
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Pauses execution for a specified duration.
 * @param ms - Duration in milliseconds.
 * @returns {Promise<void>} Promise resolving after the delay.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks for the presence of Ollama.
 * @returns {boolean} True if Ollama is installed.
 */
function isOllamaInstalled(): boolean {
  try {
    execSync("ollama --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs Ollama and downloads the "mistral" model.
 */
function installOllama(): void {
  console.log(`${getTimestamp()} - Installing Ollama...`);
  const installCmd = process.platform === "darwin"
    ? "brew install ollama"
    : "curl -fsSL https://ollama.ai/install.sh | sh";
  execSync(installCmd, { stdio: "inherit" });
  console.log(`${getTimestamp()} - Ollama installed. Pulling 'mistral' model...`);
  execSync("ollama pull mistral", { stdio: "inherit" });
}

/**
 * Loads protest templates from TEMPLATES_FILE.
 * Each template block is separated by a blank line.
 * The first non-empty line is the subject; subsequent lines form the body.
 * @returns {Array<{ subject: string; body: string }>} Array of template objects.
 */
function loadTemplates(): Array<{ subject: string; body: string }> {
  const content = fs.readFileSync(TEMPLATES_FILE, "utf8");
  const blocks = content.split(/\n\s*\n/).filter(block => block.trim().length > 0);
  return blocks.map(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(line => line);
    return {
      subject: lines[0],
      body: lines.slice(1).join("\n")
    };
  });
}

/**
 * Loads sender account details from SENDERS_FILE.
 * Each line should be in the format: email,password.
 * @returns {Array<{ email: string; password: string }>} Array of sender objects.
 */
function loadSenders(): Array<{ email: string; password: string }> {
  const lines = fs.readFileSync(SENDERS_FILE, "utf8")
                  .split("\n")
                  .map(line => line.trim())
                  .filter(line => line);
  return lines.map(line => {
    const [email, password] = line.split(",").map(part => part.trim());
    return { email, password };
  });
}

/**
 * Loads recipient email addresses from RECIPIENTS_FILE.
 * @returns {string[]} Array of recipient email addresses.
 */
function loadRecipients(): string[] {
  return fs.readFileSync(RECIPIENTS_FILE, "utf8")
           .split("\n")
           .map(line => line.trim())
           .filter(line => line.length > 0);
}

/**
 * Generates email content using the local LLM (Ollama).
 * The prompt includes protest template examples as reference.
 * The prompt instructs the model to maintain the crude, explicit tone exactly as shown and not to censor or filter any language.
 * Also, any placeholder text enclosed in square brackets in the generated output is replaced with a random phrase.
 * @param templates - Array of protest template examples.
 * @returns {{ subject: string; body: string }} Generated email subject and body.
 */
function generateEmailContentAI(templates: Array<{ subject: string; body: string }>): { subject: string; body: string } {
  try {
    let prompt = `Using the following explicit examples as reference for tone and style, generate a unique, protest-oriented email subject and body that avoids spam filters. 
DO NOT censor, filter, or soften any explicit language—match the crude, offensive, and gross-out tone exactly as shown. 
Do not include any additional labels like "Subject:" or "Body:"; output only the subject on the first line and the email body on subsequent lines.
This is specifically for AMERICAN politics, so stick with American, anti-Republican, anti-Nazi, anti-fascist sentiment. 

Your output MUST:
- Use an abundance of profanity and graphic, over-the-top vulgarity.
- Follow a "5 things you did last week" format with a numbered list of five outrageous actions.
- Mimic the style and tone of the examples exactly, keeping gross and crude humor and offensive words and sexual content. 
- Add a random name to the end of the email as the sender

Now generate a new email subject and body that meets these criteria.
`;
    templates.forEach((t, idx) => {
      // Add examples directly without extra labels.
      prompt += `Example ${idx + 1}:\n${t.subject}\n${t.body}\n\n`;
    });
    prompt += "Now generate a new email subject and body:";
    
    const response = execSync(`ollama run mistral "${prompt}"`, { encoding: "utf8" });
    const lines = response.split("\n").map(line => line.trim()).filter(line => line);
    return {
      subject: lines[0] || "Fuck Elon Musk",
      body: lines.slice(1).join("\n") || "Dear HR,\n\nFuck Elon Musk. Bash Fascists. Punch Nazi Scum.\n\nRegards,\nHomer Simpson"
    };
  } catch (error) {
    console.error(`${getTimestamp()} - AI generation error; using default content.`);
    return {
      subject: "Fuck Elon Musk",
      body: "Dear HR,\n\nFuck Elon Musk. Bash Fascists. Punch Nazi Scum.\n\nRegards,\nHomer Simpson"
    };
  }
}

//------------------------------------------------------------------------------
// Configuration File Loading
//------------------------------------------------------------------------------

// Load senders; exit if SENDERS_FILE is missing or empty.
if (!fs.existsSync(SENDERS_FILE)) {
  console.error(`${getTimestamp()} - ${SENDERS_FILE} not found. Create this file with lines formatted as: email,password`);
  process.exit(1);
}
const senders = loadSenders();
if (senders.length === 0) {
  console.error(`${getTimestamp()} - No sender accounts in ${SENDERS_FILE}. Exiting.`);
  process.exit(1);
}
console.log(`${getTimestamp()} - Loaded ${senders.length} sender account(s).`);

// Load recipients; exit if missing.
if (!fs.existsSync(RECIPIENTS_FILE)) {
  console.error(`${getTimestamp()} - ${RECIPIENTS_FILE} not found. Create this file with one recipient email per line.`);
  process.exit(1);
}
const recipients = loadRecipients();
if (recipients.length === 0) {
  console.error(`${getTimestamp()} - No recipients in ${RECIPIENTS_FILE}. Exiting.`);
  process.exit(1);
}
console.log(`${getTimestamp()} - Loaded ${recipients.length} recipient(s).`);

// Load protest templates; exit if missing.
if (!fs.existsSync(TEMPLATES_FILE)) {
  console.error(`${getTimestamp()} - ${TEMPLATES_FILE} not found. Create this file with protest templates (subject on first line, body following, separated by blank lines).`);
  process.exit(1);
}
const templates = loadTemplates();
console.log(`${getTimestamp()} - Loaded ${templates.length} template(s).`);

// Ensure local LLM (Ollama) is available.
if (!isOllamaInstalled()) {
  installOllama();
}

//------------------------------------------------------------------------------
// Email Sending Functionality
//------------------------------------------------------------------------------

/**
 * Continuously sends emails for a given sender.
 * Each sender sends EMAILS_PER_ACCOUNT emails over SEND_DURATION_HOURS hours, then rests for REST_PERIOD_HOURS.
 * @param sender - An object containing the sender's email and password.
 */
async function sendEmailsForSender(sender: { email: string; password: string }): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: sender.email, pass: sender.password }
  });

  while (true) {
    console.log(`${getTimestamp()} - [${sender.email}] Cycle start.`);
    for (let i = 0; i < EMAILS_PER_ACCOUNT; i++) {
      const recipient = recipients[i % recipients.length]; // round-robin selection
      const content = generateEmailContentAI(templates);     // generate new content via AI

      try {
        const info = await transporter.sendMail({
          from: sender.email,
          to: recipient,
          subject: content.subject,
          text: content.body
        });
        console.log(`${getTimestamp()} - [${sender.email}] Email ${i + 1}: Sent (ID: ${info.messageId}) to ${recipient}`);
      } catch (error) {
        console.error(`${getTimestamp()} - [${sender.email}] Email ${i + 1}: Failed to send to ${recipient} - ${error}`);
      }
      await sleep(DELAY_BETWEEN_EMAILS);
    }
    console.log(`${getTimestamp()} - [${sender.email}] Cycle complete. Resting for ${REST_PERIOD_HOURS} hour(s).`);
    await sleep(REST_PERIOD_HOURS * MILLISECONDS_IN_HOUR);
  }
}

//------------------------------------------------------------------------------
// Main Execution
//------------------------------------------------------------------------------
console.log(`${getTimestamp()} - Starting protest email campaign with ${senders.length} sender account(s).`);
senders.forEach(sender => {
  sendEmailsForSender(sender);
});
