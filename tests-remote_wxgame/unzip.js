const fs = wx.getFileSystemManager();


class ZipProcessor {

  cache = {};

  targetPath;


  onLoadStart(host, resource) {

    const zipFilePath = resource.root + resource.url;
    const zipRoot = `${wx.env.USER_DATA_PATH}/tempzip3`
    const localZipFilePath = `${zipRoot}/temp.zip`;
    const targetPath = `${zipRoot}/${resource.name}`;
    this.targetPath = targetPath;
    console.log(targetPath)
    const timer1 = Date.now();
    try {
      remove(zipRoot)
    }
    catch (e) {
      console.log(e)
    }
    return mkdir(zipRoot)
      .then(() => {
        return loadArrayBuffer2(zipFilePath, localZipFilePath)
      })
      .then(() => {
        return unzip(localZipFilePath, targetPath);
      })
      .then(() => {
        this.register(targetPath)
        console.log(Date.now() - timer1)
      })
  }

  onRemoveStart() {

  }

  getData(host, resource, key, subkey) {
    const url = this.targetPath + "/" + this.cache[subkey];
    const data = fs.readFileSync(url, 'utf-8');//todo:cache
    console.log(data)
    return JSON.parse(data);
    // console.log ()
  }

  register(dirname) {
    walk(dirname, (file) => {
      const resourceURL = file.replace(dirname + "/", "");
      const name = nameSelector(resourceURL);
      this.cache[name] = resourceURL;
    })
  }
}

const processor = new ZipProcessor();


function mkdir(dirname) {
  return new Promise((resolve, reject) => {
    fs.access({
      path: dirname,
      success: () => {
        resolve();
      },
      fail() {
        fs.mkdirSync(dirname);
        resolve();
      }
    }
    )
  })
};

function unzip(zipFilePath, targetPath) {
  return new Promise((resolve, reject) => {
    console.log(zipFilePath)
    fs.unzip({
      zipFilePath,
      targetPath,
      success: () => {
        let a = fs.readFileSync("http://usr/tempzip3/1_zip/resource/config/3.json", 'utf-8');
        console.log(a)
        console.log('success')
        resolve();
      },

      fail(e) {
        console.log(e)
        reject(e)
      }
    }

    )
  })
}

function remove(dirname) {
  walk(dirname, (file) => {
    fs.unlinkSync(file)
  })
}



function nameSelector(url) {
  const arr = url.split("/");
  const basename = arr[arr.length - 1];
  return basename.replace(/\./gi, "_");
}


function walk(dirname, callback) {
  const files = fs.readdirSync(dirname)
  for (let f of files) {
    const file = dirname + "/" + f;
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walk(file, callback);
    } else {
      callback(file)
    }
  }
}


function loadArrayBuffer(url, target) {
  console.log(url, "what说")
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      console.log(request.response)
      fs.writeFileSync(target, request.response);
      resolve();
    }
    request.send();
  })

}

function loadArrayBuffer2(url, target) {

  return new Promise((resolve, reject) => {



    wx.downloadFile({
      url: url,
      filePath: target,
      success: () => {
        resolve();
      }


    })
  })

}

RES.processor.map("zip", processor)

