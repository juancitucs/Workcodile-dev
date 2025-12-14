/**
 * Auto-inserts spaces in words longer than maxLength characters
 * to prevent horizontal overflow in UI
 */
export const autoSpaceInsertion = (text: string, maxLength: number = 20): string => {
    if (!text) return text;

    const words = text.split(' ');
    const processedWords = words.map(word => {
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

    return processedWords.join(' ');
};
