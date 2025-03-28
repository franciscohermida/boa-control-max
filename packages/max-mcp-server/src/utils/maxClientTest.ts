import { maxClient } from "./maxClient";

const test = async () => {
  try {
    console.log("Making request to execute MaxScript...");
    const result = await maxClient.executeCode({
      lang: "mxs",
      code: "1+1",
    });
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error.message);
    // Log the full error object for debugging
    console.error("Full error:", error);
  }
};

console.log("Starting test...");
test();
