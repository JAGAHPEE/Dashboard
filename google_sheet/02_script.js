function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST data received.");
    }

    Logger.log("Raw POST data: " + e.postData.contents);

    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Validate the required fields
    if (!data.device_id || !data.location || !data.readings) {
      throw new Error("Missing required fields: 'device_id', 'location', or 'readings'.");
    }

    // Extract data
    var device_id = data.device_id;
    var location = data.location;
    var readings = data.readings;

    // Check if location contains latitude and longitude
    if (!location.latitude || !location.longitude) {
      throw new Error("Location must include 'latitude' and 'longitude'.");
    }

    // Write data to the Google Sheet and create a map
    saveDataAndCreateMap(device_id, location, readings);

    return ContentService.createTextOutput("Data successfully written to the sheet.");
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

function saveDataAndCreateMap(device_id, location, readings) {
  Logger.log("--- saveDataAndCreateMap ---");
  try {
    // Open the Google Sheet
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit");
    var sheet = ss.getSheetByName("SensorData");

    if (!sheet) {
      // Create the sheet if it doesn't exist
      sheet = ss.insertSheet("SensorData");
    }

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Device ID", "Latitude", "Longitude", "Sensor ID", "Sensor Type", "Value", "Timestamp"]);
    }

    // Write the readings data into the sheet
    readings.forEach((reading) => {
      sheet.appendRow([
        device_id,                           // Device ID
        location.latitude,                   // Latitude
        location.longitude,                  // Longitude
        reading.sensor_id,                   // Sensor ID
        reading.sensor_type,                 // Sensor Type
        reading.value,                       // Value
        new Date()                           // Timestamp
      ]);
    });

    // Add map
    createMapChart(sheet, location);

    Logger.log("Data successfully written to the sheet and map displayed.");
  } catch (error) {
    Logger.log("Error in saveDataAndCreateMap: " + error.message);
  }
}

function createMapChart(sheet, location) {
  try {
    // Add latitude and longitude to a range for the map chart
    var mapData = [["Latitude", "Longitude"], [location.latitude, location.longitude]];
    sheet.getRange("G1:H2").setValues(mapData);

    // Create a map chart
    var chart = sheet.newChart()
      .setChartType(Charts.ChartType.MAP)
      .addRange(sheet.getRange("G1:H2")) // Data range for the map
      .setOption("mapType", "terrain")   // Map type
      .setPosition(5, 1, 0, 0)           // Set chart position (row, column)
      .build();

    // Insert the map chart
    sheet.insertChart(chart);
    Logger.log("Map chart successfully added.");
  } catch (error) {
    Logger.log("Error in createMapChart: " + error.message);
  }
}
function testMapCreation() {
  try {
    Logger.log("Running testMapCreation...");
    
    // Open the Google Sheet
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/13rAyt0R0FWX1-FMDnREXsar4DXK4frmEwaBKkV_OMes/edit");
    var sheet = ss.getSheetByName("TestMap");

    // If the sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet("TestMap");
    }

    // Clear existing content for testing
    sheet.clear();

    // Example location data
    var location = {
      latitude: 37.7749,  // San Francisco latitude
      longitude: -122.4194 // San Francisco longitude
    };

    // Call createMapChart with valid data
    createMapImage(sheet, location);
    Logger.log("Test map chart creation completed.");
  } catch (error) {
    Logger.log("Error in testMapCreation: " + error.message);
  }
}

function createMapImage(sheet, location) {
  try {
    // Check if location has valid latitude and longitude
    if (!location || !location.latitude || !location.longitude) {
      throw new Error("Invalid location data. 'latitude' and 'longitude' are required.");
    }

    Logger.log("Creating static map image for latitude: " + location.latitude + ", longitude: " + location.longitude);

    // Generate the URL for the static map image from OpenStreetMap
    var mapUrl = "https://staticmap.openstreetmap.de/staticmap.php?center=" + location.latitude + "," + location.longitude +
                 "&zoom=12&size=600x300&markers=" + location.latitude + "," + location.longitude + "&format=png";

    // Fetch the image from OpenStreetMap
    var image = UrlFetchApp.fetch(mapUrl);  // Fetch the map image
    var blob = image.getBlob();
    
    // Insert the map image into the sheet
    sheet.insertImage(blob, 1, 1);  // Insert image at position (row 1, column 1)

    Logger.log("Static map image successfully added.");
  } catch (error) {
    Logger.log("Error in createMapImage: " + error.message);
  }
}

function testStaticMapCreation() {
  try {
    Logger.log("Running testStaticMapCreation...");
    
    // Open the Google Sheet
    var ss = SpreadsheetApp.openById("https://script.google.com/macros/s/AKfycbwyy5pZChVg7ggRPjPxZYv794SuT4oGAy2N-JZOTByHbbmW6gfrkIyyzeiOTneMMbxL/exec");  // Replace with your actual spreadsheet ID
    var sheet = ss.getSheetByName("TestMap");

    // If the sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet("TestMap");
    }

    // Clear existing content for testing
    sheet.clear();

    // Example location data (San Francisco)
    var location = {
      latitude: 37.7749,  // San Francisco latitude
      longitude: -122.4194 // San Francisco longitude
    };

    // Call createMapImage with valid data
    createMapImage(sheet, location);
    Logger.log("Test static map image creation completed.");
  } catch (error) {
    Logger.log("Error in testStaticMapCreation: " + error.message);
  }
}
