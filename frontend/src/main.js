import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('submitBtn');
  const nodeInput = document.getElementById('nodeInput');
  const errorBox = document.getElementById('errorBox');
  const resultsSection = document.getElementById('resultsSection');
  
  const totalTreesEl = document.getElementById('totalTrees');
  const totalCyclesEl = document.getElementById('totalCycles');
  const largestRootEl = document.getElementById('largestRoot');
  
  const hierarchiesOutput = document.getElementById('hierarchiesOutput');
  const invalidOutput = document.getElementById('invalidOutput');
  const duplicateOutput = document.getElementById('duplicateOutput');
  
  const userIdEl = document.getElementById('userId');
  const emailIdEl = document.getElementById('emailId');
  const rollNoEl = document.getElementById('rollNo');

  // Determine API URL (handle local dev and production on Vercel)
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // Vercel routes /bfhl to the backend, but if local with Vite, the backend might be on a different port unless proxied.
  // We'll use absolute URL if local and different port, else relative for Vercel.
  const API_URL = isLocal && window.location.port !== '3000' ? 'http://localhost:3000/bfhl' : '/bfhl';

  submitBtn.addEventListener('click', async () => {
    let rawInput = nodeInput.value.trim();
    if (!rawInput) {
      showError("Please enter some nodes.");
      return;
    }

    let parsedData;
    try {
      // Try to parse if they pasted JSON array, otherwise parse by comma/newline
      if (rawInput.startsWith('[')) {
        parsedData = JSON.parse(rawInput);
      } else {
        // Handle comma or newline separated strings, removing quotes
        parsedData = rawInput.split(/,|\n/)
          .map(s => s.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
          .filter(s => s.length > 0);
      }
    } catch (e) {
      showError("Invalid input format. Provide comma-separated strings or a JSON array.");
      return;
    }

    await processHierarchy(parsedData);
  });

  async function processHierarchy(data) {
    hideError();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to process request');
      }

      displayResults(result);
    } catch (error) {
      showError(error.message);
      resultsSection.classList.add('hidden');
    } finally {
      setLoading(false);
    }
  }

  function displayResults(data) {
    // Populate Summary
    totalTreesEl.textContent = data.summary.total_trees;
    totalCyclesEl.textContent = data.summary.total_cycles;
    largestRootEl.textContent = data.summary.largest_tree_root || '-';

    // Populate Details (pretty print JSON)
    hierarchiesOutput.textContent = JSON.stringify(data.hierarchies, null, 2);
    invalidOutput.textContent = data.invalid_entries.length > 0 
      ? JSON.stringify(data.invalid_entries, null, 2) 
      : '[] (None)';
    duplicateOutput.textContent = data.duplicate_edges.length > 0 
      ? JSON.stringify(data.duplicate_edges, null, 2) 
      : '[] (None)';

    // Populate Identity
    userIdEl.textContent = data.user_id;
    emailIdEl.textContent = data.email_id;
    rollNoEl.textContent = data.college_roll_number;

    // Show Results
    resultsSection.classList.remove('hidden');
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  function hideError() {
    errorBox.classList.add('hidden');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
    } else {
      submitBtn.textContent = 'Process Hierarchy';
      submitBtn.disabled = false;
    }
  }
});
