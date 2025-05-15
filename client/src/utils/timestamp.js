// Utility functions for handling blockchain timestamps
export const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 0 || timestamp === "0") {
        return "🕒 Stage not reached";
    }

    // Convert to number if it's a string
    const tsNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

    try {
        const date = new Date(tsNum * 1000); // Convert seconds to milliseconds
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid date";
    }
};

export const getCurrentBlockTimestamp = async (web3) => {
    const block = await web3.eth.getBlock('latest');
    return block.timestamp;
};