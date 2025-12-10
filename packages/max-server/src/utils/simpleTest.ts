async function main() {
  const response = await fetch(
    `http://localhost:8123/api/request/createRequest`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "executeCode",
        data: { lang: "mxs", code: "1+1" },
      }),
    }
  );

  const result = await response.json();
  console.log('createRequest result:', result);
  const executeResponse = await fetch(
    `http://localhost:8123/api/request/executeRequest/${result.requestId}`,
    {
      method: "POST",
    }
  );
  const executeResult = await executeResponse.json();
  console.log('executeRequest result:', executeResult);
}

main().catch(console.error);
