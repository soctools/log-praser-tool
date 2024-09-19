let searchIndex = -1; // Global index for tracking the current search result

// Function to extract data from the input log based on specific patterns
function extractData() {
    const logData = document.getElementById('logInput').value; // Get log data from the text area
    if (!logData) { // Check if log data is present
        alert('Please put some data in the box'); // Alert if no data is provided
        return;
    }

    // Regex patterns for extracting different fields from the logs
    const patterns = {
        "HTTP Method": /"records\.properties\.httpMethod":\s*\[\s*"([^"]+)"\s*\]/,
        "HTTP Status": /"records\.properties\.httpStatus":\s*\[\s*"([^"]+)"\s*\]/,
        "Request URI": /"records\.properties\.originalRequestUriWithArgs":\s*\[\s*"([^"]+)"\s*\]/,
        "Full link": /"records\.properties\.originalHost":\s*\[\s*"([^"]+)"\s*\]/,
        "Abused IP": /"records\.properties\.clientIP":\s*\[\s*"([^"]+)"\s*\]/,
        "Activity": /"kibana\.alert\.rule\.name":\s*\[\s*"([^"]+)"\s*\]/, // New pattern
        "Other IOCs": null // User input field, no predefined pattern
    };

    // Object to hold extracted data
    let extractedData = {
        "HTTP Method": null,
        "HTTP Status": null,
        "Request URI": null,
        "Full link": null,
        "Abused IP": null,
        "Activity": null, // New field
        "Other IOCs": null
    };

    // Loop through each pattern and extract matching data from the log
    for (let key in patterns) {
        let match;

        // Special handling for Full link (combination of host and URI)
        if (key === "Full link") {
            const hostMatch = logData.match(patterns["Full link"]);
            const uriMatch = logData.match(patterns["Request URI"]);
            if (hostMatch && uriMatch) {
                extractedData["Full link"] = `${hostMatch[1]}${uriMatch[1]}`;
            }
        }
        // Default case for single-match patterns
        else if (patterns[key]) {
            match = logData.match(patterns[key]);
            if (match) {
                extractedData[key] = match[1]; // Store the matched data
            }
        }
    }

    // Create an output string from the extracted data
    let output = [];
    output.push(`HTTP Method : ${extractedData['HTTP Method'] || 'None'}`);
    output.push(`HTTP Status : ${extractedData['HTTP Status'] || 'None'}`);
    output.push(`Request URI : ${extractedData['Request URI'] || 'None'}`);
    output.push(`Full link : ${extractedData['Full link'] || 'None'}`);
    output.push(`Activity : ${extractedData['Activity'] || 'None'}`); // Display new field

    // Add Abused IP and create an AbusedIP URL
    if (extractedData['Abused IP']) {
        output.push(`Abused IP : ${extractedData['Abused IP']}`);
        output.push(`https://www.abuseipdb.com/check/${extractedData['Abused IP']}`);
    }

    // Other IOCs is left empty for user input
    output.push(`Other IOCs : ${extractedData['Other IOCs'] || '<<Add manually if any>>'}`);

    // Display the parsed output
    document.getElementById('parsedOutput').value = output.join('\n\n');
}

// Function to search the log text area for the search term and highlight it
function searchLog() {
    const searchText = document.getElementById('searchInput').value.trim(); // Get the search term
    const logTextarea = document.getElementById('logInput'); // Get the log input text area
    const logText = logTextarea.value; // Get the text inside the log input

    document.getElementById('noMatch').style.display = 'none'; // Hide the 'No match' message initially
    logTextarea.focus(); // Focus on the log text area

    // If the search term is empty, just exit
    if (searchText === '') {
        document.getElementById('noMatch').style.display = 'none';
        return;
    }

    // Find all matches of the search term (case-insensitive) in the log text
    const matches = [];
    let match;
    const regex = new RegExp(searchText, 'gi'); // Case-insensitive global regex search
    while ((match = regex.exec(logText)) !== null) {
        matches.push(match.index); // Store the index of each match
    }

    // If no matches found, display the 'No match' message
    if (matches.length === 0) {
        document.getElementById('noMatch').style.display = 'block';
        searchIndex = -1; // Reset search index
        return;
    }

    // Move to the next match in the list of matches
    searchIndex = (searchIndex + 1) % matches.length;
    const position = matches[searchIndex]; // Get the position of the current match

    // Highlight the matched text in the log input
    logTextarea.setSelectionRange(position, position + searchText.length);
    logTextarea.focus(); // Ensure the text area remains focused
}

function copyToClipboard() {
    const outputTextarea = document.getElementById('parsedOutput'); // Get the textarea element
    outputTextarea.select(); // Select the text inside the textarea
    outputTextarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy'); // Copy the selected text to clipboard
        alert('Copied to clipboard!'); // Show confirmation
    } catch (err) {
        alert('Failed to copy!'); // Handle errors
    }
}
