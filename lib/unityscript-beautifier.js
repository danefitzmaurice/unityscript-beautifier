'use babel';

import {
  CompositeDisposable
} from 'atom';
import UnityscriptBeautifierView from './unityscript-beautifier-view';
import Beautifier from './beautifier';

export default {

  beautifier: null,
  unityscriptBeautifierView: null,
  subscriptions: null,
  atomBeautifyDisabled: false,
  beautifyOnSave: false,
  config: {
    beautifyOnSave: {
      "description": "Automatically format document on save.",
      "type": "boolean",
      "default": "true"
    }
  },
  activate(state) {
    this.unityscriptBeautifierView = new UnityscriptBeautifierView(state.unityscriptBeautifierViewState);

    this.beautifier = new Beautifier();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'unityscript-beautifier:beautify': () => this.beautify(),
    }));

    let self = this;
    atom.config.observe("unityscript-beautifier.beautifyOnSave", (value) => self.beautifyOnSave = value);

    self.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      let fileInfo = self.getFileInfo(editor.getPath());
      let isUnityScript = fs.existsSync(editor.getPath() + ".meta");
      if(fileInfo.ext == "js" && isUnityScript) {
        let buffer = editor.getBuffer();
        self.subscriptions.add(buffer.onWillSave(function () {
          if(self.beautifyOnSave) {
            key = atom.config.get("atom-beautify.js.beautify_on_save");
            if(key != undefined && key == true) {
              atom.config.set("atom-beautify.js.beautify_on_save", false);
              self.atomBeautifyDisabled = true;
              console.log("Javascript Beautify Disabled");
            }

            self.beautify(buffer);
          }
        }));
      }
    }));

    self.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(function (editor) {
      if(editor != undefined && self.atomBeautifyDisabled == true) {
        let fileInfo = self.getFileInfo(editor.getPath());
        let isUnityScript = fs.existsSync(editor.getPath() + ".meta");

        if(fileInfo.ext != "js" || !isUnityScript) {
          atom.config.set("atom-beautify.js.beautify_on_save", true);
          self.atomBeautifyDisabled = false;
          console.log("Javascript Beautify Re-Enabled");
        }
      }
    }));
  },
  deactivate() {
    this.subscriptions.dispose();
    this.unityscriptBeautifierView.destroy();
    if(atomBeautifyDisabled = true) {
      atom.config.set("atom-beautify.js.beautify_on_save", true);
      this.tomBeautifyDisabled = false;
      console.log("Javascript Beautify Re-Enabled");
    }
  },
  serialize() {
    return {
      unityscriptBeautifierViewState: this.unityscriptBeautifierView.serialize()
    };
  },
  beautify(buffer) {
    /*console.clear()*/
    buffer = buffer || atom.workspace.getActiveTextEditor()
      .getBuffer();
    if(buffer) {
      let text = buffer.getText();
      // text = self.beautifier.js_beautify(text);

      let options = {
        brace_style: "expand"
      };
      text = this.beautifier.js_beautify(text, options);
      buffer.setText(text);
    }
  },
  getFileInfo(pathString) {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

    function posixSplitPath(filename) {
      return splitPathRe.exec(filename)
        .slice(1);
    }

    var allParts = posixSplitPath(pathString);
    if(!allParts || allParts.length !== 4) {
      throw new TypeError("Invalid path '" + pathString + "'");
    }
    allParts[1] = allParts[1] || '';
    allParts[2] = allParts[2] || '';
    allParts[3] = allParts[3] || '';

    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, -1),
      base: allParts[2],
      ext: allParts[3].substr(1),
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
    };
  },
  toggleBeautifyOnSave() {
    let current = atom.config.get('unityscript-beautifier.js.beautifyOnSave');
    atom.config.set('unityscript-beautifierjs.beautifyOnSave', !current);
  }
};
