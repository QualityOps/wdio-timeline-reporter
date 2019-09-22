import fs from 'fs';
import Jimp from 'jimp';
import { parseISO, format } from 'date-fns';

const retry = (promise, args, maxRetries = 3, interval = 500) =>
  new Promise((resolve, reject) => {
    return promise(args)
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          console.log('Retrying failed promise...', maxRetries);
          if (0 === maxRetries) {
            return reject('Maximum retries exceeded');
          }
          retry(promise, args, maxRetries - 1, interval).then(resolve, reject);
        }, interval);
      });
  });

const fileExists = (filename: string) => {
  return new Promise((resolve, reject) => {
    fs.exists(filename, exists => {
      if (exists) {
        resolve(filename);
      }
      reject();
    });
  });
};

const waitUntilFileExists = (filePath: string, timeout: number) => {
  return retry(fileExists, filePath, Math.round(timeout / 1000));
};

const resizeImage = (
  filePath: string,
  quality: number,
  reductionRatio: number
) => {
  return Jimp.read(filePath)
    .then(file => {
      return file
        .resize(Math.round(file.getWidth() / reductionRatio), Jimp.AUTO)
        .quality(quality)
        .writeAsync(filePath);
    })
    .catch(err => {
      throw err;
    });
};

export const waitForFileExistsAndResize = (
  filePath,
  quality,
  reductionRatio
) => {
  return waitUntilFileExists(filePath, 1500)
    .then((file: string) => resizeImage(file, quality, reductionRatio))
    .catch();
};

const isObject = item => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const deepMerge = (target: object, source: object) => {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

export const deepSearch = (searchTerm: string, obj: any, found = []) => {
  Object.keys(obj).forEach(key => {
    if (key === searchTerm) {
      found.push(obj[key]);
      return found;
    }
    if (typeof obj[key] === 'object') {
      deepSearch(searchTerm, obj[key], found);
    }
  });
  return found;
};

export const formatDateString = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM d, yyyy HH:mm:ss');
  } catch (ex) {
    return dateString;
  }
};
