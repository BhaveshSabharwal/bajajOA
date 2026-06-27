/**
 *Validate input logic for BFHL API
*/

class Validator {
  constructor(data) {
    this.rawData = data || [];
    this.invalidEntries = [];
    this.duplicateEdges = [];
    this.validEdges = [];
  }


  /*Check if a string is a valid node format (X->Y where X and Y are single uppercase letters)*/

  isValidNodeFormat(entry) {
    //Type check
    if (!entry || typeof entry !== "string") return false;

    const trimmed = entry.trim();
    if (!trimmed) return false;

    // Uppercase check
    const pattern = /^[A-Z]->[A-Z]$/;
    if (!pattern.test(trimmed)) return false;

    // Self-loop check (A->A)
    if (trimmed[0] === trimmed[3]) return false;

    return trimmed;
  }

  /*Process and validate all entries*/
  validateEntries() {
    const seenEdges = new Set();

    for (const entry of this.rawData) {
      const validEntry = this.isValidNodeFormat(entry);

      if (!validEntry) {
        this.invalidEntries.push(entry.toString().trim());
        continue;
      }

      if (seenEdges.has(validEntry)) {
        this.duplicateEdges.push(validEntry);
      } else {
        seenEdges.add(validEntry);
        this.validEdges.push(validEntry);
      }
    }

    return {
      invalidEntries: this.invalidEntries,
      duplicateEdges: this.duplicateEdges,
      validEdges: this.validEdges,
    };
  }
}

module.exports = Validator;
