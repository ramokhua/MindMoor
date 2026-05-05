export async function sendMessage(message) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return response.json();
}
