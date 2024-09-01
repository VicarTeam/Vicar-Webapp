import {ZipReader, BlobReader, BlobWriter} from "@zip.js/zip.js";

const DOWNLOAD_URL = "https://github.com/VicarTeam/VicarData/releases/latest/download";

export class DataSync {

  private static _downloadedChecksum: string | null = null;
  private static _data: {[key: string]: string} | null = null;

  public static async sync(force: boolean = false) {
    this._data = {};

    //TODO: Implement this method
    /*if (!await this.isNewerAvailable() && !force) {
      return;
    }

    const zip = await this.downloadBundleZip();
    const zipReader = new ZipReader(new BlobReader(zip));
    const entries = await zipReader.getEntries();
    for (const entry of entries) {
      if (entry.filename.startsWith("dist/bundle/.git")) {
        continue;
      }

      const filename = entry.filename.replace("dist/bundle/", "");
      if (!entry.directory) {
        const blob = await entry.getData!(new BlobWriter());
        const text = await blob.text();
        if (!this._data) {
          this._data = {};
        }
        this._data[filename] = text;
      }
    }

    localStorage.setItem("__data__", JSON.stringify(this._data));
    localStorage.setItem("data__version", await this.retrieveCurrentChecksum());*/
  }

  public static loadFile<T>(fileName: string): T {
    /*if (!this._data) {
      this._data = JSON.parse(localStorage.getItem("__data__") || "{}");
    }

    return JSON.parse(this._data![fileName]);*/
    return {} as T;
  }

  private static async isNewerAvailable() {
    const dataVersion = localStorage.getItem("data__version");
    if (!dataVersion || !localStorage.getItem("__data__")) {
      return true;
    }

    const currentChecksum = await this.retrieveCurrentChecksum();
    return currentChecksum !== dataVersion;
  }

  private static async retrieveCurrentChecksum(): Promise<string> {
    if (this._downloadedChecksum) {
      return this._downloadedChecksum;
    }

    //TODO: Implement this method
    //return this._downloadedChecksum = await invoke<string>("download_data_checksum");
    return '';
  }

  private static async downloadBundleZip(): Promise<Blob> {
    //TODO: Implement this method
    //const base64Data = await invoke<string>("download_data_bundle");
    //return this.base64ToBlob(base64Data, "application/zip");
    return new Blob();
  }

  private static base64ToBlob(base64Data: string, contentType: string) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }
}