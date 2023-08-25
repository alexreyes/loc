const fs = require('fs')

const rootDir = "/Users/hack/Local"
const allItemsInDir = fs.readdirSync(rootDir)

allItemsInDir.map((item) => { 
  const fullPath = rootDir + "/" + item + "/.git"

  if (isDir(fullPath)) { 
    console.log("VALID DIR: ", item)
  }
});

function isDir(path) {
  try {
      var stat = fs.lstatSync(path);
      return stat.isDirectory();
  } catch (e) {
      // lstatSync throws an error if path doesn't exist
      return false;
  }
}
