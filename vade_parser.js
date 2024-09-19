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
        "From": /"vade\.from":\s*\[\s*"([^"]+)"\s*\]/,
        "Sent to": /"vade\.to":\s*\[\s*"([^"]+)"\s*\]/,
        "Sender IP": /"vade\.sender_ip":\s*\[\s*"([^"]+)"\s*\]/,
        "Subject": /"vade\.subject":\s*\[\s*"([^"]+)"\s*\]/,
        "URLs": /"vade\.urls\.url":\s*\[([^\]]+)\]/g,
        "Vade Status": /"vade\.status":\s*\[\s*"([^"]+)"\s*\]/,
        "Attachments": /"vade\.attachments\.filename":\s*\[\s*([^\]]+)\]/,
        "Attachment Hashes md5": /"vade\.attachments\.hashes\.md5":\s*\[\s*([^\]]+)\]/,
        "Vade Action": /"vade\.action":\s*\[\s*"([^"]+)"\s*\]/,
        "Whitelisted": /"vade\.whitelisted":\s*\[\s*(.*?)\s*\]/
    };

    // Object to hold extracted data
    let extractedData = {
        "From": null,
        "Sent to": null,
        "Sender IP": null,
        "Subject": null,
        "URLs": [],
        "Vade Status": null,
        "Attachments": [],
        "Attachment Hashes md5": [],
        "Vade Action": null,
        "Whitelisted": null
    };

    // Loop through each pattern and extract matching data from the log
    for (let key in patterns) {
        let match;

        // Special handling for attachments and hashes (multiple items in an array)
        if (key === "Attachments" || key === "Attachment Hashes md5") {
            match = logData.match(patterns[key]);
            if (match && match[1]) {
                const items = match[1].split(',').map(item => item.replace(/[\[\]"\s]/g, '')); // Clean up each item
                extractedData[key] = items; // Store cleaned items
            }
        }
        // Special handling for URLs (obfuscated)
        else if (key === "URLs") {
            while ((match = patterns[key].exec(logData)) !== null) {
                const urls = match[1].split(',').map(url => url.replace(/[\[\]"\s]/g, '')).map(obfuscateURL); // Obfuscate URLs
                extractedData[key].push(...urls); // Store obfuscated URLs
            }
        }
        // Default case for single-match patterns
        else {
            match = logData.match(patterns[key]);
            if (match) {
                extractedData[key] = match[1]; // Store the matched data
            }
        }
    }

    // Create an output string from the extracted data
    let output = [];
    output.push(`From : ${extractedData['From'] || 'None'}`);
    output.push(`Sent to : ${extractedData['Sent to'] || 'None'}`);
    
    // Add Sender IP and create an AbusedIP URL
    if (extractedData['Sender IP']) {
        output.push(`Sender IP : ${extractedData['Sender IP']}`);
        output.push(`https://www.abuseipdb.com/check/${extractedData['Sender IP']}`);
    }
    
    output.push(`Subject : ${extractedData['Subject'] || 'None'}`);

    // Add URLs if any were found, else mention 'None'
    if (extractedData['URLs'].length > 0) {
        output.push("URLs:");
        output.push(extractedData['URLs'].map(url => `- ${url}`).join('\n'));
    } else {
        output.push("URLs: None");
    }
    
    // Add Vade status, action, whitelisting, attachments, and hashes
    output.push(`Vade Status : ${extractedData['Vade Status'] || 'None'}`);
    output.push(`Vade Action : ${extractedData['Vade Action'] || 'None'}`);
    output.push(`Whitelisted : ${extractedData['Whitelisted'] || 'None'}`);

    // Attachments and hashes
    if (extractedData['Attachments'].length > 0) {
        output.push("Attachments:");
        output.push(extractedData['Attachments'].map(filename => `- ${filename}`).join('\n'));
    } else {
        output.push("Attachments: None");
    }
    if (extractedData['Attachment Hashes md5'].length > 0) {
        output.push("Attachments Hashes md5:");
        output.push(extractedData['Attachment Hashes md5'].map(hash => `- ${hash}`).join('\n'));
    } else {
        output.push("Attachments Hashes md5: None");
    }

    // Display the parsed output
    document.getElementById('parsedOutput').value = output.join('\n\n');
}

// Function to obfuscate URLs by replacing '.' in the domain with '[.]'
function obfuscateURL(url) {
    return url.replace(/(https?:\/\/[^\/]+)\./, '$1[.]');
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