import fs from 'fs-extra';
import Jimp from 'jimp';

const retry = (promise, args, maxRetries = 3, interval = 500) => new Promise((resolve, reject) => {
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


const fileExists = filename => {
    return new Promise((resolve, reject) => {
        fs.exists(filename, (exists) => {
            if (exists) {
                resolve(filename);
            }
            reject();
        })
    })
}


export const waitUntilFileExists = (filePath, timeout) => {
    return retry(fileExists, filePath, Math.round(timeout / 1000));
}

export const resizeImage = (filePath, quality, reductionRatio) => {
    return Jimp.read(filePath)
        .then(file => {
            return file
                .resize(Math.round(file.getWidth() / reductionRatio), Jimp.AUTO)
                .quality(quality)
                .write(filePath);
        })
        .catch(err => {
            throw err;
        });
}
