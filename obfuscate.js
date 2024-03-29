const fs = require("fs");
const cheerio = require("cheerio");
const moment = require("moment");
const usedRandomStrings = new Set();
const path = require("path");
let pageTitle = "";

// Function to generate a unique random character string
function generateUniqueRandomString(length) {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const characters = letters + "0123456789";
  let result = "";
  const charactersLength = characters.length;
  const lettersLength = letters.length;

  // First character is always a letter
  result += letters.charAt(Math.floor(Math.random() * lettersLength));

  // Remaining characters can be any character
  while (--length) {
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
      pageTitle = $("title").text();
      console.log(`Page title: ${pageTitle}`);

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

      console.log(processedElements + pageTitle);
      resolve({ processedElements, pageTitle });
    });
  });
}

// Function to process an element name and update the object
function processElementName(elementName, elementType, data, searchWords) {
  let randomString;
  do {
    randomString = generateUniqueRandomString(8); // Generate 8-character string
  } while (usedRandomStrings.has(randomString)); // Ensure uniqueness

  // Split the element name on the hyphen
  const [prefix, suffix] = elementName.split('-');

  // Handle search words
  if (searchWords.length === 0 || !searchWords.includes(prefix)) {
    // If there's no search word or the prefix doesn't match a search word,
    // replace the prefix with the random string
    const newElementName = suffix ? `${randomString}-${suffix}` : randomString;
    data[elementName] = {
      elementType,
      elementName,
      newElementName,
      processed: true,
    };
  } else {
    // If the prefix matches a search word, keep the original name
    data[elementName] = {
      elementType,
      elementName,
      newElementName: elementName,
      processed: false,
    };
  }
}

function replaceInFiles(processedElements, folderPath, oPath) {
  const extensions = [".html", ".css", ".js"];
  fs.readdirSync(folderPath).forEach((fileName) => {
    const filePath = `${folderPath}/${fileName}`;
    const fileExtension = path.extname(filePath).toLowerCase();
    if (extensions.includes(fileExtension)) {
      let fileContent;
      try {
        fileContent = fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        console.error(`Error reading file: ${filePath}`, err);
      }

      let replacedContent = fileContent; // Store the replaced content

      if (fileExtension === ".html") {
        const $ = cheerio.load(fileContent);
        // Loop through processed elements
        for (const elementName in processedElements) {
          const newElementName = processedElements[elementName].newElementName;

          // Select elements by class
          $(`[class*="${elementName}"]`).attr("class", (i, currentClass) => {
            return currentClass
              .split(" ")
              .map((className) => {
                return className === elementName ? newElementName : className;
              })
              .join(" ");
          });

          // Replace ID attribute
          $(`#${elementName}`).attr("id", newElementName);
        }

        replacedContent = $.html(); // Get the modified HTML content from Cheerio
      } else {
        // Use a loop to iterate through processed elements
        for (const elementName in processedElements) {
          const newElementName = processedElements[elementName].newElementName;
          if (newElementName) { // Check if newElementName exists before replacing
            const regex = new RegExp(
              `(?<=^|[^a-zA-Z0-9-_])${elementName}(?=$|[^a-zA-Z0-9-_])`,
              "gi"
            );

            replacedContent = replacedContent.replace(regex, (match) =>
              match === elementName || match.includes(elementName)
                ? newElementName
                : match
            );
          }
        }
      }

      console.log(`Outcome folder: ${oPath}`);
      // Create the output directory if it doesn't exist
      fs.mkdirSync(oPath, { recursive: true }); // Create recursively

      // Save the modified content to a new file in the "outcome" folder
      const outcomeFilePath = path.join(oPath, fileName);
      try {
        fs.writeFileSync(outcomeFilePath, replacedContent, "utf-8");
      } catch (err) {
        console.error(`Error writing file: ${outcomeFilePath}`, err);
      }
    }
  });
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
const outputFile = `vocabulary.json`;

// Analyze the HTML file
analyzeHTML(filePath, searchWords)
  .then(({ processedElements, pageTitle }) => {
    const timestamp = moment().format("YYYYMMDD_HHmm"); // Or a different format without colons
    const outputFileName = `${pageTitle}_${timestamp}`;

    try {
      fs.mkdirSync(outputFileName, { recursive: true });
      console.log("Output folder created successfully");
      fs.writeFileSync(
        path.join(outputFileName, outputFile),
        JSON.stringify(processedElements, null, 2)
      );
      console.log(
        `JSON data written to ${path.join(outputFileName, outputFile)}`
      );
      const folderPath = path.dirname(filePath); // Assuming the files to replace are in the same directory as the analyzed HTML file
      console.log(`Replacing elements in files in folder: ${outputFileName}`);
      replaceInFiles(processedElements, folderPath, outputFileName);
    } catch (err) {
      console.error(err);
    }
  })
  .catch((err) => {
    console.error(
      `Error writing file: ${path.join(outputFileName, outputFile)}`,
      err
    );
  });
