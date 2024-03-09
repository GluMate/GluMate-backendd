// import { createWorker } from "tesseract.js";

// export async function recognizeText(imagePath) {
//   const worker = await createWorker({
//     logger: (message) => console.log(message), // Define logger inline
//   });

//   await worker.load();
//   await worker.loadLanguage("eng");
//   await worker.loadLanguage("fra");
//   await worker.loadLanguage("rus");

//   const { data: { text } } = await worker.recognize(imagePath);

//   await worker.terminate();

//   return text;
// }
