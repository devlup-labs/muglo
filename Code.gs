// Main function used to display the index.html file

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
