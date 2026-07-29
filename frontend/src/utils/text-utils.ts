/**
 * Auto-inserts spaces in words longer than maxLength characters
 * to prevent horizontal overflow in UI.
 * Preserves @ mentions (format: @"filename") without inserting spaces.
 */
export const autoSpaceInsertion = (text: string, maxLength: number = 20): string => {
    if (!text) return text;

    // Extract all @"..." mentions to preserve them
    const mentions: { placeholder: string; original: string }[] = [];
    let mentionIndex = 0;

    // Replace mentions with placeholders
    const processedText = text.replace(/@"[^"]+"/g, (match) => {
        const placeholder = `__MENTION_${mentionIndex}__`;
        mentions.push({ placeholder, original: match });
        mentionIndex++;
        return placeholder;
    });

    // Now apply space insertion on the text without mentions
    const words = processedText.split(' ');
    const processedWords = words.map(word => {
        // Don't process placeholders
        if (word.includes('__MENTION_')) {
            return word;
        }

        if (word.length <= maxLength) {
            return word;
        }

        // Insert space every maxLength characters
        const chunks: string[] = [];
        for (let i = 0; i < word.length; i += maxLength) {
            chunks.push(word.substring(i, i + maxLength));
        }
        return chunks.join(' ');
    });

    let result = processedWords.join(' ');

    // Restore mentions
    mentions.forEach(({ placeholder, original }) => {
        result = result.replace(placeholder, original);
    });

    return result;
};
