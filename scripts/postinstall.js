const { execSync } = require("child_process");

/**
 * Checks if Ollama is installed.
 * @returns {boolean} True if installed.
 */
function isOllamaInstalled() {
  try {
    execSync("ollama --version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Installs Ollama.
 */
function installOllama() {
  console.log("Installing Ollama...");
  const installCmd =
    process.platform === "darwin"
      ? "brew install ollama"
      : "curl -fsSL https://ollama.ai/install.sh | sh";
  execSync(installCmd, { stdio: "inherit" });
  console.log("Ollama installed.");
}

/**
 * Starts Ollama as a background service on macOS.
 */
function startOllama() {
  if (process.platform === "darwin") {
    console.log("Starting Ollama service via brew...");
    try {
      execSync("brew services start ollama", { stdio: "inherit" });
      console.log("Ollama service started.");
      // Give the service a few seconds to start.
      execSync("sleep 5");
    } catch (error) {
      console.error("Failed to start Ollama service. Please run 'brew services start ollama' manually.");
      process.exit(1);
    }
  } else {
    console.log("Please ensure the Ollama service is running.");
  }
}

if (!isOllamaInstalled()) {
  installOllama();
} else {
  console.log("Ollama is already installed.");
}

startOllama();

try {
  console.log("Pulling 'mistral' model...");
  execSync("ollama pull mistral", { stdio: "inherit" });
  console.log("'mistral' model pulled successfully.");
} catch (error) {
  console.error("Failed to pull 'mistral' model. Ensure that Ollama is running and try again.");
  process.exit(1);
}
