import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

class Writeable {
  constructor(public content: string) {
    this.content = content;
  }

  save(filepath: string) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    return fs.writeFileSync(filepath, this.content);
  }
}

class Template {
  public template: string;

  constructor(public path: string) {
    this.path = path;
    this.template = this.load(this.path);
  }

  load(path: string) {
    return fs.readFileSync(path).toString();
  }

  render(data: { [key: string]: any }) {
    return new Writeable(<string>ejs.render(this.template, data, {}));
  }
}

export class Page extends Template {
  constructor() {
    super(path.join(__dirname, './templates/page.ejs'));
  }
}

export class Entrypoint extends Template {
  constructor() {
    super(path.join(__dirname, './templates/entrypoint.ejs'));
  }
}
