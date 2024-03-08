const fs = require("fs");
const cheerio = require("cheerio");
const moment = require("moment");
const usedRandomStrings = new Set();

// Function to generate a unique random character string
function generateUniqueRandomString(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;
  while (length--) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Function to analyze the HTML file
function analyzeHTML(filePath, searchWords = []) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Use Cheerio to parse the HTML
      const $ = cheerio.load(data);

      // Object to store processed elements
      const processedElements = {};

      $("*").each((i, element) => {
        const attributes = $(element).attr();
        if (attributes) {
          if (attributes.class) {
            attributes.class.split(" ").forEach((className) => {
              processElementName(
                className,
                "class",
                processedElements,
                searchWords
              );
            });
          }
          if (attributes.id) {
            processElementName(
              attributes.id,
              "id",
              processedElements,
              searchWords
            );
          }
        }
      });

      resolve(processedElements);
    });
  });
}

// Function to process an element name and update the object
function processElementName(elementName, elementType, data, searchWords) {
  if (!data[elementName]) {
    data[elementName] = {
      elementType,
      elementName,
      processed: true,
    };
  }

  // Handle search words
  if (searchWords.length === 0) {
    // console.debug(`No search words provided, marking all elements processed.`);
    // data[elementName].processed = true;
  } else {
    const matchFound = searchWords.some((word) => elementName.includes(word));
    // const matchFound = searchWords.some(word => {
    //     console.debug(`Checking word ${word} match for ${elementName}`);
    //     return elementName.includes(word);
    // });

    if (matchFound) {
      console.debug(`Match found for ${elementType}: ${elementName}`);
      data[elementName].processed = false;
    } else {
      //   console.debug(`No match for ${elementType}: ${elementName}`);
      //   data[elementName].processed = true;
      //   data[elementName].newElementName = "xxxx"; // Set newElementName if not a match
      let randomString;
      randomString = generateUniqueRandomString(8); // Generate 8-character string
      while (usedRandomStrings.has(randomString)); // Ensure uniqueness
      usedRandomStrings.add(randomString);
      data[elementName].newElementName = randomString;
    }
  }
}

// Get file path and optional search words from command line arguments
const filePath = process.argv[2];
const searchWords = process.argv[3] ? process.argv[3].split(",") : []; // Handle optional argument

// Check if file path is provided
if (!filePath) {
  console.error("Please provide the path to the HTML file as an argument.");
  process.exit(1);
}

// Generate timestamp for output file name
const timestamp = moment().format("YYYYMMDD_HHmmss");

// Construct output file name with timestamp
const outputFile = `output_${timestamp}.json`;

// Analyze the HTML file
analyzeHTML(filePath, searchWords)
  .then((data) => {
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`JSON data written to ${outputFile}`);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
