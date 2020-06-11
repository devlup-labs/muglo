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

// For getting info of all files and folders for updating the search spreadsheet

var allFiles = [];
var allFolders = [];

function FilesInfo(id) {
  var folders = DriveApp.getFolderById(id).getFolders();

  while (folders.hasNext()) {
    var folder = folders.next();
    var folderId = folder.getId();
    var folderName = folder.getName();
    var path = findPath(folderId);
    allFolders.push([folderName, folderId, path]);
    var files = folder.getFiles();
    if (files.hasNext()) {
      while (files.hasNext()) {
        var file = files.next();
        var name = file.getName();
        var id = file.getId();
        var path_for_file = findPath(id);
        allFiles.push([name, id, path_for_file]);
      }
    }
    else {
      FilesInfo(folderId);
    }
  }

}

// for getting path of any file or folder

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
