import glob from 'glob';

export const autoGeneratePages = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const pageGlob = `pages/**/*.svelte`;

    glob(pageGlob, {}, function (err: any, files: string[]) {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
};
