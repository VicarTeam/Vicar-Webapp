import axios from "axios";

const DOWNLOAD_URL = "https://github.com/VicarTeam/VicarData/releases/latest/download";

export class DataSync {

  private static _downloadedChecksum: string | null = null;

  public static async sync() {
    if (!await this.isNewerAvailable()) {
      return;
    }
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

    const response = await axios.get(`${DOWNLOAD_URL}/checksum.sha256`);
    return this._downloadedChecksum = response.data;
  }

  private static async downloadBundleZip(): Promise<Blob> {
    const response = await axios.get(`${DOWNLOAD_URL}/bundle.zip`, { responseType: "blob" });
    return response.data;
  }
}