let searchIndex = -1; // Global index for tracking the current search result

function extractData() {
    const logData = document.getElementById('logInput').value;
    if (!logData) {
        alert('Please paste the log data into the text area.');
        return;
    }

    // Regex patterns for extracting information
    const patterns = {
        "From": /"vade\.from":\s*\[\s*"([^"]+)"\s*\]/,
        "Sent to": /"vade\.to":\s*\[\s*"([^"]+)"\s*\]/,
        "Sender IP": /"vade\.sender_ip":\s*\[\s*"([^"]+)"\s*\]/,
        "Subject": /"vade\.subject":\s*\[\s*"([^"]+)"\s*\]/,
        "URLs": /"url":\s*"([^"]+)"/g,
        "Vade Status": /"vade\.status":\s*\[\s*"([^"]+)"\s*\]/,
        "Attachments": /"vade\.attachments\.filename":\s*\[\s*([^\]]+)\]/,
        "Attachment Hashes md5": /"vade\.attachments\.hashes\.md5":\s*\[\s*([^\]]+)\]/
    };

    // Object to hold the extracted data
    let extractedData = {
        "From": null,
        "Sent to": null,
        "Sender IP": null,
        "Subject": null,
        "URLs": [],
        "Vade Status": null,
        "Attachments": [],
        "Attachment Hashes md5": []
    };

    // Extract data based on regex patterns
    for (let key in patterns) {
        let match;
        if (key === "Attachments" || key === "Attachment Hashes md5") {
            match = logData.match(patterns[key]);
            if (match && match[1]) {
                // Extract all items from the matched array content
                const items = match[1]
                    .split(',')
                    .map(item => item.replace(/[\[\]"\s]/g, '')); // Clean up quotes and whitespace
                extractedData[key] = items;
            }
        } else if (key === "URLs") {
            while ((match = patterns[key].exec(logData)) !== null) {
                extractedData[key].push(match[1]);
            }
        } else {
            match = logData.match(patterns[key]);
            if (match) {
                extractedData[key] = match[1];
            }
        }
    }

    // Spacing between lines
    let output = [];

    output.push(`From : ${extractedData['From'] || 'None'}`);
    output.push(`Sent to : ${extractedData['Sent to'] || 'None'}`);
    
    if (extractedData['Sender IP']) {
        output.push(`Sender IP : ${extractedData['Sender IP']}`);
        output.push(`https://www.abuseipdb.com/check/${extractedData['Sender IP']}`);
    }
    
    output.push(`Subject : ${extractedData['Subject'] || 'None'}`);
    
    if (extractedData['URLs'].length > 0) {
        output.push("URLs:");
        output.push(extractedData['URLs'].map(url => `- ${url}`).join('\n'));
    } else {
        output.push("URLs: None");
    }
    
    output.push(`Vade Status : ${extractedData['Vade Status'] || 'None'}`);

    // Attachments
    if (extractedData['Attachments'].length > 0) {
        output.push("Attachments:");
        output.push(extractedData['Attachments'].map(filename => `- ${filename}`).join('\n'));
    } else {
        output.push("Attachments: None");
    }

    // Attachment Hashes md5
    if (extractedData['Attachment Hashes md5'].length > 0) {
        output.push("Attachments Hashes md5:");
        output.push(extractedData['Attachment Hashes md5'].map(hash => `- ${hash}`).join('\n'));
    } else {
        output.push("Attachments Hashes md5: None");
    }

    // Display the parsed data in the output box
    document.getElementById('parsedOutput').value = output.join('\n\n'); // Add newline to separate sections
}

function copyToClipboard() {
    // Get the parsed data from the output textarea
    const parsedOutput = document.getElementById('parsedOutput');

    // Select the text in the parsed output textarea
    parsedOutput.select();
    parsedOutput.setSelectionRange(0, 99999); 

    // Copy text
    document.execCommand("copy");

    // Alert that the text has been copied
    alert("Copied to clipboard!");
}

function searchLog() {
    const searchText = document.getElementById('searchInput').value.trim();
    const logTextarea = document.getElementById('logInput');
    const logText = logTextarea.value;

    // Reset previous search results
    document.getElementById('noMatch').style.display = 'none';
    logTextarea.focus();

    if (searchText === '') {
        document.getElementById('noMatch').style.display = 'none';
        return;
    }

    // Find all occurrences of the search 
    const matches = [];
    let match;
    const regex = new RegExp(searchText, 'gi');
    while ((match = regex.exec(logText)) !== null) {
        matches.push(match.index);
    }

    if (matches.length === 0) {
        document.getElementById('noMatch').style.display = 'block';
        searchIndex = -1; // Reset index
        return;
    }

    // Move to the next match
    searchIndex = (searchIndex + 1) % matches.length;
    const position = matches[searchIndex];
    
    // Highlight the search text in the log input area
    logTextarea.setSelectionRange(position, position + searchText.length);
    logTextarea.focus(); 
}
