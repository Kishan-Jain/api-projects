

export const isSpace = function (string) {
    /**
     * Checks if a string contains spaces.
     * @param {string} string - The input string to check.
     * @returns {boolean} - `true` if the string contains spaces, otherwise `false`.
     */

    // Split the string by spaces
    const result = string.split(" ");
    
    // If the resulting array has more than one element, there are spaces
    if (result.length > 1) {
        return true;
    } else {
        return false;
    }
};
