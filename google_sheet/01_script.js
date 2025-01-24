function doPost(e) {
  Logger.log("--- doPost ---");

  try {
    // Parse the incoming JSON payload
    var payload = JSON.parse(e.postData.contents);

    var device_id = payload.device_id;
    var readings = payload.readings;

    Logger.log("Device ID: " + device_id);
    Logger.log("Readings: " + JSON.stringify(readings));

    // Save the data to the spreadsheet
    save_data(device_id, readings);

    return ContentService.createTextOutput(
      "Data received and written successfully."
    );
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
    return ContentService.createTextOutput(
      "Error occurred: " + error.message
    );
  }
}

function save_data(device_id, readings) {
  Logger.log("--- save_data ---");
  try {
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/your-sheet-id/edit");
    var dataLoggerSheet = ss.getSheetByName("Datalogger");

    if (!dataLoggerSheet) {
      Logger.log("Sheet 'Datalogger' not found!");
      throw new Error("Sheet 'Datalogger' does not exist.");
    }

    Logger.log("Writing data to sheet...");

    readings.forEach(function (reading) {
      var row = dataLoggerSheet.getLastRow() + 1;
      dataLoggerSheet.getRange("A" + row).setValue(device_id); // Device ID
      dataLoggerSheet.getRange("B" + row).setValue(new Date()); // Timestamp
      dataLoggerSheet.getRange("C" + row).setValue(reading.sensor_id); // Sensor ID
      dataLoggerSheet.getRange("D" + row).setValue(reading.sensor_type); // Sensor Type
      dataLoggerSheet.getRange("E" + row).setValue(reading.value); // Sensor Value

      Logger.log(
        `Row ${row} - Device ID: ${device_id}, Sensor ID: ${reading.sensor_id}, Type: ${reading.sensor_type}, Value: ${reading.value}`
      );
    });
  } catch (error) {
    Logger.log("Error in save_data: " + error.message);
    throw error; // Rethrow error to propagate it back to doPost
  }
  Logger.log("--- save_data end ---");
}
