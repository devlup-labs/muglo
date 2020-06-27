function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}


// This function is used to return two array of child folders and child folder's Id , where agrument is Parent Folder's Id

function Folder_Name_and_ID(parentFolder) {

  let foldersArray = [];
  let foldersArrayId = [];
  while (parentFolder.hasNext()) {
    let Folder = parentFolder.next();
    foldersArray.push(Folder.getName());
    foldersArrayId.push(Folder.getId());

  }
  return [foldersArray, foldersArrayId]
}


// This code is used for getting folders and displaying files -----------------------------------------------------
function Checker(parent_folder_id) {

  const parentfiles = DriveApp.getFolderById(parent_folder_id).getFiles();
  const parentfolders = DriveApp.getFolderById(parent_folder_id).getFolders();
  const filesArray = [];

  while (parentfiles.hasNext()) {
    filesArray.push(parentfiles.next().getName());
    break;
  }

  let [foldersArray, foldersArrayID] = Folder_Name_and_ID(parentfolders);

  return [foldersArray, filesArray, foldersArrayID, parent_folder_id]
}



// This code is used for generating Years button --------------------------------------------------------------------

function Yearbtn() {
  const Organised = DriveApp.getFolderById('ID_OF_FOLDER_CONTAINING_ALL_DATA').getFolders();
  let [YearFoldersName, YearFoldersId] = Folder_Name_and_ID(Organised);
  let FolderList = [];
  for (i = 0; i < YearFoldersName.length; i++) {
    let list = {
      name: YearFoldersName[i],
      id: YearFoldersId[i]
    };
    FolderList.push(list);
  };

  let byName = FolderList.slice(0);
  byName.sort(function (a, b) {
    let x = a.name.toLowerCase();
    let y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });

  for (i = 0; i < byName.length; i++) {
    YearFoldersName[i] = byName[i].name;
    YearFoldersId[i] = byName[i].id;
  };

  return [YearFoldersName, YearFoldersId];
}



//yearFolderId
function CardsDisplay(yearFolderId) {
  const Folders = DriveApp.getFolderById(yearFolderId).getFolders();
  let [FoldersName, FoldersId] = Folder_Name_and_ID(Folders);
  return [FoldersName, FoldersId];

}


// used to fetch the website using the embed url in grid view
function Websitefetch(website_to_fetch) {
  var response = UrlFetchApp.fetch(website_to_fetch);
  var content = response.getContentText();
  return content
}


// getting id and name of folder for breadscrumb
function getData(id) {
  var x = DriveApp.getFolderById(id);
  var name = x.getName();
  var id = x.getId();
  return [id, name];
}



var allFolders = [];
function getFolders(id) 
{
  var folders = DriveApp.getFolderById(id).getFolders();
  
  while(folders.hasNext())
  {
    var folder = folders.next();
    var name = folder.getName();
    var folderId = folder.getId();
    var folderPath = findPath(folderId);
    allFolders.push([name, folderId, folderPath]);
    getFolders(folderId);
  }
}

function foldersToSheet()
{
  getFolders("ID_OF_FOLDER_CONTAINING_ALL_DATA");
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_WHERE_FILES_AND_FOLDER_INFO_IS_STORED_FOR_SEARCH");
  var sheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FILES_AND_FOLDERS_INFO");
  sheet.clear();
  sheet.getRange(1, 1).setValue("Name");
  sheet.getRange(1, 2).setValue("ID");
  sheet.getRange(1, 3).setValue("Type");
  sheet.getRange(1, 4).setValue("Path");
  i = 0;
  while(i < allFolders.length)
  {
    sheet.getRange(i+2, 1).setValue(allFolders[i][0]);
    sheet.getRange(i+2, 2).setValue(allFolders[i][1]);
    sheet.getRange(i+2, 3).setValue("Folder");
    sheet.getRange(i+2, 4).setValue(allFolders[i][2]);
    i += 1
  }
}

var allFiles = []
function getFiles()
{
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_WHERE_FILES_AND_FOLDER_INFO_IS_STORED_FOR_SEARCH");
  var sheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FILES_AND_FOLDERS_INFO");
  var folders = sheet.getDataRange().getValues();
  var i = 1;
  while(i<folders.length)
  {
    var files = DriveApp.getFolderById(folders[i][1]).getFiles();
    while(files.hasNext())
    {
      var file = files.next();
      var name = file.getName();
      var fileId = file.getId();
      var filePath = folders[i][3] + "/" + name;
      allFiles.push([name, fileId, filePath]);
    }
    i += 1;
  }
}

function filesToSheet()
{
  getFiles();
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_WHERE_FILES_AND_FOLDER_INFO_IS_STORED_FOR_SEARCH");
  var sheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FILES_AND_FOLDERS_INFO");
  var length = sheet.getLastRow();
  var i = 0;
  while(i < allFiles.length)
  {
    sheet.getRange(length+1, 1).setValue(allFiles[i][0]);
    sheet.getRange(length+1, 2).setValue(allFiles[i][1]);
    sheet.getRange(length+1, 3).setValue("File");
    sheet.getRange(length+1, 4).setValue(allFiles[i][2]);
    length += 1;
    i += 1;
  }
}

var pathline = [];
function getPath(id) {
  var ids = DriveApp.getFileById(id).getParents();
  while (ids.hasNext()) {
    var id = ids.next();
    pathline.push(id.getName());
    if (id != null) {
      getPath(id.getId());
    }
  }
}

function findPath(id) {
  pathline = [];
  getPath(id);
  pathline.pop();
  pathline.pop();
  pathline.reverse();
  pathline.push(DriveApp.getFileById(id).getName())
  var final_path = pathline.join("/");
  return final_path;
}

// returns the search results to javascript file

function searchFiles(query) {
  var result = [];
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_WHERE_FILES_AND_FOLDER_INFO_IS_STORED_FOR_SEARCH");
  var sheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FILES_AND_FOLDERS_INFO");
  var data = sheet.getDataRange().getValues();
  var i = 1;
  while (i < data.length) {
    try
    {
      if (data[i][0].toLowerCase().split(' ').join('').includes(query)) {
        result.push(data[i]);
      }
    }
    catch(error)
    {
      Logger.log(data[i][0]);
    }
    i += 1;
  }
  return result;
}

// getting all folders from spreadsheet to verify that while contributing user inputs folder ID from one f these folders itself

function getAllFolders() {
  var allFolders = [];
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_WHERE_FILES_AND_FOLDER_INFO_IS_STORED_FOR_SEARCH");
  var sheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FILES_AND_FOLDERS_INFO");
  var data = sheet.getDataRange().getValues();
  var i = 1;
  while (i < data.length) {
    if (data[i][2] == "Folder") {
      allFolders.push(data[i][1]);
    }
    i += 1
  }
  return allFolders;
}


// for transferring files from contributed folder to MugLo Drive Folder

function sheetToDrive() {
  var ss = SpreadsheetApp.openById("ID_OF_SPREADSHEET_CONTAINING_RESPONSES_FROM_GOOGLE_FORMS");
  var responseSheet = ss.getSheetByName("NAME_OF_SHEET_CONTAINING_FORM_RESPONSES");
  var responses = responseSheet.getDataRange().getValues();
  var allFoldersInMuglo = getAllFolders();
  var doc = DocumentApp.openById("ID_OF_GOOGLE_DOC_CONTAINING_INDEX_OF_ROW_FROM_WHERE_TO_START");
  var docBody = doc.getBody().editAsText();
  var ind = parseInt(docBody.getText());
  var i = ind;
  while (i < responses.length) {
    if (responses[i][0] != "") {
      try {
        var parentFolderIdB64 = responses[i][4].replace("DONOTEDIT<", "");
        parentFolderIdB64 = parentFolderIdB64.replace(">", "");
        var parentFolderId = b64toString(parentFolderIdB64);
        if (allFoldersInMuglo.includes(parentFolderId)) {
          var folders = DriveApp.getFolderById(parentFolderId).getFoldersByName(responses[i][2]);
          if (folders.hasNext()) {
            var currentFolderId = folders.next().getId();
          }
          else {
            var currentFolderId = DriveApp.getFolderById(parentFolderId).createFolder(responses[i][2]).getId();
          }
          var files = responses[i][3].split(", ");
          var j = 0;
          while (j < files.length) {
            var file = files[j];
            var fileId = file.replace("https://drive.google.com/open?id=", "");
            Logger.log(fileId);
            var fileToMove = DriveApp.getFileById(fileId);
            fileToMove.getParents().next().removeFile(fileToMove);
            DriveApp.getFolderById(currentFolderId).addFile(fileToMove);
            j += 1;
          }
          responseSheet.getRange(i + 1, 1, 1, 5).setBackgroundRGB(28, 233, 21);
          MailApp.sendEmail(responses[i][1], "Contribution to MugLo", "Your files have been successfully uploaded to MugLo. Here is the drive link to them: https://drive.google.com/open?id=" + currentFolderId + "\nThanks for contributing.");
        }
        else {
          responseSheet.getRange(i + 1, 1, 1, 5).setBackgroundRGB(233, 35, 21);
          MailApp.sendEmail(responses[i][1], "Failure in Uploading Files to MugLo", "An error occured while uploading your files! Please try uploading them again.");
        }
      }
      catch (err) {
        responseSheet.getRange(i + 1, 1, 1, 5).setBackgroundRGB(233, 35, 21);
        MailApp.sendEmail(responses[i][1], "Failure in Uploading Files to MugLo", "An error occured while uploading your files! Please try uploading them again.");
      }
    }
    i += 1
  }
  docBody.setText(i);
}

// decoding the b64 id again to normal

function b64toString(code) {
  var decoded = Utilities.base64Decode(code);
  var finalString = Utilities.newBlob(decoded).getDataAsString();
  return finalString;
}
