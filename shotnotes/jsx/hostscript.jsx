if (typeof JSON === 'undefined') { JSON = {}; }
(function () {
  function f(n) { return n < 10 ? '0' + n : n; }
  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (val) {
      var t = typeof val;
      if (t === 'string') return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
      if (t === 'number' || t === 'boolean') return String(val);
      if (val === null) return 'null';
      if (val instanceof Array) {
        var a = [];
        for (var i = 0; i < val.length; i++) a.push(JSON.stringify(val[i]) || 'null');
        return '[' + a.join(',') + ']';
      }
      if (t === 'object') {
        var o = [];
        for (var k in val) {
          if (val.hasOwnProperty(k)) {
            var v = JSON.stringify(val[k]);
            if (v !== undefined) o.push('"' + k + '":' + v);
          }
        }
        return '{' + o.join(',') + '}';
      }
    };
  }
  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text) { return eval('(' + text + ')'); };
  }
})();

function padZero(n) { return (n < 10 ? '0' : '') + n; }

function secondsToTC(seconds, frameRate) {
  if (typeof frameRate !== 'number' || frameRate <= 0) frameRate = 25;
  var s = Math.max(0, seconds);
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = Math.floor(s % 60);
  var fr = Math.floor((s - Math.floor(s)) * frameRate);
  if (fr >= frameRate) fr = frameRate - 1;
  return padZero(h) + ':' + padZero(m) + ':' + padZero(sec) + ':' + padZero(fr);
}

function tcToSeconds(tc, frameRate) {
  if (typeof frameRate !== 'number' || frameRate <= 0) frameRate = 25;
  try {
    var norm = tc.replace(/;/g, ':');
    var parts = norm.split(':');
    if (parts.length !== 4) return 0;
    return parseInt(parts[0], 10) * 3600
         + parseInt(parts[1], 10) * 60
         + parseInt(parts[2], 10)
         + parseInt(parts[3], 10) / frameRate;
  } catch (e) { return 0; }
}

function getActiveCompInfo() {
  try {
    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
      return 'null';
    }
    var comp = app.project.activeItem;
    return JSON.stringify({
      name:      comp.name,
      id:        String(comp.id),
      frameRate: comp.frameRate,
      width:     comp.width,
      height:    comp.height,
      duration:  comp.duration,
      currentTC: secondsToTC(comp.time, comp.frameRate)
    });
  } catch (e) { return 'null'; }
}

function getCurrentTC() {
  try {
    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
      return '00:00:00:00';
    }
    var comp = app.project.activeItem;
    return secondsToTC(comp.time, comp.frameRate);
  } catch (e) { return '00:00:00:00'; }
}

function jumpToTC(tc) {
  try {
    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
      return 'error:no active comp';
    }
    var comp = app.project.activeItem;
    comp.time = tcToSeconds(tc, comp.frameRate);
    return 'ok';
  } catch (e) { return 'error:' + e.message; }
}

function jumpToCompAndTC(compId, tc) {
  try {
    if (!app.project) return 'error:no project';
    var target = null;
    for (var i = 1; i <= app.project.numItems; i++) {
      var item = app.project.item(i);
      if (item instanceof CompItem && String(item.id) === compId) {
        target = item;
        break;
      }
    }
    if (!target) return 'error:comp not found';
    target.openInViewer();
    target.time = tcToSeconds(tc, target.frameRate);
    return 'ok';
  } catch (e) { return 'error:' + e.message; }
}

function addMarkerAtTC(tc, label) {
  try {
    if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
      return 'error:no active comp';
    }
    var comp = app.project.activeItem;
    var seconds = tcToSeconds(tc, comp.frameRate);
    var marker = new MarkerValue(label || '');
    comp.markerProperty.setValueAtTime(seconds, marker);
    return 'ok';
  } catch (e) { return 'error:' + e.message; }
}

function getProjectInfo() {
  try {
    if (!app.project) return 'null';
    var name = app.project.file ? app.project.file.name.replace(/\.[^.]+$/, '') : 'Untitled';
    var path = app.project.file ? app.project.file.parent.fsName : '';
    var frameRate = 25, width = 0, height = 0, compCount = 0;
    for (var i = 1; i <= app.project.numItems; i++) {
      var item = app.project.item(i);
      if (item instanceof CompItem) {
        compCount++;
        if (compCount === 1) {
          frameRate = item.frameRate;
          width     = item.width;
          height    = item.height;
        }
      }
    }
    return JSON.stringify({ name: name, path: path, frameRate: frameRate, width: width, height: height, compCount: compCount });
  } catch (e) { return 'null'; }
}

function isProjectSaved() {
  try { return (app.project && app.project.file) ? 'true' : 'false'; }
  catch (e) { return 'false'; }
}

function getNotesFilePath(projectName) {
  var base = Folder.userData.fsName;
  return base + '/Library/Mobile Documents/com~apple~CloudDocs/innit.productions/shotnotes/' + projectName + '.json';
}

function readNotesFile(projectName) {
  try {
    var path = getNotesFilePath(projectName);
    var file = new File(path);
    if (!file.exists) return 'null';
    file.encoding = 'UTF-8';
    if (!file.open('r')) return 'null';
    var content = file.read();
    file.close();
    return content || 'null';
  } catch (e) { return 'null'; }
}

function writeNotesFile(projectName, jsonString) {
  try {
    var path = getNotesFilePath(projectName);
    var file = new File(path);
    var folder = file.parent;
    if (!folder.exists) { folder.create(); }
    file.encoding = 'UTF-8';
    if (!file.open('w')) return 'error:could not open file for writing';
    file.write(jsonString);
    file.close();
    return 'ok';
  } catch (e) { return 'error:' + e.message; }
}
