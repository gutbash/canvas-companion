export const runLLM = async (messages) => {
    const res = await fetch(`/api/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messages }),
    }).then(response => response.json());
    return res;
};